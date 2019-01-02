var ChangeConflictAJAXProcessor = Class.create();

ChangeConflictAJAXProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    NOT_RUN: "Not Run",

    check: function() {
        var sysId = this.getParameter("sysparm_sysid");
        var trackerGr = new GlideRecord("sys_execution_tracker");
        trackerGr.addQuery("source", sysId);
        trackerGr.addQuery("state", "IN", "0,1");
        trackerGr.query();
        if (trackerGr.next())
            return trackerGr.getUniqueValue();
        return "";
    },

    start: function() {
        var trackerId = this.check();
        if (trackerId)
            return trackerId;

        var sysId = this.getParameter("sysparm_sysid");
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName(gs.getMessage("Conflict Detection"));
        worker.setScriptIncludeName("ChangeConflictWorker");
        worker.setScriptIncludeMethod("start");
        worker.putMethodArg("sysId", sysId);
        worker.setBackground(true);
        worker.start();

        return worker.getProgressID();
    },

    cancel: function() {
        var trackerId = this.getParameter("sysparm_tracker_id");
        if (!trackerId)
            return false;

        var execTracker = new SNC.GlideExecutionTracker(trackerId);
        execTracker.cancel(gs.getMessage("Conflict detection has been cancelled"));
    },

    deleteConflicts: function() {
        var sysId = this.getParameter("sysparm_sys_id");
        new ChangeConflictHandler().deleteConflictsByChangeId(sysId);

        //Update conflict status and last run
        var changeGr = new GlideRecord("change_request");
        if (changeGr.get(sysId)) {
            changeGr.conflict_status = this.NOT_RUN;
            changeGr.conflict_last_run = "";
            changeGr.update();
        }
    },

    getTrackerRecord: function() {
        var trackerID = this.getParameter('sysparm_tracker_id');

        var trackerJSON = {};
        trackerJSON.state = 0;
        trackerJSON.percent = 0;
        trackerJSON.percent_complete = 0; //Same as 'percent' but added to match AjaxStatusProgressChecker
        trackerJSON.timestamp = new GlideDateTime().getDisplayValue();

        if (trackerID !== "") {
            var trackerGR = new GlideRecord('sys_execution_tracker');

            if (trackerGR.get(trackerID)) {
                trackerJSON.state = trackerGR.getValue('state');
                trackerJSON.percent = trackerGR.getValue('percent_complete');
                trackerJSON.percent_complete = trackerGR.getValue('percent_complete');
                trackerJSON.timestamp = new GlideDateTime().getDisplayValue();
            }
        }

        return new JSON().encode(trackerJSON);
    },

    getConflictData: function() {
        var changeId = this.getParameter('sysparm_change_id');

        var conflictGr = new GlideRecord('conflict');
        conflictGr.addQuery('change', changeId);
        conflictGr.orderByDesc("last_checked");
        conflictGr.query();
        var conflictCount = conflictGr.getRowCount();
        var timestamp = new GlideDateTime().getDisplayValue();
        if (conflictGr.next())
            timestamp = conflictGr.getDisplayValue("last_checked");
        var conflictInfo = {
            conflictCount: conflictCount,
            timestamp: timestamp
        };
        return new JSON().encode(conflictInfo);
    },

    type: 'ChangeConflictAJAXProcessor'
});
