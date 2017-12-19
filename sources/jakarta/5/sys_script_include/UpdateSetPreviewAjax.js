/**
 * This script include will include functionality related to updateset commits. Originally,
 * some of this functionality was in UI actions.  To better inform the user about issues with
 * the an updateset they are committing, moved this functionality to a script include.
 **/
var UpdateSetPreviewAjax = Class.create();

UpdateSetPreviewAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
		var sysId = this.getParameter("sysparm_ajax_processor_sys_id");
		var func = this.getParameter("sysparm_ajax_processor_function");
		var trackerId = this.getParameter("sysparm_ajax_processor_tracker_id");

		if (func == "cancelPreview")
			return this.sendCancelSignal(trackerId);

		var gr = new GlideRecord('sys_remote_update_set');
		if (!gr.get(sysId) || !gr.canWrite()) {
			gs.print("An attempt to preview remote update sets with insufficient rights was blocked");
			return;
		}

		if (func == "preview")
			return this.previewRemoteUpdateSet(gr);

		if (func == "previewAgain")
			return this.previewRemoteUpdateSetAgain(gr);
	},

	previewRemoteUpdateSet: function(gr) {
		gr.state = "previewing";
		gr.update();
		// Add the retrieved updates to the Preview list
		// Setup and start the progress worker
		var worker = new GlideScriptedHierarchicalWorker();
		worker.setProgressName("Generating Update Set Preview for: " + gr.name);
		worker.setScriptIncludeName("UpdateSetPreviewer");
		worker.setScriptIncludeMethod("generatePreviewRecordsWithUpdate");
		worker.putMethodArg("sys_id", gr.sys_id);
		worker.setSource(gr.sys_id);
		worker.setSourceTable("sys_remote_update_set");
		worker.setBackground(true);
		worker.setCannotCancel(true);
		worker.start();

		return worker.getProgressID();
	},

	previewRemoteUpdateSetAgain: function(gr) {
		gr.state = "previewing";
		gr.update();
		
		// Add the retrieved updates to the Preview list
		// Setup and start the progress worker
		var worker = new GlideScriptedHierarchicalWorker();
		worker.setProgressName("Refreshing Update Set Preview: " + gr.name);
		worker.setScriptIncludeName('UpdateSetPreviewer');
		worker.setScriptIncludeMethod("generatePreviewRecordsAgain");
		worker.putMethodArg("sys_id", gr.sys_id);
		worker.setSource(gr.sys_id);
		worker.setSourceTable("sys_remote_update_set");
		worker.setBackground(true);
		worker.setCannotCancel(true);
		worker.start();

		return worker.getProgressID();
	},

	// send the cancel by adding the cancel signal into the update set's tracker
	// result, so that the update set progress worker will catch it
	sendCancelSignal: function(trackerId) {
		var tracker = SNC.GlideExecutionTracker.getBySysID(trackerId);
		tracker.updateMessage("Canceling update set preview...");
		result = {'preview_cancel_requested': 'true'};
		tracker.updateResult(result);
		return;
	},
	
	type: "UpdateSetPreviewAjax"
	
});