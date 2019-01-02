function($window) {
	var c = this;
	c.shared = c.options.shared;
	c.add = function() {
		c.shared.add();
	}
}