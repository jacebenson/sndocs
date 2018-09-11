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
          (BoundsUtil.getInstance().getElemBounds(topRow).height / 2) + 7;
        topRow.dr.dr.gd.start(getEvent(e));
      });
    }
    var dragRowCount = container.select(".dragCell").length - 2;
    var disabled = container.select(".dragCellDisabled").length - 1;
    if (dragRowCount > 0 && disabled != dragRowCount) {
      if (isMSIE6) {
        $(side + "DragAllRow" + type).style.display = "";
      } else {
        $(side + "DragAllRow" + type).style.display = "table-row";
      }
    } else {
      $(side + "DragAllRow" + type).style.display = "none";
    }
  },
  setupDND: function() {
    this.leftTarget = new SortDropTarget($(this.leftScrollContainerID), null, this, $(this.leftListID + "_table"), true).getTargetA();
    this.rightTarget = new SortDropTarget($(this.rightScrollContainerID), null, this, $(this.rightListID + "_table"), false).getTargetA();
    var dragDisabled = this.isDragDisabled();
    var disabledCallback = function(sysID) {
      return dragDisabled;
    };
    SortListManager.createListManager(null, this.leftListID, [this.leftTarget, this.rightTarget], [], null, disabledCallback, $(this.leftScrollContainerID), false);
    SortListManager.createListManager(null, this.rightListID, [this.leftTarget, this.rightTarget], [], null, disabledCallback, $(this.rightScrollContainerID), false);
    this.setHeaderToggleState(this.leftListID);
    this.setHeaderToggleState(this.rightListID);
  },
  setHeaderToggleState: function(listID) {
    var list = GlideList2.get(listID);
    if (!list)
      return;
    var columnHeaderPref = getPreference("show.column.header");
    var columnHeader = $("hdr_" + list.listID);
    if (columnHeader.visible() && !columnHeaderPref)
      list.toggleColumnHeader();
    else if (!columnHeader.visible() && columnHeaderPref)
      list.toggleColumnHeader();
  }
});;
/*! RESOURCE: /scripts/classes/sort/SortDraggable2.js */
var SortDraggable = Class.create(Draggable, {
  initialize: function(elem, dragElem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, addBorder, background, container, overrideEventHandlers) {
    this.container = container;
    this.overrideEventHandlers = overrideEventHandlers;
    Draggable.prototype.initialize.call(this, elem, dragElem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, addBorder, background);
  },
  onStartHandler: function(e) {
    if (SortDraggable.adjForContainerScroll)
      SortDraggable.modY = -this.container.scrollTop;
    if (this.overrideEventHandlers) {
      var thisDr = this;
      if (this.gd.parentElement) {
        Event.stopObserving(this.gd.parentElement, "mouseup", this.fDrag);
        Event.stopObserving(this.gd.parentElement, "mousemove", this.fDrag);
      }
      this.mouseUpOverride = function(e) {
        thisDr.gd.end(e);
      };
      this.mouseMoveOverride = function(e) {
        thisDr.gd.drag(e);
      };
      Event.observe(document.body, "mouseup", this.mouseUpOverride);
      Event.observe(document.body, "mousemove", this.mouseMoveOverride);
    }
  },
  processCoordinates: function() {
    var width = this.getDragWidth();
    var height = this.getDragHeight();
    this.y = this.y - (height / 2) + 7;
    if (SortDraggable.modY)
      this.y = this.y + SortDraggable.modY;
    this.x = this.x + 5;
    var midX = this.x + (width / 2);
    var minY;
    var maxY;
    var minX;
    var maxX;
    var adj = 10;
    for (var i = 0; i < this.targets.length; i++)
      if (this.targets[i].getElem().visible()) {
        var bounds = this.targets[i].getDragBounds();
        if (!minY && !maxY && !minX && !maxX) {
          minY = bounds.top + adj;
          maxY = bounds.bottom - adj;
          minX = bounds.left;
          maxX = bounds.right;
        } else {
          if (bounds.top < minY)
            minY = bounds.top + adj;
          if (bounds.bottom > maxY)
            maxY = bounds.bottom - adj;
          if (bounds.left < minX)
            minX = bounds.left;
          if (bounds.right > maxX)
            maxX = bounds.right;
        }
      }
    var scrollChange;
    var adjMaxY = maxY - (height / 2);
    var adjMinY = minY - (height / 2);
    if (this.y < adjMinY || this.y > adjMaxY) {
      var target;
      for (var i = 0; i < this.targets.length; i++) {
        var bounds = this.targets[i].getBounds();
        if (midX > bounds.left && midX < bounds.right) {
          target = this.targets[i];
          break;
        }
      }
      if (this.y < adjMinY)
        this.y = adjMinY;
      if (this.y > adjMaxY)
        this.y = adjMaxY;
      if (target) {
        SortDraggable.setScrollInterval(this.y == adjMinY, target.getElem());
        scrollChange = true;
      }
    }
    if (this.x < minX)
      this.x = minX;
    if (this.x > maxX - width)
      this.x = maxX - width;
    if (!scrollChange)
      SortDraggable.clearScrollInterval();
  },
  getProxyWidth: function() {
    return BoundsUtil.getInstance().getElemBounds(this.elem).width;
  },
  getDragWidth: function() {
    return BoundsUtil.getInstance().getElemBounds(this.container).width;
  },
  onEndHandler: function() {
    SortDraggable.modY = 0;
    if (this.overrideEventHandlers) {
      Event.stopObserving(document.body, "mouseup", this.mouseUpOverride);
      Event.stopObserving(document.body, "mousemove", this.mouseMoveOverride);
    }
  },
  updateMultiDragElem: function() {
    if (this.isMulti) {
      var messageCell = $(cel("td"));
      messageCell.update(getMessage("Multiple items"));
      messageCell.style.verticalAlign = "middle";
      messageCell.style.width = "100%";
      messageCell.style.borderLeft = "7px solid white";
      var dragCell = $(cel("td"));
      dragCell.appendChild(ListDraggableRow.createRawDragDiv(true, getMessage("")));
      $(this.bottomProxyElem).update("");
      $(this.bottomProxyElem).appendChild(dragCell);
      $(this.bottomProxyElem).appendChild(messageCell);
      $(this.bottomProxyElem).up("table").style.height = "100%";
    } else
      $(this.bottomProxyElem).update(this.elem.innerHTML);
  }
});
SortDraggable.scrollIncrement = 10;
SortDraggable.adjForContainerScroll = false;
SortDraggable.setScrollInterval = function(up, container) {
  if (SortDraggable.scrollInterval)
    return;
  SortDraggable.scrollInterval = window.setInterval(function() {
    SortDraggable.scrollIncrement += 10;
    if (SortDraggable.scrollIncrement > 200)
      SortDraggable.scrollIncrement = 200;
    var oldScrolTop = container.scrollTop;
    var top = container.scrollTop;
    if (up) {
      top = top - SortDraggable.scrollIncrement;
      container.scrollTop = top;
    } else {
      top = top + SortDraggable.scrollIncrement;
      container.scrollTop = top;
    }
    if (oldScrolTop == container.scrollTop)
      SortDraggable.clearScrollInterval();
  }, 100);
}
SortDraggable.clearScrollInterval = function() {
  if (SortDraggable.scrollInterval) {
    clearInterval(SortDraggable.scrollInterval);
    SortDraggable.scrollInterval = null;
    SortDraggable.scrollIncrement = 10;
  }
};
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
/*! RESOURCE: /scripts/classes/sort/SortListManager2.js */
var SortListManager = Class.create({
  initialize: function(listElem, tableID, targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers) {
    this.overrideEventHandlers = overrideEventHandlers;
    this.container = container;
    this.listElem = listElem;
    this.tableID = tableID;
    this.targets = targets;
    this.invalidTargets = invalidTargets;
    this.dragEnabledChecker = dragEnabledChecker;
    this.dragEnabledDetails = {};
    this._getDragEnabledDetails();
    this.rowDisabledCallback = rowDisabledCallback;
    this.processRows();
  },
  _getDragEnabledDetails: function() {
    if (!this.dragEnabledChecker)
      return;
    var dragEnabledDetails = {};
    var sysIDs = this._getSysIDs();
    if (sysIDs.length > 0) {
      var IDsParam = "";
      for (var i = 0; i < sysIDs.length; i++)
        IDsParam += sysIDs[i] + ",";
      var result = null;
      if (this.dragEnabledChecker && this.dragEnabledChecker.length > 0) {
        var ga;
        eval("ga = new GlideAjax('" + this.dragEnabledChecker + "')");
        ga.addParam('sysparm_name', 'isDragEnabledForItems');
        ga.addParam('sysparm_drag_item_ids', IDsParam);
        ga.getXMLWait();
        result = ga.getAnswer();
      }
      if (!result || result == "not_recognised") {
        for (var i = 0; i < sysIDs.length; i++)
          this.dragEnabledDetails[sysIDs[i]] = [true];
      } else {
        var tokens = result.split("|");
        for (var i = 0; i < tokens.length; i++)
          if (tokens[i].length > 0) {
            var details = tokens[i].split(",");
            this.dragEnabledDetails[details[0]] = [(details[1] == "true"), details[2]];
          }
      }
    }
  },
  _getSysIDs: function() {
    var sysIDs = [];
    if (!this.listElem)
      this.listElem = $(this.tableID + "_table");
    if (this.listElem) {
      var elems = $(this.listElem).childElements();
      for (var i = 0; i < elems.length; i++)
        if (elems[i].tagName == "tbody" || elems[i].tagName == "TBODY") {
          var row = elems[i].down("tr");
          while (row) {
            var sysID = $(row).getAttribute("sys_id");
            if (sysID)
              sysIDs[sysIDs.length] = sysID;
            row = row.next();
          }
        }
    }
    return sysIDs;
  },
  setValues: function(targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers) {
    this.overrideEventHandlers = overrideEventHandlers;
    this.container = container;
    if (!$(this.tableID + "_table"))
      this.listElem = $(this.tableID);
    else
      this.listElem = $(this.tableID + "_table");
    this.targets = targets;
    this.invalidTargets = invalidTargets;
    this.dragEnabledChecker = dragEnabledChecker;
    this.rowDisabledCallback = rowDisabledCallback;
    this.dragEnabledDetails = {};
    this._getDragEnabledDetails();
    this.processRows();
  },
  processListRow: function(item) {
    var sysID = $(item).getAttribute("sys_id");
    var recordClass = $(item).getAttribute("record_class");
    if (this.targets && this.targets.length > 0) {
      if (!this.dragEnabledChecker || (this.dragEnabledDetails[sysID] && this.dragEnabledDetails[sysID][0])) {
        var dragCell = ListDraggableRow.createDragCell(item, true);
        var row = this.createListDraggableRow(item, dragCell, this.targets, sysID, recordClass, this.tableID, this.invalidTargets);
        if (this.currentGroupRow)
          this.currentGroupRow.addChildDraggableRow(row);
        if (this.rowDisabledCallback && this.rowDisabledCallback(sysID))
          row.disable();
        else
          row.enable();
      } else {
        if (this.dragEnabledDetails[sysID])
          item.dragCellTitle = this.dragEnabledDetails[sysID][1];
        $(item).addClassName("disabledDragRow");
        ListDraggableRow.createDragCell(item, false);
      }
    }
    this.extraListRowProcessing(item);
  },
  createListDraggableRow: function(item, dragCell, targets, sysID, recordClass, tableID, invalidTargets) {
    return new ListDraggableRow(item, dragCell, targets, sysID, recordClass, tableID, invalidTargets, this.createDraggable.bind(this));
  },
  createDraggable: function(item, dragItem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets) {
    return new SortDraggable(item, dragItem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, true, "white", this.container, this.overrideEventHandlers);
  },
  processGroupRow: function(item) {
    this.extraGroupRowProcessing(item);
  },
  extraListRowProcessing: function(item) {},
  extraGroupRowProcessing: function(item) {},
  processHeaderRow: function(item) {
    return;
  },
  processRows: function() {
    var manager = this;
    if (!this.listElem)
      return;
    var elems = $(this.listElem).childElements();
    for (var i = 0; i < elems.length; i++) {
      if (elems[i].tagName == "tbody" || elems[i].tagName == "TBODY") {
        var row = elems[i].down("tr");
        while (row) {
          if (row.hasClassName("list_row"))
            manager.processListRow(row);
          else if (row.hasClassName("list_group"))
            manager.processGroupRow(row);
          else if (row.hasClassName("list_header"))
            manager.processHeaderRow(row);
          row = row.next();
        }
      }
    }
  }
});
SortListManager.removeListManager = function(listElem, tableID) {
  if (!tableID && listElem)
    tableID = $(listElem).getAttribute("tableID");
  if (!SortListManager.managers)
    return
  if (tableID && SortListManager.managers[tableID])
    delete SortListManager.managers[tableID];
}
SortListManager.createListManager = function(listElem, tableID, targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers) {
  if (!listElem)
    listElem = $(tableID + "_table");
  if (!tableID && listElem)
    tableID = $(listElem).getAttribute("tableID");
  if (!SortListManager.managers)
    SortListManager.managers = {};
  if (!SortListManager.managers[tableID])
    SortListManager.managers[tableID] = new SortListManager(listElem, tableID, targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers);
  else
    SortListManager.managers[tableID].setValues(targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers);
  return SortListManager.managers[tableID];
};
/*! RESOURCE: /scripts/classes/sort/SortUtil2.js */
var BodyGlideDialogWindow = Class.create(GlideDialogWindow, {
  initialize: function(id, readOnly, width, height, containerElement) {
    this.containerElement = containerElement;
    GlideDialogWindow.prototype.initialize.call(this, id, readOnly, width, height);
  },
  insert: function(element) {
    GlideDialogWindow.prototype.insert.call(this, (this.containerElement ? this.containerElement : element));
  },
  _getScrollTop: function() {
    if ($(document.body).hasClassName("section_header_body_no_scroll"))
      return 0;
    else
      return GlideWindow.prototype._getScrollTop.call();
  },
  _getScrollLeft: function() {
    if ($(document.body).hasClassName("section_header_body_no_scroll"))
      return 0;
    else
      return GlideWindow.prototype._getScrollLeft.call();
  }
});
var SortUtil = Class.create({
  processListLoad: function(sourceContainerID, targetContainerID) {
    if (isMSIE) {
      if ($(sourceContainerID).originalScrollTop) {
        setTimeout(function() {
          if ($(sourceContainerID).originalScrollTop) {
            $(sourceContainerID).scrollTop = $(sourceContainerID).originalScrollTop;
            $(sourceContainerID).originalScrollTop = null;
          }
        }, 250);
      }
      if ($(targetContainerID).originalScrollTop) {
        setTimeout(function() {
          if ($(targetContainerID).originalScrollTop) {
            $(targetContainerID).scrollTop = $(targetContainerID).originalScrollTop;
            $(targetContainerID).originalScrollTop = null;
          }
        }, 250);
      }
    } else {
      if (this.alreadySetupScolling)
        return;
      this.alreadySetupScolling = true;
      Event.observe($(sourceContainerID), 'scroll', function() {
        if ($(sourceContainerID).originalScrollTop) {
          $(sourceContainerID).scrollTop = $(sourceContainerID).originalScrollTop;
          $(sourceContainerID).originalScrollTop = null;
        }
      });
      Event.observe($(targetContainerID), 'scroll', function() {
        if ($(targetContainerID).originalScrollTop) {
          $(targetContainerID).scrollTop = $(targetContainerID).originalScrollTop;
          $(targetContainerID).originalScrollTop = null;
        }
      });
    }
  },
  getSysIDArray: function(selected, callback, suffixCallback) {
    var sysIDs = [];
    for (var i = 0; i < selected.length; i++) {
      var dr = selected[i];
      var sysID = dr.getSysID();
      if (suffixCallback)
        sysIDs[sysIDs.length] = sysID + suffixCallback(dr);
      else
        sysIDs[sysIDs.length] = sysID;
      callback(dr.dr.getElem(), sysID);
    }
    return sysIDs;
  },
  getSelectedOrdered: function(selected) {
    var newSelected = [];
    var maxIndex = -1;
    for (var i = 0; i < selected.length; i++) {
      var index = selected[i].dr.getElem().previousSiblings().length;
      if (index > maxIndex)
        maxIndex = index;
      newSelected[index] = selected[i];
    }
    if (maxIndex > -1) {
      selected = [];
      for (var i = 0; i < maxIndex + 1; i++)
        if (newSelected[i])
          selected[selected.length] = newSelected[i];
    }
    return selected;
  },
  commitChanges: function(sysIDs, targetSysID, targetInsertLocation, callback, sysParms, sourceContainerID, targetContainerID, errorCallback) {
    if (!sysParms)
      return;
    var sysIDsCSV = "";
    for (var i = 0; i < sysIDs.length; i++)
      if (i > 0)
        sysIDsCSV += ("," + sysIDs[i]);
      else
        sysIDsCSV += sysIDs[i];
    var ga = new GlideAjax('AjaxSortUpdateHandler');
    ga.addParam('sysparm_name', 'updateItems');
    ga.addParam('sysparm_ids', sysIDsCSV);
    ga.addParam('sysparm_target_id', targetSysID);
    ga.addParam('sysparm_target_insert_location', targetInsertLocation);
    ga.setErrorCallback(errorCallback);
    for (var key in sysParms)
      ga.addParam(key, sysParms[key]);
    ga.getXML(function(res) {
      $(sourceContainerID).originalScrollTop = $(sourceContainerID).scrollTop;
      $(targetContainerID).originalScrollTop = $(targetContainerID).scrollTop;
      callback();
    });
  },
  createPopupHandlers: function(elem, tableName, getIDCallback) {
    elem.on('mousedown', '.list_popup', function(ev, el) {
      ev.stop();
    });
    elem.on('click', '.list_popup', function(ev, el) {
      ev.stop();
    });
    elem.on('mouseover', '.list_popup', function(ev, el) {
      var record_class = el.up("tr").getAttribute("record_class");
      var sys_id = el.up("tr").getAttribute("sys_id");
      var id = el.up(".list_row").getAttribute("id");
      if (!getIDCallback || id.endsWith("_temp"))
        popListDiv(ev, tableName, sys_id, 'default');
      else if (getIDCallback)
        popListDiv(ev, tableName, getIDCallback(sys_id), 'default');
      if (isMSIE && getFormContentParent() != document.body) {
        var handler;
        handler = function() {
          var pop = $(nowapi.g_popup_manager.POPUP_PREFIX + sys_id + "POPPER");
          var shim = $(nowapi.g_popup_manager.POPUP_PREFIX + sys_id + "POPPERSHIM");
          if (pop) {
            CustomEvent.un('frame.resized', handler);
            var pos = getViewableArea().getTopLeft();
            var bounds = BoundsUtil.getInstance().getElemBounds(el);
            var x = bounds.left + pos.x + 15;
            var y = bounds.top + pos.y + 15;
            if (shim) {
              shim.parentNode.removeChild(shim);
              document.body.appendChild(shim);
              shim.style.top = y + "px";
              shim.style.left = x + "px";
            }
            pop.parentNode.removeChild(pop);
            document.body.appendChild(pop);
            pop.style.top = y + "px";
            pop.style.left = x + "px";
          }
        }
        CustomEvent.observe('frame.resized', handler);
      }
      ev.stop();
    });
    elem.on('mouseout', '.list_popup', function(ev, el) {
      lockPopup(ev);
      ev.stop();
    });
  },
  prepareList: function(containerID, ignoreID, formDetails, tableName, getIDCallback) {
    var thisUtil = this;
    var formDialogDef;
    if (formDetails)
      formDialogDef = new FormDialogDefinition(null, formDetails.table, formDetails.container, formDetails.view, "false").setCloseCallback(formDetails.callback).setOpenCallback(formDetails.openCallback);
    if (tableName)
      thisUtil.createPopupHandlers($(containerID), tableName, getIDCallback);
    $(containerID).select(".list_popup").each(function(elem) {
      if (tableName) {} else if (formDetails) {
        var sys_id = "";
        var decoRow = elem.up("tr");
        sys_id = decoRow.getAttribute("sys_id");
        decoRow.setAttribute("record_class", formDetails.table);
        elem.parentNode.on("click", function(evt) {
          evt.stop();
          return false;
        });
        elem.on("click", function() {
          if (nowapi.g_popup_manager)
            nowapi.g_popup_manager.destroypopDiv();
          formDialogDef.open(sys_id, null, null, null);
          return false;
        });
      } else
        elem.parentNode.style.display = "none";
    });
    $(containerID).select(".linked").each(function(elem) {
      if (ignoreID && elem.getAttribute("id") == ignoreID)
        return;
      if (document.all)
        $(elem.parentNode).update(elem.innerText);
      else
        $(elem.parentNode).update(elem.textContent);
    });
  },
  sortAllBySpecificColumn: function(column, callback, sysParms, sourceContainerID, targetContainerID, errorCallback) {
    var ga = new GlideAjax('AjaxSortUpdateHandler');
    ga.addParam('sysparm_name', 'sortAllBySpecificColumn');
    for (var key in sysParms)
      ga.addParam(key, sysParms[key]);
    ga.addParam('sysparm_order_by', column);
    ga.setErrorCallback(errorCallback);
    ga.getXML(function(res) {
      $(sourceContainerID).originalScrollTop = $(sourceContainerID).scrollTop;
      $(targetContainerID).originalScrollTop = $(targetContainerID).scrollTop;
      callback();
    });
  },
  createDialog: function(topTarget, target, id, title, markup, backSuffix, noClose, getContainerBounds) {
    Utility.getInstance().showBackground(target, 1050, backSuffix);
    var dialog = new GlideDialogWindow(id, noClose);
    dialog.setTitle(title);
    dialog.setBody(markup, false, false);
    var div = $(id);
    div.style.zIndex = 1051;
    div.style.visibility = "visible";
    return dialog;
  },
  promptOK: function(topTarget, target, title, message, callback) {
    var markup = "<div id='promptDiv' style='overflow-x: hidden; padding-right: 14px; overflow-y: auto'><table>" +
      "<tr><td style='text-align: center'>&nbsp;</td></tr>" +
      "<tr><td style='text-align: center'>" + message + "</td></tr>" +
      "<tr><td style='text-align: center'>&nbsp;</td></tr>" +
      "<tr><td style='text-align: center'><button id='ok_button_bottom' type='button'>" + getMessage("OK") + "</button></td></tr>" +
      "</table></div>";
    var dialog = this.createDialog(topTarget, target, "prompt_window", title, markup, "sort_prompt", false);
    $("ok_button_bottom").on("click", function() {
      dialog._onCloseClicked();
    });
    dialog.on("beforeclose", function() {
      Utility.getInstance().hideBackground("sort_prompt");
      if (callback)
        callback();
    });
  },
  getEnabled: function(tableID) {
    var listElem;
    if (!$(tableID + "_table"))
      listElem = $(tableID);
    else
      listElem = $(tableID + "_table");
    var count = 0;
    if (listElem) {
      var elems = $(listElem).childElements();
      for (var i = 0; i < elems.length; i++)
        if (elems[i].tagName == "tbody" || elems[i].tagName == "TBODY") {
          var row = elems[i].down("tr");
          while (row) {
            if (row.hasClassName("list_row") && row.dr && !row.dr.dr.isDisabled())
              count++;
            row = row.next();
          }
        }
    }
    return count;
  }
});
SortUtil.instance = new SortUtil();
SortUtil.getInstance = function() {
  return SortUtil.instance;
};
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
          $("leftPane")