var TestExecutorAjax = Class.create();
TestExecutorAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	process: function() {
	    var name = this.getParameter('sysparm_name');
		if (name == 'claimTest')
		    return this.claimTest();
		else if (name == 'decodeFieldValues')
			return this.decodeFieldValues();
		else if (name == 'addTestsToTestSuite')
		    return this.addTestsToTestSuite();
		else if (name == 'findOldestScheduledTest')
			return this.findOldestScheduledTest();
		else if (name == 'resolveInputs')
			return this.resolveInputs();
		else if (name =='validateFormView')
			return this.validateFormView();
		else if (name == 'impersonate')
			return this.impersonate();
		else if (name == 'unimpersonate')
			return this.unimpersonate();

		var utTestSysId = this.getParameter("sysparm_ajax_processor_ut_test_id");
		var utTestSuiteId = this.getParameter("sysparm_ajax_processor_ut_test_suite_id");
		var trackerId = this.getParameter("sysparm_ajax_processor_tracker_id");
		var testResultId = this.getParameter("sysparm_ajax_processor_test_result_id");
		var testSuiteResultId = this.getParameter("sysparm_ajax_processor_test_suite_result_id");

		if (this.getType() == 'cancelTestRun')
			return this.cancelTestRun(trackerId);
		if (this.getType() == 'killTestRun')
			return this.killTestRun(trackerId);


		if (utTestSuiteId)
			return this.runUserTestSuite(utTestSuiteId);

		if (utTestSysId)
			return this.runUserTest(utTestSysId);
		
		if (testResultId)
			return this.getTrackerIdFromTestResult(testResultId);
		
		if (testSuiteResultId)
			return this.getTrackerIdFromTestSuiteResult(testSuiteResultId);
	},
	
	getTrackerIdFromTestResult: function(testResultId) {
		var gr = new GlideRecord('sys_atf_test_result');
		if (!gr.get(testResultId)) {
			gs.log("Could not find test result with id: " + testResultId);
			return;
		}
		return gr.execution_tracker.sys_id;
	},

	getTrackerIdFromTestSuiteResult: function(testSuiteResultId) {
		var gr = new GlideRecord('sys_atf_test_suite_result');
		if (!gr.get(testSuiteResultId)) {
			gs.log("Could not find test result with id: " + testResultId);
			return;
		}
		return gr.execution_tracker.sys_id;
	},

	claimTest: function() {
		var test_result_sys_id = this.getParameter('sysparm_test_result_sys_id');
		var ui_batch_execution_tracker_sys_id = this.getParameter('sysparm_batch_execution_tracker_sys_id');
		var batch_length = this.getParameter('sysparm_batch_length');

		return new sn_atf.TestClaimer()
		.setATFTestRecordSysId(test_result_sys_id)
		.setUIBatchTrackerSysId(ui_batch_execution_tracker_sys_id)
		.setBatchLength(batch_length)
		.claim();
	},

	findOldestScheduledTest: function() {
		var userName = this.getParameter("sysparm_user_name");
		//finds the oldest scheduled test and returns its test_case_json (or null if none found)
		gs.log("TestExecutorAjax looking for a scheduled test to run for user: " + userName);
		var gr = new GlideRecord('sys_atf_test_result');
		gr.addQuery('status', 'waiting');
		gr.addQuery('sys_created_by', userName);
		gr.orderBy('sys_created_on');
		gr.query();
		if (gr.next()) {
			//found a test to run, try to claim it
			var testResultSysId = gr.getUniqueValue();
			var testCaseJSONString = gr.getValue('test_case_json');
			var testCaseJSON = JSON.parse(testCaseJSONString);
			var uiBatchTrackerSysId = testCaseJSON.tracker_sys_id;
			var successfulClaim = new sn_atf.TestClaimer()
				.setATFTestRecordSysId(testResultSysId)
				.setUIBatchTrackerSysId(uiBatchTrackerSysId)
				.setBatchLength(testCaseJSON.sys_atf_steps.length)
				.claim();
			if (successfulClaim) {
				gs.log("Successfully claimed scheduled test " + testResultSysId);
				return testCaseJSONString;
			} else {
				gs.log("TestExecutorAjax tried to claim a scheduled test, but was not successful");
				return null;
			}
		} else {
			gs.log("TestExecutorAjax did not find any tests in the 'waiting' state");
			return null;
		}
	},

	runUserTestSuite: function(utTestSuiteId) {
		var gr = new GlideRecord('sys_atf_test_suite');
		if (!gr.get(utTestSuiteId)) {
			gs.log("Could not find the Test suite with id: " + utTestSuiteId);
			return;
		}

		var executor = new sn_atf.UserTestSuiteExecutor();
		executor.setTestSuiteSysId(utTestSuiteId);
		return executor.start();
	},

	runUserTest: function(utTestSysId) {
		var gr = new GlideRecord('sys_atf_test');
		if (!gr.get(utTestSysId)) {
			gs.log("couldn't find the Test record with id: " + utTestSysId);
			return;
		}

		return new sn_atf.ExecuteUserTest()
		.setTestRecordSysId(utTestSysId)
		.start();
	},
	
	cancelTestRun: function(trackerId) {
		return sn_atf.AutomatedTestingFramework.cancelTestRun(trackerId);
	},
	
	killTestRun: function(trackerId) {
		return sn_atf.AutomatedTestingFramework.killTestRun(trackerId, false); // false means the kill request is not sent from cluster message
	},

	decodeFieldValues: function() {
	    var table = this.getParameter('sysparm_table_name');
	    var fieldValues = this.getParameter('sysparm_field_values');
	    var queryString = new GlideQueryString(table, fieldValues);
	    queryString.deserialize();
	    var terms = queryString.getTerms();
	    for (var i = 0; i < terms.size(); i++) {
	        var term = terms.get(i);
	        var field = term.getField();
	        var value = term.getValue();
	        if (!field)
	            continue;

			if (value.startsWith("javascript:")){
				var sBoxEvalObj = new GlideScriptEvaluator();
				sBoxEvalObj.setEnforceSecurity(true);
				value = sBoxEvalObj.evaluateString(value, true);
			}

		    var fieldValue = this.newItem("fieldValue");
			fieldValue.setAttribute("field", field);
			fieldValue.setAttribute("value", value);
	    }
	},
	
	resolveInputs: function() {
		var resultId = this.getParameter("sysparm_atf_test_result");
		var stepId = this.getParameter("sysparm_atf_step_id");
		var testProcessor = new sn_atf.UserTestProcessor();
		return testProcessor.generateStepJSON(stepId, resultId);
	},
	
	addTestsToTestSuite: function() {
	    var testSuiteId = this.getParameter("sysparm_atf_test_suite_id");
		var testIds = this.getParameter("sysparm_atf_test_ids");
		var testQuery = this.getParameter("sysparm_atf_test_query");
		var testsToAdd = [];
		if (testIds)
			testsToAdd = testIds.split(",");
		else {
			var testGR = new GlideRecord('sys_atf_test');
			if (testQuery)
				testGR.addEncodedQuery(testQuery);

			testGR.query();
			while (testGR.next())
				testsToAdd.push(testGR.getValue('sys_id'));

		}
		var testSuiteProcessor = new sn_atf.TestSuiteProcessor();
		return testSuiteProcessor.addTestsToTestSuite(testSuiteId, testsToAdd);
	},

	validateFormView: function() {
		var formView = this.getParameter('sysparm_view_name');
		var formTable = this.getParameter('sysparm_table_name');
		if(GlideStringUtil.nil(formView) || formView.toLowerCase() == "default")
			return true;

		var viewManager = new GlideScriptViewManager(null);
		viewManager.setTable(formTable);
		viewManager.setTarget("section");
		var cl = viewManager.getList();
		return cl.contains(formView);
	},

	impersonate: function() {
		var impersonatingUser = this.getParameter("sysparm_impersonating_user");
		gs.log("TestExecutorAjax impersonate called with impersonating user: " + impersonatingUser);
		if (gs.getUserID() != impersonatingUser)
			gs.getSession().onlineImpersonate(impersonatingUser);

		// Return the currently logged in user Id so that impersonation outcome can be verified
		return gs.getUserID();
	},

	unimpersonate: function() {
	    gs.log("TestExecutorAjax unimpersonating");
		gs.getSession().onlineUnimpersonate();

		// Return the currently logged in user Id so that we can verify if unimpersonation was successful
		return gs.getUserID();
	},

    type: 'TestExecutorAjax'
});