(function() {
	var workflow = new Workflow();
	var wfId = workflow.getWorkflowFromName('Notify assessment user');
	workflow.cancel(current);
	workflow.startFlow(wfId, current, current.operation(), null);
})();