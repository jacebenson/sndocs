function () {
  var c = this;
  c.channel = false;	
	c.errorMessage = false;
	
  c.getWeather = function() {	 
	  c.server.get({place: c.data.place}).then(function(r) {			
			c.channel = r.data.channel;
			c.errorMessage = r.data.errorMessage;
	  });	  
  };
}