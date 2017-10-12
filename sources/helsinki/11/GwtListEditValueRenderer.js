/*! RESOURCE: /scripts/GwtListEditValueRenderer.js */
var GwtListEditValueRenderer = Class.create({
      MSGS: [
        'Insert a new row...',
        'Undelete',
        'Mark deleted',
        'Loading...',
        'A new {0} identified by {1} will be created upon save'
      ],
      initialize: function(changes, tableController) {
        this.changes = changes;
        this.tableController = tableController;
        this.gList = new GwtListEditGList(this.changes, this.tableController, this);
        this.decor = new GwtListEditRecordDecorations(this.changes, this.tableController);
        this.emptyRecord = null;
        this.msgs = getMessages(this.MSGS);
      },
      updateTable: function() {
        this.decor.updateTable();
      },
      setValue: function(sysId, fieldName, value) {
        if (this.changes.isEmptyRecord(sysId))
          this._saveEmptyRecord(sysId);
        return this.changes.setValue(sysId, fieldName, value, this._callOnChange.bind(this));
      },
      setDisplayValue: function(sysId, fieldName, value) {
        if (this.changes.isEmptyRecord(sysId))
          this._saveEmptyRecord(sysId);
        return this.changes.setDisplayValue(sysId, fieldName, value, this._callOnChange.bind(this));
      },
      addRow: function() {
          if (GlideLists2[this.tableController.listID] && GlideLists2[this.tableController.listI