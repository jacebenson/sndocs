var EmailAccountsMigrator = Class.create();

EmailAccountsMigrator.prototype = {

	migrateEmailProperties: function() {
		this.migratePOP3Server();
		this.migrateSMTPServer();
		this.migrateIMAPServer();
	},

	migratePOP3Server: function() {
		var gr = new GlideRecord("sys_email_account");
		var name = this.getName("POP3");
		gr.addQuery("name", name);
		gr.query();
		if (gr.next()) {
			return;
		}

		var pop3Server = gs.getProperty("glide.pop3.server");

		if (!pop3Server) { //Without a server, reprovisioning cannot determine ServiceNow account
			return;
		}

		gr.initialize();
		gr.name = name;
		gr.type = "pop3";
		gr.servicenow_configured = "false";
		gr.authentication = "password";
		gr.active = "true";

		if (pop3Server) {
			gr.server = pop3Server;
		}

		var pop3Port = gs.getProperty("glide.pop3.port");
		if (pop3Port)
			gr.port = pop3Port;
		else
			gr.port = 110;



		var pop3User = gs.getProperty("glide.pop3.user");
		if (pop3User) {
			gr.user_name = pop3User;
		}

		var ec;
		var userPassword = gs.getProperty("glide.email.user_password");
		if (userPassword) {
			ec = new GlideEncrypter();
			gr.password = ec.encrypt(userPassword);
		}

		var pop3Password = gs.getProperty("glide.pop3.password");
		if (pop3Password) {
			ec = new GlideEncrypter();
			gr.password = ec.encrypt(pop3Password);
		}

		var pop3tls = gs.getProperty("glide.pop3.tls");
		if (pop3tls == "true") {
			gr.enable_tls = "true";
		}

		var pop3secure = gs.getProperty("glide.pop3.secure");
		if (pop3secure == "true") {
			gr.enable_ssl = "true";
		}

		gs.log("created '" + name + "' account");
		return gr.insert();
	},

	migrateSMTPServer: function() {
		var gr = new GlideRecord("sys_email_account");
		var name = this.getName("SMTP");
		gr.addQuery("name", name);
		gr.query();
		if (gr.next()) {
			gs.log(name + " already exists, will not migrate SMTP Server");
			return;
		}

		var emailServer = gs.getProperty("glide.email.server");
		// Without a server, reprovisioning cannot determine ServiceNow account
		if (!emailServer) { 
			gs.log("glide.email.server property not found, not migrating SMTP Server");
			return;
		}

		gr.initialize();
		gr.name = name;
		gr.type = "smtp";
		gr.servicenow_configured = "false";
		gr.server = emailServer;
		gr.active = "true";

		var smtpAuth = gs.getProperty("glide.smtp.auth");
		if (smtpAuth == "true") {
			gr.authentication = "password";
		} else {
			gr.authentication = "NULL";
		}

		var emailUserName = gs.getProperty("glide.email.username");
		if (emailUserName) {
			gr.email_user_label = emailUserName;
		}

		var smptPort = gs.getProperty("glide.smtp.port");
		if (smptPort)
			gr.port = smptPort;
		else
			gr.port = 25;


		var emailUser = gs.getProperty("glide.email.user");
		if (emailUser) {
			gr.user_name = emailUser;
			gr.from = emailUser;
		}

		var userPassword = gs.getProperty("glide.email.user_password");
		if (userPassword) {
			var ec = new GlideEncrypter();
			gr.password = ec.encrypt(userPassword);
		}

		var smtpEncryption = gs.getProperty("glide.smtp.encryption");
		if ( smtpEncryption !== null) {
			if (smtpEncryption == "TLS")
				gr.enable_tls = "true";
			else if (smtpEncryption == "SSL")
				gr.enable_ssl = "true";
		} else {
			var smtpTls = gs.getProperty("glide.smtp.tls");
			if (smtpTls == "true")
				gr.enable_tls = "true";
			else {
				var smtpSsl = gs.getProperty("glide.smtp.ssl");
				if (smtpSsl == "true")
					gr.enable_ssl = "true";
			}
		}

		gs.log("created '" + name + "' account");
		return gr.insert();
	},

	migrateIMAPServer: function() {
		var gr = new GlideRecord("sys_email_account");
		var name = this.getName("IMAP");
		gr.addQuery("name", name);
		gr.query();
		if (gr.next()) {
			return;
		}

		var imapServer = gs.getProperty("glide.imap.server");

		if (!imapServer) { // Without a server, reprovisioning cannot determine ServiceNow account
			return;
		}

		gr.initialize();
		gr.name = name;
		gr.type = "imap";
		gr.servicenow_configured = "false";
		gr.authentication = "password";
		gr.active = "true";

		if (imapServer) {
			gr.server = imapServer;
		}

		var imapPort = gs.getProperty("glide.imap.port");
		if (imapPort)
			gr.port = imapPort;
		else
			gr.port = 143;



		var imapUser = gs.getProperty("glide.imap.user");
		if (imapUser) {
			gr.user_name = imapUser;
		}

		var ec;
		var userPassword = gs.getProperty("glide.email.user_password");
		if (userPassword) {
			ec = new GlideEncrypter();
			gr.password = ec.encrypt(userPassword);
		}

		var imapPassword = gs.getProperty("glide.imap.password");
		if (imapPassword) {
			ec = new GlideEncrypter();
			gr.password = ec.encrypt(imapPassword);
		}

		var imaptls = gs.getProperty("glide.imap.tls");
		if (imaptls == "true") {
			gr.enable_tls = "true";
		}

		var imapsecure = gs.getProperty("glide.imap.secure");
		if (imapsecure == "true") {
			gr.enable_ssl = "true";
		}

		gs.log("created '" + name + "' account");
		return gr.insert();
	},

	getName: function(protocol) {
		var prefix = gs.getProperty("instance_name", "Default");
		return prefix + " " + protocol;
	},

	type: "EmailAccountsMigrator"
};