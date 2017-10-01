/*! RESOURCE: /scripts/classes/GwtExportScheduleDialog.js */
var GwtExportScheduleDialog = Class.create(GlideDialogWindow, {
    initialize: function(tableName, query, rows, view, action, fields, excel_type) {
        GlideDialogWindow.prototype.initialize.call(this, 'export_schedule_dialog');
        var keys = ["Please Confirm", "Please specify an address", "Export will be emailed to"];
        this.msgs = getMessages(keys);
        this.tableName = tableName;
        this.query = query;
        this.rows = rows;
        this.view = view;
        this.action = action;
        this.fields = fields;
        this.excel_type = excel_type;
        this.setPreference('table', 'export_schedule');
        this.setPreference('sysparm_query', this.query);
        this.setPreference('sysparm_target', this.tableName);
        this.setPreference('sysparm_export', this.action);
        this.setPreference('sysparm_view', this.view);
        this.setPreference('sysparm_rows', this.rows);
        this.setPreference('sysparm_fields', this.fields);
        this.setPreference('sysparm_excel_type', this.excel_type);
        this.setTitle(this.msgs["Please Confirm"]);
        g_export_schedule_dialog = this;
    },
    execute: function() {
        this.render();
    },
    close: function() {
        g_export_schedule_dialog = null;
        this.destroy();
    },
    emailMe: function() {
        var address = gel('display_address');
        if (!address)
            return;
        if (address.value == '') {
            alert(this.msgs["Please specify an address"]);
            return;
        }
        var real_address = gel('email_address');
        real_address.value = address.value;
        var splits = this.action.split('\_');
        var fName = 'sys_confirm_' + splits[1] + '.do';
        var confirm_form = gel(fName);
        confirm_form.sys_action.value = "email";
        var remember_me = gel('display_remember_me');
        if (remember_me.checked)
            gel('remember_me').value = "true";
        var serial = Form.serialize(confirm_form);
        var args = this.msgs["Export will be emailed to"] + ' ' + address.value;
        serverRequestPost(fName, serial, this.ack, args);
        this.close();
    },
    waitForIt: function() {
        var dialog = new GwtPollDialog(this.tableName, this.query, this.rows, this.view, this.action, this.fields, this.excel_type);
        dialog.execute();
        this.close();
    },
    ack: function(request, message) {
        alert(message);
    }
});;