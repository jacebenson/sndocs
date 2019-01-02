var PwdEnrollSampleProcessor = Class.create();
/**
 * Handles enrollment for SMS.
 */
PwdEnrollSampleProcessor.prototype = {
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
    	/* eslint-disable no-unused-vars */
    	var LOG_ID = 'PwdEnrollSampleProcessor.process';
    	/* eslint-enable no-unused-vars */
		var sampleInput = params.getFormParameter('sample_input');
		
		// prepare response:
		var response  = {result : 'failure', message : 'Error'};
		
    	if (sampleInput != 'ok') {
			response.result = 'failure';
			response.message = gs.getMessage('The sample input is not "ok"');
		} else {
			response.result = 'success';
			response.message = gs.getMessage('Completed Successfully');
		}
		
		return response;
    },
	
	
    type: 'PwdEnrollSampleProcessor'
};