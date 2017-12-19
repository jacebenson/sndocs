// policyTableName is the name of the table the UI Policy
// applies to
function getAvailableFormSections(tableName) {
	var formSectionIds = [];
	var gr = new GlideRecord('sys_ui_form_section');
	var queryString = "sys_ui_form.nameSTARTSWITH" + tableName;
	gr.orderBy('position');
	gr.addEncodedQuery(queryString);
	gr.query();
	
	while (gr.next()) {
		if (gr.position != "0") {
			formSectionIds.push(gr.sys_id.toString());
		}
	}

	return formSectionIds;
}