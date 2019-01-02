var PwdGoogleAuthenticator = Class.create();
PwdGoogleAuthenticator.prototype = Object.extendsObject(GlideMultifactorAuthenticator, {
	PWD_GOOGLE_AUTH_ID: "6d26f82187400300cfab6dd207cb0b80",  // Google Auth Verification ID
	
	loadContent: function() {
		var userId = this.getParameter("sysparm_userId").toString();
		var isEnabled = this.isUserEnabledPwdGoogleAuth(userId, true);
		var ans = this.newItem("isEnabled");
		ans.setAttribute("isEnabled", isEnabled);
		
		this.loadPopupContent();
	},
	
	resetMultifactorCode: function(){
		var userId = this.getParameter("sysparm_userId").toString();
		this._updateEnrollmentRecord(userId, "0");
		var isEnabled = this.isUserEnabledPwdGoogleAuth(userId, true);
		var ans = this.newItem("isEnabled");
		ans.setAttribute("isEnabled", isEnabled);
		
		this.resetCode();
	},
	
	validateEnrollmentResponse: function(){
		var userId = this.getParameter("sysparm_userId").toString();
		var previouslyEnabled = this._isUserEnabledMFA(userId);
		
		var response = this.getParameter("sysparm_response").toString();
		var valid = SNC.MultifactorAuthUtil.isResponseValid(response);
		var result = this.newItem("result");
		result.setAttribute("validated", valid);
		if(valid) {
			// Update pwd_enrollment as a flag of pwd google auth being enabled for the user
			this._updateEnrollmentRecord(userId, '1');
		}
		
		//calling validateResponse will enable the mfa flag if it was previously disabled
		//for password reset we disable it again after validating the resposne
		if(!previouslyEnabled){
			var userGr = new GlideRecord("sys_user");
			userGr.get(userId);
			userGr.setValue("enable_multifactor_authn", false);
			userGr.update();
		}
	},
	
	disableGoogleAuth: function(){
		var userId = this.getParameter("sysparm_userId").toString();
		
		// Disable google auth for pwd reset
		this._updateEnrollmentRecord(userId, "2");
		
		// Clear all settings if user is not enabled for platform login MFA
		if (!this._isUserEnabledMFA(userId))
			this.disableMFA();

		this.newItem("isEnabled").setAttribute("isEnabled", false);
	},
	
	enableGoogleAuth: function() {
		var userId = this.getParameter("sysparm_userId").toString();
		
		// Enable google auth for pwd reset
		this._updateEnrollmentRecord(userId, "0");
		
		this.loadContent();
	},
	
	isUserEnabledPwdGoogleAuth: function(userId, defaultVal) {
		var gr = new GlideRecord('pwd_enrollment');
		gr.addQuery('user', userId);
		gr.addQuery('verification', this.PWD_GOOGLE_AUTH_ID);
		gr.query();
		if (gr.next()) {
			return gr.getValue("status") != "2";  // NOT Inactive
		}
		
		return defaultVal;
	},
  
    _updateEnrollmentRecord: function(userId, status) {
		var gr = new GlideRecord('pwd_enrollment');
		gr.addQuery('user', userId);
		gr.addQuery('verification', this.PWD_GOOGLE_AUTH_ID);
		gr.query();
		if (gr.next())
			new SNC.PwdEnrollmentManager().updateEnrollment(userId, this.PWD_GOOGLE_AUTH_ID, status);
		else
			new SNC.PwdEnrollmentManager().createEnrollment(userId, this.PWD_GOOGLE_AUTH_ID, status);
    },
	
	// If the user is enabled MFA for the platform login
	_isUserEnabledMFA: function(userId) {
		var userGr = new GlideRecord("sys_user");
		userGr.get(userId);
		return userGr.getValue("enable_multifactor_authn") == "1";
	},
	
    type: 'PwdGoogleAuthenticator'
});