/*! RESOURCE: /scripts/app.$sp/service.spUtil.js */
angular.module('sn.$sp').factory('spUtil', function($rootScope, $http, $location, snRecordWatcher, $q, $log, spPreference, spConf, $window) {
  "use strict";
  var spUtil = {
    localeMap: {
      pb: "pt-br",
      zh: "zh-cn",
      cs: "cs",
      nl: "nl",
      et: "et",
      fi: "fi",
      fr: "fr",
      fq: "fr-ca",
      de: "de",
      he: "he",
      hu: "hu",
      it: "it",
      ja: "ja",
      ko: "ko",
      pl: "pl",
      pt: "pt",
      ru: "ru",
      es: "es",
      th: "th",
      zt: "zh-cn",
      tr: "tr"
    },
    AMBIGUOUS_TIME_ZONES: {
      "ACT": "Australia/Darwin",
      "AET": "Australia/Sydney",
      "AGT": "America/Argentina/Buenos_Aires",
      "ART": "Africa/Cairo",
      "AST": "America/Anchorage",
      "BET": "America/Sao_Paulo",
      "BST": "Asia/Dhaka",
      "CAT": "Africa/Harare",
      "CNT": "America/St_Johns",
      "CST": "America/Chicago",
      "CTT": "Asia/Shanghai",
      "EAT": "Africa/Addis_Ababa",
      "ECT": "Europe/Paris",
      "IET": "America/Indiana/Indianapolis",
      "IST": "Asia/Kolkata",
      "JST": "Asia/Tokyo",
      "MIT": "Pacific/Apia",
      "NET": "Asia/Yerevan",
      "NST": "Pacific/Auckland",
      "PLT": "Asia/Karachi",
      "PNT": "America/Phoenix",
      "PRT": "America/Puerto_Rico",
      "PST": "America/Los_Angeles",
      "SST": "Pacific/Guadalcanal",
      "VST": "Asia/Ho_Chi_Minh"
    },
    getMomentTimeZone: function(tzName) {
      if (!tzName)
        return;
      if (moment.tz.zone(tzName) != null)
        return tzName;
      if (typeof this.AMBIGUOUS_TIME_ZONES[tzName] !== "undefined")
        return this.AMBIGUOUS_TIME_ZONES[tzName];
      return tzName;
    },
    isMobile: function() {
      if (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)) {
        return true;
      } else {
        return false;
      }
    },
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
    get: function($scope, data) {
      var qs = $location.search();
      return $http({
        method: 'POST',
        url: this.getWidgetURL($scope),
        params: qs,
        headers: this.getHeaders(),
        data: data
      }).then(function(response) {
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
        return r;
      });
    },
    getHeaders: function() {
      return {
        'Accept': 'application/json',
        'x-portal': $rootScope.portal_id,
        'X-UserToken': $window.g_ck
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
    addWarningMessage: function(message) {
      $rootScope.$broadcast("$$uiNotification", {
        type: "warning",
        message: message
      });
    },
    clearMessages: function() {
      $rootScope.$broadcast("$$uiNotification.dismiss");
    },
    getURL: function(type) {
      var n;
      if (type !== null && typeof type === 'object') {
        n = $.param(type);
      } else {
        n = $.param({
          sysparm_type: spConf.sysParamType,
          sysparm_ck: $window.g_ck,
          type: type
        });
      }
      return spConf.angularProcessor + '?' + n;
    },
    getHost: function() {
      var host = $location.protocol() + '://' + $location.host();
      if ($location.port()) {
        host += ':' + $location.port();
      }
      return host;
    },
    scrollTo: function(id, time) {
      $rootScope.$broadcast('$sp.scroll', {
        selector: id,
        time: time || 1000,
        offset: 'header'
      });
    },
    getAccelerator: function(char) {
      if (!$window.ontouchstart) {
        if ($window.navigator.userAgent.indexOf("Mac OS X") > -1) {
          return '⌘ + ' + char;
        } else {
          return 'Ctrl + ' + char;
        }
      }
      return '';
    },
    recordWatch: function($scope, table, filter, callback) {
      if (!table) {
        $log.debug("spUtil.recordWatch called with no table");
        return;
      }
      var watcherChannel = snRecordWatcher.initChannel(table, filter || 'sys_id!=-1');
      var subscribe = callback || function() {
        $scope.server.update()
      };
      watcherChannel.subscribe(subscribe);
      $scope.$on('$destroy', function() {
        watcherChannel.unsubscribe();
      });
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
    },
    parseAttributes: function(strAttributes) {
      if (typeof strAttributes === 'object')
        return strAttributes;
      var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
      var attributeObj = {};
      for (var i = 0; i < attributeArray.length; i++) {
        if (attributeArray[i].length > 0) {
          var attribute = attributeArray[i].split('=');
          attributeObj[attribute[0].trim()] = attribute.length > 1 ? attribute[1].trim() : '';
        }
      }
      return attributeObj;
    }
  };
  return spUtil;
});