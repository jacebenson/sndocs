/*! RESOURCE: /scripts/GwtListEditGlideRecord.js */
var GwtListEditGlideRecord = Class.create({
    initialized: false,
    initialize: function(changes, tableController, renderer) {
        this.changes = changes;
        this.tableController = tableController;
        this.renderer = renderer;
        this.currentRow = -1;
        this.sysIds = [];
        this.displayValues = {};
        if (!this.initialized)
            this._setIgnoreNames();
        else
            this._clearValues();
        this.initialized = true;
    },
    addQuery: function() {
        alert('GwtListEditGlideRecord.addQuery is not currently supported');
    },
    getEncodedQuery: function() {
        alert('GwtListEditGlideRecord.addQuery is not currently supported');
    },
    deleteRecord: function() {
        var sysId = this._getRowSysId();
        if (!sysId)
            return;
        if (this.changes.isDeletedRow(sysId))
            return;
        this.renderer.deleteRowToggle(sysId);
    },
    get: function(sysId) {
        var rec = this.changes.get(sysId);
        if (rec) {
            this.currentRow = 0;
            this.sysIds = [sysId];
            return true;
        }
        this.currentRow = -1;
        this.sysIds = [];
        return false;
    },
    getTableName: function() {
        return this.tableController.tableName;
    },
    gotoTop: function() {
        this.currentRow = -1;
    },
    hasNext: function() {
        return (this.currentRow + 1 < this.sysIds.length);
    },
    insert: function() {
        var values = {};
        var dspValues = {};
        for (var xname in this) {
            if (this.ignoreNames[xname])
                continue;
            values[xname] = this[xname];
        }
        for (var xname in this.displayValues)
            dspValues[xname] = this.displayValues[xname];
        this.renderer.addRowWithValues(values, dspValues);
    },
    next: function() {
        if (!this.hasNext())
            return false;
        this.currentRow++;
        this._loadRow();
        return true;
    },
    _next: function() {
        return this.next;
    },
    query: function() {
        this._initRows();
        this.currentRow = -1;
        return;
    },
    setDisplayValue: function(fieldName, dsp) {
        this.displayValue[fieldName] = dsp;
        if ('undefined' === typeof this[fieldName])
            this[fieldName] = dsp;
    },
    update: function() {
        var sysId = this._getRowSysId();
        if (!sysId)
            return;
        var record = this.changes.get(sysId);
        if (!record)
            return;
        for (var xname in this) {
            if (this.ignoreNames[xname])
                continue;
            if (xname == 'sys_id')
                continue;
            var val = this[xname];
            var dsp = this.displayValues[xname];
            var field = record.getField(xname);
            if (!field)
                field = record.addField(xname);
            var changed = false;
            if (field.getValue() != val) {
                this.renderer.setValue(sysId, xname, val);
                changed = true;
            }
            if ((typeof dsp != 'undefined') && (field.getDisplayValue() != dsp)) {
                this.renderer.setDisplayValue(sysId, xname, dsp);
                changed = true;
            }
            if (changed)
                this.renderer.renderValue(sysId, xname);
        }
    },
    getRowCount: function() {
        return this.sysIds.length;
    },
    _initRows: function() {
        var receiver = new GwtListEditGlideRecord.RowBuilder();
        this.changes.exportRecords(receiver);
        this.sysIds = receiver.sysIds;
    },
    _loadRow: function() {
        this._clearValues();
        var sysId = this._getRowSysId();
        if (!sysId)
            return null;
        var record = this.changes.get(sysId);
        if (!record)
            return;
        this.sys_id = sysId;
        var fields = record.getFields();
        for (var fname in fields) {
            if (fname.indexOf('.') != -1)
                continue;
            var field = fields[fname];
            this[fname] = field.getValue();
            this.displayValues[fname] = field.getDisplayValue();
        }
    },
    _getRowSysId: function() {
        if ((this.currentRow < 0) || (this.currentRow >= this.sysIds.length))
            return;
        return this.sysIds[this.currentRow];
    },
    _clearValues: function() {
        this.displayValues = {};
        for (var xname in this) {
            if (this.ignoreNames[xname] && this.ignoreNames[xname] == true)
                continue;
            delete this[xname];
        }
    },
    _setIgnoreNames: function() {
        this.ignoreNames = [];
        for (var xname in this) {
            this.ignoreNames[xname] = true;
        }
    },
    toString: function() {
        return 'GwtListEditGlideRecord';
    }
});
GwtListEditGlideRecord.RowBuilder = Class.create(
    GwtListEditorPendingChanges.RecordReceiver, {
        initialize: function($super) {
            $super();
            this.sysIds = [];
        },
        changedRecord: function(sysID, record) {
            if (record.isDeleted())
                return;
            if (record.isDefaultValues())
                return;
            this.sysIds.push(sysID);
        },
        toString: function() {
            return 'GlideListEditor.RowUpdater';
        }
    });;