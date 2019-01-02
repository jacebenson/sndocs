var context = this;
var SchedulePageUtilSNC = Class.create();
SchedulePageUtilSNC.prototype = {

	initialize: function() {
	},

	DEFAULT_SCHEDULE_SYSID: 'schedule',
	DEFAULT_SCHEDULE_DATA_SOURCE: 'CMNScheduleRESTWrapper',

	VIEW_TYPE_CALENDAR: 'calendar',

	FORMAT: {
		DHTMLX: {
			TIME_FORMAT : {
				"%H" : "HH",
				"%h" : "hh",
				"%g:" : /^h:/,
				"%i" : "mm",
				"%s" : "ss",
				"%a" : "a"
			}
		}
	},

	SCHEDULE_TYPE_ROSTER: 'roster',
	/*Tables*/
	TABLE_CMN_SCHEDULE: 'cmn_schedule',
	TABLE_CMN_SCHEDULE_PAGE: 'cmn_schedule_page',

	/*Attributes*/
	ATTR_TYPE: 'type',

	/*Plugins*/
	PLUGIN_ON_CALL_ROTATION: 'com.snc.on_call_rotation',

	/*Functions*/
	getSchedulePageByScheduleId: function (scheduleSysId) {
		if (scheduleSysId) {
			var gr = new GlideRecord(this.TABLE_CMN_SCHEDULE);
			if (gr.get(scheduleSysId)) {
				var scheduleType = gr.getValue(this.ATTR_TYPE);

				var pageGr = new GlideRecord(this.TABLE_CMN_SCHEDULE_PAGE);
				pageGr.addQuery(this.ATTR_TYPE, scheduleType);
				pageGr.query();
				if (pageGr.next())
					return pageGr;
			}
		}
	},

	getSchedulePageById: function(schedulePageSysId) {
		var dataSourceClass;
		if (schedulePageSysId) {
			var schedulePage = {};
			if (schedulePageSysId == this.DEFAULT_SCHEDULE_SYSID) {
				schedulePage.name = gs.getMessage('Schedule');
				schedulePage.sys_id = this.DEFAULT_SCHEDULE_SYSID;
				schedulePage.view_type = this.VIEW_TYPE_CALENDAR;
				schedulePage.client_script = 'window.NOW.schedule.default_client_scripts(sch)';
				dataSourceClass = this.getClassName(schedulePage.sys_id);
				if (!dataSourceClass)
					throw 'DataSource not implemented';
				schedulePage.data_source_class = dataSourceClass;
				schedulePage.permissions = {
					can_create: false,
					can_read: false,
					can_write: false,
					can_delete: false
				};
				return schedulePage;
			}
		}

		return null;
	},

	getObjInstance: function(dataSourceClassName, _context) {
		if (!_context)
			_context = context;
		if (dataSourceClassName && dataSourceClassName.indexOf('.') > -1) {
			var splits = dataSourceClassName.split('.');
			var scope = splits[0];
			var siName = splits[1];
			return new _context[scope][siName] ();
		} else if (dataSourceClassName) {
			return new _context[dataSourceClassName] ();
		}
	},

	getSchedulePageDetails: function(scheduleSysId) {
		var schedulePage = this.getSchedulePageByScheduleId(scheduleSysId);
		var response = {};

		if (!schedulePage) {
			response.redirect_url = '$show_schedule.do';
			response.append_params = true;
		} else {
			if (GlidePluginManager.isActive(this.PLUGIN_ON_CALL_ROTATION) && schedulePage.getValue(this.ATTR_TYPE) == this.SCHEDULE_TYPE_ROSTER && new global.OnCallRotationProcessor().isCalendarSupported()) {
				response.redirect_url = new global.OnCallRotationProcessor().getScheduleUrl(scheduleSysId).getUrl() + '';
				response.append_params = false;
			} else {
				/* This block can be eliminated when $show_schedule can handle schedule pages.
				For example - when sysparm_type is passed as query parameter */
				response.redirect_url = undefined;
				response.append_params = false;
			}
		}
		return response;
	},

	getSchedulePageInfo: function (schedulePageObj) {
		var info = {
			sys_id: schedulePageObj.sys_id,
			name: schedulePageObj.name,
			permissions: schedulePageObj.permissions
		};
		var obj = this.getObjInstance(schedulePageObj.data_source_class);
		obj.setSchedulePageId(schedulePageObj.sys_id);
		var meta = obj.addMetaToPageInfo(schedulePageObj);
		if (meta)
			info.meta = meta;
		return info;
	},

	getSystemFirstDayOfWeek: function() {
		var firstDayOfWeekProperty = parseInt(gs.getProperty('glide.ui.date_format.first_day_of_week', 1), 10);
		var isValid = (typeof firstDayOfWeekProperty === 'number' && (firstDayOfWeekProperty % 1) === 0) &&
		(firstDayOfWeekProperty > 0 && firstDayOfWeekProperty <= 7);
		return isValid ? firstDayOfWeekProperty : 1;
	},

	getUserTimeFormat: function(format) {
		var userTimeFormat = gs.getTimeFormat() + "";
		format = format.toUpperCase();
		for (var timeFormat in this.FORMAT[format].TIME_FORMAT)
			userTimeFormat = userTimeFormat.replace(this.FORMAT[format].TIME_FORMAT[timeFormat], timeFormat);
		return userTimeFormat;
	},

	getClassName: function(schedulePageSysId) {
		var className = '';

		if (schedulePageSysId == this.DEFAULT_SCHEDULE_SYSID)
			className = this.DEFAULT_SCHEDULE_DATA_SOURCE;

		return className;
	},

    type: 'SchedulePageUtilSNC'
};