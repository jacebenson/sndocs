var ChangeRequestCalendarSNC = Class.create();
ChangeRequestCalendarSNC.CHANGE = 'change_request';
ChangeRequestCalendarSNC.LOG_PROP = "com.snc.change_request.calendar_view.log";
ChangeRequestCalendarSNC.prototype = {
    initialize: function(gr) {
		this._gr = gr;
		this._log = new global.GSLog(ChangeRequestCalendarSNC.LOG_PROP, this.type).setLog4J();
    },
	_addDateRangeQuery: function (gr, startDate, endDate) {
		// Astute readers will notice that we leave out Change requests with null start &
		// end dates if startDate & endDate are provided. In reality both of them are actually
		// always provided.
		//
		// This is intentional. Change Calendar supports displaying events with null bounds,
		// there it sets the null end way far far so that users don't navigate there, and the
		// event texts show "unbounded" instead of actual date value.
		//
		// However, tests show the longer the event bar (even if we just show a 24hr length of it)
		// slows down the dhtmlx calendar considerably. Also this might query many Change requests
		// on customer instances; and for what purpose? Unbounded Change requests mean they are not
		// yet scheduled and are not really useful when making a decision regarding scheduling current
		// Change. So, because of no strong functional requirement and performance consideration, we
		// leave out unbounded Change requests.
		if (startDate)
			gr.addQuery('end_date', '>', startDate);
		if (endDate)
			gr.addQuery('start_date', '<', endDate);
	},

	getRelatedSchedules: function (startDate, endDate) {
		var conf = {
			date_range: [startDate, endDate],
			dry_run: true,
			collect_window_data: true,
			allow_partially_overlapping_windows: true,
			show_timing_info: false
		};
		var conflictChecker = new global.ChangeCheckConflicts(this._gr, conf);
		if (!conflictChecker.getWindowData) {
			this._log.error("ChangeCheckConflicts does not have \"getWindowData\" defined. That is probably customized. Cannot continue.");
			return {maintenance:[], blackout:[], is_invalid_conflict_checker_si: true};
		}
		conflictChecker.check();
		return conflictChecker.getWindowData();
	},

	getChangesWithSameAssignedTo: function (startDate, endDate) {
		if (!this._gr.getValue('assigned_to'))
			return null;
		var gr = new GlideRecordSecure(ChangeRequestCalendarSNC.CHANGE);
		gr.addActiveQuery();
		gr.addQuery('sys_id', '!=', this._gr.getUniqueValue());
		this._addDateRangeQuery(gr, startDate, endDate);
		var c = gr.addJoinQuery(ChangeRequestCalendarSNC.CHANGE, 'assigned_to', 'assigned_to');
		c.addCondition('sys_id', this._gr.getUniqueValue());
		return gr;
	},

	getChangesWithSameAssignmentGroup: function (startDate, endDate) {
		if (!this._gr.getValue('assignment_group'))
			return null;
		var gr = new GlideRecordSecure(ChangeRequestCalendarSNC.CHANGE);
		gr.addActiveQuery();
		gr.addQuery('sys_id', '!=', this._gr.getUniqueValue());
		this._addDateRangeQuery(gr, startDate, endDate);
		var c = gr.addJoinQuery(ChangeRequestCalendarSNC.CHANGE, 'assignment_group', 'assignment_group');
		c.addCondition('sys_id', this._gr.getUniqueValue());
		return gr;
	},

	getChangesAffectingSamePrimaryCI: function (startDate, endDate) {
		if (!this._gr.getValue('cmdb_ci'))
			return null;
		var gr = new GlideRecordSecure(ChangeRequestCalendarSNC.CHANGE);
		gr.addActiveQuery();
		gr.addQuery('sys_id', '!=', this._gr.getUniqueValue());
		this._addDateRangeQuery(gr, startDate, endDate);
		var c = gr.addJoinQuery(ChangeRequestCalendarSNC.CHANGE, 'cmdb_ci', 'cmdb_ci');
		c.addCondition('sys_id', this._gr.getUniqueValue());
		return gr;
	},

    type: 'ChangeRequestCalendarSNC'
};