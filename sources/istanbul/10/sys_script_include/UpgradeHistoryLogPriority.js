var UpgradeHistoryLogPriority = Class.create();
UpgradeHistoryLogPriority.prototype = {
    initialize: function() {},
	
	generate : function(type, priority) {
		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('internal_type', '=', type);
		gr.query();
		while(gr.next()) {
			var tableName = gr.getValue('name');
			if (tableName !== null)
				this.setTablePriority(tableName, priority);
		}
	},
	
	setTablePriority : function(tableName, priority) { 
		var appFile = new GlideRecord('sys_app_file_type');
		appFile.addQuery('sys_source_table', tableName);
		appFile.query();
		if (appFile.next()) {
			appFile.setValue('priority', priority);
			appFile.update();
			gs.print("Updating table '" + tableName + "' with priority '"+priority+"'");
		}
	}, 

    type: 'UpgradeHistoryLogPriority'
};