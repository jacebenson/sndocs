var Workflow = Class.create();
Workflow.prototype = {
    initialize: function() {
        this.workflow = new GlideappWorkflowHelper();

        for ( var x in this.closure)
            this[x] = this.closure[x];
    },

    closure: (function() {

        // Privates
        var workflowScriptAPI = new SNC.WorkflowScriptAPI();

        function _getEstimatedDeliveryTimeRelative(/* GlideRecord */wf_version, /* GlideDateTime */now) {
            var relativeDuration = wf_version.relative_duration + '';
            if (!relativeDuration)
                return "";

            var dur = new DurationCalculator();
            dur.setSchedule(wf_version.schedule + '', wf_version.timezone + '');
            dur.setStartDateTime(now);
            dur.calcRelativeDuration(relativeDuration);
            return dur.getEndDateTime();
        }

        function _getEstimatedDeliveryTimeUserSpecified(/* GlideRecord */wf_version, /* GlideDateTime */now) {
            var then = new GlideDateTime();
            if (wf_version.expected_time.getGlideObject().getNumericValue() == 0)
                return "";

            var schedID = wf_version.schedule + '';
            if (!schedID) {
                then.add(wf_version.expected_time.getGlideObject());
                return then;
            }

            var sched = new GlideSchedule(schedID, wf_version.timezone + '');
            return sched.add(now, wf_version.expected_time.getGlideObject());
        }

        function _getRunningMainFlows(record, tableName) {
            var gr = new GlideRecord('wf_context');
            if (!record.isValidRecord())
				return gr;

            gr.addQuery('table', (tableName) ? tableName : record.getRecordClassName());
            gr.addQuery('state', 'executing');
            gr.addQuery('id', record.sys_id);
            gr.addNullQuery('parent');
            gr.query();
            return gr;
        }


        // Public API
        return {

            /**
             * Test a workflow version to see if it is available.
             * 
             * @param versionId
             *            sys_id of a workflow version from table wf_workflow_version
             * @returns boolean
             *            true if this workflow is visible
             */
            canSeeVersion: function(versionId) {
                var gr = new GlideRecord('wf_workflow_version');
                return gr.get(versionId);
            },

            /**
             * Start a workflow. Internal logic will determine which workflow version should be run. The workflow version to run is either
             * the one checked out to the current user, or the published workflow version.
             * Calling this method on a current will not implicitly update the current. If the workflow modifies the input current to this 
             * method, it is up to the caller to call current.update() to persist these changes.
             * 
             * @param workflowId
             *            The sys_id of the workflow from the wf_workflow table
             * @param current
             *            The GlideRecord of the current record to be operated on by the workflow
             * @param operation
             *            The String operation for this workflow - not used
             * @param vars
             *            JavaScript object of workflow inputs. The key is the variable name, the value is the variable value.
             * @returns The GlideRecord of the wf_context of the running workflow. Do not modify this returned GlideRecord.
             */
            startFlow: function(workflowId, current, operation, vars) {
                return workflowScriptAPI.startFlow(workflowId, current, vars);
            },

            /**
             * An intermediate method used to start a workflow from the green "run" button on the Graphical Workflow Editor. This should not
             * be used by SNC script writers.
             * 
             * @param context
             *            GlideRecord on wf_context of the context to start the Workflow engine on
             * @param operation
             *            The String event for processing
             */
            startFlowFromContextInsert: function(context, operation) {
                return workflowScriptAPI.startFlowFromContextInsert(context, operation);
            },

            /**
             * An intermediate method used to start a workflow with preloaded values for SLA Timer activity.  This should not be used by SNC
             * script writers
             * 
             * @param workflowId
             *            The sys_id of a record in table wf_workflow for the workflow to run
             * @param retroactiveMSecs
             *            Integera value of seconds to start the workflow on. This is used by SLA Timer activity
             * @param current
             *            The GlideRecord of the current record
             * @param operation
             *            The String event for processing - not used.
             * @param vars
             *            JavaScript object or Java HashMap of workflow inputs. The key is the variable name, the value is the variable
             *            value
             * @param withSchedule
             *            Boolean value to indicate if a schedule should be used
             */
            startFlowRetroactive: function(workflowId, retroactiveMSecs, current, operation, vars, withSchedule) {
                if (isNaN(retroactiveMSecs))
                    return workflowScriptAPI.startFlow(workflowId, current, vars);

                var scratchPad = {};
                scratchPad.retroactiveSecsLeft = Number(retroactiveMSecs) / 1000;
                if (withSchedule)
                    scratchPad.retroactiveWithSchedule = true;
                return workflowScriptAPI.startFlow(workflowId, current, vars, scratchPad);
            },

            /**
             * Run all flows attached to a current GlideRecord.
             * Calling this method on a current will not implicitly update the current. If the workflow modifies the input current to this 
             * method, it is up to the caller to call current.update() to persist these changes.
             * 
             * @param record
             *            A GlideRecord that holds the current record
             * @param operation
             *            A String that holds the operation such as "update", "insert", or perhaps "timer" or some other user defined value.
             */
            runFlows: function(record, operation) {
                workflowScriptAPI.runFlows(record, operation);
            },

            /**
             * Find the correct workflow version for the given workflow. The correct workflow version is the one the current user has
             * checked out, or the published workflow.
             * 
             * @param workflowID
             *            The sys_id of the workflow form table wf_workflow
             * @returns The GlideRecord of the correct wf_workflow_version or null if none is found.
             */
            getVersion: function(workflowId) {
                return workflowScriptAPI.getVersion(workflowId);
            },

            /**
             * Get the wf_workflow_version from a workflow name.
             * 
             * @param workflowName
             *            The workflow name as a string
             * @returns The sys_id of the wf_workflow_version that should be run, or null if none is found.
             */
            getVersionFromName: function(workflowName) {
                var workflowId = this.getWorkflowFromName(workflowName);
                var version = this.getVersion(workflowId).sys_id;

                return version;
            },

            /**
             * Get the wf_workflow sys_id from the name of the workflow in the current ring fenced scope.
             * 
             * @param workflowName
             *            The workflow name as a string
             * @returns The sys_id of the named workflow from table wf_workflow or null if none is found
             */
            getWorkflowFromName: function(workflowName) {
                return workflowScriptAPI.getWorkflowFromName(workflowName);
            },

            /**
             * Return true if 'record' has a workflow in any state associated with it or false if no contexts are 
             * running against this current record.
             * 
             * @param record
             *            GlideRecord of a current record
             * @return true if there is at least one workflow context (any state) associated with the input GlideRecord
             */
            hasWorkflow: function(record) {
                if (typeof record.getRecordClassName != 'function')
                    return false;

                var count = new GlideAggregate('wf_context');
                count.addQuery('table', record.getRecordClassName());
                count.addQuery('id', record.sys_id);
                count.addAggregate('COUNT');
                count.query();
                recCnt = 0;
                if (count.next())
                    recCnt = count.getAggregate('COUNT');

                return recCnt > 0;
            },

            /**
             * Fire an event to an activity of a running workflow.
             * The workflow engine will implicitly do a current.update() after workflow engine processing.
             * 
             * @param eventRecord
             *            The GlideRecord of the wf_executing table of the activity that will receive the event
             * @param eventName
             *            The name of the event. Each activity responds to certain named events.
             * @param eventParms
             *            Parameters in JSON format used by the event
             */
            fireEvent: function(eventRecord, eventName, eventParms) {
                workflowScriptAPI.fireEvent(eventRecord, eventName, eventParms);
            },

            /**
             * Fire an event to an activity of a running workflow.
             * The workflow engine will implicitly do a current.update() after workflow engine processing.
             *
             * @param eventRecordId
             *            The sys_id of the record in the wf_executing table of the activity that will receive the event
             * @param eventName
             *            The name of the event. Each activity responds to certain named events.
             * @param eventParms
             *            Parameters in JSON format used by the event
             */
            fireEventById: function(eventRecordId, eventName, eventParms) {
                workflowScriptAPI.fireEventById(eventRecordId, eventName, eventParms);
            },

            /**
             * Fire an event to all running activities in a workflow.
             * The workflow engine will implicitly do a current.update() after workflow engine processing.
             * 
             * @param contextId
             *            The sys_id of the wf_context record of the running workflow
             * @param eventName
             *            The name of the event. Each activity responds to certain named events.
             */
            broadcastEvent: function(contextId, eventName) {
                workflowScriptAPI.broadcastEvent(contextId, eventName);
            },

            /**
             * Fire an event to all running activities in all workflows for a given current.
             * The workflow engine will implicitly do a current.update() after workflow engine processing for each current.
             * 
             * @param current
             *            The GlideRecord of the current record
             * @param eventName
             *            The name of the event. Each activity responds to certain named events.
             * @eventParams
             *            Parameters to pass along with the event. A javaScript object of name: value pairs
             */
            broadcastEventToCurrentsContexts: function(current, eventName, eventParms) {
                workflowScriptAPI.broadcastEventToCurrentsContexts(current, eventName, eventParms);
            },

            /**
             * Intermediate handling of subflow complete. This should not be used by the SNC script writer.
             */
            handleSubflowComplete: function(grSubflowContext) {
                workflowScriptAPI.handleSubflowComplete(grSubflowContext);
            },

            /**
             * Test to see if a workflow is complete (finished, concelled, or any of the other finished states).
             * 
             * @param grContext
             *            GlideRecord from table wf_context of the workflow to test
             * @returns true if the workflow is in any of the completed states
             */
            isComplete: function(grContext) {
                return workflowScriptAPI.isTerminal(grContext);
            },

            /**
             * Cancel any running workflows for the document. Optionally provide the table name to specify a base table.
             * This is the normal, acceptable way to cancel all workflows that are in a wait state for current.
             * 
             * @param current
             *            The GlideRecord of the current record
             * @param tableName
             *            Optional table name. If not provided then the table will be extracted from 'record'
             * @returns The number of non-subflow workflows that were canceled
             */
            cancel: function(current, tableName) {
                if (!current.isValidRecord())
					return;

                var gr = _getRunningMainFlows(current, tableName);
                while (gr.next())
                    workflowScriptAPI.cancel(gr);

                return gr.getRowCount();
            },

            /**
             * Broadcast the Kill command to all nodes on an instance. Use this to Kill a workflow that is not responding. This will not
             * affect a workflow that is in a wait state. Use cancel(...) to stop a workflow in a wait state.
             * @param context
             *            GlideRecord on table wf_context of the context to kill
             */
            broadcastKill: function(context) {
                workflowScriptAPI.broadcastKill(context);
            },

            /**
             * Cancel the specific running workflow context and all subflows This is the normal, acceptable way to cancel a workflow that is
             * in a wait state.
             * 
             * @param context
             *            GlideRecord on table wf_context of the context to cancel
             */
            cancelContext: function(context) {
                workflowScriptAPI.cancel(context);
            },

            /**
             * Get the running workflow contexts for 'record'. Optionally provide the table name to specify a base table.
             * 
             * @param record
             *            The GlideRecord of a current record
             * @param tableName
             *            The name of the table for record. Optional override. If not provided then the GlideRecord table class name is used
             *            which is almost always the correct value.
             * @return GlideRecord queried for all running contexts on this current record
             */
            getRunningFlows: function(record, tableName) {
                var gr = new GlideRecord('wf_context');
                if (!record.isValidRecord())
					return gr;

                gr.addQuery('table', (tableName) ? tableName : record.getRecordClassName());
                gr.addQuery('state', 'executing');
                gr.addQuery('id', record.sys_id);
                gr.query();
                return gr;
            },

            /**
             * Get the workflow contexts in any state for current record 
             * 
             * @param current
             *            The GlideRecord of a current record
             * @return GlideRecord on table wf_context queried for all contexts on this current record
             */
            getContexts: function(current) {
                return workflowScriptAPI.getContexts(current);
            },

            /**
             * Retrieves the cache report from Caches of Workflow
             */
            printCache: function() {
                var entries = workflowScriptAPI.getCacheWorkflowReport();

                for ( var i = 0; i < entries.length; i++) {
                    gs.print(entries[i]);
                }
            },

            /**
             * Retrieves the cache report from Caches of Workflow
             */
            getCacheReport: function() {
                return workflowScriptAPI.getCacheWorkflowReport();
            },

            /**
             * Restart workflows associated with a GlideRecord.
             * 
             * If maintainStateFlag is true, then all approvals and tasks will maintain their state. This is used when you want to
             * recalculate the approvals and tasks for a workflow by only adding new approvals and tasks that are required without impacting
             * the current approvals and tasks. (An example of when this would be used is when adding an affected company to a change
             * request. In this case, we want to recalc the approvals so that the new affected company is added as an approver, but none of
             * the existing approvals are affected in any way - that is, we do not want to reset all of the approval processing, we just
             * want to add the one new affected company approval.)
             */
            restartWorkflow: function(/* GlideRecord */current, maintainStateFlag) {
                workflowScriptAPI.restartWorkflow(current, maintainStateFlag);
            },

            /**
             * Delete all workflow contexts associated with a GlideRecord. This is used when you want to just start over with 
             * the workflows for a current.
             * 
             * @param current
             *            GlideRecord of a current record
             */
            deleteWorkflow: function(current) {
                workflowScriptAPI.deleteWorkflow(current);
            },

            /**
             * Get the estimated time for a workflow to complete based on the estimated_time and optional schedule/timezone
             * 
             * @param workflowID
             *            The sys_id of a workflow in table wf_workflow
             * @return display value from a GlideDuration (ie, 3 days) or blank if unknown
             */
            getEstimatedDeliveryTime: function(workflowID) {
                var wf_version = new Workflow().getVersion(workflowID);
                if (!wf_version)
                    return "";

                return this.getEstimatedDeliveryTimeFromWFVersion(wf_version);
            },

            /**
             * Get the estimated time for a workflow version to complete based on the estimated_time and optional schedule/timezone
             * 
             * @param wf_version
             *            The GlideRecord on table wf_workflow_version
             * @return display value from a GlideDuration (ie, 3 days) or blank if unknown
             */
            getEstimatedDeliveryTimeFromWFVersion: function(wf_version) {
                var type = wf_version.expected_time_type + '';
                var now = new GlideDateTime();
                var then;
                if (type == 'relative_duration')
                    then = _getEstimatedDeliveryTimeRelative(wf_version, now);
                else
                    then = _getEstimatedDeliveryTimeUserSpecified(wf_version, now);

                if (!then)
                    return "";

                var del_time = GlideDateTime.subtract(now, then);
                var days = del_time.getRoundedDayPart();
                if (days > 0)
                    del_time.setDisplayValue(days + " 00:00:00");

                return del_time.getDisplayValue();
            },

            /**
             * Calculate and save the estimated runtime of a workflow This is called from a business rule.
             * 
             * @param wf_conig
             *            GlideRecord on wf_config table
             * @param context
             *            GlideRecord on wf_context table
             */
            calculateEstimatedRuntime: function(wf_config, context) {
                return workflowScriptAPI.calculateEstimatedRuntime(wf_config, context);
            },

            /**
             * Get the return value set by activity "Return Value"
             * 
             * @param context
             *            wf_context GlideRecord of the context from which you want the return value
             * @return The value set by activity "Return Value" in the workflow
             */
            getReturnValue: function(context) {
                return context.return_value.__return__;
            }
        }; // end of return from closure function
    }()), // end closure function and function execution

    type: 'Workflow'
};