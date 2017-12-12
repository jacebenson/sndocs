(function(data) {
	var user_id = gs.getUser().getID();
	data.procId = gs.getProperty('glide.service_portal.default_password_process', 'c6b0c20667100200a5a0f3b457415ad5');
	data.password_hint = getPasswordHint(data.procId);
	
	if (input && input.action === 'update') {
		var enc = new GlideEncrypter();
		var encypted_new_passwd = enc.encrypt(input.new_password);
		var encypted_old_passwd = enc.encrypt(input.old_password);
		var process = new SNC.PwdProcess(data.procId);
		var processSysId = process.getId();
		var trackingMgr = new SNC.PwdTrackingManager();
		var requestId = trackingMgr.createRequest(processSysId, user_id, gs.getSessionID(), 3);// 3: request type for Change Password
		trackingMgr.updateRequestActionType(requestId, 4);// 4: request action type for Change Password

		var wf = new Workflow();
		var workflowId = wf.getWorkflowFromName('Pwd Change - Master');

		var gr = wf.startFlow(workflowId, null, 'update', {
			u_request_id : requestId,
			u_user_id : user_id,
			u_new_password : encypted_new_passwd,
			u_old_password : encypted_old_passwd
		});
		gr.next();
		var ctxId = gr.getValue('sys_id');

		// check password changed or not
		var wf_gr = new GlideRecord('wf_context');
		if (wf_gr.get(ctxId)) {
			data.result = wf_gr.getValue('result');
			data.state = wf_gr.getValue('state');
		}
	}

	data.newPasswordMsg = gs.getMessage("New Password");
	data.currentPasswordMsg = gs.getMessage("Current Password");
	data.confirmPasswordMsg = gs.getMessage("Confirm Password");
	data.complexityMsg = gs.getMessage("Invalid password: " + data.password_hint);
	data.successMsg = gs.getMessage('Your password has been changed successfully!');
	data.wrongPasswordMsg = gs.getMessage('The old password you provided does not match our records.');
	data.reusedPasswordMsg = gs.getMessage('New password cannot be same as your current password.');
	data.notMatchMsg = gs.getMessage('Passwords must match.');

	function getPasswordHint(procId) {
		var credMgr = new SNC.PwdCredentialStoreManager();
		var credId = credMgr.getCredentialStoreIdByProcessId(procId);
		var credGr = new GlideRecord('pwd_cred_store');
		if (credGr.get(credId)) { 
			return credGr.pwd_rule_hint;
		}
	}
	
})(data);