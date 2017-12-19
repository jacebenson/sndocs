function($scope, $location) {
	var c = this;
	addItemsToCategories(c.data.categories, c.data.items);
	function addItemsToCategories(cats, items) {
		cats.forEach(function(cat) {
			cat.items = [];
			items.forEach(function (item) {
				if (item.category != cat.sys_id)
					return; 
				
				cat.items.push(item);
			})
		})
	}
	
	
	/*=============== Begin link handling ===============*/
	$scope.onClick = function($event, item) {
		var lp = getLinkParts(item);
		if (typeof lp == "string")
			return; // can't intercept/redirect external content item

		$event.stopPropagation();
		$event.preventDefault();
		var evt = {item: item, search: lp};

		// This will let a wrapper widget intercept and redirect somewhere else
		$scope.$emit($scope.options.click_event_name, evt);
	};

	function getLinkParts(item) {
		if (item.sys_class_name == 'sc_cat_item_content' && item.content_type == 'external')
			return item.url;

		return {id: item.page, sys_id: item.sys_id};
	}

	$scope.getItemHREF = function(item) {
		var lp = getLinkParts(item);
		if (typeof lp == "string")
			return lp;

		return "?id=" + lp.id + "&sys_id=" + lp.sys_id;
	}

	var unregister = $rootScope.$on($scope.options.click_event_name, function($event, o) {
		if ("url" in o)
			$location.href = o.url;
		else
			$location.search(o.search);
	});

	$scope.$on("$destroy", function() {
		unregister();
	});
	/*=============== End link handling ===============*/
	
}