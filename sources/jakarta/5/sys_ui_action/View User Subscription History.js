function popupUserSubscriptionHistoryList() {
	
	var popupTitle = g_scratchpad.viewUserSubscriptionHistory;
	
	//Initialize the GlideDialogWindow
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var gdw = new dialogClass("sub_mgmt_audit_log_template");
	
    gdw.setTitle(popupTitle);
	gdw.setSize(650);
    gdw.setPreference('sysparm_table_name', 'sys_user_license_audit_log');
    gdw.setPreference('sysparm_view', 'user_lic_audit_popupview');
 
    //Set the table to display
    var licRefId = g_form.getUniqueValue();
	var query = "license=" + licRefId + "^ORDERBYDESCtime_stamp";
    gdw.setPreference('sysparm_query', query);
	
    //Open the dialog window
    gdw.render();
}