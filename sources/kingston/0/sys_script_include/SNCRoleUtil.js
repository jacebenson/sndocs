var SNCRoleUtil = Class.create();
SNCRoleUtil.prototype = {
	initialize: function() {
	},
	
	getSysID: function(roleName) {
		var role = new GlideRecord('sys_user_role');
		var roleSysId = '';
		role.addQuery('name', roleName);
		role.query();
		if (role.next()) {
			roleSysId = role.getValue('sys_id');
		}
		return roleSysId;
	},
	
	groupRoleExists: function(groupdID, roleName) {
		var gr = new GlideRecord('sys_group_has_role');
		gr.addQuery('group', groupdID);
		gr.addQuery('role', this.getSysID(roleName));
		gr.query();
		return gr.hasNext();
	},
	
	type: 'SNCRoleUtil'
};