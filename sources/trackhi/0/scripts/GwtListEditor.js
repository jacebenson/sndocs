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
addAfterPageLoadedEvent(initListEdit);;