
	var script = "deleteUpdateSetField();\
	function deleteUpdateSetField() {\
		var logTable = 'sys_update_log';\
		var logSource = 'Delete UpdateSet FixScript';\
		if (!GlideTableDescriptor.fieldExists(logTable, 'sys_update_set'))\
			return;\
		if (!(GlideTableDescriptor.fieldExists(logTable, 'set_table') && GlideTableDescriptor.fieldExists(logTable, 'set_id'))) {\
			gs.log('sys_update_log table does not have required fileds (set_table and set_id) to perform this fix script', 'Delete UpdateSet FixScript');\
			return;\
		}\
		gs.log('Updating sys_update_log with document_id', logSource);\
		var updateLog = new GlideRecord(logTable);\
		updateLog.addNotNullQuery('sys_update_set');\
		updateLog.query();\
		gs.log('Found ' + updateLog.getRowCount() + ' rows to update', logSource);\
		var count = 0;\
		while (updateLog.next()) {\
			updateLog.setValue('set_table', 'sys_update_set');\
			updateLog.setValue('set_id', updateLog.getValue('sys_update_set'));\
			updateLog.update();\
			count++;\
			if (count % 1000 == 0) {\
			  gs.log('Completed ' + count + ' rows, yielding for 100ms', logSource);\
			  gs.sleep(100);\
			}\
		}\
		//now drop the column\
		GlideSystemUtilDB.dropColumn(logTable, 'sys_update_set');\
		//drop any remaining indexes\
		var dbi = GlideDBConfiguration.getDBI(logTable);\
		new GlideIndexUtils().dropIndexes(dbi, logTable);\
		//create index for new columns\
		gs.log('Adding a new index for new columns', logSource);\
		var indexfields = ['set_table', 'set_id', 'sequence'];\
		var indexName = 'index0';\
		GlideSystemUtilDB.ensureCompositeIndex(logTable, indexfields, indexName);\
		gs.log('Done adding indexes', logSource);\
	}";
	
	//Make sure the trigger does not already exist.  Only should be running once.
	var triggerGR = new GlideRecord('sys_trigger');
	triggerGR.addQuery('script', 'CONTAINS', script);
	triggerGR.query();
	if(!triggerGR.next())
		GlideRunScriptJob.scheduleScript(script);
	
