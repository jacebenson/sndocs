var PwdAjaxVerifyIdentityServiceDesk = Class.create();

PwdAjaxVerifyIdentityServiceDesk.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	TYPE_INFO: "Info",
	TYPE_WARNING: "Warning",
	TYPE_ERROR: "Error",
	
	STAGE_IDENTIFICATION: "Identification",
	STAGE_VERIFICATION: "Verification",
	STAGE_RESET: "Reset",
	
	REQUEST_TYPE : 2, // request type for service desk process
	
	isPublic: function() {
		return false;
	},

	getProcessNamesAsync: function() {
		var userId = this.getParameter('sysparm_user');
        
		if (userId != null) {
        
            var procMgr = new SNC.PwdProcessManager();
			var processIds = procMgr.getProcessIdsByUserId(userId);
			
			for (var i = 0; i < processIds.size(); i++) {
            
				var procId = processIds.get(i);
                var proc = new SNC.PwdProcess(procId); 
				
				// process needs to be reset password process
				// we do not need to show public processes
				if (!proc.isResetPwd() || proc.isPublic()) {
					continue;
				}
				
				var name = proc.getName();
				// prefix with domain name if plugin is active
				if (GlidePluginManager.isRegistered("com.glide.domain.msp_extensions.installer")) 
					name = proc.getDomainDisplayName() + ": " + name;
				
				var process = this.newItem("process");
				process.setAttribute("name", name);
				process.setAttribute("procSysId", proc.getId());
			}
		}
	},

	/* eslint-disable consistent-return */ 
	saveAndProceed: function() {
		var userSysId = this.getParameter('sysparm_user_id');
		var processSysId = this.getParameter('sysparm_procSysId');
        var process = new SNC.PwdProcess(processSysId);
		
		if (process == undefined) {
			return;
		}
		var processName = process.getName();
		
		var status = "success";
		
		// Start logging the password reset request:
		// TODO: change request type to service type
        
        var trackingMgr = new SNC.PwdTrackingManager();
		var requestId = trackingMgr.createRequest(processSysId, userSysId, gs.getSessionID(), this.REQUEST_TYPE);
        
		var isEnrolled = new SNC.PwdEnrollmentManager().isUserEnrolledByProcessId(userSysId, processSysId, requestId);
        
		if (!isEnrolled) {
			trackingMgr.createActivity(this.TYPE_ERROR, this.STAGE_IDENTIFICATION, "User not Enrolled", requestId);
			status = gs.getMessage("User is eligible for the {0} Password Reset process, but must enroll for the process.", processName);
		} else {
			trackingMgr.createActivity(this.TYPE_INFO, this.STAGE_IDENTIFICATION, "User identified successfully", requestId);
			gs.getSession().putProperty('sysparm_request_id', requestId);
			gs.getSession().putProperty('sysparm_sys_user_id', userSysId);
			gs.getSession().putProperty('sysparm_directory', this.type);
			
			// Get user name and add it to the session in case the verification fails and we need to show the user name
			var userGr = new GlideRecord('sys_user');
			userGr.get(userSysId);
			gs.getSession().putProperty('sysparm_user_input', userGr.getValue('name'));
			
			// Reset lock_state to 'Unknown'
			var req = new GlideRecord('pwd_reset_request');
			if (req.get(requestId)) {
				if (req.lock_state != 0) {
					req.lock_state = 0;	// unknown
					req.update();
				}
			}
			
			// Start workflow to retrieve the user's lock state
			var lu = new PwdUserUnlockUtil();
			lu.startGetLockStateWorkflow(requestId, userSysId);
			
			status = "success";
		}
		
		var result = this.newItem("result");
		result.setAttribute("status", status);
		
		return status;
	},
	/* eslint-enable consistent-return */
	
	clearUserEmail : function() {
		gs.getSession().putProperty('sysparm_user_email', '');
	},
	
	type: 'PwdAjaxVerifyIdentityServiceDesk'
});