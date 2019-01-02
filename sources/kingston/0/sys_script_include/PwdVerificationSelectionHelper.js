var PwdVerificationSelectionHelper = Class.create();

/*Main function with all the login for retrieving the relevant verification 
	  from the given rules:
	  1. If no verification selection was give return result {verification_selection :false , mandatory:{ids},optional:null}
	  2. If there is a verification selection but min <  mandatory, result :
	  {verification_selection:false, mandatory:{ids},optional:null}
	  3. otherwise : {verification_selection:true, mandatory:{ids},optional:{ids}}
	*/
PwdVerificationSelectionHelper.getVerificationSelection =  function(pwdProcessId, userId) {	

	var processMgr = new SNC.PwdProcessManager();
	var result = { 
		verification_selection : false, 
		mandatory : null, 
		optional : null, 
		min_selections : 0, 
		email_password_reset_url : null
	};
	
	var processGr = new GlideRecord("pwd_process");
	processGr.get(pwdProcessId);

	var allowVer = processGr.allow_verification_choice;
	var minSelection = processGr.min_verifications;
	result.min_selections = minSelection;
	result.email_password_reset_url = processGr.email_password_reset_url;
	
	var mandatoryVerifications = processMgr.getProcessVerificationIdsByMandatoryFlag(pwdProcessId, true);

	var mandatory = [];
	
	//need to change it from a java array to javascript
	for (var i = 0; i != mandatoryVerifications.size(); ++i)
 		mandatory.push(mandatoryVerifications.get(i));
	result.mandatory = mandatory;
		
	if( minSelection <=  mandatory.length){
		result.verification_selection = false;
		result.optional = null;
		return result;
	}

	var optionalVerifications = processMgr.getProcessVerificationIdsByMandatoryFlag(pwdProcessId, false);
	
	var enrollmentMgr = new SNC.PwdEnrollmentManager();
	
	var userRelevantVer = [];
	var verOptionalToAdd = allowVer ? optionalVerifications.size() : minSelection - mandatory.length;
	verOptionalToAdd = verOptionalToAdd > optionalVerifications.size() ? optionalVerifications.size() : verOptionalToAdd;
	var verOptionalAdded = 0;
	
	for (i = 0; i < optionalVerifications.size() && verOptionalAdded < verOptionalToAdd; ++i) {
		if (enrollmentMgr.isUserEnrolledByVerificationId(userId, optionalVerifications.get(i))) {
			userRelevantVer.push(optionalVerifications.get(i));	
			++verOptionalAdded;
		}
	}
	
	if(userRelevantVer.length + mandatory.length <= minSelection) {
		result.optional = userRelevantVer;
		result.verification_selection = false;
	}
	else {
		if(userRelevantVer.length + mandatory.length > minSelection) {
			if(userRelevantVer.length > 0) {
				result.optional = userRelevantVer;
				result.verification_selection = true;
			}
			else 
				result.verification_selection = false;
		}
		else { 
			throw 'To complete this process, you must enroll for additional verifications (methods to verify your identity)';
		}
	}

	return result;
};