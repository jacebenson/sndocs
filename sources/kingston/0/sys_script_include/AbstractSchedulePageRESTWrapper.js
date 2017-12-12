var AbstractSchedulePageRESTWrapper = Class.create();
AbstractSchedulePageRESTWrapper.prototype = {
	initialize: function() {
		this.util = new SchedulePageUtilSNC();
	},

	type: 'AbstractSchedulePageRESTWrapper',

	ATTR_COLLECTION: 'collection',
	FIELD_TYPE_FIELD_NAME: 'field_name',
	FIELD_TYPE_WF: 'workflow',
	FIELD_TYPE_DATE_TIME: 'glide_date_time',
	INTERNAL_DATE_TIME_FORMAT: 'yyyy-MM-dd HH:mm:ss',

	GANTT_EVENT_TYPES: { // These are defined by DHTMLx. Ref: https://docs.dhtmlx.com/gantt/desktop__task_types.html
		TASK: 'task'
	},

	EVENT_ATTR: {
		GROUP: 'event_group',
		CSS_CLASS: 'css_class',
		ALLOW_EVENT_RESIZE: 'allow_event_resize',
		ALLOW_EVENT_MOVE: 'allow_event_move',

		// Below attribute names are dictated by DHTMLx, do not change
		END_DATE: 'end_date',
		START_DATE: 'start_date',
		BG_COLOR: 'color',
		TEXT_COLOR: 'textColor',
		TIMELINE_GROUPING_KEY: 'timelineGroupingKey',
		TXT: 'text'
	},

	EVENT_CSS_CLASSES: {
		DEFAULT: 'default_event',
		SHADED_STRIPED: 'shaded_striped',
		DARK_GREY_BACKGROUND: 'dark_grey_background'
	},

	FORMAT_TYPE: {
		DHTMLX: 'dhtmlx',
		ICAL: 'ical'
	},

	getEvents: function() {
		throw 'Not Implemented';
	},

	updateEvent: function() {
		throw 'Not Implemented';
	},

	getSupportedFormats: function () {
		throw 'Not Implemented';
	},

	getCustomInfo: function (infoType, params) {
		var f = this['restGet'+ infoType];
		if (!f)
			return this.returnApiError('Unknown info type specified');
		return f.call(this, params);
	},

	updateCustomInfo: function (infoType, obj, params) {
		var f = this['restUpdate'+ infoType];
		if (!f)
			return this.returnApiError('Unknown info type specified');
		return f.call(this, obj, params);
	},

	getValidatedGlideDateTime: function (strDateTime) {
		if (strDateTime) {
			var g = new GlideDateTime();
			g.setDisplayValueInternal(strDateTime);
			if (g.isValid())
				return g;
		}
	},

	getGlideDateTimeObj: function (gr, fieldName) {
		if (gr.getValue(fieldName))
			return new GlideDateTime(gr.getValue(fieldName));
		return null;
	},

	glideDateTimeToStr: function (gr, fieldName) {
		var obj = this.getGlideDateTimeObj(gr, fieldName);
		if (obj)
			return obj.getDisplayValueInternal() + '';
		return null;
	},

	processQueryParams: function (params) {
		var requestParams = {};
		if (!params.format)
			params.format = this.FORMAT_TYPE.DHTMLX;
		if (!params.start_date || !params.end_date)
			return this.returnApiError(gs.getMessage('start_date and end_date are required parameters'));

		for (var p in  params) {
			var p1 = p;
			if (p.indexOf('sysparm_') === 0) {
				p1 = p.substring('sysparm_'.length);
			}
			var v = params[p] + '';
			if (p == 'start_date' || p == 'end_date') {
				if (v.indexOf(':') > -1) // Has time
					v = undefined;
				else {
					var time = p == 'start_date' ? '00:00:00' : '23:59:59';
					v = this.getValidatedGlideDateTime(v + ' ' + time);
				}
				if (!v)
					return this.returnApiError(gs.getMessage('{0} date format is invalid. Expected is yyyy-MM-dd', p));
			} else if (p == 'format') {
				var valid = false;
				var supported = this.getSupportedFormats();
				for (var f in supported)
					if (v == supported[f])
						valid = true;
				if (!valid)
					return this.returnApiError(gs.getMessage('Given format type is unknown or not supported {0}', v));
			}
			requestParams[p1] = v;
		}
		if (requestParams.start_date.after(requestParams.end_date))
			return this.returnApiError(gs.getMessage('start_date should be on or before end_date'));
		return requestParams;
	},

	grToJsObj: function(gr, checkReadAccess, checkWriteAccess, fieldList) {
		var obj = {};
		obj.sys_id = gr.getUniqueValue();
		if (!checkReadAccess || (checkReadAccess && gr.canRead())) {
			var elements = gr.getElements();
			obj.read_allowed = true;
			for (var i = 0; i < elements.length; i++) {
				var element = {};
				element = elements[i];
				var fieldName = element.getName();
				if (fieldName == 'sys_tags' || (fieldList.indexOf(fieldName) == -1))
					continue;
				obj[fieldName] = {};
				var fieldReadAccess = !checkReadAccess || (checkReadAccess && element.canRead());
				var fieldWriteAccess = !checkWriteAccess || (checkWriteAccess && element.canWrite());
				obj[fieldName].label = element.getLabel();
				if (fieldReadAccess) {
					obj[fieldName].read_allowed = true;
					obj[fieldName].value = gr.getValue(fieldName);
					if (gr[fieldName].getED().getInternalType() == this.FIELD_TYPE_WF) {
						//Workaround to avoid workflow fields wiping out rest of the values.
						//A PRB is being logged with platform for root cause and fix. Refer PRB748550 work notes
						var tempGr = new GlideRecord(gr.getRecordClassName());
						tempGr.initialize();
						tempGr.setValue(fieldName, gr.getValue(fieldName));
						obj[fieldName].display_value = tempGr.getDisplayValue(fieldName);
					} else
						obj[fieldName].display_value = gr.getDisplayValue(fieldName);
					if (gr[fieldName] != null && gr[fieldName].getED().getInternalType() == this.FIELD_TYPE_DATE_TIME) {
						obj[fieldName].display_value_internal = new GlideDateTime(gr.getValue(fieldName)).getDisplayValueInternal();
					}
				} else {
					obj[fieldName].read_allowed = false;
					obj[fieldName].value = null;
					obj[fieldName].display_value = gs.getMessage('(restricted)');
				}
				if (fieldWriteAccess) {
					obj[fieldName].write_allowed = true;
				} else {
					obj[fieldName].write_allowed = false;
				}
			}
			if (!obj.variables)
				obj.variables = {};
			if(gr.variables) {
				var variablesCanWrite = gr.variables.canWrite();
				if (gr.variables.canRead()) {
					for(var field in gr.variables) {
						obj.variables[field] = {};
						obj.variables[field].read_allowed = true;
						obj.variables[field].write_allowed = variablesCanWrite;
						obj.variables[field].value = gr.variables[field];
						obj.variables[field].display_value = gr.variables[field];
					}
				} else {
					for(var field in gr.variables) {
						obj.variables[field] = {};
						obj.variables[field].read_allowed = false;
						obj.variables[field].write_allowed = variablesCanWrite;
						obj.variables[field].value = null;
						obj.variables[field].display_value = gs.getMessage('(restricted)');
					}
				}
			}
		} else {
			obj.read_allowed = false;
			obj.read_security_check_fail_message = gs.getMessage('Security constraints restrict read access to this {0}', gr.getRecordClassName());
		}
		if (!checkWriteAccess || (checkWriteAccess && gr.canWrite())) {
			obj.write_allowed = true;
		} else {
			obj.write_allowed = false;
			obj.write_security_check_fail_message = gs.getMessage('Security constraints restrict write access to this {0}', gr.getRecordClassName());
		}
		return obj;
	},

	copyGlideRecord: function(gr) {
		if (!gr || !(gr.sys_id))
			return;
		var copiedGr = new GlideRecord(gr.getRecordClassName());
		copiedGr.initialize();
		var elements = gr.getElements();
		var elementName;
		for (var i = 0; i < elements.length; i++) {
			elementName = elements[i].getName();
			if (elementName != 'sys_id' || elementName != 'sys_mod_count' || elementName != 'sys_tags')
				copiedGr.setValue(elementName, gr.getValue(elementName));
		}
		return copiedGr;
	},

	returnApiError: function(message) {
		return {
			apiError: message
		};
	},

	hasApiError: function (o) {
		return o && !!o.apiError;
	},

	returnApiSecurityError: function(message) {
		return {
			apiError: message,
			errorType: 'security'
		};
	},

	setSchedulePageId: function (schedulePageSysid) {
		this._schedulePageSysid = schedulePageSysid;
	},

	getSchedulePageId: function () {
		return this._schedulePageSysid;
	},

	getParamVal: function (p, params, defaultValue) {
		if (typeof defaultValue == 'undefined')
		  defaultValue = null;
		if (!params)
		  return defaultValue;
		var val = params[p];
		if (!val || val.length === 0)
		  return defaultValue;
		return val[0];
	},

	getBooleanFromGrVal: function(val) {
		return val == '1';
	},

	addMetaToPageInfo: function (schedulePageObj) {
		return null;
	}
};