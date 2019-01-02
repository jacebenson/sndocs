var PwdUserUnlockUtil = Class.create();
PwdUserUnlockUtil.prototype = {
	GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW: "Pwd Get Lock State - Master",
    
	initialize: function() {
    },

	startGetLockStateWorkflow: function(requestId, userId) {
		var wf = new Workflow();
		var workflowId = wf.getWorkflowFromName(this.GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW);
		
		var gr = wf.startFlow(workflowId, null, 'update', {u_request_id : requestId, u_user_id : userId});
		gr.next();
		var ctxId = gr.getValue('sys_id');
		
		if (ctxId == undefined) {
			/* eslint-disable no-unused-vars */
			var errorMsg = "Failed to start workflow: " + this.GET_ACCOUNT_LOCK_STATE_MASTER_WORKFLOW;
			/* eslint-enable no-unused-vars */
			// Update the request record with 'failure'
			var req = new GlideRecord('pwd_reset_request');
			if (req.get(requestId)) {
				req.lock_state = -1;	// failure
				req.update();
			}
		}
	},

    type: 'PwdUserUnlockUtil'
}