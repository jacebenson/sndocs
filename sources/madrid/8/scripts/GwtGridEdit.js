/*! RESOURCE: /scripts/GwtGridEdit.js */
var GwtGridEdit = Class.create({
  initialize: function(tableController) {
    this.tableController = tableController;
    this.anchor = null;
    this.rec = 0;
    this.col = 0;
    this.editOnInsert = false;
    this.iconIndex = null;
    this.updateTable();
    Event.observe(window, 'resize', this._resize.bind(this));
    CustomEvent.observe("partial.page.reload", this.clearCursor.bind(this));
    CustomEvent.observe("tab.activated", this.clearCursor.bind(this));
    CustomEvent.observe('list.section.toggle', this.clearCursor.bind(this));
  },
  updateTable: function() {
    this.tableController.observeOnBody("keydown", this.keyDown.bind(this));
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
  handleAnchorClick: function(e) {
    if (!this._inEditor())
      return;
    if (!(e.layerX < 0 && e.layerY < 0))
      return;
    e.preventDefault();
    if (e.shiftKey || e.ctrlKey)
      return;
    if (this.tableController.isHierarchical())
      e.stop();
    this.editCursor();
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
      case 32:
        this.tableController.openContextMenu(e.target, e);
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
    var getIcons = function(_this) {
      return _this.tableController.getCellByNdx(_this.rec, 0).getElementsByTagName('i');
    };
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
      this.col = 0;
      var icons = getIcons(this);
      if (icons.length > 0) {
        for (var i = 0; i < icons.length; i++) {
          if (!icons[i].hasClassName('disabled')) {
            this.iconIndex = i;
            if (!icons[i].getAttribute('aria-label'))
              icons[i].setAttribute('aria-label', icons[i].getAttribute('data-original-title') || icons[i].getAttribute('title'));
            icons[i].focus();
            return true;
          }
        }
      }
      this.col = isDoctype() ? 2 : 1;
    } else if (this.col == 0) {
      if (this.iconIndex !== null) {
        var icons = getIcons(this);
        if (this.iconIndex < icons.length - 1) {
          for (var i = this.iconIndex + 1; i < icons.length; i++) {
            if (!icons[i].hasClassName('disabled')) {
              this.iconIndex = i;
              if (!icons[i].getAttribute('aria-label'))
                icons[i].setAttribute('aria-label', icons[i].getAttribute('data-original-title') || icons[i].getAttribute('title'));
              icons[i].focus();
              return true;
            }
          }
        }
      }
      if (!this.tableController.getPrevRowByPos(this.rec) && this.iconIndex == null) {
        this.col = 0;
        this._updateCursorCell();
        var icons = getIcons(this);
        for (var i = 0; i < icons.length; i++) {
          if (!icons[i].hasClassName('disabled')) {
            this.iconIndex = i;
            if (!icons[i].getAttribute('aria-label'))
              icons[i].setAttribute('aria-label', icons[i].getAttribute('data-original-title') || icons[i].getAttribute('title'));
            icons[i].focus();
            return true;
          }
        }
        this.iconIndex = null;
      } else
        this.col = isDoctype() ? 2 : 1;
    } else
      this.col++;
    this._updateCursorCell();
    return true;
  },
  moveLeft: function() {
    this.clearSelected();
    var getIcons = function(_this) {
      return _this.tableController.getCellByNdx(_this.rec, 0).getElementsByTagName('i');
    };
    if (this.col == 0) {
      if (this.iconIndex !== null) {
        if (this.iconIndex != 0) {
          var icons = getIcons(this);
          for (var i = this.iconIndex - 1; i >= 0; i--) {
            if (!icons[i].hasClassName('disabled')) {
              this.iconIndex = i;
              if (!icons[i].getAttribute('aria-label'))
                icons[i].setAttribute('aria-label', icons[i].getAttribute('data-original-title') || icons[i].getAttribute('title'));
              icons[i].focus();
              return true;
            }
          }
        }
        this.iconIndex = null;
        var rec = this.tableController.getPrevRowByPos(this.rec);
        var maxCol = this._getMaxCol();
        if (!rec)
          return false;
        this.rec = rec;
        this.col = isDoctype() ? maxCol - 2 : maxCol - 1;
        this._updateCursorCell();
        return true;
      } else {
        var rec = this.tableController.getPrevRowByPos(this.rec);
        var maxCol = this._getMaxCol();
        if (!rec)
          return false;
        this.rec = rec;
        this.col = isDoctype() ? maxCol - 1 : maxCol;
        this._updateCursorCell();
      }
    }
    if (this.col == 1 || (isDoctype() && this.col == 2)) {
      var icons = getIcons(this);
      if (icons.length > 0) {
        this.col = 0;
        this._updateCursorCell;
        for (i = icons.length - 1; i >= 0; i--) {
          if (!icons[i].hasClassName('disabled')) {
            this.iconIndex = i;
            if (!icons[i].getAttribute('aria-label'))
              icons[i].setAttribute('aria-label', icons[i].getAttribute('data-original-title') || icons[i].getAttribute('title'));
            icons[i].focus();
            return true;
          }
        }
      }
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
    this.tableController.setCaption('edit');
  },
  _inEditor: function() {
    return (this.rec != 0 || this.col != 0);
  },
  _focus: function(e) {
    var parent = getFormContentParent();
    var scroll = this.getViewPosition(parent);
    e.tabIndex = 0;
    e.focus();
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
    this.iconIndex = null;
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
    var previousVisible = document.querySelector('[gwt-make-visible]');
    if (previousVisible) {
      previousVisible.removeAttribute('gwt-make-visible');
    }
    e.setAttribute('gwt-make-visible', true);
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
    this.tableController.setCaption('read');
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