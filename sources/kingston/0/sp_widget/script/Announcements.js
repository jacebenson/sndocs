(function() {
	options.title = options.title || 'Announcements';
	options.max_records = options.max_records ? options.max_records : 20;
	options.paginate = options.paginate === 'true' && options.max_records;

	if (options.view_all_page) {
		var gr = new GlideRecord('sp_page');
		gr.get(options.view_all_page);
		options.view_all_page = gr.getValue('id');
	}

	if (options.type) {
		var types = [];

		options.type.split(',').forEach(function(type) {
			var gr = new GlideRecord('announcement_consumer_type');
			gr.get(type);
			types.push(gr.getDisplayValue('name'));
		});

		options.type = types.join(',');
	}
})();