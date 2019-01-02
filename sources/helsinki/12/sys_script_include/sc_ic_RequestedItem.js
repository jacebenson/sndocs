var sc_ic_RequestedItem = Class.create();
sc_ic_RequestedItem.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr,_gs,_workflow) {
        sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
        this._wf = _workflow;
    },
	
	//Approvals
	
	/**
	 * Copies the approval definitions from the catalog item to this requested item
	 */
	createApprovalDefinitions: function() {
		if (JSUtil.nil(this._gr.cat_item+""))
			return;
		
		var ad = new GlideRecord(sc_ic.APRVL_DEFN);
		ad.addQuery(sc_.CATALOG_ITEM, this._gr.cat_item+"");
		ad.addActiveQuery();
		ad.query();
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_createApprovalDefinitions] Copying " + ad.getRowCount() +
							" approval definitions from " + this._gr.cat_item.getDisplayValue() + " <" + this._gr.cat_item + "> to"+
						    " requested item <" + this._gr.getUniqueValue() + ">");
		
		var reqItmAprvlDefn = sc_ic_Factory.getWrapperClass(sc_ic.REQ_ITEM_APRVL_DEFN);
		while (ad.next())
			reqItmAprvlDefn.create(this._gr, ad);
		
		return this;
    },
	
	getApprovalSequences: function() {
		var sequenceData = {};
		sequenceData.sequenceCount = 0;
		sequenceData.sequenceArr = [];
		
		if (JSUtil.nil(this._gr.getUniqueValue()))
			return sequenceData;
		
		var reqItemAprvlDefnGr = new GlideAggregate(sc_ic.REQ_ITEM_APRVL_DEFN);
		reqItemAprvlDefnGr.addQuery(sc_.REQUESTED_ITEM, this._gr.getUniqueValue());
		reqItemAprvlDefnGr.orderBy('order');
		reqItemAprvlDefnGr.groupBy('order');
		reqItemAprvlDefnGr.query();
		
		sequenceData.sequenceCount = reqItemAprvlDefnGr.getRowCount();
		while (reqItemAprvlDefnGr.next())
			sequenceData.sequenceArr.push(reqItemAprvlDefnGr.getValue('order')+"");
		
		return sequenceData;
	},
	
	getApproversForSequence: function(sequence) {
		var approvers = {};
		approvers.users = []
		approvers.groups = [];
		
		this._disassociateExistingApprovalsFromWorklow();
		
		if (JSUtil.nil(this._gr.sys_id))
			return approvers;
		
		var apprDefnGr = this._getApprovalDefinitionsForSequence(sequence);
		
		while (apprDefnGr.next()) {
			var apprDefnApprovers = sc_ic_Factory.wrap(apprDefnGr).getApprovers();
			if (apprDefnApprovers.users)
				approvers.users = new ArrayUtil().concat(approvers.users, apprDefnApprovers.users);
			if (apprDefnApprovers.groups)
				approvers.groups = new ArrayUtil().concat(approvers.groups, apprDefnApprovers.groups);
		}
		
		return approvers;
	},
	
	/**
	 * Copies approval sequence data to the scratchpad for use in the workflow.
	 */
	copyApprovalSequenceDataToScratchpad: function() {
		var sequenceData = this.getApprovalSequences();
		this._wf.scratchpad.currentSequence = 0;
		this._wf.scratchpad.sequenceCount = sequenceData.sequenceCount;
		this._wf.scratchpad.sequencesJSON = this.convertToJSONString(sequenceData.sequenceArr);
	},
	
	/**
	 * Copies the approval information to the scratchpad for use in the workflow.
	 */
	copyApprovalDataToScratchpad: function() {
		var approvers = this.getApproversForSequence(this._wf.inputs[sc_ic.WORKFLOW_CURRENT_SEQUENCE]);
		this._wf.scratchpad.userApprovalIds = approvers.users.toString();
		this._wf.scratchpad.groupApprovalIds = approvers.groups.toString();
	},
	
	_getApprovalDefinitionsForSequence: function(sequence) {
		var reqItemAprvlDefnGr = new GlideRecord(sc_ic.REQ_ITEM_APRVL_DEFN);
		reqItemAprvlDefnGr.addQuery(sc_.REQUESTED_ITEM, this._gr.getUniqueValue());
		if (JSUtil.notNil(sequence))
			reqItemAprvlDefnGr.addQuery('order',sequence);
		reqItemAprvlDefnGr.query();
		
		return reqItemAprvlDefnGr;		
	},
	
	_disassociateExistingApprovalsFromWorklow: function() {
		if (JSUtil.nil(this._gr.getUniqueValue()))
			return;
			
		var existingApprovalsGr = new GlideMultipleUpdate("sysapproval_approver");
		existingApprovalsGr.addQuery("sysapproval", this._gr.getUniqueValue());
		existingApprovalsGr.addQuery("state", "!=", 'cancelled');
		existingApprovalsGr.setValue("wf_activity","");
		existingApprovalsGr.execute();
		
		existingApprovalsGr = new GlideMultipleUpdate("sysapproval_group");
		existingApprovalsGr.addQuery("parent", this._gr.getUniqueValue());
		existingApprovalsGr.addQuery("approval", "!=", 'cancelled');
		existingApprovalsGr.setValue("wf_activity","");
		existingApprovalsGr.execute();
	},

	// Tasking
	
	/**
	 * Copies the task definitions from the catalog item to this requested item
	 */
	createTaskDefinitions: function() {
		if (JSUtil.nil(this._gr.cat_item+""))
			return;
		
		var td = new GlideRecord(sc_ic.TASK_DEFN);
		td.addQuery(sc_.CATALOG_ITEM, this._gr.cat_item+"");
		td.addActiveQuery();
		td.query();
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_createTaskDefinitions] Copying " + td.getRowCount() +
							" atask definitions from " + this._gr.cat_item.getDisplayValue() + " <" + this._gr.cat_item + "> to"+
						    " requested item <" + this._gr.getUniqueValue() + ">");
		
		var reqItmTaskDefn = sc_ic_Factory.getWrapperClass(sc_ic.REQ_ITEM_TASK_DEFN);
		while (td.next())
			reqItmTaskDefn.create(this._gr, td);
		
		return this;
    },
	
	/**
	 * Returns an order list of unique task orderings, the 'sequence' of tasks.
	 */
	copyTaskSequenceDataToScratchpad: function() {
		this._wf.scratchpad.taskSeq = this.getTaskSequence();
		this._log.debug("[copyTaskSequenceDataToScratchpad] Task Sequence Data Copied to scratchpad.taskSeq");
	},
	
	copyTaskDataToScratchpad: function() {
		this._wf.scratchpad.taskDefs = this.getTaskDefinitionsForSequence();
		this._log.debug("[copyTaskDataToScratchpad] Task Data Copied to scratchpad.taskDefs");
	},
	
	getTaskSequence: function() {
		/* Task Sequence info:
		 * length: The length of the sequence
		 * data: The sequence
		 * index: current position in the sequence
		 */
		var taskSeq = {"length": 0, "data": [], "index": 0};
		
		if (JSUtil.nil(this._gr.getUniqueValue()))
			return taskSeq;
		
		var ritd = new GlideAggregate(sc_ic.REQ_ITEM_TASK_DEFN);
		ritd.addQuery(sc_.REQUESTED_ITEM, this._gr.getUniqueValue());
		ritd.orderBy('order');
		ritd.groupBy('order');
		ritd.query();
		
		while (ritd.next())
			taskSeq.data.push(ritd.getValue('order')+"");
		
		taskSeq.length = taskSeq.data.length;
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[getTaskSequence] Task sequence of " + taskSeq.length +
							" stages for requested item <" + this._gr.getUniqueValue() + ">");
		
		return taskSeq;
	},
	
	getTaskDefinitionsForSequence: function(sequence) {
		var taskDefs = {"length":0, "data":[], "index":0};
		var taskSeq = this._wf.scratchpad.taskSeq;
		
		var ritd = new GlideRecord(sc_ic.REQ_ITEM_TASK_DEFN);
		ritd.addQuery(sc_.REQUESTED_ITEM, this._gr.getUniqueValue());
		
		if (JSUtil.notNil(sequence))
			ritd.addQuery('order',sequence);
		else if (JSUtil.notNil(taskSeq.data[taskSeq.index]))
			ritd.addQuery('order',taskSeq.data[taskSeq.index]);
		
		ritd.query();
		
		var taskDef = sc_ic_Factory.wrap(ritd);
		while (ritd.next())
			taskDefs.data.push(taskDef.getJSObj());
		
		taskDefs.length = taskDefs.data.length;
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[getTaskDefinitionsForSequence] " + this._wf.scratchpad.taskSeq.index + ":" + this._wf.scratchpad.taskSeq.length);
		
		return taskDefs;
	},
	
	sendTaskCompleteWorkflowEvent: function() {
		var wf = new Workflow().getRunningFlows(this._gr);
		
		while(wf.next())
			new Workflow().broadcastEvent(wf.sys_id, "sc_ic_req_task_complete");
		
		this._log.debug("[sendTaskCompleteWorkflowEvent] Event sent");
	},
	
	checkSequenceFulfilment: function() {
		this._wf.scratchpad.fulfilment = {"success": true};
		
		// If there are any tasks at this stage which are not in a close-incomplete state then continue as normal.
		var rt = new GlideRecord(sc_.TASK);
		rt.addQuery("request_item",this._gr.getUniqueValue());
		rt.addQuery("state","!=",sc_ic.CLOSED_INCOMPLETE);
		rt.addQuery("order",this._wf.scratchpad.taskSeq.data[this._wf.scratchpad.taskSeq.index]);
		rt.query();
		
		if (rt.getRowCount() == 0) {
			this._log.debug("[checkStageFulfilment] Stage not completed, fulfilment cancelled.");
			this._wf.scratchpad.fulfilment.success = false;
		}
	},
	
	cancelRequest: function() {
		this._gr.state = sc_ic.CLOSED_INCOMPLETE;
		this._gr.update();
	},
	
	isItemDesigned: function() {
		return !JSUtil.nil(this._gr.cat_item[sc_ic.ITEM_STAGING]);
	},
	
	setDefaultValues: function(updateRecord) {
		this._gr.stage = "requested";
		
		if (updateRecord)
			this._gr.update();
	},

    type: 'sc_ic_RequestedItem'
});