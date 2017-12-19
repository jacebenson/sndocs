var UninstallScheduledJob = Class.create();
UninstallScheduledJob.prototype = {
    uninstall: function(sysID, appID, tableName) {
		// temporarily turn on the workflow as we need the "automation synchronizer" business rule
		// (sys_id:5f0749c70a0a0a6501c216a1dd3c10f7) to clean up the related sys_trigger records
		var originalWorkflow = GlideSession.get().getWorkflow();
		GlideSession.get().setWorkflow(true);
		var gr = new GlideRecord(tableName);
		if (gr.get(sysID) && gr.getValue('sys_scope') == appID)			
			gr.deleteRecord();
		
		GlideSession.get().setWorkflow(originalWorkflow);
    },

    type: 'UninstallScheduledJob'
};