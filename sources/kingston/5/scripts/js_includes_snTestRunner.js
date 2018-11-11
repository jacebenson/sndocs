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
/*! RESOURCE: /scripts/app.snTestRunner/_snTestRunner.js */
angular.module('sn.testRunner', ['sn.base', 'sn.common'])
  .config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);;
/*! RESOURCE: /scripts/app.snTestRunner/controller.snTestRunner.js */
angular
  .module('sn.testRunner')
  .controller('TestRunner', TestRunner);
TestRunner.$inject = ['$rootScope', '$scope', '$element', '$interval', '$timeout', '$q', '$document', '$window', '$httpParamSerializer', 'StepConfig', 'TestInformation', 'ATFConnectionService', 'ImpersonationHandler', 'ScreenshotsModeManager', 'snNotification', 'ReportUITestProgressHandler'];

function TestRunner($rootScope, $scope, $element, $interval, $timeout, $q, $document, $window, $httpParamSerializer, stepConfig, testInformation, atfConnectionService, impersonationHandler, screenshotsModeManager, snNotification, reportUITestProgressHandler) {
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
  self.MESSAGE_KEY_JAVASCRIPT_ERROR = "This step failed because a client-side Javascript error was detected on the page being tested. See the logs and screenshots on the test result for details.";
  self.MESSAGE_KEY_RUNNING_STEP = "Running step {0} of {1} for {2}";
  self.MESSAGE_KEY_ERROR_IN_UNIMPERSONATION = "Error during unimpersonation! Any further action will be done as user: {0}";
  self.MESSAGE_KEY_ERROR_IN_REPORT_BATCH_RESULT = "Failed to report client batch progress. Test will time out.";
  self.MESSAGE_KEY_FOUND_TEST_TO_RUN = "Found a scheduled test to run";
  self.MESSAGE_KEY_EXECUTING_TEST = "Executing test...";
  self.MESSAGE_KEY_ERROR_DETAIL = "Error detail: {0}";
  self.MESSAGE_KEY_STEP_EXEC_FAILED = "Step execution failed with error ";
  self.MESSAGE_KEY_CONFIRM_EXIT = "A test is currently running. Leaving this page will cause the test to time out.";
  self.MESSAGE_KEY_INVALID_REFERENCE = "This step's '{0}' field is assigned an output value from a step that no longer exists. To fix this problem, edit this step and replace the value for the '{0}' field with a valid value.";
  self.MESSAGE_KEY_REGISTER_RUNNER_ERROR = "An error occurred registering the test runner with the server";
  self.MESSAGE_KEY_ATF_AGENT_DELETED = "Client test runner deleted. Reload page to activate this test runner.";
  self.MESSAGE_KEY_USER_LOGGED_OUT = "Client test runner session has changed because the user logged out. Reload page to activate this test runner.";
  self.MESSAGE_KEY_CONFIRM_SCHEDULE_SETUP = "Are you sure you want to configure this test runner to only run scheduled tests and suites? It will no longer be available to execute any tests or suites that are started manually.";
  self.MESSAGE_KEY_CONFIRM_SCHEDULE_TEARDOWN = "Are you sure you want to configure this test runner to only run manually-started tests and suites? It will no longer be available to run scheduled tests or suites.";
  self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING = "Unable to toggle scheduled test preferences when a test is currently in progress. Try again when a test is not running.";
  self.MESSAGE_KEY_SCHEDULE_SETUP_FAILED = "Failed to configure this page to run scheduled tests. Refresh the page and try again.";
  self.MESSAGE_KEY_MANUAL_SETUP_FAILED = "Failed to configure this page to run manual tests. Refresh the page and try again.";
  self.MESSAGE_KEY_SCHED_RUN_SCHEDULED_TESTS_ONLY = "Run Scheduled Tests Only";
  self.MESSAGE_KEY_SCHED_RUN_MANUAL_TESTS_ONLY = "Run Manual Tests Only";
  self.MESSAGE_KEY_EXECUTION_FRAME = "Execution Frame";
  self.messageMap = new GwtMessage().getMessages([self.MESSAGE_KEY_WAITING_FOR_TEST, self.MESSAGE_KEY_AN_ERROR_OCCURRED,
    self.MESSAGE_KEY_ERROR, self.MESSAGE_KEY_WAITING, self.MESSAGE_KEY_LOADING, self.MESSAGE_KEY_FAILED_WITH_ERROR,
    self.MESSAGE_KEY_FAIL_USER_EMPTY, self.MESSAGE_KEY_CANCEL_REQUEST_RECEIVED, self.MESSAGE_KEY_UNEXPECTED_ERROR,
    self.MESSAGE_KEY_FINISHED_REPORTING_RESULT, self.MESSAGE_KEY_REQUEST_SUCCESSFUL, self.MESSAGE_KEY_ERROR_RELOAD_PAGE,
    self.MESSAGE_KEY_FAIL_WRONG_VIEW, self.MESSAGE_KEY_FAIL_WRONG_FORM, self.MESSAGE_KEY_STEP_EXEC_FAILED,
    self.MESSAGE_KEY_FAIL_INVALID_FORM, self.MESSAGE_KEY_FAIL_WRONG_CATALOG_ITEM, self.MESSAGE_KEY_FAIL_INVALID_ACCESS_CATALOG_ITEM, self.MESSAGE_KEY_FAILED_REPORT_PROGRESS, self.MESSAGE_KEY_TEST_CANCELED,
    self.MESSAGE_KEY_TAKING_SCREENSHOT, self.MESSAGE_KEY_NOT_TAKING_SCREENSHOT, self.MESSAGE_KEY_JAVASCRIPT_ERROR,
    self.MESSAGE_KEY_RUNNING_STEP, self.MESSAGE_KEY_ERROR_IN_UNIMPERSONATION, self.MESSAGE_KEY_ERROR_IN_REPORT_BATCH_RESULT,
    self.MESSAGE_KEY_FOUND_TEST_TO_RUN, self.MESSAGE_KEY_EXECUTING_TEST, self.MESSAGE_KEY_ERROR_DETAIL, self.MESSAGE_KEY_CONFIRM_EXIT,
    self.MESSAGE_KEY_INVALID_REFERENCE, self.MESSAGE_KEY_REGISTER_RUNNER_ERROR, self.MESSAGE_KEY_ATF_AGENT_DELETED,
    self.MESSAGE_KEY_CONFIRM_SCHEDULE_SETUP, self.MESSAGE_KEY_CONFIRM_SCHEDULE_TEARDOWN, self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING,
    self.MESSAGE_KEY_SCHEDULE_SETUP_FAILED, self.MESSAGE_KEY_MANUAL_SETUP_FAILED, self.MESSAGE_KEY_USER_LOGGED_OUT,
    self.MESSAGE_KEY_SCHED_RUN_SCHEDULED_TESTS_ONLY, self.MESSAGE_KEY_SCHED_RUN_MANUAL_TESTS_ONLY, self.MESSAGE_KEY_EXECUTION_FRAME
  ]);
  self.messageReference = "";
  self.delayBetweenSteps = 10;
  self.isDebugEnabled = false;
  self.screenshotsQuality = 25;
  self.heartbeatInterval = 60 * 1000;
  self.findTestInterval = 5 * 1000;
  self.isSchedulePluginActive = false;
  self.runScheduledTestsOnly = false;
  self.lockDownScreenshotModesWhileRunningTest = false;
  self.stepConfigs = {};
  self.AMBChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
  self.AMBStepConfigChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBStepConfigMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
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
  self.batchPercentComplete = 0;
  self.unimpersonationFailed = false;
  self.showPreferences = false;
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
  self._runStep = _runStep;
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
  self._setupTestInformation = _setupTestInformation;
  self.setupHeartbeat = setUpHeartbeat;
  self.sendHeartbeat = sendHeartbeat;
  self.handleBatchProcessException = handleBatchProcessException;
  self.logAndNotifyExceptionAsHeaderMessage = logAndNotifyExceptionAsHeaderMessage;
  self.onAMBMessageReceived = onAMBMessageReceived;
  self.onAMBMessageReceivedConfig = onAMBMessageReceivedConfig;
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
      self.original_user_id = g_user.userID;
      self.setupUserInfo()
        .then(self._registerRunner)
        .then(self.stepConfig.getActiveConfigs)
        .then(self._setupStepConfigs)
        .then(self.setupHeartbeat)
        .then(self._setupScheduledTests)
        .then(self._findTestToRunByRunnerType)['catch'](self.reportSetupError);
    } catch (e) {
      console.log(e.message);
      self.reportSetupError();
    }
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
    if (self.isDebugEnabled) {
      $scope.$on("TestInformation.AMBMessageReceivedDebug", self.debugOnAMBMessageReceived);
      $scope.$on("TestInformation.AMBMessageReceivedConfigDebug", self.debugOnAMBMessageReceivedConfig);
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
      var ga = new GlideAjax("ClientTestRunnerAjax");
      ga.addParam("sysparm_name", "makeTestRunnerOffline");
      ga.addParam("sysparm_atf_agent_id", self.atfAgentSysId);
      ga.addParam("sysparm_status_reason", "Closed/Navigated away");
      ga.setErrorCallback(setupTestRunnerOnExitErrorCallback.bind(self));
      ga.getXMLWait();
    }
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
    }
  };
  var StepEvent = Class.create();
  StepEvent.prototype = {
    initialize: function() {
      this.object = null;
      this.type = null;
      this.start_time = null;
      this.end_time = null;
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
    var lastStepBatchResult = JSON.stringify(self.currentStepBatchResult);
    return reportUITestProgressHandler.reportUIBatchResult(
      lastStepBatchResult,
      self.currentStepBatchResult.sys_atf_test_result_sys_id,
      self.currentStepBatch.tracker_sys_id,
      self.atfAgentSysId);
  }

  function handleReportBatchResultException(e) {
    self.logAndNotifyExceptionAsHeaderMessage(self.messageMap[self.MESSAGE_KEY_ERROR_IN_REPORT_BATCH_RESULT], e);
    if (self.currentStepBatchResult)
      self.currentStepBatchResult.setError();
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
        if (self.currentStepBatchResult && arguments[0]) {
          var errorStartTime = self._getFormattedUTCNowDateTime();
          var errorEndTime = self._getFormattedUTCNowDateTime();
          var stepEvent = new StepEvent();
          stepEvent.object = arguments[0].toString();
          self.atflog(arguments[0].toString());
          stepEvent.type = "client_error";
          stepEvent.status = "failure";
          stepEvent.start_time = errorStartTime;
          stepEvent.end_time = errorEndTime;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
          self.hasConsoleError = true;
        }
      };
    }());
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
        return self.processStep(batch, currentStep);
      });
    }, firstPromise);
    return stepPromiseChain;
  }

  function processStep(batch, step) {
    self.setTestHeaderMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_RUNNING_STEP], step._ui_step_index,
      batch.sys_atf_steps.length, batch.test_name));
    return $q.when()
      .then(function doRunStep() {
        return self._runStep(step);
      })['catch'](self.handleStepRunException)['finally'](self.saveStepResultAndCheckStepFailure)['finally'](self.takeScreenshot)['finally'](function runReportStepProgress() {
        return self.reportStepProgress(batch, step);
      })
      .then(self.pauseBetweenSteps);
  }

  function _runStep(step) {
    var stepResult = new StepResult();
    stepResult.sys_atf_step_sys_id = step.sys_id;
    self.currentStepResult = stepResult;
    var assertDefer = $q.defer();
    step.defer = assertDefer;
    step.test_result_id = self.currentStepBatchResult.sys_atf_test_result_sys_id;
    var stepConfig = self.stepConfigs[step.step_config_sys_id];
    self.assertionFunction = new Function("step", "stepResult", stepConfig.step_execution_generator);
    if (self.atfFormInterceptor) {
      var testIFrameWindow = self._getFrameWindow();
      self.atfFormInterceptor.interceptGFormWithRollbackContextId(testIFrameWindow);
      self.atfFormInterceptor.interceptGFormWithStepIdAndTestResultId(self.currentStepResult.sys_atf_step_sys_id, self.currentStepBatchResult.sys_atf_test_result_sys_id, testIFrameWindow);
      self.atfFormInterceptor.interceptXMLHttpRequestWithStepIdandTestResultId(self.currentStepResult.sys_atf_step_sys_id, self.currentStepBatchResult.sys_atf_test_result_sys_id, testIFrameWindow, self.isDebugEnabled);
    }
    self.currentStepResult.start_time = self._getFormattedUTCNowDateTime();
    step = self.resolveInputs(step);
    if (!self.validateInputs(step))
      return $q.reject();
    self.assertionFunction(step, self.currentStepResult);
    return assertDefer.promise;
  }

  function resolveInputs(step) {
    for (var key in step.inputs) {
      if (typeof step.inputs[key] == 'string' && step.inputs[key].indexOf("{{step['") > -1) {
        var testExecutorAjax = new GlideAjax('TestExecutorAjax');
        testExecutorAjax.addParam('sysparm_name', 'resolveInputs');
        testExecutorAjax.addParam('sysparm_atf_test_result', self.currentStepBatchResult.sys_atf_test_result_sys_id);
        testExecutorAjax.addParam('sysparm_atf_step_id', step.sys_id);
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
      self.currentStepResult.message = self.messageMap[self.MESSAGE_KEY_JAVASCRIPT_ERROR];
    }
    self.currentStepResult.end_time = self._getFormattedUTCNowDateTime();
    self.currentStepBatchResult.stepResults.push(self.currentStepResult);
    var stepEvent = new StepEvent();
    stepEvent.type = "step_completion";
    stepEvent.start_time = self.currentStepResult.start_time;
    stepEvent.end_time = self.currentStepResult.end_time;
    self.currentStepBatchResult.stepEvents.push(stepEvent);
    if (self.currentStepResult.success) {
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

    function afterScreenshotTaken() {
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
      var ha = new GlideScreenshot();
      ha.generateAndAttach(testFrameDoc.body, "sys_atf_test_result", self.currentStepBatchResult.sys_atf_test_result_sys_id,
        self._getFileNameNoExtension(), self.screenshotsQuality, afterScreenshotTaken);
    } catch (e) {
      console.log("An error occurred while trying to take a screenshot: " + e.message);
      ssDefer.resolve();
    }
    return ssDefer.promise;
  }

  function reportStepProgress(batch, step) {
    self.batchPercentComplete = (step._ui_step_index / self.numberOfStepsInBatch) * 100;
    var reportStepProgressDefer = $q.defer();
    var reportProgressAjax = new GlideAjax('ReportUITestProgress');
    reportProgressAjax.addParam('sysparm_name', 'reportStepProgress');
    reportProgressAjax.addParam('sysparm_batch_execution_tracker_sys_id', batch.tracker_sys_id);
    reportProgressAjax.addParam('sysparm_next_step_index', step._ui_step_index + 1);
    reportProgressAjax.addParam('sysparm_batch_length', batch.sys_atf_steps.length);
    reportProgressAjax.addParam('sysparm_test_result_sys_id', self.currentStepBatchResult.sys_atf_test_result_sys_id);
    reportProgressAjax.addParam('sysparm_step_result', JSON.stringify(self.currentStepResult));
    reportProgressAjax.addParam('sysparm_atf_agent_sys_id', self.atfAgentSysId);
    reportProgressAjax.getXMLAnswer(handleReportStepProgress);
    self.assertionFunction = null;
    self.currentStep = null;

    function handleReportStepProgress(answer) {
      var answerObj = JSON.parse(answer);
      if (answerObj.cancel_request_received) {
        self.currentStepBatchResult.setCancel();
        reportStepProgressDefer.reject(self.messageMap[self.MESSAGE_KEY_TEST_CANCELED]);
      } else if (!answerObj.report_step_progress_success) {
        self.currentStepBatchResult.setError();
        reportStepProgressDefer.reject(self.messageMap[self.MESSAGE_KEY_FAILED_REPORT_PROGRESS]);
      } else
        reportStepProgressDefer.resolve();
    }
    return reportStepProgressDefer.promise;
  }

  function pauseBetweenSteps() {
    return $timeout(function() {
      self.atflog("Delay between steps completed. Continuing...");
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
    if (typeof lock_screenshot_modes_while_running_test != 'undefined')
      self.lockDownScreenshotModesWhileRunningTest = lock_screenshot_modes_while_running_test;
    self.atflog("testRunner.lockDownScreenshotModesWhileRunningTest: " + self.lockDownScreenshotModesWhileRunningTest);
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
    self._impersonateAjax.setErrorCallback(self._errorCallbackImpersonate.bind(self), null, [impersonatingUser, stepEvent, impersonateDefer]);
    self._impersonateAjax.getXMLAnswer(self._impersonateResponse200.bind(self), null, [impersonatingUser, stepEvent, impersonateDefer]);
    return impersonateDefer.promise;
  }

  function unimpersonate(executingUser, stepEvent) {
    if (!executingUser || !executingUser.user_sys_id)
      return $q.when();
    var unimpersonateDefer = $q.defer();
    self._unImpersonateAjax = new GlideAjax('TestExecutorAjax');
    self._unImpersonateAjax.addParam('sysparm_name', 'unimpersonate');
    self._unImpersonateAjax.setErrorCallback(self._errorCallbackUnimpersonate.bind(self), null, [executingUser, stepEvent, unimpersonateDefer]);
    self._unImpersonateAjax.getXMLAnswer(self._unimpersonateResponse200.bind(self), null, [executingUser, stepEvent, unimpersonateDefer]);
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
      self._impersonateAjax.getXMLAnswer(self._impersonateResponse200.bind(self), null, [impersonatingUser, stepEvent, impersonateDefer]);
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
      self._unImpersonateAjax.getXMLAnswer(self._unimpersonateResponse200.bind(self), null, [executingUser, stepEvent, unimpersonateDefer]);
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
    reportUIBatchResult: reportUIBatchResult,
    _reportBatchResultAjax: null,
    _errorCallbackReportBatchResult: _errorCallbackReportBatchResult,
    _handleReportBatchResultResponse200: _handleReportBatchResultResponse200,
    _resetReportBatchResultRetries: _resetReportBatchResultRetries,
    _MAX_RETRIES: 5,
    _reportBatchResultErrorRetries: 0
  };
  return self;

  function reportUIBatchResult(stringifiedTestResults, testResultSysId, trackerSysId, atfAgentSysId) {
    var reportDefer = $q.defer();
    self._reportBatchResultAjax = new GlideAjax('ReportUITestProgress');
    self._reportBatchResultAjax.addParam('sysparm_name', 'reportBatchResult');
    self._reportBatchResultAjax.addParam('sysparm_test_result', stringifiedTestResults);
    self._reportBatchResultAjax.addParam('sysparm_test_result_sys_id', testResultSysId);
    self._reportBatchResultAjax.addParam('sysparm_batch_tracker_sys_id', trackerSysId);
    self._reportBatchResultAjax.addParam('sysparm_atf_agent_sys_id', atfAgentSysId);
    self._reportBatchResultAjax.setErrorCallback(self._errorCallbackReportBatchResult.bind(self), null, [reportDefer]);
    self._reportBatchResultAjax.getXMLAnswer(self._handleReportBatchResultResponse200.bind(self), null, [reportDefer]);
    return reportDefer.promise;
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
        self._reportBatchResultAjax.getXMLAnswer(self._handleReportBatchResultResponse200.bind(self), null, [reportDefer]);
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
    else
      jslog(formatMessage("ReportUITestProgress: invalid response, http status {0}, response: {1}", response.status, response));
    reportDefer.resolve();
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
angular.module("sn.testRunner").service("ATFConnectionService", ['$window', '$q', '$log', '$rootScope', '$timeout', 'ConnectionStatusHelper',
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
    this._onMessageReceivedConfig = function() {
      if (!ATFCommon.isFunction(this._customMessageReceivedConfigCallback))
        return;
      this._customMessageReceivedConfigCallback();
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
    this.setMessageReceivedATFAgentCallback = function(theFunction) {
      if (ATFCommon.isFunction(theFunction))
        this._customMessageReceivedATFAgentCallback = theFunction;
    };
    this._onMessageReceivedConfigDebug = function(messageData) {
      if (!ATFCommon.isFunction(this._customMessageReceivedConfigDebugCallback))
        return;
      this._customMessageReceivedConfigDebugCallback(messageData);
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
    this._AMBMessageReceivedConfigDebugCallback = function(messageData) {
      $rootScope.$broadcast("TestInformation.AMBMessageReceivedConfigDebug", messageData);
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
/*! RESOURCE: /scripts/app.snTestRunner/GlideScreenshot.js */
'use strict';
var GlideScreenshot = Class.create({
  TARGET_CANVAS_ID: "glideScreenshotCanvas",
  FILE_EXTENSION: ".jpg",
  generateAndAttach: function(domElement, tableName, sysId, fileName, screenshotsQuality, callback) {
    var self = this;
    this.generate(domElement, function onGenerateComplete() {
      if (ATFCommon.isFunction(callback))
        callback();
      self.attach(tableName, sysId, fileName, screenshotsQuality);
    });
  },
  generate: function(domElement, onGenerationCompleteCallback) {
    if (!this._isThirdPartyLibraryLoaded())
      return;
    var targetCanvas = document.getElementById(this.TARGET_CANVAS_ID);
    if (targetCanvas && targetCanvas != null)
      targetCanvas.parentElement.removeChild(targetCanvas);
    var self = this;
    try {
      html2canvas(domElement).then(function(canvas) {
        canvas.id = self.TARGET_CANVAS_ID;
        canvas.style.display = "none";
        document.body.appendChild(canvas);
        if (ATFCommon.isFunction(onGenerationCompleteCallback))
          onGenerationCompleteCallback();
      });
    } catch (e) {
      console.log("Error occurred while generating screenshot: " + e.message);
    }
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
  interval: function() {
    return this._getAngularInjector("$interval");
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
  setTestIFrameOnloadFunction: function(func) {
    this.getAngularScope().setiFrameOnloadFunction(func);
  },
  clearTestIFrameOnloadFunction: function() {
    this.getAngularScope().cleariFrameOnloadFunction = null;
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
  openCatalogItem: function(catItemId) {
    return this.getAngularScope().openCatalogItem(catItemId);
  },
  overwriteFrameFunctions: function(currFramesLogFunc) {
    return this.getAngularScope().overwriteFrameFunctions(currFramesLogFunc);
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
  interceptGFormWithRollbackContextId: function(testIFrameWindow) {
    if (testIFrameWindow.g_form &&
      testIFrameWindow.g_form.getParameter(ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID) === '') {
      var inputTag = testIFrameWindow.document.createElement('input');
      inputTag.setAttribute("type", "hidden");
      inputTag.setAttribute("name", ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID);
      inputTag.setAttribute("id", ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID);
      inputTag.setAttribute("value", this._rollbackContextId);
      var formEle = testIFrameWindow.g_form.getFormElement();
      if (formEle)
        formEle.appendChild(inputTag);
    }
  },
  interceptGFormWithStepIdAndTestResultId: function(sys_atf_step_sys_id, sys_atf_test_result_sys_id, testIFrameWindow) {
    if (testIFrameWindow.g_form) {
      if (testIFrameWindow.g_form.getParameter(ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID) === '') {
        var inputTagStep1 = testIFrameWindow.document.createElement('input');
        inputTagStep1.setAttribute("type", "hidden");
        inputTagStep1.setAttribute("name", ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID);
        inputTagStep1.setAttribute("id", ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID);
        inputTagStep1.setAttribute("value", sys_atf_step_sys_id);
        var formEle = testIFrameWindow.g_form.getFormElement();
        if (formEle)
          formEle.appendChild(inputTagStep1);
        var inputTagTest1 = testIFrameWindow.document.createElement('input');
        inputTagTest1.setAttribute("type", "hidden");
        inputTagTest1.setAttribute("name", ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID);
        inputTagTest1.setAttribute("id", ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID);
        inputTagTest1.setAttribute("value", sys_atf_test_result_sys_id);
        var formEle = testIFrameWindow.g_form.getFormElement();
        if (formEle)
          formEle.appendChild(inputTagTest1);
      } else {
        var inputTagStep = testIFrameWindow.document.getElementById(ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID);
        inputTagStep.setAttribute("value", sys_atf_step_sys_id);
        var inputTagTest = testIFrameWindow.document.getElementById(ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID);
        inputTagTest.setAttribute("value", sys_atf_test_result_sys_id);
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
                }
              return new e(j, i)
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
    }
  return e
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
        }
      for (b = 0, c = nd.length; c > b; b++)
        if (nd[b][1].exec(d)) {
          a._f += nd[b][0];
          break
        }
      d.match(Yc) && (a._f += "Z"), ta(a)
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
                }++f, ++n
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
});;