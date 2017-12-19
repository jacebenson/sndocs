gs.include("PrototypeServer");

var RoleVerify = Class.create();

RoleVerify.prototype = {
    initialize: function() {
    },

    inheritRoles: function(parentRoleName, roleToAddName) {
       if (roleToAddName == null) roleToAddName = parentRoleName;
       var contains = new GlideRecord("sys_user_role_contains");
       contains.addQuery("role.name", roleToAddName);
       contains.query();
       while (contains.next()) {
          this._checkUsers(parentRoleName, roleToAddName, contains);
       }
    },

    _checkUsers: function(parentRoleName, roleToAddName, contains) {
       var userRole = this._getUserRole(parentRoleName, "");
	
       while (userRole.next()) {
          //see if user already has the inherited role
          role = this._getUserRole(roleToAddName,userRole.user)
          role.next();

          var inhRole = new GlideRecord("sys_user_has_role");
          inhRole.addQuery("user", userRole.user);
          inhRole.addQuery("role", contains.contains);
          inhRole.addQuery("inherited", true);
          inhRole.addQuery("included_in_role", role.sys_id);
          inhRole.query();
          if (inhRole.next())
             continue;

          gs.log("**Adding role : "+contains.contains.name+" to user : " + userRole.user.name + " because of role : " + contains.role.name);
          inhRole.initialize();
          inhRole.user = userRole.user;
          inhRole.role = contains.contains;
          inhRole.granted_by = contains.granted_by;
          inhRole.inherited = true;
          inhRole.included_in_role = role.sys_id;
          inhRole.included_in_role_instance = userRole.sys_id;
          inhRole.insert();
       }
    },

    _getUserRole: function(roleToLookup, user) {
       var role = new GlideRecord("sys_user_has_role");
       if (user != "") role.addQuery("user", user);
       role.addQuery("role.name", roleToLookup);
       role.query();
          return role;
    },

    type: RoleVerify
}

