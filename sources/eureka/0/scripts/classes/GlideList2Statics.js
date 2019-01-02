var GlideLists2 = {};
GlideList2.LIST_BODY_START = "<!--LIST_BODY_START-->";
GlideList2.LIST_BODY_END = "<!--LIST_BODY_END-->";
GlideList2.LOADING_MSG = "<div class='list_loading_div'>Loading...<img src='images/ajax-loader.gifx' alt='Loading...' style='padding-left: 2px;'></div>";
GlideList2.unload = function() {
  for (var id in GlideLists2) {
    var list = GlideLists2[id];
    list.destroy();
    GlideLists2[id] = null;
  }
  g_list = null;
  GlideLists2 = {};
  CustomEvent.un("print.grouped.headers", GlideList2.breakGroupHeader);
}
GlideList2.get = function(idOrElement) {
  if (typeof idOrElement == 'string')
    return GlideLists2[idOrElement];
  return GlideList2._getByElement(idOrElement);
}
GlideList2.getIdByElement = function(element) {
  element = $(element);
  if (!element)
    return null;
  var div = element;
  do {
    div = findParentByTag(div, 'div');
    if (!div)
      break;
    var type = getAttributeValue(div, "type");
    if (type == "list_div")
      break;
  } while (div);
  if (!div)
    return null;
  return div.id;
}
GlideList2.getByName = function(name) {
  for (var id in GlideLists2) {
    var list = GlideLists2[id];
    if (list.getListName() == name)
      return list;
  }
  return null;
}
GlideList2.getListsForTable = function(table) {
  var lists = [];
  for (var id in GlideLists2) {
    var list = GlideLists2[id];
    if (list.getTableName() == table)
      lists.push(list);
  }
  return lists;
}
GlideList2._getByElement = function(element) {
  var id = this.getIdByElement(element);
  if (!id)
    return null;
  return GlideLists2[id];
}
GlideList2.breakGroupHeader = function(checkedFlag) {
  var breakStyle = "auto";
  if (checkedFlag)
    breakStyle = "always";
  var tds = document.getElementsByTagName("td");
  var len = tds.length;
  var first = true;
  for (var i = 0; i < len; i++) {
    var td = tds[i];
    if (getAttributeValue(td, "group_row_td") != "true")
      continue;
    if (first)
      first = false;
    else
      td.style.pageBreakBefore = breakStyle;
  }
  return false;
}
GlideList2.toggleAll = function(expandFlag) {
  for (var id in GlideLists2) {
    var list = GlideLists2[id];
    list.showHideList(expandFlag);
  }
}
GlideList2.updateCellContents = function(cell, data) {
  $(cell).setStyle({
    backgroundColor: '',
    cssText: data.getAttribute('style')
  });
  var work = document.createElement('div');
  cell.innerHTML = '';
  for (var child = data.firstChild; child; child = child.nextSibling) {
    work.innerHTML = getXMLString(child);
    cell.appendChild(work.firstChild);
  }
  cell.innerHTML.evalScripts(true);
  cell.removeClassName('list_edit_dirty');
  CustomEvent.fire("list_cell_changed", cell);
}