var SlackClient = Class.create();
SlackClient.prototype = {
    initialize: function() {
		this.token    = gs.getProperty('x_snc_slack_points.slack_bot_token');
		this.endpoint = 'https://slack.com/api'; 
    },
	
	getUserInfo: function(userId) {
		var rm = this._newGetRequest('/users.info'); 
		rm.setQueryParameter('user', userId); 
		var response = rm.execute();
		var body = response.getBody(); 
		return JSON.parse(body); 
	},
	
	_newGetRequest: function(resource) {
		var rm = new sn_ws.RESTMessageV2(); 
		rm.setEndpoint(this.endpoint + resource); 
		rm.setHttpMethod('GET'); 
		rm.setQueryParameter('token', this.token); 
		return rm; 
	}, 
	
	newMethod2: function() {
		
	},

    type: 'SlackClient'
};