/*! RESOURCE: /scripts/GwtListEditAjaxChangeSaver.js */
var GwtListEditAjaxChangeSaver = Class.create({
    PROCESSOR: 'com.glide.ui_list_edit.AJAXListEdit',
    WAIT_INITIAL_DELAY: 300,
    WAITING_IMAGE: 'images/loading_anim3.gifx',
    initialize: function(changes, tableController, onCompletion) {
        this.changes = changes;
        this.tableController = tableController;
        this.onCompletion = onCompletion;
        this.changedEntries = [];
        this.savingImages = [];
        this.timer = null;
    },
    save: function() {
        this._startSavingTimer();
        var ajax = new GlideAjax(this.PROCESSOR);
        ajax.addParam("sysparm_type", 'set_value');
        ajax.addParam('sysparm_table', this.tableController.tableName);
        ajax.addParam('sysparm_first_field', this.tableController.firstField);
        ajax.addParam('sysparm_omit_links', this.tableController.omitLinks);
        ajax.addParam('sysparm_xml', this._buildXml());
        this.tableController.tableElementDOM.fire('glide:list_v2.edit.save', {
            ajax: ajax
        });
        ajax.setErrorCallback(this._errorResponse.bind(this));
        ajax.getXML(this._saveResponse.bind(this));
        this.changes.clearAllModified();
        this.changes.removeAll();
    },
    _buildXml: function() {
        var xml = this._createRecordUpdateXml();
        var selector = new GlideListEditor.IsModifiedRecordSelector(this.changes);
        var serializer = new GlideListEditor.XmlSerializingReceiver(xml, xml.documentElement, selector);
        var capture = new GwtListEditAjaxChangeSaver.ChangeCaptureReceiver();
        var receiver = new GwtListEditorPendingChanges.ComposableChangeReceiver();
        receiver.addReceiver(serializer);
        receiver.addReceiver(capture);
        this.changes.exportChanges(receiver);
        this.changedEntries = capture.changedEntries;
        return getXMLString(xml);
    },
    _createRecordUpdateXml: function() {
        var xml = loadXML("<record_update/>");
        this.tableController.exportXml(xml.documentElement);
        return xml;
    },
    _saveResponse: function(response) {
        this._hideSaving();
        if (!response || !response.responseXML) {
            if (this.onCompletion)
                this.onCompletion();
            return;
        }
        var savedSysIds = [];
        var xml = response.responseXML;
        var items = xml.getElementsByTagName("item");
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var sysId = item.getAttribute("sys_id");
            if (savedSysIds.indexOf(sysId) < 0)
                savedSysIds.push(sysId);
            var fqField = item.getAttribute("fqField");
            var data = item.firstChild;
            if (!data)
                continue
            var cell = this.tableController.getFqField(sysId, fqField);
            if (!cell)
                continue;
            GlideList2.updateCellContents(cell, data);
            var n = new GlideUINotification({
                type: 'action',
                attributes: {
                    table: this.tableController.tableName,
                    sys_id: sysId,
                    action: 'list_update'
                }
            });
            GlideUI.get().fire(n);
        }
        if (savedSysIds.length > 0)
            this._fireChangesSaved(savedSysIds);
        if (this.onCompletion)
            this.onCompletion();
    },
    _errorResponse: function() {
        this._hideSaving();
    },
    _fireChangesSaved: function(savedSysIds) {
        var info = {
            listId: this.tableController.listID,
            saves: savedSysIds
        };
        this.tableController.fire('glide:list_v2.edit.changes_saved', info);
    },
    _startSavingTimer: function() {
        this.timer = setTimeout(this._showSaving.bind(this), this.WAIT_INITIAL_DELAY);
    },
    _hideSaving: function() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        for (var i = 0; i < this.savingImages.length; i++)
            rel(this.savingImages[i]);
        this.savingImages = [];
    },
    _showSaving: function() {
        for (var i = 0; i < this.changedEntries.length; i++) {
            var sysId = this.changedEntries[i][0];
            var field = this.changedEntries[i][1];
            var element = this.tableController.getCell(sysId, field);
            if (element)
                this._showImage(element);
        }
    },
    _showImage: function(element) {
        var img = GwtListEditTableController.showImage(element, this.WAITING_IMAGE);
        this.savingImages.push(img);
    },
    toString: function() {
        return 'GwtListEditAjaxChangeSaver';
    }
});
GwtListEditAjaxChangeSaver.ChangeCaptureReceiver = Class.create(
    GwtListEditorPendingChanges.ChangeReceiver, {
        initialize: function($super) {
            $super();
            this.changedEntries = [];
        },
        changedField: function(sysID, field) {
            var entry = [sysID, field.getName()];
            this.changedEntries.push(entry);
        },
        toString: function() {
            return 'GwtListEditAjaxChangeSaver.ChangeCaptureReceiver';
        }
    });;