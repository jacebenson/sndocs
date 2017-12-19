var BadMIDCredentialAfterClone = Class.create();

BadMIDCredentialAfterClone.prototype = {
	
	initialize: function() {
	},
	
	scheduleJobs : function() {
		
		// Delays before execution of BadMIDCredentialAfterClone scripts
		// Job 1:  fifteen minutes from now
		// Job 2:  one hour and fifteen minutes from now
		var DELAY_1_MSEC = (15 * 60 * 1000);
		var DELAY_2_MSEC = DELAY_1_MSEC + (60 * 60 * 1000);
		
		// Determine start dateTime(s) in GMT timezone
		var dateTimeDelay1 = new GlideDateTime();
		var dateTimeDelay2 = new GlideDateTime();
		dateTimeDelay2.setValue(dateTimeDelay1);
		
		dateTimeDelay1.add(DELAY_1_MSEC);
		dateTimeDelay2.add(DELAY_2_MSEC);
		
		// Schedule delay job (fifteen minutes after clone script execution)
		this.scheduleDelayJob(1, dateTimeDelay1, DELAY_1_MSEC);
		
		// Schedule delay job 2 (one hour and fifteen minutes after clone script execution)
		this.scheduleDelayJob(2, dateTimeDelay2, DELAY_2_MSEC);
		
	},
	
	scheduleDelayJob : function(executionSequence, runStartDate, runStartDelayMSec) {
		
		// Create run once auto script job (GMT timezone)
		var scheduledJobGlideRecord = new GlideRecord('sys_trigger');
		
		if (! scheduledJobGlideRecord.isValid()) {
			gs.error("sys_trigger table created GlideRecord is not valid");
			return;
		}
		
		scheduledJobGlideRecord.setValue('name', "BadMIDCredentialAfterClone-" + executionSequence);
		scheduledJobGlideRecord.setValue('trigger_type', '0');
		scheduledJobGlideRecord.setValue('next_action', runStartDate);
		scheduledJobGlideRecord.setValue('script',
		" new BadMIDCredentialAfterClone().logMIDServerIssues(" + runStartDelayMSec + ", " + executionSequence +");");
		
		var result = scheduledJobGlideRecord.insert();
		
		if (result == null)
			gs.error("Unable to create BadMIDCredentialAfterClone job(" + executionSequence);
		else
			gs.log("scheduled [sys_trigger] job: BadMIDCredentialAfterClone-" + executionSequence);
	},
	
	logMIDServerIssues : function(scriptDelayMSec, executionSequence) {
		
		// Determine the current time in milliseconds (GMT timezone)
		// Assumption:  sys_created_on field dates are stored in GMT timezone
		var cloneCleanupDateTime = new GlideDateTime();
		
		// Determine approximate time the clone clean up script ran
		cloneCleanupDateTime.subtract(scriptDelayMSec);
		
		// Determine the set of MID servers defined prior to the clone that are Down
		var ECC_AGENT_TABLE = "ecc_agent";
		var LESS_THAN_OR_EQUAL = "<=";
		var SYS_CREATED_ON_FIELD = "sys_created_on";
		var STATUS_FIELD = "status";
		var STATUS_DOWN = "Down";
		
		var midServersPriorToCloneGlideRecord = new GlideRecord(ECC_AGENT_TABLE);
		midServersPriorToCloneGlideRecord.addQuery(SYS_CREATED_ON_FIELD, LESS_THAN_OR_EQUAL, cloneCleanupDateTime);
		midServersPriorToCloneGlideRecord.addQuery(STATUS_FIELD, STATUS_DOWN);
		midServersPriorToCloneGlideRecord.query();
		
		// Log each MID Server not Up or in the process of Upgrading to the ecc_agent_issue table
		var ECC_AGENT_SOURCE_FIELD_VALUE = "InstanceClone";
		var ECC_AGENT_ISSUE_TABLE = "ecc_agent_issue";
		var LAST_DETECTED = "last_detected";
		var MESSAGE_FIELD = "message";
		var MID_SERVER = "mid_server";
		var SOURCE_FIELD = "source";
		var SYSID_FIELD = "sys_id";
		var USER_NAME_FIELD = "user_name";
		var COL_DOMAIN = "sys_domain";
		var DEFAULT_DOMAIN = "global";
		
		while (midServersPriorToCloneGlideRecord.next()) {

			var midServerSysId = midServersPriorToCloneGlideRecord.getValue(SYSID_FIELD);
			var loggedInUser =  midServersPriorToCloneGlideRecord.getValue(USER_NAME_FIELD);
			var status = midServersPriorToCloneGlideRecord.getValue(STATUS_FIELD);
			var message = "MID Server not operational (status: " + status + "), possibly due to recent clone. Verify credentials for logged in User '" + loggedInUser + "'.";
			var domain = midServersPriorToCloneGlideRecord.getValue(COL_DOMAIN);
			if (gs.nil(domain)) 
				domain = this.DEFAULT_DOMAIN;
			
			var eccAgentIssueGlideRecord = new GlideRecord(ECC_AGENT_ISSUE_TABLE);
			eccAgentIssueGlideRecord.addQuery(MID_SERVER, midServerSysId);
			eccAgentIssueGlideRecord.addQuery(SOURCE_FIELD, ECC_AGENT_SOURCE_FIELD_VALUE);
			eccAgentIssueGlideRecord.query();
			
			// update existing record?
			if (eccAgentIssueGlideRecord.next()) {
				
				// Notate problem still exists by updating the last_refreshed field
				eccAgentIssueGlideRecord.setValue(LAST_DETECTED, new GlideDateTime());
				eccAgentIssueGlideRecord.setValue(MESSAGE_FIELD , message);
				
				// update the domain in case it has changed
				eccAgentIssueGlideRecord.setValue(COL_DOMAIN, domain);
			
				if (eccAgentIssueGlideRecord.update() == null)
					gs.error("Table update failed: " + ECC_AGENT_ISSUE_TABLE);
				
			} else {
				
				eccAgentIssueGlideRecord.setValue(MID_SERVER, midServerSysId);
				eccAgentIssueGlideRecord.setValue(SOURCE_FIELD, ECC_AGENT_SOURCE_FIELD_VALUE);
				eccAgentIssueGlideRecord.setValue(MESSAGE_FIELD , message);
				eccAgentIssueGlideRecord.setValue(LAST_DETECTED, new GlideDateTime());
				eccAgentIssueGlideRecord.setValue(COL_DOMAIN, domain);
				
				if (eccAgentIssueGlideRecord.insert() == null)
					gs.error("Table insert failed: " + ECC_AGENT_ISSUE_TABLE);
				
			}
		} // end while (…) {
			
		gs.log("executed scheduled [sys_trigger] job: BadMIDCredentialAfterClone-" + executionSequence);
			
		},
		
		type: 'BadMIDCredentialAfterClone'
	};