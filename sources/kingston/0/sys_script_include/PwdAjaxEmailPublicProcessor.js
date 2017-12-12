var PwdAjaxEmailPublicProcessor = Class.create();
PwdAjaxEmailPublicProcessor.prototype = Object.extendsObject(PwdAjaxEmailProcessor, {
	
	/**
	 * This function makes this AJAX public. By default, all AJAX server side is private.
	 */
	isPublic: function() {
		return true;
	},
	
	// generates email code for verification.
	// Either subscription based Email notification
	// or profile email based notification is used
	// depending on the mode of the operation.
	generateEmailCode: function() {
		// check the security before anything else.
		// If any violation is found, then just return.
		if(!this._validateSecurity())
			return;
		
		this.generateCode();
	},
	type:PwdAjaxEmailPublicProcessor
});