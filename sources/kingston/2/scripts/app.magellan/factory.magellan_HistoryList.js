/*! RESOURCE: /scripts/app.magellan/factory.magellan_HistoryList.js */
angular.module('Magellan').factory('magellan_HistoryList', ['snCustomEvent', '$rootScope', 'glideUrlBuilder', function(snCustomEvent, $rootScope, glideUrlBuilder) {
  var historyList = [];

  function NavigatorHistory(history) {
    this.id = history.id;
    this.title = history.title;
    this.targetSysId = history.targetSysId;
    this.table = history.table;
    this.url = history.url;
    this.prettyTitle = history.prettyTitle;
    this.description = history.description;
    this.createdString = history.createdString;
    this.timestamp = history.timestamp;
    this.timestampOffset = history.timestampOffset;
  }
  NavigatorHistory.prototype.getCreatedDate = function() {
    return new Date(this.timestamp).getTime();
  };

  function populate(list) {
    historyList = [];
    for (var i = 0; i < list.length; i++) {
      historyList.push(new NavigatorHistory(list[i]));
    }
  }

  function add(history) {
    removeDuplicates(history);
    historyList.unshift(new NavigatorHistory(history));
    $rootScope.$broadcast('magellan_HistoryList.change', historyList);
  }

  function removeDuplicates(history) {
    if (history.timestampOffset) {
      for (var i = 0; i < historyList.length; i++) {
        var compare = historyList[i];
        if (compare.timestamp > history.timestampOffset) {
          if (sameUrl(compare.url, history.url)) {
            historyList.splice(i, 1);
          }
        } else {
          break;
        }
      }
    }
  }

  function sameUrl(a, b) {
    var blacklist;
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    a = a.replace('/', '');
    b = b.replace('/', '');
    if (window.top && window.top.Magellan && window.top.Magellan.globals && window.top.Magellan.globals.paramBlacklist) {
      blacklist = window.top.Magellan.globals.paramBlacklist;
    }
    if (blacklist) {
      var urlA = glideUrlBuilder.newGlideUrl(a);
      var urlB = glideUrlBuilder.newGlideUrl(b);
      var keys = Object.keys(jQuery.extend({}, urlA.getParams(), urlB.getParams()));
      for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        if (blacklist && blacklist.indexOf(key) != -1) {
          continue;
        }
        if (urlA.getParam(key) == urlB.getParam(key)) {
          continue;
        }
        return false;
      }
      return urlA.contextPath === urlB.contextPath;
    } else {
      return a === b;
    }
  }
  snCustomEvent.observe('magellanNavigator.historyAdded', function(data) {
    add(data.history);
  });
  return {
    get historyList() {
      return historyList;
    },
    populate: populate,
    add: add
  };
}]);;