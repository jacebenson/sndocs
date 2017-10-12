/*! RESOURCE: /scripts/js_includes_list_edit_doctype.js */
/*! RESOURCE: /scripts/GwtListEditWindow.js */
var GwtListEditWindow = Class.create(GlideWindow, {
  MESSAGES: [
    "1 row will be updated",
    " rows will be updated",
    "1 row will not be updated",
    " rows will not be updated",
    "Cancel (ESC)",
    "Save (Enter)"
  ],
  initialize: function($super, editor, gridEdit) {
    this.originalValue = editor.getValue();
    this.originalRenderValue = gridEdit.selected.textContent;
    this.editor = editor;
    this.gridEdit = gridEdit;
    $super(GwtListEditWindow.glideWindowId, true);
    this.refName = editor.name;
    this._getMessages();
    this.state = 'initialize';
    this.destroyed = false;
    this.statusPane = null;
    this._createControls();
  },
  _showUpdateMessage: function() {
    this.removeStatusPane();
    this.getCountCellsSelected();
    var numSelected = this.numCanEdit + this.numCannotEdit;
    if (numSelected <= 1)
      return;
    var msgStr;
    if (this.numCanEdit == 1)
      msgStr = this.msgRowUpdated;
    else
      msgStr = this.numCanEdit + this.msgRowsUpdated;
    if (this.numCannotEdit > 0) {
      msgStr = msgStr + "<br/>";
      if (this.numCannotEdit == 1)
        msgStr += this.msgRowNotUpdated;
      else
        msgStr += this.numCannotEdit + this.msgRowsNotUpdated;
    }
    this.appendStatusPane(msgStr);
  },
  appendStatusPane: function(msgHtml) {
    var div = new Element('div');
    div.style.marginTop = 2;
    div.style.fontWeight = "normal";
    div.update(msgHtml);
    $(GwtListEditWindow.glideWindowId + "_header").appendChild(div);
    this.statusPane = div;
  },
  removeStatusPane: function() {
    if (!this.statusPane)
      return;
    this.statusPane.remove();
    this.statusPane = null;
  },
  truncateDisplayValue: function(dispValue) {
    var displayChars = new Number(this.editor.tableElement.getDisplayChars());
    if (!isNaN(displayChars) && (displayChars != -1)) {
      if (dispValue.length > displayChars)
        dispValue = dispValue.substring(0, displayChars) + "...";
    }
    return dispValue;
  },
  getCountCellsSelected: function() {
    var selected = this.gridEdit.getSelectedSysIds();
    var writeable = this.editor.getCanWriteIds();
    this.numCanEdit = writeable.length;
    this.numCannotEdit = selected.length - writeable.length;
  },
  _createControls: function() {
    $(this.window).observe("resize", this._onResize.bind(this));
    $(this.window).observe("keydown", this._onKeyDown.bind(this));
    this.removeBody();
    this.clearSpacing();
    this.addMandatoryDecorator();
    this.createOkCancel();
    this.setPreferredWidth();
    var parent = getFormContentParent();
    this.insert(parent, null, true);
    var ret = this.createEditControls();
    if (!(ret === false))
      this.createEditControlsComplete();
  },
  createEditControls: function() {
    this.setTitle("unimplemented abstract function createEditControls");
  },
  createEditControlsComplete: function() {
    if (this.state != 'initialize')
      return;
    var cursorCell = this.gridEdit.getCursorCell();
    if (cursorCell !== this.getAnchorCell()) {
      this.dismiss();
      this.gridEdit.editCursor();
      return;
    }
    this.editor.hideLoading();
    this.moveToCell();
    this._showUpdateMessage();
    this.visible();
    setTimeout(this.focusEditor.bind(this), 10);
    this.state = 'complete';
  },
  createTextInput: function() {
    var answer = new Element('input', {
      'id': GwtListEditWindow.inputID
    });
    if (this.doctype)
      answer.addClassName('form-control list-edit-input');
    if (!this.doctype)
      answer.setStyle({
        width: this.preferredWidth
      });
    this.focusElement = answer;
    return answer;
  },
  getText: function(t) {
    if (!t)
      return;
    if (t.innerText)
      return t.innerText;
    else
      return t.textContent;
  },
  moveToCell: function() {
    if (!this.container)
      return;
    var cell = this.getAnchorCell();
    this.container.style.top = this._getOffsetTop(cell) + 'px';
    this.container.style.left = this._getOffsetLeft(cell) + 'px';
  },
  _getOffsetLeftOverflow: function(cell, offset) {
    var formList = $j(cell).closest('div.custom-form-group');
    var offsetLeft = formList.length != 0 ? offset - formList.scrollLeft() : offset;
    return offsetLeft;
  },
  _getOffsetLeft: function(cell) {
    var offsetLeft = getOffset(cell, 'offsetLeft');
    var viewportLeft = cell.viewportOffset().left;
    var editorWidth = this.getWidth();
    offsetLeft = isDoctype() ? this._getOffsetLeftOverflow(cell, offsetLeft) : offsetLeft;
    if (document.viewport.getDimensions().width >= (editorWidth + viewportLeft))
      return offsetLeft;
    var drawWidth = editorWidth + 2;
    if (drawWidth <= cell.clientWidth)
      return offsetLeft;
    return offsetLeft + cell.clientWidth - drawWidth;
  },
  _getOffsetTop: function(cell) {
    var offsetTop = getOffset(cell, 'offsetTop');
    var viewportTop = cell.viewportOffset().top;
    var editorHeight = this.getHeight();
    if (document.viewport.getDimensions().height >= (editorHeight + viewportTop))
      return offsetTop;
    var drawHeight = editorHeight + 2;
    if (drawHeight <= cell.clientHeight)
      return offsetTop;
    return offsetTop + cell.clientHeight - drawHeight;
  },
  addMandatoryDecorator: function() {
    if (!this.editor.isMandatory())
      return
    var mandatory = cel('span');
    if (!this.doctype) {
      if (this.originalRenderValue != "")
        mandatory.className = 'mandatory_populated';
      else
        mandatory.className = 'mandatory';
    }
    if (this.doctype)
      mandatory.className = 'required-marker';
    mandatory.style.fontSize = '18px';
    mandatory.innerHTML = '&nbsp;';
    this.addDecoration(mandatory, true);
  },
  createOkCancel: function() {
    var cancel = createImage('images/workflow_approval_rejected.gif', this.msgCancelButton, this, this.dismissEvent);
    if (this.doctype)
      cancel = createIcon('btn btn-icon icon-cross-circle color-red', this.msgCancelButton, this, this.dismissEvent);
    cancel.id = 'cell_edit_cancel';
    cancel.width = 18;
    cancel.height = 18;
    this.addDecoration(cancel);
    var save = createImage('images/workflow_approved.gifx', this.msgSaveButton, this, this.saveEvent);
    if (this.doctype)
      save = createIcon('btn btn-icon icon-check-circle color-green', this.msgSaveButton, this, this.saveEvent);
    save.id = 'cell_edit_ok';
    save.width = 18;
    save.height = 18;
    this.addDecoration(save);
  },
  saveAndClose: function(keyCallback, evt) {
    if (this.destroyed)
      return false;
    if (this.state != 'complete') {
      this.dismiss();
      return true;
    }
    var input = GwtListEditWindow.getCellEditValue();
    if (!input)
      input = $("LIST_EDIT_" + this.editor.name);
    var value = "";
    if (input) {
      value = input.value;
    }
    var isEmpty = false;
    if ((value.trim() == "") || (value == "NULL" && this.editor.tableElement.isReference())) {
      isEmpty = true;
    }
    if (isEmpty && this.editor.isMandatory()) {
      if (this.editor.tableElement.type !== 'glide_duration') {
        alert(getMessage('The following mandatory fields are not filled in') + ': ' + this.editor.tableElement.getLabel());
        this.focusEditor();
        return false;
      } else {
        var dur = {
          day: gel("dur_day"),
          hour: gel("dur_hour"),
          min: gel("dur_min"),
          sec: gel("dur_sec")
        };
        for (var prop in dur) {
          if (dur[prop] && dur[prop].value.trim() === "") {
            alert(getMessage('The following mandatory fields are not filled in') + ': ' + this.editor.tableElement.getLabel());
            return false;
          }
        }
      }
    }
    var editControls = gel("editControls");
    var result = true;
    if (input)
      result = this.runScript(0, true, this.editor.fieldName, value, null, keyCallback, evt);
    else if (editControls)
      result = this.runScriptsForMultipleFields(0, editControls.getElementsByTagName("select"));
    else
      this._commitSave();
    return result === false ? false : true;
  },
  runScriptsForMultipleFields: function(index, choiceLists) {
    if (index < choiceLists.length) {
      var element = choiceLists[index];
      var option = element.options[element.selectedIndex];
      var fName = element.name.substring(this.editor.table.length + 1);
      var thisObj = this;
      var saveCallback = function() {
        thisObj.runScriptsForMultipleFields(index + 1, choiceLists);
      }
      return this.runScript(0, true, fName, option.value, saveCallback);
    } else
      this._commitSave();
  },
  runScript: function(index, lastScriptResult, fieldName, newValue, saveCallback, keyCallback, evt) {
    var scripts = [];
    if (this.editor && this.editor.table && fieldName)
      scripts = g_event_handlers_onCellEdit[this.editor.table + "." + fieldName];
    if (!scripts || scripts.length == 0) {
      if (saveCallback)
        saveCallback();
      else
        this._commitSave();
      return;
    }
    if (!lastScriptResult) {
      this.dismiss();
      return;
    }
    if (index < scripts.length) {
      var thisObj = this;
      var callback = function(result, doKeyEvent) {
        thisObj.runScript(index + 1, result, fieldName, newValue, saveCallback);
        if (doKeyEvent && keyCallback != null && evt != null) {
          keyCallback(evt);
        }
      };
      var sysIDs = this.gridEdit.getSelectedSysIds();
      var atts = this.gridEdit.getSelectedAttributes(sysIDs, fieldName);
      var result = scripts[index](sysIDs, this.editor.table, atts, newValue, callback);
      return result;
    }
    if (saveCallback)
      saveCallback();
    else
      this._commitSave();
    return true;
  },
  _commitSave: function() {
    this.state = 'saving';
    this.save();
    this.dismiss();
    if (this.editor)
      this.editor.saveValues();
    return;
  },
  save: function() {
    var input = GwtListEditWindow.getCellEditValue();
    if (input)
      this.setValue(input.value);
  },
  setValue: function(value, displayValue) {
    if (!displayValue)
      displayValue = '';
    if (this.editor)
      this.editor.setValue(value, displayValue);
  },
  setRenderValue: function(value) {
    if (!value)
      value = '';
    if (this.editor)
      this.editor.setRenderValue(value);
  },
  focusEditor: function() {
    if (this.focusElement) {
      $(this.focusElement).activate();
    }
  },
  _onKeyDown: function(e) {
    switch (e.keyCode) {
      case Event.KEY_ESC:
        this.onKeyEsc(e);
        break;
      case Event.KEY_RETURN:
        this.onKeyReturn(e);
        break;
      case Event.KEY_TAB:
        this.onKeyTab(e);
        break;
    }
  },
  onKeyEsc: function(evt) {
    this.dismissEvent(evt);
  },
  onKeyReturn: function(evt) {
    evt.stop();
    if (this.saveAndClose())
      this._placeCursorReturn(evt);
  },
  onKeyTab: function(evt) {
    evt.stop();
    if (!this.saveAndClose(this._placeCursorTab.bind(this), evt))
      return;
    this._placeCursorTab(evt);
  },
  _placeCursorReturn: function(evt) {
    if (!evt.ctrlKey)
      this.gridEdit.refreshCursor();
    else
      this.gridEdit.editNextRow();
  },
  _placeCursorTab: function(evt) {
    if (evt.shiftKey)
      this.prevColumn();
    else
      this.nextColumn();
  },
  prevColumn: function() {
    this.gridEdit.moveLeft();
    this.gridEdit.editCursor();
  },
  nextColumn: function() {
    this.gridEdit.moveRight();
    this.gridEdit.editCursor();
  },
  dismiss: function() {
    if (this.destroyed)
      return false;
    this.destroyed = true;
    if (document.selection)
      document.selection.empty();
    try {
      this.destroy();
    } catch (e) {}
    this.state = 'destroyed';
    this.gridEdit.clearSelected();
    return false;
  },
  setPreferredWidth: function() {
    this.preferredWidth = this.getAnchorCell().clientWidth;
    if (this.preferredWidth > 400)
      this.preferredWidth = 400;
    if (this.preferredWidth < 150)
      this.preferredWidth = 150;
    this.setWidth(10);
  },
  _onResize: function(e) {
    if (this.destroyed)
      return;
    setTimeout(this.moveToCell.bind(this), 0);
  },
  _getMessages: function() {
    var gMessage = new GwtMessage();
    var map = gMessage.getMessages(this.MESSAGES);
    this.msgRowUpdated = map[this.MESSAGES[0]];
    this.msgRowsUpdated = map[this.MESSAGES[1]];
    this.msgRowNotUpdated = map[this.MESSAGES[2]];
    this.msgRowsNotUpdated = map[this.MESSAGES[3]];
    this.msgCancelButton = map[this.MESSAGES[4]];
    this.msgSaveButton = map[this.MESSAGES[5]];
  },
  getAnchorCell: function() {
    return this.gridEdit.getAnchorCell();
  },
  getAnchorSysId: function() {
    return this.gridEdit.getAnchorSysId();
  },
  dismissEvent: function(evt) {
    Event.stop(evt);
    this.dismiss();
    this.gridEdit.refreshCursor();
  },
  saveEvent: function(evt) {
    Event.stop(evt);
    if (this.saveAndClose())
      this.gridEdit.refreshCursor();
  },
  toString: function() {
    return "GwtListEditWindow";
  }
});
GwtListEditWindow.glideWindowId = 'cell_edit_window';
GwtListEditWindow.inputID = 'cell_edit_value';
GwtListEditWindow.getCellEditValue = function() {
  return $(GwtListEditWindow.inputID);
};
GwtListEditWindow.getCellEditWindow = function() {
  return $(GwtListEditWindow.glideWindowId);
};;
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
/*! RESOURCE: /scripts/GwtListEditTableController.js */
var GwtListEditTableController = Class.create({
  MSGS: [
    'New rows'
  ],
  initialize: function(tableElementDOM) {
    this.tableElementDOM = $(tableElementDOM);
    this._initMeta();
    this._updateTableData();
    this.msgs = getMessages(this.MSGS);
  },
  isForTable: function(tableDOM) {
    return tableDOM === this.tableElementDOM;
  },
  removeExistingRow: function(sysId) {
    this.changes.remove(sysId);
  },
  addExistingRow: function(sysId) {
    if (!this.changes.has(sysId)) {
      var record = this.changes.addRecord(sysId, "add_existing");
      this.changes.addToAggregates(record);
    }
  },
  addRow: function(sysId) {
    if (!this.changes.has(sysId)) {
      var record = this.changes.addRecord(sysId, "add");
      this.changes.addToAggregates(record);
    }
  },
  updateTable: function(tableElementDOM) {
    var tableName = tableElementDOM.getAttribute('glide_table');
    if (tableName !== this.tableName)
      jslog("New table name " + tableName + " does not match existing table name " + this.tableName);
    this.tableElementDOM = $(tableElementDOM);
    this._updateTableData();
  },
  unLoadTable: function(tableElementDOM) {
    if (tableElementDOM !== this.tableElementDOM)
      jslog("Unloaded table does not match current table " + this.tableName);
  },
  exportXml: function(elem) {
    elem.setAttribute("table", this.tableName);
    elem.setAttribute("field", this.relatedField);
    elem.setAttribute("query", this.query);
  },
  _initMeta: function() {
    this.tableName = this.getAttribute('glide_table');
    this.listID = this.getAttribute('glide_list_edit_id') + '';
    if (!GwtListEditTableController.controllers)
      GwtListEditTableController.controllers = {};
    GwtListEditTableController.controllers[this.listID] = this;
    this.listEditType = this.getAttribute('glide_list_edit_type') + '';
    this.relatedField = this.getAttribute('glide_list_field') + '';
    this.query = this.getAttribute('glide_list_query') + '';
    this.rowCount = new Number(this.getAttribute('total_rows'));
    this.insertRow = this._getBooleanAttribute('glide_list_edit_insert_row');
    this.canCreate = this._getBooleanAttribute('glide_list_can_create');
    this.canDelete = this._getBooleanAttribute('glide_list_can_delete');
    this.hasHierarchy = this._getBooleanAttribute('glide_list_has_hierarchy');
    this.hasHeader = this._getBooleanAttribute('glide_list_has_header');
    this.omitLinks = this._getBooleanAttribute('glide_list_omit_links');
    this.hasActions = this.getAttribute('glide_list_has_actions') == 'false' ? false : true;
    this.groupFields = this._getGroupFields();
    if (this.rowCount == 0 && "save_with_form" == this.listEditType && !this.hasHeader)
      this.insertRow = false;
    var prefixLength = this.tableName.length + 1;
    this.fields = [];
    this.firstField = null;
    var cellIndexOffset = this._getHeaderOffset();
    var cells = [];
    if (this.tableElementDOM && this.tableElementDOM.rows && this.tableElementDOM.rows.length > 0 && this.tableElementDOM.rows[0].cells) {
      cells = this.tableElementDOM.rows[0].cells;
    }
    this.headers = [];
    this.headersByName = {};
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (hasClassName(cell, "column_head") || hasClassName(cell, "list_header_cell")) {
        var fieldName = cell.getAttribute('glide_field');
        var type = cell.getAttribute('glide_type');
        if (type == 'composite_field') {
          var compositeField = cell.getAttribute('name');
          var compositeFirstField = cell.getAttribute('composite_edit_field');
          var fieldPos = i + cellIndexOffset;
          fieldName = this.getFqFieldName(compositeFirstField);
          cell.setAttribute('glide_field', fieldName);
          if (window['GlideCompositeField'])
            new GlideCompositeField(this, fieldPos, compositeField, compositeFirstField);
        }
        if (fieldName) {
          this.fields.push(fieldName.substring(prefixLength));
          this.headers[i + cellIndexOffset] = fieldName;
          this.headersByName[fieldName] = i + cellIndexOffset;
          if (!this.firstField)
            this.firstField = fieldName;
        }
      }
    }
  },
  _getHeaderOffset: function() {
    return 0;
  },
  _updateTableData: function() {
    this._updateSysIdToRowMapping();
    this._configureFocus();
    this.observe('glide:list_v2.edit.changes_saved', this._handleChangesSaved.bind(this));
    this.groupSeparator = null;
  },
  _updateSysIdToRowMapping: function() {
    var rows = this.tableElementDOM.rows;
    this.listRows = [];
    for (var i = 0, n = rows.length; i < n; i++) {
      var row = rows[i];
      if (!hasClassName(row, 'list_row') && !hasClassName(row, 'list_row_detail'))
        continue;
      this.listRows.push(row);
    }
    this.lastRecordRow = 0;
    this.sysIds = [];
    this.sysIdsToRows = {};
    var rowCount = this.getRowCount();
    for (var i = 0; i < rowCount; i++) {
      var sysId = this.getSysID(i);
      if (sysId) {
        if (this.sysIdsToRows.hasOwnProperty(sysId))
          continue;
        this.sysIdsToRows[sysId] = i;
        this.sysIds.push(sysId);
        this.lastRecordRow = i;
      }
    }
  },
  buildCellSelector: function() {
    return new GwtListEditGridSelector(this.tableElementDOM);
  },
  getAttribute: function(name) {
    return this.tableElementDOM.getAttribute(name);
  },
  _configureFocus: function() {
    this.tableElementDOM.writeAttribute("tabIndex", "0");
    this.tableElementDOM.setStyle({
      outline: "none"
    });
    this.tableElementDOM.hideFocus = true;
  },
  _getBooleanAttribute: function(attrName) {
    return "true" === this.getAttribute(attrName);
  },
  getFields: function() {
    return this.fields;
  },
  getNameFromColumn: function(colNdx) {
    return this.headers[colNdx];
  },
  getCell: function(sysId, fieldName) {
    return this.getFqField(sysId, this.getFqFieldName(fieldName));
  },
  getFqFieldName: function(fieldName) {
    return this.tableName + "." + fieldName;
  },
  getFqField: function(sysId, fqFieldName) {
    var col = this.headersByName[fqFieldName];
    if (!col) {
      var row = this.tableElementDOM.select('tr[data-detail-row=' + fqFieldName + '][sys_id=' + sysId + ']');
      if (row.length > 0)
        return $(row[0].cells[0]);
      return null;
    }
    var row = this.getRow(sysId);
    if (!row)
      return null;
    return $(row.cells[col]);
  },
  getRowCount: function() {
    return this.tableElementDOM.rows.length;
  },
  getRow: function(sysId) {
    var rowNdx = this.sysIdsToRows[sysId];
    if (!rowNdx)
      return null;
    return this.getRowByNdx(rowNdx);
  },
  getRowByNdx: function(rowNdx) {
    return this.tableElementDOM.rows[rowNdx];
  },
  getCellByNdx: function(rowNdx, cellNdx) {
    var row = this.getRowByNdx(rowNdx);
    if (!row)
      return null;
    return $(row.cells[cellNdx]);
  },
  getSysID: function(rowNdx) {
    var row = this.getRowByNdx(rowNdx);
    if (!row)
      return null;
    return row.getAttribute('sys_id');
  },
  getRelatedSysID: function() {
    if (!this.relatedField || this.relatedField == "null")
      return null;
    var indexOfSysId = this.query.indexOf(this.relatedField + "=") + this.relatedField.length + 1;
    return this.query.substring(indexOfSysId, indexOfSysId + 32);
  },
  _insertFinalBodyRow: function() {
    var body = this.tableElementDOM.tBodies[0];
    var result = body.insertRow(this._getInsertRow(body));
    return $(result);
  },
  _getInsertRow: function(body) {
    var rows = body.rows;
    for (var i = rows.length; i > 0; i--) {
      var row = $(rows[i - 1]);
      if (row.hasClassName('aggregate'))
        continue;
      var aggMsg = row.down('td.aggregate_message');
      if (aggMsg)
        continue;
      if (row.hasClassName('calculationLine'))
        return i - 1;
      return i;
    }
    return 0;
  },
  _getRowCss: function(tr) {
    if (this.listEditType != "save_with_form")
      return "list_unsaved";
    if ((tr.rowIndex % 2) == 0)
      return "list_even";
    return "list_odd";
  },
  deleteRow: function(sysId) {
    var rowNdx = this.sysIdsToRows[sysId];
    this.tableElementDOM.deleteRow(rowNdx);
    this._updateSysIdToRowMapping();
  },
  isHierarchical: function() {
    return this.tableElementDOM.hasClassName("hierarchical");
  },
  getListRows: function() {
    return this.listRows;
  },
  getRowByCell: function(cell) {
    return $(cell).up('tr.list_row, tr.list_row_detail');
  },
  getSysIdByCell: function(cell) {
    return this.getRowByCell(cell).getAttribute('sys_id');
  },
  buildRow: function(sysId) {
    var row = this.getRowByNdx(this.lastRecordRow);
    var cellCnt = 0;
    for (var i = 0; i < row.cells.length; i++)
      cellCnt += row.cells[i].colSpan;
    this._ensureGroupSeparator(sysId);
    var tr = this._insertFinalBodyRow();
    tr.id = sysId;
    tr.setAttribute('sys_id', sysId);
    tr.setAttribute('record_class', this.tableName);
    addClassName(tr, this._getRowCss(tr));
    addClassName(tr, 'list_row');
    var decor = this._buildDecorationCell(tr);
    for (var i = 1; i < cellCnt; i++) {
      var td = tr.insertCell(i);
      td.innerHTML = "&nbsp;";
      var fname = this.getNameFromColumn(i);
      if (fname) {
        addClassName(td, "vt");
      }
    }
    if (this.lastRecordRow == 0) {
      var tdExtra = $(tr.insertCell(i));
      tdExtra.writeAttribute('class', 'vt');
      tdExtra.writeAttribute('style', 'padding: 0;');
    }
    GwtListEditTableController.addClassToRow(tr, "list_add");
    this._updateSysIdToRowMapping();
    if (this.hasShowableHierarchy())
      this._buildHierarchyRow(sysId);
    return row;
  },
  _buildDecorationCell: function(tr) {
    var td = $(tr.insertCell(0));
    td.writeAttribute('class', 'list_decoration_cell');
    if (!this._isDoctype()) {
      var style = 'padding-top: 3px; padding-bottom: 3px;';
      if (this._isGrouped() && this.hasHierarchy)
        style = 'padding-left: 20px;' + style;
      else
        style = 'padding-left: 2px;' + style;
      td.writeAttribute('style', style);
    } else {
      td.className += ' col-control col-small col-center';
    }
    if (!this._isDoctype())
      return td;
  },
  _isDoctype: function() {
    return document.documentElement.getAttribute('data-doctype') == 'true';
  },
  _buildHierarchyRow: function(sysId) {
    var tr = this._insertFinalBodyRow();
    tr.setAttribute('hierarchical', 'not_loaded');
    tr.setAttribute('style', 'display: none');
    tr.setAttribute('collapsed', 'true');
    tr.setAttribute('id', 'hier_row_' + this.listID + '_' + sysId);
    var td = tr.insertCell(0);
    td.setAttribute('colspan', '99');
    addClassName(td, 'list_hierarchical_hdr');
    return tr;
  },
  needsInsertRow: function() {
    if (this.tableElementDOM.select(".list_unsaved") != 0)
      return false;
    if (this.tableElementDOM.select(".list_edit_new_row") != 0)
      return false;
    if (typeof isTablet != 'undefined' && isTablet)
      return false;
    return this.insertRow;
  },
  fire: function(evt, info) {
    if (!info.listId)
      jslog('Event ' + evt + ' fired with no listId');
    if (info.listId !== this.listID)
      jslog('Event ' + evt + ' fired for unknown list ' + info.listId);
    this.tableElementDOM.fire(evt, info);
  },
  fireCellsChanged: function(edits) {
    var info = {
      listId: this.listID,
      edits: edits
    };
    this.fire('glide:list_v2.edit.cells_changed', info);
  },
  fireFocusMoved: function(toRow, toCol) {
    var info = {
      listId: this.listID,
      toRow: toRow,
      toCol: toCol
    };
    this.fire('glide:list_v2.edit.focus_moved', info);
  },
  observe: function(evt, callback) {
    this.tableElementDOM.observe(evt, callback);
  },
  observeOnBody: function(evt, callback) {
    this.tableElementDOM.down('tbody').observe(evt, callback);
  },
  stopObserving: function(evt, callback) {
    this.tableElementDOM.stopObserving(evt, callback);
  },
  stopObservingOnBody: function(evt, callback) {
    this.tableElementDOM.down('tbody').stopObserving(evt, callback);
  },
  hasDeferredChanges: function() {
    if ('save_with_form' === this.listEditType)
      return true;
    if ('save_by_row' === this.listEditType)
      return true;
    return false;
  },
  isFormUI: function() {
    if ('save_with_form' === this.listEditType)
      return true;
    return false;
  },
  canEdit: function() {
    return ('disabled' !== this.listEditType);
  },
  buildSavePolicy: function(type) {
    if ("save_with_form" === this.listEditType)
      return new GwtListEditSavePolicy.SaveWithForm(this.listID);
    if ("save_by_row" === this.listEditType)
      return new GwtListEditSavePolicy.SaveByRow(this);
    return new GwtListEditSavePolicy.CellEdit(this.listID);
  },
  focus: function() {
    if (this.tableElementDOM.setActive)
      this.tableElementDOM.setActive();
    else
      this.tableElementDOM.focus();
  },
  focusBody: function() {
    var el = this.tableElementDOM.down('tbody');
    if (el.setActive)
      el.setActive();
    else
      el.focus();
  },
  getDecorationCell: function(sysId) {
    var row = this.getRow(sysId);
    if (!row)
      return null;
    return row.cells[0];
  },
  _handleChangesSaved: function(evt) {
    if (evt.memo.listId !== this.listID)
      return;
    if (!this.insertRow)
      return;
    if ("save_with_form" === this.listEditType)
      return;
    if (this.needsInsertRow && (this.listRows.length === 1))
      this._showListActions();
    else if (this.listRows.length === 2) {
      this._showListActions();
    }
  },
  _showListActions: function() {
    var container = $(this.listID + '_expanded');
    if (!container)
      return;
    var navTables = container.select('table.list_nav_bottom');
    if (1 !== navTables.length)
      return;
    var spans = navTables[0].select('span.list_hide_empty');
    for (var i = 0; i < spans.length; i++) {
      spans[i].show();
    }
  },
  getRecordPos: function(row) {
    return this.getListRows().indexOf(row) + 1;
  },
  getRecordIndex: function(recPos) {
    var rows = this.getListRows();
    var extra = recPos - rows.length
    if (rows.length > 0 && extra > 0) {
      var lastNdx = rows[rows.length - 1].rowIndex;
      if (this.hasHierarchy)
        return lastNdx + extra + extra;
      return lastNdx + extra;
    }
    var row = this.getRowByPos(recPos);
    if (row)
      return row.rowIndex;
    return 0;
  },
  getRowByPos: function(recPos) {
    if (recPos < 1)
      return null;
    var rows = this.getListRows();
    if (recPos > rows.length)
      return null;
    return rows[recPos - 1];
  },
  getCellByPos: function(recPos, cellNdx) {
    var row = this.getRowByPos(recPos);
    if (!row)
      return null;
    if (hasClassName(row, 'list_row_detail'))
      return $(row.cells[0]);
    return $(row.cells[cellNdx]);
  },
  getSysIDByPos: function(recPos) {
    var row = this.getRowByPos(recPos);
    if (!row)
      return null;
    return row.getAttribute('sys_id');
  },
  getFieldElement: function(fieldName) {
    return TableElement.get(this.getFqFieldName(fieldName));
  },
  isFirstField: function(fieldName) {
    var fqFieldName = this.getFqFieldName(fieldName);
    return this.firstField === fqFieldName;
  },
  _getGroupFields: function() {
    var GROUP_BY = "GROUPBY";
    var groupBy = [];
    var query = this.getAttribute('glide_list_query') + '';
    var terms = query.split('^');
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      if (0 === term.indexOf(GROUP_BY))
        groupBy.push(term.substring(GROUP_BY.length));
    }
    if (0 === groupBy.length)
      return null;
    return groupBy.join(',');
  },
  _isGrouped: function() {
    return (null !== this.groupFields);
  },
  _ensureGroupSeparator: function(sysId) {
    if (!this._isGrouped())
      return;
    if (null !== this.groupSeparator)
      return;
    this.groupSeparator = this._buildGroupSeparator(sysId);
  },
  _buildGroupSeparator: function(sysId) {
    var tr = this._insertFinalBodyRow();
    addClassName(tr, 'list_group');
    tr.setAttribute('group_row', 'true');
    tr.setAttribute('collapsed', 'never');
    tr.setAttribute('id', 'row_' + this.listID + '_' + sysId);
    tr.setAttribute('groupfield', this.groupFields);
    var td = $(tr.insertCell(0));
    addClassName(td, 'list_group');
    td.setAttribute('colSpan', '99');
    td.setAttribute('group_row_td', 'true');
    td.setAttribute('style', 'page-break-before: auto;');
    var o = {
      newRows: this.msgs['New rows']
    };
    td.insert(GwtListEditTableController.Templates.NEW_ROWS.evaluate(o));
    return tr;
  },
  hasShowableHierarchy: function() {
    if (this._isGrouped())
      return false;
    return this.hasHierarchy;
  },
  getNextRowByPos: function(fromPos) {
    var limit = this.getListRows().length;
    var ndx = fromPos + 1;
    while (ndx <= limit) {
      var row = this.getRowByPos(ndx);
      if (row && row.style.display != 'none')
        return ndx;
      ndx++;
    }
    return null;
  },
  getPrevRowByPos: function(fromPos) {
    var ndx = fromPos - 1;
    while (ndx > 0) {
      var row = this.getRowByPos(ndx);
      if (row && row.style.display != 'none')
        return ndx;
      ndx--;
    }
    return null;
  },
  toString: function() {
    return 'GwtListEditTableController';
  }
});
GwtListEditTableController.showImage = function(element, imageSrc) {
  var left = getOffset(element, "offsetLeft");
  var top = getOffset(element, "offsetTop");
  var w = element.offsetWidth;
  var h = element.offsetHeight;
  left += w - 11;
  top += h - 11;
  var img = cel('img');
  img.src = imageSrc;
  img.alt = '';
  img.style.position = 'absolute';
  img.style.left = left + 'px';
  img.style.top = top + 'px';
  addChild(img);
  return img;
};
GwtListEditTableController.addClassToRow = function(tr, className) {
  addClassName(tr, className);
  var cells = tr.cells;
  for (var i = 1; i < cells.length; i++)
    addClassName(cells[i], className);
};
GwtListEditTableController.removeClassFromRow = function(tr, className) {
  removeClassName(tr, className);
  var cells = tr.cells;
  for (var i = 0; i < cells.length; i++)
    removeClassName(cells[i], className);
};
GwtListEditTableController.Templates = {
  NEW_ROWS: new Template(
    '<span class="list_group">#{newRows}</span>'
  )
};;
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
    var canWrite = true;
    for (var j = 0; j < fields.length; j++) {
      var field = record.getField(fields[j]);
      if (!field)
        continue;
      if (!field.canWrite) {
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
/*! RESOURCE: /scripts/GwtListEditText.js */
var GwtListEditText = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    var input = this.createTextInput();
    input.value = this.editor.getValue();
    var tableElement = this.editor.tableElement;
    if (tableElement.maxLength > 0)
      input.setAttribute("maxLength", tableElement.maxLength);
    var answer = this.editor.getValue();
    if (tableElement.isNumber()) {
      input.value = this.editor.getDisplayValue();
      input.className = this.doctype ? 'decimal form-control list-edit-input' : 'decimal';
      answer = this.editor.getDisplayValue();
    }
    this.setTitle(input);
    answer = answer.replace(/\n/g, " ");
    answer = answer.replace(/\t/g, "");
    this.focusElement.value = answer;
  },
  save: function() {
    var input = GwtListEditWindow.getCellEditValue();
    if (input) {
      if (this.editor.tableElement.isNumber() || this.editor.tableElement.getType() == "translated_text")
        this.setValue(null, input.value);
      else
        this.setValue(input.value);
      this.setRenderValue(this.truncateDisplayValue(input.value));
    }
  },
  toString: function() {
    return "GwtListEditText";
  }
});;
/*! RESOURCE: /scripts/GwtListEditSelect.js */
var GwtListEditSelect = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    var select = '';
    if (this.doctype)
      select = "<select id = '" + GwtListEditWindow.inputID + "' class='form-control list-edit-input' />";
    else
      select = "<select id = '" + GwtListEditWindow.inputID + "' />";
    this.setTitle(select);
    this.focusElement = GwtListEditWindow.getCellEditValue();
    this.addOptions();
    if (!this.staticOptions)
      return false;
  },
  addOptions: function() {
    var rowSysId = this.getAnchorSysId();
    var allIDs = this.gridEdit.getSelectedSysIds();
    var ajax = new GlideAjax('PickList');
    ajax.addParam('sys_uniqueValue', rowSysId);
    ajax.addParam('sysparm_id_list', allIDs.join());
    ajax.addParam('sysparm_target', this.editor.tableElement.getTable().getName());
    ajax.addParam('sysparm_chars', '*');
    ajax.addParam('sysparm_name', this.refName);
    ajax.addParam('sysparm_nomax', 'true');
    ajax.getXML(this._createOptions.bind(this));
  },
  _createOptions: function(response) {
    if (this.state != 'initialize')
      return;
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    var value = this.editor.getValue();
    this.focusElement.options.length = 0;
    if (this.editor.tableElement.choice != "3") {
      this.nullOverride = xml.documentElement.getAttribute("default_option");
      if (this.nullOverride)
        addOption(this.focusElement, "", this.nullOverride, this._isSelected(value, "", this.nullOverride));
      else if (!this.editor.selectedOnly)
        addOption(this.focusElement, "", getMessage('-- None --'), true);
    }
    for (var i = 0; i < items.length; i++) {
      var v = items[i].getAttribute("value");
      var l = items[i].getAttribute("label");
      if (!this._checkDuplicateOptions(v, l))
        addOption(this.focusElement, v, l, this._isSelected(value, v, l));
    }
    this.createEditControlsComplete();
  },
  _checkDuplicateOptions: function(value, label) {
    if (!this.focusElement.length)
      return false;
    var opts = this.focusElement.options;
    for (var i = 0; i < opts.length; i++)
      if (opts[i].value == value && opts[i].text === label)
        return true;
    return false;
  },
  _isSelected: function(value, v, l) {
    if (l == value || v == value)
      return true;
    else
      return false;
  },
  save: function() {
    var select = this.focusElement;
    var i = select.selectedIndex;
    var option = select.options[i];
    this.setValue(option.value);
    var text = option.text;
    if (!option.value)
      text = '';
    this.setRenderValue(text);
  },
  toString: function() {
    return "GwtListEditSelect";
  }
});;
/*! RESOURCE: /scripts/doctype/GwtListEditCalendar.js */
var GwtListEditCalendar = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    ScriptLoader.getScripts('scripts/classes/GwtDateTimePicker.js', this._start.bind(this));
    return false;
  },
  _start: function() {
    var html = this._createCalendarHTML();
    this.setTitle(html);
    if (g_full_calendar_edit)
      $('cell_edit_window').addClassName('hide_input_edit');
    this.createEditControlsComplete();
  },
  save: function() {
    var input = GwtListEditWindow.getCellEditValue();
    if (input) {
      this.setValue(null, input.value);
      this.setRenderValue(input.value);
    }
  },
  dismiss: function($super) {
    this._dismissCalendar();
    if (GwtListEditWindow.inputID) {
      var input = GwtListEditWindow.getCellEditValue();
      if (input)
        input.onfocus = null;
    }
    $super();
  },
  _dismissCalendar: function() {
    if (gel("GwtDateTimePicker") && this.cal)
      this.cal.dismiss();
    this.cal = null;
  },
  _createCalendarHTML: function() {
    var answer = cel('div');
    var input = this.createTextInput();
    input.value = this.editor.getDisplayValue();
    answer.style.borderSpacing = '0';
    answer.className = 'input-group';
    answer.appendChild(input);
    input.onfocus = this.onFocus.bind(this);
    var img = createIcon('icon-calendar', getMessage("Choose date..."), this, this._showCalendar.bind(this));
    img.id = this.type();
    img = img.wrap('span', {
      'class': 'input-group-addon'
    });
    answer.appendChild(img);
    return answer;
  },
  onFocus: function() {
    var input = GwtListEditWindow.getCellEditValue();
    if (input)
      input.onfocus = null;
    this._showCalendar();
    if (g_full_calendar_edit)
      this._hideInput();
  },
  _hideInput: function() {
    var cell = this.getAnchorCell();
    var leftPosition = this._getOffsetLeft(cell);
    $j('#cell_edit_window').css({
      'display': 'none'
    });
    $j('#GwtDateTimePicker').css({
      'top': this._getOffsetTop(cell),
      'left': leftPosition,
      'z-index': 1
    });
    cell = this;
    $j('#GwtDateTimePicker_ok').click(function() {
      $j('#cell_edit_ok').trigger('click');
    });
    $j('#GwtDateTimePicker_cancel').click(function() {
      cell.dismiss();
    });
  },
  _showCalendar: function() {
    if (gel("GwtDateTimePicker"))
      return;
    var format;
    var useTime;
    if (this.editor.tableElement.isDateTime()) {
      format = g_user_date_time_format;
      useTime = true;
    } else
      format = g_user_date_format;
    this.cal = new GwtDateTimePicker(GwtListEditWindow.inputID, format, useTime);
    this.addMultipleEditMsg();
    return false;
  },
  addMultipleEditMsg: function() {
    if (!window.g_full_calendar_edit)
      return;
    var msgStr;
    if (this.numCanEdit == 1)
      return;
    else
      msgStr = this.numCanEdit + this.msgRowsUpdated;
    if (this.numCannotEdit > 0) {
      msgStr = msgStr + "<br/>";
      if (this.numCannotEdit == 1)
        msgStr += this.msgRowNotUpdated;
      else
        msgStr += this.numCannotEdit + this.msgRowsNotUpdated;
    }
    var div = new Element('div');
    div.style.marginTop = 2;
    div.style.fontWeight = "normal";
    div.update(msgStr);
    $('window.GwtDateTimePicker').appendChild(div);
  },
  toString: function() {
    return "GwtListEditCalendar";
  }
});;
/*! RESOURCE: /scripts/GwtListEditReference.js */
var GwtListEditReference = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    this.id = this.refName;
    this._createInputControls(this.getTitle());
  },
  _createInputControls: function(parent) {
    var refSysId = this.editor.getValue();
    var rowSysId = this.getAnchorSysId();
    this.inputControls = new AJAXReferenceControls(this.editor.tableElement, this.id, parent, refSysId, rowSysId, this._getRefQualTag());
    this.inputControls.setDisplayValue(this._getDisplayValue());
    this.focusElement = this.inputControls.getInput();
    this.focusElement.style.width = this.preferredWidth;
    this.inputControls.setRecord(this.editor);
  },
  saveAndClose: function($super) {
    this.inputControls.resolveReference();
    if (this.inputControls.isResolving())
      this.inputControls.setResolveCallback(this.saveAndClose.bind(this));
    else
      return $super();
  },
  save: function() {
    var sys_id = this.inputControls.getValue();
    if (!sys_id)
      sys_id = "NULL";
    if (sys_id == "1111")
      sys_id = "NULL";
    var displayValue = this.inputControls.getDisplayValue();
    var refValid = this.inputControls.isReferenceValid();
    if (!refValid) {
      if (this.inputControls.tableElement.isDynamicCreation())
        sys_id = displayValue;
      else
        return;
    }
    if (sys_id == "NULL") {
      displayValue = '';
    }
    this.setReferenceValue(sys_id, refValid);
    this.setRenderValue(displayValue);
  },
  setReferenceValue: function(value, valid) {
    this.setValue(value);
    if (this.editor)
      this.editor.setReferenceValid(valid);
  },
  dismiss: function($super) {
    if (this.destroyed || !this.inputControls)
      return false;
    this.inputControls.clearDropDown();
    $super();
  },
  onKeyReturn: function(evt) {
    evt.stop();
    setTimeout(this.saveAndClose.bind(this), 50);
    this._placeCursorReturn(evt);
  },
  _getRefQualTag: function() {
    var cell = this.getAnchorCell();
    var table = findParentByTag(cell, "TABLE");
    if (table) {
      var tag = getAttributeValue(table, 'glide_list_edit_ref_qual_tag');
      if (tag)
        return tag;
    }
    return "";
  },
  _getDisplayValue: function() {
    if (this.editor.getValue() == "NULL")
      return "";
    return this.editor.getRenderValue() || this.editor.getDisplayValue();
  },
  toString: function() {
    return "GwtListEditReference";
  }
});;
/*! RESOURCE: /scripts/GwtListEditBoolean.js */
var GwtListEditBoolean = Class.create(GwtListEditSelect, {
  addOptions: function() {
    this.staticOptions = true;
    var select = this.focusElement;
    var value = this.editor.getValue();
    addOption(select, true, getMessage("true"), value == "true");
    addOption(select, false, getMessage("false"), value != "true");
  },
  toString: function() {
    return "GwtListEditBoolean";
  }
});;
/*! RESOURCE: /scripts/GwtListEditDuration.js */
var GwtListEditDuration = Class.create(GwtListEditWindow, {
  MS_IN_DAY: 86400000,
  MAX_UNIT_DAYS: 4,
  MAX_UNIT_HOURS: 3,
  MAX_UNIT_MINUTES: 2,
  MAX_UNIT_SECONDS: 1,
  createEditControls: function() {
    this.setDateParts(this.editor.getValue());
    this.gMessage = new GwtMessage();
    this.gMessage.getMessages(['Hours', 'Days', 'day', 'hour', 'minute', 'second', 'minutes', 'seconds']);
    this.renderControl();
  },
  onKeyTab: function(evt) {
    evt.stop();
    if (evt.shiftKey) {
      if (!this._previousChoice(evt)) {
        this.saveAndClose();
        this.prevColumn();
      }
    } else if (!this._nextChoice(evt)) {
      this.saveAndClose();
      this.nextColumn();
    }
  },
  _previousChoice: function(e) {
    var previous = this.focusElement.up().previousSibling;
    if (previous)
      previous = previous.previousSibling;
    if (previous == null)
      return false;
    this.focusElement = $(previous).select("input")[0];
    this.focusEditor();
    return true;
  },
  _nextChoice: function(e) {
    var next = this.focusElement.up().nextSibling;
    if (next)
      next = next.nextSibling;
    if (next == null)
      return false;
    this.focusElement = $(next).select("input")[0];
    this.focusEditor();
    return true;
  },
  setDateParts: function(dateStr) {
    if (dateStr.length <= 0) {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
    } else {
      var dateTime = dateStr.split(" ");
      var dateParts = dateTime[0].split("-");
      var timeParts = dateTime[1].split(":");
      this.days = parseInt(Date.parse(dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0] + " 00:00:00 UTC") / this.MS_IN_DAY);
      this.hours = timeParts[0];
      this.minutes = timeParts[1];
      this.seconds = timeParts[2];
      var max_level = this._getUnitLevel();
      if (max_level <= this.MAX_UNIT_HOURS) {
        this.hours = parseInt(this.hours, 10) + (this.days * 24);
        this.days = 0;
      }
      if (max_level <= this.MAX_UNIT_MINUTES) {
        this.minutes = parseInt(this.minutes, 10) + (this.hours * 60);
        this.hours = 0;
      }
      if (max_level <= this.MAX_UNIT_SECONDS) {
        this.seconds = parseInt(this.seconds, 10) + (this.minutes * 60);
        this.minutes = 0;
      }
    }
  },
  renderControl: function() {
    var table = cel("table");
    var cls = '';
    if (this.doctype)
      cls = 'form-control list-edit-input';
    table.cellPadding = 0;
    table.style.backgroundColor = "EEEEEE";
    var tbody = cel("tbody", table);
    var tr = cel("tr", tbody);
    var max_level = this._getUnitLevel();
    var td = cel("td", tr);
    var days;
    if (max_level == this.MAX_UNIT_DAYS) {
      td.innerHTML = this.gMessage.getMessage("Days") + "&nbsp;";
      td = cel("td", tr);
      days = cel("input", td);
      days.id = "dur_day";
      days.className = cls;
      days.size = "2";
      days.maxLength = "5";
      days.style.marginRight = "5px";
      days.value = this.days
      td = cel("td", tr);
    }
    var hours;
    if (max_level >= this.MAX_UNIT_HOURS) {
      td.innerHTML = this.gMessage.getMessage("Hours") + "&nbsp;";
      td = cel("td", tr);
      hours = cel("input", td);
      hours.id = "dur_hour";
      hours.className = cls;
      hours.size = "2";
      hours.maxLength = "2";
      hours.value = this.hours;
      td = cel("td", tr);
      td.innerHTML = ":";
      td = cel("td", tr);
    } else {
      td.innerHTML = this.gMessage.getMessage("Minutes") + "&nbsp;";
    }
    var mins;
    if (max_level >= this.MAX_UNIT_MINUTES) {
      mins = cel("input", td);
      mins.id = "dur_min";
      mins.className = cls;
      mins.size = "2";
      mins.maxLength = "2";
      mins.value = this.minutes;
      td = cel("td", tr);
      td.innerHTML = ":";
      td = cel("td", tr);
    } else {
      td.innerHTML = this.gMessage.getMessage("Seconds") + "&nbsp;";
    }
    var secs = cel("input", td);
    secs.id = "dur_sec";
    secs.className = cls;
    secs.size = "2";
    secs.maxLength = "2";
    secs.value = this.seconds;
    this.setTitle(table);
    this.focusElement = gel("dur_day");
  },
  save: function() {
    var max_level = this._getUnitLevel();
    var day = (max_level == this.MAX_UNIT_DAYS) ? gel("dur_day").value : 0;
    var hour = (max_level >= this.MAX_UNIT_HOURS) ? gel("dur_hour").value : 0;
    var min = (max_level >= this.MAX_UNIT_MINUTES) ? gel("dur_min").value : 0;
    var sec = gel("dur_sec").value;
    if (!day || day == null || !isNumber(day))
      day = 0;
    if (!hour || hour == null || !isNumber(hour))
      hour = 0;
    if (!min || min == null || !isNumber(min))
      min = 0;
    if (!sec || sec == null || !isNumber(sec))
      sec = 0;
    day = parseInt(day, 10);
    hour = parseInt(hour, 10);
    min = parseInt(min, 10);
    sec = parseInt(sec, 10);
    if (max_level == this.MAX_UNIT_SECONDS) {
      min = Math.floor(sec / 60);
      sec = sec % 60;
    }
    if (max_level <= this.MAX_UNIT_MINUTES) {
      hour = Math.floor(min / 60);
      min = min % 60;
    }
    if (max_level <= this.MAX_UNIT_HOURS) {
      day = Math.floor(hour / 24);
      hour = hour % 24;
    }
    var dt = new Date(0);
    dt.setUTCDate(day + 1);
    var dateStr = dt.getUTCFullYear() + "-" + padLeft(dt.getUTCMonth() + 1, 2, '0') + "-" + padLeft(dt.getUTCDate(), 2, '0') + " " +
      padLeft(hour, 2, '0') + ":" + padLeft(min, 2, '0') + ":" + padLeft(sec, 2, '0');
    this.setValue(dateStr);
    this._setRenderValue(day, hour, min, sec);
  },
  _setRenderValue: function(day, hour, min, sec) {
    var dspVal = "";
    if (day > 0)
      dspVal += day + " " + this._getLabel("day", day) + " ";
    if (hour > 0)
      dspVal += hour + " " + this._getLabel("hour", hour) + " ";
    if (min > 0)
      dspVal += min + " " + this._getLabel("minute", min) + " ";
    if (dspVal == "")
      dspVal += sec + " " + this._getLabel("second", sec) + " ";
    this.setRenderValue(dspVal);
  },
  _getLabel: function(label, val) {
    if (val != 1)
      label += "s";
    return this.gMessage.getMessage(label).toLowerCase();
  },
  _getUnitLevel: function() {
    var max_unit = this.editor.tableElement.getNamedAttribute('max_unit');
    if (max_unit == null)
      return this.MAX_UNIT_DAYS;
    switch (max_unit) {
      case 'hours':
        return this.MAX_UNIT_HOURS;
      case 'minutes':
        return this.MAX_UNIT_MINUTES;
      case 'seconds':
        return this.MAX_UNIT_SECONDS;
    }
    return this.MAX_UNIT_DAYS;
  },
  toString: function() {
    return "GwtListEditDuration";
  }
});;
/*! RESOURCE: /scripts/GwtListEditTablename.js */
var GwtListEditTablename = Class.create(GwtListEditSelect, {
  addOptions: function() {
    var ga = new GlideAjax('AjaxClientHelper');
    this.editor.selectedOnly = this.editor.tableElement.getNamedAttribute("selected_only") == "true";
    ga.addParam('sysparm_name', this.getName());
    ga.addParam('sysparm_noViews', this.getNoViews());
    ga.addParam('sysparm_noSystemTables', this.editor.tableElement.getNamedAttribute("no_system_tables") == "true");
    ga.addParam('sysparm_currentTableName', this.editor.tableElement.tableName);
    if (this.editor.selectedOnly) {
      ga.addParam('sysparm_selectedOnly', true);
      ga.addParam('sysparm_selectedField', this.editor.fields[0]);
      ga.addParam('sysparm_selected', this._getSelected());
      ga.addParam('sysparm_forceSelected', this.editor.tableElement.getNamedAttribute("force_selected") == "true")
    }
    ga.getXML(this._createOptions.bind(this));
  },
  getName: function() {
    return "generateChoiceTable";
  },
  getNoViews: function() {
    return this.editor.tableElement.getNamedAttribute("no_views") == "true";
  },
  _getSelected: function() {
    var selected = this.editor.getValue(this.editor.fields[0]);
    var selectedOnlyOverride = this.editor.tableElement.getNamedAttribute("selected_only_list_override");
    if ((selected == null || selected.length == 0) && selectedOnlyOverride != null) {
      if (selectedOnlyOverride.indexOf('javascript:') == 0) {
        var script = selectedOnlyOverride.substring(11, selectedOnlyOverride.length);
        var response;
        try {
          response = eval(script);
        } catch (e) {
          return selected;
        }
        if (typeof response == 'undefined') {
          return selected;
        } else {
          return response == null || response.length == 0 ?
            'empty_c460fe18-371f-4315-a61b-c7bf21c82786' : response;
        }
      } else {
        return selectedOnlyOverride;
      }
    }
    return selected;
  },
  toString: function() {
    return "GwtListEditTablename";
  }
});;
/*! RESOURCE: /scripts/GwtListEditUpdateTablename.js */
var GwtListEditUpdateTablename = Class.create(GwtListEditTablename, {
  getName: function() {
    return 'generateChoiceUpdateTable';
  },
  getNoViews: function() {
    return true;
  },
  toString: function() {
    return "GwtListEditUpdateTablename";
  }
});;
/*! RESOURCE: /scripts/GwtListEditDependent.js */
var GwtListEditDependent = Class.create(GwtListEditWindow, {
  initialize: function($super, editor, gridEdit, fields) {
    this.fields = fields;
    $super(editor, gridEdit);
  },
  createEditControls: function() {
    this.preferredWidth = 0;
    this.controlsCount = 0;
    this._renderContainer();
    this._renderControls();
    return false;
  },
  onKeyTab: function(evt) {
    evt.stop();
    if (evt.shiftKey) {
      if (!this._previousChoice(evt)) {
        this.saveAndClose();
        this.prevColumn();
      }
    } else if (!this._nextChoice(evt)) {
      this.saveAndClose();
      this.nextColumn();
    }
  },
  _previousChoice: function(e) {
    var previous = this.focusElement.parentNode.parentNode.previousSibling;
    if (previous == null)
      return false;
    this.focusElement = $(previous).select("select")[0];
    this.focusEditor();
    return true;
  },
  _nextChoice: function(e) {
    var next = this.focusElement.parentNode.parentNode.nextSibling;
    if (next == null)
      return false;
    this.focusElement = $(next).select("select")[0];
    this.focusEditor();
    return true;
  },
  _renderControls: function() {
    var clickedField = this.refName;
    for (var i = 0; i < this.fields.length; i++) {
      var field = this.fields[i];
      var elName = this.editor.table + '.' + field;
      var tableElement = TableElement.get(elName);
      if (!tableElement || !tableElement.isChoice())
        continue;
      var focus = (elName == clickedField);
      var el = this._renderControl(tableElement, field, focus);
    }
  },
  _resizeControls: function() {
    var editControls = gel("editControls");
    if (editControls) {
      var choiceLists = editControls.getElementsByTagName("select");
      for (var i = 0; i < choiceLists.length; i++) {
        if (choiceLists[i].clientWidth > this.preferredWidth)
          this.preferredWidth = choiceLists[i].clientWidth;
      }
      for (var i = 0; i < choiceLists.length; i++) {
        choiceLists[i].style.width = this.preferredWidth + 'px';
      }
    }
  },
  _renderContainer: function() {
    var table = cel("table");
    table.cellPadding = 2;
    table.style.backgroundColor = "EEEEEE";
    var tbody = cel("tbody", table);
    tbody.id = "editControls";
    this.setTitle(table);
  },
  _renderControl: function(tableElement, fieldName, focus) {
    this.refName = this.editor.table + "." + fieldName;
    var id = "LIST_EDIT_" + this.refName;
    if (gel(id))
      return;
    var tbody = gel("editControls");
    var tr = cel("tr", tbody);
    var td = cel("td", tr);
    td.id = "container_" + this.refName;
    td.innerHTML = tableElement.label + ":<br>";
    var select = cel("select");
    select.id = id;
    if (this.doctype)
      select.className = 'form-control list-edit-input';
    select.name = this.refName;
    select.setAttribute("dbVal", this.editor.getValue(fieldName));
    select.onchange = this._handleOnChange.bindAsEventListener(this);
    td.appendChild(select)
    this.controlsCount++;
    var dependent = tableElement.getDependent();
    var depVal = '';
    if (dependent)
      depVal = this.editor.getValue(this._getTargetName(fieldName, dependent));
    this._addOptions(select, depVal);
    if (focus)
      this.focusElement = select;
  },
  _handleOnChange: function(e) {
    var parent = Event.element(e);
    var tableElement = TableElement.get(parent.name);
    var children = tableElement.getDependentChildren();
    for (var k in children) {
      var focusElement = gel("LIST_EDIT_" + this._getTargetName(parent.name, k));
      if (!focusElement)
        return;
      focusElement.setAttribute("dbVal", "");
      this._addOptions(focusElement, parent.options[parent.options.selectedIndex].value);
    }
  },
  _getTargetName: function(base, field) {
    var parts = base.split(".");
    parts[parts.length - 1] = field;
    return parts.join(".");
  },
  _addOptions: function(element, depValue) {
    var ajax = new GlideAjax('PickList');
    ajax.addParam('sysparm_chars', '*');
    ajax.addParam('sysparm_name', element.name);
    if (depValue)
      ajax.addParam('sysparm_value', depValue);
    ajax.addParam('sysparm_nomax', 'true');
    ajax.addParam('sysparm_id_list', this.gridEdit.getSelectedSysIds().join());
    ajax.getXML(this._createOptions.bind(this, element));
  },
  _createOptions: function(element, response) {
    element.options.length = 0;
    element.style.width = '';
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    var value = element.getAttribute("dbVal");
    var nullOverride = xml.documentElement.getAttribute("default_option");
    if (nullOverride != null && nullOverride.length > 0) {
      addOption(element, "", nullOverride, true);
    } else {
      var msg = getMessage("-- None --");
      addOption(element, "", msg, true);
    }
    for (var i = 0; i < items.length; i++) {
      var v = items[i].getAttribute("value");
      var l = items[i].getAttribute("label");
      if (!this._checkDuplicateOptions(element, v, l))
        addOption(element, v, l, (v == value));
    }
    if (this.controlsCount > 0)
      this.controlsCount--;
    if (this.controlsCount == 0) {
      setTimeout(this._resizeControls.bind(this), 0);
      this.createEditControlsComplete();
    }
  },
  _checkDuplicateOptions: function(element, value, label) {
    if (!element.length)
      return false;
    var opts = element.options;
    for (var i = 0; i < opts.length; i++)
      if (opts[i].value == value && opts[i].text === label)
        return true;
    return false;
  },
  save: function() {
    var tbody = gel("editControls");
    var choiceLists = tbody.getElementsByTagName("select");
    if (choiceLists) {
      for (var i = 0; i < choiceLists.length; i++) {
        var element = choiceLists[i];
        var option = element.options[element.selectedIndex];
        var fName = element.name.substring(this.editor.table.length + 1);
        this.editor.setFieldValue(fName, option.value);
        var dspValue;
        if (!option.value)
          dspValue = '';
        else
          dspValue = option.text;
        this.editor.setFieldRenderValue(fName, dspValue);
      }
    }
  },
  toString: function() {
    return "GwtListEditDependent";
  }
});;
/*! RESOURCE: /scripts/GwtListEditMultiText.js */
var GwtListEditMultiText = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    var input = this._createTextAreaInput();
    this.setTitle(input);
  },
  onKeyEsc: function(evt) {
    evt.stop();
    this.dismiss();
    setTimeout(this._delayedRefresh.bind(this), 10);
  },
  onKeyReturn: function(evt) {
    if (evt.shiftKey)
      return;
    evt.stop();
    this.saveAndClose();
    if (evt.ctrlKey)
      setTimeout(this._delayedEdit.bind(this), 10);
    else
      setTimeout(this._delayedRefresh.bind(this), 10);
  },
  _delayedRefresh: function() {
    this.gridEdit.refreshCursor();
  },
  _delayedEdit: function() {
    this.gridEdit.editNextRow();
  },
  _createTextAreaInput: function() {
    var answer = cel("textarea");
    answer.value = this.editor.getDisplayValue();
    answer.rows = 4;
    answer.id = GwtListEditWindow.inputID;
    if (this.doctype)
      answer.addClassName('form-control list-edit-input');
    if (!this.doctype) {
      answer.style.width = this.preferredWidth;
      answer.style.overflow = "auto";
    }
    this.focusElement = answer;
    return answer;
  },
  save: function() {
    var input = GwtListEditWindow.getCellEditValue();
    if (input) {
      this.setValue(null, input.value);
      this.setRenderValue(this.truncateDisplayValue(input.value));
    }
  },
  toString: function() {
    return "GwtListEditMultiText";
  }
});;
/*! RESOURCE: /scripts/GwtListEditJournal.js */
var GwtListEditJournal = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    var input = this._createTextAreaInput();
    this.setTitle(input);
  },
  onKeyReturn: function($super, evt) {
    if (evt.shiftKey)
      return;
    $super(evt);
  },
  _createTextAreaInput: function() {
    var answer = cel("textarea");
    answer.value = "";
    answer.rows = 3;
    answer.id = GwtListEditWindow.inputID;
    if (this.doctype)
      answer.addClassName('form-control list-edit-input');
    if (!this.doctype) {
      answer.style.width = this.preferredWidth;
      answer.style.overflow = "auto";
    }
    this.focusElement = answer;
    return answer;
  },
  save: function() {
    var input = GwtListEditWindow.getCellEditValue();
    if (input)
      this.setValue(null, input.value);
  },
  toString: function() {
    return "GwtListEditJournal";
  }
});;
/*! RESOURCE: /scripts/GwtListEditInternalType.js */
var GwtListEditInternalType = Class.create(GwtListEditSelect, {
  addOptions: function() {
    var ga = new GlideAjax('AjaxClientHelper');
    ga.addParam('sysparm_name', 'generateChoice');
    var selectedValue = this.editor.getValue();
    if (selectedValue) {
      ga.addParam('sysparm_selected_value', selectedValue);
    }
    ga.getXML(this._createOptions.bind(this));
  },
  _createOptions: function(response) {
    if (this.state != 'initialize')
      return;
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    var value = this.editor.getValue();
    this.focusElement.options.length = 0;
    for (var i = 0; i < items.length; i++) {
      var v = items[i].getAttribute("value");
      var l = items[i].getAttribute("label");
      addOption(this.focusElement, v, l, this._isSelected(value, v, l));
    }
    this.createEditControlsComplete();
  },
  toString: function() {
    return "GwtListEditInternalType";
  }
});;
/*! RESOURCE: /scripts/GwtListEditRelatedTags.js */
var GwtListEditRelatedTags = Class.create(GwtListEditWindow, {
  createOkCancel: function() {
    var save = createImage('images/icons/nav_clear_2.png', this.msgSaveButton, this, this.saveEvent);
    save.id = 'cell_edit_ok';
    save.width = 18;
    save.height = 18;
    this.addDecoration(save);
  },
  save: function() {},
  createEditControls: function() {
    var $ = $j;
    var that = this;
    var tags = new Element("ul", {
      "id": "tag_cell_edit"
    });
    this.setTitle(tags);
    $dt = $('#tag_cell_edit');
    var url = new GlideURL("data_table.do");
    url.addParam('sysparm_type', 'labels');
    url.addParam('sysparm_table', this.editor.table);
    url.addParam('sysparm_sys_id', this.editor.getCanWriteIds().toString());
    url.addParam('sysparm_action', 'common_labels');
    url.addParam('nocache', (new Date().getTime().toString()));
    url = url.getURL();
    $.ajax({
      dataType: "json",
      url: url,
      beforeSend: function(request) {
        request.setRequestHeader("X-UserToken", window.g_ck);
      },
      success: initializeResponse
    });

    function labelTypeAhead(table, search, showChoices) {
      var url = new GlideURL("data_table.do");
      url.addParam('sysparm_type', 'labels');
      url.addParam('sysparm_table', table);
      url.addParam('sysparm_action', 'available_labels');
      url.addParam('sysparm_prefix', search.term);
      url = url.getURL();
      $.ajax({
        dataType: "json",
        url: url,
        beforeSend: function(request) {
          request.setRequestHeader("X-UserToken", window.g_ck);
        },
        success: function() {
          var t = arguments[2].responseText;
          var response = JSON.parse(t);
          showChoices(response.availableLabels);
        }
      });
    }

    function initializeResponse() {
      var labels = JSON.parse(arguments[2].responseText);
      $dt.html += "<li></li>";
      $dt.newtagit({
        allowSpaces: true,
        afterTagAdded: onTagAdded,
        afterTagRemoved: onTagRemoved,
        showAutocompleteOnFocus: false,
        animate: false,
        placeholderText: getMessage("Add Tag..."),
        table: labels.table,
        labelsListString: JSON.stringify(labels),
        autocomplete: {
          source: function(search, showChoices) {
            labelTypeAhead(labels.table, search, showChoices);
          }
        },
        query: "",
        context: "cellEdit",
        rowId: that.getAnchorSysId(),
        fieldName: "documentTags"
      });
      $dt.css("display", "inline-block");
    }

    function onTagAdded(evt, ui) {
      if (ui.duringInitialization)
        return;
      var rowIds = that.editor.getCanWriteIds();
      var validRowIds = [];
      for (var i = 0; i < rowIds.length; i++) {
        var row = $("tr[sys_id='" + rowIds[i] + "']");
        var labelNames = row.find(".tagit-label:contains(" + ui.tagLabel + ")")
          .filter(function() {
            return this.text == ui.tagLabel
          });
        if (labelNames.length != 0)
          continue;
        row.find("input.ui-widget-content").parent().before(ui.tag.clone(true));
        validRowIds.push(rowIds[i]);
      }
      labelSet('add', ui.tagLabel, ui.table, validRowIds);
    }

    function onTagRemoved(evt, ui) {
      if (ui.duringInitialization)
        return;
      var rowIds = that.editor.getCanWriteIds();
      var validRowIds = [];
      for (var i = 0; i < rowIds.length; i++) {
        var label = $("tr[sys_id='" + rowIds[i] + "']").find("li[id='" + ui.tag + "']");
        if (label.length != 0) {
          label.remove();
          validRowIds.push(rowIds[i]);
        }
      }
      labelSet('removeById', ui.tag, ui.table, validRowIds);
    }

    function labelSet(action, label, table, rowId) {
      var url = new GlideURL("data_table.do");
      url.addParam('sysparm_type', 'labels');
      url.addParam('sysparm_table', table);
      url.addParam('sysparm_sys_id', rowId.toString());
      url.addParam('sysparm_label', label);
      url.addParam('sysparm_action', action);
      url = url.getURL();
      $.ajax({
        dataType: "json",
        url: url,
        beforeSend: function(request) {
          request.setRequestHeader("X-UserToken", window.g_ck);
        },
        success: labelResponse
      });
    }

    function labelResponse() {
      if (g_enhanced_activated == 'false') return;
      if (arguments == null || arguments[2] == null) return;
      var t = arguments[2].responseText;
      if (t == "" || t == null) return;
      var json = JSON.parse(t);
      var share = $dt.find('[id=\'' + json.label + '\'].tagit-share');
      share.parent().attr("id", json.sysId).css({
        "background-color": json.bgcolor,
        "color": json.tcolor
      });
      share.parent().find(".tagit-label").unbind('click').click(function() {
        window.location.href = json.table + "_list.do?sysparm_query=" + json.query
      });
      if (json.owner != true) {
        share.removeClass("pointerhand");
        share.unbind("click");
      }
      var icon = (json.type == 'SHARED') ? 'icon-user-group' : 'icon-user';
      share = share.children();
      share.removeClass("icon-user-group icon-user").addClass(icon);
      var rowIds = that.editor.getCanWriteIds();
      for (var i = 0; i < rowIds.length; i++) {
        var rowShare = $("tr[sys_id='" + rowIds[i] + "']").find('[id=\'' + json.label + '\'].tagit-share');
        rowShare.parent().attr("id", json.sysId).css({
          "background-color": json.bgcolor,
          "color": json.tcolor
        });
        rowShare.parent().find(".tagit-label").unbind('click').click(function() {
          window.location.href = json.table + "_list.do?sysparm_query=" + json.query
        });
        if (json.owner != true) {
          rowShare.removeClass("pointerhand");
          rowShare.unbind("click");
        }
        rowShare = rowShare.children();
        rowShare.removeClass("icon-user-group icon-user").addClass(icon);
      }
    }
  },
  _onKeyDown: function(e) {
    switch (e.keyCode) {
      case Event.KEY_ESC:
        this.onKeyEsc(e);
        break;
      case Event.KEY_TAB:
        this.onKeyTab(e);
        break;
    }
  },
  toString: function() {
    return "GwtListEditRelatedTags";
  }
});;
/*! RESOURCE: /scripts/GwtListEditEncryptedText.js */
var GwtListEditEncryptedText = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    var input = this._createTextAreaInput();
    this.setTitle(input);
  },
  _createTextAreaInput: function() {
    var answer = cel("textarea");
    answer.value = this.editor.getDisplayValue();
    answer.rows = 4;
    answer.id = GwtListEditWindow.inputID;
    if (this.doctype)
      answer.addClassName('form-control list-edit-input');
    if (!this.doctype) {
      answer.style.width = this.preferredWidth;
      answer.style.overflow = "auto";
    }
    this.focusElement = answer;
    return answer;
  },
  save: function() {
    var input = GwtListEditWindow.getCellEditValue();
    if (input) {
      this.setValue(null, input.value);
      this.setRenderValue(this.truncateDisplayValue(input.value));
    }
  },
  toString: function() {
    return "GwtListEditEncryptedText";
  }
});;
/*! RESOURCE: /scripts/GwtListEditTranslatedField.js */
var GwtListEditTranslatedField = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    var input = this.createTextInput();
    input.value = this.editor.getDisplayValue();
    this.setTitle(input);
    if (this.editor.tableElement.maxLength > 0)
      input.setAttribute("maxLength", this.editor.tableElement.maxLength);
    var answer = input.value.replace(/\n/g, " ");
    answer = answer.replace(/\t/g, "");
    this.focusElement.value = answer;
  },
  save: function() {
    var input = GwtListEditWindow.getCellEditValue();
    if (input) {
      this.setValue(null, input.value);
      this.setRenderValue(this.truncateDisplayValue(input.value));
    }
  },
  toString: function() {
    return "GwtListEditTranslatedField";
  }
});;
/*! RESOURCE: /scripts/GwtListEditPassword.js */
var GwtListEditPassword = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    var input = this.createTextInput();
    input.type = "password";
    this.setTitle(input);
  },
  save: function() {
    var input = GwtListEditWindow.getCellEditValue();
    if (input)
      this.setValue(null, input.value);
  },
  toString: function() {
    return "GwtListEditPassword";
  }
});;
/*! RESOURCE: /scripts/GwtListEditError.js */
var GwtListEditError = Class.create(GwtListEditWindow, {
  initialize: function($super, editor, gridEdit, errorMsg) {
    this.errorMsg = errorMsg;
    $super(editor, gridEdit);
  },
  _showUpdateMessage: function() {
    return;
  },
  createEditControls: function() {
    var input = this.createTextInput();
    input.value = this.editor.getDisplayValue();
    if (this.doctype)
      input.style.marginBottom = '3px';
    input.style.backgroundColor = "LightGrey";
    input.readOnly = true;
    this.setTitle(input);
    this.appendStatusPane(this.errorMsg);
    var e = $('cell_edit_ok');
    if (e)
      e.parentNode.removeChild(e);
  },
  focusEditor: function() {
    this.focusElement.focus();
  },
  saveAndClose: function() {
    this.dismiss();
    return true;
  },
  toString: function() {
    return "GwtListEditError";
  }
});;
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
    if (tableElement.isReference())
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
    if (tableElement.getType() == "glide_encrypted")
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
/*! RESOURCE: /scripts/GwtListEditAjaxChangeSaver.js */
var GwtListEditAjaxChangeSaver = Class.create({
      PROCESSOR: 'com.glide.ui_list_edit.AJAXListEdit',
      WAIT_INITIAL_DELAY: 300,
      WAITING_IMAGE: 'images/loading_anim3.gifx',
      initialize: function(changes, tableController, onCompletion) {
        this.changes = changes;
        this.tableController = tableController;
        this.onCompletion = onCompletion;
        this.changedEntries = [];
        this.savingImages = [];
        this.timer = null;
      },
      save: function() {
          this._startSavingTimer();
          var ajax = new GlideAjax(this.PROCESSOR);
          ajax.addParam("sysparm_type", 'set_value');
          ajax.addParam('sysparm_table', this.tableController.tableName);
          ajax.addParam('sysparm_first_field', this.tableCon