var PADiagnosticsConstants = Class.create();
PADiagnosticsConstants.prototype = {
	initialize: function() {
	// DIAGNOSTIC EXECUTION URL
	this.PA_DIAGNOSTIC_EXECUTION_URL = '/' + this.PA_DIAGNOSTIC_EXECUTION + '.do?' + this.SYS_ID + this.EQUALS;
	},
	
	// TABLES
	PA_DIAGNOSTIC: 'pa_diagnostic',
	PA_DIAGNOSTIC_EXECUTION: 'pa_diagnostic_execution',
	PA_DIAGNOSTIC_LOG: 'pa_diagnostic_log',
	SYS_EXECUTION_TRACKER: 'sys_execution_tracker',
	
	// FIELDS
	ACTIVE: 'active',
	ADVANCED: 'advanced',
	CONDITION: 'condition',
	DIAGNOSTICS_EXECUTED: 'diagnostics_executed',
	ERROR_MESSAGES: 'error_messages',
	EXECUTION_DATE: 'execution_date',
	INFORMATION_MESSAGES: 'information_messages',
	PROBLEM_RECORD: 'problem_record',
	PROBLEM_TABLE: 'problem_table',
	SCRIPT: 'script',
	SEVERITY: 'severity',
	STATE: 'state',
	SYS_ID: 'sys_id',
	TABLE: 'table',
	LOG_WHEN_EMPTY: 'log_when_empty',
	TOTAL_MESSAGES: 'total_messages',
	WARNING_MESSAGES: 'warning_messages',
	
	
	// CHOICES
	COMPLETED: 'completed',
	EXECUTING: 'executing',
	CANCELLED: 'cancelled',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info',
	NEW: 'new',
	
	// QUERY OPERATORS
	EQUALS: '=',
	IN: 'IN',
	
	// UNALLOWED GLIDE RECORD FUNCTION CALLS 
	INSERT: '.insert()',
	UPDATE: '.update()',
	UPDATE_MULTIPLE: '.updateMultiple()',
	DELETE_RECORD: '.deleteRecord()',
	DELETE_MULTIPLE: '.deleteMultiple()',
	
	type: 'PADiagnosticsConstants'
};