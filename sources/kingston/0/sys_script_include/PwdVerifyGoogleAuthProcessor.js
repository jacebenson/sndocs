var PwdVerifyGoogleAuthProcessor = Class.create();

PwdVerifyGoogleAuthProcessor.prototype = {
    category: 'password_reset.extension.verification_form_processor',   // DO NOT REMOVE THIS LINE!
    
    /**********
     * Initialization stuff here...
     **********/
    initialize: function() {
    },

    /**********
    * Process the verification form request, and return whether the user was successfully verified
    * 
    * @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
    * @param params.userId         The sys-id of the user trying to be verified (table: sys_user)
    * @param params.verificationId The sys-id of the verification to be processed (table: pwd_verification)
    * @param request               The form request object. fields in the form can be accessed using: request.getParameter('<element-id>')
    * @return boolean telling whether the user is successfully verified
    **********/
    processForm: function(params, request) {
        return this.verify(params.resetRequestId, params.userId, params.verificationId, request);
    },
    	
    /*********
     * verify - returns true/false whether the user is verified for this verification method.
     *
	 * This will compare the OTP code provided by the user to the one generated using their secret key on the server, and return true
	 * if there is a match (within a certain clock skew)
     *
     * Params: 
	 * @enrolled_user_id
	 * @verification
	 * @request - the request object that was submitted by the user in the verification form
     *********/
    verify: function(reset_request_id, enrolled_user_id, verification, request) {
		
        // If we already validated the code (e.g. in step 1 of the reset process) then return that result since we validate
        // everything at the end, and the code could have expired causing a false negative
		var reqVerGr = new GlideRecord('pwd_map_request_to_verification');
		reqVerGr.addQuery('verification', verification);
		reqVerGr.addQuery('request', reset_request_id);
		reqVerGr.query();

		var recordExists = reqVerGr.next();
		if (recordExists && reqVerGr.getValue('status') == 'verified')
            return true;

        var isValid = SNC.PwdMultifactorAuthUtilWrapper.isResponseValid(request.getParameter("sysparm_otp_code").trim(), enrolled_user_id);

        reqVerGr.setValue('status', isValid? 'verified' : 'not_verified');
        if (!recordExists) {
            reqVerGr.setValue('request', reset_request_id);
            reqVerGr.setValue('verification', verification);
            reqVerGr.insert();
        }
        else
            reqVerGr.update();

        return isValid;
    },
    
    type: 'PwdVerifyGoogleAuthProcessor'
};