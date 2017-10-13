/*! RESOURCE: /scripts/GwtListEditGList.js */
var GwtListEditGList = Class.create({
  initialize: function(changes, tableController, renderer) {
    this.changes = changes;
    this.tableController = tableController;
    this.renderer = renderer;
  },
  getValue: function(sysId, fieldName) {
    return this.changes.getValue(sysId, fieldName);
  },
  getDisplayValue: function(sysId, fieldName) {
    return this.changes.getDisplayValue(sysId, fieldName);
  },
  isWritable: function(sysId, fieldName) {
    return this.changes.isWritable(sysId, fieldName);
  },
  setValue: function(sysId, fieldName, value) {
    this.renderer.setValue(sysId, fieldName, value);
  },
  setDisplayValue: function(sysId, fieldName, value) {
    this.renderer.setDisplayValue(sysId, fieldName, value);
    if (!this.changes.isValueSet(sysId, fieldName))
      this.changes.setValue(sysId, fieldName, value);
  },
  renderValue: function(sysId, fieldName, valueToDisplay) {
    this.renderer.renderValue(sysId, fieldName, valueToDisplay, false);
  },
  getAggregate: function(fieldName, type) {
    return this.changes.getAggregateValue(fieldName, type);
  },
  getRowCount: function() {
    return this.tableController.rowCount - this.changes.getDeletedRowCount() + this.changes.getAddedRowCount();
  },
  addRow: function() {
    this.renderer.addRow();
  },
  addRowWithValues: function(values, displayValues) {
    this.renderer.addRow(values, displayValues);
  },
  deleteRowToggle: function(sysId) {
    this.renderer.deleteRowToggle(sysId);
  },
  getGlideRecord: function() {
    return new GwtListEditGlideRecord(this.changes, this.tableController, this.renderer);
  },
  toString: function() {
    return 'GwtListEditGList';
  }
});;