/**
 * Repairs SLAs
 * 
 * Repair - Erase all in-flight SLA data (for the given filter) and create SLA records from scratch based on task history and SLA
 * definitions
 * 
 */
var SLARepair = Class.create();

SLARepair.RECREATE = "recreate";
SLARepair.SLA = "task_sla";
SLARepair.SLA_DEF = "contract_sla";
SLARepair.TASK = "task";
SLARepair.ENABLED_PROPERTY = "com.snc.sla.repair.enabled";
SLARepair.LOG_PROPERTY = "com.snc.sla.repair.log";
SLARepair.AUDIT_PROPERTY = "com.snc.sla.repair.audit";
SLARepair.PREVIEW_PROPERTY = "com.snc.sla.repair.preview";
SLARepair.EVENT_REPAIR_COMPLETE = "sla.repair_complete";
SLARepair.SLA_DATABASE_LOG = "com.snc.sla.log.destination";

SLARepair.COUNT = "count";
SLARepair.AUDIT_ON = "audit_on";
SLARepair.UNAUDITED_FIELDS = "unaudited_fields";
SLARepair.IGNORE_UNAUDITED = {
    "sys_tags": true
};

SLARepair.prototype = {
    initialize: function() {
        this.repairAction = null;
        this.sourceTable = null;
        this.baseTable = null;
        this.encodedQuery = "";
        this.functionName = "";
        this.auditingEnabled = (gs.getProperty(SLARepair.AUDIT_PROPERTY, 'true') != 'false');
        this.validateOnly = false;
        this.runWorkflow = true;

        this.filterTerms = [];
        this.taskIds = [];
		this.slaDefTables = this._getSlaDefTables();

        this.lu = new GSLog(SLARepair.LOG_PROPERTY, "SLARepair");
        if (gs.getProperty(SLARepair.SLA_DATABASE_LOG, "db") == "node")
            this.lu.disableDatabaseLogs();

        this.slaAudit = null; //Object to create Audit entries
        this.response = new SLARepair.Response();

        this.recordsFound = 0;
        this.processedRecords = 0;
		this.currentUser = gs.getUserID();
    },

    /**
     * Enables/disables auditing for this SLARepair
     * 
     * @param onOrOff - Boolean
     * 
     * @returns 'this' to allow chaining
     */
    setAuditEnabled: function(onOrOff) {
        this.auditingEnabled = JSUtil.toBoolean(onOrOff);
        return this;
    },

    /**
     * Sets the SLARepair to only validate an action, not perform the action. Once this is set you can call any of the repair
     * methods to check if the request will be actioned. When set true only validity information will be returned from any of
     * these methods.
     * 
     * @param onOrOff - Boolean
     * 
     * @returns 'this' to allow chaining
     */
    setValidateOnly: function(onOrOff) {
        this.validateOnly = JSUtil.toBoolean(onOrOff);
        return this;
    },

    /**
     * Sets SLARepair to run/not run workflow when repairing SLAs.
     * 
     * @param onOrOff - Boolean
     */
    setRunWorkflow: function(onOrOff) {
        this.runWorkflow = onOrOff;
        return this;
    },

    /**
     * Repairs SLA records from scratch based on sys id and tables name removing current data and creating new task_sla records.
     * 
     * @param sysId - String sys id
     * @param sourceTable - String table name (task or extension of task, contract_sla, task_sla)
     * @param currentUser - String sys_id of the user to use for audit records (Optional)
     * 
     * @returns an SLARepair.Response object (see EOF)
     */
    repairBySysId: function(sysId, sourceTable, currentUser) {
        if (currentUser)
			this.currentUser = currentUser;

        this.repairAction = SLARepair.RECREATE;
        this._bySysId(sysId, sourceTable);
        return this.response;
    },

    /**
     * Repairs SLA records from scratch based on a filter and table name removing current data and creating new task_sla records.
     * 
     * @param filter - String encoded query
     * @param sourceTable - String table name (task or extension of task, contract_sla, task_sla)
     * @param currentUser - String sys_id of the user to use for audit records (Optional)
     * 
     * @returns an SLARepair.Response object (see EOF)
     */
    repairByFilter: function(filter, sourceTable, currentUser) {
        if (currentUser)
			this.currentUser = currentUser;

        this.repairAction = SLARepair.RECREATE;
        this._byFilter(filter, sourceTable);
        return this.response;
    },

    /**
     * Repairs SLA records from scratch based on the provided GlideRecord removing current data and creating new task_sla records.
     * 
     * @param params gr - GlideRecord (task or extension of task, contract_sla, task_sla)
     * 
     * @returns an SLARepair.Response object (see EOF)
     */
    repairByGlideRecord: function(gr) {
        this.repairAction = SLARepair.RECREATE;
        this._byGlideRecord(gr);
        return this.response;
    },

    _bySysId: function(sysId, sourceTable) {
        this.functionName = this._getFunctionName("BySysId");
        if (!sysId) {
            this._addErrorMessage("{0}: No sysId value supplied", this.functionName);
            this._logErrors();
            return;
        }

        var sysIdType = JSUtil.typeOf(sysId);
        if (sysIdType != "string" && sysIdType != "array") {
            this._addErrorMessage("{0}: Invalid sysId value supplied - '{1}'", [ this.functionName, JSUtil.typeOf(sysId) ]);
            this._logErrors();
            return;
        }

        this._byFilter("sys_idIN" + sysId, sourceTable);
    },

    _byGlideRecord: function(gr) {
        this.functionName = this._getFunctionName("ByGlideRecord");
        if (!gr || !(gr instanceof GlideRecord)) {
            this._addErrorMessage("{0}: Invalid GlideRecord value supplied - '{1}'", [ this.functionName, JSUtil.typeOf(gr) ]);
            return;
        }

        var sysIds = [];
        var gr2 = new GlideRecord(gr.getRecordClassName());
        gr2.addEncodedQuery(gr.getEncodedQuery());
        gr2.query();
        while (gr2.next())
            sysIds.push(gr2.getUniqueValue());

        this._byFilter("sys_idIN" + sysIds, gr.getRecordClassName());
    },

    _byFilter: function(filter, sourceTable) {
        this.sourceTable = sourceTable;
        this.encodedQuery = filter;
        this.filterTerms.length = 0;

        if (!this._isValidSource())
            return;

        this.functionName = this._getFunctionName("ByFilter");

        if (JSUtil.typeOf(filter) != "string") {
            this._addErrorMessage("{0}: Invalid filter supplied - '{1}'", [ this.functionName, JSUtil.typeOf(filter) ]);
            this._logErrors();
            return;
        }

        // apply appropriate filter to task_sla record based on the filter we've been passed
        // and the source table
        switch (this.baseTable) {
            case SLARepair.TASK:
                this.taskIds.length = 0;
                var taskGr = new GlideRecord(this.sourceTable);
                taskGr.addEncodedQuery(filter);
				taskGr.addQuery("sys_class_name", "IN", this.slaDefTables);
                taskGr.query();
				
                while (taskGr.next())
                    this.taskIds.push(taskGr.getValue("sys_id"));

                if (this.taskIds.length == 0) {
                    this._addErrorMessage("{0}: No matching Tasks found", this.functionName);
                    return;
                }

                this.filterTerms.push({
                    type: "field",
                    fieldName: "task",
                    fieldData: this.taskIds
                });

                break;
            case SLARepair.SLA:
                this.filterTerms.push({
                    type: "encodedQuery",
                    queryString: filter
                });
                break;
            case SLARepair.SLA_DEF:
                var slaDefIds = [];
                var slaDefGr = new GlideRecord(this.sourceTable);
                slaDefGr.addEncodedQuery(filter);
                slaDefGr.query();
                while (slaDefGr.next())
                    slaDefIds.push(slaDefGr.getValue("sys_id"));
                if (slaDefIds.length == 0) {
                    this._addErrorMessage("{0}: No matching SLA Definitions found", this.functionName);
                    return;
                }
                this.filterTerms.push({
                    type: "field",
                    fieldName: "sla",
                    fieldData: slaDefIds
                });
                break;
        }

        this._preRepair();
        if (this.validateOnly)
            return;

        this.tracker = SNC.GlideExecutionTracker.getLastRunning();
        this.slaAudit = new SLARepairLog(this.repairAction, this.currentUser, gs.nowNoTZ());
        this.slaAudit.setTrackerId(this.tracker.getSysID());
        this.slaAudit.startLog();
        this.response.audit_record_id = this.slaAudit.getLogSysId();

        try {
            // Set the execution trcker's source to our log header and kick it off
            this.tracker.setSourceTable(SLARepairLog.LOG_TABLE);
            this.tracker.setSource(this.slaAudit.getLogSysId());
            this.tracker.run();

            this._repair();
        } finally {
            this.tracker.updateDetailMessage(gs.getMessage("The repair is complete"));
            this.tracker.success(gs.getMessage("The repair is complete"));
            this.slaAudit.finishLog();
        }
    },

    _repair: function() {
        if (this.baseTable == SLARepair.TASK)
            this._repairFromTask();
        else if (this.baseTable == SLARepair.SLA_DEF)
            this._repairFromSLADef();
        else
            this._repairFromTaskSLA();
    },

    _repairFromTask: function() {
        if (this.taskIds.length == 0) {
            this._addInfoMessage("{0}: 0 Task records found to repair Task SLAs for", this.functionName);
            this.lu.logNotice("0 Task records found to repair Task SLAs for");
            return;
        }

        this.tracker.setMaxProgressValue(this.taskIds.length);

        var taskGr = new GlideRecord(this.sourceTable);
        for (var i = 0; i < this.taskIds.length; i++) {
            if (taskGr.get(this.taskIds[i])) {
                this._repairTaskSLAs(taskGr);
                this.tracker.updateDetailMessage(gs.getMessage("Processing {0}", taskGr.number));
            }

            this.tracker.incrementProgressValue();
        }
    },

    _repairFromSLADef: function() {
        if (this.taskTables.length == 0) {
            this._addInfoMessage("{0}: 0 Task records found to repair Task SLAs for", this.functionName);
            this.lu.logNotice("0 Task records found to repair Task SLAs for");
            return;
        }

        var total = 0;
        for (var i = 0; i < this.taskTables.length; i++) {
            var taskGr = new GlideRecord(this.taskTables[i]);
            taskGr.query();
            total += taskGr.getRowCount();
        }

        this.tracker.setMaxProgressValue(total);

        for (var i = 0; i < this.taskTables.length; i++) {
            var taskGr = new GlideRecord(this.taskTables[i]);
            taskGr.query();

            while (taskGr.next()) {
                this._repairTaskSLAs(taskGr, this.slaDefs);
                this.tracker.updateDetailMessage(gs.getMessage("Processing {0}", taskGr.number));
                this.tracker.incrementProgressValue();
            }
        }
    },

    _repairFromTaskSLA: function() {
        // if we've found 0 records to process and our base table is not "task"
        // report it and finish
        if (this.response.count == 0) {
            this._addInfoMessage("{0}: 0 records found to repair", this.functionName);
            this.lu.logNotice("0 Task SLA records found to process");
            return;
        }
        var taskSlaGr = new GlideAggregate(SLARepair.SLA);
        this._addFilterTerms(taskSlaGr);
        taskSlaGr.addQuery("task.sys_class_name", "!=", "");
        taskSlaGr.groupBy("task");
        taskSlaGr.groupBy("sla");
        taskSlaGr.query();
        if (!taskSlaGr.next()) {
            this._addInfoMessage("{0}: 0 records found to repair", this.functionName);
            this.lu.logNotice("0 Task SLA records found to process");
            return;
        }

        this.tracker.setMaxProgressValue(taskSlaGr.getRowCount());

        var slaDefIds = [];
        var currentTaskGr = taskSlaGr.task.getRefRecord();
        if (this.baseTable != SLARepair.TASK)
            slaDefIds.push(taskSlaGr.getValue("sla"));
        do {
            this.tracker.incrementProgressValue();

            if (taskSlaGr.getValue("task") != currentTaskGr.getUniqueValue() || !taskSlaGr.hasNext()) {
                if (!currentTaskGr.isValidRecord()) {
                    this.lu.logError("Task does not exist: " + currentTaskGr.getUniqueValue());
                    continue;
                }
				
				// if we don't have any more records and the current task hasn't changed add the current sla definition in for processing
				if (taskSlaGr.getValue("task") == currentTaskGr.getUniqueValue() && !taskSlaGr.hasNext())
					slaDefIds.push(taskSlaGr.getValue("sla"));

                this.tracker.updateDetailMessage(gs.getMessage("Processing SLA for {0}", currentTaskGr.number));
                this._repairTaskSLAs(currentTaskGr, slaDefIds);
				
				// if we don't have any more records and current task has changed we need to call repair for this last one
				if (taskSlaGr.getValue("task") != currentTaskGr.getUniqueValue() && !taskSlaGr.hasNext()) {
					slaDefIds.push(taskSlaGr.getValue("sla"));
					currentTaskGr = taskSlaGr.task.getRefRecord();
					this.tracker.updateDetailMessage(gs.getMessage("Processing SLA for {0}", currentTaskGr.number));
					this._repairTaskSLAs(currentTaskGr, slaDefIds);
				} else {
					currentTaskGr = taskSlaGr.task.getRefRecord();
					slaDefIds = [taskSlaGr.getValue("sla")];
				}
            } else
				slaDefIds.push(taskSlaGr.getValue("sla"));
        } while (taskSlaGr.next());

        this.lu.logNotice("Repair task_sla count = " + taskSlaGr.getRowCount());
    },

    _preRepair: function() {
        if (this.repairAction == SLARepair.RECREATE && this.baseTable == SLARepair.TASK)
            this._preRepairForTask();
        else if (this.repairAction == SLARepair.RECREATE && this.baseTable == SLARepair.SLA_DEF)
            this._preRepairForSLADef();
        else
            this._preRepairForTaskSLA();
    },

    _preRepairForTask: function() {
        var taskAg = new GlideAggregate(this.sourceTable);
        if (!JSUtil.nil(this.encodedQuery))
            taskAg.addEncodedQuery(this.encodedQuery);
		taskAg.addQuery("sys_class_name", "IN", this.slaDefTables);
        taskAg.addAggregate("COUNT", "sys_id");
        taskAg.groupBy("sys_class_name");
        taskAg.query();

        this.response.count = 0;

        while (taskAg.next()) {
            var tableName = taskAg.sys_class_name + "";

            var tableInfo = {
                table: tableName,
                label: GlideMetaData.getTableLabel(tableName)
            };

            if (this._isTableAudited(tableName)) {
                tableInfo[SLARepair.AUDIT_ON] = true;
                var unauditedFields = this._getNoAuditFields(tableName);
                if (unauditedFields.length > 0)
                    tableInfo[SLARepair.UNAUDITED_FIELDS] = unauditedFields;

                this.response.count += taskAg.getAggregate("COUNT", "sys_id") - 0;
            }

            this.response.audit_info[tableName] = tableInfo;
        }
    },

    _preRepairForSLADef: function() {
        var slaDefGr = new GlideRecord(this.sourceTable);
        if (!JSUtil.nil(this.encodedQuery))
            slaDefGr.addEncodedQuery(this.encodedQuery);
        slaDefGr.addQuery("active", true);
        slaDefGr.query();

        var slaCnt = {};

        // Populate a unique list of tables with all the definitions for each table
        while (slaDefGr.next()) {
            if (JSUtil.nil(slaDefGr.collection))
                continue;

            var collection = slaDefGr.collection + "";
            if (!slaCnt[collection]) {
                slaCnt[collection] = {
                    count: 0,
                    definitionIds: []
                };
            }

            slaCnt[collection].count++;
            slaCnt[collection].definitionIds.push(slaDefGr.getUniqueValue());
        }

        this.taskTables = [];
        this.slaDefs = [];
        var slaTot = 0;
        for ( var tableName in slaCnt) {
            var tableInfo = {
                table: tableName,
                label: GlideMetaData.getTableLabel(tableName)
            };

            if (this._isTableAudited(tableName)) {
                tableInfo[SLARepair.AUDIT_ON] = true;
                var unauditedFields = this._getNoAuditFields(tableName);
                if (unauditedFields.length > 0)
                    tableInfo[SLARepair.UNAUDITED_FIELDS] = unauditedFields;

                slaTot = slaTot + slaCnt[tableName].count;

                this.taskTables.push(tableName);
                this.slaDefs = this.slaDefs.concat(slaCnt[tableName].definitionIds);
            }

            this.response.audit_info[tableName] = tableInfo;
        }

        var taskAg = new GlideAggregate(SLARepair.TASK);
        taskAg.addQuery("sys_class_name", this.taskTables);
        taskAg.addAggregate("COUNT", "sys_id");
        taskAg.query();

        this.response.count = taskAg.getTotal("COUNT", "sys_id") * slaTot;
    },

    _preRepairForTaskSLA: function() {
        var taskSlaGr = new GlideAggregate(SLARepair.SLA);
        this._addFilterTerms(taskSlaGr);
        taskSlaGr.addAggregate("COUNT", "task.sys_class_name");
        taskSlaGr.addQuery("task.sys_class_name", "!=", "");
        taskSlaGr.groupBy("task.sys_class_name");
        taskSlaGr.query();

        while (taskSlaGr.next()) {
            var tableName = taskSlaGr.getValue("task.sys_class_name");
            var tableInfo = {
                table: tableName,
                label: GlideMetaData.getTableLabel(tableName)
            };

            if (this._isTableAudited(tableName)) {
                tableInfo[SLARepair.AUDIT_ON] = true;
                var unauditedFields = this._getNoAuditFields(tableName);
                if (unauditedFields.length > 0)
                    tableInfo[SLARepair.UNAUDITED_FIELDS] = unauditedFields;

                this.response.count += taskSlaGr.getAggregate("COUNT", "task.sys_class_name") - 0;
            }

            this.response.audit_info[tableName] = tableInfo;
        }
    },

    // -------------------------------- Validation functions --------------------------------
    _isValidSource: function() {
        this._clearMessages();
        if (!this.sourceTable)
            this._addErrorMessage("SLARepair: No source table provided");
        else {
            this.baseTable = "" + GlideDBObjectManager.getAbsoluteBase(this.sourceTable);
            if (this.baseTable != SLARepair.TASK && this.baseTable != SLARepair.SLA && this.baseTable != SLARepair.SLA_DEF) {
                this.baseTable = null;
                this._addErrorMessage("SLARepair: Invalid source table: {0}", this.sourceTable);
            }
        }
        if (!this.repairAction)
            this._addErrorMessage("SLARepair: No action provided - it must be \"repair\"");
        else if (this.repairAction != "recreate")
            this._addErrorMessage("SLARepair: Invalid action: {0} - it must be \"repair\"", this.repairAction);

        if (this.response.err_msg.length > 0) {
            this._logErrors();
            return false;
        }
        return true;
    },

    // -------------------------------- Logging functions --------------------------------
    _logErrors: function() {
        for (var i = 0; i < this.response.err_msg.length; i++)
            this.lu.logError(this.response.err_msg[i]);
    },

    _addInfoMessage: function(infoMsg, params) {
        if (!infoMsg)
            return;
        this.response.info_msg.push(gs.getMessage(infoMsg, params));
    },

    _addErrorMessage: function(errorMsg, params) {
        if (!errorMsg)
            return;
        this.response.err_msg.push(gs.getMessage(errorMsg, params));
    },

    _clearMessages: function() {
        this.response.info_msg.length = 0;
        this.response.err_msg.length = 0;
    },

    _getFunctionName: function(callingFunction) {
        var functionName = "SLARepair." + this.repairAction;
        if (callingFunction)
            functionName += callingFunction;
        return functionName;
    },

    // -------------------------------- Logging functions --------------------------------
    // -------------------------------- Repair functions --------------------------------
    _addFilterTerms: function(taskSlaGr) {
        if (!taskSlaGr || !((taskSlaGr instanceof GlideRecord) || (taskSlaGr instanceof GlideAggregate)))
            return;
        for (var i = 0; i < this.filterTerms.length; i++) {
            var filterTerm = this.filterTerms[i];
            if (filterTerm.type == "encodedQuery" && filterTerm.queryString)
                taskSlaGr.addEncodedQuery(filterTerm.queryString);
            else if (filterTerm.type == "field") {
                if (taskSlaGr.isValidField(filterTerm.fieldName) && filterTerm.fieldData)
                    taskSlaGr.addQuery(filterTerm.fieldName, filterTerm.fieldData);
            }
        }
    },

    _repairTaskSLAs: function(taskGr, slaDefIds) {
        if (!taskGr || !taskGr.sys_id)
            return;
        // create a 'mock' task record, which will be stepped through the history of the real one
        // (and then discarded)
        var replayTaskGr = new GlideRecord(taskGr.getRecordClassName());
        replayTaskGr.setNewGuidValue(taskGr.sys_id);
        replayTaskGr.autoSysFields(false);

        var controller = new RepairTaskSLAController(replayTaskGr);
        controller.setRunWorkflow(this.runWorkflow);
        if (slaDefIds)
            controller.restrictSLADefinitions(slaDefIds);

        var taskHistoryGr = this._getTaskHistory(taskGr);
        if (!taskHistoryGr.hasNext()) {
            gs.print(">>>>>>>>>>> Failed to generate any history for Incident " + taskGr.number + " so there's nothing we can do");
            return;
        }

        var beforeCounter = {};
        var auditTaskSlaGr = new GlideRecord(SLARepair.SLA);
        auditTaskSlaGr.addQuery("task", taskGr.sys_id);
        if (slaDefIds)
            auditTaskSlaGr.addQuery("sla", slaDefIds);
        auditTaskSlaGr.query();
        while (auditTaskSlaGr.next()) {
            if (this.auditingEnabled)
                this.slaAudit.createBeforeEntry(auditTaskSlaGr);

            // Keep a counter of the how many SLAs (per Definition) we had before repairing
            var slaDefId = auditTaskSlaGr.sla + "";
            if (!beforeCounter[slaDefId])
                beforeCounter[slaDefId] = 0;

            beforeCounter[slaDefId]++;
        }

        this._deleteExistingSLAs(taskGr, slaDefIds);
        var updateSeq = 0;
        var sysUpdatedOn;
		var fieldName;

        while (taskHistoryGr.next()) {
            // run the SLA processing when all of an update sequence's entries have been processed, bar the last one
            if (taskHistoryGr.update != updateSeq) {
                if (updateSeq == 0)
                    replayTaskGr.setValue('sys_created_on', sysUpdatedOn);

                replayTaskGr.setValue('sys_mod_count', updateSeq);
                replayTaskGr.setValue('sys_updated_on', sysUpdatedOn);

                controller.runNow();

                updateSeq = taskHistoryGr.getValue('update');
            }

			fieldName = taskHistoryGr.getValue('field');
            if (fieldName.indexOf('sys_') != 0 || fieldName == "sys_class_name" || fieldName == "sys_domain") {
                 var newVal = taskHistoryGr.getValue('new_value');
                if (newVal == null && !JSUtil.nil(taskHistoryGr.getValue('new')))
                    newVal = taskHistoryGr.getValue('new');
                replayTaskGr.setValue(fieldName, newVal);
                sysUpdatedOn = taskHistoryGr.getValue('update_time');
				
				if (fieldName == "sys_domain" && updateSeq != 0)
					this._updateDomainOnTaskSLAs(replayTaskGr);
            }
        }

        if (updateSeq == 0)
            replayTaskGr.setValue('sys_created_on', sysUpdatedOn);
		replayTaskGr.setValue('sys_mod_count', updateSeq);
        replayTaskGr.setValue('sys_updated_on', sysUpdatedOn);
        controller.runNow();

        var taskSlaGr = new GlideRecord("task_sla");
        taskSlaGr.addQuery("task", taskGr.sys_id);
        if (slaDefIds)
            taskSlaGr.addQuery("sla", slaDefIds);
        taskSlaGr.query();

        var grandTotal = 0;
        while (taskSlaGr.next()) {
            var taskSLAworkflow = new RepairTaskSLAWorkflow(taskSlaGr);
            taskSLAworkflow.turnRepairModeOff();

            /**
             * Work out how many SLAs have been created and updated.
             * 
             * If beforeCounter doesn't have an property for the current Definition we create.
             * 
             * If beforeCounter has a property for the current Definition we update. When we get to zero we remove so any
             * subsequent checks will create.
             * 
             * Deletes are calculated by what we have left after removing all the updates.
             * 
             */
            var slaDefId = taskSlaGr.sla + "";
            if (!beforeCounter[slaDefId]) {
                this.slaAudit.incrementCreated();
            } else {
                if (beforeCounter[slaDefId] > 0) {
                    this.slaAudit.incrementUpdated();
                    beforeCounter[slaDefId]--;

                    if (beforeCounter[slaDefId] == 0)
                        delete beforeCounter[slaDefId];
                }
            }

            if (!taskSlaGr.active) {
                if (this.auditingEnabled)
                    this.slaAudit.createAfterEntry(taskSlaGr);
                continue;
            }

            var taskSLA = new RepairTaskSLA(taskSlaGr);
            taskSLA.setRunWorkflow(this.runWorkflow);

            if (taskSlaGr.getValue("stage") == "in_progress") {
                taskSLA._calculate();
                taskSLA._commit();

                if (this.auditingEnabled)
                    this.slaAudit.createAfterEntry(taskSLA._getTaskSLA());

                if (!taskSLA.breachedFlag)
                    taskSLA._insertBreachTrigger();
            } else {
                if (this.auditingEnabled)
                    this.slaAudit.createAfterEntry(taskSlaGr);
            }
        }

        // Increment the number of deleted Task SLAs
        for (var slaDefId in beforeCounter)
            if (beforeCounter[slaDefId] != 0)
                this.slaAudit.incrementDeleted(beforeCounter[slaDefId]);
    },

    _pauseUnpause: function(taskSLA, taskGr) {
        var taskSLAgr = taskSLA.getGlideRecord();
        // a "relative-duration" SLA cannot pause, whatever conditions might be in the SLA Definition record
        if (taskSLAgr.sla.duration_type != '')
            return;
        var slac = new SLAConditionBase(taskSLAgr.sla.getRefRecord(), taskGr);
        if (taskSLA.getCurrentState() == TaskSLA.STATE_IN_PROGRESS && slac.pause())
            taskSLA.updateState(TaskSLA.STATE_PAUSED);
        else if (taskSLA.getCurrentState() == TaskSLA.STATE_PAUSED && !slac.pause())
            taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
    },

    _stopCancel: function(taskSLA, taskGr) {
        var taskSLAgr = taskSLA.getGlideRecord();
        var slac = new SLAConditionBase(taskSLAgr.sla.getRefRecord(), taskGr);
        if (slac.complete()) { //  || slac.reset()) {
            taskSLA.updateState(TaskSLA.STATE_COMPLETED);
            return true;
        }
        if (slac.cancel()) {
            taskSLA.updateState(TaskSLA.STATE_CANCELLED);
            return true;
        }
    },

    _getTaskHistory: function(taskGr) {
        if (!taskGr || !taskGr.getUniqueValue())
            return null;

        var hs = new GlideHistorySet(taskGr.getRecordClassName(), taskGr.getUniqueValue());
        hs.getSummaryRecord();
        hs.refresh();

        var historyGr = new GlideRecord('sys_history_line');
        historyGr.addQuery('set', hs.getSummaryRecord().getUniqueValue());
        historyGr.addQuery('type', 'audit').addOrCondition('type', '');
        historyGr.orderBy('update');
        historyGr.query();

        return historyGr;
    },

    _isTableAudited: function(tableName) {
        if (!tableName)
            return false;
        var gr = new GlideRecord(tableName);
        if (!gr.isValid())
            return false;

        return new GlideAuditor(tableName, null).auditTable();
    },

    _getNoAuditFields: function(tableName) {
        var noAuditFields = [];
        var gr = new GlideRecord(tableName);
        if (!gr.isValid())
            return noAuditFields;
        var elements = gr.getElements();

        for (var i = 0; i < elements.size(); i++) {
            var element = elements.get(i);
            if (element.hasAttribute("no_audit")) {
                var fieldName = element.getName();
                if (!SLARepair.IGNORE_UNAUDITED[fieldName])
                    noAuditFields.push(elements.get(i).getName());
            }
        }
        return noAuditFields;
    },
	
	_getSlaDefTables: function() {
		var slaDefGr = new GlideAggregate(SLARepair.SLA_DEF);
		slaDefGr.addActiveQuery();
		slaDefGr.groupBy("collection");
		slaDefGr.query();
		
		var slaDefTables = [];
		while(slaDefGr.next())
			slaDefTables.push(slaDefGr.getValue("collection"));
		
		return slaDefTables;
	},
	
    _deleteExistingSLAs: function(taskGr, slaDefIds) {
        if (!taskGr || !taskGr.sys_id)
            return false;
        var taskSlaGr = new GlideRecord('task_sla');
        taskSlaGr.addQuery('task', taskGr.sys_id);
        if (slaDefIds)
            taskSlaGr.addQuery('sla', slaDefIds);
        taskSlaGr.query();

        var taskSlaIds = [];
        while (taskSlaGr.next()) {
            taskSlaIds.push(taskSlaGr.sys_id);
            this.workflow.cancel(taskSlaGr);
            taskSlaGr.deleteRecord();
        }
        if (taskSlaIds.length == 0)
            return;

        var triggerGr = new GlideRecord('sys_trigger');
        triggerGr.addQuery('document', 'task_sla');
        triggerGr.addQuery('document_key', taskSlaIds);
        triggerGr.addQuery('name', 'STARTSWITH', 'SLA breach timer');
        triggerGr.deleteMultiple();
    },
	
	_updateDomainOnTaskSLAs: function(taskGr) {
		if (!taskGr.getUniqueValue() || !taskGr.isValidField('sys_domain'))
			return;
		
		var taskSlaGr = new GlideRecord('task_sla');
		taskSlaGr.setWorkflow(false);
		taskSlaGr.addQuery("task", taskGr.getUniqueValue());
		taskSlaGr.query();
		
		var isSlaDomained = taskSlaGr.isValidField("sys_domain");
		
		while (taskSlaGr.next()) {
			if (isSlaDomained) {
				taskSlaGr.sys_domain = taskGr.sys_domain;
				taskSlaGr.update();
			}
			
			// Update any Workflow context associated with this Task SLA
			var wfc = new GlideRecord('wf_context');
			wfc.addQuery('id', taskSlaGr.sys_id);
			wfc.query();
			while (wfc.next()) {
				wfc.sys_domain = taskGr.sys_domain;
				wfc.update();

				// ...and also the wf_executing and wf_history records on the wf_context
				var wfe =  new GlideMultipleUpdate('wf_executing');
				wfe.addQuery('context', wfc.sys_id);
				wfe.setValue('sys_domain', taskGr.sys_domain);
				wfe.execute();

				var wfh =  new GlideMultipleUpdate('wf_history');
				wfh.addQuery('context', wfc.sys_id);
				wfh.setValue('sys_domain', taskGr.sys_domain);
				wfh.execute();
			}
		}
	},
	
    // -----------------------------------------------------------------------------------
    type: "SLARepair"
};

/**
 * Response object for an SLARepair request
 * 
 * <pre>
 * structure
 * {
 *      count: Integer - number of affected records
 *      err_msg: String Array - Localised error messages
 *      info_msg: String Array - Localised info messages
 *      warn_msg: String Array - Localised warning messages
 *      audit_info: Object - Table and field auditing information key is table name
 *      {
 *          tableName: Object - Details of auditing on each affected table
 *          {
 *              table: String - Name of the table
 *              audit_on: Boolean - true if audit is turned on for this table
 *              unaudited_fields: String Array - A list of the fields on the table which are not audited
 *          }
 *      }
 *      audit_record_id: String sys id of the audit info record.  Not returned when validateOnly is set true.
 * }
 * </pre>
 */
SLARepair.Response = Class.create();

SLARepair.Response.prototype = {
    initialize: function() {
        this.count = 0;
        this.info_msg = [];
        this.err_msg = [];
        this.audit_info = {};
        this.audit_record_id = "";
    },
    type: "SLARepair.Response"
};