var FileTypeListControlHandler = function(appId, appExplorerStructure) {
	var filesByNavKey = loadFiles();
	
	function loadFiles() {
		var gr = new GlideRecord('sys_ui_list_control');
		if(appId) {
			gr.addQuery('sys_scope', appId);
			gr.orderBy('sys_name');
			gr.query();
		}
		
		var filesByNavKey = {};
		while (gr.next()) {
			var file = fileForRecord(gr);
			
			var navigationKey = gr.getValue('sys_class_name');
			if (!filesByNavKey[navigationKey])
				filesByNavKey[navigationKey] = [];
			filesByNavKey[navigationKey].push(file);
		}
		return filesByNavKey;
	}
	
	function fileForRecord(record) {
		var sysId = record.getUniqueValue();
		var name = record.getValue('sys_name');
		
		if (!name || name.trim() === '')
			name = sysId;
		
		var recordType = record.getValue('sys_class_name');
		var label = record.getValue('label');
		
		if (!label || label.trim() === '')
			label = name;
		
		return FileTypeFileBuilder.newFile()
			.withId(recordType + '.' + sysId)
			.withName(label)
			.withSysId(sysId)
			.addCustom('tableName', record.getValue('name'))
			.build();
	}
	
	function filesForKey(navigationKey) {
		return filesByNavKey[navigationKey];
	}
	
	return {
		filesForKey : filesForKey
	};
}
