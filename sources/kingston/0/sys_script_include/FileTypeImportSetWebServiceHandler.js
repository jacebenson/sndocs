var FileTypeImportSetWebServiceHandler = (function(appId) { 
	
	function loadISWebServices() {
		//get the sys_id of the record for the Import Set Row table
		var isrSysId, gr = new GlideRecord('sys_db_object');
		gr.addQuery('name', 'sys_import_set_row');
		gr.query();
		if (!gr.next())
			return _gr(gr).map(function(row) {
			return fileForRecord(row);
		});
		isrSysId = gr.getUniqueValue();
		
		//re-use our GR collection and find the tables that extend the ISR table
		gr.initialize();
		gr.addQuery('super_class', isrSysId);
		gr.addQuery('sys_scope', appId);
		gr.orderBy('name');
		gr.query();
		
		//we will be linking these to the v_ws_editor and passing the name
		return _gr(gr).map(function(row) {
			return fileForRecord(row);
		});
	}
	
	function fileForRecord(record) {
		var sysId = record.getUniqueValue();
		var name = record.getValue('label') || sysId;
		return FileTypeFileBuilder.newFile()
			.withId(sysId)
			.withName(name)
			.withSysId(sysId)
			.withAlternateName(record.getValue('name'))
			.build();
	}
	
	return {
		filesForKey: loadISWebServices
	};
	
});