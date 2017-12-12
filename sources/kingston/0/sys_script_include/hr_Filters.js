var hr_Filters = Class.create();
hr_Filters.prototype = {
	initialize : function() {
	},

 	// Filter out groups that do not have the group type
 	filterGroups : function(tableName, groupType) {
 		tableName = tableName + '';		
 		var groupTypeId = this._getGroupTypeId(groupType, tableName == 'sn_hr_core_task');
 		return "sys_idIN" + this._getGroups(groupTypeId);
 	},
	
 	_getGroupTypeId : function(groupType, isTask) {
 		// For task tables, check for a task workgroup type first.
		var hrCaseGroup = '7a5370019f22120047a2d126c42e705c'; // TODO: this is in sm config. add prop?
		var hrTaskGroup = null; // also in sm config. add prop?
		var taskGroupId;
 		if ((groupType == 'work') && isTask) {
 			taskGroupId = hrTaskGroup;
 			if (taskGroupId)
 				return taskGroupId;
 		}
		
 		var groupTypeId = hrCaseGroup;
 		return groupTypeId + '';
 	},

	
 	// Filter out groups that are not qualification
 	filterWorkGroupBasedOnDispatchGroup : function(task, ignoreVendors) {		

 		var vendorType = 'hr_vendors'; // hardcode for now. was retrieved from sm_config
 		var vendorIds = '';
		
 		if (vendorType !== '' && !ignoreVendors) {
 			var vendorGroups = new GlideRecord('sys_user_group'); //Query for the groups because other logic relies on sys_id
 			vendorGroups.addQuery('type', 'CONTAINS', vendorType);
 			vendorGroups.addActiveQuery();
 			vendorGroups.query();
 			while (vendorGroups.next())
 				vendorIds += vendorGroups.sys_id + ',';
 		}
		
		var tableName;
		if (task instanceof GlideRecord)
			tableName = task.getTableName();
		else
			tableName = task; // for hr_case, we end up here with sn_hr_core_case as the value of 'task'
		var result = 'sys_idIN' + vendorIds + (this.filterGroups(tableName, 'work')).slice(8);
 		return result;
 		
 	},
	
	
 	// Get the groups
 	_getGroups : function(groupType) {
 		var ids = [];

		
 		if (ids.length <= 0) {
 			var grAll = new GlideRecord('sys_user_group');
 			grAll.addEncodedQuery("typeLIKE" + groupType);
 			grAll.addActiveQuery();
 			grAll.query();
 			while (grAll.next())
 				ids.push(grAll.sys_id.toString());	
 		}
 		return ids;
 	},
	
 	// Walk up the tree and get all nodes above a point
 	_getTree : function(table, sys_id) {
 		var tree = [];
		
 		tree.push(sys_id);
 		while (sys_id != null) {
 			/* search for its parent */
 			var gr = new GlideRecord(table);
 			gr.addQuery('sys_id', sys_id);
 			gr.addQuery('parent', '!=', '');
 			gr.query();
			
 			if (gr.next()) {
 				tree.push(gr.parent.toString());
 				sys_id = gr.parent.toString();
 			} else {
 				sys_id = null;
 			}
 		}
 		return tree;
 	},
	

	type : 'hr_Filters'
};