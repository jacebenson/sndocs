/*! RESOURCE: /scripts/js_includes_ngCommon.js */
/*! RESOURCE: /scripts/sn/common/js_includes_common.js */
/*! RESOURCE: /scripts/sn/common/_module.js */
angular.module('sn.common', [
  'ngSanitize',
  'ngAnimate',
  'sn.common.avatar',
  'sn.common.controls',
  'sn.common.datetime',
  'sn.common.glide',
  'sn.common.i18n',
  'sn.common.link',
  'sn.common.mention',
  'sn.common.messaging',
  'sn.common.notification',
  'sn.common.presence',
  'sn.common.stream',
  'sn.common.ui',
  'sn.common.user_profile',
  'sn.common.util'
]);
angular.module('ng.common', [
  'sn.common'
]);;
/*! RESOURCE: /scripts/sn/common/dist/templates.js */
angular.module('sn.common.dist.templates', []);;
/*! RESOURCE: /scripts/sn/common/datetime/js_includes_datetime.js */
/*! RESOURCE: /scripts/sn/common/datetime/_module.js */
angular.module('sn.common.datetime', [
  'sn.common.i18n'
]);
angular.module('sn.timeAgo', [
  'sn.common.datetime'
]);;
/*! RESOURCE: /scripts/sn/common/datetime/directive.snTimeAgo.js */
angular.module('sn.common.datetime').constant('DATE_GRANULARITY', {
  DATETIME: 1,
  DATE: 2
});
angular.module('sn.common.datetime').factory('timeAgoTimer', function($interval, $rootScope, DATE_GRANULARITY) {
  "use strict";
  var digestInterval;
  return function(displayGranularityType) {
    displayGranularityType = typeof displayGranularityType !== 'undefined' ? displayGranularityType : DATE_GRANULARITY.DATETIME;
    if (!digestInterval && displayGranularityType == DATE_GRANULARITY.DATETIME)
      digestInterval = $interval(function() {
        $rootScope.$broadcast('sn.TimeAgo.tick');
      }, 30 * 1000);
    return Date.now();
  };
});
angular.module('sn.common.datetime').factory('timeAgo', function(timeAgoSettings, DATE_GRANULARITY) {
  var service = {
    settings: timeAgoSettings.get(),
    allowFuture: function allowFuture(bool) {
      this.settings.allowFuture = bool;
      return this;
    },
    toWords: function toWords(distanceMillis, messageGranularity) {
      messageGranularity = messageGranularity || DATE_GRANULARITY.DATETIME;
      var $l = service.settings.strings;
      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;
      var ago = $l.ago;
      if ((seconds < 45 && messageGranularity == DATE_GRANULARITY.DATETIME) ||
        (hours < 24 && messageGranularity == DATE_GRANULARITY.DATE) ||
        (!service.settings.allowFuture && distanceMillis < 0))
        ago = '%d';
      if (service.settings.allowFuture) {
        if (distanceMillis < 0) {
          ago = $l.fromNow;
        }
      }

      function substitute(stringOrFunction, number) {
        var string = angular.isFunction(stringOrFunction) ?
          stringOrFunction(number, distanceMillis) : stringOrFunction;
        if (!string)
          return "";
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }
      var wantDate = messageGranularity == DATE_GRANULARITY.DATE;
      var wantDateTime = messageGranularity == DATE_GRANULARITY.DATETIME;
      var words = distanceMillis <= 0 && wantDateTime && substitute($l.justNow, 0) ||
        distanceMillis <= 0 && wantDate && substitute($l.today, 0) ||
        seconds < 45 && (distanceMillis >= 0 || !service.settings.allowFuture) && wantDateTime && substitute($l.justNow, Math.round(seconds)) ||
        seconds < 45 && wantDateTime && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && wantDateTime && substitute($l.minute, 1) ||
        minutes < 45 && wantDateTime && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && wantDateTime && substitute($l.hour, 1) ||
        hours < 24 && wantDateTime && substitute($l.hours, Math.round(hours)) ||
        hours < 24 && wantDate && substitute($l.today, 0) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.ceil(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));
      return substitute(ago, words);
    },
    parse: function(iso8601) {
      if (angular.isNumber(iso8601))
        return new Date(parseInt(iso8601, 10));
      var s = iso8601.trim();
      s = s.replace(/\.\d+/, "");
      s = s.replace(/-/, "/").replace(/-/, "/");
      s = s.replace(/T/, " ").replace(/Z/, " UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2");
      return new Date(s);
    }
  };
  return service;
});
angular.module('sn.common.datetime').directive("snTimeAgo", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
  "use strict";
  return {
    restrict: "E",
    template: '<time title="{{ ::titleTime }}">{{timeAgo}}</time>',
    scope: {
      timestamp: "=",
      local: "="
    },
    link: function(scope) {
      timeAgoSettings.ready.then(function() {
        timeAgoTimer(DATE_GRANULARITY.DATETIME)
        scope.$on('sn.TimeAgo.tick', setTimeAgo);
        setTimeAgo();
      });

      function setTimeAgo() {
        scope.timeAgo = timeAgoConverter(scope.timestamp, true);
      }

      function timeAgoConverter(input, noFuture) {
        if (!input)
          return;
        var allowFuture = !noFuture;
        var date = timeAgo.parse(input);
        if (scope.local) {
          scope.titleTime = input;
          return timeAgo.allowFuture(allowFuture).toWords(new Date() - date);
        }
        if (Object.prototype.toString.call(date) !== "[object Date]" && Object.prototype.toString.call(date) !== "[object Number]")
          return input;
        else if (Object.prototype.toString.call(date) == "[object Date]" && isNaN(date.getTime()))
          return input;
        setTitleTime(date);
        var currentDate = new Date();
        currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds());
        var diff = currentDate - date;
        return timeAgo.allowFuture(allowFuture).toWords(diff);
      }

      function setTitleTime(date) {
        var t = date.getTime();
        var o = date.getTimezoneOffset();
        t -= o * 60 * 1000;
        scope.titleTime = new Date(t).toLocaleString();
      }
    }
  }
});
angular.module('sn.common.datetime').directive("snTimeAgoStatic", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
  "use strict";
  return {
    restrict: "E",
    template: '<time title="{{ ::titleTime }}">{{timeAgo}}</time>',
    scope: {
      timestamp: "@",
      local: "@"
    },
    link: function(scope) {
      timeAgoSettings.ready.then(function() {
        timeAgoTimer(DATE_GRANULARITY.DATETIME)
        scope.$on('sn.TimeAgo.tick', setTimeAgo);
        setTimeAgo();
      });

      function setTimeAgo() {
        scope.timeAgo = timeAgoConverter(scope.timestamp, true);
      }

      function timeAgoConverter(input, noFuture) {
        if (!input)
          return;
        var allowFuture = !noFuture;
        var date = timeAgo.parse(input);
        if (scope.local) {
          scope.titleTime = input;
          return timeAgo.allowFuture(allowFuture).toWords(new Date() - date);
        }
        if (Object.prototype.toString.call(date) !== "[object Date]" && Object.prototype.toString.call(date) !== "[object Number]")
          return input;
        else if (Object.prototype.toString.call(date) == "[object Date]" && isNaN(date.getTime()))
          return input;
        setTitleTime(date);
        var currentDate = new Date();
        currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds());
        var diff = currentDate - date;
        return timeAgo.allowFuture(allowFuture).toWords(diff);
      }

      function setTitleTime(date) {
        var t = date.getTime();
        var o = date.getTimezoneOffset();
        t -= o * 60 * 1000;
        scope.titleTime = new Date(t).toLocaleString();
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/datetime/directive.snDayAgo.js */
angular.module('sn.common.datetime').directive("snDayAgo", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
  "use strict";
  return {
    restrict: "E",
    template: '<time>{{dayAgo}}</time>',
    scope: {
      date: "="
    },
    link: function(scope) {
      timeAgoSettings.ready.then(function() {
        setDayAgo();
      });

      function setDayAgo() {
        scope.dayAgo = dayAgoConverter(scope.date, "noFuture");
      }

      function dayAgoConverter(input, option) {
        if (!input) return;
        var allowFuture = !((option === 'noFuture') || (option === 'no_future'));
        var date = timeAgo.parse(input);
        if (Object.prototype.toString.call(date) !== "[object Date]")
          return input;
        else if (isNaN(date.getTime()))
          return input;
        var diff = timeAgoTimer(DATE_GRANULARITY.DATE) - date;
        return timeAgo.allowFuture(allowFuture).toWords(diff, DATE_GRANULARITY.DATE);
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/datetime/snTimeAgoSettings.js */
angular.module('sn.common.datetime').provider('snTimeAgoSettings', function() {
  "use strict";
  var INIT_NEVER = 'never';
  var INIT_AUTO = 'auto';
  var INIT_MANUAL = 'manual';
  var _initMethod = INIT_AUTO;
  this.setInitializationMethod = function(init) {
    switch (init) {
      default: init = INIT_AUTO;
      case INIT_NEVER:
          case INIT_AUTO:
          case INIT_MANUAL:
          _initMethod = init;
        break;
    }
  };
  this.$get = function(i18n, $q) {
    var settings = {
      allowFuture: true,
      dateOnly: false,
      strings: {}
    };
    var _initialized = false;
    var ready = $q.defer();

    function initialize() {
      if (_initMethod === INIT_NEVER) {
        return $q.reject();
      }
      if (!_initialized) {
        _initialized = true;
        i18n.getMessages(['%d ago', '%d from now', 'just now',
          'less than a minute', 'about a minute', '%d minutes', 'about an hour', 'about %d hours', 'today', 'a day', '%d days',
          'about a month', '%d months', 'about a year', 'about a year', '%d years'
        ], function(msgs) {
          settings.strings = {
            ago: msgs['%d ago'],
            fromNow: msgs['%d from now'],
            justNow: msgs["just now"],
            seconds: msgs["less than a minute"],
            minute: msgs["about a minute"],
            minutes: msgs["%d minutes"],
            hour: msgs["about an hour"],
            hours: msgs["about %d hours"],
            day: msgs["a day"],
            days: msgs["%d days"],
            month: msgs["about a month"],
            months: msgs["%d months"],
            year: msgs["about a year"],
            years: msgs["%d years"],
            today: msgs["today"],
            wordSeparator: msgs["timeago_number_separator"],
            numbers: []
          };
          ready.resolve();
        });
      }
      return ready.promise;
    }
    if (_initMethod === INIT_AUTO) {
      initialize();
    }
    return {
      initialize: initialize,
      ready: ready.promise,
      get: function get() {
        return settings;
      },
      set: function set(translated) {
        settings = angular.extend(settings, translated);
      }
    };
  };
}).factory('timeAgoSettings', function(snTimeAgoSettings) {
  return snTimeAgoSettings;
});;;
/*! RESOURCE: /scripts/sn/common/glide/js_includes_glide.js */
/*! RESOURCE: /scripts/sn/common/glide/_module.js */
angular.module('sn.common.glide', [
  'sn.common.util'
]);;
/*! RESOURCE: /scripts/sn/common/glide/factory.glideUrlBuilder.js */
angular.module('sn.common.glide').factory('glideUrlBuilder', ['$window', function($window) {
  "use strict";

  function GlideUrl(contextPath) {
    var objDef = {
      contextPath: '',
      params: {},
      encodedString: '',
      encode: true,
      setFromCurrent: function() {
        this.setFromString($window.location.href);
      },
      setFromString: function(href) {
        var pos = href.indexOf('?');
        if (pos < 0) {
          this.contextPath = href;
          return;
        }
        this.contextPath = href.slice(0, pos);
        var hashes = href.slice(pos + 1).split('&');
        var i = hashes.length;
        while (i--) {
          var pos = hashes[i].indexOf('=');
          this.params[hashes[i].substring(0, pos)] = hashes[i].substring(++pos);
        }
      },
      setContextPath: function(c) {
        this.contextPath = c;
      },
      getParam: function(p) {
        return this.params[p];
      },
      getParams: function() {
        return this.params;
      },
      addParam: function(name, value) {
        this.params[name] = value;
        return this;
      },
      addToken: function() {
        if (typeof g_ck != 'undefined' && g_ck != "")
          this.addParam('sysparm_ck', g_ck);
        return this;
      },
      deleteParam: function(name) {
        delete this.params[name];
      },
      addEncodedString: function(s) {
        if (!s)
          return;
        if (s.substr(0, 1) != "&")
          this.encodedString += "&";
        this.encodedString += s;
        return this;
      },
      getQueryString: function(additionalParams) {
        var qs = this._getParamsForURL(this.params);
        qs += this._getParamsForURL(additionalParams);
        qs += this.encodedString;
        if (qs.length == 0)
          return "";
        return qs.substring(1);
      },
      _getParamsForURL: function(params) {
        if (!params)
          return '';
        var url = '';
        for (var n in params) {
          var p = params[n] || '';
          url += '&' + n + '=' + (this.encode ? encodeURIComponent(p + '') : p);
        }
        return url;
      },
      getURL: function(additionalParams) {
        var url = this.contextPath;
        var qs = this.getQueryString(additionalParams);
        if (qs)
          url += "?" + qs;
        return url;
      },
      setEncode: function(b) {
        this.encode = b;
      },
      toString: function() {
        return 'GlideURL';
      }
    }
    return objDef;
  }
  return {
    newGlideUrl: function(contextPath) {
      var glideUrl = new GlideUrl();
      glideUrl.setFromString(contextPath ? contextPath : '');
      return glideUrl;
    },
    refresh: function() {
      $window.location.replace($window.location.href);
    },
    getCancelableLink: function(link) {
      if ($window.NOW && $window.NOW.g_cancelPreviousTransaction) {
        var nextChar = link.indexOf('?') > -1 ? '&' : '?';
        link += nextChar + "sysparm_cancelable=true";
      }
      return link;
    }
  };
}]);;
/*! RESOURCE: /scripts/sn/common/glide/service.queryFilter.js */
angular.module('sn.common.glide').factory('queryFilter', function() {
  "use strict";
  return {
    create: function() {
      var that = {};
      that.conditions = [];

      function newCondition(field, operator, value, label, displayValue, type) {
        var condition = {
          field: field,
          operator: operator,
          value: value,
          displayValue: displayValue,
          label: label,
          left: null,
          right: null,
          type: null,
          setValue: function(value, displayValue) {
            this.value = value;
            this.displayValue = displayValue ? displayValue : value;
          }
        };
        if (type)
          condition.type = type;
        return condition;
      }

      function addCondition(condition) {
        that.conditions.push(condition);
        return condition;
      }

      function removeCondition(condition) {
        for (var i = that.conditions.length - 1; i >= 0; i--) {
          if (that.conditions[i] === condition)
            that.conditions.splice(i, 1);
        }
      }

      function getConditionsByField(conditions, field) {
        var conditionsToReturn = [];
        for (var condition in conditions) {
          if (conditions.hasOwnProperty(condition)) {
            if (conditions[condition].field == field)
              conditionsToReturn.push(conditions[condition]);
          }
        }
        return conditionsToReturn;
      }

      function encodeCondition(condition) {
        var output = "";
        if (condition.hasOwnProperty("left") && condition.left) {
          output += encodeCondition(condition.left);
        }
        if (condition.hasOwnProperty("right") && condition.right) {
          var right = encodeCondition(condition.right);
          if (right.length > 0) {
            output += "^" + condition.type + right;
          }
        }
        if (condition.field) {
          output += condition.field;
          output += condition.operator;
          if (condition.value !== null && typeof condition.value !== "undefined")
            output += condition.value;
        }
        return output;
      }

      function createEncodedQuery() {
        var eq = "";
        var ca = that.conditions;
        for (var i = 0; i < ca.length; i++) {
          var condition = ca[i];
          if (eq.length)
            eq += '^';
          eq += encodeCondition(condition);
        }
        eq += "^EQ";
        return eq;
      }
      that.addCondition = addCondition;
      that.newCondition = newCondition;
      that.createEncodedQuery = createEncodedQuery;
      that.getConditionsByField = getConditionsByField;
      that.removeCondition = removeCondition;
      return that;
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/glide/service.filterExpressionParser.js */
angular.module('sn.common.glide').factory('filterExpressionParser', function() {
  'use strict';
  var operatorExpressions = [{
    wildcardExp: '(.*)',
    operator: 'STARTSWITH',
    toExpression: function(filter) {
      return filter;
    }
  }, {
    wildcardExp: '^\\*(.*)',
    operator: 'LIKE',
    toExpression: function(filter) {
      return (filter === '*' ? filter : '*' + filter);
    }
  }, {
    wildcardExp: '^\\.(.*)',
    operator: 'LIKE',
    toExpression: function(filter) {
      return '.' + filter;
    }
  }, {
    wildcardExp: '^%(.*)',
    operator: 'ENDSWITH',
    toExpression: function(filter) {
      return (filter === '%' ? filter : '%' + filter);
    }
  }, {
    wildcardExp: '(.*)%',
    operator: 'LIKE',
    toExpression: function(filter) {
      return filter + '%';
    }
  }, {
    wildcardExp: '^=(.*)',
    operator: '=',
    toExpression: function(filter) {
      return (filter === '=' ? filter : '=' + filter);
    }
  }, {
    wildcardExp: '^!\\*(.*)',
    operator: 'NOT LIKE',
    toExpression: function(filter) {
      return (filter === '!*' || filter === '!' ? filter : '!*' + filter);
    }
  }, {
    wildcardExp: '^!=(.*)',
    operator: '!=',
    toExpression: function(filter) {
      return (filter === '!=' || filter === '!' ? filter : '!=' + filter);
    }
  }];
  return {
    getOperatorExpressionForOperator: function(operator) {
      for (var i = 0; i < operatorExpressions.length; i++) {
        var item = operatorExpressions[i];
        if (item.operator === operator)
          return item;
      }
      throw {
        name: 'OperatorNotSupported',
        message: 'The operator ' + operator + ' is not in the list of operatorExpressions.'
      };
    },
    parse: function(val, defaultOperator) {
      var parsedValue = {
        filterText: val,
        operator: defaultOperator || 'STARTSWITH'
      };
      for (var i = 1; i < operatorExpressions.length; i++) {
        var operatorItem = operatorExpressions[i];
        var match = val.match(operatorItem.wildcardExp);
        if (match && match[1] !== '') {
          parsedValue.operator = operatorItem.operator;
          parsedValue.filterText = match[1];
        }
      }
      return parsedValue;
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/glide/service.userPreferences.js */
angular.module('sn.common.glide').factory("userPreferences", function($http, $q, unwrappedHTTPPromise, urlTools) {
  "use strict";
  var preferencesCache = {};

  function getPreference(preferenceName) {
    if (preferenceName in preferencesCache)
      return preferencesCache[preferenceName];
    var targetURL = urlTools.getURL('user_preference', {
        "sysparm_pref_name": preferenceName,
        "sysparm_action": "get"
      }),
      deferred = $q.defer();
    $http.get(targetURL).success(function(response) {
      deferred.resolve(response.sysparm_pref_value);
    }).error(function(data, status) {
      deferred.reject("Error getting preference " + preferenceName + ": " + status);
    });
    preferencesCache[preferenceName] = deferred.promise;
    return deferred.promise;
  }

  function setPreference(preferenceName, preferenceValue) {
    var targetURL = urlTools.getURL('user_preference', {
      "sysparm_pref_name": preferenceName,
      "sysparm_action": "set",
      "sysparm_pref_value": "" + preferenceValue
    });
    var httpPromise = $http.get(targetURL);
    addToCache(preferenceName, preferenceValue);
    return unwrappedHTTPPromise(httpPromise);
  }

  function addToCache(preferenceName, preferenceValue) {
    preferencesCache[preferenceName] = $q.when(preferenceValue);
  }
  var userPreferences = {
    getPreference: getPreference,
    setPreference: setPreference,
    addToCache: addToCache
  };
  return userPreferences;
});;
/*! RESOURCE: /scripts/sn/common/glide/service.nowStream.js */
angular.module('sn.common.glide').constant('nowStreamTimerInterval', 5000);
angular.module('sn.common.glide').factory('nowStream', function($q, $timeout, urlTools, nowStreamTimerInterval, snResource, $log) {
  'use strict';
  var Stream = function() {
    this.initialize.apply(this, arguments);
  };
  Stream.prototype = {
    initialize: function(table, query, sys_id, processor, interval, source, includeAttachments) {
      this.table = table;
      this.query = query;
      this.sysparmQuery = null;
      this.sys_id = sys_id;
      this.processor = processor;
      this.lastTimestamp = 0;
      this.inflightRequest = null;
      this.requestImmediateUpdate = false;
      this.interval = interval;
      this.source = source;
      this.includeAttachments = includeAttachments;
      this.stopped = true;
    },
    setQuery: function(sysparmQuery) {
      this.sysparmQuery = sysparmQuery;
    },
    poll: function(callback, preRequestCallback) {
      this.callback = callback;
      this.preRequestCallback = preRequestCallback;
      this._stopPolling();
      this._startPolling();
    },
    tap: function() {
      if (!this.inflightRequest) {
        this._stopPolling();
        this._startPolling();
      } else
        this.requestImmediateUpdate = true;
    },
    insert: function(field, text) {
      this.insertForEntry(field, text, this.table, this.sys_id);
    },
    insertForEntry: function(field, text, table, sys_id) {
      return this.insertEntries([{
        field: field,
        text: text
      }], table, sys_id);
    },
    expandMentions: function(entryText, mentionIDMap) {
      return entryText.replace(/@\[(.+?)\]/gi, function(mention) {
        var mentionedName = mention.substring(2, mention.length - 1);
        if (mentionIDMap[mentionedName]) {
          return "@[" + mentionIDMap[mentionedName] + ":" + mentionedName + "]";
        } else {
          return mention;
        }
      });
    },
    insertEntries: function(entries, table, sys_id, mentionIDMap) {
      mentionIDMap = mentionIDMap || {};
      var sanitizedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var entryText = entries[i].text;
        if (entryText && entryText.endsWith('\n'))
          entryText = entryText.substring(0, entryText.length - 1);
        if (!entryText)
          continue;
        entries[i].text = this.expandMentions(entryText, mentionIDMap);
        sanitizedEntries.push(entries[i]);
      }
      if (sanitizedEntries.length === 0)
        return;
      this._isInserting = true;
      var url = this._getInsertURL(table, sys_id);
      var that = this;
      return snResource().post(url, {
        entries: sanitizedEntries
      }).then(this._successCallback.bind(this), function() {
        $log.warn('Error submitting entries', sanitizedEntries);
      }).then(function() {
        that._isInserting = false;
      });
    },
    cancel: function() {
      this._stopPolling();
    },
    _startPolling: function() {
      var interval = this._getInterval();
      var that = this;
      var successCallback = this._successCallback.bind(this);
      that.stopped = false;

      function runPoll() {
        if (that._isInserting) {
          establishNextRequest();
          return;
        }
        if (!that.inflightRequest) {
          that.inflightRequest = that._executeRequest();
          that.inflightRequest.then(successCallback);
          that.inflightRequest.finally(function() {
            that.inflightRequest = null;
            if (that.requestImmediateUpdate) {
              that.requestImmediateUpdate = false;
              establishNextRequest(0);
            } else {
              establishNextRequest();
            }
          });
        }
      }

      function establishNextRequest(intervalOverride) {
        if (that.stopped)
          return;
        intervalOverride = (parseFloat(intervalOverride) >= 0) ? intervalOverride : interval;
        $timeout.cancel(that.timer);
        that.timer = $timeout(runPoll, intervalOverride);
      }
      runPoll();
    },
    _stopPolling: function() {
      if (this.timer)
        $timeout.cancel(this.timer);
      this.stopped = true;
    },
    _executeRequest: function() {
      var url = this._getURL();
      if (this.preRequestCallback) {
        this.preRequestCallback();
      }
      return snResource().get(url);
    },
    _getURL: function() {
      var params = {
        table: this.table,
        action: this._getAction(),
        sysparm_silent_request: true,
        sysparm_auto_request: true,
        sysparm_timestamp: this.lastTimestamp,
        include_attachments: this.includeAttachments
      };
      if (this.sys_id) {
        params['sys_id'] = this.sys_id;
      } else if (this.sysparmQuery) {
        params['sysparm_query'] = this.sysparmQuery;
      }
      var url = urlTools.getURL(this.processor, params);
      if (!this.sys_id) {
        url += "&p=" + this.query;
      }
      return url;
    },
    _getInsertURL: function(table, sys_id) {
      return urlTools.getURL(this.processor, {
        action: 'insert',
        table: table,
        sys_id: sys_id,
        sysparm_timestamp: this.timestamp || 0,
        sysparm_source: this.source
      });
    },
    _successCallback: function(response) {
      var response = response.data;
      if (response.entries && response.entries.length) {
        response.entries = this._filterOld(response.entries);
        if (response.entries.length > 0) {
          this.lastEntry = angular.copy(response.entries[0]);
          this.lastTimestamp = response.sys_timestamp || response.entries[0].sys_timestamp;
        }
      }
      this.callback.call(null, response);
    },
    _filterOld: function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].sys_timestamp == this.lastTimestamp) {
          if (this.lastEntry) {
            if (!angular.equals(this._makeComparable(entries[i]), this._makeComparable(this.lastEntry)))
              continue;
          }
        }
        if (entries[i].sys_timestamp <= this.lastTimestamp)
          return entries.slice(0, i);
      }
      return entries;
    },
    _makeComparable: function(entry) {
      var copy = angular.copy(entry);
      delete copy.short_description;
      delete copy.display_value;
      return copy;
    },
    _getAction: function() {
      return this.sys_id ? 'get_new_entries' : 'get_set_entries';
    },
    _getInterval: function() {
      if (this.interval)
        return this.interval;
      else if (window.NOW && NOW.stream_poll_interval)
        return NOW.stream_poll_interval * 1000;
      else
        return nowStreamTimerInterval;
    }
  };
  return {
    create: function(table, query, sys_id, processor, interval, source) {
      return new Stream(table, query, sys_id, processor, interval, source);
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/glide/service.nowServer.js */
angular.module('sn.common.glide').factory('nowServer', function($http, $q, userPreferences, angularProcessorUrl, urlTools) {
  return {
    getBaseURL: function() {
      return angularProcessorUrl;
    },
    getPartial: function(scope, partial, parms, callback) {
      var url = this.getPartialURL(partial, parms);
      if (url === scope.url) {
        callback.call();
        return;
      }
      var fn = scope.$on('$includeContentLoaded', function() {
        fn.call();
        callback.call();
      });
      scope.url = url;
    },
    replaceView: function($location, newView) {
      var p = $location.path();
      var a = p.split("/");
      a[1] = newView;
      p = a.join("/");
      return p;
    },
    getPartialURL: urlTools.getPartialURL,
    getURL: urlTools.getURL,
    urlFor: urlTools.urlFor,
    getPropertyURL: urlTools.getPropertyURL,
    setPreference: userPreferences.setPreference,
    getPreference: userPreferences.getPreference
  }
});;;
/*! RESOURCE: /scripts/sn/common/avatar/js_includes_avatar.js */
/*! RESOURCE: /scripts/sn/common/presence/js_includes_presence.js */
/*! RESOURCE: /scripts/js_includes_ng_amb.js */
/*! RESOURCE: /scripts/js_includes_amb.js */
/*! RESOURCE: /scripts/thirdparty/cometd/org/cometd.js */
(function(root) {
  var org = root.org || {};
  root.org = org;
  org.cometd = {};
  org.cometd.JSON = {};
  org.cometd.JSON.toJSON = org.cometd.JSON.fromJSON = function(object) {
    throw 'Abstract';
  };
  org.cometd.Utils = {};
  org.cometd.Utils.isString = function(value) {
    if (value === undefined || value === null) {
      return false;
    }
    return typeof value === 'string' || value instanceof String;
  };
  org.cometd.Utils.isArray = function(value) {
    if (value === undefined || value === null) {
      return false;
    }
    return value instanceof Array;
  };
  org.cometd.Utils.inArray = function(element, array) {
    for (var i = 0; i < array.length; ++i) {
      if (element === array[i]) {
        return i;
      }
    }
    return -1;
  };
  org.cometd.Utils.setTimeout = function(cometd, funktion, delay) {
    return window.setTimeout(function() {
      try {
        funktion();
      } catch (x) {
        cometd._debug('Exception invoking timed function', funktion, x);
      }
    }, delay);
  };
  org.cometd.Utils.clearTimeout = function(timeoutHandle) {
    window.clearTimeout(timeoutHandle);
  };
  org.cometd.TransportRegistry = function() {
    var _types = [];
    var _transports = {};
    this.getTransportTypes = function() {
      return _types.slice(0);
    };
    this.findTransportTypes = function(version, crossDomain, url) {
      var result = [];
      for (var i = 0; i < _types.length; ++i) {
        var type = _types[i];
        if (_transports[type].accept(version, crossDomain, url) === true) {
          result.push(type);
        }
      }
      return result;
    };
    this.negotiateTransport = function(types, version, crossDomain, url) {
      for (var i = 0; i < _types.length; ++i) {
        var type = _types[i];
        for (var j = 0; j < types.length; ++j) {
          if (type === types[j]) {
            var transport = _transports[type];
            if (transport.accept(version, crossDomain, url) === true) {
              return transport;
            }
          }
        }
      }
      return null;
    };
    this.add = function(type, transport, index) {
      var existing = false;
      for (var i = 0; i < _types.length; ++i) {
        if (_types[i] === type) {
          existing = true;
          break;
        }
      }
      if (!existing) {
        if (typeof index !== 'number') {
          _types.push(type);
        } else {
          _types.splice(index, 0, type);
        }
        _transports[type] = transport;
      }
      return !existing;
    };
    this.find = function(type) {
      for (var i = 0; i < _types.length; ++i) {
        if (_types[i] === type) {
          return _transports[type];
        }
      }
      return null;
    };
    this.remove = function(type) {
      for (var i = 0; i < _types.length; ++i) {
        if (_types[i] === type) {
          _types.splice(i, 1);
          var transport = _transports[type];
          delete _transports[type];
          return transport;
        }
      }
      return null;
    };
    this.clear = function() {
      _types = [];
      _transports = {};
    };
    this.reset = function() {
      for (var i = 0; i < _types.length; ++i) {
        _transports[_types[i]].reset();
      }
    };
  };
  org.cometd.Transport = function() {
    var _type;
    var _cometd;
    this.registered = function(type, cometd) {
      _type = type;
      _cometd = cometd;
    };
    this.unregistered = function() {
      _type = null;
      _cometd = null;
    };
    this._debug = function() {
      _cometd._debug.apply(_cometd, arguments);
    };
    this._mixin = function() {
      return _cometd._mixin.apply(_cometd, arguments);
    };
    this.getConfiguration = function() {
      return _cometd.getConfiguration();
    };
    this.getAdvice = function() {
      return _cometd.getAdvice();
    };
    this.setTimeout = function(funktion, delay) {
      return org.cometd.Utils.setTimeout(_cometd, funktion, delay);
    };
    this.clearTimeout = function(handle) {
      org.cometd.Utils.clearTimeout(handle);
    };
    this.convertToMessages = function(response) {
      if (org.cometd.Utils.isString(response)) {
        try {
          return org.cometd.JSON.fromJSON(response);
        } catch (x) {
          this._debug('Could not convert to JSON the following string', '"' + response + '"');
          throw x;
        }
      }
      if (org.cometd.Utils.isArray(response)) {
        return response;
      }
      if (response === undefined || response === null) {
        return [];
      }
      if (response instanceof Object) {
        return [response];
      }
      throw 'Conversion Error ' + response + ', typeof ' + (typeof response);
    };
    this.accept = function(version, crossDomain, url) {
      throw 'Abstract';
    };
    this.getType = function() {
      return _type;
    };
    this.send = function(envelope, metaConnect) {
      throw 'Abstract';
    };
    this.reset = function() {
      this._debug('Transport', _type, 'reset');
    };
    this.abort = function() {
      this._debug('Transport', _type, 'aborted');
    };
    this.toString = function() {
      return this.getType();
    };
  };
  org.cometd.Transport.derive = function(baseObject) {
    function F() {}
    F.prototype = baseObject;
    return new F();
  };
  org.cometd.RequestTransport = function() {
    var _super = new org.cometd.Transport();
    var _self = org.cometd.Transport.derive(_super);
    var _requestIds = 0;
    var _metaConnectRequest = null;
    var _requests = [];
    var _envelopes = [];

    function _coalesceEnvelopes(envelope) {
      while (_envelopes.length > 0) {
        var envelopeAndRequest = _envelopes[0];
        var newEnvelope = envelopeAndRequest[0];
        var newRequest = envelopeAndRequest[1];
        if (newEnvelope.url === envelope.url &&
          newEnvelope.sync === envelope.sync) {
          _envelopes.shift();
          envelope.messages = envelope.messages.concat(newEnvelope.messages);
          this._debug('Coalesced', newEnvelope.messages.length, 'messages from request', newRequest.id);
          continue;
        }
        break;
      }
    }

    function _transportSend(envelope, request) {
      this.transportSend(envelope, request);
      request.expired = false;
      if (!envelope.sync) {
        var maxDelay = this.getConfiguration().maxNetworkDelay;
        var delay = maxDelay;
        if (request.metaConnect === true) {
          delay += this.getAdvice().timeout;
        }
        this._debug('Transport', this.getType(), 'waiting at most', delay, 'ms for the response, maxNetworkDelay', maxDelay);
        var self = this;
        request.timeout = this.setTimeout(function() {
          request.expired = true;
          var errorMessage = 'Request ' + request.id + ' of transport ' + self.getType() + ' exceeded ' + delay + ' ms max network delay';
          var failure = {
            reason: errorMessage
          };
          var xhr = request.xhr;
          failure.httpCode = self.xhrStatus(xhr);
          self.abortXHR(xhr);
          self._debug(errorMessage);
          self.complete(request, false, request.metaConnect);
          envelope.onFailure(xhr, envelope.messages, failure);
        }, delay);
      }
    }

    function _queueSend(envelope) {
      var requestId = ++_requestIds;
      var request = {
        id: requestId,
        metaConnect: false
      };
      if (_requests.length < this.getConfiguration().maxConnections - 1) {
        _requests.push(request);
        _transportSend.call(this, envelope, request);
      } else {
        this._debug('Transport', this.getType(), 'queueing request', requestId, 'envelope', envelope);
        _envelopes.push([envelope, request]);
      }
    }

    function _metaConnectComplete(request) {
      var requestId = request.id;
      this._debug('Transport', this.getType(), 'metaConnect complete, request', requestId);
      if (_metaConnectRequest !== null && _metaConnectRequest.id !== requestId) {
        throw 'Longpoll request mismatch, completing request ' + requestId;
      }
      _metaConnectRequest = null;
    }

    function _complete(request, success) {
      var index = org.cometd.Utils.inArray(request, _requests);
      if (index >= 0) {
        _requests.splice(index, 1);
      }
      if (_envelopes.length > 0) {
        var envelopeAndRequest = _envelopes.shift();
        var nextEnvelope = envelopeAndRequest[0];
        var nextRequest = envelopeAndRequest[1];
        this._debug('Transport dequeued request', nextRequest.id);
        if (success) {
          if (this.getConfiguration().autoBatch) {
            _coalesceEnvelopes.call(this, nextEnvelope);
          }
          _queueSend.call(this, nextEnvelope);
          this._debug('Transport completed request', request.id, nextEnvelope);
        } else {
          var self = this;
          this.setTimeout(function() {
            self.complete(nextRequest, false, nextRequest.metaConnect);
            var failure = {
              reason: 'Previous request failed'
            };
            var xhr = nextRequest.xhr;
            failure.httpCode = self.xhrStatus(xhr);
            nextEnvelope.onFailure(xhr, nextEnvelope.messages, failure);
          }, 0);
        }
      }
    }
    _self.complete = function(request, success, metaConnect) {
      if (metaConnect) {
        _metaConnectComplete.call(this, request);
      } else {
        _complete.call(this, request, success);
      }
    };
    _self.transportSend = function(envelope, request) {
      throw 'Abstract';
    };
    _self.transportSuccess = function(envelope, request, responses) {
      if (!request.expired) {
        this.clearTimeout(request.timeout);
        this.complete(request, true, request.metaConnect);
        if (responses && responses.length > 0) {
          envelope.onSuccess(responses);
        } else {
          envelope.onFailure(request.xhr, envelope.messages, {
            httpCode: 204
          });
        }
      }
    };
    _self.transportFailure = function(envelope, request, failure) {
      if (!request.expired) {
        this.clearTimeout(request.timeout);
        this.complete(request, false, request.metaConnect);
        envelope.onFailure(request.xhr, envelope.messages, failure);
      }
    };

    function _metaConnectSend(envelope) {
      if (_metaConnectRequest !== null) {
        throw 'Concurrent metaConnect requests not allowed, request id=' + _metaConnectRequest.id + ' not yet completed';
      }
      var requestId = ++_requestIds;
      this._debug('Transport', this.getType(), 'metaConnect send, request', requestId, 'envelope', envelope);
      var request = {
        id: requestId,
        metaConnect: true
      };
      _transportSend.call(this, envelope, request);
      _metaConnectRequest = request;
    }
    _self.send = function(envelope, metaConnect) {
      if (metaConnect) {
        _metaConnectSend.call(this, envelope);
      } else {
        _queueSend.call(this, envelope);
      }
    };
    _self.abort = function() {
      _super.abort();
      for (var i = 0; i < _requests.length; ++i) {
        var request = _requests[i];
        this._debug('Aborting request', request);
        this.abortXHR(request.xhr);
      }
      if (_metaConnectRequest) {
        this._debug('Aborting metaConnect request', _metaConnectRequest);
        this.abortXHR(_metaConnectRequest.xhr);
      }
      this.reset();
    };
    _self.reset = function() {
      _super.reset();
      _metaConnectRequest = null;
      _requests = [];
      _envelopes = [];
    };
    _self.abortXHR = function(xhr) {
      if (xhr) {
        try {
          xhr.abort();
        } catch (x) {
          this._debug(x);
        }
      }
    };
    _self.xhrStatus = function(xhr) {
      if (xhr) {
        try {
          return xhr.status;
        } catch (x) {
          this._debug(x);
        }
      }
      return -1;
    };
    return _self;
  };
  org.cometd.LongPollingTransport = function() {
    var _super = new org.cometd.RequestTransport();
    var _self = org.cometd.Transport.derive(_super);
    var _supportsCrossDomain = true;
    _self.accept = function(version, crossDomain, url) {
      return _supportsCrossDomain || !crossDomain;
    };
    _self.xhrSend = function(packet) {
      throw 'Abstract';
    };
    _self.transportSend = function(envelope, request) {
      this._debug('Transport', this.getType(), 'sending request', request.id, 'envelope', envelope);
      var self = this;
      try {
        var sameStack = true;
        request.xhr = this.xhrSend({
          transport: this,
          url: envelope.url,
          sync: envelope.sync,
          headers: this.getConfiguration().requestHeaders,
          body: org.cometd.JSON.toJSON(envelope.messages),
          onSuccess: function(response) {
            self._debug('Transport', self.getType(), 'received response', response);
            var success = false;
            try {
              var received = self.convertToMessages(response);
              if (received.length === 0) {
                _supportsCrossDomain = false;
                self.transportFailure(envelope, request, {
                  httpCode: 204
                });
              } else {
                success = true;
                self.transportSuccess(envelope, request, received);
              }
            } catch (x) {
              self._debug(x);
              if (!success) {
                _supportsCrossDomain = false;
                var failure = {
                  exception: x
                };
                failure.httpCode = self.xhrStatus(request.xhr);
                self.transportFailure(envelope, request, failure);
              }
            }
          },
          onError: function(reason, exception) {
            _supportsCrossDomain = false;
            var failure = {
              reason: reason,
              exception: exception
            };
            failure.httpCode = self.xhrStatus(request.xhr);
            if (sameStack) {
              self.setTimeout(function() {
                self.transportFailure(envelope, request, failure);
              }, 0);
            } else {
              self.transportFailure(envelope, request, failure);
            }
          }
        });
        sameStack = false;
      } catch (x) {
        _supportsCrossDomain = false;
        this.setTimeout(function() {
          self.transportFailure(envelope, request, {
            exception: x
          });
        }, 0);
      }
    };
    _self.reset = function() {
      _super.reset();
      _supportsCrossDomain = true;
    };
    return _self;
  };
  org.cometd.CallbackPollingTransport = function() {
    var _super = new org.cometd.RequestTransport();
    var _self = org.cometd.Transport.derive(_super);
    var _maxLength = 2000;
    _self.accept = function(version, crossDomain, url) {
      return true;
    };
    _self.jsonpSend = function(packet) {
      throw 'Abstract';
    };
    _self.transportSend = function(envelope, request) {
      var self = this;
      var start = 0;
      var length = envelope.messages.length;
      var lengths = [];
      while (length > 0) {
        var json = org.cometd.JSON.toJSON(envelope.messages.slice(start, start + length));
        var urlLength = envelope.url.length + encodeURI(json).length;
        if (urlLength > _maxLength) {
          if (length === 1) {
            this.setTimeout(function() {
              self.transportFailure(envelope, request, {
                reason: 'Bayeux message too big, max is ' + _maxLength
              });
            }, 0);
            return;
          }
          --length;
          continue;
        }
        lengths.push(length);
        start += length;
        length = envelope.messages.length - start;
      }
      var envelopeToSend = envelope;
      if (lengths.length > 1) {
        var begin = 0;
        var end = lengths[0];
        this._debug('Transport', this.getType(), 'split', envelope.messages.length, 'messages into', lengths.join(' + '));
        envelopeToSend = this._mixin(false, {}, envelope);
        envelopeToSend.messages = envelope.messages.slice(begin, end);
        envelopeToSend.onSuccess = envelope.onSuccess;
        envelopeToSend.onFailure = envelope.onFailure;
        for (var i = 1; i < lengths.length; ++i) {
          var nextEnvelope = this._mixin(false, {}, envelope);
          begin = end;
          end += lengths[i];
          nextEnvelope.messages = envelope.messages.slice(begin, end);
          nextEnvelope.onSuccess = envelope.onSuccess;
          nextEnvelope.onFailure = envelope.onFailure;
          this.send(nextEnvelope, request.metaConnect);
        }
      }
      this._debug('Transport', this.getType(), 'sending request', request.id, 'envelope', envelopeToSend);
      try {
        var sameStack = true;
        this.jsonpSend({
          transport: this,
          url: envelopeToSend.url,
          sync: envelopeToSend.sync,
          headers: this.getConfiguration().requestHeaders,
          body: org.cometd.JSON.toJSON(envelopeToSend.messages),
          onSuccess: function(responses) {
            var success = false;
            try {
              var received = self.convertToMessages(responses);
              if (received.length === 0) {
                self.transportFailure(envelopeToSend, request, {
                  httpCode: 204
                });
              } else {
                success = true;
                self.transportSuccess(envelopeToSend, request, received);
              }
            } catch (x) {
              self._debug(x);
              if (!success) {
                self.transportFailure(envelopeToSend, request, {
                  exception: x
                });
              }
            }
          },
          onError: function(reason, exception) {
            var failure = {
              reason: reason,
              exception: exception
            };
            if (sameStack) {
              self.setTimeout(function() {
                self.transportFailure(envelopeToSend, request, failure);
              }, 0);
            } else {
              self.transportFailure(envelopeToSend, request, failure);
            }
          }
        });
        sameStack = false;
      } catch (xx) {
        this.setTimeout(function() {
          self.transportFailure(envelopeToSend, request, {
            exception: xx
          });
        }, 0);
      }
    };
    return _self;
  };
  org.cometd.WebSocketTransport = function() {
    var _super = new org.cometd.Transport();
    var _self = org.cometd.Transport.derive(_super);
    var _cometd;
    var _webSocketSupported = true;
    var _webSocketConnected = false;
    var _stickyReconnect = true;
    var _envelopes = {};
    var _timeouts = {};
    var _connecting = false;
    var _webSocket = null;
    var _connected = false;
    var _successCallback = null;
    _self.reset = function() {
      _super.reset();
      _webSocketSupported = true;
      _webSocketConnected = false;
      _stickyReconnect = true;
      _envelopes = {};
      _timeouts = {};
      _connecting = false;
      _webSocket = null;
      _connected = false;
      _successCallback = null;
    };

    function _websocketConnect() {
      if (_connecting) {
        return;
      }
      _connecting = true;
      var url = _cometd.getURL().replace(/^http/, 'ws');
      this._debug('Transport', this.getType(), 'connecting to URL', url);
      try {
        var protocol = _cometd.getConfiguration().protocol;
        var webSocket = protocol ? new org.cometd.WebSocket(url, protocol) : new org.cometd.WebSocket(url);
      } catch (x) {
        _webSocketSupported = false;
        this._debug('Exception while creating WebSocket object', x);
        throw x;
      }
      _stickyReconnect = _cometd.getConfiguration().stickyReconnect !== false;
      var self = this;
      var connectTimer = null;
      var connectTimeout = _cometd.getConfiguration().connectTimeout;
      if (connectTimeout > 0) {
        connectTimer = this.setTimeout(function() {
          connectTimer = null;
          self._debug('Transport', self.getType(), 'timed out while connecting to URL', url, ':', connectTimeout, 'ms');
          var event = {
            code: 1000,
            reason: 'Connect Timeout'
          };
          self.webSocketClose(webSocket, event.code, event.reason);
          self.onClose(webSocket, event);
        }, connectTimeout);
      }
      var onopen = function() {
        self._debug('WebSocket opened', webSocket);
        _connecting = false;
        if (connectTimer) {
          self.clearTimeout(connectTimer);
          connectTimer = null;
        }
        if (_webSocket) {
          _cometd._warn('Closing Extra WebSocket Connections', webSocket, _webSocket);
          self.webSocketClose(webSocket, 1000, 'Extra Connection');
        } else {
          self.onOpen(webSocket);
        }
      };
      var onclose = function(event) {
        event = event || {
          code: 1000
        };
        self._debug('WebSocket closing', webSocket, event);
        _connecting = false;
        if (connectTimer) {
          self.clearTimeout(connectTimer);
          connectTimer = null;
        }
        if (_webSocket !== null && webSocket !== _webSocket) {
          self._debug('Closed Extra WebSocket Connection', webSocket);
        } else {
          self.onClose(webSocket, event);
        }
      };
      var onmessage = function(message) {
        self._debug('WebSocket message', message, webSocket);
        if (webSocket !== _webSocket) {
          _cometd._warn('Extra WebSocket Connections', webSocket, _webSocket);
        }
        self.onMessage(webSocket, message);
      };
      webSocket.onopen = onopen;
      webSocket.onclose = onclose;
      webSocket.onerror = function() {
        onclose({
          code: 1002,
          reason: 'Error'
        });
      };
      webSocket.onmessage = onmessage;
      this._debug('Transport', this.getType(), 'configured callbacks on', webSocket);
    }

    function _webSocketSend(webSocket, envelope, metaConnect) {
      var json = org.cometd.JSON.toJSON(envelope.messages);
      webSocket.send(json);
      this._debug('Transport', this.getType(), 'sent', envelope, 'metaConnect =', metaConnect);
      var maxDelay = this.getConfiguration().maxNetworkDelay;
      var delay = maxDelay;
      if (metaConnect) {
        delay += this.getAdvice().timeout;
        _connected = true;
      }
      var self = this;
      var messageIds = [];
      for (var i = 0; i < envelope.messages.length; ++i) {
        (function() {
          var message = envelope.messages[i];
          if (message.id) {
            messageIds.push(message.id);
            _timeouts[message.id] = this.setTimeout(function() {
              self._debug('Transport', self.getType(), 'timing out message', message.id, 'after', delay, 'on', webSocket);
              var event = {
                code: 1000,
                reason: 'Message Timeout'
              };
              self.webSocketClose(webSocket, event.code, event.reason);
              self.onClose(webSocket, event);
            }, delay);
          }
        })();
      }
      this._debug('Transport', this.getType(), 'waiting at most', delay, 'ms for messages', messageIds, 'maxNetworkDelay', maxDelay, ', timeouts:', _timeouts);
    }

    function _send(webSocket, envelope, metaConnect) {
      try {
        if (webSocket === null) {
          _websocketConnect.call(this);
        } else {
          _webSocketSend.call(this, webSocket, envelope, metaConnect);
        }
      } catch (x) {
        this.setTimeout(function() {
          envelope.onFailure(webSocket, envelope.messages, {
            exception: x
          });
        }, 0);
      }
    }
    _self.onOpen = function(webSocket) {
      this._debug('Transport', this.getType(), 'opened', webSocket);
      _webSocket = webSocket;
      _webSocketConnected = true;
      this._debug('Sending pending messages', _envelopes);
      for (var key in _envelopes) {
        var element = _envelopes[key];
        var envelope = element[0];
        var metaConnect = element[1];
        _successCallback = envelope.onSuccess;
        _webSocketSend.call(this, webSocket, envelope, metaConnect);
      }
    };
    _self.onMessage = function(webSocket, wsMessage) {
      this._debug('Transport', this.getType(), 'received websocket message', wsMessage, webSocket);
      var close = false;
      var messages = this.convertToMessages(wsMessage.data);
      var messageIds = [];
      for (var i = 0; i < messages.length; ++i) {
        var message = messages[i];
        if (/^\/meta\//.test(message.channel) || message.successful !== undefined) {
          if (message.id) {
            messageIds.push(message.id);
            var timeout = _timeouts[message.id];
            if (timeout) {
              this.clearTimeout(timeout);
              delete _timeouts[message.id];
              this._debug('Transport', this.getType(), 'removed timeout for message', message.id, ', timeouts', _timeouts);
            }
          }
        }
        if ('/meta/connect' === message.channel) {
          _connected = false;
        }
        if ('/meta/disconnect' === message.channel && !_connected) {
          close = true;
        }
      }
      var removed = false;
      for (var j = 0; j < messageIds.length; ++j) {
        var id = messageIds[j];
        for (var key in _envelopes) {
          var ids = key.split(',');
          var index = org.cometd.Utils.inArray(id, ids);
          if (index >= 0) {
            removed = true;
            ids.splice(index, 1);
            var envelope = _envelopes[key][0];
            var metaConnect = _envelopes[key][1];
            delete _envelopes[key];
            if (ids.length > 0) {
              _envelopes[ids.join(',')] = [envelope, metaConnect];
            }
            break;
          }
        }
      }
      if (removed) {
        this._debug('Transport', this.getType(), 'removed envelope, envelopes', _envelopes);
      }
      _successCallback.call(this, messages);
      if (close) {
        this.webSocketClose(webSocket, 1000, 'Disconnect');
      }
    };
    _self.onClose = function(webSocket, event) {
      this._debug('Transport', this.getType(), 'closed', webSocket, event);
      _webSocketSupported = _stickyReconnect && _webSocketConnected;
      for (var id in _timeouts) {
        this.clearTimeout(_timeouts[id]);
      }
      _timeouts = {};
      for (var key in _envelopes) {
        var envelope = _envelopes[key][0];
        var metaConnect = _envelopes[key][1];
        if (metaConnect) {
          _connected = false;
        }
        envelope.onFailure(webSocket, envelope.messages, {
          websocketCode: event.code,
          reason: event.reason
        });
      }
      _envelopes = {};
      _webSocket = null;
    };
    _self.registered = function(type, cometd) {
      _super.registered(type, cometd);
      _cometd = cometd;
    };
    _self.accept = function(version, crossDomain, url) {
      return _webSocketSupported && !!org.cometd.WebSocket && _cometd.websocketEnabled !== false;
    };
    _self.send = function(envelope, metaConnect) {
      this._debug('Transport', this.getType(), 'sending', envelope, 'metaConnect =', metaConnect);
      var messageIds = [];
      for (var i = 0; i < envelope.messages.length; ++i) {
        var message = envelope.messages[i];
        if (message.id) {
          messageIds.push(message.id);
        }
      }
      _envelopes[messageIds.join(',')] = [envelope, metaConnect];
      this._debug('Transport', this.getType(), 'stored envelope, envelopes', _envelopes);
      _send.call(this, _webSocket, envelope, metaConnect);
    };
    _self.webSocketClose = function(webSocket, code, reason) {
      try {
        webSocket.close(code, reason);
      } catch (x) {
        this._debug(x);
      }
    };
    _self.abort = function() {
      _super.abort();
      if (_webSocket) {
        var event = {
          code: 1001,
          reason: 'Abort'
        };
        this.webSocketClose(_webSocket, event.code, event.reason);
        this.onClose(_webSocket, event);
      }
      this.reset();
    };
    return _self;
  };
  org.cometd.Cometd = function(name) {
    var _cometd = this;
    var _name = name || 'default';
    var _crossDomain = false;
    var _transports = new org.cometd.TransportRegistry();
    var _transport;
    var _status = 'disconnected';
    var _messageId = 0;
    var _clientId = null;
    var _batch = 0;
    var _messageQueue = [];
    var _internalBatch = false;
    var _listeners = {};
    var _backoff = 0;
    var _scheduledSend = null;
    var _extensions = [];
    var _advice = {};
    var _handshakeProps;
    var _handshakeCallback;
    var _callbacks = {};
    var _reestablish = false;
    var _connected = false;
    var _config = {
      protocol: null,
      stickyReconnect: true,
      connectTimeout: 0,
      maxConnections: 2,
      backoffIncrement: 1000,
      maxBackoff: 60000,
      logLevel: 'info',
      reverseIncomingExtensions: true,
      maxNetworkDelay: 10000,
      requestHeaders: {},
      appendMessageTypeToURL: true,
      autoBatch: false,
      advice: {
        timeout: 60000,
        interval: 0,
        reconnect: 'retry'
      }
    };

    function _fieldValue(object, name) {
      try {
        return object[name];
      } catch (x) {
        return undefined;
      }
    }
    this._mixin = function(deep, target, objects) {
      var result = target || {};
      for (var i = 2; i < arguments.length; ++i) {
        var object = arguments[i];
        if (object === undefined || object === null) {
          continue;
        }
        for (var propName in object) {
          var prop = _fieldValue(object, propName);
          var targ = _fieldValue(result, propName);
          if (prop === target) {
            continue;
          }
          if (prop === undefined) {
            continue;
          }
          if (deep && typeof prop === 'object' && prop !== null) {
            if (prop instanceof Array) {
              result[propName] = this._mixin(deep, targ instanceof Array ? targ : [], prop);
            } else {
              var source = typeof targ === 'object' && !(targ instanceof Array) ? targ : {};
              result[propName] = this._mixin(deep, source, prop);
            }
          } else {
            result[propName] = prop;
          }
        }
      }
      return result;
    };

    function _isString(value) {
      return org.cometd.Utils.isString(value);
    }

    function _isFunction(value) {
      if (value === undefined || value === null) {
        return false;
      }
      return typeof value === 'function';
    }

    function _log(level, args) {
      if (window.console) {
        var logger = window.console[level];
        if (_isFunction(logger)) {
          logger.apply(window.console, args);
        }
      }
    }
    this._warn = function() {
      _log('warn', arguments);
    };
    this._info = function() {
      if (_config.logLevel !== 'warn') {
        _log('info', arguments);
      }
    };
    this._debug = function() {
      if (_config.logLevel === 'debug') {
        _log('debug', arguments);
      }
    };
    this._isCrossDomain = function(hostAndPort) {
      return hostAndPort && hostAndPort !== window.location.host;
    };

    function _configure(configuration) {
      _cometd._debug('Configuring cometd object with', configuration);
      if (_isString(configuration)) {
        configuration = {
          url: configuration
        };
      }
      if (!configuration) {
        configuration = {};
      }
      _config = _cometd._mixin(false, _config, configuration);
      var url = _cometd.getURL();
      if (!url) {
        throw 'Missing required configuration parameter \'url\' specifying the Bayeux server URL';
      }
      var urlParts = /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(url);
      var hostAndPort = urlParts[2];
      var uri = urlParts[8];
      var afterURI = urlParts[9];
      _crossDomain = _cometd._isCrossDomain(hostAndPort);
      if (_config.appendMessageTypeToURL) {
        if (afterURI !== undefined && afterURI.length > 0) {
          _cometd._info('Appending message type to URI ' + uri + afterURI + ' is not supported, disabling \'appendMessageTypeToURL\' configuration');
          _config.appendMessageTypeToURL = false;
        } else {
          var uriSegments = uri.split('/');
          var lastSegmentIndex = uriSegments.length - 1;
          if (uri.match(/\/$/)) {
            lastSegmentIndex -= 1;
          }
          if (uriSegments[lastSegmentIndex].indexOf('.') >= 0) {
            _cometd._info('Appending message type to URI ' + uri + ' is not supported, disabling \'appendMessageTypeToURL\' configuration');
            _config.appendMessageTypeToURL = false;
          }
        }
      }
    }

    function _removeListener(subscription) {
      if (subscription) {
        var subscriptions = _listeners[subscription.channel];
        if (subscriptions && subscriptions[subscription.id]) {
          delete subscriptions[subscription.id];
          _cometd._debug('Removed', subscription.listener ? 'listener' : 'subscription', subscription);
        }
      }
    }

    function _removeSubscription(subscription) {
      if (subscription && !subscription.listener) {
        _removeListener(subscription);
      }
    }

    function _clearSubscriptions() {
      for (var channel in _listeners) {
        var subscriptions = _listeners[channel];
        if (subscriptions) {
          for (var i = 0; i < subscriptions.length; ++i) {
            _removeSubscription(subscriptions[i]);
          }
        }
      }
    }

    function _setStatus(newStatus) {
      if (_status !== newStatus) {
        _cometd._debug('Status', _status, '->', newStatus);
        _status = newStatus;
      }
    }

    function _isDisconnected() {
      return _status === 'disconnecting' || _status === 'disconnected';
    }

    function _nextMessageId() {
      return ++_messageId;
    }

    function _applyExtension(scope, callback, name, message, outgoing) {
      try {
        return callback.call(scope, message);
      } catch (x) {
        _cometd._debug('Exception during execution of extension', name, x);
        var exceptionCallback = _cometd.onExtensionException;
        if (_isFunction(exceptionCallback)) {
          _cometd._debug('Invoking extension exception callback', name, x);
          try {
            exceptionCallback.call(_cometd, x, name, outgoing, message);
          } catch (xx) {
            _cometd._info('Exception during execution of exception callback in extension', name, xx);
          }
        }
        return message;
      }
    }

    function _applyIncomingExtensions(message) {
      for (var i = 0; i < _extensions.length; ++i) {
        if (message === undefined || message === null) {
          break;
        }
        var index = _config.reverseIncomingExtensions ? _extensions.length - 1 - i : i;
        var extension = _extensions[index];
        var callback = extension.extension.incoming;
        if (_isFunction(callback)) {
          var result = _applyExtension(extension.extension, callback, extension.name, message, false);
          message = result === undefined ? message : result;
        }
      }
      return message;
    }

    function _applyOutgoingExtensions(message) {
      for (var i = 0; i < _extensions.length; ++i) {
        if (message === undefined || message === null) {
          break;
        }
        var extension = _extensions[i];
        var callback = extension.extension.outgoing;
        if (_isFunction(callback)) {
          var result = _applyExtension(extension.extension, callback, extension.name, message, true);
          message = result === undefined ? message : result;
        }
      }
      return message;
    }

    function _notify(channel, message) {
      var subscriptions = _listeners[channel];
      if (subscriptions && subscriptions.length > 0) {
        for (var i = 0; i < subscriptions.length; ++i) {
          var subscription = subscriptions[i];
          if (subscription) {
            try {
              subscription.callback.call(subscription.scope, message);
            } catch (x) {
              _cometd._debug('Exception during notification', subscription, message, x);
              var listenerCallback = _cometd.onListenerException;
              if (_isFunction(listenerCallback)) {
                _cometd._debug('Invoking listener exception callback', subscription, x);
                try {
                  listenerCallback.call(_cometd, x, subscription, subscription.listener, message);
                } catch (xx) {
                  _cometd._info('Exception during execution of listener callback', subscription, xx);
                }
              }
            }
          }
        }
      }
    }

    function _notifyListeners(channel, message) {
      _notify(channel, message);
      var channelParts = channel.split('/');
      var last = channelParts.length - 1;
      for (var i = last; i > 0; --i) {
        var channelPart = channelParts.slice(0, i).join('/') + '/*';
        if (i === last) {
          _notify(channelPart, message);
        }
        channelPart += '*';
        _notify(channelPart, message);
      }
    }

    function _cancelDelayedSend() {
      if (_scheduledSend !== null) {
        org.cometd.Utils.clearTimeout(_scheduledSend);
      }
      _scheduledSend = null;
    }

    function _delayedSend(operation) {
      _cancelDelayedSend();
      var delay = _advice.interval + _backoff;
      _cometd._debug('Function scheduled in', delay, 'ms, interval =', _advice.interval, 'backoff =', _backoff, operation);
      _scheduledSend = org.cometd.Utils.setTimeout(_cometd, operation, delay);
    }
    var _handleMessages;
    var _handleFailure;

    function _send(sync, messages, longpoll, extraPath) {
      for (var i = 0; i < messages.length; ++i) {
        var message = messages[i];
        var messageId = '' + _nextMessageId();
        message.id = messageId;
        if (_clientId) {
          message.clientId = _clientId;
        }
        var callback = undefined;
        if (_isFunction(message._callback)) {
          callback = message._callback;
          delete message._callback;
        }
        message = _applyOutgoingExtensions(message);
        if (message !== undefined && message !== null) {
          message.id = messageId;
          messages[i] = message;
          if (callback) {
            _callbacks[messageId] = callback;
          }
        } else {
          messages.splice(i--, 1);
        }
      }
      if (messages.length === 0) {
        return;
      }
      var url = _cometd.getURL();
      if (_config.appendMessageTypeToURL) {
        if (!url.match(/\/$/)) {
          url = url + '/';
        }
        if (extraPath) {
          url = url + extraPath;
        }
      }
      var envelope = {
        url: url,
        sync: sync,
        messages: messages,
        onSuccess: function(rcvdMessages) {
          try {
            _handleMessages.call(_cometd, rcvdMessages);
          } catch (x) {
            _cometd._debug('Exception during handling of messages', x);
          }
        },
        onFailure: function(conduit, messages, failure) {
          try {
            failure.connectionType = _cometd.getTransport().getType();
            _handleFailure.call(_cometd, conduit, messages, failure);
          } catch (x) {
            _cometd._debug('Exception during handling of failure', x);
          }
        }
      };
      _cometd._debug('Send', envelope);
      _transport.send(envelope, longpoll);
    }

    function _queueSend(message) {
      if (_batch > 0 || _internalBatch === true) {
        _messageQueue.push(message);
      } else {
        _send(false, [message], false);
      }
    }
    this.send = _queueSend;

    function _resetBackoff() {
      _backoff = 0;
    }

    function _increaseBackoff() {
      if (_backoff < _config.maxBackoff) {
        _backoff += _config.backoffIncrement;
      }
    }

    function _startBatch() {
      ++_batch;
    }

    function _flushBatch() {
      var messages = _messageQueue;
      _messageQueue = [];
      if (messages.length > 0) {
        _send(false, messages, false);
      }
    }

    function _endBatch() {
      --_batch;
      if (_batch < 0) {
        throw 'Calls to startBatch() and endBatch() are not paired';
      }
      if (_batch === 0 && !_isDisconnected() && !_internalBatch) {
        _flushBatch();
      }
    }

    function _connect() {
      if (!_isDisconnected()) {
        var message = {
          channel: '/meta/connect',
          connectionType: _transport.getType()
        };
        if (!_connected) {
          message.advice = {
            timeout: 0
          };
        }
        _setStatus('connecting');
        _cometd._debug('Connect sent', message);
        _send(false, [message], true, 'connect');
        _setStatus('connected');
      }
    }

    function _delayedConnect() {
      _setStatus('connecting');
      _delayedSend(function() {
        _connect();
      });
    }

    function _updateAdvice(newAdvice) {
      if (newAdvice) {
        _advice = _cometd._mixin(false, {}, _config.advice, newAdvice);
        _cometd._debug('New advice', _advice);
      }
    }

    function _disconnect(abort) {
      _cancelDelayedSend();
      if (abort) {
        _transport.abort();
      }
      _clientId = null;
      _setStatus('disconnected');
      _batch = 0;
      _resetBackoff();
      _transport = null;
      if (_messageQueue.length > 0) {
        _handleFailure.call(_cometd, undefined, _messageQueue, {
          reason: 'Disconnected'
        });
        _messageQueue = [];
      }
    }

    function _notifyTransportFailure(oldTransport, newTransport, failure) {
      var callback = _cometd.onTransportFailure;
      if (_isFunction(callback)) {
        _cometd._debug('Invoking transport failure callback', oldTransport, newTransport, failure);
        try {
          callback.call(_cometd, oldTransport, newTransport, failure);
        } catch (x) {
          _cometd._info('Exception during execution of transport failure callback', x);
        }
      }
    }

    function _handshake(handshakeProps, handshakeCallback) {
      if (_isFunction(handshakeProps)) {
        handshakeCallback = handshakeProps;
        handshakeProps = undefined;
      }
      _clientId = null;
      _clearSubscriptions();
      if (_isDisconnected()) {
        _transports.reset();
        _updateAdvice(_config.advice);
      } else {
        _updateAdvice(_cometd._mixin(false, _advice, {
          reconnect: 'retry'
        }));
      }
      _batch = 0;
      _internalBatch = true;
      _handshakeProps = handshakeProps;
      _handshakeCallback = handshakeCallback;
      var version = '1.0';
      var url = _cometd.getURL();
      var transportTypes = _transports.findTransportTypes(version, _crossDomain, url);
      var bayeuxMessage = {
        version: version,
        minimumVersion: version,
        channel: '/meta/handshake',
        supportedConnectionTypes: transportTypes,
        _callback: handshakeCallback,
        advice: {
          timeout: _advice.timeout,
          interval: _advice.interval
        }
      };
      var message = _cometd._mixin(false, {}, _handshakeProps, bayeuxMessage);
      if (!_transport) {
        _transport = _transports.negotiateTransport(transportTypes, version, _crossDomain, url);
        if (!_transport) {
          var failure = 'Could not find initial transport among: ' + _transports.getTransportTypes();
          _cometd._warn(failure);
          throw failure;
        }
      }
      _cometd._debug('Initial transport is', _transport.getType());
      _setStatus('handshaking');
      _cometd._debug('Handshake sent', message);
      _send(false, [message], false, 'handshake');
    }

    function _delayedHandshake() {
      _setStatus('handshaking');
      _internalBatch = true;
      _delayedSend(function() {
        _handshake(_handshakeProps, _handshakeCallback);
      });
    }

    function _handleCallback(message) {
      var callback = _callbacks[message.id];
      if (_isFunction(callback)) {
        delete _callbacks[message.id];
        callback.call(_cometd, message);
      }
    }

    function _failHandshake(message) {
      _handleCallback(message);
      _notifyListeners('/meta/handshake', message);
      _notifyListeners('/meta/unsuccessful', message);
      var retry = !_isDisconnected() && _advice.reconnect !== 'none';
      if (retry) {
        _increaseBackoff();
        _delayedHandshake();
      } else {
        _disconnect(false);
      }
    }

    function _handshakeResponse(message) {
      if (message.successful) {
        _clientId = message.clientId;
        var url = _cometd.getURL();
        var newTransport = _transports.negotiateTransport(message.supportedConnectionTypes, message.version, _crossDomain, url);
        if (newTransport === null) {
          var failure = 'Could not negotiate transport with server; client=[' +
            _transports.findTransportTypes(message.version, _crossDomain, url) +
            '], server=[' + message.supportedConnectionTypes + ']';
          var oldTransport = _cometd.getTransport();
          _notifyTransportFailure(oldTransport.getType(), null, {
            reason: failure,
            connectionType: oldTransport.getType(),
            transport: oldTransport
          });
          _cometd._warn(failure);
          _transport.reset();
          _failHandshake(message);
          return;
        } else if (_transport !== newTransport) {
          _cometd._debug('Transport', _transport.getType(), '->', newTransport.getType());
          _transport = newTransport;
        }
        _internalBatch = false;
        _flushBatch();
        message.reestablish = _reestablish;
        _reestablish = true;
        _handleCallback(message);
        _notifyListeners('/meta/handshake', message);
        var action = _isDisconnected() ? 'none' : _advice.reconnect;
        switch (action) {
          case 'retry':
            _resetBackoff();
            _delayedConnect();
            break;
          case 'none':
            _disconnect(false);
            break;
          default:
            throw 'Unrecognized advice action ' + action;
        }
      } else {
        _failHandshake(message);
      }
    }

    function _handshakeFailure(message) {
      var version = '1.0';
      var url = _cometd.getURL();
      var oldTransport = _cometd.getTransport();
      var transportTypes = _transports.findTransportTypes(version, _crossDomain, url);
      var newTransport = _transports.negotiateTransport(transportTypes, version, _crossDomain, url);
      if (!newTransport) {
        _notifyTransportFailure(oldTransport.getType(), null, message.failure);
        _cometd._warn('Could not negotiate transport; client=[' + transportTypes + ']');
        _transport.reset();
        _failHandshake(message);
      } else {
        _cometd._debug('Transport', oldTransport.getType(), '->', newTransport.getType());
        _notifyTransportFailure(oldTransport.getType(), newTransport.getType(), message.failure);
        _failHandshake(message);
        _transport = newTransport;
      }
    }

    function _failConnect(message) {
      _notifyListeners('/meta/connect', message);
      _notifyListeners('/meta/unsuccessful', message);
      var action = _isDisconnected() ? 'none' : _advice.reconnect;
      switch (action) {
        case 'retry':
          _delayedConnect();
          _increaseBackoff();
          break;
        case 'handshake':
          _transports.reset();
          _resetBackoff();
          _delayedHandshake();
          break;
        case 'none':
          _disconnect(false);
          break;
        default:
          throw 'Unrecognized advice action' + action;
      }
    }

    function _connectResponse(message) {
      _connected = message.successful;
      if (_connected) {
        _notifyListeners('/meta/connect', message);
        var action = _isDisconnected() ? 'none' : _advice.reconnect;
        switch (action) {
          case 'retry':
            _resetBackoff();
            _delayedConnect();
            break;
          case 'none':
            _disconnect(false);
            break;
          default:
            throw 'Unrecognized advice action ' + action;
        }
      } else {
        _failConnect(message);
      }
    }

    function _connectFailure(message) {
      _connected = false;
      _failConnect(message);
    }

    function _failDisconnect(message) {
      _disconnect(true);
      _handleCallback(message);
      _notifyListeners('/meta/disconnect', message);
      _notifyListeners('/meta/unsuccessful', message);
    }

    function _disconnectResponse(message) {
      if (message.successful) {
        _disconnect(false);
        _handleCallback(message);
        _notifyListeners('/meta/disconnect', message);
      } else {
        _failDisconnect(message);
      }
    }

    function _disconnectFailure(message) {
      _failDisconnect(message);
    }

    function _failSubscribe(message) {
      var subscriptions = _listeners[message.subscription];
      if (subscriptions) {
        for (var i = subscriptions.length - 1; i >= 0; --i) {
          var subscription = subscriptions[i];
          if (subscription && !subscription.listener) {
            delete subscriptions[i];
            _cometd._debug('Removed failed subscription', subscription);
            break;
          }
        }
      }
      _handleCallback(message);
      _notifyListeners('/meta/subscribe', message);
      _notifyListeners('/meta/unsuccessful', message);
    }

    function _subscribeResponse(message) {
      if (message.successful) {
        _handleCallback(message);
        _notifyListeners('/meta/subscribe', message);
      } else {
        _failSubscribe(message);
      }
    }

    function _subscribeFailure(message) {
      _failSubscribe(message);
    }

    function _failUnsubscribe(message) {
      _handleCallback(message);
      _notifyListeners('/meta/unsubscribe', message);
      _notifyListeners('/meta/unsuccessful', message);
    }

    function _unsubscribeResponse(message) {
      if (message.successful) {
        _handleCallback(message);
        _notifyListeners('/meta/unsubscribe', message);
      } else {
        _failUnsubscribe(message);
      }
    }

    function _unsubscribeFailure(message) {
      _failUnsubscribe(message);
    }

    function _failMessage(message) {
      _handleCallback(message);
      _notifyListeners('/meta/publish', message);
      _notifyListeners('/meta/unsuccessful', message);
    }

    function _messageResponse(message) {
      if (message.successful === undefined) {
        if (message.data !== undefined) {
          _notifyListeners(message.channel, message);
        } else {
          _cometd._warn('Unknown Bayeux Message', message);
        }
      } else {
        if (message.successful) {
          _handleCallback(message);
          _notifyListeners('/meta/publish', message);
        } else {
          _failMessage(message);
        }
      }
    }

    function _messageFailure(failure) {
      _failMessage(failure);
    }

    function _receive(message) {
      message = _applyIncomingExtensions(message);
      if (message === undefined || message === null) {
        return;
      }
      _updateAdvice(message.advice);
      var channel = message.channel;
      switch (channel) {
        case '/meta/handshake':
          _handshakeResponse(message);
          break;
        case '/meta/connect':
          _connectResponse(message);
          break;
        case '/meta/disconnect':
          _disconnectResponse(message);
          break;
        case '/meta/subscribe':
          _subscribeResponse(message);
          break;
        case '/meta/unsubscribe':
          _unsubscribeResponse(message);
          break;
        default:
          _messageResponse(message);
          break;
      }
    }
    this.receive = _receive;
    _handleMessages = function(rcvdMessages) {
      _cometd._debug('Received', rcvdMessages);
      for (var i = 0; i < rcvdMessages.length; ++i) {
        var message = rcvdMessages[i];
        _receive(message);
      }
    };
    _handleFailure = function(conduit, messages, failure) {
      _cometd._debug('handleFailure', conduit, messages, failure);
      failure.transport = conduit;
      for (var i = 0; i < messages.length; ++i) {
        var message = messages[i];
        var failureMessage = {
          id: message.id,
          successful: false,
          channel: message.channel,
          failure: failure
        };
        failure.message = message;
        switch (message.channel) {
          case '/meta/handshake':
            _handshakeFailure(failureMessage);
            break;
          case '/meta/connect':
            _connectFailure(failureMessage);
            break;
          case '/meta/disconnect':
            _disconnectFailure(failureMessage);
            break;
          case '/meta/subscribe':
            failureMessage.subscription = message.subscription;
            _subscribeFailure(failureMessage);
            break;
          case '/meta/unsubscribe':
            failureMessage.subscription = message.subscription;
            _unsubscribeFailure(failureMessage);
            break;
          default:
            _messageFailure(failureMessage);
            break;
        }
      }
    };

    function _hasSubscriptions(channel) {
      var subscriptions = _listeners[channel];
      if (subscriptions) {
        for (var i = 0; i < subscriptions.length; ++i) {
          if (subscriptions[i]) {
            return true;
          }
        }
      }
      return false;
    }

    function _resolveScopedCallback(scope, callback) {
      var delegate = {
        scope: scope,
        method: callback
      };
      if (_isFunction(scope)) {
        delegate.scope = undefined;
        delegate.method = scope;
      } else {
        if (_isString(callback)) {
          if (!scope) {
            throw 'Invalid scope ' + scope;
          }
          delegate.method = scope[callback];
          if (!_isFunction(delegate.method)) {
            throw 'Invalid callback ' + callback + ' for scope ' + scope;
          }
        } else if (!_isFunction(callback)) {
          throw 'Invalid callback ' + callback;
        }
      }
      return delegate;
    }

    function _addListener(channel, scope, callback, isListener) {
      var delegate = _resolveScopedCallback(scope, callback);
      _cometd._debug('Adding', isListener ? 'listener' : 'subscription', 'on', channel, 'with scope', delegate.scope, 'and callback', delegate.method);
      var subscription = {
        channel: channel,
        scope: delegate.scope,
        callback: delegate.method,
        listener: isListener
      };
      var subscriptions = _listeners[channel];
      if (!subscriptions) {
        subscriptions = [];
        _listeners[channel] = subscriptions;
      }
      subscription.id = subscriptions.push(subscription) - 1;
      _cometd._debug('Added', isListener ? 'listener' : 'subscription', subscription);
      subscription[0] = channel;
      subscription[1] = subscription.id;
      return subscription;
    }
    this.registerTransport = function(type, transport, index) {
      var result = _transports.add(type, transport, index);
      if (result) {
        this._debug('Registered transport', type);
        if (_isFunction(transport.registered)) {
          transport.registered(type, this);
        }
      }
      return result;
    };
    this.getTransportTypes = function() {
      return _transports.getTransportTypes();
    };
    this.unregisterTransport = function(type) {
      var transport = _transports.remove(type);
      if (transport !== null) {
        this._debug('Unregistered transport', type);
        if (_isFunction(transport.unregistered)) {
          transport.unregistered();
        }
      }
      return transport;
    };
    this.unregisterTransports = function() {
      _transports.clear();
    };
    this.findTransport = function(name) {
      return _transports.find(name);
    };
    this.configure = function(configuration) {
      _configure.call(this, configuration);
    };
    this.init = function(configuration, handshakeProps) {
      this.configure(configuration);
      this.handshake(handshakeProps);
    };
    this.handshake = function(handshakeProps, handshakeCallback) {
      _setStatus('disconnected');
      _reestablish = false;
      _handshake(handshakeProps, handshakeCallback);
    };
    this.disconnect = function(sync, disconnectProps, disconnectCallback) {
      if (_isDisconnected()) {
        return;
      }
      if (typeof sync !== 'boolean') {
        disconnectCallback = disconnectProps;
        disconnectProps = sync;
        sync = false;
      }
      if (_isFunction(disconnectProps)) {
        disconnectCallback = disconnectProps;
        disconnectProps = undefined;
      }
      var bayeuxMessage = {
        channel: '/meta/disconnect',
        _callback: disconnectCallback
      };
      var message = this._mixin(false, {}, disconnectProps, bayeuxMessage);
      _setStatus('disconnecting');
      _send(sync === true, [message], false, 'disconnect');
    };
    this.startBatch = function() {
      _startBatch();
    };
    this.endBatch = function() {
      _endBatch();
    };
    this.batch = function(scope, callback) {
      var delegate = _resolveScopedCallback(scope, callback);
      this.startBatch();
      try {
        delegate.method.call(delegate.scope);
        this.endBatch();
      } catch (x) {
        this._info('Exception during execution of batch', x);
        this.endBatch();
        throw x;
      }
    };
    this.addListener = function(channel, scope, callback) {
      if (arguments.length < 2) {
        throw 'Illegal arguments number: required 2, got ' + arguments.length;
      }
      if (!_isString(channel)) {
        throw 'Illegal argument type: channel must be a string';
      }
      return _addListener(channel, scope, callback, true);
    };
    this.removeListener = function(subscription) {
      if (!subscription || !subscription.channel || !("id" in subscription)) {
        throw 'Invalid argument: expected subscription, not ' + subscription;
      }
      _removeListener(subscription);
    };
    this.clearListeners = function() {
      _listeners = {};
    };
    this.subscribe = function(channel, scope, callback, subscribeProps, subscribeCallback) {
      if (arguments.length < 2) {
        throw 'Illegal arguments number: required 2, got ' + arguments.length;
      }
      if (!_isString(channel)) {
        throw 'Illegal argument type: channel must be a string';
      }
      if (_isDisconnected()) {
        throw 'Illegal state: already disconnected';
      }
      if (_isFunction(scope)) {
        subscribeCallback = subscribeProps;
        subscribeProps = callback;
        callback = scope;
        scope = undefined;
      }
      if (_isFunction(subscribeProps)) {
        subscribeCallback = subscribeProps;
        subscribeProps = undefined;
      }
      var send = !_hasSubscriptions(channel);
      var subscription = _addListener(channel, scope, callback, false);
      if (send) {
        var bayeuxMessage = {
          channel: '/meta/subscribe',
          subscription: channel,
          _callback: subscribeCallback
        };
        var message = this._mixin(false, {}, subscribeProps, bayeuxMessage);
        _queueSend(message);
      }
      return subscription;
    };
    this.unsubscribe = function(subscription, unsubscribeProps, unsubscribeCallback) {
      if (arguments.length < 1) {
        throw 'Illegal arguments number: required 1, got ' + arguments.length;
      }
      if (_isDisconnected()) {
        throw 'Illegal state: already disconnected';
      }
      if (_isFunction(unsubscribeProps)) {
        unsubscribeCallback = unsubscribeProps;
        unsubscribeProps = undefined;
      }
      this.removeListener(subscription);
      var channel = subscription.channel;
      if (!_hasSubscriptions(channel)) {
        var bayeuxMessage = {
          channel: '/meta/unsubscribe',
          subscription: channel,
          _callback: unsubscribeCallback
        };
        var message = this._mixin(false, {}, unsubscribeProps, bayeuxMessage);
        _queueSend(message);
      }
    };
    this.resubscribe = function(subscription, subscribeProps) {
      _removeSubscription(subscription);
      if (subscription) {
        return this.subscribe(subscription.channel, subscription.scope, subscription.callback, subscribeProps);
      }
      return undefined;
    };
    this.clearSubscriptions = function() {
      _clearSubscriptions();
    };
    this.publish = function(channel, content, publishProps, publishCallback) {
      if (arguments.length < 1) {
        throw 'Illegal arguments number: required 1, got ' + arguments.length;
      }
      if (!_isString(channel)) {
        throw 'Illegal argument type: channel must be a string';
      }
      if (/^\/meta\//.test(channel)) {
        throw 'Illegal argument: cannot publish to meta channels';
      }
      if (_isDisconnected()) {
        throw 'Illegal state: already disconnected';
      }
      if (_isFunction(content)) {
        publishCallback = content;
        content = publishProps = {};
      } else if (_isFunction(publishProps)) {
        publishCallback = publishProps;
        publishProps = {};
      }
      var bayeuxMessage = {
        channel: channel,
        data: content,
        _callback: publishCallback
      };
      var message = this._mixin(false, {}, publishProps, bayeuxMessage);
      _queueSend(message);
    };
    this.getStatus = function() {
      return _status;
    };
    this.isDisconnected = _isDisconnected;
    this.setBackoffIncrement = function(period) {
      _config.backoffIncrement = period;
    };
    this.getBackoffIncrement = function() {
      return _config.backoffIncrement;
    };
    this.getBackoffPeriod = function() {
      return _backoff;
    };
    this.setLogLevel = function(level) {
      _config.logLevel = level;
    };
    this.registerExtension = function(name, extension) {
      if (arguments.length < 2) {
        throw 'Illegal arguments number: required 2, got ' + arguments.length;
      }
      if (!_isString(name)) {
        throw 'Illegal argument type: extension name must be a string';
      }
      var existing = false;
      for (var i = 0; i < _extensions.length; ++i) {
        var existingExtension = _extensions[i];
        if (existingExtension.name === name) {
          existing = true;
          break;
        }
      }
      if (!existing) {
        _extensions.push({
          name: name,
          extension: extension
        });
        this._debug('Registered extension', name);
        if (_isFunction(extension.registered)) {
          extension.registered(name, this);
        }
        return true;
      } else {
        this._info('Could not register extension with name', name, 'since another extension with the same name already exists');
        return false;
      }
    };
    this.unregisterExtension = function(name) {
      if (!_isString(name)) {
        throw 'Illegal argument type: extension name must be a string';
      }
      var unregistered = false;
      for (var i = 0; i < _extensions.length; ++i) {
        var extension = _extensions[i];
        if (extension.name === name) {
          _extensions.splice(i, 1);
          unregistered = true;
          this._debug('Unregistered extension', name);
          var ext = extension.extension;
          if (_isFunction(ext.unregistered)) {
            ext.unregistered();
          }
          break;
        }
      }
      return unregistered;
    };
    this.getExtension = function(name) {
      for (var i = 0; i < _extensions.length; ++i) {
        var extension = _extensions[i];
        if (extension.name === name) {
          return extension.extension;
        }
      }
      return null;
    };
    this.getName = function() {
      return _name;
    };
    this.getClientId = function() {
      return _clientId;
    };
    this.getURL = function() {
      if (_transport && typeof _config.urls === 'object') {
        var url = _config.urls[_transport.getType()];
        if (url) {
          return url;
        }
      }
      return _config.url;
    };
    this.getTransport = function() {
      return _transport;
    };
    this.getConfiguration = function() {
      return this._mixin(true, {}, _config);
    };
    this.getAdvice = function() {
      return this._mixin(true, {}, _advice);
    };
    org.cometd.WebSocket = window.WebSocket;
    if (!org.cometd.WebSocket) {
      org.cometd.WebSocket = window.MozWebSocket;
    }
  };
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return org.cometd;
    });
  }
})(this);;
/*! RESOURCE: /scripts/thirdparty/cometd/vanilla/vanilla.cometd.js */
(function(global, org_cometd) {
  org_cometd.JSON.toJSON = window.JSON.stringify;
  org_cometd.JSON.fromJSON = window.JSON.parse;

  function _setHeaders(xhr, headers) {
    if (headers) {
      for (var headerName in headers) {
        if (headerName.toLowerCase() === 'content-type') {
          continue;
        }
        xhr.setRequestHeader(headerName, headers[headerName]);
      }
    }
  }

  function LongPollingTransport() {
    var _super = new org_cometd.LongPollingTransport();
    var that = org_cometd.Transport.derive(_super);
    that.xhrSend = function(packet) {
      var request = new XMLHttpRequest();
      request.open('POST', packet.url, true);
      _setHeaders(request, packet.headers);
      request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
      request.xhrFields = {
        withCredentials: true
      };
      request.onload = function() {
        var state = this.status;
        if (state >= 200 && state < 400)
          packet.onSuccess(this.response);
        else
          packet.onError(state, this.statusText);
      };
      request.send(packet.body);
      return request;
    };
    return that;
  }
  global.Cometd = function(name) {
    var CometD = org_cometd.Cometd || org_cometd.CometD;
    var cometd = new CometD(name);
    if (org_cometd.WebSocket) {
      cometd.registerTransport('websocket', new org_cometd.WebSocketTransport());
    }
    cometd.registerTransport('long-polling', new LongPollingTransport());
    return cometd;
  };
})(window, org.cometd);;
/*! RESOURCE: /scripts/amb_properties.js */
var amb = amb || {
  properties: {
    servletURI: 'amb/',
    logLevel: 'info',
    loginWindow: 'true'
  }
};;
/*! RESOURCE: /scripts/amb.Logger.js */
amb['Logger'] = function(callerType) {
  var _debugEnabled = amb['properties']['logLevel'] == 'debug';

  function print(message) {
    if (window.console)
      console.log(callerType + ' ' + message);
  }
  return {
    debug: function(message) {
      if (_debugEnabled)
        print('[DEBUG] ' + message);
    },
    addInfoMessage: function(message) {
      print('[INFO] ' + message);
    },
    addErrorMessage: function(message) {
      print('[ERROR] ' + message);
    }
  }
};;
/*! RESOURCE: /scripts/amb.EventManager.js */
amb.EventManager = function EventManager(events) {
  var _subscriptions = [];
  var _idCounter = 0;

  function _getSubscriptions(event) {
    var subscriptions = [];
    for (var i = 0; i < _subscriptions.length; i++) {
      if (_subscriptions[i].event == event)
        subscriptions.push(_subscriptions[i]);
    }
    return subscriptions;
  }
  return {
    subscribe: function(event, callback) {
      var id = _idCounter++;
      _subscriptions.push({
        event: event,
        callback: callback,
        id: id
      });
      return id;
    },
    unsubscribe: function(id) {
      for (var i = 0; i < _subscriptions.length; i++)
        if (id == _subscriptions[i].id)
          _subscriptions.splice(i, 1);
    },
    publish: function(event, args) {
      var subscriptions = _getSubscriptions(event);
      for (var i = 0; i < subscriptions.length; i++)
        subscriptions[i].callback.apply(null, args);
    },
    getEvents: function() {
      return events;
    }
  }
};;
/*! RESOURCE: /scripts/amb.ServerConnection.js */
amb.ServerConnection = function ServerConnection(cometd) {
  var connected = false;
  var disconnecting = false;
  var eventManager = new amb.EventManager({
    CONNECTION_INITIALIZED: 'connection.initialized',
    CONNECTION_OPENED: 'connection.opened',
    CONNECTION_CLOSED: 'connection.closed',
    CONNECTION_BROKEN: 'connection.broken',
    SESSION_LOGGED_IN: 'session.logged.in',
    SESSION_LOGGED_OUT: 'session.logged.out',
    SESSION_INVALIDATED: 'session.invalidated'
  });
  var state = "closed";
  var LOGGER = new amb.Logger('amb.ServerConnection');
  _initializeMetaChannelListeners();
  var loggedIn = true;
  var loginWindow = null;
  var loginWindowEnabled = amb.properties['loginWindow'] === 'true';
  var lastError = null;
  var errorMessages = {
    'UNKNOWN_CLIENT': '402::Unknown client'
  };
  var loginWindowOverride = false;
  var ambServerConnection = {};
  ambServerConnection.connect = function() {
    if (connected) {
      console.log(">>> connection exists, request satisfied");
      return;
    }
    LOGGER.debug('Connecting to glide amb server -> ' + amb['properties']['servletURI']);
    cometd.configure({
      url: _getRelativePath(amb['properties']['servletURI']),
      logLevel: amb['properties']['logLevel']
    });
    cometd.handshake();
  };
  ambServerConnection.reload = function() {
    cometd.reload();
  };
  ambServerConnection.abort = function() {
    cometd.getTransport().abort();
  };
  ambServerConnection.disconnect = function() {
    LOGGER.debug('Disconnecting from glide amb server..');
    disconnecting = true;
    cometd.disconnect();
  };

  function _initializeMetaChannelListeners() {
    cometd.addListener('/meta/handshake', this, _metaHandshake);
    cometd.addListener('/meta/connect', this, _metaConnect);
  }

  function _metaHandshake(message) {
    setTimeout(function() {
      if (message['successful'])
        _connectionInitialized();
    }, 0);
  }

  function applyAMBProperties(message) {
    if (message.ext) {
      if (message.ext['glide.amb.active'] === false) {
        ambServerConnection.disconnect();
      }
      if (message.ext['glide.amb.client.log.level'] !== undefined &&
        message.ext['glide.amb.client.log.level'] !== '') {
        amb.properties.logLevel = message.ext['glide.amb.client.log.level'];
        cometd.setLogLevel(amb.properties.logLevel);
      }
    }
  }

  function _metaConnect(message) {
    applyAMBProperties(message);
    if (disconnecting) {
      setTimeout(function() {
        connected = false;
        _connectionClosed();
      }, 0);
      return;
    }
    var error = message['error'];
    if (error)
      lastError = error;
    _sessionStatus(message);
    var wasConnected = connected;
    connected = (message['successful'] === true);
    if (!wasConnected && connected)
      _connectionOpened();
    else if (wasConnected && !connected)
      _connectionBroken();
  }

  function _connectionInitialized() {
    LOGGER.debug('Connection initialized');
    state = "initialized";
    _publishEvent(eventManager.getEvents().CONNECTION_INITIALIZED);
  }

  function _connectionOpened() {
    LOGGER.debug('Connection opened');
    state = "opened";
    _publishEvent(eventManager.getEvents().CONNECTION_OPENED);
  }

  function _connectionClosed() {
    LOGGER.debug('Connection closed');
    state = "closed";
    _publishEvent(eventManager.getEvents().CONNECTION_CLOSED);
  }

  function _connectionBroken() {
    LOGGER.addErrorMessage('Connection broken');
    state = "broken";
    _publishEvent(eventManager.getEvents().CONNECTION_BROKEN);
  }

  function _sessionStatus(message) {
    var ext = message['ext'];
    if (ext) {
      var sessionStatus = ext['glide.session.status'];
      loginWindowOverride = ext['glide.amb.login.window.override'] === true;
      LOGGER.debug('session.status - ' + sessionStatus);
      switch (sessionStatus) {
        case 'session.logged.out':
          if (loggedIn)
            _logout();
          break;
        case 'session.logged.in':
          if (!loggedIn)
            _login();
          break;
        case 'session.invalidated':
        case null:
          if (loggedIn)
            _invalidated();
          break;
        default:
          LOGGER.debug("unknown session status - " + sessionStatus);
          break;
      }
    }
  }

  function _login() {
    loggedIn = true;
    LOGGER.debug("LOGGED_IN event fire!");
    _publishEvent(eventManager.getEvents().SESSION_LOGGED_IN);
    ambServerConnection.loginHide();
  }

  function _logout() {
    loggedIn = false;
    LOGGER.debug("LOGGED_OUT event fire!");
    _publishEvent(eventManager.getEvents().SESSION_LOGGED_OUT);
    ambServerConnection.loginShow();
  }

  function _invalidated() {
    loggedIn = false;
    LOGGER.debug("INVALIDATED event fire!");
    _publishEvent(eventManager.getEvents().SESSION_INVALIDATED);
  }

  function _publishEvent(event) {
    try {
      eventManager.publish(event);
    } catch (e) {
      LOGGER.addErrorMessage("error publishing '" + event + "' - " + e);
    }
  }
  var modalContent = '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>';
  var modalTemplate = '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
    '  <div class="modal-dialog small-modal" style="width:450px">' +
    '     <div class="modal-content">' +
    '        <header class="modal-header">' +
    '           <h4 id="small_modal1_title" class="modal-title">Login</h4>' +
    '        </header>' +
    '        <div class="modal-body">' +
    '        </div>' +
    '     </div>' +
    '  </div>' +
    '</div>';

  function _loginShow() {
    LOGGER.debug("Show login window");
    if (!loginWindowEnabled || loginWindowOverride)
      return;
    var dialog = new GlideModal('amb_disconnect_modal');
    if (dialog['renderWithContent']) {
      dialog.template = modalTemplate;
      dialog.renderWithContent(modalContent);
    } else {
      dialog.setBody(modalContent);
      dialog.render();
    }
    loginWindow = dialog;
  }

  function _loginHide() {
    if (!loginWindow)
      return;
    loginWindow.destroy();
    loginWindow = null;
  }

  function loginComplete() {
    _login();
  }

  function _getRelativePath(uri) {
    var relativePath = "";
    for (var i = 0; i < window.location.pathname.match(/\//g).length - 1; i++) {
      relativePath = "../" + relativePath;
    }
    return relativePath + uri;
  }
  ambServerConnection.getEvents = function() {
    return eventManager.getEvents();
  };
  ambServerConnection.getConnectionState = function() {
    return state;
  };
  ambServerConnection.getLastError = function() {
    return lastError;
  };
  ambServerConnection.setLastError = function(error) {
    lastError = error;
  };
  ambServerConnection.getErrorMessages = function() {
    return errorMessages;
  };
  ambServerConnection.isLoggedIn = function() {
    return loggedIn;
  };
  ambServerConnection.loginShow = function() {
    _loginShow();
  };
  ambServerConnection.loginHide = function() {
    _loginHide();
  };
  ambServerConnection.loginComplete = function() {
    _login();
  };
  ambServerConnection.subscribeToEvent = function(event, callback) {
    if (eventManager.getEvents().CONNECTION_OPENED == event && connected)
      callback();
    return eventManager.subscribe(event, callback);
  };
  ambServerConnection.unsubscribeFromEvent = function(id) {
    eventManager.unsubscribe(id);
  };
  ambServerConnection.getConnectionState = function() {
    return state;
  };
  ambServerConnection.isLoginWindowEnabled = function() {
    return loginWindowEnabled;
  };
  ambServerConnection.isLoginWindowOverride = function() {
    return loginWindowOverride;
  }
  return ambServerConnection;
};;
/*! RESOURCE: /scripts/amb.ChannelRedirect.js */
amb.ChannelRedirect = function ChannelRedirect(cometd, serverConnection,
  channelProvider) {
  var initialized = false;
  var _cometd = cometd;
  var eventManager = new amb.EventManager({
    CHANNEL_REDIRECT: 'channel.redirect'
  });
  var LOGGER = new amb.Logger('amb.ChannelRedirect');

  function _onAdvice(advice) {
    LOGGER.debug('_onAdvice:' + advice.data.clientId);
    var fromChannel = channelProvider(advice.data.fromChannel);
    var toChannel = channelProvider(advice.data.toChannel);
    eventManager.publish(eventManager.getEvents().CHANNEL_REDIRECT, [fromChannel, toChannel]);
    LOGGER.debug(
      'published channel switch event, fromChannel:' + fromChannel.getName() +
      ', toChannel:' + toChannel.getName());
  }
  return {
    subscribeToEvent: function(event, callback) {
      return eventManager.subscribe(event, callback);
    },
    unsubscribeToEvent: function(id) {
      eventManager.unsubscribe(id);
    },
    getEvents: function() {
      return eventManager.getEvents();
    },
    initialize: function() {
      if (!initialized) {
        var channelName = '/sn/meta/channel_redirect/' + _cometd.getClientId();
        var metaChannel = channelProvider(channelName);
        metaChannel.newListener(serverConnection, null).subscribe(_onAdvice);
        LOGGER.debug("ChannelRedirect initialized: " + channelName);
        initialized = true;
      }
    }
  }
};;
/*! RESOURCE: /scripts/amb.ChannelListener.js */
amb.ChannelListener = function ChannelListener(channel, serverConnection,
  channelRedirect) {
  var id;
  var subscriberCallback;
  var LOGGER = new amb.Logger('amb.ChannelListener');
  var channelRedirectId = null;
  var connectOpenedEventId;
  var currentChannel = channel;
  return {
    getCallback: function() {
      return subscriberCallback;
    },
    getID: function() {
      return id;
    },
    subscribe: function(callback) {
      subscriberCallback = callback;
      if (channelRedirect)
        channelRedirectId = channelRedirect.subscribeToEvent(
          channelRedirect.getEvents().CHANNEL_REDIRECT, this._switchToChannel.bind(this));
      connectOpenedEventId = serverConnection.subscribeToEvent(serverConnection.getEvents().CONNECTION_OPENED, this._subscribeWhenReady.bind(this));
      return this;
    },
    resubscribe: function() {
      return this.subscribe(subscriberCallback);
    },
    _switchToChannel: function(fromChannel, toChannel) {
      if (!fromChannel || !toChannel)
        return;
      if (fromChannel.getName() != currentChannel.getName())
        return;
      this.unsubscribe();
      currentChannel = toChannel;
      this.subscribe(subscriberCallback);
    },
    _subscribeWhenReady: function() {
      LOGGER.debug("Subscribing to '" + currentChannel.getName() + "'...");
      id = currentChannel.subscribe(this);
    },
    unsubscribe: function() {
      channelRedirect.unsubscribeToEvent(channelRedirectId);
      currentChannel.unsubscribe(this);
      serverConnection.unsubscribeFromEvent(connectOpenedEventId);
      LOGGER.debug("Unsubscribed from channel: " + currentChannel.getName());
      return this;
    },
    publish: function(message) {
      currentChannel.publish(message);
    },
    getName: function() {
      return currentChannel.getName();
    }
  }
};;
/*! RESOURCE: /scripts/amb.Channel.js */
amb.Channel = function Channel(cometd, channelName, initialized) {
  var subscription = null;
  var listeners = [];
  var LOGGER = new amb.Logger('amb.Channel');
  var idCounter = 0;
  var _initialized = initialized;

  function _disconnected() {
    var status = cometd.getStatus();
    return status === 'disconnecting' || status === 'disconnected';
  }
  return {
    newListener: function(serverConnection,
      channelRedirect) {
      return new amb.ChannelListener(this, serverConnection, channelRedirect);
    },
    subscribe: function(listener) {
      if (_disconnected()) {
        LOGGER.addErrorMessage('Illegal state: already disconnected');
        return;
      }
      if (!listener.getCallback()) {
        LOGGER.addErrorMessage('Cannot subscribe to channel: ' + channelName +
          ', callback not provided');
        return;
      }
      if (!subscription && _initialized) {
        try {
          this.subscribeToCometD();
        } catch (e) {
          LOGGER.addErrorMessage(e);
          return;
        }
      }
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] === listener) {
          LOGGER.debug('Channel listener already in the list');
          return listener.getID();
        }
      }
      var id = idCounter++;
      listeners.push(listener);
      return id;
    },
    resubscribe: function() {
      subscription = null;
      for (var i = 0; i < listeners.length; i++)
        listeners[i].resubscribe();
    },
    subscribeOnInitCompletion: function(redirect) {
      _initialized = true;
      subscription = null;
      for (var i = 0; i < listeners.length; i++) {
        listeners[i].subscribe();
        LOGGER.debug('Successfully subscribed to channel: ' + channelName);
      }
    },
    _handleResponse: function(message) {
      for (var i = 0; i < listeners.length; i++)
        listeners[i].getCallback()(message);
    },
    unsubscribe: function(listener) {
      if (!listener) {
        LOGGER.addErrorMessage('Cannot unsubscribe from channel: ' + channelName +
          ', listener argument does not exist');
        return;
      }
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i].getID() == listener.getID())
          listeners.splice(i, 1);
      }
      if (listeners.length < 1 && subscription && !_disconnected())
        this.unsubscribeFromCometD();
    },
    publish: function(message) {
      cometd.publish(channelName, message);
    },
    subscribeToCometD: function() {
      subscription = cometd.subscribe(channelName, this._handleResponse.bind(this));
      LOGGER.debug('Successfully subscribed to channel: ' + channelName);
    },
    unsubscribeFromCometD: function() {
      if (!subscription)
        return;
      cometd.unsubscribe(subscription);
      subscription = null;
      LOGGER.debug('Successfully unsubscribed from channel: ' + channelName);
    },
    resubscribeToCometD: function() {
      this.subscribeToCometD();
    },
    getName: function() {
      return channelName;
    }
  }
};;
/*! RESOURCE: /scripts/amb.MessageClient.js */
(function() {
  amb.MessageClient = function MessageClient() {
    var cometd = new window.Cometd();
    cometd.unregisterTransport('websocket');
    cometd.unregisterTransport('callback-polling');
    var serverConnection = new amb.ServerConnection(cometd);
    var channels = {};
    var LOGGER = new amb.Logger('amb.MessageClient');
    var channelRedirect = null;
    var connected = false;
    var initialized = false;
    var uninitializedChannels = [];
    serverConnection.subscribeToEvent(serverConnection.getEvents().CONNECTION_BROKEN, _connectionBroken);
    serverConnection.subscribeToEvent(serverConnection.getEvents().CONNECTION_OPENED, _connectionOpened);
    serverConnection.subscribeToEvent(serverConnection.getEvents().CONNECTION_INITIALIZED, _connectionInitialized);
    serverConnection.subscribeToEvent(serverConnection.getEvents().SESSION_LOGGED_OUT, _unsubscribeAll);
    serverConnection.subscribeToEvent(serverConnection.getEvents().SESSION_INVALIDATED, _unsubscribeAll);
    serverConnection.subscribeToEvent(serverConnection.getEvents().SESSION_LOGGED_IN, _resubscribeAll);
    var _connectionBrokenEvent = false;

    function _connectionBroken() {
      LOGGER.debug("connection broken!");
      _connectionBrokenEvent = true;
    }

    function _connectionInitialized() {
      initialized = true;
      _initChannelRedirect();
      channelRedirect.initialize();
      LOGGER.debug("Connection initialized. Initializing " + uninitializedChannels.length + " channels.");
      for (var i = 0; i < uninitializedChannels.length; i++) {
        uninitializedChannels[i].subscribeOnInitCompletion();
      }
      uninitializedChannels = [];
    }

    function _connectionOpened() {
      if (_connectionBrokenEvent) {
        LOGGER.debug("connection opened!");
        var sc = serverConnection;
        if (sc.getLastError() !== sc.getErrorMessages().UNKNOWN_CLIENT)
          return;
        sc.setLastError(null);
        LOGGER.debug("channel resubscribe!");
        var request = new XMLHttpRequest();
        request.open("GET", "/amb_session_setup.do", true);
        request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
        request.setRequestHeader("X-UserToken", window.g_ck);
        request.send();
        request.onload = function() {
          if (this.status != 200) {
            return;
          }
          _resubscribeAll();
          _connectionBrokenEvent = false;
        };
      }
    }

    function _unsubscribeAll() {
      LOGGER.debug("Unsubscribing from all!");
      for (var name in channels) {
        var channel = channels[name];
        channel.unsubscribeFromCometD();
      }
    }

    function _resubscribeAll() {
      LOGGER.debug("Resubscribing to all!");
      for (var name in channels) {
        var channel = channels[name];
        channel.resubscribeToCometD();
      }
    }

    function _initChannelRedirect() {
      if (channelRedirect)
        return;
      channelRedirect = new amb.ChannelRedirect(cometd, serverConnection, _getChannel);
    }

    function _getChannel(channelName) {
      if (channelName in channels)
        return channels[channelName];
      var channel = new amb.Channel(cometd, channelName, initialized);
      channels[channelName] = channel;
      if (!initialized)
        uninitializedChannels.push(channel);
      return channel;
    }

    function _removeChannel(channelName) {
      delete channels[channelName];
    }
    return {
      getServerConnection: function() {
        return serverConnection;
      },
      isLoggedIn: function() {
        return serverConnection.isLoggedIn();
      },
      loginComplete: function() {
        serverConnection.loginComplete();
      },
      connect: function() {
        if (connected) {
          LOGGER.addInfoMessage(">>> connection exists, request satisfied");
          return;
        }
        connected = true;
        serverConnection.connect();
      },
      reload: function() {
        connected = false;
        serverConnection.reload();
      },
      abort: function() {
        connected = false;
        serverConnection.abort();
      },
      disconnect: function() {
        connected = false;
        serverConnection.disconnect();
      },
      getConnectionEvents: function() {
        return serverConnection.getEvents();
      },
      subscribeToEvent: function(event, callback) {
        return serverConnection.subscribeToEvent(event, callback);
      },
      unsubscribeFromEvent: function(id) {
        serverConnection.unsubscribeFromEvent(id);
      },
      getConnectionState: function() {
        return serverConnection.getConnectionState();
      },
      getClientId: function() {
        return cometd.getClientId();
      },
      getChannel: function(channelName) {
        _initChannelRedirect();
        var channel = _getChannel(channelName);
        return channel.newListener(serverConnection, channelRedirect);
      },
      registerExtension: function(extensionName, extension) {
        cometd.registerExtension(extensionName, extension);
      },
      unregisterExtension: function(extensionName) {
        cometd.unregisterExtension(extensionName);
      },
      batch: function(block) {
        cometd.batch(block);
      },
      removeChannel: function(channelName) {
        _removeChannel(channelName)
      }
    }
  };
})();;
/*! RESOURCE: /scripts/amb.MessageClientBuilder.js */
(function() {
  'use strict';
  amb.getClient = function() {
    return getClient();
  };

  function getClient() {
    var client = getParentAmbClient(window);
    if (client) {
      return wrapClient(client, window);
    }
    client = wrapClient(buildClient(), window);
    setClient(client);
    return client;
  }

  function getParentAmbClient(clientWindow) {
    try {
      if (!(clientWindow.MSInputMethodContext && clientWindow.document.documentMode)) {
        while (clientWindow !== clientWindow.parent) {
          if (clientWindow.g_ambClient) {
            break;
          }
          clientWindow = clientWindow.parent;
        }
      }
      if (clientWindow.g_ambClient) {
        return clientWindow.g_ambClient;
      }
    } catch (e) {
      console.log('AMB getClient() tried to access parent from an iFrame. Caught error: ' + e);
    }
    return null;
  }

  function wrapClient(client, clientWindow) {
    if (typeof client.getClientWindow !== 'undefined') {
      var context = client.getClientWindow();
      if (context === clientWindow) {
        return client;
      }
    }
    var wrappedClient = clone({}, client);
    wrappedClient.getChannel = function(channelName, overrideWindow) {
      return client.getChannel(channelName, overrideWindow || clientWindow);
    };
    wrappedClient.subscribeToEvent = function(event, callback, overrideWindow) {
      return client.subscribeToEvent(event, callback, overrideWindow || clientWindow);
    };
    wrappedClient.unsubscribeFromEvent = function(id, overrideWindow) {
      return client.unsubscribeFromEvent(id, overrideWindow || clientWindow);
    };
    wrappedClient.getClientWindow = function() {
      return clientWindow;
    };
    return wrappedClient;
  }

  function clone(dest, source) {
    for (var prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        dest[prop] = source[prop];
      }
    }
    return dest;
  }

  function setClient(client) {
    var _window = window.self;
    _window.g_ambClient = client;
    _window.addEventListener("unload", function() {
      _window.g_ambClient.disconnect();
    });
    var documentReadyState = _window.document ? _window.document.readyState : null;
    if (documentReadyState === 'complete') {
      autoConnect();
    } else {
      _window.addEventListener('load', autoConnect);
    }
    setTimeout(autoConnect, 10000);
    var initiatedConnection = false;

    function autoConnect() {
      if (!initiatedConnection) {
        initiatedConnection = true;
        _window.g_ambClient.connect();
      }
    }
  }

  function buildClient() {
    return (function() {
      var ambClient = new amb.MessageClient();
      var clientSubscriptions = buildClientSubscriptions();
      return {
        getServerConnection: function() {
          return ambClient.getServerConnection();
        },
        connect: function() {
          ambClient.connect();
        },
        abort: function() {
          ambClient.abort();
        },
        disconnect: function() {
          ambClient.disconnect();
        },
        getConnectionState: function() {
          return ambClient.getConnectionState();
        },
        getState: function() {
          return ambClient.getConnectionState();
        },
        getClientId: function() {
          return ambClient.getClientId();
        },
        getChannel: function(channelName, windowContext) {
          var channel = ambClient.getChannel(channelName);
          var originalSubscribe = channel.subscribe;
          var originalUnsubscribe = channel.unsubscribe;
          windowContext = windowContext || window;
          channel.subscribe = function(listener) {
            clientSubscriptions.add(windowContext, channel, listener, function() {
              channel.unsubscribe(listener);
            });
            windowContext.addEventListener('unload', function() {
              ambClient.removeChannel(channelName);
            });
            originalSubscribe.call(channel, listener);
            return channel;
          };
          channel.unsubscribe = function(listener) {
            clientSubscriptions.remove(windowContext, channel, listener);
            return originalUnsubscribe.call(channel, listener);
          };
          return channel;
        },
        getChannel0: function(channelName) {
          return ambClient.getChannel(channelName);
        },
        registerExtension: function(extensionName, extension) {
          ambClient.registerExtension(extensionName, extension);
        },
        unregisterExtension: function(extensionName) {
          ambClient.unregisterExtension(extensionName);
        },
        batch: function(block) {
          ambClient.batch(block);
        },
        subscribeToEvent: function(event, callback, windowContext) {
          windowContext = windowContext || window;
          var id = ambClient.subscribeToEvent(event, callback);
          clientSubscriptions.add(windowContext, id, true, function() {
            ambClient.unsubscribeFromEvent(id);
          });
          return id;
        },
        unsubscribeFromEvent: function(id, windowContext) {
          windowContext = windowContext || window;
          clientSubscriptions.remove(windowContext, id, true);
          ambClient.unsubscribeFromEvent(id);
        },
        isLoggedIn: function() {
          return ambClient.isLoggedIn();
        },
        getConnectionEvents: function() {
          return ambClient.getConnectionEvents();
        },
        getEvents: function() {
          return ambClient.getConnectionEvents();
        },
        loginComplete: function() {
          ambClient.loginComplete();
        }
      };
    })();

    function buildClientSubscriptions() {
      var contexts = [];

      function addSubscription(clientWindow, id, callback, unsubscribe) {
        if (!clientWindow || !callback || !unsubscribe) {
          return;
        }
        removeSubscription(clientWindow, id, callback);
        var context = getContext(clientWindow);
        if (!context) {
          context = createContext(clientWindow);
        }
        if (context.unloading) {
          return;
        }
        context.subscriptions.push({
          id: id,
          callback: callback,
          unsubscribe: unsubscribe
        });
      }

      function removeSubscription(clientWindow, id, callback) {
        if (!clientWindow || !callback) {
          return;
        }
        var context = getContext(clientWindow);
        if (!context) {
          return;
        }
        var subscriptions = context.subscriptions;
        for (var i = subscriptions.length - 1; i >= 0; i--) {
          if (subscriptions[i].id === id && subscriptions[i].callback === callback) {
            subscriptions.splice(i, 1);
          }
        }
      }

      function getContext(clientWindow) {
        for (var i = 0, iM = contexts.length; i < iM; i++) {
          if (contexts[i].window === clientWindow) {
            return contexts[i];
          }
        }
        return null;
      }

      function createContext(clientWindow) {
        var context = {
          window: clientWindow,
          onUnload: function() {
            context.unloading = true;
            var subscriptions = context.subscriptions;
            var subscription;
            while (subscription = subscriptions.pop()) {
              subscription.unsubscribe();
            }
            destroyContext(context);
          },
          unloading: false,
          subscriptions: []
        };
        clientWindow.addEventListener('unload', context.onUnload);
        contexts.push(context);
        return context;
      }

      function destroyContext(context) {
        for (var i = 0, iM = contexts.length; i < iM; i++) {
          if (contexts[i].window === context.window) {
            contexts.splice(i, 1);
            break;
          }
        }
        context.subscriptions = [];
        context.window.removeEventListener('unload', context.onUnload);
        context.onUnload = null;
        context.window = null;
      }
      return {
        add: addSubscription,
        remove: removeSubscription
      };
    }
  }
})();;;
/*! RESOURCE: /scripts/app.ng.amb/app.ng.amb.js */
angular.module("ng.amb", ['sn.common.presence', 'sn.common.util'])
  .value("ambLogLevel", 'info')
  .value("ambServletURI", '/amb')
  .value("cometd", angular.element.cometd)
  .value("ambLoginWindow", 'true');;
/*! RESOURCE: /scripts/app.ng.amb/service.AMB.js */
angular.module("ng.amb").service("amb", function(AMBOverlay, $window, $q, $log, $rootScope, $timeout) {
  "use strict";
  var ambClient = null;
  var _window = $window.self;
  var loginWindow = null;
  var sameScope = false;
  ambClient = amb.getClient();
  if (_window.g_ambClient) {
    sameScope = true;
  }
  if (sameScope) {
    var serverConnection = ambClient.getServerConnection();
    serverConnection.loginShow = function() {
      if (!serverConnection.isLoginWindowEnabled())
        return;
      if (loginWindow && loginWindow.isVisible())
        return;
      if (serverConnection.isLoginWindowOverride())
        return;
      loginWindow = new AMBOverlay();
      loginWindow.render();
      loginWindow.show();
    };
    serverConnection.loginHide = function() {
      if (!loginWindow)
        return;
      loginWindow.hide();
      loginWindow.destroy();
      loginWindow = null;
    }
  }
  var AUTO_CONNECT_TIMEOUT = 20 * 1000;
  var connected = $q.defer();
  var connectionInterrupted = false;
  var monitorAMB = false;
  $timeout(startMonitoringAMB, AUTO_CONNECT_TIMEOUT);
  connected.promise.then(startMonitoringAMB);

  function startMonitoringAMB() {
    monitorAMB = true;
  }

  function ambInterrupted() {
    var state = ambClient.getState();
    return monitorAMB && state !== "opened" && state !== "initialized"
  }
  var interruptionTimeout;
  var extendedInterruption = false;

  function setInterrupted(eventName) {
    connectionInterrupted = true;
    $rootScope.$broadcast(eventName);
    if (!interruptionTimeout) {
      interruptionTimeout = $timeout(function() {
        extendedInterruption = true;
      }, 30 * 1000)
    }
    connected = $q.defer();
  }
  var connectOpenedEventId = ambClient.subscribeToEvent("connection.opened", function() {
    $rootScope.$broadcast("amb.connection.opened");
    if (interruptionTimeout) {
      $timeout.cancel(interruptionTimeout);
      interruptionTimeout = null;
    }
    extendedInterruption = false;
    if (connectionInterrupted) {
      connectionInterrupted = false;
      $rootScope.$broadcast("amb.connection.recovered");
    }
    connected.resolve();
  });
  var connectClosedEventId = ambClient.subscribeToEvent("connection.closed", function() {
    setInterrupted("amb.connection.closed");
  });
  var connectBrokenEventId = ambClient.subscribeToEvent("connection.broken", function() {
    setInterrupted("amb.connection.broken");
  });
  var onUnloadWindow = function() {
    ambClient.unsubscribeFromEvent(connectOpenedEventId);
    ambClient.unsubscribeFromEvent(connectClosedEventId);
    ambClient.unsubscribeFromEvent(connectBrokenEventId);
    angular.element($window).off('unload', onUnloadWindow);
  };
  angular.element($window).on('unload', onUnloadWindow);
  var documentReadyState = $window.document ? $window.document.readyState : null;
  if (documentReadyState === 'complete') {
    autoConnect();
  } else {
    angular.element($window).on('load', autoConnect);
  }
  $timeout(autoConnect, 10000);
  var initiatedConnection = false;

  function autoConnect() {
    if (!initiatedConnection) {
      initiatedConnection = true;
      ambClient.connect();
    }
  }
  return {
    getServerConnection: function() {
      return ambClient.getServerConnection();
    },
    connect: function() {
      if (initiatedConnection) {
        ambClient.connect();
      }
      return connected.promise;
    },
    get interrupted() {
      return ambInterrupted();
    },
    get extendedInterruption() {
      return extendedInterruption;
    },
    get connected() {
      return connected.promise;
    },
    abort: function() {
      ambClient.abort();
    },
    disconnect: function() {
      ambClient.disconnect();
    },
    getConnectionState: function() {
      return ambClient.getConnectionState();
    },
    getClientId: function() {
      return ambClient.getClientId();
    },
    getChannel: function(channelName) {
      return ambClient.getChannel(channelName);
    },
    registerExtension: function(extensionName, extension) {
      ambClient.registerExtension(extensionName, extension);
    },
    unregisterExtension: function(extensionName) {
      ambClient.unregisterExtension(extensionName);
    },
    batch: function(batch) {
      ambClient.batch(batch);
    },
    getState: function() {
      return ambClient.getState();
    },
    getFilterString: function(filter) {
      filter = filter.
      replace(/\^EQ/g, '').
      replace(/\^ORDERBY(?:DESC)?[^^]*/g, '').
      replace(/^GOTO/, '');
      return btoa(filter).replace(/=/g, '-');
    },
    getChannelRW: function(table, filter) {
      var t = '/rw/default/' + table + '/' + this.getFilterString(filter);
      return this.getChannel(t);
    },
    isLoggedIn: function() {
      return ambClient.isLoggedIn();
    },
    subscribeToEvent: function(event, callback) {
      return ambClient.subscribeToEvent(event, callback);
    },
    getConnectionEvents: function() {
      return ambClient.getConnectionEvents();
    },
    getEvents: function() {
      return ambClient.getConnectionEvents();
    },
    loginComplete: function() {
      ambClient.loginComplete();
    }
  };
});;
/*! RESOURCE: /scripts/app.ng.amb/controller.AMBRecordWatcher.js */
angular.module("ng.amb").controller("AMBRecordWatcher", function($scope, $timeout, $window) {
  "use strict";
  var amb = $window.top.g_ambClient;
  $scope.messages = [];
  var lastFilter;
  var watcherChannel;
  var watcher;

  function onMessage(message) {
    $scope.messages.push(message.data);
  }
  $scope.getState = function() {
    return amb.getState();
  };
  $scope.initWatcher = function() {
    angular.element(":focus").blur();
    if (!$scope.filter || $scope.filter === lastFilter)
      return;
    lastFilter = $scope.filter;
    console.log("initiating watcher on " + $scope.filter);
    $scope.messages = [];
    if (watcher) {
      watcher.unsubscribe();
    }
    var base64EncodeQuery = btoa($scope.filter).replace(/=/g, '-');
    var channelId = '/rw/' + base64EncodeQuery;
    watcherChannel = amb.getChannel(channelId)
    watcher = watcherChannel.subscribe(onMessage);
  };
  amb.connect();
});
/*! RESOURCE: /scripts/app.ng.amb/factory.snRecordWatcher.js */
angular.module("ng.amb").factory('snRecordWatcher', function($rootScope, amb, $timeout, snPresence, $log, urlTools) {
  "use strict";
  var watcherChannel;
  var connected = false;
  var diagnosticLog = true;

  function initWatcher(table, sys_id, query) {
    if (!table)
      return;
    if (sys_id)
      var filter = "sys_id=" + sys_id;
    else
      filter = query;
    if (!filter)
      return;
    return initChannel(table, filter);
  }

  function initList(table, query) {
    if (!table)
      return;
    query = query || "sys_idISNOTEMPTY";
    return initChannel(table, query);
  }

  function initTaskList(list, prevChannel) {
    if (prevChannel)
      prevChannel.unsubscribe();
    var sys_ids = list.toString();
    var filter = "sys_idIN" + sys_ids;
    return initChannel("task", filter);
  }

  function initChannel(table, filter) {
    if (isBlockedTable(table)) {
      $log.log("Blocked from watching", table);
      return null;
    }
    if (diagnosticLog)
      log(">>> init " + table + "?" + filter);
    watcherChannel = amb.getChannelRW(table, filter);
    watcherChannel.subscribe(onMessage);
    amb.connect();
    return watcherChannel;
  }

  function onMessage(message) {
    var r = message.data;
    var c = message.channel;
    if (diagnosticLog)
      log(">>> record " + r.operation + ": " + r.table_name + "." + r.sys_id + " " + r.display_value);
    $rootScope.$broadcast('record.updated', r);
    $rootScope.$broadcast("sn.stream.tap");
    $rootScope.$broadcast('list.updated', r, c);
  }

  function log(message) {
    $log.log(message);
  }

  function isBlockedTable(table) {
    return table == 'sys_amb_message' || table.startsWith('sys_rw');
  }
  return {
    initTaskList: initTaskList,
    initChannel: initChannel,
    init: function() {
      var location = urlTools.parseQueryString(window.location.search);
      var table = location['table'] || location['sysparm_table'];
      var sys_id = location['sys_id'] || location['sysparm_sys_id'];
      var query = location['sysparm_query'];
      initWatcher(table, sys_id, query);
      snPresence.init(table, sys_id, query);
    },
    initList: initList,
    initRecord: function(table, sysId) {
      initWatcher(table, sysId, null);
      snPresence.initPresence(table, sysId);
    },
    _initWatcher: initWatcher
  }
});;
/*! RESOURCE: /scripts/app.ng.amb/factory.AMBOverlay.js */
angular.module("ng.amb").factory("AMBOverlay", function($templateCache, $compile, $rootScope) {
  "use strict";
  var showCallbacks = [],
    hideCallbacks = [],
    isRendered = false,
    modal,
    modalScope,
    modalOptions;
  var defaults = {
    backdrop: 'static',
    keyboard: false,
    show: true
  };

  function AMBOverlay(config) {
    config = config || {};
    if (angular.isFunction(config.onShow))
      showCallbacks.push(config.onShow);
    if (angular.isFunction(config.onHide))
      hideCallbacks.push(config.onHide);

    function lazyRender() {
      if (!angular.element('html')['modal']) {
        var bootstrapInclude = "/scripts/bootstrap3/bootstrap.js";
        ScriptLoader.getScripts([bootstrapInclude], renderModal);
      } else
        renderModal();
    }

    function renderModal() {
      if (isRendered)
        return;
      modalScope = angular.extend($rootScope.$new(), config);
      modal = $compile($templateCache.get("amb_disconnect_modal.xml"))(modalScope);
      angular.element("body").append(modal);
      modal.on("shown.bs.modal", function(e) {
        for (var i = 0, len = showCallbacks.length; i < len; i++)
          showCallbacks[i](e);
      });
      modal.on("hidden.bs.modal", function(e) {
        for (var i = 0, len = hideCallbacks.length; i < len; i++)
          hideCallbacks[i](e);
      });
      modalOptions = angular.extend({}, defaults, config);
      modal.modal(modalOptions);
      isRendered = true;
    }

    function showModal() {
      if (isRendered)
        modal.modal('show');
    }

    function hideModal() {
      if (isRendered)
        modal.modal('hide');
    }

    function destroyModal() {
      if (!isRendered)
        return;
      modal.modal('hide');
      modal.remove();
      modalScope.$destroy();
      modalScope = void(0);
      isRendered = false;
      var pos = showCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        showCallbacks.splice(pos, 1);
      pos = hideCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        hideCallbacks.splice(pos, 1);
    }
    return {
      render: lazyRender,
      destroy: destroyModal,
      show: showModal,
      hide: hideModal,
      isVisible: function() {
        if (!isRendered)
          false;
        return modal.visible();
      }
    }
  }
  $templateCache.put('amb_disconnect_modal.xml',
    '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
    '	<div class="modal-dialog small-modal" style="width:450px">' +
    '		<div class="modal-content">' +
    '			<header class="modal-header">' +
    '				<h4 id="small_modal1_title" class="modal-title">{{title || "Login"}}</h4>' +
    '			</header>' +
    '			<div class="modal-body">' +
    '			<iframe class="concourse_modal" ng-src=\'{{iframe || "/amb_login.do"}}\' frameborder="0" scrolling="no" height="400px" width="405px"></iframe>' +
    '			</div>' +
    '		</div>' +
    '	</div>' +
    '</div>'
  );
  return AMBOverlay;
});;;
/*! RESOURCE: /scripts/sn/common/presence/snPresenceLite.js */
(function(exports, $) {
  'use strict';
  var PRESENCE_DISABLED = "false" === "true";
  if (PRESENCE_DISABLED) {
    return;
  }
  if (typeof $.Deferred === "undefined") {
    return;
  }
  var USER_KEY = '{{SYSID}}';
  var REPLACE_REGEX = new RegExp(USER_KEY, 'g');
  var COLOR_ONLINE = '#71e279';
  var COLOR_AWAY = '#fc8a3d';
  var COLOR_OFFLINE = 'transparent';
  var BASE_STYLES = [
    '.sn-presence-lite { display: inline-block; width: 1rem; height: 1rem; border-radius: 50%; }'
  ];
  var USER_STYLES = [
    '.sn-presence-' + USER_KEY + '-online [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_ONLINE + '; }',
    '.sn-presence-' + USER_KEY + '-away [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_AWAY + '; }',
    '.sn-presence-' + USER_KEY + '-offline [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_OFFLINE + '; }'
  ];
  var $head = $('head');
  var stylesheet = $.Deferred();
  var registeredUsers = {};
  var registeredUsersLength = 0;
  $(function() {
    updateRegisteredUsers();
  });
  $head.ready(function() {
    var styleElement = document.createElement('style');
    $head.append(styleElement);
    var $styleElement = $(styleElement);
    stylesheet.resolve($styleElement);
  });

  function updateStyles(styles) {
    stylesheet.done(function($styleElement) {
      $styleElement.empty();
      BASE_STYLES.forEach(function(baseStyle) {
        $styleElement.append(baseStyle);
      });
      $styleElement.append(styles);
    });
  }

  function getUserStyles(sysId) {
    var newStyles = '';
    for (var i = 0, iM = USER_STYLES.length; i < iM; i++) {
      newStyles += USER_STYLES[i].replace(REPLACE_REGEX, sysId);
    }
    return newStyles;
  }

  function updateUserStyles() {
    var userKeys = Object.keys(registeredUsers);
    var userStyles = "";
    userKeys.forEach(function(userKey) {
      userStyles += getUserStyles(userKey);
    });
    updateStyles(userStyles);
  }
  exports.applyPresenceArray = applyPresenceArray;

  function applyPresenceArray(presenceArray) {
    if (!presenceArray || !presenceArray.length) {
      return;
    }
    var users = presenceArray.filter(function(presence) {
      return typeof registeredUsers[presence.user] !== "undefined";
    });
    updateUserPresenceStatus(users);
  }

  function updateUserPresenceStatus(users) {
    var presenceStatus = getBaseCSSClasses();
    for (var i = 0, iM = users.length; i < iM; i++) {
      var presence = users[i];
      var status = getNormalizedStatus(presence.status);
      if (status === 'offline') {
        continue;
      }
      presenceStatus.push('sn-presence-' + presence.user + '-' + status);
    }
    setCSSClasses(presenceStatus.join(' '));
  }

  function getNormalizedStatus(status) {
    switch (status) {
      case 'probably offline':
      case 'maybe offline':
        return 'away';
      default:
        return 'offline';
      case 'online':
      case 'offline':
        return status;
    }
  }

  function updateRegisteredUsers() {
    var presenceIndicators = document.querySelectorAll('[data-presence-id]');
    var obj = {};
    for (var i = 0, iM = presenceIndicators.length; i < iM; i++) {
      var uid = presenceIndicators[i].getAttribute('data-presence-id');
      obj[uid] = true;
    }
    if (Object.keys(obj).length === registeredUsersLength) {
      return;
    }
    registeredUsers = obj;
    registeredUsersLength = Object.keys(registeredUsers).length;
    updateUserStyles();
  }

  function setCSSClasses(classes) {
    $('html')[0].className = classes;
  }

  function getBaseCSSClasses() {
    return $('html')[0].className.split(' ').filter(function(item) {
      return item.indexOf('sn-presence-') !== 0;
    });
  }
})(window, window.jQuery || window.Zepto);;
/*! RESOURCE: /scripts/sn/common/presence/_module.js */
angular.module('sn.common.presence', ['ng.amb', 'sn.common.glide']).config(function($provide) {
  "use strict";
  $provide.constant("PRESENCE_DISABLED", "false" === "true");
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snPresence.js */
angular.module("sn.common.presence").factory('snPresence', function($rootScope, $window, $log, amb, $timeout, $http, snRecordPresence, snTabActivity, urlTools, PRESENCE_DISABLED) {
  "use strict";
  var REST = {
    PRESENCE: "/api/now/ui/presence"
  };
  var RETRY_INTERVAL = ($window.NOW.presence_interval || 15) * 1000;
  var MAX_RETRY_DELAY = RETRY_INTERVAL * 10;
  var initialized = false;
  var primary = false;
  var presenceArray = [];
  var serverTimeMillis;
  var skew = 0;
  var st = 0;

  function init() {
    var location = urlTools.parseQueryString($window.location.search);
    var table = location['table'] || location['sysparm_table'];
    var sys_id = location['sys_id'] || location['sysparm_sys_id'];
    return initPresence(table, sys_id);
  }

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!initialized) {
      initialized = true;
      initRootScopes();
      if (!primary) {
        CustomEvent.observe('sn.presence', onPresenceEvent);
        CustomEvent.fireTop('sn.presence.ping');
      } else {
        presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
        if (presenceArray)
          $timeout(schedulePresence, 100);
        else
          updatePresence();
      }
    }
    return snRecordPresence.initPresence(t, id);
  }

  function onPresenceEvent(parms) {
    presenceArray = parms;
    $timeout(broadcastPresence);
  }

  function initRootScopes() {
    if ($window.NOW.presence_scopes) {
      var ps = $window.NOW.presence_scopes;
      if (ps.indexOf($rootScope) == -1)
        ps.push($rootScope);
    } else {
      $window.NOW.presence_scopes = [$rootScope];
      primary = CustomEvent.isTopWindow();
    }
  }

  function setPresence(data, st) {
    var rt = new Date().getTime() - st;
    if (rt > 500)
      console.log("snPresence response time " + rt + "ms");
    if (data.result && data.result.presenceArray) {
      presenceArray = data.result.presenceArray;
      setLocalPresence(presenceArray);
      serverTimeMillis = data.result.serverTimeMillis;
      skew = new Date().getTime() - serverTimeMillis;
      var t = Math.floor(skew / 1000);
      if (t < -15)
        console.log(">>>>> server ahead " + Math.abs(t) + " seconds");
      else if (t > 15)
        console.log(">>>>> browser time ahead " + t + " seconds");
    }
    schedulePresence();
  }

  function updatePresence(numAttempts) {
    presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
    if (presenceArray) {
      determineStatus(presenceArray);
      $timeout(schedulePresence);
      return;
    }
    if (!amb.isLoggedIn() || !snTabActivity.isPrimary) {
      $timeout(schedulePresence);
      return;
    }
    var p = {
      user_agent: navigator.userAgent,
      ua_time: new Date().toISOString(),
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      path: window.location.pathname + window.location.search
    };
    st = new Date().getTime();
    $http.post(REST.PRESENCE + '?sysparm_auto_request=true&cd=' + st, p).success(function(data) {
      setPresence(data, st);
    }).error(function(response, status) {
      console.log("snPresence " + status);
      schedulePresence(numAttempts);
    })
  }

  function schedulePresence(numAttempts) {
    numAttempts = isFinite(numAttempts) ? numAttempts + 1 : 0;
    var interval = getDecayingRetryInterval(numAttempts);
    $timeout(function() {
      updatePresence(numAttempts)
    }, interval);
    determineStatus(presenceArray);
    broadcastPresence();
  }

  function broadcastPresence() {
    if (angular.isDefined($window.applyPresenceArray)) {
      $window.applyPresenceArray(presenceArray);
    }
    $rootScope.$emit("sn.presence", presenceArray);
    if (!primary)
      return;
    CustomEvent.fireAll('sn.presence', presenceArray);
  }

  function determineStatus(presenceArray) {
    if (!presenceArray || !presenceArray.forEach)
      return;
    var t = new Date().getTime();
    t -= skew;
    presenceArray.forEach(function(p) {
      var x = 0 + p.last_on;
      var y = t - x;
      p.status = "online";
      if (y > (5 * RETRY_INTERVAL))
        p.status = "offline";
      else if (y > (3 * RETRY_INTERVAL))
        p.status = "probably offline";
      else if (y > (2.5 * RETRY_INTERVAL))
        p.status = "maybe offline";
    })
  }

  function setLocalPresence(value) {
    var p = {
      saved: new $window.Date().getTime(),
      presenceArray: value
    };
    $window.localStorage.setItem('snPresence', angular.toJson(p));
  }

  function getLocalPresence(p) {
    if (!p)
      return null;
    try {
      p = angular.fromJson(p);
    } catch (e) {
      p = {};
    }
    if (!p.presenceArray)
      return null;
    var now = new Date().getTime();
    if (now - p.saved >= RETRY_INTERVAL)
      return null;
    return p.presenceArray;
  }

  function getDecayingRetryInterval(numAttempts) {
    return Math.min(RETRY_INTERVAL * Math.pow(2, numAttempts), MAX_RETRY_DELAY);
  }
  return {
    init: init,
    initPresence: initPresence,
    _getLocalPresence: getLocalPresence,
    _setLocalPresence: setLocalPresence,
    _determineStatus: determineStatus
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
  "use strict";
  var statChannel;
  var interval = ($window.NOW.record_presence_interval || 20) * 1000;
  var sessions = {};
  var primary = false;
  var table;
  var sys_id;

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!t || !id)
      return;
    if (t == table && id == sys_id)
      return;
    initRootScopes();
    if (!primary)
      return;
    termPresence();
    table = t;
    sys_id = id;
    var recordPresence = "/sn/rp/" + table + "/" + sys_id;
    $rootScope.me = NOW.session_id;
    statChannel = amb.getChannel(recordPresence);
    statChannel.subscribe(onStatus);
    amb.connected.then(function() {
      setStatus("entered");
      $rootScope.status = "viewing";
    });
    return statChannel;
  }

  function initRootScopes() {
    if ($window.NOW.record_presence_scopes) {
      var ps = $window.NOW.record_presence_scopes;
      if (ps.indexOf($rootScope) == -1) {
        ps.push($rootScope);
        CustomEvent.observe('sn.sessions', onPresenceEvent);
      }
    } else {
      $window.NOW.record_presence_scopes = [$rootScope];
      primary = true;
    }
  }

  function onPresenceEvent(sessionsToSend) {
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
  }

  function termPresence() {
    if (!statChannel)
      return;
    statChannel.unsubscribe();
    statChannel = table = sys_id = null;
  }

  function setStatus(status) {
    if (status == $rootScope.status)
      return;
    $rootScope.status = status;
    if (Object.keys(sessions).length == 0)
      return;
    if (getStatusPrecedence(status) > 1)
      return;
    publish($rootScope.status);
  }

  function publish(status) {
    if (!statChannel)
      return;
    if (amb.getState() !== "opened")
      return;
    statChannel.publish({
      presences: [{
        status: status,
        session_id: NOW.session_id,
        user_name: NOW.user_name,
        user_id: NOW.user_id,
        user_display_name: NOW.user_display_name,
        user_initials: NOW.user_initials,
        user_avatar: NOW.user_avatar,
        ua: navigator.userAgent,
        table: table,
        sys_id: sys_id,
        time: new Date().toString().substring(0, 24)
      }]
    });
  }

  function onStatus(message) {
    message.data.presences.forEach(function(d) {
      if (!d.session_id || d.session_id == NOW.session_id)
        return;
      var s = sessions[d.session_id];
      if (s)
        angular.extend(s, d);
      else
        s = sessions[d.session_id] = d;
      s.lastUpdated = new Date();
      if (s.status == 'exited')
        delete sessions[d.session_id];
    });
    broadcastSessions();
  }

  function broadcastSessions() {
    var sessionsToSend = getUniqueSessions();
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
    if (primary)
      $timeout(function() {
        CustomEvent.fire('sn.sessions', sessionsToSend);
      })
  }

  function getUniqueSessions() {
    var uniqueSessionsByUser = {};
    var sessionKeys = Object.keys(sessions);
    sessionKeys.forEach(function(key) {
      var session = sessions[key];
      if (session.user_id == NOW.user_id)
        return;
      if (session.user_id in uniqueSessionsByUser) {
        var otherSession = uniqueSessionsByUser[session.user_id];
        var thisPrecedence = getStatusPrecedence(session.status);
        var otherPrecedence = getStatusPrecedence(otherSession.status);
        uniqueSessionsByUser[session.user_id] = thisPrecedence < otherPrecedence ? session : otherSession;
        return
      }
      uniqueSessionsByUser[session.user_id] = session;
    });
    var uniqueSessions = {};
    angular.forEach(uniqueSessionsByUser, function(item) {
      uniqueSessions[item.session_id] = item;
    });
    return uniqueSessions;
  }

  function getStatusPrecedence(status) {
    switch (status) {
      case 'typing':
        return 0;
      case 'viewing':
        return 1;
      case 'entered':
        return 2;
      case 'exited':
      case 'probably left':
        return 4;
      case 'offline':
        return 5;
      default:
        return 3;
    }
  }
  $rootScope.$on("record.typing", function(evt, data) {
    setStatus(data.status);
  });
  var idleTable, idleSysID;
  snTabActivity.onIdle({
    onIdle: function RecordPresenceTabIdle() {
      idleTable = table;
      idleSysID = sys_id;
      sessions = {};
      termPresence();
      broadcastSessions();
    },
    onReturn: function RecordPresenceTabActive() {
      initPresence(idleTable, idleSysID, true);
      idleTable = idleSysID = void(0);
    },
    delay: interval * 4
  });
  return {
    initPresence: initPresence,
    termPresence: termPresence
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snPresence.js */
angular.module('sn.common.presence').directive('snPresence', function(snPresence, $rootScope, $timeout, i18n) {
  'use strict';
  $timeout(snPresence.init, 100);
  var presenceStatus = {};
  i18n.getMessages(['maybe offline', 'probably offline', 'offline', 'online', 'entered', 'viewing'], function(results) {
    presenceStatus.maybe_offline = results['maybe offline'];
    presenceStatus.probably_offline = results['probably offline'];
    presenceStatus.offline = results['offline'];
    presenceStatus.online = results['online'];
    presenceStatus.entered = results['entered'];
    presenceStatus.viewing = results['viewing'];
  });
  var presences = {};
  $rootScope.$on('sn.presence', function(event, presenceArray) {
    if (!presenceArray) {
      angular.forEach(presences, function(p) {
        p.status = "offline";
      });
      return;
    }
    presenceArray.forEach(function(presence) {
      presences[presence.user] = presence;
    });
  });
  return {
    restrict: 'EA',
    replace: false,
    scope: {
      userId: '@?',
      snPresence: '=?',
      user: '=?',
      profile: '=?',
      displayName: '=?'
    },
    link: function(scope, element) {
      if (scope.profile) {
        scope.user = scope.profile.userID;
        scope.profile.tabIndex = -1;
        if (scope.profile.isAccessible)
          scope.profile.tabIndex = 0;
      }
      if (!element.hasClass('presence'))
        element.addClass('presence');

      function updatePresence() {
        var id = scope.snPresence || scope.user;
        if (!angular.isDefined(id) && angular.isDefined(scope.userId)) {
          id = scope.userId;
        }
        if (presences[id]) {
          var status = presences[id].status;
          if (status === 'maybe offline' || status === 'probably offline') {
            element.removeClass('presence-online presence-offline presence-away');
            element.addClass('presence-away');
          } else if (status == "offline" && !element.hasClass('presence-offline')) {
            element.removeClass('presence-online presence-away');
            element.addClass('presence-offline');
          } else if ((status == "online" || status == "entered" || status == "viewing") && !element.hasClass('presence-online')) {
            element.removeClass('presence-offline presence-away');
            element.addClass('presence-online');
          }
          status = status.replace(/ /g, "_");
          if (scope.profile)
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.profile.userName + ' ' + presenceStatus[status]);
          else
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.displayName + ' ' + presenceStatus[status]);
        } else {
          if (!element.hasClass('presence-offline'))
            element.addClass('presence-offline');
        }
      }
      var unbind = $rootScope.$on('sn.presence', updatePresence);
      scope.$on('$destroy', unbind);
      updatePresence();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snComposing.js */
angular.module('sn.common.presence').directive('snComposing', function(getTemplateUrl, snComposingPresence) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snComposing.xml"),
    replace: true,
    scope: {
      conversation: "="
    },
    controller: function($scope, $element) {
      var child = $element.children();
      if (child && child.tooltip)
        child.tooltip({
          'template': '<div class="tooltip" style="white-space: pre-wrap" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
          'placement': 'top',
          'container': 'body'
        });
      $scope.snComposingPresence = snComposingPresence;
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/service.snComposingPresence.js */
angular.module('sn.common.presence').service('snComposingPresence', function(i18n) {
  "use strict";
  var viewing = {};
  var typing = {};
  var allStrings = {};
  var shortStrings = {};
  var typing1 = "{0} is typing",
    typing2 = "{0} and {1} are typing",
    typingMore = "{0}, {1}, and {2} more are typing",
    viewing1 = "{0} is viewing",
    viewing2 = "{0} and {1} are viewing",
    viewingMore = "{0}, {1}, and {2} more are viewing";
  i18n.getMessages(
    [
      typing1,
      typing2,
      typingMore,
      viewing1,
      viewing2,
      viewingMore
    ],
    function(results) {
      typing1 = results[typing1];
      typing2 = results[typing2];
      typingMore = results[typingMore];
      viewing1 = results[viewing1];
      viewing2 = results[viewing2];
      viewingMore = results[viewingMore];
    });

  function set(conversationID, newPresenceValues) {
    if (newPresenceValues.viewing)
      viewing[conversationID] = newPresenceValues.viewing;
    if (newPresenceValues.typing)
      typing[conversationID] = newPresenceValues.typing;
    generateAllString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    generateShortString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    return {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    }
  }

  function get(conversationID) {
    return {
      viewing: viewing[conversationID] || [],
      typing: typing[conversationID] || []
    }
  }

  function generateAllString(conversationID, members) {
    var result = "";
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    if (typingLength < 4 && viewingLength < 4)
      return "";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        result += i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      default:
        var allButLastTyper = "";
        for (var i = 0; i < typingLength; i++) {
          if (i < typingLength - 2)
            allButLastTyper += members.typing[i].name + ", ";
          else if (i === typingLength - 2)
            allButLastTyper += members.typing[i].name + ",";
          else
            result += i18n.format(typing2, allButLastTyper, members.typing[i].name);
        }
    }
    if (viewingLength > 0 && typingLength > 0)
      result += "\n\n";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        result += i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      default:
        var allButLastViewer = "";
        for (var i = 0; i < viewingLength; i++) {
          if (i < viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ", ";
          else if (i === viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ",";
          else
            result += i18n.format(viewing2, allButLastViewer, members.viewing[i].name);
        }
    }
    allStrings[conversationID] = result;
  }

  function generateShortString(conversationID, members) {
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    var typingString = "",
      viewingString = "";
    var inBetween = " ";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        typingString = i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        typingString = i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      case 3:
        typingString = i18n.format(typing2, members.typing[0].name + ", " + members.typing[1].name + ",", members.typing[2].name);
        break;
      default:
        typingString = i18n.format(typingMore, members.typing[0].name, members.typing[1].name, (typingLength - 2));
    }
    if (viewingLength > 0 && typingLength > 0)
      inBetween = ". ";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        viewingString = i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        viewingString = i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      case 3:
        viewingString = i18n.format(viewing2, members.viewing[0].name + ", " + members.viewing[1].name + ",", members.viewing[2].name);
        break;
      default:
        viewingString = i18n.format(viewingMore, members.viewing[0].name, members.viewing[1].name, (viewingLength - 2));
    }
    shortStrings[conversationID] = typingString + inBetween + viewingString;
  }

  function getAllString(conversationID) {
    if ((viewing[conversationID] && viewing[conversationID].length > 3) ||
      (typing[conversationID] && typing[conversationID].length > 3))
      return allStrings[conversationID];
    return "";
  }

  function getShortString(conversationID) {
    return shortStrings[conversationID];
  }

  function remove(conversationID) {
    delete viewing[conversationID];
  }
  return {
    set: set,
    get: get,
    generateAllString: generateAllString,
    getAllString: getAllString,
    generateShortString: generateShortString,
    getShortString: getShortString,
    remove: remove
  }
});;;
/*! RESOURCE: /scripts/sn/common/user_profile/js_includes_user_profile.js */
/*! RESOURCE: /scripts/sn/common/user_profile/_module.js */
angular.module("sn.common.user_profile", ['sn.common.ui']);;
/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http) {
  "use strict";
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snUserProfile.xml'),
    scope: {
      profile: "=",
      showDirectMessagePrompt: "="
    },
    link: function(scope, element) {
      scope.showDirectMessagePromptFn = function() {
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          return !(!scope.profile ||
            activeUserID === scope.profile.sysID ||
            (scope.profile.document && activeUserID === scope.profile.document));
        } else {
          return false;
        }
      };
      $timeout(function() {
        element.find("#direct-message-popover-trigger").on("click", scope.openDirectMessageConversation);
      }, 0, false);
    },
    controller: function($scope, snConnectService) {
      if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID)) {
        $scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
        $scope.$emit("sn-user-profile.ready");
      } else {
        $http.get('/api/now/live/profiles/sys_user.' + $scope.profile.userID).then(function(response) {
          angular.merge($scope.profile, response.data.result);
          avatarProfilePersister.setAvatar($scope.profile.userID, $scope.profile);
          $scope.$emit("sn-user-profile.ready");
        })
      }
      $scope.openDirectMessageConversation = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $timeout(function() {
          snConnectService.openWithProfile($scope.profile);
        }, 0, false);
        angular.element('.popover').each(function() {
          angular.element('body').off('click.snUserAvatarPopoverClose');
          angular.element(this).popover('hide');
        });
      };
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/avatar/_module.js */
angular.module('sn.common.avatar', ['sn.common.presence', 'sn.common.messaging', 'sn.common.user_profile']).config(function($provide) {
  $provide.value("liveProfileID", '');
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatarPopover.js */
angular.module('sn.common.avatar').directive('snAvatarPopover', function($http, $compile, getTemplateUrl, avatarProfilePersister, $injector) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_avatar_popover.xml'),
    replace: true,
    transclude: true,
    scope: {
      members: '=',
      primary: '=?',
      showPresence: '=?',
      enableContextMenu: '=?',
      enableTooltip: '=?',
      enableBindOnce: '@',
      displayMemberCount: "=?",
      groupAvatar: "@",
      nopopover: "=",
      directconversation: '@',
      conversation: '=',
      primaryNonAssign: '=?'
    },
    compile: function(tElement) {
      var template = tElement.html();
      return function(scope, element, attrs, controller, transcludeFn) {
        if (scope.directconversation) {
          if (scope.directconversation === "true")
            scope.directconversation = true;
          else
            scope.directconversation = false;
          scope.showdirectconversation = !scope.directconversation;
        } else {
          scope.showdirectconversation = true;
        }
        if ($injector.has('inSupportClient') && $injector.get('inSupportClient'))
          scope.showdirectconversation = false;
        if (scope.primaryNonAssign) {
          scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
          if (scope.users && scope.users[0])
            scope.users[0] = scope.primary;
        }

        function recompile() {
          if (scope.primaryNonAssign) {
            scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
            if (scope.users && scope.users[0])
              scope.users[0] = scope.primary;
          }
          var newElement = $compile(template, transcludeFn)(scope);
          element.html(newElement);
          if (scope.enableTooltip) {
            element.tooltip({
              placement: 'auto top',
              container: 'body'
            }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
            if (element.hideFix)
              element.hideFix();
          }
        }
        if (attrs.enableBindOnce === 'false') {
          scope.$watch('primary', recompile);
          scope.$watch('primaryNonAssign', recompile);
          scope.$watch('members', recompile);
        }
        if (scope.enableTooltip && scope.nopopover) {
          var usersWatch = scope.$watch('users', function() {
            if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
              element.tooltip({
                placement: 'auto top',
                container: 'body'
              }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
              if (element.hideFix)
                element.hideFix();
              usersWatch();
            }
          });
        }
      };
    },
    controller: function($scope, liveProfileID, $timeout, $element, $document, snCustomEvent) {
      $scope.randId = Math.random();
      $scope.loadEvent = 'sn-user-profile.ready';
      $scope.closeEvent = ['chat:open_conversation', 'snAvatar.closePopover', 'body_clicked'];
      $scope.popoverConfig = {
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      $scope.displayMemberCount = $scope.displayMemberCount || false;
      $scope.liveProfileID = liveProfileID;
      if ($scope.primaryNonAssign) {
        $scope.primary = angular.extend({}, $scope.primary, $scope.primaryNonAssign);
        if ($scope.users && $scope.users[0])
          $scope.users[0] = $scope.primary;
      }
      $scope.$watch('members', function(newVal, oldVal) {
        if (newVal === oldVal)
          return;
        if ($scope.members)
          buildAvatar();
      });
      $scope.noPopover = function() {
        $scope.popoverCursor = ($scope.nopopover || ($scope.members && $scope.members.length > 2)) ? "default" : "pointer";
        return ($scope.nopopover || ($scope.members && $scope.members.length > 2));
      }
      $scope.avatarType = function() {
        var result = [];
        if ($scope.groupAvatar || !$scope.users)
          return result;
        if ($scope.users.length > 1)
          result.push("group")
        if ($scope.users.length === 2)
          result.push("avatar-duo")
        if ($scope.users.length === 3)
          result.push("avatar-trio")
        if ($scope.users.length >= 4)
          result.push("avatar-quad")
        return result;
      }
      $scope.getBackgroundStyle = function(user) {
        var avatar = (user ? user.avatar : '');
        if ($scope.groupAvatar)
          avatar = $scope.groupAvatar;
        if (avatar && avatar !== '')
          return {
            'background-image': 'url(' + avatar + ')'
          };
        if (user && user.name)
          return '';
        return void(0);
      };
      $scope.stopPropCheck = function(evt) {
        $scope.$broadcast("snAvatar.closeOtherPopovers", $scope.randId);
        if (!$scope.nopopover) {
          evt.stopPropagation();
        }
      };
      $scope.$on("snAvatar.closeOtherPopovers", function(id) {
        if (id !== $scope.randId)
          snCustomEvent.fireTop('snAvatar.closePopover');
      });
      $scope.maxStringWidth = function() {
        var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
        return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
      };

      function buildInitials(name) {
        if (!name)
          return "--";
        var initials = name.split(" ").map(function(word) {
          return word.toUpperCase();
        }).filter(function(word) {
          return word.match(/^[A-Z]/);
        }).map(function(word) {
          return word.substring(0, 1);
        }).join("");
        return (initials.length > 3) ?
          initials.substr(0, 3) :
          initials;
      }
      $scope.avatartooltip = function() {
        if (!$scope.enableTooltip) {
          return '';
        }
        if (!$scope.users) {
          return '';
        }
        var names = [];
        $scope.users.forEach(function(user) {
          if (!user) {
            return;
          }
          names.push(user.name);
        });
        return names.join(', ');
      };

      function buildAvatar() {
        if (typeof $scope.primary === 'string') {
          $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
            $scope.users = [{
              userID: $scope.primary,
              name: response.data.result.name,
              initials: buildInitials(response.data.result.name),
              avatar: response.data.result.avatar
            }];
          });
          return;
        }
        if ($scope.primary) {
          if ($scope.primary.userImage)
            $scope.primary.avatar = $scope.primary.userImage;
          if (!$scope.primary.userID && $scope.primary.sys_id)
            $scope.primary.userID = $scope.primary.sys_id;
        }
        $scope.isGroup = $scope.conversation && $scope.conversation.isGroup;
        $scope.users = [$scope.primary];
        if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
          $scope.users = [$scope.primary];
        } else if ($scope.members && $scope.members.length > 0) {
          $scope.users = buildCompositeAvatar($scope.members);
        }
        $scope.presenceEnabled = $scope.showPresence && !$scope.isGroup && $scope.users.length === 1;
      }

      function buildCompositeAvatar(members) {
        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
        var users = angular.isArray(members) ? members.slice() : [members];
        users = users.sort(function(a, b) {
          var aID = a.userID || a.document;
          var bID = b.userID || b.document;
          if (a.table === "chat_queue_entry")
            return 1;
          if (aID === currentUser)
            return 1;
          else if (bID === currentUser)
            return -1;
          return 0;
        });
        if (users.length === 2)
          users = [users[0]];
        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
          var index = -1;
          angular.forEach(users, function(user, i) {
            if (user.sys_id === $scope.primary.sys_id) {
              index = i;
            }
          });
          if (index > -1) {
            users.splice(index, 1);
          }
          users.splice(1, 0, $scope.primary);
        }
        return users;
      }
      buildAvatar();
      $scope.loadFullProfile = function() {
        if ($scope.primary && !$scope.primary.sys_id && !avatarProfilePersister.getAvatar($scope.primary.userID)) {
          $http.get('/api/now/live/profiles/' + $scope.primary.userID).then(
            function(response) {
              try {
                angular.extend($scope.primary, response.data.result);
                avatarProfilePersister.setAvatar($scope.primary.userID, $scope.primary);
              } catch (e) {}
            });
        }
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatar.js */
angular.module('sn.common.avatar')
  .factory('snAvatarFactory', function($http, $compile, $templateCache, $q, snCustomEvent, snConnectService) {
    'use strict';
    return function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          members: '=',
          primary: '=',
          showPresence: '=?',
          enableContextMenu: '=?',
          enableTooltip: '=?',
          enableBindOnce: '@',
          displayMemberCount: "=?",
          groupAvatar: "@"
        },
        compile: function(tElement) {
          var template = tElement.html();
          return function(scope, element, attrs, controller, transcludeFn) {
            var newElement = $compile(template, transcludeFn)(scope);
            element.html(newElement);
            if (scope.enableTooltip) {
              element.tooltip({
                placement: 'auto top',
                container: 'body'
              }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
              if (element.hideFix)
                element.hideFix();
            }
            if (attrs.enableBindOnce === 'false') {
              scope.$watch('primary', recompile);
              scope.$watch('members', recompile);
            }
            if (scope.enableTooltip) {
              var usersWatch = scope.$watch('users', function() {
                if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
                  element.tooltip({
                    placement: 'auto top',
                    container: 'body'
                  }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
                  if (element.hideFix)
                    element.hideFix();
                  usersWatch();
                }
              });
            }
            if (scope.enableContextMenu !== false) {
              scope.contextOptions = [];
              var gUser = null;
              try {
                gUser = g_user;
              } catch (err) {}
              if (scope.users && scope.users.length === 1 && scope.users[0] && (scope.users[0].userID || scope.users[0].sys_id)) {
                scope.contextOptions = [
                  ["Open user's profile", function() {
                    if (scope.users && scope.users.length > 0) {
                      window.open('/nav_to.do?uri=' + encodeURIComponent('sys_user.do?sys_id=' + scope.users[0].userID), '_blank');
                    }
                  }]
                ];
                if ((gUser && scope.users[0].userID && scope.users[0].userID !== gUser.userID) ||
                  (scope.liveProfileID && scope.users[0] && scope.users[0].sysID !== scope.liveProfileID)) {
                  scope.contextOptions.push(["Open a new chat", function() {
                    snConnectService.openWithProfile(scope.users[0]);
                  }]);
                }
              }
            } else {
              scope.contextOptions = [];
            }
          };
        },
        controller: function($scope, liveProfileID) {
          var firstBuildAvatar = true;
          $scope.displayMemberCount = $scope.displayMemberCount || false;
          $scope.liveProfileID = liveProfileID;
          $scope.$watch('primary', function(newValue, oldValue) {
            if ($scope.primary && newValue !== oldValue) {
              if (!firstBuildAvatar)
                buildAvatar();
              if ($scope.contextOptions.length > 0) {
                $scope.contextOptions = [
                  ["Open user's profile", function() {
                    if ($scope.users && $scope.users.length > 0) {
                      window.location.href = 'sys_user.do?sys_id=' + $scope.users[0].userID || $scope.users[0].userID;
                    }
                  }]
                ];
                var gUser = null;
                try {
                  gUser = g_user;
                } catch (err) {}
                if ((!gUser && !liveProfileID) || ($scope.users && $scope.users.length === 1 && $scope.users[0])) {
                  if ((gUser && $scope.users[0].userID && $scope.users[0].userID !== gUser.userID) ||
                    ($scope.liveProfileID && $scope.users[0] && $scope.users[0].sysID !== $scope.liveProfileID)) {
                    $scope.contextOptions.push(["Open a new chat", function() {
                      snConnectService.openWithProfile($scope.users[0]);
                    }]);
                  }
                }
              }
            }
          });
          $scope.$watch('members', function() {
            if ($scope.members && !firstBuildAvatar)
              buildAvatar();
          });
          $scope.avatarType = function() {
            var result = [];
            if ($scope.groupAvatar || !$scope.users)
              return result;
            if ($scope.users.length > 1)
              result.push("group");
            if ($scope.users.length === 2)
              result.push("avatar-duo");
            if ($scope.users.length === 3)
              result.push("avatar-trio");
            if ($scope.users.length >= 4)
              result.push("avatar-quad");
            return result;
          };
          $scope.getBackgroundStyle = function(user) {
            var avatar = (user ? user.avatar : '');
            if ($scope.groupAvatar)
              avatar = $scope.groupAvatar;
            if (avatar && avatar !== '')
              return {
                'background-image': 'url(' + avatar + ')'
              };
            if (user && user.name)
              return '';
            return void(0);
          };
          $scope.maxStringWidth = function() {
            var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
            return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
          };

          function buildInitials(name) {
            if (!name)
              return "--";
            var initials = name.split(" ").map(function(word) {
              return word.toUpperCase();
            }).filter(function(word) {
              return word.match(/^[A-ZÀ-Ÿ]/);
            }).map(function(word) {
              return word.substring(0, 1);
            }).join("");
            return (initials.length > 3) ?
              initials.substr(0, 3) :
              initials;
          }
          $scope.avatartooltip = function() {
            if (!$scope.enableTooltip) {
              return '';
            }
            if (!$scope.users) {
              return '';
            }
            var names = [];
            $scope.users.forEach(function(user) {
              if (!user) {
                return;
              }
              names.push(user.name);
            });
            return names.join(', ');
          };

          function setPresence() {
            $scope.presenceEnabled = $scope.showPresence && !$scope.isDocument && $scope.users.length === 1;
            return $scope.presenceEnabled;
          }

          function buildAvatar() {
            if (firstBuildAvatar)
              firstBuildAvatar = false;
            if (typeof $scope.primary === 'string') {
              return $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
                $scope.users = [{
                  userID: $scope.primary,
                  name: response.data.result.name,
                  initials: buildInitials(response.data.result.name),
                  avatar: response.data.result.avatar
                }];
                return setPresence();
              });
            }
            if ($scope.primary) {
              if ($scope.primary.userImage)
                $scope.primary.avatar = $scope.primary.userImage;
              if (!$scope.primary.userID && $scope.primary.sys_id)
                $scope.primary.userID = $scope.primary.sys_id;
            }
            $scope.isDocument = $scope.primary && $scope.primary.table && $scope.primary.table !== "sys_user" && $scope.primary.table !== "chat_queue_entry";
            $scope.users = [$scope.primary];
            if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
              $scope.users = [$scope.primary];
            } else if ($scope.members && $scope.members.length > 0) {
              $scope.users = buildCompositeAvatar($scope.members);
            }
            return $q.when(setPresence());
          }

          function buildCompositeAvatar(members) {
            var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
            var users = angular.isArray(members) ? members.slice() : [members];
            users = users.sort(function(a, b) {
              var aID = a.userID || a.document;
              var bID = b.userID || b.document;
              if (a.table === "chat_queue_entry")
                return 1;
              if (aID === currentUser)
                return 1;
              else if (bID === currentUser)
                return -1;
              return 0;
            });
            if (users.length === 2)
              users = [users[0]];
            if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
              var index = -1;
              angular.forEach(users, function(user, i) {
                if (user.sys_id === $scope.primary.sys_id) {
                  index = i;
                }
              });
              if (index > -1) {
                users.splice(index, 1);
              }
              users.splice(1, 0, $scope.primary);
            }
            return users;
          }
          buildAvatar();
        }
      }
    }
  })
  .directive('snAvatar', function(snAvatarFactory, getTemplateUrl) {
    var directive = snAvatarFactory();
    directive.templateUrl = getTemplateUrl('sn_avatar.xml');
    return directive;
  })
  .directive('snAvatarOnce', function(snAvatarFactory, getTemplateUrl) {
    var directive = snAvatarFactory();
    directive.templateUrl = getTemplateUrl('sn_avatar_once.xml');
    return directive;
  });;
/*! RESOURCE: /scripts/sn/common/avatar/service.avatarProfilePersister.js */
angular.module('sn.common.avatar').service('avatarProfilePersister', function() {
  "use strict";
  var avatars = {};

  function setAvatar(id, payload) {
    avatars[id] = payload;
  }

  function getAvatar(id) {
    return avatars[id];
  }
  return {
    setAvatar: setAvatar,
    getAvatar: getAvatar
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snUserAvatar.js */
angular.module('sn.common.avatar').directive('snUserAvatar', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_user_avatar.xml'),
    replace: true,
    scope: {
      profile: '=?',
      userId: '=?',
      avatarUrl: '=?',
      initials: '=?',
      enablePresence: '@',
      disablePopover: '=?',
      directConversationButton: '=?',
      userName: '=?',
      isAccessible: '=?'
    },
    link: function(scope, element) {
      scope.evaluatedProfile = undefined;
      scope.backgroundStyle = undefined;
      scope.enablePresence = scope.enablePresence !== 'false';
      if (scope.profile) {
        scope.evaluatedProfile = scope.profile;
        scope.userId = scope.profile.userID || "";
        scope.avatarUrl = scope.profile.avatar || "";
        scope.initials = scope.profile.initials || "";
        scope.backgroundStyle = scope.getBackgroundStyle();
      } else if (scope.userId || scope.avatarUrl || scope.initials || scope.userName) {
        scope.evaluatedProfile = scope.profile = {
          'userID': scope.userId || "",
          'avatar': scope.avatarUrl || "",
          'initials': scope.initials || "",
          'userName': scope.userName || "",
          'isAccessible': scope.isAccessible || false
        };
        scope.backgroundStyle = scope.getBackgroundStyle();
      } else {
        var unwatch = scope.$watch('profile', function(newVal) {
          if (newVal) {
            scope.evaluatedProfile = newVal;
            scope.backgroundStyle = scope.getBackgroundStyle();
            unwatch();
          }
        })
      }
      scope.directConversationButton = scope.directConversationButton !== 'false' && scope.directConversationButton !== false;
      scope.template = '<sn-user-profile tabindex="-1" id="sn-bootstrap-popover" profile="evaluatedProfile" show-direct-message-prompt="::directConversationButton" class="avatar-popover avatar-popover-padding"></sn-user-profile>';
      scope.ariaRole = scope.disablePopover ? 'presentation' : 'button';
    },
    controller: function($scope) {
      $scope.getBackgroundStyle = function() {
        if (($scope.avatarUrl && $scope.avatarUrl !== '') || $scope.evaluatedProfile && $scope.evaluatedProfile.avatar !== '')
          return {
            "background-image": 'url(' + ($scope.avatarUrl || $scope.evaluatedProfile.avatar) + ')'
          };
        return {
          "background-image": ""
        };
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snGroupAvatar.js */
angular.module('sn.common.avatar').directive('snGroupAvatar', function($http, $compile, getTemplateUrl, avatarProfilePersister) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_group_avatar.xml'),
    replace: true,
    transclude: true,
    scope: {
      members: '=',
      primary: '=?',
      groupAvatar: "@"
    },
    controller: function($scope, liveProfileID) {
      $scope.liveProfileID = liveProfileID;
      $scope.$watch('members', function(newVal, oldVal) {
        if (newVal === oldVal)
          return;
        if ($scope.members)
          $scope.users = buildCompositeAvatar($scope.members);
      });
      $scope.avatarType = function() {
        var result = [];
        if ($scope.groupAvatar || !$scope.users)
          return result;
        if ($scope.users.length > 1)
          result.push("group")
        if ($scope.users.length === 2)
          result.push("sn-avatar_duo")
        if ($scope.users.length === 3)
          result.push("sn-avatar_trio")
        if ($scope.users.length >= 4)
          result.push("sn-avatar_quad")
        return result;
      };
      $scope.getBackgroundStyle = function(user) {
        var avatar = (user ? user.avatar : '');
        if ($scope.groupAvatar)
          avatar = $scope.groupAvatar;
        if (avatar && avatar !== '')
          return {
            "background-image": "url(" + avatar + ")"
          };
        return {};
      };
      $scope.users = buildCompositeAvatar($scope.members);

      function buildCompositeAvatar(members) {
        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
        var users = angular.isArray(members) ? members.slice() : [members];
        users = users.sort(function(a, b) {
          var aID = a.userID || a.document;
          var bID = b.userID || b.document;
          if (a.table === "chat_queue_entry")
            return 1;
          if (aID === currentUser)
            return 1;
          else if (bID === currentUser)
            return -1;
          return 0;
        });
        if (users.length === 2)
          users = [users[0]];
        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
          var index = -1;
          angular.forEach(users, function(user, i) {
            if (user.sys_id === $scope.primary.sys_id) {
              index = i;
            }
          });
          if (index > -1) {
            users.splice(index, 1);
          }
          users.splice(1, 0, $scope.primary);
        }
        return users;
      }
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/controls/js_includes_controls.js */
/*! RESOURCE: /scripts/sn/common/controls/_module.js */
angular.module('sn.common.controls', []);;
/*! RESOURCE: /scripts/sn/common/controls/directive.snChoiceList.js */
angular.module('sn.common.controls').directive('snChoiceList', function($timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      snModel: "=",
      snTextField: "@",
      snValueField: "@",
      snOptions: "=?",
      snItems: "=?",
      snOnChange: "&",
      snDisabled: "=",
      snDialogName: "="
    },
    template: '<select ng-disabled="snDisabled" ' +
      '        ng-model="model" ' +
      '        ng-options="item[snValueField] as item[snTextField] for item in snItems">' +
      '  <option value="" ng-show="snOptions.placeholder">{{snOptions.placeholder}}</option>' +
      '</select>',
    link: function(scope, element, attrs) {
      if (scope.snDialogName)
        scope.$on("dialog." + scope.snDialogName + ".close", function() {
          $timeout(function() {
            $(element).select2("destroy");
          })
        });
      $(element).css("opacity", 0);
      var config = {
        width: "100%"
      };
      if (scope.snOptions) {
        if (scope.snOptions.placeholder) {
          config.placeholder = scope.snOptions.placeholder;
          config.placeholderOption = "first";
        }
        if (scope.snOptions.hideSearch && scope.snOptions.hideSearch === true) {
          config.minimumResultsForSearch = -1;
        }
      }

      function init() {
        scope.model = scope.snModel;
        render();
      }

      function render() {
        if (!attrs) {
          $timeout(function() {
            render();
          });
          return;
        }
        $timeout(function() {
          $(element).css("opacity", 1);
          $(element).select2("destroy");
          $(element).select2(config);
        });
      }
      init();
      scope.$watch("snItems", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          init();
        }
      }, true);
      scope.$watch("snModel", function(newValue) {
        if (newValue !== undefined && newValue !== scope.model) {
          init();
        }
      });
      scope.$watch("model", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          scope.snModel = newValue;
          if (scope.snOnChange)
            scope.snOnChange({
              selectedValue: newValue
            });
        }
      });
      scope.$on('$destroy', function() {
        $(element).select2("destroy");
      });
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snReferencePicker.js */
angular.module('sn.common.controls').directive('snReferencePicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      ed: "=?",
      field: "=",
      refTable: "=?",
      refId: "=?",
      snOptions: "=?",
      snOnChange: "&",
      snOnBlur: "&",
      snOnClose: "&",
      snOnOpen: '&',
      minimumInputLength: "@",
      snDisabled: "=",
      snPageSize: "@",
      dropdownCssClass: "@",
      formatResultCssClass: "&",
      overlay: "=",
      additionalDisplayColumns: "@",
      displayColumn: "@",
      recordValues: '&',
      getGlideForm: '&glideForm',
      domain: "@",
      snSelectWidth: '@',
    },
    template: '<input type="text" name="{{field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" ng-model="field.displayValue" />',
    link: function(scope, element, attrs, ctrl) {
      scope.ed = scope.ed || scope.field.ed;
      scope.selectWidth = scope.snSelectWidth || '100%';
      element.css("opacity", 0);
      var fireReadyEvent = true;
      var g_form;
      if (angular.isDefined(scope.getGlideForm))
        g_form = scope.getGlideForm();
      var fieldAttributes = {};
      if (angular.isDefined(scope.field) && angular.isDefined(scope.field.attributes) && typeof scope.ed.attributes == 'undefined')
        if (Array.isArray(scope.field.attributes))
          fieldAttributes = scope.field.attributes;
        else
          fieldAttributes = parseAttributes(scope.field.attributes);
      else
        fieldAttributes = parseAttributes(scope.ed.attributes);
      if (!angular.isDefined(scope.additionalDisplayColumns) && angular.isDefined(fieldAttributes['ref_ac_columns']))
        scope.additionalDisplayColumns = fieldAttributes['ref_ac_columns'];
      var select2AjaxHelpers = {
        formatSelection: function(item) {
          return $sanitize(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayValues = getDisplayValues(item);
          if (displayValues.length == 1)
            return $sanitize(displayValues[0]);
          if (displayValues.length > 1) {
            var width = 100 / displayValues.length;
            var markup = "";
            for (var i = 0; i < displayValues.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-result-cell'>" + $sanitize(displayValues[i]) + "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          if ('sysparm_include_variables' in queryParams.data) {
            var url = urlTools.getURL('ref_list_data', queryParams.data);
            return $http.get(url).then(queryParams.success);
          } else {
            var url = urlTools.getURL('ref_list_data');
            return $http.post(url, queryParams.data).then(queryParams.success);
          }
        },
        initSelection: function(elem, callback) {
          if (scope.field.displayValue)
            callback({
              sys_id: scope.field.value,
              name: scope.field.displayValue
            });
        }
      };
      var config = {
        width: scope.selectWidth,
        minimumInputLength: scope.minimumInputLength ? parseInt(scope.minimumInputLength, 10) : 0,
        overlay: scope.overlay,
        containerCssClass: 'select2-reference ng-form-element',
        placeholder: '   ',
        formatSearching: '',
        allowClear: attrs.allowClear !== 'false',
        id: function(item) {
          return item.sys_id;
        },
        sortResults: (scope.snOptions && scope.snOptions.sortResults) ? scope.snOptions.sortResults : undefined,
        ajax: {
          quietMillis: NOW.ac_wait_time,
          data: function(filterText, page) {
            var q = _getReferenceQuery(filterText);
            var params = {
              start: (scope.pageSize * (page - 1)),
              count: scope.pageSize,
              sysparm_target_table: scope.refTable,
              sysparm_target_sys_id: scope.refId,
              sysparm_target_field: scope.ed.dependent_field || scope.ed.name,
              table: scope.ed.reference,
              qualifier: scope.ed.qualifier,
              data_adapter: scope.ed.data_adapter,
              attributes: scope.ed.attributes,
              dependent_field: scope.ed.dependent_field,
              dependent_table: scope.ed.dependent_table,
              dependent_value: scope.ed.dependent_value,
              p: scope.ed.reference + ';q:' + q + ';r:' + scope.ed.qualifier
            };
            if (scope.domain) {
              params.sysparm_domain = scope.domain;
            }
            if (angular.isDefined(scope.field) && scope.field['_cat_variable'] === true) {
              delete params['sysparm_target_table'];
              params['sysparm_include_variables'] = true;
              params['variable_ids'] = scope.field.sys_id;
              var getFieldSequence = g_form.$private.options('getFieldSequence');
              if (getFieldSequence) {
                params['variable_sequence1'] = getFieldSequence();
              }
              var itemSysId = g_form.$private.options('itemSysId');
              params['sysparm_id'] = itemSysId;
              var getFieldParams = g_form.$private.options('getFieldParams');
              if (getFieldParams) {
                angular.extend(params, getFieldParams());
              }
            }
            if (scope.recordValues)
              params.sysparm_record_values = scope.recordValues();
            return params;
          },
          results: function(data, page) {
            return ctrl.filterResults(data, page, scope.pageSize);
          },
          transport: select2AjaxHelpers.search
        },
        formatSelection: select2AjaxHelpers.formatSelection,
        formatResult: select2AjaxHelpers.formatResult,
        initSelection: select2AjaxHelpers.initSelection,
        dropdownCssClass: attrs.dropdownCssClass,
        formatResultCssClass: scope.formatResultCssClass || null
      };
      if (scope.snOptions) {
        if (scope.snOptions.placeholder) {
          config.placeholder = scope.snOptions.placeholder;
        }
        if (scope.snOptions.width) {
          config.width = scope.snOptions.width;
        }
      }

      function _getReferenceQuery(filterText) {
        var filterExpression = filterExpressionParser.parse(filterText, scope.ed.defaultOperator);
        var colToSearch = getReferenceColumnsToSearch();
        var excludedValues = getExcludedValues();
        return colToSearch.map(function(column) {
          return column + filterExpression.operator + filterExpression.filterText +
            '^' + column + 'ISNOTEMPTY' + excludedValues;
        }).join("^NQ");
      }

      function getReferenceColumnsToSearch() {
        var colName = ['name'];
        if (scope.ed.searchField) {
          colName = scope.ed.searchField.split(";");
        } else if (fieldAttributes['ref_ac_columns_search'] == 'true' && 'ref_ac_columns' in fieldAttributes && fieldAttributes['ref_ac_columns'] != '') {
          colName = fieldAttributes['ref_ac_columns'].split(';');
        } else if (fieldAttributes['ref_ac_order_by']) {
          colName = [fieldAttributes['ref_ac_order_by']];
        }
        return colName;
      }

      function getExcludedValues() {
        if (scope.ed.excludeValues && scope.ed.excludeValues != '') {
          return '^sys_idNOT IN' + scope.ed.excludeValues;
        }
        return '';
      }

      function parseAttributes(strAttributes) {
        var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
        var attributeObj = {};
        for (var i = 0; i < attributeArray.length; i++) {
          if (attributeArray[i].length > 0) {
            var attribute = attributeArray[i].split('=');
            attributeObj[attribute[0]] = attribute.length > 1 ? attribute[1] : '';
          }
        }
        return attributeObj;
      }

      function init() {
        scope.model = scope.snModel;
        render();
      }

      function render() {
        $timeout(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          var select2 = element.select2(config);
          select2.bind("change", select2Change);
          select2.bind("select2-removed", select2Change);
          select2.bind("select2-blur", function() {
            scope.$apply(function() {
              scope.snOnBlur();
            });
          });
          select2.bind("select2-close", function() {
            scope.$apply(function() {
              scope.snOnClose();
            });
          });
          select2.bind("select2-open", function() {
            scope.$apply(function() {
              if (scope.snOnOpen)
                scope.snOnOpen();
            });
          });
          select2.bind('select2-focus', function() {
            redirectLabel(element);
          });
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      }

      function select2Change(e) {
        e.stopImmediatePropagation();
        if (e.added) {
          if (scope.$$phase || scope.$root.$$phase)
            return;
          var selectedItem = e.added;
          var value = selectedItem.sys_id;
          var displayValue = value ? getDisplayValue(selectedItem) : '';
          if (scope.snOptions && scope.snOptions.useGlideForm === true) {
            g_form.setValue(scope.field.name, value, displayValue);
            scope.rowSelected();
            e.displayValue = displayValue;
            triggerSnOnChange();
          } else {
            scope.$apply(function() {
              scope.field.value = value;
              scope.field.displayValue = displayValue;
              scope.rowSelected();
              e.displayValue = displayValue;
              triggerSnOnChange();
            });
          }
        } else if (e.removed) {
          if (scope.snOptions && scope.snOptions.useGlideForm === true) {
            g_form.clearValue(scope.field.name);
            triggerSnOnChange();
          } else {
            scope.$apply(function() {
              scope.field.displayValue = '';
              scope.field.value = '';
              triggerSnOnChange();
            });
          }
        }

        function triggerSnOnChange() {
          if (scope.snOnChange)
            scope.snOnChange(e);
        }
      }

      function redirectLabel($select2) {
        if (NOW.select2LabelWorkaround)
          NOW.select2LabelWorkaround($select2);
      }

      function getDisplayValue(selectedItem) {
        var displayValue = '';
        if (selectedItem && selectedItem.sys_id) {
          if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
            displayValue = selectedItem[scope.displayColumn];
          else if (selectedItem.$$displayValue)
            displayValue = selectedItem.$$displayValue;
          else if (selectedItem.name)
            displayValue = selectedItem.name;
          else if (selectedItem.title)
            displayValue = selectedItem.title;
        }
        return displayValue;
      }

      function getDisplayValues(selectedItem) {
        var displayValues = [];
        if (selectedItem && selectedItem.sys_id) {
          var current = "";
          if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
            current = selectedItem[scope.displayColumn];
          else if (selectedItem.$$displayValue)
            current = selectedItem.$$displayValue;
          else if (selectedItem.name)
            current = selectedItem.name;
          else if (selectedItem.title)
            current = selectedItem.title;
          displayValues.push(current);
        }
        if (scope.additionalDisplayColumns) {
          var columns = scope.additionalDisplayColumns.split(",");
          for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (selectedItem[column])
              displayValues.push(selectedItem[column]);
          }
        }
        return displayValues;
      }
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue != oldValue && newValue !== scope.model) {
          init();
        }
      });
      scope.$on("snReferencePicker.activate", function(evt, parms) {
        $timeout(function() {
          element.select2("open");
        })
      });
      init();
    },
    controller: function($scope, $rootScope) {
      $scope.pageSize = 20;
      if ($scope.snPageSize)
        $scope.pageSize = parseInt($scope.snPageSize);
      $scope.rowSelected = function() {
        $rootScope.$broadcast("@page.reference.selected", {
          field: $scope.field,
          ed: $scope.ed
        });
      };
      this.filterResults = function(data, page) {
        return {
          results: data.data.items,
          more: (page * $scope.pageSize < data.data.total)
        };
      };
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snRecordPicker.js */
angular.module('sn.common.controls').directive('snRecordPicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
  "use strict";
  var cache = {};

  function cleanLabel(val) {
    if (typeof val == "object")
      return "";
    return typeof val == "string" ? val.trim() : val;
  }
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: '=',
      table: '=',
      defaultQuery: '=?',
      startswith: '=?',
      searchFields: '=?',
      valueField: '=?',
      displayField: '=?',
      displayFields: '=?',
      pageSize: '=?',
      onChange: '&',
      snDisabled: '=',
      multiple: '=?',
      options: '=?',
      placeholder: '@'
    },
    template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{field.name}}" ng-model="field.value" />',
    controller: function($scope) {
      if (!angular.isNumber($scope.pageSize))
        $scope.pageSize = 20;
      if (!angular.isDefined($scope.valueField))
        $scope.valueField = 'sys_id';
      this.filterResults = function(data, page) {
        return {
          results: data.data.result,
          more: (page * $scope.pageSize < parseInt(data.headers('x-total-count'), 10))
        };
      };
    },
    link: function(scope, element, attrs, ctrl) {
      var isExecuting = false;
      var select2Helpers = {
        formatSelection: function(item) {
          return $sanitize(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayFields = getdisplayFields(item);
          if (displayFields.length == 1)
            return $sanitize(cleanLabel(displayFields[0]));
          if (displayFields.length > 1) {
            var markup = $sanitize(displayFields[0]);
            var width = 100 / (displayFields.length - 1);
            markup += "<div>";
            for (var i = 1; i < displayFields.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-additional-display-field'>" + $sanitize(cleanLabel(displayFields[i])) + "</div>";
            markup += "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          var url = '/api/now/table/' + scope.table + '?' + urlTools.encodeURIParameters(queryParams.data);
          if (scope.options && scope.options.cache && cache[url])
            return queryParams.success(cache[url]);
          return $http.get(url).then(function(response) {
            if (scope.options && scope.options.cache) {
              cache[url] = response;
            }
            return queryParams.success(response)
          });
        },
        initSelection: function(elem, callback) {
          if (scope.field.displayValue) {
            if (scope.multiple) {
              var items = [],
                sel;
              var values = scope.field.value.split(',');
              var displayValues = scope.field.displayValue.split(',');
              for (var i = 0; i < values.length; i++) {
                sel = {};
                sel[scope.valueField] = values[i];
                sel[scope.displayField] = displayValues[i];
                items.push(sel);
              }
              callback(items);
            } else {
              var sel = {};
              sel[scope.valueField] = scope.field.value;
              sel[scope.displayField] = scope.field.displayValue;
              callback(sel);
            }
          } else
            callback([]);
        }
      };
      var config = {
        width: '100%',
        containerCssClass: 'select2-reference ng-form-element',
        placeholder: scope.placeholder || '    ',
        formatSearching: '',
        allowClear: (scope.options && typeof scope.options.allowClear !== "undefined") ? scope.options.allowClear : true,
        id: function(item) {
          return item[scope.valueField];
        },
        ajax: {
          quietMillis: NOW.ac_wait_time,
          data: function(filterText, page) {
            var params = {
              sysparm_offset: (scope.pageSize * (page - 1)),
              sysparm_limit: scope.pageSize,
              sysparm_query: buildQuery(filterText, scope.searchFields, scope.defaultQuery)
            };
            return params;
          },
          results: function(data, page) {
            return ctrl.filterResults(data, page, scope.pageSize);
          },
          transport: select2Helpers.search
        },
        formatSelection: select2Helpers.formatSelection,
        formatResult: select2Helpers.formatResult,
        formatResultCssClass: function() {
          return '';
        },
        initSelection: select2Helpers.initSelection,
        multiple: scope.multiple
      };

      function buildQuery(filterText, searchFields, defaultQuery) {
        var queryParts = [];
        var operator = "CONTAINS";
        if (scope.startswith)
          operator = "STARTSWITH";
        if (filterText.startsWith("*")) {
          filterText = filterText.substring(1);
          operator = "CONTAINS";
        }
        if (defaultQuery)
          queryParts.push(defaultQuery);
        var filterExpression = filterExpressionParser.parse(filterText, operator);
        if (searchFields != null) {
          var fields = searchFields.split(',');
          if (filterExpression.filterText != '') {
            var OR = "";
            for (var i = 0; i < fields.length; i++) {
              queryParts.push(OR + fields[i] + filterExpression.operator + filterExpression.filterText);
              OR = "OR";
            }
          }
          for (var i = 0; i < fields.length; i++)
            queryParts.push('ORDERBY' + fields[i]);
          queryParts.push('EQ');
        }
        return queryParts.join('^');
      }
      scope.field = scope.field || {};
      var initTimeout = null;
      var value = scope.field.value;
      var oldValue = scope.field.value;
      var $select;

      function init() {
        element.css("opacity", 0);
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          $select = element.select2(config);
          $select.bind("change", onChanged);
          $select.bind("select2-removed", onChanged);
          $select.bind("select2-selecting", onSelecting);
          $select.bind("select2-removing", onRemoving);
          scope.$emit('select2.ready', element);
        });
      }

      function onSelecting(e) {
        isExecuting = true;
        oldValue = scope.field.value;
        var selectedItem = e.choice;
        if (scope.multiple && selectedItem[scope.valueField] != '') {
          var values = !scope.field.value ? [] : scope.field.value.split(',');
          var displayValues = !scope.field.displayValue ? [] : scope.field.displayValue.split(',');
          values.push(selectedItem[scope.valueField]);
          displayValues.push(getDisplayValue(selectedItem));
          scope.field.value = values.join(',');
          scope.field.displayValue = displayValues.join(',');
          e.preventDefault();
          $select.select2('val', values).select2('close');
          scope.$apply(function() {
            callChange(oldValue, e);
          });
        }
      }

      function onRemoving(e) {
        isExecuting = true;
        oldValue = scope.field.value;
        var removed = e.choice;
        if (scope.multiple) {
          var values = scope.field.value.split(',');
          var displayValues = scope.field.displayValue.split(',');
          for (var i = values.length - 1; i >= 0; i--) {
            if (removed[scope.valueField] == values[i]) {
              values.splice(i, 1);
              displayValues.splice(i, 1);
              break;
            }
          }
          scope.field.value = values.join(',');
          scope.field.displayValue = displayValues.join(',');
          e.preventDefault();
          $select.select2('val', scope.field.value.split(','));
          scope.$apply(function() {
            callChange(oldValue, e);
          });
        }
      }

      function callChange(oldValue, e) {
        var f = scope.field;
        var p = {
          field: f,
          newValue: f.value,
          oldValue: oldValue,
          displayValue: f.displayValue
        }
        scope.$emit("field.change", p);
        scope.$emit("field.change." + f.name, p);
        if (scope.onChange)
          try {
            scope.onChange(e);
          } catch (ex) {
            console.log("directive.snRecordPicker error in onChange")
            console.log(ex)
          }
        isExecuting = false;
      }

      function onChanged(e) {
        e.stopImmediatePropagation();
        if (scope.$$phase || scope.$root.$$phase) {
          console.warn('in digest, returning early');
          return;
        }
        if (e.added) {
          var selectedItem = e.added;
          if (!scope.multiple) {
            scope.field.value = selectedItem[scope.valueField];
            if (scope.field.value) {
              scope.field.displayValue = getDisplayValue(selectedItem);
            } else
              scope.field.displayValue = '';
          }
        } else if (e.removed) {
          if (!scope.multiple) {
            scope.field.displayValue = '';
            scope.field.value = '';
          }
        }
        scope.$apply(function() {
          callChange(oldValue, e);
        });
      }

      function getDisplayValue(selectedItem) {
        var displayValue = selectedItem[scope.valueField];
        if (selectedItem) {
          if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
            displayValue = selectedItem[scope.displayField];
          else if (selectedItem.name)
            displayValue = selectedItem.name;
          else if (selectedItem.title)
            displayValue = selectedItem.title;
        }
        return cleanLabel(displayValue);
      }

      function getdisplayFields(selectedItem) {
        var displayFields = [];
        if (selectedItem && selectedItem[scope.valueField]) {
          var current = "";
          if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
            current = selectedItem[scope.displayField];
          else if (selectedItem.name)
            current = selectedItem.name;
          else if (selectedItem.title)
            current = selectedItem.title;
          displayFields.push(current);
        }
        if (scope.displayFields) {
          var columns = scope.displayFields.split(",");
          for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (selectedItem[column])
              displayFields.push(selectedItem[column]);
          }
        }
        return displayFields;
      }
      scope.$watch("field.value", function(newValue) {
        if (isExecuting) return;
        if (angular.isDefined(newValue) && $select) {
          if (scope.multiple)
            $select.select2('val', newValue.split(',')).select2('close');
          else
            $select.select2('val', newValue).select2('close');
        }
      });
      if (attrs.displayValue) {
        attrs.$observe('displayValue', function(value) {
          scope.field.value = value;
        });
      }
      init();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSelectBasic.js */
angular.module('sn.common.controls').directive('snSelectBasic', function($timeout) {
  return {
    restrict: 'C',
    priority: 1,
    require: '?ngModel',
    scope: {
      'snAllowClear': '@',
      'snSelectWidth': '@',
      'snChoices': '=?'
    },
    link: function(scope, element, attrs, ngModel) {
      if (angular.isFunction(element.select2)) {
        element.css("opacity", 0);
        scope.selectWidth = scope.snSelectWidth || '100%';
        scope.selectAllowClear = scope.snAllowClear === "true";
        $timeout(function() {
          element.css("opacity", 1);
          element.select2({
            allowClear: scope.selectAllowClear,
            width: scope.selectWidth
          });
          if (ngModel === null)
            return;
          ngModel.$render = function() {
            element.select2('val', ngModel.$viewValue);
            element.val(ngModel.$viewValue);
          };
        });
        element.on('change', function() {
          scope.$evalAsync(setModelValue);
        });
        scope.$watch('snChoices', function(newValue, oldValue) {
          if (angular.isDefined(newValue) && newValue != oldValue) {
            $timeout(function() {
              setModelValue();
            });
          }
        }, true);

        function setModelValue() {
          if (ngModel === null)
            return;
          ngModel.$setViewValue(element.val());
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snTableReference.js */
angular.module('sn.common.controls').directive('snTableReference', function($timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: "=",
      snChange: "&",
      snDisabled: "="
    },
    template: '<select ng-disabled="snDisabled" style="min-width: 150px;" name="{{::field.name}}" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.value as choice.label for choice in field.choices"></select>',
    controller: function($scope) {
      $scope.fieldValue = function(selected) {
        if (angular.isDefined(selected)) {
          $scope.snChange({
            newValue: selected
          });
        }
        return $scope.field.value;
      }
    },
    link: function(scope, element) {
      var initTimeout = null;
      var fireReadyEvent = true;
      element.css("opacity", 0);

      function render() {
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          element.css("opacity", 1);
          element.select2("destroy");
          element.select2();
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      }
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue !== undefined && newValue != oldValue) {
          render();
        }
      });
      render();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snFieldReference.js */
angular.module('sn.common.controls').directive('snFieldReference', function($timeout, $http, nowServer) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: "=",
      snChange: "&",
      snDisabled: "=",
      getGlideForm: '&glideForm'
    },
    template: '<select ng-disabled="snDisabled" name="{{field.name}}" style="min-width: 150px;" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.name as choice.label for choice in field.choices"></select>',
    controller: function($scope) {
      $scope.fieldValue = function(selected) {
        if (angular.isDefined(selected))
          $scope.snChange({
            newValue: selected
          });
        return $scope.field.value;
      }
      $scope.$watch('field.dependentValue', function(newVal, oldVal) {
        if (!angular.isDefined(newVal))
          return;
        var src = nowServer.getURL('table_fields', 'exclude_formatters=true&fd_table=' + newVal);
        $http.post(src).success(function(response) {
          $scope.field.choices = response;
          $scope.render();
        });
      });
    },
    link: function(scope, element) {
      var initTimeout = null;
      var fireReadyEvent = true;
      scope.render = function() {
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          element.select2("destroy");
          element.select2();
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      };
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue !== undefined && newValue != oldValue) {
          scope.render();
        }
      });
      scope.render();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSyncWith.js */
angular.module("sn.common.controls").directive('snSyncWith', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr) {
      var journalField = scope.$eval(attr.snSyncWith);
      var journalValue = scope.$eval(attr.ngModel);
      if (attr.snSyncWithValueInFn)
        scope.$eval(attr.ngModel + "=" + attr.snSyncWithValueInFn, {
          text: scope.value
        });
      scope.$watch(function() {
        return scope.$eval(attr.snSyncWith);
      }, function(nv, ov) {
        if (nv !== ov)
          journalField = nv;
      });
      scope.$watch(function() {
        return scope.$eval(attr.ngModel);
      }, function(nv, ov) {
        if (nv !== ov)
          journalValue = nv;
      });
      if (!window.g_form)
        return;
      scope.$watch(function() {
        return journalValue;
      }, function(n, o) {
        if (n !== o)
          setFieldValue();
      });

      function setFieldValue() {
        setValue(journalField, journalValue);
      }

      function setValue(field, value) {
        value = !!value ? value : '';
        var control = g_form.getControl(field);
        if (attr.snSyncWithValueOutFn)
          value = scope.$eval(attr.snSyncWithValueOutFn, {
            text: value
          })
        control.value = value;
        onChange(control.id);
      }
      scope.$watch(function() {
        return journalField;
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (oldValue)
            setValue(oldValue, '');
          if (newValue)
            setFieldValue();
        }
      }, true);
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.contenteditable.js */
angular.module('sn.common.controls').directive('contenteditable', function($timeout, $sanitize) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      var changehandler = scope.changehandler;
      scope.usenewline = scope.usenewline + "" != "false";
      var newLine = "\n";
      var nodeBR = "BR";
      var nodeDIV = "DIV";
      var nodeText = "#text";
      var nbspRegExp = new RegExp(String.fromCharCode(160), "g");
      if (!scope.usenewline)
        elem.keypress(function(event) {
          if (event.which == "13") {
            if (scope.entercallback)
              scope.entercallback(elem);
            event.preventDefault();
          }
        });

      function processNodes(nodes) {
        var val = "";
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          var follow = true;
          switch (node.nodeName) {
            case nodeText:
              val += node.nodeValue.replace(nbspRegExp, " ");
              break;
            case nodeDIV:
              val += newLine;
              if (node.childNodes.length == 1 && node.childNodes[0].nodeName == nodeBR)
                follow = false;
              break;
            case nodeBR:
              val += scope.usenewline ? newLine : "";
          }
          if (follow)
            val += processNodes(node.childNodes)
        }
        return val;
      }

      function readHtml() {
        var val = processNodes(elem[0].childNodes);
        ctrl.$setViewValue(val);
      }

      function writeHtml() {
        var val = ctrl.$viewValue;
        if (!val || val === null)
          val = "";
        val = val.replace(/\n/gi, scope.usenewline ? "<br/>" : "");
        val = val.replace(/  /gi, " &nbsp;");
        try {
          if (attrs.contenteditableEscapeHtml == "true")
            val = $sanitize(val);
        } catch (err) {
          var replacement = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
          };
          val = val.replace(/[&<>"'\/]/g, function(pattern) {
            return replacement[pattern]
          });
        };
        elem.html(val);
      }

      function processPlaceholder() {
        if (elem[0].dataset) {
          if (elem[0].textContent)
            elem[0].dataset.divPlaceholderContent = 'true';
          else if (elem[0].dataset.divPlaceholderContent)
            delete(elem[0].dataset.divPlaceholderContent);
        }
      }
      elem.bind('keyup', function() {
        scope.$apply(function() {
          readHtml();
          processPlaceholder();
        });
      });

      function selectText(elem) {
        var range;
        var selection;
        if (document.body.createTextRange) {
          range = document.body.createTextRange();
          range.moveToElementText(elem);
          range.select();
        } else if (window.getSelection) {
          selection = window.getSelection();
          range = document.createRange();
          range.selectNodeContents(elem);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      elem.bind('focus', function() {
        if (scope[attrs.tracker] && scope[attrs.tracker]['isDefault_' + attrs.trackeratt])
          $timeout(function() {
            selectText(elem[0]);
          });
        elem.original = ctrl.$viewValue;
      });
      elem.bind('blur', function() {
        scope.$apply(function() {
          readHtml();
          processPlaceholder();
          if (elem.original != ctrl.$viewValue && changehandler) {
            if (scope[attrs.tracker] && typeof scope[attrs.tracker]['isDefault_' + attrs.trackeratt] != "undefined")
              scope[attrs.tracker]['isDefault_' + attrs.trackeratt] = false;
            changehandler(scope[attrs.tracker], attrs.trackeratt);
          }
        });
      });
      elem.bind('paste', function() {
        scope.$apply(function() {
          setTimeout(function() {
            readHtml();
            writeHtml();
          }, 0);
          return false;
        });
      });
      ctrl.$render = function() {
        writeHtml();
      };
      scope.$watch('field.readonly', function() {
        elem[0].contentEditable = !scope.$eval('field.readonly');
      });
      scope.$watch(
        function() {
          return {
            val: elem[0].textContent
          };
        },
        function(newValue, oldValue) {
          if (newValue.val != oldValue.val)
            processPlaceholder();
        },
        true);
      writeHtml();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snGlyph.js */
angular.module("sn.common.controls").directive("snGlyph", function() {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      char: "@",
    },
    template: '<span class="glyphicon glyphicon-{{char}}" />',
    link: function(scope) {}
  }
});
angular.module("sn.common.controls").directive('fa', function() {
    return {
      restrict: 'E',
      template: '<span class="fa" aria-hidden="true"></span>',
      replace: true,
      link: function(scope, element, attrs) {
        'use strict';
        var currentClasses = {};

        function _observeStringAttr(attr, baseClass) {
          var className;
          attrs.$observe(attr, function() {
            baseClass = baseClass || 'fa-' + attr;
            element.removeClass(currentClasses[attr]);
            if (attrs[attr]) {
              className = [baseClass, attrs[attr]].join('-');
              element.addClass(className);
              currentClasses[attr] = className;
            }
          });
        }
        _observeStringAttr('name', 'fa');
        _observeStringAttr('rotate');
        _observeStringAttr('flip');
        _observeStringAttr('stack');
        attrs.$observe('size', function() {
          var className;
          element.removeClass(currentClasses.size);
          if (attrs.size === 'large') {
            className = 'fa-lg';
          } else if (!isNaN(parseInt(attrs.size, 10))) {
            className = 'fa-' + attrs.size + 'x';
          }
          element.addClass(className);
          currentClasses.size = className;
        });
        attrs.$observe('stack', function() {
          var className;
          element.removeClass(currentClasses.stack);
          if (attrs.stack === 'large') {
            className = 'fa-stack-lg';
          } else if (!isNaN(parseInt(attrs.stack, 10))) {
            className = 'fa-stack-' + attrs.stack + 'x';
          }
          element.addClass(className);
          currentClasses.stack = className;
        });

        function _observeBooleanAttr(attr, className) {
          var value;
          attrs.$observe(attr, function() {
            className = className || 'fa-' + attr;
            value = attr in attrs && attrs[attr] !== 'false' && attrs[attr] !== false;
            element.toggleClass(className, value);
          });
        }
        _observeBooleanAttr('border');
        _observeBooleanAttr('fw');
        _observeBooleanAttr('inverse');
        _observeBooleanAttr('spin');
        element.toggleClass('fa-li',
          element.parent() &&
          element.parent().prop('tagName') === 'LI' &&
          element.parent().parent() &&
          element.parent().parent().hasClass('fa-ul') &&
          element.parent().children()[0] === element[0] &&
          attrs.list !== 'false' &&
          attrs.list !== false
        );
        attrs.$observe('alt', function() {
          var altText = attrs.alt,
            altElem = element.next(),
            altElemClass = 'fa-alt-text';
          if (altText) {
            element.removeAttr('alt');
            if (!altElem || !altElem.hasClass(altElemClass)) {
              element.after('<span class="sr-only fa-alt-text"></span>');
              altElem = element.next();
            }
            altElem.text(altText);
          } else if (altElem && altElem.hasClass(altElemClass)) {
            altElem.remove();
          }
        });
      }
    };
  })
  .directive('faStack', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<span ng-transclude class="fa-stack fa-lg"></span>',
      replace: true,
      link: function(scope, element, attrs) {
        var currentClasses = {};

        function _observeStringAttr(attr, baseClass) {
          var className;
          attrs.$observe(attr, function() {
            baseClass = baseClass || 'fa-' + attr;
            element.removeClass(currentClasses[attr]);
            if (attrs[attr]) {
              className = [baseClass, attrs[attr]].join('-');
              element.addClass(className);
              currentClasses[attr] = className;
            }
          });
        }
        _observeStringAttr('size');
        attrs.$observe('size', function() {
          var className;
          element.removeClass(currentClasses.size);
          if (attrs.size === 'large') {
            className = 'fa-lg';
          } else if (!isNaN(parseInt(attrs.size, 10))) {
            className = 'fa-' + attrs.size + 'x';
          }
          element.addClass(className);
          currentClasses.size = className;
        });
      }
    };
  });;
/*! RESOURCE: /scripts/sn/common/controls/directive.snImageUploader.js */
angular.module('sn.common.controls').directive('snImageUploader', function($window, $rootScope, $timeout, getTemplateUrl, i18n, snAttachmentHandler) {
  var DRAG_IMAGE_SELECT = i18n.getMessage('Drag image or click to select');
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('directive.snImageUploader'),
    transclude: true,
    scope: {
      readOnly: '@',
      tableName: '@',
      sysId: '@',
      fieldName: '@',
      onUpload: '&',
      onDelete: '&',
      uploadMessage: '@',
      src: '='
    },
    controller: function($scope) {
      $scope.uploading = false;
      $scope.getTitle = function() {
        if ($scope.readOnly !== 'true')
          return DRAG_IMAGE_SELECT;
        return '';
      }
    },
    link: function(scope, element) {
      function isValidImage(file) {
        if (file.type.indexOf('image') != 0) {
          $alert(i18n.getMessage('Please select an image'));
          return false;
        }
        if (file.type.indexOf('tiff') > 0) {
          $alert(i18n.getMessage('Please select a common image format such as gif, jpeg or png'));
          return false;
        }
        return true;
      }

      function $alert(message) {
        alert(message);
      }
      scope.onFileSelect = function($files) {
        if (scope.readOnly === 'true')
          return;
        if ($files.length == 0)
          return;
        var file = $files[0];
        if (!isValidImage(file))
          return;
        var uploadParams = {
          sysparm_fieldname: scope.fieldName
        };
        scope.uploading = true;
        snAttachmentHandler.create(scope.tableName, scope.sysId).uploadAttachment(file, uploadParams).then(function(response) {
          $timeout(function() {
            scope.uploading = false;
          });
          if (scope.onUpload)
            scope.onUpload({
              thumbnail: response.thumbnail
            });
          $rootScope.$broadcast("snImageUploader:complete", scope.sysId, response);
        });
      }
      scope.openFileSelector = function($event) {
        $event.stopPropagation();
        var input = element.find('input[type=file]');
        input.click();
      }
      scope.activateUpload = function($event) {
        if (scope.readOnly !== 'true')
          scope.openFileSelector($event);
        else
          scope.showUpload = !scope.showUpload;
      }
      scope.deleteAttachment = function() {
        var sys_id = scope.src.split(".")[0];
        snAttachmentHandler.deleteAttachment(sys_id).then(function() {
          scope.src = null;
          if (scope.onDelete)
            scope.onDelete();
          $rootScope.$broadcast("snImageUploader:delete", scope.sysId, sys_id);
        });
      }
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/i18n/js_includes_i18n.js */
/*! RESOURCE: /scripts/sn/common/i18n/_module.js */
angular.module('sn.common.i18n', ['sn.common.glide']);
angular.module('sn.i18n', ['sn.common.i18n']);;
/*! RESOURCE: /scripts/sn/common/i18n/directive.snBindI18n.js */
angular.module('sn.common.i18n').directive('snBindI18n', function(i18n, $sanitize) {
  return {
    restrict: 'A',
    link: function(scope, iElem, iAttrs) {
      i18n.getMessage(iAttrs.snBindI18n, function(translatedValue) {
        var sanitizedValue = $sanitize(translatedValue);
        iElem.append(sanitizedValue);
      });
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/i18n/directive.message.js */
angular.module('sn.common.i18n').directive('nowMessage', function(i18n) {
  return {
    restrict: 'E',
    priority: 0,
    template: '',
    replace: true,
    compile: function(element, attrs, transclude) {
      var value = element.attr('value');
      if (!attrs.key || !value)
        return;
      i18n.loadMessage(attrs.key, value);
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/i18n/service.i18n.js */
angular.module('sn.common.i18n').provider('i18n', function() {
  var messageMap = {};

  function loadMessage(msgKey, msgValue) {
    messageMap[msgKey] = msgValue;
  }
  this.preloadMessages = function(messages) {
    angular.forEach(messages, function(key, val) {
      loadMessage(key, val);
    });
  };

  function interpolate(param) {
    return this.replace(/{([^{}]*)}/g,
      function(a, b) {
        var r = param[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      }
    );
  }
  if (!String.prototype.withValues)
    String.prototype.withValues = interpolate;
  this.$get = function(nowServer, $http, $window, $log) {
    var isDebug = $window.NOW ? $window.NOW.i18n_debug : true;

    function debug(msg) {
      if (!isDebug)
        return;
      $log.log('i18n: ' + msg);
    }

    function getMessageFromServer(msgKey, callback) {
      getMessagesFromServer([msgKey], function() {
        if (callback)
          callback(messageMap[msgKey]);
      });
    }

    function getMessagesFromServer(msgArray, callback, msgArrayFull) {
      var url = nowServer.getURL('message');
      $http.post(url, {
        messages: msgArray
      }).success(function(response) {
        var messages = response.messages;
        for (var i in messages) {
          loadMessage(i, messages[i]);
        }
        var returnMessages = {},
          allMessages = msgArrayFull || msgArray;
        for (var j = 0; j < allMessages.length; j++) {
          var key = allMessages[j];
          returnMessages[key] = messageMap[key];
        }
        if (callback)
          callback(returnMessages);
      });
    }
    return {
      getMessage: function(msgKey, callback) {
        debug('getMessage: Checking for ' + msgKey);
        if (messageMap.hasOwnProperty(msgKey)) {
          var message = messageMap[msgKey];
          if (typeof(callback) == 'function')
            callback(message);
          debug('getMessage: Found: ' + msgKey + ', message: ' + message);
          return message;
        }
        debug('getMessage: Not found: ' + msgKey + ', querying server');
        getMessageFromServer(msgKey, callback);
        msgKey.withValues = interpolate;
        if (typeof(callback) != 'function')
          $log.warn('getMessage (key="' + msgKey + '"): synchronous use not supported in Mobile or Service Portal unless message is already cached');
        return msgKey;
      },
      format: function(message) {
        if (arguments.length == 1)
          return message;
        if (arguments.length == 2 && (typeof arguments[1] === 'object'))
          return interpolate.call(message, arguments[1]);
        return interpolate.call(message, [].slice.call(arguments, 1));
      },
      getMessages: function(msgArray, callback) {
        debug('getMessages: Checking for ' + msgArray.join(','));
        var results = {},
          needMessage = [],
          needServerRequest = false;
        for (var i = 0; i < msgArray.length; i++) {
          var key = msgArray[i];
          if (!messageMap.hasOwnProperty(key)) {
            debug('getMessages: Did not find ' + key);
            needMessage.push(key);
            needServerRequest = true;
            results[key] = key;
            continue;
          }
          results[key] = messageMap[key];
          debug('getMessages: Found ' + key + ', message: ' + results[key]);
        }
        if (needServerRequest) {
          debug('getMessages: Querying server for ' + needMessage.join(','));
          getMessagesFromServer(needMessage, callback, msgArray);
        } else if (typeof(callback) == 'function') {
          debug('getMessages: Found all messages');
          callback(results);
        }
        return results;
      },
      clearMessages: function() {
        debug('clearMessages: clearing messages');
        messageMap = {};
      },
      loadMessage: function(msgKey, msgValue) {
        loadMessage(msgKey, msgValue);
        debug('loadMessage: loaded key: ' + msgKey + ', value: ' + msgValue);
      },
      preloadMessages: function() {
        var that = this
        angular.element('now-message').each(function() {
          var elem = angular.element(this);
          that.loadMessage(elem.attr('key'), elem.attr('value'));
        })
      }
    };
  };
});;;
/*! RESOURCE: /scripts/sn/common/link/js_includes_link.js */
/*! RESOURCE: /scripts/sn/common/link/_module.js */
angular.module("sn.common.link", []);;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContent.js */
angular.module('sn.common.link').directive('snLinkContent', function($compile, linkContentTypes) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    template: "<span />",
    scope: {
      link: "="
    },
    link: function(scope, elem) {
      scope.isShowing = function() {
        return (scope.link.isActive || scope.link.isUnauthorized) && !scope.link.isPending;
      };
      var linkDirective = linkContentTypes.forType(scope.link);
      elem.attr(linkDirective, "");
      elem.attr('ng-if', 'isShowing()');
      $compile(elem)(scope);
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentYoutube.js */
angular.module('sn.common.link').directive('snLinkContentYoutube', function(getTemplateUrl, $sce, inFrameSet) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentYoutube.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {
      $scope.playerActive = false;
      $scope.width = (inFrameSet) ? '248px' : '500px';
      $scope.height = (inFrameSet) ? '139px' : '281px';
      $scope.showPlayer = function() {
        $scope.playerActive = true;
      };
      $scope.getVideoEmbedLink = function() {
        if ($scope.link.embedLink) {
          var videoLink = $scope.link.embedLink + "?autoplay=1";
          return $sce.trustAsHtml("<iframe width='" + $scope.width + "' height='" + $scope.height + "' autoplay='1' frameborder='0' allowfullscreen='' src='" + videoLink + "'></iframe>");
        }
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentSoundcloud.js */
angular.module('sn.common.link').directive('snLinkContentSoundcloud', function(getTemplateUrl, $sce, inFrameSet) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentSoundcloud.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {
      $scope.playerActive = false;
      $scope.width = (inFrameSet) ? '248px' : '500px';
      $scope.height = (inFrameSet) ? '139px' : '281px';
      $scope.showPlayer = function() {
        $scope.playerActive = true;
      };
      $scope.getVideoEmbedLink = function() {
        if ($scope.link.embedLink) {
          var videoLink = $scope.link.embedLink + "&amp;auto_play=true";
          var width = (inFrameSet) ? 248 : 500;
          return $sce.trustAsHtml("<iframe width='" + $scope.width + "' height='" + $scope.height + "' autoplay='1' frameborder='0' allowfullscreen='' src='" + videoLink + "'></iframe>");
        }
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentArticle.js */
angular.module('sn.common.link').directive('snLinkContentArticle', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentArticle.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {
      $scope.backgroundImageStyle = $scope.link.imageLink ?
        {
          "background-image": 'url(' + $scope.link.imageLink + ')'
        } :
        {};
      $scope.isVisible = function() {
        var link = $scope.link;
        return !!link.shortDescription || !!link.imageLink;
      };
      $scope.hasDescription = function() {
        var link = $scope.link;
        return link.shortDescription && (link.shortDescription !== link.title);
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentError.js */
angular.module('sn.common.link').directive('snLinkContentError', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentError.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentImage.js */
angular.module('sn.common.link').directive('snLinkContentImage', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentImage.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentAttachment.js */
angular.module('sn.common.link').directive('snLinkContentAttachment', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentAttachment.xml'),
    scope: {
      attachment: '=',
      link: '='
    },
    controller: function($scope, $element, snCustomEvent) {
      $scope.attachment = $scope.attachment || $scope.link.attachment;
      $scope.calcImageSize = function() {
        var imageWidth = $scope.width;
        var imageHeight = $scope.height;
        var MAX_IMAGE_SIZE = $element.width() < 298 ? $element.width() : 298;
        if (imageHeight < 0 || imageWidth < 0)
          return "";
        if (imageHeight > imageWidth) {
          if (imageHeight >= MAX_IMAGE_SIZE) {
            imageWidth *= MAX_IMAGE_SIZE / imageHeight;
            imageHeight = MAX_IMAGE_SIZE;
          }
        } else {
          if (imageWidth >= MAX_IMAGE_SIZE) {
            imageHeight *= MAX_IMAGE_SIZE / imageWidth;
            imageWidth = MAX_IMAGE_SIZE
          }
        }
        return "height: " + imageHeight + "px; width: " + imageWidth + "px;";
      };
      $scope.aspectRatioClass = function() {
        return ($scope.height > $scope.width) ? 'limit-height' : 'limit-width';
      };
      $scope.showImage = function(event) {
        if (event.keyCode === 9)
          return;
        snCustomEvent.fire('sn.attachment.preview', event, $scope.attachment.rawData);
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentRecord.js */
angular.module('sn.common.link').directive('snLinkContentRecord', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentRecord.xml'),
    scope: {
      link: '='
    },
    controller: function($scope) {
      $scope.isTitleVisible = function() {
        return !$scope.isDescriptionVisible() && $scope.link.title;
      };
      $scope.isDescriptionVisible = function() {
        return $scope.link.shortDescription;
      };
      $scope.hasNoHeader = function() {
        return !$scope.isTitleVisible() && !$scope.isDescriptionVisible();
      };
      $scope.isUnassigned = function() {
        return $scope.link.isTask && !$scope.link.avatarID;
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/provider.linkContentTypes.js */
angular.module('sn.common.link').provider('linkContentTypes', function linkContentTypesProvider() {
  "use strict";
  var linkDirectiveMap = {
    'record': "sn-link-content-record",
    'attachment': "sn-link-content-attachment",
    'video': "sn-link-content-youtube",
    'music.song': "sn-link-content-soundcloud",
    'link': 'sn-link-content-article',
    'article': 'sn-link-content-article',
    'website': 'sn-link-content-article',
    'image': 'sn-link-content-image'
  };
  this.$get = function linkContentTypesFactory() {
    return {
      forType: function(link) {
        if (link.isUnauthorized)
          return "sn-link-content-error";
        return linkDirectiveMap[link.type] || "no-card";
      }
    }
  };
});;;
/*! RESOURCE: /scripts/sn/common/mention/js_includes_mention.js */
/*! RESOURCE: /scripts/sn/common/mention/_module.js */
angular.module("sn.common.mention", []);;
/*! RESOURCE: /scripts/sn/common/mention/directive.snMentionPopover.js */
angular.module('sn.common.mention').directive("snMentionPopover", function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snMentionPopover.xml'),
    link: function(scope, elem, $attrs) {
      elem.detach().appendTo(document.body);
      scope.dontPositionManually = scope.$eval($attrs.dontpositionmanually) || false;
      scope.onClick = function(event) {
        if (!angular.element(event.target).closest("#mention-popover").length ||
          angular.element(event.target).closest("#direct-message-popover-trigger").length) {
          scope.$evalAsync(function() {
            scope.$parent.showPopover = false;
            scope.$emit("snMentionPopover.showPopoverIsFalse");
            if (scope.dontPositionManually && !(scope.$eval($attrs.snavatarpopover))) {
              elem.remove();
            } else {
              scope.$broadcast("sn-avatar-popover-destroy");
            }
            angular.element('.popover').each(function() {
              var object = angular.element(this);
              if (object.popover) {
                object.popover('hide');
              }
            })
          });
        }
      };
      scope.clickListener = $timeout(function() {
        angular.element('html').on('click.mentionPopover', scope.onClick);
      }, 0, false);
      scope.$on('sn-bootstrap-popover.close-other-popovers', scope.onClick);

      function setPopoverPosition(clickX, clickY) {
        var topPosition;
        var leftPosition;
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        if (((clickY - (elem.height() / 2))) < 10)
          topPosition = 10;
        else
          topPosition = ((clickY + (elem.height() / 2)) > windowHeight) ? windowHeight - elem.height() - 15 : clickY - (elem.height() / 2);
        leftPosition = ((clickX + 20 + (elem.width())) > windowWidth) ? windowWidth - elem.width() - 15 : clickX + 20;
        elem.css("top", topPosition + "px").css("left", leftPosition + "px");
      }
      if (!scope.dontPositionManually) {
        $timeout(function() {
          var clickX = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageX) ? scope.$parent.clickEvent.pageX : clickX || 300;
          var clickY = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageY) ? scope.$parent.clickEvent.pageY : clickY || 300;
          setPopoverPosition(clickX, clickY);
          elem.velocity({
            opacity: 1
          }, {
            duration: 100,
            easing: "cubic"
          });
        });
      }
    },
    controller: function($scope, $element, $attrs) {
      $scope.profile = $scope.$eval($attrs.profile);
      $scope.$on("$destroy", function() {
        angular.element('html').off('click.mentionPopover', $scope.onClick);
        $element.remove();
      });
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/mention/service.snMention.js */
angular.module("sn.common.mention").factory("snMention", function(liveProfileID, $q, $http) {
  "use strict";
  var MENTION_PATH = "/api/now/form/mention/record";
  var USER_PATH = '/api/now/ui/user/';
  var avatarCache = {};

  function retrieveMembers(table, document, term) {
    if (!term || !document || !table) {
      var deferred = $q.defer();
      deferred.resolve([]);
      return deferred.promise;
    }
    return $http({
      url: MENTION_PATH + "/" + table + "/" + document,
      method: "GET",
      params: {
        term: term
      }
    }).then(function(response) {
      var members = response.data.result;
      var promises = [];
      angular.forEach(members, function(user) {
        if (avatarCache[user.sys_id]) {
          user.initials = avatarCache[user.sys_id].initials;
          user.avatar = avatarCache[user.sys_id].avatar;
        } else {
          var promise = $http.get(USER_PATH + user.sys_id).success(function(response) {
            user.initials = response.result.user_initials;
            user.avatar = response.result.user_avatar;
            avatarCache[user.sys_id] = {
              initials: user.initials,
              avatar: user.avatar
            };
          });
          promises.push(promise);
        }
      });
      return $q.all(promises).then(function() {
        return members;
      });
    })
  }
  return {
    retrieveMembers: retrieveMembers
  }
});;;
/*! RESOURCE: /scripts/sn/common/messaging/js_includes_messaging.js */
/*! RESOURCE: /scripts/doctype/CustomEventManager.js */
var NOW = NOW || {};
var CustomEventManager = (function(existingCustomEvent) {
  "use strict";
  var events = (existingCustomEvent && existingCustomEvent.events) || {};
  var isFiringFlag = false;
  var trace = false;
  var suppressEvents = false;
  var NOW_MSG = 'NOW.PostMessage';

  function observe(eventName, fn) {
    if (trace)
      jslog("$CustomEventManager observing: " + eventName);
    on(eventName, fn);
  }

  function on(name, func) {
    if (!func || typeof func !== 'function')
      return;
    if (typeof name === 'undefined')
      return;
    if (!events[name])
      events[name] = [];
    events[name].push(func);
  }

  function un(name, func) {
    if (!events[name])
      return;
    var idx = -1;
    for (var i = 0; i < events[name].length; i++) {
      if (events[name][i] === func) {
        idx = i;
        break;
      }
    }
    if (idx >= 0)
      events[name].splice(idx, 1)
  }

  function unAll(name) {
    if (events[name])
      delete events[name];
  }

  function fire(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    return fireEvent.apply(null, arguments);
  }

  function fireUp(eventName, args) {
    var win = window;
    while (win) {
      try {
        if (win.CustomEvent.fireEvent.apply(null, arguments) === false)
          return;
        win = win.parent === win ? null : win.parent;
      } catch (e) {
        return;
      }
    }
  }

  function fireEvent() {
    if (suppressEvents)
      return true;
    var args = Array.prototype.slice.apply(arguments);
    var name = args.shift();
    var eventList = events[name];
    if (!eventList)
      return true;
    var event = eventList.slice();
    isFiringFlag = true;
    for (var i = 0, l = event.length; i < l; i++) {
      var ev = event[i];
      if (!ev)
        continue;
      if (ev.apply(null, args) === false) {
        isFiringFlag = false;
        return false;
      }
    }
    isFiringFlag = false;
    return true;
  }

  function isFiring() {
    return isFiringFlag;
  }

  function forward(name, element, func) {
    on(name, func);
    element.addEventListener(name, function(e) {
      fireEvent(e.type, this, e);
    }.bind(api));
  }

  function registerPostMessageEvent() {
    if (NOW.registeredPostMessageEvent) {
      return;
    }
    if (!window.postMessage) {
      return;
    }
    window.addEventListener('message', function(event) {
      var nowMessageJSON = event.data;
      var nowMessage;
      try {
        nowMessage = JSON.parse(nowMessageJSON.toString());
      } catch (e) {
        return;
      }
      if (!nowMessage.type == NOW_MSG) {
        return;
      }
      fire(nowMessage.eventName, nowMessage.args);
    }, false);
    NOW.registeredPostMessageEvent = true;
  }

  function doPostMessage(win, event, msg, targetOrigin) {
    var nowMessage = {
      type: NOW_MSG,
      eventName: event,
      args: msg
    };
    var nowMessageJSON;
    if (!win || !win.postMessage) {
      return
    }
    nowMessageJSON = JSON.stringify(nowMessage);
    win.postMessage(nowMessageJSON, targetOrigin);
  }

  function fireTop(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    fireEvent.apply(null, arguments);
    var t = getTopWindow();
    if (t !== null && window !== t)
      t.CustomEvent.fire(eventName, args);
  }

  function fireAll(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    var topWindow = getTopWindow();
    notifyAllFrom(topWindow);

    function notifyAllFrom(rootFrame) {
      var childFrame;
      rootFrame.CustomEvent.fireEvent(eventName, args);
      for (var i = 0; i < rootFrame.length; i++) {
        try {
          childFrame = rootFrame[i];
          if (!childFrame)
            continue;
          if (childFrame.CustomEvent && typeof childFrame.CustomEvent.fireEvent === "function") {
            notifyAllFrom(childFrame);
          }
        } catch (e) {}
      }
    }
  }

  function fireToWindow(targetWindow, eventName, args, usePostMessage, targetOrigin) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + args.length);
    if (usePostMessage) {
      doPostMessage(targetWindow, eventName, args, targetOrigin);
    } else {
      targetWindow.CustomEvent.fireEvent(eventName, args);
    }
  }

  function getTopWindow() {
    var topWindow = window.self;
    try {
      while (topWindow.CustomEvent.fireEvent && topWindow !== topWindow.parent && topWindow.parent.CustomEvent.fireEvent) {
        topWindow = topWindow.parent;
      }
    } catch (e) {}
    return topWindow;
  }

  function isTopWindow() {
    return getTopWindow() == window.self;
  }

  function jslog(msg, src, dateTime) {
    try {
      if (!src) {
        var path = window.self.location.pathname;
        src = path.substring(path.lastIndexOf('/') + 1);
      }
      if (window.self.opener && window != window.self.opener) {
        if (window.self.opener.jslog) {
          window.self.opener.jslog(msg, src, dateTime);
        }
      } else if (parent && parent.jslog && jslog != parent.jslog) {
        parent.jslog(msg, src, dateTime);
      } else {
        if (window.console && window.console.log)
          console.log(msg);
      }
    } catch (e) {}
  }
  var api = {
    set trace(value) {
      trace = !!value;
    },
    get trace() {
      return trace;
    },
    set suppressEvents(value) {
      suppressEvents = !!value;
    },
    get suppressEvents() {
      return suppressEvents;
    },
    get events() {
      return events;
    },
    on: on,
    un: un,
    unAll: unAll,
    forward: forward,
    isFiring: isFiring,
    fireEvent: fireEvent,
    observe: observe,
    fire: fire,
    fireTop: fireTop,
    fireAll: fireAll,
    fireToWindow: fireToWindow,
    isTopWindow: isTopWindow,
    fireUp: fireUp,
    toString: function() {
      return 'CustomEventManager';
    }
  };
  registerPostMessageEvent();
  return api;
})(NOW.CustomEvent);
NOW.CustomEvent = CustomEventManager;
if (typeof CustomEvent !== "undefined") {
  CustomEvent.observe = NOW.CustomEvent.observe.bind(NOW.CustomEvent);
  CustomEvent.fire = NOW.CustomEvent.fire.bind(NOW.CustomEvent);
  CustomEvent.fireUp = NOW.CustomEvent.fireUp.bind(NOW.CustomEvent);
  CustomEvent.fireTop = NOW.CustomEvent.fireTop.bind(NOW.CustomEvent);
  CustomEvent.fireAll = NOW.CustomEvent.fireAll.bind(NOW.CustomEvent);
  CustomEvent.fireToWindow = NOW.CustomEvent.fireToWindow.bind(NOW.CustomEvent);
  CustomEvent.on = NOW.CustomEvent.on.bind(NOW.CustomEvent);
  CustomEvent.un = NOW.CustomEvent.un.bind(NOW.CustomEvent);
  CustomEvent.unAll = NOW.CustomEvent.unAll.bind(NOW.CustomEvent);
  CustomEvent.forward = NOW.CustomEvent.forward.bind(NOW.CustomEvent);
  CustomEvent.isFiring = NOW.CustomEvent.isFiring.bind(NOW.CustomEvent);
  CustomEvent.fireEvent = NOW.CustomEvent.fireEvent.bind(NOW.CustomEvent);
  CustomEvent.events = NOW.CustomEvent.events;
  CustomEvent.isTopWindow = NOW.CustomEvent.isTopWindow.bind(NOW.CustomEvent);
} else {
  window.CustomEvent = NOW.CustomEvent;
};
/*! RESOURCE: /scripts/sn/common/messaging/_module.js */
angular.module('sn.common.messaging', []);
angular.module('sn.messaging', ['sn.common.messaging']);;
/*! RESOURCE: /scripts/sn/common/messaging/service.snCustomEvent.js */
angular.module('sn.common.messaging').factory('snCustomEvent', function() {
  "use strict";
  if (typeof NOW.CustomEvent === 'undefined')
    throw "CustomEvent not found in NOW global";
  return NOW.CustomEvent;
});;;
/*! RESOURCE: /scripts/sn/common/notification/js_includes_notification.js */
/*! RESOURCE: /scripts/sn/common/notification/_module.js */
angular.module('sn.common.notification', ['sn.common.util', 'ngSanitize', 'sn.common.i18n']);;
/*! RESOURCE: /scripts/sn/common/notification/factory.notificationWrapper.js */
angular.module("sn.common.notification").factory("snNotificationWrapper", function($window, $timeout) {
  "use strict";

  function assignHandler(notification, handlerName, options) {
    if (typeof options[handlerName] === "function")
      notification[handlerName.toLowerCase()] = options[handlerName];
  }
  return function NotificationWrapper(title, options) {
    var defaults = {
      dir: 'auto',
      lang: 'en_US',
      decay: true,
      lifespan: 4000,
      body: "",
      tag: "",
      icon: '/native_notification_icon.png'
    };
    var optionsOnClick = options.onClick;
    options.onClick = function() {
      if (angular.isFunction($window.focus))
        $window.focus();
      if (typeof optionsOnClick === "function")
        optionsOnClick();
    }
    var result = {};
    options = angular.extend(defaults, options);
    var previousOnClose = options.onClose;
    options.onClose = function() {
      if (angular.isFunction(result.onclose))
        result.onclose();
      if (angular.isFunction(previousOnClose))
        previousOnClose();
    }
    var notification = new $window.Notification(title, options);
    assignHandler(notification, "onShow", options);
    assignHandler(notification, "onClick", options);
    assignHandler(notification, "onError", options);
    assignHandler(notification, "onClose", options);
    if (options.decay && options.lifespan > 0)
      $timeout(function() {
        notification.close();
      }, options.lifespan)
    result.close = function() {
      notification.close();
    }
    return result;
  }
});
/*! RESOURCE: /scripts/sn/common/notification/service.snNotifier.js */
angular.module("sn.common.notification").factory("snNotifier", function($window, snNotificationWrapper) {
  "use strict";
  return function(settings) {
    function requestNotificationPermission() {
      if ($window.Notification && $window.Notification.permission === "default")
        $window.Notification.requestPermission();
    }

    function canUseNativeNotifications() {
      return ($window.Notification && $window.Notification.permission === "granted");
    }
    var currentNotifications = [];
    settings = angular.extend({
      notifyMethods: ["native", "glide"]
    }, settings);
    var methods = {
      'native': nativeNotify,
      'glide': glideNotify
    };

    function nativeNotify(title, options) {
      if (canUseNativeNotifications()) {
        var newNotification = snNotificationWrapper(title, options);
        newNotification.onclose = function() {
          stopTrackingNotification(newNotification)
        };
        currentNotifications.push(newNotification);
        return true;
      }
      return false;
    }

    function glideNotify(title, options) {
      return false;
    }

    function stopTrackingNotification(newNotification) {
      var index = currentNotifications.indexOf(newNotification);
      if (index > -1)
        currentNotifications.splice(index, 1);
    }

    function notify(title, options) {
      if (typeof options === "string")
        options = {
          body: options
        };
      options = options || {};
      for (var i = 0, len = settings.notifyMethods.length; i < len; i++)
        if (typeof settings.notifyMethods[i] == "string") {
          if (methods[settings.notifyMethods[i]](title, options))
            break;
        } else {
          if (settings.notifyMethods[i](title, options))
            break;
        }
    }

    function clearAllNotifications() {
      while (currentNotifications.length > 0)
        currentNotifications.pop().close();
    }
    return {
      notify: notify,
      canUseNativeNotifications: canUseNativeNotifications,
      clearAllNotifications: clearAllNotifications,
      requestNotificationPermission: requestNotificationPermission
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/notification/directive.snNotification.js */
angular.module('sn.common.notification').directive('snNotification', function($timeout, $rootScope) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="notification-container"></div>',
    link: function(scope, element) {
      scope.addNotification = function(payload) {
          if (!payload)
            payload = {};
          if (!payload.text)
            payload.text = '';
          if (!payload.classes)
            payload.classes = '';
          if (!payload.duration)
            payload.duration = 5000;
          angular.element('<div/>').qtip({
            content: {
              text: payload.text,
              title: {
                button: false
              }
            },
            position: {
              target: [0, 0],
              container: angular.element('.notification-container')
            },
            show: {
              event: false,
              ready: true,
              effect: function() {
                angular.element(this).stop(0, 1).animate({
                  height: 'toggle'
                }, 400, 'swing');
              },
              delay: 0,
              persistent: false
            },
            hide: {
              event: false,
              effect: function(api) {
                angular.element(this).stop(0, 1).animate({
                  height: 'toggle'
                }, 400, 'swing');
              }
            },
            style: {
              classes: 'jgrowl' + ' ' + payload.classes,
              tip: false
            },
            events: {
              render: function(event, api) {
                if (!api.options.show.persistent) {
                  angular.element(this).bind('mouseover mouseout', function(e) {
                      clearTimeout(api.timer);
                      if (e.type !== 'mouseover') {
                        api.timer = setTimeout(function() {
                          api.hide(e);
                        }, payload.duration);
                      }
                    })
                    .triggerHandler('mouseout');
                }
              }
            }
          });
        },
        scope.$on('notification.notify', function(event, payload) {
          scope.addNotification(payload);
        });
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/notification/service.snNotification.js */
angular.module('sn.common.notification').factory('snNotification', function($document, $templateCache, $compile, $rootScope, $timeout, $q, getTemplateUrl, $http, i18n) {
  'use strict';
  var openNotifications = [],
    timeouts = {},
    options = {
      top: 20,
      gap: 10,
      duration: 5000
    };
  return {
    show: function(type, message, duration, onClick, container) {
      return createNotificationElement(type, message).then(function(element) {
        displayNotification(element, container);
        checkAndSetDestroyDuration(element, duration);
        return element;
      });
    },
    hide: hide,
    setOptions: function(opts) {
      if (angular.isObject(opts))
        angular.extend(options, opts);
    }
  };

  function getTemplate() {
    var templateName = 'sn_notification.xml',
      template = $templateCache.get(templateName),
      deferred = $q.defer();
    if (!template) {
      var url = getTemplateUrl(templateName);
      $http.get(url).then(function(result) {
          $templateCache.put(templateName, result.data);
          deferred.resolve(result.data);
        },
        function(reason) {
          return $q.reject(reason);
        });
    } else
      deferred.resolve(template);
    return deferred.promise;
  }

  function createNotificationElement(type, message) {
    var thisScope, thisElement;
    var icon = 'icon-info';
    if (type == 'error') {
      icon = 'icon-cross-circle';
    } else if (type == 'warning') {
      icon = 'icon-alert';
    } else if (type = 'success') {
      icon = 'icon-check-circle';
    }
    return getTemplate().then(function(template) {
      thisScope = $rootScope.$new();
      thisScope.type = type;
      thisScope.message = message;
      thisScope.icon = icon;
      thisElement = $compile(template)(thisScope);
      return angular.element(thisElement[0]);
    });
  }

  function displayNotification(element, container) {
    var container = $document.find(container || 'body'),
      id = 'elm' + Date.now(),
      pos;
    container.append(element);
    pos = options.top + openNotifications.length * getElementHeight(element);
    positionElement(element, pos);
    element.addClass('visible');
    element.attr('id', id);
    element.find('button').bind('click', function(e) {
      hideElement(element);
    });
    openNotifications.push(element);
    if (options.duration > 0)
      timeouts[id] = $timeout(function() {
        hideNext();
      }, options.duration);
  }

  function hide(element) {
    $timeout.cancel(timeouts[element.attr('id')]);
    element.removeClass('visible');
    element.addClass('hidden');
    element.find('button').eq(0).unbind();
    element.scope().$destroy();
    element.remove();
    repositionAll();
  }

  function hideElement(element) {
    var index = openNotifications.indexOf(element);
    openNotifications.splice(index, 1);
    hide(element);
  }

  function hideNext() {
    var element = openNotifications.shift();
    if (element)
      hide(element);
  }

  function getElementHeight(element) {
    return element[0].offsetHeight + options.gap;
  }

  function positionElement(element, pos) {
    element[0].style.top = pos + 'px';
  }

  function repositionAll() {
    var pos = options.top;
    openNotifications.forEach(function(element) {
      positionElement(element, pos);
      pos += getElementHeight(element);
    });
  }

  function checkAndSetDestroyDuration(element, duration) {
    if (duration) {
      timeouts[element.attr('id')] = $timeout(function() {
        hideElement(element);
      }, duration);
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/presence/js_includes_presence.js */
/*! RESOURCE: /scripts/js_includes_ng_amb.js */
/*! RESOURCE: /scripts/js_includes_amb.js */
;
/*! RESOURCE: /scripts/app.ng.amb/app.ng.amb.js */
angular.module("ng.amb", ['sn.common.presence', 'sn.common.util'])
  .value("ambLogLevel", 'info')
  .value("ambServletURI", '/amb')
  .value("cometd", angular.element.cometd)
  .value("ambLoginWindow", 'true');;
/*! RESOURCE: /scripts/app.ng.amb/service.AMB.js */
angular.module("ng.amb").service("amb", function(AMBOverlay, $window, $q, $log, $rootScope, $timeout) {
  "use strict";
  var ambClient = null;
  var _window = $window.self;
  var loginWindow = null;
  var sameScope = false;
  ambClient = amb.getClient();
  if (_window.g_ambClient) {
    sameScope = true;
  }
  if (sameScope) {
    var serverConnection = ambClient.getServerConnection();
    serverConnection.loginShow = function() {
      if (!serverConnection.isLoginWindowEnabled())
        return;
      if (loginWindow && loginWindow.isVisible())
        return;
      if (serverConnection.isLoginWindowOverride())
        return;
      loginWindow = new AMBOverlay();
      loginWindow.render();
      loginWindow.show();
    };
    serverConnection.loginHide = function() {
      if (!loginWindow)
        return;
      loginWindow.hide();
      loginWindow.destroy();
      loginWindow = null;
    }
  }
  var AUTO_CONNECT_TIMEOUT = 20 * 1000;
  var connected = $q.defer();
  var connectionInterrupted = false;
  var monitorAMB = false;
  $timeout(startMonitoringAMB, AUTO_CONNECT_TIMEOUT);
  connected.promise.then(startMonitoringAMB);

  function startMonitoringAMB() {
    monitorAMB = true;
  }

  function ambInterrupted() {
    var state = ambClient.getState();
    return monitorAMB && state !== "opened" && state !== "initialized"
  }
  var interruptionTimeout;
  var extendedInterruption = false;

  function setInterrupted(eventName) {
    connectionInterrupted = true;
    $rootScope.$broadcast(eventName);
    if (!interruptionTimeout) {
      interruptionTimeout = $timeout(function() {
        extendedInterruption = true;
      }, 30 * 1000)
    }
    connected = $q.defer();
  }
  var connectOpenedEventId = ambClient.subscribeToEvent("connection.opened", function() {
    $rootScope.$broadcast("amb.connection.opened");
    if (interruptionTimeout) {
      $timeout.cancel(interruptionTimeout);
      interruptionTimeout = null;
    }
    extendedInterruption = false;
    if (connectionInterrupted) {
      connectionInterrupted = false;
      $rootScope.$broadcast("amb.connection.recovered");
    }
    connected.resolve();
  });
  var connectClosedEventId = ambClient.subscribeToEvent("connection.closed", function() {
    setInterrupted("amb.connection.closed");
  });
  var connectBrokenEventId = ambClient.subscribeToEvent("connection.broken", function() {
    setInterrupted("amb.connection.broken");
  });
  var onUnloadWindow = function() {
    ambClient.unsubscribeFromEvent(connectOpenedEventId);
    ambClient.unsubscribeFromEvent(connectClosedEventId);
    ambClient.unsubscribeFromEvent(connectBrokenEventId);
    angular.element($window).off('unload', onUnloadWindow);
  };
  angular.element($window).on('unload', onUnloadWindow);
  var documentReadyState = $window.document ? $window.document.readyState : null;
  if (documentReadyState === 'complete') {
    autoConnect();
  } else {
    angular.element($window).on('load', autoConnect);
  }
  $timeout(autoConnect, 10000);
  var initiatedConnection = false;

  function autoConnect() {
    if (!initiatedConnection) {
      initiatedConnection = true;
      ambClient.connect();
    }
  }
  return {
    getServerConnection: function() {
      return ambClient.getServerConnection();
    },
    connect: function() {
      if (initiatedConnection) {
        ambClient.connect();
      }
      return connected.promise;
    },
    get interrupted() {
      return ambInterrupted();
    },
    get extendedInterruption() {
      return extendedInterruption;
    },
    get connected() {
      return connected.promise;
    },
    abort: function() {
      ambClient.abort();
    },
    disconnect: function() {
      ambClient.disconnect();
    },
    getConnectionState: function() {
      return ambClient.getConnectionState();
    },
    getClientId: function() {
      return ambClient.getClientId();
    },
    getChannel: function(channelName) {
      return ambClient.getChannel(channelName);
    },
    registerExtension: function(extensionName, extension) {
      ambClient.registerExtension(extensionName, extension);
    },
    unregisterExtension: function(extensionName) {
      ambClient.unregisterExtension(extensionName);
    },
    batch: function(batch) {
      ambClient.batch(batch);
    },
    getState: function() {
      return ambClient.getState();
    },
    getFilterString: function(filter) {
      filter = filter.
      replace(/\^EQ/g, '').
      replace(/\^ORDERBY(?:DESC)?[^^]*/g, '').
      replace(/^GOTO/, '');
      return btoa(filter).replace(/=/g, '-');
    },
    getChannelRW: function(table, filter) {
      var t = '/rw/default/' + table + '/' + this.getFilterString(filter);
      return this.getChannel(t);
    },
    isLoggedIn: function() {
      return ambClient.isLoggedIn();
    },
    subscribeToEvent: function(event, callback) {
      return ambClient.subscribeToEvent(event, callback);
    },
    getConnectionEvents: function() {
      return ambClient.getConnectionEvents();
    },
    getEvents: function() {
      return ambClient.getConnectionEvents();
    },
    loginComplete: function() {
      ambClient.loginComplete();
    }
  };
});;
/*! RESOURCE: /scripts/app.ng.amb/controller.AMBRecordWatcher.js */
angular.module("ng.amb").controller("AMBRecordWatcher", function($scope, $timeout, $window) {
  "use strict";
  var amb = $window.top.g_ambClient;
  $scope.messages = [];
  var lastFilter;
  var watcherChannel;
  var watcher;

  function onMessage(message) {
    $scope.messages.push(message.data);
  }
  $scope.getState = function() {
    return amb.getState();
  };
  $scope.initWatcher = function() {
    angular.element(":focus").blur();
    if (!$scope.filter || $scope.filter === lastFilter)
      return;
    lastFilter = $scope.filter;
    console.log("initiating watcher on " + $scope.filter);
    $scope.messages = [];
    if (watcher) {
      watcher.unsubscribe();
    }
    var base64EncodeQuery = btoa($scope.filter).replace(/=/g, '-');
    var channelId = '/rw/' + base64EncodeQuery;
    watcherChannel = amb.getChannel(channelId)
    watcher = watcherChannel.subscribe(onMessage);
  };
  amb.connect();
});
/*! RESOURCE: /scripts/app.ng.amb/factory.snRecordWatcher.js */
angular.module("ng.amb").factory('snRecordWatcher', function($rootScope, amb, $timeout, snPresence, $log, urlTools) {
  "use strict";
  var watcherChannel;
  var connected = false;
  var diagnosticLog = true;

  function initWatcher(table, sys_id, query) {
    if (!table)
      return;
    if (sys_id)
      var filter = "sys_id=" + sys_id;
    else
      filter = query;
    if (!filter)
      return;
    return initChannel(table, filter);
  }

  function initList(table, query) {
    if (!table)
      return;
    query = query || "sys_idISNOTEMPTY";
    return initChannel(table, query);
  }

  function initTaskList(list, prevChannel) {
    if (prevChannel)
      prevChannel.unsubscribe();
    var sys_ids = list.toString();
    var filter = "sys_idIN" + sys_ids;
    return initChannel("task", filter);
  }

  function initChannel(table, filter) {
    if (isBlockedTable(table)) {
      $log.log("Blocked from watching", table);
      return null;
    }
    if (diagnosticLog)
      log(">>> init " + table + "?" + filter);
    watcherChannel = amb.getChannelRW(table, filter);
    watcherChannel.subscribe(onMessage);
    amb.connect();
    return watcherChannel;
  }

  function onMessage(message) {
    var r = message.data;
    var c = message.channel;
    if (diagnosticLog)
      log(">>> record " + r.operation + ": " + r.table_name + "." + r.sys_id + " " + r.display_value);
    $rootScope.$broadcast('record.updated', r);
    $rootScope.$broadcast("sn.stream.tap");
    $rootScope.$broadcast('list.updated', r, c);
  }

  function log(message) {
    $log.log(message);
  }

  function isBlockedTable(table) {
    return table == 'sys_amb_message' || table.startsWith('sys_rw');
  }
  return {
    initTaskList: initTaskList,
    initChannel: initChannel,
    init: function() {
      var location = urlTools.parseQueryString(window.location.search);
      var table = location['table'] || location['sysparm_table'];
      var sys_id = location['sys_id'] || location['sysparm_sys_id'];
      var query = location['sysparm_query'];
      initWatcher(table, sys_id, query);
      snPresence.init(table, sys_id, query);
    },
    initList: initList,
    initRecord: function(table, sysId) {
      initWatcher(table, sysId, null);
      snPresence.initPresence(table, sysId);
    },
    _initWatcher: initWatcher
  }
});;
/*! RESOURCE: /scripts/app.ng.amb/factory.AMBOverlay.js */
angular.module("ng.amb").factory("AMBOverlay", function($templateCache, $compile, $rootScope) {
  "use strict";
  var showCallbacks = [],
    hideCallbacks = [],
    isRendered = false,
    modal,
    modalScope,
    modalOptions;
  var defaults = {
    backdrop: 'static',
    keyboard: false,
    show: true
  };

  function AMBOverlay(config) {
    config = config || {};
    if (angular.isFunction(config.onShow))
      showCallbacks.push(config.onShow);
    if (angular.isFunction(config.onHide))
      hideCallbacks.push(config.onHide);

    function lazyRender() {
      if (!angular.element('html')['modal']) {
        var bootstrapInclude = "/scripts/bootstrap3/bootstrap.js";
        ScriptLoader.getScripts([bootstrapInclude], renderModal);
      } else
        renderModal();
    }

    function renderModal() {
      if (isRendered)
        return;
      modalScope = angular.extend($rootScope.$new(), config);
      modal = $compile($templateCache.get("amb_disconnect_modal.xml"))(modalScope);
      angular.element("body").append(modal);
      modal.on("shown.bs.modal", function(e) {
        for (var i = 0, len = showCallbacks.length; i < len; i++)
          showCallbacks[i](e);
      });
      modal.on("hidden.bs.modal", function(e) {
        for (var i = 0, len = hideCallbacks.length; i < len; i++)
          hideCallbacks[i](e);
      });
      modalOptions = angular.extend({}, defaults, config);
      modal.modal(modalOptions);
      isRendered = true;
    }

    function showModal() {
      if (isRendered)
        modal.modal('show');
    }

    function hideModal() {
      if (isRendered)
        modal.modal('hide');
    }

    function destroyModal() {
      if (!isRendered)
        return;
      modal.modal('hide');
      modal.remove();
      modalScope.$destroy();
      modalScope = void(0);
      isRendered = false;
      var pos = showCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        showCallbacks.splice(pos, 1);
      pos = hideCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        hideCallbacks.splice(pos, 1);
    }
    return {
      render: lazyRender,
      destroy: destroyModal,
      show: showModal,
      hide: hideModal,
      isVisible: function() {
        if (!isRendered)
          false;
        return modal.visible();
      }
    }
  }
  $templateCache.put('amb_disconnect_modal.xml',
    '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
    '	<div class="modal-dialog small-modal" style="width:450px">' +
    '		<div class="modal-content">' +
    '			<header class="modal-header">' +
    '				<h4 id="small_modal1_title" class="modal-title">{{title || "Login"}}</h4>' +
    '			</header>' +
    '			<div class="modal-body">' +
    '			<iframe class="concourse_modal" ng-src=\'{{iframe || "/amb_login.do"}}\' frameborder="0" scrolling="no" height="400px" width="405px"></iframe>' +
    '			</div>' +
    '		</div>' +
    '	</div>' +
    '</div>'
  );
  return AMBOverlay;
});;;
/*! RESOURCE: /scripts/sn/common/presence/snPresenceLite.js */
(function(exports, $) {
  'use strict';
  var PRESENCE_DISABLED = "false" === "true";
  if (PRESENCE_DISABLED) {
    return;
  }
  if (typeof $.Deferred === "undefined") {
    return;
  }
  var USER_KEY = '{{SYSID}}';
  var REPLACE_REGEX = new RegExp(USER_KEY, 'g');
  var COLOR_ONLINE = '#71e279';
  var COLOR_AWAY = '#fc8a3d';
  var COLOR_OFFLINE = 'transparent';
  var BASE_STYLES = [
    '.sn-presence-lite { display: inline-block; width: 1rem; height: 1rem; border-radius: 50%; }'
  ];
  var USER_STYLES = [
    '.sn-presence-' + USER_KEY + '-online [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_ONLINE + '; }',
    '.sn-presence-' + USER_KEY + '-away [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_AWAY + '; }',
    '.sn-presence-' + USER_KEY + '-offline [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_OFFLINE + '; }'
  ];
  var $head = $('head');
  var stylesheet = $.Deferred();
  var registeredUsers = {};
  var registeredUsersLength = 0;
  $(function() {
    updateRegisteredUsers();
  });
  $head.ready(function() {
    var styleElement = document.createElement('style');
    $head.append(styleElement);
    var $styleElement = $(styleElement);
    stylesheet.resolve($styleElement);
  });

  function updateStyles(styles) {
    stylesheet.done(function($styleElement) {
      $styleElement.empty();
      BASE_STYLES.forEach(function(baseStyle) {
        $styleElement.append(baseStyle);
      });
      $styleElement.append(styles);
    });
  }

  function getUserStyles(sysId) {
    var newStyles = '';
    for (var i = 0, iM = USER_STYLES.length; i < iM; i++) {
      newStyles += USER_STYLES[i].replace(REPLACE_REGEX, sysId);
    }
    return newStyles;
  }

  function updateUserStyles() {
    var userKeys = Object.keys(registeredUsers);
    var userStyles = "";
    userKeys.forEach(function(userKey) {
      userStyles += getUserStyles(userKey);
    });
    updateStyles(userStyles);
  }
  exports.applyPresenceArray = applyPresenceArray;

  function applyPresenceArray(presenceArray) {
    if (!presenceArray || !presenceArray.length) {
      return;
    }
    var users = presenceArray.filter(function(presence) {
      return typeof registeredUsers[presence.user] !== "undefined";
    });
    updateUserPresenceStatus(users);
  }

  function updateUserPresenceStatus(users) {
    var presenceStatus = getBaseCSSClasses();
    for (var i = 0, iM = users.length; i < iM; i++) {
      var presence = users[i];
      var status = getNormalizedStatus(presence.status);
      if (status === 'offline') {
        continue;
      }
      presenceStatus.push('sn-presence-' + presence.user + '-' + status);
    }
    setCSSClasses(presenceStatus.join(' '));
  }

  function getNormalizedStatus(status) {
    switch (status) {
      case 'probably offline':
      case 'maybe offline':
        return 'away';
      default:
        return 'offline';
      case 'online':
      case 'offline':
        return status;
    }
  }

  function updateRegisteredUsers() {
    var presenceIndicators = document.querySelectorAll('[data-presence-id]');
    var obj = {};
    for (var i = 0, iM = presenceIndicators.length; i < iM; i++) {
      var uid = presenceIndicators[i].getAttribute('data-presence-id');
      obj[uid] = true;
    }
    if (Object.keys(obj).length === registeredUsersLength) {
      return;
    }
    registeredUsers = obj;
    registeredUsersLength = Object.keys(registeredUsers).length;
    updateUserStyles();
  }

  function setCSSClasses(classes) {
    $('html')[0].className = classes;
  }

  function getBaseCSSClasses() {
    return $('html')[0].className.split(' ').filter(function(item) {
      return item.indexOf('sn-presence-') !== 0;
    });
  }
})(window, window.jQuery || window.Zepto);;
/*! RESOURCE: /scripts/sn/common/presence/_module.js */
angular.module('sn.common.presence', ['ng.amb', 'sn.common.glide']).config(function($provide) {
  "use strict";
  $provide.constant("PRESENCE_DISABLED", "false" === "true");
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snPresence.js */
angular.module("sn.common.presence").factory('snPresence', function($rootScope, $window, $log, amb, $timeout, $http, snRecordPresence, snTabActivity, urlTools, PRESENCE_DISABLED) {
  "use strict";
  var REST = {
    PRESENCE: "/api/now/ui/presence"
  };
  var RETRY_INTERVAL = ($window.NOW.presence_interval || 15) * 1000;
  var MAX_RETRY_DELAY = RETRY_INTERVAL * 10;
  var initialized = false;
  var primary = false;
  var presenceArray = [];
  var serverTimeMillis;
  var skew = 0;
  var st = 0;

  function init() {
    var location = urlTools.parseQueryString($window.location.search);
    var table = location['table'] || location['sysparm_table'];
    var sys_id = location['sys_id'] || location['sysparm_sys_id'];
    return initPresence(table, sys_id);
  }

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!initialized) {
      initialized = true;
      initRootScopes();
      if (!primary) {
        CustomEvent.observe('sn.presence', onPresenceEvent);
        CustomEvent.fireTop('sn.presence.ping');
      } else {
        presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
        if (presenceArray)
          $timeout(schedulePresence, 100);
        else
          updatePresence();
      }
    }
    return snRecordPresence.initPresence(t, id);
  }

  function onPresenceEvent(parms) {
    presenceArray = parms;
    $timeout(broadcastPresence);
  }

  function initRootScopes() {
    if ($window.NOW.presence_scopes) {
      var ps = $window.NOW.presence_scopes;
      if (ps.indexOf($rootScope) == -1)
        ps.push($rootScope);
    } else {
      $window.NOW.presence_scopes = [$rootScope];
      primary = CustomEvent.isTopWindow();
    }
  }

  function setPresence(data, st) {
    var rt = new Date().getTime() - st;
    if (rt > 500)
      console.log("snPresence response time " + rt + "ms");
    if (data.result && data.result.presenceArray) {
      presenceArray = data.result.presenceArray;
      setLocalPresence(presenceArray);
      serverTimeMillis = data.result.serverTimeMillis;
      skew = new Date().getTime() - serverTimeMillis;
      var t = Math.floor(skew / 1000);
      if (t < -15)
        console.log(">>>>> server ahead " + Math.abs(t) + " seconds");
      else if (t > 15)
        console.log(">>>>> browser time ahead " + t + " seconds");
    }
    schedulePresence();
  }

  function updatePresence(numAttempts) {
    presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
    if (presenceArray) {
      determineStatus(presenceArray);
      $timeout(schedulePresence);
      return;
    }
    if (!amb.isLoggedIn() || !snTabActivity.isPrimary) {
      $timeout(schedulePresence);
      return;
    }
    var p = {
      user_agent: navigator.userAgent,
      ua_time: new Date().toISOString(),
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      path: window.location.pathname + window.location.search
    };
    st = new Date().getTime();
    $http.post(REST.PRESENCE + '?sysparm_auto_request=true&cd=' + st, p).success(function(data) {
      setPresence(data, st);
    }).error(function(response, status) {
      console.log("snPresence " + status);
      schedulePresence(numAttempts);
    })
  }

  function schedulePresence(numAttempts) {
    numAttempts = isFinite(numAttempts) ? numAttempts + 1 : 0;
    var interval = getDecayingRetryInterval(numAttempts);
    $timeout(function() {
      updatePresence(numAttempts)
    }, interval);
    determineStatus(presenceArray);
    broadcastPresence();
  }

  function broadcastPresence() {
    if (angular.isDefined($window.applyPresenceArray)) {
      $window.applyPresenceArray(presenceArray);
    }
    $rootScope.$emit("sn.presence", presenceArray);
    if (!primary)
      return;
    CustomEvent.fireAll('sn.presence', presenceArray);
  }

  function determineStatus(presenceArray) {
    if (!presenceArray || !presenceArray.forEach)
      return;
    var t = new Date().getTime();
    t -= skew;
    presenceArray.forEach(function(p) {
      var x = 0 + p.last_on;
      var y = t - x;
      p.status = "online";
      if (y > (5 * RETRY_INTERVAL))
        p.status = "offline";
      else if (y > (3 * RETRY_INTERVAL))
        p.status = "probably offline";
      else if (y > (2.5 * RETRY_INTERVAL))
        p.status = "maybe offline";
    })
  }

  function setLocalPresence(value) {
    var p = {
      saved: new $window.Date().getTime(),
      presenceArray: value
    };
    $window.localStorage.setItem('snPresence', angular.toJson(p));
  }

  function getLocalPresence(p) {
    if (!p)
      return null;
    try {
      p = angular.fromJson(p);
    } catch (e) {
      p = {};
    }
    if (!p.presenceArray)
      return null;
    var now = new Date().getTime();
    if (now - p.saved >= RETRY_INTERVAL)
      return null;
    return p.presenceArray;
  }

  function getDecayingRetryInterval(numAttempts) {
    return Math.min(RETRY_INTERVAL * Math.pow(2, numAttempts), MAX_RETRY_DELAY);
  }
  return {
    init: init,
    initPresence: initPresence,
    _getLocalPresence: getLocalPresence,
    _setLocalPresence: setLocalPresence,
    _determineStatus: determineStatus
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
  "use strict";
  var statChannel;
  var interval = ($window.NOW.record_presence_interval || 20) * 1000;
  var sessions = {};
  var primary = false;
  var table;
  var sys_id;

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!t || !id)
      return;
    if (t == table && id == sys_id)
      return;
    initRootScopes();
    if (!primary)
      return;
    termPresence();
    table = t;
    sys_id = id;
    var recordPresence = "/sn/rp/" + table + "/" + sys_id;
    $rootScope.me = NOW.session_id;
    statChannel = amb.getChannel(recordPresence);
    statChannel.subscribe(onStatus);
    amb.connected.then(function() {
      setStatus("entered");
      $rootScope.status = "viewing";
    });
    return statChannel;
  }

  function initRootScopes() {
    if ($window.NOW.record_presence_scopes) {
      var ps = $window.NOW.record_presence_scopes;
      if (ps.indexOf($rootScope) == -1) {
        ps.push($rootScope);
        CustomEvent.observe('sn.sessions', onPresenceEvent);
      }
    } else {
      $window.NOW.record_presence_scopes = [$rootScope];
      primary = true;
    }
  }

  function onPresenceEvent(sessionsToSend) {
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
  }

  function termPresence() {
    if (!statChannel)
      return;
    statChannel.unsubscribe();
    statChannel = table = sys_id = null;
  }

  function setStatus(status) {
    if (status == $rootScope.status)
      return;
    $rootScope.status = status;
    if (Object.keys(sessions).length == 0)
      return;
    if (getStatusPrecedence(status) > 1)
      return;
    publish($rootScope.status);
  }

  function publish(status) {
    if (!statChannel)
      return;
    if (amb.getState() !== "opened")
      return;
    statChannel.publish({
      presences: [{
        status: status,
        session_id: NOW.session_id,
        user_name: NOW.user_name,
        user_id: NOW.user_id,
        user_display_name: NOW.user_display_name,
        user_initials: NOW.user_initials,
        user_avatar: NOW.user_avatar,
        ua: navigator.userAgent,
        table: table,
        sys_id: sys_id,
        time: new Date().toString().substring(0, 24)
      }]
    });
  }

  function onStatus(message) {
    message.data.presences.forEach(function(d) {
      if (!d.session_id || d.session_id == NOW.session_id)
        return;
      var s = sessions[d.session_id];
      if (s)
        angular.extend(s, d);
      else
        s = sessions[d.session_id] = d;
      s.lastUpdated = new Date();
      if (s.status == 'exited')
        delete sessions[d.session_id];
    });
    broadcastSessions();
  }

  function broadcastSessions() {
    var sessionsToSend = getUniqueSessions();
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
    if (primary)
      $timeout(function() {
        CustomEvent.fire('sn.sessions', sessionsToSend);
      })
  }

  function getUniqueSessions() {
    var uniqueSessionsByUser = {};
    var sessionKeys = Object.keys(sessions);
    sessionKeys.forEach(function(key) {
      var session = sessions[key];
      if (session.user_id == NOW.user_id)
        return;
      if (session.user_id in uniqueSessionsByUser) {
        var otherSession = uniqueSessionsByUser[session.user_id];
        var thisPrecedence = getStatusPrecedence(session.status);
        var otherPrecedence = getStatusPrecedence(otherSession.status);
        uniqueSessionsByUser[session.user_id] = thisPrecedence < otherPrecedence ? session : otherSession;
        return
      }
      uniqueSessionsByUser[session.user_id] = session;
    });
    var uniqueSessions = {};
    angular.forEach(uniqueSessionsByUser, function(item) {
      uniqueSessions[item.session_id] = item;
    });
    return uniqueSessions;
  }

  function getStatusPrecedence(status) {
    switch (status) {
      case 'typing':
        return 0;
      case 'viewing':
        return 1;
      case 'entered':
        return 2;
      case 'exited':
      case 'probably left':
        return 4;
      case 'offline':
        return 5;
      default:
        return 3;
    }
  }
  $rootScope.$on("record.typing", function(evt, data) {
    setStatus(data.status);
  });
  var idleTable, idleSysID;
  snTabActivity.onIdle({
    onIdle: function RecordPresenceTabIdle() {
      idleTable = table;
      idleSysID = sys_id;
      sessions = {};
      termPresence();
      broadcastSessions();
    },
    onReturn: function RecordPresenceTabActive() {
      initPresence(idleTable, idleSysID, true);
      idleTable = idleSysID = void(0);
    },
    delay: interval * 4
  });
  return {
    initPresence: initPresence,
    termPresence: termPresence
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snPresence.js */
angular.module('sn.common.presence').directive('snPresence', function(snPresence, $rootScope, $timeout, i18n) {
  'use strict';
  $timeout(snPresence.init, 100);
  var presenceStatus = {};
  i18n.getMessages(['maybe offline', 'probably offline', 'offline', 'online', 'entered', 'viewing'], function(results) {
    presenceStatus.maybe_offline = results['maybe offline'];
    presenceStatus.probably_offline = results['probably offline'];
    presenceStatus.offline = results['offline'];
    presenceStatus.online = results['online'];
    presenceStatus.entered = results['entered'];
    presenceStatus.viewing = results['viewing'];
  });
  var presences = {};
  $rootScope.$on('sn.presence', function(event, presenceArray) {
    if (!presenceArray) {
      angular.forEach(presences, function(p) {
        p.status = "offline";
      });
      return;
    }
    presenceArray.forEach(function(presence) {
      presences[presence.user] = presence;
    });
  });
  return {
    restrict: 'EA',
    replace: false,
    scope: {
      userId: '@?',
      snPresence: '=?',
      user: '=?',
      profile: '=?',
      displayName: '=?'
    },
    link: function(scope, element) {
      if (scope.profile) {
        scope.user = scope.profile.userID;
        scope.profile.tabIndex = -1;
        if (scope.profile.isAccessible)
          scope.profile.tabIndex = 0;
      }
      if (!element.hasClass('presence'))
        element.addClass('presence');

      function updatePresence() {
        var id = scope.snPresence || scope.user;
        if (!angular.isDefined(id) && angular.isDefined(scope.userId)) {
          id = scope.userId;
        }
        if (presences[id]) {
          var status = presences[id].status;
          if (status === 'maybe offline' || status === 'probably offline') {
            element.removeClass('presence-online presence-offline presence-away');
            element.addClass('presence-away');
          } else if (status == "offline" && !element.hasClass('presence-offline')) {
            element.removeClass('presence-online presence-away');
            element.addClass('presence-offline');
          } else if ((status == "online" || status == "entered" || status == "viewing") && !element.hasClass('presence-online')) {
            element.removeClass('presence-offline presence-away');
            element.addClass('presence-online');
          }
          status = status.replace(/ /g, "_");
          if (scope.profile)
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.profile.userName + ' ' + presenceStatus[status]);
          else
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.displayName + ' ' + presenceStatus[status]);
        } else {
          if (!element.hasClass('presence-offline'))
            element.addClass('presence-offline');
        }
      }
      var unbind = $rootScope.$on('sn.presence', updatePresence);
      scope.$on('$destroy', unbind);
      updatePresence();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snComposing.js */
angular.module('sn.common.presence').directive('snComposing', function(getTemplateUrl, snComposingPresence) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snComposing.xml"),
    replace: true,
    scope: {
      conversation: "="
    },
    controller: function($scope, $element) {
      var child = $element.children();
      if (child && child.tooltip)
        child.tooltip({
          'template': '<div class="tooltip" style="white-space: pre-wrap" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
          'placement': 'top',
          'container': 'body'
        });
      $scope.snComposingPresence = snComposingPresence;
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/service.snComposingPresence.js */
angular.module('sn.common.presence').service('snComposingPresence', function(i18n) {
  "use strict";
  var viewing = {};
  var typing = {};
  var allStrings = {};
  var shortStrings = {};
  var typing1 = "{0} is typing",
    typing2 = "{0} and {1} are typing",
    typingMore = "{0}, {1}, and {2} more are typing",
    viewing1 = "{0} is viewing",
    viewing2 = "{0} and {1} are viewing",
    viewingMore = "{0}, {1}, and {2} more are viewing";
  i18n.getMessages(
    [
      typing1,
      typing2,
      typingMore,
      viewing1,
      viewing2,
      viewingMore
    ],
    function(results) {
      typing1 = results[typing1];
      typing2 = results[typing2];
      typingMore = results[typingMore];
      viewing1 = results[viewing1];
      viewing2 = results[viewing2];
      viewingMore = results[viewingMore];
    });

  function set(conversationID, newPresenceValues) {
    if (newPresenceValues.viewing)
      viewing[conversationID] = newPresenceValues.viewing;
    if (newPresenceValues.typing)
      typing[conversationID] = newPresenceValues.typing;
    generateAllString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    generateShortString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    return {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    }
  }

  function get(conversationID) {
    return {
      viewing: viewing[conversationID] || [],
      typing: typing[conversationID] || []
    }
  }

  function generateAllString(conversationID, members) {
    var result = "";
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    if (typingLength < 4 && viewingLength < 4)
      return "";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        result += i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      default:
        var allButLastTyper = "";
        for (var i = 0; i < typingLength; i++) {
          if (i < typingLength - 2)
            allButLastTyper += members.typing[i].name + ", ";
          else if (i === typingLength - 2)
            allButLastTyper += members.typing[i].name + ",";
          else
            result += i18n.format(typing2, allButLastTyper, members.typing[i].name);
        }
    }
    if (viewingLength > 0 && typingLength > 0)
      result += "\n\n";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        result += i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      default:
        var allButLastViewer = "";
        for (var i = 0; i < viewingLength; i++) {
          if (i < viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ", ";
          else if (i === viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ",";
          else
            result += i18n.format(viewing2, allButLastViewer, members.viewing[i].name);
        }
    }
    allStrings[conversationID] = result;
  }

  function generateShortString(conversationID, members) {
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    var typingString = "",
      viewingString = "";
    var inBetween = " ";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        typingString = i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        typingString = i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      case 3:
        typingString = i18n.format(typing2, members.typing[0].name + ", " + members.typing[1].name + ",", members.typing[2].name);
        break;
      default:
        typingString = i18n.format(typingMore, members.typing[0].name, members.typing[1].name, (typingLength - 2));
    }
    if (viewingLength > 0 && typingLength > 0)
      inBetween = ". ";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        viewingString = i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        viewingString = i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      case 3:
        viewingString = i18n.format(viewing2, members.viewing[0].name + ", " + members.viewing[1].name + ",", members.viewing[2].name);
        break;
      default:
        viewingString = i18n.format(viewingMore, members.viewing[0].name, members.viewing[1].name, (viewingLength - 2));
    }
    shortStrings[conversationID] = typingString + inBetween + viewingString;
  }

  function getAllString(conversationID) {
    if ((viewing[conversationID] && viewing[conversationID].length > 3) ||
      (typing[conversationID] && typing[conversationID].length > 3))
      return allStrings[conversationID];
    return "";
  }

  function getShortString(conversationID) {
    return shortStrings[conversationID];
  }

  function remove(conversationID) {
    delete viewing[conversationID];
  }
  return {
    set: set,
    get: get,
    generateAllString: generateAllString,
    getAllString: getAllString,
    generateShortString: generateShortString,
    getShortString: getShortString,
    remove: remove
  }
});;;
/*! RESOURCE: /scripts/sn/common/user_profile/js_includes_user_profile.js */
/*! RESOURCE: /scripts/sn/common/user_profile/_module.js */
angular.module("sn.common.user_profile", ['sn.common.ui']);;
/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http) {
  "use strict";
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snUserProfile.xml'),
    scope: {
      profile: "=",
      showDirectMessagePrompt: "="
    },
    link: function(scope, element) {
      scope.showDirectMessagePromptFn = function() {
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          return !(!scope.profile ||
            activeUserID === scope.profile.sysID ||
            (scope.profile.document && activeUserID === scope.profile.document));
        } else {
          return false;
        }
      };
      $timeout(function() {
        element.find("#direct-message-popover-trigger").on("click", scope.openDirectMessageConversation);
      }, 0, false);
    },
    controller: function($scope, snConnectService) {
      if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID)) {
        $scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
        $scope.$emit("sn-user-profile.ready");
      } else {
        $http.get('/api/now/live/profiles/sys_user.' + $scope.profile.userID).then(function(response) {
          angular.merge($scope.profile, response.data.result);
          avatarProfilePersister.setAvatar($scope.profile.userID, $scope.profile);
          $scope.$emit("sn-user-profile.ready");
        })
      }
      $scope.openDirectMessageConversation = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $timeout(function() {
          snConnectService.openWithProfile($scope.profile);
        }, 0, false);
        angular.element('.popover').each(function() {
          angular.element('body').off('click.snUserAvatarPopoverClose');
          angular.element(this).popover('hide');
        });
      };
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/util/js_includes_util.js */
/*! RESOURCE: /scripts/thirdparty/autosizer/autosizer.min.js */
/*!
 Autosize 4.0.0
 license: MIT
 http://www.jacklmoore.com/autosize
 */
! function(e, t) {
  if ("function" == typeof define && define.amd) define(["exports", "module"], t);
  else if ("undefined" != typeof exports && "undefined" != typeof module) t(exports, module);
  else {
    var n = {
      exports: {}
    };
    t(n.exports, n), e.autosize = n.exports
  }
}(this, function(e, t) {
  "use strict";

  function n(e) {
    function t() {
      var t = window.getComputedStyle(e, null);
      "vertical" === t.resize ? e.style.resize = "none" : "both" === t.resize && (e.style.resize = "horizontal"), s = "content-box" === t.boxSizing ? -(parseFloat(t.paddingTop) + parseFloat(t.paddingBottom)) : parseFloat(t.borderTopWidth) + parseFloat(t.borderBottomWidth), isNaN(s) && (s = 0), l()
    }

    function n(t) {
      var n = e.style.width;
      e.style.width = "0px", e.offsetWidth, e.style.width = n, e.style.overflowY = t
    }

    function o(e) {
      for (var t = []; e && e.parentNode && e.parentNode instanceof Element;) e.parentNode.scrollTop && t.push({
        node: e.parentNode,
        scrollTop: e.parentNode.scrollTop
      }), e = e.parentNode;
      return t
    }

    function r() {
      var t = e.style.height,
        n = o(e),
        r = document.documentElement && document.documentElement.scrollTop;
      e.style.height = "";
      var i = e.scrollHeight + s;
      return 0 === e.scrollHeight ? void(e.style.height = t) : (e.style.height = i + "px", u = e.clientWidth, n.forEach(function(e) {
        e.node.scrollTop = e.scrollTop
      }), void(r && (document.documentElement.scrollTop = r)))
    }

    function l() {
      r();
      var t = Math.round(parseFloat(e.style.height)),
        o = window.getComputedStyle(e, null),
        i = "content-box" === o.boxSizing ? Math.round(parseFloat(o.height)) : e.offsetHeight;
      if (i !== t ? "hidden" === o.overflowY && (n("scroll"), r(), i = "content-box" === o.boxSizing ? Math.round(parseFloat(window.getComputedStyle(e, null).height)) : e.offsetHeight) : "hidden" !== o.overflowY && (n("hidden"), r(), i = "content-box" === o.boxSizing ? Math.round(parseFloat(window.getComputedStyle(e, null).height)) : e.offsetHeight), a !== i) {
        a = i;
        var l = d("autosize:resized");
        try {
          e.dispatchEvent(l)
        } catch (e) {}
      }
    }
    if (e && e.nodeName && "TEXTAREA" === e.nodeName && !i.has(e)) {
      var s = null,
        u = e.clientWidth,
        a = null,
        c = function() {
          e.clientWidth !== u && l()
        },
        p = function(t) {
          window.removeEventListener("resize", c, !1), e.removeEventListener("input", l, !1), e.removeEventListener("keyup", l, !1), e.removeEventListener("autosize:destroy", p, !1), e.removeEventListener("autosize:update", l, !1), Object.keys(t).forEach(function(n) {
            e.style[n] = t[n]
          }), i.delete(e)
        }.bind(e, {
          height: e.style.height,
          resize: e.style.resize,
          overflowY: e.style.overflowY,
          overflowX: e.style.overflowX,
          wordWrap: e.style.wordWrap
        });
      e.addEventListener("autosize:destroy", p, !1), "onpropertychange" in e && "oninput" in e && e.addEventListener("keyup", l, !1), window.addEventListener("resize", c, !1), e.addEventListener("input", l, !1), e.addEventListener("autosize:update", l, !1), e.style.overflowX = "hidden", e.style.wordWrap = "break-word", i.set(e, {
        destroy: p,
        update: l
      }), t()
    }
  }

  function o(e) {
    var t = i.get(e);
    t && t.destroy()
  }

  function r(e) {
    var t = i.get(e);
    t && t.update()
  }
  var i = "function" == typeof Map ? new Map : function() {
      var e = [],
        t = [];
      return {
        has: function(t) {
          return e.indexOf(t) > -1
        },
        get: function(n) {
          return t[e.indexOf(n)]
        },
        set: function(n, o) {
          e.indexOf(n) === -1 && (e.push(n), t.push(o))
        },
        delete: function(n) {
          var o = e.indexOf(n);
          o > -1 && (e.splice(o, 1), t.splice(o, 1))
        }
      }
    }(),
    d = function(e) {
      return new Event(e, {
        bubbles: !0
      })
    };
  try {
    new Event("test")
  } catch (e) {
    d = function(e) {
      var t = document.createEvent("Event");
      return t.initEvent(e, !0, !1), t
    }
  }
  var l = null;
  "undefined" == typeof window || "function" != typeof window.getComputedStyle ? (l = function(e) {
    return e
  }, l.destroy = function(e) {
    return e
  }, l.update = function(e) {
    return e
  }) : (l = function(e, t) {
    return e && Array.prototype.forEach.call(e.length ? e : [e], function(e) {
      return n(e, t)
    }), e
  }, l.destroy = function(e) {
    return e && Array.prototype.forEach.call(e.length ? e : [e], o), e
  }, l.update = function(e) {
    return e && Array.prototype.forEach.call(e.length ? e : [e], r), e
  }), t.exports = l
});
/*! RESOURCE: /scripts/sn/common/util/_module.js */
angular.module('sn.common.util', ['sn.common.auth']);
angular.module('sn.util', ['sn.common.util']);;
/*! RESOURCE: /scripts/sn/common/util/service.dateUtils.js */
angular.module('sn.common.util').factory('dateUtils', function() {
  var dateUtils = {
    SYS_DATE_FORMAT: "yyyy-MM-dd",
    SYS_TIME_FORMAT: "HH:mm:ss",
    SYS_DATE_TIME_FORMAT: "yyyy-MM-dd HH:mm:ss",
    MONTH_NAMES: new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
    DAY_NAMES: new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
    LZ: function(x) {
      return (x < 0 || x > 9 ? "" : "0") + x
    },
    isDate: function(val, format) {
      var date = this.getDateFromFormat(val, format);
      if (date == 0) {
        return false;
      }
      return true;
    },
    compareDates: function(date1, dateformat1, date2, dateformat2) {
      var d1 = this.getDateFromFormat(date1, dateformat1);
      var d2 = this.getDateFromFormat(date2, dateformat2);
      if (d1 == 0 || d2 == 0) {
        return -1;
      } else if (d1 > d2) {
        return 1;
      }
      return 0;
    },
    formatDateServer: function(date, format) {
      var ga = new GlideAjax("DateTimeUtils");
      ga.addParam("sysparm_name", "formatCalendarDate");
      var browserOffset = date.getTimezoneOffset() * 60000;
      var utcTime = date.getTime() - browserOffset;
      var userDateTime = utcTime - g_tz_offset;
      ga.addParam("sysparm_value", userDateTime);
      ga.getXMLWait();
      return ga.getAnswer();
    },
    formatDate: function(date, format) {
      if (format.indexOf("z") > 0)
        return this.formatDateServer(date, format);
      format = format + "";
      var result = "";
      var i_format = 0;
      var c = "";
      var token = "";
      var y = date.getYear() + "";
      var M = date.getMonth() + 1;
      var d = date.getDate();
      var E = date.getDay();
      var H = date.getHours();
      var m = date.getMinutes();
      var s = date.getSeconds();
      var yyyy, yy, MMM, MM, dd, hh, h, mm, ss, ampm, HH, H, KK, K, kk, k;
      var value = new Object();
      value["M"] = M;
      value["MM"] = this.LZ(M);
      value["MMM"] = this.MONTH_NAMES[M + 11];
      value["NNN"] = this.MONTH_NAMES[M + 11];
      value["MMMM"] = this.MONTH_NAMES[M - 1];
      value["d"] = d;
      value["dd"] = this.LZ(d);
      value["E"] = this.DAY_NAMES[E + 7];
      value["EE"] = this.DAY_NAMES[E];
      value["H"] = H;
      value["HH"] = this.LZ(H);
      if (format.indexOf('w') != -1) {
        var wk = date.getWeek();
        if (wk >= 52 && M == 1) {
          y = date.getYear();
          y--;
          y = y + "";
        }
        if (wk == 1 && M == 12) {
          y = date.getYear();
          y++;
          y = y + "";
        }
        value["w"] = wk;
        value["ww"] = this.LZ(wk);
      }
      var dayOfWeek = (7 + (E + 1) - (g_first_day_of_week - 1)) % 7;
      if (dayOfWeek == 0)
        dayOfWeek = 7;
      value["D"] = dayOfWeek;
      if (y.length < 4) {
        y = "" + (y - 0 + 1900);
      }
      value["y"] = "" + y;
      value["yyyy"] = y;
      value["yy"] = y.substring(2, 4);
      if (H == 0) {
        value["h"] = 12;
      } else if (H > 12) {
        value["h"] = H - 12;
      } else {
        value["h"] = H;
      }
      value["hh"] = this.LZ(value["h"]);
      if (H > 11) {
        value["K"] = H - 12;
      } else {
        value["K"] = H;
      }
      value["k"] = H + 1;
      value["KK"] = this.LZ(value["K"]);
      value["kk"] = this.LZ(value["k"]);
      if (H > 11) {
        value["a"] = "PM";
      } else {
        value["a"] = "AM";
      }
      value["m"] = m;
      value["mm"] = this.LZ(m);
      value["s"] = s;
      value["ss"] = this.LZ(s);
      while (i_format < format.length) {
        c = format.charAt(i_format);
        token = "";
        while ((format.charAt(i_format) == c) && (i_format < format.length)) {
          token += format.charAt(i_format++);
        }
        if (value[token] != null) {
          result = result + value[token];
        } else {
          result = result + token;
        }
      }
      return result;
    },
    _isInteger: function(val) {
      var digits = "1234567890";
      for (var i = 0; i < val.length; i++) {
        if (digits.indexOf(val.charAt(i)) == -1) {
          return false;
        }
      }
      return true;
    },
    _getInt: function(str, i, minlength, maxlength) {
      for (var x = maxlength; x >= minlength; x--) {
        var token = str.substring(i, i + x);
        if (token.length < minlength) {
          return null;
        }
        if (this._isInteger(token)) {
          return token;
        }
      }
      return null;
    },
    getDateFromFormat: function(val, format) {
      val = val + "";
      format = format + "";
      var i_val = 0;
      var i_format = 0;
      var c = "";
      var token = "";
      var token2 = "";
      var x, y;
      var now = new Date();
      var year = now.getYear();
      var month = now.getMonth() + 1;
      var date = 0;
      var hh = now.getHours();
      var mm = now.getMinutes();
      var ss = now.getSeconds();
      var ampm = "";
      var week = false;
      while (i_format < format.length) {
        c = format.charAt(i_format);
        token = "";
        while ((format.charAt(i_format) == c) && (i_format < format.length)) {
          token += format.charAt(i_format++);
        }
        if (token == "yyyy" || token == "yy" || token == "y") {
          if (token == "yyyy") {
            x = 4;
            y = 4;
          }
          if (token == "yy") {
            x = 2;
            y = 2;
          }
          if (token == "y") {
            x = 2;
            y = 4;
          }
          year = this._getInt(val, i_val, x, y);
          if (year == null) {
            return 0;
          }
          i_val += year.length;
          if (year.length == 2) {
            if (year > 70) {
              year = 1900 + (year - 0);
            } else {
              year = 2000 + (year - 0);
            }
          }
        } else if (token == "MMM" || token == "NNN") {
          month = 0;
          for (var i = 0; i < this.MONTH_NAMES.length; i++) {
            var month_name = this.MONTH_NAMES[i];
            if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
              if (token == "MMM" || (token == "NNN" && i > 11)) {
                month = i + 1;
                if (month > 12) {
                  month -= 12;
                }
                i_val += month_name.length;
                break;
              }
            }
          }
          if ((month < 1) || (month > 12)) {
            return 0;
          }
        } else if (token == "EE" || token == "E") {
          for (var i = 0; i < this.DAY_NAMES.length; i++) {
            var day_name = this.DAY_NAMES[i];
            if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
              if (week) {
                if (i == 0 || i == 7)
                  date += 6;
                else if (i == 2 || i == 9)
                  date += 1;
                else if (i == 3 || i == 10)
                  date += 2;
                else if (i == 4 || i == 11)
                  date += 3;
                else if (i == 5 || i == 12)
                  date += 4;
                else if (i == 6 || i == 13)
                  date += 5;
              }
              i_val += day_name.length;
              break;
            }
          }
        } else if (token == "MM" || token == "M") {
          month = this._getInt(val, i_val, token.length, 2);
          if (month == null || (month < 1) || (month > 12)) {
            return 0;
          }
          i_val += month.length;
        } else if (token == "dd" || token == "d") {
          date = this._getInt(val, i_val, token.length, 2);
          if (date == null || (date < 1) || (date > 31)) {
            return 0;
          }
          i_val += date.length;
        } else if (token == "hh" || token == "h") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 1) || (hh > 12)) {
            return 0;
          }
          i_val += hh.length;
        } else if (token == "HH" || token == "H") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 0) || (hh > 23)) {
            return 0;
          }
          i_val += hh.length;
        } else if (token == "KK" || token == "K") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 0) || (hh > 11)) {
            return 0;
          }
          i_val += hh.length;
        } else if (token == "kk" || token == "k") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 1) || (hh > 24)) {
            return 0;
          }
          i_val += hh.length;
          hh--;
        } else if (token == "mm" || token == "m") {
          mm = this._getInt(val, i_val, token.length, 2);
          if (mm == null || (mm < 0) || (mm > 59)) {
            return 0;
          }
          i_val += mm.length;
        } else if (token == "ss" || token == "s") {
          ss = this._getInt(val, i_val, token.length, 2);
          if (ss == null || (ss < 0) || (ss > 59)) {
            return 0;
          }
          i_val += ss.length;
        } else if (token == "a") {
          if (val.substring(i_val, i_val + 2).toLowerCase() == "am") {
            ampm = "AM";
          } else if (val.substring(i_val, i_val + 2).toLowerCase() == "pm") {
            ampm = "PM";
          } else {
            return 0;
          }
          i_val += 2;
        } else if (token == "w" || token == "ww") {
          var weekNum = this._getInt(val, i_val, token.length, 2);
          week = true;
          if (weekNum != null) {
            var temp = new Date(year, 0, 1, 0, 0, 0);
            temp.setWeek(parseInt(weekNum, 10));
            year = temp.getFullYear();
            month = temp.getMonth() + 1;
            date = temp.getDate();
          }
          weekNum += "";
          i_val += weekNum.length;
        } else if (token == "D") {
          if (week) {
            var day = this._getInt(val, i_val, token.length, 1);
            if ((day == null) || (day <= 0) || (day > 7))
              return 0;
            var temp = new Date(year, month - 1, date, hh, mm, ss);
            var dayOfWeek = temp.getDay();
            day = parseInt(day, 10);
            day = (day + g_first_day_of_week - 1) % 7;
            if (day == 0)
              day = 7;
            day--;
            if (day < dayOfWeek)
              day = 7 - (dayOfWeek - day);
            else
              day -= dayOfWeek;
            if (day > 0) {
              temp.setDate(temp.getDate() + day);
              year = temp.getFullYear();
              month = temp.getMonth() + 1;
              date = temp.getDate();
            }
            i_val++;
          }
        } else if (token == "z")
          i_val += 3;
        else {
          if (val.substring(i_val, i_val + token.length) != token) {
            return 0;
          } else {
            i_val += token.length;
          }
        }
      }
      if (i_val != val.length) {
        return 0;
      }
      if (month == 2) {
        if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
          if (date > 29) {
            return 0;
          }
        } else {
          if (date > 28) {
            return 0;
          }
        }
      }
      if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
        if (date > 30) {
          return 0;
        }
      }
      if (hh < 12 && ampm == "PM") {
        hh = hh - 0 + 12;
      } else if (hh > 11 && ampm == "AM") {
        hh -= 12;
      }
      var newdate = new Date(year, month - 1, date, hh, mm, ss);
      return newdate.getTime();
    },
    parseDate: function(val) {
      var preferEuro = (arguments.length == 2) ? arguments[1] : false;
      generalFormats = new Array('y-M-d', 'MMM d, y', 'MMM d,y', 'y-MMM-d', 'd-MMM-y', 'MMM d');
      monthFirst = new Array('M/d/y', 'M-d-y', 'M.d.y', 'MMM-d', 'M/d', 'M-d');
      dateFirst = new Array('d/M/y', 'd-M-y', 'd.M.y', 'd-MMM', 'd/M', 'd-M');
      yearFirst = new Array('yyyyw.F', 'yyw.F');
      var checkList = new Array('generalFormats', preferEuro ? 'dateFirst' : 'monthFirst', preferEuro ? 'monthFirst' : 'dateFirst', 'yearFirst');
      var d = null;
      for (var i = 0; i < checkList.length; i++) {
        var l = window[checkList[i]];
        for (var j = 0; j < l.length; j++) {
          d = this.getDateFromFormat(val, l[j]);
          if (d != 0) {
            return new Date(d);
          }
        }
      }
      return null;
    }
  };
  Date.prototype.getWeek = function() {
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - (g_first_day_of_week - 1);
    day = (day >= 0 ? day : day + 7);
    var dayNum = Math.floor((this.getTime() - newYear.getTime() - (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weekNum;
    if (day < 4) {
      weekNum = Math.floor((dayNum + day - 1) / 7) + 1;
      if (weekNum > 52)
        weekNum = this._checkNextYear(weekNum);
      return weekNum;
    }
    weekNum = Math.floor((dayNum + day - 1) / 7);
    if (weekNum < 1)
      weekNum = this._lastWeekOfYear();
    else if (weekNum > 52)
      weekNum = this._checkNextYear(weekNum);
    return weekNum;
  };
  Date.prototype._lastWeekOfYear = function() {
    var newYear = new Date(this.getFullYear() - 1, 0, 1);
    var endOfYear = new Date(this.getFullYear() - 1, 11, 31);
    var day = newYear.getDay() - (g_first_day_of_week - 1);
    var dayNum = Math.floor((endOfYear.getTime() - newYear.getTime() - (endOfYear.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    return day < 4 ? Math.floor((dayNum + day - 1) / 7) + 1 : Math.floor((dayNum + day - 1) / 7);
  };
  Date.prototype._checkNextYear = function() {
    var nYear = new Date(this.getFullYear() + 1, 0, 1);
    var nDay = nYear.getDay() - (g_first_day_of_week - 1);
    nDay = nDay >= 0 ? nDay : nDay + 7;
    return nDay < 4 ? 1 : 53;
  };
  Date.prototype.setWeek = function(weekNum) {
    weekNum--;
    var startOfYear = new Date(this.getFullYear(), 0, 1);
    var day = startOfYear.getDay() - (g_first_day_of_week - 1);
    if (day > 0 && day < 4) {
      this.setFullYear(startOfYear.getFullYear() - 1);
      this.setDate(31 - day + 1);
      this.setMonth(11);
    } else if (day > 3)
      this.setDate(startOfYear.getDate() + (7 - day));
    this.setDate(this.getDate() + (7 * weekNum));
  };
  return dateUtils;
});
/*! RESOURCE: /scripts/sn/common/util/service.debounceFn.js */
angular.module("sn.common.util").service("debounceFn", function() {
  "use strict";

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  return {
    debounce: debounce
  }
});;
/*! RESOURCE: /scripts/sn/common/util/factory.unwrappedHTTPPromise.js */
angular.module('sn.common.util').factory("unwrappedHTTPPromise", function($q) {
  "use strict";

  function isGenericPromise(promise) {
    return (typeof promise.then === "function" &&
      promise.success === undefined &&
      promise.error === undefined);
  }
  return function(httpPromise) {
    if (isGenericPromise(httpPromise))
      return httpPromise;
    var deferred = $q.defer();
    httpPromise.success(function(data) {
      deferred.resolve(data);
    }).error(function(data, status) {
      deferred.reject({
        data: data,
        status: status
      })
    });
    return deferred.promise;
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.urlTools.js */
angular.module('sn.common.util').constant('angularProcessorUrl', 'angular.do?sysparm_type=');
angular.module('sn.common.util').factory("urlTools", function(getTemplateUrl, angularProcessorUrl) {
  "use strict";

  function getPartialURL(name, parameters) {
    var url = getTemplateUrl(name);
    if (parameters) {
      if (typeof parameters !== 'string') {
        parameters = encodeURIParameters(parameters);
      }
      if (parameters.length) {
        url += "&" + parameters;
      }
    }
    if (window.NOW && window.NOW.ng_cache_defeat)
      url += "&t=" + new Date().getTime();
    return url;
  }

  function getURL(name, parameters) {
    if (parameters && typeof parameters === 'object')
      return urlFor(name, parameters);
    var url = angularProcessorUrl;
    url += name;
    if (parameters)
      url += "&" + parameters;
    return url;
  }

  function urlFor(route, parameters) {
    var p = encodeURIParameters(parameters);
    return angularProcessorUrl + route + (p.length ? '&' + p : '');
  }

  function getPropertyURL(name) {
    var url = angularProcessorUrl + "get_property&name=" + name;
    url += "&t=" + new Date().getTime();
    return url;
  }

  function encodeURIParameters(parameters) {
    var s = [];
    for (var parameter in parameters) {
      if (parameters.hasOwnProperty(parameter)) {
        var key = encodeURIComponent(parameter);
        var value = parameters[parameter] ? encodeURIComponent(parameters[parameter]) : '';
        s.push(key + "=" + value);
      }
    }
    return s.join('&');
  }

  function parseQueryString(qs) {
    qs = qs || '';
    if (qs.charAt(0) === '?') {
      qs = qs.substr(1);
    }
    var a = qs.split('&');
    if (a === "") {
      return {};
    }
    if (a && a[0].indexOf('http') != -1)
      a[0] = a[0].split("?")[1];
    var b = {};
    for (var i = 0; i < a.length; i++) {
      var p = a[i].split('=', 2);
      if (p.length == 1) {
        b[p[0]] = "";
      } else {
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
      }
    }
    return b;
  }
  return {
    getPartialURL: getPartialURL,
    getURL: getURL,
    urlFor: urlFor,
    getPropertyURL: getPropertyURL,
    encodeURIParameters: encodeURIParameters,
    parseQueryString: parseQueryString
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.getTemplateUrl.js */
angular.module('sn.common.util').provider('getTemplateUrl', function(angularProcessorUrl) {
  'use strict';
  var _handlerId = 0;
  var _handlers = {};
  this.registerHandler = function(handler) {
    var registeredId = _handlerId;
    _handlers[_handlerId] = handler;
    _handlerId++;
    return function() {
      delete _handlers[registeredId];
    };
  };
  this.$get = function() {
    return getTemplateUrl;
  };

  function getTemplateUrl(templatePath) {
    if (_handlerId > 0) {
      var path;
      var handled = false;
      angular.forEach(_handlers, function(handler) {
        if (!handled) {
          var handlerPath = handler(templatePath);
          if (typeof handlerPath !== 'undefined') {
            path = handlerPath;
            handled = true;
          }
        }
      });
      if (handled) {
        return path;
      }
    }
    return angularProcessorUrl + 'get_partial&name=' + templatePath;
  }
});;
/*! RESOURCE: /scripts/sn/common/util/service.snTabActivity.js */
angular.module("sn.common.util").service("snTabActivity", function($window, $timeout, $rootElement, $document) {
  "use strict";
  var activeEvents = ["keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "mousemove", "mouseenter", "input", "focus", "scroll"],
    defaultIdle = 75000,
    isPrimary = true,
    idleTime = 0,
    isVisible = true,
    idleTimeout = void(0),
    pageIdleTimeout = void(0),
    hasActed = false,
    appName = $rootElement.attr('ng-app') || "",
    storageKey = "sn.tabs." + appName + ".activeTab";
  var callbacks = {
    "tab.primary": [],
    "tab.secondary": [],
    "activity.active": [],
    "activity.idle": [{
      delay: defaultIdle,
      cb: function() {}
    }]
  };
  $window.tabGUID = $window.tabGUID || createGUID();

  function getActiveEvents() {
    return activeEvents.join(".snTabActivity ") + ".snTabActivity";
  }

  function setAppName(an) {
    appName = an;
    storageKey = "sn.tabs." + appName + ".activeTab";
    makePrimary(true);
  }

  function createGUID(l) {
    l = l || 32;
    var strResult = '';
    while (strResult.length < l)
      strResult += (((1 + Math.random() + new Date().getTime()) * 0x10000) | 0).toString(16).substring(1);
    return strResult.substr(0, l);
  }

  function ngObjectIndexOf(arr, obj) {
    for (var i = 0, len = arr.length; i < len; i++)
      if (angular.equals(arr[i], obj))
        return i;
    return -1;
  }
  var detectedApi,
    apis = [{
      eventName: 'visibilitychange',
      propertyName: 'hidden'
    }, {
      eventName: 'mozvisibilitychange',
      propertyName: 'mozHidden'
    }, {
      eventName: 'msvisibilitychange',
      propertyName: 'msHidden'
    }, {
      eventName: 'webkitvisibilitychange',
      propertyName: 'webkitHidden'
    }];
  apis.some(function(api) {
    if (angular.isDefined($document[0][api.propertyName])) {
      detectedApi = api;
      return true;
    }
  });
  if (detectedApi)
    $document.on(detectedApi.eventName, function() {
      if (!$document[0][detectedApi.propertyName]) {
        makePrimary();
        isVisible = true;
      } else {
        if (!idleTimeout && !idleTime)
          waitForIdle(0);
        isVisible = false;
      }
    });
  angular.element($window).on({
    "mouseleave": function(e) {
      var destination = angular.isUndefined(e.toElement) ? e.relatedTarget : e.toElement;
      if (destination === null && $document[0].hasFocus()) {
        waitForIdle(0);
      }
    },
    "storage": function(e) {
      if (e.originalEvent.key !== storageKey)
        return;
      if ($window.localStorage.getItem(storageKey) !== $window.tabGUID)
        makeSecondary();
    }
  });

  function waitForIdle(index, delayOffset) {
    var callback = callbacks['activity.idle'][index];
    var numCallbacks = callbacks['activity.idle'].length;
    delayOffset = delayOffset || callback.delay;
    angular.element($window).off(getActiveEvents());
    angular.element($window).one(getActiveEvents(), setActive);
    if (index >= numCallbacks)
      return;
    if (idleTimeout)
      $timeout.cancel(idleTimeout);
    idleTimeout = $timeout(function() {
      idleTime = callback.delay;
      callback.cb();
      $timeout.cancel(idleTimeout);
      idleTimeout = void(0);
      angular.element($window).off(getActiveEvents());
      angular.element($window).one(getActiveEvents(), setActive);
      for (var i = index + 1; i < numCallbacks; i++) {
        var nextDelay = callbacks['activity.idle'][i].delay;
        if (nextDelay <= callback.delay)
          callbacks['activity.idle'][i].cb();
        else {
          waitForIdle(i, nextDelay - callback.delay);
          break;
        }
      }
    }, delayOffset, false);
  }

  function setActive() {
    angular.element($window).off(getActiveEvents());
    if (idleTimeout) {
      $timeout.cancel(idleTimeout);
      idleTimeout = void(0);
    }
    var activeCallbacks = callbacks['activity.active'];
    activeCallbacks.some(function(callback) {
      if (callback.delay <= idleTime)
        callback.cb();
      else
        return true;
    });
    idleTime = 0;
    makePrimary();
    if (pageIdleTimeout) {
      $timeout.cancel(pageIdleTimeout);
      pageIdleTimeout = void(0);
    }
    var minDelay = callbacks['activity.idle'][0].delay;
    hasActed = false;
    if (!pageIdleTimeout)
      pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
    listenForActivity();
  }

  function pageIdleHandler() {
    if (idleTimeout)
      return;
    var minDelay = callbacks['activity.idle'][0].delay;
    if (hasActed) {
      hasActed = false;
      if (pageIdleTimeout)
        $timeout.cancel(pageIdleTimeout);
      pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
      listenForActivity();
      return;
    }
    var delayOffset = minDelay;
    if (callbacks['activity.idle'].length > 1)
      delayOffset = callbacks['activity.idle'][1].delay - minDelay;
    idleTime = minDelay;
    callbacks['activity.idle'][0].cb();
    waitForIdle(1, delayOffset);
    pageIdleTimeout = void(0);
  }

  function listenForActivity() {
    angular.element($window).off(getActiveEvents());
    angular.element($window).one(getActiveEvents(), onActivity);
    angular.element("#gsft_main").on("load.snTabActivity", function() {
      var src = angular.element(this).attr('src');
      if (src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
        var iframeWindow = this.contentWindow ? this.contentWindow : this.contentDocument.defaultView;
        angular.element(iframeWindow).off(getActiveEvents());
        angular.element(iframeWindow).one(getActiveEvents(), onActivity);
      }
    });
    angular.element('iframe').each(function(idx, iframe) {
      var src = angular.element(iframe).attr('src');
      if (!src)
        return;
      if (src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
        var iframeWindow = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.defaultView;
        angular.element(iframeWindow).off(getActiveEvents());
        angular.element(iframeWindow).one(getActiveEvents(), onActivity);
      }
    });
  }

  function onActivity() {
    hasActed = true;
    makePrimary();
  }

  function makePrimary(initial) {
    var oldGuid = $window.localStorage.getItem(storageKey);
    isPrimary = true;
    isVisible = true;
    $timeout.cancel(idleTimeout);
    idleTimeout = void(0);
    if (canUseStorage() && oldGuid !== $window.tabGUID && !initial)
      for (var i = 0, len = callbacks["tab.primary"].length; i < len; i++)
        callbacks["tab.primary"][i].cb();
    try {
      $window.localStorage.setItem(storageKey, $window.tabGUID);
    } catch (ignored) {}
    if (idleTime && $document[0].hasFocus())
      setActive();
  }

  function makeSecondary() {
    isPrimary = false;
    isVisible = false;
    for (var i = 0, len = callbacks["tab.secondary"].length; i < len; i++)
      callbacks["tab.secondary"][i].cb();
  }

  function registerCallback(event, callback, scope) {
    var cbObject = angular.isObject(callback) ? callback : {
      delay: defaultIdle,
      cb: callback
    };
    if (callbacks[event]) {
      callbacks[event].push(cbObject);
      callbacks[event].sort(function(a, b) {
        return a.delay - b.delay;
      })
    }

    function destroyCallback() {
      if (callbacks[event]) {
        var pos = ngObjectIndexOf(callbacks[event], cbObject);
        if (pos !== -1)
          callbacks[event].splice(pos, 1);
      }
    }
    if (scope)
      scope.$on("$destroy", function() {
        destroyCallback();
      });
    return destroyCallback;
  }

  function registerIdleCallback(options, onIdle, onReturn, scope) {
    var delay = options,
      onIdleDestroy,
      onReturnDestroy;
    if (angular.isObject(options)) {
      delay = options.delay;
      onIdle = options.onIdle || onIdle;
      onReturn = options.onReturn || onReturn;
      scope = options.scope || scope;
    }
    if (angular.isFunction(onIdle))
      onIdleDestroy = registerCallback("activity.idle", {
        delay: delay,
        cb: onIdle
      });
    else if (angular.isFunction(onReturn)) {
      onIdleDestroy = registerCallback("activity.idle", {
        delay: delay,
        cb: function() {}
      });
    }
    if (angular.isFunction(onReturn))
      onReturnDestroy = registerCallback("activity.active", {
        delay: delay,
        cb: onReturn
      });

    function destroyAll() {
      if (angular.isFunction(onIdleDestroy))
        onIdleDestroy();
      if (angular.isFunction(onReturnDestroy))
        onReturnDestroy();
    }
    if (scope)
      scope.$on("$destroy", function() {
        destroyAll();
      });
    return destroyAll;
  }

  function canUseStorage() {
    var canWe = false;
    try {
      $window.localStorage.setItem(storageKey, $window.tabGUID);
      canWe = true;
    } catch (ignored) {}
    return canWe;
  }

  function resetIdleTime() {
    if (idleTime > 0) {
      idleTime = 0;
      if (pageIdleTimeout) {
        $timeout.cancel(pageIdleTimeout);
        pageIdleTimeout = void(0);
      }
    }
    waitForIdle(0);
  }
  makePrimary(true);
  listenForActivity();
  pageIdleTimeout = $timeout(pageIdleHandler, defaultIdle, false);
  return {
    on: registerCallback,
    onIdle: registerIdleCallback,
    setAppName: setAppName,
    get isPrimary() {
      return isPrimary;
    },
    get isIdle() {
      return idleTime > 0;
    },
    get idleTime() {
      return idleTime;
    },
    get isVisible() {
      return isVisible;
    },
    get appName() {
      return appName;
    },
    get defaultIdleTime() {
      return defaultIdle
    },
    isActive: function() {
      return this.idleTime < this.defaultIdleTime && this.isVisible;
    },
    resetIdleTime: resetIdleTime
  }
});;
/*! RESOURCE: /scripts/sn/common/util/factory.ArraySynchronizer.js */
angular.module("sn.common.util").factory("ArraySynchronizer", function() {
  'use strict';

  function ArraySynchronizer() {}

  function index(key, arr) {
    var result = {};
    var keys = [];
    result.orderedKeys = keys;
    angular.forEach(arr, function(item) {
      var keyValue = item[key];
      result[keyValue] = item;
      keys.push(keyValue);
    });
    return result;
  }

  function sortByKeyAndModel(arr, key, model) {
    arr.sort(function(a, b) {
      var aIndex = model.indexOf(a[key]);
      var bIndex = model.indexOf(b[key]);
      if (aIndex > bIndex)
        return 1;
      else if (aIndex < bIndex)
        return -1;
      return 0;
    });
  }
  ArraySynchronizer.prototype = {
    add: function(syncField, dest, source, end) {
      end = end || "bottom";
      var destIndex = index(syncField, dest);
      var sourceIndex = index(syncField, source);
      angular.forEach(sourceIndex.orderedKeys, function(key) {
        if (destIndex.orderedKeys.indexOf(key) === -1) {
          if (end === "bottom") {
            dest.push(sourceIndex[key]);
          } else {
            dest.unshift(sourceIndex[key]);
          }
        }
      });
    },
    synchronize: function(syncField, dest, source, deepKeySyncArray) {
      var destIndex = index(syncField, dest);
      var sourceIndex = index(syncField, source);
      deepKeySyncArray = (typeof deepKeySyncArray === "undefined") ? [] : deepKeySyncArray;
      for (var i = destIndex.orderedKeys.length - 1; i >= 0; i--) {
        var key = destIndex.orderedKeys[i];
        if (sourceIndex.orderedKeys.indexOf(key) === -1) {
          destIndex.orderedKeys.splice(i, 1);
          dest.splice(i, 1);
        }
        if (deepKeySyncArray.length > 0) {
          angular.forEach(deepKeySyncArray, function(deepKey) {
            if (sourceIndex[key] && destIndex[key][deepKey] !== sourceIndex[key][deepKey]) {
              destIndex[key][deepKey] = sourceIndex[key][deepKey];
            }
          });
        }
      }
      angular.forEach(sourceIndex.orderedKeys, function(key) {
        if (destIndex.orderedKeys.indexOf(key) === -1)
          dest.push(sourceIndex[key]);
      });
      sortByKeyAndModel(dest, syncField, sourceIndex.orderedKeys);
    }
  };
  return ArraySynchronizer;
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snBindOnce.js */
angular.module("sn.common.util").directive("snBindOnce", function($sanitize) {
  "use strict";
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      var value = scope.$eval(attrs.snBindOnce);
      var sanitizedValue = $sanitize(value);
      element.append(sanitizedValue);
    }
  }
});
/*! RESOURCE: /scripts/sn/common/util/directive.snCloak.js */
angular.module("sn.common.util").directive("snCloak", function() {
  "use strict";
  return {
    restrict: "A",
    compile: function(element, attr) {
      return function() {
        attr.$set('snCloak', undefined);
        element.removeClass('sn-cloak');
      }
    }
  };
});
/*! RESOURCE: /scripts/sn/common/util/service.md5.js */
angular.module('sn.common.util').factory('md5', function() {
  'use strict';
  var md5cycle = function(x, k) {
    var a = x[0],
      b = x[1],
      c = x[2],
      d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  };
  var cmn = function(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  };
  var ff = function(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  };
  var gg = function(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  };
  var hh = function(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  };
  var ii = function(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  };
  var md51 = function(s) {
    var txt = '';
    var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  };
  var md5blk = function(s) {
    var md5blks = [],
      i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  };
  var hex_chr = '0123456789abcdef'.split('');
  var rhex = function(n) {
    var s = '',
      j = 0;
    for (; j < 4; j++)
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] +
      hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
  };
  var hex = function(x) {
    for (var i = 0; i < x.length; i++)
      x[i] = rhex(x[i]);
    return x.join('');
  };
  var add32 = function(a, b) {
    return (a + b) & 0xFFFFFFFF;
  };
  return function(s) {
    return hex(md51(s));
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.priorityQueue.js */
angular.module('sn.common.util').factory('priorityQueue', function() {
  'use strict';
  return function(comparator) {
    var items = [];
    var compare = comparator || function(a, b) {
      return a - b;
    };
    var swap = function(a, b) {
      var temp = items[a];
      items[a] = items[b];
      items[b] = temp;
    };
    var bubbleUp = function(pos) {
      var parent;
      while (pos > 0) {
        parent = (pos - 1) >> 1;
        if (compare(items[pos], items[parent]) >= 0)
          break;
        swap(parent, pos);
        pos = parent;
      }
    };
    var bubbleDown = function(pos) {
      var left, right, min, last = items.length - 1;
      while (true) {
        left = (pos << 1) + 1;
        right = left + 1;
        min = pos;
        if (left <= last && compare(items[left], items[min]) < 0)
          min = left;
        if (right <= last && compare(items[right], items[min]) < 0)
          min = right;
        if (min === pos)
          break;
        swap(min, pos);
        pos = min;
      }
    };
    return {
      add: function(item) {
        items.push(item);
        bubbleUp(items.length - 1);
      },
      poll: function() {
        var first = items[0],
          last = items.pop();
        if (items.length > 0) {
          items[0] = last;
          bubbleDown(0);
        }
        return first;
      },
      peek: function() {
        return items[0];
      },
      clear: function() {
        items = [];
      },
      inspect: function() {
        return angular.toJson(items, true);
      },
      get size() {
        return items.length;
      },
      get all() {
        return items;
      },
      set comparator(fn) {
        compare = fn;
      }
    };
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.snResource.js */
angular.module('sn.common.util').factory('snResource', function($http, $q, priorityQueue, md5) {
  'use strict';
  var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'jsonp', 'trace'],
    queue = priorityQueue(function(a, b) {
      return a.timestamp - b.timestamp;
    }),
    resource = {},
    pendingRequests = [],
    inFlightRequests = [];
  return function() {
    var requestInterceptors = $http.defaults.transformRequest,
      responseInterceptors = $http.defaults.transformResponse;
    var next = function() {
      var request = queue.peek();
      pendingRequests.shift();
      inFlightRequests.push(request.hash);
      $http(request.config).then(function(response) {
        request.deferred.resolve(response);
      }, function(reason) {
        request.deferred.reject(reason);
      }).finally(function() {
        queue.poll();
        inFlightRequests.shift();
        if (queue.size > 0)
          next();
      });
    };
    angular.forEach(methods, function(method) {
      resource[method] = function(url, data) {
        var deferredRequest = $q.defer(),
          promise = deferredRequest.promise,
          deferredAbort = $q.defer(),
          config = {
            method: method,
            url: url,
            data: data,
            transformRequest: requestInterceptors,
            transformResponse: responseInterceptors,
            timeout: deferredAbort.promise
          },
          hash = md5(JSON.stringify(config));
        pendingRequests.push(hash);
        queue.add({
          config: config,
          deferred: deferredRequest,
          timestamp: Date.now(),
          hash: hash
        });
        if (queue.size === 1)
          next();
        promise.abort = function() {
          deferredAbort.resolve('Request cancelled');
        };
        return promise;
      };
    });
    resource.addRequestInterceptor = function(fn) {
      requestInterceptors = requestInterceptors.concat([fn]);
    };
    resource.addResponseInterceptor = function(fn) {
      responseInterceptors = responseInterceptors.concat([fn]);
    };
    resource.queueSize = function() {
      return queue.size;
    };
    resource.queuedRequests = function() {
      return queue.all;
    };
    return resource;
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.snConnect.js */
angular.module("sn.common.util").service("snConnectService", function($http, snCustomEvent) {
  "use strict";
  var connectPaths = ["/$c.do", "/$chat.do"];

  function canOpenInFrameset() {
    return window.top.NOW.collaborationFrameset;
  }

  function isInConnect() {
    var parentPath = getParentPath();
    return connectPaths.some(function(path) {
      return parentPath == path;
    });
  }

  function getParentPath() {
    try {
      return window.top.location.pathname;
    } catch (IGNORED) {
      return "";
    }
  }

  function openWithProfile(profile) {
    if (isInConnect() || canOpenInFrameset())
      snCustomEvent.fireTop('chat:open_conversation', profile);
    else
      window.open("$c.do#/with/" + profile.sys_id, "_blank");
  }
  return {
    openWithProfile: openWithProfile
  }
});;
/*! RESOURCE: /scripts/sn/common/util/snPolyfill.js */
(function() {
  "use strict";
  polyfill(String.prototype, 'startsWith', function(prefix) {
    return this.indexOf(prefix) === 0;
  });
  polyfill(String.prototype, 'endsWith', function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  });
  polyfill(Number, 'isNaN', function(value) {
    return value !== value;
  });
  polyfill(window, 'btoa', function(input) {
    var str = String(input);
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    for (
      var block, charCode, idx = 0, map = chars, output = ''; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  function polyfill(obj, slot, fn) {
    if (obj[slot] === void(0)) {
      obj[slot] = fn;
    }
  }
  window.console = window.console || {
    log: function() {}
  };
})();;
/*! RESOURCE: /scripts/sn/common/util/directive.snFocus.js */
angular.module('sn.common.util').directive('snFocus', function($timeout) {
  'use strict';
  return function(scope, element, attrs) {
    scope.$watch(attrs.snFocus, function(value) {
      if (value !== true)
        return;
      $timeout(function() {
        element[0].focus();
      });
    });
  };
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snResizeHeight.js */
angular.module('sn.common.util').directive('snResizeHeight', function($window) {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      if (typeof $window.autosize === 'undefined') {
        return;
      }
      $window.autosize(elem);

      function _update() {
        $window.autosize.update(elem);
      }

      function _destroy() {
        $window.autosize.destroy(elem);
      }
      if (typeof attrs.disableValueWatcher === "undefined") {
        scope.$watch(function() {
          return elem.val();
        }, function valueWatcher(newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          _update();
        });
      }
      elem.on('input.resize', _update());
      scope.$on('$destroy', function() {
        _destroy();
      });
      if (attrs.snTextareaAutosizer === 'trim') {
        elem.on('blur', function() {
          elem.val(elem.val().trim());
          _update();
        })
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snBlurOnEnter.js */
angular.module('sn.common.util').directive('snBlurOnEnter', function() {
  'use strict';
  return function(scope, element) {
    element.bind("keydown keypress", function(event) {
      if (event.which !== 13)
        return;
      element.blur();
      event.preventDefault();
    });
  };
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snStickyHeaders.js */
angular.module('sn.common.util').directive('snStickyHeaders', function() {
  "use strict";
  return {
    restrict: 'A',
    transclude: false,
    replace: false,
    link: function(scope, element, attrs) {
      element.addClass('sticky-headers');
      var containers;
      var scrollContainer = element.find('[sn-sticky-scroll-container]');
      scrollContainer.addClass('sticky-scroll-container');

      function refreshHeaders() {
        if (attrs.snStickyHeaders !== 'false') {
          angular.forEach(containers, function(container) {
            var stickyContainer = angular.element(container);
            var stickyHeader = stickyContainer.find('[sn-sticky-header]');
            var stickyOffset = stickyContainer.position().top + stickyContainer.outerHeight();
            stickyContainer.addClass('sticky-container');
            if (stickyOffset < stickyContainer.outerHeight() && stickyOffset > -stickyHeader.outerHeight()) {
              stickyContainer.css('padding-top', stickyHeader.outerHeight());
              stickyHeader.css('width', stickyHeader.outerWidth());
              stickyHeader.removeClass('sticky-header-disabled').addClass('sticky-header-enabled');
            } else {
              stickyContainer.css('padding-top', '');
              stickyHeader.css('width', '');
              stickyHeader.removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
            }
          });
        } else {
          element.find('[sn-sticky-container]').removeClass('sticky-container');
          element.find('[sn-sticky-container]').css('padding-top', '');
          element.find('[sn-sticky-header]').css('width', '');
          element.find('[sn-sticky-header]').removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
        }
      }
      scope.$watch(function() {
        scrollContainer.find('[sn-sticky-header]').addClass('sticky-header');
        containers = element.find('[sn-sticky-container]');
        return attrs.snStickyHeaders;
      }, refreshHeaders);
      scope.$watch(function() {
        return scrollContainer[0].scrollHeight;
      }, refreshHeaders);
      scrollContainer.on('scroll', refreshHeaders);
    }
  };
});;;
/*! RESOURCE: /scripts/sn/common/ui/js_includes_ui.js */
/*! RESOURCE: /scripts/sn/common/ui/_module.js */
angular.module('sn.common.ui', ['sn.common.messaging']);;
/*! RESOURCE: /scripts/sn/common/ui/popover/js_includes_ui_popover.js */
/*! RESOURCE: /scripts/sn/common/ui/popover/_module.js */
angular.module('sn.common.ui.popover', []);;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snBindPopoverSelection.js */
angular.module('sn.common.ui.popover').directive('snBindPopoverSelection', function(snCustomEvent) {
  "use strict";
  return {
    restrict: "A",
    controller: function($scope, $element, $attrs, snCustomEvent) {
      snCustomEvent.observe('list.record_select', recordSelectDataHandler);

      function recordSelectDataHandler(data, event) {
        if (!data || !event)
          return;
        event.stopPropagation();
        var ref = ($scope.field) ? $scope.field.ref : $attrs.ref;
        if (data.ref === ref) {
          if (window.g_form) {
            if ($attrs.addOption) {
              addGlideListChoice('select_0' + $attrs.ref, data.value, data.displayValue);
            } else {
              var fieldValue = typeof $attrs.ref === 'undefined' ? data.ref : $attrs.ref;
              window.g_form._setValue(fieldValue, data.value, data.displayValue);
              clearDerivedFields(data.value);
            }
          }
          if ($scope.field) {
            $scope.field.value = data.value;
            $scope.field.displayValue = data.displayValue;
          }
        }
      }

      function clearDerivedFields(value) {
        if (window.DerivedFields) {
          var df = new DerivedFields($scope.field ? $scope.field.ref : $attrs.ref);
          df.clearRelated();
          df.updateRelated(value);
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snComplexPopover.js */
angular.module('sn.common.ui.popover').directive('snComplexPopover', function(getTemplateUrl, $q, $http, $templateCache, $compile, $timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    templateUrl: function(elem, attrs) {
      return getTemplateUrl(attrs.buttonTemplate);
    },
    controller: function($scope, $element, $attrs, $q, $document, snCustomEvent, snComplexPopoverService) {
      $scope.type = $attrs.complexPopoverType || "complex_popover";
      if ($scope.closeEvent) {
        snCustomEvent.observe($scope.closeEvent, destroyPopover);
        $scope.$on($scope.closeEvent, destroyPopover);
      }
      $scope.$parent.$on('$destroy', destroyPopover);
      $scope.$on('$destroy', function() {
        snCustomEvent.un($scope.closeEvent, destroyPopover);
      });
      var newScope;
      var open;
      var popover;
      var content;
      var popoverDefaults = {
        container: 'body',
        html: true,
        placement: 'auto',
        trigger: 'manual',
        template: '<div class="complex_popover popover" role="dialog"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      var popoverConfig = angular.extend(popoverDefaults, $scope.popoverConfig);
      $scope.loading = false;
      $scope.initialized = false;
      $scope.popOverDisplaying = false;
      $scope.togglePopover = function(event) {
        if (!open) {
          showPopover(event);
        } else {
          destroyPopover();
        }
        $scope.popOverDisplaying = !$scope.popOverDisplaying;
      };

      function showPopover(e) {
        if ($scope.loading)
          return;
        $scope.$toggleButton = angular.element(e.target);
        $scope.loading = true;
        $scope.$emit('list.toggleLoadingState', true);
        _getTemplate()
          .then(_insertTemplate)
          .then(_createPopover)
          .then(_bindHtml)
          .then(function() {
            $scope.initialized = true;
            if (!$scope.loadEvent)
              _openPopover();
          });
      }

      function destroyPopover() {
        if (!newScope)
          return;
        $scope.$toggleButton.on('hidden.bs.popover', function() {
          open = false;
          $scope.$toggleButton.data('bs.popover').$element.removeData('bs.popover').off('.popover');
          $scope.$toggleButton = null;
          snCustomEvent.fire('hidden.complexpopover.' + $scope.ref);
        });
        $scope.$toggleButton.popover('hide');
        snCustomEvent.fire('hide.complexpopover.' + $scope.ref, $scope.$toggleButton);
        newScope.$broadcast('$destroy');
        newScope.$destroy();
        newScope = null;
        $scope.initialized = false;
        angular.element(window).off({
          'click': complexHtmlHandler,
          'keydown': keyDownHandler
        });
      }

      function _getTemplate() {
        return snComplexPopoverService.getTemplate(getTemplateUrl($attrs.template));
      }

      function _createPopover() {
        $scope.$toggleButton.popover(popoverConfig);
        return $q.when(true);
      }

      function _insertTemplate(response) {
        newScope = $scope.$new();
        if ($scope.loadEvent)
          newScope.$on($scope.loadEvent, _openPopover);
        content = $compile(response.data)(newScope);
        popoverConfig.content = content;
        newScope.open = true;
        snCustomEvent.fire('inserted.complexpopover.' + $scope.ref, $scope.$toggleButton);
        return $q.when(true);
      }

      function _bindHtml() {
        angular.element(window).on({
          'click': complexHtmlHandler,
          'keydown': keyDownHandler
        });
        return $q.when(true);
      }

      function complexHtmlHandler(e) {
        var parentComplexPopoverScope = angular.element(e.target).parents('.popover-content').children().scope();
        if (parentComplexPopoverScope && (parentComplexPopoverScope.type = "complex_popover") && $scope.type === "complex_popover")
          return;
        if (!open || angular.element(e.target).parents('html').length === 0)
          return;
        if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length === 0) {
          _eventClosePopover(e);
          destroyPopover(e);
        }
      }

      function keyDownHandler(e) {
        if (e.keyCode != 27)
          return;
        if (!open || angular.element(e.target).parents('html').length === 0)
          return;
        if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length > 0) {
          _eventClosePopover(e);
          destroyPopover();
        }
      }

      function _eventClosePopover(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      function createAndActivateFocusTrap(popover) {
        var deferred = $q.defer();
        if (!window.focusTrap) {
          deferred.reject('Focus trap not found');
        } else {
          if (!$scope.focusTrap) {
            $scope.focusTrap = window.focusTrap(popover, {
              clickOutsideDeactivates: true
            });
          }
          try {
            $scope.focusTrap.activate({
              onActivate: function() {
                deferred.resolve();
              }
            });
          } catch (e) {
            console.warn("Unable to activate focus trap", e);
          }
        }
        return deferred.promise;
      }

      function deactivateAndDestroyFocusTrap() {
        var deferred = $q.defer();
        if (!$scope.focusTrap) {
          deferred.reject("Focus trap not found");
        } else {
          try {
            $scope.focusTrap.deactivate({
              returnFocus: false,
              onDeactivate: function() {
                deferred.resolve();
              }
            });
          } catch (e) {
            console.warn("Unable to deactivate focus trap", e);
          }
          $scope.focusTrap = null;
        }
        return deferred.promise;
      }

      function _openPopover() {
        if (open) {
          return;
        }
        open = true;
        $timeout(function() {
          $scope.$toggleButton.popover('show');
          $scope.loading = false;
          snCustomEvent.fire('show.complexpopover.' + $scope.ref, $scope.$toggleButton);
          $scope.$toggleButton.on('shown.bs.popover', function(evt) {
            var popoverObject = angular.element(evt.target).data('bs.popover'),
              $tooltip,
              popover;
            $tooltip = popoverObject && popoverObject.$tip;
            popover = $tooltip && $tooltip[0];
            if (popover) {
              createAndActivateFocusTrap(popover);
            }
            snCustomEvent.fire('shown.complexpopover.' + $scope.ref, $scope.$toggleButton);
          });
          $scope.$toggleButton.on('hide.bs.popover', function() {
            deactivateAndDestroyFocusTrap().finally(function() {
              $scope.$toggleButton.focus();
            });
          });
        }, 0);
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/service.snComplexPopoverService.js */
angular.module('sn.common.ui.popover').service('snComplexPopoverService', function($http, $q, $templateCache) {
  "use strict";
  return {
    getTemplate: getTemplate
  };

  function getTemplate(template) {
    return $http.get(template, {
      cache: $templateCache
    });
  }
});;;
/*! RESOURCE: /scripts/sn/common/ui/directive.snConfirmModal.js */
angular.module('sn.common.ui').directive('snConfirmModal', function(getTemplateUrl) {
  return {
    templateUrl: getTemplateUrl('sn_confirm_modal.xml'),
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      config: '=?',
      modalName: '@',
      title: '@?',
      message: '@?',
      cancelButton: '@?',
      okButton: '@?',
      alertButton: '@?',
      cancel: '&?',
      ok: '&?',
      alert: '&?'
    },
    link: function(scope, element) {
      element.find('.modal').remove();
    },
    controller: function($scope, $rootScope) {
      $scope.config = $scope.config || {};

      function Button(fn, text) {
        return {
          fn: fn,
          text: text
        }
      }
      var buttons = {
        'cancelButton': new Button('cancel', 'Cancel'),
        'okButton': new Button('ok', 'OK'),
        'alertButton': new Button('alert', 'Close'),
        getText: function(type) {
          var button = this[type];
          if (button && $scope.get(button.fn))
            return button.text;
        }
      };
      $scope.get = function(type) {
        if ($scope.config[type])
          return $scope.config[type];
        if (!$scope[type]) {
          var text = buttons.getText(type);
          if (text)
            return $scope.config[type] = text;
        }
        return $scope.config[type] = $scope[type];
      };
      if (!$scope.get('modalName'))
        $scope.config.modalName = 'confirm-modal';

      function call(type) {
        var action = $scope.get(type);
        if (action) {
          if (angular.isFunction(action))
            action();
          return true;
        }
        return !!buttons.getText(type);
      }
      $scope.cancelPressed = close('cancel');
      $scope.okPressed = close('ok');
      $scope.alertPressed = close('alert');

      function close(type) {
        return function() {
          actionClosed = true;
          $rootScope.$broadcast('dialog.' + $scope.config.modalName + '.close');
          call(type);
        }
      }
      var actionClosed;
      $scope.$on('dialog.' + $scope.get('modalName') + '.opened', function() {
        actionClosed = false;
      });
      $scope.$on('dialog.' + $scope.get('modalName') + '.closed', function() {
        if (actionClosed)
          return;
        if (call('cancel'))
          return;
        if (call('alert'))
          return;
        call('ok');
      });
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snContextMenu.js */
angular.module('sn.common.ui').directive('contextMenu', function($document, $window, snCustomEvent) {
  var $contextMenu, $ul;
  var scrollHeight = angular.element("body").get(0).scrollHeight;
  var contextMenuItemHeight = 0;
  var $triggeringElement;
  var _focusTrap;

  function setContextMenuPosition(event, $ul) {
    if (!event.pageX && event.originalEvent.changedTouches)
      event = event.originalEvent.changedTouches[0];
    if (contextMenuItemHeight === 0)
      contextMenuItemHeight = 24;
    var cmWidth = 150;
    var cmHeight = contextMenuItemHeight * $ul.children().length;
    var pageX = event.pageX;
    var pageY = event.pageY;
    if (!pageX) {
      var rect = event.target.getBoundingClientRect();
      pageX = rect.left + angular.element(event.target).width();
      pageY = rect.top + angular.element(event.target).height();
    }
    var startX = pageX + cmWidth >= $window.innerWidth ? pageX - cmWidth : pageX;
    var startY = pageY + cmHeight >= $window.innerHeight ? pageY - cmHeight : pageY;
    $ul.css({
      display: 'block',
      position: 'absolute',
      left: startX,
      top: startY
    });
  }

  function renderContextMenuItems($scope, event, options) {
    $ul.empty();
    angular.forEach(options, function(item) {
      var $li = angular.element('<li role="presentation">');
      if (item === null) {
        $li.addClass('divider');
      } else {
        var $a = angular.element('<a role="menuitem" href="javascript:void(0)">');
        $a.text(typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope));
        $li.append($a);
        $li.on('click', function($event) {
          $event.preventDefault();
          $scope.$apply(function() {
            _clearContextMenus(event);
            item[1].call($scope, $scope);
          });
        });
      }
      $ul.append($li);
    });
    setContextMenuPosition(event, $ul);
  }
  var renderContextMenu = function($scope, event, options) {
    angular.element(event.currentTarget).addClass('context');
    $contextMenu = angular.element('<div>', {
      'class': 'dropdown clearfix context-dropdown open'
    });
    $contextMenu.on('click', function(e) {
      if (angular.element(e.target).hasClass('dropdown')) {
        _clearContextMenus(event);
      }
    });
    $contextMenu.on('contextmenu', function(event) {
      event.preventDefault();
      _clearContextMenus(event);
    });
    $contextMenu.on('keydown', function(event) {
      if (event.keyCode != 27 && event.keyCode != 9)
        return;
      event.preventDefault();
      _clearContextMenus(event);
    });
    $contextMenu.css({
      position: 'absolute',
      top: 0,
      height: angular.element("body").get(0).scrollHeight,
      left: 0,
      right: 0,
      zIndex: 9999
    });
    $document.find('body').append($contextMenu);
    $ul = angular.element('<ul>', {
      'class': 'dropdown-menu',
      'role': 'menu'
    });
    renderContextMenuItems($scope, event, options);
    $contextMenu.append($ul);
    $triggeringElement = document.activeElement;
    activateFocusTrap();
    $contextMenu.data('resizeHandler', function() {
      scrollHeight = angular.element("body").get(0).scrollHeight;
      $contextMenu.css('height', scrollHeight);
    });
    snCustomEvent.observe('partial.page.reload', $contextMenu.data('resizeHandler'));
  };

  function _clearContextMenus(event) {
    if (!event)
      return;
    angular.element(event.currentTarget).removeClass('context');
    var els = angular.element(".context-dropdown");
    angular.forEach(els, function(el) {
      snCustomEvent.un('partial.page.reload', angular.element(el).data('resizeHandler'));
      angular.element(el).remove();
    });
    deactivateFocusTrap();
  }

  function activateFocusTrap() {
    if (_focusTrap || !window.focusTrap)
      return;
    _focusTrap = focusTrap($contextMenu[0], {
      focusOutsideDeactivates: true,
      clickOutsideDeactivates: true
    });
    _focusTrap.activate();
  }

  function deactivateFocusTrap() {
    if (!_focusTrap || !window.focusTrap)
      return;
    _focusTrap.deactivate();
    _focusTrap = null;
  }
  return function(scope, element, attrs) {
    element.on('contextmenu', function(event) {
      if (event.ctrlKey)
        return;
      if (angular.element(element).attr('context-type'))
        return;
      showMenu(event);
    });
    element.on('click', handleClick);
    element.on('keydown', function(event) {
      if (event.keyCode == 32) {
        handleSpace(event);
      } else if (event.keyCode === 13) {
        handleClick(event);
      }
    });
    var doubleTapTimeout,
      doubleTapActive = false,
      doubleTapStartPosition;
    element.on('touchstart', function(event) {
      doubleTapStartPosition = {
        x: event.originalEvent.changedTouches[0].screenX,
        y: event.originalEvent.changedTouches[0].screenY
      };
    });
    element.on('touchend', function(event) {
      var distX = Math.abs(event.originalEvent.changedTouches[0].screenX - doubleTapStartPosition.x);
      var distY = Math.abs(event.originalEvent.changedTouches[0].screenY - doubleTapStartPosition.y);
      if (distX > 15 || distY > 15) {
        doubleTapStartPosition = null;
        return;
      }
      if (doubleTapActive) {
        doubleTapActive = false;
        clearTimeout(doubleTapTimeout);
        showMenu(event);
        event.preventDefault();
        return;
      }
      doubleTapActive = true;
      event.preventDefault();
      doubleTapTimeout = setTimeout(function() {
        doubleTapActive = false;
        if (event.target)
          event.target.click();
      }, 300);
    });

    function handleSpace(evt) {
      var $target = angular.element(evt.target);
      if ($target.is('button, [role=button]')) {
        handleClick(evt);
        return;
      }
      if (!$target.hasClass('list-edit-cursor'))
        return;
      showMenu(evt);
    }

    function handleClick(event) {
      var $el = angular.element(element);
      var $target = angular.element(event.target);
      if (!$el.attr('context-type') && !$target.hasClass('context-menu-click'))
        return;
      showMenu(event);
    }

    function showMenu(evt) {
      scope.$apply(function() {
        applyMenu(evt);
        clearWindowSelection();
      });
    }

    function clearWindowSelection() {
      if (window.getSelection)
        if (window.getSelection().empty)
          window.getSelection().empty();
        else if (window.getSelection().removeAllRanges)
        window.getSelection().removeAllRanges();
      else if (document.selection)
        document.selection.empty();
    }

    function applyMenu(event) {
      var tagName = event.target.tagName;
      if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'BUTTON') {
        return;
      }
      var menu = scope.$eval(attrs.contextMenu, {
        event: event
      });
      if (menu instanceof Array) {
        if (menu.length > 0) {
          event.stopPropagation();
          event.preventDefault();
          scope.$watch(function() {
            return menu;
          }, function(newValue, oldValue) {
            if (newValue !== oldValue) renderContextMenuItems(scope, event, menu);
          }, true);
          renderContextMenu(scope, event, menu);
        }
      } else if (typeof menu !== 'undefined' && typeof menu.then === 'function') {
        event.stopPropagation();
        event.preventDefault();
        menu.then(function(response) {
          var contextMenu = response;
          if (contextMenu.length > 0) {
            scope.$watch(function() {
              return contextMenu;
            }, function(newValue, oldValue) {
              if (newValue !== oldValue)
                renderContextMenuItems(scope, event, contextMenu);
            }, true);
            renderContextMenu(scope, event, contextMenu);
          } else {
            throw '"' + attrs.contextMenu + '" is not an array or promise';
          }
        });
      } else {
        throw '"' + attrs.contextMenu + '" is not an array or promise';
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snDialog.js */
angular.module("sn.common.ui").directive("snDialog", function($timeout, $rootScope, $document) {
  "use strict";
  return {
    restrict: "AE",
    transclude: true,
    scope: {
      modal: "=?",
      disableAutoFocus: "=?",
      classCheck: "="
    },
    replace: true,
    template: '<dialog ng-keyup="escape($event)"><div ng-click="onClickClose()" title="Close" class="close-button icon-button icon-cross"></div></dialog>',
    link: function(scope, element, attrs, ctrl, transcludeFn) {
      var transcludeScope = {};
      scope.isOpen = function() {
        return element[0].open;
      };
      transcludeFn(element.scope().$new(), function(a, b) {
        element.append(a);
        transcludeScope = b;
      });
      element.click(function(event) {
        event.stopPropagation();
        if (event.offsetX < 0 || event.offsetX > element[0].offsetWidth || event.offsetY < 0 || event.offsetY > element[0].offsetHeight)
          if (!scope.classCheck)
            scope.onClickClose();
          else {
            var classes = scope.classCheck.split(",");
            var found = false;
            for (var i = 0; i < classes.length; i++)
              if (angular.element(event.target).closest(classes[i]).length > 0)
                found = true;
            if (!found)
              scope.onClickClose();
          }
      });
      scope.show = function() {
        var d = element[0];
        if (!d.showModal || true) {
          dialogPolyfill.registerDialog(d);
          d.setDisableAutoFocus(scope.disableAutoFocus);
        }
        if (scope.modal)
          d.showModal();
        else
          d.show();
        if (!angular.element(d).hasClass('sn-alert')) {
          $timeout(function() {
            if (d.dialogPolyfillInfo && d.dialogPolyfillInfo.backdrop) {
              angular.element(d.dialogPolyfillInfo.backdrop).one('click', function(event) {
                if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
                  scope.onClickClose();
              })
            } else {
              $document.on('click', function(event) {
                if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
                  scope.onClickClose();
              })
            }
          });
        }
        element.find('.btn-primary').eq(0).focus();
      };
      scope.setPosition = function(data) {
        var contextData = scope.getContextData(data);
        if (contextData && element && element[0]) {
          if (contextData.position) {
            element[0].style.top = contextData.position.top + "px";
            element[0].style.left = contextData.position.left + "px";
            element[0].style.margin = "0px";
          }
          if (contextData.dimensions) {
            element[0].style.width = contextData.dimensions.width + "px";
            element[0].style.height = contextData.dimensions.height + "px";
          }
        }
      }
      scope.$on("dialog." + attrs.name + ".move", function(event, data) {
        scope.setPosition(data);
      })
      scope.$on("dialog." + attrs.name + ".show", function(event, data) {
        scope.setPosition(data);
        scope.setKeyEvents(data);
        if (scope.isOpen() === true)
          scope.close();
        else
          scope.show();
        angular.element(".sn-dialog-menu").each(function(index, value) {
          var name = angular.element(this).attr('name');
          if (name != attrs.name && !angular.element(this).attr('open')) {
            return true;
          }
          if (name != attrs.name && angular.element(this).attr('open')) {
            $rootScope.$broadcast("dialog." + name + ".close");
          }
        });
      })
      scope.onClickClose = function() {
        if (scope.isOpen())
          $rootScope.$broadcast("dialog." + attrs.name + ".close");
      }
      scope.escape = function($event) {
        if ($event.keyCode === 27) {
          scope.onClickClose();
        }
      };
      scope.close = function() {
        var d = element[0];
        d.close();
        scope.removeListeners();
      }
      scope.ok = function(contextData) {
        contextData.ok();
        scope.removeListeners();
      }
      scope.cancel = function(contextData) {
        contextData.cancel();
        scope.removeListeners();
      }
      scope.removeListeners = function() {
        element[0].removeEventListener("ok", scope.handleContextOk, false);
        element[0].removeEventListener("cancel", scope.handleContextCancel, false);
      }
      scope.setKeyEvents = function(data) {
        var contextData = scope.getContextData(data);
        if (contextData && contextData.cancel) {
          scope.handleContextOk = function() {
            scope.ok(contextData);
          }
          scope.handleContextCancel = function() {
            scope.cancel(contextData);
          }
          element[0].addEventListener("ok", scope.handleContextOk, false);
          element[0].addEventListener("cancel", scope.handleContextCancel, false);
        }
      }
      scope.getContextData = function(data) {
        var context = attrs.context;
        var contextData = null;
        if (context && data && context in data) {
          contextData = data[context];
          transcludeScope[context] = contextData;
        }
        return contextData;
      }
      scope.$on("dialog." + attrs.name + ".close", scope.close);
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snFlyout.js */
angular.module('sn.common.ui').directive('snFlyout', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    replace: 'true',
    templateUrl: getTemplateUrl('sn_flyout.xml'),
    scope: true,
    link: function($scope, element, attrs) {
      $scope.open = false;
      $scope.more = false;
      $scope.position = attrs.position || 'left';
      $scope.flyoutControl = attrs.control;
      $scope.register = attrs.register;
      var body = angular.element('.flyout-body', element);
      var header = angular.element('.flyout-header', element);
      var tabs = angular.element('.flyout-tabs', element);
      var distance = 0;
      var position = $scope.position;
      var options = {
        duration: 800,
        easing: 'easeOutBounce'
      }
      var animation = {};
      if ($scope.flyoutControl) {
        $('.flyout-handle', element).hide();
        var controls = angular.element('#' + $scope.flyoutControl);
        controls.click(function() {
          angular.element(this).trigger("snFlyout.open");
        });
        controls.on('snFlyout.open', function() {
          $scope.$apply(function() {
            $scope.open = !$scope.open;
          });
        });
      }
      var animate = function() {
        element.velocity(animation, options);
      }
      var setup = function() {
        animation[position] = -distance;
        if ($scope.open)
          element.css(position, 0);
        else
          element.css(position, -distance);
      }
      var calculatePosition = function() {
        if ($scope.open) {
          animation[position] = 0;
        } else {
          if ($scope.position === 'left' || $scope.position === 'right')
            animation[position] = -body.outerWidth();
          else
            animation[position] = -body.outerHeight();
        }
      }
      $scope.$watch('open', function(newValue, oldValue) {
        if (newValue === oldValue)
          return;
        calculatePosition();
        animate();
      });
      $scope.$watch('more', function(newValue, oldValue) {
        if (newValue === oldValue)
          return;
        var moreAnimation = {};
        if ($scope.more) {
          element.addClass('fly-double');
          moreAnimation = {
            width: body.outerWidth() * 2
          };
        } else {
          element.removeClass('fly-double');
          moreAnimation = {
            width: body.outerWidth() / 2
          };
        }
        body.velocity(moreAnimation, options);
        header.velocity(moreAnimation, options);
      });
      if ($scope.position === 'left' || $scope.position === 'right') {
        $scope.$watch(element[0].offsetWidth, function() {
          element.addClass('fly-from-' + $scope.position);
          distance = body.outerWidth();
          setup();
        });
      } else if ($scope.position === 'top' || $scope.position === 'bottom') {
        $scope.$watch(element[0].offsetWidth, function() {
          element.addClass('fly-from-' + $scope.position);
          distance = body.outerHeight() + header.outerHeight();
          setup();
        });
      }
      $scope.$on($scope.register + ".bounceTabByIndex", function(event, index) {
        $scope.bounceTab(index);
      });
      $scope.$on($scope.register + ".bounceTab", function(event, tab) {
        $scope.bounceTab($scope.tabs.indexOf(tab));
      });
      $scope.$on($scope.register + ".selectTabByIndex", function(event, index) {
        $scope.selectTab($scope.tabs[index]);
      });
      $scope.$on($scope.register + ".selectTab", function(event, tab) {
        $scope.selectTab(tab);
      });
    },
    controller: function($scope, $element) {
      $scope.tabs = [];
      var baseColor, highLightColor;
      $scope.selectTab = function(tab) {
        if ($scope.selectedTab)
          $scope.selectedTab.selected = false;
        tab.selected = true;
        $scope.selectedTab = tab;
        normalizeTab($scope.tabs.indexOf(tab));
      }

      function expandTab(tabElem) {
        tabElem.queue("tabBounce", function(next) {
          tabElem.velocity({
            width: ["2.5rem", "2.125rem"],
            backgroundColorRed: [highLightColor[0], baseColor[0]],
            backgroundColorGreen: [highLightColor[1], baseColor[1]],
            backgroundColorBlue: [highLightColor[2], baseColor[2]]
          }, {
            easing: "easeInExpo",
            duration: 250
          });
          next();
        });
      }

      function contractTab(tabElem) {
        tabElem.queue("tabBounce", function(next) {
          tabElem.velocity({
            width: ["2.125rem", "2.5rem"],
            backgroundColorRed: [baseColor[0], highLightColor[0]],
            backgroundColorGreen: [baseColor[1], highLightColor[1]],
            backgroundColorBlue: [baseColor[2], highLightColor[2]]
          }, {
            easing: "easeInExpo",
            duration: 250
          });
          next();
        });
      }
      $scope.bounceTab = function(index) {
        if (index >= $scope.tabs.length || index < 0)
          return;
        var tabScope = $scope.tabs[index];
        if (!tabScope.selected) {
          var tabElem = $element.find('.flyout-tab').eq(index);
          if (!baseColor) {
            baseColor = tabElem.css('backgroundColor').match(/[0-9]+/g);
            for (var i = 0; i < baseColor.length; i++)
              baseColor[i] = parseInt(baseColor[i], 10);
          }
          if (!highLightColor)
            highLightColor = invertColor(baseColor);
          if (tabScope.highlighted)
            contractTab(tabElem);
          for (var i = 0; i < 2; i++) {
            expandTab(tabElem);
            contractTab(tabElem);
          }
          expandTab(tabElem);
          tabElem.dequeue("tabBounce");
          tabScope.highlighted = true;
        }
      }
      $scope.toggleOpen = function() {
        $scope.open = !$scope.open;
      }
      this.addTab = function(tab) {
        $scope.tabs.push(tab);
        if ($scope.tabs.length === 1)
          $scope.selectTab(tab)
      }

      function normalizeTab(index) {
        if (index < 0 || index >= $scope.tabs.length || !$scope.tabs[index].highlighted)
          return;
        var tabElem = $element.find('.flyout-tab').eq(index);
        tabElem.velocity({
          width: ["2.125rem", "2.5rem"]
        }, {
          easing: "easeInExpo",
          duration: 250
        });
        tabElem.css('backgroundColor', '');
        $scope.tabs[index].highlighted = false;
      }

      function invertColor(rgb) {
        if (typeof rgb === "string")
          var color = rgb.match(/[0-9]+/g);
        else
          var color = rgb.slice(0);
        for (var i = 0; i < color.length; i++)
          color[i] = 255 - parseInt(color[i], 10);
        return color;
      }
    }
  }
}).directive("snFlyoutTab", function() {
  "use strict";
  return {
    restrict: "E",
    require: "^snFlyout",
    replace: true,
    scope: true,
    transclude: true,
    template: "<div ng-show='selected' ng-transclude='' style='height: 100%'></div>",
    link: function(scope, element, attrs, flyoutCtrl) {
      flyoutCtrl.addTab(scope);
    }
  }
});
/*! RESOURCE: /scripts/sn/common/ui/directive.snModal.js */
angular.module("sn.common.ui").directive("snModal", function($timeout, $rootScope) {
  "use strict";
  return {
    restrict: "AE",
    transclude: true,
    scope: {},
    replace: true,
    template: '<div tabindex="-1" aria-hidden="true" class="modal" role="dialog"></div>',
    link: function(scope, element, attrs, ctrl, transcludeFn) {
      var transcludeScope = {};
      transcludeFn(element.scope().$new(), function(a, b) {
        element.append(a);
        transcludeScope = b;
      });
      scope.$on("dialog." + attrs.name + ".show", function(event, data) {
        if (!isOpen())
          show(data);
      });
      scope.$on("dialog." + attrs.name + ".close", function() {
        if (isOpen())
          close();
      });

      function eventFn(eventName) {
        return function(e) {
          $rootScope.$broadcast("dialog." + attrs.name + "." + eventName, e);
        }
      }
      var events = {
        'shown.bs.modal': eventFn("opened"),
        'hide.bs.modal': eventFn("hide"),
        'hidden.bs.modal': eventFn("closed")
      };

      function show(data) {
        var context = attrs.context;
        var contextData = null;
        if (context && data && context in data) {
          contextData = data[context];
          transcludeScope[context] = contextData;
        }
        $timeout(function() {
          angular.element('.sn-popover-basic').each(function() {
            var $this = angular.element(this);
            if (angular.element($this.attr('data-target')).is(':visible')) {
              $this.popover('hide');
            }
          });
        });
        element.modal('show');
        for (var event in events)
          if (events.hasOwnProperty(event))
            element.on(event, events[event]);
        if (attrs.moveBackdrop == 'true')
          moveBackdrop(element);
      }

      function close() {
        element.modal('hide');
        for (var event in events)
          if (events.hasOwnProperty(event))
            element.off(event, events[event]);
      }

      function isOpen() {
        return element.hasClass('in');
      }

      function moveBackdrop(element) {
        var backdrop = element.data('bs.modal').$backdrop;
        if (!backdrop)
          return;
        element.after(backdrop.remove());
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snModalShow.js */
angular.module('sn.common.ui').directive('snModalShow', function() {
  "use strict";
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.click(function() {
        showDialog();
      });

      function showDialog() {
        scope.$broadcast('dialog.' + attrs.snModalShow + '.show');
      }
      if (window.SingletonKeyboardRegistry) {
        SingletonKeyboardRegistry.getInstance().bind('ctrl + alt + i', function() {
          scope.$broadcast('dialog.impersonate.show');
        }).selector(null, true);
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snTabs.js */
angular.module('sn.common.ui').directive('snTabs', function() {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    replace: 'true',
    scope: {
      tabData: '='
    },
    link: function($scope, element, attrs) {
      $scope.tabClass = attrs.tabClass;
      $scope.register = attrs.register;
      attrs.$observe('register', function(value) {
        $scope.register = value;
        $scope.setupListeners();
      });
      $scope.bounceTab = function() {
        angular.element()
      }
    },
    controller: 'snTabs'
  }
}).controller('snTabs', function($scope, $rootScope) {
  $scope.selectedTabIndex = 0;
  $scope.tabData[$scope.selectedTabIndex].selected = true;
  $scope.setupListeners = function() {
    $scope.$on($scope.register + '.selectTabByIndex', function(event, index) {
      $scope.selectTabByIndex(event, index);
    });
  }
  $scope.selectTabByIndex = function(event, index) {
    if (index === $scope.selectedTabIndex)
      return;
    if (event.stopPropagation)
      event.stopPropagation();
    $scope.tabData[$scope.selectedTabIndex].selected = false;
    $scope.tabData[index].selected = true;
    $scope.selectedTabIndex = index;
    $rootScope.$broadcast($scope.register + '.selectTabByIndex', $scope.selectedTabIndex);
  }
}).directive('snTab', function() {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    replace: 'true',
    scope: {
      tabData: '=',
      index: '='
    },
    template: '',
    controller: 'snTab',
    link: function($scope, element, attrs) {
      $scope.register = attrs.register;
      attrs.$observe('register', function(value) {
        $scope.register = value;
        $scope.setupListeners();
      });
      $scope.bounceTab = function() {
        alert('Bounce Tab at Index: ' + $scope.index);
      }
    }
  }
}).controller('snTab', function($scope) {
  $scope.selectTabByIndex = function(index) {
    $scope.$emit($scope.register + '.selectTabByIndex', index);
  }
  $scope.setupListeners = function() {
    $scope.$on($scope.register + '.showTabActivity', function(event, index, type) {
      $scope.showTabActivity(index, type);
    });
  }
  $scope.showTabActivity = function(index, type) {
    if ($scope.index !== index)
      return;
    switch (type) {
      case 'message':
        break;
      case 'error':
        break;
      default:
        $scope.bounceTab();
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snTextExpander.js */
angular.module('sn.common.ui').directive('snTextExpander', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('sn_text_expander.xml'),
    scope: {
      maxHeight: '&',
      value: '='
    },
    link: function compile(scope, element, attrs) {
      var container = angular.element(element).find('.textblock-content-container');
      var content = angular.element(element).find('.textblock-content');
      if (scope.maxHeight() === undefined) {
        scope.maxHeight = function() {
          return 100;
        }
      }
      container.css('overflow-y', 'hidden');
      container.css('max-height', scope.maxHeight() + 'px');
    },
    controller: function($scope, $element) {
      var container = $element.find('.textblock-content-container');
      var content = $element.find('.textblock-content');
      $scope.value = $scope.value || '';
      $scope.toggleExpand = function() {
        $scope.showMore = !$scope.showMore;
        if ($scope.showMore) {
          container.css('max-height', content.height());
        } else {
          container.css('max-height', $scope.maxHeight());
        }
      };
      $timeout(function() {
        if (content.height() > $scope.maxHeight()) {
          $scope.showToggle = true;
          $scope.showMore = false;
        }
      });
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snAttachmentPreview.js */
angular.module('sn.common.ui').directive('snAttachmentPreview', function(getTemplateUrl, snCustomEvent) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_attachment_preview.xml'),
    controller: function($scope) {
      snCustomEvent.observe('sn.attachment.preview', function(evt, attachment) {
        if (evt.stopPropagation)
          evt.stopPropagation();
        if (evt.preventDefault)
          evt.preventDefault();
        $scope.image = attachment;
        $scope.$broadcast('dialog.attachment_preview.show');
        return false;
      });
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/service.progressDialog.js */
angular.module('sn.common.ui').factory('progressDialog', ['$rootScope', '$compile', '$timeout', '$http', '$templateCache', 'nowServer', 'i18n', function($rootScope, $compile, $timeout, $http, $templateCache, nowServer, i18n) {
  'use strict';
  i18n.getMessages(['Close']);
  return {
    STATES: ["Pending", "Running", "Succeeded", "Failed", "Cancelled"],
    STATUS_IMAGES: ["images/workflow_skipped.gif", "images/loading_anim2.gifx",
      "images/progress_success.png", "images/progress_failure.png",
      'images/request_cancelled.gif'
    ],
    EXPAND_IMAGE: "images/icons/filter_hide.gif",
    COLLAPSE_IMAGE: "images/icons/filter_reveal.gif",
    BACK_IMAGE: "images/activity_filter_off.gif",
    TIMEOUT_INTERVAL: 750,
    _findChildMessage: function(statusObject) {
      if (!statusObject.children) return null;
      for (var i = 0; i < statusObject.children.length; i++) {
        var child = statusObject.children[i];
        if (child.state == '1') {
          var msg = child.message;
          var submsg = this._findChildMessage(child);
          if (submsg == null)
            return msg;
          else
            return null;
        } else if (child.state == '0') {
          return null;
        } else {}
      }
      return null;
    },
    create: function(scope, elemid, title, startCallback, endCallback, closeCallback) {
      var namespace = this;
      var progressItem = scope.$new(true);
      progressItem.id = elemid + "_progressDialog";
      progressItem.overlayVisible = true;
      progressItem.state = 0;
      progressItem.message = '';
      progressItem.percentComplete = 0;
      progressItem.enableChildMessages = false;
      if (!title) title = '';
      progressItem.title = title;
      progressItem.button_close = i18n.getMessage('Close');
      var overlayElement;
      overlayElement = $compile(
        '<div id="{{id}}" ng-show="overlayVisible" class="modal modal-mask" role="dialog" tabindex="-1">' +
        '<div class="modal-dialog m_progress_overlay_content">' +
        '<div class="modal-content">' +
        '<header class="modal-header">' +
        '<h4 class="modal-title">{{title}}</h4>' +
        '</header>' +
        '<div class="modal-body">' +
        '<div class="progress" ng-class="{\'progress-danger\': (state == 3)}">' +
        '<div class="progress-bar" ng-class="{\'progress-bar-danger\': (state == 3)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{percentComplete}}" ng-style="{width: percentComplete + \'%\'}">' +
        '</div>' +
        '</div>' +
        '<div>{{message}}<span style="float: right;" ng-show="state==1 || state == 2">{{percentComplete}}%</span></div>' +
        '</div>' +
        '<footer class="modal-footer">' +
        '<button class="btn btn-default sn-button sn-button-normal" ng-click="close()" ng-show="state > 1">{{button_close}}</button>' +
        '</footer>' +
        '</div>' +
        '</div>' +
        '</div>')(progressItem);
      $("body")[0].appendChild(overlayElement[0]);
      progressItem.setEnableChildMessages = function(enableChildren) {
        progressItem.enableChildMessages = enableChildren;
      }
      progressItem.start = function(src, dataArray) {
        $http.post(src, dataArray).success(function(response) {
            progressItem.trackerId = response.sys_id;
            try {
              if (startCallback) startCallback(response);
            } catch (e) {}
            $timeout(progressItem.checkProgress.bind(progressItem));
          })
          .error(function(response, status, headers, config) {
            progressItem.state = '3';
            if (endCallback) endCallback(response);
          });
      };
      progressItem.checkProgress = function() {
        var src = nowServer.getURL('progress_status', {
          sysparm_execution_id: this.trackerId
        });
        $http.post(src).success(function(response) {
            if ($.isEmptyObject(response)) {
              progressItem.state = '3';
              if (endCallback) endCallback(response);
              return;
            }
            progressItem.update(response);
            if (response.status == 'error' || response.state == '') {
              progressItem.state = '3';
              if (response.message)
                progressItem.message = response.message;
              else
                progressItem.message = response;
              if (endCallback) endCallback(response);
              return;
            }
            if (response.state == '0' || response.state == '1') {
              $timeout(progressItem.checkProgress.bind(progressItem), namespace.TIMEOUT_INTERVAL);
            } else {
              if (endCallback) endCallback(response);
            }
          })
          .error(function(response, status, headers, config) {
            progressItem.state = '3';
            progressItem.message = response;
            if (endCallback) endCallback(response);
          });
      };
      progressItem.update = function(statusObject) {
        var msg = statusObject.message;
        if (progressItem.enableChildMessages) {
          var childMsg = namespace._findChildMessage(statusObject);
          if (childMsg != null)
            msg = childMsg;
        }
        this.message = msg;
        this.state = statusObject.state;
        this.percentComplete = statusObject.percent_complete;
      };
      progressItem.close = function(ev) {
        try {
          if (closeCallback) closeCallback();
        } catch (e) {}
        $("body")[0].removeChild($("#" + this.id)[0]);
        delete namespace.progressItem;
      };
      return progressItem;
    }
  }
}]);;
/*! RESOURCE: /scripts/sn/common/ui/factory.paneManager.js */
angular.module("sn.common.ui").factory("paneManager", ['$timeout', 'userPreferences', 'snCustomEvent', function($timeout, userPreferences, snCustomEvent) {
  "use strict";
  var paneIndex = {};

  function registerPane(paneName) {
    if (!paneName in paneIndex) {
      paneIndex[paneName] = false;
    }
    userPreferences.getPreference(paneName + '.opened').then(function(value) {
      var isOpen = value !== 'false';
      if (isOpen) {
        togglePane(paneName, false);
      }
    });
  }

  function togglePane(paneName, autoFocusPane) {
    for (var currentPane in paneIndex) {
      if (paneName != currentPane && paneIndex[currentPane]) {
        CustomEvent.fireTop(currentPane + '.toggle');
        saveState(currentPane, false);
      }
    }
    snCustomEvent.fireTop(paneName + '.toggle', false, autoFocusPane);
    saveState(paneName, !paneIndex[paneName]);
  };

  function saveState(paneName, state) {
    paneIndex[paneName] = state;
    userPreferences.setPreference(paneName + '.opened', state);
  }
  return {
    registerPane: registerPane,
    togglePane: togglePane
  };
}]);;
/*! RESOURCE: /scripts/sn/common/ui/directive.snBootstrapPopover.js */
angular.module('sn.common.ui').directive('snBootstrapPopover', function($timeout, $compile, $rootScope) {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.on('click.snBootstrapPopover', function(event) {
        $rootScope.$broadcast('sn-bootstrap-popover.close-other-popovers');
        createPopover(event);
      });
      element.on('keypress.snBootstrapPopover', function(event) {
        if (event.keyCode != 13 && event.keyCode != 32)
          return;
        if (event.keyCode === 32) {
          event.preventDefault();
        }
        scope.$broadcast('sn-bootstrap-popover.close-other-popovers');
        createPopover(event);
      });
      var popoverOpen = false;

      function _hidePopover() {
        popoverOpen = false;
        var api = element.data('bs.popover');
        if (api) {
          api.hide();
          element.off('.popover').removeData('bs.popover');
          element.data('bs.popover', void(0));
          element.focus();
        }
      }

      function _openPopover() {
        $timeout(function() {
          popoverOpen = true;
          element.on('hidden.bs.popover', function() {
            _hidePopover();
            popoverOpen = false;
          });
          element.popover('show');
          var popoverBody = angular.element(document.getElementById('sn-bootstrap-popover'));
          popoverBody.focus();
          popoverBody.on('keydown', function(e) {
            if (e.keyCode === 27) {
              popoverBody.off('keydown');
              _hidePopover();
            }
          });
        }, 0, false);
      }

      function createPopover(evt) {
        angular.element('.popover').each(function() {
          var object = angular.element(this);
          if (!object.is(evt.target) && object.has(evt.target).length === 0 && angular.element('.popover').has(evt.target).length === 0) {
            _hidePopover();
            object.popover('hide');
          }
        });
        if (scope.disablePopover || evt.keyCode === 9)
          return;
        if (popoverOpen) {
          _hidePopover();
          return;
        }
        var childScope = scope.$new();
        evt.stopPropagation();
        element.attr('data-toggle', 'popover');
        element.attr('data-trigger', 'focus');
        element.attr('tabindex', 0);
        angular.element(element).popover({
          container: 'body',
          placement: 'auto top',
          html: true,
          trigger: 'manual',
          content: $compile(scope.template)(childScope)
        });
        var wait = element.attr('popover-wait-event');
        if (wait)
          scope.$on(wait, _openPopover);
        else
          _openPopover();
        var bodyClickEvent = angular.element('body').on('click.snBootstrapPopover.body', function(evt) {
          angular.element('.popover').each(function() {
            var object = angular.element(this);
            if (!object.is(evt.target) && object.has(evt.target).length === 0 && angular.element('.popover').has(evt.target).length === 0) {
              bodyClickEvent.off();
              _hidePopover();
              childScope.$destroy();
            }
          })
        });
        element.on('$destroy', function() {
          bodyClickEvent.off();
          _hidePopover();
          childScope.$destroy();
        })
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snFocusEsc.js */
angular.module('sn.common.ui').directive('snFocusEsc', function($document) {
  'use strict';
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {
      $document.on('keyup', function($event) {
        if ($event.keyCode === 27) {
          var focusedElement = $event.target;
          if (focusedElement && element[0].contains(focusedElement)) {
            scope.$eval(attrs.snFocusEsc);
          }
        }
      });
    }
  };
});;;
/*! RESOURCE: /scripts/sn/common/stream/js_includes_stream.js */
/*! RESOURCE: /scripts/thirdparty/ment.io/mentio.js */
(function() {
  'use strict';
  angular.module('mentio', [])
    .directive('mentio', ['mentioUtil', '$document', '$compile', '$log', '$timeout',
      function(mentioUtil, $document, $compile, $log, $timeout) {
        return {
          restrict: 'A',
          scope: {
            macros: '=mentioMacros',
            search: '&mentioSearch',
            select: '&mentioSelect',
            items: '=mentioItems',
            typedTerm: '=mentioTypedTerm',
            altId: '=mentioId',
            iframeElement: '=mentioIframeElement',
            requireLeadingSpace: '=mentioRequireLeadingSpace',
            suppressTrailingSpace: '=mentioSuppressTrailingSpace',
            selectNotFound: '=mentioSelectNotFound',
            trimTerm: '=mentioTrimTerm',
            ngModel: '='
          },
          controller: ["$scope", "$timeout", "$attrs", function($scope, $timeout, $attrs) {
            $scope.query = function(triggerChar, triggerText) {
              var remoteScope = $scope.triggerCharMap[triggerChar];
              if ($scope.trimTerm === undefined || $scope.trimTerm) {
                triggerText = triggerText.trim();
              }
              remoteScope.showMenu();
              remoteScope.search({
                term: triggerText
              });
              remoteScope.typedTerm = triggerText;
            };
            $scope.defaultSearch = function(locals) {
              var results = [];
              angular.forEach($scope.items, function(item) {
                if (item.label.toUpperCase().indexOf(locals.term.toUpperCase()) >= 0) {
                  results.push(item);
                }
              });
              $scope.localItems = results;
            };
            $scope.bridgeSearch = function(termString) {
              var searchFn = $attrs.mentioSearch ? $scope.search : $scope.defaultSearch;
              searchFn({
                term: termString
              });
            };
            $scope.defaultSelect = function(locals) {
              return $scope.defaultTriggerChar + locals.item.label;
            };
            $scope.bridgeSelect = function(itemVar) {
              var selectFn = $attrs.mentioSelect ? $scope.select : $scope.defaultSelect;
              return selectFn({
                item: itemVar
              });
            };
            $scope.setTriggerText = function(text) {
              if ($scope.syncTriggerText) {
                $scope.typedTerm = ($scope.trimTerm === undefined || $scope.trimTerm) ? text.trim() : text;
              }
            };
            $scope.context = function() {
              if ($scope.iframeElement) {
                return {
                  iframe: $scope.iframeElement
                };
              }
            };
            $scope.replaceText = function(text, hasTrailingSpace) {
              $scope.hideAll();
              mentioUtil.replaceTriggerText($scope.context(), $scope.targetElement, $scope.targetElementPath,
                $scope.targetElementSelectedOffset, $scope.triggerCharSet, text, $scope.requireLeadingSpace,
                hasTrailingSpace, $scope.suppressTrailingSpace);
              if (!hasTrailingSpace) {
                $scope.setTriggerText('');
                angular.element($scope.targetElement).triggerHandler('change');
                if ($scope.isContentEditable()) {
                  $scope.contentEditableMenuPasted = true;
                  var timer = $timeout(function() {
                    $scope.contentEditableMenuPasted = false;
                  }, 200);
                  $scope.$on('$destroy', function() {
                    $timeout.cancel(timer);
                  });
                }
              }
            };
            $scope.hideAll = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  $scope.triggerCharMap[key].hideMenu();
                }
              }
            };
            $scope.getActiveMenuScope = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  if ($scope.triggerCharMap[key].visible) {
                    return $scope.triggerCharMap[key];
                  }
                }
              }
              return null;
            };
            $scope.selectActive = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  if ($scope.triggerCharMap[key].visible) {
                    $scope.triggerCharMap[key].selectActive();
                  }
                }
              }
            };
            $scope.isActive = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  if ($scope.triggerCharMap[key].visible) {
                    return true;
                  }
                }
              }
              return false;
            };
            $scope.isContentEditable = function() {
              return ($scope.targetElement.nodeName !== 'INPUT' && $scope.targetElement.nodeName !== 'TEXTAREA');
            };
            $scope.replaceMacro = function(macro, hasTrailingSpace) {
              if (!hasTrailingSpace) {
                $scope.replacingMacro = true;
                $scope.timer = $timeout(function() {
                  mentioUtil.replaceMacroText($scope.context(), $scope.targetElement,
                    $scope.targetElementPath, $scope.targetElementSelectedOffset,
                    $scope.macros, $scope.macros[macro]);
                  angular.element($scope.targetElement).triggerHandler('change');
                  $scope.replacingMacro = false;
                }, 300);
                $scope.$on('$destroy', function() {
                  $timeout.cancel($scope.timer);
                });
              } else {
                mentioUtil.replaceMacroText($scope.context(), $scope.targetElement, $scope.targetElementPath,
                  $scope.targetElementSelectedOffset, $scope.macros, $scope.macros[macro]);
              }
            };
            $scope.addMenu = function(menuScope) {
              if (menuScope.parentScope && $scope.triggerCharMap.hasOwnProperty(menuScope.triggerChar)) {
                return;
              }
              $scope.triggerCharMap[menuScope.triggerChar] = menuScope;
              if ($scope.triggerCharSet === undefined) {
                $scope.triggerCharSet = [];
              }
              $scope.triggerCharSet.push(menuScope.triggerChar);
              menuScope.setParent($scope);
            };
            $scope.$on(
              'menuCreated',
              function(event, data) {
                if (
                  $attrs.id !== undefined ||
                  $attrs.mentioId !== undefined
                ) {
                  if (
                    $attrs.id === data.targetElement ||
                    (
                      $attrs.mentioId !== undefined &&
                      $scope.altId === data.targetElement
                    )
                  ) {
                    $scope.addMenu(data.scope);
                  }
                }
              }
            );
            $document.on(
              'click',
              function() {
                if ($scope.isActive()) {
                  $scope.$apply(function() {
                    $scope.hideAll();
                  });
                }
              }
            );
            $document.on(
              'keydown keypress paste',
              function(event) {
                var activeMenuScope = $scope.getActiveMenuScope();
                if (activeMenuScope) {
                  if (event.which === 9 || event.which === 13) {
                    event.preventDefault();
                    activeMenuScope.selectActive();
                  }
                  if (event.which === 27) {
                    event.preventDefault();
                    activeMenuScope.$apply(function() {
                      activeMenuScope.hideMenu();
                    });
                  }
                  if (event.which === 40) {
                    event.preventDefault();
                    activeMenuScope.$apply(function() {
                      activeMenuScope.activateNextItem();
                    });
                    activeMenuScope.adjustScroll(1);
                  }
                  if (event.which === 38) {
                    event.preventDefault();
                    activeMenuScope.$apply(function() {
                      activeMenuScope.activatePreviousItem();
                    });
                    activeMenuScope.adjustScroll(-1);
                  }
                  if (event.which === 37 || event.which === 39) {
                    event.preventDefault();
                  }
                }
              }
            );
          }],
          link: function(scope, element, attrs, $timeout) {
            scope.triggerCharMap = {};
            scope.targetElement = element;
            scope.scrollBarParents = element.parents().filter(function() {
              var overflow = angular.element(this).css("overflow");
              return this.scrollHeight > this.clientHeight && overflow !== "hidden" && overflow !== "visible";
            });
            scope.scrollPosition = null;
            attrs.$set('autocomplete', 'off');
            if (attrs.mentioItems) {
              scope.localItems = [];
              scope.parentScope = scope;
              var itemsRef = attrs.mentioSearch ? ' mentio-items="items"' : ' mentio-items="localItems"';
              scope.defaultTriggerChar = attrs.mentioTriggerChar ? scope.$eval(attrs.mentioTriggerChar) : '@';
              var html = '<mentio-menu' +
                ' mentio-search="bridgeSearch(term)"' +
                ' mentio-select="bridgeSelect(item)"' +
                itemsRef;
              if (attrs.mentioTemplateUrl) {
                html = html + ' mentio-template-url="' + attrs.mentioTemplateUrl + '"';
              }
              html = html + ' mentio-trigger-char="\'' + scope.defaultTriggerChar + '\'"' +
                ' mentio-parent-scope="parentScope"' +
                '/>';
              var linkFn = $compile(html);
              var el = linkFn(scope);
              element.parent().append(el);
              scope.$on('$destroy', function() {
                el.remove();
              });
            }
            if (attrs.mentioTypedTerm) {
              scope.syncTriggerText = true;
            }

            function keyHandler(event) {
              function stopEvent(event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
              }
              var activeMenuScope = scope.getActiveMenuScope();
              if (activeMenuScope) {
                if (event.which === 9 || event.which === 13) {
                  stopEvent(event);
                  activeMenuScope.selectActive();
                  return false;
                }
                if (event.which === 27) {
                  stopEvent(event);
                  activeMenuScope.$apply(function() {
                    activeMenuScope.hideMenu();
                  });
                  return false;
                }
                if (event.which === 40) {
                  stopEvent(event);
                  activeMenuScope.$apply(function() {
                    activeMenuScope.activateNextItem();
                  });
                  activeMenuScope.adjustScroll(1);
                  return false;
                }
                if (event.which === 38) {
                  stopEvent(event);
                  activeMenuScope.$apply(function() {
                    activeMenuScope.activatePreviousItem();
                  });
                  activeMenuScope.adjustScroll(-1);
                  return false;
                }
                if (event.which === 37 || event.which === 39) {
                  stopEvent(event);
                  return false;
                }
              }
            }
            scope.$watch(
              'iframeElement',
              function(newValue) {
                if (newValue) {
                  var iframeDocument = newValue.contentWindow.document;
                  iframeDocument.addEventListener('click',
                    function() {
                      if (scope.isActive()) {
                        scope.$apply(function() {
                          scope.hideAll();
                        });
                      }
                    }
                  );
                  iframeDocument.addEventListener('keydown', keyHandler, true);
                  scope.$on('$destroy', function() {
                    iframeDocument.removeEventListener('keydown', keyHandler);
                  });
                }
              }
            );
            scope.$watch(
              'ngModel',
              function(newValue) {
                if ((!newValue || newValue === '') && !scope.isActive()) {
                  return;
                }
                if (scope.triggerCharSet === undefined) {
                  $log.warn('Error, no mentio-items attribute was provided, ' +
                    'and no separate mentio-menus were specified.  Nothing to do.');
                  return;
                }
                if (scope.contentEditableMenuPasted) {
                  scope.contentEditableMenuPasted = false;
                  return;
                }
                if (scope.replacingMacro) {
                  $timeout.cancel(scope.timer);
                  scope.replacingMacro = false;
                }
                var isActive = scope.isActive();
                var isContentEditable = scope.isContentEditable();
                var mentionInfo = mentioUtil.getTriggerInfo(scope.context(), scope.triggerCharSet,
                  scope.requireLeadingSpace, isActive);
                if (mentionInfo !== undefined &&
                  (!isActive ||
                    (isActive &&
                      (
                        (isContentEditable && mentionInfo.mentionTriggerChar ===
                          scope.currentMentionTriggerChar) ||
                        (!isContentEditable && mentionInfo.mentionPosition ===
                          scope.currentMentionPosition)
                      )
                    )
                  )
                ) {
                  if (mentionInfo.mentionSelectedElement) {
                    scope.targetElement = mentionInfo.mentionSelectedElement;
                    scope.targetElementPath = mentionInfo.mentionSelectedPath;
                    scope.targetElementSelectedOffset = mentionInfo.mentionSelectedOffset;
                  }
                  scope.setTriggerText(mentionInfo.mentionText);
                  scope.currentMentionPosition = mentionInfo.mentionPosition;
                  scope.currentMentionTriggerChar = mentionInfo.mentionTriggerChar;
                  scope.query(mentionInfo.mentionTriggerChar, mentionInfo.mentionText);
                } else {
                  var currentTypedTerm = scope.typedTerm;
                  scope.setTriggerText('');
                  scope.hideAll();
                  var macroMatchInfo = mentioUtil.getMacroMatch(scope.context(), scope.macros);
                  if (macroMatchInfo !== undefined) {
                    scope.targetElement = macroMatchInfo.macroSelectedElement;
                    scope.targetElementPath = macroMatchInfo.macroSelectedPath;
                    scope.targetElementSelectedOffset = macroMatchInfo.macroSelectedOffset;
                    scope.replaceMacro(macroMatchInfo.macroText, macroMatchInfo.macroHasTrailingSpace);
                  } else if (scope.selectNotFound && currentTypedTerm && currentTypedTerm !== '') {
                    var lastScope = scope.triggerCharMap[scope.currentMentionTriggerChar];
                    if (lastScope) {
                      var text = lastScope.select({
                        item: {
                          label: currentTypedTerm
                        }
                      });
                      if (typeof text.then === 'function') {
                        text.then(scope.replaceText);
                      } else {
                        scope.replaceText(text, true);
                      }
                    }
                  }
                }
              }
            );
          }
        };
      }
    ])
    .directive('mentioMenu', ['mentioUtil', '$rootScope', '$log', '$window', '$document', '$timeout',
      function(mentioUtil, $rootScope, $log, $window, $document, $timeout) {
        return {
          restrict: 'E',
          scope: {
            search: '&mentioSearch',
            select: '&mentioSelect',
            items: '=mentioItems',
            triggerChar: '=mentioTriggerChar',
            forElem: '=mentioFor',
            parentScope: '=mentioParentScope'
          },
          templateUrl: function(tElement, tAttrs) {
            return tAttrs.mentioTemplateUrl !== undefined ? tAttrs.mentioTemplateUrl : 'mentio-menu.tpl.html';
          },
          controller: ["$scope", function($scope) {
            $scope.visible = false;
            this.activate = $scope.activate = function(item) {
              $scope.activeItem = item;
            };
            this.isActive = $scope.isActive = function(item) {
              return $scope.activeItem === item;
            };
            this.selectItem = $scope.selectItem = function(item) {
              if (item.termLengthIsZero) {
                item.name = $scope.triggerChar + $scope.typedTerm
              }
              var text = $scope.select({
                item: item
              });
              if (typeof text.then === 'function') {
                text.then($scope.parentMentio.replaceText);
              } else {
                $scope.parentMentio.replaceText(text);
              }
            };
            $scope.activateNextItem = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              this.activate($scope.items[(index + 1) % $scope.items.length]);
            };
            $scope.activatePreviousItem = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
            };
            $scope.isFirstItemActive = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              return index === 0;
            };
            $scope.isLastItemActive = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              return index === ($scope.items.length - 1);
            };
            $scope.selectActive = function() {
              $scope.selectItem($scope.activeItem);
            };
            $scope.isVisible = function() {
              return $scope.visible;
            };
            $scope.showMenu = function() {
              if (!$scope.visible) {
                $scope.menuElement.css("visibility", "visible");
                $scope.requestVisiblePendingSearch = true;
              }
            };
            $scope.setParent = function(scope) {
              $scope.parentMentio = scope;
              $scope.targetElement = scope.targetElement;
            };
            var scopeDuplicate = $scope;
            $rootScope.$on('mentio.closeMenu', function() {
              scopeDuplicate.hideMenu();
            })
          }],
          link: function(scope, element) {
            element[0].parentNode.removeChild(element[0]);
            $document[0].body.appendChild(element[0]);
            scope.menuElement = element;
            scope.menuElement.css("visibility", "hidden");
            if (scope.parentScope) {
              scope.parentScope.addMenu(scope);
            } else {
              if (!scope.forElem) {
                $log.error('mentio-menu requires a target element in tbe mentio-for attribute');
                return;
              }
              if (!scope.triggerChar) {
                $log.error('mentio-menu requires a trigger char');
                return;
              }
              $rootScope.$broadcast('menuCreated', {
                targetElement: scope.forElem,
                scope: scope
              });
            }
            angular.element($window).bind(
              'resize',
              function() {
                if (scope.isVisible()) {
                  var triggerCharSet = [];
                  triggerCharSet.push(scope.triggerChar);
                  mentioUtil.popUnderMention(scope.parentMentio.context(),
                    triggerCharSet, element, scope.requireLeadingSpace);
                }
              }
            );
            scope.$watch('items', function(items) {
              if (items && items.length > 0) {
                scope.activate(items[0]);
                if (!scope.visible && scope.requestVisiblePendingSearch) {
                  scope.visible = true;
                  scope.requestVisiblePendingSearch = false;
                }
                $timeout(function() {
                  var menu = element.find(".dropdown-menu");
                  if (menu.length > 0 && menu.offset().top < 0)
                    menu.addClass("reverse");
                }, 0, false);
              } else {
                scope.activate({
                  termLengthIsZero: true
                });
              }
            });
            scope.$watch('isVisible()', function(visible) {
              if (visible) {
                var triggerCharSet = [];
                triggerCharSet.push(scope.triggerChar);
                mentioUtil.popUnderMention(scope.parentMentio.context(),
                  triggerCharSet, element, scope.requireLeadingSpace);
              } else {
                element.find(".dropdown-menu").removeClass("reverse");
              }
            });
            var prevScroll;
            scope.parentMentio.scrollBarParents.each(function() {
              angular.element(this).on("scroll.mentio", function() {
                if (!prevScroll)
                  prevScroll = this.scrollTop;
                var scrollDiff = prevScroll - this.scrollTop;
                prevScroll = this.scrollTop;
                if (element[0].style["position"] === "absolute") {
                  element[0].style["z-index"] = 9;
                  element[0].style.top = (parseInt(element[0].style.top) + scrollDiff) + "px";
                }
              });
            });
            scope.parentMentio.$on('$destroy', function() {
              element.remove();
            });
            scope.hideMenu = function() {
              scope.visible = false;
              element.css('display', 'none');
            };
            scope.adjustScroll = function(direction) {
              var menuEl = element[0];
              var menuItemsList = menuEl.querySelector('ul');
              var menuItem = menuEl.querySelector('[mentio-menu-item].active');
              if (scope.isFirstItemActive()) {
                return menuItemsList.scrollTop = 0;
              } else if (scope.isLastItemActive()) {
                return menuItemsList.scrollTop = menuItemsList.scrollHeight;
              }
              if (direction === 1) {
                menuItemsList.scrollTop += menuItem.offsetHeight;
              } else {
                menuItemsList.scrollTop -= menuItem.offsetHeight;
              }
            };
          }
        };
      }
    ])
    .directive('mentioMenuItem', function() {
      return {
        restrict: 'A',
        scope: {
          item: '=mentioMenuItem'
        },
        require: '^mentioMenu',
        link: function(scope, element, attrs, controller) {
          scope.$watch(function() {
            return controller.isActive(scope.item);
          }, function(active) {
            if (active) {
              element.addClass('active');
            } else {
              element.removeClass('active');
            }
          });
          element.bind('mouseenter', function() {
            scope.$apply(function() {
              controller.activate(scope.item);
            });
          });
          element.bind('click', function() {
            controller.selectItem(scope.item);
            return false;
          });
        }
      };
    })
    .filter('unsafe', ["$sce", function($sce) {
      return function(val) {
        return $sce.trustAsHtml(val);
      };
    }])
    .filter('mentioHighlight', function() {
      function escapeRegexp(queryToEscape) {
        return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
      }
      return function(matchItem, query, hightlightClass) {
        if (query) {
          var replaceText = hightlightClass ?
            '<span class="' + hightlightClass + '">$&</span>' :
            '<strong>$&</strong>';
          return ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), replaceText);
        } else {
          return matchItem;
        }
      };
    });
  'use strict';
  angular.module('mentio')
    .factory('mentioUtil', ["$window", "$location", "$anchorScroll", "$timeout", function($window, $location, $anchorScroll, $timeout) {
      function popUnderMention(ctx, triggerCharSet, selectionEl, requireLeadingSpace) {
        var coordinates;
        var mentionInfo = getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, false);
        if (mentionInfo !== undefined) {
          if (selectedElementIsTextAreaOrInput(ctx)) {
            coordinates = getTextAreaOrInputUnderlinePosition(ctx, getDocument(ctx).activeElement,
              mentionInfo.mentionPosition);
          } else {
            coordinates = getContentEditableCaretPosition(ctx, mentionInfo.mentionPosition);
          }
          selectionEl.css({
            top: coordinates.top + 'px',
            left: coordinates.left + 'px',
            position: 'absolute',
            zIndex: 5000,
            display: 'block'
          });
          $timeout(function() {
            scrollIntoView(ctx, selectionEl);
          }, 0);
        } else {
          selectionEl.css({
            display: 'none'
          });
        }
      }

      function scrollIntoView(ctx, elem) {
        var reasonableBuffer = 20;
        var maxScrollDisplacement = 100;
        var clientRect;
        var e = elem[0];
        while (clientRect === undefined || clientRect.height === 0) {
          clientRect = e.getBoundingClientRect();
          if (clientRect.height === 0) {
            e = e.childNodes[0];
            if (e === undefined || !e.getBoundingClientRect) {
              return;
            }
          }
        }
        var elemTop = clientRect.top;
        var elemBottom = elemTop + clientRect.height;
        if (elemTop < 0) {
          $window.scrollTo(0, $window.pageYOffset + clientRect.top - reasonableBuffer);
        } else if (elemBottom > $window.innerHeight) {
          var maxY = $window.pageYOffset + clientRect.top - reasonableBuffer;
          if (maxY - $window.pageYOffset > maxScrollDisplacement) {
            maxY = $window.pageYOffset + maxScrollDisplacement;
          }
          var targetY = $window.pageYOffset - ($window.innerHeight - elemBottom);
          if (targetY > maxY) {
            targetY = maxY;
          }
          $window.scrollTo(0, targetY);
        }
      }

      function selectedElementIsTextAreaOrInput(ctx) {
        var element = getDocument(ctx).activeElement;
        if (element !== null) {
          var nodeName = element.nodeName;
          var type = element.getAttribute('type');
          return (nodeName === 'INPUT' && type === 'text') || nodeName === 'TEXTAREA';
        }
        return false;
      }

      function selectElement(ctx, targetElement, path, offset) {
        var range;
        var elem = targetElement;
        if (path) {
          for (var i = 0; i < path.length; i++) {
            elem = elem.childNodes[path[i]];
            if (elem === undefined) {
              return;
            }
            while (elem.length < offset) {
              offset -= elem.length;
              elem = elem.nextSibling;
            }
            if (elem.childNodes.length === 0 && !elem.length) {
              elem = elem.previousSibling;
            }
          }
        }
        var sel = getWindowSelection(ctx);
        range = getDocument(ctx).createRange();
        range.setStart(elem, offset);
        range.setEnd(elem, offset);
        range.collapse(true);
        try {
          sel.removeAllRanges();
        } catch (error) {}
        sel.addRange(range);
        targetElement.focus();
      }

      function pasteHtml(ctx, html, startPos, endPos) {
        var range, sel;
        sel = getWindowSelection(ctx);
        range = getDocument(ctx).createRange();
        range.setStart(sel.anchorNode, startPos);
        range.setEnd(sel.anchorNode, endPos);
        range.deleteContents();
        var el = getDocument(ctx).createElement('div');
        el.innerHTML = html;
        var frag = getDocument(ctx).createDocumentFragment(),
          node, lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      function resetSelection(ctx, targetElement, path, offset) {
        var nodeName = targetElement.nodeName;
        if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') {
          if (targetElement !== getDocument(ctx).activeElement) {
            targetElement.focus();
          }
        } else {
          selectElement(ctx, targetElement, path, offset);
        }
      }

      function replaceMacroText(ctx, targetElement, path, offset, macros, text) {
        resetSelection(ctx, targetElement, path, offset);
        var macroMatchInfo = getMacroMatch(ctx, macros);
        if (macroMatchInfo.macroHasTrailingSpace) {
          macroMatchInfo.macroText = macroMatchInfo.macroText + '\xA0';
          text = text + '\xA0';
        }
        if (macroMatchInfo !== undefined) {
          var element = getDocument(ctx).activeElement;
          if (selectedElementIsTextAreaOrInput(ctx)) {
            var startPos = macroMatchInfo.macroPosition;
            var endPos = macroMatchInfo.macroPosition + macroMatchInfo.macroText.length;
            element.value = element.value.substring(0, startPos) + text +
              element.value.substring(endPos, element.value.length);
            element.selectionStart = startPos + text.length;
            element.selectionEnd = startPos + text.length;
          } else {
            pasteHtml(ctx, text, macroMatchInfo.macroPosition,
              macroMatchInfo.macroPosition + macroMatchInfo.macroText.length);
          }
        }
      }

      function replaceTriggerText(ctx, targetElement, path, offset, triggerCharSet,
        text, requireLeadingSpace, hasTrailingSpace, suppressTrailingSpace) {
        resetSelection(ctx, targetElement, path, offset);
        var mentionInfo = getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, true, hasTrailingSpace);
        if (mentionInfo !== undefined) {
          if (selectedElementIsTextAreaOrInput()) {
            var myField = getDocument(ctx).activeElement;
            if (!suppressTrailingSpace) {
              text = text + ' ';
            }
            var startPos = mentionInfo.mentionPosition;
            var endPos = mentionInfo.mentionPosition + mentionInfo.mentionText.length + 1;
            myField.value = myField.value.substring(0, startPos) + text +
              myField.value.substring(endPos, myField.value.length);
            myField.selectionStart = startPos + text.length;
            myField.selectionEnd = startPos + text.length;
          } else {
            if (!suppressTrailingSpace) {
              text = text + '\xA0';
            }
            pasteHtml(ctx, text, mentionInfo.mentionPosition,
              mentionInfo.mentionPosition + mentionInfo.mentionText.length + 1);
          }
        }
      }

      function getNodePositionInParent(ctx, elem) {
        if (elem.parentNode === null) {
          return 0;
        }
        for (var i = 0; i < elem.parentNode.childNodes.length; i++) {
          var node = elem.parentNode.childNodes[i];
          if (node === elem) {
            return i;
          }
        }
      }

      function getMacroMatch(ctx, macros) {
        var selected, path = [],
          offset;
        if (selectedElementIsTextAreaOrInput(ctx)) {
          selected = getDocument(ctx).activeElement;
        } else {
          var selectionInfo = getContentEditableSelectedPath(ctx);
          if (selectionInfo) {
            selected = selectionInfo.selected;
            path = selectionInfo.path;
            offset = selectionInfo.offset;
          }
        }
        var effectiveRange = getTextPrecedingCurrentSelection(ctx);
        if (effectiveRange !== undefined && effectiveRange !== null) {
          var matchInfo;
          var hasTrailingSpace = false;
          if (effectiveRange.length > 0 &&
            (effectiveRange.charAt(effectiveRange.length - 1) === '\xA0' ||
              effectiveRange.charAt(effectiveRange.length - 1) === ' ')) {
            hasTrailingSpace = true;
            effectiveRange = effectiveRange.substring(0, effectiveRange.length - 1);
          }
          angular.forEach(macros, function(macro, c) {
            var idx = effectiveRange.toUpperCase().lastIndexOf(c.toUpperCase());
            if (idx >= 0 && c.length + idx === effectiveRange.length) {
              var prevCharPos = idx - 1;
              if (idx === 0 || effectiveRange.charAt(prevCharPos) === '\xA0' ||
                effectiveRange.charAt(prevCharPos) === ' ') {
                matchInfo = {
                  macroPosition: idx,
                  macroText: c,
                  macroSelectedElement: selected,
                  macroSelectedPath: path,
                  macroSelectedOffset: offset,
                  macroHasTrailingSpace: hasTrailingSpace
                };
              }
            }
          });
          if (matchInfo) {
            return matchInfo;
          }
        }
      }

      function getContentEditableSelectedPath(ctx) {
        var sel = getWindowSelection(ctx);
        var selected = sel.anchorNode;
        var path = [];
        var offset;
        if (selected != null) {
          var i;
          var ce = selected.contentEditable;
          while (selected !== null && ce !== 'true') {
            i = getNodePositionInParent(ctx, selected);
            path.push(i);
            selected = selected.parentNode;
            if (selected !== null) {
              ce = selected.contentEditable;
            }
          }
          path.reverse();
          offset = sel.getRangeAt(0).startOffset;
          return {
            selected: selected,
            path: path,
            offset: offset
          };
        }
      }

      function getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, menuAlreadyActive, hasTrailingSpace) {
        var selected, path, offset;
        if (selectedElementIsTextAreaOrInput(ctx)) {
          selected = getDocument(ctx).activeElement;
        } else {
          var selectionInfo = getContentEditableSelectedPath(ctx);
          if (selectionInfo) {
            selected = selectionInfo.selected;
            path = selectionInfo.path;
            offset = selectionInfo.offset;
          }
        }
        var effectiveRange = getTextPrecedingCurrentSelection(ctx);
        if (effectiveRange !== undefined && effectiveRange !== null) {
          var mostRecentTriggerCharPos = -1;
          var triggerChar;
          triggerCharSet.forEach(function(c) {
            var idx = effectiveRange.lastIndexOf(c);
            if (idx > mostRecentTriggerCharPos) {
              mostRecentTriggerCharPos = idx;
              triggerChar = c;
            }
          });
          if (mostRecentTriggerCharPos >= 0 &&
            (
              mostRecentTriggerCharPos === 0 ||
              !requireLeadingSpace ||
              /[\xA0\s]/g.test(
                effectiveRange.substring(
                  mostRecentTriggerCharPos - 1,
                  mostRecentTriggerCharPos)
              )
            )
          ) {
            var currentTriggerSnippet = effectiveRange.substring(mostRecentTriggerCharPos + 1,
              effectiveRange.length);
            triggerChar = effectiveRange.substring(mostRecentTriggerCharPos, mostRecentTriggerCharPos + 1);
            var firstSnippetChar = currentTriggerSnippet.substring(0, 1);
            var leadingSpace = currentTriggerSnippet.length > 0 &&
              (
                firstSnippetChar === ' ' ||
                firstSnippetChar === '\xA0'
              );
            if (hasTrailingSpace) {
              currentTriggerSnippet = currentTriggerSnippet.trim();
            }
            if (!leadingSpace && (menuAlreadyActive || !(/[\xA0\s]/g.test(currentTriggerSnippet)))) {
              return {
                mentionPosition: mostRecentTriggerCharPos,
                mentionText: currentTriggerSnippet,
                mentionSelectedElement: selected,
                mentionSelectedPath: path,
                mentionSelectedOffset: offset,
                mentionTriggerChar: triggerChar
              };
            }
          }
        }
      }

      function getWindowSelection(ctx) {
        if (!ctx) {
          return window.getSelection();
        } else {
          return ctx.iframe.contentWindow.getSelection();
        }
      }

      function getDocument(ctx) {
        if (!ctx) {
          return document;
        } else {
          return ctx.iframe.contentWindow.document;
        }
      }

      function getTextPrecedingCurrentSelection(ctx) {
        var text;
        if (selectedElementIsTextAreaOrInput(ctx)) {
          var textComponent = getDocument(ctx).activeElement;
          var startPos = textComponent.selectionStart;
          text = textComponent.value.substring(0, startPos);
        } else {
          var selectedElem = getWindowSelection(ctx).anchorNode;
          if (selectedElem != null) {
            var workingNodeContent = selectedElem.textContent;
            var selectStartOffset = getWindowSelection(ctx).getRangeAt(0).startOffset;
            if (selectStartOffset >= 0) {
              text = workingNodeContent.substring(0, selectStartOffset);
            }
          }
        }
        return text;
      }

      function getContentEditableCaretPosition(ctx, selectedNodePosition) {
        var markerTextChar = '\ufeff';
        var markerEl, markerId = 'sel_' + new Date().getTime() + '_' + Math.random().toString().substr(2);
        var range;
        var sel = getWindowSelection(ctx);
        var prevRange = sel.getRangeAt(0);
        range = getDocument(ctx).createRange();
        range.setStart(sel.anchorNode, selectedNodePosition);
        range.setEnd(sel.anchorNode, selectedNodePosition);
        range.collapse(false);
        markerEl = getDocument(ctx).createElement('span');
        markerEl.id = markerId;
        markerEl.appendChild(getDocument(ctx).createTextNode(markerTextChar));
        range.insertNode(markerEl);
        sel.removeAllRanges();
        sel.addRange(prevRange);
        var coordinates = {
          left: 0,
          top: markerEl.offsetHeight
        };
        localToGlobalCoordinates(ctx, markerEl, coordinates);
        markerEl.parentNode.removeChild(markerEl);
        return coordinates;
      }

      function localToGlobalCoordinates(ctx, element, coordinates) {
        var obj = element;
        var iframe = ctx ? ctx.iframe : null;
        while (obj) {
          coordinates.left += obj.offsetLeft;
          coordinates.top += obj.offsetTop;
          if (obj !== getDocument().body) {
            coordinates.top -= obj.scrollTop;
            coordinates.left -= obj.scrollLeft;
          }
          obj = obj.offsetParent;
          if (!obj && iframe) {
            obj = iframe;
            iframe = null;
          }
        }
      }

      function getTextAreaOrInputUnderlinePosition(ctx, element, position) {
        var properties = [
          'direction',
          'boxSizing',
          'width',
          'height',
          'overflowX',
          'overflowY',
          'borderTopWidth',
          'borderRightWidth',
          'borderBottomWidth',
          'borderLeftWidth',
          'paddingTop',
          'paddingRight',
          'paddingBottom',
          'paddingLeft',
          'fontStyle',
          'fontVariant',
          'fontWeight',
          'fontStretch',
          'fontSize',
          'fontSizeAdjust',
          'lineHeight',
          'fontFamily',
          'textAlign',
          'textTransform',
          'textIndent',
          'textDecoration',
          'letterSpacing',
          'wordSpacing'
        ];
        var isFirefox = (window.mozInnerScreenX !== null);
        var div = getDocument(ctx).createElement('div');
        div.id = 'input-textarea-caret-position-mirror-div';
        getDocument(ctx).body.appendChild(div);
        var style = div.style;
        var computed = window.getComputedStyle ? getComputedStyle(element) : element.currentStyle;
        style.whiteSpace = 'pre-wrap';
        if (element.nodeName !== 'INPUT') {
          style.wordWrap = 'break-word';
        }
        style.position = 'absolute';
        style.visibility = 'hidden';
        properties.forEach(function(prop) {
          style[prop] = computed[prop];
        });
        if (isFirefox) {
          style.width = (parseInt(computed.width) - 2) + 'px';
          if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
        } else {
          style.overflow = 'hidden';
        }
        div.textContent = element.value.substring(0, position);
        if (element.nodeName === 'INPUT') {
          div.textContent = div.textContent.replace(/\s/g, '\u00a0');
        }
        var span = getDocument(ctx).createElement('span');
        span.textContent = element.value.substring(position) || '.';
        div.appendChild(span);
        var coordinates = {
          top: span.offsetTop + parseInt(computed.borderTopWidth) + parseInt(computed.fontSize),
          left: span.offsetLeft + parseInt(computed.borderLeftWidth)
        };
        localToGlobalCoordinates(ctx, element, coordinates);
        getDocument(ctx).body.removeChild(div);
        return coordinates;
      }
      return {
        popUnderMention: popUnderMention,
        replaceMacroText: replaceMacroText,
        replaceTriggerText: replaceTriggerText,
        getMacroMatch: getMacroMatch,
        getTriggerInfo: getTriggerInfo,
        selectElement: selectElement,
        getTextAreaOrInputUnderlinePosition: getTextAreaOrInputUnderlinePosition,
        getTextPrecedingCurrentSelection: getTextPrecedingCurrentSelection,
        getContentEditableSelectedPath: getContentEditableSelectedPath,
        getNodePositionInParent: getNodePositionInParent,
        getContentEditableCaretPosition: getContentEditableCaretPosition,
        pasteHtml: pasteHtml,
        resetSelection: resetSelection,
        scrollIntoView: scrollIntoView
      };
    }]);
  angular.module("mentio").run(["$templateCache", function($templateCache) {
    $templateCache.put("mentio-menu.tpl.html", "<style>\n.scrollable-menu {\n    height: auto;\n    max-height: 300px;\n    overflow: auto;\n}\n\n.menu-highlighted {\n    font-weight: bold;\n}\n</style>\n<ul class=\"dropdown-menu scrollable-menu\" style=\"display:block\">\n    <li mentio-menu-item=\"item\" ng-repeat=\"item in items track by $index\">\n        <a class=\"text-primary\" ng-bind-html=\"item.label | mentioHighlight:typedTerm:\'menu-highlighted\' | unsafe\"></a>\n    </li>\n</ul>");
  }]);
})();;
/*! RESOURCE: /scripts/sn/common/stream/_module.js */
(function() {
  var moduleDeps = ['sn.base', 'ng.amb', 'sn.messaging', 'sn.common.glide', 'ngSanitize',
    'sn.common.avatar', 'sn.common.ui.popover', 'mentio', 'sn.common.controls', 'sn.common.user_profile',
    'sn.common.datetime', 'sn.common.mention', 'sn.common.ui'
  ];
  if (angular.version.major == 1 && angular.version.minor >= 3)
    moduleDeps.push('ngAria');
  angular.module("sn.common.stream", moduleDeps);
  angular.module("sn.stream.direct", ['sn.common.stream']);
})();;
/*! RESOURCE: /scripts/sn/common/stream/controller.Stream.js */
angular.module("sn.common.stream").controller("Stream", function($rootScope, $scope, snRecordWatcher, $timeout) {
  var isForm = NOW.sysId.length > 0;
  $scope.showCommentsAndWorkNotes = isForm;
  $scope.sessions = {};
  $scope.recordStreamOpen = false;
  $scope.streamHidden = true;
  $scope.recordSysId = '';
  $scope.recordDisplayValue = '';
  $scope.$on('record.updated', onRecordUpdated);
  $rootScope.$on('sn.sessions', onSessions);
  $timeout(function() {
    if (isForm)
      snRecordWatcher.initRecord(NOW.targetTable, NOW.sysId);
    else
      snRecordWatcher.initList(NOW.targetTable, NOW.tableQuery);
  }, 100);
  $scope.controls = {
    showRecord: function($event, entry, sysId) {
      if (sysId !== '')
        return;
      if ($event.currentTarget != $event.target && $event.target.tagName == 'A')
        return;
      $scope.recordSysId = entry.document_id;
      $scope.recordDisplayValue = entry.display_value;
      $scope.recordStreamOpen = true;
      $scope.streamHidden = true;
    },
    openRecord: function() {
      var targetFrame = window.self;
      var url = NOW.targetTable + ".do?sys_id=" + $scope.recordSysId;
      if (NOW.linkTarget == 'form_pane') {
        url += "&sysparm_clear_stack=true";
        window.parent.CustomEvent.fireTop(
          "glide:nav_open_url", {
            url: url,
            openInForm: true
          });
        return;
      }
      if (NOW.streamLinkTarget == 'parent' || NOW.concourse == 'true')
        targetFrame = window.parent;
      targetFrame.location = url;
    },
    openAttachment: function(event, sysId) {
      event.stopPropagation();
      var url = "/sys_attachment.do?view=true&sys_id=" + sysId;
      var newTab = window.open(url, '_blank');
      newTab.focus();
    }
  };
  $scope.sessionCount = function() {
    $scope.sessions.length = Object.keys($scope.sessions.data).length;
    return $scope.sessions.length;
  };

  function onSessions(name, sessions) {
    $scope.sessions.data = sessions;
    $scope.sessionCount();
  }

  function onRecordUpdated(name, data) {}
  $scope.showListStream = function() {
    $scope.recordStreamOpen = false;
    $scope.recordHidden = false;
    $scope.streamHidden = false;
    angular.element('div.list-stream-record').velocity('snTransition.streamSlideRight', {
      duration: 400
    });
    angular.element('[streamType="list"]').velocity('snTransition.slideIn', {
      duration: 400,
      complete: function(element) {
        angular.element(element).css({
          display: 'block'
        });
      }
    });
  };
  $scope.$watch(function() {
    return angular.element('div.list-stream-record').length
  }, function(newValue, oldValue) {
    if (newValue == 1) {
      angular.element('div.list-stream-record').delay(100).velocity('snTransition.streamSlideLeft', {
        begin: function(element) {
          angular.element(element).css({
            visibility: 'visible'
          });
          angular.element('.list-stream-record-header').css({
            visibility: 'visible'
          });
        },
        duration: 400,
        complete: function(element) {
          angular.element(element).css({
            transform: "translateX(0)"
          });
          angular.element(element).scrollTop(0);
          angular.element(element).css({
            transform: "initial"
          });
          angular.element('.return-to-stream').focus();
        }
      });
    }
  });
});;
/*! RESOURCE: /scripts/sn/common/stream/controller.snStream.js */
angular.module("sn.common.stream").controller("snStream", function($rootScope, $scope, $attrs, $http, nowStream, snRecordPresence, snCustomEvent, userPreferences, $window, $q, $timeout, $sanitize, $sce, snMention, i18n, getTemplateUrl) {
  "use strict";
  if (angular.isDefined($attrs.isInline)) {
    bindInlineStreamAttributes();
  }

  function bindInlineStreamAttributes() {
    var streamAttributes = {};
    if ($attrs.table) {
      streamAttributes.table = $attrs.table;
    }
    if ($attrs.query) {
      streamAttributes.query = $attrs.query;
    }
    if ($attrs.sysId) {
      streamAttributes.sysId = $attrs.sysId;
    }
    if ($attrs.active) {
      streamAttributes.active = ($attrs.active == "true");
    }
    if ($attrs.template) {
      streamAttributes.template = $attrs.template;
    }
    if ($attrs.preferredInput) {
      streamAttributes.preferredInput = $attrs.preferredInput;
    }
    if ($attrs.useMultipleInputs) {
      streamAttributes.useMultipleInputs = ($attrs.useMultipleInputs == "true");
    }
    if ($attrs.expandEntries) {
      streamAttributes.expandEntries = ($attrs.expandEntries == "true");
    }
    if ($attrs.pageSize) {
      streamAttributes.pageSize = parseInt($attrs.pageSize, 10);
    }
    if ($attrs.truncate) {
      streamAttributes.truncate = ($attrs.truncate == "true");
    }
    if ($attrs.attachments) {
      streamAttributes.attachments = ($attrs.attachments == "true");
    }
    if ($attrs.showCommentsAndWorkNotes) {
      streamAttributes.attachments = ($attrs.showCommentsAndWorkNotes == "true");
    }
    angular.extend($scope, streamAttributes)
  }
  var stream;
  var processor = $attrs.processor || "list_history";
  var interval;
  var FROM_LIST = 'from_list';
  var FROM_FORM = 'from_form';
  var source = $scope.sysId ? FROM_FORM : FROM_LIST;
  var _firstPoll = true;
  var _firstPollTimeout;
  var fieldsInitialized = false;
  var primaryJournalFieldOrder = ["comments", "work_notes"];
  var primaryJournalField = null;
  $scope.defaultShowCommentsAndWorkNotes = ($scope.sysId != null && !angular.isUndefined($scope.sysId) && $scope.sysId.length > 0);
  $scope.canWriteWorkNotes = false;
  $scope.inputTypeValue = "";
  $scope.entryTemplate = getTemplateUrl($attrs.template || "list_stream_entry");
  $scope.isFormStream = $attrs.template === "record_stream_entry.xml";
  $scope.allFields = null;
  $scope.fields = {};
  $scope.fieldColor = "transparent";
  $scope.multipleInputs = $scope.useMultipleInputs;
  $scope.checkbox = {};
  var typing = '{0} is typing',
    viewing = '{0} is viewing',
    entered = '{0} has entered';
  var probablyLeft = '{0} has probably left',
    exited = '{0} has exited',
    offline = '{0} is offline';
  i18n.getMessages(
    [
      typing,
      viewing,
      entered,
      probablyLeft,
      exited,
      offline
    ],
    function(results) {
      typing = results[typing];
      viewing = results[viewing];
      entered = results[entered];
      probablyLeft = results[probablyLeft];
      exited = results[exited];
      offline = results[offline];
    }
  );
  $scope.parsePresence = function(sessionData) {
    var status = sessionData.status;
    var name = sessionData.user_display_name;
    switch (status) {
      case 'typing':
        return i18n.format(typing, name);
      case 'viewing':
        return i18n.format(viewing, name);
      case 'entered':
        return i18n.format(entered, name);
      case 'probably left':
        return i18n.format(probablyLeft, name);
      case 'exited':
        return i18n.format(exited, name);
      case 'offline':
        return i18n.format(offline, name);
      default:
        return '';
    }
  };
  $scope.members = [];
  $scope.members.loading = true;
  var mentionMap = {};
  $scope.selectAtMention = function(item) {
    if (item.termLengthIsZero)
      return (item.name || "") + "\n";
    mentionMap[item.name] = item.sys_id;
    return "@[" + item.name + "]";
  };
  var typingTimer;
  $scope.searchMembersAsync = function(term) {
    $scope.members = [];
    $scope.members.loading = true;
    $timeout.cancel(typingTimer);
    if (term.length === 0) {
      $scope.members = [{
        termLengthIsZero: true
      }];
      $scope.members.loading = false;
    } else {
      typingTimer = $timeout(function() {
        snMention.retrieveMembers($scope.table, $scope.sysId, term).then(function(members) {
          $scope.members = members;
          $scope.members.loading = false;
        }, function() {
          $scope.members = [{
            termLengthIsZero: true
          }];
          $scope.members.loading = false;
        });
      }, 500);
    }
  };
  $scope.expandMentions = function(text) {
    return stream.expandMentions(text, mentionMap)
  };
  $scope.reduceMentions = function(text) {
    if (!text)
      return text;
    var regexMentionParts = /[\w\d\s/\']+/gi;
    text = text.replace(/@\[[\w\d\s]+:[\w\d\s/\']+\]/gi, function(mention) {
      var mentionParts = mention.match(regexMentionParts);
      if (mentionParts.length === 2) {
        var name = mentionParts[1];
        mentionMap[name] = mentionParts[0];
        return "@[" + name + "]";
      }
      return mentionParts;
    });
    return text;
  };
  $scope.parseMentions = function(entry) {
    var regexMentionParts = /[\w\d\s/\']+/gi;
    entry = entry.replace(/@\[[\w\d\s]+:[\w\d\s/\']+\]/gi, function(mention) {
      var mentionParts = mention.match(regexMentionParts);
      if (mentionParts.length === 2) {
        return '<a class="at-mention at-mention-user-' + mentionParts[0] + '">@' + mentionParts[1] + '</a>';
      }
      return mentionParts;
    });
    return entry;
  };
  $scope.parseLinks = function(text) {
    var regexLinks = /@L\[([^|]+?)\|([^\]]*)]/gi;
    return text.replace(regexLinks, "<a href='$1' target='_blank'>$2</a>");
  };
  $scope.parseSpecial = function(text) {
    var parsedText = $scope.parseLinks($sanitize(text));
    parsedText = $scope.parseMentions(parsedText);
    return $sce.trustAsHtml(parsedText);
  };
  $scope.getFullEntryValue = function(entry, event) {
    event.stopPropagation();
    var index = getEntryIndex(entry);
    var journal = $scope.entries[index].entries.journal[0];
    journal.loading = true;
    $http.get('/api/now/ui/stream_entry/full_entry', {
      params: {
        sysparm_sys_id: journal.sys_id
      }
    }).then(function(response) {
      journal.new_value = response.data.result.replace(/\n/g, '<br/>');
      journal.is_truncated = false;
      journal.loading = false;
      journal.showMore = true;
    });
  };

  function getEntryIndex(entry) {
    for (var i = 0, l = $scope.entries.length; i < l; i++) {
      if (entry === $scope.entries[i]) {
        return i;
      }
    }
  }
  $scope.$watch('active', function(n, o) {
    if (n === o)
      return;
    if ($scope.active)
      startPolling();
    else
      cancelStream();
  });
  $scope.defaultControls = {
    getTitle: function(entry) {
      if (entry && entry.short_description) {
        return entry.short_description;
      } else if (entry && entry.shortDescription) {
        return entry.shortDescription;
      }
    },
    showCreatedBy: function() {
      return true;
    },
    hideCommentLabel: function() {
      return false;
    },
    showRecord: function($event, entry) {},
    showRecordLink: function() {
      return true;
    }
  };
  if ($scope.controls) {
    for (var attr in $scope.controls)
      $scope.defaultControls[attr] = $scope.controls[attr];
  }
  $scope.controls = $scope.defaultControls;
  if ($scope.showCommentsAndWorkNotes === undefined) {
    $scope.showCommentsAndWorkNotes = $scope.defaultShowCommentsAndWorkNotes;
  }
  snCustomEvent.observe('sn.stream.change_input_display', function(table, display) {
    if (table != $scope.table)
      return;
    $scope.showCommentsAndWorkNotes = display;
    $scope.$apply();
  });
  $scope.$on("$destroy", function() {
    cancelStream();
  });
  $scope.$on('sn.stream.interval', function($event, time) {
    interval = time;
    reschedulePoll();
  });
  $scope.$on("sn.stream.tap", function() {
    if (stream)
      stream.tap();
    else
      startPolling();
  });
  $scope.$on('window_visibility_change', function($event, hidden) {
    interval = (hidden) ? 120000 : undefined;
    reschedulePoll();
  });
  $scope.$on("sn.stream.refresh", function(event, data) {
    stream._successCallback(data.response);
  });
  $scope.$on("sn.stream.reload", function() {
    startPolling();
  });
  $scope.$on('sn.stream.input_value', function(otherScope, type, value) {
    if (!$scope.multipleInputs) {
      $scope.inputType = type;
      $scope.inputTypeValue = value;
    }
  });
  $scope.$watchCollection('[table, query, sysId]', startPolling);
  $scope.changeInputType = function(field) {
    if (!primaryJournalField) {
      angular.forEach($scope.fields, function(item) {
        if (item.isPrimary)
          primaryJournalField = item.name;
      });
    }
    $scope.inputType = field.checked ? field.name : primaryJournalField;
    userPreferences.setPreference('glide.ui.' + $scope.table + '.stream_input', $scope.inputType);
  };
  $scope.selectedInputType = function(value) {
    if (angular.isDefined(value)) {
      $scope.inputType = value;
      userPreferences.setPreference('glide.ui.' + $scope.table + '.stream_input', $scope.inputType);
    }
    return $scope.inputType;
  };
  $scope.$watch('inputType', function() {
    if (!$scope.inputType || !$scope.preferredInput)
      return;
    $scope.preferredInput = $scope.inputType;
  });
  $scope.submitCheck = function(event) {
    var key = event.keyCode || event.which;
    if (key === 13) {
      $scope.postJournalEntryForCurrent(event);
    }
  };
  $scope.postJournalEntry = function(type, entry, event) {
    type = type || primaryJournalFieldOrder[0];
    event.stopPropagation();
    var requestTable = $scope.table || "board:" + $scope.board.sys_id;
    stream.insertForEntry(type, entry.journalText, requestTable, entry.document_id);
    entry.journalText = "";
    entry.commentBoxVisible = false;
    snRecordPresence.termPresence();
  };
  $scope.postJournalEntryForCurrent = function(event) {
    event.stopPropagation();
    var entries = [];
    if ($scope.multipleInputs) {
      angular.forEach($scope.fields, function(item) {
        if (!item.isActive || !item.value)
          return;
        entries.push({
          field: item.name,
          text: item.value
        });
      })
    } else {
      entries.push({
        field: $scope.inputType,
        text: $scope.inputTypeValue
      })
    }
    var request = stream.insertEntries(entries, $scope.table, $scope.sysId, mentionMap);
    if (request) {
      request.then(function() {
        for (var i = 0; i < entries.length; i++) {
          fireInsertEvent(entries[i].field, entries[i].text);
        }
      });
    }
    clearInputs();
    return false;
  };

  function fireInsertEvent(name, value) {
    snCustomEvent.fire('sn.stream.insert', name, value);
  }

  function clearInputs() {
    $scope.inputTypeValue = "";
    angular.forEach($scope.fields, function(item) {
      if (!item.isActive)
        return;
      if (item.value)
        item.filled = true;
      item.value = "";
    });
  }
  $scope.showCommentBox = function(entry, event) {
    event.stopPropagation();
    if (entry !== $scope.selectedEntry)
      $scope.closeEntry();
    $scope.selectedEntry = entry;
    entry.commentBoxVisible = !entry.commentBoxVisible;
    if (entry.commentBoxVisible) {
      snRecordPresence.initPresence($scope.table, entry.document_id);
    }
  };
  $scope.showMore = function(journal, event) {
    event.stopPropagation();
    journal.showMore = true;
  };
  $scope.showLess = function(journal, event) {
    event.stopPropagation();
    journal.showMore = false;
  };
  $scope.closeEntry = function() {
    if ($scope.selectedEntry)
      $scope.selectedEntry.commentBoxVisible = false;
  };
  $scope.previewAttachment = function(evt, attachmentUrl) {
    snCustomEvent.fire('sn.attachment.preview', evt, attachmentUrl);
  };
  $rootScope.$on('sn.sessions', function(someOtherScope, sessions) {
    if ($scope.selectedEntry && $scope.selectedEntry.commentBoxVisible)
      $scope.selectedEntry.sessions = sessions;
  });
  $scope.$watch("inputTypeValue", function(n, o) {
    if (n !== o) {
      emitTyping($scope.inputTypeValue);
    }
  });
  $scope.$watch("selectedEntry.journalText", function(newValue) {
    if ($scope.selectedEntry)
      emitTyping(newValue || "");
  });
  $scope.$watch('useMultipleInputs', function() {
    setMultipleInputs();
  });

  function emitTyping(inputValue) {
    if (!angular.isDefined(inputValue)) {
      return;
    }
    var status = inputValue.length ? "typing" : "viewing";
    $scope.$emit("record.typing", {
      status: status,
      value: inputValue,
      table: $scope.table,
      sys_id: $scope.sys_id
    });
  }

  function preloadedData() {
    if (typeof window.NOW.snActivityStreamData === 'object' &&
      window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId]) {
      _firstPoll = false;
      var data = window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId];
      stream = nowStream.create($scope.table, $scope.query, $scope.sysId,
        processor, interval, source, $scope.attachments);
      stream.callback = onPoll;
      stream.preRequestCallback = beforePoll;
      stream.lastTimestamp = data.sys_timestamp;
      if (data.entries && data.entries.length) {
        stream.lastEntry = angular.copy(data.entries[0]);
      }
      _firstPollTimeout = setTimeout(function() {
        stream.poll(onPoll, beforePoll);
        _firstPollTimeout = false;
      }, 20000);
      beforePoll();
      onPoll(data);
      return true;
    }
    return false;
  }

  function scheduleNewPoll(lastTimestamp) {
    cancelStream();
    stream = nowStream.create($scope.table, $scope.query, $scope.sysId,
      processor, interval, source, $scope.attachments);
    stream.lastTimestamp = lastTimestamp;
    stream.poll(onPoll, beforePoll);
  }

  function reschedulePoll() {
    var lastTimestamp = stream ? stream.lastTimestamp : 0;
    if (cancelStream()) {
      scheduleNewPoll(lastTimestamp);
    }
  }

  function reset() {
    removeInlineStream();
    $scope.loaded = false;
    startPolling();
  }

  function emitFilterChange() {
    $scope.$emit('sn.stream.is_filtered_change', $scope.isFiltered);
  }

  function startPolling() {
    if ($scope.loading && !$scope.loaded)
      return;
    if (!$scope.active)
      return;
    $scope.entries = [];
    $scope.allEntries = [];
    $scope.showAllEntriesButton = false;
    $scope.loaded = false;
    $scope.loading = true;
    if (_firstPoll && preloadedData()) {
      return;
    }
    scheduleNewPoll();
    $scope.$emit('sn.stream.entries_change', $scope.entries);
  }

  function onPoll(response) {
    $scope.loading = false;
    if (response.primary_fields)
      primaryJournalFieldOrder = response.primary_fields;
    if (!fieldsInitialized)
      processFields(response.fields);
    processEntries(response.entries);
    if (response.inlineStreamLoaded) {
      $scope.inlineStreamLoaded = true;
      addInlineStreamEntryClass();
    }
    if (!$scope.loaded) {
      $scope.loaded = true;
      $scope.$emit("sn.stream.loaded", response);
    }
  }

  function beforePoll() {
    $scope.$emit("sn.stream.requested");
  }

  function processFields(fields) {
    if (!fields || !fields.length)
      return;
    fieldsInitialized = true;
    $scope.allFields = fields;
    setShowAllFields();
    $scope.fieldsVisible = 0;
    var i = 0;
    angular.forEach(fields, function(field) {
      if (!field.isJournal)
        return;
      if (i == 0)
        $scope.firstJournal = field.name;
      i++;
      if ($scope.fields[field.name]) {
        angular.extend($scope.fields[field.name], field);
      } else {
        $scope.fields[field.name] = field;
      }
      $scope.fields[field.name].visible = !$scope.formJournalFields;
      if ($scope.fields[field.name].visible)
        $scope.fieldsVisible++;
      if ($scope.fieldsVisible > 1 && !$scope.fields[field.name].canWrite)
        $scope.fieldsVisible--;
      var fieldColor = field.color;
      if (fieldColor)
        fieldColor = field.color.replace(/background-color: /, '');
      if (!fieldColor || fieldColor == 'transparent')
        fieldColor = null;
      $scope.fields[field.name].color = fieldColor;
    });
    setFieldVisibility();
    setPrimaryJournalField();
    setMultipleInputs();
  }
  $scope.$watch('formJournalFields', function() {
    setFieldVisibility();
    setPrimaryJournalField();
    setMultipleInputs();
  }, true);

  function setFieldVisibility() {
    if (!$scope.formJournalFields || !$scope.fields || !$scope.showCommentsAndWorkNotes)
      return;
    $scope.fieldsVisible = 0;
    angular.forEach($scope.formJournalFields, function(formField) {
      if (!$scope.fields[formField.name])
        return;
      $scope.fields[formField.name].value = formField.value;
      $scope.fields[formField.name].mandatory = formField.mandatory;
      $scope.fields[formField.name].label = formField.label;
      $scope.fields[formField.name].messages = formField.messages;
      $scope.fields[formField.name].visible = formField.visible && !formField.readonly;
      if ($scope.fields[formField.name].visible)
        $scope.fieldsVisible++;
    });
  }
  $scope.getStubbedFieldModel = function(fieldName) {
    if ($scope.fields[fieldName])
      return $scope.fields[fieldName];
    $scope.fields[fieldName] = {
      name: fieldName
    };
    return $scope.fields[fieldName];
  };

  function setPrimaryJournalField() {
    if (!$scope.fields || !$scope.showCommentsAndWorkNotes)
      return;
    angular.forEach($scope.fields, function(item) {
      item.isPrimary = false;
    });
    var visibleFields = Object.keys($scope.fields).filter(function(item) {
      return $scope.fields[item].visible;
    });
    if (visibleFields.indexOf($scope.preferredInput) != -1) {
      var field = $scope.fields[$scope.preferredInput];
      field.checked = true;
      field.isPrimary = true;
      $scope.inputType = $scope.preferredInput;
      primaryJournalField = $scope.preferredInput;
    } else {
      for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
        var fieldName = primaryJournalFieldOrder[i];
        if (visibleFields.indexOf(fieldName) != -1) {
          $scope.fields[fieldName].isPrimary = true;
          primaryJournalField = fieldName;
          $scope.inputType = fieldName;
          break;
        }
      }
    }
    if (visibleFields.length === 0) {
      primaryJournalField = '';
      $scope.inputType = primaryJournalField;
    } else if (!$scope.inputType && visibleFields.length > 0) {
      primaryJournalField = visibleFields[0];
      $scope.inputType = primaryJournalField;
      $scope.fields[primaryJournalField].isPrimary = true;
    }
    if ($scope.fields && visibleFields.indexOf(primaryJournalField) == -1) {
      var keys = Object.keys($scope.fields);
      if (keys.length)
        $scope.fields[keys[0]].isPrimary = true;
    }
  }

  function setShowAllFields() {
    $scope.checkbox.showAllFields = $scope.showAllFields = $scope.allFields && !$scope.allFields.some(function(item) {
      return !item.isActive;
    });
    $scope.hideAllFields = !$scope.allFields || !$scope.allFields.some(function(item) {
      return item.isActive;
    });
    $scope.isFiltered = !$scope.showAllFields || $scope.allFields.some(function(item) {
      return !item.isActive;
    });
  }
  $scope.setPrimary = function(entry) {
    angular.forEach($scope.fields, function(item) {
      item.checked = false;
    });
    for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
      var fieldName = primaryJournalFieldOrder[i];
      if (entry.writable_journal_fields.indexOf(fieldName) != -1) {
        entry.primaryJournalField = fieldName;
        entry.inputType = fieldName;
        return;
      }
    }
    if (!entry.inputType) {
      var primaryField = entry.writable_journal_fields[0];
      entry.primaryJournalField = primaryField;
      entry.inputType = primaryField;
    }
  };
  $scope.updateFieldVisibilityAll = function() {
    $scope.showAllFields = !$scope.showAllFields;
    angular.forEach($scope.allFields, function(item) {
      item.isActive = $scope.showAllFields;
    });
    $scope.updateFieldVisibility();
  };
  $scope.updateFieldVisibility = function() {
    var activeFields = $scope.allFields.map(function(item) {
      return item.name + ',' + item.isActive;
    });
    setShowAllFields();
    emitFilterChange();
    userPreferences
      .setPreference($scope.table + '.activity.filter', activeFields.join(';'))
      .then(function() {
        reset();
      });
  };
  $scope.configureAvailableFields = function() {
    $window.personalizer($scope.table, 'activity', $scope.sysId);
  };
  $scope.toggleMultipleInputs = function(val) {
    userPreferences.setPreference('glide.ui.activity_stream.multiple_inputs', val ? 'true' : 'false')
      .then(function() {
        $scope.useMultipleInputs = val;
        setMultipleInputs();
      });
  };
  $scope.changeEntryInputType = function(fieldName, entry) {
    var checked = $scope.fields[fieldName].checked;
    entry.inputType = checked ? fieldName : entry.primaryJournalField;
  };

  function processEntries(entries) {
    if (!entries || !entries.length)
      return;
    entries = entries.reverse();
    var newEntries = [];
    angular.forEach(entries, function(entry) {
      var entriesToAdd = [entry];
      if (entry.attachment) {
        entry.type = getAttachmentType(entry.attachment);
        entry.attachment.extension = getAttachmentExt(entry.attachment);
      } else if (entry.is_email === true) {
        entry.email = {};
        var allFields = entry.entries.custom;
        for (var i = 0; i < allFields.length; i++) {
          entry.email[allFields[i].field_name] = {
            label: allFields[i]['field_label'],
            displayValue: allFields[i]['new_value']
          };
        }
        entry['entries'].custom = [];
      } else if ($scope.sysId) {
        entriesToAdd = extractJournalEntries(entry);
      } else {
        entriesToAdd = handleJournalEntriesWithoutExtraction(entry);
      }
      if (entriesToAdd instanceof Array) {
        entriesToAdd.forEach(function(e) {
          $scope.entries.unshift(e);
          newEntries.unshift(e);
        });
      } else {
        $scope.entries.unshift(entriesToAdd);
        newEntries.unshift(entriesToAdd)
      }
      if (source != FROM_FORM)
        $scope.entries = $scope.entries.slice(0, 49);
      if ($scope.maxEntries != undefined) {
        var maxNumEntries = parseInt($scope.maxEntries, 10);
        $scope.entries = $scope.entries.slice(0, maxNumEntries);
      }
    });
    if ($scope.inlineStreamLoaded) {
      if ($scope.entries.length > 0) {
        removeInlineStreamEntryClass();
      }
    }
    if ($scope.loaded) {
      $scope.$emit("sn.stream.new_entries", newEntries);
      triggerResize();
    } else if ($scope.pageSize && $scope.entries.length > $scope.pageSize) {
      setUpPaging();
    }
    $timeout(function() {
      $scope.$emit('sn.stream.entries_change', $scope.entries);
    });
  }

  function removeInlineStream() {
    angular.element(document).find('#sn_form_inline_stream_container').hide().remove();
  }

  function removeInlineStreamEntryClass() {
    angular.element(document).find('#sn_form_inline_stream_entries').removeClass('sn-form-inline-stream-entries-only');
  }

  function addInlineStreamEntryClass() {
    angular.element(document).find('#sn_form_inline_stream_entries').addClass('sn-form-inline-stream-entries-only');
  }

  function setUpPaging() {
    $scope.showAllEntriesButton = true;
    $scope.allEntries = $scope.entries;
    $scope.entries = [];
    loadEntries(0, $scope.pageSize);
  }
  $scope.loadMore = function() {
    if ($scope.entries.length + $scope.pageSize > $scope.allEntries.length) {
      $scope.loadAll();
      return;
    }
    loadEntries($scope.loadedEntries, $scope.loadedEntries + $scope.pageSize);
  };
  $scope.loadAll = function() {
    $scope.showAllEntriesButton = false;
    loadEntries($scope.loadedEntries, $scope.allEntries.length);
  };

  function loadEntries(start, end) {
    $scope.entries = $scope.entries.concat($scope.allEntries.slice(start, end));
    $scope.loadedEntries = $scope.entries.length;
    $scope.$emit('sn.stream.entries_change', $scope.entries);
  }

  function getAttachmentType(attachment) {
    if (attachment.content_type.startsWith('image/') && attachment.size_bytes < 5 * 1024 * 1024 && attachment.path.indexOf(attachment.sys_id) == 0)
      return 'attachment-image';
    return 'attachment';
  }

  function getAttachmentExt(attachment) {
    var filename = attachment.file_name;
    return filename.substring(filename.lastIndexOf('.') + 1);
  }

  function handleJournalEntriesWithoutExtraction(oneLargeEntry) {
    if (oneLargeEntry.entries.journal.length === 0)
      return oneLargeEntry;
    for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
      newLinesToBR(oneLargeEntry.entries.journal);
    }
    return oneLargeEntry;
  }

  function extractJournalEntries(oneLargeEntry) {
    var smallerEntries = [];
    if (oneLargeEntry.entries.journal.length === 0)
      return oneLargeEntry;
    for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
      var journalEntry = angular.copy(oneLargeEntry);
      journalEntry.entries.journal = journalEntry.entries.journal.slice(i, i + 1);
      newLinesToBR(journalEntry.entries.journal);
      journalEntry.entries.changes = [];
      journalEntry.type = 'journal';
      smallerEntries.unshift(journalEntry);
    }
    oneLargeEntry.entries.journal = [];
    oneLargeEntry.type = 'changes';
    if (oneLargeEntry.entries.changes.length > 0)
      smallerEntries.unshift(oneLargeEntry);
    return smallerEntries;
  }

  function newLinesToBR(entries) {
    angular.forEach(entries, function(item) {
      if (!item.new_value)
        return;
      item.new_value = item.new_value.replace(/\n/g, '<br/>');
    });
  }

  function cancelStream() {
    if (_firstPollTimeout) {
      clearTimeout(_firstPollTimeout);
      _firstPollTimeout = false;
    }
    if (!stream)
      return false;
    stream.cancel();
    stream = null;
    return true; 
  }

  function setMultipleInputs() {
    $scope.multipleInputs = $scope.useMultipleInputs;
    if ($scope.useMultipleInputs === true || !$scope.formJournalFields) {
      return;
    }
    var numAffectedFields = 0;
    angular.forEach($scope.formJournalFields, function(item) {
      if (item.mandatory || item.value)
        numAffectedFields++;
    });
    if (numAffectedFields > 0)
      $scope.multipleInputs = true;
  }

  function triggerResize() {
    if (window._frameChanged)
      setTimeout(_frameChanged, 0);
  }
});;
/*! RESOURCE: /scripts/sn/common/stream/directive.snStream.js */
angular.module("sn.common.stream").directive("snStream", function(getTemplateUrl, $http, $sce, $sanitize) {
  "use strict";
  return {
    restrict: "E",
    replace: true,
    scope: {
      table: "=",
      query: "=?",
      sysId: "=?",
      active: "=",
      controls: "=?",
      showCommentsAndWorkNotes: "=?",
      previousActivity: "=?",
      sessions: "=",
      attachments: "=",
      board: "=",
      formJournalFields: "=",
      useMultipleInputs: "=?",
      preferredInput: "=",
      labels: "=",
      subStream: "=",
      expandEntries: "=",
      scaleAnimatedGifs: "=",
      scaleImages: "=",
      pageSize: "=",
      maxEntries: "@"
    },
    templateUrl: getTemplateUrl("ng_activity_stream.xml"),
    controller: "snStream",
    link: function(scope, element) {
      element.on("click", ".at-mention", function(evt) {
        var userID = angular.element(evt.target).attr('class').substring("at-mention at-mention-user-".length);
        $http({
          url: '/api/now/form/mention/user/' + userID,
          method: "GET"
        }).then(function(response) {
          scope.showPopover = true;
          scope.mentionPopoverProfile = response.data.result;
          scope.clickEvent = evt;
        }, function() {
          $http({
            url: '/api/now/live/profiles/' + userID,
            method: "GET"
          }).then(function(response) {
            scope.showPopover = true;
            var tempProfile = response.data.result;
            tempProfile.userID = tempProfile.sys_id = response.data.result.document;
            scope.mentionPopoverProfile = tempProfile;
            scope.mentionPopoverProfile.sysID = response.data.result["userID"];
            scope.clickEvent = evt;
          })
        });
      });
      scope.toggleEmailIframe = function(email, event) {
        email.expanded = !email.expanded;
        event.preventDefault();
      };
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/stream/directive.formStreamEntry.js */
angular.module('sn.common.stream').directive('formStreamEntry', function(getTemplateUrl) {
  return {
    restrict: 'A',
    templateUrl: getTemplateUrl('record_stream_entry.xml')
  }
});;
/*! RESOURCE: /scripts/sn/common/stream/directive.snExpandedEmail.js */
angular.module("sn.common.stream").directive("snExpandedEmail", function() {
  "use strict";
  return {
    restrict: "E",
    replace: true,
    scope: {
      email: "="
    },
    template: "<iframe style='width: 100%;' class='card' src='{{::emailBodySrc}}'></iframe>",
    controller: function($scope) {
      $scope.emailBodySrc = "email_display.do?email_id=" + $scope.email.sys_id.displayValue;
    },
    link: function(scope, element) {
      element.load(function() {
        var bodyHeight = $j(this).get(0).contentWindow.document.body.scrollHeight + "px";
        $j(this).height(bodyHeight);
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.form_presence/controller.formStream.js */
(function() {
  var journalModel = {};
  window.journalModel = journalModel;
  CustomEvent.observe('sn.form.journal_field.add', function(name, mandatory, readonly, visible, value, label) {
    journalModel[name] = {
      name: name,
      mandatory: mandatory,
      readonly: readonly,
      visible: visible,
      value: value,
      label: label,
      messages: []
    };
  });
  CustomEvent.observe('sn.form.journal_field.readonly', function(name, readonly) {
    modifyJournalAttribute(name, "readonly", readonly);
  });
  CustomEvent.observe('sn.form.journal_field.value', function(name, value) {
    modifyJournalAttribute(name, "value", value);
  });
  CustomEvent.observe('sn.form.journal_field.mandatory', function(name, mandatory) {
    modifyJournalAttribute(name, "mandatory", mandatory);
  });
  CustomEvent.observe('sn.form.journal_field.visible', function(name, visible) {
    modifyJournalAttribute(name, "visible", visible);
  });
  CustomEvent.observe('sn.form.journal_field.label', function(name, visible) {
    modifyJournalAttribute(name, "label", visible);
  });
  CustomEvent.observe('sn.form.journal_field.show_msg', function(input, message, type) {
    var messages = journalModel[input]['messages'].concat([{
      type: type,
      message: message
    }]);
    modifyJournalAttribute(input, 'messages', messages);
  });
  CustomEvent.observe('sn.form.journal_field.hide_msg', function(input, clearAll) {
    if (journalModel[input]['messages'].length == 0)
      return;
    var desiredValue = [];
    if (!clearAll)
      desiredValue = journalModel[input]['messages'].slice(1);
    modifyJournalAttribute(input, 'messages', desiredValue);
  });
  CustomEvent.observe('sn.form.hide_all_field_msg', function(type) {
    var fields = Object.keys(journalModel);
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (journalModel[f].messages.length == 0)
        continue;
      var messages = [];
      if (type) {
        var oldMessages = angular.copy(journalModel[f].messages);
        for (var j = 0; j < oldMessages.length; j++) {
          if (oldMessages[j].type != type)
            messages.push(oldMessages[j]);
        }
      }
      modifyJournalAttribute(f, 'messages', messages);
    }
  });
  CustomEvent.observe('sn.stream.insert', function(field, text) {
    if (typeof window.g_form !== "undefined")
      g_form.getControl(field).value = NOW.STREAM_VALUE_KEY + text;
  });

  function modifyJournalAttribute(field, prop, value) {
    if (journalModel[field][prop] === value)
      return;
    journalModel[field][prop] = value;
    CustomEvent.fire('sn.form.journal_field.changed');
  }
  angular.module('sn.common.stream').controller('formStream', function($scope, snCustomEvent, i18n) {
    var isFiltered = !angular.element('.activity-stream-label-filtered').hasClass('hide');
    var _inlineTemplateCache;

    function renderLabel(count) {
      var processedLabel = _getLabel(count);
      angular.element('.activity-stream-label-counter').html(processedLabel);
      angular.element('.activity-stream-label-filtered').toggleClass('hide', !isFiltered);
    }

    function _getLabel(count) {
      var label = 'Activities: {0}';
      return i18n.getMessage(label).withValues([count]);
    }

    function _getInlineEntries() {
      if (_inlineTemplateCache === 0) {
        return 0;
      }
      _inlineTemplateCache = document.querySelectorAll('#sn_form_inline_stream_container ul.activities-form li.h-card_comments').length;
      return _inlineTemplateCache;
    }
    $scope.$on('sn.stream.entries_change', function(evt, entries) {
      var inlineTemplateCount = _getInlineEntries();
      var count = inlineTemplateCount + entries.length;
      renderLabel(count);
    });
    $scope.$on('sn.stream.is_filtered_change', function(evt, filtered) {
      isFiltered = filtered;
    });
    $scope.formJournalFields = journalModel;
    $scope.formJournalFieldsVisible = false;
    setUp();
    snCustomEvent.observe('sn.form.journal_field.changed', function() {
      setUp();
      if (!$scope.$$phase)
        $scope.$apply();
    });

    function setUp() {
      setInputValue();
    }

    function setInputValue() {
      angular.forEach($scope.formJournalFields, function(item) {
        if (typeof window.g_form === "undefined")
          return;
        item.value = g_form.getValue(item.name);
        if (!item.readonly && item.visible && (item.value !== undefined || item.value !== null) || item.value !== '') {
          $scope.$broadcast('sn.stream.input_value', item.name, item.value);
        }
      });
    }
  })
})();;
/*! RESOURCE: /scripts/app.form_presence/directive.scroll_form.js */
angular.module('sn.common.stream').directive('scrollFrom', function() {
  "use strict";
  var SCROLL_TOP_PAD = 10;
  return {
    restrict: 'A',
    link: function($scope, $element, $attrs) {
      var target = $attrs.scrollFrom;
      $j(target).click(function(evt) {
        if (window.g_form) {
          var tab = g_form._getTabNameForElement($element);
          if (tab)
            g_form.activateTab(tab);
        }
        var $scrollRoot = $element.closest('.form-group');
        if ($scrollRoot.length === 0)
          $scrollRoot = $element;
        var $scrollParent = $scrollRoot.scrollParent();
        var offset = $element.offset().top - $scrollParent.offset().top - SCROLL_TOP_PAD + $scrollParent.scrollTop();
        $scrollParent.animate({
          scrollTop: offset
        }, '500', 'swing');
        evt.stopPropagation();
      })
    }
  }
});;;
/*! RESOURCE: /scripts/doctype/GlideWebAnalytics.js */
var GlideWebAnalytics = (function() {
  function subscribe() {
    var webaChannelId = "/weba/config";
    var webaCh = window.amb.getClient().getChannel(webaChannelId);
    webaCh.subscribe(function(response) {
      if (window.NOW.webaConfig == undefined)
        window.NOW.webaConfig = {};
      var oldConfig = {
        siteId: window.NOW.webaConfig.siteId,
        trackerURL: window.NOW.webaConfig.trackerURL
      };
      window.NOW.webaConfig.siteId = response.data.weba_site_id;
      window.NOW.webaConfig.trackerURL = response.data.weba_rx_url;
      handleConfigUpdate(oldConfig, window.NOW.webaConfig);
    });
    window.amb.getClient().connect();
  }

  function handleConfigUpdate(oldConfig, newConfig) {
    if (newConfig.siteId == "0")
      removeTracker();
    else if (oldConfig.siteId != "0" && oldConfig.siteId != newConfig.siteId)
      updateTracker(oldConfig, newConfig);
    else if (oldConfig.siteId == undefined || oldConfig.siteId == "0")
      insertTracker(newConfig);
  }

  function removeTracker() {
    if (!trackerExists())
      return;
    var document = window.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var trackerScriptId = "weba";
    var trackEle = document.getElementById(trackerScriptId);
    head.removeChild(trackEle);
    var asyncTrackEle = document.getElementById('webaScript');
    if (asyncTrackEle == undefined)
      return;
    var src = asyncTrackEle.src;
    if (src != undefined && src.indexOf("piwik") > 0)
      head.removeChild(asyncTrackEle);
  }

  function updateTracker(oldConfig, newConfig) {
    var trackerScriptId = "weba";
    var trackEle = window.document.getElementById(trackerScriptId);
    var script = trackEle.text;
    if (script != undefined && script != "") {
      script = script.replace(oldConfig.siteId, newConfig.siteId);
      script = script.replace(oldConfig.trackerURL, newConfig.trackerURL);
      trackEle.text = script;
    }
  }

  function insertTracker(newConfig) {
    var document = window.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    if (trackerExists())
      return;
    if (!isConfigValid(newConfig))
      return;
    var trackerScript = generateTrackerScript(newConfig);
    var trackerElement = getOrCreateTracker();
    trackerElement.text = trackerScript;
    head.appendChild(trackerElement);
  }

  function applyTracker() {
    insertTracker(window.NOW.webaConfig);
    subscribe();
  }

  function applyTrackEvent(category, key, value, additionalValue) {
    if (!isConfigValid(window.NOW.webaConfig))
      return;
    if (!trackerExists())
      applyTracker();
    var eventItems = ["trackEvent", category, key, value, additionalValue];
    var eventScript = "_paq.push(" + JSON.stringify(eventItems) + ");";
    var head = document.head || document.getElementsByTagName('head')[0];
    var scriptEle = window.document.createElement("script");
    scriptEle.text = eventScript;
    head.appendChild(scriptEle);
  }

  function trackerExists() {
    var document = window.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var trackEle = window.document.getElementById("weba");
    if (trackEle != undefined && trackEle != null)
      return true;
    return false;
  }

  function isConfigValid(newConfig) {
    var zero = "0";
    var webaSiteId = (newConfig != undefined) ? newConfig.siteId : zero;
    var trackerURL = (newConfig != undefined) ? newConfig.trackerURL : "";
    if (webaSiteId == undefined || webaSiteId == "")
      return false;
    if (webaSiteId == zero)
      return false;
    if (trackerURL == undefined || trackerURL == "")
      return false;
    return true;
  }

  function getOrCreateTracker() {
    var trackerScriptId = "weba";
    var trackEle = window.document.getElementById(trackerScriptId);
    if (trackEle != undefined && trackEle != null)
      return trackEle;
    trackEle = window.document.createElement("script");
    trackEle.id = trackerScriptId;
    trackEle.type = "text/javascript";
    return trackEle;
  }

  function getUserId() {
    if (window.NOW.user_id != undefined && window.NOW.user_id != "")
      return window.NOW.user_id;
    else if (window.NOW.session_id != undefined)
      return window.NOW.session_id;
    else {
      var userObj = window.NOW.user;
      if (userObj != undefined)
        return userObj.userID;
    }
  }

  function generateTrackerScript(webaConfig) {
    var trackerURL = webaConfig.trackerURL;
    if (trackerURL.endsWith("/"))
      trackerURL = webaConfig.trackerURL.substring(0, trackerURL.length - 1);
    var userId = getUserId();
    var script = "var _paq = _paq || [];";
    script += "_paq.push(['setUserId', 'TRACKER_USER_ID']);";
    script += "_paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);";
    script += "(function() { var u='TRACKER_SERVER_URL';_paq.push(['setTrackerUrl', u]);_paq.push(['setSiteId', SITE_ID]);var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; g.async=true; g.defer=true; g.src='WEBA_SCRIPT_PATH'; g.id='webaScript';s.parentNode.insertBefore(g,s); })();";
    script = script.replace("TRACKER_USER_ID", userId);
    script = script.replace("TRACKER_SERVER_URL", trackerURL);
    script = script.replace("SITE_ID", webaConfig.siteId);
    script = script.replace("WEBA_SCRIPT_PATH", webaConfig.webaScriptPath);
    return script;
  }
  var api = {
    trackPage: function() {
      if (window.document.readyState == "complete")
        applyTracker();
      else
        window.addEventListener("load", function() {
          applyTracker();
        }, false);
    },
    trackEvent: function(category, key, value, additionalValue, delayInMs) {
      if (delayInMs == undefined)
        delayInMs = 3000;
      window.setTimeout(function() {
        applyTrackEvent(category, key, value, additionalValue);
      }, delayInMs);
    }
  }
  return api;
})();;;
/*! RESOURCE: /scripts/js_includes_ng_amb.js */
/*! RESOURCE: /scripts/js_includes_amb.js */
;
/*! RESOURCE: /scripts/app.ng.amb/app.ng.amb.js */
angular.module("ng.amb", ['sn.common.presence', 'sn.common.util'])
  .value("ambLogLevel", 'info')
  .value("ambServletURI", '/amb')
  .value("cometd", angular.element.cometd)
  .value("ambLoginWindow", 'true');;
/*! RESOURCE: /scripts/app.ng.amb/service.AMB.js */
angular.module("ng.amb").service("amb", function(AMBOverlay, $window, $q, $log, $rootScope, $timeout) {
  "use strict";
  var ambClient = null;
  var _window = $window.self;
  var loginWindow = null;
  var sameScope = false;
  ambClient = amb.getClient();
  if (_window.g_ambClient) {
    sameScope = true;
  }
  if (sameScope) {
    var serverConnection = ambClient.getServerConnection();
    serverConnection.loginShow = function() {
      if (!serverConnection.isLoginWindowEnabled())
        return;
      if (loginWindow && loginWindow.isVisible())
        return;
      if (serverConnection.isLoginWindowOverride())
        return;
      loginWindow = new AMBOverlay();
      loginWindow.render();
      loginWindow.show();
    };
    serverConnection.loginHide = function() {
      if (!loginWindow)
        return;
      loginWindow.hide();
      loginWindow.destroy();
      loginWindow = null;
    }
  }
  var AUTO_CONNECT_TIMEOUT = 20 * 1000;
  var connected = $q.defer();
  var connectionInterrupted = false;
  var monitorAMB = false;
  $timeout(startMonitoringAMB, AUTO_CONNECT_TIMEOUT);
  connected.promise.then(startMonitoringAMB);

  function startMonitoringAMB() {
    monitorAMB = true;
  }

  function ambInterrupted() {
    var state = ambClient.getState();
    return monitorAMB && state !== "opened" && state !== "initialized"
  }
  var interruptionTimeout;
  var extendedInterruption = false;

  function setInterrupted(eventName) {
    connectionInterrupted = true;
    $rootScope.$broadcast(eventName);
    if (!interruptionTimeout) {
      interruptionTimeout = $timeout(function() {
        extendedInterruption = true;
      }, 30 * 1000)
    }
    connected = $q.defer();
  }
  var connectOpenedEventId = ambClient.subscribeToEvent("connection.opened", function() {
    $rootScope.$broadcast("amb.connection.opened");
    if (interruptionTimeout) {
      $timeout.cancel(interruptionTimeout);
      interruptionTimeout = null;
    }
    extendedInterruption = false;
    if (connectionInterrupted) {
      connectionInterrupted = false;
      $rootScope.$broadcast("amb.connection.recovered");
    }
    connected.resolve();
  });
  var connectClosedEventId = ambClient.subscribeToEvent("connection.closed", function() {
    setInterrupted("amb.connection.closed");
  });
  var connectBrokenEventId = ambClient.subscribeToEvent("connection.broken", function() {
    setInterrupted("amb.connection.broken");
  });
  var onUnloadWindow = function() {
    ambClient.unsubscribeFromEvent(connectOpenedEventId);
    ambClient.unsubscribeFromEvent(connectClosedEventId);
    ambClient.unsubscribeFromEvent(connectBrokenEventId);
    angular.element($window).off('unload', onUnloadWindow);
  };
  angular.element($window).on('unload', onUnloadWindow);
  var documentReadyState = $window.document ? $window.document.readyState : null;
  if (documentReadyState === 'complete') {
    autoConnect();
  } else {
    angular.element($window).on('load', autoConnect);
  }
  $timeout(autoConnect, 10000);
  var initiatedConnection = false;

  function autoConnect() {
    if (!initiatedConnection) {
      initiatedConnection = true;
      ambClient.connect();
    }
  }
  return {
    getServerConnection: function() {
      return ambClient.getServerConnection();
    },
    connect: function() {
      if (initiatedConnection) {
        ambClient.connect();
      }
      return connected.promise;
    },
    get interrupted() {
      return ambInterrupted();
    },
    get extendedInterruption() {
      return extendedInterruption;
    },
    get connected() {
      return connected.promise;
    },
    abort: function() {
      ambClient.abort();
    },
    disconnect: function() {
      ambClient.disconnect();
    },
    getConnectionState: function() {
      return ambClient.getConnectionState();
    },
    getClientId: function() {
      return ambClient.getClientId();
    },
    getChannel: function(channelName) {
      return ambClient.getChannel(channelName);
    },
    registerExtension: function(extensionName, extension) {
      ambClient.registerExtension(extensionName, extension);
    },
    unregisterExtension: function(extensionName) {
      ambClient.unregisterExtension(extensionName);
    },
    batch: function(batch) {
      ambClient.batch(batch);
    },
    getState: function() {
      return ambClient.getState();
    },
    getFilterString: function(filter) {
      filter = filter.
      replace(/\^EQ/g, '').
      replace(/\^ORDERBY(?:DESC)?[^^]*/g, '').
      replace(/^GOTO/, '');
      return btoa(filter).replace(/=/g, '-');
    },
    getChannelRW: function(table, filter) {
      var t = '/rw/default/' + table + '/' + this.getFilterString(filter);
      return this.getChannel(t);
    },
    isLoggedIn: function() {
      return ambClient.isLoggedIn();
    },
    subscribeToEvent: function(event, callback) {
      return ambClient.subscribeToEvent(event, callback);
    },
    getConnectionEvents: function() {
      return ambClient.getConnectionEvents();
    },
    getEvents: function() {
      return ambClient.getConnectionEvents();
    },
    loginComplete: function() {
      ambClient.loginComplete();
    }
  };
});;
/*! RESOURCE: /scripts/app.ng.amb/controller.AMBRecordWatcher.js */
angular.module("ng.amb").controller("AMBRecordWatcher", function($scope, $timeout, $window) {
  "use strict";
  var amb = $window.top.g_ambClient;
  $scope.messages = [];
  var lastFilter;
  var watcherChannel;
  var watcher;

  function onMessage(message) {
    $scope.messages.push(message.data);
  }
  $scope.getState = function() {
    return amb.getState();
  };
  $scope.initWatcher = function() {
    angular.element(":focus").blur();
    if (!$scope.filter || $scope.filter === lastFilter)
      return;
    lastFilter = $scope.filter;
    console.log("initiating watcher on " + $scope.filter);
    $scope.messages = [];
    if (watcher) {
      watcher.unsubscribe();
    }
    var base64EncodeQuery = btoa($scope.filter).replace(/=/g, '-');
    var channelId = '/rw/' + base64EncodeQuery;
    watcherChannel = amb.getChannel(channelId)
    watcher = watcherChannel.subscribe(onMessage);
  };
  amb.connect();
});
/*! RESOURCE: /scripts/app.ng.amb/factory.snRecordWatcher.js */
angular.module("ng.amb").factory('snRecordWatcher', function($rootScope, amb, $timeout, snPresence, $log, urlTools) {
  "use strict";
  var watcherChannel;
  var connected = false;
  var diagnosticLog = true;

  function initWatcher(table, sys_id, query) {
    if (!table)
      return;
    if (sys_id)
      var filter = "sys_id=" + sys_id;
    else
      filter = query;
    if (!filter)
      return;
    return initChannel(table, filter);
  }

  function initList(table, query) {
    if (!table)
      return;
    query = query || "sys_idISNOTEMPTY";
    return initChannel(table, query);
  }

  function initTaskList(list, prevChannel) {
    if (prevChannel)
      prevChannel.unsubscribe();
    var sys_ids = list.toString();
    var filter = "sys_idIN" + sys_ids;
    return initChannel("task", filter);
  }

  function initChannel(table, filter) {
    if (isBlockedTable(table)) {
      $log.log("Blocked from watching", table);
      return null;
    }
    if (diagnosticLog)
      log(">>> init " + table + "?" + filter);
    watcherChannel = amb.getChannelRW(table, filter);
    watcherChannel.subscribe(onMessage);
    amb.connect();
    return watcherChannel;
  }

  function onMessage(message) {
    var r = message.data;
    var c = message.channel;
    if (diagnosticLog)
      log(">>> record " + r.operation + ": " + r.table_name + "." + r.sys_id + " " + r.display_value);
    $rootScope.$broadcast('record.updated', r);
    $rootScope.$broadcast("sn.stream.tap");
    $rootScope.$broadcast('list.updated', r, c);
  }

  function log(message) {
    $log.log(message);
  }

  function isBlockedTable(table) {
    return table == 'sys_amb_message' || table.startsWith('sys_rw');
  }
  return {
    initTaskList: initTaskList,
    initChannel: initChannel,
    init: function() {
      var location = urlTools.parseQueryString(window.location.search);
      var table = location['table'] || location['sysparm_table'];
      var sys_id = location['sys_id'] || location['sysparm_sys_id'];
      var query = location['sysparm_query'];
      initWatcher(table, sys_id, query);
      snPresence.init(table, sys_id, query);
    },
    initList: initList,
    initRecord: function(table, sysId) {
      initWatcher(table, sysId, null);
      snPresence.initPresence(table, sysId);
    },
    _initWatcher: initWatcher
  }
});;
/*! RESOURCE: /scripts/app.ng.amb/factory.AMBOverlay.js */
angular.module("ng.amb").factory("AMBOverlay", function($templateCache, $compile, $rootScope) {
  "use strict";
  var showCallbacks = [],
    hideCallbacks = [],
    isRendered = false,
    modal,
    modalScope,
    modalOptions;
  var defaults = {
    backdrop: 'static',
    keyboard: false,
    show: true
  };

  function AMBOverlay(config) {
    config = config || {};
    if (angular.isFunction(config.onShow))
      showCallbacks.push(config.onShow);
    if (angular.isFunction(config.onHide))
      hideCallbacks.push(config.onHide);

    function lazyRender() {
      if (!angular.element('html')['modal']) {
        var bootstrapInclude = "/scripts/bootstrap3/bootstrap.js";
        ScriptLoader.getScripts([bootstrapInclude], renderModal);
      } else
        renderModal();
    }

    function renderModal() {
      if (isRendered)
        return;
      modalScope = angular.extend($rootScope.$new(), config);
      modal = $compile($templateCache.get("amb_disconnect_modal.xml"))(modalScope);
      angular.element("body").append(modal);
      modal.on("shown.bs.modal", function(e) {
        for (var i = 0, len = showCallbacks.length; i < len; i++)
          showCallbacks[i](e);
      });
      modal.on("hidden.bs.modal", function(e) {
        for (var i = 0, len = hideCallbacks.length; i < len; i++)
          hideCallbacks[i](e);
      });
      modalOptions = angular.extend({}, defaults, config);
      modal.modal(modalOptions);
      isRendered = true;
    }

    function showModal() {
      if (isRendered)
        modal.modal('show');
    }

    function hideModal() {
      if (isRendered)
        modal.modal('hide');
    }

    function destroyModal() {
      if (!isRendered)
        return;
      modal.modal('hide');
      modal.remove();
      modalScope.$destroy();
      modalScope = void(0);
      isRendered = false;
      var pos = showCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        showCallbacks.splice(pos, 1);
      pos = hideCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        hideCallbacks.splice(pos, 1);
    }
    return {
      render: lazyRender,
      destroy: destroyModal,
      show: showModal,
      hide: hideModal,
      isVisible: function() {
        if (!isRendered)
          false;
        return modal.visible();
      }
    }
  }
  $templateCache.put('amb_disconnect_modal.xml',
    '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
    '	<div class="modal-dialog small-modal" style="width:450px">' +
    '		<div class="modal-content">' +
    '			<header class="modal-header">' +
    '				<h4 id="small_modal1_title" class="modal-title">{{title || "Login"}}</h4>' +
    '			</header>' +
    '			<div class="modal-body">' +
    '			<iframe class="concourse_modal" ng-src=\'{{iframe || "/amb_login.do"}}\' frameborder="0" scrolling="no" height="400px" width="405px"></iframe>' +
    '			</div>' +
    '		</div>' +
    '	</div>' +
    '</div>'
  );
  return AMBOverlay;
});;;
/*! RESOURCE: /scripts/angularjs-1.4/thirdparty/angular-ui-bootstrap/ui-bootstrap-tpls-0.12.1.js */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.alert", "ui.bootstrap.bindHtml", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.dateparser", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.dropdown", "ui.bootstrap.modal", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html", "template/accordion/accordion.html", "template/alert/alert.html", "template/carousel/carousel.html", "template/carousel/slide.html", "template/datepicker/datepicker.html", "template/datepicker/day.html", "template/datepicker/month.html", "template/datepicker/popup.html", "template/datepicker/year.html", "template/modal/backdrop.html", "template/modal/window.html", "template/pagination/pager.html", "template/pagination/pagination.html", "template/tooltip/tooltip-html-unsafe-popup.html", "template/tooltip/tooltip-popup.html", "template/popover/popover.html", "template/progressbar/bar.html", "template/progressbar/progress.html", "template/progressbar/progressbar.html", "template/rating/rating.html", "template/tabs/tab.html", "template/tabs/tabset.html", "template/timepicker/timepicker.html", "template/typeahead/typeahead-match.html", "template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.transition', [])
  .factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {
    var $transition = function(element, trigger, options) {
      options = options || {};
      var deferred = $q.defer();
      var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];
      var transitionEndHandler = function(event) {
        $rootScope.$apply(function() {
          element.unbind(endEventName, transitionEndHandler);
          deferred.resolve(element);
        });
      };
      if (endEventName) {
        element.bind(endEventName, transitionEndHandler);
      }
      $timeout(function() {
        if (angular.isString(trigger)) {
          element.addClass(trigger);
        } else if (angular.isFunction(trigger)) {
          trigger(element);
        } else if (angular.isObject(trigger)) {
          element.css(trigger);
        }
        if (!endEventName) {
          deferred.resolve(element);
        }
      });
      deferred.promise.cancel = function() {
        if (endEventName) {
          element.unbind(endEventName, transitionEndHandler);
        }
        deferred.reject('Transition cancelled');
      };
      return deferred.promise;
    };
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'transition': 'transitionend'
    };
    var animationEndEventNames = {
      'WebkitTransition': 'webkitAnimationEnd',
      'MozTransition': 'animationend',
      'OTransition': 'oAnimationEnd',
      'transition': 'animationend'
    };

    function findEndEventName(endEventNames) {
      for (var name in endEventNames) {
        if (transElement.style[name] !== undefined) {
          return endEventNames[name];
        }
      }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
  }]);
angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])
  .directive('collapse', ['$transition', function($transition) {
    return {
      link: function(scope, element, attrs) {
        var initialAnimSkip = true;
        var currentTransition;

        function doTransition(change) {
          var newTransition = $transition(element, change);
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function expand() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            expandDone();
          } else {
            element.removeClass('collapse').addClass('collapsing');
            doTransition({
              height: element[0].scrollHeight + 'px'
            }).then(expandDone);
          }
        }

        function expandDone() {
          element.removeClass('collapsing');
          element.addClass('collapse in');
          element.css({
            height: 'auto'
          });
        }

        function collapse() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            element.css({
              height: 0
            });
          } else {
            element.css({
              height: element[0].scrollHeight + 'px'
            });
            var x = element[0].offsetWidth;
            element.removeClass('collapse in').addClass('collapsing');
            doTransition({
              height: 0
            }).then(collapseDone);
          }
        }

        function collapseDone() {
          element.removeClass('collapsing');
          element.addClass('collapse');
        }
        scope.$watch(attrs.collapse, function(shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);
angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])
  .constant('accordionConfig', {
    closeOthers: true
  })
  .controller('AccordionController', ['$scope', '$attrs', 'accordionConfig', function($scope, $attrs, accordionConfig) {
    this.groups = [];
    this.closeOthers = function(openGroup) {
      var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
      if (closeOthers) {
        angular.forEach(this.groups, function(group) {
          if (group !== openGroup) {
            group.isOpen = false;
          }
        });
      }
    };
    this.addGroup = function(groupScope) {
      var that = this;
      this.groups.push(groupScope);
      groupScope.$on('$destroy', function(event) {
        that.removeGroup(groupScope);
      });
    };
    this.removeGroup = function(group) {
      var index = this.groups.indexOf(group);
      if (index !== -1) {
        this.groups.splice(index, 1);
      }
    };
  }])
  .directive('accordion', function() {
    return {
      restrict: 'EA',
      controller: 'AccordionController',
      transclude: true,
      replace: false,
      templateUrl: 'template/accordion/accordion.html'
    };
  })
  .directive('accordionGroup', function() {
    return {
      require: '^accordion',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/accordion/accordion-group.html',
      scope: {
        heading: '@',
        isOpen: '=?',
        isDisabled: '=?'
      },
      controller: function() {
        this.setHeading = function(element) {
          this.heading = element;
        };
      },
      link: function(scope, element, attrs, accordionCtrl) {
        accordionCtrl.addGroup(scope);
        scope.$watch('isOpen', function(value) {
          if (value) {
            accordionCtrl.closeOthers(scope);
          }
        });
        scope.toggleOpen = function() {
          if (!scope.isDisabled) {
            scope.isOpen = !scope.isOpen;
          }
        };
      }
    };
  })
  .directive('accordionHeading', function() {
    return {
      restrict: 'EA',
      transclude: true,
      template: '',
      replace: true,
      require: '^accordionGroup',
      link: function(scope, element, attr, accordionGroupCtrl, transclude) {
        accordionGroupCtrl.setHeading(transclude(scope, function() {}));
      }
    };
  })
  .directive('accordionTransclude', function() {
    return {
      require: '^accordionGroup',
      link: function(scope, element, attr, controller) {
        scope.$watch(function() {
          return controller[attr.accordionTransclude];
        }, function(heading) {
          if (heading) {
            element.html('');
            element.append(heading);
          }
        });
      }
    };
  });
angular.module('ui.bootstrap.alert', [])
  .controller('AlertController', ['$scope', '$attrs', function($scope, $attrs) {
    $scope.closeable = 'close' in $attrs;
    this.close = $scope.close;
  }])
  .directive('alert', function() {
    return {
      restrict: 'EA',
      controller: 'AlertController',
      templateUrl: 'template/alert/alert.html',
      transclude: true,
      replace: true,
      scope: {
        type: '@',
        close: '&'
      }
    };
  })
  .directive('dismissOnTimeout', ['$timeout', function($timeout) {
    return {
      require: 'alert',
      link: function(scope, element, attrs, alertCtrl) {
        $timeout(function() {
          alertCtrl.close();
        }, parseInt(attrs.dismissOnTimeout, 10));
      }
    };
  }]);
angular.module('ui.bootstrap.bindHtml', [])
  .directive('bindHtmlUnsafe', function() {
    return function(scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
  });
angular.module('ui.bootstrap.buttons', [])
  .constant('buttonConfig', {
    activeClass: 'active',
    toggleEvent: 'click'
  })
  .controller('ButtonsController', ['buttonConfig', function(buttonConfig) {
    this.activeClass = buttonConfig.activeClass || 'active';
    this.toggleEvent = buttonConfig.toggleEvent || 'click';
  }])
  .directive('btnRadio', function() {
    return {
      require: ['btnRadio', 'ngModel'],
      controller: 'ButtonsController',
      link: function(scope, element, attrs, ctrls) {
        var buttonsCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        ngModelCtrl.$render = function() {
          element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
        };
        element.bind(buttonsCtrl.toggleEvent, function() {
          var isActive = element.hasClass(buttonsCtrl.activeClass);
          if (!isActive || angular.isDefined(attrs.uncheckable)) {
            scope.$apply(function() {
              ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.btnRadio));
              ngModelCtrl.$render();
            });
          }
        });
      }
    };
  })
  .directive('btnCheckbox', function() {
    return {
      require: ['btnCheckbox', 'ngModel'],
      controller: 'ButtonsController',
      link: function(scope, element, attrs, ctrls) {
        var buttonsCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];

        function getTrueValue() {
          return getCheckboxValue(attrs.btnCheckboxTrue, true);
        }

        function getFalseValue() {
          return getCheckboxValue(attrs.btnCheckboxFalse, false);
        }

        function getCheckboxValue(attributeValue, defaultValue) {
          var val = scope.$eval(attributeValue);
          return angular.isDefined(val) ? val : defaultValue;
        }
        ngModelCtrl.$render = function() {
          element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
        };
        element.bind(buttonsCtrl.toggleEvent, function() {
          scope.$apply(function() {
            ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
            ngModelCtrl.$render();
          });
        });
      }
    };
  });
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
  .controller('CarouselController', ['$scope', '$timeout', '$interval', '$transition', function($scope, $timeout, $interval, $transition) {
    var self = this,
      slides = self.slides = $scope.slides = [],
      currentIndex = -1,
      currentInterval, isPlaying;
    self.currentSlide = null;
    var destroyed = false;
    self.select = $scope.select = function(nextSlide, direction) {
      var nextIndex = slides.indexOf(nextSlide);
      if (direction === undefined) {
        direction = nextIndex > currentIndex ? 'next' : 'prev';
      }
      if (nextSlide && nextSlide !== self.currentSlide) {
        if ($scope.$currentTransition) {
          $scope.$currentTransition.cancel();
          $timeout(goNext);
        } else {
          goNext();
        }
      }

      function goNext() {
        if (destroyed) {
          return;
        }
        if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
          nextSlide.$element.addClass(direction);
          var reflow = nextSlide.$element[0].offsetWidth;
          angular.forEach(slides, function(slide) {
            angular.extend(slide, {
              direction: '',
              entering: false,
              leaving: false,
              active: false
            });
          });
          angular.extend(nextSlide, {
            direction: direction,
            active: true,
            entering: true
          });
          angular.extend(self.currentSlide || {}, {
            direction: direction,
            leaving: true
          });
          $scope.$currentTransition = $transition(nextSlide.$element, {});
          (function(next, current) {
            $scope.$currentTransition.then(
              function() {
                transitionDone(next, current);
              },
              function() {
                transitionDone(next, current);
              }
            );
          }(nextSlide, self.currentSlide));
        } else {
          transitionDone(nextSlide, self.currentSlide);
        }
        self.currentSlide = nextSlide;
        currentIndex = nextIndex;
        restartTimer();
      }

      function transitionDone(next, current) {
        angular.extend(next, {
          direction: '',
          active: true,
          leaving: false,
          entering: false
        });
        angular.extend(current || {}, {
          direction: '',
          active: false,
          leaving: false,
          entering: false
        });
        $scope.$currentTransition = null;
      }
    };
    $scope.$on('$destroy', function() {
      destroyed = true;
    });
    self.indexOfSlide = function(slide) {
      return slides.indexOf(slide);
    };
    $scope.next = function() {
      var newIndex = (currentIndex + 1) % slides.length;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'next');
      }
    };
    $scope.prev = function() {
      var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'prev');
      }
    };
    $scope.isActive = function(slide) {
      return self.currentSlide === slide;
    };
    $scope.$watch('interval', restartTimer);
    $scope.$on('$destroy', resetTimer);

    function restartTimer() {
      resetTimer();
      var interval = +$scope.interval;
      if (!isNaN(interval) && interval > 0) {
        currentInterval = $interval(timerFn, interval);
      }
    }

    function resetTimer() {
      if (currentInterval) {
        $interval.cancel(currentInterval);
        currentInterval = null;
      }
    }

    function timerFn() {
      var interval = +$scope.interval;
      if (isPlaying && !isNaN(interval) && interval > 0) {
        $scope.next();
      } else {
        $scope.pause();
      }
    }
    $scope.play = function() {
      if (!isPlaying) {
        isPlaying = true;
        restartTimer();
      }
    };
    $scope.pause = function() {
      if (!$scope.noPause) {
        isPlaying = false;
        resetTimer();
      }
    };
    self.addSlide = function(slide, element) {
      slide.$element = element;
      slides.push(slide);
      if (slides.length === 1 || slide.active) {
        self.select(slides[slides.length - 1]);
        if (slides.length == 1) {
          $scope.play();
        }
      } else {
        slide.active = false;
      }
    };
    self.removeSlide = function(slide) {
      var index = slides.indexOf(slide);
      slides.splice(index, 1);
      if (slides.length > 0 && slide.active) {
        if (index >= slides.length) {
          self.select(slides[index - 1]);
        } else {
          self.select(slides[index]);
        }
      } else if (currentIndex > index) {
        currentIndex--;
      }
    };
  }])
  .directive('carousel', [function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'CarouselController',
      require: 'carousel',
      templateUrl: 'template/carousel/carousel.html',
      scope: {
        interval: '=',
        noTransition: '=',
        noPause: '='
      }
    };
  }])
  .directive('slide', function() {
    return {
      require: '^carousel',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/carousel/slide.html',
      scope: {
        active: '=?'
      },
      link: function(scope, element, attrs, carouselCtrl) {
        carouselCtrl.addSlide(scope, element);
        scope.$on('$destroy', function() {
          carouselCtrl.removeSlide(scope);
        });
        scope.$watch('active', function(active) {
          if (active) {
            carouselCtrl.select(scope);
          }
        });
      }
    };
  });
angular.module('ui.bootstrap.dateparser', [])
  .service('dateParser', ['$locale', 'orderByFilter', function($locale, orderByFilter) {
    this.parsers = {};
    var formatCodeToRegex = {
      'yyyy': {
        regex: '\\d{4}',
        apply: function(value) {
          this.year = +value;
        }
      },
      'yy': {
        regex: '\\d{2}',
        apply: function(value) {
          this.year = +value + 2000;
        }
      },
      'y': {
        regex: '\\d{1,4}',
        apply: function(value) {
          this.year = +value;
        }
      },
      'MMMM': {
        regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
        apply: function(value) {
          this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value);
        }
      },
      'MMM': {
        regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
        apply: function(value) {
          this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value);
        }
      },
      'MM': {
        regex: '0[1-9]|1[0-2]',
        apply: function(value) {
          this.month = value - 1;
        }
      },
      'M': {
        regex: '[1-9]|1[0-2]',
        apply: function(value) {
          this.month = value - 1;
        }
      },
      'dd': {
        regex: '[0-2][0-9]{1}|3[0-1]{1}',
        apply: function(value) {
          this.date = +value;
        }
      },
      'd': {
        regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
        apply: function(value) {
          this.date = +value;
        }
      },
      'EEEE': {
        regex: $locale.DATETIME_FORMATS.DAY.join('|')
      },
      'EEE': {
        regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|')
      }
    };

    function createParser(format) {
      var map = [],
        regex = format.split('');
      angular.forEach(formatCodeToRegex, function(data, code) {
        var index = format.indexOf(code);
        if (index > -1) {
          format = format.split('');
          regex[index] = '(' + data.regex + ')';
          format[index] = '$';
          for (var i = index + 1, n = index + code.length; i < n; i++) {
            regex[i] = '';
            format[i] = '$';
          }
          format = format.join('');
          map.push({
            index: index,
            apply: data.apply
          });
        }
      });
      return {
        regex: new RegExp('^' + regex.join('') + '$'),
        map: orderByFilter(map, 'index')
      };
    }
    this.parse = function(input, format) {
      if (!angular.isString(input) || !format) {
        return input;
      }
      format = $locale.DATETIME_FORMATS[format] || format;
      if (!this.parsers[format]) {
        this.parsers[format] = createParser(format);
      }
      var parser = this.parsers[format],
        regex = parser.regex,
        map = parser.map,
        results = input.match(regex);
      if (results && results.length) {
        var fields = {
            year: 1900,
            month: 0,
            date: 1,
            hours: 0
          },
          dt;
        for (var i = 1, n = results.length; i < n; i++) {
          var mapper = map[i - 1];
          if (mapper.apply) {
            mapper.apply.call(fields, results[i]);
          }
        }
        if (isValid(fields.year, fields.month, fields.date)) {
          dt = new Date(fields.year, fields.month, fields.date, fields.hours);
        }
        return dt;
      }
    };

    function isValid(year, month, date) {
      if (month === 1 && date > 28) {
        return date === 29 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
      }
      if (month === 3 || month === 5 || month === 8 || month === 10) {
        return date < 31;
      }
      return true;
    }
  }]);
angular.module('ui.bootstrap.position', [])
  .factory('$position', ['$document', '$window', function($document, $window) {
    function getStyle(el, cssprop) {
      if (el.currentStyle) {
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      return el.style[cssprop];
    }

    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static') === 'static';
    }
    var parentOffsetEl = function(element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };
    return {
      position: function(element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = {
          top: 0,
          left: 0
        };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },
      offset: function(element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },
      positionElements: function(hostEl, targetEl, positionStr, appendToBody) {
        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0],
          pos1 = positionStrParts[1] || 'center';
        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;
        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);
        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');
        var shiftWidth = {
          center: function() {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function() {
            return hostElPos.left;
          },
          right: function() {
            return hostElPos.left + hostElPos.width;
          }
        };
        var shiftHeight = {
          center: function() {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function() {
            return hostElPos.top;
          },
          bottom: function() {
            return hostElPos.top + hostElPos.height;
          }
        };
        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }
        return targetElPos;
      }
    };
  }]);
angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.position'])
  .constant('datepickerConfig', {
    formatDay: 'dd',
    formatMonth: 'MMMM',
    formatYear: 'yyyy',
    formatDayHeader: 'EEE',
    formatDayTitle: 'MMMM yyyy',
    formatMonthTitle: 'yyyy',
    datepickerMode: 'day',
    minMode: 'day',
    maxMode: 'year',
    showWeeks: true,
    startingDay: 0,
    yearRange: 20,
    minDate: null,
    maxDate: null
  })
  .controller('DatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$timeout', '$log', 'dateFilter', 'datepickerConfig', function($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
    var self = this,
      ngModelCtrl = {
        $setViewValue: angular.noop
      };
    this.modes = ['day', 'month', 'year'];
    angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle',
      'minMode', 'maxMode', 'showWeeks', 'startingDay', 'yearRange'
    ], function(key, index) {
      self[key] = angular.isDefined($attrs[key]) ? (index < 8 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : datepickerConfig[key];
    });
    angular.forEach(['minDate', 'maxDate'], function(key) {
      if ($attrs[key]) {
        $scope.$parent.$watch($parse($attrs[key]), function(value) {
          self[key] = value ? new Date(value) : null;
          self.refreshView();
        });
      } else {
        self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
      }
    });
    $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
    $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
    this.activeDate = angular.isDefined($attrs.initDate) ? $scope.$parent.$eval($attrs.initDate) : new Date();
    $scope.isActive = function(dateObject) {
      if (self.compare(dateObject.date, self.activeDate) === 0) {
        $scope.activeDateId = dateObject.uid;
        return true;
      }
      return false;
    };
    this.init = function(ngModelCtrl_) {
      ngModelCtrl = ngModelCtrl_;
      ngModelCtrl.$render = function() {
        self.render();
      };
    };
    this.render = function() {
      if (ngModelCtrl.$modelValue) {
        var date = new Date(ngModelCtrl.$modelValue),
          isValid = !isNaN(date);
        if (isValid) {
          this.activeDate = date;
        } else {
          $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
        }
        ngModelCtrl.$setValidity('date', isValid);
      }
      this.refreshView();
    };
    this.refreshView = function() {
      if (this.element) {
        this._refreshView();
        var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
        ngModelCtrl.$setValidity('date-disabled', !date || (this.element && !this.isDisabled(date)));
      }
    };
    this.createDateObject = function(date, format) {
      var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
      return {
        date: date,
        label: dateFilter(date, format),
        selected: model && this.compare(date, model) === 0,
        disabled: this.isDisabled(date),
        current: this.compare(date, new Date()) === 0
      };
    };
    this.isDisabled = function(date) {
      return ((this.minDate && this.compare(date, this.minDate) < 0) || (this.maxDate && this.compare(date, this.maxDate) > 0) || ($attrs.dateDisabled && $scope.dateDisabled({
        date: date,
        mode: $scope.datepickerMode
      })));
    };
    this.split = function(arr, size) {
      var arrays = [];
      while (arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    };
    $scope.select = function(date) {
      if ($scope.datepickerMode === self.minMode) {
        var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
        dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        ngModelCtrl.$setViewValue(dt);
        ngModelCtrl.$render();
      } else {
        self.activeDate = date;
        $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) - 1];
      }
    };
    $scope.move = function(direction) {
      var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
        month = self.activeDate.getMonth() + direction * (self.step.months || 0);
      self.activeDate.setFullYear(year, month, 1);
      self.refreshView();
    };
    $scope.toggleMode = function(direction) {
      direction = direction || 1;
      if (($scope.datepickerMode === self.maxMode && direction === 1) || ($scope.datepickerMode === self.minMode && direction === -1)) {
        return;
      }
      $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) + direction];
    };
    $scope.keys = {
      13: 'enter',
      32: 'space',
      33: 'pageup',
      34: 'pagedown',
      35: 'end',
      36: 'home',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };
    var focusElement = function() {
      $timeout(function() {
        self.element[0].focus();
      }, 0, false);
    };
    $scope.$on('datepicker.focus', focusElement);
    $scope.keydown = function(evt) {
      var key = $scope.keys[evt.which];
      if (!key || evt.shiftKey || evt.altKey) {
        return;
      }
      evt.preventDefault();
      evt.stopPropagation();
      if (key === 'enter' || key === 'space') {
        if (self.isDisabled(self.activeDate)) {
          return;
        }
        $scope.select(self.activeDate);
        focusElement();
      } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
        $scope.toggleMode(key === 'up' ? 1 : -1);
        focusElement();
      } else {
        self.handleKeyDown(key, evt);
        self.refreshView();
      }
    };
  }])
  .directive('datepicker', function() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/datepicker.html',
      scope: {
        datepickerMode: '=?',
        dateDisabled: '&'
      },
      require: ['datepicker', '?^ngModel'],
      controller: 'DatepickerController',
      link: function(scope, element, attrs, ctrls) {
        var datepickerCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        if (ngModelCtrl) {
          datepickerCtrl.init(ngModelCtrl);
        }
      }
    };
  })
  .directive('daypicker', ['dateFilter', function(dateFilter) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/day.html',
      require: '^datepicker',
      link: function(scope, element, attrs, ctrl) {
        scope.showWeeks = ctrl.showWeeks;
        ctrl.step = {
          months: 1
        };
        ctrl.element = element;
        var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        function getDaysInMonth(year, month) {
          return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
        }

        function getDates(startDate, n) {
          var dates = new Array(n),
            current = new Date(startDate),
            i = 0;
          current.setHours(12);
          while (i < n) {
            dates[i++] = new Date(current);
            current.setDate(current.getDate() + 1);
          }
          return dates;
        }
        ctrl._refreshView = function() {
          var year = ctrl.activeDate.getFullYear(),
            month = ctrl.activeDate.getMonth(),
            firstDayOfMonth = new Date(year, month, 1),
            difference = ctrl.startingDay - firstDayOfMonth.getDay(),
            numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
            firstDate = new Date(firstDayOfMonth);
          if (numDisplayedFromPreviousMonth > 0) {
            firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
          }
          var days = getDates(firstDate, 42);
          for (var i = 0; i < 42; i++) {
            days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
              secondary: days[i].getMonth() !== month,
              uid: scope.uniqueId + '-' + i
            });
          }
          scope.labels = new Array(7);
          for (var j = 0; j < 7; j++) {
            scope.labels[j] = {
              abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
              full: dateFilter(days[j].date, 'EEEE')
            };
          }
          scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
          scope.rows = ctrl.split(days, 7);
          if (scope.showWeeks) {
            scope.weekNumbers = [];
            var weekNumber = getISO8601WeekNumber(scope.rows[0][0].date),
              numWeeks = scope.rows.length;
            while (scope.weekNumbers.push(weekNumber++) < numWeeks) {}
          }
        };
        ctrl.compare = function(date1, date2) {
          return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
        };

        function getISO8601WeekNumber(date) {
          var checkDate = new Date(date);
          checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
          var time = checkDate.getTime();
          checkDate.setMonth(0);
          checkDate.setDate(1);
          return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
        }
        ctrl.handleKeyDown = function(key, evt) {
          var date = ctrl.activeDate.getDate();
          if (key === 'left') {
            date = date - 1;
          } else if (key === 'up') {
            date = date - 7;
          } else if (key === 'right') {
            date = date + 1;
          } else if (key === 'down') {
            date = date + 7;
          } else if (key === 'pageup' || key === 'pagedown') {
            var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
            ctrl.activeDate.setMonth(month, 1);
            date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date);
          } else if (key === 'home') {
            date = 1;
          } else if (key === 'end') {
            date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
          }
          ctrl.activeDate.setDate(date);
        };
        ctrl.refreshView();
      }
    };
  }])
  .directive('monthpicker', ['dateFilter', function(dateFilter) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/month.html',
      require: '^datepicker',
      link: function(scope, element, attrs, ctrl) {
        ctrl.step = {
          years: 1
        };
        ctrl.element = element;
        ctrl._refreshView = function() {
          var months = new Array(12),
            year = ctrl.activeDate.getFullYear();
          for (var i = 0; i < 12; i++) {
            months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {
              uid: scope.uniqueId + '-' + i
            });
          }
          scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
          scope.rows = ctrl.split(months, 3);
        };
        ctrl.compare = function(date1, date2) {
          return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
        };
        ctrl.handleKeyDown = function(key, evt) {
          var date = ctrl.activeDate.getMonth();
          if (key === 'left') {
            date = date - 1;
          } else if (key === 'up') {
            date = date - 3;
          } else if (key === 'right') {
            date = date + 1;
          } else if (key === 'down') {
            date = date + 3;
          } else if (key === 'pageup' || key === 'pagedown') {
            var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? -1 : 1);
            ctrl.activeDate.setFullYear(year);
          } else if (key === 'home') {
            date = 0;
          } else if (key === 'end') {
            date = 11;
          }
          ctrl.activeDate.setMonth(date);
        };
        ctrl.refreshView();
      }
    };
  }])
  .directive('yearpicker', ['dateFilter', function(dateFilter) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/year.html',
      require: '^datepicker',
      link: function(scope, element, attrs, ctrl) {
        var range = ctrl.yearRange;
        ctrl.step = {
          years: range
        };
        ctrl.element = element;

        function getStartingYear(year) {
          return parseInt((year - 1) / range, 10) * range + 1;
        }
        ctrl._refreshView = function() {
          var years = new Array(range);
          for (var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()); i < range; i++) {
            years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {
              uid: scope.uniqueId + '-' + i
            });
          }
          scope.title = [years[0].label, years[range - 1].label].join(' - ');
          scope.rows = ctrl.split(years, 5);
        };
        ctrl.compare = function(date1, date2) {
          return date1.getFullYear() - date2.getFullYear();
        };
        ctrl.handleKeyDown = function(key, evt) {
          var date = ctrl.activeDate.getFullYear();
          if (key === 'left') {
            date = date - 1;
          } else if (key === 'up') {
            date = date - 5;
          } else if (key === 'right') {
            date = date + 1;
          } else if (key === 'down') {
            date = date + 5;
          } else if (key === 'pageup' || key === 'pagedown') {
            date += (key === 'pageup' ? -1 : 1) * ctrl.step.years;
          } else if (key === 'home') {
            date = getStartingYear(ctrl.activeDate.getFullYear());
          } else if (key === 'end') {
            date = getStartingYear(ctrl.activeDate.getFullYear()) + range - 1;
          }
          ctrl.activeDate.setFullYear(date);
        };
        ctrl.refreshView();
      }
    };
  }])
  .constant('datepickerPopupConfig', {
    datepickerPopup: 'yyyy-MM-dd',
    currentText: 'Today',
    clearText: 'Clear',
    closeText: 'Done',
    closeOnDateSelection: true,
    appendToBody: false,
    showButtonBar: true
  })
  .directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'dateParser', 'datepickerPopupConfig',
    function($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig) {
      return {
        restrict: 'EA',
        require: 'ngModel',
        scope: {
          isOpen: '=?',
          currentText: '@',
          clearText: '@',
          closeText: '@',
          dateDisabled: '&'
        },
        link: function(scope, element, attrs, ngModel) {
          var dateFormat,
            closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
            appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;
          scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;
          scope.getText = function(key) {
            return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
          };
          attrs.$observe('datepickerPopup', function(value) {
            dateFormat = value || datepickerPopupConfig.datepickerPopup;
            ngModel.$render();
          });
          var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
          popupEl.attr({
            'ng-model': 'date',
            'ng-change': 'dateSelection()'
          });

          function cameltoDash(string) {
            return string.replace(/([A-Z])/g, function($1) {
              return '-' + $1.toLowerCase();
            });
          }
          var datepickerEl = angular.element(popupEl.children()[0]);
          if (attrs.datepickerOptions) {
            angular.forEach(scope.$parent.$eval(attrs.datepickerOptions), function(value, option) {
              datepickerEl.attr(cameltoDash(option), value);
            });
          }
          scope.watchData = {};
          angular.forEach(['minDate', 'maxDate', 'datepickerMode'], function(key) {
            if (attrs[key]) {
              var getAttribute = $parse(attrs[key]);
              scope.$parent.$watch(getAttribute, function(value) {
                scope.watchData[key] = value;
              });
              datepickerEl.attr(cameltoDash(key), 'watchData.' + key);
              if (key === 'datepickerMode') {
                var setAttribute = getAttribute.assign;
                scope.$watch('watchData.' + key, function(value, oldvalue) {
                  if (value !== oldvalue) {
                    setAttribute(scope.$parent, value);
                  }
                });
              }
            }
          });
          if (attrs.dateDisabled) {
            datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
          }

          function parseDate(viewValue) {
            if (!viewValue) {
              ngModel.$setValidity('date', true);
              return null;
            } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
              ngModel.$setValidity('date', true);
              return viewValue;
            } else if (angular.isString(viewValue)) {
              var date = dateParser.parse(viewValue, dateFormat) || new Date(viewValue);
              if (isNaN(date)) {
                ngModel.$setValidity('date', false);
                return undefined;
              } else {
                ngModel.$setValidity('date', true);
                return date;
              }
            } else {
              ngModel.$setValidity('date', false);
              return undefined;
            }
          }
          ngModel.$parsers.unshift(parseDate);
          scope.dateSelection = function(dt) {
            if (angular.isDefined(dt)) {
              scope.date = dt;
            }
            ngModel.$setViewValue(scope.date);
            ngModel.$render();
            if (closeOnDateSelection) {
              scope.isOpen = false;
              element[0].focus();
            }
          };
          element.bind('input change keyup', function() {
            scope.$apply(function() {
              scope.date = ngModel.$modelValue;
            });
          });
          ngModel.$render = function() {
            var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
            element.val(date);
            scope.date = parseDate(ngModel.$modelValue);
          };
          var documentClickBind = function(event) {
            if (scope.isOpen && event.target !== element[0]) {
              scope.$apply(function() {
                scope.isOpen = false;
              });
            }
          };
          var keydown = function(evt, noApply) {
            scope.keydown(evt);
          };
          element.bind('keydown', keydown);
          scope.keydown = function(evt) {
            if (evt.which === 27) {
              evt.preventDefault();
              evt.stopPropagation();
              scope.close();
            } else if (evt.which === 40 && !scope.isOpen) {
              scope.isOpen = true;
            }
          };
          scope.$watch('isOpen', function(value) {
            if (value) {
              scope.$broadcast('datepicker.focus');
              scope.position = appendToBody ? $position.offset(element) : $position.position(element);
              scope.position.top = scope.position.top + element.prop('offsetHeight');
              $document.bind('click', documentClickBind);
            } else {
              $document.unbind('click', documentClickBind);
            }
          });
          scope.select = function(date) {
            if (date === 'today') {
              var today = new Date();
              if (angular.isDate(ngModel.$modelValue)) {
                date = new Date(ngModel.$modelValue);
                date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
              } else {
                date = new Date(today.setHours(0, 0, 0, 0));
              }
            }
            scope.dateSelection(date);
          };
          scope.close = function() {
            scope.isOpen = false;
            element[0].focus();
          };
          var $popup = $compile(popupEl)(scope);
          popupEl.remove();
          if (appendToBody) {
            $document.find('body').append($popup);
          } else {
            element.after($popup);
          }
          scope.$on('$destroy', function() {
            $popup.remove();
            element.unbind('keydown', keydown);
            $document.unbind('click', documentClickBind);
          });
        }
      };
    }
  ])
  .directive('datepickerPopupWrap', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      templateUrl: 'template/datepicker/popup.html',
      link: function(scope, element, attrs) {
        element.bind('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
        });
      }
    };
  });
angular.module('ui.bootstrap.dropdown', [])
  .constant('dropdownConfig', {
    openClass: 'open'
  })
  .service('dropdownService', ['$document', function($document) {
    var openScope = null;
    this.open = function(dropdownScope) {
      if (!openScope) {
        $document.bind('click', closeDropdown);
        $document.bind('keydown', escapeKeyBind);
      }
      if (openScope && openScope !== dropdownScope) {
        openScope.isOpen = false;
      }
      openScope = dropdownScope;
    };
    this.close = function(dropdownScope) {
      if (openScope === dropdownScope) {
        openScope = null;
        $document.unbind('click', closeDropdown);
        $document.unbind('keydown', escapeKeyBind);
      }
    };
    var closeDropdown = function(evt) {
      if (!openScope) {
        return;
      }
      var toggleElement = openScope.getToggleElement();
      if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
        return;
      }
      openScope.$apply(function() {
        openScope.isOpen = false;
      });
    };
    var escapeKeyBind = function(evt) {
      if (evt.which === 27) {
        openScope.focusToggleElement();
        closeDropdown();
      }
    };
  }])
  .controller('DropdownController', ['$scope', '$attrs', '$parse', 'dropdownConfig', 'dropdownService', '$animate', function($scope, $attrs, $parse, dropdownConfig, dropdownService, $animate) {
    var self = this,
      scope = $scope.$new(),
      openClass = dropdownConfig.openClass,
      getIsOpen,
      setIsOpen = angular.noop,
      toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;
    this.init = function(element) {
      self.$element = element;
      if ($attrs.isOpen) {
        getIsOpen = $parse($attrs.isOpen);
        setIsOpen = getIsOpen.assign;
        $scope.$watch(getIsOpen, function(value) {
          scope.isOpen = !!value;
        });
      }
    };
    this.toggle = function(open) {
      return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
    };
    this.isOpen = function() {
      return scope.isOpen;
    };
    scope.getToggleElement = function() {
      return self.toggleElement;
    };
    scope.focusToggleElement = function() {
      if (self.toggleElement) {
        self.toggleElement[0].focus();
      }
    };
    scope.$watch('isOpen', function(isOpen, wasOpen) {
      $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);
      if (isOpen) {
        scope.focusToggleElement();
        dropdownService.open(scope);
      } else {
        dropdownService.close(scope);
      }
      setIsOpen($scope, isOpen);
      if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
        toggleInvoker($scope, {
          open: !!isOpen
        });
      }
    });
    $scope.$on('$locationChangeSuccess', function() {
      scope.isOpen = false;
    });
    $scope.$on('$destroy', function() {
      scope.$destroy();
    });
  }])
  .directive('dropdown', function() {
    return {
      controller: 'DropdownController',
      link: function(scope, element, attrs, dropdownCtrl) {
        dropdownCtrl.init(element);
      }
    };
  })
  .directive('dropdownToggle', function() {
    return {
      require: '?^dropdown',
      link: function(scope, element, attrs, dropdownCtrl) {
        if (!dropdownCtrl) {
          return;
        }
        dropdownCtrl.toggleElement = element;
        var toggleDropdown = function(event) {
          event.preventDefault();
          if (!element.hasClass('disabled') && !attrs.disabled) {
            scope.$apply(function() {
              dropdownCtrl.toggle();
            });
          }
        };
        element.bind('click', toggleDropdown);
        element.attr({
          'aria-haspopup': true,
          'aria-expanded': false
        });
        scope.$watch(dropdownCtrl.isOpen, function(isOpen) {
          element.attr('aria-expanded', !!isOpen);
        });
        scope.$on('$destroy', function() {
          element.unbind('click', toggleDropdown);
        });
      }
    };
  });
angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition'])
  .factory('$$stackedMap', function() {
    return {
      createNew: function() {
        var stack = [];
        return {
          add: function(key, value) {
            stack.push({
              key: key,
              value: value
            });
          },
          get: function(key) {
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                return stack[i];
              }
            }
          },
          keys: function() {
            var keys = [];
            for (var i = 0; i < stack.length; i++) {
              keys.push(stack[i].key);
            }
            return keys;
          },
          top: function() {
            return stack[stack.length - 1];
          },
          remove: function(key) {
            var idx = -1;
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                idx = i;
                break;
              }
            }
            return stack.splice(idx, 1)[0];
          },
          removeTop: function() {
            return stack.splice(stack.length - 1, 1)[0];
          },
          length: function() {
            return stack.length;
          }
        };
      }
    };
  })
  .directive('modalBackdrop', ['$timeout', function($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/modal/backdrop.html',
      link: function(scope, element, attrs) {
        scope.backdropClass = attrs.backdropClass || '';
        scope.animate = false;
        $timeout(function() {
          scope.animate = true;
        });
      }
    };
  }])
  .directive('modalWindow', ['$modalStack', '$timeout', function($modalStack, $timeout) {
    return {
      restrict: 'EA',
      scope: {
        index: '@',
        animate: '='
      },
      replace: true,
      transclude: true,
      templateUrl: function(tElement, tAttrs) {
        return tAttrs.templateUrl || 'template/modal/window.html';
      },
      link: function(scope, element, attrs) {
        element.addClass(attrs.windowClass || '');
        scope.size = attrs.size;
        $timeout(function() {
          scope.animate = true;
          if (!element[0].querySelectorAll('[autofocus]').length) {
            element[0].focus();
          }
        });
        scope.close = function(evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop && modal.value.backdrop != 'static' && (evt.target === evt.currentTarget)) {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };
      }
    };
  }])
  .directive('modalTransclude', function() {
    return {
      link: function($scope, $element, $attrs, controller, $transclude) {
        $transclude($scope.$parent, function(clone) {
          $element.empty();
          $element.append(clone);
        });
      }
    };
  })
  .factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap',
    function($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {
      var OPENED_MODAL_CLASS = 'modal-open';
      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var $modalStack = {};

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }
        return topBackdropIndex;
      }
      $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance) {
        var body = $document.find('body').eq(0);
        var modalWindow = openedWindows.get(modalInstance).value;
        openedWindows.remove(modalInstance);
        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, function() {
          modalWindow.modalScope.$destroy();
          body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
          checkRemoveBackdrop();
        });
      }

      function checkRemoveBackdrop() {
        if (backdropDomEl && backdropIndex() == -1) {
          var backdropScopeRef = backdropScope;
          removeAfterAnimate(backdropDomEl, backdropScope, 150, function() {
            backdropScopeRef.$destroy();
            backdropScopeRef = null;
          });
          backdropDomEl = undefined;
          backdropScope = undefined;
        }
      }

      function removeAfterAnimate(domEl, scope, emulateTime, done) {
        scope.animate = false;
        var transitionEndEventName = $transition.transitionEndEventName;
        if (transitionEndEventName) {
          var timeout = $timeout(afterAnimating, emulateTime);
          domEl.bind(transitionEndEventName, function() {
            $timeout.cancel(timeout);
            afterAnimating();
            scope.$apply();
          });
        } else {
          $timeout(afterAnimating);
        }

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;
          domEl.remove();
          if (done) {
            done();
          }
        }
      }
      $document.bind('keydown', function(evt) {
        var modal;
        if (evt.which === 27) {
          modal = openedWindows.top();
          if (modal && modal.value.keyboard) {
            evt.preventDefault();
            $rootScope.$apply(function() {
              $modalStack.dismiss(modal.key, 'escape key press');
            });
          }
        }
      });
      $modalStack.open = function(modalInstance, modal) {
        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard
        });
        var body = $document.find('body').eq(0),
          currBackdropIndex = backdropIndex();
        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.index = currBackdropIndex;
          var angularBackgroundDomEl = angular.element('<div modal-backdrop></div>');
          angularBackgroundDomEl.attr('backdrop-class', modal.backdropClass);
          backdropDomEl = $compile(angularBackgroundDomEl)(backdropScope);
          body.append(backdropDomEl);
        }
        var angularDomEl = angular.element('<div modal-window></div>');
        angularDomEl.attr({
          'template-url': modal.windowTemplateUrl,
          'window-class': modal.windowClass,
          'size': modal.size,
          'index': openedWindows.length() - 1,
          'animate': 'animate'
        }).html(modal.content);
        var modalDomEl = $compile(angularDomEl)(modal.scope);
        openedWindows.top().value.modalDomEl = modalDomEl;
        body.append(modalDomEl);
        body.addClass(OPENED_MODAL_CLASS);
      };
      $modalStack.close = function(modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.deferred.resolve(result);
          removeModalWindow(modalInstance);
        }
      };
      $modalStack.dismiss = function(modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.deferred.reject(reason);
          removeModalWindow(modalInstance);
        }
      };
      $modalStack.dismissAll = function(reason) {
        var topModal = this.getTop();
        while (topModal) {
          this.dismiss(topModal.key, reason);
          topModal = this.getTop();
        }
      };
      $modalStack.getTop = function() {
        return openedWindows.top();
      };
      return $modalStack;
    }
  ])
  .provider('$modal', function() {
    var $modalProvider = {
      options: {
        backdrop: true,
        keyboard: true
      },
      $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
        function($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {
          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl, {
                cache: $templateCache
              }).then(function(result) {
                return result.data;
              });
          }

          function getResolvePromises(resolves) {
            var promisesArr = [];
            angular.forEach(resolves, function(value) {
              if (angular.isFunction(value) || angular.isArray(value)) {
                promisesArr.push($q.when($injector.invoke(value)));
              }
            });
            return promisesArr;
          }
          $modal.open = function(modalOptions) {
            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              close: function(result) {
                $modalStack.close(modalInstance, result);
              },
              dismiss: function(reason) {
                $modalStack.dismiss(modalInstance, reason);
              }
            };
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }
            var templateAndResolvePromise =
              $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));
            templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {
              var modalScope = (modalOptions.scope || $rootScope).$new();
              modalScope.$close = modalInstance.close;
              modalScope.$dismiss = modalInstance.dismiss;
              var ctrlInstance, ctrlLocals = {};
              var resolveIter = 1;
              if (modalOptions.controller) {
                ctrlLocals.$scope = modalScope;
                ctrlLocals.$modalInstance = modalInstance;
                angular.forEach(modalOptions.resolve, function(value, key) {
                  ctrlLocals[key] = tplAndVars[resolveIter++];
                });
                ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                if (modalOptions.controllerAs) {
                  modalScope[modalOptions.controllerAs] = ctrlInstance;
                }
              }
              $modalStack.open(modalInstance, {
                scope: modalScope,
                deferred: modalResultDeferred,
                content: tplAndVars[0],
                backdrop: modalOptions.backdrop,
                keyboard: modalOptions.keyboard,
                backdropClass: modalOptions.backdropClass,
                windowClass: modalOptions.windowClass,
                windowTemplateUrl: modalOptions.windowTemplateUrl,
                size: modalOptions.size
              });
            }, function resolveError(reason) {
              modalResultDeferred.reject(reason);
            });
            templateAndResolvePromise.then(function() {
              modalOpenedDeferred.resolve(true);
            }, function() {
              modalOpenedDeferred.reject(false);
            });
            return modalInstance;
          };
          return $modal;
        }
      ]
    };
    return $modalProvider;
  });
angular.module('ui.bootstrap.pagination', [])
  .controller('PaginationController', ['$scope', '$attrs', '$parse', function($scope, $attrs, $parse) {
    var self = this,
      ngModelCtrl = {
        $setViewValue: angular.noop
      },
      setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;
    this.init = function(ngModelCtrl_, config) {
      ngModelCtrl = ngModelCtrl_;
      this.config = config;
      ngModelCtrl.$render = function() {
        self.render();
      };
      if ($attrs.itemsPerPage) {
        $scope.$parent.$watch($parse($attrs.itemsPerPage), function(value) {
          self.itemsPerPage = parseInt(value, 10);
          $scope.totalPages = self.calculateTotalPages();
        });
      } else {
        this.itemsPerPage = config.itemsPerPage;
      }
    };
    this.calculateTotalPages = function() {
      var totalPages = this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
      return Math.max(totalPages || 0, 1);
    };
    this.render = function() {
      $scope.page = parseInt(ngModelCtrl.$viewValue, 10) || 1;
    };
    $scope.selectPage = function(page) {
      if ($scope.page !== page && page > 0 && page <= $scope.totalPages) {
        ngModelCtrl.$setViewValue(page);
        ngModelCtrl.$render();
      }
    };
    $scope.getText = function(key) {
      return $scope[key + 'Text'] || self.config[key + 'Text'];
    };
    $scope.noPrevious = function() {
      return $scope.page === 1;
    };
    $scope.noNext = function() {
      return $scope.page === $scope.totalPages;
    };
    $scope.$watch('totalItems', function() {
      $scope.totalPages = self.calculateTotalPages();
    });
    $scope.$watch('totalPages', function(value) {
      setNumPages($scope.$parent, value);
      if ($scope.page > value) {
        $scope.selectPage(value);
      } else {
        ngModelCtrl.$render();
      }
    });
  }])
  .constant('paginationConfig', {
    itemsPerPage: 10,
    boundaryLinks: false,
    directionLinks: true,
    firstText: 'First',
    previousText: 'Previous',
    nextText: 'Next',
    lastText: 'Last',
    rotate: true
  })
  .directive('pagination', ['$parse', 'paginationConfig', function($parse, paginationConfig) {
    return {
      restrict: 'EA',
      scope: {
        totalItems: '=',
        firstText: '@',
        previousText: '@',
        nextText: '@',
        lastText: '@'
      },
      require: ['pagination', '?ngModel'],
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pagination.html',
      replace: true,
      link: function(scope, element, attrs, ctrls) {
        var paginationCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        if (!ngModelCtrl) {
          return;
        }
        var maxSize = angular.isDefined(attrs.maxSize) ? scope.$parent.$eval(attrs.maxSize) : paginationConfig.maxSize,
          rotate = angular.isDefined(attrs.rotate) ? scope.$parent.$eval(attrs.rotate) : paginationConfig.rotate;
        scope.boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$parent.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks;
        scope.directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$parent.$eval(attrs.directionLinks) : paginationConfig.directionLinks;
        paginationCtrl.init(ngModelCtrl, paginationConfig);
        if (attrs.maxSize) {
          scope.$parent.$watch($parse(attrs.maxSize), function(value) {
            maxSize = parseInt(value, 10);
            paginationCtrl.render();
          });
        }

        function makePage(number, text, isActive) {
          return {
            number: number,
            text: text,
            active: isActive
          };
        }

        function getPages(currentPage, totalPages) {
          var pages = [];
          var startPage = 1,
            endPage = totalPages;
          var isMaxSized = (angular.isDefined(maxSize) && maxSize < totalPages);
          if (isMaxSized) {
            if (rotate) {
              startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
              endPage = startPage + maxSize - 1;
              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = endPage - maxSize + 1;
              }
            } else {
              startPage = ((Math.ceil(currentPage / maxSize) - 1) * maxSize) + 1;
              endPage = Math.min(startPage + maxSize - 1, totalPages);
            }
          }
          for (var number = startPage; number <= endPage; number++) {
            var page = makePage(number, number, number === currentPage);
            pages.push(page);
          }
          if (isMaxSized && !rotate) {
            if (startPage > 1) {
              var previousPageSet = makePage(startPage - 1, '...', false);
              pages.unshift(previousPageSet);
            }
            if (endPage < totalPages) {
              var nextPageSet = makePage(endPage + 1, '...', false);
              pages.push(nextPageSet);
            }
          }
          return pages;
        }
        var originalRender = paginationCtrl.render;
        paginationCtrl.render = function() {
          originalRender();
          if (scope.page > 0 && scope.page <= scope.totalPages) {
            scope.pages = getPages(scope.page, scope.totalPages);
          }
        };
      }
    };
  }])
  .constant('pagerConfig', {
    itemsPerPage: 10,
    previousText: '« Previous',
    nextText: 'Next »',
    align: true
  })
  .directive('pager', ['pagerConfig', function(pagerConfig) {
    return {
      restrict: 'EA',
      scope: {
        totalItems: '=',
        previousText: '@',
        nextText: '@'
      },
      require: ['pager', '?ngModel'],
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pager.html',
      replace: true,
      link: function(scope, element, attrs, ctrls) {
        var paginationCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        if (!ngModelCtrl) {
          return;
        }
        scope.align = angular.isDefined(attrs.align) ? scope.$parent.$eval(attrs.align) : pagerConfig.align;
        paginationCtrl.init(ngModelCtrl, pagerConfig);
      }
    };
  }]);
angular.module('ui.bootstrap.tooltip', ['ui.bootstrap.position', 'ui.bootstrap.bindHtml'])
  .provider('$tooltip', function() {
    var defaultOptions = {
      placement: 'top',
      animation: true,
      popupDelay: 0
    };
    var triggerMap = {
      'mouseenter': 'mouseleave',
      'click': 'click',
      'focus': 'blur'
    };
    var globalOptions = {};
    this.options = function(value) {
      angular.extend(globalOptions, value);
    };
    this.setTriggers = function setTriggers(triggers) {
      angular.extend(triggerMap, triggers);
    };

    function snake_case(name) {
      var regexp = /[A-Z]/g;
      var separator = '-';
      return name.replace(regexp, function(letter, pos) {
        return (pos ? separator : '') + letter.toLowerCase();
      });
    }
    this.$get = ['$window', '$compile', '$timeout', '$document', '$position', '$interpolate', function($window, $compile, $timeout, $document, $position, $interpolate) {
      return function $tooltip(type, prefix, defaultTriggerShow) {
        var options = angular.extend({}, defaultOptions, globalOptions);

        function getTriggers(trigger) {
          var show = trigger || options.trigger || defaultTriggerShow;
          var hide = triggerMap[show] || show;
          return {
            show: show,
            hide: hide
          };
        }
        var directiveName = snake_case(type);
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        var template =
          '<div ' + directiveName + '-popup ' +
          'title="' + startSym + 'title' + endSym + '" ' +
          'content="' + startSym + 'content' + endSym + '" ' +
          'placement="' + startSym + 'placement' + endSym + '" ' +
          'animation="animation" ' +
          'is-open="isOpen"' +
          '>' +
          '</div>';
        return {
          restrict: 'EA',
          compile: function(tElem, tAttrs) {
            var tooltipLinker = $compile(template);
            return function link(scope, element, attrs) {
              var tooltip;
              var tooltipLinkedScope;
              var transitionTimeout;
              var popupTimeout;
              var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
              var triggers = getTriggers(undefined);
              var hasEnableExp = angular.isDefined(attrs[prefix + 'Enable']);
              var ttScope = scope.$new(true);
              var positionTooltip = function() {
                var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody);
                ttPosition.top += 'px';
                ttPosition.left += 'px';
                tooltip.css(ttPosition);
              };
              ttScope.isOpen = false;

              function toggleTooltipBind() {
                if (!ttScope.isOpen) {
                  showTooltipBind();
                } else {
                  hideTooltipBind();
                }
              }

              function showTooltipBind() {
                if (hasEnableExp && !scope.$eval(attrs[prefix + 'Enable'])) {
                  return;
                }
                prepareTooltip();
                if (ttScope.popupDelay) {
                  if (!popupTimeout) {
                    popupTimeout = $timeout(show, ttScope.popupDelay, false);
                    popupTimeout.then(function(reposition) {
                      reposition();
                    });
                  }
                } else {
                  show()();
                }
              }

              function hideTooltipBind() {
                scope.$apply(function() {
                  hide();
                });
              }

              function show() {
                popupTimeout = null;
                if (transitionTimeout) {
                  $timeout.cancel(transitionTimeout);
                  transitionTimeout = null;
                }
                if (!ttScope.content) {
                  return angular.noop;
                }
                createTooltip();
                tooltip.css({
                  top: 0,
                  left: 0,
                  display: 'block'
                });
                ttScope.$digest();
                positionTooltip();
                ttScope.isOpen = true;
                ttScope.$digest();
                return positionTooltip;
              }

              function hide() {
                ttScope.isOpen = false;
                $timeout.cancel(popupTimeout);
                popupTimeout = null;
                if (ttScope.animation) {
                  if (!transitionTimeout) {
                    transitionTimeout = $timeout(removeTooltip, 500);
                  }
                } else {
                  removeTooltip();
                }
              }

              function createTooltip() {
                if (tooltip) {
                  removeTooltip();
                }
                tooltipLinkedScope = ttScope.$new();
                tooltip = tooltipLinker(tooltipLinkedScope, function(tooltip) {
                  if (appendToBody) {
                    $document.find('body').append(tooltip);
                  } else {
                    element.after(tooltip);
                  }
                });
              }

              function removeTooltip() {
                transitionTimeout = null;
                if (tooltip) {
                  tooltip.remove();
                  tooltip = null;
                }
                if (tooltipLinkedScope) {
                  tooltipLinkedScope.$destroy();
                  tooltipLinkedScope = null;
                }
              }

              function prepareTooltip() {
                prepPlacement();
                prepPopupDelay();
              }
              attrs.$observe(type, function(val) {
                ttScope.content = val;
                if (!val && ttScope.isOpen) {
                  hide();
                }
              });
              attrs.$observe(prefix + 'Title', function(val) {
                ttScope.title = val;
              });

              function prepPlacement() {
                var val = attrs[prefix + 'Placement'];
                ttScope.placement = angular.isDefined(val) ? val : options.placement;
              }

              function prepPopupDelay() {
                var val = attrs[prefix + 'PopupDelay'];
                var delay = parseInt(val, 10);
                ttScope.popupDelay = !isNaN(delay) ? delay : options.popupDelay;
              }
              var unregisterTriggers = function() {
                element.unbind(triggers.show, showTooltipBind);
                element.unbind(triggers.hide, hideTooltipBind);
              };

              function prepTriggers() {
                var val = attrs[prefix + 'Trigger'];
                unregisterTriggers();
                triggers = getTriggers(val);
                if (triggers.show === triggers.hide) {
                  element.bind(triggers.show, toggleTooltipBind);
                } else {
                  element.bind(triggers.show, showTooltipBind);
                  element.bind(triggers.hide, hideTooltipBind);
                }
              }
              prepTriggers();
              var animation = scope.$eval(attrs[prefix + 'Animation']);
              ttScope.animation = angular.isDefined(animation) ? !!animation : options.animation;
              var appendToBodyVal = scope.$eval(attrs[prefix + 'AppendToBody']);
              appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody;
              if (appendToBody) {
                scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess() {
                  if (ttScope.isOpen) {
                    hide();
                  }
                });
              }
              scope.$on('$destroy', function onDestroyTooltip() {
                $timeout.cancel(transitionTimeout);
                $timeout.cancel(popupTimeout);
                unregisterTriggers();
                removeTooltip();
                ttScope = null;
              });
            };
          }
        };
      };
    }];
  })
  .directive('tooltipPopup', function() {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        content: '@',
        placement: '@',
        animation: '&',
        isOpen: '&'
      },
      templateUrl: 'template/tooltip/tooltip-popup.html'
    };
  })
  .directive('tooltip', ['$tooltip', function($tooltip) {
    return $tooltip('tooltip', 'tooltip', 'mouseenter');
  }])
  .directive('tooltipHtmlUnsafePopup', function() {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        content: '@',
        placement: '@',
        animation: '&',
        isOpen: '&'
      },
      templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
    };
  })
  .directive('tooltipHtmlUnsafe', ['$tooltip', function($tooltip) {
    return $tooltip('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
  }]);
angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip'])
  .directive('popoverPopup', function() {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        title: '@',
        content: '@',
        placement: '@',
        animation: '&',
        isOpen: '&'
      },
      templateUrl: 'template/popover/popover.html'
    };
  })
  .directive('popover', ['$tooltip', function($tooltip) {
    return $tooltip('popover', 'popover', 'click');
  }]);
angular.module('ui.bootstrap.progressbar', [])
  .constant('progressConfig', {
    animate: true,
    max: 100
  })
  .controller('ProgressController', ['$scope', '$attrs', 'progressConfig', function($scope, $attrs, progressConfig) {
    var self = this,
      animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;
    this.bars = [];
    $scope.max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : progressConfig.max;
    this.addBar = function(bar, element) {
      if (!animate) {
        element.css({
          'transition': 'none'
        });
      }
      this.bars.push(bar);
      bar.$watch('value', function(value) {
        bar.percent = +(100 * value / $scope.max).toFixed(2);
      });
      bar.$on('$destroy', function() {
        element = null;
        self.removeBar(bar);
      });
    };
    this.removeBar = function(bar) {
      this.bars.splice(this.bars.indexOf(bar), 1);
    };
  }])
  .directive('progress', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      controller: 'ProgressController',
      require: 'progress',
      scope: {},
      templateUrl: 'template/progressbar/progress.html'
    };
  })
  .directive('bar', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      require: '^progress',
      scope: {
        value: '=',
        type: '@'
      },
      templateUrl: 'template/progressbar/bar.html',
      link: function(scope, element, attrs, progressCtrl) {
        progressCtrl.addBar(scope, element);
      }
    };
  })
  .directive('progressbar', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      controller: 'ProgressController',
      scope: {
        value: '=',
        type: '@'
      },
      templateUrl: 'template/progressbar/progressbar.html',
      link: function(scope, element, attrs, progressCtrl) {
        progressCtrl.addBar(scope, angular.element(element.children()[0]));
      }
    };
  });
angular.module('ui.bootstrap.rating', [])
  .constant('ratingConfig', {
    max: 5,
    stateOn: null,
    stateOff: null
  })
  .controller('RatingController', ['$scope', '$attrs', 'ratingConfig', function($scope, $attrs, ratingConfig) {
    var ngModelCtrl = {
      $setViewValue: angular.noop
    };
    this.init = function(ngModelCtrl_) {
      ngModelCtrl = ngModelCtrl_;
      ngModelCtrl.$render = this.render;
      this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
      this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
      var ratingStates = angular.isDefined($attrs.ratingStates) ? $scope.$parent.$eval($attrs.ratingStates) :
        new Array(angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max);
      $scope.range = this.buildTemplateObjects(ratingStates);
    };
    this.buildTemplateObjects = function(states) {
      for (var i = 0, n = states.length; i < n; i++) {
        states[i] = angular.extend({
          index: i
        }, {
          stateOn: this.stateOn,
          stateOff: this.stateOff
        }, states[i]);
      }
      return states;
    };
    $scope.rate = function(value) {
      if (!$scope.readonly && value >= 0 && value <= $scope.range.length) {
        ngModelCtrl.$setViewValue(value);
        ngModelCtrl.$render();
      }
    };
    $scope.enter = function(value) {
      if (!$scope.readonly) {
        $scope.value = value;
      }
      $scope.onHover({
        value: value
      });
    };
    $scope.reset = function() {
      $scope.value = ngModelCtrl.$viewValue;
      $scope.onLeave();
    };
    $scope.onKeydown = function(evt) {
      if (/(37|38|39|40)/.test(evt.which)) {
        evt.preventDefault();
        evt.stopPropagation();
        $scope.rate($scope.value + (evt.which === 38 || evt.which === 39 ? 1 : -1));
      }
    };
    this.render = function() {
      $scope.value = ngModelCtrl.$viewValue;
    };
  }])
  .directive('rating', function() {
    return {
      restrict: 'EA',
      require: ['rating', 'ngModel'],
      scope: {
        readonly: '=?',
        onHover: '&',
        onLeave: '&'
      },
      controller: 'RatingController',
      templateUrl: 'template/rating/rating.html',
      replace: true,
      link: function(scope, element, attrs, ctrls) {
        var ratingCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        if (ngModelCtrl) {
          ratingCtrl.init(ngModelCtrl);
        }
      }
    };
  });
angular.module('ui.bootstrap.tabs', [])
  .controller('TabsetController', ['$scope', function TabsetCtrl($scope) {
    var ctrl = this,
      tabs = ctrl.tabs = $scope.tabs = [];
    ctrl.select = function(selectedTab) {
      angular.forEach(tabs, function(tab) {
        if (tab.active && tab !== selectedTab) {
          tab.active = false;
          tab.onDeselect();
        }
      });
      selectedTab.active = true;
      selectedTab.onSelect();
    };
    ctrl.addTab = function addTab(tab) {
      tabs.push(tab);
      if (tabs.length === 1) {
        tab.active = true;
      } else if (tab.active) {
        ctrl.select(tab);
      }
    };
    ctrl.removeTab = function removeTab(tab) {
      var index = tabs.indexOf(tab);
      if (tab.active && tabs.length > 1 && !destroyed) {
        var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
        ctrl.select(tabs[newActiveIndex]);
      }
      tabs.splice(index, 1);
    };
    var destroyed;
    $scope.$on('$destroy', function() {
      destroyed = true;
    });
  }])
  .directive('tabset', function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {
        type: '@'
      },
      controller: 'TabsetController',
      templateUrl: 'template/tabs/tabset.html',
      link: function(scope, element, attrs) {
        scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
        scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
      }
    };
  })
  .directive('tab', ['$parse', function($parse) {
    return {
      require: '^tabset',
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/tabs/tab.html',
      transclude: true,
      scope: {
        active: '=?',
        heading: '@',
        onSelect: '&select',
        onDeselect: '&deselect'
      },
      controller: function() {},
      compile: function(elm, attrs, transclude) {
        return function postLink(scope, elm, attrs, tabsetCtrl) {
          scope.$watch('active', function(active) {
            if (active) {
              tabsetCtrl.select(scope);
            }
          });
          scope.disabled = false;
          if (attrs.disabled) {
            scope.$parent.$watch($parse(attrs.disabled), function(value) {
              scope.disabled = !!value;
            });
          }
          scope.select = function() {
            if (!scope.disabled) {
              scope.active = true;
            }
          };
          tabsetCtrl.addTab(scope);
          scope.$on('$destroy', function() {
            tabsetCtrl.removeTab(scope);
          });
          scope.$transcludeFn = transclude;
        };
      }
    };
  }])
  .directive('tabHeadingTransclude', [function() {
    return {
      restrict: 'A',
      require: '^tab',
      link: function(scope, elm, attrs, tabCtrl) {
        scope.$watch('headingElement', function updateHeadingElement(heading) {
          if (heading) {
            elm.html('');
            elm.append(heading);
          }
        });
      }
    };
  }])
  .directive('tabContentTransclude', function() {
    return {
      restrict: 'A',
      require: '^tabset',
      link: function(scope, elm, attrs) {
        var tab = scope.$eval(attrs.tabContentTransclude);
        tab.$transcludeFn(tab.$parent, function(contents) {
          angular.forEach(contents, function(node) {
            if (isTabHeading(node)) {
              tab.headingElement = node;
            } else {
              elm.append(node);
            }
          });
        });
      }
    };

    function isTabHeading(node) {
      return node.tagName && (
        node.hasAttribute('tab-heading') ||
        node.hasAttribute('data-tab-heading') ||
        node.tagName.toLowerCase() === 'tab-heading' ||
        node.tagName.toLowerCase() === 'data-tab-heading'
      );
    }
  });
angular.module('ui.bootstrap.timepicker', [])
  .constant('timepickerConfig', {
    hourStep: 1,
    minuteStep: 1,
    showMeridian: true,
    meridians: null,
    readonlyInput: false,
    mousewheel: true
  })
  .controller('TimepickerController', ['$scope', '$attrs', '$parse', '$log', '$locale', 'timepickerConfig', function($scope, $attrs, $parse, $log, $locale, timepickerConfig) {
    var selected = new Date(),
      ngModelCtrl = {
        $setViewValue: angular.noop
      },
      meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;
    this.init = function(ngModelCtrl_, inputs) {
      ngModelCtrl = ngModelCtrl_;
      ngModelCtrl.$render = this.render;
      var hoursInputEl = inputs.eq(0),
        minutesInputEl = inputs.eq(1);
      var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;
      if (mousewheel) {
        this.setupMousewheelEvents(hoursInputEl, minutesInputEl);
      }
      $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput;
      this.setupInputEvents(hoursInputEl, minutesInputEl);
    };
    var hourStep = timepickerConfig.hourStep;
    if ($attrs.hourStep) {
      $scope.$parent.$watch($parse($attrs.hourStep), function(value) {
        hourStep = parseInt(value, 10);
      });
    }
    var minuteStep = timepickerConfig.minuteStep;
    if ($attrs.minuteStep) {
      $scope.$parent.$watch($parse($attrs.minuteStep), function(value) {
        minuteStep = parseInt(value, 10);
      });
    }
    $scope.showMeridian = timepickerConfig.showMeridian;
    if ($attrs.showMeridian) {
      $scope.$parent.$watch($parse($attrs.showMeridian), function(value) {
        $scope.showMeridian = !!value;
        if (ngModelCtrl.$error.time) {
          var hours = getHoursFromTemplate(),
            minutes = getMinutesFromTemplate();
          if (angular.isDefined(hours) && angular.isDefined(minutes)) {
            selected.setHours(hours);
            refresh();
          }
        } else {
          updateTemplate();
        }
      });
    }

    function getHoursFromTemplate() {
      var hours = parseInt($scope.hours, 10);
      var valid = ($scope.showMeridian) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
      if (!valid) {
        return undefined;
      }
      if ($scope.showMeridian) {
        if (hours === 12) {
          hours = 0;
        }
        if ($scope.meridian === meridians[1]) {
          hours = hours + 12;
        }
      }
      return hours;
    }

    function getMinutesFromTemplate() {
      var minutes = parseInt($scope.minutes, 10);
      return (minutes >= 0 && minutes < 60) ? minutes : undefined;
    }

    function pad(value) {
      return (angular.isDefined(value) && value.toString().length < 2) ? '0' + value : value;
    }
    this.setupMousewheelEvents = function(hoursInputEl, minutesInputEl) {
      var isScrollingUp = function(e) {
        if (e.originalEvent) {
          e = e.originalEvent;
        }
        var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
        return (e.detail || delta > 0);
      };
      hoursInputEl.bind('mousewheel wheel', function(e) {
        $scope.$apply((isScrollingUp(e)) ? $scope.incrementHours() : $scope.decrementHours());
        e.preventDefault();
      });
      minutesInputEl.bind('mousewheel wheel', function(e) {
        $scope.$apply((isScrollingUp(e)) ? $scope.incrementMinutes() : $scope.decrementMinutes());
        e.preventDefault();
      });
    };
    this.setupInputEvents = function(hoursInputEl, minutesInputEl) {
      if ($scope.readonlyInput) {
        $scope.updateHours = angular.noop;
        $scope.updateMinutes = angular.noop;
        return;
      }
      var invalidate = function(invalidHours, invalidMinutes) {
        ngModelCtrl.$setViewValue(null);
        ngModelCtrl.$setValidity('time', false);
        if (angular.isDefined(invalidHours)) {
          $scope.invalidHours = invalidHours;
        }
        if (angular.isDefined(invalidMinutes)) {
          $scope.invalidMinutes = invalidMinutes;
        }
      };
      $scope.updateHours = function() {
        var hours = getHoursFromTemplate();
        if (angular.isDefined(hours)) {
          selected.setHours(hours);
          refresh('h');
        } else {
          invalidate(true);
        }
      };
      hoursInputEl.bind('blur', function(e) {
        if (!$scope.invalidHours && $scope.hours < 10) {
          $scope.$apply(function() {
            $scope.hours = pad($scope.hours);
          });
        }
      });
      $scope.updateMinutes = function() {
        var minutes = getMinutesFromTemplate();
        if (angular.isDefined(minutes)) {
          selected.setMinutes(minutes);
          refresh('m');
        } else {
          invalidate(undefined, true);
        }
      };
      minutesInputEl.bind('blur', function(e) {
        if (!$scope.invalidMinutes && $scope.minutes < 10) {
          $scope.$apply(function() {
            $scope.minutes = pad($scope.minutes);
          });
        }
      });
    };
    this.render = function() {
      var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
      if (isNaN(date)) {
        ngModelCtrl.$setValidity('time', false);
        $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
      } else {
        if (date) {
          selected = date;
        }
        makeValid();
        updateTemplate();
      }
    };

    function refresh(keyboardChange) {
      makeValid();
      ngModelCtrl.$setViewValue(new Date(selected));
      updateTemplate(keyboardChange);
    }

    function makeValid() {
      ngModelCtrl.$setValidity('time', true);
      $scope.invalidHours = false;
      $scope.invalidMinutes = false;
    }

    function updateTemplate(keyboardChange) {
      var hours = selected.getHours(),
        minutes = selected.getMinutes();
      if ($scope.showMeridian) {
        hours = (hours === 0 || hours === 12) ? 12 : hours % 12;
      }
      $scope.hours = keyboardChange === 'h' ? hours : pad(hours);
      $scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
      $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
    }

    function addMinutes(minutes) {
      var dt = new Date(selected.getTime() + minutes * 60000);
      selected.setHours(dt.getHours(), dt.getMinutes());
      refresh();
    }
    $scope.incrementHours = function() {
      addMinutes(hourStep * 60);
    };
    $scope.decrementHours = function() {
      addMinutes(-hourStep * 60);
    };
    $scope.incrementMinutes = function() {
      addMinutes(minuteStep);
    };
    $scope.decrementMinutes = function() {
      addMinutes(-minuteStep);
    };
    $scope.toggleMeridian = function() {
      addMinutes(12 * 60 * ((selected.getHours() < 12) ? 1 : -1));
    };
  }])
  .directive('timepicker', function() {
    return {
      restrict: 'EA',
      require: ['timepicker', '?^ngModel'],
      controller: 'TimepickerController',
      replace: true,
      scope: {},
      templateUrl: 'template/timepicker/timepicker.html',
      link: function(scope, element, attrs, ctrls) {
        var timepickerCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        if (ngModelCtrl) {
          timepickerCtrl.init(ngModelCtrl, element.find('input'));
        }
      }
    };
  });
angular.module('ui.bootstrap.typeahead', ['ui.bootstrap.position', 'ui.bootstrap.bindHtml'])
  .factory('typeaheadParser', ['$parse', function($parse) {
    var TYPEAHEAD_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
    return {
      parse: function(input) {
        var match = input.match(TYPEAHEAD_REGEXP);
        if (!match) {
          throw new Error(
            'Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
            ' but got "' + input + '".');
        }
        return {
          itemName: match[3],
          source: $parse(match[4]),
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };
      }
    };
  }])
  .directive('typeahead', ['$compile', '$parse', '$q', '$timeout', '$document', '$position', 'typeaheadParser',
    function($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {
      var HOT_KEYS = [9, 13, 27, 38, 40];
      return {
        require: 'ngModel',
        link: function(originalScope, element, attrs, modelCtrl) {
          var minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1;
          var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;
          var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;
          var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;
          var onSelectCallback = $parse(attrs.typeaheadOnSelect);
          var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;
          var appendToBody = attrs.typeaheadAppendToBody ? originalScope.$eval(attrs.typeaheadAppendToBody) : false;
          var focusFirst = originalScope.$eval(attrs.typeaheadFocusFirst) !== false;
          var $setModelValue = $parse(attrs.ngModel).assign;
          var parserResult = typeaheadParser.parse(attrs.typeahead);
          var hasFocus;
          var scope = originalScope.$new();
          originalScope.$on('$destroy', function() {
            scope.$destroy();
          });
          var popupId = 'typeahead-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
          element.attr({
            'aria-autocomplete': 'list',
            'aria-expanded': false,
            'aria-owns': popupId
          });
          var popUpEl = angular.element('<div typeahead-popup></div>');
          popUpEl.attr({
            id: popupId,
            matches: 'matches',
            active: 'activeIdx',
            select: 'select(activeIdx)',
            query: 'query',
            position: 'position'
          });
          if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
            popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
          }
          var resetMatches = function() {
            scope.matches = [];
            scope.activeIdx = -1;
            element.attr('aria-expanded', false);
          };
          var getMatchId = function(index) {
            return popupId + '-option-' + index;
          };
          scope.$watch('activeIdx', function(index) {
            if (index < 0) {
              element.removeAttr('aria-activedescendant');
            } else {
              element.attr('aria-activedescendant', getMatchId(index));
            }
          });
          var getMatchesAsync = function(inputValue) {
            var locals = {
              $viewValue: inputValue
            };
            isLoadingSetter(originalScope, true);
            $q.when(parserResult.source(originalScope, locals)).then(function(matches) {
              var onCurrentRequest = (inputValue === modelCtrl.$viewValue);
              if (onCurrentRequest && hasFocus) {
                if (matches.length > 0) {
                  scope.activeIdx = focusFirst ? 0 : -1;
                  scope.matches.length = 0;
                  for (var i = 0; i < matches.length; i++) {
                    locals[parserResult.itemName] = matches[i];
                    scope.matches.push({
                      id: getMatchId(i),
                      label: parserResult.viewMapper(scope, locals),
                      model: matches[i]
                    });
                  }
                  scope.query = inputValue;
                  scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                  scope.position.top = scope.position.top + element.prop('offsetHeight');
                  element.attr('aria-expanded', true);
                } else {
                  resetMatches();
                }
              }
              if (onCurrentRequest) {
                isLoadingSetter(originalScope, false);
              }
            }, function() {
              resetMatches();
              isLoadingSetter(originalScope, false);
            });
          };
          resetMatches();
          scope.query = undefined;
          var timeoutPromise;
          var scheduleSearchWithTimeout = function(inputValue) {
            timeoutPromise = $timeout(function() {
              getMatchesAsync(inputValue);
            }, waitTime);
          };
          var cancelPreviousTimeout = function() {
            if (timeoutPromise) {
              $timeout.cancel(timeoutPromise);
            }
          };
          modelCtrl.$parsers.unshift(function(inputValue) {
            hasFocus = true;
            if (inputValue && inputValue.length >= minSearch) {
              if (waitTime > 0) {
                cancelPreviousTimeout();
                scheduleSearchWithTimeout(inputValue);
              } else {
                getMatchesAsync(inputValue);
              }
            } else {
              isLoadingSetter(originalScope, false);
              cancelPreviousTimeout();
              resetMatches();
            }
            if (isEditable) {
              return inputValue;
            } else {
              if (!inputValue) {
                modelCtrl.$setValidity('editable', true);
                return inputValue;
              } else {
                modelCtrl.$setValidity('editable', false);
                return undefined;
              }
            }
          });
          modelCtrl.$formatters.push(function(modelValue) {
            var candidateViewValue, emptyViewValue;
            var locals = {};
            if (inputFormatter) {
              locals.$model = modelValue;
              return inputFormatter(originalScope, locals);
            } else {
              locals[parserResult.itemName] = modelValue;
              candidateViewValue = parserResult.viewMapper(originalScope, locals);
              locals[parserResult.itemName] = undefined;
              emptyViewValue = parserResult.viewMapper(originalScope, locals);
              return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
            }
          });
          scope.select = function(activeIdx) {
            var locals = {};
            var model, item;
            locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
            model = parserResult.modelMapper(originalScope, locals);
            $setModelValue(originalScope, model);
            modelCtrl.$setValidity('editable', true);
            onSelectCallback(originalScope, {
              $item: item,
              $model: model,
              $label: parserResult.viewMapper(originalScope, locals)
            });
            resetMatches();
            $timeout(function() {
              element[0].focus();
            }, 0, false);
          };
          element.bind('keydown', function(evt) {
            if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
              return;
            }
            if (scope.activeIdx == -1 && (evt.which === 13 || evt.which === 9)) {
              return;
            }
            evt.preventDefault();
            if (evt.which === 40) {
              scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
              scope.$digest();
            } else if (evt.which === 38) {
              scope.activeIdx = (scope.activeIdx > 0 ? scope.activeIdx : scope.matches.length) - 1;
              scope.$digest();
            } else if (evt.which === 13 || evt.which === 9) {
              scope.$apply(function() {
                scope.select(scope.activeIdx);
              });
            } else if (evt.which === 27) {
              evt.stopPropagation();
              resetMatches();
              scope.$digest();
            }
          });
          element.bind('blur', function(evt) {
            hasFocus = false;
          });
          var dismissClickHandler = function(evt) {
            if (element[0] !== evt.target) {
              resetMatches();
              scope.$digest();
            }
          };
          $document.bind('click', dismissClickHandler);
          originalScope.$on('$destroy', function() {
            $document.unbind('click', dismissClickHandler);
            if (appendToBody) {
              $popup.remove();
            }
          });
          var $popup = $compile(popUpEl)(scope);
          if (appendToBody) {
            $document.find('body').append($popup);
          } else {
            element.after($popup);
          }
        }
      };
    }
  ])
  .directive('typeaheadPopup', function() {
    return {
      restrict: 'EA',
      scope: {
        matches: '=',
        query: '=',
        active: '=',
        position: '=',
        select: '&'
      },
      replace: true,
      templateUrl: 'template/typeahead/typeahead-popup.html',
      link: function(scope, element, attrs) {
        scope.templateUrl = attrs.templateUrl;
        scope.isOpen = function() {
          return scope.matches.length > 0;
        };
        scope.isActive = function(matchIdx) {
          return scope.active == matchIdx;
        };
        scope.selectActive = function(matchIdx) {
          scope.active = matchIdx;
        };
        scope.selectMatch = function(activeIdx) {
          scope.select({
            activeIdx: activeIdx
          });
        };
      }
    };
  })
  .directive('typeaheadMatch', ['$http', '$templateCache', '$compile', '$parse', function($http, $templateCache, $compile, $parse) {
    return {
      restrict: 'EA',
      scope: {
        index: '=',
        match: '=',
        query: '='
      },
      link: function(scope, element, attrs) {
        var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'template/typeahead/typeahead-match.html';
        $http.get(tplUrl, {
          cache: $templateCache
        }).success(function(tplContent) {
          element.replaceWith($compile(tplContent.trim())(scope));
        });
      }
    };
  }])
  .filter('typeaheadHighlight', function() {
    function escapeRegexp(queryToEscape) {
      return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }
    return function(matchItem, query) {
      return query ? ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem;
    };
  });
angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/accordion/accordion-group.html",
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a href class=\"accordion-toggle\" ng-click=\"toggleOpen()\" accordion-transclude=\"heading\"><span ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span></a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
    "	  <div class=\"panel-body\" ng-transclude></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);
angular.module("template/accordion/accordion.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/accordion/accordion.html",
    "<div class=\"panel-group\" ng-transclude></div>");
}]);
angular.module("template/alert/alert.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/alert/alert.html",
    "<div class=\"alert\" ng-class=\"['alert-' + (type || 'warning'), closeable ? 'alert-dismissable' : null]\" role=\"alert\">\n" +
    "    <button ng-show=\"closeable\" type=\"button\" class=\"close\" ng-click=\"close()\">\n" +
    "        <span aria-hidden=\"true\">&times;</span>\n" +
    "        <span class=\"sr-only\">Close</span>\n" +
    "    </button>\n" +
    "    <div ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);
angular.module("template/carousel/carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/carousel/carousel.html",
    "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\" ng-swipe-right=\"prev()\" ng-swipe-left=\"next()\">\n" +
    "    <ol class=\"carousel-indicators\" ng-show=\"slides.length > 1\">\n" +
    "        <li ng-repeat=\"slide in slides track by $index\" ng-class=\"{active: isActive(slide)}\" ng-click=\"select(slide)\"></li>\n" +
    "    </ol>\n" +
    "    <div class=\"carousel-inner\" ng-transclude></div>\n" +
    "    <a class=\"left carousel-control\" ng-click=\"prev()\" ng-show=\"slides.length > 1\"><span class=\"glyphicon glyphicon-chevron-left\"></span></a>\n" +
    "    <a class=\"right carousel-control\" ng-click=\"next()\" ng-show=\"slides.length > 1\"><span class=\"glyphicon glyphicon-chevron-right\"></span></a>\n" +
    "</div>\n" +
    "");
}]);
angular.module("template/carousel/slide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/carousel/slide.html",
    "<div ng-class=\"{\n" +
    "    'active': leaving || (active && !entering),\n" +
    "    'prev': (next || active) && direction=='prev',\n" +
    "    'next': (next || active) && direction=='next',\n" +
    "    'right': direction=='prev',\n" +
    "    'left': direction=='next'\n" +
    "  }\" class=\"item text-center\" ng-transclude></div>\n" +
    "");
}]);
angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/datepicker.html",
    "<div ng-switch=\"datepickerMode\" role=\"application\" ng-keydown=\"keydown($event)\">\n" +
    "  <daypicker ng-switch-when=\"day\" tabindex=\"0\"></daypicker>\n" +
    "  <monthpicker ng-switch-when=\"month\" tabindex=\"0\"></monthpicker>\n" +
    "  <yearpicker ng-switch-when=\"year\" tabindex=\"0\"></yearpicker>\n" +
    "</div>");
}]);
angular.module("template/datepicker/day.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/day.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{5 + showWeeks}}\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "      <th ng-show=\"showWeeks\" class=\"text-center\"></th>\n" +
    "      <th ng-repeat=\"label in labels track by $index\" class=\"text-center\"><small aria-label=\"{{label.full}}\">{{label.abbr}}</small></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-show=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);
angular.module("template/datepicker/month.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/month.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);
angular.module("template/datepicker/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/popup.html",
    "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\" ng-keydown=\"keydown($event)\">\n" +
    "	<li ng-transclude></li>\n" +
    "	<li ng-if=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
    "		<span class=\"btn-group pull-left\">\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"select('today')\">{{ getText('current') }}</button>\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"select(null)\">{{ getText('clear') }}</button>\n" +
    "		</span>\n" +
    "		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"close()\">{{ getText('close') }}</button>\n" +
    "	</li>\n" +
    "</ul>\n" +
    "");
}]);
angular.module("template/datepicker/year.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/year.html",
    "<table role=\"grid\" aria-labelledby=\"{{uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"3\"><button id=\"{{uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{dt.uid}}\" aria-disabled=\"{{!!dt.disabled}}\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);
angular.module("template/modal/backdrop.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/modal/backdrop.html",
    "<div class=\"modal-backdrop fade {{ backdropClass }}\"\n" +
    "     ng-class=\"{in: animate}\"\n" +
    "     ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"\n" +
    "></div>\n" +
    "");
}]);
angular.module("template/modal/window.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/modal/window.html",
    "<div tabindex=\"-1\" role=\"dialog\" class=\"modal fade\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=\"close($event)\">\n" +
    "    <div class=\"modal-dialog\" ng-class=\"{'modal-sm': size == 'sm', 'modal-lg': size == 'lg'}\"><div class=\"modal-content\" modal-transclude></div></div>\n" +
    "</div>");
}]);
angular.module("template/pagination/pager.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pager.html",
    "<ul class=\"pager\">\n" +
    "  <li ng-class=\"{disabled: noPrevious(), previous: align}\"><a href ng-click=\"selectPage(page - 1)\">{{getText('previous')}}</a></li>\n" +
    "  <li ng-class=\"{disabled: noNext(), next: align}\"><a href ng-click=\"selectPage(page + 1)\">{{getText('next')}}</a></li>\n" +
    "</ul>");
}]);
angular.module("template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pagination.html",
    "<ul class=\"pagination\">\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noPrevious()}\"><a href ng-click=\"selectPage(1)\">{{getText('first')}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noPrevious()}\"><a href ng-click=\"selectPage(page - 1)\">{{getText('previous')}}</a></li>\n" +
    "  <li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active}\"><a href ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noNext()}\"><a href ng-click=\"selectPage(page + 1)\">{{getText('next')}}</a></li>\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noNext()}\"><a href ng-click=\"selectPage(totalPages)\">{{getText('last')}}</a></li>\n" +
    "</ul>");
}]);
angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-html-unsafe-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" bind-html-unsafe=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);
angular.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);
angular.module("template/popover/popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/popover/popover.html",
    "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
    "      <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);
angular.module("template/progressbar/bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/bar.html",
    "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: percent + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" ng-transclude></div>");
}]);
angular.module("template/progressbar/progress.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/progress.html",
    "<div class=\"progress\" ng-transclude></div>");
}]);
angular.module("template/progressbar/progressbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/progressbar.html",
    "<div class=\"progress\">\n" +
    "  <div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: percent + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" ng-transclude></div>\n" +
    "</div>");
}]);
angular.module("template/rating/rating.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/rating/rating.html",
    "<span ng-mouseleave=\"reset()\" ng-keydown=\"onKeydown($event)\" tabindex=\"0\" role=\"slider\" aria-valuemin=\"0\" aria-valuemax=\"{{range.length}}\" aria-valuenow=\"{{value}}\">\n" +
    "    <i ng-repeat=\"r in range track by $index\" ng-mouseenter=\"enter($index + 1)\" ng-click=\"rate($index + 1)\" class=\"glyphicon\" ng-class=\"$index < value && (r.stateOn || 'glyphicon-star') || (r.stateOff || 'glyphicon-star-empty')\">\n" +
    "        <span class=\"sr-only\">({{ $index < value ? '*' : ' ' }})</span>\n" +
    "    </i>\n" +
    "</span>");
}]);
angular.module("template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tab.html",
    "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
    "  <a href ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);
angular.module("template/tabs/tabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tabset.html",
    "<div>\n" +
    "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\">\n" +
    "    <div class=\"tab-pane\" \n" +
    "         ng-repeat=\"tab in tabs\" \n" +
    "         ng-class=\"{active: tab.active}\"\n" +
    "         tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);
angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/timepicker/timepicker.html",
    "<table>\n" +
    "	<tbody>\n" +
    "		<tr class=\"text-center\">\n" +
    "			<td><a ng-click=\"incrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "			<td>&nbsp;</td>\n" +
    "			<td><a ng-click=\"incrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "			<td ng-show=\"showMeridian\"></td>\n" +
    "		</tr>\n" +
    "		<tr>\n" +
    "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidHours}\">\n" +
    "				<input type=\"text\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-mousewheel=\"incrementHours()\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "			</td>\n" +
    "			<td>:</td>\n" +
    "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
    "				<input type=\"text\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "			</td>\n" +
    "			<td ng-show=\"showMeridian\"><button type=\"button\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\">{{meridian}}</button></td>\n" +
    "		</tr>\n" +
    "		<tr class=\"text-center\">\n" +
    "			<td><a ng-click=\"decrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "			<td>&nbsp;</td>\n" +
    "			<td><a ng-click=\"decrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "			<td ng-show=\"showMeridian\"></td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "");
}]);
angular.module("template/typeahead/typeahead-match.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/typeahead/typeahead-match.html",
    "<a tabindex=\"-1\" bind-html-unsafe=\"match.label | typeaheadHighlight:query\"></a>");
}]);
angular.module("template/typeahead/typeahead-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/typeahead/typeahead-popup.html",
    "<ul class=\"dropdown-menu\" ng-show=\"isOpen()\" ng-style=\"{top: position.top+'px', left: position.left+'px'}\" style=\"display: block;\" role=\"listbox\" aria-hidden=\"{{!isOpen()}}\">\n" +
    "    <li ng-repeat=\"match in matches track by $index\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index)\" role=\"option\" id=\"{{match.id}}\">\n" +
    "        <div typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
    "    </li>\n" +
    "</ul>\n" +
    "");
}]);;
/*! RESOURCE: /scripts/thirdparty/modernizr/modernizr.custom.min.js */
/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-applicationcache-canvas-canvastext-draganddrop-hashchange-history-audio-video-indexeddb-localstorage-postmessage-websockets-webworkers-touch-cssclasses-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-load
 */
;
window.Modernizr = function(a, b, c) {
    function A(a) {
      j.cssText = a
    }

    function B(a, b) {
      return A(m.join(a + ";") + (b || ""))
    }

    function C(a, b) {
      return typeof a === b
    }

    function D(a, b) {
      return !!~("" + a).indexOf(b)
    }

    function E(a, b) {
      for (var d in a) {
        var e = a[d];
        if (!D(e, "-") && j[e] !== c) return b == "pfx" ? e : !0
      }
      return !1
    }

    function F(a, b, d) {
      for (var e in a) {
        var f = b[a[e]];
        if (f !== c) return d === !1 ? a[e] : C(f, "function") ? f.bind(d || b) : f
      }
      return !1
    }

    function G(a, b, c) {
      var d = a.charAt(0).toUpperCase() + a.slice(1),
        e = (a + " " + o.join(d + " ") + d).split(" ");
      return C(b, "string") || C(b, "undefined") ? E(e, b) : (e = (a + " " + p.join(d + " ") + d).split(" "), F(e, b, c))
    }
    var d = "2.8.3",
      e = {},
      f = !0,
      g = b.documentElement,
      h = "modernizr",
      i = b.createElement(h),
      j = i.style,
      k, l = {}.toString,
      m = " -webkit- -moz- -o- -ms- ".split(" "),
      n = "Webkit Moz O ms",
      o = n.split(" "),
      p = n.toLowerCase().split(" "),
      q = {},
      r = {},
      s = {},
      t = [],
      u = t.slice,
      v, w = function(a, c, d, e) {
        var f, i, j, k, l = b.createElement("div"),
          m = b.body,
          n = m || b.createElement("body");
        if (parseInt(d, 10))
          while (d--) j = b.createElement("div"), j.id = e ? e[d] : h + (d + 1), l.appendChild(j);
        return f = ["&#173;", '<style id="s', h, '">', a, "</style>"].join(""), l.id = h, (m ? l : n).innerHTML += f, n.appendChild(l), m || (n.style.background = "", n.style.overflow = "hidden", k = g.style.overflow, g.style.overflow = "hidden", g.appendChild(n)), i = c(l, a), m ? l.parentNode.removeChild(l) : (n.parentNode.removeChild(n), g.style.overflow = k), !!i
      },
      x = function() {
        function d(d, e) {
          e = e || b.createElement(a[d] || "div"), d = "on" + d;
          var f = d in e;
          return f || (e.setAttribute || (e = b.createElement("div")), e.setAttribute && e.removeAttribute && (e.setAttribute(d, ""), f = C(e[d], "function"), C(e[d], "undefined") || (e[d] = c), e.removeAttribute(d))), e = null, f
        }
        var a = {
          select: "input",
          change: "input",
          submit: "form",
          reset: "form",
          error: "img",
          load: "img",
          abort: "img"
        };
        return d
      }(),
      y = {}.hasOwnProperty,
      z;
    !C(y, "undefined") && !C(y.call, "undefined") ? z = function(a, b) {
      return y.call(a, b)
    } : z = function(a, b) {
      return b in a && C(a.constructor.prototype[b], "undefined")
    }, Function.prototype.bind || (Function.prototype.bind = function(b) {
      var c = this;
      if (typeof c != "function") throw new TypeError;
      var d = u.call(arguments, 1),
        e = function() {
          if (this instanceof e) {
            var a = function() {};
            a.prototype = c.prototype;
            var f = new a,
              g = c.apply(f, d.concat(u.call(arguments)));
            return Object(g) === g ? g : f
          }
          return c.apply(b, d.concat(u.call(arguments)))
        };
      return e
    }), q.canvas = function() {
      var a = b.createElement("canvas");
      return !!a.getContext && !!a.getContext("2d")
    }, q.canvastext = function() {
      return !!e.canvas && !!C(b.createElement("canvas").getContext("2d").fillText, "function")
    }, q.touch = function() {
      var c;
      return "ontouchstart" in a || a.DocumentTouch && b instanceof DocumentTouch ? c = !0 : w(["@media (", m.join("touch-enabled),("), h, ")", "{#modernizr{top:9px;position:absolute}}"].join(""), function(a) {
        c = a.offsetTop === 9
      }), c
    }, q.postmessage = function() {
      return !!a.postMessage
    }, q.indexedDB = function() {
      return !!G("indexedDB", a)
    }, q.hashchange = function() {
      return x("hashchange", a) && (b.documentMode === c || b.documentMode > 7)
    }, q.history = function() {
      return !!a.history && !!history.pushState
    }, q.draganddrop = function() {
      var a = b.createElement("div");
      return "draggable" in a || "ondragstart" in a && "ondrop" in a
    }, q.websockets = function() {
      return "WebSocket" in a || "MozWebSocket" in a
    }, q.video = function() {
      var a = b.createElement("video"),
        c = !1;
      try {
        if (c = !!a.canPlayType) c = new Boolean(c), c.ogg = a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ""), c.h264 = a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ""), c.webm = a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, "")
      } catch (d) {}
      return c
    }, q.audio = function() {
      var a = b.createElement("audio"),
        c = !1;
      try {
        if (c = !!a.canPlayType) c = new Boolean(c), c.ogg = a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), c.mp3 = a.canPlayType("audio/mpeg;").replace(/^no$/, ""), c.wav = a.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""), c.m4a = (a.canPlayType("audio/x-m4a;") || a.canPlayType("audio/aac;")).replace(/^no$/, "")
      } catch (d) {}
      return c
    }, q.localstorage = function() {
      try {
        return localStorage.setItem(h, h), localStorage.removeItem(h), !0
      } catch (a) {
        return !1
      }
    }, q.webworkers = function() {
      return !!a.Worker
    }, q.applicationcache = function() {
      return !!a.applicationCache
    };
    for (var H in q) z(q, H) && (v = H.toLowerCase(), e[v] = q[H](), t.push((e[v] ? "" : "no-") + v));
    return e.addTest = function(a, b) {
      if (typeof a == "object")
        for (var d in a) z(a, d) && e.addTest(d, a[d]);
      else {
        a = a.toLowerCase();
        if (e[a] !== c) return e;
        b = typeof b == "function" ? b() : b, typeof f != "undefined" && f && (g.className += " " + (b ? "" : "no-") + a), e[a] = b
      }
      return e
    }, A(""), i = k = null, e._version = d, e._prefixes = m, e._domPrefixes = p, e._cssomPrefixes = o, e.hasEvent = x, e.testProp = function(a) {
      return E([a])
    }, e.testAllProps = G, e.testStyles = w, g.className = g.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (f ? " js " + t.join(" ") : ""), e
  }(this, this.document),
  function(a, b, c) {
    function d(a) {
      return "[object Function]" == o.call(a)
    }

    function e(a) {
      return "string" == typeof a
    }

    function f() {}

    function g(a) {
      return !a || "loaded" == a || "complete" == a || "uninitialized" == a
    }

    function h() {
      var a = p.shift();
      q = 1, a ? a.t ? m(function() {
        ("c" == a.t ? B.injectCss : B.injectJs)(a.s, 0, a.a, a.x, a.e, 1)
      }, 0) : (a(), h()) : q = 0
    }

    function i(a, c, d, e, f, i, j) {
      function k(b) {
        if (!o && g(l.readyState) && (u.r = o = 1, !q && h(), l.onload = l.onreadystatechange = null, b)) {
          "img" != a && m(function() {
            t.removeChild(l)
          }, 50);
          for (var d in y[c]) y[c].hasOwnProperty(d) && y[c][d].onload()
        }
      }
      var j = j || B.errorTimeout,
        l = b.createElement(a),
        o = 0,
        r = 0,
        u = {
          t: d,
          s: c,
          e: f,
          a: i,
          x: j
        };
      1 === y[c] && (r = 1, y[c] = []), "object" == a ? l.data = c : (l.src = c, l.type = a), l.width = l.height = "0", l.onerror = l.onload = l.onreadystatechange = function() {
        k.call(this, r)
      }, p.splice(e, 0, u), "img" != a && (r || 2 === y[c] ? (t.insertBefore(l, s ? null : n), m(k, j)) : y[c].push(l))
    }

    function j(a, b, c, d, f) {
      return q = 0, b = b || "j", e(a) ? i("c" == b ? v : u, a, b, this.i++, c, d, f) : (p.splice(this.i++, 0, a), 1 == p.length && h()), this
    }

    function k() {
      var a = B;
      return a.loader = {
        load: j,
        i: 0
      }, a
    }
    var l = b.documentElement,
      m = a.setTimeout,
      n = b.getElementsByTagName("script")[0],
      o = {}.toString,
      p = [],
      q = 0,
      r = "MozAppearance" in l.style,
      s = r && !!b.createRange().compareNode,
      t = s ? l : n.parentNode,
      l = a.opera && "[object Opera]" == o.call(a.opera),
      l = !!b.attachEvent && !l,
      u = r ? "object" : l ? "script" : "img",
      v = l ? "script" : u,
      w = Array.isArray || function(a) {
        return "[object Array]" == o.call(a)
      },
      x = [],
      y = {},
      z = {
        timeout: function(a, b) {
          return b.length && (a.timeout = b[0]), a
        }
      },
      A, B;
    B = function(a) {
      function b(a) {
        var a = a.split("!"),
          b = x.length,
          c = a.pop(),
          d = a.length,
          c = {
            url: c,
            origUrl: c,
            prefixes: a
          },
          e, f, g;
        for (f = 0; f < d; f++) g = a[f].split("="), (e = z[g.shift()]) && (c = e(c, g));
        for (f = 0; f < b; f++) c = x[f](c);
        return c
      }

      function g(a, e, f, g, h) {
        var i = b(a),
          j = i.autoCallback;
        i.url.split(".").pop().split("?").shift(), i.bypass || (e && (e = d(e) ? e : e[a] || e[g] || e[a.split("/").pop().split("?")[0]]), i.instead ? i.instead(a, e, f, g, h) : (y[i.url] ? i.noexec = !0 : y[i.url] = 1, f.load(i.url, i.forceCSS || !i.forceJS && "css" == i.url.split(".").pop().split("?").shift() ? "c" : c, i.noexec, i.attrs, i.timeout), (d(e) || d(j)) && f.load(function() {
          k(), e && e(i.origUrl, h, g), j && j(i.origUrl, h, g), y[i.url] = 2
        })))
      }

      function h(a, b) {
        function c(a, c) {
          if (a) {
            if (e(a)) c || (j = function() {
              var a = [].slice.call(arguments);
              k.apply(this, a), l()
            }), g(a, j, b, 0, h);
            else if (Object(a) === a)
              for (n in m = function() {
                  var b = 0,
                    c;
                  for (c in a) a.hasOwnProperty(c) && b++;
                  return b
                }(), a) a.hasOwnProperty(n) && (!c && !--m && (d(j) ? j = function() {
                var a = [].slice.call(arguments);
                k.apply(this, a), l()
              } : j[n] = function(a) {
                return function() {
                  var b = [].slice.call(arguments);
                  a && a.apply(this, b), l()
                }
              }(k[n])), g(a[n], j, b, n, h))
          } else !c && l()
        }
        var h = !!a.test,
          i = a.load || a.both,
          j = a.callback || f,
          k = j,
          l = a.complete || f,
          m, n;
        c(h ? a.yep : a.nope, !!i), i && c(i)
      }
      var i, j, l = this.yepnope.loader;
      if (e(a)) g(a, 0, l, 0);
      else if (w(a))
        for (i = 0; i < a.length; i++) j = a[i], e(j) ? g(j, 0, l, 0) : w(j) ? B(j) : Object(j) === j && h(j, l);
      else Object(a) === a && h(a, l)
    }, B.addPrefix = function(a, b) {
      z[a] = b
    }, B.addFilter = function(a) {
      x.push(a)
    }, B.errorTimeout = 1e4, null == b.readyState && b.addEventListener && (b.readyState = "loading", b.addEventListener("DOMContentLoaded", A = function() {
      b.removeEventListener("DOMContentLoaded", A, 0), b.readyState = "complete"
    }, 0)), a.yepnope = k(), a.yepnope.executeStack = h, a.yepnope.injectJs = function(a, c, d, e, i, j) {
      var k = b.createElement("script"),
        l, o, e = e || B.errorTimeout;
      k.src = a;
      for (o in d) k.setAttribute(o, d[o]);
      c = j ? h : c || f, k.onreadystatechange = k.onload = function() {
        !l && g(k.readyState) && (l = 1, c(), k.onload = k.onreadystatechange = null)
      }, m(function() {
        l || (l = 1, c(1))
      }, e), i ? k.onload() : n.parentNode.insertBefore(k, n)
    }, a.yepnope.injectCss = function(a, c, d, e, g, i) {
      var e = b.createElement("link"),
        j, c = i ? h : c || f;
      e.href = a, e.rel = "stylesheet", e.type = "text/css";
      for (j in d) e.setAttribute(j, d[j]);
      g || (n.parentNode.insertBefore(e, n), m(c, 0))
    }
  }(this, document), Modernizr.load = function() {
    yepnope.apply(window, [].slice.call(arguments, 0))
  };
/*! RESOURCE: /scripts/thirdparty/velocity/velocity.min.js */
/*! VelocityJS.org (1.2.2). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */
/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */
! function(e) {
  function t(e) {
    var t = e.length,
      r = $.type(e);
    return "function" === r || $.isWindow(e) ? !1 : 1 === e.nodeType && t ? !0 : "array" === r || 0 === t || "number" == typeof t && t > 0 && t - 1 in e
  }

  if (!e.jQuery) {
    var $ = function(e, t) {
      return new $.fn.init(e, t)
    };
    $.isWindow = function(e) {
      return null != e && e == e.window
    }, $.type = function(e) {
      return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? a[o.call(e)] || "object" : typeof e
    }, $.isArray = Array.isArray || function(e) {
      return "array" === $.type(e)
    }, $.isPlainObject = function(e) {
      var t;
      if (!e || "object" !== $.type(e) || e.nodeType || $.isWindow(e)) return !1;
      try {
        if (e.constructor && !n.call(e, "constructor") && !n.call(e.constructor.prototype, "isPrototypeOf")) return !1
      } catch (r) {
        return !1
      }
      for (t in e);
      return void 0 === t || n.call(e, t)
    }, $.each = function(e, r, a) {
      var n, o = 0,
        i = e.length,
        s = t(e);
      if (a) {
        if (s)
          for (; i > o && (n = r.apply(e[o], a), n !== !1); o++);
        else
          for (o in e)
            if (n = r.apply(e[o], a), n === !1) break
      } else if (s)
        for (; i > o && (n = r.call(e[o], o, e[o]), n !== !1); o++);
      else
        for (o in e)
          if (n = r.call(e[o], o, e[o]), n === !1) break;
      return e
    }, $.data = function(e, t, a) {
      if (void 0 === a) {
        var n = e[$.expando],
          o = n && r[n];
        if (void 0 === t) return o;
        if (o && t in o) return o[t]
      } else if (void 0 !== t) {
        var n = e[$.expando] || (e[$.expando] = ++$.uuid);
        return r[n] = r[n] || {}, r[n][t] = a, a
      }
    }, $.removeData = function(e, t) {
      var a = e[$.expando],
        n = a && r[a];
      n && $.each(t, function(e, t) {
        delete n[t]
      })
    }, $.extend = function() {
      var e, t, r, a, n, o, i = arguments[0] || {},
        s = 1,
        l = arguments.length,
        u = !1;
      for ("boolean" == typeof i && (u = i, i = arguments[s] || {}, s++), "object" != typeof i && "function" !== $.type(i) && (i = {}), s === l && (i = this, s--); l > s; s++)
        if (null != (n = arguments[s]))
          for (a in n) e = i[a], r = n[a], i !== r && (u && r && ($.isPlainObject(r) || (t = $.isArray(r))) ? (t ? (t = !1, o = e && $.isArray(e) ? e : []) : o = e && $.isPlainObject(e) ? e : {}, i[a] = $.extend(u, o, r)) : void 0 !== r && (i[a] = r));
      return i
    }, $.queue = function(e, r, a) {
      function n(e, r) {
        var a = r || [];
        return null != e && (t(Object(e)) ? ! function(e, t) {
          for (var r = +t.length, a = 0, n = e.length; r > a;) e[n++] = t[a++];
          if (r !== r)
            for (; void 0 !== t[a];) e[n++] = t[a++];
          return e.length = n, e
        }(a, "string" == typeof e ? [e] : e) : [].push.call(a, e)), a
      }

      if (e) {
        r = (r || "fx") + "queue";
        var o = $.data(e, r);
        return a ? (!o || $.isArray(a) ? o = $.data(e, r, n(a)) : o.push(a), o) : o || []
      }
    }, $.dequeue = function(e, t) {
      $.each(e.nodeType ? [e] : e, function(e, r) {
        t = t || "fx";
        var a = $.queue(r, t),
          n = a.shift();
        "inprogress" === n && (n = a.shift()), n && ("fx" === t && a.unshift("inprogress"), n.call(r, function() {
          $.dequeue(r, t)
        }))
      })
    }, $.fn = $.prototype = {
      init: function(e) {
        if (e.nodeType) return this[0] = e, this;
        throw new Error("Not a DOM node.")
      },
      offset: function() {
        var t = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : {
          top: 0,
          left: 0
        };
        return {
          top: t.top + (e.pageYOffset || document.scrollTop || 0) - (document.clientTop || 0),
          left: t.left + (e.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0)
        }
      },
      position: function() {
        function e() {
          for (var e = this.offsetParent || document; e && "html" === !e.nodeType.toLowerCase && "static" === e.style.position;) e = e.offsetParent;
          return e || document
        }

        var t = this[0],
          e = e.apply(t),
          r = this.offset(),
          a = /^(?:body|html)$/i.test(e.nodeName) ? {
            top: 0,
            left: 0
          } : $(e).offset();
        return r.top -= parseFloat(t.style.marginTop) || 0, r.left -= parseFloat(t.style.marginLeft) || 0, e.style && (a.top += parseFloat(e.style.borderTopWidth) || 0, a.left += parseFloat(e.style.borderLeftWidth) || 0), {
          top: r.top - a.top,
          left: r.left - a.left
        }
      }
    };
    var r = {};
    $.expando = "velocity" + (new Date).getTime(), $.uuid = 0;
    for (var a = {}, n = a.hasOwnProperty, o = a.toString, i = "Boolean Number String Function Array Date RegExp Object Error".split(" "), s = 0; s < i.length; s++) a["[object " + i[s] + "]"] = i[s].toLowerCase();
    $.fn.init.prototype = $.fn, e.Velocity = {
      Utilities: $
    }
  }
}(window),
function(e) {
  "object" == typeof module && "object" == typeof module.exports ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : e()
}(function() {
  return function(e, t, r, a) {
    function n(e) {
      for (var t = -1, r = e ? e.length : 0, a = []; ++t < r;) {
        var n = e[t];
        n && a.push(n)
      }
      return a
    }

    function o(e) {
      return g.isWrapped(e) ? e = [].slice.call(e) : g.isNode(e) && (e = [e]), e
    }

    function i(e) {
      var t = $.data(e, "velocity");
      return null === t ? a : t
    }

    function s(e) {
      return function(t) {
        return Math.round(t * e) * (1 / e)
      }
    }

    function l(e, r, a, n) {
      function o(e, t) {
        return 1 - 3 * t + 3 * e
      }

      function i(e, t) {
        return 3 * t - 6 * e
      }

      function s(e) {
        return 3 * e
      }

      function l(e, t, r) {
        return ((o(t, r) * e + i(t, r)) * e + s(t)) * e
      }

      function u(e, t, r) {
        return 3 * o(t, r) * e * e + 2 * i(t, r) * e + s(t)
      }

      function c(t, r) {
        for (var n = 0; m > n; ++n) {
          var o = u(r, e, a);
          if (0 === o) return r;
          var i = l(r, e, a) - t;
          r -= i / o
        }
        return r
      }

      function p() {
        for (var t = 0; b > t; ++t) w[t] = l(t * x, e, a)
      }

      function f(t, r, n) {
        var o, i, s = 0;
        do i = r + (n - r) / 2, o = l(i, e, a) - t, o > 0 ? n = i : r = i; while (Math.abs(o) > h && ++s < v);
        return i
      }

      function d(t) {
        for (var r = 0, n = 1, o = b - 1; n != o && w[n] <= t; ++n) r += x;
        --n;
        var i = (t - w[n]) / (w[n + 1] - w[n]),
          s = r + i * x,
          l = u(s, e, a);
        return l >= y ? c(t, s) : 0 == l ? s : f(t, r, r + x)
      }

      function g() {
        V = !0, (e != r || a != n) && p()
      }

      var m = 4,
        y = .001,
        h = 1e-7,
        v = 10,
        b = 11,
        x = 1 / (b - 1),
        S = "Float32Array" in t;
      if (4 !== arguments.length) return !1;
      for (var P = 0; 4 > P; ++P)
        if ("number" != typeof arguments[P] || isNaN(arguments[P]) || !isFinite(arguments[P])) return !1;
      e = Math.min(e, 1), a = Math.min(a, 1), e = Math.max(e, 0), a = Math.max(a, 0);
      var w = S ? new Float32Array(b) : new Array(b),
        V = !1,
        C = function(t) {
          return V || g(), e === r && a === n ? t : 0 === t ? 0 : 1 === t ? 1 : l(d(t), r, n)
        };
      C.getControlPoints = function() {
        return [{
          x: e,
          y: r
        }, {
          x: a,
          y: n
        }]
      };
      var T = "generateBezier(" + [e, r, a, n] + ")";
      return C.toString = function() {
        return T
      }, C
    }

    function u(e, t) {
      var r = e;
      return g.isString(e) ? v.Easings[e] || (r = !1) : r = g.isArray(e) && 1 === e.length ? s.apply(null, e) : g.isArray(e) && 2 === e.length ? b.apply(null, e.concat([t])) : g.isArray(e) && 4 === e.length ? l.apply(null, e) : !1, r === !1 && (r = v.Easings[v.defaults.easing] ? v.defaults.easing : h), r
    }

    function c(e) {
      if (e) {
        var t = (new Date).getTime(),
          r = v.State.calls.length;
        r > 1e4 && (v.State.calls = n(v.State.calls));
        for (var o = 0; r > o; o++)
          if (v.State.calls[o]) {
            var s = v.State.calls[o],
              l = s[0],
              u = s[2],
              f = s[3],
              d = !!f,
              m = null;
            f || (f = v.State.calls[o][3] = t - 16);
            for (var y = Math.min((t - f) / u.duration, 1), h = 0, b = l.length; b > h; h++) {
              var S = l[h],
                w = S.element;
              if (i(w)) {
                var V = !1;
                if (u.display !== a && null !== u.display && "none" !== u.display) {
                  if ("flex" === u.display) {
                    var C = ["-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex"];
                    $.each(C, function(e, t) {
                      x.setPropertyValue(w, "display", t)
                    })
                  }
                  x.setPropertyValue(w, "display", u.display)
                }
                u.visibility !== a && "hidden" !== u.visibility && x.setPropertyValue(w, "visibility", u.visibility);
                for (var T in S)
                  if ("element" !== T) {
                    var k = S[T],
                      A, F = g.isString(k.easing) ? v.Easings[k.easing] : k.easing;
                    if (1 === y) A = k.endValue;
                    else {
                      var E = k.endValue - k.startValue;
                      if (A = k.startValue + E * F(y, u, E), !d && A === k.currentValue) continue
                    }
                    if (k.currentValue = A, "tween" === T) m = A;
                    else {
                      if (x.Hooks.registered[T]) {
                        var j = x.Hooks.getRoot(T),
                          H = i(w).rootPropertyValueCache[j];
                        H && (k.rootPropertyValue = H)
                      }
                      var N = x.setPropertyValue(w, T, k.currentValue + (0 === parseFloat(A) ? "" : k.unitType), k.rootPropertyValue, k.scrollData);
                      x.Hooks.registered[T] && (i(w).rootPropertyValueCache[j] = x.Normalizations.registered[j] ? x.Normalizations.registered[j]("extract", null, N[1]) : N[1]), "transform" === N[0] && (V = !0)
                    }
                  }
                u.mobileHA && i(w).transformCache.translate3d === a && (i(w).transformCache.translate3d = "(0px, 0px, 0px)", V = !0), V && x.flushTransformCache(w)
              }
            }
            u.display !== a && "none" !== u.display && (v.State.calls[o][2].display = !1), u.visibility !== a && "hidden" !== u.visibility && (v.State.calls[o][2].visibility = !1), u.progress && u.progress.call(s[1], s[1], y, Math.max(0, f + u.duration - t), f, m), 1 === y && p(o)
          }
      }
      v.State.isTicking && P(c)
    }

    function p(e, t) {
      if (!v.State.calls[e]) return !1;
      for (var r = v.State.calls[e][0], n = v.State.calls[e][1], o = v.State.calls[e][2], s = v.State.calls[e][4], l = !1, u = 0, c = r.length; c > u; u++) {
        var p = r[u].element;
        if (t || o.loop || ("none" === o.display && x.setPropertyValue(p, "display", o.display), "hidden" === o.visibility && x.setPropertyValue(p, "visibility", o.visibility)), o.loop !== !0 && ($.queue(p)[1] === a || !/\.velocityQueueEntryFlag/i.test($.queue(p)[1])) && i(p)) {
          i(p).isAnimating = !1, i(p).rootPropertyValueCache = {};
          var f = !1;
          $.each(x.Lists.transforms3D, function(e, t) {
            var r = /^scale/.test(t) ? 1 : 0,
              n = i(p).transformCache[t];
            i(p).transformCache[t] !== a && new RegExp("^\\(" + r + "[^.]").test(n) && (f = !0, delete i(p).transformCache[t])
          }), o.mobileHA && (f = !0, delete i(p).transformCache.translate3d), f && x.flushTransformCache(p), x.Values.removeClass(p, "velocity-animating")
        }
        if (!t && o.complete && !o.loop && u === c - 1) try {
          o.complete.call(n, n)
        } catch (d) {
          setTimeout(function() {
            throw d
          }, 1)
        }
        s && o.loop !== !0 && s(n), i(p) && o.loop === !0 && !t && ($.each(i(p).tweensContainer, function(e, t) {
          /^rotate/.test(e) && 360 === parseFloat(t.endValue) && (t.endValue = 0, t.startValue = 360), /^backgroundPosition/.test(e) && 100 === parseFloat(t.endValue) && "%" === t.unitType && (t.endValue = 0, t.startValue = 100)
        }), v(p, "reverse", {
          loop: !0,
          delay: o.delay
        })), o.queue !== !1 && $.dequeue(p, o.queue)
      }
      v.State.calls[e] = !1;
      for (var g = 0, m = v.State.calls.length; m > g; g++)
        if (v.State.calls[g] !== !1) {
          l = !0;
          break
        }
      l === !1 && (v.State.isTicking = !1, delete v.State.calls, v.State.calls = [])
    }

    var f = function() {
        if (r.documentMode) return r.documentMode;
        for (var e = 7; e > 4; e--) {
          var t = r.createElement("div");
          if (t.innerHTML = "<!--[if IE " + e + "]><span></span><![endif]-->", t.getElementsByTagName("span").length) return t = null, e
        }
        return a
      }(),
      d = function() {
        var e = 0;
        return t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || function(t) {
          var r = (new Date).getTime(),
            a;
          return a = Math.max(0, 16 - (r - e)), e = r + a, setTimeout(function() {
            t(r + a)
          }, a)
        }
      }(),
      g = {
        isString: function(e) {
          return "string" == typeof e
        },
        isArray: Array.isArray || function(e) {
          return "[object Array]" === Object.prototype.toString.call(e)
        },
        isFunction: function(e) {
          return "[object Function]" === Object.prototype.toString.call(e)
        },
        isNode: function(e) {
          return e && e.nodeType
        },
        isNodeList: function(e) {
          return "object" == typeof e && /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(e)) && e.length !== a && (0 === e.length || "object" == typeof e[0] && e[0].nodeType > 0)
        },
        isWrapped: function(e) {
          return e && (e.jquery || t.Zepto && t.Zepto.zepto.isZ(e))
        },
        isSVG: function(e) {
          return t.SVGElement && e instanceof t.SVGElement
        },
        isEmptyObject: function(e) {
          for (var t in e) return !1;
          return !0
        }
      },
      $, m = !1;
    if (e.fn && e.fn.jquery ? ($ = e, m = !0) : $ = t.Velocity.Utilities, 8 >= f && !m) throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");
    if (7 >= f) return void(jQuery.fn.velocity = jQuery.fn.animate);
    var y = 400,
      h = "swing",
      v = {
        State: {
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          isAndroid: /Android/i.test(navigator.userAgent),
          isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent),
          isChrome: t.chrome,
          isFirefox: /Firefox/i.test(navigator.userAgent),
          prefixElement: r.createElement("div"),
          prefixMatches: {},
          scrollAnchor: null,
          scrollPropertyLeft: null,
          scrollPropertyTop: null,
          isTicking: !1,
          calls: []
        },
        CSS: {},
        Utilities: $,
        Redirects: {},
        Easings: {},
        Promise: t.Promise,
        defaults: {
          queue: "",
          duration: y,
          easing: h,
          begin: a,
          complete: a,
          progress: a,
          display: a,
          visibility: a,
          loop: !1,
          delay: !1,
          mobileHA: !0,
          _cacheValues: !0
        },
        init: function(e) {
          $.data(e, "velocity", {
            isSVG: g.isSVG(e),
            isAnimating: !1,
            computedStyle: null,
            tweensContainer: null,
            rootPropertyValueCache: {},
            transformCache: {}
          })
        },
        hook: null,
        mock: !1,
        version: {
          major: 1,
          minor: 2,
          patch: 2
        },
        debug: !1
      };
    t.pageYOffset !== a ? (v.State.scrollAnchor = t, v.State.scrollPropertyLeft = "pageXOffset", v.State.scrollPropertyTop = "pageYOffset") : (v.State.scrollAnchor = r.documentElement || r.body.parentNode || r.body, v.State.scrollPropertyLeft = "scrollLeft", v.State.scrollPropertyTop = "scrollTop");
    var b = function() {
      function e(e) {
        return -e.tension * e.x - e.friction * e.v
      }

      function t(t, r, a) {
        var n = {
          x: t.x + a.dx * r,
          v: t.v + a.dv * r,
          tension: t.tension,
          friction: t.friction
        };
        return {
          dx: n.v,
          dv: e(n)
        }
      }

      function r(r, a) {
        var n = {
            dx: r.v,
            dv: e(r)
          },
          o = t(r, .5 * a, n),
          i = t(r, .5 * a, o),
          s = t(r, a, i),
          l = 1 / 6 * (n.dx + 2 * (o.dx + i.dx) + s.dx),
          u = 1 / 6 * (n.dv + 2 * (o.dv + i.dv) + s.dv);
        return r.x = r.x + l * a, r.v = r.v + u * a, r
      }

      return function a(e, t, n) {
        var o = {
            x: -1,
            v: 0,
            tension: null,
            friction: null
          },
          i = [0],
          s = 0,
          l = 1e-4,
          u = .016,
          c, p, f;
        for (e = parseFloat(e) || 500, t = parseFloat(t) || 20, n = n || null, o.tension = e, o.friction = t, c = null !== n, c ? (s = a(e, t), p = s / n * u) : p = u;;)
          if (f = r(f || o, p), i.push(1 + f.x), s += 16, !(Math.abs(f.x) > l && Math.abs(f.v) > l)) break;
        return c ? function(e) {
          return i[e * (i.length - 1) | 0]
        } : s
      }
    }();
    v.Easings = {
      linear: function(e) {
        return e
      },
      swing: function(e) {
        return .5 - Math.cos(e * Math.PI) / 2
      },
      spring: function(e) {
        return 1 - Math.cos(4.5 * e * Math.PI) * Math.exp(6 * -e)
      }
    }, $.each([
      ["ease", [.25, .1, .25, 1]],
      ["ease-in", [.42, 0, 1, 1]],
      ["ease-out", [0, 0, .58, 1]],
      ["ease-in-out", [.42, 0, .58, 1]],
      ["easeInSine", [.47, 0, .745, .715]],
      ["easeOutSine", [.39, .575, .565, 1]],
      ["easeInOutSine", [.445, .05, .55, .95]],
      ["easeInQuad", [.55, .085, .68, .53]],
      ["easeOutQuad", [.25, .46, .45, .94]],
      ["easeInOutQuad", [.455, .03, .515, .955]],
      ["easeInCubic", [.55, .055, .675, .19]],
      ["easeOutCubic", [.215, .61, .355, 1]],
      ["easeInOutCubic", [.645, .045, .355, 1]],
      ["easeInQuart", [.895, .03, .685, .22]],
      ["easeOutQuart", [.165, .84, .44, 1]],
      ["easeInOutQuart", [.77, 0, .175, 1]],
      ["easeInQuint", [.755, .05, .855, .06]],
      ["easeOutQuint", [.23, 1, .32, 1]],
      ["easeInOutQuint", [.86, 0, .07, 1]],
      ["easeInExpo", [.95, .05, .795, .035]],
      ["easeOutExpo", [.19, 1, .22, 1]],
      ["easeInOutExpo", [1, 0, 0, 1]],
      ["easeInCirc", [.6, .04, .98, .335]],
      ["easeOutCirc", [.075, .82, .165, 1]],
      ["easeInOutCirc", [.785, .135, .15, .86]]
    ], function(e, t) {
      v.Easings[t[0]] = l.apply(null, t[1])
    });
    var x = v.CSS = {
      RegEx: {
        isHex: /^#([A-f\d]{3}){1,2}$/i,
        valueUnwrap: /^[A-z]+\((.*)\)$/i,
        wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
        valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi
      },
      Lists: {
        colors: ["fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor"],
        transformsBase: ["translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ"],
        transforms3D: ["transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY"]
      },
      Hooks: {
        templates: {
          textShadow: ["Color X Y Blur", "black 0px 0px 0px"],
          boxShadow: ["Color X Y Blur Spread", "black 0px 0px 0px 0px"],
          clip: ["Top Right Bottom Left", "0px 0px 0px 0px"],
          backgroundPosition: ["X Y", "0% 0%"],
          transformOrigin: ["X Y Z", "50% 50% 0px"],
          perspectiveOrigin: ["X Y", "50% 50%"]
        },
        registered: {},
        register: function() {
          for (var e = 0; e < x.Lists.colors.length; e++) {
            var t = "color" === x.Lists.colors[e] ? "0 0 0 1" : "255 255 255 1";
            x.Hooks.templates[x.Lists.colors[e]] = ["Red Green Blue Alpha", t]
          }
          var r, a, n;
          if (f)
            for (r in x.Hooks.templates) {
              a = x.Hooks.templates[r], n = a[0].split(" ");
              var o = a[1].match(x.RegEx.valueSplit);
              "Color" === n[0] && (n.push(n.shift()), o.push(o.shift()), x.Hooks.templates[r] = [n.join(" "), o.join(" ")])
            }
          for (r in x.Hooks.templates) {
            a = x.Hooks.templates[r], n = a[0].split(" ");
            for (var e in n) {
              var i = r + n[e],
                s = e;
              x.Hooks.registered[i] = [r, s]
            }
          }
        },
        getRoot: function(e) {
          var t = x.Hooks.registered[e];
          return t ? t[0] : e
        },
        cleanRootPropertyValue: function(e, t) {
          return x.RegEx.valueUnwrap.test(t) && (t = t.match(x.RegEx.valueUnwrap)[1]), x.Values.isCSSNullValue(t) && (t = x.Hooks.templates[e][1]), t
        },
        extractValue: function(e, t) {
          var r = x.Hooks.registered[e];
          if (r) {
            var a = r[0],
              n = r[1];
            return t = x.Hooks.cleanRootPropertyValue(a, t), t.toString().match(x.RegEx.valueSplit)[n]
          }
          return t
        },
        injectValue: function(e, t, r) {
          var a = x.Hooks.registered[e];
          if (a) {
            var n = a[0],
              o = a[1],
              i, s;
            return r = x.Hooks.cleanRootPropertyValue(n, r), i = r.toString().match(x.RegEx.valueSplit), i[o] = t, s = i.join(" ")
          }
          return r
        }
      },
      Normalizations: {
        registered: {
          clip: function(e, t, r) {
            switch (e) {
              case "name":
                return "clip";
              case "extract":
                var a;
                return x.RegEx.wrappedValueAlreadyExtracted.test(r) ? a = r : (a = r.toString().match(x.RegEx.valueUnwrap), a = a ? a[1].replace(/,(\s+)?/g, " ") : r), a;
              case "inject":
                return "rect(" + r + ")"
            }
          },
          blur: function(e, t, r) {
            switch (e) {
              case "name":
                return v.State.isFirefox ? "filter" : "-webkit-filter";
              case "extract":
                var a = parseFloat(r);
                if (!a && 0 !== a) {
                  var n = r.toString().match(/blur\(([0-9]+[A-z]+)\)/i);
                  a = n ? n[1] : 0
                }
                return a;
              case "inject":
                return parseFloat(r) ? "blur(" + r + ")" : "none"
            }
          },
          opacity: function(e, t, r) {
            if (8 >= f) switch (e) {
              case "name":
                return "filter";
              case "extract":
                var a = r.toString().match(/alpha\(opacity=(.*)\)/i);
                return r = a ? a[1] / 100 : 1;
              case "inject":
                return t.style.zoom = 1, parseFloat(r) >= 1 ? "" : "alpha(opacity=" + parseInt(100 * parseFloat(r), 10) + ")"
            } else switch (e) {
              case "name":
                return "opacity";
              case "extract":
                return r;
              case "inject":
                return r
            }
          }
        },
        register: function() {
          9 >= f || v.State.isGingerbread || (x.Lists.transformsBase = x.Lists.transformsBase.concat(x.Lists.transforms3D));
          for (var e = 0; e < x.Lists.transformsBase.length; e++) ! function() {
            var t = x.Lists.transformsBase[e];
            x.Normalizations.registered[t] = function(e, r, n) {
              switch (e) {
                case "name":
                  return "transform";
                case "extract":
                  return i(r) === a || i(r).transformCache[t] === a ? /^scale/i.test(t) ? 1 : 0 : i(r).transformCache[t].replace(/[()]/g, "");
                case "inject":
                  var o = !1;
                  switch (t.substr(0, t.length - 1)) {
                    case "translate":
                      o = !/(%|px|em|rem|vw|vh|\d)$/i.test(n);
                      break;
                    case "scal":
                    case "scale":
                      v.State.isAndroid && i(r).transformCache[t] === a && 1 > n && (n = 1), o = !/(\d)$/i.test(n);
                      break;
                    case "skew":
                      o = !/(deg|\d)$/i.test(n);
                      break;
                    case "rotate":
                      o = !/(deg|\d)$/i.test(n)
                  }
                  return o || (i(r).transformCache[t] = "(" + n + ")"), i(r).transformCache[t]
              }
            }
          }();
          for (var e = 0; e < x.Lists.colors.length; e++) ! function() {
            var t = x.Lists.colors[e];
            x.Normalizations.registered[t] = function(e, r, n) {
              switch (e) {
                case "name":
                  return t;
                case "extract":
                  var o;
                  if (x.RegEx.wrappedValueAlreadyExtracted.test(n)) o = n;
                  else {
                    var i, s = {
                      black: "rgb(0, 0, 0)",
                      blue: "rgb(0, 0, 255)",
                      gray: "rgb(128, 128, 128)",
                      green: "rgb(0, 128, 0)",
                      red: "rgb(255, 0, 0)",
                      white: "rgb(255, 255, 255)"
                    };
                    /^[A-z]+$/i.test(n) ? i = s[n] !== a ? s[n] : s.black : x.RegEx.isHex.test(n) ? i = "rgb(" + x.Values.hexToRgb(n).join(" ") + ")" : /^rgba?\(/i.test(n) || (i = s.black), o = (i || n).toString().match(x.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ")
                  }
                  return 8 >= f || 3 !== o.split(" ").length || (o += " 1"), o;
                case "inject":
                  return 8 >= f ? 4 === n.split(" ").length && (n = n.split(/\s+/).slice(0, 3).join(" ")) : 3 === n.split(" ").length && (n += " 1"), (8 >= f ? "rgb" : "rgba") + "(" + n.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")"
              }
            }
          }()
        }
      },
      Names: {
        camelCase: function(e) {
          return e.replace(/-(\w)/g, function(e, t) {
            return t.toUpperCase()
          })
        },
        SVGAttribute: function(e) {
          var t = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";
          return (f || v.State.isAndroid && !v.State.isChrome) && (t += "|transform"), new RegExp("^(" + t + ")$", "i").test(e)
        },
        prefixCheck: function(e) {
          if (v.State.prefixMatches[e]) return [v.State.prefixMatches[e], !0];
          for (var t = ["", "Webkit", "Moz", "ms", "O"], r = 0, a = t.length; a > r; r++) {
            var n;
            if (n = 0 === r ? e : t[r] + e.replace(/^\w/, function(e) {
                return e.toUpperCase()
              }), g.isString(v.State.prefixElement.style[n])) return v.State.prefixMatches[e] = n, [n, !0]
          }
          return [e, !1]
        }
      },
      Values: {
        hexToRgb: function(e) {
          var t = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
            r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
            a;
          return e = e.replace(t, function(e, t, r, a) {
            return t + t + r + r + a + a
          }), a = r.exec(e), a ? [parseInt(a[1], 16), parseInt(a[2], 16), parseInt(a[3], 16)] : [0, 0, 0]
        },
        isCSSNullValue: function(e) {
          return 0 == e || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(e)
        },
        getUnitType: function(e) {
          return /^(rotate|skew)/i.test(e) ? "deg" : /(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(e) ? "" : "px"
        },
        getDisplayType: function(e) {
          var t = e && e.tagName.toString().toLowerCase();
          return /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(t) ? "inline" : /^(li)$/i.test(t) ? "list-item" : /^(tr)$/i.test(t) ? "table-row" : /^(table)$/i.test(t) ? "table" : /^(tbody)$/i.test(t) ? "table-row-group" : "block"
        },
        addClass: function(e, t) {
          e.classList ? e.classList.add(t) : e.className += (e.className.length ? " " : "") + t
        },
        removeClass: function(e, t) {
          e.classList ? e.classList.remove(t) : e.className = e.className.toString().replace(new RegExp("(^|\\s)" + t.split(" ").join("|") + "(\\s|$)", "gi"), " ")
        }
      },
      getPropertyValue: function(e, r, n, o) {
        function s(e, r) {
          function n() {
            u && x.setPropertyValue(e, "display", "none")
          }

          var l = 0;
          if (8 >= f) l = $.css(e, r);
          else {
            var u = !1;
            if (/^(width|height)$/.test(r) && 0 === x.getPropertyValue(e, "display") && (u = !0, x.setPropertyValue(e, "display", x.Values.getDisplayType(e))), !o) {
              if ("height" === r && "border-box" !== x.getPropertyValue(e, "boxSizing").toString().toLowerCase()) {
                var c = e.offsetHeight - (parseFloat(x.getPropertyValue(e, "borderTopWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "borderBottomWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingTop")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingBottom")) || 0);
                return n(), c
              }
              if ("width" === r && "border-box" !== x.getPropertyValue(e, "boxSizing").toString().toLowerCase()) {
                var p = e.offsetWidth - (parseFloat(x.getPropertyValue(e, "borderLeftWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "borderRightWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingLeft")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingRight")) || 0);
                return n(), p
              }
            }
            var d;
            d = i(e) === a ? t.getComputedStyle(e, null) : i(e).computedStyle ? i(e).computedStyle : i(e).computedStyle = t.getComputedStyle(e, null), "borderColor" === r && (r = "borderTopColor"), l = 9 === f && "filter" === r ? d.getPropertyValue(r) : d[r], ("" === l || null === l) && (l = e.style[r]), n()
          }
          if ("auto" === l && /^(top|right|bottom|left)$/i.test(r)) {
            var g = s(e, "position");
            ("fixed" === g || "absolute" === g && /top|left/i.test(r)) && (l = $(e).position()[r] + "px")
          }
          return l
        }

        var l;
        if (x.Hooks.registered[r]) {
          var u = r,
            c = x.Hooks.getRoot(u);
          n === a && (n = x.getPropertyValue(e, x.Names.prefixCheck(c)[0])), x.Normalizations.registered[c] && (n = x.Normalizations.registered[c]("extract", e, n)), l = x.Hooks.extractValue(u, n)
        } else if (x.Normalizations.registered[r]) {
          var p, d;
          p = x.Normalizations.registered[r]("name", e), "transform" !== p && (d = s(e, x.Names.prefixCheck(p)[0]), x.Values.isCSSNullValue(d) && x.Hooks.templates[r] && (d = x.Hooks.templates[r][1])), l = x.Normalizations.registered[r]("extract", e, d)
        }
        if (!/^[\d-]/.test(l))
          if (i(e) && i(e).isSVG && x.Names.SVGAttribute(r))
            if (/^(height|width)$/i.test(r)) try {
              l = e.getBBox()[r]
            } catch (g) {
              l = 0
            } else l = e.getAttribute(r);
            else l = s(e, x.Names.prefixCheck(r)[0]);
        return x.Values.isCSSNullValue(l) && (l = 0), v.debug >= 2 && console.log("Get " + r + ": " + l), l
      },
      setPropertyValue: function(e, r, a, n, o) {
        var s = r;
        if ("scroll" === r) o.container ? o.container["scroll" + o.direction] = a : "Left" === o.direction ? t.scrollTo(a, o.alternateValue) : t.scrollTo(o.alternateValue, a);
        else if (x.Normalizations.registered[r] && "transform" === x.Normalizations.registered[r]("name", e)) x.Normalizations.registered[r]("inject", e, a), s = "transform", a = i(e).transformCache[r];
        else {
          if (x.Hooks.registered[r]) {
            var l = r,
              u = x.Hooks.getRoot(r);
            n = n || x.getPropertyValue(e, u), a = x.Hooks.injectValue(l, a, n), r = u
          }
          if (x.Normalizations.registered[r] && (a = x.Normalizations.registered[r]("inject", e, a), r = x.Normalizations.registered[r]("name", e)), s = x.Names.prefixCheck(r)[0], 8 >= f) try {
            e.style[s] = a
          } catch (c) {
            v.debug && console.log("Browser does not support [" + a + "] for [" + s + "]")
          } else i(e) && i(e).isSVG && x.Names.SVGAttribute(r) ? e.setAttribute(r, a) : e.style[s] = a;
          v.debug >= 2 && console.log("Set " + r + " (" + s + "): " + a)
        }
        return [s, a]
      },
      flushTransformCache: function(e) {
        function t(t) {
          return parseFloat(x.getPropertyValue(e, t))
        }

        var r = "";
        if ((f || v.State.isAndroid && !v.State.isChrome) && i(e).isSVG) {
          var a = {
            translate: [t("translateX"), t("translateY")],
            skewX: [t("skewX")],
            skewY: [t("skewY")],
            scale: 1 !== t("scale") ? [t("scale"), t("scale")] : [t("scaleX"), t("scaleY")],
            rotate: [t("rotateZ"), 0, 0]
          };
          $.each(i(e).transformCache, function(e) {
            /^translate/i.test(e) ? e = "translate" : /^scale/i.test(e) ? e = "scale" : /^rotate/i.test(e) && (e = "rotate"), a[e] && (r += e + "(" + a[e].join(" ") + ") ", delete a[e])
          })
        } else {
          var n, o;
          $.each(i(e).transformCache, function(t) {
            return n = i(e).transformCache[t], "transformPerspective" === t ? (o = n, !0) : (9 === f && "rotateZ" === t && (t = "rotate"), void(r += t + n + " "))
          }), o && (r = "perspective" + o + " " + r)
        }
        x.setPropertyValue(e, "transform", r)
      }
    };
    x.Hooks.register(), x.Normalizations.register(), v.hook = function(e, t, r) {
      var n = a;
      return e = o(e), $.each(e, function(e, o) {
        if (i(o) === a && v.init(o), r === a) n === a && (n = v.CSS.getPropertyValue(o, t));
        else {
          var s = v.CSS.setPropertyValue(o, t, r);
          "transform" === s[0] && v.CSS.flushTransformCache(o), n = s
        }
      }), n
    };
    var S = function() {
      function e() {
        return l ? T.promise || null : f
      }

      function n() {
        function e(e) {
          function p(e, t) {
            var r = a,
              i = a,
              s = a;
            return g.isArray(e) ? (r = e[0], !g.isArray(e[1]) && /^[\d-]/.test(e[1]) || g.isFunction(e[1]) || x.RegEx.isHex.test(e[1]) ? s = e[1] : (g.isString(e[1]) && !x.RegEx.isHex.test(e[1]) || g.isArray(e[1])) && (i = t ? e[1] : u(e[1], o.duration), e[2] !== a && (s = e[2]))) : r = e, t || (i = i || o.easing), g.isFunction(r) && (r = r.call(n, w, P)), g.isFunction(s) && (s = s.call(n, w, P)), [r || 0, i, s]
          }

          function f(e, t) {
            var r, a;
            return a = (t || "0").toString().toLowerCase().replace(/[%A-z]+$/, function(e) {
              return r = e, ""
            }), r || (r = x.Values.getUnitType(e)), [a, r]
          }

          function d() {
            var e = {
                myParent: n.parentNode || r.body,
                position: x.getPropertyValue(n, "position"),
                fontSize: x.getPropertyValue(n, "fontSize")
              },
              a = e.position === N.lastPosition && e.myParent === N.lastParent,
              o = e.fontSize === N.lastFontSize;
            N.lastParent = e.myParent, N.lastPosition = e.position, N.lastFontSize = e.fontSize;
            var s = 100,
              l = {};
            if (o && a) l.emToPx = N.lastEmToPx, l.percentToPxWidth = N.lastPercentToPxWidth, l.percentToPxHeight = N.lastPercentToPxHeight;
            else {
              var u = i(n).isSVG ? r.createElementNS("http://www.w3.org/2000/svg", "rect") : r.createElement("div");
              v.init(u), e.myParent.appendChild(u), $.each(["overflow", "overflowX", "overflowY"], function(e, t) {
                v.CSS.setPropertyValue(u, t, "hidden")
              }), v.CSS.setPropertyValue(u, "position", e.position), v.CSS.setPropertyValue(u, "fontSize", e.fontSize), v.CSS.setPropertyValue(u, "boxSizing", "content-box"), $.each(["minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height"], function(e, t) {
                v.CSS.setPropertyValue(u, t, s + "%")
              }), v.CSS.setPropertyValue(u, "paddingLeft", s + "em"), l.percentToPxWidth = N.lastPercentToPxWidth = (parseFloat(x.getPropertyValue(u, "width", null, !0)) || 1) / s, l.percentToPxHeight = N.lastPercentToPxHeight = (parseFloat(x.getPropertyValue(u, "height", null, !0)) || 1) / s, l.emToPx = N.lastEmToPx = (parseFloat(x.getPropertyValue(u, "paddingLeft")) || 1) / s, e.myParent.removeChild(u)
            }
            return null === N.remToPx && (N.remToPx = parseFloat(x.getPropertyValue(r.body, "fontSize")) || 16), null === N.vwToPx && (N.vwToPx = parseFloat(t.innerWidth) / 100, N.vhToPx = parseFloat(t.innerHeight) / 100), l.remToPx = N.remToPx, l.vwToPx = N.vwToPx, l.vhToPx = N.vhToPx, v.debug >= 1 && console.log("Unit ratios: " + JSON.stringify(l), n), l
          }

          if (o.begin && 0 === w) try {
            o.begin.call(m, m)
          } catch (y) {
            setTimeout(function() {
              throw y
            }, 1)
          }
          if ("scroll" === k) {
            var S = /^x$/i.test(o.axis) ? "Left" : "Top",
              V = parseFloat(o.offset) || 0,
              C, A, F;
            o.container ? g.isWrapped(o.container) || g.isNode(o.container) ? (o.container = o.container[0] || o.container, C = o.container["scroll" + S], F = C + $(n).position()[S.toLowerCase()] + V) : o.container = null : (C = v.State.scrollAnchor[v.State["scrollProperty" + S]], A = v.State.scrollAnchor[v.State["scrollProperty" + ("Left" === S ? "Top" : "Left")]], F = $(n).offset()[S.toLowerCase()] + V), s = {
              scroll: {
                rootPropertyValue: !1,
                startValue: C,
                currentValue: C,
                endValue: F,
                unitType: "",
                easing: o.easing,
                scrollData: {
                  container: o.container,
                  direction: S,
                  alternateValue: A
                }
              },
              element: n
            }, v.debug && console.log("tweensContainer (scroll): ", s.scroll, n)
          } else if ("reverse" === k) {
            if (!i(n).tweensContainer) return void $.dequeue(n, o.queue);
            "none" === i(n).opts.display && (i(n).opts.display = "auto"), "hidden" === i(n).opts.visibility && (i(n).opts.visibility = "visible"), i(n).opts.loop = !1, i(n).opts.begin = null, i(n).opts.complete = null, b.easing || delete o.easing, b.duration || delete o.duration, o = $.extend({}, i(n).opts, o);
            var E = $.extend(!0, {}, i(n).tweensContainer);
            for (var j in E)
              if ("element" !== j) {
                var H = E[j].startValue;
                E[j].startValue = E[j].currentValue = E[j].endValue, E[j].endValue = H, g.isEmptyObject(b) || (E[j].easing = o.easing), v.debug && console.log("reverse tweensContainer (" + j + "): " + JSON.stringify(E[j]), n)
              }
            s = E
          } else if ("start" === k) {
            var E;
            i(n).tweensContainer && i(n).isAnimating === !0 && (E = i(n).tweensContainer), $.each(h, function(e, t) {
              if (RegExp("^" + x.Lists.colors.join("$|^") + "$").test(e)) {
                var r = p(t, !0),
                  n = r[0],
                  o = r[1],
                  i = r[2];
                if (x.RegEx.isHex.test(n)) {
                  for (var s = ["Red", "Green", "Blue"], l = x.Values.hexToRgb(n), u = i ? x.Values.hexToRgb(i) : a, c = 0; c < s.length; c++) {
                    var f = [l[c]];
                    o && f.push(o), u !== a && f.push(u[c]), h[e + s[c]] = f
                  }
                  delete h[e]
                }
              }
            });
            for (var R in h) {
              var O = p(h[R]),
                z = O[0],
                q = O[1],
                M = O[2];
              R = x.Names.camelCase(R);
              var I = x.Hooks.getRoot(R),
                B = !1;
              if (i(n).isSVG || "tween" === I || x.Names.prefixCheck(I)[1] !== !1 || x.Normalizations.registered[I] !== a) {
                (o.display !== a && null !== o.display && "none" !== o.display || o.visibility !== a && "hidden" !== o.visibility) && /opacity|filter/.test(R) && !M && 0 !== z && (M = 0), o._cacheValues && E && E[R] ? (M === a && (M = E[R].endValue + E[R].unitType), B = i(n).rootPropertyValueCache[I]) : x.Hooks.registered[R] ? M === a ? (B = x.getPropertyValue(n, I), M = x.getPropertyValue(n, R, B)) : B = x.Hooks.templates[I][1] : M === a && (M = x.getPropertyValue(n, R));
                var W, G, D, X = !1;
                if (W = f(R, M), M = W[0], D = W[1], W = f(R, z), z = W[0].replace(/^([+-\/*])=/, function(e, t) {
                    return X = t, ""
                  }), G = W[1], M = parseFloat(M) || 0, z = parseFloat(z) || 0, "%" === G && (/^(fontSize|lineHeight)$/.test(R) ? (z /= 100, G = "em") : /^scale/.test(R) ? (z /= 100, G = "") : /(Red|Green|Blue)$/i.test(R) && (z = z / 100 * 255, G = "")), /[\/*]/.test(X)) G = D;
                else if (D !== G && 0 !== M)
                  if (0 === z) G = D;
                  else {
                    l = l || d();
                    var Y = /margin|padding|left|right|width|text|word|letter/i.test(R) || /X$/.test(R) || "x" === R ? "x" : "y";
                    switch (D) {
                      case "%":
                        M *= "x" === Y ? l.percentToPxWidth : l.percentToPxHeight;
                        break;
                      case "px":
                        break;
                      default:
                        M *= l[D + "ToPx"]
                    }
                    switch (G) {
                      case "%":
                        M *= 1 / ("x" === Y ? l.percentToPxWidth : l.percentToPxHeight);
                        break;
                      case "px":
                        break;
                      default:
                        M *= 1 / l[G + "ToPx"]
                    }
                  }
                switch (X) {
                  case "+":
                    z = M + z;
                    break;
                  case "-":
                    z = M - z;
                    break;
                  case "*":
                    z = M * z;
                    break;
                  case "/":
                    z = M / z
                }
                s[R] = {
                  rootPropertyValue: B,
                  startValue: M,
                  currentValue: M,
                  endValue: z,
                  unitType: G,
                  easing: q
                }, v.debug && console.log("tweensContainer (" + R + "): " + JSON.stringify(s[R]), n)
              } else v.debug && console.log("Skipping [" + I + "] due to a lack of browser support.")
            }
            s.element = n
          }
          s.element && (x.Values.addClass(n, "velocity-animating"), L.push(s), "" === o.queue && (i(n).tweensContainer = s, i(n).opts = o), i(n).isAnimating = !0, w === P - 1 ? (v.State.calls.push([L, m, o, null, T.resolver]), v.State.isTicking === !1 && (v.State.isTicking = !0, c())) : w++)
        }

        var n = this,
          o = $.extend({}, v.defaults, b),
          s = {},
          l;
        switch (i(n) === a && v.init(n), parseFloat(o.delay) && o.queue !== !1 && $.queue(n, o.queue, function(e) {
          v.velocityQueueEntryFlag = !0, i(n).delayTimer = {
            setTimeout: setTimeout(e, parseFloat(o.delay)),
            next: e
          }
        }), o.duration.toString().toLowerCase()) {
          case "fast":
            o.duration = 200;
            break;
          case "normal":
            o.duration = y;
            break;
          case "slow":
            o.duration = 600;
            break;
          default:
            o.duration = parseFloat(o.duration) || 1
        }
        v.mock !== !1 && (v.mock === !0 ? o.duration = o.delay = 1 : (o.duration *= parseFloat(v.mock) || 1, o.delay *= parseFloat(v.mock) || 1)), o.easing = u(o.easing, o.duration), o.begin && !g.isFunction(o.begin) && (o.begin = null), o.progress && !g.isFunction(o.progress) && (o.progress = null), o.complete && !g.isFunction(o.complete) && (o.complete = null), o.display !== a && null !== o.display && (o.display = o.display.toString().toLowerCase(), "auto" === o.display && (o.display = v.CSS.Values.getDisplayType(n))), o.visibility !== a && null !== o.visibility && (o.visibility = o.visibility.toString().toLowerCase()), o.mobileHA = o.mobileHA && v.State.isMobile && !v.State.isGingerbread, o.queue === !1 ? o.delay ? setTimeout(e, o.delay) : e() : $.queue(n, o.queue, function(t, r) {
          return r === !0 ? (T.promise && T.resolver(m), !0) : (v.velocityQueueEntryFlag = !0, void e(t))
        }), "" !== o.queue && "fx" !== o.queue || "inprogress" === $.queue(n)[0] || $.dequeue(n)
      }

      var s = arguments[0] && (arguments[0].p || $.isPlainObject(arguments[0].properties) && !arguments[0].properties.names || g.isString(arguments[0].properties)),
        l, f, d, m, h, b;
      if (g.isWrapped(this) ? (l = !1, d = 0, m = this, f = this) : (l = !0, d = 1, m = s ? arguments[0].elements || arguments[0].e : arguments[0]), m = o(m)) {
        s ? (h = arguments[0].properties || arguments[0].p, b = arguments[0].options || arguments[0].o) : (h = arguments[d], b = arguments[d + 1]);
        var P = m.length,
          w = 0;
        if (!/^(stop|finish)$/i.test(h) && !$.isPlainObject(b)) {
          var V = d + 1;
          b = {};
          for (var C = V; C < arguments.length; C++) g.isArray(arguments[C]) || !/^(fast|normal|slow)$/i.test(arguments[C]) && !/^\d/.test(arguments[C]) ? g.isString(arguments[C]) || g.isArray(arguments[C]) ? b.easing = arguments[C] : g.isFunction(arguments[C]) && (b.complete = arguments[C]) : b.duration = arguments[C]
        }
        var T = {
          promise: null,
          resolver: null,
          rejecter: null
        };
        l && v.Promise && (T.promise = new v.Promise(function(e, t) {
          T.resolver = e, T.rejecter = t
        }));
        var k;
        switch (h) {
          case "scroll":
            k = "scroll";
            break;
          case "reverse":
            k = "reverse";
            break;
          case "finish":
          case "stop":
            $.each(m, function(e, t) {
              i(t) && i(t).delayTimer && (clearTimeout(i(t).delayTimer.setTimeout), i(t).delayTimer.next && i(t).delayTimer.next(), delete i(t).delayTimer)
            });
            var A = [];
            return $.each(v.State.calls, function(e, t) {
              t && $.each(t[1], function(r, n) {
                var o = b === a ? "" : b;
                return o === !0 || t[2].queue === o || b === a && t[2].queue === !1 ? void $.each(m, function(r, a) {
                  a === n && ((b === !0 || g.isString(b)) && ($.each($.queue(a, g.isString(b) ? b : ""), function(e, t) {
                    g.isFunction(t) && t(null, !0)
                  }), $.queue(a, g.isString(b) ? b : "", [])), "stop" === h ? (i(a) && i(a).tweensContainer && o !== !1 && $.each(i(a).tweensContainer, function(e, t) {
                    t.endValue = t.currentValue
                  }), A.push(e)) : "finish" === h && (t[2].duration = 1))
                }) : !0
              })
            }), "stop" === h && ($.each(A, function(e, t) {
              p(t, !0)
            }), T.promise && T.resolver(m)), e();
          default:
            if (!$.isPlainObject(h) || g.isEmptyObject(h)) {
              if (g.isString(h) && v.Redirects[h]) {
                var F = $.extend({}, b),
                  E = F.duration,
                  j = F.delay || 0;
                return F.backwards === !0 && (m = $.extend(!0, [], m).reverse()), $.each(m, function(e, t) {
                  parseFloat(F.stagger) ? F.delay = j + parseFloat(F.stagger) * e : g.isFunction(F.stagger) && (F.delay = j + F.stagger.call(t, e, P)), F.drag && (F.duration = parseFloat(E) || (/^(callout|transition)/.test(h) ? 1e3 : y), F.duration = Math.max(F.duration * (F.backwards ? 1 - e / P : (e + 1) / P), .75 * F.duration, 200)), v.Redirects[h].call(t, t, F || {}, e, P, m, T.promise ? T : a)
                }), e()
              }
              var H = "Velocity: First argument (" + h + ") was not a property map, a known action, or a registered redirect. Aborting.";
              return T.promise ? T.rejecter(new Error(H)) : console.log(H), e()
            }
            k = "start"
        }
        var N = {
            lastParent: null,
            lastPosition: null,
            lastFontSize: null,
            lastPercentToPxWidth: null,
            lastPercentToPxHeight: null,
            lastEmToPx: null,
            remToPx: null,
            vwToPx: null,
            vhToPx: null
          },
          L = [];
        $.each(m, function(e, t) {
          g.isNode(t) && n.call(t)
        });
        var F = $.extend({}, v.defaults, b),
          R;
        if (F.loop = parseInt(F.loop), R = 2 * F.loop - 1, F.loop)
          for (var O = 0; R > O; O++) {
            var z = {
              delay: F.delay,
              progress: F.progress
            };
            O === R - 1 && (z.display = F.display, z.visibility = F.visibility, z.complete = F.complete), S(m, "reverse", z)
          }
        return e()
      }
    };
    v = $.extend(S, v), v.animate = S;
    var P = t.requestAnimationFrame || d;
    return v.State.isMobile || r.hidden === a || r.addEventListener("visibilitychange", function() {
      r.hidden ? (P = function(e) {
        return setTimeout(function() {
          e(!0)
        }, 16)
      }, c()) : P = t.requestAnimationFrame || d
    }), e.Velocity = v, e !== t && (e.fn.velocity = S, e.fn.velocity.defaults = v.defaults), $.each(["Down", "Up"], function(e, t) {
      v.Redirects["slide" + t] = function(e, r, n, o, i, s) {
        var l = $.extend({}, r),
          u = l.begin,
          c = l.complete,
          p = {
            height: "",
            marginTop: "",
            marginBottom: "",
            paddingTop: "",
            paddingBottom: ""
          },
          f = {};
        l.display === a && (l.display = "Down" === t ? "inline" === v.CSS.Values.getDisplayType(e) ? "inline-block" : "block" : "none"), l.begin = function() {
          u && u.call(i, i);
          for (var r in p) {
            f[r] = e.style[r];
            var a = v.CSS.getPropertyValue(e, r);
            p[r] = "Down" === t ? [a, 0] : [0, a]
          }
          f.overflow = e.style.overflow, e.style.overflow = "hidden"
        }, l.complete = function() {
          for (var t in f) e.style[t] = f[t];
          c && c.call(i, i), s && s.resolver(i)
        }, v(e, p, l)
      }
    }), $.each(["In", "Out"], function(e, t) {
      v.Redirects["fade" + t] = function(e, r, n, o, i, s) {
        var l = $.extend({}, r),
          u = {
            opacity: "In" === t ? 1 : 0
          },
          c = l.complete;
        l.complete = n !== o - 1 ? l.begin = null : function() {
          c && c.call(i, i), s && s.resolver(i)
        }, l.display === a && (l.display = "In" === t ? "auto" : "none"), v(this, u, l)
      }
    }), v
  }(window.jQuery || window.Zepto || window, window, document)
});
/*! RESOURCE: /scripts/thirdparty/velocity/velocity.ui.js */
;
(function(factory) {
  if (typeof require === "function" && typeof exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(["velocity"], factory);
  } else {
    factory();
  }
}(function() {
  return function(global, window, document, undefined) {
    if (!global.Velocity || !global.Velocity.Utilities) {
      window.console && console.log("Velocity UI Pack: Velocity must be loaded first. Aborting.");
      return;
    } else {
      var Velocity = global.Velocity,
        $ = Velocity.Utilities;
    }
    var velocityVersion = Velocity.version,
      requiredVersion = {
        major: 1,
        minor: 1,
        patch: 0
      };

    function greaterSemver(primary, secondary) {
      var versionInts = [];
      if (!primary || !secondary) {
        return false;
      }
      $.each([primary, secondary], function(i, versionObject) {
        var versionIntsComponents = [];
        $.each(versionObject, function(component, value) {
          while (value.toString().length < 5) {
            value = "0" + value;
          }
          versionIntsComponents.push(value);
        });
        versionInts.push(versionIntsComponents.join(""))
      });
      return (parseFloat(versionInts[0]) > parseFloat(versionInts[1]));
    }
    if (greaterSemver(requiredVersion, velocityVersion)) {
      var abortError = "Velocity UI Pack: You need to update Velocity (jquery.velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";
      alert(abortError);
      throw new Error(abortError);
    }
    Velocity.RegisterEffect = Velocity.RegisterUI = function(effectName, properties) {
      function animateParentHeight(elements, direction, totalDuration, stagger) {
        var totalHeightDelta = 0,
          parentNode;
        $.each(elements.nodeType ? [elements] : elements, function(i, element) {
          if (stagger) {
            totalDuration += i * stagger;
          }
          parentNode = element.parentNode;
          $.each(["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function(i, property) {
            totalHeightDelta += parseFloat(Velocity.CSS.getPropertyValue(element, property));
          });
        });
        Velocity.animate(
          parentNode, {
            height: (direction === "In" ? "+" : "-") + "=" + totalHeightDelta
          }, {
            queue: false,
            easing: "ease-in-out",
            duration: totalDuration * (direction === "In" ? 0.6 : 1)
          }
        );
      }
      Velocity.Redirects[effectName] = function(element, redirectOptions, elementsIndex, elementsSize, elements, promiseData) {
        var finalElement = (elementsIndex === elementsSize - 1);
        if (typeof properties.defaultDuration === "function") {
          properties.defaultDuration = properties.defaultDuration.call(elements, elements);
        } else {
          properties.defaultDuration = parseFloat(properties.defaultDuration);
        }
        for (var callIndex = 0; callIndex < properties.calls.length; callIndex++) {
          var call = properties.calls[callIndex],
            propertyMap = call[0],
            redirectDuration = (redirectOptions.duration || properties.defaultDuration || 1000),
            durationPercentage = call[1],
            callOptions = call[2] || {},
            opts = {};
          opts.duration = redirectDuration * (durationPercentage || 1);
          opts.queue = redirectOptions.queue || "";
          opts.easing = callOptions.easing || "ease";
          opts.delay = parseFloat(callOptions.delay) || 0;
          opts._cacheValues = callOptions._cacheValues || true;
          if (callIndex === 0) {
            opts.delay += (parseFloat(redirectOptions.delay) || 0);
            if (elementsIndex === 0) {
              opts.begin = function() {
                redirectOptions.begin && redirectOptions.begin.call(elements, elements);
                var direction = effectName.match(/(In|Out)$/);
                if ((direction && direction[0] === "In") && propertyMap.opacity !== undefined) {
                  $.each(elements.nodeType ? [elements] : elements, function(i, element) {
                    Velocity.CSS.setPropertyValue(element, "opacity", 0);
                  });
                }
                if (redirectOptions.animateParentHeight && direction) {
                  animateParentHeight(elements, direction[0], redirectDuration + opts.delay, redirectOptions.stagger);
                }
              }
            }
            if (redirectOptions.display !== null) {
              if (redirectOptions.display !== undefined && redirectOptions.display !== "none") {
                opts.display = redirectOptions.display;
              } else if (/In$/.test(effectName)) {
                var defaultDisplay = Velocity.CSS.Values.getDisplayType(element);
                opts.display = (defaultDisplay === "inline") ? "inline-block" : defaultDisplay;
              }
            }
            if (redirectOptions.visibility && redirectOptions.visibility !== "hidden") {
              opts.visibility = redirectOptions.visibility;
            }
          }
          if (callIndex === properties.calls.length - 1) {
            function injectFinalCallbacks() {
              if ((redirectOptions.display === undefined || redirectOptions.display === "none") && /Out$/.test(effectName)) {
                $.each(elements.nodeType ? [elements] : elements, function(i, element) {
                  Velocity.CSS.setPropertyValue(element, "display", "none");
                });
              }
              redirectOptions.complete && redirectOptions.complete.call(elements, elements);
              if (promiseData) {
                promiseData.resolver(elements || element);
              }
            }
            opts.complete = function() {
              if (properties.reset) {
                for (var resetProperty in properties.reset) {
                  var resetValue = properties.reset[resetProperty];
                  if (Velocity.CSS.Hooks.registered[resetProperty] === undefined && (typeof resetValue === "string" || typeof resetValue === "number")) {
                    properties.reset[resetProperty] = [properties.reset[resetProperty], properties.reset[resetProperty]];
                  }
                }
                var resetOptions = {
                  duration: 0,
                  queue: false
                };
                if (finalElement) {
                  resetOptions.complete = injectFinalCallbacks;
                }
                Velocity.animate(element, properties.reset, resetOptions);
              } else if (finalElement) {
                injectFinalCallbacks();
              }
            };
            if (redirectOptions.visibility === "hidden") {
              opts.visibility = redirectOptions.visibility;
            }
          }
          Velocity.animate(element, propertyMap, opts);
        }
      };
      return Velocity;
    };
    Velocity.RegisterEffect.packagedEffects = {
      "callout.bounce": {
        defaultDuration: 550,
        calls: [
          [{
            translateY: -30
          }, 0.25],
          [{
            translateY: 0
          }, 0.125],
          [{
            translateY: -15
          }, 0.125],
          [{
            translateY: 0
          }, 0.25]
        ]
      },
      "callout.shake": {
        defaultDuration: 800,
        calls: [
          [{
            translateX: -11
          }, 0.125],
          [{
            translateX: 11
          }, 0.125],
          [{
            translateX: -11
          }, 0.125],
          [{
            translateX: 11
          }, 0.125],
          [{
            translateX: -11
          }, 0.125],
          [{
            translateX: 11
          }, 0.125],
          [{
            translateX: -11
          }, 0.125],
          [{
            translateX: 0
          }, 0.125]
        ]
      },
      "callout.flash": {
        defaultDuration: 1100,
        calls: [
          [{
            opacity: [0, "easeInOutQuad", 1]
          }, 0.25],
          [{
            opacity: [1, "easeInOutQuad"]
          }, 0.25],
          [{
            opacity: [0, "easeInOutQuad"]
          }, 0.25],
          [{
            opacity: [1, "easeInOutQuad"]
          }, 0.25]
        ]
      },
      "callout.pulse": {
        defaultDuration: 825,
        calls: [
          [{
            scaleX: 1.1,
            scaleY: 1.1
          }, 0.50, {
            easing: "easeInExpo"
          }],
          [{
            scaleX: 1,
            scaleY: 1
          }, 0.50]
        ]
      },
      "callout.swing": {
        defaultDuration: 950,
        calls: [
          [{
            rotateZ: 15
          }, 0.20],
          [{
            rotateZ: -10
          }, 0.20],
          [{
            rotateZ: 5
          }, 0.20],
          [{
            rotateZ: -5
          }, 0.20],
          [{
            rotateZ: 0
          }, 0.20]
        ]
      },
      "callout.tada": {
        defaultDuration: 1000,
        calls: [
          [{
            scaleX: 0.9,
            scaleY: 0.9,
            rotateZ: -3
          }, 0.10],
          [{
            scaleX: 1.1,
            scaleY: 1.1,
            rotateZ: 3
          }, 0.10],
          [{
            scaleX: 1.1,
            scaleY: 1.1,
            rotateZ: -3
          }, 0.10],
          ["reverse", 0.125],
          ["reverse", 0.125],
          ["reverse", 0.125],
          ["reverse", 0.125],
          ["reverse", 0.125],
          [{
            scaleX: 1,
            scaleY: 1,
            rotateZ: 0
          }, 0.20]
        ]
      },
      "transition.fadeIn": {
        defaultDuration: 500,
        calls: [
          [{
            opacity: [1, 0]
          }]
        ]
      },
      "transition.fadeOut": {
        defaultDuration: 500,
        calls: [
          [{
            opacity: [0, 1]
          }]
        ]
      },
      "transition.flipXIn": {
        defaultDuration: 700,
        calls: [
          [{
            opacity: [1, 0],
            transformPerspective: [800, 800],
            rotateY: [0, -55]
          }]
        ],
        reset: {
          transformPerspective: 0
        }
      },
      "transition.flipXOut": {
        defaultDuration: 700,
        calls: [
          [{
            opacity: [0, 1],
            transformPerspective: [800, 800],
            rotateY: 55
          }]
        ],
        reset: {
          transformPerspective: 0,
          rotateY: 0
        }
      },
      "transition.flipYIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0],
            transformPerspective: [800, 800],
            rotateX: [0, -45]
          }]
        ],
        reset: {
          transformPerspective: 0
        }
      },
      "transition.flipYOut": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [0, 1],
            transformPerspective: [800, 800],
            rotateX: 25
          }]
        ],
        reset: {
          transformPerspective: 0,
          rotateX: 0
        }
      },
      "transition.flipBounceXIn": {
        defaultDuration: 900,
        calls: [
          [{
            opacity: [0.725, 0],
            transformPerspective: [400, 400],
            rotateY: [-10, 90]
          }, 0.50],
          [{
            opacity: 0.80,
            rotateY: 10
          }, 0.25],
          [{
            opacity: 1,
            rotateY: 0
          }, 0.25]
        ],
        reset: {
          transformPerspective: 0
        }
      },
      "transition.flipBounceXOut": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [0.9, 1],
            transformPerspective: [400, 400],
            rotateY: -10
          }, 0.50],
          [{
            opacity: 0,
            rotateY: 90
          }, 0.50]
        ],
        reset: {
          transformPerspective: 0,
          rotateY: 0
        }
      },
      "transition.flipBounceYIn": {
        defaultDuration: 850,
        calls: [
          [{
            opacity: [0.725, 0],
            transformPerspective: [400, 400],
            rotateX: [-10, 90]
          }, 0.50],
          [{
            opacity: 0.80,
            rotateX: 10
          }, 0.25],
          [{
            opacity: 1,
            rotateX: 0
          }, 0.25]
        ],
        reset: {
          transformPerspective: 0
        }
      },
      "transition.flipBounceYOut": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [0.9, 1],
            transformPerspective: [400, 400],
            rotateX: -15
          }, 0.50],
          [{
            opacity: 0,
            rotateX: 90
          }, 0.50]
        ],
        reset: {
          transformPerspective: 0,
          rotateX: 0
        }
      },
      "transition.swoopIn": {
        defaultDuration: 850,
        calls: [
          [{
            opacity: [1, 0],
            transformOriginX: ["100%", "50%"],
            transformOriginY: ["100%", "100%"],
            scaleX: [1, 0],
            scaleY: [1, 0],
            translateX: [0, -700],
            translateZ: 0
          }]
        ],
        reset: {
          transformOriginX: "50%",
          transformOriginY: "50%"
        }
      },
      "transition.swoopOut": {
        defaultDuration: 850,
        calls: [
          [{
            opacity: [0, 1],
            transformOriginX: ["50%", "100%"],
            transformOriginY: ["100%", "100%"],
            scaleX: 0,
            scaleY: 0,
            translateX: -700,
            translateZ: 0
          }]
        ],
        reset: {
          transformOriginX: "50%",
          transformOriginY: "50%",
          scaleX: 1,
          scaleY: 1,
          translateX: 0
        }
      },
      "transition.whirlIn": {
        defaultDuration: 850,
        calls: [
          [{
            opacity: [1, 0],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: [1, 0],
            scaleY: [1, 0],
            rotateY: [0, 160]
          }, 1, {
            easing: "easeInOutSine"
          }]
        ]
      },
      "transition.whirlOut": {
        defaultDuration: 750,
        calls: [
          [{
            opacity: [0, "easeInOutQuint", 1],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: 0,
            scaleY: 0,
            rotateY: 160
          }, 1, {
            easing: "swing"
          }]
        ],
        reset: {
          scaleX: 1,
          scaleY: 1,
          rotateY: 0
        }
      },
      "transition.shrinkIn": {
        defaultDuration: 750,
        calls: [
          [{
            opacity: [1, 0],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: [1, 1.5],
            scaleY: [1, 1.5],
            translateZ: 0
          }]
        ]
      },
      "transition.shrinkOut": {
        defaultDuration: 600,
        calls: [
          [{
            opacity: [0, 1],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: 1.3,
            scaleY: 1.3,
            translateZ: 0
          }]
        ],
        reset: {
          scaleX: 1,
          scaleY: 1
        }
      },
      "transition.expandIn": {
        defaultDuration: 700,
        calls: [
          [{
            opacity: [1, 0],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: [1, 0.625],
            scaleY: [1, 0.625],
            translateZ: 0
          }]
        ]
      },
      "transition.expandOut": {
        defaultDuration: 700,
        calls: [
          [{
            opacity: [0, 1],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: 0.5,
            scaleY: 0.5,
            translateZ: 0
          }]
        ],
        reset: {
          scaleX: 1,
          scaleY: 1
        }
      },
      "transition.bounceIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0],
            scaleX: [1.05, 0.3],
            scaleY: [1.05, 0.3]
          }, 0.40],
          [{
            scaleX: 0.9,
            scaleY: 0.9,
            translateZ: 0
          }, 0.20],
          [{
            scaleX: 1,
            scaleY: 1
          }, 0.50]
        ]
      },
      "transition.bounceOut": {
        defaultDuration: 800,
        calls: [
          [{
            scaleX: 0.95,
            scaleY: 0.95
          }, 0.35],
          [{
            scaleX: 1.1,
            scaleY: 1.1,
            translateZ: 0
          }, 0.35],
          [{
            opacity: [0, 1],
            scaleX: 0.3,
            scaleY: 0.3
          }, 0.30]
        ],
        reset: {
          scaleX: 1,
          scaleY: 1
        }
      },
      "transition.bounceUpIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0],
            translateY: [-30, 1000]
          }, 0.60, {
            easing: "easeOutCirc"
          }],
          [{
            translateY: 10
          }, 0.20],
          [{
            translateY: 0
          }, 0.20]
        ]
      },
      "transition.bounceUpOut": {
        defaultDuration: 1000,
        calls: [
          [{
            translateY: 20
          }, 0.20],
          [{
            opacity: [0, "easeInCirc", 1],
            translateY: -1000
          }, 0.80]
        ],
        reset: {
          translateY: 0
        }
      },
      "transition.bounceDownIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0],
            translateY: [30, -1000]
          }, 0.60, {
            easing: "easeOutCirc"
          }],
          [{
            translateY: -10
          }, 0.20],
          [{
            translateY: 0
          }, 0.20]
        ]
      },
      "transition.bounceDownOut": {
        defaultDuration: 1000,
        calls: [
          [{
            translateY: -20
          }, 0.20],
          [{
            opacity: [0, "easeInCirc", 1],
            translateY: 1000
          }, 0.80]
        ],
        reset: {
          translateY: 0
        }
      },
      "transition.bounceLeftIn": {
        defaultDuration: 750,
        calls: [
          [{
            opacity: [1, 0],
            translateX: [30, -1250]
          }, 0.60, {
            easing: "easeOutCirc"
          }],
          [{
            translateX: -10
          }, 0.20],
          [{
            translateX: 0
          }, 0.20]
        ]
      },
      "transition.bounceLeftOut": {
        defaultDuration: 750,
        calls: [
          [{
            translateX: 30
          }, 0.20],
          [{
            opacity: [0, "easeInCirc", 1],
            translateX: -1250
          }, 0.80]
        ],
        reset: {
          translateX: 0
        }
      },
      "transition.bounceRightIn": {
        defaultDuration: 750,
        calls: [
          [{
            opacity: [1, 0],
            translateX: [-30, 1250]
          }, 0.60, {
            easing: "easeOutCirc"
          }],
          [{
            translateX: 10
          }, 0.20],
          [{
            translateX: 0
          }, 0.20]
        ]
      },
      "transition.bounceRightOut": {
        defaultDuration: 750,
        calls: [
          [{
            translateX: -30
          }, 0.20],
          [{
            opacity: [0, "easeInCirc", 1],
            translateX: 1250
          }, 0.80]
        ],
        reset: {
          translateX: 0
        }
      },
      "transition.slideUpIn": {
        defaultDuration: 900,
        calls: [
          [{
            opacity: [1, 0],
            translateY: [0, 20],
            translateZ: 0
          }]
        ]
      },
      "transition.slideUpOut": {
        defaultDuration: 900,
        calls: [
          [{
            opacity: [0, 1],
            translateY: -20,
            translateZ: 0
          }]
        ],
        reset: {
          translateY: 0
        }
      },
      "transition.slideDownIn": {
        defaultDuration: 900,
        calls: [
          [{
            opacity: [1, 0],
            translateY: [0, -20],
            translateZ: 0
          }]
        ]
      },
      "transition.slideDownOut": {
        defaultDuration: 900,
        calls: [
          [{
            opacity: [0, 1],
            translateY: 20,
            translateZ: 0
          }]
        ],
        reset: {
          translateY: 0
        }
      },
      "transition.slideLeftIn": {
        defaultDuration: 1000,
        calls: [
          [{
            opacity: [1, 0],
            translateX: [0, -20],
            translateZ: 0
          }]
        ]
      },
      "transition.slideLeftOut": {
        defaultDuration: 1050,
        calls: [
          [{
            opacity: [0, 1],
            translateX: -20,
            translateZ: 0
          }]
        ],
        reset: {
          translateX: 0
        }
      },
      "transition.slideRightIn": {
        defaultDuration: 1000,
        calls: [
          [{
            opacity: [1, 0],
            translateX: [0, 20],
            translateZ: 0
          }]
        ]
      },
      "transition.slideRightOut": {
        defaultDuration: 1050,
        calls: [
          [{
            opacity: [0, 1],
            translateX: 20,
            translateZ: 0
          }]
        ],
        reset: {
          translateX: 0
        }
      },
      "transition.slideUpBigIn": {
        defaultDuration: 850,
        calls: [
          [{
            opacity: [1, 0],
            translateY: [0, 75],
            translateZ: 0
          }]
        ]
      },
      "transition.slideUpBigOut": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [0, 1],
            translateY: -75,
            translateZ: 0
          }]
        ],
        reset: {
          translateY: 0
        }
      },
      "transition.slideDownBigIn": {
        defaultDuration: 850,
        calls: [
          [{
            opacity: [1, 0],
            translateY: [0, -75],
            translateZ: 0
          }]
        ]
      },
      "transition.slideDownBigOut": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [0, 1],
            translateY: 75,
            translateZ: 0
          }]
        ],
        reset: {
          translateY: 0
        }
      },
      "transition.slideLeftBigIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0],
            translateX: [0, -75],
            translateZ: 0
          }]
        ]
      },
      "transition.slideLeftBigOut": {
        defaultDuration: 750,
        calls: [
          [{
            opacity: [0, 1],
            translateX: -75,
            translateZ: 0
          }]
        ],
        reset: {
          translateX: 0
        }
      },
      "transition.slideRightBigIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0],
            translateX: [0, 75],
            translateZ: 0
          }]
        ]
      },
      "transition.slideRightBigOut": {
        defaultDuration: 750,
        calls: [
          [{
            opacity: [0, 1],
            translateX: 75,
            translateZ: 0
          }]
        ],
        reset: {
          translateX: 0
        }
      },
      "transition.perspectiveUpIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0],
            transformPerspective: [800, 800],
            transformOriginX: [0, 0],
            transformOriginY: ["100%", "100%"],
            rotateX: [0, -180]
          }]
        ],
        reset: {
          transformPerspective: 0,
          transformOriginX: "50%",
          transformOriginY: "50%"
        }
      },
      "transition.perspectiveUpOut": {
        defaultDuration: 850,
        calls: [
          [{
            opacity: [0, 1],
            transformPerspective: [800, 800],
            transformOriginX: [0, 0],
            transformOriginY: ["100%", "100%"],
            rotateX: -180
          }]
        ],
        reset: {
          transformPerspective: 0,
          transformOriginX: "50%",
          transformOriginY: "50%",
          rotateX: 0
        }
      },
      "transition.perspectiveDownIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0],
            transformPerspective: [800, 800],
            transformOriginX: [0, 0],
            transformOriginY: [0, 0],
            rotateX: [0, 180]
          }]
        ],
        reset: {
          transformPerspective: 0,
          transformOriginX: "50%",
          transformOriginY: "50%"
        }
      },
      "transition.perspectiveDownOut": {
        defaultDuration: 850,
        calls: [
          [{
            opacity: [0, 1],
            transformPerspective: [800, 800],
            transformOriginX: [0, 0],
            transformOriginY: [0, 0],
            rotateX: 180
          }]
        ],
        reset: {
          transformPerspective: 0,
          transformOriginX: "50%",
          transformOriginY: "50%",
          rotateX: 0
        }
      },
      "transition.perspectiveLeftIn": {
        defaultDuration: 950,
        calls: [
          [{
            opacity: [1, 0],
            transformPerspective: [2000, 2000],
            transformOriginX: [0, 0],
            transformOriginY: [0, 0],
            rotateY: [0, -180]
          }]
        ],
        reset: {
          transformPerspective: 0,
          transformOriginX: "50%",
          transformOriginY: "50%"
        }
      },
      "transition.perspectiveLeftOut": {
        defaultDuration: 950,
        calls: [
          [{
            opacity: [0, 1],
            transformPerspective: [2000, 2000],
            transformOriginX: [0, 0],
            transformOriginY: [0, 0],
            rotateY: -180
          }]
        ],
        reset: {
          transformPerspective: 0,
          transformOriginX: "50%",
          transformOriginY: "50%",
          rotateY: 0
        }
      },
      "transition.perspectiveRightIn": {
        defaultDuration: 950,
        calls: [
          [{
            opacity: [1, 0],
            transformPerspective: [2000, 2000],
            transformOriginX: ["100%", "100%"],
            transformOriginY: [0, 0],
            rotateY: [0, 180]
          }]
        ],
        reset: {
          transformPerspective: 0,
          transformOriginX: "50%",
          transformOriginY: "50%"
        }
      },
      "transition.perspectiveRightOut": {
        defaultDuration: 950,
        calls: [
          [{
            opacity: [0, 1],
            transformPerspective: [2000, 2000],
            transformOriginX: ["100%", "100%"],
            transformOriginY: [0, 0],
            rotateY: 180
          }]
        ],
        reset: {
          transformPerspective: 0,
          transformOriginX: "50%",
          transformOriginY: "50%",
          rotateY: 0
        }
      },
      "snTransition.listStreamSlideIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0.5],
            translateY: [0, -225]
          }, 1.0, {
            easing: "easeOutQuart"
          }],
        ]
      },
      "snTransition.recordStreamSlideIn": {
        defaultDuration: 800,
        calls: [
          [{
            opacity: [1, 0.5],
            translateY: [0, -82]
          }, 1.0, {
            easing: "easeOutQuart"
          }],
        ]
      },
      "snTransition.slideOut": {
        defaultDuration: 600,
        calls: [
          [{
            opacity: [1, 0.5],
            translateX: [-400, 0]
          }, 1.0, {
            easing: "easeOutQuart"
          }],
        ]
      },
      "snTransition.slideIn": {
        defaultDuration: 600,
        calls: [
          [{
            opacity: [1, 1],
            translateX: [0, -400]
          }, 1.0, {
            easing: "easeOutQuart"
          }],
        ]
      },
      "snTransition.streamSlideLeft": {
        defaultDuration: 600,
        calls: [
          [{
            opacity: [1, 0.5],
            translateX: [0, 400]
          }, 1.0, {
            easing: "easeOutQuart"
          }],
        ]
      },
      "snTransition.streamSlideRight": {
        defaultDuration: 600,
        calls: [
          [{
            opacity: [1, 0.5],
            translateX: [400, 0]
          }, 1.0, {
            easing: "easeOutQuart"
          }],
        ]
      }
    };
    for (var effectName in Velocity.RegisterEffect.packagedEffects) {
      Velocity.RegisterEffect(effectName, Velocity.RegisterEffect.packagedEffects[effectName]);
    }
    Velocity.RunSequence = function(originalSequence) {
      var sequence = $.extend(true, [], originalSequence);
      if (sequence.length > 1) {
        $.each(sequence.reverse(), function(i, currentCall) {
          var nextCall = sequence[i + 1];
          if (nextCall) {
            var currentCallOptions = currentCall.o || currentCall.options,
              nextCallOptions = nextCall.o || nextCall.options;
            var timing = (currentCallOptions && currentCallOptions.sequenceQueue === false) ? "begin" : "complete",
              callbackOriginal = nextCallOptions && nextCallOptions[timing],
              options = {};
            options[timing] = function() {
              var nextCallElements = nextCall.e || nextCall.elements;
              var elements = nextCallElements.nodeType ? [nextCallElements] : nextCallElements;
              callbackOriginal && callbackOriginal.call(elements, elements);
              Velocity(currentCall);
            }
            if (nextCall.o) {
              nextCall.o = $.extend({}, nextCallOptions, options);
            } else {
              nextCall.options = $.extend({}, nextCallOptions, options);
            }
          }
        });
        sequence.reverse();
      }
      Velocity(sequence[0]);
    };
  }((window.jQuery || window.Zepto || window), window, document);
}));;;