var RepairTaskSLAWorkflow = Class.create();

RepairTaskSLAWorkflow.PROP_OVERRIDE_WORKFLOW = "com.snc.sla.repair.use_repair_workflow";
RepairTaskSLAWorkflow.PROP_WORKFLOW_NAME = "com.snc.sla.repair.workflow";

RepairTaskSLAWorkflow.prototype = Object.extendsObject(TaskSLAworkflow, {
    EVENT_TURN_REPAIR_OFF: "repairModeFalse",

    start: function() {
        var workflow = this.getWorkflow();
        if (!workflow || !workflow.sys_id) {
            this.lu.logInfo("no workflow to start for " + this.taskSLAgr.sla.name);
            return;
        }

        this.lu.logInfo("start: workflow " + workflow.name + " started for " + this.taskSLAgr.sla.name);

        // If the SLA has already breached then unless the appropriate property has been set true don't run the workflow
        if (this.taskSLAgr.has_breached && !this.runForBreached) {
            this.lu.logInfo("start: SLA has already breached so workflow will not be started for " + this.taskSLAgr.sla.name);
            return;
        }

        var startTime = new GlideDateTime(this.taskSLAgr.start_time.getGlideObject());
        var now = new GlideDateTime();
        var msecs = this._truncSeconds(this._calculateRetroAdjust(startTime, now));

        // Retroactive, if started more than 5 seconds ago (or due to start in the future)

        var wfVars = {};
        wfVars.sla_repair_mode = true;

        var w = new Workflow();
        if (msecs > 0 && msecs <= 5000)
            w.startFlow(workflow.sys_id, this.taskSLAgr, "insert", wfVars);
        else
            w.startFlowRetroactive(workflow.sys_id, msecs, this.taskSLAgr, "insert", wfVars);

        this.taskSLAgr.update();
    },

    turnRepairModeOff: function() {
        var wf = new Workflow().getRunningFlows(this.taskSLAgr);
        while (wf.next())
            new Workflow().broadcastEvent(wf.sys_id, this.EVENT_TURN_REPAIR_OFF);
    },

    /**
     * Checks if the workflow override property is true
     * 
     * @returns boolean
     */
    isWorkflowOverride: function() {
        return gs.getProperty(RepairTaskSLAWorkflow.PROP_OVERRIDE_WORKFLOW, "false") == "true";
    },

    /**
     * Gets the correct workflow sys_id for the given task_sla.
     * 
     * If the override property is true the workflow defined in the workflow property is returned. If the override property is
     * false the workflow from the SLA Definition is returned.
     * 
     * @returns Object { name: name_of_workflow, sys_id: workflow_sys_id }
     */
    getWorkflow: function() {
        var workflow = {
            name: "",
            sys_id: ""
        };

        if (!this.isWorkflowOverride()) {
            if (this.taskSLAgr.sla.workflow.nil())
                return null;

            workflow.name = this.taskSLAgr.sla.workflow.getDisplayValue();
            workflow.sys_id = this.taskSLAgr.sla.workflow + "";

            return workflow;
        }

        var name = gs.getProperty(RepairTaskSLAWorkflow.PROP_WORKFLOW_NAME, null);
        if (!name)
            return null

        var wfScript = new SNC.WorkflowScriptAPI();

        workflow.name = name;
        workflow.sys_id = wfScript.getWorkflowFromName(name);

        return workflow;
    },

    type: "RepairTaskSLAWorkflow"

});