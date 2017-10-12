/*! RESOURCE: /scripts/sn/common/clientScript/glideUser.js */
(function(exports, undefined) {
  'use strict';
  var ROLE_MAINT = 'maint';
  var ROLE_ADMIN = 'admin';

  function GlideUser(fields) {
    if (!(this instanceof GlideUser)) {
      return new GlideUser(fields);
    }
    var _firstName = fields.firstName || null;
    var _lastName = fields.lastName || null;
    var _userName = fields.userName || null;
    var _userId = fields.userID || null;
    var _roles = fields.roles || null;
    var _allRoles = fields.allRoles || null;
    var _email = fields.email || null;
    var _title = fields.title || null;
    var _avatar = fields.avatar || null;
    var _clientData = fields.clientData || {};
    Object.defineProperties(this, {
      firstName: {
        get: function() {
          return _firstName;
        }
      },
      lastName: {
        get: function() {
          return _lastName;
        }
      },
      userName: {
        get: function() {
          return _userName;
        }
      },
      userID: {
        get: function() {
          return _userId;
        }
      },
      title: {
        get: function() {
          return _title;
        }
      },
      email: {
        get: function() {
          return _email;
        }
      },
      avatar: {
        get: function() {
          return _avatar;
        }
      }
    });
    this.getFullName = function() {
      return _firstName + ' ' + _lastName;
    };
    this.getClientData = function(key) {
      return _clientData[key];
    };
    this.hasRoles = function(includeDefaults) {
      if (includeDefaults)
        return _allRoles && (_allRoles.length > 0);
      else
        return _roles && (_roles.length > 0);
    };
    this.hasRoleExactly = function(role, includeDefaults) {
      if (!this.hasRoles(includeDefaults) || !role || (typeof role !== 'string')) {
        return false;
      }
      var normalizedRole = role.toLowerCase();
      var rolesToCheck = _roles;
      if (includeDefaults)
        rolesToCheck = _allRoles;
      for (var i = 0, iM = rolesToCheck.length; i < iM; i++) {
        if (normalizedRole === rolesToCheck[i].toLowerCase()) {
          return true;
        }
      }
      return false;
    };
    this.hasRole = function(role, includeDefaults) {
      if (!this.hasRoles(includeDefaults)) {
        return false;
      }
      if (this.hasRoleExactly(ROLE_MAINT, includeDefaults)) {
        return true;
      } else if (role === ROLE_MAINT) {
        return false;
      }
      if (this.hasRoleExactly(role, includeDefaults)) {
        return true;
      }
      if (this.hasRoleExactly(ROLE_ADMIN, includeDefaults)) {
        return true;
      }
      return false;
    };
    this.hasRoleFromList = function(roles, includeDefaults) {
      if (!this.hasRoles(includeDefaults)) {
        return false;
      }
      var checkRoles = roles;
      if (typeof roles === 'string') {
        checkRoles = roles.split(/\s*,\s*/);
      }
      if (checkRoles.length === 0) {
        return true;
      }
      for (var i = 0, iM = checkRoles.length; i < iM; i++) {
        var role = checkRoles[i];
        if (role && this.hasRole(role, includeDefaults)) {
          return true;
        }
      }
      return false;
    };
    this.clone = function() {
      return new GlideUser(fields);
    };
  }
  exports.GlideUser = GlideUser;
})(window);;