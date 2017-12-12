gs.include("PrototypeServer");

var RoleSupport = Class.create();

RoleSupport.prototype = {
	initialize : function() {
		this.getRoleMap();
	},

	upgradeRoles : function() {
		var user = new GlideRecord('sys_user');
		user.query();
		while (user.next()) {
			var roles = user.roles + '';
			roles = roles.split(',');
			for (var x=0; x < roles.length; x++) {
				var r = roles[x];
				if (r == 'START' || r == 'END' || r == '')
					continue;
				var role_id = this.map(r);
				this.saveRole(user.sys_id, role_id);
			}
		}
        	
	},

	upgradeGroups : function() {
		var gr = new GlideRecord('sys_user_group');
		gr.query();
		while (gr.next()) {
			var roles = gr.roles + '';
			roles = roles.split(',');
			for (var x=0; x<roles.length; x++) {
				var r = roles[x];
				if (r == 'START' || r == 'END' || r == '')
					continue;
				var role_id = this.map(r);
				this.saveGroupRole(gr.sys_id, role_id);
			}
		}
	},

        expandRoles: function() {
                var gr = new GlideRecord('sys_user_role');
                gr.query();
                while (gr.next()) {
                    var included = gr.includes_roles + '';
                    if (included == null || included == '')
                        continue;
                    
                    included = included.split(',');
                    for (var i=0;i < included.length; i ++) {
                       var r = included[i];
                       var role_id = this.map(r);
                       var contains = new GlideRecord('sys_user_role_contains');
                       contains.addQuery('role',gr.sys_id);
                       contains.addQuery('contains',role_id);
                       contains.query();
                       if (!contains.hasNext()) {
                          contains.initialize();
                          contains.role = gr.sys_id;
                          contains.contains = role_id;
                          contains.insert();
                       }
                    }
                } 
        },

	getRoleMap : function() {
		var map = new Packages.java.util.HashMap();
		var gr = new GlideRecord('sys_user_role');
		gr.query();
		while (gr.next()) {
			map.put(gr.name.toString(), gr.sys_id.toString());
		}
		this.roleMap = map;
	},

	map : function(role, scope) {
		role = role + '';
		/**
		 * Fix for PRB628832 - Roles having Capital letters on them causes them 
		 * to be ignored when converting from SimpleSecurity to ContextualSecurity.
		 **/
		//role = role.toLowerCase();
		var id = this.roleMap.get(role);
		if (id == null) {
			var newRole = new GlideRecord('sys_user_role');
			newRole.initialize();
			newRole.name = role;
			if(typeof scope != 'undefined' && newRole.isValidField('sys_scope'))
				newRole.sys_scope = scope;	
			id = newRole.insert();
			this.roleMap.put(role, id);
		}
		return id;
	},

	saveRole : function(user_id, role_id, granted_by) {
		var gr = new GlideRecord('sys_user_has_role');
		// don't allow duplicates
		gr.addQuery('user', user_id);
		gr.addQuery('role', role_id);
		gr.query();
		if (!gr.hasNext()) {
			gr.initialize();
			gr.role = role_id;
			gr.user = user_id;
          	if (typeof(granted_by) != 'undefined') {
				gr.granted_by = granted_by;
				gr.inherited = true;
			}
			gr.insert();
		}
	},

	saveGroupRole : function(group_id, role_id) {
		var gr = new GlideRecord('sys_group_has_role');
		gr.initialize();
		gr.role = role_id;
		gr.group = group_id;
		gr.inherits = true;
		gr.insert();
	}
}
