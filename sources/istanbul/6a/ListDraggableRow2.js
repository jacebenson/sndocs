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