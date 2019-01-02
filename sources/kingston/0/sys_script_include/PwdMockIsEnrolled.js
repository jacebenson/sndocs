var PwdMockIsEnrolled = Class.create();
PwdMockIsEnrolled.prototype = {
    initialize: function() {
    },

    category: 'password_reset.extension.enrollment_check',    // DO NOT REMOVE THIS LINE!

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
		var enrollmentGr = new GlideRecord('pwd_enrollment');
		enrollmentGr.addQuery('verification', verificationId);
		enrollmentGr.addQuery('user', userId);
		enrollmentGr.addQuery('status', 1 /* Active */);
		enrollmentGr.query();
		return enrollmentGr.next();
	},

    type: 'PwdMockIsEnrolled'
};
