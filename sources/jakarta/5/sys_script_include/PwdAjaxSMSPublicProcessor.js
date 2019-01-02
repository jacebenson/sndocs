var PwdAjaxSMSPublicProcessor = Class.create();
PwdAjaxSMSPublicProcessor.prototype = Object.extendsObject(PwdAjaxSMSProcessor, {
	
	/**
	 * This function makes this AJAX public. By default, all AJAX server side is private.
	 */
	isPublic: function() {
		return true;
	},
	
	// generates sms code for verification.
	// Either subscription based SMS notification
	// or individual device based SMS notification is used
	// based on the mode of the operation.
	generateSMSCode: function() {
		// check the security before anything else.
		// If any violation is found, then just return.
		if(!this._validateSecurity())
			return;
		
		this.generateCode();
	},
	type:PwdAjaxSMSPublicProcessor
});