var ChangeProposed = Class.create();
ChangeProposed.prototype = {
    initialize: function(gr) {
		this._log = new GSLog("com.snc.change_management.log",this.type);
		this._isChangeTask = false;
		
		// If a string has been passed in, assume it's a task_ci sys_id
		if (typeof gr.getTableName === "undefined") {
			this._gr = new GlideRecord("task_ci");
			if (!this._gr.get(gr+"")) {
				this._log.debug("[init] Unknown taskci sysId: " + gr);
				return;
			}
		} else
			this._gr = gr;
		
		// If it's a change or a task_ci we can do something with it
		var tn = this._gr.getTableName()+"";
		if (tn == "task_ci") {
			this._log.debug("[init] Got task_ci:" + this._gr.getUniqueValue());
			this._grTaskCI = this._gr;
			this._grChgReq = this._gr.task.getRefRecord();
			this._isChangeTask = (this._grChgReq.getTableName()+"" == "change_request");
		}
		else if (tn == "change_request") {
			this._log.debug("[init] Got change_request:" + this._gr.getUniqueValue());
			this._grChgReq = this._gr;
			this._isChangeTask = true;
		}
		else
			this._log.debug("[init] Unknown table passed: " + tn);
		
		if (this._isChangeTask)
			this._changeRequest = new ChangeRequest(this._grChgReq);
    },

	/**
	 * If affected CIs can be added to the Change Request 
	 */
	canAddCI: function() {
		// If it's not a change task, return true and let other conditions decide
		// This has to be done as the Add CI action could be used on all types of tasks
		if (!this._isChangeTask)
			return true;
		
		// If it's a change in the new state, return allow adding of CIs
		if (this._changeRequest.isNew())
			return true;
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[canAddCI] Cannot add CIs to Change Request " + this._grChgReq.number + ":" + this._grChgReq.getUniqueValue());
		
		// In all other cases, don't allow addition of CIs
		return false;
	},
	
	/**
	 * You can only propose a CI change related to a new Change Request.
	 */
	canProposeChange: function() {
		if (!this._isChangeTask)
			return false;
		
		if (this._changeRequest.isNew())
			return true;
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[canProposeChange] Cannot propose CI change for Change Request " + this._grChgReq.number + ":" + this._grChgReq.getUniqueValue());
		
		return false;
	},
	
    type: 'ChangeProposed'
};