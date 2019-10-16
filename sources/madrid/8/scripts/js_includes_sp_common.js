/*! RESOURCE: /scripts/js_includes_sp_common.js */
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
      function n(n) {
        window.console && console.log(e + " " + n)
      }
      return {
        debug: function(e) {
          "debug" === o.default.logLevel && n("[DEBUG] " + e)
        },
        addInfoMessage: function(e) {
          n("[INFO] " + e)
        },
        addErrorMessage: function(e) {
          n("[ERROR] " + e)
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
      wsConnectTimeout: 1e4,
      overlayStyle: ""
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
        e.addListener("/meta/handshake", this, T), e.addListener("/meta/connect", this, I), e.addListener("/meta/subscribe", this, E), e.addListener("/meta/unsubscribe", this, E)
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
        y = new s.default(e, m),
        C = !1,
        _ = "glide.amb.session.logout.overlay.style";

      function T(e) {
        void 0 !== e.ext && null !== e.ext[_] && void 0 !== e.ext[_] && (o.default.overlayStyle = e.ext[_]), setTimeout(function() {
          e.successful && O()
        }, 0)
      }

      function x(n) {
        if (n in l) return l[n];
        var t = new a.default(e, n, C);
        return l[n] = t, t
      }

      function k(e) {
        delete l[e]
      }

      function E(n) {
        n.ext && (!1 === n.ext["glide.amb.active"] && m.disconnect(), void 0 !== n.ext["glide.amb.client.log.level"] && "" !== n.ext["glide.amb.client.log.level"] && (o.default.logLevel = n.ext["glide.amb.client.log.level"], e.setLogLevel(o.default.logLevel)))
      }

      function S() {
        for (var e in d.debug("Resubscribing to all!"), l) {
          var n = l[e];
          n && n.resubscribeToCometD()
        }
      }

      function L() {
        for (var e in d.debug("Unsubscribing from all!"), l) {
          var n = l[e];
          n && n.unsubscribeFromCometD()
        }
      }

      function I(e) {
        if (E(e), t) setTimeout(function() {
          n = !1, d.debug("Connection closed"), c = "closed", U(u.getEvents().CONNECTION_CLOSED)
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
                    f && (f = !1, d.debug("LOGGED_OUT event fire!"), L(), U(u.getEvents().SESSION_LOGGED_OUT), h && !v && m.loginShow());
                    break;
                  case "session.logged.in":
                    f || D();
                    break;
                  case "session.invalidated":
                  case null:
                    f && (f = !1, d.debug("INVALIDATED event fire!"), L(), U(u.getEvents().SESSION_INVALIDATED));
                    break;
                  default:
                    d.debug("unknown session status - " + t)
                }
              }
            }(e);
          var r = n;
          n = !0 === e.successful, !r && n ? N() : r && !n && (d.addErrorMessage("Connection broken"), c = "broken", w = !0, U(u.getEvents().CONNECTION_BROKEN))
        }
      }

      function O() {
        d.debug("Connection initialized"), C = !0, c = "initialized", U(u.getEvents().CONNECTION_INITIALIZED)
      }

      function N() {
        d.debug("Connection opened"), w ? m.getLastError() === m.getErrorMessages().UNKNOWN_CLIENT && (m.setLastError(null), M()) : y.initialize(R)
      }

      function R() {
        S(), c = "opened", U(u.getEvents().CONNECTION_OPENED)
      }

      function M() {
        var n = function() {
          d.debug("sending /amb_session_setup.do!");
          var n = new XMLHttpRequest;
          return n.open("GET", "/amb_session_setup.do", !0), n.setRequestHeader("Content-type", "application/json;charset=UTF-8"), n.setRequestHeader("X-UserToken", window.g_ck), n.setRequestHeader("X-CometD_SessionID", e.getClientId()), n
        }();
        n.onload = function() {
          200 === this.status && (w = !1, y.initialize(R))
        }, n.send()
      }

      function D() {
        f = !0, d.debug("LOGGED_IN event fire!"), S(), U(u.getEvents().SESSION_LOGGED_IN), m.loginHide()
      }

      function U(e) {
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
        L()
      }, m.resubscribeAll = function() {
        S()
      }, m.removeChannel = function(e) {
        k(e)
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
        return y
      }, m.getChannel = function(e) {
        return x(e)
      }, m.getChannels = function() {
        return l
      }, m.getState = function() {
        return c
      }, m.getLoginWindowOverlayStyle = function() {
        return o.default.overlayStyle
      }, m.loginShow = function() {
        d.debug("Show login window");
        var e = '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>',
          n = '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog" style="' + o.default.overlayStyle + '">\n\t\t\t\t<div class="modal-dialog small-modal" style="width:450px">\n\t\t\t\t   <div class="modal-content">\n\t\t\t\t\t  <header class="modal-header">\n\t\t\t\t\t\t <h4 id="small_modal1_title" class="modal-title">Login</h4>\n\t\t\t\t\t  </header>\n\t\t\t\t\t  <div class="modal-body">\n\t\t\t\t\t  </div>\n\t\t\t\t   </div>\n\t\t\t\t</div>\n\t\t\t</div>';
        try {
          var t = new GlideModal("amb_disconnect_modal");
          t.renderWithContent ? (t.template = n, t.renderWithContent(e)) : (t.setBody(e), t.render()), g = t
        } catch (e) {
          d.debug(e)
        }
      }, m.loginHide = function() {
        g && (g.destroy(), g = null)
      }, m.loginComplete = function() {
        D()
      }, m.subscribeToEvent = function(e, t) {
        return u.getEvents().CONNECTION_OPENED === e && n && t(), u.subscribe(e, t)
      }, m.unsubscribeFromEvent = function(e) {
        u.unsubscribe(e)
      }, m.isLoginWindowEnabled = function() {
        return h
      }, m.setLoginWindowEnabled = function(e) {
        h = e
      }, m.isLoginWindowOverride = function() {
        return v
      }, m._metaConnect = I, m._metaHandshake = T, m._sendSessionSetupRequest = M, m._onChannelRedirectSubscriptionComplete = R, m._getChannel = x, m._removeChannel = k, m._connectionInitialized = O, m._connectionOpened = N, m
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
          var i = "/sn/meta/channel_redirect/" + o.getClientId(),
            u = n.getChannel(i);
          t && u === t ? t.subscribeToCometD() : (t && n.removeChannel(t.getName()), t = u, new r.default(t, n, e).subscribe(a)), s.debug("ChannelRedirect initialized: " + i)
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
            y = 0,
            C = {},
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
              var n = C[e.channel];
              n && n[e.id] && (delete n[e.id], l._debug("Removed", e.listener ? "listener" : "subscription", e))
            }
          }

          function B(e) {
            e && !e.listener && q(e)
          }

          function j() {
            for (var e in C)
              if (C.hasOwnProperty(e)) {
                var n = C[e];
                if (n)
                  for (var t in n) n.hasOwnProperty(t) && B(n[t])
              }
          }

          function G(e) {
            h !== e && (l._debug("Status", h, "->", e), h = e)
          }

          function W() {
            return "disconnecting" === h || "disconnected" === h
          }

          function H() {
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
            var t = C[e];
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
                if (!W()) {
                  var e = {
                    id: H(),
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
            U(e) && (n = e, e = void 0), b = null, j(), W() && g.reset(!0), te({}), v = 0, w = !0, s = e, a = n;
            var i = l.getURL(),
              r = g.findTransportTypes("1.0", f, i),
              o = {
                id: H(),
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
            ae(e), J("/meta/handshake", e), J("/meta/unsuccessful", e), W() && (n.action = "none"), l.onTransportFailure.call(l, e, n, ce)
          }

          function de(e) {
            le(e, {
              cause: "failure",
              action: "handshake",
              transport: null
            })
          }

          function fe(e, n) {
            J("/meta/connect", e), J("/meta/unsuccessful", e), W() && (n.action = "none"), l.onTransportFailure.call(l, e, n, ce)
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
            var n = C[e.subscription];
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

          function ye(e) {
            ue(e) || (ae(e), J("/meta/publish", e), J("/meta/unsuccessful", e))
          }

          function Ce(e) {
            ye(e)
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
                    var o = W() ? "none" : k.reconnect || "retry";
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
                    var n = W() ? "none" : k.reconnect || "retry";
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
                  void 0 !== e.data ? ue(e) || (J(e.channel, e), N > 0 && 0 == --N && (l._debug("Processed last handshake-delivered message"), ne(0))) : void 0 === e.successful ? l._warn("Unknown Bayeux Message", e) : e.successful ? (ae(e), J("/meta/publish", e)) : ye(e)
                }(e)
            }
          }

          function Te(e) {
            var n = C[e];
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
            var o = ++y,
              s = {
                id: o,
                channel: e,
                scope: r.scope,
                callback: r.method,
                listener: i
              },
              a = C[e];
            return a || (a = {}, C[e] = a), a[o] = s, l._debug("Added", i ? "listener" : "subscription", s), s
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
                  Ce(o)
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
            if (!W()) {
              "boolean" != typeof e && (t = n, n = e, e = !1), U(n) && (t = n, n = void 0);
              var i = {
                  id: H(),
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
              0 !== v || W() || w || ee()
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
            C = {}
          }, this.subscribe = function(e, n, t, i, r) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: channel must be a string";
            if (W()) throw "Illegal state: disconnected";
            U(n) && (r = i, i = t, t = n, n = void 0), U(i) && (r = i, i = void 0);
            var o = !Te(e),
              s = ke(e, n, t, !1);
            if (o) {
              var a = {
                  id: H(),
                  channel: "/meta/subscribe",
                  subscription: e
                },
                u = this._mixin(!1, {}, i, a);
              l._putCallback(u.id, r), $(u)
            }
            return s
          }, this.unsubscribe = function(e, n, t) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (W()) throw "Illegal state: disconnected";
            U(n) && (t = n, n = void 0), this.removeListener(e);
            var i = e.channel;
            if (!Te(i)) {
              var r = {
                  id: H(),
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
            if (W()) throw "Illegal state: disconnected";
            U(n) ? (i = n, n = {}, t = void 0) : U(t) && (i = t, t = void 0);
            var r = {
                id: H(),
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
            if (W()) throw "Illegal state: disconnected";
            if (U(t) ? (o = t, t = {}, i = R.maxNetworkDelay, r = void 0) : U(i) ? (o = i, i = R.maxNetworkDelay, r = void 0) : U(r) && (o = r, r = void 0), "number" != typeof i) throw "Illegal argument type: timeout must be a number";
            n.match(/^\//) || (n = "/" + n);
            var s = "/service" + n,
              a = {
                id: H(),
                channel: s,
                data: t
              },
              u = this._mixin(!1, {}, r, a),
              c = {
                callback: o
              };
            i > 0 && (c.timeout = e.setTimeout(l, function() {
              l._debug("Timing out remote call", u, "after", i, "ms"), ye({
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
          }, this.isDisconnected = W, this.setBackoffIncrement = function(e) {
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

    function s(e) {
      return e.MSInputMethodContext && e.document.documentMode
    }

    function a(e, n) {
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
          if (!s(e))
            for (; e !== e.parent && !e.g_ambClient;) e = e.parent;
          if (e.g_ambClient) return e.g_ambClient
        } catch (e) {
          console.log("AMB getClient() tried to access parent from an iFrame. Caught error: " + e)
        }
        return null
      }(window);
      e || function(e) {
        var n = window.self;
        n.g_ambClient = e, n.addEventListener("unload", function() {
          n.g_ambClient.disconnect()
        }), "complete" === (n.document ? n.document.readyState : null) ? i() : n.addEventListener("load", i), setTimeout(i, 1e4);
        var t = !1;

        function i() {
          t || (t = !0, n.g_ambClient.connect())
        }
      }(e = a(function(e) {
        return n = new o.default, t = function() {
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
        }(), i = n.getServerConnection(), e && i.setLoginWindowEnabled(!1), {
          getServerConnection: function() {
            return i
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
        };
        var n, t, i
      }(s(window) && null !== window.frameElement), window));
      return a(e, window)
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
angular.module('sn.common.presence', ['ng.amb', 'sn.common.glide', 'sn.common.auth']).config(function($provide) {
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
        if (nv !== journalField)
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
    offline = '{0} is offline',
    auditMessage = '{0} was {1}',
    was = "was";
  i18n.getMessages(
    [
      typing,
      viewing,
      entered,
      probablyLeft,
      exited,
      offline,
      was,
      auditMessage
    ],
    function(results) {
      typing = results[typing];
      viewing = results[viewing];
      entered = results[entered];
      probablyLeft = results[probablyLeft];
      exited = results[exited];
      offline = results[offline];
      was = results[was];
      $scope.auditMessageParts = buildAuditMessageParts(results[auditMessage], was);
    }
  );

  function buildAuditMessageParts(auditMessage, was) {
    var tMessagePattern = /^([^{]*)\{([01])\}([^{]*)\{([01])\}(.*)$/;
    var messageParts = tMessagePattern.exec(auditMessage);
    var auditMessageParts = messageParts ? {
      prefix: messageParts[1].trim(),
      newValPosition: messageParts[2],
      middle: messageParts[3].trim(),
      oldValPosition: messageParts[4],
      postfix: messageParts[5].trim()
    } : {
      prefix: '',
      newValPosition: "0",
      middle: was,
      oldValPosition: "1",
      postfix: ''
    };
    return auditMessageParts;
  }
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
})();;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/js_includes_attachments.js */
/*! RESOURCE: /scripts/angularjs-1.4/thirdparty/angular-file-upload/angular-file-upload-all.js */
(function() {
  function patchXHR(fnName, newFn) {
    window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
  }
  if (window.XMLHttpRequest && !window.XMLHttpRequest.__isFileAPIShim) {
    patchXHR('setRequestHeader', function(orig) {
      return function(header, value) {
        if (header === '__setXHR_') {
          var val = value(this);
          if (val instanceof Function) {
            val(this);
          }
        } else {
          orig.apply(this, arguments);
        }
      }
    });
  }
  var angularFileUpload = angular.module('angularFileUpload', []);
  angularFileUpload.version = '3.1.2';
  angularFileUpload.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
    function sendHttp(config) {
      config.method = config.method || 'POST';
      config.headers = config.headers || {};
      config.transformRequest = config.transformRequest || function(data, headersGetter) {
        if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
          return data;
        }
        return $http.defaults.transformRequest[0](data, headersGetter);
      };
      var deferred = $q.defer();
      var promise = deferred.promise;
      config.headers['__setXHR_'] = function() {
        return function(xhr) {
          if (!xhr) return;
          config.__XHR = xhr;
          config.xhrFn && config.xhrFn(xhr);
          xhr.upload.addEventListener('progress', function(e) {
            e.config = config;
            deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function() {
              promise.progress_fn(e)
            });
          }, false);
          xhr.upload.addEventListener('load', function(e) {
            if (e.lengthComputable) {
              e.config = config;
              deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function() {
                promise.progress_fn(e)
              });
            }
          }, false);
        };
      };
      $http(config).then(function(r) {
        deferred.resolve(r)
      }, function(e) {
        deferred.reject(e)
      }, function(n) {
        deferred.notify(n)
      });
      promise.success = function(fn) {
        promise.then(function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };
      promise.error = function(fn) {
        promise.then(null, function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };
      promise.progress = function(fn) {
        promise.progress_fn = fn;
        promise.then(null, null, function(update) {
          fn(update);
        });
        return promise;
      };
      promise.abort = function() {
        if (config.__XHR) {
          $timeout(function() {
            config.__XHR.abort();
          });
        }
        return promise;
      };
      promise.xhr = function(fn) {
        config.xhrFn = (function(origXhrFn) {
          return function() {
            origXhrFn && origXhrFn.apply(promise, arguments);
            fn.apply(promise, arguments);
          }
        })(config.xhrFn);
        return promise;
      };
      return promise;
    }
    this.upload = function(config) {
      config.headers = config.headers || {};
      config.headers['Content-Type'] = undefined;
      var origTransformRequest = config.transformRequest;
      config.transformRequest = config.transformRequest ?
        (Object.prototype.toString.call(config.transformRequest) === '[object Array]' ?
          config.transformRequest : [config.transformRequest]) : [];
      config.transformRequest.push(function(data, headerGetter) {
        var formData = new FormData();
        var allFields = {};
        for (var key in config.fields) allFields[key] = config.fields[key];
        if (data) allFields['data'] = data;
        if (config.formDataAppender) {
          for (var key in allFields) {
            config.formDataAppender(formData, key, allFields[key]);
          }
        } else {
          for (var key in allFields) {
            var val = allFields[key];
            if (val !== undefined) {
              if (Object.prototype.toString.call(val) === '[object String]') {
                formData.append(key, val);
              } else {
                if (config.sendObjectsAsJsonBlob && typeof val === 'object') {
                  formData.append(key, new Blob([val], {
                    type: 'application/json'
                  }));
                } else {
                  formData.append(key, JSON.stringify(val));
                }
              }
            }
          }
        }
        if (config.file != null) {
          var fileFormName = config.fileFormDataName || 'file';
          if (Object.prototype.toString.call(config.file) === '[object Array]') {
            var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
            for (var i = 0; i < config.file.length; i++) {
              formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i],
                (config.fileName && config.fileName[i]) || config.file[i].name);
            }
          } else {
            formData.append(fileFormName, config.file, config.fileName || config.file.name);
          }
        }
        return formData;
      });
      return sendHttp(config);
    };
    this.http = function(config) {
      return sendHttp(config);
    };
  }]);
  angularFileUpload.directive('ngFileSelect', ['$parse', '$timeout', '$compile',
    function($parse, $timeout, $compile) {
      return {
        restrict: 'AEC',
        require: '?ngModel',
        link: function(scope, elem, attr, ngModel) {
          handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile);
        }
      }
    }
  ]);

  function handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile) {
    function isInputTypeFile() {
      return elem[0].tagName.toLowerCase() === 'input' && elem.attr('type') && elem.attr('type').toLowerCase() === 'file';
    }
    var watchers = [];

    function watchForRecompile(attrVal) {
      $timeout(function() {
        if (elem.parent().length) {
          watchers.push(scope.$watch(attrVal, function(val, oldVal) {
            if (val != oldVal) {
              recompileElem();
            }
          }));
        }
      });
    }

    function recompileElem() {
      var clone = elem.clone();
      if (elem.attr('__afu_gen__')) {
        angular.element(document.getElementById(elem.attr('id').substring(1))).remove();
      }
      if (elem.parent().length) {
        for (var i = 0; i < watchers.length; i++) {
          watchers[i]();
        }
        elem.replaceWith(clone);
        $compile(clone)(scope);
      }
      return clone;
    }

    function bindAttr(bindAttr, attrName) {
      if (bindAttr) {
        watchForRecompile(bindAttr);
        var val = $parse(bindAttr)(scope);
        if (val) {
          elem.attr(attrName, val);
          attr[attrName] = val;
        } else {
          elem.attr(attrName, null);
          delete attr[attrName];
        }
      }
    }
    bindAttr(attr.ngMultiple, 'multiple');
    bindAttr(attr.ngAccept, 'ng-accept');
    bindAttr(attr.ngCapture, 'capture');
    if (attr['ngFileSelect'] != '') {
      attr.ngFileChange = attr.ngFileSelect;
    }

    function onChangeFn(evt) {
      var files = [],
        fileList, i;
      fileList = evt.__files_ || (evt.target && evt.target.files);
      updateModel(fileList, attr, ngModel, scope, evt);
    };
    var fileElem = elem;
    if (!isInputTypeFile()) {
      fileElem = angular.element('<input type="file">')
      if (elem.attr('multiple')) fileElem.attr('multiple', elem.attr('multiple'));
      if (elem.attr('accept')) fileElem.attr('accept', elem.attr('accept'));
      if (elem.attr('capture')) fileElem.attr('capture', elem.attr('capture'));
      for (var key in attr) {
        if (key.indexOf('inputFile') == 0) {
          var name = key.substring('inputFile'.length);
          name = name[0].toLowerCase() + name.substring(1);
          fileElem.attr(name, attr[key]);
        }
      }
      fileElem.css('width', '0px').css('height', '0px').css('position', 'absolute').css('padding', 0).css('margin', 0)
        .css('overflow', 'hidden').attr('tabindex', '-1').css('opacity', 0).attr('__afu_gen__', true);
      elem.attr('__refElem__', true);
      fileElem[0].__refElem__ = elem[0];
      elem.parent()[0].insertBefore(fileElem[0], elem[0])
      elem.css('overflow', 'hidden');
      elem.bind('click', function(e) {
        if (!resetAndClick(e)) {
          fileElem[0].click();
        }
      });
    } else {
      elem.bind('click', resetAndClick);
    }

    function resetAndClick(evt) {
      if (fileElem[0].value != null && fileElem[0].value != '') {
        fileElem[0].value = null;
        if (navigator.userAgent.indexOf("Trident/7") === -1) {
          onChangeFn({
            target: {
              files: []
            }
          });
        }
      }
      if (!elem.attr('__afu_clone__')) {
        if (navigator.appVersion.indexOf("MSIE 10") !== -1 || navigator.userAgent.indexOf("Trident/7") !== -1) {
          var clone = recompileElem();
          clone.attr('__afu_clone__', true);
          clone[0].click();
          evt.preventDefault();
          evt.stopPropagation();
          return true;
        }
      } else {
        elem.attr('__afu_clone__', null);
      }
    }
    fileElem.bind('change', onChangeFn);
    elem.on('$destroy', function() {
      for (var i = 0; i < watchers.length; i++) {
        watchers[i]();
      }
      if (elem[0] != fileElem[0]) fileElem.remove();
    });
    watchers.push(scope.$watch(attr.ngModel, function(val, oldVal) {
      if (val != oldVal && (val == null || !val.length)) {
        if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
          recompileElem();
        } else {
          fileElem[0].value = null;
        }
      }
    }));

    function updateModel(fileList, attr, ngModel, scope, evt) {
      var files = [],
        rejFiles = [];
      var accept = $parse(attr.ngAccept)(scope);
      var regexp = angular.isString(accept) && accept ? new RegExp(globStringToRegex(accept), 'gi') : null;
      var acceptFn = regexp ? null : attr.ngAccept;
      for (var i = 0; i < fileList.length; i++) {
        var file = fileList.item(i);
        if ((!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) &&
          (!acceptFn || $parse(acceptFn)(scope, {
            $file: file,
            $event: evt
          }))) {
          files.push(file);
        } else {
          rejFiles.push(file);
        }
      }
      $timeout(function() {
        if (ngModel) {
          $parse(attr.ngModel).assign(scope, files);
          ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
          if (attr.ngModelRejected) {
            $parse(attr.ngModelRejected).assign(scope, rejFiles);
          }
        }
        if (attr.ngFileChange && attr.ngFileChange != "") {
          $parse(attr.ngFileChange)(scope, {
            $files: files,
            $rejectedFiles: rejFiles,
            $event: evt
          });
        }
      });
    }
  }
  angularFileUpload.directive('ngFileDrop', ['$parse', '$timeout', '$location', function($parse, $timeout, $location) {
    return {
      restrict: 'AEC',
      require: '?ngModel',
      link: function(scope, elem, attr, ngModel) {
        handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location);
      }
    }
  }]);
  angularFileUpload.directive('ngNoFileDrop', function() {
    return function(scope, elem, attr) {
      if (dropAvailable()) elem.css('display', 'none')
    }
  });
  angularFileUpload.directive('ngFileDropAvailable', ['$parse', '$timeout', function($parse, $timeout) {
    return function(scope, elem, attr) {
      if (dropAvailable()) {
        var fn = $parse(attr['ngFileDropAvailable']);
        $timeout(function() {
          fn(scope);
        });
      }
    }
  }]);

  function handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location) {
    var available = dropAvailable();
    if (attr['dropAvailable']) {
      $timeout(function() {
        scope.dropAvailable ? scope.dropAvailable.value = available : scope.dropAvailable = available;
      });
    }
    if (!available) {
      if ($parse(attr.hideOnDropNotAvailable)(scope) != false) {
        elem.css('display', 'none');
      }
      return;
    }
    var leaveTimeout = null;
    var stopPropagation = $parse(attr.stopPropagation)(scope);
    var dragOverDelay = 1;
    var accept = $parse(attr.ngAccept)(scope) || attr.accept;
    var regexp = angular.isString(accept) && accept ? new RegExp(globStringToRegex(accept), 'gi') : null;
    var acceptFn = regexp ? null : attr.ngAccept;
    var actualDragOverClass;
    elem[0].addEventListener('dragover', function(evt) {
      evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();
      if (navigator.userAgent.indexOf("Chrome") > -1) {
        var b = evt.dataTransfer.effectAllowed;
        evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
      }
      $timeout.cancel(leaveTimeout);
      if (!scope.actualDragOverClass) {
        actualDragOverClass = calculateDragOverClass(scope, attr, evt);
      }
      elem.addClass(actualDragOverClass);
    }, false);
    elem[0].addEventListener('dragenter', function(evt) {
      evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();
    }, false);
    elem[0].addEventListener('dragleave', function(evt) {
      leaveTimeout = $timeout(function() {
        elem.removeClass(actualDragOverClass);
        actualDragOverClass = null;
      }, dragOverDelay || 1);
    }, false);
    if (attr['ngFileDrop'] != '') {
      attr.ngFileChange = attr['ngFileDrop'];
    }
    elem[0].addEventListener('drop', function(evt) {
      evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();
      elem.removeClass(actualDragOverClass);
      actualDragOverClass = null;
      extractFiles(evt, function(files, rejFiles) {
        $timeout(function() {
          if (ngModel) {
            $parse(attr.ngModel).assign(scope, files);
            ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
          }
          if (attr['ngModelRejected']) {
            if (scope[attr.ngModelRejected]) {
              $parse(attr.ngModelRejected).assign(scope, rejFiles);
            }
          }
        });
        $timeout(function() {
          $parse(attr.ngFileChange)(scope, {
            $files: files,
            $rejectedFiles: rejFiles,
            $event: evt
          });
        });
      }, $parse(attr.allowDir)(scope) != false, attr.multiple || $parse(attr.ngMultiple)(scope));
    }, false);

    function calculateDragOverClass(scope, attr, evt) {
      var valid = true;
      if (regexp || acceptFn) {
        var items = evt.dataTransfer.items;
        if (items != null) {
          for (var i = 0; i < items.length && valid; i++) {
            valid = valid && (items[i].kind == 'file' || items[i].kind == '') &&
              ((acceptFn && $parse(acceptFn)(scope, {
                  $file: items[i],
                  $event: evt
                })) ||
                (regexp && (items[i].type != null && items[i].type.match(regexp)) ||
                  (items[i].name != null && items[i].name.match(regexp))));
          }
        }
      }
      var clazz = $parse(attr.dragOverClass)(scope, {
        $event: evt
      });
      if (clazz) {
        if (clazz.delay) dragOverDelay = clazz.delay;
        if (clazz.accept) clazz = valid ? clazz.accept : clazz.reject;
      }
      return clazz || attr['dragOverClass'] || 'dragover';
    }

    function extractFiles(evt, callback, allowDir, multiple) {
      var files = [],
        rejFiles = [],
        items = evt.dataTransfer.items,
        processing = 0;

      function addFile(file) {
        if ((!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) &&
          (!acceptFn || $parse(acceptFn)(scope, {
            $file: file,
            $event: evt
          }))) {
          files.push(file);
        } else {
          rejFiles.push(file);
        }
      }
      if (items && items.length > 0 && $location.protocol() != 'file') {
        for (var i = 0; i < items.length; i++) {
          if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
            var entry = items[i].webkitGetAsEntry();
            if (entry.isDirectory && !allowDir) {
              continue;
            }
            if (entry != null) {
              traverseFileTree(files, entry);
            }
          } else {
            var f = items[i].getAsFile();
            if (f != null) addFile(f);
          }
          if (!multiple && files.length > 0) break;
        }
      } else {
        var fileList = evt.dataTransfer.files;
        if (fileList != null) {
          for (var i = 0; i < fileList.length; i++) {
            addFile(fileList.item(i));
            if (!multiple && files.length > 0) break;
          }
        }
      }
      var delays = 0;
      (function waitForProcess(delay) {
        $timeout(function() {
          if (!processing) {
            if (!multiple && files.length > 1) {
              var i = 0;
              while (files[i].type == 'directory') i++;
              files = [files[i]];
            }
            callback(files, rejFiles);
          } else {
            if (delays++ * 10 < 20 * 1000) {
              waitForProcess(10);
            }
          }
        }, delay || 0)
      })();

      function traverseFileTree(files, entry, path) {
        if (entry != null) {
          if (entry.isDirectory) {
            var filePath = (path || '') + entry.name;
            addFile({
              name: entry.name,
              type: 'directory',
              path: filePath
            });
            var dirReader = entry.createReader();
            var entries = [];
            processing++;
            var readEntries = function() {
              dirReader.readEntries(function(results) {
                try {
                  if (!results.length) {
                    for (var i = 0; i < entries.length; i++) {
                      traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/');
                    }
                    processing--;
                  } else {
                    entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                    readEntries();
                  }
                } catch (e) {
                  processing--;
                  console.error(e);
                }
              }, function() {
                processing--;
              });
            };
            readEntries();
          } else {
            processing++;
            entry.file(function(file) {
              try {
                processing--;
                file.path = (path ? path : '') + file.name;
                addFile(file);
              } catch (e) {
                processing--;
                console.error(e);
              }
            }, function(e) {
              processing--;
            });
          }
        }
      }
    }
  }

  function dropAvailable() {
    var div = document.createElement('div');
    return ('draggable' in div) && ('ondrop' in div);
  }

  function globStringToRegex(str) {
    if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
      return str.substring(1, str.length - 1);
    }
    var split = str.split(','),
      result = '';
    if (split.length > 1) {
      for (var i = 0; i < split.length; i++) {
        result += '(' + globStringToRegex(split[i]) + ')';
        if (i < split.length - 1) {
          result += '|'
        }
      }
    } else {
      if (str.indexOf('.') == 0) {
        str = '*' + str;
      }
      result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
      result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
    }
    return result;
  }
  var ngFileUpload = angular.module('ngFileUpload', []);
  for (var key in angularFileUpload) {
    ngFileUpload[key] = angularFileUpload[key];
  }
})();
(function() {
  var hasFlash = function() {
    try {
      var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (fo) return true;
    } catch (e) {
      if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) return true;
    }
    return false;
  }

  function patchXHR(fnName, newFn) {
    window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
  };
  if ((window.XMLHttpRequest && !window.FormData) || (window.FileAPI && FileAPI.forceLoad)) {
    var initializeUploadListener = function(xhr) {
      if (!xhr.__listeners) {
        if (!xhr.upload) xhr.upload = {};
        xhr.__listeners = [];
        var origAddEventListener = xhr.upload.addEventListener;
        xhr.upload.addEventListener = function(t, fn, b) {
          xhr.__listeners[t] = fn;
          origAddEventListener && origAddEventListener.apply(this, arguments);
        };
      }
    }
    patchXHR('open', function(orig) {
      return function(m, url, b) {
        initializeUploadListener(this);
        this.__url = url;
        try {
          orig.apply(this, [m, url, b]);
        } catch (e) {
          if (e.message.indexOf('Access is denied') > -1) {
            this.__origError = e;
            orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
          }
        }
      }
    });
    patchXHR('getResponseHeader', function(orig) {
      return function(h) {
        return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ? this.__fileApiXHR.getResponseHeader(h) : (orig == null ? null : orig.apply(this, [h]));
      };
    });
    patchXHR('getAllResponseHeaders', function(orig) {
      return function() {
        return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ? this.__fileApiXHR.getAllResponseHeaders() : (orig == null ? null : orig.apply(this));
      }
    });
    patchXHR('abort', function(orig) {
      return function() {
        return this.__fileApiXHR && this.__fileApiXHR.abort ? this.__fileApiXHR.abort() : (orig == null ? null : orig.apply(this));
      }
    });
    patchXHR('setRequestHeader', function(orig) {
      return function(header, value) {
        if (header === '__setXHR_') {
          initializeUploadListener(this);
          var val = value(this);
          if (val instanceof Function) {
            val(this);
          }
        } else {
          this.__requestHeaders = this.__requestHeaders || {};
          this.__requestHeaders[header] = value;
          orig.apply(this, arguments);
        }
      }
    });

    function redefineProp(xhr, prop, fn) {
      try {
        Object.defineProperty(xhr, prop, {
          get: fn
        });
      } catch (e) {}
    }
    patchXHR('send', function(orig) {
      return function() {
        var xhr = this;
        if (arguments[0] && arguments[0].__isFileAPIShim) {
          var formData = arguments[0];
          var config = {
            url: xhr.__url,
            jsonp: false,
            cache: true,
            complete: function(err, fileApiXHR) {
              xhr.__completed = true;
              if (!err && xhr.__listeners['load'])
                xhr.__listeners['load']({
                  type: 'load',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (!err && xhr.__listeners['loadend'])
                xhr.__listeners['loadend']({
                  type: 'loadend',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (err === 'abort' && xhr.__listeners['abort'])
                xhr.__listeners['abort']({
                  type: 'abort',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (fileApiXHR.status !== undefined) redefineProp(xhr, 'status', function() {
                return (fileApiXHR.status == 0 && err && err !== 'abort') ? 500 : fileApiXHR.status
              });
              if (fileApiXHR.statusText !== undefined) redefineProp(xhr, 'statusText', function() {
                return fileApiXHR.statusText
              });
              redefineProp(xhr, 'readyState', function() {
                return 4
              });
              if (fileApiXHR.response !== undefined) redefineProp(xhr, 'response', function() {
                return fileApiXHR.response
              });
              var resp = fileApiXHR.responseText || (err && fileApiXHR.status == 0 && err !== 'abort' ? err : undefined);
              redefineProp(xhr, 'responseText', function() {
                return resp
              });
              redefineProp(xhr, 'response', function() {
                return resp
              });
              if (err) redefineProp(xhr, 'err', function() {
                return err
              });
              xhr.__fileApiXHR = fileApiXHR;
              if (xhr.onreadystatechange) xhr.onreadystatechange();
              if (xhr.onload) xhr.onload();
            },
            fileprogress: function(e) {
              e.target = xhr;
              xhr.__listeners['progress'] && xhr.__listeners['progress'](e);
              xhr.__total = e.total;
              xhr.__loaded = e.loaded;
              if (e.total === e.loaded) {
                var _this = this
                setTimeout(function() {
                  if (!xhr.__completed) {
                    xhr.getAllResponseHeaders = function() {};
                    _this.complete(null, {
                      status: 204,
                      statusText: 'No Content'
                    });
                  }
                }, FileAPI.noContentTimeout || 10000);
              }
            },
            headers: xhr.__requestHeaders
          }
          config.data = {};
          config.files = {}
          for (var i = 0; i < formData.data.length; i++) {
            var item = formData.data[i];
            if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
              config.files[item.key] = item.val;
            } else {
              config.data[item.key] = item.val;
            }
          }
          setTimeout(function() {
            if (!hasFlash()) {
              throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
            }
            xhr.__fileApiXHR = FileAPI.upload(config);
          }, 1);
        } else {
          if (this.__origError) {
            throw this.__origError;
          }
          orig.apply(xhr, arguments);
        }
      }
    });
    window.XMLHttpRequest.__isFileAPIShim = true;
    var addFlash = function(elem) {
      if (!hasFlash()) {
        throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
      }
      var el = angular.element(elem);
      if (!el.attr('disabled')) {
        var hasFileSelect = false;
        for (var i = 0; i < el[0].attributes.length; i++) {
          var attrib = el[0].attributes[i];
          if (attrib.name.indexOf('file-select') !== -1) {
            hasFileSelect = true;
            break;
          }
        }
        if (!el.hasClass('js-fileapi-wrapper') && (hasFileSelect || el.attr('__afu_gen__') != null)) {
          el.addClass('js-fileapi-wrapper');
          if (el.attr('__afu_gen__') != null) {
            var ref = (el[0].__refElem__ && angular.element(el[0].__refElem__)) || el;
            while (ref && !ref.attr('__refElem__')) {
              ref = angular.element(ref[0].nextSibling);
            }
            ref.bind('mouseover', function() {
              if (el.parent().css('position') === '' || el.parent().css('position') === 'static') {
                el.parent().css('position', 'relative');
              }
              el.css('position', 'absolute').css('top', ref[0].offsetTop + 'px').css('left', ref[0].offsetLeft + 'px')
                .css('width', ref[0].offsetWidth + 'px').css('height', ref[0].offsetHeight + 'px')
                .css('padding', ref.css('padding')).css('margin', ref.css('margin')).css('filter', 'alpha(opacity=0)');
              ref.attr('onclick', '');
              el.css('z-index', '1000');
            });
          }
        }
      }
    };
    var changeFnWrapper = function(fn) {
      return function(evt) {
        var files = FileAPI.getFiles(evt);
        for (var i = 0; i < files.length; i++) {
          if (files[i].size === undefined) files[i].size = 0;
          if (files[i].name === undefined) files[i].name = 'file';
          if (files[i].type === undefined) files[i].type = 'undefined';
        }
        if (!evt.target) {
          evt.target = {};
        }
        evt.target.files = files;
        if (evt.target.files != files) {
          evt.__files_ = files;
        }
        (evt.__files_ || evt.target.files).item = function(i) {
          return (evt.__files_ || evt.target.files)[i] || null;
        }
        if (fn) fn.apply(this, [evt]);
      };
    };
    var isFileChange = function(elem, e) {
      return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
    }
    if (HTMLInputElement.prototype.addEventListener) {
      HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
        return function(e, fn, b, d) {
          if (isFileChange(this, e)) {
            addFlash(this);
            origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
          } else {
            origAddEventListener.apply(this, [e, fn, b, d]);
          }
        }
      })(HTMLInputElement.prototype.addEventListener);
    }
    if (HTMLInputElement.prototype.attachEvent) {
      HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
        return function(e, fn) {
          if (isFileChange(this, e)) {
            addFlash(this);
            if (window.jQuery) {
              angular.element(this).bind('change', changeFnWrapper(null));
            } else {
              origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
            }
          } else {
            origAttachEvent.apply(this, [e, fn]);
          }
        }
      })(HTMLInputElement.prototype.attachEvent);
    }
    window.FormData = FormData = function() {
      return {
        append: function(key, val, name) {
          if (val.__isFileAPIBlobShim) {
            val = val.data[0];
          }
          this.data.push({
            key: key,
            val: val,
            name: name
          });
        },
        data: [],
        __isFileAPIShim: true
      };
    };
    window.Blob = Blob = function(b) {
      return {
        data: b,
        __isFileAPIBlobShim: true
      };
    };
    (function() {
      if (!window.FileAPI) {
        window.FileAPI = {};
      }
      if (FileAPI.forceLoad) {
        FileAPI.html5 = false;
      }
      if (!FileAPI.upload) {
        var jsUrl, basePath, script = document.createElement('script'),
          allScripts = document.getElementsByTagName('script'),
          i, index, src;
        if (window.FileAPI.jsUrl) {
          jsUrl = window.FileAPI.jsUrl;
        } else if (window.FileAPI.jsPath) {
          basePath = window.FileAPI.jsPath;
        } else {
          for (i = 0; i < allScripts.length; i++) {
            src = allScripts[i].src;
            index = src.search(/\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/)
            if (index > -1) {
              basePath = src.substring(0, index + 1);
              break;
            }
          }
        }
        if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
        script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
        document.getElementsByTagName('head')[0].appendChild(script);
        FileAPI.hasFlash = hasFlash();
      }
    })();
    FileAPI.disableFileInput = function(elem, disable) {
      if (disable) {
        elem.removeClass('js-fileapi-wrapper')
      } else {
        elem.addClass('js-fileapi-wrapper');
      }
    }
  }
  if (!window.FileReader) {
    window.FileReader = function() {
      var _this = this,
        loadStarted = false;
      this.listeners = {};
      this.addEventListener = function(type, fn) {
        _this.listeners[type] = _this.listeners[type] || [];
        _this.listeners[type].push(fn);
      };
      this.removeEventListener = function(type, fn) {
        _this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
      };
      this.dispatchEvent = function(evt) {
        var list = _this.listeners[evt.type];
        if (list) {
          for (var i = 0; i < list.length; i++) {
            list[i].call(_this, evt);
          }
        }
      };
      this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;
      var constructEvent = function(type, evt) {
        var e = {
          type: type,
          target: _this,
          loaded: evt.loaded,
          total: evt.total,
          error: evt.error
        };
        if (evt.result != null) e.target.result = evt.result;
        return e;
      };
      var listener = function(evt) {
        if (!loadStarted) {
          loadStarted = true;
          _this.onloadstart && _this.onloadstart(constructEvent('loadstart', evt));
        }
        if (evt.type === 'load') {
          _this.onloadend && _this.onloadend(constructEvent('loadend', evt));
          var e = constructEvent('load', evt);
          _this.onload && _this.onload(e);
          _this.dispatchEvent(e);
        } else if (evt.type === 'progress') {
          var e = constructEvent('progress', evt);
          _this.onprogress && _this.onprogress(e);
          _this.dispatchEvent(e);
        } else {
          var e = constructEvent('error', evt);
          _this.onerror && _this.onerror(e);
          _this.dispatchEvent(e);
        }
      };
      this.readAsArrayBuffer = function(file) {
        FileAPI.readAsBinaryString(file, listener);
      }
      this.readAsBinaryString = function(file) {
        FileAPI.readAsBinaryString(file, listener);
      }
      this.readAsDataURL = function(file) {
        FileAPI.readAsDataURL(file, listener);
      }
      this.readAsText = function(file) {
        FileAPI.readAsText(file, listener);
      }
    }
  }
})();;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/_module.js */
angular.module('sn.common.attachments', [
  'angularFileUpload',
  'sn.common.util'
]);;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/factory.nowAttachmentHandler.js */
angular.module("sn.common.attachments").factory("nowAttachmentHandler", function($http, nowServer, $upload, $rootScope, $timeout,
  snNotification) {
  "use strict";
  return function(setAttachments, appendError) {
    var self = this;
    self.cardUploading = '';
    self.setAttachments = setAttachments;
    self.appendError = appendError;
    self.ADDED = 'added';
    self.DELETED = 'deleted';
    self.RENAMED = 'renamed';
    self.getAttachmentList = function(action) {
      var url = nowServer.getURL('ngk_attachments', {
        action: 'list',
        sys_id: self.tableId,
        table: self.tableName
      });
      $http.get(url).then(function(response) {
        var attachments = response.data.files || [];
        self.setAttachments(attachments, action);
        if (self.startedUploadingTimeout || self.errorTimeout) {
          self.stopAllUploading();
          $rootScope.$broadcast('board.uploading.end');
        }
      });
    };
    self.stopAllUploading = function() {
      $timeout.cancel(self.errorTimeout);
      $timeout.cancel(self.startedUploadingTimeout);
      hideProgressBar();
      $rootScope.$broadcast("attachment.upload.stop");
    };
    self.onFileSelect = function($files) {
      if (!$files.length)
        return;
      var url = nowServer.getURL('ngk_attachments', {
        sys_id: self.tableId,
        table: self.tableName,
        action: 'add'
      });
      self.cardUploading = self.tableId;
      self.maxfiles = $files.length;
      self.fileCount = 1;
      self.filesUploaded = self.maxfiles;
      self.startedUploadingTimeout = $timeout(showUploaderDialog, 1500);
      for (var i = 0; i < self.maxfiles; i++) {
        if (parseInt($files[i].size) > parseInt(self.fileUploadSizeLimit)) {
          self.stopAllUploading();
          $rootScope.$broadcast('dialog.upload_too_large.show');
          return;
        }
      }
      for (var i = 0; i < self.maxfiles; i++) {
        $rootScope.$broadcast("attachment.upload.start");
        var file = $files[i];
        self.filesUploaded--;
        self.upload = $upload.upload({
          url: url,
          fields: {
            attachments_modified: 'true',
            sysparm_table: self.tableName,
            sysparm_sys_id: self.tableId,
            sysparm_nostack: 'yes',
            sysparm_encryption_context: '',
            sysparm_ck: window.g_ck
          },
          fileFormDataName: 'attachFile',
          file: file
        }).progress(function(evt) {
          var percent = parseInt(100.0 * evt.loaded / evt.total, 10);
          updateProgress(percent);
        }).success(function(data, status, headers, config) {
          processError(data);
          self.stopAllUploading();
          self.getAttachmentList(self.ADDED);
          if (self.filesUploaded <= 0) {
            self.cardUploading = '';
          }
        });
      }
    };
    self.downloadAttachment = function(attachment) {
      window.location.href = '/sys_attachment.do?sys_id=' + attachment.sys_id;
    };
    self.viewAttachment = function($event, attachment) {
      var url = window.location.protocol + '//' + window.location.host;
      url += '/sys_attachment.do?sysparm_referring_url=tear_off&view=true&sys_id=' + attachment.sys_id;
      window.open(url, attachment.sys_id,
        "toolbar=no,menubar=no,personalbar=no,width=800,height=600,scrollbars=yes,resizable=yes");
    };
    self.editAttachment = function($event, attachment) {
      var parent = $($event.currentTarget).closest('.file-attachment');
      var thumbnail = parent.find('.thumbnail');
      var input = parent.find('input');
      var tools = parent.find('.tools');
      var fileName = attachment.file_name;
      if (attachment.file_name.indexOf('.') !== -1) {
        attachment.ext = fileName.match(/(\.[^\.]+)$/i)[0];
        fileName = attachment.file_name.replace(/(\.[^\.]+)$/i, '');
      }
      input.val(fileName);
      var w = input.prev().width();
      input.width(w);
      input.prev().hide();
      input.css('display', 'block');
      thumbnail.addClass('state-locked');
      tools.find('.delete-edit').hide();
      tools.find('.rename-cancel').css('display', 'inline-block');
      input.focus();
    }
    self.onKeyDown = function($event, attachment) {
      var keyCode = $event.keyCode;
      if (keyCode === 13) {
        $event.stopPropagation();
        $event.preventDefault();
        self.updateAttachment($event, attachment);
      } else if (keyCode === 27) {
        $event.stopPropagation();
        $event.preventDefault();
        self.updateAttachment($event);
      }
    };
    self.updateAttachment = function($event, attachment) {
      var el = $($event.currentTarget);
      var parent = el.closest('.file-attachment');
      var thumbnail = parent.find('.thumbnail');
      var input = parent.find('input');
      var link = parent.find('a');
      var tools = parent.find('.tools');
      if (attachment) {
        var fileName = input.val();
        if (fileName.length) {
          fileName += attachment.ext;
          if (fileName !== attachment.file_name) {
            link.text(fileName);
            self.renameAttachment(attachment, fileName);
          }
        }
      }
      input.hide();
      input.prev().show();
      tools.find('.rename-cancel').hide();
      thumbnail.removeClass('state-locked');
      tools.find('.delete-edit').css('display', 'inline-block');
    };
    self.dismissMsg = function($event, $index, errorMessages) {
      var msg = $($event.currentTarget);
      msg.addClass('remove');
      setTimeout(function() {
        msg.remove();
        errorMessages.splice($index, 1);
      }, 500);
    };
    $rootScope.$on("dialog.comment_form.close", function() {
      hideProgressBar();
    });
    self.openSelector = function($event) {
      $event.stopPropagation();
      $event.preventDefault();
      var target = $($event.currentTarget);
      var input = target.parent().find('input[type=file]');
      input.click();
    }
    self.deleteAttachment = function(attachment) {
      if (attachment && attachment.sys_id) {
        $('#' + attachment.sys_id).hide();
        var url = nowServer.getURL('ngk_attachments', {
          action: 'delete',
          sys_id: attachment.sys_id
        });
        $http.get(url).then(function(response) {
          processError(response.data);
          self.getAttachmentList(self.DELETED);
        });
      }
    };
    self.renameAttachment = function(attachment, newName) {
      $http({
        url: nowServer.getURL('ngk_attachments'),
        method: 'POST',
        params: {
          action: 'rename',
          sys_id: attachment.sys_id,
          new_name: newName
        }
      }).then(function(response) {
        processError(response.data);
        self.getAttachmentList(self.RENAMED);
      });
    };

    function showUploaderDialog() {
      $rootScope.$broadcast('board.uploading.start', self.tableId);
    }

    function updateProgress(percent) {
      if (self.prevPercent === percent && self.fileCount <= self.maxfiles)
        return;
      if (self.fileCount <= self.maxfiles) {
        if (percent > 99)
          self.fileCount++;
        if (self.fileCount <= self.maxfiles) {
          $timeout.cancel(self.errorTimeout);
          self.errorTimeout = $timeout(broadcastError, 15000);
          $('.progress-label').text('Uploading file ' + self.fileCount + ' of ' + self.maxfiles);
          $('.upload-progress').val(percent);
          $('.progress-wrapper').show();
        }
      }
      self.prevPercent = percent;
    }

    function hideProgressBar() {
      try {
        $('.progress-wrapper').hide();
      } catch (e) {}
    }
    self.setParams = function(tableName, tableId, fileUploadSizeLimit) {
      self.tableName = tableName;
      self.tableId = tableId;
      self.fileUploadSizeLimit = fileUploadSizeLimit;
    };

    function broadcastError() {
      $rootScope.$broadcast('board.uploading.end');
      snNotification.show('error', 'An error occured when trying to upload your file. Please try again.');
      self.stopAllUploading();
    }

    function processError(data) {
      if (!data.error)
        return;
      var fileName = data.fileName || data.file_name;
      self.appendError({
        msg: data.error + ' : ',
        fileName: '"' + fileName + '"'
      });
    }
  };
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.nowAttachmentsList.js */
angular.module('sn.common.attachments').directive('nowAttachmentsList', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl("attachments_list.xml"),
    link: function(scope, elem, attrs, $parse) {
      scope.icons = {
        preview: attrs.previewIcon,
        edit: attrs.editIcon,
        delete: attrs.deleteIcon,
        ok: attrs.okIcon,
        cancel: attrs.cancelIcon
      };
      scope.listClass = "list-group";
      var inline = scope.$eval(attrs.inline);
      if (inline)
        scope.listClass = "list-inline";
      scope.entryTemplate = getTemplateUrl(attrs.template || "attachment");
    }
  };
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/factory.snAttachmentHandler.js */
angular.module('sn.common.attachments').factory('snAttachmentHandler', function(urlTools, $http, $upload, $window, $q) {
  "use strict";
  return {
    getViewUrl: getViewUrl,
    create: createAttachmentHandler,
    deleteAttachment: deleteAttachmentBySysID,
    renameAttachment: renameAttachmentBySysID
  };

  function getViewUrl(sysId) {
    return '/sys_attachment.do?sys_id=' + sysId;
  }

  function deleteAttachmentBySysID(sysID) {
    var url = urlTools.getURL('ngk_attachments', {
      action: 'delete',
      sys_id: sysID
    });
    return $http.get(url);
  }

  function renameAttachmentBySysID(sysID, newName) {
    var url = urlTools.getURL('ngk_attachments', {
      action: 'rename',
      sys_id: sysID,
      new_name: newName
    });
    return $http.post(url);
  }

  function createAttachmentHandler(tableName, sysID, options) {
    var _tableName = tableName;
    var _sysID = sysID;
    var _files = [];

    function getTableName() {
      return _tableName;
    }

    function getSysID() {
      return _sysID;
    }

    function getAttachments() {
      var url = urlTools.getURL('ngk_attachments', {
        action: 'list',
        sys_id: _sysID,
        table: _tableName
      });
      return $http.get(url).then(function(response) {
        var files = response.data.files;
        if (_files.length == 0) {
          files.forEach(function(file) {
            if (file && file.sys_id) {
              _transformFileResponse(file);
              _files.push(file);
            }
          })
        } else {
          _files = files;
        }
        return _files;
      });
    }

    function addAttachment(attachment) {
      _files.unshift(attachment);
    }

    function deleteAttachment(attachment) {
      var index = _files.indexOf(attachment);
      if (index !== -1) {
        return deleteAttachmentBySysID(attachment.sys_id).then(function() {
          _files.splice(index, 1);
        });
      }
    }

    function uploadAttachments(files, uploadFields) {
      var defer = $q.defer();
      var promises = [];
      var fileData = [];
      angular.forEach(files, function(file) {
        promises.push(uploadAttachment(file, uploadFields).then(function(response) {
          fileData.push(response);
        }));
      });
      $q.all(promises).then(function() {
        defer.resolve(fileData);
      });
      return defer.promise;
    }

    function uploadAttachment(file, uploadFields, uploadMethods) {
      var url = urlTools.getURL('ngk_attachments', {
        action: 'add',
        sys_id: _sysID,
        table: _tableName,
        load_attachment_record: 'true'
      });
      var fields = {
        attachments_modified: 'true',
        sysparm_table: _tableName,
        sysparm_sys_id: _sysID,
        sysparm_nostack: 'yes',
        sysparm_encryption_context: ''
      };
      if (typeof $window.g_ck !== 'undefined') {
        fields['sysparm_ck'] = $window.g_ck;
      }
      if (uploadFields) {
        angular.extend(fields, uploadFields);
      }
      var upload = $upload.upload({
        url: url,
        fields: fields,
        fileFormDataName: 'attachFile',
        file: file
      });
      if (uploadMethods !== undefined) {
        if (uploadMethods.hasOwnProperty('progress')) {
          upload.progress(uploadMethods.progress);
        }
        if (uploadMethods.hasOwnProperty('success')) {
          upload.success(uploadMethods.success);
        }
        if (uploadMethods.hasOwnProperty('error')) {
          upload.error(uploadMethods.error);
        }
      }
      return upload.then(function(response) {
        var sysFile = response.data;
        if (sysFile.error) {
          return $q.reject("Exception when adding attachment: " + sysFile.error);
        }
        if (typeof sysFile === "object" && sysFile.hasOwnProperty('sys_id')) {
          _transformFileResponse(sysFile);
          addAttachment(sysFile);
        }
        if (options && options.onUploadComplete) {
          options.onUploadComplete(sysFile);
        }
        return sysFile;
      });
    }

    function _transformFileResponse(file) {
      file.isImage = false;
      file.canPreview = false;
      if (file.content_type.indexOf('image') !== -1) {
        file.isImage = true;
        if (!file.thumbSrc) {} else if (file.thumbSrc[0] !== '/') {
          file.thumbSrc = '/' + file.thumbSrc;
        }
        file.canPreview = file.content_type.indexOf('tiff') === -1;
      }
      file.viewUrl = getViewUrl(file.sys_id);
    }
    return {
      getSysID: getSysID,
      getTableName: getTableName,
      getAttachments: getAttachments,
      addAttachment: addAttachment,
      deleteAttachment: deleteAttachment,
      uploadAttachment: uploadAttachment,
      uploadAttachments: uploadAttachments
    };
  }
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snFileUploadInput.js */
angular.module('sn.common.attachments').directive('snFileUploadInput', function(cabrillo, $document) {
  'use strict';
  return {
    restrict: 'E',
    scope: {
      attachmentHandler: '=',
      customClassNames: '@classNames'
    },
    template: function() {
      var inputTemplate;
      if (cabrillo.isNative()) {
        inputTemplate = '<button class="{{classNames}}" ng-click="showAttachOptions($event)" aria-labelledby="attach-label-{{ ::$id }}"><span class="upload-label" id="attach-label-{{ ::$id }}"><translate key="Add Attachment" /></span></button>';
      } else {
        inputTemplate = '<button class="{{classNames}}" ng-file-select="onFileSelect($files)" aria-labelledby="attach-label-{{ ::$id }}"><span class="upload-label" id="attach-label-{{ ::$id }}"><translate key="Add Attachment" /></span></button>';
      }
      return [
        '<div class="file-upload-input" role="button" aria-labelledby="attach-label-{{ ::$id }}">',
        '<div role="group" class="injected-contents-break-accessibility" aria-hidden="true">',
        inputTemplate,
        '</div>',
        '</div>'
      ].join('');
    },
    controller: function($element, $scope) {
      var classNames = 'btn btn-icon attachment-btn icon-paperclip';
      if ($scope.customClassNames) {
        classNames += ' ' + $scope.customClassNames;
      }
      $scope.classNames = classNames;
      $scope.showAttachOptions = function($event) {
        var handler = $scope.attachmentHandler;
        var target = angular.element($event.currentTarget);
        var elRect = target[0].getBoundingClientRect();
        var body = $document[0].body;
        var rect = {
          x: elRect.left + body.scrollLeft,
          y: elRect.top + body.scrollTop,
          width: elRect.width,
          height: elRect.height
        };
        var options = {
          sourceRect: rect
        };
        cabrillo.attachments.addFile(
          handler.getTableName(),
          handler.getSysID(),
          null,
          options
        ).then(function(data) {
          console.log('Attached new file', data);
          handler.addAttachment(data);
        }, function() {
          console.log('Failed to attach new file');
        });
      };
      $scope.onFileSelect = function($files) {
        $scope.attachmentHandler.uploadAttachments($files);
      };
      $scope.showFileSelector = function($event) {
        $event.stopPropagation();
        var target = angular.element($event.currentTarget);
        var input = target.parent().find('input');
        input.triggerHandler('click');
      };
    }
  }
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snPasteFileHandler.js */
angular.module('sn.common.attachments').directive('snPasteFileHandler', function($parse) {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var snPasteFileHandler = $parse(attrs.snPasteFileHandler);
      element.bind("paste", function(event) {
        event = event.originalEvent || event;
        var item = event.clipboardData.items[0];
        if (!item)
          return;
        var file = item.getAsFile();
        if (!file)
          return;
        snPasteFileHandler(scope, {
          file: file
        });
        event.preventDefault();
        event.stopPropagation();
      });
    }
  };
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snAttachmentList.js */
angular.module('sn.common.attachments').directive('snAttachmentList', function(getTemplateUrl, snAttachmentHandler, $rootScope, $window, $timeout, $q) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      templateUrl: getTemplateUrl("sn_attachment_list.xml"),
      scope: {
        tableName: "=?",
        sysID: "=?sysId",
        attachmentList: "=?",
        uploadFileFn: "&",
        deleteFileFn: "=?",
        canEdit: "=?",
        canRemove: "=?",
        canAdd: "=?",
        canDownload: "=?",
        showHeader: "=?",
        clickImageFn: "&?",
        confirmDelete: "=?"
      },
      controller: function($scope) {
        $scope.canEdit = $scope.canEdit || false;
        $scope.canDownload = $scope.canDownload || false;
        $scope.canRemove = $scope.canRemove || false;
        $scope.canAdd = $scope.canAdd || false;
        $scope.showHeader = $scope.showHeader || false;
        $scope.clickImageFn = $scope.clickImageFn || function() {};
        $scope.confirmDelete = $scope.confirmDelete || false;
        $scope.filesInProgress = {};
        $scope.attachmentToDelete = null;

        function refreshResources() {
          var handler = snAttachmentHandler.create($scope.tableName, $scope.sysID);
          handler.getAttachments().then(function(files) {
            $scope.attachmentList = files;
          });
        }
        if (!$scope.attachmentList) {
          $scope.attachmentList = [];
          refreshResources();
        }
        $scope.$on('attachments_list.update', function(e, tableName, sysID) {
          if (tableName === $scope.tableName && sysID === $scope.sysID) {
            refreshResources();
          }
        });

        function removeFromFileProgress(fileName) {
          delete $scope.filesInProgress[fileName];
        }

        function updateFileProgress(file) {
          if (!$scope.filesInProgress[file.name])
            $scope.filesInProgress[file.name] = file;
        }
        $scope.$on('attachments_list.upload.progress', function(e, file) {
          updateFileProgress(file);
        });
        $scope.$on('attachments_list.upload.success', function(e, file) {
          removeFromFileProgress(file.name);
        });
        $scope.attachFiles = function(files) {
          if ($scope.tableName && $scope.sysID) {
            var handler = snAttachmentHandler.create($scope.tableName, $scope.sysID);
            var promises = [];
            files.forEach(function(file) {
              var promise = handler.uploadAttachment(file, null, {
                progress: function(e) {
                  var file = e.config.file;
                  file.progress = 100.0 * event.loaded / event.total;
                  updateFileProgress(file);
                },
                success: function(data) {
                  removeFromFileProgress(data.file_name);
                }
              });
              promises.push(promise);
            });
            $q.all(promises).then(function() {
              refreshResources();
            });
          } else {
            if ($scope.uploadFileFn)
              $scope.uploadFileFn({
                files: files
              });
          }
        };
        $scope.getProgressStyle = function(fileName) {
          return {
            'width': $scope.filesInProgress[fileName].progress + '%'
          };
        };
        $scope.openSelector = function($event) {
          $event.stopPropagation();
          var target = angular.element($event.currentTarget);
          $timeout(function() {
            target.parent().find('input').click();
          });
        };
        $scope.confirmDeleteAttachment = function(attachment) {
          $scope.attachmentToDelete = attachment;
          $scope.$broadcast('dialog.confirm-delete.show');
        };
        $scope.deleteAttachment = function() {
          snAttachmentHandler.deleteAttachment($scope.attachmentToDelete.sys_id).then(function() {
            var index = $scope.attachmentList.indexOf($scope.attachmentToDelete);
            $scope.attachmentList.splice(index, 1);
          });
        };
      }
    };
  })
  .directive('snAttachmentListItem', function(getTemplateUrl, snAttachmentHandler, $rootScope, $window, $timeout, $parse) {
    'use strict';
    return {
      restrict: "E",
      replace: true,
      templateUrl: getTemplateUrl("sn_attachment_list_item.xml"),
      link: function(scope, element, attrs) {
        function translateAttachment(att) {
          return {
            content_type: att.content_type,
            file_name: att.file_name,
            image: (att.thumbSrc !== undefined),
            size_bytes: att.size,
            sys_created_by: "",
            sys_created_on: "",
            sys_id: att.sys_id,
            thumb_src: att.thumbSrc
          };
        }
        scope.attachment = ($parse(attrs.attachment.size_bytes)) ?
          scope.$eval(attrs.attachment) :
          translateAttachment(attrs.attachment);
        var fileNameView = element.find('.sn-widget-list-title_view');
        var fileNameEdit = element.find('.sn-widget-list-title_edit');

        function editFileName() {
          fileNameView.hide();
          fileNameEdit.show();
          element.find('.edit-text-input').focus();
        }

        function viewFileName() {
          fileNameView.show();
          fileNameEdit.hide();
        }
        viewFileName();
        scope.editModeToggle = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          scope.editMode = !scope.editMode;
          if (scope.editMode)
            editFileName();
          else
            viewFileName();
        };
        scope.updateName = function() {
          scope.editMode = false;
          viewFileName();
          snAttachmentHandler.renameAttachment(scope.attachment.sys_id, scope.attachment.file_name);
        };
      },
      controller: function($scope, snCustomEvent) {
        $scope.editMode = false;
        $scope.buttonFocus = false;
        $scope.removeAttachment = function(attachment, index) {
          if ($scope.deleteFileFn !== undefined && $scope.deleteFileFn instanceof Function) {
            $scope.deleteFileFn.apply(null, arguments);
            return;
          }
          if ($scope.confirmDelete) {
            $scope.confirmDeleteAttachment($scope.attachment);
            return;
          }
          snAttachmentHandler.deleteAttachment($scope.attachment.sys_id).then(function() {
            $scope.attachmentList.splice($scope.$index, 1);
          });
        };
        var contentTypeMap = {
          "application/pdf": "icon-document-pdf",
          "text/plain": "icon-document-txt",
          "application/zip": "icon-document-zip",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "icon-document-doc",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": "icon-document-ppt",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "icon-document-xls",
          "application/vnd.ms-powerpoint": "icon-document-ppt"
        };
        $scope.getDocumentType = function(contentType) {
          return contentTypeMap[contentType] || "icon-document";
        };
        $scope.handleAttachmentClick = function(event) {
          if (event.keyCode === 9)
            return;
          if ($scope.editMode)
            return;
          if (!$scope.attachment)
            return;
          if ($scope.attachment.image)
            openImageInLightBox(event);
          else
            downloadAttachment();
        };

        function downloadAttachment() {
          if (!$scope.attachment.sys_id)
            return;
          $window.location.href = 'sys_attachment.do?sys_id=' + $scope.attachment.sys_id;
        }

        function openImageInLightBox(event) {
          if (!$scope.attachment.size)
            $scope.attachment.size = $scope.getSize($scope.attachment.size_bytes, 2);
          $scope.clickImageFn({
            file: $scope.attachment
          });
          snCustomEvent.fire('sn.attachment.preview', event, $scope.attachment);
        }
        $scope.getSize = function(bytes, precision) {
          if (typeof bytes === 'string' && bytes.slice(-1) === 'B')
            return bytes;
          var kb = 1024;
          var mb = kb * 1024;
          var gb = mb * 1024;
          if ((bytes >= 0) && (bytes < kb))
            return bytes + ' B';
          else if ((bytes >= kb) && (bytes < mb))
            return (bytes / kb).toFixed(precision) + ' KB';
          else if ((bytes >= mb) && (bytes < gb))
            return (bytes / mb).toFixed(precision) + ' MB';
          else if (bytes >= gb)
            return (bytes / gb).toFixed(precision) + ' GB';
          else
            return bytes + ' B';
        }
        $scope.onButtonFocus = function() {
          $scope.buttonFocus = true;
        }
        $scope.onButtonBlur = function() {
          $scope.buttonFocus = false;
        }
      }
    };
  });;;
/*! RESOURCE: /scripts/calendar.js */
var MONTH_NAMES = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
var DAY_NAMES = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');

function LZ(x) {
  return (x < 0 || x > 9 ? "" : "0") + x
}

function isDate(val, format) {
  var date = getDateFromFormat(val, format);
  if (date == 0) {
    return false;
  }
  return true;
}

function compareDates(date1, dateformat1, date2, dateformat2) {
  var d1 = getDateFromFormat(date1, dateformat1);
  var d2 = getDateFromFormat(date2, dateformat2);
  if (d1 == 0 || d2 == 0) {
    return -1;
  } else if (d1 > d2) {
    return 1;
  }
  return 0;
}

function formatDateServer(date, format) {
  var ga = new GlideAjax("DateTimeUtils");
  ga.addParam("sysparm_name", "formatCalendarDate");
  var browserOffset = date.getTimezoneOffset() * 60000;
  var utcTime = date.getTime() - browserOffset;
  var userDateTime = utcTime - g_tz_offset;
  ga.addParam("sysparm_value", userDateTime);
  ga.getXMLWait();
  return ga.getAnswer();
}

function formatDate(date, format) {
  if (format.indexOf("z") > 0)
    return formatDateServer(date, format);
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
  value["MM"] = LZ(M);
  value["MMM"] = MONTH_NAMES[M + 11];
  value["NNN"] = MONTH_NAMES[M + 11];
  value["MMMM"] = MONTH_NAMES[M - 1];
  value["d"] = d;
  value["dd"] = LZ(d);
  value["E"] = DAY_NAMES[E + 7];
  value["EE"] = DAY_NAMES[E];
  value["H"] = H;
  value["HH"] = LZ(H);
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
    value["ww"] = LZ(wk);
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
  value["hh"] = LZ(value["h"]);
  if (H > 11) {
    value["K"] = H - 12;
  } else {
    value["K"] = H;
  }
  value["k"] = H + 1;
  value["KK"] = LZ(value["K"]);
  value["kk"] = LZ(value["k"]);
  if (H > 11) {
    value["a"] = "PM";
  } else {
    value["a"] = "AM";
  }
  value["m"] = m;
  value["mm"] = LZ(m);
  value["s"] = s;
  value["ss"] = LZ(s);
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
}

function _isInteger(val) {
  var digits = "1234567890";
  for (var i = 0; i < val.length; i++) {
    if (digits.indexOf(val.charAt(i)) == -1) {
      return false;
    }
  }
  return true;
}

function _getInt(str, i, minlength, maxlength) {
  for (var x = maxlength; x >= minlength; x--) {
    var token = str.substring(i, i + x);
    if (token.length < minlength) {
      return null;
    }
    if (_isInteger(token)) {
      return token;
    }
  }
  return null;
}
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
}
Date.prototype._lastWeekOfYear = function() {
  var newYear = new Date(this.getFullYear() - 1, 0, 1);
  var endOfYear = new Date(this.getFullYear() - 1, 11, 31);
  var day = newYear.getDay() - (g_first_day_of_week - 1);
  var dayNum = Math.floor((endOfYear.getTime() - newYear.getTime() - (endOfYear.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
  return day < 4 ? Math.floor((dayNum + day - 1) / 7) + 1 : Math.floor((dayNum + day - 1) / 7);
}
Date.prototype._checkNextYear = function() {
  var nYear = new Date(this.getFullYear() + 1, 0, 1);
  var nDay = nYear.getDay() - (g_first_day_of_week - 1);
  nDay = nDay >= 0 ? nDay : nDay + 7;
  return nDay < 4 ? 1 : 53;
}
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
}

function getDateFromFormat(val, format) {
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
      year = _getInt(val, i_val, x, y);
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
      for (var i = 0; i < MONTH_NAMES.length; i++) {
        var month_name = MONTH_NAMES[i];
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
      for (var i = 0; i < DAY_NAMES.length; i++) {
        var day_name = DAY_NAMES[i];
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
      month = _getInt(val, i_val, token.length, 2);
      if (month == null || (month < 1) || (month > 12)) {
        return 0;
      }
      i_val += month.length;
    } else if (token == "dd" || token == "d") {
      date = _getInt(val, i_val, token.length, 2);
      if (date == null || (date < 1) || (date > 31)) {
        return 0;
      }
      i_val += date.length;
    } else if (token == "hh" || token == "h") {
      hh = _getInt(val, i_val, token.length, 2);
      if (hh == null || (hh < 1) || (hh > 12)) {
        return 0;
      }
      i_val += hh.length;
    } else if (token == "HH" || token == "H") {
      hh = _getInt(val, i_val, token.length, 2);
      if (hh == null || (hh < 0) || (hh > 23)) {
        return 0;
      }
      i_val += hh.length;
    } else if (token == "KK" || token == "K") {
      hh = _getInt(val, i_val, token.length, 2);
      if (hh == null || (hh < 0) || (hh > 11)) {
        return 0;
      }
      i_val += hh.length;
    } else if (token == "kk" || token == "k") {
      hh = _getInt(val, i_val, token.length, 2);
      if (hh == null || (hh < 1) || (hh > 24)) {
        return 0;
      }
      i_val += hh.length;
      hh--;
    } else if (token == "mm" || token == "m") {
      mm = _getInt(val, i_val, token.length, 2);
      if (mm == null || (mm < 0) || (mm > 59)) {
        return 0;
      }
      i_val += mm.length;
    } else if (token == "ss" || token == "s") {
      ss = _getInt(val, i_val, token.length, 2);
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
      var weekNum = _getInt(val, i_val, token.length, 2);
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
        var day = _getInt(val, i_val, token.length, 1);
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
}

function parseDate(val) {
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
      d = getDateFromFormat(val, l[j]);
      if (d != 0) {
        return new Date(d);
      }
    }
  }
  return null;
}

function getDurationString(ms) {
  var sec = Math.floor(ms / 1000),
    s = '',
    days = Math.floor(sec / 86400);
  if (days >= 1) {
    s += days + ' day' + (days > 1 ? 's' : '');
    sec -= days * 86400;
  }
  var hours = Math.floor(sec / 3600);
  if (hours >= 1) {
    s += (days > 0 ? ' ' : '') + hours + ' hour' + (hours > 1 ? 's' : '');
    sec -= hours * 3600;
  }
  var min = Math.floor(sec / 60);
  if (days == 0) {
    if (min >= 1) {
      s += (hours > 0 ? ' ' : '') + min + ' minute' + (min > 1 ? 's' : '');
      if (hours < 1) {
        sec -= min * 60;
        if (sec > 0 && min <= 10)
          s += ' ' + sec + ' second' + (sec > 1 ? 's' : '');
      }
    } else if (hours == 0 && sec > 0)
      s += sec + ' second' + (sec > 1 ? 's' : '');
  }
  return s;
}

function getUserDateTime() {
  var browserDate = new Date();
  var browserOffset = browserDate.getTimezoneOffset() * 60000;
  var utcTime = browserDate.getTime() + browserOffset;
  var userDateTime = utcTime + g_tz_offset;
  return new Date(userDateTime);
}

function convertUtcTimeToUserTimeMs(utcTimeMs) {
  var d = new Date();
  return parseInt(utcTimeMs) + (d.getTimezoneOffset() * 60000) + g_tz_offset;
}

function convertUserTimeToUtcTimeMs(userTimeMs) {
  var d = new Date();
  return parseInt(userTimeMs) - (d.getTimezoneOffset() * 60000) - g_tz_offset;
};;