var PADiagnosticsAjax = Class.create();
PADiagnosticsAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {	
	
	/**
	 * Start the progress worker
	 *
	 *  @return workerID
	 */
	start: function() {
		var worker = new GlideScriptedHierarchicalWorker();
		worker.setProgressName('Diagnostics Execution');
		worker.setScriptIncludeName('sn_pa_diagnostics.PADiagnosticsWorker');
		if (this.getParameter('sysparm_ajax_processor_all') === 'true') {
			worker.setScriptIncludeMethod('executeAll');
		} else {
			worker.setScriptIncludeMethod('execute');
			worker.putMethodArg('sysID', this.getParameter('sysparm_ajax_processor_sys_id'));
		}
		worker.setBackground(true);
		worker.start();
		return worker.getProgressID();
	},
	
	/**
	 * Cancel the progress worker
	 *
	 * Send the cancel by adding the cancel signal into the tracker
	 * result, so that the diagnostic progress worker will catch it
	 *
	 * @param trackerId
	 */
	cancel: function() {
		var tracker = new GlideExecutionTracker(this.getParameter('sysparm_trackerId'));
		tracker.updateResult({
			cancel_requested : true
		});
	},
	
    type: 'PADiagnosticsAjax'
});