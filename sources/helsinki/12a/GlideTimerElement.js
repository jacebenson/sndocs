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
      setReadOnly: function(disabled) {
        gel(this.tmrID + "_hour").disabled = disabled;
        gel(this.tmrID + "_min").disabled = disabled;
        gel(this.tmrID + "_sec").disabled = disabled;
        gel(this.name).disabled = disabled;
      },
      _cancelTimer: function() {
        if (!this.timerID)
          return;
        clearTimeout(this.timerID);
        this.timerID = null;
      },
      _setTimer: function() {
        this.timerID = setTimeout(this._incrementTimer.bind(this), this._incrementInterval);
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
          v