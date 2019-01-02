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
		return safeTrim(record.getValue('label')
			|| safeTrim(record.sys_name)) 
			|| safeTrim(record.getValue('name'))
			|| record.getUniqueValue();
	}
	
	function safeTrim(val) {
		return val ? (val + '').trim() : '';
	}
	
	return {
		filesForKey : loadTables
	};
	
});