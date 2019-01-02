var FixScriptUtils = Class.create();
FixScriptUtils.prototype = {
    initialize: function() {
    },

    type: 'FixScriptUtils',
	
	updateSysDocumentation: function(tableName, columnName, lang, key, newValue, glideRecord) {
		// The glideRecord object can be reused for multiple invocations. If it is not present, initialize it
		if (!glideRecord)
			glideRecord = new GlideRecord("sys_documentation");
		
		// Fail silently if the update request is insufficiently specified
		if (gs.nil(tableName) || gs.nil(lang) || gs.nil(key) )
			return glideRecord;
		glideRecord.initialize();
		glideRecord.addQuery("name", tableName);
		glideRecord.addQuery("element", columnName);
		glideRecord.addQuery("language", lang);
		glideRecord.query();
		if (glideRecord.next()) {
			glideRecord.setValue(key, newValue);
			// Update the record if setting the key/value pair above made the record dirty
			if (glideRecord.changes() && glideRecord.update() != null) {
				gs.log("Updated sys_dictionary attribute " + key + " for record " + 
					   this.generateRecordReference(tableName, columnName));
			}
			else {
				gs.log("sys_documentation attribute " + key + " for record " + 
					   this.generateRecordReference(tableName, columnName) + " was up to date");
			}
		} else {
			gs.log("sys_documentation attribute " + key + " for record " + 
				   this.generateRecordReference(tableName, columnName) + " was not found");
		}
		return glideRecord;
	},
	
	generateRecordReference: function (tableName, columnName) {
		if (gs.nil(tableName))
			return "";
		if (gs.nil(columnName))
			return tableName;
		return tableName + "." + columnName;
	}
};