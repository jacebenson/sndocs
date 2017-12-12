var hr_TemplateUtils = Class.create();
hr_TemplateUtils.prototype = {
    initialize: function() {
		this._appliedTemplates = {};
    },

	/**
	*	applyBefore and applyAfter are intended to be used in conjunction with before and after business rules
	*	This is to prevent overwriting input changes from the user or email/producer/script
	**/

	/* Apply a template to a record only, attempt to prevent overwriting user changes
	* @param templateSysId : sys_id of the template to apply
	* @param record : Optional GlideRecord to apply the template to
	*/
	applyBefore: function(templateSysId, record) {
		// Setup template and record GlideRecords
		var templateGr = new GlideRecord("sn_hr_core_template");
		if (!templateGr.get(templateSysId) || !templateGr.active)
			return;
		if (!record)
			record = new GlideRecord(templateGr.getValue("table"));
		if (record.isValidField("template"))
			record.setValue("template", templateSysId);
		if (record.isValidField("template_invoked"))
			record.setValue("template_invoked", true);

		// Prepare fields to reset
		var templateData = this._getTemplateData(templateSysId);
		var recordData = {};
		for (var key in templateData) {
			// Do not reset booleans, as they always have a value
			var fieldElement = record.getElement(key);
			if (!fieldElement || fieldElement.getED().getInternalType() == "boolean")
				continue;
			if (record.getValue(key))
				recordData[key] = record.getValue(key);
		}

		// Set assigned_to
		var parentField = this._getLinkField(templateGr.getValue("link_element"), record);
		var assignedToValue = this._getAssignedTo(templateGr, record, parentField);
		if (assignedToValue)
			record.setValue("assigned_to", assignedToValue);

		var useAssignmentDate = this._getAssignmentDate(templateGr, record);

		// Set use_assignment_date
		if (useAssignmentDate)  {
			record.setValue("use_assignment_date", useAssignmentDate);

			// Set offset fields
			var offsetFields = this._getOffsetFields(templateGr, record);

			if (offsetFields) {
				record.setValue('date_offset_type', offsetFields.date_offset_type);
				record.setValue('date_offset_units', offsetFields.date_offset_units);
				record.setValue('date_offset_quantity', offsetFields.date_offset_quantity);
			}
		} else {
			// Set due_date
			var dueDate = this._getDueDate(templateGr, record, parentField);
			if (dueDate && record.due_date !== null) 
				record.due_date.setDateNumericValue(dueDate);	
		}

		// Apply template to record
		var template = GlideTemplate.get(templateSysId);
		template.setApplyChildren(false);
		template.apply(record);

		// Reset user input changes
		for (var field in recordData)
			if (record.getValue(field) != recordData[field])
				record.setValue(field, recordData[field]);

		return record;
	},

	/* Apply the extensions of a template for a record (eg. children, siblings, template references)
	* @param templateSysId : sys_id of the template to apply
	* @param record : Optional GlideRecord the template was applied to
	*/
	applyAfter: function(templateSysId, record) {
		var templateGr = new GlideRecord("sn_hr_core_template");
		if (!templateGr.get(templateSysId) || !templateGr.active || !(record instanceof GlideRecord))
			return;
		var recordSysId = record.getUniqueValue();
		this._appliedTemplates[templateSysId] = recordSysId;

		// Adding checklist
		if (templateGr.getValue('template').includes('hr_task_type=checklist'))
			this.applyChecklist(record);

		// Apply children templates
		if (templateGr.getValue("next_child"))
			this._applyChildren(record.getRecordClassName(), recordSysId, templateGr.getValue("next_child"));
	},

	/* Apply a template to a record
	* @param templateSysId : sys_id of the template to apply
	* @param record : Optional GlideRecord to apply the template to
	*/
	apply: function(templateSysId, record) {
		// Setup template and record GlideRecords
		var templateGr = new GlideRecord("sn_hr_core_template");
		if (!templateGr.get(templateSysId) || !templateGr.active)
			return;
		if (!record)
			record = new GlideRecord(templateGr.getValue("table"));
		if (record.isValidField("template"))
			record.setValue("template", templateSysId);
		if (record.isValidField("template_invoked"))
			record.setValue("template_invoked", true);

		// Set assigned to
		var parentField = this._getLinkField(templateGr.getValue("link_element"), record);
		var assignedToValue = this._getAssignedTo(templateGr, record, parentField);
		if (assignedToValue)
			record.setValue("assigned_to", assignedToValue);

		// Set  use_assignment_date
		var useAssignmentDate = this._getAssignmentDate(templateGr, record);

		if (useAssignmentDate) {
			record.setValue("use_assignment_date", useAssignmentDate);

			// Set offset fields
			var offsetFields = this._getOffsetFields(templateGr, record);

			if (offsetFields) {
				record.setValue('date_offset_type', offsetFields.date_offset_type);
				record.setValue('date_offset_units', offsetFields.date_offset_units);
				record.setValue('date_offset_quantity', offsetFields.date_offset_quantity);
			}
		} else {
			// Set due_date
			var dueDate = this._getDueDate(templateGr, record, parentField);
			if (dueDate && record.due_date !== null)
				record.due_date.setDateNumericValue(dueDate);
		}

		// Apply template to record
		var template = GlideTemplate.get(templateSysId);
		template.setApplyChildren(false);
		template.apply(record);

		var recordUpdate = null;
		if (record.isNewRecord())
			recordUpdate = record.insert();
		else
			recordUpdate = record.update();
		//At any point, if we are unable to insert into a parent table, do not try to insert into the descendant tables.
		if (!recordUpdate)
			return;

		var recordSysId = record.getUniqueValue();
		this._appliedTemplates[templateSysId] = recordSysId;
		
		// Adding checklist
		if (templateGr.getValue('template').includes('hr_task_type=checklist'))
			this.applyChecklist(record);

		// Apply children templates
		if (templateGr.getValue("next_child"))
			this._applyChildren(record.getRecordClassName(), recordSysId, templateGr.getValue("next_child"));
	},

	/* Apply the children templates
	* @param parentTable : table name of the parent template created record
	* @param parentSysId : sys_id of the parent template created record
	* @param templateSysId : sys_id of the template to apply
	*/
	_applyChildren: function(parentTable, parentSysId, templateSysId) {
		// Detect looping templates - Key could exist while value is empty string or null
		if (this._appliedTemplates.hasOwnProperty(templateSysId))
			return this._appliedTemplates[templateSysId];

		// Add template sys_id to applied templates now to prevent circular dependencies in templates
		this._appliedTemplates[templateSysId] = null;

		// Setup template and record GlideRecords
		var templateGr = new GlideRecord("sn_hr_core_template");
		if (!templateGr.get(templateSysId))
			return;
		var record = new GlideRecord(templateGr.getValue("table"));

		// If this is the template for the selected HR Service, prevent business rule from reapplying template
		var templateHrServiceId = this._getTemplateProperty(templateSysId, "hr_service");
		if (templateHrServiceId) {
			var serviceGr = new GlideRecord("sn_hr_core_service");
			if (serviceGr.get(templateHrServiceId) && serviceGr.getValue("template") == templateSysId) {
				if (record.isValidField("template_invoked"))
					record.setValue("template_invoked", true);
			}
		}

		// Set parent
		var parentField = this._getLinkField(templateGr.getValue("link_element"), record, parentTable);
		if (parentField)
			record.setValue(parentField, parentSysId);

		// Set assigned to
		var assignedToValue = this._getAssignedTo(templateGr, record, parentField);
		if (assignedToValue)
			record.setValue("assigned_to", assignedToValue);

		// Set use_assignment_date
		var useAssignmentDate = this._getAssignmentDate(templateGr, record);
		
		if (useAssignmentDate) {
			record.setValue("use_assignment_date", useAssignmentDate);
			
			// Set offset fields
			var offsetFields = this._getOffsetFields(templateGr, record);

			if (offsetFields) {
				record.setValue('date_offset_type', offsetFields.date_offset_type);
				record.setValue('date_offset_units', offsetFields.date_offset_units);
				record.setValue('date_offset_quantity', offsetFields.date_offset_quantity);
			}
		} else {
			// Set due_date
			var dueDate = this._getDueDate(templateGr, record, parentField);

			if (dueDate && record.due_date !== null)
				record.due_date.setDateNumericValue(dueDate);
		}
		
		// Apply template to record
		var template = GlideTemplate.get(templateSysId);
		template.setApplyChildren(false);
		template.apply(record);

		// Set template reference
		if (templateGr.getValue("template_reference")) {
			var referenceSysId = this._applyChildren(parentTable, parentSysId, templateGr.getValue("template_reference"));

			var templateReferenceGr = new GlideRecord("sn_hr_core_template");
			templateReferenceGr.get(templateGr.getValue("template_reference"));

			var templateReferenceField = this._getLinkField(templateGr.getValue("template_reference_field"), record, templateReferenceGr.getValue("table"));
			if (templateReferenceField)
				record.setValue(templateReferenceField, referenceSysId);
		}

		var recordSysId = record.insert();
		this._appliedTemplates[templateSysId] = recordSysId;

		// At any point, if we are unable to insert into a parent table, do not try to insert into the descendent tables.
		if (recordSysId) {
			// Adding checklist
			if (templateGr.getValue('template').includes('hr_task_type=checklist'))
				this.applyChecklist(record, templateSysId);
			
			// Apply children templates
			if (templateGr.getValue("next_child"))
				this._applyChildren(record.getRecordClassName(), recordSysId, templateGr.getValue("next_child"));

			// Apply sibling templates
			if (templateGr.getValue("next"))
				this._applyChildren(parentTable, parentSysId, templateGr.getValue("next"));
		}

		return recordSysId;
	},

	_getLinkField: function(linkField, recordGr, referenceTableName) {
		if (recordGr.isValidField(linkField))
			return linkField;

		if (!referenceTableName || !recordGr)
			return null;
		var elements = recordGr.getElements();
		for (var i = 0; i < elements.length; i++)
			if (elements[i].getED().getInternalType() == "reference" && new GlideTableHierarchy(elements[i].getReferenceTable()).getAllExtensions().indexOf(referenceTableName) != -1)
				return elements[i].getName();

		return null;
	},

	_getAssignedTo: function(templateGr, recordGr, parentField) {
		var assignedToField;
		// Prefer 'assign_to' field, but support legacy 'assigned_to_field'
		if (templateGr.getValue("assign_to")) {
			if (!parentField)
				parentField = "parent";
			assignedToField = parentField + "." + templateGr.getValue("assign_to");
		} else if (templateGr.getValue("assigned_to_field"))
			assignedToField = templateGr.getValue("assigned_to_field");
		if (!assignedToField)
			return null;

		// Determine fields to dot walk
		var fields = assignedToField.split(".");
		if (!fields.length || !fields[0])
			return null;

		// Iterate over list of fields to dot walk
		var assignedTo = recordGr[fields[0]];
		if (!assignedTo)
			return null;
		for (var i = 1; i < fields.length; i++) {
			assignedTo = assignedTo[fields[i]];
			if (!assignedTo)
				return null;
		}

		return assignedTo;
	},

	_getDueDate: function(templateGr, recordGr, parentField) {
		var dueDateField;

		if (templateGr.use_assignment_date) 
			return null;

		if (templateGr.getValue("due_date_source")) {
			if (!parentField)
				parentField = "parent";
			dueDateField = parentField + "." + templateGr.getValue("due_date_source");
		}

		if (!dueDateField)
			return null;

		// Determine fields to dot walk
		var fields = dueDateField.split(".");
		if (!fields.length || !fields[0])
			return null;

		// Iterate over list of fields to dot walk
		var dueDate = recordGr[fields[0]];
		if (!dueDate)
			return null;
		for (var i = 1; i < fields.length; i++) {
			dueDate = dueDate[fields[i]];
			if (!dueDate)
				return null;
		}
		// Apply date offsets, if applicable
		var dateOffsetType = templateGr.getValue("date_offset_type");
		var dateOffsetUnits = templateGr.getValue("date_offset_units");
		var dateOffsetQuantity = templateGr.getValue("date_offset_quantity");
		
		var gdt = new GlideDateTime();
		gdt.setDisplayValue(dueDate.getDisplayValue());
		
		if (dateOffsetType == "on")
			return gdt.getNumericValue();

		var offsetSign = 0;
		if (dateOffsetType == "before")
			offsetSign = -1;
		else if (dateOffsetType == "after")
			offsetSign = 1;
		else
			return null;

		var offsetTime = offsetSign * dateOffsetQuantity;
		
		if (dateOffsetUnits == "hours")
			gdt.addSeconds(offsetTime * 3600);
		else if (dateOffsetUnits == "days")
			gdt.addDaysLocalTime(offsetTime);
		else if (dateOffsetUnits == "weeks")
			gdt.addWeeksLocalTime(offsetTime);
		else if (dateOffsetUnits == "months")
			gdt.addMonthsLocalTime(offsetTime);
		return gdt.getNumericValue();
	},

	_getTemplateData: function(templateSysId) {
		var templateData = {};

		var templateGr = new GlideRecord("sn_hr_core_template");
		if (templateGr.get(templateSysId)) {
			var templateFields = templateGr.getValue("template").split("^");
			for (var i = 0; i < templateFields.length; i++) {
				var splitIndex = templateFields[i].indexOf("="); // Determine split to be first "=" to allow additional "="'s in field value
				if (splitIndex > 0) {
					var field = templateFields[i].substring(0, splitIndex);
					var fieldValue = templateFields[i].substring(splitIndex + 1, templateFields[i].length);
					templateData[field] = { 
						value: fieldValue,
						displayValue: this._getTemplatesFieldDisplayValue(field,fieldValue,templateGr)
					};
				}
			}
		}
		return templateData;
	},
	
	_getTemplatesFieldDisplayValue: function(field,value,templateGr) {
		var templateForTable = String(templateGr.table);
		return new hr_CoreUtils().getFieldsDisplayValue(field,value,templateForTable);
	},

	_getTemplateProperty: function(templateSysId, field) {
	    var templateGr = new GlideRecord('sn_hr_core_template');
		if (templateGr.get(templateSysId) && templateGr.getValue("template")) {
			var templateFields = templateGr.getValue("template").split("^");
			for (var i = 0; i < templateFields.length; i++) {
				var splitIndex = templateFields[i].indexOf("="); // Determine split to be first "=" to allow additional "="'s in field value
				if (splitIndex > 0 && templateFields[i].substring(0, splitIndex) == field) // Check if this is desired field
					return templateFields[i].substring(splitIndex + 1, templateFields[i].length); // return field value
			}
		}

		return null;
	},

	/* Return array of active COE table names
	*/
	process: function() {
		var tables = [];
		var inactiveTables = gs.getProperty("sn_hr_core.inactive_tables","").split(",");

		// Add non-inactive sn_hr_core_case tables
		var caseTables = hr.TABLE_CASE_EXTENSIONS;
		for (var i = 0; i < caseTables.length; i++)
			if (inactiveTables.indexOf(caseTables[i]) == -1)
				tables.push(caseTables[i].toString());

		// Add non-inactive sn_hr_core_task tables
		var taskTables = hr.TABLE_TASK_EXTENSIONS;
		for (i = 0; i < taskTables.length; i++)
			if (inactiveTables.indexOf(taskTables[i]) == -1)
				tables.push(taskTables[i].toString());

		return tables;
	},

	/*
	* @parm record: Record to which checklist will be applied.
	* @parm templateId: (optional) sys_id of the HR Template (eg. This is used for records without an hr_service field)
	*
	* Functionality: Applies a checklist to a record based on sn_hr_core_service or sn_hr_core_template. 
	*/
	applyChecklist : function(record, templateId) {
		// Table containing the reference to the checklist record
		var checklistLinkTable = (record.getValue("hr_service")) ? 'sn_hr_core_service' : 'sn_hr_core_template';
		// Field referencing the checklist record
		var checklistLinkField = (record.getValue('hr_service')) ? 'hr_service' : 'template';
		// sys_id of the record that references the checklist record
		var checklistLinkSysId = templateId || record.getValue(checklistLinkField);
		
		var checklistLinkTableGr = new GlideRecord(checklistLinkTable);
		if (checklistLinkTableGr.get(checklistLinkSysId)){
			var cl = new GlideRecord('checklist');
			cl.addQuery('table', checklistLinkTable);
			cl.addQuery('document', checklistLinkSysId);
			cl.query();
			if (cl.next()) {
				// Copy checklist and checklist items to record
				var newCl = new GlideRecord('checklist');
				newCl.setValue('table', record.getTableName());
				newCl.setValue('document', record.getUniqueValue());
				var checkListId = newCl.insert();
				if (gs.nil(checkListId))
					return;
				
				var newClItem = new GlideRecord('checklist_item');
				newClItem.addQuery('checklist', cl.getUniqueValue());
				newClItem.orderBy('order');
				newClItem.query();
				while (newClItem.next()) {
					newClItem.setValue('checklist', checkListId);
					newClItem.insert();
				}
			}
		}
	},
	_getAssignmentDate: function(templateGr, record) {
		
		if (templateGr.table && templateGr.table == 'sn_hr_core_task') 
			return templateGr.use_assignment_date;
		return null;
	},
	_getOffsetFields: function(templateGr, record) {
		if (templateGr.table && templateGr.table == 'sn_hr_core_task') {
				return {
					'date_offset_type': templateGr.date_offset_type, 
					'date_offset_units': templateGr.date_offset_units, 
					'date_offset_quantity': templateGr.date_offset_quantity
				   };
		}
		return null;
	},
	type: 'hr_TemplateUtils'
};