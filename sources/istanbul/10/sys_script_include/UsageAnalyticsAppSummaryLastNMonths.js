var UsageAnalyticsAppSummaryLastNMonths = Class.create();

UsageAnalyticsAppSummaryLastNMonths.SUMMARY_NAME = "Usage Analytics App Summary";

UsageAnalyticsAppSummaryLastNMonths.prototype = {
    initialize: function(/* int */ numMonths) {
		 this.g_numMonths = numMonths;
         this.g_sequence = 0;
    },
	
	generateSummary: function() {
		var id = this.getApplications();
		this.orderSummaryLines(id);
		this.deleteOthers(id);
		return id;
	},

	getApplications: function() {
    	var id = this.createSummary();
		var ga = new GlideAggregate('usageanalytics_app');
		ga.addAggregate('COUNT(DISTINCT', 'user');
		gs.include('UsageAnalyticsLastNMonths'); 
		var monthsUtil = new UsageAnalyticsLastNMonths(); 
		var months = monthsUtil.getLastNMonths(this.g_numMonths);
		ga.addQuery('time_stamp', 'IN', months);
		ga.groupBy('app_name');
		ga.query();
		while (ga.next()) {
			var appname = ga.app_name.getDisplayValue();
			var userCount = ga.getAggregate('COUNT(DISTINCT', 'user');
			this.createSummaryLine(id, appname, userCount);
		}
		return id;
	},

	createSummary: function() {
    	var s = new GlideRecord("sys_report_summary");
    	s.title = UsageAnalyticsAppSummaryLastNMonths.SUMMARY_NAME;
    	s.field = "Applications";
    	return s.insert();
	},

	createSummaryLine: function(id, appname, userCount) {
    	var s = new GlideRecord("sys_report_summary_line");
		s.summary = id;
    	s.sequence = this.g_sequence++;
    	s.value = userCount;
    	s.category = appname;
    	s.name = appname;
    	s.insert();
	},

	orderSummaryLines: function(id) {
   		var s = new GlideRecord("sys_report_summary_line");
   		s.addQuery("summary", id);
   		s.orderByDesc('value');
   		s.query();
   		var seq = 0;
   		while (s.next()) {
        	s.sequence = seq++;
        	s.update();
   		}
	},

	deleteOthers: function (id) {
   		var s = new GlideRecord("sys_report_summary");
   		s.addQuery("sys_id", "!=", id);
   		s.addQuery("title", UsageAnalyticsAppSummaryLastNMonths.SUMMARY_NAME);
   		s.query();
   		while (s.next()) 
        	s.deleteRecord();
	},
	
    type: 'UsageAnalyticsAppSummaryLastNMonths'
}