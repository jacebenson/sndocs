/*! RESOURCE: /scripts/GwtListEditDuration.js */
var GwtListEditDuration = Class.create(GwtListEditWindow, {
    MS_IN_DAY: 86400000,
    MAX_UNIT_DAYS: 4,
    MAX_UNIT_HOURS: 3,
    MAX_UNIT_MINUTES: 2,
    MAX_UNIT_SECONDS: 1,
    createEditControls: function() {
        this.setDateParts(this.editor.getValue());
        this.gMessage = new GwtMessage();
        this.gMessage.getMessages(['Hours', 'Days', 'day', 'hour', 'minute', 'second', 'minutes', 'seconds']);
        this.renderControl();
    },
    onKeyTab: function(evt) {
        evt.stop();
        if (evt.shiftKey) {
            if (!this._previousChoice(evt)) {
                this.saveAndClose();
                this.prevColumn();
            }
        } else if (!this._nextChoice(evt)) {
            this.saveAndClose();
            this.nextColumn();
        }
    },
    _previousChoice: function(e) {
        var previous = this.focusElement.up().previousSibling;
        if (previous)
            previous = previous.previousSibling;
        if (previous == null)
            return false;
        this.focusElement = $(previous).select("input")[0];
        this.focusEditor();
        return true;
    },
    _nextChoice: function(e) {
        var next = this.focusElement.up().nextSibling;
        if (next)
            next = next.nextSibling;
        if (next == null)
            return false;
        this.focusElement = $(next).select("input")[0];
        this.focusEditor();
        return true;
    },
    setDateParts: function(dateStr) {
        if (dateStr.length <= 0) {
            this.days = 0;
            this.hours = 0;
            this.minutes = 0;
            this.seconds = 0;
        } else {
            var dateTime = dateStr.split(" ");
            var dateParts = dateTime[0].split("-");
            var timeParts = dateTime[1].split(":");
            this.days = parseInt(Date.parse(dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0] + " 00:00:00 UTC") / this.MS_IN_DAY);
            this.hours = timeParts[0];
            this.minutes = timeParts[1];
            this.seconds = timeParts[2];
            var max_level = this._getUnitLevel();
            if (max_level <= this.MAX_UNIT_HOURS) {
                this.hours = parseInt(this.hours, 10) + (this.days * 24);
                this.days = 0;
            }
            if (max_level <= this.MAX_UNIT_MINUTES) {
                this.minutes = parseInt(this.minutes, 10) + (this.hours * 60);
                this.hours = 0;
            }
            if (max_level <= this.MAX_UNIT_SECONDS) {
                this.seconds = parseInt(this.seconds, 10) + (this.minutes * 60);
                this.minutes = 0;
            }
        }
    },
    renderControl: function() {
        var table = cel("table");
        var cls = '';
        if (this.doctype)
            cls = 'form-control list-edit-input';
        table.cellPadding = 0;
        table.style.backgroundColor = "EEEEEE";
        var tbody = cel("tbody", table);
        var tr = cel("tr", tbody);
        var max_level = this._getUnitLevel();
        var td = cel("td", tr);
        var days;
        if (max_level == this.MAX_UNIT_DAYS) {
            td.innerHTML = this.gMessage.getMessage("Days") + "&nbsp;";
            td = cel("td", tr);
            days = cel("input", td);
            days.id = "dur_day";
            days.className = cls;
            days.size = "2";
            days.maxLength = "5";
            days.style.marginRight = "5px";
            days.value = this.days
            td = cel("td", tr);
        }
        var hours;
        if (max_level >= this.MAX_UNIT_HOURS) {
            td.innerHTML = this.gMessage.getMessage("Hours") + "&nbsp;";
            td = cel("td", tr);
            hours = cel("input", td);
            hours.id = "dur_hour";
            hours.className = cls;
            hours.size = max_level == this.MAX_UNIT_HOURS ? "3" : "2";
            hours.maxLength = max_level == this.MAX_UNIT_HOURS ? "3" : "2";
            hours.value = this.hours;
            td = cel("td", tr);
            td.innerHTML = ":";
            td = cel("td", tr);
        } else {
            td.innerHTML = this.gMessage.getMessage("Minutes") + "&nbsp;";
        }
        var mins;
        if (max_level >= this.MAX_UNIT_MINUTES) {
            mins = cel("input", td);
            mins.id = "dur_min";
            mins.className = cls;
            mins.size = "2";
            mins.maxLength = "2";
            mins.value = this.minutes;
            td = cel("td", tr);
            td.innerHTML = ":";
            td = cel("td", tr);
        } else {
            td.innerHTML = this.gMessage.getMessage("Seconds") + "&nbsp;";
        }
        var secs = cel("input", td);
        secs.id = "dur_sec";
        secs.className = cls;
        secs.size = "2";
        secs.maxLength = "2";
        secs.value = this.seconds;
        this.setTitle(table);
        this.focusElement = gel("dur_day");
    },
    save: function() {
        var max_level = this._getUnitLevel();
        var day = (max_level == this.MAX_UNIT_DAYS) ? gel("dur_day").value : 0;
        var hour = (max_level >= this.MAX_UNIT_HOURS) ? gel("dur_hour").value : 0;
        var min = (max_level >= this.MAX_UNIT_MINUTES) ? gel("dur_min").value : 0;
        var sec = gel("dur_sec").value;
        if (!day || day == null || !isNumber(day))
            day = 0;
        if (!hour || hour == null || !isNumber(hour))
            hour = 0;
        if (!min || min == null || !isNumber(min))
            min = 0;
        if (!sec || sec == null || !isNumber(sec))
            sec = 0;
        day = parseInt(day, 10);
        hour = parseInt(hour, 10);
        min = parseInt(min, 10);
        sec = parseInt(sec, 10);
        if (max_level == this.MAX_UNIT_SECONDS) {
            min = Math.floor(sec / 60);
            sec = sec % 60;
        }
        if (max_level <= this.MAX_UNIT_MINUTES) {
            hour = Math.floor(min / 60);
            min = min % 60;
        }
        if (max_level <= this.MAX_UNIT_HOURS) {
            day = Math.floor(hour / 24);
            hour = hour % 24;
        }
        var dt = new Date(0);
        dt.setUTCDate(day + 1);
        var dateStr = dt.getUTCFullYear() + "-" + padLeft(dt.getUTCMonth() + 1, 2, '0') + "-" + padLeft(dt.getUTCDate(), 2, '0') + " " +
            padLeft(hour, 2, '0') + ":" + padLeft(min, 2, '0') + ":" + padLeft(sec, 2, '0');
        this.setValue(dateStr);
        this._setRenderValue(day, hour, min, sec);
    },
    _setRenderValue: function(day, hour, min, sec) {
        var dspVal = "";
        if (day > 0)
            dspVal += day + " " + this._getLabel("day", day) + " ";
        if (hour > 0)
            dspVal += hour + " " + this._getLabel("hour", hour) + " ";
        if (min > 0)
            dspVal += min + " " + this._getLabel("minute", min) + " ";
        if (dspVal == "")
            dspVal += sec + " " + this._getLabel("second", sec) + " ";
        this.setRenderValue(dspVal);
    },
    _getLabel: function(label, val) {
        if (val != 1)
            label += "s";
        return this.gMessage.getMessage(label).toLowerCase();
    },
    _getUnitLevel: function() {
        var max_unit = this.editor.tableElement.getNamedAttribute('max_unit');
        if (max_unit == null)
            return this.MAX_UNIT_DAYS;
        switch (max_unit) {
            case 'hours':
                return this.MAX_UNIT_HOURS;
            case 'minutes':
                return this.MAX_UNIT_MINUTES;
            case 'seconds':
                return this.MAX_UNIT_SECONDS;
        }
        return this.MAX_UNIT_DAYS;
    },
    toString: function() {
        return "GwtListEditDuration";
    }
});;