(function(){
	data.pickupMsg = gs.getMessage(options.pickup_msg);
	var gr = $sp.getRecord();
	if (gr == null)
		return;
	
	data.canRead = gr.canRead();
	if (!data.canRead) 
		return;

	var agent = "";
	var a = $sp.getField(gr, 'assigned_to');
	if (a != null)
		agent = a.display_value;

	var fields = $sp.getFields(gr, 'number,state,priority,sys_created_on');
	if (gr.getValue("sys_mod_count") > 0)
		fields.push($sp.getField(gr, 'sys_updated_on'));

	if (gr.getValue('price') > 0)
		fields.push($sp.getField(gr, 'price'));
	
	if (gr.getValue('recurring_price') > 0) {
		var rp = $sp.getField(gr, 'recurring_price');
		if (gr.isValidField("recurring_price"))
			rp.display_value = rp.display_value + " " + gr.getDisplayValue("recurring_frequency");
		fields.push(rp);
	}

	data.tableLabel = gr.getLabel();
	data.fields = fields;
	data.variables = $sp.getVariablesArray();
	data.agent = agent;
	data.agentPossible = gr.isValidField("assigned_to");
	data.table = gr.getTableName();
	data.sys_id = gr.getUniqueValue();
})()

