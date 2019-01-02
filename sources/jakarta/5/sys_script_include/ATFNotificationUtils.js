var ATFNotificationUtils = Class.create();
ATFNotificationUtils.prototype = {
	type: 'ATFNotificationUtils',
	
    initialize: function() {
    },

    getCSS: function() {
		var PASS_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.pass_color', '#d3f6d6');
		var FAIL_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.fail_color', '#fccac9');
		var ERROR_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.error_color', '#ffdcc6');
		var SKIP_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.skip_color', '#ffffff');
		var CANCEL_COLOR = gs.getProperty('sn_atf.schedule.suite_result_email.cancel_color', '#ffffff');
		return '.fixed_cell{width:280px; max-width:280px; word-wrap:break-word; line-height:1.42857; padding:6px;font-size:13px;border-right:1px solid #BDC0C4;border-top:1px solid #BDC0C4;border-bottom:1px solid #BDC0C4;}' +
			'.heading{font-size:15px; font-weight:bold; font-family:SourceSansPro, "Helvetica Neue", Arial;}' +
			'.link{font-weight:normal;text-decoration:none;color:#278efc;}' +
			'.normal{color:#485563; margin-bottom:20px; font-family:SourceSansPro, "Helvetica Neue", Arial;}' +
			'.link_header{text-align:left; font-weight:bold; color:#343d47;}' +
			'.cell{font-size:12px; border:1px solid #BDC0C4; margin-left:auto; margin-right:auto; width:32px;}' +
			'.test_fail{text-align:center; border:1px solid #bdc0c4; background:' + FAIL_COLOR + '; width:32px;}' +
			'.test_pass{text-align:center; border: 1px solid #bdc0c4; border-right:1px solid #bdc0c4; background:' + PASS_COLOR + '; width:32px;}' +
			'.test_skipped{text-align:center; border: 1px solid #bdc0c4; border-right:1px solid #bdc0c4; background:' + SKIP_COLOR + ';width:32px;}' +
			'.test_error{text-align:center;border: 1px solid #bdc0c4; border-right:1px solid #bdc0c4; background:' + ERROR_COLOR + '; width:32px;}' +
			'.test_canceled{width:32px; text-align:center; background:' + CANCEL_COLOR + ';border: 1px solid #bdc0c4; border-right:1px solid #bdc0c4;}' +
			'.table_title {font-size:15px; margin-top:20px; margin-bottom:10px;font-family:SourceSansPro, "Helvetica Neue", Arial; line-height:1.42857;color:#343d47;}'+
			'.table_wrap {display: inline-block; position:relative;}' + 
			'.pivot-2-levels.table {margin: 0; border: 1px solid #BDC0C4;font-family:SourceSansPro, "Helvetica Neue", Arial;font-size:13px;border-collapse:collapse;}' +
			'.pivot-2-levels .header-row td {background: #f4f4f4;border:1px solid #BDC0C4}' +
			'.pivot-2-levels th {background: #f4f4f4; text-align:right; vertical-align:middle !important; font-weight:normal;padding-left:6px;padding-right:6px;padding-top:6px;padding-bottom:6px;line-height:1.42857;}' +
			'.pivot-2-levels th.x-axis-category {font-weight:normal;border-left:1px solid #BDC0C4;}' +
			'.pivot-2-levels th.x-axis-category-test-suite {font-weight:normal;border-bottom:1px solid #BDC0C4;}' +
			'.pivot-2-levels th.y-axis-category {font-weight:normal;text-align:left;border-top:1px solid #BDC0C4;}' +
			'.pivot-2-levels th.num {background:white;text-align:center;border-left:1px solid #BDC0C4;border-top:1px solid #BDC0C4;}' +
			'.pivot-2-levels th.pv_test_suite {font-weight:bold;border-left:1px solid #BDC0C4;border-bottom:1px solid #BDC0C4;}';	
	},
	
	getCSSStyle: function() {
		return '<style type="text/css">' + this.getCSS() + '</style>';
	},
	
	formatText: function(text) {
		return GlideStringUtil.escapeHTML(text);
	},
	
	// total number of suites in the current test suite (including itself)
	// can't just sum the suite results where base suite result is the testSuiteResultSysId
	// because it doesn't calculate correctly for child suites that run on their own
	getTotalNumSuites: function(testSuiteSysId) {
		var total = 0;
		var tsGR = new GlideRecord('sys_atf_test_suite');
		tsGR.addQuery("parent", testSuiteSysId);
		tsGR.addQuery("active", true);
		tsGR.query();
		while(tsGR.next()) {
			// go through each of the children of this test suite
			// TODO: May need to this.getTotalNumSuites
			total += this.getTotalNumSuites(tsGR.getUniqueValue());
		}
		return total + 1;
	},
	
	// total number of suites in the current test suite (including itself) that succeeded 
	getNumSuccessfulSuites: function(testSuiteResult) {
		var total = 0;
		var tsrGR = new GlideRecord("sys_atf_test_suite_result");
		// case 1
		if (testSuiteResult.number == testSuiteResult.base_suite_result.number){
			tsrGR.addQuery("base_suite_result.number", testSuiteResult.number);
			tsrGR.addQuery("active", true);
			tsrGR.query();
			while(tsrGR.next()) {
				if(tsrGR.status == "success") {
					total++;
				}
			}
		}
		// case 2
		else if (testSuiteResult.parent.number == testSuiteResult.base_suite_result.number) {
			tsrGR.addQuery("parent.number", testSuiteResult.number);
			tsrGR.addQuery("active", true);
			tsrGR.query();
			while(tsrGR.next()) {
				if(tsrGR.status == "success") {
					total++;
				}
			}
			if (testSuiteResult.status == "success")
				total++;
		}
		// suite with no child suites
		else {
			if (testSuiteResult.status == "success")
				total++;
		}
		return total;
	},
	
	getNumFailedSuites: function(testSuiteResult) {
		var total = 0;
		var tsrGR = new GlideRecord("sys_atf_test_suite_result");
		// case 1
		if (testSuiteResult.number == testSuiteResult.base_suite_result.number){
			tsrGR.addQuery("base_suite_result.number", testSuiteResult.number);
			tsrGR.addQuery("active", true);
			tsrGR.query();
			while(tsrGR.next()) {
				if(tsrGR.status == "failure") {
					total++;
				}
			}
		}
		// case 2
		else if (testSuiteResult.parent.number == testSuiteResult.base_suite_result.number) {
			tsrGR.addQuery("parent.number", testSuiteResult.number);
			tsrGR.addQuery("active", true);
			tsrGR.query();
			while(tsrGR.next()) {
				if(tsrGR.status == "failure") {
					total++;
				}
			}
			if (testSuiteResult.status == "failure")
				total++;
		}
		// suite with no child suites
		else {
			if (testSuiteResult.status == "failure")
				total++;
		}
		return total;
	},
	
	getNumStatusSuites: function(testSuiteResult, status) {
		var total = 0;
		var tsrGR = new GlideRecord("sys_atf_test_suite_result");
		// case 1
		if (testSuiteResult.number == testSuiteResult.base_suite_result.number){
			tsrGR.addQuery("base_suite_result.number", testSuiteResult.number);
			tsrGR.addQuery("active", true);
			tsrGR.query();
			while(tsrGR.next()) {
				if(tsrGR.status == status) {
					total++;
				}
			}
		}
		// case 2
		else if (testSuiteResult.parent.number == testSuiteResult.base_suite_result.number) {
			tsrGR.addQuery("parent.number", testSuiteResult.number);
			tsrGR.addQuery("active", true);
			tsrGR.query();
			while(tsrGR.next()) {
				if(tsrGR.status == status) {
					total++;
				}
			}
			if (testSuiteResult.status == status)
				total++;
		}
		// suite with no child suites
		else {
			if (testSuiteResult.status == status)
				total++;
		}
		return total;
	},
	
	getTotalTestsInSuite: function(testSuiteResult) {
		return testSuiteResult.rolled_up_test_error_count +
			   testSuiteResult.rolled_up_test_failure_count +
			   testSuiteResult.rolled_up_test_skip_count +
			   testSuiteResult.rolled_up_test_success_count;
	},
	
	isStatusNotPassed: function(result) {
		if (current.status == "failure" ||
			current.status == "error" ||
			current.status == "canceled" ||
			current.status == "skipped")
			return true;
		return false;
	},
	
	
	
};