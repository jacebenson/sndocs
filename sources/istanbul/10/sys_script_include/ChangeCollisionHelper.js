var ChangeCollisionHelper = Class.create();

ChangeCollisionHelper.getCiById = function(cIId){
	
	var glideRecordUtil = new GlideRecordUtil();
	return glideRecordUtil.getGR("cmdb_ci",cIId);
	
};

ChangeCollisionHelper.getConditionalMaintenanceSchedules = function() {
	
	var maintenanceSchedules = [];
	
	var scheduleGR = new GlideRecord('cmn_schedule_maintenance');
	scheduleGR.addNotNullQuery('applies_to');
	scheduleGR.query();
	while(scheduleGR.next())
		maintenanceSchedules.push({sys_id : scheduleGR.sys_id.toString(),
								   condition : scheduleGR.condition.toString(),
								   name : scheduleGR.name.toString(),
								   applies_to : scheduleGR.applies_to.toString()}
		);
	
	return maintenanceSchedules;
};

/**
 * Checks if the time span defined by startDate and endDate falls wholly/partially in the
 * CI's maintenance window
 *
 * @param configuration
 *            item's sys_id
 * @param startDate
 * @param endDate
 * @param bPartial (optional) default is false. When true checks partial overlap instead of whole.
 * @return boolean
 */
ChangeCollisionHelper.isDateInCiMaintenanceWindows = function(startDate, endDate, maintenanceWindow, bPartial) {
	
	// Case1: maintenance window is null
	if (JSUtil.nil (maintenanceWindow))
		return true;
	
	// Case2: maintenance window is invalid
	var record = new GlideRecord ("cmn_schedule_maintenance");
	record.addQuery ("sys_id", maintenanceWindow + "");
	record.query();
	var nRowCount = record.getRowCount();
	if (nRowCount === 0)
		return true;
	
	// Case3: check maintenance window
	var sched = new GlideSchedule(maintenanceWindow);
	var dur = sched.duration(startDate, endDate);
	var schedule_time = dur.getNumericValue() / 1000;
	if (bPartial) {
		if (parseInt(schedule_time) === 0)
			return false;
		else
			return true;
	}
	var wall_clock_time = parseInt(gs.dateDiff(startDate.getDisplayValue(), endDate.getDisplayValue(), true));
	if (wall_clock_time != schedule_time)
		return false;

	// Default Case: Assume date is within maintenance window for all other cases
	return true;
};

ChangeCollisionHelper.getCiMaintenanceSchedule = function(ci) {
	var maintenanceSchedule = null;
	var g = new GlideRecord('cmn_schedule');
	g.addQuery("JOINcmn_schedule.sys_id=cmdb_ci.maintenance_schedule!sys_id=" + ci);
	g.query();
	if (g.next())
		maintenanceSchedule = g.sys_id.toString();
	return maintenanceSchedule;
};

/**
 * Gets any blackout that overlap the period defined by startDate and endDate
 *
 * @param startDate
 * @param endDate
 * @return Array(blackoutId:stringSpan)
 */
ChangeCollisionHelper.getBlackoutsByDate = function(startDate, endDate) {
	var blackoutList = [];
	var scheduleGR = new GlideRecord('cmn_schedule_blackout');
	scheduleGR.addQuery('type', 'blackout');
	scheduleGR.query();
	while (scheduleGR.next()) {
		var scheduleId = scheduleGR.sys_id.toString();
		var sched = new GlideSchedule(scheduleId);
		// does schedule overlap itself within (startDate, endDate) range?
		var overlap = sched.getSpans(startDate, endDate);
		if (!overlap.isEmpty()){
			// caller expects Schedule IDs but does not use value
			blackoutList.push({sys_id:scheduleGR.sys_id.toString(),
			condition:scheduleGR.condition.toString(),
			name: scheduleGR.name.toString(),
			applies_to: scheduleGR.applies_to.toString()}
			);
		}
	}
	return blackoutList;
};

/**
 * Get changes scheduled in the timespan (defined by startDate and endDate) that
 * have the given CI in their affected CIs List
 *
 * @param Ci's
 *            sys_id
 * @param startDate
 * @param endDate
 *
 * @return Array changeIds
 */
ChangeCollisionHelper.getChangesWithAffectedCi = function(ci, startDate, endDate) {
	var changeIds = [];
	
	var changeRequestGR = new GlideRecord('change_request');
	changeRequestGR.addActiveQuery();
	changeRequestGR.addQuery("JOINchange_request.sys_id=task_ci.task!ci_item=" + ci);
	ChangeCollisionHelper._addQueryDateRange(changeRequestGR, startDate, endDate);
	changeRequestGR.query();
	
	while (changeRequestGR.next())
		changeIds.push(changeRequestGR.sys_id.toString());
	return changeIds;
};

/**
 * Get the changes that are in the timespan (startDate, endDate) and that are
 * link to the given ci ci Ci's sys_id startDate endDate excludeCR (optional) -
 * change_request record to exclude from search
 *
 * @return Array changeIds
 */
ChangeCollisionHelper.getChangesWithCi = function(ci, startDate, endDate, excludeCR) {
	var changeIds = [];
	
	var changeRequestGR = new GlideRecord('change_request');
	changeRequestGR.addActiveQuery();
	changeRequestGR.addQuery('cmdb_ci', ci);
	if (excludeCR)
		changeRequestGR.addQuery('sys_id', '!=', excludeCR.sys_id);
	ChangeCollisionHelper._addQueryDateRange(changeRequestGR, startDate, endDate);
	changeRequestGR.query();
	
	while (changeRequestGR.next())
		changeIds.push(changeRequestGR.sys_id.toString());
	return changeIds;
};

/**
 * Gets the affected CI Ids for the given change
 *
 * @param changeId
 * @return array
 */
ChangeCollisionHelper.getAffectedCisByChangeId = function(changeId) {
	var affectedCiIds = [];
	var affectedCiGR = new GlideRecord('task_ci');
	affectedCiGR.addQuery('JOINtask.sys_id=task_ci.task');
	affectedCiGR.addQuery('task', changeId);
	affectedCiGR.query();
	
	while (affectedCiGR.next())
		affectedCiIds.push(affectedCiGR.ci_item.toString());
	return affectedCiIds;
};

/**
 * Add CI to the change's affected CI list
 */
ChangeCollisionHelper.addCiToChangeAffectedCis = function(ci, changeId) {
	var affectedCiGR = new GlideRecord('task_ci');
	affectedCiGR.task = changeId;
	affectedCiGR.ci_item = ci;
	affectedCiGR.insert();
};

/**
 * check if an ci is already in the change's affected CIs list
 */
ChangeCollisionHelper.isCiInAffectedCis = function(ci, changeId) {
	var affectedCiGR = new GlideRecord('task_ci');
	affectedCiGR.addQuery('ci_item', ci);
	affectedCiGR.addQuery('task', changeId);
	affectedCiGR.query();
	
	return (affectedCiGR.next());
};

/**
 * Get all the CIs that depend on the given CI
 *
 * return an Array of CI sys_ids (as strings)
 */
ChangeCollisionHelper.getDependants = function(ci, returnGlideRecords) {
	var dependents = [];
	var cc = new GlideRecord('cmdb_rel_ci');
	cc.addQuery('child', ci);
	cc.query();
	
	if(returnGlideRecords){
		return cc.hasNext() ? cc : false;
	} else {
		while (cc.next())
			dependents.push(cc.parent.toString());
		
		return dependents;
	}
};

/**
 * Get all the CIs that the given CI depends on
 *
 * return an Array of CI sys_ids (as strings)
 */
ChangeCollisionHelper.getDependencies = function(ci, returnGlideRecords) {
	var dependencies = [];
	var cc = new GlideRecord('cmdb_rel_ci');
	cc.addQuery('parent', ci);
	cc.query();
	
	if(returnGlideRecords){
		return cc.hasNext() ? cc : false;
	} else {
		while (cc.next())
			dependencies.push(cc.child.toString());
		
		return dependencies;
	}
};

/**
 * add query conditions for start_date >= startDate; start_date <= endDate
 * end_date >= startDate; end_date <= endDate end_date >= endDate; start_date <=
 * startDate
 */
ChangeCollisionHelper._addQueryDateRange = function(gr, startDate, endDate) {
	var queryCondition = gr.addQuery('start_date', '9999-12-31 23:59:59');
	
	var startDateQueryCondition = queryCondition.addOrCondition('start_date', '>=', startDate);
	startDateQueryCondition.addCondition('start_date', '<=', endDate);
	
	var endDateQueryCondition = queryCondition.addOrCondition('end_date', '>=', startDate);
	endDateQueryCondition.addCondition('end_date', '<=', endDate);
	
	var overallQueryCondition = queryCondition.addOrCondition('end_date', '>=', endDate);
	overallQueryCondition.addCondition('start_date', '<=', startDate);
};

/**
 * Get all the CI GlideRecords that the given CI depends on
 *
 * return an Array of CI GlideRecords
 */
ChangeCollisionHelper.getDependenciesGR = function(ciSysId, glideRecordUtil) {
	var dependencies = [];
	var cc = new GlideRecord('cmdb_rel_ci');
	cc.addQuery('parent', ciSysId);
	cc.query();
	
	var dependency = null;
	while (cc.next()){
		dependency = glideRecordUtil.getGR("cmdb_ci", cc.child);
		if (dependency)
			dependencies.push(dependency);
	}
	
	return dependencies;
};


/**
 * Get all the CI GlideRecords that depend on the given CI
 *
 * return an Array of CI GlideRecords
 */
ChangeCollisionHelper.getDependantsGR = function (ciSysId, glideRecordUtil) {
	var dependents = [];
	var cc = new GlideRecord('cmdb_rel_ci');
	cc.addQuery('child', ciSysId);
	cc.query();
	
	var dependent = null;
	while (cc.next()) {
		dependent = glideRecordUtil.getGR("cmdb_ci", cc.parent);
		if (dependent)
			dependents.push(dependent);
	}
	return dependents;
	
};