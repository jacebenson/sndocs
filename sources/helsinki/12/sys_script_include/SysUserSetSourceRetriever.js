var SysUserSetSourceRetriever = Class.create();
SysUserSetSourceRetriever.prototype = {
	initialize: function() {
	},
	process: function() {
		var userSetSourceTables = [];
		userSetSourceTables.push('sys_user');
		userSetSourceTables.push('sys_user_group');
		
		return userSetSourceTables;
	},
	
	type: 'SysUserSetSourceRetriever'
}