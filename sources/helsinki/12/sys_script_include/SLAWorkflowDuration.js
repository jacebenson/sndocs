var SLAWorkflowDuration = Class.create();
SLAWorkflowDuration.prototype = Object.extendsObject(WorkflowDuration, {
	
	initialize: function() {
		WorkflowDuration.prototype.initialize.call(this);
	},
	
	/**
 	 * Get the end date/time set by a call to 'calculate'
 	 * (returns a GlideDateTime object)
 	 */
	getEndDateTime: function() {
		return this.endDateTime;
	},
	
	/**
 	 * add the number of seconds to the specified start date/time
 	 *  potentially using the workflow-specified schedule
 	 *  (NB. relative duration uses a schedule to determine business days, but doesn't use it for duration
 	 *    unless property 'com.glideapp.workflow.duration.relative_uses_schedule' is set to "true")
 	 *
 	 * record - as per calculate()
 	 * retrieve end time with getEndDateTime();
 	 */
	addSeconds: function(/* GlideRecord */ record, seconds) {
		this.record = record;
		this._getSchedule();
		this._getTimeZone();
		
		var dc = new DurationCalculator();
		if (this.schedule && this._getValue('timer_type') != 'relative_duration' || this._useScheduleForRelative)
			dc.setSchedule(this.schedule, this.timezone);
		dc.setStartDateTime(this.startDateTime);
		dc.calcDuration(seconds);
		this.seconds = seconds;
		this.totalSeconds = dc.getTotalSeconds();
		this.endDateTime = dc.getEndDateTime();
	},
	
	/**
 	 * Get the seconds based on a relative duration calculation
 	 */
	_getSecondsFromRelativeDuration: function() {
		var dur = new DurationCalculator();
		dur.setSchedule(this.schedule, this.timezone);
		dur.setStartDateTime(this.startDateTime);
		this._setCurrent();
		dur.calcRelativeDuration(this._getValue('relative_duration'));
		this._unsetCurrent();
		this.endDateTime = dur.getEndDateTime();
		this.lu.logDebug('_getSecondsFromRelativeDuration: start=' + this.startDateTime.getValue() + '; end=' + this.endDateTime.getValue() + '; totalSeconds=' + dur.getTotalSeconds() + '; seconds=' + dur.getSeconds() + ' [' + this._useScheduleForRelative + ']');
		if (this._useScheduleForRelative)
			return dur.getSeconds();
		return dur.getTotalSeconds();
	},
	
	_setCurrent: function() {
		this.ocurrent = null;
		if (current && current.getTableName() == "task_sla" && current.task && current.sla && current.sla.relative_duration_works_on == "Task record") {
			this.ocurrent = current;
			current = current.task.getRefRecord();
		}
	},
	
	_unsetCurrent: function() {
		if (this.ocurrent)
			current = this.ocurrent;
	},
	
	type: 'SLAWorkflowDuration'
});