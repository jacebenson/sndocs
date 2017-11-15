/*! RESOURCE: /scripts/GwtListEditRecord.js */
var GwtListEditRecord = Class.create({
  initialize: function(sysId) {
    this.sysId = sysId;
    if (sysId == "-1")
      this.operation = "default_values";
    else
      this.operation = "update";
    this.fields = {};
  },
  addField: function(name) {
    var f = this.getField(name);
    if (f)
      return f;
    this.fields[name] = new GwtListEditField(name);
    return this.fields[name];
  },
  getField: function(name) {
    return this.fields[name];
  },
  getFields: function() {
    return this.fields;
  },
  setOperation: function(operation) {
    if (this.sysId == "-1")
      return;
    this.operation = operation;
  },
  isModified: function() {
    for (var n in this.fields) {
      var field = this.fields[n];
      if (field.isModified())
        return true;
    }
    return false;
  },
  isNew: function() {
    return "new" === this.operation;
  },
  isDefaultValues: function() {
    if (this.sysId == "-1")
      return true;
    return "default_values" === this.operation;
  },
  isAdded: function() {
    return "add" === this.operation || "add_existing" === this.operation;
  },
  isUpdated: function() {
    return "update" === this.operation;
  },
  isDeleted: function() {
    if ("delete_pending" === this.operation)
      return true;
    return ("delete" === this.operation);
  },
  clearModified: function() {
    for (var n in this.fields)
      this.fields[n].clearModified();
  },
  type: 'GwtListEditRecord'
});
var GwtListEditField = Class.create({
  initialize: function(name) {
    this.name = name;
    this.label = name;
    this.referenceValid = true;
    this._clear();
  },
  getName: function() {
    return this.name;
  },
  getLabel: function() {
    return this.label;
  },
  getOriginalValue: function() {
    return this.originalValue;
  },
  getOriginalDisplay: function() {
    return this.originalDisplay;
  },
  getValue: function() {
    return this.value;
  },
  getDisplayValue: function() {
    return this.displayValue;
  },
  getRenderValue: function() {
    return this.renderValue;
  },
  isValueSet: function() {
    return this.valueSet;
  },
  isDisplayValueSet: function() {
    return this.displaySet;
  },
  isRenderValueSet: function() {
    return this.renderSet;
  },
  isModified: function() {
    return this.modified;
  },
  isWritable: function() {
    return this.canWrite;
  },
  isMandatory: function() {
    return this.mandatory;
  },
  isOKExtension: function() {
    return this.okExtension;
  },
  isReferenceValid: function() {
    return this.referenceValid;
  },
  clearModified: function() {
    this.modified = false;
  },
  setWritable: function(canWrite) {
    this.canWrite = canWrite;
  },
  setMandatory: function(mandatory) {
    this.mandatory = mandatory;
  },
  setOKExtension: function(okExtension) {
    this.okExtension = okExtension;
  },
  setLabel: function(label) {
    this.label = label;
  },
  setInitialValues: function(v, dsp) {
    this._clear();
    this.originalValue = v;
    this.originalDisplay = dsp;
    this.value = v;
    this.displayValue = dsp;
    this._convertNullsToBlank();
  },
  setValue: function(v) {
    if (this.value != v)
      this.modified = true;
    this.value = v;
    this.valueSet = true;
    this.renderSet = false;
    this.renderValue = "";
    this._convertNullsToBlank();
  },
  setDisplayValue: function(v) {
    if (this.displayValue != v)
      this.modified = true;
    this.displayValue = v;
    this.displaySet = true;
    this.renderSet = false;
    this.renderValue = "";
    this._convertNullsToBlank();
  },
  setRenderValue: function(v) {
    this.renderValue = v;
    this.renderSet = true;
    this._convertNullsToBlank();
  },
  setReferenceValid: function(valid) {
    this.referenceValid = valid;
  },
  unsetValue: function() {
    this.value = '';
    this.valueSet = false;
  },
  unsetDisplayValue: function() {
    this.displayValue = '';
    this.displaySet = false;
  },
  unsetRenderValue: function() {
    this.renderValue = '';
    this.renderSet = false;
  },
  _clear: function() {
    this.value = '';
    this.displayValue = '';
    this.renderValue = '';
    this.valueSet = false;
    this.displaySet = false;
    this.renderSet = false;
    this.modified = false;
    this.canWrite = false;
    this.mandatory = false;
  },
  _convertNullsToBlank: function() {
    if (!this.value)
      this.value = '';
    if (!this.displayValue)
      this.displayValue = '';
    if (!this.renderValue)
      this.renderValue = '';
  },
  type: 'GwtListEditField'
});;