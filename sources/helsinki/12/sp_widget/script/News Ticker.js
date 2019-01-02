// populate the 'data' object

/* --Settings-- */
data.interval = 3000;
data.direction = 'up'; // 'up' or 'down'
data.line_height = 56;
data.num_lines = 6;

data.height = (data.line_height - 1) * data.num_lines;
data.sp_page = options.sp_page_dv
data.list = [];

var gr = new GlideRecordSecure(options.table);
if (options.filter)
	gr.addEncodedQuery(options.filter);
if (options.order_direction == "asc")
	gr.orderBy(options.order_by);
else
	gr.orderByDesc(options.order_by);
gr.setLimit(options.maximum_entries);
gr.query();

while (gr.next()) {
	var record = {};
	record.sys_id = gr.sys_id.getDisplayValue();
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
		record.url = "?id="+data.sp_page+"&table="+data.table+"&sys_id="+record.sys_id+"&view=sp";

	data.list.push(record);

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