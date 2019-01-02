var SLATimeLineV2SNC = Class.create();
SLATimeLineV2SNC.prototype = {

	/*Tables*/
	TABLE_TASK: 'task',
	TABLE_TASK_SLA: 'task_sla',
	TABLE_CONTRACT_SLA: 'contract_sla',
	TABLE_SYS_HISTORY_LINE: 'sys_history_line',
	TABLE_CMN_SCHEDULE: 'cmn_schedule',

	/*Common Attributes*/
	ATTR_SYS_ID: 'sys_id',
	ATTR_SYS_CREATED_ON: 'sys_created_on',
	ATTR_SYS_UPDATED_ON: 'sys_updated_on',
	ATTR_SYS_MOD_COUNT: 'sys_mod_count',
	/*End common attributes*/

	/*Attributes - task_sla*/
	ATTR_TASK: 'task',
	ATTR_SLA: 'sla',
	ATTR_SCHEDULE: 'schedule',
	ATTR_STAGE: 'stage',
	ATTR_BUSINESS_PERCENTAGE: 'business_percentage',
	ATTR_BUSINESS_DURATION: 'business_duration',
	ATTR_BUSINESS_TIME_LEFT: 'business_time_left',
	ATTR_BUSINESS_PAUSE_DURATION: 'business_pause_duration',
	ATTR_PERCENTAGE: 'percentage',
	ATTR_DURATION: 'duration',
	ATTR_TIME_LEFT: 'time_left',
	ATTR_PAUSE_DURATION: 'pause_duration',
	ATTR_ACTIVE: 'active',
	ATTR_START_TIME: 'start_time',
	ATTR_ORIGINAL_BREACH_TIME: 'original_breach_time',
	ATTR_HAS_BREACHED: 'has_breached',
	ATTR_PLANNED_END_TIME: 'planned_end_time',
	/*End Attributes - task_sla*/

	/*Attributes - contract_sla*/
	ATTR_TABLE: 'table',
	ATTR_CANCEL_CONDITION: 'cancel_condition',
	ATTR_PAUSE_CONDITION: 'pause_condition',
	ATTR_RESET_CONDITION: 'reset_condition',
	ATTR_RESUME_CONDITION: 'resume_condition',
	ATTR_START_CONDITION: 'start_condition',
	ATTR_STOP_CONDITION: 'stop_condition',
	/*End attributes*/

	/*Attributes - sys_history_line*/
	ATTR_SET: 'set',
	ATTR_TYPE: 'type',
	ATTR_UPDATE: 'update',
	ATTR_UPDATE_TIME: 'update_time',
	ATTR_NEW_VALUE: 'new_value',
	ATTR_NEW: 'new',
	ATTR_FIELD: 'field',
	ATTR_LABEL: 'label',
	/*End Attributes - sys_history_line*/

	/*Attributes - contract_sla*/
	ATTR_NAME: 'name',
	ATTR_COLLECTION: 'collection',
	ATTR_URL: 'url',
	/*End Attributes - contract_sla*/

	/*Operators*/
	OPR_IN: 'IN',
	/*End Operators*/

	/*Configuration*/
	SLA_TIME_LINE_LOG: 'com.snc.sla.time_line.log',
	SLA_ENGINE_VERSION: 'com.snc.sla.engine.version',
	LAND_MARK_PERCENTAGES: [50, 75, 100], //These percentage stages are inserted if updates do not happen at this exact stage
	/*End Configuration*/

	/*TASK_SLA STAGES*/
	SLA_STAGE_COMPLETED: 'completed',
	SLA_STAGE_CANCELLED: 'cancelled',
	SLA_STAGE_IN_PROGRESS: 'in_progress',
	SLA_STAGE_BREACHED: 'breached',
	/*End TASK_SLA STAGES*/

	/*Properties*/
	PROP_2010_BACK_COMPATIBILITY: 'com.snc.sla.compatibility.breach',
	/*End Properties*/

	initialize: function(params) {
		this.arrayUtil = new ArrayUtil();
		this.slaUtil = new SLAUtilSNC();
		this.log = new GSLog(this.SLA_TIME_LINE_LOG, this.type);

		if (gs.getProperty(this.PROP_2010_BACK_COMPATIBILITY, 'false') == 'true')
			this.isBackwardCompatibility2010Enabled = true;
		else
			this.isBackwardCompatibility2010Enabled = false;

		if (params) {
			if (params.getTaskSlaGroupedBySla)
				this.GET_TASK_SLA_GROUPED_BY_SLA = true;
			if (params.getDBTaskSlasAsStored)
				this.GET_DB_TASK_SLAS_AS_STORED = true;
			if (params.getTaskFullDetails)
				this.GET_TASK_FULL_DETAILS = true;
			if (params.getAllStages)
				this.GET_ALL_STAGES = true;
		}
	},

	/*
	 ** This will be the function primarily responsible for preparing results of timeline
	 ** details for SLA with query starting from a Task.
	 **
	 ** From REST API we might always end up hitting this API with a single task and the
	 ** filtering on SLAs will be done on client side. However, we still provide a support to have the filter
	 ** at server side for which we very well may have the need for other cases.
	 **
	 */
	getTimeLineDetails: function(taskId /*String - Mandatory*/ , contractSLAIds /*Array*/ ) {
		var taskGr = new GlideRecord(this.TABLE_TASK);

		if (taskId && taskGr.get(taskId)) {
			taskGr = this.getRecordWithClass(taskGr, taskId); //Fetching record with it's own class
			var preConditions = this._apiPreConditionsCheck(taskGr);
			if (preConditions.apiError || preConditions.apiSecurityError)
				return preConditions;

			var taskSLAParams = {};
			var contractSLAParams = {};

			var taskSLAsCurrentStateInDb = this.slaUtil.grToJsArr(this._getAttachedTaskSLARecs(taskGr,
				contractSLAIds));
			var contractSLAGrAttachedNSimulated = this._getContractSLARecs(taskSLAsCurrentStateInDb,
				contractSLAIds);
			var taskHistoryGr = this._getTaskHistory(taskGr);

			return this._getTimeLineDetails(taskGr, contractSLAGrAttachedNSimulated,
				taskSLAsCurrentStateInDb, taskHistoryGr);

		} else {
			return this._returnApiError(gs.getMessage('A valid task record is necessary to get time line details'));
		}
	},

	getRecordWithClass: function(taskGr, taskId) {
		var recordClassName = taskGr.getRecordClassName();
		taskGr = new GlideRecord(recordClassName);
		taskGr.get(taskId);
		return taskGr;
	},

	_apiPreConditionsCheck: function(taskGr) {
		if ((gs.getProperty(this.SLA_ENGINE_VERSION, '2010') != '2011'))
			return this._returnApiError(gs.getMessage("This feature is only supported while running the 2011 Engine."));
		if (!(new GlideAuditor(taskGr.getRecordClassName(), null).auditTable()))
			return this._returnApiError(gs.getMessage(
				"Audit is not enabled on this table. Timeline details can't be extracted."));
		if (!taskGr.canRead())
			return this._returnApiSecurityError(gs.getMessage(
				"Security constraints don't allow to view this timeline as read access is not available for this {0}", taskGr.getRecordClassName()));
	},

	_returnApiError: function(message) {
		return {
			apiError: message
		};
	},

	_returnApiSecurityError: function(message) {
		return {
			apiSecurityError: message
		};
	},

	_getTimeLineDetails: function(taskGr, contractSLAGrAttachedNSimulated /*Attribute attached and simulated are expected in this object with the respective GRs */ ,
		taskSLAsCurrentStateInDb, taskHistoryGr) {
		var attachedContractSLAGr = contractSLAGrAttachedNSimulated.attached;
		var simulatedContractSLAGr = contractSLAGrAttachedNSimulated.simulated;
		var taskUpdatesNTaskSLAStates = {};
		var taskStatesObj = this._getHistoricalTaskUpdates(taskHistoryGr, taskGr);
		var taskDeltaChanges = taskStatesObj.taskDeltaChanges;
		var taskGrAtUpdates = taskStatesObj.taskGrAtUpdates;
		var taskFullSnapAtUpdates = this._prepareTaskFullSnapAtUpdates(taskGrAtUpdates);
		var taskSlasWorkedOutAttachedContracts;
		var taskSlasWorkedOutSimulatedContracts;
		var contractSlas = [];

		// Adding this Pseudo Record, ensures that we get current elapsed time and percentages if the sla engine were to run now.
		this._addAPseudoUpdateAtCurrentTime(taskGrAtUpdates);

		taskSlasWorkedOutAttachedContracts = this._prepareTaskSLAsForContractSLAs(attachedContractSLAGr, contractSlas,
			taskGrAtUpdates, taskGr);
		taskSlasWorkedOutSimulatedContracts = this._prepareTaskSLAsForContractSLAs(simulatedContractSLAGr, contractSlas,
			taskGrAtUpdates, taskGr);

		var taskRefFieldValueMap = this._getTaskRefFieldValueMap(contractSlas, taskGr);

		var taskObj = {};
		if (this.GET_TASK_FULL_DETAILS)
			taskObj = this.slaUtil.grToJsObj(taskGr);
		if ((taskObj.hasOwnProperty('read_allowed') && taskObj.read_allowed) || !taskObj.hasOwnProperty('read_allowed')) {
			taskObj.sys_id = taskGr.getUniqueValue();
			if (taskGr.getDisplayName() && taskGr.getElement(taskGr.getDisplayName()).canRead())
				taskObj.display_value = taskGr.getDisplayValue();
			else
				taskObj.display_value = '';
			taskObj.url = taskGr.getLink(true);
			taskObj.sys_class_name = taskGr.getRecordClassName();
		}

		var returnObj = {
			task_delta_changes: taskDeltaChanges,
			task_full_snap_at_updates: taskFullSnapAtUpdates,
			task_slas_worked_out_attached_contracts: taskSlasWorkedOutAttachedContracts,
			task_slas_worked_out_simulated_contracts: taskSlasWorkedOutSimulatedContracts,
			contract_slas: contractSlas,
			task_details: taskObj,
			task_reference_field_value_map: taskRefFieldValueMap
		};

		if (this.GET_DB_TASK_SLAS_AS_STORED) {
			returnObj.task_slas_current_state_db = taskSLAsCurrentStateInDb;
		}

		return returnObj;
	},

	_getTaskRefFieldValueMap: function(contractSlas, taskGr) {
		var taskRefFieldValueMap = {};
		for (var i = 0; i < contractSlas.length; i++) {
			var contractSla = contractSlas[i];

			var relatedFieldsForContractSla = [];
			var conditionFields = [this.ATTR_CANCEL_CONDITION, this.ATTR_PAUSE_CONDITION, this.ATTR_RESET_CONDITION,
				this.ATTR_RESUME_CONDITION, this.ATTR_START_CONDITION, this.ATTR_STOP_CONDITION];
			for (var j = 0; j < conditionFields.length; j++) {
				relatedFieldsForContractSla = this.arrayUtil.concat(relatedFieldsForContractSla, contractSla[conditionFields[j]].related_fields);
			}

			for (var j = 0; j < relatedFieldsForContractSla.length; j++) {
				if (relatedFieldsForContractSla[j].indexOf('.') > -1 && !taskRefFieldValueMap.hasOwnProperty(relatedFieldsForContractSla[j])) {
					var splitField = relatedFieldsForContractSla[j].split('.');
					var dottedElement;
					var dottedElementLabel;
					for (var k = 0; k < splitField.length; k++) {//Go n level deep to find value
						if (k == 0) {
							dottedElement = taskGr[splitField[k]];
							dottedElementLabel = dottedElement.getLabel();
						}
						else {
							dottedElement = dottedElement[splitField[k]];
							dottedElementLabel = dottedElementLabel + ' ' + dottedElement.getLabel();
						}
					}
					var relatedFieldMap = {};
					if (dottedElement.canRead()) {
						relatedFieldMap.read_allowed = true;
						relatedFieldMap.label = dottedElementLabel;
						relatedFieldMap.value = dottedElement.getValue();
						relatedFieldMap.display_value = dottedElement.getDisplayValue();
					} else {
						relatedFieldMap.read_allowed = false;
						relatedFieldMap.label = dottedElementLabel;
						relatedFieldMap.value = '';
						relatedFieldMap.display_value = gs.getMessage('(restricted)');
					}
					taskRefFieldValueMap[relatedFieldsForContractSla[j]] = relatedFieldMap;
				}
			}
		}
		return taskRefFieldValueMap;
	},

	_addAPseudoUpdateAtCurrentTime: function(taskGrAtUpdates) {
		var currentDateTime = new GlideDateTime();
		if (taskGrAtUpdates && taskGrAtUpdates.length) {
			var lastKnownTaskUpdateGr = taskGrAtUpdates[taskGrAtUpdates.length - 1];
			var currentTaskGrIfUpdatedNowWithoutChanges = this.slaUtil.copyGlideRecord(lastKnownTaskUpdateGr);
			currentTaskGrIfUpdatedNowWithoutChanges.setValue(this.ATTR_SYS_UPDATED_ON, currentDateTime.getValue());
			taskGrAtUpdates.push(currentTaskGrIfUpdatedNowWithoutChanges);
		}
	},

	_prepareTaskFullSnapAtUpdates: function(taskGrAtUpdates) {
		var taskFullSnapAtUpdates = [];
		for (var i = 0; i < taskGrAtUpdates.length; i++) {
			taskFullSnapAtUpdates.push(this.slaUtil.grToJsObj(taskGrAtUpdates[i]));
		}
		return taskFullSnapAtUpdates;
	},

	_prepareTaskSLAsForContractSLAs: function(contractSLAGr, contractSlas, taskGrAtUpdates, taskGr) {
		var taskSlasWorkedOut;
		if (this.GET_TASK_SLA_GROUPED_BY_SLA) {
			taskSlasWorkedOut = {};
		} else {
			taskSlasWorkedOut = [];
		}
		while (contractSLAGr.next()) {
			var contractSLAData = this._prepareContractSLAData(contractSLAGr);
			contractSlas.push(contractSLAData);
			if (contractSLAData.read_allowed) {
				if (this.GET_TASK_SLA_GROUPED_BY_SLA) {
					taskSlasWorkedOut[contractSLAGr.getUniqueValue()] = this.getTaskSLABreakDowns(
						contractSLAGr, taskGrAtUpdates);
				} else {
					taskSlasWorkedOut = this.arrayUtil.concat(taskSlasWorkedOut, this.getTaskSLABreakDowns(
						contractSLAGr, taskGrAtUpdates));
				}
			}
		}
		return taskSlasWorkedOut;
	},

	_prepareContractSLAData: function(contractSLAGr) {
		var contractSLAObj = this.slaUtil.grToJsObj(contractSLAGr, true);
		if (contractSLAObj.read_allowed) {
			var conditionFields = [this.ATTR_CANCEL_CONDITION, this.ATTR_PAUSE_CONDITION, this.ATTR_RESET_CONDITION, this.ATTR_RESUME_CONDITION, this.ATTR_START_CONDITION, this.ATTR_STOP_CONDITION];
			for (var i = 0; i < conditionFields.length; i++) {
				if (contractSLAGr.getValue(conditionFields[i])) {
					contractSLAObj[conditionFields[i]].related_fields = this.slaUtil.getRelatedFieldsFromEncodedQuery(contractSLAGr.getValue(this.ATTR_COLLECTION), contractSLAGr.getValue(conditionFields[i]));
				}
			}
		}
		return contractSLAObj;
	},

	/*
	 ** This function can be used to pass in a contract_sla GlideRecord, an array of task GlideRecord
	 ** representing sequential snapshot of task as per history plus a pseudo update containing current time to
	 ** force to give calculation on current time. As output it will list out the task_sla
	 ** snapshot at those various stages
	 */
	getTaskSLABreakDowns: function(contractSLAGr /*GlideRecord*/ , taskGrAtUpdates /*Array of task GlideRecord*/ ) {
		var taskSLAStages = [];
		var taskSLAs = [];
		var taskSLA;
		var taskSLAController = new ReadOnlyTaskSLAController();
		var countOfTaskSlas = 1;
		var stateChangeOccuredDueToUpdates = [];
		var attachedDate;
		var landMarkPercentageCount = 0;
		var prevTaskSLA;
		var preStartSLAStages = [];
		var isTerminalStageUpdate = false;
		for (var i = 0; taskGrAtUpdates && i < taskGrAtUpdates.length; i++) {
			var taskDummyGrCurrent = taskGrAtUpdates[i];

			if (!taskSLA) {
				taskSLA = taskSLAController.initNewTaskSLA(taskDummyGrCurrent, contractSLAGr, taskGrAtUpdates);
			} else if (taskSLA) {
				//Keep a copy of previous task sla. Will be useful to insert land mark stages, for which we do not have real updates to work with.
				prevTaskSLA = taskSLAController.copyTaskSLA(contractSLAGr, taskGrAtUpdates[i - 1], this.slaUtil.copyGlideRecord(taskSLA.taskSLAgr), taskSLA.retroactivePauseData);
				taskSLA = taskSLAController.updateTaskSLA(taskDummyGrCurrent, taskSLA, contractSLAGr);
			}
			if (taskSLA) {
				var taskSLADummyGr = taskSLA.getGlideRecord();
				if (taskSLADummyGr.getValue(this.ATTR_STAGE)) {

					var futureStartTime = this._checkFutureStart(taskSLADummyGr, taskDummyGrCurrent);
					if (futureStartTime) { //This block is for when SLA has start time later than task update date

						if (!preStartSLAStages.length) {
							attachedDate = taskDummyGrCurrent.sys_updated_on.getGlideObject().getDisplayValueInternal();
							preStartSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, undefined, taskDummyGrCurrent));
						} else
							preStartSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, preStartSLAStages[preStartSLAStages.length - 1], taskDummyGrCurrent));
						this._trackIfUpdateWasResponsibleForStageChange(preStartSLAStages, stateChangeOccuredDueToUpdates, taskDummyGrCurrent, true);
						isTerminalStageUpdate = taskSLADummyGr.getValue(this.ATTR_ACTIVE) == 0 || i == taskGrAtUpdates.length - 1;
						if (isTerminalStageUpdate) {
							var isReset = taskSLA.isReset;
							if (preStartSLAStages && preStartSLAStages.length > 0 && isReset)
								preStartSLAStages[preStartSLAStages.length - 1].values_at_evaluation_date.is_reset = isReset;

							this._prepareFutureTaskSLA(contractSLAGr, preStartSLAStages, stateChangeOccuredDueToUpdates, taskSLAs, attachedDate, countOfTaskSlas++);
							taskSLAController = new ReadOnlyTaskSLAController();
							taskSLA = undefined;
							attachedDate = undefined;
							taskSLAStages = [];
							preStartSLAStages = [];
							landMarkPercentageCount = 0;
							stateChangeOccuredDueToUpdates = [];
							prevTaskSLA = undefined;

							if (isReset) {
								taskDummyGrCurrent = taskGrAtUpdates[i];
								taskSLA = taskSLAController.initNewTaskSLA(taskDummyGrCurrent, contractSLAGr, taskGrAtUpdates);
								if (taskSLA) {
									var taskSLADummyGrReset = taskSLA.getGlideRecord();
									preStartSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGrReset, undefined, taskDummyGrCurrent));
									this._trackIfUpdateWasResponsibleForStageChange(preStartSLAStages, stateChangeOccuredDueToUpdates, taskDummyGrCurrent, true);
									if ((i == taskGrAtUpdates.length - 2)) {
										//This is the last but 1 update and only update after reset and we will now evaluate the last one which is the pseudo update of current date.
										i++;
										prevTaskSLA = taskSLAController.copyTaskSLA(contractSLAGr, taskGrAtUpdates[i - 1], this.slaUtil.copyGlideRecord(taskSLA.taskSLAgr), taskSLA.retroactivePauseDataList);
										taskDummyGrCurrent = taskGrAtUpdates[i];
										taskSLA = taskSLAController.updateTaskSLA(taskDummyGrCurrent, taskSLA, contractSLAGr);
										var taskSLADummyGrResetPseudoUpdate = taskSLA.getGlideRecord();
										//At this stage the pseudo update is again going to complete the SLA as it has not moved out of Reset so just stamp to the stage it was before
										this._revertAttributes(taskSLADummyGrResetPseudoUpdate, taskSLAStages[preStartSLAStages.length - 1]);
										preStartSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGrResetPseudoUpdate, preStartSLAStages[preStartSLAStages.length - 1], taskDummyGrCurrent));
										this._prepareFutureTaskSLA(contractSLAGr, preStartSLAStages, stateChangeOccuredDueToUpdates, taskSLAs, attachedDate, taskGrAtUpdates[i], countOfTaskSlas++);
									}
								}
							}
						}

					} else {
						//This block is for when start time is before or equal to task update date

						if (!taskSLAStages.length)
							taskSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, undefined, taskDummyGrCurrent));
						else
							taskSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, taskSLAStages[taskSLAStages.length - 1], taskDummyGrCurrent));

						if (this._trackIfUpdateWasResponsibleForStageChange(taskSLAStages, stateChangeOccuredDueToUpdates, taskDummyGrCurrent))
							taskSLAStages[taskSLAStages.length - 1].mustHaveStage = true;

						//Populate the date when the taskSLA was attached
						if (taskSLAStages.length == 1) {
							attachedDate = taskDummyGrCurrent.sys_updated_on.getGlideObject().getDisplayValueInternal();
							if (attachedDate > taskSLADummyGr.start_time.getGlideObject().getDisplayValueInternal()) {
								var taskSLACopy = taskSLAController.copyTaskSLA(contractSLAGr, taskDummyGrCurrent, this.slaUtil.copyGlideRecord(taskSLA.taskSLAgr), taskSLA.retroactivePauseDataList);
								var retroactiveStagesObj = this._insertRetroactiveStages(taskSLACopy, taskSLAStages[0], attachedDate, taskGrAtUpdates, taskSLAController, contractSLAGr, i, stateChangeOccuredDueToUpdates);
								taskSLAStages = retroactiveStagesObj.taskSLAStages;
								landMarkPercentageCount = retroactiveStagesObj.landMarkPercentageCount;
							}
						}

						var prevTaskGr = this.slaUtil.copyGlideRecord(taskGrAtUpdates[i - 1]);
						//Evaluate and insert the stages where land mark business percentages like 50, 75, 100 were crossed at correct positions.
						landMarkPercentageCount = this._insertLandMarkStages(taskSLAStages, prevTaskGr, contractSLAGr, taskSLAController,
							prevTaskSLA, landMarkPercentageCount);

						//Evaluate if the task_sla reached cancelled/completed. Active flag will be false(0) in that case.
						isTerminalStageUpdate = taskSLADummyGr.getValue(this.ATTR_ACTIVE) == 0 || i == taskGrAtUpdates.length - 1;

						//Even if this is terminal stage for this contract we continue till future updates as this SLA may again get attached
						//in future when it again matches start condition.
						if (isTerminalStageUpdate) {
							taskSLAStages[taskSLAStages.length - 1].mustHaveStage = true;
							var isReset = taskSLA.isReset;
							if (taskSLAStages) {
								if (isReset)
									taskSLAStages[taskSLAStages.length - 1].values_at_end_date.is_reset = isReset;

								this._prepareTaskSLA(contractSLAGr, taskSLAStages, stateChangeOccuredDueToUpdates, taskSLAs, attachedDate, taskGrAtUpdates[i], countOfTaskSlas++);
							}

							//clear task_sla to evaluate if it gets reattached or restarted cause of future updates.
							taskSLAController = new ReadOnlyTaskSLAController();
							taskSLA = undefined;
							attachedDate = undefined;
							taskSLAStages = [];
							preStartSLAStages = [];
							landMarkPercentageCount = 0;
							stateChangeOccuredDueToUpdates = [];
							prevTaskSLA = undefined;
							if (isReset) {
								taskDummyGrCurrent = taskGrAtUpdates[i];
								taskSLA = taskSLAController.initNewTaskSLA(taskDummyGrCurrent, contractSLAGr, taskGrAtUpdates);
								if (taskSLA) {
									var taskSLADummyGrReset = taskSLA.getGlideRecord();
									taskSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGrReset, undefined, taskDummyGrCurrent));
									if (this._trackIfUpdateWasResponsibleForStageChange(taskSLAStages, stateChangeOccuredDueToUpdates, taskDummyGrCurrent))
										taskSLAStages[taskSLAStages.length - 1].mustHaveStage = true;
									attachedDate = taskDummyGrCurrent.sys_updated_on.getGlideObject().getDisplayValueInternal();

									if (attachedDate > taskSLADummyGr.start_time.getGlideObject().getDisplayValueInternal()) {
										var taskSLACopy = taskSLAController.copyTaskSLA(contractSLAGr, taskDummyGrCurrent, this.slaUtil.copyGlideRecord(taskSLA.taskSLAgr), taskSLA.retroactivePauseDataList);
										var retroactiveStagesObj = this._insertRetroactiveStages(taskSLACopy, taskSLAStages[0], attachedDate, taskGrAtUpdates, taskSLAController, contractSLAGr, i, stateChangeOccuredDueToUpdates);
										taskSLAStages = retroactiveStagesObj.taskSLAStages;
										landMarkPercentageCount = retroactiveStagesObj.landMarkPercentageCount;
									}

									if ((i == taskGrAtUpdates.length - 2)) {
										//This is the last but 1 update and only update after reset and we will now evaluate the last one which is the pseudo update of current date.
										i++;
										prevTaskSLA = taskSLAController.copyTaskSLA(contractSLAGr, taskGrAtUpdates[i - 1], this.slaUtil.copyGlideRecord(taskSLA.taskSLAgr), taskSLA.retroactivePauseDataList);
										taskDummyGrCurrent = taskGrAtUpdates[i];
										taskSLA = taskSLAController.updateTaskSLA(taskDummyGrCurrent, taskSLA, contractSLAGr);
										var taskSLADummyGrResetPseudoUpdate = taskSLA.getGlideRecord();
										//At this stage the pseudo update is again going to complete the SLA as it has not moved out of Reset so just stamp to the stage it was before
										this._revertAttributes(taskSLADummyGrResetPseudoUpdate, taskSLAStages[taskSLAStages.length - 1]);
										taskSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGrResetPseudoUpdate, taskSLAStages[taskSLAStages.length - 1], taskDummyGrCurrent));
										taskSLAStages[taskSLAStages.length - 1].mustHaveStage = true;
										landMarkPercentageCount =  this._insertLandMarkStages(taskSLAStages, taskGrAtUpdates[i - 1], contractSLAGr, taskSLAController, prevTaskSLA, landMarkPercentageCount);
										this._prepareTaskSLA(contractSLAGr, taskSLAStages, stateChangeOccuredDueToUpdates, taskSLAs, attachedDate, taskGrAtUpdates[i], countOfTaskSlas++);
									}
								}
							}
						}
					} //End of block for SLA start_time when start time is before or equal to task update date
				}
			}
		}
		return taskSLAs;
	},

	//function to revert reset/retroactive stage to before for pseudo updates as re-evaluation of reset will complete the sla or retroactive could stamp false stage
	//while this update is not a real one
	_revertAttributes: function(taskSLADummyGrPseudoUpdate, prevStage) {
		//retroactives can occur before creation date. So at that time the TaskSLA API could return false stage of cancelled or any other stage as per the Task value at that time. So ignore them.
		if (this.isBackwardCompatibility2010Enabled && taskSLADummyGrPseudoUpdate.getValue(this.ATTR_HAS_BREACHED) == 1)
			taskSLADummyGrPseudoUpdate.setValue(this.ATTR_STAGE, this.SLA_STAGE_BREACHED);
		else
			taskSLADummyGrPseudoUpdate.setValue(this.ATTR_STAGE, prevStage.values_at_end_date[this.ATTR_STAGE].value);
		taskSLADummyGrPseudoUpdate.setValue(this.ATTR_ACTIVE, prevStage.values_at_end_date[this.ATTR_ACTIVE].value);
	},

	_checkFutureStart: function(taskSLADummyGr, taskDummyGr) {
		var updateTime = taskDummyGr.sys_updated_on.getGlideObject().getDisplayValueInternal();
		var startTime = taskSLADummyGr.start_time.getGlideObject().getDisplayValueInternal();
		if (updateTime < startTime)
			return startTime;
	},

	_trackIfUpdateWasResponsibleForStageChange: function(taskSLAStages, stateChangeOccuredDueToUpdates, taskDummyGrCurrent, isFuture) {
		var stageChanged = false;
		//determine if this update was responsible for changing the state of this task_sla. For first stage always
		//add to the stateChangeOccuredDueToUpdates as this update moved the task_sla to starting
		if (taskSLAStages.length == 1)
			stageChanged = true;

		if (taskSLAStages.length > 1) {
			var prevStage;
			var currentStage;
			if (isFuture)
				prevStage = taskSLAStages[taskSLAStages.length - 2].values_at_evaluation_date.stage.value;
			else
				prevStage = taskSLAStages[taskSLAStages.length - 2].values_at_end_date.stage.value;
			if (isFuture)
				currentStage = taskSLAStages[taskSLAStages.length - 1].values_at_evaluation_date.stage.value;
			else
				currentStage = taskSLAStages[taskSLAStages.length - 1].values_at_end_date.stage.value;

			var updateBasedStageChange = (prevStage != currentStage && !(prevStage == this.SLA_STAGE_IN_PROGRESS && currentStage == this.SLA_STAGE_BREACHED));
			var updateBasedTerminalStageChange;

			if (isFuture)
				updateBasedTerminalStageChange = (taskSLAStages[taskSLAStages.length - 1].values_at_evaluation_date.active.value != taskSLAStages[taskSLAStages.length - 2].values_at_evaluation_date.active.value);
			else
				updateBasedTerminalStageChange = (taskSLAStages[taskSLAStages.length - 1].values_at_end_date.active.value != taskSLAStages[taskSLAStages.length - 2].values_at_end_date.active.value);

			if (updateBasedTerminalStageChange || updateBasedStageChange)
				stageChanged = true;
		}

		if (stageChanged)
			stateChangeOccuredDueToUpdates.push(taskDummyGrCurrent.getValue(this.ATTR_SYS_MOD_COUNT));

		return stageChanged;
	},

	_insertRetroactiveStages: function(taskSLACopy, attachedStageObj, attachedDate, taskGrAtUpdates, taskSLAController,
		contractSLAGr, attachedAtUpdateIndex, stateChangeOccuredDueToUpdates) {
		if (attachedStageObj) {
			var landMarkPercentageCount = 0;
			var attachedStage = attachedStageObj.values_at_end_date;
			var schedule = this.slaUtil.getSchedule(contractSLAGr, taskGrAtUpdates[0]);
			var startTimeGdt = new GlideDateTime(attachedStage[this.ATTR_START_TIME].value);
			var originalBreachTimeGdt = new GlideDateTime(attachedStage[this.ATTR_ORIGINAL_BREACH_TIME].value);
			var totalDurMS = 0;
			/*
			 * Original breach time is the time when the SLA started and it was the 100% mark. So rely on it.
			 */
			if (schedule && schedule.getID()) {
				var totalDur = schedule.duration(startTimeGdt, originalBreachTimeGdt);
				totalDurMS = new GlideDateTime(totalDur.getValue()).getNumericValue();
			} else
				totalDurMS = originalBreachTimeGdt.getNumericValue() - startTimeGdt.getNumericValue();

			var taskSLAGrAtAttachedDate = this.slaUtil.copyGlideRecord(taskSLACopy.getGlideRecord());
			var retroactivePauseDataList = taskSLACopy.retroactivePauseDataList;
			var retroactiveTaskSLAStages = [];

			//create a stage at 0 progress at start_time
			var taskSLADummyGr = taskSLACopy.getGlideRecord();
			taskSLADummyGr.setValue(this.ATTR_DURATION, new GlideDuration(0));
			taskSLADummyGr.setValue(this.ATTR_BUSINESS_DURATION, new GlideDuration(0));
			taskSLADummyGr.setValue(this.ATTR_PAUSE_DURATION, new GlideDuration(0));
			taskSLADummyGr.setValue(this.ATTR_BUSINESS_PAUSE_DURATION, new GlideDuration(0));
			taskSLADummyGr.setValue(this.ATTR_PAUSE_TIME, '');
			taskSLADummyGr.setValue(this.ATTR_TIME_LEFT, new GlideDuration(totalDurMS));
			taskSLADummyGr.setValue(this.ATTR_BUSINESS_TIME_LEFT, new GlideDuration(totalDurMS));
			taskSLADummyGr.setValue(this.ATTR_PERCENTAGE, 0);
			taskSLADummyGr.setValue(this.ATTR_BUSINESS_PERCENTAGE, 0);
			taskSLADummyGr.setValue(this.ATTR_HAS_BREACHED, false);
			taskSLADummyGr.setValue(this.ATTR_STAGE, this.SLA_STAGE_IN_PROGRESS);
			taskSLADummyGr.setValue(this.ATTR_PLANNED_END_TIME, taskSLADummyGr.getValue(this.ATTR_ORIGINAL_BREACH_TIME));
			taskSLACopy.taskSLAgr = taskSLADummyGr;
			var index = 0;
			//find the state of task at sla start time for accuracy of stage
			while (index < taskGrAtUpdates.length - 1 &&
				taskGrAtUpdates[index + 1].sys_updated_on.getGlideObject().getDisplayValueInternal() < startTimeGdt.getDisplayValueInternal()) {
				index++;
			}
			var dummyTaskGr = this.slaUtil.copyGlideRecord(taskGrAtUpdates[index]);
			dummyTaskGr.setValue(this.ATTR_SYS_UPDATED_ON, startTimeGdt);
			retroactiveTaskSLAStages.push(this._prepareTaskSLAStage(taskSLADummyGr, undefined, dummyTaskGr));
			retroactiveTaskSLAStages[retroactiveTaskSLAStages.length - 1].mustHaveStage = true;
			var prevTaskGr = this.slaUtil.copyGlideRecord(dummyTaskGr);
			var prevTaskSLA = taskSLAController.copyTaskSLA(contractSLAGr, dummyTaskGr, taskSLADummyGr);
			//inspect for known pauses (only applicable for retroactive pause ticked SLAs.)
			for (var i = 0; i < retroactivePauseDataList.length; i++) {
				var taskSLAGrExitingOrEnteringPause = retroactivePauseDataList[i].taskSLAGr;
				var taskDummyGrCurrent = retroactivePauseDataList[i].responsibleTaskGr;
				if (i != 0) {
					prevTaskGr = this.slaUtil.copyGlideRecord(retroactivePauseDataList[i - 1].responsibleTaskGr);
					prevTaskSLA = taskSLAController.copyTaskSLA(contractSLAGr, retroactivePauseDataList[i - 1].responsibleTaskGr, retroactivePauseDataList[i - 1].taskSLAGr);
				}
				taskDummyGrCurrent.setValue(this.ATTR_SYS_UPDATED_ON, taskSLAGrExitingOrEnteringPause.getValue(this.ATTR_SYS_UPDATED_ON));

				this._trackIfUpdateWasResponsibleForStageChange(retroactiveTaskSLAStages, stateChangeOccuredDueToUpdates, taskDummyGrCurrent);

				retroactiveTaskSLAStages.push(this._prepareTaskSLAStage(taskSLAGrExitingOrEnteringPause, retroactiveTaskSLAStages[
					retroactiveTaskSLAStages.length - 1], taskDummyGrCurrent));
				//insert landmarks as applicable at each stage
				landMarkPercentageCount = this._insertLandMarkStages(retroactiveTaskSLAStages, prevTaskGr, contractSLAGr,
					taskSLAController, prevTaskSLA, landMarkPercentageCount, true);
				if (i == retroactivePauseDataList.length - 1) {
					prevTaskGr = this.slaUtil.copyGlideRecord(retroactivePauseDataList[i].responsibleTaskGr);
					prevTaskSLA = taskSLAController.copyTaskSLA(contractSLAGr, retroactivePauseDataList[i].responsibleTaskGr, retroactivePauseDataList[i].taskSLAGr);
				}
				retroactiveTaskSLAStages[retroactiveTaskSLAStages.length - 1].mustHaveStage = true;
			}
			//join the retoractive stage and the stage at attached date
			attachedStageObj.start_date = retroactiveTaskSLAStages[retroactiveTaskSLAStages.length - 1].end_date;
			retroactiveTaskSLAStages.push(attachedStageObj);

			//insert landmarks if applicable
			landMarkPercentageCount = this._insertLandMarkStages(retroactiveTaskSLAStages, prevTaskGr, contractSLAGr,
				taskSLAController, prevTaskSLA, landMarkPercentageCount, true);
			return {
				landMarkPercentageCount: landMarkPercentageCount,
				taskSLAStages: retroactiveTaskSLAStages
			};
		}
	},

	_prepareFutureTaskSLA: function(contractSLAGr, preStartSLAStages, stateChangeOccuredDueToUpdates, taskSLAs, attachedDate, countOfTaskSlas) {
		if (preStartSLAStages && preStartSLAStages.length) {
			var futureTaskSLA = {};
			futureTaskSLA.read_allowed = true;
			futureTaskSLA.is_future = true;
			for (var i = 0; i < preStartSLAStages.length; i++) {
				if (!preStartSLAStages[i].values_at_evaluation_date.read_allowed) {
					futureTaskSLA.read_allowed = preStartSLAStages[i].values_at_evaluation_date.read_allowed;
					futureTaskSLA.security_check_fail_message = preStartSLAStages[i].values_at_evaluation_date.security_check_fail_message;
					break;
				}
			}
			if (futureTaskSLA.read_allowed) {
				futureTaskSLA.contract_sla_id = contractSLAGr.getUniqueValue();
				futureTaskSLA.text = gs.getMessage('Task SLA - {0}', '' + countOfTaskSlas);
				futureTaskSLA.attached_date = attachedDate;
				futureTaskSLA.pre_start_sla_stages = preStartSLAStages;
				futureTaskSLA.state_change_due_to_task_updates = stateChangeOccuredDueToUpdates;
			}
			taskSLAs.push(futureTaskSLA);
		}
	},

	_prepareTaskSLA: function(contractSLAGr, taskSLAStages, stateChangeOccuredDueToUpdates, taskSLAs, attachedDate, taskDummyGrCurrent, countOfTaskSlas, preStartStages) {
		var taskSLAObj = {};
		taskSLAObj.read_allowed = true;
		var taskSLAReturnStages = [];
		if (taskSLAStages) {
			for (var i = 0; i < taskSLAStages.length; i++) {
				if (!taskSLAStages[i].values_at_end_date.read_allowed) {
					taskSLAObj.read_allowed = taskSLAStages[i].values_at_end_date.read_allowed;
					taskSLAObj.security_check_fail_message = taskSLAStages[i].values_at_end_date.security_check_fail_message;
					break;
				}
				if (taskSLAStages[i].mustHaveStage || this.GET_ALL_STAGES) {
					var tempStage = {};
					tempStage = taskSLAStages[i];
					if (taskSLAReturnStages) {
						tempStage.start_date = taskSLAReturnStages[taskSLAReturnStages.length - 1].end_date;
					}
					this._addDateMapNonGrFields(tempStage, ['start_date', 'end_date']);
					var stageStartDateGdt = new GlideDateTime();
					stageStartDateGdt.setDisplayValueInternal(tempStage.start_date);
					var stageEndDateGdt = new GlideDateTime();
					stageEndDateGdt.setDisplayValueInternal(tempStage.end_date);
					var stageDurationMS = stageEndDateGdt.getNumericValue() - stageStartDateGdt.getNumericValue();
					tempStage.duration = new GlideDuration(stageDurationMS).getDisplayValue();
					taskSLAReturnStages.push(tempStage);
				}
			}
			if (taskSLAObj.read_allowed) {
				taskSLAObj.start_date = taskSLAStages[0].start_date;
				taskSLAObj.end_date = taskSLAStages[taskSLAStages.length - 1].end_date;
			}
		}
		if (taskSLAObj.read_allowed) {
			taskSLAObj.id = contractSLAGr.getUniqueValue() + '-' + attachedDate;
			taskSLAObj.contract_sla_id = contractSLAGr.getUniqueValue();
			taskSLAObj.text = gs.getMessage('Task SLA - {0}', '' + countOfTaskSlas);
			taskSLAObj.state_change_due_to_task_updates = stateChangeOccuredDueToUpdates;
			taskSLAObj.stages = taskSLAReturnStages;
			taskSLAObj.pre_start_stages = preStartStages;
			var taskSLAStartDate = new GlideDateTime();
			taskSLAStartDate.setDisplayValueInternal(taskSLAObj.start_date);
			var taskSLAEndDate = new GlideDateTime();
			taskSLAEndDate.setDisplayValueInternal(taskSLAObj.end_date);
			var slaSchedule = this.slaUtil.getSchedule(contractSLAGr, taskDummyGrCurrent);
			taskSLAObj.used_timezone = {};
			taskSLAObj.used_timezone.display_value = slaSchedule.getTimeZone();
			taskSLAObj.attached_date = attachedDate;
			taskSLAObj.business_schedule_spans = this._getBusinessScheduleSpans(taskSLAStartDate, taskSLAEndDate,
				slaSchedule);
			taskSLAObj.out_of_business_schedule_spans = [];
			if (taskSLAObj.start_date && taskSLAObj.end_date && slaSchedule.getID())
				taskSLAObj.out_of_business_schedule_spans = this._getOutOfBusinessScheduleSpans(taskSLAObj.start_date, taskSLAObj.end_date, taskSLAObj.business_schedule_spans, slaSchedule);
			this._addDateMapNonGrFields(taskSLAObj, ['start_date', 'end_date', 'attached_date']);
		}
		taskSLAs.push(taskSLAObj);
	},

	_prepareTaskSLAStage: function(taskSLADummyGr, prevStage, taskDummyGrCurrent) {
		var taskSLAStage = {};
		var taskSLADummyObj = this.slaUtil.grToJsObj(taskSLADummyGr, true);
		if (taskSLADummyObj.read_allowed) {
			//We forcibly copy these values if a schedule is not present. This is done so that the REST API always guarantees business fields
			if (!taskSLADummyObj[this.ATTR_SCHEDULE].value) {
				if (!taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT] || (taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT] && (!taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT].value || new GlideDuration(0).getValue() == taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT].value) && taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT].read_allowed))
					taskSLADummyObj[this.ATTR_BUSINESS_TIME_LEFT] = taskSLADummyObj[this.ATTR_TIME_LEFT];
				if (!taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE] || (taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE] && !taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE].value && taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE].read_allowed))
					taskSLADummyObj[this.ATTR_BUSINESS_PERCENTAGE] = taskSLADummyObj[this.ATTR_PERCENTAGE];
				if (!taskSLADummyObj[this.ATTR_BUSINESS_DURATION] || (taskSLADummyObj[this.ATTR_BUSINESS_DURATION] && (!taskSLADummyObj[this.ATTR_BUSINESS_DURATION].value || new GlideDuration(0).getValue() == taskSLADummyObj[this.ATTR_BUSINESS_DURATION].value) && taskSLADummyObj[this.ATTR_BUSINESS_DURATION].read_allowed))
					taskSLADummyObj[this.ATTR_BUSINESS_DURATION] = taskSLADummyObj[this.ATTR_DURATION];
				if (!taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION] || (taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION] && (!taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION].value || new GlideDuration(0).getValue() == taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION].value) && taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION].read_allowed))
					taskSLADummyObj[this.ATTR_BUSINESS_PAUSE_DURATION] = taskSLADummyObj[this.ATTR_PAUSE_DURATION];
			}
			//patch task values
			taskSLADummyObj[this.ATTR_TASK] = {
				value: taskDummyGrCurrent.original_sys_id, //This is stamped in history preparation method
				display_value: taskDummyGrCurrent.getDisplayValue()
			};
			/**
			 * Note: A SLA stage is evaluated at a particular point only. The elapsed time, percentages etc change with time but stage doesn't.
			 * So we nest the stage with a value_at_end_date to denote that this is the exact value at end_date and not through out this stage.
			 * The start_date is only a convenience attribute for drawing the timeline. The start_date is merely the last known stage.
			 **/
			var taskUpdateDate = taskDummyGrCurrent.sys_updated_on.getGlideObject().getDisplayValueInternal();
			var startDate = taskSLADummyObj.start_time.display_value_internal;
			if (startDate > taskUpdateDate) {
				taskSLAStage.future_start_date = startDate;
				taskSLAStage.evaluation_date = taskUpdateDate;
			} else {
				if (!prevStage) { // If this is the first stage then start date is the SLA Rec's start time
					taskSLAStage.start_date = taskSLADummyObj.start_time.display_value_internal;
				} else {
					taskSLAStage.start_date = prevStage.end_date;
				}
				taskSLAStage.end_date = taskUpdateDate;
			}
		}
		if (taskSLAStage.future_start_date)
			taskSLAStage.values_at_evaluation_date = taskSLADummyObj;
		else
			taskSLAStage.values_at_end_date = taskSLADummyObj;
		return taskSLAStage;
	},

	_insertLandMarkStages: function(taskSLAStages, prevTaskGr, contractSLAGr, taskSLAController, prevTaskSLA,
		landMarkPercentageCount, retroactiveContext) {
		var tempTaskSLA = prevTaskSLA;

		if (landMarkPercentageCount == this.LAND_MARK_PERCENTAGES.length)
			return landMarkPercentageCount;

		if (taskSLAStages.length > 1) {
			this.log.logDebug('Previous percentage: ' + taskSLAStages[taskSLAStages.length - 2].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value);
			this.log.logDebug('Land mark evaluated: ' + this.LAND_MARK_PERCENTAGES[landMarkPercentageCount]);
			this.log.logDebug('Current percentage: ' + taskSLAStages[taskSLAStages.length - 1].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value);
			//In a very remote case it is possible that the update has happened at landmark stage, so no calculation is required and we can move to next stage
			if (taskSLAStages[taskSLAStages.length - 1].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value == this.LAND_MARK_PERCENTAGES[landMarkPercentageCount]) {
				landMarkPercentageCount++;
				return landMarkPercentageCount;
			}
		} else
			return landMarkPercentageCount;

		//For inserting landmarks we need minimum two stages. Even if the landmark value is same as the real update we still continue evaluation as in a out of schedule time
		//it is possible that the percentage remains same but the breach could have happened earlier. This would be boundary condition when out of schedule start and landmark
		//is reached at same time
		while (taskSLAStages.length > 1 && this.LAND_MARK_PERCENTAGES[landMarkPercentageCount] <= taskSLAStages[
				taskSLAStages.length - 1].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value && taskSLAStages[
				taskSLAStages.length - 2].values_at_end_date[this.ATTR_BUSINESS_PERCENTAGE].value < this.LAND_MARK_PERCENTAGES[landMarkPercentageCount]) {
			this.log.logDebug('Landmark Percentage evaluation entered: ' + this.LAND_MARK_PERCENTAGES[landMarkPercentageCount]);
			var schedule = this.slaUtil.getSchedule(contractSLAGr, prevTaskGr);
			var hasSchedule = false;
			if (schedule && schedule.getID())
				hasSchedule = true;

			//Since this is a post-evaluation where we have gone beyond the percentage we are interested in we go back one step
			var currStage = taskSLAStages[taskSLAStages.length - 1].values_at_end_date;
			var prevStage = taskSLAStages[taskSLAStages.length - 2].values_at_end_date;

			var prevStageElapsedDuration;
			if (hasSchedule)
				prevStageElapsedDuration = prevStage[this.ATTR_BUSINESS_DURATION].value;
			else
				prevStageElapsedDuration = prevStage[this.ATTR_DURATION].value;

			var prevStageElapsedDurationMS = new GlideDateTime(prevStageElapsedDuration).getNumericValue();

			/*
			 * Original breach time is the time when the SLA started and it was the 100% mark. So rely on it.
			 */
			var startTimeGdt = new GlideDateTime(prevStage[this.ATTR_START_TIME].value);
			var originalBreachTimeGdt = new GlideDateTime(prevStage[this.ATTR_ORIGINAL_BREACH_TIME].value);
			var totalDurMS = 0;
			if (hasSchedule) {
				var totalDur = schedule.duration(startTimeGdt, originalBreachTimeGdt);
				totalDurMS = new GlideDateTime(totalDur.getValue()).getNumericValue();
			} else
				totalDurMS = originalBreachTimeGdt.getNumericValue() - startTimeGdt.getNumericValue();


			if (totalDurMS) {
				//Calculate in terms of milli-seconds the duration that is needed to be at the required percentage
				var landMarkDurMS = (totalDurMS) * this.LAND_MARK_PERCENTAGES[landMarkPercentageCount] / 100;
				var timeInMSToReachLandMark = landMarkDurMS - prevStageElapsedDurationMS;
				var duration = new GlideDuration(timeInMSToReachLandMark);
				var prevTime = new GlideDateTime(prevTaskGr.getValue(this.ATTR_SYS_UPDATED_ON));
				var targetTime;

				if (hasSchedule) {
					targetTime /*GlideDateTime*/ = schedule.add(prevTime, duration);
					this.log.logDebug('Previous Time: ' + prevTime.getDisplayValueInternal());
					this.log.logDebug('Duration to add: ' + duration.getDisplayValue());
					this.log.logDebug('Target time: ' + targetTime.getDisplayValueInternal());
				} else {
					targetTime /*GlideDateTime*/ = new GlideDateTime(prevTime.getValue());
					targetTime.add(timeInMSToReachLandMark);
					this.log.logDebug('Previous Time: ' + prevTime.getDisplayValueInternal());
					this.log.logDebug('Target time: ' + targetTime.getDisplayValueInternal());
				}
				if (targetTime) {
					if (taskSLAStages[taskSLAStages.length - 1].end_date != targetTime.getDisplayValueInternal()) {
						prevTaskGr[this.ATTR_SYS_UPDATED_ON] = targetTime;
						tempTaskSLA = taskSLAController.updateTaskSLA(prevTaskGr, tempTaskSLA, contractSLAGr);
						var tempTaskSLAGr = tempTaskSLA.getGlideRecord();
						//Introduce a exception here. If we have a reset and no update in between,
						//these pseudo updates will be treated like a true reset.
						//So take a exception to set to previous stage value.
						if (tempTaskSLA.isReset || retroactiveContext)
							this._revertAttributes(tempTaskSLAGr, taskSLAStages[taskSLAStages.length - 2]);
						//insert the task_sla snapshot for the land mark percentage
						taskSLAStages.splice(taskSLAStages.length - 1, 0, this._prepareTaskSLAStage(tempTaskSLAGr,
							taskSLAStages[taskSLAStages.length - 2], prevTaskGr));
						taskSLAStages[taskSLAStages.length - 2].mustHaveStage = true;
						//readjust the highest snapshot's start date as we have more details available as a result of land mark insertions
						taskSLAStages[taskSLAStages.length - 1].start_date = taskSLAStages[taskSLAStages.length - 2].end_date;
					}
					landMarkPercentageCount++;
				}
			}
		}
		return landMarkPercentageCount;
	},

	_getContractSLARecs: function(taskSLAsAttached, contractSLAIds) {
		var attachedContractSLAIds = [];
		var simulatedContractSLAIds = [];

		for (var i = 0; i < taskSLAsAttached.length; i++) {
			if (contractSLAIds && contractSLAIds.indexOf(taskSLAsAttached[i].sla.value) > -1)
				attachedContractSLAIds.push(taskSLAsAttached[i].sla.value);
			else if (!contractSLAIds)
				attachedContractSLAIds.push(taskSLAsAttached[i].sla.value);
		}
		attachedContractSLAIds = this.arrayUtil.unique(attachedContractSLAIds);
		simulatedContractSLAIds = this.arrayUtil.diff(contractSLAIds, attachedContractSLAIds);
		var simulatedContractSLAGr;
		if (simulatedContractSLAIds) {
			simulatedContractSLAGr = this._getContractSLARecsByIds(simulatedContractSLAIds);
		}

		var attachedContractSLAGr;
		if (attachedContractSLAIds) {
			attachedContractSLAGr = this._getContractSLARecsByIds(attachedContractSLAIds);
		}

		return {
			attached: attachedContractSLAGr,
			simulated: simulatedContractSLAGr
		};
	},

	_getContractSLARecsByIds: function(contractSlaIds) {
		var contractSLAGr = new GlideRecord(this.TABLE_CONTRACT_SLA);
		contractSLAGr.addQuery(this.ATTR_SYS_ID, this.OPR_IN, contractSlaIds.join(','));
		contractSLAGr.query();
		return contractSLAGr;
	},

	_getAttachedTaskSLARecs: function(taskGr, contractSLAIds /*Optional filter*/ ) {
		var taskSLAGr = new GlideRecord(this.TABLE_TASK_SLA);
		taskSLAGr.addQuery(this.ATTR_TASK, taskGr.getUniqueValue());
		if (contractSLAIds)
			taskSLAGr.addQuery(this.ATTR_SLA, this.OPR_IN, contractSLAIds.join(','));
		taskSLAGr.query();

		return taskSLAGr;
	},

	_getTaskHistory: function(taskGr) {
		var hs = new GlideHistorySet(taskGr);
		var hsSysId = hs.generate();
		var historyGr = new GlideRecord(this.TABLE_SYS_HISTORY_LINE);
		historyGr.addQuery(this.ATTR_SET, hsSysId);
		historyGr.addQuery(this.ATTR_TYPE, 'audit').addOrCondition(this.ATTR_TYPE, '');
		historyGr.orderBy(this.ATTR_UPDATE);
		historyGr.query();
		return historyGr;
	},

	_getHistoricalTaskUpdates: function(historyGr, taskGr) {
		var dummyTaskGrList = [];
		var deltaChangesList = [];
		var dummyTaskGr = new GlideRecord(taskGr.getRecordClassName());
		dummyTaskGr.initialize();
		var updateCount = -1;
		var taskUpdate = {};
		while (historyGr.next()) {
			if (historyGr.getValue(this.ATTR_UPDATE) != updateCount) {
				if (historyGr.getValue(this.ATTR_UPDATE) != 0) { //Push data in a single update
					dummyTaskGrList.push(this.slaUtil.copyGlideRecord(dummyTaskGr));
					this._addDateMapNonGrFields(taskUpdate, [this.ATTR_SYS_UPDATED_ON, this.ATTR_SYS_CREATED_ON]);
					deltaChangesList.push(taskUpdate);
					taskUpdate = {};
				}

				if (historyGr.getValue(this.ATTR_UPDATE) == 0) { //Initialise
					dummyTaskGr.autoSysFields(false);
					dummyTaskGr.original_sys_id = taskGr.getUniqueValue();
					dummyTaskGr.setValue(this.ATTR_SYS_CREATED_ON, historyGr.getValue(this.ATTR_UPDATE_TIME));
					taskUpdate[this.ATTR_SYS_CREATED_ON] = historyGr[this.ATTR_UPDATE_TIME].getGlideObject().getDisplayValueInternal();
				}
				dummyTaskGr.setValue(this.ATTR_SYS_UPDATED_ON, historyGr.getValue(this.ATTR_UPDATE_TIME));
				taskUpdate[this.ATTR_SYS_UPDATED_ON] = historyGr[this.ATTR_UPDATE_TIME].getGlideObject().getDisplayValueInternal();
				updateCount = historyGr.getValue(this.ATTR_UPDATE);
				dummyTaskGr.setValue(this.ATTR_SYS_MOD_COUNT, updateCount);
				taskUpdate.update = updateCount;
			}

			if (!historyGr.getValue(this.ATTR_FIELD).startsWith('sys_') || historyGr.getValue(this.ATTR_FIELD) == 'sys_domain') {
				var newValue = historyGr.getValue(this.ATTR_NEW_VALUE);
				if (JSUtil.nil(newValue))
					newValue = historyGr.getValue(this.ATTR_NEW);
				dummyTaskGr.setValue(historyGr.getValue(this.ATTR_FIELD), newValue);
			}

			if (dummyTaskGr.isValidField(historyGr.getValue(this.ATTR_FIELD))) { //Required check as record producer variables also are recorded in audit log
				taskUpdate[historyGr.getValue(this.ATTR_FIELD)] = {
					label: historyGr.getValue(this.ATTR_LABEL)
				};
				if (dummyTaskGr.getElement(historyGr.getValue(this.ATTR_FIELD)).canRead()) {
					taskUpdate[historyGr.getValue(this.ATTR_FIELD)].read_allowed = true;
					taskUpdate[historyGr.getValue(this.ATTR_FIELD)].new_value = historyGr.getValue(this.ATTR_NEW_VALUE);
					taskUpdate[historyGr.getValue(this.ATTR_FIELD)].new_value_user = historyGr.getDisplayValue(this.ATTR_NEW);
				} else {
					taskUpdate[historyGr.getValue(this.ATTR_FIELD)].read_allowed = false;
					taskUpdate[historyGr.getValue(this.ATTR_FIELD)].new_value = '';
					taskUpdate[historyGr.getValue(this.ATTR_FIELD)].new_value_user = gs.getMessage('(restricted)');
				}
			}
			if (!historyGr.hasNext()) { // Push after collecting all changes when last record is accessed
				dummyTaskGrList.push(this.slaUtil.copyGlideRecord(dummyTaskGr));
				this._addDateMapNonGrFields(taskUpdate, [this.ATTR_SYS_UPDATED_ON, this.ATTR_SYS_CREATED_ON]);
				deltaChangesList.push(taskUpdate);
			}
		}
		return {
			taskGrAtUpdates: dummyTaskGrList,
			taskDeltaChanges: deltaChangesList
		};
	},

	_addDateMapNonGrFields: function(obj, dateFieldsList) { /*These fields are expected to be in display_value_internal*/
		obj.dates_map_non_gr_dates = {};
		for (var i = 0; i < dateFieldsList.length; i++) {
			obj.dates_map_non_gr_dates[dateFieldsList[i]] = this.slaUtil.populateDateInCommonFormatsAndConversions(obj[dateFieldsList[i]], this.slaUtil.DATE_FORMAT_DISPLAY_VALUE_INTERNAL);
		}
	},

	_getBusinessScheduleSpans: function(startDate /*GlideDateTime*/ , endDate /*GlideDateTime*/ , schedule /*GlideSchedule*/ ) {
		var it = schedule.getTimeMap(startDate, endDate);
		var spans = [];
		var span = {};
		while (it.hasNext()) {
			var timeMap = it.next();
			span = {
				start_date: timeMap.getStart().getGlideDateTime().getDisplayValueInternal(),
				end_date: timeMap.getEnd().getGlideDateTime().getDisplayValueInternal()
			};
			this._addDateMapNonGrFields(span, ['start_date', 'end_date']);
			spans.push(span);
		}
		return spans;
	},

	_getOutOfBusinessScheduleSpans: function(startDate /*String - Display value internal*/ , endDate, /*String - Display value internal*/
		businessScheduleSpans /*o/p from _getBusinessScheduleSpans*/ , schedule /*GlideSchedule*/ ) {
		var pointerDate = startDate;
		var outOfBusinessScheduleSpans = [];
		var outOfBusinessScheduleSpan = {};
		var totalOutOfScheduleDurationMS = 0;
		var outOfScheduleStartDateGdt;
		var outOfScheduleEndDateGdt;
		var outOfScheduleDurationMS;
		var totalDurationAllIncludedMS;
		var startDateGdt = new GlideDateTime();
		startDateGdt.setDisplayValueInternal(startDate);
		var endDateGdt = new GlideDateTime();
		endDateGdt.setDisplayValueInternal(endDate);

		for (var i = 0; businessScheduleSpans && i < businessScheduleSpans.length && pointerDate < endDate; i++) {
			outOfScheduleStartDateGdt = new GlideDateTime();
			outOfScheduleStartDateGdt.setDisplayValueInternal(pointerDate);

			outOfScheduleEndDateGdt = new GlideDateTime();
			outOfScheduleEndDateGdt.setDisplayValueInternal(businessScheduleSpans[i].start_date);

			outOfScheduleDurationMS = outOfScheduleEndDateGdt.getNumericValue() - outOfScheduleStartDateGdt.getNumericValue();
			totalDurationAllIncludedMS = outOfScheduleEndDateGdt.getNumericValue() - startDateGdt.getNumericValue();
			totalOutOfScheduleDurationMS = totalOutOfScheduleDurationMS + outOfScheduleDurationMS;
			if (pointerDate != businessScheduleSpans[i].start_date) {
				outOfBusinessScheduleSpan = {
					start_date: pointerDate,
					end_date: businessScheduleSpans[i].start_date,
					duration_out_of_schedule: new GlideDuration(outOfScheduleDurationMS).getDisplayValue(),
					total_duration_out_of_schedule: new GlideDuration(totalOutOfScheduleDurationMS).getDisplayValue(),
					total_duration_all_included: new GlideDuration(totalDurationAllIncludedMS).getDisplayValue()
				};
				this._addDateMapNonGrFields(outOfBusinessScheduleSpan, ['start_date', 'end_date']);
				outOfBusinessScheduleSpans.push(outOfBusinessScheduleSpan);
			}

			pointerDate = businessScheduleSpans[i].end_date;
			if (i == businessScheduleSpans.length - 1 && pointerDate < endDate) { //when the task sla ending time is not within schedule
				outOfScheduleStartDateGdt = new GlideDateTime();
				outOfScheduleStartDateGdt.setDisplayValueInternal(pointerDate);

				totalDurationAllIncludedMS = endDateGdt.getNumericValue() - startDateGdt.getNumericValue();

				outOfScheduleDurationMS = endDateGdt.getNumericValue() - outOfScheduleStartDateGdt.getNumericValue();
				totalOutOfScheduleDurationMS = totalOutOfScheduleDurationMS + outOfScheduleDurationMS;

				outOfBusinessScheduleSpan = {
					start_date: pointerDate,
					end_date: endDate,
					duration_out_of_schedule: new GlideDuration(outOfScheduleDurationMS).getDisplayValue(),
					total_duration_out_of_schedule: new GlideDuration(totalOutOfScheduleDurationMS).getDisplayValue(),
					total_duration_all_included: new GlideDuration(totalDurationAllIncludedMS).getDisplayValue()
				};
				this._addDateMapNonGrFields(outOfBusinessScheduleSpan, ['start_date', 'end_date']);
				outOfBusinessScheduleSpans.push(outOfBusinessScheduleSpan);
			}
		}

		if (schedule.getID() && !businessScheduleSpans) {
			outOfScheduleDurationMS = endDateGdt.getNumericValue() - startDateGdt.getNumericValue();
			totalOutOfScheduleDurationMS = outOfScheduleDurationMS;
			totalDurationAllIncludedMS = outOfScheduleDurationMS;
			outOfBusinessScheduleSpan = {
				start_date: startDate,
				end_date: endDate,
				duration_out_of_schedule: new GlideDuration(outOfScheduleDurationMS).getDisplayValue(),
				total_duration_out_of_schedule: new GlideDuration(totalOutOfScheduleDurationMS).getDisplayValue(),
				total_duration_all_included: new GlideDuration(totalDurationAllIncludedMS).getDisplayValue()
			};
			this._addDateMapNonGrFields(outOfBusinessScheduleSpan, ['start_date', 'end_date']);
			outOfBusinessScheduleSpans.push(outOfBusinessScheduleSpan);
		}
		return outOfBusinessScheduleSpans;
	},

	getSlaDefinitionDetail: function(contractSlaIds) {
		var gr = new GlideRecord(this.TABLE_CONTRACT_SLA);
		gr.addQuery(this.ATTR_SYS_ID, this.OPR_IN, contractSlaIds);
		gr.query();
		var contractSlaDetails = [];
		while (gr.next()) {
			var contractSlaObj = {};
			contractSlaObj[this.ATTR_SYS_ID] = gr.getValue(this.ATTR_SYS_ID);
			if (gr.canRead() && gr.getElement(this.ATTR_NAME).canRead())
				contractSlaObj[this.ATTR_NAME] = gr.getValue(this.ATTR_NAME);
			else
				contractSlaObj[this.ATTR_NAME] = gs.getMessage('(restricted)');
			contractSlaObj[this.ATTR_URL] = gr.getLink(true);
			contractSlaObj[this.ATTR_COLLECTION] = gr.getValue(this.ATTR_COLLECTION);
			contractSlaDetails.push(contractSlaObj);
		}
		return contractSlaDetails;
	},

	type: 'SLATimeLineV2SNC'
};