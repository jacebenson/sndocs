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

  initialize : function(taskGR, taskType) {
	  this.taskSysId = null;
	  this.taskClass = null;
	  
      if (taskGR) {
         if (!taskType)
            // normal initialization
            this.taskGR = taskGR; 
         else {
            // entry point for Async sys_trigger execution
            // (taskGR is a sys_id, and taskType is its sys_class)
            this.taskGR = new GlideRecord(taskType);
            this.taskGR.get(taskGR);
         }

         this.taskClass = this.taskGR.getRecordClassName();
         this.taskSysId = this.taskGR.getValue('sys_id');
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
      var sw;
      if (this.timers)
         sw = new GlideStopWatch();

      // Process specific tables through Contracts
      if (this._useContract()) {
         this._runContractSLAs();
         return;
      }

      // Check active SLA Definitions
      var slaGR = new GlideRecord('contract_sla');
      slaGR.addActiveQuery();
      slaGR.addQuery('collection', this.taskGR.getRecordClassName());
      // avoid service_offering_sla definitions, if they might exist
      if (slaGR.isValidField('sys_class_name'))
         slaGR.addQuery('sys_class_name', 'contract_sla');

      SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_NEW + this.taskGR.sys_id, this.MUTEX_NEW, this, this._processNewSLAs_criticalSection, slaGR);
      // TODO: optionally attach work-notes
      if (this.timers)
         sw.log('TaskSLAController: Finished _processNewSLAs part 1');

      // and active Service Offering SLA definitions
      // (TODO: merge this contract_sla query with the previous one, to process all of them in one go)
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
        this.fieldValuesLogged = false;
      this.lu.logInfo('_processNewSLAs_criticalSection: ' + this.taskGR.sys_id);
      var sw;
      if (this.timers)
         sw = new GlideStopWatch();

		// Only get the latest task from the database if it hasn't just been created
        if (this.taskGR.operation() != 'insert') {
	  // make sure we have an up to date copy of the Task
	  this.taskGR = new GlideRecord(this.taskClass);
			this.taskGR.setWorkflow(false);
	  this.taskGR.get(this.taskSysId);
		}

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

         this._checkNewSLA(slaGR);

            this.lu.setLevel(oldLogLevel);
        }

      if (this.timers)
         sw.log('TaskSLAController._processNewSLAs_criticalSection complete');
  },

  // check the Attach Conditions of the specified contract_sla (or service_offering_commitment) definition
  // If (SLACondition).attach returns true then attach it to this task
  // 
  // pre-conditions: by this point, we have confirmed that it isn't currently attached to the task,
  //  and we have the Mutex for "Process New SLAs Mutex " + this.taskGR.sys_id) to prevent it being added by another TaskSLAController
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
      
      // adjust pause time of retroactive SLAs, if 'com.snc.sla.retroactive_pause' says so
      var taskSLAadjusted;
		if (slaGR.retroactive && slaGR.retroactive_pause)
         taskSLAadjusted = this._adjustPauseTime(taskSLA.getGlideRecord());
     
      if (!taskSLAadjusted)
         taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS); // adds task_sla record, initiates model state machine, starts notification workflow
      this.lu.logInfo('_checkNewSLA: added SLA "' + slaGR.name + '"');
      
      // TODO: work-notes

      if (this.timers)
         sw.log('TaskSLAController: Finished _checkNewSLA');
	  
	  if (taskSLAadjusted)
		  return taskSLAadjusted;
	  
      return taskSLA;
  },

  // process all of a task's active, attached task_sla records
  _processExistingSLAs: function() {
	  this.lu.logInfo('_processExistingSLAs');
        SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_UPDATE + this.taskGR.sys_id, this.MUTEX_UPDATE, this, this._processExistingSLAs_criticalSection);
  },

  // (called after obtaining SelfCleaningMutex MUTEX_UPDATE: '<<<--Process Existing SLAs Mutex ' + this.taskGR.sys_id + '-->>>', 
  // to prevent simultaneous/overlapping updates of the task_sla records) 
  _processExistingSLAs_criticalSection: function() {
        this.fieldValuesLogged = false;
      this.lu.logInfo('_processExistingSLAs_criticalSection: ' + this.taskGR.sys_id);
      var sw;
      if (this.timers)
         sw = new GlideStopWatch();
	  
		// Only get the latest task from the database if it hasn't just been created
        if (this.taskGR.operation() != 'insert') {
	  // make sure we have an up to date copy of the Task
	  this.taskGR = new GlideRecord(this.taskClass);
		   this.taskGR.setWorkflow(false);
	  this.taskGR.get(this.taskSysId);
		}

        // Log the field values in the Task record
        if (this.lu.getLevel() == GSLog.DEBUG) {
            this.lu.logDebug('_processExistingSLAs_criticalSection:\n' + this.slalogging.getRecordContentMsg(this.taskGR));
            this.fieldValuesLogged = true;
        }

      var taskSLAgr = this.queryTaskSLAs();
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

         this._checkExistingSLA(taskSLAgr);

            this.lu.setLevel(oldLogLevel);
        }

      if (this.timers)
         sw.log('TaskSLAController._processExistingSLAs_criticalSection complete');
  },

  _checkExistingSLA: function(slaGR) {
      var sw;
      if (this.timers)
         sw = new GlideStopWatch();

      this.lu.logDebug('_checkExistingSLA: ' + slaGR.sys_id);
      var taskSLA = new TaskSLA(slaGR); // not yet in the database
      if (this.replayingTask)
         taskSLA.setBreachTimer(false); // disable breach timers on the task_sla, for replay

      // (stop/cancel takes precedence over pause/unpause also matching in the same update to the task record)
      if (!this._stopCancel(taskSLA))
         this._pauseUnpause(taskSLA);

      // TODO: work-notes
      if (this.timers)
         sw.log('TaskSLAController: Finished _checkExistingSLA');
      return taskSLA;
  }, 

  _pauseUnpause: function(taskSLA) {
      var taskSLAgr = taskSLA.getGlideRecord();
      // a "relative-duration" SLA cannot pause, whatever conditions might be in the SLA Definition record
      if (taskSLAgr.sla.duration_type != '')
         return;
            
		var slac = this._newSLACondition(taskSLAgr.sla, this.taskGR, taskSLAgr);
		
		if (taskSLA.getCurrentState() == TaskSLA.STATE_IN_PROGRESS && slac.pause() && !slac.resume()) {
			this.lu.logDebug('_pauseUnpause: Pausing SLA ' + taskSLAgr.getUniqueValue());
         taskSLA.updateState(TaskSLA.STATE_PAUSED);
		}
		else if (taskSLA.getCurrentState() == TaskSLA.STATE_PAUSED && !slac.pause() && slac.resume()) {
			this.lu.logDebug('_pauseUnpause: Resuming SLA ' + taskSLAgr.getUniqueValue());
         taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
		}
  },

  _stopCancel: function(taskSLA) {
		var taskSLAgr = taskSLA.getGlideRecord();
		var slac = this._newSLACondition(taskSLAgr.sla, this.taskGR, taskSLAgr);

        var completeMatches = slac.complete();
        var resetMatches = slac.reattach(this.newSLADefIds);

        this.lu.logDebug('_stopCancel: current SLA state=' + taskSLA.getCurrentState() + ', stop condition matched=' + completeMatches);
        this.lu.logDebug('_stopCancel: current SLA state=' + taskSLA.getCurrentState() + ', reset condition matched=' + resetMatches);

        if (completeMatches || resetMatches) {
         taskSLA.updateState(TaskSLA.STATE_COMPLETED);
         // Re-evaluate conditions for this specific taskSLA,
         //      to allow a 'Complete and reapply' mode of operation
            if (resetMatches) {
                var newTaskSLA = SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_NEW + this.taskGR.sys_id, this.MUTEX_NEW, this, this._checkNewSLA, taskSLAgr.sla.getRefRecord());
            // and just in case it should need to transition to Paused state immediately upon creation
            // make sure the "updateTime" is correct as it may not be if we've been doing a retroactive calculation
            newTaskSLA.setUpdateTime(this.taskGR.sys_updated_on);
            this._pauseUnpause(newTaskSLA);
         }
         return true; // state was changed
        } else {
            var cancelMatches = slac.cancel();
            this.lu.logDebug('_stopCancel: ' + taskSLA.getCurrentState() + ', cancel condition matched=' + cancelMatches);
            if (cancelMatches) {
         taskSLA.updateState(TaskSLA.STATE_CANCELLED);
         return true; // state was changed
      }
        }
  },

  // Use 'Contract SLAs' mode of operation if current task.sys_class_name is listed in the com.snc.sla.contract.tables (CSV) property
  _useContract: function(classname) {
      var contractTables = gs.getProperty('com.snc.sla.contract.tables', '');
      if (!classname)
         classname = this.taskGR.getRecordClassName();
      var list = contractTables.replaceAll(' ', '').split(',');
      return new ArrayUtil().contains(list, classname);
  },

  _runContractSLAs: function() {
      var slaGR = new GlideRecord('contract_sla');
      slaGR.addActiveQuery();
      slaGR.addQuery('collection', this.taskGR.getRecordClassName());
      // contract_rel_contract_sla.contract=this.taskGR.contract
      slaGR.addQuery('JOINcontract_sla.sys_id=contract_rel_contract_sla.contract_sla!contract=' + this.taskGR.contract);
        SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_NEW + this.taskGR.sys_id, this.MUTEX_NEW, this, this._processNewSLAs_criticalSection, slaGR);
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
   
  // generate & replay task history, to adjust pause duration, pause time of retroactive-start SLAs
  // (runs from within the _processNewSLAs_criticalSection)
  _adjustPauseTime: function(taskSLAgr) {
      this.lu.logInfo('_adjustPauseTime: Adjusting pause time for retroactive SLA ' + taskSLAgr.sla.name + ' on ' + taskSLAgr.task.number);
      if (this.taskGR.operation() == 'insert')
         // nothing to adjust for, as the task can have no previous updates
         return;
      if (taskSLAgr.sla.duration_type != '' || !taskSLAgr.sla.pause_condition)
         // relative duration SLAs, and those without pause conditions, cannot pause
         return;
		if (!taskSLAgr.sla.retroactive || !taskSLAgr.sla.retroactive_pause)
			// (shouldn't have been called for a non retroactive pause SLA)
         return;
      if (this.taskGR.isNewRecord()) {
         this.lu.logWarning('Cannot adjust SLA pause time on a new task record');
         return;
      }
      if (!(new GlideAuditor(this.taskGR.getTableName(), null).auditTable())) {
         this.lu.logError('Cannot adjust SLA pause time for a retroactive start - auditing not enabled on ' + this.taskGR.getTableName()); 
         return;
      }
     
      var updateTime = taskSLAgr.getValue('sys_updated_on');
      this.lu.logInfo('_adjustPauseTime: at ' + updateTime);

      // create a 'mock' task record, which will be stepped through the history of the real one
      // (and then discarded)
      var taskGR = new GlideRecord(this.taskGR.getRecordClassName());
      taskGR.setNewGuidValue(this.taskGR.sys_id);
      taskGR.autoSysFields(false);
        var historyGR = this._repairHistory(this.taskGR);
      // temporarily switch real taskGR with our mock one, because _pauseUnpause references this.taskGR
      var originalTaskGR = this.taskGR;
      this.taskGR = taskGR;

      var updateSeq = 0;     
      var sys_updated_on;
	  var fieldName;
      var taskSLA = new TaskSLA(taskSLAgr);
      taskSLA.setRetroactiveAdjusting(true);
      taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
      while (historyGR.next()) {
         // run the SLA processing when all of an update sequence's entries have been processed, bar the last one
         if (historyGR.update != updateSeq) {
            if (updateSeq == 0)
               taskGR.setValue('sys_created_on', sys_updated_on);
            taskGR.setValue('sys_updated_on', sys_updated_on);
            this.lu.logDebug('_adjustPauseTime: [' + updateSeq + '] history update time: ' + sys_updated_on);

            taskSLA.setUpdateTime(sys_updated_on);
			this._pauseUnpause(taskSLA);
			updateSeq = historyGR.getValue('update');
         }          
		 fieldName = historyGR.getValue('field');
		 if (!fieldName.startsWith('sys_') || fieldName == 'sys_domain') {
			var newValue = historyGR.getValue("new_value");
			if (JSUtil.nil(newValue))
				newValue = historyGR.getValue("new");
            this.lu.logDebug('_adjustPauseTime: [' + historyGR.update + '] historyGR.field ' + fieldName + ' = ' + newValue);
			taskGR.setValue(fieldName, newValue);
		 }
         sys_updated_on = historyGR.getValue('update_time');
      }
      // (Skip processing the last update, because that is the one that just happened)
      taskSLA.setRetroactiveAdjusting(false);
      this.lu.logDebug('taskSLA: starting=' + taskSLA.starting);
     
      // set back to the real task
      this.taskGR = originalTaskGR;
      taskSLAgr = taskSLA.getGlideRecord();
        this.lu.logInfo('Finished adjusting pause time for retroactive SLA ' + taskSLAgr.sla.name + ' on ' + taskSLAgr.task.number + ': pause_duration=' + taskSLAgr.pause_duration + ', pause_time='
                + taskSLAgr.pause_time.getDisplayValue());
      return taskSLA;
  },

    _repairHistory: function(taskGR) {
        // (repair per sys_ui_action: 'Show History')
      var hs = new GlideHistorySet(taskGR);
      var hs_sys_id = hs.generate();
      var historyGR = new GlideRecord('sys_history_line');
      historyGR.addQuery('set', hs_sys_id);
      historyGR.addQuery('type','audit').addOrCondition('type','');
      historyGR.orderBy('update');
      historyGR.query();
      return historyGR;
  },

  type: 'TaskSLAController'
};