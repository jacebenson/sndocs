var SLACalculator = Class.create();
SLACalculator.prototype = Object.extendsObject(SLACalculatorNG, {
	
	// sys_properties
	SLA_DEBUG: 'com.snc.sla.debug',
	
	setNow: function(gdt) {
		this.nowMS = this._truncSeconds(gdt.dateNumericValue());
		this.nowGDT.setNumericValue(this.nowMS);
	},
	
	// recalculate a specific task_sla record
	calcAnSLA: function(taskSLAgr, /* optional: boolean */ skipUpdate) {
		this.lu.logInfo('SLACalculator.calcAnSLA: starting at ' + this.nowGDT.getDisplayValue());
		this.loadTaskSLA(taskSLAgr);
		this.calcTaskSLAs();
		this.updateTaskSLAs(taskSLAgr, skipUpdate);
		this.lu.logInfo('SLACalculator.calcAnSLA: finished');
	},
	
	calcAllSLAs: function() {
		this.lu.logInfo('SLACalculator.calcAllSLAs: starting at ' + this.nowGDT.getDisplayValue());
		this.loadAllTaskSLAs();
		this.calcTaskSLAs();
		this.updateTaskSLAs();
		this.lu.logInfo('SLACalculator.calcAllSLAs: finished');
	},
	
	calcSomeSLAs: function(start,end) {
		this.lu.logInfo('SLACalculator.calcSomeSLAs: starting at ' + this.nowGDT.getDisplayValue());
		this.loadSomeTaskSLAs(start,end);
		this.calcTaskSLAs();
		this.updateTaskSLAs();
		this.lu.logInfo('SLACalculator.calcSomeSLAs: finished');
	},
	
	// deprecated method: called by 2010 Engine Business Rule, "Run SLA calculation"
	//  pre-condition: !tslaGR.end_time.nil() && tslaGR.stage != 'cancelled', load/calc/updateTaskSLAs have been executed for this tslaGR
	getTaskSLAStage: function(tslaGR) {
		// Calculate stage (after its completed) based on percentage complete
		var answer = '';
		var currentTaskSLA = this._getTaskSLA(tslaGR);
		if (!currentTaskSLA)
			return tslaGR.stage; // no change
		
		if ((currentTaskSLA.schedule) ? currentTaskSLA.business_percentage >= 100 : currentTaskSLA.percentage >= 100)
			answer = 'breached';
		else
			answer = 'achieved';
		return answer;
	},
	
	// setTimers(true) -- enable StopWatch timers in main routines
	setTimers: function(value) {
		this.timers = value;
	},
	
	setDebug: function(value) {
		this.lu.setLevel(value);
	},
	
	// update values in one single task_sla record
	_updateTaskSLArecord: function(gr, sla, /* optional: boolean */ skipUpdate) {
		// SLACalculator has always disabled business rules before calling gr.update(), SLACalculatorNG doesn't
		if (!skipUpdate)
			gr.setWorkflow(false);
		new SLACalculatorNG()._updateTaskSLArecord(gr, sla, skipUpdate);
	},
	
	SLA_API_2010: true,
	
	type: 'SLACalculator'
});