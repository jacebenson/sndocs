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
      var recPos = window.g_detail_row ? (this._parseKey(key).row * 2) - 1 : this._parseKey(key).row;
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