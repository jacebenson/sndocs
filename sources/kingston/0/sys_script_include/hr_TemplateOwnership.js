var hr_TemplateOwnership = Class.create();
hr_TemplateOwnership.prototype = {
    initialize: function() {
    },
	
	canCreateTemplate: function(template) {
		var roles = gs.getUser().getRoles();
		// if a life cycle admin, can edit regardless of owning group
		var isHrAdmin = roles.indexOf('sn_hr_core.admin') > -1;
		if (isHrAdmin)
			return true;
		
		var isActivityWriter = roles.indexOf('sn_hr_le.activity_writer') > -1;
		return isActivityWriter;
	},
	
	canEditTemplate: function(template) {
		var roles = gs.getUser().getRoles();
		// if a life cycle admin, can edit regardless of owning group
		var isHrAdmin = roles.indexOf('sn_hr_core.admin') > -1;
		if (isHrAdmin)
			return true;
		
		// if not an activity writer, then cannot edit, regardless of owning group
		var isActivityWriter = roles.indexOf('sn_hr_le.activity_writer') > -1;
		if (!isActivityWriter)
			return false;
		
		// has activity writer, but must be in group too
		if (template.owning_group) {
			var grGroups = new GlideRecord('sys_user_grmember');
			grGroups.addQuery('user', gs.getUserID());
			grGroups.addQuery('group', template.getValue('owning_group'));
			grGroups.query();
			var isMemberOf = grGroups.next();
			return isMemberOf;
		} 
		
		return template.isNewRecord();
	},
	
	getAllowableGroups : function() {
		var groups = [];
		// if has role sn_hr_core.admin, return all active groups
		// otherwise return groups that user is a direct member of
		var roles = gs.getUser().getRoles();
		var isHrAdmin = roles.indexOf('sn_hr_core.admin') > -1;
		
		if (isHrAdmin) 
			return 'active=true';
		
		var grGroupMember = new GlideRecord('sys_user_grmember');
		grGroupMember.addQuery('group.active', true);
		grGroupMember.addQuery('user', gs.getUserID());
		grGroupMember.query();
		while (grGroupMember.next())
			groups.push(grGroupMember.getValue('group'));
		
		return 'sys_idIN' + groups.join(',');
	},

    type: 'hr_TemplateOwnership'
};