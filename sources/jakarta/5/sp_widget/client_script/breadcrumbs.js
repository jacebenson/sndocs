function($scope, $rootScope) {
	var c = this;
	var deregister = $rootScope.$on("sp.update.breadcrumbs", function(e, list) {
		c.breadcrumbs = list;
	});
	
	$scope.$on('$destroy', function(){ 
		deregister();
	});
}