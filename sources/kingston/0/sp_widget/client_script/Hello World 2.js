function() {
	var c = this;	
	c.display = function() {						
		c.server.update().then(function(data) {		
			console.log("message", data.message)
		})		
	}
	
	c.display();
}