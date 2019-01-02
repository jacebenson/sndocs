function($scope, $rootScope, spUtil) {
	var c = this;
	c.expanded = !spUtil.isMobile();
	c.expand = function() {
		c.expanded = true;
	};

	var deregister = $rootScope.$on("sp.update.breadcrumbs", function(e, list) {
		c.breadcrumbs = list;
	});
	
	$scope.$on('$destroy', function(){ 
		deregister();
	});

}