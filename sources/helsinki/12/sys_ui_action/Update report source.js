function convertDateToUTC(date) { 
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}

function getTableAndCondition() {
	var reportSource = g_form.getValue('report_source');
	if (reportSource == '') {
		g_form.clearValue('facts_table');
		g_form.clearValue('conditions');
	} else {
	    var gr = new GlideRecord('sys_report_source');
	    if (gr.get(reportSource)) {
			var table = gr.getValue('table');
			var filter = gr.getValue('filter');
		    g_form.setValue('facts_table', table);
			setTimeout(function() {
				new GlideFilter(table, filter, "pa_cubes.conditions", false, true);
			}, 500);
	    }
	}
	g_form.setValue('report_source_updated_at',formatDate(convertDateToUTC(new Date()), 'yyyy-MM-dd HH:mm:ss'));
	
}

$j(function() {
    var relatedLink = $j('a[id="13186ae3bf1302008a85d64f6c07391f"]'),
        reportSourceEl = $j('div[id="element.pa_cubes.report_source"] .form-field-addons'),
        html = '<button type="button" onclick="getTableAndCondition(); return false;" title=' + getMessage('Refresh table and conditions') + ' class="sn-tooltip-basic btn btn-default icon-refresh" data-toggle="tooltip" data-placement="auto"></button>';
	
	reportSourceEl.append(html);
});