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
  },
  getAvailableElevatedRoles: function() {
    return this.elevatedRoles;
  },
  setRoles: function(r, includeDefaults) {
    if (includeDefaults) {
      if (r)
        this.allRoles = r.split(/\s*,\s*/);
      else
        this.allRoles = new Array();
    } else {
      if (r)
        this.roles = r.split(/\s*,\s*/);
      else
        this.roles = new Array();
    }
  },
  setElevatedRoles: function(r) {
    if (r)
      this.elevatedRoles = r.split(/\s*,\s*/);
    else
      this.elevatedRoles = new Array();
  },
  setActiveElevatedRoles: function(r) {
    if (r)
      this.activeElevatedRoles = r.split(/\s*,\s*/);
    else
      this.activeElevatedRoles = new Array();
  },
  getActiveElevatedRoles: function() {
    return this.activeElevatedRoles;
  },
  setDomain: function(d) {
    this.domain = d;
  },
  getPreference: function(n) {
    return this.preferences[n];
  },
  setPreference: function(n, v) {
    this.preferences[n] = v;
  },
  deletePreference: function(n) {
    delete this.preferences[n];
  },
  getClientData: function(n) {
    return this.clientData[n];
  },
  setClientData: function(n, v) {
    this.clientData[n] = v;
  },
  setBannerImage: function(s) {
    this.bannerImage = s;
  },
  getBannerImage: function() {
    return this.bannerImage;
  },
  setBannerText: function(s) {
    this.bannerText = s;
  },
  getBannerText: function() {
    return this.bannerText;
  },
  setHomePages: function(s) {
    this.homePages = s;
  },
  getHomePages: function() {
    return this.homePages;
  },
  type: "GlideUser"
});;