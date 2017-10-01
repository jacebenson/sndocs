/*! RESOURCE: /scripts/SLARepairClient.js */
var SLARepairClient = Class.create({
    initialize: function() {},
    repairBySysId: function(table, sysId) {
        this.request = new SLARepairClient.Request(table);
        this.request.sys_id = sysId;
        this._validateRequest();
    },
    repairByFilter: function(table, filter) {
        this.request = new SLARepairClient.Request(table);
        this.request.filter = filter;
        this._validateRequest();
    },
    _validateRequest: function() {
        var ga = new GlideAjax('SLARepairAJAXProcessor');
        ga.addParam('sysparm_name', 'validateRepair');
        ga.addParam('payload', Object.toJSON(this.request));
        ga.getXML(this._processRequest.bind(this));
    },
    _processRequest: function(rawResponse) {
        this._getMessages();
        GlideUI.get().clearOutputMessages();
        var response = rawResponse.responseXML.getElementsByTagName("item")[0].getAttribute("payload");
        response = response.evalJSON();
        if (response.status.code == 400) {
            if (response.status.err_msg && response.status.err_msg.length != 0)
                for (var i = 0; i < response.status.err_msg.length; i++)
                    this._addErrorMessage(response.status.err_msg[i]);
            else
                this._addErrorMessage(this.msgs["An invalid repair request was made"]);
            return;
        }
        if (response.status.code == 503) {
            if (response.status.err_msg && response.status.err_msg.length != 0)
                for (var i = 0; i < response.status.err_msg.length; i++)
                    this._addErrorMessage(response.status.err_msg[i]);
            else
                this._addErrorMessage(this.msgs["Repair cannot be run against tables that are not audited"]);
            return;
        }
        if (response.status.code != 200) {
            this._addErrorMessage(this.msgs["An unknown error occured"]);
            return;
        }
        if (!response.result.count || response.result.count == 0) {
            this._addInfoMessage(this.msgs["There were no records found to repair"]);
            return;
        }
        this._loadWarning(response);
    },
    _loadWarning: function(response) {
        var unauditedTables = [];
        for (var table in response.result.audit_info) {
            var tableInfo = response.result.audit_info[table];
            if (!tableInfo.audit_on)
                unauditedTables.push(tableInfo.label);
        }
        this.dlg = new GlideModal('sla_repair_confirm');
        this.dlg.setTitle(this.msgs["Warning"]);
        this.dlg.setWidth(351);
        this.dlg.setPreference("sysparm_record_count", response.result.count);
        this.dlg.setPreference("sysparm_source_table", response.request.table);
        this.dlg.setPreference("sysparm_unaudited_tables", unauditedTables.join(","));
        this.dlg.on("runRepair", function() {
            this._loadProgressWorker();
        }.bind(this));
        this.dlg.render();
    },
    _loadProgressWorker: function() {
        var dd = new GlideModal("simple_progress_viewer", false, "40em", "10.5em");
        dd.setTitle(this.msgs["Repair SLAs"]);
        dd.setPreference("sysparm_ajax_processor", "SLARepairAJAXProcessor");
        dd.setPreference("sysparm_payload", Object.toJSON(this.request));
        dd.setPreference('sysparm_progress_name', this.msgs["Repairing SLAs"]);
        dd.setPreference("sysparm_renderer_expanded_levels", "0");
        dd.setPreference("sysparm_renderer_hide_drill_down", true);
        dd.setPreference("sysparm_button_view_logs", this.msgs["View Logs"]);
        dd.setPreference("sysparm_button_close", this.msgs["Close"]);
        dd.on("executionComplete", function(trackerObj) {
            var closeBtn = $("sysparm_button_close");
            if (closeBtn) {
                closeBtn.onclick = function() {
                    dd.destroy();
                };
            }
            var logsBtn = $("sysparm_button_view_logs");
            if (logsBtn) {
                logsBtn.onclick = function() {
                    location.href = "sla_repair_log.do?sysparm_query=sys_execution_tracker=" + trackerObj.sys_id;
                }.bind(this);
            }
        });
        dd.on("beforeclose", function() {
            if (!this.callback) {
                window.location.reload;
                return;
            }
            this.callback();
        }.bind(this));
        dd.render();
        this.dlg.destroy();
    },
    _addErrorMessage: function(message) {
        if (typeof g_form !== "undefined") {
            g_form.addErrorMessage(message);
            return;
        }
        GlideUI.get().addOutputMessage({
            "msg": message,
            "type": "error",
            id: null
        });
    },
    _addInfoMessage: function(message) {
        if (typeof g_form !== "undefined") {
            g_form.addInfoMessage(message);
            return;
        }
        GlideUI.get().addOutputMessage({
            "msg": message,
            "type": "info",
            id: null
        });
    },
    _getMessages: function() {
        this.msgs = getMessages(SLARepairClient.msg_keys);
    },
    type: "SLARepairClient"
});
SLARepairClient.Request = Class.create({
    initialize: function(table) {
        this.table = table;
    },
    repair_action: "recreate",
    when: "now",
    type: "SLARepairClient.request"
});
SLARepairClient.msg_keys = ["Warning", "Repair SLAs", "Repairing SLAs", "Close", "View Logs", "An invalid repair request was made", "Repair is not available for this record", "There were no records found to repair",
    "An unknown error occured"
];;