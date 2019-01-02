var SLARepairLog = Class.create();

SLARepairLog.LOG_TABLE = "sla_repair_log";
SLARepairLog.LOG_ENTRY_TABLE = "sla_repair_log_entry";
SLARepairLog.LOG_PROPERTY = "com.snc.sla.repair.log";
SLARepairLog.FIELD_PREFIX = "tsla_";

SLARepairLog.prototype = {
    /**
     * @param type - String type of repair being logged
     * @param user - String user sys id startDate - GlideDateTime
     */
    initialize: function(type, user, startDate) {
        // Create a logger to log debug/error messages
        this.lu = new GSLog(SLARepairLog.LOG_PROPERTY, this.type);

        if (JSUtil.nil(type))
            return this.lu.logError("Error - type is mandatory");

        if (JSUtil.nil(user))
            return this.lu.logError("Error - user is mandatory");

        if (JSUtil.nil(startDate))
            return this.lu.logError("Error - startDate is mandatory");

        this.type = type;
        this.user = user;
        this.startDate = startDate;

        this._resetCounts();
    },

    /**
     * Creates a logging header record. The header record groups all the log entries created during a repair process.
     */
    startLog: function() {
        this._resetCounts();

        this.logGr = new GlideRecord(SLARepairLog.LOG_TABLE);
        this.logGr.setValue("active", true);
        this.logGr.setValue("type", this.type);
        this.logGr.setValue("sys_user", this.user);
        this.logGr.setValue("start_date", this.startDate);

        if (this.trackerId)
            this.logGr.sys_execution_tracker = this.trackerId;

        this.logGr.insert();
    },

    /**
     * Finishes the logging process. The end date and the number of records created/updated/deleted are set.
     */
    finishLog: function() {
        if (!this.logGr) {
            this.lu.logError("Error - Logging was never started, run startLog to create a sla_repair_log record");
            return;
        }

        this.logGr.setValue("active", false);
        this.logGr.setValue("end_date", gs.nowNoTZ());
        this.logGr.setValue("num_created", this.numCreated);
        this.logGr.setValue("num_updated", this.numUpdated);
        this.logGr.setValue("num_deleted", this.numDeleted);

        this.logGr.update();
    },

    /**
     * Increments the number created
     * 
     * @param value - Number to increment by. Defaults to 1
     */
    incrementCreated: function(value) {
        if (isNaN(value))
            value = 1;

        value = value - 0;

        this.numCreated += value;
    },

    /**
     * Increments the number updated
     * 
     * @param value - Number to increment by. Defaults to 1
     */
    incrementUpdated: function(value) {
        if (isNaN(value))
            value = 1;

        value = value - 0;

        this.numUpdated += value;
    },

    /**
     * Increments the number deleted
     * 
     * @param value - Number to increment by. Defaults to 1
     */
    incrementDeleted: function(value) {
        if (isNaN(value))
            value = 1;

        value = value - 0;

        this.numDeleted += value;
    },

    /**
     * Get the sys_id of the current log header record.
     * 
     * @return sys_id or null
     */
    getLogSysId: function() {
        if (!this.logGr)
            return null;

        return this.logGr.getValue("sys_id");
    },

    setTrackerId: function(trackerId) {
        this.trackerId = trackerId;
    },

    /**
     * Inserts a new 'before' log entry record.
     * 
     * Before entries represent the state of the Task SLA record before being repaired.
     * 
     * @param taskSlaGr - GlideRecord (task_sla)
     * 
     * @return - sys_id of created audit record
     */
    createBeforeEntry: function(taskSlaGr) {
        var auditGr = this._createAuditEntry(taskSlaGr, "before");
        if (auditGr)
            return auditGr.sys_id + '';

        return null;
    },

    /**
     * Inserts a new 'after' log entry record.
     * 
     * After entries represent the state of the Task SLA record after being repaired.
     * 
     * @param taskSlaGr - GlideRecord (task_sla)
     * 
     * @return - sys_id of created audit record
     */
    createAfterEntry: function(taskSlaGr) {
        var auditGr = this._createAuditEntry(taskSlaGr, "after");
        if (auditGr)
            return auditGr.sys_id + '';

        return null;
    },

    _createAuditEntry: function(taskSlaGr, beforeOrAfter) {
        // Ensure expected arguments are provided
        if (JSUtil.nil(this.logGr))
            return this.lu.logError("Error - Audit record does not exist");

        if (JSUtil.nil(taskSlaGr))
            return this.lu.logError("Error - Task SLA is missing");

        if (JSUtil.typeOf(taskSlaGr.getRecordClassName) != "function" || taskSlaGr.getRecordClassName() != SLARepair.SLA)
            return this.lu.logError("Error - Task SLA is invalid");

        // Create a new Audit Entry
        var logEntryGr = new GlideRecord(SLARepairLog.LOG_ENTRY_TABLE);
        logEntryGr.initialize();

        // Copy values from the Task SLA into the Audit Entry 
        var elements = taskSlaGr.getElements();
        for (var i = 0; i < elements.size(); i++) {
            var elementName = elements.get(i).getName();
            var targetField = SLARepairLog.FIELD_PREFIX + elementName;
            if (!taskSlaGr[elementName].nil() && logEntryGr.isValidField(targetField))
                logEntryGr.setValue(targetField, taskSlaGr.getValue(elementName));
        }

        // Add some more values to the Audit Entry and then insert it
        logEntryGr.setValue(SLARepairLog.FIELD_PREFIX + "payload", "" + new GlideRecordSimpleSerializer().serialize(taskSlaGr));
        logEntryGr.setValue("type", beforeOrAfter);
        logEntryGr.setValue(SLARepairLog.LOG_TABLE, this.logGr.getUniqueValue());
        logEntryGr.insert();

        // Return a reference to the Audit Entry record back to the caller
        return logEntryGr;
    },

    _resetCounts: function() {
        this.numUpdated = 0;
        this.numCreated = 0;
        this.numDeleted = 0;
    },

    type: "SLARepairLog"
};