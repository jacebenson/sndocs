function() {	
	var c = this;
	
	for (var x in c.data.dates) {				
		c.data.dates[x] = moment(c.data.dates[x]).format('ll').split(',')[0];
	}
	
	c.index = 4;
	c.updated = true;
		
	c.left = function() {
		c.updated = false;
		c.index = (c.index > 0 ) ? c.index - 1 : c.index;
		c.updated = true;
	}
	
	c.right = function() {		
		c.updated = false;
		c.index = (c.index < 4) ? c.index + 1 : c.index;
		c.updated = true;
	}
			
}