/*! RESOURCE: /scripts/classes/nowapi/util/StopWatch.js */
(function(global) {
  "use strict";
  var StopWatch = function() {
    StopWatch.prototype.initialize.apply(this, arguments);
  };

  function doubleDigitFormat(num) {
    if (num >= 10)
      return num;
    return "0" + num;
  }

  function tripleDigitFormat(num) {
    if (num >= 100)
      return num;
    if (num >= 10)
      return "0" + doubleDigitFormat(num);
    return "00" + num;
  }
  var objPrototype = {
    MILLIS_IN_SECOND: 1000,
    MILLIS_IN_MINUTE: 60 * 1000,
    MILLIS_IN_HOUR: 60 * 60 * 1000,
    initialize: function(started) {
      this.started = started || new Date();
    },
    getTime: function() {
      var now = new Date();
      return now.getTime() - this.started.getTime();
    },
    restart: function() {
      this.initialize();
    },
    jslog: function(msg, src, date) {
      global.log('[' + this.toString() + '] ' + msg, src, date);
      return;
    },
    toString: function() {
      return this.formatISO(this.getTime());
    },
    formatISO: function(millis) {
      var hours = 0,
        minutes = 0,
        seconds = 0,
        milliseconds = 0;
      if (millis >= this.MILLIS_IN_HOUR) {
        hours = parseInt(millis / this.MILLIS_IN_HOUR);
        millis = millis - (hours * this.MILLIS_IN_HOUR);
      }
      if (millis >= this.MILLIS_IN_MINUTE) {
        minutes = parseInt(millis / this.MILLIS_IN_MINUTE);
        millis = millis - (minutes * this.MILLIS_IN_MINUTE);
      }
      if (millis >= this.MILLIS_IN_SECOND) {
        seconds = parseInt(millis / this.MILLIS_IN_SECOND);
        millis = millis - (seconds * this.MILLIS_IN_SECOND);
      }
      milliseconds = parseInt(millis);
      return doubleDigitFormat(hours) + ":" + doubleDigitFormat(minutes) + ":" + doubleDigitFormat(seconds) +
        "." + tripleDigitFormat(milliseconds);
    },
    type: "StopWatch"
  };
  StopWatch.prototype = objPrototype;
  global.GlideStopWatch = StopWatch;
})(window.nowapi);;