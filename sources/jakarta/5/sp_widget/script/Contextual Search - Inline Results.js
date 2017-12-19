(function() {
	data.cxs = {
		session: gs.generateGUID(),
		displayed_on: "record_producer:" + $sp.getParameter("sys_id"),
		config: new sn_cxs.CXSUIConfig().getRPConfig($sp.getParameter("sys_id")),
	    property: {
			show_meta_data: gs.getProperty("com.snc.contextual_search.widget.form.show_meta_data", false) == "true" || false,
			wait_time: parseInt(gs.getProperty("com.snc.contextual_search.wait_time", 500))
		},
		kb_property: {
			show_author: (gs.getProperty("glide.knowman.search.show_author", false) == "true" || false),
			show_article_number: (gs.getProperty("glide.knowman.search.show_article_number", false) == "true" || false),
			show_category: (gs.getProperty("glide.knowman.search.show_category", false) == "true" || false),
			show_relevance: (gs.getProperty("glide.knowman.search.show_relevancy", false) == "true" || false),
			show_last_modified: (gs.getProperty("glide.knowman.search.show_last_modified", false) =="true" || false),
			show_published: (gs.getProperty("glide.knowman.search.show_published", false) == "true" || false),
			show_unpublished: (gs.getProperty("glide.knowman.show_unpublished", false) == "true" || false),
			show_view_count: (gs.getProperty("glide.knowman.search.show_view_count", false) == "true" || false),
			show_rating: (gs.getProperty("glide.knowman.search.show_rating", false) == "true" || false)
		}
	};
	var i18nMsgs = {
		noRating: gs.getMessage("No rating"),
		rating: gs.getMessage("{0} star rating"),
		views: gs.getMessage("{0} views"),
		view: gs.getMessage("{0} view"),
		catalog: {
			order: gs.getMessage("Navigates to {0} catalog page")
		}
	};
	var ariaMsgs = {
		searchCompleted: gs.getMessage("Showing search results"),
		searching: gs.getMessage("Searching for {0}"),
		loadingMoreResults: gs.getMessage("Loading more results"),
		resultsLoaded: gs.getMessage("More results loaded"),
		allResultsLoaded: gs.getMessage("Showing all search results"),
		noMatchingResults: gs.getMessage("No matching results found for {0}"),
		noResultsToDisplay: gs.getMessage("No results to display")
	};
	data.ariaMsgs = ariaMsgs;
	data.i18nMsgs = i18nMsgs;
	data.isA11yEnabled = GlideAccessibility.isEnabled();
})();