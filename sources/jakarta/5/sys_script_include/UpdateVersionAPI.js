var UpdateVersionAPI = Class.create();
UpdateVersionAPI.prototype = {
	initialize: function() {
	},
	
	/* Retruns an array of customer file IDs from the provided queried sys_metadata GlideRecord */
	/* Array */ getCustomerFileIds: function(/* sys_metadata */ files) {
		var ids = [];
		while(files.next()) {
			if(files.sys_update_name.nil())
				continue;
			
			var versions = new GlideRecord('sys_update_version');
			versions.addQuery('name', files.sys_update_name.toString());
			versions.query();
			
			// if a file has 0 versions, then not a customer file
			if(versions.getRowCount() === 0)
				continue;
			
			// if there exists a named version of source sys_upgrade_history or sys_store_app, then not a customer file
			var isCustomerFile = true;
			while(versions.next()) {
				var source = versions.source_table.toString();
				if(source === 'sys_upgrade_history' || source === 'sys_store_app') {
					isCustomerFile = false;
					break;
				}
			}
			if(isCustomerFile)
				ids.push(files.getUniqueValue());
		}
		return ids;
	},
	
	type: 'UpdateVersionAPI'
};