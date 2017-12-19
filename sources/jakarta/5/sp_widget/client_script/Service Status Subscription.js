function ($scope, spUtil) {
	var c = this;

	c.subscribe = function() {
		c.data.action = "subscribe";
		c.server.update();
	}
	
	c.unsubscribe = function() {
		c.data.action = "unsubscribe";
		c.server.update();
	}

}