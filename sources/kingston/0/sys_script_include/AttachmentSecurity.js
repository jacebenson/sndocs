var AttachmentSecurity = Class.create();
AttachmentSecurity.prototype = {
	initialize: function() {
	},

	canRead: function(current) {
		if (current.table_name.nil())
			return true;
		
		// If the attachment is from live feed,
		// grant it the read access
		if (current.table_name.indexOf("live_profile") > -1 || current.table_name.indexOf("live_group_profile") > -1)
			return true;

		// Remove Prefix
		var tableName = current.table_name + '';
		if (tableName.startsWith("invisible."))
			tableName = tableName.substring(10);
		else if (tableName.startsWith("ZZ_YY"))
			tableName = tableName.substring(5);

		var parentRecord = new GlideRecord(tableName);

		parentRecord.setWorkflow(false);
		if (!parentRecord.isValid() || !parentRecord.get(current.table_sys_id)) {
			if (current.sys_created_by.equals(gs.getUserName()))
				return true;
			return false;
		}

		return parentRecord.canRead();	
	},

	type: 'AttachmentSecurity'
};