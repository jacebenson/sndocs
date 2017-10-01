/*! RESOURCE: /scripts/classes/GwtDate.js */
var GwtDate = Class.create({
    MINUTES_IN_DAY: 1440,
    DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    MONTHS_IN_YEAR: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    AJAX_PROCESSOR: "xmlhttp.do?sysparm_processor=com.glide.schedules.AJAXDate",
    initialize: function(s) {
        if (s) {
            this.deserialize(s);
        } else {
            this.clear();
        }
    },
    clone: function() {
        var newDate = new GwtDate(this.serialize());
        return newDate;
    },
    clear: function() {
        this.year = 0;
        this.month = 0;
        this.day = 0;
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
    },
    serialize: function(dateOnly) {
        var s = this.year + "-" + (this.month + 1) + "-" + this.day;
        if (!dateOnly)
            s += " " + this.formatTime(true);
        return s;
    },
    serializeInUserFormat: function(dateOnly) {
        if (dateOnly)
            return this.formatDate(g_user_date_format);
        else
            return this.formatDate(g_user_date_time_format);
    },
    serializeTimeInUserFormat: function(includeSeconds) {
        var spaceIndex = g_user_date_time_format.indexOf(" ");
        var timeFormat = g_user_date_time_format.substr(spaceIndex + 1);
        if (!includeSeconds)
            timeFormat = timeFormat.replace(/[:\.]ss/, '');
        var d = this.getDateObject(true);
        return formatDate(d, timeFormat);
    },
    deserialize: function(s) {
        this.clear();
        if (typeof s == 'number')
            return this.setFromMs(s);
        var components = s.split(" ");
        if (components) {
            var parts = components[0].split("-");
            this.year = parts[0] * 1;
            if (parts.length > 1) {
                this.month = (parts[1] * 1) - 1;
                if (parts.length > 2) {
                    this.day = parts[2] * 1;
                }
            }
            if (components.length >= 2) {
                var parts = components[1].split(":");
                this.hour = parts[0] * 1;
                if (parts.length > 1) {
                    this.minute = parts[1] * 1;
                }
                if (parts.length > 2) {
                    this.second = parts[2] * 1;
                }
            }
        }
    },
    getYear: function() {
        return this.year;
    },
    getMonth: function() {
        return this.month;
    },
    getDay: function() {
        return this.day;
    },
    getHour: function() {
        return this.hour;
    },
    getMinute: function() {
        return this.minute;
    },
    getSecond: function() {
        return this.second;
    },
    getTime: function() {
        var h = this.hour * 60;
        var m = this.minute * 1;
        if (this.second >= 30) {
            m++;
        }
        return h + m;
    },
    getDaysInMonth: function() {
        if ((this.month == 1) && ((this.year % 4) == 0) && (((this.year % 100) != 0) || ((this.year % 400) == 0))) {
            return 29;
        } else {
            return this.DAYS_IN_MONTH[this.month];
        }
    },
    setYear: function(year) {
        this.year = year;
    },
    setMonth: function(month) {
        this.month = month;
    },
    setDay: function(day) {
        this.day = day;
    },
    setHour: function(hour) {
        this.hour = hour;
    },
    setMinute: function(minute) {
        this.minute = minute;
    },
    setSecond: function(second) {
        this.second = second;
    },
    setStartOfDay: function() {
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
    },
    setEndOfDay: function() {
        this.hour = 23;
        this.minute = 59;
        this.second = 59;
    },
    setFromJsDate: function(date) {
        this.year = date.getFullYear();
        this.month = date.getMonth();
        this.day = date.getDate();
        this.hour = date.getHours();
        this.minute = date.getMinutes();
        this.second = date.getSeconds();
    },
    setFromMs: function(milliseconds) {
        this.setFromJsDate(new Date(milliseconds));
    },
    setFromDate: function(date) {
        this.year = date.getYear();
        this.month = date.getMonth();
        this.day = date.getDay();
        this.hour = date.getHour();
        this.minute = date.getMinute();
        this.second = date.getSecond();
    },
    setFromInt: function(intDate, intTime) {
        this.clear();
        var year = Math.floor(intDate / 10000);
        this.year = year;
        this.month = (Math.floor((intDate - (year * 10000)) / 100)) - 1;
        this.day = intDate % 100;
        if (intTime) {
            var hour = Math.floor(intTime / 10000);
            this.hour = hour;
            this.minute = Math.floor((intTime - (hour * 10000)) / 100);
            this.second = intTime % 100;
        }
    },
    formatTime: function(includeSeconds) {
        var h = doubleDigitFormat(this.hour);
        var m = doubleDigitFormat(this.minute);
        if (!includeSeconds)
            return h + ":" + m;
        return h + ":" + m + ":" + doubleDigitFormat(this.second);
    },
    formatDate: function(format) {
        var d = this.getDateObject(false);
        d.setYear(this.year);
        d.setMonth(this.month);
        d.setDate(this.day);
        d.setHours(this.hour);
        d.setMinutes(this.minute);
        d.setSeconds(this.second);
        return formatDate(d, format);
    },
    getDateObject: function(includeTime) {
        var d = new Date();
        d.setDate(1);
        d.setYear(this.year);
        d.setMonth(this.month);
        d.setDate(this.day);
        if (includeTime) {
            d.setHours(this.getHour());
            d.setMinutes(this.getMinute());
            d.setSeconds(this.getSecond());
        } else {
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
        }
        return d;
    },
    isAllDay: function(toDate) {
        return ((this.getTime() == 0) && (toDate.getTime() >= (this.MINUTES_IN_DAY)));
    },
    compare: function(otherDate, includeTimes) {
        if (this.getYear() != otherDate.getYear()) {
            return this.getYear() - otherDate.getYear();
        }
        if (this.getMonth() != otherDate.getMonth()) {
            return this.getMonth() - otherDate.getMonth();
        }
        if (this.getDay() != otherDate.getDay()) {
            return this.getDay() - otherDate.getDay();
        }
        if (includeTimes) {
            if (this.getHour() != otherDate.getHour()) {
                return this.getHour() - otherDate.getHour();
            }
            if (this.getMinute() != otherDate.getMinute()) {
                return this.getMinute() - otherDate.getMinute();
            }
            if (this.getSecond() != otherDate.getSecond()) {
                return this.getSecond() - otherDate.getSecond();
            }
        }
        return 0;
    },
    addSeconds: function(seconds) {
        if (seconds < 0)
            return this.subtractSeconds(seconds * -1);
        for (var i = 0; i < seconds; i++) {
            this._incrementSecond();
        }
    },
    addMinutes: function(minutes) {
        if (minutes < 0)
            return this.subtractMinutes(minutes * -1);
        for (var i = 0; i < minutes; i++) {
            this._incrementMinute();
        }
    },
    addHours: function(hours) {
        if (hours < 0)
            return this.subtractHours(hours * -1);
        for (var i = 0; i < hours; i++) {
            this._incrementHour();
        }
    },
    addDays: function(days) {
        for (var i = 0; i < days; i++) {
            this._incrementDay();
        }
    },
    addMonths: function(months) {
        for (var i = 0; i < months; i++) {
            this._incrementMonth();
        }
        if (this.day > this.getDaysInMonth()) {
            this.day = this.getDaysInMonth();
        }
    },
    addYears: function(years) {
        this.year += years;
    },
    subtractSeconds: function(seconds) {
        for (var i = 0; i < seconds; i++) {
            this._decrementSecond();
        }
    },
    subtractMinutes: function(minutes) {
        for (var i = 0; i < minutes; i++) {
            this._decrementMinute();
        }
    },
    subtractHours: function(hours) {
        for (var i = 0; i < hours; i++) {
            this._decrementHour();
        }
    },
    subtractDays: function(days) {
        for (var i = 0; i < days; i++) {
            this._decrementDay();
        }
    },
    subtractMonths: function(months) {
        for (var i = 0; i < months; i++) {
            this._decrementMonth();
        }
        if (this.day > this.getDaysInMonth()) {
            this.day = this.getDaysInMonth();
        }
    },
    subtractYears: function(years) {
        this.year -= years;
    },
    _incrementSecond: function() {
        this.second++;
        if (this.second > 59) {
            this.second = 0;
            this._incrementMinute();
        }
    },
    _incrementMinute: function() {
        this.minute++;
        if (this.minute > 59) {
            this.minute = 0;
            this._incrementHour();
        }
    },
    _incrementHour: function() {
        this.hour++;
        if (this.hour > 23) {
            this.hour = 0;
            this._incrementDay();
        }
    },
    _incrementDay: function() {
        this.day++;
        if (this.day > this.getDaysInMonth()) {
            this.day = 1;
            this._incrementMonth();
        }
    },
    _incrementMonth: function() {
        this.month++;
        if (this.month >= 12) {
            this.year++;
            this.month = 0;
        }
    },
    _decrementSecond: function() {
        this.second--;
        if (this.second < 0) {
            this.second = 59;
            this._decrementMinute();
        }
    },
    _decrementMinute: function() {
        this.minute--;
        if (this.minute < 0) {
            this.minute = 59;
            this._decrementHour();
        }
    },
    _decrementHour: function() {
        this.hour--;
        if (this.hour < 0) {
            this.hour = 23;
            this._decrementDay();
        }
    },
    _decrementDay: function() {
        this.day--;
        if (this.day == 0) {
            this._decrementMonth();
            this.day = this.getDaysInMonth();
        }
    },
    _decrementMonth: function() {
        this.month--;
        if (this.month < 0) {
            this.year--;
            this.month = 11;
        }
    },
    now: function() {
        var parms = "&sysparm_type=now";
        var response = serverRequestWait(this.AJAX_PROCESSOR + parms);
        var xml = response.responseXML;
        var e = xml.documentElement;
        this.clear();
        this.deserialize(e.getAttribute("now"));
        return this;
    },
    getCurrentTimeZone: function() {
        var parms = "&sysparm_type=now";
        var response = serverRequestWait(this.AJAX_PROCESSOR + parms);
        var xml = response.responseXML;
        var e = xml.documentElement;
        return e.getAttribute("time_zone");
    },
    getDayOfWeek: function() {
        var parms = "&sysparm_type=day_of_week&date=" + this.serialize(true);
        var response = serverRequestWait(this.AJAX_PROCESSOR + parms);
        var xml = response.responseXML;
        var e = xml.documentElement;
        return e.getAttribute("day_of_week");
    },
    getCurrentMonth: function() {
        return this.MONTHS_IN_YEAR[this.getMonth()];
    },
    getWeekNumber: function() {
        var parms = "&sysparm_type=week_number&date=" + this.serialize(true);
        var response = serverRequestWait(this.AJAX_PROCESSOR + parms);
        var xml = response.responseXML;
        var e = xml.documentElement;
        return e.getAttribute("week_number");
    },
    toString: function() {
        return this.formatDate('yyyy-MM-dd HH:mm:ss');
    }
});;