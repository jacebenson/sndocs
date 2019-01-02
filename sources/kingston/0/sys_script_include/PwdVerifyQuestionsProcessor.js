var PwdVerifyQuestionsProcessor = Class.create();
PwdVerifyQuestionsProcessor.prototype = {
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
     * verify - returns true/false whether the user is verified for this verification method.
     *
     * Params: 
	 * @enrolled_user_id
	 * @verification_id
	 * @request - the request object that was submitted by the user in the verification form
     *********/
    verify: function(reset_request_id, sys_user_id, verification_id, request) {
		var LOG_ID="[PwdVerifyQuestionsProcessor] [request_id = " + reset_request_id + "]";

		// Get number of questions to ask, and check for validity of this number:
		var numReset = new SNC.PwdVerificationManager().getVerificationParamValue(verification_id, "num_reset");
		
		if (numReset == undefined) {
            this._logError(LOG_ID + "Number of question for resetting password (num_reset) in verification " + verification_id + " is undefined");
            return false;
		}
		numReset = parseInt(numReset);
		if (numReset <= 0) {
            this._logError(LOG_ID + "Number of question for resetting password (num_reset) in verification " + verification_id + " is invalid (must be greater than 0)");
            return false;
		}
		
		// Iterate through all questions to ensure all pass successfully:
        for (var i = 0; i < numReset; i++) {
			// Retrieve the question id and the user's answer from the input fields (passed in the request):
            var active_question_id = request.getParameter("sysparm_question_" + i);
            var user_answer = request.getParameter("sysparm_answer_" + i);
            
            if(user_answer) {
            	user_answer = user_answer.trim();
            }
			
			if ((active_question_id == undefined) || (user_answer ==  undefined)) {
	            this._logError("sysparm_question_" + i + " or sysparm_answer_" + i + " is undefined");
				return false;
			}
            
            if (!this._isAnswerOk(reset_request_id, verification_id, sys_user_id, active_question_id, user_answer)) {
				gs.log(LOG_ID + "Security Questions verification failed for [verificationId:" + verification_id +
					   "][sys_user_id:"+sys_user_id + "][active_question_id:" + active_question_id + "]"); //For Debug + "[user_anser:"+user_answer+"]");
	            return false;
			}
			//For Debug gs.log(LOG_ID+"answer " + user_answer + " ok");
        }
        
		gs.log(LOG_ID + "Security Questions verification succeeded");
		return true;
    },
        
    /**********
     * isAnswerOk - returns true/false if the submitted answer is correct
     *
	 * @enrolled_user_id
     * @param - verification_id
     * @param - sys_user_id
     * @param - active_question_id
     * @param - user_answer
     **********/
    _isAnswerOk : function(reset_request_id, verification_id, sys_user_id, active_question_id, user_answer) {
        
		var LOG_ID="[PwdVerifyQuestionsProcessor._isAnswerOK] [request_id = " + reset_request_id + "]";
        gs.log(LOG_ID + "Conditions [verificationId:"+verification_id+"][sys_user_id:"+sys_user_id+"][active_question_id:"+active_question_id+"]");
        
        var gr_answers = new GlideRecord('pwd_active_answer');
        gr_answers.addJoinQuery('pwd_enrollment', 'enrollment', 'sys_id');
        gr_answers.addQuery('enrollment.verification',  verification_id);
        gr_answers.addQuery('enrollment.user', sys_user_id);
        gr_answers.addQuery('active_question', active_question_id);
        gr_answers.query();
        
        if (!gr_answers.next()) {
            gs.log(LOG_ID+"Answer not found for question: '" + active_question_id + "'");
            return false;
		}
		
        gs.log(LOG_ID+"Found answer to question: '" + active_question_id + "' (enrollment: " + gr_answers.enrollment + ")");
        
        var same = new SNC.PwdQAManager().compareAnswers(gr_answers.sys_id, user_answer);
        
        gs.log(LOG_ID+"Is provided answer correct?: '" + same + "'");
        return same;
    },
    
	_logError : function(message) {
		gs.log("ERROR in PwdVerifyQuestionsProcessor: " + message);
	},
	
    type: 'PwdVerifyQuestionsProcessor'
};