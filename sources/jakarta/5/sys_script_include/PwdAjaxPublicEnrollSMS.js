var PwdAjaxPublicEnrollSMS = Class.create();
PwdAjaxPublicEnrollSMS.prototype = Object.extendsObject(PwdAjaxEnrollSMS, {
	
	// Let's make this one public.
	isPublic : function() {
		return true;
	},
	
	// return details of a users subscription
	// or mobile from his/her profile
	getSMSVerificationInfo:function() {
		// check the security before anything else.
		// If any violation is found, then just return.
		
		if (!this._validateSecurity())
			return;

		// call the method in the parent.
		this.getVerificationInfo();
	},
	
	type: 'PwdAjaxPublicEnrollSMS'
});