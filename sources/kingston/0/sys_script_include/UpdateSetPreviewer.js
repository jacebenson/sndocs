var UpdateSetPreviewer = Class.create();

UpdateSetPreviewer.prototype = {
	initialize:function () {
		this._tracker = SNC.GlideExecutionTracker.getLastRunning();
	},

	process:function (setId, type) {
		this._tracker.run();
		if (type == "preview") {
			this.generatePreviewRecords(setId);
		}
		else if(type == "hierarchypreview") {
			this.generateForHierarchy(setId);
		}
		else {
			this.generateCollisionRecords(setId);
		}
	},

	previewExists:function (remoteSet) {
		var rus = new GlideRecord('sys_update_preview_xml');
		rus.addQuery('remote_update.remote_update_set', remoteSet);
		rus.query();
		this._tracker.setMaxProgressValue(rus.getRowCount());
		if (rus.next()) {
			return true;
		}

		return false;
	},

	/* Deletes records from sys_update_preview and sys_update_preview_problem
	 for updates in the given remote update set.
	 Uses iterative delete, as opposed to multiple delete, because multiple delete
	 has an issue when used in conjunction with dot-walking.
	 */
	removePreviewRecords:function (remoteSet) {
		var pMgr = new SNC.PreviewerManager();
		pMgr.removePreviewRecords(remoteSet);
	},

	generateForHierarchy: function(baseUpdateSetId) {
		var hMgr = new SNC.HierarchyUpdateSetPreviewer();
		hMgr.startPreview(baseUpdateSetId);
	},

	generatePreviewRecords:function (remoteSet) {
		var pMgr = new SNC.PreviewerManager();
		pMgr.doPreview(remoteSet);
	},

	generatePreviewRecordsWithUpdate:function (remoteSet) {
		var pMgr = new SNC.PreviewerManager();
		pMgr.doPreviewWithUpdate(remoteSet);
	},

	generatePreviewRecordsAgain:function (remoteSet) {
		var pMgr = new SNC.PreviewerManager();
		pMgr.doPreviewAgain(remoteSet);
	},

	generateCollisionRecords:function (keyset) {
		var counter = 1;
		var hashKey = new Packages.java.lang.String(keyset).hashCode();

		// Get/Generate a report number
		var rpt = this._generateReportNumber(hashKey);

		// Remove an existing collision records with the matching report number
		this._removeCollisionRecords(rpt);

		// Create/Refresh Collision Records
		var updateSets = keyset.split(',');
		var dups = new GlideAggregate('sys_update_xml');
		dups.addQuery('update_set', updateSets);
		dups.addAggregate('count', 'name');
		dups.addHaving('count', '>', 1);
		dups.query();
		while (dups.next()) {
			this._setProgressMessage(counter, dups.getRowCount());
			this._createCollisionRecord(dups.name, updateSets, rpt, counter++);
		}

		this._tracker.updateMessage(gs.getMessage("Collision Report {0} created", this._getReportNumber(rpt)));
		return rpt;
	},

	_createCollisionRecord:function (name, updateSets, rpt, counter) {
		for (var s = 0; s < updateSets.length; s++) {
			var us = new GlideRecord('sys_update_xml');
			us.addQuery('name', name);
			us.addQuery('update_set', updateSets[s]);
			us.query();
			if (us.next()) {
				var usc = new GlideRecord('sys_update_collision_xml');
				usc.initialize();
				usc.collision_number = counter;
				usc.report_number = rpt;
				usc.sys_update = us.sys_id;
				usc.insert();
			}
		}
	},

	_removeCollisionRecords:function (rpt) {
		var verify = new GlideRecord('sys_update_collision_xml');
		verify.addQuery('report_number', rpt);
		verify.query();
		verify.deleteMultiple();
	},

	_generateReportNumber:function (hashKey) {
		var cm = new GlideRecord('sys_update_cm');
		cm.addQuery('key_hash', hashKey);
		cm.query();
		if (cm.next()) {
			return cm.sys_id;
		}

		cm.initialize();
		cm.key_hash = hashKey;
		cm.insert();
		return cm.sys_id;
	},

	_getReportNumber:function (rpt) {
		var cm = new GlideRecord('sys_update_cm');
		cm.addQuery('sys_id', rpt);
		cm.query();
		if (cm.next()) {
			return cm.report_number;
		}

		return "";
	},

	_setProgressMessage:function (updateCount, totalCount) {
		if (totalCount < 2) {
			this._tracker.updateMessage(gs.getMessage("Comparing update {0} of {1} update",
				[updateCount.toString(), totalCount.toString()]));
		} else {
			this._tracker.updateMessage(gs.getMessage("Comparing update {0} of {1} updates",
				[updateCount.toString(), totalCount.toString()]));
		}
	}
};