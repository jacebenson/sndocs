/*! RESOURCE: /scripts/classes/GlideDialogForm.js */
var GlideDialogForm = Class.create(GlideDialogWindow, {
    REFRESH_ID: "refresh_frame",
    CALLBACK_TARGET_FIELD: "glide_dialog_form_target",
    DIALOG_FORM: "glide_dialog_form",
    DELETE_FROM_CONF_DLG: "delete_from_confirm_dialog_ui_page",
    ZINDEX: 1001,
    initialize: function(title, tableName, onCompletionCallback, readOnly) {
        this.parms = {};
        this.fieldIDSet = false;
        this.positionSet = false;
        this.dialogWidth = "";
        this.dialogHeight = "";
        this.additionalWidth = 17;
        this.additionalHeight = 17;
        this.centerOnResize = true;
        GlideDialogWindow.prototype.initialize.call(this, "FormDialog", readOnly);
        if (title)
            this.setTitle(title);
        this.setPreference('renderer', 'RenderForm');
        this.setPreference('table', this.DIALOG_FORM);
        this.setPreference('sysparm_nameofstack', 'formDialog');
        this.on("bodyrendered", this._onLoaded.bind(this));
        this.tableName = tableName;
        if (onCompletionCallback)
            this.setCompletionCallback(onCompletionCallback);
    },
    destroy: function() {
        this.un("bodyrendered");
        if (this.callbackField) {
            this.callbackField.onchange = null;
            rel(this.CALLBACK_TARGET_FIELD + "_" + this.tableName);
        }
        if (this.refreshField) {
            this.refreshField.onchange = null;
            rel(this.REFRESH_ID);
        }
        GlideDialogWindow.prototype.destroy.call(this);
        this.fireEvent("dialogclosed");
    },
    _onLoaded: function() {
        var f = gel("dialog_form_poster");
        f.action = this.tableName + '.do';
        addHidden(f, 'sysparm_nameofstack', 'formDialog');
        addHidden(f, 'sysparm_titleless', 'true');
        addHidden(f, 'sysparm_is_dialog_form', 'true');
        var sysId = this.getPreference('sys_id');
        if (!sysId)
            sysId = '';
        var targetField = '';
        if (this.fieldIDSet)
            targetField = this.getPreference('sysparm_target_field');
        addHidden(f, 'sys_id', sysId);
        addHidden(f, 'sysparm_sys_id', sysId);
        addHidden(f, 'sysparm_goto_url', this.DIALOG_FORM + '.do?sysparm_pass2=true&sysparm_skipmsgs=true&sysparm_nameofstack=formDialog&sysparm_returned_sysid=$action:$sys_id:$display_value&sysparm_target_field=' + targetField);
        this.isLoaded = true;
        for (id in this.parms)
            addHidden(f, id, this.parms[id]);
        f.submit();
    },
    setLoadCallback: function(func) {
        this.loadCallback = func;
    },
    setX: function(x) {
        this.x = x;
        this.positionSet = true;
    },
    setY: function(y) {
        this.y = y;
        this.positionSet = true;
    },
    onResize: function() {
        this._centerOrPosition();
    },
    setDialogTitle: function(title) {
        this.setTitle(title);
    },
    setSysID: function(id) {
        this.setPreference('sys_id', id);
    },
    setFieldID: function(fid) {
        this.fieldIDSet = true;
        this.setPreference('sysparm_target_field', fid);
    },
    setType: function(type) {
        this.setPreference('type', type);
    },
    setMultiple: function(form) {
        this.setPreference('sys_id', '-2');
        this.addParm('sysparm_multiple_update', 'true');
        this.addParm('sys_action', 'sysverb_multiple_update')
        this.form = form;
    },
    setDialogSize: function(w, h) {
        this.setDialogWidth(w);
        this.setDialogHeight(h);
    },
    setDialogWidth: function(w) {
        this.dialogWidth = w;
    },
    setDialogHeight: function(h) {
        this.dialogHeight = h;
    },
    setDialogHeightMax: function(h) {
        this.dialogHeightMax = h;
    },
    setCenterOnResize: function(flag) {
        this.centerOnResize = flag;
    },
    addParm: function(parm, value) {
        this.parms[parm] = value;
    },
    render: function() {
        if (this.fieldIDSet == false)
            this.setRefresh();
        GlideDialogWindow.prototype.render.call(this);
    },
    setRefresh: function() {
        var r = gel(this.REFRESH_ID)
        if (r == null)
            this.initRefresh();
        this.setFieldID(this.REFRESH_ID);
    },
    setForm: function(form) {
        this.form = form
    },
    initRefresh: function() {
        this.refreshField = cel("input");
        this.refreshField.type = "hidden";
        this.refreshField.id = this.REFRESH_ID;
        this.refreshField.onchange = this.doRefresh.bind(this);
        document.body.appendChild(this.refreshField);
        return this.refreshField;
    },
    doRefresh: function() {
        var search = self.location.href;
        if (search.indexOf("sysparm_refresh") == -1) {
            if (search.indexOf("?") == -1)
                search += "?";
            else
                search += "&";
            search += "sysparm_refresh=refresh";
        }
        self.location.href = search;
    },
    setCompletionCallback: function(func) {
        this.onCompletionFunc = func;
        this.callbackField = cel("input");
        this.callbackField.type = "hidden";
        this.callbackField.id = this.CALLBACK_TARGET_FIELD + "_" + this.tableName;
        this.callbackField.onchange = this._completionCallback.bind(this);
        document.body.appendChild(this.callbackField);
        this.setFieldID(this.callbackField.id);
    },
    frameLoaded: function() {
        this._hideLoading();
        if (!this.isLoaded)
            return;
        this._resizeDialog();
        if (this.loadCallback)
            this.loadCallback(this._getIframeDocument());
    },
    _centerOrPosition: function() {
        if (!this.positionSet) {
            this._centerOnScreen();
            return;
        }
        this.moveTo(this.x, this.y);
    },
    _completionCallback: function() {
        var e = gel(this.CALLBACK_TARGET_FIELD + "_" + this.tableName);
        if (e) {
            var sysId;
            var action;
            var displayValue;
            var info = e.value.split(":");
            var action = info[0];
            if (info.length > 1)
                sysId = info[1];
            if (info.length > 2) {
                displayValue = info[2].unescapeHTML();
            }
            this.onCompletionFunc(info[0], info[1], this.tableName, displayValue);
        }
    },
    _resizeDialog: function() {
        var doc = this._getIframeDocument();
        if (!doc)
            return;
        var scrollable = this._getScrollable(doc.body);
        if (!this.dialogWidth)
            this.dialogWidth = scrollable.scrollWidth + this.additionalWidth;
        if (!this.dialogHeight)
            this.dialogHeight = scrollable.scrollHeight + this.additionalHeight;
        if (this.dialogHeightMax)
            this.dialogHeight = Math.min(this.dialogHeightMax, this.dialogHeight);
        var e = gel('dialog_frame');
        e.style.height = this.dialogHeight + "px";
        e.style.width = this.dialogWidth + "px";
        this._centerOrPosition();
    },
    _getScrollable: function(body) {
        var elements = $(body).select('.section_header_content_no_scroll');
        if (elements && elements.length > 0) {
            return elements[0];
        }
        return body;
    },
    _hideLoading: function() {
        var l = gel('loadingSpan');
        if (l)
            l.style.display = 'none';
    },
    _getIframeDocument: function() {
        var e = gel('dialog_frame');
        if (e)
            if (e.contentDocument)
                return e.contentDocument;
        return document.frames['dialog_frame'].document;
    },
    type: function() {
        return "GlideDialogForm";
    }
});

function closeDialogForm(id) {
    var w = parent.gel('window.FormDialog');
    if (w) {
        w.gWindow.destroy();
        return;
    }
    if (!id)
        return;
    w = parent.$j('#' + id).data('gWindow');
    if (w)
        w.destroy();
};