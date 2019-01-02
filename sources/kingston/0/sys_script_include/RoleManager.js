gs.include("PrototypeServer");

var RoleManager = Class.create();

RoleManager.prototype = {
  initialize: function() {
  },

  shouldUseInhCount: function() {
  	return GlideProperties.getBoolean('glide.role_management.use.inh_count', false) && pm.isActive('com.glide.role_management.inh_count');
  },

  addInheritedRoles: function(/* GlideRecord */ groupRole) {
    this.addInheritedToGroups(groupRole); 
    if (this.shouldUseInhCount())
 	  return;
    var ug = new GlideUserGroup(); 
    var members = ug.getMembers(groupRole.group);
    while (members.next()) {
	  if (!GlideUtil.isExpressInstance())
		  gs.addInfoMessage(gs.getMessage("Granting role to") + ": " + members.user.name);
	
      var role = new GlideRecord('sys_user_has_role'); 
      role.initialize();
      role.user = members.user; 
      role.role = groupRole.role; 
      role.inherited = groupRole.inherits;
      role.granted_by = groupRole.group; 
      role.insert();
    }    
  },

  addInheritedToGroups: function(/* GlideRecord */ groupRole) {
    var children = new GlideRecord('sys_user_group'); 
    children.addQuery('parent', groupRole.group);
    children.query(); 
    while (children.next()) {
      gs.addInfoMessage(gs.getMessage("Granting role to group") + ": " + children.name);
		
      var c = new GlideRecord('sys_group_has_role'); 
      c.initialize();
      c.group = children.sys_id;
      c.granted_by = groupRole.group;
      c.inherits = groupRole.inherits;
      c.role = groupRole.role; 
      c.insert();  
    }
  },

  deleteInheritedRoles: function(/* GlideRecord */ groupRole) {
	this.deleteInheritedFromGroups(groupRole); 
    if (this.shouldUseInhCount())
 	  return;
    var gr = new GlideRecord('sys_user_has_role');
    gr.initialize();
    gr.addQuery('granted_by', groupRole.group);
    gr.addQuery('role', groupRole.role);
    gr.addQuery('inherited', true);
    gr.deleteMultiple();
    var msgArray = new Array();
    msgArray.push(groupRole.role.name + "");
    msgArray.push(groupRole.group.name + "");
    if (!GlideUtil.isExpressInstance())
		gs.addInfoMessage(gs.getMessage('Delete user inherited role: {0}, from group: {1}', msgArray));
  },

  deleteInheritedFromGroups: function(/* GlideRecord */ groupRole) {
    var gr = new GlideRecord('sys_group_has_role');
    gr.initialize();
    gr.addQuery('granted_by', groupRole.group);
    gr.addQuery('role', groupRole.role);
    gr.deleteMultiple();
    var msgArray = new Array();
    msgArray.push(groupRole.role.name + "");
    msgArray.push(groupRole.group.name + "");
    gs.addInfoMessage(gs.getMessage('Delete inherited role: {0}, group: {1}', msgArray));
  },

  deleteAllRoles: function(/* GlideRecord */ groupRole) {
    if (this.shouldUseInhCount())
 	  return;
    var gr = new GlideRecord('sys_user_has_role');
    gr.initialize();
    gr.addQuery('granted_by', groupRole.group);
    gr.addQuery('role', groupRole.role);
    gr.addQuery('inherited', true);
    gr.deleteMultiple();
    var msgArray = new Array();
    msgArray.push(groupRole.role.name + "");
    msgArray.push(groupRole.group.name + "");
    gs.addInfoMessage(gs.getMessage('Delete all user roles: {0}, group: {1}', msgArray));
  },

// when sys_user_group.parent changes
removeGroupRolesFromChild: function(/* String */ parent, /* String */ child) {
  var gr = new GlideRecord('sys_group_has_role'); 
  gr.addQuery('group', child); 
  gr.addQuery('granted_by', parent); 
  gr.deleteMultiple(); 
},

// adds all inherited group roles to a child group
// when sys_user_group.parent changes
addGroupRolesToChild: function(/* String */ parent, /* String */ child) {
  var parentRoles = new GlideRecord('sys_group_has_role'); 
  parentRoles.addQuery('group', parent); 
  parentRoles.addQuery('inherits', true); 
  parentRoles.query(); 
  while (parentRoles.next()) {
     var c = new GlideRecord('sys_group_has_role'); 
     c.initialize();
     c.group = child;
     c.granted_by = parent;
     c.inherits = parentRoles.inherits;
     c.role = parentRoles.role; 
     c.insert();  
  }
},
  
// Support for included roles from here down


/* Called when a role is added to another role e.g. we say "itil now includes gauge_maker"
*/
addIncludedRole: function(/* GlideRecord */ inclusion) {
    if (this.shouldUseInhCount())
 	  return;
    var master = inclusion.role;
    var contains = inclusion.contains;
    var expand = new GlideRecord('sys_user_has_role');
    expand.addQuery('role', master);
    expand.query();
    while (expand.next()) {
       var msgArray = new Array();
       msgArray.push(inclusion.contains.name + "");
       msgArray.push(expand.user.name + "");
     if (!GlideUtil.isExpressInstance())
       gs.addInfoMessage(gs.getMessage('Adding Role {0} to {1}', msgArray));
		
     var newRole = new GlideRecord('sys_user_has_role');
     newRole.initialize();
     newRole.user = expand.user;
     newRole.role = contains;
     newRole.granted_by = expand.granted_by;
     newRole.inherited = true;
     newRole.included_in_role = expand.sys_id;
     newRole.included_in_role_instance = inclusion.sys_id;
     newRole.insert();
    }
},

/* Called when a role is removed from another role e.g. we say "itil now no longer includes gauge maker"
*/
removeIncludedRole: function(/* GlideRecord */ inclusion) {
    if (this.shouldUseInhCount())
 	  return;
    var expand = new GlideRecord('sys_user_has_role');
    expand.addQuery('included_in_role_instance', inclusion.sys_id);
    expand.addQuery('inherited', true);
    expand.query();
    while (expand.next()) {
       var msgArray = new Array();
       msgArray.push(inclusion.contains.name + "");
       msgArray.push(expand.user.name + "");
       if (!GlideUtil.isExpressInstance())
         gs.addInfoMessage(gs.getMessage('Removing Role {0} from {1}', msgArray));
		
       expand.deleteRecord();
    }
},
    
/* Called when a role is added to the sys_user_has_role table.
   Responsible for expanding (adding) any roles contained within the role in question
*/ 
expandRole: function(/* GlideRecord */ sys_user_has_role) {
   if (this.shouldUseInhCount())
 	  return;
   var topLevel = false;
   if (typeof isTopLevelObj == 'undefined' || isTopLevelObj == null) {
      topLevel = true;
      isTopLevelObj = new Object();
	  var cyclicRoleList = new GlideUserHasRoleInhCountFixer().findCyclicRoleNames(sys_user_has_role.role + '');
	  if (!cyclicRoleList.isEmpty()) {
		  var cyclicErrorMsg = gs.getMessage("Because cyclic containership was found, skipped adding contained roles. The following cyclic role containership needs to be fixed: {0}", GlideStringUtil.join(cyclicRoleList));
		  gs.addErrorMessage(cyclicErrorMsg);
		  return;
	  }
   }

   var user = sys_user_has_role.user;
   var expansion = new GlideRecord('sys_user_role_contains');
   expansion.addQuery('role', sys_user_has_role.role);
   expansion.query();
   while (expansion.next()) {
      var msgArray = new Array();
      msgArray.push(expansion.contains.name + "");
      msgArray.push(user.name + "");
	  if (!GlideUtil.isExpressInstance())
		  gs.addInfoMessage(gs.getMessage('Adding role {0} to {1}', msgArray));
      var newRole = new GlideRecord('sys_user_has_role');
      newRole.initialize();
      newRole.user = sys_user_has_role.user;
      newRole.role = expansion.contains;
      newRole.inherited = true;
      newRole.granted_by = sys_user_has_role.granted_by;
      newRole.included_in_role = sys_user_has_role.sys_id;
      newRole.included_in_role_instance = expansion.sys_id;
      newRole.insert();
   }
   if (topLevel)
       isTopLevelObj = null;
},

/* Called when a role is deleted from the sys_user_has_role_table.
   Responsibile for removing any roles that were added on account of this role.
   For example, if itil contains gauge_maker and we grant itil to Bow Ruggerri
   Bow now has itil and gauge_maker
   If we remove itil from Bow, he has to lose gauge_maker as well
*/
deleteRole: function(/* GlideRecord */ sys_user_has_role) {
   if (this.shouldUseInhCount())
 	 return;
   try {
     if (sys_user_has_role.sys_id.isNil())
        return;
   } catch (e) {
      return;
   }
   var kids = new GlideRecord('sys_user_has_role');
   kids.addQuery('included_in_role', sys_user_has_role.sys_id);
   kids.addQuery('inherited', true);
   kids.query();
   while (kids.next()) {
      var msgArray = new Array();
      msgArray.push(kids.role.name + "");
      msgArray.push(kids.user.name + "");
      if (!GlideUtil.isExpressInstance())
		  gs.addInfoMessage(gs.getMessage('Removing role {0} from {1}', msgArray));
	   
      kids.deleteRecord();
   }
},

z: function() {}
}


