var GlideWidgetUpdateListener = Class.create(GlideListWidget, {
  initialize: function($super, listID) {
    $super(listID + '_updateListener', listID);
    this._ids = [];
    this.registerRows();
  },
  registerRows: function() {
    var myList = this._myList();
    var myRows = myList.listDiv.select('tr.list_row');
    for (var i = 0; i < myRows.length; i++) {
      this._ids.push(myRows[i].readAttribute('sys_id'));
    }
    UpdateListener.register(myList.getTableName(), this._ids, myList.fieldNames, this.updateRow.bind(this));
  },
  _refresh: function() {
    var tableName = this._myList().getTableName();
    this._ids.each(function(id) {
      UpdateListener.unregister(tableName, id);
    });
    this._ids = [];
    this.registerRows();
  },
  _myList: function() {
    return GlideList2.get(this.listID);
  },
  updateRow: function(updated) {
    var myList = this._myList();
    var sys_id = updated.attributes.getNamedItem('sys_id').value;
    var items = updated.childNodes;
    for (var i = 0; i < items.length; i++) {
      var cell = myList.getCell(sys_id, items[i].attributes.getNamedItem('fqField').value);
      GlideList2.updateCellContents(cell, items[i].firstChild);
    }
  },
  type: 'GlideWidgetUpdateListener'
});
GlideWidgetUpdateListener.ID_PREFIX = 'GlideWidgetUpdateListener:';
GlideWidgetUpdateListener.getInstance = function(listID) {
  var id = GlideWidgetUpdateListener.ID_PREFIX + listID;
  var widget = GlideListWidget.get(id);
  if (widget == null) {
    widget = new GlideWidgetUpdateListener(listID);
  }
  return widget;
}