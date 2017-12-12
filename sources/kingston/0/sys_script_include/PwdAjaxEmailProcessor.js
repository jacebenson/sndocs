gs.include('PwdNotificationHelper');

var PwdAjaxEmailProcessor = Class.create();
PwdAjaxEmailProcessor.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
	INVALID_REQUEST_RESPONSE: -3,
	PAUSE_WINDOW_RESPONSE: -2,
	PER_DAY_LIMIT_RESPONSE: -1,
	GENERIC_FAIL_RESPONSE: 0,
	SUCCESS_RESPONSE: 1,
	
	  // from sysevent_email_action
	PWD_SMS_MESSAGE : '7cd0c421bf200100710071a7bf0739bd',
	PWD_EMAIL_MESSAGE : 'd45a42d90b300300572a6f3ef6673a1b', 

	
	// generates code for verification.
	// Either subscription based email notification
	// or profile email based notification is used
	// depending on the mode of the operation.
	generateCode: function() {
		var LOG_ID="[PwdAjaxEmailProcesser.generateCode] ";
		var requestId = this.getParameter("sysparm_request_id");
		var verificationId = this.getParameter("sysparm_verification_id");		
	
		var helper = new PwdNotificationHelper();
		var userId = this._getUserId(requestId);	
		var mode = helper.getEmailVerificationMode(userId);
		
		var response = this.GENERIC_FAIL_RESPONSE;
		if (mode == 'subscription') {
		    response = new SNC.PwdSMSManager().generateEmailCode(requestId, verificationId);		
			if(response == this.SUCCESS_RESPONSE)
				this._sendEmailEvent(requestId, userId);	
			
		}
		else if (mode == 'notEnrolled') {
			response = this._generateCodeForNotEnrolled();
		}
		else {
			response = this.INVALID_REQUEST_RESPONSE;
		}
		this._handleResponse(response, verificationId, requestId);
	},
	// uses the email on users profile to send email code.
	_generateCodeForNotEnrolled: function(){
		/* eslint-disable no-unused-vars */
		var LOG_ID = "[PwdAjaxEmailProcesser.generateCodeForNotEnrolled] ";
		/* eslint-enable no-unused-vars */
		var requestId = this.getParameter("sysparm_request_id");
		var verificationId = this.getParameter("sysparm_verification_id");
				
		var userId = this._getUserId(requestId);
		// not very likely but just in case
		if (userId == null) {	
			gs.log(LOG_ID + 'UserId is null');
			return this.INVALID_REQUEST_RESPONSE;
		}		
		
		var helper = new PwdNotificationHelper();		
		
		// not very likely but just in case
		var email = helper.getEmailFromProfile(userId);
		if (email == null) {
			return this.INVALID_REQUEST_RESPONSE;
		}
			
		var deviceId = helper.emailEntryExists(userId, email);
		
		if(deviceId == null){
			deviceId = helper.createEmail(userId, email, "Primary Email");	
		}
				
		var response = new SNC.PwdSMSManager().generateEnrollmentCode(deviceId, verificationId);
				
		var dev = this.newItem("profile_email");
		dev.setAttribute("sys_id", deviceId);			 			
        return response; 
	},
	_getUserId: function (requestId) {
		var gr = new GlideRecord('pwd_reset_request');
		if (gr.get(requestId)) {
			return gr.getValue('user');
		}
		return null;
	},
	_handleResponse: function(response, verificationId, retVal) {
		if (response == this.SUCCESS_RESPONSE) {
			var expiry = new SNC.PwdSMSManager().getExpiryByVerificationId(verificationId);
			var msgKey = "Verification Code Sent Message";
			
			var responseMsg = gs.getMessage(msgKey, expiry);  // I18N_OK 08-04-16
			this._setResponseMessage("success", responseMsg, retVal);
			return;
		}		
		var msg = this._getResponseMsg(response, verificationId);		
		this._setResponseMessage("fail", msg, "false");		
	},
	/**
 	* Generates enrollment code for given email.
 	* This will trigger a verification code to
 	* sent to the email.
 	*/
	generateEnrollmentCode: function () {     //generates a code to verify an enrollment email
		/* eslint-disable no-unused-vars */
		var LOG_ID="[PwdAjaxEmailProcesser.generateEnrollmentCode] ";
		/* eslint-enable no-unused-vars */
		var deviceId = this.getParameter("sysparm_device_id");
		var verificationId = this.getParameter("sysparm_verification_id");
				
		var response = new SNC.PwdSMSManager().generateEnrollmentCode(deviceId, verificationId);
		
		this._handleResponse(response, verificationId, deviceId);
	},
	
	/**
     * Verify enrollment code for the given email address.
     */
    verifyEnrollmentCode: function() {
    	/* eslint-disable no-unused-vars */
		var LOG_ID="[PwdAjaxEmailProcesser.verifyEnrollmentCode] ";
		/* eslint-enable no-unused-vars */
		var deviceId = this.getParameter("sysparm_device_id");		
        var verificationId = this.getParameter("sysparm_verification_id");
        var userId = this.getParameter("sysparm_user_id");
        var code = this.getParameter("sysparm_email_code");
		
        var emailMgr = new SNC.PwdSMSManager();		
		if (emailMgr.verifyEnrollmentCode(deviceId, verificationId, code)) {
			var msg = gs.getMessage('The email has been authorized');
            this._setResponseMessage("success", msg, deviceId);
            var helper = new PwdNotificationHelper();
            helper.subscribeDevice(deviceId, userId);
            return;
        }
        this._setResponseMessage("fail", gs.getMessage("The verification code does not match"), "false");
        return;
    },
	
	/**
 	* Get response message based on response code
 	*/
	_getResponseMsg: function (response, verificationId) {
		var msg = gs.getMessage('Could not generate a verification code');
		switch (response) {
			case this.GENERIC_FAIL_RESPONSE:
				msg = gs.getMessage('Could not generate a verification code');
				break;
			case this.PER_DAY_LIMIT_RESPONSE:
				var per_day_limit = this._getVerificationParam(verificationId, "max_per_day", "password_reset.sms.max_per_day");
				msg = gs.getMessage('Cannot send more than {0} verification codes in a day', [per_day_limit]);
				break;
			case this.PAUSE_WINDOW_RESPONSE:
				var pause_window = this._getVerificationParam(verificationId, "pause_window", "password_reset.sms.pause_window");
				msg = gs.getMessage('You can send a new code after {0} minutes', pause_window);
				break;
			case this.INVALID_REQUEST_RESPONSE:
				msg = gs.getMessage('Your password reset request is no longer valid. Submit another request.');
				break;
			default:
		}
		return msg;
	},
	
	_getVerificationParam: function (verificationId, parameter, property) {
		var value = new SNC.PwdVerificationManager().getVerificationParamValue(verificationId, parameter);
		if (value == null) {
			value = GlideProperties.get(property,'0');
		}
		return value;
	},
	
	_setResponseMessage: function(status, msg, value)
	{
		var response = this.newItem("response");
		response.setAttribute("status", status);
		response.setAttribute("message", msg);
		response.setAttribute("value", value);
		},
	

	_sendEmailEvent: function(requestId, userId){	
		var LOG_ID = "[PwdAjaxEmailProcessor._generateSendEmailEvent]";
		var subscribedEmails = [], verifiedEmails = [];
		var notifMessages = this.PWD_SMS_MESSAGE + ',' + this.PWD_EMAIL_MESSAGE;

		//grabbing all subscribed devices and emails
		//some email records use SMS notification for reference
		var cnmGr = new GlideRecord('cmn_notif_message');
		cnmGr.addActiveQuery();
		cnmGr.addQuery('user', userId);
		cnmGr.addQuery('notification_filter', '');
		cnmGr.addQuery('notification', 'IN', notifMessages);
		cnmGr.query();
		while(cnmGr.next())
			subscribedEmails.push(cnmGr.getValue('device'));
		

		//grabbing verified devices that match subscribed devices
		var pdGr = new GlideRecord('pwd_device');
		pdGr.addActiveQuery();
		pdGr.addQuery('device', 'IN', subscribedEmails.join(','));
		pdGr.addQuery('status', 1);   //Verified
		pdGr.query();
		while(pdGr.next())
			verifiedEmails.push(pdGr.getValue('device'));
		

		var cndGr = new GlideRecord('cmn_notif_device');
		cndGr.addActiveQuery();
		cndGr.addQuery('sys_id','IN', subscribedEmails.join(','));
		cndGr.addQuery('sys_id','IN', verifiedEmails.join(','));
		cndGr.addQuery('type', 'Email');
		cndGr.query();
	
		if (cndGr.hasNext()){
			var code = new SNC.PwdSMSManager().getLastEmailCode(requestId);
			while(cndGr.next())
				gs.eventQueue('pwd.send_email_code.trigger', cndGr, cndGr.getValue('email_address'), code);
			
		}
	},
		
	type:PwdAjaxEmailProcessor
});