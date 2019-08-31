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
    return field.getDisplayValue();
  },
  getRenderValue: function(sysId, fieldName) {
    var field = this.getField(sysId, fieldName);
    if (!field)
      return "";
    return field.getRenderValue();
  },
  getRecordOperation: function(sysId) {
    var r = this.get(sysId);
    if (r)
      return r.operation;
    return '';
  },
  setRecordOperation: function(sysId, operation) {
    var r = this.get(sysId);
    if (r)
      r.operation = operation;
  },
  getField: function(sysId, field) {
    var r = this.get(sysId);
    if (!r)
      return null;
    return r.getField(field);
  },
  getFieldDefaults: function() {
    var defaults = this.getDefaults();
    if (!defaults)
      return {};
    return defaults.getFields();
  },
  setDefaults: function(record) {
    var fields = this.getFieldDefaults();
    for (var n in fields) {
      var defaultField = fields[n];
      var f = record.addField(n);
      f.setInitialValues(defaultField.getValue(), defaultField.getDisplayValue());
      f.setWritable(defaultField.isWritable());
      f.setMandatory(defaultField.isMandatory());
      f.setOKExtension(defaultField.isOKExtension());
      f.setLabel(defaultField.getLabel());
    }
  },
  setRenderValue: function(sysId, fieldName, value) {
    var field = this.getField(sysId, fieldName);
    if (!field)
      return null;
    field.setRenderValue(value);
    return field;
  },
  isFieldDirty: function(sysId, fieldName) {
    var field = this.getField(sysId, fieldName);
    if (!field)
      return false;
    return field.isModified();
  },
  isValueSet: function(sysId, fieldName) {
    var field = this.getField(sysId, fieldName);
    if (!field)
      return false;
    return field.isValueSet();
  },
  getDefaults: function() {
    return this.modifiedRecords["-1"];
  },
  getDeletedRowCount: function() {
    var count = 0;
    for (var id in this.modifiedRecords) {
      var record = this.modifiedRecords[id];
      if (record.isDeleted())
        count++;
    }
    return count;
  },
  getAddedRowCount: function() {
    var count = 0;
    for (var id in this.modifiedRecords) {
      var record = this.modifiedRecords[id];
      if (record.isAdded())
        count++;
    }
    return count;
  },
  canWriteToFields: function(id, fields) {
    var record = this.get(id);
    if (!record)
      return false;
    var fieldsLen = fields.length;
    var canWrite = !!fieldsLen;
    for (var j = 0; j < fieldsLen; j++) {
      var field = record.getField(fields[j]);
      if (!field || !field.canWrite) {
        canWrite = false;
        break;
      }
    }
    return canWrite;
  },
  clearDefaults: function() {
    delete this.modifiedRecords["-1"];
  },
  clearModified: function(sysId) {
    if (!this.get(sysId))
      return;
    this.get(sysId).clearModified();
  },
  clearAllModified: function() {
    for (var id in this.changes)
      this.clearModified(id);
  },
  remove: function(sysId) {
    if (this.modifiedRecords[sysId])
      delete this.modifiedRecords[sysId];
  },
  removeAll: function() {
    for (var i in this.modifiedRecords)
      if (i != -1)
        this.remove(i);
  },
  getValueToRender: function(sysId, fieldName) {
    var field = this.getField(sysId, fieldName);
    if (!field || (this.emptyRecord && sysId == this.emptyRecord.sysId))
      return '';
    if (field.isRenderValueSet())
      return field.getRenderValue();
    if (field.isDisplayValueSet())
      return field.getDisplayValue();
    if (field.isValueSet())
      return field.getValue();
    if (field.getRenderValue())
      return field.getRenderValue();
    if (field.getDisplayValue())
      return field.getDisplayValue();
    return field.getValue();
  },
  exportRecords: function(receiver) {
    for (var id in this.modifiedRecords) {
      var record = this.get(id);
      receiver.changedRecord(id, record);
    }
  },
  exportChanges: function(receiver) {
    var exporter = new GwtListEditorPendingChanges.ChangeExporter(receiver);
    this.exportRecords(exporter);
  },
  inspectRecords: function(receiver) {
    for (var id in this.modifiedRecords) {
      if (receiver.isDone())
        return;
      var record = this.get(id);
      receiver.changedRecord(id, record);
    }
  },
  getAggregateValue: function(fieldName, type) {
    this.aggregates.getAggregateValue(fieldName, type);
  },
  getAggregateFields: function() {
    return this.aggregates.getAggregateFields();
  },
  addToAggregates: function(record) {
    var fields = record.getFields();
    for (var n in fields) {
      var field = fields[n];
      var value = field.getValue();
      if (field.isDisplayValueSet())
        value = field.getDisplayValue();
      this.aggregates.addToAggregates(n, value);
    }
  },
  removeFromAggregates: function(record) {
    var fields = record.getFields();
    for (var n in fields) {
      var field = fields[n];
      var value = field.getValue();
      if (field.isDisplayValueSet())
        value = field.getDisplayValue();
      this.aggregates.removeFromAggregates(n, value);
    }
  },
  updateAggregates: function(n, originalValue, value) {
    this.aggregates.updateAggregates(n, originalValue, value);
  },
  rowCountChanged: function(value) {
    this.aggregates.rowCountChanged(value);
  },
  resetAggregates: function() {
    this.aggregates.resetAggregates();
  },
  calcWritableSysIds: function(sysIds, securityFields) {
    var writableSysIds = [];
    for (var i = 0; i < sysIds.length; i++) {
      var sysId = sysIds[i];
      if (this.canWriteToFields(sysId, securityFields))
        writableSysIds.push(sysId);
    }
    return writableSysIds;
  },
  isDeletedRow: function(sysId) {
    var record = this.get(sysId);
    if (!record)
      return false;
    return record.isDeleted();
  },
  isUpdatedRow: function(sysId) {
    var record = this.get(sysId);
    if (!record)
      return false;
    return record.isUpdated();
  },
  isAddedRow: function(sysId) {
    var record = this.get(sysId);
    if (!record)
      return false;
    return record.isAdded();
  },
  loadValues: function(sysIds, fields, callback) {
    this.valueLoader.loadValues(sysIds, fields, callback);
  },
  loadDefaults: function(callback) {
    this.valueLoader.loadDefaults(callback);
  },
  loadTable: function(callback) {
    this.valueLoader.loadTable(callback);
  },
  getLoaderErrorMsg: function() {
    return this.valueLoader.getErrorMsg();
  },
  toString: function() {
    return 'GwtListEditorPendingChanges';
  }
});
GwtListEditorPendingChanges.RecordReceiver = Class.create({
  changedRecord: function(sysID, record) {},
  toString: function() {
    return 'GwtListEditorPendingChanges.RecordReceiver';
  }
});
GwtListEditorPendingChanges.RecordInspector = Class.create(
  GwtListEditorPendingChanges.RecordReceiver, {
    isDone: function() {
      return false;
    },
    toString: function() {
      return 'GwtListEditorPendingChanges.RecordReceiver';
    }
  });
GwtListEditorPendingChanges.ChangeExporter = Class.create(
  GwtListEditorPendingChanges.RecordReceiver, {
    initialize: function($super, receiver) {
      $super();
      this.receiver = receiver;
    },
    changedRecord: function(sysID, record) {
      if (record.isDefaultValues())
        return;
      if (record.isNew())
        return;
      if (this.receiver.beginRecord(sysID, record.operation)) {
        var fields = record.getFields();
        for (var fieldName in fields) {
          var field = fields[fieldName];
          this.receiver.changedField(sysID, field)
        }
      }
      this.receiver.endRecord(sysID);
    },
    toString: function() {
      return 'GwtListEditorPendingChanges.ChangeExporter';
    }
  });
GwtListEditorPendingChanges.ChangeReceiver = Class.create({
  beginRecord: function(sysID, op) {
    return true;
  },
  endRecord: function(sysID) {},
  changedField: function(sysID, field) {},
  toString: function() {
    return 'GwtListEditorPendingChanges.ChangeReceiver';
  }
});
GwtListEditorPendingChanges.ComposableChangeReceiver = Class.create(
  GwtListEditorPendingChanges.ChangeReceiver, {
    initialize: function($super) {
      $super();
      this.receivers = [];
    },
    addReceiver: function(receiver) {
      this.receivers.push(receiver);
    },
    beginRecord: function(sysID, op) {
      for (i = 0; i < this.receivers.length; i++) {
        var result = this.receivers[i].beginRecord(sysID, op);
        if (!result) {
          this.limit = i + 1;
          return false;
        }
      }
      this.limit = this.receivers.length;
      return true;
    },
    endRecord: function(sysID) {
      for (i = 0; i < this.limit; i++)
        this.receivers[i].endRecord(sysID);
    },
    changedField: function(sysID, field) {
      for (i = 0; i < this.limit; i++)
        this.receivers[i].changedField(sysID, field);
    },
    toString: function() {
      return 'GwtListEditorPendingChanges.ComposableChangeReceiver';
    }
  });;