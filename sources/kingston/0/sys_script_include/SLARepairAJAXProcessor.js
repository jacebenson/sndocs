var SLARepairAJAXProcessor = Class.create();

SLARepairAJAXProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    initialize: function(request, responseXML, gc) {
        AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
        this._json = new JSON();
        this.lu = new GSLog(SLARepair.LOG_PROPERTY, this.type);
        if (gs.getProperty(SLARepair.SLA_DATABASE_LOG, "db") == "node")
            this.lu.disableDatabaseLogs();
    },

    start: function() {
        var payload = this.getParameter("sysparm_payload");
        var request;
        if (!JSUtil.nil(payload))
            request = this._json.decode(payload);

        if (this.lu.atLevel(GSLog.DEBUG))
            if (!JSUtil.nil(request.sys_id))
                this.lu.logDebug("Repairing " + request.table + ":" + request.sys_id);
            else
                this.lu.logDebug("Repairing " + request.table + ":" + request.filter);

        var tableDisplayName = new GlideRecord(request.table).getClassDisplayValue();

        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName(gs.getMessage("Repair SLAs for {0}", tableDisplayName));
        worker.setScriptIncludeName("SLARepair");

        if (!JSUtil.nil(request.sys_id)) {
            worker.setScriptIncludeMethod("repairBySysId");
            worker.putMethodArg("sys_id", request.sys_id);
            worker.putMethodArg("table", request.table);
        } else {
            worker.setScriptIncludeMethod("repairByFilter");
            worker.putMethodArg("filter", request.filter);
            worker.putMethodArg("table", request.table);
        }
        worker.setBackground(true);
        worker.start();

        return worker.getProgressID();
    },

    /**
     * validate that a repair can be performed.
     */
    validateRepair: function() {
        var resItem = this.newItem();
        var response = new SLARepairAJAXProcessor.Response();

        //JSON blob in payload.
        var strPayload = this.getParameter("payload");
        var request;
        if (!JSUtil.nil(strPayload))
            request = this._json.decode(strPayload);

        response.request = request;
        this._checkRequest(request, response);

        // If the request was not OK.
        if (response.status.code != 200) {
            resItem.setAttribute("payload", this._json.encode(response));
            return resItem;
        }

        // We've checked everything, now we can do something with it.
        var slar = new SLARepair().setValidateOnly(true);
        response.result = this._runNow(slar, request);
        this._parseResult(response);
        resItem.setAttribute("payload", this._json.encode(response));

        return resItem;
    },

    /**
     * Parse the output from the SLARepair
     */
    _parseResult: function(response) {

        if (typeof response.result === "undefined")
            response.result = {};

        //Check the audit information for the affected tables.
        if (typeof response.result.audit_info === "undefined")
            response.status.code = 503; //If there's no audit object something bad happened.
        else {
            // If we find one table that's audited the repair client will notify the user
            var hasAuditedTable = false;
            for ( var table in response.result.audit_info)
                if (response.result.audit_info[table].audit_on === true)
                    hasAuditedTable = true;

            if (!hasAuditedTable)
                response.status.code = 503;
        }

        // Move messages into the status object
        if (typeof response.result.err_msg !== "undefined") {
            response.status.err_msg = response.result.err_msg;
            delete (response.result.err_msg);
        }

        if (typeof response.result.info_msg !== "undefined") {
            response.status.info_msg = response.result.info_msg;
            delete (response.result.info_msg);
        }

        if (typeof response.result.warn_msg !== "undefined") {
            response.status.warn_msg = response.result.warn_msg;
            delete (response.result.warn_msg);
        }

        //Remove message arrays from response status if there are no messages
        if (response.status.info_msg.length == 0)
            delete (response.status.info_msg);
        if (response.status.err_msg.length == 0)
            delete (response.status.err_msg);
        if (response.status.warn_msg.length == 0)
            delete (response.status.warn_msg);

        if (this.lu.atLevel(GSLog.DEBUG))
            this.lu.logDebug("[_parseResult] Response: " + this._json.encode(response));
    },

    /**
     * Run the appropriate SLARepair method based on the request on the provided slaRepair instance.
     */
    _runNow: function(slaRepair, request) {
        var retVal;
        if (this.lu.atLevel(GSLog.DEBUG))
            if (!JSUtil.nil(request.sys_id))
                this.lu.logDebug("Repairing " + request.table + ":" + request.sys_id);
            else
                this.lu.logDebug("Repairing " + request.table + ":" + request.filter);

        if (!JSUtil.nil(request.sys_id))
            retVal = slaRepair.repairBySysId(request.sys_id, request.table);
        else
            retVal = slaRepair.repairByFilter(request.filter, request.table);

        return retVal;
    },

    /**
     * Check the request we received, if it has reasonable values etc.
     */
    _checkRequest: function(request, response) {
        if (JSUtil.nil(request)) {
            this.lu.logDebug("[_checkRequest] No request payload");
            response.status.code = 400;
            response.status.err_msg.push(gs.getMessage("A request was not provided"));
            return;
        }

        if (this.lu.atLevel(GSLog.DEBUG))
            this.lu.logDebug("_checkRequest] Request: " + this._json.encode(request));

        //Check we have what we need for a reasonable request.  Minimum params.
        if (request.table == null || (request.sys_id == null && request.filter == null)) {
            this.lu.logDebug("[_checkRequest] Invalid request provided");
            response.status.err_msg.push(gs.getMessage("An invalid request was provided"));
            return;
        }

        //Set defaults if none or invalid provided
        if (JSUtil.nil(request.repair_action) || request.repair_action + "" != "recreate")
            request.repair_action = "recreate";

        if (!request.when || (request.when + "" != "now" && request.when + "" != "scheduled"))
            request.when = "now";
    },

    type: 'SLARepairAJAXProcessor'
});

SLARepairAJAXProcessor.Response = Class.create();
SLARepairAJAXProcessor.Response.prototype = {
    initialize: function() {
        this.status = {
            "code": 200,
            "info_msg": [],
            "err_msg": [],
            "warn_msg": []
        };
    },
    type: "SLARepairAJAXProcessor.Response"
};