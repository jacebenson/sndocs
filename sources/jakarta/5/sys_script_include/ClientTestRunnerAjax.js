var ClientTestRunnerAjax = Class.create();
ClientTestRunnerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	process: function() {
	    var name = this.getParameter('sysparm_name');
		if (name == 'registerTestRunner')
			return this.registerTestRunner();
		else if (name == 'testRunnerHeartbeat')
			return this.heartbeat();
		else if (name == 'makeTestRunnerOffline')
			return this.makeTestRunnerOffline();
	},

	/**
	* Create a record in sys_atf_agent table when a test runner is started
	* This method parses the user agent string from the test runner and stores the browser name, version and os in the
	* sys_atf_agent record
	* If the sys id passed from the test runner already exists, it is ignored. If not, the passed value is set as the
	* sys id of the newly created record
	* returns the sys_id of the record inserted
	*/
	registerTestRunner: function() {
		var userAgent = this.getParameter("sysparm_atf_user_agent");
		var user = this.getParameter("sysparm_user");
		var agentSysId = this.getParameter("sysparm_atf_agent_id");
		gs.log("ClientTestRunnerAjax registerRunner called with user agent: " + userAgent + " ,user: " + user + ", agent sys id: " + agentSysId);

		var gr = new GlideRecord("sys_atf_agent");

		if (agentSysId && agentSysId != "") {
			if (!gr.get(agentSysId)) {
				gr.setNewGuidValue(agentSysId);
			} else {
				gs.log("atf agent sys_id already exists, generating a new sys_id");
			}
		}
		gr.user_agent = userAgent;

		var helper = new PickABrowserHelper();
		var browserInfo = helper.parseUserAgent(userAgent);
		gr.browser_name = browserInfo.browserName;
		gr.browser_version = browserInfo.version;
		gr.os_name = browserInfo.osName;
		gr.os_version = browserInfo.osVersion;
		var sessionId = new GlideChecksum(gs.getSessionID()).getMD5();
		gr.session_id = sessionId;

		gr.user = user;
		gr.status = 'online';
		gr.last_checkin = new GlideDateTime();
		var sysId = gr.insert();

		if (!sysId)
			return null;

		browserInfo.id = sysId;
		browserInfo.sessionId = sessionId;
		return JSON.stringify(browserInfo);
	},

	/**
	 * Update the sys_atf_agent record so that the schedule job does not reap it
	 * If the sys_atf_agent record has already been deleted, return "delete" so that
	 * the test runner stops further heartbeat messages
	 * If the session id has changed, then the user has logged out and logged back in
	 * return "sessionChange" in this case
	 */
	heartbeat: function() {
		var agentSysId = this.getParameter("sysparm_atf_agent_id");
		gs.log("ClientTestRunnerAjax register heart beat called for atf agent " + agentSysId);
		return this.updateHeartbeatForATFAgent(agentSysId);
	},

	updateHeartbeatForATFAgent: function(agentSysId) {
		var gr = new GlideRecord("sys_atf_agent");
		var response = {};
		response.action = "NONE";
		if (agentSysId && agentSysId != "") {
			if (!gr.get(agentSysId)) {
				gs.log("ClientTestRunnerAjax could not find the sys_atf_agent record with id " + agentSysId);
				response.action = "DELETE";
				return JSON.stringify(response);
			}

			var newSessionId = new GlideChecksum(gs.getSessionID()).getMD5();
			var newUserId = gs.getUserID();
			// If the session_id is different from the current session Id, it means that
			// the user logged out and logged in again
			// In this case, if the user before and after login are the same, change the test result message_reference
			// and the session id in the test runner record
			// return SESSION_CHANGE as the action so that the test runner can re-subscribe to amb channels
			if (newSessionId != gr.session_id) {
				gs.log("ClientTestRunnerAjax: the session id for the test runner has changed");
				// If the new user is same as gr.user, change all the test result message references
				if (gr.user == newUserId)
					this.updateTestResultReferences(gr.session_id, newSessionId);
				else {
					// Test runner will re-subscribe but will not execute test from the old user
					gs.log("ClientTestRunnerAjax: the user id for the test runner has changed");
				}

				gr.user = newUserId;
				gr.session_id = newSessionId;

				response.action = "SESSION_CHANGE";
				response.sessionId = newSessionId;
			}
			response.user = newUserId;
			gr.setValue('status', 'online');
			gr.setValue('last_checkin', new GlideDateTime());
			gr.setValue('status_reason', '');
			gr.update();

			return JSON.stringify(response);
		}
	},

	/**
	 * Mark the sys_atf_agent record with the sys_id passed as offline
	 * Return true if update is successful
	 */
	makeTestRunnerOffline: function() {
		var atfAgentId = this.getParameter("sysparm_atf_agent_id");
		var statusReason = this.getParameter("sysparm_status_reason");
		gs.log("ClientTestRunnerAjax makeTetsRunnerOffline called with atf agent id: " + atfAgentId + ", reason: " + statusReason);
		var gr = new GlideRecord("sys_atf_agent");
		if (!gr.get(atfAgentId)) {
			gs.log("ClientTestRunnerAjax could not find an atf agent with sys id " + atfAgentId);
			return true;
		}
		if (gr.status == 'offline') {
			gs.log("ClientTestRunnerAjax makeTestRunnerOffline: test runner with sys_id " + atfAgentId + " is already offline");
			return true;
		}
		gr.status = 'offline';
		gr.status_reason = gs.getMessage(statusReason);
		return gr.update();
	},

	/**
	 * Update the message_reference of all the test result records
	 * where message_reference is oldSessionId to newSessionId, so that when the test runner
	 * subscribes to amb with the new session id, it will pick up tests
	 */
	updateTestResultReferences: function(oldSessionId, newSessionId) {
		var userId = gs.getUserID();
		var testResult = new GlideRecord("sys_atf_test_result");
		testResult.addQuery("message_reference", oldSessionId);
		testResult.addQuery("status", "waiting").addOrCondition("status", "running").addOrCondition("status", "");
		testResult.query();
		while (testResult.next()) {
			testResult.message_reference = newSessionId;
			testResult.update();
		}
	},

    type: 'ClientTestRunnerAjax'
});