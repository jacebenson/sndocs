function convertDateToUTC(date) { 
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) 
		return;
	
	if (newValue == '') {
		g_form.clearValue('facts_table');
		g_form.clearValue('report_source_updated_at');
	} else {
	    var gr = new GlideRecord('sys_report_source');
	    if (gr.get(newValue)) {
			var table = gr.getValue('table');
			var filter = gr.getValue('filter');
		    g_form.setValue('facts_table', table);
			g_form.setValue('conditions', filter);
	    }
		g_form.setValue('report_source_updated_at',formatDate(convertDateToUTC(new Date()), 'yyyy-MM-dd HH:mm:ss'));
	}
}