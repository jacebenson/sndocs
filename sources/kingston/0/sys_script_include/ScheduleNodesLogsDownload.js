var ScheduleNodesLogsDownload = Class.create();
ScheduleNodesLogsDownload.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    schedule: function() {
        if (!this._isAdmin()) {
            gs.print("User: " + gs.getUserID() + " doesn't have access to ScheduleNodesLogsDownload");
            return;
        }

        var dateArray = this.getDateArray();
        if (dateArray === undefined)
            return;

        var parentTrackerSysID = NodeLogDownloadWorker.createParentTrackerId();
        var tableSysID = this.createNodeLogRecord(parentTrackerSysID);
        this.scheduleJob(tableSysID, parentTrackerSysID);
        return tableSysID;
    },

    cancell: function() {
        if (!this._isAdmin()) {
            gs.print("User: " + gs.getUserID() + " doesn't have access to ScheduleNodesLogsDownload");
            return;
        }

        new NodeLogDownloadWorker(this.getParameter("sysparm_tableSysID"), this.getParameter("sysparm_executionTrackerID")).cancelExecutionTracker();
    },

    getDateArray: function() {
        if (!this._isAdmin()) {
            gs.print("User: " + gs.getUserID() + " doesn't have access to ScheduleNodesLogsDownload");
            return;
        }

        var dateRange = this.getParameter("sysparm_date_range");
        if (dateRange === undefined || dateRange === null) {
            gs.info("Date not parse correctly");
            return;
        }
        var dateArray = dateRange.split(";");
        if (dateArray.length === 0) {
            gs.info("Date not parse correctly");
            return;
        }
        return dateArray;
    },

    getSelectedSysIDs: function() {
        if (!this._isAdmin()) {
            gs.print("User: " + gs.getUserID() + " doesn't have access to ScheduleNodesLogsDownload");
            return;
        }

        var selectedSysIDsElement = this.getParameter("sysparm_selected_sys_ids");
        var selectedSysIDs = [];
        if (selectedSysIDsElement)
            selectedSysIDs = selectedSysIDsElement.split(";");

        return selectedSysIDs;
    },

    createNodeLogRecord: function(parentTrackerSysID) {
        if (!this._isAdmin()) {
            gs.print("User: " + gs.getUserID() + " doesn't have access to ScheduleNodesLogsDownload");
            return;
        }

        if (!GlideStringUtil.isEligibleSysID(parentTrackerSysID)) {
            gs.print(parentTrackerSysID + " is not a valid sys_id");
            return;
        }

        var dateArray = this.getDateArray();
        var grn = new GlideRecord('node_log_download_info');
        grn.initialize();
        grn.setValue("execution_tracker", parentTrackerSysID);
        grn.setValue('selected_node_number', this.getSelectedSysIDs().length);
        grn.setValue("log_start_date", dateArray[0]);
        grn.setValue("log_end_date", dateArray[dateArray.length - 1]);
        grn.setValue("requested_by", gs.getUserDisplayName());
        var tableSysID = grn.insert();
        return tableSysID;
    },

    scheduleJob: function(tableSysID, parentTrackerSysID) {
        if (!this._isAdmin()) {
            gs.print("User: " + gs.getUserID() + " doesn't have access to ScheduleNodesLogsDownload");
            return;
        }

        if (!GlideStringUtil.isEligibleSysID(tableSysID)) {
            gs.print(tableSysID + " is not a valid sys_id");
            return;
        }

        if (!GlideStringUtil.isEligibleSysID(parentTrackerSysID)) {
            gs.print(parentTrackerSysID + " is not a valid sys_id");
            return;
        }

        var email = this.getParameter("sysparm_email");
        var downloadUrl = this.getParameter('sysparm_protocol') + "//" + this.getParameter('sysparm_host') + "/download_logs.do?sysparm_sys_id=" + tableSysID;
        var childScript = "new AJAXLogDownloadWorker().downloadNow(" + "'" + tableSysID + "', '" + parentTrackerSysID + "', '" + email + "', '" + this.getParameter("sysparm_date_range") + "', '" + downloadUrl + "');";
        var rootScript = "new AJAXLogDownloadWorker().cancellParentTracker('" + tableSysID + "', '" + parentTrackerSysID + "', '" + email + "', '" + this.getParameter("sysparm_date_range") + "', '" + downloadUrl + "');";
        // Set log download time out, can change it in glide.util.logdownloadtimeout
        var time = new GlideDateTime();
        var timeOut = GlideProperties.getInt('glide.util.logdownloadtimeout', 10);
        time.addSeconds(timeOut * 60);
        GlideRunScriptJob.scheduleScript(rootScript, 'Check Node Log Download Parent Progress', time);

        var selectedSysIds = this.getSelectedSysIDs();
        for (var i = 0; i < selectedSysIds.length; i++)
            GlideRunScriptJob.scheduleScriptWithSystemID(childScript, 'Selected Node Log Download', 25, selectedSysIds[i]);

    },

    _isAdmin: function() {
        return gs.hasRole("admin");
    }
});