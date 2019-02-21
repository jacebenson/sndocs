/*! RESOURCE: /scripts/js_includes_snTestRunner.js */
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
      default:
        init = INIT_AUTO;
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
/*! RESOURCE: /scripts/glide-amb-client-bundle.min.js */
! function(e, n) {
  if ("object" == typeof exports && "object" == typeof module) module.exports = n();
  else if ("function" == typeof define && define.amd) define([], n);
  else {
    var t = n();
    for (var i in t)("object" == typeof exports ? exports : e)[i] = t[i]
  }
}("undefined" != typeof self ? self : this, function() {
  return function(e) {
    var n = {};

    function t(i) {
      if (n[i]) return n[i].exports;
      var r = n[i] = {
        i: i,
        l: !1,
        exports: {}
      };
      return e[i].call(r.exports, r, r.exports, t), r.l = !0, r.exports
    }
    return t.m = e, t.c = n, t.d = function(e, n, i) {
      t.o(e, n) || Object.defineProperty(e, n, {
        configurable: !1,
        enumerable: !0,
        get: i
      })
    }, t.n = function(e) {
      var n = e && e.__esModule ? function() {
        return e.default
      } : function() {
        return e
      };
      return t.d(n, "a", n), n
    }, t.o = function(e, n) {
      return Object.prototype.hasOwnProperty.call(e, n)
    }, t.p = "", t(t.s = 8)
  }([function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(1),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.default = function(e) {
      var n = "debug" == o.default.logLevel;

      function t(n) {
        window.console && console.log(e + " " + n)
      }
      return {
        debug: function(e) {
          n && t("[DEBUG] " + e)
        },
        addInfoMessage: function(e) {
          t("[INFO] " + e)
        },
        addErrorMessage: function(e) {
          t("[ERROR] " + e)
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    n.default = {
      servletPath: "amb",
      logLevel: "info",
      loginWindow: "true",
      wsConnectTimeout: 1e4
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(0),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.default = function(e, n, t) {
      var i = void 0,
        r = void 0,
        s = new o.default("amb.ChannelListener"),
        a = e;
      return {
        getCallback: function() {
          return r
        },
        getSubscriptionCallback: function() {
          return t
        },
        getID: function() {
          return i
        },
        setNewChannel: function(e) {
          a.unsubscribe(this), a = e, this.subscribe(r)
        },
        subscribe: function(e) {
          return r = e, i = a.subscribe(this), this
        },
        resubscribe: function() {
          return this.subscribe(r)
        },
        unsubscribe: function() {
          return a.unsubscribe(this), s.debug("Unsubscribed from channel: " + a.getName()), this
        },
        publish: function(e) {
          a.publish(e)
        },
        getName: function() {
          return a.getName()
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    n.default = function(e) {
      var n = [],
        t = 0;
      return {
        subscribe: function(e, i) {
          var r = t++;
          return n.push({
            event: e,
            callback: i,
            id: r
          }), r
        },
        unsubscribe: function(e) {
          for (var t = 0; t < n.length; t++) e === n[t].id && n.splice(t, 1)
        },
        publish: function(e, n) {
          for (var t = this._getSubscriptions(e), i = 0; i < t.length; i++) t[i].callback.apply(null, n)
        },
        getEvents: function() {
          return e
        },
        _getSubscriptions: function(e) {
          for (var t = [], i = 0; i < n.length; i++) n[i].event === e && t.push(n[i]);
          return t
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = u(t(3)),
      r = u(t(0)),
      o = u(t(1)),
      s = u(t(5)),
      a = u(t(6));

    function u(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    n.default = function(e) {
      var n = !1,
        t = !1,
        u = new i.default({
          CONNECTION_INITIALIZED: "connection.initialized",
          CONNECTION_OPENED: "connection.opened",
          CONNECTION_CLOSED: "connection.closed",
          CONNECTION_BROKEN: "connection.broken",
          SESSION_LOGGED_IN: "session.logged.in",
          SESSION_LOGGED_OUT: "session.logged.out",
          SESSION_INVALIDATED: "session.invalidated"
        }),
        c = "closed",
        l = {},
        d = new r.default("amb.ServerConnection");
      ! function() {
        e.addListener("/meta/handshake", this, _), e.addListener("/meta/connect", this, S), e.addListener("/meta/subscribe", this, x), e.addListener("/meta/unsubscribe", this, x)
      }();
      var f = !0,
        g = null,
        h = "true" === o.default.loginWindow,
        p = null,
        b = {
          UNKNOWN_CLIENT: "402::Unknown client"
        },
        v = !1,
        m = {},
        w = !1,
        C = new s.default(e, m),
        y = !1;

      function _(e) {
        setTimeout(function() {
          e.successful && L()
        }, 0)
      }

      function T(n) {
        if (n in l) return l[n];
        var t = new a.default(e, n, y);
        return l[n] = t, t
      }

      function x(n) {
        n.ext && (!1 === n.ext["glide.amb.active"] && m.disconnect(), void 0 !== n.ext["glide.amb.client.log.level"] && "" !== n.ext["glide.amb.client.log.level"] && (amb.properties.logLevel = n.ext["glide.amb.client.log.level"], e.setLogLevel(amb.properties.logLevel)))
      }

      function k() {
        for (var e in d.debug("Resubscribing to all!"), l) {
          var n = l[e];
          n && n.resubscribeToCometD()
        }
      }

      function E() {
        for (var e in d.debug("Unsubscribing from all!"), l) {
          var n = l[e];
          n && n.unsubscribeFromCometD()
        }
      }

      function S(e) {
        if (x(e), t) setTimeout(function() {
          n = !1, d.debug("Connection closed"), c = "closed", M(u.getEvents().CONNECTION_CLOSED)
        }, 0);
        else {
          var i = e.error;
          i && (p = i),
            function(e) {
              var n = e.ext;
              if (n) {
                var t = n["glide.session.status"];
                switch (v = !0 === n["glide.amb.login.window.override"], d.debug("session.status - " + t), t) {
                  case "session.logged.out":
                    f && (f = !1, d.debug("LOGGED_OUT event fire!"), E(), M(u.getEvents().SESSION_LOGGED_OUT), m.loginShow());
                    break;
                  case "session.logged.in":
                    f || R();
                    break;
                  case "session.invalidated":
                  case null:
                    f && (f = !1, d.debug("INVALIDATED event fire!"), E(), M(u.getEvents().SESSION_INVALIDATED));
                    break;
                  default:
                    d.debug("unknown session status - " + t)
                }
              }
            }(e);
          var r = n;
          n = !0 === e.successful, !r && n ? I() : r && !n && (d.addErrorMessage("Connection broken"), c = "broken", w = !0, M(u.getEvents().CONNECTION_BROKEN))
        }
      }

      function L() {
        d.debug("Connection initialized"), y = !0, c = "initialized", M(u.getEvents().CONNECTION_INITIALIZED)
      }

      function I() {
        d.debug("Connection opened"), w ? m.getLastError() === m.getErrorMessages().UNKNOWN_CLIENT && (m.setLastError(null), N()) : C.initialize(O)
      }

      function O() {
        k(), c = "opened", M(u.getEvents().CONNECTION_OPENED)
      }

      function N() {
        var n = function() {
          d.debug("sending /amb_session_setup.do!");
          var n = new XMLHttpRequest;
          return n.open("GET", "/amb_session_setup.do", !0), n.setRequestHeader("Content-type", "application/json;charset=UTF-8"), n.setRequestHeader("X-UserToken", window.g_ck), n.setRequestHeader("X-CometD_SessionID", e.getClientId()), n
        }();
        n.onload = function() {
          200 === this.status && (w = !1, C.initialize(O))
        }, n.send()
      }

      function R() {
        f = !0, d.debug("LOGGED_IN event fire!"), k(), M(u.getEvents().SESSION_LOGGED_IN), m.loginHide()
      }

      function M(e) {
        try {
          u.publish(e)
        } catch (n) {
          d.addErrorMessage("error publishing '" + e + "' - " + n)
        }
      }
      return m.connect = function() {
        n ? console.log(">>> connection exists, request satisfied") : (d.debug("Connecting to glide amb server -> " + o.default.servletURI), e.configure({
          url: m.getURL(o.default.servletPath),
          logLevel: o.default.logLevel,
          connectTimeout: o.default.wsConnectTimeout
        }), e.handshake())
      }, m.reload = function() {
        e.reload()
      }, m.abort = function() {
        e.getTransport().abort()
      }, m.disconnect = function() {
        d.debug("Disconnecting from glide amb server.."), t = !0, e.disconnect()
      }, m.getURL = function(e) {
        return window.location.protocol + "//" + window.location.host + "/" + e
      }, m.unsubscribeAll = function() {
        E()
      }, m.resubscribeAll = function() {
        k()
      }, m.removeChannel = function(e) {
        delete l[e]
      }, m.getEvents = function() {
        return u.getEvents()
      }, m.getConnectionState = function() {
        return c
      }, m.getLastError = function() {
        return p
      }, m.setLastError = function(e) {
        p = e
      }, m.getErrorMessages = function() {
        return b
      }, m.isLoggedIn = function() {
        return f
      }, m.getChannelRedirect = function() {
        return C
      }, m.getChannel = function(e) {
        return T(e)
      }, m.getChannels = function() {
        return l
      }, m.getState = function() {
        return c
      }, m.loginShow = function() {
        var e = '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>';
        if (d.debug("Show login window"), h && !v) try {
          var n = new GlideModal("amb_disconnect_modal");
          n.renderWithContent ? (n.template = '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">  <div class="modal-dialog small-modal" style="width:450px">     <div class="modal-content">        <header class="modal-header">           <h4 id="small_modal1_title" class="modal-title">Login</h4>        </header>        <div class="modal-body">        </div>     </div>  </div></div>', n.renderWithContent(e)) : (n.setBody(e), n.render()), g = n
        } catch (e) {
          d.debug(e)
        }
      }, m.loginHide = function() {
        g && (g.destroy(), g = null)
      }, m.loginComplete = function() {
        R()
      }, m.subscribeToEvent = function(e, t) {
        return u.getEvents().CONNECTION_OPENED === e && n && t(), u.subscribe(e, t)
      }, m.unsubscribeFromEvent = function(e) {
        u.unsubscribe(e)
      }, m.isLoginWindowEnabled = function() {
        return h
      }, m.isLoginWindowOverride = function() {
        return v
      }, m._metaConnect = S, m._metaHandshake = _, m._sendSessionSetupRequest = N, m._onChannelRedirectSubscriptionComplete = O, m._getChannel = T, m._connectionInitialized = L, m._connectionOpened = I, m
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = o(t(0)),
      r = o(t(2));

    function o(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    n.default = function(e, n) {
      var t = void 0,
        o = e,
        s = new i.default("amb.ChannelRedirect");

      function a(e) {
        s.debug("_onAdvice:" + e.data.clientId);
        var t = n.getChannel(e.data.fromChannel),
          i = n.getChannel(e.data.toChannel);
        t && i ? (function(e, n) {
          for (var t = e.getChannelListeners(), i = 0; i < t.length; i++) t[i].setNewChannel(n)
        }(t, i), s.debug("published channel switch event, fromChannel:" + t.getName() + ", toChannel:" + i.getName())) : s.debug("Could not redirect from " + e.data.fromChannel + " to " + e.data.toChannel)
      }
      return {
        initialize: function(e) {
          var i = "/sn/meta/channel_redirect/" + o.getClientId();
          t ? t.subscribeToCometD() : (t = n.getChannel(i), new r.default(t, n, e).subscribe(a)), s.debug("ChannelRedirect initialized: " + i)
        },
        _onAdvice: a
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(0),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.default = function(e, n, t) {
      var i = null,
        r = null,
        s = [],
        a = [],
        u = new o.default("amb.Channel"),
        c = 0,
        l = t;
      return {
        subscribe: function(e) {
          if (e.getCallback()) {
            for (var t = 0; t < s.length; t++)
              if (s[t] === e) return u.debug("Channel listener already in the list"), e.getID();
            s.push(e);
            var o = e.getSubscriptionCallback();
            if (o && (r ? o(r) : a.push(o)), !i && l) try {
              this.subscribeToCometD()
            } catch (e) {
              return void u.addErrorMessage(e)
            }
            return ++c
          }
          u.addErrorMessage("Cannot subscribe to channel: " + n + ", callback not provided")
        },
        resubscribe: function() {
          i = null;
          for (var e = 0; e < s.length; e++) s[e].resubscribe()
        },
        _handleResponse: function(e) {
          for (var n = 0; n < s.length; n++) s[n].getCallback()(e)
        },
        unsubscribe: function(t) {
          if (t) {
            for (var r = 0; r < s.length; r++)
              if (s[r].getID() === t.getID()) {
                s.splice(r, 1);
                break
              } var o;
            s.length < 1 && i && "disconnecting" !== (o = e.getStatus()) && "disconnected" !== o && this.unsubscribeFromCometD()
          } else u.addErrorMessage("Cannot unsubscribe from channel: " + n + ", listener argument does not exist")
        },
        publish: function(t) {
          e.publish(n, t)
        },
        subscribeToCometD: function() {
          i = e.subscribe(n, this._handleResponse.bind(this), this.subscriptionCallback), u.debug("Successfully subscribed to channel: " + n)
        },
        subscriptionCallback: function(e) {
          u.debug("Cometd subscription callback completed for channel: " + n), u.debug("Listener callback queue size: " + a.length), r = e, a.map(function(e) {
            e(r)
          }), a = []
        },
        unsubscribeFromCometD: function() {
          null !== i && (e.unsubscribe(i), i = null, r = null, u.debug("Successfully unsubscribed from channel: " + n))
        },
        resubscribeToCometD: function() {
          u.debug("Resubscribe to " + n), this.subscribeToCometD()
        },
        getName: function() {
          return n
        },
        getChannelListeners: function() {
          return s
        },
        getListenerCallbackQueue: function() {
          return a
        },
        setSubscriptionCallbackResponse: function(e) {
          r = e
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = u(t(10)),
      r = u(t(4)),
      o = u(t(0)),
      s = u(t(2)),
      a = u(t(11));

    function u(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    n.default = function() {
      var e = new i.default.CometD;
      e.registerTransport("websocket", new i.default.WebSocketTransport, 0), e.registerTransport("long-polling", new i.default.LongPollingTransport, 1), e.unregisterTransport("callback-polling");
      var n = new a.default;
      e.registerExtension("graphQLSubscription", n);
      var t = new r.default(e),
        u = new o.default("amb.MessageClient"),
        c = !1;
      return {
        getServerConnection: function() {
          return t
        },
        isLoggedIn: function() {
          return t.isLoggedIn()
        },
        loginComplete: function() {
          t.loginComplete()
        },
        connect: function() {
          c ? u.addInfoMessage(">>> connection exists, request satisfied") : (c = !0, t.connect())
        },
        reload: function() {
          c = !1, t.reload()
        },
        abort: function() {
          c = !1, t.abort()
        },
        disconnect: function() {
          c = !1, t.disconnect()
        },
        isConnected: function() {
          return c
        },
        getConnectionEvents: function() {
          return t.getEvents()
        },
        subscribeToEvent: function(e, n) {
          return t.subscribeToEvent(e, n)
        },
        unsubscribeFromEvent: function(e) {
          t.unsubscribeFromEvent(e)
        },
        getConnectionState: function() {
          return t.getConnectionState()
        },
        getClientId: function() {
          return e.getClientId()
        },
        getChannel: function(e, i) {
          var r = i || {},
            o = r.subscriptionCallback,
            a = r.serializedGraphQLSubscription,
            c = t.getChannel(e);
          return n.isGraphQLChannel(e) && (a ? n.addGraphQLChannel(e, a) : u.addErrorMessage("Serialized subscription not present for GraphQL channel " + e)), new s.default(c, t, o)
        },
        removeChannel: function(e) {
          t.removeChannel(e), n.isGraphQLChannel(e) && n.removeGraphQLChannel(e)
        },
        getChannels: function() {
          return t.getChannels()
        },
        registerExtension: function(n, t) {
          e.registerExtension(n, t)
        },
        unregisterExtension: function(n) {
          e.unregisterExtension(n)
        },
        batch: function(n) {
          e.batch(n)
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    }), n.amb = void 0;
    var i, r = t(9),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.amb = o.default
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = f(t(1)),
      r = f(t(0)),
      o = f(t(3)),
      s = f(t(4)),
      a = f(t(5)),
      u = f(t(2)),
      c = f(t(6)),
      l = f(t(7)),
      d = f(t(12));

    function f(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    var g = {
      properties: i.default,
      Logger: r.default,
      EventManager: o.default,
      ServerConnection: s.default,
      ChannelRedirect: a.default,
      ChannelListener: u.default,
      Channel: c.default,
      MessageClient: l.default,
      getClient: d.default
    };
    n.default = g
  }, function(e, n, t) {
    var i;
    i = function() {
      var e = {
          isString: function(e) {
            return void 0 !== e && null !== e && ("string" == typeof e || e instanceof String)
          },
          isArray: function(e) {
            return void 0 !== e && null !== e && e instanceof Array
          },
          inArray: function(e, n) {
            for (var t = 0; t < n.length; ++t)
              if (e === n[t]) return t;
            return -1
          },
          setTimeout: function(e, n, t) {
            return window.setTimeout(function() {
              try {
                e._debug("Invoking timed function", n), n()
              } catch (t) {
                e._debug("Exception invoking timed function", n, t)
              }
            }, t)
          },
          clearTimeout: function(e) {
            window.clearTimeout(e)
          }
        },
        n = function() {
          var n, t, i;
          this.registered = function(e, i) {
            n = e, t = i
          }, this.unregistered = function() {
            n = null, t = null
          }, this._debug = function() {
            t._debug.apply(t, arguments)
          }, this._mixin = function() {
            return t._mixin.apply(t, arguments)
          }, this.getConfiguration = function() {
            return t.getConfiguration()
          }, this.getAdvice = function() {
            return t.getAdvice()
          }, this.setTimeout = function(n, i) {
            return e.setTimeout(t, n, i)
          }, this.clearTimeout = function(n) {
            e.clearTimeout(n)
          }, this.convertToMessages = function(n) {
            if (e.isString(n)) try {
              return JSON.parse(n)
            } catch (e) {
              throw this._debug("Could not convert to JSON the following string", '"' + n + '"'), e
            }
            if (e.isArray(n)) return n;
            if (void 0 === n || null === n) return [];
            if (n instanceof Object) return [n];
            throw "Conversion Error " + n + ", typeof " + typeof n
          }, this.accept = function(e, n, t) {
            throw "Abstract"
          }, this.getType = function() {
            return n
          }, this.getURL = function() {
            return i
          }, this.setURL = function(e) {
            i = e
          }, this.send = function(e, n) {
            throw "Abstract"
          }, this.reset = function(e) {
            this._debug("Transport", n, "reset", e ? "initial" : "retry")
          }, this.abort = function() {
            this._debug("Transport", n, "aborted")
          }, this.toString = function() {
            return this.getType()
          }
        };
      n.derive = function(e) {
        function n() {}
        return n.prototype = e, new n
      };
      var t = function() {
          var t = new n,
            i = n.derive(t),
            r = 0,
            o = null,
            s = [],
            a = [];

          function u(e, n) {
            if (this.transportSend(e, n), n.expired = !1, !e.sync) {
              var t = this.getConfiguration().maxNetworkDelay,
                i = t;
              !0 === n.metaConnect && (i += this.getAdvice().timeout), this._debug("Transport", this.getType(), "waiting at most", i, "ms for the response, maxNetworkDelay", t);
              var r = this;
              n.timeout = this.setTimeout(function() {
                n.expired = !0;
                var t = "Request " + n.id + " of transport " + r.getType() + " exceeded " + i + " ms max network delay",
                  o = {
                    reason: t
                  },
                  s = n.xhr;
                o.httpCode = r.xhrStatus(s), r.abortXHR(s), r._debug(t), r.complete(n, !1, n.metaConnect), e.onFailure(s, e.messages, o)
              }, i)
            }
          }

          function c(e) {
            var n = ++r,
              t = {
                id: n,
                metaConnect: !1,
                envelope: e
              };
            s.length < this.getConfiguration().maxConnections - 1 ? (s.push(t), u.call(this, e, t)) : (this._debug("Transport", this.getType(), "queueing request", n, "envelope", e), a.push([e, t]))
          }

          function l(n, t) {
            var i = e.inArray(n, s);
            if (i >= 0 && s.splice(i, 1), a.length > 0) {
              var r = a.shift(),
                o = r[0],
                u = r[1];
              if (this._debug("Transport dequeued request", u.id), t) this.getConfiguration().autoBatch && function(e) {
                for (; a.length > 0;) {
                  var n = a[0],
                    t = n[0],
                    i = n[1];
                  if (t.url !== e.url || t.sync !== e.sync) break;
                  a.shift(), e.messages = e.messages.concat(t.messages), this._debug("Coalesced", t.messages.length, "messages from request", i.id)
                }
              }.call(this, o), c.call(this, o), this._debug("Transport completed request", n.id, o);
              else {
                var l = this;
                this.setTimeout(function() {
                  l.complete(u, !1, u.metaConnect);
                  var e = {
                      reason: "Previous request failed"
                    },
                    n = u.xhr;
                  e.httpCode = l.xhrStatus(n), o.onFailure(n, o.messages, e)
                }, 0)
              }
            }
          }
          return i.complete = function(e, n, t) {
            t ? function(e) {
              var n = e.id;
              if (this._debug("Transport", this.getType(), "metaConnect complete, request", n), null !== o && o.id !== n) throw "Longpoll request mismatch, completing request " + n;
              o = null
            }.call(this, e) : l.call(this, e, n)
          }, i.transportSend = function(e, n) {
            throw "Abstract"
          }, i.transportSuccess = function(e, n, t) {
            n.expired || (this.clearTimeout(n.timeout), this.complete(n, !0, n.metaConnect), t && t.length > 0 ? e.onSuccess(t) : e.onFailure(n.xhr, e.messages, {
              httpCode: 204
            }))
          }, i.transportFailure = function(e, n, t) {
            n.expired || (this.clearTimeout(n.timeout), this.complete(n, !1, n.metaConnect), e.onFailure(n.xhr, e.messages, t))
          }, i.send = function(e, n) {
            n ? function(e) {
              if (null !== o) throw "Concurrent metaConnect requests not allowed, request id=" + o.id + " not yet completed";
              var n = ++r;
              this._debug("Transport", this.getType(), "metaConnect send, request", n, "envelope", e);
              var t = {
                id: n,
                metaConnect: !0,
                envelope: e
              };
              u.call(this, e, t), o = t
            }.call(this, e) : c.call(this, e)
          }, i.abort = function() {
            t.abort();
            for (var e = 0; e < s.length; ++e) {
              var n = s[e];
              n && (this._debug("Aborting request", n), this.abortXHR(n.xhr) || this.transportFailure(n.envelope, n, {
                reason: "abort"
              }))
            }
            var i = o;
            i && (this._debug("Aborting metaConnect request", i), this.abortXHR(i.xhr) || this.transportFailure(i.envelope, i, {
              reason: "abort"
            })), this.reset(!0)
          }, i.reset = function(e) {
            t.reset(e), o = null, s = [], a = []
          }, i.abortXHR = function(e) {
            if (e) try {
              var n = e.readyState;
              return e.abort(), n !== window.XMLHttpRequest.UNSENT
            } catch (e) {
              this._debug(e)
            }
            return !1
          }, i.xhrStatus = function(e) {
            if (e) try {
              return e.status
            } catch (e) {
              this._debug(e)
            }
            return -1
          }, i
        },
        i = function() {
          var e = new t,
            i = n.derive(e),
            r = !0;
          return i.accept = function(e, n, t) {
            return r || !n
          }, i.newXMLHttpRequest = function() {
            return new window.XMLHttpRequest
          }, i.xhrSend = function(e) {
            var n = i.newXMLHttpRequest();
            n.context = i.context, n.withCredentials = !0, n.open("POST", e.url, !0 !== e.sync);
            var t = e.headers;
            if (t)
              for (var r in t) t.hasOwnProperty(r) && n.setRequestHeader(r, t[r]);
            return n.setRequestHeader("Content-Type", "application/json;charset=UTF-8"), n.onload = function() {
              200 === n.status ? e.onSuccess(n.responseText) : e.onError(n.statusText)
            }, n.onerror = function() {
              e.onError(n.statusText)
            }, n.send(e.body), n
          }, i.transportSend = function(e, n) {
            this._debug("Transport", this.getType(), "sending request", n.id, "envelope", e);
            var t = this;
            try {
              var i = !0;
              n.xhr = this.xhrSend({
                transport: this,
                url: e.url,
                sync: e.sync,
                headers: this.getConfiguration().requestHeaders,
                body: JSON.stringify(e.messages),
                onSuccess: function(i) {
                  t._debug("Transport", t.getType(), "received response", i);
                  var o = !1;
                  try {
                    var s = t.convertToMessages(i);
                    0 === s.length ? (r = !1, t.transportFailure(e, n, {
                      httpCode: 204
                    })) : (o = !0, t.transportSuccess(e, n, s))
                  } catch (i) {
                    if (t._debug(i), !o) {
                      r = !1;
                      var a = {
                        exception: i
                      };
                      a.httpCode = t.xhrStatus(n.xhr), t.transportFailure(e, n, a)
                    }
                  }
                },
                onError: function(o, s) {
                  t._debug("Transport", t.getType(), "received error", o, s), r = !1;
                  var a = {
                    reason: o,
                    exception: s
                  };
                  a.httpCode = t.xhrStatus(n.xhr), i ? t.setTimeout(function() {
                    t.transportFailure(e, n, a)
                  }, 0) : t.transportFailure(e, n, a)
                }
              }), i = !1
            } catch (i) {
              r = !1, this.setTimeout(function() {
                t.transportFailure(e, n, {
                  exception: i
                })
              }, 0)
            }
          }, i.reset = function(n) {
            e.reset(n), r = !0
          }, i
        },
        r = function() {
          var e = new t,
            i = n.derive(e),
            r = 0;

          function o(e, n, t) {
            var i = this;
            return function() {
              i.transportFailure(e, n, "error", t)
            }
          }
          return i.accept = function(e, n, t) {
            return !0
          }, i.jsonpSend = function(e) {
            var n = document.getElementsByTagName("head")[0],
              t = document.createElement("script"),
              i = "_cometd_jsonp_" + r++;
            window[i] = function(r) {
              n.removeChild(t), delete window[i], e.onSuccess(r)
            };
            var o = e.url;
            o += o.indexOf("?") < 0 ? "?" : "&", o += "jsonp=" + i, o += "&message=" + encodeURIComponent(e.body), t.src = o, t.async = !0 !== e.sync, t.type = "application/javascript", t.onerror = function(n) {
              e.onError("jsonp " + n.type)
            }, n.appendChild(t)
          }, i.transportSend = function(e, n) {
            for (var t = this, i = 0, r = e.messages.length, s = []; r > 0;) {
              var a = JSON.stringify(e.messages.slice(i, i + r)),
                u = e.url.length + encodeURI(a).length,
                c = this.getConfiguration().maxURILength;
              if (u > c) {
                if (1 === r) {
                  var l = "Bayeux message too big (" + u + " bytes, max is " + c + ") for transport " + this.getType();
                  return void this.setTimeout(o.call(this, e, n, l), 0)
                }--r
              } else s.push(r), i += r, r = e.messages.length - i
            }
            var d = e;
            if (s.length > 1) {
              var f = 0,
                g = s[0];
              this._debug("Transport", this.getType(), "split", e.messages.length, "messages into", s.join(" + ")), (d = this._mixin(!1, {}, e)).messages = e.messages.slice(f, g), d.onSuccess = e.onSuccess, d.onFailure = e.onFailure;
              for (var h = 1; h < s.length; ++h) {
                var p = this._mixin(!1, {}, e);
                f = g, g += s[h], p.messages = e.messages.slice(f, g), p.onSuccess = e.onSuccess, p.onFailure = e.onFailure, this.send(p, n.metaConnect)
              }
            }
            this._debug("Transport", this.getType(), "sending request", n.id, "envelope", d);
            try {
              var b = !0;
              this.jsonpSend({
                transport: this,
                url: d.url,
                sync: d.sync,
                headers: this.getConfiguration().requestHeaders,
                body: JSON.stringify(d.messages),
                onSuccess: function(e) {
                  var i = !1;
                  try {
                    var r = t.convertToMessages(e);
                    0 === r.length ? t.transportFailure(d, n, {
                      httpCode: 204
                    }) : (i = !0, t.transportSuccess(d, n, r))
                  } catch (e) {
                    t._debug(e), i || t.transportFailure(d, n, {
                      exception: e
                    })
                  }
                },
                onError: function(e, i) {
                  var r = {
                    reason: e,
                    exception: i
                  };
                  b ? t.setTimeout(function() {
                    t.transportFailure(d, n, r)
                  }, 0) : t.transportFailure(d, n, r)
                }
              }), b = !1
            } catch (e) {
              this.setTimeout(function() {
                t.transportFailure(d, n, {
                  exception: e
                })
              }, 0)
            }
          }, i
        },
        o = function() {
          var t, i = new n,
            r = n.derive(i),
            o = !0,
            s = !1,
            a = !0,
            u = null,
            c = null,
            l = !1,
            d = null;

          function f(e, n) {
            e && (this.webSocketClose(e, n.code, n.reason), this.onClose(e, n))
          }

          function g(e) {
            return e === c || e === u
          }

          function h(e, n, t) {
            for (var i = [], r = 0; r < n.messages.length; ++r) {
              var o = n.messages[r];
              o.id && i.push(o.id)
            }
            e.envelopes[i.join(",")] = [n, t], this._debug("Transport", this.getType(), "stored envelope, envelopes", e.envelopes)
          }

          function p(e, n, i) {
            var r = JSON.stringify(n.messages);
            e.webSocket.send(r), this._debug("Transport", this.getType(), "sent", n, "metaConnect =", i);
            var o = this.getConfiguration().maxNetworkDelay,
              s = o;
            i && (s += this.getAdvice().timeout, l = !0);
            for (var a = this, u = [], c = 0; c < n.messages.length; ++c) ! function() {
              var i = n.messages[c];
              i.id && (u.push(i.id), e.timeouts[i.id] = a.setTimeout(function() {
                t._debug("Transport", a.getType(), "timing out message", i.id, "after", s, "on", e), f.call(a, e, {
                  code: 1e3,
                  reason: "Message Timeout"
                })
              }, s))
            }();
            this._debug("Transport", this.getType(), "waiting at most", s, "ms for messages", u, "maxNetworkDelay", o, ", timeouts:", e.timeouts)
          }

          function b(e, n, i) {
            try {
              null === e ? (e = c || {
                envelopes: {},
                timeouts: {}
              }, h.call(this, e, n, i), function(e) {
                if (!c) {
                  var n = t.getURL().replace(/^http/, "ws");
                  this._debug("Transport", this.getType(), "connecting to URL", n);
                  try {
                    var i = t.getConfiguration().protocol;
                    e.webSocket = i ? new window.WebSocket(n, i) : new window.WebSocket(n), c = e
                  } catch (e) {
                    throw o = !1, this._debug("Exception while creating WebSocket object", e), e
                  }
                  a = !1 !== t.getConfiguration().stickyReconnect;
                  var r = this,
                    l = t.getConfiguration().connectTimeout;
                  l > 0 && (e.connectTimer = this.setTimeout(function() {
                    t._debug("Transport", r.getType(), "timed out while connecting to URL", n, ":", l, "ms"), f.call(r, e, {
                      code: 1e3,
                      reason: "Connect Timeout"
                    })
                  }, l));
                  var d = function(n) {
                    n = n || {
                      code: 1e3
                    }, t._debug("WebSocket onclose", e, n, "connecting", c, "current", u), e.connectTimer && r.clearTimeout(e.connectTimer), r.onClose(e, n)
                  };
                  e.webSocket.onopen = function() {
                    t._debug("WebSocket onopen", e), e.connectTimer && r.clearTimeout(e.connectTimer), g(e) ? (c = null, u = e, s = !0, r.onOpen(e)) : (t._warn("Closing extra WebSocket connection", this, "active connection", u), f.call(r, e, {
                      code: 1e3,
                      reason: "Extra Connection"
                    }))
                  }, e.webSocket.onclose = d, e.webSocket.onerror = function() {
                    d({
                      code: 1e3,
                      reason: "Error"
                    })
                  }, e.webSocket.onmessage = function(n) {
                    t._debug("WebSocket onmessage", n, e), r.onMessage(e, n)
                  }, this._debug("Transport", this.getType(), "configured callbacks on", e)
                }
              }.call(this, e)) : (h.call(this, e, n, i), p.call(this, e, n, i))
            } catch (n) {
              var r = this;
              this.setTimeout(function() {
                f.call(r, e, {
                  code: 1e3,
                  reason: "Exception",
                  exception: n
                })
              }, 0)
            }
          }
          return r.reset = function(e) {
            i.reset(e), o = !0, e && (s = !1), a = !0, u = null, c = null, l = !1
          }, r._notifySuccess = function(e, n) {
            e.call(this, n)
          }, r._notifyFailure = function(e, n, t, i) {
            e.call(this, n, t, i)
          }, r.onOpen = function(e) {
            var n = e.envelopes;
            for (var t in this._debug("Transport", this.getType(), "opened", e, "pending messages", n), n)
              if (n.hasOwnProperty(t)) {
                var i = n[t],
                  r = i[0],
                  o = i[1];
                d = r.onSuccess, p.call(this, e, r, o)
              }
          }, r.onMessage = function(n, t) {
            this._debug("Transport", this.getType(), "received websocket message", t, n);
            for (var i = !1, r = this.convertToMessages(t.data), o = [], s = 0; s < r.length; ++s) {
              var a = r[s];
              if ((/^\/meta\//.test(a.channel) || void 0 === a.data) && a.id) {
                o.push(a.id);
                var u = n.timeouts[a.id];
                u && (this.clearTimeout(u), delete n.timeouts[a.id], this._debug("Transport", this.getType(), "removed timeout for message", a.id, ", timeouts", n.timeouts))
              }
              "/meta/connect" === a.channel && (l = !1), "/meta/disconnect" !== a.channel || l || (i = !0)
            }
            for (var c = !1, f = n.envelopes, g = 0; g < o.length; ++g) {
              var h = o[g];
              for (var p in f)
                if (f.hasOwnProperty(p)) {
                  var b = p.split(","),
                    v = e.inArray(h, b);
                  if (v >= 0) {
                    c = !0, b.splice(v, 1);
                    var m = f[p][0],
                      w = f[p][1];
                    delete f[p], b.length > 0 && (f[b.join(",")] = [m, w]);
                    break
                  }
                }
            }
            c && this._debug("Transport", this.getType(), "removed envelope, envelopes", f), this._notifySuccess(d, r), i && this.webSocketClose(n, 1e3, "Disconnect")
          }, r.onClose = function(e, n) {
            this._debug("Transport", this.getType(), "closed", e, n), g(e) && (o = a && s, c = null, u = null);
            var t = e.timeouts;
            for (var i in e.timeouts = {}, t) t.hasOwnProperty(i) && this.clearTimeout(t[i]);
            var r = e.envelopes;
            for (var d in e.envelopes = {}, r)
              if (r.hasOwnProperty(d)) {
                var f = r[d][0];
                r[d][1] && (l = !1);
                var h = {
                  websocketCode: n.code,
                  reason: n.reason
                };
                n.exception && (h.exception = n.exception), this._notifyFailure(f.onFailure, e, f.messages, h)
              }
          }, r.registered = function(e, n) {
            i.registered(e, n), t = n
          }, r.accept = function(e, n, i) {
            return this._debug("Transport", this.getType(), "accept, supported:", o), o && !!window.WebSocket && !1 !== t.websocketEnabled
          }, r.send = function(e, n) {
            this._debug("Transport", this.getType(), "sending", e, "metaConnect =", n), b.call(this, u, e, n)
          }, r.webSocketClose = function(e, n, t) {
            try {
              e.webSocket && e.webSocket.close(n, t)
            } catch (e) {
              this._debug(e)
            }
          }, r.abort = function() {
            i.abort(), f.call(this, u, {
              code: 1e3,
              reason: "Abort"
            }), this.reset(!0)
          }, r
        },
        s = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", ".", "-", ":", "+", "=", "^", "!", "/", "*", "?", "&", "<", ">", "(", ")", "[", "]", "{", "}", "@", "%", "$", "#"],
        a = [0, 68, 0, 84, 83, 82, 72, 0, 75, 76, 70, 65, 0, 63, 62, 69, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 64, 0, 73, 66, 74, 71, 81, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 77, 0, 78, 67, 0, 0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 79, 0, 80, 0, 0];
      return {
        CometD: function(n) {
          var t, s, a, u, c, l = this,
            d = n || "default",
            f = !1,
            g = new function() {
              var e = [],
                n = {};
              this.getTransportTypes = function() {
                return e.slice(0)
              }, this.findTransportTypes = function(t, i, r) {
                for (var o = [], s = 0; s < e.length; ++s) {
                  var a = e[s];
                  !0 === n[a].accept(t, i, r) && o.push(a)
                }
                return o
              }, this.negotiateTransport = function(t, i, r, o) {
                for (var s = 0; s < e.length; ++s)
                  for (var a = e[s], u = 0; u < t.length; ++u)
                    if (a === t[u]) {
                      var c = n[a];
                      if (!0 === c.accept(i, r, o)) return c
                    } return null
              }, this.add = function(t, i, r) {
                for (var o = !1, s = 0; s < e.length; ++s)
                  if (e[s] === t) {
                    o = !0;
                    break
                  } return o || ("number" != typeof r ? e.push(t) : e.splice(r, 0, t), n[t] = i), !o
              }, this.find = function(t) {
                for (var i = 0; i < e.length; ++i)
                  if (e[i] === t) return n[t];
                return null
              }, this.remove = function(t) {
                for (var i = 0; i < e.length; ++i)
                  if (e[i] === t) {
                    e.splice(i, 1);
                    var r = n[t];
                    return delete n[t], r
                  } return null
              }, this.clear = function() {
                e = [], n = {}
              }, this.reset = function(t) {
                for (var i = 0; i < e.length; ++i) n[e[i]].reset(t)
              }
            },
            h = "disconnected",
            p = 0,
            b = null,
            v = 0,
            m = [],
            w = !1,
            C = 0,
            y = {},
            _ = 0,
            T = null,
            x = [],
            k = {},
            E = {},
            S = {},
            L = !1,
            I = !1,
            O = 0,
            N = 0,
            R = {
              protocol: null,
              stickyReconnect: !0,
              connectTimeout: 0,
              maxConnections: 2,
              backoffIncrement: 1e3,
              maxBackoff: 6e4,
              logLevel: "info",
              maxNetworkDelay: 1e4,
              requestHeaders: {},
              appendMessageTypeToURL: !0,
              autoBatch: !1,
              urls: {},
              maxURILength: 2e3,
              advice: {
                timeout: 6e4,
                interval: 0,
                reconnect: void 0,
                maxInterval: 0
              }
            };

          function M(e, n) {
            try {
              return e[n]
            } catch (e) {
              return
            }
          }

          function D(n) {
            return e.isString(n)
          }

          function U(e) {
            return void 0 !== e && null !== e && "function" == typeof e
          }

          function A(e, n) {
            for (var t = ""; --n > 0 && !(e >= Math.pow(10, n));) t += "0";
            return t += e
          }

          function F(e, n) {
            if (window.console) {
              var t = window.console[e];
              if (U(t)) {
                var i = new Date;
                [].splice.call(n, 0, 0, A(i.getHours(), 2) + ":" + A(i.getMinutes(), 2) + ":" + A(i.getSeconds(), 2) + "." + A(i.getMilliseconds(), 3)), t.apply(window.console, n)
              }
            }
          }

          function P(e) {
            return /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(e)
          }

          function q(e) {
            if (e) {
              var n = y[e.channel];
              n && n[e.id] && (delete n[e.id], l._debug("Removed", e.listener ? "listener" : "subscription", e))
            }
          }

          function B(e) {
            e && !e.listener && q(e)
          }

          function j() {
            for (var e in y)
              if (y.hasOwnProperty(e)) {
                var n = y[e];
                if (n)
                  for (var t in n) n.hasOwnProperty(t) && B(n[t])
              }
          }

          function G(e) {
            h !== e && (l._debug("Status", h, "->", e), h = e)
          }

          function H() {
            return "disconnecting" === h || "disconnected" === h
          }

          function W() {
            return "" + ++p
          }

          function Q(e, n, t, i, r) {
            try {
              return n.call(e, i)
            } catch (e) {
              var o = l.onExtensionException;
              if (U(o)) {
                l._debug("Invoking extension exception handler", t, e);
                try {
                  o.call(l, e, t, r, i)
                } catch (e) {
                  l._info("Exception during execution of extension exception handler", t, e)
                }
              } else l._info("Exception during execution of extension", t, e);
              return i
            }
          }

          function z(e) {
            for (var n = x.length - 1; n >= 0 && void 0 !== e && null !== e; --n) {
              var t = x[n],
                i = t.extension.outgoing;
              if (U(i)) {
                var r = Q(t.extension, i, t.name, e, !0);
                e = void 0 === r ? e : r
              }
            }
            return e
          }

          function X(e, n) {
            var t = y[e];
            if (t)
              for (var i in t)
                if (t.hasOwnProperty(i)) {
                  var r = t[i];
                  if (r) try {
                    r.callback.call(r.scope, n)
                  } catch (e) {
                    var o = l.onListenerException;
                    if (U(o)) {
                      l._debug("Invoking listener exception handler", r, e);
                      try {
                        o.call(l, e, r, r.listener, n)
                      } catch (e) {
                        l._info("Exception during execution of listener exception handler", r, e)
                      }
                    } else l._info("Exception during execution of listener", r, n, e)
                  }
                }
          }

          function J(e, n) {
            X(e, n);
            for (var t = e.split("/"), i = t.length - 1, r = i; r > 0; --r) {
              var o = t.slice(0, r).join("/") + "/*";
              r === i && X(o, n), X(o += "*", n)
            }
          }

          function V() {
            null !== T && e.clearTimeout(T), T = null
          }

          function K(n, t) {
            V();
            var i = k.interval + t;
            l._debug("Function scheduled in", i, "ms, interval =", k.interval, "backoff =", _, n), T = e.setTimeout(l, n, i)
          }

          function Z(e, n, i, r) {
            for (var o = 0; o < n.length; ++o) {
              var s = n[o],
                a = s.id;
              b && (s.clientId = b), void 0 !== (s = z(s)) && null !== s ? (s.id = a, n[o] = s) : (delete E[a], n.splice(o--, 1))
            }
            if (0 !== n.length) {
              var d = l.getURL();
              R.appendMessageTypeToURL && (d.match(/\/$/) || (d += "/"), r && (d += r));
              var f = {
                url: d,
                sync: e,
                messages: n,
                onSuccess: function(e) {
                  try {
                    u.call(l, e)
                  } catch (e) {
                    l._info("Exception during handling of messages", e)
                  }
                },
                onFailure: function(e, n, t) {
                  try {
                    var i = l.getTransport();
                    t.connectionType = i ? i.getType() : "unknown", c.call(l, e, n, t)
                  } catch (e) {
                    l._info("Exception during handling of failure", e)
                  }
                }
              };
              l._debug("Send", f), t.send(f, i)
            }
          }

          function $(e) {
            v > 0 || !0 === w ? m.push(e) : Z(!1, [e], !1)
          }

          function Y() {
            _ = 0
          }

          function ee() {
            var e = m;
            m = [], e.length > 0 && Z(!1, e, !1)
          }

          function ne(e) {
            G("connecting"), K(function() {
              ! function() {
                if (!H()) {
                  var e = {
                    id: W(),
                    channel: "/meta/connect",
                    connectionType: t.getType()
                  };
                  I || (e.advice = {
                    timeout: 0
                  }), G("connecting"), l._debug("Connect sent", e), Z(!1, [e], !0, "connect"), G("connected")
                }
              }()
            }, e)
          }

          function te(e) {
            e && (k = l._mixin(!1, {}, R.advice, e), l._debug("New advice", k))
          }

          function ie(e) {
            if (V(), e && t && t.abort(), b = null, G("disconnected"), v = 0, Y(), t = null, L = !1, I = !1, m.length > 0) {
              var n = m;
              m = [], c.call(l, void 0, n, {
                reason: "Disconnected"
              })
            }
          }

          function re(e, n, t) {
            var i = l.onTransportException;
            if (U(i)) {
              l._debug("Invoking transport exception handler", e, n, t);
              try {
                i.call(l, t, e, n)
              } catch (e) {
                l._info("Exception during execution of transport exception handler", e)
              }
            }
          }

          function oe(e, n) {
            U(e) && (n = e, e = void 0), b = null, j(), H() && g.reset(!0), te({}), v = 0, w = !0, s = e, a = n;
            var i = l.getURL(),
              r = g.findTransportTypes("1.0", f, i),
              o = {
                id: W(),
                version: "1.0",
                minimumVersion: "1.0",
                channel: "/meta/handshake",
                supportedConnectionTypes: r,
                advice: {
                  timeout: k.timeout,
                  interval: k.interval
                }
              },
              u = l._mixin(!1, {}, s, o);
            if (l._putCallback(u.id, n), !t && !(t = g.negotiateTransport(r, "1.0", f, i))) {
              var c = "Could not find initial transport among: " + g.getTransportTypes();
              throw l._warn(c), c
            }
            l._debug("Initial transport is", t.getType()), G("handshaking"), l._debug("Handshake sent", u), Z(!1, [u], !1, "handshake")
          }

          function se(e, n) {
            try {
              e.call(l, n)
            } catch (e) {
              var t = l.onCallbackException;
              if (U(t)) {
                l._debug("Invoking callback exception handler", e);
                try {
                  t.call(l, e, n)
                } catch (e) {
                  l._info("Exception during execution of callback exception handler", e)
                }
              } else l._info("Exception during execution of message callback", e)
            }
          }

          function ae(e) {
            var n = l._getCallback([e.id]);
            U(n) && (delete E[e.id], se(n, e))
          }

          function ue(n) {
            var t = S[n.id];
            if (delete S[n.id], t) {
              l._debug("Handling remote call response for", n, "with context", t);
              var i = t.timeout;
              i && e.clearTimeout(i);
              var r = t.callback;
              if (U(r)) return se(r, n), !0
            }
            return !1
          }

          function ce(e) {
            l._debug("Transport failure handling", e), e.transport && (t = e.transport), e.url && t.setURL(e.url);
            var n = e.action,
              i = e.delay || 0;
            switch (n) {
              case "handshake":
                ! function(e) {
                  G("handshaking"), w = !0, K(function() {
                    oe(s, a)
                  }, e)
                }(i);
                break;
              case "retry":
                ne(i);
                break;
              case "none":
                ie(!0);
                break;
              default:
                throw "Unknown action " + n
            }
          }

          function le(e, n) {
            ae(e), J("/meta/handshake", e), J("/meta/unsuccessful", e), H() && (n.action = "none"), l.onTransportFailure.call(l, e, n, ce)
          }

          function de(e) {
            le(e, {
              cause: "failure",
              action: "handshake",
              transport: null
            })
          }

          function fe(e, n) {
            J("/meta/connect", e), J("/meta/unsuccessful", e), H() && (n.action = "none"), l.onTransportFailure.call(l, e, n, ce)
          }

          function ge(e) {
            I = !1, fe(e, {
              cause: "failure",
              action: "retry",
              transport: null
            })
          }

          function he(e) {
            ie(!0), ae(e), J("/meta/disconnect", e), J("/meta/unsuccessful", e)
          }

          function pe(e) {
            he(e)
          }

          function be(e) {
            var n = y[e.subscription];
            if (n)
              for (var t in n)
                if (n.hasOwnProperty(t)) {
                  var i = n[t];
                  i && !i.listener && (delete n[t], l._debug("Removed failed subscription", i))
                } ae(e), J("/meta/subscribe", e), J("/meta/unsuccessful", e)
          }

          function ve(e) {
            be(e)
          }

          function me(e) {
            ae(e), J("/meta/unsubscribe", e), J("/meta/unsuccessful", e)
          }

          function we(e) {
            me(e)
          }

          function Ce(e) {
            ue(e) || (ae(e), J("/meta/publish", e), J("/meta/unsuccessful", e))
          }

          function ye(e) {
            Ce(e)
          }

          function _e(e) {
            if (O = 0, void 0 !== (e = function(e) {
                for (var n = 0; n < x.length && void 0 !== e && null !== e; ++n) {
                  var t = x[n],
                    i = t.extension.incoming;
                  if (U(i)) {
                    var r = Q(t.extension, i, t.name, e, !1);
                    e = void 0 === r ? e : r
                  }
                }
                return e
              }(e)) && null !== e) switch (te(e.advice), e.channel) {
              case "/meta/handshake":
                ! function(e) {
                  var n = l.getURL();
                  if (e.successful) {
                    var i = l._isCrossDomain(P(n)[2]),
                      r = g.negotiateTransport(e.supportedConnectionTypes, e.version, i, n);
                    if (null === r) return e.successful = !1, void le(e, {
                      cause: "negotiation",
                      action: "none",
                      transport: null
                    });
                    t !== r && (l._debug("Transport", t.getType(), "->", r.getType()), t = r), b = e.clientId, w = !1, ee(), e.reestablish = L, L = !0, ae(e), J("/meta/handshake", e), N = e["x-messages"] || 0;
                    var o = H() ? "none" : k.reconnect || "retry";
                    switch (o) {
                      case "retry":
                        Y(), 0 === N ? ne(0) : l._debug("Processing", N, "handshake-delivered messages");
                        break;
                      case "none":
                        ie(!0);
                        break;
                      default:
                        throw "Unrecognized advice action " + o
                    }
                  } else le(e, {
                    cause: "unsuccessful",
                    action: k.reconnect || "handshake",
                    transport: t
                  })
                }(e);
                break;
              case "/meta/connect":
                ! function(e) {
                  if (I = e.successful) {
                    J("/meta/connect", e);
                    var n = H() ? "none" : k.reconnect || "retry";
                    switch (n) {
                      case "retry":
                        Y(), ne(_);
                        break;
                      case "none":
                        ie(!1);
                        break;
                      default:
                        throw "Unrecognized advice action " + n
                    }
                  } else fe(e, {
                    cause: "unsuccessful",
                    action: k.reconnect || "retry",
                    transport: t
                  })
                }(e);
                break;
              case "/meta/disconnect":
                ! function(e) {
                  e.successful ? (ie(!1), ae(e), J("/meta/disconnect", e)) : he(e)
                }(e);
                break;
              case "/meta/subscribe":
                ! function(e) {
                  e.successful ? (ae(e), J("/meta/subscribe", e)) : be(e)
                }(e);
                break;
              case "/meta/unsubscribe":
                ! function(e) {
                  e.successful ? (ae(e), J("/meta/unsubscribe", e)) : me(e)
                }(e);
                break;
              default:
                ! function(e) {
                  void 0 !== e.data ? ue(e) || (J(e.channel, e), N > 0 && 0 == --N && (l._debug("Processed last handshake-delivered message"), ne(0))) : void 0 === e.successful ? l._warn("Unknown Bayeux Message", e) : e.successful ? (ae(e), J("/meta/publish", e)) : Ce(e)
                }(e)
            }
          }

          function Te(e) {
            var n = y[e];
            if (n)
              for (var t in n)
                if (n.hasOwnProperty(t) && n[t]) return !0;
            return !1
          }

          function xe(e, n) {
            var t = {
              scope: e,
              method: n
            };
            if (U(e)) t.scope = void 0, t.method = e;
            else if (D(n)) {
              if (!e) throw "Invalid scope " + e;
              if (t.method = e[n], !U(t.method)) throw "Invalid callback " + n + " for scope " + e
            } else if (!U(n)) throw "Invalid callback " + n;
            return t
          }

          function ke(e, n, t, i) {
            var r = xe(n, t);
            l._debug("Adding", i ? "listener" : "subscription", "on", e, "with scope", r.scope, "and callback", r.method);
            var o = ++C,
              s = {
                id: o,
                channel: e,
                scope: r.scope,
                callback: r.method,
                listener: i
              },
              a = y[e];
            return a || (a = {}, y[e] = a), a[o] = s, l._debug("Added", i ? "listener" : "subscription", s), s
          }
          this._mixin = function(e, n, t) {
            for (var i = n || {}, r = 2; r < arguments.length; ++r) {
              var o = arguments[r];
              if (void 0 !== o && null !== o)
                for (var s in o)
                  if (o.hasOwnProperty(s)) {
                    var a = M(o, s),
                      u = M(i, s);
                    if (a === n) continue;
                    if (void 0 === a) continue;
                    if (e && "object" == typeof a && null !== a)
                      if (a instanceof Array) i[s] = this._mixin(e, u instanceof Array ? u : [], a);
                      else {
                        var c = "object" != typeof u || u instanceof Array ? {} : u;
                        i[s] = this._mixin(e, c, a)
                      }
                    else i[s] = a
                  }
            }
            return i
          }, this._warn = function() {
            F("warn", arguments)
          }, this._info = function() {
            "warn" !== R.logLevel && F("info", arguments)
          }, this._debug = function() {
            "debug" === R.logLevel && F("debug", arguments)
          }, this._isCrossDomain = function(e) {
            return !!(window.location && window.location.host && e) && e !== window.location.host
          }, this.send = $, this._getCallback = function(e) {
            return E[e]
          }, this._putCallback = function(e, n) {
            var t = this._getCallback(e);
            return U(n) && (E[e] = n), t
          }, this.onTransportFailure = function(e, n, i) {
            this._debug("Transport failure", n, "for", e);
            var r = this.getTransportRegistry(),
              o = this.getURL(),
              s = this._isCrossDomain(P(o)[2]),
              a = r.findTransportTypes("1.0", s, o);
            if ("none" === n.action) {
              if ("/meta/handshake" === e.channel && !n.transport) {
                var u = "Could not negotiate transport, client=[" + a + "], server=[" + e.supportedConnectionTypes + "]";
                this._warn(u), re(t.getType(), null, {
                  reason: u,
                  connectionType: t.getType(),
                  transport: t
                })
              }
            } else if (n.delay = this.getBackoffPeriod(), "/meta/handshake" === e.channel) {
              if (!n.transport) {
                var c = r.negotiateTransport(a, "1.0", s, o);
                c ? (this._debug("Transport", t.getType(), "->", c.getType()), re(t.getType(), c.getType(), e.failure), n.action = "handshake", n.transport = c) : (this._warn("Could not negotiate transport, client=[" + a + "]"), re(t.getType(), null, e.failure), n.action = "none")
              }
              "none" !== n.action && this.increaseBackoffPeriod()
            } else {
              var d = (new Date).getTime();
              if (0 === O && (O = d), "retry" === n.action) {
                n.delay = this.increaseBackoffPeriod();
                var f = k.maxInterval;
                if (f > 0) {
                  var g = k.timeout + k.interval + f;
                  d - O + _ > g && (n.action = "handshake")
                }
              }
              "handshake" === n.action && (n.delay = 0, r.reset(!1), this.resetBackoffPeriod())
            }
            i.call(l, n)
          }, this.receive = _e, u = function(e) {
            l._debug("Received", e);
            for (var n = 0; n < e.length; ++n) _e(e[n])
          }, c = function(e, n, t) {
            l._debug("handleFailure", e, n, t), t.transport = e;
            for (var i = 0; i < n.length; ++i) {
              var r = n[i],
                o = {
                  id: r.id,
                  successful: !1,
                  channel: r.channel,
                  failure: t
                };
              switch (t.message = r, r.channel) {
                case "/meta/handshake":
                  de(o);
                  break;
                case "/meta/connect":
                  ge(o);
                  break;
                case "/meta/disconnect":
                  pe(o);
                  break;
                case "/meta/subscribe":
                  o.subscription = r.subscription, ve(o);
                  break;
                case "/meta/unsubscribe":
                  o.subscription = r.subscription, we(o);
                  break;
                default:
                  ye(o)
              }
            }
          }, this.registerTransport = function(e, n, t) {
            var i = g.add(e, n, t);
            return i && (this._debug("Registered transport", e), U(n.registered) && n.registered(e, this)), i
          }, this.unregisterTransport = function(e) {
            var n = g.remove(e);
            return null !== n && (this._debug("Unregistered transport", e), U(n.unregistered) && n.unregistered()), n
          }, this.unregisterTransports = function() {
            g.clear()
          }, this.getTransportTypes = function() {
            return g.getTransportTypes()
          }, this.findTransport = function(e) {
            return g.find(e)
          }, this.getTransportRegistry = function() {
            return g
          }, this.configure = function(e) {
            (function(e) {
              l._debug("Configuring cometd object with", e), D(e) && (e = {
                url: e
              }), e || (e = {}), R = l._mixin(!1, R, e);
              var n = l.getURL();
              if (!n) throw "Missing required configuration parameter 'url' specifying the Bayeux server URL";
              var t = P(n),
                i = t[2],
                r = t[8],
                o = t[9];
              if (f = l._isCrossDomain(i), R.appendMessageTypeToURL)
                if (void 0 !== o && o.length > 0) l._info("Appending message type to URI " + r + o + " is not supported, disabling 'appendMessageTypeToURL' configuration"), R.appendMessageTypeToURL = !1;
                else {
                  var s = r.split("/"),
                    a = s.length - 1;
                  r.match(/\/$/) && (a -= 1), s[a].indexOf(".") >= 0 && (l._info("Appending message type to URI " + r + " is not supported, disabling 'appendMessageTypeToURL' configuration"), R.appendMessageTypeToURL = !1)
                }
            }).call(this, e)
          }, this.init = function(e, n) {
            this.configure(e), this.handshake(n)
          }, this.handshake = function(e, n) {
            if ("disconnected" !== h) throw "Illegal state: handshaken";
            oe(e, n)
          }, this.disconnect = function(e, n, t) {
            if (!H()) {
              "boolean" != typeof e && (t = n, n = e, e = !1), U(n) && (t = n, n = void 0);
              var i = {
                  id: W(),
                  channel: "/meta/disconnect"
                },
                r = this._mixin(!1, {}, n, i);
              l._putCallback(r.id, t), G("disconnecting"), Z(!0 === e, [r], !1, "disconnect")
            }
          }, this.startBatch = function() {
            ++v, l._debug("Starting batch, depth", v)
          }, this.endBatch = function() {
            ! function() {
              if (--v, l._debug("Ending batch, depth", v), v < 0) throw "Calls to startBatch() and endBatch() are not paired";
              0 !== v || H() || w || ee()
            }()
          }, this.batch = function(e, n) {
            var t = xe(e, n);
            this.startBatch();
            try {
              t.method.call(t.scope), this.endBatch()
            } catch (e) {
              throw this._info("Exception during execution of batch", e), this.endBatch(), e
            }
          }, this.addListener = function(e, n, t) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: channel must be a string";
            return ke(e, n, t, !0)
          }, this.removeListener = function(e) {
            if (!(e && e.channel && "id" in e)) throw "Invalid argument: expected subscription, not " + e;
            q(e)
          }, this.clearListeners = function() {
            y = {}
          }, this.subscribe = function(e, n, t, i, r) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: channel must be a string";
            if (H()) throw "Illegal state: disconnected";
            U(n) && (r = i, i = t, t = n, n = void 0), U(i) && (r = i, i = void 0);
            var o = !Te(e),
              s = ke(e, n, t, !1);
            if (o) {
              var a = {
                  id: W(),
                  channel: "/meta/subscribe",
                  subscription: e
                },
                u = this._mixin(!1, {}, i, a);
              l._putCallback(u.id, r), $(u)
            }
            return s
          }, this.unsubscribe = function(e, n, t) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (H()) throw "Illegal state: disconnected";
            U(n) && (t = n, n = void 0), this.removeListener(e);
            var i = e.channel;
            if (!Te(i)) {
              var r = {
                  id: W(),
                  channel: "/meta/unsubscribe",
                  subscription: i
                },
                o = this._mixin(!1, {}, n, r);
              l._putCallback(o.id, t), $(o)
            }
          }, this.resubscribe = function(e, n) {
            if (B(e), e) return this.subscribe(e.channel, e.scope, e.callback, n)
          }, this.clearSubscriptions = function() {
            j()
          }, this.publish = function(e, n, t, i) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: channel must be a string";
            if (/^\/meta\//.test(e)) throw "Illegal argument: cannot publish to meta channels";
            if (H()) throw "Illegal state: disconnected";
            U(n) ? (i = n, n = {}, t = void 0) : U(t) && (i = t, t = void 0);
            var r = {
                id: W(),
                channel: e,
                data: n
              },
              o = this._mixin(!1, {}, t, r);
            l._putCallback(o.id, i), $(o)
          }, this.publishBinary = function(e, n, t, i, r) {
            U(n) ? (r = n, n = new ArrayBuffer(0), t = !0, i = void 0) : U(t) ? (r = t, t = !0, i = void 0) : U(i) && (r = i, i = void 0);
            var o = {
              meta: i,
              data: n,
              last: t
            };
            this.publish(e, o, {
              ext: {
                binary: {}
              }
            }, r)
          }, this.remoteCall = function(n, t, i, r, o) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (!D(n)) throw "Illegal argument type: target must be a string";
            if (H()) throw "Illegal state: disconnected";
            if (U(t) ? (o = t, t = {}, i = R.maxNetworkDelay, r = void 0) : U(i) ? (o = i, i = R.maxNetworkDelay, r = void 0) : U(r) && (o = r, r = void 0), "number" != typeof i) throw "Illegal argument type: timeout must be a number";
            n.match(/^\//) || (n = "/" + n);
            var s = "/service" + n,
              a = {
                id: W(),
                channel: s,
                data: t
              },
              u = this._mixin(!1, {}, r, a),
              c = {
                callback: o
              };
            i > 0 && (c.timeout = e.setTimeout(l, function() {
              l._debug("Timing out remote call", u, "after", i, "ms"), Ce({
                id: u.id,
                error: "406::timeout",
                successful: !1,
                failure: {
                  message: u,
                  reason: "Remote Call Timeout"
                }
              })
            }, i), l._debug("Scheduled remote call timeout", u, "in", i, "ms")), S[u.id] = c, $(u)
          }, this.remoteCallBinary = function(e, n, t, i, r, o) {
            U(n) ? (o = n, n = new ArrayBuffer(0), t = !0, i = void 0, r = R.maxNetworkDelay) : U(t) ? (o = t, t = !0, i = void 0, r = R.maxNetworkDelay) : U(i) ? (o = i, i = void 0, r = R.maxNetworkDelay) : U(r) && (o = r, r = R.maxNetworkDelay);
            var s = {
              meta: i,
              data: n,
              last: t
            };
            this.remoteCall(e, s, r, {
              ext: {
                binary: {}
              }
            }, o)
          }, this.getStatus = function() {
            return h
          }, this.isDisconnected = H, this.setBackoffIncrement = function(e) {
            R.backoffIncrement = e
          }, this.getBackoffIncrement = function() {
            return R.backoffIncrement
          }, this.getBackoffPeriod = function() {
            return _
          }, this.increaseBackoffPeriod = function() {
            return _ < R.maxBackoff && (_ += R.backoffIncrement), _
          }, this.resetBackoffPeriod = function() {
            Y()
          }, this.setLogLevel = function(e) {
            R.logLevel = e
          }, this.registerExtension = function(e, n) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: extension name must be a string";
            for (var t = !1, i = 0; i < x.length; ++i)
              if (x[i].name === e) {
                t = !0;
                break
              } return t ? (this._info("Could not register extension with name", e, "since another extension with the same name already exists"), !1) : (x.push({
              name: e,
              extension: n
            }), this._debug("Registered extension", e), U(n.registered) && n.registered(e, this), !0)
          }, this.unregisterExtension = function(e) {
            if (!D(e)) throw "Illegal argument type: extension name must be a string";
            for (var n = !1, t = 0; t < x.length; ++t) {
              var i = x[t];
              if (i.name === e) {
                x.splice(t, 1), n = !0, this._debug("Unregistered extension", e);
                var r = i.extension;
                U(r.unregistered) && r.unregistered();
                break
              }
            }
            return n
          }, this.getExtension = function(e) {
            for (var n = 0; n < x.length; ++n) {
              var t = x[n];
              if (t.name === e) return t.extension
            }
            return null
          }, this.getName = function() {
            return d
          }, this.getClientId = function() {
            return b
          }, this.getURL = function() {
            if (t) {
              var e = t.getURL();
              if (e) return e;
              if (e = R.urls[t.getType()]) return e
            }
            return R.url
          }, this.getTransport = function() {
            return t
          }, this.getConfiguration = function() {
            return this._mixin(!0, {}, R)
          }, this.getAdvice = function() {
            return this._mixin(!0, {}, k)
          }, window.WebSocket && this.registerTransport("websocket", new o), this.registerTransport("long-polling", new i), this.registerTransport("callback-polling", new r)
        },
        Transport: n,
        RequestTransport: t,
        LongPollingTransport: i,
        CallbackPollingTransport: r,
        WebSocketTransport: o,
        Utils: e,
        Z85: {
          encode: function(e) {
            var n = null;
            if (e instanceof ArrayBuffer ? n = e : e.buffer instanceof ArrayBuffer ? n = e.buffer : Array.isArray(e) && (n = new Uint8Array(e).buffer), null == n) throw "Cannot Z85 encode " + e;
            for (var t = n.byteLength, i = t % 4, r = 4 - (0 === i ? 4 : i), o = new DataView(n), a = "", u = 0, c = 0; c < t + r; ++c) {
              var l = c >= t;
              if (u = 256 * u + (l ? 0 : o.getUint8(c)), (c + 1) % 4 == 0) {
                for (var d = 52200625, f = 5; f > 0; --f) {
                  if (!l || f > r) {
                    var g = Math.floor(u / d) % 85;
                    a += s[g]
                  }
                  d /= 85
                }
                u = 0
              }
            }
            return a
          },
          decode: function(e) {
            for (var n = e.length % 5, t = 5 - (0 === n ? 5 : n), i = 0; i < t; ++i) e += s[s.length - 1];
            for (var r = e.length, o = new ArrayBuffer(4 * r / 5 - t), u = new DataView(o), c = 0, l = 0, d = 0, f = 0; f < r; ++f) {
              var g = e.charCodeAt(l++) - 32;
              if (c = 85 * c + a[g], l % 5 == 0) {
                for (var h = 16777216; h >= 1;) d < u.byteLength && u.setUint8(d++, Math.floor(c / h) % 256), h /= 256;
                c = 0
              }
            }
            return o
          }
        }
      }
    }, e.exports = i()
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(0),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.default = function() {
      var e = new o.default("amb.GraphQLSubscriptionExtension"),
        n = {};
      this.isGraphQLChannel = function(e) {
        return e && e.startsWith("/rw/graphql")
      }, this.addGraphQLChannel = function(e, t) {
        n[e] = t
      }, this.removeGraphQLChannel = function(e) {
        delete n[e]
      }, this.getGraphQLSubscriptions = function() {
        return n
      }, this.outgoing = function(t) {
        return "/meta/subscribe" === t.channel && this.isGraphQLChannel(t.subscription) && (t.ext || (t.ext = {}), n[t.subscription] && (e.debug("Subscribing with GraphQL subscription:" + n[t.subscription]), t.ext.serializedGraphQLSubscription = n[t.subscription])), t
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(7),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };

    function s(e, n) {
      if (void 0 !== e.getClientWindow && e.getClientWindow() === n) return e;
      var t = function(e, n) {
        for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t]);
        return e
      }({}, e);
      return t.getChannel = function(t, i, r) {
        return e.getChannel(t, i, r || n)
      }, t.subscribeToEvent = function(t, i, r) {
        return e.subscribeToEvent(t, i, r || n)
      }, t.unsubscribeFromEvent = function(t, i) {
        return e.unsubscribeFromEvent(t, i || n)
      }, t.getClientWindow = function() {
        return n
      }, t
    }
    n.default = function() {
      var e = function(e) {
        try {
          if (!e.MSInputMethodContext || !e.document.documentMode)
            for (; e !== e.parent && !e.g_ambClient;) e = e.parent;
          if (e.g_ambClient) return e.g_ambClient
        } catch (e) {
          console.log("AMB getClient() tried to access parent from an iFrame. Caught error: " + e)
        }
        return null
      }(window);
      return e || function(e) {
        var n = window.self;
        n.g_ambClient = e, n.addEventListener("unload", function() {
          n.g_ambClient.disconnect()
        }), "complete" === (n.document ? n.document.readyState : null) ? i() : n.addEventListener("load", i), setTimeout(i, 1e4);
        var t = !1;

        function i() {
          t || (t = !0, n.g_ambClient.connect())
        }
      }(e = s((n = new o.default, t = function() {
        var e = [];

        function n(e, n, i) {
          if (e && i) {
            var r = t(e);
            if (r)
              for (var o = r.subscriptions, s = o.length - 1; s >= 0; s--) o[s].id === n && o[s].callback === i && o.splice(s, 1)
          }
        }

        function t(n) {
          for (var t = 0, i = e.length; t < i; t++)
            if (e[t].window === n) return e[t];
          return null
        }

        function i(n) {
          var t = {
            window: n,
            onUnload: function() {
              t.unloading = !0;
              for (var n = t.subscriptions, i = void 0; i = n.pop();) i.unsubscribe();
              ! function(n) {
                for (var t = 0, i = e.length; t < i; t++)
                  if (e[t].window === n.window) {
                    e.splice(t, 1);
                    break
                  } n.subscriptions = [], n.window.removeEventListener("unload", n.onUnload), n.onUnload = null, n.window = null
              }(t)
            },
            unloading: !1,
            subscriptions: []
          };
          return n.addEventListener("unload", t.onUnload), e.push(t), t
        }
        return {
          add: function(e, r, o, s) {
            if (e && o && s) {
              n(e, r, o);
              var a = t(e);
              a || (a = i(e)), a.unloading || a.subscriptions.push({
                id: r,
                callback: o,
                unsubscribe: s
              })
            }
          },
          remove: n
        }
      }(), {
        getServerConnection: function() {
          return n.getServerConnection()
        },
        connect: function() {
          n.connect()
        },
        abort: function() {
          n.abort()
        },
        disconnect: function() {
          n.disconnect()
        },
        getConnectionState: function() {
          return n.getConnectionState()
        },
        getState: function() {
          return n.getConnectionState()
        },
        getClientId: function() {
          return n.getClientId()
        },
        getChannel: function(e, i, r) {
          var o = n.getChannel(e, i),
            s = o.subscribe,
            a = o.unsubscribe;
          return r = r || window, o.subscribe = function(i) {
            return t.add(r, o, i, function() {
              o.unsubscribe(i)
            }), r.addEventListener("unload", function() {
              n.removeChannel(e)
            }), s.call(o, i), o
          }, o.unsubscribe = function(e) {
            return t.remove(r, o, e), a.call(o, e)
          }, o
        },
        getChannel0: function(e, t) {
          return n.getChannel(e, t)
        },
        registerExtension: function(e, t) {
          n.registerExtension(e, t)
        },
        unregisterExtension: function(e) {
          n.unregisterExtension(e)
        },
        batch: function(e) {
          n.batch(e)
        },
        subscribeToEvent: function(e, i, r) {
          r = r || window;
          var o = n.subscribeToEvent(e, i);
          return t.add(r, o, !0, function() {
            n.unsubscribeFromEvent(o)
          }), o
        },
        unsubscribeFromEvent: function(e, i) {
          i = i || window, t.remove(i, e, !0), n.unsubscribeFromEvent(e)
        },
        isLoggedIn: function() {
          return n.isLoggedIn()
        },
        getConnectionEvents: function() {
          return n.getConnectionEvents()
        },
        getEvents: function() {
          return n.getConnectionEvents()
        },
        loginComplete: function() {
          n.loginComplete()
        },
        getChannels: function() {
          return n.getChannels()
        }
      }), window)), s(e, window);
      var n, t
    }
  }])
});
amb.getClient();;
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
  var PRESENCE_DISABLED = "true" === "true";
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
  $provide.constant("PRESENCE_DISABLED", "true" === "true");
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
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http, $injector) {
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
        if ($injector.has('inSupportClient') && $injector.get('inSupportClient'))
          return false;
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          return !(!scope.profile ||
            activeUserID === scope.profile.sysID ||
            !scope.profile.hasConnectRoles ||
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
angular.module('sn.common.controls', ['sn.common.util']);;
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
angular.module('sn.common.controls').directive('snReferencePicker', function($timeout, $http, urlTools, filterExpressionParser, escapeHtml, i18n) {
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
          return escapeHtml(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayValues = getDisplayValues(item);
          if (displayValues.length == 1)
            return escapeHtml(displayValues[0]);
          if (displayValues.length > 1) {
            var width = 100 / displayValues.length;
            var markup = "";
            for (var i = 0; i < displayValues.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-result-cell'>" + escapeHtml(displayValues[i]) + "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          if ('sysparm_include_variables' in queryParams.data) {
            var url = urlTools.getURL('ref_list_data', queryParams.data);
            return $http.get(url).then(queryParams.success);
          } else {
            var urlQueryParameters = {};
            if (queryParams.data['sysparm_for_impersonation']) {
              urlQueryParameters['sysparm_for_impersonation'] = true;
            }
            var url = urlTools.getURL('ref_list_data', urlQueryParameters);
            return $http.post(url, queryParams.data).then(queryParams.success);
          }
        },
        initSelection: function(elem, callback) {
          if (scope.field && scope.field.displayValue)
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
              sysparm_for_impersonation: !!scope.ed.for_impersonation,
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
          var select2 = element.select2(config).select2('val', []);
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
        $timeout(function() {
          element.parent().find(".select2-focusser").focus();
        }, 0, false);

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
angular.module('sn.common.controls').directive('snRecordPicker', function($timeout, $http, urlTools, filterExpressionParser, escapeHtml, i18n) {
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
    template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{field.name}}" ng-model="field.value"' +
      ' sn-atf-data-type="reference" sn-atf-data-type-params=\'{"reference" : "{{table}}", "reference_qual" : "{{defaultQuery}}",' +
      ' "valueField" : "{{valueField}}", "displayField" : "{{displayField}}"}\' sn-atf-class="builtin:ATF.BaseSNRecordPicker" sn-atf-component-value="{{field}}"/>',
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
          return escapeHtml(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayFields = getdisplayFields(item);
          if (displayFields.length == 1)
            return escapeHtml(cleanLabel(displayFields[0]));
          if (displayFields.length > 1) {
            var markup = escapeHtml(cleanLabel(displayFields[0]));
            var width = 100 / (displayFields.length - 1);
            markup += "<div>";
            for (var i = 1; i < displayFields.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-additional-display-field'>" + escapeHtml(cleanLabel(displayFields[i])) + "</div>";
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
              sysparm_query: buildQuery(filterText, scope.searchFields, scope.defaultQuery),
              sysparm_display_value: true
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
          $select.bind("select2-selecting", onSelecting);
          $select.bind("select2-removing", onRemoving);
          $select.bind("sn-atf-setvalue", onAtfSetValue);
          scope.$emit('select2.ready', element);
        });
      }

      function onAtfSetValue(e) {
        var valueToSet = e.detail ? e.detail.newValue : null;
        if (valueToSet) {
          oldValue = scope.field.value;
          scope.field.value = valueToSet.value;
          scope.field.displayValue = valueToSet.displayValue;
          $select.select2('val', valueToSet.value).select2('close');
          scope.$apply(function() {
            callChange(oldValue, e);
          });
        }
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
            scope.onUpload(response);
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
      $scope.attachmentFile = $scope.attachment || $scope.link.attachment;
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
        snCustomEvent.fire('sn.attachment.preview', event, $scope.attachmentFile.rawData);
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

  function isOriginInWhiteList(origin, whitelistStr) {
    if (!whitelistStr) {
      return false;
    }
    var delimiterRegex = /[\n, ]/;
    var whitelist = whitelistStr.split(delimiterRegex)
      .filter(function(whiteListedOrigin) {
        return whiteListedOrigin;
      })
      .map(function(whiteListedOrigin) {
        return whiteListedOrigin.toLowerCase();
      });
    if (~whitelist.indexOf(origin.toLowerCase())) {
      return true;
    }
    return false;
  }

  function shouldProcessMessage(sourceOrigin) {
    if (!window.g_concourse_onmessage_enforce_same_origin || sourceOrigin === window.location.origin) {
      return true;
    }
    return isOriginInWhiteList(sourceOrigin, window.g_concourse_onmessage_enforce_same_origin_whitelist);
  }

  function registerPostMessageEvent() {
    if (NOW.registeredPostMessageEvent) {
      return;
    }
    if (!window.postMessage) {
      return;
    }
    window.addEventListener('message', function(event) {
      if (!shouldProcessMessage(event.origin)) {
        console.warn('Incoming message ignored due to origin mismatch.');
        return;
      }
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
    set events(value) {
      events = value;
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
    },
    a11yContainer,
    a11yDuration = 5000;
  return {
    show: function(type, message, duration, onClick, container) {
      return createNotificationElement(type, message).then(function(element) {
        return displayAndDestroyNotification(element, container, duration);
      });
    },
    showScreenReaderOnly: function(type, message, duration, onClick, container) {
      return createNotificationElement(type, message, true).then(function(element) {
        return displayAndDestroyNotification(element, container, duration);
      });
    },
    hide: hide,
    setOptions: function(opts) {
      if (angular.isObject(opts))
        angular.extend(options, opts);
    }
  };

  function displayAndDestroyNotification(element, container, duration) {
    displayNotification(element, container);
    checkAndSetDestroyDuration(element, duration);
    return element;
  }

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

  function createNotificationElement(type, message, screenReaderOnly) {
    var thisScope, thisElement;
    var icon = 'icon-info';
    screenReaderOnly = typeof(screenReaderOnly) === 'undefined' ? false : screenReaderOnly;
    if (type == 'error') {
      icon = 'icon-cross-circle';
    } else if (type == 'warning') {
      icon = 'icon-alert';
    } else if (type == 'success') {
      icon = 'icon-check-circle';
    }
    return getTemplate().then(function(template) {
      thisScope = $rootScope.$new();
      thisScope.type = type;
      thisScope.message = message;
      thisScope.icon = icon;
      thisScope.screenReaderOnly = screenReaderOnly;
      thisElement = $compile(template)(thisScope);
      return angular.element(thisElement[0]);
    });
  }

  function displayNotification(element, container) {
    if (!a11yContainer) {
      a11yContainer = angular.element('<div class="notification-a11y-container sr-only" aria-live="assertive">');
      $document.find('body').append(a11yContainer);
    }
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
    $timeout(function() {
      var srElement = angular.element('<div>').text(element.text());
      a11yContainer.append(srElement);
      $timeout(function() {
        srElement.remove();
      }, a11yDuration, false);
    }, 0, false)
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
amb.getClient();;
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
  var PRESENCE_DISABLED = "true" === "true";
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
  $provide.constant("PRESENCE_DISABLED", "true" === "true");
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
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http, $injector) {
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
        if ($injector.has('inSupportClient') && $injector.get('inSupportClient'))
          return false;
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          return !(!scope.profile ||
            activeUserID === scope.profile.sysID ||
            !scope.profile.hasConnectRoles ||
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
/*! RESOURCE: /scripts/sn/common/util/factory.escapeHtml.js */
angular.module('sn.common.util').factory('escapeHtml', function() {
  return function(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;')
      .replace(/\//g, '&#x2F;');
  };
});;
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
  var urlPattern = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)/;
  var hostnameGroupIndex = 4;

  function isUrlExternal(url) {
    var matchResult = url.match(urlPattern);
    if (matchResult && matchResult[hostnameGroupIndex] && matchResult[hostnameGroupIndex].length > 0)
      return true;
    return false;
  }
  return {
    getPartialURL: getPartialURL,
    getURL: getURL,
    urlFor: urlFor,
    getPropertyURL: getPropertyURL,
    encodeURIParameters: encodeURIParameters,
    parseQueryString: parseQueryString,
    isUrlExternal: isUrlExternal
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
    "blur": function(e) {
      if (idleTimeout)
        $timeout.cancel(idleTimeout);
      makePrimary(true);
      isVisible = false;
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
    template: '<dialog ng-keydown="escape($event)"><div ng-click="onClickClose()" title="Close" class="close-button icon-button icon-cross"></div></dialog>',
    link: function(scope, element, attrs, ctrl, transcludeFn) {
      var transcludeScope = {};
      var _focusTrap = null;
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
        activateFocusTrap();
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
        deactivateFocusTrap();
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

      function activateFocusTrap() {
        if (_focusTrap || !window.focusTrap)
          return;
        _focusTrap = focusTrap(element[0], {
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
        element.append('<i class="focus-trap-boundary-south" tabindex="0"></i>');
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
        element.attr('aria-hidden', 'false');
        for (var event in events)
          if (events.hasOwnProperty(event))
            element.on(event, events[event]);
        if (attrs.moveBackdrop == 'true')
          moveBackdrop(element);
      }

      function close() {
        element.modal('hide');
        element.attr('aria-hidden', 'true');
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
                  (
                    !isActive ||
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
  $scope.toggleEmailIframe = function(email, event) {
    email.expanded = !email.expanded;
    event.preventDefault();
  };

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
angular.module("sn.common.stream").controller("snStream", function($rootScope, $scope, $attrs, $http, nowStream, snRecordPresence, snCustomEvent, userPreferences, $window, $q, $timeout, $sce, snMention, i18n, getTemplateUrl) {
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
  $scope.trustAsHtml = function(text) {
    return $sce.trustAsHtml(text);
  };
  $scope.parseSpecial = function(text) {
    var parsedText = $scope.parseLinks(text);
    parsedText = $scope.parseMentions(parsedText);
    return $scope.trustAsHtml(parsedText);
  };
  $scope.isHTMLField = function(change) {
    return change.field_type === 'html' || change.field_type === 'translated_html';
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
      journal.sanitized_new_value = journal.new_value = response.data.result.replace(/\n/g, '<br/>');
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
  snCustomEvent.observe('sn.stream.toggle_multiple_inputs', function() {
    $scope.useMultipleInputs = true;
  });
  $scope.$on('sn.stream.input_value', function(otherScope, type, value) {
    setMultipleInputs();
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
  var multipleInputWatcher = function() {};
  $scope.$watch('useMultipleInputs', function() {
    if ($scope.useMultipleInputs) {
      multipleInputWatcher = $scope.$watch("fields", function(n, o, s) {
        if (n !== o) {
          var strVal = "";
          angular.forEach($scope.fields, function(item) {
            if (item.value)
              strVal = item.value;
          });
          emitTyping(strVal);
        }
      }, true);
    } else {
      multipleInputWatcher();
    }
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
      $scope.fields[field.name].visible = !$scope.formJournalFields && $scope.fields[field.name].canWrite;
      if ($scope.fields[field.name].visible)
        $scope.fieldsVisible++;
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
      var formValue = angular.element('#' + $scope.table + '\\.' + formField.name).val();
      if (formValue && formValue.indexOf($window.NOW.STREAM_VALUE_KEY) !== 0) {
        $scope.fields[formField.name].value = formField.value;
      }
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
      item.checked = false;
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
      if (item.new_value) {
        item.new_value = item.new_value.replace(/\n/g, '<br/>');
      }
      if (item.sanitized_new_value) {
        item.sanitized_new_value = item.sanitized_new_value.replace(/\n/g, '<br/>');
      }
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
  var filterPopoverButton = angular.element("#activity_field_filter_button");
  var filterPopoverContents = angular.element("#activity_field_filter_popover");
  var filterFocusTrap;
  var scrollingContainer;
  var screenSize;
  filterPopoverButton.on("shown.bs.popover", function() {
    filterFocusTrap = $window.focusTrap(filterPopoverContents[0], {
      clickOutsideDeactivates: true
    });
    filterFocusTrap.activate();
  });
  filterPopoverButton.on("hidden.bs.popover", function() {
    filterFocusTrap.deactivate();
  });
  filterPopoverContents.on('keydown', function(evt) {
    if (evt.keyCode !== 27) {
      return;
    }
    filterPopoverButton.popover('hide');
  });
  filterPopoverContents.on("focus", "input[type=checkbox]", function() {
    if (!scrollingContainer) {
      scrollingContainer = filterPopoverContents.parent(".popover-content")[0];
      screenSize = scrollingContainer.offsetHeight;
    }
    var scrollTopPos = scrollingContainer.scrollTop;
    var itemSize = this.parentElement.offsetHeight;
    var offsetTop = this.offsetTop;
    var offsetBot = offsetTop + itemSize;
    if (this.id == "activity_filter_all") {
      scrollingContainer.scrollTop = 0;
    } else if (scrollTopPos > offsetTop) {
      scrollingContainer.scrollTop = offsetTop;
    } else if (offsetBot > screenSize + scrollTopPos) {
      scrollingContainer.scrollTop = offsetBot - screenSize;
    }
  });
}).filter('visibleFields', function() {
  return function(fields) {
    var obj = {};
    angular.forEach(fields, function(field) {
      if (field.visible) {
        obj[field.name] = field;
      }
    });
    return obj;
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
    window.snWebaConfig = window.snWebaConfig || {};
    if (window.snWebaConfig.subscribed && window.snWebaConfig.subscribed == true)
      return;
    var ambClient = getAMB();
    if (ambClient == undefined || ambClient == "")
      return;
    var webaChannelId = "/weba/config";
    var webaCh = ambClient.getChannel(webaChannelId);
    webaCh.subscribe(function(response) {
      if (window.snWebaConfig == undefined || window.snWebaConfig == null)
        window.snWebaConfig = {};
      var oldConfig = {
        siteId: (window.snWebaConfig.siteId) ? window.snWebaConfig.siteId : "0",
        trackerURL: (window.snWebaConfig.trackerURL) ? window.snWebaConfig.trackerURL : ""
      };
      window.snWebaConfig.siteId = response.data.weba_site_id;
      window.snWebaConfig.trackerURL = response.data.weba_rx_url;
      window.snWebaConfig.webaScriptPath = response.data.weba_script_path;
      handleConfigUpdate(oldConfig, window.snWebaConfig);
    });
    ambClient.connect();
    window.snWebaConfig.subscribed = true;
  }

  function getAMB() {
    var ambClient = window.snWebaConfig.ambClient;
    if (ambClient)
      return ambClient;
    window.snWebaConfig.ambClient = (window.g_ambClient) ? window.g_ambClient : ((window.amb) ? window.amb.getClient() : "");
    return window.snWebaConfig.ambClient;
  }

  function handleConfigUpdate(oldConfig, newConfig) {
    if (shouldRemoveTracker(oldConfig, newConfig))
      removeTracker();
    else if (shouldUpdateTracker(oldConfig, newConfig))
      updateTracker(oldConfig, newConfig);
    else if (shouldInsertTracker(oldConfig, newConfig))
      insertTracker(newConfig);
  }

  function shouldRemoveTracker(oldConfig, newConfig) {
    if (newConfig.siteId == "0" || newConfig.trackerURL == "")
      return true;
    return false;
  }

  function shouldUpdateTracker(oldConfig, newConfig) {
    if (oldConfig.siteId && oldConfig.siteId != "0" && oldConfig.siteId != newConfig.siteId)
      return true;
    if (oldConfig.trackerURL && oldConfig.trackerURL != newConfig.trackerURL)
      return true;
    return false;
  }

  function shouldInsertTracker(oldConfig, newConfig) {
    if (oldConfig.siteId == undefined || oldConfig.siteId == "0")
      return true;
    if (oldConfig.trackerURL == undefined || oldConfig.trackerURL == "")
      return true;
    return false;
  }

  function removeTracker() {
    if (!trackerExists())
      return;
    removeWebaTracker();
    removeWebaScript();
    removeWebaElements();
  }

  function removeWebaTracker() {
    var document = window.parent.document;
    var trackerScriptId = "webaTracker";
    var trackEle = document.getElementById(trackerScriptId);
    trackEle.parentNode.removeChild(trackEle);
  }

  function removeWebaScript() {
    var document = window.parent.document;
    var asyncTrackEle = document.getElementById('webaScript');
    if (asyncTrackEle == undefined)
      return;
    var src = asyncTrackEle.src;
    if (src != undefined && src.indexOf("piwik") > 0)
      asyncTrackEle.parentNode.removeChild(asyncTrackEle);
  }

  function removeWebaElements() {
    var document = window.parent.document;
    var webaEle = document.getElementsByClassName("weba");
    var webaSize = webaEle.length - 1;
    while (webaSize >= 0) {
      webaEle[webaSize].parentNode.removeChild(webaEle[webaSize]);
      webaSize--;
    }
  }

  function updateTracker(oldConfig, newConfig) {
    if (!trackerExists())
      return;
    var document = window.parent.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var updateScript = "_paq.push(['setSiteId', " + newConfig.siteId + "]);" + "_paq.push(['setTrackerUrl', " + "'" + newConfig.trackerURL + "'" + "]);";
    var uEle = window.document.createElement("script");
    uEle.text = updateScript;
    uEle.className = "weba";
    head.appendChild(uEle);
  }

  function insertTracker(newConfig, additionalData) {
    var document = window.parent.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    if (trackerExists())
      return;
    if (!isConfigValid(newConfig))
      return;
    var trackerScript = generateTrackerScript(newConfig, additionalData);
    var trackerElement = getOrCreateTracker();
    trackerElement.text = trackerScript;
    head.appendChild(trackerElement);
  }

  function applyTracker(additionalData) {
    insertTracker(window.snWebaConfig, additionalData);
    subscribe();
  }

  function applyTrackEvent(category, key, value, additionalValue) {
    insertEventTracker(category, key, value, additionalValue);
    subscribe();
  }

  function insertEventTracker(category, key, value, additionalValue) {
    if (!isConfigValid(window.snWebaConfig))
      return;
    if (!trackerExists())
      insertTracker(window.snWebaConfig);
    if (typeof category != "string" || typeof key != "string" || typeof value != "string")
      return;
    if (additionalValue)
      additionalValue = (typeof additionalValue == "number") ? additionalValue : 0;
    var eventItems = ["trackEvent", category, key, value, additionalValue];
    var eventScript = "_paq.push(" + JSON.stringify(eventItems) + ");";
    var document = window.parent.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var scriptEle = window.document.createElement("script");
    scriptEle.className = "weba";
    scriptEle.text = eventScript;
    head.appendChild(scriptEle);
  }

  function trackerExists() {
    var document = window.parent.document;
    var trackEle = document.getElementById("webaTracker");
    if (trackEle)
      return true;
    return false;
  }

  function isConfigValid(newConfig) {
    var zero = "0";
    var webaSiteId = (newConfig && newConfig.siteId) ? newConfig.siteId : zero;
    var trackerURL = (newConfig && newConfig.trackerURL) ? newConfig.trackerURL : "";
    if (webaSiteId == null || webaSiteId == "")
      return false;
    if (webaSiteId == zero)
      return false;
    if (trackerURL == null || trackerURL == "")
      return false;
    return true;
  }

  function getOrCreateTracker() {
    var trackerScriptId = "webaTracker";
    var document = window.parent.document;
    var trackEle = document.getElementById(trackerScriptId);
    if (trackEle)
      return trackEle;
    trackEle = document.createElement("script");
    trackEle.id = trackerScriptId;
    trackEle.type = "text/javascript";
    return trackEle;
  }

  function getUserId(additionalData) {
    if (window.NOW && window.NOW.user_id && window.NOW.user_id != "")
      return window.NOW.user_id;
    else if (additionalData && additionalData.userId) {
      return additionalData.userId;
    } else if (window.NOW && window.NOW.session_id)
      return window.NOW.session_id;
    else {
      var userObj = (window.NOW) ? window.NOW.user : null;
      if (userObj && userObj.userID)
        return userObj.userID;
    }
    return "";
  }

  function generateTrackerScript(webaConfig, additionalData) {
    var trackerURL = webaConfig.trackerURL;
    if (trackerURL.endsWith("/"))
      trackerURL = webaConfig.trackerURL.substring(0, trackerURL.length - 1);
    var userId = getUserId(additionalData);
    var script = "var _paq = _paq || [];";
    if (userId && userId != "") {
      script += "_paq.push(['setUserId', '" + userId + "']);";
    }
    script += "_paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);";
    script += "(function() {_paq.push(['setTrackerUrl','" + trackerURL + "']);" +
      "_paq.push(['setSiteId', " + webaConfig.siteId + "]);" +
      "var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; g.async=true; " +
      "g.defer=true; g.src='" + webaConfig.webaScriptPath + "'; " +
      "g.id='webaScript';s.parentNode.insertBefore(g,s); })();";
    return script;
  }
  var api = {
    trackPage: function(additionalData) {
      if (window.document.readyState == "complete")
        applyTracker(additionalData);
      else
        window.addEventListener("load", function() {
          applyTracker(additionalData);
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
/*! RESOURCE: /scripts/app.snTestRunner/_snTestRunner.js */
angular.module('sn.testRunner', ['sn.base', 'sn.common', 'ngResource'])
  .config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);;
/*! RESOURCE: /scripts/app.snTestRunner/controller.snTestRunner.js */
angular
  .module('sn.testRunner')
  .controller('TestRunner', TestRunner);
TestRunner.$inject = ['$rootScope', '$scope', '$element', '$interval', '$timeout', '$q', '$document', '$window', '$httpParamSerializer', 'StepConfig', 'ClientErrorHandler', 'TestInformation', 'ATFConnectionService', 'ImpersonationHandler', 'ScreenshotsModeManager', 'snNotification', 'ReportUITestProgressHandler', 'ATFOpenURL', 'SnapshotHandler'];

function TestRunner($rootScope, $scope, $element, $interval, $timeout, $q, $document, $window, $httpParamSerializer, stepConfig, clientErrorHandler, testInformation, atfConnectionService, impersonationHandler, screenshotsModeManager, snNotification, reportUITestProgressHandler, ATFOpenURL, snapshotHandler) {
  'use strict';
  var self = this;
  self.MESSAGE_KEY_FAILED_WITH_ERROR = "Step execution failed with error: {0}";
  self.MESSAGE_KEY_WAITING_FOR_TEST = "Waiting for a test to run";
  self.MESSAGE_KEY_AN_ERROR_OCCURRED = "An error occurred while setting up the test runner. No tests can be processed. ";
  self.MESSAGE_KEY_ERROR = "ERROR: {0}";
  self.MESSAGE_KEY_WAITING = "Waiting...";
  self.MESSAGE_KEY_LOADING = "Loading...";
  self.MESSAGE_KEY_FAIL_USER_EMPTY = "Could not search for tests to run because the current user is empty.";
  self.MESSAGE_KEY_CANCEL_REQUEST_RECEIVED = "A cancel request has been received";
  self.MESSAGE_KEY_UNEXPECTED_ERROR = "An unexpected error occurred while processing the test.";
  self.MESSAGE_KEY_FINISHED_REPORTING_RESULT = "Finished test execution, reporting result";
  self.MESSAGE_KEY_FINISHED_REPORTING_STEP_RESULT = "Reporting step result";
  self.MESSAGE_KEY_REQUEST_SUCCESSFUL = "Request to run test was successful, running Test {0}";
  self.MESSAGE_KEY_ERROR_RELOAD_PAGE = "An unexpected error occurred while cleaning up after the last test. Please reload the page to continue looking for tests.";
  self.MESSAGE_KEY_FAIL_WRONG_VIEW = "Expected to open the '{0}' view of the form, but actually opened to the '{1}' view";
  self.MESSAGE_KEY_FAIL_WRONG_FORM = "Expected to open form '{0}' but actually opened form '{1}'";
  self.MESSAGE_KEY_FAIL_INVALID_FORM = "'{0}' is not a valid form";
  self.MESSAGE_KEY_FAIL_WRONG_CATALOG_ITEM = "Expected to open '{0}' catalog item but actually opened '{1}' item";
  self.MESSAGE_KEY_FAIL_INVALID_ACCESS_CATALOG_ITEM = "User does not have access to '{0}'";
  self.MESSAGE_KEY_FAILED_REPORT_PROGRESS = "Failed on report step progress";
  self.MESSAGE_KEY_TEST_CANCELED = "The test has been canceled";
  self.MESSAGE_KEY_TAKING_SCREENSHOT = "Taking screenshot and sending it to server";
  self.MESSAGE_KEY_NOT_TAKING_SCREENSHOT = "Not taking screenshot, test iframe is empty";
  self.MESSAGE_KEY_JAVASCRIPT_ERROR = "This step failed because the client error '{0}' was detected on the page being tested. See failing Test Logs. To ignore these errors in the next test run, use 'Add all client errors to warning/ignored list' links.";
  self.MESSAGE_KEY_RUNNING_STEP = "Running step {0} of {1} for {2}";
  self.MESSAGE_KEY_ERROR_IN_UNIMPERSONATION = "Error during unimpersonation! Any further action will be done as user: {0}";
  self.MESSAGE_KEY_ERROR_IN_REPORT_BATCH_RESULT = "Failed to report client batch progress. Test will time out.";
  self.MESSAGE_KEY_ERROR_IN_REPORT_STEP_RESULT = "Failed to report client step progress. If the batch result can be reported the test will fail, otherwise the test will time out.";
  self.MESSAGE_KEY_FOUND_TEST_TO_RUN = "Found a scheduled test to run";
  self.MESSAGE_KEY_EXECUTING_TEST = "Executing test...";
  self.MESSAGE_KEY_ERROR_DETAIL = "Error detail: {0}";
  self.MESSAGE_KEY_STEP_EXEC_FAILED = "Step execution failed with error ";
  self.MESSAGE_KEY_CONFIRM_EXIT = "A test is currently running. Leaving this page will cause the test to time out.";
  self.MESSAGE_KEY_INVALID_REFERENCE = "This step's '{0}' field is being assigned a value that no longer exists. To fix this problem, edit this step and make sure all fields are assigned valid values.";
  self.MESSAGE_KEY_REGISTER_RUNNER_ERROR = "An error occurred registering the test runner with the server";
  self.MESSAGE_KEY_ATF_AGENT_DELETED = "Client test runner deleted. Reload page to activate this test runner.";
  self.MESSAGE_KEY_USER_LOGGED_OUT = "Client test runner session has changed because the user logged out. Reload page to activate this test runner.";
  self.MESSAGE_KEY_CONFIRM_SCHEDULE_SETUP = "Are you sure you want to configure this test runner to only run scheduled tests and suites? It will no longer be available to execute any tests or suites that are started manually.";
  self.MESSAGE_KEY_CONFIRM_SCHEDULE_TEARDOWN = "Are you sure you want to configure this test runner to only run manually-started tests and suites? It will no longer be available to run scheduled tests or suites.";
  self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING = "Unable to toggle scheduled test preferences when a test is currently in progress. Try again when a test is not running.";
  self.MESSAGE_KEY_SCHEDULE_SETUP_FAILED = "Failed to configure this page to run scheduled tests. Refresh the page and try again.";
  self.MESSAGE_KEY_MANUAL_SETUP_FAILED = "Failed to configure this page to run manual tests. Refresh the page and try again.";
  self.MESSAGE_KEY_TAKING_SNAPSHOT_FOR_STEP = "Taking snapshot for {0} page";
  self.MESSAGE_KEY_PREVIOUS_STEP = "previous";
  self.MESSAGE_KEY_CURRENT_STEP = "current";
  self.MESSAGE_KEY_SCHED_RUN_SCHEDULED_TESTS_ONLY = "Run Scheduled Tests Only";
  self.MESSAGE_KEY_SCHED_RUN_MANUAL_TESTS_ONLY = "Run Manual Tests Only";
  self.MESSAGE_KEY_EXECUTION_FRAME = "Execution Frame";
  self.MESSAGE_KEY_CLOSED_TEST_RUNNER = "Client test runner closed or navigated away while step was running. If this was not intentional, it may have been caused by opening a page with a framebuster. Pages with framebusters are not currently testable.";
  self.MESSAGE_KEY_WAITING_FOR_CALM_PAGE = "Waiting up to {0} seconds for page to be calm";
  self.messageMap = new GwtMessage().getMessages([self.MESSAGE_KEY_WAITING_FOR_TEST, self.MESSAGE_KEY_AN_ERROR_OCCURRED,
    self.MESSAGE_KEY_ERROR, self.MESSAGE_KEY_WAITING, self.MESSAGE_KEY_LOADING, self.MESSAGE_KEY_FAILED_WITH_ERROR,
    self.MESSAGE_KEY_FAIL_USER_EMPTY, self.MESSAGE_KEY_CANCEL_REQUEST_RECEIVED, self.MESSAGE_KEY_UNEXPECTED_ERROR,
    self.MESSAGE_KEY_FINISHED_REPORTING_RESULT, self.MESSAGE_KEY_FINISHED_REPORTING_STEP_RESULT, self.MESSAGE_KEY_REQUEST_SUCCESSFUL, self.MESSAGE_KEY_ERROR_RELOAD_PAGE,
    self.MESSAGE_KEY_FAIL_WRONG_VIEW, self.MESSAGE_KEY_FAIL_WRONG_FORM, self.MESSAGE_KEY_STEP_EXEC_FAILED,
    self.MESSAGE_KEY_FAIL_INVALID_FORM, self.MESSAGE_KEY_FAIL_WRONG_CATALOG_ITEM, self.MESSAGE_KEY_FAIL_INVALID_ACCESS_CATALOG_ITEM, self.MESSAGE_KEY_FAILED_REPORT_PROGRESS, self.MESSAGE_KEY_TEST_CANCELED,
    self.MESSAGE_KEY_TAKING_SCREENSHOT, self.MESSAGE_KEY_NOT_TAKING_SCREENSHOT, self.MESSAGE_KEY_JAVASCRIPT_ERROR,
    self.MESSAGE_KEY_RUNNING_STEP, self.MESSAGE_KEY_ERROR_IN_UNIMPERSONATION, self.MESSAGE_KEY_ERROR_IN_REPORT_BATCH_RESULT,
    self.MESSAGE_KEY_FOUND_TEST_TO_RUN, self.MESSAGE_KEY_EXECUTING_TEST, self.MESSAGE_KEY_ERROR_DETAIL, self.MESSAGE_KEY_CONFIRM_EXIT,
    self.MESSAGE_KEY_INVALID_REFERENCE, self.MESSAGE_KEY_REGISTER_RUNNER_ERROR, self.MESSAGE_KEY_ATF_AGENT_DELETED,
    self.MESSAGE_KEY_CONFIRM_SCHEDULE_SETUP, self.MESSAGE_KEY_CONFIRM_SCHEDULE_TEARDOWN, self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING,
    self.MESSAGE_KEY_SCHEDULE_SETUP_FAILED, self.MESSAGE_KEY_MANUAL_SETUP_FAILED, self.MESSAGE_KEY_USER_LOGGED_OUT,
    self.MESSAGE_KEY_SCHED_RUN_SCHEDULED_TESTS_ONLY, self.MESSAGE_KEY_SCHED_RUN_MANUAL_TESTS_ONLY, self.MESSAGE_KEY_EXECUTION_FRAME, self.MESSAGE_KEY_CLOSED_TEST_RUNNER,
    self.MESSAGE_KEY_ERROR_IN_REPORT_STEP_RESULT, self.MESSAGE_KEY_WAITING_FOR_CALM_PAGE
  ]);
  self.messageReference = "";
  self.delayBetweenSteps = 10;
  self.isDebugEnabled = false;
  self.screenshotsQuality = 25;
  self.heartbeatInterval = 60 * 1000;
  self.findTestInterval = 5 * 1000;
  self.isSchedulePluginActive = false;
  self.runScheduledTestsOnly = false;
  self.screenshotTimeoutSeconds = 60;
  self.lockDownScreenshotModesWhileRunningTest = false;
  self.gAutomateWaitTimeoutSeconds = 60;
  self.stepConfigs = {};
  self.AMBChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
  self.AMBStepConfigChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBStepConfigMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
  self.AMBWhitelistedClientErrorChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBWhitelistedClientErrorMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
  self.AMBATFAgentChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBATFAgentMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
  self.currentStepBatch = {};
  self.currentStepBatchResult = {};
  self.testExecutionCount = 0;
  self.stepConfig = stepConfig;
  self.testInformation = testInformation;
  self.atfConnectionService = atfConnectionService;
  self.atfFormInterceptor = null;
  self.impersonationHandler = impersonationHandler;
  self.screenshotsModeManager = screenshotsModeManager;
  self.snNotification = snNotification;
  self.screenshot_status = true;
  self.isRunningTest = false;
  self.stepConfigStale = true;
  self.showLoadingIcon = true;
  self.hasConsoleError = false;
  self.consoleErrorMessage = "";
  self.batchPercentComplete = 0;
  self.unimpersonationFailed = false;
  self.showPreferences = false;
  self.stepTimedOut = false;
  self.INVALID_REFERENCE_PREFIX = "_invalid variable name";
  self.atfAgentSysId = "";
  self.hasSetupHeartbeat = false;
  self.heartbeatIntervalId = "";
  self.findTestIntervalId = null;
  self.clientConnected = true;
  self.amb_connection = null;
  self.handlers = [];
  self._initializeDefaultStates = _initializeDefaultStates;
  self.openFormAndAssert = openFormAndAssert;
  self.openPortalPage = openPortalPage;
  self.openURL = openURL;
  self.openCatalogItem = openCatalogItem;
  self.claimTest = claimTest;
  self.orchestrateTest = orchestrateTest;
  self.setTestStepStatusMessage = setTestStepStatusMessage;
  self.setTestHeaderMessage = setTestHeaderMessage;
  self.setCurrentUser = setCurrentUser;
  self._getCurrentUser = _getCurrentUser;
  self.setiFrameOnloadFunction = setiFrameOnloadFunction;
  self.cleariFrameOnloadFunction = cleariFrameOnloadFunction;
  self.overwriteFrameFunctions = overwriteFrameFunctions;
  self._getFrameWindow = _getFrameWindow;
  self._getFrameGForm = _getFrameGForm;
  self._initializeListeners = _initializeListeners;
  self.hidePreferences = hidePreferences;
  self.togglePreferences = togglePreferences;
  self.showPreferencesTab = showPreferencesTab;
  self.screenshotsModeChanged = screenshotsModeChanged;
  self.unimpersonationNeeded = unimpersonationNeeded;
  self.afterAMBUnsubscribed = afterAMBUnsubscribed;
  self.togglePreferencesDropdown = togglePreferencesDropdown;
  self.toggleRunScheduledTestsOnly = toggleRunScheduledTestsOnly;
  self.reportSetupError = reportSetupError;
  self.teardownBatch = teardownBatch;
  self.logAndNotifyExceptionAsErrorMessage = logAndNotifyExceptionAsErrorMessage;
  self.logAndNotifyException = logAndNotifyException;
  self.getExceptionMessage = getExceptionMessage;
  self.handleTeardownImpersonationFailure = handleTeardownImpersonationFailure;
  self.handleTeardownException = handleTeardownException;
  self.impersonate = impersonate;
  self.impersonationNeeded = impersonationNeeded;
  self.reportBatchResult = reportBatchResult;
  self.handleReportBatchResultException = handleReportBatchResultException;
  self.teardownImpersonation = teardownImpersonation;
  self.populateWithOriginalUserIfEmpty = populateWithOriginalUserIfEmpty;
  self.setupBatch = setupBatch;
  self._getFormattedUTCNowDateTime = _getFormattedUTCNowDateTime;
  self.setupLogCapture = setupLogCapture;
  self.setupAlertCapture = setupAlertCapture;
  self.setupConfirmCapture = setupConfirmCapture;
  self.setupPromptCapture = setupPromptCapture;
  self.setupErrorCapture = setupErrorCapture;
  self.setupJslogCapture = setupJslogCapture;
  self.setupMandatoryCapture = setupMandatoryCapture;
  self.processBatch = processBatch;
  self.processStep = processStep;
  self._executeStep = _executeStep;
  self._waitForCalmPage = _waitForCalmPage;
  self._beforeExecuteStep = _beforeExecuteStep;
  self.resolveInputs = resolveInputs;
  self.validateInputs = validateInputs;
  self.handleStepRunException = handleStepRunException;
  self.saveStepResultAndCheckStepFailure = saveStepResultAndCheckStepFailure;
  self.takeScreenshot = takeScreenshot;
  self.reportStepProgress = reportStepProgress;
  self.pauseBetweenSteps = pauseBetweenSteps;
  self.setTestErrorMessage = setTestErrorMessage;
  self.atflog = atflog;
  self.atflogDebug = atflogDebug;
  self.activate = activate;
  self.setupEvents = setupEvents;
  self.setupConfirmExit = setupConfirmExit;
  self.setupTestRunnerOnExit = setupTestRunnerOnExit;
  self._registerRunner = _registerRunner;
  self._setupStepConfigs = _setupStepConfigs;
  self._setupWhitelistedClientErrors = _setupWhitelistedClientErrors;
  self._handleCaughtClientJavascriptError = _handleCaughtClientJavascriptError;
  self._setupTestInformation = _setupTestInformation;
  self.setupHeartbeat = setUpHeartbeat;
  self.sendHeartbeat = sendHeartbeat;
  self.handleBatchProcessException = handleBatchProcessException;
  self.logAndNotifyExceptionAsHeaderMessage = logAndNotifyExceptionAsHeaderMessage;
  self.onAMBMessageReceived = onAMBMessageReceived;
  self.onAMBMessageReceivedConfig = onAMBMessageReceivedConfig;
  self.onAMBMessageReceivedWhitelistedClientError = onAMBMessageReceivedWhitelistedClientError;
  self.debugOnAMBMessageReceivedWhitelistedClientError = debugOnAMBMessageReceivedWhitelistedClientError;
  self.onAMBMessageReceivedATFAgent = onAMBMessageReceivedATFAgent;
  self.debugOnAMBMessageReceived = debugOnAMBMessageReceived;
  self.debugOnAMBMessageReceivedConfig = debugOnAMBMessageReceivedConfig;
  self._getFileNameNoExtension = _getFileNameNoExtension;
  self._ajaxClaimTest = _ajaxClaimTest;
  self._ajaxClaimScheduledTest = _ajaxClaimScheduledTest;
  self.resetIFrame = resetIFrame;
  self._getFileFormattedUTCNowDateTime = _getFileFormattedUTCNowDateTime;
  self._setupScheduledTests = _setupScheduledTests;
  self._clearHeartbeatInterval = _clearHeartbeatInterval;
  self.setupUserInfo = setupUserInfo;
  self.handleSessionChange = handleSessionChange;
  self.refreshStepConfigs = refreshStepConfigs;
  self.failTestBeforeClosingTestRunner = failTestBeforeClosingTestRunner;
  self.sendATFEvent = sendATFEvent;
  self.takeSnapshotForPreviousStep = takeSnapshotForPreviousStep;
  self.takeSnapshotForCurrentStep = takeSnapshotForCurrentStep;
  self._refreshWhitelistedClientErrors = _refreshWhitelistedClientErrors;
  self._attachATFParametersToHistoryURL = _attachATFParametersToHistoryURL;
  self._setControllerStateIsRunningTest = _setControllerStateIsRunningTest;
  self.findTestToRun = findTestToRun;
  self._findTestToRunByRunnerType = _findTestToRunByRunnerType;
  self._findScheduledTestToRun = _findScheduledTestToRun;
  self._toggleFindTestInterval = _toggleFindTestInterval;
  self.clearTestErrorMessage = clearTestErrorMessage;
  self.activate();

  function activate() {
    try {
      self.iFrame = document.getElementById('testFrame');
      self.frameWindow = self._getFrameWindow();
      self.frameGForm = self._getFrameGForm();
      self._originalLogFunction = console.log;
      self._originalWindowAlert = window.alert;
      self._originalWindowConfirm = window.confirm;
      self._originalWindowPrompt = window.prompt;
      self._originalConsoleError = console.error;
      self._originalJSLog = jslog;
      self._initializeDefaultStates();
      self.setTestHeaderMessage(self.messageMap[self.MESSAGE_KEY_WAITING_FOR_TEST]);
      self.setupEvents();
      self.setupConfirmExit();
      self.setupTestRunnerOnExit();
      self._setupTestInformation();
      try {
        GlideWebAnalytics.trackPage();
      } catch (e) {
        console.log("Failed to track test runner with web analytics: " + e);
      }
      self.original_user_id = g_user.userID;
      self.setupUserInfo()
        .then(self._registerRunner)
        .then(self._setupWhitelistedClientErrors)
        .then(self.stepConfig.getActiveConfigs)
        .then(self._setupStepConfigs)
        .then(self.setupHeartbeat)
        .then(self._setupScheduledTests)
        .then(self._findTestToRunByRunnerType)['catch'](self.reportSetupError);
    } catch (e) {
      console.log(e.message);
      self.reportSetupError();
    }
    if (typeof sys_atf_trim_components !== 'undefined')
      new GUITestingUtil().getGAutomate().setTrimComponents(sys_atf_trim_components);
  }

  function setupUserInfo() {
    var defer = $q.defer();
    self.impersonationHandler.getUserInfo(self.original_user_id)
      .then(function success(userInfo) {
        userInfo = self.populateWithOriginalUserIfEmpty(userInfo);
        self.setCurrentUser(userInfo);
        defer.resolve();
      });
    return defer.promise;
  }

  function reportSetupError(e) {
    self.setTestHeaderMessage("");
    self.showLoadingIcon = false;
    self.logAndNotifyExceptionAsErrorMessage(self.messageMap[self.MESSAGE_KEY_AN_ERROR_OCCURRED], e);
  }

  function setupEvents() {
    $scope.$on("TestInformation.AMBMessageReceived", self.onAMBMessageReceived);
    $scope.$on("TestInformation.AMBMessageReceivedConfig", self.onAMBMessageReceivedConfig);
    $scope.$on("TestInformation.AMBMessageReceivedATFAgent", self.onAMBMessageReceivedATFAgent);
    $scope.$on("TestInformation.AMBMessageReceivedWhitelistedClientError", self.onAMBMessageReceivedWhitelistedClientError);
    if (self.isDebugEnabled) {
      $scope.$on("TestInformation.AMBMessageReceivedDebug", self.debugOnAMBMessageReceived);
      $scope.$on("TestInformation.AMBMessageReceivedConfigDebug", self.debugOnAMBMessageReceivedConfig);
      $scope.$on("TestInformation.AMBMessageReceivedWhitelistedClientErrorDebug", self.debugOnAMBMessageReceivedWhitelistedClientError);
    }
  }

  function onAMBMessageReceivedATFAgent(event, messageData) {
    if (self.isDebugEnabled)
      self.AMBATFAgentMessageDebug = JSON.stringify(messageData, undefined, 1);
    self.afterAMBUnsubscribed(self.messageMap[self.MESSAGE_KEY_ATF_AGENT_DELETED]);
    self.clientConnected = false;
    $scope.$apply();
  }

  function afterAMBUnsubscribed(headerMessage) {
    self.setTestHeaderMessage(headerMessage);
    self.showLoadingIcon = false;
    $rootScope.$evalAsync(function() {
      self.amb_connection = atfConnectionService.getAMBDisconnectedStatusObject();
    });
    self._clearHeartbeatInterval();
  }

  function debugOnAMBMessageReceived(event, messageData) {
    self.AMBMessageDebug = JSON.stringify(messageData, undefined, 1);
    $scope.$apply();
  }

  function onAMBMessageReceived(event, messageData, sysUtTestResultId) {
    self.atflog("Found test to run from AMB");
    self.claimTest(messageData, sysUtTestResultId);
    $scope.$apply();
  }

  function onAMBMessageReceivedConfig(event) {
    self.atflog("Step Config change message received");
    self.stepConfigStale = true;
    $scope.$apply();
  }

  function debugOnAMBMessageReceivedConfig(event, messageData) {
    self.AMBStepConfigMessageDebug = JSON.stringify(messageData, undefined, 1);
    $scope.$apply();
  }

  function onAMBMessageReceivedWhitelistedClientError(event) {
    self.atflog("Client Error Handler change message received");
    clientErrorHandler.setStale(true);
    $scope.$apply();
  }

  function debugOnAMBMessageReceivedWhitelistedClientError(event, messageData) {
    self.AMBWhitelistedClientErrorMessageDebug = JSON.stringify(messageData, undefined, 1);
    $scope.$apply();
  }

  function setupConfirmExit() {
    $window.onbeforeunload = function(event) {
      if (self.isRunningTest)
        return self.messageMap[self.MESSAGE_KEY_CONFIRM_EXIT];
    }
  }

  function setupTestRunnerOnExit() {
    var setupTestRunnerOnExitErrorCallback = function() {
      self.atflog("ClientTestRunnerAjax.makeTestRunnerOffline script include is not found, " +
        "client runner not marked for deletion.");
    };
    $window.onunload = function(event) {
      try {
        window.top.g_automate = null;
        if (self.isRunningTest)
          self.failTestBeforeClosingTestRunner();
        var ga = new GlideAjax("ClientTestRunnerAjax");
        ga.addParam("sysparm_name", "makeTestRunnerOffline");
        ga.addParam("sysparm_atf_agent_id", self.atfAgentSysId);
        ga.addParam("sysparm_status_reason", "Closed/Navigated away");
        ga.setErrorCallback(setupTestRunnerOnExitErrorCallback.bind(self));
        ga.getXMLWait();
      } catch (e) {
        console.log("Exception while page is being unloaded: ", e.message);
      }
    }
  }

  function failTestBeforeClosingTestRunner() {
    self.currentStepResult.success = false;
    self.currentStepResult.message = self.messageMap[self.MESSAGE_KEY_CLOSED_TEST_RUNNER];
    self.saveStepResultAndCheckStepFailure();
    reportUITestProgressHandler.reportStepProgressSynchronously(JSON.stringify(self.currentStepResult),
      self.currentStepBatch.tracker_sys_id, self.currentStep._ui_step_index,
      self.currentStepBatch.sys_atf_steps.length, self.currentStepBatchResult.sys_atf_test_result_sys_id,
      self.atfAgentSysId);
    reportUITestProgressHandler.reportUIBatchResultSynchronously(
      JSON.stringify(self.currentStepBatchResult),
      self.currentStepBatchResult.sys_atf_test_result_sys_id,
      self.currentStepBatch.tracker_sys_id,
      self.atfAgentSysId);
  }

  function setiFrameOnloadFunction(func) {
    self.iFrame.onload = func;
  }

  function cleariFrameOnloadFunction() {
    self.iFrame.onload = null;
  }

  function _initializeListeners() {
    self.atfConnectionService.addListenersForInternalConnectionEvents(self.handlers, function(result) {
      self.amb_connection = result;
    });
  }

  function _setupTestInformation() {
    self.testInformation.enableDebug(self.isDebugEnabled);
    self._initializeListeners();
    if (!self.isSchedulePluginActive || !self.runScheduledTestsOnly)
      self.AMBChannelName = self.testInformation.registerAMBForPage(self.messageReference);
    self.AMBStepConfigChannelName = self.testInformation.registerAMBStepConfigForPage();
    self.AMBWhitelistedClientErrorChannelName = self.testInformation.registerAMBWhitelistedClientErrorForPage();
    self.AMBATFAgentChannelName = self.testInformation.registerAMBATFAgentForPage(self.atfAgentSysId);
  }

  function _setupStepConfigs(configs) {
    self.stepConfigs = configs;
    self.stepConfigStale = false;
    self.atflog("Step Configs loaded");
  }

  function _getFrameWindow() {
    return self.iFrame.contentWindow;
  }

  function _getFrameGForm() {
    return self.frameWindow.g_form;
  }
  var StepBatchResult = Class.create();
  StepBatchResult.prototype = {
    initialize: function() {
      this.stepResults = [];
      this.stepEvents = [];
      this.hasFailure = false;
      this.isCanceled = false;
      this.hasWarning = false;
      this.setupResults = [];
      this.userAgent = navigator.userAgent;
    },
    setError: function() {
      this.hasFailure = true;
      this.status = "error";
    },
    setCancel: function() {
      this.isCanceled = true;
      this.status = "canceled";
    }
  };
  var StepResult = Class.create();
  StepResult.prototype = {
    initialize: function() {
      this.success = false;
      this.message = "";
      this.start_time = null;
      this.end_time = null;
      this.outputs = {};
      this.status = "";
    },
    setError: function(message) {
      this.success = false;
      this.status = "error";
      this.message = message;
    },
    isError: function() {
      return ("error" === this.status);
    },
    setSuccessWithWarning: function(message) {
      this.success = true;
      this.status = "success_with_warnings";
      this.message = message;
    },
    isSuccessWithWarnings: function() {
      return ("success_with_warnings" === this.status);
    }
  };
  var StepEvent = Class.create();
  StepEvent.prototype = {
    initialize: function() {
      this.object = null;
      this.type = null;
      this.start_time = null;
      this.end_time = null;
      this.whitelisted_client_error = null;
      this.step_id = null;
      this.browser = null;
      this.sys_atf_step_sys_id = (self.currentStep != null) ? self.currentStep.sys_id : null;
    }
  };

  function findTestToRun() {
    if (self.isRunningTest) {
      self.atflog(formatMessage("Already running a test, not going to look for a waiting manual test"));
      return;
    }
    self._toggleFindTestInterval(false);
    var userName;
    if (self._getCurrentUser())
      userName = self._getCurrentUser().user_name;
    else
      return $q.reject(self.messageMap[self.MESSAGE_KEY_FAIL_USER_EMPTY]);
    var errorCallbackTestFinder = function(response) {
      self.atflog(formatMessage(
        "TestExecutorAjax.findOldestScheduledTest unknown error, skipping find manual tests, http status {0}.",
        response.status));
      self._toggleFindTestInterval(true);
      $scope.$apply();
    };
    var cftAjax = new GlideAjax('TestExecutorAjax');
    cftAjax.addParam('sysparm_name', 'findOldestScheduledTest');
    cftAjax.addParam('sysparm_user_name', userName);
    cftAjax.addParam('sysparm_message_reference', self.messageReference);
    cftAjax.setErrorCallback(errorCallbackTestFinder.bind(self));
    cftAjax.getXMLAnswer(checkForTestsAnswer);

    function checkForTestsAnswer(answer) {
      if (null == answer || false == answer) {
        self._toggleFindTestInterval(true);
        $scope.$apply();
      } else {
        self._setControllerStateIsRunningTest(true);
        var testJSON = JSON.parse(answer);
        self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_FOUND_TEST_TO_RUN]));
        self.orchestrateTest(testJSON, testJSON.sys_atf_test_result_sys_id);
      }
    }
  }

  function _findScheduledTestToRun() {
    if (self.isRunningTest) {
      self.atflog(formatMessage("Already running a test, not going to look for a waiting scheduled test"));
      return;
    }
    self.atflogDebug("Looking for a waiting scheduled test to run");
    self._toggleFindTestInterval(false);
    var errorCallbackScheduleTestFinder = function(response) {
      self.atflog(formatMessage(
        "ScheduledTestProcessor.findOldestScheduleRunTest unknown error, skipping find scheduled tests, http status {0}.",
        response.status));
      self._toggleFindTestInterval(true);
      $scope.$apply();
    };
    var claimScheduledTestAjax = new GlideAjax('ScheduledTestProcessor');
    claimScheduledTestAjax.addParam('sysparm_ajax_processor_type', 'findOldestScheduleRunTest');
    claimScheduledTestAjax.addParam('sysparm_atf_agent_id', self.atfAgentSysId);
    claimScheduledTestAjax.setErrorCallback(errorCallbackScheduleTestFinder.bind(self));
    claimScheduledTestAjax.getXMLAnswer(checkForScheduledTestsAnswer);

    function checkForScheduledTestsAnswer(answer) {
      if (!answer) {
        self._toggleFindTestInterval(true);
        $scope.$apply();
      } else {
        self._setControllerStateIsRunningTest(true);
        var testJSON = JSON.parse(answer);
        self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_FOUND_TEST_TO_RUN]));
        testJSON['executing_user'] = self._getCurrentUser();
        self.orchestrateTest(testJSON, testJSON.sys_atf_test_result_sys_id);
      }
    }
  }

  function claimTest(stepBatch, utTestResultSysId) {
    if (self.isRunningTest) {
      self.atflog(formatMessage("Already running a test, ignoring this request {0}", utTestResultSysId));
      return;
    }
    self._setControllerStateIsRunningTest(true);
    if (self.runScheduledTestsOnly)
      self._ajaxClaimScheduledTest(stepBatch, utTestResultSysId);
    else
      self._ajaxClaimTest(stepBatch, utTestResultSysId);
  }

  function _ajaxClaimTest(stepBatch, utTestResultSysId) {
    self.atflog(formatMessage("Found a manual test to run, trying to claim it {0}", utTestResultSysId));
    var errorCallbackClaimTestAjax = function(response) {
      self.atflog(formatMessage(
        "TestExecutorAjax.claimTest unknown error, skipping claim manual tests, http status {0}.",
        response.status));
      self._setControllerStateIsRunningTest(false);
    };
    var claimTestAjax = new GlideAjax('TestExecutorAjax');
    claimTestAjax.addParam('sysparm_name', 'claimTest');
    claimTestAjax.addParam('sysparm_test_result_sys_id', utTestResultSysId);
    claimTestAjax.addParam('sysparm_batch_execution_tracker_sys_id', stepBatch.tracker_sys_id);
    claimTestAjax.addParam('sysparm_batch_length', stepBatch.sys_atf_steps.length);
    claimTestAjax.setErrorCallback(errorCallbackClaimTestAjax.bind(self));
    claimTestAjax.getXMLAnswer(claimTestAnswer);

    function claimTestAnswer(answer) {
      if (answer.toString() == "true") {
        self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_REQUEST_SUCCESSFUL],
          utTestResultSysId));
        self.orchestrateTest(stepBatch, utTestResultSysId);
      } else {
        self.atflog(formatMessage("Not running manual test, a different browser picked it up first: sys_atf_test_result id={0}", utTestResultSysId));
        self._setControllerStateIsRunningTest(false);
      }
    }
  }

  function _ajaxClaimScheduledTest(stepBatch, utTestResultSysId) {
    self.atflog(formatMessage("Found a scheduled test to run, trying to claim it {0}", utTestResultSysId));
    var errorCallbackClaimScheduledTestAjax = function(response) {
      self.atflog(formatMessage(
        "ScheduledTestProcessor.claimScheduledTest unknown error, skipping claim scheduled tests, http status {0}.",
        response.status));
      self._setControllerStateIsRunningTest(false);
    };
    var claimScheduledTestAjax = new GlideAjax('ScheduledTestProcessor');
    claimScheduledTestAjax.addParam('sysparm_ajax_processor_type', 'claimScheduledTest');
    claimScheduledTestAjax.addParam('sysparm_atf_agent_id', self.atfAgentSysId);
    claimScheduledTestAjax.addParam('sysparm_test_result_sys_id', utTestResultSysId);
    claimScheduledTestAjax.addParam('sysparm_batch_execution_tracker_sys_id', stepBatch.tracker_sys_id);
    claimScheduledTestAjax.addParam('sysparm_batch_length', stepBatch.sys_atf_steps.length);
    claimScheduledTestAjax.setErrorCallback(errorCallbackClaimScheduledTestAjax.bind(self));
    claimScheduledTestAjax.getXMLAnswer(claimScheduledTestAnswer);

    function claimScheduledTestAnswer(answer) {
      if (answer.toString() == "true") {
        self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_REQUEST_SUCCESSFUL],
          utTestResultSysId));
        stepBatch['executing_user'] = self._getCurrentUser();
        self.orchestrateTest(stepBatch, utTestResultSysId);
      } else {
        self.atflog(formatMessage("Not running scheduled test, system constraints do not match or a different browser picked it up first: sys_atf_test_result id={0}", utTestResultSysId));
        self._setControllerStateIsRunningTest(false);
      }
    }
  }

  function orchestrateTest(stepBatch, utTestResultSysId) {
    self.clearTestErrorMessage();
    self.setTestHeaderMessage(self.messageMap[self.MESSAGE_KEY_EXECUTING_TEST]);
    self.showLoadingIcon = false;
    $q.when()
      .then(self.refreshStepConfigs)
      .then(self._refreshWhitelistedClientErrors)
      .then(function runSetupBatch() {
        return self.setupBatch(stepBatch, utTestResultSysId);
      })
      .then(function runProcessBatch() {
        return self.processBatch(stepBatch);
      })
      .then(function() {
        stepBatch = null;
      })['catch'](self.handleBatchProcessException)
      .then(self.teardownImpersonation)['catch'](self.handleTeardownImpersonationFailure)
      .then(self.reportBatchResult)['catch'](self.handleReportBatchResultException)
      .then(self.teardownBatch)['catch'](self.handleTeardownException);
  }

  function refreshStepConfigs() {
    if (self.stepConfigStale) {
      var defer = $q.defer();
      try {
        stepConfig.getActiveConfigs()
          .then(self._setupStepConfigs)
          .then(function() {
            defer.resolve();
          });
      } catch (e) {
        console.log(e.message);
        self._setControllerStateIsRunningTest(false);
        self.reportSetupError();
        defer.reject();
      }
      return defer.promise;
    } else
      return $q.when();
  }

  function _setupWhitelistedClientErrors() {
    return clientErrorHandler.populateActiveErrors()
      .then(function(success) {
        if (success === false)
          self.atflog("TestRunner has skipped refreshing ClientErrorHandler");
        else
          self.atflog("TestRunner has updated ClientErrorHandler with active entries");
      });
  }

  function _refreshWhitelistedClientErrors() {
    if (clientErrorHandler.isStale()) {
      var defer = $q.defer();
      try {
        self._setupWhitelistedClientErrors()
          .then(function() {
            defer.resolve();
          });
      } catch (e) {
        console.log(e.message);
        self._setControllerStateIsRunningTest(false);
        self.reportSetupError();
        defer.reject();
      }
      return defer.promise;
    } else
      return $q.when();
  }

  function handleBatchProcessException(e) {
    if (!e)
      return;
    if (self.currentStepBatchResult.isCanceled) {
      self.logAndNotifyExceptionAsHeaderMessage(self.messageMap[self.MESSAGE_KEY_CANCEL_REQUEST_RECEIVED],
        self.messageMap[self.MESSAGE_KEY_CANCEL_REQUEST_RECEIVED]);
      return;
    }
    self.logAndNotifyExceptionAsHeaderMessage(self.messageMap[self.MESSAGE_KEY_UNEXPECTED_ERROR], e);
    if (self.currentStepBatchResult && self.currentStepBatchResult.setError)
      self.currentStepBatchResult.setError();
  }

  function logAndNotifyExceptionAsHeaderMessage(message, e) {
    self.logAndNotifyException(message, e, self.setTestHeaderMessage);
  }

  function logAndNotifyExceptionAsErrorMessage(message, e) {
    self.logAndNotifyException(message, e, self.setTestErrorMessage);
  }

  function logAndNotifyException(message, e, notifyMethod) {
    var exMessage = self.getExceptionMessage(e);
    if (notifyMethod)
      notifyMethod(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR], message));
    self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR_DETAIL], exMessage));
    if (e && Object.prototype.hasOwnProperty.call(e, "stack"))
      console.log(e.stack);
  }

  function getExceptionMessage(e) {
    var exMessage = "";
    if (typeof e === "string")
      exMessage = e;
    else if (e)
      exMessage = e.message;
    return exMessage;
  }

  function handleTeardownImpersonationFailure(e) {
    self.setTestErrorMessage(e);
    self.setTestHeaderMessage("");
  }

  function handleTeardownException(e) {
    if (self.unimpersonationFailed)
      return;
    self.logAndNotifyExceptionAsErrorMessage(self.messageMap[self.MESSAGE_KEY_ERROR_RELOAD_PAGE], e);
  }

  function impersonate() {
    if (!self.impersonationNeeded())
      return $q.when();
    var impersonateDefer = $q.defer();
    var batch = self.currentStepBatch;
    var stepEvent = new StepEvent();
    stepEvent.type = "client_log";
    stepEvent.start_time = self._getFormattedUTCNowDateTime();
    self.impersonationHandler.impersonate(batch.impersonating_user, stepEvent)
      .then(function impersonateSuccess() {
        self.setCurrentUser(batch.impersonating_user);
        batch = null;
        impersonateDefer.resolve();
      }, function impersonateFailure() {
        self.atflog(stepEvent.object);
        if (self.currentStepBatchResult) {
          stepEvent.end_time = self._getFormattedUTCNowDateTime();
          stepEvent.status = "failure";
          self.currentStepBatchResult.hasFailure = true;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
        batch = null;
        impersonateDefer.reject();
      });
    return impersonateDefer.promise;
  }

  function impersonationNeeded() {
    var batch = self.currentStepBatch;
    if (!batch)
      return false;
    var impersonatingUser = batch.impersonating_user;
    if (impersonatingUser && impersonatingUser.user_sys_id && impersonatingUser.user_sys_id != "" &&
      self._getCurrentUser() && self._getCurrentUser().user_sys_id != impersonatingUser.user_sys_id)
      return true;
    return false;
  }

  function reportBatchResult() {
    self.setTestStepStatusMessage(self.messageMap[self.MESSAGE_KEY_FINISHED_REPORTING_RESULT]);
    var stepThatFailedToReport = null;
    if (self.stepTimedOut)
      stepThatFailedToReport = self.currentStepResult;
    self.stepTimedOut = false;
    var lastStepBatchResult = JSON.stringify(self.currentStepBatchResult);
    return reportUITestProgressHandler.reportUIBatchResult(
      lastStepBatchResult,
      self.currentStepBatchResult.sys_atf_test_result_sys_id,
      self.currentStepBatch.tracker_sys_id,
      self.atfAgentSysId,
      JSON.stringify(stepThatFailedToReport));
  }

  function handleReportBatchResultException(e) {
    self.logAndNotifyExceptionAsHeaderMessage(self.messageMap[self.MESSAGE_KEY_ERROR_IN_REPORT_BATCH_RESULT], e);
    if (self.currentStepBatchResult)
      self.currentStepBatchResult.setError();
  }

  function takeSnapshotForPreviousStep() {
    if (self.runScheduledTestsOnly)
      return $q.when();
    if (self.page_data_capture && self.currentStep.order > 1 && !_isTestRunnerIFrameEmpty())
      return _takeSnapshot(true);
    return $q.when();
  }

  function takeSnapshotForCurrentStep() {
    if (self.runScheduledTestsOnly)
      return $q.when();
    if (self.page_data_capture && _needsSnapshot(self.currentStep))
      return _takeSnapshot(false);
    return $q.when();

    function _needsSnapshot(step) {
      if (_isTestRunnerIFrameEmpty())
        return false;
      if (!_findSnapshot(step))
        return true;
      return step.assertionObject.canMutatePage;
    }
  }

  function _takeSnapshot(isPreviousStepSnapshot) {
    self.setTestStepStatusMessage("Taking snapshot of the current page");
    return snapshotHandler.takeSnapshot(self.currentStep, window.top.g_automate, isPreviousStepSnapshot);
  }

  function teardownBatch() {
    if (self.unimpersonationFailed)
      return $q.reject();
    self.atflog("Tearing down batch");
    self.setTestHeaderMessage(self.messageMap[self.MESSAGE_KEY_WAITING_FOR_TEST]);
    self.setTestStepStatusMessage("");
    self.showLoadingIcon = true;
    if (self.cleariFrameOnloadFunction)
      self.cleariFrameOnloadFunction();
    self.testExecutionCount++;
    self.currentStepResult = null;
    self.currentStepBatch = null;
    self.currentStepBatchResult = null;
    self.hasConsoleError = false;
    self.consoleErrorMessage = "";
    self.numberOfStepsInBatch = 0;
    self.batchPercentComplete = 0;
    self.atfFormInterceptor = null;
    console.log = null;
    console.log = self._originalLogFunction;
    window.alert = null;
    window.alert = self._originalWindowAlert;
    window.confirm = null;
    window.confirm = self._originalWindowConfirm;
    window.prompt = null;
    window.prompt = self._originalWindowPrompt;
    console.error = null;
    console.error = self._originalConsoleError;
    jslog = null;
    jslog = self._originalJSLog;
    if (window.CustomEventManager)
      CustomEventManager.unAll('glideform.mandatorycheck.failed');
    self.resetIFrame();
    self._setControllerStateIsRunningTest(false);
    self._findTestToRunByRunnerType();
  }

  function resetIFrame() {
    self.iFrame.src = "about:blank";
    self.iFrame.contentWindow.location.reload();
    self.iFrame = null;
    self.frameWindow = null;
    self.frameGForm = null;
    var iframeId = "testFrame";
    angular.element("#" + iframeId).unbind();
    var iframe = document.getElementById(iframeId);
    var iframeParent = document.getElementById("tabexecution");
    if (iframeParent) {
      iframeParent.removeChild(iframe);
      var newIframe = document.createElement("iframe");
      newIframe.setAttribute("id", "testFrame");
      newIframe.setAttribute("width", "100%");
      newIframe.setAttribute("height", "100%");
      newIframe.setAttribute("aria-label", self.messageMap[self.MESSAGE_KEY_EXECUTION_FRAME]);
      newIframe.setAttribute("ng-load", "testRunner._doWhenFrameLoaded()");
      iframeParent.appendChild(newIframe);
    }
    self.iFrame = document.getElementById("testFrame");
    self.frameWindow = self._getFrameWindow();
    self.frameGForm = self._getFrameGForm();
    var testRunnerTabs = document.getElementById("test_runner_tabs");
    if (testRunnerTabs)
      testRunnerTabs.scrollIntoView();
    var testRunnerBanner = document.getElementById("test_runner_banner");
    if (testRunnerBanner)
      testRunnerBanner.scrollIntoView();
  }

  function unimpersonationNeeded() {
    var executingUser = self.currentStepBatch.executing_user;
    if (self._getCurrentUser() && executingUser && self._getCurrentUser().user_sys_id == executingUser.user_sys_id)
      return false;
    return true;
  }

  function teardownImpersonation() {
    if (!self.unimpersonationNeeded())
      return $q.when();
    var unimpersonationDefer = $q.defer();
    var executingUser = self.currentStepBatch.executing_user;
    executingUser = self.populateWithOriginalUserIfEmpty(executingUser);
    var stepEvent = new StepEvent();
    stepEvent.type = "client_log";
    stepEvent.start_time = self._getFormattedUTCNowDateTime();
    self.impersonationHandler.unimpersonate(executingUser, stepEvent)
      .then(function unimpersonateSuccess() {
        self.setCurrentUser(executingUser);
        executingUser = null;
        unimpersonationDefer.resolve();
      }, function unimpersonateFailure() {
        if (self.currentStepBatchResult) {
          stepEvent.end_time = self._getFormattedUTCNowDateTime();
          stepEvent.status = "failure";
          self.currentStepBatchResult.hasFailure = true;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
        self.atflog(stepEvent.object);
        self.unimpersonationFailed = true;
        executingUser = null;
        unimpersonationDefer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR_IN_UNIMPERSONATION],
          self.currentStepBatch.impersonating_user.user_name));
      });
    return unimpersonationDefer.promise;
  }

  function populateWithOriginalUserIfEmpty(user) {
    if (!user)
      user = {};
    if ((!user.user_sys_id || user.user_sys_id == "") && (!user.user_name || user.user_name == "")) {
      user.user_sys_id = self.original_user_id;
      user.user_name = self.original_user_id;
    }
    return user;
  }

  function setupBatch(stepBatch, utTestResultSysId) {
    var testResult = new StepBatchResult();
    testResult['sys_atf_test_result_sys_id'] = utTestResultSysId;
    self.currentStepBatch = stepBatch;
    self.currentStepBatchResult = testResult;
    self.numberOfStepsInBatch = stepBatch.sys_atf_steps.length;
    self.atfFormInterceptor = new ATFFormInterceptor(self.currentStepBatch[ATFFormInterceptor.ROLLBACK_CONTEXT_ID]);
    self.setupLogCapture();
    self.setupAlertCapture();
    self.setupConfirmCapture();
    self.setupPromptCapture();
    self.setupErrorCapture();
    self.setupJslogCapture();
    self.setupMandatoryCapture();
    self.setCurrentUser(self.currentStepBatch.executing_user);
    return self.impersonate();
  }

  function _getFormattedUTCNowDateTime() {
    var MOMENT_FORMAT_FOR_GLIDE_SYSTEM_DATETIME = "YYYY-MM-DD HH:mm:ss";
    return moment().utc().format(MOMENT_FORMAT_FOR_GLIDE_SYSTEM_DATETIME);
  }

  function _getFileFormattedUTCNowDateTime() {
    var MOMENT_FORMAT_FOR_GLIDE_SYSTEM_DATETIME = "YYYY_MM_DD_HH_mm_ss";
    return moment().utc().format(MOMENT_FORMAT_FOR_GLIDE_SYSTEM_DATETIME);
  }

  function setupLogCapture() {
    (function() {
      var log = self._originalLogFunction;
      console.log = function() {
        var logStartTime = self._getFormattedUTCNowDateTime();
        var argumentsArray = Array.prototype.slice.call(arguments);
        log.apply(this, argumentsArray);
        var logEndTime = self._getFormattedUTCNowDateTime();
        if (self.currentStepBatchResult) {
          var stepEvent = new StepEvent();
          var logText = "";
          for (var logIndex = 0; logIndex < argumentsArray.length; logIndex++) {
            logText += (logText) ? "\n" + argumentsArray[logIndex] : argumentsArray[logIndex];
          }
          stepEvent.object = logText;
          stepEvent.type = "client_log";
          stepEvent.start_time = logStartTime;
          stepEvent.end_time = logEndTime;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
      };
    }());
  }

  function setupAlertCapture() {
    (function() {
      window.alert = function() {
        if (self.currentStepBatchResult) {
          var occurrenceDateTime = self._getFormattedUTCNowDateTime();
          var stepEvent = new StepEvent();
          stepEvent.object = arguments[0];
          stepEvent.type = "client_alert";
          stepEvent.start_time = occurrenceDateTime;
          stepEvent.end_time = occurrenceDateTime;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
      };
    }());
  }

  function setupConfirmCapture() {
    (function() {
      window.confirm = function() {
        if (self.currentStepBatchResult) {
          var occurrenceDateTime = self._getFormattedUTCNowDateTime();
          var stepEvent = new StepEvent();
          stepEvent.object = arguments[0];
          stepEvent.type = "client_confirm";
          stepEvent.start_time = occurrenceDateTime;
          stepEvent.end_time = occurrenceDateTime;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
        return true;
      }
    }());
  }

  function setupPromptCapture() {
    (function() {
      window.prompt = function() {
        if (self.currentStepBatchResult) {
          var occurrenceDateTime = self._getFormattedUTCNowDateTime();
          var stepEvent = new StepEvent();
          stepEvent.object = arguments[0];
          stepEvent.type = "client_prompt";
          stepEvent.start_time = occurrenceDateTime;
          stepEvent.end_time = occurrenceDateTime;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
        return "test value";
      }
    }());
  }

  function setupErrorCapture() {
    (function() {
      console.error = function() {
        if (self.currentStepBatchResult && arguments[0])
          self._handleCaughtClientJavascriptError(arguments[0].toString());
      };
    }());
  }

  function _handleCaughtClientJavascriptError(errorMessage) {
    var errorStartTime = self._getFormattedUTCNowDateTime();
    var errorEndTime = self._getFormattedUTCNowDateTime();
    var stepEvent = new StepEvent();
    stepEvent.object = errorMessage;
    self.atflog(errorMessage);
    var clientJavascriptError = clientErrorHandler.getErrorType(errorMessage, self.atflog);
    if (clientJavascriptError.isIgnored()) {
      stepEvent.status = "ignored";
      self.sendATFEvent('Client Error', 'Client Error ignored');
    } else if (clientJavascriptError.isWarning()) {
      stepEvent.status = "warning";
      self.currentStepResult.setSuccessWithWarning(errorMessage);
      self.currentStepBatchResult.hasWarning = true;
      self.sendATFEvent('Client Error', 'Client Error captured as warning');
    } else if (clientJavascriptError.isFailure() || clientJavascriptError.isUnknown()) {
      stepEvent.status = "failure";
      self.hasConsoleError = true;
      if (self.consoleErrorMessage == "")
        self.consoleErrorMessage = errorMessage;
      self.sendATFEvent('Client Error', 'Client Error captured');
    }
    stepEvent.type = "client_error";
    stepEvent.start_time = errorStartTime;
    stepEvent.end_time = errorEndTime;
    stepEvent.whitelisted_client_error = clientJavascriptError.sysId;
    stepEvent.step_id = self.currentStep.sys_id;
    stepEvent.browser = navigator.userAgent;
    self.currentStepBatchResult.stepEvents.push(stepEvent);
  }

  function setupJslogCapture() {
    (function() {
      var nextMsgIsError = false;
      jslog = function() {
        var msg = arguments[0];
        if (nextMsgIsError) {
          console.error(msg);
          nextMsgIsError = false;
          return;
        }
        if (msg === "A script has encountered an error in render events")
          nextMsgIsError = true;
        console.log(arguments[0]);
      };
    }());
  }

  function setupMandatoryCapture() {
    (function() {
      if (!window.CustomEventManager || !CustomEventManager.observe)
        return;
      CustomEventManager.observe('glideform.mandatorycheck.failed', function(msg) {
        if (!self.currentStepBatchResult)
          return;
        var occurrenceDateTime = self._getFormattedUTCNowDateTime();
        var stepEvent = new StepEvent();
        stepEvent.object = msg;
        stepEvent.type = "client_alert";
        stepEvent.start_time = occurrenceDateTime;
        stepEvent.end_time = occurrenceDateTime;
        self.currentStepBatchResult.stepEvents.push(stepEvent);
      });
    })();
  }

  function processBatch(batch) {
    self.atflog("Processing batch with order: " + batch.order);
    var steps = batch.sys_atf_steps;
    var firstPromise = $q.when();
    var stepPromiseChain = steps.reduce(function(previousPromise, currentStep, currentIndex) {
      return previousPromise.then(function() {
        currentStep._ui_step_index = currentIndex + 1;
        self.currentStep = currentStep;
        self.page_data_capture = batch.page_data_capture;
        return self.processStep(batch, currentStep);
      });
    }, firstPromise);
    return stepPromiseChain;
  }

  function processStep(batch, step) {
    self.setTestHeaderMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_RUNNING_STEP], step._ui_step_index,
      batch.sys_atf_steps.length, batch.test_name));
    return $q.when()
      .then(self._beforeExecuteStep)
      .then(self.takeSnapshotForPreviousStep)
      .then(self._attachATFParametersToHistoryURL)
      .then(self._executeStep)
      .then(self._waitForCalmPage)['catch'](self.handleStepRunException)['finally'](self.saveStepResultAndCheckStepFailure)['finally'](self.takeScreenshot)['finally'](function runReportStepProgress() {
        return self.reportStepProgress(batch, step);
      })['finally'](self.takeSnapshotForCurrentStep)
      .then(self.pauseBetweenSteps);
  }

  function _beforeExecuteStep() {
    var stepResult = new StepResult();
    stepResult.sys_atf_step_sys_id = self.currentStep.sys_id;
    self.currentStepResult = stepResult;
    self.currentStep.test_result_id = self.currentStepBatchResult.sys_atf_test_result_sys_id;
    _setupAssertionObject(self.currentStep);
    return _executeAssertionFunction('beforeExecuteStep')
  }

  function _setupAssertionObject(step) {
    self.currentStep.assertionObject = {};
    var stepConfig = self.stepConfigs[step.step_config_sys_id];
    var stepExecutionGenerator = stepConfig.step_execution_generator;
    if (stepExecutionGenerator.indexOf('assertionObject.executeStep') !== -1) {
      var assertionFunction = new Function("step", "stepResult", "assertionObject", stepExecutionGenerator);
      assertionFunction(step, self.currentStepResult, step.assertionObject);
      return;
    }
    step.assertionObject.executeStep = new Function("step", "stepResult", stepExecutionGenerator);
  }

  function _executeAssertionFunction(functionName) {
    var assertDefer = $q.defer();
    self.currentStep.defer = assertDefer;
    var assertionFunction = self.currentStep.assertionObject[functionName];
    if (assertionFunction) {
      var timeout = self.currentStep.timeout ? self.currentStep.timeout : 1;
      self.atflogDebug('Executing ' + functionName + ' script with timeout set as:' + timeout);
      _runClosureTillSuccessOrTimeout(assertionFunction, timeout, assertDefer);
    } else {
      self.atflogDebug('No ' + functionName + ' script defined for this step.');
      assertDefer.resolve();
    }
    return assertDefer.promise;
  }

  function _runClosureTillSuccessOrTimeout(closureToRun, waitTimeout, assertDeferred) {
    var startTime = new Date().getTime();
    var waitTimeoutInMillis = waitTimeout * 1000;
    var latestClosureError;
    runClosure();

    function runClosure() {
      try {
        if ((new Date().getTime() - startTime) >= waitTimeoutInMillis) {
          assertDeferred.reject(latestClosureError);
          return false;
        }
        closureToRun();
        assertDeferred.resolve();
        return true;
      } catch (e) {
        console.log(e.message);
        latestClosureError = e;
      }
      setTimeout(runClosure, 1000);
    }
  }

  function _isTestRunnerIFrameEmpty() {
    if (!self._getFrameWindow().document)
      return true;
    if (!self._getFrameWindow().document.body)
      return true;
    if (!self._getFrameWindow().document.body.children)
      return true;
    if (self._getFrameWindow().document.body.children.length === 0)
      return true;
    return false;
  }

  function _findSnapshot(step) {
    return snapshotHandler.findSnapshot(step.test, step.order, self.isDebugEnabled);
  }

  function _executeStep() {
    var assertDefer = $q.defer();
    self.currentStep.defer = assertDefer;
    if (self.atfFormInterceptor) {
      var testIFrameWindow = self._getFrameWindow();
      self.atfFormInterceptor.interceptFormWithRollbackContextId(testIFrameWindow);
      self.atfFormInterceptor.interceptFormWithStepIdAndTestResultId(self.currentStepResult.sys_atf_step_sys_id, self.currentStepBatchResult.sys_atf_test_result_sys_id, testIFrameWindow);
      self.atfFormInterceptor.interceptXMLHttpRequestWithStepIdandTestResultId(self.currentStepResult.sys_atf_step_sys_id, self.currentStepBatchResult.sys_atf_test_result_sys_id, testIFrameWindow, self.isDebugEnabled);
    }
    self.currentStepResult.start_time = self._getFormattedUTCNowDateTime();
    var stepWithResolvedInputs = self.resolveInputs(self.currentStep);
    if (!self.validateInputs(stepWithResolvedInputs))
      return $q.reject();
    stepWithResolvedInputs.assertionObject.executeStep(stepWithResolvedInputs, self.currentStepResult);
    return assertDefer.promise;
  }

  function _attachATFParametersToHistoryURL() {
    var testFrameLocationURL = self._getFrameWindow().location.href;
    if (testFrameLocationURL !== "about:blank" && testFrameLocationURL.indexOf(ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID) == -1) {
      var gurl = new GlideURL(testFrameLocationURL);
      gurl.setEncode(false);
      gurl.addParam("sysparm_atf_step_sys_id", self.currentStepResult.sys_atf_step_sys_id);
      gurl.addParam("sysparm_atf_test_result_sys_id", self.currentStepBatchResult.sys_atf_test_result_sys_id);
      gurl.addParam("sysparm_atf_debug", self.isDebugEnabled ? "true" : "false");
      gurl.addParam(ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID, self.atfFormInterceptor.getRollbackContextId());
      gurl.addParam(ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER, "true");
      if (self._getFrameWindow().history && self._getFrameWindow().history.replaceState) {
        self._getFrameWindow().history.replaceState({}, "", gurl.getURL());
        return $timeout(function() {
          self.atflog("Waiting for the history changes to be effective.");
        }, 10000);
      }
    }
    return $q.when();
  }

  function resolveInputs(step) {
    for (var key in step.inputs) {
      if (typeof step.inputs[key] == 'string' && (step.inputs[key].indexOf("{{step['") > -1 || step.inputs[key].indexOf("{{parameter['") > -1)) {
        var testExecutorAjax = new GlideAjax('TestExecutorAjax');
        testExecutorAjax.addParam('sysparm_name', 'resolveInputs');
        testExecutorAjax.addParam('sysparm_atf_test_result', self.currentStepBatchResult.sys_atf_test_result_sys_id);
        testExecutorAjax.addParam('sysparm_atf_step_id', step.sys_id);
        testExecutorAjax.addParam('sysparm_atf_parameter_set_order', self.currentStepBatch.atf_parameter_set_order);
        testExecutorAjax.getXMLWait();
        var newStep = JSON.parse(testExecutorAjax.getAnswer());
        step.inputs = newStep.inputs;
        return step;
      }
    }
    return step;
  }

  function validateInputs(step) {
    for (var key in step.inputs) {
      if (typeof step.inputs[key] == 'string' && step.inputs[key].indexOf(self.INVALID_REFERENCE_PREFIX) > -1) {
        var variable = key;
        if (step.input_variable_labels && step.input_variable_labels[key])
          variable = step.input_variable_labels[key];
        self.currentStepResult.setError(formatMessage(self.messageMap[self.MESSAGE_KEY_INVALID_REFERENCE], variable));
        return false;
      }
    }
    return true;
  }

  function _waitForCalmPage() {
    if (!self.currentStep.assertionObject['canMutatePage'])
      return $q.resolve();
    self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_WAITING_FOR_CALM_PAGE], self.gAutomateWaitTimeoutSeconds));
    var calmPageDefer = $q.defer();
    window.top.g_automate.startToWaitMomentOfCalm(onCalmPage, onWaitTimeout, self.gAutomateWaitTimeoutSeconds);

    function onCalmPage() {
      calmPageDefer.resolve();
    }

    function onWaitTimeout() {
      atflog("wait for calm page: page was still processing client-side calls after timeout of " + self.gAutomateWaitTimeoutSeconds + " seconds");
      calmPageDefer.resolve();
    }
    return calmPageDefer.promise;
  }

  function handleStepRunException(e) {
    if (!e)
      return;
    self.logAndNotifyExceptionAsHeaderMessage(self.messageMap[self.MESSAGE_KEY_STEP_EXEC_FAILED], e);
    if (!self.currentStepResult)
      return;
    self.currentStepResult.setError(formatMessage(self.messageMap[self.MESSAGE_KEY_FAILED_WITH_ERROR], e.message));
  }

  function saveStepResultAndCheckStepFailure() {
    if (self.hasConsoleError) {
      self.currentStepResult.success = false;
      self.currentStepResult.message = formatMessage(self.messageMap[self.MESSAGE_KEY_JAVASCRIPT_ERROR], self.consoleErrorMessage);
    }
    self.currentStepResult.end_time = self._getFormattedUTCNowDateTime();
    self.currentStepBatchResult.stepResults.push(self.currentStepResult);
    var stepEvent = new StepEvent();
    stepEvent.type = "step_completion";
    stepEvent.start_time = self.currentStepResult.start_time;
    stepEvent.end_time = self.currentStepResult.end_time;
    self.currentStepBatchResult.stepEvents.push(stepEvent);
    if (self.currentStepResult.success) {
      if (!self.currentStepResult.isSuccessWithWarnings())
        self.currentStepResult.status = 'success';
      return $q.when();
    } else {
      self.currentStepBatchResult.hasFailure = true;
      if (!self.currentStepResult.isError())
        self.currentStepResult.status = 'failure';
      return $q.reject();
    }
  }

  function takeScreenshot() {
    if (self.screenshotsModeManager.shouldSkipScreenshot(self.currentStepResult)) {
      self.atflog("Skipping screenshot, screenshot mode: " + self.screenshotsModeManager.getCurrentModeValue());
      return $q.when();
    }

    function afterScreenshotTaken(error) {
      if (typeof error !== 'undefined') {
        var stepEvent = new StepEvent();
        stepEvent.object = error;
        stepEvent.type = "client_log";
        stepEvent.start_time = self._getFormattedUTCNowDateTime();
        stepEvent.step_id = self.currentStep.sys_id;
        stepEvent.browser = navigator.userAgent;
        stepEvent.end_time = self._getFormattedUTCNowDateTime();
        self.currentStepBatchResult.stepEvents.push(stepEvent);
      }
      self.atflog("Finished taking screenshot, continuing test");
      testFrameDoc = null;
      ha = null;
      ssDefer.resolve();
    }
    var ssDefer = $q.defer();
    try {
      if (typeof Promise == "undefined")
        return;
      var testFrameDoc = self.iFrame.contentDocument || self.iFrame.contentWindow.document;
      if (testFrameDoc.body.innerHTML.length == 0) {
        self.setTestStepStatusMessage(self.messageMap[self.MESSAGE_KEY_NOT_TAKING_SCREENSHOT]);
        return;
      }
      self.setTestStepStatusMessage(self.messageMap[self.MESSAGE_KEY_TAKING_SCREENSHOT]);
      var ha = new GlideScreenshot(self.screenshotTimeoutSeconds);
      ha.generateAndAttach(testFrameDoc.body, "sys_atf_test_result", self.currentStepBatchResult.sys_atf_test_result_sys_id,
        self._getFileNameNoExtension(), self.screenshotsQuality, afterScreenshotTaken);
    } catch (e) {
      console.log("An error occurred while trying to take a screenshot: " + e.message);
      ssDefer.resolve();
    }
    return ssDefer.promise;
  }

  function reportStepProgress(batch, step) {
    self.setTestStepStatusMessage(self.messageMap[self.MESSAGE_KEY_FINISHED_REPORTING_STEP_RESULT]);
    self.batchPercentComplete = (step._ui_step_index / self.numberOfStepsInBatch) * 100;
    var reportStepProgressDefer = $q.defer();
    var currentStepIndex = step._ui_step_index;
    reportUITestProgressHandler.reportUIStepProgress(
        batch,
        currentStepIndex + 1,
        self.currentStepBatchResult,
        JSON.stringify(self.currentStepResult),
        self.atfAgentSysId)
      .then(function handleReportingSuccess() {
        self.assertionFunction = null;
        reportStepProgressDefer.resolve();
      }, function handleReportingFailure(problem) {
        if (problem && problem['cancel']) {
          self.currentStepBatchResult.setCancel();
          return reportStepProgressDefer.reject(self.messageMap[self.MESSAGE_KEY_TEST_CANCELED]);
        }
        self.stepTimedOut = true;
        self.currentStepResult.message = self.messageMap[self.MESSAGE_KEY_ERROR_IN_REPORT_STEP_RESULT];
        self.currentStepBatchResult.setError();
        reportStepProgressDefer.reject(self.messageMap[self.MESSAGE_KEY_ERROR_IN_REPORT_STEP_RESULT]);
      });
    return reportStepProgressDefer.promise;
  }

  function pauseBetweenSteps() {
    return $timeout(function() {
      self.atflogDebug("Delay between steps completed. Continuing...");
    }, self.delayBetweenSteps);
  }

  function setTestHeaderMessage(message) {
    self.testHeaderMessage = message;
    self.atflog(message);
  }

  function setTestErrorMessage(message) {
    if (!message)
      self.clearTestErrorMessage();
    self.errorMessage = message;
    $element.find("#errorMessageDiv").show();
    self.atflog(message);
  }

  function clearTestErrorMessage() {
    self.errorMessage = "";
    $element.find("#errorMessageDiv").hide();
  }

  function setCurrentUser(user) {
    self.currentUser = user;
  }

  function _getCurrentUser() {
    return self.currentUser;
  }

  function _registerRunner() {
    var defer = $q.defer();
    var errorCallbackRegisterTestRunner = function(response) {
      if (response.status == 404) {
        self.atflog("ClientTestRunnerAjax.registerTestRunner script include not found, registration skipped, " +
          "this client will not pick up Pick a Browser client tests.");
        if (defer)
          defer.resolve();
      } else {
        self.atflog(formatMessage(
          "ClientTestRunnerAjax.registerTestRunner unknown error, registration failed, http status {0}.",
          response.status));
        if (defer)
          defer.reject(self.messageMap[self.MESSAGE_KEY_REGISTER_RUNNER_ERROR]);
      }
    };
    var ga = new GlideAjax("ClientTestRunnerAjax");
    ga.addParam("sysparm_name", "registerTestRunner");
    ga.addParam("sysparm_atf_user_agent", navigator.userAgent);
    ga.addParam("sysparm_atf_agent_id", self.atfAgentSysId);
    ga.addParam("sysparm_user", self._getCurrentUser().user_sys_id);
    ga.setErrorCallback(errorCallbackRegisterTestRunner.bind(self));
    ga.getXMLAnswer(function registerRunnerResponseHandler(answer) {
      if (!answer) {
        defer.reject(self.messageMap[self.MESSAGE_KEY_REGISTER_RUNNER_ERROR]);
      } else {
        var testRunner = JSON.parse(answer);
        if (testRunner.id != self.atfAgentSysId) {
          self.atfAgentSysId = testRunner.id;
          self.AMBATFAgentChannelName = self.testInformation.registerAMBATFAgentForPage(self.atfAgentSysId);
          self.atflog("atf agent id has changed: " + self.atfAgentSysId);
        }
        defer.resolve();
      }
    });
    return defer.promise;
  }

  function setUpHeartbeat() {
    if (self.hasSetupHeartbeat)
      return $q.when();
    self.heartbeatIntervalId = setInterval(self.sendHeartbeat, self.heartbeatInterval);
    self.hasSetupHeartbeat = true;
    return $q.when();
  }

  function _findTestToRunByRunnerType() {
    if (self.isSchedulePluginActive && self.runScheduledTestsOnly)
      self._findScheduledTestToRun();
    else
      self.findTestToRun();
  }

  function _toggleFindTestInterval(doSetInterval) {
    if (self.findTestIntervalId) {
      window.clearInterval(self.findTestIntervalId);
      self.findTestIntervalId = null;
    }
    if (doSetInterval && self.clientConnected)
      self.findTestIntervalId = window.setInterval(self._findTestToRunByRunnerType, self.findTestInterval);
  }

  function sendHeartbeat() {
    var errorCallbackClientAjaxTestRunnerHeartbeat = function(response) {
      if (response.status == 404) {
        self.atflog("ClientTestRunnerAjax.testRunnerHeartbeat script include not found, heartbeat disabled, " +
          "this client will not update its online status with the server.");
        self._clearHeartbeatInterval();
      } else
        self.atflog(formatMessage(
          "ClientTestRunnerAjax.testRunnerHeartbeat unknown error, skipping heartbeat, http status {0}.",
          response.status));
    };
    var ga = new GlideAjax("ClientTestRunnerAjax");
    ga.addParam("sysparm_name", "testRunnerHeartbeat");
    ga.addParam("sysparm_atf_agent_id", self.atfAgentSysId);
    ga.setErrorCallback(errorCallbackClientAjaxTestRunnerHeartbeat.bind(self));
    ga.getXMLAnswer(function heartbeatResponse(answer) {
      if (answer) {
        var response = JSON.parse(answer);
        if (response.action == "DELETE") {
          self.testInformation.unsubscribeFromAMBChannels();
          self.afterAMBUnsubscribed(self.messageMap[self.MESSAGE_KEY_ATF_AGENT_DELETED]);
          self.clientConnected = false;
        } else if (response.action == "SESSION_CHANGE") {
          self.handleSessionChange(response);
        }
      }
    });
  }

  function handleSessionChange(response) {
    self.atflog("Test runner session has changed. Re-subscribing to amb channels");
    self.messageReference = response.sessionId;
    $q.when()
      .then(function() {
        if (self.original_user_id != response.user) {
          self.original_user_id = response.user;
          self.setupUserInfo();
        }
      })
      .then(function() {
        self._setupTestInformation();
        self._findTestToRunByRunnerType();
      });
  }

  function setTestStepStatusMessage(message) {
    self.testStepStatusMessage = message;
    self.atflog(message);
  }

  function openFormAndAssert(url, recordId, view, assertFrameLoaded) {
    assertFrameLoaded = (angular.isFunction(assertFrameLoaded)) ? assertFrameLoaded : defaultAssertFrameLoaded;
    var parentDefer = $q.defer();
    self.setiFrameOnloadFunction(whenFrameCleared);
    self.iFrame.src = "";
    return parentDefer.promise;

    function whenFrameCleared() {
      self.setiFrameOnloadFunction(assertFrameLoaded);
      var urlParameters = {};
      if (recordId)
        urlParameters["sys_id"] = recordId;
      urlParameters["sysparm_view"] = (view == null) ? "" : view.trim();
      urlParameters["sysparm_view_forced"] = "true";
      urlParameters["sysparm_atf_step_sys_id"] = self.currentStepResult.sys_atf_step_sys_id;
      urlParameters["sysparm_atf_test_result_sys_id"] = self.currentStepBatchResult.sys_atf_test_result_sys_id;
      urlParameters["sysparm_atf_debug"] = self.isDebugEnabled;
      self.atfFormInterceptor.interceptFormLoadURLWithRollbackContextId(urlParameters);
      self.atfFormInterceptor.interceptFormLoadURLWithTestRunnerIndicator(urlParameters);
      var completeUrl = url + ".do?" + $httpParamSerializer(urlParameters);
      var emptySrcLogFunc = (!self.frameWindow["console"]) ? console.log : self.frameWindow.console.log;
      self.iFrame.src = completeUrl;
      self.overwriteFrameFunctions(emptySrcLogFunc);
    }

    function defaultAssertFrameLoaded() {
      if (self.cleariFrameOnloadFunction)
        self.cleariFrameOnloadFunction();
      if (self._getFrameGForm()) {
        var openedFormTable = self._getFrameGForm().getTableName();
        if (openedFormTable == url) {
          if (view && view != self._getFrameGForm().getViewName()) {
            parentDefer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_FAIL_WRONG_VIEW],
              view, self._getFrameGForm().getViewName()));
            return;
          }
          if (self.frameWindow.CustomEvent)
            self.frameWindow.CustomEvent.observe('glideform:script_error', function(err) {
              console.error(err)
            });
          parentDefer.resolve();
        } else {
          parentDefer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_FAIL_WRONG_FORM],
            url, openedFormTable));
        }
      } else {
        parentDefer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_FAIL_INVALID_FORM], url));
      }
    }
  }

  function openPortalPage(portalUrlSfx, pageId, queryParams, waitTimeout) {
    var parentDefer = $q.defer();
    self.setiFrameOnloadFunction(whenFrameCleared);
    self.iFrame.src = "";
    return parentDefer.promise;

    function whenFrameCleared() {
      self.setiFrameOnloadFunction(defaultAssertFrameLoaded);
      var urlParameters = {};
      urlParameters["sysparm_atf_step_sys_id"] = self.currentStepResult.sys_atf_step_sys_id;
      urlParameters["sysparm_atf_test_result_sys_id"] = self.currentStepBatchResult.sys_atf_test_result_sys_id;
      urlParameters["sysparm_atf_debug"] = self.isDebugEnabled;
      urlParameters["v"] = 1;
      urlParameters["id"] = pageId;
      for (var p in queryParams) {
        if (queryParams.hasOwnProperty(p)) {
          urlParameters[p] = queryParams[p];
        }
      }
      self.atfFormInterceptor.interceptFormLoadURLWithRollbackContextId(urlParameters);
      self.atfFormInterceptor.interceptFormLoadURLWithTestRunnerIndicator(urlParameters);
      var completeUrl = "/" + portalUrlSfx + "?" + $httpParamSerializer(urlParameters);
      var emptySrcLogFunc = (!self.frameWindow["console"]) ? console.log : self.frameWindow.console.log;
      self.iFrame.src = completeUrl;
      self.overwriteFrameFunctions(emptySrcLogFunc);
    }

    function defaultAssertFrameLoaded() {
      if (self.cleariFrameOnloadFunction) {
        self.cleariFrameOnloadFunction();
      }
      var resolved = false;
      var triggerPortalPageLoaded = function() {
        parentDefer.resolve();
        resolved = true;
      };
      self._expose('triggerPortalPageLoaded', triggerPortalPageLoaded);
      $timeout(function() {
        if (!resolved) {
          parentDefer.reject();
        }
      }, waitTimeout);
    }
  }

  function openURL(url) {
    var stepId = self.currentStepResult.sys_atf_step_sys_id;
    var testResultId = self.currentStepBatchResult.sys_atf_test_result_sys_id;
    var rollbackContextId = self.atfFormInterceptor.getRollbackContextId();
    return ATFOpenURL.openURL(url, stepId, testResultId, self.isDebugEnabled, rollbackContextId);
  }

  function openCatalogItem(catItemId) {
    var parentDefer = $q.defer();
    self.setiFrameOnloadFunction(whenFrameCleared);
    self.iFrame.src = "";
    return parentDefer.promise;

    function whenFrameCleared() {
      self.setiFrameOnloadFunction(defaultAssertFrameLoaded);
      var urlParameters = {};
      urlParameters["sysparm_atf_step_sys_id"] = self.currentStepResult.sys_atf_step_sys_id;
      urlParameters["sysparm_atf_test_result_sys_id"] = self.currentStepBatchResult.sys_atf_test_result_sys_id;
      urlParameters["sysparm_atf_debug"] = self.isDebugEnabled;
      urlParameters["sysparm_id"] = catItemId;
      urlParameters["v"] = 1;
      self.atfFormInterceptor.interceptFormLoadURLWithRollbackContextId(urlParameters);
      self.atfFormInterceptor.interceptFormLoadURLWithTestRunnerIndicator(urlParameters);
      var completeUrl = "com.glideapp.servicecatalog_cat_item_view.do?" + $httpParamSerializer(urlParameters);
      var emptySrcLogFunc = (!self.frameWindow["console"]) ? console.log : self.frameWindow.console.log;
      self.iFrame.src = completeUrl;
      self.overwriteFrameFunctions(emptySrcLogFunc);
    }

    function defaultAssertFrameLoaded() {
      if (self.cleariFrameOnloadFunction)
        self.cleariFrameOnloadFunction();
      if (self._getFrameGForm()) {
        var openedCatItem = self._getFrameGForm().getUniqueValue();
        if (openedCatItem == catItemId) {
          if (self.frameWindow.CustomEvent)
            self.frameWindow.CustomEvent.observe('glideform:script_error', function(err) {
              console.error(err)
            });
          parentDefer.resolve();
        } else {
          parentDefer.reject(formatMessage(new GwtMessage().getMessage(self.messageMap[self.MESSAGE_KEY_FAIL_WRONG_CATALOG_ITEM]), catItemId, openedCatItem));
        }
      } else {
        parentDefer.reject(formatMessage(new GwtMessage().getMessage(self.messageMap[self.MESSAGE_KEY_FAIL_INVALID_ACCESS_CATALOG_ITEM]), catItemId));
      }
    }
  }

  function atflog(msg) {
    if (self.isDebugEnabled)
      console.log(msg);
    else {
      if (self._originalLogFunction.call)
        self._originalLogFunction.call(console, msg);
    }
  }

  function atflogDebug(msg) {
    if (self.isDebugEnabled)
      atflog("DEBUG " + msg);
  }

  function overwriteFrameFunctions(currFramesLogFunc) {
    var overwriteFuncIntvlId = setInterval(_overwriteFrameFunctions, 1);
    return overwriteFuncIntvlId;

    function _overwriteFrameFunctions() {
      if (!self.frameWindow["console"])
        return;
      var frameLog = self.frameWindow.console.log;
      if (currFramesLogFunc === frameLog)
        return;
      window.clearInterval(overwriteFuncIntvlId);
      self.frameWindow.alert = alert;
      self.frameWindow.confirm = confirm;
      self.frameWindow.prompt = prompt;
      self.frameWindow.console.log = console.log;
      self.frameWindow.console.error = console.error;
      self.frameWindow['onerror'] = function(msg) {
        console.error(msg);
      };
    }
  }

  function hidePreferences() {
    self.showPreferences = false;
    var preferencesTab = $element.find("#preferencesTab");
    preferencesTab.width("0");
    preferencesTab.css("visibility", "hidden");
  }

  function togglePreferences() {
    if (self.showPreferences)
      self.hidePreferences();
    else
      self.showPreferencesTab();
  }

  function showPreferencesTab() {
    self.showPreferences = true;
    var preferencesTab = $element.find("#preferencesTab");
    preferencesTab.width("340");
    preferencesTab.css("visibility", "visible");
  }

  function screenshotsModeChanged() {
    self.snNotification.show("info", self.screenshotsModeManager.getScreenshotsModeChangedMessage());
  }

  function _getFileNameNoExtension() {
    var fileEnding = (self.currentStepBatchResult.hasFailure == true) ? "_failed" : "";
    return "screenshot_" + self._getFileFormattedUTCNowDateTime() + fileEnding;
  }

  function togglePreferencesDropdown() {
    if (!self.lockDownScreenshotModesWhileRunningTest)
      return;
    var screenshotsModeDropdown = $element.find("#screenshotOptions");
    if (self.isRunningTest) {
      screenshotsModeDropdown.addClass("disabled");
      screenshotsModeDropdown.attr("disabled", "disabled");
    } else {
      screenshotsModeDropdown.removeClass("disabled");
      screenshotsModeDropdown.removeAttr("disabled");
    }
  }

  function _setupScheduledTests() {
    if (!self.isSchedulePluginActive)
      return;
    if (!self.runScheduledTestsOnly)
      return;
    return _ajaxToggleRunnerType('scheduled');
  }

  function toggleRunScheduledTestsOnly() {
    var newCheckedValue = document.getElementById("runScheduledTestsOnlyMode").checked;
    _resetRunScheduledTestsOnlyValue(!newCheckedValue);
    if (self.isRunningTest) {
      self.snNotification.show("info", formatMessage(self.messageMap[self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING]));
      return;
    }
    var confirmationTitle;
    var confirmationMsg;
    var newRunnerType;
    if (newCheckedValue) {
      confirmationTitle = self.messageMap[self.MESSAGE_KEY_SCHED_RUN_SCHEDULED_TESTS_ONLY];
      confirmationMsg = self.messageMap[self.MESSAGE_KEY_CONFIRM_SCHEDULE_SETUP];
      newRunnerType = 'scheduled';
    } else {
      confirmationTitle = self.messageMap[self.MESSAGE_KEY_SCHED_RUN_MANUAL_TESTS_ONLY];
      confirmationMsg = self.messageMap[self.MESSAGE_KEY_CONFIRM_SCHEDULE_TEARDOWN];
      newRunnerType = 'manual';
    }
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dialog = new dialogClass('glide_confirm_standard');
    dialog.setTitle(confirmationTitle);
    dialog.setPreference('warning', true);
    dialog.setPreference('title', confirmationMsg);
    dialog.setPreference('defaultButton', 'ok_button');
    dialog.setPreference('focusTrap', true);
    dialog.setPreference("onPromptComplete", function() {
      if (self.isRunningTest) {
        self.snNotification.show("info", formatMessage(self.messageMap[self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING]));
        return;
      }
      _ajaxToggleRunnerType(newRunnerType);
    });
    dialog.render();
  }

  function _setControllerStateIsRunningTest(isRunningTest) {
    self.isRunningTest = isRunningTest;
    self._toggleFindTestInterval(!isRunningTest);
    self.togglePreferencesDropdown();
  }

  function _ajaxToggleRunnerType(newRunnerType) {
    self._setControllerStateIsRunningTest(true);
    var errorCallbackToggleATFAgentType = function(response) {
      self.atflog(formatMessage(
        "ScheduledTestProcessor.toggleATFAgentType unknown error, failed to toggle runner type, http status {0}.",
        response.status));
      self._setControllerStateIsRunningTest(false);
      if (toggleDefer)
        return toggleDefer.reject();
    };
    var toggleDefer = $q.defer();
    var ga = new GlideAjax("ScheduledTestProcessor");
    ga.addParam("sysparm_ajax_processor_type", "toggleATFAgentType");
    ga.addParam("sysparm_ajax_new_runner_type", newRunnerType);
    ga.addParam("sysparm_atf_agent_id", self.atfAgentSysId);
    ga.setErrorCallback(errorCallbackToggleATFAgentType.bind(self));
    ga.getXMLAnswer(toggleATFAgentTypeResponse);
    return toggleDefer.promise;

    function toggleATFAgentTypeResponse(response) {
      var responseObject = JSON.parse(response);
      if (responseObject && responseObject.hasOwnProperty("status") && responseObject.status === "success") {
        self.atflog(responseObject.message);
        if (newRunnerType === 'manual') {
          $element.find("#pinnedToScheduleNotification").hide();
          self.AMBChannelName = testInformation.registerAMBForPage(self.messageReference);
          self.runScheduledTestsOnly = false;
        } else if (newRunnerType === 'scheduled') {
          $element.find("#pinnedToScheduleNotification").show();
          self.AMBChannelName = testInformation.registerAMBForPage("schedule");
          self.runScheduledTestsOnly = true;
        }
        _addRemoveScheduleURLParam(newRunnerType);
        self._setControllerStateIsRunningTest(false);
        return toggleDefer.resolve();
      } else {
        responseObject ? self.atflog(responseObject.message) : self.atflog("Invalid response object when toggling ATF Agent between scheduled/manual execution");
        if (newRunnerType === 'manual') {
          self.snNotification.show("error", formatMessage(self.messageMap[self.MESSAGE_KEY_MANUAL_SETUP_FAILED]));
          _resetRunScheduledTestsOnlyValue(true);
        } else if (newRunnerType === 'scheduled') {
          self.snNotification.show("error", formatMessage(self.messageMap[self.MESSAGE_KEY_SCHEDULE_SETUP_FAILED]));
          _resetRunScheduledTestsOnlyValue(false);
        }
        self._setControllerStateIsRunningTest(false);
        return toggleDefer.reject();
      }
    }
  }

  function _addRemoveScheduleURLParam(newRunnerType) {
    var url = new GlideURL(window.location.href);
    if (newRunnerType === 'manual')
      url.deleteParam('sysparm_scheduled_tests_only');
    else if (newRunnerType === 'scheduled')
      url.addParam('sysparm_scheduled_tests_only', 'true');
    if (window.history && window.history.replaceState)
      window.history.replaceState({}, "", url.getURL());
    else
      self.atflog("Not rewriting scheduled tests URL param, history.replaceState is not valid");
  }

  function _resetRunScheduledTestsOnlyValue(value) {
    self.runScheduledTestsOnly = value;
    document.getElementById("runScheduledTestsOnlyMode").checked = value;
  }

  function _clearHeartbeatInterval() {
    if (self.hasSetupHeartbeat) {
      clearInterval(self.heartbeatIntervalId);
      self.hasSetupHeartbeat = false;
    }
  }

  function sendATFEvent(eventCategory, eventName) {
    if (GlideWebAnalytics && GlideWebAnalytics.trackEvent) {
      try {
        GlideWebAnalytics.trackEvent('com.glide.automated_testing_framework', eventCategory, eventName);
      } catch (e) {
        console.log('Failed to send ATF analytic event: ' + eventName);
        console.log(e);
      }
    }
  }

  function _initializeDefaultStates() {
    self.atflog("testRunner configuration on page load:");
    if (typeof sys_atf_message_reference != 'undefined')
      self.messageReference = sys_atf_message_reference;
    self.atflog("testRunner.messageReference: " + self.messageReference);
    if (typeof sys_atf_step_delay != 'undefined')
      self.delayBetweenSteps = sys_atf_step_delay;
    self.atflog("testRunner.delayBetweenSteps: " + self.delayBetweenSteps + " milliseconds");
    if (typeof sys_atf_debug_enabled != 'undefined')
      self.isDebugEnabled = sys_atf_debug_enabled;
    self.atflog("testRunner.isDebugEnabled: " + self.isDebugEnabled);
    new GUITestingUtil().getGAutomate().setDebug(self.isDebugEnabled);
    if (typeof sys_atf_screenshots_mode != 'undefined')
      self.screenshotsModeManager.setScreenshotsModeByValue(sys_atf_screenshots_mode);
    self.atflog("testRunner.screenshotsModeManager.currentMode.value: " + self.screenshotsModeManager.getCurrentModeValue());
    if (typeof sys_atf_screenshots_quality != 'undefined')
      self.screenshotsQuality = sys_atf_screenshots_quality;
    self.atflog("testRunner.screenshotsQuality: " + self.screenshotsQuality + "%");
    if (typeof atf_agent_sys_id != 'undefined')
      self.atfAgentSysId = atf_agent_sys_id;
    self.atflog("testRunner.atfAgentSysId: " + self.atfAgentSysId);
    if (typeof atf_runner_heartbeat_interval_seconds != 'undefined')
      self.heartbeatInterval = atf_runner_heartbeat_interval_seconds * 1000;
    self.atflog("testRunner.heartbeatInterval: " + (self.heartbeatInterval / 1000) + " seconds");
    if (typeof atf_runner_find_test_interval_seconds != 'undefined')
      self.findTestInterval = atf_runner_find_test_interval_seconds * 1000;
    self.atflog("testRunner.findTestInterval: " + (self.findTestInterval / 1000) + " seconds");
    if (typeof is_schedule_plugin_active != 'undefined')
      self.isSchedulePluginActive = is_schedule_plugin_active;
    self.atflog("testRunner.isSchedulePluginActive: " + self.isSchedulePluginActive);
    if (typeof run_scheduled_tests_only != 'undefined')
      self.runScheduledTestsOnly = run_scheduled_tests_only;
    self.atflog("testRunner.runScheduledTestsOnly: " + self.runScheduledTestsOnly);
    if (typeof window['screenshot_timeout_seconds'] !== 'undefined')
      self.screenshotTimeoutSeconds = window['screenshot_timeout_seconds'];
    self.atflog("testRunner.screenshotTimeoutSeconds: " + self.screenshotTimeoutSeconds + " seconds");
    if (typeof lock_screenshot_modes_while_running_test != 'undefined')
      self.lockDownScreenshotModesWhileRunningTest = lock_screenshot_modes_while_running_test;
    self.atflog("testRunner.lockDownScreenshotModesWhileRunningTest: " + self.lockDownScreenshotModesWhileRunningTest);
    if (typeof window['g_automate_wait_timeout'] !== 'undefined')
      self.gAutomateWaitTimeoutSeconds = window['g_automate_wait_timeout'];
    self.atflog("testRunner.gAutomateWaitTimeoutSeconds: " + self.gAutomateWaitTimeoutSeconds + " seconds");
  }
  self._expose = function(fnName, fn) {
    var frameWin = self.iFrame.contentWindow || self.iFrame;
    frameWin.ATF = frameWin.ATF || {};
    frameWin.ATF[fnName] = fn;
  };
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snClientErrorHandler.js */
angular
  .module('sn.testRunner')
  .factory('ClientErrorHandler', ClientErrorHandler);
ClientErrorHandler.$inject = ['$http', '$q'];

function ClientErrorHandler($http, $q) {
  'use strict';

  function ClientJavaScriptError() {}
  ClientJavaScriptError.prototype = {
    errorMessage: '',
    reportLevel: '',
    table: '',
    sysId: '',
    formType: '',
    uiPage: '',
    isUnknown: function() {
      return this.reportLevel === 'unknown';
    },
    isWarning: function() {
      return this.reportLevel === 'warning';
    },
    isFailure: function() {
      return this.reportLevel === 'failure';
    },
    isIgnored: function() {
      return this.reportLevel === 'ignored';
    }
  };
  var clientErrorHandler = {
    _isValid: true,
    _whitelistedClientErrors: [],
    populateActiveErrors: populateActiveErrors,
    getErrorType: getErrorType,
    _isStale: true,
    isStale: isStale,
    setStale: setStale,
    _resetPopulateActiveErrorsRetries: _resetPopulateActiveErrorsRetries,
    _MAX_TRIES: 5,
    _totalTries: 0,
    _populateActiveErrorsRetries: 0,
    _REQUEST: "/api/now/table/sys_atf_whitelist?sysparm_query=active%3Dtrue&sysparm_fields=error_message%2Creport_level%2Csys_id"
  };
  return clientErrorHandler;

  function populateActiveErrors() {
    if (!clientErrorHandler._isValid) {
      jslog("ClientErrorHandler has invalid state, check access to Whitelisted Client Errors table and refresh Client Test Runner");
      return $q.when(false);
    }
    var populateActiveErrorsPromise = Promise.reject();
    for (var i = 0; i < clientErrorHandler._MAX_TRIES; i++) {
      populateActiveErrorsPromise = populateActiveErrorsPromise.catch(getWBE).catch(processAttemptError);
    }
    populateActiveErrorsPromise = populateActiveErrorsPromise.then(processResult).catch(processFinalAttemptError);

    function getWBE() {
      return $http.get(clientErrorHandler._REQUEST, {
        cache: false
      });
    }

    function processFinalAttemptError() {
      jslog(formatMessage("ClientErrorHandler failed to access Whitelisted Client Errors table after {0} tries, continuing",
        clientErrorHandler._populateActiveErrorsRetries));
      clientErrorHandler._resetPopulateActiveErrorsRetries();
      return $q.when(false);
    }

    function processAttemptError() {
      var defer = $q.defer();
      if (++clientErrorHandler._populateActiveErrorsRetries !== clientErrorHandler._MAX_TRIES) {
        jslog(formatMessage("ClientErrorHandler failed to access Whitelisted Client Errors table {0} time(s), trying again",
          clientErrorHandler._populateActiveErrorsRetries));
      }
      clientErrorHandler._totalTries++;
      setTimeout(function() {
        defer.reject();
      }, 1000);
      return defer.promise;
    }

    function processResult(response) {
      clientErrorHandler._whitelistedClientErrors = response.data.result;
      clientErrorHandler._isStale = false;
      clientErrorHandler._resetPopulateActiveErrorsRetries();
    }
    return populateActiveErrorsPromise;
  }

  function getErrorType(errorMessage, atflog) {
    function findError(error) {
      return errorMessage.indexOf(error['error_message']) !== -1;
    }
    var whitelistedError = clientErrorHandler._whitelistedClientErrors.find(findError);
    var clientJavaScriptError = new ClientJavaScriptError();
    if (typeof whitelistedError === 'undefined') {
      atflog('Unknown client error found: ' + errorMessage);
      clientJavaScriptError.reportLevel = 'unknown';
      return clientJavaScriptError;
    } else {
      atflog('Whitelisted client error found: ' + errorMessage);
      clientJavaScriptError.errorMessage = whitelistedError['error_message'];
      clientJavaScriptError.reportLevel = whitelistedError['report_level'];
      clientJavaScriptError.sysId = whitelistedError['sys_id'];
      return clientJavaScriptError;
    }
  }

  function isStale() {
    return clientErrorHandler._isStale;
  }

  function setStale(bool) {
    clientErrorHandler._isStale = bool;
  }

  function _resetPopulateActiveErrorsRetries() {
    clientErrorHandler._populateActiveErrorsRetries = 0;
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snStepConfig.js */
angular
  .module('sn.testRunner')
  .factory('StepConfig', StepConfig);
StepConfig.$inject = ['$http', '$q'];

function StepConfig($http) {
  'use strict';
  var stepConfig = {
    configs: {},
    getActiveConfigs: getActiveConfigs,
    _configsLoaded: false
  };
  return stepConfig;

  function getActiveConfigs() {
    return $http.get("/api/now/table/sys_atf_step_config?" +
        "sysparm_query=active%3Dtrue&" +
        "sysparm_fields=step_config%2Cicon%2Cdescription%2Csys_id%2Csys_name%2Cstep_env%2Cstep_execution_generator%2Cname", {
          cache: false
        })
      .then(getAllActiveConfigsComplete);

    function getAllActiveConfigsComplete(response) {
      var self = stepConfig;
      var results = response.data.result;
      results.forEach(function(result) {
        self.configs[result.sys_id] = result;
      });
      self._configsLoaded = true;
      return self.configs;
    }
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snImpersonationHandler.js */
angular
  .module('sn.testRunner')
  .factory('ImpersonationHandler', ImpersonationHandler);
ImpersonationHandler.$inject = ['$http', '$q'];

function ImpersonationHandler($http, $q) {
  'use strict';
  var self = {
    impersonate: impersonate,
    unimpersonate: unimpersonate,
    getUserInfo: getUserInfo,
    _impersonateResponse200: _impersonateResponse200,
    _unimpersonateResponse200: _unimpersonateResponse200,
    _errorCallbackImpersonate: _errorCallbackImpersonate,
    _errorCallbackUnimpersonate: _errorCallbackUnimpersonate,
    _resetImpersonationRetries: _resetImpersonationRetries,
    _resetUnimpersonationRetries: _resetUnimpersonationRetries,
    _impersonateAjax: null,
    _unImpersonateAjax: null,
    _MAX_RETRIES: 3,
    _impersonateHttpErrorRetries: 0,
    _unImpersonateHttpErrorRetries: 0
  };
  return self;

  function getUserInfo(userId) {
    return $http.get("/api/now/ui/user/" + userId).then(function(response) {
      return response.data.result;
    });
  }

  function impersonate(impersonatingUser, stepEvent) {
    if (!impersonatingUser || !impersonatingUser.user_sys_id)
      return $q.when();
    var impersonateDefer = $q.defer();
    self._impersonateAjax = new GlideAjax('TestExecutorAjax');
    self._impersonateAjax.addParam('sysparm_name', 'impersonate');
    self._impersonateAjax.addParam('sysparm_impersonating_user', impersonatingUser.user_sys_id);
    self._impersonateAjax.setErrorCallback(self._errorCallbackImpersonate.bind(self), null,
      [impersonatingUser, stepEvent, impersonateDefer]);
    self._impersonateAjax.getXMLAnswer(self._impersonateResponse200.bind(self), null,
      [impersonatingUser, stepEvent, impersonateDefer]);
    return impersonateDefer.promise;
  }

  function unimpersonate(executingUser, stepEvent) {
    if (!executingUser || !executingUser.user_sys_id)
      return $q.when();
    var unimpersonateDefer = $q.defer();
    self._unImpersonateAjax = new GlideAjax('TestExecutorAjax');
    self._unImpersonateAjax.addParam('sysparm_name', 'unimpersonate');
    self._unImpersonateAjax.setErrorCallback(self._errorCallbackUnimpersonate.bind(self), null,
      [executingUser, stepEvent, unimpersonateDefer]);
    self._unImpersonateAjax.getXMLAnswer(self._unimpersonateResponse200.bind(self), null,
      [executingUser, stepEvent, unimpersonateDefer]);
    return unimpersonateDefer.promise;
  }

  function _impersonateResponse200(response, responseParams) {
    var impersonatingUser = responseParams[0];
    var stepEvent = responseParams[1];
    var impersonateDefer = responseParams[2];
    self._resetImpersonationRetries();
    if (response == impersonatingUser.user_sys_id) {
      jslog(formatMessage("Impersonation successful in the UI session. Impersonated user: {0}", impersonatingUser.user_name));
      impersonateDefer.resolve();
    } else {
      stepEvent.object = "Error impersonating the user " + impersonatingUser.user_name;
      impersonateDefer.reject();
    }
  }

  function _unimpersonateResponse200(response, responseParams) {
    var executingUser = responseParams[0];
    var stepEvent = responseParams[1];
    var unimpersonateDefer = responseParams[2];
    self._resetUnimpersonationRetries();
    if (response == executingUser.user_sys_id) {
      jslog("Successfully ended impersonation in the UI session");
      unimpersonateDefer.resolve();
    } else {
      stepEvent.object = "Error ending impersonation in the UI session";
      unimpersonateDefer.reject();
    }
  }

  function _errorCallbackImpersonate(response, responseParams) {
    var impersonatingUser = responseParams[0];
    var stepEvent = responseParams[1];
    var impersonateDefer = responseParams[2];
    if (self._impersonateHttpErrorRetries++ === self._MAX_RETRIES) {
      stepEvent.object = formatMessage("Error impersonating the user {0} after {1} tries, http status {2}",
        impersonatingUser.user_name, self._impersonateHttpErrorRetries, response.status);
      self._resetImpersonationRetries();
      if (impersonateDefer)
        impersonateDefer.reject();
    } else {
      jslog(formatMessage("Impersonation: failed {0} time(s) to impersonate user: {1}, http status {2}, trying again",
        self._impersonateHttpErrorRetries, impersonatingUser.user_name, response.status));
      self._impersonateAjax.getXMLAnswer(self._impersonateResponse200.bind(self), null,
        [impersonatingUser, stepEvent, impersonateDefer]);
    }
  }

  function _errorCallbackUnimpersonate(response, responseParams) {
    var executingUser = responseParams[0];
    var stepEvent = responseParams[1];
    var unimpersonateDefer = responseParams[2];
    if (self._unImpersonateHttpErrorRetries++ === self._MAX_RETRIES) {
      stepEvent.object = formatMessage("Error ending impersonation in the client session after {0} tries, http status {1}",
        self._unImpersonateHttpErrorRetries, response.status);
      self._resetUnimpersonationRetries();
      if (unimpersonateDefer)
        unimpersonateDefer.reject();
    } else {
      jslog(formatMessage("Unimpersonation: failed {0} time(s) to return to user: {1}, http status {2}, trying again",
        self._unImpersonateHttpErrorRetries, executingUser.user_name, response.status));
      self._unImpersonateAjax.getXMLAnswer(self._unimpersonateResponse200.bind(self), null,
        [executingUser, stepEvent, unimpersonateDefer]);
    }
  }

  function _resetImpersonationRetries() {
    self._impersonateHttpErrorRetries = 0;
  }

  function _resetUnimpersonationRetries() {
    self._unImpersonateHttpErrorRetries = 0;
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snReportUITestProgressHandler.js */
angular
  .module('sn.testRunner')
  .factory('ReportUITestProgressHandler', ReportUITestProgressHandler);
ReportUITestProgressHandler.$inject = ['$q'];

function ReportUITestProgressHandler($q) {
  'use strict';
  var self = {
    reportUIStepProgress: reportUIStepProgress,
    reportUIBatchResult: reportUIBatchResult,
    reportUIBatchResultSynchronously: reportUIBatchResultSynchronously,
    reportStepProgressSynchronously: reportStepProgressSynchronously,
    _reportStepProgressAjax: null,
    _errorCallbackReportStepProgress: _errorCallbackReportStepProgress,
    _handleReportStepProgressResponse200: _handleReportStepProgressResponse200,
    _resetReportStepProgressRetries: _resetReportStepProgressRetries,
    _reportStepProgressErrorRetries: 0,
    _reportBatchResultAjax: null,
    _errorCallbackReportBatchResult: _errorCallbackReportBatchResult,
    _handleReportBatchResultResponse200: _handleReportBatchResultResponse200,
    _resetReportBatchResultRetries: _resetReportBatchResultRetries,
    _MAX_RETRIES: 600,
    _reportBatchResultErrorRetries: 0
  };
  return self;

  function reportUIStepProgress(batch,
    indexOfNextStep,
    currentStepBatchResult,
    currentStepResult,
    atfAgentSysId) {
    var reportStepProgressDefer = $q.defer();
    self._reportStepProgressAjax = new GlideAjax('ReportUITestProgress');
    self._reportStepProgressAjax.addParam('sysparm_name', 'reportStepProgress');
    self._reportStepProgressAjax.addParam('sysparm_batch_execution_tracker_sys_id', batch['tracker_sys_id']);
    self._reportStepProgressAjax.addParam('sysparm_next_step_index', indexOfNextStep);
    self._reportStepProgressAjax.addParam('sysparm_batch_length', batch['sys_atf_steps'] ? batch['sys_atf_steps'].length : 0);
    self._reportStepProgressAjax.addParam('sysparm_test_result_sys_id', currentStepBatchResult['sys_atf_test_result_sys_id']);
    self._reportStepProgressAjax.addParam('sysparm_step_result', currentStepResult);
    self._reportStepProgressAjax.addParam('sysparm_atf_agent_sys_id', atfAgentSysId);
    self._reportStepProgressAjax.setErrorCallback(self._errorCallbackReportStepProgress.bind(self));
    self._reportStepProgressAjax.getXMLAnswer(self._handleReportStepProgressResponse200.bind(self), null, [reportStepProgressDefer]);
    return reportStepProgressDefer.promise;
  }

  function reportUIBatchResult(stringifiedTestResults, testResultSysId, trackerSysId, atfAgentSysId, failedToReportStep) {
    var reportDefer = $q.defer();
    self._reportBatchResultAjax = new GlideAjax('ReportUITestProgress');
    self._reportBatchResultAjax.addParam('sysparm_name', 'reportBatchResult');
    self._reportBatchResultAjax.addParam('sysparm_test_result', stringifiedTestResults);
    self._reportBatchResultAjax.addParam('sysparm_test_result_sys_id', testResultSysId);
    self._reportBatchResultAjax.addParam('sysparm_batch_tracker_sys_id', trackerSysId);
    self._reportBatchResultAjax.addParam('sysparm_atf_agent_sys_id', atfAgentSysId);
    self._reportBatchResultAjax.addParam('sysparm_failed_to_report_step', failedToReportStep);
    self._reportBatchResultAjax.setErrorCallback(self._errorCallbackReportBatchResult.bind(self));
    self._reportBatchResultAjax.getXMLAnswer(self._handleReportBatchResultResponse200.bind(self), null, [reportDefer]);
    return reportDefer.promise;
  }

  function reportUIBatchResultSynchronously(stringifiedTestResults, testResultSysId, trackerSysId, atfAgentSysId) {
    var ga = new GlideAjax('ReportUITestProgress');
    ga.addParam('sysparm_name', 'reportBatchResult');
    ga.addParam('sysparm_test_result', stringifiedTestResults);
    ga.addParam('sysparm_test_result_sys_id', testResultSysId);
    ga.addParam('sysparm_batch_tracker_sys_id', trackerSysId);
    ga.addParam('sysparm_atf_agent_sys_id', atfAgentSysId);
    ga.getXMLWait();
  }

  function reportStepProgressSynchronously(stringifiedStepResult, trackerId, currStepIndex, batchLength, testResultId, atfAgentSysId) {
    var ga = new GlideAjax('ReportUITestProgress');
    ga.addParam('sysparm_name', 'reportStepProgress');
    ga.addParam('sysparm_step_result', stringifiedStepResult);
    ga.addParam('sysparm_batch_execution_tracker_sys_id', trackerId);
    ga.addParam('sysparm_next_step_index', currStepIndex + 1);
    ga.addParam('sysparm_batch_length', batchLength);
    ga.addParam('sysparm_test_result_sys_id', testResultId);
    ga.addParam('sysparm_atf_agent_sys_id', atfAgentSysId);
    ga.getXMLWait();
  }

  function _errorCallbackReportStepProgress(response, responseParams) {
    var reportDefer = responseParams[0];
    if (!response || !response.status)
      response = {
        status: "UNKNOWN"
      };
    if (self._reportStepProgressErrorRetries++ === self._MAX_RETRIES) {
      jslog(formatMessage("ReportUITestProgress.reportStepProgress: Error reporting step progress after {0} tries, http status {1}",
        self._reportStepProgressErrorRetries, response.status));
      self._resetReportStepProgressRetries();
      if (reportDefer)
        reportDefer.reject();
    } else {
      jslog(formatMessage("ReportUITestProgress.reportStepProgress: failed {0} time(s) to report step progress, http status {1}, trying again",
        self._reportStepProgressErrorRetries, response.status));
      window.setTimeout(function retryReportStepProgressInOneSecond() {
        self._reportStepProgressAjax.getXMLAnswer(self._handleReportStepProgressResponse200.bind(self), null,
          [reportDefer]);
      }, 1000);
    }
  }

  function _handleReportStepProgressResponse200(response, responseParams) {
    var reportStepProgressDefer = responseParams[0];
    var responseObject = JSON.parse(response);
    self._resetReportStepProgressRetries();
    if (!responseObject || !responseObject['report_step_progress_success']) {
      jslog("ReportUITestProgress.reportStepProgress: unable to update step result record");
      reportStepProgressDefer.resolve();
    } else if (responseObject['cancel_request_received']) {
      jslog("ReportUITestProgress.reportStepProgress: test has received cancellation request");
      reportStepProgressDefer.reject({
        cancel: true
      });
    } else
      reportStepProgressDefer.resolve();
  }

  function _errorCallbackReportBatchResult(response, responseParams) {
    var reportDefer = responseParams[0];
    if (self._reportBatchResultErrorRetries++ === self._MAX_RETRIES) {
      jslog(formatMessage("ReportUITestProgress.reportBatchResult: Error reporting batch result after {0} tries, http status {1}",
        self._reportBatchResultErrorRetries, response.status));
      self._resetReportBatchResultRetries();
      if (reportDefer)
        reportDefer.reject();
    } else {
      jslog(formatMessage("ReportUITestProgress.reportBatchResult: failed {0} time(s) to report batch result, http status {1}, trying again",
        self._reportBatchResultErrorRetries, response.status));
      window.setTimeout(function retryReportBatchResultInOneSecond() {
        self._reportBatchResultAjax.getXMLAnswer(self._handleReportBatchResultResponse200.bind(self), null,
          [reportDefer]);
      }, 1000);
    }
  }

  function _handleReportBatchResultResponse200(response, responseParams) {
    var reportDefer = responseParams[0];
    var responseObject = JSON.parse(response);
    self._resetReportBatchResultRetries();
    if (responseObject && responseObject.hasOwnProperty("status"))
      if (responseObject.status === 'error')
        jslog("ReportUITestProgress: Error: " + responseObject.message);
      else
        jslog("ReportUITestProgress: Test Result reported to sys_atf_test_result.sys_id: " + responseObject.message);
    else if (response && response.status)
      jslog(formatMessage("ReportUITestProgress: invalid response, http status {0}, response: {1}", response.status, response));
    reportDefer.resolve();
  }

  function _resetReportStepProgressRetries() {
    self._reportStepProgressErrorRetries = 0;
  }

  function _resetReportBatchResultRetries() {
    self._reportBatchResultErrorRetries = 0;
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snScreenshotsModeManager.js */
angular.module("sn.testRunner")
  .factory("ScreenshotsModeManager", ScreenshotsModeManager);

function ScreenshotsModeManager() {
  'use strict';
  var SCREENSHOTS_MODE_ENABLED = "enabledAll";
  var SCREENSHOTS_MODE_ENABLED_FOR_FAILING_STEP = "enabledFailedSteps";
  var SCREENSHOTS_DISABLED = "disabled";
  var MODE_LABEL_0_ENABLE_FOR_ALL_STEPS = "Enable for all steps";
  var MODE_LABEL_1_ENABLE_FOR_FAILED_STEPS = "Enable for failed steps";
  var MODE_LABEL_2_DIABLE_FOR_ALL_STEPS = "Disable for all steps";
  var MODE_CHANGE_MSG_0_MESSAGE_DISABLED = "Screenshots disabled";
  var MODE_CHANGE_MSG_1_MESSAGE_ENABLED_ALL = "Screenshots enabled for all steps";
  var MODE_CHANGE_MSG_2_MESSAGE_ENABLED_FAILED_STEPS = "Screenshots enabled for failing steps";
  var _messageMap = new GwtMessage().getMessages([
    MODE_LABEL_0_ENABLE_FOR_ALL_STEPS, MODE_LABEL_1_ENABLE_FOR_FAILED_STEPS, MODE_LABEL_2_DIABLE_FOR_ALL_STEPS,
    MODE_CHANGE_MSG_0_MESSAGE_DISABLED, MODE_CHANGE_MSG_1_MESSAGE_ENABLED_ALL,
    MODE_CHANGE_MSG_2_MESSAGE_ENABLED_FAILED_STEPS
  ]);
  var modes = [{
      name: _messageMap[MODE_LABEL_0_ENABLE_FOR_ALL_STEPS],
      value: SCREENSHOTS_MODE_ENABLED
    },
    {
      name: _messageMap[MODE_LABEL_1_ENABLE_FOR_FAILED_STEPS],
      value: SCREENSHOTS_MODE_ENABLED_FOR_FAILING_STEP
    },
    {
      name: _messageMap[MODE_LABEL_2_DIABLE_FOR_ALL_STEPS],
      value: SCREENSHOTS_DISABLED
    }
  ];
  return {
    setScreenshotsModeByValue: setScreenshotsModeByValue,
    shouldSkipScreenshot: shouldSkipScreenshot,
    getScreenshotsModeChangedMessage: getScreenshotsModeChangedMessage,
    getCurrentModeValue: getCurrentModeValue,
    currentMode: modes[0],
    modes: modes
  };

  function setScreenshotsModeByValue(screenshotsMode) {
    if (null != screenshotsMode) {
      for (var i = 0; i < modes.length; i++) {
        var mode = modes[i];
        if (screenshotsMode == mode.value) {
          this.currentMode = mode;
          break;
        }
      }
    }
  }

  function shouldSkipScreenshot(stepResult) {
    if (this.currentMode.value == SCREENSHOTS_MODE_ENABLED ||
      (this.currentMode.value == SCREENSHOTS_MODE_ENABLED_FOR_FAILING_STEP && stepResult && !stepResult.success))
      return false;
    return true;
  }

  function getScreenshotsModeChangedMessage() {
    if (this.currentMode.value == SCREENSHOTS_DISABLED)
      return _messageMap[MODE_CHANGE_MSG_0_MESSAGE_DISABLED];
    if (this.currentMode.value == SCREENSHOTS_MODE_ENABLED)
      return _messageMap[MODE_CHANGE_MSG_1_MESSAGE_ENABLED_ALL];
    return _messageMap[MODE_CHANGE_MSG_2_MESSAGE_ENABLED_FAILED_STEPS];
  }

  function getCurrentModeValue() {
    return this.currentMode.value;
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snTestInformation.js */
angular
  .module('sn.testRunner')
  .factory('TestInformation', TestInformation);
TestInformation.$inject = ['$rootScope', '$http', '$q', 'ATFConnectionService'];

function TestInformation($rootScope, $http, $q, atfConnectionService) {
  'use strict';
  var testInformation = {
    registerAMBForPage: registerAMBForPage,
    registerAMBStepConfigForPage: registerAMBStepConfigForPage,
    registerAMBWhitelistedClientErrorForPage: registerAMBWhitelistedClientErrorForPage,
    registerAMBATFAgentForPage: registerAMBATFAgentForPage,
    enableDebug: enableDebug,
    unsubscribeFromAMBChannels: unsubscribeFromAMBChannels
  };
  activate();
  return testInformation;

  function activate() {
    testInformation.isDebugEnabled = false;
  }

  function registerAMBForPage(messageReference) {
    return atfConnectionService.subscribeToTestResultChannel(testInformation.isDebugEnabled, messageReference);
  }

  function registerAMBStepConfigForPage() {
    return atfConnectionService.subscribeToStepConfigChannel(testInformation.isDebugEnabled);
  }

  function registerAMBWhitelistedClientErrorForPage() {
    return atfConnectionService.subscribeToWhitelistedClientErrorChannel(testInformation.isDebugEnabled);
  }

  function registerAMBATFAgentForPage(atfAgentSysId) {
    return atfConnectionService.subscribeToATFAgentChannel(testInformation.isDebugEnabled, atfAgentSysId);
  }

  function enableDebug(shouldEnable) {
    testInformation.isDebugEnabled = shouldEnable;
  }

  function unsubscribeFromAMBChannels() {
    atfConnectionService.unsubscribeFromAllChannels();
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snConnectionStatusHelper.js */
angular.module("sn.testRunner")
  .factory("ConnectionStatusHelper", function() {
    'use strict';
    var _STATUS_KEY_CONNECTED = "Connected";
    var _STATUS_KEY_DISCONNECTED = "Disconnected";
    var _i18nStatusMap = new GwtMessage().getMessages([_STATUS_KEY_CONNECTED, _STATUS_KEY_DISCONNECTED]);
    return {
      LOCAL_CONNECTION_CHANGE_EVENTS: [
        "TestInformation.AMBConnectionInitialized",
        "TestInformation.AMBConnectionOpened",
        "TestInformation.AMBConnectionBroken",
        "TestInformation.AMBConnectionClosed"
      ],
      buildConnectionStatus: function(ambEmitEventMessageType) {
        return this._buildConnectionStatusByEvent(ambEmitEventMessageType);
      },
      _buildConnectionStatus: function(isConnected, statusMapKey) {
        return {
          connected: isConnected,
          status: _i18nStatusMap[statusMapKey]
        };
      },
      _buildConnectionStatusByEvent: function(ambEmitEventMessageType) {
        switch (ambEmitEventMessageType) {
          case this.LOCAL_CONNECTION_CHANGE_EVENTS[0]:
          case this.LOCAL_CONNECTION_CHANGE_EVENTS[1]:
            return this._buildConnectionStatus(true, _STATUS_KEY_CONNECTED);
          case this.LOCAL_CONNECTION_CHANGE_EVENTS[2]:
          case this.LOCAL_CONNECTION_CHANGE_EVENTS[3]:
          default:
            return this._buildConnectionStatus(false, _STATUS_KEY_DISCONNECTED);
        }
      }
    }
  });;
/*! RESOURCE: /scripts/app.snTestRunner/service.snATFConnectionService.js */
angular.module("sn.testRunner").service("ATFConnectionService",
  ['$window', '$q', '$log', '$rootScope', '$timeout', 'ConnectionStatusHelper',
    function($window, $q, $log, $rootScope, $timeout, connectionStatusHelper) {
      "use strict";
      this.ambConnectionStateSubscription = {
        initialized: null,
        opened: null,
        broken: null,
        closed: null
      };
      this._messageClient = amb.getClient();
      this._recordWatcher = new amb.RecordWatcher(this._messageClient);
      this._stepConfigWatcher = new amb.RecordWatcher(this._messageClient);
      this._channelListener = null;
      this._stepConfigChannelListener = null;
      this._whitelistedClientErrorWatcher = new amb.RecordWatcher(this._messageClient);
      this._whitelistedClientErrorChannelListener = null;
      this._atfAgentWatcher = new amb.RecordWatcher(this._messageClient);
      this._atfAgentChannelListener = null;
      var AMBRecordWatcherUTRClient = Class.create();
      AMBRecordWatcherUTRClient.TABLE = "sys_atf_test_result";
      AMBRecordWatcherUTRClient.TABLE_COLUMN_TEST_CASE_JSON = "test_case_json";
      AMBRecordWatcherUTRClient.TABLE_COLUMN_STATUS = "status";
      AMBRecordWatcherUTRClient.TABLE_COLUMN_STATUS_WAITING = "waiting";
      AMBRecordWatcherUTRClient.MESSAGE_CONDITION_DEFAULT_QUERY =
        AMBRecordWatcherUTRClient.TABLE_COLUMN_TEST_CASE_JSON + "ISNOTEMPTY^" +
        AMBRecordWatcherUTRClient.TABLE_COLUMN_STATUS + "=" +
        AMBRecordWatcherUTRClient.TABLE_COLUMN_STATUS_WAITING;
      AMBRecordWatcherUTRClient.TABLE_STEP_CONFIG = "sys_atf_step_config";
      AMBRecordWatcherUTRClient.STEP_CONFIG_CONDITION = "active=true";
      AMBRecordWatcherUTRClient.TABLE_ATF_WHITELISTED_CLIENT_ERROR = "sys_atf_whitelist";
      AMBRecordWatcherUTRClient.WHITELISTED_CLIENT_ERROR_CONDITION = "active=true";
      AMBRecordWatcherUTRClient.TABLE_ATF_AGENT = "sys_atf_agent";
      AMBRecordWatcherUTRClient.TEST_RUNNER_MESSAGE_PROCESSOR = "Test Runner Message Processor";
      AMBRecordWatcherUTRClient.ERROR = "Error";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_NEW = "{0}: New message received";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_MISSING_ACTION_OPERATION = "{0}: {1}: Received message that is missing required attributes 'action' and 'operation'";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_MISSING_RECORD = "{0}: {1}: Received message that does not contain a record to process.";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_IGNORED_NOT_ENTRY_ACTION =
        "{0}: Incoming message ignored. We only process messages when a " + AMBRecordWatcherUTRClient.TABLE +
        " record begins matching the registered filter condition.";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_IGNORED_STATUS_JSON_NOT_SET = "{0}: Message ignored since both 'status' and 'test_case_json' were not set by this record operation.";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_LOG_STATE = "{0}: Received message action={1}, operation={2}, record.status={3}";
      AMBRecordWatcherUTRClient.REPORT_START_TEST = "{0}: Starting test execution";
      AMBRecordWatcherUTRClient.REPORT_TEST_STARTED_PROCESSING_COMPLETE = "{0}: UI Test has started. Message processing complete.";
      AMBRecordWatcherUTRClient.REPORT_UNEXPECTED_EXCEPTION = "{0}: Reached unexpected exception: {1}";
      AMBRecordWatcherUTRClient.UNSUBSCRIBED = "Unsubscribed from all AMB channels";
      AMBRecordWatcherUTRClient.i18nSubscribedToChannelMsg = new GwtMessage().getMessage("Subscribed to channel: {0}");
      this.STATIC = AMBRecordWatcherUTRClient;
      this.subscribeToTestResultChannel = function(isDebugEnabled, messageReference) {
        this.setMessageReceivedDebugCallback(this._AMBMessageReceivedDebugCallback);
        this.setMessageReceivedCallback(this._AMBMessageReceivedCallback);
        if (isDebugEnabled)
          this.setMessageReceivedDebugCallback(this._AMBMessageReceivedDebugCallback);
        this.prepareCallbacks();
        var table = AMBRecordWatcherUTRClient.TABLE;
        var condition = this._getTestRunnerEventQuery(messageReference);
        if (this._channelListener)
          this._channelListener.unsubscribe();
        this._channelListener = this._recordWatcher.getChannel(table, condition, null);
        this._channelListener.subscribe(this.receiveMessage.bind(this));
        return this.getRegisteredChannelName(this._channelListener);
      };
      this.subscribeToStepConfigChannel = function(isDebugEnabled) {
        this.setMessageReceivedConfigCallback(this._AMBMessageReceivedConfigCallback);
        if (isDebugEnabled)
          this.setMessageReceivedConfigDebugCallback(this._AMBMessageReceivedConfigDebugCallback);
        if (this._stepConfigChannelListener)
          this._stepConfigChannelListener.unsubscribe();
        this._stepConfigChannelListener = this._stepConfigWatcher.getChannel(AMBRecordWatcherUTRClient.TABLE_STEP_CONFIG, AMBRecordWatcherUTRClient.STEP_CONFIG_CONDITION, null);
        this._stepConfigChannelListener.subscribe(this.receiveConfigMessage.bind(this));
        return this.getRegisteredChannelName(this._stepConfigChannelListener);
      };
      this.subscribeToWhitelistedClientErrorChannel = function(isDebugEnabled) {
        this.setMessageReceivedWhitelistedClientErrorCallback(this._AMBMessageReceivedWhitelistedClientErrorCallback);
        if (isDebugEnabled)
          this.setMessageReceivedWhitelistedClientErrorDebugCallback(this._AMBMessageReceivedWhitelistedClientErrorDebugCallback);
        if (this._whitelistedClientErrorChannelListener)
          this._whitelistedClientErrorChannelListener.unsubscribe();
        this._whitelistedClientErrorChannelListener = this._whitelistedClientErrorWatcher.getChannel(AMBRecordWatcherUTRClient.TABLE_ATF_WHITELISTED_CLIENT_ERROR, AMBRecordWatcherUTRClient.WHITELISTED_CLIENT_ERROR_CONDITION, null);
        this._whitelistedClientErrorChannelListener.subscribe(this.receiveWhitelistedClientErrorMessage.bind(this));
        return this.getRegisteredChannelName(this._whitelistedClientErrorChannelListener);
      };
      this.subscribeToATFAgentChannel = function(isDebugEnabled, atfAgentSysId) {
        this.setMessageReceivedATFAgentCallback(this._AMBMessageReceivedATFAgentCallback);
        if (this._atfAgentChannelListener)
          this._atfAgentChannelListener.unsubscribe();
        var condition = "sys_id=" + atfAgentSysId;
        this._atfAgentChannelListener = this._atfAgentWatcher.getChannel(AMBRecordWatcherUTRClient.TABLE_ATF_AGENT, condition, null);
        this._atfAgentChannelListener.subscribe(this.receiveATFAgentMessage.bind(this));
        return this.getRegisteredChannelName(this._atfAgentChannelListener);
      }
      this.getRegisteredChannelName = function(channel) {
        return formatMessage(this.STATIC.i18nSubscribedToChannelMsg, channel.getName());
      };
      this.asyncApplyOnExternalEvent = function(eventMessageName, callback) {
        jslog("External event triggered, notifying: " + eventMessageName);
        $rootScope.$evalAsync(callback);
      };
      this.addListenersForInternalConnectionEvents = function(handlers, controllerCallback) {
        var self = this;
        var eventNames = connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS;
        for (var index = 0; index < eventNames.length; index++) {
          var eventName = eventNames[index];
          (function(eventNameToPass) {
            var handler = $rootScope.$on(eventName, function() {
              var result = connectionStatusHelper.buildConnectionStatus(eventNameToPass);
              self.asyncApplyOnExternalEvent(eventNameToPass, controllerCallback(result));
            });
            handlers.push(handler);
          })(eventName);
        }
      };
      this.receiveMessage = function(message) {
        try {
          ATFCommon.log(this.STATIC.RECEIVED_MSG_NEW, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR]);
          var messageData = message.data;
          if (!ATFCommon.hasOwnProperty(messageData, "action") || !ATFCommon.hasOwnProperty(messageData, "operation")) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_MISSING_ACTION_OPERATION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, this.STATIC.ERROR]);
            return;
          }
          if (!ATFCommon.hasOwnProperty(messageData, "record")) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_MISSING_RECORD, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, this.STATIC.ERROR]);
            return;
          }
          var messageDataAction = messageData.action;
          if ("entry" !== messageDataAction) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_IGNORED_NOT_ENTRY_ACTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, this.STATIC.ERROR]);
            return;
          }
          if (!ATFCommon.hasOwnProperty(messageData, "changes") ||
            messageData.changes.indexOf(this.STATIC.TABLE_COLUMN_TEST_CASE_JSON) === -1 ||
            messageData.changes.indexOf(this.STATIC.TABLE_COLUMN_STATUS) === -1) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_IGNORED_STATUS_JSON_NOT_SET, this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR);
            return;
          }
          this._onMessageReceivedDebug(messageData);
          var messageDataOperation = messageData.operation;
          var messageDataRecord = messageData.record;
          var messageDataRecordStatusValue = ATFCommon.getValueOrNullFromRecord(messageDataRecord, this.STATIC.TABLE_COLUMN_STATUS);
          ATFCommon.log(this.STATIC.RECEIVED_MSG_LOG_STATE, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, messageDataAction, messageDataOperation, messageDataRecordStatusValue]);
          var testJsonString = ATFCommon.getValueOrNullFromRecord(messageDataRecord, this.STATIC.TABLE_COLUMN_TEST_CASE_JSON);
          var testJson = JSON.parse(testJsonString);
          var testResultSysId = messageData.sys_id;
          if (this.STATIC.TABLE_COLUMN_STATUS_WAITING === messageDataRecordStatusValue) {
            ATFCommon.log(this.STATIC.REPORT_START_TEST, this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR);
            this._onMessageReceived(testJson, testResultSysId);
            ATFCommon.log(this.STATIC.REPORT_TEST_STARTED_PROCESSING_COMPLETE, this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR);
          }
        } catch (e) {
          ATFCommon.log(this.STATIC.REPORT_UNEXPECTED_EXCEPTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, e.message]);
          if (ATFCommon.hasOwnProperty(e, "stack"))
            ATFCommon.log(e.stack);
        }
      };
      this.receiveConfigMessage = function(message) {
        try {
          ATFCommon.log(this.STATIC.RECEIVED_MSG_NEW, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR]);
          var messageData = message.data;
          this._onMessageReceivedConfigDebug(messageData);
          this._onMessageReceivedConfig();
        } catch (e) {
          ATFCommon.log(this.STATIC.REPORT_UNEXPECTED_EXCEPTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, e.message]);
          if (ATFCommon.hasOwnProperty(e, "stack"))
            ATFCommon.log(e.stack);
        }
      };
      this.receiveWhitelistedClientErrorMessage = function(message) {
        try {
          ATFCommon.log(this.STATIC.RECEIVED_MSG_NEW, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR]);
          var messageData = message.data;
          this._onMessageReceivedWhitelistedClientErrorDebug(messageData);
          this._onMessageReceivedWhitelistedClientError();
        } catch (e) {
          ATFCommon.log(this.STATIC.REPORT_UNEXPECTED_EXCEPTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, e.message]);
          if (ATFCommon.hasOwnProperty(e, "stack"))
            ATFCommon.log(e.stack);
        }
      };
      this.receiveATFAgentMessage = function(message) {
        try {
          var messageData = message.data;
          if (!ATFCommon.hasOwnProperty(messageData, "action") || !ATFCommon.hasOwnProperty(messageData, "operation")) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_MISSING_ACTION_OPERATION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, this.STATIC.ERROR]);
            return;
          }
          if ("delete" !== messageData.operation)
            return;
          this.unsubscribeFromAllChannels();
          this._onMessageReceivedATFAgent(messageData);
        } catch (e) {
          ATFCommon.log(this.STATIC.REPORT_UNEXPECTED_EXCEPTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, e.message]);
          if (ATFCommon.hasOwnProperty(e, "stack"))
            ATFCommon.log(e.stack);
        }
      };
      this.unsubscribeFromAllChannels = function() {
        if (this._channelListener)
          this._channelListener.unsubscribe();
        if (this._stepConfigChannelListener)
          this._stepConfigChannelListener.unsubscribe();
        if (this._whitelistedClientErrorChannelListener)
          this._whitelistedClientErrorChannelListener.unsubscribe();
        if (this._atfAgentChannelListener)
          this._atfAgentChannelListener.unsubscribe();
        ATFCommon.log(this.STATIC.UNSUBSCRIBED);
      };
      this.prepareCallbacks = function() {
        this.ambConnectionStateSubscription.closed = this._subscribeToAMBConnectionStateChange(
          "connection.closed", connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[3]);
        this.ambConnectionStateSubscription.initialized = this._subscribeToAMBConnectionStateChange(
          "connection.initialized", connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[0]);
        this.ambConnectionStateSubscription.broken = this._subscribeToAMBConnectionStateChange(
          "connection.broken", connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[2]);
        this.ambConnectionStateSubscription.opened = this._subscribeToAMBConnectionStateChange(
          "connection.opened", connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[1]);
      };
      this._subscribeToAMBConnectionStateChange = function(ambEventNameToSubscribe, messageToEmit) {
        return this._messageClient.subscribeToEvent(ambEventNameToSubscribe, function() {
          $rootScope.$emit(messageToEmit);
        });
      };
      this.setMessageReceivedDebugCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedDebugCallback = theFunction;
      };
      this._onMessageReceivedDebug = function(messageData) {
        if (!ATFCommon.isFunction(this._customMessageReceivedDebugCallback))
          return;
        this._customMessageReceivedDebugCallback(messageData);
      };
      this.setMessageReceivedCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedCallback = theFunction;
      };
      this._onMessageReceived = function(testJson, testResultSysId) {
        if (!ATFCommon.isFunction(this._customMessageReceivedCallback))
          return;
        this._customMessageReceivedCallback(testJson, testResultSysId);
      };
      this.setMessageReceivedConfigCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedConfigCallback = theFunction;
      };
      this.setMessageReceivedWhitelistedClientErrorCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedWhitelistedClientErrorCallback = theFunction;
      };
      this._onMessageReceivedConfig = function() {
        if (!ATFCommon.isFunction(this._customMessageReceivedConfigCallback))
          return;
        this._customMessageReceivedConfigCallback();
      };
      this._onMessageReceivedWhitelistedClientError = function() {
        if (!ATFCommon.isFunction(this._customMessageReceivedWhitelistedClientErrorCallback))
          return;
        this._customMessageReceivedWhitelistedClientErrorCallback();
      };
      this._onMessageReceivedATFAgent = function(messageData) {
        if (!ATFCommon.isFunction(this._customMessageReceivedATFAgentCallback))
          return;
        this._customMessageReceivedATFAgentCallback(messageData);
      }
      this.setMessageReceivedConfigDebugCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedConfigDebugCallback = theFunction;
      };
      this.setMessageReceivedWhitelistedClientErrorDebugCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedWhitelistedClientErrorDebugCallback = theFunction;
      };
      this.setMessageReceivedATFAgentCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedATFAgentCallback = theFunction;
      };
      this._onMessageReceivedConfigDebug = function(messageData) {
        if (!ATFCommon.isFunction(this._customMessageReceivedConfigDebugCallback))
          return;
        this._customMessageReceivedConfigDebugCallback(messageData);
      };
      this._onMessageReceivedWhitelistedClientErrorDebug = function(messageData) {
        if (!ATFCommon.isFunction(this._customMessageReceivedWhitelistedClientErrorDebugCallback))
          return;
        this._customMessageReceivedWhitelistedClientErrorDebugCallback(messageData);
      };
      this._AMBMessageReceivedDebugCallback = function(messageData) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedDebug", messageData);
      };
      this._AMBMessageReceivedCallback = function(testJson, testResultSysId) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceived", testJson, testResultSysId);
      };
      this._AMBMessageReceivedConfigCallback = function() {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedConfig");
      };
      this._AMBMessageReceivedWhitelistedClientErrorCallback = function() {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedWhitelistedClientError");
      };
      this._AMBMessageReceivedConfigDebugCallback = function(messageData) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedConfigDebug", messageData);
      };
      this._AMBMessageReceivedWhitelistedClientErrorDebugCallback = function(messageData) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedWhitelistedClientErrorDebug", messageData);
      };
      this._AMBMessageReceivedATFAgentCallback = function(messageData) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedATFAgent", messageData);
      }
      this._getTestRunnerEventQuery = function(messageReference) {
        var query = "message_reference=" + messageReference;
        query += "^" + AMBRecordWatcherUTRClient.MESSAGE_CONDITION_DEFAULT_QUERY;
        return query;
      };
      this.getAMBDisconnectedStatusObject = function() {
        return connectionStatusHelper.buildConnectionStatus(connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[3]);
      };
    }
  ]);;
/*! RESOURCE: /scripts/app.snTestRunner/factory.snATFOpenURL.js */
angular
  .module('sn.testRunner')
  .factory('ATFOpenURL', ATFOpenURL);
ATFOpenURL.$inject = ['$q'];

function ATFOpenURL($q) {
  'use strict';
  return {
    openURL: openURL
  };

  function openURL(url, stepId, testResultId, isDebugEnabled, rollbackContextId) {
    var defer = $q.defer();
    var testIframe = g_ui_testing_util.getTestIFrame();
    testIframe.onload = whenFrameCleared;
    testIframe.src = "";
    return defer.promise;

    function whenFrameCleared() {
      testIframe.onload = whenFrameLoaded;
      var gurl = new GlideURL(url);
      gurl.setEncode(false);
      gurl.addParam("sysparm_atf_step_sys_id", stepId);
      gurl.addParam("sysparm_atf_test_result_sys_id", testResultId);
      gurl.addParam("sysparm_atf_debug", isDebugEnabled ? "true" : "false");
      gurl.addParam(ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID, rollbackContextId);
      gurl.addParam(ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER, "true");
      var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
      var emptySrcLogFunc = (!testFrameWindow["console"]) ? console.log : testFrameWindow.console.log;
      testIframe.src = gurl.getURL();
      g_ui_testing_util.overwriteFrameFunctions(emptySrcLogFunc);
    }

    function whenFrameLoaded() {
      testIframe.onload = null;
      if (g_ui_testing_util.getTestIFrameGForm()) {
        var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
        if (testFrameWindow.CustomEvent)
          testFrameWindow.CustomEvent.observe('glideform:script_error', function(err) {
            console.error(err)
          });
      }
      defer.resolve();
    }
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snSnapshotHandler.js */
angular
  .module('sn.testRunner')
  .factory('SnapshotHandler', SnapshotHandler);
SnapshotHandler.$inject = ['$q', 'md5', '$resource'];

function SnapshotHandler($q, md5, $resource) {
  'use strict';
  var create = $resource('/api/now/atf/custom_ui/snapshot/create', {});
  var find = $resource('/api/now/atf/custom_ui/snapshot/find', {});
  return {
    takeSnapshot: takeSnapshot,
    findSnapshot: findSnapshot
  };

  function takeSnapshot(step, gAutomate, isPreviousStepSnapshot) {
    if (!step) {
      console.log("Not taking snapshot, step object is missing");
      return $q.when();
    }
    if (!gAutomate) {
      console.log("Not taking snapshot, g_automate not present");
      return $q.when();
    }
    var stepId = step.sys_id;
    var components = gAutomate.getPageInfo();
    var hashSnapshot = md5(JSON.stringify(components));
    if (step.snapshot_hash && hashSnapshot === step.snapshot_hash) {
      if (gAutomate.isDebug())
        console.log("Snapshot already exists");
      return $q.when();
    }
    _addComponentHash(components);
    if (gAutomate.isDebug())
      console.log("Saving snapshot for " + gAutomate.getPageURL());
    var deferredResponse = $q.defer();
    var params = {
      step_id: stepId,
      page_url: gAutomate.getPageURL(),
      ui_components: JSON.stringify(components),
      snapshot_hash: hashSnapshot,
      is_previous_step_snapshot: isPreviousStepSnapshot
    };
    create.save(params)
      .$promise
      .then(function(snapshotId) {
        if (gAutomate.isDebug())
          console.log("Saved snapshot: " + JSON.stringify(snapshotId));
        deferredResponse.resolve(snapshotId);
      }).catch(function(error) {
        if (gAutomate.isDebug())
          console.log("Could not save the snapshot, due to:" + JSON.stringify(error));
        deferredResponse.reject(null);
      });
    return deferredResponse.promise;
  }

  function findSnapshot(testID, stepOrder, isDebugEnabled) {
    var deferredResponse = $q.defer();
    var params = {
      test_id: testID,
      step_order: stepOrder
    };
    find.get(params)
      .$promise
      .then(function(snapshotId) {
        if (isDebugEnabled)
          console.log("found snapshot: " + JSON.stringify(snapshotId));
        deferredResponse.resolve(snapshotId);
      }).catch(function(error) {
        if (isDebugEnabled)
          console.log("Could not find snapshot, due to:" + JSON.stringify(error));
        deferredResponse.reject(null);
      });
    return deferredResponse.promise;
  }

  function _addComponentHash(components) {
    var componentHashCounterMap = {}
    for (var i = 0; i < components.length; i++) {
      var component = components[i];
      var componentHash = md5(JSON.stringify(component));
      var currentCount = componentHashCounterMap[componentHash];
      if (currentCount) {
        component["duplicate-mugshot-index"] = currentCount;
        componentHashCounterMap[componentHash] = currentCount + 1;
        componentHash = md5(JSON.stringify(component))
      } else
        componentHashCounterMap[componentHash] = 1;
      component.hash = componentHash;
    }
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/GlideScreenshot.js */
'use strict';
var GlideScreenshot = Class.create({
  TARGET_CANVAS_ID: "glideScreenshotCanvas",
  FILE_EXTENSION: ".jpg",
  captureTimeoutSeconds: 60,
  initialize: function(timeout) {
    this.captureTimeoutSeconds = timeout;
  },
  generateAndAttach: function(domElement, tableName, sysId, fileName, screenshotsQuality, callback) {
    var self = this;
    this.generate(domElement)
      .then(function onGenerateComplete(doAttach) {
        if (!doAttach)
          return;
        callback();
        self.attach(tableName, sysId, fileName, screenshotsQuality);
      }, function onGenerateException(result) {
        if (result['isTimeout']) {
          var translatedTimeoutMsg = new GwtMessage().getMessage("screenshot_capture_canceled_by_timeout", self.captureTimeoutSeconds);
          self._sendScreenshotEvent("Screenshot timed out");
          callback(translatedTimeoutMsg);
        }
        if (result['message']) {
          self._sendScreenshotEvent("Screenshot failed");
          callback(result['message']);
        }
      });
  },
  generate: function(domElement) {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (!self._isThirdPartyLibraryLoaded()) {
        resolve(false);
        return;
      }
      var targetCanvas = document.getElementById(self.TARGET_CANVAS_ID);
      if (targetCanvas && targetCanvas != null)
        targetCanvas.parentElement.removeChild(targetCanvas);
      try {
        var timeoutRef = setTimeout(function() {
          reject({
            isTimeout: true
          });
        }, self.captureTimeoutSeconds * 1000);
        html2canvas(domElement, {
            background: '#FFFFFF'
          })
          .then(function(canvas) {
            clearTimeout(timeoutRef);
            canvas.id = self.TARGET_CANVAS_ID;
            canvas.style.display = "none";
            document.body.appendChild(canvas);
            resolve(true);
          });
      } catch (exception) {
        clearTimeout(timeoutRef);
        var exceptionDetails = exception['stack'] ? exception['stack'] : exception.toString();
        var message = "Error occurred while generating screenshot:\n" + exceptionDetails;
        reject({
          message: message
        });
      }
    });
  },
  attach: function(tableName, sysId, fileName, screenshotsQuality) {
    var imageType = 'image/jpeg';
    var percentQuality;
    if (parseFloat(screenshotsQuality) == screenshotsQuality)
      percentQuality = screenshotsQuality / 100;
    else
      percentQuality = 0.25;
    var canvasData = document.getElementById(this.TARGET_CANVAS_ID).toDataURL(imageType, percentQuality);
    var ga = new GlideAjax('ScreenCaptureAPI');
    ga.addParam('sysparm_name', 'attachScreenShot');
    ga.addParam('sysparm_target_table_name', tableName);
    ga.addParam('sysparm_target_sys_id', sysId);
    ga.addParam('sysparm_image_data', canvasData);
    ga.addParam('sysparm_file_name', fileName + this.FILE_EXTENSION);
    ga.addParam('sysparm_file_type', imageType);
    ga.getXML();
  },
  _isThirdPartyLibraryLoaded: function() {
    var found = ATFCommon.isFunction(html2canvas);
    if (!found)
      console.warn("GlideScreenshot: unable to find third party library 'html2canvas'");
    return found;
  },
  _sendScreenshotEvent: function(eventName) {
    if (GlideWebAnalytics && GlideWebAnalytics.trackEvent) {
      try {
        GlideWebAnalytics.trackEvent('com.glide.automated_testing_framework', "Screenshot", eventName);
      } catch (e) {
        console.log('Failed to send ATF analytic event: ' + eventName);
        console.log(e);
      }
    }
  },
  toString: function() {
    return 'GlideScreenshot';
  }
});;
/*! RESOURCE: /scripts/app.snTestRunner/util/ATFCommon.js */
var ATFCommon = Class.create();
var STATIC = ATFCommon;
ATFCommon.isFunction = function(possibleFunction) {
  if (possibleFunction === undefined || possibleFunction === null)
    return false;
  return Object.prototype.toString.call(possibleFunction) == '[object Function]';
};
ATFCommon.hasOwnProperty = function(object, property) {
  if (object === undefined || object === null)
    return false;
  return Object.prototype.hasOwnProperty.call(object, property);
};
ATFCommon.log = function(parameterizedMessageKey, messageKeyComponents) {
  jslog(formatMessage(parameterizedMessageKey, messageKeyComponents));
};
ATFCommon.getValueOrNullFromRecord = function(record, column) {
  return (STATIC.hasOwnProperty(record, column)) ? record[column].value : null;
};
ATFCommon.logError = function(e) {
  if (STATIC.hasOwnProperty(e, "stack"))
    STATIC.log(e.message + "\n" + e.stack);
  else
    STATIC.log(e.message);
};;
/*! RESOURCE: /scripts/app.snTestRunner/util/GUITestingUtil.js */
var GUITestingUtil = Class.create();
GUITestingUtil.prototype = {
  initialize: function() {},
  getAngularScope: function() {
    return angular.element("#test_runner_container").scope().testRunner;
  },
  _getAngularInjector: function(injectorName) {
    return angular.element("#test_runner_container").injector().get(injectorName);
  },
  q: function() {
    return this._getAngularInjector("$q");
  },
  http: function() {
    return this._getAngularInjector("$http");
  },
  interval: function() {
    return this._getAngularInjector("$interval");
  },
  timeout: function() {
    return this._getAngularInjector("$timeout");
  },
  getTestIFrame: function() {
    return this.getAngularScope().iFrame;
  },
  getTestIFrameGForm: function() {
    return this.getAngularScope()._getFrameGForm();
  },
  getTestIFrameWindow: function() {
    return this.getAngularScope().frameWindow;
  },
  getGAutomate: function() {
    return top.window.g_automate;
  },
  setTestIFrameOnloadFunction: function(func) {
    this.getAngularScope().setiFrameOnloadFunction(func);
  },
  clearTestIFrameOnloadFunction: function() {
    this.getAngularScope().cleariFrameOnloadFunction();
  },
  setTestStepStatusMessage: function(message) {
    return this.getAngularScope().setTestStepStatusMessage(message);
  },
  getRollbackContextId: function() {
    var testRunnerObj = this.getAngularScope();
    if (null == testRunnerObj.atfFormInterceptor)
      return null;
    return testRunnerObj.atfFormInterceptor.getRollbackContextId();
  },
  openFormAndAssert: function(url, recordId, view) {
    return this.getAngularScope().openFormAndAssert(url, recordId, view);
  },
  openPortalPage: function(portalUrlSfx, pageId, queryParams, waitTimeout) {
    return this.getAngularScope().openPortalPage(portalUrlSfx, pageId, queryParams, waitTimeout);
  },
  openURL: function(url) {
    return this.getAngularScope().openURL(url);
  },
  openCatalogItem: function(catItemId) {
    return this.getAngularScope().openCatalogItem(catItemId);
  },
  overwriteFrameFunctions: function(currFramesLogFunc) {
    return this.getAngularScope().overwriteFrameFunctions(currFramesLogFunc);
  },
  waitForPageReload: function(timeout, cb) {
    var self = this;
    var testFrameWindow = self.getTestIFrameWindow();
    var wasGSubmitted = testFrameWindow.g_submitted;
    var overwriteFuncIntvlId;
    var timeoutReachedTimeoutId;
    var checkGSubmittedIntvlId;
    self.setTestIFrameOnloadFunction(whenPageReloaded);
    overwriteFuncIntvlId = self.overwriteFrameFunctions(testFrameWindow.console.log);
    if (!testFrameWindow.g_submitted) {
      timeoutReachedTimeoutId = window.setTimeout(whenTimeoutReached, timeout * 1000);
      checkGSubmittedIntvlId = window.setInterval(checkGSubmitted, 1);
    }

    function checkGSubmitted() {
      if (testFrameWindow.g_submitted) {
        wasGSubmitted = true;
        window.clearTimeout(timeoutReachedTimeoutId);
        window.clearInterval(checkGSubmittedIntvlId);
      }
    }

    function whenPageReloaded() {
      clearAllTimeoutsIntervalAndOnload();
      cb(true, wasGSubmitted);
    }

    function whenTimeoutReached() {
      clearAllTimeoutsIntervalAndOnload();
      cb(false, wasGSubmitted);
    }

    function clearAllTimeoutsIntervalAndOnload() {
      self.clearTestIFrameOnloadFunction();
      window.clearInterval(overwriteFuncIntvlId);
      window.clearTimeout(timeoutReachedTimeoutId);
      window.clearInterval(checkGSubmittedIntvlId);
    }
  },
  type: "GUITestingUtil"
};;
/*! RESOURCE: /scripts/app.snTestRunner/util/ATFFormInterceptor.js */
var ATFFormInterceptor = Class.create();
ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID = 'sysparm_rollback_context_id';
ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER = 'sysparm_from_atf_test_runner';
ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID = 'sysparm_atf_step_sys_id';
ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID = 'sysparm_atf_test_result_sys_id';
ATFFormInterceptor.XMLHTTP_INTERCEPT_SCRIPT_TAG_ID = 'xmlhttp_intercept_script_tag_id';
ATFFormInterceptor.ROLLBACK_CONTEXT_ID = 'rollback_context_id';
ATFFormInterceptor.prototype = {
  initialize: function(rollbackContext) {
    this._rollbackContextId = rollbackContext;
  },
  interceptFormWithRollbackContextId: function(testIFrameWindow) {
    var testIFrameDocument = testIFrameWindow.document;
    if (testIFrameDocument) {
      var formList = testIFrameDocument.getElementsByTagName('form');
      for (var i = 0; i < formList.length; i++) {
        if (formList[i].action) {
          if (formList[i].action.indexOf("rollback_context_id") == -1) {
            if (formList[i].action.indexOf("?") == -1)
              formList[i].action += "?sysparm_rollback_context_id=" + this._rollbackContextId;
            else
              formList[i].action += "&sysparm_rollback_context_id=" + this._rollbackContextId;
          }
          if (formList[i].action.indexOf(ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER) == -1) {
            if (formList[i].action.indexOf("?") == -1)
              formList[i].action += "?" + ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER + "=true";
            else
              formList[i].action += "&" + ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER + "=true";
          }
        }
      }
    }
  },
  interceptFormWithStepIdAndTestResultId: function(sys_atf_step_sys_id, sys_atf_test_result_sys_id, testIFrameWindow) {
    var testIFrameDocument = testIFrameWindow.document;
    if (testIFrameDocument) {
      var formList = testIFrameDocument.getElementsByTagName('form');
      for (var i = 0; i < formList.length; i++) {
        if (formList[i].querySelector(ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID) == null) {
          var inputTagStep = testIFrameDocument.createElement('input');
          inputTagStep.setAttribute("type", "hidden");
          inputTagStep.setAttribute("name", ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID);
          inputTagStep.setAttribute("id", ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID);
          inputTagStep.setAttribute("value", sys_atf_step_sys_id);
          formList[i].appendChild(inputTagStep);
          var inputTagTest = testIFrameDocument.createElement('input');
          inputTagTest.setAttribute("type", "hidden");
          inputTagTest.setAttribute("name", ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID);
          inputTagTest.setAttribute("id", ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID);
          inputTagTest.setAttribute("value", sys_atf_test_result_sys_id);
          formList[i].appendChild(inputTagTest);
        } else {
          var inputTagStep = testIFrameDocument.querySelector(ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID);
          inputTagStep.setAttribute("value", sys_atf_step_sys_id);
          var inputTagTest = testIFrameDocument.querySelector(ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID);
          inputTagTest.setAttribute("value", sys_atf_test_result_sys_id);
        }
      }
    }
  },
  interceptXMLHttpRequestWithStepIdandTestResultId: function(sys_atf_step_sys_id, sys_atf_test_result_sys_id, testIFrameWindow, sys_atf_debug) {
    var docB = testIFrameWindow.document.body;
    if (typeof docB === "undefined" || docB == null ||
      typeof docB.innerHTML === "undefined" ||
      docB.innerHTML == null ||
      docB.innerHTML === "") {
      return;
    }
    if (typeof testIFrameWindow.XMLHttpRequest.prototype.origOpen === 'undefined') {
      testIFrameWindow.XMLHttpRequest.prototype.origOpen = testIFrameWindow.XMLHttpRequest.prototype.open;
    }
    testIFrameWindow.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      var rollbackContextId = new GUITestingUtil().getRollbackContextId();
      if (url.indexOf("form_interceptor") == -1 && sys_atf_debug) {
        if (url.indexOf("?") == -1)
          url += "?form_interceptor=true";
        else
          url += "&form_interceptor=true";
      }
      if (url.indexOf("rollback_context_id") == -1) {
        if (url.indexOf("?") == -1)
          url += "?sysparm_rollback_context_id=" + rollbackContextId;
        else
          url += "&sysparm_rollback_context_id=" + rollbackContextId;
      }
      if (url.indexOf(ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID) == -1) {
        if (url.indexOf("?") == -1)
          url += "?sysparm_atf_step_sys_id=" + sys_atf_step_sys_id;
        else
          url += "&sysparm_atf_step_sys_id=" + sys_atf_step_sys_id;
      }
      if (url.indexOf(ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID) == -1) {
        if (url.indexOf("?") == -1)
          url += "?sysparm_atf_test_result_sys_id=" + sys_atf_test_result_sys_id;
        else
          url += "&sysparm_atf_test_result_sys_id=" + sys_atf_test_result_sys_id;
      }
      testIFrameWindow.XMLHttpRequest.prototype.origOpen.call(this, method, url, async, user, password);
    };
  },
  interceptFormLoadURLWithRollbackContextId: function(urlParameters) {
    urlParameters[ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID] = this._rollbackContextId;
  },
  interceptFormLoadURLWithTestRunnerIndicator: function(urlParameters) {
    urlParameters[ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER] = "true";
  },
  getRollbackContextId: function() {
    return this._rollbackContextId;
  },
  type: 'ATFFormInterceptor'
};;
/*! RESOURCE: /scripts/js_includes_left_nav_snTestRunner.js */
/*! RESOURCE: /scripts/app.snTestRunner/util/ATFLeftNavUtil.js */
var ATFLeftNavUtil = Class.create();
ATFLeftNavUtil.SEPARATOR = "SEPARATOR";
ATFLeftNavUtil.prototype = {
  initialize: function() {
    this.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS = "Error retrieving application navigator information";
    this.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS_STATUS_CODE = "Error retrieving application navigator information. HTTP Status Code: {0}";
    this.messageMap = new GwtMessage().getMessages([this.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS, this.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS_STATUS_CODE]);
  },
  openNavigator: function(whenNavigatorOpen) {
    if (typeof whenNavigatorOpen !== "function")
      return;
    if (g_ui_testing_util.getTestIFrame().src &&
      g_ui_testing_util.getTestIFrame().src.indexOf("/navigator.do") > -1)
      whenNavigatorOpen();
    else {
      g_ui_testing_util.setTestIFrameOnloadFunction(whenNavigatorOpen);
      g_ui_testing_util.getTestIFrame().src = "/navigator.do";
    }
  },
  getLeftNavJSON: function() {
    var self = this;
    var defer = g_ui_testing_util.q().defer();
    g_ui_testing_util.http().get('/api/now/ui/navigator').then(function(response) {
      if (!response || !response.data)
        defer.reject(self.messageMap[self.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS]);
      else if (response.status != 200)
        defer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS_STATUS_CODE], response.status));
      else
        defer.resolve(response.data.result);
    })['catch'](function(e) {
      if (e && e.status)
        defer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS_STATUS_CODE], e.status));
      else
        defer.reject(self.messageMap[self.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS]);
    });
    return defer.promise;
  },
  findModules: function(modulesToFind, leftNavJSON) {
    var modulesFound = [];
    for (var i = 0; i < leftNavJSON.length; i += 1) {
      var moduleList = leftNavJSON[i].modules;
      for (var j = 0; j < moduleList.length; j += 1) {
        var mod = moduleList[j];
        if (modulesToFind.indexOf(mod.id) != -1)
          modulesFound.push(mod.id);
        if (mod.type === ATFLeftNavUtil.SEPARATOR) {
          for (var k = 0; k < mod.modules.length; k += 1) {
            var modInSeparator = mod.modules[k];
            if (modulesToFind.indexOf(modInSeparator.id) != -1)
              modulesFound.push(modInSeparator.id);
          }
        }
      }
    }
    return modulesFound;
  },
  findApplications: function(appsToFind, leftNavJSON) {
    var appsFound = [];
    for (var i = 0; i < leftNavJSON.length; i += 1) {
      var app = leftNavJSON[i];
      if (appsToFind.indexOf(app.id) != -1)
        appsFound.push(app.id);
    }
    return appsFound;
  },
  getCollapsedModuleJSON: function(leftNavJSON) {
    var collapsedJSON = [];
    for (var i = 0; i < leftNavJSON.length; i += 1) {
      var moduleList = leftNavJSON[i].modules;
      for (var j = 0; j < moduleList.length; j += 1) {
        var mod = moduleList[j];
        collapsedJSON.push({
          id: mod.id,
          title: mod.title,
          uri: mod.uri,
          type: mod.type
        });
        if (mod.type === ATFLeftNavUtil.SEPARATOR) {
          for (var k = 0; k < mod.modules.length; k += 1)
            collapsedJSON.push({
              id: mod.modules[k].id,
              title: mod.modules[k].title,
              uri: mod.modules[k].uri,
              type: mod.modules[k].type
            });
        }
      }
    }
    return collapsedJSON;
  },
  getModule: function(moduleID) {
    var self = this;
    var defer = g_ui_testing_util.q().defer();
    self.getLeftNavJSON().then(function(leftNavJSON) {
      var moduleList = self.getCollapsedModuleJSON(leftNavJSON);
      for (var i = 0; i < moduleList.length; i += 1) {
        var mod = moduleList[i];
        if (moduleID === mod.id)
          defer.resolve(mod);
      }
      defer.resolve(null);
    })['catch'](function(e) {
      defer.reject(e);
    });
    return defer.promise;
  },
  type: 'ATFLeftNavUtil'
};;;
/*! RESOURCE: /scripts/app.snTestRunner/html2canvas-polyfills.js */
! function(t) {
  "object" == typeof exports ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : "undefined" != typeof window ? window.Promise = t() : "undefined" != typeof global ? global.Promise = t() : "undefined" != typeof self && (self.Promise = t())
}(function() {
  var t;
  return function e(t, n, o) {
    function r(u, c) {
      if (!n[u]) {
        if (!t[u]) {
          var s = "function" == typeof require && require;
          if (!c && s) return s(u, !0);
          if (i) return i(u, !0);
          throw new Error("Cannot find module '" + u + "'")
        }
        var f = n[u] = {
          exports: {}
        };
        t[u][0].call(f.exports, function(e) {
          var n = t[u][1][e];
          return r(n ? n : e)
        }, f, f.exports, e, t, n, o)
      }
      return n[u].exports
    }
    for (var i = "function" == typeof require && require, u = 0; u < o.length; u++) r(o[u]);
    return r
  }({
    1: [function(t, e, n) {
      var o = t("../lib/decorators/unhandledRejection"),
        r = o(t("../lib/Promise"));
      e.exports = "undefined" != typeof global ? global.Promise = r : "undefined" != typeof self ? self.Promise = r : r
    }, {
      "../lib/Promise": 2,
      "../lib/decorators/unhandledRejection": 4
    }],
    2: [function(e, n, o) {
      ! function(t) {
        "use strict";
        t(function(t) {
          var e = t("./makePromise"),
            n = t("./Scheduler"),
            o = t("./env").asap;
          return e({
            scheduler: new n(o)
          })
        })
      }("function" == typeof t && t.amd ? t : function(t) {
        n.exports = t(e)
      })
    }, {
      "./Scheduler": 3,
      "./env": 5,
      "./makePromise": 7
    }],
    3: [function(e, n, o) {
      ! function(t) {
        "use strict";
        t(function() {
          function t(t) {
            this._async = t, this._running = !1, this._queue = this, this._queueLen = 0, this._afterQueue = {}, this._afterQueueLen = 0;
            var e = this;
            this.drain = function() {
              e._drain()
            }
          }
          return t.prototype.enqueue = function(t) {
            this._queue[this._queueLen++] = t, this.run()
          }, t.prototype.afterQueue = function(t) {
            this._afterQueue[this._afterQueueLen++] = t, this.run()
          }, t.prototype.run = function() {
            this._running || (this._running = !0, this._async(this.drain))
          }, t.prototype._drain = function() {
            for (var t = 0; t < this._queueLen; ++t) this._queue[t].run(), this._queue[t] = void 0;
            for (this._queueLen = 0, this._running = !1, t = 0; t < this._afterQueueLen; ++t) this._afterQueue[t].run(), this._afterQueue[t] = void 0;
            this._afterQueueLen = 0
          }, t
        })
      }("function" == typeof t && t.amd ? t : function(t) {
        n.exports = t()
      })
    }, {}],
    4: [function(e, n, o) {
      ! function(t) {
        "use strict";
        t(function(t) {
          function e(t) {
            throw t
          }

          function n() {}
          var o = t("../env").setTimer,
            r = t("../format");
          return function(t) {
            function i(t) {
              t.handled || (l.push(t), a("Potentially unhandled rejection [" + t.id + "] " + r.formatError(t.value)))
            }

            function u(t) {
              var e = l.indexOf(t);
              e >= 0 && (l.splice(e, 1), h("Handled previous rejection [" + t.id + "] " + r.formatObject(t.value)))
            }

            function c(t, e) {
              p.push(t, e), null === d && (d = o(s, 0))
            }

            function s() {
              for (d = null; p.length > 0;) p.shift()(p.shift())
            }
            var f, a = n,
              h = n;
            "undefined" != typeof console && (f = console, a = "undefined" != typeof f.error ? function(t) {
              f.error(t)
            } : function(t) {
              f.log(t)
            }, h = "undefined" != typeof f.info ? function(t) {
              f.info(t)
            } : function(t) {
              f.log(t)
            }), t.onPotentiallyUnhandledRejection = function(t) {
              c(i, t)
            }, t.onPotentiallyUnhandledRejectionHandled = function(t) {
              c(u, t)
            }, t.onFatalRejection = function(t) {
              c(e, t.value)
            };
            var p = [],
              l = [],
              d = null;
            return t
          }
        })
      }("function" == typeof t && t.amd ? t : function(t) {
        n.exports = t(e)
      })
    }, {
      "../env": 5,
      "../format": 6
    }],
    5: [function(e, n, o) {
      ! function(t) {
        "use strict";
        t(function(t) {
          function e() {
            return "undefined" != typeof process && null !== process && "function" == typeof process.nextTick
          }

          function n() {
            return "function" == typeof MutationObserver && MutationObserver || "function" == typeof WebKitMutationObserver && WebKitMutationObserver
          }

          function o(t) {
            function e() {
              var t = n;
              n = void 0, t()
            }
            var n, o = document.createTextNode(""),
              r = new t(e);
            r.observe(o, {
              characterData: !0
            });
            var i = 0;
            return function(t) {
              n = t, o.data = i ^= 1
            }
          }
          var r, i = "undefined" != typeof setTimeout && setTimeout,
            u = function(t, e) {
              return setTimeout(t, e)
            },
            c = function(t) {
              return clearTimeout(t)
            },
            s = function(t) {
              return i(t, 0)
            };
          if (e()) s = function(t) {
            return process.nextTick(t)
          };
          else if (r = n()) s = o(r);
          else if (!i) {
            var f = t,
              a = f("vertx");
            u = function(t, e) {
              return a.setTimer(e, t)
            }, c = a.cancelTimer, s = a.runOnLoop || a.runOnContext
          }
          return {
            setTimer: u,
            clearTimer: c,
            asap: s
          }
        })
      }("function" == typeof t && t.amd ? t : function(t) {
        n.exports = t(e)
      })
    }, {}],
    6: [function(e, n, o) {
      ! function(t) {
        "use strict";
        t(function() {
          function t(t) {
            var n = "object" == typeof t && null !== t && t.stack ? t.stack : e(t);
            return t instanceof Error ? n : n + " (WARNING: non-Error used)"
          }

          function e(t) {
            var e = String(t);
            return "[object Object]" === e && "undefined" != typeof JSON && (e = n(t, e)), e
          }

          function n(t, e) {
            try {
              return JSON.stringify(t)
            } catch (n) {
              return e
            }
          }
          return {
            formatError: t,
            formatObject: e,
            tryStringify: n
          }
        })
      }("function" == typeof t && t.amd ? t : function(t) {
        n.exports = t()
      })
    }, {}],
    7: [function(e, n, o) {
      ! function(t) {
        "use strict";
        t(function() {
          return function(t) {
            function e(t, e) {
              this._handler = t === j ? e : n(t)
            }

            function n(t) {
              function e(t) {
                r.resolve(t)
              }

              function n(t) {
                r.reject(t)
              }

              function o(t) {
                r.notify(t)
              }
              var r = new b;
              try {
                t(e, n, o)
              } catch (i) {
                n(i)
              }
              return r
            }

            function o(t) {
              return k(t) ? t : new e(j, new x(v(t)))
            }

            function r(t) {
              return new e(j, new x(new q(t)))
            }

            function i() {
              return Z
            }

            function u() {
              return new e(j, new b)
            }

            function c(t, e) {
              var n = new b(t.receiver, t.join().context);
              return new e(j, n)
            }

            function s(t) {
              return a(z, null, t)
            }

            function f(t, e) {
              return a(J, t, e)
            }

            function a(t, n, o) {
              function r(e, r, u) {
                u.resolved || h(o, i, e, t(n, r, e), u)
              }

              function i(t, e, n) {
                a[t] = e, 0 === --f && n.become(new R(a))
              }
              for (var u, c = "function" == typeof n ? r : i, s = new b, f = o.length >>> 0, a = new Array(f), p = 0; p < o.length && !s.resolved; ++p) u = o[p], void 0 !== u || p in o ? h(o, c, p, u, s) : --f;
              return 0 === f && s.become(new R(a)), new e(j, s)
            }

            function h(t, e, n, o, r) {
              if (U(o)) {
                var i = m(o),
                  u = i.state();
                0 === u ? i.fold(e, n, void 0, r) : u > 0 ? e(n, i.value, r) : (r.become(i), p(t, n + 1, i))
              } else e(n, o, r)
            }

            function p(t, e, n) {
              for (var o = e; o < t.length; ++o) l(v(t[o]), n)
            }

            function l(t, e) {
              if (t !== e) {
                var n = t.state();
                0 === n ? t.visit(t, void 0, t._unreport) : 0 > n && t._unreport()
              }
            }

            function d(t) {
              return "object" != typeof t || null === t ? r(new TypeError("non-iterable passed to race()")) : 0 === t.length ? i() : 1 === t.length ? o(t[0]) : y(t)
            }

            function y(t) {
              var n, o, r, i = new b;
              for (n = 0; n < t.length; ++n)
                if (o = t[n], void 0 !== o || n in t) {
                  if (r = v(o), 0 !== r.state()) {
                    i.become(r), p(t, n + 1, r);
                    break
                  }
                  r.visit(i, i.resolve, i.reject)
                } return new e(j, i)
            }

            function v(t) {
              return k(t) ? t._handler.join() : U(t) ? w(t) : new R(t)
            }

            function m(t) {
              return k(t) ? t._handler.join() : w(t)
            }

            function w(t) {
              try {
                var e = t.then;
                return "function" == typeof e ? new g(e, t) : new R(t)
              } catch (n) {
                return new q(n)
              }
            }

            function j() {}

            function _() {}

            function b(t, n) {
              e.createContext(this, n), this.consumers = void 0, this.receiver = t, this.handler = void 0, this.resolved = !1
            }

            function x(t) {
              this.handler = t
            }

            function g(t, e) {
              b.call(this), K.enqueue(new L(t, e, this))
            }

            function R(t) {
              e.createContext(this), this.value = t
            }

            function q(t) {
              e.createContext(this), this.id = ++X, this.value = t, this.handled = !1, this.reported = !1, this._report()
            }

            function P(t, e) {
              this.rejection = t, this.context = e
            }

            function C(t) {
              this.rejection = t
            }

            function T() {
              return new q(new TypeError("Promise cycle"))
            }

            function O(t, e) {
              this.continuation = t, this.handler = e
            }

            function E(t, e) {
              this.handler = e, this.value = t
            }

            function L(t, e, n) {
              this._then = t, this.thenable = e, this.resolver = n
            }

            function Q(t, e, n, o, r) {
              try {
                t.call(e, n, o, r)
              } catch (i) {
                o(i)
              }
            }

            function S(t, e, n, o) {
              this.f = t, this.z = e, this.c = n, this.to = o, this.resolver = V, this.receiver = this
            }

            function k(t) {
              return t instanceof e
            }

            function U(t) {
              return ("object" == typeof t || "function" == typeof t) && null !== t
            }

            function H(t, n, o, r) {
              return "function" != typeof t ? r.become(n) : (e.enterContext(n), M(t, n.value, o, r), void e.exitContext())
            }

            function N(t, n, o, r, i) {
              return "function" != typeof t ? i.become(o) : (e.enterContext(o), $(t, n, o.value, r, i), void e.exitContext())
            }

            function A(t, n, o, r, i) {
              return "function" != typeof t ? i.notify(n) : (e.enterContext(o), F(t, n, r, i), void e.exitContext())
            }

            function J(t, e, n) {
              try {
                return t(e, n)
              } catch (o) {
                return r(o)
              }
            }

            function M(t, e, n, o) {
              try {
                o.become(v(t.call(n, e)))
              } catch (r) {
                o.become(new q(r))
              }
            }

            function $(t, e, n, o, r) {
              try {
                t.call(o, e, n, r)
              } catch (i) {
                r.become(new q(i))
              }
            }

            function F(t, e, n, o) {
              try {
                o.notify(t.call(n, e))
              } catch (r) {
                o.notify(r)
              }
            }

            function W(t, e) {
              e.prototype = G(t.prototype), e.prototype.constructor = e
            }

            function z(t, e) {
              return e
            }

            function B() {}

            function I() {
              return "undefined" != typeof process && null !== process && "function" == typeof process.emit ? function(t, e) {
                return "unhandledRejection" === t ? process.emit(t, e.value, e) : process.emit(t, e)
              } : "undefined" != typeof self && "function" == typeof CustomEvent ? function(t, e, n) {
                var o = !1;
                try {
                  var r = new n("unhandledRejection");
                  o = r instanceof n
                } catch (i) {}
                return o ? function(t, o) {
                  var r = new n(t, {
                    detail: {
                      reason: o.value,
                      key: o
                    },
                    bubbles: !1,
                    cancelable: !0
                  });
                  return !e.dispatchEvent(r)
                } : t
              }(B, self, CustomEvent) : B
            }
            var K = t.scheduler,
              D = I(),
              G = Object.create || function(t) {
                function e() {}
                return e.prototype = t, new e
              };
            e.resolve = o, e.reject = r, e.never = i, e._defer = u, e._handler = v, e.prototype.then = function(t, e, n) {
              var o = this._handler,
                r = o.join().state();
              if ("function" != typeof t && r > 0 || "function" != typeof e && 0 > r) return new this.constructor(j, o);
              var i = this._beget(),
                u = i._handler;
              return o.chain(u, o.receiver, t, e, n), i
            }, e.prototype["catch"] = function(t) {
              return this.then(void 0, t)
            }, e.prototype._beget = function() {
              return c(this._handler, this.constructor)
            }, e.all = s, e.race = d, e._traverse = f, e._visitRemaining = p, j.prototype.when = j.prototype.become = j.prototype.notify = j.prototype.fail = j.prototype._unreport = j.prototype._report = B, j.prototype._state = 0, j.prototype.state = function() {
              return this._state
            }, j.prototype.join = function() {
              for (var t = this; void 0 !== t.handler;) t = t.handler;
              return t
            }, j.prototype.chain = function(t, e, n, o, r) {
              this.when({
                resolver: t,
                receiver: e,
                fulfilled: n,
                rejected: o,
                progress: r
              })
            }, j.prototype.visit = function(t, e, n, o) {
              this.chain(V, t, e, n, o)
            }, j.prototype.fold = function(t, e, n, o) {
              this.when(new S(t, e, n, o))
            }, W(j, _), _.prototype.become = function(t) {
              t.fail()
            };
            var V = new _;
            W(j, b), b.prototype._state = 0, b.prototype.resolve = function(t) {
              this.become(v(t))
            }, b.prototype.reject = function(t) {
              this.resolved || this.become(new q(t))
            }, b.prototype.join = function() {
              if (!this.resolved) return this;
              for (var t = this; void 0 !== t.handler;)
                if (t = t.handler, t === this) return this.handler = T();
              return t
            }, b.prototype.run = function() {
              var t = this.consumers,
                e = this.handler;
              this.handler = this.handler.join(), this.consumers = void 0;
              for (var n = 0; n < t.length; ++n) e.when(t[n])
            }, b.prototype.become = function(t) {
              this.resolved || (this.resolved = !0, this.handler = t, void 0 !== this.consumers && K.enqueue(this), void 0 !== this.context && t._report(this.context))
            }, b.prototype.when = function(t) {
              this.resolved ? K.enqueue(new O(t, this.handler)) : void 0 === this.consumers ? this.consumers = [t] : this.consumers.push(t)
            }, b.prototype.notify = function(t) {
              this.resolved || K.enqueue(new E(t, this))
            }, b.prototype.fail = function(t) {
              var e = "undefined" == typeof t ? this.context : t;
              this.resolved && this.handler.join().fail(e)
            }, b.prototype._report = function(t) {
              this.resolved && this.handler.join()._report(t)
            }, b.prototype._unreport = function() {
              this.resolved && this.handler.join()._unreport()
            }, W(j, x), x.prototype.when = function(t) {
              K.enqueue(new O(t, this))
            }, x.prototype._report = function(t) {
              this.join()._report(t)
            }, x.prototype._unreport = function() {
              this.join()._unreport()
            }, W(b, g), W(j, R), R.prototype._state = 1, R.prototype.fold = function(t, e, n, o) {
              N(t, e, this, n, o)
            }, R.prototype.when = function(t) {
              H(t.fulfilled, this, t.receiver, t.resolver)
            };
            var X = 0;
            W(j, q), q.prototype._state = -1, q.prototype.fold = function(t, e, n, o) {
              o.become(this)
            }, q.prototype.when = function(t) {
              "function" == typeof t.rejected && this._unreport(), H(t.rejected, this, t.receiver, t.resolver)
            }, q.prototype._report = function(t) {
              K.afterQueue(new P(this, t))
            }, q.prototype._unreport = function() {
              this.handled || (this.handled = !0, K.afterQueue(new C(this)))
            }, q.prototype.fail = function(t) {
              this.reported = !0, D("unhandledRejection", this), e.onFatalRejection(this, void 0 === t ? this.context : t)
            }, P.prototype.run = function() {
              this.rejection.handled || this.rejection.reported || (this.rejection.reported = !0, D("unhandledRejection", this.rejection) || e.onPotentiallyUnhandledRejection(this.rejection, this.context))
            }, C.prototype.run = function() {
              this.rejection.reported && (D("rejectionHandled", this.rejection) || e.onPotentiallyUnhandledRejectionHandled(this.rejection))
            }, e.createContext = e.enterContext = e.exitContext = e.onPotentiallyUnhandledRejection = e.onPotentiallyUnhandledRejectionHandled = e.onFatalRejection = B;
            var Y = new j,
              Z = new e(j, Y);
            return O.prototype.run = function() {
              this.handler.join().when(this.continuation)
            }, E.prototype.run = function() {
              var t = this.handler.consumers;
              if (void 0 !== t)
                for (var e, n = 0; n < t.length; ++n) e = t[n], A(e.progress, this.value, this.handler, e.receiver, e.resolver)
            }, L.prototype.run = function() {
              function t(t) {
                o.resolve(t)
              }

              function e(t) {
                o.reject(t)
              }

              function n(t) {
                o.notify(t)
              }
              var o = this.resolver;
              Q(this._then, this.thenable, t, e, n)
            }, S.prototype.fulfilled = function(t) {
              this.f.call(this.c, this.z, t, this.to)
            }, S.prototype.rejected = function(t) {
              this.to.reject(t)
            }, S.prototype.progress = function(t) {
              this.to.notify(t)
            }, e
          }
        })
      }("function" == typeof t && t.amd ? t : function(t) {
        n.exports = t()
      })
    }, {}]
  }, {}, [1])(1)
}), "undefined" != typeof systemJSBootstrap && systemJSBootstrap();;
/*! RESOURCE: /scripts/app.snTestRunner/html2canvas-prototype-overrides.js */
Array.prototype.filter = function(c) {
  if (void 0 === this || null === this) throw new TypeError;
  var d = Object(this),
    g = d.length >>> 0;
  if ("function" !== typeof c) throw new TypeError;
  for (var e = [], b = 2 <= arguments.length ? arguments[1] : void 0, a = 0; a < g; a++)
    if (a in d) {
      var f = d[a];
      c.call(b, f, a, d) && e.push(f)
    } return e
};
Array.prototype.map = function(c, d) {
  var g, e, b;
  if (null == this) throw new TypeError(" this is null or not defined");
  var a = Object(this),
    f = a.length >>> 0;
  if ("function" !== typeof c) throw new TypeError(c + " is not a function");
  1 < arguments.length && (g = d);
  e = Array(f);
  for (b = 0; b < f;) {
    var h;
    b in a && (h = a[b], h = c.call(g, h, b, a), e[b] = h);
    b++
  }
  return e
};;
/*! RESOURCE: /scripts/app.snTestRunner/thirdparty/moment.min.js */
//! moment.js
//! version : 2.10.3
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
! function(a, b) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.moment = b()
}(this, function() {
  "use strict";

  function a() {
    return Dc.apply(null, arguments)
  }

  function b(a) {
    Dc = a
  }

  function c(a) {
    return "[object Array]" === Object.prototype.toString.call(a)
  }

  function d(a) {
    return a instanceof Date || "[object Date]" === Object.prototype.toString.call(a)
  }

  function e(a, b) {
    var c, d = [];
    for (c = 0; c < a.length; ++c) d.push(b(a[c], c));
    return d
  }

  function f(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b)
  }

  function g(a, b) {
    for (var c in b) f(b, c) && (a[c] = b[c]);
    return f(b, "toString") && (a.toString = b.toString), f(b, "valueOf") && (a.valueOf = b.valueOf), a
  }

  function h(a, b, c, d) {
    return za(a, b, c, d, !0).utc()
  }

  function i() {
    return {
      empty: !1,
      unusedTokens: [],
      unusedInput: [],
      overflow: -2,
      charsLeftOver: 0,
      nullInput: !1,
      invalidMonth: null,
      invalidFormat: !1,
      userInvalidated: !1,
      iso: !1
    }
  }

  function j(a) {
    return null == a._pf && (a._pf = i()), a._pf
  }

  function k(a) {
    if (null == a._isValid) {
      var b = j(a);
      a._isValid = !isNaN(a._d.getTime()) && b.overflow < 0 && !b.empty && !b.invalidMonth && !b.nullInput && !b.invalidFormat && !b.userInvalidated, a._strict && (a._isValid = a._isValid && 0 === b.charsLeftOver && 0 === b.unusedTokens.length && void 0 === b.bigHour)
    }
    return a._isValid
  }

  function l(a) {
    var b = h(0 / 0);
    return null != a ? g(j(b), a) : j(b).userInvalidated = !0, b
  }

  function m(a, b) {
    var c, d, e;
    if ("undefined" != typeof b._isAMomentObject && (a._isAMomentObject = b._isAMomentObject), "undefined" != typeof b._i && (a._i = b._i), "undefined" != typeof b._f && (a._f = b._f), "undefined" != typeof b._l && (a._l = b._l), "undefined" != typeof b._strict && (a._strict = b._strict), "undefined" != typeof b._tzm && (a._tzm = b._tzm), "undefined" != typeof b._isUTC && (a._isUTC = b._isUTC), "undefined" != typeof b._offset && (a._offset = b._offset), "undefined" != typeof b._pf && (a._pf = j(b)), "undefined" != typeof b._locale && (a._locale = b._locale), Fc.length > 0)
      for (c in Fc) d = Fc[c], e = b[d], "undefined" != typeof e && (a[d] = e);
    return a
  }

  function n(b) {
    m(this, b), this._d = new Date(+b._d), Gc === !1 && (Gc = !0, a.updateOffset(this), Gc = !1)
  }

  function o(a) {
    return a instanceof n || null != a && null != a._isAMomentObject
  }

  function p(a) {
    var b = +a,
      c = 0;
    return 0 !== b && isFinite(b) && (c = b >= 0 ? Math.floor(b) : Math.ceil(b)), c
  }

  function q(a, b, c) {
    var d, e = Math.min(a.length, b.length),
      f = Math.abs(a.length - b.length),
      g = 0;
    for (d = 0; e > d; d++)(c && a[d] !== b[d] || !c && p(a[d]) !== p(b[d])) && g++;
    return g + f
  }

  function r() {}

  function s(a) {
    return a ? a.toLowerCase().replace("_", "-") : a
  }

  function t(a) {
    for (var b, c, d, e, f = 0; f < a.length;) {
      for (e = s(a[f]).split("-"), b = e.length, c = s(a[f + 1]), c = c ? c.split("-") : null; b > 0;) {
        if (d = u(e.slice(0, b).join("-"))) return d;
        if (c && c.length >= b && q(e, c, !0) >= b - 1) break;
        b--
      }
      f++
    }
    return null
  }

  function u(a) {
    var b = null;
    if (!Hc[a] && "undefined" != typeof module && module && module.exports) try {
      b = Ec._abbr, require("./locale/" + a), v(b)
    } catch (c) {}
    return Hc[a]
  }

  function v(a, b) {
    var c;
    return a && (c = "undefined" == typeof b ? x(a) : w(a, b), c && (Ec = c)), Ec._abbr
  }

  function w(a, b) {
    return null !== b ? (b.abbr = a, Hc[a] || (Hc[a] = new r), Hc[a].set(b), v(a), Hc[a]) : (delete Hc[a], null)
  }

  function x(a) {
    var b;
    if (a && a._locale && a._locale._abbr && (a = a._locale._abbr), !a) return Ec;
    if (!c(a)) {
      if (b = u(a)) return b;
      a = [a]
    }
    return t(a)
  }

  function y(a, b) {
    var c = a.toLowerCase();
    Ic[c] = Ic[c + "s"] = Ic[b] = a
  }

  function z(a) {
    return "string" == typeof a ? Ic[a] || Ic[a.toLowerCase()] : void 0
  }

  function A(a) {
    var b, c, d = {};
    for (c in a) f(a, c) && (b = z(c), b && (d[b] = a[c]));
    return d
  }

  function B(b, c) {
    return function(d) {
      return null != d ? (D(this, b, d), a.updateOffset(this, c), this) : C(this, b)
    }
  }

  function C(a, b) {
    return a._d["get" + (a._isUTC ? "UTC" : "") + b]()
  }

  function D(a, b, c) {
    return a._d["set" + (a._isUTC ? "UTC" : "") + b](c)
  }

  function E(a, b) {
    var c;
    if ("object" == typeof a)
      for (c in a) this.set(c, a[c]);
    else if (a = z(a), "function" == typeof this[a]) return this[a](b);
    return this
  }

  function F(a, b, c) {
    for (var d = "" + Math.abs(a), e = a >= 0; d.length < b;) d = "0" + d;
    return (e ? c ? "+" : "" : "-") + d
  }

  function G(a, b, c, d) {
    var e = d;
    "string" == typeof d && (e = function() {
      return this[d]()
    }), a && (Mc[a] = e), b && (Mc[b[0]] = function() {
      return F(e.apply(this, arguments), b[1], b[2])
    }), c && (Mc[c] = function() {
      return this.localeData().ordinal(e.apply(this, arguments), a)
    })
  }

  function H(a) {
    return a.match(/\[[\s\S]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "")
  }

  function I(a) {
    var b, c, d = a.match(Jc);
    for (b = 0, c = d.length; c > b; b++) Mc[d[b]] ? d[b] = Mc[d[b]] : d[b] = H(d[b]);
    return function(e) {
      var f = "";
      for (b = 0; c > b; b++) f += d[b] instanceof Function ? d[b].call(e, a) : d[b];
      return f
    }
  }

  function J(a, b) {
    return a.isValid() ? (b = K(b, a.localeData()), Lc[b] || (Lc[b] = I(b)), Lc[b](a)) : a.localeData().invalidDate()
  }

  function K(a, b) {
    function c(a) {
      return b.longDateFormat(a) || a
    }
    var d = 5;
    for (Kc.lastIndex = 0; d >= 0 && Kc.test(a);) a = a.replace(Kc, c), Kc.lastIndex = 0, d -= 1;
    return a
  }

  function L(a, b, c) {
    _c[a] = "function" == typeof b ? b : function(a) {
      return a && c ? c : b
    }
  }

  function M(a, b) {
    return f(_c, a) ? _c[a](b._strict, b._locale) : new RegExp(N(a))
  }

  function N(a) {
    return a.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(a, b, c, d, e) {
      return b || c || d || e
    }).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  }

  function O(a, b) {
    var c, d = b;
    for ("string" == typeof a && (a = [a]), "number" == typeof b && (d = function(a, c) {
        c[b] = p(a)
      }), c = 0; c < a.length; c++) ad[a[c]] = d
  }

  function P(a, b) {
    O(a, function(a, c, d, e) {
      d._w = d._w || {}, b(a, d._w, d, e)
    })
  }

  function Q(a, b, c) {
    null != b && f(ad, a) && ad[a](b, c._a, c, a)
  }

  function R(a, b) {
    return new Date(Date.UTC(a, b + 1, 0)).getUTCDate()
  }

  function S(a) {
    return this._months[a.month()]
  }

  function T(a) {
    return this._monthsShort[a.month()]
  }

  function U(a, b, c) {
    var d, e, f;
    for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), d = 0; 12 > d; d++) {
      if (e = h([2e3, d]), c && !this._longMonthsParse[d] && (this._longMonthsParse[d] = new RegExp("^" + this.months(e, "").replace(".", "") + "$", "i"), this._shortMonthsParse[d] = new RegExp("^" + this.monthsShort(e, "").replace(".", "") + "$", "i")), c || this._monthsParse[d] || (f = "^" + this.months(e, "") + "|^" + this.monthsShort(e, ""), this._monthsParse[d] = new RegExp(f.replace(".", ""), "i")), c && "MMMM" === b && this._longMonthsParse[d].test(a)) return d;
      if (c && "MMM" === b && this._shortMonthsParse[d].test(a)) return d;
      if (!c && this._monthsParse[d].test(a)) return d
    }
  }

  function V(a, b) {
    var c;
    return "string" == typeof b && (b = a.localeData().monthsParse(b), "number" != typeof b) ? a : (c = Math.min(a.date(), R(a.year(), b)), a._d["set" + (a._isUTC ? "UTC" : "") + "Month"](b, c), a)
  }

  function W(b) {
    return null != b ? (V(this, b), a.updateOffset(this, !0), this) : C(this, "Month")
  }

  function X() {
    return R(this.year(), this.month())
  }

  function Y(a) {
    var b, c = a._a;
    return c && -2 === j(a).overflow && (b = c[cd] < 0 || c[cd] > 11 ? cd : c[dd] < 1 || c[dd] > R(c[bd], c[cd]) ? dd : c[ed] < 0 || c[ed] > 24 || 24 === c[ed] && (0 !== c[fd] || 0 !== c[gd] || 0 !== c[hd]) ? ed : c[fd] < 0 || c[fd] > 59 ? fd : c[gd] < 0 || c[gd] > 59 ? gd : c[hd] < 0 || c[hd] > 999 ? hd : -1, j(a)._overflowDayOfYear && (bd > b || b > dd) && (b = dd), j(a).overflow = b), a
  }

  function Z(b) {
    a.suppressDeprecationWarnings === !1 && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + b)
  }

  function $(a, b) {
    var c = !0,
      d = a + "\n" + (new Error).stack;
    return g(function() {
      return c && (Z(d), c = !1), b.apply(this, arguments)
    }, b)
  }

  function _(a, b) {
    kd[a] || (Z(b), kd[a] = !0)
  }

  function aa(a) {
    var b, c, d = a._i,
      e = ld.exec(d);
    if (e) {
      for (j(a).iso = !0, b = 0, c = md.length; c > b; b++)
        if (md[b][1].exec(d)) {
          a._f = md[b][0] + (e[6] || " ");
          break
        } for (b = 0, c = nd.length; c > b; b++)
        if (nd[b][1].exec(d)) {
          a._f += nd[b][0];
          break
        } d.match(Yc) && (a._f += "Z"), ta(a)
    } else a._isValid = !1
  }

  function ba(b) {
    var c = od.exec(b._i);
    return null !== c ? void(b._d = new Date(+c[1])) : (aa(b), void(b._isValid === !1 && (delete b._isValid, a.createFromInputFallback(b))))
  }

  function ca(a, b, c, d, e, f, g) {
    var h = new Date(a, b, c, d, e, f, g);
    return 1970 > a && h.setFullYear(a), h
  }

  function da(a) {
    var b = new Date(Date.UTC.apply(null, arguments));
    return 1970 > a && b.setUTCFullYear(a), b
  }

  function ea(a) {
    return fa(a) ? 366 : 365
  }

  function fa(a) {
    return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0
  }

  function ga() {
    return fa(this.year())
  }

  function ha(a, b, c) {
    var d, e = c - b,
      f = c - a.day();
    return f > e && (f -= 7), e - 7 > f && (f += 7), d = Aa(a).add(f, "d"), {
      week: Math.ceil(d.dayOfYear() / 7),
      year: d.year()
    }
  }

  function ia(a) {
    return ha(a, this._week.dow, this._week.doy).week
  }

  function ja() {
    return this._week.dow
  }

  function ka() {
    return this._week.doy
  }

  function la(a) {
    var b = this.localeData().week(this);
    return null == a ? b : this.add(7 * (a - b), "d")
  }

  function ma(a) {
    var b = ha(this, 1, 4).week;
    return null == a ? b : this.add(7 * (a - b), "d")
  }

  function na(a, b, c, d, e) {
    var f, g, h = da(a, 0, 1).getUTCDay();
    return h = 0 === h ? 7 : h, c = null != c ? c : e, f = e - h + (h > d ? 7 : 0) - (e > h ? 7 : 0), g = 7 * (b - 1) + (c - e) + f + 1, {
      year: g > 0 ? a : a - 1,
      dayOfYear: g > 0 ? g : ea(a - 1) + g
    }
  }

  function oa(a) {
    var b = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;
    return null == a ? b : this.add(a - b, "d")
  }

  function pa(a, b, c) {
    return null != a ? a : null != b ? b : c
  }

  function qa(a) {
    var b = new Date;
    return a._useUTC ? [b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()] : [b.getFullYear(), b.getMonth(), b.getDate()]
  }

  function ra(a) {
    var b, c, d, e, f = [];
    if (!a._d) {
      for (d = qa(a), a._w && null == a._a[dd] && null == a._a[cd] && sa(a), a._dayOfYear && (e = pa(a._a[bd], d[bd]), a._dayOfYear > ea(e) && (j(a)._overflowDayOfYear = !0), c = da(e, 0, a._dayOfYear), a._a[cd] = c.getUTCMonth(), a._a[dd] = c.getUTCDate()), b = 0; 3 > b && null == a._a[b]; ++b) a._a[b] = f[b] = d[b];
      for (; 7 > b; b++) a._a[b] = f[b] = null == a._a[b] ? 2 === b ? 1 : 0 : a._a[b];
      24 === a._a[ed] && 0 === a._a[fd] && 0 === a._a[gd] && 0 === a._a[hd] && (a._nextDay = !0, a._a[ed] = 0), a._d = (a._useUTC ? da : ca).apply(null, f), null != a._tzm && a._d.setUTCMinutes(a._d.getUTCMinutes() - a._tzm), a._nextDay && (a._a[ed] = 24)
    }
  }

  function sa(a) {
    var b, c, d, e, f, g, h;
    b = a._w, null != b.GG || null != b.W || null != b.E ? (f = 1, g = 4, c = pa(b.GG, a._a[bd], ha(Aa(), 1, 4).year), d = pa(b.W, 1), e = pa(b.E, 1)) : (f = a._locale._week.dow, g = a._locale._week.doy, c = pa(b.gg, a._a[bd], ha(Aa(), f, g).year), d = pa(b.w, 1), null != b.d ? (e = b.d, f > e && ++d) : e = null != b.e ? b.e + f : f), h = na(c, d, e, g, f), a._a[bd] = h.year, a._dayOfYear = h.dayOfYear
  }

  function ta(b) {
    if (b._f === a.ISO_8601) return void aa(b);
    b._a = [], j(b).empty = !0;
    var c, d, e, f, g, h = "" + b._i,
      i = h.length,
      k = 0;
    for (e = K(b._f, b._locale).match(Jc) || [], c = 0; c < e.length; c++) f = e[c], d = (h.match(M(f, b)) || [])[0], d && (g = h.substr(0, h.indexOf(d)), g.length > 0 && j(b).unusedInput.push(g), h = h.slice(h.indexOf(d) + d.length), k += d.length), Mc[f] ? (d ? j(b).empty = !1 : j(b).unusedTokens.push(f), Q(f, d, b)) : b._strict && !d && j(b).unusedTokens.push(f);
    j(b).charsLeftOver = i - k, h.length > 0 && j(b).unusedInput.push(h), j(b).bigHour === !0 && b._a[ed] <= 12 && b._a[ed] > 0 && (j(b).bigHour = void 0), b._a[ed] = ua(b._locale, b._a[ed], b._meridiem), ra(b), Y(b)
  }

  function ua(a, b, c) {
    var d;
    return null == c ? b : null != a.meridiemHour ? a.meridiemHour(b, c) : null != a.isPM ? (d = a.isPM(c), d && 12 > b && (b += 12), d || 12 !== b || (b = 0), b) : b
  }

  function va(a) {
    var b, c, d, e, f;
    if (0 === a._f.length) return j(a).invalidFormat = !0, void(a._d = new Date(0 / 0));
    for (e = 0; e < a._f.length; e++) f = 0, b = m({}, a), null != a._useUTC && (b._useUTC = a._useUTC), b._f = a._f[e], ta(b), k(b) && (f += j(b).charsLeftOver, f += 10 * j(b).unusedTokens.length, j(b).score = f, (null == d || d > f) && (d = f, c = b));
    g(a, c || b)
  }

  function wa(a) {
    if (!a._d) {
      var b = A(a._i);
      a._a = [b.year, b.month, b.day || b.date, b.hour, b.minute, b.second, b.millisecond], ra(a)
    }
  }

  function xa(a) {
    var b, e = a._i,
      f = a._f;
    return a._locale = a._locale || x(a._l), null === e || void 0 === f && "" === e ? l({
      nullInput: !0
    }) : ("string" == typeof e && (a._i = e = a._locale.preparse(e)), o(e) ? new n(Y(e)) : (c(f) ? va(a) : f ? ta(a) : d(e) ? a._d = e : ya(a), b = new n(Y(a)), b._nextDay && (b.add(1, "d"), b._nextDay = void 0), b))
  }

  function ya(b) {
    var f = b._i;
    void 0 === f ? b._d = new Date : d(f) ? b._d = new Date(+f) : "string" == typeof f ? ba(b) : c(f) ? (b._a = e(f.slice(0), function(a) {
      return parseInt(a, 10)
    }), ra(b)) : "object" == typeof f ? wa(b) : "number" == typeof f ? b._d = new Date(f) : a.createFromInputFallback(b)
  }

  function za(a, b, c, d, e) {
    var f = {};
    return "boolean" == typeof c && (d = c, c = void 0), f._isAMomentObject = !0, f._useUTC = f._isUTC = e, f._l = c, f._i = a, f._f = b, f._strict = d, xa(f)
  }

  function Aa(a, b, c, d) {
    return za(a, b, c, d, !1)
  }

  function Ba(a, b) {
    var d, e;
    if (1 === b.length && c(b[0]) && (b = b[0]), !b.length) return Aa();
    for (d = b[0], e = 1; e < b.length; ++e) b[e][a](d) && (d = b[e]);
    return d
  }

  function Ca() {
    var a = [].slice.call(arguments, 0);
    return Ba("isBefore", a)
  }

  function Da() {
    var a = [].slice.call(arguments, 0);
    return Ba("isAfter", a)
  }

  function Ea(a) {
    var b = A(a),
      c = b.year || 0,
      d = b.quarter || 0,
      e = b.month || 0,
      f = b.week || 0,
      g = b.day || 0,
      h = b.hour || 0,
      i = b.minute || 0,
      j = b.second || 0,
      k = b.millisecond || 0;
    this._milliseconds = +k + 1e3 * j + 6e4 * i + 36e5 * h, this._days = +g + 7 * f, this._months = +e + 3 * d + 12 * c, this._data = {}, this._locale = x(), this._bubble()
  }

  function Fa(a) {
    return a instanceof Ea
  }

  function Ga(a, b) {
    G(a, 0, 0, function() {
      var a = this.utcOffset(),
        c = "+";
      return 0 > a && (a = -a, c = "-"), c + F(~~(a / 60), 2) + b + F(~~a % 60, 2)
    })
  }

  function Ha(a) {
    var b = (a || "").match(Yc) || [],
      c = b[b.length - 1] || [],
      d = (c + "").match(td) || ["-", 0, 0],
      e = +(60 * d[1]) + p(d[2]);
    return "+" === d[0] ? e : -e
  }

  function Ia(b, c) {
    var e, f;
    return c._isUTC ? (e = c.clone(), f = (o(b) || d(b) ? +b : +Aa(b)) - +e, e._d.setTime(+e._d + f), a.updateOffset(e, !1), e) : Aa(b).local();
    return c._isUTC ? Aa(b).zone(c._offset || 0) : Aa(b).local()
  }

  function Ja(a) {
    return 15 * -Math.round(a._d.getTimezoneOffset() / 15)
  }

  function Ka(b, c) {
    var d, e = this._offset || 0;
    return null != b ? ("string" == typeof b && (b = Ha(b)), Math.abs(b) < 16 && (b = 60 * b), !this._isUTC && c && (d = Ja(this)), this._offset = b, this._isUTC = !0, null != d && this.add(d, "m"), e !== b && (!c || this._changeInProgress ? $a(this, Va(b - e, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, a.updateOffset(this, !0), this._changeInProgress = null)), this) : this._isUTC ? e : Ja(this)
  }

  function La(a, b) {
    return null != a ? ("string" != typeof a && (a = -a), this.utcOffset(a, b), this) : -this.utcOffset()
  }

  function Ma(a) {
    return this.utcOffset(0, a)
  }

  function Na(a) {
    return this._isUTC && (this.utcOffset(0, a), this._isUTC = !1, a && this.subtract(Ja(this), "m")), this
  }

  function Oa() {
    return this._tzm ? this.utcOffset(this._tzm) : "string" == typeof this._i && this.utcOffset(Ha(this._i)), this
  }

  function Pa(a) {
    return a = a ? Aa(a).utcOffset() : 0, (this.utcOffset() - a) % 60 === 0
  }

  function Qa() {
    return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset()
  }

  function Ra() {
    if (this._a) {
      var a = this._isUTC ? h(this._a) : Aa(this._a);
      return this.isValid() && q(this._a, a.toArray()) > 0
    }
    return !1
  }

  function Sa() {
    return !this._isUTC
  }

  function Ta() {
    return this._isUTC
  }

  function Ua() {
    return this._isUTC && 0 === this._offset
  }

  function Va(a, b) {
    var c, d, e, g = a,
      h = null;
    return Fa(a) ? g = {
      ms: a._milliseconds,
      d: a._days,
      M: a._months
    } : "number" == typeof a ? (g = {}, b ? g[b] = a : g.milliseconds = a) : (h = ud.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = {
      y: 0,
      d: p(h[dd]) * c,
      h: p(h[ed]) * c,
      m: p(h[fd]) * c,
      s: p(h[gd]) * c,
      ms: p(h[hd]) * c
    }) : (h = vd.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = {
      y: Wa(h[2], c),
      M: Wa(h[3], c),
      d: Wa(h[4], c),
      h: Wa(h[5], c),
      m: Wa(h[6], c),
      s: Wa(h[7], c),
      w: Wa(h[8], c)
    }) : null == g ? g = {} : "object" == typeof g && ("from" in g || "to" in g) && (e = Ya(Aa(g.from), Aa(g.to)), g = {}, g.ms = e.milliseconds, g.M = e.months), d = new Ea(g), Fa(a) && f(a, "_locale") && (d._locale = a._locale), d
  }

  function Wa(a, b) {
    var c = a && parseFloat(a.replace(",", "."));
    return (isNaN(c) ? 0 : c) * b
  }

  function Xa(a, b) {
    var c = {
      milliseconds: 0,
      months: 0
    };
    return c.months = b.month() - a.month() + 12 * (b.year() - a.year()), a.clone().add(c.months, "M").isAfter(b) && --c.months, c.milliseconds = +b - +a.clone().add(c.months, "M"), c
  }

  function Ya(a, b) {
    var c;
    return b = Ia(b, a), a.isBefore(b) ? c = Xa(a, b) : (c = Xa(b, a), c.milliseconds = -c.milliseconds, c.months = -c.months), c
  }

  function Za(a, b) {
    return function(c, d) {
      var e, f;
      return null === d || isNaN(+d) || (_(b, "moment()." + b + "(period, number) is deprecated. Please use moment()." + b + "(number, period)."), f = c, c = d, d = f), c = "string" == typeof c ? +c : c, e = Va(c, d), $a(this, e, a), this
    }
  }

  function $a(b, c, d, e) {
    var f = c._milliseconds,
      g = c._days,
      h = c._months;
    e = null == e ? !0 : e, f && b._d.setTime(+b._d + f * d), g && D(b, "Date", C(b, "Date") + g * d), h && V(b, C(b, "Month") + h * d), e && a.updateOffset(b, g || h)
  }

  function _a(a) {
    var b = a || Aa(),
      c = Ia(b, this).startOf("day"),
      d = this.diff(c, "days", !0),
      e = -6 > d ? "sameElse" : -1 > d ? "lastWeek" : 0 > d ? "lastDay" : 1 > d ? "sameDay" : 2 > d ? "nextDay" : 7 > d ? "nextWeek" : "sameElse";
    return this.format(this.localeData().calendar(e, this, Aa(b)))
  }

  function ab() {
    return new n(this)
  }

  function bb(a, b) {
    var c;
    return b = z("undefined" != typeof b ? b : "millisecond"), "millisecond" === b ? (a = o(a) ? a : Aa(a), +this > +a) : (c = o(a) ? +a : +Aa(a), c < +this.clone().startOf(b))
  }

  function cb(a, b) {
    var c;
    return b = z("undefined" != typeof b ? b : "millisecond"), "millisecond" === b ? (a = o(a) ? a : Aa(a), +a > +this) : (c = o(a) ? +a : +Aa(a), +this.clone().endOf(b) < c)
  }

  function db(a, b, c) {
    return this.isAfter(a, c) && this.isBefore(b, c)
  }

  function eb(a, b) {
    var c;
    return b = z(b || "millisecond"), "millisecond" === b ? (a = o(a) ? a : Aa(a), +this === +a) : (c = +Aa(a), +this.clone().startOf(b) <= c && c <= +this.clone().endOf(b))
  }

  function fb(a) {
    return 0 > a ? Math.ceil(a) : Math.floor(a)
  }

  function gb(a, b, c) {
    var d, e, f = Ia(a, this),
      g = 6e4 * (f.utcOffset() - this.utcOffset());
    return b = z(b), "year" === b || "month" === b || "quarter" === b ? (e = hb(this, f), "quarter" === b ? e /= 3 : "year" === b && (e /= 12)) : (d = this - f, e = "second" === b ? d / 1e3 : "minute" === b ? d / 6e4 : "hour" === b ? d / 36e5 : "day" === b ? (d - g) / 864e5 : "week" === b ? (d - g) / 6048e5 : d), c ? e : fb(e)
  }

  function hb(a, b) {
    var c, d, e = 12 * (b.year() - a.year()) + (b.month() - a.month()),
      f = a.clone().add(e, "months");
    return 0 > b - f ? (c = a.clone().add(e - 1, "months"), d = (b - f) / (f - c)) : (c = a.clone().add(e + 1, "months"), d = (b - f) / (c - f)), -(e + d)
  }

  function ib() {
    return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")
  }

  function jb() {
    var a = this.clone().utc();
    return 0 < a.year() && a.year() <= 9999 ? "function" == typeof Date.prototype.toISOString ? this.toDate().toISOString() : J(a, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : J(a, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")
  }

  function kb(b) {
    var c = J(this, b || a.defaultFormat);
    return this.localeData().postformat(c)
  }

  function lb(a, b) {
    return this.isValid() ? Va({
      to: this,
      from: a
    }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate()
  }

  function mb(a) {
    return this.from(Aa(), a)
  }

  function nb(a, b) {
    return this.isValid() ? Va({
      from: this,
      to: a
    }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate()
  }

  function ob(a) {
    return this.to(Aa(), a)
  }

  function pb(a) {
    var b;
    return void 0 === a ? this._locale._abbr : (b = x(a), null != b && (this._locale = b), this)
  }

  function qb() {
    return this._locale
  }

  function rb(a) {
    switch (a = z(a)) {
      case "year":
        this.month(0);
      case "quarter":
      case "month":
        this.date(1);
      case "week":
      case "isoWeek":
      case "day":
        this.hours(0);
      case "hour":
        this.minutes(0);
      case "minute":
        this.seconds(0);
      case "second":
        this.milliseconds(0)
    }
    return "week" === a && this.weekday(0), "isoWeek" === a && this.isoWeekday(1), "quarter" === a && this.month(3 * Math.floor(this.month() / 3)), this
  }

  function sb(a) {
    return a = z(a), void 0 === a || "millisecond" === a ? this : this.startOf(a).add(1, "isoWeek" === a ? "week" : a).subtract(1, "ms")
  }

  function tb() {
    return +this._d - 6e4 * (this._offset || 0)
  }

  function ub() {
    return Math.floor(+this / 1e3)
  }

  function vb() {
    return this._offset ? new Date(+this) : this._d
  }

  function wb() {
    var a = this;
    return [a.year(), a.month(), a.date(), a.hour(), a.minute(), a.second(), a.millisecond()]
  }

  function xb() {
    return k(this)
  }

  function yb() {
    return g({}, j(this))
  }

  function zb() {
    return j(this).overflow
  }

  function Ab(a, b) {
    G(0, [a, a.length], 0, b)
  }

  function Bb(a, b, c) {
    return ha(Aa([a, 11, 31 + b - c]), b, c).week
  }

  function Cb(a) {
    var b = ha(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
    return null == a ? b : this.add(a - b, "y")
  }

  function Db(a) {
    var b = ha(this, 1, 4).year;
    return null == a ? b : this.add(a - b, "y")
  }

  function Eb() {
    return Bb(this.year(), 1, 4)
  }

  function Fb() {
    var a = this.localeData()._week;
    return Bb(this.year(), a.dow, a.doy)
  }

  function Gb(a) {
    return null == a ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (a - 1) + this.month() % 3)
  }

  function Hb(a, b) {
    if ("string" == typeof a)
      if (isNaN(a)) {
        if (a = b.weekdaysParse(a), "number" != typeof a) return null
      } else a = parseInt(a, 10);
    return a
  }

  function Ib(a) {
    return this._weekdays[a.day()]
  }

  function Jb(a) {
    return this._weekdaysShort[a.day()]
  }

  function Kb(a) {
    return this._weekdaysMin[a.day()]
  }

  function Lb(a) {
    var b, c, d;
    for (this._weekdaysParse || (this._weekdaysParse = []), b = 0; 7 > b; b++)
      if (this._weekdaysParse[b] || (c = Aa([2e3, 1]).day(b), d = "^" + this.weekdays(c, "") + "|^" + this.weekdaysShort(c, "") + "|^" + this.weekdaysMin(c, ""), this._weekdaysParse[b] = new RegExp(d.replace(".", ""), "i")), this._weekdaysParse[b].test(a)) return b
  }

  function Mb(a) {
    var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
    return null != a ? (a = Hb(a, this.localeData()), this.add(a - b, "d")) : b
  }

  function Nb(a) {
    var b = (this.day() + 7 - this.localeData()._week.dow) % 7;
    return null == a ? b : this.add(a - b, "d")
  }

  function Ob(a) {
    return null == a ? this.day() || 7 : this.day(this.day() % 7 ? a : a - 7)
  }

  function Pb(a, b) {
    G(a, 0, 0, function() {
      return this.localeData().meridiem(this.hours(), this.minutes(), b)
    })
  }

  function Qb(a, b) {
    return b._meridiemParse
  }

  function Rb(a) {
    return "p" === (a + "").toLowerCase().charAt(0)
  }

  function Sb(a, b, c) {
    return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM"
  }

  function Tb(a) {
    G(0, [a, 3], 0, "millisecond")
  }

  function Ub() {
    return this._isUTC ? "UTC" : ""
  }

  function Vb() {
    return this._isUTC ? "Coordinated Universal Time" : ""
  }

  function Wb(a) {
    return Aa(1e3 * a)
  }

  function Xb() {
    return Aa.apply(null, arguments).parseZone()
  }

  function Yb(a, b, c) {
    var d = this._calendar[a];
    return "function" == typeof d ? d.call(b, c) : d
  }

  function Zb(a) {
    var b = this._longDateFormat[a];
    return !b && this._longDateFormat[a.toUpperCase()] && (b = this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(a) {
      return a.slice(1)
    }), this._longDateFormat[a] = b), b
  }

  function $b() {
    return this._invalidDate
  }

  function _b(a) {
    return this._ordinal.replace("%d", a)
  }

  function ac(a) {
    return a
  }

  function bc(a, b, c, d) {
    var e = this._relativeTime[c];
    return "function" == typeof e ? e(a, b, c, d) : e.replace(/%d/i, a)
  }

  function cc(a, b) {
    var c = this._relativeTime[a > 0 ? "future" : "past"];
    return "function" == typeof c ? c(b) : c.replace(/%s/i, b)
  }

  function dc(a) {
    var b, c;
    for (c in a) b = a[c], "function" == typeof b ? this[c] = b : this["_" + c] = b;
    this._ordinalParseLenient = new RegExp(this._ordinalParse.source + "|" + /\d{1,2}/.source)
  }

  function ec(a, b, c, d) {
    var e = x(),
      f = h().set(d, b);
    return e[c](f, a)
  }

  function fc(a, b, c, d, e) {
    if ("number" == typeof a && (b = a, a = void 0), a = a || "", null != b) return ec(a, b, c, e);
    var f, g = [];
    for (f = 0; d > f; f++) g[f] = ec(a, f, c, e);
    return g
  }

  function gc(a, b) {
    return fc(a, b, "months", 12, "month")
  }

  function hc(a, b) {
    return fc(a, b, "monthsShort", 12, "month")
  }

  function ic(a, b) {
    return fc(a, b, "weekdays", 7, "day")
  }

  function jc(a, b) {
    return fc(a, b, "weekdaysShort", 7, "day")
  }

  function kc(a, b) {
    return fc(a, b, "weekdaysMin", 7, "day")
  }

  function lc() {
    var a = this._data;
    return this._milliseconds = Rd(this._milliseconds), this._days = Rd(this._days), this._months = Rd(this._months), a.milliseconds = Rd(a.milliseconds), a.seconds = Rd(a.seconds), a.minutes = Rd(a.minutes), a.hours = Rd(a.hours), a.months = Rd(a.months), a.years = Rd(a.years), this
  }

  function mc(a, b, c, d) {
    var e = Va(b, c);
    return a._milliseconds += d * e._milliseconds, a._days += d * e._days, a._months += d * e._months, a._bubble()
  }

  function nc(a, b) {
    return mc(this, a, b, 1)
  }

  function oc(a, b) {
    return mc(this, a, b, -1)
  }

  function pc() {
    var a, b, c, d = this._milliseconds,
      e = this._days,
      f = this._months,
      g = this._data,
      h = 0;
    return g.milliseconds = d % 1e3, a = fb(d / 1e3), g.seconds = a % 60, b = fb(a / 60), g.minutes = b % 60, c = fb(b / 60), g.hours = c % 24, e += fb(c / 24), h = fb(qc(e)), e -= fb(rc(h)), f += fb(e / 30), e %= 30, h += fb(f / 12), f %= 12, g.days = e, g.months = f, g.years = h, this
  }

  function qc(a) {
    return 400 * a / 146097
  }

  function rc(a) {
    return 146097 * a / 400
  }

  function sc(a) {
    var b, c, d = this._milliseconds;
    if (a = z(a), "month" === a || "year" === a) return b = this._days + d / 864e5, c = this._months + 12 * qc(b), "month" === a ? c : c / 12;
    switch (b = this._days + Math.round(rc(this._months / 12)), a) {
      case "week":
        return b / 7 + d / 6048e5;
      case "day":
        return b + d / 864e5;
      case "hour":
        return 24 * b + d / 36e5;
      case "minute":
        return 1440 * b + d / 6e4;
      case "second":
        return 86400 * b + d / 1e3;
      case "millisecond":
        return Math.floor(864e5 * b) + d;
      default:
        throw new Error("Unknown unit " + a)
    }
  }

  function tc() {
    return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * p(this._months / 12)
  }

  function uc(a) {
    return function() {
      return this.as(a)
    }
  }

  function vc(a) {
    return a = z(a), this[a + "s"]()
  }

  function wc(a) {
    return function() {
      return this._data[a]
    }
  }

  function xc() {
    return fb(this.days() / 7)
  }

  function yc(a, b, c, d, e) {
    return e.relativeTime(b || 1, !!c, a, d)
  }

  function zc(a, b, c) {
    var d = Va(a).abs(),
      e = fe(d.as("s")),
      f = fe(d.as("m")),
      g = fe(d.as("h")),
      h = fe(d.as("d")),
      i = fe(d.as("M")),
      j = fe(d.as("y")),
      k = e < ge.s && ["s", e] || 1 === f && ["m"] || f < ge.m && ["mm", f] || 1 === g && ["h"] || g < ge.h && ["hh", g] || 1 === h && ["d"] || h < ge.d && ["dd", h] || 1 === i && ["M"] || i < ge.M && ["MM", i] || 1 === j && ["y"] || ["yy", j];
    return k[2] = b, k[3] = +a > 0, k[4] = c, yc.apply(null, k)
  }

  function Ac(a, b) {
    return void 0 === ge[a] ? !1 : void 0 === b ? ge[a] : (ge[a] = b, !0)
  }

  function Bc(a) {
    var b = this.localeData(),
      c = zc(this, !a, b);
    return a && (c = b.pastFuture(+this, c)), b.postformat(c)
  }

  function Cc() {
    var a = he(this.years()),
      b = he(this.months()),
      c = he(this.days()),
      d = he(this.hours()),
      e = he(this.minutes()),
      f = he(this.seconds() + this.milliseconds() / 1e3),
      g = this.asSeconds();
    return g ? (0 > g ? "-" : "") + "P" + (a ? a + "Y" : "") + (b ? b + "M" : "") + (c ? c + "D" : "") + (d || e || f ? "T" : "") + (d ? d + "H" : "") + (e ? e + "M" : "") + (f ? f + "S" : "") : "P0D"
  }
  var Dc, Ec, Fc = a.momentProperties = [],
    Gc = !1,
    Hc = {},
    Ic = {},
    Jc = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
    Kc = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
    Lc = {},
    Mc = {},
    Nc = /\d/,
    Oc = /\d\d/,
    Pc = /\d{3}/,
    Qc = /\d{4}/,
    Rc = /[+-]?\d{6}/,
    Sc = /\d\d?/,
    Tc = /\d{1,3}/,
    Uc = /\d{1,4}/,
    Vc = /[+-]?\d{1,6}/,
    Wc = /\d+/,
    Xc = /[+-]?\d+/,
    Yc = /Z|[+-]\d\d:?\d\d/gi,
    Zc = /[+-]?\d+(\.\d{1,3})?/,
    $c = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
    _c = {},
    ad = {},
    bd = 0,
    cd = 1,
    dd = 2,
    ed = 3,
    fd = 4,
    gd = 5,
    hd = 6;
  G("M", ["MM", 2], "Mo", function() {
    return this.month() + 1
  }), G("MMM", 0, 0, function(a) {
    return this.localeData().monthsShort(this, a)
  }), G("MMMM", 0, 0, function(a) {
    return this.localeData().months(this, a)
  }), y("month", "M"), L("M", Sc), L("MM", Sc, Oc), L("MMM", $c), L("MMMM", $c), O(["M", "MM"], function(a, b) {
    b[cd] = p(a) - 1
  }), O(["MMM", "MMMM"], function(a, b, c, d) {
    var e = c._locale.monthsParse(a, d, c._strict);
    null != e ? b[cd] = e : j(c).invalidMonth = a
  });
  var id = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    jd = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    kd = {};
  a.suppressDeprecationWarnings = !1;
  var ld = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
    md = [
      ["YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/],
      ["YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/],
      ["GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/],
      ["GGGG-[W]WW", /\d{4}-W\d{2}/],
      ["YYYY-DDD", /\d{4}-\d{3}/]
    ],
    nd = [
      ["HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d+/],
      ["HH:mm:ss", /(T| )\d\d:\d\d:\d\d/],
      ["HH:mm", /(T| )\d\d:\d\d/],
      ["HH", /(T| )\d\d/]
    ],
    od = /^\/?Date\((\-?\d+)/i;
  a.createFromInputFallback = $("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.", function(a) {
    a._d = new Date(a._i + (a._useUTC ? " UTC" : ""))
  }), G(0, ["YY", 2], 0, function() {
    return this.year() % 100
  }), G(0, ["YYYY", 4], 0, "year"), G(0, ["YYYYY", 5], 0, "year"), G(0, ["YYYYYY", 6, !0], 0, "year"), y("year", "y"), L("Y", Xc), L("YY", Sc, Oc), L("YYYY", Uc, Qc), L("YYYYY", Vc, Rc), L("YYYYYY", Vc, Rc), O(["YYYY", "YYYYY", "YYYYYY"], bd), O("YY", function(b, c) {
    c[bd] = a.parseTwoDigitYear(b)
  }), a.parseTwoDigitYear = function(a) {
    return p(a) + (p(a) > 68 ? 1900 : 2e3)
  };
  var pd = B("FullYear", !1);
  G("w", ["ww", 2], "wo", "week"), G("W", ["WW", 2], "Wo", "isoWeek"), y("week", "w"), y("isoWeek", "W"), L("w", Sc), L("ww", Sc, Oc), L("W", Sc), L("WW", Sc, Oc), P(["w", "ww", "W", "WW"], function(a, b, c, d) {
    b[d.substr(0, 1)] = p(a)
  });
  var qd = {
    dow: 0,
    doy: 6
  };
  G("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), y("dayOfYear", "DDD"), L("DDD", Tc), L("DDDD", Pc), O(["DDD", "DDDD"], function(a, b, c) {
    c._dayOfYear = p(a)
  }), a.ISO_8601 = function() {};
  var rd = $("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548", function() {
      var a = Aa.apply(null, arguments);
      return this > a ? this : a
    }),
    sd = $("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548", function() {
      var a = Aa.apply(null, arguments);
      return a > this ? this : a
    });
  Ga("Z", ":"), Ga("ZZ", ""), L("Z", Yc), L("ZZ", Yc), O(["Z", "ZZ"], function(a, b, c) {
    c._useUTC = !0, c._tzm = Ha(a)
  });
  var td = /([\+\-]|\d\d)/gi;
  a.updateOffset = function() {};
  var ud = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,
    vd = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;
  Va.fn = Ea.prototype;
  var wd = Za(1, "add"),
    xd = Za(-1, "subtract");
  a.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
  var yd = $("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function(a) {
    return void 0 === a ? this.localeData() : this.locale(a)
  });
  G(0, ["gg", 2], 0, function() {
    return this.weekYear() % 100
  }), G(0, ["GG", 2], 0, function() {
    return this.isoWeekYear() % 100
  }), Ab("gggg", "weekYear"), Ab("ggggg", "weekYear"), Ab("GGGG", "isoWeekYear"), Ab("GGGGG", "isoWeekYear"), y("weekYear", "gg"), y("isoWeekYear", "GG"), L("G", Xc), L("g", Xc), L("GG", Sc, Oc), L("gg", Sc, Oc), L("GGGG", Uc, Qc), L("gggg", Uc, Qc), L("GGGGG", Vc, Rc), L("ggggg", Vc, Rc), P(["gggg", "ggggg", "GGGG", "GGGGG"], function(a, b, c, d) {
    b[d.substr(0, 2)] = p(a)
  }), P(["gg", "GG"], function(b, c, d, e) {
    c[e] = a.parseTwoDigitYear(b)
  }), G("Q", 0, 0, "quarter"), y("quarter", "Q"), L("Q", Nc), O("Q", function(a, b) {
    b[cd] = 3 * (p(a) - 1)
  }), G("D", ["DD", 2], "Do", "date"), y("date", "D"), L("D", Sc), L("DD", Sc, Oc), L("Do", function(a, b) {
    return a ? b._ordinalParse : b._ordinalParseLenient
  }), O(["D", "DD"], dd), O("Do", function(a, b) {
    b[dd] = p(a.match(Sc)[0], 10)
  });
  var zd = B("Date", !0);
  G("d", 0, "do", "day"), G("dd", 0, 0, function(a) {
    return this.localeData().weekdaysMin(this, a)
  }), G("ddd", 0, 0, function(a) {
    return this.localeData().weekdaysShort(this, a)
  }), G("dddd", 0, 0, function(a) {
    return this.localeData().weekdays(this, a)
  }), G("e", 0, 0, "weekday"), G("E", 0, 0, "isoWeekday"), y("day", "d"), y("weekday", "e"), y("isoWeekday", "E"), L("d", Sc), L("e", Sc), L("E", Sc), L("dd", $c), L("ddd", $c), L("dddd", $c), P(["dd", "ddd", "dddd"], function(a, b, c) {
    var d = c._locale.weekdaysParse(a);
    null != d ? b.d = d : j(c).invalidWeekday = a
  }), P(["d", "e", "E"], function(a, b, c, d) {
    b[d] = p(a)
  });
  var Ad = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    Bd = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    Cd = "Su_Mo_Tu_We_Th_Fr_Sa".split("_");
  G("H", ["HH", 2], 0, "hour"), G("h", ["hh", 2], 0, function() {
    return this.hours() % 12 || 12
  }), Pb("a", !0), Pb("A", !1), y("hour", "h"), L("a", Qb), L("A", Qb), L("H", Sc), L("h", Sc), L("HH", Sc, Oc), L("hh", Sc, Oc), O(["H", "HH"], ed), O(["a", "A"], function(a, b, c) {
    c._isPm = c._locale.isPM(a), c._meridiem = a
  }), O(["h", "hh"], function(a, b, c) {
    b[ed] = p(a), j(c).bigHour = !0
  });
  var Dd = /[ap]\.?m?\.?/i,
    Ed = B("Hours", !0);
  G("m", ["mm", 2], 0, "minute"), y("minute", "m"), L("m", Sc), L("mm", Sc, Oc), O(["m", "mm"], fd);
  var Fd = B("Minutes", !1);
  G("s", ["ss", 2], 0, "second"), y("second", "s"), L("s", Sc), L("ss", Sc, Oc), O(["s", "ss"], gd);
  var Gd = B("Seconds", !1);
  G("S", 0, 0, function() {
    return ~~(this.millisecond() / 100)
  }), G(0, ["SS", 2], 0, function() {
    return ~~(this.millisecond() / 10)
  }), Tb("SSS"), Tb("SSSS"), y("millisecond", "ms"), L("S", Tc, Nc), L("SS", Tc, Oc), L("SSS", Tc, Pc), L("SSSS", Wc), O(["S", "SS", "SSS", "SSSS"], function(a, b) {
    b[hd] = p(1e3 * ("0." + a))
  });
  var Hd = B("Milliseconds", !1);
  G("z", 0, 0, "zoneAbbr"), G("zz", 0, 0, "zoneName");
  var Id = n.prototype;
  Id.add = wd, Id.calendar = _a, Id.clone = ab, Id.diff = gb, Id.endOf = sb, Id.format = kb, Id.from = lb, Id.fromNow = mb, Id.to = nb, Id.toNow = ob, Id.get = E, Id.invalidAt = zb, Id.isAfter = bb, Id.isBefore = cb, Id.isBetween = db, Id.isSame = eb, Id.isValid = xb, Id.lang = yd, Id.locale = pb, Id.localeData = qb, Id.max = sd, Id.min = rd, Id.parsingFlags = yb, Id.set = E, Id.startOf = rb, Id.subtract = xd, Id.toArray = wb, Id.toDate = vb, Id.toISOString = jb, Id.toJSON = jb, Id.toString = ib, Id.unix = ub, Id.valueOf = tb, Id.year = pd, Id.isLeapYear = ga, Id.weekYear = Cb, Id.isoWeekYear = Db, Id.quarter = Id.quarters = Gb, Id.month = W, Id.daysInMonth = X, Id.week = Id.weeks = la, Id.isoWeek = Id.isoWeeks = ma, Id.weeksInYear = Fb, Id.isoWeeksInYear = Eb, Id.date = zd, Id.day = Id.days = Mb, Id.weekday = Nb, Id.isoWeekday = Ob, Id.dayOfYear = oa, Id.hour = Id.hours = Ed, Id.minute = Id.minutes = Fd, Id.second = Id.seconds = Gd, Id.millisecond = Id.milliseconds = Hd, Id.utcOffset = Ka, Id.utc = Ma, Id.local = Na, Id.parseZone = Oa, Id.hasAlignedHourOffset = Pa, Id.isDST = Qa, Id.isDSTShifted = Ra, Id.isLocal = Sa, Id.isUtcOffset = Ta, Id.isUtc = Ua, Id.isUTC = Ua, Id.zoneAbbr = Ub, Id.zoneName = Vb, Id.dates = $("dates accessor is deprecated. Use date instead.", zd), Id.months = $("months accessor is deprecated. Use month instead", W), Id.years = $("years accessor is deprecated. Use year instead", pd), Id.zone = $("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779", La);
  var Jd = Id,
    Kd = {
      sameDay: "[Today at] LT",
      nextDay: "[Tomorrow at] LT",
      nextWeek: "dddd [at] LT",
      lastDay: "[Yesterday at] LT",
      lastWeek: "[Last] dddd [at] LT",
      sameElse: "L"
    },
    Ld = {
      LTS: "h:mm:ss A",
      LT: "h:mm A",
      L: "MM/DD/YYYY",
      LL: "MMMM D, YYYY",
      LLL: "MMMM D, YYYY LT",
      LLLL: "dddd, MMMM D, YYYY LT"
    },
    Md = "Invalid date",
    Nd = "%d",
    Od = /\d{1,2}/,
    Pd = {
      future: "in %s",
      past: "%s ago",
      s: "a few seconds",
      m: "a minute",
      mm: "%d minutes",
      h: "an hour",
      hh: "%d hours",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years"
    },
    Qd = r.prototype;
  Qd._calendar = Kd, Qd.calendar = Yb, Qd._longDateFormat = Ld, Qd.longDateFormat = Zb, Qd._invalidDate = Md, Qd.invalidDate = $b, Qd._ordinal = Nd, Qd.ordinal = _b, Qd._ordinalParse = Od, Qd.preparse = ac, Qd.postformat = ac, Qd._relativeTime = Pd, Qd.relativeTime = bc, Qd.pastFuture = cc, Qd.set = dc, Qd.months = S, Qd._months = id, Qd.monthsShort = T, Qd._monthsShort = jd, Qd.monthsParse = U, Qd.week = ia, Qd._week = qd, Qd.firstDayOfYear = ka, Qd.firstDayOfWeek = ja, Qd.weekdays = Ib, Qd._weekdays = Ad, Qd.weekdaysMin = Kb, Qd._weekdaysMin = Cd, Qd.weekdaysShort = Jb, Qd._weekdaysShort = Bd, Qd.weekdaysParse = Lb, Qd.isPM = Rb, Qd._meridiemParse = Dd, Qd.meridiem = Sb, v("en", {
    ordinalParse: /\d{1,2}(th|st|nd|rd)/,
    ordinal: function(a) {
      var b = a % 10,
        c = 1 === p(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
      return a + c
    }
  }), a.lang = $("moment.lang is deprecated. Use moment.locale instead.", v), a.langData = $("moment.langData is deprecated. Use moment.localeData instead.", x);
  var Rd = Math.abs,
    Sd = uc("ms"),
    Td = uc("s"),
    Ud = uc("m"),
    Vd = uc("h"),
    Wd = uc("d"),
    Xd = uc("w"),
    Yd = uc("M"),
    Zd = uc("y"),
    $d = wc("milliseconds"),
    _d = wc("seconds"),
    ae = wc("minutes"),
    be = wc("hours"),
    ce = wc("days"),
    de = wc("months"),
    ee = wc("years"),
    fe = Math.round,
    ge = {
      s: 45,
      m: 45,
      h: 22,
      d: 26,
      M: 11
    },
    he = Math.abs,
    ie = Ea.prototype;
  ie.abs = lc, ie.add = nc, ie.subtract = oc, ie.as = sc, ie.asMilliseconds = Sd, ie.asSeconds = Td, ie.asMinutes = Ud, ie.asHours = Vd, ie.asDays = Wd, ie.asWeeks = Xd, ie.asMonths = Yd, ie.asYears = Zd, ie.valueOf = tc, ie._bubble = pc, ie.get = vc, ie.milliseconds = $d, ie.seconds = _d, ie.minutes = ae, ie.hours = be, ie.days = ce, ie.weeks = xc, ie.months = de, ie.years = ee, ie.humanize = Bc, ie.toISOString = Cc, ie.toString = Cc, ie.toJSON = Cc, ie.locale = pb, ie.localeData = qb, ie.toIsoString = $("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", Cc), ie.lang = yd, G("X", 0, 0, "unix"), G("x", 0, 0, "valueOf"), L("x", Xc), L("X", Zc), O("X", function(a, b, c) {
    c._d = new Date(1e3 * parseFloat(a, 10))
  }), O("x", function(a, b, c) {
    c._d = new Date(p(a))
  }), a.version = "2.10.3", b(Aa), a.fn = Jd, a.min = Ca, a.max = Da, a.utc = h, a.unix = Wb, a.months = gc, a.isDate = d, a.locale = v, a.invalid = l, a.duration = Va, a.isMoment = o, a.weekdays = ic, a.parseZone = Xb, a.localeData = x, a.isDuration = Fa, a.monthsShort = hc, a.weekdaysMin = kc, a.defineLocale = w, a.weekdaysShort = jc, a.normalizeUnits = z, a.relativeTimeThreshold = Ac;
  var je = a;
  return je
});
/*! RESOURCE: /scripts/app.snTestRunner/thirdparty/html2canvas.min.js */
/*
  html2canvas 0.5.0-beta3 <http://html2canvas.hertzen.com>
  Copyright (c) 2016 Niklas von Hertzen

  Released under  License
*/
! function(e) {
  if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
  else if ("function" == typeof define && define.amd) define([], e);
  else {
    var n;
    "undefined" != typeof window ? n = window : "undefined" != typeof global ? n = global : "undefined" != typeof self && (n = self), n.html2canvas = e()
  }
}(function() {
  var e;
  return function n(e, f, o) {
    function d(t, l) {
      if (!f[t]) {
        if (!e[t]) {
          var s = "function" == typeof require && require;
          if (!l && s) return s(t, !0);
          if (i) return i(t, !0);
          var u = new Error("Cannot find module '" + t + "'");
          throw u.code = "MODULE_NOT_FOUND", u
        }
        var a = f[t] = {
          exports: {}
        };
        e[t][0].call(a.exports, function(n) {
          var f = e[t][1][n];
          return d(f ? f : n)
        }, a, a.exports, n, e, f, o)
      }
      return f[t].exports
    }
    for (var i = "function" == typeof require && require, t = 0; t < o.length; t++) d(o[t]);
    return d
  }({
    1: [function(n, f, o) {
      (function(n) {
        ! function(d) {
          function i(e) {
            throw RangeError(I[e])
          }

          function t(e, n) {
            for (var f = e.length; f--;) e[f] = n(e[f]);
            return e
          }

          function l(e, n) {
            return t(e.split(H), n).join(".")
          }

          function s(e) {
            for (var n, f, o = [], d = 0, i = e.length; i > d;) n = e.charCodeAt(d++), n >= 55296 && 56319 >= n && i > d ? (f = e.charCodeAt(d++), 56320 == (64512 & f) ? o.push(((1023 & n) << 10) + (1023 & f) + 65536) : (o.push(n), d--)) : o.push(n);
            return o
          }

          function u(e) {
            return t(e, function(e) {
              var n = "";
              return e > 65535 && (e -= 65536, n += L(e >>> 10 & 1023 | 55296), e = 56320 | 1023 & e), n += L(e)
            }).join("")
          }

          function a(e) {
            return 10 > e - 48 ? e - 22 : 26 > e - 65 ? e - 65 : 26 > e - 97 ? e - 97 : k
          }

          function p(e, n) {
            return e + 22 + 75 * (26 > e) - ((0 != n) << 5)
          }

          function c(e, n, f) {
            var o = 0;
            for (e = f ? K(e / B) : e >> 1, e += K(e / n); e > J * z >> 1; o += k) e = K(e / J);
            return K(o + (J + 1) * e / (e + A))
          }

          function y(e) {
            var n, f, o, d, t, l, s, p, y, m, r = [],
              v = e.length,
              w = 0,
              b = D,
              g = C;
            for (f = e.lastIndexOf(E), 0 > f && (f = 0), o = 0; f > o; ++o) e.charCodeAt(o) >= 128 && i("not-basic"), r.push(e.charCodeAt(o));
            for (d = f > 0 ? f + 1 : 0; v > d;) {
              for (t = w, l = 1, s = k; d >= v && i("invalid-input"), p = a(e.charCodeAt(d++)), (p >= k || p > K((j - w) / l)) && i("overflow"), w += p * l, y = g >= s ? q : s >= g + z ? z : s - g, !(y > p); s += k) m = k - y, l > K(j / m) && i("overflow"), l *= m;
              n = r.length + 1, g = c(w - t, n, 0 == t), K(w / n) > j - b && i("overflow"), b += K(w / n), w %= n, r.splice(w++, 0, b)
            }
            return u(r)
          }

          function m(e) {
            var n, f, o, d, t, l, u, a, y, m, r, v, w, b, g, h = [];
            for (e = s(e), v = e.length, n = D, f = 0, t = C, l = 0; v > l; ++l) r = e[l], 128 > r && h.push(L(r));
            for (o = d = h.length, d && h.push(E); v > o;) {
              for (u = j, l = 0; v > l; ++l) r = e[l], r >= n && u > r && (u = r);
              for (w = o + 1, u - n > K((j - f) / w) && i("overflow"), f += (u - n) * w, n = u, l = 0; v > l; ++l)
                if (r = e[l], n > r && ++f > j && i("overflow"), r == n) {
                  for (a = f, y = k; m = t >= y ? q : y >= t + z ? z : y - t, !(m > a); y += k) g = a - m, b = k - m, h.push(L(p(m + g % b, 0))), a = K(g / b);
                  h.push(L(p(a, 0))), t = c(f, w, o == d), f = 0, ++o
                }++ f, ++n
            }
            return h.join("")
          }

          function r(e) {
            return l(e, function(e) {
              return F.test(e) ? y(e.slice(4).toLowerCase()) : e
            })
          }

          function v(e) {
            return l(e, function(e) {
              return G.test(e) ? "xn--" + m(e) : e
            })
          }
          var w = "object" == typeof o && o,
            b = "object" == typeof f && f && f.exports == w && f,
            g = "object" == typeof n && n;
          (g.global === g || g.window === g) && (d = g);
          var h, x, j = 2147483647,
            k = 36,
            q = 1,
            z = 26,
            A = 38,
            B = 700,
            C = 72,
            D = 128,
            E = "-",
            F = /^xn--/,
            G = /[^ -~]/,
            H = /\x2E|\u3002|\uFF0E|\uFF61/g,
            I = {
              overflow: "Overflow: input needs wider integers to process",
              "not-basic": "Illegal input >= 0x80 (not a basic code point)",
              "invalid-input": "Invalid input"
            },
            J = k - q,
            K = Math.floor,
            L = String.fromCharCode;
          if (h = {
              version: "1.2.4",
              ucs2: {
                decode: s,
                encode: u
              },
              decode: y,
              encode: m,
              toASCII: v,
              toUnicode: r
            }, "function" == typeof e && "object" == typeof e.amd && e.amd) e("punycode", function() {
            return h
          });
          else if (w && !w.nodeType)
            if (b) b.exports = h;
            else
              for (x in h) h.hasOwnProperty(x) && (w[x] = h[x]);
          else d.punycode = h
        }(this)
      }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {}],
    2: [function(e, n) {
      function f(e, n, f) {
        !e.defaultView || n === e.defaultView.pageXOffset && f === e.defaultView.pageYOffset || e.defaultView.scrollTo(n, f)
      }

      function o(e, n) {
        try {
          n && (n.width = e.width, n.height = e.height, n.getContext("2d").putImageData(e.getContext("2d").getImageData(0, 0, e.width, e.height), 0, 0))
        } catch (f) {
          t("Unable to copy canvas content from", e, f)
        }
      }

      function d(e, n) {
        for (var f = 3 === e.nodeType ? document.createTextNode(e.nodeValue) : e.cloneNode(!1), i = e.firstChild; i;)(n === !0 || 1 !== i.nodeType || "SCRIPT" !== i.nodeName) && f.appendChild(d(i, n)), i = i.nextSibling;
        return 1 === e.nodeType && (f._scrollTop = e.scrollTop, f._scrollLeft = e.scrollLeft, "CANVAS" === e.nodeName ? o(e, f) : ("TEXTAREA" === e.nodeName || "SELECT" === e.nodeName) && (f.value = e.value)), f
      }

      function i(e) {
        if (1 === e.nodeType) {
          e.scrollTop = e._scrollTop, e.scrollLeft = e._scrollLeft;
          for (var n = e.firstChild; n;) i(n), n = n.nextSibling
        }
      }
      var t = e("./log");
      n.exports = function(e, n, o, t, l, s, u) {
        var a = d(e.documentElement, l.javascriptEnabled),
          p = n.createElement("iframe");
        return p.className = "html2canvas-container", p.style.visibility = "hidden", p.style.position = "fixed", p.style.left = "-10000px", p.style.top = "0px", p.style.border = "0", p.width = o, p.height = t, p.scrolling = "no", n.body.appendChild(p), new Promise(function(n) {
          var o = p.contentWindow.document;
          p.contentWindow.onload = p.onload = function() {
            var e = setInterval(function() {
              o.body.childNodes.length > 0 && (i(o.documentElement), clearInterval(e), "view" === l.type && (p.contentWindow.scrollTo(s, u), !/(iPad|iPhone|iPod)/g.test(navigator.userAgent) || p.contentWindow.scrollY === u && p.contentWindow.scrollX === s || (o.documentElement.style.top = -u + "px", o.documentElement.style.left = -s + "px", o.documentElement.style.position = "absolute")), n(p))
            }, 50)
          }, o.open(), o.write("<!DOCTYPE html><html></html>"), f(e, s, u), o.replaceChild(o.adoptNode(a), o.documentElement), o.close()
        })
      }
    }, {
      "./log": 13
    }],
    3: [function(e, n) {
      function f(e) {
        this.r = 0, this.g = 0, this.b = 0, this.a = null;
        this.fromArray(e) || this.namedColor(e) || this.rgb(e) || this.rgba(e) || this.hex6(e) || this.hex3(e)
      }
      f.prototype.darken = function(e) {
        var n = 1 - e;
        return new f([Math.round(this.r * n), Math.round(this.g * n), Math.round(this.b * n), this.a])
      }, f.prototype.isTransparent = function() {
        return 0 === this.a
      }, f.prototype.isBlack = function() {
        return 0 === this.r && 0 === this.g && 0 === this.b
      }, f.prototype.fromArray = function(e) {
        return Array.isArray(e) && (this.r = Math.min(e[0], 255), this.g = Math.min(e[1], 255), this.b = Math.min(e[2], 255), e.length > 3 && (this.a = e[3])), Array.isArray(e)
      };
      var o = /^#([a-f0-9]{3})$/i;
      f.prototype.hex3 = function(e) {
        var n = null;
        return null !== (n = e.match(o)) && (this.r = parseInt(n[1][0] + n[1][0], 16), this.g = parseInt(n[1][1] + n[1][1], 16), this.b = parseInt(n[1][2] + n[1][2], 16)), null !== n
      };
      var d = /^#([a-f0-9]{6})$/i;
      f.prototype.hex6 = function(e) {
        var n = null;
        return null !== (n = e.match(d)) && (this.r = parseInt(n[1].substring(0, 2), 16), this.g = parseInt(n[1].substring(2, 4), 16), this.b = parseInt(n[1].substring(4, 6), 16)), null !== n
      };
      var i = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
      f.prototype.rgb = function(e) {
        var n = null;
        return null !== (n = e.match(i)) && (this.r = Number(n[1]), this.g = Number(n[2]), this.b = Number(n[3])), null !== n
      };
      var t = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d?\.?\d+)\s*\)$/;
      f.prototype.rgba = function(e) {
        var n = null;
        return null !== (n = e.match(t)) && (this.r = Number(n[1]), this.g = Number(n[2]), this.b = Number(n[3]), this.a = Number(n[4])), null !== n
      }, f.prototype.toString = function() {
        return null !== this.a && 1 !== this.a ? "rgba(" + [this.r, this.g, this.b, this.a].join(",") + ")" : "rgb(" + [this.r, this.g, this.b].join(",") + ")"
      }, f.prototype.namedColor = function(e) {
        e = e.toLowerCase();
        var n = l[e];
        if (n) this.r = n[0], this.g = n[1], this.b = n[2];
        else if ("transparent" === e) return this.r = this.g = this.b = this.a = 0, !0;
        return !!n
      }, f.prototype.isColor = !0;
      var l = {
        aliceblue: [240, 248, 255],
        antiquewhite: [250, 235, 215],
        aqua: [0, 255, 255],
        aquamarine: [127, 255, 212],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        bisque: [255, 228, 196],
        black: [0, 0, 0],
        blanchedalmond: [255, 235, 205],
        blue: [0, 0, 255],
        blueviolet: [138, 43, 226],
        brown: [165, 42, 42],
        burlywood: [222, 184, 135],
        cadetblue: [95, 158, 160],
        chartreuse: [127, 255, 0],
        chocolate: [210, 105, 30],
        coral: [255, 127, 80],
        cornflowerblue: [100, 149, 237],
        cornsilk: [255, 248, 220],
        crimson: [220, 20, 60],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgoldenrod: [184, 134, 11],
        darkgray: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkgrey: [169, 169, 169],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkseagreen: [143, 188, 143],
        darkslateblue: [72, 61, 139],
        darkslategray: [47, 79, 79],
        darkslategrey: [47, 79, 79],
        darkturquoise: [0, 206, 209],
        darkviolet: [148, 0, 211],
        deeppink: [255, 20, 147],
        deepskyblue: [0, 191, 255],
        dimgray: [105, 105, 105],
        dimgrey: [105, 105, 105],
        dodgerblue: [30, 144, 255],
        firebrick: [178, 34, 34],
        floralwhite: [255, 250, 240],
        forestgreen: [34, 139, 34],
        fuchsia: [255, 0, 255],
        gainsboro: [220, 220, 220],
        ghostwhite: [248, 248, 255],
        gold: [255, 215, 0],
        goldenrod: [218, 165, 32],
        gray: [128, 128, 128],
        green: [0, 128, 0],
        greenyellow: [173, 255, 47],
        grey: [128, 128, 128],
        honeydew: [240, 255, 240],
        hotpink: [255, 105, 180],
        indianred: [205, 92, 92],
        indigo: [75, 0, 130],
        ivory: [255, 255, 240],
        khaki: [240, 230, 140],
        lavender: [230, 230, 250],
        lavenderblush: [255, 240, 245],
        lawngreen: [124, 252, 0],
        lemonchiffon: [255, 250, 205],
        lightblue: [173, 216, 230],
        lightcoral: [240, 128, 128],
        lightcyan: [224, 255, 255],
        lightgoldenrodyellow: [250, 250, 210],
        lightgray: [211, 211, 211],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightsalmon: [255, 160, 122],
        lightseagreen: [32, 178, 170],
        lightskyblue: [135, 206, 250],
        lightslategray: [119, 136, 153],
        lightslategrey: [119, 136, 153],
        lightsteelblue: [176, 196, 222],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        limegreen: [50, 205, 50],
        linen: [250, 240, 230],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        mediumaquamarine: [102, 205, 170],
        mediumblue: [0, 0, 205],
        mediumorchid: [186, 85, 211],
        mediumpurple: [147, 112, 219],
        mediumseagreen: [60, 179, 113],
        mediumslateblue: [123, 104, 238],
        mediumspringgreen: [0, 250, 154],
        mediumturquoise: [72, 209, 204],
        mediumvioletred: [199, 21, 133],
        midnightblue: [25, 25, 112],
        mintcream: [245, 255, 250],
        mistyrose: [255, 228, 225],
        moccasin: [255, 228, 181],
        navajowhite: [255, 222, 173],
        navy: [0, 0, 128],
        oldlace: [253, 245, 230],
        olive: [128, 128, 0],
        olivedrab: [107, 142, 35],
        orange: [255, 165, 0],
        orangered: [255, 69, 0],
        orchid: [218, 112, 214],
        palegoldenrod: [238, 232, 170],
        palegreen: [152, 251, 152],
        paleturquoise: [175, 238, 238],
        palevioletred: [219, 112, 147],
        papayawhip: [255, 239, 213],
        peachpuff: [255, 218, 185],
        peru: [205, 133, 63],
        pink: [255, 192, 203],
        plum: [221, 160, 221],
        powderblue: [176, 224, 230],
        purple: [128, 0, 128],
        rebeccapurple: [102, 51, 153],
        red: [255, 0, 0],
        rosybrown: [188, 143, 143],
        royalblue: [65, 105, 225],
        saddlebrown: [139, 69, 19],
        salmon: [250, 128, 114],
        sandybrown: [244, 164, 96],
        seagreen: [46, 139, 87],
        seashell: [255, 245, 238],
        sienna: [160, 82, 45],
        silver: [192, 192, 192],
        skyblue: [135, 206, 235],
        slateblue: [106, 90, 205],
        slategray: [112, 128, 144],
        slategrey: [112, 128, 144],
        snow: [255, 250, 250],
        springgreen: [0, 255, 127],
        steelblue: [70, 130, 180],
        tan: [210, 180, 140],
        teal: [0, 128, 128],
        thistle: [216, 191, 216],
        tomato: [255, 99, 71],
        turquoise: [64, 224, 208],
        violet: [238, 130, 238],
        wheat: [245, 222, 179],
        white: [255, 255, 255],
        whitesmoke: [245, 245, 245],
        yellow: [255, 255, 0],
        yellowgreen: [154, 205, 50]
      };
      n.exports = f
    }, {}],
    4: [function(n, f) {
      function o(e, n) {
        var f = j++;
        if (n = n || {}, n.logging && (v.options.logging = !0, v.options.start = Date.now()), n.async = "undefined" == typeof n.async ? !0 : n.async, n.allowTaint = "undefined" == typeof n.allowTaint ? !1 : n.allowTaint, n.removeContainer = "undefined" == typeof n.removeContainer ? !0 : n.removeContainer, n.javascriptEnabled = "undefined" == typeof n.javascriptEnabled ? !1 : n.javascriptEnabled, n.imageTimeout = "undefined" == typeof n.imageTimeout ? 1e4 : n.imageTimeout, n.renderer = "function" == typeof n.renderer ? n.renderer : c, n.strict = !!n.strict, "string" == typeof e) {
          if ("string" != typeof n.proxy) return Promise.reject("Proxy must be used when rendering url");
          var o = null != n.width ? n.width : window.innerWidth,
            t = null != n.height ? n.height : window.innerHeight;
          return g(a(e), n.proxy, document, o, t, n).then(function(e) {
            return i(e.contentWindow.document.documentElement, e, n, o, t)
          })
        }
        var l = (void 0 === e ? [document.documentElement] : e.length ? e : [e])[0];
        return l.setAttribute(x + f, f), d(l.ownerDocument, n, l.ownerDocument.defaultView.innerWidth, l.ownerDocument.defaultView.innerHeight, f).then(function(e) {
          return "function" == typeof n.onrendered && (v("options.onrendered is deprecated, html2canvas returns a Promise containing the canvas"), n.onrendered(e)), e
        })
      }

      function d(e, n, f, o, d) {
        return b(e, e, f, o, n, e.defaultView.pageXOffset, e.defaultView.pageYOffset).then(function(t) {
          v("Document cloned");
          var l = x + d,
            s = "[" + l + "='" + d + "']";
          e.querySelector(s).removeAttribute(l);
          var u = t.contentWindow,
            a = u.document.querySelector(s),
            p = Promise.resolve("function" == typeof n.onclone ? n.onclone(u.document) : !0);
          return p.then(function() {
            return i(a, t, n, f, o)
          })
        })
      }

      function i(e, n, f, o, d) {
        var i = n.contentWindow,
          a = new p(i.document),
          c = new y(f, a),
          r = h(e),
          w = "view" === f.type ? o : s(i.document),
          b = "view" === f.type ? d : u(i.document),
          g = new f.renderer(w, b, c, f, document),
          x = new m(e, g, a, c, f);
        return x.ready.then(function() {
          v("Finished rendering");
          var o;
          return o = "view" === f.type ? l(g.canvas, {
            width: g.canvas.width,
            height: g.canvas.height,
            top: 0,
            left: 0,
            x: 0,
            y: 0
          }) : e === i.document.body || e === i.document.documentElement || null != f.canvas ? g.canvas : l(g.canvas, {
            width: null != f.width ? f.width : r.width,
            height: null != f.height ? f.height : r.height,
            top: r.top,
            left: r.left,
            x: 0,
            y: 0
          }), t(n, f), o
        })
      }

      function t(e, n) {
        n.removeContainer && (e.parentNode.removeChild(e), v("Cleaned up container"))
      }

      function l(e, n) {
        var f = document.createElement("canvas"),
          o = Math.min(e.width - 1, Math.max(0, n.left)),
          d = Math.min(e.width, Math.max(1, n.left + n.width)),
          i = Math.min(e.height - 1, Math.max(0, n.top)),
          t = Math.min(e.height, Math.max(1, n.top + n.height));
        f.width = n.width, f.height = n.height;
        var l = d - o,
          s = t - i;
        return v("Cropping canvas at:", "left:", n.left, "top:", n.top, "width:", l, "height:", s), v("Resulting crop with width", n.width, "and height", n.height, "with x", o, "and y", i), f.getContext("2d").drawImage(e, o, i, l, s, n.x, n.y, l, s), f
      }

      function s(e) {
        return Math.max(Math.max(e.body.scrollWidth, e.documentElement.scrollWidth), Math.max(e.body.offsetWidth, e.documentElement.offsetWidth), Math.max(e.body.clientWidth, e.documentElement.clientWidth))
      }

      function u(e) {
        return Math.max(Math.max(e.body.scrollHeight, e.documentElement.scrollHeight), Math.max(e.body.offsetHeight, e.documentElement.offsetHeight), Math.max(e.body.clientHeight, e.documentElement.clientHeight))
      }

      function a(e) {
        var n = document.createElement("a");
        return n.href = e, n.href = n.href, n
      }
      var p = n("./support"),
        c = n("./renderers/canvas"),
        y = n("./imageloader"),
        m = n("./nodeparser"),
        r = n("./nodecontainer"),
        v = n("./log"),
        w = n("./utils"),
        b = n("./clone"),
        g = n("./proxy").loadUrlDocument,
        h = w.getBounds,
        x = "data-html2canvas-node",
        j = 0;
      o.CanvasRenderer = c, o.NodeContainer = r, o.log = v, o.utils = w;
      var k = "undefined" == typeof document || "function" != typeof Object.create || "function" != typeof document.createElement("canvas").getContext ? function() {
        return Promise.reject("No canvas support")
      } : o;
      f.exports = k, "function" == typeof e && e.amd && e("html2canvas", [], function() {
        return k
      })
    }, {
      "./clone": 2,
      "./imageloader": 11,
      "./log": 13,
      "./nodecontainer": 14,
      "./nodeparser": 15,
      "./proxy": 16,
      "./renderers/canvas": 20,
      "./support": 22,
      "./utils": 26
    }],
    5: [function(e, n) {
      function f(e) {
        if (this.src = e, o("DummyImageContainer for", e), !this.promise || !this.image) {
          o("Initiating DummyImageContainer"), f.prototype.image = new Image;
          var n = this.image;
          f.prototype.promise = new Promise(function(e, f) {
            n.onload = e, n.onerror = f, n.src = d(), n.complete === !0 && e(n)
          })
        }
      }
      var o = e("./log"),
        d = e("./utils").smallImage;
      n.exports = f
    }, {
      "./log": 13,
      "./utils": 26
    }],
    6: [function(e, n) {
      function f(e, n) {
        var f, d, i = document.createElement("div"),
          t = document.createElement("img"),
          l = document.createElement("span"),
          s = "Hidden Text";
        i.style.visibility = "hidden", i.style.fontFamily = e, i.style.fontSize = n, i.style.margin = 0, i.style.padding = 0, document.body.appendChild(i), t.src = o(), t.width = 1, t.height = 1, t.style.margin = 0, t.style.padding = 0, t.style.verticalAlign = "baseline", l.style.fontFamily = e, l.style.fontSize = n, l.style.margin = 0, l.style.padding = 0, l.appendChild(document.createTextNode(s)), i.appendChild(l), i.appendChild(t), f = t.offsetTop - l.offsetTop + 1, i.removeChild(l), i.appendChild(document.createTextNode(s)), i.style.lineHeight = "normal", t.style.verticalAlign = "super", d = t.offsetTop - i.offsetTop + 1, document.body.removeChild(i), this.baseline = f, this.lineWidth = 1, this.middle = d
      }
      var o = e("./utils").smallImage;
      n.exports = f
    }, {
      "./utils": 26
    }],
    7: [function(e, n) {
      function f() {
        this.data = {}
      }
      var o = e("./font");
      f.prototype.getMetrics = function(e, n) {
        return void 0 === this.data[e + "-" + n] && (this.data[e + "-" + n] = new o(e, n)), this.data[e + "-" + n]
      }, n.exports = f
    }, {
      "./font": 6
    }],
    8: [function(e, n) {
      function f(n, f, o) {
        this.image = null, this.src = n;
        var i = this,
          t = d(n);
        this.promise = (f ? new Promise(function(e) {
          "about:blank" === n.contentWindow.document.URL || null == n.contentWindow.document.documentElement ? n.contentWindow.onload = n.onload = function() {
            e(n)
          } : e(n)
        }) : this.proxyLoad(o.proxy, t, o)).then(function(n) {
          var f = e("./core");
          return f(n.contentWindow.document.documentElement, {
            type: "view",
            width: n.width,
            height: n.height,
            proxy: o.proxy,
            javascriptEnabled: o.javascriptEnabled,
            removeContainer: o.removeContainer,
            allowTaint: o.allowTaint,
            imageTimeout: o.imageTimeout / 2
          })
        }).then(function(e) {
          return i.image = e
        })
      }
      var o = e("./utils"),
        d = o.getBounds,
        i = e("./proxy").loadUrlDocument;
      f.prototype.proxyLoad = function(e, n, f) {
        var o = this.src;
        return i(o.src, e, o.ownerDocument, n.width, n.height, f)
      }, n.exports = f
    }, {
      "./core": 4,
      "./proxy": 16,
      "./utils": 26
    }],
    9: [function(e, n) {
      function f(e) {
        this.src = e.value, this.colorStops = [], this.type = null, this.x0 = .5, this.y0 = .5, this.x1 = .5, this.y1 = .5, this.promise = Promise.resolve(!0)
      }
      f.TYPES = {
        LINEAR: 1,
        RADIAL: 2
      }, f.REGEXP_COLORSTOP = /^\s*(rgba?\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[0-9\.]+)?\s*\)|[a-z]{3,20}|#[a-f0-9]{3,6})(?:\s+(\d{1,3}(?:\.\d+)?)(%|px)?)?(?:\s|$)/i, n.exports = f
    }, {}],
    10: [function(e, n) {
      function f(e, n) {
        this.src = e, this.image = new Image;
        var f = this;
        this.tainted = null, this.promise = new Promise(function(o, d) {
          f.image.onload = o, f.image.onerror = d, n && (f.image.crossOrigin = "anonymous"), f.image.src = e, f.image.complete === !0 && o(f.image)
        })
      }
      n.exports = f
    }, {}],
    11: [function(e, n) {
      function f(e, n) {
        this.link = null, this.options = e, this.support = n, this.origin = this.getOrigin(window.location.href)
      }
      var o = e("./log"),
        d = e("./imagecontainer"),
        i = e("./dummyimagecontainer"),
        t = e("./proxyimagecontainer"),
        l = e("./framecontainer"),
        s = e("./svgcontainer"),
        u = e("./svgnodecontainer"),
        a = e("./lineargradientcontainer"),
        p = e("./webkitgradientcontainer"),
        c = e("./utils").bind;
      f.prototype.findImages = function(e) {
        var n = [];
        return e.reduce(function(e, n) {
          switch (n.node.nodeName) {
            case "IMG":
              return e.concat([{
                args: [n.node.src],
                method: "url"
              }]);
            case "svg":
            case "IFRAME":
              return e.concat([{
                args: [n.node],
                method: n.node.nodeName
              }])
          }
          return e
        }, []).forEach(this.addImage(n, this.loadImage), this), n
      }, f.prototype.findBackgroundImage = function(e, n) {
        return n.parseBackgroundImages().filter(this.hasImageBackground).forEach(this.addImage(e, this.loadImage), this), e
      }, f.prototype.addImage = function(e, n) {
        return function(f) {
          f.args.forEach(function(d) {
            this.imageExists(e, d) || (e.splice(0, 0, n.call(this, f)), o("Added image #" + e.length, "string" == typeof d ? d.substring(0, 100) : d))
          }, this)
        }
      }, f.prototype.hasImageBackground = function(e) {
        return "none" !== e.method
      }, f.prototype.loadImage = function(e) {
        if ("url" === e.method) {
          var n = e.args[0];
          return !this.isSVG(n) || this.support.svg || this.options.allowTaint ? n.match(/data:image\/.*;base64,/i) ? new d(n.replace(/url\(['"]{0,}|['"]{0,}\)$/gi, ""), !1) : this.isSameOrigin(n) || this.options.allowTaint === !0 || this.isSVG(n) ? new d(n, !1) : this.support.cors && !this.options.allowTaint && this.options.useCORS ? new d(n, !0) : this.options.proxy ? new t(n, this.options.proxy) : new i(n) : new s(n)
        }
        return "linear-gradient" === e.method ? new a(e) : "gradient" === e.method ? new p(e) : "svg" === e.method ? new u(e.args[0], this.support.svg) : "IFRAME" === e.method ? new l(e.args[0], this.isSameOrigin(e.args[0].src), this.options) : new i(e)
      }, f.prototype.isSVG = function(e) {
        return "svg" === e.substring(e.length - 3).toLowerCase() || s.prototype.isInline(e)
      }, f.prototype.imageExists = function(e, n) {
        return e.some(function(e) {
          return e.src === n
        })
      }, f.prototype.isSameOrigin = function(e) {
        return this.getOrigin(e) === this.origin
      }, f.prototype.getOrigin = function(e) {
        var n = this.link || (this.link = document.createElement("a"));
        return n.href = e, n.href = n.href, n.protocol + n.hostname + n.port
      }, f.prototype.getPromise = function(e) {
        return this.timeout(e, this.options.imageTimeout)["catch"](function() {
          var n = new i(e.src);
          return n.promise.then(function(n) {
            e.image = n
          })
        })
      }, f.prototype.get = function(e) {
        var n = null;
        return this.images.some(function(f) {
          return (n = f).src === e
        }) ? n : null
      }, f.prototype.fetch = function(e) {
        return this.images = e.reduce(c(this.findBackgroundImage, this), this.findImages(e)), this.images.forEach(function(e, n) {
          e.promise.then(function() {
            o("Succesfully loaded image #" + (n + 1), e)
          }, function(f) {
            o("Failed loading image #" + (n + 1), e, f)
          })
        }), this.ready = Promise.all(this.images.map(this.getPromise, this)), o("Finished searching images"), this
      }, f.prototype.timeout = function(e, n) {
        var f, d = Promise.race([e.promise, new Promise(function(d, i) {
          f = setTimeout(function() {
            o("Timed out loading image", e), i(e)
          }, n)
        })]).then(function(e) {
          return clearTimeout(f), e
        });
        return d["catch"](function() {
          clearTimeout(f)
        }), d
      }, n.exports = f
    }, {
      "./dummyimagecontainer": 5,
      "./framecontainer": 8,
      "./imagecontainer": 10,
      "./lineargradientcontainer": 12,
      "./log": 13,
      "./proxyimagecontainer": 17,
      "./svgcontainer": 23,
      "./svgnodecontainer": 24,
      "./utils": 26,
      "./webkitgradientcontainer": 27
    }],
    12: [function(e, n) {
      function f(e) {
        o.apply(this, arguments), this.type = o.TYPES.LINEAR;
        var n = f.REGEXP_DIRECTION.test(e.args[0]) || !o.REGEXP_COLORSTOP.test(e.args[0]);
        n ? e.args[0].split(/\s+/).reverse().forEach(function(e, n) {
          switch (e) {
            case "left":
              this.x0 = 0, this.x1 = 1;
              break;
            case "top":
              this.y0 = 0, this.y1 = 1;
              break;
            case "right":
              this.x0 = 1, this.x1 = 0;
              break;
            case "bottom":
              this.y0 = 1, this.y1 = 0;
              break;
            case "to":
              var f = this.y0,
                o = this.x0;
              this.y0 = this.y1, this.x0 = this.x1, this.x1 = o, this.y1 = f;
              break;
            case "center":
              break;
            default:
              var d = .01 * parseFloat(e, 10);
              if (isNaN(d)) break;
              0 === n ? (this.y0 = d, this.y1 = 1 - this.y0) : (this.x0 = d, this.x1 = 1 - this.x0)
          }
        }, this) : (this.y0 = 0, this.y1 = 1), this.colorStops = e.args.slice(n ? 1 : 0).map(function(e) {
          var n = e.match(o.REGEXP_COLORSTOP),
            f = +n[2],
            i = 0 === f ? "%" : n[3];
          return {
            color: new d(n[1]),
            stop: "%" === i ? f / 100 : null
          }
        }), null === this.colorStops[0].stop && (this.colorStops[0].stop = 0), null === this.colorStops[this.colorStops.length - 1].stop && (this.colorStops[this.colorStops.length - 1].stop = 1), this.colorStops.forEach(function(e, n) {
          null === e.stop && this.colorStops.slice(n).some(function(f, o) {
            return null !== f.stop ? (e.stop = (f.stop - this.colorStops[n - 1].stop) / (o + 1) + this.colorStops[n - 1].stop, !0) : !1
          }, this)
        }, this)
      }
      var o = e("./gradientcontainer"),
        d = e("./color");
      f.prototype = Object.create(o.prototype), f.REGEXP_DIRECTION = /^\s*(?:to|left|right|top|bottom|center|\d{1,3}(?:\.\d+)?%?)(?:\s|$)/i, n.exports = f
    }, {
      "./color": 3,
      "./gradientcontainer": 9
    }],
    13: [function(e, n) {
      var f = function() {
        f.options.logging && window.console && window.console.log && Function.prototype.bind.call(window.console.log, window.console).apply(window.console, [Date.now() - f.options.start + "ms", "html2canvas:"].concat([].slice.call(arguments, 0)))
      };
      f.options = {
        logging: !1
      }, n.exports = f
    }, {}],
    14: [function(e, n) {
      function f(e, n) {
        this.node = e, this.parent = n, this.stack = null, this.bounds = null, this.borders = null, this.clip = [], this.backgroundClip = [], this.offsetBounds = null, this.visible = null, this.computedStyles = null, this.colors = {}, this.styles = {}, this.backgroundImages = null, this.transformData = null, this.transformMatrix = null, this.isPseudoElement = !1, this.opacity = null
      }

      function o(e) {
        var n = e.options[e.selectedIndex || 0];
        return n ? n.text || "" : ""
      }

      function d(e) {
        if (e && "matrix" === e[1]) return e[2].split(",").map(function(e) {
          return parseFloat(e.trim())
        });
        if (e && "matrix3d" === e[1]) {
          var n = e[2].split(",").map(function(e) {
            return parseFloat(e.trim())
          });
          return [n[0], n[1], n[4], n[5], n[12], n[13]]
        }
      }

      function i(e) {
        return -1 !== e.toString().indexOf("%")
      }

      function t(e) {
        return e.replace("px", "")
      }

      function l(e) {
        return parseFloat(e)
      }
      var s = e("./color"),
        u = e("./utils"),
        a = u.getBounds,
        p = u.parseBackgrounds,
        c = u.offsetBounds;
      f.prototype.cloneTo = function(e) {
        e.visible = this.visible, e.borders = this.borders, e.bounds = this.bounds, e.clip = this.clip, e.backgroundClip = this.backgroundClip, e.computedStyles = this.computedStyles, e.styles = this.styles, e.backgroundImages = this.backgroundImages, e.opacity = this.opacity
      }, f.prototype.getOpacity = function() {
        return null === this.opacity ? this.opacity = this.cssFloat("opacity") : this.opacity
      }, f.prototype.assignStack = function(e) {
        this.stack = e, e.children.push(this)
      }, f.prototype.isElementVisible = function() {
        return this.node.nodeType === Node.TEXT_NODE ? this.parent.visible : "none" !== this.css("display") && "hidden" !== this.css("visibility") && !this.node.hasAttribute("data-html2canvas-ignore") && ("INPUT" !== this.node.nodeName || "hidden" !== this.node.getAttribute("type"))
      }, f.prototype.css = function(e) {
        return this.computedStyles || (this.computedStyles = this.isPseudoElement ? this.parent.computedStyle(this.before ? ":before" : ":after") : this.computedStyle(null)), this.styles[e] || (this.styles[e] = this.computedStyles[e])
      }, f.prototype.prefixedCss = function(e) {
        var n = ["webkit", "moz", "ms", "o"],
          f = this.css(e);
        return void 0 === f && n.some(function(n) {
          return f = this.css(n + e.substr(0, 1).toUpperCase() + e.substr(1)), void 0 !== f
        }, this), void 0 === f ? null : f
      }, f.prototype.computedStyle = function(e) {
        return this.node.ownerDocument.defaultView.getComputedStyle(this.node, e)
      }, f.prototype.cssInt = function(e) {
        var n = parseInt(this.css(e), 10);
        return isNaN(n) ? 0 : n
      }, f.prototype.color = function(e) {
        return this.colors[e] || (this.colors[e] = new s(this.css(e)))
      }, f.prototype.cssFloat = function(e) {
        var n = parseFloat(this.css(e));
        return isNaN(n) ? 0 : n
      }, f.prototype.fontWeight = function() {
        var e = this.css("fontWeight");
        switch (parseInt(e, 10)) {
          case 401:
            e = "bold";
            break;
          case 400:
            e = "normal"
        }
        return e
      }, f.prototype.parseClip = function() {
        var e = this.css("clip").match(this.CLIP);
        return e ? {
          top: parseInt(e[1], 10),
          right: parseInt(e[2], 10),
          bottom: parseInt(e[3], 10),
          left: parseInt(e[4], 10)
        } : null
      }, f.prototype.parseBackgroundImages = function() {
        return this.backgroundImages || (this.backgroundImages = p(this.css("backgroundImage")))
      }, f.prototype.cssList = function(e, n) {
        var f = (this.css(e) || "").split(",");
        return f = f[n || 0] || f[0] || "auto", f = f.trim().split(" "), 1 === f.length && (f = [f[0], i(f[0]) ? "auto" : f[0]]), f
      }, f.prototype.parseBackgroundSize = function(e, n, f) {
        var o, d, t = this.cssList("backgroundSize", f);
        if (i(t[0])) o = e.width * parseFloat(t[0]) / 100;
        else {
          if (/contain|cover/.test(t[0])) {
            var l = e.width / e.height,
              s = n.width / n.height;
            return s > l ^ "contain" === t[0] ? {
              width: e.height * s,
              height: e.height
            } : {
              width: e.width,
              height: e.width / s
            }
          }
          o = parseInt(t[0], 10)
        }
        return d = "auto" === t[0] && "auto" === t[1] ? n.height : "auto" === t[1] ? o / n.width * n.height : i(t[1]) ? e.height * parseFloat(t[1]) / 100 : parseInt(t[1], 10), "auto" === t[0] && (o = d / n.height * n.width), {
          width: o,
          height: d
        }
      }, f.prototype.parseBackgroundPosition = function(e, n, f, o) {
        var d, t, l = this.cssList("backgroundPosition", f);
        return d = i(l[0]) ? (e.width - (o || n).width) * (parseFloat(l[0]) / 100) : parseInt(l[0], 10), t = "auto" === l[1] ? d / n.width * n.height : i(l[1]) ? (e.height - (o || n).height) * parseFloat(l[1]) / 100 : parseInt(l[1], 10), "auto" === l[0] && (d = t / n.height * n.width), {
          left: d,
          top: t
        }
      }, f.prototype.parseBackgroundRepeat = function(e) {
        return this.cssList("backgroundRepeat", e)[0]
      }, f.prototype.parseTextShadows = function() {
        var e = this.css("textShadow"),
          n = [];
        if (e && "none" !== e)
          for (var f = e.match(this.TEXT_SHADOW_PROPERTY), o = 0; f && o < f.length; o++) {
            var d = f[o].match(this.TEXT_SHADOW_VALUES);
            n.push({
              color: new s(d[0]),
              offsetX: d[1] ? parseFloat(d[1].replace("px", "")) : 0,
              offsetY: d[2] ? parseFloat(d[2].replace("px", "")) : 0,
              blur: d[3] ? d[3].replace("px", "") : 0
            })
          }
        return n
      }, f.prototype.parseTransform = function() {
        if (!this.transformData)
          if (this.hasTransform()) {
            var e = this.parseBounds(),
              n = this.prefixedCss("transformOrigin").split(" ").map(t).map(l);
            n[0] += e.left, n[1] += e.top, this.transformData = {
              origin: n,
              matrix: this.parseTransformMatrix()
            }
          } else this.transformData = {
            origin: [0, 0],
            matrix: [1, 0, 0, 1, 0, 0]
          };
        return this.transformData
      }, f.prototype.parseTransformMatrix = function() {
        if (!this.transformMatrix) {
          var e = this.prefixedCss("transform"),
            n = e ? d(e.match(this.MATRIX_PROPERTY)) : null;
          this.transformMatrix = n ? n : [1, 0, 0, 1, 0, 0]
        }
        return this.transformMatrix
      }, f.prototype.parseBounds = function() {
        return this.bounds || (this.bounds = this.hasTransform() ? c(this.node) : a(this.node))
      }, f.prototype.hasTransform = function() {
        return "1,0,0,1,0,0" !== this.parseTransformMatrix().join(",") || this.parent && this.parent.hasTransform()
      }, f.prototype.getValue = function() {
        var e = this.node.value || "";
        return "SELECT" === this.node.tagName ? e = o(this.node) : "password" === this.node.type && (e = Array(e.length + 1).join("•")), 0 === e.length ? this.node.placeholder || "" : e
      }, f.prototype.MATRIX_PROPERTY = /(matrix|matrix3d)\((.+)\)/, f.prototype.TEXT_SHADOW_PROPERTY = /((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g, f.prototype.TEXT_SHADOW_VALUES = /(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g, f.prototype.CLIP = /^rect\((\d+)px,? (\d+)px,? (\d+)px,? (\d+)px\)$/, n.exports = f
    }, {
      "./color": 3,
      "./utils": 26
    }],
    15: [function(e, n) {
      function f(e, n, f, o, d) {
        N("Starting NodeParser"), this.renderer = n, this.options = d, this.range = null, this.support = f, this.renderQueue = [], this.stack = new U(!0, 1, e.ownerDocument, null);
        var i = new P(e, null);
        if (d.background && n.rectangle(0, 0, n.width, n.height, new T(d.background)), e === e.ownerDocument.documentElement) {
          var t = new P(i.color("backgroundColor").isTransparent() ? e.ownerDocument.body : e.ownerDocument.documentElement, null);
          n.rectangle(0, 0, n.width, n.height, t.color("backgroundColor"))
        }
        i.visibile = i.isElementVisible(), this.createPseudoHideStyles(e.ownerDocument), this.disableAnimations(e.ownerDocument), this.nodes = I([i].concat(this.getChildren(i)).filter(function(e) {
          return e.visible = e.isElementVisible()
        }).map(this.getPseudoElements, this)), this.fontMetrics = new S, N("Fetched nodes, total:", this.nodes.length), N("Calculate overflow clips"), this.calculateOverflowClips(), N("Start fetching images"), this.images = o.fetch(this.nodes.filter(A)), this.ready = this.images.ready.then(W(function() {
          return N("Images loaded, starting parsing"), N("Creating stacking contexts"), this.createStackingContexts(), N("Sorting stacking contexts"), this.sortStackingContexts(this.stack), this.parse(this.stack), N("Render queue created with " + this.renderQueue.length + " items"), new Promise(W(function(e) {
            d.async ? "function" == typeof d.async ? d.async.call(this, this.renderQueue, e) : this.renderQueue.length > 0 ? (this.renderIndex = 0, this.asyncRenderer(this.renderQueue, e)) : e() : (this.renderQueue.forEach(this.paint, this), e())
          }, this))
        }, this))
      }

      function o(e) {
        return e.parent && e.parent.clip.length
      }

      function d(e) {
        return e.replace(/(\-[a-z])/g, function(e) {
          return e.toUpperCase().replace("-", "")
        })
      }

      function i() {}

      function t(e, n, f, o) {
        return e.map(function(d, i) {
          if (d.width > 0) {
            var t = n.left,
              l = n.top,
              s = n.width,
              u = n.height - e[2].width;
            switch (i) {
              case 0:
                u = e[0].width, d.args = a({
                  c1: [t, l],
                  c2: [t + s, l],
                  c3: [t + s - e[1].width, l + u],
                  c4: [t + e[3].width, l + u]
                }, o[0], o[1], f.topLeftOuter, f.topLeftInner, f.topRightOuter, f.topRightInner);
                break;
              case 1:
                t = n.left + n.width - e[1].width, s = e[1].width, d.args = a({
                  c1: [t + s, l],
                  c2: [t + s, l + u + e[2].width],
                  c3: [t, l + u],
                  c4: [t, l + e[0].width]
                }, o[1], o[2], f.topRightOuter, f.topRightInner, f.bottomRightOuter, f.bottomRightInner);
                break;
              case 2:
                l = l + n.height - e[2].width, u = e[2].width, d.args = a({
                  c1: [t + s, l + u],
                  c2: [t, l + u],
                  c3: [t + e[3].width, l],
                  c4: [t + s - e[3].width, l]
                }, o[2], o[3], f.bottomRightOuter, f.bottomRightInner, f.bottomLeftOuter, f.bottomLeftInner);
                break;
              case 3:
                s = e[3].width, d.args = a({
                  c1: [t, l + u + e[2].width],
                  c2: [t, l],
                  c3: [t + s, l + e[0].width],
                  c4: [t + s, l + u]
                }, o[3], o[0], f.bottomLeftOuter, f.bottomLeftInner, f.topLeftOuter, f.topLeftInner)
            }
          }
          return d
        })
      }

      function l(e, n, f, o) {
        var d = 4 * ((Math.sqrt(2) - 1) / 3),
          i = f * d,
          t = o * d,
          l = e + f,
          s = n + o;
        return {
          topLeft: u({
            x: e,
            y: s
          }, {
            x: e,
            y: s - t
          }, {
            x: l - i,
            y: n
          }, {
            x: l,
            y: n
          }),
          topRight: u({
            x: e,
            y: n
          }, {
            x: e + i,
            y: n
          }, {
            x: l,
            y: s - t
          }, {
            x: l,
            y: s
          }),
          bottomRight: u({
            x: l,
            y: n
          }, {
            x: l,
            y: n + t
          }, {
            x: e + i,
            y: s
          }, {
            x: e,
            y: s
          }),
          bottomLeft: u({
            x: l,
            y: s
          }, {
            x: l - i,
            y: s
          }, {
            x: e,
            y: n + t
          }, {
            x: e,
            y: n
          })
        }
      }

      function s(e, n, f) {
        var o = e.left,
          d = e.top,
          i = e.width,
          t = e.height,
          s = n[0][0] < i / 2 ? n[0][0] : i / 2,
          u = n[0][1] < t / 2 ? n[0][1] : t / 2,
          a = n[1][0] < i / 2 ? n[1][0] : i / 2,
          p = n[1][1] < t / 2 ? n[1][1] : t / 2,
          c = n[2][0] < i / 2 ? n[2][0] : i / 2,
          y = n[2][1] < t / 2 ? n[2][1] : t / 2,
          m = n[3][0] < i / 2 ? n[3][0] : i / 2,
          r = n[3][1] < t / 2 ? n[3][1] : t / 2,
          v = i - a,
          w = t - y,
          b = i - c,
          g = t - r;
        return {
          topLeftOuter: l(o, d, s, u).topLeft.subdivide(.5),
          topLeftInner: l(o + f[3].width, d + f[0].width, Math.max(0, s - f[3].width), Math.max(0, u - f[0].width)).topLeft.subdivide(.5),
          topRightOuter: l(o + v, d, a, p).topRight.subdivide(.5),
          topRightInner: l(o + Math.min(v, i + f[3].width), d + f[0].width, v > i + f[3].width ? 0 : a - f[3].width, p - f[0].width).topRight.subdivide(.5),
          bottomRightOuter: l(o + b, d + w, c, y).bottomRight.subdivide(.5),
          bottomRightInner: l(o + Math.min(b, i - f[3].width), d + Math.min(w, t + f[0].width), Math.max(0, c - f[1].width), y - f[2].width).bottomRight.subdivide(.5),
          bottomLeftOuter: l(o, d + g, m, r).bottomLeft.subdivide(.5),
          bottomLeftInner: l(o + f[3].width, d + g, Math.max(0, m - f[3].width), r - f[2].width).bottomLeft.subdivide(.5)
        }
      }

      function u(e, n, f, o) {
        var d = function(e, n, f) {
          return {
            x: e.x + (n.x - e.x) * f,
            y: e.y + (n.y - e.y) * f
          }
        };
        return {
          start: e,
          startControl: n,
          endControl: f,
          end: o,
          subdivide: function(i) {
            var t = d(e, n, i),
              l = d(n, f, i),
              s = d(f, o, i),
              a = d(t, l, i),
              p = d(l, s, i),
              c = d(a, p, i);
            return [u(e, t, a, c), u(c, p, s, o)]
          },
          curveTo: function(e) {
            e.push(["bezierCurve", n.x, n.y, f.x, f.y, o.x, o.y])
          },
          curveToReversed: function(o) {
            o.push(["bezierCurve", f.x, f.y, n.x, n.y, e.x, e.y])
          }
        }
      }

      function a(e, n, f, o, d, i, t) {
        var l = [];
        return n[0] > 0 || n[1] > 0 ? (l.push(["line", o[1].start.x, o[1].start.y]), o[1].curveTo(l)) : l.push(["line", e.c1[0], e.c1[1]]), f[0] > 0 || f[1] > 0 ? (l.push(["line", i[0].start.x, i[0].start.y]), i[0].curveTo(l), l.push(["line", t[0].end.x, t[0].end.y]), t[0].curveToReversed(l)) : (l.push(["line", e.c2[0], e.c2[1]]), l.push(["line", e.c3[0], e.c3[1]])), n[0] > 0 || n[1] > 0 ? (l.push(["line", d[1].end.x, d[1].end.y]), d[1].curveToReversed(l)) : l.push(["line", e.c4[0], e.c4[1]]), l
      }

      function p(e, n, f, o, d, i, t) {
        n[0] > 0 || n[1] > 0 ? (e.push(["line", o[0].start.x, o[0].start.y]), o[0].curveTo(e), o[1].curveTo(e)) : e.push(["line", i, t]), (f[0] > 0 || f[1] > 0) && e.push(["line", d[0].start.x, d[0].start.y])
      }

      function c(e) {
        return e.cssInt("zIndex") < 0
      }

      function y(e) {
        return e.cssInt("zIndex") > 0
      }

      function m(e) {
        return 0 === e.cssInt("zIndex")
      }

      function r(e) {
        return -1 !== ["inline", "inline-block", "inline-table"].indexOf(e.css("display"))
      }

      function v(e) {
        return e instanceof U
      }

      function w(e) {
        return e.node.data.trim().length > 0
      }

      function b(e) {
        return /^(normal|none|0px)$/.test(e.parent.css("letterSpacing"))
      }

      function g(e) {
        return ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map(function(n) {
          var f = e.css("border" + n + "Radius"),
            o = f.split(" ");
          return o.length <= 1 && (o[1] = o[0]), o.map(F)
        })
      }

      function h(e) {
        return e.nodeType === Node.TEXT_NODE || e.nodeType === Node.ELEMENT_NODE
      }

      function x(e) {
        var n = e.css("position"),
          f = -1 !== ["absolute", "relative", "fixed"].indexOf(n) ? e.css("zIndex") : "auto";
        return "auto" !== f
      }

      function j(e) {
        return "static" !== e.css("position")
      }

      function k(e) {
        return "none" !== e.css("float")
      }

      function q(e) {
        return -1 !== ["inline-block", "inline-table"].indexOf(e.css("display"))
      }

      function z(e) {
        var n = this;
        return function() {
          return !e.apply(n, arguments)
        }
      }

      function A(e) {
        return e.node.nodeType === Node.ELEMENT_NODE
      }

      function B(e) {
        return e.isPseudoElement === !0
      }

      function C(e) {
        return e.node.nodeType === Node.TEXT_NODE
      }

      function D(e) {
        return function(n, f) {
          return n.cssInt("zIndex") + e.indexOf(n) / e.length - (f.cssInt("zIndex") + e.indexOf(f) / e.length)
        }
      }

      function E(e) {
        return e.getOpacity() < 1
      }

      function F(e) {
        return parseInt(e, 10)
      }

      function G(e) {
        return e.width
      }

      function H(e) {
        return e.node.nodeType !== Node.ELEMENT_NODE || -1 === ["SCRIPT", "HEAD", "TITLE", "OBJECT", "BR", "OPTION"].indexOf(e.node.nodeName)
      }

      function I(e) {
        return [].concat.apply([], e)
      }

      function J(e) {
        var n = e.substr(0, 1);
        return n === e.substr(e.length - 1) && n.match(/'|"/) ? e.substr(1, e.length - 2) : e
      }

      function K(e) {
        for (var n, f = [], o = 0, d = !1; e.length;) L(e[o]) === d ? (n = e.splice(0, o), n.length && f.push(O.ucs2.encode(n)), d = !d, o = 0) : o++, o >= e.length && (n = e.splice(0, o), n.length && f.push(O.ucs2.encode(n)));
        return f
      }

      function L(e) {
        return -1 !== [32, 13, 10, 9, 45].indexOf(e)
      }

      function M(e) {
        return /[^\u0000-\u00ff]/.test(e)
      }
      var N = e("./log"),
        O = e("punycode"),
        P = e("./nodecontainer"),
        Q = e("./textcontainer"),
        R = e("./pseudoelementcontainer"),
        S = e("./fontmetrics"),
        T = e("./color"),
        U = e("./stackingcontext"),
        V = e("./utils"),
        W = V.bind,
        X = V.getBounds,
        Y = V.parseBackgrounds,
        Z = V.offsetBounds;
      f.prototype.calculateOverflowClips = function() {
        this.nodes.forEach(function(e) {
          if (A(e)) {
            B(e) && e.appendToDOM(), e.borders = this.parseBorders(e);
            var n = "hidden" === e.css("overflow") ? [e.borders.clip] : [],
              f = e.parseClip();
            f && -1 !== ["absolute", "fixed"].indexOf(e.css("position")) && n.push([
              ["rect", e.bounds.left + f.left, e.bounds.top + f.top, f.right - f.left, f.bottom - f.top]
            ]), e.clip = o(e) ? e.parent.clip.concat(n) : n, e.backgroundClip = "hidden" !== e.css("overflow") ? e.clip.concat([e.borders.clip]) : e.clip, B(e) && e.cleanDOM()
          } else C(e) && (e.clip = o(e) ? e.parent.clip : []);
          B(e) || (e.bounds = null)
        }, this)
      }, f.prototype.asyncRenderer = function(e, n, f) {
        f = f || Date.now(), this.paint(e[this.renderIndex++]), e.length === this.renderIndex ? n() : f + 20 > Date.now() ? this.asyncRenderer(e, n, f) : setTimeout(W(function() {
          this.asyncRenderer(e, n)
        }, this), 0)
      }, f.prototype.createPseudoHideStyles = function(e) {
        this.createStyles(e, "." + R.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + ':before { content: "" !important; display: none !important; }.' + R.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER + ':after { content: "" !important; display: none !important; }')
      }, f.prototype.disableAnimations = function(e) {
        this.createStyles(e, "* { -webkit-animation: none !important; -moz-animation: none !important; -o-animation: none !important; animation: none !important; -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important;}")
      }, f.prototype.createStyles = function(e, n) {
        var f = e.createElement("style");
        f.innerHTML = n, e.body.appendChild(f)
      }, f.prototype.getPseudoElements = function(e) {
        var n = [
          [e]
        ];
        if (e.node.nodeType === Node.ELEMENT_NODE) {
          var f = this.getPseudoElement(e, ":before"),
            o = this.getPseudoElement(e, ":after");
          f && n.push(f), o && n.push(o)
        }
        return I(n)
      }, f.prototype.getPseudoElement = function(e, n) {
        var f = e.computedStyle(n);
        if (!f || !f.content || "none" === f.content || "-moz-alt-content" === f.content || "none" === f.display) return null;
        for (var o = J(f.content), i = "url" === o.substr(0, 3), t = document.createElement(i ? "img" : "html2canvaspseudoelement"), l = new R(t, e, n), s = f.length - 1; s >= 0; s--) {
          var u = d(f.item(s));
          t.style[u] = f[u]
        }
        if (t.className = R.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + " " + R.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER, i) return t.src = Y(o)[0].args[0], [l];
        var a = document.createTextNode(o);
        return t.appendChild(a), [l, new Q(a, l)]
      }, f.prototype.getChildren = function(e) {
        return I([].filter.call(e.node.childNodes, h).map(function(n) {
          var f = [n.nodeType === Node.TEXT_NODE ? new Q(n, e) : new P(n, e)].filter(H);
          return n.nodeType === Node.ELEMENT_NODE && f.length && "TEXTAREA" !== n.tagName ? f[0].isElementVisible() ? f.concat(this.getChildren(f[0])) : [] : f
        }, this))
      }, f.prototype.newStackingContext = function(e, n) {
        var f = new U(n, e.getOpacity(), e.node, e.parent);
        e.cloneTo(f);
        var o = n ? f.getParentStack(this) : f.parent.stack;
        o.contexts.push(f), e.stack = f
      }, f.prototype.createStackingContexts = function() {
        this.nodes.forEach(function(e) {
          A(e) && (this.isRootElement(e) || E(e) || x(e) || this.isBodyWithTransparentRoot(e) || e.hasTransform()) ? this.newStackingContext(e, !0) : A(e) && (j(e) && m(e) || q(e) || k(e)) ? this.newStackingContext(e, !1) : e.assignStack(e.parent.stack)
        }, this)
      }, f.prototype.isBodyWithTransparentRoot = function(e) {
        return "BODY" === e.node.nodeName && e.parent.color("backgroundColor").isTransparent()
      }, f.prototype.isRootElement = function(e) {
        return null === e.parent
      }, f.prototype.sortStackingContexts = function(e) {
        e.contexts.sort(D(e.contexts.slice(0))), e.contexts.forEach(this.sortStackingContexts, this)
      }, f.prototype.parseTextBounds = function(e) {
        return function(n, f, o) {
          if ("none" !== e.parent.css("textDecoration").substr(0, 4) || 0 !== n.trim().length) {
            if (this.support.rangeBounds && !e.parent.hasTransform()) {
              var d = o.slice(0, f).join("").length;
              return this.getRangeBounds(e.node, d, n.length)
            }
            if (e.node && "string" == typeof e.node.data) {
              var i = e.node.splitText(n.length),
                t = this.getWrapperBounds(e.node, e.parent.hasTransform());
              return e.node = i, t
            }
          } else(!this.support.rangeBounds || e.parent.hasTransform()) && (e.node = e.node.splitText(n.length));
          return {}
        }
      }, f.prototype.getWrapperBounds = function(e, n) {
        var f = e.ownerDocument.createElement("html2canvaswrapper"),
          o = e.parentNode,
          d = e.cloneNode(!0);
        f.appendChild(e.cloneNode(!0)), o.replaceChild(f, e);
        var i = n ? Z(f) : X(f);
        return o.replaceChild(d, f), i
      }, f.prototype.getRangeBounds = function(e, n, f) {
        var o = this.range || (this.range = e.ownerDocument.createRange());
        return o.setStart(e, n), o.setEnd(e, n + f), o.getBoundingClientRect()
      }, f.prototype.parse = function(e) {
        var n = e.contexts.filter(c),
          f = e.children.filter(A),
          o = f.filter(z(k)),
          d = o.filter(z(j)).filter(z(r)),
          t = f.filter(z(j)).filter(k),
          l = o.filter(z(j)).filter(r),
          s = e.contexts.concat(o.filter(j)).filter(m),
          u = e.children.filter(C).filter(w),
          a = e.contexts.filter(y);
        n.concat(d).concat(t).concat(l).concat(s).concat(u).concat(a).forEach(function(e) {
          this.renderQueue.push(e), v(e) && (this.parse(e), this.renderQueue.push(new i))
        }, this)
      }, f.prototype.paint = function(e) {
        try {
          e instanceof i ? this.renderer.ctx.restore() : C(e) ? (B(e.parent) && e.parent.appendToDOM(), this.paintText(e), B(e.parent) && e.parent.cleanDOM()) : this.paintNode(e)
        } catch (n) {
          if (N(n), this.options.strict) throw n
        }
      }, f.prototype.paintNode = function(e) {
        v(e) && (this.renderer.setOpacity(e.opacity), this.renderer.ctx.save(), e.hasTransform() && this.renderer.setTransform(e.parseTransform())), "INPUT" === e.node.nodeName && "checkbox" === e.node.type ? this.paintCheckbox(e) : "INPUT" === e.node.nodeName && "radio" === e.node.type ? this.paintRadio(e) : this.paintElement(e)
      }, f.prototype.paintElement = function(e) {
        var n = e.parseBounds();
        this.renderer.clip(e.backgroundClip, function() {
          this.renderer.renderBackground(e, n, e.borders.borders.map(G))
        }, this), this.renderer.clip(e.clip, function() {
          this.renderer.renderBorders(e.borders.borders)
        }, this), this.renderer.clip(e.backgroundClip, function() {
          switch (e.node.nodeName) {
            case "svg":
            case "IFRAME":
              var f = this.images.get(e.node);
              f ? this.renderer.renderImage(e, n, e.borders, f) : N("Error loading <" + e.node.nodeName + ">", e.node);
              break;
            case "IMG":
              var o = this.images.get(e.node.src);
              o ? this.renderer.renderImage(e, n, e.borders, o) : N("Error loading <img>", e.node.src);
              break;
            case "CANVAS":
              this.renderer.renderImage(e, n, e.borders, {
                image: e.node
              });
              break;
            case "SELECT":
            case "INPUT":
            case "TEXTAREA":
              this.paintFormValue(e)
          }
        }, this)
      }, f.prototype.paintCheckbox = function(e) {
        var n = e.parseBounds(),
          f = Math.min(n.width, n.height),
          o = {
            width: f - 1,
            height: f - 1,
            top: n.top,
            left: n.left
          },
          d = [3, 3],
          i = [d, d, d, d],
          l = [1, 1, 1, 1].map(function(e) {
            return {
              color: new T("#A5A5A5"),
              width: e
            }
          }),
          u = s(o, i, l);
        this.renderer.clip(e.backgroundClip, function() {
          this.renderer.rectangle(o.left + 1, o.top + 1, o.width - 2, o.height - 2, new T("#DEDEDE")), this.renderer.renderBorders(t(l, o, u, i)), e.node.checked && (this.renderer.font(new T("#424242"), "normal", "normal", "bold", f - 3 + "px", "arial"), this.renderer.text("✔", o.left + f / 6, o.top + f - 1))
        }, this)
      }, f.prototype.paintRadio = function(e) {
        var n = e.parseBounds(),
          f = Math.min(n.width, n.height) - 2;
        this.renderer.clip(e.backgroundClip, function() {
          this.renderer.circleStroke(n.left + 1, n.top + 1, f, new T("#DEDEDE"), 1, new T("#A5A5A5")), e.node.checked && this.renderer.circle(Math.ceil(n.left + f / 4) + 1, Math.ceil(n.top + f / 4) + 1, Math.floor(f / 2), new T("#424242"))
        }, this)
      }, f.prototype.paintFormValue = function(e) {
        var n = e.getValue();
        if (n.length > 0) {
          var f = e.node.ownerDocument,
            o = f.createElement("html2canvaswrapper"),
            d = ["lineHeight", "textAlign", "fontFamily", "fontWeight", "fontSize", "color", "paddingLeft", "paddingTop", "paddingRight", "paddingBottom", "width", "height", "borderLeftStyle", "borderTopStyle", "borderLeftWidth", "borderTopWidth", "boxSizing", "whiteSpace", "wordWrap"];
          d.forEach(function(n) {
            try {
              o.style[n] = e.css(n)
            } catch (f) {
              N("html2canvas: Parse: Exception caught in renderFormValue: " + f.message)
            }
          });
          var i = e.parseBounds();
          o.style.position = "fixed", o.style.left = i.left + "px", o.style.top = i.top + "px", o.textContent = n, f.body.appendChild(o), this.paintText(new Q(o.firstChild, e)), f.body.removeChild(o)
        }
      }, f.prototype.paintText = function(e) {
        e.applyTextTransform();
        var n = O.ucs2.decode(e.node.data),
          f = this.options.letterRendering && !b(e) || M(e.node.data) ? n.map(function(e) {
            return O.ucs2.encode([e])
          }) : K(n),
          o = e.parent.fontWeight(),
          d = e.parent.css("fontSize"),
          i = e.parent.css("fontFamily"),
          t = e.parent.parseTextShadows();
        this.renderer.font(e.parent.color("color"), e.parent.css("fontStyle"), e.parent.css("fontVariant"), o, d, i), t.length ? this.renderer.fontShadow(t[0].color, t[0].offsetX, t[0].offsetY, t[0].blur) : this.renderer.clearShadow(), this.renderer.clip(e.parent.clip, function() {
          f.map(this.parseTextBounds(e), this).forEach(function(n, o) {
            n && (this.renderer.text(f[o], n.left, n.bottom), this.renderTextDecoration(e.parent, n, this.fontMetrics.getMetrics(i, d)))
          }, this)
        }, this)
      }, f.prototype.renderTextDecoration = function(e, n, f) {
        switch (e.css("textDecoration").split(" ")[0]) {
          case "underline":
            this.renderer.rectangle(n.left, Math.round(n.top + f.baseline + f.lineWidth), n.width, 1, e.color("color"));
            break;
          case "overline":
            this.renderer.rectangle(n.left, Math.round(n.top), n.width, 1, e.color("color"));
            break;
          case "line-through":
            this.renderer.rectangle(n.left, Math.ceil(n.top + f.middle + f.lineWidth), n.width, 1, e.color("color"))
        }
      };
      var $ = {
        inset: [
          ["darken", .6],
          ["darken", .1],
          ["darken", .1],
          ["darken", .6]
        ]
      };
      f.prototype.parseBorders = function(e) {
        var n = e.parseBounds(),
          f = g(e),
          o = ["Top", "Right", "Bottom", "Left"].map(function(n, f) {
            var o = e.css("border" + n + "Style"),
              d = e.color("border" + n + "Color");
            "inset" === o && d.isBlack() && (d = new T([255, 255, 255, d.a]));
            var i = $[o] ? $[o][f] : null;
            return {
              width: e.cssInt("border" + n + "Width"),
              color: i ? d[i[0]](i[1]) : d,
              args: null
            }
          }),
          d = s(n, f, o);
        return {
          clip: this.parseBackgroundClip(e, d, o, f, n),
          borders: t(o, n, d, f)
        }
      }, f.prototype.parseBackgroundClip = function(e, n, f, o, d) {
        var i = e.css("backgroundClip"),
          t = [];
        switch (i) {
          case "content-box":
          case "padding-box":
            p(t, o[0], o[1], n.topLeftInner, n.topRightInner, d.left + f[3].width, d.top + f[0].width), p(t, o[1], o[2], n.topRightInner, n.bottomRightInner, d.left + d.width - f[1].width, d.top + f[0].width), p(t, o[2], o[3], n.bottomRightInner, n.bottomLeftInner, d.left + d.width - f[1].width, d.top + d.height - f[2].width), p(t, o[3], o[0], n.bottomLeftInner, n.topLeftInner, d.left + f[3].width, d.top + d.height - f[2].width);
            break;
          default:
            p(t, o[0], o[1], n.topLeftOuter, n.topRightOuter, d.left, d.top), p(t, o[1], o[2], n.topRightOuter, n.bottomRightOuter, d.left + d.width, d.top), p(t, o[2], o[3], n.bottomRightOuter, n.bottomLeftOuter, d.left + d.width, d.top + d.height), p(t, o[3], o[0], n.bottomLeftOuter, n.topLeftOuter, d.left, d.top + d.height)
        }
        return t
      }, n.exports = f
    }, {
      "./color": 3,
      "./fontmetrics": 7,
      "./log": 13,
      "./nodecontainer": 14,
      "./pseudoelementcontainer": 18,
      "./stackingcontext": 21,
      "./textcontainer": 25,
      "./utils": 26,
      punycode: 1
    }],
    16: [function(e, n, f) {
      function o(e, n, f) {
        var o = "withCredentials" in new XMLHttpRequest;
        if (!n) return Promise.reject("No proxy configured");
        var d = t(o),
          s = l(n, e, d);
        return o ? a(s) : i(f, s, d).then(function(e) {
          return m(e.content)
        })
      }

      function d(e, n, f) {
        var o = "crossOrigin" in new Image,
          d = t(o),
          s = l(n, e, d);
        return o ? Promise.resolve(s) : i(f, s, d).then(function(e) {
          return "data:" + e.type + ";base64," + e.content
        })
      }

      function i(e, n, f) {
        return new Promise(function(o, d) {
          var i = e.createElement("script"),
            t = function() {
              delete window.html2canvas.proxy[f], e.body.removeChild(i)
            };
          window.html2canvas.proxy[f] = function(e) {
            t(), o(e)
          }, i.src = n, i.onerror = function(e) {
            t(), d(e)
          }, e.body.appendChild(i)
        })
      }

      function t(e) {
        return e ? "" : "html2canvas_" + Date.now() + "_" + ++r + "_" + Math.round(1e5 * Math.random())
      }

      function l(e, n, f) {
        return e + "?url=" + encodeURIComponent(n) + (f.length ? "&callback=html2canvas.proxy." + f : "")
      }

      function s(e) {
        return function(n) {
          var f, o = new DOMParser;
          try {
            f = o.parseFromString(n, "text/html")
          } catch (d) {
            c("DOMParser not supported, falling back to createHTMLDocument"), f = document.implementation.createHTMLDocument("");
            try {
              f.open(), f.write(n), f.close()
            } catch (i) {
              c("createHTMLDocument write not supported, falling back to document.body.innerHTML"), f.body.innerHTML = n
            }
          }
          var t = f.querySelector("base");
          if (!t || !t.href.host) {
            var l = f.createElement("base");
            l.href = e, f.head.insertBefore(l, f.head.firstChild)
          }
          return f
        }
      }

      function u(e, n, f, d, i, t) {
        return new o(e, n, window.document).then(s(e)).then(function(e) {
          return y(e, f, d, i, t, 0, 0)
        })
      }
      var a = e("./xhr"),
        p = e("./utils"),
        c = e("./log"),
        y = e("./clone"),
        m = p.decode64,
        r = 0;
      f.Proxy = o, f.ProxyURL = d, f.loadUrlDocument = u
    }, {
      "./clone": 2,
      "./log": 13,
      "./utils": 26,
      "./xhr": 28
    }],
    17: [function(e, n) {
      function f(e, n) {
        var f = document.createElement("a");
        f.href = e, e = f.href, this.src = e, this.image = new Image;
        var d = this;
        this.promise = new Promise(function(f, i) {
          d.image.crossOrigin = "Anonymous", d.image.onload = f, d.image.onerror = i, new o(e, n, document).then(function(e) {
            d.image.src = e
          })["catch"](i)
        })
      }
      var o = e("./proxy").ProxyURL;
      n.exports = f
    }, {
      "./proxy": 16
    }],
    18: [function(e, n) {
      function f(e, n, f) {
        o.call(this, e, n), this.isPseudoElement = !0, this.before = ":before" === f
      }
      var o = e("./nodecontainer");
      f.prototype.cloneTo = function(e) {
        f.prototype.cloneTo.call(this, e), e.isPseudoElement = !0, e.before = this.before
      }, f.prototype = Object.create(o.prototype), f.prototype.appendToDOM = function() {
        this.before ? this.parent.node.insertBefore(this.node, this.parent.node.firstChild) : this.parent.node.appendChild(this.node), this.parent.node.className += " " + this.getHideClass()
      }, f.prototype.cleanDOM = function() {
        this.node.parentNode.removeChild(this.node), this.parent.node.className = this.parent.node.className.replace(this.getHideClass(), "")
      }, f.prototype.getHideClass = function() {
        return this["PSEUDO_HIDE_ELEMENT_CLASS_" + (this.before ? "BEFORE" : "AFTER")]
      }, f.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = "___html2canvas___pseudoelement_before", f.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER = "___html2canvas___pseudoelement_after", n.exports = f
    }, {
      "./nodecontainer": 14
    }],
    19: [function(e, n) {
      function f(e, n, f, o, d) {
        this.width = e, this.height = n, this.images = f, this.options = o, this.document = d
      }
      var o = e("./log");
      f.prototype.renderImage = function(e, n, f, o) {
        var d = e.cssInt("paddingLeft"),
          i = e.cssInt("paddingTop"),
          t = e.cssInt("paddingRight"),
          l = e.cssInt("paddingBottom"),
          s = f.borders,
          u = n.width - (s[1].width + s[3].width + d + t),
          a = n.height - (s[0].width + s[2].width + i + l);
        this.drawImage(o, 0, 0, o.image.width || u, o.image.height || a, n.left + d + s[3].width, n.top + i + s[0].width, u, a)
      }, f.prototype.renderBackground = function(e, n, f) {
        n.height > 0 && n.width > 0 && (this.renderBackgroundColor(e, n), this.renderBackgroundImage(e, n, f))
      }, f.prototype.renderBackgroundColor = function(e, n) {
        var f = e.color("backgroundColor");
        f.isTransparent() || this.rectangle(n.left, n.top, n.width, n.height, f)
      }, f.prototype.renderBorders = function(e) {
        e.forEach(this.renderBorder, this)
      }, f.prototype.renderBorder = function(e) {
        e.color.isTransparent() || null === e.args || this.drawShape(e.args, e.color)
      }, f.prototype.renderBackgroundImage = function(e, n, f) {
        var d = e.parseBackgroundImages();
        d.reverse().forEach(function(d, i, t) {
          switch (d.method) {
            case "url":
              var l = this.images.get(d.args[0]);
              l ? this.renderBackgroundRepeating(e, n, l, t.length - (i + 1), f) : o("Error loading background-image", d.args[0]);
              break;
            case "linear-gradient":
            case "gradient":
              var s = this.images.get(d.value);
              s ? this.renderBackgroundGradient(s, n, f) : o("Error loading background-image", d.args[0]);
              break;
            case "none":
              break;
            default:
              o("Unknown background-image type", d.args[0])
          }
        }, this)
      }, f.prototype.renderBackgroundRepeating = function(e, n, f, o, d) {
        var i = e.parseBackgroundSize(n, f.image, o),
          t = e.parseBackgroundPosition(n, f.image, o, i),
          l = e.parseBackgroundRepeat(o);
        switch (l) {
          case "repeat-x":
          case "repeat no-repeat":
            this.backgroundRepeatShape(f, t, i, n, n.left + d[3], n.top + t.top + d[0], 99999, i.height, d);
            break;
          case "repeat-y":
          case "no-repeat repeat":
            this.backgroundRepeatShape(f, t, i, n, n.left + t.left + d[3], n.top + d[0], i.width, 99999, d);
            break;
          case "no-repeat":
            this.backgroundRepeatShape(f, t, i, n, n.left + t.left + d[3], n.top + t.top + d[0], i.width, i.height, d);
            break;
          default:
            this.renderBackgroundRepeat(f, t, i, {
              top: n.top,
              left: n.left
            }, d[3], d[0])
        }
      }, n.exports = f
    }, {
      "./log": 13
    }],
    20: [function(e, n) {
      function f(e, n) {
        d.apply(this, arguments), this.canvas = this.options.canvas || this.document.createElement("canvas"), this.options.canvas || (this.canvas.width = e, this.canvas.height = n), this.ctx = this.canvas.getContext("2d"), this.taintCtx = this.document.createElement("canvas").getContext("2d"), this.ctx.textBaseline = "bottom", this.variables = {}, t("Initialized CanvasRenderer with size", e, "x", n)
      }

      function o(e) {
        return e.length > 0
      }
      var d = e("../renderer"),
        i = e("../lineargradientcontainer"),
        t = e("../log");
      f.prototype = Object.create(d.prototype), f.prototype.setFillStyle = function(e) {
        return this.ctx.fillStyle = "object" == typeof e && e.isColor ? e.toString() : e, this.ctx
      }, f.prototype.rectangle = function(e, n, f, o, d) {
        this.setFillStyle(d).fillRect(e, n, f, o)
      }, f.prototype.circle = function(e, n, f, o) {
        this.setFillStyle(o), this.ctx.beginPath(), this.ctx.arc(e + f / 2, n + f / 2, f / 2, 0, 2 * Math.PI, !0), this.ctx.closePath(), this.ctx.fill()
      }, f.prototype.circleStroke = function(e, n, f, o, d, i) {
        this.circle(e, n, f, o), this.ctx.strokeStyle = i.toString(), this.ctx.stroke()
      }, f.prototype.drawShape = function(e, n) {
        this.shape(e), this.setFillStyle(n).fill()
      }, f.prototype.taints = function(e) {
        if (null === e.tainted) {
          this.taintCtx.drawImage(e.image, 0, 0);
          try {
            this.taintCtx.getImageData(0, 0, 1, 1), e.tainted = !1
          } catch (n) {
            this.taintCtx = document.createElement("canvas").getContext("2d"), e.tainted = !0
          }
        }
        return e.tainted
      }, f.prototype.drawImage = function(e, n, f, o, d, i, t, l, s) {
        (!this.taints(e) || this.options.allowTaint) && this.ctx.drawImage(e.image, n, f, o, d, i, t, l, s)
      }, f.prototype.clip = function(e, n, f) {
        this.ctx.save(), e.filter(o).forEach(function(e) {
          this.shape(e).clip()
        }, this), n.call(f), this.ctx.restore()
      }, f.prototype.shape = function(e) {
        return this.ctx.beginPath(), e.forEach(function(e, n) {
          "rect" === e[0] ? this.ctx.rect.apply(this.ctx, e.slice(1)) : this.ctx[0 === n ? "moveTo" : e[0] + "To"].apply(this.ctx, e.slice(1))
        }, this), this.ctx.closePath(), this.ctx
      }, f.prototype.font = function(e, n, f, o, d, i) {
        this.setFillStyle(e).font = [n, f, o, d, i].join(" ").split(",")[0]
      }, f.prototype.fontShadow = function(e, n, f, o) {
        this.setVariable("shadowColor", e.toString()).setVariable("shadowOffsetY", n).setVariable("shadowOffsetX", f).setVariable("shadowBlur", o)
      }, f.prototype.clearShadow = function() {
        this.setVariable("shadowColor", "rgba(0,0,0,0)")
      }, f.prototype.setOpacity = function(e) {
        this.ctx.globalAlpha = e
      }, f.prototype.setTransform = function(e) {
        this.ctx.translate(e.origin[0], e.origin[1]), this.ctx.transform.apply(this.ctx, e.matrix), this.ctx.translate(-e.origin[0], -e.origin[1])
      }, f.prototype.setVariable = function(e, n) {
        return this.variables[e] !== n && (this.variables[e] = this.ctx[e] = n), this
      }, f.prototype.text = function(e, n, f) {
        this.ctx.fillText(e, n, f)
      }, f.prototype.backgroundRepeatShape = function(e, n, f, o, d, i, t, l, s) {
        var u = [
          ["line", Math.round(d), Math.round(i)],
          ["line", Math.round(d + t), Math.round(i)],
          ["line", Math.round(d + t), Math.round(l + i)],
          ["line", Math.round(d), Math.round(l + i)]
        ];
        this.clip([u], function() {
          this.renderBackgroundRepeat(e, n, f, o, s[3], s[0])
        }, this)
      }, f.prototype.renderBackgroundRepeat = function(e, n, f, o, d, i) {
        var t = Math.round(o.left + n.left + d),
          l = Math.round(o.top + n.top + i);
        this.setFillStyle(this.ctx.createPattern(this.resizeImage(e, f), "repeat")), this.ctx.translate(t, l), this.ctx.fill(), this.ctx.translate(-t, -l)
      }, f.prototype.renderBackgroundGradient = function(e, n) {
        if (e instanceof i) {
          var f = this.ctx.createLinearGradient(n.left + n.width * e.x0, n.top + n.height * e.y0, n.left + n.width * e.x1, n.top + n.height * e.y1);
          e.colorStops.forEach(function(e) {
            f.addColorStop(e.stop, e.color.toString())
          }), this.rectangle(n.left, n.top, n.width, n.height, f)
        }
      }, f.prototype.resizeImage = function(e, n) {
        var f = e.image;
        if (f.width === n.width && f.height === n.height) return f;
        var o, d = document.createElement("canvas");
        return d.width = n.width, d.height = n.height, o = d.getContext("2d"), o.drawImage(f, 0, 0, f.width, f.height, 0, 0, n.width, n.height), d
      }, n.exports = f
    }, {
      "../lineargradientcontainer": 12,
      "../log": 13,
      "../renderer": 19
    }],
    21: [function(e, n) {
      function f(e, n, f, d) {
        o.call(this, f, d), this.ownStacking = e, this.contexts = [], this.children = [], this.opacity = (this.parent ? this.parent.stack.opacity : 1) * n
      }
      var o = e("./nodecontainer");
      f.prototype = Object.create(o.prototype), f.prototype.getParentStack = function(e) {
        var n = this.parent ? this.parent.stack : null;
        return n ? n.ownStacking ? n : n.getParentStack(e) : e.stack
      }, n.exports = f
    }, {
      "./nodecontainer": 14
    }],
    22: [function(e, n) {
      function f(e) {
        this.rangeBounds = this.testRangeBounds(e), this.cors = this.testCORS(), this.svg = this.testSVG()
      }
      f.prototype.testRangeBounds = function(e) {
        var n, f, o, d, i = !1;
        return e.createRange && (n = e.createRange(), n.getBoundingClientRect && (f = e.createElement("boundtest"), f.style.height = "123px", f.style.display = "block", e.body.appendChild(f), n.selectNode(f), o = n.getBoundingClientRect(), d = o.height, 123 === d && (i = !0), e.body.removeChild(f))), i
      }, f.prototype.testCORS = function() {
        return "undefined" != typeof(new Image).crossOrigin
      }, f.prototype.testSVG = function() {
        var e = new Image,
          n = document.createElement("canvas"),
          f = n.getContext("2d");
        e.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
        try {
          f.drawImage(e, 0, 0), n.toDataURL()
        } catch (o) {
          return !1
        }
        return !0
      }, n.exports = f
    }, {}],
    23: [function(e, n) {
      function f(e) {
        this.src = e, this.image = null;
        var n = this;
        this.promise = this.hasFabric().then(function() {
          return n.isInline(e) ? Promise.resolve(n.inlineFormatting(e)) : o(e)
        }).then(function(e) {
          return new Promise(function(f) {
            window.html2canvas.svg.fabric.loadSVGFromString(e, n.createCanvas.call(n, f))
          })
        })
      }
      var o = e("./xhr"),
        d = e("./utils").decode64;
      f.prototype.hasFabric = function() {
        return window.html2canvas.svg && window.html2canvas.svg.fabric ? Promise.resolve() : Promise.reject(new Error("html2canvas.svg.js is not loaded, cannot render svg"))
      }, f.prototype.inlineFormatting = function(e) {
        return /^data:image\/svg\+xml;base64,/.test(e) ? this.decode64(this.removeContentType(e)) : this.removeContentType(e)
      }, f.prototype.removeContentType = function(e) {
        return e.replace(/^data:image\/svg\+xml(;base64)?,/, "")
      }, f.prototype.isInline = function(e) {
        return /^data:image\/svg\+xml/i.test(e)
      }, f.prototype.createCanvas = function(e) {
        var n = this;
        return function(f, o) {
          var d = new window.html2canvas.svg.fabric.StaticCanvas("c");
          n.image = d.lowerCanvasEl, d.setWidth(o.width).setHeight(o.height).add(window.html2canvas.svg.fabric.util.groupSVGElements(f, o)).renderAll(), e(d.lowerCanvasEl)
        }
      }, f.prototype.decode64 = function(e) {
        return "function" == typeof window.atob ? window.atob(e) : d(e)
      }, n.exports = f
    }, {
      "./utils": 26,
      "./xhr": 28
    }],
    24: [function(e, n) {
      function f(e, n) {
        this.src = e, this.image = null;
        var f = this;
        this.promise = n ? new Promise(function(n, o) {
          f.image = new Image, f.image.onload = n, f.image.onerror = o, f.image.src = "data:image/svg+xml," + (new XMLSerializer).serializeToString(e), f.image.complete === !0 && n(f.image)
        }) : this.hasFabric().then(function() {
          return new Promise(function(n) {
            window.html2canvas.svg.fabric.parseSVGDocument(e, f.createCanvas.call(f, n))
          })
        })
      }
      var o = e("./svgcontainer");
      f.prototype = Object.create(o.prototype), n.exports = f
    }, {
      "./svgcontainer": 23
    }],
    25: [function(e, n) {
      function f(e, n) {
        d.call(this, e, n)
      }

      function o(e, n, f) {
        return e.length > 0 ? n + f.toUpperCase() : void 0
      }
      var d = e("./nodecontainer");
      f.prototype = Object.create(d.prototype), f.prototype.applyTextTransform = function() {
        this.node.data = this.transform(this.parent.css("textTransform"))
      }, f.prototype.transform = function(e) {
        var n = this.node.data;
        switch (e) {
          case "lowercase":
            return n.toLowerCase();
          case "capitalize":
            return n.replace(/(^|\s|:|-|\(|\))([a-z])/g, o);
          case "uppercase":
            return n.toUpperCase();
          default:
            return n
        }
      }, n.exports = f
    }, {
      "./nodecontainer": 14
    }],
    26: [function(e, n, f) {
      f.smallImage = function() {
        return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      }, f.bind = function(e, n) {
        return function() {
          return e.apply(n, arguments)
        }
      }, f.decode64 = function(e) {
        var n, f, o, d, i, t, l, s, u = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
          a = e.length,
          p = "";
        for (n = 0; a > n; n += 4) f = u.indexOf(e[n]), o = u.indexOf(e[n + 1]), d = u.indexOf(e[n + 2]), i = u.indexOf(e[n + 3]), t = f << 2 | o >> 4, l = (15 & o) << 4 | d >> 2, s = (3 & d) << 6 | i, p += 64 === d ? String.fromCharCode(t) : 64 === i || -1 === i ? String.fromCharCode(t, l) : String.fromCharCode(t, l, s);
        return p
      }, f.getBounds = function(e) {
        if (e.getBoundingClientRect) {
          var n = e.getBoundingClientRect(),
            f = null == e.offsetWidth ? n.width : e.offsetWidth;
          return {
            top: n.top,
            bottom: n.bottom || n.top + n.height,
            right: n.left + f,
            left: n.left,
            width: f,
            height: null == e.offsetHeight ? n.height : e.offsetHeight
          }
        }
        return {}
      }, f.offsetBounds = function(e) {
        var n = e.offsetParent ? f.offsetBounds(e.offsetParent) : {
          top: 0,
          left: 0
        };
        return {
          top: e.offsetTop + n.top,
          bottom: e.offsetTop + e.offsetHeight + n.top,
          right: e.offsetLeft + n.left + e.offsetWidth,
          left: e.offsetLeft + n.left,
          width: e.offsetWidth,
          height: e.offsetHeight
        }
      }, f.parseBackgrounds = function(e) {
        var n, f, o, d, i, t, l, s = " \r\n	",
          u = [],
          a = 0,
          p = 0,
          c = function() {
            n && ('"' === f.substr(0, 1) && (f = f.substr(1, f.length - 2)), f && l.push(f), "-" === n.substr(0, 1) && (d = n.indexOf("-", 1) + 1) > 0 && (o = n.substr(0, d), n = n.substr(d)), u.push({
              prefix: o,
              method: n.toLowerCase(),
              value: i,
              args: l,
              image: null
            })), l = [], n = o = f = i = ""
          };
        return l = [], n = o = f = i = "", e.split("").forEach(function(e) {
          if (!(0 === a && s.indexOf(e) > -1)) {
            switch (e) {
              case '"':
                t ? t === e && (t = null) : t = e;
                break;
              case "(":
                if (t) break;
                if (0 === a) return a = 1, void(i += e);
                p++;
                break;
              case ")":
                if (t) break;
                if (1 === a) {
                  if (0 === p) return a = 0, i += e, void c();
                  p--
                }
                break;
              case ",":
                if (t) break;
                if (0 === a) return void c();
                if (1 === a && 0 === p && !n.match(/^url$/i)) return l.push(f), f = "", void(i += e)
            }
            i += e, 0 === a ? n += e : f += e
          }
        }), c(), u
      }
    }, {}],
    27: [function(e, n) {
      function f(e) {
        o.apply(this, arguments), this.type = "linear" === e.args[0] ? o.TYPES.LINEAR : o.TYPES.RADIAL
      }
      var o = e("./gradientcontainer");
      f.prototype = Object.create(o.prototype), n.exports = f
    }, {
      "./gradientcontainer": 9
    }],
    28: [function(e, n) {
      function f(e) {
        return new Promise(function(n, f) {
          var o = new XMLHttpRequest;
          o.open("GET", e), o.onload = function() {
            200 === o.status ? n(o.responseText) : f(new Error(o.statusText))
          }, o.onerror = function() {
            f(new Error("Network Error"))
          }, o.send()
        })
      }
      n.exports = f
    }, {}]
  }, {}, [4])(4)
});
/*! RESOURCE: /scripts/js_includes_g_automate.js */
/*! RESOURCE: /scripts/glideautomate/description_generator/ATFMugshotDescriptionGenerator.js */
"use strict";
var ATFMugshotDescriptionGenerator = Class.create({
  initialize: function() {
    this._constants = new ATFMugshotDescriptionConstants();
    this._tagGetter = new ATFMugshotTagGetter(this._constants);
    this._contentGetter = new ATFMugshotContentGetter(this._constants);
  },
  getDescription: function(mugshot) {
    if (!mugshot)
      return;
    var tag = mugshot.tag;
    var tagName = this._tagGetter.getTagDisplayName(mugshot);
    var locator = mugshot.id;
    var label = this._contentGetter.getLabel(mugshot);
    var value = this._contentGetter.getValue(mugshot);
    var area = mugshot.area.toLowerCase() !== "default" ? mugshot.area : undefined;
    if (label === locator)
      label = undefined;
    if (label === value || !label && value) {
      label = value;
      value = undefined;
    }
    if (label) {
      label = this._replaceAllWhitespaceWithSpaces(label).trim();
      if (label.length > 50)
        label = label.substr(0, 47) + "...";
    }
    if (value && value.length > 50) {
      value = this._replaceAllWhitespaceWithSpaces(value).trim();
      value = value.substr(0, 47) + "...";
    }
    if (label) {
      if (locator && area && value)
        return formatMessage(this._constants.getMappedValue("DGM_TAG_LOCATOR_LABEL_VALUE_AND_AREA"), [tagName, tag, locator, label, value, area]);
      else if (locator && area && !value)
        return formatMessage(this._constants.getMappedValue("DGM_TAG_LOCATOR_LABEL_AND_AREA"), [tagName, tag, locator, label, area]);
      else if (locator && !area && value)
        return formatMessage(this._constants.getMappedValue("DGM_TAG_LOCATOR_LABEL_AND_VALUE"), [tagName, tag, locator, label, value]);
      else if (!locator && area && value)
        return formatMessage(this._constants.getMappedValue("DGM_TAG_LABEL_VALUE_AND_AREA"), [tagName, tag, label, value, area]);
      else if (locator && !area && !value)
        return formatMessage(this._constants.getMappedValue("DGM_TAG_LOCATOR_AND_LABEL"), [tagName, tag, locator, label]);
      else if (!locator && !area && value)
        return formatMessage(this._constants.getMappedValue("DGM_TAG_LABEL_AND_VALUE"), [tagName, tag, label, value]);
      else if (!locator && area && !value)
        return formatMessage(this._constants.getMappedValue("DGM_TAG_LABEL_AND_AREA"), [tagName, tag, label, area]);
      else if (!locator && !area && !value)
        return formatMessage(this._constants.getMappedValue("DGM_TAG_AND_LABEL"), [tagName, tag, label]);
    }
    if (locator && area)
      return formatMessage(this._constants.getMappedValue("DGM_TAG_LOCATOR_AND_AREA"), [tagName, tag, locator, area]);
    else if (locator && !area)
      return formatMessage(this._constants.getMappedValue("DGM_TAG_AND_LOCATOR"), [tagName, tag, locator]);
    else if (!locator && area)
      return formatMessage(this._constants.getMappedValue("DGM_TAG_AND_AREA"), [tagName, tag, area]);
    return formatMessage(this._constants.getMappedValue("DGM_TAG_ONLY"), [tagName, tag]);
  },
  getDisplayLabel: function(mugshot) {
    if (!mugshot)
      return;
    var tagName = this._tagGetter.getTagDisplayName(mugshot);
    var tag = mugshot.tag;
    var details = this._contentGetter.getLabel(mugshot) || this._contentGetter.getValue(mugshot);
    if (!details)
      return formatMessage(this._constants.getMappedValue("DGM_TAG_ONLY"), [tagName, tag]);
    var usesComponentId = details === mugshot.id;
    details = this._replaceAllWhitespaceWithSpaces(details);
    if (details.indexOf('\n') !== -1)
      details = details.slice(0, details.indexOf('\n')) + '...';
    if (usesComponentId)
      return formatMessage(this._constants.getMappedValue("DGM_TAG_AND_LOCATOR"), [tagName, tag, details]);
    return formatMessage(this._constants.getMappedValue("DGM_TAG_AND_LABEL"), [tagName, tag, details]);
  },
  getLabel: function(mugshot) {
    return this._contentGetter.getLabel(mugshot);
  },
  getValue: function(mugshot) {
    return this._contentGetter.getValue(mugshot);
  },
  getTagDisplayName: function(mugshot) {
    var tagName = this._tagGetter.getTagDisplayName(mugshot);
    if (tagName)
      return formatMessage(this._constants.getMappedValue("DGM_DISPLAY_NAME_AND_TAG"), [tagName, mugshot.tag]);
    else
      return "&lt;" + mugshot.tag + "&gt;";
  },
  _replaceAllWhitespaceWithSpaces: function(text) {
    if (!text)
      return;
    if (typeof text !== "string")
      return String(text);
    return text.replace(/\s+/gm, " ");
  },
  type: 'ATFMugshotDescriptionGenerator'
});;
/*! RESOURCE: /scripts/glideautomate/description_generator/ATFMugshotContentGetter.js */
"use strict";
var ATFMugshotContentGetter = Class.create({
  initialize: function(constants) {
    this.TRUE = constants.getMappedValue('TRUE');
    this.FALSE = constants.getMappedValue('FALSE');
  },
  getLabel: function(mugshot) {
    if (!mugshot)
      return;
    return this._getLabelText(mugshot.label_for_input) || mugshot.inner_text ||
      this._getAltTagForImgIfExists(mugshot) ||
      this._getInnerImageText(mugshot.inner_img) || mugshot.data_original_title || mugshot.title ||
      mugshot.aria_label || mugshot.name || mugshot.id || mugshot.placeholder ||
      "";
  },
  getValue: function(mugshot) {
    return this._getMappedValueForInputIfExists(mugshot) || this._getInnerImageText(mugshot.inner_img) || "";
  },
  _getLabelText: function(label) {
    if (!label)
      return;
    return label.inner_text || label.data_original_title || label.title || label["for"];
  },
  _getInnerImageText: function(img) {
    if (!img)
      return;
    return img.alt || img.data_original_title || img.title || img.aria_label;
  },
  _getAltTagForImgIfExists: function(mugshot) {
    if (mugshot.alt && (mugshot.tag.toLowerCase() === "img" || mugshot.type === "image"))
      return mugshot.alt;
  },
  _getMappedValueForInputIfExists: function(mugshot) {
    var alternateInputs = ["button", "datalist", "fieldset", "meter", "output", "progress", "textarea", "select"];
    if (mugshot.tag.toLowerCase() !== "input" && alternateInputs.indexOf(mugshot.tag) === -1)
      return;
    if (mugshot.type === "checkbox")
      return this._getCheckboxContent(mugshot);
    return this._defaultInputFallback(mugshot);
  },
  _defaultInputFallback: function(mugshot) {
    return mugshot.html_value || mugshot.placeholder || mugshot.get_value_result;
  },
  _getCheckboxContent: function(mugshot) {
    return mugshot.get_value_result === "checked" ? this.TRUE : this.FALSE;
  },
  type: 'ATFMugshotContentGetter'
});;
/*! RESOURCE: /scripts/glideautomate/description_generator/ATFMugshotTagGetter.js */
"use strict";
var ATFMugshotTagGetter = Class.create({
  initialize: function(constants) {
    this._constants = constants;
  },
  getTagDisplayName: function(mugshot) {
    return this._getRole(mugshot.role) || this._getInputNameByType(mugshot) ||
      this.getTagName(mugshot.tag);
  },
  _getRole: function(role) {
    var mappedRole = this._constants.getMappedValue(role);
    if (mappedRole)
      return mappedRole;
  },
  _getInputNameByType: function(mugshot) {
    if (typeof mugshot.tag !== "string" || mugshot.tag.toLowerCase() !== "input")
      return;
    var mappedInputName = this._constants.getMappedValue(mugshot.type + "_INPUT");
    if (mappedInputName)
      return mappedInputName;
    return this._constants.getMappedValue("TEXT_INPUT");
  },
  getTagName: function(tag) {
    if (!tag)
      return this._constants.getMappedValue('UNKNOWN_COMPONENT');
    var mappedTag = this._constants.getMappedValue(tag);
    if (mappedTag)
      return mappedTag;
    return this._getCustomTagDescription(tag);
  },
  _getCustomTagDescription: function(tag) {
    return this._constants.getMappedValue("CUSTOM_COMPONENT");
  },
  type: 'ATFMugshotTagGetter'
});;
/*! RESOURCE: /scripts/glideautomate/description_generator/ATFMugshotDescriptionConstants.js */
"use strict";
var ATF_CUSTOM_UI = "ATF_CUSTOM_UI:";
var ATFMugshotDescriptionConstants = Class.create({
  initialize: function() {
    this._messageMap = null;
    this._getMessageMap();
  },
  _getMessageMap: function() {
    var messages = [];
    var allMessageKeys = Object.keys(ATFMugshotDescriptionConstants.MESSAGE_KEYS);
    for (var i = 0; i < allMessageKeys.length; i++) {
      if (messages.indexOf(allMessageKeys[i]) === -1)
        messages.push(ATFMugshotDescriptionConstants.MESSAGE_KEYS[allMessageKeys[i]]);
    }
    this._messageMap = new GwtMessage().getMessages(messages);
  },
  getMappedValue: function(key) {
    if (this._messageMap === null || !key)
      return "";
    var internalKey = ATFMugshotDescriptionConstants.MESSAGE_KEYS[key.toUpperCase()];
    return this._messageMap[internalKey] || "";
  },
  type: "ATFMugshotDescriptionConstants"
});
ATFMugshotDescriptionConstants._repeatedMessages = {
  BIDIRECTIONAL_TEXT: ATF_CUSTOM_UI + "Bidirectional text",
  BOLD_TEXT: ATF_CUSTOM_UI + "Bold text",
  BUTTON: ATF_CUSTOM_UI + "Button",
  CHECKBOX: ATF_CUSTOM_UI + "Checkbox",
  CHOICE_LIST: ATF_CUSTOM_UI + "Choice list",
  DEFINITION: ATF_CUSTOM_UI + "Definition",
  EXTERNAL_RESOURCE: ATF_CUSTOM_UI + "External resource",
  HEADING: ATF_CUSTOM_UI + "Heading",
  IMAGE: ATF_CUSTOM_UI + "Image",
  INTERACTIVE_COMPONENT: ATF_CUSTOM_UI + "Interactive component",
  ITALICIZED_TEXT: ATF_CUSTOM_UI + "Italicized text",
  LINK: ATF_CUSTOM_UI + "Link",
  LIST_ITEM: ATF_CUSTOM_UI + "List item",
  NAVIGATION_REGION: ATF_CUSTOM_UI + "Navigation region",
  PROGRESS_BAR: ATF_CUSTOM_UI + "Progress bar",
  RADIO_BUTTON: ATF_CUSTOM_UI + "Radio button",
  RANGE: ATF_CUSTOM_UI + "Range",
  RUBY_TEXT: ATF_CUSTOM_UI + "Ruby text",
  SEARCH: ATF_CUSTOM_UI + "Search",
  TERM_DEFINITION: ATF_CUSTOM_UI + "Term definition",
  TEXT: ATF_CUSTOM_UI + "Text"
};
ATFMugshotDescriptionConstants.MESSAGE_KEYS = {
  ALERT: ATF_CUSTOM_UI + "Alert",
  ALERTDIALOG: ATF_CUSTOM_UI + "Alert dialog",
  APPLICATION: ATF_CUSTOM_UI + "Application",
  ARTICLE: ATF_CUSTOM_UI + "Article",
  BANNER: ATF_CUSTOM_UI + "Banner",
  BUTTON: ATFMugshotDescriptionConstants._repeatedMessages.BUTTON,
  CELL: ATF_CUSTOM_UI + "Cell",
  CHECKBOX: ATF_CUSTOM_UI + "Checkbox",
  COLUMNHEADER: ATF_CUSTOM_UI + "Column header",
  COMBOBOX: ATF_CUSTOM_UI + "Combobox",
  COMMAND: ATF_CUSTOM_UI + "Command",
  COMPLEMENTARY: ATF_CUSTOM_UI + "Supporting section",
  DEFINITION: ATFMugshotDescriptionConstants._repeatedMessages.DEFINITION,
  DIALOG: ATFMugshotDescriptionConstants._repeatedMessages.INTERACTIVE_COMPONENT,
  DIRECTORY: ATF_CUSTOM_UI + "Reference list",
  DOCUMENT: ATF_CUSTOM_UI + "Document",
  FEED: ATF_CUSTOM_UI + "Article list",
  FIGURE: ATF_CUSTOM_UI + "Figure",
  FORM: ATF_CUSTOM_UI + "Form",
  GRID: ATF_CUSTOM_UI + "Grid",
  GRIDCELL: ATF_CUSTOM_UI + "Grid cell",
  GROUP: ATF_CUSTOM_UI + "Group",
  HEADING: ATFMugshotDescriptionConstants._repeatedMessages.HEADING,
  IMG: ATFMugshotDescriptionConstants._repeatedMessages.IMAGE,
  INPUT: ATF_CUSTOM_UI + "Input",
  LANDMARK: ATF_CUSTOM_UI + "Landmark",
  LINK: ATFMugshotDescriptionConstants._repeatedMessages.LINK,
  LIST: ATF_CUSTOM_UI + "List",
  LISTBOX: ATF_CUSTOM_UI + "Slushbucket",
  LISTITEM: ATFMugshotDescriptionConstants._repeatedMessages.LIST_ITEM,
  LOG: ATF_CUSTOM_UI + "Log",
  MAIN: ATF_CUSTOM_UI + "Main content",
  MARQUEE: ATF_CUSTOM_UI + "Marquee",
  MATH: ATF_CUSTOM_UI + "Math expression",
  MENU: ATF_CUSTOM_UI + "Menu",
  MENUBAR: ATF_CUSTOM_UI + "Menu bar",
  MENUITEM: ATF_CUSTOM_UI + "Menu item",
  MENUITEMCHECKBOX: ATFMugshotDescriptionConstants._repeatedMessages.CHECKBOX,
  MENUITEMRADIO: ATFMugshotDescriptionConstants._repeatedMessages.RADIO_BUTTON,
  NAVIGATION: ATFMugshotDescriptionConstants._repeatedMessages.NAVIGATION_REGION,
  NOTE: ATF_CUSTOM_UI + "Note",
  PROGRESSBAR: ATFMugshotDescriptionConstants._repeatedMessages.PROGRESS_BAR,
  RADIO: ATFMugshotDescriptionConstants._repeatedMessages.RADIO_BUTTON,
  RADIOGROUP: ATF_CUSTOM_UI + "Radio button group",
  RANGE: ATFMugshotDescriptionConstants._repeatedMessages.RANGE,
  REGION: ATF_CUSTOM_UI + "Page region",
  ROLETYPE: ATF_CUSTOM_UI + "Roletype",
  ROW: ATF_CUSTOM_UI + "Row",
  ROWGROUP: ATF_CUSTOM_UI + "Row group",
  ROWHEADER: ATF_CUSTOM_UI + "Row header",
  SCROLLBAR: ATF_CUSTOM_UI + "Scrollbar",
  SEARCH: ATF_CUSTOM_UI + "Search facility",
  SEARCHBOX: ATFMugshotDescriptionConstants._repeatedMessages.SEARCH,
  SECTION: ATF_CUSTOM_UI + "Page section",
  SECTIONHEAD: ATF_CUSTOM_UI + "Section heading",
  SEPARATOR: ATF_CUSTOM_UI + "Separator",
  SLIDER: ATF_CUSTOM_UI + "Slider input",
  SPINBUTTON: ATFMugshotDescriptionConstants._repeatedMessages.RANGE,
  STATUS: ATF_CUSTOM_UI + "Status",
  STRUCTURE: ATF_CUSTOM_UI + "Structural component",
  SWITCH: ATF_CUSTOM_UI + "Switch",
  TAB: ATF_CUSTOM_UI + "Tab",
  TABLE: ATF_CUSTOM_UI + "Table",
  TABLIST: ATF_CUSTOM_UI + "Tab list",
  TABPANEL: ATF_CUSTOM_UI + "Tab panel",
  TERM: ATFMugshotDescriptionConstants._repeatedMessages.TERM_DEFINITION,
  TEXT: ATFMugshotDescriptionConstants._repeatedMessages.TEXT,
  TEXTBOX: ATFMugshotDescriptionConstants._repeatedMessages.TEXT,
  TIMER: ATF_CUSTOM_UI + "Timer",
  TOOLBAR: ATF_CUSTOM_UI + "Toolbar",
  TOOLTIP: ATF_CUSTOM_UI + "Tooltip",
  TREE: ATF_CUSTOM_UI + "Tree structure",
  TREEGRID: ATF_CUSTOM_UI + "Tree grid",
  TREEITEM: ATF_CUSTOM_UI + "Tree item",
  WIDGET: ATFMugshotDescriptionConstants._repeatedMessages.INTERACTIVE_COMPONENT,
  WINDOW: ATF_CUSTOM_UI + "Application window",
  ADDRESS: ATF_CUSTOM_UI + "Address",
  ASIDE: ATFMugshotDescriptionConstants._repeatedMessages.TEXT,
  FOOTER: ATF_CUSTOM_UI + "Page footer",
  HEADER: ATF_CUSTOM_UI + "Page header",
  H1: ATFMugshotDescriptionConstants._repeatedMessages.HEADING,
  H2: ATFMugshotDescriptionConstants._repeatedMessages.HEADING,
  H3: ATFMugshotDescriptionConstants._repeatedMessages.HEADING,
  H4: ATFMugshotDescriptionConstants._repeatedMessages.HEADING,
  H5: ATFMugshotDescriptionConstants._repeatedMessages.HEADING,
  H6: ATFMugshotDescriptionConstants._repeatedMessages.HEADING,
  HGROUP: ATF_CUSTOM_UI + "Heading group",
  NAV: ATFMugshotDescriptionConstants._repeatedMessages.NAVIGATION_REGION,
  BLOCKQUOTE: ATF_CUSTOM_UI + "Blockquote",
  DD: ATFMugshotDescriptionConstants._repeatedMessages.DEFINITION,
  DIV: ATFMugshotDescriptionConstants._repeatedMessages.TEXT,
  DL: ATF_CUSTOM_UI + "Definition list",
  DT: ATFMugshotDescriptionConstants._repeatedMessages.TERM_DEFINITION,
  FIGCAPTION: ATF_CUSTOM_UI + "Figure caption",
  LI: ATFMugshotDescriptionConstants._repeatedMessages.LIST_ITEM,
  OL: ATF_CUSTOM_UI + "Ordered list",
  P: ATF_CUSTOM_UI + "Paragraph",
  PRE: ATF_CUSTOM_UI + "Preformatted Text",
  UL: ATF_CUSTOM_UI + "Unordered list",
  A: ATFMugshotDescriptionConstants._repeatedMessages.LINK,
  ABBR: ATF_CUSTOM_UI + "Abbreviation",
  B: ATFMugshotDescriptionConstants._repeatedMessages.BOLD_TEXT,
  BDI: ATFMugshotDescriptionConstants._repeatedMessages.BIDIRECTIONAL_TEXT,
  BDO: ATFMugshotDescriptionConstants._repeatedMessages.BIDIRECTIONAL_TEXT,
  CITE: ATF_CUSTOM_UI + "Citation",
  CODE: ATF_CUSTOM_UI + "Code fragment",
  DATA: ATF_CUSTOM_UI + "Data",
  DFN: ATFMugshotDescriptionConstants._repeatedMessages.DEFINITION,
  EM: ATFMugshotDescriptionConstants._repeatedMessages.ITALICIZED_TEXT,
  I: ATFMugshotDescriptionConstants._repeatedMessages.ITALICIZED_TEXT,
  KBD: ATF_CUSTOM_UI + "Keyboard input",
  MARK: ATF_CUSTOM_UI + "Highlighted text",
  Q: ATF_CUSTOM_UI + "Quotation",
  RB: ATFMugshotDescriptionConstants._repeatedMessages.RUBY_TEXT,
  RP: ATFMugshotDescriptionConstants._repeatedMessages.RUBY_TEXT,
  RT: ATFMugshotDescriptionConstants._repeatedMessages.RUBY_TEXT,
  RTC: ATFMugshotDescriptionConstants._repeatedMessages.RUBY_TEXT,
  RUBY: ATFMugshotDescriptionConstants._repeatedMessages.RUBY_TEXT,
  S: ATF_CUSTOM_UI + "Strikethrough text",
  SAMP: ATF_CUSTOM_UI + "Sample text",
  SMALL: ATF_CUSTOM_UI + "Small text",
  SPAN: ATFMugshotDescriptionConstants._repeatedMessages.TEXT,
  STRONG: ATFMugshotDescriptionConstants._repeatedMessages.BOLD_TEXT,
  SUB: ATF_CUSTOM_UI + "Subscript",
  SUP: ATF_CUSTOM_UI + "Superscript",
  TIME: ATF_CUSTOM_UI + "Time",
  U: ATF_CUSTOM_UI + "Underlined text",
  VAR: ATF_CUSTOM_UI + "Variable name",
  AREA: ATF_CUSTOM_UI + "Map area",
  AUDIO: ATF_CUSTOM_UI + "Audio player",
  MAP: ATF_CUSTOM_UI + "Map",
  VIDEO: ATF_CUSTOM_UI + "Video player",
  EMBED: ATFMugshotDescriptionConstants._repeatedMessages.EXTERNAL_RESOURCE,
  IFRAME: ATFMugshotDescriptionConstants._repeatedMessages.EXTERNAL_RESOURCE,
  OBJECT: ATFMugshotDescriptionConstants._repeatedMessages.EXTERNAL_RESOURCE,
  PICTURE: ATFMugshotDescriptionConstants._repeatedMessages.IMAGE,
  CANVAS: ATF_CUSTOM_UI + "Graphics container",
  NOSCRIPT: ATFMugshotDescriptionConstants._repeatedMessages.TEXT,
  DEL: ATF_CUSTOM_UI + "Deleted text",
  INS: ATF_CUSTOM_UI + "Inserted text",
  CAPTION: ATF_CUSTOM_UI + "Table caption",
  TITLE: ATF_CUSTOM_UI + "Title",
  COL: ATF_CUSTOM_UI + "Table column",
  COLGROUP: ATF_CUSTOM_UI + "Column group",
  TBODY: ATF_CUSTOM_UI + "Table body",
  TD: ATF_CUSTOM_UI + "Table cell",
  TFOOT: ATF_CUSTOM_UI + "Table footer",
  TH: ATF_CUSTOM_UI + "Table header",
  TR: ATF_CUSTOM_UI + "Table row",
  DATALIST: ATFMugshotDescriptionConstants._repeatedMessages.CHOICE_LIST,
  FIELDSET: ATF_CUSTOM_UI + "Input group",
  LABEL: ATF_CUSTOM_UI + "Input label",
  LEGEND: ATF_CUSTOM_UI + "Legend",
  METER: ATF_CUSTOM_UI + "Meter",
  OUTPUT_TEXT: ATF_CUSTOM_UI + "Output text",
  PROGRESS: ATFMugshotDescriptionConstants._repeatedMessages.PROGRESS_BAR,
  TEXTAREA: ATF_CUSTOM_UI + "Textarea",
  SELECT: ATFMugshotDescriptionConstants._repeatedMessages.CHOICE_LIST,
  DETAILS: ATFMugshotDescriptionConstants._repeatedMessages.TEXT,
  INTERACTIVE_COMPONENT: ATFMugshotDescriptionConstants._repeatedMessages.INTERACTIVE_COMPONENT,
  SUMMARY: ATFMugshotDescriptionConstants._repeatedMessages.TEXT,
  SLOT: ATF_CUSTOM_UI + "HTML placeholder",
  TEMPLATE: ATF_CUSTOM_UI + "HTML template",
  TEXT_INPUT: ATFMugshotDescriptionConstants._repeatedMessages.TEXT,
  BUTTON_INPUT: ATFMugshotDescriptionConstants._repeatedMessages.BUTTON,
  RADIO_INPUT: ATFMugshotDescriptionConstants._repeatedMessages.RADIO_BUTTON,
  SUBMIT_INPUT: ATF_CUSTOM_UI + "Submit button",
  CHECKBOX_INPUT: ATFMugshotDescriptionConstants._repeatedMessages.CHECKBOX,
  DATE_INPUT: ATF_CUSTOM_UI + "Date",
  COLOR_INPUT: ATF_CUSTOM_UI + "Color",
  "DATETIME-LOCAL_INPUT": ATF_CUSTOM_UI + "Date/time",
  FILE_INPUT: ATF_CUSTOM_UI + "File",
  HIDDEN_INPUT: ATF_CUSTOM_UI + "Hidden",
  IMAGE_INPUT: ATFMugshotDescriptionConstants._repeatedMessages.IMAGE,
  MONTH_INPUT: ATF_CUSTOM_UI + "Month",
  NUMBER_INPUT: ATF_CUSTOM_UI + "Number",
  PASSWORD_INPUT: ATF_CUSTOM_UI + "Password",
  RANGE_INPUT: ATFMugshotDescriptionConstants._repeatedMessages.RANGE,
  RESET_INPUT: ATF_CUSTOM_UI + "Reset button",
  SEARCH_INPUT: ATFMugshotDescriptionConstants._repeatedMessages.SEARCH,
  TEL_INPUT: ATF_CUSTOM_UI + "Telephone number",
  TIME_INPUT: ATF_CUSTOM_UI + "Time",
  URL_INPUT: ATF_CUSTOM_UI + "URL",
  WEEK_INPUT: ATF_CUSTOM_UI + "Week",
  DGM_TAG_LOCATOR_LABEL_VALUE_AND_AREA: ATF_CUSTOM_UI + "{0} <{1}> [{2}]: {3} with value {4} in page area {5}",
  DGM_TAG_LOCATOR_LABEL_AND_VALUE: ATF_CUSTOM_UI + "{0} <{1}> [{2}]: {3} with value {4}",
  DGM_TAG_LABEL_VALUE_AND_AREA: ATF_CUSTOM_UI + "{0} <{1}>: {2} with value {3} in page area {4}",
  DGM_TAG_LABEL_AND_VALUE: ATF_CUSTOM_UI + "{0} <{1}>: {2} with value {3}",
  DGM_TAG_LOCATOR_LABEL_AND_AREA: ATF_CUSTOM_UI + "{0} <{1}> [{2}]: {3} in page area {4}",
  DGM_TAG_LOCATOR_AND_LABEL: ATF_CUSTOM_UI + "{0} <{1}> [{2}]: {3}",
  DGM_TAG_LABEL_AND_AREA: ATF_CUSTOM_UI + "{0} <{1}>: {2} in page area {3}",
  DGM_TAG_AND_LABEL: ATF_CUSTOM_UI + "{0} <{1}>: {2}",
  DGM_TAG_LOCATOR_AND_AREA: ATF_CUSTOM_UI + "{0} <{1}> [{2}]: (empty) in page area {3}",
  DGM_TAG_AND_AREA: ATF_CUSTOM_UI + "{0} <{1}>: (empty) in page area {2}",
  DGM_TAG_AND_LOCATOR: ATF_CUSTOM_UI + "{0} <{1}> [{2}]",
  DGM_TAG_ONLY: ATF_CUSTOM_UI + "{0} <{1}>: (empty)",
  DGM_DISPLAY_NAME_AND_TAG: ATF_CUSTOM_UI + "{0} <{1}>",
  TRUE: ATF_CUSTOM_UI + "true",
  FALSE: ATF_CUSTOM_UI + "false",
  UNKNOWN_COMPONENT: ATF_CUSTOM_UI + "Unknown component",
  CUSTOM_COMPONENT: ATF_CUSTOM_UI + "Custom component"
};;
/*! RESOURCE: /scripts/glideautomate/components/GettableComponent.js */
"use strict";
var GettableComponent = Class.create({
  SUPPORTED_METHODS: ["getValue", "scrollIntoView", "isDisabled"],
  initialize: function(element, area) {
    this.element = element;
    this.area = area;
    this.tagName = element.tagName.toLowerCase();
    this.type = element.type;
    this.data_type = this.element.getAttribute("sn-atf-data-type");
    var dataTypeParams = this._getDataTypeParams();
    if (dataTypeParams)
      this.dataTypeParams = dataTypeParams;
  },
  _getDataTypeParams: function() {
    var snATFDataTypeParams = this.element.getAttribute("sn-atf-data-type-params");
    if (!snATFDataTypeParams)
      return null;
    var dataTypeParams;
    try {
      dataTypeParams = JSON.parse(snATFDataTypeParams);
    } catch (e) {
      console.log("GettableComponent._getDataTypeParams: Error parsing JSON string from sn-atf-data-type attribute: " + e);
      console.log(e.stack);
    }
    return dataTypeParams;
  },
  getValue: function() {
    return {
      success: true,
      result: this.element.innerText
    };
  },
  isDisabled: function() {
    if (this.element.disabled)
      return {
        success: true,
        result: true
      };
    return {
      success: true,
      result: false
    };
  },
  isSupported: function() {
    var tag = this.element.tagName.toLowerCase();
    var type = this.element.type;
    if (type === "hidden")
      return false;
    if (tag === 'option')
      return false;
    if (tag === 'label') {
      var for_attr = this.element.getAttribute("for");
      if (!for_attr)
        return true;
      var refByLabel = this.element.ownerDocument.getElementById(for_attr);
      if (!refByLabel)
        return true;
      var refByLabelTag = refByLabel.tagName.toLowerCase();
      if (refByLabelTag === "input" || refByLabelTag === "textarea" || refByLabelTag === "select")
        return false;
    }
    return true;
  },
  getComponentInfo: function() {
    var isElementNode = this.element.nodeType && this.element.nodeType === Node.ELEMENT_NODE;
    if (!(isElementNode || this.element instanceof Element))
      return null;
    if (!this.isSupported())
      return null;
    var mugShot = {};
    mugShot["tag"] = this.tagName;
    mugShot["methods"] = this._getSupportedMethods();
    mugShot["area"] = this._getArea();
    mugShot["type"] = this._getType();
    if (this.data_type)
      mugShot["data_type"] = this.data_type;
    mugShot["isDisabled"] = this.isDisabled().result;
    if (this.isBlacklisted()) {
      mugShot["blacklisted"] = true;
      mugShot["blacklisted_reason"] = this.getBlacklistedReason();
    }
    _collectAllAttributes(mugShot, this.element, _isAttributeRequired);
    var getValueRez = this.getValue();
    if (getValueRez && getValueRez.success)
      mugShot["get_value_result"] = getValueRez.result;
    else
      mugShot["get_value_result"] = "";
    if (this.element.parentNode) {
      var list = this.element.parentNode.querySelectorAll(this.tagName);
      if (list && list.length > 1) {
        for (var i = 0; i < list.length; i++) {
          if (list[i] === this.element) {
            mugShot["index"] = i;
            break;
          }
        }
      }
    }
    if (this.element.innerText) {
      mugShot["inner_text"] = this.element.innerText;
    }
    if ((this.tagName.toLowerCase() === "input" || this.tagName.toLowerCase() === "textarea" ||
        this.tagName.toLowerCase() === "select") && this.element.id) {
      var labelDomEl = GlideAutomateUtil.getLabelDomElementFor(this.element);
      if (labelDomEl) {
        var inputLabelMugShot = {};
        _collectAllAttributes(inputLabelMugShot, labelDomEl, _isAttributeRequiredForLabel);
        if (labelDomEl.innerText) {
          inputLabelMugShot["inner_text"] = labelDomEl.innerText;
        }
        mugShot["label_for_input"] = inputLabelMugShot;
      }
    }
    var innerImage = this.element.querySelector("img");
    if (innerImage) {
      var innerImageMugShot = {};
      _collectAllAttributes(innerImageMugShot, innerImage, _isAttributeRequiredForImage);
      mugShot["inner_img"] = innerImageMugShot;
    }

    function _collectAllAttributes(objToStoreAttr, domElement, isAttributeNeededFn) {
      var attributes = domElement.attributes;
      for (var i = 0; i < attributes.length; i++) {
        var attr = attributes[i];
        var attrName = attr.nodeName;
        var attrValue = attr.nodeValue;
        if (!isAttributeNeededFn(domElement, attrName))
          continue;
        if (attrValue && !objToStoreAttr[attrName]) {
          objToStoreAttr[attrName] = attrValue;
        }
      }
    }

    function _isAttributeRequired(domElement, attributeName) {
      return _isAttributeRequiredImplementation(domElement, attributeName);
    }

    function _isAttributeRequiredForLabel(domElement, attributeName) {
      return _isAttributeRequiredImplementation(domElement, attributeName);
    }

    function _isAttributeRequiredForImage(domElement, attributeName) {
      return _isAttributeRequiredImplementation(domElement, attributeName);
    }

    function _isAttributeRequiredImplementation(domElement, attributeName) {
      var WHITELISTED_ATTRIBUTES_FOR_ANY_TAG = ["title", "data-original-title", "aria-label", "id", "name",
        "sys-atf-type", "sys-atf-data-type",
        "sn-atf-type", "sn-atf-data-type", "sn-atf-data-type-params", "sn-atf-class", "role"
      ];
      var WHITELISTED_ATTRIBUTES_FOR_IMG_TAG = ["url", "alt"];
      var WHITELISTED_ATTRIBUTES_FOR_INPUT_TAG = ["type", "placeholder"];
      var tag = domElement.tagName.toLowerCase();
      if (GettableComponent.WHITELISTED_ATTRIBUTES_FOR_ANY_TAG.indexOf(attributeName) !== -1)
        return true;
      if (tag === "img" && GettableComponent.WHITELISTED_ATTRIBUTES_FOR_IMG_TAG.indexOf(attributeName) !== -1)
        return true;
      if (tag === "input" && GettableComponent.WHITELISTED_ATTRIBUTES_FOR_INPUT_TAG.indexOf(attributeName) !== -1)
        return true;
      return false;
    }
    this._populateMugshotDescriptions(mugShot);
    return mugShot;
  },
  _populateMugshotDescriptions: function(mugShot) {
    if (!mugShot)
      return;
    mugShot.sn_atf_mugshot_long_description = GettableComponent._descriptionGenerator.getDescription(mugShot);
    mugShot.sn_atf_mugshot_short_description = GettableComponent._descriptionGenerator.getDisplayLabel(mugShot);
    mugShot.sn_atf_mugshot_label = GettableComponent._descriptionGenerator.getLabel(mugShot);
    mugShot.sn_atf_mugshot_value = String(GettableComponent._descriptionGenerator.getValue(mugShot));
    mugShot.sn_atf_mugshot_tag_display_name = GettableComponent._descriptionGenerator.getTagDisplayName(mugShot);
  },
  scrollIntoView: function() {
    this.element.scrollIntoView();
  },
  setValue: function(value) {
    return {
      success: false,
      msg_key: "method_not_supported"
    };
  },
  afterSetValue: function() {},
  click: function() {
    return {
      success: false,
      msg_key: "method_not_supported"
    };
  },
  isBlacklisted: function() {
    var blacklistAttr = this.element.getAttribute("sn-atf-blacklist");
    if (blacklistAttr && "false" !== blacklistAttr.toLowerCase())
      return true;
    return GettableComponent.isBlacklistedElement(this.element);
  },
  getBlacklistedReason: function() {
    return GettableComponent.getBlacklistedReasonForElement(this.element);
  },
  _getArea: function() {
    return this.area;
  },
  _getType: function() {
    return this.type;
  },
  _getSupportedMethods: function() {
    return this.SUPPORTED_METHODS;
  },
  _isClassDisabled: function() {
    return this.element.classList.contains('disabled');
  }
});
GettableComponent.BLACKLIST_REASON_MESSAGE_KEYS = ['SYS_ATF_BLACKLIST_REASON_DEFAULT',
  'SYS_ATF_BLACKLIST_REASON_IS_GFORM', 'SYS_ATF_BLACKLIST_REASON_TEAMDEV',
  'SYS_ATF_BLACKLIST_REASON_IS_SERVICE_CATALOG', 'SYS_ATF_BLACKLIST_REASON_UNSUPPORTED_ELEMENT'
];
GettableComponent.WHITELISTED_ATTRIBUTES_FOR_ANY_TAG = ["title", "data-original-title", "aria-label", "id", "name", "role",
  "sys-atf-type", "sys-atf-data-type",
  "sn-atf-type", "sn-atf-data-type", "sn-atf-data-type-params", "sn-atf-class"
];
GettableComponent.WHITELISTED_ATTRIBUTES_FOR_IMG_TAG = ["url", "alt"];
GettableComponent.WHITELISTED_ATTRIBUTES_FOR_INPUT_TAG = ["type", "placeholder"];
GettableComponent.BLACKLISTED_TAGS = ["svg"];
GettableComponent.BLACKLISTED_IDS = ['page_timing_div', 'related_lists_wrapper'];
GettableComponent.BLACKLIST_REASON_MESSAGE_MAP = null;
GettableComponent.getBlacklistedReasonForElement = function getBlacklistedReasonForElement(element) {
  _lazyLoadTranslations();
  var reason = element.getAttribute("sn-atf-blacklist");
  var messageKey;
  if (reason === null || reason.length === 0)
    if (GettableComponent.isServiceNowBlacklistedElement(element))
      messageKey = 'SYS_ATF_BLACKLIST_REASON_UNSUPPORTED_ELEMENT';
    else
      messageKey = 'SYS_ATF_BLACKLIST_REASON_DEFAULT';
  else
    messageKey = 'SYS_ATF_BLACKLIST_REASON_' + reason;
  if (messageKey !== null && GettableComponent.BLACKLIST_REASON_MESSAGE_MAP !== null && GettableComponent.BLACKLIST_REASON_MESSAGE_MAP[messageKey])
    return GettableComponent.BLACKLIST_REASON_MESSAGE_MAP[messageKey];
  return new GwtMessage().getMessage(reason);

  function _lazyLoadTranslations() {
    if (GettableComponent.BLACKLIST_REASON_MESSAGE_MAP === null)
      GettableComponent.BLACKLIST_REASON_MESSAGE_MAP = new GwtMessage().getMessages(GettableComponent.BLACKLIST_REASON_MESSAGE_KEYS);
  }
};
GettableComponent.isBlacklistedElement = function isBlacklistedElement(element) {
  var blacklistAttr = element.getAttribute("sn-atf-blacklist");
  if (blacklistAttr && "false" !== blacklistAttr.toLowerCase())
    return true;
  else
    return GettableComponent.isServiceNowBlacklistedElement(element);
}
GettableComponent.isServiceNowBlacklistedElement = function isServiceNowBlacklistedElement(element) {
  var tagName = element.tagName.toLowerCase();
  if (tagName === 'input' && element.type === 'file')
    return true;
  return GettableComponent.BLACKLISTED_TAGS.indexOf(tagName) > -1 ||
    GettableComponent.BLACKLISTED_IDS.indexOf(element.id) > -1;
}
GettableComponent._descriptionGenerator = new ATFMugshotDescriptionGenerator();;
/*! RESOURCE: /scripts/glideautomate/components/ClickableComponent.js */
"use strict";
var ClickableComponent = Class.create(GettableComponent, {
  SUPPORTED_METHODS: ["click"],
  click: function() {
    this.element.click();
    return {
      success: true
    };
  },
  isDisabled: function() {
    if (this.element.disabled)
      return {
        success: true,
        result: true
      };
    var readOnlySensitiveInputTypes = ["image"];
    var disabledClassSensitiveInputTypes = ["button"];
    if (this.element.readOnly && readOnlySensitiveInputTypes.indexOf(this.element.type) !== -1)
      return {
        success: true,
        result: true
      };
    if (this._isClassDisabled() && disabledClassSensitiveInputTypes.indexOf(this.element.type) !== -1)
      return {
        success: true,
        result: true
      };
    return {
      success: true,
      result: false
    };
  }
});;
/*! RESOURCE: /scripts/glideautomate/components/SettableComponent.js */
"use strict";
var SettableComponent = Class.create(GettableComponent, {
  SUPPORTED_METHODS: ["setValue"],
  setValue: function(value) {
    if (this.isDisabled().result)
      return {
        success: false,
        msg_key: "component_read_only"
      };
    switch (this.tagName) {
      case "input":
        return this._setInputValue(value);
      case "select":
        return this._setSelectValue(value);
      default:
        this.element.value = value;
        return {
          success: true
        };
    }
  },
  afterSetValue: function() {
    var event = this.element.ownerDocument.createEvent("Event");
    event.initEvent("change", true, false);
    this.element.dispatchEvent(event);
  },
  getValue: function() {
    switch (this.tagName) {
      case "input":
        return this._getInputValue();
      default:
        return {
          success: true,
          result: this.element.value
        };
    }
  },
  getComponentInfo: function($super) {
    var mugShot = $super();
    if (mugShot == null)
      return null;
    if (typeof this.element.value !== "undefined")
      mugShot["html_value"] = this.element.value;
    this._populateOptions(mugShot);
    return mugShot;
  },
  _populateOptions: function(mugShot) {
    if (this.tagName == "select")
      mugShot["options"] = this._getSelectOptions();
  },
  isDisabled: function() {
    if (this.element.disabled)
      return {
        success: true,
        result: true
      };
    if (this.tagName === "input") {
      var readOnlySensitiveInputTypes = ["date", "date-local", "email", "month", "number", "password", "range", "search", "tel", "text", "time", "url", "week"];
      var disabledClassSensitiveInputTypes = ["checkbox", "radio"];
      if (this.element.readOnly && readOnlySensitiveInputTypes.indexOf(this.element.type) !== -1)
        return {
          success: true,
          result: true
        };
      if (this._isClassDisabled() && disabledClassSensitiveInputTypes.indexOf(this.element.type) !== -1)
        return {
          success: true,
          result: true
        };
    }
    if (this.tagName === "textarea" && this.element.readOnly)
      return {
        success: true,
        result: true
      };
    return {
      success: true,
      result: false
    };
  },
  _setInputValue: function(value) {
    switch (this.type) {
      case "checkbox":
        this.element.checked = value == "true";
        return {
          success: true
        };
      default:
        this.element.value = value;
        return {
          success: true
        };
    }
  },
  _getInputValue: function() {
    switch (this.type) {
      case "checkbox":
        return {
          success: true,
          result: this.element.checked ? "true" : "false"
        };
      default:
        return {
          success: true,
          result: this.element.value
        };
    }
  },
  _getSelectOptions: function() {
    var options = this.element.options;
    if (!options)
      return null;
    var opts = [];
    for (var i = 0; i < options.length; i += 1) {
      var option = options[i];
      opts.push({
        value: option.value,
        label: option.text
      });
    }
    return opts;
  },
  _setSelectValue: function(value) {
    var options = this.element.options;
    if (!options)
      return {
        success: true,
        result: ""
      };
    for (var i = 0; i < options.length; i += 1) {
      var option = options[i];
      if (option.value === value) {
        option.selected = true;
        return {
          success: true,
          result: value
        };
      }
    }
    return {
      success: true,
      result: ""
    };
  }
});;
/*! RESOURCE: /scripts/glideautomate/components/GlideAutomateCustomComponentUtil.js */
var GlideAutomateCustomComponentUtil = Class.create({});
GlideAutomateCustomComponentUtil.newComponent = function(element, area) {
  var snATFClass = element.getAttribute("sn-atf-class");
  var customComponentClass = GlideAutomateCustomComponentUtil._findInternalClass(element, snATFClass)
  var clazz;
  if (customComponentClass) {
    if (customComponentClass.isSettable)
      clazz = Class.create(SettableComponent, customComponentClass);
    else
      clazz = Class.create(ClickableComponent, customComponentClass);
    return new clazz(element, area);
  }
  return null;
}
GlideAutomateCustomComponentUtil.internalClassMap = {
  BaseMacroReference: "MacroReferenceComponent",
  BaseSNRecordPicker: "RecordPickerComponent"
}
GlideAutomateCustomComponentUtil._findInternalClass = function(element, snATFClass) {
  if (snATFClass.startsWith("builtin:ATF.")) {
    var componentClassKey = snATFClass.substring("builtin:ATF.".length);
    var componentClassName = "SN" + GlideAutomateCustomComponentUtil.internalClassMap[componentClassKey];
    if (!componentClassName) {
      console.log("GlideAutomateCustomComponentUtil._findInternalClass: Cannot find implementation for " + snATFClass);
      return null;
    }
    return eval(componentClassName);
  }
  return eval("window.top.g_automate.getPageWindow()." + snATFClass);
}
GlideAutomateCustomComponentUtil.escape = function(value) {
  if (typeof value === 'string')
    return value.replace(/[\=\!\,\:\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  return value;
};
GlideAutomateCustomComponentUtil.getLabelDomElementFor = function(domElement) {
  var labelDomEl = null;
  try {
    labelDomEl =
      domElement.ownerDocument.querySelector('label[for=\"' + GlideAutomateCustomComponentUtil.escape(domElement.id) + '\"]');
  } catch (err) {
    console.log("Failed to find label for input by id. Input's ID = " + domElement.id);
    console.log(err);
  }
  return labelDomEl;
};;
/*! RESOURCE: /scripts/glideautomate/components/RadioSettableComponent.js */
"use strict";
var RadioSettableComponent = Class.create(SettableComponent, {
  setValue: function(value) {
    this.element = this._getRadioElement(value);
    if (this.element) {
      var elementIsDisabled = SettableComponent.prototype.isDisabled.call(this);
      if (elementIsDisabled.result)
        return {
          success: false,
          msg_key: "component_read_only"
        };
      this.element.checked = true;
      return {
        success: true
      };
    }
    return {
      success: false,
      msg_key: "component_not_found"
    };
  },
  getValue: function() {
    var selectedRadioElement = this._getRadioElement(null, true);
    if (selectedRadioElement)
      return {
        success: true,
        result: selectedRadioElement.value
      };
    return {
      success: false,
      result: undefined
    };
  },
  getComponentInfo: function($super) {
    var mugShot = $super();
    if (mugShot == null)
      return null;
    var labelDomEl = GlideAutomateUtil.getLabelDomElementFor(this.element);
    mugShot["html_value"] = labelDomEl ? labelDomEl.innerText : this.element.value;
    var labelForInput = mugShot["label_for_input"];
    var name = this.element.getAttribute("name");
    if (labelForInput) {
      var innerText = labelForInput["inner_text"];
      if (innerText)
        labelForInput["inner_text"] = name;
    } else
      mugShot["label_for_input"] = {
        "inner_text": name
      };
    this._populateMugshotDescriptions(mugShot);
    return mugShot;
  },
  _populateOptions: function(mugShot) {
    var opts = [];
    var radioElements = RadioSettableComponent.getValidRadioElements(this.element);
    for (var i = 0, len = radioElements.length; i < len; i++) {
      var radioElement = radioElements[i];
      var labelDomEl = GlideAutomateUtil.getLabelDomElementFor(radioElement);
      opts.push({
        value: radioElement.value,
        label: labelDomEl ? labelDomEl.innerText : radioElement.value
      });
    }
    mugShot["options"] = opts;
  },
  afterSetValue: function() {
    var event = this.element.ownerDocument.createEvent("Event");
    event.initEvent("change", true, false);
    var selectedElement = this._getRadioElement(null, true);
    if (selectedElement)
      selectedElement.dispatchEvent(event);
  },
  isDisabled: function() {
    var elements = RadioSettableComponent.getValidRadioElements(this.element);
    for (var i = 0; i < elements.length; i++) {
      var component = new SettableComponent(elements[i], this.area);
      var isElementDisabled = component.isDisabled();
      if (!isElementDisabled.success || !isElementDisabled.result)
        return isElementDisabled;
    }
    return {
      success: true,
      result: true
    };
  },
  _getRadioElement: function(value, isChecked) {
    var radioElement = null;
    try {
      var selectorStr = RadioSettableComponent.getRadioSelector(this.element, value, isChecked);
      radioElement = this.element.ownerDocument.querySelector(selectorStr);
    } catch (err) {
      console.log("Failed to lookup Radio element. Input's name: " + this.element.name + ", selectorStr: " + selectorStr);
      console.log(err);
    }
    return radioElement;
  }
});
RadioSettableComponent.getRadioSelector = function(element, value, isChecked) {
  var escapedName = GlideAutomateUtil.escape(element.name);
  var selectorStr = 'input[name="' + escapedName + '"][type="radio"]';
  if (value)
    selectorStr += '[value="' + value + '"]';
  else
    selectorStr += '[value]';
  if (isChecked === true)
    selectorStr += ':checked';
  return selectorStr;
}
RadioSettableComponent.getValidRadioElements = function(element) {
  try {
    var radioByNameQuerySelector = RadioSettableComponent.getRadioSelector(element, null, false);
    return element.ownerDocument.querySelectorAll(radioByNameQuerySelector);
  } catch (err) {
    console.log("Failed to get all radio elements belonging to input name = " + element.name +
      ", escaped query selector : " + radioByNameQuerySelector);
    console.log(err);
  }
  return [];
};
RadioSettableComponent.shouldProcessRadioElement = function(element) {
  return element.hasAttribute("value") && element.hasAttribute("name");
};
RadioSettableComponent.isChecked = function(element) {
  return element.checked;
};
RadioSettableComponent.hasACheckedRadio = function(element) {
  try {
    var selector = RadioSettableComponent.getRadioSelector(element, null, true);
    var checkedRadio = element.ownerDocument.querySelector(selector);
    if (checkedRadio)
      return true;
    else
      return false;
  } catch (err) {
    console.log("Failed to find whether a radio element is checked in input radio with name = " + element.name +
      ", escaped query selector : " + selector);
    console.log(err);
  }
};;
/*! RESOURCE: /scripts/glideautomate/components/sn/SNMacroReferenceComponent.js */
var SNMacroReferenceComponent = {
  initialize: function($super, element, area) {
    $super(element, area);
    if (this.dataTypeParams) {
      this.reference = this.dataTypeParams["reference"];
      this.reference_qual = this.dataTypeParams["reference_qual"];
    }
  },
  isSettable: true,
  setValue: function($super, value, componentLocator) {
    var referenceElement = this._getReferenceElement();
    if (referenceElement)
      referenceElement.value = value;
    if (!value || value === undefined)
      return $super("");
    var dv = this._getDisplayValue(value);
    if (dv)
      return $super(dv);
    return {
      success: false,
      msg_key: "cannot_find_display_value"
    };
  },
  _getInputValue: function() {
    var referenceElement = this._getReferenceElement(this.element.id);
    if (referenceElement)
      return {
        success: true,
        result: referenceElement.value
      };
    else
      return {
        success: false,
        msg_key: "cannot_find_value"
      };
  },
  _getReferenceElement: function() {
    var referenceElementID = this.element.id.substring("sys_display.".length);
    return this.element.ownerDocument.querySelector("#" + referenceElementID.replace(/\./g, "\\."));
  },
  _getDisplayValue: function(referenceSysID) {
    if (!this.reference)
      return null;
    var ga = new GlideAjax('TestExecutorAjax');
    ga.addParam('sysparm_name', 'getDisplay');
    ga.addParam('sysparm_table', this.reference);
    ga.addParam('sysparm_value', referenceSysID);
    ga.getXMLWait();
    return ga.getAnswer();
  },
};;
/*! RESOURCE: /scripts/glideautomate/components/sn/SNRecordPickerComponent.js */
var SNRecordPickerComponent = {
  isSettable: true,
  getComponentInfo: function($super) {
    var mugShot = $super();
    if (mugShot == null)
      return null;
    var snAtfComponentValue = this._getSnAtfComponentAttributeValue();
    mugShot["html_value"] = snAtfComponentValue.displayValue || this.element.value;
    this._populateMugshotDescriptions(mugShot);
    return mugShot;
  },
  setValue: function(value) {
    var recordPickerFieldData = this._getFieldData(value);
    if (recordPickerFieldData && recordPickerFieldData.success) {
      var field = {};
      field.value = recordPickerFieldData.value;
      field.displayValue = recordPickerFieldData.displayValue;
      var customEvent = this.element.ownerDocument.createEvent("CustomEvent");
      customEvent.initCustomEvent("sn-atf-setvalue", true, false, {
        newValue: field
      });
      this.element.dispatchEvent(customEvent);
      return {
        success: true
      };
    }
    return {
      success: false,
      msg_key: "cannot_find_display_value"
    };
  },
  afterSetValue: function() {},
  getValue: function() {
    var snAtfComponentValue = this._getSnAtfComponentAttributeValue();
    if (snAtfComponentValue)
      return {
        success: true,
        result: snAtfComponentValue.value || ""
      };
    return {
      success: false,
      msg_key: "cannot_find_value"
    };
  },
  _getSnAtfComponentAttributeValue: function() {
    if (this.element.hasAttribute("sn-atf-component-value")) {
      try {
        var snAtfComponentValue = this.element.getAttribute("sn-atf-component-value");
        return JSON.parse(snAtfComponentValue);
      } catch (error) {
        console.log("Error in parsing value: " + snAtfComponentValue + " of snRecordPicker element's attribute 'sn-atf-component-value'");
        console.log(error);
      }
    }
    return null;
  },
  _getFieldData: function(referenceSysID) {
    if (!(this.dataTypeParams && this.dataTypeParams["reference"]))
      return null;
    var ga = new GlideAjax("ATFRecordPickerHelper");
    ga.addParam("sysparm_name", "getRecordPickerFieldData");
    ga.addParam("sysparm_table", this.dataTypeParams["reference"]);
    ga.addParam("sysparm_sys_id", referenceSysID);
    ga.addParam("sysparm_value_field", this.dataTypeParams["valueField"]);
    ga.addParam("sysparm_display_field", this.dataTypeParams["displayField"]);
    ga.getXMLWait();
    var answer = ga.getAnswer();
    try {
      return JSON.parse(answer);
    } catch (e) {
      console.log("Error in parsing response: " + answer + ", from ATFRecordPickerHelper.getRecordPickerFieldData.");
      console.log(e);
    }
    return null;
  }
};;
/*! RESOURCE: /scripts/glideautomate/GlideAutomateWait.js */
"use strict";
var GlideAutomateWait = Class.create({
  DEFAULT_WAITING_TIME_LIMIT_SEC: 60,
  INTERVAL_BETWEEN_SAMPLES_MS: 300,
  REQUIRED_NUMBER_OF_SERIAL_CALMS: 1,
  initialize: function() {
    this.xhrMonitor_xhrs = []
    this.xhrMonitor_numberOfOpenCallForPeriod = 0;
    this.documentRef = null;
    this.numberOfserialCalmPeriods = 0;
    this.totalWaitingTimeMs = 0;
    this.isMutation = false;
    this.lastStartTime = 0;
  },
  startToWaitMomentOfCalm: function(callOnSuccess, callOnFailure, waitingTimeLimitSecPar) {
    if (!this._getPageFrame()) {
      callOnSuccess();
      return;
    }
    var waitingTimeLimitSec = waitingTimeLimitSecPar;
    if (typeof waitingTimeLimitSec === "undefined")
      waitingTimeLimitSec = this.DEFAULT_WAITING_TIME_LIMIT_SEC;
    var t = this;
    var intervalBetweenSamplesMs = this.INTERVAL_BETWEEN_SAMPLES_MS;
    var requiredNumberOfSerialCalms = this.REQUIRED_NUMBER_OF_SERIAL_CALMS;
    this.totalWaitingTimeMs = 0;
    this._clearOutGatheredForPeriodChanges();
    this._clearWhenDocumentWasChanged();
    this.numberOfserialCalmPeriods = 0;
    if (this.isDebug()) {
      console.log("========= startToWaitMomentOfCalm was called ========");
    }
    this.lastStartTime = Date.now();
    var timerId = window.setInterval(function() {
      if (t._isPeriodCalm()) {
        t.numberOfserialCalmPeriods++;
      } else {
        if (t.numberOfserialCalmPeriods > 0) {
          console.log("!!!! previous period was marked as calm - but next is not!!!!!");
        }
        t.numberOfserialCalmPeriods = 0;
      }
      if (t.numberOfserialCalmPeriods >= requiredNumberOfSerialCalms) {
        clearInterval(timerId);
        t._clearWhenWaitingFinishing();
        if (t.isDebug())
          console.log("========= Enough Calm Time was found ========");
        callOnSuccess();
        return;
      }
      t.totalWaitingTimeMs += intervalBetweenSamplesMs;
      if (t.totalWaitingTimeMs >= waitingTimeLimitSec * 1000) {
        clearInterval(timerId);
        t._clearWhenWaitingFinishing();
        if (t.isDebug())
          console.log("========= waiting time is over ========");
        callOnFailure();
        return;
      }
      if (t.isDebug()) {
        console.log("=> Сontinue to wait: totalWaitingTimeMs=" + t.totalWaitingTimeMs + " numberOfserialCalmPeriods=" + t.numberOfserialCalmPeriods);
        console.log("number of XHRs in progress = " + t.getNumbeOfOpenXhrAndDeleteFinished() + " numberOfOpenCallForPeriod=" + t.xhrMonitor_numberOfOpenCallForPeriod);
      }
      t._clearOutGatheredForPeriodChanges();
    }, intervalBetweenSamplesMs);
  },
  isDebug: function() {
    return top.g_automate.isDebug();
  },
  _getPageDocument: function() {
    return top.g_automate.getPageDocument();
  },
  _getPageWindow: function() {
    return top.g_automate.getPageWindow();
  },
  _getPageFrame: function() {
    return top.g_automate.getPageFrame();
  },
  _isDocumentReady: function() {
    var docFrame = this._getPageFrame();
    if (!docFrame.contentWindow) {
      return false;
    }
    if (!docFrame.contentWindow.document) {
      return false;
    }
    if (!docFrame.contentWindow.document) {
      return false;
    }
    if (!docFrame.contentWindow.document.readyState || docFrame.contentWindow.document.readyState !== "complete") {
      return false;
    }
    return true;
  },
  _isDocumentChanged: function() {
    var newDocumentRef = this._getPageDocument();
    if (newDocumentRef !== this.documentRef) {
      if (this.isDebug())
        console.log("document was changed");
      this._clearWhenDocumentWasChanged();
      this.documentRef = newDocumentRef;
      return true;
    }
    return false;
  },
  _instrumentWindow: function() {
    this._setMutationObserver();
    this._instrumentWindowXhr();
  },
  _clearOutGatheredForPeriodChanges: function() {
    this.isMutation = false;
    this.xhrMonitor_numberOfOpenCallForPeriod = 0;
  },
  _clearWhenDocumentWasChanged: function() {
    this.documentRef = null;
  },
  _clearWhenWaitingFinishing: function() {
    this._removeMutationObserver();
  },
  _isPeriodCalm: function() {
    try {
      var d = new Date();
      if (this.isDebug()) {
        console.log("_isPeriodCalm call at hours:" + d.getHours() + " min:" + d.getMinutes() + " sec:" + d.getSeconds() + " ms:" + d.getMilliseconds());
      }
      var relativeScheduleDelay = (d.getTime() - this.lastStartTime) / this.INTERVAL_BETWEEN_SAMPLES_MS;
      this.lastStartTime = d.getTime();
      if (relativeScheduleDelay > 1.15) {
        if (this.isDebug()) {
          console.log("_isPeriodCalm returned false. Heavy JS activity was detected. relativeScheduleDelay= " + relativeScheduleDelay);
        }
        return false;
      }
      if (relativeScheduleDelay < 0.83) {
        if (this.isDebug()) {
          console.log("_isPeriodCalm returned false. Too close calls of _isPeriodCalm was detected.  relativeScheduleDelay= " + relativeScheduleDelay);
        }
        return false;
      }
      if (!this._isDocumentReady()) {
        this._clearWhenDocumentWasChanged();
        if (this.isDebug()) {
          console.log("_isPeriodCalm returned false. Document was not ready");
        }
        return false;
      }
      if (this._isDocumentChanged()) {
        this._instrumentWindow();
        if (this.isDebug()) {
          console.log("_isPeriodCalm returned false. Instance of the document was changed");
        }
        return false;
      }
      if (this.isMutation) {
        if (this.isDebug()) {
          console.log("_isPeriodCalm returned false. DOM change detected");
        }
        return false;
      }
      if (!this._isXhrCalm()) {
        if (this.isDebug()) {
          console.log("_isPeriodCalm returned false. Xhr call was detected");
        }
        return false;
      }
      console.log("_isPeriodCalm returned true");
      return true;
    } catch (error) {
      console.log("Error during _isPeriodCalm was caught.  " + error);
      return false;
    }
  },
  _setMutationObserver: function() {
    try {
      var t = this;
      document.mutationObserver = new MutationObserver(function(mutations) {
        try {
          mutations.forEach(function(mutation) {
            if (t.isMutation)
              return;
            if (!_isRealMutation(mutation))
              return;
            if (!_isMutationBlacklisted(mutation)) {
              if (t.isDebug())
                console.log(mutation);
              t.isMutation = true;
            }
          });
        } catch (error) {
          console.log("Error during registration of DOM mutation was caught.  " + error);
          t.isMutation = true;
        }
      });
      document.mutationObserver.observe(t._getPageDocument().documentElement, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true
      });
    } catch (error) {
      console.log("Error during _setMutationObserver was caught.  " + error);
    }

    function _isRealMutation(mutation) {
      if (mutation.type === "attributes") {
        if (mutation.target && typeof mutation.target.getAttribute === "function") {
          var newAttributeValue = mutation.target.getAttribute(mutation.attributeName);
          if (newAttributeValue === mutation.oldValue)
            return false;
        }
      } else if (mutation.type === "characterData") {
        if (mutation.target) {
          var newValue = mutation.target.nodeValue;
          if (newValue === mutation.oldValue)
            return false;
        }
      }
      return true;
    }

    function _isMutationBlacklisted(mutation) {
      var nodesArr = t._getPageDocument().querySelectorAll("html.ltr.date-calendar");
      for (var i = 0; i < nodesArr.length; i++)
        if (nodesArr[i] === mutation.target)
          return true;
      nodesArr = t._getPageDocument().querySelectorAll("button#conflict_action_run.btn.btn-default");
      for (var i = 0; i < nodesArr.length; i++)
        if (nodesArr[i] === mutation.target)
          return true;
      return false;
    }
  },
  _removeMutationObserver: function() {
    try {
      document.mutationObserver.disconnect();
    } catch (error) {
      console.log("Error during _removeMutationObserver was caught.  " + error);
    }
  },
  addXhrToMonitor: function(xhr, url) {
    var t = this;
    t.getNumbeOfOpenXhrAndDeleteFinished();
    try {
      if (t._isXhrUrlBlacklisted(url))
        return;
      t.xhrMonitor_numberOfOpenCallForPeriod++;
      if (t.xhrMonitor_numberOfOpenCallForPeriod > 100000)
        t.xhrMonitor_numberOfOpenCallForPeriod = 100000;
      for (var i = 0; i < t.xhrMonitor_xhrs.length; i++)
        if (t.xhrMonitor_xhrs[i] === xhr)
          return;
      t.xhrMonitor_xhrs.push(xhr);
      if (t.isDebug())
        console.log("XMLHttpRequest was added ");
    } catch (error) {
      console.log("Error during addXhrToMonitor was caught.  " + error);
    }
  },
  _isXhrUrlBlacklisted: function(url) {
    if (!url)
      true;
    var backlistedUrls = [
      "api/now/ui/presence",
      "amb/connect"
    ];
    for (var i = 0; i < backlistedUrls.length; i++) {
      if (url.indexOf(backlistedUrls[i]) !== -1)
        return true;
    }
    return false;
  },
  getNumbeOfOpenXhrAndDeleteFinished: function() {
    var requestsInProgress = 0;
    var i = this.xhrMonitor_xhrs.length;
    while (i--) {
      if (!this.xhrMonitor_xhrs[i]) {
        this.xhrMonitor_xhrs.splice(i, 1);
        continue;
      }
      try {
        var requestState = this.xhrMonitor_xhrs[i].readyState;
        if (requestState == undefined) {
          if (this.isDebug())
            console.log("requestState is undefined ??");
          this.xhrMonitor_xhrs.splice(i, 1);
          continue;
        }
        if (requestState == 4) {
          this.xhrMonitor_xhrs.splice(i, 1);
          continue;
        } else if (requestState == 0)
          continue;
        else
          requestsInProgress++;
      } catch (error) {
        console.log("Error during getNumbeOfOpenXhrAndDeleteFinished was caught.  " + error);
        requestsInProgress++;
        this.xhrMonitor_xhrs.splice(i, 1);
      }
    }
    return requestsInProgress;
  },
  _isXhrCalm: function() {
    if (this.getNumbeOfOpenXhrAndDeleteFinished() > 0 || this.xhrMonitor_numberOfOpenCallForPeriod > 0)
      return false;
    return true;
  },
  _instrumentWindowXhr: function() {}
});;
/*! RESOURCE: /scripts/glideautomate/GlideAutomateMD5.js */
"use strict";
var GlideAutomateMD5 = Class.create({});
GlideAutomateMD5.md5 = function(mugshot) {
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
  return hex(md51(mugshot));
};;
/*! RESOURCE: /scripts/glideautomate/GlideAutomatePageCrawler.js */
"use strict";
var GlideAutomatePageCrawler = Class.create({
  SETTABLE_ELEMENTS: ['input', 'textarea', 'select'],
  CLICKABLE_INPUTS: ['button', 'submit', 'reset'],
  CRAWLER_IGNORED_TAGS: ['script', 'body', 'noscript', 'now-message', 'form', 'style', 'br'],
  CANDIDATES_FOR_TRIMMING: ['div', 'span', 'header', 'footer', 'ul', 'p', 'section', 'li', 'main', 'nav', 'b',
    'small', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'u', 's', 'strike', 'pre', 'code', 'tt', 'font', 'em', 'center',
    'strong'
  ],
  INTERESTING_ATTRIBUTE_KEYWORDS: ['click', 'mouse', 'sn-atf-'],
  FUNCTION_CALL_REGEX: /\(.*\)/,
  initialize: function(shouldTrimComponents, debug) {
    this._shouldTrimComponents = shouldTrimComponents;
    this._debug = debug;
  },
  getPageURL: function() {
    var loc = this._getPageDocument().location;
    return loc.pathname + loc.search;
  },
  pageHasText: function(expectedText) {
    var doc = this._getPageDocument();
    return this._pageHasText(doc, expectedText);
  },
  _pageHasText: function(doc, expectedText) {
    var nestedIframes = doc.getElementsByTagName('iframe');
    for (var i = 0; i < nestedIframes.length; i += 1) {
      var nestedDoc = nestedIframes[i].contentWindow.document;
      if (this._pageHasText(nestedDoc, expectedText))
        return true;
    }
    try {
      if (doc.nodeType === 9)
        doc = doc.body;
      var actualText = doc.innerText;
      if (!actualText)
        return false;
      actualText = actualText.replace(/\s+/gm, " ");
      expectedText = expectedText.replace(/\s+/gm, " ");
      return actualText.indexOf(expectedText) !== -1;
    } catch (e) {
      return false;
    }
  },
  getPageComponents: function() {
    var doc = this._getPageDocument();
    return this._crawl(doc);
  },
  _crawl: function(doc) {
    var components = [];
    var trimmedComponents = [];
    var elementStack = [];
    var currentArea = "default";
    var currentComponent;
    var elementIDsToExclude = [];
    var radioNamesToExclude = [];
    elementStack.push({
      elem: doc.body,
      area: currentArea
    });
    while (elementStack.length > 0) {
      try {
        var elementObj = elementStack.pop();
        var element = elementObj.elem;
        currentArea = elementObj.area;
        currentComponent = null;
        var shouldProcessElement = this._shouldProcessElement(element, elementIDsToExclude, radioNamesToExclude);
        if (shouldProcessElement) {
          currentComponent = this._processElement(element, currentArea);
          currentArea = currentComponent._getArea();
          if (this._isElementInteresting(element))
            components.push(currentComponent);
          else
            trimmedComponents.push(currentComponent);
        }
        var children = element.children;
        if (!children || children.length == 0)
          continue;
        var shouldProcessChildren = this._shouldProcessChildren(element, currentComponent);
        if (!shouldProcessChildren)
          continue;
        for (var i = children.length - 1; i >= 0; i -= 1)
          elementStack.push({
            elem: children[i],
            area: currentArea
          });
      } catch (e) {
        console.log("Exception while processing element in page crawler", e);
      }
    }
    var nestedIframes = doc.getElementsByTagName('iframe');
    for (var i = 0; i < nestedIframes.length; i += 1) {
      var nestedDoc = nestedIframes[i].contentWindow.document;
      components = components.concat(this._crawl(nestedDoc));
    }
    if (this._debug) {
      var resultMsg = "Found " + components.length + " interesting elements";
      if (trimmedComponents.length > 0)
        resultMsg += " (" + (trimmedComponents.length) + " uninteresting elements were removed)";
      console.log("DEBUG: " + resultMsg);
      console.log("DEBUG: The following uninteresting components were removed:");
      trimmedComponents.forEach(function(component) {
        console.log(component);
      });
    }
    return components;
  },
  _processElement: function(element, area) {
    var nextArea = element.getAttribute("sn-atf-area");
    if (nextArea) {
      if (area != 'default')
        area = area + '/' + nextArea;
      else
        area = nextArea;
    }
    return this._getComponent(element, area);
  },
  _shouldProcessElement: function(element, elementIDsToExclude, radioNamesToExclude) {
    var tagName = element.tagName.toLowerCase();
    if (tagName.indexOf(":") != -1)
      return false;
    if (GettableComponent.isBlacklistedElement(element))
      return true;
    if (this.CRAWLER_IGNORED_TAGS.indexOf(tagName) != -1)
      return false;
    var id = element.id;
    if (elementIDsToExclude.indexOf(id) != -1)
      return false;
    if (element.type === "radio") {
      if (!RadioSettableComponent.shouldProcessRadioElement(element))
        return false;
      var radioName = element.getAttribute("name");
      if (radioNamesToExclude.indexOf(radioName) !== -1)
        return false;
      if (RadioSettableComponent.hasACheckedRadio(element) && !RadioSettableComponent.isChecked(element))
        return false;
      radioNamesToExclude.push(radioName);
    }
    return true;
  },
  _isElementInteresting: function(element) {
    if (!this._shouldTrimComponents)
      return true;
    if (GettableComponent.isBlacklistedElement(element))
      return true;
    if (this.CANDIDATES_FOR_TRIMMING.indexOf(element.tagName.toLowerCase()) < 0)
      return true;
    for (var child = element.firstChild; child != null; child = child.nextSibling) {
      if (child.nodeType === Node.TEXT_NODE && child.data.trim() !== '')
        return true;
      else if (typeof child.tagName !== 'undefined' && child.tagName.toLowerCase() === 'img')
        return true;
    }
    for (var i = 0; i < element.attributes.length; i++)
      if (this._isAttributeInteresting(element.attributes[i]))
        return true;
    return false;
  },
  _isAttributeInteresting: function(attr) {
    var name = attr.name.toLowerCase();
    var value = attr.value.toLowerCase();
    for (var i = 0; i < this.INTERESTING_ATTRIBUTE_KEYWORDS.length; i++) {
      if (name.indexOf(this.INTERESTING_ATTRIBUTE_KEYWORDS[i]) > -1)
        return true;
    }
    if (this.FUNCTION_CALL_REGEX.test(value))
      return true;
    else
      return false;
  },
  _shouldProcessChildren: function(element, component) {
    var snATFClass = element.getAttribute("sn-atf-class");
    if (snATFClass)
      return false;
    var tagName = element.tagName.toLowerCase();
    if (tagName === 'select')
      return false;
    if (component && component.isBlacklisted())
      return false;
    return true;
  },
  _getComponent: function(element, area) {
    var snATFClass = element.getAttribute("sn-atf-class");
    if (snATFClass) {
      var cc = GlideAutomateCustomComponentUtil.newComponent(element, area);
      if (cc != null)
        return cc;
    }
    var tagName = element.tagName.toLowerCase();
    if ("input" === tagName) {
      var elementType = element.type;
      if ("radio" === elementType)
        return new RadioSettableComponent(element, area);
      if (this.CLICKABLE_INPUTS.indexOf(elementType) > -1)
        return new ClickableComponent(element, area);
    }
    if (this.SETTABLE_ELEMENTS.indexOf(tagName) != -1)
      return new SettableComponent(element, area);
    return new ClickableComponent(element, area);
  },
  _getPageDocument: function() {
    return top.g_automate.getPageDocument();
  },
});;
/*! RESOURCE: /scripts/glideautomate/GlideAutomateComponentFinder.js */
"use strict";
var GlideAutomateComponentFinder = Class.create(GlideAutomatePageCrawler, {
  initialize: function() {
    if (window.top.g_automate)
      this._debug = window.top.g_automate.isDebug();
  },
  findComponent: function(mugshot) {
    if (typeof mugshot === 'string')
      mugshot = this._getMugshotAsJSON(mugshot);
    if (mugshot === null)
      return {
        success: false,
        msg_key: "component_not_found",
        decision: "no_mugshot",
        component: null
      };
    var allComponents = this.getPageComponents();
    var allMugshotsAndComponents = this._getMugshotAndComponent(mugshot, allComponents);
    if (allMugshotsAndComponents.foundMD5Match)
      return {
        success: true,
        decision: 'md5',
        component: allMugshotsAndComponents.component,
        probability: 'high'
      };
    var arrayAttributes;
    var filteredMugshotsAndComponents;
    if (this._isSNATFDataType(mugshot['sn-atf-data-type'])) {
      arrayAttributes = ['sn-atf-data-type', 'id'];
      filteredMugshotsAndComponents = this._applyFilterSet(mugshot, allMugshotsAndComponents, arrayAttributes);
      if (filteredMugshotsAndComponents.success)
        return {
          success: true,
          decision: filteredMugshotsAndComponents.decision,
          component: filteredMugshotsAndComponents.component,
          probability: 'high'
        };
      return this._checkIndex(mugshot, filteredMugshotsAndComponents.component, allMugshotsAndComponents);
    }
    if (this._isSNATFClass(mugshot['sn-atf-class'])) {
      arrayAttributes = ['sn-atf-class', 'id'];
      filteredMugshotsAndComponents = this._applyFilterSet(mugshot, allMugshotsAndComponents, arrayAttributes);
      if (filteredMugshotsAndComponents.success)
        return {
          success: true,
          decision: filteredMugshotsAndComponents.decision,
          component: filteredMugshotsAndComponents.component,
          probability: 'high'
        };
      return this._checkIndex(mugshot, filteredMugshotsAndComponents.component, allMugshotsAndComponents);
    }
    if (this._isSettable(mugshot['methods'])) {
      if (this._isSelect(mugshot['tag'])) {
        arrayAttributes = ['id', 'tag', 'data-original-title', 'sn_atf_mugshot_label', 'name', 'area'];
        filteredMugshotsAndComponents = this._applyFilterSet(mugshot, allMugshotsAndComponents, arrayAttributes);
        if (filteredMugshotsAndComponents.success)
          return {
            success: true,
            decision: filteredMugshotsAndComponents.decision,
            component: filteredMugshotsAndComponents.component,
            probability: 'high'
          };
        return this._checkIndex(mugshot, filteredMugshotsAndComponents.component, allMugshotsAndComponents);
      }
      if (this._isSettableText(mugshot['tag'], mugshot['type'])) {
        arrayAttributes = ['id', 'name', 'data-original-title', 'tag', 'area'];
        filteredMugshotsAndComponents = this._applyFilterSet(mugshot, allMugshotsAndComponents, arrayAttributes);
        if (filteredMugshotsAndComponents.success)
          return {
            success: true,
            decision: filteredMugshotsAndComponents.decision,
            component: filteredMugshotsAndComponents.component,
            probability: 'high'
          };
        return this._checkIndex(mugshot, filteredMugshotsAndComponents.component, allMugshotsAndComponents);
      }
      arrayAttributes = ['id', 'name', 'data-original-title', 'type', 'area'];
      filteredMugshotsAndComponents = this._applyFilterSet(mugshot, allMugshotsAndComponents, arrayAttributes);
      if (filteredMugshotsAndComponents.success)
        return {
          success: true,
          decision: filteredMugshotsAndComponents.decision,
          component: filteredMugshotsAndComponents.component,
          probability: 'high'
        };
      return this._checkIndex(mugshot, filteredMugshotsAndComponents.component, allMugshotsAndComponents);
    } else {
      arrayAttributes = ['id', 'get_value_result', 'data-original-title', 'tag', 'area'];
      filteredMugshotsAndComponents = this._applyFilterSet(mugshot, allMugshotsAndComponents, arrayAttributes);
      if (filteredMugshotsAndComponents.success)
        return {
          success: true,
          decision: filteredMugshotsAndComponents.decision,
          component: filteredMugshotsAndComponents.component,
          probability: 'high'
        };
      return this._checkIndex(mugshot, filteredMugshotsAndComponents.component, allMugshotsAndComponents);
    }
  },
  _getMugshotAsJSON: function(componentLocator) {
    try {
      return JSON.parse(componentLocator);
    } catch (e) {
      console.log("Failed to parse locator into a JSON object");
      console.log(e);
      return null;
    }
  },
  _getMugshotAndComponent: function(mugshot, allComponents) {
    var mugshotsAndComponents = [];
    for (var i = 0; i < allComponents.length; i++) {
      var component = allComponents[i];
      var componentMugshot = component.getComponentInfo();
      if (componentMugshot != null) {
        var stringifiedComponentMugshot = JSON.stringify(componentMugshot);
        var componentMugshotHash = GlideAutomateMD5.md5(stringifiedComponentMugshot);
        if (componentMugshotHash != null && mugshot['hash'] === componentMugshotHash)
          return {
            foundMD5Match: true,
            decision: 'md5',
            component: component
          };
        mugshotsAndComponents.push({
          component: component,
          mugshot: componentMugshot
        });
      }
    }
    return mugshotsAndComponents;
  },
  _applyFilterSet: function(mugshot, allMugshotsAndComponents, arrayAttributes) {
    var temp;
    for (var i = 0; i < arrayAttributes.length; i++) {
      var attribute = arrayAttributes[i];
      temp = this._applyFilter(mugshot, allMugshotsAndComponents, attribute);
      if (temp.length === 1) {
        if (this._debug)
          console.log('high probability - found exactly 1 matching component for attribute ' + attribute);
        return {
          success: true,
          decision: attribute,
          component: temp[0].component
        };
      } else if (temp.length > 1) {
        if (this._debug)
          console.log('Found more than 1 matching component for attribute ' + attribute + ', keep filtering down on the following mugshots\n' + this._getFilteredMugshots(temp));
        allMugshotsAndComponents = temp;
      } else {
        if (this._debug)
          console.log('Nothing matched for attribute ' + attribute);
      }
    }
    return {
      success: false,
      component: allMugshotsAndComponents
    };
  },
  _applyFilter: function(mugshot, filteredMugshotsAndComponents, attributeToFilter) {
    var componentsMatchingAttribute = [];
    if (typeof mugshot[attributeToFilter] !== 'undefined' && mugshot[attributeToFilter] !== "") {
      for (var j = 0; j < filteredMugshotsAndComponents.length; j += 1) {
        var componentMugshot = filteredMugshotsAndComponents[j].mugshot;
        if (typeof componentMugshot[attributeToFilter] !== 'undefined' && componentMugshot[attributeToFilter] === mugshot[attributeToFilter])
          componentsMatchingAttribute.push(filteredMugshotsAndComponents[j]);
      }
    }
    return componentsMatchingAttribute;
  },
  _checkIndex: function(mugshot, filteredMugshotsAndComponents, allMugshotsAndComponents) {
    if (filteredMugshotsAndComponents.length < allMugshotsAndComponents.length) {
      var indexAttributes = ['index', 'duplicate-mugshot-index'];
      var componentsByIndex = this._applyFilterSet(mugshot, filteredMugshotsAndComponents, indexAttributes);
      if (componentsByIndex.success)
        return {
          success: true,
          decision: 'index',
          component: componentsByIndex.component,
          probability: 'high'
        };
      return {
        success: true,
        decision: 'index',
        component: componentsByIndex.component[0].component,
        probability: 'low'
      };
    }
    return {
      success: false,
      msg_key: "component_not_found",
      decision: "component_not_found",
      component: null
    };
  },
  _getFilteredMugshots: function(filteredMugshotsAndComponents) {
    var numLogs = filteredMugshotsAndComponents.length < 10 ? filteredMugshotsAndComponents.length : 10;
    var tempMugshotList = [];
    for (var i = 0; i < numLogs; i++)
      tempMugshotList.push(JSON.stringify(filteredMugshotsAndComponents[i].mugshot));
    return tempMugshotList.toString();
  },
  _isSettable: function(methods) {
    if (methods && methods.indexOf('setValue') !== -1)
      return true;
    return false;
  },
  _isSNATFDataType: function(snATFDataType) {
    if (snATFDataType && !this._isSNATFClass(snATFDataType))
      return true;
    return false;
  },
  _isSNATFClass: function(snATFClass) {
    if (snATFClass && snATFClass.length > 0)
      return true;
    return false;
  },
  _isSelect: function(mugshotTag) {
    return mugshotTag === 'select';
  },
  _isSettableText: function(mugshotTag, mugshotType) {
    if (mugshotTag === 'textarea')
      return true;
    if (mugshotTag === 'input' && mugshotType == 'text')
      return true;
    var hasNoType = typeof mugshotType === 'undefined' || mugshotType === "" || mugshotType === null;
    if (mugshotTag === 'input' && hasNoType)
      return true;
    return false;
  }
});;
/*! RESOURCE: /scripts/glideautomate/GlideAutomateDragAndDrop.js */
"use strict";
var GlideAutomateDragAndDrop = Class.create(GlideAutomatePageCrawler, {
  initialize: function($super, shouldTrimComponents, debug) {
    $super(shouldTrimComponents, debug);
  },
  getComponentFromElement: function(element) {
    var elementsToHighlight = [];
    if (!this.components)
      this.components = this._getComponents();
    var elemFromLabel = this._getElemFromLabel(element);
    if (elemFromLabel !== null)
      element = elemFromLabel;
    this._addLabels(element, elementsToHighlight);
    var isRadio = this._isRadio(element);
    for (var i = 0; i < this.components.length; i += 1) {
      var component = this.components[i];
      if (isRadio && elementsToHighlight.indexOf(component.element) > -1) {
        component.elementsToHighlight = elementsToHighlight;
        return component;
      }
      if (component.element === element) {
        elementsToHighlight.push(component.element);
        component.elementsToHighlight = elementsToHighlight;
        return component;
      }
    }
    return null;
  },
  resetDragAndDrop: function() {
    this.components = this._getComponents();
  },
  _getComponents: function() {
    var allComponents = this.getPageComponents();
    var components = [];
    for (var i = 0; i < allComponents.length; i += 1) {
      var component = allComponents[i];
      if (component.getComponentInfo() != null)
        components.push(component);
    }
    return components;
  },
  _getElemFromLabel: function(element) {
    if (!element)
      return null;
    if (element.tagName.toLowerCase() !== "label")
      return null;
    var forAttr = element.getAttribute("for");
    if (!forAttr)
      return null;
    var labelForElem = element.ownerDocument.getElementById(forAttr);
    if (!labelForElem)
      return null;
    if (labelForElem.tagName.toLowerCase() !== "input")
      return null;
    if (labelForElem.type !== "radio" && labelForElem.type !== "checkbox")
      return null;
    return labelForElem;
  },
  _addLabels: function(element, elementsToHighlight) {
    if (this._isRadio(element)) {
      var radioNodeList = RadioSettableComponent.getValidRadioElements(element);
      for (var i = 0; i < radioNodeList.length; i += 1) {
        var radioElem = radioNodeList[i];
        elementsToHighlight.push(radioElem);
        var radioLabel = GlideAutomateUtil.getLabelDomElementFor(radioElem);
        if (radioLabel)
          elementsToHighlight.push(radioLabel);
      }
    } else if (this._isCheckbox(element)) {
      var checkboxLabel = GlideAutomateUtil.getLabelDomElementFor(element);
      if (checkboxLabel)
        elementsToHighlight.push(checkboxLabel)
    }
  },
  _isRadio: function(element) {
    if (!this._isInput(element))
      return false;
    if (element.type !== "radio")
      return false;
    return true;
  },
  _isCheckbox: function(element) {
    if (!this._isInput(element))
      return false;
    if (element.type !== "checkbox")
      return false;
    return true;
  },
  _isInput: function(element) {
    if (!element)
      return false;
    if (element.tagName.toLowerCase() !== "input")
      return false;
    return true;
  },
});;
/*! RESOURCE: /scripts/glideautomate/GlideAutomate.js */
(function() {
  "use strict";
  if (window.top.g_automate)
    return;
  var GlideAutomate = Class.create({
    SETTABLE_ELEMENTS: ['input', 'textarea', 'select'],
    initialize: function() {
      this.glideAutomateWait = new GlideAutomateWait();
    },
    _shouldTrimComponents: true,
    _debug: false,
    getPageURL: function() {
      return new GlideAutomatePageCrawler(this._shouldTrimComponents, this._debug).getPageURL();
    },
    getValue: function(componentLocator) {
      return this.call(componentLocator, "getValue");
    },
    setValue: function(componentLocator, value) {
      return this.call(componentLocator, "setValue", value);
    },
    click: function(componentLocator) {
      return this.call(componentLocator, "click");
    },
    isDisabled: function(componentLocator) {
      return this.call(componentLocator, "isDisabled");
    },
    scrollIntoView: function(componentLocator) {
      return this.call(componentLocator, "scrollIntoView");
    },
    findComponent: function(componentLocator) {
      return this.call(componentLocator, "componentFinder");
    },
    getComponentFromElement: function(element) {
      this._initializeDragAndDrop();
      return this.dragAndDrop.getComponentFromElement(element);
    },
    resetDragAndDrop: function() {
      this._initializeDragAndDrop();
      this.dragAndDrop.resetDragAndDrop();
    },
    setTrimComponents: function(value) {
      this._shouldTrimComponents = value;
    },
    shouldTrimComponents: function() {
      return this._shouldTrimComponents;
    },
    setDebug: function(value) {
      this._debug = value;
    },
    isDebug: function() {
      return this._debug;
    },
    call: function(componentLocator, methodName) {
      var result = new GlideAutomateComponentFinder().findComponent(componentLocator);
      if (!result.component)
        return result;
      switch (methodName) {
        case "componentFinder":
          return result;
        case "getValue":
          return result.component.getValue();
        case "setValue":
          var svr = result.component.setValue(arguments[2]);
          result.component.afterSetValue();
          return svr;
        case "click":
          return result.component.click();
        case "isDisabled":
          return result.component.isDisabled();
        case "scrollIntoView":
          return result.component.scrollIntoView();
        default:
          return {
            success: false,
            msg_key: "method_not_supported"
          };
      }
    },
    getPageInfo: function() {
      var pageInfo = [];
      var components = new GlideAutomatePageCrawler(this._shouldTrimComponents, this._debug).getPageComponents();
      for (var i = 0; i < components.length; i += 1) {
        var component = components[i];
        var componentInfo = component.getComponentInfo();
        if (componentInfo != null)
          pageInfo.push(componentInfo);
      }
      return pageInfo;
    },
    pageHasText: function(expectedText) {
      return new GlideAutomatePageCrawler(false).pageHasText(expectedText);
    },
    getPageFrame: function() {
      if (!top.document.getElementById('gsft_main')) {
        if (top.document.getElementById('testFrame')) {
          return top.document.getElementById('testFrame');
        } else {
          return null;
        }
      } else if (top.document.getElementById('gsft_main').contentWindow.document.getElementById('testFrame')) {
        return top.document.getElementById('gsft_main').contentWindow.document.getElementById('testFrame');
      } else {
        return top.document.getElementById('gsft_main');
      }
    },
    getPageWindow: function() {
      if (!top.document.getElementById('gsft_main')) {
        if (top.document.getElementById('testFrame')) {
          return top.document.getElementById('testFrame').contentWindow;
        } else {
          return top;
        }
      } else if (top.document.getElementById('gsft_main').contentWindow.document.getElementById('testFrame')) {
        return top.document.getElementById('gsft_main').contentWindow.document.getElementById('testFrame').contentWindow;
      } else {
        return top.document.getElementById('gsft_main').contentWindow;
      }
    },
    getPageDocument: function() {
      if (!top.document.getElementById('gsft_main')) {
        if (top.document.getElementById('testFrame')) {
          return top.document.getElementById('testFrame').contentWindow.document;
        } else {
          return top.document;
        }
      } else if (top.document.getElementById('gsft_main').contentWindow.document.getElementById('testFrame')) {
        return top.document.getElementById('gsft_main').contentWindow.document.getElementById('testFrame').contentWindow.document;
      } else {
        return top.document.getElementById('gsft_main').contentWindow.document;
      }
    },
    startToWaitMomentOfCalm: function(callOnSuccess, callOnFailure, waitingTimeLimitSecPar) {
      this.glideAutomateWait.startToWaitMomentOfCalm(callOnSuccess, callOnFailure, waitingTimeLimitSecPar);
    },
    _initializeDragAndDrop: function() {
      if (!this.dragAndDrop)
        this.dragAndDrop = new GlideAutomateDragAndDrop(this._shouldTrimComponents, this._debug);
    },
  });
  window.top.g_automate = new GlideAutomate();
})();;
/*! RESOURCE: /scripts/glideautomate/GlideAutomateUtil.js */
var GlideAutomateUtil = Class.create({});
GlideAutomateUtil.escape = function(value) {
  if (typeof value === 'string')
    return value.replace(/[\=\!\,\:\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  return value;
};
GlideAutomateUtil.getLabelDomElementFor = function(domElement) {
  var labelDomEl = null;
  try {
    labelDomEl =
      domElement.ownerDocument.querySelector('label[for=\"' + GlideAutomateUtil.escape(domElement.id) + '\"]');
  } catch (err) {
    console.log("Failed to find label for input by id. Input's ID = " + domElement.id);
    console.log(err);
  }
  return labelDomEl;
};;;;