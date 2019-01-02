(function() {
	if(!input){
		//set instance sys_id to be used as unique id for collapse
		data.instanceid = $sp.getDisplayValue('sys_id');
		options.aggregate_query = options.aggregate_query ? options.aggregate_query == 'true' : false;
		options.alt_url_params = options.alt_url_params || "";
		options.min_scroll_count = options.min_scroll_count ? parseInt(options.min_scroll_count) : 10;

		data.facet_depth = parseInt(gs.getProperty('glide.knowman.search.facet_depth') || 300);
	}else{
		if(input){
			var result = {};
			var facetService = new KBPortalService();
			result = facetService.getFacetByName(
				input.name,
				input.value,
				input.keyword,
				input.language,
				input.variables,
				input.query,
				input.order
			);
			data.result = new global.JSON().decode(result+"");
		}
	}
})();