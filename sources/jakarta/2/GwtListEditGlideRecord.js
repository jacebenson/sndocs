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
      ins