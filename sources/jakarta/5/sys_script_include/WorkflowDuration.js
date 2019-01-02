/**
 * This class handles calculating the duration (number of seconds)
 * based on the variables of a workflow activity.
 *
 * The activity variables should include:
 *         timer_type
 *             '' -> user specified duration
 *             'relative_duration'
 *             'field'
 *             'script'
 *
 *         duration
 *         relative_duration
 *         field
 *         script
 *
 *         schedule_type
 *             'user_specified_schedule'
 *             'from_field_schedule'
 *             'workflow_schedule'
 *
 *         user_specified_schedule
 *         field_schedule
 *
 *         timezone_type
 *             'user_specified_timezone'
 *             'from_field_timezone'
 *             'workflow_timezone'
 *
 *         user_specified_timezone
 *         timezone_field
 *
 *         modifier
 *         percentage
 *         time_before
 *         time_after
 */
var WorkflowDuration = Class.create();
WorkflowDuration.prototype = {
   
   initialize: function() {
      this.schedule = "";
      this.timezone = "";
      this.usedSecs = 0;
      this.startDateTime = new GlideDateTime();
      this.endDateTime = "";
      this.seconds = 0;
      this.totalSeconds = 0;
      this.workflowSchedule = "";
      this.workflowTimezone = "";

      this.activityDef = undefined;

      this._useScheduleForScript = (gs.getProperty('com.glideapp.workflow.duration.script_uses_schedule', 'false') == 'true');
      this._useScheduleForRelative = (gs.getProperty('com.glideapp.workflow.duration.relative_uses_schedule', 'false') == 'true');
       
      // Uncomment this line to turn on logging, otherwise empty logDebug is defined, which does nothing but prevents from throwing exception
      //this.lu = {logDebug: function(msg) {gs.log("SNC-WorkflowDuration: " + msg);}};
      this.lu = { logDebug: function(msg) {} };
   },
   
   /**
    * Get the seconds value that was set by a call to 'calculate'
    */
   getSeconds: function() {
      return this.seconds;
   },
   
   /**
    * Get the totalSeconds value that was set by a call to 'calculate'
    */
   getTotalSeconds: function() {
      return this.totalSeconds;
   },
   
   /**
    * Get the end date/time set by a call to 'calculate'
    * (returns a GlideDateTime object)
    */
   getEndDateTime: function() {
      return this.endDateTime;
   },
   
   /**
    * Set the start date/time to use in the calculations
    * (expects to be in GlideDateTime, or GMT
    * internal format - that is from GlideDateTime.getValue())
    */
   setStartDateTime: function(dt) {
      if (!dt)
         this.startDateTime = new GlideDateTime();
      else
         this.startDateTime = new GlideDateTime(dt);
   },
   
   /**
    * Set the end date/time, to use when calculating remaining time left
    * (GlideDateTime, or GMT internal format, from GlideDateTime.getValue())
    */
   setEndDateTime: function(dt) {
      if (dt)
         this.endDateTime = new GlideDateTime(dt);
   },
   
   /**
    * Set the workflow schedule/timezone
    * (used for schedule_type == 'workflow_schedule'
    *  and timezone_type == 'workflow_timezone')
    */
   setWorkflow: function(schedule, timezone) {
      this.workflowSchedule = schedule;
      this.workflowTimezone = timezone;
   },
   
   /*
    * Specify the calling Activity Handler object
    *
    * Used to execute runScript() in the original activity, which references the current context's scratchpad etc. 
    * This protects both formats of returning a value
    *  either by setting a value to the global answer or by returning a value on the last line of the script. 
    */ 
   setActivity: function(/* a WFActivityHandler object */ inActivityDef) {
      this.activityDef = inActivityDef;
   },

   
   /**
    * Set the "used seconds" compensation,
    *  where the number of seconds is the number of seconds inside of any schedule
    *  (can be a -ve number, which extends the duration)
    */
   setUsedSecs: function(secs) {
      this.usedSecs = secs;
   },
   
   /**
    * calculate the number of seconds, and the due date
    *
    * record - the record that contains the fields specified in the class comment above
    */
   calculate: function(/*GlideRecord*/record) {
      this.record = record;
      this._getSchedule();
      this._getTimeZone();
      this.endDateTime = "";
      
      this.lu.logDebug('calculate: timer_type=' + this._getValue('timer_type') + '; modifier=' + this._getValue('modifier'));
      
      var secs = 0;
      switch (this._getValue('timer_type')) {
         case 'relative_duration':
         secs = this._getSecondsFromRelativeDuration();
         
         // if timer duration needs modification
         if (this._getValue('modifier')) {
            secs = this._modifySeconds(secs);
            this.endDateTime = "";
         }
         break;
         
         case 'field':
         secs = this._getSecondsFromField();
         break;
         
         case 'script':
         secs = this._getSecondsFromScript();
         break;
         
         default:
         secs = this._getSecondsFromDuration();
      }
      
      this.seconds = secs;
      if (!this.endDateTime) {
         this.endDateTime = new GlideDateTime(this.startDateTime);
         this.endDateTime.addSeconds(this.seconds);
      }
      // if not already set by _getSecondsFrom*()
      this.lu.logDebug('calculate: this.endDateTime=' + this.endDateTime.getDisplayValueInternal() + ' (start: ' + this.startDateTime.getDisplayValueInternal() + '); ' + this.seconds);
      if (!this.totalSeconds)
         this.totalSeconds = this._totalSeconds(this.startDateTime, this.endDateTime);

   },
   
   /**
    * calculate the number of seconds remaining to the specified end date/time
    *
    * record - as per calculate()
    * retrieve values with getSeconds() and getTotalSeconds(), as required
    * returns 0 if specified end date/time is in the past.
    */
   calculateTimeLeft: function(/*GlideRecord*/ record) {
      this.record = record;
      this._getSchedule();
      this._getTimeZone();

      this.lu.logDebug('calculateTimeLeft: this.endDateTime=' + this.endDateTime.getDisplayValueInternal() + ' (start: ' + this.startDateTime.getDisplayValueInternal() + '); ' + this.totalSeconds);
      var dc = new DurationCalculator();
      if (this.schedule)
         dc.setSchedule(this.schedule, this.timezone);
      dc.calcScheduleDuration(this.startDateTime, this.endDateTime);
      this.seconds = dc.getSeconds();
      this.totalSeconds = dc.getTotalSeconds();
      if (this._getValue('timer_type') == 'relative_duration' || !this.schedule)
         this.seconds = this.totalSeconds;
   
      this.lu.logDebug('calculateTimeLeft: with schedule [' + this.schedule + ']; this.seconds=' + this.seconds);
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
      dur.calcRelativeDuration(this._getValue('relative_duration'));
      this.endDateTime = dur.getEndDateTime();
      this.lu.logDebug('_getSecondsFromRelativeDuration: start=' + this.startDateTime.getValue() + '; end=' + this.endDateTime.getValue() + '; totalSeconds=' + dur.getTotalSeconds() + '; seconds=' + dur.getSeconds() + ' [' + this._useScheduleForRelative + ']');
      if (this._useScheduleForRelative)
         return dur.getSeconds();
      return dur.getTotalSeconds();
   },
   
   /**
    * Get the seconds based on the value of a field
    */
   _getSecondsFromField: function() {
      var secs = 0;
      var fieldName = this._getValue('field');
      this.lu.logDebug('_getSecondsFromField: fieldname (' + !fieldName + ') = ' + fieldName);
      if (!fieldName)
         return 0;
      var e = current.getElement(fieldName);
      this.lu.logDebug('_getSecondsFromField: element (' + !e + ') = ' + e.getName());
      if (!e) {
         return 0;
      }
      var fieldType = e.getED().getInternalType() + '';
      if (fieldType == 'glide_duration') {
         secs = e.getGlideObject().getNumericValue();
         secs = secs / 1000;

         // if timer duration needs modification
         if (this._getValue('modifier')) {
            secs = this._modifySeconds(secs);
         }
         
         this.lu.logDebug('_getSecondsFromField: schedule=' + this.schedule + '; timezone=' + this.timezone);
         this.lu.logDebug('_getSecondsFromField: startDateTime=' + this.startDateTime.getDisplayValueInternal() + '; secs=' + secs);
         // change time with schedule and timezone
         secs = this._getSeconds(secs);
      } else if (fieldType == 'glide_date' || fieldType == 'glide_date_time') {
         var start = new GlideDateTime(this.startDateTime);
         this.endDateTime = new GlideDateTime();
         if (fieldType == 'glide_date')
             this.endDateTime.setDisplayValue(e.getGlideObject());
         else
             this.endDateTime.setValue(e.getGlideObject());
              
         // secs = this._totalSeconds(start, this.endDateTime);
         var dc = new DurationCalculator();
         if (this.schedule)
            dc.setSchedule(this.schedule, this.timezone);
         
         if (this.startDateTime.getNumericValue() < this.endDateTime.getNumericValue()) {
             dc.calcScheduleDuration(this.startDateTime, this.endDateTime);
             secs = dc.getSeconds();
         } else {
             dc.calcScheduleDuration(this.endDateTime, this.startDateTime);
             secs = -dc.getSeconds();
         }
         
         // if timer duration needs modification
         if (this._getValue('modifier')) {
            secs = this._modifySeconds(secs);
         }
         this.lu.logDebug('_getSecondsFromField: schedule=' + this.schedule + '; timezone=' + this.timezone);
         this.lu.logDebug('_getSecondsFromField: startDateTime=' + this.startDateTime.getDisplayValueInternal() + '; endDateTime=' + this.endDateTime.getDisplayValueInternal() + '; secs=' + secs);
         secs = this._getSeconds(secs);
      }
      this.lu.logDebug('_getSecondsFromField: ('+ fieldName +') ' + secs + '; this.endDateTime=' + this.endDateTime.getDisplayValueInternal());
      return secs;
   },
   
   /**
    * Get seconds from a script
    */
   _getSecondsFromScript: function() {
      var script = this._getValue('script');
      var seconds;
      this.lu.logDebug('_getSecondsFromScript: [' + script + ']');
      if (this.activityDef !== undefined && typeof this.activityDef.runScript == 'function') {
         // run the script with the activity runScript method
         seconds = this.activityDef.runScript(script);
         this.lu.logDebug('_getSecondsFromScript: activity handler ' + this.activityDef.type + '.runScript() -> ' + seconds);
      }
      else
         seconds = GlideController.evaluateString(script);
      
      // ensure secs is always a valid number
      // (it may not be if a script returned an invalid value)
      if (JSUtil.nil(seconds) || isNaN(seconds))
         seconds = 0;
      if (this._useScheduleForScript)
         return this._getSeconds(seconds);
      return seconds;
   },
   
   /**
    * Get seconds from a user specified duration
    */
   _getSecondsFromDuration: function() {
      return this._getSeconds(this.record.duration.getGlideObject().getNumericValue() / 1000);
   },
   
   _getSeconds: function(durSeconds) {
      var dur = new DurationCalculator();
      dur.setSchedule(this.schedule, this.timezone);
      dur.setStartDateTime(this.startDateTime);
      dur.calcDuration(durSeconds);
      this.endDateTime = dur.getEndDateTime();
      return dur.getSeconds();
   },
   
   /**
    * Determine if there is a schedule specified
    */
   _getSchedule: function() {
      this.schedule = "";
      switch (this._getValue('schedule_type')) {
         case 'user_specified_schedule':
         this.schedule = this._getValue('user_specified_schedule');
         break;
         
         case 'from_field_schedule':
         var fieldName = this._getValue('schedule_field');
         if (fieldName)
            this.schedule = current.getElement(fieldName);
         break;
         
         case 'workflow_schedule':
         if (this.workflowSchedule)
            this.schedule = this.workflowSchedule;
         break;
      }
      this.lu.logDebug('_getSchedule: ' + this._getValue('schedule_type') + ': ' + this.schedule);
      
      if (!this.schedule)
         this.schedule = "";
   },
   
   _getTimeZone: function() {
      this.timezone = "";
      switch (this._getValue('timezone_type')) {
         case 'user_specified_timezone':
         this.timezone = this._getValue('user_specified_timezone');
         break;
         
         case 'from_field_timezone':
         var fieldName = this._getValue('timezone_field');
         if (fieldName)
            this.timezone = current.getElement(fieldName);
         break;
         
         case 'workflow_timezone':
         if (this.workflowTimezone)
            this.timezone = this.workflowTimezone;
         break;
      }
      this.lu.logDebug('_getTimeZone: ' + this._getValue('timezone_type') + ' in ' + fieldName + ' -> ' + this.timezone);
      if (!this.timezone)
         this.timezone = "";
   },
   
   _totalSeconds: function(/* GlideDateTime */ startTime, /* GlideDateTime */ endTime) {
      return Math.floor((endTime.getNumericValue() - startTime.getNumericValue()) / 1000);
   },
   
   /**
    * See if a modifier is specified and modify the total seconds accordingly
    * Also apply any specified time to be "used up"
    */
   _modifySeconds: function(secs) {
      var secsModified = parseInt(secs, 10);
      switch (this._getValue('modifier')) {
         case 'percentage':
         var perc = this._getValue('percentage');
         if (!perc)
            break;
         
         secsModified = secs * (perc / 100);
         break;
         
         case 'before':
         var beforeSecs = this.record.time_before.getGlideObject().getNumericValue() / 1000;
         secsModified -= beforeSecs;
         break;
         
         case 'after':
         var afterSecs = this.record.time_after.getGlideObject().getNumericValue() / 1000;
         secsModified += afterSecs;
         break;
      }
      // (for retroactive re-calculation)
      this.lu.logDebug('_modifySeconds: this.usedSecs=' + this.usedSecs);
      if (this.usedSecs !== 0)
         secsModified -= this.usedSecs;
      this.lu.logDebug('_modifySeconds: secsModified=' + secsModified);
      
      return secsModified;
   },
   
   _getValue: function(name) {
      var v = this.record.getValue(name);
      if (!v)
         v = "";
      
      return v;
   },
   
   type: 'WorkflowDuration'
};