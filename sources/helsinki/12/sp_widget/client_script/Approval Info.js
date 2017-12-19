function () {
	var c = this;	
	c.action = function(state) {		
		c.data.op = state;
		c.data.state = state;
		c.server.update();		
	}	
}