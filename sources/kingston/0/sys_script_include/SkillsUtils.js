var SkillsUtils = Class.create();

SkillsUtils.prototype = {

	/**
	 * build assigned_to reference qualifier using task assignment group and skills
	 * @param GlideRecord task
	 * @return String reference qualifier query for sys_user
	 * usage: javascript:var util = new SkillsUtils(); util.assignedToRefQual(current, "roles=itil");
	 */
	assignedToRefQual: function(/*GlideRecord*/task, defaultQual) {
		if (JSUtil.nil(defaultQual))
		   defaultQual = "";

		var skills = task.skills.split(",");
		var group = task.assignment_group;
		if (skills && skills != "") {
			var hasSkills = true;
			var allSkilledUserIds = this.getAllSkilledUserIds(skills);
		}

		if (group && group != "") {
			var hasGroup = true;
			var groupUsers = this._getMembers(group);
		}

		//no inputs to use, return default query
		if (!hasSkills && !hasGroup)
			return defaultQual;

		//group but no skills specified, return group members
		if (hasGroup && !hasSkills) {
			var groupUserList = [];
			while (groupUsers.next())
				groupUserList.push(groupUsers.getUniqueValue());

			return "sys_idIN" + groupUserList.toString();
		}

		//skills but no group specified, return skilled users
		if (!hasGroup && hasSkills) {
			return "sys_idIN" + allSkilledUserIds.toString();
		}

		//only thing left is to process both the group and skills
		var skilledMemberList = [];
		while (groupUsers.next()) {
			//is user in list of all skilled users
			var au = new ArrayUtil();
			if (au.contains(allSkilledUserIds, groupUsers.getUniqueValue()))
				skilledMemberList.push(groupUsers.getUniqueValue());
		}
		return "sys_idIN" + skilledMemberList.toString();

	},

	/**
	 * qualify assignment groups with those with all required skills
	 * usage: javascript:var util = new SkillsUtils(); util.assignmentGroupRefQual(current);
	 */
	assignmentGroupRefQual: function(/*GlideRecord*/ task) {
		var skills = task.skills.split(",");
		if (JSUtil.nil(skills))
			return "type=null";  //default qualifier

		var allSkilledGroupIds = this.getAllSkilledGroupIds(skills);
		return "sys_idIN" + allSkilledGroupIds;
	},


	/**
	 * get all group with all skills
	 * @param Array skills
	 * @return Array group sys_id
	 */
	getAllSkilledGroupIds: function(/*Array*/skills) {
			//how many skills do we need
		var skillsCount = skills.length;
		var groupIds = new Object();
		for (var i = 0; i < skills.length; i++) {
			var groupsProcessed = new Object();
			var gr = new GlideRecord("sys_group_has_skill");
			gr.addQuery("skill", skills[i]);
			gr.query();
			while (gr.next()) {
				//only process if this isn't a duplicate
				if (!groupsProcessed[gr.group]) {
					if (!groupIds[gr.group])
						groupIds[gr.group] = 1;
					else
						groupIds[gr.group] += 1;

					//don't process this group/skill again if duplicate
					groupsProcessed[gr.group] = true;
				}
			}
			//clear temp tracking object
			usersProcessed = null;
		}

		var skilledGroups = [];
		for (group in groupIds) {
			if (groupIds[group] == skillsCount)
				skilledGroups.push(group);
		}

		return skilledGroups;
	},

	/**
	 * get all users with all skills
	 * @param Array skills
	 * @return Array user sys_id
	 */
	getAllSkilledUserIds: function(/*Array*/skills) {
		//how many skills do we need
		var skillsCount = skills.length;
		var userIds = new Object();
		for (var i = 0; i < skills.length; i++) {
			var usersProcessed = new Object();
			var gr = new GlideRecord("sys_user_has_skill");
			gr.addQuery("skill", skills[i]);
			gr.query();
			while (gr.next()) {
				//only process if this isn't a duplicate
				if (!usersProcessed[gr.user]) {
					if (!userIds[gr.user])
						userIds[gr.user] = 1;
					else
						userIds[gr.user] += 1;

					//don't process this user/skill again if duplicate
					usersProcessed[gr.user] = true;
				}
			}
			//clear temp tracking object
			usersProcessed = null;
		}

		var skilledUsers = [];
		for (user in userIds) {
			if (userIds[user] == skillsCount)
				skilledUsers.push(user);
		}

		return skilledUsers;
	},

	_getMembers: function(/*String*/groupID) {
		var gr = new GlideRecord("sys_user_grmember");
		gr.addQuery("group", groupID);
		gr.query();
		var members = [];
		while (gr.next()) {
			members.push(gr.user.sys_id.toString());
		}

		//get active user records
		var users = new GlideRecord("sys_user");
		users.addActiveQuery();
		users.addQuery("sys_id", members);
		users.query();
		return users;
	},

	type: "SkillsUtils"
}