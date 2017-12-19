var UpgradeLog = Class.create();

UpgradeLog.prototype = {
	
	initialize: function() {},
	
	getAllDescriptions: function(parent) {
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
	_updateUpgradeHistoryOnSysUpgradeBlame: function() {
		if (!GlideTableDescriptor.isValid('sys_upgrade_blame'))
			return;
		gs.print('Start updating upgrade history on upgrade blame log table');
		var gr = new GlideRecord('sys_upgrade_blame');
		gr.addQuery('upgrade_history', null);
		gr.largeResultExpected();
		var activeUpgradeHistoryGR = new GlideUpgradeLog().findActiveUpgradeHistoryEntry();
        gr.setValue('upgrade_history', gs.nil(activeUpgradeHistoryGR) ? null : activeUpgradeHistoryGR.sys_id);
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
			var fd = SncAppFiles.getFileDescriptor(gr.payload);
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
		var added = 0;
		var skipped = 0;
		var updated = 0;
		var deleted = 0;
		var unchanged = 0;
		var unchanged_and_customized = 0; 
		var skipped_error = 0;
		
		var details = new GlideRecord("sys_upgrade_history_log");
		details.addQuery("upgrade_history", parent);
		details.largeResultExpected();
		details.query();
		while (details.next()) {
			var disposition = details.disposition;
			if (disposition == "1")
				added++;
			else if (disposition == "2")
				updated++;
			else if (disposition == "3")
				deleted++;
			else if (disposition == "4" || disposition == "6")
				skipped++;
			else if (disposition == "7")
				unchanged++;
			else if (disposition == "8")
				unchanged_and_customized++;
			else if (disposition == "9")
				skipped_error++;
		}
		
		skipped += this._getSkippedCount(parent);
		this._updateUpgradeHistoryCount(parent, added, updated, deleted, skipped, unchanged, unchanged_and_customized, skipped_error);
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
	
	_updateUpgradeHistoryCount: function(parent, added, updated, deleted, skipped, unchanged, unchanged_and_customized, skipped_error)  {
		this._updateUpgradeHistoryOnSysUpgradeBlame();
		var history = new GlideRecord("sys_upgrade_history");
		history.addQuery("sys_id", parent);
		history.query();
		if(history.next()) {
			history.added = added;
			history.updated = updated;
			history.deleted = deleted;
			history.skipped = skipped;
			history.unchanged = unchanged;
			history.unchanged_and_customized = unchanged_and_customized;
			history.skipped_error = skipped_error;
			history.summary = added + updated + deleted + skipped + unchanged + unchanged_and_customized+ skipped_error;
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
	}
}