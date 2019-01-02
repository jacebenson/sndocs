function getAvailableAttributes() {
	var query = '';
	
	if (current.schema.internal_type == 'collection')
		query += 'applies_to!=COLUMN'; //Can be either TABLE or BOTH
	else {
		query += 'applies_to!=TABLE';  //Can be either COLUMN or BOTH
		query += '^column_typeISEMPTY^ORcolumn_type=' + getFieldClassRecord(current.schema.internal_type);
		query += '^on_tableISEMPTY^ORon_table=' + getTableRecord(current.schema.name);
		query += '^column_on_tableISEMPTY^ORcolumn_on_table=' + current.schema.sys_id;
	}
	
	return query;
}

function getFieldClassRecord(name) {
	var gr = new GlideRecord('sys_glide_object');
	gr.get('name', name);
	return gr.sys_id.toString();
}

function getTableRecord(name) {
	var gr = new GlideRecord('sys_db_object');
	gr.get('name', name);
	return gr.sys_id.toString();
}