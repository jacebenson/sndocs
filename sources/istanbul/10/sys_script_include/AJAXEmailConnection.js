var AJAXEmailConnection = Class.create();

AJAXEmailConnection.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    initConnectionTest: function() {
        var accountId = this.getParameter('sysparm_id');

        if (this._isValidAccountId(accountId)) {
            var account = new GlideRecord('sys_email_account');

            if (account.get(accountId)) {
                var type = account.getValue('type');

                if (type === 'pop3') {
                    return this.initPop3Test();
                } else if (type === 'smtp') {
                    return this.initSmtpTest();
                } else if (type === 'imap') {
                    return this.initImapTest();
                }
            } else {
                gs.log('Email account with sys_id ' + accountId + ' does not exist', 'EmailConnectionTest');
            }
        } else {
            gs.log('No account ID provided', 'EmailConnectionTest');
        }

    },
    
	initSmtpTest: function() {
		var accountId = this.getParameter('sysparm_id');

		return this._startProgressWorker("Testing SMTP Connection", "TestSMTPConnectionWorker", accountId);
	},

	initPop3Test: function() {
		var accountId = this.getParameter('sysparm_id');

		return this._startProgressWorker("Testing POP3 connection", "TestPOP3ConnectionWorker", accountId);
	},

	initImapTest: function() {
		var accountId = this.getParameter("sysparm_id");

		return this._startProgressWorker("Testing IMAP connection", "TestIMAPConnectionWorker", accountId);
	},

	checkTestStatus: function() {
		var testId = this.getParameter("sysparm_test_id");
		var accountId = this.getParameter('sysparm_account_id');

		var progressWorker = new GlideRecord('sys_progress_worker');

		var result = this.newItem('result');
		result.setAttribute('test_id', testId);
		result.setAttribute('account_id', accountId);

		if (progressWorker.get(testId)) {
		
		    var state = progressWorker.getValue('state');
            var stateCode = progressWorker.getValue('state_code');
            var msg = progressWorker.getValue('message');
            if (state == 'complete') {
                if (stateCode == 'fail' || stateCode == 'error') {
                    this._logMessage('Email account connection test completed with result: ' + stateCode + ', msg: ' + msg, accountId);
                } else {
                    this._logMessage('Email account connection test completed with result: ' + stateCode, accountId);
                }

            }
			result.setAttribute('state', progressWorker.getValue('state'));
			result.setAttribute('message', progressWorker.getValue('message'));
			result.setAttribute('result', progressWorker.getValue('state_code'));
		} else {
			result.setAttribute('state', 'complete');
			result.setAttribute('message', 'Invalid test ID');
			result.setAttribute('result', 'invalid');
		}
	},

	_startProgressWorker: function(progressName, workerScript, accountId) {
		if(!this._isValidAccountId(accountId)) {
			gs.log('Missing or invalid account ID', 'EmailConnectionTest');
			return;
		}

		if(!gs.hasRole('admin')) {
			gs.log('Unauthorized attempt to run AJAXEmailConnection._startProgressWorker', 'E    mailConnectionTest');
			return;
		}

		var worker = new GlideScriptedProgressWorker();
		worker.setProgressName(progressName);
		worker.setName(workerScript);
		worker.addParameter(accountId);
		worker.setBackground(true);
		worker.start();

		return worker.getProgressID() + "," + accountId;
	},
	
	_logMessage: function(msg, accountId) {
		var account = new GlideRecord('sys_email_account');
		account.get(accountId);

		var logPrefix = '(Account name: ' + account.getValue('name') + ', Type: ' + account.getValue('type') +', sys_id: ' + account.getValue('sys_id') + ')';

		gs.log(logPrefix + ' ' + msg, 'EmailConnectionTest');
	},

	_isValidAccountId: function(accountId) {
		return GlideStringUtil.isEligibleSysID(accountId);
	},

	type: "AJAXEmailConnection"
});