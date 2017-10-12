/*! RESOURCE: /scripts/classes/sort/ListSortDual2.js */
var ListSortDual = Class.create({
      initialize: function(leftContainerID, rightContainerID, leftListID, rightListID, topTarget, target, leftSysParms, rightSysParms, leftScrollContainerID, rightScrollContainerID, leftSuffix, rightSuffix) {
        this.leftSuffix = leftSuffix;
        this.rightSuffix = rightSuffix;
        this.dropInClickedOrder = false;
        this.differentIDs = true;
        this.leftContainerID = leftContainerID;
        this.rightContainerID = rightContainerID;
        this.leftListID = leftListID;
        this.rightListID = rightListID;
        this.topTarget = topTarget;
        this.target = target;
        this.leftSysParms = leftSysParms;
        this.rightSysParms = rightSysParms;
        this.leftScrollContainerID = leftScrollContainerID;
        this.rightScrollContainerID = rightScrollContainerID;
        var thisListSortDual = this;
        GlideList2.prototype.onLoad = function() {
          thisListSortDual.processListLoad();
          thisListSortDual.clearFilterDiv(this);
        };
        this.partialLoadHandler = function(table, list) {
          if (list.listID == thisListSortDual.leftListID || list.listID == thisListSortDual.rightListID) {
            thisListSortDual.processListLoad();
            thisListSortDual.clearFilterDiv(list);
          }
        };
        this.refreshCallback = function() {
          var list = GlideList2.get(thisListSortDual.leftListID);
          list.setSubmitValue("sysparm_order", thisListSortDual.leftIndexColumn);
          list.setSubmitValue("sysparm_order_direction", "");
          list.refresh();
          list = GlideList2.get(thisListSortDual.rightListID);
          list.setSubmitValue("sysparm_order", thisListSortDual.rightIndexColumn);
          list.setSubmitValue("sysparm_order_direction", "");
          list.refresh();
        };
        CustomEvent.observe("partial.page.reload", this.partialLoadHandler);
      },
      setFormDetails: function(title, table, container, view, openCallback) {
        this.formDetails = {
          title: title,
          table: table,
          container: container,
          view: view,
          callback: this.refreshCallback,
          openCallback: openCallback
        };
      },
      clearFilterDiv: function(list) {
        var listName = list.listName;
        var filterDiv = $(listName + "filterdiv");
        list.filterQueryPrefix = listName;
        if (filterDiv) {
          var e = $(listName + "_pin");
          if (e && e.src.indexOf("images/pinned.png") > -1) {
            for (var key in GlideListWidgets) {
              var widget = GlideListWidgets[key];
              if (widget.listID && widget.listID == list.listID && widget.type == "GlideWidgetFilter")
                widget._loadFilter(filterDiv);
            }
          } else
            filterDiv.setAttribute("gsft_empty", "true");
        }
      },
      unload: function() {
        CustomEvent.un('partial.page.reload', this.partialLoadHandler);
        CustomEvent.un('list.item.selected', this.selectionChangeCallback);
        CustomEvent.un('list.item.deselected', this.selectionChangeCallback);
      },
      setLeftParms: function(leftSysParms) {
        this.leftSysParms = leftSysParms;
      },
      setRightParms: function(rightSysParms) {
        this.rightSysParms = rightSysParms;
      },
      setLeftParentDetails: function(id, table, indexColumn) {
        this.leftParentID = id;
        this.leftParentTable = table;
        this.leftIndexColumn = indexColumn;
        this.differentIDs = this.rightParentID != this.leftParentID;
      },
      setRightParentDetails: function(id, table, indexColumn) {
        this.rightParentID = id;
        this.rightParentTable = table;
        this.rightIndexColumn = indexColumn;
        this.differentIDs = this.rightParentID != this.leftParentID;
      },
      promptOK: function(title, message, callback) {
        SortUtil.getInstance().promptOK(this.topTarget, this.target, title, message, callback);
      },
      _commitChanges: function(parentID, parentTable, sysIDs, targetSysID, targetInsertLocation, sysParms, sourceParentTable) {},
      shouldPromptAboutFilter: function(table, selected) {
        return false;
      },
      processDrop: function(table, target, selected, targetSysID, targetInsertLocation) {
        var sourceParentTable = "";
        if (selected[0].dr.getElem().up("[id='" + this.leftListID + "_table" + "']"))
          sourceParentTable = this.leftParentTable;
        if (selected[0].dr.getElem().up("[id='" + this.rightListID + "_table" + "']"))
          sourceParentTable = this.rightParentTable;
        if (!this.dropInClickedOrder)
          selected = SortUtil.getInstance().getSelectedOrdered(selected);
        var sysIDs = SortUtil.getInstance().getSysIDArray(selected, function(elem, sysID) {});
        if (this.leftListID + "_table" == table.getAttribute("id"))
          this._commitChanges(this.leftParentID, this.leftParentTable, sysIDs, targetSysID, targetInsertLocation, this.leftSysParms, sourceParentTable);
        else if (this.rightListID + "_table" == table.getAttribute("id"))
          this._commitChanges(this.rightParentID, this.rightParentTable, sysIDs, targetSysID, targetInsertLocation, this.rightSysParms, sourceParentTable);
      },
      processListLoad: function() {
        if (this.processingDialog) {
          this.processingDialog._onCloseClicked();
          Utility.getInstance().hideBackground("sort_submit");
        }
        this.setupDND();
        SortUtil.getInstance().prepareList(this.leftContainerID, null, this.formDetails);
        SortUtil.getInstance().prepareList(this.rightContainerID, null, this.formDetails);
        SortUtil.getInstance().processListLoad(this.leftScrollContainerID, this.rightScrollContainerID);
        this.prepareBothTransferButtons();
        this.onListLoad();
        this.prepareBothDragAll();
      },
      onListLoad: function() {},
      prepareTransferButton: function(idPart, listID) {
        var thisListSortDual = this;
        var button = $(idPart + "ContentTransferButton");
        button.setAttribute("enabled", "false");
        button.style.visibility = "hidden";
        if (button) {
          if (button.handler)
            button.handler.stop();
          if (this.differentIDs && SortUtil.getInstance().getEnabled(listID) > 0) {
            var selected = ListSelectManager.getInstance().getSelectedItemsOrdered();
            if (selected.length > 0 && $(selected[0].table).up(".contentDiv").getAttribute("id").indexOf(idPart) == 0) {
              Utility.getInstance().removeStyleProperty(button, "visibility");
              button.setAttribute("enabled", "true");
              button.handler = button.on("click", function() {
                var selected = ListSelectManager.getInstance().getSelectedItemsOrdered();
                var sourceParentTable = "";
                if (!thisListSortDual.dropInClickedOrder)
                  selected = SortUtil.getInstance().getSelectedOrdered(selected);
                var sysIDs = SortUtil.getInstance().getSysIDArray(selected, function(elem, sysID) {});
                if (selected[0].dr.getElem().up("[id='" + thisListSortDual.leftListID + "_table" + "']")) {
                  sourceParentTable = thisListSortDual.leftParentTable;
                  thisListSortDual._commitChanges(thisListSortDual.rightParentID, thisListSortDual.rightParentTable, sysIDs, '', '', thisListSortDual.rightSysParms, sourceParentTable);
                } else if (selected[0].dr.getElem().up("[id='" + thisListSortDual.rightListID + "_table" + "']")) {
                  sourceParentTable = thisListSortDual.rightParentTable;
                  thisListSortDual._commitChanges(thisListSortDual.leftParentID, thisListSortDual.leftParentTable, sysIDs, '', '', thisListSortDual.leftSysParms, sourceParentTable);
                }
                ListSelectManager.getInstance().clearSelected();
              });
            }
          }
        }
        if (!button.selectHandlerCreated) {
          button.selectHandlerCreated = true;
          var callback = function() {
            button.listSortDual.prepareBothTransferButtons();
          };
          CustomEvent.observe("list.item.deselected", callback);
          CustomEvent.observe("list.item.selected", callback);
        }
        button.listSortDual = this;
      },
      prepareBothTransferButtons: function() {
        this.prepareTransferButton("left", this.leftListID);
        this.prepareTransferButton("right", this.rightListID);
        var rightButton = $("rightContentTransferButton");
        var leftButton = $("leftContentTransferButton");
        var rightButtonEnabled = rightButton.getAttribute("enabled") == "true";
        var leftButtonEnabled = leftButton.getAttribute("enabled") == "true";
        if (!leftButtonEnabled && !rightButtonEnabled) {
          Utility.getInstance().removeStyleProperty(leftButton, "display");
          Utility.getInstance().removeStyleProperty(rightButton, "display");
        } else if (leftButtonEnabled) {
          Utility.getInstance().removeStyleProperty(leftButton, "display");
          rightButton.style.display = "none";
        } else if (rightButtonEnabled) {
          Utility.getInstance().removeStyleProperty(rightButton, "display");
          leftButton.style.display = "none";
        }
      },
      isDragDisabled: function() {
        return false;
      },
      prepareBothDragAll: function() {
        this.prepareDragAll(this.leftContainerID, "left", this.leftSuffix);
        this.prepareDragAll(this.rightContainerID, "right", this.rightSuffix);
      },
      prepareDragAll: function(containerID, side, type) {
          var container = $(containerID);
          if (!container.dragCell) {
            container.dragCell = ListDraggableRow.createRawDragDiv(true, getMessage("Drag all"));
            $(side + "DragAllCell" + type).appendChild(container.dragCell);
            Event.observe(container.dragCell, "mousedown", function(e) {
                  var topRow;
                  $(containerID).select(".list_row").each(function(row) {
                    if (!topRow && row.dr)
                      topRow = row;
                    ListSelectManager.getInstance().selectItem(row.dr, true, new Object());
                  });
                  SortDraggable.modY = (BoundsUtil.getInstance().getElemBounds(container.dragCell).top - BoundsUtil.getInstance().getElemBounds(topRow).top) -
                    (BoundsUtil.getInstance().getElemBounds(topRow).height