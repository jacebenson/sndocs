/**
 * This script include will include functionality related to updateset commits. Originally,
 * some of this functionality was in UI actions.  To better inform the user about issues with
 * the an updateset they are committing, moved this functionality to a script include.
 **/

var UpdateSetCommitAjax = Class.create();

UpdateSetCommitAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
		if (this.getType() == "commitRemoteUpdateSet")
			return this.commitRemoteUpdateSet();
		
		if (this.getType() == "cancelRemoteUpdateSet")
			return this.cancelRemoteUpdateSet();
		
		if (this.getType() == "areAllPreviewProblemsIgnored")
			return this.areAllPreviewProblemsIgnored();
		
	},
	
	commitRemoteUpdateSet: function() {
		var remote_updateset_id = this.getParameter("sysparm_remote_updateset_sys_id");
		//Load the remote update set and create a local updateset from it.
		var remote_updateset = new GlideRecord('sys_remote_update_set');
		remote_updateset.addQuery('sys_id', remote_updateset_id);
		remote_updateset.query();
		if ( remote_updateset.next() ) {
			var worker = this._getGlideUpdateSetWorker();
			// inserts the new local update set and updates the remote update set accordingly
			var lus = new GlideRecord('sys_update_set');
			if (!lus.canWrite() )
				return 0;
			
			var lus_sysid = worker.remoteUpdateSetCommit(lus, remote_updateset, remote_updateset.update_source.url);
			this._copyUpdateXML(lus_sysid, remote_updateset.sys_id);
			remote_updateset.update();
			
			worker.setUpdateSetSysId(lus_sysid);
			worker.setProgressName(gs.getMessage("Committing update set: {0}", remote_updateset.name));
			worker.setBackground(true)
			worker.start();
			//return both ID for redirect
			return worker.getProgressID() + "," + lus_sysid + "," + this._shouldRefreshNav(remote_updateset_id) + "," + this._shouldRefreshAppsList(remote_updateset_id);
		}
	},

	cancelRemoteUpdateSet: function () {
		var workerId = this.getParameter("sysparm_worker_id");
		
		//Load the remote update set and create a local updateset from it.
		var tracker = SNC.GlideExecutionTracker.getBySysID(workerId);		
		tracker.cancel(gs.getMessage("Cancelled update set"));
		var updateSetId = tracker.getSource();
		var gr = GlideRecord("sys_update_set");
		
		if (!gr.get(updateSetId))
			return;
		
		var remoteUpdateSet = new GlideRecord('sys_remote_update_set');
		if (!remoteUpdateSet.get(gr.remote_sys_id))
			return;
		
		remoteUpdateSet.state = "partial"; // Partial Commit state
		remoteUpdateSet.update();
	},
	
	_getGlideUpdateSetWorker: function() {
		return new GlideUpdateSetWorker();
	},
	
	areAllPreviewProblemsIgnored: function() {
		var remote_updateset_id = this.getParameter("sysparm_remote_updateset_sys_id");
		var worker = new GlideUpdateSetWorker();
		return worker.areAllPreviewProblemsIgnored(remote_updateset_id);
	},
	
	/*Returns true if update set has any modules */
	_shouldRefreshNav: function(rsysid) {
		var xgr = new GlideRecord("sys_update_xml");
		xgr.addQuery("remote_update_set", rsysid);
		xgr.addQuery("type", ["Module", "Application Menu"]);
		xgr.query();
		return xgr.next();
	},
	/*Returns true if update set has any applications */
	_shouldRefreshAppsList: function(rsysid) {
		var xgr = new GlideRecord("sys_update_xml");
		xgr.addQuery("remote_update_set", rsysid);
		xgr.addQuery("type", "Application");
		xgr.query();
		return xgr.next();
	},
	
	_copyUpdateXML: function(lsysid, rsysid) {
		var xgr = new GlideRecord("sys_update_xml");
		xgr.addQuery("remote_update_set", rsysid);
		if (updateSetPreviewInstalled()) {
			var pgr = new GlideRecord("sys_update_preview_xml");
			pgr.addQuery("remote_update.remote_update_set",rsysid);
			pgr.query();
			while (pgr.next()) {
				if (pgr.proposed_action != "skip")
					continue;
				var temp = new GlideRecord("sys_update_xml");
				temp.query("sys_id", pgr.remote_update);
				if (temp.next())
					xgr.addQuery("name","!=", temp.name +"");
			}
		}
		xgr.query();
		while(xgr.next()) {
			var lxgr = new GlideRecord("sys_update_xml");
			lxgr.initialize();
			lxgr.name = xgr.name;
			lxgr.payload = xgr.payload;
			lxgr.action = xgr.action;
			lxgr.type = xgr.type;
			lxgr.target_name = xgr.target_name;
			lxgr.view = xgr.view;
			lxgr.update_domain = xgr.update_domain;
			lxgr.table = xgr.table;
			lxgr.category = xgr.category;
	    	lxgr.application = xgr.application;
			lxgr.update_set = lsysid;
			if (lxgr.isValidField('replace_on_upgrade'))
				lxgr.replace_on_upgrade = xgr.replace_on_upgrade;
			if (lxgr.isValidField('sys_recorded_at'))
				lxgr.sys_recorded_at = xgr.sys_recorded_at;
			if (lxgr.isValidField('payload_hash'))
				lxgr.payload_hash = xgr.payload_hash;
			if (lxgr.isValidField('update_guid'))
				lxgr.update_guid = xgr.update_guid;
			if (lxgr.isValidField('update_guid_history')) {
				lxgr.update_guid_history = xgr.update_guid_history;

				//Join the update_guid_history for the 'current' version and
				//the sys_update_xml that we are committing
				var version = new GlideRecord("sys_update_version");
				version.addQuery("name", xgr.name);
				version.addQuery("state", "current");
				version.query();
				if(version.next()) {
					var history = xgr.update_guid_history;
					history = SNC.UpdateGuidUtil.joinHistory(history, version.update_guid_history);
					lxgr.update_guid_history = history;
				}
			}

			lxgr.insert();
		}
	},
	
	type: "UpdateSetCommitAjax"
	
});