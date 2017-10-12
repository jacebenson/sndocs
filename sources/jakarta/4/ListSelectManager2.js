/*! RESOURCE: /scripts/classes/listDrag/ListSelectManager2.js */
var ListSelectManager = Class.create({
      instance: null,
      initialize: function() {
        this.currentTable = "";
        this.selectedItems = {};
        this.selectedItemsOrdered = [];
        this.ctrlPressed = false;
        this.shiftPressed = false;
        this.shiftSelectStart = null;
        this.shiftSelectEnd = null;
        $(document.body).on("keydown", this.handleKeyDown.bind(this));
        $(document.body).on("keyup", this.handleKeyUp.bind(this));
      },
      handleKeyDown: function(e) {
        if (navigator.appVersion.indexOf("Mac") != -1) {
          if (e.keyCode == 91)
            this.ctrlPressed = true;
        } else {
          if (e.keyCode == 17)
            this.ctrlPressed = true;
        }
        if (e.keyCode == 16)
          this.shiftPressed = true;
      },
      handleKeyUp: function(e) {
        if (isMSIE || isChrome || isSafari) {
          if (navigator.appVersion.indexOf("Mac") != -1) {
            if (e.keyCode == 91)
              this.ctrlPressed = false;
          } else {
            if (e.keyCode == 17)
              this.ctrlPressed = false;
          }
          if (e.keyCode == 16) {
            this.shiftPressed = false;
            this.shiftSelectStart = null;
            this.shiftSelectEnd = null;
          }
        } else {
          this.ctrlPressed = false;
          this.shiftPressed = false;
          this.shiftSelectStart = null;
          this.shiftSelectEnd = null;
        }
      },
      _ctrlKeyCheck: function(e) {
        return this.ctrlPressed || (navigator.appVersion.indexOf("Mac") != -1 && navigator.userAgent.indexOf("Firefox") != -1 && e.metaKey);
      },
      getDrIndex: function(dr) {
        return dr.dr.getElem().previousSiblings().length;
      },
      processRange: function(drA, drB, operation) {
        var indexA = this.getDrIndex(drA);
        var indexB = this.getDrIndex(drB);
        if (indexA > indexB) {
          var temp = drA;
          var tempIndex = indexA;
          drA = drB;
          indexA = indexB;
          drB = temp;
          indexB = tempIndex;
        }
        var elem = drA.dr.getElem();
        for (var i = indexA; i <= indexB; i++) {
          if (elem.dr && !elem.dr.isDisabled()) {
            if (operation == "remove")
              this._removeItem(elem.dr);
            if (operation == "add")
              this._addItem(elem.dr);
          }
          elem = elem.nextSiblings()[0];
        }
      },
      stillExists: function(dr) {
        var el = dr.dr.getElem();
        var html = document.body.parentNode;
        while (el) {
          if (el === html)
            return true;
          el = el.parentNode;
        }
        return false;
      },
      setDblClickHandler: function(dblClickHandler) {
        this.dblClickHandler = dblClickHandler;
      },
      dblClickItem: function(dr, e) {
        if (this.dblClickHandler)
          this.dblClickHandler(dr, e);
      },
      selectItem: function(dr, forceSelect, e) {
        if (!dr)
          return;
        if (this.shiftPressed) {
          if (!dr.isDisabled()) {
            if (this.currentTable != dr.getTable()) {
              this.clearSelected();
              allRemoved = true;
            }
            if (this.shiftSelectStart && !this.stillExists(this.shiftSelectStart)) {
              this.shiftSelectStart = null;
              this.shiftSelectEnd = null;
            }
            if (this.shiftSelectEnd && !this.stillExists(this.shiftSelectEnd)) {
              this.shiftSelectEnd = null;
            }
            if (!this.shiftSelectStart) {
              this.shiftSelectStart = dr;
              this.currentTable = dr.getTable();
              this._addItem(dr);
              this.setMulti();
              CustomEvent.fire("list.item.selected");
            } else if (dr.getSysID != this.shiftSelectStart.getSysID()) {
              if (this.shiftSelectEnd) {
                this.processRange(this.shiftSelectStart, this.shiftSelectEnd, "remove");
                CustomEvent.fire("list.item.deselected");
              }
              this.shiftSelectEnd = dr;
              this.currentTable = dr.getTable();
              this.processRange(this.shiftSelectStart, this.shiftSelectEnd, "add");
              this.setMulti();
              CustomEvent.fire("list.item.selected");
            }
          }
        } else {
          var ctrlPressed = this._ctrlKeyCheck(e);
          var alreadyPresent = this.selectedItems[dr.getSysID()] != null && !forceSelect;
          var allRemoved = false;
          if ((!ctrlPressed && !forceSelect) || this.currentTable != dr.getTable()) {
            this.clearSelected();
            allRemoved = true;
          }
          if (alreadyPresent) {
            if (!allRemoved)
              this._removeItem(dr);
            this.shiftSelectStart = null;
            this.shiftSelectEnd = null;
            CustomEvent.fire("list.item.deselected");
          } else {
            if (!dr.isDisabled()) {
              this.shiftSelectStart = dr;
              this.currentTable = dr.getTable();
              this._addItem(dr);
              this.setMulti();
              CustomEvent.fire("list.item.selected");
            }
          }
        }
      },
      forceSelectAll: function(containerID) {
        var topRow = null;
        var thisManager = this;
        this.clearSelected();
        $(containerID).select(".list_row").each(function(row) {
          var dr = row.dr;
          if (dr && !dr.isDisabled()) {
            thisManager.shiftSelectStart = dr;
            if (!topRow) {
              topRow = row;
              thisManager.currentTable = dr.getTable();
            }
            dr.addHighlight();
            thisManager.selectedItems[dr.getSysID()] = dr;
            thisManager.selectedItemsOrdered[thisManager.selectedItemsOrdered.length] = dr;
          }
        });
        this.setMulti();
        CustomEvent.fire("list.item.selected");
        return topRow;
      },
      _addItem: function(dr) {
        dr.addHighlight();
        if (!this.selectedItems[dr.getSysID()]) {
          this.selectedItems[dr.getSysID()] = dr;
          this.selectedItemsOrdered[this.selectedItemsOrdered.length] = dr;
        }
      },
      _removeItem: function(dr) {
        dr.removeHighlight();
        delete this.selectedItems[dr.getSysID()];
        var newItemsOrdered = [];
        for (var i = 0; i < this.selectedItemsOrdered.length; i++)
          if (this.selectedItemsOrdered[i].getSysID() != dr.getSysID())
            newItemsOrdered[newItemsOrdered.length] = this.selectedItemsOrdered[i];
        this.selectedItemsOrdered = newItemsOrdered;
      },
      selectMultipleItems: function(items, e) {
          var ctrlPressed = this._ctrlKeyCheck(e);
          if (items && items.length > 0) {
            var presentCount = 0;
            for (var i = 0; i < items.length; i++) {
              if (this.selectedItems[items[i].getSysID()] != null)
                presentCount++;
            }
            var allRemoved = false;
            if (!ctrlPressed || this.currentTable != items[0].getTable()) {
              this.clearSelected();
              allRemoved = true;
            }
            if (presentCount == items.length) {
              if (!allRemoved)
                for (var i = 0; i < items.length; i++) {
                  this._removeItem(items[i]);
                  CustomEvent.fire("list.item.deselected");
                }
            } else {
              this.currentTable = items[0].getTable();
              for (var i = 0; i < items