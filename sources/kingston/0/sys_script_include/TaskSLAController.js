var TaskSLAController = Class.create();

TaskSLAController.prototype = {
	
	// sys_properties
	SLA_ENGINE_ASYNC: 'com.snc.sla.engine.async',
	SLA_TASK_SLA_CONTROLLER_LOG: 'com.snc.sla.task_sla_controller.log',
	SLA_TASK_SLA_CONTROLLER_TIMERS: 'com.snc.sla.task_sla_controller.timers',
	SLA_TASK_SLA_DEFAULT_CONDITIONCLASS: 'com.snc.sla.default_conditionclass',
	SLA_DATABASE_LOG: 'com.snc.sla.log.destination',
	SLA_SERVICE_OFFERING: 'com.snc.service.offering.field',
	// constants
	BASE_CONDITIONCLASSNAME: 'SLAConditionBase',
	RESET_ACTION_CANCEL: 'cancel',
	RESET_ACTION_COMPLETE: 'complete',
	
	initialize : function(taskGR, taskType) {
		this.taskSysId = null;
		this.taskClass = null;
		this.taskLatestModCount = -1;
		this.taskGR = null;
		this.taskHistoryWalker = null;
		this.calledFromAsync = false;
		
		if (taskGR) {
			if (!taskType)
				// normal initialization
				this.taskGR = taskGR;
			else {
				// entry point for Async sys_trigger execution
				// (taskGR is a sys_id, and taskType is its sys_class)
				this.taskGR = new GlideRecord(taskType);
				this.taskGR.get(taskGR);
				this.calledFromAsync = true;
			}
			
			this.taskClass = this.taskGR.getRecordClassName();
			this.taskSysId = this.taskGR.getValue('sys_id');
			this.taskLatestModCount = parseInt(this.taskGR.getValue('sys_mod_count'), 10);
		}
		
		this.runningAsync = (gs.getProperty(this.SLA_ENGINE_ASYNC, 'true') == 'true');
		// SLAConditionClass default override
		this.SLADefaultConditionClassName = gs.getProperty(this.SLA_TASK_SLA_DEFAULT_CONDITIONCLASS, 'SLAConditionBase');
		// for TaskSLAreplay
		this.replayingTask = false;
		// trace, debug, logging
		this.timers = (gs.getProperty(this.SLA_TASK_SLA_CONTROLLER_TIMERS, 'false') == 'true');
		this.lu = new GSLog(this.SLA_TASK_SLA_CONTROLLER_LOG, 'TaskSLAController');
		this.lu.includeTimestamp();
		//Default Service Offering field
		this.serviceOfferingField = gs.getProperty(this.SLA_SERVICE_OFFERING, 'cmdb_ci');
		if (gs.getProperty(this.SLA_DATABASE_LOG, "db") == "node")
			this.lu.disableDatabaseLogs();
		this.newSLADefIds = [];
		this.lu.logDebug('newSLADefIds initialized to length=' + this.newSLADefIds.length);
		this.slalogging = new TaskSLALogging();
		this.slaContractUtil = new SLAContractUtil();
	},
	
	// run TaskSLAController once with the task's current state
	run: function() {
		if (this.runningAsync)
			this._queueAsync();
		else
			this.runNow();
	},
	
	// run once synchronously, even if the property says otherwise
	runSync: function() {
		this.runningAsync = false;
		this.runNow();
	},
	
	// also called when running from asynchronous job
	runNow: function() {
		if (!this.taskSysId || !this.taskClass) {
			this.lu.logWarn('runNow: no Task supplied so TaskSLAController cannot continue');
			return;
		}
		
		// if we've been called from a "sys_trigger" record because SLA processing is running asynchronously
		// then we use HistoryWalker to get the Task record at the current update number so we've got the
		// "changes" information for each field
		if (this.calledFromAsync)
			this._walkTaskToUpdate(this.taskLatestModCount);
		
		var sw;
		if (this.timers)
			sw = new GlideStopWatch();
		this.lu.logInfo('runNow: starting now (sys_updated=' + this.taskGR.sys_updated_on.getDisplayValue() + ')');
		this.lu.logDebug('runNow: ' + this.slalogging.getBusinessRuleStackMsg());
		this.lu.logDebug('runNow: previous and current values\n' + this.slalogging.getRecordContentMsg(previous, '"previous"') + '\n' + this.slalogging.getRecordContentMsg(current, '"current"'));
		this._processNewSLAs();
		this._processExistingSLAs();
		if (this.timers)
			sw.log('TaskSLAController.runNow complete');
	},
	
	setTaskGR: function(taskGR) {
		this.taskGR = taskGR;
	},
	
	getTaskGR: function(taskGR) {
		return this.taskGR;
	},
	
	setReplaying: function(enable) {
		this.replayingTask = enable;
	},
	
	// Enable Stopwatch timers
	// (used for profiling performance)
	setTimers: function(enable) {
		this.timers = enable;
	},
	
	// return GlideRecord result set of task's active task_sla records
	queryTaskSLAs: function() {
		var taskSLAgr = new GlideRecord('task_sla');
		taskSLAgr.addActiveQuery();
		taskSLAgr.addQuery('task', this.taskGR.sys_id);
		taskSLAgr.query();
		this.lu.logDebug('queryTaskSLAs: #' + taskSLAgr.getRowCount());
		return taskSLAgr;
	},
	
	/////////////////////////////
	
	// mutex names
	MUTEX_NEW: 'Process New SLAs Mutex ',
	MUTEX_UPDATE: 'Process Existing SLAs Mutex ',
	
	// internal methods
	
	_queueAsync: function() {
		var now = new GlideDateTime();
		var taskClass = this.taskGR.getRecordClassName();
		var taskSysId = this.taskGR.getValue('sys_id');
		// gr, scriptID, user, name
		
		var tGR = new GlideRecord('sys_trigger');
		// RunAs: tGR.gs.getUserID()
		tGR.document = taskClass;
		tGR.document_key.setDisplayValue(taskSysId);
		tGR.name = 'ASYNC: Run SLAs ' + taskSysId;
		tGR.script = "new TaskSLAController('" + taskSysId + "','" + taskClass + "').runNow();";
		tGR.next_action = now;
		tGR.trigger_type = 0; // "Run Once"
		// tGR.trigger_class = ...;
		tGR.job_id.setDisplayValue('RunScriptJob');
		// tGR.job_context = ...;
		tGR.insert();
		this.lu.logInfo('_queueAsync: inserted sys_trigger job for ' + taskSysId + ', ' + taskClass);
	},
	
	_processNewSLAs: function() {
		this.lu.logInfo('_processNewSLAs');

		if (!(new SLACacheManager().hasDefinitionForRecord(this.taskGR))) {
			this.lu.logInfo('_processNewSLAs: no active SLA definitions defined for this Task - ' + this.taskClass + ":" + this.taskSysId);
			return;
		}
		
		var sw;
		if (this.timers)
			sw = new GlideStopWatch();
		
		var slaGR = this._getSLAsQueryCheckingContracts();
		
		SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_NEW + this.taskGR.sys_id, this.MUTEX_NEW, this, this._processNewSLAs_criticalSection, slaGR);
		// TODO: optionally attach work-notes
		if (this.timers)
			sw.log('TaskSLAController: Finished _processNewSLAs part 1');
		
		// and active Service Offering SLA definitions
		// (TODO: merge this contract_sla query with the previous one, to process all of them in one go)
		if (!this._allowProcessingServiceCommitment())
			return;
		
		var socGR = new GlideRecord('service_offering_commitment');
		if (!socGR.isValid())
			return;
		
		var commitmentFieldTest = new GlideRecord('service_commitment');
		if (!commitmentFieldTest.isValidField("sla"))
			return;
		
		if (this.timers)
			sw = new GlideStopWatch();
		// (using contract_sla GlideRecord to easily avoid
		//  those that are currently active and assigned to the task)
		slaGR.initialize();
		slaGR.addActiveQuery();
		slaGR.addQuery('collection', this.taskGR.getRecordClassName());
		// service_commitment.type='SLA'
		slaGR.addQuery('JOINcontract_sla.sys_id=service_commitment.sla!type=SLA');
		// service_offering_commitment.service_offering=cmdb_ci
		slaGR.addQuery('JOINservice_commitment.sys_id=service_offering_commitment.service_commitment!service_offering=' + this.taskGR.getValue(this.serviceOfferingField));
		
		SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_NEW + this.taskGR.sys_id, this.MUTEX_NEW, this, this._processNewSLAs_criticalSection, slaGR);
		// TODO: optionally attach more work-notes
		if (this.timers)
			sw.log('TaskSLAController: Finished _processNewSLAs part 2');
	},
	
	// (called after obtaining SelfCleaningMutex: '<<<--Process New SLAs Mutex ' + this.taskGR.sys_id + '-->>>')
	// NB. adds to slaGR query, before executing it.
	_processNewSLAs_criticalSection: function(slaGR) {
		var newTaskSLA;
		var newTaskSLAs = [];
		this.fieldValuesLogged = false;
		this.lu.logInfo('_processNewSLAs_criticalSection: ' + this.taskGR.sys_id);
		var sw;
		if (this.timers)
			sw = new GlideStopWatch();
		
		// Log the field values in the Task record
		if (this.lu.getLevel() == GSLog.DEBUG) {
			this.lu.logDebug('_processNewSLAs_criticalSection:\n' + this.slalogging.getRecordContentMsg(this.taskGR));
			this.fieldValuesLogged = true;
		}
		
		// skip any active SLAs already (indirectly) attached to this task -- must be done inside of mutex
		slaGR.addQuery('sys_id', 'NOT IN', this._getSLAsString(this.queryTaskSLAs()));
		slaGR.addDomainQuery(this.taskGR);
		slaGR.query();
		while (slaGR.next()) {
			var oldLogLevel = this.lu.getLevel();
			// if enable logging has been checked on the SLA definition up the log level to "debug"
			if (slaGR.enable_logging) {
				this.lu.setLevel(GSLog.DEBUG);
				if (!this.fieldValuesLogged) {
					this.lu.logDebug('_processNewSLAs_criticalSection:\n' + this.slalogging.getRecordContentMsg(this.taskGR));
					this.fieldValuesLogged = true;
				}
			}
			
			newTaskSLA = this._checkNewSLA(slaGR);
			if (newTaskSLA)
				newTaskSLAs.push(newTaskSLA);
			
			
			this.lu.setLevel(oldLogLevel);
		}
		
		if (newTaskSLAs.length > 0) {
			this._adjustPauseTime(newTaskSLAs);
			for (var i = 0; i < newTaskSLAs.length; i++) {
				newTaskSLA = newTaskSLAs[i];
				if (newTaskSLA.needsAdjusting && !newTaskSLA.adjusted)
					newTaskSLA.taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
			}
		}
		
		if (this.timers)
			sw.log('TaskSLAController._processNewSLAs_criticalSection complete');
	},
	
	// Gets the SLA definitions to process taking the contracts into account
	_getSLAsQueryCheckingContracts: function() {
		var collection = this.taskGR.getRecordClassName();
		// if contract is not active for this table, we process all SLAs
		if (this.slaContractUtil.ignoreContract(collection))
			return this.slaContractUtil.getAllSLAsQuery(collection);
		
		var contractGR = this.taskGR.contract;
		// if the task has a contract attached we process the SLAs linked to the contract and, if enabled, the non-contractual SLAs
		if (contractGR){
			var includeNonContractual = this.slaContractUtil.processNonContractualSLAs(contractGR);
			var slaGR = this.slaContractUtil.getContractualSLAs(contractGR, collection, includeNonContractual);
			return slaGR;
		}
		
		// if the task doesn't have a contract, we process non-contractual (but only if the contract table property doesn't exist to preserve legacy behavior)
		if (!this.slaContractUtil.hasContractProperty())
			return this.slaContractUtil.getNonContractualSLAs(collection);
		
		// if nothing of the above matches, return an empty query
		var emptySlaGR = new GlideRecord('contract_sla');
		emptySlaGR.setLimit(0);
		return emptySlaGR;
	},
	
	_allowProcessingServiceCommitment: function() {
		var collection = this.taskGR.getRecordClassName();
		// if contract does not allow to process non-contractual SLAs, Service Offering SLAs are not processed either
		return this.slaContractUtil.ignoreContract(collection)
		|| (!this.taskGR.contract && !this.slaContractUtil.hasContractProperty())
		|| this.slaContractUtil.processNonContractualSLAs(this.taskGR.contract);
	},
	
	/*
	Check the Attach Conditions of the specified contract_sla (or service_offering_commitment) definition
	If (SLACondition).attach returns true then attach it to this task
	
	pre-conditions: by this point, we have confirmed that it isn't currently attached to the task,
	and we have the Mutex for "Process New SLAs Mutex " + this.taskGR.sys_id) to prevent it being added by another TaskSLAController
 	*/
	_checkNewSLA: function(slaGR) {
		var sw;
		if (this.timers)
			sw = new GlideStopWatch();
		var slac = this._newSLACondition(slaGR, this.taskGR);
		var startMatches = slac.attach();
		this.lu.logDebug('_checkNewSLA: checking ' + slaGR.name + ', start condition matched=' + startMatches);
		
		if (!startMatches)
			return;
		
		var taskSLA = new TaskSLA(slaGR, this.taskGR, /* deferInsert */ true);
		this.newSLADefIds.push(slaGR.getValue('sys_id'));
		this.lu.logDebug('_checkNewSLA newSLADefIds=[' + this.newSLADefIds.join() + ']');
		
		// this object will contain properties to indicate if this new Task SLA needs retroactive pause time calculated,
		// if the adjust pause was succesful and also the TaskSLA object itself
		var newTaskSLA = {
			"needsAdjusting": false,
			"adjusted": false
		};
		
		// Check if this TaskSLA needs retroactive pause calculation
		if (this._needsAdjustPause(slaGR))
			newTaskSLA.needsAdjusting = true;
		else {
			taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS); // adds task_sla record, initiates model state machine, starts notification workflow
			this.lu.logInfo('_checkNewSLA: added SLA "' + slaGR.name + '"');
		}
		
		// add the TaskSLA object to our exising newTaskSLA object
		newTaskSLA.taskSLA = taskSLA;
		
		// TODO: work-notes
		
		if (this.timers)
			sw.log('TaskSLAController: Finished _checkNewSLA');
		
		return newTaskSLA;
	},
	
	_checkNewSLAsFromReset: function(resetSLAs) {
		this._checkNewSLAsForDefs(resetSLAs);
	},
	
	_checkNewSLAsForDefs: function(slaDefIds) {
		if (!slaDefIds || slaDefIds.length == 0)
			return;
		
		var slaGR = new GlideRecord('contract_sla');
		slaGR.addActiveQuery();
		slaGR.addQuery('sys_id', slaDefIds);
		slaGR.addDomainQuery(this.taskGR);
		slaGR.query();
		
		var newTaskSLAs = [];
		var newTaskSLADefIds = [];
		var newTaskSLA;
		while (slaGR.next()) {
			newTaskSLA = this._checkNewSLA(slaGR);
			if (newTaskSLA) {
				newTaskSLAs.push(newTaskSLA);
				newTaskSLADefIds.push(slaGR.getValue('sys_id'));
			}
		}
		
		// Perform the retroactive pause adjustment for the ones that need it
		if (newTaskSLAs.length > 0) {
			this._adjustPauseTime(newTaskSLAs);
			for (var i = 0; i < newTaskSLAs.length; i++) {
				newTaskSLA = newTaskSLAs[i];
				if (newTaskSLA.needsAdjusting && !newTaskSLA.adjusted)
					newTaskSLA.taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
				
				// and just in case it should need to transition to Paused state immediately upon creation
				// make sure the "updateTime" is correct as it may not be if we've been doing a retroactive calculation
				newTaskSLA.taskSLA.setUpdateTime(this.taskGR.sys_updated_on);
				this._pauseUnpause(newTaskSLA.taskSLA);
			}
		}
		
		return newTaskSLADefIds;
	},
	
	// process all of a task's active, attached task_sla records
	_processExistingSLAs: function() {
		this.lu.logInfo('_processExistingSLAs');

		// Get the current set of active Task SLAs for this record
		var taskSLAgr = this.queryTaskSLAs();
		if (!taskSLAgr.hasNext()) {
			this.lu.logInfo('_processExistingSLAs: no active Task SLAs found for Task - ' + this.taskClass + ":" + this.taskSysId);
			return;
		}
		
		SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_UPDATE + this.taskGR.sys_id, this.MUTEX_UPDATE, this, this._processExistingSLAs_criticalSection, taskSLAgr);
	},
	
	// (called after obtaining SelfCleaningMutex MUTEX_UPDATE: '<<<--Process Existing SLAs Mutex ' + this.taskGR.sys_id + '-->>>',
	// to prevent simultaneous/overlapping updates of the task_sla records)
	_processExistingSLAs_criticalSection: function(taskSLAgr) {
		this.fieldValuesLogged = false;
		this.lu.logInfo('_processExistingSLAs_criticalSection: ' + this.taskGR.sys_id);
		var sw;
		if (this.timers)
			sw = new GlideStopWatch();
		
		// Log the field values in the Task record
		if (this.lu.getLevel() == GSLog.DEBUG) {
			this.lu.logDebug('_processExistingSLAs_criticalSection:\n' + this.slalogging.getRecordContentMsg(this.taskGR));
			this.fieldValuesLogged = true;
		}
		
		var resetTaskSLAs = [];
		while (taskSLAgr.next()) {
			var oldLogLevel = this.lu.getLevel();
			// if enable logging has been checked on the SLA definition up the log level to "debug"
			if (taskSLAgr.sla.enable_logging) {
				this.lu.setLevel(GSLog.DEBUG);
				if (!this.fieldValuesLogged) {
					this.lu.logDebug('_processExistingSLAs_criticalSection:\n' + this.slalogging.getRecordContentMsg(this.taskGR));
					this.fieldValuesLogged = true;
				}
			}
			
			taskSLA = this._getTaskSLA(taskSLAgr);
			conditionResults = this._checkExistingSLA(taskSLA);
			if (this.lu.atLevel(GSLog.DEBUG))
				this.lu.logDebug("Condition results for Task SLA " + taskSLAgr.sla.getDisplayValue() + " on task " + taskSLAgr.task.number +
								 ":\n" + new JSON().encode(conditionResults));
			
			if (conditionResults.stopCancel.reset && !conditionResults.stopCancel.skipResetAction)
				resetTaskSLAs.push(taskSLAgr.getValue('sla'));
			
			this.lu.setLevel(oldLogLevel);
		}
		
		if (resetTaskSLAs.length > 0)
			SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_NEW + this.taskGR.sys_id, this.MUTEX_NEW,
				this, this._checkNewSLAsFromReset, resetTaskSLAs);
		
		if (this.timers)
			sw.log('TaskSLAController._processExistingSLAs_criticalSection complete');
	},
	
	_getTaskSLA: function(taskSLAgr) {
		return new TaskSLA(taskSLAgr);
	},
	
	_checkExistingSLA: function(taskSLA) {
		var sw;
		if (this.timers)
			sw = new GlideStopWatch();
		
		this.lu.logDebug('_checkExistingSLA: ' + taskSLA.getGlideRecord().sys_id);
		
		if (this.replayingTask)
			taskSLA.setBreachTimer(false); // disable breach timers on the task_sla, for replay
		
		var conditionResults = {
			stopCancel: {
				
			},
			pauseResume: {
				
			}
		};
		// (stop/cancel takes precedence over pause/unpause also matching in the same update to the task record)
		conditionResults.stopCancel = this._stopCancel(taskSLA);
		
		if (!conditionResults.stopCancel.conditionMatched)
			conditionResults.pauseResume = this._pauseUnpause(taskSLA);
		
		// TODO: work-notes
		if (this.timers)
			sw.log('TaskSLAController: Finished _checkExistingSLA');
		
		return conditionResults;
	},
	
	_pauseUnpause: function(taskSLA) {
		var conditionResults = {
			
		};
		
		var taskSLAgr = taskSLA.getGlideRecord();
		// a "relative-duration" SLA cannot pause, whatever conditions might be in the SLA Definition record
		if (taskSLAgr.sla.duration_type != '')
			return;
		
		var slac = this._newSLACondition(taskSLAgr.sla, this.taskGR, taskSLAgr);
		conditionResults.pause = slac.pause();
		conditionResults.resume = slac.resume();
		conditionResults.conditionMatched = conditionResults.pause || conditionResults.resume;
		
		if (taskSLA.getCurrentState() == TaskSLA.STATE_IN_PROGRESS && conditionResults.pause && !conditionResults.resume) {
			this.lu.logDebug('_pauseUnpause: Pausing SLA ' + taskSLAgr.getUniqueValue());
			conditionResults.stageChangedTo = TaskSLA.STATE_PAUSED;
			taskSLA.updateState(TaskSLA.STATE_PAUSED);
		}
		else if (taskSLA.getCurrentState() == TaskSLA.STATE_PAUSED && !conditionResults.pause && conditionResults.resume) {
			this.lu.logDebug('_pauseUnpause: Resuming SLA ' + taskSLAgr.getUniqueValue());
			conditionResults.stageChangedTo = TaskSLA.STATE_IN_PROGRESS;
			taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
		}
		
		return conditionResults;
	},
	
	_stopCancel: function(taskSLA, skipResetAction /*set true from ReadOnlyTaskSLAController*/) {
		var conditionResults = {
			conditionMatched: true,
			skipResetAction: !skipResetAction ? false : true
		};
		
		var taskSLAgr = taskSLA.getGlideRecord();
		this.lu.logDebug('_stopCancel: task is: ' + this.taskGR.getValue("number"));
		var slac = this._newSLACondition(taskSLAgr.sla, this.taskGR, taskSLAgr);
		
		conditionResults.complete = slac.complete();
		conditionResults.reset = slac.reattach(this.newSLADefIds);
		
		this.lu.logDebug('_stopCancel: current SLA state=' + taskSLA.getCurrentState() + ', stop condition matched=' + conditionResults.complete);
		this.lu.logDebug('_stopCancel: current SLA state=' + taskSLA.getCurrentState() + ', reset condition matched=' + conditionResults.reset);
		
		if (conditionResults.complete) {
			taskSLA.updateState(TaskSLA.STATE_COMPLETED);
			conditionResults.stageChangedTo = TaskSLA.STATE_COMPLETED;
			return conditionResults; // state was changed
		}
		
		// Re-evaluate conditions for this specific taskSLA,
		//      to allow a 'Complete and reapply' mode of operation
		if (conditionResults.reset) {
			var resetExistingSLATo = taskSLAgr.sla.reset_action == this.RESET_ACTION_CANCEL ? TaskSLA.STATE_CANCELLED : TaskSLA.STATE_COMPLETED;
			taskSLA.updateState(resetExistingSLATo);
			conditionResults.stageChangedTo = resetExistingSLATo;
			taskSLA.isReset = true; //flag to detect reset in the taskSLA object
			return conditionResults; // state was changed
		} else {
			conditionResults.cancel = slac.cancel();
			this.lu.logDebug('_stopCancel: ' + taskSLA.getCurrentState() + ', cancel condition matched=' + conditionResults.cancel);
			if (conditionResults.cancel) {
				taskSLA.updateState(TaskSLA.STATE_CANCELLED);
				conditionResults.stageChangedTo = TaskSLA.STATE_CANCELLED;
				return conditionResults; // state was changed
			}
		}
		
		conditionResults.conditionMatched = false;
		return conditionResults;
	},
	
	// method to assist overriding the SLA Condition class
	// -- returns a new SLAConditionClass object
	_newSLACondition: function(slaGR, taskGR, taskSLAgr) {
		// Use the same class, as default, during any one instance of the TaskSLAController
		if (!this._outerScope)
			this._outerScope = JSUtil.getGlobal();
		if (!this._SLADefaultConditionClass) {
			this._SLADefaultConditionClass = this._outerScope[this.SLADefaultConditionClassName];
			// check that this._SLADefaultConditionClass is defined, and looks valid as an SLA Condition Class
			if (!this._isValidSLAConditionClass(this._SLADefaultConditionClass)) {
				this.lu.logWarning('Invalid SLA Default Condition Class: ' + this.SLADefaultConditionClassName + ', using ' + this.BASE_CONDITIONCLASSNAME);
				this._SLADefaultConditionClass = this._outerScope[this.BASE_CONDITIONCLASSNAME];
				this.SLADefaultConditionClassName = this.BASE_CONDITIONCLASSNAME;
			}
		}
		
		var slaConditionClass = this._SLADefaultConditionClass;
		// if the SLA Definition references a specific Condition Class then use that
		// (as long as it looks valid)
		if (JSUtil.notNil(slaGR.condition_class) && slaGR.condition_class.active) {
			slaConditionClass = this._outerScope[slaGR.condition_class.class_name.name];
			
			if (!this._isValidSLAConditionClass(slaConditionClass)) {
				this.lu.logWarning('Invalid SLA Condition Class: ' + slaGR.condition_class.class_name.name + ', using ' + this.SLADefaultConditionClassName);
				slaConditionClass = this._SLADefaultConditionClass;
			}
		}
		
		var sco = new slaConditionClass(slaGR, taskGR, taskSLAgr);
		this.lu.logInfo('_newSLACondition: using ' + sco.type);
		return sco;
	},
	
	// does klass look valid as an SLAConditionClass?
	_isValidSLAConditionClass: function(klass) {
		if (typeof klass == 'undefined')
			return false;
		
		var conditionMethods = ['attach', 'pause', 'complete', 'reattach', 'cancel'];
		for (var i = 0; i < conditionMethods.length; i++)
			if (typeof klass.prototype[conditionMethods[i]] == 'undefined')
			return false;
		return true;
	},
	
	// methods to manipulate the task's associated task_sla and contract_sla records.
	
	// return comma-separated list of contract_sla sys_ids, given GlideRecord result set from taskSLAgr.query()
	// suitable for 'sys_idIN' or 'sys_idNOT IN' queries
	_getSLAsString: function(taskSLAgr) {
		var slaList = [];
		//taskSLAgr.query();
		while (taskSLAgr.next())
			slaList.push(taskSLAgr.sla.sys_id.toString());
		var queryString = slaList.join(',');
		return queryString;
	},
	
	_needsAdjustPause: function(slaGR) {
		// relative duration SLAs, and those without pause conditions, cannot pause
		if (slaGR.duration_type != '' || !slaGR.pause_condition)
			return false;
		
		// (shouldn't have been called for a non retroactive pause SLA)
		if (!slaGR.retroactive || !slaGR.retroactive_pause)
			return false;
		
		return true;
	},
	
	// generate & replay task history, to adjust pause duration, pause time of retroactive-start SLAs
	// (runs from within the _processNewSLAs_criticalSection)
	_adjustPauseTime: function(slasToAdjust) {
		this.lu.logInfo('_adjustPauseTime: Adjusting pause time for retroactive SLAs on ' + this.taskGR.number);
		if (!slasToAdjust || slasToAdjust.length == 0) {
			this.lu.logWarning('There are no SLAs to be adjusted');
			return;
		}
		
		// nothing to adjust for, as the task can have no previous updates
		if (this.taskGR.operation() == 'insert')
			return;
		
		if (this.taskGR.isNewRecord()) {
			this.lu.logWarning('Cannot adjust SLA pause time on a new task record');
			return;
		}
		if (!(new GlideAuditor(this.taskGR.getTableName(), null).auditTable())) {
			this.lu.logError('Cannot adjust SLA pause time for a retroactive start - auditing not enabled on ' + this.taskGR.getTableName());
			return;
		}
		
		this.lu.logInfo('_adjustPauseTime: at ' + this.taskGR.getValue("sys_updated_on"));
		
		var hasRetroSLAs = false;
		for (var i = 0; i < slasToAdjust.length; i++) {
			if (slasToAdjust[i].needsAdjusting) {
				hasRetroSLAs = true;
				break;
			}
		}
		
		if (!hasRetroSLAs)
			return;
		
		var hw;
		var hwException = false;
		try {
			hw = new sn_hw.HistoryWalker(this.taskGR.getRecordClassName(), this.taskGR.getValue('sys_id'));
		} catch(e) {
			this.lu.logError("_adjustPauseTime: HistoryWalker exception: " + e);
			hwException = true;
		}
			
		if (hwException) {
			this.lu.logError("_adjustPauseTime failed for " + this.taskClass + " record with sys_id " + this.taskSysId);
			return;
		}

		hw.setRecordLevelSecurity(false);
		hw.setFieldLevelSecurity(false);
		hw.setWithVariables(true);
		hw.walkTo(0);
		
		// save a reference to the current task record before we start stepping through the updates
		var originalTaskGR = this.taskGR;
		
		var initialUpdateProcessed = false;
		
		var currentModCount = this.taskGR.getValue('sys_mod_count');
		do {
			this.taskGR = hw.getWalkedRecord();
			if (this.taskGR.getValue('sys_mod_count') == currentModCount)
				break;
			
			this.lu.logDebug('_adjustPauseTime: [' + this.taskGR.getValue('sys_mod_count') + '] history update time: ' + this.taskGR.getValue('sys_updated_on'));
			for (var j = 0; j < slasToAdjust.length; j++) {
				if (!slasToAdjust[j].needsAdjusting)
					continue;
				
				taskSLA = slasToAdjust[j].taskSLA;
				if (!initialUpdateProcessed) {
					slasToAdjust[j].adjusted = true;
					taskSLA.setRetroactiveAdjusting(true);
					taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
					taskSLA.starting = false;
				}
				
				taskSLA.setUpdateTime(this.taskGR.getValue('sys_updated_on'));
				var conditionResults = this._pauseUnpause(taskSLA);

				if (this.lu.atLevel(GSLog.DEBUG)) {
					taskSLAgr = taskSLA.getGlideRecord();
					this.lu.logDebug("Condition Results for Task SLA " + taskSLAgr.sla.getDisplayValue() + ": " + new JSON().encode(conditionResults));
					this.lu.logDebug("Business elapsed: " + taskSLAgr.business_duration.getDurationValue() + ", Pause duration: " + taskSLAgr.pause_duration.getDurationValue() +
									 ", Pause time: " + taskSLAgr.pause_time.getDisplayValue());
				}
			}
			
			initialUpdateProcessed = true;
		} while (hw.walkForward());
		
		for (var i = 0; i < slasToAdjust.length; i++) {
			if (!slasToAdjust[i].adjusted)
				continue;
			
			taskSLA = slasToAdjust[i].taskSLA;
			taskSLA.starting = true;
			taskSLA.setRetroactiveAdjusting(false);
			if (this.lu.atLevel(GSLog.INFO)) {
				taskSLAgr = taskSLA.getGlideRecord();
				this.lu.logInfo('Finished adjusting pause time for retroactive SLA ' + taskSLAgr.sla.name + ' on ' + taskSLAgr.task.number + ': pause_duration=' + taskSLAgr.pause_duration + ', pause_time='
				+ taskSLAgr.pause_time.getDisplayValue());
			}
			this.lu.logDebug('taskSLA: starting=' + taskSLA.starting);
		}
		
		// set back to the real task
		this.taskGR = originalTaskGR;
		
		return;
	},
	
	_walkTaskToUpdate: function(updateNumber) {
		if (isNaN(updateNumber))
			return;
		
		var hwException = false;
		if (!this.taskHistoryWalker) {
			try {
				this.taskHistoryWalker = new sn_hw.HistoryWalker(this.taskClass, this.taskSysId);
				this.taskHistoryWalker.setRecordLevelSecurity(false);
				this.taskHistoryWalker.setFieldLevelSecurity(false);
				this.taskHistoryWalker.setWithVariables(true);
			} catch(e) {
				this.taskHistoryWalker = null;
				this.lu.logError("_walkTaskToUpdate: HistoryWalker exception: " + e);
				hwException = true;
			}
		}
		
		if (hwException) {
			this.lu.logError("_walkTaskToUpdate failed for " + this.taskClass + " record with sys_id " + this.taskSysId);
			return;
		}		

		if (this.taskHistoryWalker.walkTo(parseInt(updateNumber, 10)))
			this.taskGR = this.taskHistoryWalker.getWalkedRecord();
	},
	
	type: 'TaskSLAController'
};