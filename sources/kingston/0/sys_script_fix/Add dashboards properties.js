var properties = [
	{
		'name': 'glide.canvas.grid.widget_performance_threshold',
		'defaultValue': '',
		'type': 'integer',
		'description': 'Maximum number of seconds for a widget to render on a responsive dashboard'
	},
	{
		'name': 'glide.canvas.grid.widget_render_concurrent_max',
		'defaultValue': 3,
		'type': 'integer',
		'description': 'Maximum number of widgets that can render simultaneously on a responsive dashboard'
	},
	{
		'name': 'glide.cms.enable.responsive_grid_layout',
		'defaultValue': true,
		'type': 'boolean',
		'description': 'Enable responsive dashboard'
	},
	{
		'name': 'glide.canvas.grid.widget_cache_ttl',
		'defaultValue': 2,
		'type': 'integer',
		'description': 'Number of minutes that widgets are cached in the browser, for responsive dashboards'
	}
];


properties.forEach(function (property) {
	var gr = new GlideRecord('sys_properties');
	gr.addQuery("name", property.name);
	gr.query();
	if (gr.next()) {
		// This property already exist. So don't add this.
		var description = gr.getValue('description');

		if (!description) {
			gr.setValue('description', property.description);
			gr.update();
			gs.print(gr.getValue('description'));
		}

		return;
	}

	// Property does not exist, so add it with default value.
	gr = new GlideRecord('sys_properties');
	gr.initialize();
	gr.setValue('name', property.name);
	gr.setValue('value', property.defaultValue);
	gr.setValue('type', property.type);
	gr.setValue('description', property.description);
	gr.insert();

// 	gs.print("Inserted new record: " + property.name);
});