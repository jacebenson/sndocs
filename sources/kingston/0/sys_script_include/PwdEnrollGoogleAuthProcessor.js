var PwdEnrollGoogleAuthProcessor = Class.create();
/**
 * Handles enrollment for google authentication.
 */
PwdEnrollGoogleAuthProcessor.prototype = {
    category: 'password_reset.extension.enrollment_form_processor', // DO NOT REMOVE THIS LINE!

    /**
     * Init function.
     */
    initialize: function() {
    },
    
    /**********
    * Process the enrollment form, and returns a PwdExtensionScriptResponse object, which contains: result, message and value 
    * 
    * @param params.userId                            The sys-id of the user trying to enroll (table: sys_user)
    * @param params.verificationId                    The sys-id of the verification to be enrolled into (table: pwd_verification)
    * @param params.enrollmentId                      The sys-id of this enrollment process.
	* 
    * @param params.getFormParameter(<form element>)  Any of the form elements
	* 
    * @return a map with the attributes: 'result' and 'message' for example: {result: 'success', message : 'bla bla'}
    **********/
    process: function(params) {
		
		var isPwdAuthEnabled = new PwdGoogleAuthenticator().isUserEnabledPwdGoogleAuth(params.userId, true);
		var isValidated = SNC.MultifactorAuthUtil.isValidated();
		
		if (isPwdAuthEnabled) {
			if (isValidated) {
				return {result : 'success', message : gs.getMessage('Authorized the device with Google Authentication.')};
			} else {
				return {result : 'fail', message : gs.getMessage('You must authorize at least one device with Google Authentication.')};
			}
		} else 
			return {result : 'fail', message : gs.getMessage('You must enable Multi-factor authentication.')};
				
    },
	
    type: 'PwdEnrollGoogleAuthProcessor'
};