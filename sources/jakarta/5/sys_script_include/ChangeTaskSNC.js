var ChangeTaskSNC = Class.create();

ChangeTaskSNC.prototype = {
	initialize: function(changeTaskGr) {
		this._gr = changeTaskGr;
	},

	/**
	 * Checks whether a change task state is Pending
	 */
	isPending: function() {
		return this._gr.state + "" === ChangeTaskState.PENDING;
	},

	/**
	 * Checks whether the field in the record has changed to the Pending state
	 */
	changesToPending: function() {
		return this._gr.state.changes() && this.isPending();
	},

	/**
	 * Set the record's state to Pending but the record is not saved.
	 */
	setPending: function() {
		this._gr.state = ChangeTaskState.PENDING;
	},

	/**
	 * Change the state of the change task to Pending (the record is saved)
	 */
	pending: function() {
		this.setPending();
		return this._insertUpdate();
	},

	/**
	 * Checks whether a change task state is Open
	 */
	isOpen: function() {
		return this._gr.state + "" === ChangeTaskState.OPEN;
	},

	/**
	 * Checks whether the field in the record has changed to the Open state
	 */
	changesToOpen: function() {
		return this._gr.state.changes() && this.isOpen();
	},

	/**
	 * Set the record's state to Open but the record is not saved.
	 */
	setOpen: function() {
		this._gr.state = ChangeTaskState.OPEN;
	},

	/**
	 * Change the state of the change task to Open (the record is saved)
	 */
	open: function() {
		this.setOpen();
		return this._insertUpdate();
	},

	/**
	 * Checks whether a change task is in progress
	 */
	isInProgress: function() {
		return this._gr.state + "" === ChangeTaskState.IN_PROGRESS;
	},

	/**
	 * Checks whether the field in the record has changed to the In Progress state
	 */
	changesToInProgress: function() {
		return this._gr.state.changes() && this.isInProgress();
	},

	/**
	 * Set the record's state to In Progress but the record is not saved.
	 */
	setInProgress: function() {
		this._gr.state = ChangeTaskState.IN_PROGRESS;
	},

	/**
	 * Change the state of the change task to In Progress (the record is saved)
	 */
	inProgress: function() {
		this.setInProgress();
		return this._insertUpdate();
	},

	/**
	 * Checks whether a change task has been closed
	 */
	isClosed: function() {
		return this._gr.state + "" === ChangeTaskState.CLOSED ||
			this.isClosedSuccessful() ||
			this.isClosedSuccessfulWithIssues() ||
			this.isClosedUnsuccessful();
	},

	/**
	 * Checks whether the change task has been set to Closed + Successful state
	 */
	isClosedSuccessful: function() {
		return this._gr.state + "" === ChangeTaskState.CLOSED_SUCCESSFUL &&
			(JSUtil.nil(this._gr.close_code) || this._gr.close_code + "" === ChangeTaskState.CLOSED_SUCCESSFUL_CODE);
	},

	/**
	 * Checks whether the change task has been set to Closed + Successful with issues state
	 */
	isClosedSuccessfulWithIssues: function() {
		return this._gr.state + "" === ChangeTaskState.CLOSED_SUCCESSFUL_ISSUES &&
			(JSUtil.nil(this._gr.close_code) || this._gr.close_code + "" === ChangeTaskState.CLOSED_SUCCESSFUL_ISSUES_CODE);
	},

	/**
	 * Checks whether the change task has been set to Closed + Unsuccessful state
	 */
	isClosedUnsuccessful: function() {
		return this._gr.state + "" === ChangeTaskState.CLOSED_UNSUCCESSFUL &&
			(JSUtil.nil(this._gr.close_code) || this._gr.close_code + "" === ChangeTaskState.CLOSED_UNSUCCESSFUL_CODE);
	},

	/**
	 * Checks whether the field in the record has changed to the Closed state
	 */
	changesToClosed: function() {
		return this._gr.state.changes() && this.isClosed();
	},

	/**
	 * Set the record's state to closed according to the close code, but the record is not saved.
	 */
	setClose: function(closeCode, closeNotes) {
		switch (closeCode) {
			case ChangeTaskState.CLOSED_SUCCESSFUL_CODE:
				this.setCloseSuccessful(closeNotes);
				break;
			case ChangeTaskState.CLOSED_SUCCESSFUL_ISSUES_CODE:
				this.setCloseSuccessfulWithIssues(closeNotes);
				break;
			case ChangeTaskState.CLOSED_UNSUCCESSFUL_CODE:
				this.setCloseUnsuccessful(closeNotes);
				break;
			default:
				this.setCloseSuccessful(closeNotes);
		}
	},

	/**
	* Set close notes for the change task, but not save the record
	*/
	setCloseNotes: function(closeNotes){
		this._gr.close_notes = closeNotes;
	},

	/**
	 * Change the state of the change task to Closed (the record is saved) with the specified close code and close notes
	 */
	close: function(closeCode, closeNotes) {
		this.setClose(closeCode, closeNotes);
		return this._insertUpdate();
	},

	/**
	 * Change the state of the change task to Closed + Successful with the specified close notes without saving the record
	 */
	setCloseSuccessful: function(closeNotes) {
		this.setCloseNotes(closeNotes ? closeNotes : "Change task closed successful");
		this._gr.state = ChangeTaskState.CLOSED_SUCCESSFUL;
		this._gr.close_code = ChangeTaskState.CLOSED_SUCCESSFUL_CODE;
	},

	/**
	 * Change the state of the change task to Closed + Successful (the record is saved) with the specified close notes
	 */
	closeSuccessful: function(closeNotes) {
		this.setCloseSuccessful(closeNotes);
		return this._insertUpdate();
	},

		/**
	 * Change the state of the change task to Closed + Successful with issues and the specified close notes without saving the record
	 */
	setCloseSuccessfulWithIssues: function(closeNotes) {
		this.setCloseNotes(closeNotes ? closeNotes : "Change task closed successful with issues");
		this._gr.state = ChangeTaskState.CLOSED_SUCCESSFUL_ISSUES;
		this._gr.close_code = ChangeTaskState.CLOSED_SUCCESSFUL_ISSUES_CODE;
	},

	/**
	 * Change the state of the change task to Closed + Successful with issues (the record is saved) with the specified close notes
	 */
	closeSuccessfulWithIssues: function(closeNotes) {
		this.setCloseSuccessfulWithIssues(closeNotes);
		return this._insertUpdate();
	},

	/**
	 * Change the state of the change task to Closed + Unsuccessful with the specified close notes without saving the record
	 */
	setCloseUnsuccessful: function(closeNotes) {
		this.setCloseNotes(closeNotes ? closeNotes : "Change task closed unsuccessful");
		this._gr.state = ChangeTaskState.CLOSED_UNSUCCESSFUL;
		this._gr.close_code = ChangeTaskState.CLOSED_UNSUCCESSFUL_CODE;
	},

	/**
	 * Change the state of the change task to Closed + Unsuccessful (the record is saved) with the specified close notes
	 */
	closeUnsuccessful: function(closeNotes) {
		this.setCloseUnsuccessful(closeNotes);
		return this._insertUpdate();
	},

	/**
	 * Checks whether a change task is canceled
	 */
	isCanceled: function() {
		return this._gr.state + "" === ChangeTaskState.CANCELED;
	},

	/**
	 * Checks whether the field in the record has changed to the Canceled state
	 */
	changesToCanceled: function() {
		return this._gr.state.changes() && this.isCanceled();
	},

	/**
	 * Set the record's state to cancelled but the record is not saved.
	 */
	setCancel: function(closeNotes) {
		this._gr.state = ChangeTaskState.CANCELED;

		if (closeNotes)
			this._gr.close_notes = closeNotes;
	},

	/**
	 * Change the state of the change task to Canceled (the record is saved)
	 */
	cancel: function(closeNotes) {
		this.setCancel(closeNotes);
		return this._insertUpdate();
	},

	_insertUpdate: function() {
		return (this._gr.isNewRecord() ? this.insert() : this.update());
	},

	/**
	 * Wrapped GlideRecord convenience methods
	 */
	setValue: function(name, value) {
		this._gr[name] = value;
	},

	getValue: function(name) {
		return this._gr.getValue(name);
	},

	insert: function() {
		var id = this._gr.insert();

		var gr = new GlideRecord(ChangeTaskState.CHANGE_TASK);
		if (!gr.get(id))
			this._gr = null;

		this.initialize(gr);
	},

	update: function() {
		this._gr.update();
	},

	refreshGlideRecord: function() {
		var gr = new GlideRecord(ChangeTask.CHANGE_TASK);
		if (!gr.get(this._gr.getUniqueValue()))
			this._gr = null;

		this.initialize(gr);
	},

	getGlideRecord: function() {
		return this._gr;
	},

	type: 'ChangeTaskSNC'
};

ChangeTaskSNC.newChangeTask = function() {
	var changeTaskGr = new GlideRecord(ChangeTask.CHANGE_TASK);
	changeTaskGr.initialize();
	changeTaskGr.setValue("state", ChangeTask.DEFAULT_STATE);

	return new ChangeTask(changeTaskGr);
};

ChangeTaskSNC.bySysId = function(sysId) {
	var changeTaskGr = new GlideRecord(ChangeTask.CHANGE_TASK);
	if (changeTaskGr.get(sysId))
		return new ChangeTask(changeTaskGr);
};