(function() {
	deleteOptions(['table','field_list','filter','order_by', 'order_direction','order']);
	if (input) {
		data.table = input.table;
		data.view = input.view;
	} else {
		data.table = $sp.getParameter('table') || $sp.getParameter('t');
		data.view = $sp.getParameter('view');
	}
	
	if (!data.table) {
		data.invalid_table = true;
		data.table_label = "";
		return;
	}

	var gr = new GlideRecordSecure(data.table);
	if (!gr.isValid()) {
		data.invalid_table = true;
		data.table_label = data.table;
		return;
	}
	
	// page is where the record URLs go
	var sp_page = $sp.getValue('sp_page');
	if (sp_page) {
		var pageGR = new GlideRecord('sp_page');
		pageGR.get(sp_page);
		data.page_id = pageGR.id.getDisplayValue();
	}
	
	// widget parameters
	data.table_label = gr.getLabel();
	data.fields = $sp.getListColumns(data.table, data.view);
	data.title = gr.getPlural();
	copyParameters(data, ['p', 'o', 'd', 'filter']);
	copyParameters(data, ['relationship_id', 'apply_to', 'apply_to_sys_id']);
	data.show_new = true;
	data.show_keywords  = true;
	data.show_breadcrumbs = true;
	data.fromUrl = true;

	data.dataTableWidget = $sp.getWidget('widget-data-table', data);
	
	function copyParameters(to, names) {
		names.forEach(function(name) {
			data[name] = $sp.getParameter(name);
		})
	}
	
	// in case this widget is tied to the wrong instance type 
	function deleteOptions(names) {
		names.forEach(function(name) {
			delete options[name];
		})
	}	
})()