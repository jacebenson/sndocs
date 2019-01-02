var RepairTaskSLA = Class.create();

RepairTaskSLA.prototype = Object.extendsObject(TaskSLA, {
    initialize: function(slaGR, taskGR, deferInsert) {
        this.lu = new GSLog(this.SLA_TASK_SLA_LOG, this.type);
        this.lu.includeTimestamp();
        if (gs.getProperty(this.SLA_DATABASE_LOG, "db") == "node")
            this.lu.disableDatabaseLogs();
        this.slalogging = new TaskSLALogging();
        this.lu.logDebug('TaskSLA.initialize:\n' + this.slalogging.getBusinessRuleStackMsg());

        this.breachCompat = (gs.getProperty(this.SLA_COMPATIBILITY_BREACH, 'true') == 'true');
        this.calcEndTimeAfterBreach = (gs.getProperty(this.SLA_CALCULATE_PLANNED_END_TIME_AFTER_BREACH, 'true') == 'true');
        this.runWorkflow = false;

        // set timers?
        this.timers = (gs.getProperty(this.SLA_TASK_SLA_TIMERS, 'false') == 'true');
        // time the initialization
        if (this.timers)
            this.sw = new GlideStopWatch();

        // Handle the different initialization forms of this Class
        this.starting = false; // true if the task_sla record hasn't yet been inserted
        this.breachTimerEnabled = true; // default: creating a breachTrigger is enabled
        this.adjusting = false; // true if TaskSLAController is adjusting the pause time of a retroactive SLA

        var taskTable;
        var slaTable = new TableUtils(slaGR.getRecordClassName());
        if (taskGR)
            taskTable = new TableUtils(taskGR.getRecordClassName());

        // Class instance variables:
        // - this.taskSLAgr    - the associated task_sla GlideRecord
        // - this.currentStage - current stage of the Task SLA instance
        // - this.starting     - true if the Task SLA instance has just been created
        // - this.updateTime   - last time (GlideDateTime) of update to the associated Task record
        // - this.breachedFlag - has this SLA breached?
        // (and for debugging and test purposes)
        // - this.timers       -- are stopwatch timers enabled?
        // - this.breachTimerEnabled  -- should the breach-timer trigger be created?

        // new TaskSLA()
        if (!slaGR) {
            // create a blank one?
        }

        // new TaskSLA(taskSLAid)
        // (an existing task_sla sys_id)
        else if (typeof slaGR == 'string') {
            this.lu.logDebug('creating TaskSLA from sys_id');
            this.taskSLAgr = new GlideRecord('task_sla');
            this.taskSLAgr.get(slaGR);
        }

        // new TaskSLA(taskSLAgr)
        // (an existing task_sla record for a task)
        else if (slaTable.getAbsoluteBase() == 'task_sla') {
            this.taskSLAgr = new GlideRecord(slaGR.getTableName());
            if (!this.taskSLAgr.get(slaGR.sys_id))
                // task_sla record is not (yet) in the database
                this.taskSLAgr = slaGR;
        }

        // new TaskSLA(contractSLAgr, taskGR)
        // (creates a new task_sla record associated to the task)
        else if (slaTable.getAbsoluteBase() == 'contract_sla' && taskTable && taskTable.getAbsoluteBase() == 'task') {
            this.taskSLAgr = this._newTaskSLAprepare(slaGR, taskGR);
            if (!deferInsert) {
                // insert task_sla record immediately (compatible with old callers)
                this.taskSLAgr.setWorkflow(false);
                this.taskSLAgr.insert();
            }
            // else defer Insert - only do it once our controller wants us to
        }

        this.currentStage = this._getStage();
        this._setBreachedFlag(); // this.breachedFlag;
        // default: use the time of last update to the Task record
        this.updateTime = this._glideDateTime(this.taskSLAgr.task.sys_updated_on);

        // if enable logging has been checked on the SLA definition up the log level to "debug"
        if (this.taskSLAgr && this.taskSLAgr.sla.enable_logging)
            this.lu.setLevel(GSLog.DEBUG);

        this.lu.logInfo('TaskSLA.initialize() for ' + this.taskSLAgr.sys_id + ' at ' + this.updateTime.getDisplayValue());
        if (this.timers) {
            this.sw.log('Finished TaskSLA initialization');
            this.sw = new GlideStopWatch();
        }
    },

    setRetroactiveAdjusting: function(enable) {
        this.adjusting = enable;
        this.breachTimerEnabled = !enable;
        if (!enable) {
            // stopping retroactive adjustments: update db, kick off workflow, and set the breach trigger
            this._commit();

            if (this.runWorkflow !== true)
                return;

            var taskSLAworkflow = new RepairTaskSLAWorkflow(this.taskSLAgr);
            taskSLAworkflow.start();
            if (this.currentStage != this.STAGE_IN_PROGRESS)
                this._doWorkflow(this.state[this.currentStage]);
        }
    },

    setRunWorkflow: function(runWorkflow) {
        this.runWorkflow = runWorkflow;
    },

    _getTaskSLA: function() {
        return this.taskSLAgr;
    },

    _toInProgress: function() {
        // Log the field values in the Task SLA record
        this.lu.logDebug('_toInProgress starts:\n' + this.slalogging.getRecordContentMsg(this.taskSLAgr));

        if (this.currentStage != this.STAGE_IN_PROGRESS)
            this._setStage(this.STAGE_IN_PROGRESS);

        // Log the field values in the Task SLA record
        this.lu.logDebug('_toInProgress ends:\n' + this.slalogging.getRecordContentMsg(this.taskSLAgr));
    },

    _commit: function() {
        this.lu.logInfo('commit: [' + this.taskSLAgr.sys_id + '] ' + this.state[this.currentStage] + '(stage:' + this.taskSLAgr.stage + ') starting=' + this.starting + '; breached=' + this.breachedFlag);

		if (this.taskSLAgr.isNewRecord() && !this.taskSLAgr.task.sys_domain.nil())
			this.taskSLAgr.sys_domain = this.taskSLAgr.task.sys_domain;
		
        this.taskSLAgr.setWorkflow(false);
        var taskSLAid = this.taskSLAgr.update(); // will insert, if the record doesn't already exist
        this.lu.logDebug('commit: task_sla [' + taskSLAid + ']');
    },

    _doWorkflow: function(newState) {
        if (this.runWorkflow !== true)
            return;

        // things to do to TaskSLAworkflow when entering a state
        // (these must take place after the task_sla record has been inserted or updated)
        var taskSLAworkflow = new RepairTaskSLAWorkflow(this.taskSLAgr);
        switch (newState) {
            case TaskSLA.STATE_IN_PROGRESS:
                if (this.starting)
                    taskSLAworkflow.start();
                else
                    taskSLAworkflow.resume();
                break;
            case TaskSLA.STATE_PAUSED:
                taskSLAworkflow.pause();
                break;
            case TaskSLA.STATE_CANCELLED:
            case TaskSLA.STATE_COMPLETED:
                taskSLAworkflow.stop();
                break;
        }
    },

    type: 'RepairTaskSLA'
});