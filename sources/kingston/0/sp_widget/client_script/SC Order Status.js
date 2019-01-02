function($scope, $timeout, spUtil) {
  /* widget controller */
  var c = this;
	$scope.animateTick = '';
	$scope.toggle = function($event, item) {
		item.expand = !item.expand;
	}
	
	$scope.displayRequestItemTable = function () {
		return (c.options.display_description === 'true') ||
			(c.options.display_delivery_date === 'true') ||
			(c.options.display_stage === 'true') ||
			(c.options.display_price === 'true') ||
			(c.options.display_quantity === 'true') ||
			(c.options.display_number === 'true');
	}
}