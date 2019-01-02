gs.include("PrototypeServer");

var SkillManager = Class.create();

SkillManager.prototype = {
	initialize: function() {
	},
	
	addInheritedSkills: function(/* GlideRecord */ groupSkill) {
		var members = GlideUserGroup.getMembers(groupSkill.group);
		while (members.next()) {
			gs.addInfoMessage("Granting skill to: " + members.user.name);
			var skill = new GlideRecord('sys_user_has_skill');
			skill.initialize();
			skill.user = members.user;
			skill.skill = groupSkill.skill;
			skill.inherited = groupSkill.inherits;
			skill.inherited_from = groupSkill.group;
			skill.insert();
		}
		this.addInheritedToGroups(groupSkill);
	},
	
	addInheritedToGroups: function(/* GlideRecord */ groupSkill) {
		var children = new GlideRecord('sys_user_group');
		children.addQuery('parent', groupSkill.group);
		children.query();
		while (children.next()) {
			gs.addInfoMessage("Granting skill to group: " + children.name);
			var c = new GlideRecord('sys_group_has_skill');
			c.initialize();
			c.group = children.sys_id;
			c.inherited_from = groupSkill.group;
			c.inherits = groupSkill.inherits;
			c.skill = groupSkill.skill;
			c.insert();
		}
	},
	
	deleteInheritedSkills: function(/* GlideRecord */ groupSkill) {
		var gr = new GlideRecord('sys_user_has_skill');
		gr.initialize();
		gr.addQuery('inherited_from', groupSkill.group);
		gr.addQuery('skill', groupSkill.skill);
		gr.addQuery('inherited', true);
		gr.deleteMultiple();
		gs.addInfoMessage('Delete user inherited skill: ' + groupSkill.skill.name + ', from group: ' + groupSkill.group.name);
		this.deleteInheritedFromGroups(groupSkill);
	},
	
	deleteInheritedFromGroups: function(/* GlideRecord */ groupSkill) {
		var gr = new GlideRecord('sys_group_has_skill');
		gr.initialize();
		gr.addQuery('inherited_from', groupSkill.group);
		gr.addQuery('skill', groupSkill.skill);
		gr.addQuery('inherited', true);
		gr.deleteMultiple();
		gs.addInfoMessage('Delete inherited skill: ' + groupSkill.skill.name + ', group: ' + groupSkill.group.name);
		
	},
	
	deleteAllSkills: function(/* GlideRecord */ groupSkill) {
		var gr = new GlideRecord('sys_user_has_skill');
		gr.initialize();
		gr.addQuery('inherited_from', groupSkill.group);
		gr.addQuery('skill', groupSkill.skill);
		gr.deleteMultiple();
		gs.addInfoMessage('Delete all user skills: ' + groupSkill.skill.name + ', group: ' + groupSkill.group.name);
	},
	
	// when sys_user_group.parent changes
	removeGroupSkillsFromChild: function(/* String */ parent, /* String */ child) {
		var gr = new GlideRecord('sys_group_has_skill');
		gr.addQuery('group', child);
		gr.addQuery('inherited_from', parent);
		gr.deleteMultiple();
	},
	
	// adds all inherited group skills to a child group
	// when sys_user_group.parent changes
	addGroupSkillsToChild: function(/* String */ parent, /* String */ child) {
		var parentSkills = new GlideRecord('sys_group_has_skill');
		parentSkills.addQuery('group', parent);
		parentSkills.addQuery('inherits', true);
		parentSkills.query();
		while (parentSkills.next()) {
			var c = new GlideRecord('sys_group_has_skill');
			c.initialize();
			c.group = child;
			c.inherited_from = parent;
			c.inherits = parentSkills.inherits;
			c.skill = parentSkills.skill;
			c.insert();
		}
	},
	
	// Support for included skills from here down
	
	/* Called when a skill is added to another skill e.g. we say "DBA now includes MySQL DBA"
 	*/
	addIncludedSkill: function(/* GlideRecord */ inclusion) {
		var master = inclusion.skill;
		var contains = inclusion.contains;
		var expand = new GlideRecord('sys_user_has_skill');
		expand.addQuery('skill', master);
		expand.query();
		while (expand.next()) {
			gs.addInfoMessage('Adding Skill ' + inclusion.contains.name + ' to ' + expand.user.name);
			var newSkill = new GlideRecord('sys_user_has_skill');
			newSkill.initialize();
			newSkill.user = expand.user;
			newSkill.skill = contains;
			newSkill.inherited_from = expand.inherited_from;
			newSkill.inherited = true;
			newSkill.included_in_skill = expand.sys_id;
			newSkill.included_in_skill_instance = inclusion.sys_id;
			newSkill.insert();
		}
	},
	
	/* Called when a skill is removed from another skill e.g. we say "Network now no longer includes Network wiring"
 	*/
	removeIncludedSkill: function(/* GlideRecord */ inclusion) {
		var expand = new GlideRecord('sys_user_has_skill');
		expand.addQuery('included_in_skill_instance', inclusion.sys_id);
		expand.query();
		while (expand.next()) {
			gs.addInfoMessage('Removing Skill ' + inclusion.contains.name + ' from ' + expand.user.name);
			expand.deleteRecord();
		}
	},
	
	/* Called when a skill is added to the sys_user_has_skill table.
	Responsible for expanding (adding) any skills contained within the skill in question
	Exception: skills that the user already had and were not inherited from another skill are not added
 	*/
	expandSkill: function(/* GlideRecord */ sys_user_has_skill) {
		var topLevel = false;
		if (typeof SKILL_HASH == 'undefined' || SKILL_HASH == null) {
			topLevel = true;
			SKILL_HASH = new Object();
		}
		var key = sys_user_has_skill.skill + '';
		SKILL_HASH[key] = true;
		var expansion = new GlideRecord('cmn_skill_contains');
		expansion.addQuery('skill', sys_user_has_skill.skill);
		expansion.query();
		while (expansion.next()) {
			var childkey = expansion.contains + '';
			if (SKILL_HASH[childkey])
				continue;
			
			var genuineSkill = new GlideRecord('sys_user_has_skill');
			genuineSkill.addQuery('user', sys_user_has_skill.user);
			genuineSkill.addQuery('skill', childkey);
			genuineSkill.addQuery('included_in_skill', '');
			genuineSkill.query();
			if (genuineSkill.next())
				continue;
			
			gs.addInfoMessage('Adding skill ' + expansion.contains.name + ' to ' + sys_user_has_skill.user.name);
			var newSkill = new GlideRecord('sys_user_has_skill');
			newSkill.initialize();
			newSkill.user = sys_user_has_skill.user;
			newSkill.skill = expansion.contains;
			newSkill.inherited = true;
			newSkill.inherited_from = sys_user_has_skill.inherited_from;
			newSkill.included_in_skill = sys_user_has_skill.sys_id;
			newSkill.included_in_skill_instance = expansion.sys_id;
			newSkill.insert();
		}
		if (topLevel)
			SKILL_HASH = null;
	},
	
	/* Called when a skill is deleted from the sys_user_has_skill table.
	Responsible for removing any skills that were added on account of this skill.
	For example, if DBA contains MYSQL DBA and we grant DBA to Alex B
	Alex now has DBA and MYSQL DBA
	If we remove DBA from Alex, he has to lose MYSQL as well
 	*/
	deleteSkill: function(/* GlideRecord */ sys_user_has_skill) {
		var kids = new GlideRecord('sys_user_has_skill');
		kids.addQuery('included_in_skill', sys_user_has_skill.sys_id);
		kids.query();
		while (kids.next()) {
			gs.addInfoMessage('Removing skill ' + kids.skill.name + ' from ' + kids.user.name);
			kids.deleteRecord();
		}
	},
	
	z: function() {}
};