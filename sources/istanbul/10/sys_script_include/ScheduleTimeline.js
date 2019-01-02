var ScheduleTimeline = Class.create();
ScheduleTimeline.prototype = {
	initialize: function() {
		this.log = new GSLog("com.snc.schedule_timeline.log.level", this.type);
	},
	
	getProperties: function(cmnTimelinePageSysId) {
		var properties = {
			"showGridLines" : false,
			"showSummaryPane" : false,
			"showLeftPane" : false,
			"showSpanText" : false,
			"auto_refresh" : "0"
		};
		
		cmnTimelinePageSysId = SNC.GlideHTMLSanitizer.sanitize(cmnTimelinePageSysId);
		
		var pattern = /[0-9A-F]{32}/i;
		if (!pattern.test(cmnTimelinePageSysId))
			return properties;
		
		this.log.debug("[getProperties] cmnTimelinePageSysId: " + cmnTimelinePageSysId);
		
		var gr = new GlideRecord("cmn_timeline_page");
		gr.addQuery("sys_id", cmnTimelinePageSysId);
		gr.query();
		if (gr.next()) {
			properties.showGridLines = this._getBoolean(gr.getValue("show_grid_lines"));
			properties.showSummaryPane = this._getBoolean(gr.getValue("show_summary_pane"));
			properties.showLeftPane = this._getBoolean(gr.getValue("show_left_pane"));
			properties.showSpanText = this._getBoolean(gr.getValue("show_span_text"));
			properties.autoRefresh = gr.getValue("auto_refresh");
		}
		
		this.log.debug("[getProperties] properties: " + new JSON().encode(properties));
		return properties;
	},
	
	getProperty: function(uriParam) {
		var property = {
			"key" : "",
			"value" : "",
			"add" : false
		};
		
		if (JSUtil.nil(uriParam))
			return property;
		
		var arr = uriParam.split('=');
		if (arr.length != 2)
			return property;
		
		property.key = SNC.GlideHTMLSanitizer.sanitize(arr[0]);
		property.value = SNC.GlideHTMLSanitizer.sanitize(arr[1]);
		property.add = property.key.indexOf('sysparm_timeline') >= 0 ? true : false;
		
		this.log.debug("[getProperty] property: " + new JSON().encode(property));
		return property;
	},
	
	_getBoolean: function(value){
		return value && value == "1" ? true : false;
	},
	
	type: 'ScheduleTimeline'
};