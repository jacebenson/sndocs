var EmailAccountRequester = Class.create();
EmailAccountRequester.prototype = {

	initialize: function() {
		this.jobName = 'Request ServiceNow Email Accounts';
	},

	/**
	 * This function is intended to be called in a script action.
	 * @param eventParm1 - parm1 value from the system.upgraded event.
	 * @returns sys_id of sys_trigger record.
	 */
	createJob: function(eventParm1) {
		if (!this._isValidEventParm(eventParm1)) {
			gs.log('Skipping ServiceNow Email Account Request: system.upgraded event was not triggered by a zboot or upgrade.', 'EmailAccountRequester');
			return null;
		}

		if (this._shouldSkip())
			return null;

		var runDateTime = new GlideDateTime();

		if (this._isZboot(eventParm1)) {
			var durationSecs = Number(gs.getProperty('glide.email.zboot_to_provision_duration', 3600));
			runDateTime.addSeconds(durationSecs);
		}

		this._removeStaleTriggers();
		return this._createTrigger(runDateTime, 1);
	},

	requestInitialization: function() {
		try {
			if (this._shouldSkip()) {
				this._deleteJob();
				return;
			}

			var instanceId = gs.getProperty('instance_id');
			var authToken = gs.getProperty('glide.ua.downloader.password');

			if (!instanceId || !authToken) {
				gs.log('Provisioning ServiceNow email accounts failed: Invalid request input parameters.', 'EmailAccountRequester');
				this._deleteJob();
				return;
			}

			var s = new sn_ws.SOAPMessageV2('Provision ServiceNow Accounts', 'execute');
			s.setStringParameter('instance_id', instanceId);
			s.setStringParameter('auth_token', authToken);
			s.setRequestHeader('Authorization', 'ProvisionSncAccounts ' + instanceId + ':' + authToken);

			var provisionEndpoint = gs.getProperty('glide.email.provision_endpoint');

			if (provisionEndpoint) {
				s.setEndpoint(provisionEndpoint);
			}

			var response = s.execute();
			var statusCode = response.getStatusCode();
			if (statusCode == '200') {
				gs.log('Request made to provision ServiceNow email accounts successful.', 'EmailAccountRequester');
				this._deleteJob();
			} else if (statusCode == '401') {
				gs.log('Request made to provision ServiceNow email accounts failed: Authentication.', 'EmailAccountRequester');
				this._deleteJob();
			} else {
				if (this._isExecFromJob()) {
					this._retryRequest(statusCode);
				} else {
					gs.log('Request made to provision ServiceNow email accounts failed with status code ' + statusCode + '.', 'EmailAccountRequester');
				}
			}
		} catch (e) {
			gs.log('An error occured requesting initialization of ServiceNow email accounts: ' + e + '.', 'EmailAccountRequester');
			if (this._isExecFromJob()) {
				this._deleteJob();
			}
		}
	},

	_removeStaleTriggers: function() {
		var trigger = new GlideRecord('sys_trigger');
		trigger.addQuery('name', this.jobName);
		trigger.query();
		trigger.deleteMultiple();
	}, 
	
	_createTrigger: function(time, runCount) {
		var durationMilliSecs = Number(gs.getProperty('glide.email.provision_retry_duration', 1800)) * 1000;
		var retryDuration = new GlideDuration(durationMilliSecs);

		var job = new GlideRecord('sys_job');
		job.addQuery('handler_class', 'RunScriptJob');
		job.query();
		if (!job.next()) {
			gs.log('Unable to find a sys_job of type RunScriptJob', 'EmailAccountRequester');
			return;
		}
		if (job.getRowCount() != 1) {
			gs.log('Found multiple sys_jobs of type RunScriptJob', 'EmailAccountRequester');
			return;
		}

		var trigger = new GlideRecord('sys_trigger');
		trigger.name = this.jobName;
		trigger.next_action = time;
		trigger.job_id = job.sys_id.toString();
		trigger.trigger_type = 1; //repeat
		trigger.script = "var requester = new EmailAccountRequester(); requester.requestInitialization();";
		trigger.state = 0; //ready
		trigger.run_count = runCount;
		trigger.repeat = retryDuration;
		return trigger.insert();
	},

	_shouldSkip: function() {

		if (this._isExecFromJob()) {
			var runCount = g_schedule_record.run_count;
			var maxRunCount = Number(gs.getProperty('glide.email.max_provision_attempts', 12));

			if (runCount > maxRunCount) {
				gs.log('Skipping ServiceNow Email Account Request: Run count of ' + runCount + ' exceeded the maximum number of ' + maxRunCount + ' provision attempts.', 'EmailAccountRequester');
				return true;
			}
		}

		var isProd = GlideUtil.isProductionInstance();
		var isDev = GlideProperties.getBoolean('glide.emailaccounts.plugin.indevelopment');
		if (!isProd && !isDev) {
			gs.log('Skipping ServiceNow Email Account Request: Non-production instance.', 'EmailAccountRequester');
			return true;
		}

		//Do the accounts already exist?
		var pop3Account = new GlideRecord('sys_email_account');
		pop3Account.addQuery('type', 'pop3');
		pop3Account.addQuery('servicenow_configured', true);
		pop3Account.query();

		var hasSncPop3 = pop3Account.hasNext();

		var smtpAccount = new GlideRecord('sys_email_account');
		smtpAccount.addQuery('type', 'smtp');
		smtpAccount.addQuery('servicenow_configured', true);
		smtpAccount.query();

		var hasSncSmtp = smtpAccount.hasNext();

		if (hasSncPop3 && hasSncSmtp) {
			gs.log('Skipping ServiceNow Email Account Request: ServiceNow configured email accounts have already been initialized.', 'EmailAccountRequester');
			return true;
		}

		var maxTime = new GlideDateTime();
		var requestAfterZBoot = Number(gs.getProperty('glide.email.zboot_to_provision_duration', 3600));
		maxTime.addSeconds(requestAfterZBoot);

		var trigger = new GlideRecord('sys_trigger');
		trigger.addQuery('name', this.jobName);
		trigger.addQuery('next_action', '<=', maxTime);
		trigger.addQuery('next_action', '>=', new GlideDateTime());

		if (this._isExecFromJob()) {
			trigger.addQuery('sys_id', '!=', g_schedule_record.sys_id);
		}
		trigger.query();

		if (trigger.next()) {
			//If job already exists, give it the priority.
			gs.log('Skipping ServiceNow Email Account Request: Scheduled request already exists.', 'EmailAccountRequester');
			return true;
		}
		return false;
	},

	_retryRequest: function(statusCode) {
		var maxRunCount = Number(gs.getProperty('glide.email.max_provision_attempts', 12));

		var runCount = 1;
		if (this._isExecFromJob()) {
			runCount = g_schedule_record.run_count;
		}

		var retryDuration = Number(gs.getProperty('glide.email.provision_retry_duration', 1800));
		var retryDateTime = new GlideDateTime();
		retryDateTime.addSeconds(retryDuration);

		var failureMsg = 'Request ' + runCount + ' made to provision ServiceNow email accounts failed with status code "' + statusCode + '".';
		failureMsg += ' This was attempt ' + runCount + ' out of a maximum of ' + maxRunCount + ' attempts.';

		if (runCount >= maxRunCount) {
			gs.log(failureMsg, 'EmailAccountRequester');
			this._deleteJob();
			return;
		}

		failureMsg += ' Next attempt is scheduled to be executed at ' + retryDateTime + '.';
		gs.log(failureMsg, 'EmailAccountRequester');
	},

	_isValidEventParm: function(eventParm1) {
		if (!eventParm1)
			return false;

		eventParm1 = eventParm1.toLowerCase();
		var isZboot = this._isZboot(eventParm1);
		var isUpgrade = this._isUpgrade(eventParm1);

		return (isZboot || isUpgrade);
	},

	_isZboot: function(eventParm1) {
		return eventParm1.indexOf('zboot') > -1;
	},

	_isUpgrade: function(eventParm1) {
		return eventParm1.indexOf('upgrade') > -1;
	},

	_deleteJob: function() {
		if (this._isExecFromJob()) {
			g_schedule_record.deleteRecord();
		}
	},

	_isExecFromJob: function() {
		return (typeof g_schedule_record != 'undefined') && g_schedule_record.name == this.jobName;
	},

	type: "EmailAccountRequester"
};