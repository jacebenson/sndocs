var OAuthAccessToken = Class.create();
OAuthAccessToken.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	isAccessTokenAvailable: function() {
		// Create an output tag called result
		var result = this.newItem('result');
		
		// Get from the parameters
		var requestor = this.getParameter('requestor');
		var oauth_provider_profile_id = this.getParameter('oauth_provider_profile_id');
		
		var oAuthClient = new  sn_auth.GlideOAuthClient();
		
		var token = oAuthClient.getToken(requestor, oauth_provider_profile_id);
		
		if (token) {
			if(token.getAccessToken()) {
				gs.log('OAuth Access token is available, requestor=' + requestor + ', oauth_profile_id=' + oauth_provider_profile_id);
				result.setAttribute('isToken', 'true');
				result.setAttribute('tokenExpiresInSecs', token.getExpiresIn());
				var tokenExpiresInMs = new GlideTime(token.getExpiresIn() * 1000);
				var tokenExpiresOnDate = new GlideDateTime();
				tokenExpiresOnDate.add(tokenExpiresInMs);
				result.setAttribute('tokenExpiresOnDate', tokenExpiresOnDate.getDisplayValue());
			} else {
				result.setAttribute('isToken', 'false');
			}
			
			if (token.getRefreshToken()) {
				gs.log('OAuth Refresh token is available, requestor=' + requestor + ', oauth_profile_id=' + oauth_provider_profile_id);
				result.setAttribute('isRefreshToken', 'true');
				result.setAttribute('refreshTokenExpiresInSecs', token.getRefreshTokenExpiresIn());
				
				var refreshExpiresInMs = new GlideTime(token.getRefreshTokenExpiresIn() * 1000);
				var refreshExpiresOnDate = new GlideDateTime();
				refreshExpiresOnDate.add(refreshExpiresInMs);
				result.setAttribute('refreshTokenExpiresOnDate', refreshExpiresOnDate.getDisplayValue());
			} else {
				result.setAttribute('isRefreshToken', 'false');
			}
		} else {
			result.setAttribute('isToken', 'false');
			result.setAttribute('isRefreshToken', 'false');
		}
	},
	
	type: 'OAuthAccessToken'
});