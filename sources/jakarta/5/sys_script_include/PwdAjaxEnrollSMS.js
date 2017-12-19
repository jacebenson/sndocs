var PwdAjaxEnrollSMS = Class.create();
PwdAjaxEnrollSMS.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
	PWD_MESSAGE: '7cd0c421bf200100710071a7bf0739bd',  // from sysevent_email_action
	UNSUBSCRIBE: 'c1bfa4040a0a0b8b001eeb0f3f5ee961',  // notification_filter
	UNMASK_DIGIT_COUNT: 4,
	initialize: function(request, responseXML, gc) {
		this.request = request;
		this.responseXML = responseXML;
		this.gc = gc;
		this.helper = new PwdNotificationHelper();
	},
	
	// return details of a users subscription
	// or mobile from his/her profile
	// PRB1116787: this is designed as a public function which returns masked info and thus no need to authorize
	getVerificationInfo:function() {
		var LOG_ID = "[PwdAjaxEnrollSMS.getVerificationInfo] ";
		var userId = this.getParameter("sysparm_user_id");
		
		var sysPhone = this.helper.getMobileFromProfile(userId);
		if (this.helper.isUserSubscribed(userId)) {
			var mode = this.newItem("mode");
			mode.setAttribute("name", 'subscription');
			this._prepDevices(userId, true);
			this._setResponseMessage("success", "", "true");
		}
		// check if a mobile number exists in the system
		else if (sysPhone != null) {
			var mode = this.newItem("mode");
			mode.setAttribute("name", 'mobile');
			this._prepProviders();
			
			var dev = this.newItem("device");
			dev.setAttribute("name", 'Mobile from User Profile');
			dev.setAttribute("phone", this._maskPhone(sysPhone));
			
			this._setResponseMessage("success", "", "true");
		}
		else{
			gs.log(LOG_ID + ' UNKNOWN MODE: Not Subscribed, No phone in profile, yet on verification page.');
			var mode = this.newItem("mode");
			mode.setAttribute("name", 'unknown');
			this._setResponseMessage("fail", gs.getMessage("Unknown situation"), "");
		}
	},
	/* Return all the devices and their current state for the user. */
	getDevices: function() {
		var LOG_ID = "[PwdAjaxEnrollSMS.getDevices] ";
		var userId = this.getParameter("sysparm_user_id");
		
		if (!this._isAuthorizedToAccess(userId)) {
			return;
		}
		
		gs.log(LOG_ID + ' userid:' + userId + ' ');	
		this._setResponseMessage("success", "", "true");
		this._prepDevices(userId, false);
	},
	
	getProviders: function() {
		this._prepProviders();
		this._setResponseMessage("success", "", "true");
	},
	
	getCountryCodes: function() {
		this._preCountryCodes();
		this._setResponseMessage("success", "", "true");
	},
	
	_preCountryCodes: function() {
		var list = PwdCountryCode.CountryCodeList;
		for (var i = 0; i < list.length; i++) {
			var dev = this.newItem("country");
			dev.setAttribute("name", list[i].name);
			dev.setAttribute("code", list[i].code);
		}
	},
	
	deleteDevice: function() {
		var LOG_ID = "[PwdAjaxEnrollSMS.deleteDevice] ";
		var deviceId = this.getParameter("sysparm_device_id");
		var userId = this.getParameter("sysparm_user_id");
		
		if (!this._isAuthorizedToAccess(userId)) {
			return;
		}
					
		if (this.helper.deleteDevice(deviceId)) {
			this._setResponseMessage("success", gs.getMessage("Successfully deleted device"), "true");
		} else {
			this._setResponseMessage("fail", gs.getMessage("Could not delete device"), "false");
		}

		this._prepDevices(userId, false);
	},
	_prepProviders: function(userId) {
		var gr = new GlideRecord('cmn_notif_service_provider');
		gr.addActiveQuery();
		gr.addQuery('type', 'SMS');
		gr.orderBy('name');
		gr.query();
		while(gr.next()) {
			var dev = this.newItem("provider");
			dev.setAttribute("name", gr.getValue('name'));
			dev.setAttribute("sys_id", gr.getValue('sys_id'));
		}
	},
	_maskPhone: function(phone){
		var showNumDigits = this.UNMASK_DIGIT_COUNT;
		var trimmed = phone.replace(/[^0-9]/gi, '');
		var append = (function (text, times) {
			return new Array(times + 1).join(text);
		})('x', Math.max(10 - showNumDigits, trimmed.length - showNumDigits));
		
		return append + trimmed.substr(trimmed.length - showNumDigits);
	},
	/*	Add the device and subscribe it.Return the info of the new device and subscription    */
	addDevice: function() {
		var LOG_ID = "[PwdAjaxEnrollSMS.addDevice] ";
		var userId = this.getParameter("sysparm_user_id");
		
		if (!this._isAuthorizedToAccess(userId)) {
			return;
		}
		
		var phone = this.getParameter("sysparm_phone_number");
		var name = this.getParameter("sysparm_device_name");	
		
		// notification platform does not like nondigits while sending
		phone = String(phone);
		phone = phone.replace(/\D/g,'');
		
		
		var useNotify = GlidePluginManager.isRegistered('com.snc.notify');
		if (useNotify) {
			var countryCode = this.getParameter('sysparm_country_code');
			var countryName = this.getParameter('sysparm_country_name');
			gs.log(LOG_ID + ' userid:' + userId + ' phone:' + phone + ' name:' + name + ' ' + String(phone) + ' country code: ' + countryCode);
			this._addDeviceWithCountryCode(userId, phone, name, countryCode, countryName);
		}
		else {
			var provider = this.getParameter("sysparm_service_provider");	
			gs.log(LOG_ID + ' userid:' + userId + ' phone:' + phone + ' name:' + name + ' ' + String(phone) + ' provider: ' + provider);
			this._addDeviceWithProvider(userId, phone, name, provider);
		}
		
		this._prepDevices(userId, false);		
	},
	
	_addDeviceWithProvider: function(userId, phone, name, provider) {
		var LOG_ID = "[PwdAjaxEnrollSMS.addDevice] ";
		if (this.helper.deviceExists(userId, phone, provider, 'SMS')) {
			gs.log(LOG_ID + ' device already exists.');
			this._setResponseMessage("fail", gs.getMessage("Device already exists: {0}", phone), "false");
			return;
		}
		
		var newDev = this.helper.createDevice(userId, phone, provider, name); 
		if (newDev == null) {
			this._setResponseMessage("fail", gs.getMessage("Could not add device: {0}", phone), "false");
		}
		else {
			this._setResponseMessage("success", gs.getMessage("Added the device. Click Verify to send a code to the device so you can authorize it.", name), "true");
		}
	},
	
	_addDeviceWithCountryCode: function(userId, phone, name, countryCode, countryName) {
		var LOG_ID = "[PwdAjaxEnrollSMS.addDevice] ";
		if (this.helper.deviceWithCountryCodeExists(userId, phone, countryCode, 'SMS')) {
			gs.log(LOG_ID + ' device already exists.');
			this._setResponseMessage("fail", gs.getMessage("Device already exists: ({0}) {1}", [countryCode,phone]), "false");
			return;
		}
		
		var newDev = this.helper.createDeviceWithCountryCode(userId, phone, countryCode, countryName, name); 
		if (newDev == null) {
			this._setResponseMessage("fail", gs.getMessage("Could not add device: ({0}) {1}", [countryCode,phone]), "false");
		}
		else {
            this._setResponseMessage("success", gs.getMessage("Added the device. Click Verify to send a code to the device so you can authorize it.", name), "true");
		}
	},
	
	/* Update subscription of the device. */
	updateDeviceSubscription: function() {
		var LOG_ID = "[PwdAjaxEnrollSMS.updateDeviceSubscription] ";
		var userId = this.getParameter("sysparm_user_id");
		
		if (!this._isAuthorizedToAccess(userId)) {
			return;
		}
		
		var device = this.getParameter("sysparm_device_id");
		var deviceName = this.getParameter("sysparm_device_name");
		var subs = this.getParameter("sysparm_subscribed");
		var filter = (subs == '') ? this.UNSUBSCRIBE : '';
		
		gs.log(LOG_ID + ' update:' + update + ' subscribed:' + subs + '--filter:' + filter);

		var update = this.helper.updateDeviceSubscription(device, userId, filter);
		if (update == null) {
			if (filter == '')
			    this._setResponseMessage("fail", gs.getMessage("Could not authorize device: {0}", deviceName), device);
			else
				this._setResponseMessage("fail", gs.getMessage("Could not unauthorize device: {0}", deviceName), device);
		} else {
			if (filter == '')
			    this._setResponseMessage("success", gs.getMessage("Device {0} has been authorized successfully", deviceName), device);
			else
				this._setResponseMessage("success", gs.getMessage("Device {0} has been unauthorized successfully", deviceName), device);
		}
	},
	
	/* Return the list of devices..  */
	_prepDevices: function(userId, maskPhoneNumber) {
		var LOG_ID = "[PwdAjaxEnrollSMS.prepDevices] ";
		
		var gr = new GlideRecord('cmn_notif_device');
		gr.addActiveQuery();
		gr.addQuery('user', userId);
		gr.addQuery('type', 'SMS');
		gr.orderBy('name');
		gr.query();
		while (gr.next()) {
			var isSubscribed = false;
			var grNM  = GlideRecord('cmn_notif_message');
			grNM.addQuery('device', gr.getValue('sys_id'));
			grNM.addActiveQuery();
			grNM.query();
			while (grNM.next()) {
				var filter  = grNM.getValue('notification_filter'); // unsunscribe = c1bfa4040a0a0b8b001eeb0f3f5ee961
				var notif = grNM.getValue('notification');
				
				// subscribed, Good goto go
				if (filter == null && notif == this.PWD_MESSAGE)
					isSubscribed = true;
			}
			
			var dev = this.newItem("device");
			dev.setAttribute("name", gr.getValue('name'));
			var phone_number = gr.getValue('phone_number');
			if (maskPhoneNumber) {
				phone_number = this._maskPhone(phone_number);
			}
			dev.setAttribute("phone", phone_number);
			dev.setAttribute("isSubscribed", isSubscribed);
			dev.setAttribute("sys_id", gr.getValue('sys_id'));
			
			// add provider name.
			var prov = new GlideRecord("cmn_notif_service_provider");
			if (prov.get(gr.getValue("service_provider"))) {
				dev.setAttribute("provider", prov.getValue('name'));
			}
			
			
			// check if device is verified and add country name and code
			dev.setAttribute("isVerified", false);
			var dvc = GlideRecord('pwd_device');
			dvc.addQuery('device', gr.getUniqueValue());
			dvc.query();
			if (dvc.next()) {
				dev.setAttribute("isVerified", (dvc.status == 1) ? true : false);
				
				//set default country code if does no exists
				if (!dvc.country_name) {
					dvc.setValue('country_name', 'United States');
				}
				if (!dvc.country_code) {
					dvc.setValue('country_code', '+1');
				}
				dvc.update();
				
				dev.setAttribute('countryCode', dvc.country_code);
				dev.setAttribute('countryName', dvc.country_name);
			}
		}
	},
	
	_setResponseMessage: function(status, msg, value) {
		var response = this.newItem("response");
		response.setAttribute("status", status);
		response.setAttribute("message", msg);
		response.setAttribute("value", value);
	},
	
	_isAuthorizedToAccess: function(userId) {
		if (userId == gs.getUserID())
			return true;
		
		this._setResponseMessage("fail", gs.getMessage("You are not authorized to perform that action"), "");
		return false;
	},
	
	type: 'PwdAjaxEnrollSMS'
});
