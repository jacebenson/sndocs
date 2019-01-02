var PwdNotificationHelper = Class.create();
PwdNotificationHelper.prototype = {
	PWD_MESSAGE : '7cd0c421bf200100710071a7bf0739bd',  // from sysevent_email_action
	UNSUBSCRIBE : 'c1bfa4040a0a0b8b001eeb0f3f5ee961',  // notification_filter
	
	initialize: function() {
	},
	/*
	  Update the subscription, either unsubscribe or subscribe
	  filter = '' means subscribe
	  filter == this.UNSUBSCRIBE means unsubscribe;
	*/	
	updateDeviceSubscription: function(device, userId, filter) {
		var notif = new GlideRecord('cmn_notif_message');
		notif.addQuery('notification', this.PWD_MESSAGE);
		notif.addQuery('device', device);
		notif.addQuery('user', userId);
		notif.query();
		if (notif.next()) {
   		// TODO: do the update only if filter is different than what it is already
		   notif.setValue('notification_filter', filter);
		   return notif.update();
		} else {
		   return this.subscribeDevice(device, userId);
		}
	},
	// is there's a device for the phone and user given return true
	deviceExistsForPhone: function(userId, phone) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.addActiveQuery();
		dev.addQuery('phone_number', phone);
		dev.addQuery('user', userId);
		dev.query();
		
		if (dev.next()) {
			return dev.getValue('sys_id');
		}
		return null;
	},
	deleteDevice: function(deviceId) {
		var dev = new GlideRecord('cmn_notif_device');
		if (dev.get(deviceId)) {
		    //PRB1104617: Avoid triggering Notification team business rule for redirecting
		    dev.setWorkflow(false);
			return dev.deleteRecord();
		}
		return false;
	},
	updateProvider: function(deviceId, provider) {
		var dev = new GlideRecord('cmn_notif_device');
		if (dev.get(deviceId)) {
			dev.setValue('service_provider', provider);
			return dev.update();
		}
		return false;
	},
	// create an SMS device for the given info
	createDevice: function(userId, phone, provider, name) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.setValue('name', name);
		dev.setValue('phone_number', phone);
		dev.setValue('service_provider', provider);
		dev.setValue('type', 'SMS');
		dev.setValue('user', userId);
		return dev.insert();
	},
	
	// create an SMS device for the given info with country code
	createDeviceWithCountryCode: function(userId, phone, countryCode, countryName, name) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.setValue('name', name);
		dev.setValue('phone_number', phone);
		dev.setValue('type', 'SMS');
		dev.setValue('user', userId);
		
		if (!dev.insert()) return null; 
		
		// create pwd device
		var pwdDev = new GlideRecord('pwd_device');
		pwdDev.initialize();
		pwdDev.setValue('device', dev.getValue('sys_id'));
		pwdDev.setValue('country_code', countryCode);
		pwdDev.setValue('country_name', countryName);
		pwdDev.setValue('status', '0'); // Pwd Device model INPROGRESS status
		return pwdDev.insert();
	},
	
	// check if device exists with provider
	deviceExists: function(userId, phone, provider, deviceType) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.addQuery('user', userId);
		dev.addQuery('phone_number', phone);
	    dev.addQuery('service_provider', provider);
		dev.addQuery('type', deviceType);
		dev.query();
		return dev.hasNext();
	},
	
	// check if device exists with country code
	deviceWithCountryCodeExists: function(userId, phone, countryCode, deviceType) {
		var dev = new GlideRecord('cmn_notif_device');
		dev.addQuery('user', userId);
		dev.addQuery('phone_number', phone);
		dev.addQuery('type', deviceType);
		dev.query();
		
		if (dev.next()) {
			var gr = new GlideRecord('pwd_device');
			gr.addQuery('device', dev.getValue('sys_id'));
			gr.addQuery('country_code', countryCode);
			gr.query();
			return gr.hasNext();
		}
		return false;
	},
	
	//subscribe the device to pwd notification
	subscribeDevice: function(device, userId) {
		var notif = new GlideRecord('cmn_notif_message');
		notif.initialize();
		notif.setValue('notification', this.PWD_MESSAGE);
		notif.setValue('device', device);
		notif.setValue('user', userId);
		return notif.insert();
	},
	// get the mobile phone number from users profile
	getMobileFromProfile: function(userId){
		var phone = null;
		var prof = new GlideRecord('sys_user');
		if (prof.get(userId)){
			phone = prof.getValue('mobile_phone');
		}
		return phone;
	},
	/*
	   Does the user have a device subscribed to pwd_message?
	   We enforce the user to have at least one device during enrollment.
	   We have business rule to avoid user unsubscribe from notification preferences.
	   So this is an double check mechanism to make sure we are still good. 
 	   'Except' is the device id excluded from the query. It's usefull for 
	   checking if the device is the last subscribed device.
        */
	isUserSubscribed: function(userId, except) {
		var found = false;
		var grNM  = GlideRecord('cmn_notif_message');
		grNM.addActiveQuery();
		grNM.addQuery('notification', this.PWD_MESSAGE);
		grNM.addQuery('user', userId);
		grNM.addQuery('notification_filter', '');
		var qc = grNM.addJoinQuery('cmn_notif_device', 'device','sys_id');
		qc.addCondition('type', 'SMS');
		qc.addCondition('active', 'true');
		if (!gs.nil(except)) {
			qc.addCondition('sys_id', '<>', except);
		}
		grNM.query();
		while(grNM.next()) {
			this._log('Found at least one subscribed device.');
			found = true;
			break;
		}
		grNM.close();
		return found;
	},
	isDeviceSubscribed: function(userId, deviceId) {
		var grNM  = GlideRecord('cmn_notif_message');
		grNM.addActiveQuery();
		grNM.addQuery('notification', this.PWD_MESSAGE);
		grNM.addQuery('user', userId);
		grNM.addQuery('notification_filter', '');
		grNM.addQuery('device', deviceId);
		grNM.query();
		if (grNM.next()) { 
			return true;
		}
		return false;
	},
	type: 'PwdNotificationHelper'
};