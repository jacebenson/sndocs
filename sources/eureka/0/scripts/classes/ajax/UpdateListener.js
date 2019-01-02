var UpdateListener = (function() {
  'use strict';
  var PERIOD = 5000;
  var tables = new Hash();
  var pub = {};
  var lastPoll = new Date().valueOf();
  pub.register = function(tableName, ids, fields, callbackFn) {
    var table = pub.getTable(tableName);
    if (!table)
      return table;
    if (ids != null && ids.constructor.toString().indexOf("Array") == -1) {
      ids = [ids];
    }
    table.ids = ids;
    table.fields = (fields == null ? [] : fields);
    table.callback = callbackFn;
    return table;
  }
  pub.setPeriod = function(periodInMilliseconds) {
    PERIOD = periodInMilliseconds;
  }
  pub.unregister = function(tableName, sys_id) {
    if (typeof sys_id != 'undefined') {
      var table = pub.getTable(tableName);
      table.ids = table.ids.without(sys_id);
    } else {
      tables.unset(tableName);
    }
  }
  pub.getTable = function(name) {
    if (!name)
      return null;
    if (tables.get(name) == null) {
      tables.set(name, {
        ids: []
      });
    }
    return tables.get(name);
  }

  function anyIds() {
    var hasSome = false;
    if (tables.keys().size() > 0) {
      hasSome = tables.values().any(function(table) {
        return table.ids.length > 0;
      });
    }
    return hasSome;
  }
  pub.poll = function() {
    if (!anyIds()) {
      setTimeout(UpdateListener.poll, PERIOD);
    } else {
      var ga = new GlideAjax('com.glide.ui_list_edit.UpdateListenerAjax');
      ga.addParam('listenFor', Object.toJSON(tables));
      ga.addParam('lastPoll', lastPoll);
      lastPoll = new Date().valueOf();
      ga.getXML(function(response) {
        var updated = response.responseXML.documentElement.childNodes;
        for (var i = 0; i < updated.length; i++) {
          try {
            var table = updated[i].attributes.getNamedItem('table').value;
            var callbackFn = UpdateListener.getTable(table).callback;
            callbackFn(updated[i]);
          } catch (e) {}
        }
        setTimeout(UpdateListener.poll, PERIOD);
      });
    }
  }
  return pub;
}());
UpdateListener.poll();