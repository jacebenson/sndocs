var PwdAjaxChangePassword = Class.create();

PwdAjaxChangePassword.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	CHANGE_PASSWORD_MASTER_WORKFLOW: "Pwd Change - Master",
   
	TYPE_INFO: "Info",
	TYPE_WARNING: "Warning",
	TYPE_ERROR: "Error",
	
	STAGE_CHANGE_PWD: "Change password",
	REQUEST_TYPE : 3,        // request type for Change Password
	REQUEST_ACTION_TYPE : 4, // request action type for Change Password
	
	isPublic: function() {
		return false;
	},
	
	// return the names of the processes for a given user
	getProcessNames: function() {
		var userId = this.getParameter('sysparm_user');		
		var procMgr = new SNC.PwdProcessManager();
		var credMgr = new SNC.PwdCredentialStoreManager();
		var processIds = procMgr.getProcessIdsByUserId(userId);
		
		for (var i = 0; i < processIds.size(); i++) {
			var procId = processIds.get(i);
			var proc = new SNC.PwdProcess(procId);
			
			// process needs to be change password process
			if (!proc.isChangePwd()) {
				continue;
			}
			
			var name = proc.getName();
			// prefix with domain name if plugin is active
		    if (GlidePluginManager.isRegistered("com.glide.domain.msp_extensions.installer")) 
				name = proc.getDomainDisplayName() + ": " + name;
			
			var pwdRuleHint = credMgr.getPasswordRuleDesc(procId);
			var process = this.newItem("process");
			var pwdRule = credMgr.getPasswordRule(procId);
			var enablePasswordStrength = credMgr.getEnablePasswordStrength(procId);
			var strengthRule = credMgr.getStrengthRule(procId);
			process.setAttribute("name", name);
			process.setAttribute("pwdRuleHint", pwdRuleHint);
			process.setAttribute("pwdRule", pwdRule.replace("isPasswordValid", "isPasswordValid_" + procId));
			process.setAttribute("enablePasswordStrength", enablePasswordStrength);
			process.setAttribute("strengthRule", strengthRule.replace("calculatePasswordStrength", "calculatePasswordStrength_" + procId));
			process.setAttribute("procId", procId);
		}		
	},
	
	validatePassword: function() {
		var processId = this.getParameter('sysparam_process_id');
		var newPwd = this.getParameter("sysparam_new_password");

		var credMgr = new SNC.PwdCredentialStoreManager();
		var credId = credMgr.getCredentialStoreIdByProcessId(processId);

		var credGr = new GlideRecord('pwd_cred_store');
		if (credGr.get(credId)) {
			var pwdRule = credGr.getValue('pwd_rule');
			var pwdRuleCall = pwdRule + '\nisPasswordValid(password);';
			credGr.setValue('pwd_rule', pwdRuleCall);
			var vars = {'password' : newPwd};

			var evaluator = new GlideScopedEvaluator();
			var pwdValid = evaluator.evaluateScript(credGr, 'pwd_rule', vars);
			if (pwdValid) {
				return "success";
			}
		}

		return "failure";
	},
	
	// receiver of the change password request from ui.
	// creates a pwd reset request and kicks off the wf
	changePassword: function() {
		var userId = this.getParameter('sysparm_user');
		var procId = this.getParameter('sysparm_procId');
 		var process = new SNC.PwdProcess(procId);		
		var newPasswd = this.getParameter("sysparam_new_password");
		var oldPasswd = this.getParameter("sysparam_old_password");
		
		if (gs.nil(userId) || gs.nil(process)) {
			return;
		}
		
		var processSysId = process.getId();
		var trackingMgr = new SNC.PwdTrackingManager();
		var requestId = trackingMgr.createRequest(processSysId, userId, gs.getSessionID(), this.REQUEST_TYPE);
		trackingMgr.updateRequestActionType(requestId, this.REQUEST_ACTION_TYPE);
	
		gs.getSession().putProperty('sysparm_request_id', requestId);
		gs.getSession().putProperty('sysparm_sys_user_id', userId);
		gs.getSession().putProperty('sysparm_directory', this.type);
		
		// if locked quit - this checks if the user is blocked
        if (trackingMgr.isRequestLocked(userId, processSysId)) {
            var blockedMsg = "Cannot create request (process_id = " + processSysId + ", user_sys_id = " + userId + ") because the user is blocked.";
            trackingMgr.createActivity(this.TYPE_ERROR, this.STAGE_CHANGE_PWD, blockedMsg, requestId);
			// Leave request in progress state with retryCount of 0 - This way 
			// the next try with reuse this request and not lose one retry count.
			this._setResponseMessage("block", gs.getMessage('User is blocked'), '');					
            return;
        }		

		trackingMgr.createActivity(this.TYPE_INFO, this.STAGE_CHANGE_PWD, "User requested password change", requestId);
	
		// Start workflow to change the password				
		var ctxId = this._startChangePasswordWorkflow(requestId, userId, newPasswd, oldPasswd);		
		if (!gs.nil(ctxId)) {
			this._setResponseMessage("success", gs.getMessage("Password change was successful"), ctxId);
		} else {
			var errorMsg = gs.getMessage("Failed to start workflow: {0}", this.CHANGE_PASSWORD_MASTER_WORKFLOW);
			this._setResponseMessage("failure", errorMsg, '');
		}		
	},	
	
	_startChangePasswordWorkflow: function(requestId, userId, newPasswd, oldPasswd) {
		var wf = new Workflow();
		var workflowId = wf.getWorkflowFromName(this.CHANGE_PASSWORD_MASTER_WORKFLOW);
		
		var enc = new GlideEncrypter();
		var encypted_new_passwd = enc.encrypt(newPasswd);
		var encypted_old_passwd = enc.encrypt(oldPasswd);

		
		var gr = wf.startFlow(workflowId, null, 'update', {u_request_id : requestId, u_user_id : userId, 
														   u_new_password:encypted_new_passwd,  u_old_password:encypted_old_passwd});
		gr.next();
		var ctxId = gr.getValue('sys_id');		
		return ctxId;
	},
	
	// ui to poll for the wf status
	checkChangePwdWFState: function() {
		var ctxId = this.getParameter('sysparam_wf_context_sys_id');		
		var result = 'failure';
		var state = 'Executing';
		var gr = new GlideRecord('wf_context');
		if (gr.get(ctxId)) {
			result = gr.getValue('result');
			state = gr.getValue('state');
		}		
		this._setResponseMessage(state, gs.getMessage("Current status of workflow") , result);
	},
	
	_setResponseMessage: function(status, msg, value) {
		var response = this.newItem("response");
		response.setAttribute("status", status);
		response.setAttribute("message", msg);
		response.setAttribute("value", value);
	},
		
	type: 'PwdAjaxChangePassword'
});