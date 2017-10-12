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
            var addedTime = this._incrementInterva