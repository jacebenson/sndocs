/*! RESOURCE: /scripts/GwtCellEditor.js */
var GwtCellEditor = Class.create({
  REF_ELEMENT_PREFIX: 'ref_',
  IGNORE_MSG: "This element type is not editable from the list.",
  WAITING_IMAGE: 'images/loading_anim3.gifx',
  initialize: function(gridEdit, ignoreTypes, changes, tableController, renderer) {
    this.gridEdit = gridEdit;
    this.ignoreTypes = ignoreTypes;
    this.changes = changes;
    this.tableController = tableController;
    this.renderer = renderer;
    this._initElement();
    if (this.tableElement === null) {
      return;
    }
    this.savedFields = [];
    if (this.changes.isDeletedRow(this.sysId))
      return;
    this.timer = setTimeout(this.showLoading.bind(this), this.WAIT_INITIAL_DELAY);
    this.valid = true;
    this.errorMsg = this._checkIgnoreTypes();
    if (this.errorMsg) {
      this.editWindow = this._buildErrorEditor();
      return;
    }
    this.errorMsg = this._checkMultipleDerivedOrExtended();
    if (this.errorMsg) {
      this.editWindow = this._buildErrorEditor();
      return;
    }
    this._loadValues(this.renderEditor.bind(this));
  },
  dismiss: function() {
    this.valid = false;
    this.hideLoading();
    if (this.editWindow)
      this.editWindow.dismiss();
  },
  saveAndClose: function() {
    this.valid = false;
    this.hideLoading();
    if (this.editWindow)
      return this.editWindow.saveAndClose();
    return false;
  },
  saveValues: function() {
    this._saveValues();
  },
  _getSelectedSysIds: function() {
    return this.gridEdit.getSelectedSysIds();
  },
  _getSecurityFields: function() {
    if (this.tableElement.isReference()) {
      var answer = [];
      answer.push(this.fieldName);
      return answer;
    }
    return this.fields;
  },
  getValue: function(field) {
    if (!field)
      field = this.fieldName;
    return this.changes.getValue(this.sysId, field);
  },
  getDisplayValue: function(field) {
    if (!field)
      field = this.fieldName;
    return this.changes.getDisplayValue(this.sysId, field);
  },
  getRenderValue: function(field) {
    if (!field)
      field = this.fieldName;
    return this.changes.getRenderValue(this.sysId, field);
  },
  getCanWriteIds: function() {
    var sysIds = this._getSelectedSysIds();
    return this.changes.calcWritableSysIds(sysIds, this._getSecurityFields());
  },
  isMandatory: function(id, fieldName) {
    if (!fieldName)
      fieldName = this.fieldName;
    if (!id)
      id = this.sysId;
    var record = this.changes.get(id);
    if (!record)
      return false;
    var field = record.getField(fieldName);
    if (!field)
      return false;
    if (field.isMandatory())
      return true;
  },
  setValue: function(value, displayValue) {
    this.setFieldValue(this.fieldName, value, displayValue);
  },
  setReferenceValid: function(valid) {
    this.changes.setReferenceValid(this.sysId, this.fieldName, valid);
  },
  isReferenceValid: function() {
    return this.changes.isReferenceValid(this.sysId, this.fieldName);
  },
  setFieldValue: function(name, value, displayValue) {
    var ids = this.getCanWriteIds();
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      this._beforeSetValue(id, name, value, displayValue);
      if (value == null)
        this.renderer.setDisplayValue(id, name, displayValue);
      else
        this.renderer.setValue(id, name, value);
      this._afterSetValue(id, name);
      if (this.changes.isAddedRow(id) || this.changes.isFieldDirty(id, name)) {
        var entry = [id, name];
        this.savedFields.push(entry);
      }
    }
  },
  setRenderValue: function(value, displayValue) {
    this.setFieldRenderValue(this.fieldName, value, displayValue);
  },
  setFieldRenderValue: function(name, value) {
    var ids = this.getCanWriteIds();
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      this.changes.setRenderValue(id, name, value);
      if (this.changes.isFieldDirty(id, name))
        this.renderer.renderValue(id, name);
    }
  },
  renderEditor: function() {
    if (!this.valid)
      return;
    var valueErr = this.changes.getLoaderErrorMsg();
    if (valueErr)
      this.errorMsg = valueErr;
    else
      this.errorMsg = this._checkSecurity();
    if (this.errorMsg)
      this.editWindow = this._buildErrorEditor();
    else
      this.editWindow = this._createEditWindow();
  },
  _buildErrorEditor: function() {
    this.gridEdit.clearSelected();
    return new GwtListEditError(this, this.gridEdit, this.errorMsg);
  },
  _checkIgnoreTypes: function() {
    var type = this.tableElement.getType();
    for (var i = 0; i < this.ignoreTypes.length; i++) {
      if (type == this.ignoreTypes[i])
        return getMessage(this.IGNORE_MSG);
    }
    if (this.tableElement.isArray())
      return getMessage(this.IGNORE_MSG);
    return null;
  },
  _checkSecurity: function() {
    var canWriteIds = this.getCanWriteIds();
    if (canWriteIds.length != 0)
      return null;
    var sysIds = this._getSelectedSysIds();
    if (sysIds.length == 1) {
      var field = this.changes.getField(sysIds[0], this.fields[0]);
      if (field && !field.isOKExtension()) {
        return getMessage("Field does not exist for this record");
      }
    }
    return getMessage("Security prevents writing to this field");
  },
  _checkMultipleDerivedOrExtended: function() {
    var parts = this.name.split('.');
    var sysIds = this._getSelectedSysIds();
    if ((sysIds.length > 1) && (parts.length > 2)) {
      if (parts[1].indexOf(this.REF_ELEMENT_PREFIX) == 0) {
        return getMessage("Only one extended field can be list edited at a time");
      }
      return getMessage("Only one derived field can be list edited at a time");
    }
    return null;
  },
  _createEditWindow: function() {
    var tableElement = this.tableElement;
    var isDoctype = document.documentElement.getAttribute("data-doctype") == "true";
    if ((tableElement.isDependent() || tableElement.hasDependentChildren()) && tableElement.isChoice())
      return new GwtListEditDependent(this, this.gridEdit, this.fields);
    if (tableElement.isDate())
      return new GwtListEditCalendar(this, this.gridEdit);
    if (tableElement.isReference() && tableElement.getType() !== "currency2")
      return new GwtListEditReference(this, this.gridEdit);
    if (tableElement.isChoice() || tableElement.getType() == "workflow")
      return new GwtListEditSelect(this, this.gridEdit);
    if (tableElement.getType() == "boolean")
      return new GwtListEditBoolean(this, this.gridEdit);
    if (tableElement.getType() == "glide_duration" || tableElement.getType() == "timer")
      return new GwtListEditDuration(this, this.gridEdit);
    if (tableElement.getType() == "table_name") {
      if (tableElement.getNamedAttribute("update_tables_only") == "true") {
        return new GwtListEditUpdateTablename(this, this.gridEdit);
      }
      return new GwtListEditTablename(this, this.gridEdit);
    }
    if (tableElement.getType() === "currency2")
      return new GwtListEditCurrency2(this, this.gridEdit);
    if (tableElement.isEncrypted())
      return new GwtListEditEncryptedText(this, this.gridEdit);
    if (tableElement.isMulti() && tableElement.getType() != "journal_input")
      return new GwtListEditMultiText(this, this.gridEdit);
    if (tableElement.getType() == "journal_input")
      return new GwtListEditJournal(this, this.gridEdit);
    if (tableElement.getType() == "related_tags") {
      if (!isDoctype)
        return new GwtListEditError(this, this.gridEdit, getMessage("In-cell editing not available, instead use the 'Assign Tag...' Context Menu to add a tag"));
      else
        return new GwtListEditRelatedTags(this, this.gridEdit);
    }
    if (tableElement.getType() == "internal_type")
      return new GwtListEditInternalType(this, this.gridEdit);
    if (tableElement.getType() == "translated_field")
      return new GwtListEditTranslatedField(this, this.gridEdit);
    if (tableElement.getType().startsWith('password'))
      return new GwtListEditPassword(this, this.gridEdit);
    return new GwtListEditText(this, this.gridEdit);
  },
  _beforeSetValue: function(sysId, name, value, displayValue) {},
  _afterSetValue: function(sysId, name) {},
  showLoading: function() {
    this.loadingImage = GwtListEditTableController.showImage(
      this.gridEdit.getAnchorCell(), this.WAITING_IMAGE);
  },
  hideLoading: function() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.loadingImage) {
      rel(this.loadingImage);
      this.loadingImage = null;
    }
  },
  _initElement: function() {
    this.sysId = this.gridEdit.getAnchorSysId();
    this.name = this.gridEdit.getAnchorFqFieldName();
    var parts = this.name.split('.');
    this.table = parts[0];
    this.fieldName = parts.slice(1).join('.');
    this.tableElement = TableElement.get(this.name);
    if (this.tableElement === null) {
      return;
    }
    this.fields = [];
    var topParent = this._findTopParent();
    this._initFields(topParent);
    this._addFieldName(this.fieldName);
  },
  _findTopParent: function() {
    var topParent = this.name;
    var visited = new Object();
    var name = topParent;
    while (name) {
      name = null;
      var tableElement = TableElement.get(topParent);
      if (tableElement) {
        name = tableElement.getDependent();
        if (name) {
          topParent = this.table + "." + name;
          if (visited[name])
            return topParent;
          visited[name] = topParent;
        }
      }
    }
    return topParent;
  },
  _initFields: function(fieldName) {
    var tableElement = TableElement.get(fieldName);
    if (!tableElement)
      return;
    var prefix = '';
    var parts = fieldName.split('.');
    if (parts.length > 2)
      prefix = parts.slice(1, -1).join('.') + '.';
    if (this._addFieldName(prefix + tableElement.name)) {
      var children = tableElement.getDependentChildren();
      for (var k in children)
        this._initFields(this.table + "." + prefix + k);
    }
  },
  _addFieldName: function(fieldName) {
    for (var i = 0; i < this.fields.length; i++)
      if (this.fields[i] == fieldName)
        return null;
    this.fields.push(fieldName);
    return fieldName;
  },
  addRecSysId: function(recPos, callback) {
    var sysId = this.tableController.getSysIDByPos(recPos);
    if (!sysId)
      return;
    if (this.changes.isDeletedRow(sysId))
      return;
    this._loadValues(callback);
  },
  _loadValues: function(callbackStub) {
    this.changes.loadValues(this._getSelectedSysIds(), this.fields, callbackStub);
  },
  _saveValues: function() {
    if (this.savedFields.length > 0) {
      this.tableController.fireCellsChanged(this.savedFields);
      this.savedFields = [];
    }
  },
  isActive: function() {
    if (!this.valid)
      return false;
    if (!this.editWindow)
      return false;
    return !this.editWindow.destroyed;
  },
  toString: function() {
    return "GwtCellEditor";
  }
});;