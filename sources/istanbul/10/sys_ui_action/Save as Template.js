function launchSaveAsTemplateDialog() {
	var tableName = g_form.getTableName();
	var dialog = new GlideDialogWindow("checklist_save_as_template");
	dialog.setTitle("Save Checklist as Template");
	dialog.setPreference("record", g_form.getUniqueValue());
	dialog.setSize(400, 200);
	// force the related list to refresh when successful
	dialog.on('save_template_success', function(){
		reloadWindow(window);
	});
	dialog.render();
}