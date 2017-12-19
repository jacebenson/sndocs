// PwdVerifyPersonalDataProcessor
// This processor is used for the main business logic to verify the user 
// answers match the expected data in the system.

var PwdVerifyPersonalDataProcessor = Class.create();
PwdVerifyPersonalDataProcessor.prototype = {
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
           gs.logError("[PwdVerifyQuestionsProcessor.processForm]: '" + scriptErr + "'");
           isVerified = false;
       }
       return isVerified;
    },	
	
	/*********
     * verify - returns true/false whether the User's response matches the data from the sys_user table
     *
     * Params: 
	 * @reset_request_id
	 * @sys_user_id
	 * @verification_id
	 * @request - the request object that was submitted by the user in the verification form
     *********/
	verify: function(reset_request_id, sys_user_id, verification_id, request) {
		var userAnswer = request.getParameter('sysparm_personal_id_' + verification_id);
		
		// Get the column defined for this verification
		var column = new SNC.PwdVerificationManager().getVerificationParamValue(verification_id, "column");
		
		if (column == '') {
			gs.log("[PwdVerifyPersonalDataProcessor] Invalid verification configuration: Null value found for column.");
			return false;
		}
		
		var table = "sys_user";
		var valueFromDB;
		var gr = new GlideRecord(table);				
		gr.get(sys_user_id); // Join using the sys_user_id
		valueFromDB = gr.getValue(column);
		gr.close();

		if (valueFromDB) {
			// Find the column type from the dictionary and figure out how to compare the values based on it
			var dict = new GlideRecord("sys_dictionary");
			dict.addQuery("table", table);
			dict.addQuery("element", column);
			dict.query();
			dict.next();
			var columnType = dict.internal_type;
			dict.close();
			
			if (columnType == 'ph_number') {
				var nonDigitRegex = /[^0-9]/g;
				// Remove all non digit chars
				var valueFromDBStripped = valueFromDB.replace(nonDigitRegex, '');
				// Force the userAnswer to be casted from object to string
				var userAnswerStripped = userAnswer.replace(nonDigitRegex, '');
				return valueFromDBStripped.equals(userAnswerStripped);
			} else {
				// default is equals compare
				return valueFromDB.equals(userAnswer);
			}
		}
		return false;
    },
	
    type: 'PwdVerifyPersonalDataProcessor'
};