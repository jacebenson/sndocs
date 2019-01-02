var sc_ScriptableOrderGuideFailure = Class.create();
sc_ScriptableOrderGuideFailure.prototype = Object.extendsObject(sc_Base, {
    MARKED_FOR_REPROCESSING: "Failure has been marked for processing",
    REPROCESS_EVENT: "reprocess",
    DELETE_EVENT: "delete",
    REPROCESSING: "reprocessing",

    /**
     * Sets the state of the failure to "reprocessing"
     */
    markForReprocessing: function() {
        this._log.debug("[markForReprocessing] Marking failure for reprocessing");

        this._gr.state = this.REPROCESSING;
        this._gr.update();
        
        return MARKED_FOR_REPROCESSING;
    },

    /**
     * Reprocess the order guide failure. If a workflow created the failure, run
     * it, otherwise execute the reprocessing directly.
     */
    reprocess: function() {
        if (this._gr.state.changesTo(this.REPROCESSING)) {
            this._log.debug("[reprocess] State didn't change to 'reprocessing', exiting");
            return;
        }

        if (this._hasWorkflow())
            this._runFlow(this.REPROCESS_EVENT);
        else {
            this._log.debug("[reprocess] No workflow associated, executing resprocess directly");

            var sog = new SNC.ScriptableOrderGuide(failure.order_guide);
            sog.reprocess(this._gr);

            return sog;
        }
    },

    /**
     * Calls the delete event if the failure was created by a workflow
     */
    deleted: function() {
        if (this._hasWorkflow())
            this._runFlow(this.DELETE_EVENT);
    },

    _runFlow: function(eventName) {
        this._log.debug("[_runFlow] Kicking off workflow event -- " + eventName);

        var sourceTable = this._gr.source_table;
        var sourceId = this._gr.source_document;

        var sourceGR = new GlideRecord(sourceTable);
        if (sourceGR.get(sourceId))
            new Workflow().runFlows(sourceGR, eventName);
    },

    _hasWorkflow: function() {
        if (!this._gr.source_table && !this._gr.source_document && !this._gr.wf_activity)
            return false;

        return true;
    },

    type: 'sc_ScriptableOrderGuideFailure'
});