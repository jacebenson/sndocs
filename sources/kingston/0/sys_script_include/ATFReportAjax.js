var ATFReportAjax = Class.create();
ATFReportAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
		var name = this.getParameter("sysparm_name");
		if (name == "getPublishedTestResultReportId")
			return this.getPublishedTestResultReportId(this.getParameter("sysparm_test_result_ids"));
		if (name == "getPublishedTestSuiteResultReportId")
			return this.getPublishedTestSuiteResultReportId(this.getParameter("sysparm_test_suite_result_ids"));

	},

	/**
	 * Publish the report, so that the report can be opened in read only view
	 */
	publishReport: function(reportId) {
		if (!reportId)
			return;

		var report = new GlideReport(reportId);
		report.publish();
	},

	/**
	 * Create a report for the test result ids passed,
	 * publish it and return the report id
	 */
	getPublishedTestResultReportId: function(testResultIds) {
		if (!testResultIds)
			return "";
		var testResultIdsInArr = testResultIds.split(",");
		var reportId = this.generateTestResultCompareReportRecord(testResultIdsInArr);
		this.publishReport(reportId);
		return reportId;
	},

	/**
	 * Create a report for the suite results passed,
	 * publish it and return the report id
	 */
	getPublishedTestSuiteResultReportId: function(testSuiteResultIds) {
		if (!testSuiteResultIds)
			return "";
		var testSuiteResultIdsInArr = testSuiteResultIds.split(",");
		var reportId = this.generateSuiteResultCompareReportRecord(testSuiteResultIdsInArr);
		this.publishReport(reportId);
		return reportId;
	},

	/**
	 * Generate the report to compare the test results passed
	 */
	generateTestResultCompareReportRecord: function (testResultIds) {
		var report = new GlideRecord("sys_report");
		report.table = "sys_atf_test_result_step";
		// Set the description to the english string below, which will be used by the table cleaner to delete the reports
		report.description = "This report was automatically generated and will be deleted automatically by a Table Cleaner. Please do not alter this text.";
		report.filter = this.getTestResultCompareReportFilter(testResultIds);
		report.title = gs.getMessage("Compare test result execution times");
		report.field = "step";
		report.trend_field = "test_result.execution_tracker";
		report.aggregate = "SUM";
		report.other_threshold = -1;
		report.type = "bar";
		report.bar_unstack = true;
		report.chart_size = "large";
		report.sumfield = "run_time";
		report.field_list = "start_time,step,status,output,run_time,type";
		report.exp_report_attrs = true;
		report.row = "sys_created_on";
		report.column = "sys_created_on";
		report.compute_percent = "count";
		report.direction = "minimize";
		report.gauge_autoscale = true;
		report.chart_title_color = "65b30218a9fe3dba0120df8611520d97";
		report.x_axis_title = gs.getMessage("Test steps");
		report.y_axis_title = gs.getMessage("Execution time");
		report.set_color = "chart_colors";
		return report.insert();
	},

	/**
	 * Generate the filter to be used in the test result compare report
	 * so that the chart includes only the test results that are passed as arguments
	 */
	getTestResultCompareReportFilter: function (testResultIds) {
		var filter = "test_result.sys_id="+testResultIds[0];
		for (var i = 1; i < testResultIds.length; i++) {
			filter += "^ORtest_result.sys_id=" + testResultIds[i];
		}
		filter += "^EQ^GROUPBYstep^EQ^TRENDBYtest_result.execution_tracker,year";
		return filter;
	},

	/**
	 * Generate the report to compare the test suite results passed
	 */
	generateSuiteResultCompareReportRecord: function (testSuiteResultIds) {
		var report = new GlideRecord("sys_report");
		report.table = "sys_atf_test_result";
		// Set the description to the english string below, which will be used by the table cleaner to delete the reports
		report.description = "This report was automatically generated and will be deleted automatically by a Table Cleaner. Please do not alter this text.";
		report.filter = this.getSuiteResultCompareReportFilter(testSuiteResultIds);
		report.title = gs.getMessage("Compare test suite result execution times");
		report.field = "test";
		report.trend_field = "parent.base_suite_result";
		report.aggregate = "SUM";
		report.other_threshold = -1;
		report.type = "bar";
		report.bar_unstack = true;
		report.chart_size = "large";
		report.sumfield = "run_time";
		report.field_list = "start_time,test,status,run_time";
		report.exp_report_attrs = true;
		report.row = "sys_created_on";
		report.column = "sys_created_on";
		report.compute_percent = "aggregate";
		report.direction = "minimize";
		report.gauge_autoscale = true;
		report.chart_title_color = "65b30218a9fe3dba0120df8611520d97";
		report.x_axis_title = gs.getMessage("Test results");
		report.y_axis_title = gs.getMessage("Execution time");
		report.set_color = "chart_colors";
		return report.insert();
	},

	/**
	 * Generate the filter to be used in the test suite result compare report
	 * so that the chart includes only the test suite results that are passed as arguments
	 */
	getSuiteResultCompareReportFilter: function (testSuiteResultIds) {
		var filter = "parent="+testSuiteResultIds[0] + "^ORparent.base_suite_result=" + testSuiteResultIds[0];
		for (var i = 1; i < testSuiteResultIds.length; i++) {
			filter += "^ORparent=" + testSuiteResultIds[i] + "^ORparent.base_suite_result=" + testSuiteResultIds[i];
		}
		filter += "^EQ^GROUPBYtest^EQ^TRENDBYparent.base_suite_result,year";
		return filter;
	},

    type: 'ATFReportAjax'
});