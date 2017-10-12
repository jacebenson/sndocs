/*! RESOURCE: /scripts/classes/GlideList2Statics.js */
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