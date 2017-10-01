/*! RESOURCE: /scripts/GwtListEditSavePolicy.js */
var GwtListEditSavePolicy = Class.create({
    initialize: function(listId) {
        this.listId = listId;
    },
    analyzeEvent: function(evt) {
        return;
    },
    isDirectSave: function() {
        return false;
    },
    isDeferredSave: function() {
        return false;
    },
    isImpliedSave: function() {
        return false;
    },
    getDeferredSaves: function() {
        return [];
    },
    handleChangesSaved: function(evt) {},
    handleRowsDeleted: function(evt) {},
    getEdits: function(evt) {
        if ('glide:list_v2.edit.cells_changed' !== evt.eventName)
            return [];
        if (this.listId !== evt.memo.listId)
            return [];
        return evt.memo.edits;
    },
    getSaves: function(evt) {
        if ('glide:list_v2.edit.changes_saved' !== evt.eventName)
            return [];
        if (this.listId !== evt.memo.listId)
            return [];
        return evt.memo.saves;
    },
    getDeletes: function(evt) {
        if ('glide:list_v2.edit.rows_deleted' !== evt.eventName)
            return [];
        if (this.listId !== evt.memo.listId)
            return [];
        return evt.memo.deletes;
    },
    isSaveNow: function(evt) {
        if ('glide:list_v2.edit.save_now' !== evt.eventName)
            return false;
        return (this.listId === evt.memo.listId);
    },
    toString: function() {
        return 'GwtListEditSavePolicy';
    }
});
GwtListEditSavePolicy.CellEdit = Class.create(GwtListEditSavePolicy, {
    analyzeEvent: function(evt) {
        if (this.isSaveNow(evt))
            this.isSave = true;
        else if (this.getEdits(evt).length > 0)
            this.isSave = true;
        else
            this.isSave = false;
    },
    isDirectSave: function() {
        return this.isSave;
    },
    toString: function() {
        return 'GwtListEditSavePolicy.CellEdit';
    }
});
GwtListEditSavePolicy.SaveWithForm = Class.create(GwtListEditSavePolicy, {
    initialize: function($super, listId) {
        $super(listId);
        this.defers = [];
    },
    analyzeEvent: function(evt) {
        this.defers = [];
        var edits = this.getEdits(evt);
        for (var i = 0; i < edits.length; i++) {
            var edit = edits[i];
            var sysId = edit[0];
            g_form.fieldChanged(sysId + "_" + edit[1], true);
            if (this.defers.indexOf(sysId) < 0)
                this.defers.push(sysId);
        }
    },
    isDeferredSave: function() {
        return (this.defers.length > 0);
    },
    getDeferredSaves: function() {
        return this.defers;
    },
    handleChangesSaved: function(evt) {
        this.defers = [];
    },
    handleRowsDeleted: function(evt) {
        var deletes = this.getDeletes(evt);
        for (i = 0; i < this.defers.length; i++) {
            var delSysId = this.defers[i];
            if (deletes.indexOf(delSysId) >= 0) {
                this.defers.splice(i, 1);
                i--;
            }
        }
    },
    toString: function() {
        return 'GwtListEditSavePolicy.SaveWithForm';
    }
});
GwtListEditSavePolicy.SaveByRow = Class.create(GwtListEditSavePolicy, {
    initialize: function($super, tableController) {
        $super(tableController.listID);
        this.tableController = tableController;
        this.pendingSysId = null;
    },
    analyzeEvent: function(evt) {
        this.signalSave = (this.getEdits(evt).length > 0);
        this.directSave = this._isSaveEdit(evt);
        this.impliedSave = this._isSaveMotion(evt);
    },
    isDirectSave: function() {
        return this.directSave;
    },
    isDeferredSave: function() {
        if (this.isDirectSave())
            return false;
        return this.signalSave;
    },
    isImpliedSave: function() {
        return this.impliedSave;
    },
    getDeferredSaves: function() {
        if (this.pendingSysId)
            return [this.pendingSysId];
        return [];
    },
    handleChangesSaved: function(evt) {
        var saves = this.getSaves(evt);
        if (saves.indexOf(this.pendingSysId) >= 0)
            this._clearPendingSysId();
    },
    handleRowsDeleted: function(evt) {
        var deletes = this.getDeletes(evt);
        if (deletes.indexOf(this.pendingSysId) >= 0)
            this._clearPendingSysId();
    },
    _clearPendingSysId: function() {
        this.pendingSysId = null;
        this.signalSave = false;
        this.directSave = false;
        this.impliedSave = false;
    },
    _isSaveEdit: function(evt) {
        if (this.isSaveNow(evt))
            return true;
        var edits = this.getEdits(evt);
        for (var i = 0; i < edits.length; i++) {
            if (!this.pendingSysId)
                this.pendingSysId = edits[i][0];
            else if (this.pendingSysId !== edits[i][0])
                return true;
        }
        return false;
    },
    _isSaveMotion: function(evt) {
        if (!this.pendingSysId)
            return false;
        if (this._isSaveMove(evt))
            return true;
        if (this._isSaveClick(evt))
            return true;
        return false;
    },
    _isSaveMove: function(evt) {
        if (!evt.eventName)
            return false;
        if ('glide:list_v2.edit.focus_moved' !== evt.eventName)
            return false;
        if (!evt.memo)
            return true;
        if (evt.memo.listId !== this.listId)
            return false;
        var toRow = evt.memo.toRow;
        if (!toRow)
            return true;
        var moveSysId = this.tableController.getSysID(toRow);
        if (!moveSysId)
            return true;
        return moveSysId !== this.pendingSysId;
    },
    _isSaveClick: function(evt) {
        if ('click' !== evt.type)
            return false;
        var row = Event.findElement(evt, 'tr.list_row');
        if (!row || row === document)
            return true;
        var clickSysId = this.tableController.getSysID(row.rowIndex);
        if (!clickSysId)
            return true;
        return clickSysId !== this.pendingSysId;
    },
    toString: function() {
        return 'GwtListEditSavePolicy.SaveByRow';
    }
});;