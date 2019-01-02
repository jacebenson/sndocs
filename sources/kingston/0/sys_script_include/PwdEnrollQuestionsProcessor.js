var PwdEnrollQuestionsProcessor = Class.create();
/**
 * Handles questions and answers for verification.
 */
PwdEnrollQuestionsProcessor.prototype = {
    category: 'password_reset.extension.enrollment_form_processor', // DO NOT REMOVE THIS LINE!
    
    /**
     * Init method.
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
        var enrollmentId = params.enrollmentId;
        var verificationId = params.verificationId;

        var mgr = new SNC.PwdQAManager(); 
        var userId = gs.getUserID();
            
        // number of questions and answers to enroll.
        var numEnroll = mgr.getRequiredQuestionCountByVerificationId(verificationId); 
		numEnroll = parseInt(numEnroll);
        

        var answerIdsToKeep = [];
        
        //let's get the stored answer Ids before insert/update operation.
        var storedAnswerIds = mgr.getStoredAnswerIdsByVerificationId(userId,verificationId);
		
		// if answer has not been changed (which means not dirty), do not update.
		var unChangedAnswerIds = [];
		var newAnswers = [];
        
		var response = {result : 'failure', message : 'Error'};
		
        try {
            // this is normal case.
            for(var i=0; i<numEnroll;i++){
                var index = i+1;
				
                var isChanged = params.getFormParameter("changed_"+index);
                var answerId = params.getFormParameter("stored_sys_id_"+index);  // sys_id
                
				if(answerId)
                    answerIdsToKeep[i] =answerId;
				
                if(isChanged !='true') {
					unChangedAnswerIds.push(answerId);
					continue;
				}
            
                // question: name
                var question = params.getFormParameter("question_"+index);
				
                // answer: value.
                var answer = params.getFormParameter("answer_"+index);
            
                if(answer)
                    answer = answer.trim();
				
				newAnswers.push({answerId: answerId, question: question, answer: answer});
			}
			
			if (!this._validateAnswerUniqueness(mgr, unChangedAnswerIds, newAnswers))
				throw {message: gs.getMessage("All answers must be unique")};
			
			newAnswers.forEach(function(newAnswer) {
			    mgr.insertOrUpdateAnswer(enrollmentId, newAnswer.answerId, newAnswer.question, newAnswer.answer);
			});

            //if the # of stored answers is more than numEnroll, delete the extra answers if found.
			//This can happen when reducing numEnroll after users enrolled.
			//This will be a very rare case, but we have to support the use case.
            if(numEnroll < storedAnswerIds.size()){
				mgr.ensureNumEnroll(userId, verificationId, answerIdsToKeep);
            }
            response.result  = 'success';
            response.message = gs.getMessage('Completed Successfully');
        }
        catch(err){
            response.result  = 'failure';
            response.message = err.message;  // does not need translation
        }
		
		return response;
    },
	
	// Validate new answers against old stored answers. 
	// No need to validate new answers to each other as they are already handled on the client side.
	_validateAnswerUniqueness: function(mgr, unChangedAnswerIds, newAnswers) {
		for (var i = 0; i < newAnswers.length; i++) {
			for (var j = 0; j < unChangedAnswerIds.length; j++) {
				if (mgr.compareAnswers(unChangedAnswerIds[j], newAnswers[i].answer))
					return false;
			}
		}
		return true;
	},

    type: 'PwdEnrollQuestionsProcessor'
};