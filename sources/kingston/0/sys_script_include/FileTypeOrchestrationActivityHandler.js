var FileTypeOrchestrationActivityHandler = (function(appId) { 

	function getActivityFiles() {
		var gr = new GlideRecord('wf_element_activity');
		gr.addQuery('sys_id','IN', getRelevantIds());
		gr.addQuery('sys_scope', appId)
		gr.query();
		
		return _gr(gr).map(function(row) {
			return fileForRecord(row);
		});
	}

	function getRelevantIds() {
		//get the sys_id of the record for the Import Set Row table
		var ids = [];
		var gr = new GlideRecord('wf_versionable');
		gr.addQuery('wf_element_definition.sys_scope', appId);
		gr.addQuery('checked_out_by', gs.getUserID())
		  .addOrCondition('published',true);
		gr.query();
		
		while (gr.next())
			ids.push(gr.getValue('wf_element_definition'));
		
		return ids;
	}	
	function fileForRecord(record) {
		var sysId = record.getUniqueValue();
		var name = record.getValue('name') || sysId;
		return FileTypeFileBuilder.newFile()
			.withId(sysId)
			.withName(name)
			.withSysId(sysId)
			.build();
	}
	
	return {
		filesForKey: getActivityFiles
	};
	
});