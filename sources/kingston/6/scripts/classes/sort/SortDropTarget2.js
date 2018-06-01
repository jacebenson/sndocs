/*! RESOURCE: /scripts/classes/sort/SortDropTarget2.js */
var SortDropTarget = Class.create({
  initialize: function(elemA, dragContainer, sortController, table, sideBorders, justContainer) {
    this.sortController = sortController;
    this.dragContainer = dragContainer;
    this.justContainer = justContainer;
    this.table = table;
    this.currentDummy = null;
    this.targetItemSysID = null;
    this.targetItemInsertLocation = null;
    this.sideBorders = sideBorders;
    this.targetA = new DropTarget(elemA, dragContainer);
    this._addHandler(this.targetA, "dragout", this.removeHighlight.bind(this));
    this._addHandler(this.targetA, "dragover", this.addHighlight.bind(this));
    this._addHandler(this.targetA, "dragdrop", this.handleDrop.bind(this));
    this._addHandler(this.targetA, "greyout", this.handleGreyOut.bind(this));
    this._addHandler(this.targetA, "removegreyout", this.handleRemoveGreyOut.bind(this));
  },
  _addHandler: function(target, handler, func) {
    if (!target.handlers)
      target.handlers = {};
    if (target.handlers[handler])
      target.handlers[handler].stop();
    target.handlers[handler] = target.on(handler, func);
  },
  handleDrop: function(e, draggable) {
    if ($(this.targetA.getElem()).hasClassName("dndTargetHighlight") || (this.targetItemSysID && this.targetItemInsertLocation)) {
      var thisDropTarget = this;
      var selected = ListSelectManager.getInstance().getSelectedItemsOrdered();
      var targetItemSysID = this.targetItemSysID;
      var targetItemInsertLocation = thisDropTarget.targetItemInsertLocation
      var currentDummy = thisDropTarget.currentDummy;
      var callback = function() {
        CustomEvent.fire('list.drop.started');
        thisDropTarget.sortController.processDrop(thisDropTarget.table, currentDummy, selected, targetItemSysID, targetItemInsertLocation);
        ListSelectManager.getInstance().clearSelected();
      }
      if (this.sortController.shouldPromptAboutFilter(this.table, selected)) {
        var message;
        if (selected.length > 1)
          message = getMessage("One or more of the moved items may be removed from the list by the active filter");
        else
          message = getMessage("The moved item may be removed from the list by the active filter");
        this.sortController.promptOK(getMessage("Information"), message, callback);
      } else
        callback();
    }
  },
  getTargetA: function() {
    return this.targetA;
  },
  addHighlight: function(targetA, x, y) {
    var selected = ListSelectManager.getInstance().getSelectedItems();
    var selectedOrdered = ListSelectManager.getInstance().getSelectedItemsOrdered();
    var totalSelected = selectedOrdered.length;
    var selectedRow;
    for (var key in selected) {
      selectedRow = selected[key].dr.getElem();
      break;
    }
    if (!selectedRow)
      return;
    var cell = selectedRow.down("td");
    while (cell)
      cell = cell.next();
    var yCheck = y;
    var xCheck = x;
    if (typeof(window.pageYOffset) == 'number') {
      yCheck -= window.pageYOffset;
      xCheck -= window.pageXOffset;
    } else if (document.body && document.body.scrollTop) {
      yCheck -= document.body.scrollTop;
      xCheck -= document.body.scrollLeft;
    } else if (document.documentElement && document.documentElement.scrollTop) {
      yCheck -= document.documentElement.scrollTop;
      xCheck -= document.documentElement.scrollLeft;
    }
    var tableBodyElem;
    var headElems = this.table.select("thead");
    if (headElems.length > 0) {
      if (headElems.length > 0 && headElems[0].nextSiblings())
        tableBodyElem = headElems[0].nextSiblings()[0];
    } else {
      tableBodyElem = this.table.select("tbody")[0];
    }
    var hasRows = false;
    var added = false;
    var ignore = false;
    var lastRow;
    if (tableBodyElem && !this.justContainer) {
      var tableRows = tableBodyElem.childNodes;
      for (var i = 0; i < tableRows.length; i++) {
        var tableRow = tableRows[i];
        var rowBounds = BoundsUtil.getInstance().getElemBoundsWithScrollOffset(tableRow);
        lastRow = tableRow;
        if (!added) {
          hasRows = true;
          if (yCheck >= rowBounds.top && yCheck <= rowBounds.top + rowBounds.height) {
            if (xCheck > rowBounds.left && xCheck < rowBounds.left + rowBounds.width) {
              var halfHeight = rowBounds.height / 2;
              var mid = rowBounds.top + halfHeight;
              if (tableRow.hasClassName("ui-state-highlight")) {
                added = true;
              } else if (!this._compareIDs(totalSelected, selectedRow, tableRow)) {
                if (selectedOrdered.length > 0 && yCheck < mid && tableRow.previousSiblings().length > 0 && this._compareIDs(totalSelected, tableRow.previousSiblings()[0], selectedRow))
                  ignore = true;
                else if (yCheck >= mid && tableRow.nextSiblings().length > 0 && this._compareIDs(totalSelected, tableRow.nextSiblings()[0], selectedRow))
                  ignore = true;
                if (!ignore) {
                  this._createDummy(tableRow, yCheck, mid);
                  added = true;
                }
              } else {
                ignore = true;
              }
            }
          }
        }
      }
    }
    if (!added && hasRows && this._compareIDs(totalSelected, lastRow, selectedRow))
      ignore = true;
    else if (lastRow && lastRow.hasClassName("ui-state-highlight"))
      lastRow = lastRow.previousSiblings()[0];
    if (!added)
      this.removeDummy();
    if ((!hasRows || !this.currentDummy) && !ignore) {
      if (lastRow) {
        if (BoundsUtil.getInstance().getElemBoundsWithScrollOffset(lastRow).bottom < yCheck) {
          this._createDummy(lastRow, null, null);
        } else if ($(this.targetA.getElem()).hasClassName("dndTargetHighlight")) {
          this.targetItemSysID = null;
          this.targetItemInsertLocation = null;
          $(this.targetA.getElem()).removeClassName("dndTargetHighlight");
        }
      } else {
        this.targetItemSysID = null;
        this.targetItemInsertLocation = null;
        if (!$(this.targetA.getElem()).hasClassName("dndTargetHighlight"))
          $(this.targetA.getElem()).addClassName("dndTargetHighlight");
      }
    } else if ($(this.targetA.getElem()).hasClassName("dndTargetHighlight")) {
      this.targetItemSysID = null;
      this.targetItemInsertLocation = null;
      $(this.targetA.getElem()).removeClassName("dndTargetHighlight");
    }
  },
  _createDummy: function(tableRow, yCheck, mid) {
    var newRow = $(cel("tr"));
    var newCell = $(cel("td"));
    newCell.update("<br/>");
    var colspan = 0;
    var cell = tableRow.down("td");
    while (cell) {
      colspan++;
      cell = cell.next();
    }
    newCell.colSpan = colspan;
    if (this.sideBorders) {
      newRow.style.borderLeft = "1px solid #DDD";
      newRow.style.borderRight = "1px solid #DDD";
    }
    newRow.addClassName("ui-state-highlight");
    newRow.appendChild(newCell);
    this.removeDummy();
    this.targetItemSysID = tableRow.getAttribute("sys_id");
    if (yCheck && mid && yCheck < mid) {
      tableRow.insert({
        before: newRow
      });
      this.targetItemInsertLocation = "before";
    } else if (!yCheck || (mid && yCheck >= mid)) {
      tableRow.insert({
        after: newRow
      });
      this.targetItemInsertLocation = "after";
    }
    this.currentDummy = newRow;
  },
  _compareIDs: function(totalSelected, rowA, rowB) {
    if (totalSelected > 1)
      return false;
    var idA = rowA.getAttribute("id");
    var idB = rowB.getAttribute("id");
    if (!idA || !idB)
      return false;
    if (!idA.endsWith("_clone"))
      idA += "_clone";
    if (!idB.endsWith("_clone"))
      idB += "_clone";
    return idA == idB;
  },
  removeDummy: function() {
    var dummy = this.currentDummy;
    this.currentDummy = null;
    if (dummy && dummy.parentNode) {
      dummy.parentNode.removeChild(dummy);
      this.targetItemSysID = null;
      this.targetItemInsertLocation = null;
    }
  },
  removeHighlight: function() {
    this.removeDummy();
    if ($(this.targetA.getElem()).hasClassName("dndTargetHighlight"))
      $(this.targetA.getElem()).removeClassName("dndTargetHighlight");
  },
  handleGreyOut: function() {},
  handleRemoveGreyOut: function() {}
});;