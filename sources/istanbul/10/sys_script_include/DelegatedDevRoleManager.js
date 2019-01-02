var DelegatedDevRoleManager = (function() {

	function forScopeAndPermissionSet(scopeId, permissionSetId) {
		
		var scopeName = getScopeName();
		var permissionSetName = getPermissionSetName();

		gs.debug("Scope name " + scopeName);
		gs.debug("Permission set name " + permissionSetName);
		
		return {
			allocatePermissionToUser : function(userId) {
				verifyUser(userId);
				
				// Look up a (permission, scope) pair to get any already existing roles
				var roleId = findRoleId();
				gs.debug("Found role " + roleId);

				// If no (permission, scope) pair already there, create a role and assign the permission to it
				if (gs.nil(roleId))
					roleId = allocateRoleName();

				gs.debug("Role we'll assign is " + roleId);
				
				// Assign the role to the user
				assignRoleToUser(userId, roleId);
				assignRoleToUser(userId, getRoleIdFromName('delegated_developer'));
				
			},

			removePermissionFromUser : function(userId) {
				verifyUser(userId);
				
				var roleId = findRoleId();

				if (!gs.nil(roleId))
					removeRoleFromUser(userId, roleId);
			}
		};
		
		function getRoleIdFromName(roleName) {
			var gr = new GlideRecord('sys_user_role');
			gr.addQuery('name', roleName);
			gr.query();
			if (gr.next())
				return gr.getUniqueValue();
		}

		function getScopeName() {
			var gr = new GlideRecord('sys_scope');
			gr.get(scopeId);
			if (!gr.isValid())
				throw "Invalid scope ID " + scopeId;
			return gr.name;
		}

		function getPermissionSetName() {
			var gr = new GlideRecord('sys_development_permission_set');
			gr.get(permissionSetId);
			if (!gr.isValid())
				throw "Invalid permission set ID " + permissionSetId;
			return gr.name;
		}
		
		function verifyUser(userId) {
			var gr = new GlideRecord('sys_user');
			gr.get(userId);
			if (!gr.isValid())
				throw "Invalid user id " + userId;
		}

		function findRoleId() {
			var gr = new GlideRecord('sys_scope_permission_set_role_assignment');
			gr.addQuery('scope', scopeId);
			gr.addQuery('permission_set', permissionSetId);
			gr.query();
			if (gr.next())
				return gr.role;
			return null;
		}

		function allocateRoleName() {
			var roleName = getAvailableRoleName(scopeId, permissionSetId);
			var roleId = createRole(roleName);

			var gr = new GlideRecord('sys_scope_permission_set_role_assignment');
			gr.initialize();
			gr.role = roleId;
			gr.scope = scopeId;
			gr.permission_set = permissionSetId;
			if (!gr.insert())
				throw "Failed to create role/permission_set/scope relationship for " + [roleId, permissionSetId, scopeId].join('/');

			gs.debug("New role name: " + roleName + " with sys id " + roleId);
			return roleId;
		}

		function getAvailableRoleName() {
			var baseRoleName = ["dev", cleanName(scopeName), cleanName(permissionSetName)].join('_');
			var maxIncrement = maxUsedRoleNameIncrement(baseRoleName);
			var roleName = baseRoleName;
			if (typeof maxIncrement !== 'undefined')
				roleName = baseRoleName + '_' + maxIncrement++;

			gs.debug("Role name will be " + roleName);
			return roleName;
		}
		
		function cleanName(name) {
			return name.replace(/[^A-Za-z0-9_-]/, '');
		}
		
		function maxUsedRoleNameIncrement(roleName) {
			var gr = new GlideRecord('sys_user_role');
			gr.addQuery('name', 'STARTSWITH', roleName);
			gr.query();
			var maxUniquifier;
			var curUniquifier;
			while (gr.next()) {
				var name = gr.getValue('name');
				name.replace(roleName + '_', '');
				curUniquifier = ~~name;
				if (typeof maxUniquifier === 'undefined' || curUniqifier > maxUniquifier)
					maxUniquifier = curUniquifier;
			}
			return maxUniquifier;
		}
		
		function createRole(roleName) {
			gs.debug("Starting process of creating role " + roleName);
			var gr = new GlideRecord('sys_user_role');
			gr.initialize();
			gr.name = roleName;
			gr.description = 'Delegated Development: ' + scopeName + ' ->  ' + permissionSetName;
			if (!gr.insert())
				throw "Failed to create role " + roleName + ", aborting role assignment";
			gs.debug("Created role " + roleName + " with sysId " + gr.getUniqueValue());
			return gr.getUniqueValue();
		}

		function assignRoleToUser(userId, roleId) {
			if (gs.nil(userId) || gs.nil(roleId))
				return;
				
			var gr = new GlideRecord('sys_user_has_role');
			gr.addQuery('user', userId);
			gr.addQuery('role', roleId);
			gr.query();
			if (!gr.next()) {
				gs.debug("Creating a new record for " + userId + " and role " + roleId);
				gr.newRecord();
				gr.user = userId;
				gr.role = roleId;
				if (!gr.insert())
					throw "Failed to assign role [" + roleId + "] to user [" + userId + "]";
			}
			else {
				gs.debug("Using existing role association " + gr.getUniqueValue());
			}
			gs.debug("sys id of sys_user_has_role record: " + gr.getUniqueValue());
			return gr.getUniqueValue();
		}

		function removeRoleFromUser(userId, roleId) {
			var gr = new GlideRecord('sys_user_has_role');
			gr.addQuery('user', userId);
			gr.addQuery('role', roleId);
			gr.query();
			if (gr.next())
				return gr.deleteRecord();
			return false;
		}
	}

	return {
		forScopeAndPermissionSet : forScopeAndPermissionSet
	};

})();

