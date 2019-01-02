var PwdAjaxVerifyIdentity = Class.create();

PwdAjaxVerifyIdentity.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
	TYPE_INFO: "Info",
	TYPE_WARNING: "Warning",
	TYPE_ERROR: "Error",
	
	STAGE_IDENTIFICATION: "Identification",
	
	/**
	* This function makes this AJAX public. By default, all AJAX server side is private.
	*/
	isPublic: function() {
		return true;
	},
	
	/************
	* Server side Ajax processor for checking the identity of a user.
	*
	* Required Request Parameters:
	*  @sysparm_process_id - the password reset process-ID.
	*  @sysparm_user_id    - the user identification (email address) that the user entered.
	*  @sysparm_captcha    - the captcha that the user entered or whatever ReCaptcha gives us.
	*
	* Return value:
	* "ok"     - if user exists & is enrolled for the process.
	* "block"  - If too many attempts where made, and we'd like to block this IP. // TODO
	* <error>  - Any other string, with the error (reason for failing); For example: "user does not exists", "user in not enrolled"
	*
	***********/
	/* eslint-disable consistent-return */ 
	verifyIdentity: function() {
		// check the security before anything else. If any violation is found, then just return.
		if(!this._validateSecurity()){
			return;
		}
		
		// Intentionally delay the response to ensure "bots" cannot attempt this ajax calls too frequently:
		var milli = GlideProperties.getInt('password_reset.verification.delay', 1000);
		new SNC.PwdUtil().sleep(milli);
		
		// Retrieve input params from form fields:
		/* eslint-disable no-undef */
		var sysparm_process_id = request.getParameter("sysparm_process_id");
		var sysparm_user_id = request.getParameter("sysparm_user_id");
		var sysparm_captcha = request.getParameter("sysparm_captcha");
		/* eslint-enable no-undef */
		
		// verify identity
		var pwdVerifyIdentity = new PwdVerifyIdentity();
		var res = pwdVerifyIdentity.verifyIdentity(sysparm_process_id, sysparm_user_id, sysparm_captcha);
		
		// verification failed, return error message
		if(res != "ok"){
			return res;
		}
		
		// Start a workflow to retrieve the user's lock state
		var lu = new PwdUserUnlockUtil();
		lu.startGetLockStateWorkflow(gs.getSession().getProperty('sysparm_request_id'), gs.getSession().getProperty('sysparm_sys_user_id'));
		
		// Skip the reset process for LDAP users when using self service password reset.
		if(sysparm_process_id == 'c6b0c20667100200a5a0f3b457415ad5' && SNC.PasswordResetUtil.isLDAPUser(sysparm_user_id))
			return "ldap_user";
		
		return "ok";
	},
	/* eslint-enable consistent-return */
	

	type: 'PwdAjaxVerifyIdentity'
});