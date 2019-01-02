var DelegatedDevUserPermissions = (function() {
	
	return {
		userPermissionsInScope : function(scopeId) {
			var rolePermissions = getRolePermissionsInScope(scopeId);
			var userRoles = getUsersWithRoles(keys(rolePermissions));
			var userPermissions = getPermissionsByUser(rolePermissions, userRoles);
			gs.debug("Role perms: " + new global.JSON().encode(rolePermissions));
			gs.debug("User roles: " + new global.JSON().encode(userRoles));
			gs.debug("User perms: " + new global.JSON().encode(userPermissions));
			return userPermissions;
		}
		
	};
	
	function getRolePermissionsInScope(scopeId) {
		var grAssignments = new GlideRecord('sys_scope_permission_set_role_assignment');
		grAssignments.addQuery('scope', scopeId);
		grAssignments.query();
		var rolePermissions = {};
		while (grAssignments.next()) {
			var role = grAssignments.getValue('role');
			if (typeof rolePermissions[role] === 'undefined')
				rolePermissions[role] = [];

			rolePermissions[role].push(grAssignments.getValue('permission_set'));	
		}
		
		return rolePermissions;
	}
	
	function getUsersWithRoles(roleList) {
		var grUserHasRole = new GlideRecord('sys_user_has_role');
		grUserHasRole.addQuery('role', 'IN', roleList);
		grUserHasRole.query();
		var userRoles = {};
		while (grUserHasRole.next()) {
			var user = grUserHasRole.getValue('user');
			if (typeof userRoles[user] === 'undefined')
				userRoles[user] = [];
			gs.debug("Type of user is " + typeof user);
			gs.debug("Adding role " + grUserHasRole.role + " to user " + user);
			userRoles[user].push(grUserHasRole.getValue('role'));
		}
		return userRoles;
	}
	
	function getPermissionsByUser(rolePermissions, userRoles) {
		var user, role;
		var permsByUser = {};
		for (user in userRoles) {
			permsByUser[user] = [];
			for (var i = 0; i < userRoles[user].length; i++) {
				role = userRoles[user][i];
				gs.debug("Adding permission " + rolePermissions[role] + " to " + user);
				permsByUser[user] = rolePermissions[role];
			}
		}
		return permsByUser;
	}
	
	function keys(obj) {
		var ownKeys = [];
		for (var k in obj)
			if (obj.hasOwnProperty(k))
				ownKeys.push(k);
		return ownKeys;
	}
	
})();