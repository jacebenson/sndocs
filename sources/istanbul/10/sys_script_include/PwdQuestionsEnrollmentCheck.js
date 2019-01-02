var PwdQuestionsEnrollmentCheck = Class.create();
PwdQuestionsEnrollmentCheck.prototype = {
  category: 'password_reset.extension.enrollment_check',    // DO NOT REMOVE THIS LINE!

  LOG_ID : '[PwdQuestionsEnrollmentCheck] ',
  
  initialize: function() {
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
    
    isEnrolled: function(verificationId, userId) {
        this._log('Regular enrollment check for security questions');
        var enrolledCount = this._getEnrolledCount(verificationId, userId);
        var requiredCount = this._getRequiredCount(verificationId);
        if (enrolledCount < requiredCount){
            this._log("Enrollment is not complete because there is not enough questions enrolled.");
            return false;
        }
        this._log('Regular enrollment check verified user is enrolled with ' + requiredCount + ' ver:' + verificationId);
        return true;
    },
    // simple log
    _log: function(msg){
        gs.log(this.LOG_ID + ' ' + msg);
    },
    // get number of questions currently enrolled
    _getEnrolledCount: function(verificationId, userId){
        var gr_answers = new GlideRecord('pwd_active_answer');
        gr_answers.addJoinQuery('pwd_enrollment', 'enrollment', 'sys_id');
        gr_answers.addQuery('enrollment.verification', verificationId);
        gr_answers.addQuery('enrollment.user', userId);
        gr_answers.query();
        return gr_answers.getRowCount()
    },
    // get number of questions required for enrollment
    _getRequiredCount: function(verificationId){
        var required = 0;
        var grParam = new GlideRecord('pwd_verification_param');    
        grParam.addQuery('verification', verificationId);
        grParam.addQuery('name', 'num_enroll');
        grParam.query();
        if (grParam.next())
            required = parseInt(grParam.getValue('value'));
        grParam.close();
        return required;
    },

  type: 'PwdQuestionsEnrollmentCheck'

};