function ($scope, $timeout){
	var eventNames = {
		setBreadcrumbs: 'widget-filter-breadcrumbs.setBreadcrumbs'
	};

	$scope.adjustFilter = function(breadcrumb, remove){
		var newQuery = remove ? breadcrumb.ifRemoved : breadcrumb.value;
		$scope.$emit('widget-filter-breadcrumbs.queryModified', newQuery);
	}

	$scope.$on(eventNames.setBreadcrumbs, function(e, data, newQuery){
		$scope.data = data;
		$scope.$broadcast("snfilter:initialize_query", massageEncodedQuery(newQuery));
	});

	$scope.clickFilter = function() {
		$scope.showFilter = !$scope.showFilter;
	}

	$scope.showFilter = false;
	$scope.$on("snbreadcrumbs:toggle_filter", function(e) {
		e.stopPropagation();
		e.preventDefault();
		$scope.showFilter = false;
	});

	$scope.$on("snfilter:update_query", function(e, query) {
		e.stopPropagation();
		e.preventDefault();
		$scope.$emit('widget-filter-breadcrumbs.queryModified', massageEncodedQuery(query));
		$scope.showFilter = false;
	});

	function massageEncodedQuery(query) {
		return (query) ? query.replace(/CONTAINS/g, "LIKE").replace(/DOES NOT CONTAIN/g, "NOT LIKE") : query;
	}
}