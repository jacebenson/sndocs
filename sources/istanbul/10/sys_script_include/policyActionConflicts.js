policyActionConflicts = function() {
	if (current.active == false)
		return "";
	
	if (current.ui_policy.nil())
		return "";
	
	var gr = new GlideRecord(current.getTableName());
	gr.addNotNullQuery("ui_policy");
	if (current.getTableName() == "sys_ui_policy_action") {
		gr.addQuery("table", current.table);
		gr.addQuery("field", current.field);
	}
	
	if (current.getTableName() == "catalog_ui_policy_action") {
		gr.addQuery("catalog_item", current.catalog_item);
		gr.addQuery("catalog_variable", current.catalog_variable);
	}
	
	if (current.getTableName() == "wf_ui_policy_action" || current.getTableName() == "wf2_ui_policy_action") {
		gr.addQuery("activity_definition", current.activity_definition);
		gr.addQuery("variable", current.variable);
	}
	
	if (current.getTableName() == "expert_ui_policy_action") {
		gr.addQuery("expert", current.expert);
		gr.addQuery("expert_variable", current.expert_variable);
	}
	
	gr.addQuery("ui_policy.active", "true");
	gr.addQuery("ui_policy.order", current.ui_policy.order);
	gr.query();
	if (gr.getRowCount() <= 1)
		return "";
	
	var answer = "";
	while (gr.next()) {
		
		if (answer != "")
			answer += ", ";
		answer += "<a class='web' href='sys_ui_policy.do?sys_id=" + gr.ui_policy.sys_id + "'>";
		if (!gr.ui_policy.short_description.nil())
			answer += gr.ui_policy.short_description;
		else
			answer += "(" + gs.getMessage("empty") + ")";
		answer += "</a>";
	}
	return answer;
}