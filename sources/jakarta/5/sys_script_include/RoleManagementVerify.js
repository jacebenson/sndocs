var RoleManagementVerify = Class.create();
RoleManagementVerify.prototype = {
    initialize: function() {
		var summary = {};
		summary.currInhCount = 0;
		summary.calcInhCount = 0;
		summary.discrepCount = 0;
		this.summary = summary;
    },
	
	// verify inherited roles for all users, and show diff between current and re-calculted ones
	verifyInheritedRoles: function() {
		gs.log(''+new GlideDateTime() + ' Starting checking of inherited roles for all users...');
		var user = new GlideRecord('sys_user');
		user.initialize();
		user.setWorkflow(false);
		user.query();
		while (user.next()) {
			var userSysId = user.getValue('sys_id');
			var userName = user.getValue('user_name');
			this.verifyInheritedRolesForUser(userSysId, userName);
		}
		this.summary.currInhCount = this._getInhRolesCount();
		gs.log('Number of inherited-role records in sys_user_has role, current: ' + this.summary.currInhCount 
			   + ', after re-calculation: ' + this.summary.calcInhCount);
		gs.log('Number of users with discrepancies for inherited roles: ' + this.summary.discrepCount);
		gs.log(''+new GlideDateTime() + ' Finished checking of inherited roles for all users!');
	},
	
	// verify roles for the specified user, and report any discrepancies if any
	verifyInheritedRolesForUser: function(userSysId, userName) {
		var rolesCurr = this.getInheritedRolesCurr(userSysId);
		var rolesCalc = this.getInheritedRolesCalc(userSysId);
		if (rolesCurr.length == 0 && rolesCalc.length == 0)
			return;

		this.summary.calcInhCount += rolesCalc.length;

		var rolesToBeDeleted = this.getArr1NotInArr2(rolesCurr, rolesCalc);
		var rolesToBeAdded = this.getArr1NotInArr2(rolesCalc, rolesCurr);
		if (rolesToBeDeleted.length == 0 && rolesToBeAdded.length == 0)
			return;
		this.summary.discrepCount++;	
		if (rolesToBeDeleted.length > 0)
			gs.log('User: ' + userName + ', inherited roles to be DELETED: ' + this.getRoleNamesByIds(rolesToBeDeleted));
		if (rolesToBeAdded.length > 0)
			gs.log('User: ' + userName + ', inherited roles to be ADDED: ' + this.getRoleNamesByIds(rolesToBeAdded));
	},

	// get inherited roles for the specified user from sys_user_has_role
	getInheritedRolesCurr: function(userSysId) {
		var rRoles = [];
		var ga = new GlideAggregate('sys_user_has_role');
		ga.addQuery('user', userSysId);
		ga.addQuery('inherited', true);
		ga.groupBy('role');
		ga.addAggregate('COUNT');
		ga.query();
		while (ga.next()) {
			var role = '' + ga.getValue('role');
			if (!rRoles.includes(role))
				rRoles.push(role);
		}
		rRoles.sort();
		return rRoles;
	},
	
	// get recalculated inherited roles for the specified user
	getInheritedRolesCalc: function(userSysId) {
		var rRoles = [];
		var rmAPI = new GlideUserHasRoleInhCountFixer();
		var mapRoleCount = rmAPI.findAllInheritedRoleCountsForUser(userSysId); // Map<String, Integer> mapInhRoleCounts = 
		var roles = mapRoleCount.keySet().toArray();
		for (var i = 0; i < roles.length; i++) {
			var role = '' + roles[i];
			rRoles.push(role);
		}
		rRoles.sort();
		return rRoles;
	},
	
	// find values from array1 that are not present in array2
	getArr1NotInArr2: function(arr1, arr2) {
		var res = arr1.filter(
			function(value) {
					if (arr2.indexOf(value) === -1) 
							return value;
				});
		return res;
	},

	// return array with role names from array with sys_ids
	getRoleNamesByIds: function(roles) {
		var rmAPI = new GlideUserHasRoleInhCountFixer();
		var names = [];
		for (var i = 0; i < roles.length; i++) {
			var name = rmAPI.getRoleNameById(roles[i]);
			names.push(name);
		}
		return names;
	},
	
	// get count for inherited roles from sys_user_has_roel
	_getInhRolesCount: function() {
		var res = 0;
		var aggr = new GlideAggregate('sys_user_has_role');
		aggr.addQuery('inherited', true);
		aggr.addAggregate('COUNT');
		aggr.query();
		if (aggr.next())
			res = aggr.getAggregate('COUNT');
		return res;
	},
	
    type: 'RoleManagementVerify'
};
