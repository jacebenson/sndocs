// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
(function(){
	var sys_id = options.sys_id || input.sys_id;
	var table = options.table || input.table;
	var hideRelatedLists = options.hideRelatedLists || input.hideRelatedLists || false;
	var gr = new GlideRecord(table);
	gr.get(sys_id);

	data.field_list = gr.getDisplayValue('sp_widget.field_list');
	data.option_schema = gr.getDisplayValue('sp_widget.option_schema');
	var j;
	try {
		j = JSON.parse(data.option_schema);
		j.forEach(function(f) {
			if (f.type == "reference") {
				var refGR = new GlideRecord(f.ed.reference);
				f.ed.searchField = refGR.getDisplayName();
			}
		})
	} catch(e1) {
		j = [];
	}
	data.option_schema = JSON.stringify(j);
	data.modalForm = $sp.getWidget('widget-modal', {embeddedWidgetId: 'widget-form', embeddedWidgetOptions: { table: table, sys_id: sys_id, hideRelatedLists: hideRelatedLists } });
	data.wp = gr.getValue("widget_parameters");

	// if widget_parameters isn't in field_list, add it so it saves properly
	var schemaLength = 0;
	if (!GlideStringUtil.nil(data.option_schema)) {
		try {
			schemaLength = JSON.parse(data.option_schema).length
		} catch(e) {}
	}
	if (GlideStringUtil.nil(data.field_list) && schemaLength > 0)
		data.field_list = "widget_parameters";
	if (!GlideStringUtil.nil(data.field_list) && data.field_list.indexOf("widget_parameters") == -1)
		data.field_list += ",widget_parameters";

})()