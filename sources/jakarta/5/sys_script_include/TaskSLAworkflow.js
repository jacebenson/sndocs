var TaskSLAworkflow = Class.create();

TaskSLAworkflow.prototype = {
	
	// sys_properties
	SLA_WORKFLOW_LOG: 'com.snc.sla.workflow.log',
	SLA_WORKFLOW_RUN_FOR_BREACHED: 'com.snc.sla.workflow.run_for_breached',
	SLA_DATABASE_LOG: 'com.snc.sla.log.destination',
	
	initialize : function(taskSLAgr) {
		this.runForBreached = (gs.getProperty(this.SLA_WORKFLOW_RUN_FOR_BREACHED, 'false') == 'true');
		this.taskSLAgr = new GlideRecord(taskSLAgr.getTableName());
		this.taskSLAgr.get(taskSLAgr.sys_id);
		this.lu = new GSLog(this.SLA_WORKFLOW_LOG, this.type);
		this.lu.includeTimestamp();
		if (gs.getProperty(this.SLA_DATABASE_LOG, "db") == "node")
			this.lu.disableDatabaseLogs();
		
		// if enable logging has been checked on the SLA definition up the log level to "debug"
		if (this.taskSLAgr && this.taskSLAgr.sla.enable_logging)
			this.lu.setLevel(GSLog.DEBUG);
		
		this.lu.logInfo('initialize: with task_sla ' + taskSLAgr.getUniqueValue());
	},
	
	start: function() {
		this.lu.logInfo('start: copy of workflow ' + this.taskSLAgr.sla.workflow + ' started for ' + this.taskSLAgr.sla.name );
		if (this.taskSLAgr.sla.workflow.nil())
			return;
		
		// If the SLA has already breached then unless the appropriate property has been set true don't run the workflow
		if (this.taskSLAgr.has_breached && !this.runForBreached) {
			this.lu.logInfo('start: SLA has already breached so workflow will not be started for ' + this.taskSLAgr.sla.name);
			return;
		}
		
		var wfid = this.taskSLAgr.sla.workflow + '';
		
		var startTime = new GlideDateTime(this.taskSLAgr.start_time.getGlideObject());
		var now = new GlideDateTime();
		var msecs = this._truncSeconds(this._calculateRetroAdjust(startTime, now));
		
		// retroactive, if started more than 5 seconds ago (or due to start in the future)
		var w = new Workflow();
		if (msecs > 0 && msecs <= 5000)
			w.startFlow(wfid, this.taskSLAgr, 'insert');
		else
			w.startFlowRetroactive(wfid, msecs, this.taskSLAgr, 'insert');
		this.taskSLAgr.update();
	},
	
	pause: function() {
		this.lu.logInfo('pause: copy of workflow ' + this.taskSLAgr.sla.workflow + ' paused for ' + this.taskSLAgr.sla.name );
		var wf = new Workflow().getRunningFlows(this.taskSLAgr);
		while (wf.next())
			new Workflow().broadcastEvent(wf.sys_id, 'pause');
	},
	
	resume: function() {
		this.lu.logInfo('resume: copy of workflow ' + this.taskSLAgr.sla.workflow + ' resumed for ' + this.taskSLAgr.sla.name );
		var wf = new Workflow().getRunningFlows(this.taskSLAgr);
		while (wf.next())
			new Workflow().broadcastEvent(wf.sys_id, 'resume');
	},
	
	stop: function() {
		this.lu.logInfo('stop: copy of workflow ' + this.taskSLAgr.sla.workflow + ' stopped for ' + this.taskSLAgr.sla.name );
		var wf = new Workflow();
		wf.cancel(this.taskSLAgr);
	},
	
	// return the retroactive-start adjustment, in milliseconds.
	_calculateRetroAdjust: function(startTime, now) {
		var pause = this.taskSLAgr.pause_duration.dateNumericValue();
		if (this.taskSLAgr.pause_time) {
			// must be a paused "retroactively starting" SLA, so add on the current period of pause duration (total time, ignoring schedule)
			var dc = new DurationCalculator();
			dc.calcScheduleDuration(this.taskSLAgr.pause_time, now); // pause_time may not be a GlideDateTime, let DurationCalculator work it out
			var extraPause = dc.getTotalSeconds() * 1000;
			pause += extraPause;
			this.lu.logDebug('extraPause: ' + extraPause);
		}
		
		// allow for accumulated pause_duration on a retroactively starting SLA
		// by subtracting the pause duration and any current period of pause
		// (result is -ve, if start is in the future. Don't count pause before an SLA starts)
		var msecs = now.getNumericValue() - startTime.getNumericValue();
		if (startTime.compareTo(now) <= 0)
			msecs -= pause;
		
		this.lu.logDebug('_calculateRetroAdjust: startTime=' + startTime.getDisplayValueInternal() + '; now=' + now.getDisplayValueInternal() + '; msecs=' + msecs + '; (pause=' + pause + ')');
		
		return msecs;
	},
	
	_truncSeconds: function(ms) {
		var ri = 1000;
		return Math.floor(ms/ri)*ri;
	},
	
	
	type: 'TaskSLAworkflow'
	
};