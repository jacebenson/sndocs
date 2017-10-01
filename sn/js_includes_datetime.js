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