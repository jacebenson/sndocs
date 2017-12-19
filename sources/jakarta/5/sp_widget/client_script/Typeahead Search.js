function ($filter, $location,spAriaUtil, $window) {
	var c = this;
	c.options.glyph = c.options.glyph || 'search';
	c.options.title = c.options.title || c.data.searchMsg;
	c.options.color = c.options.color || "default";

	c.onSelect = function($item, $model, $label) {
		if ($item.target)
			window.open($item.url, $item.target);
		else
			$location.url($item.url);
	};

	c.getResults = function(query) {
		return c.server.get({q: query}).then(function(response) {
			var a = $filter('orderBy')(response.data.results, '-score');
			var resultCount = $filter('limitTo')(a, c.data.limit).length;
				spAriaUtil.sendLiveMessage(parseInt(resultCount) + " " + 
																	 c.data.resultMsg + " " +
																	 c.data.navigationMsg + 
																	 getNavigationKeys());
			return $filter('limitTo')(a, c.data.limit);
		});
	}

	c.submitSearch = function() {
		if (c.selectedState)
			$location.search({
				id: 'search',
				t: c.data.searchType,
				q: c.selectedState
			});
	}
	
	function getNavigationKeys() {
		if($window.navigator.userAgent.indexOf("Mac OS X") > -1) 
			return '⌘';
		return 'Control';
	}
}