var GlideListWidget = Class.create();
GlideListWidget.prototype = {
  initialize: function(widgetID, listID) {
    this.widgetID = widgetID;
    this.listID = listID;
    GlideListWidgets[this.widgetID] = this;
    CustomEvent.observe('list.loaded', this.refresh.bind(this));
    CustomEvent.observe('partial.page.reload', this.refreshPartial.bind(this));
  },
  refresh: function(listTable, list) {
    if (list.listID != this.listID)
      return;
    this._refresh(listTable, list, true);
  },
  refreshPartial: function(listTable, list) {
    if (!list)
      return;
    if (list.listID != this.listID)
      return;
    this._refresh(listTable, list, false);
  },
  _refresh: function(listTable, list, isInitialLoad) {},
  _getElement: function(n) {
    return $(this.widgetID + "_" + n);
  },
  _getValue: function(n) {
    var e = this._getElement(n);
    if (!e)
      return "";
    return e.value;
  },
  _setValue: function(n, v) {
    var e = this._getElement(n);
    if (!e)
      return;
    e.value = v;
  },
  _setInner: function(n, v) {
    var e = this._getElement(n);
    if (!e)
      return;
    e.innerHTML = v;
  },
  type: 'GlideListWidget'
}
var GlideListWidgets = {};
GlideListWidget.get = function(id) {
  return GlideListWidgets[id];
}