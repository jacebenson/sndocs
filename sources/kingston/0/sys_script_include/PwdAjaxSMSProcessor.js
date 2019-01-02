gs.include('PwdNotificationHelper');

var PwdAjaxSMSProcessor = Class.create();
PwdAjaxSMSProcessor.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
	INVALID_REQUEST_RESPONSE: -3,
	PAUSE_WINDOW_RESPONSE: -2,
	PER_DAY_LIMIT_RESPONSE: -1,
	GENERIC_FAIL_RESPONSE: 0,
	SUCCESS_RESPONSE: 1,
	
	PWD_SMS_MESSAGE : '7cd0c421bf200100710071a7bf0739bd',  // from sysevent_email_action

	
	// generates sms code for verification.
	// Either subscription based SMS notification
	// or individual device based SMS notification is used
	// based on the mode of the operation.
	generateCode: function() {
		var LOG_ID="[PwdAjaxSMSProcesser.generateCode] ";
		var requestId = this.getParameter("sysparm_request_id");
		var verificationId = this.getParameter("sysparm_verification_id");		
		var mode = this.getParameter("sysparm_sms_verification_mode");
	
		var response = this.GENERIC_FAIL_RESPONSE;
		if (mode == 'subscription') {
		    response = new SNC.PwdSMSManager().generateSMSCode(requestId, verificationId);
			if(response == this.SUCCESS_RESPONSE)
				this._sendSMSEvent(requestId, this._getUserId(requestId));
			
		}
		else if (mode == 'mobile') {
			response = this._generateCodeForMobile();
		}
		else {
		    gs.log(LOG_ID + 'Unknown mode!');
			response = this.INVALID_REQUEST_RESPONSE;
		}
		
		this._handleResponse(response, verificationId, requestId);
	},
	// uses the mobile number on users profile
	// to send SMS code.
	_generateCodeForMobile: function(){
		/* eslint-disable no-unused-vars */
		var LOG_ID = "[PwdAjaxSMSProcesser.generateCodeForMobile] ";
		/* eslint-enable no-unused-vars */
		var requestId = this.getParameter("sysparm_request_id");
		var verificationId = this.getParameter("sysparm_verification_id");
		var providerId = this.getParameter("sysparm_service_provider");
				
		var userId = this._getUserId(requestId);
		// not very likely but just in case
		if (userId == null) {			
			return this.INVALID_REQUEST_RESPONSE;
		}		
		
		var helper = new PwdNotificationHelper();		
		
		// not very likely but just in case
		var phone = helper.getMobileFromProfile(userId);
		if (phone == null) {
			return this.INVALID_REQUEST_RESPONSE;
		}
		
		//remove non digits
		phone = String(phone);
		phone = phone.replace(/\D/g,'');		
		var deviceId = helper.deviceExistsForPhone(userId, phone);
		if (deviceId == null){
			deviceId = helper.createDevice(userId, phone, providerId, 'Mobile from User profile');			
		} 
		else if (!helper.updateProvider(deviceId, providerId)) {
			return this.GENERIC_FAIL_RESPONSE;
		}
		
		var response = new SNC.PwdSMSManager().generateEnrollmentCode(deviceId, verificationId);
		var dev = this.newItem("profile_device");
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
 	* Generats enrollment code for given device.
 	* This will trigger an SMS notification to
 	* sent to the device.
 	*/
	generateEnrollmentCode: function () {
		/* eslint-disable no-unused-vars */
		var LOG_ID="[PwdAjaxSMSProcesser.generateEnrollmentCode] ";
		/* eslint-enable no-unused-vars */
		var deviceId = this.getParameter("sysparm_device_id");
		var verificationId = this.getParameter("sysparm_verification_id");
				
		var response = new SNC.PwdSMSManager().generateEnrollmentCode(deviceId, verificationId);
		
		this._handleResponse(response, verificationId, deviceId);
	},
	
	/**
     * Verify enrollment code for the given device.
     */
    verifyEnrollmentCode: function() {
    	/* eslint-disable no-unused-vars */
		var LOG_ID="[PwdAjaxSMSProcesser.verifyEnrollmentCode] ";
		/* eslint-enable no-unused-vars */
		var deviceId = this.getParameter("sysparm_device_id");		
        var verificationId = this.getParameter("sysparm_verification_id");
        var userId = this.getParameter("sysparm_user_id");
        var code = this.getParameter("sysparm_sms_code");
        
        var smsMgr = new SNC.PwdSMSManager();
        if (smsMgr.verifyEnrollmentCode(deviceId, verificationId, code)) {
			var msg = gs.getMessage('The device has been authorized');
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
				msg = gs.getMessage('You can send a new verification code after {0} minutes', pause_window);
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
	
	_sendSMSEvent: function(requestId, userId){	
		var LOG_ID = "[PwdAjaxSMSProcessor._sendSMSEvent]";
		var subscribedDevices = [], verifiedDevices = [];

		//grabbing all subscribed devices
		var cnmGr = new GlideRecord('cmn_notif_message');
		cnmGr.addActiveQuery();
		cnmGr.addQuery('user', userId);
		cnmGr.addQuery('notification_filter', '');
		cnmGr.addQuery('notification', this.PWD_SMS_MESSAGE);
		cnmGr.query();
		while(cnmGr.next())
			subscribedDevices.push(cnmGr.getValue('device'));
		

		//grabbing verified devices that match subscribed devices
		var pdGr = new GlideRecord('pwd_device');
		pdGr.addActiveQuery();
		pdGr.addQuery('device', 'IN', subscribedDevices.join(','));
		pdGr.addQuery('status', 1);   //Verified
		pdGr.query();
		while(pdGr.next())
			verifiedDevices.push(pdGr.getValue('device'));
		

		var cndGr = new GlideRecord('cmn_notif_device');
		cndGr.addActiveQuery();
		cndGr.addQuery('sys_id','IN', subscribedDevices.join(','));
		cndGr.addQuery('sys_id','IN', verifiedDevices.join(','));
		cndGr.addQuery('type', 'SMS');
		cndGr.query();
	
		if (cndGr.hasNext()){
			var code = new SNC.PwdSMSManager().getLastSMSCode(requestId);
			while(cndGr.next())
				//email_address is preconstructed in cmn_notif_device
				gs.eventQueue('pwd.send_sms_code.trigger', cndGr, cndGr.getValue('email_address'), code);
			
		}
	},
		
	type:PwdAjaxSMSProcessor
});