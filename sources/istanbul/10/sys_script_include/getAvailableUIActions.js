// policyTableName is the name of the table the UI Policy
// applies to
function getAvailableUIActions(tableName, type, formType) {
	var uiActionIDs = [];
	var gr = new GlideRecord('sys_ui_action');
	
	var queryString = "";
	if (type == "form" && formType != "related_list") {
		queryString = "tableSTARTSWITH"+ tableName + "^ORtable=global^form_action=true^active=true^form_button=true";
	}
	else if (type == "form" && formType == "related_list") {
		queryString = "tableSTARTSWITH"+ tableName + "^ORtable=global^list_action=true^list_banner_button=true";
	}
	else if (type == "list") {
		queryString = "tableSTARTSWITH"+ tableName + "^ORtable=global^list_action=true^list_banner_button=true";
	}
	
	gr.addEncodedQuery(queryString);
	gr.query();
	while (gr.next()) {
		uiActionIDs.push(gr.sys_id.toString());

	}

	return uiActionIDs;
}