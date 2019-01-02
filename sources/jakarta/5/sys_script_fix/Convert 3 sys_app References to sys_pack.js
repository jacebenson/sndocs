fix3ReferencesFromSysAppToSysPackage();

function fix3ReferencesFromSysAppToSysPackage() {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'IN', 'sys_sync_preview_remote,sys_update_xml,sys_update_version');
	gr.addQuery('element', 'application');
	gr.addQuery('reference', 'IN', 'sys_app,sys_package'); // prev version of this script changed to sys_package
	gr.query();
	while (gr.next()) {
		gr.setValue('reference', 'sys_scope');
		gr.update();
	}
}