var TestPOP3ConnectionWorker = Class.create();

TestPOP3ConnectionWorker.prototype = {
	initialize : function() {
		this.outputSummary = "";
	},

	process: function(account_id) {
		if (!account_id) {
			this._setError("Attempt to connect failed. No account was specified.");
			return;
		}

		var pop3Account = new GlideRecord("sys_email_account");
		if (!pop3Account.get(account_id)) {
			this._setError("Attempt to connect failed. Invalid account was specified.");
			return;
		}

		worker.setProgressState("running");
		this._addMessage("Testing " + pop3Account.getValue("name"));

		var reader = GlideEmailReader.getEmailReader(pop3Account);

		if (!reader) {
			this._setError("Attempt to connect failed. Unable to retrieve Email Reader for account: " + account_id);
			return;
		}

		this._addMessage("Connecting to message store");
		if (!this._checkStore(reader))
			return;

		this._addMessage("Testing Complete");
		worker.setProgressState("complete");
		worker.setOutputSummary(this.outputSummary);
	},

	_checkStore: function(p) {
		var store = p.getStore();
		if (store === null) {
			this._setError("Connection failed");
			return false;
		}
		var isConnected = store.isConnected();
		if (!isConnected) {
			this._setError("Connection failed");
			return false;
		}
		this._addMessage("- Connected to message store");
		this._addMessage("Getting folder INBOX");
		var folder = store.getFolder("INBOX");
		if (folder === null) {
			this._setError("Cannot get INBOX folder");
			return false;
		}
		this._addMessage("- Got folder INBOX");
		folder.open(2); // Folder.READ_WRITE
		if (!folder.isOpen()) {
			this._setError("Cannot open INBOX folder");
			return false;
		}
		store.close();
		var kount = folder.getMessageCount();
		this._addMessage(kount + " message(s) is waiting in the INBOX");
		return true;
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
		sgr.addQuery("name", "glide.pop3.status");
		sgr.query();
		if (sgr.next())
			msg += sgr.value;

		worker.addMessage(msg);
	}
};