function($scope, $rootScope) {
  /* widget controller */
  var c = this;
	
	c.loadCart = function(cart) {
		c.data.action = "load_cart";
		c.data.cartID = cart.sys_id;
		c.server.update().then(function() {
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
		});
	}
	
	$scope.$on("$sp.service_catalog.cart.save_cart", function() {
		c.server.update();
	});
	
	c.removeCart = function(cart) {
		c.data.action = "remove_cart";
		c.data.cartID = cart.sys_id;
		c.server.update();
	}
}