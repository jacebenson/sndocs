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
    this.container.style.right = 'auto';
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
    ajax.addParam('sysparm_first_field', this.tableController.firstField);
    ajax.addParam('sysparm_omit_links', this.tableController.omitLinks);
    ajax.addParam('sysparm_xml', this._buildXml());
    this.tableController.tableElementDOM.fire('glide:list_v2.edit.save', {
      ajax: ajax
    });
    ajax.setErrorCallback(this._errorResponse.bind(this));
    ajax.getXML(this._saveResponse.bind(this));
    this.changes.clearAllModified();
    this.changes.removeAll();
  },
  _buildXml: function() {
    var xml = this._createRecordUpdateXml();
    var selector = new GlideListEditor.IsModifiedRecordSelector(this.changes);
    var serializer = new GlideListEditor.XmlSerializingReceiver(xml, xml.documentElement, selector);
    var capture = new GwtListEditAjaxChangeSaver.ChangeCaptureReceiver();
    var receiver = new GwtListEditorPendingChanges.ComposableChangeReceiver();
    receiver.addReceiver(serializer);
    receiver.addReceiver(capture);
    this.changes.exportChanges(receiver);
    this.changedEntries = capture.changedEntries;
    return getXMLString(xml);
  },
  _createRecordUpdateXml: function() {
    var xml = loadXML("<record_update/>");
    this.tableController.exportXml(xml.documentElement);
    return xml;
  },
  _saveResponse: function(response) {
    this._hideSaving();
    if (!response || !response.responseXML) {
      if (this.onCompletion)
        this.onCompletion();
      return;
    }
    var savedSysIds = [];
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var sysId = item.getAttribute("sys_id");
      if (savedSysIds.indexOf(sysId) < 0)
        savedSysIds.push(sysId);
      var fqField = item.getAttribute("fqField");
      var data = item.firstChild;
      if (!data)
        continue
      var cell = this.tableController.getFqField(sysId, fqField);
      if (!cell)
        continue;
      GlideList2.updateCellContents(cell, data);
      var n = new GlideUINotification({
        type: 'action',
        attributes: {
          table: this.tableController.tableName,
          sys_id: sysId,
          action: 'list_update'
        }
      });
      GlideUI.get().fire(n);
    }
    if (savedSysIds.length > 0)
      this._fireChangesSaved(savedSysIds);
    if (this.onCompletion)
      this.onCompletion();
  },
  _errorResponse: function() {
    this._hideSaving();
  },
  _fireChangesSaved: function(savedSysIds) {
    var info = {
      listId: this.tableController.listID,
      saves: savedSysIds
    };
    this.tableController.fire('glide:list_v2.edit.changes_saved', info);
  },
  _startSavingTimer: function() {
    this.timer = setTimeout(this._showSaving.bind(this), this.WAIT_INITIAL_DELAY);
  },
  _hideSaving: function() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    for (var i = 0; i < this.savingImages.length; i++)
      rel(this.savingImages[i]);
    this.savingImages = [];
  },
  _showSaving: function() {
    for (var i = 0; i < this.changedEntries.length; i++) {
      var sysId = this.changedEntries[i][0];
      var field = this.changedEntries[i][1];
      var element = this.tableController.getCell(sysId, field);
      if (element)
        this._showImage(element);
    }
  },
  _showImage: function(element) {
    var img = GwtListEditTableController.showImage(element, this.WAITING_IMAGE);
    this.savingImages.push(img);
  },
  toString: function() {
    return 'GwtListEditAjaxChangeSaver';
  }
});
GwtListEditAjaxChangeSaver.ChangeCaptureReceiver = Class.create(
  GwtListEditorPendingChanges.ChangeReceiver, {
    initialize: function($super) {
      $super();
      this.changedEntries = [];
    },
    changedField: function(sysID, field) {
      var entry = [sysID, field.getName()];
      this.changedEntries.push(entry);
    },
    toString: function() {
      return 'GwtListEditAjaxChangeSaver.ChangeCaptureReceiver';
    }
  });;
/*! RESOURCE: /scripts/GwtListEditAjaxValueLoader.js */
var GwtListEditAjaxValueLoader = Class.create({
  _iso: new ISO9075(),
  PROCESSOR: 'com.glide.ui_list_edit.AJAXListEdit',
  initialize: function(changes, tableController) {
    this.changes = changes;
    this.tableController = tableController;
    this._clearErrorMsg();
    this.generatedSysId = null;
  },
  loadValues: function(sysIds, fields, callback) {
    var ajax = new GlideAjax(this.PROCESSOR);
    ajax.addParam('sysparm_type', 'get_value');
    ajax.addParam('sysparm_table', this.tableController.tableName);
    if ((sysIds.length == 1) && (sysIds[0] == "-1"))
      ajax.addParam("sysparm_default_query", this.tableController.query);
    if (this._buildIdList(ajax, sysIds, fields)) {
      this._waitForAjax(ajax, callback, 5000);
    } else
      callback();
  },
  loadDefaults: function(callback) {
    this.changes.clearDefaults();
    this.loadValues(["-1"], this.tableController.getFields(), callback);
  },
  loadTable: function(callback) {
    var ajax = new GlideAjax(this.PROCESSOR);
    ajax.addParam('sysparm_type', 'get_value');
    ajax.addParam('sysparm_table', this.tableController.tableName);
    ajax.addParam('sysparm_query', this.tableController.query);
    var fields = this.tableController.getFields();
    ajax.addParam("sysparm_fields", fields.join(','));
    this._waitForAjax(ajax, callback, 5000);
  },
  getErrorMsg: function() {
    return this.errorMsg;
  },
  _buildIdList: function(ajax, sysIds, fields) {
    var needFields = false;
    for (var i = 0; i < sysIds.length; i++) {
      var id = sysIds[i];
      var fieldList = [];
      for (var j = 0; j < fields.length; j++) {
        if (!this.changes.getField(id, fields[j]))
          fieldList.push(fields[j]);
      }
      if (fieldList.length > 0) {
        needFields = true;
        ajax.addParam('sysparm_sys_id_' + id, fieldList.join(','));
      }
    }
    return needFields;
  },
  _waitForAjax: function(ajax, callback, timeout) {
    if (timeout < 0)
      return;
    if (!this.ajax) {
      this.ajax = true;
      ajax.getXML(this._getValuesResponse.bind(this, callback));
    } else {
      setTimeout(this._waitForAjax.bind(this, ajax, callback), 10, timeout - 10);
    }
  },
  _getValuesResponse: function(callback, response) {
    this.ajax = false;
    if (!response || !response.responseXML) {
      this.errorMsg = getMessage("No response from server - try again later");
      callback();
      return;
    }
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var sysId = item.getAttribute("sys_id");
      this.generatedSysId = item.getAttribute("new_sys_id");
      var fieldList = item.getAttribute("field_list");
      var fields;
      if (fieldList)
        fields = fieldList.split(',');
      else
        fields = [];
      for (var j = 0; j < fields.length; j++) {
        var n = fields[j];
        var fieldItem = this._getXMLFieldItem(item, n);
        if (!fieldItem)
          continue;
        var canWrite = true;
        if (fieldItem.getAttribute("can_write") == "false")
          canWrite = false;
        var mandatory = false;
        if (fieldItem.getAttribute("mandatory") == "true")
          mandatory = true;
        var okExtension = true;
        if (fieldItem.getAttribute("ok_extension") == "false")
          okExtension = false;
        if (!this.changes.getField(sysId, n)) {
          var f = this._addField(sysId, n);
          f.setInitialValues(this._getXMLValue(fieldItem, "value"), this._getXMLValue(fieldItem, "displayvalue"));
          f.setWritable(canWrite);
          f.setMandatory(mandatory);
          f.setOKExtension(okExtension);
          f.setLabel(fieldItem.getAttribute("label"));
        }
      }
    }
    this._clearErrorMsg();
    callback();
  },
  _getXMLFieldItem: function(parent, n) {
    for (var i = 0; i < parent.childNodes.length; i++) {
      var item = parent.childNodes[i];
      if (this._iso.decode(item.nodeName.toLowerCase()) == n)
        return item;
    }
    return null;
  },
  _getXMLValue: function(item, type) {
    var value = null;
    var e = item.getElementsByTagName(type);
    if (e && e.length > 0)
      value = getTextValue(e[0]);
    if (!value)
      value = "";
    return value;
  },
  _addField: function(sysId, field) {
    var record = this.changes.get(sysId);
    if (!record)
      record = this.changes.addRecord(sysId)
    return record.addField(field);
  },
  _clearErrorMsg: function() {
    this.errorMsg = "";
  },
  toString: function() {
    return 'GwtListEditAjaxValueLoader';
  }
});;
/*! RESOURCE: /scripts/GwtListEditRecordDecorations.js */
var GwtListEditRecordDecorations = Class.create({
  MSGS: [
    'Insert a new row...',
    'Mark record for List Action',
    'View',
    'Save',
    'Delete',
    'Display / hide hierarchical lists'
  ],
  initialize: function(changes, tableController) {
    this.changes = changes;
    this.tableController = tableController;
    this.msgs = getMessages(this.MSGS);
    this.updateTable();
  },
  updateTable: function() {
    this.currDecor = {};
    this.viewDecor = {};
    this.pendingDecor = {};
    this.editDecor = {};
    this.tableController.observe('glide:list_v2.edit.changes_saved', this._handleChangesSaved.bind(this));
    this.tableController.observe('glide:list_v2.edit.rows_deleted', this._handleRowsDeleted.bind(this));
    this.tableController.observe('glide:list_v2.edit.changes_deferred', this._handleChangesDeferred.bind(this));
  },
  showView: function(sysId) {
    if (!this.tableController.hasActions)
      return;
    var currDecor = this._getCurrDecor(sysId);
    var showDecor = this._getViewDecor(sysId);
    this._displayDecor(sysId, showDecor, currDecor);
    if (this._isDoctype())
      this._adjustView();
  },
  _adjustView: function() {
    var table = gel(this.tableController.listID + '_table');
    var popup = $j(table).find('td.list_decoration_cell a.list_popup').last();
    var row = popup.closest('tr');
    popup.detach();
    row.children(':eq(1)').empty().append(popup);
  },
  showPending: function(sysId) {
    var currDecor = this._getCurrDecor(sysId);
    var showDecor = this._getPendingDecor(sysId);
    this._displayDecor(sysId, showDecor, currDecor);
  },
  showEdit: function(sysId) {
    var currDecor = this._getCurrDecor(sysId);
    var showDecor = this._getEditDecor(sysId);
    this._displayDecor(sysId, showDecor, currDecor);
  },
  _displayDecor: function(sysId, showDecor, currDecor) {
    if (!showDecor)
      return;
    if (currDecor && (currDecor !== showDecor))
      currDecor.hide();
    this.currDecor[sysId] = showDecor;
    showDecor.show();
  },
  resetSaveIcons: function() {
    var thisDecor = this;
    this.tableController.tableElementDOM.select("tr.list_row").each(function(elem) {
      var sys_id = elem.getAttribute("sys_id");
      if (sys_id && (elem.hasClassName("list_add") || elem.down(".list_edit_dirty")) && !elem.down("td.list_edit_new_row"))
        thisDecor.showPending(sys_id);
    });
  },
  resetPendingIcons: function() {
    var thisDecor = this;
    this.tableController.tableElementDOM.select("tr.list_row").each(function(elem) {
      var sys_id = elem.getAttribute("sys_id");
      if (sys_id && (elem.hasClassName("list_add") || elem.down(".list_edit_dirty")) && !elem.down("td.list_edit_new_row")) {
        var cell = thisDecor.tableController.getDecorationCell(sys_id);
        if (cell) {
          var existingImg = cell.select("img.list_popup");
          if (existingImg.length > 0)
            existingImg[0].parentNode.removeChild(existingImg[0]);
        }
        thisDecor.showPending(sys_id);
      }
    });
  },
  _getCurrDecor: function(sysId) {
    var decor = this.currDecor[sysId];
    if (decor)
      return decor;
    var cell = this.tableController.getDecorationCell(sysId);
    decor = this._getServerViewDecorations(sysId, cell);
    if (decor) {
      this.viewDecor[sysId] = decor;
      this.currDecor[sysId] = decor;
      return decor;
    }
    return null;
  },
  _getViewDecor: function(sysId) {
    var decor = this.viewDecor[sysId];
    if (decor)
      return decor;
    var cell = this.tableController.getDecorationCell(sysId);
    if (!cell)
      return null;
    decor = this._getServerViewDecorations(sysId, cell);
    if (decor) {
      this.viewDecor[sysId] = decor;
      return decor;
    }
    decor = this._buildDecorationSpan(sysId, cell, 'view');
    this._addViewDecorations(sysId, decor);
    this.viewDecor[sysId] = decor;
    return decor;
  },
  _getPendingDecor: function(sysId) {
    var decor = this.pendingDecor[sysId];
    if (decor)
      return decor;
    var cell = this.tableController.getDecorationCell(sysId);
    cell = $(cell);
    if (cell.down("[icon_type='save']"))
      return;
    decor = this._buildDecorationSpan(sysId, cell, 'unsaved');
    var existingImg = cell.select("img.list_popup");
    this._addPendingDecorations(sysId, decor, existingImg);
    this.pendingDecor[sysId] = decor;
    return decor;
  },
  _getEditDecor: function(sysId) {
    var decor = this.editDecor[sysId];
    if (decor)
      return decor;
    var cell = this.tableController.getDecorationCell(sysId);
    decor = this._buildDecorationSpan(sysId, cell, 'edit');
    this._addEditDecorations(sysId, decor);
    this.editDecor[sysId] = decor;
    return decor;
  },
  _getServerViewDecorations: function(sysId, cell) {
    if (!cell)
      return null;
    var decor = cell.firstChild;
    if (!decor)
      return null;
    if (!Object.isElement(decor))
      return null;
    if ("SPAN" !== decor.tagName)
      return null;
    if (decor.id)
      return null;
    return $(decor);
  },
  _buildDecorationSpan: function(sysId, cell, label) {
    var decor = $(new Element("span", {
      'id': sysId + '_' + label,
      'class': 'list_decoration'
    }));
    decor.hide();
    cell.appendChild(decor);
    return decor;
  },
  _addEditDecorations: function(sysId, span) {
    if (this.tableController.isFormUI()) {
      this._addEmbeddedEditIcon(span);
      return;
    }
    this._addEditIcon(span);
  },
  _addViewDecorations: function(sysId, span) {
    if (this.tableController.isFormUI()) {
      this._addDeleteIcon(span, sysId);
      this._addSpacerIcon(span);
      this._addEmbeddedPopUp(span, sysId);
      return;
    }
    this._addCheckBox(span, sysId);
    if (this.tableController.hasShowableHierarchy())
      this._addHierarchyIcon(span, sysId);
    this._addPopUp(span, sysId);
  },
  _addPendingDecorations: function(sysId, span, existingImg) {
    if (this.tableController.isFormUI()) {
      if (this._isDoctype() && this.changes.isUpdatedRow(sysId))
        return;
      this._addDeleteIcon(span, sysId);
      this._addSpacerIcon(span);
      if (existingImg && existingImg.length > 0 && existingImg[0].parentElement)
        this._addEmbeddedPopupIcon(span, sysId, existingImg[0].parentElement);
      else
        this._addNewEmbeddedListIcon(span, sysId);
      return;
    }
    if (this.changes.isUpdatedRow(sysId)) {
      this._addCheckBox(span, sysId);
      if (this.tableController.hasShowableHierarchy())
        this._addHierarchyIcon(span, sysId);
      this._addSavePopUp(span, sysId);
      return;
    }
    this._addDeleteIcon(span, sysId);
    this._addSaveIcon(span, sysId);
  },
  _handleRowsDeleted: function(evt) {
    this.sortZebra();
  },
  _addEditIcon: function(span) {
    var o = {
      title: this.msgs['Insert a new row...']
    };
    span.insert(this._getTemplate("EDIT_ICON").evaluate(o));
  },
  _addCheckBox: function(span, sysId) {
    var o = {
      row_id: sysId,
      listId: this.tableController.listID,
      title: this.msgs['Mark record for List Action']
    };
    span.insert(this._getTemplate("LIST_CHECKBOX_ICON").evaluate(o));
  },
  _addPopUp: function(span, sysId) {
    var o = {
      row_id: sysId,
      table: this.tableController.tableName,
      title: this.msgs['View']
    };
    span.insert(this._getTemplate("POPUP_ICON").evaluate(o));
  },
  _addSavePopUp: function(span, sysId) {
    var o = {
      row_id: sysId,
      table: this.tableController.tableName,
      title: this.msgs['Save']
    };
    span.insert(this._getTemplate("SAVE_POPUP_ICON").evaluate(o));
  },
  _addDeleteIcon: function(span, sysId) {
    var o = {
      row_id: sysId,
      title: this.msgs['Delete'],
      listID: this.tableController.listID,
      dataType: "list2_delete_row"
    };
    span.insert(this._getTemplate("DELETE_ICON").evaluate(o));
  },
  _addEmbeddedEditIcon: function(span) {
    var o = {
      title: this.msgs['Insert a new row...']
    };
    span.insert(this._getTemplate("EMBEDDED_EDIT_ICON").evaluate(o));
  },
  _addEmbeddedPopUp: function(span, sysId) {
    var o = {
      row_id: sysId,
      table: this.tableController.tableName,
      title: this.msgs['View']
    };
    span.insert(this._getTemplate("EMBEDDED_POPUP_ICON").evaluate(o));
  },
  _addSaveIcon: function(span, sysId) {
    var o = {
      title: this.msgs['Save']
    };
    span.insert(this._getTemplate("SAVE_ICON").evaluate(o));
  },
  _addEmbeddedPopupIcon: function(span, sysId, elem) {
    var o = {
      row_id: sysId,
      table: this.tableController.tableName,
      title: this.msgs['Record Modified'],
      href: elem.href,
      dataType: "list2_popup",
      listID: this.tableController.listID
    };
    span.insert(this._getTemplate("EMBEDDED_MODIFIED_POPUP_ICON").evaluate(o));
  },
  _addNewEmbeddedListIcon: function(span, sysId) {
    var o = {
      title: this.msgs['New Record']
    };
    span.insert(this._getTemplate("EMBEDDED_LIST_NEW_ICON").evaluate(o));
  },
  _addHierarchyIcon: function(span, sysId) {
    var o = {
      title: this.msgs['Display / hide hierarchical lists']
    };
    span.insert(this._getTemplate("HIERARCHY_ICON").evaluate(o));
  },
  _addSpacerIcon: function(e) {
    e.insert(this._getTemplate("SPACER_ICON"));
  },
  _handleChangesSaved: function(evt) {
    if (evt.memo.listId !== this.tableController.listID)
      return;
    var saves = evt.memo.saves;
    for (i = 0; i < saves.length; i++) {
      var saveId = saves[i];
      this.showView(saveId);
    }
    this.sortZebra();
  },
  _handleChangesDeferred: function(evt) {
    if (evt.memo.listId !== this.tableController.listID)
      return;
    var defers = evt.memo.defers;
    for (i = 0; i < defers.length; i++) {
      var deferId = defers[i];
      this.showPending(deferId);
    }
    this.sortZebra();
  },
  sortZebra: function() {
    var flip = false;
    this.tableController.tableElementDOM.select("tr.list_row").each(function(row) {
      if (flip) {
        if (row.hasClassName("list_odd"))
          row.removeClassName("list_odd");
        if (!row.hasClassName("list_even"))
          row.addClassName("list_even");
      } else {
        if (row.hasClassName("list_even"))
          row.removeClassName("list_even");
        if (!row.hasClassName("list_odd"))
          row.addClassName("list_odd");
      }
      flip = !flip;
    });
  },
  _getTemplate: function(name) {
    var doctypeTempl = GwtListEditRecordDecorations.Templates[name + '_DOCTYPE'];
    if (this._isDoctype() && doctypeTempl)
      return doctypeTempl;
    return GwtListEditRecordDecorations.Templates[name];
  },
  _isDoctype: function() {
    return document.documentElement.getAttribute('data-doctype');
  },
  toString: function() {
    return 'GwtListEditRecordDecorations';
  }
});
GwtListEditRecordDecorations.Templates = {
  DELETE_ICON: new Template(
    '<img data-type="#{dataType}" data-list_id="#{listID}" width="16" height="16" src="images/delete_row.gifx"' +
    ' class="list_delete_row list_decoration clsshort button"' +
    ' title="#{title}"></img>'
  ),
  SPACER_ICON: '<img width="0" height="16" src="images/s.gifx" class="clsshort button">',
  NEW_ICON: new Template(
    '<img src="images/new_row.gifx" width="12" height="12" class="clsshort button" title="#{title}"></img>'),
  SAVE_ICON: new Template(
    '<img icon_type="save" src="images/save.pngx" width="16" height="16" class="clsshort button list_decoration" title="#{title}"' +
    'onclick="editListSaveRow(this);" ></img>'),
  EMBEDDED_MODIFIED_POPUP_ICON: new Template(
    '<a href="#{href}">' +
    '<img icon_type="save" data-type="#{dataType}" data-list_id="#{listID}" class="list_popup list_decoration" title="#{title}" src="images/icons/hover_icon_dirty.gifx" height="16" width="16">' +
    '</a>'),
  EMBEDDED_LIST_NEW_ICON: new Template('<img src="images/dirty.gifx" width="16" height="16" class="clsshort button list_decoration" title="#{title}" ></img>'),
  SAVE_POPUP_ICON: new Template(
    '<img src="images/save.pngx" width="16" height="16" class="list_popup list_decoration" title="#{title}"' +
    'onclick="editListSaveRow(this);" ></img>'),
  POPUP_ICON: new Template(
    '<a href="#{table}.do?sys_id=#{row_id}&amp;sysparm_view=&amp;sysparm_record_target=#{table}&amp;sysparm_record_list=">' +
    '<img icon_type="save" class="list_popup list_decoration" title="#{title}" src="images/icons/hover_icon.gifx" height="16" width="16">' +
    '</a>'),
  LIST_CHECKBOX_ICON: new Template(
    '<input class="list_checkbox checkbox" title="#{title}" type="checkbox" name="checkbox_#{listId}" id="checkbox_#{listId}_#{row_id}" />'),
  HIERARCHY_ICON: new Template(
    '<img class="list_hier button" title="#{title}" src="images/list_v2_heir_hide.gifx" height="16" width="16">'
  ),
  EDIT_ICON: new Template(
    '<img width="14" height="14" class="list_edit_image" title="#{title}" src="images/list_edit.pngx" />'
  ),
  EMBEDDED_POPUP_ICON: new Template(
    '<a href="#{table}.do?sys_id=#{row_id}&amp;sysparm_view=&amp;sysparm_record_target=#{table}&amp;sysparm_record_list=">' +
    '<img class="list_popup list_decoration" title="#{title}" src="images/icons/hover_icon.gifx" height="12" width="12">' +
    '</a>'),
  EMBEDDED_EDIT_ICON: new Template(
    '<img width="12" height="12" class="list_edit_image" title="#{title}" src="images/list_edit.pngx" />'
  ),
  EMBEDDED_EDIT_ICON_DOCTYPE: new Template(
    '<i class="list_edit_image icon-add btn disabled" title="#{title}">' +
    '<span class="sr-only">#{title}</span>' +
    '</i>'
  ),
  EMBEDDED_POPUP_ICON_DOCTYPE: new Template(
    '<a href=#{table}.do?sys_id=#{row_id}&amp;sysparm_view=&amp;sysparm_record_target=#{table}&amp;sysparm_record_list=" class="btn btn-icon icon-info list_popup" data-type="list2_popup" data-list_id="$[sysparm_list_id]" title="#{title}" style="margin-left:0px">' +
    '<span class="sr-only">#{title}</span>' +
    '</a>'),
  EDIT_ICON_DOCTYPE: new Template(
    '<i class="list_edit_image icon-add btn disabled" title="#{title}">' +
    '<span class="sr-only">#{title}</span>' +
    '</i>'
  ),
  POPUP_ICON_DOCTYPE: new Template(
    '<a href=#{table}.do?sys_id=#{row_id}&amp;sysparm_view=&amp;sysparm_record_target=#{table}&amp;sysparm_record_list=" class="btn btn-icon table-btn-lg icon-info list_popup" data-type="list2_popup" data-list_id="$[sysparm_list_id]" title="#{title}" style="margin-left:0px">' +
    '<span class="sr-only">#{title}</span>' +
    '</a>'),
  DELETE_ICON_DOCTYPE: new Template(
    '<i data-type="#{dataType}" data-list_id="#{listID}" class="list_delete_row list_decoration clsshort button icon-cross btn" title="#{title}" style="color:#FF402C"></i>'
  ),
  EMBEDDED_LIST_NEW_ICON_DOCTYPE: new Template(
    '<i class="list_edit_image btn icon-edit disabled" title="#{title}">' +
    '<span class="sr-only">#{title}</span>' +
    '</i>'
  ),
  LIST_CHECKBOX_ICON_DOCTYPE: new Template(
    '<span class="input-group-checkbox">' +
    '<input type="checkbox"' +
    '		title="#{title}"' +
    '		id="check_#{listId}_#{row_id}"' +
    '		name="check_#{listId}"' +
    '		class="list_checkbox checkbox"' +
    '		data-type="list2_checkbox"' +
    '		data-list_id="#{listId}" />' +
    '<label class="checkbox-label" for="check_#{listId}_#{row_id}">' +
    '<span class="sr-only">Select record for action</span>' +
    '</label>' +
    '</span>')
};;
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
    var sysId = this._generateId();
    var record = this.changes.addRecord(sysId, "add");
    this.changes.setDefaults(record);
    this._populateFields(record, values, displayValues);
    this.insertRowForRecord(record);
    this.changes.addToAggregates(record);
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
    if (!this.emptyRecord) {
      var sysId = this._generateId();
      this.emptyRecord = this.changes.addEmptyRecord(sysId);
    }
    this.changes.setDefaults(this.emptyRecord);
    this.insertRowForRecord(this.emptyRecord);
    this.decor.showEdit(this.emptyRecord.sysId);
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
      writeTitle(img, this.msgs['Undelete']);
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
        writeTitle(img, this.msgs['Mark deleted']);
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
  _generateId: function() {
    var aj = new GlideAjax("GlideSystemAjax");
    aj.addParam("sysparm_name", "newGuid");
    aj.getXMLWait();
    return aj.getAnswer();
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
  insert: function() {
    var values = {};
    var dspValues = {};
    for (var xname in this) {
      if (this.ignoreNames[xname])
        continue;
      values[xname] = this[xname];
    }
    for (var xname in this.displayValues)
      dspValues[xname] = this.displayValues[xname];
    this.renderer.addRowWithValues(values, dspValues);
  },
  next: function() {
    if (!this.hasNext())
      return false;
    this.currentRow++;
    this._loadRow();
    return true;
  },
  _next: function() {
    return this.next;
  },
  query: function() {
    this._initRows();
    this.currentRow = -1;
    return;
  },
  setDisplayValue: function(fieldName, dsp) {
    this.displayValue[fieldName] = dsp;
    if ('undefined' === typeof this[fieldName])
      this[fieldName] = dsp;
  },
  update: function() {
    var sysId = this._getRowSysId();
    if (!sysId)
      return;
    var record = this.changes.get(sysId);
    if (!record)
      return;
    for (var xname in this) {
      if (this.ignoreNames[xname])
        continue;
      if (xname == 'sys_id')
        continue;
      var val = this[xname];
      var dsp = this.displayValues[xname];
      var field = record.getField(xname);
      if (!field)
        field = record.addField(xname);
      var changed = false;
      if (field.getValue() != val) {
        this.renderer.setValue(sysId, xname, val);
        changed = true;
      }
      if ((typeof dsp != 'undefined') && (field.getDisplayValue() != dsp)) {
        this.renderer.setDisplayValue(sysId, xname, dsp);
        changed = true;
      }
      if (changed)
        this.renderer.renderValue(sysId, xname);
    }
  },
  getRowCount: function() {
    return this.sysIds.length;
  },
  _initRows: function() {
    var receiver = new GwtListEditGlideRecord.RowBuilder();
    this.changes.exportRecords(receiver);
    this.sysIds = receiver.sysIds;
  },
  _loadRow: function() {
    this._clearValues();
    var sysId = this._getRowSysId();
    if (!sysId)
      return null;
    var record = this.changes.get(sysId);
    if (!record)
      return;
    this.sys_id = sysId;
    var fields = record.getFields();
    for (var fname in fields) {
      if (fname.indexOf('.') != -1)
        continue;
      var field = fields[fname];
      this[fname] = field.getValue();
      this.displayValues[fname] = field.getDisplayValue();
    }
  },
  _getRowSysId: function() {
    if ((this.currentRow < 0) || (this.currentRow >= this.sysIds.length))
      return;
    return this.sysIds[this.currentRow];
  },
  _clearValues: function() {
    this.displayValues = {};
    for (var xname in this) {
      if (this.ignoreNames[xname] && this.ignoreNames[xname] == true)
        continue;
      delete this[xname];
    }
  },
  _setIgnoreNames: function() {
    this.ignoreNames = [];
    for (var xname in this) {
      this.ignoreNames[xname] = true;
    }
  },
  toString: function() {
    return 'GwtListEditGlideRecord';
  }
});
GwtListEditGlideRecord.RowBuilder = Class.create(
  GwtListEditorPendingChanges.RecordReceiver, {
    initialize: function($super) {
      $super();
      this.sysIds = [];
    },
    changedRecord: function(sysID, record) {
      if (record.isDeleted())
        return;
      if (record.isDefaultValues())
        return;
      this.sysIds.push(sysID);
    },
    toString: function() {
      return 'GlideListEditor.RowUpdater';
    }
  });;
/*! RESOURCE: /scripts/GlideListEditor.js */
var GlideListEditor = Class.create({
  MSGS: [
    'Mark deleted', 'New row'
  ],
  initialize: function(table) {
    this.tableController = new GwtListEditTableController(table);
    this.changes = new GwtListEditorPendingChanges(this.tableController);
    this.tableController.changes = this.changes;
    this.renderer = new GwtListEditValueRenderer(this.changes, this.tableController);
    this.tableController.renderer = this.renderer;
    this.savePolicy = this.tableController.buildSavePolicy();
    this.gridEdit = new GwtGridEdit(this.tableController);
    this.msgs = getMessages(this.MSGS);
    this.emptyRecord = null;
    this._observeTableEvents();
    if (this.tableController.isFormUI())
      this.changes.loadTable(function() {});
  },
  updateTable: function(tableDOM) {
    if (this.tableController.isForTable(tableDOM))
      return;
    this.tableController.updateTable(tableDOM);
    this.renderer.updateTable();
    this.gridEdit.updateTable();
    this._observeTableEvents();
  },
  unLoadTable: function(tableDOM) {
    this.tableController.unLoadTable(tableDOM);
  },
  _observeTableEvents: function() {
    var policyCallback = this._savePolicy.bind(this);
    this.tableController.observe('glide:list_v2.edit.cells_changed', policyCallback);
    this.tableController.observe('glide:list_v2.edit.focus_moved', policyCallback);
    this.tableController.observe('glide:list_v2.edit.save_now', policyCallback);
    Event.observe(this.tableController.tableElementDOM, 'click', policyCallback);
    this.tableController.observe('glide:list_v2.edit.changes_saved', this._handleChangesSaved.bind(this));
    this.tableController.observe('glide:list_v2.edit.rows_deleted', this._handleRowsDeleted.bind(this));
    this.tableController.observe('glide:list_v2.edit.focus_moved', this._handleFocusMoved.bind(this));
    Event.observe(this.tableController.tableElementDOM, 'glide:list_v2.edit.update_column', this._updateColumn.bind(this));
    Event.observe(this.tableController.tableElementDOM, 'glide:list_v2.edit.check_enter_once', this._checkEnterOnce.bind(this));
    if (window.GlideListEditorMessaging)
      new GlideListEditorMessaging(this);
  },
  createCellEditor: function(element, ignoreTypes) {
    if (!this.tableController.canEdit())
      return null;
    this.gridEdit.hideCursor();
    this.gridEdit.clearRanges();
    this.gridEdit.setAnchorCell(element);
    this.cellEditor = new GwtCellEditor(this.gridEdit, ignoreTypes,
      this.changes, this.tableController, this.renderer);
    return this.cellEditor;
  },
  setCursor: function(element) {
    this.gridEdit.setCursorElement(element);
  },
  _savePolicy: function(evt) {
    this.savePolicy.analyzeEvent(evt);
    if (this.savePolicy.isDirectSave()) {
      this.saveChanges(this._saveComplete.bind(this));
      return;
    }
    if (this.savePolicy.isDeferredSave()) {
      this._fireChangesDeferred();
      this._saveComplete();
      return;
    }
    if (this.savePolicy.isImpliedSave()) {
      this.saveChanges(null);
      return;
    }
  },
  _fireChangesDeferred: function() {
    var info = {
      listId: this.tableController.listID,
      defers: this.savePolicy.getDeferredSaves()
    };
    this.tableController.fire('glide:list_v2.edit.changes_deferred', info);
  },
  _saveComplete: function() {
    var info = {
      listId: this.tableController.listID
    };
    this.tableController.fire('glide:list_v2.edit.saves_completed', info);
    CustomEvent.fire('list_content_changed');
  },
  _handleChangesSaved: function(evt) {
    this.savePolicy.handleChangesSaved(evt);
  },
  _handleRowsDeleted: function(evt) {
    this.savePolicy.handleRowsDeleted(evt);
    this.gridEdit.showCursor();
  },
  _handleFocusMoved: function(evt) {
    if (!this.cellEditor)
      return;
    if (!this.cellEditor.isActive())
      return;
    if (evt.memo.listId !== this.tableController.listID)
      return;
    var cursorCell = this.gridEdit.getCursorCell();
    var anchorCell = this.gridEdit.getAnchorCell();
    if (cursorCell !== anchorCell) {
      this.cellEditor.dismiss();
      GwtListEditor.forPage.edit(cursorCell);
    }
  },
  saveNow: function() {
    var info = {
      listId: this.tableController.listID
    };
    this.tableController.fire('glide:list_v2.edit.save_now', info);
  },
  applyUpdates: function() {
    this.changes.resetAggregates();
    var updater = new GlideListEditor.RowUpdater(this.changes, this.tableController, this.renderer);
    this.changes.exportRecords(updater);
    if (this.tableController.needsInsertRow())
      this.renderer.addRowNoInsert();
  },
  _getRow: function(sysId) {
    return this.tableController.getRow(sysId);
  },
  addRow: function() {
    this.renderer.addRow();
  },
  saveUpdatesInForm: function() {
    addHidden(this._getForm(), this._getXmlIslandName(), this._serializeModified());
  },
  _serializeModified: function() {
    var xml = this._createRecordUpdateXml();
    var selector = new GlideListEditor.IsModifiedRecordSelector(this.changes);
    var receiver = new GlideListEditor.XmlSerializingReceiver(xml, xml.documentElement, selector);
    this.changes.exportChanges(receiver);
    return getXMLString(xml);
  },
  _createRecordUpdateXml: function() {
    var xml = loadXML("<record_update/>");
    this.tableController.exportXml(xml.documentElement);
    return xml;
  },
  _getForm: function() {
    if ((typeof g_form == "undefined") || (!g_form))
      return null;
    return gel(g_form.getTableName() + ".do");
  },
  _getXmlIslandName: function() {
    return "ni.java.com.glide.ui_list_edit.ListEditFormatterAction[" + this.tableController.listID + "]";
  },
  callOnSubmit: function() {
    var retVal;
    var scriptName = "onSubmit_" + this.tableController.listID;
    for (var ndx = 0;
      (ndx < 100) && (retVal != false); ndx++) {
      var f = GlideListEditor.getClientScriptFunc(scriptName, ndx);
      if (f == null)
        break;
      try {
        retVal = f();
      } catch (ex) {}
    }
    return retVal;
  },
  saveChanges: function(onComplete) {
    var saver = new GwtListEditAjaxChangeSaver(this.changes, this.tableController, onComplete);
    saver.save();
  },
  buildGList: function() {
    return new GwtListEditGList(this.changes, this.tableController, this.renderer);
  },
  hasChanges: function() {
    var selector = new GlideListEditor.IsModifiedRecordSelector(this.changes);
    var inspector = new GlideListEditor.ChangeCounter(selector);
    this.changes.inspectRecords(inspector);
    return inspector.isDone();
  },
  deleteRowToggle: function(sysId) {
    this.renderer.deleteRowToggle(sysId);
  },
  getSelectedRows: function() {
    return this.gridEdit.getSelectedRows();
  },
  _updateColumn: function(evt) {
    var columnName = evt.memo.columnName;
    var value = evt.memo.newValue;
    var ids = evt.memo.ids != null ? evt.memo.ids : this.changes.calcWritableSysIds(this.tableController.sysIds, [columnName]);
    var numIds = ids.length;
    for (var i = 0; i < numIds; i++) {
      var id = ids[i];
      if (evt.memo.ids != null || this.changes.emptyRecord == null || this.changes.emptyRecord.sysId != id) {
        this.renderer.setValue(id, columnName, value);
        this.changes.setRenderValue(id, columnName, value);
        if (this.changes.isFieldDirty(id, columnName)) {
          this.renderer.renderValue(id, columnName);
        }
      }
    }
  },
  _checkEnterOnce: function(evt) {
    var properties = evt.memo.properties;
    var answer = [];
    var l = properties.length;
    for (var j = 0; j < l; j++) {
      var p = properties[j];
      var columnName = p.field;
      var ids = evt.memo.ids != null ? evt.memo.ids : this.changes.calcWritableSysIds(this.tableController.sysIds, [columnName]);
      var numIds = ids.length;
      for (var i = 0; i < numIds; i++) {
        var id = ids[i];
        if (this.changes.emptyRecord == null || this.changes.emptyRecord.sysId != id) {
          if (evt.memo.oldValues != null || this.changes.isFieldDirty(id, columnName)) {
            var field = this.changes.getField(id, columnName);
            var originalValue = evt.memo.oldValues != null ? evt.memo.oldValues[i] : field.getOriginalDisplay();
            var currentValue = evt.memo.newValue != null ? evt.memo.newValue : field.getRenderValue();
            var isDirty = p.isDirty(originalValue, currentValue);
            if (isDirty) {
              answer.push({
                sys_id: id,
                name: columnName,
                value: currentValue
              });
            }
          }
        }
      }
    }
    evt.answer = answer;
  },
  toString: function() {
    return 'GlideListEditor';
  }
});

function getQueryForList(listID) {
  var e = gel('sysparm_query');
  if (e)
    return e.value;
  var t = GwtListEditor.getTableElem(listID);
  if (t)
    return getAttributeValue(t, 'glide_list_query') + '';
  return '';
}
GlideListEditor.getClientScriptFunc = function(scriptName, ndx) {
  var n = scriptName + "_" + ndx;
  var f = window[n];
  if (typeof f != "function")
    return null;
  return f;
};
GlideListEditor.RowUpdater = Class.create(
  GwtListEditorPendingChanges.RecordReceiver, {
    initialize: function($super, changes, tableController, renderer) {
      $super();
      this.changes = changes;
      this.tableController = tableController;
      this.renderer = renderer;
      this.hasChanges = false;
    },
    changedRecord: function(sysID, record) {
      if (record.isAdded()) {
        this.hasChanges = true;
        if (this.tableController.getRow(sysID))
          this.renderer.updateRowWithRecord(record);
        else {
          this.renderer.insertRowForRecord(record);
          this.renderer.showViewDecorations(sysID);
          this.changes.addToAggregates(record);
        }
      } else if (record.isUpdated()) {
        this.hasChanges = true;
        this.renderer.updateRowWithRecord(record);
      } else if (record.isDeleted()) {
        this.hasChanges = true;
        this.renderer.updateRowWithRecord(record);
        this.renderer.deleteRowWithRecord(record);
      }
    },
    isChanged: function() {
      return this.hasChanges;
    },
    toString: function() {
      return 'GlideListEditor.RowUpdater';
    }
  });
GlideListEditor.XmlSerializingReceiver = Class.create(
  GwtListEditorPendingChanges.ChangeReceiver, {
    initialize: function($super, doc, dst, selector) {
      $super();
      this.doc = doc;
      this.dst = dst;
      this.selector = selector;
      this.record = null;
    },
    beginRecord: function(sysID, op) {
      if (!this.selector.isSelected(sysID, op))
        return;
      var record = this._createElement("record");
      record.setAttribute("sys_id", sysID);
      record.setAttribute("operation", op);
      this.record = record;
      return true;
    },
    endRecord: function(sysID) {
      if (this.record)
        this.dst.appendChild(this.record);
      this.record = null;
    },
    changedField: function(sysID, info) {
      var node = this._createElement("field");
      this._populateFieldNode(node, info);
      this.record.appendChild(node);
    },
    _populateFieldNode: function(node, info) {
      node.setAttribute('name', info.getName());
      node.setAttribute('modified', info.isModified().toString());
      node.setAttribute('value_set', info.isValueSet().toString());
      node.setAttribute('dsp_set', info.isDisplayValueSet().toString());
      this._appendValueNode(node, 'value', info.value);
      if (info.displaySet)
        this._appendValueNode(node, 'display_value', info.displayValue);
    },
    _createElement: function(name) {
      return this.doc.createElement(name);
    },
    _createTextNode: function(value) {
      return this.doc.createTextNode(value);
    },
    _appendValueNode: function(dst, name, value) {
      if (!value)
        value = '';
      var node = this._createElement(name);
      var text = this._createTextNode(value);
      node.appendChild(text);
      dst.appendChild(node);
    },
    toString: function() {
      return 'GlideListEditor.XmlSerializingReceiver';
    }
  });
GlideListEditor.ChangeCounter = Class.create(
  GwtListEditorPendingChanges.RecordReceiver, {
    initialize: function(selector) {
      this.selector = selector;
      this.changeCount = 0;
    },
    changedRecord: function(sysID, record) {
      if (this.selector.isSelected(sysID, record.operation))
        this.changeCount++;
    },
    isDone: function() {
      return this.changeCount > 0;
    },
    toString: function() {
      return 'GlideListEditor.ChangeCounter';
    }
  });
GlideListEditor.IsModifiedRecordSelector = Class.create({
  initialize: function(changes) {
    this.changes = changes;
  },
  isSelected: function(sysID, op) {
    if (("add" === op) || ("delete" === op) || ("delete_pending" === op) || ("add_existing" === op))
      return true;
    var record = this.changes.get(sysID);
    return record.isModified();
  },
  toString: function() {
    return 'GlideListEditor.IsModifiedRecordSelector';
  }
});;
/*! RESOURCE: /scripts/GlideListAggregates.js */
var GlideListAggregates = Class.create({
  initialize: function(tableController) {
    this.aggregates = {};
    this.tableController = tableController;
    this._initAggregates();
  },
  getAggregate: function(fieldName, type) {
    var agg = this.aggregates[fieldName + ":" + type];
    if (!agg)
      return null;
    return agg;
  },
  getAggregateValue: function(fieldName, type) {
    var agg = this.aggregates[fieldName + ":" + type];
    if (!agg)
      return null;
    return agg.value;
  },
  getAggregateElement: function(fieldName, type) {
    var agg = this.getAggregate(fieldName, type);
    if (!agg)
      return null;
    var td = this.tableController.getCellByNdx(agg.rowNdx, agg.colNdx);
    var spans = td.getElementsByTagName("SPAN");
    for (var spanNdx = 0; spanNdx < spans.length; spanNdx++) {
      var span = spans[spanNdx];
      if (!hasClassName(span, "aggregate_value"))
        continue;
      var aggtype = getAttributeValue(span, "aggregate_type");
      if (aggtype == type)
        return span;
    }
    return null;
  },
  getAggregateFields: function() {
    return this.aggregateFields;
  },
  updateAggregates: function(fieldName, oldValue, newValue) {
    if (oldValue == newValue)
      return;
    this._updateAggregate(fieldName, "MIN", oldValue, newValue);
    this._updateAggregate(fieldName, "MAX", oldValue, newValue);
    this._updateAggregate(fieldName, "SUM", oldValue, newValue);
    this._updateAggregate(fieldName, "AVG", oldValue, newValue, 0);
  },
  addToAggregates: function(fieldName, value) {
    if (value != "") {
      this._updateAggregate(fieldName, "MIN", null, value);
      this._updateAggregate(fieldName, "MAX", null, value);
      this._updateAggregate(fieldName, "SUM", null, value);
    }
    this._updateAggregate(fieldName, "AVG", null, value, 1);
  },
  removeFromAggregates: function(fieldName, value) {
    if (value != "") {
      this._updateAggregate(fieldName, "MIN", value, null);
      this._updateAggregate(fieldName, "MAX", value, null);
      this._updateAggregate(fieldName, "SUM", value, null);
    }
    this._updateAggregate(fieldName, "AVG", value, null, -1);
  },
  rowCountChanged: function(increment) {
    for (var k in this.aggregates)
      this.aggregates[k].rowNdx += increment;
  },
  _initAggregates: function() {
    var fields = {};
    this.aggregateRow = -1;
    this.aggregates = {};
    this.aggregateFields = [];
    var rowCount = this.tableController.getRowCount();
    for (var rowNdx = 0; rowNdx < rowCount; rowNdx++) {
      var row = this.tableController.getRowByNdx(rowNdx);
      if (!hasClassName(row, "aggregate"))
        continue;
      for (var colNdx = 0; colNdx < row.cells.length; colNdx++) {
        var spans = row.cells[colNdx].getElementsByTagName("SPAN");
        for (var spanNdx = 0; spanNdx < spans.length; spanNdx++) {
          var span = spans[spanNdx];
          if (!hasClassName(span, "aggregate_value"))
            continue;
          var type = getAttributeValue(span, "aggregate_type");
          if (!type)
            continue;
          this._addAggregate(fields,
            getAttributeValue(span, "aggregate_field"),
            type,
            getAttributeValue(span, "aggregate_count"),
            getAttributeValue(span, "aggregate_value"),
            rowNdx, colNdx);
        }
      }
    }
  },
  _addAggregate: function(fields, fieldName, type, count, value, rowNdx, colNdx) {
    this.aggregates[fieldName + ":" + type] = {
      type: type,
      count: count,
      value: value,
      rowNdx: rowNdx,
      colNdx: colNdx
    };
    if (!fields[fieldName]) {
      fields[fieldName] = true;
      this.aggregateFields.push(fieldName);
    }
  },
  _updateAggregate: function(fieldName, type, oldValue, newValue, countChange) {
    var agg = this.getAggregate(fieldName, type);
    if (!agg)
      return;
    var aggValue = '';
    if (agg.type == "MIN")
      aggValue = this._updateAggregateMin(agg, oldValue, newValue);
    else if (agg.type == "MAX")
      aggValue = this._updateAggregateMax(agg, oldValue, newValue);
    else if (agg.type == "SUM")
      aggValue = this._updateAggregateTotal(agg, oldValue, newValue);
    else if (agg.type == "AVG")
      aggValue = this._updateAggregateAverage(agg, oldValue, newValue, countChange);
    this._setAggregate(agg, fieldName, type, aggValue, countChange);
  },
  _setAggregate: function(agg, fieldName, type, aggValue, countChange) {
    if (aggValue != null) {
      var aggSpan = this.getAggregateElement(fieldName, type);
      if (!aggSpan)
        return;
      agg.value = aggValue;
      setAttributeValue(aggSpan, "aggregate_value", agg.value);
      if (((type == "SUM") || (type == "AVG")) && agg.value % 1 != 0)
        aggSpan.innerHTML = this._format(agg.value);
      else
        aggSpan.innerHTML = aggValue;
      if (countChange)
        setAttributeValue(aggSpan, "aggregate_count", agg.count);
    }
  },
  _updateAggregateMin: function(agg, oldValue, newValue) {
    if (agg.value == "?")
      return null;
    if ((newValue != null) && (newValue < agg.value))
      return newValue;
    if ((oldValue != null) && (oldValue == agg.value))
      return "?";
    return null;
  },
  _updateAggregateMax: function(agg, oldValue, newValue) {
    if (agg.value == "?")
      return null;
    if ((newValue != null) && (newValue > agg.value))
      return newValue;
    if ((oldValue != null) && (oldValue == agg.value))
      return "?";
    return null;
  },
  _updateAggregateTotal: function(agg, oldValue, newValue) {
    if (!oldValue || isNaN(oldValue))
      oldValue = '0';
    if (!newValue || isNaN(newValue))
      newValue = '0';
    if (isNaN(agg.value))
      return;
    oldValue = new Number(oldValue);
    newValue = new Number(newValue);
    var total = new Number(agg.value);
    total += (newValue - oldValue);
    total = parseFloat(total.toFixed(this._precision(agg.value, oldValue, newValue)));
    return total;
  },
  _precision: function(total, oldValue, newValue) {
    var len = Math.max(this._precisionLength(total), this._precisionLength(oldValue), this._precisionLength(newValue));
    return len;
  },
  _precisionLength: function(value) {
    value = parseFloat(value);
    var precisionLen = "";
    if (value.toString().indexOf(".") >= 0) {
      precisionLen = value.toString().substr(value.toString().indexOf(".") + 1, value.toString().length);
    }
    return precisionLen.length;
  },
  _updateAggregateAverage: function(agg, oldValue, newValue, countChange) {
    if (!oldValue || isNaN(oldValue))
      oldValue = '0';
    if (!newValue || isNaN(newValue))
      newValue = '0';
    if (isNaN(agg.value) || isNaN(agg.count))
      return;
    agg.count = new Number(agg.count);
    var value = new Number(agg.value);
    var total = (value * agg.count);
    agg.count += countChange;
    if (!agg.count)
      return 0;
    oldValue = new Number(oldValue);
    newValue = new Number(newValue);
    total += (newValue - oldValue);
    return this._format(total / agg.count);
  },
  _format: function(num) {
    if (isNaN(num))
      return num;
    return num.toFixed(2);
  },
  resetAggregates: function() {
    this._initAggregates();
  },
  type: 'GlideListAggregate'
});;
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
/*! RESOURCE: /scripts/GwtGridEdit.js */
var GwtGridEdit = Class.create({
  initialize: function(tableController) {
    this.tableController = tableController;
    this.anchor = null;
    this.rec = 0;
    this.col = 0;
    this.editOnInsert = false;
    this.updateTable();
    Event.observe(window, 'resize', this._resize.bind(this));
    CustomEvent.observe("partial.page.reload", this.clearCursor.bind(this));
    CustomEvent.observe("tab.activated", this.clearCursor.bind(this));
    CustomEvent.observe('list.section.toggle', this.clearCursor.bind(this));
  },
  updateTable: function() {
    this.tableController.observeOnBody("keydown", this.keyDown.bind(this));
    this.tableController.observeOnBody("keypress", this.keyPress.bind(this));
    this.tableController.observeOnBody("blur", this.blur.bind(this));
    if (isMSIE)
      this.tableController.observeOnBody("focusout", this.blur.bind(this));
    this.tableController.observe('glide:list_v2.edit.saves_completed', this._handleSavesCompleted.bind(this));
    this.tableController.observe('glide:list_v2.edit.row_added', this._handleRowAdded.bind(this));
    this.cellSelector = this.tableController.buildCellSelector();
  },
  unLoadTable: function() {
    this.cellSelector = null;
  },
  setAnchorCell: function(anchor) {
    this.anchor = $(anchor);
    this.setCursorElement(this.anchor);
  },
  getAnchorCell: function() {
    return this.anchor;
  },
  getAnchorSysId: function() {
    return this.tableController.getSysIdByCell(this.getAnchorCell());
  },
  getAnchorAttribute: function(attribute) {
    return this.tableController.getAttributeByCell(attribute, this.getAnchorCell());
  },
  getAnchorFqFieldName: function() {
    var anchor = this.getAnchorCell();
    var row = this.tableController.getRowByCell(anchor);
    if (row.hasAttribute('data-detail-row'))
      return row.getAttribute('data-detail-row');
    return this.tableController.getNameFromColumn(anchor.cellIndex);
  },
  getAnchorRow: function() {
    return this.tableController.getRowByCell(this.getAnchorCell());
  },
  getAnchorPos: function() {
    return this.tableController.getRecordPos(this.getAnchorRow());
  },
  keyPress: function(evt) {
    if ((evt.keyCode != Event.KEY_TAB) && !this._inEditor())
      return;
    switch (evt.keyCode) {
      case Event.KEY_TAB:
      case Event.KEY_UP:
      case Event.KEY_DOWN:
      case Event.KEY_RIGHT:
      case Event.KEY_LEFT:
        evt.stop();
        break;
    }
  },
  keyDown: function(e) {
    if (e.keyCode == Event.KEY_TAB) {
      var shouldStop = this.tabKey(e);
      if (shouldStop)
        e.stop();
      return;
    }
    if (!this._inEditor())
      return;
    switch (e.keyCode) {
      case Event.KEY_DOWN:
        e.stop();
        if (e.shiftKey)
          this.selectVerticalKey(e, "down");
        else
          this.downArrow(e);
        break;
      case Event.KEY_UP:
        e.stop();
        if (e.shiftKey)
          this.selectVerticalKey(e, "up");
        else
          this.upArrow(e);
        break;
      case Event.KEY_RIGHT:
        e.stop();
        this.moveRight();
        break;
      case Event.KEY_LEFT:
        e.stop();
        this.moveLeft();
        break;
      case Event.KEY_RETURN:
        e.preventDefault();
        if (e.shiftKey || e.ctrlKey)
          break;
        if (this.tableController.isHierarchical())
          e.stop();
        this.editCursor();
        break;
      case Event.KEY_ESC:
        this.clearCursor();
        break;
    }
  },
  blur: function(evt) {
    this.hideCursor();
  },
  editCursor: function() {
    var cursor = this.getCursorCell();
    if (cursor)
      GwtListEditor.forPage.edit(cursor);
  },
  editNextRow: function() {
    if (this.tableController.insertRow && (this.rec >= this.cellSelector.maxRow))
      this.editOnInsert = true;
    else
      this.editOnInsert = false;
    this.downArrow();
    if (!this.editOnInsert)
      this.editCursor();
  },
  selectVerticalKey: function(evt, direction) {
    this.selectVertical(evt, direction, this.rec, this.col);
    if ("down" === direction)
      this._fireMove(this.cellSelector.rowTo, this.col);
    if ("up" === direction)
      this._fireMove(this.cellSelector.rowFrom, this.col);
  },
  downArrow: function() {
    this.clearSelected();
    var rec = this.tableController.getNextRowByPos(this.rec);
    if (!rec)
      return;
    this.rec = rec;
    this._updateCursorCell();
  },
  upArrow: function() {
    this.clearSelected();
    var rec = this.tableController.getPrevRowByPos(this.rec);
    if (!rec)
      return;
    this.rec = rec;
    this._updateCursorCell();
  },
  moveRight: function() {
    this.clearSelected();
    if (this.col + 2 >= this._getMaxCol() || hasClassName(this.getRowByPos(this.rec), 'list_row_detail')) {
      var rec = this.tableController.getNextRowByPos(this.rec);
      if (!rec) {
        var id = this.tableController.listID + '_bottom';
        setTimeout(function() {
          $(id).focus();
        }, 0);
        return false;
      }
      this.rec = rec;
      this.col = isDoctype() ? 2 : 1;
    } else
      this.col++;
    this._updateCursorCell();
    return true;
  },
  moveLeft: function() {
    this.clearSelected();
    if (this.rec == 1 && this.col == 1)
      return false;
    if (isDoctype() && this.rec == 1 && this.col == 2)
      return false;
    if (this.col == 1 || (isDoctype() && this.col == 2)) {
      var rec = this.tableController.getPrevRowByPos(this.rec);
      var maxCol = this._getMaxCol();
      if (!rec)
        return false;
      this.rec = rec;
      this.col = isDoctype() ? maxCol - 2 : maxCol - 1;
    } else
      this.col--;
    this._updateCursorCell();
    return true;
  },
  tabKey: function(e) {
    this.clearSelected();
    if (!this._inEditor()) {
      return false;
    }
    if (e.shiftKey)
      return this.moveLeft();
    else
      return this.moveRight();
  },
  startTableEdit: function() {
    this.col = isDoctype() ? 2 : 1;
    this.rec = 1;
    this._updateCursorCell();
  },
  _inEditor: function() {
    return (this.rec != 0 || this.col != 0);
  },
  _focus: function(e) {
    var parent = getFormContentParent();
    var scroll = this.getViewPosition(parent);
    this.tableController.focusBody();
    this.setViewPosition(parent, scroll);
  },
  getViewPosition: function(parent) {
    var scroll = {
      left: parent.scrollLeft,
      top: parent.scrollTop
    };
    return scroll;
  },
  setViewPosition: function(parent, scroll) {
    if (parent.scrollTop == scroll.top && parent.scrollLeft == scroll.left)
      return;
    parent.scrollTop = scroll.top;
    parent.scrollLeft = scroll.left;
  },
  _updateCursorCell: function() {
    this._fireMove();
    var e = this.getCursorCell();
    if (e == null)
      return;
    this._focus(e);
    this._makeVisible(e);
    this.showCursor();
  },
  setCursorElement: function(element) {
    var row = this.tableController.getRowByCell(element);
    this.rec = this.tableController.getRecordPos(row);
    this.col = element.cellIndex;
    if (hasClassName(row, 'list_row_detail'))
      this.col = 1;
    this._updateCursorCell();
    this.cellSelector.setAnchor(element);
  },
  refreshCursor: function() {
    this._updateCursorCell();
  },
  _makeVisible: function(e) {
    if (!e.visible())
      return;
    var eVP = e.viewportOffset();
    var vp = document.viewport.getDimensions();
    var eViewOffset = this._getElementViewOffset(e);
    var relatedListOffset = 0;
    if (eVP.left > 44 && eViewOffset.right < vp.width && eVP.top > 24 && eViewOffset.bottom < vp.height)
      return;
    var parent = getFormContentParent();
    if (isDoctype())
      if ($j(e).closest('div.custom-form-group').length != 0) {
        parent = $j(e).closest('div.custom-form-group')[0];
        relatedListOffset = 44;
      }
    vp.top = this._headerOffsetTop(parent);
    if (e.getWidth() >= vp.width)
      parent.scrollLeft = eViewOffset.left;
    else if (eVP.left < 44)
      parent.scrollLeft = eViewOffset.left - 44;
    else if (eViewOffset.right > parent.scrollLeft + vp.width)
      parent.scrollLeft = eViewOffset.right - vp.width + relatedListOffset;
    if (isDoctype() && this.col == 2)
      parent.scrollLeft = 0;
    if (e.getHeight() >= vp.height)
      parent.scrollTop = eViewOffset.top;
    else if (eVP.top < (vp.top + 24))
      parent.scrollTop = eViewOffset.top - 24;
    else if (eViewOffset.bottom > parent.scrollTop + vp.height)
      parent.scrollTop = eViewOffset.bottom - vp.height;
  },
  _getElementViewOffset: function(e) {
    var eOffset = e.cumulativeOffset();
    eOffset.right = eOffset.left + e.getWidth() + 17;
    eOffset.bottom = eOffset.top + e.getHeight() + 21;
    return eOffset;
  },
  _headerOffsetTop: function(parent) {
    if (parent == document.body)
      return 0;
    var hdrDiv = $$('.section_header_div_no_scroll');
    var top = 0;
    if (hdrDiv && hdrDiv.length > 0)
      top = hdrDiv[0].getHeight();
    return top;
  },
  getCursorCell: function() {
    return this.tableController.getCellByPos(this.rec, this.col);
  },
  clearCursor: function() {
    this.hideCursor();
    this.rec = 0;
    this.col = 0;
    this.anchor = null;
    this.clearSelected();
  },
  hideCursor: function() {
    GwtListEditor.forPage.cursor.hideCursor();
  },
  showCursor: function() {
    this.hideCursor();
    var e = this.getCursorCell();
    if (e == null)
      return;
    GwtListEditor.forPage.cursor.createCursor(e);
    this.selected = e;
  },
  draw: function() {
    if (this.rec != 0 || this.col != 0)
      this.showCursor();
  },
  _resize: function() {
    if (GwtListEditor.forPage.cursor.isHidden())
      return;
    this.showCursor();
  },
  _fireMove: function(toRec, toCol) {
    var moveRec = (toRec ? toRec : this.rec);
    var rowNdx = this.tableController.getRecordIndex(moveRec);
    var colNdx = (toCol ? toCol : this.col);
    this.fireFocusMoved(rowNdx, colNdx);
  },
  fireFocusMoved: function(toRow, toCol) {
    this.tableController.fireFocusMoved(toRow, toCol);
  },
  _getMaxCol: function() {
    this.cellSelector.getGridInfo();
    return this.cellSelector.maxCol;
  },
  _getMaxRow: function() {
    this.cellSelector.getGridInfo();
    return this.cellSelector.maxRow;
  },
  _handleSavesCompleted: function(evt) {
    if (evt.memo.listId !== this.tableController.listID)
      return;
    this.draw();
  },
  _handleRowAdded: function(evt) {
    if (evt.memo.listId !== this.tableController.listID)
      return;
    this.cellSelector.setMaxRow(this.cellSelector.maxRow + 1);
    this.draw();
    if (this.editOnInsert) {
      this.downArrow();
      this.editCursor();
      this.editOnInsert = false;
    }
  },
  getSelectCount: function() {
    return this.cellSelector.selectCount
  },
  clearSelected: function() {
    this.cellSelector.clearSelected();
  },
  clearRanges: function() {
    this.cellSelector.clearRanges();
  },
  getSelected: function() {
    return this.cellSelector.getSelected();
  },
  selectVertical: function(evt, direction, recPos, cellIndex) {
    this.cellSelector.selectVertical(evt, direction, recPos, cellIndex);
  },
  updateSelectCount: function(amt) {
    this.cellSelector.updateSelectCount(amt);
  },
  getSelectedRows: function() {
    var result = [this.getAnchorPos()];
    var records = this.cellSelector.getSelectedRows();
    for (i = 0; i < records.length; i++) {
      var recPos = records[i];
      var row = this.getRowByPos(recPos);
      if (row && (result.indexOf(row) < 0))
        result.push(row);
    }
    return result;
  },
  getSelectedSysIds: function() {
    var result = [this.getAnchorSysId()];
    var records = this.cellSelector.getSelectedRows();
    for (i = 0; i < records.length; i++) {
      var recPos = records[i];
      var sysId = this.tableController.getSysIDByPos(recPos);
      if (sysId && (result.indexOf(sysId) < 0))
        result.push(sysId);
    }
    return result;
  },
  getSelectedAttributes: function(sysIDs, attribute) {
    var listEd = GwtListEditor.forPage.getListEditor(this.tableController.listID);
    var gList = listEd.buildGList();
    var result = [];
    for (i = 0; i < sysIDs.length; i++)
      result.push(gList.getValue(sysIDs[i], attribute));
    return result;
  },
  getRowByPos: function(recPos) {
    return this.tableController.getRowByPos(recPos);
  },
  toString: function() {
    return 'GwtGridEdit';
  }
});;
/*! RESOURCE: /scripts/GwtListEditGridSelector.js */
var GwtListEditGridSelector = Class.create(GwtCellSelector, {
  initialize: function($super, tableElement) {
    $super(tableElement);
    this.setBeforeSelect(true);
    this.setOnSelect(true);
    this.setSelectColor("#ccccff");
    this.setSelectColumnOnly(true);
    this.setSelectNonContiguous(true);
    this.anchor = null;
    this._clearCellSelection();
  },
  _clearCellSelection: function() {
    this.selectCount = 0;
    this.selectorCol = 0;
    this.selectedCells = {};
  },
  _resetCellSelection: function() {
    this._clearCellSelection();
    this.restoreCellColors();
  },
  _highlightCells: function() {
    this.restoreCellColors();
    for (var key in this.selectedCells) {
      var selection = this._parseKey(key);
      var cell = this.getTableCell(selection.row - 1, selection.col);
      if (cell) {
        addClassName(cell, "list_edit_selected_cell");
        this.returnObjects[key] = cell.id;
      }
    }
  },
  selectVertical: function(e, direction, row, col) {
    e.preventDefault();
    var selectedRow = row + this.selectCount;
    if (direction == "up") {
      if (this.selectCount > 0)
        this._cleanCellSelection(selectedRow, col);
      this.selectCount--;
    } else {
      if (this.selectCount < 0)
        this._cleanCellSelection(selectedRow, col);
      this.selectCount++;
    }
    if (this.selectCount + row <= 0) {
      this.selectCount++;
      return;
    }
    if (this.selectCount > 0) {
      this._setSelectedCells(col, col, row, row + this.selectCount);
      this._drawSelection(col, col, row, row + this.selectCount);
    } else {
      this._setSelectedCells(col, col, row + this.selectCount, row);
      this._drawSelection(col, col, row + this.selectCount, row);
    }
  },
  _cleanCellSelection: function(row, col) {
    delete this.selectedCells[this._buildKey(row, col)];
  },
  handleOnSelect: function(selectedCells) {
    this.originalCell = null;
    for (var key in selectedCells) {
      if (!this.originalCell)
        this.originalCell = this._parseKey(key);
      this.selectedCells[key] = true;
    }
  },
  handleBeforeSelect: function(e) {
    var selectedCellKey = this._getSelectedCellKey(e);
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      this.selectorCol = 0;
      if (!this.selectedCells[selectedCellKey])
        this._resetCellSelection();
      return false;
    }
    if (!this._inAnchorColumn(e)) {
      GwtListEditor.forPage.onSelected(e);
      return true;
    }
    setTimeout(this.clearRanges.bind(this), 0);
    if (e.ctrlKey || e.metaKey)
      return this._addRemoveSelection(selectedCellKey);
    if (e.shiftKey && this.selectedCells[selectedCellKey])
      return;
    this._clearCellSelection();
    return true;
  },
  _addRemoveSelection: function(selectedCellKey) {
    if (this.selectedCells[selectedCellKey]) {
      delete this.selectedCells[selectedCellKey];
      this._draw();
      return false;
    }
    this.selectedCells[selectedCellKey] = true;
    return true;
  },
  clearSelected: function() {
    this.rowTo = 0;
    this.rowFrom = 0;
    this.colTo = 0;
    this.colFrom = 0;
    this._resetCellSelection();
  },
  _setSelectedCells: function($super, colFrom, colTo, rowFrom, rowTo) {
    $super(colFrom, colTo, rowFrom, rowTo);
    this._addToSelection();
  },
  _addToSelection: function() {
    if (this.rowFrom <= 0 || this.rowTo <= 0)
      return;
    for (var row = this.rowFrom; row <= this.rowTo; row++) {
      for (var col = this.colFrom; col <= this.colTo; col++) {
        if (this.selectorCol != 0 && col != this.selectorCol)
          this.clearSelected();
        var key = this._buildKey(row, col);
        this.selectedCells[key] = true;
        this.selectorCol = col;
      }
    }
  },
  _selectAndDrawCells: function(e) {
    e = this.retrieveCellFromNestedDOMElement(e, 'DIV');
    this._selectCells(e);
    this._addToSelection();
    this._drawSelection(this.colFrom, this.colTo, this.rowFrom, this.rowTo);
  },
  _getSelectedCellKey: function(e) {
    var cell = Event.element(e);
    var col = cell.cellIndex;
    var row = this._getRowIndex(cell.parentNode);
    return this._buildKey(row, col);
  },
  getSelected: function() {
    return this.selectedCells;
  },
  updateSelectCount: function(delta) {
    this.selectCount = this.selectCount + delta;
  },
  getSelectedRows: function() {
    var result = [];
    for (var key in this.selectedCells) {
      var recPos = window.g_detail_row && window.g_detail_row_present ? (this._parseKey(key).row * 2) - 1 : this._parseKey(key).row;
      if (result.indexOf(recPos) < 0)
        result.push(recPos);
    }
    return result;
  },
  _parseKey: function(key) {
    var info = key.split(",");
    return {
      col: info[0],
      row: info[1]
    };
  },
  _buildKey: function(row, col) {
    return col + "," + row;
  },
  _inAnchorColumn: function(evt) {
    if (!this.anchor)
      return true;
    var anchorCol = this.anchor.cellIndex;
    var selectCol = Event.element(evt).cellIndex;
    return (anchorCol === selectCol);
  },
  setAnchor: function(anchor) {
    this.anchor = anchor;
  },
  toString: function() {
    return 'GwtListEditGridSelector';
  }
});;
/*! RESOURCE: /scripts/doctype/GwtCursor.js */
var GwtCursor = Class.create({
  initialize: function() {
    this.class = 'list_edit_cursor_cell';
    this.hidden = true;
  },
  isHidden: function() {
    return this.hidden;
  },
  hideCursor: function() {
    var self = this,
      tableCell = $j(document).find('.' + this.class);
    tableCell.each(function() {
      $j(this).removeClass(self.class).addClass('vt');
    });
    this.hidden = true;
  },
  createCursor: function(cell) {
    this.hideCursor();
    $j(cell).addClass(this.class);
    this.hidden = false;
  },
  toString: function() {
    return 'GwtCursor';
  }
});;
/*! RESOURCE: /scripts/GwtListEditor.js */
var GwtListEditor = Class.create({
  initialize: function() {
    this.cellEditor = null;
    this.ignoreTypes = [];
    this._preparedTables = [];
    this._clearListEditorCache();
    CustomEvent.observe("tab.activated", this._onTabActivated.bind(this));
    this.dirtyFormMessage = null;
    this.openEditorMessage = null;
    this.cursor = new GwtCursor();
  },
  edit: function(element) {
    this.savePreviousEditor();
    var cellEditor = this._createCellEditor(element);
    if (cellEditor)
      this.cellEditor = cellEditor;
  },
  _createCellEditor: function(element) {
    var listEditor = this._getListEditorForElement(element);
    if (listEditor)
      return listEditor.createCellEditor(element, this.ignoreTypes);
    else
      return null;
  },
  savePreviousEditor: function() {
    if (!this.cellEditor)
      return;
    if (this.cellEditor.saveAndClose())
      this.cellEditor = null;
  },
  ignoreClick: function(element) {
    if (element.tagName != 'TD')
      return true;
    if (!hasClassName(element, 'vt'))
      return true;
    if (hasClassName(element, 'vt-spacer'))
      return true;
  },
  onClickedAndDisabled: function(e) {
    var element = Event.element(e);
    if (element.tagName == 'DIV' && element.parentNode.tagName == 'TD')
      element = element.parentNode;
    if (this.ignoreClick(element))
      return true;
    var warn = $("list_edit_disabled_warning");
    if (warn)
      warn.remove();
    var msg = getMessage("List editing disabled - to enable, click the gear icon at top of list");
    var imgHTML = '<img id="list_edit_disabled_warning" style="padding-left:2px" src="images/icons/cancel_circle_grey.gif" title="' + msg + '"/>';
    if (element.style.textAlign == "right")
      element.innerHTML = imgHTML + element.innerHTML;
    else
      element.innerHTML = element.innerHTML + imgHTML;
  },
  onSelected: function(e) {
    var element = Event.element(e);
    if (element.tagName == 'DIV' && element.parentNode.tagName == 'TD')
      element = element.parentNode;
    if (this.ignoreClick(element))
      return true;
    var listEditor = this._getListEditorForElement(element);
    if (listEditor)
      listEditor.setCursor(element);
  },
  onTriggerEdit: function(e) {
    var element = Event.element(e);
    var targetTable = $(element.getAttribute('aria-controls'));
    targetTable.down('tbody').focus();
    var listEditor = this._getListEditorForElement(targetTable.down('td'));
    if (listEditor)
      listEditor.gridEdit.startTableEdit();
  },
  onClicked: function(e) {
    var element = Event.element(e);
    if (element.tagName == 'DIV' && element.parentNode.tagName == 'TD')
      element = element.parentNode;
    if (this.ignoreClick(element))
      return true;
    if (e.ctrlKey || e.metaKey) {
      if (GwtListEditWindow.getCellEditWindow())
        this.savePreviousEditor();
      return false;
    }
    this.edit(element);
  },
  onMouseDown: function(e) {
    if (GwtListEditWindow.getCellEditWindow())
      return this.savePreviousEditor();
  },
  setIgnoreTypes: function(types) {
    if (!types)
      this.ignoreTypes = [];
    else
      this.ignoreTypes = types.split(',');
  },
  addRow: function(listID) {
    var listEditor = this._getListEditor(listID);
    if (listEditor)
      listEditor.addRow();
  },
  deleteRowToggle: function(id, listID) {
    var listEditor = this._getListEditor(listID);
    if (listEditor)
      listEditor.deleteRowToggle(id);
  },
  _applyUpdates: function(tableElem) {
    var listID = GwtListEditor.getListId(tableElem);
    var listEditor = this._getListEditor(listID);
    if (!listEditor)
      return;
    listEditor.applyUpdates();
  },
  getListEditor: function(listID) {
    return this._getListEditor(listID);
  },
  clearState: function() {
    this._clearListEditorCache();
  },
  _onLoad: function() {
    this._hookOnBeforeUnload();
    this._onTableLoad();
  },
  _onTableLoad: function() {
    if (!window['g_list_edit_enable_property'])
      return;
    this.setIgnoreTypes(window['g_list_edit_ignore_types']);
    var eventName = this._getClickedEvent();
    var tableElements = $$("TABLE.list_table");
    var sw = new StopWatch();
    for (var i = 0, n = tableElements.length; i < n; i++) {
      if (this._preparedTables.indexOf(tableElements[i]) != -1)
        continue;
      this._prepareTable(tableElements[i], eventName);
      this._preparedTables.push(tableElements[i]);
    }
    sw.jslog("GwtListEditor onTableLoad, tables examined: " + n);
  },
  _getClickedEvent: function() {
    if (g_list_edit_double)
      return "dblclick";
    return "click";
  },
  _prepareTable: function(table, eventName) {
    if (!table.down('tbody'))
      return;
    if (!this._isEditableList(table))
      return;
    if (!window['g_list_edit_enable'] && window['g_list_edit_enable_property']) {
      Event.observe(table, eventName, this.onClickedAndDisabled.bindAsEventListener(this));
      return;
    }
    Event.observe(table, eventName, this.onClicked.bindAsEventListener(this));
    if (g_list_edit_double)
      table.down('tbody').observe("click", this.onSelected.bindAsEventListener(this));
    document.on('click', '.list2-edit-button', this.onTriggerEdit.bindAsEventListener(this));
    Event.observe(table, "mousedown", this.onMouseDown.bindAsEventListener(this));
    this._applyUpdates(table);
  },
  _onPartialLoad: function(targetSpan) {
    this._onTableLoad();
  },
  _unLoad: function() {
    var tableElements = document.getElementsByTagName("table");
    for (var i = 0; i < tableElements.length; i++) {
      var t = tableElements[i];
      if (hasClassName(t, "data_list_table")) {
        this._unLoadTable(t);
      }
    }
    this._clearListEditorCache();
  },
  _unLoadTable: function(tableElem) {
    var listID = GwtListEditor.getListId(tableElem);
    var listEditor = this._getListEditor(listID);
    if (!listEditor)
      return;
    listEditor.unLoadTable(tableElem);
  },
  _getListEditor: function(listID) {
    var table = this._getListEditTable(listID);
    if (!table)
      return null;
    var listEditor = this.listEditorCache[listID];
    if (!listEditor) {
      listEditor = new GlideListEditor(table);
      this.listEditorCache[listID] = listEditor;
      return listEditor;
    }
    listEditor.updateTable(table);
    return listEditor;
  },
  _clearListEditorCache: function() {
    this.listEditorCache = {};
  },
  _getListEditTable: function(listID) {
    var table = GwtListEditor.getTableElem(listID);
    if (!table)
      return null;
    if (!hasClassName(table, "list_table"))
      return null;
    return table;
  },
  _isEditableList: function(e) {
    if (e.tagName != 'TABLE')
      return false;
    if (!hasClassName(e, "list_table"))
      return false;
    var type = e.getAttribute('glide_list_edit_type');
    return type != 'disabled';
  },
  _getListEditorForElement: function(elem) {
    var listID = this._getListIdForCell(elem);
    return this.getListEditor(listID);
  },
  _hasChanges: function() {
    for (var listID in this.listEditorCache) {
      var listEditor = this.listEditorCache[listID];
      if (listEditor.hasChanges())
        return true;
    }
    return false;
  },
  _getFormSubmitted: function() {
    if ('undefined' === typeof g_form)
      return false;
    if (!g_form.submitted)
      return false;
    return g_form.submitted;
  },
  _onBeforeUnload: function() {
    return this._testBeforeUnload();
  },
  isDirty: function() {
    return (null !== this._testBeforeUnload());
  },
  _testBeforeUnload: function() {
    var beingSubmitted = this._getFormSubmitted();
    if (this.chainedUnloadHandler) {
      var chainedResponse = this.chainedUnloadHandler();
      if (chainedResponse)
        return chainedResponse;
    }
    if (beingSubmitted)
      return;
    var message;
    if (this.cellEditor && this.cellEditor.isActive())
      message = this.openEditorMessage;
    else if (this._hasChanges()) {
      message = this.dirtyFormMessage;
    }
    if (!message)
      return;
    setTimeout(function() {
      CustomEvent.fireTop('glide:nav_form_dirty_cancel_stay', window);
    }, 750);
    return message;
  },
  _hookOnBeforeUnload: function() {
    if (!this.dirtyFormMessage)
      return;
    if (window.onbeforeunload)
      this.chainedUnloadHandler = window.onbeforeunload;
    window.onbeforeunload = this._onBeforeUnload.bind(this);
  },
  enableDirtyFormMessages: function() {
    var tableElements = $$("TABLE.list_table");
    if (tableElements && tableElements.length > 0) {
      this.dirtyFormMessage = getMessage("Changes have been made. Continuing will discard the changes.");
      this.openEditorMessage = getMessage("There is a cell editor open on this page. Continuing will discard the changes.");
    }
  },
  _getListIdForCell: function(cell) {
    var table = cell.up('table');
    return GwtListEditor.getListId(table);
  },
  _onTabActivated: function(evt) {
    try {
      if ('string' !== typeof evt)
        return;
      if (!evt.startsWith('tabs2_list_'))
        return;
      var key = evt.substring(0, evt.length - 1);
      var index = evt.substring(evt.length - 1);
      var tabs = $$('div.' + key);
      if (0 === tabs.length)
        return;
      var div = tabs[index - 1];
      if (!div)
        return;
      var divId = div.id;
      if (!divId || divId.length <= 5)
        return;
      var listId = divId.substring(0, divId.length - 5);
      if (this.listEditorCache[listId])
        return;
      var table = GwtListEditor.getTableElem(listId);
      if (!table)
        return;
      this._prepareTable(table, this._getClickedEvent());
    } catch (err) {
      jslog('Tab activation problem ' + err);
    }
  },
  toString: function() {
    return "GwtListEditor";
  }
});
GwtListEditor._getListEditor = function(listID) {
  if (GwtListEditor.forPage)
    return GwtListEditor.forPage.getListEditor(listID);
  else
    return null;
};
GwtListEditor.getTableElem = function(listID) {
  return $(listID + '_table');
};
GwtListEditor.getListId = function(elem) {
  return elem.getAttribute('glide_list_edit_id') + '';
};

function editListRegisterOnSubmit(listID) {
  if (!window['g_list_edit_enable'])
    return;
  if (typeof g_form == 'undefined')
    return;
  if (!g_form)
    return;
  var form = gel(g_form.getTableName() + '.do');
  if (!form)
    return;
  addOnSubmitEvent(form, function() {
    return GwtListEditor._editListOnSubmitWrapper(listID);
  });
}
GwtListEditor._editListOnSubmitWrapper = function(listID) {
  var editor = GwtListEditor._getListEditor(listID);
  if (!editor)
    return;
  g_list = editor.buildGList();
  var result = editor.callOnSubmit();
  g_list = null;
  if (result !== false)
    editor.saveUpdatesInForm();
  return result;
}

function editListWithFormAddRow(listID) {
  GwtListEditor.forPage.addRow(listID);
}

function editListWithFormDeleteRow(id, listID) {
  GwtListEditor.forPage.deleteRowToggle(id, listID);
}

function editListSaveRow(imd) {
  var listID = imd.up('div.list_div').id;
  GwtListEditor._getListEditor(listID).saveNow();
}

function editListSetGlideList(listID) {
  var editor = GwtListEditor._getListEditor(listID);
  if (!editor)
    return;
  g_list = editor.buildGList();
}

function initListEdit() {
  window.GwtListEditor.forPage = new GwtListEditor();
  GwtListEditor.forPage._onLoad();
  addUnloadEvent(GwtListEditor.forPage._unLoad.bind(GwtListEditor.forPage));
  CustomEvent.observe('partial.page.savePreviousEditor', GwtListEditor.forPage.savePreviousEditor.bind(GwtListEditor.forPage));
  CustomEvent.observe('partial.page.reload', GwtListEditor.forPage._onPartialLoad.bind(GwtListEditor.forPage));
  GwtListEditor.forPage.enableDirtyFormMessages();
}
addAfterPageLoadedEvent(initListEdit);;;