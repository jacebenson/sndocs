(function() {
	var gr = $sp.getRecord();
	if (gr == null || !gr.isValid()) {
		data.isValid = false;
		return;
	}
	
	data.isValid = true;
	data.isMine = gr.getValue("approver") == gs.getUserID();
	
	if (!data.isMine && !gr.approver.nil())
		data.approver = gr.approver.getDisplayValue();
	if (input && input.op) { 
		gr.state = input.op;
		gr.update();
	}

	var fields = $sp.getFields(gr, 'state,sys_created_on');

	if (gr.sys_mod_count > 0)
		fields.push($sp.getField(gr, 'sys_updated_on'));

	data.fields = fields;
	data.state = gr.state.toString();
	data.sys_updated_on = gr.sys_updated_on.toString();
	data.sys_id = gr.getUniqueValue();
	data.table = gr.getTableName();
	data.label = getRecordBeingApproved(gr).getLabel();
	data.esignature = {
		username:  gs.getUserName(),
		userSysId: gs.getUserID(),
		e_sig_required: checkESig(gr.getValue("source_table"))
};
	function checkESig(table) {
		var esigRegistryGR = new GlideRecord("e_signature_registry");
		if (!esigRegistryGR.isValid())
			return false;
			
		esigRegistryGR.addQuery("enabled", "true");
		esigRegistryGR.addQuery("table_name", table);
		esigRegistryGR.query();
		return esigRegistryGR.hasNext();
	}
	
	function getRecordBeingApproved(gr) {
		if (!gr.sysapproval.nil())
			return gr.sysapproval.getRefRecord();

		return gr.document_id.getRefRecord();
	}
})();
