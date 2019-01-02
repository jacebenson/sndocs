var FileTypeInfo = (function() {	
	return {
		get: function(fileTypes, appId) {
			return _.mapObject(getDocumentation(fileTypes, appId), function(fileType) {
				return FileTypeNameOverrides.apply(fileType);
			});
		}
	};

	function getDocumentation(fileTypes, appId) {
		var fileTypeInfo = {},
			language = gs.getSession().getLanguage() || 'en',
			docRecord = new GlideRecord('sys_documentation');
			
		docRecord.addQuery('name', 'IN', fileTypes);
		docRecord.addNullQuery('element');
		docRecord.addQuery('language', 'IN', [language, 'en']);
		docRecord.query();
		
		while (docRecord.next()) {
			var tableName = docRecord.getValue('name');
			
			if (fileTypeInfo[tableName] && docRecord.getValue('language') === 'en')
				continue; // We skip English overrides
			
			var gr = new GlideRecord(tableName);
		
			if (!gr.isValid()) {
				gs.debug('Type ' + tableName + ' is not valid in this instance');
				continue;
			}	

			if (appId)
				gr.sys_scope = appId;			

			fileTypeInfo[tableName] = 
				newFileType(tableName,
							tableName, 
							docRecord.getValue('label'), 
							docRecord.getValue('plural'),
							docRecord.getValue('help'),
							false,
						    gr.canCreate(),
						    gr.canRead());
		}

		return fileTypeInfo;
	}

	function newFileType(navigationKey, recordType, label, pluralName, helpText, requiresTableName, canCreate, canRead) {
		return {
			id : navigationKey,
			recordType : recordType,
			navigationKey : navigationKey,
			name : label || recordType,
			pluralName : pluralName || recordType,
			helpText : helpText || '',
			requiresTableName : requiresTableName,
			canCreate : canCreate,
			canRead : canRead
		};
	}	
})();