var SLARepairProperties = Class.create();
SLARepairProperties.PROP_ENABLED = "com.snc.sla.repair.enabled";
SLARepairProperties.APPLICATION_NAME = "service_level_management";
SLARepairProperties.MODULE_TITLES = [ "Repair Logs", "Active Repairs", "My Repairs", "All Repairs", "All Repair Entries" ];

/**
 * Enables or disables SLA Repair functionality
 * 
 * @param flagValue String
 */
SLARepairProperties.enabledFlagChanged = function(propertyValue) {
    if (typeof propertyValue == "undefined" || propertyValue == null || (propertyValue != "true" && propertyValue != "false")) {
        gs.addErrorMessage(gs.getMessage("The value of {0} must be either true or false. Update aborted.", SLARepairProperties.PROP_ENABLED));
        return;
    }

    if (propertyValue == "true")
        new SLARepairProperties().enableRepair();
    else
        new SLARepairProperties().disableRepair();
	
    // Refresh the navigator
    var notification = new UINotification("system_event");
    notification.setAttribute("event", "refresh_nav");
    notification.send();
};

SLARepairProperties.validateWorkflowName = function(propertyValue) {
    if (!propertyValue)
        return;

    var wfScript = new SNC.WorkflowScriptAPI();
    if (!wfScript.getWorkflowFromName(propertyValue)) {
        gs.addErrorMessage(gs.getMessage("The workflow '{0}' could not be found. Update aborted.", propertyValue));
        return false;
    }

    return true;
};

SLARepairProperties.prototype = {
    initialize: function() {
        this.lu = new GSLog(SLARepair.LOG_PROPERTY, "SLARepairProperties");
    },

    enableRepair: function() {
        this.lu.info("Enabling SLA Repair");
        this._updateUIActions(true);
        this._updateModules(true);
    },

    disableRepair: function() {
        this.lu.info("Disabling SLA Repair");
        this._updateUIActions(false);
        this._updateModules(false);
    },

    /**
     * Sets the active flag on the repair UI Actions
     * 
     * @param onOrOff Boolean
     */
    _updateUIActions: function(onOrOff) {
        var uiActionsGr = new GlideRecord("sys_ui_action");
        uiActionsGr.setWorkflow(false);
        uiActionsGr.addQuery("table", "IN", "task, task_sla, contract_sla");
        uiActionsGr.addQuery("name", "STARTSWITH", "Repair");
        uiActionsGr.addQuery("action_name", "sla_repair");
        uiActionsGr.query();

        while (uiActionsGr.next()) {
            this.lu.debug((onOrOff ? "Activating" : "Deactivating") + " UI Actions '" + uiActionsGr.name + "'");
            uiActionsGr.active = onOrOff;
            uiActionsGr.update();
        }
    },

    /**
     * Set the active flag on the repair Modules
     * 
     * @param onOrOff Boolean
     */
    _updateModules: function(onOrOff) {
        var modulesGr = new GlideRecord("sys_app_module");
        modulesGr.setWorkflow(false);
        modulesGr.addQuery("application.name", SLARepairProperties.APPLICATION_NAME);
        modulesGr.addQuery("title", "IN", SLARepairProperties.MODULE_TITLES);
        modulesGr.query();

        while (modulesGr.next()) {
            this.lu.debug((onOrOff ? "Activating" : "Deactivating") + " Module '" + modulesGr.title + "'");
            modulesGr.active = onOrOff;
            modulesGr.update();
        }
    },

    type: 'SLARepairProperty'
};