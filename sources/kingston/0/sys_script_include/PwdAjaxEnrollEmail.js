var PwdAjaxEnrollEmail = Class.create();
PwdAjaxEnrollEmail.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
  PWD_MESSAGE: '7cd0c421bf200100710071a7bf0739bd',  // from sysevent_email_action
  UNSUBSCRIBE: 'c1bfa4040a0a0b8b001eeb0f3f5ee961',  // notification_filter

	
   initialize: function(request, responseXML, gc) {
    this.request = request;
    this.responseXML = responseXML;
    this.gc = gc;
    this.helper = new PwdNotificationHelper();
  },
  
  // return details of a users subscription, subscription mode
  // or email address from his/her profile, notEnrolled mode
  // PRB1116787: this is designed as a public function which returns masked info and thus no need to authorize
  getVerificationInfo:function() {
    var LOG_ID = "[PwdAjaxEnrollEmail.getVerificationInfo] ";
    var userId = this.getParameter("sysparm_user_id");
	
    var email_addr = this.helper.getEmailFromProfile(userId);
  var userSubscribed = this.helper.isUserSubscribedToEmail(userId);
    
	var mode;
    if (userSubscribed) {                         //isUserSubscribed takes (userId, except), returns bool
      mode = this.newItem("mode");
      mode.setAttribute("name", 'subscription');
      this._prepEmails(userId, true);
      this._setResponseMessage("success", "", "true");
    }
    // check if a default email exists in the system
    else if (email_addr != null) {
      mode = this.newItem("mode");
      mode.setAttribute("name", 'notEnrolled');
    
      var dev = this.newItem("email");
      dev.setAttribute("name", 'Email from User Profile');
      dev.setAttribute("email", PwdMaskHelper.maskEmail(email_addr));
       
      this._setResponseMessage("success", "", "true");
    }
    else{
      gs.log(LOG_ID + ' UNKNOWN MODE: Not Subscribed, No email in profile, yet on verification page.');
      mode = this.newItem("mode");
      mode.setAttribute("name", 'unknown');
      this._setResponseMessage("fail", gs.getMessage("Unknown situation"), "");
    }
  },

  /* Return all the Emails and their current state for the user. */
  getEmails: function() {
    var LOG_ID = "[PwdAjaxEnrollEmail.getEmails] ";
    var userId = this.getParameter("sysparm_user_id");
    
    if (!this._isAuthorizedToAccess(userId)) {
      return;
    }
    
    gs.log(LOG_ID + ' userid:' + userId + ' '); 
    this._setResponseMessage("success", "", "true");
    this._prepEmails(userId, false);
  },
  
  deleteEmail: function() {
    var LOG_ID = "[PwdAjaxEnrollEmail.deleteEmail] ";
    var deviceId = this.getParameter("sysparm_device_id");
    var userId = this.getParameter("sysparm_user_id");
    
    if (!this._isAuthorizedToAccess(userId)) {
      return;
    }
          
    if (this.helper.deleteDevice(deviceId, userId)) {
      this._setResponseMessage("success", gs.getMessage("Successfully deleted the email"), "true");
    } else {
      this._setResponseMessage("fail", gs.getMessage("Could not delete email"), "false");
    }

    this._prepEmails(userId, false);
  },
  
  /*  Add the email address and subscribe it. Return the info of the new email and subscription    */
  addEmail: function() {
    var LOG_ID = "[PwdAjaxEnrollEmail.addEmail] ";
    var userId = this.getParameter("sysparm_user_id");
    
    if (!this._isAuthorizedToAccess(userId)) {
      return;
    }
    
    var email = this.getParameter("sysparm_email_addr");
    var name = this.getParameter("sysparm_email_name");  
    

    this._addEmail(userId, email, name);
    this._prepEmails(userId, false);   
  },
  
  _addEmail: function(userId, email, name) {
    var LOG_ID = "[PwdAjaxEnrollEmail.addEmail] ";
    if(this.helper.emailExists(userId, email, 'Email')){
      gs.log(LOG_ID + ' the email address you are trying to enroll already exists.');
      this._setResponseMessage("fail", gs.getMessage("Email already exists: {0}", email), "false");
      return;
    }
    
    var newDev = this.helper.createEmail(userId, email, name);
    if(newDev == null){
      this._setResponseMessage("fail", gs.getMessage("Could not add the email: {0}", email), false);
    }
    else{
      this._setResponseMessage("success", gs.getMessage("Added the email. Click Verify to send a code to the email so you can authorize it."), "true");
    }
    
  },
	
	// Shortcut method to add the email listed on a user's profile, which skips the verification step
	addProfileEmail: function() {
		var LOG_ID = "[PwdAjaxEnrollEmail.addProfileEmail]";
		var userId = this.getParameter("sysparm_user_id");
		if (!this._isAuthorizedToAccess(userId)) 
			return;
		
		var userGr = new GlideRecord('sys_user');
		userGr.get(userId);
		var email = userGr.getValue('email');
	
		// This should be prevented on the UI! 
		if(this.helper.emailExists(userId, email, 'Email')){
			 gs.log(LOG_ID + ' the email address you are trying to enroll already exists.');
			 this._setResponseMessage("fail", gs.getMessage("Email already exists: {0}", email), "false");
			 this._prepEmails(userId, false);
			 return;
		}

		var name = gs.getMessage('User Profile Email');
		var newDev = this.helper.createEmail(userId, email, name);
		if(newDev == null) {
			this._setResponseMessage("fail", gs.getMessage("Could not add the email: {0}", email), false);
			this._prepEmails(userId, false);
			return;
		}
		
		// Usually the pwd_device is created when enrollment code is generated, but we're bypassing that step so do it here
		var devGr = new GlideRecord('pwd_device');
		devGr.setValue('status', '1'); // verified
		devGr.setValue('device', newDev);
		devGr.insert();
		
		var update = this.helper.updateDeviceSubscription(newDev, userId, '');
		if (update == null)
			this._setResponseMessage("fail", gs.getMessage("Could not authorize email: {0}", emailName), email);
		else
			this._setResponseMessage("success", gs.getMessage("Added the email from your user profile."), 'true');
		
		this._prepEmails(userId, false);
	},

  /* Update subscription of the Email. */
  updateEmailSubscription: function() {
    var LOG_ID = "[PwdAjaxEnrollEmail.updateEmailSubscription] ";
    var userId = this.getParameter("sysparm_user_id");
    
    if (!this._isAuthorizedToAccess(userId)) {
      return;
    }
    
    var email = this.getParameter("sysparm_device_id");
    var emailName = this.getParameter("sysparm_email_name");
    var subs = this.getParameter("sysparm_subscribed");
    var filter = (subs == '') ? this.UNSUBSCRIBE : '';
    
    gs.log(LOG_ID + ' update:' + update + ' subscribed:' + subs + '--filter:' + filter);

    var update = this.helper.updateDeviceSubscription(email, userId, filter);
    if (update == null) {
      if (filter == '')
          this._setResponseMessage("fail", gs.getMessage("Could not authorize email: {0}", emailName), email);
      else
        this._setResponseMessage("fail", gs.getMessage("Could not unauthorize email: {0}", emailName), email);
    } else {
      if (filter == '')
          this._setResponseMessage("success", gs.getMessage("Email {0} has been authorized successfully", emailName), email);
      else
        this._setResponseMessage("success", gs.getMessage("Email {0} has been unauthorized successfully", emailName), email);
    }
  },
  
    /* Return the list of emails.  */
	_prepEmails: function(userId, maskEmailAddr) {
		var LOG_ID = "[PwdAjaxEnrollEmail.prepEmails] ";
		
		var userGr = new GlideRecord('sys_user');
		userGr.get(userId);
		var userProfEmail = userGr.getValue('email');

		var gr = new GlideRecord('cmn_notif_device');
		gr.addActiveQuery();
		gr.addQuery('user', userId);
		gr.addQuery('type', 'Email');
		gr.addQuery('email_address', '!=', '');
		gr.orderBy('name');
		gr.query();
		while (gr.next()) {
			var isSubscribed = false;

			var grPD = GlideRecord('cmn_notif_message');
			grPD.addQuery('device', gr.getValue('sys_id'));
			grPD.addQuery('notification_filter', '');
			grPD.addActiveQuery();
			grPD.query();
			if(grPD.next()){
				isSubscribed = true;
			}

			var dev = this.newItem("email");
			dev.setAttribute("name", gr.getValue('name'));
			var email_addr = gr.getValue('email_address');
			if (maskEmailAddr) {
				email_addr = PwdMaskHelper.maskEmail(email_addr);
			}
			dev.setAttribute("email", email_addr);
			dev.setAttribute("isSubscribed", isSubscribed);
			dev.setAttribute("sys_id", gr.getValue('sys_id'));

			// check if email is verified
			dev.setAttribute("isVerified", false);
			var dvc = GlideRecord('pwd_device');
			dvc.addQuery('device', gr.getUniqueValue());
			dvc.query();
			if (dvc.next()) {
				dev.setAttribute("isVerified", (dvc.status == 1) ? true : false);
				dvc.update();
			}
			
			if (email_addr == userProfEmail)
				dev.setAttribute("isUserProfileEmail", true);
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
  
  type: 'PwdAjaxEnrollEmail'
});
