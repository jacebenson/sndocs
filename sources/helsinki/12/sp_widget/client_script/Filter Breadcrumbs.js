function ($scope){
	var eventNames = {
		setBreadcrumbs: 'widget-filter-breadcrumbs.setBreadcrumbs'
	};
	
	$scope.adjustFilter = function(breadcrumb, remove){
		var newQuery = remove ? breadcrumb.ifRemoved : breadcrumb.value;
		$scope.$emit('widget-filter-breadcrumbs.queryModified', newQuery);
	}
	
	$scope.$on(eventNames.setBreadcrumbs, function(e, data){
		$scope.data = data;
	});
}