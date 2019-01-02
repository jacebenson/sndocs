var ChangeCheckConflicts = Class.create();

// System properties
ChangeCheckConflicts.CHANGE_CONFLICT_MODE = "change.conflict.mode";
ChangeCheckConflicts.CHANGE_CONFLICT_CURRENTCI = "change.conflict.currentci";
ChangeCheckConflicts.CHANGE_CONFLICT_CURRENTWINDOW = "change.conflict.currentwindow";
ChangeCheckConflicts.CHANGE_CONFLICT_BLACKOUT = "change.conflict.blackout";
ChangeCheckConflicts.CHANGE_CONFLICT_RELATEDCHILDWINDOW = "change.conflict.relatedchildwindow";
ChangeCheckConflicts.CHANGE_CONFLICT_RELATEDPARENTWINDOW = "change.conflict.relatedparentwindow";
ChangeCheckConflicts.CHANGE_CONFLICT_SHOW_TIMING_INFO = "change.conflict.show.timing.info";
ChangeCheckConflicts.CHANGE_CONFLICT_DUMP_COUNT = "change.conflict.dump.count";
ChangeCheckConflicts.CHANGE_CONFLICT_FILTER_CASE_SENSITIVE = "change.conflict.filter.case_sensitive";

ChangeCheckConflicts.getConfig = function (config) {
	if (!config)
			config = {};
	if (!('mode' in config))
			config.mode = gs.getProperty(ChangeCheckConflicts.CHANGE_CONFLICT_MODE);
	if (!('include_current_ci' in config))
		config.include_current_ci = gs.getProperty(ChangeCheckConflicts.CHANGE_CONFLICT_CURRENTCI) == 'true';
	if (!('current_window' in config))
		config.current_window = gs.getProperty(ChangeCheckConflicts.CHANGE_CONFLICT_CURRENTWINDOW) == 'true';
	if (!('include_blackout_window' in config))
		config.include_blackout_window = gs.getProperty(ChangeCheckConflicts.CHANGE_CONFLICT_BLACKOUT) == 'true';
	if (!('include_related_children_window' in config))
		config.include_related_children_window = gs.getProperty(ChangeCheckConflicts.CHANGE_CONFLICT_RELATEDCHILDWINDOW) == 'true';
	if (!('include_related_parent_window' in config))
		config.include_related_parent_window = gs.getProperty(ChangeCheckConflicts.CHANGE_CONFLICT_RELATEDPARENTWINDOW) == 'true';
	if (!('show_timing_info' in config))
		config.show_timing_info = gs.getProperty(ChangeCheckConflicts.CHANGE_CONFLICT_SHOW_TIMING_INFO) == 'true';
	if (!('dump_count' in config))
		config.dump_count = parseInt(gs.getProperty(ChangeCheckConflicts.CHANGE_CONFLICT_DUMP_COUNT, "500"));
	if (!('filter_is_case_sensitive' in config))
		config.filter_is_case_sensitive = gs.getProperty(ChangeCheckConflicts.CHANGE_CONFLICT_FILTER_CASE_SENSITIVE) == 'true';
	return config;
};

// This is no longer used by this script and exists only for backward compatibility
ChangeCheckConflicts.allowConflictDetection = function(currentGr, previousGr) {
	return ChangeCheckConflictsSNC.allowConflictDetection(currentGr, previousGr, ChangeCheckConflicts.getConfig());
};

ChangeCheckConflicts.prototype = Object.extendsObject(ChangeCheckConflictsSNC, {

    initialize: function(current, config) {
		ChangeCheckConflictsSNC.prototype.initialize.call(this, current, ChangeCheckConflicts.getConfig(config));
    },

	type: 'ChangeCheckConflicts'

});