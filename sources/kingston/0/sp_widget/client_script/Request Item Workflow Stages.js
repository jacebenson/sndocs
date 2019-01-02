function($scope) {
  /* widget controller */
  var c = this;
	c.data.expand = (c.options.onload_expand_request_item_stages == "true" );
	$scope.toggle = function($event) {
		c.data.expand = !c.data.expand;
	}
}