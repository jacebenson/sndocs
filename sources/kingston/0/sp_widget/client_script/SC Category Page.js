function ($scope, spUtil, $rootScope, $location, $timeout, $window) {
	$scope.hideItemWidget = !$scope.data.category_id;
	if ($scope.data.category) {
		if (!$scope.data.categories)
			$scope.data.categories = [];
		$scope.data.categories.unshift({label: $scope.data.sc_catalog || $scope.page.title, url: '?id=' + $scope.data.sc_catalog_page});
		if ($scope.data.show_popular_item)
			$scope.data.categories.push({label: $scope.data.all_cat_msg, url: '#'});
		else
			$scope.data.categories.push({label: $scope.data.category.title, url: '#'});
	$timeout(function() {
			$rootScope.$broadcast('sp.update.breadcrumbs', $scope.data.categories);
	});
	spUtil.setSearchPage('sc');
	}

	$scope.showCategories =  function() {
		$scope.hideItemWidget = true;
		$rootScope.$broadcast("$sp.service_catelog.show.categories_widget");
	}
	
	var listenerForCatItems = $scope.$on("$sp.service_catelog.show.items_widget", function() {
		$scope.hideItemWidget = false;
	});
	/*=============== Begin link handling ===============*/
	
	$scope.changeView = function (view) {
		spUtil.setPreference('catalog-item-list-view', view)
		$scope.view = view;
	}
	
	spUtil.getPreference('catalog-item-list-view', function(value) {
		$scope.view = value || 'card';
	});
	
	$scope.isTouchDevice = function(){
		return ('ontouchstart' in $window);
	}
	
	$scope.loadMore = function (){
		$scope.data.new_limit = $scope.data.limit + ($scope.options.limit_item || 9);
		$scope.stopLoader =  false;
		$scope.server.update().then(function (){
			$scope.data.limit = $scope.data.new_limit;
			$scope.stopLoader =  true;
		})
	}
	
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

		return {id: item.page, sys_id: item.sys_id, sysparm_category: $scope.data.category_id};
	}

	$scope.getItemHREF = function(item) {
		var lp = getLinkParts(item);
		if (typeof lp == "string")
			return lp;

		return "?id=" + lp.id + "&sys_id=" + lp.sys_id + "&sysparm_category=" + $scope.data.category_id;
	}

	var unregister = $rootScope.$on($scope.options.click_event_name, function($event, o) {
		if ("url" in o)
			$location.href = o.url;
		else
			$location.search(o.search);
	});
	var mlq;
	
	if ($window.matchMedia) {
		mql = $window.matchMedia('screen and (max-width: 768px)');
    mql.addListener(handleMatchMedia);
    handleMatchMedia(mql);
	}
	
	
	function handleMatchMedia(mlq) {
			if (!mql.matches) {
        spUtil.getPreference('catalog-item-list-view', function(value) {
					$scope.view = value || 'card';
					$scope.isMobile = false;
				});
			}
			else {
				$timeout(function() {
					$scope.view = 'card';
					$scope.isMobile = true;
				})
			}
	}

	$scope.$on("$destroy", function() {
		unregister();
		listenerForCatItems();
		if (mql)
			mql.removeListener(handleMatchMedia);
	});
	
	$scope.startItemList = function()  {
		$scope.stopLoader = true;
	}
	/*=============== End link handling ===============*/
}