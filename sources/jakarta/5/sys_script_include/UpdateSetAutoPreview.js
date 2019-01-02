var UpdateSetAutoPreview = Class.create();
UpdateSetAutoPreview.prototype = {
	initalize: function() {
	},
	
	preview: function(gr) {
		gs.log("Attempting to auto preview update set: " + gr.name, "auto_preview");
		//If it is an update set by itself, kick off the update set previewer
		if (gr.remote_base_update_set.nil()) {
			gs.addInfoMessage("Starting update set preview for: " + gr.name);
			gs.log("Starting update set preview for: " + gr.name, "auto_preview");
			var usPreview = new UpdateSetPreviewAjax();
			usPreview.previewRemoteUpdateSetAgain(gr);
			return gr.sys_id;
		}
		else {
			//This is part of a batch, and it should run the batch previewer
			var updateSet = new GlideRecord("sys_remote_update_set");
			updateSet.get(gr.remote_base_update_set);
			if (!updateSet.isValidRecord())
				return "";

			//Cancel any running trackers on the batch
			this._cancelTrackers(updateSet.sys_id);
			gs.addInfoMessage("Starting update set batch preview for: " + updateSet.name);
			gs.log("Starting update set batch preview for: " + updateSet.name, "auto_preview");

			var hupsPreview = new HierarchyUpdateSetPreviewAjax();
			hupsPreview.previewRemoteHierarchyUpdateSetAgain(updateSet);
			return gr.remote_base_update_set;
		}
	},

	_cancelTrackers: function(id) {
		gs.log("Looking for active trackers for: " + id, "auto_preview");
		var tracker = new GlideRecord('sys_execution_tracker');
		tracker.addQuery("source", id);
		tracker.addQuery("source_table", "sys_remote_update_set");
		tracker.addQuery("state", "IN", "pending,running");
		tracker.orderByDesc("sys_created_on");
		tracker.query();
		while(tracker.next()) {
			gs.log("Tracker found and cancelling: " + id, "auto_preview");
			var previewer = new UpdateSetPreviewAjax();
			previewer.sendCancelSignal(tracker.sys_id);
		}
	},
		
    type: 'UpdateSetAutoPreview'
};
