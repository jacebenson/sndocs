var hr_AssignmentUtil = Class.create();
hr_AssignmentUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	// First see if the hr case assignee has the skills required by the task  and is in the assignment group set on the task, and if so, assign to the same person. 
	getAgentsForHrTaskByCountryAndSkills: function(taskRecord) {
		//Verify recordGr is a gliderecord, and extends task
        if (!(taskRecord instanceof GlideRecord) || !taskRecord.canRead() || new GlideTableHierarchy(taskRecord.getRecordClassName()).getTables().indexOf('sn_hr_core_task') == -1)
            return [];
		var ids = this.getAgentsByCountryAndSkillsOrderLeastLoaded(taskRecord);
		// if the parent case is assigned, see if that person is in our list and pop them to the front if so
		if (!gs.nil(taskRecord.parent)) {
			var parentAgent = taskRecord.parent.assigned_to;
			ids = this._prioritizeAgent(parentAgent, ids);
		}
		return ids;
	},
	
	getAgentsForHrTaskBySkills: function(taskRecord) {
		//Verify recordGr is a gliderecord, and extends task
        if (!(taskRecord instanceof GlideRecord) || !taskRecord.canRead() || new GlideTableHierarchy(taskRecord.getRecordClassName()).getTables().indexOf('sn_hr_core_task') == -1)
            return [];
		var ids = this.getAgentsBySkillOrderLeastLoaded(taskRecord);
		// if the parent case is assigned, see if that person is in our list and pop them to the front if so
		if (!gs.nil(taskRecord.parent)) {
			var parentAgent = taskRecord.parent.assigned_to;
			ids = this._prioritizeAgent(parentAgent, ids);
		}
	},
	
	/*
	If the provided agent is in the array of agents, make the provided agent first in the array of agents. Otherwise do not modify the list.
	*/
	_prioritizeAgent: function(agent, ids) {
		if (agent) {
			agent = agent.toString();
			var idx = ids.indexOf(agent, 1); // don't bother looking at index zero as if it is already first in list we have no work to do
			if (idx > -1) {
				ids.splice(idx, 1); // remove one element at idx position
				ids.unshift(agent); // add it back at the front of the array
			}	
		}
		return ids;
	},
	
	/*
	Look for least loaded agent with desired attributes:
		In same geography (i.e., agent's country same as the 'subject_person' country)
		With the right skills
		Sorted by least loaded
	*/
	getAgentsByCountryAndSkillsOrderLeastLoaded: function(taskRecord) {
		var ids = [];
		if (!taskRecord || taskRecord.assignment_group.nil())
			return ids;

		// if no skills required for task just return agents by country
		if (taskRecord.skills.nil())
			return this.getAgentsByCountryOrderLeastLoaded(taskRecord); // handles no subject_person by returning all agents

		// if no subject person, just return agents by skill
		var subjectCountry = this._getSubjectPersonCountry(taskRecord);
		if (!subjectCountry || subjectCountry.nil())
			return this.getAgentsBySkillOrderLeastLoaded(taskRecord);

		// we have a country and skills, so need to get both and intersect
		var agentsWithSkills = this.getAgentsBySkill(taskRecord);
		var agentsWithCountry = this.getAgentsByCountry(taskRecord);

		var arrayUtil = new global.ArrayUtil();
		var agents = arrayUtil.intersect(agentsWithSkills, agentsWithCountry);
		// intersect call doesn't guarantee that it will preserve order, so want to get counts and sort at end, not intermediate steps
		ids = this._sortAgentsByLeastLoaded(agents);
		return ids;
	},

	/*
	The simplest approach -- least loaded agent in group.
	*/
	getAgentsOrderLeastLoaded: function(taskRecord) {
		var agents = this.getAgents(taskRecord);
		var ids = this._sortAgentsByLeastLoaded(agents);
		return ids;
	},

	getAgents: function(taskRecord) {
		var agents = [];
		if (!taskRecord || taskRecord.assignment_group.nil())
			return agents;

		var groupMemberGr = new GlideRecord('sys_user_grmember');
		groupMemberGr.addQuery('group', taskRecord.assignment_group);
		groupMemberGr.addNotNullQuery('user');
		groupMemberGr.query();
		while (groupMemberGr.next())
			agents.push(groupMemberGr.getValue('user'));

		return agents;
	},

	/*
	If the task requires no skills, return all agents.
	*/
	getAgentsBySkillOrderLeastLoaded: function(taskRecord) {
		var agents = this.getAgentsBySkill(taskRecord);
		var ids = this._sortAgentsByLeastLoaded(agents);
		return ids;
	},

	/*
	If the task requires no skills, return all agents.
	*/
	getAgentsBySkill: function(taskRecord) {
		var agents = [];
		if (!taskRecord || taskRecord.assignment_group.nil())
			return agents;

		var numSkills = 0;
		var splitSkills;
		if (!taskRecord.skills.nil()) {
			splitSkills = taskRecord.skills.split(',');
			numSkills = splitSkills.length;
		}

		if (numSkills == 0)
			agents = this.getAgents(taskRecord); // no skills required so get all agents
		else {
			var grGroupMember = new GlideRecord('sys_user_grmember');
			grGroupMember.addQuery('group', taskRecord.assignment_group);
			grGroupMember.addNotNullQuery('user');
			grGroupMember.query();
			if (grGroupMember.getRowCount() > 0) {
				while (grGroupMember.next()) {
					var skills = new GlideAggregate("sys_user_has_skill");
					skills.addEncodedQuery("skillIN" + splitSkills);
					skills.addQuery("user", grGroupMember.user);
					skills.addQuery('active', true);
					skills.addAggregate("COUNT(DISTINCT", "skill");
					skills.groupBy("user");
					skills.query();
					 if (skills.next()) {
						 var cnt = skills.getAggregate("COUNT(DISTINCT", "skill");
						 if (cnt == numSkills)
							 agents.push(grGroupMember.user.toString());
					 }
				}
			}
		}

		return agents;
	},

	/*
	If no country exists on the subject person location (or no location at all, or even no person at all), return all agents
	*/
	getAgentsByCountryOrderLeastLoaded: function(taskRecord) {
		var agents = this.getAgentsByCountry(taskRecord);
		var ids = this._sortAgentsByLeastLoaded(agents);
		return ids;
	},

	/*
	If no country exists on the subject person location (or no location at all, or even no person at all), return all agents
	*/
	getAgentsByCountry: function(taskRecord) {

		var agents = [];

		if (!taskRecord || taskRecord.assignment_group.nil())
			return agents;

		// probably should be using sys id for country comparison, but seems unlikely multiple countries will have same name
		var subjectCountry = this._getSubjectPersonCountry(taskRecord);  // use subject person, not opened for, per Lucinda
		if (!subjectCountry || subjectCountry.nil()) {
			// assuming that no country on the subject person user means we can return any agent, so get least loaded
			agents = this.getAgents(taskRecord);
		} else {
			var grGroupMember = new GlideRecord('sys_user_grmember');
			grGroupMember.addQuery('group', taskRecord.assignment_group);
			grGroupMember.addNotNullQuery('user.location');
			grGroupMember.query();
			while (grGroupMember.next()) {
				var locSysId = grGroupMember.user.location;
				var grLocation = new GlideRecord('cmn_location');
				if (grLocation.get(locSysId)) {
					var agentCountry = grLocation.getValue('country');
					if (agentCountry && agentCountry == subjectCountry)
						agents.push(grGroupMember.getValue('user'));
					else {
						var parentLocation = grLocation.getValue('parent');
						if (parentLocation) {
							agentCountry = grLocation.parent.country;
							if (agentCountry && agentCountry == subjectCountry)
								agents.push(grGroupMember.getValue('user').toString());
						}
					}
				}
			}
		}
		return agents;
	},

	_sortAgentsByLeastLoaded: function(agents) {
		var ids = [];
		if (gs.nil(agents))
			return [];
		try {
			var assignCount = {};
			var assignedTo;
			var caseCount;
			
			// get count of assigned cases per agent
			var count = new GlideAggregate('sn_hr_core_case');
			count.addQuery('assigned_to', 'IN', agents);
			count.addQuery('active', 'true');
			count.addAggregate('COUNT', 'assigned_to');
			count.orderByAggregate('COUNT', 'assigned_to');
			count.query();
			while (count.next()) {
				assignedTo = count.assigned_to;
				caseCount = parseInt(count.getAggregate('COUNT', 'assigned_to'));
				assignCount[assignedTo] = caseCount;
			}
			
			// now get count of assigned HR tasks per agent
			count = new GlideAggregate('sn_hr_core_task');
			count.addQuery('assigned_to', 'IN', agents);
			count.addQuery('active', 'true');
			count.addAggregate('COUNT', 'assigned_to');
			count.orderByAggregate('COUNT', 'assigned_to');
			count.query();
			while (count.next()) {
				assignedTo = count.assigned_to;
				var taskCount = parseInt(count.getAggregate('COUNT', 'assigned_to'));
				caseCount = assignCount[assignedTo];
				if (caseCount)
					taskCount = taskCount + caseCount;
				assignCount[assignedTo] = taskCount;
			}

			// The query returns only those agents with assignments. Any agents not returned are added to list with a count of zero
			var list = [];
			for (var i = 0; i  < agents.length; i++) {
				var id = agents[i];
				var obj = {'id' : id};
				var cnt = assignCount[id];
				if (!gs.nil(cnt))
					obj['value'] = cnt;
				else
					obj['value'] = 0;
				list.push(obj);
			}
			//sort the list by count
			list.sort(function (a, b) {
				if (a.value > b.value)
					return 1;
				if (a.value < b.value)
					return -1;
				return 0;
			});

			for (var index = 0; index  < list.length; index++)
				ids.push(list[index]['id']);

		} catch (err) {
			gs.error("Error in get agents by least loaded list: "+ err.message);
			ids = agents;
		}
		return ids;
	},

	_getSubjectPersonCountry: function(record) {

        var recordGr;
        if (record)
            recordGr = record;
        else {
            if (!current || gs.nil(current))
                return '';
            recordGr = current;
        }

        // Verify that recordGr is a glide record and extends task
        if (!(recordGr instanceof GlideRecord) || !recordGr.canRead() || new GlideTableHierarchy(recordGr.getRecordClassName()).getTables().indexOf('task') == -1)
            return '';

		if (recordGr.isValidField('subject_person')) {
			if (recordGr.subject_person && recordGr.subject_person.location)
				return recordGr.subject_person.location.country;
			return '';
		}

		if (gs.nil(recordGr.parent))
			return '';
		var parentGr = recordGr.parent.getRefRecord();
		if (parentGr.isValidField('subject_person')) {
			if (parentGr.subject_person && parentGr.subject_person.location)
				return parentGr.subject_person.location.country;
			return '';
		}

		return '';
	},
	
    /* Get a field from the current record or its parent
    * @param field : name of the field to retrieve
    * @param record : Optional GlideRecord to use for this method
    */
	getField: function(field, record) {
        if (gs.nil(field))
            return '';

        var recordGr;
        if (record)
            recordGr = record;
        else {
            if (!current || gs.nil(current))
                return '';
            recordGr = current;
        }

        //Verify recordGr is a gliderecord, and extends task
        if (!(recordGr instanceof GlideRecord) || !recordGr.canRead() || new GlideTableHierarchy(recordGr.getRecordClassName()).getTables().indexOf('task') == -1)
            return '';

		if (recordGr.isValidField(field)) {
			if (recordGr[field].canRead())
				return recordGr.getValue(field);
			return '';
		}

		if (gs.nil(recordGr.parent))
			return '';
		var parentGr = recordGr.parent.getRefRecord();
		if (parentGr.isValidField(field)) {
			if (parentGr.canRead() && parentGr[field].canRead())
				return parentGr.getValue(field);
			return '';
		}

		return '';
	},

    type: 'hr_AssignmentUtil'
});