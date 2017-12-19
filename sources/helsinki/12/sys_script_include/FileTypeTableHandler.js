var FileTypeTableHandler = (function(appId) { 
	
	function loadTables() {
		var gr = new GlideRecord('sys_db_object');
		gr.addQuery('sys_scope', appId);
		gr.orderBy('sys_name');
		gr.query();
		return _gr(gr).map(function(row) {
			return fileForRecord(row);
		});
	}
	
	function fileForRecord(record) {
		var sysId = record.getUniqueValue();
		var name = getDisplayValue(record);
		return FileTypeFileBuilder.newFile()
			.withId(sysId)
			.withName(name)
			.withSysId(sysId)
			.withAlternateName(record.getValue('name'))
			.build();
	}
	
	function getDisplayValue(record) {
		return ((record.sys_name + '').trim() 
			|| record.getValue('name').trim() 
			|| record.getUniqueValue());
	}
	
	return {
		filesForKey : loadTables
	}
	
});