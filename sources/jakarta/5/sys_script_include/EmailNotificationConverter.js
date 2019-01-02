var EmailNotificationConverter = Class.create();
EmailNotificationConverter.prototype =  Object.extendsObject(AbstractAjaxProcessor,{
	
	mail_script_start_tag : "<mail_script>",
	mail_script_end_tag : "</mail_script>",
	mail_script_counter : 1,
	mail_script_start_tag_escaped : "&lt;mail_script&gt;",
	mail_script_end_tag_escaped : "&lt;/mail_script&gt;",
	record : null,
	
	convertNotificationToVersion2 : function(gr) {
		this.record = gr;
		this.moveTableScripts();
		this.fixNotification();
		this.record.sys_version = 2;
		this.record.update();
		return this.getParameter("sysparm_sys_id");
	},
	
	convertNotificationToVersion1 : function(gr) {
		this.record = gr;
		this.record.sys_version = 1;
		this.record.update();
	},
	
	convertTemplateToVersion2 : function(gr) {
		this.record = gr;
		this.moveTableScripts();
		this.fixTemplate();
		this.record.sys_version = 2;
		this.record.update();
	},
	
	convertTemplateToVersion1 : function(gr) {
		this.record = gr;
		this.record.sys_version = 1;
		this.record.update();
	},
	
	moveEscapedMailScripts: function() {
		return this.moveMailScript(this.getParameter("sysparm_message_html") + "", this.getParameter("sysparm_table_name"), this.mail_script_start_tag_escaped, this.mail_script_end_tag_escaped, true);
	},
	
	
	moveTableScripts : function moveTableScripts(table) {
		if (JSUtil.nil(this.record.message))
			return;
		
		if (JSUtil.nil(this.record.message) || this.record.message.startsWith("BEGIN:VCALENDAR"))
			return;
		
		this.mail_script_counter = 1;

		if (JSUtil.nil(this.record.message_html)) {
			this.record.message_html = this.record.message;
			this.record.message_html = this.moveMailScript(this.record.message_html, this.record.name, this.mail_script_start_tag, this.mail_script_end_tag, false);
		}
		
	},
	
	moveMailScript : function(message_html, name, mail_script_start_tag, mail_script_end_tag, isEscaped) {
		var text = message_html;
		var mailScriptStartIndex = text.indexOf(mail_script_start_tag);
		var mailScriptEndIndex = text.indexOf(mail_script_end_tag);
		if (mailScriptStartIndex == -1 || mailScriptEndIndex == -1)
			return text;
		
		var mailScript = text.substring(mailScriptStartIndex, mailScriptEndIndex + mail_script_end_tag.length);
		var tempScriptTag = "${mail_script:" + this._getName(mailScript,name, isEscaped) + "}";
		message_html = text.substring(0,mailScriptStartIndex) + tempScriptTag + text.substring(mailScriptEndIndex + mail_script_end_tag.length);
		return this.moveMailScript(message_html,name, mail_script_start_tag, mail_script_end_tag, isEscaped);
	},
	
	_getName : function(mailScript, recordName, isEscaped) {
		if (isEscaped) {
			mailScript = this._unEscapeMailScript(mailScript + "");	
		}
		var name = this.getOrCreateScript(mailScript, isEscaped);
		if (name)
			return name;
		name = this._getNewScriptName(recordName);
		var script = new GlideRecord("sys_script_email");
		script.name = name;
		script.script = this._getScript(mailScript);
                if (!isEscaped)
		   script.new_lines_to_html = true;
		script.insert();
		return script.name;
	},
	
	_unEscapeMailScript: function(mail_script) {
		var emailUtil = GlideEmailUtil();		
		mail_script = "" + emailUtil.getTextPlainOutbound(mail_script, true).trim();
		return mail_script.replace(/\n\n+/g, "\n");
	},
	
	_getNewScriptName: function(scriptName) {
		var isNew = false;
		var name = "";
		while (!isNew) {
			name = scriptName + "_script_" + this.mail_script_counter++;
			isNew = this._isNewScriptName(name);
		}
		
		return name;
	},
	
	_isNewScriptName: function(name) {
		var scripts = new GlideRecord("sys_script_email");
		scripts.query("name",name);
		if (scripts.next())
			return false;
		
		return true;
	},
	
	getOrCreateScript : function (mailScript, isEscaped) {
		var gr = new GlideRecord("sys_script_email");
		gr.query("script", this._getScript(mailScript));
		if (gr.next())
			return gr.name;
		
		return null;
	},
	
	_getScript : function(mailScript) {
		return mailScript.substring(this.mail_script_start_tag.length, mailScript.length - this.mail_script_end_tag.length).trim();
	},
	
	
	
	fixTemplate : function() {
		if (JSUtil.nil(this.record.message))
			return;
		
		if (this.record.message.startsWith("BEGIN:VCALENDAR"))
			this.record.message_text = this.record.message;
		else
			this.record.message_html = this.textToHTML(this.record.message_html);
		
		
		this.record.update();
	},
	
	fixNotification : function() {
		if (JSUtil.nil(this.record.message))
			return;
		
		this.record.message_html = this.textToHTML(this.record.message_html);
		this.record.update();
	},
	
	textToHTML : function (text) {
		var mailScripts = new Array();
		var scriptFreeText = this.removeMailScript(text, mailScripts);
		var textLines = scriptFreeText.split("\n");
		var html = "";
		for (var i = 0; i < textLines.length; i++)
			html += this.cleanHTML(textLines[i]);
		
		return this.replaceMailScript(html, mailScripts);
	},
	
	removeMailScript : function(text, mailScripts) {
		var mailScriptStartIndex = text.indexOf(this.mail_script_start_tag);
		var mailScriptEndIndex = text.indexOf(this.mail_script_end_tag);
		if (mailScriptStartIndex == -1 || mailScriptEndIndex == -1)
			return text;
		
		var mailScript = text.substring(mailScriptStartIndex, mailScriptEndIndex + mail_script_end_tag.length);
		mailScripts.push(mailScript);
		var tempScriptTag = "$[mail_script_temp:" + mailScripts.length+ "]";
		return this.removeMailScript(text.substring(0,mailScriptStartIndex) + tempScriptTag + text.substring(mailScriptEndIndex + mail_script_end_tag.length), mailScripts);
	},
	
	replaceMailScript : function (text, mailScripts) {
		while (mailScripts.length > 0) {
			var scriptIndex = mailScripts.length;
			var mailScript = mailScripts.pop();
			var tempScriptTag = "$[mail_script_temp:" + scriptIndex + "]";
			var mailScriptIndex = text.indexOf(tempScriptTag);
			text = text.substring(0, mailScriptIndex) + mailScript +text.substring(mailScriptIndex + tempScriptTag.length);
		}
		
		return text;
	},
	
	cleanHTML : function (line) {
		if (line == "<hr/>")
			return "<div><hr/></div>";
		else if (line == "<br/>")
			return "<div> </div>";
		else if (JSUtil.nil(line))
			return  "<div>&nbsp;</div>";
		else {
			line = line.replace(/<hr\/>/g, "<div><hr/></div>");
			line = line.replace(/<br\/><br\/>/g, "<div>&nbsp;</div>");
			line = line.replace(/<br\/>/g, "<div> </div>");
			line = "<div>" + line + "</div>";
		}
		
		return line;
	},
	
	_getRecord : function(table, sys_id) {
		var gr = new GlideRecord(table);
		gr.query("sys_id",sys_id);
		gr.next();
		return gr;
	},
	
	type : 'EmailNotificationConverter'
});