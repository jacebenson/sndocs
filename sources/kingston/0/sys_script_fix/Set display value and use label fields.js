var gr = new GlideRecord('sys_export_set');
gr.query();

while (gr.next()){
	gr.setWorkflow(false);
	gr.setUseEngines(false);
	if (gr.format == 'CSV'){
		var csv_display_value = !GlideProperties.getBoolean('glide.export.csv.raw.value', false);
		gr.use_display_value = csv_display_value.toString();
		gr.use_label = "false";
	} else if (gr.format == 'Excel' || gr.format == 'XLSX'){
		gr.use_display_value = "true";
		gr.use_label = "true";
	} else if (gr.format == 'JSON'){
		gr.use_display_value = GlideProperties.get('glide.json.return_displayValue', 'false');
		gr.use_label = "false";
	} else if (gr.format == 'XML'){
		gr.use_display_value = "false";
		gr.use_label = "false";
	}
	gr.update();
}