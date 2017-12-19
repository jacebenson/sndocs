var FileTypeListLayoutHandler = (function(appId) { 
	
	function loadTables() {
		var gr = new GlideRecord('sys_ui_list');
		gr.addQuery('sys_scope', appId);
		gr.addNullQuery('sys_user');
		gr.orderBy('sys_name'); // Table name
		gr.query();
		var tableNames = _gr(gr).map(function(row) { return row.getValue('sys_name')});
		var tableLabelMap = TableLabelMap.labelsForTables(tableNames);
		gr.query();
		return _gr(gr).map(function(row) {
			return fileForRecord(row, tableLabelMap);
		});
	}
	
	
	function fileForRecord(record, tableLabelMap) {
		var sysId = record.getUniqueValue();
		var viewName = record.view.sys_name + '';
		var name = record.getValue('sys_name');
		if (tableLabelMap[name])
			name = tableLabelMap[name];
		var tableName = record.getValue('name');
		if (viewName)
			name += ' [' + viewName + ']';
		return FileTypeFileBuilder.newFile()
			.withId(sysId)
			.withName(name)
			.withSysId(sysId)
			.addCustom('view', viewName)
			.addCustom('tableName', tableName)
			.build();
	}
	
	return {
		filesForKey : loadTables
	}
	
});