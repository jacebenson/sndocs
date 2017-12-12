var FileTypeACLHandler = (function(appId) { 
	
	function loadACLs() {
		var gr = new GlideRecord('sys_security_acl');
		gr.addQuery('sys_scope', appId);
		gr.orderBy('sys_name');
		gr.query();
		return _gr(gr).map(function(row) {
			return fileForRecord(row);
		});
	}
	
	function fileForRecord(record) {
		var sysId = record.getUniqueValue();
		var name = (record.sys_name + ' (' + record.operation.getDisplayValue() + ')') || sysId;
		return FileTypeFileBuilder.newFile()
			.withId(sysId)
			.withName(name)
			.withSysId(sysId)
			.withAlternateName(record.getValue('name'))
			.build();
	}
	
	return {
		filesForKey : loadACLs
	}
	
});