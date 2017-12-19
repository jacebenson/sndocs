var UsageAnalyticsUserSummaryLastNMonths = Class.create();

UsageAnalyticsUserSummaryLastNMonths.SUMMARY_NAME = "Usage Analytics User Summary";

UsageAnalyticsUserSummaryLastNMonths.prototype = {
    initialize: function(/* int */ numMonths, sourceTable, instanceName) {
		this.g_numMonths = numMonths;
		this.g_sourceTable = sourceTable; 
		this.g_instanceName = instanceName;
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
		var ga = new GlideAggregate(this.g_sourceTable);
		ga.addAggregate('COUNT(DISTINCT', 'user');
		gs.include('UsageAnalyticsLastNMonths'); 
		var monthsUtil = new UsageAnalyticsLastNMonths(); 
		var months = monthsUtil.getLastNMonths(this.g_numMonths);
		if (this.g_instanceName != null)
			ga.addQuery('instance_name', this.g_instanceName);
		ga.addQuery('time_stamp', 'IN', months);
		ga.groupBy('user_type');
		ga.query();
		while (ga.next()) {
			var userType = ga.user_type.getDisplayValue();
			var userCount = ga.getAggregate('COUNT(DISTINCT', 'user');
			this.createSummaryLine(id, userType, userCount);
		}
		return id;
	},

	createSummary: function() {
    	var s = new GlideRecord("sys_report_summary");
    	s.title = UsageAnalyticsUserSummaryLastNMonths.SUMMARY_NAME;
    	s.field = "Applications";
    	return s.insert();
	},

	createSummaryLine: function(id, userType, userCount) {
    	var s = new GlideRecord("sys_report_summary_line");
		s.summary = id;
    	s.sequence = this.g_sequence++;
    	s.value = userCount;
    	s.category = userType;
    	s.name = userType;
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
   		s.addQuery("title", UsageAnalyticsUserSummaryLastNMonths.SUMMARY_NAME);
   		s.query();
   		while (s.next()) 
        	s.deleteRecord();
	},
	
    type: 'UsageAnalyticsUserSummaryLastNMonths'
}