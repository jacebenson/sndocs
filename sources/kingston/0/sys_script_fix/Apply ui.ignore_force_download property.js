(function(){
	var IGNORE_FORCE_DOWNLOAD_PROPERTY = 'glide.ui.attachment.tables_ignore_force_download';
	var propValue = gs.getProperty(IGNORE_FORCE_DOWNLOAD_PROPERTY);

	// Base tables to add to ignore force download property
	var baseTables = ['sn_hr_core_case', 'sn_hr_le_case', 'sn_hr_core_document_template', 'sn_hr_core_task', 'pdf_draft', 'dms_document_revision'];
	var tables = [];
	if (propValue) 
		tables = propValue.split(',');

	for (var i = 0; i < baseTables.length; i++) 
		addTables(baseTables[i]);

	// Create property or add hrTables to existing values
	gs.setProperty(IGNORE_FORCE_DOWNLOAD_PROPERTY, tables.join(','));

	function addTables(baseTableName) {
		var tableList = GlideDBObjectManager.get().getAllExtensions(baseTableName);

		for (var j = 0; j < tableList.size(); j++) {
			var e = tableList.get(j).toString();
			if (tables.indexOf(e) == -1) 
				tables.push(e);
		}
	}
})();