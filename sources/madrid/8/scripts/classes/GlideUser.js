/*! RESOURCE: /scripts/classes/GlideUser.js */
var GlideUser = Class.create({
      initialize: function(userName, firstName, lastName, nonDefaultRoles, userID, departmentID) {
        this.userName = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.setFullName(this.firstName + " " + this.lastName);
        this.setRoles(nonDefaultRoles);
        this.userID = userID;
        this.departmentID = departmentID;
        this.preferences = new Object();
        this.clientData = new Object();
      },
      hasRoleExactly: function(role, includeDefaults) {
        if (!role || typeof role != 'string')
          return false;
        var rolesToCheck = this.roles;
        if (includeDefaults)
          rolesToCheck = this.allRoles;
        for (var x = 0, l = rolesToCheck.length; x < l; x++) {
          if (rolesToCheck[x].toLowerCase() == role.toLowerCase())
            return true;
        }
        return false;
      },
      hasRoles: function(includeDefaults) {
        if (includeDefaults)
          return (this.allRoles.length > 0);
        else
          return (this.roles.length > 0);
      },
      hasRole: function(role, includeDefaults) {
        if (this.hasRoleExactly('maint', includeDefaults))
          return true;
        if (this.hasRoleExactly(role, includeDefaults))
          return true;
        if (role == 'maint')
          return false;
        if (this.hasRoleExactly('admin', includeDefaults))
          return true;
        return false;
      },
      hasRoleFromList: function(roles, includeDefaults) {
        var rolesToMatch = new Array();
        if (roles)
          rolesToMatch = roles.split(/\s*,\s*/);
        if (rolesToMatch.length == 0)
          return true;
        for (var i = 0; i < rolesToMatch.length; i++) {
          var r = rolesToMatch[i];
          if (r && this.hasRole(r, includeDefaults))
            return true;
        }
        return false;
      },
      getFullName: function() {
        return this.fullName;
      },
      getUserName: function() {
        return this.userName;
      },
      getUserID: function() {
        return this.userID;
      },
      getDepartmentID: function() {
        return this.departmentID;
      },
      setFullName: function(fn) {
        this.fullName = fn;
      },
      getRoles: function(includeDefaults) {
        if (includeDefaults)
          return this.allRoles;
        return this.roles;
      }