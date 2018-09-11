/*! RESOURCE: /scripts/classes/GlideNavigation.js */ ;
(function() {
  var GlideNavigation = function() {};
  var MAX_URL_LENGTH = 2000;
  var _open = function(url, target) {
    if (target) {
      window.open(url, target);
      return;
    }
    window.location.href = url;
  };
  GlideNavigation.prototype = {
    open: function(url, target) {
      if (url.length <= MAX_URL_LENGTH) {
        _open(url, target);
        return;
      }
      jQuery.ajax({
        type: "POST",
        url: '/api/now/tinyurl',
        data: JSON.stringify({
          url: url
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
      }).done(function(response) {
        _open(response.result, target);
      });
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