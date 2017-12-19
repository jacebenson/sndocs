var GlideWidgetRowDecorationManager = Class.create(GlideListWidget, {
  initialize: function($super, listID, decorationID, decorators) {
    $super(GlideWidgetRowDecorationManager.ID_PREFIX + listID + decorationID, listID);
    this.decorated = {};
    this.decoratedRows = [];
    this._decorators = decorators;
  },
  toggle: function(relatedRows) {
    if (this.decorated[relatedRows.key] == null)
      this.on(relatedRows);
    else
      this.off(relatedRows);
  },
  on: function(relatedRows) {
    if (typeof(this._decorators) == 'function') {
      this._decorators(null, this._initDecorators.bind(this, relatedRows));
    } else {
      decorator = this._getNextDecorator();
      this.decorated[relatedRows.key] = decorator;
      this.decoratedRows.push(relatedRows);
      this._decorate(decorator.on.bind(decorator), relatedRows.rows);
    }
  },
  off: function(relatedRows) {
    decorator = this.decorated[relatedRows.key];
    this._decorators.unshift(decorator);
    this.decoratedRows = this.decoratedRows.filter(function(el) {
      return (Object.toJSON(el) != Object.toJSON(relatedRows));
    });
    this.decorated[relatedRows.key] = null;
    this._decorate(decorator.off.bind(decorator), relatedRows.rows);
  },
  isDecorated: function(sysId) {
    return this.decoratedRows.any(function(relatedRows) {
      return relatedRows.rows.any(function(row) {
        return (row == sysId);
      });
    });
  },
  _initDecorators: function(relatedRows, decorators) {
    this._decorators = decorators;
    this.on(relatedRows);
  },
  _getNextDecorator: function() {
    if (this._decorators.length == 0) {
      var victim = this.decoratedRows.shift();
      this.off(victim);
    }
    return this._decorators.shift();
  },
  _decorate: function(fn, rows) {
    var g_list = GlideList2.get(this.listID);
    for (var i = 0; i < rows.length; i++) {
      var tr = g_list.getRow(rows[i]);
      if (tr != null)
        fn(tr);
    }
  },
  _refresh: function(listTable, list, isInitialLoad) {
    if (!isInitialLoad) {
      var self = this;
      this.decoratedRows.each(function(relatedRows) {
        var decorator = self.decorated[relatedRows.key];
        self._decorate(decorator.on.bind(decorator), relatedRows.rows);
      });
    }
  },
  type: 'GlideWidgetRowDecorationManager'
});
GlideWidgetRowDecorationManager.ID_PREFIX = 'GlideWidgetRowDecorationManager:';
GlideWidgetRowDecorationManager.getInstance = function(listID, decorationID, decorators, relator) {
  var id = GlideWidgetRowDecorationManager.ID_PREFIX + listID + decorationID;
  var mgr = GlideListWidget.get(id);
  if (mgr == null)
    mgr = new GlideWidgetRowDecorationManager(listID, decorationID, decorators, relator);
  return mgr;
}