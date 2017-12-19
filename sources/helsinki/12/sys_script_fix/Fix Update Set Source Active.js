/**
 *  Set the active flag (to true) on existing records in the sys_update_set_source table
 *  if it is set to NULL.
 */
fixUpdateSetSourceActive();

function fixUpdateSetSourceActive() {
	var src = new GlideRecord('sys_update_set_source');
	if(src.isValid()) {
		src.addNullQuery('active');
		src.query();
		while (src.next()) {
			src.active = true;
			if (src.update()) {
				gs.log('Updated sys_update_set_source, name: '+src.name+', url: '+src.url+'active: '+src.active);
			}
		}
	}
}
