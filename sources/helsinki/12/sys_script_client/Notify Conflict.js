function onLoad() {
	if (g_form.getValue('conflict_status') == 'Conflict')
		g_form.showErrorBox('conflict_status', getMessage("Conflicts detected, see the Conflicts section below"));
}