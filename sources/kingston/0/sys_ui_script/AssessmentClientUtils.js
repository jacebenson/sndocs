var AssessmentClientUtils = {
	populateDefaultFilter: function() {
		var id = g_form.getUniqueValue();
		var table = g_form.getValue('table');
		var condition = getFilter('asmt_metric_type.condition');
		var filterTable = g_form.getValue('filter_table');
		var groupField = g_form.getValue('display_field');
		var filterCondition = g_form.getValue('filter_condition');
		var showAllGroups = this._getDisplayAll();
		var currentDefault = g_form.getValue('default_filter').toString();
		
		var onResponse = function(serverResponse) {
			var filters = serverResponse.responseXML.getElementsByTagName('group');
			var numFilters = filters.length;
			
			g_form.clearOptions('default_filter');
			g_form.addOption('default_filter', '-- None --', getMessage('-- None --'));
			for(var i = 0; i < numFilters; i++) {
				var display = filters[i].getAttribute('display');
				var id = filters[i].getAttribute('value');
				g_form.addOption('default_filter', id, display);
				if(currentDefault == id)
					g_form.setValue('default_filter', id);
			}
		};
	
		var ga = new GlideAjax('AssessmentUtilsAJAX');
		ga.addParam('sysparm_id', id);
		ga.addParam('sysparm_name', 'getFilters');
		ga.addParam('sysparm_base_table', table);
		ga.addParam('sysparm_condition', condition);
		ga.addParam('sysparm_filter_table', filterTable);
		ga.addParam('sysparm_group_field', groupField);
		ga.addParam('sysparm_filter_condition', filterCondition);
		ga.addParam('sysparm_show_all_groups', showAllGroups);
		ga.getXML(onResponse);
	},
	
	_getDisplayAll: function() {
		// If the field is on the form (even if it is hidden), 
		// return the value of the field
		var displayAllField = $('asmt_metric_type.display_all_filters');
		if (displayAllField)
			return g_form.getValue('display_all_filters');
		// If the field value is on the scratchpad, return that value
		else if (g_scratchpad._loadDisplayAll !== undefined)
			return g_scratchpad._loadDisplayAll;
		// Make an AJAX to get the value of the field
		else {
			var currentSysId = g_form.getUniqueValue().toString();
			var gr = new GlideRecord('asmt_metric_type');
			gr.get(currentSysId);
			return gr.display_all_filters;
		}
	}
};
