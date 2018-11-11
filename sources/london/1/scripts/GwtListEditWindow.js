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
    this.label = editor.tableElement.label;
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
    var srLabel = $j('#sr-container');
    var msgText = document.createTextNode(msgHtml);
    srLabel.prepend(msgText);
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
    var scrollOffset = this._getParentOffset(cell, false);
    if (document.viewport.getDimensions().width >= (editorWidth + viewportLeft))
      return offsetLeft - scrollOffset;
    var drawWidth = editorWidth + 2;
    if (drawWidth <= cell.clientWidth)
      return offsetLeft - scrollOffset;
    return offsetLeft + cell.clientWidth - drawWidth - scrollOffset;
  },
  _getOffsetTop: function(cell) {
    var offsetTop = getOffset(cell, 'offsetTop');
    var viewportTop = cell.viewportOffset().top;
    var editorHeight = this.getHeight();
    var scrollOffset = this._getParentOffset(cell, true);
    if (document.viewport.getDimensions().height >= (editorHeight + viewportTop))
      return offsetTop - scrollOffset;
    var drawHeight = editorHeight + 2;
    if (drawHeight <= cell.clientHeight)
      return offsetTop - scrollOffset;
    return offsetTop + cell.clientHeight - drawHeight - scrollOffset;
  },
  _getParentOffset: function(cell, isTop) {
    var scrollOffset = 0;
    var cellParent = cell.parentNode;
    var inParentContainer = false;
    while (cellParent !== this.container.parentNode) {
      if (isTop)
        scrollOffset += cellParent.scrollTop;
      else
        scrollOffset += cellParent.scrollLeft;
      cellParent = cellParent.parentNode;
      if (cellParent.getAttribute("snListEditContainer"))
        inParentContainer = true;
    }
    if (!inParentContainer)
      scrollOffset = 0;
    return scrollOffset;
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
    cancel.setAttribute('tabindex', '0');
    cancel.setAttribute('role', 'button');
    this.addDecoration(cancel);
    var save = createImage('images/workflow_approved.gifx', this.msgSaveButton, this, this.saveEvent);
    if (this.doctype)
      save = createIcon('btn btn-icon icon-check-circle color-green', this.msgSaveButton, this, this.saveEvent);
    save.id = 'cell_edit_ok';
    save.width = 18;
    save.height = 18;
    save.setAttribute('tabindex', 0);
    save.setAttribute('role', 'button');
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
    if (window.g_accessibility && evt && evt.target && evt.target.id == 'cell_edit_cancel')
      return this.onKeyEsc(evt);
    evt.stop();
    if (this.saveAndClose())
      this._placeCursorReturn(evt);
  },
  onKeyTab: function(evt) {
    if (window.g_accessibility && evt.target) {
      if (evt.shiftKey && (evt.target.id == 'cell_edit_ok' || evt.target.id == 'cell_edit_cancel' ||
          evt.target.getAttribute('role') == 'button'))
        return;
      else if (!evt.shiftKey && evt.target.id != 'cell_edit_cancel')
        return;
    }
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
  setTitle: function($super, html) {
    var label = document.createElement('label');
    var innerLabel = document.createElement('span');
    innerLabel.className = "sr-only";
    innerLabel.id = "sr-container";
    var text = document.createTextNode(this.label);
    innerLabel.appendChild(text);
    label.appendChild(innerLabel);
    var inner = document.createElement('div');
    if (typeof html == 'string')
      inner.innerHTML = html;
    else
      inner.appendChild(html);
    label.appendChild(inner);
    $super(label);
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