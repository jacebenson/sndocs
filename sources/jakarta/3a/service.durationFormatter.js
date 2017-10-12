/*! RESOURCE: /scripts/app.ng_chat/util/service.durationFormatter.js */
angular.module('sn.connect.util').service('durationFormatter', function($filter, i18n) {
  'use strict';
  var units = {
    years: 365 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    minutes: 60 * 1000,
    seconds: 1000
  };
  var names;
  i18n.getMessages([
      'month', 'months',
      'week', 'weeks',
      'day', 'days',
      'hour', 'hours'
    ],
    function(results) {
      names = results;
    });

  function durationYearFn(duration, startTimestamp, endTimestamp) {
    return function() {
      if (duration.years > 0) {
        var start = Math.abs(Date.now() - startTimestamp);
        var end = Math.abs(Date.now() - endTimestamp);
        var date = new Date((start > end) ? startTimestamp : endTimestamp);
        return $filter('date')(date, 'mediumDate');
      }
    };
  }

  function durationGeneralFn(duration, single, plural, format) {
    return function() {
      if (duration)
        return stringFormat(duration + ' ' + ((duration === 1) ? single : plural), format);
    }
  }

  function stringFormat(value, format) {
    return format.replace(/\{0}/, value);
  }
  return {
    format: function(timestamp, format) {
      return this.formatWithRange(Date.now(), timestamp, format);
    },
    formatWithRange: function(startTimestamp, endTimestamp, format) {
      format = format || "{0}";
      var duration = {};
      var remaining = Math.abs(startTimestamp - endTimestamp);
      angular.forEach(units, function(value, key) {
        duration[key] = Math.floor(remaining / value);
        remaining -= duration[key] * value;
      });
      var durationFunction = [
        durationYearFn(duration.years, startTimestamp, endTimestamp),
        durationGeneralFn(duration.months, names['month'], names['months'], format),
        durationGeneralFn(duration.weeks, names['week'], names['weeks'], format),
        durationGeneralFn(duration.days, names['day'], names['days'], format),
        durationGeneralFn(duration.hours, names['hour'], names['hours'], format)
      ];
      for (var i = 0; i < durationFunction.length; ++i) {
        var value = durationFunction[i]();
        if (value)
          return value;
      }
      return stringFormat(duration.minutes + ':' +
        (duration.seconds < 10 ? '0' + duration.seconds : duration.seconds), format);
    }
  }
});;