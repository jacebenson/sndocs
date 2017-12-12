var hr_ApprovalUtil = Class.create();
hr_ApprovalUtil.prototype = {
    type: 'hr_ApprovalUtil'
};

hr_ApprovalUtil.WORKFLOW_ID = '8de6490c53032200d901a7e6a11c0838';

hr_ApprovalUtil.checkApprovalParameters = function(caseGr, workflow) {
	var serviceActivity = workflow.variables.service_activity_sys_id;
	var leActivity = workflow.variables.le_activity_sys_id;

	if (serviceActivity)
		hr_ApprovalUtil.getServiceActivityParameters(serviceActivity, workflow);
	else if (leActivity)
		hr_ApprovalUtil.getLEActivityParameters(leActivity, workflow);
	else
		hr_ApprovalUtil.getHRServiceParameters(caseGr, workflow);

	return !hr_ApprovalUtil.noApproversSet(workflow);
};

hr_ApprovalUtil.noApproversSet = function (workflow) {
	var noOptions = gs.nil(workflow.scratchpad.approvalOptions);
	var noGroups = gs.nil(workflow.scratchpad.approvalGroups);
	var noUsers = gs.nil(workflow.scratchpad.approvalUsers);

	return noOptions && noGroups && noUsers;
};

hr_ApprovalUtil.getServiceActivityParameters = function(activityId, workflow) {
	var grSA = new GlideRecord('sn_hr_core_service_activity');

	if (grSA.get(activityId)) {
		workflow.scratchpad.approvalOptions = grSA.approval_options.toString();
		workflow.scratchpad.approvalGroups = grSA.approver_groups.toString();
		workflow.scratchpad.approvalUsers = grSA.approver_users.toString();
		workflow.scratchpad.approval_accept_option = grSA.approval_accept_option || 'first_response';
		workflow.scratchpad.approval_reject_option = grSA.approval_reject_option || 'close_case';
		workflow.scratchpad.missing_some_approvers = grSA.missing_some_approvers || 'skip';
		workflow.scratchpad.missing_all_approvers = grSA.missing_all_approvers || 'substitute';
	}
};

hr_ApprovalUtil.getLEActivityParameters = function(activityId, workflow) {
	var grLA = new GlideRecord('sn_hr_le_activity');

	if (grLA.get(activityId)) {
		workflow.scratchpad.approvalOptions = grLA.approvers.toString();
		workflow.scratchpad.approvalGroups = grLA.approver_groups.toString();
		workflow.scratchpad.approvalUsers = grLA.approver_users.toString();
		workflow.scratchpad.approval_accept_option = grLA.approval_accept_option || 'anyone';
		workflow.scratchpad.approval_reject_option = grLA.approval_reject_option || 'reapprove';
		workflow.scratchpad.missing_some_approvers = grLA.missing_some_approvers || 'skip';
		workflow.scratchpad.missing_all_approvers = grLA.missing_all_approvers || 'substitute';
	}
};

hr_ApprovalUtil.getHRServiceParameters = function(caseGr, workflow) {
	// set fields to mimic the OOB functionality of Jakarta
	if (caseGr.hr_service.approval_options) {
		workflow.scratchpad.approvalOptions = caseGr.hr_service.approval_options.toString();
		workflow.scratchpad.approval_accept_option = 'first_response';
		// approval subflow in Jakarta returns "rejected" and lets caller decide how to handle it
		workflow.scratchpad.approval_reject_option = 'legacy';
	}
	workflow.scratchpad.insufficient_data_is_an_option = true;
};

hr_ApprovalUtil.approverCount = function(caseGr, workflow) {
	workflow.scratchpad.approvers = [];
	workflow.scratchpad.missingApprovers = [];

	if (workflow.scratchpad.approvalOptions)
		hr_ApprovalUtil._getApproversFromOptions(caseGr, workflow);
	if (workflow.scratchpad.approvalGroups)
		hr_ApprovalUtil._getApproversFromGroups(workflow);
	if (workflow.scratchpad.approvalUsers)
		hr_ApprovalUtil._getApproversFromUsers(workflow);

	workflow.scratchpad.missingApprovers.sort();
	return workflow.scratchpad.approvers.length;
};

hr_ApprovalUtil.missingApprovers = function(caseGr) {
	var approvalContext = hr_ApprovalUtil.getApprovalSubflowsForCase(caseGr);
	return approvalContext.scratchpad.missingApprovers;
};

hr_ApprovalUtil._getApproversFromOptions = function(caseGr, workflow) {
	var gr = new GlideRecord('sn_hr_core_service_approval_option');
	gr.addActiveQuery();
	gr.addQuery('sys_id', 'IN', workflow.scratchpad.approvalOptions);
	gr.query();

	while (gr.next()) {
		var glideEle = caseGr.getElement(gr.approval_assign_to);

		if (glideEle) {
			var refTo = glideEle.getReferenceTable();
			var rootTable = new GlideTableHierarchy(refTo).getRoot();

			switch (rootTable) {
				case 'sys_user':
					if (hr_ApprovalUtil.isValidUser(glideEle))
						workflow.scratchpad.approvers.push(glideEle.toString());
					else
						workflow.scratchpad.missingApprovers.push(String(gr.name));
					break;
				case 'sys_user_group':
					if (hr_ApprovalUtil.isValidGroup(glideEle))
						workflow.scratchpad.approvers.push(glideEle.toString());
					else
						workflow.scratchpad.missingApprovers.push(String(gr.name));
					break;
			}
		} else
			workflow.scratchpad.missingApprovers.push(String(gr.name));
	}
};

hr_ApprovalUtil._getApproversFromGroups = function(workflow) {
	var approverGroups = String(workflow.scratchpad.approvalGroups).split(',');

	for (var i = 0; i < approverGroups.length; i++) {
		if (hr_ApprovalUtil.isValidGroup(approverGroups[i]))
			workflow.scratchpad.approvers.push(approverGroups[i]);
		else {
			var group = new GlideRecord('sys_user_group');
			group.get(approverGroups[i]);
			workflow.scratchpad.missingApprovers.push(String(group.name));
		}
	}
};

hr_ApprovalUtil._getApproversFromUsers = function(workflow) {
	var approverUsers = String(workflow.scratchpad.approvalUsers).split(',');

	for (var j = 0; j < approverUsers.length; j++) {

		if (hr_ApprovalUtil.isValidUser(approverUsers[j]))
			workflow.scratchpad.approvers.push(approverUsers[j]);
		else {
			var grUser = new GlideRecord('sys_user');
			grUser.get(approverUsers[j]);
			workflow.scratchpad.missingApprovers.push(String(grUser.name));
		}
	}
};

hr_ApprovalUtil.isValidGroup = function(groupId) {
	var grMember = new GlideRecord('sys_user_grmember');
	grMember.addQuery('user.active', 'true');
	grMember.addQuery('group', groupId);
	grMember.setLimit(1);
	grMember.query();

	return grMember.hasNext();
};

hr_ApprovalUtil.isValidUser = function(userId) {
	var grUser = new GlideRecord('sys_user');
	grUser.addQuery('sys_id', userId);
	grUser.addActiveQuery();
	grUser.query();

	return grUser.hasNext();
};

/*------------- Rejection option methods -------------*/

hr_ApprovalUtil._getStage = function(approvalContext) {
	var stage = new GlideRecord("wf_stage");
	if (stage.get(approvalContext.stage))
		return stage.value;
	else
		return null;
};

hr_ApprovalUtil.isReapprovalAuthorized = function(caseGr) {
	if (gs.getUserID() != caseGr.assigned_to)
		return false;

	var approvalContext = hr_ApprovalUtil.getApprovalSubflowsForCase(caseGr);
	return approvalContext != null && hr_ApprovalUtil._getStage(approvalContext) == 'awaiting_reapproval';
};

hr_ApprovalUtil.rerequestCaseApproval = function(caseGr) {
	var approvalContext = hr_ApprovalUtil.getApprovalSubflowsForCase(caseGr);
	new global.Workflow().broadcastEvent(approvalContext.sys_id, 'sn_hr_core.request_reapproval');
	gs.addInfoMessage(gs.getMessage('Approvals have been re-requested'));
};

hr_ApprovalUtil.isSubstituteApprovers = function(caseGr) {
	if (gs.getUserID() != caseGr.assigned_to)
		return false;

	var approvalContext = hr_ApprovalUtil.getApprovalSubflowsForCase(caseGr);
	var result = approvalContext != null && hr_ApprovalUtil._getStage(approvalContext) == 'substitute_approvers';
	return result;
};

hr_ApprovalUtil.getApprovalSubflowsForCase = function(grCase) {
	var wfContext = new global.Workflow().getRunningFlows(grCase);

	//Find running context for 'HR Case Approval Subflow'
	while (wfContext.next()) {
		if (wfContext.workflow == hr_ApprovalUtil.WORKFLOW_ID)
			return wfContext;
	}

	return null;
};

hr_ApprovalUtil.caseRejected = function(caseGr) {
	var approval = new GlideRecord("sysapproval_approver");
	approval.addQuery("sysapproval", current.sys_id);
	approval.addQuery("state", "rejected");
	approval.addQuery("wf_activity", "!=", "");
	approval.setLimit(1);
	approval.query();
	return approval.hasNext();
};

hr_ApprovalUtil.disassociateApprovalsFromWorkflow = function(grCase) {
	var approvalGr = new GlideRecord("sysapproval_approver");
	approvalGr.addQuery("sysapproval", grCase.getUniqueValue());
	approvalGr.addQuery('wf_activity.workflow_version.workflow', hr_ApprovalUtil.WORKFLOW_ID);
	approvalGr.addQuery("state", "!=", "cancelled");
	approvalGr.query();

	while (approvalGr.next()) {
	   approvalGr.setValue('wf_activity', "");
	   approvalGr.update();
	}
};