gs.include('PwdNotificationHelper');

var PwdSMSEnrollmentCheck = Class.create();
PwdSMSEnrollmentCheck.prototype = {
  category: 'password_reset.extension.enrollment_check',    // DO NOT REMOVE THIS LINE!

    LOG_ID : '[PwdSMSEnrollmentCheck] ',
    PWD_MESSAGE : '7cd0c421bf200100710071a7bf0739bd',  // from sysevent_email_action    
    initialize: function() {
        this.helper = new PwdNotificationHelper();
    },  
    
  /**********
   * Returns boolean telling whether the user is enrolled.
   * 
   * @param params.enrolledUserId The sys-id of the user being checked (table: sys_user)
   * @param params.verificationId The sys-id of the verification being checked (table: pwd_verification)
   * @return boolean telling whether the user is enrolled into the specified verification
   **********/
  process: function(params) {
    return this.isEnrolled(params.verificationId, params.enrolledUserId);
  },


    // the interface to outside world
    // does the user have enough info to be considered enrolled or not.
    isEnrolled: function(verificationId, userId) {      
        // if there is at least one device subscribed to pwd_message,
        // or there is a mobile number in the system, enrollment is good.
        
        if (this.helper.isUserSubscribed(userId)) {
            return true;
        }
        // check if a mobile number exists in the system
        if (this.helper.getMobileFromProfile(userId) != null) {
            return true;
        }
        return false;
    },  
    // simple log
    _log: function(msg){
        gs.log(this.LOG_ID + ' ' + msg);
    },

  type: 'PwdSMSEnrollmentCheck'
};