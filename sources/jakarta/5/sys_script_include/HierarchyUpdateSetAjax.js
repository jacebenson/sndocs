var HierarchyUpdateSetAjax = Class.create();
HierarchyUpdateSetAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function () {
		if (this.getType() == "commitHierarchy") {
			return this.commitHierarchy();
		}
		else {
			gs.warn("Unknown HierarchyUpdateSetAjax request");
		}
	},
	
	commitHierarchy: function() {
		var retrievedBaseUpdateSetSysId = this.getParameter('sys_id');
		var worker = new SNC.HierarchyUpdateSetScriptable();
		var progress_id = worker.commitHierarchy(retrievedBaseUpdateSetSysId);
		return progress_id;
	},

    type: 'HierarchyUpdateSetAjax'
});