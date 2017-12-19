function($window) {  
  var c = this;		
	c.language = {value: 'en', displayValue: 'English'};		
	c.changed = function(a) {							
		c.server.get(c.language).then(function() {			
			$window.location.reload();			
		})		
	}	
}