var LabelUpdate = Class.create();

LabelUpdate.prototype = {
    initialize: function() {
    },
	
	/*
	 * Assign all tags from a group to a specific user
	 */
	addGroupLabelsToUser: function(group, user) {
		var groupLabels = new GlideRecord('label_group_m2m');
		groupLabels.addQuery('group', group.sys_id);
		groupLabels.query();
		while (groupLabels.next()) {
			var userLabel = new GlideRecord('label_user_m2m');
			userLabel.label = groupLabels.label;
			userLabel.user = user.sys_id;
			userLabel.granted_by = group.sys_id;
			userLabel.insert();
		}
	},
	
	/*
	 * Remove all tags that the user inherited from the group
	 */
	removeGroupLabelsFromUser: function(group, user) {
		var labelsToDelete = new GlideRecord('label_user_m2m');
		labelsToDelete.addQuery('granted_by', group.sys_id);
		labelsToDelete.addQuery('user', user.sys_id);
		labelsToDelete.query();
		if (labelsToDelete.hasNext())
		    labelsToDelete.deleteMultiple();
	},
	
	/*
	 * Add tags from source group to the target group
	 */
	addGroupLabelsToGroup: function(targetGroup, sourceGroup) {
		var sourceLabels = new GlideRecord('label_group_m2m');
		sourceLabels.addQuery('group', sourceGroup.sys_id);
		sourceLabels.query();
		while (sourceLabels.next()) {
			var newTargetLabel = new GlideRecord('label_group_m2m');
			newTargetLabel.label = sourceLabels.label;
			newTargetLabel.granted_by = sourceGroup.sys_id;
			newTargetLabel.group = targetGroup.sys_id;
			newTargetLabel.insert();
		}
	},
	
	/*
	 * Remove all tags that the target group inherited from the source group
	 */
	removeGroupLabelsFromGroup: function(targetGroup, sourceGroup) {
		var parentLabels = new GlideRecord('label_group_m2m');
		parentLabels.addQuery('granted_by', sourceGroup.sys_id);
		parentLabels.addQuery('group', targetGroup.sys_id);
		parentLabels.deleteMultiple();
	},
	
	/*
	 * Add the given group tag to the all the members of that group
	 */
	addGroupLabelToMembers: function(groupLabel) {
		var members = new GlideRecord('sys_user_grmember'); 
		members.addQuery('group', groupLabel.group);
		members.query(); 
		while (members.next()) {
			var memberLabel = new GlideRecord('label_user_m2m');
			memberLabel.label = groupLabel.label;
			memberLabel.user = members.user;
			memberLabel.granted_by = groupLabel.group;
			memberLabel.insert();
		}
	},
	
	/*
	 * Remove all user tags that the members inherited from the given group tag
	 */
	removeGroupLabelFromMembers: function(groupLabel) {
		var memberLabels = new GlideRecord('label_user_m2m');
		memberLabels.addQuery('granted_by', groupLabel.group);
		memberLabels.addQuery('label', groupLabel.label);
		memberLabels.query();
		if (memberLabels.hasNext())
		    memberLabels.deleteMultiple();
	},
	
	/*
	 * Add the given group tag to all the child groups
	 */
	addGroupLabelToChildren: function(groupLabel) {
		var children = new GlideRecord('sys_user_group'); 
		children.addQuery('parent', groupLabel.group);
		children.query();
		while (children.next()) {
			gs.addInfoMessage(gs.getMessage('Entitling group {0} to tag {1} through group {2}', [children.name, groupLabel.label.name, groupLabel.group.name]));
			var childLabel = new GlideRecord('label_group_m2m');
			childLabel.label = groupLabel.label;
			childLabel.group = children.sys_id;
			childLabel.granted_by = groupLabel.group;
			childLabel.insert();
		}
	},
	
	/*
	 * Remove all the group tags that the children inherited from the group tag
	 */
	removeGroupLabelFromChildren: function(groupLabel) {
		var childrenLabels = new GlideRecord('label_group_m2m');
		childrenLabels.addQuery('granted_by', groupLabel.group);
		childrenLabels.addQuery('label', groupLabel.label);
		childrenLabels.query();
		if (childrenLabels.hasNext())
		    childrenLabels.deleteMultiple();
	},
	
	checkDuplicateEntry: function (record) {
		var labelEntries = new GlideRecord('label_entry');
		labelEntries.addQuery('label', record.label);
		labelEntries.addQuery('table', record.table);
		labelEntries.addQuery('table_key', record.table_key);
		labelEntries.query();
		return labelEntries.next();
	},

	/*
	 * Update tag - users associations based on user glide list changes
	 */
	syncUserListChanges: function(changesFrom, changesTo) {
		this._syncM2MFromGlideListChanges('label_user_m2m', 'user', 'user_list', changesFrom, changesTo);						 
	},

	/*
	 * Update tag - groups associations based on group glide list changes
	 */
	syncGroupListChanges: function(changesFrom, changesTo) {
		this._syncM2MFromGlideListChanges('label_group_m2m', 'group', 'group_list', changesFrom, changesTo);						 
	},

	/*
	 * Update the m2m backing a given glide list
	 */
	_syncM2MFromGlideListChanges: function(m2mTable, m2mField, labelField, changesFrom, changesTo) {
		// retrieve the old and new lists of associated records
		var newListString = (changesTo != null && changesTo.getValue(labelField) != null) ? changesTo.getValue(labelField).toString() : '';
		var newList = newListString.split(',');
		var oldListString = (changesFrom != null && changesFrom.getValue(labelField) != null) ? changesFrom.getValue(labelField).toString() : '';
		var oldList = oldListString.split(',');
		
		// add new direct associations (with uniqueness guarantee)
		for (var i = 0; i < newList.length; i++) {
			if (oldListString.indexOf(newList[i]) == -1) {
				var m2m = new GlideRecord(m2mTable);
				m2m.addQuery('granted_by', '');
				m2m.addQuery(m2mField, newList[i]);
				m2m.addQuery('label', changesTo.sys_id);
				m2m.query();
				if (!m2m.hasNext()) {
					m2m.initialize();
					m2m.setValue(m2mField, newList[i]);
					m2m.label = changesTo.sys_id;
					m2m.granted_by = '';
					m2m.insert();
				}
			}
		}
		
		// remove obsolete associations				  
		for (var i = 0; i < oldList.length; i++) {
			if (newListString.indexOf(oldList[i]) == -1) {
				var m2m = new GlideRecord(m2mTable);
				m2m.addQuery('granted_by', '');
				m2m.addQuery(m2mField, oldList[i]);
				m2m.addQuery('label', changesTo.sys_id);
				m2m.query();
				if (m2m.hasNext())
					m2m.deleteMultiple();
			}
		}
	},

	/*
	 * Update users glide list based on tag - user associations removal
	 */
	syncUserLabelRemovalFromM2M: function(m2mUserLabel) {
		var label = new GlideRecord('label');
		if (label.get(m2mUserLabel.label)) {
			var users = label.user_list.toString();
			var user = m2mUserLabel.user.toString();
			if (users.indexOf(user) != -1) {
				users = users.replace(user, '');
				label.user_list.setValue(users);
				label.update();
			}
		}
	},

	/*
	 * Update users glide list based on tag - user associations addition
	 */
	syncUserLabelAdditionFromM2M: function(m2mUserLabel) {
		var label = new GlideRecord('label');
		if (label.get(m2mUserLabel.label)) {
			var update = false;
			if (label.viewable_by == 'me') {
				label.viewable_by = 'groups and users';
				update = true;
			}
		
			var users = label.user_list.toString();
			var user = m2mUserLabel.user.toString();
			if (users.indexOf(user) == -1) {
				if (users != '')
					users += ',';
				users += user;
				label.user_list.setValue(users);
				update = true;
			}

			if (update)
				label.update();
		}
	},

	/*
	 * Update groups glide list based on tag - group associations removal
	 */
	syncGroupLabelRemovalFromM2M: function(m2mGroupLabel) {
		var label = new GlideRecord('label');
		if (label.get(m2mGroupLabel.label)) {
			var groups = label.group_list.toString();
			var group = m2mGroupLabel.group.toString();
			if (groups.indexOf(group) != -1) {
				groups = groups.replace(group, '');
				label.group_list.setValue(groups);
				label.update();
			}
		}
	},

	/*
	 * Update groups glide list based on tag - group associations addition
	 */
	syncGroupLabelAdditionFromM2M: function(m2mGroupLabel) {
		var label = new GlideRecord('label');
		if (label.get(m2mGroupLabel.label)) {
			var update = false;
			if (label.viewable_by == 'me') {
				label.viewable_by = 'groups and users';
				update = true;
			}

			var groups = label.group_list.toString();
			var group = m2mGroupLabel.group.toString();
			if (groups.indexOf(group) == -1) {
				if (groups != '')
					groups += ',';
				groups += group;
				label.group_list.setValue(groups);
				update = true;
			}

			if (update)
				label.update();
		}
	},
	
	isVisible: function(id, userId) {
      var labelID = id;
      if (!labelID)
         return false;
	  gs.log(id + ' | ' + userId);
      var gr = new GlideRecord('label');
      gr.addQuery('sys_id', labelID);
	  var qc = gr.addQuery('owner', userId);
	  qc.addOrCondition('global', 'true');
      gr.query();
	  if (gr.next()) {
		  gs.log("found in label table");
		 return true;
	  }
	  gr = new GlideRecord('label_user_m2m');
	  gr.addQuery('label', labelID);
	  gr.addQuery('user', userId);
	  if (gr.next()) {
		  gs.log("found in m2m");
		 return true;
	  }
	  gs.log("not found");
	  return false;
   },

    type: 'LabelUpdate'
};