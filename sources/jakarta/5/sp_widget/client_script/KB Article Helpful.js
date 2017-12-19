function ($timeout) {
	var c = this;	
	c.hide = false;
	c.submitted = false;
	
	c.action = function(state) {		
		c.submitted = true;
		c.data.state = state;
		c.data.response = c.data.submittingMsg;
		c.server.update().then(c.hideIt);		
	}	
	
	c.hideIt = function() {
		$timeout(function() {
			c.hide = true;
		}, 2000);
	}
	
	c.showPercentHelpful = function() {
		if (c.submitted)
			return false;
		
		if (c.data.percent < 0)
			return false;
		
		return c.options.hide_percent_helpful != true && c.options.hide_percent_helpful != "true";
	}
}