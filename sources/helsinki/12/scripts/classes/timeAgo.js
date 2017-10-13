/*! RESOURCE: /scripts/classes/timeAgo.js */
$j(function($) {
  'use strict';
  var ATTR = 'timeago';
  var TA_ATTRS = 'timeago-attrs';
  var EMPTY = 'sn-timeago-empty-msg';
  var settings = {
    allowFuture: true,
    strings: {}
  };
  updateMessages();
  findElements();
  setInterval(findElements, 30 * 1000);
  CustomEvent.observe('list_content_changed', findElements);
  CustomEvent.observe('date_field_changed', function(payload) {
    updateFormElement(payload.id, payload.dateString);
  });

  function findElements(root) {
    var elements = (root || document).querySelectorAll('[' + ATTR + ']');
    var i = elements.length;
    while (i--)
      updateElement(elements[i]);
  }

  function updateFormElement(id, dateString) {
    var element = document.getElementById(id);
    if (element) {
      if (g_user_date_time_format) {
        var int = getDateFromFormat(dateString, g_user_date_time_format);
        int = convertTimezone(int, false);
        dateString = new Date(int).toISOString().split('.')[0].replace('T', ' ');
      }
      element.setAttribute(ATTR, dateString);
      element.setAttribute('title', dateString);
      updateElement(element, true);
    }
  }

  function updateMessages() {
    var msgs = getMessages([
      'prefix_ago',
      'prefix_from now',
      'suffix_ago',
      'suffix_from now',
      'just now',
      'less than a minute',
      'about a minute',
      '%d minutes',
      'about an hour',
      'about %d hours',
      'a day',
      '%d days',
      'about a month',
      '%d months',
      'about a year',
      '%d years',
      '(empty)'
    ]);
    settings.strings = {
      prefixAgo: msgs['prefix_ago'],
      prefixFromNow: msgs['prefix_from now'],
      suffixAgo: msgs['suffix_ago'],
      suffixFromNow: msgs["suffix_from now"],
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
      wordSeparator: msgs["timeago_number_separator"],
      numbers: [],
      empty: msgs["(empty)"]
    };
  }

  function allowFuture(bool) {
    settings.allowFuture = bool;
  }

  function toWords(distanceMillis) {
    var $l = settings.strings;
    var seconds = Math.abs(distanceMillis) / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var years = days / 365;
    var prefix = $l.prefixAgo;
    var suffix = $l.suffixAgo;
    if (seconds < 45)
      prefix = suffix = '';
    if (settings.allowFuture) {
      if (distanceMillis < 0) {
        prefix = $l.prefixFromNow;
        suffix = $l.suffixFromNow;
      }
    }

    function substitute(stringOrFunction, number) {
      var string = isFunction(stringOrFunction) ?
        stringOrFunction(number, distanceMillis) : stringOrFunction;
      var value = ($l.numbers && $l.numbers[number]) || number;
      return string.replace(/%d/i, value);
    }
    var words = seconds < 45 && (distanceMillis >= 0 || !settings.allowFuture) && substitute($l.justNow, Math.round(seconds)) ||
      seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
      seconds < 90 && substitute($l.minute, 1) ||
      minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
      minutes < 90 && substitute($l.hour, 1) ||
      hours < 24 && substitute($l.hours, Math.round(hours)) ||
      hours < 42 && substitute($l.day, 1) ||
      days < 30 && substitute($l.days, Math.ceil(days)) ||
      days < 45 && substitute($l.month, 1) ||
      days < 365 && substitute($l.months, Math.round(days / 30)) ||
      years < 1.5 && substitute($l.year, 1) ||
      substitute($l.years, Math.round(years));
    var separator = $l.wordSeparator === undefined ? " " : $l.wordSeparator;
    return [prefix, words, suffix].join(separator).trim();
  }

  function isFunction(value) {
    return typeof value === 'function';
  }

  function isNumber(value) {
    return typeof value === 'number';
  }

  function isDate(value) {
    return Object.prototype.toString.call(value) === '[object Date]';
  }

  function isNull(value) {
    return (value === null || value === '' || typeof value === 'undefined')
  }

  function getEmptyMessage(element) {
    var attr = element.getAttribute(EMPTY);
    if (attr)
      return attr;
    return settings.strings.empty;
  }

  function parse(iso8601) {
    if (isDate(iso8601))
      return iso8601;
    if (isNull(iso8601))
      return null;
    if (isNumber(iso8601))
      return parseInt(iso8601, 10);
    return new Date(parseDateString(iso8601));
  }

  function parseDateString(iso8601) {
    var s = iso8601.trim();
    s = s.replace(/\.\d+/, "");
    s = s.replace(/-/, "/").replace(/-/, "/");
    s = s.replace(/T/, " ").replace(/Z/, " UTC");
    s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2");
    return s;
  }

  function updateElement(element, isLocalTime) {
    var value = element.getAttribute(ATTR);
    var time = parse(value);
    if (!isDate(time) || isNaN(time.getTime())) {
      return element.innerHTML = isNull(value) ? getEmptyMessage(element) : value;
    }
    var timeInWords = isLocalTime ? timeFromNow(time) : correctedTimeFromNow(time);
    var attrToSet = element.getAttribute(TA_ATTRS);
    if (attrToSet == 'title' && element.hasAttribute('data-original-title'))
      element.setAttribute('data-original-title', timeInWords);
    else
      element.setAttribute(attrToSet, timeInWords);
    if (element.hasClassName('date-timeago'))
      element.innerHTML = timeInWords;
  }

  function updateInterval(diff) {
    diff = Math.abs(diff);
    var SEC = 1000;
    var MIN = 60 * SEC;
    var HR = 60 * MIN;
    if (diff < MIN)
      return 2 * SEC;
    if (diff < (30 * MIN))
      return 12 * SEC;
    if (diff < HR)
      return MIN;
    if (diff < (8 * HR))
      return 20 * MIN;
    return 24 * HR;
  }

  function correctedTimeFromNow(date) {
    var isUserRecordTZ = typeof g_tz_user_offset == 'undefined' ? true : g_tz_user_offset;
    var offset = isUserRecordTZ ? new Date().getTimezoneOffset() * 60000 - Math.abs(g_tz_offset) : 0;
    return timeBetween(Date.now() + offset, addTimeZone(date));
  }

  function timeFromNow(date) {
    return timeBetween(Date.now(), date);
  }

  function timeBetween(date1, date2) {
    return toWords(date1 - date2);
  }

  function convertTimezone(date, toUTC) {
    var timeZoneCorrection = (typeof g_tz_offset === 'number') ? Math.abs(g_tz_offset) : new Date().getTimezoneOffset() * 60000;
    if (toUTC)
      return date + timeZoneCorrection;
    else
      return date - timeZoneCorrection;
  }

  function removeTimeZone(time) {
    return convertTimezone(time, true);
  }

  function addTimeZone(time) {
    return convertTimezone(time, false);
  }

  function setTimeagoValue(id, date) {
    if (isDate(date))
      date = date.toISOString();
    var element = document.querySelector(id) || document.getElementById(id);
    if (element)
      element.setAttribute(ATTR, date);
    updateElement(element);
  }
});;