var PwdVerifySimpleProcessor = Class.create();

PwdVerifySimpleProcessor.prototype = {
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
	 * since this is only a mock/sample verification processor, it will only return true if the user sent "ok" in the input field, otherwise, it will return false.
     *
     * Params: 
	 * @enrolled_user_id
	 * @verification
	 * @request - the request object that was submitted by the user in the verification form
     *********/
    verify: function(reset_request_id, enrolled_user_id, verification, request) {
		if (request.getParameter("sysparm_simple_input") == "ok")
			return true;
		else
			return false;
    },
    
    type: 'PwdVerifySimpleProcessor'
};