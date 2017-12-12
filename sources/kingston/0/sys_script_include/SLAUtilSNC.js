var SLAUtilSNC = Class.create();
SLAUtilSNC.prototype = {

	TABLE_TASK_SLA: 'task_sla',
	TABLE_CMN_SCHEDULE: 'cmn_schedule',
	ATTR_STAGE: 'stage',
	ATTR_BUSINESS_PERCENTAGE: 'business_percentage',
	ATTR_BUSINESS_DURATION: 'business_duration',
	ATTR_BUSINESS_TIME_LEFT: 'business_time_left',
	ATTR_BUSINESS_PAUSE_DURATION: 'business_pause_duration',
	ATTR_PERCENTAGE: 'percentage',
	ATTR_DURATION: 'duration',
	ATTR_TIME_LEFT: 'time_left',
	ATTR_PAUSE_DURATION: 'pause_duration',
	ATTR_START_TIME: 'start_time',
	ATTR_HAS_BREACHED: 'has_breached',
	ATTR_PLANNED_END_TIME: 'planned_end_time',
	ATTR_COLLECTION: 'collection',
	TABLE_SYS_CHOICE: 'sys_choice',
	FIELD_TYPE_FIELD_NAME: 'field_name',
	FIELD_TYPE_WF: 'workflow',
	ATTR_NAME: 'name',
	ATTR_INACTIVE: 'inactive',
	ATTR_LANGUAGE: 'language',
	ATTR_ELEMENT: 'element',
	ATTR_TASK: 'task',
	DATE_FORMAT_DISPLAY_VALUE_INTERNAL: 'display_value_internal',
	DATE_FORMAT_DISPLAY_VALUE: 'display_value',
	DATE_FORMAT_VALUE: 'value',

	initialize: function() {},

	getSchedule: function(contractSLAGr, taskGr) {
		var scheduleGR = new GlideRecord(this.TABLE_CMN_SCHEDULE);
		var schSource = contractSLAGr.schedule_source + '';
		var tzSource = contractSLAGr.timezone_source + '';
		var taskSLAGr = new GlideRecord(this.TABLE_TASK_SLA);
		taskSLAGr.initialize();
		taskSLAGr.task = taskGr.sys_id;//do not use getUniqueValue() as dummy records created from audit in SLATimeline will have different value.
		taskSLAGr.sla = contractSLAGr.getUniqueValue();
		var scheduleId = SLASchedule.source(schSource, taskSLAGr);
		if (scheduleId)
			scheduleGR.get(scheduleId);
		var tz = SLATimezone.source(tzSource, taskSLAGr);
		if (!tz)
			tz = gs.getSysTimeZone();

		return new GlideSchedule(scheduleGR.sys_id, tz);
	},

	copyGlideRecord: function(gr) {
		if (!gr || !(gr.sys_id || gr.original_sys_id))
			return;
		var sysId = gr.original_sys_id || gr.sys_id;
		var copiedGr = new GlideRecord(gr.getRecordClassName());
		copiedGr.initialize();
		copiedGr.setNewGuidValue(sysId);
		var fields = gr.getFields();
		if (sysId) {
			copiedGr.original_sys_id = sysId;
			copiedGr.sys_id = sysId;
		}
		for (var i = 0; i < fields.size(); i++) {
			copiedGr.setValue(fields.get(i).getName(), gr.getValue(fields.get(i).getName()));
		}
		for (var field in gr.variables) {
			copiedGr.variables[field] = gr.variables[field];
		}
		return copiedGr;
	},
	
	getChangedFields: function(gr) {
		var changedFields = [];
		
		if (!gr || !(gr.sys_id || gr.original_sys_id))
			return changedFields;
		
		var fields = gr.getFields();
		var field;
		for (var i = 0; i < fields.size(); i++) {
			field = fields.get(i);
			if (field.getName() == "variables")
				continue;
			if (field.changes())
				changedFields.push(field);
		}
		
		return changedFields;
	},

	getChangedVariables: function(gr) {
		var changedVariables = [];

		if (!gr || !(gr.sys_id || gr.original_sys_id))
			return changedVariables;
		
		if (!gr.isValidField("variables"))
			return changedVariables;
		
		if (!gr.variables.changes())
			return changedVariables;
		
		for (var variableName in gr.variables) {
			if (gr.variables[variableName].changes())
				changedVariables.push(variableName);
		}
		
		return changedVariables;
	},

	grToJsArr: function(gr, checkReadAccess) {
		var arr = [];

		while (gr.next())
			arr.push(this.grToJsObj(gr, checkReadAccess));

		return arr;
	},

	grToJsObj: function(gr, checkReadAccess) {
		var obj = {};
		obj.sys_id = gr.getUniqueValue();
		if (!checkReadAccess || (checkReadAccess && gr.canRead())) {
			var fields = gr.getFields();
			obj.read_allowed = true;
			for (var i = 0; i < fields.size(); i++) {
				var fieldName = fields.get(i).getName();
				obj[fieldName] = {};
				var fieldAccess = !checkReadAccess || (checkReadAccess && gr.getElement(fieldName).canRead());
				obj[fieldName].label = gr.getElement(fieldName).getLabel();
				if (fieldAccess) {
					obj[fieldName].read_allowed = true;
					obj[fieldName].value = gr.getValue(fieldName);
					if (gr.getRecordClassName() == 'contract_sla' && gr[fieldName].getED().getInternalType() == this.FIELD_TYPE_FIELD_NAME) {
						var collectionName = gr.getValue(this.ATTR_COLLECTION);
						var dependentTableGr = new GlideRecord(collectionName);
						dependentTableGr.initialize();
						obj[fieldName].display_value = dependentTableGr[obj[fieldName].value].getLabel();
					} else if (gr[fieldName].getED().getInternalType() == this.FIELD_TYPE_WF) {
						//Workaround to avoid workflow fields wiping out rest of the values.
						//A PRB is being logged with platform for root cause and fix. Refer PRB748550 work notes
						var tempGr = new GlideRecord(gr.getRecordClassName());
						tempGr.initialize();
						tempGr.setValue(fieldName, gr.getValue(fieldName));
						obj[fieldName].display_value = tempGr.getDisplayValue(fieldName);
					} else
						obj[fieldName].display_value = gr.getDisplayValue(fieldName);

					if (gr[fieldName] != null && gr[fieldName].getGlideObject() && gr[fieldName]
						.getGlideObject().getDisplayValueInternal()) {
						obj[fieldName].display_value_internal = gr[fieldName].getGlideObject().getDisplayValueInternal();
					}
				} else {
					obj[fieldName].read_allowed = false;
					obj[fieldName].value = undefined;
					obj[fieldName].display_value = gs.getMessage('(restricted)');
				}
			}
			if (!obj.variables)
				obj.variables = {};
			if (gr.variables.canRead()) {
				for(var field in gr.variables) {
					obj.variables[field] = {};
					obj.variables[field].read_allowed = true;
					obj.variables[field].value = gr.variables[field];
					obj.variables[field].display_value = gr.variables[field];
				}
			}
			else {
				for(var field in gr.variables) {
					obj.variables[field] = {};
					obj.variables[field].read_allowed = false;
					obj.variables[field].value = undefined;
					obj.variables[field].display_value = gs.getMessage('(restricted)');
				}
			}
		} else {
			obj.read_allowed = false;
			obj.security_check_fail_message = gs.getMessage('Security constraints restrict read access to this {0}', gr.getRecordClassName());
		}
		return obj;
	},

	getFieldColumnMap: function() {
		var gr = new GlideRecord(this.TABLE_TASK_SLA);
		var displayColumns = {};
		displayColumns[this.ATTR_STAGE] = gr.getElement(this.ATTR_STAGE).getLabel();
		displayColumns[this.ATTR_BUSINESS_PERCENTAGE] = gr.getElement(this.ATTR_BUSINESS_PERCENTAGE).getLabel();
		displayColumns[this.ATTR_BUSINESS_DURATION] = gr.getElement(this.ATTR_BUSINESS_DURATION).getLabel();
		displayColumns[this.ATTR_BUSINESS_TIME_LEFT] = gr.getElement(this.ATTR_BUSINESS_TIME_LEFT).getLabel();
		displayColumns[this.ATTR_BUSINESS_PAUSE_DURATION] = gr.getElement(this.ATTR_BUSINESS_PAUSE_DURATION).getLabel();
		displayColumns[this.ATTR_PERCENTAGE] = gr.getElement(this.ATTR_PERCENTAGE).getLabel();
		displayColumns[this.ATTR_DURATION] = gr.getElement(this.ATTR_DURATION).getLabel();
		displayColumns[this.ATTR_TIME_LEFT] = gr.getElement(this.ATTR_TIME_LEFT).getLabel();
		displayColumns[this.ATTR_PAUSE_DURATION] = gr.getElement(this.ATTR_PAUSE_DURATION).getLabel();
		displayColumns[this.ATTR_START_TIME] = gr.getElement(this.ATTR_START_TIME).getLabel();
		displayColumns[this.ATTR_HAS_BREACHED] = gr.getElement(this.ATTR_HAS_BREACHED).getLabel();
		displayColumns[this.ATTR_PLANNED_END_TIME] = gr.getElement(this.ATTR_PLANNED_END_TIME).getLabel();
		return displayColumns;
	},

	isTaskSlaAttached: function(taskSysId) {
		var gr = new GlideRecord(this.TABLE_TASK_SLA);
		gr.addQuery(this.ATTR_TASK, taskSysId);
		gr.setLimit(1);
		gr.query();
		if (gr.hasNext()) {
			return true;
		}
		return false;
	},

	getSlaStagesMap: function() {
		var stages = [];
		var gr = new GlideRecord(this.TABLE_SYS_CHOICE);
		gr.addQuery(this.ATTR_NAME, this.TABLE_TASK_SLA);
		gr.addQuery(this.ATTR_ELEMENT, this.ATTR_STAGE);
		var qc = gr.addNullQuery(this.ATTR_INACTIVE);
		qc.addOrCondition(this.ATTR_INACTIVE, 'false');
		gr.addQuery(this.ATTR_LANGUAGE, gs.getUser().getLanguage());
		gr.query();
		while (gr.next()) {
			var stage = {};
			stage.label = gr.getValue('label');
			stage.value = gr.getValue('value');
			stages.push(stage);
		}
		return stages;
	},

	getRelatedFieldsFromEncodedQuery: function(table, encodedQuery) {
		var queryString = new GlideQueryString(table, encodedQuery);
		queryString.deserialize();
		var relatedFields = [];
		var queryTerms = queryString.getTerms();
		for (var i = 0; i < queryTerms.size(); i++) {
			if (queryTerms.get(i).getTermField() && relatedFields.indexOf(queryTerms.get(i).getTermField() + '') < 0)
				relatedFields.push(queryTerms.get(i).getTermField() + '');
		}
		return relatedFields;
	},

	populateDateInCommonFormatsAndConversions: function(dateStr, format/*value, display_value, display_value_internal*/) {
		if (dateStr && format) {
			var gdt = new GlideDateTime();
			if (format == this.DATE_FORMAT_DISPLAY_VALUE_INTERNAL)
				gdt.setDisplayValueInternal(dateStr);
			else if (format == this.DATE_FORMAT_DISPLAY_VALUE)
				gdt.setDisplayValue(dateStr);
			else if (format == this.DATE_FORMAT_VALUE)
				gdt.setValue(dateStr);
			return {
				value: gdt.getValue(),
				display_value: gdt.getDisplayValue(),
				display_value_internal: gdt.getDisplayValueInternal()
			};
		}
	},

	getGlideStackURL: function(stackName) {
		var stack = gs.getSession().getStack(stackName);
		return {url: stack.back()};
	},

	setGlideStackURL: function(url, stackName) {
		var stack = gs.getSession().getStack(stackName);
		var stackUrl = stack.push(url);
		return {url: stackUrl};
	},

	duplicateLastUrlInGlideStack: function(stackName) {
		var stack = gs.getSession().getStack(stackName);
		var stackUrl = stack.push(stack.top());
		return {url: stackUrl};
	},

	getTopGlideStackURL: function(stackName) {
		var stack = gs.getSession().getStack(stackName);
		return {url: stack.top()};
	},
	
	type: 'SLAUtilSNC'
};