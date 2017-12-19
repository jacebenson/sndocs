/* global gs, approvalengine_record, GlideProperties */
/* eslint-disable strict, quotes */

var ApprovalEngineUtils = Class.create();
ApprovalEngineUtils.prototype = {

	initialize: function() {
	},

	/**
	 * Determine which approval engine the record should be using.
	 *
	 * Inputs:
	 *    approvalengine_record is the record to determine the approval engine for and is available
	 *    as a javascript variable by the same name
	 *
	 * Returns:
	 *    "approval_engine" - use the simple approval engine (approval rules)
	 *    "process_guide" - use advanced approvals (process guides)
	 *    "off" Don't use approval rules, use this setting if workflows are managing approvals.
	 */
	determine: function() {
		// if this is a sysapproval, determine the engine based its task
		if (approvalengine_record.getRecordClassName() == 'sysapproval_approver') {
			if (approvalengine_record.sysapproval.nil() || approvalengine_record.sysapproval.sys_id.nil())
				return "off"; // This approval is for a non-task target record

			var gr = approvalengine_record.sysapproval.sys_id.getGlideRecord();
			if (!gr.isValid())
				return "off";

			var engine = this.getEngineForTarget(gr);
			// sysapproval_approver record are always handled by the ApprovalEngine - if it is bound
			// to a Process Guide, the ApprovalEngine will call into the Process Guide to handle it
			if (engine === "process_guide")
				engine = "approval_engine";

			return engine;
		}
		return this.getEngineForTarget(approvalengine_record);
	},

	getEngineForTable: function(tableName) {
		var engine = gs.getProperty("glide.approval_engine." + tableName, "") + '';
		if (engine == "")
			engine = gs.getProperty("glide.approval_engine_default", "off") + "";

		return engine;
	},
	
	getEngineForTarget: function(record) {
		// Do not run any approval engines if we are using workflow
		if (record.instanceOf('sc_req_item'))
			if ((record.cat_item.workflow != null) && (!record.cat_item.workflow.nil()))
				return "off";

		// approval is only appropriate for task tables
		if (!record.instanceOf('task'))
			return "off";

		return this.getEngineForTable(record.getRecordClassName());
	},

	type: 'ApprovalEngineUtils'
};