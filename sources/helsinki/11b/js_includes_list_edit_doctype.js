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
          var exporter = new GwtListEditorPendingChanges.ChangeExport