function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
       return;
    }

    //The picked new filter should update the table field
	if(g_form.getReference("filter").table != g_form.getValue("table")) {
		var newTable = g_form.getReference("filter").table;
		g_form.setValue("table", newTable);
	}
}