var InteractiveAnalysisUtil = Class.create();
InteractiveAnalysisUtil.prototype = {
	IA_PREFERENCES: "sys_ia_preferences",
	USER: "user",
	CONDITION: "condition",
	TABLE: "table",
	NAME: "name",
	DEFAULT_VALUE: "default_value",
	VALUE: "value",
	initialize: function() {
	},
	mergeObject: function(savedValue, value) {
		if(!savedValue)
			return value;
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				savedValue[key] = value[key];
			}
		}
		return savedValue;
	},
	saveDefaultValues: function(tableName, params, value, response) {
		var preferenceGr = new GlideRecordSecure(this.IA_PREFERENCES);
		var sysparmListView = "";
		if(params.sysparm_list_view)
			sysparmListView = params.sysparm_list_view[0];
		
		preferenceGr.addQuery(this.USER, gs.getUserID());
		preferenceGr.addQuery(this.TABLE, tableName);
		preferenceGr.addQuery(this.NAME, this.DEFAULT_VALUE + "-" + sysparmListView);
		preferenceGr.query();
		if(preferenceGr.next()) {
			var savedValue = global.JSON.parse(preferenceGr.getValue(this.VALUE));
			value = this.mergeObject(savedValue, value);
			preferenceGr.setValue(this.VALUE, global.JSON.stringify(value));
			preferenceGr.update();
			value = global.JSON.parse(preferenceGr.getValue(this.VALUE));
		} else {
			var newPreferenceGr = new GlideRecordSecure(this.IA_PREFERENCES);
			newPreferenceGr.initialize();
			newPreferenceGr.setValue(this.USER, gs.getUserID());
			newPreferenceGr.setValue(this.TABLE, tableName);
			newPreferenceGr.setValue(this.NAME, this.DEFAULT_VALUE + "-" + sysparmListView);
			newPreferenceGr.setValue(this.VALUE, global.JSON.stringify(value));
			newPreferenceGr.insert();
			response.setStatus(201);
			value = global.JSON.parse(newPreferenceGr.getValue(this.VALUE));
		}
		return this.parseSavedValues(value);
	},
	deleteSavedValue: function(tableName, params, response) {
		var preferenceGr = new GlideRecordSecure(this.IA_PREFERENCES);
		var sysparmListView = "";
		if(params.sysparm_list_view)
			sysparmListView = params.sysparm_list_view[0];
		preferenceGr.addQuery(this.USER, gs.getUserID());
		preferenceGr.addQuery(this.TABLE, tableName);
		preferenceGr.addQuery(this.NAME, this.DEFAULT_VALUE + "-" + sysparmListView);
		preferenceGr.query();
		if(preferenceGr.next())
			preferenceGr.deleteRecord();
		else {
			var res = {
				status: gs.getMessage("failure"),
				error: {
					message: gs.getMessage("No preference saved with these values."),
					table_name: tableName,
					sysparm_list_view: params.sysparm_list_view[0]
				}
			};
			response.setStatus(204);
			response.setContentType('application/json');
			response.getStreamWriter().writeString(global.JSON.stringify(res));
		}
		
	},
	getQueryParts: function(filters) {
		var self = this;
		var IFilterUtils = new InteractiveFilterDefaults();
		for (var key in filters) {
			if (filters.hasOwnProperty(key)) {
				if(filters[key].filter instanceof Array)
					filters[key].queryParts = filters[key].filter.map(IFilterUtils.getQueryPart);
				else {
					var filterObj = filters[key].filter;
					var queryParts = {};
						for (var keyQP in filterObj) {
							if (filterObj.hasOwnProperty(keyQP)) {
								queryParts[keyQP] = filterObj[keyQP].map(IFilterUtils.getQueryPart);
							}
						}
						filters[key].queryParts = queryParts;
					}
				}
			}
			return filters;
		},
		parseSavedValues: function(savedValue) {
			var interactiveFilterUtils = new SNC.InteractiveFilterUtils();
			if(savedValue.filters)
				savedValue.filters = this.getQueryParts(savedValue.filters);
			if(savedValue["stack_by_columns"])
				savedValue["stack_by_columns"] = global.JSON.parse(interactiveFilterUtils.parseColumns(global.JSON.stringify(savedValue["stack_by_columns"])));
			if(savedValue["group_by_columns"])
				savedValue["group_by_columns"] = global.JSON.parse(interactiveFilterUtils.parseColumns(global.JSON.stringify(savedValue["group_by_columns"])));
			return savedValue;
		},
		getDefaultValues: function(tableName, params, response) {
			var preferenceGr = new GlideRecordSecure(this.IA_PREFERENCES);
			var sysparmListView = "";
			if(params.sysparm_list_view)
				sysparmListView = params.sysparm_list_view[0];
			preferenceGr.addQuery(this.USER, gs.getUserID());
			preferenceGr.addQuery(this.TABLE, tableName);
			preferenceGr.addQuery(this.NAME, this.DEFAULT_VALUE + "-" + sysparmListView);
			preferenceGr.query();
			if(preferenceGr.next()) {
				var savedValue = global.JSON.parse(preferenceGr.getValue(this.VALUE));
				return this.parseSavedValues(savedValue);
			} else {
				var res = {
					status: gs.getMessage("failure"),
					error: {
						message: gs.getMessage("No preference saved with these values."),
						table_name: tableName,
						sysparm_list_view: params.sysparm_list_view[0]
					}
				};
				response.setStatus(404);
				response.setContentType('application/json');
				response.getStreamWriter().writeString(global.JSON.stringify(res));
			}
		},
		restErrorHandler: function (e, response) {
			if (!e.error_code)
				throw e;
			var res = {
				status: gs.getMessage("failure"),
				error: {
					message: e.message,
					error_code: e.error_code,
					is_user_message: e.is_user_message
				}
			};
			if (e.status)
				response.setStatus(e.status);
			else
				response.setStatus(400);
			response.setContentType('application/json');
			response.getStreamWriter().writeString(global.JSON.stringify(res));
			return;
		},
		type: 'InteractiveAnalysisUtil'
	};