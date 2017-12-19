var FileTypeRestOperationHandler = function(appId) {

	function filesForKey() {
		var gr = new GlideRecord('sys_ws_operation');
		if(appId) {
			gr.addQuery('sys_scope', appId);
			gr.orderBy('web_service_definition.display_name');
			gr.orderBy('display_name');
			gr.query();
		}
		
		var files = [];
		while (gr.next()) {
			files.push(fileForRecord(gr));
		}
		
		return _(files).chain()
			.sortBy('name')
			.sortBy(function(file) {
				return file.extra.version;
			})
			.value();
	}
			
	function fileForRecord(record) {
		var sysId = record.getUniqueValue();
		
		var apiName = record.web_service_definition.display_name;
		if (gs.nil(apiName))
			apiName = record.web_service_definition.name;
		
		var apiVersion = record.web_service_version.version_id;
		
		if (apiName.length > 10)
			apiName = apiName.substring(0,7) + '...';
		
		var opName = record.getValue('display_name');
		if (gs.nil(opName))
			opName = record.getValue('name');
		
		var method = record.getValue('http_method');
		
		var name = apiName + "/" + opName + " [" + method + "]";
		
		var recordType = record.getValue('sys_class_name');
		
		return FileTypeFileBuilder.newFile()
			.withId(recordType + '.' + sysId)
			.withName(name)
			.withSysId(sysId)
			.addCustom('version', apiVersion)
			.build();
	}
		
	return {
		filesForKey : filesForKey
	}
};