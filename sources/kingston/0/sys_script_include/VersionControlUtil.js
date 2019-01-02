var VersionControlUtil = Class.create();

VersionControlUtil.prototype = {
	
	// Redirect the updated or saved form to the new record
	redirect : function(tableName, newRecordId) {
		if (GlideTransaction.get())
			try {
				var newRecord = new GlideRecord(tableName);
				if (newRecord.get(newRecordId))
					action.setRedirectURL(newRecord);
			}
			catch (e) {
				gs.addInfoMessage(gs.getMessage('Refresh the list by clicking on the breadcrumb link to display the updated record.'));
			}
	}
}