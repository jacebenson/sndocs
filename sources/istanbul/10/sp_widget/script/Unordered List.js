(function() {
	if (!options.table)
		return;
	
	data.sp_page = $sp.getDisplayValue('sp_page'); // gets the page's ID
	var gr = new GlideRecordSecure(options.table); 
	if (options.filter)
		gr.addEncodedQuery(options.filter);

	if (options.order_direction == "asc")
		gr.orderBy(options.order_by);
	else
		gr.orderByDesc(options.order_by);

	gr.setLimit(options.maximum_entries);
	gr.query();
	data.list = [];
	while (gr.next()) {
		var record = {};
		record.sys_id = gr.getValue('sys_id');
		if (options.display_field)
			record.display_field = gr.getDisplayValue(options.display_field);

		if (data.sp_page)
			record.url = "?id=" + data.sp_page + "&table=" + options.table + "&sys_id=" + record.sys_id + "&view=sp";
		else
			record.url = "";

		data.list.push(record);
	}
})()