var RepairTaskSLAController = Class.create();

RepairTaskSLAController.prototype = Object.extendsObject(TaskSLAController, {
    initialize: function(taskGR, taskType) {
        TaskSLAController.prototype.initialize.call(this, taskGR, taskType);
        this.slaDefIds = null;
        this.runWorkflow = false;
    },

    restrictSLADefinitions: function(slaDefIds) {
        this.slaDefIds = slaDefIds;
    },

    setRunWorkflow: function(runWorkflow) {
        this.runWorkflow = runWorkflow;
    },

    /**
     * (called after obtaining SelfCleaningMutex: '<<<--Process New SLAs Mutex ' + this.taskGR.sys_id + '-->>>')
     * 
     * NB. adds to slaGR query, before executing it.
     */
    _processNewSLAs_criticalSection: function(slaGR) {
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

            this._checkNewSLA(slaGR);

            this.lu.setLevel(oldLogLevel);
        }

        if (this.timers)
            sw.log('TaskSLAController._processNewSLAs_criticalSection complete');
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
        if (this.slaDefIds)
            slaGR.addQuery('sys_id', this.slaDefIds);
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
        if (this.slaDefIds)
            slaGR.addQuery('sys_id', this.slaDefIds);
        // service_commitment.type='SLA'
        slaGR.addQuery('JOINcontract_sla.sys_id=service_commitment.sla!type=SLA');
        // service_offering_commitment.service_offering=cmdb_ci
        slaGR.addQuery('JOINservice_commitment.sys_id=service_offering_commitment.service_commitment!service_offering=' + this.taskGR.getValue(this.serviceOfferingField));

        SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_NEW + this.taskGR.sys_id, this.MUTEX_NEW, this, this._processNewSLAs_criticalSection, slaGR);
        // TODO: optionally attach more work-notes
        if (this.timers)
            sw.log('TaskSLAController: Finished _processNewSLAs part 2');
    },

    /**
     * Check the Attach Conditions of the specified contract_sla (or service_offering_commitment) definition If
     * (SLACondition).attach returns true then attach it to this task
     * 
     * pre-conditions: by this point, we have confirmed that it isn't currently attached to the task, and we have the Mutex for
     * "Process New SLAs Mutex " + this.taskGR.sys_id) to prevent it being added by another TaskSLAController
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

        var taskSLA = new RepairTaskSLA(slaGR, this.taskGR, /* deferInsert */true);
        taskSLA.setRunWorkflow(this.runWorkflow);
        this.newSLADefIds.push(slaGR.getValue('sys_id'));
        this.lu.logDebug('_checkNewSLA newSLADefIds=[' + this.newSLADefIds.join() + ']');

        // adjust pause time of retroactive SLAs, if 'com.snc.sla.retroactive_pause' says so
        var taskSLAadjusted;
		if (slaGR.retroactive && slaGR.retroactive_pause)
            taskSLAadjusted = this._adjustPauseTime(taskSLA.getGlideRecord());

        if (typeof taskSLAadjusted === "undefined")
            taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS); // adds task_sla record, initiates model state machine, starts notification workflow
        this.lu.logInfo('_checkNewSLA: added SLA "' + slaGR.name + '"');

        // TODO: work-notes

        if (this.timers)
            sw.log('TaskSLAController: Finished _checkNewSLA');

        if (typeof taskSLAadjusted !== "undefined")
            return taskSLAadjusted;

        return taskSLA;
    },

    // (called after obtaining SelfCleaningMutex MUTEX_UPDATE: '<<<--Process Existing SLAs Mutex ' + this.taskGR.sys_id + '-->>>',
    // to prevent simultaneous/overlapping updates of the task_sla records)
    _processExistingSLAs_criticalSection: function() {
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
        var taskSLA = new RepairTaskSLA(slaGR); // not yet in the database
        taskSLA.setRunWorkflow(this.runWorkflow);
        taskSLA.setUpdateTime(this.taskGR.sys_updated_on);
        if (this.replayingTask)
            taskSLA.setBreachTimer(false); // disable breach timers on the task_sla, for replay

        // (stop/cancel takes precedence over pause/unpause also matching in the same update to the task record)
        this.newSLADefIds = [];
        if (!this._stopCancel(taskSLA))
            this._pauseUnpause(taskSLA);

        // TODO: work-notes
        if (this.timers)
            sw.log('TaskSLAController: Finished _checkExistingSLA');
        return taskSLA;
    },

    _runContractSLAs: function() {
        var slaGR = new GlideRecord('contract_sla');
        slaGR.addActiveQuery();
        slaGR.addQuery('collection', this.taskGR.getRecordClassName());
        if (this.slaDefIds)
            slaGR.addQuery('sys_id', this.slaDefIds);
        // contract_rel_contract_sla.contract=this.taskGR.contract
        slaGR.addQuery('JOINcontract_sla.sys_id=contract_rel_contract_sla.contract_sla!contract=' + this.taskGR.contract);
        SelfCleaningMutex.enterCriticalSectionRecordInStats(this.MUTEX_NEW + this.taskGR.sys_id, this.MUTEX_NEW, this, this._processNewSLAs_criticalSection, slaGR);
    },

    /**
     * Generate & replay task history, to adjust pause duration, pause time of retroactive-start SLAs (runs from within the
     * _processNewSLAs_criticalSection)
     */
    _adjustPauseTime: function(taskSLAgr) {
        this.lu.logInfo('_adjustPauseTime: Adjusting pause time for retroactive SLA ' + taskSLAgr.sla.name + ' on ' + taskSLAgr.task.number);
		// work out if the Task record is just being created and if it is we shouldn't adjust pause time
		// "SLARepair" constructs the task GlideRecord with the correct "sys_mod_count"
		if (this.taskGR.getValue("sys_mod_count") == 0)
            // nothing to adjust for, as the task can have no previous updates
            return;
        if (taskSLAgr.sla.duration_type != '' || !taskSLAgr.sla.pause_condition)
            // relative duration SLAs, and those without pause conditions, cannot pause
            return;
		if (!taskSLAgr.sla.retroactive_pause)
            // (shouldn't have been called for a non retroactive SLA)
            return;
        if (!(new GlideAuditor(this.taskGR.getTableName(), null).auditTable())) {
            this.lu.logError('Cannot adjust SLA pause time for a retroactive start - auditing not enabled on ' + this.taskGR.getTableName());
            return;
        }

        var updateTime = taskSLAgr.getValue('sys_updated_on');
		var taskSLAStartMS = taskSLAgr.start_time.dateNumericValue();
        this.lu.logInfo('_adjustPauseTime: at ' + updateTime);

        // create a 'mock' task record, which will be stepped through the history of the real one
        // (and then discarded)
        var taskGR = new GlideRecord(this.taskGR.getRecordClassName());
        taskGR.setNewGuidValue(this.taskGR.sys_id);
        taskGR.autoSysFields(false);
        var historyGR = this._rebuildHistory(this.taskGR, this.taskGR.getValue("sys_updated_on"));
        // temporarily switch real taskGR with our mock one, because _pauseUnpause references this.taskGR
        var originalTaskGR = this.taskGR;
        this.taskGR = taskGR;

        var updateSeq = 0;
        var sys_updated_on;
        var sys_updated_onMS;
        var taskSLA = new RepairTaskSLA(taskSLAgr);
        taskSLA.setRunWorkflow(this.runWorkflow);
        taskSLA.setRetroactiveAdjusting(true);
        taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
        while (historyGR.next()) {
            // run the SLA processing when all of an update sequence's entries have been processed, bar the last one
            if (historyGR.update != updateSeq) {
                if (updateSeq == 0)
                    taskGR.setValue('sys_created_on', sys_updated_on);
                taskGR.setValue('sys_updated_on', sys_updated_on);
                this.lu.logDebug('_adjustPauseTime: [' + updateSeq + '] history update time: ' + sys_updated_on);

				if (taskSLAStartMS <= sys_updated_onMS) {
					taskSLA.setUpdateTime(sys_updated_on);
					this._pauseUnpause(taskSLA);
				}
                updateSeq = historyGR.getValue('update');
            }
			var fieldName = historyGR.getValue('field');
            if (fieldName.indexOf('sys_') != 0 || fieldName == 'sys_domain') {
                var newValue = historyGR.getValue("new_value");
                if (JSUtil.nil(newValue))
                    newValue = historyGR.getValue("new");
                this.lu.logDebug('_adjustPauseTime: [' + historyGR.update + '] historyGR.field ' + historyGR.field + ' = ' + newValue);
                taskGR.setValue(fieldName, newValue);
            }
            sys_updated_on = historyGR.getValue('update_time');
			sys_updated_onMS = historyGR.update_time.dateNumericValue();
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

    type: 'RepairTaskSLAController'
});