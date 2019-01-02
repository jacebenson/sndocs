function displayForceKillWarningDialog() {
	var dialog = GlideModal ? GlideModal : GlideDialogWindow;
	var g_dialog = new dialog('dialog_force_kill_cluster');
	g_dialog.setTitle('Confirm Force Kill');
	g_dialog.setPreference('sysparm_session_id', g_form.getValue('session_id'));
	g_dialog.setPreference('sysparm_node_id', g_form.getValue('node_id'));
	g_dialog.render();
	return false;
}