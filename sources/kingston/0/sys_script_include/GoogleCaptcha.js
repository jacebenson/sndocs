var GoogleCaptcha = Class.create();
GoogleCaptcha.prototype = {
	initialize: function() {
	},

	verifyCaptcha: function(grc) {
		try {
			// Create REST message to check the passed token with Google recaptcha service:
			/* eslint-disable no-undef */
			var r = new sn_ws.RESTMessageV2();
			/* eslint-disable no-undef */
			
			r.setHttpMethod('post');
			r.setEndpoint('https://www.google.com/recaptcha/api/siteverify');
			
			var secret = gs.getProperty('google.captcha.secret');
			var Encrypter = new GlideEncrypter();
			
			r.setQueryParameter('secret', Encrypter.decrypt(secret));
			r.setQueryParameter('response', grc);
			
			var response = r.execute();
			
			var responseBody = response.getBody();
			
			var parser = new JSONParser();
			var parsed = parser.parse(responseBody);
			
			return parsed.success;
			
		}
		catch(ex) {
			return "false";
		}
	},
	
	type: 'GoogleCaptcha'
};