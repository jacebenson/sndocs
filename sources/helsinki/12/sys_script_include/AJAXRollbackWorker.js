var AJAXRollbackWorker = Class.create();
AJAXRollbackWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	start: function() {
		// Setup background worker
		var worker = new GlideRollbackWorker();
		worker.setRollbackContextID(this.getParameter('sysparm_ajax_processor_context_id'));
		var execType = this.getParameter('sysparm_ajax_processor_rollback_exec_type');

			worker.setProgressName("Executing Rollback");

		// Start worker in the background
		worker.setBackground(true);
		worker.start();
		
		// Return worker progress ID to caller
		var progressId = worker.getProgressID();
		return progressId;	
	},
	
    type: 'AJAXRollbackWorker'
});