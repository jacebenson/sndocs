/*! RESOURCE: /scripts/classes/sort/ListSortWindow2.js */
var ListSortWindow = Class.create({
  initialize: function() {
    this.dropInClickedOrder = false;
    this.scratchPadItems = {};
    this.scratchPadItemDrs = {};
  },
  promptOK: function(title, message, callback) {
    SortUtil.getInstance().promptOK(this.template, "window." + this.template, "prompt_window", title, markup, "sort_prompt", false);
  },
  _commitChanges: function(sysIDs, targetSysID, targetInsertLocation) {
    this.processingDialog = SortUtil.getInstance().createDialog(this.template, "window." + this.template, "processing_window", getMessage("Processing"), "<br/><table style='width: 100%'><tr><td style='text-align: center'>Processing changes</td></tr></table><br/>", "sort_submit", true);
    var thisSortWindow = this;
    SortUtil.getInstance().commitChanges(sysIDs, targetSysID, targetInsertLocation, function() {
      var list = GlideList2.get(thisSortWindow.listID);
      list.setSubmitValue("sysparm_order", thisSortWindow.sysParms["sysparm_index_column"]);
      list.setSubmitValue("sysparm_order_direction", "");
      list.refresh();
    }, this.sysParms, this.sourceContainerID, this.targetContainerID, function() {
      var list = GlideList2.get(thisSortWindow.listID);
      list.setSubmitValue("sysparm_order", thisSortWindow.sysParms["sysparm_index_column"]);
      list.setSubmitValue("sysparm_order_direction", "");
      list.refresh();
    });
  },
  sortAllBySpecificColumn: function(column) {},
  shouldPromptAboutFilter: function(table, selected) {
    return false;
  },
  processDrop: function(table, target, selected, targetSysID, targetInsertLocation) {
    if (!this.dropInClickedOrder)
      selected = SortUtil.getInstance().getSelectedOrdered(selected);
    if (this.listID + "_table" == table.getAttribute("id")) {
      var thisSortWindow = this;
      var sysIDs = SortUtil.getInstance().getSysIDArray(selected, function(elem, sysID) {
        if (thisSortWindow.scratchPadItems[sysID]) {
          elem.parentNode.removeChild(elem);
          thisSortWindow.scratchPadItemDrs[sysID] = null;
          thisSortWindow.scratchPadItems[sysID] = null;
        }
      });
      var count = 0;
      for (var key in this.scratchPadItems)
        if (this.scratchPadItems[key])
          count++;
      if (count == 0)
        $(this.targetTableID).style.display = "none";
      if (targetSysID && targetInsertLocation)
        this._commitChanges(sysIDs, targetSysID, targetInsertLocation);
    } else {
      for (var i = 0; i < selected.length; i++) {
        var dr = selected[i];
        var sysID = dr.getSysID();
        if (!this.scratchPadItems[sysID]) {
          this.scratchPadItemDrs[sysID] = dr;
          var clone = GlideList2.get(this.listID).getRow(sysID).clone(true);
          this.scratchPadItems[sysID] = clone;
          clone.setAttribute("id", clone.getAttribute("id") + "_clone");
          clone.removeClassName("dndHighlightItem");
          if (target)
            target.insert({
              before: clone
            });
          else
            $(this.targetTableID).select("TBODY")[0].appendChild(clone);
          if (!isMSIE7) {
            $("scratch_pad_table").style.borderLeft = "1px solid #DDD";
            $("scratch_pad_table").style.borderRight = "1px solid #DDD";
          }
          dr.disable();
        } else if (dr.dr.getElem().getAttribute("id").endsWith("_clone")) {
          var elem = dr.dr.getElem();
          elem.parentNode.removeChild(elem);
          if (target)
            target.insert({
              before: elem
            });
          else
            $(this.targetTableID).select("TBODY")[0].appendChild(elem);
        }
        if (isMSIE6)
          $(this.targetTableID).style.display = "";
        else
          $(this.targetTableID).style.display = "table";
      }
    }
    this.handleListSelectionChange();
    this.sortScratchPadZebra();
    this.setupDND();
  },
  sortScratchPadZebra: function() {
    var flip = false;
    $(this.targetTableID).select("tr").each(function(row) {
      if (row.hasClassName("list_row")) {
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
      }
    });
  },
  sortScratchPadByColumn: function(column) {
    var fields = GlideList2.get(this.listID).fields.split(",");
    var index = -1;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i] == column) {
        index = i;
        break;
      }
    }
    var list = [];
    var parentNode;
    var row = $(this.targetTableID).down("tr");
    while (row) {
      var cell = row.select("td")[0].nextSiblings()[index];
      var obj = new Object();
      obj.row = row;
      if (document.all)
        obj.value = cell.innerText;
      else
        obj.value = cell.textContent;
      parentNode = row.parentNode;
      list[list.length] = obj;
      row = row.next();
    };
    if (parentNode) {
      var sortedList = list.sortBy(function(item) {
        return item.value;
      });
      for (var i = 0; i < sortedList.length; i++)
        parentNode.removeChild(sortedList[i].row);
      for (var i = 0; i < sortedList.length; i++)
        parentNode.appendChild(sortedList[i].row);
    }
    this.sortScratchPadZebra();
  },
  openSortWindowWithParams: function(title, contextId, contextColumn, contextTable, recordTable, indexColumn, attributes, theList) {
    document.onselectstart = function() {
      return false;
    };
    document.body.onselectstart = function() {
      return false;
    };
    var params = {};
    params['sysparm_context_id'] = contextId;
    params['sysparm_context_column'] = contextColumn;
    params['sysparm_context_table'] = contextTable;
    params['sysparm_table'] = recordTable;
    params['sysparm_index_column'] = indexColumn;
    params['sysparm_attributes'] = attributes;
    params['sysparm_source_query'] = theList.getQuery();
    this.openSortWindow(document.body, params, title,
      function() {
        document.onselectstart = function() {
          return true;
        };
        document.body.onselectstart = function() {
          return true;
        };
        Utility.getInstance().hideBackground();
        theList.refresh();
      },
      $(theList.listID + '_table').up('.section_header_body_no_scroll') != null, true, true);
  },
  openSortWindow: function(containerId, sysParms, title, closeFunc, useBodyWindow, useSynchBackFunc, disableRowAdd) {
    Draggable.startDisabled = false;
    if (disableRowAdd)
      for (var key in GlideLists2)
        GlideLists2[key].disableRowAdd = true;
    sysParms['sysparm_view'] = "ranking";
    this.scratchPadItems = {};
    this.scratchPadItemDrs = {};
    this.containerId = containerId;
    this.targetContainerID = "rightPane";
    this.sourceContainerID = "leftPane";
    this.targetTableID = "scratch_pad_table";
    this.template = "sort_page";
    this.sysParms = sysParms;
    this.processingDialog = null;
    this.useSynchBackFunc = useSynchBackFunc;
    var thisSortWindow = this;
    this.loadedFunc = function(table, list) {
      if (!list)
        return;
      if (list.listID == thisSortWindow.listID)
        thisSortWindow.processListLoad();
    };
    CustomEvent.observe("list.loaded", this.loadedFunc);
    CustomEvent.observe("partial.page.reload", this.loadedFunc);
    var viewport = document.viewport.getDimensions();
    var dialog;
    if (useBodyWindow)
      dialog = new BodyGlideDialogWindow(this.template, false, null, null, $(document.body));
    else
      dialog = new GlideDialogWindow(this.template, false);
    this.overrideEventHandlers = useBodyWindow;
    this.dialog = dialog;
    for (var key in this.sysParms)
      dialog.setPreference(key, this.sysParms[key]);
    dialog.setTitle(title);
    dialog.setSize(viewport.width - 40, viewport.height - 40);
    if (useBodyWindow)
      dialog.moveTo(15, 15);
    else
      dialog.moveTo(getScrollX() + 15, getScrollY() + 15);
    dialog.adjustBodySize();
    dialog.on("bodyrendered", function(frame) {
      dialog.setSize(viewport.width - 40, viewport.height - 40);
      if (useBodyWindow)
        dialog.moveTo(15, 15);
      else
        dialog.moveTo(getScrollX() + 15, getScrollY() + 15);
      Utility.getInstance().removeStyleProperty($("body_sort_page"), "overflow");
      thisSortWindow._onDialogShown();
    });
    if (this.useSynchBackFunc)
      this.synchBackFunc();
    else {
      var dimensions = $(this.containerId).getDimensions();
      $("grayBackground").style.width = dimensions.width + "px";
      $("grayBackground").style.height = dimensions.height + "px";
    }
    dialog.on("beforeclose", function() {
      CustomEvent.un("list.item.selected", thisSortWindow.selectObserver);
      CustomEvent.un("list.item.deselected", thisSortWindow.selectObserver);
      CustomEvent.un("list.loaded", thisSortWindow.loadedFunc);
      CustomEvent.un("partial.page.reload", thisSortWindow.loadedFunc);
      SortListManager.removeListManager(null, thisSortWindow.leftListID);
      SortListManager.removeListManager($(thisSortWindow.targetTableID), null);
      delete GlideLists2[thisSortWindow.listID];
      if (disableRowAdd) {
        thisSortWindow.enableRowAddHandler = function() {
          for (var key in GlideLists2)
            GlideLists2[key].disableRowAdd = false;
          CustomEvent.un('partial.page.reload', thisSortWindow.enableRowAddHandler);
        }
        CustomEvent.observe("partial.page.reload", thisSortWindow.enableRowAddHandler);
      }
      Draggable.startDisabled = true;
      closeFunc();
    });
    dialog.render();
  },
  synchBackFunc: function() {
    var maxX = 0;
    var maxY = 0;
    $(document.body).select("table").each(function(elem) {
      var dim = BoundsUtil.getInstance().getElemBounds(elem);
      if (dim.right > maxX)
        maxX = dim.right;
      if (dim.bottom > maxY)
        maxY = dim.bottom;
    });
    Utility.getInstance().showBackground(document.body, 999, "");
    $("grayBackground").style.width = maxX + "px";
    $("grayBackground").style.height = maxY + "px";
  },
  _onDialogShown: function() {
    if (this.useSynchBackFunc)
      this.synchBackFunc();
    else {
      var dimensions = $(this.containerId).getDimensions();
      $("grayBackground").style.width = dimensions.width + "px";
      $("grayBackground").style.height = dimensions.height + "px";
    }
    $(this.template).select(".drag_section_header")[0].style.border = "1px solid #DDD";
    var main = $("mainPane");
    if (!isMSIE) {
      var span = main.parentNode;
      span.removeChild(main);
      var bodyRendered = span.parentNode;
      var cell = bodyRendered.parentNode;
      cell.removeChild(bodyRendered);
      cell.appendChild(main);
      var row = cell.parentNode;
      row.style.height = "100%";
    } else {
      main.up("tr").style.height = "100%";
    }
    var width = main.up("td").getDimensions().width;
    var height = main.up("td").getDimensions().height;
    main.style.width = width + "px";
    main.style.height = height + "px";
    main.style.display = "block";
    var advancedMode = getPreference("sorting.advanced.mode")
    $("leftPane").fullWidth = main.getDimensions().width;
    if ($("leftPane").getAttribute("advanced_mode_enabled") == "true" && advancedMode == "true")
      $("leftPane").style.width = ($("leftPane").fullWidth - 20) + "px";
    else
      $("leftPane").style.width = $("leftPane").fullWidth + "px";
    $("leftPane").style.height = (main.getDimensions().height) + "px";
    this.listID = $(main.select(".list_div_cell")[0].childNodes[0]).getAttribute("id");
    var thisSortWindow = this;
    this.selectObserver = function() {
      thisSortWindow.handleListSelectionChange();
    };
    CustomEvent.observe("list.item.selected", this.selectObserver);
    CustomEvent.observe("list.item.deselected", this.selectObserver);
    var dragCell = ListDraggableRow.createRawDragDiv(true, getMessage("Drag all"));
    $("dragAllCell").appendChild(dragCell);
    Event.observe(dragCell, "mousedown", function(e) {
      var topRow;
      $(thisSortWindow.targetContainerID).select(".list_row").each(function(row) {
        if (!topRow)
          topRow = row;
        ListSelectManager.getInstance().selectItem(row.dr, true, new Object());
      });
      SortDraggable.modY = (BoundsUtil.getInstance().getElemBounds(dragCell).top - BoundsUtil.getInstance().getElemBounds(topRow).top) -
        (BoundsUtil.getInstance().getElemBounds(topRow).height / 2) + 7;
      topRow.dr.dr.gd.start(getEvent(e));
    });
  },
  handleListSelectionChange: function() {
    var selectedRows = $(this.targetContainerID).select(".dndHighlightItem").length;
    var rows = ($(this.targetContainerID).select(".dragCell").length - 1);
    if ($("scratch_pad_sort_cell")) {
      if (rows <= 1)
        $("scratch_pad_sort_cell").style.visibility = "hidden";
      else
        $("scratch_pad_sort_cell").style.visibility = "visible";
    }
    if (rows > 1) {
      if (isMSIE6) {
        $("dragAllPaddingRow").style.display = "";
        $("dragAllRow").style.display = "";
      } else {
        $("dragAllPaddingRow").style.display = "table-row";
        $("dragAllRow").style.display = "table-row";
      }
    } else {
      $("dragAllPaddingRow").style.display = "none";
      $("dragAllRow").style.display = "none";
    }
  },
  processListLoad: function() {
    if (this.processingDialog) {
      this.processingDialog._onCloseClicked();
      Utility.getInstance().hideBackground("sort_submit");
    }
    SortUtil.getInstance().prepareList("mainPane", "sorting_list_title");
    this.setupDND();
    SortUtil.getInstance().processListLoad(this.sourceContainerID, this.targetContainerID);
  },
  displayFilterToggle: function() {
    var main = $("mainPane");
    var toggles = main.select(".list_filter_toggle");
    if (toggles && toggles.length > 0) {
      toggles[0].style.display = "inline";
      if (isMSIE6)
        main.select(".list_filter_row")[0].style.display = "";
      else
        main.select(".list_filter_row")[0].style.display = "table-row";
    }
  },
  hideFilterToggle: function() {
    var main = $("mainPane");
    var toggles = main.select(".list_filter_toggle");
    if (toggles && toggles.length > 0) {
      toggles[0].style.display = "none";
      main.select(".list_filter_row")[0].style.display = "none";
    }
  },
  rowDisabledChecker: function(sysID) {
    if (this.scratchPadItems[sysID])
      return true;
    else
      return false;
  },
  setupDND: function() {
    var dropTargetTarget = new SortDropTarget($(this.targetContainerID), $("mainPane"), this, $(this.targetTableID), true, false).getTargetA();
    var dropTargetSource = new SortDropTarget($(this.sourceContainerID), $("mainPane"), this, $(this.listID + "_table"), false, false).getTargetA();
    var thisWindow = this;
    SortListManager.createListManager(null, this.listID, [dropTargetTarget, dropTargetSource], [], null, function(sysID) {
      return thisWindow.rowDisabledChecker(sysID);
    }, $(this.sourceContainerID), this.overrideEventHandlers);
    SortListManager.createListManager($(this.targetTableID), null, [dropTargetTarget, dropTargetSource], [], null, function(sysID) {
      return false;
    }, $(this.targetContainerID), this.overrideEventHandlers);
  }
});
addLoadEvent(function() {
  ListSortWindow.instance = new ListSortWindow();
  ListSortWindow.getInstance = function() {
    return ListSortWindow.instance;
  }
});

function updateSortOrderBy(table, list) {
  if (list.sortAscButton) {
    var cm = getMenuByName("context_list_title" + list.titleMenu.suffix);
    var item = null;
    if (cm) {
      cm = cm.context;
      item = cm.getItem("sort_by_order_asc");
    }
    if (list.orderBy && list.orderBy.length == 1 && list.orderBy[0] == "ORDERBY" + list.sortOrderColumn) {
      list.sortAscButton.src = "images/move_up.gifx";
      if (cm && item)
        cm.setChecked(item);
    } else if (list.sortBy == list.sortOrderColumn) {
      list.sortAscButton.src = "images/move_up.gifx";
      if (cm && item)
        cm.setChecked(item);
    } else {
      list.sortAscButton.src = "images/context.gifx";
      if (cm && item)
        cm.clearImage(item);
    }
  }
}

function prepareSortButton(table, list) {
  list.sortAscButton = $(list.listID + "_sort_by_order_asc_img");
  if (list.sortAscButton) {
    if (!list.sortAscButton.list) {
      list.sortOrderColumn = list.sortAscButton.getAttribute("column");
      list.sortAscButton.on("click", function() {
        if (!(this.list.orderBy && this.list.orderBy.length == 1 && this.list.orderBy[0] == "ORDERBY" + this.list.sortOrderColumn))
          this.list.sort(this.list.sortOrderColumn);
      });
      list.sortAscButton.list = list;
    }
    updateSortOrderBy(table, list);
  }
}
CustomEvent.observe("list.loaded", function(table, list) {
  prepareSortButton(table, list);
});
CustomEvent.observe("partial.page.reload", function(table, list) {
  if (!list)
    return;
  prepareSortButton(table, list);
});
CustomEvent.observe("list.title.clicked", function(table, list) {
  if (!list)
    return;
  updateSortOrderBy(table, list);
});
CustomEvent.observe("list.sort.fired", function(table, list) {
  if (!list)
    return;
  updateSortOrderBy(table, list);
});;