function($rootScope,$timeout) {
  // widget controller
  var c = this;
	var bc = [{label: c.data.widgetTitle, url: '#'}];
	$timeout(function() {
		$rootScope.$broadcast('sp.update.breadcrumbs', bc);
	});
}