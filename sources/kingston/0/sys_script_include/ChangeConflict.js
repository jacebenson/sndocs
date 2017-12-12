var ChangeConflict = Class.create();

// Change Conflict types
// (sys_choice_conflict_type)
ChangeConflict.CHANGETYPE_ALREADY_SCHEDULED        = 'ci_already_scheduled';
ChangeConflict.CHANGETYPE_NOT_IN_WINDOW            = 'not_in_maintenance_window';
ChangeConflict.CHANGETYPE_BLACKOUT                 = 'blackout';
ChangeConflict.CHANGETYPE_CHILD_ALREADY_SCHEDULED  = 'child_ci_already_scheduled';
ChangeConflict.CHANGETYPE_CHILD_NOT_IN_WINDOW      = 'child_not_in_maintenance_window';
ChangeConflict.CHANGETYPE_PARENT_ALREADY_SCHEDULED = 'parent_ci_already_scheduled';
ChangeConflict.CHANGETYPE_PARENT_NOT_IN_WINDOW     = 'parent_not_in_maintenance_window';

ChangeConflict.prototype = {
	
	initialize: function(configurationItemId, changeId, ctype, conflictingChangeId, scheduleId, relatedCi) {
		this.configurationItemId = configurationItemId;
		this.changeId = changeId;
		this.ctype = ctype;
		this.conflictingChangeId = conflictingChangeId;
		this.scheduleId = scheduleId;
		this.relatedCi = relatedCi;
	},
	
	toString: function() {
		return "\rCI               : " + this.configurationItemId +
		"\rChange           : " + this.changeId +
		"\rConflict         : " + this.conflictingChangeId +
		"\rRelatedCi        : " + this.relatedCi +
		"\rSchedule         : " + this.scheduleId;
	}
};
