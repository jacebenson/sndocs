var ChangeRequestSNC = Class.create();
 
ChangeRequestSNC.prototype = {
    SUCCESSFUL: "successful",
    UNSUCCESSFUL: "unsuccessful",
    SUCCESSFUL_ISSUES: "successful_issues",
    REQUESTED: "requested",
    APPROVED: "approved",
    REJECTED: "rejected",
	NOT_REQUESTED: "not requested",
	EMERGENCY_WORKFLOW: "Change Request - Emergency",
	STANDARD_WORKFLOW: "Change Request - Standard",
	NORMAL_WORKFLOW: "Change Request - Normal",

    initialize: function(changeGr) {
        this._gr = changeGr;
        this._stateHandler = new ChangeRequestStateHandler(this._gr);
    },

    /**
     * New
     */
    isNew: function() {
        // Change state model's label is New but that's a Javascript reserved word so draft is used instead
        return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.DRAFT);
    },

    changesToNew: function() {
        return this._gr.state.changes() && this.isNew();
    },

    setNew: function() {
        this._stateHandler.moveTo(ChangeRequestStateHandler.DRAFT);
    },

    // use toNew to avoid using the reserved word 'new'
    toNew: function() {
        this.setNew();
        return this._insertUpdate();
    },

    /**
     * Assess -- used internally by the change request workflows.
     * 
     * To move a change (regardless of type) to the state after New call requestApproval instead
     */
    isAssess: function() {
        return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.ASSESS);
    },

    changesToAssess: function() {
        return this._gr.state.changes() && this.isAssess();
    },

    setAssess: function() {
        this._stateHandler.moveTo(ChangeRequestStateHandler.ASSESS);
    },

    assess: function() {
        this.setAssess();
        return this._insertUpdate(); 
    },

    /**
     * Authorize -- used internally by the change request workflows.
     * 
     * To move a change (regardless of type) to the state after New call requestApproval instead
     */
    isAuthorize: function() {
        return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.AUTHORIZE);
    },

    changesToAuthorize: function() {
        return this._gr.state.changes() && this.isAssess();
    },

    setAuthorize: function() {
        this._stateHandler.moveTo(ChangeRequestStateHandler.AUTHORIZE);
    },

    authorize: function() {
        this.setAuthorize();
        return this._insertUpdate();
    },

    /**
     * Scheduled -- used internally by the change request workflows.
     * 
     * To move a change (regardless of type) to the state after New call requestApproval instead
     */
    isScheduled: function() {
        return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.SCHEDULED);
    },

    changesToScheduled: function() {
        return this._gr.state.changes() && this.isScheduled();
    },

    setScheduled: function() {
        this._stateHandler.moveTo(ChangeRequestStateHandler.SCHEDULED);
    },

    scheduled: function() {
        this.setScheduled();
        return this._insertUpdate();
    },

    /**
     * Implement
     */
    isImplement: function() {
        return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.IMPLEMENT);
    },

    changesToImplement: function() {
        return this._gr.state.changes() && this.isImplement();
    },

    setImplement: function() {
        this._stateHandler.moveTo(ChangeRequestStateHandler.IMPLEMENT);
    },

    implement: function() {
        this.setImplement();
        return this._insertUpdate();
    },

    /**
     * Review
     */
    isReview: function() {
        return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.REVIEW);
    },

    changesToReview: function() {
        return this._gr.state.changes() && this.isReview();
    },

    setReview: function() {
        this._stateHandler.moveTo(ChangeRequestStateHandler.REVIEW);
    },

    review: function() {
        this.setReview();
        return this._insertUpdate();
    },

    /**
     * Close
     */
    isClosed: function() {
        return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.CLOSED);
    },

    changesToClosed: function() {
        return this._gr.state.changes() && this.isClosed();
    },

    isClosedSuccessful: function() {
        return this.isClosed() && this._gr.close_code + "" === this.SUCCESSFUL;
    },

    isClosedSuccessfulWithIssues: function() {
        return this.isClosed() && this._gr.close_code + "" === this.SUCCESSFUL_ISSUES;
    },

    isClosedUnsuccessful: function() {
        return this.isClosed() && this._gr.close_code + "" === this.UNSUCCESSFUL;
    },

    setClose: function(closeCode, closeNotes) {
        this._stateHandler.moveTo(ChangeRequestStateHandler.CLOSED);

        if (closeNotes)
            this._gr.close_notes = closeNotes;

        switch (closeCode) {
            case this.UNSUCCESSFUL:
                this._gr.close_code = this.UNSUCCESSFUL;
                break;
            case this.SUCCESSFUL_ISSUES:
                this._gr.close_code = this.SUCCESSFUL_ISSUES;
                break;
            case this.SUCCESSFUL:
                this._gr.close_code = this.SUCCESSFUL;
                break;
            default:
                this._gr.close_code = this.SUCCESSFUL;
        }
    },

    close: function(closeCode, closeNotes) {
        this.setClose(closeCode, closeNotes);
        return this._insertUpdate();
    },

    closeSuccessful: function(closeNotes) {
        if (!closeNotes)
            closeNotes = gs.getMessage("Change closed successfully");

        return this.close(this.SUCCESSFUL, closeNotes);
    },

    closeSuccessfulWithIssues: function(closeNotes) {
        if (!closeNotes)
            closeNotes = gs.getMessage("Change closed successfully with issues");

        return this.close(this.SUCCESSFUL_ISSUES, closeNotes);
    },

    closeUnsuccessful: function(closeNotes) {
        if (!closeNotes)
            closeNotes = gs.getMessage("Change closed unsuccessfully");

        return this.close(this.UNSUCCESSFUL, closeNotes);
    },

    /**
     * Cancel
     */
    isCanceled: function() {
        return this._gr.state + "" === this._stateHandler.getStateValue(ChangeRequestStateHandler.CANCELED);
    },

    changesToCanceled: function() {
        return this._gr.state.changes() && this.isCanceled();
    },

    setCancel: function() {
        this._stateHandler.moveTo(ChangeRequestStateHandler.CANCELED);
    },

    cancel: function() {
        this.setCancel();
        return this._insertUpdate();
    },

    /**
     * Approvals
     */
    isApprovalRequested: function() {
        var state = this._gr.state + "";
        var assess = this._stateHandler.getStateValue(ChangeRequestStateHandler.ASSESS);
        var authorize = this._stateHandler.getStateValue(ChangeRequestStateHandler.AUTHORIZE);

        return (state === assess || state === authorize) && this._gr.approval + "" === this.REQUESTED;
    },

    isApproved: function() {
        var state = this._gr.state + "";
        var assess = this._stateHandler.getStateValue(ChangeRequestStateHandler.ASSESS);
        var authorize = this._stateHandler.getStateValue(ChangeRequestStateHandler.AUTHORIZE);

        return !this.isNew() && state !== assess && state !== authorize && this._gr.approval + "" === this.APPROVED;
    },

    isRejected: function() {
        return this.isNew() && this._gr.approval + "" === this.REJECTED;
    },

    setRequestApproval: function() {
        if (this.isNew())
            this._stateHandler.next();
    },

    requestApproval: function() {
        this.setRequestApproval();
        return this._insertUpdate();
    },

	_insertUpdate: function() {
		return (this._gr.isNewRecord() ? this.insert() : this.update());
	},
	
    /**
     * Wrapped GlideRecord convenience methods
     */
    setValue: function(name, value) {
        this._gr.setValue(name, value);
    },

    getValue: function(name) {
        return this._gr.getValue(name);
    },

    setDisplayValue: function(name, value) {
        this._gr.setDisplayValue(name, value);
    },

    getDisplayValue: function(name) {
        return this._gr.getDisplayValue(name);
    },

    insert: function() {
        var id = this._gr.insert();

        var gr = new GlideRecord(ChangeRequest.CHANGE_REQUEST);
        if (!gr.get(id))
            this._gr = null;

		this.initialize(gr);
    },

    update: function() {
        this._gr.update();
    },

    refreshGlideRecord: function() {
        var gr = new GlideRecord(ChangeRequest.CHANGE_REQUEST);
        if (!gr.get(this._gr.getUniqueValue()))
            this._gr = null;


		this.initialize(gr);
    },

    getGlideRecord: function() {
        return this._gr;
    },
	
	isOnHold: function() {
		return this._gr.on_hold;
	},

	onHoldChanges: function() {
        return this._gr.on_hold.changes();
    },
	
	onHoldReasonChanges: function() {
        return this._gr.on_hold_reason.changes();
    },
	
	syncOnHoldTasks: function() {
		//Check if the on_hold fields have been activated for change tasks
		if (!ChangeTask.hasOnHoldField())
			return;
		
		var updatedTasks = [];
		
		if (!this._gr.on_hold_task.nil())
			updatedTasks = this._gr.getValue('on_hold_task').split(',');
		
		var cTaskGR = new GlideRecord('change_task');
		cTaskGR.addQuery('change_request', this._gr.getUniqueValue());
		cTaskGR.addActiveQuery();
		
		cTaskGR.query();
		while (cTaskGR.next()) {
			if (this._gr.on_hold) {
				if (cTaskGR.on_hold_reason.nil()) {
					new ChangeTask(cTaskGR).onHold(this._gr.on_hold, this._gr.getValue('on_hold_reason'));
					updatedTasks.push(cTaskGR.getUniqueValue());
				}
			}
			else {
				if (updatedTasks.indexOf(cTaskGR.getUniqueValue()) > -1)
					new ChangeTask(cTaskGR).onHold(this._gr.on_hold, '');
			}
		}
		
		if (this._gr.on_hold)
			this._gr.setValue('on_hold_task', updatedTasks.join());
		else
			this._gr.setValue('on_hold_task','');

		this._gr.update();
	},
	
	updateOnHoldReason: function() {
		if (this._gr.on_hold_task.nil())
			return;
		
		var cTaskGR = new GlideRecord('change_task');
		cTaskGR.addQuery('sys_id', this._gr.on_hold_task.getGlideList().getValues());
		cTaskGR.query();
		
		while (cTaskGR.next())
			new ChangeTask(cTaskGR).onHoldReason(this._gr.getValue('on_hold_reason'));
	},
	
	addToOnHoldTaskList: function(taskID) {
		var updatedTasks = [];
		if (!this._gr.on_hold_task.nil())
			updatedTasks = this._gr.getValue('on_hold_task').split(',');
		
		if (updatedTasks.indexOf(taskID) == -1)
			updatedTasks.push(taskID);
		
		this._gr.setValue('on_hold_task', updatedTasks.join());
		this._gr.update();
	},
	
	cancelAssociatedTasks: function() {
		var cTaskGR = new GlideRecord('change_task');
		cTaskGR.addQuery('change_request', this._gr.getUniqueValue());
		cTaskGR.addActiveQuery();
		
		cTaskGR.query();
		while (cTaskGR.next())
			new ChangeTask(cTaskGR).cancel(gs.getMessage('Change task cancelled due to Change request being cancelled'));
	},
	
	hasOpenTasks: function() {
		var cTaskAgg = new GlideAggregate('change_task');
		cTaskAgg.addQuery('change_request', this._gr.getUniqueValue());
		cTaskAgg.addActiveQuery();
		cTaskAgg.addAggregate("COUNT");
		
		cTaskAgg.query();
		if (cTaskAgg.next()) 
			return (cTaskAgg.getAggregate("COUNT") > 0);
			
		return false;
	},
	
	modifyType: function(previousType){
		
		if (JSUtil.nil(this._gr) || JSUtil.nil(previousType))
			return;
		
		// Modifying Change Type from 'anything' to 'Standard' is not allowed
		if (this.getValue("type") == ChangeRequest.STANDARD)
			return;
		
		//Deleting the workflow context related to the previous Change Type
		var workflowName = this._getWorkflowFromType(previousType);
		this._deleteWorkflowContext(workflowName);
		
		if (previousType == ChangeRequest.STANDARD){
			this._gr.approval = this.NOT_REQUESTED;
			this._updateStdStats(); //keep consistency with BR named 'Update Standard Change Version stats' 
		}
	},

	deleteDefaultWorkflowContext: function() {
		// delete default workflow context based on current type
		var workflowName = this._getWorkflowFromType(this.getValue('type'));
		this._deleteWorkflowContext(workflowName);
	},

	_updateStdStats: function(){
		var util = new StdChangeUtils();
		var stdChgProducerVersion = this.getValue(util.ATTR_STD_CHG_PRODUCER_VERSION);
		if (!JSUtil.nil(stdChgProducerVersion)){
			this.setValue(util.ATTR_STD_CHG_PRODUCER_VERSION, '');
			util.updateVersionStats(stdChgProducerVersion.getUniqueValue());
		}
	},
	
	_deleteWorkflowContext: function(workflowName){
		var workflow = new Workflow();
		var workflowVersion = workflow.getVersionFromName(workflowName);		
		var wfContext = workflow.getContexts(this._gr);
		wfContext.addQuery('workflow_version', workflowVersion);
		wfContext.addQuery('state', 'executing');
		wfContext.query();
		if(wfContext.next())
			wfContext.deleteRecord();
	},
	
	_getWorkflowFromType: function(type){
		var workflow = ""; 
		switch (type){
			case ChangeRequest.EMERGENCY:
				workflow = this.EMERGENCY_WORKFLOW;
				break;
			case ChangeRequest.NORMAL:
				workflow = this.NORMAL_WORKFLOW;
				break;
			case ChangeRequest.STANDARD:
				workflow = this.STANDARD_WORKFLOW;
				break;
		}
		return workflow;
	},
	
	type: 'ChangeRequestSNC'
};

ChangeRequestSNC.newNormal = function() {
	return ChangeRequestSNC.newChange(ChangeRequest.NORMAL);
};

ChangeRequestSNC.newStandard = function() {
	return ChangeRequestSNC.newChange(ChangeRequest.STANDARD);
};

ChangeRequestSNC.newEmergency = function() {
	return ChangeRequestSNC.newChange(ChangeRequest.EMERGENCY);
};

ChangeRequestSNC.newChange = function(type) {
    var changeGr = new GlideRecord(ChangeRequest.CHANGE_REQUEST);
    changeGr.initialize();
    changeGr.setValue("state", new ChangeRequestStateHandler().getStateValue(ChangeRequestStateHandler.DRAFT));

	if (JSUtil.notNil(type))
        changeGr.setValue("type", type);

    return new ChangeRequest(changeGr);
};