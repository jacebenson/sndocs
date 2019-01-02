var UpgradeHistoryLogPriority = Class.create();
UpgradeHistoryLogPriority.prototype = {
    initialize: function() {},
	
	generate : function(type, priority) {
		// prevent transaction cancellation by quota rules
		var t = null;
		var isUncancelable = false;
		try {
			t = GlideTransaction.get();
			if (t != null) {
				isUncancelable = t.isUncancelable();
				t.setCannotCancel(true);
			}
	
			var gr = new GlideRecord('sys_dictionary');
			gr.addQuery('internal_type', '=', type);
			gr.query();
			while(gr.next()) {
				var tableName = gr.getValue('name');
				if (tableName !== null)
					this.setTablePriority(tableName, priority);
			}
		} finally {
			if (t != null)
				t.setCannotCancel(isUncancelable);
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