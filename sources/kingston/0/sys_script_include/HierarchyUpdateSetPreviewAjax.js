/**
 * This script include will include functionality related to Hierarchy Update Set previews.
 **/
var HierarchyUpdateSetPreviewAjax = Class.create();

HierarchyUpdateSetPreviewAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
		var sysId = this.getParameter("sysparm_ajax_processor_sys_id");
		var func = this.getParameter("sysparm_ajax_processor_function");
			
		var gr = new GlideRecord('sys_remote_update_set');
		if (!gr.get(sysId) || !gr.canWrite()) {
			gs.log("An attempt to preview remote update set with insufficient rights was blocked");
			return;
		}
		
		if (func == "preview")
			return this.previewRemoteHierarchyUpdateSet(gr);
		
		if (func == "previewAgain")
			return this.previewRemoteHierarchyUpdateSetAgain(gr);
	},
	
	previewRemoteHierarchyUpdateSet: function(gr) {
		gr.state = "previewing";
		gr.update();
		
		var worker = new GlideScriptedHierarchicalWorker();
		worker.setProgressName("Generating Batch Update Set Preview for: " + gr.name);
		worker.setScriptIncludeName("UpdateSetPreviewer");
		worker.setScriptIncludeMethod("generateForHierarchy");
		worker.putMethodArg("sys_id", gr.sys_id);
		worker.setSource(gr.sys_id);
		worker.setSourceTable("sys_remote_update_set");
		worker.setBackground(true);
		worker.start();
		return worker.getProgressID();
	},
	
	previewRemoteHierarchyUpdateSetAgain: function(gr) {
		// Remove remote update set preview entries
		var updateSet = new GlideRecord('sys_remote_update_set');
		updateSet.addQuery("remote_base_update_set", gr.sys_id);
		updateSet.query();
		while(updateSet.next()) {
			new UpdateSetPreviewer().removePreviewRecords(updateSet.sys_id);
		}
		
		// Run the preview again
		return this.previewRemoteHierarchyUpdateSet(gr);
	},
	
	type: "HierarchyUpdateSetPreviewAjax"
	
});