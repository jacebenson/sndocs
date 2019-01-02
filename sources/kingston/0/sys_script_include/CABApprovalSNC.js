var CABApprovalSNC = Class.create();

/**
 * Gets the requested approval for the task
 */
CABApprovalSNC.getApprovals = function(taskId) {
	if (!taskId)
		return;
	
	var approvalGr = new GlideRecord(CABSNC.APPROVAL);
	approvalGr.addQuery('sysapproval', taskId);
	approvalGr.addQuery('state', 'requested');
	approvalGr.orderBy('due_date');
	approvalGr.query();
	
	return new CABApproval(approvalGr);
};

/**
 * Gets the current user's approval for the task
 */
CABApprovalSNC.getUserApprovals = function(taskId) {
	if (!taskId)
		return;
	
	var approvalGr = new GlideRecord(CABSNC.APPROVAL);
	approvalGr.addQuery('sysapproval', taskId);
	approvalGr.addQuery('state', 'requested');
	approvalGr.addQuery('approver', gs.getUserID());
	approvalGr.orderBy('due_date');
	approvalGr.query();
	
	return new CABApproval(approvalGr);
};

CABApprovalSNC.prototype = Object.extendsObject(CAB, {
	
	requiresApproval: function() {
		return this._gr.getRowCount() > 0;
	},
	
	requiresUserApproval: function() {
		if (!this.requiresApproval())
			return false;
		
		if (this._gr.approver+"" == this._gs.getUserID()+"")
			return true;
	},
	
	setApprove: function(comment) {
		// Check the current user can approve.
		if (!(this._gr.state+"" == 'requested' && this._gr.approver + "" == this._gs.getUserID()+""))
			return;
		
		this._gr.comments = comment;
		this._gr.state = "approved";
	},
	
	approve: function(comment) {
		this.setApprove(comment);
		return this.update();
	},
	
	setReject: function(comment) {
		// Check the current user can reject
		if (!(this._gr.state+"" == 'requested' && this._gr.approver + "" == this._gs.getUserID()+""))
			return;
		
		this._gr.comments = comment;
		this._gr.state = "rejected";
		return true;
	},
	
	reject: function(comment) {
		this.setReject(comment);
		return this.update();
	},

    type: 'CABApprovalSNC'
});