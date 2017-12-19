var PwdAjaxVerifyProcessor = Class.create();

PwdAjaxVerifyProcessor.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
	TYPE_INFO: "Info",
	TYPE_WARNING: "Warning",
	TYPE_ERROR: "Error",
	
	STAGE_IDENTIFICATION: "Identification",
	STAGE_VERIFICATION: "Verification",
	STAGE_RESET: "Reset",
	
	trackingMgr: null,
	
	/**
 	* This function makes this AJAX public. By default, all AJAX server side is private.
 	*/
	isPublic: function() {
		return true;
	},
	
	/*
		Check a single process verification		
		Same properties and return values as pwdAjaxVerifyProcessor, but only one verification is sent at a time
		
		@param sysparm_verification_id is required to identify which verification is to be checked. 
		
		@return "ok" if the specified verification is valid, even if there are others that aren't filled out yet. 
	*/
	/* eslint-disable consistent-return */ 
	checkVerification: function() {
		if(!this._validateSecurity())
			return;
		
		this.trackingMgr = new SNC.PwdTrackingManager();
		
		var sysparm_sys_user_id = gs.getSession().getProperty('sysparm_sys_user_id');
		var sysparm_request_id = gs.getSession().getProperty('sysparm_request_id');
		var sysparm_process_id = this.trackingMgr.getProcessIdByRequestId(sysparm_request_id);
		var verificationId = this.getParameter('sysparm_verification_id');
				
		// Retrieve request by request id
		var pwd_request_exists = this.trackingMgr.requestExists(sysparm_request_id);
		
		// return error if the request does not exist:
		if (!pwd_request_exists) {
			var reqFailureMsg = "Request does not exist (request_id = " + sysparm_request_id + ")";
			this._logError(reqFailureMsg, sysparm_request_id);
			return "block";
		}
		
		var isValid = this._checkVerification(sysparm_sys_user_id, sysparm_process_id, verificationId, sysparm_request_id);
		
		if (isValid)
			return "ok";
		else 		
			return this._handleRetry(sysparm_request_id, sysparm_sys_user_id);
	},
	
	/************
 	* pwdAjaxVerifyProcessor() - Server side Ajax processor for verifying the user (iterate through the various verification methods).
 	*
 	* Required Properties:
 	*  @sysparm_enrolled_user_id - a "session" property containing the enrolled user id.
 	*  @sysparm_request_id       - a "session" property containing the request id.
 	*
 	* Return value:
 	* "ok"     - if user is verified (by ALL verification methods).
 	* "block"  - If too many attempts where made, and we'd like to block this user.
 	* <error>  - Any other string, with the error (reason for failing); For example: "No request info found".
 	*
 	***********/
	pwdAjaxVerifyProcessor: function() {
		
		// check the security before anything else.
		// If any violation is found, then just return.
		if(!this._validateSecurity())
			return;		
		
		// Intentionally delay the response to ensure "bots" cannot attempt this ajax calls too frequently:
		var milli = GlideProperties.getInt('password_reset.verification.delay', 1000);
		new SNC.PwdUtil().sleep(milli);
				
		this.trackingMgr = new SNC.PwdTrackingManager();
		
		var VERIFIED = 2;  // check out: "com.glideapp.password_reset.model.Request" for status enumerations.
		
		// Fetch the necessary info from the session:
		var sysparm_sys_user_id = gs.getSession().getProperty('sysparm_sys_user_id');
		var sysparm_request_id = gs.getSession().getProperty('sysparm_request_id');
		var sysparm_process_id = this.trackingMgr.getProcessIdByRequestId(sysparm_request_id);
		
		// Retrieve request by request id
		var pwd_request_exists = this.trackingMgr.requestExists(sysparm_request_id);
		
		// return error if the request does not exist:
		if (!pwd_request_exists) {
			var reqFailureMsg = "Request does not exist (request_id = " + sysparm_request_id + ")";
			this._logError(reqFailureMsg, sysparm_request_id);
			return "block";
		}
		
		var is_verified = true;
		var countVerifications = 0;
		
		// -------------------------------------------------------
		// Handle all the MANDATORY verifications associated with this process:
		// -------------------------------------------------------
		var mandatoryVerificationIds = new SNC.PwdProcessManager().getProcessVerificationIdsByMandatoryFlag(sysparm_process_id, true);
		
		var vArr = mandatoryVerificationIds.toArray();
		for (var i = 0; i < vArr.length; i++) {
			// Retrieve verification info (id, type, & processor script name)
			var verificationId = mandatoryVerificationIds.get(i);
			
			if (verificationId == undefined) {
				var invalidVerificationMsg = "Invalid verification (process_id = " + sysparm_process_id + ", verification = " + i + ")";
				this._logError(invalidVerificationMsg, sysparm_request_id);
				return "invalid verification in process";
			}
			
			var verificationResult = this._checkVerification(sysparm_sys_user_id, sysparm_process_id, verificationId, sysparm_request_id);
			
			if (verificationResult) {
				countVerifications++;
			} else {
				is_verified = false;
			}
		}
		// --------------------- END MANDATORY SECTION ---------------------
		
		if (is_verified) {
			// -------------------------------------------------------
			// Handle all the OPTIONAL verifications associated with this process:
			// -------------------------------------------------------
			var optionalVerificationIds = new SNC.PwdProcessManager().getProcessVerificationIdsByMandatoryFlag(sysparm_process_id, false);
			
			vArr = optionalVerificationIds.toArray();
			for (i = 0; i < vArr.length; i++) {
				// Retrieve verification info (id, type, & processor script name)
				verificationId = optionalVerificationIds.get(i);
				
				if (verificationId == undefined) {
					invalidVerificationMsg = "Invalid verification (process_id = " + sysparm_process_id + ", verification = " + i + ")";
					this._logError(invalidVerificationMsg, sysparm_request_id);
					return "invalid verification in process";
				}
				
				verificationResult = this._checkVerification(sysparm_sys_user_id, sysparm_process_id, verificationId, sysparm_request_id);
				
				if (verificationResult) {
					countVerifications++;
				}
			}
			// --------------------- END OPTIONAL SECTION ---------------------
		}
		
		// return error if all verifications were not successful:
		if ((!is_verified) || (countVerifications < new SNC.PwdProcess(sysparm_process_id).getMinVerifications())) {		
			return this._handleRetry(sysparm_request_id, sysparm_sys_user_id);
		}
		
		// Log successful verification
		this.trackingMgr.createActivity(this.TYPE_INFO, this.STAGE_VERIFICATION, "User verified successfully", sysparm_request_id);
		this.trackingMgr.updateRequestStatus(sysparm_request_id, VERIFIED);
		gs.getSession().putProperty('sysparm_is_verified', true);
		return "ok";
	},
	/* eslint-enable consistent-return */ 
	
	_checkVerification: function(sysparm_sys_user_id, sysparm_process_id, verificationId, sysparm_request_id) {
		var verificationMgr = new SNC.PwdVerificationManager();
		var verificationTypeId = verificationMgr.getVerificationTypeIdByVerificationId(verificationId);
		var verificationType =  new SNC.PwdVerificationType(verificationTypeId);
		
		if (!verificationType.exists()) {
			var invalidVerificationType = "Invalid verification type (process_id = " + sysparm_process_id + ", verification = " + verificationId + ")";
			this._logError(invalidVerificationType, sysparm_request_id);

			return false;
		}
		
		var verificationProcessorId = verificationType.getVerificationProcessorId();
		if ((verificationProcessorId === undefined) || (verificationProcessorId.trim() === "")) {
			var invalidVerificationProc = "Invalid verification processor (process_id = " + sysparm_process_id + ", verification = " + verificationId + ")";
			this._logError(invalidVerificationProc, sysparm_request_id);
			
			return false;
		}
		
		try {
			// Include the specific processor, and invoke its "verify" method
			
			// Published interface to verification form processor extensions
			//
			// @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
			// @param params.userId         The sys-id of the user trying to be verified (table: sys_user)
			// @param params.verificationId The sys-id of the verification to be processed (table: pwd_verification)
			// @param request               The form request object. fields in the form can be accessed using: request.getParameter('<element-id>')
			// @return boolean telling whether the user is successfully verified
			
			var verificationParams = new SNC.PwdExtensionScriptParameter();
			verificationParams.resetRequestId = sysparm_request_id;
			verificationParams.userId = sysparm_sys_user_id;
			verificationParams.verificationId = verificationId;
			
			var verificationProcessorExtension = new SNC.PwdExtensionScript(verificationProcessorId);
			var extensionResult = verificationProcessorExtension.processForm(verificationParams, this.request);
			
			var verificationResult;
			// If we didn't get the expected return type back, we mark this verification process as failed
			if (typeof(extensionResult) == 'boolean') {
				verificationResult = extensionResult;
			} else {
				gs.logWarning('Unexpected verification processor extension result: ' + extensionResult, 'PwdAjaxVerifyProcessor');
				verificationResult = false;
			}
			
			if (!verificationResult) {
				this._logWarning("Verification failed", sysparm_request_id, 'pwd_verification', verificationId);
			}
			
			return verificationResult;
		}
		catch(err) {
			// Most likely the processing script does not exist!
			var errorMsg = "Cannot process verification (verification_id = " + verificationId + ") + [" + err + "]";
			this._logError(errorMsg, sysparm_request_id);
			
			return false;
		}
	},
	
	_handleRetry: function(sysparm_request_id, sysparm_sys_user_id) {		
		var retry = this.trackingMgr.updateRequestRetry(sysparm_request_id);			
		var retryResponse = this.newItem("retry");
		retryResponse.setAttribute("count", retry);
		
		if (retry < 0) {
			this._logWarning("Maximum retries reached, blocking user", sysparm_request_id);
			return "block";
		} 
		else {
			this._logWarning("Attempt " + retry + " failed, allowing retry", sysparm_request_id);
			// Return the name of the user who's verification failed
			var failedUser = new GlideRecord('sys_user');
			failedUser.get(sysparm_sys_user_id);
			return failedUser.name;
		}
	},
	
	// refTable and refSysId are optional
	_logWarning: function(message, requestId, refTable, refSysId) {
		this.trackingMgr.createActivity(this.TYPE_WARNING, this.STAGE_VERIFICATION, message, requestId, refTable, refSysId);
	},
	
	_logError: function(message, requestId, refTable, refSysId) {
		this.trackingMgr.createActivity(this.TYPE_ERROR, this.STAGE_VERIFICATION, message, requestId, refTable, refSysId);
	},
	
	type: 'PwdAjaxVerifyProcessor'
});