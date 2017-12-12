var UserHasRoleAjax = Class.create();

UserHasRoleAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    ajaxFunction_userHasRole: function() {
		var userIds = this.getParameter('sysparm_user_sys_ids');
		userIds = GlideStringUtil.split(userIds);
		var role = this.getParameter('sysparm_user_role');
		var users = [];
		
		for(var i = 0; i < userIds.size(); i++) {
			var hasRoleGR = new GlideRecord('sys_user_has_role');
			var sysId = userIds.get(i);
			hasRoleGR.addQuery('user', sysId);
			var orCondition = hasRoleGR.addQuery('role.name', role.toString());
			orCondition.addOrCondition('role.name', 'admin'); 
			hasRoleGR.query();
			
			if (!hasRoleGR.hasNext()){
				var user = GlideUser.getUserByID(sysId);
				users.push(user.getFullName());
			}
		}
		
		return users.join(", ");
		
	}

});