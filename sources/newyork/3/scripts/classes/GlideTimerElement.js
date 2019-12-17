/*! RESOURCE: /scripts/classes/GlideTimerElement.js */
var GlideTimerElement = Class.create({
  initialize: function(name, tmrID) {
    this.name = name;
    this.tmrID = tmrID;
    this._incrementInterval = 1000;
    this._setTimer();
  },
  setValue: function(value) {
    value = this._cleanDate(value);
    var elem = document.getElementById("o" + this.tmrID);
    elem.value = value;
    this.updateTotal();
  },
  setReadOnly: function(readOnly) {
    gel(this.tmrID + "_hour").readOnly = readOnly;
    gel(this.tmrID + "_min").readOnly = readOnly;
    gel(this.tmrID + "_sec").readOnly = readOnly;
    gel(this.name).readOnly = readOnly;
    g_form.setSensitiveDisplayValue(this.name + ".ui_policy_sensitive", readOnly ? 'none' : '');
    return true;
  },
  _cancelTimer: function() {
    if (!this.timerID)
      return;
    clearTimeout(this.timerID);
    this.timerID = null;
    this._timerStarted = null;
    this._timerTicks = 0;
  },
  _setTimer: function() {
    if (!this._timerStarted)
      this._timerStarted = new Date().getTime();
    if (!this._timerTicks)
      this._timerTicks = 0;
    var diff = (new Date().getTime() - this._timerStarted) - (this._timerTicks * this._incrementInterval);
    this.timerID = setTimeout(this._incrementTimer.bind(this), this._incrementInterval - diff);
  },
  _incrementTimer: function() {
    if (!this._isPaused()) {
      var addedTime = this._incrementInterval / 1000;
      var currentTime = this.fields2time() + addedTime;
      if (this._isScrolling)
        this._deferredTime = !!this._deferredTime ? this._deferredTime + addedTime : currentTime;
      else
        this.setIncrementingValue(currentTime);
    }
    this._timerTicks++;
    this._setTimer();
  },
  _isPaused: function() {
    var paused = $(this.tmrID + "_paused");
    return (paused.value == 'true' ? 1 : 0);
  },
  type: function() {
    return "GlideTimerElement";
  },
  updateTotal: function() {
    var e = $(this.tmrID).getAttribute("data-ref");
    var setField = $(e);
    var currentTime = this.fields2time();
    var otime = this.duration2time();
    var newSetTime = parseInt(otime || 0) + parseInt(currentTime);
    this.setTimer(newSetTime, setField);
  },
  fields2time: function() {
    var currentTime = 0;
    var eHour = $(this.tmrID + "_hour");
    var eMin = $(this.tmrID + "_min");
    var eSec = $(this.tmrID + "_sec");
    if (eHour.value)
      currentTime = 60 * 60 * parseInt((isNaN(eHour.value) ? 0 : eHour.value), 10);
    if (eMin.value)
      currentTime += 60 * parseInt((isNaN(eMin.value) ? 0 : eMin.value), 10);
    if (eSec.value)
      currentTime += parseInt((isNaN(eSec.value) ? 0 : eSec.value), 10);
    return currentTime;
  },
  setTotalValue: function(currentTime) {
    var eCalculated = $(this.tmrID);
    var eHour = $(this.tmrID + "_hour");
    var eMin = $(this.tmrID + "_min");
    var eSec = $(this.tmrID + "_sec");
    var hour = doubleDigitFormat(sGetHours(currentTime));
    var minute = doubleDigitFormat(sGetMinutes(currentTime));
    var second = doubleDigitFormat(sGetSeconds(currentTime));
    eCalculated.value = "0 " + hour + ":" + minute + ":" + second;
    eSec.value = second;
    eMin.value = minute;
    eHour.value = hour;
    this.updateTotal();
  },
  setIncrementingValue: function(currentTime) {
    var eCalculated = $(this.tmrID);
    var eHour = $(this.tmrID + "_hour");
    var eMin = $(this.tmrID + "_min");
    var eSec = $(this.tmrID + "_sec");
    var hour = doubleDigitFormat(sGetHours(currentTime));
    var minute = doubleDigitFormat(sGetMinutes(currentTime));
    var second = doubleDigitFormat(sGetSeconds(currentTime));
    var hourUpdate = (parseInt(eMin.value) >= 59 ? true : false);
    eCalculated.value = "0 " + hour + ":" + minute + ":" + second;
    var updateTotal = false;
    if (second != eSec.value) {
      eSec.value = second;
      updateTotal = true;
    }
    if (minute != eMin.value) {
      eMin.value = minute;
      updateTotal = true;
    }
    if (hourUpdate && hour != eHour.value) {
      eHour.value = hour;
      updateTotal = true;
    }
    if (updateTotal)
      this.updateTotal();
  },
  setTimer: function(newSetTime, setField) {
    var tHour = $("o" + this.tmrID + "_hour");
    var tMin = $("o" + this.tmrID + "_min");
    var tSec = $("o" + this.tmrID + "_sec");
    var hour = doubleDigitFormat(sGetHours(newSetTime));
    var minute = doubleDigitFormat(sGetMinutes(newSetTime));
    var second = doubleDigitFormat(sGetSeconds(newSetTime));
    tHour.innerHTML = hour;
    tMin.innerHTML = minute;
    tSec.innerHTML = second;
    if (hour > 24) {
      var days = parseInt(hour / 24);
      hour = days + " " + (hour - (days * 24));
    }
    setField.value = hour + ":" + minute + ":" + second;
  },
  duration2time: function() {
    var currentTime = $("o" + this.tmrID).value;
    return this.duration2timeValue(currentTime);
  },
  duration2timeValue: function(currentTime) {
    var days = 0;
    if (currentTime == 0)
      currentTime = "00:00:00";
    if (currentTime.indexOf(" ") > -1) {
      var sp = currentTime.indexOf(" ");
      days = currentTime.substring(0, sp);
      currentTime = currentTime.substring(sp + 1, currentTime.length);
    }
    var hours = parseInt(currentTime.substring(0, 2), 10);
    var minutes = parseInt(currentTime.substring(3, 5), 10);
    var seconds = parseInt(currentTime.substring(6, 8), 10);
    currentTime = ((60 * 60) * 24) * days;
    currentTime += (60 * 60) * hours;
    currentTime += 60 * minutes;
    currentTime += seconds;
    return currentTime;
  },
  _cleanDate: function(dateToClean) {
    if (dateToClean.indexOf(" ") > -1) {
      var sp = dateToClean.indexOf(" ");
      days = dateToClean.substring(0, sp);
      if (days.indexOf('-') != -1)
        days = Math.floor(new Date(days) / 8.64e7);
      dateToClean = days + " " + dateToClean.substring(sp + 1, dateToClean.length);
    }
    return dateToClean;
  },
  toString: function() {
    return 'GlideTimerElement';
  }
});;