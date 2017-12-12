var StdChangeTaskUtilsSNC = Class.create();
StdChangeTaskUtilsSNC.prototype = Object.extendsObject(StdChangeUtilsSNC, {

	PROP_MANDATORY_FIELDS: 'mandatory_task_fields',
	PROP_UNMODIFIABLE_FIELDS: 'restricted_task_fields',
	PROP_DEFAULT_VALUES: 'default_task_values',
	PROP_READONLY_FIELDS: 'readonly_task_fields',
	PROP_FIELDS_TO_COPY: 'task_fields_to_copy',
	
	initialize: function(request, responseXML, gc) {
		AbstractAjaxProcessor.prototype.initialize.call(this, request,
			responseXML,
			gc);
		this.log = new GSLog('com.snc.std_change_request.log', 'StdChangeTaskUtilsSNC');
		this.arrayUtil = new ArrayUtil();
		this.jsonUtil = new JSON();
		this.TABLE_LABEL_CHANGE_TASK = new GlideRecord(this.TABLE_NAME_CHANGE_TASK).getLabel();
	},

	ajaxFunction_getPredefinedTemplate: function() {
		var templateGr = new GlideRecordSecure(this.TABLE_NAME_TASK_TEMPLATE);
		var sysId = this.getParameter('sysparm_templateId');

		var resp = {name: "", shortDescription: "", template: ""};
		if (!templateGr.get(sysId))
			return this._toXmlAndSet(resp);
		
		resp.name = templateGr.getValue("name");
		resp.shortDescription = templateGr.getValue("short_description");
		resp.template = templateGr.getValue("template");

		return this.jsonUtil.encode(resp);
	},
	
	getDefaultValues: function() {
		return this._getPropertyValue(this.PROP_DEFAULT_VALUES);
	},

	getMandatoryFields: function() {
		return this._getCsvPropertyValue(this.PROP_MANDATORY_FIELDS);
	},

	getReadOnlyFields: function() {
		return this._getCsvPropertyValue(this.PROP_READONLY_FIELDS);
	},

	getFieldsToCopy: function() {
		return this._getCsvPropertyValue(this.PROP_FIELDS_TO_COPY);
	},

	getFieldsConfig: function() {
		var resp = {};
		this._addDefaultValuesConfig(resp, true);
		this._addMandatoryFieldsConfig(resp);
		this._addUnmodifiableFieldsConfig(resp);
		return resp;
	},
	
	getNextOrderNumber: function(chgTaskTemplateGr) {
		var orderNumber = 100;
		if (!chgTaskTemplateGr)
			return orderNumber;
		
		var proposalId = chgTaskTemplateGr.getValue("std_change_proposal");
		if (!proposalId)
			return orderNumber;
		
		var taskTemplateGr = new GlideAggregate("std_change_proposal_task");
		taskTemplateGr.addAggregate("MAX", "order");
		taskTemplateGr.addQuery("std_change_proposal", proposalId);
		taskTemplateGr.groupBy("std_change_proposal");
		taskTemplateGr.query();
		
		if (taskTemplateGr.next()) {
			var currentMax = taskTemplateGr.getAggregate("MAX", "order");
			if (!isNaN(currentMax))
				orderNumber = 100 + parseInt(currentMax, 10);
		}
		
		return orderNumber;		
	},
	
	isTemplateReadOnly: function() {
		return !gs.hasRole(this.ROLE_CHG_MANAGER);
	},
	
	getTemplateValidationResult: function(chgTaskTemplateGr, displayErrors) {
		var result = {validationPassed: false, errorMsgs: []};
		
		if (!chgTaskTemplateGr || !chgTaskTemplateGr.getUniqueValue()) {
			this.log.logError("validateTemplateValueCompliance: no Standard Change Task template record supplied");
			return result;
		}

		var q = this._parseEncodedQuery(chgTaskTemplateGr.getValue('template'));
		var mandatoryResult = this._checkMandatoryFields(q, this.TABLE_LABEL_CHANGE_TASK, displayErrors);
		var restrictedResult = this._checkRestrictedFields(q, this.TABLE_LABEL_CHANGE_TASK, displayErrors);
		
		result.validationPassed = mandatoryResult.validationPassed && restrictedResult.validationPassed;
		result.errorMsgs = mandatoryResult.errorMsgs.concat(restrictedResult.errorMsgs);

		return result;
	},
	
	validateTemplateValueCompliance: function(chgTaskTemplateGr, displayErrors) {
		if (!chgTaskTemplateGr || !chgTaskTemplateGr.getUniqueValue()) {
			this.log.logError("validateTemplateValueCompliance: no Change Task Template record supplied");
			return false;
		}
		
		// if displayErrors argument is not provided assume true
		if (typeof displayErrors === "undefined")
			displayErrors = true;

		var q = this._parseEncodedQuery(chgTaskTemplateGr.getValue('template'));
		
		var mandatoryResult = this._checkMandatoryFields(q, this.TABLE_LABEL_CHANGE_TASK, displayErrors);
		var restrictedResult = this._checkRestrictedFields(q, this.TABLE_LABEL_CHANGE_TASK, displayErrors);
		
		return mandatoryResult.validationPassed && restrictedResult.validationPassed;
	},
	
	checkFieldsToCopyWithMandatory: function(mandatoryFields, defaultValues, fieldsToCopy) {
		var changeTaskGr = new GlideRecord(this.TABLE_NAME_CHANGE_TASK);
		changeTaskGr.initialize();
		
		/* First check that the combination of defaulted fields and fields to copy
		   covers all the mandatory fields - if it doesn't we can't copy any Change
		   tasks */
		var missingFields = [];
		var fieldName;
		var defaultFields = this._parseEncodedQuery(defaultValues).names;
		for (var i = 0; i < mandatoryFields.length; i++) {
			fieldName = mandatoryFields[i];
			if (!this.arrayUtil.contains(defaultFields, fieldName) &&
			    !this.arrayUtil.contains(fieldsToCopy, fieldName))
				missingFields.push(changeTaskGr[fieldName].getLabel());
		}

		return missingFields;
	},
	
	createTaskTemplatesFromChange: function(proposalGr, changeId) {
		if (!proposalGr || !proposalGr.getUniqueValue())
			return;
		
		var changeGr = new GlideRecord(this.TABLE_NAME_CHANGE);
		if (!changeGr.get(changeId))
			return;
		
		var changeTaskGr = new GlideRecord(this.TABLE_NAME_CHANGE_TASK);
		changeTaskGr.addQuery("change_request", changeGr.getUniqueValue());
		changeTaskGr.orderBy("sys_created_on");
		changeTaskGr.query();
		
		if (!changeTaskGr.hasNext())
			return;
		
		var emptyFieldErrors = [];
		var mandatoryFields = this.getMandatoryFields();
		var readOnlyFields = this.getReadOnlyFields();
		var defaultValues = this.getDefaultValues();
		var fieldsToCopy = this.getFieldsToCopy();
		var defaultFieldsAndVals = this._parseEncodedQuery(defaultValues);
		var count = 0;
		
		/* First check that the combination of defaulted fields and fields to copy
		   covers all the mandatory fields - if it doesn't we can't copy any Change
		   tasks */
		var missingFields = this.checkFieldsToCopyWithMandatory(mandatoryFields, defaultValues, fieldsToCopy);

		if (missingFields.length > 0) {
			var errorMsg = gs.getMessage("Change Task templates could not be created as the following mandatory fields are either not defaulted or not copied from the Change Task:<br/> {0}",
							 			  missingFields.toString());
			return [errorMsg];
		}
			
		var fieldName;
		var template;
		var copyErrors = [];
		while (changeTaskGr.next()) {
			/* First check the Change Task has all the mandatory fields completed
			   if it doesn't we can't add a template for it and will need to show an error */
			var taskNumber = changeTaskGr.getValue("number");
			var taskURL = changeTaskGr.getLink(true);
			var emptyFields = null;
			for (var i = 0; i < mandatoryFields.length; i++) {
				fieldName = mandatoryFields[i];
				var defaultFieldIndex = defaultFieldsAndVals.names.indexOf(fieldName);
				var defaultFieldValue = "";
				if (defaultFieldIndex != -1)
					defaultFieldValue = defaultFieldsAndVals.vals[defaultFieldIndex];
				if (changeTaskGr[fieldName].nil() && defaultFieldValue == "") {
					emptyFields = emptyFields || {number: taskNumber, url: taskURL, fieldNames: []};
					emptyFields.fieldNames.push(changeTaskGr[fieldName].getLabel());
				}
			}
			
			if (emptyFields) {
				copyErrors.push(gs.getMessage(
					"A Change Task Template could not be created from Change Task <a href='{0}'><b>{1}</b></a> as the following mandatory template fields are empty: <b>{2}</b>",
					[emptyFields.url, emptyFields.number, emptyFields.fieldNames.toString()]));
				continue;
			}
			
			/* Now create an object of fieldnames and corresponding values copied from
			   the Change Task as long as the field name is valid and is not empty
			   
			   For any copied field remove it from our set of default values if it also
			   exists in there */
			var copyFieldsAndVals = {names: [], vals: []};
			for (var i = 0; i < fieldsToCopy.length; i++) {
				fieldName = fieldsToCopy[i];
				if (!changeTaskGr.isValidField(fieldName) || changeTaskGr[fieldName].nil())
					continue;
				
				var defaultFieldIndex = defaultFieldsAndVals.names.indexOf(fieldName);
				if (defaultFieldIndex != -1) {
					defaultFieldsAndVals.names.splice(defaultFieldIndex, 1);
					defaultFieldsAndVals.vals.splice(defaultFieldIndex, 1);
				}
				
				copyFieldsAndVals.names.push(fieldName);
				copyFieldsAndVals.vals.push(changeTaskGr.getValue(fieldName));
			}
			
			/* We can now add the default values into the fields to be copied */
			var allFieldsAndVals = {names: [], vals: []};
			allFieldsAndVals.names = copyFieldsAndVals.names.concat(defaultFieldsAndVals.names);
			allFieldsAndVals.vals = copyFieldsAndVals.vals.concat(defaultFieldsAndVals.vals);
						
			// Finally we can create the Change Task Template as part of the standard change
			count++;
			var changeTaskTemplateGr = new GlideRecord(this.TABLE_NAME_RELATED_TASK);
			changeTaskTemplateGr.std_change_proposal = proposalGr.getUniqueValue();
			changeTaskTemplateGr.name = changeTaskGr.short_description.nil() ? "Change Task " + count : changeTaskGr.getValue("short_description");
			changeTaskTemplateGr.short_description = changeTaskGr.getValue("short_description");
			changeTaskTemplateGr.template = this._formQuery(allFieldsAndVals);
			changeTaskTemplateGr.order = count * 100;
			changeTaskTemplateGr.insert();
		}
				
		return copyErrors;
	},
	
	canModifyTemplate: function(stdChgTaskGr) {
		if (!stdChgTaskGr)
			return false;
		
		// if the Standard Change template is being retired we can't modify the task templates
		if (stdChgTaskGr.std_change_proposal.proposal_type == "3")
			return false;
			
		return this.reviewedFieldsAcl(stdChgTaskGr.std_change_proposal.getRefRecord());
	},

	_attrToLabel: function (attr) {
		if (!this._sampleChangeTaskGr) {
			this._sampleChangeTaskGr = new GlideRecord(this.TABLE_NAME_CHANGE_TASK);
			this._sampleChangeTaskGr.initialize();
		}
		
		var label = this._sampleChangeTaskGr[attr].getLabel();
		return {name: attr, label: label};
	},

    type: 'StdChangeTaskUtilsSNC'
});