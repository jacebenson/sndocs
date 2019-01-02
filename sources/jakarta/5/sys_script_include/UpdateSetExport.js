var UpdateSetExport = Class.create();
UpdateSetExport.prototype = {
    initialize: function() {
    },
	
	exportUpdateSet: function(current, baseUpdateSetId, parentId) {
		var retrievedUpdateSet = new GlideRecord('sys_remote_update_set');
		retrievedUpdateSet.initialize();

		retrievedUpdateSet.description = current.description;
		retrievedUpdateSet.name = current.name;
		retrievedUpdateSet.release_date = current.release_date;
		retrievedUpdateSet.remote_sys_id = current.sys_id;
		retrievedUpdateSet.application = current.application;
		retrievedUpdateSet.remote_base_update_set = baseUpdateSetId;
		retrievedUpdateSet.parent = parentId; 

		var scopeGr = new GlideRecord('sys_scope');
		scopeGr.get(current.application);
		if (scopeGr.isValid()) {
			retrievedUpdateSet.application_name = scopeGr.name;
			retrievedUpdateSet.application_scope = scopeGr.scope;
			retrievedUpdateSet.application_version = scopeGr.version;
		} 

		if (current.parent.nil())
			retrievedUpdateSet.state = "loaded";
		else
			retrievedUpdateSet.state = "in_hierarchy";

		retrievedUpdateSet.setWorkflow(false);
		var retrievedUpdateSetSysId = retrievedUpdateSet.insert();

		var update = new GlideRecord('sys_update_xml');
		update.addQuery('update_set', current.sys_id);
		update.query();

		while(update.next()) {
		   update.remote_update_set = retrievedUpdateSet.sys_id;
		   update.update_set = '';
		   update.insert();
		}
		
		return retrievedUpdateSetSysId;
	},
	
	exportHierarchy: function(current) {
		var baseUpdateSetId = this.exportUpdateSet(current, "", "");
		//Set the batch base value since its unavailable on insert
		var baseUpdateSet = new GlideRecord("sys_remote_update_set");
		baseUpdateSet.get(baseUpdateSetId);
		baseUpdateSet.remote_base_update_set= baseUpdateSetId;
		baseUpdateSet.setWorkflow(false);
		baseUpdateSet.update();
		
		this._processChildren(baseUpdateSetId, current.sys_id, baseUpdateSetId);
		
		return baseUpdateSetId;
	},
	
	_processChildren: function(baseUpdateSetId, parentId, remoteParentId) {
		var updateSet = new GlideRecord('sys_update_set');
		updateSet.addQuery("parent", parentId);
		updateSet.addQuery("state", "complete");
		updateSet.query();
		while(updateSet.next()) {
			var remoteId = this.exportUpdateSet(updateSet, baseUpdateSetId, remoteParentId);
			this._processChildren(baseUpdateSetId, updateSet.sys_id, remoteId);
		}
	},
	
    type: 'UpdateSetExport'
};