var gr = $sp.getRecord();

if (input && input.op && gr) { 
	gr.state = input.op;
	gr.update();
}

var fields = $sp.getFields(gr, 'state,sys_created_on');

if (gr) {
	if (gr.sys_mod_count > 0)
		fields.push($sp.getField(gr, 'sys_updated_on'));

	data.fields = fields;
	data.state = gr.state.toString();
	data.sys_updated_on = gr.sys_updated_on.toString();
	data.sys_id = gr.getUniqueValue();
	data.table = gr.getTableName();
	data.label = getRecordBeingApproved(gr).getLabel();
}

function getRecordBeingApproved(gr) {
	if (!gr.sysapproval.nil())
		return gr.sysapproval.getRefRecord();

	return gr.document_id.getRefRecord();
}