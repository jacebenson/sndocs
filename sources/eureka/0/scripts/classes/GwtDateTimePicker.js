var GwtDateTimePicker = Class.create(GlideWindow, {
  MONTH_NAMES: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  MSGS: ["Go to Today", "Time", "SMTWTFS", "Invalid time", "Save (Enter)", "Cancel (ESC)"],
  initialize: function(dateFieldId, dateTimeFormat, includeTime, positionElement, defaultValue) {
    this.dayCells = [];
    this.cleanup = [];
    this._getMessages();
    this.includeTime = includeTime;
    this.firstDay = Math.min(Math.max(g_date_picker_first_day_of_week - 1, 0), 6);
    GlideWindow.prototype.initialize.call(this, "GwtDateTimePicker", true);
    this.dateFieldId = dateFieldId;
    var dateField = $(dateFieldId);
    if (!defaultValue)
      defaultValue = dateField.value;
    this.selectedDate = getUserDateTime();
    if (defaultValue) {
      var ms = getDateFromFormat(defaultValue, dateTimeFormat);
      if (ms > 0)
        this.selectedDate = new Date(ms);
    }
    this.date = new Date(this.selectedDate);
    this.setFormat(dateTimeFormat);
    this.removeBody();
    this.clearSpacing();
    this.canFocus = false;
    this._createControls();
    if (positionElement)
      this._moveToPosition(positionElement);
    else
      this._moveToPosition(dateField);
    this.setZIndex(10000);
    this.setShim(true);
    this._shimResize();
    this.keyUpFunc = this.onKeyUp.bind(this);
    Event.observe(this.window, "keypress", this.keyUpFunc);
    Event.observe(document, "keypress", this.keyUpFunc);
    this.mouseUpFunc = this.onMouseUp.bindAsEventListener(this);
    Event.observe(document, "mouseup", this.mouseUpFunc);
    this.canFocus = true;
    this.focusEditor();
  },
  destroy: function() {
    for (var i = 0; i < this.cleanup.length; i++) {
      this.cleanup[i].onchange = null;
      this._deregisterDayClick(this.cleanup[i]);
    }
    this.cleanup = [];
    this.dayCells = [];
    this.tbody = null;
    Event.stopObserving(this.window, "keypress", this.keyUpFunc);
    Event.stopObserving(document, "keypress", this.keyUpFunc);
    Event.stopObserving(document, "mouseup", this.mouseUpFunc);
    GlideWindow.prototype.destroy.call(this);
  },
  _getMessages: function() {
    this.msgs = getMessages(this.MSGS.concat(this.MONTH_NAMES));
  },
  _createControls: function() {
    var parent = getFormContentParent();
    this.insert(parent, null);
    this.setWidth(10);
    var html = this._createCalendar();
    this._createOkCancel();
    this.setTitle(html);
    this._showMonth();
  },
  _createCalendar: function() {
    var div = cel("div");
    div.className = "calDiv";
    var table = cel("table", div);
    table.className = "calBorder";
    table.border = 0;
    table.cellSpacing = 0;
    table.cellPadding = 0;
    var tbody = cel("tbody", table);
    var tr = cel("tr", tbody);
    var td = cel("td", tr);
    table = cel("table", td);
    table.className = "calTable";
    table.cellSpacing = 0;
    table.cellPadding = 0;
    var tbody = cel("tbody", table);
    this.tbody = tbody;
    this._createHeader(tbody);
    this._createMonth(tbody);
    if (this.includeTime)
      this._createTime(tbody);
    return div;
  },
  _createHeader: function(tbody) {
    var tr = cel("tr", tbody);
    var cell = cel("td", tr);
    cell.className = "calMonthNavigation pointerhand";
    cell.innerHTML = "&lt;&lt;";
    cell.onclick = this._prevMonth.bind(this);
    this.cleanup.push(cell);
    cell = cel("td", tr);
    cell.id = "GwtDateTimePicker_month"
    cell.className = "calMonthNavigation calText";
    cell.colSpan = 7;
    cell = cel("td", tr);
    cell.className = "calMonthNavigation pointerhand";
    cell.innerHTML = "&gt;&gt;";
    cell.onclick = this._nextMonth.bind(this);
    this.cleanup.push(cell);
  },
  _createMonth: function(tbody) {
    var tr = cel("tr", tbody);
    var daysOfWeek = this.msgs["SMTWTFS"];
    for (var i = 0; i < 9; i++) {
      var cell = cel("td", tr);
      cell.className = "calText calDayColumnHeader";
      if (i > 0 && i < 8) {
        var index = ((i + this.firstDay) % 7) - 1;
        if (index < 0)
          index = 6;
        cell.innerHTML = daysOfWeek.substr(index, 1);
      }
    }
    var dayIndex = 0;
    for (var week = 0; week < 6; week++) {
      tr = cel("tr", tbody);
      for (var dow = 0; dow < 9; dow++) {
        var cell = cel("td", tr);
        if (dow > 0 && dow < 8) {
          cell.className = "calText calCurrentMonthDate";
          var a = cel("a", cell);
          a.id = "GwtDateTimePicker_day" + dayIndex;
          this._registerDayClick(a);
          this.cleanup.push(a);
          a.day = "0";
          a.month = "0";
          a.year = "0";
          this.dayCells[dayIndex] = a;
          dayIndex++;
        }
      }
    }
    tr = cel("tr", tbody);
    cell = cel("td", tr);
    cell.className = "calText calTodayText pointerhand";
    cell.colSpan = 9;
    cell.width = "100%";
    cell.align = "center";
    cell.innerHTML = this.msgs["Go to Today"];
    cell.onclick = this._selectToday.bind(this);
    this.cleanup.push(cell);
  },
  _registerDayClick: function(a) {
    a.onclick = this._selectDay.bindAsEventListener(this);
    a.ondblclick = this._selectDayAndSave.bindAsEventListener(this);
  },
  _deregisterDayClick: function(a) {
    a.onclick = null;
    a.ondblclick = null;
  },
  _createTime: function(tbody) {
    var tr = cel("tr", tbody);
    cell = cel("td", tr);
    cell.className = "calText calTime";
    cell.colSpan = 9;
    cell.width = "100%";
    cell.align = "center";
    var span = cel('span', cell);
    span.innerHTML = this.msgs["Time"] + ": ";
    var input = this._createTextInput('hh');
    input.tabIndex = 1000;
    var hour = this.selectedDate.getHours();
    var ampm = "a";
    if (this.hasAMPM) {
      if (hour == 0)
        hour = 12;
      else if (hour > 11) {
        ampm = "p";
        if (hour > 12)
          hour -= 12;
      }
    }
    input.value = padLeft(hour, 2, '0');
    span.appendChild(input);
    var sep = cel('span', span);
    sep.innerHTML = ":";
    input = this._createTextInput('mm');
    input.value = padLeft(this.selectedDate.getMinutes(), 2, '0');
    input.tabIndex = 1001;
    span.appendChild(input);
    if (this.hasSeconds) {
      sep = cel('span', span);
      sep.innerHTML = ":";
      input = this._createTextInput('ss');
      input.tabIndex = 1002;
      input.value = padLeft(this.selectedDate.getSeconds(), 2, '0');
      span.appendChild(input);
    }
    if (this.hasAMPM) {
      var s = cel("select");
      s.id = 'GwtDateTimePicker_ampm';
      s.className = "calText";
      s.size = 1;
      s.tabIndex = 1003;
      addOption(s, "am", "AM", ampm == "a");
      addOption(s, "pm", "PM", ampm == "p");
      span.appendChild(s);
    }
    tr = cel("tr", tbody);
    cell = cel("td", tr);
    cell.id = "GwtDateTimePicker_error";
    cell.className = "calText calErrorText";
    cell.colSpan = 9;
    cell.width = "100%";
    cell.align = "center";
  },
  _createTextInput: function(id) {
    var input = cel('input');
    input.id = 'GwtDateTimePicker_' + id;
    input.size = "2";
    input.maxLength = "2";
    input.className = "calText calInput";
    input.onchange = this._hideTimeError.bind(this);
    this.cleanup.push(input);
    return input;
  },
  _showMonth: function() {
    var sy = this.selectedDate.getFullYear();
    var sm = this.selectedDate.getMonth();
    var sd = this.selectedDate.getDate();
    var cy = this.date.getFullYear();
    var cm = this.date.getMonth();
    var cd = this.date.getDate();
    inner("GwtDateTimePicker_month", this.msgs[this.MONTH_NAMES[cm]] + " " + cy);
    var d = this._getFirstDay(new Date(this.date));
    for (var ndx = 0; ndx < 42; ndx++) {
      var a = this.dayCells[ndx];
      a.day = d.getDate();
      a.month = d.getMonth();
      a.year = d.getFullYear();
      a.innerHTML = d.getDate();
      var className;
      a.className = "";
      if ((d.getMonth() == sm) && (d.getFullYear() == sy) && (d.getDate() == sd))
        className = "calText calCurrentDate";
      else if ((d.getMonth() == cm) && (d.getFullYear() == cy))
        className = "calText calCurrentMonthDate";
      else {
        className = "calText calOtherMonthDate";
        a.className = "calOtherMonthDateAnchor";
      }
      a.parentNode.className = className;
      d.setDate(d.getDate() + 1);
    }
    this.focusEditor();
  },
  _getFirstDay: function(d) {
    d.setDate(1);
    var dow = d.getDay();
    while (((dow - this.firstDay) % 7) != 0) {
      d.setDate(d.getDate() - 1);
      dow--;
    }
    return d;
  },
  _moveToPosition: function(positionElement) {
    this.offsetLeft = getOffset(positionElement, "offsetLeft");
    this.offsetTop = getOffset(positionElement, "offsetTop");
    var top = this.offsetTop + positionElement.offsetHeight + 1;
    var calHeight = $(this).getHeight();
    var bottomClearance = getBrowserWindowHeight() - $(positionElement).viewportOffset().top - $(positionElement).getHeight();
    if (bottomClearance < calHeight) {
      var headerHeight = 0;
      if (typeof $$ == 'function') {
        var formHeaders = $$("[id$='.form_header']");
        if (formHeaders && formHeaders.length && formHeaders.length > 0) {
          var formHeader = formHeaders[0];
          if (formHeader && typeof formHeader.getHeight == 'function')
            headerHeight = formHeader.getHeight();
        }
      }
      top = Math.max(headerHeight, top - (calHeight - bottomClearance + 2));
    }
    this.container.style.top = top + "px";
    var left = (this.offsetLeft + positionElement.offsetWidth) - this.window.offsetWidth;
    if (left < 0)
      left = 0;
    this.container.style.left = left + "px";
  },
  _createOkCancel: function() {
    if (!this.includeTime) {
      var hdr = this.getHeader();
      hdr.cellSpacing = 0;
      hdr.cellPadding = 0;
      return;
    }
    var b = createImage('images/workflow_approval_rejected.gifx', this.msgs["Cancel (ESC)"], this, this.dismiss);
    b.id = 'GwtDateTimePicker_cancel';
    b.className += ' image_input';
    b.tabIndex = "1005";
    this.addDecoration(b);
    b = createImage('images/workflow_approved.gifx', this.msgs["Save (Enter)"], this, this.save);
    b.id = 'GwtDateTimePicker_ok';
    b.tabIndex = "1004";
    b.className += ' image_input';
    this.addDecoration(b);
  },
  dismiss: function() {
    try {
      this.destroy();
    } catch (e) {}
    return false;
  },
  save: function() {
    if (this.includeTime) {
      var tm = this._getTimeEntry();
      if (tm == null)
        return;
      this.selectedDate.setHours(tm.hour, tm.min, tm.sec);
    }
    this.dismiss();
    var e = gel(this.dateFieldId);
    e.value = formatDate(this.selectedDate, this.dateTimeFormat);
    if (e['onchange'])
      e.onchange();
  },
  focusEditor: function(id) {
    if (!this.canFocus)
      return;
    if (!id)
      id = "GwtDateTimePicker_hh";
    var e = gel(id);
    if (e)
      Field.activate(e);
  },
  onKeyUp: function(e) {
    var e = getEvent(e);
    if (e.keyCode == 27) {
      Event.stop(e);
      this.dismiss();
    } else if (e.keyCode == 13) {
      Event.stop(e);
      this.save();
    }
  },
  onMouseUp: function(e) {
    var e = getEvent(e);
    if (this._isFromMe(e))
      return;
    Event.stop(e);
    this.save();
  },
  _isFromMe: function(e) {
    var div = Event.findElement(e, "DIV");
    while (div) {
      if (div.id == "GwtDateTimePicker")
        return true;
      div = findParentByTag(div, "DIV");
    }
    return false;
  },
  setFormat: function(format) {
    this.dateTimeFormat = format;
    this.hasAMPM = (format.indexOf("a") >= 0);
    this.hasSeconds = (format.indexOf("s") >= 0);
  },
  _prevMonth: function() {
    var d = this.date.getDate();
    var m = this.date.getMonth();
    var y = this.date.getFullYear();
    if (m > 0)
      m--;
    else {
      m = 11;
      y--;
    }
    if (d > this.DAYS_IN_MONTH[m])
      d = this.DAYS_IN_MONTH[m];
    this.date.setDate(1);
    this.date.setMonth(m);
    this.date.setFullYear(y);
    this.date.setDate(d);
    this._showMonth();
  },
  _nextMonth: function() {
    var d = this.date.getDate();
    var m = this.date.getMonth();
    var y = this.date.getFullYear();
    if (m < 11)
      m++;
    else {
      m = 0;
      y++;
    }
    if (d > this.DAYS_IN_MONTH[m])
      d = this.DAYS_IN_MONTH[m];
    this.date.setDate(1);
    this.date.setMonth(m);
    this.date.setFullYear(y);
    this.date.setDate(d);
    this._showMonth();
  },
  _selectToday: function() {
    var today = new Date();
    this.selectedDate.setDate(1);
    this.selectedDate.setFullYear(today.getFullYear());
    this.selectedDate.setMonth(today.getMonth());
    this.selectedDate.setDate(today.getDate())
    this.date = new Date(this.selectedDate);
    if (!this.includeTime)
      this.save();
    else
      this._showMonth();
  },
  _selectDay: function(e) {
    Event.stop(e);
    var cell = Event.element(getEvent(e));
    this.selectedDate.setDate(1);
    this.selectedDate.setFullYear(cell.year);
    this.selectedDate.setMonth(cell.month);
    this.selectedDate.setDate(cell.day);
    this.date = new Date(this.selectedDate);
    if (!this.includeTime)
      this.save();
    else
      this._showMonth();
  },
  _selectDayAndSave: function(e) {
    this._selectDay(e);
    this.save();
  },
  _getTimeEntry: function() {
    var tm = {};
    tm.sec = 0;
    tm.min = 0;
    tm.hour = 0;
    var v = gel("GwtDateTimePicker_hh").value;
    if (!this._isValidTimePart(v, this.hasAMPM ? 1 : 0, this.hasAMPM ? 12 : 23)) {
      this._showTimeError("hh");
      return null;
    }
    tm.hour = parseInt(v, 10);
    if (this.hasAMPM) {
      if (tm.hour == 12)
        tm.hour = 0;
      var ampm = gel("GwtDateTimePicker_ampm");
      if (ampm.selectedIndex == 1)
        tm.hour += 12;
    }
    v = gel("GwtDateTimePicker_mm").value;
    if (!this._isValidTimePart(v, 0, 59)) {
      this._showTimeError("mm");
      return null;
    }
    tm.min = parseInt(v, 10);
    if (this.hasSeconds) {
      v = gel("GwtDateTimePicker_ss").value;
      if (!this._isValidTimePart(v, 0, 59)) {
        this._showTimeError("ss");
        return null;
      }
      tm.sec = parseInt(v, 10);
    }
    return tm;
  },
  _isValidTimePart: function(v, min, max) {
    if (!v || isNaN(v))
      return false;
    var num = parseInt(v, 10);
    if (num < min || num > max)
      return false;
    return true;
  },
  _showTimeError: function(part) {
    var e = $("GwtDateTimePicker_error");
    if (!e)
      return;
    e.innerHTML = "";
    var img = cel("img", e);
    img.src = "images/error_tsk.gifx";
    img.alt = this.msgs["Invalid time"];
    var span = cel("span", e);
    span.innerHTML = this.msgs["Invalid time"];
    this.focusEditor("GwtDateTimePicker_" + part);
  },
  _hideTimeError: function() {
    var e = $("GwtDateTimePicker_error");
    if (!e)
      return;
    e.innerHTML = "";
  },
  type: function() {
    return "GwtDateTimePicker";
  }
});