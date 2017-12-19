(function() {
	var table = options.table || input.table;
	var query = options.query || input.query;
	data.breadcrumbs = $sp.getFilterBreadcrumbs(table, query, null);
})();