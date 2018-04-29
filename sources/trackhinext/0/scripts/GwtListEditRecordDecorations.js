/*! RESOURCE: /scripts/GwtListEditRecordDecorations.js */
var GwtListEditRecordDecorations = Class.create({
  MSGS: [
    'Insert a new row...',
    'Mark record for List Action',
    'View',
    'Save',
    'Delete',
    'Delete row',
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
      ariaLabel: this.msgs['Delete row'],
      listID: this.tableController.listID,
      dataType: "list2_delete_row",
      tabindex: 0
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
  SPACER_ICON: '<img width="0" aria-hidden="true" height="16" src="images/s.gifx" class="clsshort button">',
  NEW_ICON: new Template(
    '<img src="images/new_row.gifx" width="12" height="12" class="clsshort button" title="#{title}"></img>'),
  SAVE_ICON: new Template(
    '<img icon_type="save" src="images/save.pngx" width="16" height="16" class="clsshort button list_decoration" title="#{title}"' +
    'onclick="editListSaveRow(this);" ></img>'),
  EMBEDDED_MODIFIED_POPUP_ICON: new Template(
    '<a href="#{href}" tabindex="0">' +
    '<img icon_type="save" data-type="#{dataType}" data-list_id="#{listID}" class="list_popup list_decoration" title="#{title}" src="images/icons/hover_icon_dirty.gifx" height="16" width="16">' +
    '</a>'),
  EMBEDDED_LIST_NEW_ICON: new Template('<img src="images/dirty.gifx" tabindex="0" width="16" height="16" class="clsshort button list_decoration" title="#{title}" ></img>'),
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
    '<a href="#{table}.do?sys_id=#{row_id}&amp;sysparm_view=&amp;sysparm_record_target=#{table}&amp;sysparm_record_list=" tabindex="0">' +
    '<img class="list_popup list_decoration" title="#{title}" src="images/icons/hover_icon.gifx" height="12" width="12">' +
    '</a>'),
  EMBEDDED_EDIT_ICON: new Template(
    '<img width="12" height="12" class="list_edit_image" title="#{title}" tabindex="0" src="images/list_edit.pngx" aria-label=""/>'
  ),
  EMBEDDED_EDIT_ICON_DOCTYPE: new Template(
    '<i class="list_edit_image icon-add btn disabled" tabindex="0" title="#{title}">' +
    '<span class="sr-only">#{title}</span>' +
    '</i>'
  ),
  EMBEDDED_POPUP_ICON_DOCTYPE: new Template(
    '<a href=#{table}.do?sys_id=#{row_id}&amp;sysparm_view=&amp;sysparm_record_target=#{table}&amp;sysparm_record_list=" tabindex="0" class="btn btn-icon icon-info list_popup" data-type="list2_popup" data-list_id="$[sysparm_list_id]" title="#{title}" style="margin-left:0px">' +
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
    '<i role="button" data-type="#{dataType}" data-list_id="#{listID}" aria-label="#{ariaLabel}" class="list_delete_row list_decoration clsshort button icon-cross btn" title="#{title}" style="color:#FF402C" tabindex="0"></i>'
  ),
  EMBEDDED_LIST_NEW_ICON_DOCTYPE: new Template(
    '<i class="list_edit_image btn icon-edit disabled" title="#{title}" tabindex="0">' +
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