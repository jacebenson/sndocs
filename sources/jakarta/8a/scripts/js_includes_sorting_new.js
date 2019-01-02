/*! RESOURCE: /scripts/js_includes_sorting_new.js */
/*! RESOURCE: /scripts/classes/util/UtilityAndOverrides2.js */
var FormDialogDefinition = Class.create({
  initialize: function(title, table, container, view, formOnly) {
    this.title = title;
    this.table = table;
    this.container = container;
    this.view = view;
    this.formOnly = formOnly;
  },
  setCloseCallback: function(closeCallback) {
    this.closeCallback = closeCallback;
    return this;
  },
  setAfterCloseCallback: function(afterCloseCallback) {
    this.afterCloseCallback = afterCloseCallback;
    return this;
  },
  setOpenCallback: function(openCallback) {
    this.openCallback = openCallback;
    return this;
  },
  open: function(sys_id, parentID, parentColumnRef, fieldDetails) {
    this._openItemForm(this.title, this.table, this.container, this.view, sys_id, this.closeCallback, this.formOnly, parentID, parentColumnRef, this.openCallback, fieldDetails)
  },
  _openItemForm: function(title, table, container, view, sys_id, closeCallback, formOnly, parentID, parentColumnRef, openCallback, fieldDetails) {
    if ($("FormDialog"))
      return;
    var dialog = new GlidePaneForm(
      title ? title : "<span></span>",
      table,
      document.body,
      this.afterCloseCallback ? this.afterCloseCallback : function(action_verb, sys_id, updated_table, display_value) {});
    dialog.setLoadCallback(
      function(frame) {
        $("dialog_frame").noContext = true;
        if (isMSIE) {
          var shim = $("iframeDragShim_FormDialog");
          var theFrame = $("FormDialog");
          shim.parentNode.removeChild(shim);
          document.body.appendChild(shim);
          theFrame.parentNode.removeChild(theFrame);
          document.body.appendChild(theFrame);
          var dimensions = $("iframeDragShim_FormDialog").getDimensions();
          var elems = {
            "window.FormDialog": "XY",
            "FormDialog": "XY",
            "body_FormDialog": "X",
            "dialog_frame": "X"
          };
          for (var id in elems) {
            if (elems[id] == "XY" || elems[id] == "X") $(id).style.width = dimensions.width + "px";
            if (elems[id] == "XY" || elems[id] == "Y") $(id).style.height = dimensions.height + "px";
          }
          $("dialog_frame").style.height = (dimensions.height - $("window.FormDialog").down(".glide_pane_header").getDimensions().height) + "px";
        } else
          $("dialog_frame").style.height = ($("dialog_frame").getDimensions().height - 12) + "px";
        if ($("grayBackground")) {
          var dimensions = BoundsUtil.getInstance().getElemBounds(container);
          $("grayBackground").style.width = dimensions.width + "px";
          $("grayBackground").style.height = dimensions.height + "px";
        }
        if (frame && ((parentID && parentColumnRef) || fieldDetails)) {
          var dFrame = 'defaultView' in frame ? frame.defaultView : frame.parentWindow;
          if (dFrame) {
            var interval;
            var count = 0;
            interval = setInterval(function() {
              try {
                if (dFrame.g_form) {
                  if (fieldDetails) {
                    for (var fieldName in fieldDetails) {
                      var fieldValue = fieldDetails[fieldName];
                      dFrame.g_form.setValue(fieldName, fieldValue);
                    }
                  } else if (parentColumnRef)
                    dFrame.g_form.setValue(parentColumnRef, parentID);
                  clearInterval(interval);
                  dFrame = null;
                } else if (count > 50) {
                  clearInterval(interval);
                  dFrame = null;
                }
              } catch (e) {
                clearInterval(interval);
                dFrame = null;
              }
              count++;
            }, 200);
          }
        }
        if (openCallback)
          openCallback("loaded");
      });
    dialog.addParm('sysparm_form_only', 'true');
    dialog.addParm('sysparm_titleless', 'false');
    dialog.addParm('sysparm_view', view);
    dialog.addParm('sysparm_link_less', 'true');
    this._checkAndInitializeIfStory(dialog, parentID, parentColumnRef);
    if (sys_id)
      dialog.setSysID(sys_id);
    if (closeCallback)
      dialog.on("beforeclose", closeCallback);
    dialog.render();
    if (isMSIE7)
      dialog._centerOnScreen();
    if (openCallback)
      openCallback("rendered");
  },
  _checkAndInitializeIfStory: function(dialog, parentID, parentColumnRef) {
    if (parentID && parentColumnRef && (parentColumnRef == 'story')) {
      dialog.addParm('sysparm_collection_key', parentColumnRef);
      dialog.addParm('sysparm_collectionID', parentID);
      dialog.addParm('sysparm_collection', 'rm_story');
    }
  }
});
var Utility = Class.create({
  removeStyleProperty: function(elem, style) {
    if (elem.style.removeProperty)
      elem.style.removeProperty(style);
    else
      elem.style[style] = "";
  },
  hideBackground: function(idSuffix) {
    var gb;
    if (!idSuffix)
      gb = $('grayBackground');
    else
      gb = $('grayBackground' + idSuffix);
    if (gb) {
      gb.resizeHandler.stop();
      gb.style.display = "none";
      gb.parentNode.removeChild(gb);
      Event.stopObserving(window, 'resize', gb.resizeHandler);
    }
  },
  refreshBackground: function(id, idSuffix) {
    var backId = "grayBackground";
    if (idSuffix)
      backId += idSuffix;
    var dimensions = $(id).getDimensions();
    var back = $("grayBackground");
    if (parseInt(back.style.width) < dimensions.width)
      back.style.width = dimensions.width + "px";
    if (parseInt(back.style.height) < dimensions.height)
      back.style.height = dimensions.height + "px";
  },
  showBackground: function(id, zIndex, idSuffix) {
    var backId = "grayBackground";
    if (idSuffix)
      backId += idSuffix;
    if (!$(backId)) {
      var gb = $(cel("div"));
      gb.setAttribute("id", backId);
      var bounds = BoundsUtil.getInstance().getElemBounds($(id));
      gb.style.top = bounds.top + "px";
      gb.style.left = bounds.left + "px";
      gb.style.width = bounds.width + "px";
      gb.style.height = bounds.height + "px";
      gb.style.position = "absolute";
      gb.style.display = "block";
      gb.style.zIndex = zIndex;
      gb.style.backgroundColor = "#444444";
      gb.style.opacity = 0.33;
      gb.style.filter = "alpha(opacity=33)";
      document.body.appendChild(gb);
      gb.resizeHandler = function() {
        gb.style.width = $(id).getDimensions().width + "px";
        gb.style.height = $(id).getDimensions().height + "px";
      }
      gb.resizeHandler.stop = function() {};
      Event.observe(window, 'resize', gb.resizeHandler);
    }
  }
});
Utility.instance = new Utility();
Utility.getInstance = function() {
  return Utility.instance;
};
/*! RESOURCE: /scripts/classes/util/BoundsUtil2.js */
var BoundsUtil = Class.create({
  getElemBounds: function(elem) {
    var offset = elem.cumulativeOffset();
    var dimensions = elem.getDimensions();
    var bounds = [];
    bounds.left = offset.left;
    bounds.right = offset.left + dimensions.width;
    bounds.top = offset.top;
    bounds.bottom = offset.top + dimensions.height;
    bounds.width = dimensions.width;
    bounds.height = dimensions.height;
    return bounds;
  },
  getElemBoundsWithScrollOffset: function(elem) {
    var offset = elem.cumulativeOffset();
    var scrollOffset = elem.cumulativeScrollOffset();
    var dimensions = elem.getDimensions();
    var bounds = [];
    bounds.left = offset.left - scrollOffset.left;
    bounds.right = offset.left - scrollOffset.left + dimensions.width;
    bounds.top = offset.top - scrollOffset.top;
    bounds.bottom = offset.top - scrollOffset.top + dimensions.height;
    bounds.width = dimensions.width;
    bounds.height = dimensions.height;
    return bounds;
  }
});
BoundsUtil.instance = new BoundsUtil();
BoundsUtil.getInstance = function() {
  return BoundsUtil.instance;
};
/*! RESOURCE: /scripts/classes/drag/Draggable2.js */
var Draggable = Class.create(GwtObservable, {
  initialize: function(elem, dragElem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, addBorder, background) {
    this.elem = elem;
    this.dragElem = dragElem;
    this.targets = targets;
    this.invalidTargets = invalidTargets;
    this.currentTarget = null;
    this.dragClickFunction = dragClickFunction;
    this.topProxyElem = topProxyElem;
    this.bottomProxyElem = bottomProxyElem;
    this.gd = new GwtDraggable(this.dragElem);
    if (!Draggable.startDisabled)
      this.gd.setStart(this.dragStart.bind(this));
    this.gd.setEnd(this.dragEnd.bind(this));
    this.gd.setDrag(this.dragging.bind(this));
    this.addBorder = addBorder;
    this.background = background;
    this.isMulti = false;
  },
  onStartHandler: function() {},
  postStartHandler: function() {},
  onEndHandler: function() {},
  processCoordinates: function() {},
  getElem: function() {
    return this.elem;
  },
  setMulti: function(isMulti) {
    this.isMulti = isMulti;
  },
  disable: function() {
    this.dragDisabled = true;
  },
  enable: function() {
    this.dragDisabled = false;
  },
  isDisabled: function() {
    return this.dragDisabled;
  },
  getFontHeight: function() {
    var elem = $(cel("div"));
    elem.style.visibility = "hidden";
    document.body.appendChild(elem);
    elem.update("<table><tr><td>M</td></tr></table>");
    elem.addClassName("dragRow");
    var height = elem.getHeight();
    elem.parentNode.removeChild(elem);
    return height;
  },
  dragStart: function(me, x, y, e) {
    if (this.isDisabled())
      return;
    this.dragClickFunction(e);
    this.x = x - 20;
    this.y = y - me.differenceY;
    this.dragHeight = this.getFontHeight() + 2;
    if (isMSIE)
      this.dragHeight = this.dragHeight + 2;
    this.onStartHandler();
    this.processCoordinates();
    if (this.isMulti) {
      var div = cel('div');
      this._setDragDivAttributes(div, this.y, this.x, this.getDragWidth() + 9, this.getDragHeight() + 9, false, null);
      var div1 = cel('div');
      this._setDragDivAttributes(div1, 6, 6, this.getDragWidth(), this.getDragHeight(), this.addBorder, "#EEE");
      div.appendChild(div1);
      var div2 = cel('div');
      this._setDragDivAttributes(div2, 3, 3, this.getDragWidth(), this.getDragHeight(), this.addBorder, "#EEE");
      div.appendChild(div2);
      var div3 = cel('div');
      this._setDragDivAttributes(div3, 0, 0, this.getDragWidth(), this.getDragHeight(), this.addBorder, this.background);
      this.updateMultiDragElem();
      var proxyClone = $(this.topProxyElem).clone(true);
      proxyClone.style.width = this.getProxyWidth() + "px";
      $(div3).appendChild(proxyClone);
      $(div1).addClassName("dragRow2");
      $(div2).addClassName("dragRow1");
      $(div3).addClassName("dragRow");
      $(div).addClassName("dragRow");
      div.appendChild(div3);
      this.dragDiv = div;
    } else {
      var div = cel('div');
      this._setDragDivAttributes(div, this.y, this.x, this.getDragWidth(), this.getDragHeight(), this.addBorder, this.background);
      this.updateMultiDragElem();
      var proxyClone = $(this.topProxyElem).clone(true);
      proxyClone.style.width = this.getProxyWidth() + "px";
      $(div).appendChild(proxyClone);
      $(div).addClassName("dragRow");
      this.dragDiv = div;
    }
    if (this.invalidTargets)
      for (var i = 0; i < this.invalidTargets.length; i++)
        this.invalidTargets[i].fireGreyOut();
    document.body.appendChild(this.dragDiv);
    var cell = this.dragDiv.down(".dragCell");
    if (!this.isMulti && cell) {
      var siblings = cell.up("td").nextSiblings();
      if (siblings.length > 0)
        siblings[0].style.display = "none";
    }
    this.postStartHandler();
    CustomEvent.fire('refresh.event');
    CustomEvent.fire('drag.start');
  },
  getProxyWidth: function() {
    return BoundsUtil.getInstance().getElemBounds(this.elem).width;
  },
  getDragWidth: function() {
    return $(this.elem).getWidth();
  },
  getDragHeight: function() {
    return this.dragHeight;
  },
  updateMultiDragElem: function() {
    $(this.bottomProxyElem).update(this.elem.innerHTML);
  },
  _setDragDivAttributes: function(div, top, left, width, height, border, back) {
    div.style.position = "absolute";
    if (border) {
      div.style.borderWidth = "1px";
      div.style.borderStyle = "solid";
      div.style.borderColor = "#DDD";
    }
    if (back) {
      div.style.background = back;
      div.style.backgroundColor = back;
    }
    div.style.top = top + "px";
    div.style.left = left + "px";
    div.style.width = (width) + "px";
    div.style.height = (height) + "px";
    div.style.overflow = "hidden";
  },
  dragging: function(me, x, y, e) {
    if (!this.dragDiv || this.isDisabled())
      return;
    var oldX = this.x;
    var oldY = this.y;
    this.x = x + me.differenceX - 20;
    this.y = y;
    var compX = e.pointerX() + (this.dragDiv.getDimensions().width / 2);
    var compY = e.pointerY() + (this.dragDiv.getDimensions().height / 2);
    if (Draggable.alternateCompare)
      compX = BoundsUtil.getInstance().getElemBounds($(this.dragDiv)).left + (this.dragDiv.getDimensions().width / 2);
    this._highlightTarget(compX, compY);
    this.processCoordinates();
    this.dragDiv.style.left = this.x + 'px';
    this.dragDiv.style.top = this.y + 'px';
    this.fireEvent("drag", this, this.x - oldX, this.y - oldY);
  },
  _highlightTarget: function(x, y) {
    if (!this.processing) {
      this.processing = true;
      var newTarget = null;
      for (var i = 0; i < this.targets.length; i++)
        if (this.targets[i].isDragOver(x, y)) {
          newTarget = this.targets[i];
          break;
        }
      var diffTarget = !this.currentTarget || !newTarget || newTarget.isDifferentTarget(this.currentTarget);
      if (diffTarget) {
        if (this.currentTarget) {
          this.currentTarget.fireDragOut();
          this.currentTarget = null;
        }
        if (newTarget)
          this.currentTarget = newTarget;
      }
      this.processing = false;
    }
  },
  dragEnd: function(me, e) {
    if (!this.dragDiv || this.isDisabled())
      return;
    if (this.dragDiv.parentNode) {
      this.onEndHandler();
      document.body.removeChild(this.dragDiv);
      if (this.currentTarget != null) {
        this.currentTarget.fireDragDrop(this);
        this.currentTarget.fireDragOut();
        this.currentTarget = null;
      }
      if (this.invalidTargets)
        for (var i = 0; i < this.invalidTargets.length; i++)
          this.invalidTargets[i].fireRemoveGreyOut();
      this.fireEvent("dragend", this);
      CustomEvent.fire('refresh.event');
    }
  }
});;
/*! RESOURCE: /scripts/classes/drag/DropTarget2.js */
var DropTarget = Class.create(GwtObservable, {
  initialize: function(elem, dragContainer) {
    this.elem = elem.getAttribute("id");
    if (dragContainer)
      this.dragContainer = dragContainer.getAttribute("id");
    else
      this.dragContainer = null;
  },
  getElem: function() {
    return $(this.elem);
  },
  getDragBounds: function() {
    if (this.dragContainer)
      return BoundsUtil.getInstance().getElemBounds($(this.dragContainer));
    else
      return this.getBounds();
  },
  getBounds: function() {
    return BoundsUtil.getInstance().getElemBounds($(this.getElem()));
  },
  isDragOver: function(x, y) {
    if (this.getElem()) {
      var bounds = this.getBounds();
      if (x > bounds.left && x < bounds.right &&
        y > bounds.top && y < bounds.bottom) {
        this.fireEvent("dragover", this, x, y);
        return true;
      }
    }
    return false;
  },
  toString: function() {
    return "Drop Target";
  },
  fireGreyOut: function() {
    this.fireEvent("greyout", this);
  },
  fireRemoveGreyOut: function() {
    this.fireEvent("removegreyout", this);
  },
  fireDragOut: function() {
    this.fireEvent("dragout", this);
  },
  fireDragDrop: function(draggable) {
    this.fireEvent("dragdrop", this, draggable);
  },
  isDifferentTarget: function(otherTarget) {
    return $(this.getElem()).getAttribute("id") != $(otherTarget.getElem()).getAttribute("id");
  }
});;
/*! RESOURCE: /scripts/classes/listDrag/ListDraggableRow2.js */
var ListDraggableRow = Class.create({
  initialize: function(item, dragItem, targets, sys_id, record_class, table, invalidTargets, createFunc) {
    var dr = this;
    this.dragItem = dragItem;
    var topProxyElem = $(cel('table'));
    topProxyElem.cellPadding = "0";
    topProxyElem.cellSpacing = "0";
    var tableBody = $(cel('tbody'));
    var bottomProxyElem = $(cel('tr'));
    tableBody.appendChild(bottomProxyElem);
    topProxyElem.appendChild(tableBody);
    if (!createFunc)
      createFunc = this.createDraggable;
    this.dr = createFunc(item, dragItem, this.dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, true, "white");
    this.sysId = sys_id;
    this.dr.dr = this;
    item.dr = this;
    this.table = table;
    this.recordClass = record_class;
    this._addHandler(item, "click", this.handleClick.bind(this));
    this._addHandler(item, "dblclick", this.handleDblClick.bind(this));
  },
  dragClickFunction: function(e) {
    ListSelectManager.getInstance().selectItem(this.dr, true, e);
  },
  createDraggable: function(item, dragItem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets) {
    return new Draggable(item, dragItem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, true, "white");
  },
  disable: function() {
    if (!this.dragItem.hasClassName("dragCellDisabled"))
      this.dragItem.addClassName("dragCellDisabled");
    this.dr.disable();
  },
  enable: function() {
    if (this.dragItem.hasClassName("dragCellDisabled"))
      this.dragItem.removeClassName("dragCellDisabled");
    this.dr.enable();
  },
  isDisabled: function() {
    return this.dr.isDisabled();
  },
  _addHandler: function(target, handler, func) {
    if (!target.handlers)
      target.handlers = {};
    if (target.handlers[handler])
      target.handlers[handler].stop();
    target.handlers[handler] = target.on(handler, func);
  },
  setMulti: function(isMulti) {
    this.dr.setMulti(isMulti);
  },
  getSysID: function() {
    return this.sysId;
  },
  getRecordClass: function() {
    return this.recordClass;
  },
  getTable: function() {
    return this.table;
  },
  addHighlight: function() {
    $(this.dr.getElem()).addClassName("dndHighlightItem");
  },
  removeHighlight: function() {
    $(this.dr.getElem()).removeClassName("dndHighlightItem");
  },
  handleClick: function(e) {
    if (this.isDisabled())
      return;
    if (ListSelectManager.getInstance().selectedRef == null) {
      ListSelectManager.getInstance().selectedRef = ListSelectManager.getInstance().getSelectedItemsOrdered();
      setTimeout(function() {
        ListSelectManager.getInstance().selectedRef = null;
      }, 1000);
    }
    ListSelectManager.getInstance().selectItem(this, false, e);
  },
  handleDblClick: function(e) {
    if (this.isDisabled())
      return;
    ListSelectManager.getInstance().dblClickItem(this, false, e);
  }
});
ListDraggableRow.hasDragCell = function(item) {
  var existing = $(item).select(".dragCell");
  return existing && existing.length > 0;
}
ListDraggableRow.getDragCell = function(item) {
  return $(item).select(".dragCell")[0];
}
ListDraggableRow.createRawDragDiv = function(active, title) {
  var doctype = document.documentElement.getAttribute('data-doctype');
  var dragCell = $(cel("a"));
  var image = "<img class='list_decoration' title='" + (title ? title : "") + "' src='images/move16.gif' height='16' width='16'/>";
  if (doctype) {
    image = "<div class='list_decoration icon-drag' title='" + (title ? title : "") + "' style='padding:2px 0px 2px 5px;'></div>";
  }
  dragCell.addClassName("dragCell");
  dragCell.style.cursor = "move";
  dragCell.update(image);
  if (!active)
    dragCell.addClassName("dragCellDisabled");
  return dragCell;
}
ListDraggableRow.createDragCell = function(item, active) {
  var doctype = document.documentElement.getAttribute('data-doctype');
  var tableToRemove = null;
  item = $(item);
  if (ListDraggableRow.hasDragCell(item))
    tableToRemove = ListDraggableRow.getDragCell(item).up("table");
  var container = $(item.select("td")[0]);
  var parentRow = $(container.up('tr'));
  var dragMarkup = "<a class='dragCell " + (active ? "" : "dragCellDisabled") + "' style='cursor: move;'><img class='list_decoration' title='" + (item.dragCellTitle ? item.dragCellTitle : "") + "' src='images/move16.gif' height='16' width='16'/></a>";
  if (doctype) {
    dragMarkup = "<a class='dragCell " + (active ? "" : "dragCellDisabled") + "' style='cursor: move;'><div class='list_decoration icon-drag' title='" + (item.dragCellTitle ? item.dragCellTitle : "") + "' style='padding:2px 10px 2px 5px;'></div></a>";
  }
  var tableMarkup = "<table style='background: none; background-color: none'><tbody><tr sys_id='" + parentRow.getAttribute("sys_id") + "' record_class='" + parentRow.getAttribute("record_class") + "'><td style='background: none; background-color: none;'>" + dragMarkup + "</td><td style='background: none; background-color: none;'></td></tr></tbody></table>";
  var span = $(container.select("span")[0]);
  if (span)
    span.parentNode.removeChild(span);
  if (tableToRemove)
    tableToRemove.parentNode.removeChild(tableToRemove);
  container.update(tableMarkup);
  container.style.padding = "0px";
  if (span)
    container.down("td").next().appendChild(span);
  var dragCell = container.down("a");
  dragCell.ondragstart = function() {
    return false;
  };
  return dragCell;
};
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
        for (var i = 0; i < items.length; i++)
          if (!this.selectedItems[items[i].getSysID()]) {
            this._addItem(items[i]);
            CustomEvent.fire("list.item.selected");
          }
        this.setMulti();
      }
    }
  },
  clearSelected: function() {
    for (var key in this.selectedItems) {
      this.selectedItems[key].setMulti(false);
      this._removeItem(this.selectedItems[key]);
    }
    this.selectedItems = {};
    CustomEvent.fire("list.item.deselected");
  },
  setMulti: function() {
    if (this.selectedItemsOrdered.length > 0)
      for (var key in this.selectedItems)
        this.selectedItems[key].setMulti(this.selectedItemsOrdered.length > 1);
  },
  getSelectedItems: function() {
    return this.selectedItems;
  },
  getSelectedItemsOrdered: function() {
    return this.selectedItemsOrdered;
  }
});
ListSelectManager.getInstance = function() {
  if (!ListSelectManager.instance)
    ListSelectManager.instance = new ListSelectManager();
  return ListSelectManager.instance;
}
ListSelectManager.getInstance();;
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
          this.prepareTransfe