var ScopedAdministration = Class.create();
ScopedAdministration.prototype = {
    initialize: function() {
    },

	currentUserIsScopeAdmin: function(scope, strict) {	
		var scopeAdminRoles = this._getScopeAdminRolesGr(scope);
		var userRoles = gs.getSession().getRoles();
		var allowAdminIfTurnedOff = false;
		if (strict === undefined || !strict)
			allowAdminIfTurnedOff = scope.getValue('scoped_administration') == 0;
		
		if (userRoles.indexOf('maint') >= 0)
			return true;
			
		if (!scopeAdminRoles.hasNext() || allowAdminIfTurnedOff)
			return userRoles.indexOf('admin') >= 0;
		
		while (scopeAdminRoles.next()) {
			if (userRoles.indexOf(scopeAdminRoles.getDisplayValue()) >= 0)
				return true;
		}
		return false;
    },
	
	adminRoleContainsScopeAdminRoles: function(scope) {
		var adminRoleContains = this._getAdminRoleContainsGr();
		var roles = [];
		while (adminRoleContains.next())
			roles.push(adminRoleContains.getValue('contains'));
		
		var scopeAdminRoles = this._getScopeAdminRolesGr(scope);
		if (!scopeAdminRoles.hasNext())
			return false;
		
		while (scopeAdminRoles.next())
			if (roles.indexOf(scopeAdminRoles.getValue('sys_id')) < 0)
				return false;
		return true;
    },
	
	addScopeAdminRolesToAdminContains: function(scope) {
		var adminRole = this._getAdminRoleGr();
		var scopeAdminRoles = this._getScopeAdminRolesGr(scope);
		while (scopeAdminRoles.next()) {
			var adminRoleContains = new GlideRecord('sys_user_role_contains');
			adminRoleContains.addQuery('role', adminRole.sys_id);
			adminRoleContains.addQuery('contains', scopeAdminRoles.sys_id);
			adminRoleContains.query();
			if (adminRoleContains.hasNext())
				continue;
			adminRoleContains = new GlideRecord('sys_user_role_contains');
			adminRoleContains.initialize();
			adminRoleContains.setValue('role', adminRole.sys_id);
			adminRoleContains.setValue('contains', scopeAdminRoles.sys_id);
			adminRoleContains.insert();
		}
	},
	
	removeScopeAdminRolesFromAdminContains: function(scope) {
		var adminRole = this._getAdminRoleGr();
		var scopeAdminRoles = this._getScopeAdminRolesGr(scope);
		while (scopeAdminRoles.next()) {
			var adminRoleContains = new GlideRecord('sys_user_role_contains');
			adminRoleContains.addQuery('role', adminRole.sys_id);
			adminRoleContains.addQuery('contains', scopeAdminRoles.sys_id);
			adminRoleContains.deleteMultiple();
		}
    },
	
	countNumberOfActiveScopeAdminIfContainsRemoved: function(container, contained) {
		var usersWithContainer = [];
		var gr = new GlideRecord('sys_user_has_role');
		gr.addQuery('role', container);
		gr.addQuery('inherited', false);
		gr.query();
		while (gr.next())
			usersWithContainer.push(gr.getValue('user'));
		
		var usersWithRoleButNotFromContainer = [];
		gr = new GlideRecord('sys_user_has_role');
		gr.addQuery('role', contained);
		gr.query();
		while (gr.next()) {
			if (usersWithContainer.indexOf(gr.getValue('user')) >= 0 && gr.getValue('inh_count') == '1')
				continue;
			usersWithRoleButNotFromContainer.push(gr.getValue('user'));
		}
		
		if (usersWithRoleButNotFromContainer.length() == 0)
			return 0;
		
		var activeUsers = new GlideRecord('sys_user');
		activeUsers.addActiveQuery();
		
		// also check the users have a password set, are not locked out, etc...
		activeUsers.addNotNullQuery('user_password');
		activeUsers.addQuery('locked_out', false);
		activeUsers.addQuery('web_service_access_only', false);
		activeUsers.addQuery('internal_integration_user', false);
		
		activeUsers.addQuery('sys_id', 'IN', usersWithRoleButNotFromContainer.join());
		activeUsers.query();
		return activeUsers.getRowCount();
    },
	
	countNumberOfActiveScopeAdminIfRoleRemoved: function(user, role) {
		var gr = new GlideRecord('sys_user_has_role');
		gr.addQuery('role', role);
		gr.addQuery('user', '!=', user);
		gr.addQuery('user.active', true);
		gr.query();
		return gr.getRowCount();
	},
	
	isScopeAdminRole: function(role) {
		var gr = new GlideRecord('sys_user_role'); 
		gr.addQuery('assignable_by', role);
		gr.addQuery('sys_scope.scoped_administration', 'true');
		gr.query();
		return gr.getRowCount() > 0;
    },
	
	getScopeAdminRolesArray : function(scope) {
		var gr = this._getScopeAdminRolesGr(scope);
		var res = [];
		while (gr.next())
			res.push(gr.sys_id);
		return res;
	},
	
	isScopedAdministrationOn: function(scopeID) {
		var gr = new GlideRecord('sys_scope');
		if (gr.get('sys_id', scopeID))
			return JSUtil.getBooleanValue(gr, 'scoped_administration');
		return false;
	},
	
	_getScopeAdminRolesGr : function(scope) {
		var gr = new GlideRecord('sys_user_role'); 
		var jc = gr.addJoinQuery('sys_user_role', 'sys_id', 'assignable_by');
		jc.addCondition('sys_scope', scope.sys_id);
		gr.query();
		return gr;
	},
	
	_getAdminRoleContainsGr : function() {
		var adminRole = this._getAdminRoleGr();
		
		var roleContains = new GlideRecord('sys_user_role_contains');
		roleContains.addQuery('role', adminRole.sys_id);
		roleContains.query();
		return roleContains;
	},
	
	_getAdminRoleGr : function () {
		var adminRole = new GlideRecord('sys_user_role'); 
		adminRole.get('name', 'admin');
		return adminRole;
	},
	
    type: 'ScopedAdministration'
};