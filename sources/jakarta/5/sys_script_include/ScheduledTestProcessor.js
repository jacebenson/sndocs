var ScheduledTestProcessor = Class.create();
ScheduledTestProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    process: function() {
        var type = this.getParameter("sysparm_ajax_processor_type");
        var scheduleSysId = this.getParameter("sysparm_ajax_processor_suite_schedule_id");

        if (type == 'executeScheduledSuites')
        	return this.executeScheduledSuites(scheduleSysId);
        else if (type == 'getNewestRunningTrackerForSchedule')
            return this.getNewestRunningTrackerForSchedule(scheduleSysId);
        else if (type == 'toggleATFAgentType')
        	return this.toggleATFAgentType();
        else if (type == 'findOldestScheduleRunTest')
        	return this.findOldestScheduleRunTest();
        else if (type == 'claimScheduledTest')
        	return this.claimScheduledTest();
    },

	/**
	 * execute a collection of sys_atf_schedule_run executions from the sys_atf_schedule record
	 */
	executeScheduledSuites: function(scheduleSysId) {
		if (!sn_atf.ATFSchedule.isScheduleEnabled()) {
			gs.log('sn_atf.schedule.enabled property is not set to true. Not running scheduled test with ID: ' + scheduleSysId);
			return;
		}

		return new sn_atf.ScheduledRunsExecutor()
			.setScheduleSysId(scheduleSysId)
			.start();
	},

    /** Returns the newest running (or finished) tracker sys_id for the given schedule sys_id. */
	getNewestRunningTrackerForSchedule: function(scheduleSysId) {
		var trackerId = sn_atf.ATFSchedule.getNewestRunningTrackerSysIdForSchedule(scheduleSysId);
		if (trackerId == null)
			trackerId = sn_atf.ATFSchedule.getNewestFinishedTrackerSysIdForSchedule(scheduleSysId);

		return trackerId;
	},

	/**
	 * Toggles the given atf agent record between running manual or scheduled tests only
	 * @returns - object with status of 'error' if failed to update the sys_atf_agent record to the new runner type
	 *            object with status of 'success' if successfully updated the sys_atf_agent record to the new runner type
	 */
	toggleATFAgentType: function() {
		var atfAgentId = this.getParameter("sysparm_atf_agent_id");
		var newRunnerType = this.getParameter("sysparm_ajax_new_runner_type");
		gs.log("ScheduledTestProcessor: Setting up test runner with atfAgentId " + atfAgentId + " to run " + newRunnerType + " tests only");

		var result = {};
		result.status = "error";
		result.message = "ScheduledTestProcessor: Failed to set up ATF agent with id " + atfAgentId + " to run " + newRunnerType + " tests only. ";

		var gr = new GlideRecord('sys_atf_agent');
		if (!gr.get(atfAgentId)) {
			result.message += "ATF agent record does not exist by id";
			gs.log(result.message);
			return JSON.stringify(result);
		}

		if (gr.getValue('status') != 'online') {
			result.message += "ATF agent record does not have a status of 'online'";
			gs.log(result.message);
			return JSON.stringify(result);
		}

		if (gr.getValue('type') == newRunnerType) {
			result.status = "success";
			result.message = "ScheduledTestProcessor: ATF agent record with id " + atfAgentId + " is already setup to run " + newRunnerType + " tests only";
			gs.log(result.message);
			return JSON.stringify(result);
		}

		gr.setValue('type', newRunnerType);
		if (!gr.update()) {
			result.message += "GlideRecord update failed";
			gs.log(result.message);
			return JSON.stringify(result);
		}

		result.status = "success";
		result.message = "ScheduledTestProcessor: Successfully set up ATF agent with id " + atfAgentId + " to run " + newRunnerType + " tests only";
		gs.log(result.message);
		return JSON.stringify(result);
	},

	/**
	 * Queries for a Scheduled Test for a Scheduled Suite Run to be executed by any scheduled
	 * runner.
	 * If a test to be executed is found, tries to claim the test
	 * If successful, returns the test case json string
	 * otherwise return null
	 */
	findOldestScheduleRunTest: function() {
		// agent id enables browser constraint validation
		var atfAgentId = this.getParameter("sysparm_atf_agent_id");
		var atfAgentGR = this.getOnlineAgentGR(atfAgentId);
		if (null == atfAgentGR) {
			gs.log("Failed to find a scheduled test, atf agent with ID " + atfAgentId + " is not online");
			return null;
		}

		//finds the oldest scheduled test and returns its test_case_json (or null if none found)
		gs.log("ScheduledTestProcessor: Looking for a scheduled runs test to run for agent: " + atfAgentId);
		var testResultGR = new GlideRecord('sys_atf_test_result');
		testResultGR.addQuery('status', 'waiting');
		testResultGR.addQuery('parent.schedule_run', 'ISNOTEMPTY', '');
		testResultGR.addQuery('message_reference', 'schedule');
		testResultGR.orderBy('sys_created_on');
		testResultGR.query();
		// this should only ever return 1 record (test that received the mutex will have status = waiting)
		gs.debug("ScheduledTestProcessor: Number of schedule run records found " + testResultGR.getRowCount());

		// check all available tests for a match with browser constraints
		while (testResultGR.next()) {
			// test result record to check for constraints
			var testResultSysId = testResultGR.sys_id;

			//found a test to run, confirm this scheduled runner meets its browser constraints criteria
			var scheduleRunGR = testResultGR.parent.schedule_run;
			if (!this.doesAgentMatchConstraints(atfAgentGR, scheduleRunGR)) {
				gs.debug("ScheduledTestProcessor: ATF agent with ID " + atfAgentId + " cannot claim waiting scheduled test result with ID " + testResultSysId + " as it was not compatible with schedule run constraints by id " + scheduleRunGR);
				continue;
			}
			
			// the agent is compatible with client constraints, try to claim it
			var testCaseJSONString = testResultGR.getValue('test_case_json');
			var testCaseJSON = JSON.parse(testCaseJSONString);
			var uiBatchTrackerSysId = testCaseJSON.tracker_sys_id;

			var successfulClaim = new sn_atf.TestClaimer()
				.setATFTestRecordSysId(testResultSysId)
				.setUIBatchTrackerSysId(uiBatchTrackerSysId)
				.setBatchLength(testCaseJSON.sys_atf_steps.length)
				.claim();
			if (successfulClaim) {
				gs.log("ScheduledTestProcessor: ATF agent with ID " + atfAgentId + " successfully claimed waiting scheduled test result with ID " + testResultSysId);
				return testCaseJSONString;
			} else {
				gs.log("ScheduledTestProcessor: ATF agent with ID " + atfAgentId + " failed to claim waiting scheduled test result with ID " + testResultSysId);
				return null;
			}
		}
		gs.log("ScheduledTestProcessor: Did not find any scheduled tests that match the agent constraints in the 'waiting' state");
		return null;
	},

	claimScheduledTest: function() {
		var atfAgentId = this.getParameter("sysparm_atf_agent_id");
		var testResultId = this.getParameter("sysparm_test_result_sys_id");
		gs.log("ATF agent with ID '" + atfAgentId + "' attempting to claim scheduled test result with ID '" + testResultId + "'");

		var testResultGR = new GlideRecord('sys_atf_test_result');
		if (!testResultGR.get(testResultId)) {
			gs.log("Failed to claim scheduled test, test result record does not exist with ID: " + testResultId);
			return false;
		}

		var scheduleRun = testResultGR.parent.schedule_run;
		if (scheduleRun == "") {
			gs.log("Failed to claim scheduled test, there is no schedule_run for test result with ID: " + testResultId);
			return false;
		}

		var atfAgentGR = this.getOnlineAgentGR(atfAgentId);
		if (!atfAgentGR) {
			gs.log("Failed to claim scheduled test, atf agent with ID " + atfAgentId + " is not online");
			return false;
		}

		if (this.doesAgentMatchConstraints(atfAgentGR, scheduleRun)) {
			//atf agent matches the constraints, but it still needs to claim the test
			//result because there could be multiple agents who match all constraints
			var uiBatchTrackerSysId = this.getParameter('sysparm_batch_execution_tracker_sys_id');
			var batchLength = this.getParameter('sysparm_batch_length');

			var successfulClaim = new sn_atf.TestClaimer()
				.setATFTestRecordSysId(testResultId)
				.setUIBatchTrackerSysId(uiBatchTrackerSysId)
				.setBatchLength(batchLength)
				.claim();
			if (successfulClaim) {
				gs.log("ATF agent with ID " + atfAgentId + " successfully claimed waiting scheduled test result with ID " + testResultId);
				return true;
			} else {
				gs.log("ATF agent with ID " + atfAgentId + " failed to claim waiting scheduled test result with ID " + testResultId);
				return false;
			}
		} else
			return false;
	},

	/**
	 * get agent record if it has online status
	 * @return agent record or null if not found
	 */
	getOnlineAgentGR: function(atfAgentId) {
		var atfAgentGR = new GlideRecord('sys_atf_agent');
		if (!atfAgentGR.get(atfAgentId)) {
			gs.log("ScheduledTestProcessor: atf agent does not exist with ID " + atfAgentId);
			return null;
		}
		if (atfAgentGR.status != 'online') {
			gs.log("ScheduledTestProcessor: atf agent with ID " + atfAgentGR.sys_id + " is not online");
			return null;
		}
		gs.log('ScheduledTestProcessor: ATF Agent  - Browser: [' + atfAgentGR.browser_name + ', ' + atfAgentGR.browser_version + '], OS: [' + atfAgentGR.os_name + ', ' + atfAgentGR.os_version + ']');
		return atfAgentGR;
	},

	/**
	 * check indicated agent matches browser constraints of the scheduled suite run
	 * @param atfAgent GlideRecord of sys_atf_agent
	 * @param scheduleRun GlideRecord of sys_atf_schedule_run
	 */
	doesAgentMatchConstraints: function(atfAgent, scheduleRun) {
		//get the configuration of the calling browser
		//browser name constraint and OS name constraint are choices and have underscores instead of spaces
		var agentBrowserName = atfAgent.browser_name.toLowerCase().replaceAll(" ", "_");
		var agentBrowserVersion = atfAgent.browser_version.toLowerCase();
		var agentOSName = atfAgent.os_name.toLowerCase().replaceAll(" ", "_");
		var agentOSVersion = atfAgent.os_version.toLowerCase();

		//get the constraints of this schedule run
		var browserNameConstraint = scheduleRun.browser_name.toLowerCase();
		var browserVersionConstraint = scheduleRun.browser_version;
		var osNameConstraint = scheduleRun.os_name.toLowerCase();
		var osVersionConstraint = scheduleRun.os_version;

		gs.log('ScheduledTestProcessor: Constraint - Browser: [' + browserNameConstraint + ', ' + browserVersionConstraint + '], OS: [' + osNameConstraint + ', ' + osVersionConstraint + ']');

		//see if they match
		var browserNameMatches = false;
		var browserVersionMatches = false;
		var osNameMatches = false;
		var osVersionMatches = false;

		gs.debug("ScheduledTestProcessor: Matching browser_name constraint. ATF Agent has browser_name: '" + agentBrowserName + "' and schedule run has browser_name constraint '" + browserNameConstraint + "'");
		if (browserNameConstraint == 'any' || agentBrowserName == browserNameConstraint)
			browserNameMatches = true;

		gs.debug("ScheduledTestProcessor: Matching browser_version starts with constraint. ATF Agent has browser_version: '" + agentBrowserVersion + "' and schedule run has browser_version starts with constraint '" + browserVersionConstraint + "'");
		if (browserVersionConstraint == '' || agentBrowserVersion.startsWith(browserVersionConstraint.toLowerCase()))
			browserVersionMatches = true;

		gs.debug("ScheduledTestProcessor: Matching os_name constraint. ATF Agent has os_name: '" + agentOSName + "' and schedule run has os_name constraint '" + osNameConstraint + "'");
		if (osNameConstraint == 'any' || agentOSName == osNameConstraint)
			osNameMatches = true;

		gs.debug("ScheduledTestProcessor: Matching os_version starts with constraint. ATF Agent has os_version: '" + agentOSVersion + "' and schedule run has os_version starts with constraint '" + osVersionConstraint + "'");
		if (osVersionConstraint == '' || agentOSVersion.startsWith(osVersionConstraint.toLowerCase()))
			osVersionMatches = true;

		gs.debug("ScheduledTestProcessor: Does browser_name match: " + browserNameMatches);
		gs.debug("ScheduledTestProcessor: Does browser_version starts with match: " + browserVersionMatches);
		gs.debug("ScheduledTestProcessor: Does os_name match: " + osNameMatches);
		gs.debug("ScheduledTestProcessor: Does os_version starts with match: " + osVersionMatches);

		if (browserNameMatches && browserVersionMatches && osNameMatches && osVersionMatches) {
			gs.log("ScheduledTestProcessor: All schedule run constraints match, agent: " + atfAgent.sys_id + ", schedule: " + scheduleRun.sys_id);
			return true;
		} else {
			gs.debug("ScheduledTestProcessor: One or more constraints failed to match. Not trying to claim this test, agent: " + atfAgent.sys_id + ", schedule: " + scheduleRun.sys_id);
			return false;
		}
	},

    type: 'ScheduledTestProcessor'
});