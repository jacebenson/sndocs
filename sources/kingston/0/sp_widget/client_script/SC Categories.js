function($scope, $location, $timeout, $window, $document, $rootScope, spUtil) {
	var c = this;
	$scope.hideCategoryWidgetInXS = (c.options.hide_xs == 'true');
	if (c.data.categoryId) {
		if (!$scope.hideCategoryWidgetInXS)
			$scope.hideCategoryWidgetInXS = true;
	} else {
		if ($scope.hideCategoryWidgetInXS)
			$scope.hideCategoryWidgetInXS = false;
	}
	
	spUtil.getPreference('glide.ui.accessibility', function(value) {
		if (value == "true")
			$scope.tabindex = 0;
		else
			$scope.tabindex = -1;
	});

	$scope.displayChildren = function($event, category) {
		$event.stopPropagation();
		category.showChildren = !category.showChildren;
	};
	
	$scope.toggleSubCategories =  function(val) {
		toggleSubCategories(c.data.categoriesList, val);
	};
	
	
	
	function toggleSubCategories(categories, val) {
		categories.forEach(function(category) {
			category.showChildren = val;
			if (category.subcategories && category.subcategories.length > 0) {
				toggleSubCategories(category.subcategories, val);
			}
		});
	}
	
	$scope.loadCompleteList =  function() {
		c.data.getAll = true;
		c.data.loadAllMsg = c.data.pleaseWait;
		c.data.showAll = '';
		c.server.update();
	};
	
	$scope.categorySelected = function(category) {
			$timeout(function() {
				$location.search('sys_id', category.sys_id);
				$location.search('id', c.options.page ||'sc_category');
			});
	};
	var listenerForBrowseCategories = $scope.$on("$sp.service_catelog.show.categories_widget", function() {
		$scope.hideCategoryWidgetInXS = false;
	});
	
	$scope.hideBrowseCategory = function () {
		$scope.hideCategoryWidgetInXS = true;
		$rootScope.$broadcast("$sp.service_catelog.show.items_widget");
	}
	
	$scope.$on("$destroy", function() {
		listenerForBrowseCategories();
	});
}