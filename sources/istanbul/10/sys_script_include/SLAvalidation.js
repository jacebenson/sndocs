var SLAvalidation = Class.create();

// set a session error message if the workflow has a condition type or a condition set
SLAvalidation.warnWorkflowCondition = function(/* GlideElement */ workflow, /* contract_sla */ sla) {
	if (!SLAvalidation.workflowConditionEmpty(workflow)) {
		var msg = gs.getMessage("Warning: SLA Definition") + " \"" + sla.name + "\" " + gs.getMessage("Workflow") + " \"" + workflow.name + "\" " + gs.getMessage("has a condition set");
		if (!new ArrayUtil().contains(j2js(gs.getErrorMessages()), msg))
			gs.addErrorMessage(msg);
	}
};

// return true if the associated workflow condition type and condition are empty
// return false, and set error messages, if they aren't.
SLAvalidation.workflowConditionEmpty = function(/* GlideElement */ workflow, /* optional: GlideElement */ condition_type, /* optional: GlideElement */ condition) {
	var workflowId = workflow + '';
	
	var wfv_gr = new GlideRecord("wf_workflow_version");
	wfv_gr.setWorkflow(false);
	wfv_gr.addQuery('workflow', workflowId);
	wfv_gr.addActiveQuery();
	wfv_gr.addQuery('published', true).addOrCondition('checked_out_by', gs.getUserID());
	wfv_gr.orderByDesc('checked_out_by');
	wfv_gr.query();
	while (wfv_gr.next()) {
		if (!wfv_gr.condition_type.nil() || (condition_type && !condition_type.nil())) {
			if (condition_type !== undefined)
				condition_type.setError(gs.getMessage("Workflow 'If condition matches:' value should be None"));
			return false;
		}
		gs.log('wfv_gr.condition:' + wfv_gr.condition + ';' + condition);
		if (!wfv_gr.condition.nil() || (condition && !condition.nil())) {
			if (condition !== undefined)
				condition.setError(gs.getMessage("Workflow condition should be empty"));
			return false;
		}
	}
	return true;
};

// true iff this workflow Id is referenced in an SLA definition
SLAvalidation.isInSLAworkflow = function(workflowId) {
	var sla = new GlideRecord('contract_sla');
	sla.addQuery('workflow', workflowId);
	sla.setLimit(1);
	sla.query();
	return (sla.hasNext());
};

// true iff this workflow Id has an active version relating to the 'task_sla' table, or its extensions
SLAvalidation.isSLAWorkflow = function(workflowId) {
	var wfv_gr = new GlideRecord('wf_workflow_version');
	wfv_gr.addQuery('workflow', workflowId);
	wfv_gr.addActiveQuery();
	wfv_gr.addQuery('table', j2js(new TableUtils('task_sla').getAllExtensions()));
	wfv_gr.addQuery('published', true).addOrCondition('checked_out_by', gs.getUserID());
	wfv_gr.orderByDesc('checked_out_by');
	wfv_gr.setLimit(1);
	wfv_gr.query();
	return (wfv_gr.hasNext());
};

// true if the specified tablename is the 'task_sla' table or one of its extensions
SLAvalidation.isSLATable= function(tableName) {
	if (JSUtil.nil(tableName))
		return false;
	
	if (new ArrayUtil().contains(j2js(new TableUtils('task_sla').getAllExtensions()), tableName))
		return true;
	
	return false;
};

// return list of workflow IDs related to the 'task_sla' table, or its extensions
SLAvalidation.getSLAWorkflows = function() {
	var wfv_gr = new GlideRecord('wf_workflow_version');
	wfv_gr.addActiveQuery();
	wfv_gr.addQuery('table', j2js(new TableUtils('task_sla').getAllExtensions()));
	wfv_gr.addQuery('published', true).addOrCondition('checked_out_by', gs.getUserID());
	wfv_gr.orderByDesc('checked_out_by');
	wfv_gr.query();
	answer = [];
	while (wfv_gr.next())
		answer.push(wfv_gr.workflow + '');
	return answer;
};

// return list of Workflow IDs related to the 'task_sla' table, or its extensions, as an encoded query
// (used by contract_sla.workflow reference qualifier)
SLAvalidation.getSLAWorkflowsRQ = function() {
	return 'sys_idIN' + SLAvalidation.getSLAWorkflows();
};

// true iff this SLA definition's schedule is 'empty'
SLAvalidation.warnEmptySchedules = function(contract_sla) {
	var sv = new ScheduleValidation(contract_sla.schedule);
	if (!sv.isEmptySchedule())
		return;
	
	var msg = gs.getMessage('Warning: There are no active entries in the Schedule');
	if (sv.hasChildSchedule())
		msg = gs.getMessage('Warning: There are no active entries in the Schedule, or its Child Schedules');
	
	// add msg if it hasn't already been added
	if (!new ArrayUtil().contains(j2js(gs.getErrorMessages()), msg))
		gs.addErrorMessage(msg);
};

SLAvalidation.prototype = {
	initialize : function() {
	},
	type: 'SLAvalidation'
};