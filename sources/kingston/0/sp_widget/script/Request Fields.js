(function() {
	data.isValidRecord = false;
	var gr = $sp.getRecord();
	if (gr == null || !gr.isValid())
		return;

	data.isValidRecord = true;
	var agent = "";
	var a = $sp.getField(gr, 'assigned_to');
	if (a != null)
		agent = a.display_value;

	var fields = $sp.getFields(gr, 'number,state,priority,sys_created_on,price');
	if (gr.getValue("sys_mod_count") > 0)
		fields.push($sp.getField(gr, 'sys_updated_on'));

	var n = gr.getValue('recurring_price');
	if (n > 0)
		fields.push($sp.getField(gr, 'recurring_price'));

	data.tableLabel = gr.getLabel();
	data.fields = fields;
	data.variables = $sp.getVariablesArray();
	data.agent = agent;
	data.agentPossible = gr.isValidField("assigned_to");
	data.table = gr.getTableName();
	data.sys_id = gr.getUniqueValue();
	if (!gr.due_date.nil())
		data.completion = gr.due_date.getGlideObject().getLocalDate().getDisplayValue();
})();