var gFormAlreadySubmitted = false;
function onSubmit() {
    if (gFormAlreadySubmitted)
       return true;
	
	var message_html = g_form.getValue("message_html");
	if (message_html.indexOf("&amp;lt;mail_script&amp;gt;") != -1 && message_html.indexOf("&amp;lt;/mail_script&amp;gt;") != -1) {
		showMailScriptDialog();
		return false;
	}
  
	return true;   
}

function showMailScriptDialog() {
    var dialog = new GlideDialogWindow('glide_ask_standard');
    dialog.setTitle(new GwtMessage().getMessage('Invalid Mail Script'));
    dialog.setPreference('warning', true);
    dialog.setPreference('title', new GwtMessage().getMessage('Mail Script entered directly into Message HTML will not run.'
											 + " Do you want us to fix your Mail Scripts by moving them to Notification Scripts?"));
    dialog.setPreference('onPromptComplete',  confirm.bind(this));
    dialog.setPreference('onPromptCancel', save.bind(this));
    dialog.render(); 
}

function confirm() {
	var sysId = gel('sys_uniqueValue').value;
	var ga = new GlideAjax('EmailNotificationConverter');
	ga.addParam('sysparm_name', 'moveEscapedMailScripts');
	ga.addParam('sysparm_table_name', g_form.getValue("collection"));
	ga.addParam('sysparm_message_html', g_form.getValue("message_html"));
	ga.getXMLAnswer(callback);
}

function save() {
    gFormAlreadySubmitted = true;
    if(g_form.getActionName() == 'sysverb_update_and_stay')
        g_form.save();
    else
        g_form.submit();
}

function callback(answer) {
  g_form.setValue("message_html",answer);
  save();
}
