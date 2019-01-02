/*! RESOURCE: /scripts/GwtListEditorPendingChanges.js */
var GwtListEditorPendingChanges = Class.create({
      initialize: function(tableController) {
        this.aggregates = new GlideListAggregates(tableController);
        this.valueLoader = new GwtListEditAjaxValueLoader(this, tableController);
        this.modifiedRecords = {};
        this.emptyRecord = null;
      },
      get: function(sysId) {
        if (this.isEmptyRecord(sysId))
          return this.emptyRecord;
        return this.modifiedRecords[sysId];
      },
      getModifiedRecords: function() {
        return this.modifiedRecords;
      },
      put: function(sysId, record) {
        this.modifiedRecords[sysId] = record;
      },
      has: function(sysId) {
        return this.modifiedRecords[sysId] != null;
      },
      addRecord: function(sysId, operation) {
        var record = new GwtListEditRecord(sysId);
        if (operation)
          record.setOperation(operation);
        this.put(sysId, record);
        return record;
      },
      addEmptyRecord: function(sysId) {
        this.saveEmptyRecord();
        this.emptyRecord = new GwtListEditRecord(sysId);
        this.emptyRecord.setOperation("new");
        return this.emptyRecord;
      },
      addField: function(sysId, fieldName, value) {
        var record = this.get(sysId);
        var field = record.addField(fieldName);
        field.setValue(value);
      },
      saveEmptyRecord: function() {
        var result = this.emptyRecord;
        if (result) {
          result.setOperation("add");
          this.modifiedRecords[this.emptyRecord.sysId] = result;
        }
        this.emptyRecord = null;
        return result;
      },
      isEmptyRecord: function(sysId) {
        return this.emptyRecord && this.emptyRecord.sysId == sysId;
      },
      getValue: function(sysId, fieldName) {
        var field = this.getField(sysId, fieldName);
        if (!field)
          return "";
        return field.getValue();
      },
      setValue: function(sysId, fieldName, value, notify) {
        var field = this.getField(sysId, fieldName);
        if (!field)
          return null;
        var oldValue = field.getValue();
        notify(sysId, fieldName, oldValue, value);
        field.setValue(value);
        this.aggregates.updateAggregates(fieldName, oldValue, value);
        return field;
      },
      setDisplayValue: function(sysId, fieldName, value, notify) {
        var field = this.getField(sysId, fieldName);
        if (!field)
          return null;
        var oldValue = field.getDisplayValue();
        notify(sysId, fieldName, oldValue, value);
        field.setDisplayValue(value);
        this.aggregates.updateAggregates(fieldName, oldValue, value);
        return field;
      },
      setReferenceValid: function(sysId, fieldName, valid) {
        var field = this.getField(sysId, fieldName);
        if (field)
          field.setReferenceValid(valid);
      },
      isReferenceValid: function(sysId, fieldName) {
        var field = this.getField(sysId, fieldName);
        if (field)
          return field.isReferenceValid();
        return true;
      },
      getDisplayValue: function(sysId, fieldName) {
          var field = this.getField(sysId, fieldName);
          if (!field)
            return "";
          return