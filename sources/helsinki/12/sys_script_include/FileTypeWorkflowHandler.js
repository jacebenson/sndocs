var FileTypeWorkflowHandler = function(appId) {
	var workflowType = 'wf_workflow';
	var filesByNavKey = loadFiles();
	
	function loadFiles() {
		var gr = new GlideRecord(workflowType);
		if(appId) {
			gr.addQuery('sys_scope', appId);
			gr.query();
		}
		
		var filesByNavKey = {};
		while (gr.next()) {
			var file = versionFileForRecord(gr);
			
			if (!filesByNavKey[file.navigationKey])
				filesByNavKey[file.navigationKey] = [];
			filesByNavKey[file.navigationKey].push(file);
		}
		return filesByNavKey;
	}
	
	/*
 	* If a workflow version is checked out by the current user,
 	* return it. Otherwise return the published version of the workflow.
 	*/
	function versionFileForRecord(record) {
		var sysId = record.getUniqueValue();
		
		var gr = new GlideRecord('wf_workflow_version');
		gr.addQuery('workflow', sysId);
		gr.addQuery('checked_out_by', gs.getUserID())
		.addOrCondition('published', 'true');
		gr.orderByDesc('checked_out_by');
		gr.orderByDesc('updated_at');
		gr.query();
		
		while (gr.next()) {
			if (gr.checked_out_by &&
				gr.checked_out_by != gs.getUserID())
			continue;
			
			return fileForRecord(gr);
		}
		
		return '';
	}
	
	function fileForRecord(gr) {
		var sysId = gr.getUniqueValue();
		var name = (gr.name + '').trim() || sysId;
		
		return {
			id : sysId,
			sysId : sysId,
			name : name,
			recordType : workflowType,
			navigationKey : workflowType
		}
	}
	
	function filesForKey(navigationKey) {
		return filesByNavKey[navigationKey];
	}
	
	return {
		filesForKey : filesForKey
	};
}
