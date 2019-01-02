function onLoad() {
	var requestorDetails = getOAuthRequestorDetails();
	
	if (!requestorDetails.requestor_id) {
		// not configured for oauth
		return;
	}
	
	// Clear the previously added messages
	g_form.clearMessages();
	
	var gaAccessToken = new GlideAjax('OAuthAccessToken');
	gaAccessToken.addParam('sysparm_name', 'isAccessTokenAvailable');
	gaAccessToken.addParam('requestor', requestorDetails.requestor_id);
	gaAccessToken.addParam('oauth_provider_profile_id', requestorDetails.oauth2_profile);
	// Invoke the GlideAjax with a callback function
	gaAccessToken.getXML(parseAjaxResponse);
	
	return;
}

function getOAuthRequestorDetails() {
	// if the current record has oauth2 and profile set, then use this record as requestor
	var authType = g_form.getValue('authentication_type');
	var oauthProfile = g_form.getValue('oauth2_profile');
	if (authType === 'oauth2' && oauthProfile !== '') {
		return {requestor_context: 'sys_rest_message_fn',
		requestor_id: g_form.getUniqueValue(),
		oauth2_profile: oauthProfile};
	}
	
	// otherwise check the parent
	authType = g_scratchpad.rm_authentication_type;
	oauthProfile = g_scratchpad.rm_oauth2_profile;
	if (authType === 'oauth2' && oauthProfile !== '') {
		return {requestor_context: 'sys_rest_message',
		requestor_id: g_form.getValue('rest_message'),
		oauth2_profile: oauthProfile};
	}
	
	return {requestor_context: '', requestor_id: '', oauth2_profile: ''};
}

function parseAjaxResponse(response) {
	var requestorDetails = getOAuthRequestorDetails();
	
	var result = response.responseXML.getElementsByTagName('result');
	var isRefreshToken = (result[0].getAttribute('isRefreshToken') == 'true');
	var isAccessToken = (result[0].getAttribute('isToken') == 'true');
	var thirtyDaysInSecs = 30 * 86400;
	
	if (isRefreshToken) {
		// if refreshTokenExpiresInSecs <30 days
		var expiresInSecs = result[0].getAttribute('refreshTokenExpiresInSecs');
		var expiresAt = result[0].getAttribute('refreshTokenExpiresOnDate');
		if (expiresInSecs <= 0) {
			g_form.addWarningMessage(getTokenExpiredMessage(requestorDetails, 'Refresh', expiresAt));
		} else if (expiresInSecs < thirtyDaysInSecs) {
			// show warning about token about to expire on such date
			g_form.addWarningMessage(getTokenAboutToExpireMessage(requestorDetails, 'Refresh', expiresAt));
		} else {
			// show info about having refresh token and will expire on such date
			g_form.addInfoMessage(getTokenAvailableMessage(requestorDetails, 'Refresh', expiresAt));
		}
	} else if (isAccessToken) {
		// if tokenExpiresInSecs <30 days
		var tokenExpiresInSecs = result[0].getAttribute('tokenExpiresInSecs');
		var tokenExpiresAt = result[0].getAttribute('tokenExpiresOnDate');
		if (tokenExpiresInSecs <= 0) {
			g_form.addWarningMessage(getTokenExpiredMessage(requestorDetails, 'Access', tokenExpiresAt));
		} else if (tokenExpiresInSecs < thirtyDaysInSecs) {
			// show warning about token about to expire on such date
			g_form.addWarningMessage(getTokenAboutToExpireMessage(requestorDetails, 'Access', tokenExpiresAt));
		} else {
			// show info about having refresh token and will expire on such date
			g_form.addInfoMessage(getTokenAvailableMessage(requestorDetails, 'Access', tokenExpiresAt));
		}
		
	} else {
		g_form.addWarningMessage(getNoTokensAvailableMessage(requestorDetails));
	}
}

function getTokenExpiredMessage(requestorDetails, tokenType) {
	var msg = 'OAuth ' + tokenType + ' token is expired. ' + getLinkLocationStringMessage(requestorDetails);
	return getMessage(msg);
}

function getTokenAboutToExpireMessage(requestorDetails, tokenType, tokenExpiresOnDate) {
	var msg = 'OAuth ' + tokenType + ' token is available but will expire soon at ' + tokenExpiresOnDate + '. ' + getLinkLocationStringMessage(requestorDetails);
	return getMessage(msg);
}

function getTokenAvailableMessage(requestorDetails, tokenType, tokenExpiresOnDate) {
	var msg = 'OAuth ' + tokenType + ' token is available and will expire at ' + tokenExpiresOnDate + '.';
	return getMessage(msg);
}

function getNoTokensAvailableMessage(requestorDetails) {
	var msg = 'OAuth Access or Refresh tokens are not available. ' + getLinkLocationStringMessage(requestorDetails);
	return getMessage(msg);
}

function getLinkLocationStringMessage(requestorDetails) {
	var msg = 'Verify the OAuth configuration and click the \'Get OAuth Token\' link ';
	if (requestorDetails.requestor_context === 'sys_rest_message')
		msg += 'on the parent REST Message record to request a new token.';
	else
		msg += 'below to request a new token.';
	
	return msg;
}

