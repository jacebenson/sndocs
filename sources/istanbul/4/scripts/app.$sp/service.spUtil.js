/*! RESOURCE: /scripts/app.$sp/service.spUtil.js */
angular.module('sn.$sp').factory('spUtil', function(nowServer, $rootScope, $http, $location, snRecordWatcher, $q, spPreference) {
  "use strict";
  var spUtil = {
    format: function(tpl, data) {
      var re = /{([^}]+)?}/g,
        match;
      while (match = new RegExp(re).exec(tpl)) {
        tpl = tpl.replace(match[0], data[match[1]]);
      }
      return tpl;
    },
    update: function($scope) {
      var s = $scope;
      return this.get(s, s.data).then(function(response) {
        if (!response)
          return {};
        angular.extend(s.data, response.data);
        return response.data;
      })
    },
    refresh: function($scope) {
      var s = $scope;
      return this.get(s, null).then(function(response) {
        angular.extend(s.options, response.options);
        angular.extend(s.data, response.data);
        return response;
      })
    },
    triggerTableUIAction: function(action, table, recordID) {
      var req = {
        method: "POST",
        url: "/api/now/sp/uiaction/" + action.id,
        headers: this.getHeaders(),
        data: {
          table: table,
          recordID: recordID
        }
      };
      return $http(req).then(qs, qe);

      function qs(response) {
        var r = response.data.result;
        if (r && r.$$uiNotification)
          $rootScope.$broadcast("$$uiNotification", r.$$uiNotification);
        return r;
      }

      function qe(error) {
        console.log("Error " + error.status + " " + error.statusText);
      }
    },
    get: function($scope, data) {
      var defer = $q.defer();
      var t = this.getWidgetURL($scope);
      var req = {
        method: 'POST',
        url: t,
        headers: this.getHeaders(),
        data: data
      };
      $http(req).then(qs, qe);

      function qs(response) {
        var r = response.data.result;
        if (r && r._server_time) {
          var w = $scope.widget;
          if (w)
            w._server_time = r._server_time;
        }
        if (r && r.$$uiNotification) {
          if ($scope.$emit)
            $scope.$emit("$$uiNotification", r.$$uiNotification);
          else
            $rootScope.$broadcast("$$uiNotification", r.$$uiNotification);
        }
        defer.resolve(r);
      }

      function qe(error) {
        console.log("Error " + error.status + " " + error.statusText);
        defer.reject(error);
      }
      return defer.promise;
    },
    getHeaders: function() {
      return {
        'Accept': 'application/json',
        'x-portal': $rootScope.portal_id
      };
    },
    getWidgetURL: function(arg) {
      if (typeof arg == 'string')
        return "/api/now/sp/widget/" + arg;
      else if (arg.widget && arg.widget.rectangle_id)
        return "/api/now/sp/rectangle/" + arg.widget.rectangle_id;
      else
        return "/api/now/sp/widget/" + arg.widget.sys_id;
    },
    setBreadCrumb: function($scope, list) {
      $scope.$emit('sp.update.breadcrumbs', list);
    },
    setSearchPage: function(searchPage) {
      $rootScope.$emit("update.searchpage", searchPage);
    },
    addTrivialMessage: function(message) {
      $rootScope.$broadcast("$$uiNotification", {
        type: "trivial",
        message: message
      });
    },
    addInfoMessage: function(message) {
      $rootScope.$broadcast("$$uiNotification", {
        type: "info",
        message: message
      });
    },
    addErrorMessage: function(message) {
      $rootScope.$broadcast("$$uiNotification", {
        type: "error",
        message: message
      });
    },
    getURL: function(type) {
      var dataURL = nowServer.getURL("$sp");
      var n = {
        sysparm_ck: g_ck,
        type: type
      };
      Object.keys(n).forEach(function(t) {
        dataURL += "&" + t + "=" + n[t]
      });
      return dataURL;
    },
    getHost: function() {
      var host = $location.protocol() + '://' + $location.host();
      if ($location.port()) {
        host += ':' + $location.port();
      }
      return host;
    },
    scrollTo: function(id, time) {
      var t = time || 1000;
      var offset = $('.navbar').height() || 0;
      $('section').animate({
        scrollTop: $(id).offset().top - offset - 10
      }, t);
    },
    getAccelerator: function(char) {
      var t = "";
      if (typeof window.ontouchstart == "undefined") {
        if (navigator.userAgent.indexOf("Mac OS X") > -1)
          t = "⌘ + " + char;
        else
          t = "Ctrl + " + char;
      }
      return t;
    },
    recordWatch: function($scope, table, filter, callback) {
      filter = filter || 'sys_id!=-1';
      var watcherChannel = snRecordWatcher.initChannel(table, filter);
      var deregister = $scope.$on('record.updated', function(name, data) {
        if (data.table_name != table)
          return;
        if (callback)
          callback(name, data);
        else
          $scope.server.update();
      })
      $scope.$on('$destroy', function() {
        deregister();
        watcherChannel.unsubscribe();
      })
    },
    createUid: function(str) {
      return str.replace(/[xy]/g, function(c) {
        var r, v;
        r = Math.random() * 16 | 0;
        v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    },
    setPreference: function(pref, value) {
      spPreference.set(pref, value);
    },
    getPreference: function(pref, callback) {
      spPreference.get(pref, callback);
    }
  }
  return spUtil;
});