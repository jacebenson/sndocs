(function() {
	var gr = new GlideRecord("sc_req_item"); // does ACL checking for us
	gr.addQuery("request", $sp.getParameter("sys_id"));

	options.secondary_fields = options.secondary_fields || "";
	options.secondary_fields = options.secondary_fields.split(",");

	if (options.order_direction == "asc")
		gr.orderBy(options.order_by);
	else
		gr.orderByDesc(options.order_by);

	if (options.maximum_entries > 0)
		gr.setLimit(options.maximum_entries);
	gr.query();

	data.actions = [];
	data.list = [];
	while (gr.next()) {
		if (!gr.canRead())
			continue;
      
		if (gr.getRowCount() == 1)
			data.conversation_title = gr.request.getDisplayValue() + " - " + gr.getValue("short_description");

		var record = {};

		record.sys_id = gr.sys_id.getDisplayValue();
		if (options.image_field) {
			record.image_field = gr.getDisplayValue(options.image_field);
			if (!record.image_field)
				record.image_field = "/noimage.pngx";
		}
		if (options.display_field)
			record.display_field = gr.getDisplayValue(options.display_field);

		record.secondary_fields = [];
		options.secondary_fields.forEach(function(f) {
			record.secondary_fields.push(getField(gr, f));
		});

		if (options.sp_page_dv)
			record.url = "?id="+options.sp_page_dv+"&table="+options.table+"&sys_id="+record.sys_id+"&view=sp";
		else
			record.url = "";

		record.stage = gr.getValue("stage");

		// get appropriate Stage choices for this requested item
		var cl = new GlideChoiceList();
		GlideController.putGlobal("answer", cl);
		GlideController.putGlobal("current", gr);
		sc_req_item_stageGetChoices();
		
		// de-duplicate if sequential stages are identical
		var cl2 = new GlideChoiceList();
		cl2.add(cl.getChoice(0));
		for (var i = 1; i < cl.getSize(); i++) {
			if (cl.getChoice(i).value != cl.getChoice(i-1).value)
				cl2.add(cl.getChoice(i));
		}
		record.cl = JSON.parse(cl2.toJSON());

		data.list.push(record);
	}

	if (gr.getRowCount() > 1)
		data.conversation_title = gr.request.getDisplayValue() + " - " + gr.getRowCount() + " items";

	function getField(gr, name) {
		var f = {};
		f.display_value = gr.getDisplayValue(name);
		f.value = gr.getValue(name);
		var ge = gr.getElement(name);
		f.type = ge.getED().getInternalType()
		f.label = ge.getLabel();
		return f;
	}

})();