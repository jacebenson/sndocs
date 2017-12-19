function() {	
	var c = this;		
  c.display = function() {		
		c.data.message = (c.data.sometext) ? 'Hello ' + c.data.sometext + '!' : '';
	}
	
	c.display();
}