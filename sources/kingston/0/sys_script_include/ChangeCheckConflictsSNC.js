var ChangeRequestInfo = Class.create();

ChangeRequestInfo.prototype = {
	initialize: function(changeGR) {
		this.sys_id = changeGR.sys_id.toString();
		this.start_date = changeGR.start_date.toString();
		this.end_date = changeGR.end_date.toString();
		this.sys_class_name = changeGR.sys_class_name.toString();
	}
};

var ChangeCheckConflictsSNC = Class.create();

ChangeCheckConflictsSNC.MAINTENANCE_WINDOW = "maintenance";
ChangeCheckConflictsSNC.BLACKOUT_WINDOW = "blackout";
ChangeCheckConflictsSNC.MAINTENANCE_WINDOW_FROM_CHILD = "child_maintenance";
ChangeCheckConflictsSNC.MAINTENANCE_WINDOW_FROM_PARENT = "parent_maintenance";

ChangeCheckConflictsSNC.getBoolPropertyValue = function(pptyName, overridingConfig) {
	if (overridingConfig) {
		var val = overridingConfig[pptyName];
		if (typeof val !== 'undefined')
			return val;
	}
	return gs.getProperty(pptyName, defaultVal) == 'true';
};

ChangeCheckConflictsSNC.allowConflictDetection = function(currentGr, previousGr, config) {
	// Case 1: Invalid Change or Config
	if (!currentGr || !config)
		return false;

	// Case 2: Dates Missing
	if (config.date_range) {
		if (config.date_range.length != 2)
			return false;
	} else if (currentGr.start_date.nil() || currentGr.end_date.nil())
		return false;

	// Case 3: Basic Mode + Configuration Item
	var mode = config.mode;
	var hasItem = !currentGr.cmdb_ci.nil();
	if (mode == 'basic' && hasItem)
		return true;

	// Case 4: Basic Mode + No Configuration Item
	if (mode == 'basic' && !hasItem)
		return false;

	// Case 5: Advanced Mode + Configuration Item
	if (mode == 'advanced' && hasItem)
		return true;

	// Case 6: Advanced Mode + No Configuration Item + No Affected Items
	var taskCiGr = new GlideRecord('task_ci');
	taskCiGr.addQuery('task', currentGr.getUniqueValue());
	taskCiGr.query();
	var affectedItems = taskCiGr.getRowCount();
	if (mode == 'advanced' && !hasItem && affectedItems == 0)
		return false;

	// Case 7: Advanced Mode + No Configuration Item + Single Affected Item that matches deleted Configuration Item
	taskCiGr.next();
	if (previousGr && mode == 'advanced' && !hasItem && affectedItems == 1 && taskCiGr.ci_item == previousGr.cmdb_ci)
		return false;

	// Default: Allow Conflict Detection for all other scenarios
	return true;
};

ChangeCheckConflictsSNC.prototype = {

	initialize: function(current, config) {
		this.collectWindowData = config && config.collect_window_data;
		if (this.collectWindowData)
			this._windowData = {
				maintenance: {},
				blackout: {}
			};

		// Check preconditions for conflict detection are being satisfied
		if (!ChangeCheckConflictsSNC.allowConflictDetection(current, undefined, config))
			return;

		// Record what type of collisions need to be checked
		this.bCheckConflictModeAdvanced = config.mode == 'advanced';
		this.bCheckChangeConflictCurrentCI = config.include_current_ci == true;
		this.bCheckChangeConflictCurrentWindow = config.current_window == true;
		this.bCheckConflictBlackout = config.include_blackout_window == true;
		this.bCheckConflictRelatedChildWindow = config.include_related_children_window == true;
		this.bChangeConflictRelatedParentWindow = config.include_related_parent_window == true;
		this.bShowChangeConflictTimingInfo = config.show_timing_info == true;
		this.nChangeConflictDumpCount = config.dump_count || 500;
		this.bFilterCaseSensitive = config.filter_is_case_sensitive == true;

		this.dryRun = config.dry_run;
		this.bPartial = config.allow_partially_overlapping_windows;

		// Generate helpers and initialize state as needed
		this.conflictHandler = new ChangeConflictHandler(this.nChangeConflictDumpCount);
		if (!this.dryRun)
			this.conflictHandler.deleteConflictsByChangeId(current.sys_id);
		this.current = current;
		this.changeIds = {};
		if (config && config.date_range) {
			this.startDate = config.date_range[0];
			this.endDate = config.date_range[1];
		} else {
			this.startDate = current.start_date.getGlideObject();
			this.endDate = current.end_date.getGlideObject();
		}
		this.wall_clock_time = parseInt(gs.dateDiff(this.startDate.getDisplayValue(), this.endDate.getDisplayValue(), true));
		this.glideRecordUtil = new GlideRecordUtil();
		this.arrayUtil = new ArrayUtil();
		this.blackouts = ChangeCollisionHelper.getBlackoutsByDate(this.startDate, this.endDate);
		this.maintenanceSchedules = ChangeCollisionHelper.getConditionalMaintenanceSchedules();
		this.dateInCiMaintenanceWindows = this.buildMaintenanceWindowInfo(); // Pre-calculate which maintenance schedules are within start and end date of current change_request record
		this.ciClassAncestors = this.buildAncestorClassInfo(); // Pre-calculate names of ancestor classes of each of the different cmdb_ci classes

		// Build a list of all the CI sys_ids which need to be checked (Note: this function updates the value of "this.processedCICount")
		this.processedCICount = 0;
		this.processedCIs = this.buildConfigItemInfo();
		
		// Get a list of all change requests which share CIs with the current change_request record
		this.mapCI2CR = this.buildConfigItemToChangeRequestMappings(true);

		// PRB1103073 - "If an affected CI is a child with many parents (or parent with many children), conflict detection can lead to high memory usage"
		//
		// This code ensures that we have the new methods for getting dependents and dependencies. The new code returns a
		// a single GlideRecord to iterate over instead of a discrete GlideRecord per dependent/dependency.
		this.USE_DEPRECATED_DEPENDENT_FUNC = false;
		if (typeof ChangeCollisionHelper.getCIDependants === "undefined")
			this.USE_DEPRECATED_DEPENDENT_FUNC = true;

		this.USE_DEPRECATED_DEPENDENCY_FUNC = false;
		if (typeof ChangeCollisionHelper.getCIDependencies === "undefined")
			this.USE_DEPRECATED_DEPENDENCY_FUNC = true;
	},

	/**
	 * Check for the different type of collisions the caller has requested and record details of them.
	 */
	check: function() {

		var nFrom = new Date().getTime();
		var nA = 0;
		var nB = 0;
		var nC = 0;
		var nD = 0;
		var nE = 0;
		var nF = 0;
		var x = 0;
		var y = 0;
		var ciGR = null;

		var tracker = SNC.GlideExecutionTracker.getLastRunning();
		tracker.setSourceTable("change_request");
		tracker.setSource(this.current.getUniqueValue());

		tracker.run();

		tracker.setMaxProgressValue(this.processedCICount * 4);

		x = new Date().getTime();
		if (this.bCheckChangeConflictCurrentCI)
			this.stageA();
		y = new Date().getTime();
		nA += (y - x);

		for ( var i in this.processedCIs) {

			// We detect a cancellation if percentage complete has hit 100 (GlideExecutionTracker.isCancelled() is not provided unfortunately...)
			if (tracker.getPercentComplete() == 100)
				break;

			ciGR = this.glideRecordUtil.getGR("cmdb_ci", this.processedCIs[i]);

			tracker.updateDetailMessage(gs.getMessage("Checking {0} for conflicts", [ ciGR.name ]));

			x = new Date().getTime();
			if (this.bCheckChangeConflictCurrentWindow)
				this.stageB(ciGR);
			y = new Date().getTime();
			nB += (y - x);
			tracker.incrementProgressValue();

			x = new Date().getTime();
			if (this.bCheckConflictBlackout)
				this.stageC(ciGR);
			y = new Date().getTime();
			nC += (y - x);
			tracker.incrementProgressValue();

			x = new Date().getTime();
			if (this.bCheckConflictRelatedChildWindow)
				this.stageD(ciGR);
			y = new Date().getTime();
			nD += (y - x);
			tracker.incrementProgressValue();

			x = new Date().getTime();
			if (this.bChangeConflictRelatedParentWindow)
				this.stageE(ciGR);
			y = new Date().getTime();
			nE += (y - x);
			tracker.incrementProgressValue();
		}

		x = new Date().getTime();
		var nSavedConflictCount;
		if (!this.dryRun)
			nSavedConflictCount = this.conflictHandler.saveConflicts();
		y = new Date().getTime();
		nF += (y - x);

		if (this.bShowChangeConflictTimingInfo) {
			var nUpto = new Date().getTime();
			var nDiff = (nUpto - nFrom) * 0.001;
			gs.log("-----------------------------------------------------------------------------------");
			gs.log("[DEBUG] Code Took " + nDiff + " secs to process " + this.processedCICount + " CIs and found " + nSavedConflictCount + " conflicts using dump count of " + this.nChangeConflictDumpCount);
			gs.log("[DEBUG] StageA took " + (nA * 0.001) + " secs");
			gs.log("[DEBUG] StageB took " + (nB * 0.001) + " secs");
			gs.log("[DEBUG] StageC took " + (nC * 0.001) + " secs");
			gs.log("[DEBUG] StageD took " + (nD * 0.001) + " secs");
			gs.log("[DEBUG] StageE took " + (nE * 0.001) + " secs");
			gs.log("[DEBUG] StageF took " + (nF * 0.001) + " secs");
			gs.log("-----------------------------------------------------------------------------------");
		}

		tracker.updateDetailMessage(gs.getMessage("The conflict check is complete"));
		tracker.success(gs.getMessage("The conflict check is complete"));

		return nSavedConflictCount;
	},

	/**
	 * Check for the different type of collisions the caller has requested and record details of them.
	 * and update the current change record with conflict status and run.
	 */
	checkAndUpdate: function() {
		var nSavedConflictCount = this.check();
		
		var conflictLastRun = new GlideDateTime();
		var conflictStatus = nSavedConflictCount ? "Conflict" : "No Conflict";
		
		this.current.setValue("conflict_status", conflictStatus);
		this.current.setValue("conflict_last_run", conflictLastRun);
		this.current.setValue("refresh_conflicts", false);
		this.current.update();	
		
		this.updateConflictDetectionFields(conflictLastRun);		
		
		return nSavedConflictCount;
	},

	stageA: function() {
		for ( var i in this.mapCI2CR)
			for ( var j in this.mapCI2CR[i])
				this._addConflict(i, ChangeConflict.CHANGETYPE_ALREADY_SCHEDULED, this.mapCI2CR[i][j]);
	},

	stageB: function(ciGR) {
		if (!ChangeCollisionHelper.isDateInCiMaintenanceWindows(this.startDate, this.endDate, ciGR.maintenance_schedule, this.bPartial))
			this._addConflict(ciGR.sys_id, ChangeConflict.CHANGETYPE_NOT_IN_WINDOW, ciGR.maintenance_schedule);
		else if (this.collectWindowData && ciGR.maintenance_schedule)
			this._addWindow(ciGR.sys_id, ChangeCheckConflictsSNC.MAINTENANCE_WINDOW, ciGR.maintenance_schedule);

		for (var j = 0; j < this.maintenanceSchedules.length; j++) {
			var schedule = this.maintenanceSchedules[j];

			if (!this._doesScheduleApplyToCi(schedule.applies_to, ciGR.sys_class_name))
				continue;

			if (this.dateInCiMaintenanceWindows[schedule.sys_id]) {
				if (this.collectWindowData)
					this._addWindow(ciGR.sys_id, ChangeCheckConflictsSNC.MAINTENANCE_WINDOW, schedule.sys_id);
				continue;
			}

			if (JSUtil.nil(schedule.condition) || SNC.Filter.checkRecord(ciGR, schedule.condition, true, this.bFilterCaseSensitive))
				this._addConflict(ciGR.sys_id, ChangeConflict.CHANGETYPE_NOT_IN_WINDOW, schedule.sys_id);
		}
	},

	stageC: function(ciGR) {
		for (var j = 0; j < this.blackouts.length; j++) {
			var blackout = this.blackouts[j];

			if (!this._doesScheduleApplyToCi(blackout.applies_to, ciGR.sys_class_name))
				continue;

			if (JSUtil.nil(blackout.condition) || SNC.Filter.checkRecord(ciGR, blackout.condition, true, this.bFilterCaseSensitive)) {
				this._addConflict(ciGR.sys_id, ChangeConflict.CHANGETYPE_BLACKOUT, blackout.sys_id);
				if (this.collectWindowData)
					this._addWindow(ciGR.sys_id, ChangeCheckConflictsSNC.BLACKOUT_WINDOW, blackout.sys_id);
			}
		}
	},
	
	stageD: function(ciGR) {
		if (this.USE_DEPRECATED_DEPENDENCY_FUNC) {
			var dependenciesArray = ChangeCollisionHelper.getDependenciesGR(ciGR.sys_id, this.glideRecordUtil);
			for (var i = 0; i < dependenciesArray.length; i++)
				this._stageD(ciGR, dependenciesArray[i]);
			
		} else {
			var dependenciesGR = ChangeCollisionHelper.getCIDependencies(ciGR.sys_id);
			while (dependenciesGR.next())
				this._stageD(ciGR, dependenciesGR);
		}
	},

	_stageD: function(ciGR, dependencyGR) {
		var ciSysId = ciGR.getUniqueValue();
		var dependencySysId = dependencyGR.getUniqueValue();
		var dependencyClassName = dependencyGR.getRecordClassName();
		
		if (this.bCheckChangeConflictCurrentCI) {
			var changeRequestConflicts = this._getChangesWithCIs(dependencySysId);
			for ( var key in changeRequestConflicts)
				this._addConflict(ciSysId, ChangeConflict.CHANGETYPE_CHILD_ALREADY_SCHEDULED, key, dependencySysId);
		}

		var ciMaintenanceWindow = ChangeCollisionHelper.getCiMaintenanceScheduleByGR(dependencyGR);

		if (!ChangeCollisionHelper.isDateInCiMaintenanceWindows(this.startDate, this.endDate, ciMaintenanceWindow, this.bPartial))
			this._addConflict(ciSysId, ChangeConflict.CHANGETYPE_CHILD_NOT_IN_WINDOW, ciMaintenanceWindow, dependencySysId);
		else if (this.collectWindowData && ciMaintenanceWindow)
			this._addWindow(ciSysId, ChangeCheckConflictsSNC.MAINTENANCE_WINDOW_FROM_CHILD, ciMaintenanceWindow, dependencySysId);

		for (var d = 0; d < this.maintenanceSchedules.length; d++) {
			var schedule = this.maintenanceSchedules[d];

			if (!this._doesScheduleApplyToCi(schedule.applies_to, dependencyClassName))
				continue;

			if (this.dateInCiMaintenanceWindows[schedule.sys_id]) {
				if (this.collectWindowData)
					this._addWindow(ciSysId, ChangeCheckConflictsSNC.MAINTENANCE_WINDOW_FROM_CHILD, schedule.sys_id, dependencySysId);
				continue;
			}

			//Check if the record class name differs from the record class name then re-read the record as the condition might be class specific
			//As an example: it is possible that the TableName is cmdb_ci but the Record Classname is cmdb_ci_win_server.
			//In this case the schedule condition would fail if it was dependant on cmdb_ci_win_server but the filter would be run against cmdb_ci
			if (!this.USE_DEPRECATED_DEPENDENCY_FUNC && (dependencyGR.getTableName() != dependencyClassName)) {
				var actualGR = new GlideRecord(dependencyClassName);
				if (actualGR.get(dependencySysId))
					dependencyGR = actualGR;
			}
			if (JSUtil.nil(schedule.condition) || SNC.Filter.checkRecord(dependencyGR, schedule.condition, true, this.bFilterCaseSensitive))
				this._addConflict(ciSysId, ChangeConflict.CHANGETYPE_CHILD_NOT_IN_WINDOW, schedule.sys_id, dependencySysId);
		}
	},
	
	stageE: function(ciGR) {
		if (this.USE_DEPRECATED_DEPENDENT_FUNC) {
			var dependantsArray = ChangeCollisionHelper.getDependantsGR(ciGR.sys_id, this.glideRecordUtil);
			for (var i = 0; i < dependantsArray.length; i++)
				this._stageE(ciGR, dependantsArray[i]);
			
		} else {
			var dependantsGR = ChangeCollisionHelper.getCIDependants(ciGR.sys_id);
			while (dependantsGR.next())
				this._stageE(ciGR, dependantsGR);
		}
	},

	_stageE: function(ciGR, dependantGR) {
		var ciSysId = ciGR.getUniqueValue();
		var dependantSysId = dependantGR.getUniqueValue();
		var dependantClassName = dependantGR.getRecordClassName();

		if (this.bCheckChangeConflictCurrentCI) {
			var changeRequestConflicts = this._getChangesWithCIs(dependantSysId);
			for ( var key in changeRequestConflicts)
				this._addConflict(ciSysId, ChangeConflict.CHANGETYPE_PARENT_ALREADY_SCHEDULED, key, dependantSysId);
		}

		var ciMaintenanceWindow = ChangeCollisionHelper.getCiMaintenanceScheduleByGR(dependantGR);

		if (!ChangeCollisionHelper.isDateInCiMaintenanceWindows(this.startDate, this.endDate, ciMaintenanceWindow, this.bPartial))
			this._addConflict(ciSysId, ChangeConflict.CHANGETYPE_PARENT_NOT_IN_WINDOW, ciMaintenanceWindow, dependantSysId);
		else if (this.collectWindowData && ciMaintenanceWindow)
			this._addWindow(ciSysId, ChangeCheckConflictsSNC.MAINTENANCE_WINDOW_FROM_PARENT, ciMaintenanceWindow, dependantSysId);

		for (var d = 0; d < this.maintenanceSchedules.length; d++) {
			var schedule = this.maintenanceSchedules[d];

			if (!this._doesScheduleApplyToCi(schedule.applies_to, dependantClassName))
				continue;

			if (this.dateInCiMaintenanceWindows[schedule.sys_id]) {
				if (this.collectWindowData)
					this._addWindow(ciSysId, ChangeCheckConflictsSNC.MAINTENANCE_WINDOW_FROM_PARENT, schedule.sys_id, dependantSysId);
				continue;
			}

			//Check if the record class name differs from the record class name then re-read the record as the condition might be class specific
			//As an example: it is possible that the TableName is cmdb_ci but the Record Classname is cmdb_ci_win_server.
			//In this case the schedule condition would fail if it was dependant on cmdb_ci_win_server but the filter would be run against cmdb_ci
			if (!this.USE_DEPRECATED_DEPENDENCY_FUNC && (dependantGR.getTableName() != dependantClassName)) {
				var actualGR = new GlideRecord(dependantClassName);
				if (actualGR.get(dependantSysId))
					dependantGR = actualGR;
			}
			if (JSUtil.nil(schedule.condition) || SNC.Filter.checkRecord(dependantGR, schedule.condition, true, this.bFilterCaseSensitive))
				this._addConflict(ciSysId, ChangeConflict.CHANGETYPE_PARENT_NOT_IN_WINDOW, schedule.sys_id, dependantSysId);
		}
	},

	_doesScheduleApplyToCi: function(scheduleAppliesToTable, ciTable) {
		return (this.ciClassAncestors[ciTable].indexOf(scheduleAppliesToTable) != -1);
	},

	/**
	 * Create and Add a conflict to the conflict handler ciGR is the CI (or affected CI being checked if in advanced mode)
	 * conflictType being added. conflictingElementId can be either a change sys_id or a schedule sys_id relatedCIId. this
	 * parameter will be used if the conflict happens on the CI's child or parent
	 * 
	 * @param GlideRecord
	 * @param string
	 * @param int
	 */
	_addConflict: function(ciSysId, conflictType, conflictingElementId, relatedCIId) {

		//we make sure that the current change does not conflict with itself
		if ((this.current.sys_id == conflictingElementId)
				&& (conflictType == ChangeConflict.CHANGETYPE_ALREADY_SCHEDULED || ChangeConflict.CHANGETYPE_CHILD_ALREADY_SCHEDULED || ChangeConflict.CHANGETYPE_PARENT_ALREADY_SCHEDULED))
			return;

		switch (conflictType) {

			case ChangeConflict.CHANGETYPE_ALREADY_SCHEDULED:
				this.conflictHandler.addChangeConflict(new ChangeConflict(ciSysId, this.current.sys_id, conflictType, conflictingElementId, null, null));
				this._addConflictingChange(conflictingElementId, ciSysId, conflictType, null);
				break;

			case ChangeConflict.CHANGETYPE_NOT_IN_WINDOW:
			case ChangeConflict.CHANGETYPE_BLACKOUT:
				this.conflictHandler.addChangeConflict(new ChangeConflict(ciSysId, this.current.sys_id, conflictType, null, conflictingElementId, null));
				break;

			case ChangeConflict.CHANGETYPE_CHILD_ALREADY_SCHEDULED:
			case ChangeConflict.CHANGETYPE_PARENT_ALREADY_SCHEDULED:
				this.conflictHandler.addChangeConflict(new ChangeConflict(ciSysId, this.current.sys_id, conflictType, conflictingElementId, null, relatedCIId));
				this._addConflictingChange(conflictingElementId, ciSysId, conflictType, relatedCIId);
				break;

			case ChangeConflict.CHANGETYPE_CHILD_NOT_IN_WINDOW:
			case ChangeConflict.CHANGETYPE_PARENT_NOT_IN_WINDOW:
				this.conflictHandler.addChangeConflict(new ChangeConflict(ciSysId, this.current.sys_id, conflictType, null, conflictingElementId, relatedCIId));
				break;

			default:
				break;
		}

		if (conflictingElementId)
			this.changeIds[conflictingElementId] = conflictingElementId;
	},
	
	_addConflictingChange: function (conflictingElementId, ciSysId, conflictType, relatedCIId){
		var gr = new GlideRecord("conflict");
		gr.addQuery("change", conflictingElementId);
		gr.addQuery("conflicting_change", this.current.sys_id);
		gr.addQuery("configuration_item", ciSysId);
		gr.addQuery("type", conflictType);
		gr.addQuery("related_configuration_item", relatedCIId);
		gr.query();
		if (gr.next())
			return;
		else
			this.conflictHandler.addChangeConflict(new ChangeConflict(ciSysId, conflictingElementId, conflictType, this.current.sys_id, null, relatedCIId));
	},

	_addWindow: function (ciSysId, windowType, windowElementId, relatedCIId) {
		switch (windowType) {
			case ChangeCheckConflictsSNC.MAINTENANCE_WINDOW:
			case ChangeCheckConflictsSNC.MAINTENANCE_WINDOW_FROM_CHILD:
			case ChangeCheckConflictsSNC.MAINTENANCE_WINDOW_FROM_PARENT:
				if (!this._windowData.maintenance[ciSysId])
					this._windowData.maintenance[ciSysId] = [];
				this._windowData.maintenance[ciSysId].push({
					type: windowType,
					scheduleId: windowElementId,
					relatedCiId: relatedCIId
				});
				break;
			case ChangeCheckConflictsSNC.BLACKOUT_WINDOW:
				if (!this._windowData.blackout[ciSysId])
					this._windowData.blackout[ciSysId] = [];
				this._windowData.blackout[ciSysId].push({
					scheduleId: windowElementId
				});
				break;
			default:
				break;
		}
	},

	getWindowData: function () {
		if (!this.collectWindowData)
			throw "Window data collection not turned on.";
		return this._windowData;
	},

	updateConflictDetectionFields: function(conflictLastRun) {
		var changeGr = new GlideRecord("change_request");
		changeGr.addActiveQuery();
		var joinQuery = changeGr.addJoinQuery("conflict", "sys_id", "conflicting_change");
		joinQuery.addCondition("change", this.current.getUniqueValue());
		changeGr.setValue("conflict_status", "Conflict");
		changeGr.setValue("conflict_last_run", conflictLastRun);
		changeGr.updateMultiple();
	},

	/**
	 * This gets all the changes on the given CI taking place between current change start date and end date, but also all the
	 * changes that have the given CI in their. Affected CI list. Note that all this changes are conflicting changes
	 * 
	 * @param int ciId
	 * @returns Array
	 */
	_getChangesWithCIs: function(ciId) {

		// (1) Find sys_ids of all change_requests that share cmdb_ci items in their affected item related lists and that reside within the start and end date of the current change_request
		var affectedCisConflicts = ChangeCollisionHelper.getChangesWithAffectedCi(ciId, this.startDate, this.endDate);

		// (2) Find sys_ids of all change requests that share the same cmdb_ci item as the current change_request and that reside within the start and end date of the current change_request
		var cisConflicts = ChangeCollisionHelper.getChangesWithCi(ciId, this.startDate, this.endDate, this.current);

		// (3) Return the union of all the change_request sys_ids which you have found
		var conflicts = {};
		var index = 0;
		for (index = 0; index < affectedCisConflicts.length; ++index)
			conflicts[affectedCisConflicts[index]] = null;
		for (index = 0; index < cisConflicts.length; ++index)
			conflicts[cisConflicts[index]] = null;
		return conflicts;
	},

	_getChangesWithCommonCIs: function(mapCISysIds) {
		var arrArr = [];
		var count = 0;
		var n = 0;
		arrArr[0] = [];
		for ( var strCiSysId in mapCISysIds) {
			if (count > 2000) {
				count = 0;
				n++;
				arrArr[n] = [];
			}
			arrArr[n][count] = strCiSysId;
			count++;
		}

		var affectedCisConflicts = [];
		var cisConflicts = [];
		for (var i = 0; i < arrArr.length; i++) {
			var ids = arrArr[i].join(",");
			var changeRequestGR = new GlideRecord('change_request');
			changeRequestGR.addQuery("JOINchange_request.sys_id=task_ci.task!ci_itemIN" + ids);
			changeRequestGR.addActiveQuery();
			ChangeCollisionHelper._addQueryDateRange(changeRequestGR, this.startDate, this.endDate);
			changeRequestGR.query();
			while (changeRequestGR.next())
				affectedCisConflicts.push(changeRequestGR.sys_id.toString());

			var changeRequestGR2 = new GlideRecord('change_request');
			changeRequestGR2.addActiveQuery();
			changeRequestGR2.addQuery('cmdb_ci', 'IN', ids);
			if (this.current)
				changeRequestGR2.addQuery('sys_id', '!=', this.current.sys_id);

			ChangeCollisionHelper._addQueryDateRange(changeRequestGR2, this.startDate, this.endDate);
			changeRequestGR2.query();
			while (changeRequestGR2.next())
				cisConflicts.push(changeRequestGR2.sys_id.toString());
		}

		var conflicts = {};
		var index = 0;
		for (index = 0; index < affectedCisConflicts.length; ++index)
			conflicts[affectedCisConflicts[index]] = null;
		for (index = 0; index < cisConflicts.length; ++index)
			conflicts[cisConflicts[index]] = null;
		return conflicts;
	},

	getAffectedCisByChangeId: function(changeId) {
		var affectedCiIds = [];
		var affectedCiGR = new GlideRecord('task_ci');
		affectedCiGR.addActiveQuery();
		affectedCiGR.addQuery('JOINtask.sys_id=task_ci.task');
		affectedCiGR.addQuery('task', changeId);
		affectedCiGR.query();

		while (affectedCiGR.next()) {
			var strSysId = affectedCiGR.ci_item.toString();
			affectedCiIds[strSysId] = strSysId;
			this.processedCICount++;
		}
		return affectedCiIds;
	},

	buildMaintenanceWindowInfo: function() {
		var key = null;
		var dateInCiMaintenanceWindows = {};
		for (var index = 0; index < this.maintenanceSchedules.length; index++) {
			key = this.maintenanceSchedules[index].sys_id.toString();
			dateInCiMaintenanceWindows[key] = ChangeCollisionHelper.isDateInCiMaintenanceWindows(this.startDate, this.endDate, key, this.bPartial);
		}
		return dateInCiMaintenanceWindows;
	},

	buildAncestorClassInfo: function() {
		var ciClassAncestors = {};
		var gru = new GlideRecordUtil();
		var ciGA = new GlideAggregate('cmdb');
		ciGA.addAggregate('COUNT', 'sys_class_name');
		ciGA.query();
		while (ciGA.next()) {
			var key = ciGA.sys_class_name + "";
			ciClassAncestors[key] = gru.getTables(key);
		}
		return ciClassAncestors;
	},

	buildConfigItemInfo: function() {
		var processedCIs = {};
		var strCiSysId = this.current.cmdb_ci.toString();
		if (this.bCheckConflictModeAdvanced) {
			// Advanced mode - We add the change request's CI in the Affected CIs List
			if (strCiSysId && !ChangeCollisionHelper.isCiInAffectedCis(strCiSysId, this.current.sys_id))
				ChangeCollisionHelper.addCiToChangeAffectedCis(strCiSysId, this.current.sys_id);

			processedCIs = this.getAffectedCisByChangeId(this.current.sys_id);
		} else {
			// Basic mode - We check only the change request's CI
			if (strCiSysId){
				processedCIs[strCiSysId] = strCiSysId;
				this.processedCICount = 1;
			}
		}
		return processedCIs;
	},

	buildConfigItemToChangeRequestMappings: function(buildWithChangeIdOnly) {
		var arrChangeRequests = this._getChangesWithCommonCIs(this.processedCIs);
		var mapCI2CR = {};
		for ( var strChangeRequestSysId in arrChangeRequests) {

		// The change sys_id is the only information used, don't return the whole change request
		// The boolean is used to support the legacy behaviour of returning a GlideRecord instance
		var changeRequestInfo;
		if (buildWithChangeIdOnly === true)
			changeRequestInfo = strChangeRequestSysId;
		else
			changeRequestInfo = new ChangeRequestInfo(this.glideRecordUtil.getGR("change_request", strChangeRequestSysId));
			
			var recTaskCi = new GlideRecord("task_ci");
			recTaskCi.addQuery("task", strChangeRequestSysId);
			recTaskCi.query();
			while (recTaskCi.next()) {
				var strCiSysId = recTaskCi.ci_item.toString();
				if (this.processedCIs[strCiSysId]) {
					if (!mapCI2CR[strCiSysId])
						mapCI2CR[strCiSysId] = {};
					mapCI2CR[strCiSysId][strChangeRequestSysId] = changeRequestInfo;
				}
			}
		}
		return mapCI2CR;
	},

	type: 'ChangeCheckConflictsSNC'
};