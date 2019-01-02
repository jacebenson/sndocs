var SLAUIActions = Class.create();

SLAUIActions.prototype = {

    /**
     * Whether the Repair UI Action should be shown or not
     * 
     * @param glideRecord - GlideRecord The record against which the UI Action is being triggered against
     * @param glideSystem - GlideSystem A reference to the GlideSystem instance in scope
     * @param isRelatedList - Boolean Whether the UI Action is being triggered against a related list or not
     * @param validateRowCount - Boolean Whether the UI Action should first check if there are rows before displaying (used for list links) 
     * 
     * @returns A boolean to indicate if the UI Action should be shown or not
     */
    showRepair: function(glideRecord, glideSystem, isRelatedList, validateRowCount) {
        if (glideSystem.getProperty("com.snc.sla.engine.version") == "2010")
            return false;

        if (!glideSystem.hasRole("admin"))
            return false;

        if ((typeof validateRowCount === 'undefined' || validateRowCount === true) && glideRecord.getRowCount() === 0)
            return false;

        if (isRelatedList)
            return false;

        if (this._isValidTable(glideRecord) && !this._hasSLADefinition(glideRecord))
            return false;

        return true;
    },

    _isValidTable: function(glideRecord) {
        var tableName = glideRecord.getRecordClassName();
        var isValidTable = (tableName != "contract_sla" && tableName != "task_sla");
        return isValidTable;
    },

    _hasSLADefinition: function(glideRecord) {
        var record = new GlideAggregate("contract_sla");
        record.addQuery("collection", glideRecord.getRecordClassName());
        record.addAggregate("COUNT");
        record.query();
        if (record.next())
        	return parseInt(record.getAggregate("COUNT"), 10) > 0;
        
        return false;
    },

    type: "SLAUIActions"
};