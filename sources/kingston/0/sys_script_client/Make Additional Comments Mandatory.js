function onChange(control, oldValue, newValue) {
	if (oldValue == newValue)
		return;
	if (newValue == 1)
		g_form.setMandatory('comments', true);
	else
		g_form.setMandatory('comments', false);
}