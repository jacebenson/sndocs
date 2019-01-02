(function() {
	data.list = [];
	data.table = options.table || "kb_knowledge";
	var gr = new GlideRecordSecure(data.table);
	if (gr == null || !gr.isValid())
		return;
	
	/* --Settings-- */
	data.interval = 3000;
	data.direction = 'up'; // 'up' or 'down'
	data.line_height = 56;
	data.num_lines = 6;

	options.title = options.title || gs.getMessage("Ticker");
	options.display_field = options.display_field || gr.getDisplayName();

	data.height = (data.line_height - 1) * data.num_lines;
	data.sp_page = options.sp_page_dv
	
	if (options.filter)
		gr.addEncodedQuery(options.filter);
	if (options.order_direction == "asc")
		gr.orderBy(options.order_by);
	else
		gr.orderByDesc(options.order_by);
	if (options.maximum_entries < 1)
		options.maximum_entries = 5;
	// can't use maximum_entries to limit the query because GlideRecordSecure
	// prunes records the user can't see. If the limit is 5, the user
	// might not be able to see any of those 5, so need to loop 
	// through until we find 5 the user can see. Nonetheless, we don't want
	// anything silly happening here, so hardcode a query limit of 500 records.
	// If that's not enough, improve the options.filter value to be more accurate
	gr.setLimit(500);
	gr.query();

	while (gr.next() && data.list.length < options.maximum_entries) {
		var record = {};
		record.sys_id = gr.getUniqueValue();
		if (options.image_field) {
			record.image_field = gr.getDisplayValue(options.image_field);
			if (!record.image_field)
				record.image_field = "/noimage.pngx";
		}

		if (options.display_field)
			record.display_field = gr.getDisplayValue(options.display_field);

		options.secondary_fields = options.secondary_fields || "";
		options.secondary_fields = options.secondary_fields.split(",");

		record.secondary_fields = [];
		if (options.secondary_fields) {
			options.secondary_fields.forEach(function(f) {
				record.secondary_fields.push(getField(gr, f));
			});
		}

		record.url = "";
		if (data.sp_page)
			record.url = "?id=" + data.sp_page + "&table=" + data.table + "&sys_id=" + record.sys_id + "&view=sp";

		data.list.push(record);
	}
})();

function getField(gr, name) {
	var f = {};
	f.display_value = gr.getDisplayValue(name);
	f.value = gr.getValue(name);
	var ge = gr.getElement(name);
	f.type = ge.getED().getInternalType()
	f.label = ge.getLabel();
	return f;
}