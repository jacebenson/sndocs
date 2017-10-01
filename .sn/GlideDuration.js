/*! RESOURCE: /scripts/classes/GlideDuration.js */
var GlideDuration = Class.create({
    MAX_UNIT_DAYS: 4,
    MAX_UNIT_HOURS: 3,
    MAX_UNIT_MINUTES: 2,
    MAX_UNIT_SECONDS: 1,
    initialize: function(value, item) {
        this.values = new Array();
        var gMessage = new GwtMessage();
        var values = ["Days", "Hours", "Minutes", "Seconds"];
        var answer = gMessage.getMessages(values);
        this.daysMessage = answer["Days"];
        this.hourMessage = answer["Hours"];
        this.minutesMessage = answer["Minutes"];
        this.secondsMessage = answer["Seconds"];
        this.maxLevel = this.MAX_UNIT_DAYS;
        if (item) {
            this.item = item;
            this.maxLevel = this._parseMaxUnit(this.item.getNamedAttribute('max_unit'));
        }
        if (value)
            this.values = GlideDuration.parseDurationToParts(value);
        for (var i = this.values.length; i < 4; i++)
            this.values[i] = "0";
    },
    buildHTML: function(parent) {
        this.parent = parent;
        this.days = 0;
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
        if (this.maxLevel == this.MAX_UNIT_DAYS) {
            this._addSpan(this.daysMessage);
            this.days = this._addInput("dur_day", this.getDays());
            this.days.maxLength = "5";
            this.days.style.marginRight = "5px";
        } else
            this.hour = (this.getDays() * 24);
        if (this.maxLevel >= this.MAX_UNIT_HOURS) {
            this._addSpan(this.hourMessage);
            this.hour = this._addInput("dur_hour", this.hour + parseInt(this.getHours(), 10));
            if (this.maxLevel == this.MAX_UNIT_HOURS)
                this.hour.maxLength = "7";
            this._addSpan(":");
        } else
            this.minute = ((this.hour + parseInt(this.getHours(), 10)) * 60);
        if (this.maxLevel == this.MAX_UNIT_MINUTES)
            this._addSpan(this.minutesMessage);
        if (this.maxLevel >= this.MAX_UNIT_MINUTES) {
            this.minute = this._addInput("dur_min", this.minute + parseInt(this.getMinutes(), 10));
            if (this.maxLevel == this.MAX_UNIT_MINUTES)
                this.minute.maxLength = "9";
            this._addSpan(":");
        } else
            this.second = ((this.minute + parseInt(this.getMinutes(), 10)) * 60);
        if (this.maxLevel == this.MAX_UNIT_SECONDS)
            this._addSpan(this.secondsMessage);
        this.second = this._addInput("dur_sec", this.second + parseInt(this.getSeconds(), 10));
        if (this.maxLevel == this.MAX_UNIT_SECONDS)
            this.second.maxLength = "10";
    },
    _addInput: function(id, value) {
        var ic = cel("input", this.parent);
        ic.className = 'filerTableInput form-control';
        ic.id = id;
        ic.size = "2";
        ic.maxLength = "2";
        ic.value = value;
        return ic;
    },
    _addSpan: function(text) {
        var sp = cel("label", this.parent);
        sp.className = 'condition';
        sp.innerHTML = text;
    },
    getDays: function() {
        return this.values[0];
    },
    getHours: function() {
        return this.values[1];
    },
    getMinutes: function() {
        return this.values[2];
    },
    getSeconds: function() {
        return this.values[3];
    },
    getValue: function() {
        var day = 0;
        var hour = 0;
        var min = 0;
        var sec = 0;
        if (this.maxLevel == this.MAX_UNIT_DAYS)
            day = parseInt(this.days.value, 10);
        if (this.maxLevel >= this.MAX_UNIT_HOURS)
            hour = parseInt(this.hour.value, 10);
        if (this.maxLevel >= this.MAX_UNIT_MINUTES)
            min = parseInt(this.minute.value, 10);
        if (this.maxLevel >= this.MAX_UNIT_SECONDS)
            sec = parseInt(this.second.value, 10);
        if (sec >= 60) {
            min += Math.floor(sec / 60);
            sec = sec % 60;
        }
        if (min >= 60) {
            hour += Math.floor(min / 60);
            min = min % 60;
        }
        if (hour >= 24) {
            day += Math.floor(hour / 24);
            hour = hour % 24;
        }
        if (!day || day == null)
            day = 0;
        if (!hour || hour == null)
            hour = 0;
        if (!min || min == null)
            min = 0;
        if (!sec || sec == null)
            sec = 0;
        this.values[0] = day + '';
        this.values[1] = hour + '';
        this.values[2] = min + '';
        this.values[3] = sec + '';
        return day + " " + hour + ":" + min + ":" + sec;
    },
    _parseMaxUnit: function(max_unit) {
        switch (max_unit) {
            case 'hours':
                maxLevel = this.MAX_UNIT_HOURS;
                break;
            case 'minutes':
                maxLevel = this.MAX_UNIT_MINUTES;
                break;
            case 'seconds':
                maxLevel = this.MAX_UNIT_SECONDS;
                break;
            default:
                maxLevel = this.MAX_UNIT_DAYS;
        }
        return maxLevel;
    }
});
GlideDuration.parseDurationToParts = function(value) {
    var MS_IN_DAY = 86400000;
    if (value.indexOf("javascript:") == 0) {
        var s = value.split("'");
        value = s[1];
    }
    var parts = value.split(" ");
    if (parts.length == 2) {
        var times = parts[1].split(":");
        for (var i = 0; i < times.length; i++)
            parts[1 + i] = times[i];
        var dateParts = parts[0].split("-");
        if (dateParts.length == 3)
            parts[0] = parseInt(Date.parse(dateParts[1] + '/' + dateParts[2] + '/' + dateParts[0] + ' 00:00:00 UTC')) / MS_IN_DAY;
    }
    return parts;
};