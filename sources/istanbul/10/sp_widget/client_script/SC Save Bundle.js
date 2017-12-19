function() {
  /* widget controller */
  var c = this;
	
	c.saveCart = function() {
		c.data.error = null;
		c.server.update().then(function() {
			if (!c.data.error)
				$rootScope.$broadcast("$sp.service_catalog.cart.save_cart");
		});
	}
	
	c.enableSave = function() {
		return c.data.newCartName && 
			c.data.newCartName.length > 0 &&
			c.data.cartItems.filter(function(item){
				return item.selected;
			}).length > 0;
	}
}