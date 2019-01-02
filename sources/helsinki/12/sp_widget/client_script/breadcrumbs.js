function($scope) {	
	var c = this;			
	$scope.$on("sp.update.breadcrumbs", function(e, list) {		
		c.breadcrumbs = list;
	});
}