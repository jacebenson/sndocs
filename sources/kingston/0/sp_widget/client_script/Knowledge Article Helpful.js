function ($timeout) {
	var c = this;	
	c.hide = false;
	c.submitted = false;
	c.helpfulPrompt = c.options.helpful_prompt ?  c.options.helpful_prompt : $rootScope.messages.HELPFUL;
	
	/*c.server.get({action : 'getHelpful', article_sys_id : $rootScope.article_sys_id}).then(function(resp){
		c.data.percent = resp.data.percent;
		c.data.helpfulContent = resp.data.helpfulContent;
	});*/
	c.action = function(state) {		
		c.submitted = true;
		c.data.state = state;
		c.data.response = c.data.submittingMsg;
		c.server.get({action: 'saveHelpful', article_sys_id : $rootScope.article_sys_id, useful : state}).then(function(resp){
			c.data.response = resp.data.response;
			c.data.success = resp.data.success;
			//c.submitted = false;
			$timeout(function() {
				c.hide = true;
			}, 2000);			
		});		
	}	
	
	c.showPercentHelpful = function() {
		if (c.submitted)
			return false;
		
		/*if (c.data.percent < 0)
			return false;*/
		
		return c.options.hide_percent_helpful != true && c.options.hide_percent_helpful != "true";
	}
}