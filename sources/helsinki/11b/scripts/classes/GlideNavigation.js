/*! RESOURCE: /scripts/classes/GlideNavigation.js */ ;
(function() {
  var GlideNavigation = function() {};
  GlideNavigation.prototype = {
    open: function(url, target) {
      if (target) {
        window.open(url, target);
        return;
      }
      window.location.href = url;
    },
    openList: function(table, query) {
      var url = table + '_list.do';
      if (query)
        url += "?sysparm_query=" + encodeURIComponent(query);
      this.open(url);
    },
    openRecord: function(table, sys_id) {
      var url = table + '.do?sys_id=' + sys_id;
      this.open(url);
    },
    reloadWindow: function() {
      if (window.location.reload)
        window.location.reload();
    },
    refreshNavigator: function() {
      CustomEvent.fireTop('navigator.refresh');
    },
    getURL: function() {
      return window.location.href;
    },
    openPopup: function(url, name, features, noStack) {
      if (noStack === true && url.indexOf("sysparm_nameofstack") == -1)
        url += "&sysparm_stack=no";
      var win = window.open(url, name, features, false);
      return win;
    },
    setPermalink: function(title, relativePath) {
      CustomEvent.fireTop('magellanNavigator.permalink.set', {
        title: title,
        relativePath: relativePath
      });
    },
    addUserHistoryEntry: function(title, relativePath, description, isTable) {
      if (typeof description == "undefined")
        description = "";
      if (typeof isTable == "undefined")
        isTable = false;
      CustomEvent.fireTop('magellanNavigator.sendHistoryEvent', {
        title: title,
        url: relativePath,
        description: description,
        isTable: isTable
      });
    }
  };
  window.g_navigation = new GlideNavigation();
})();;