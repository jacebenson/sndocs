/* global GlideRecord, WorkflowElementVersionUtils */
var UninstallWorkflow = (function() {

	function uninstall(sysID, appID, tableName) {
		if ("wf_workflow" == tableName)
			uninstallWf(sysID, appID);
		else if ("wf_element_activity" == tableName)
			uninstallWfElementActivity(sysID, appID);
	}

	function uninstallWf(sysID, appID) {
		var gr = new GlideRecord("wf_workflow_version");
		gr.addQuery("workflow", sysID);
		gr.addQuery("sys_scope", appID);
		gr.deleteMultiple();
	}

	function uninstallWfElementActivity(sysID, appID) {
		var gr = new GlideRecord("wf_element_activity");
		if (gr.get(sysID))
			if (gr.sys_scope.toString() == appID)
				new WorkflowElementVersionUtils().deleteIt(gr);
	}

	return {uninstall: uninstall};
})();