function ($filter, $location) {
	var c = this;
	c.options.glyph = c.options.glyph || 'search';
	c.options.title = c.options.title || c.data.searchMsg;

	c.onSelect = function($item, $model, $label) {
		if ($item.target)
			window.open($item.url, $item.target);
		else
			$location.url($item.url);

		/*if ($item.type == "sc")
			$location.search({id: 'sc_cat_item', sys_id: $item.sys_id});
		if ($item.type == "sc_content") {
			if ($item.content_type == "kb")
				$location.search({id: 'kb_article', sys_id: $item.kb_article});
			else if ($item.content_type == "external")
				window.open($item.url, '_blank');
			else
				$location.search({id: 'sc_cat_item', sys_id: $item.sys_id});
		}
		if ($item.type == "sc_guide")
			$location.search({id: 'sc_cat_item_guide', sys_id: $item.sys_id});
		if ($item.type == "kb")
			$location.search({id: 'kb_article', sys_id: $item.sys_id});
		if ($item.type == "qa")
			$location.search({id: 'kb_social_qa_question', question_id: $item.sys_id});
		if ($item.type == "rec")
			$location.search({id: $item.page, sys_id: $item.sys_id, table: $item.table});*/
	};

	c.getResults = function(query) {
		return c.server.get({q: query}).then(function(response) {
			var a = $filter('orderBy')(response.data.results, '-score');
			return $filter('limitTo')(a, c.data.limit);
		});
	}
}