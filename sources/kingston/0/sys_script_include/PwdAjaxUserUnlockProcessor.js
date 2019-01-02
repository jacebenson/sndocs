/*
 * Class is a Ajax processor which handles password reset workflow related functionality.
 */
var PwdAjaxUserUnlockProcessor = Class.create();
PwdAjaxUserUnlockProcessor.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
	
	TYPE_INFO: "Info",
	TYPE_WARNING: "Warning",
	TYPE_ERROR: "Error",
	
	STAGE_IDENTIFICATION: "Identification",
	STAGE_VERIFICATION: "Verification",
	STAGE_RESET: "Reset",
	
	GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW: "Pwd Get Lock State - Master",
	UNLOCK_ACCOUNT_MASTER_WORKFLOW: "Pwd Unlock Account - Master",
	
	// This function makes this AJAX public. By default, all AJAX server side is private.
	isPublic: function() {
		return true;
	},
	
	// ---------------------------------------------------------------------------------
	// ------------- Handle the retrieval of the account lock status : -----------------
	// ---------------------------------------------------------------------------------
	
	
	// This AJAX function returns the wf status based upon the wf_context table.
	/* eslint-disable consistent-return */ 
	pollLockStateFromRequest: function() {
		// check the security before anything else.
		if(!this._validateSecurity()) {
			return;
		}
		var requestId = this.getParameter("sysparam_request_id");
		
		var lockState = 0 // unknown;
		
		var gr = new GlideRecord('pwd_reset_request');
		if (gr.get(requestId)) {
			lockState = gr.getValue('lock_state');
		}
		
		return lockState;
	},
	/* eslint-enable consistent-return */
	
	
	// This AJAX function starts a workflow that checks the user's lock state.
	// In case of an exception, will send an error message back to client.
	initiateGetLockStateWF: function() {
		// check the security before anything else.
		if(!this._validateSecurity()) {
			return;
		}
		
		var LOG_ID = "[PwdAjaxUserUnlockProcessor:initiateGetLockStateWF] ";
		var wfCtxId = "";
		
		var requestId = this.getParameter("sysparam_request_id");
		var userId = this.getParameter("sysparam_sys_user_id");
		
		// return error if the request is not verified:
		var trackingMgr = new SNC.PwdTrackingManager();
		if (!trackingMgr.requestVerified(requestId)) {
			var requestMsg = gs.getMessage("{0} Could not verify request: {1}", [LOG_ID, requestId]);
			this._setResponseMessage("failure", requestMsg, requestId);
			return;
		}
		
		wfCtxId = this._startWorkflow(this.GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW, requestId, userId);
		
		if (wfCtxId == undefined) {
			var errorMsg = gs.getMessage("{0} Failed to start workflow: {1}", [LOG_ID, this.GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW]);
			this._setResponseMessage("failure", errorMsg, requestId);
			return;
		}
		
		this._setResponseMessage("success", "The request has been successfully completed", wfCtxId);
	},
	
	
	// This AJAX function returns the wf status based upon the wf_context table.
	checkGetLockStateWFState: function() {
		// check the security before anything else.
		if(!this._validateSecurity())
			return;
		
		var ctxId = this.getParameter('sysparam_wf_context_sys_id');
		var result = 'failure';
		var state = 'Executing';
		var gr = new GlideRecord('wf_context');
		if (gr.get(ctxId)) {
			result = gr.getValue('result');
			state = gr.getValue('state');
		}
		
		var response = this.newItem("response");
		response.setAttribute("state", state);
		response.setAttribute("result", result);
	},
	
	// ---------------------------------------------------------------------------------
	// ------------------------ Handle the account unlocking: --------------------------
	// ---------------------------------------------------------------------------------
	
	// This AJAX function starts a workflow that unlocks the account:
	initiateUnlockWF: function() {
		// check the security before anything else.
		if(!this._validateSecurity()) {
			return;
		}
		
		var LOG_ID = "[PwdAjaxUserUnlockProcessor:initiateGetLockStateWF] ";
		var wfCtxId = "";
		
		var requestId = this.getParameter("sysparam_request_id");
		var userId = this.getParameter("sysparam_sys_user_id");
		
		// return error if the request is not verified:
		var trackingMgr = new SNC.PwdTrackingManager();
		if (!trackingMgr.requestVerified(requestId)) {
			var requestMsg = gs.getMessage("{0} Could not verify request: {1}", [LOG_ID, requestId]);
			this._setResponseMessage("failure", requestMsg, requestId);
			return;
		}
		
		this._updateRequestAction(requestId, '2');
		
		wfCtxId = this._startWorkflow(this.UNLOCK_ACCOUNT_MASTER_WORKFLOW, requestId, userId);
		
		if (wfCtxId == undefined) {
			var errorMsg = gs.getMessage("{0} Failed to start workflow: {1}", [LOG_ID, this.UNLOCK_ACCOUNT_MASTER_WORKFLOW]);
			this._setResponseMessage("failure", errorMsg, requestId);
			return;
		}
		
		this._setResponseMessage("success", gs.getMessage("The request has been successfully completed"), wfCtxId);
	},
	
	
	// This AJAX function returns the wf status based upon the wf_context table:
	checkUnlockWFState: function() {
		// check the security before anything else.
		if(!this._validateSecurity())
			return;
		
		var ctxId = this.getParameter("sysparam_wf_context_sys_id");
		var result = 'failure';
		var state = 'Executing';
		var gr = new GlideRecord('wf_context');
		if (gr.get(ctxId)) {
			result = gr.getValue('result');
			state = gr.getValue('state');
		}
		
		var response = this.newItem("response");
		response.setAttribute("state", state);
		response.setAttribute("result", result);
		
		// If workflow is finished, pass additional workflow results:
		if (state.match(/finished/i)) {
			this._getWFContext(ctxId);
			this._getWFHistory(ctxId);
			this._setResponseMessage("success", gs.getMessage("The request has been successfully completed") ,ctxId);
		}
	},
	

	// -----------------------------------------------------------------
	// ---------------------- Common utilities: ------------------------
	// -----------------------------------------------------------------

	// Starts a new workflow and returns the new workflow sys Id.
	_startWorkflow: function(workflowName, requestId, userId) {
		var wf = new Workflow();
		var workflowId = wf.getWorkflowFromName(workflowName);

		var gr = wf.startFlow(workflowId, null, 'update',{u_request_id : requestId, u_user_id : userId});
		gr.next();
		var ctxId = gr.getValue('sys_id');
		return ctxId;
	},

	
	_setResponseMessage: function(status, msg, value) {
		var response = this.newItem("response");
		response.setAttribute("status", status);
		response.setAttribute("message", msg);
		response.setAttribute("value", value);
	},
	
	_updateRequestAction: function(requestId, value) {
		var gr = new GlideRecord('pwd_reset_request');
		if(gr.get(requestId)) {
			gr.setValue('action_type', value);
			gr.update();
		}
	},
	
	
	_getWFContext: function(ctxId) {
		var gr = new GlideRecord('wf_context');
		if (gr.get(ctxId)) {
			var ctx = this.newItem('context');
			ctx.setAttribute('workflow', gr.getValue('workflow'));
			ctx.setAttribute('workflow_version', gr.getValue('workflow_version'));
			ctx.setAttribute('parent', gr.getValue('parent'));
			ctx.setAttribute('table', gr.getValue('table'));
			ctx.setAttribute('id', gr.getValue('id'));
			ctx.setAttribute('state', gr.getValue('state'));
			ctx.setAttribute('started', gr.getValue('started'));
			ctx.setAttribute('ended', gr.getValue('ended'));
			ctx.setAttribute('due', gr.getValue('due'));
			ctx.setAttribute('stage', gr.getValue('stage'));
			ctx.setAttribute('result', gr.getValue('result'));
			ctx.setAttribute('scratchpad', gr.getValue('scratchpad'));
			ctx.setAttribute('active', gr.getValue('active'));
			ctx.setAttribute('active_count', gr.getValue('active_count'));
			ctx.setAttribute('active_index', gr.getValue('active_index'));
			ctx.setAttribute('after_business_rules', gr.getValue('after_business_rules'));
			ctx.setAttribute('sys_id', gr.getValue('sys_id'));
			ctx.setAttribute('started_by', gr.getValue('started_by'));
			ctx.setAttribute('auto_start', gr.getValue('auto_start'));
			ctx.setAttribute('sys_domain', gr.getValue('sys_domain'));
			ctx.setAttribute('schedule', gr.getValue('schedule'));
			ctx.setAttribute('timezone', gr.getValue('timezone'));
			ctx.setAttribute('sys_id', gr.getValue('sys_id'));
			ctx.setAttribute('sys_updated_by', gr.getValue('sys_updated_by'));
			ctx.setAttribute('sys_updated_on', gr.getValue('sys_updated_on'));
			ctx.setAttribute('sys_created_by', gr.getValue('sys_created_by'));
			ctx.setAttribute('sys_created_on', gr.getValue('sys_created_on'));
			ctx.setAttribute('sys_domain', gr.getValue('sys_domain'));
			ctx.setAttribute('sys_mod_count', gr.getValue('sys_mod_count'));
		}
	},
	
	
	_getWFHistory: function(ctxId) {
		var gr = new GlideRecord('wf_history');
		gr.addQuery('context', ctxId);
		gr.orderBy('activity_index');
		gr.addJoinQuery('wf_activity', 'activity', 'sys_id');
		gr.query();
		
		while(gr.next()) {
			var history = this.newItem('history');
			history.setAttribute('workflow_version', gr.getValue('workflow_version'));
			history.setAttribute('context', gr.getValue('context'));
			var activity = gr.getValue('activity');
			history.setAttribute('activity', activity);
			this._getWFActivity(activity);
			history.setAttribute('parent', gr.getValue('parent'));
			history.setAttribute('is_parent', gr.getValue('is_parent'));
			history.setAttribute('started', gr.getValue('started'));
			history.setAttribute('ended', gr.getValue('ended'));
			history.setAttribute('due', gr.getValue('due'));
			history.setAttribute('state', gr.getValue('state'));
			history.setAttribute('activity_result', gr.getValue('result'));
			history.setAttribute('fault_description', gr.getValue('fault_description'));
			history.setAttribute('output', gr.getValue('output'));
			history.setAttribute('activity_index', gr.getValue('activity_index'));
			history.setAttribute('rolled_back_by', gr.getValue('rolled_back_by'));
			history.setAttribute('sys_domain', gr.getValue('sys_domain'));
			history.setAttribute('sys_updated_by', gr.getValue('sys_updated_by'));
			history.setAttribute('sys_updated_on', gr.getValue('sys_updated_on'));
			history.setAttribute('sys_created_by', gr.getValue('sys_created_by'));
			history.setAttribute('sys_created_on', gr.getValue('sys_created_on'));
			history.setAttribute('sys_mod_count', gr.getValue('sys_mod_count'));
			history.setAttribute('sys_id', gr.getValue('sys_id'));
		}
	},
	
	
	_getWFActivity: function(activityId) {
		var activity = this.newItem('activity');
		var gr = new GlideRecord('wf_activity');
		if (gr.get(activityId)) {
			activity.setAttribute('name', gr.getValue('name'));
			activity.setAttribute('state', gr.getValue('state'));
			activity.setAttribute('activity_definition', gr.getValue('activity_definition'));
			activity.setAttribute('workflow_version', gr.getValue('workflow_version'));
			activity.setAttribute('stage', gr.getValue('stage'));
			activity.setAttribute('x', gr.getValue('x'));
			activity.setAttribute('y', gr.getValue('y'));
			activity.setAttribute('height', gr.getValue('height'));
			activity.setAttribute('width', gr.getValue('width'));
			activity.setAttribute('parent', gr.getValue('parent'));
			activity.setAttribute('vars', gr.getValue('vars'));
			activity.setAttribute('timeout', gr.getValue('timeout'));
			activity.setAttribute('sys_domain', gr.getValue('sys_domain'));
			activity.setAttribute('sys_id', gr.getValue('sys_id'));
			activity.setAttribute('sys_updated_by', gr.getValue('sys_updated_by'));
			activity.setAttribute('sys_updated_on', gr.getValue('sys_updated_on'));
			activity.setAttribute('sys_created_by', gr.getValue('sys_created_by'));
			activity.setAttribute('sys_created_on', gr.getValue('sys_created_on'));
			activity.setAttribute('sys_mod_count', gr.getValue('sys_mod_count'));
		}
	},

	
	type:PwdAjaxUserUnlockProcessor
});