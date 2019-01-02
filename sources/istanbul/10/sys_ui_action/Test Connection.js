function validateConnection() {
	var url = g_form.getValue('url');
	url = url.trim();
	var username = g_form.getValue('username');
	var password = g_form.getValue('password');
	var view = g_form.getValue('sysparm_view');
	var sysid = gel('sys_uniqueValue').value;
	var doEncrypt = g_form.isNewRecord()
		|| g_form.modifiedFields['sys_update_set_source.password'] === true;
	
	var ajax = new GlideAjax("com.glide.update.UpdateSetAjaxProcessor");
	ajax.addParam("sysparm_function", "validateConnection");
	ajax.addParam("sysparm_url", url);
	ajax.addParam("sysparm_username", username);
	ajax.addParam("sysparm_password", password);
	ajax.addParam("sysparm_sysid",sysid);
	ajax.addParam("sysparm_do_encrypt", doEncrypt);
	ajax.addParam("ni.nolog.sysparm_password", "true");
	ajax.getXML();
}

