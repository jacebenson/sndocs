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
this.org = this.org || {};
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
};
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
  var databaseInterval = ($window.NOW.presence_interval || 15) * 1000;
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
          updateDatabase();
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

  function updateDatabase() {
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
      if (429 == status)
        $timeout(updateDatabase, databaseInterval);
      else
        schedulePresence();
    })
  }

  function schedulePresence() {
    $timeout(updateDatabase, databaseInterval);
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
      if (y > (5 * databaseInterval))
        p.status = "offline";
      else if (y > (3 * databaseInterval))
        p.status = "probably offline";
      else if (y > (2.5 * databaseInterval))
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
    if (now - p.saved >= databaseInterval)
      return null;
    return p.presenceArray;
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
angular.module('sn.common.avatar').directive('snAvatar', function($http, $compile, getTemplateUrl, snCustomEvent, snConnectService) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_avatar.xml'),
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
        function recompile() {
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
      $scope.displayMemberCount = $scope.displayMemberCount || false;
      $scope.liveProfileID = liveProfileID;
      $scope.$watch('primary', function(newValue, oldValue) {
        if ($scope.primary && newValue !== oldValue) {
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
        if ($scope.members)
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
            $scope.presenceEnabled = $scope.showPresence && !$scope.isDocument && $scope.users.length === 1;
          });
          return;
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
        $scope.presenceEnabled = $scope.showPresence && !$scope.isDocument && $scope.users.length === 1;
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
      scope.template = '<sn-user-profile profile="evaluatedProfile" show-direct-message-prompt="::directConversationButton" class="avatar-popover avatar-popover-padding"></sn-user-profile>';
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
            var filterExpression = filterExpressionParser.parse(filterText, scope.ed.defaultOperator);
            var colToSearch = getReferenceColumnToSearch();
            var q = colToSearch + filterExpression.operator + filterExpression.filterText +
              '^' + colToSearch + 'ISNOTEMPTY' + getExcludedValues() + "^EQ";
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

      function getReferenceColumnToSearch() {
        var colName = 'name';
        if (scope.ed.searchField)
          colName = scope.ed.searchField;
        else if (fieldAttributes['ref_ac_columns_search'] == 'true' && 'ref_ac_columns' in fieldAttributes && fieldAttributes['ref_ac_columns'] != '') {
          var refAcColumns = fieldAttributes['ref_ac_columns'].split(';');
          colName = refAcColumns[0];
        } else if (fieldAttributes['ref_ac_order_by'])
          colName = fieldAttributes['ref_ac_order_by'];
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
          } else {
            scope.$apply(function() {
              scope.field.value = value;
              scope.field.displayValue = displayValue;
              scope.rowSelected();
            });
          }
          if (scope.snOnChange) {
            e.displayValue = displayValue;
            scope.snOnChange(e);
          }
        } else if (e.removed) {
          if (scope.snOptions && scope.snOptions.useGlideForm === true) {
            g_form.clearValue(scope.field.name);
            if (scope.snOnChange)
              scope.snOnChange(e);
          } else {
            scope.$apply(function() {
              scope.field.displayValue = '';
              scope.field.value = '';
              if (scope.snOnChange)
                scope.snOnChange(e);
            });
          }
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
  var databaseInterval = ($window.NOW.presence_interval || 15) * 1000;
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
          updateDatabase();
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

  function updateDatabase() {
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
      if (429 == status)
        $timeout(updateDatabase, databaseInterval);
      else
        schedulePresence();
    })
  }

  function schedulePresence() {
    $timeout(updateDatabase, databaseInterval);
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
      if (y > (5 * databaseInterval))
        p.status = "offline";
      else if (y > (3 * databaseInterval))
        p.status = "probably offline";
      else if (y > (2.5 * databaseInterval))
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
    if (now - p.saved >= databaseInterval)
      return null;
    return p.presenceArray;
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
    }
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
            md5blks[i >> 2]