function popupSubscriptionHistoryList() {
	
	var popupTitle = g_scratchpad.viewSubscriptionHistory;
	
	//Initialize the GlideDialogWindow
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var gdw = new dialogClass("sub_mgmt_audit_log_template");
	
    gdw.setTitle(popupTitle);
	gdw.setSize(650);
    gdw.setPreference('sysparm_table_name', 'license_details_audit_log');
    gdw.setPreference('sysparm_view', 'lic_audit_popup_view');
 
    //Set the table to display
    var licRefId = g_form.getUniqueValue();
	var query = "license=" + licRefId + "^ORDERBYDESCtime_stamp";
    gdw.setPreference('sysparm_query', query);
	
    //Open the dialog window
    gdw.render();
}