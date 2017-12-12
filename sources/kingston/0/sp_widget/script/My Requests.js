(function() {
	if (!options.maximum_entries)
		options.maximum_entries = 20;
	var gr = new GlideRecordSecure('sc_request'); // does ACL checking for us
	gr.addActiveQuery();
	options.title = options.title || gr.getPlural();
	data.display_field = 'sys_created_on';
	data.secondary_fields = ['number','sys_updated_on'];
	data.filterMsg = gs.getMessage("Filter...");

	gr.addEncodedQuery('requested_for=javascript:gs.getUserID()');
	gr.orderByDesc('sys_created_on');
	gr.query();
	data.count = gr.getRowCount();
	data.list = [];
	var recordIdx = 0;
	while (gr.next()) {
		if (recordIdx == options.maximum_entries)
			break;

		var record = {};
		record.sys_id = gr.getValue('sys_id');
		var ritm = new GlideRecord("sc_req_item");
		ritm.addQuery("request", gr.getUniqueValue());
		ritm.query();
		if (ritm.getRowCount() == 0)
			continue;

		if (ritm.getRowCount() > 1)
			record.display_field = gs.getMessage("{0} requested items", ritm.getRowCount());
		else {
			ritm.next();
			record.display_field = ritm.cat_item.getDisplayValue() || ritm.getDisplayValue("short_description");
		}

		record.secondary_fields = [];
		data.secondary_fields.forEach(function(f) {
			record.secondary_fields.push(getField(gr, f));
		});

		record.url = {id: 'sc_request', table: 'sc_request', sys_id: record.sys_id};
		data.list.push(record);
		recordIdx++;
	}

	function getField(gr, name) {
		var f = {};
		f.display_value = gr.getDisplayValue(name);
		f.value = gr.getValue(name);
		var ge = gr.getElement(name);
		f.type = ge.getED().getInternalType()
		f.label = ge.getLabel();
		return f;
	}

})()
