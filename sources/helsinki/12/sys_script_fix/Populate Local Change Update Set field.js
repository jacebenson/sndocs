var count = 0;
var change = new GlideRecord("sys_sync_change");
change.addNullQuery("update_set");
change.query();
while(change.next()) {
	var version = change.version;
	if (version == null) {
		// Should never happen.  Clean up this corrupt change since we found it.
		change.deleteRecord();
		continue; 
	}
	if (version.source_table == 'sys_update_set') {
		change.update_set = version.source;
		change.setWorkflow(false);
		change.setSystem(true);
		if (change.update())
			count++;
	}
}
gs.print('Finished populating new sys_sync_change.update_set field.  ' + count + ' changes made.');