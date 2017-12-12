// PwdVerifyPersonalDataConfirmationProcess
// This processor is used for the main business logic to verify the 
// answer was accepted by the user.

var PwdVerifyPersonalDataConfirmationProcess = Class.create();
PwdVerifyPersonalDataConfirmationProcess.prototype = {
    category: 'password_reset.extension.verification_form_processor',   // DO NOT REMOVE THIS LINE!
    
    /**********
     * Initialization stuff here
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
       var isVerified = false;
       try {
           isVerified = this.verify(params.resetRequestId, params.userId, params.verificationId, request);
       } catch (scriptErr) {
           gs.logError("[PwdVerifyPersonalDataConfirmationProcess.processForm]: '" + scriptErr + "'");
           isVerified = false;
       }
       return isVerified;
    },    
	
	/*********
     * verify - returns true/false whether the answer was accepted by the user
     *
     * Params: 
	 * @sys_user_id
	 * @verification_id
	 * @request - the request object that was submitted by the user in the verification form
     *********/
	verify: function(reset_request_id, sys_user_id, verification_id, request) {
		
		var id = "sysparm_pers_reply_" + verification_id;
		var answerAccepted = request.getParameter(id);
		return answerAccepted == "accept";
	},
	
    type: 'PwdVerifyPersonalDataConfirmationProcess'
};