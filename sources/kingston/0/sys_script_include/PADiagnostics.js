var PADiagnostics = Class.create();
PADiagnostics.prototype = {	
	_CONSTANTS: new PADiagnosticsConstants(),
	initialize: function() {},
	
	/**
	 * Create a log record
	 *
	 * @param diagnosticID
	 * @param executionID
	 * @param table
	 * @param documentID
	 *
	 * @return sys_id
	 */
	_logIssue: function(diagnosticID, executionID, table, documentID) {
		var log = new GlideRecord(this._CONSTANTS.PA_DIAGNOSTIC_LOG);
		log.initialize();
		log.setValue(this._CONSTANTS.PA_DIAGNOSTIC, diagnosticID);
		log.setValue(this._CONSTANTS.PA_DIAGNOSTIC_EXECUTION, executionID);
		log.setValue(this._CONSTANTS.PROBLEM_TABLE, table);
		if (documentID)
			log.setValue(this._CONSTANTS.PROBLEM_RECORD, documentID);
		log.setValue(this._CONSTANTS.STATE, this._CONSTANTS.NEW);
		return log.insert();
	},
	
	/**
	 * Create an execution record
	 *
	 * @return sys_id
	 */
	_execution: function() {
		var exec = new GlideRecord(this._CONSTANTS.PA_DIAGNOSTIC_EXECUTION);
		exec.initialize();
		exec.setValue(this._CONSTANTS.EXECUTION_DATE, new GlideDateTime());
		exec.setValue(this._CONSTANTS.DIAGNOSTICS_EXECUTED, 0);
		exec.setValue(this._CONSTANTS.TOTAL_MESSAGES, 0);
		exec.setValue(this._CONSTANTS.ERROR_MESSAGES, 0);
		exec.setValue(this._CONSTANTS.WARNING_MESSAGES, 0);
		exec.setValue(this._CONSTANTS.INFORMATION_MESSAGES, 0);
		exec.setValue(this._CONSTANTS.STATE, this._CONSTANTS.EXECUTING);
		exec.insert();
		return exec;
	},
	
	/**
	 * Evaluate a diagnostic record that is based on condition and table.
	 *
	 * @param diagnostic
	 * @param executionID
	 * @return numIssues
	 */
	_evaluateTable: function(diagnosticGR, executiondID) {
		// find records based on the configuration of the diagnostic record
		var table = diagnosticGR.getValue(this._CONSTANTS.TABLE);
		var gr = new GlideRecord(table);
		gr.addEncodedQuery(diagnosticGR.getValue(this._CONSTANTS.CONDITION));
		gr.query();

		// log_when_empty is a flag that indicates whether or not
		// the existence of records (false) or absence of records (true)
		// means that we have found a potential issue
		var issues = 0;
		var diagnosticID = diagnosticGR.getUniqueValue();
		if (diagnosticGR.getValue(this._CONSTANTS.LOG_WHEN_EMPTY) == 0) {
			while (gr.next()) {
				this._logIssue(diagnosticID, executiondID,gr.getTableName(), gr.getUniqueValue());
				issues++;
			}
		} else if (gr.getRowCount() === 0) {
			this._logIssue(diagnosticID, executiondID, table);
			issues = 1;
		}

		return issues;
	},
	
	/**
	 * Evaluate a diagnostic record that is advanced i.e. based on script.
	 *
	 * @param diagnostic
	 * @param executionID
	 * @return numIssues
	 */
	_evaluateScript: function(diagnosticGR, executionID) {
		var issues = 0;
		var isScriptAllowed = new PADiagnosticsUtil().isScriptAllowed(diagnosticGR.getValue(this._CONSTANTS.SCRIPT));
		if(!isScriptAllowed){
			gs.error(gs.getMessage('Diagnostic with sys_id {0} was skipped. It contains a script that modifies records', diagnosticGR.getUniqueValue()));
			return issues;
		}
		var evaluator = new GlideScopedEvaluator();
		var answer = evaluator.evaluateScript(diagnosticGR, this._CONSTANTS.SCRIPT);
		var gr = new GlideRecord(diagnosticGR.getValue(this._CONSTANTS.TABLE));
		gr.addQuery(this._CONSTANTS.SYS_ID, this._CONSTANTS.IN, answer);
		gr.query();
		while (gr.next()) {
			this._logIssue(diagnosticGR.getUniqueValue(), executionID, gr.getTableName(), gr.getUniqueValue());
			issues++;
		}

		return issues;
	},

	/**
	 * Query the diagnostic table, retrieve only active diagnostics and decide how to evaluae each diagnostic.
	 *
	 * @param encodedQuery
	 * @return exectionID
	 */	
	_run: function(encodedQuery) {
		var startTime = new Date().getTime();
		var tracker = this.startTracker();
		var exec = this._execution();
		var executionID = exec.getUniqueValue();
		var total = 0;
		var errors = 0;
		var warnings = 0;
		var infos = 0;
		var executedDiagnostics = 0;
		var executionList = [];
		var cancelled = false;

		var diagnostic = new GlideRecord(this._CONSTANTS.PA_DIAGNOSTIC);
		if(null !== encodedQuery)
			diagnostic.addEncodedQuery(encodedQuery);
		
		diagnostic.addActiveQuery();
		diagnostic.query();
		var totalDiagnostics = diagnostic.getRowCount();
		var intervalPercent = Math.floor(100 / totalDiagnostics);
		
		while (diagnostic.next()) {
			var issues = 0;
			// evaluate either table or script type of diagnostic
			if (diagnostic.getValue(this._CONSTANTS.ADVANCED) == 0) {
				issues = this._evaluateTable(diagnostic, executionID);
			} else {
				issues = this._evaluateScript(diagnostic, executionID);
			}
			
			executionList.push(diagnostic.sys_id);
			executedDiagnostics++;
			if (executedDiagnostics <= totalDiagnostics ) {
				tracker.incrementPercentComplete(intervalPercent);				
			}
			
			// increment the number of log messages we are creating
			switch (diagnostic.getValue(this._CONSTANTS.SEVERITY)) {
				case this._CONSTANTS.ERROR:
					errors += issues;
					break;
				case this._CONSTANTS.WARNING:
					warnings += issues;
					break;
				case this._CONSTANTS.INFO:
					infos += issues;
					break;
			}

			total += issues;
			
			if (this.isCancelled(tracker)) {
				cancelled = true;
				break;
			}
		}

		// set our execution summary and set it to complete
		exec.setValue(this._CONSTANTS.TOTAL_MESSAGES, total);
		exec.setValue(this._CONSTANTS.DIAGNOSTICS_EXECUTED, executedDiagnostics);
		exec.setValue(this._CONSTANTS.ERROR_MESSAGES, errors);
		exec.setValue(this._CONSTANTS.WARNING_MESSAGES, warnings);
		exec.setValue(this._CONSTANTS.INFORMATION_MESSAGES, infos);
		if (cancelled) {
			exec.setValue(this._CONSTANTS.STATE, this._CONSTANTS.CANCELLED);
		} else {
			exec.setValue(this._CONSTANTS.STATE, this._CONSTANTS.COMPLETED);
		}
		exec.update();
		
		var endTime = new Date().getTime();
		var timeTaken = (endTime - startTime) / 1000;
		tracker.updateResult({
			timeTaken: timeTaken,
			cancelled: cancelled,
			requested_execution: totalDiagnostics,
			completed_execution: executedDiagnostics,
			diagnostics_executed: executionList,
			url: this._CONSTANTS.PA_DIAGNOSTIC_EXECUTION_URL + exec.getUniqueValue()
		});
		return exec.getUniqueValue();
	},
	
	/**
	 * Execute all active diagnostics
	 * 
	 * @return executionID
	 */
	executeAll: function() {
		return this._run(null);
	},
	
	/**
	 * Execute a single diagnostic based on its sys_id
	 * 
	 * @param sysIDs
	 * @return executionID
	 */
	executeSingle: function(sysID) {
		return this._run(this._CONSTANTS.SYS_ID + this._CONSTANTS.EQUALS + sysID);
	},
	
	/**
	 * Execute diagnostics based on the given sys_ids
	 * 
	 * @param sysIDs
	 * @return executionID
	 */	
	execute: function(sysIDs) {
		return this._run(this._CONSTANTS.SYS_ID + this._CONSTANTS.IN + sysIDs);
	},
		
	/**
	 * Start execution tracker
	 * 
	 * @return tracker
	 */
	startTracker: function() {
		var tracker = GlideExecutionTracker.getLastRunning();
        tracker.run();
		return tracker;
	},
	
	/**
	 * Check tracker if the cancel is requested
	 * 
	 * @param tracker
	 * @return true if the cancel is requested
	 */
	isCancelled: function(tracker) {
		var trackerGR = new GlideRecord(this._CONSTANTS.SYS_EXECUTION_TRACKER);
		if (!trackerGR.isValid()) {
			return false;
		}
		
		var sysId = tracker.getSysID();
		if (!gs.nil(sysId) && !trackerGR.get(sysId)) {
			return false;
		}
		
		if (gs.nil(trackerGR.result)) {
			return false;
		}
		
		var result = JSON.parse(trackerGR.result);
		if (result.cancel_requested && (result.cancel_requested == 'true')) {
			return true;
		}
		return false;
	},
	
    type: 'PADiagnostics'
};