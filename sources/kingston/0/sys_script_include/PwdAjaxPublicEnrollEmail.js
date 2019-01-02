var PwdAjaxPublicEnrollEmail = Class.create();
PwdAjaxPublicEnrollEmail.prototype = Object.extendsObject(PwdAjaxEnrollEmail, {
	
	// Let's make this one public.
	isPublic : function() {
		return true;
	},
	
	// return details of a users subscription
	// or email address from his/her profile
	getEmailVerificationInfo:function() {
		// check the security before anything else.
		// If any violation is found, then just return.
		
		if (!this._validateSecurity())
			return;

		// call the method in the parent.
		this.getVerificationInfo();
	},
	
	type: 'PwdAjaxPublicEnrollEmail'
});