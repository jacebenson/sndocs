var PlannedTaskUtils = Class.create();

/*
 * Set children to same start state as parent
 */
PlannedTaskUtils.startChildren = function(gr, workState) {
    if(glb_changeTrigger && !this.isAncestor(glb_changeTrigger, gr)) {
        // Don't set the state of the child nodes since this node is
        // not under the same subtree whose root triggered this
        return;
    }
	gs.log("PlannedTaskUtils.startChildren");
	var child = new GlideRecord('planned_task');
	child.addQuery('parent', gr.getUniqueValue());
	child.addQuery('time_constraint', 'asap');
	child.addQuery('start_date', gr.start_date);
	child.addActiveQuery();
	child.query();
	gs.print(" PlannedTaskUtils.startChildren:: child query: "
			+ child.getEncodedQuery() + " = " + child.getRowCount());
	while (child.next()) {
		child.state = workState;
		child.update();
		gs.log(" PlannedTaskUtils.startChildren:: updated "
				+ child.getDisplayValue() + " to state " + workState);
	}
};

/*
 * Restart children when parent is restarted (active changes to true)
 */
PlannedTaskUtils.reactivateChildren = function(parent) {
	gs.log("PlannedTaskUtils.restartChildren");
	var child = new GlideRecord('planned_task');
	child.addQuery('parent', parent.getUniqueValue());
	child.addInactiveQuery();
	child.query();
	gs.print(" PlannedTaskUtils.restartChildren:: child query: "
			+ child.getEncodedQuery() + " = " + child.getRowCount());
	while (child.next()) {
		child.active = true;
		child.work_start = "";
		child.work_end = "";
		child.percent_complete = 0;
		child.update();
		gs.log(" PlannedTaskUtils.restartChildren:: " + child.getDisplayValue()
				+ " restarted");
	}
};

/*
 * Start or queue successor tasks when predecessor is closes
 */
PlannedTaskUtils.startSuccessors = function(task, startState) {
	gs.log("PlannedTaskUtils.startSuccessors");
	gs.log("PlannedTaskUtils.startSuccessors:: is task still active: "
			+ task.active);
	// Find all successors
	var rel = new GlideRecord('planned_task_rel_planned_task');
	rel.addQuery('parent', task.getUniqueValue());
	rel.addQuery('type.name', 'Predecessor of::Successor of');
	rel.query();
	gs.log(" PlannedTaskUtils.startSuccessors:: rel query: "
			+ rel.getEncodedQuery() + " = " + rel.getRowCount());
	while (rel.next()) {
		var successorId = rel.child.toString();
		// For this successor, search for any more active predecessors
		var rel2 = new GlideRecord('planned_task_rel_planned_task');
		rel2.addQuery('child', successorId);
		// rel2.addQuery('parent', "!=", task.getUniqueValue());
		rel2.addQuery('type.name', 'Predecessor of::Successor of');
		rel2.addQuery('parent.active', true);
		rel2.query();
		gs.log(" PlannedTaskUtils.startSuccessors:: rel2 query: "
				+ rel2.getEncodedQuery() + " = " + rel2.getRowCount());
		if (rel2.hasNext()) {
			// this task still has active predecessors, skip it
			gs
					.log(" PlannedTaskUtils.startSuccessors:: predecessors found doing nothing");
			continue;
		}

		// No active predecessors, start it
		// If the relationship has lag, or the successor is to start on a
		// specific date, schedule
		if (rel.child.time_constraint == 'start_on'
				|| rel.lag.getGlideObject().getNumericValue() > 0) {
			gs
					.log(" PlannedTaskUtils.startSuccessors:: scheduling task for future");
			PlannedTaskUtils.triggerTask(rel.child.getRefRecord(), startState);
		} else {
			// No need to schedule...start the task now
			var successor = rel.child.getRefRecord();
			if (successor.isValidRecord()) {
				gs
						.log(" PlannedTaskUtils.startSuccessors:: starting successor "
								+ successor.getDisplayValue());
				successor.state = startState;
				successor.update();
			}
		}
	}
};

/*
 * schedule a lag task for some time in the future
 */
PlannedTaskUtils.triggerTask = function(task, startState) {
	// Search for a pre-existing trigger
	var trigger = new GlideRecord("sys_trigger");
	trigger.addQuery("document_key", task.getUniqueValue());
	trigger.query();
	if (trigger.next()) {
		// You found a trigger...update it with the new start time
		trigger.next_action = task.start_date;
		trigger.update();
	} else {
		// You didnt find a trigger...create one
		var newTrigger = new GlideRecord("sys_trigger");
		newTrigger.name = 'Start planned task ' + task.short_description;
		newTrigger.next_action = task.start_date;
		newTrigger.document = 'planned_task';
		newTrigger.document_key = task.getUniqueValue();
		newTrigger.script = "var taskGr = new GlideRecord('planned_task'); if (taskGr.get('"
				+ task.getUniqueValue()
				+ "')) {taskGr.state = "
				+ startState
				+ "; taskGr.update();}";
		newTrigger.job_id.setDisplayValue('RunScriptJob');
		newTrigger.trigger_type = 0;
		newTrigger.insert();
	}
};

/*
 * Close parent when all child tasks are closed
 */
PlannedTaskUtils.closeParent = function(task, closeState) {
	// get active tasks with same parent
	var sibling = new GlideRecord('planned_task');
	sibling.addQuery('parent', task.parent);
	sibling.addActiveQuery();
	sibling.query();
	if (sibling.hasNext()) {
		// parent still has active task, do nothing
		return;
	}

	// all of the parent's children are closed, so close parent
	var parent = task.parent.getRefRecord();
	if (!parent.isValidRecord()) {
		return;
	}

	parent.state = closeState;
	parent.update();
};

/*
 * Start parent when a child starts
 */
PlannedTaskUtils.startParent = function(task, state) {
	if (JSUtil.nil(task.parent))
		return;

	var parent = task.parent.getRefRecord();
	if (parent.state == state)
		return;
	
	parent.state = state;
	parent.update();
};

PlannedTaskUtils.isAncestor = function(ancestor, task) {
   if(ancestor.sys_id === task.sys_id) {
      return true;
   }
   
   var path = task;
   var alreadySeen = new Object();
   var i = 0;
   while(!JSUtil.nil(path)) {
	  i++;
      if(alreadySeen.hasOwnProperty(path.getValue('sys_id'))) {
         // loop
         break;
      }
      
      if(path.getValue('sys_id') === ancestor.getValue('sys_id')) {
         return true;
      }
      
      alreadySeen[path.getValue('sys_id')] = 1;
      path = path.parent.getRefRecord();
   }
   
   return false;
};