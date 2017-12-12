var PADiagnosticsWorker = Class.create();
PADiagnosticsWorker.prototype = {
	initialize: function() {
		this.paDiagnostics = new PADiagnostics();
	},
	
	/**
	 * Execute all active diagnostics
	 * 
	 * @return executionID
	 */
	executeAll: function() {
		return this.paDiagnostics.executeAll();
	},
	
	/**
	 * Execute diagnostics based on the given sys_ids
	 * 
	 * @param sysIDs
	 * @return executionID
	 */	
	execute: function(sysIDs) {
		return this.paDiagnostics.execute(sysIDs);
	},
	
    type: 'PADiagnosticsWorker'
};