function() {	
	var c = this;
	c.update = function() {
		c.data.price = false;
		c.server.get({symbol: c.data.symbol}).then(function(r) {			
			c.data.price = r.data.price;			
		});
	}
}