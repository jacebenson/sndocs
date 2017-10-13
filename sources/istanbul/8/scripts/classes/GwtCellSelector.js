/*! RESOURCE: /scripts/classes/GwtCellSelector.js */
var GwtCellSelector = Class.create({
  initialize: function(tableElement) {
    this.tableElement = tableElement;
    this.setDisable(false);
    this.setSelectColumnOnly(false);
    this.setSelectNonContiguous(false);
    this.setSelectColor("#DFDFDF");
    this.browserColor = null;
    this.setUnselectColor("#FAFAFA");
    this.setCursor("crosshair");
    this.setBorderSize("2px solid black");
    this.onSelect = null;
    this.beforeSelect = null;
    this.selectMultipleColumns = false;
    this.selectMiscCells = false;
    this.isMouseDown = false;
    this.centerCellColVal = 0;
    this.centerCellRowVal = 0;
    this.atCol = 0;
    this.atRow = 0;
    this.colFrom = 0;
    this.colTo = 0;
    this.rowFrom = 0;
    this.rowTo = 0;
    this.maxCol = 0;
    this.maxRow = 0;
    this.selectCount = 0;
    this.returnObjects = new Object();
    this.cellBackgroundXref = new Object();
    this.ignoreColumns = new Object();
    this.ignoreRows = new Object();
    this.getGridInfo()
    Event.observe(this.tableElement, "mousedown", this._dragStart.bind(this));
    this.mouseUpTableListener = this._dragEnd.bindAsEventListener(this);
    this.mouseOverTableListener = this._dragOver.bindAsEventListener(this);
    this.mouseUpDocListener = this._dragCheck.bindAsEventListener(this);
  },
  _draw: function() {
    this._drawSelection(this.colFrom, this.colTo, this.rowFrom, this.rowTo);
  },
  _dragStart: function(e) {
    if (Event.isRightClick(e))
      return;
    if ($("cell_edit_cancel"))
      return;
    if (!this.disableGrid) {
      this.getGridInfo();
      if (this.selectNonContiguous)
        this._contiguousCheck(e);
      if (this.ignoreColumns[Event.element(e).cellIndex] ||
        this.ignoreRows[this._getRowIndex(Event.element(e).parentNode)]) {
        return;
      }
      if (this.beforeSelect) {
        if (!this.handleBeforeSelect(e))
          return;
      }
      if (!this.isSelectColumnOnly)
        this.selectMultipleColumns = e.shiftKey;
      this.isMouseDown = true;
      document.body.style.cursor = this.cursor;
      stopSelection(document.body);
      this._setEpicenter(e);
      this._selectAndDrawCells(Event.element(e));
      Event.observe(this.tableElement, "mouseup", this.mouseUpTableListener);
      Event.observe(this.tableElement, "mouseover", this.mouseOverTableListener);
      Event.observe(document, "mouseup", this.mouseUpDocListener);
      e.preventDefault();
    }
  },
  _dragOver: function(e) {
    if (this.isMouseDown) {
      this._selectAndDrawCells(Event.element(e));
    }
  },
  _dragEnd: function(e) {
    this.returnObjects = new Object();
    this.isMouseDown = false;
    document.body.style.cursor = "default";
    this._selectAndDrawCells(Event.element(e));
    if (this.onSelect) {
      this.handleOnSelect(this.returnObjects);
    }
    restoreSelection(document.body);
    Event.stopObserving(this.tableElement, "mouseup", this.mouseUpTableListener);
    Event.stopObserving(this.tableElement, "mouseover", this.mouseOverTableListener);
    Event.stopObserving(document, "mouseup", this.mouseUpDocListener);
  },
  _dragCheck: function(e) {
    if (this.isMouseDown) {
      try {
        this._dragEnd(e);
      } catch (err) {}
    }
  },
  _contiguousCheck: function(e) {
    if (e.ctrlKey)
      this.selectMiscCells = e.ctrlKey;
    else if (e.metaKey)
      this.selectMiscCells = e.metaKey;
    else
      this.selectMiscCells = false;
  },
  getSelectedObjects: function() {
    return this.returnObjects;
  },
  getColFrom: function() {
    return this.colFrom;
  },
  getColTo: function() {
    return this.colTo;
  },
  getRowFrom: function() {
    return this.rowFrom;
  },
  getRowTo: function() {
    return this.rowTo;
  },
  setIgnoreColumn: function(column) {
    this.ignoreColumns[column] = column;
  },
  setIgnoreRow: function(row) {
    this.ignoreRows[row] = row;
  },
  setSelectColor: function(selectColor) {
    this.selectColor = selectColor;
  },
  setUnselectColor: function(unselectColor) {
    this.unselectColor = unselectColor;
  },
  setCursor: function(cursor) {
    this.cursor = cursor;
  },
  setSelectColumnOnly: function(flag) {
    this.isSelectColumnOnly = flag;
  },
  setDisable: function(flag) {
    this.disableGrid = flag;
  },
  setSelectNonContiguous: function(flag) {
    this.selectNonContiguous = flag;
  },
  setBorderSize: function(size) {
    this.borderSize = size;
  },
  _setSelectedCells: function(colFrom, colTo, rowFrom, rowTo) {
    this.colFrom = colFrom;
    this.colTo = colTo;
    this.rowFrom = rowFrom;
    this.rowTo = rowTo;
  },
  _selectAndDrawCells: function(e) {
    this._selectCells(e);
    this._drawSelection(this.colFrom, this.colTo, this.rowFrom, this.rowTo);
  },
  _selectCells: function(e) {
    this.atColVal = e.cellIndex;
    this.atRowVal = this._getRowIndex(e.parentNode);
    if (this.atColVal <= 0)
      return;
    if (this.atRowVal <= 0)
      return;
    if (this.selectMultipleColumns) {
      if (this.atColVal < this.centerCellColVal) {
        this.colFrom = this.atColVal;
        this.colTo = this.centerCellColVal;
        this._getRowSelection();
        return;
      }
      if (this.atColVal > this.centerCellColVal) {
        this.colFrom = this.centerCellColVal;
        this.colTo = this.atColVal;
        this._getRowSelection();
        return;
      }
    }
    if (this.atColVal == this.centerCellColVal) {
      this.colFrom = this.centerCellColVal;
      this.colTo = this.centerCellColVal;
      this._getRowSelection();
      return;
    }
    if (this.atRowVal < this.centerCellRowVal) {
      this.rowFrom = this.atRowVal;
      this.rowTo = this.centerCellRowVal;
      this._getColSelection();
      return;
    }
    if (this.atRowVal > this.centerCellRowVal) {
      this.rowFrom = this.centerCellRowVal;
      this.rowTo = this.atRowVal;
      this._getColSelection();
      return;
    }
    if (this.atRowVal == this.centerCellRowVal) {
      this.rowFrom = this.centerCellRowVal;
      this.rowTo = this.centerCellRowVal;
      this._getColSelection();
      return;
    }
  },
  _getRowSelection: function() {
    if (this.atRowVal <= this.centerCellRowVal) {
      this.rowFrom = this.atRowVal;
      this.rowTo = this.centerCellRowVal;
    } else {
      this.rowFrom = this.centerCellRowVal;
      this.rowTo = this.atRowVal;
    }
  },
  _getColSelection: function() {
    if (this.selectMultipleColumns) {
      if (this.atColVal < this.centerCellColVal) {
        this.colFrom = this.atColVal;
        this.colTo = this.centerCellColVal;
        return;
      }
      if (this.atColVal > this.centerCellColVal) {
        this.colFrom = this.centerCellColVal;
        this.colTo = this.atColVal;
        return;
      }
    }
    if (this.atColVal == this.centerCellColVal) {
      this.colFrom = this.centerCellColVal;
      this.colTo = this.centerCellColVal;
    }
  },
  _drawSelection: function(colFrom, colTo, rowFrom, rowTo) {
    this._highlightCells(colFrom, colTo, rowFrom, rowTo);
  },
  restoreCellColors: function() {
    for (var key in this.returnObjects) {
      var color = "";
      var cell = key.split(",");
      var e = this.getTableCell(parseInt(cell[1]) - 1, cell[0]);
      removeClassName(e, "list_edit_selected_cell");
    }
    this.returnObjects = new Object();
  },
  _highlightCells: function(colFrom, colTo, rowFrom, rowTo) {
    if (!this.selectMiscCells)
      this.restoreCellColors();
    for (var x = colFrom; x <= colTo; x++) {
      for (var y = rowFrom; y <= rowTo; y++) {
        try {
          var e = this.tableElement.rows[y].cells[x];
          addClassName(e, "list_edit_selected_cell");
          this.returnObjects[x + "," + y] = e.id;
        } catch (err) {}
      }
    }
  },
  _clearAllCells: function() {
    for (var x = 1; x <= this.maxCol; x++) {
      for (var y = 1; y < this.maxRow; y++) {
        try {
          var cell = this.getTableCell(y, x);
          cell.style.backgroundColor = "";
          cell.style.border = "0px";
        } catch (err) {}
      }
    }
  },
  clearRanges: function() {
    try {
      if (ie5)
        document.selection.empty();
      else
        window.getSelection().removeAllRanges();
    } catch (e) {}
  },
  getGridInfo: function() {
    var rows = this.getTableRows();
    this.maxRow = rows.length;
    if (rows.length > 0)
      this.maxCol = rows[0].cells.length;
  },
  setMaxRow: function(max) {
    this.maxRow = max;
  },
  _setEpicenter: function(e) {
    var element = this.retrieveCellFromNestedDOMElement(Event.element(e), 'DIV');
    this.centerCellColVal = element.cellIndex;
    this.centerCellRowVal = this._getRowIndex(element.parentNode);
  },
  handleBeforeSelect: function(e) {},
  retrieveCellFromNestedDOMElement: function(element, tagName) {
    if (element.tagName == tagName && element.parentNode.tagName == 'TD')
      return element.parentNode;
    return element;
  },
  handleOnSelect: function(selectedCells) {},
  setBeforeSelect: function(flag) {
    this.beforeSelect = flag;
  },
  setOnSelect: function(flag) {
    this.onSelect = flag;
  },
  _getRowIndex: function(element) {
    return this.getTableRows().indexOf(element) + 1;
  },
  getTableRows: function() {
    var rows = this.tableElement.rows;
    listRows = [];
    for (var i = 0, n = rows.length; i < n; i++) {
      var row = rows[i];
      if (!hasClassName(row, 'list_row'))
        continue;
      listRows.push(row);
    }
    return listRows;
  },
  getTableCell: function(rowNdx, colNdx) {
    var rows = this.getTableRows();
    if (!rows || !rows[rowNdx])
      return null;
    return rows[rowNdx].cells[colNdx];
  },
  z: null
});;