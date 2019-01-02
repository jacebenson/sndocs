(function() {
	
	var _isACLCustomized = function(aclRoleRecord) {
		
		var isAvailable;
		var fileId = aclRoleRecord.sys_security_acl.sys_id;
		var gr = new GlideRecord('sys_update_xml');
		gr.addQuery('name', 'sys_security_acl_'+fileId);
		gr.query();
		if(gr.getRowCount() > 0)
			isAvailable = true;
		return isAvailable;
	};
	
	var _isACLRolesCustomized = function(aclRoleRecord) {
		
		var isAvailable;
		
		var gr = new GlideRecord('sys_update_xml');
		gr.addQuery('type', 'Access Roles');
		gr.addQuery('target_name', 'CONTAINS', aclRoleRecord.sys_security_acl.name);
		gr.query();
		if(gr.getRowCount() > 0)
			isAvailable = true;
		
		return isAvailable;
	};
	
	var _deleteACL = function(aclRoleRecord) {
		
		if(_isACLCustomized(aclRoleRecord)) {
			return;
		} else {
			if(_isACLRolesCustomized(aclRoleRecord))
				aclRoleRecord.deleteRecord();
			else
				aclRoleRecord.sys_security_acl.getRefRecord().deleteRecord();
		}
	};
	
	
	var role = new GlideRecord('sys_security_acl_role');
	var roleCondition = role.addQuery('sys_security_acl.name', 'release_product.number');
	roleCondition.addOrCondition('sys_security_acl.name', 'release_project.number');
	roleCondition.addOrCondition('sys_security_acl.name', 'release_project.release_history');
	role.addQuery('sys_user_role.name', 'public');
	role.addQuery('sys_security_acl.operation.name', 'read');
	role.query();
	
	while(role.next()) {
		_deleteACL(role);
	}
})();