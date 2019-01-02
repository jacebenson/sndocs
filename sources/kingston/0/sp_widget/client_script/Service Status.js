function ($rootScope, $timeout) {	
	var c = this;		
	var bc = [{label: c.data.systemStatusBreadcrumb, url: '?id=services_status'}];
	if (c.data.serviceDisplay) 
		bc[bc.length] = {label: c.data.serviceDisplay, url: '#'};
		
	$timeout(function() {
		$rootScope.$broadcast('sp.update.breadcrumbs', bc);
	});	
}