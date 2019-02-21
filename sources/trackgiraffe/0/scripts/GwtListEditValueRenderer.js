/*! RESOURCE: /scripts/GwtListEditValueRenderer.js */
var GwtListEditValueRenderer = Class.create({
  MSGS: [
    'Insert a new row...',
    'Undo mark for deletion',
    'Mark for deletion',
    'Loading...',
    'A new {0} identified by {1} will be created upon save',
    'Undo mark row for deletion',
    'Mark row for deletion'
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
    if (GlideLists2[this.tableController.listID] && GlideLists2[this.tableController.listID].disableRowAdd)
      return;
    this.addRowWithValues({}, {});
  },
  addRowWithValues: function(values, displayValues) {
    if (GlideLists2[this.tableController.listID] && GlideLists2[this.tableController.listID].disableRowAdd)
      return;
    var adder = this._addRowHandler.bind(this, values, displayValues);
    this.changes.loadDefaults(adder);
  },
  _addRowHandler: function(values, displayValues) {
    function _addRowHandlerCallback(sysId) {
      var record = this.changes.addRecord(sysId, "add");
      this.changes.setDefaults(record);
      this._populateFields(record, values, displayValues);
      this.insertRowForRecord(record);
      this.changes.addToAggregates(record);
    }
    this._generateId(_addRowHandlerCallback.bind(this));
  },
  _populateFields: function(record, values, displayValues) {
    for (var v in values) {
      var field = record.addField(v);
      field.setValue(values[v]);
    }
    for (var v in displayValues) {
      var field = record.addField(v);
      field.setDisplayValue(displayValues[v]);
    }
  },
  addRowNoInsert: function() {
    if (!this.tableController.canCreate)
      return;
    if (GlideLists2[this.tableController.listID] && GlideLists2[this.tableController.listID].disableRowAdd)
      return;
    if (!this.emptyRecord) {
      this.changes.loadDefaults(this._addRowNoInsertHandler.bind(this));
      return;
    }
    this.insertRowForRecord(this.emptyRecord);
    this.decor.showEdit(this.emptyRecord.sysId);
  },
  _addRowNoInsertHandler: function() {
    function _addRowNoInsertEmptyRecordCallback(sysId) {
      this.emptyRecord = this.changes.addEmptyRecord(sysId);
      this.changes.setDefaults(this.emptyRecord);
      this.insertRowForRecord(this.emptyRecord);
      this.decor.showEdit(this.emptyRecord.sysId);
    }
    if (!this.emptyRecord) {
      this._generateId(_addRowNoInsertEmptyRecordCallback.bind(this));
    }
  },
  renderValue: function(sysId, fieldName, valueToDisplay, newRow) {
    var cell = this.tableController.getCell(sysId, fieldName);
    if (!cell)
      return;
    var cellIndex = document.documentElement.getAttribute('data-doctype') == 'true' ? 2 : 1;
    var dspValue = this._getValueToRender(sysId, fieldName, valueToDisplay);
    if (newRow && (cellIndex === cell.cellIndex) && ("" === dspValue)) {
      dspValue = this.msgs['Insert a new row...'];
      cell.addClassName("list_edit_new_row");
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
    }
    this._renderContents(cell, sysId, fieldName, dspValue, newRow);
    this._markChangedField(cell, sysId, fieldName);
  },
  _renderContents: function(cell, sysId, fieldName, dspValue, newRow) {
    if (dspValue)
      dspValue = dspValue.escapeHTML();
    if (!newRow && this.tableController.isFirstField(fieldName)) {
      var linkLabel = this._getLinkLabel(cell);
      if (linkLabel) {
        linkLabel.nodeValue = dspValue;
        return;
      }
    }
    var doctypeMode = document.documentElement.getAttribute('data-doctype') == 'true';
    cell.innerHTML = "";
    var fieldElement = this.tableController.getFieldElement(fieldName);
    if (fieldElement.isReference()) {
      var referenceValue = this.changes.getValue(sysId, fieldName);
      if (referenceValue) {
        if ('NULL' === referenceValue) {
          if (!hasClassName(cell, "list_edit_new_row"))
            dspValue = '';
        } else if (!this.changes.isReferenceValid(sysId, fieldName)) {
          if (fieldElement.isDynamicCreation()) {
            var o = {
              sys_id: referenceValue,
              display: dspValue,
              title: new GwtMessage().format(
                this.msgs['A new {0} identified by {1} will be created upon save.'],
                fieldElement.getRefLabel(), referenceValue)
            };
            var dynamicTemplate = doctypeMode ?
              GwtListEditValueRenderer.Templates.RENDER_DYNAMIC_REFERENCE_DOCTYPE :
              GwtListEditValueRenderer.Templates.RENDER_DYNAMIC_REFERENCE
            cell.insert(dynamicTemplate.evaluate(o));
            return;
          }
          dspValue = '';
        } else {
          if (this.tableController.omitLinks == false) {
            var o = {
              sys_id: referenceValue,
              refKey: fieldElement.refKey,
              display: dspValue,
              href: fieldElement.reference
            };
            var template = doctypeMode ?
              GwtListEditValueRenderer.Templates.RENDER_REFERENCE_DOCTYPE :
              GwtListEditValueRenderer.Templates.RENDER_REFERENCE
            cell.insert(template.evaluate(o));
            return;
          }
        }
      }
    }
    var defaultTemplate = doctypeMode ? GwtListEditValueRenderer.Templates.RENDER_DEFAULT_DOCTYPE : GwtListEditValueRenderer.Templates.RENDER_DEFAULT;
    cell.insert(defaultTemplate.evaluate({
      display: dspValue
    }));
  },
  _getLinkLabel: function(cell) {
    if (!cell)
      return null;
    if (!cell.firstChild)
      return null;
    var child = cell.down('a.linked') || cell.firstChild;
    return child.firstChild;
  },
  _getValueToRender: function(sysId, fieldName, valueToDisplay) {
    if (valueToDisplay)
      return valueToDisplay;
    return this.changes.getValueToRender(sysId, fieldName);
  },
  _saveEmptyRecord: function(id) {
    var record = this.changes.saveEmptyRecord(id);
    var sysId = this.tableController.getRelatedSysID();
    if (sysId)
      this.changes.addField(id, this.tableController.relatedField, sysId);
    var tr = $(id);
    if (tr) {
      this._removeAddRowClassName(tr);
      this._resetBackgroundColor(tr);
    }
    this.updateRowWithRecord(record);
    this.changes.addToAggregates(record);
    this.emptyRecord = null;
    this.addRowNoInsert();
  },
  insertRowForRecord: function(record) {
    var isNew = record.isNew();
    this.tableController.buildRow(record.sysId);
    this.changes.rowCountChanged(1);
    var fields = record.getFields();
    for (var n in fields)
      this.renderValue(record.sysId, n, "", isNew);
    var info = {
      listId: this.tableController.listID,
      sys_id: record.sysId
    };
    this.tableController.fire('glide:list_v2.edit.row_added', info);
  },
  showViewDecorations: function(sysId) {
    this.decor.showView(sysId);
  },
  isDoctype: function() {
    return document.documentElement.getAttribute('data-doctype') == 'true';
  },
  updateRowWithRecord: function(record) {
    var fields = record.getFields();
    for (var n in fields) {
      this.renderValue(record.sysId, n);
      var field = fields[n];
      if (field.isDisplayValueSet())
        this.changes.updateAggregates(n, field.getOriginalDisplay(), field.getDisplayValue());
      else if (field.isValueSet())
        this.changes.updateAggregates(n, field.getOriginalValue(), field.getValue());
    }
  },
  deleteRowWithRecord: function(record) {
    var sysId = record.sysId;
    var tr = this.tableController.getRow(sysId);
    if (tr) {
      if (!hasClassName(tr, "list_delete"))
        GwtListEditTableController.addClassToRow(tr, "list_delete");
      var img = tr.select('.list_delete_row')[0];
      img.src = "images/undelete_row.gifx";
      img.setAttribute('aria-label', this.msgs['Undo mark row for deletion']);
      img.setAttribute('data-dynamic-title', this.msgs['Undo mark for deletion']);
      if (this.isDoctype())
        img.setStyle({
          color: '#cfcfcf'
        });
    }
    this.changes.removeFromAggregates(record);
  },
  deleteRowToggle: function(sysId) {
    var record = this.changes.get(sysId);
    if (record && record.operation == "delete_pending")
      return;
    if (!record)
      record = this.changes.addRecord(sysId, "delete_pending");
    if (this.tableController.isFormUI())
      g_form.fieldChanged("delete_row", true);
    if (record.operation == "delete") {
      this._undeleteRow(record);
      var tr = this.tableController.getRow(sysId);
      if (tr) {
        GwtListEditTableController.removeClassFromRow(tr, "list_delete");
        var img = tr.select('.list_delete_row')[0];
        img.src = "images/delete_row.gifx";
        img.setAttribute('aria-label', this.msgs['Mark row for deletion']);
        img.setAttribute('data-dynamic-title', this.msgs['Mark for deletion']);
        if (this.isDoctype())
          img.setStyle({
            color: '#FF402C'
          })
      }
    } else if (record.operation == "add") {
      this.tableController.deleteRow(sysId);
      this.changes.remove(sysId);
      this.changes.rowCountChanged(-1);
      this.changes.removeFromAggregates(record);
      var info = {
        listId: this.tableController.listID,
        deletes: [sysId]
      };
      this.tableController.fire('glide:list_v2.edit.rows_deleted', info);
    } else {
      record.operation = "delete_pending";
      if (img) {
        img.src = "images/loading_anim2.gifx";
        img.alt = this.msgs['Loading...'];
      }
      var tr = this.tableController.getRow(sysId);
      if (tr) {
        GwtListEditTableController.addClassToRow(tr, "list_delete");
        var img = tr.select('.list_delete_row')[0];
        img.src = "images/loading_anim2.gifx";
        writeTitle(img, this.msgs['Loading...']);
      }
      this.changes.loadValues([sysId], this.changes.getAggregateFields(), this._deleteRowHandler.bind(this, sysId));
    }
  },
  _deleteRowHandler: function(sysId) {
    var record = this.changes.get(sysId);
    if (!record)
      return;
    record.setOperation("delete");
    this.deleteRowWithRecord(record);
  },
  _undeleteRow: function(record) {
    record.setOperation("update");
    this.changes.addToAggregates(record);
  },
  _generateId: function(callback) {
    var aj = new GlideAjax("GlideSystemAjax");
    aj.addParam("sysparm_name", "newGuid");
    return aj.getXMLAnswer(callback);
  },
  _callOnChange: function(sysId, fieldName, oldValue, value) {
    var old_g_list = null;
    if (typeof g_list != "undefined")
      old_g_list = g_list;
    g_list = this.gList;
    var scriptName = "onChange_" + this.tableController.listID + "_" + fieldName;
    for (var ndx = 0; ndx < 100; ndx++) {
      var f = GlideListEditor.getClientScriptFunc(scriptName, ndx);
      if (f == null)
        break;
      try {
        f(sysId, oldValue, value);
      } catch (ex) {}
    }
    g_list = old_g_list;
  },
  _markChangedField: function(cell, sysId, fieldName) {
    if (!this.tableController.hasDeferredChanges())
      return;
    if (!this.changes.isFieldDirty(sysId, fieldName))
      return;
    addClassName(cell, 'list_edit_dirty');
  },
  _removeAddRowClassName: function(tr) {
    var newRows = tr.select('.list_edit_new_row');
    for (var i = 0; i < newRows.length; i++)
      newRows[i].removeClassName('list_edit_new_row');
  },
  _resetBackgroundColor: function(tr) {
    var previousRows = tr.previousSiblings();
    if (previousRows.length > 0) {
      if (previousRows[0].hasClassName("list_odd"))
        tr.className = "list_even";
      else
        tr.className = "list_odd";
      addClassName(tr, "list_row");
    }
  },
  toString: function() {
    return 'GwtListEditValueRenderer';
  }
});
GwtListEditValueRenderer.Templates = {
  RENDER_REFERENCE: new Template(
    '<a class="linked" sys_id="#{sys_id}" href="#{href}.do?sys_id=#{sys_id}&sysparm_refkey=#{refKey}">#{display}</a>'
  ),
  RENDER_DYNAMIC_REFERENCE: new Template(
    '<span class="ref_dynamic" title="#{title}">#{display}</span>'
  ),
  RENDER_REFERENCE_DOCTYPE: new Template(
    '<div></div><a class="linked" sys_id="#{sys_id}" href="#{href}.do?sys_id=#{sys_id}&sysparm_refkey=#{refKey}">#{display}</a>'
  ),
  RENDER_DYNAMIC_REFERENCE_DOCTYPE: new Template(
    '<div></div><span class="ref_dynamic" title="#{title}">#{display}</span>'
  ),
  RENDER_DEFAULT: new Template('#{display}'),
  RENDER_DEFAULT_DOCTYPE: new Template('<div></div>#{display}')
};;