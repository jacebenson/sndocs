var EmbeddedHelpRoleSynchronizer = Class.create();
EmbeddedHelpRoleSynchronizer.prototype = {
    initialize: function() {
		
    },
	
	roleSynchronizer : function () {
		var roleIDs = '';
		var i = 0;
		var existingEmbeddedHelpRoleSynchronizers = new GlideRecord('sys_embedded_help_role');
		existingEmbeddedHelpRoleSynchronizers.query();
		while (existingEmbeddedHelpRoleSynchronizers.next()) {
			if(i == 0) {
				roleIDs = roleIDs + existingEmbeddedHelpRoleSynchronizers.getValue('role');
			} else {
				roleIDs = roleIDs + ',' + existingEmbeddedHelpRoleSynchronizers.getValue('role');
			}
			i++;
		}
		var newEmbeddedHelpRoleSynchronizers = new GlideRecord('sys_user_role');
		if(GlideStringUtil.notNil(roleIDs))
		   newEmbeddedHelpRoleSynchronizers.addQuery('sys_id', 'NOT IN', roleIDs);
		newEmbeddedHelpRoleSynchronizers.query();
		while (newEmbeddedHelpRoleSynchronizers.next()) {
			var order = 1000;
			var roleName = newEmbeddedHelpRoleSynchronizers.getValue('name');
			var addEmbeddedHelpRoleSynchronizer = new GlideRecord('sys_embedded_help_role');
			addEmbeddedHelpRoleSynchronizer.role = newEmbeddedHelpRoleSynchronizers.getValue('sys_id');
			roleName = roleName.toString().toLowerCase();
			if (roleName.includes('admin') && !roleName.includes('itil')) {
				order = 10;
			} else if ((roleName.includes('itil') && roleName.includes('admin')) || roleName.includes('manager')) {
				order = 100;
			} else if (roleName.includes('itil') && !roleName.includes('admin')) {
				order = 300;
			}
			addEmbeddedHelpRoleSynchronizer.order = order;
			addEmbeddedHelpRoleSynchronizer.setWorkflow(false);
			addEmbeddedHelpRoleSynchronizer.insert();

		}
	}

};