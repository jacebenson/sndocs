var UpgradeLog = Class.create();

UpgradeLog.prototype = {
	
	initialize: function() {},
	
	getAllDescriptions: function(parent) {
		if (!this._shouldRun()) {
			// re-schedule the summary job to run later
			var when = new GlideDateTime();
			var future_in_seconds = 15;
			gs.print('System is running upgrade or plugin activation. Re-scheduled the upgrade summary job to run ' + future_in_seconds + ' seconds later');
			when.add(future_in_seconds*1000);
			var script = "var logger = new UpgradeLog(); logger.getAllDescriptions('" + parent + "');";
			GlideRunScriptJob.scheduleScript(script, "Re-schedule of upgrade summary job to run at " + when, when);
			return;
		}

		this.getSummary(parent);
		this._updateHistoryLog(parent, true);
		this._updateHistoryLog(parent, false);
	},

	/**
	 Update the upgrade history field in the sys_upgrade_blame table.
	 We need to do this because the tracking of upgrade blame tool starts at the very beginning
	 of upgrade/zboot before there is an active upgrade history record so there will be record
	 with empty upgrade history. Note that the upgrade blame table is truncated at the beginning
	 of the upgrade by a 'before' fix script so after upgrade/zboot all the records belong to the current
	*/
	_updateUpgradeHistoryOnSysUpgradeBlame: function(parent) {
		if (!GlideTableDescriptor.isValid('sys_upgrade_blame'))
			return;
		gs.print('Start updating upgrade history on upgrade blame log table');
		var gr = new GlideRecord('sys_upgrade_blame');
		gr.addQuery('upgrade_history', null);
		gr.largeResultExpected();
        gr.setValue('upgrade_history', parent);
		gr.setWorkflow(false);
		gr.updateMultiple();
        gs.print('Finished updating upgrade history on upgrade blame log table');
    },
	
	_updateHistoryLog: function(parent, skippedOnly) {
		var gr = new GlideRecord("sys_upgrade_history_log");
		if (!skippedOnly)
			gr.addQuery("disposition","!=", "4");
		else
			gr.addQuery("disposition","4");
		
		gr.setWorkflow(false);
		gr.addNullQuery("type");
		gr.addQuery("upgrade_history", parent);
		gr.largeResultExpected();
		gr.query();
		while (gr.next()) {
			var fd = SncAppFiles.getFileDescriptor(gr);
			if (fd == null)
				continue;

			gr.type = fd.type;
			var fileTableSysId = this._getTableInformation(fd.fileTableName);
			if (fileTableSysId !== "na")
				gr.sys_source_table = fileTableSysId;
			gr.target_name = fd.targetName;
			var priority = new GlideUpgradeLog().getPriority(fd.fileTableName);
			gr.type_priority = priority;
			gr.update();
		}
	},
	
	getSummary: function(parent) {
	    var dispositionCounts = {
            "added": 0,
			"added_and_different": 0,
            "skipped": 0,
			"skipped_and_different": 0,
			"skipped_and_not_different": 0,
            "updated": 0,
			"updated_and_different": 0,
			"updated_and_not_different": 0,
            "deleted": 0,
			"deleted_and_different": 0,
            "unchanged": 0,
            "unchanged_and_customized": 0,
            "skipped_error": 0,
            "skipped_manual_merge": 0,
			"skipped_manual_merge_and_different": 0,
            "skipped_apply_once": 0
        };

		var details = new GlideRecord("sys_upgrade_history_log");
		details.addQuery("upgrade_history", parent);
		details.largeResultExpected();
		details.orderBy('file_name');
		if (details.isValidField('sys_recorded_at'))
			details.orderByDesc('sys_recorded_at');
		else
			details.orderByDesc('sys_updated_on');
		details.query();
		var previous_file_name = '';
		while (details.next()) {
			var disposition = details.disposition;
			var changed = details.changed;
			// ordered by file_name and desc ordered by sys_recorded_at,
			// so that every first file that is different from the
			// previous one is the one that was applied at last.
			// the logs with the same file name that were not applied
			// at last are considered as 'not_latest'
			if (details.file_name + '' == previous_file_name) {
				details.disposition = 12; // override the disposition to 'not latest'
				details.update();
			} else {
				if (disposition == "1") {
				dispositionCounts["added"]++;
				if (changed)
					dispositionCounts["added_and_different"]++;
				}
				else if (disposition == "2") {
					dispositionCounts["updated"]++;
					if (changed)
						dispositionCounts["updated_and_different"]++;
					else
						dispositionCounts["updated_and_not_different"]++;
				}
				else if (disposition == "3") {
					dispositionCounts["deleted"]++;
					if (changed)
						dispositionCounts["deleted_and_different"]++;
				}
				else if (disposition == "4" || disposition == "6"){
					dispositionCounts["skipped"]++;
					if (changed)
						dispositionCounts["skipped_and_different"]++;
					else
						dispositionCounts["skipped_and_not_different"]++;
				}
				else if (disposition == "7")
					dispositionCounts["unchanged"]++;
				else if (disposition == "8")
					dispositionCounts["unchanged_and_customized"]++;
				else if (disposition == "9")
					dispositionCounts["skipped_error"]++;
				else if (disposition == "10") {
					dispositionCounts["skipped_manual_merge"]++;
					if (changed)
						disposition["skipped_manual_merge_and_different"]++;
				}
				else if (disposition == "11")
					dispositionCounts["skipped_apply_once"]++;
			}
			previous_file_name = details.file_name + '';
		}
		
		dispositionCounts["skipped"] += this._getSkippedCount(parent);
		this._updateUpgradeHistoryCount(parent, dispositionCounts);
	},
	
	_getSkippedCount: function(parent) {
		var history = new GlideRecord("sys_upgrade_history");
		history.query("sys_id", parent);
		history.next();
		if (history.update_set == "")
			return 0;
		
		var skipped = 0;
		var remoteUpdate = new GlideRecord("sys_remote_update_set");
		remoteUpdate.query("update_set", history.update_set.sys_id + "");
		remoteUpdate.next();
		var preview = new GlideRecord("sys_update_preview_xml");
		if (preview.isValid()) {
			preview.addQuery("remote_update.remote_update_set", remoteUpdate.sys_id + "");
			preview.addQuery("proposed_action", "skip");
			preview.query();
			while (preview.next())
				skipped++;
		}
		return skipped;
	},
	
	_updateUpgradeHistoryCount: function(parent, dispositionCounts)  {
		this._updateUpgradeHistoryOnSysUpgradeBlame(parent);
		var history = new GlideRecord("sys_upgrade_history");
		history.addQuery("sys_id", parent);
		history.query();
		if(history.next()) {
			history.added = dispositionCounts["added"];
			history.updated = dispositionCounts["updated"];
			history.updated_and_different = dispositionCounts["updated_and_different"];
			history.updated_and_not_different = dispositionCounts["updated_and_not_different"];
			history.deleted = dispositionCounts["deleted"];
			history.skipped = dispositionCounts["skipped"];
			history.skipped_and_different = dispositionCounts["skipped_and_different"];
			history.skipped_and_not_different = dispositionCounts["skipped_and_not_different"];
			history.unchanged = dispositionCounts["unchanged"];
			history.unchanged_and_customized = dispositionCounts["unchanged_and_customized"];
			history.skipped_error = dispositionCounts["skipped_error"];
			history.skipped_manual_merge = dispositionCounts["skipped_manual_merge"];
			history.skipped_apply_once = dispositionCounts["skipped_apply_once"];
			var summary = 0;
			var keys = Object.getOwnPropertyNames(dispositionCounts);
			for (var i=0; i<keys.length; i++) {
				// don't add the following fields as they are already included in updated and skipped counts
				if (keys[i].equals("updated_and_different") || 
					keys[i].equals("updated_and_not_different") ||
					keys[i].equals("skipped_and_different") ||
					keys[i].equals("skipped_and_not_different"))
					continue;
				summary += dispositionCounts[keys[i]];
			}

            history.changes_skipped = dispositionCounts["skipped_and_different"]
				+ dispositionCounts["skipped_manual_merge_and_different"]
				+ dispositionCounts["skipped_error"];

			history.changes_applied = dispositionCounts["updated_and_different"]
				+ dispositionCounts["deleted_and_different"]
				+ dispositionCounts["added_and_different"];

			history.changes_processed = history.changes_skipped + history.changes_applied;

            history.summary = summary;
			history.upgrade_finished = new GlideDateTime();
			history.update();
		}
	},

	_getTableInformation: function(tableName) {
        var gr = new GlideRecord('sys_app_file_type');
		if (!gr.isValid())
		    return "na";
		gr.addQuery('sys_source_table', tableName);
		gr.query();
		while (gr.next())
			return gr.getValue('sys_id');
		return "na";
	},

	// should not run if the system is still upgrading or activating plugin
	_shouldRun: function() {
		return !GlidePluginManager.isUpgradeSystemBusy() && SNC.UpdateMutex.isAvailable();
	}
};