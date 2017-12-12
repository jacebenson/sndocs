var CalendarUtils = Class.create();
CalendarUtils.UTC_DATE_FORMAT = "yyyy-MM-dd";
CalendarUtils.UTC_TIME_FORMAT = "HH:mm:ss";

CalendarUtils.prototype = {

	DATE_FORMAT_DHTMLX : {
		"%Y" : "yyyy",
		"%y" : "yy",
		"%M" : "MMM",
		"%m" : "MM",
		"%d" : "dd"
	},

	TIME_FORMAT_DHTMLX : {
		"%H" : "HH",
		"%h" : "hh",
        "%g:" : /^h:/,
		"%i" : "mm",
		"%s" : "ss",
		"%a" : "a"
	},

	initialize: function() {
		this.log = new GSLog("com.snc.app.calendar.log.level", this.type);
	},

	/**
 	* Get date format from user defined format or system format if not found, but converted
	* to DHTMLX format as per spec:
 	*
	* http://docs.dhtmlx.com/scheduler/settings_format.html
	*
	* Add additional formats to the DATE_FORMAT_DHTMLX property of this object.
	*
 	**/
	getUserDateFormat: function() {
		var userDateFormat = gs.getUser().getDateFormat() + "";

		for (var dateFormat in this.DATE_FORMAT_DHTMLX)
			userDateFormat = userDateFormat.replace(this.DATE_FORMAT_DHTMLX[dateFormat], dateFormat);

		this.log.debug("[getUserDateFormat] userDateFormat: " + userDateFormat);
		return userDateFormat;
	},

	/**
 	* Get time format from user defined format or system format if not found, but converted
	* to DHTMLX format as per spec:
 	*
	* http://docs.dhtmlx.com/scheduler/settings_format.html
	*
	* Add additional formats to the TIME_FORMAT_DHTMLX property of this object.
	*
 	**/
	getUserTimeFormat: function() {
		var userTimeFormat = gs.getUser().getTimeFormat() + "";

		for (var timeFormat in this.TIME_FORMAT_DHTMLX)
			userTimeFormat = userTimeFormat.replace(this.TIME_FORMAT_DHTMLX[timeFormat], timeFormat);

		this.log.debug("[getUserTimeFormat] userTimeFormat: " + userTimeFormat);
		return userTimeFormat;
	},

	type: 'CalendarUtils'
};