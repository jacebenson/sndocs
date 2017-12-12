var FileTypeExternalFieldHandler = (function(appId) { 
	
	function loadFields() {
		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('sys_scope', appId);
		gr.addQuery('internal_type','!=','collection');
		gr.addQuery('sys_class_name', 'NOT IN', getExcludedTables());
		gr.addQuery('name','NOT IN', getScopedTables(appId));
		gr.orderBy('sys_name');
		gr.query();
		var tableLabelMap = buildTableLabelMap(gr);
		gr.query(); // Reissue the query (we don't yet have scoped access to reset the cursor)
		return _gr(gr).map(function(row) {
			return fileForRecord(row, tableLabelMap);
		});
	}
	
	function buildTableLabelMap(gr) {
		var tableNames = _gr(gr).map(function(row) { return row.getValue('name')});
		return TableLabelMap.labelsForTables(tableNames);
	}
	
	function fileForRecord(record, tableLabelMap) {
		var sysId = record.getUniqueValue();
		var tableName = tableLabelMap[record.name] || record.name;
		var name = ((record.sys_name + '').trim() || sysId) + " [" + tableName + "]";
		return FileTypeFileBuilder.newFile()
			.withId(sysId)
			.withName(name)
			.withSysId(sysId)
			.withAlternateName(record.getValue('name') + '.' + record.getValue('column_label'))
			.build();
	}

	function getExcludedTables() {
		return [
				'sys_hub_action_input',
				'sys_hub_action_output',
				'sys_hub_step_ext_input',
				'sys_hub_step_ext_output'
		];
	}

	function getScopedTables(appId) {
		var tables = [];
		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('sys_scope', appId);
		gr.addQuery('internal_type','collection');
		gr.query();
		
		while(gr.next()) {
			tables.push(gr.getValue('sys_name'));
		}
		
		return tables.join(',');
	}
	
	return {
		filesForKey : loadFields
	}
	
});