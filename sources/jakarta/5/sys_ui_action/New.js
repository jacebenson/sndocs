function showUpgradeDialog() {
	var gDialog = new GlideModal('pa_upgrade_dialog');
	gDialog.setTitle(g_i18n.getMessage('pa_upgrade_dialog_title'));
	gDialog.setWidth(500);
	gDialog.render();
}
