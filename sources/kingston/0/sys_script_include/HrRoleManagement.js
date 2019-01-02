var HrRoleManagement = Class.create();
HrRoleManagement.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	addRemoveRolesForContact: function(newRoles, userSysId) {
        var roles = gs.getUser().getRoles();
		var isHrAdmin = roles.indexOf('sn_hr_core.admin') > -1;
        var isLEAdmin = roles.indexOf('sn_hr_le.admin') > -1;
		if (!isHrAdmin && !isLEAdmin)
			return;

		var answer = [];
		var gr = new GlideRecordSecure('sys_user_role');
		gr.addQuery('name', 'STARTSWITH', "sn_hr_");
		gr.query();
		while (gr.next()) {
			answer.push(gr.getValue('name'));
		}
		newRoles = newRoles || this.getParameter("sysparm_add_roles");
		userSysId = userSysId || this.getParameter("sysparm_contact_id");
		new global.HRSecurityUtilsAjax().removeUserRoles(userSysId, answer.join(','));
		var rolesToAdd = [];
		if(!gs.nil(newRoles)) {
			rolesToAdd = newRoles.split(',');
			for(var k=0; k<rolesToAdd.length; k++)
				new hr_Utils().addUserRole(rolesToAdd[k], userSysId);
		}
	},		
		type: 'HrRoleManagement'
	});