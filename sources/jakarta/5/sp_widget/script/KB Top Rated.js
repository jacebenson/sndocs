(function() {
	data.articles = [];
	options.title = options.title || gs.getMessage("Top Rated Articles");
	var z = $sp.getKBRecord();
	z.addQuery("rating", ">", "0");
	if (options.kb_category)
		z.addQuery("kb_category", options.kb_category);
	z.orderByDesc('rating');
	z.setLimit(options.max_number || 5);
	z.query();
	while (z.next()) {
		if (!z.canRead())
			continue;

		var a = {};
		$sp.getRecordValues(a, z, 'short_description,sys_view_count,sys_id,published,rating');
		a.published_display = z.getDisplayValue("published");
		data.articles.push(a);
	}
})()
