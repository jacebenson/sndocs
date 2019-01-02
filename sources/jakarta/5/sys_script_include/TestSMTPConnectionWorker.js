var TestSMTPConnectionWorker = Class.create();

TestSMTPConnectionWorker.prototype = {
	initialize : function() {
		this.outputSummary = "";
	},

	process: function(account_id) {
		if (!account_id) {
			this._setError("Attempt to connect failed. No account was specified.");
			return;
		}

		var account = new GlideRecord("sys_email_account");
		if (!account.get(account_id)) {
			this._setError("Attempt to connect failed. Invalid account was specified.");
			return;
		}

		worker.setProgressState("running");
		worker.addMessage("Testing " + account.name);

		var p = GlideEmailSender.getEmailSender(account);
		if (!p.isConnectionValid()) {
			this._setError("Email sender connection invalid.");
			return;
		}

		worker.addMessage("Testing complete");
		worker.setProgressState("complete");

		worker.setOutputSummary(this.outputSummary);
	},

	_addMessage : function (msg) {
		worker.addMessage(msg);
		this.outputSummary += msg + "\n";
	},

	_setError : function (msg) {
		msg += ": ";
		worker.setProgressState("error");
		worker.setProgressStateCode("error");
		var sgr = new GlideRecord("sys_status");
		sgr.addQuery("name", "glide.smtp.status");
		sgr.query();
		if (sgr.next())
			msg += sgr.value;

		worker.addMessage(msg);
	}
};