var PwdVerifyIdentity = Class.create();

PwdVerifyIdentity.prototype = {
	TYPE_INFO: "Info",
	TYPE_WARNING: "Warning",
	TYPE_ERROR: "Error",
	
	STAGE_IDENTIFICATION: "Identification",
	STAGE_VERIFICATION: "Verification",
	STAGE_RESET: "Reset",
	
	REQUEST_TYPE : 1, // self-service reset password,
	
	DEFAULT_SELF_SERVICE_PROCESS_ID : 'c6b0c20667100200a5a0f3b457415ad5',
	
	NOTIFY_EMAIL : "2",
	PWD_RESET_URL_NOTIFICATION : "9546d4509f131200f45c7b9ac42e70ca", 
	UNSUBSCRIBE_NOTIFICATION_FILTER : "c1bfa4040a0a0b8b001eeb0f3f5ee961",
	
		
    initialize: function() {
    },
    
	verifyIdentity: function(sysparm_process_id, sysparm_user_id, sysparm_captcha) {
		var trackingMgr = new  SNC.PwdTrackingManager();
		
		// return error if the process is undefined
		var process = new SNC.PwdProcess(sysparm_process_id);
		if (process == undefined) {
			trackingMgr.createActivity(this.TYPE_ERROR, this.STAGE_IDENTIFICATION, "Process does not exist (" + sysparm_process_id + ").", "");
			return "process does not exists";
		}
		
		//If captcha is enabled, check if the answer is correct.
		if (process.getDisplayCaptcha()) {
			if(this._isGoogleCaptchaUsed()) {
				if(!this._vefifyGoogleCaptchaToken(sysparm_captcha)){
				
					trackingMgr.createActivity(this.TYPE_WARNING, this.STAGE_IDENTIFICATION, "unsuccessful Google recaptcha validation", "");
					return "bad captcha";
				}
			}
			else if (!this._verifyDefaultCaptcha(sysparm_captcha)) {

				// this is the default captcha.
				// Check if the passed captch matches the one that was shown to the user:
				trackingMgr.createActivity(this.TYPE_WARNING, this.STAGE_IDENTIFICATION, "Captcha does not match", "");
				return "bad captcha";
			}
		} // end of captcha handling.
		
		// Fetch the user record based on the user input
		var userInput = sysparm_user_id;
		var identificationProcessorScript = process.getIdentificationProcessor();
		var userSysId;

		if (gs.nil(identificationProcessorScript)) {
			userSysId = this._getUserSysId(sysparm_user_id);
        } else {
			var res = this._getUserSysIdExtensionScript(identificationProcessorScript, sysparm_user_id, sysparm_process_id, process);
            if (res.status == false) {
				trackingMgr.createActivity(this.TYPE_ERROR, this.STAGE_IDENTIFICATION, res.activityLogMsg, "");
                return res.returnMsg;
			}
			userSysId = res.userSysId;
		}
		
		// return error if the user does not exist in the system:
		if (userSysId == undefined || userSysId == null) {
			trackingMgr.createActivity(this.TYPE_WARNING, this.STAGE_IDENTIFICATION, "User does not exist (" + sysparm_user_id + ")", "");
			return "user does not exists";
		}
		
		// Start logging the password reset request:
		var request_id = trackingMgr.createRequest(sysparm_process_id, userSysId, gs.getSessionID(), this.REQUEST_TYPE);
		
		// Prepare session params to pass to next step:
		gs.getSession().putProperty('sysparm_request_id', request_id);
		gs.getSession().putProperty('sysparm_sys_user_id', userSysId);
		gs.getSession().putProperty('sysparm_user_input', userInput);
		gs.getSession().putProperty('sysparm_directory', this.type);
		
		// For the default self service process, return error if the user is locked out and process unlock_account is off
		if (this._lockedOutError(userSysId, sysparm_process_id)) {
			var lockedOutMsg = "Cannot create request (process_id = " + sysparm_process_id + ", user_sys_id = " + userSysId + ") because the user is locked out.";
		    trackingMgr.createActivity(this.TYPE_ERROR, this.STAGE_IDENTIFICATION, lockedOutMsg, request_id);
			return "locked";
		}
		
		// return error if the user is blocked
	    if (trackingMgr.isRequestLocked(userSysId, sysparm_process_id)) {
	    	var blockedMsg = "Cannot create request (process_id = " + sysparm_process_id + ", user_sys_id = " + userSysId + ") because the user is blocked.";
		    trackingMgr.createActivity(this.TYPE_ERROR, this.STAGE_IDENTIFICATION, blockedMsg, request_id);
			return "block";
		}
		
		// Return error if the user does not belong to this process:
		var enrollMgr = new SNC.PwdEnrollmentManager();
		if(!enrollMgr.doesUserBelongToProcess(userSysId, sysparm_process_id)) {
			var userMsg = "User is not in process (process_id = " + sysparm_process_id + ", user_sys_id = " + userSysId + ")";
			trackingMgr.createActivity(this.TYPE_WARNING, this.STAGE_IDENTIFICATION, userMsg, request_id);
			return "user is not in process";
		}
		
		// Return error if the process emails a password reset url or emails new password via email, but the user has disabled notifications, or url notification for primary email
		if (process.getEmailPasswordResetUrl() || process.getSendEmail()) {
			var userGr = new GlideRecord("sys_user");
			userGr.get(userSysId);
			var email = userGr.getValue("email");
			if (gs.nil(email) || userGr.getValue("notification") != this.NOTIFY_EMAIL) {
				return "user cannot receive email";
			}
			
			var deviceGr = new GlideRecord("cmn_notif_device");
			deviceGr.addQuery("user", userSysId);
			deviceGr.addQuery("email", email);
			deviceGr.query();
			deviceGr.next();
			
			var notifGr = new GlideRecord("cmn_notif_message");
			notifGr.addQuery("user", userSysId);
			notifGr.addQuery("device", deviceGr.getValue("sys_id"));
			notifGr.addQuery("notification", this.PWD_RESET_URL_NOTIFICATION);
			notifGr.query();
			notifGr.next();
			var notifFilter = notifGr.getValue("notification_filter");
		    if (notifFilter == this.UNSUBSCRIBE_NOTIFICATION_FILTER) {
		    	return "user cannot receive email";
		    }
		}

		var userVerifications = [];
		var processManager = new SNC.PwdProcessManager();
		
		// Retrieve and save all MANDATORY verifications:
		var mandatoryVerificationIds = processManager.getProcessVerificationIdsByMandatoryFlag(sysparm_process_id, true);
		
		var vArr = mandatoryVerificationIds.toArray();
		for (var i = 0; i < vArr.length; i++) {
			var verificationId = mandatoryVerificationIds.get(i);
			var userEnrolled = enrollMgr.isUserEnrolledByVerificationId(userSysId, verificationId);
			if (!userEnrolled) {
				var notEnrolledMsg = "User is not enrolled (process_id = " + sysparm_process_id + ", user_sys_id = " + userSysId + ")";
				trackingMgr.createActivity(this.TYPE_WARNING, this.STAGE_IDENTIFICATION, notEnrolledMsg, request_id);
				return "user is not enrolled";
			}
			
			var verification = {};
			verification.mandatory = true;
			verification.verificationId = verificationId;
			verification.verified = false;
			userVerifications.push(verification);
		}
			
		// Retrieve and save all OPTIONAL verifications:
		var optionalVerificationIds = processManager.getProcessVerificationIdsByMandatoryFlag(sysparm_process_id, false);
		
		vArr = optionalVerificationIds.toArray();
		for (i = 0; i < vArr.length; i++) {
			verificationId = optionalVerificationIds.get(i);
			userEnrolled = enrollMgr.isUserEnrolledByVerificationId(userSysId, verificationId);
			if (userEnrolled) {
				verification = {};
				verification.mandatory = false;
				verification.verificationId = verificationId;
				verification.verified = false;
				userVerifications.push(verification);
			}
		}
		
		if (userVerifications.length < process.getMinVerifications()) {
            notEnrolledMsg = "User is not enrolled (process_id = " + sysparm_process_id + ", user_sys_id = " + userSysId + ")";
            trackingMgr.createActivity(this.TYPE_WARNING, this.STAGE_IDENTIFICATION, notEnrolledMsg, request_id);
            return "user is not enrolled";
		}

		// Update the password-reset request record (yey!, this is a valid, enrolled user):
		trackingMgr.createActivity(this.TYPE_INFO, this.STAGE_IDENTIFICATION, "User identified successfully (user_sys_id = " + userSysId + ")", request_id);
		var req = new GlideRecord('pwd_reset_request');
		if (req.get(request_id)) {
			if (req.lock_state != 0) {
				req.lock_state = 0;	// unknown
				req.update();
			}
		}
		
		return "ok";
	},
	
	/**
	* Tests if google captcha is being used or not.
	*/
	_isGoogleCaptchaUsed:function() {
		if (gs.getSession().getProperty('sysparm_is_desktop_request') == 'true') {
			return false;
		}
		return gs.getProperty('password_reset.captcha.google.enabled') == 'true';
	},
	
	_vefifyGoogleCaptchaToken:function(token){
		
		var captcha = new global.GoogleCaptcha();
		return captcha.verifyCaptcha(token);
	},	
	
	/**************
     * Provide default behavior. Since identification type is not mandatory
	 * in paswod reset process.
     * mandatory field in pwd_verification table.
     *
     * returns userSysId
     *
     * Params:
     * @sysparm_user_id
     */
    _getUserSysId: function(sysparm_user_id) {
		var gr = new GlideRecord('sys_user');
        gr.addQuery('user_name', sysparm_user_id);
        gr.query();
        if (!gr.next()) {
			return null;
        }
        return gr.sys_id;
	},	
	
	/**************
     * Params:
     * @identificationProcessorScript - Script that is used for verification
     * @sysparm_user_id
	 * @sysparm_process_id
	 * @process
	 * @returns object {status:    - signals if function has valid result 
	 *                  userSysId: - Sys-id for user or null if not found
	 *                  returnMsg
	 *                  activityLogMsg}
     */
    _getUserSysIdExtensionScript: function(identificationProcessorScript, sysparm_user_id, sysparm_process_id, process) {
		var res = {};
        res.status = false;
		try {
			// Invoke the specific identification form processor extension
			// Published interface for identification_form_processors:
			//
			// @param params.processId   The sys-id of the calling password-reset process (table: pwd_process)
		    // @param request            The form request object. fields in the form can be accessed using: request.getParameter('<element-id>')
			// @return The sys-id of the user that corresponds to the requested input; if no user was found, null should be returned.			
			var params = new SNC.PwdExtensionScriptParameter();
			params.processId = sysparm_process_id;
			var identificationExtension = new SNC.PwdExtensionScript(process.getIdentificationProcessorId());
			var identifyResult = identificationExtension.processForm(params, request);
			
            // Check we have either a null (no user found), a string or GlideElement (representing a Sys-id) result - Every other type we consider breaking the contract
            var resultType = (typeof(identifyResult) !== 'undefined') ? Object.prototype.toString.call(identifyResult).slice(8, -1).toLowerCase() : undefined;
            if (!( (resultType !== undefined && identifyResult === null)
                || (resultType === 'GlideElement'.toLowerCase()) 
                || ((resultType === 'String'.toLowerCase()) && (identifyResult.trim().length > 0))) ) {
			   
               res.activityLogMsg = "Error running identification processor " + identificationProcessorScript + ". " +
           							"Unexpected return value: " + identifyResult;

               res.returnMsg = "user identification failed";
               return res;
            }
            if (resultType !== undefined && identifyResult !== null) {
                res.userSysId = identifyResult.toString();
			}
			res.status = true;
		} catch(err) {
			// Most likely the processing script does not exists!!!
			res.activityLogMsg = "Error running identification processor " + identificationProcessorScript + ". " + err;
			res.returnMsg = "user identification failed";
		}

		return res;
	},
	
	/**************
	* returns true/false whether the captcha that is passed to the function is indeed the one that was presented to the user.
	*
	* Params:
	* @captcha - String containing the input captcha
	*/
	_verifyDefaultCaptcha: function(sysparm_captcha) {
		return new SNC.PwdImageCaptcha().validateCaptchaValue(sysparm_captcha);
	},
	
	_lockedOutError: function(userSysId, processId) {
		if (processId == this.DEFAULT_SELF_SERVICE_PROCESS_ID) {
			var grProcess = new GlideRecord("pwd_process");
			grProcess.get(processId);
			if (!grProcess.unlock_account) {
				var grUser = new GlideRecord("sys_user");
		        grUser.get(userSysId);
		        return grUser.locked_out;
			}
		}
		return false;
	},
	
    type: 'PwdVerifyIdentity'
}