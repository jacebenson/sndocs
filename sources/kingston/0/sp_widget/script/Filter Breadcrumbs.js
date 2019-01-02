(function() {
	var table = options.table || input.table;
	var query = options.query || input.query;
	data.breadcrumbs = $sp.getFilterBreadcrumbs(table, query, null);
	data.enable_filter = input.enable_filter || options.enable_filter == true || options.enable_filter == "true";

	if (data.enable_filter)
		data.filterWidget = $sp.getWidget('sn-desktop-filter', {
			table: table
		});

})();