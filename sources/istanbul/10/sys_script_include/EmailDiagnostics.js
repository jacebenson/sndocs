var EmailDiagnostics = Class.create();

EmailDiagnostics.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	checkSMTP: function() {
		var smtp_id = this._getSMTPAccountID();
		var worker = new GlideScriptedProgressWorker();
		if (smtp_id)
			worker.addParameter(smtp_id);
		worker.setProgressName("Testing SMTP connection");
		worker.setName('TestSMTPConnectionWorker');
		worker.setBackground(true);
		worker.start();

		return worker.getProgressID() + "," + smtp_id;
	},

	checkPOP3: function() {
		var id = this.getParameter("sysparm_id");
		if(!this._isValidAccountId(id)) {
			gs.log('Missing or invalid account ID', 'EmailDiagnostics');
			return;
		}
		var progressName = "Testing POP3 connection";
		var name =  'TestPOP3ConnectionWorker';
		if (this._getInboundEmailType(id) == "imap") {
			progressName = "Testing IMAP connection";
			name = "TestIMAPConnectionWorker";
		}
		var worker = new GlideScriptedProgressWorker();
		worker.setProgressName(progressName);
		worker.setName(name);
		if (id)
			worker.addParameter(id);
		worker.setBackground(true);
		worker.start();

		return worker.getProgressID() + "," + this.getParameter("sysparm_id");
	},

	_getInboundEmailType: function(id) {
		var gr = new GlideRecord("sys_email_account");
		if (!gr.isValid())
			return "";

		gr.addQuery("sys_id", id);
		gr.query();
		if (gr.next())
			return gr.type;

		return "";
	},

	_getSMTPAccountID: function() {
		var gr = new GlideRecord("sys_email_account");
		if (!gr.isValid())
			return null;

		gr.addQuery("active",true);
		gr.addQuery("type","SMTP");
		gr.query();
		if (!gr.next())
			return null;

		return gr.sys_id;
	},

	initOutcome: function() {
		this.outcome = {
			sent_today: false,
			received_today: false,
			email_accounts: [],
			properties: {},
			status: {
				pop3_message: '',
				pop3_connected: false,
				smtp_message: '',
				smtp_connected: false
			}
		};
	},

	getConfig: function () {
		this.outcome.properties = this._getDefaultProperties();
	},

	_getDefaultProperties: function () {
		var baseProperties = {
			enable_sending: this._getTypedProperty('glide.email.smtp.active', false),
			enable_receiving: this._getTypedProperty('glide.email.read.active', false),
			test_email_account: this._getTypedProperty('glide.email.test.user', '')
		};
		return baseProperties;
	},

	_getTypedProperty: function (inProp, inDef) {
		var prop = gs.getProperty(inProp, inDef);
		if (prop.toLowerCase() == "true") {
			return true;
		}
		if (prop.toLowerCase() == "false") {
			return false;
		}
		return prop;
	},

	_encodeGR: function (gr) {
		var recordObjectified = {}, i, value;
		for (i in gr) {
			if (gr.hasOwnProperty(i)) {
				value = gr[i].toString();
				switch (typeof value) {
					case "undefined":
					case "function":
					case "unknown":
						break;
					default:
						recordObjectified[i] = value;
				}
			}
		}
		return recordObjectified;
	},

	_isValidAccountId: function(accountId) {
		return GlideStringUtil.isEligibleSysID(accountId);
	},
	
	getDiagnostics:function() {
		this.lastSent = this.getLastEmail('sent').sys_updated_on;
		this.lastReceived = this.getLastEmail('received').sys_updated_on;
		this.sendingEnabled = this._getTypedProperty('glide.email.smtp.active', false);
		this.receivingEnabled = this._getTypedProperty('glide.email.read.active', false);
		this.sendReadyCount = this.getEmailCount("send-ready");
		var smtpSender = this.getTrigger("d8e37da5c0a80064009ff6d19882218a");
		this.smtpSenderLastRun = smtpSender.sys_updated_on;
		this.smtpSenderDuration = smtpSender.processing_duration;
		this.smtpSenderState = smtpSender.getDisplayValue("state");
		var pop3Reader = this.getTrigger("93778f4bc6112286010794d4f52d90ec");
		this.pop3ReaderLastRun = pop3Reader.sys_updated_on;
		this.pop3ReaderDuration = pop3Reader.processing_duration;
		this.pop3ReaderState = pop3Reader.getDisplayValue("state");
		var emailReader = this.getTrigger("52fb24f70a0005fc008b6be3853ca58c");
		this.emailReaderLastRun = emailReader.sys_updated_on;
		this.emailReaderDuration = emailReader.processing_duration;
		this.emailReaderState = emailReader.getDisplayValue("state");
		var smsSender = this.getTrigger("90f73fab0a0a0b130078bef17cd2809f");
		this.smsSenderLastRun = smsSender.sys_updated_on;
		this.smsSenderDuration = smsSender.processing_duration;
		this.smsSenderState = smsSender.getDisplayValue("state");

		this.getSMTPSenderStates();
		this.getSMSSenderStates();
	},

	getTrigger: function(job_id) {
		var gr = new GlideRecord("sys_trigger");
		gr.query("job_id",job_id);
		gr.next();
		return gr;
	},

	getSMTPSenderStates: function() {
		var gr = new GlideRecord("sys_trigger");
		gr.query("job_id","d8e37da5c0a80064009ff6d19882218a");
		var index = 0;
		this.smtpJobs = [];
		while (gr.next()) {
			var job = {};
			job.lastRun = gr.sys_updated_on;
			job.duration = gr.processing_duration + "";
			job.state = gr.getDisplayValue("state");
			job.id = gr.getUniqueValue();
			this.smtpJobs[index] = job;
			index++;
		}
	},

	getSMSSenderStates: function() {
		var gr = new GlideRecord("sys_trigger");
		gr.query("job_id","90f73fab0a0a0b130078bef17cd2809f");
		var index = 0;
		this.smsJobs = [];
		while(gr.next()) {
			var job = {};
			job.lastRun = gr.sys_updated_on;
			job.duration = gr.processing_duration + "";
			job.state = gr.getDisplayValue("state");
			job.id = gr.getUniqueValue();
			this.smsJobs[index] = job;
			index++;

		}

	},

	getLastEmail:function(type) {
		var email = new GlideRecord("sys_email");
		email.addQuery("type",type);
		email.addQuery("sys_created_on", ">", gs.hoursAgo(24));
		email.orderByDesc("sys_updated_on");
		email.setLimit(1);
		email.query();
		email.next();
		return email;
	},

	getOldestEmail: function(type) {
		var email = new GlideRecord("sys_email");
		email.addQuery("type",type);
		email.orderBy("sys_updated_on");
		email.setLimit(1);
		email.query();
		email.next();
		return email;
	},

	getEmailCount: function(type) {
		var emailAgg = new GlideAggregate("sys_email");
		emailAgg.addQuery("type",type);
		emailAgg.addQuery("sys_created_on", ">", gs.hoursAgo(48));
		emailAgg.addAggregate("COUNT","sys_created_on");
		emailAgg.query();
		if (!emailAgg.next())
			return 0;

		return parseInt(emailAgg.getAggregate("COUNT", "sys_created_on"));
	},


	type: 'EmailDiagnostics'
});