var ScheduleValidation = Class.create();

// Test for recursion: A parent schedule can't loop back to itself.  Schedule A can't be a parent of Schedule A.
// Called from: Prevent Recursion in Schedules (business rule)
// -- sets field error and Error Message
// -- returns true if there is a loop (caller can choose to abort transaction)
ScheduleValidation.isRecursive = function(cmn_schedule) {
   var rt = new RecursionTester('cmn_schedule', 'parent');
   if (rt.isRecursive(cmn_schedule)) {
      cmn_schedule.parent.setError('Invalid Parent');
      gs.addErrorMessage(gs.getMessage('The selected parent loops back to this record (recursive schedule loop)'));
      return true;
   }
   return false;
};

// Warn if Schedules do not contain any active Schedule Entries
// Called from: Warn on Empty Schedules (business rule)
ScheduleValidation.warnEmptySchedules = function(cmn_schedule) {
	var considerExcludes = true;
	var msg = gs.getMessage('There are no Schedule Entries in this Schedule. Create Schedule Entries to complete the Schedule.');
	var sv = new ScheduleValidation(cmn_schedule);
	if (!sv.isEmptySchedule(considerExcludes))
		return;
	if (sv.hasChildSchedule())
		msg = gs.getMessage('There are no Schedule Entries in this Schedule, or its Child Schedule. Create Schedule Entries to complete the Schedule.');
	// add msg if it hasn't already been added
	if (!new ArrayUtil().contains(j2js(gs.getInfoMessages()), msg))
		gs.addInfoMessage(msg);
};

ScheduleValidation.prototype = {
   initialize : function(cmn_schedule) {
      this.cmn_schedule = cmn_schedule;
      this._hasChild = undefined;
   },
   // a Schedule is empty iff it has no active (non exclude) spans
   // and none of its child Schedules have active spans
   isEmptySchedule: function(considerExcludes) {
      var activeSpans = new ScheduleValidation(this.cmn_schedule.sys_id).countActiveSpans(considerExcludes);
      // also check any child schedules
      this._hasChild = false;
      gr = new GlideRecord('cmn_other_schedule');
      gr.addQuery('schedule', this.cmn_schedule.sys_id);
      gr.query();
      while (gr.next() && activeSpans === 0) {
         this._hasChild = true;
         // only 'include' types should be checked if not considering the 'Excludes' type
         // but we are interested to know whether there are any child schedules at all
         if (considerExcludes || gr.type == 'include')
            activeSpans += new ScheduleValidation(gr.child_schedule).countActiveSpans(considerExcludes);
      }
      return (activeSpans === 0);
   },
   hasChildSchedule: function() {
      if (this._hasChild !== undefined)
         return this._hasChild; 
      this._hasChild = false;
      gr = new GlideRecord('cmn_other_schedule');
      gr.addQuery('schedule', this.cmn_schedule.sys_id);
      gr.query();
      this._hasChild = gr.next();
      return this._hasChild;
   },
   countActiveSpans: function(considerExcludes) {
	   var gr = new GlideRecord('cmn_schedule_span');
	   gr.addQuery('schedule', this.cmn_schedule);
      if(!considerExcludes)
         // everything that isn't type==exclude
         gr.addQuery('type', '!=', 'exclude').addOrCondition('type', '');
	   gr.query();
	   return gr.getRowCount();
   },
   type: 'ScheduleValidation'
};