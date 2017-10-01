/*! RESOURCE: /scripts/GlideListEditorMessaging.js */
(function() {
    "use strict";
    window.GlideListEditorMessaging = Class.create({
        initialize: function(gle) {
            if (!NOW || !NOW.MessageBus)
                return;
            this._recordMessage = NOW.messaging.record;
            this._pendingNewRecords = [];
            this._pendingSavedRecords = {};
            this._listEditor = gle;
            this._registerEvents(gle);
        },
        _registerEvents: function() {
            this._listEditor.tableController.observe(
                'glide:list_v2.edit.save', this._messageListEdit.bind(this));
            this._listEditor.tableController.observe(
                'glide:list_v2.edit.cells_changed', this._messageCellsChanged.bind(this));
            this._listEditor.tableController.observe(
                'glide:list_v2.edit.row_added', this._messageRowAdded.bind(this));
            this._listEditor.tableController.observe(
                'glide:list_v2.edit.changes_saved', this._messageRowSaved.bind(this));
            this._listEditor.tableController.observe(
                'glide:list_v2.edit.rows_deleted', this._messageRowDeleted.bind(this));
        },
        _messageListEdit: function() {
            if (this._listEditor.hasChanges()) {
                var modifiedRecords = this._listEditor.cellEditor.changes.getModifiedRecords();
                for (var i in modifiedRecords) {
                    if (!modifiedRecords.hasOwnProperty(i) || i == '-1')
                        continue;
                    this._pendingSavedRecords[i] = this._getRecordChanges(modifiedRecords[i]);
                }
            }
        },
        _messageCellsChanged: function(evt) {
            var edits = this._listEditor.savePolicy.getEdits(evt);
            for (var i = 0; i < edits.length; i++) {
                var recordSysId = edits[i][0];
                if (this._isPendingNewRecord(recordSysId))
                    continue;
                var savedRecord = this._pendingSavedRecords[recordSysId];
                if (!savedRecord)
                    savedRecord = this._getRecordChanges(this._listEditor.cellEditor.changes.get(recordSysId));
            }
        },
        _messageRowAdded: function(evt) {
            var recordSysId = evt.memo.sys_id;
            this._pendingNewRecords.push(recordSysId);
        },
        _messageRowSaved: function(evt) {
            var recordTableName = this._getTableName();
            for (var i = 0; i < evt.memo.saves.length; i++) {
                var recordSysId = evt.memo.saves[i];
                if (this._isPendingNewRecord(recordSysId)) {
                    this._recordMessage.created(
                        recordTableName, {
                            sys_id: recordSysId
                        }, {
                            name: 'list',
                            list_id: evt.memo.listId
                        }
                    );
                    var pendingIndex = this._pendingNewRecords.indexOf(recordSysId);
                    this._pendingNewRecords.splice(pendingIndex, 1);
                } else {
                    var savedRecord = this._pendingSavedRecords[recordSysId];
                    if (!savedRecord)
                        return;
                    this._recordMessage.updated(
                        recordTableName, {
                            sys_id: recordSysId
                        },
                        savedRecord.changes, {
                            name: 'list',
                            list_id: evt.memo.listId
                        }
                    );
                    delete this._pendingNewRecords[recordSysId];
                }
            }
        },
        _messageRowDeleted: function(evt) {
            var recordTableName = this._getTableName();
            for (var i = 0; i < evt.memo.deletes; i++) {
                var recordSysId = evt.memo.deletes[i];
                this._recordMessage.deleted(
                    recordTableName, {
                        sys_id: recordSysId
                    }, {
                        name: 'list',
                        list_id: evt.memo.listId
                    }
                );
            }
        },
        _isPendingNewRecord: function(id) {
            return this._pendingNewRecords.indexOf(id) != -1;
        },
        _getRecordChanges: function(modifiedRecord) {
            return {
                changes: this._getFieldChanges(modifiedRecord)
            }
        },
        _getFieldChanges: function(modifiedRecord) {
            var fields = modifiedRecord.getFields();
            var changes = {};
            for (var f in fields) {
                if (!fields.hasOwnProperty(f))
                    continue;
                var field = fields[f];
                changes[f] = {
                    current: {
                        value: field.value,
                        displayValue: field.renderValue
                    },
                    previous: {
                        value: field.originalValue,
                        displayValue: field.originalDisplay
                    }
                };
            }
            return changes;
        },
        _getTableName: function() {
            return this._listEditor.tableController.tableName;
        },
        toString: function() {
            return 'GlideListEditorMessaging';
        }
    })
})();;