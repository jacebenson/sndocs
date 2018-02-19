/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: VideoEmbedder */
var VideoEmbedder = {
  embedYouTube: function(video_details) {
    var video_dom = document.getElementById(video_details.dom);
    var iframe = document.createElement('iframe');
    iframe.width = video_details.width || 560;
    iframe.height = video_details.height || 315;
    iframe.src = video_details.url;
    iframe.frameborder = 0;
    iframe.setAttribute("allowfullscreen", "allowfullscreen");
    iframe.setAttribute("webkitallowfullscreen", "webkitallowfullscreen");
    iframe.setAttribute("msallowfullscreen", "msallowfullscreen");
    iframe.setAttribute("mozallowfullscreen", "mozallowfullscreen");
    iframe.setAttribute("oallowfullscreen", "oallowfullscreen");
    return video_dom.appendChild(iframe);
  }
};
/*! RESOURCE: ScrumReleaseImportGroupDialog */
var ScrumReleaseImportGroupDialog = Class.create();
ScrumReleaseImportGroupDialog.prototype = {
  initialize: function() {
    this.setUpFacade();
  },
  setUpFacade: function() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("task_window");
    this._mstrDlg.setTitle(getMessage("Add Members From Group"));
    this._mstrDlg.setBody(this.getMarkUp(), false, false);
  },
  setUpEvents: function() {
    var self = this,
      dialog = this._mstrDlg;
    var okButton = $("ok");
    if (okButton) {
      okButton.on("click", function() {
        var mapData = {};
        if (self.fillDataMap(mapData)) {
          var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembersProcessor");
          for (var strKey in mapData) {
            processor.addParam(strKey, mapData[strKey]);
          }
          self.showStatus(getMessage("Adding group users..."));
          processor.getXML(function() {
            self.refresh();
            dialog.destroy();
          });
        } else {
          dialog.destroy();
        }
      });
    }
    var cancelButton = $("cancel");
    if (cancelButton) {
      cancelButton.on("click", function() {
        dialog.destroy();
      });
    }
    var okNGButton = $("okNG");
    if (okNGButton) {
      okNGButton.on("click", function() {
        dialog.destroy();
      });
    }
    var cancelNGButton = $("cancelNG");
    if (cancelNGButton) {
      cancelNGButton.on("click", function() {
        dialog.destroy();
      });
    }
  },
  refresh: function() {
    GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
  },
  getScrumReleaseTeamSysId: function() {
    return g_form.getUniqueValue() + "";
  },
  getUserChosenGroupSysIds: function() {
    return $F('groupId') + "";
  },
  showStatus: function(strMessage) {
    $("task_controls").update(strMessage);
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getRoleIds: function() {
    var arrRoleNames = ["scrum_user", "scrum_admin", "scrum_release_planner", "scrum_sprint_planner", "scrum_story_creator"];
    var arrRoleIds = [];
    var record = new GlideRecord("sys_user_role");
    record.addQuery("name", "IN", arrRoleNames.join(","));
    record.query();
    while (record.next())
      arrRoleIds.push(record.sys_id + "");
    return arrRoleIds;
  },
  hasScrumRole: function(roleSysId, arrScrumRoleSysIds) {
    for (var index = 0; index < arrScrumRoleSysIds.length; ++index)
      if (arrScrumRoleSysIds[index] == "" + roleSysId)
        return true;
    var record = new GlideRecord("sys_user_role_contains");
    record.addQuery("role", roleSysId);
    record.query();
    while (record.next())
      if (this.hasScrumRole(record.contains, arrScrumRoleSysIds))
        return true;
    return false;
  },
  getGroupIds: function() {
    var arrScrumRoleIds = this.getRoleIds();
    var arrGroupIds = [];
    var record = new GlideRecord("sys_group_has_role");
    record.query();
    while (record.next())
      if (this.hasScrumRole(record.role, arrScrumRoleIds))
        arrGroupIds.push(record.group + "");
    return arrGroupIds;
  },
  getGroupInfo: function() {
    var mapGroupInfo = {};
    var arrRoleIds = this.getRoleIds();
    var arrGroupIds = this.getGroupIds(arrRoleIds);
    var record = new GlideRecord("sys_user_group");
    record.addQuery("sys_id", "IN", arrGroupIds.join(","));
    record.query();
    while (record.next()) {
      var strName = record.name + "";
      var strSysId = record.sys_id + "";
      mapGroupInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    return mapGroupInfo;
  },
  getMarkUp: function() {
    var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
    groupAjax.addParam('sysparm_name', 'getGroupInfo');
    groupAjax.getXML(this.generateMarkUp.bind(this));
  },
  generateMarkUp: function(response) {
    var mapGroupInfo = {};
    var groupData = response.responseXML.getElementsByTagName("group");
    var strName, strSysId;
    for (var i = 0; i < groupData.length; i++) {
      strName = groupData[i].getAttribute("name");
      strSysId = groupData[i].getAttribute("sysid");
      mapGroupInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    var arrGroupNames = [];
    for (var strGroupName in mapGroupInfo) {
      arrGroupNames.push(strGroupName + "");
    }
    arrGroupNames.sort();
    var strMarkUp = "";
    if (arrGroupNames.length > 0) {
      var strTable = "<div class='row'><div class='form-group'><span class='col-sm-12'><select class='form-control' id='groupId'>";
      for (var nSlot = 0; nSlot < arrGroupNames.length; ++nSlot) {
        strName = arrGroupNames[nSlot];
        strSysId = mapGroupInfo[strName].sysid;
        strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
      }
      strTable += "</select></span></div></div>";
      strMarkUp = "<div id='task_controls'>" + strTable +
        "<div style='text-align:right;padding-top:20px;'>" +
        "<button id='cancel' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>" +
        "&nbsp;&nbsp;<button id='ok' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
        "</div></div>";
    } else {
      strMarkUp = "<div id='task_controls'><p>No groups with scrum_user role found</p>" +
        "<div style='text-align: right;padding-top:20px;'>" +
        "<button id='cancelNG' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>" +
        "&nbsp;&nbsp;<button id='okNG' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
        "</div></div>";
    }
    this._mstrDlg.setBody(strMarkUp, false, false);
    this.setUpEvents();
    this.display(true);
  },
  fillDataMap: function(mapData) {
    var strChosenGroupSysId = this.getUserChosenGroupSysIds();
    if (strChosenGroupSysId) {
      mapData.sysparm_name = "createReleaseTeamMembers";
      mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId();
      mapData.sysparm_groups = strChosenGroupSysId;
      return true;
    } else {
      return false;
    }
  }
};
/*! RESOURCE: GwtLimitedDateTimePicker */
var GwtLimitedDateTimePicker = Class.create(GlideWindow, {
  MONTH_NAMES: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  MSGS: ["Go to Today", "Time", "SMTWTFS", "Invalid time", "Save (Enter)", "Cancel (ESC)"],
  initialize: function(dateFieldId, dateTimeFormat, includeTime, activeDates, blockedDates) {
    this.activeDates = activeDates ? this._processDatesInput(activeDates) : [];
    this.blockedDates = blockedDates ? blockedDates : [];
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);
    this.isCurrentDateActive = this._isDateActive(this.currentDate);
    this.currentDate = new Date();
    this.dayCells = [];
    this.cleanup = [];
    this._getMessages();
    this.includeTime = includeTime;
    this.firstDay = Math.min(Math.max(g_date_picker_first_day_of_week - 1, 0), 6);
    GlideWindow.prototype.initialize.call(this, "GwtLimitedDateTimePicker", true);
    this.dateFieldId = dateFieldId;
    this.selectedDate = this._getInitSelectedDate();
    if (this.selectedDate) {
      this.date = new Date(this.selectedDate);
    } else {
      this.date = new Date();
    }
    this.setFormat(dateTimeFormat);
    this.removeBody();
    this.clearSpacing();
    this.disableOK = this.selectedDate ? false : true;
    this._createControls(this.disableOK);
    var dateField = $(this.dateFieldId);
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
  _createControls: function(disableOK) {
    var parent = getFormContentParent();
    this.insert(parent, null);
    this.setWidth(10);
    var html = this._createCalendar();
    this._createOkCancel(disableOK);
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
    var tbody1 = cel("tbody", table);
    this.tbody = tbody1;
    this._createHeader(tbody1);
    this._createMonth(tbody1);
    if (this.includeTime && this.selectedDate)
      this._createTime(tbody1);
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
    cell.id = "GwtDateTimePicker_month";
    cell.className = "calMonthNavigation calText";
    cell.colSpan = 7;
    cell = cel("td", tr);
    cell.className = "calMonthNavigation pointerhand";
    cell.innerHTML = "&gt;&gt;";
    cell.onclick = this._nextMonth.bind(this);
    this.cleanup.push(cell);
  },
  _createMonth: function(tbody) {
    var cell;
    var tr = cel("tr", tbody);
    var daysOfWeek = this.msgs["SMTWTFS"];
    for (var i = 0; i < 9; i++) {
      cell = cel("td", tr);
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
        cell = cel("td", tr);
        if (dow > 0 && dow < 8) {
          var div = cel("div", cell);
          div.id = "GwtDateTimePicker_day" + dayIndex;
          div.day = "0";
          div.month = "0";
          div.year = "0";
          this.dayCells[dayIndex] = div;
          this.cleanup.push(div);
          dayIndex++;
        }
      }
    }
    if (this.isCurrentDateActive) {
      tr = cel("tr", tbody);
      cell = cel("td", tr);
      cell.className = "calText calTodayText pointerhand";
      cell.colSpan = 9;
      cell.width = "100%";
      cell.align = "center";
      cell.innerHTML = this.msgs["Go to Today"];
      cell.onclick = this._selectToday.bind(this);
      this.cleanup.push(cell);
    }
  },
  _registerDayClick: function(a) {
    a.onclick = this._selectDay.bindAsEventListener(this);
    a.ondblclick = this._selectDayAndSave.bindAsEventListener(this);
  },
  _deregisterDayClick: function(div) {
    div.onclick = null;
    div.ondblclick = null;
  },
  _createTime: function(tbody) {
    var tr = cel("tr", tbody);
    cell = cel("td", tr);
    cell.className = (this.isCurrentDateActive) ? 'calText calTime' : 'calText calTime calTimeTodayNotActive';
    cell.colSpan = 9;
    cell.width = "100%";
    cell.align = "center";
    var span = cel('span', cell);
    span.innerHTML = '<span class="mandatoryFieldIndicator">*</span>' + this.msgs["Time"] + ": ";
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
    cell.id = "GwtDateTimePicker_format_note";
    cell.colSpan = 9;
    cell.width = "100%";
    cell.align = "center";
    cell.innerHTML = '<p style="text-align: center; font-style: italic; font-size: 10px;">*24 hour format</p>';
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
      var isActiveDate = this._isDateActive(d);
      var div = this.dayCells[ndx];
      div.day = d.getDate();
      div.month = d.getMonth();
      div.year = d.getFullYear();
      div.innerHTML = d.getDate();
      div.className = "";
      this._deregisterDayClick(div);
      var anchorClassName = '';
      var parentClassName = '';
      if ((d.getMonth() == sm) && (d.getFullYear() == sy) && (d.getDate() == sd)) {
        if (isActiveDate) {
          parentClassName = 'limCalCurrentDate activeDay';
          this._registerDayClick(div);
        } else {
          parentClassName = 'limCalCurrentDate inactiveDay';
          anchorClassName = 'inactiveDay';
        }
      } else if ((d.getMonth() == cm) && (d.getFullYear() == cy)) {
        if (isActiveDate) {
          parentClassName = 'limCalCurrentMonthDate activeDay';
          this._registerDayClick(div);
        } else {
          parentClassName = 'limCalCurrentMonthDate inactiveDay';
          anchorClassName = 'inactiveDay';
        }
      } else {
        if (isActiveDate) {
          parentClassName = 'limCalOtherMonthDate activeDay';
          anchorClassName = 'limCalOtherMonthDateAnchor activeDay';
          this._registerDayClick(div);
        } else {
          parentClassName = 'limCalOtherMonthDate inactiveDay';
          anchorClassName = 'limCalOtherMonthDateAnchor inactiveDay';
        }
      }
      div.parentNode.className = parentClassName;
      div.className = anchorClassName;
      d.setDate(d.getDate() + 1);
    }
    this.focusEditor();
  },
  _isDateActive: function(date) {
    date.setHours(0, 0, 0, 0);
    var strDate = date.getFullYear() + '-' + ("00" + (date.getMonth() + 1)).slice(-2) + '-' + ("00" + date.getDate()).slice(-2);
    if (this.blockedDates.indexOf(strDate) >= 0) {
      return false;
    }
    if (this.activeDates.length === 0)
      return true;
    for (var i = 0; i < this.activeDates.length; i++) {
      var start = this.activeDates[i].startDate;
      var end = this.activeDates[i].endDate;
      if (start && end && date >= start && date <= end) {
        return true;
      } else {
        if (start && !end && date >= start) {
          return true;
        } else if (!start && end && date <= end) {
          return true;
        }
      }
    }
    return false;
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
  _createOkCancel: function(disableOK) {
    var b = createImage('images/workflow_approval_rejected.gifx', this.msgs["Cancel (ESC)"], this, this.dismiss);
    b.id = 'GwtDateTimePicker_cancel';
    b.className += ' image_input';
    b.tabIndex = "1005";
    this.addDecoration(b);
    if (!disableOK) {
      b = createImage('images/workflow_approved.gifx', this.msgs["Save (Enter)"], this, this.save);
      b.id = 'GwtDateTimePicker_ok';
      b.tabIndex = "1004";
      b.className += ' image_input';
      this.addDecoration(b);
    }
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
    var evt = getEvent(e);
    if (evt.keyCode == 27) {
      Event.stop(evt);
      this.dismiss();
    } else if (evt.keyCode == 13) {
      Event.stop(evt);
      this.save();
    }
  },
  onMouseUp: function(e) {
    var evt = getEvent(e);
    if (this._isFromMe(evt))
      return;
    Event.stop(evt);
    this.save();
  },
  _isFromMe: function(e) {
    var div = Event.findElement(e, "DIV");
    while (div) {
      if (div.id == "GwtLimitedDateTimePicker")
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
    this.selectedDate.setDate(today.getDate());
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
  _processDatesInput: function(dates) {
    var arr = [];
    if (!dates || !(dates instanceof Array) || dates.length === 0) {
      return arr;
    }
    for (var i = 0; i < dates.length; i++) {
      var startStr = dates[i].startDate;
      var endStr = dates[i].endDate;
      var start = (this._isValidDateStr(startStr)) ? new Date(startStr) : "";
      var end = (this._isValidDateStr(endStr)) ? new Date(endStr) : "";
      if (!start && !end) {
        jslog('Invalid active dates input. No dates were processed');
        return [];
      }
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);
      arr.push({
        startDate: start,
        endDate: end
      });
    }
    return arr;
  },
  _isValidDateStr: function(dateStr) {
    if (!dateStr)
      return false;
    var dt = new Date(dateStr);
    return !isNaN(dt.getMonth());
  },
  _getInitSelectedDate: function() {
    var dateField = $(this.dateFieldId);
    if (dateField && this._isValidDateStr(dateField.value) && this._isDateActive(new Date(dateField.value))) {
      return new Date(dateField.value);
    }
    if (this.activeDates.length == 0 && this.blockedDates.length == 0) {
      return new Date(getUserDateTime());
    }
    if (this.isCurrentDateActive) {
      return new Date(getUserDateTime());
    }
    var mostRecentActiveDt = '';
    var nearestActiveDt = '';
    if (this.blockedDates.length != 0) {
      var nextDay = new Date(getUserDateTime());
      nextDay.setTime(nextDay.getTime() + 86400000);
      var endDay = new Date(getUserDateTime());
      endDay.setTime(nextDay.getTime() + 90 * 86400000);
      var strNextDay;
      while (nextDay <= endDay) {
        var strNextDay = nextDay.getFullYear() + '-' + (nextDay.getMonth() + 1) + '-' + ("00" + nextDay.getDate()).slice(-2);
        if (this.blockedDates.indexOf(strNextDay) < 0) {
          nearestActiveDt = nextDay;
          break;
        }
        nextDay.setTime(nextDay.getTime() + 86400000);
      }
    }
    if (!nearestActiveDt) {
      for (var i = 0; i < this.activeDates.length; i++) {
        var start = this.activeDates[i].startDate;
        var end = this.activeDates[i].endDate;
        if (start > this.currentDate) {
          if (!nearestActiveDt || start < nearestActiveDt) {
            nearestActiveDt = start;
          }
        } else if (end < this.currentDate) {
          if (!mostRecentActiveDt || end > mostRecentActiveDt) {
            mostRecentActiveDt = end;
          }
        }
      }
    }
    var selectedDate;
    if (nearestActiveDt) {
      selectedDate = new Date(nearestActiveDt);
    } else if (mostRecentActiveDt) {
      selectedDate = new Date(mostRecentActiveDt);
    } else {
      return null;
    }
    selectedDate.setHours(this.currentDate.getHours());
    selectedDate.setMinutes(this.currentDate.getMinutes());
    selectedDate.setSeconds(this.currentDate.getSeconds());
    return selectedDate;
  },
  type: function() {
    return "GwtLimitedDateTimePicker";
  }
});
/*! RESOURCE: question_spacer_override */
if (typeof ServiceCatalogForm != "undefined") {
  ServiceCatalogForm.prototype._setCatalogSpacerDisplay = function(table, d) {
    return;
  }
}
/*! RESOURCE: ciw_FirstTimeUse */
var ciw_FirstTimeUse = {};
ciw_FirstTimeUse.setPref = function() {
  var ga = new GlideAjax("ciw_Incident");
  ga.addParam("sysparm_name", "setFirstTimePreference");
  ga.getXML();
}
/*! RESOURCE: Workaround (INT2100264) */
function searchForData(ac, elementName, type, noMax, additional) {
  var cachedData;
  if (!additional && !ac.isOTM())
    cachedData = retrieveStorage(ac, ac.textValue);
  window.status = "Searching for: " + ac.textValue;
  if (emptySubstr(ac))
    cachedData = emptySubstr(ac);
  if (cachedData) {
    fieldChangeResponse(cachedData, true);
  } else {
    var isSysTarget = false;
    if (additional && additional.indexOf('sys_target=') > 0)
      isSysTarget = true;
    var encodedText = encodeText(ac.textValue);
    var url = "sysparm_processor=" + type +
      "&sysparm_name=" + elementName +
      "&sysparm_chars=" + encodedText +
      "&sysparm_nomax=" + noMax +
      "&sysparm_type=" + type;
    if (!isSysTarget)
      url += "&sys_target=" + elementName.substring(0, elementName.indexOf('.'));
    if (ac.isOTM())
      url += "&sysparm_field=" + ac.refField;
    if (additional)
      url += "&" + additional;
    if (type != "Reference" && typeof(g_form) != "undefined")
      url += "&" + g_form.serialize();
    serverRequestPost("xmlhttp.do", url, fieldChangeResponse);
    var target = ac.getField();
    if (target.type != 'hidden' && ac.ignoreAJAX != true)
      ac.getField().focus();
  }
  setPreviousText(ac, new Array(ac.invisibleTextValue, ac.textValue));
}
/*! RESOURCE: GoogleAnalyticsCode */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-29210697-1']);
_gaq.push(['_setDomainName', '.service-now.com']);
_gaq.push(['_trackPageview']);
_gaq.push(['_setAllowLinker', true]);
_gaq.push(['_trackPageLoadTime']);
(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
/*! RESOURCE: PpmIntGroupSprintCreationHandler */
var PpmIntGroupSprintCreationHandler = Class.create({
  initialize: function(gr) {
    this._gr = gr;
    this._isList = (gr.type + "" == "GlideList2") || (gr.type + "" == "GlideList3");
    this._sysId = this._isList ? this._gr.getChecked() : this._gr.getUniqueValue();
    this._tableName = this._gr.getTableName();
    this._prmErr = [];
  },
  showLoadingDialog: function() {
    this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
    this.loadingDialog.setPreference('table', 'loading');
    this.loadingDialog.render();
  },
  hideLoadingDialog: function() {
    this.loadingDialog && this.loadingDialog.destroy();
  },
  showDialog: function() {
    if (this._tableName == 'm2m_release_group')
      this.getGroupFromReleaseGroup(this._sysId);
    else
      this.getDefaultDataAndShowDialog();
  },
  getDefaultDataAndShowDialog: function() {
    if (!(this._sysId == '')) {
      (new GlideUI()).clearOutputMessages();
      this.showLoadingDialog();
      this._getDefaultData();
    } else {
      var span = document.createElement('span');
      span.setAttribute('data-type', 'system');
      span.setAttribute('data-text', getMessage('Please select a Group'));
      span.setAttribute('data-duration', '4000');
      span.setAttribute('data-attr-type', 'error');
      var notification = {
        xml: span
      };
      GlideUI.get().fire(new GlideUINotification(notification));
    }
  },
  getGroupFromReleaseGroup: function(releaseGroupIds) {
    var ga = new GlideAjax("agile2_AjaxProcessor");
    ga.addParam('sysparm_name', 'getGroupsFromReleaseGroups');
    ga.addParam('sysparm_releasegroups', releaseGroupIds);
    ga.getXML(this._groupCallback.bind(this));
  },
  _groupCallback: function(response) {
    var groups = response.responseXML.getElementsByTagName("group");
    var groupIds = '';
    var id;
    for (var i = 0; i < groups.length; i++) {
      id = groups[i].getAttribute("id");
      if (groupIds == '')
        groupIds = id;
      else
        groupIds = groupIds + ',' + id;
    }
    this._sysId = groupIds;
    this.getDefaultDataAndShowDialog();
  },
  showMainDialog: function() {
    this.hideLoadingDialog();
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("ppm_int_TeamSprintCreationPage");
    var titleMsg = getMessage("Create Sprints");
    this._mstrDlg.setTitle(titleMsg);
    this._mstrDlg.setPreference('sprintCreationHandler', this);
    this._mstrDlg.setPreference('sysparm_nostack', true);
    this._mstrDlg.setPreference('sysparm_start_date', this._defaultStartDate);
    this._mstrDlg.setPreference('sysparm_count', this._defaultCount);
    this._mstrDlg.setPreference('sysparm_duration', this._defultDuration);
    this._mstrDlg.setPreference('sysparm_name', this.defaultName);
    this._mstrDlg.render();
  },
  onSubmit: function() {
    try {
      this.sprintCount = this._getValue('sprint_count');
      this.startDate = this._getValue('start_date');
      this.name = this._getValue('sprint_name');
      this.startAt = this._getValue('sprint_start_count');
      this.duration = this._getValue('sprint_duration');
      if (!this._validate()) {
        return false;
      }
      var ga = new GlideAjax("ppm_int_TeamProcessor");
      ga.addParam('sysparm_name', 'createSprints');
      ga.addParam('sysparm_start_date', this.startDate);
      ga.addParam('sysparm_sysid', this._sysId);
      ga.addParam('sysparm_count', this.sprintCount);
      ga.addParam('sysparm_start_count', this.startAt);
      ga.addParam('sysparm_sprint_name', this.name);
      ga.addParam('sysparm_duration', this.duration);
      this.showLoadingDialog();
      ga.getXML(this.callback.bind(this));
    } catch (err) {
      this._displayErrorDialog();
      console.log(err);
    }
    return false;
  },
  callback: function(response) {
    this.hideLoadingDialog();
    this._mstrDlg.destroy();
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      window.location.reload();
    } else if (resp[0] && resp[0].getAttribute("status") == "hasOverlappingSprints") {
      this._hasOverlappingSprints = true;
      if (this._isList)
        this._gr._refreshAjax();
    } else {
      this._displayErrorDialog();
    }
  },
  _displayErrorDialog: function() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._createError = new dialogClass("ppm_int_error_dialog");
    this._createError.setTitle(getMessage("Error while creating Sprints for Team."));
    this._createError.render();
  },
  _validate: function() {
    this._prmErr = [];
    var field = '';
    this._removeAllError('ppm_int_TeamSprintCreationPage');
    if (this.name == 'undefined' || this.name.trim() == "") {
      this._prmErr.push(getMessage("Provide name"));
      field = 'sprint_name';
    } else if (!this.startAt || isNaN(this.startAt)) {
      this._prmErr.push(getMessage("Provide integer value"));
      field = 'sprint_start_count';
    } else if (this.startDate == 'undefined' ||
      this.startDate.trim() == "" ||
      getDateFromFormat(this.startDate, g_user_date_format) == 0) {
      this._prmErr.push(getMessage("Provide valid start date"));
      field = 'start_date';
    } else if (!this.duration || isNaN(this.duration)) {
      this._prmErr.push(getMessage("Provide integer value"));
      field = 'sprint_duration';
    } else if (!this.sprintCount || isNaN(this.sprintCount)) {
      this._prmErr.push(getMessage("Provide integer value"));
      field = 'sprint_count';
    }
    if (this._prmErr.length > 0) {
      setTimeout("var refocus = document.getElementById('" + field + "');refocus.focus();", 0);
      this._showFieldError(field, this._prmErr[0]);
      return false;
    }
    return true;
  },
  _getValue: function(inptNm) {
    return gel(inptNm).value;
  },
  _getDefaultData: function() {
    var ga = new GlideAjax("ppm_int_TeamProcessor");
    ga.addParam('sysparm_name', 'calculateSprintDefaults');
    ga.addParam('sysparm_sysid', this._sysId);
    ga.getXML(this._defaultDataCallback.bind(this));
  },
  _defaultDataCallback: function(response) {
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0]) {
      this._defaultStartDate = resp[0].getAttribute("next_start_date");
      this._defaultCount = resp[0].getAttribute("count");
      this._defultDuration = resp[0].getAttribute("duration");
      this.defaultName = resp[0].getAttribute('name');
    }
    this.showMainDialog();
  },
  _showFieldError: function(groupId, message) {
    var $group = $j('#' + groupId + '_group');
    var $helpBlock = $group.find('.help-block');
    if (!$group.hasClass('has-error'))
      $group.addClass('has-error');
    if ($helpBlock.css('display') != "inline") {
      $helpBlock.text(message);
      $helpBlock.css('display', 'inline');
    }
  },
  _removeAllError: function(dialogName) {
    $j('#' + dialogName + ' .form-group.has-error').each(function() {
      $j(this).removeClass('has-error');
      $j(this).find('.help-block').css('display', 'none');
    });
  },
  type: "PpmIntGroupSprintCreationHandler"
});
/*! RESOURCE: moment.js */
! function(a, b) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.moment = b()
}(this, function() {
  "use strict";

  function a() {
    return od.apply(null, arguments)
  }

  function b(a) {
    od = a
  }

  function c(a) {
    return a instanceof Array || "[object Array]" === Object.prototype.toString.call(a)
  }

  function d(a) {
    return null != a && "[object Object]" === Object.prototype.toString.call(a)
  }

  function e(a) {
    var b;
    for (b in a)
      return !1;
    return !0
  }

  function f(a) {
    return "number" == typeof a || "[object Number]" === Object.prototype.toString.call(a)
  }

  function g(a) {
    return a instanceof Date || "[object Date]" === Object.prototype.toString.call(a)
  }

  function h(a, b) {
    var c, d = [];
    for (c = 0; c < a.length; ++c) d.push(b(a[c], c));
    return d
  }

  function i(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b)
  }

  function j(a, b) {
    for (var c in b) i(b, c) && (a[c] = b[c]);
    return i(b, "toString") && (a.toString = b.toString), i(b, "valueOf") && (a.valueOf = b.valueOf), a
  }

  function k(a, b, c, d) {
    return rb(a, b, c, d, !0).utc()
  }

  function l() {
    return {
      empty: !1,
      unusedTokens: [],
      unusedInput: [],
      overflow: -2,
      charsLeftOver: 0,
      nullInput: !1,
      invalidMonth: null,
      invalidFormat: !1,
      userInvalidated: !1,
      iso: !1,
      parsedDateParts: [],
      meridiem: null
    }
  }

  function m(a) {
    return null == a._pf && (a._pf = l()), a._pf
  }

  function n(a) {
    if (null == a._isValid) {
      var b = m(a),
        c = qd.call(b.parsedDateParts, function(a) {
          return null != a
        }),
        d = !isNaN(a._d.getTime()) && b.overflow < 0 && !b.empty && !b.invalidMonth && !b.invalidWeekday && !b.nullInput && !b.invalidFormat && !b.userInvalidated && (!b.meridiem || b.meridiem && c);
      if (a._strict && (d = d && 0 === b.charsLeftOver && 0 === b.unusedTokens.length && void 0 === b.bigHour), null != Object.isFrozen && Object.isFrozen(a)) return d;
      a._isValid = d
    }
    return a._isValid
  }

  function o(a) {
    var b = k(NaN);
    return null != a ? j(m(b), a) : m(b).userInvalidated = !0, b
  }

  function p(a) {
    return void 0 === a
  }

  function q(a, b) {
    var c, d, e;
    if (p(b._isAMomentObject) || (a._isAMomentObject = b._isAMomentObject), p(b._i) || (a._i = b._i), p(b._f) || (a._f = b._f), p(b._l) || (a._l = b._l), p(b._strict) || (a._strict = b._strict), p(b._tzm) || (a._tzm = b._tzm), p(b._isUTC) || (a._isUTC = b._isUTC), p(b._offset) || (a._offset = b._offset), p(b._pf) || (a._pf = m(b)), p(b._locale) || (a._locale = b._locale), rd.length > 0)
      for (c in rd) d = rd[c], e = b[d], p(e) || (a[d] = e);
    return a
  }

  function r(b) {
    q(this, b), this._d = new Date(null != b._d ? b._d.getTime() : NaN), this.isValid() || (this._d = new Date(NaN)),
      sd === !1 && (sd = !0, a.updateOffset(this), sd = !1)
  }

  function s(a) {
    return a instanceof r || null != a && null != a._isAMomentObject
  }

  function t(a) {
    return a < 0 ? Math.ceil(a) || 0 : Math.floor(a)
  }

  function u(a) {
    var b = +a,
      c = 0;
    return 0 !== b && isFinite(b) && (c = t(b)), c
  }

  function v(a, b, c) {
    var d, e = Math.min(a.length, b.length),
      f = Math.abs(a.length - b.length),
      g = 0;
    for (d = 0; d < e; d++)(c && a[d] !== b[d] || !c && u(a[d]) !== u(b[d])) && g++;
    return g + f
  }

  function w(b) {
    a.suppressDeprecationWarnings === !1 && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + b)
  }

  function x(b, c) {
    var d = !0;
    return j(function() {
      if (null != a.deprecationHandler && a.deprecationHandler(null, b), d) {
        for (var e, f = [], g = 0; g < arguments.length; g++) {
          if (e = "", "object" == typeof arguments[g]) {
            e += "\n[" + g + "] ";
            for (var h in arguments[0]) e += h + ": " + arguments[0][h] + ", ";
            e = e.slice(0, -2)
          } else e = arguments[g];
          f.push(e)
        }
        w(b + "\nArguments: " + Array.prototype.slice.call(f).join("") + "\n" + (new Error).stack), d = !1
      }
      return c.apply(this, arguments)
    }, c)
  }

  function y(b, c) {
    null != a.deprecationHandler && a.deprecationHandler(b, c), td[b] || (w(c), td[b] = !0)
  }

  function z(a) {
    return a instanceof Function || "[object Function]" === Object.prototype.toString.call(a)
  }

  function A(a) {
    var b, c;
    for (c in a) b = a[c], z(b) ? this[c] = b : this["_" + c] = b;
    this._config = a,
      this._ordinalParseLenient = new RegExp(this._ordinalParse.source + "|" + /\d{1,2}/.source)
  }

  function B(a, b) {
    var c, e = j({}, a);
    for (c in b) i(b, c) && (d(a[c]) && d(b[c]) ? (e[c] = {}, j(e[c], a[c]), j(e[c], b[c])) : null != b[c] ? e[c] = b[c] : delete e[c]);
    for (c in a) i(a, c) && !i(b, c) && d(a[c]) && (
      e[c] = j({}, e[c]));
    return e
  }

  function C(a) {
    null != a && this.set(a)
  }

  function D(a, b, c) {
    var d = this._calendar[a] || this._calendar.sameElse;
    return z(d) ? d.call(b, c) : d
  }

  function E(a) {
    var b = this._longDateFormat[a],
      c = this._longDateFormat[a.toUpperCase()];
    return b || !c ? b : (this._longDateFormat[a] = c.replace(/MMMM|MM|DD|dddd/g, function(a) {
      return a.slice(1)
    }), this._longDateFormat[a])
  }

  function F() {
    return this._invalidDate
  }

  function G(a) {
    return this._ordinal.replace("%d", a)
  }

  function H(a, b, c, d) {
    var e = this._relativeTime[c];
    return z(e) ? e(a, b, c, d) : e.replace(/%d/i, a)
  }

  function I(a, b) {
    var c = this._relativeTime[a > 0 ? "future" : "past"];
    return z(c) ? c(b) : c.replace(/%s/i, b)
  }

  function J(a, b) {
    var c = a.toLowerCase();
    Dd[c] = Dd[c + "s"] = Dd[b] = a
  }

  function K(a) {
    return "string" == typeof a ? Dd[a] || Dd[a.toLowerCase()] : void 0
  }

  function L(a) {
    var b, c, d = {};
    for (c in a) i(a, c) && (b = K(c), b && (d[b] = a[c]));
    return d
  }

  function M(a, b) {
    Ed[a] = b
  }

  function N(a) {
    var b = [];
    for (var c in a) b.push({
      unit: c,
      priority: Ed[c]
    });
    return b.sort(function(a, b) {
      return a.priority - b.priority
    }), b
  }

  function O(b, c) {
    return function(d) {
      return null != d ? (Q(this, b, d), a.updateOffset(this, c), this) : P(this, b)
    }
  }

  function P(a, b) {
    return a.isValid() ? a._d["get" + (a._isUTC ? "UTC" : "") + b]() : NaN
  }

  function Q(a, b, c) {
    a.isValid() && a._d["set" + (a._isUTC ? "UTC" : "") + b](c)
  }

  function R(a) {
    return a = K(a), z(this[a]) ? this[a]() : this
  }

  function S(a, b) {
    if ("object" == typeof a) {
      a = L(a);
      for (var c = N(a), d = 0; d < c.length; d++) this[c[d].unit](a[c[d].unit])
    } else if (a = K(a), z(this[a])) return this[a](b);
    return this
  }

  function T(a, b, c) {
    var d = "" + Math.abs(a),
      e = b - d.length,
      f = a >= 0;
    return (f ? c ? "+" : "" : "-") + Math.pow(10, Math.max(0, e)).toString().substr(1) + d
  }

  function U(a, b, c, d) {
    var e = d;
    "string" == typeof d && (e = function() {
      return this[d]()
    }), a && (Id[a] = e), b && (Id[b[0]] = function() {
      return T(e.apply(this, arguments), b[1], b[2])
    }), c && (Id[c] = function() {
      return this.localeData().ordinal(e.apply(this, arguments), a)
    })
  }

  function V(a) {
    return a.match(/\[[\s\S]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "")
  }

  function W(a) {
    var b, c, d = a.match(Fd);
    for (b = 0, c = d.length; b < c; b++) Id[d[b]] ? d[b] = Id[d[b]] : d[b] = V(d[b]);
    return function(b) {
      var e, f = "";
      for (e = 0; e < c; e++) f += d[e] instanceof Function ? d[e].call(b, a) : d[e];
      return f
    }
  }

  function X(a, b) {
    return a.isValid() ? (b = Y(b, a.localeData()), Hd[b] = Hd[b] || W(b), Hd[b](a)) : a.localeData().invalidDate()
  }

  function Y(a, b) {
    function c(a) {
      return b.longDateFormat(a) || a
    }
    var d = 5;
    for (Gd.lastIndex = 0; d >= 0 && Gd.test(a);) a = a.replace(Gd, c), Gd.lastIndex = 0, d -= 1;
    return a
  }

  function Z(a, b, c) {
    $d[a] = z(b) ? b : function(a, d) {
      return a && c ? c : b
    }
  }

  function $(a, b) {
    return i($d, a) ? $d[a](b._strict, b._locale) : new RegExp(_(a))
  }

  function _(a) {
    return aa(a.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(a, b, c, d, e) {
      return b || c || d || e
    }))
  }

  function aa(a) {
    return a.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  }

  function ba(a, b) {
    var c, d = b;
    for ("string" == typeof a && (a = [a]), f(b) && (d = function(a, c) {
        c[b] = u(a)
      }), c = 0; c < a.length; c++) _d[a[c]] = d
  }

  function ca(a, b) {
    ba(a, function(a, c, d, e) {
      d._w = d._w || {}, b(a, d._w, d, e)
    })
  }

  function da(a, b, c) {
    null != b && i(_d, a) && _d[a](b, c._a, c, a)
  }

  function ea(a, b) {
    return new Date(Date.UTC(a, b + 1, 0)).getUTCDate()
  }

  function fa(a, b) {
    return a ? c(this._months) ? this._months[a.month()] : this._months[(this._months.isFormat || ke).test(b) ? "format" : "standalone"][a.month()] : this._months
  }

  function ga(a, b) {
    return a ? c(this._monthsShort) ? this._monthsShort[a.month()] : this._monthsShort[ke.test(b) ? "format" : "standalone"][a.month()] : this._monthsShort
  }

  function ha(a, b, c) {
    var d, e, f, g = a.toLocaleLowerCase();
    if (!this._monthsParse)
      for (
        this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], d = 0; d < 12; ++d) f = k([2e3, d]), this._shortMonthsParse[d] = this.monthsShort(f, "").toLocaleLowerCase(), this._longMonthsParse[d] = this.months(f, "").toLocaleLowerCase();
    return c ? "MMM" === b ? (e = je.call(this._shortMonthsParse, g), e !== -1 ? e : null) : (e = je.call(this._longMonthsParse, g), e !== -1 ? e : null) : "MMM" === b ? (e = je.call(this._shortMonthsParse, g), e !== -1 ? e : (e = je.call(this._longMonthsParse, g), e !== -1 ? e : null)) : (e = je.call(this._longMonthsParse, g), e !== -1 ? e : (e = je.call(this._shortMonthsParse, g), e !== -1 ? e : null))
  }

  function ia(a, b, c) {
    var d, e, f;
    if (this._monthsParseExact) return ha.call(this, a, b, c);
    for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), d = 0; d < 12; d++) {
      if (
        e = k([2e3, d]), c && !this._longMonthsParse[d] && (this._longMonthsParse[d] = new RegExp("^" + this.months(e, "").replace(".", "") + "$", "i"), this._shortMonthsParse[d] = new RegExp("^" + this.monthsShort(e, "").replace(".", "") + "$", "i")), c || this._monthsParse[d] || (f = "^" + this.months(e, "") + "|^" + this.monthsShort(e, ""), this._monthsParse[d] = new RegExp(f.replace(".", ""), "i")), c && "MMMM" === b && this._longMonthsParse[d].test(a)) return d;
      if (c && "MMM" === b && this._shortMonthsParse[d].test(a)) return d;
      if (!c && this._monthsParse[d].test(a)) return d
    }
  }

  function ja(a, b) {
    var c;
    if (!a.isValid())
      return a;
    if ("string" == typeof b)
      if (/^\d+$/.test(b)) b = u(b);
      else
    if (b = a.localeData().monthsParse(b), !f(b)) return a;
    return c = Math.min(a.date(), ea(a.year(), b)), a._d["set" + (a._isUTC ? "UTC" : "") + "Month"](b, c), a
  }

  function ka(b) {
    return null != b ? (ja(this, b), a.updateOffset(this, !0), this) : P(this, "Month")
  }

  function la() {
    return ea(this.year(), this.month())
  }

  function ma(a) {
    return this._monthsParseExact ? (i(this, "_monthsRegex") || oa.call(this), a ? this._monthsShortStrictRegex : this._monthsShortRegex) : (i(this, "_monthsShortRegex") || (this._monthsShortRegex = ne), this._monthsShortStrictRegex && a ? this._monthsShortStrictRegex : this._monthsShortRegex)
  }

  function na(a) {
    return this._monthsParseExact ? (i(this, "_monthsRegex") || oa.call(this), a ? this._monthsStrictRegex : this._monthsRegex) : (i(this, "_monthsRegex") || (this._monthsRegex = oe), this._monthsStrictRegex && a ? this._monthsStrictRegex : this._monthsRegex)
  }

  function oa() {
    function a(a, b) {
      return b.length - a.length
    }
    var b, c, d = [],
      e = [],
      f = [];
    for (b = 0; b < 12; b++)
      c = k([2e3, b]), d.push(this.monthsShort(c, "")), e.push(this.months(c, "")), f.push(this.months(c, "")), f.push(this.monthsShort(c, ""));
    for (
      d.sort(a), e.sort(a), f.sort(a), b = 0; b < 12; b++) d[b] = aa(d[b]), e[b] = aa(e[b]);
    for (b = 0; b < 24; b++) f[b] = aa(f[b]);
    this._monthsRegex = new RegExp("^(" + f.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp("^(" + e.join("|") + ")", "i"), this._monthsShortStrictRegex = new RegExp("^(" + d.join("|") + ")", "i")
  }

  function pa(a) {
    return qa(a) ? 366 : 365
  }

  function qa(a) {
    return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0
  }

  function ra() {
    return qa(this.year())
  }

  function sa(a, b, c, d, e, f, g) {
    var h = new Date(a, b, c, d, e, f, g);
    return a < 100 && a >= 0 && isFinite(h.getFullYear()) && h.setFullYear(a), h
  }

  function ta(a) {
    var b = new Date(Date.UTC.apply(null, arguments));
    return a < 100 && a >= 0 && isFinite(b.getUTCFullYear()) && b.setUTCFullYear(a), b
  }

  function ua(a, b, c) {
    var
      d = 7 + b - c,
      e = (7 + ta(a, 0, d).getUTCDay() - b) % 7;
    return -e + d - 1
  }

  function va(a, b, c, d, e) {
    var f, g, h = (7 + c - d) % 7,
      i = ua(a, d, e),
      j = 1 + 7 * (b - 1) + h + i;
    return j <= 0 ? (f = a - 1, g = pa(f) + j) : j > pa(a) ? (f = a + 1, g = j - pa(a)) : (f = a, g = j), {
      year: f,
      dayOfYear: g
    }
  }

  function wa(a, b, c) {
    var d, e, f = ua(a.year(), b, c),
      g = Math.floor((a.dayOfYear() - f - 1) / 7) + 1;
    return g < 1 ? (e = a.year() - 1, d = g + xa(e, b, c)) : g > xa(a.year(), b, c) ? (d = g - xa(a.year(), b, c), e = a.year() + 1) : (e = a.year(), d = g), {
      week: d,
      year: e
    }
  }

  function xa(a, b, c) {
    var d = ua(a, b, c),
      e = ua(a + 1, b, c);
    return (pa(a) - d + e) / 7
  }

  function ya(a) {
    return wa(a, this._week.dow, this._week.doy).week
  }

  function za() {
    return this._week.dow
  }

  function Aa() {
    return this._week.doy
  }

  function Ba(a) {
    var b = this.localeData().week(this);
    return null == a ? b : this.add(7 * (a - b), "d")
  }

  function Ca(a) {
    var b = wa(this, 1, 4).week;
    return null == a ? b : this.add(7 * (a - b), "d")
  }

  function Da(a, b) {
    return "string" != typeof a ? a : isNaN(a) ? (a = b.weekdaysParse(a), "number" == typeof a ? a : null) : parseInt(a, 10)
  }

  function Ea(a, b) {
    return "string" == typeof a ? b.weekdaysParse(a) % 7 || 7 : isNaN(a) ? null : a
  }

  function Fa(a, b) {
    return a ? c(this._weekdays) ? this._weekdays[a.day()] : this._weekdays[this._weekdays.isFormat.test(b) ? "format" : "standalone"][a.day()] : this._weekdays
  }

  function Ga(a) {
    return a ? this._weekdaysShort[a.day()] : this._weekdaysShort
  }

  function Ha(a) {
    return a ? this._weekdaysMin[a.day()] : this._weekdaysMin
  }

  function Ia(a, b, c) {
    var d, e, f, g = a.toLocaleLowerCase();
    if (!this._weekdaysParse)
      for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], d = 0; d < 7; ++d) f = k([2e3, 1]).day(d), this._minWeekdaysParse[d] = this.weekdaysMin(f, "").toLocaleLowerCase(), this._shortWeekdaysParse[d] = this.weekdaysShort(f, "").toLocaleLowerCase(), this._weekdaysParse[d] = this.weekdays(f, "").toLocaleLowerCase();
    return c ? "dddd" === b ? (e = je.call(this._weekdaysParse, g), e !== -1 ? e : null) : "ddd" === b ? (e = je.call(this._shortWeekdaysParse, g), e !== -1 ? e : null) : (e = je.call(this._minWeekdaysParse, g), e !== -1 ? e : null) : "dddd" === b ? (e = je.call(this._weekdaysParse, g), e !== -1 ? e : (e = je.call(this._shortWeekdaysParse, g), e !== -1 ? e : (e = je.call(this._minWeekdaysParse, g), e !== -1 ? e : null))) : "ddd" === b ? (e = je.call(this._shortWeekdaysParse, g), e !== -1 ? e : (e = je.call(this._weekdaysParse, g), e !== -1 ? e : (e = je.call(this._minWeekdaysParse, g), e !== -1 ? e : null))) : (e = je.call(this._minWeekdaysParse, g), e !== -1 ? e : (e = je.call(this._weekdaysParse, g), e !== -1 ? e : (e = je.call(this._shortWeekdaysParse, g), e !== -1 ? e : null)))
  }

  function Ja(a, b, c) {
    var d, e, f;
    if (this._weekdaysParseExact) return Ia.call(this, a, b, c);
    for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), d = 0; d < 7; d++) {
      if (
        e = k([2e3, 1]).day(d), c && !this._fullWeekdaysParse[d] && (this._fullWeekdaysParse[d] = new RegExp("^" + this.weekdays(e, "").replace(".", ".?") + "$", "i"), this._shortWeekdaysParse[d] = new RegExp("^" + this.weekdaysShort(e, "").replace(".", ".?") + "$", "i"), this._minWeekdaysParse[d] = new RegExp("^" + this.weekdaysMin(e, "").replace(".", ".?") + "$", "i")), this._weekdaysParse[d] || (f = "^" + this.weekdays(e, "") + "|^" + this.weekdaysShort(e, "") + "|^" + this.weekdaysMin(e, ""), this._weekdaysParse[d] = new RegExp(f.replace(".", ""), "i")), c && "dddd" === b && this._fullWeekdaysParse[d].test(a)) return d;
      if (c && "ddd" === b && this._shortWeekdaysParse[d].test(a)) return d;
      if (c && "dd" === b && this._minWeekdaysParse[d].test(a)) return d;
      if (!c && this._weekdaysParse[d].test(a)) return d
    }
  }

  function Ka(a) {
    if (!this.isValid()) return null != a ? this : NaN;
    var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
    return null != a ? (a = Da(a, this.localeData()), this.add(a - b, "d")) : b
  }

  function La(a) {
    if (!this.isValid()) return null != a ? this : NaN;
    var b = (this.day() + 7 - this.localeData()._week.dow) % 7;
    return null == a ? b : this.add(a - b, "d")
  }

  function Ma(a) {
    if (!this.isValid()) return null != a ? this : NaN;
    if (null != a) {
      var b = Ea(a, this.localeData());
      return this.day(this.day() % 7 ? b : b - 7)
    }
    return this.day() || 7
  }

  function Na(a) {
    return this._weekdaysParseExact ? (i(this, "_weekdaysRegex") || Qa.call(this), a ? this._weekdaysStrictRegex : this._weekdaysRegex) : (i(this, "_weekdaysRegex") || (this._weekdaysRegex = ue), this._weekdaysStrictRegex && a ? this._weekdaysStrictRegex : this._weekdaysRegex)
  }

  function Oa(a) {
    return this._weekdaysParseExact ? (i(this, "_weekdaysRegex") || Qa.call(this), a ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (i(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = ve), this._weekdaysShortStrictRegex && a ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex)
  }

  function Pa(a) {
    return this._weekdaysParseExact ? (i(this, "_weekdaysRegex") || Qa.call(this), a ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (i(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = we), this._weekdaysMinStrictRegex && a ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex)
  }

  function Qa() {
    function a(a, b) {
      return b.length - a.length
    }
    var b, c, d, e, f, g = [],
      h = [],
      i = [],
      j = [];
    for (b = 0; b < 7; b++)
      c = k([2e3, 1]).day(b), d = this.weekdaysMin(c, ""), e = this.weekdaysShort(c, ""), f = this.weekdays(c, ""), g.push(d), h.push(e), i.push(f), j.push(d), j.push(e), j.push(f);
    for (
      g.sort(a), h.sort(a), i.sort(a), j.sort(a), b = 0; b < 7; b++) h[b] = aa(h[b]), i[b] = aa(i[b]), j[b] = aa(j[b]);
    this._weekdaysRegex = new RegExp("^(" + j.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp("^(" + i.join("|") + ")", "i"), this._weekdaysShortStrictRegex = new RegExp("^(" + h.join("|") + ")", "i"), this._weekdaysMinStrictRegex = new RegExp("^(" + g.join("|") + ")", "i")
  }

  function Ra() {
    return this.hours() % 12 || 12
  }

  function Sa() {
    return this.hours() || 24
  }

  function Ta(a, b) {
    U(a, 0, 0, function() {
      return this.localeData().meridiem(this.hours(), this.minutes(), b)
    })
  }

  function Ua(a, b) {
    return b._meridiemParse
  }

  function Va(a) {
    return "p" === (a + "").toLowerCase().charAt(0)
  }

  function Wa(a, b, c) {
    return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM"
  }

  function Xa(a) {
    return a ? a.toLowerCase().replace("_", "-") : a
  }

  function Ya(a) {
    for (var b, c, d, e, f = 0; f < a.length;) {
      for (e = Xa(a[f]).split("-"), b = e.length, c = Xa(a[f + 1]), c = c ? c.split("-") : null; b > 0;) {
        if (d = Za(e.slice(0, b).join("-"))) return d;
        if (c && c.length >= b && v(e, c, !0) >= b - 1)
          break;
        b--
      }
      f++
    }
    return null
  }

  function Za(a) {
    var b = null;
    if (!Be[a] && "undefined" != typeof module && module && module.exports) try {
      b = xe._abbr, require("./locale/" + a),
        $a(b)
    } catch (a) {}
    return Be[a]
  }

  function $a(a, b) {
    var c;
    return a && (c = p(b) ? bb(a) : _a(a, b), c && (xe = c)), xe._abbr
  }

  function _a(a, b) {
    if (null !== b) {
      var c = Ae;
      if (b.abbr = a, null != Be[a]) y("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."), c = Be[a]._config;
      else if (null != b.parentLocale) {
        if (null == Be[b.parentLocale]) return Ce[b.parentLocale] || (Ce[b.parentLocale] = []), Ce[b.parentLocale].push({
          name: a,
          config: b
        }), null;
        c = Be[b.parentLocale]._config
      }
      return Be[a] = new C(B(c, b)), Ce[a] && Ce[a].forEach(function(a) {
        _a(a.name, a.config)
      }), $a(a), Be[a]
    }
    return delete Be[a], null
  }

  function ab(a, b) {
    if (null != b) {
      var c, d = Ae;
      null != Be[a] && (d = Be[a]._config), b = B(d, b), c = new C(b), c.parentLocale = Be[a], Be[a] = c,
        $a(a)
    } else
      null != Be[a] && (null != Be[a].parentLocale ? Be[a] = Be[a].parentLocale : null != Be[a] && delete Be[a]);
    return Be[a]
  }

  function bb(a) {
    var b;
    if (a && a._locale && a._locale._abbr && (a = a._locale._abbr), !a) return xe;
    if (!c(a)) {
      if (
        b = Za(a)) return b;
      a = [a]
    }
    return Ya(a)
  }

  function cb() {
    return wd(Be)
  }

  function db(a) {
    var b, c = a._a;
    return c && m(a).overflow === -2 && (b = c[be] < 0 || c[be] > 11 ? be : c[ce] < 1 || c[ce] > ea(c[ae], c[be]) ? ce : c[de] < 0 || c[de] > 24 || 24 === c[de] && (0 !== c[ee] || 0 !== c[fe] || 0 !== c[ge]) ? de : c[ee] < 0 || c[ee] > 59 ? ee : c[fe] < 0 || c[fe] > 59 ? fe : c[ge] < 0 || c[ge] > 999 ? ge : -1, m(a)._overflowDayOfYear && (b < ae || b > ce) && (b = ce), m(a)._overflowWeeks && b === -1 && (b = he), m(a)._overflowWeekday && b === -1 && (b = ie), m(a).overflow = b), a
  }

  function eb(a) {
    var b, c, d, e, f, g, h = a._i,
      i = De.exec(h) || Ee.exec(h);
    if (i) {
      for (m(a).iso = !0, b = 0, c = Ge.length; b < c; b++)
        if (Ge[b][1].exec(i[1])) {
          e = Ge[b][0], d = Ge[b][2] !== !1;
          break
        }
      if (null == e) return void(a._isValid = !1);
      if (i[3]) {
        for (b = 0, c = He.length; b < c; b++)
          if (He[b][1].exec(i[3])) {
            f = (i[2] || " ") + He[b][0];
            break
          }
        if (null == f) return void(a._isValid = !1)
      }
      if (!d && null != f) return void(a._isValid = !1);
      if (i[4]) {
        if (!Fe.exec(i[4])) return void(a._isValid = !1);
        g = "Z"
      }
      a._f = e + (f || "") + (g || ""), kb(a)
    } else a._isValid = !1
  }

  function fb(b) {
    var c = Ie.exec(b._i);
    return null !== c ? void(b._d = new Date(+c[1])) : (eb(b), void(b._isValid === !1 && (delete b._isValid, a.createFromInputFallback(b))))
  }

  function gb(a, b, c) {
    return null != a ? a : null != b ? b : c
  }

  function hb(b) {
    var c = new Date(a.now());
    return b._useUTC ? [c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()] : [c.getFullYear(), c.getMonth(), c.getDate()]
  }

  function ib(a) {
    var b, c, d, e, f = [];
    if (!a._d) {
      for (d = hb(a),
        a._w && null == a._a[ce] && null == a._a[be] && jb(a),
        a._dayOfYear && (e = gb(a._a[ae], d[ae]), a._dayOfYear > pa(e) && (m(a)._overflowDayOfYear = !0), c = ta(e, 0, a._dayOfYear), a._a[be] = c.getUTCMonth(), a._a[ce] = c.getUTCDate()), b = 0; b < 3 && null == a._a[b]; ++b) a._a[b] = f[b] = d[b];
      for (; b < 7; b++) a._a[b] = f[b] = null == a._a[b] ? 2 === b ? 1 : 0 : a._a[b];
      24 === a._a[de] && 0 === a._a[ee] && 0 === a._a[fe] && 0 === a._a[ge] && (a._nextDay = !0, a._a[de] = 0), a._d = (a._useUTC ? ta : sa).apply(null, f),
        null != a._tzm && a._d.setUTCMinutes(a._d.getUTCMinutes() - a._tzm), a._nextDay && (a._a[de] = 24)
    }
  }

  function jb(a) {
    var b, c, d, e, f, g, h, i;
    if (b = a._w, null != b.GG || null != b.W || null != b.E) f = 1, g = 4,
      c = gb(b.GG, a._a[ae], wa(sb(), 1, 4).year), d = gb(b.W, 1), e = gb(b.E, 1), (e < 1 || e > 7) && (i = !0);
    else {
      f = a._locale._week.dow, g = a._locale._week.doy;
      var j = wa(sb(), f, g);
      c = gb(b.gg, a._a[ae], j.year),
        d = gb(b.w, j.week), null != b.d ? (
          e = b.d, (e < 0 || e > 6) && (i = !0)) : null != b.e ? (
          e = b.e + f, (b.e < 0 || b.e > 6) && (i = !0)) :
        e = f
    }
    d < 1 || d > xa(c, f, g) ? m(a)._overflowWeeks = !0 : null != i ? m(a)._overflowWeekday = !0 : (h = va(c, d, e, f, g), a._a[ae] = h.year, a._dayOfYear = h.dayOfYear)
  }

  function kb(b) {
    if (b._f === a.ISO_8601) return void eb(b);
    b._a = [], m(b).empty = !0;
    var c, d, e, f, g, h = "" + b._i,
      i = h.length,
      j = 0;
    for (e = Y(b._f, b._locale).match(Fd) || [], c = 0; c < e.length; c++) f = e[c], d = (h.match($(f, b)) || [])[0],
      d && (g = h.substr(0, h.indexOf(d)), g.length > 0 && m(b).unusedInput.push(g), h = h.slice(h.indexOf(d) + d.length), j += d.length),
      Id[f] ? (d ? m(b).empty = !1 : m(b).unusedTokens.push(f), da(f, d, b)) : b._strict && !d && m(b).unusedTokens.push(f);
    m(b).charsLeftOver = i - j, h.length > 0 && m(b).unusedInput.push(h),
      b._a[de] <= 12 && m(b).bigHour === !0 && b._a[de] > 0 && (m(b).bigHour = void 0), m(b).parsedDateParts = b._a.slice(0), m(b).meridiem = b._meridiem,
      b._a[de] = lb(b._locale, b._a[de], b._meridiem), ib(b), db(b)
  }

  function lb(a, b, c) {
    var d;
    return null == c ? b : null != a.meridiemHour ? a.meridiemHour(b, c) : null != a.isPM ? (d = a.isPM(c), d && b < 12 && (b += 12), d || 12 !== b || (b = 0), b) : b
  }

  function mb(a) {
    var b, c, d, e, f;
    if (0 === a._f.length) return m(a).invalidFormat = !0, void(a._d = new Date(NaN));
    for (e = 0; e < a._f.length; e++) f = 0, b = q({}, a), null != a._useUTC && (b._useUTC = a._useUTC), b._f = a._f[e], kb(b), n(b) && (
      f += m(b).charsLeftOver,
      f += 10 * m(b).unusedTokens.length, m(b).score = f, (null == d || f < d) && (d = f, c = b));
    j(a, c || b)
  }

  function nb(a) {
    if (!a._d) {
      var b = L(a._i);
      a._a = h([b.year, b.month, b.day || b.date, b.hour, b.minute, b.second, b.millisecond], function(a) {
        return a && parseInt(a, 10)
      }), ib(a)
    }
  }

  function ob(a) {
    var b = new r(db(pb(a)));
    return b._nextDay && (b.add(1, "d"), b._nextDay = void 0), b
  }

  function pb(a) {
    var b = a._i,
      d = a._f;
    return a._locale = a._locale || bb(a._l), null === b || void 0 === d && "" === b ? o({
      nullInput: !0
    }) : ("string" == typeof b && (a._i = b = a._locale.preparse(b)), s(b) ? new r(db(b)) : (g(b) ? a._d = b : c(d) ? mb(a) : d ? kb(a) : qb(a), n(a) || (a._d = null), a))
  }

  function qb(b) {
    var d = b._i;
    void 0 === d ? b._d = new Date(a.now()) : g(d) ? b._d = new Date(d.valueOf()) : "string" == typeof d ? fb(b) : c(d) ? (b._a = h(d.slice(0), function(a) {
        return parseInt(a, 10)
      }), ib(b)) : "object" == typeof d ? nb(b) : f(d) ?
      b._d = new Date(d) : a.createFromInputFallback(b)
  }

  function rb(a, b, f, g, h) {
    var i = {};
    return f !== !0 && f !== !1 || (g = f, f = void 0), (d(a) && e(a) || c(a) && 0 === a.length) && (a = void 0), i._isAMomentObject = !0, i._useUTC = i._isUTC = h, i._l = f, i._i = a, i._f = b, i._strict = g, ob(i)
  }

  function sb(a, b, c, d) {
    return rb(a, b, c, d, !1)
  }

  function tb(a, b) {
    var d, e;
    if (1 === b.length && c(b[0]) && (b = b[0]), !b.length) return sb();
    for (d = b[0], e = 1; e < b.length; ++e) b[e].isValid() && !b[e][a](d) || (d = b[e]);
    return d
  }

  function ub() {
    var a = [].slice.call(arguments, 0);
    return tb("isBefore", a)
  }

  function vb() {
    var a = [].slice.call(arguments, 0);
    return tb("isAfter", a)
  }

  function wb(a) {
    var b = L(a),
      c = b.year || 0,
      d = b.quarter || 0,
      e = b.month || 0,
      f = b.week || 0,
      g = b.day || 0,
      h = b.hour || 0,
      i = b.minute || 0,
      j = b.second || 0,
      k = b.millisecond || 0;
    this._milliseconds = +k + 1e3 * j +
      6e4 * i +
      1e3 * h * 60 * 60,
      this._days = +g + 7 * f,
      this._months = +e + 3 * d + 12 * c, this._data = {}, this._locale = bb(), this._bubble()
  }

  function xb(a) {
    return a instanceof wb
  }

  function yb(a) {
    return a < 0 ? Math.round(-1 * a) * -1 : Math.round(a)
  }

  function zb(a, b) {
    U(a, 0, 0, function() {
      var a = this.utcOffset(),
        c = "+";
      return a < 0 && (a = -a, c = "-"), c + T(~~(a / 60), 2) + b + T(~~a % 60, 2)
    })
  }

  function Ab(a, b) {
    var c = (b || "").match(a);
    if (null === c) return null;
    var d = c[c.length - 1] || [],
      e = (d + "").match(Me) || ["-", 0, 0],
      f = +(60 * e[1]) + u(e[2]);
    return 0 === f ? 0 : "+" === e[0] ? f : -f
  }

  function Bb(b, c) {
    var d, e;
    return c._isUTC ? (d = c.clone(), e = (s(b) || g(b) ? b.valueOf() : sb(b).valueOf()) - d.valueOf(), d._d.setTime(d._d.valueOf() + e), a.updateOffset(d, !1), d) : sb(b).local()
  }

  function Cb(a) {
    return 15 * -Math.round(a._d.getTimezoneOffset() / 15)
  }

  function Db(b, c) {
    var d, e = this._offset || 0;
    if (!this.isValid()) return null != b ? this : NaN;
    if (null != b) {
      if ("string" == typeof b) {
        if (b = Ab(Xd, b), null === b) return this
      } else Math.abs(b) < 16 && (b = 60 * b);
      return !this._isUTC && c && (d = Cb(this)), this._offset = b, this._isUTC = !0, null != d && this.add(d, "m"), e !== b && (!c || this._changeInProgress ? Tb(this, Ob(b - e, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, a.updateOffset(this, !0), this._changeInProgress = null)), this
    }
    return this._isUTC ? e : Cb(this)
  }

  function Eb(a, b) {
    return null != a ? ("string" != typeof a && (a = -a), this.utcOffset(a, b), this) : -this.utcOffset()
  }

  function Fb(a) {
    return this.utcOffset(0, a)
  }

  function Gb(a) {
    return this._isUTC && (this.utcOffset(0, a), this._isUTC = !1, a && this.subtract(Cb(this), "m")), this
  }

  function Hb() {
    if (null != this._tzm) this.utcOffset(this._tzm);
    else if ("string" == typeof this._i) {
      var a = Ab(Wd, this._i);
      null != a ? this.utcOffset(a) : this.utcOffset(0, !0)
    }
    return this
  }

  function Ib(a) {
    return !!this.isValid() && (a = a ? sb(a).utcOffset() : 0, (this.utcOffset() - a) % 60 === 0)
  }

  function Jb() {
    return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset()
  }

  function Kb() {
    if (!p(this._isDSTShifted)) return this._isDSTShifted;
    var a = {};
    if (q(a, this), a = pb(a), a._a) {
      var b = a._isUTC ? k(a._a) : sb(a._a);
      this._isDSTShifted = this.isValid() && v(a._a, b.toArray()) > 0
    } else this._isDSTShifted = !1;
    return this._isDSTShifted
  }

  function Lb() {
    return !!this.isValid() && !this._isUTC
  }

  function Mb() {
    return !!this.isValid() && this._isUTC
  }

  function Nb() {
    return !!this.isValid() && (this._isUTC && 0 === this._offset)
  }

  function Ob(a, b) {
    var c, d, e, g = a,
      h = null;
    return xb(a) ? g = {
      ms: a._milliseconds,
      d: a._days,
      M: a._months
    } : f(a) ? (g = {}, b ? g[b] = a : g.milliseconds = a) : (h = Ne.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = {
      y: 0,
      d: u(h[ce]) * c,
      h: u(h[de]) * c,
      m: u(h[ee]) * c,
      s: u(h[fe]) * c,
      ms: u(yb(1e3 * h[ge])) * c
    }) : (h = Oe.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = {
      y: Pb(h[2], c),
      M: Pb(h[3], c),
      w: Pb(h[4], c),
      d: Pb(h[5], c),
      h: Pb(h[6], c),
      m: Pb(h[7], c),
      s: Pb(h[8], c)
    }) : null == g ? g = {} : "object" == typeof g && ("from" in g || "to" in g) && (e = Rb(sb(g.from), sb(g.to)), g = {}, g.ms = e.milliseconds, g.M = e.months), d = new wb(g), xb(a) && i(a, "_locale") && (d._locale = a._locale), d
  }

  function Pb(a, b) {
    var c = a && parseFloat(a.replace(",", "."));
    return (isNaN(c) ? 0 : c) * b
  }

  function Qb(a, b) {
    var c = {
      milliseconds: 0,
      months: 0
    };
    return c.months = b.month() - a.month() + 12 * (b.year() - a.year()), a.clone().add(c.months, "M").isAfter(b) && --c.months, c.milliseconds = +b - +a.clone().add(c.months, "M"), c
  }

  function Rb(a, b) {
    var c;
    return a.isValid() && b.isValid() ? (b = Bb(b, a), a.isBefore(b) ? c = Qb(a, b) : (c = Qb(b, a), c.milliseconds = -c.milliseconds, c.months = -c.months), c) : {
      milliseconds: 0,
      months: 0
    }
  }

  function Sb(a, b) {
    return function(c, d) {
      var e, f;
      return null === d || isNaN(+d) || (y(b, "moment()." + b + "(period, number) is deprecated. Please use moment()." + b + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."), f = c, c = d, d = f), c = "string" == typeof c ? +c : c, e = Ob(c, d), Tb(this, e, a), this
    }
  }

  function Tb(b, c, d, e) {
    var f = c._milliseconds,
      g = yb(c._days),
      h = yb(c._months);
    b.isValid() && (e = null == e || e, f && b._d.setTime(b._d.valueOf() + f * d), g && Q(b, "Date", P(b, "Date") + g * d), h && ja(b, P(b, "Month") + h * d), e && a.updateOffset(b, g || h))
  }

  function Ub(a, b) {
    var c = a.diff(b, "days", !0);
    return c < -6 ? "sameElse" : c < -1 ? "lastWeek" : c < 0 ? "lastDay" : c < 1 ? "sameDay" : c < 2 ? "nextDay" : c < 7 ? "nextWeek" : "sameElse"
  }

  function Vb(b, c) {
    var d = b || sb(),
      e = Bb(d, this).startOf("day"),
      f = a.calendarFormat(this, e) || "sameElse",
      g = c && (z(c[f]) ? c[f].call(this, d) : c[f]);
    return this.format(g || this.localeData().calendar(f, this, sb(d)))
  }

  function Wb() {
    return new r(this)
  }

  function Xb(a, b) {
    var c = s(a) ? a : sb(a);
    return !(!this.isValid() || !c.isValid()) && (b = K(p(b) ? "millisecond" : b), "millisecond" === b ? this.valueOf() > c.valueOf() : c.valueOf() < this.clone().startOf(b).valueOf())
  }

  function Yb(a, b) {
    var c = s(a) ? a : sb(a);
    return !(!this.isValid() || !c.isValid()) && (b = K(p(b) ? "millisecond" : b), "millisecond" === b ? this.valueOf() < c.valueOf() : this.clone().endOf(b).valueOf() < c.valueOf())
  }

  function Zb(a, b, c, d) {
    return d = d || "()", ("(" === d[0] ? this.isAfter(a, c) : !this.isBefore(a, c)) && (")" === d[1] ? this.isBefore(b, c) : !this.isAfter(b, c))
  }

  function $b(a, b) {
    var c, d = s(a) ? a : sb(a);
    return !(!this.isValid() || !d.isValid()) && (b = K(b || "millisecond"), "millisecond" === b ? this.valueOf() === d.valueOf() : (c = d.valueOf(), this.clone().startOf(b).valueOf() <= c && c <= this.clone().endOf(b).valueOf()))
  }

  function _b(a, b) {
    return this.isSame(a, b) || this.isAfter(a, b)
  }

  function ac(a, b) {
    return this.isSame(a, b) || this.isBefore(a, b)
  }

  function bc(a, b, c) {
    var d, e, f, g;
    return this.isValid() ? (d = Bb(a, this), d.isValid() ? (e = 6e4 * (d.utcOffset() - this.utcOffset()), b = K(b), "year" === b || "month" === b || "quarter" === b ? (g = cc(this, d), "quarter" === b ? g /= 3 : "year" === b && (g /= 12)) : (f = this - d, g = "second" === b ? f / 1e3 : "minute" === b ? f / 6e4 : "hour" === b ? f / 36e5 : "day" === b ? (f - e) / 864e5 : "week" === b ? (f - e) / 6048e5 : f), c ? g : t(g)) : NaN) : NaN
  }

  function cc(a, b) {
    var c, d, e = 12 * (b.year() - a.year()) + (b.month() - a.month()),
      f = a.clone().add(e, "months");
    return b - f < 0 ? (c = a.clone().add(e - 1, "months"), d = (b - f) / (f - c)) : (c = a.clone().add(e + 1, "months"), d = (b - f) / (c - f)), -(e + d) || 0
  }

  function dc() {
    return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")
  }

  function ec() {
    var a = this.clone().utc();
    return 0 < a.year() && a.year() <= 9999 ? z(Date.prototype.toISOString) ? this.toDate().toISOString() : X(a, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : X(a, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")
  }

  function fc() {
    if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)";
    var a = "moment",
      b = "";
    this.isLocal() || (a = 0 === this.utcOffset() ? "moment.utc" : "moment.parseZone", b = "Z");
    var c = "[" + a + '("]',
      d = 0 < this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY",
      e = "-MM-DD[T]HH:mm:ss.SSS",
      f = b + '[")]';
    return this.format(c + d + e + f)
  }

  function gc(b) {
    b || (b = this.isUtc() ? a.defaultFormatUtc : a.defaultFormat);
    var c = X(this, b);
    return this.localeData().postformat(c)
  }

  function hc(a, b) {
    return this.isValid() && (s(a) && a.isValid() || sb(a).isValid()) ? Ob({
      to: this,
      from: a
    }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate()
  }

  function ic(a) {
    return this.from(sb(), a)
  }

  function jc(a, b) {
    return this.isValid() && (s(a) && a.isValid() || sb(a).isValid()) ? Ob({
      from: this,
      to: a
    }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate()
  }

  function kc(a) {
    return this.to(sb(), a)
  }

  function lc(a) {
    var b;
    return void 0 === a ? this._locale._abbr : (b = bb(a), null != b && (this._locale = b), this)
  }

  function mc() {
    return this._locale
  }

  function nc(a) {
    switch (a = K(a)) {
      case "year":
        this.month(0);
      case "quarter":
      case "month":
        this.date(1);
      case "week":
      case "isoWeek":
      case "day":
      case "date":
        this.hours(0);
      case "hour":
        this.minutes(0);
      case "minute":
        this.seconds(0);
      case "second":
        this.milliseconds(0)
    }
    return "week" === a && this.weekday(0), "isoWeek" === a && this.isoWeekday(1), "quarter" === a && this.month(3 * Math.floor(this.month() / 3)), this
  }

  function oc(a) {
    return a = K(a), void 0 === a || "millisecond" === a ? this : ("date" === a && (a = "day"), this.startOf(a).add(1, "isoWeek" === a ? "week" : a).subtract(1, "ms"))
  }

  function pc() {
    return this._d.valueOf() - 6e4 * (this._offset || 0)
  }

  function qc() {
    return Math.floor(this.valueOf() / 1e3)
  }

  function rc() {
    return new Date(this.valueOf())
  }

  function sc() {
    var a = this;
    return [a.year(), a.month(), a.date(), a.hour(), a.minute(), a.second(), a.millisecond()]
  }

  function tc() {
    var a = this;
    return {
      years: a.year(),
      months: a.month(),
      date: a.date(),
      hours: a.hours(),
      minutes: a.minutes(),
      seconds: a.seconds(),
      milliseconds: a.milliseconds()
    }
  }

  function uc() {
    return this.isValid() ? this.toISOString() : null
  }

  function vc() {
    return n(this)
  }

  function wc() {
    return j({}, m(this))
  }

  function xc() {
    return m(this).overflow
  }

  function yc() {
    return {
      input: this._i,
      format: this._f,
      locale: this._locale,
      isUTC: this._isUTC,
      strict: this._strict
    }
  }

  function zc(a, b) {
    U(0, [a, a.length], 0, b)
  }

  function Ac(a) {
    return Ec.call(this, a, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy)
  }

  function Bc(a) {
    return Ec.call(this, a, this.isoWeek(), this.isoWeekday(), 1, 4)
  }

  function Cc() {
    return xa(this.year(), 1, 4)
  }

  function Dc() {
    var a = this.localeData()._week;
    return xa(this.year(), a.dow, a.doy)
  }

  function Ec(a, b, c, d, e) {
    var f;
    return null == a ? wa(this, d, e).year : (f = xa(a, d, e), b > f && (b = f), Fc.call(this, a, b, c, d, e))
  }

  function Fc(a, b, c, d, e) {
    var f = va(a, b, c, d, e),
      g = ta(f.year, 0, f.dayOfYear);
    return this.year(g.getUTCFullYear()), this.month(g.getUTCMonth()), this.date(g.getUTCDate()), this
  }

  function Gc(a) {
    return null == a ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (a - 1) + this.month() % 3)
  }

  function Hc(a) {
    var b = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;
    return null == a ? b : this.add(a - b, "d")
  }

  function Ic(a, b) {
    b[ge] = u(1e3 * ("0." + a))
  }

  function Jc() {
    return this._isUTC ? "UTC" : ""
  }

  function Kc() {
    return this._isUTC ? "Coordinated Universal Time" : ""
  }

  function Lc(a) {
    return sb(1e3 * a)
  }

  function Mc() {
    return sb.apply(null, arguments).parseZone()
  }

  function Nc(a) {
    return a
  }

  function Oc(a, b, c, d) {
    var e = bb(),
      f = k().set(d, b);
    return e[c](f, a)
  }

  function Pc(a, b, c) {
    if (f(a) && (b = a, a = void 0), a = a || "", null != b) return Oc(a, b, c, "month");
    var d, e = [];
    for (d = 0; d < 12; d++) e[d] = Oc(a, d, c, "month");
    return e
  }

  function Qc(a, b, c, d) {
    "boolean" == typeof a ? (f(b) && (c = b, b = void 0), b = b || "") : (b = a, c = b, a = !1, f(b) && (c = b, b = void 0), b = b || "");
    var e = bb(),
      g = a ? e._week.dow : 0;
    if (null != c) return Oc(b, (c + g) % 7, d, "day");
    var h, i = [];
    for (h = 0; h < 7; h++) i[h] = Oc(b, (h + g) % 7, d, "day");
    return i
  }

  function Rc(a, b) {
    return Pc(a, b, "months")
  }

  function Sc(a, b) {
    return Pc(a, b, "monthsShort")
  }

  function Tc(a, b, c) {
    return Qc(a, b, c, "weekdays")
  }

  function Uc(a, b, c) {
    return Qc(a, b, c, "weekdaysShort")
  }

  function Vc(a, b, c) {
    return Qc(a, b, c, "weekdaysMin")
  }

  function Wc() {
    var a = this._data;
    return this._milliseconds = Ze(this._milliseconds), this._days = Ze(this._days), this._months = Ze(this._months), a.milliseconds = Ze(a.milliseconds), a.seconds = Ze(a.seconds), a.minutes = Ze(a.minutes), a.hours = Ze(a.hours), a.months = Ze(a.months), a.years = Ze(a.years), this
  }

  function Xc(a, b, c, d) {
    var e = Ob(b, c);
    return a._milliseconds += d * e._milliseconds, a._days += d * e._days, a._months += d * e._months, a._bubble()
  }

  function Yc(a, b) {
    return Xc(this, a, b, 1)
  }

  function Zc(a, b) {
    return Xc(this, a, b, -1)
  }

  function $c(a) {
    return a < 0 ? Math.floor(a) : Math.ceil(a)
  }

  function _c() {
    var a, b, c, d, e, f = this._milliseconds,
      g = this._days,
      h = this._months,
      i = this._data;
    return f >= 0 && g >= 0 && h >= 0 || f <= 0 && g <= 0 && h <= 0 || (f += 864e5 * $c(bd(h) + g), g = 0, h = 0), i.milliseconds = f % 1e3, a = t(f / 1e3), i.seconds = a % 60, b = t(a / 60), i.minutes = b % 60, c = t(b / 60), i.hours = c % 24, g += t(c / 24), e = t(ad(g)), h += e, g -= $c(bd(e)), d = t(h / 12), h %= 12, i.days = g, i.months = h, i.years = d, this
  }

  function ad(a) {
    return 4800 * a / 146097
  }

  function bd(a) {
    return 146097 * a / 4800
  }

  function cd(a) {
    var b, c, d = this._milliseconds;
    if (a = K(a), "month" === a || "year" === a) return b = this._days + d / 864e5, c = this._months + ad(b), "month" === a ? c : c / 12;
    switch (
      b = this._days + Math.round(bd(this._months)), a) {
      case "week":
        return b / 7 + d / 6048e5;
      case "day":
        return b + d / 864e5;
      case "hour":
        return 24 * b + d / 36e5;
      case "minute":
        return 1440 * b + d / 6e4;
      case "second":
        return 86400 * b + d / 1e3;
      case "millisecond":
        return Math.floor(864e5 * b) + d;
      default:
        throw new Error("Unknown unit " + a)
    }
  }

  function dd() {
    return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * u(this._months / 12)
  }

  function ed(a) {
    return function() {
      return this.as(a)
    }
  }

  function fd(a) {
    return a = K(a), this[a + "s"]()
  }

  function gd(a) {
    return function() {
      return this._data[a]
    }
  }

  function hd() {
    return t(this.days() / 7)
  }

  function id(a, b, c, d, e) {
    return e.relativeTime(b || 1, !!c, a, d)
  }

  function jd(a, b, c) {
    var d = Ob(a).abs(),
      e = of (d.as("s")),
      f = of (d.as("m")),
      g = of (d.as("h")),
      h = of (d.as("d")),
      i = of (d.as("M")),
      j = of (d.as("y")),
      k = e < pf.s && ["s", e] || f <= 1 && ["m"] || f < pf.m && ["mm", f] || g <= 1 && ["h"] || g < pf.h && ["hh", g] || h <= 1 && ["d"] || h < pf.d && ["dd", h] || i <= 1 && ["M"] || i < pf.M && ["MM", i] || j <= 1 && ["y"] || ["yy", j];
    return k[2] = b, k[3] = +a > 0, k[4] = c, id.apply(null, k)
  }

  function kd(a) {
    return void 0 === a ? of : "function" == typeof a && ( of = a, !0)
  }

  function ld(a, b) {
    return void 0 !== pf[a] && (void 0 === b ? pf[a] : (pf[a] = b, !0))
  }

  function md(a) {
    var b = this.localeData(),
      c = jd(this, !a, b);
    return a && (c = b.pastFuture(+this, c)), b.postformat(c)
  }

  function nd() {
    var a, b, c, d = qf(this._milliseconds) / 1e3,
      e = qf(this._days),
      f = qf(this._months);
    a = t(d / 60), b = t(a / 60), d %= 60, a %= 60,
      c = t(f / 12), f %= 12;
    var g = c,
      h = f,
      i = e,
      j = b,
      k = a,
      l = d,
      m = this.asSeconds();
    return m ? (m < 0 ? "-" : "") + "P" + (g ? g + "Y" : "") + (h ? h + "M" : "") + (i ? i + "D" : "") + (j || k || l ? "T" : "") + (j ? j + "H" : "") + (k ? k + "M" : "") + (l ? l + "S" : "") : "P0D"
  }
  var od, pd;
  pd = Array.prototype.some ? Array.prototype.some : function(a) {
    for (var b = Object(this), c = b.length >>> 0, d = 0; d < c; d++)
      if (d in b && a.call(this, b[d], d, b)) return !0;
    return !1
  };
  var qd = pd,
    rd = a.momentProperties = [],
    sd = !1,
    td = {};
  a.suppressDeprecationWarnings = !1, a.deprecationHandler = null;
  var ud;
  ud = Object.keys ? Object.keys : function(a) {
    var b, c = [];
    for (b in a) i(a, b) && c.push(b);
    return c
  };
  var vd, wd = ud,
    xd = {
      sameDay: "[Today at] LT",
      nextDay: "[Tomorrow at] LT",
      nextWeek: "dddd [at] LT",
      lastDay: "[Yesterday at] LT",
      lastWeek: "[Last] dddd [at] LT",
      sameElse: "L"
    },
    yd = {
      LTS: "h:mm:ss A",
      LT: "h:mm A",
      L: "MM/DD/YYYY",
      LL: "MMMM D, YYYY",
      LLL: "MMMM D, YYYY h:mm A",
      LLLL: "dddd, MMMM D, YYYY h:mm A"
    },
    zd = "Invalid date",
    Ad = "%d",
    Bd = /\d{1,2}/,
    Cd = {
      future: "in %s",
      past: "%s ago",
      s: "a few seconds",
      m: "a minute",
      mm: "%d minutes",
      h: "an hour",
      hh: "%d hours",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years"
    },
    Dd = {},
    Ed = {},
    Fd = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
    Gd = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
    Hd = {},
    Id = {},
    Jd = /\d/,
    Kd = /\d\d/,
    Ld = /\d{3}/,
    Md = /\d{4}/,
    Nd = /[+-]?\d{6}/,
    Od = /\d\d?/,
    Pd = /\d\d\d\d?/,
    Qd = /\d\d\d\d\d\d?/,
    Rd = /\d{1,3}/,
    Sd = /\d{1,4}/,
    Td = /[+-]?\d{1,6}/,
    Ud = /\d+/,
    Vd = /[+-]?\d+/,
    Wd = /Z|[+-]\d\d:?\d\d/gi,
    Xd = /Z|[+-]\d\d(?::?\d\d)?/gi,
    Yd = /[+-]?\d+(\.\d{1,3})?/,
    Zd = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
    $d = {},
    _d = {},
    ae = 0,
    be = 1,
    ce = 2,
    de = 3,
    ee = 4,
    fe = 5,
    ge = 6,
    he = 7,
    ie = 8;
  vd = Array.prototype.indexOf ? Array.prototype.indexOf : function(a) {
    var b;
    for (b = 0; b < this.length; ++b)
      if (this[b] === a) return b;
    return -1
  };
  var je = vd;
  U("M", ["MM", 2], "Mo", function() {
      return this.month() + 1
    }), U("MMM", 0, 0, function(a) {
      return this.localeData().monthsShort(this, a)
    }), U("MMMM", 0, 0, function(a) {
      return this.localeData().months(this, a)
    }),
    J("month", "M"),
    M("month", 8),
    Z("M", Od), Z("MM", Od, Kd), Z("MMM", function(a, b) {
      return b.monthsShortRegex(a)
    }), Z("MMMM", function(a, b) {
      return b.monthsRegex(a)
    }), ba(["M", "MM"], function(a, b) {
      b[be] = u(a) - 1
    }), ba(["MMM", "MMMM"], function(a, b, c, d) {
      var e = c._locale.monthsParse(a, d, c._strict);
      null != e ? b[be] = e : m(c).invalidMonth = a
    });
  var ke = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
    le = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    me = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    ne = Zd,
    oe = Zd;
  U("Y", 0, 0, function() {
      var a = this.year();
      return a <= 9999 ? "" + a : "+" + a
    }), U(0, ["YY", 2], 0, function() {
      return this.year() % 100
    }), U(0, ["YYYY", 4], 0, "year"), U(0, ["YYYYY", 5], 0, "year"), U(0, ["YYYYYY", 6, !0], 0, "year"),
    J("year", "y"),
    M("year", 1),
    Z("Y", Vd), Z("YY", Od, Kd), Z("YYYY", Sd, Md), Z("YYYYY", Td, Nd), Z("YYYYYY", Td, Nd), ba(["YYYYY", "YYYYYY"], ae), ba("YYYY", function(b, c) {
      c[ae] = 2 === b.length ? a.parseTwoDigitYear(b) : u(b)
    }), ba("YY", function(b, c) {
      c[ae] = a.parseTwoDigitYear(b)
    }), ba("Y", function(a, b) {
      b[ae] = parseInt(a, 10)
    }),
    a.parseTwoDigitYear = function(a) {
      return u(a) + (u(a) > 68 ? 1900 : 2e3)
    };
  var pe = O("FullYear", !0);
  U("w", ["ww", 2], "wo", "week"), U("W", ["WW", 2], "Wo", "isoWeek"),
    J("week", "w"), J("isoWeek", "W"),
    M("week", 5), M("isoWeek", 5),
    Z("w", Od), Z("ww", Od, Kd), Z("W", Od), Z("WW", Od, Kd), ca(["w", "ww", "W", "WW"], function(a, b, c, d) {
      b[d.substr(0, 1)] = u(a)
    });
  var qe = {
    dow: 0,
    doy: 6
  };
  U("d", 0, "do", "day"), U("dd", 0, 0, function(a) {
      return this.localeData().weekdaysMin(this, a)
    }), U("ddd", 0, 0, function(a) {
      return this.localeData().weekdaysShort(this, a)
    }), U("dddd", 0, 0, function(a) {
      return this.localeData().weekdays(this, a)
    }), U("e", 0, 0, "weekday"), U("E", 0, 0, "isoWeekday"),
    J("day", "d"), J("weekday", "e"), J("isoWeekday", "E"),
    M("day", 11), M("weekday", 11), M("isoWeekday", 11),
    Z("d", Od), Z("e", Od), Z("E", Od), Z("dd", function(a, b) {
      return b.weekdaysMinRegex(a)
    }), Z("ddd", function(a, b) {
      return b.weekdaysShortRegex(a)
    }), Z("dddd", function(a, b) {
      return b.weekdaysRegex(a)
    }), ca(["dd", "ddd", "dddd"], function(a, b, c, d) {
      var e = c._locale.weekdaysParse(a, d, c._strict);
      null != e ? b.d = e : m(c).invalidWeekday = a
    }), ca(["d", "e", "E"], function(a, b, c, d) {
      b[d] = u(a)
    });
  var re = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    se = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    te = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    ue = Zd,
    ve = Zd,
    we = Zd;
  U("H", ["HH", 2], 0, "hour"), U("h", ["hh", 2], 0, Ra), U("k", ["kk", 2], 0, Sa), U("hmm", 0, 0, function() {
      return "" + Ra.apply(this) + T(this.minutes(), 2)
    }), U("hmmss", 0, 0, function() {
      return "" + Ra.apply(this) + T(this.minutes(), 2) + T(this.seconds(), 2)
    }), U("Hmm", 0, 0, function() {
      return "" + this.hours() + T(this.minutes(), 2)
    }), U("Hmmss", 0, 0, function() {
      return "" + this.hours() + T(this.minutes(), 2) + T(this.seconds(), 2)
    }), Ta("a", !0), Ta("A", !1),
    J("hour", "h"),
    M("hour", 13), Z("a", Ua), Z("A", Ua), Z("H", Od), Z("h", Od), Z("HH", Od, Kd), Z("hh", Od, Kd), Z("hmm", Pd), Z("hmmss", Qd), Z("Hmm", Pd), Z("Hmmss", Qd), ba(["H", "HH"], de), ba(["a", "A"], function(a, b, c) {
      c._isPm = c._locale.isPM(a), c._meridiem = a
    }), ba(["h", "hh"], function(a, b, c) {
      b[de] = u(a), m(c).bigHour = !0
    }), ba("hmm", function(a, b, c) {
      var d = a.length - 2;
      b[de] = u(a.substr(0, d)), b[ee] = u(a.substr(d)), m(c).bigHour = !0
    }), ba("hmmss", function(a, b, c) {
      var d = a.length - 4,
        e = a.length - 2;
      b[de] = u(a.substr(0, d)), b[ee] = u(a.substr(d, 2)), b[fe] = u(a.substr(e)), m(c).bigHour = !0
    }), ba("Hmm", function(a, b, c) {
      var d = a.length - 2;
      b[de] = u(a.substr(0, d)), b[ee] = u(a.substr(d))
    }), ba("Hmmss", function(a, b, c) {
      var d = a.length - 4,
        e = a.length - 2;
      b[de] = u(a.substr(0, d)), b[ee] = u(a.substr(d, 2)), b[fe] = u(a.substr(e))
    });
  var xe, ye = /[ap]\.?m?\.?/i,
    ze = O("Hours", !0),
    Ae = {
      calendar: xd,
      longDateFormat: yd,
      invalidDate: zd,
      ordinal: Ad,
      ordinalParse: Bd,
      relativeTime: Cd,
      months: le,
      monthsShort: me,
      week: qe,
      weekdays: re,
      weekdaysMin: te,
      weekdaysShort: se,
      meridiemParse: ye
    },
    Be = {},
    Ce = {},
    De = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
    Ee = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
    Fe = /Z|[+-]\d\d(?::?\d\d)?/,
    Ge = [
      ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
      ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
      ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
      ["GGGG-[W]WW", /\d{4}-W\d\d/, !1],
      ["YYYY-DDD", /\d{4}-\d{3}/],
      ["YYYY-MM", /\d{4}-\d\d/, !1],
      ["YYYYYYMMDD", /[+-]\d{10}/],
      ["YYYYMMDD", /\d{8}/],
      ["GGGG[W]WWE", /\d{4}W\d{3}/],
      ["GGGG[W]WW", /\d{4}W\d{2}/, !1],
      ["YYYYDDD", /\d{7}/]
    ],
    He = [
      ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
      ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
      ["HH:mm:ss", /\d\d:\d\d:\d\d/],
      ["HH:mm", /\d\d:\d\d/],
      ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
      ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
      ["HHmmss", /\d\d\d\d\d\d/],
      ["HHmm", /\d\d\d\d/],
      ["HH", /\d\d/]
    ],
    Ie = /^\/?Date\((\-?\d+)/i;
  a.createFromInputFallback = x("value provided is not in a recognized ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function(a) {
      a._d = new Date(a._i + (a._useUTC ? " UTC" : ""))
    }),
    a.ISO_8601 = function() {};
  var Je = x("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
      var a = sb.apply(null, arguments);
      return this.isValid() && a.isValid() ? a < this ? this : a : o()
    }),
    Ke = x("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
      var a = sb.apply(null, arguments);
      return this.isValid() && a.isValid() ? a > this ? this : a : o()
    }),
    Le = function() {
      return Date.now ? Date.now() : +new Date
    };
  zb("Z", ":"), zb("ZZ", ""),
    Z("Z", Xd), Z("ZZ", Xd), ba(["Z", "ZZ"], function(a, b, c) {
      c._useUTC = !0, c._tzm = Ab(Xd, a)
    });
  var Me = /([\+\-]|\d\d)/gi;
  a.updateOffset = function() {};
  var Ne = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,
    Oe = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;
  Ob.fn = wb.prototype;
  var Pe = Sb(1, "add"),
    Qe = Sb(-1, "subtract");
  a.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ", a.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
  var Re = x("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function(a) {
    return void 0 === a ? this.localeData() : this.locale(a)
  });
  U(0, ["gg", 2], 0, function() {
      return this.weekYear() % 100
    }), U(0, ["GG", 2], 0, function() {
      return this.isoWeekYear() % 100
    }), zc("gggg", "weekYear"), zc("ggggg", "weekYear"), zc("GGGG", "isoWeekYear"), zc("GGGGG", "isoWeekYear"),
    J("weekYear", "gg"), J("isoWeekYear", "GG"),
    M("weekYear", 1), M("isoWeekYear", 1),
    Z("G", Vd), Z("g", Vd), Z("GG", Od, Kd), Z("gg", Od, Kd), Z("GGGG", Sd, Md), Z("gggg", Sd, Md), Z("GGGGG", Td, Nd), Z("ggggg", Td, Nd), ca(["gggg", "ggggg", "GGGG", "GGGGG"], function(a, b, c, d) {
      b[d.substr(0, 2)] = u(a)
    }), ca(["gg", "GG"], function(b, c, d, e) {
      c[e] = a.parseTwoDigitYear(b)
    }),
    U("Q", 0, "Qo", "quarter"),
    J("quarter", "Q"),
    M("quarter", 7),
    Z("Q", Jd), ba("Q", function(a, b) {
      b[be] = 3 * (u(a) - 1)
    }),
    U("D", ["DD", 2], "Do", "date"),
    J("date", "D"),
    M("date", 9),
    Z("D", Od), Z("DD", Od, Kd), Z("Do", function(a, b) {
      return a ? b._ordinalParse : b._ordinalParseLenient
    }), ba(["D", "DD"], ce), ba("Do", function(a, b) {
      b[ce] = u(a.match(Od)[0], 10)
    });
  var Se = O("Date", !0);
  U("DDD", ["DDDD", 3], "DDDo", "dayOfYear"),
    J("dayOfYear", "DDD"),
    M("dayOfYear", 4),
    Z("DDD", Rd), Z("DDDD", Ld), ba(["DDD", "DDDD"], function(a, b, c) {
      c._dayOfYear = u(a)
    }),
    U("m", ["mm", 2], 0, "minute"),
    J("minute", "m"),
    M("minute", 14),
    Z("m", Od), Z("mm", Od, Kd), ba(["m", "mm"], ee);
  var Te = O("Minutes", !1);
  U("s", ["ss", 2], 0, "second"),
    J("second", "s"),
    M("second", 15),
    Z("s", Od), Z("ss", Od, Kd), ba(["s", "ss"], fe);
  var Ue = O("Seconds", !1);
  U("S", 0, 0, function() {
      return ~~(this.millisecond() / 100)
    }), U(0, ["SS", 2], 0, function() {
      return ~~(this.millisecond() / 10)
    }), U(0, ["SSS", 3], 0, "millisecond"), U(0, ["SSSS", 4], 0, function() {
      return 10 * this.millisecond()
    }), U(0, ["SSSSS", 5], 0, function() {
      return 100 * this.millisecond()
    }), U(0, ["SSSSSS", 6], 0, function() {
      return 1e3 * this.millisecond()
    }), U(0, ["SSSSSSS", 7], 0, function() {
      return 1e4 * this.millisecond()
    }), U(0, ["SSSSSSSS", 8], 0, function() {
      return 1e5 * this.millisecond()
    }), U(0, ["SSSSSSSSS", 9], 0, function() {
      return 1e6 * this.millisecond()
    }),
    J("millisecond", "ms"),
    M("millisecond", 16),
    Z("S", Rd, Jd), Z("SS", Rd, Kd), Z("SSS", Rd, Ld);
  var Ve;
  for (Ve = "SSSS"; Ve.length <= 9; Ve += "S") Z(Ve, Ud);
  for (Ve = "S"; Ve.length <= 9; Ve += "S") ba(Ve, Ic);
  var We = O("Milliseconds", !1);
  U("z", 0, 0, "zoneAbbr"), U("zz", 0, 0, "zoneName");
  var Xe = r.prototype;
  Xe.add = Pe, Xe.calendar = Vb, Xe.clone = Wb, Xe.diff = bc, Xe.endOf = oc, Xe.format = gc, Xe.from = hc, Xe.fromNow = ic, Xe.to = jc, Xe.toNow = kc, Xe.get = R, Xe.invalidAt = xc, Xe.isAfter = Xb, Xe.isBefore = Yb, Xe.isBetween = Zb, Xe.isSame = $b, Xe.isSameOrAfter = _b, Xe.isSameOrBefore = ac, Xe.isValid = vc, Xe.lang = Re, Xe.locale = lc, Xe.localeData = mc, Xe.max = Ke, Xe.min = Je, Xe.parsingFlags = wc, Xe.set = S, Xe.startOf = nc, Xe.subtract = Qe, Xe.toArray = sc, Xe.toObject = tc, Xe.toDate = rc, Xe.toISOString = ec, Xe.inspect = fc, Xe.toJSON = uc, Xe.toString = dc, Xe.unix = qc, Xe.valueOf = pc, Xe.creationData = yc,
    Xe.year = pe, Xe.isLeapYear = ra,
    Xe.weekYear = Ac, Xe.isoWeekYear = Bc,
    Xe.quarter = Xe.quarters = Gc,
    Xe.month = ka, Xe.daysInMonth = la,
    Xe.week = Xe.weeks = Ba, Xe.isoWeek = Xe.isoWeeks = Ca, Xe.weeksInYear = Dc, Xe.isoWeeksInYear = Cc,
    Xe.date = Se, Xe.day = Xe.days = Ka, Xe.weekday = La, Xe.isoWeekday = Ma, Xe.dayOfYear = Hc,
    Xe.hour = Xe.hours = ze,
    Xe.minute = Xe.minutes = Te,
    Xe.second = Xe.seconds = Ue,
    Xe.millisecond = Xe.milliseconds = We,
    Xe.utcOffset = Db, Xe.utc = Fb, Xe.local = Gb, Xe.parseZone = Hb, Xe.hasAlignedHourOffset = Ib, Xe.isDST = Jb, Xe.isLocal = Lb, Xe.isUtcOffset = Mb, Xe.isUtc = Nb, Xe.isUTC = Nb,
    Xe.zoneAbbr = Jc, Xe.zoneName = Kc,
    Xe.dates = x("dates accessor is deprecated. Use date instead.", Se), Xe.months = x("months accessor is deprecated. Use month instead", ka), Xe.years = x("years accessor is deprecated. Use year instead", pe), Xe.zone = x("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", Eb), Xe.isDSTShifted = x("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", Kb);
  var Ye = C.prototype;
  Ye.calendar = D, Ye.longDateFormat = E, Ye.invalidDate = F, Ye.ordinal = G, Ye.preparse = Nc, Ye.postformat = Nc, Ye.relativeTime = H, Ye.pastFuture = I, Ye.set = A,
    Ye.months = fa, Ye.monthsShort = ga, Ye.monthsParse = ia, Ye.monthsRegex = na, Ye.monthsShortRegex = ma,
    Ye.week = ya, Ye.firstDayOfYear = Aa, Ye.firstDayOfWeek = za,
    Ye.weekdays = Fa, Ye.weekdaysMin = Ha, Ye.weekdaysShort = Ga, Ye.weekdaysParse = Ja, Ye.weekdaysRegex = Na, Ye.weekdaysShortRegex = Oa, Ye.weekdaysMinRegex = Pa,
    Ye.isPM = Va, Ye.meridiem = Wa, $a("en", {
      ordinalParse: /\d{1,2}(th|st|nd|rd)/,
      ordinal: function(a) {
        var b = a % 10,
          c = 1 === u(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
        return a + c
      }
    }),
    a.lang = x("moment.lang is deprecated. Use moment.locale instead.", $a), a.langData = x("moment.langData is deprecated. Use moment.localeData instead.", bb);
  var Ze = Math.abs,
    $e = ed("ms"),
    _e = ed("s"),
    af = ed("m"),
    bf = ed("h"),
    cf = ed("d"),
    df = ed("w"),
    ef = ed("M"),
    ff = ed("y"),
    gf = gd("milliseconds"),
    hf = gd("seconds"),
    jf = gd("minutes"),
    kf = gd("hours"),
    lf = gd("days"),
    mf = gd("months"),
    nf = gd("years"),
    of = Math.round,
    pf = {
      s: 45,
      m: 45,
      h: 22,
      d: 26,
      M: 11
    },
    qf = Math.abs,
    rf = wb.prototype;
  return rf.abs = Wc, rf.add = Yc, rf.subtract = Zc, rf.as = cd, rf.asMilliseconds = $e, rf.asSeconds = _e, rf.asMinutes = af, rf.asHours = bf, rf.asDays = cf, rf.asWeeks = df, rf.asMonths = ef, rf.asYears = ff, rf.valueOf = dd, rf._bubble = _c, rf.get = fd, rf.milliseconds = gf, rf.seconds = hf, rf.minutes = jf, rf.hours = kf, rf.days = lf, rf.weeks = hd, rf.months = mf, rf.years = nf, rf.humanize = md, rf.toISOString = nd, rf.toString = nd, rf.toJSON = nd, rf.locale = lc, rf.localeData = mc, rf.toIsoString = x("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", nd), rf.lang = Re, U("X", 0, 0, "unix"), U("x", 0, 0, "valueOf"), Z("x", Vd), Z("X", Yd), ba("X", function(a, b, c) {
    c._d = new Date(1e3 * parseFloat(a, 10))
  }), ba("x", function(a, b, c) {
    c._d = new Date(u(a))
  }), a.version = "2.17.1", b(sb), a.fn = Xe, a.min = ub, a.max = vb, a.now = Le, a.utc = k, a.unix = Lc, a.months = Rc, a.isDate = g, a.locale = $a, a.invalid = o, a.duration = Ob, a.isMoment = s, a.weekdays = Tc, a.parseZone = Mc, a.localeData = bb, a.isDuration = xb, a.monthsShort = Sc, a.weekdaysMin = Vc, a.defineLocale = _a, a.updateLocale = ab, a.locales = cb, a.weekdaysShort = Uc, a.normalizeUnits = K, a.relativeTimeRounding = kd, a.relativeTimeThreshold = ld, a.calendarFormat = Ub, a.prototype = Xe, a
});
/*! RESOURCE: Validate Client Script Functions */
function validateFunctionDeclaration(fieldName, functionName) {
  var code = g_form.getValue(fieldName);
  if (code == "")
    return true;
  code = removeCommentsFromClientScript(code);
  var patternString = "function(\\s+)" + functionName + "((\\s+)|\\(|\\[\r\n])";
  var validatePattern = new RegExp(patternString);
  if (!validatePattern.test(code)) {
    var msg = new GwtMessage().getMessage('Missing function declaration for') + ' ' + functionName;
    g_form.showErrorBox(fieldName, msg);
    return false;
  }
  return true;
}

function validateNoServerObjectsInClientScript(fieldName) {
  var code = g_form.getValue(fieldName);
  if (code == "")
    return true;
  code = removeCommentsFromClientScript(code);
  var doubleQuotePattern = /"[^"\r\n]*"/g;
  code = code.replace(doubleQuotePattern, "");
  var singleQuotePattern = /'[^'\r\n]*'/g;
  code = code.replace(singleQuotePattern, "");
  var rc = true;
  var gsPattern = /(\s|\W)gs\./;
  if (gsPattern.test(code)) {
    var msg = new GwtMessage().getMessage('The object "gs" should not be used in client scripts.');
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  var currentPattern = /(\s|\W)current\./;
  if (currentPattern.test(code)) {
    var msg = new GwtMessage().getMessage('The object "current" should not be used in client scripts.');
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  return rc;
}

function validateUIScriptIIFEPattern(fieldName, scopeName, scriptName) {
  var code = g_form.getValue(fieldName);
  var rc = true;
  if ("global" == scopeName)
    return rc;
  code = removeCommentsFromClientScript(code);
  code = removeSpacesFromClientScript(code);
  code = removeNewlinesFromClientScript(code);
  var requiredStart = "var" + scopeName + "=" + scopeName + "||{};" + scopeName + "." + scriptName + "=(function(){\"usestrict\";";
  var requiredEnd = "})();";
  if (!code.startsWith(requiredStart)) {
    var msg = new GwtMessage().getMessage("Missing closure assignment.");
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  if (!code.endsWith(requiredEnd)) {
    var msg = new GwtMessage().getMessage("Missing immediately-invoked function declaration end.");
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  return rc;
}

function validateNotCallingFunction(fieldName, functionName) {
  var code = g_form.getValue(fieldName);
  var rc = true;
  var reg = new RegExp(functionName, "g");
  var matches;
  code = removeCommentsFromClientScript(code);
  if (code == '')
    return rc;
  matches = code.match(reg);
  rc = (matches && (matches.length == 1));
  if (!rc) {
    var msg = "Do not explicitly call the " + functionName + " function in your business rule. It will be called automatically at execution time.";
    msg = new GwtMessage().getMessage(msg);
    g_form.showErrorBox(fieldName, msg);
  }
  return rc;
}

function removeCommentsFromClientScript(code) {
  var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
  code = code.replace(pattern1, "");
  var pattern2 = /\/\/.*/g;
  code = code.replace(pattern2, "");
  return code;
}

function removeSpacesFromClientScript(code) {
  var pattern = /\s*/g;
  return code.replace(pattern, "");
}

function removeNewlinesFromClientScript(code) {
  var pattern = /[\r\n]*/g;
  return code.replace(pattern, "");
}
/*! RESOURCE: UI14Help */
addLoadEvent(function() {
  if (!window.$j || window.location.pathname.indexOf('/navpage.do') != 0 || document.documentElement.getAttribute('data-doctype') != 'true')
    return;
  $j(function($) {
    var showPopup = getPreference('glide.ui.show_ui14_help');
    if (!showPopup || showPopup == 'false')
      return;
    $j(function($) {
      var gb = new GlideOverlay({
        title: '',
        width: '90%',
        maxWidth: 800,
        height: '90%',
        minHeight: 300,
        id: 'ui14_help',
        iframe: 'navpage_getting_started_ui14.do',
        draggable: false,
        showClose: true,
        fadeInTime: 250,
        onBeforeLoad: function() {
          $('#ui14_help .gb_close').addClass('icon-cross-circle').css('font-size', '1.2rem');
        },
        onAfterLoad: function() {
          setPreference('glide.ui.show_ui14_help', 'false');
        }
      });
      gb.render();
    });
  });
});
/*! RESOURCE: ModalOverlayUtil */
var ModalOverlayUtil = Class.create();
ModalOverlayUtil.prototype = {
  initialize: function(userOverlayStyle, userDialogStyle) {
    this.createModalWindow(userOverlayStyle, userDialogStyle);
  },
  createModalWindow: function(userOverlayStyle, userDialogStyle) {
    defaultModalOverlayStyles = {
      overlayStyle: ['backgroundColor:#000', 'height:100%', 'width:100%', 'opacity:0.60', 'position:fixed', 'top:0px', 'left:0px', 'zIndex:1000'],
      dialogStyle: ['backgroundColor:#fff', 'border:1px solid #000', 'width:400px', 'height:234px', 'boxShadow:1px 1px 10px #222', 'padding:10px', 'position:fixed', 'left:50%', 'top:0px', 'marginLeft:-250px', 'marginTop:50px', 'zIndex:1001']
    };
    var styleNameValuePair = '';
    var styleName = '';
    var styleValue = '';
    var modalOverlay = document.createElement('div');
    modalOverlay.className = 'modalOverlay';
    modalOverlay.id = 'modalOverlay';
    var defaultOverlayStyle = defaultModalOverlayStyles.overlayStyle;
    for (var i = 0; i < defaultOverlayStyle.length; i++) {
      styleNameValuePair = defaultOverlayStyle[i].split(':');
      styleName = styleNameValuePair[0];
      styleValue = styleNameValuePair[1];
      modalOverlay.style[styleName] = styleValue;
    }
    var modalDialogContainer = document.createElement('div');
    modalDialogContainer.className = 'modalDialogContainer';
    modalDialogContainer.id = 'modalDialogContainer';
    styleNameValuePair = '';
    var defaultDialogStyle = defaultModalOverlayStyles.dialogStyle;
    for (var j = 0; j < defaultDialogStyle.length; j++) {
      styleNameValuePair = defaultDialogStyle[j].split(':');
      styleName = styleNameValuePair[0];
      styleValue = styleNameValuePair[1];
      modalDialogContainer.style[styleName] = styleValue;
    }
    if (userOverlayStyle != null && typeof userOverlayStyle !== 'undefined') {
      for (i = 0; i < userOverlayStyle.length; i++) {
        styleNameValuePair = userOverlayStyle[i].split(':');
        styleName = styleNameValuePair[0];
        styleValue = styleNameValuePair[1];
        modalOverlay.style[styleName] = styleValue;
      }
    }
    if (userDialogStyle != null && typeof userDialogStyle !== 'undefined') {
      for (j = 0; j < userDialogStyle.length; j++) {
        styleNameValuePair = userDialogStyle[j].split(':');
        styleName = styleNameValuePair[0];
        styleValue = styleNameValuePair[1];
        modalDialogContainer.style[styleName] = styleValue;
      }
    }
    document.body.appendChild(modalOverlay);
    var modalDialogTitle = this._createModalDialogTitle();
    var modalDialogContentContainer = document.createElement('div');
    modalDialogContentContainer.className = 'overlayContentContainer';
    modalDialogContentContainer.id = 'overlayContentContainer';
    modalDialogContainer.appendChild(modalDialogTitle);
    modalDialogContainer.appendChild(modalDialogContentContainer);
    document.body.appendChild(modalDialogContainer);
  },
  _createModalDialogTitle: function() {
    var titleContainer = document.createElement('div');
    titleContainer.className = 'overlayTitleContainer';
    titleContainer.id = 'overlayTitleContainer';
    titleContainer.style.width = '100%';
    titleContainer.style.height = '25px';
    var title = document.createElement('div');
    title.className = 'overlayTitle';
    title.id = 'overlayTitle';
    title.style.width = '95%';
    title.style.cssFloat = 'left';
    title.style.styleFloat = 'left';
    title.style.fontSize = 'x-large';
    title.style.fontWeight = 'bold';
    title.style.paddingBottom = '10px';
    title.style.marginLeft = '5px';
    var closeButton = document.createElement('div');
    closeButton.className = 'overlayCloseButton';
    closeButton.id = 'overlayCloseButton';
    closeButton.style.width = '3%';
    closeButton.style.cssFloat = 'left';
    closeButton.style.styleFloat = 'left';
    closeButton.innerHTML = 'X';
    closeButton.style.fontSize = 'medium';
    closeButton.style.textAlign = 'right';
    closeButton.style.color = 'red';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = this._destroyModalWindow;
    var clear = document.createElement('div');
    clear.style.clear = 'both';
    titleContainer.appendChild(title);
    titleContainer.appendChild(closeButton);
    titleContainer.appendChild(clear);
    return titleContainer;
  },
  _destroyModalWindow: function() {
    var modalDialogContainer = document.getElementById('modalDialogContainer');
    var modalOverlay = document.getElementById('modalOverlay');
    document.body.removeChild(modalDialogContainer);
    document.body.removeChild(modalOverlay);
  },
  setTitle: function(title) {
    var overlayTitle = document.getElementById('overlayTitle');
    overlayTitle.innerHTML = title;
  },
  setContent: function(content) {
    var overlayContentContainer = document.getElementById('overlayContentContainer');
    overlayContentContainer.appendChild(content);
  },
  type: 'ModalOverlayUtil'
};
/*! RESOURCE: DateTimeUtil */
var DateTimeUtil = Class.create();
DateTimeUtil.prototype = {
  initialize: function() {},
  isFutureDate: function(dateValue) {
    var gwtDateValue = new GwtDate(dateValue);
    var currentDate = new Date();
    var currentTimeStr = currentDate.toTimeString();
    var timeParts = currentTimeStr.split(' ');
    var gwtCurrentDate = new GwtDate(currentDate.getFullYear() + '-' + (parseInt(currentDate.getMonth(), 10) + 1) + '-' + currentDate.getDate() + ' ' + timeParts[0]);
    return gwtDateValue.compare(gwtCurrentDate, true) > 0;
  },
  isBefore: function(firstDateValue, secondDateValue) {
    var gwtFirstDateValue = new GwtDate(firstDateValue);
    var gwtSecondDateValue = new GwtDate(secondDateValue);
    return gwtSecondDateValue.compare(gwtFirstDateValue, true) > 0;
  },
  isAfter: function(firstDateValue, secondDateValue) {
    var gwtFirstDateValue = new GwtDate(firstDateValue);
    var gwtSecondDateValue = new GwtDate(secondDateValue);
    return gwtFirstDateValue.compare(gwtSecondDateValue, true) > 0;
  },
  isEqual: function(firstDateValue, secondDateValue) {
    var gwtFirstDateValue = new GwtDate(firstDateValue);
    var gwtSecondDateValue = new GwtDate(secondDateValue);
    return gwtFirstDateValue.compare(gwtSecondDateValue, true) == 0;
  },
  subtractDays: function(dateValue, days, formattedDate) {
    var gwtDateValue = new GwtDate(dateValue);
    gwtDateValue.subtractDays(days);
    if (formattedDate) {
      return this.getFormattedDate(gwtDateValue.toString());
    }
    return gwtDateValue;
  },
  addDays: function(dateValue, days, formattedDate) {
    var gwtDateValue = new GwtDate(dateValue);
    gwtDateValue.addDays(days);
    if (formattedDate) {
      return this.getFormattedDate(gwtDateValue.toString());
    }
    return gwtDateValue;
  },
  getFormattedDate: function(dateValue, format) {
    if (format == null || format == '') {
      format = 'EE MMM dd KK:mm:ss a';
    }
    var gwtDateValue = new GwtDate(dateValue);
    return gwtDateValue.formatDate(format);
  },
  _getDaySuffix: function(dayOfTheMonth) {
    var suffix;
    var day = parseInt(dayOfTheMonth);
    if (day == 1 || day == 21 || day == 31) {
      suffix = 'st';
    } else if (day == 2 || day == 22) {
      suffix = 'nd';
    } else if (day == 3 || day == 23) {
      suffix = 'rd';
    } else {
      suffix = 'th';
    }
    return suffix;
  },
  type: 'DateTimeUtil'
};
/*! RESOURCE: ProjectTaskUtil */
var ProjectTaskUtil = Class.create();
ProjectTaskUtil.prototype = {
  initialize: function() {},
  type: 'ProjectTaskUtil'
};
ProjectTaskUtil.decodeOnLoadActualDatesState = function(response) {
  var result = (response.responseXML.getElementsByTagName('result'))[0];
  var status = result.getAttribute('status');
  var workStartReadOnly = true;
  var workEndReadOnly = true;
  if (status == 'success') {
    var state = result.getAttribute('state');
    if (state == 'closed') {
      workStartReadOnly = false;
      workEndReadOnly = false;
    } else if (state == 'started')
      workStartReadOnly = false;
  }
  return {
    workStartReadOnly: workStartReadOnly,
    workEndReadOnly: workEndReadOnly
  };
};
ProjectTaskUtil.decodeOnChangeActualDatesState = function(response) {
  var result = (response.responseXML.getElementsByTagName('result'))[0];
  var state = JSON.parse(result.getAttribute('state'));
  return {
    workStartState: ProjectTaskUtil._decodeActualStartDateState(state.work_start_state),
    workEndState: ProjectTaskUtil._decodeActualEndDateState(state.work_end_state)
  };
};
ProjectTaskUtil._decodeActualStartDateState = function(result) {
  var workStartState = {
    date: '',
    readOnly: true
  };
  var status = result.work_start_status;
  if (status == 'success') {
    var state = result.work_start_state;
    if (state == 'already_started' || state == 'about_to_start') {
      workStartState.readOnly = false;
      workStartState.date = result.work_start;
    }
  }
  return workStartState;
};
ProjectTaskUtil._decodeActualEndDateState = function(result) {
  var workEndState = {
    date: '',
    readOnly: true
  };
  var status = result.work_end_status;
  if (status == 'success') {
    var state = result.work_end_state;
    if (state == 'already_closed' || state == 'about_to_close') {
      workEndState.readOnly = false;
      workEndState.date = result.work_end;
    }
  }
  return workEndState;
};
/*! RESOURCE: tagit_workaround */
addLoadEvent(function() {
  if (!window.$j || !window.$j.widget)
    return;
  var $ = $j;
  $.widget('ui.newtagit', {
    options: {
      allowDuplicates: false,
      caseSensitive: true,
      fieldName: 'tags',
      placeholderText: null,
      readOnly: false,
      removeConfirmation: false,
      labelLimit: null,
      availableLabels: [],
      autocomplete: {},
      showAutocompleteOnFocus: false,
      allowSpaces: false,
      singleField: false,
      singleFieldDelimiter: ',',
      singleFieldNode: null,
      animate: true,
      tabIndex: null,
      beforeTagAdded: null,
      afterTagAdded: null,
      beforeTagRemoved: null,
      afterTagRemoved: null,
      onTagClicked: null,
      onTagLimitExceeded: null,
      onTagAdded: null,
      onTagRemoved: null,
      tagSource: null
    },
    _create: function() {
      var that = this;
      if (this.element.is('input')) {
        this.tagList = $('<ul></ul>').insertAfter(this.element);
        this.options.singleField = true;
        this.options.singleFieldNode = this.element;
        this.element.css('display', 'none');
      } else {
        this.tagList = this.element.find('ul, ol').andSelf().last();
      }
      this.tagInput = $('<input type="text" autocorrect="off" autocomplete="off"/>').addClass('ui-widget-content');
      if (this.options.readOnly) this.tagInput.attr('disabled', 'disabled');
      if (this.options.tabIndex) {
        this.tagInput.attr('tabindex', this.options.tabIndex);
      }
      if (this.options.placeholderText) {
        this.tagInput.attr('placeholder', this.options.placeholderText);
      }
      if (!this.options.autocomplete.source) {
        this.options.autocomplete.source = function(search, showChoices) {
          var filter = search.term.toLowerCase();
          var choices = $.grep(this.options.availableLabels, function(element) {
            return (element.toLowerCase().indexOf(filter) === 0);
          });
          showChoices(this._subtractArray(choices, this.assignedTags()));
        };
      }
      if (this.options.showAutocompleteOnFocus) {
        this.tagInput.focus(function(event, ui) {
          that._showAutocomplete();
        });
        if (typeof this.options.autocomplete.minLength === 'undefined') {
          this.options.autocomplete.minLength = 0;
        }
      }
      if ($.isFunction(this.options.autocomplete.source)) {
        this.options.autocomplete.source = $.proxy(this.options.autocomplete.source, this);
      }
      if ($.isFunction(this.options.tagSource)) {
        this.options.tagSource = $.proxy(this.options.tagSource, this);
      }
      this.tagList
        .addClass('tagit')
        .addClass('ui-widget ui-widget-content ui-corner-all')
        .append($('<li class="tagit-new"></li>').append(this.tagInput));
      if (this.options.context == 'list') {
        this.tagList.css('width', '96%')
          .css('max-height', '65px')
      }
      this.tagList.click(function(e) {
        var target = $(e.target);
        if (target.hasClass('tagit-label')) {
          var tag = target.closest('.tagit-choice');
          if (!tag.hasClass('removed')) {
            that._trigger('onTagClicked', e, {
              tag: tag,
              tagLabel: that.tagLabel(tag)
            });
          }
        } else if (that.options.context == 'list') {
          if (target.hasClass('tagit-more'))
            target = target.parent();
          target.css('max-height', '');
          target.find('.tagit-new').css('display', 'inline-block').show();
          target.find('.tagit-more').hide();
        }
      });
      var addedExistingFromSingleFieldNode = false;
      if (this.options.singleField) {
        if (this.options.singleFieldNode) {
          var node = $(this.options.singleFieldNode);
          var tags = node.val().split(this.options.singleFieldDelimiter);
          node.val('');
          $.each(tags, function(index, tag) {
            that.createTag(tag, null, true);
            addedExistingFromSingleFieldNode = true;
          });
        } else {
          this.options.singleFieldNode = $('<input type="hidden" style="display:none;" value="" name="' + this.options.fieldName + '" />');
          this.tagList.after(this.options.singleFieldNode);
        }
      }
      var labelsList = JSON.parse(this.options.labelsListString).set;
      for (var i = 0; i < labelsList.length; i++) {
        if (i == 0 && this.options.context == 'list') {
          that.tagList.find('.tagit-new').hide();
          var height = that.tagList.height();
          var $tagitMore = $('<li class="tagit-more" style="height:' + height + '">...</li>');
          that.tagList.append($tagitMore);
        }
        var label = labelsList[i];
        var newTag = that.createTag(label.name, $(this).attr('class'), true, label);
      }
      this.tagInput
        .unbind('keydown').keydown(function(event) {
          if (event.which == $.ui.keyCode.BACKSPACE && that.tagInput.val() === '') {
            var tag = that._lastTag();
            if (!that.options.removeConfirmation || tag.hasClass('remove')) {
              that.removeTagById(tag, tag.attr('id'));
              if (that.options.showAutocompleteOnFocus) {
                setTimeout(function() {
                  that._showAutocomplete();
                }, 0);
              }
            } else if (that.options.removeConfirmation) {
              tag.addClass('remove ui-state-highlight');
            }
          } else if (that.options.removeConfirmation) {
            that._lastTag().removeClass('remove ui-state-highlight');
          }
          if (
            event.which === $.ui.keyCode.COMMA ||
            event.which === $.ui.keyCode.ENTER ||
            (
              event.which == $.ui.keyCode.TAB &&
              that.tagInput.val() !== ''
            ) ||
            (
              event.which == $.ui.keyCode.SPACE &&
              that.options.allowSpaces !== true &&
              (
                $.trim(that.tagInput.val()).replace(/^s*/, '').charAt(0) != '"' ||
                (
                  $.trim(that.tagInput.val()).charAt(0) == '"' &&
                  $.trim(that.tagInput.val()).charAt($.trim(that.tagInput.val()).length - 1) == '"' &&
                  $.trim(that.tagInput.val()).length - 1 !== 0
                )
              )
            )
          ) {
            if (!(event.which === $.ui.keyCode.ENTER && that.tagInput.val() === '')) {
              event.preventDefault();
            }
            that.createTag(that._cleanedInput());
            that.tagInput.autocomplete('close');
          }
        }).blur(function(e) {
          if (!that.tagInput.data('autocomplete-open')) {
            that.createTag(that._cleanedInput());
          }
        });
      if (this.options.availableLabels || this.options.tagSource || this.options.autocomplete.source) {
        var autocompleteOptions = {
          select: function(event, ui) {
            that.createTag(ui.item.value);
            return false;
          }
        };
        $.extend(autocompleteOptions, this.options.autocomplete);
        autocompleteOptions.source = this.options.tagSource || autocompleteOptions.source;
        this.tagInput.autocomplete(autocompleteOptions).bind('autocompleteopen', function(event, ui) {
          that.tagInput.data('autocomplete-open', true);
        }).bind('autocompleteclose', function(event, ui) {
          that.tagInput.data('autocomplete-open', false)
        });
      }
    },
    _cleanedInput: function() {
      return $.trim(this.tagInput.val().replace(/^"(.*)"$/, '$1'));
    },
    _lastTag: function() {
      return this.tagList.find('.tagit-choice:last:not(.removed)');
    },
    _tags: function() {
      return this.tagList.find('.tagit-choice:not(.removed)');
    },
    assignedTags: function() {
      var that = this;
      var tags = [];
      if (this.options.singleField) {
        tags = $(this.options.singleFieldNode).val().split(this.options.singleFieldDelimiter);
        if (tags[0] === '') {
          tags = [];
        }
      } else {
        this._tags().each(function() {
          tags.push(that.tagLabel(this));
        });
      }
      return tags;
    },
    _updateSingleTagsField: function(tags) {
      $(this.options.singleFieldNode).val(tags.join(this.options.singleFieldDelimiter)).trigger('change');
    },
    _subtractArray: function(a1, a2) {
      var result = [];
      for (var i = 0; i < a1.length; i++) {
        if ($.inArray(a1[i], a2) == -1) {
          result.push(a1[i]);
        }
      }
      return result;
    },
    tagLabel: function(tag) {
      var label;
      var pile = $(tag).find('.tagit-label:first');
      if (typeof pile != "undefined") {
        label = pile.text();
      } else {
        label = $(tag).find('input:first').val();
      }
      return label;
    },
    _showAutocomplete: function() {
      this.tagInput.autocomplete('search', '');
    },
    _findTagByLabel: function(name) {
      var that = this;
      var tag = null;
      this._tags().each(function(i) {
        if (that._formatStr(name) == that._formatStr(that.tagLabel(this))) {
          tag = $(this);
          return false;
        }
      });
      return tag;
    },
    _isNew: function(name) {
      return !this._findTagByLabel(name);
    },
    _formatStr: function(str) {
      if (this.options.caseSensitive) {
        return str;
      }
      return $.trim(str.toLowerCase());
    },
    _effectExists: function(name) {
      return Boolean($.effects && ($.effects[name] || ($.effects.effect && $.effects.effect[name])));
    },
    createTag: function(value, additionalClass, duringInitialization, labelJson) {
      if (typeof labelJson == 'undefined')
        labelJson = {
          type: 'ANY',
          bgcolor: '#6ab7ef',
          owner: true,
          sysId: 'new',
          query: '',
          tcolor: '#fff'
        };
      var that = this;
      value = $.trim(value);
      if (value === '') {
        return false;
      }
      var displayValue = value;
      if (displayValue.length > 15)
        displayValue = value.substring(0, 15) + '...';
      if (!this.options.allowDuplicates && !this._isNew(value)) {
        var existingTag = this._findTagByLabel(value);
        if (this._trigger('onTagExists', null, {
            existingTag: existingTag,
            duringInitialization: duringInitialization
          }) !== false) {
          if (this._effectExists('highlight')) {
            existingTag.effect('highlight');
          }
        }
        return false;
      }
      if (this.options.labelLimit && this._tags().length >= this.options.labelLimit) {
        this._trigger('onTagLimitExceeded', null, {
          duringInitialization: duringInitialization
        });
        return false;
      }
      if (labelJson.tcolor == "") labelJson.tcolor = "#fff";
      var label = $((this.options.onTagClicked || g_enhanced_activated == 'true') ? '<a style="color:' + labelJson.tcolor + '" class="tagit-label"></a>' : '<span class="tagit-label"></span>')
        .text(displayValue);
      if (labelJson.uncommon)
        label.css("font-style", "italic");
      if (!this.options.query) {
        label.click(function() {
          window.open(that.options.table + "_list.do?sysparm_query=" + labelJson.query);
        });
      } else {
        label.click(function() {
          var list = GlideList2.get(that.options.table);
          list.addFilter(labelJson.query);
          list.refresh(1);
        });
      }
      var tag = $('<li></li>')
        .addClass('tagit-choice ui-widget-content ui-state-default ui-corner-all')
        .addClass(additionalClass)
        .attr('id', labelJson.sysId)
        .css('background-color', labelJson.bgcolor)
        .css('color', labelJson.tcolor);
      if (this.options.readOnly) {
        tag.addClass('tagit-choice-read-only');
        tag.append(label);
      } else {
        tag.addClass('tagit-choice-editable');
        var removeTagIcon = $('<span></span>')
          .addClass('ui-icon ui-icon-close');
        var removeTag = $('<a><span style="color:' + labelJson.tcolor + '" class="text-icon icon-cross"></span></a>')
          .addClass('tagit-close')
          .append(removeTagIcon)
          .click(function(e) {
            that.removeTagById(tag, this.up("li").getAttribute("id"));
            e.stopPropagation();
          });
        if (g_enhanced_activated == 'true') {
          var icon = (labelJson.type == 'SHARED') ? 'icon-user-group' : 'icon-user';
          if (labelJson.type == "SHARED") {
            tag.addClass("tagit-share-group");
          } else {
            tag.addClass("tagit-share-user");
          }
          var shareTag = $('<span><span class="' + icon + '" style="color:' + labelJson.tcolor + ';margin-left:2px;"></span></span>')
            .addClass('tagit-share');
          if (labelJson.owner == true)
            shareTag.addClass("pointerhand");
          shareTag.attr('id', value);
          if (labelJson.owner == true) {
            shareTag.attr('title', 'Edit tag audience');
            shareTag.click(function(e) {
              showTagForm(this.up("li").getAttribute("id"));
            });
          }
        }
        if (g_enhanced_activated == 'true')
          tag.append(shareTag);
        tag.append(label);
      }
      tag.append(removeTag);
      if (!this.options.singleField) {
        var escapedValue = label.html();
        tag.append('<input type="hidden" style="display:none;" value="' + escapedValue + '" name="' + this.options.fieldName + '" />');
      }
      if (this._trigger('beforeTagAdded', null, {
          tag: tag,
          tagLabel: this.tagLabel(tag),
          duringInitialization: duringInitialization
        }) === false) {
        return;
      }
      if (this.options.singleField) {
        var tags = this.assignedTags();
        tags.push(value);
        this._updateSingleTagsField(tags);
      }
      this._trigger('onTagAdded', null, tag, this.options.table, this.options.rowId);
      this.tagInput.val('');
      this.tagInput.parent().before(tag);
      this._trigger('afterTagAdded', null, {
        tag: tag,
        tagLabel: value,
        type: labelJson.type,
        duringInitialization: duringInitialization,
        table: this.options.table,
        rowId: this.options.rowId
      });
      if (this.options.showAutocompleteOnFocus && !duringInitialization) {
        var currentActiveElement = document.activeElement;
        setTimeout(function() {
          if (document.activeElement !== currentActiveElement)
            return;
          that.preserveCursor(document.activeElement);
          that._showAutocomplete();
        }, 0);
      }
      return tag;
    },
    removeTag: function(tag, animate) {
      animate = typeof animate === 'undefined' ? this.options.animate : animate;
      tag = $(tag);
      this._trigger('onTagRemoved', null, tag, this.options.table, this.options.rowId);
      if (this._trigger('beforeTagRemoved', null, {
          tag: tag,
          tagLabel: this.tagLabel(tag)
        }) === false) {
        return;
      }
      if (this.options.singleField) {
        var tags = this.assignedTags();
        var removedTagLabel = this.tagLabel(tag);
        tags = $.grep(tags, function(el) {
          return el != removedTagLabel;
        });
        this._updateSingleTagsField(tags);
      }
      if (animate) {
        tag.addClass('removed');
        var hide_args = this._effectExists('blind') ? ['blind', {
          direction: 'horizontal'
        }, 'fast'] : ['fast'];
        hide_args.push(function() {
          tag.remove();
        });
        tag.fadeOut('fast').hide.apply(tag, hide_args).dequeue();
      } else {
        tag.remove();
      }
      this._trigger('afterTagRemoved', null, {
        tag: tag,
        tagLabel: this.tagLabel(tag),
        table: this.options.table,
        rowId: this.options.rowId
      });
    },
    removeTagById: function(tag, id, animate) {
      animate = typeof animate === 'undefined' ? this.options.animate : animate;
      tag = $(tag);
      this._trigger('onTagRemoved', null, tag, this.options.table, this.options.rowId);
      if (this._trigger('beforeTagRemoved', null, {
          tag: id,
          tagLabel: this.tagLabel(tag)
        }) === false) {
        return;
      }
      if (this.options.singleField) {
        var tags = this.assignedTags();
        var removedTagLabel = this.tagLabel(tag);
        tags = $.grep(tags, function(el) {
          return el != removedTagLabel;
        });
        this._updateSingleTagsField(tags);
      }
      if (animate) {
        tag.addClass('removed');
        var hide_args = this._effectExists('blind') ? ['blind', {
          direction: 'horizontal'
        }, 'fast'] : ['fast'];
        hide_args.push(function() {
          tag.remove();
        });
        tag.fadeOut('fast').hide.apply(tag, hide_args).dequeue();
      } else {
        tag.remove();
      }
      this._trigger('afterTagRemoved', null, {
        tag: id,
        tagLabel: this.tagLabel(tag),
        table: this.options.table,
        rowId: this.options.rowId
      });
    },
    removeTagByLabel: function(tagLabel, animate) {
      var toRemove = this._findTagByLabel(tagLabel);
      if (!toRemove) {
        throw "No such tag exists with the name '" + tagLabel + "'";
      }
      this.removeTag(toRemove, animate);
    },
    removeAll: function() {
      var that = this;
      this._tags().each(function(index, tag) {
        that.removeTag(tag, false);
      });
    },
    preserveCursor: function(el) {
      if (!el)
        return;
      var initialValue = el.value;
      el.value = initialValue + 1;
      el.value = initialValue;
    }
  });
});
/*! RESOURCE: ScrumTaskDialog */
var ScrumTaskDialog = Class.create(GlideDialogWindow, {
  initialize: function() {
    if (typeof g_list != "undefined")
      this.list = g_list;
    else
      this.list = null;
    this.storyID = typeof rowSysId == 'undefined' ? (gel('sys_uniqueValue') ? gel('sys_uniqueValue').value : "") : rowSysId;
    this.setUpFacade();
    this.setUpEvents();
    this.display(true);
    this.checkOKButton();
    this.setWidth(155);
    this.focusFirstSelectElement();
  },
  toggleOKButton: function(visible) {
    $("ok").style.display = (visible ? "inline" : "none");
  },
  setUpFacade: function() {
    GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
    this.setTitle(getMessage("Add Scrum Tasks"));
    var mapCount = this.getTypeCounts();
    this.setBody(this.getMarkUp(mapCount), false, false);
  },
  checkOKButton: function() {
    var visible = false;
    var thisDialog = this;
    this.container.select("select").each(function(elem) {
      if (elem.value + "" != "0")
        visible = true;
      if (!elem.onChangeAdded) {
        elem.onChangeAdded = true;
        elem.on("change", function() {
          thisDialog.checkOKButton();
        });
      }
    });
    this.toggleOKButton(visible);
  },
  focusFirstSelectElement: function() {
    this.container.select("select")[0].focus();
  },
  getTypeCounts: function() {
    var mapLabel = this.getLabels("rm_scrum_task", "type");
    var mapCount = {};
    for (var strKey in mapLabel) {
      mapCount[strKey] = getPreference("com.snc.sdlc.scrum.pp.tasks." + strKey, 0);
    }
    return mapCount;
  },
  setUpEvents: function() {
    var dialog = this;
    $("ok").on("click", function() {
      var mapTaskData = {};
      if (dialog.fillDataMap(mapTaskData)) {
        var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
        for (var strKey in mapTaskData) {
          taskProducer.addParam("sysparm_" + strKey, mapTaskData[strKey]);
        }
        dialog.showStatus("Adding tasks...");
        taskProducer.getXML(function() {
          dialog.refresh();
          dialog._onCloseClicked();
        });
      } else {
        dialog._onCloseClicked();
      }
    });
    $("cancel").on("click", function() {
      dialog._onCloseClicked();
    });
  },
  refresh: function() {
    if (this.list)
      this.list.refresh();
    else
      this.reloadList("rm_story.rm_scrum_task.story");
  },
  getSysID: function() {
    return this.storyID;
  },
  fillDataMap: function(mapTaskData) {
    var bTasksRequired = false;
    mapTaskData.name = "createTasks";
    mapTaskData.sys_id = this.getSysID();
    var mapDetails = this.getLabels("rm_scrum_task", "type");
    var arrTaskTypes = [];
    for (var key in mapDetails) {
      arrTaskTypes.push(key);
    }
    for (var nSlot = 0; nSlot < arrTaskTypes.length; ++nSlot) {
      var strTaskType = arrTaskTypes[nSlot];
      var strTaskData = $(strTaskType).getValue();
      mapTaskData[strTaskType] = strTaskData;
      setPreference("com.snc.sdlc.scrum.pp.tasks." + strTaskType, strTaskData);
      if (strTaskData != "0") {
        bTasksRequired = true;
      }
    }
    return bTasksRequired;
  },
  getMarkUp: function(mapCounts) {
    function getSelectMarkUp(strFieldId, nValue) {
      var strMarkUp = "<select id='" + strFieldId + "'>";
      for (var nSlot = 0; nSlot <= 10; nSlot++) {
        if (nValue != 0 && nValue == nSlot) {
          strMarkUp += "<option value='" + nSlot + "' + " + "selected='selected'" + ">" + nSlot + "</choice>";
        } else {
          strMarkUp += "<option value='" + nSlot + "'>" + nSlot + "</choice>";
        }
      }
      strMarkUp += "</select>";
      return strMarkUp;
    }

    function buildRow(strMessage, strLabel, nValue) {
      return "<tr><td><label for='" + strLabel + "'>" + strMessage + "</label></td><td>" + getSelectMarkUp(strLabel, nValue) + "</td></tr>";
    }

    function buildTable(mapDetails, mapCounts) {
      var arrDetails = [];
      for (var strKey in mapDetails) {
        arrDetails.push(strKey + "");
      }
      arrDetails.sort();
      var strBuf = "<table>";
      for (var index = 0; index < arrDetails.length; ++index) {
        var strTitleCase = arrDetails[index].charAt(0).toString().toUpperCase() + arrDetails[index].substring(1);
        var nCount = mapCounts[arrDetails[index]];
        strBuf += buildRow(strTitleCase, arrDetails[index], nCount);
      }
      strBuf += "</table>";
      return strBuf;
    }
    var mapLabels = this.getLabels("rm_scrum_task", "type");
    return "<div id='task_controls'>" + buildTable(mapLabels, mapCounts) +
      "<button id='ok' type='button'>" + getMessage('OK') + "</button>" +
      "<button id='cancel' type='button'>" + getMessage('Cancel') + "</button></div>";
  },
  reloadForm: function() {
    document.location.href = document.location.href;
  },
  reloadList: function(strListName) {
    GlideList2.get(strListName).refresh();
  },
  showStatus: function(strMessage) {
    $("task_controls").update("Loading...");
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getLabels: function(strTable, strAttribute) {
    var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
    taskProducer.addParam("sysparm_name", "getLabels");
    taskProducer.addParam("sysparm_table", strTable);
    taskProducer.addParam("sysparm_attribute", strAttribute);
    var result = taskProducer.getXMLWait();
    return this._parseResponse(result);
  },
  _parseResponse: function(resultXML) {
    var jsonStr = resultXML.documentElement.getAttribute("answer");
    var map = (isMSIE7 || isMSIE8) ? eval("(" + jsonStr + ")") : JSON.parse(jsonStr);
    return map;
  }
});
/*! RESOURCE: getPropertyAjax */
function getPropertyAjax(propertyName, defaultValue) {
  var ga = new GlideAjax('GlideSystemAjax');
  ga.addParam('sysparm_name', 'getProperty');
  ga.addParam('sysparm_property', propertyName);
  ga.getXMLWait();
  var pv = ga.getAnswer();
  return (null == pv ? defaultValue : pv);
}
/*! RESOURCE: tm_AssignDefect */
var tm_AssignDefect = Class.create({
  initialize: function(gr) {
    this._gr = gr;
    this._isList = (gr.type + "" == "GlideList2");
    this._sysId = this._gr.getUniqueValue();
    this._tableName = this._gr.getTableName();
    this._redirect = false;
    this._testCaseInstance = 'tm_test_case_instance';
    this._prmErr = [];
    if (this._tableName == 'tm_test_instance') {
      this._sysId = this._gr.getValue('tm_test_case_instance');
    }
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("tm_ref_choose_dialog");
    var titleMsg = getMessage("Assign Defect to Test Case");
    this._mstrDlg.setTitle(titleMsg);
    this._mstrDlg.setPreference("sysparam_reference_table", "rm_defect");
    this._mstrDlg.setPreference("sysparam_query", "");
    this._mstrDlg.setPreference("sysparam_field_label", getMessage("Defect"));
    this._mstrDlg.setPreference("handler", this);
  },
  showLoadingDialog: function() {
    this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
    this.loadingDialog.setPreference('table', 'loading');
    this.loadingDialog.render();
  },
  hideLoadingDialog: function() {
    this.loadingDialog && this.loadingDialog.destroy();
  },
  showDialog: function() {
    this._mstrDlg.render();
  },
  onSubmit: function() {
    this.defectId = this._getValue('rm_defect_ref');
    this.defectLabel = this._getDisplayValue('rm_defect_ref');
    if (!this._validate()) {
      var e = gel("sys_display.rm_defect_ref");
      if (e)
        e.focus();
      return false;
    }
    this._mstrDlg.destroy();
    if (this.defectId) {
      var ga = new GlideAjax("tm_AjaxProcessor");
      ga.addParam('sysparm_name', 'mapDefectToTestCase');
      ga.addParam('sysparm_sysId', this._sysId);
      ga.addParam('sysparm_defect', this.defectId);
      ga.addParam('sysparm_tn', this._testCaseInstance);
      this.showLoadingDialog();
      ga.getXML(this.callback.bind(this));
    }
    return false;
  },
  callback: function(response) {
    this.hideLoadingDialog();
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      if (this._tableName == this._testCaseInstance) {
        var list = GlideList2.get(g_form.getTableName() + '.REL:5da20971872121003706db5eb2e3ec0b');
        if (list)
          list.setFilterAndRefresh('');
      } else {
        this._displayInfoMessage(resp[0]);
      }
    } else {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._createError = new dialogClass("tm_error_dialog");
      this._createError.setTitle(getMessage("Error while assigning defect."));
      this._createError.render();
    }
  },
  _validate: function() {
    this._prmErr = [];
    this._removeAllError('tm_ref_choose_dialog');
    if (this._getValue('rm_defect_ref') == 'undefined' || this._getValue('rm_defect_ref').trim() == "") {
      this._prmErr.push(getMessage("Select the defect."));
      this._showFieldError('ref_test_suite_field', getMessage(this._prmErr[0]));
      return false;
    }
    return this._checkForDuplicateEntry();
  },
  _getValue: function(inptNm) {
    return gel(inptNm).value;
  },
  _getDisplayValue: function(inputNm) {
    return gel('display_hidden.' + inputNm).value;
  },
  _displayInfoMessage: function(result) {
    var infoMessage = result.textContent;
    this._gr.addInfoMessage(infoMessage);
  },
  _checkForDuplicateEntry: function() {
    this.defectId = this._getValue('rm_defect_ref');
    this._testCaseInstance;
    var ga = new GlideAjax("tm_AjaxProcessor");
    ga.addParam('sysparm_name', 'hasAssociation');
    ga.addParam('sysparm_testcaseinstance', this._sysId);
    ga.addParam('sysparm_defect', this._getValue('rm_defect_ref'));
    this.showLoadingDialog();
    var responseXML = ga.getXMLWait();
    return this._parseResponse(responseXML);
  },
  _parseResponse: function(responseXML) {
    this.hideLoadingDialog();
    var resp = responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      var isDuplicate = responseXML.documentElement.getAttribute("answer");
      this._removeAllError('tm_ref_choose_dialog');
      if (isDuplicate == 'true') {
        this._showFieldError('ref_test_suite_field', getMessage('Already assigned'));
        return false;
      }
    }
    return true;
  },
  _removeAllError: function(dialogName) {
    $$('#' + dialogName + ' .form-group.has-error').each(function(item) {
      $(item).removeClassName('has-error');
      $(item).down('.help-block').setStyle({
        'display': 'none'
      });
    });
  },
  _showFieldError: function(groupId, message) {
    var $group = $(groupId);
    var $helpBlock = $group.down('.help-block');
    if (!$group.hasClassName('has-error'))
      $group.addClassName('has-error');
    if ($helpBlock.getStyle('display') != 'inline-block') {
      $helpBlock.update(message);
      $helpBlock.setStyle({
        'display': 'inline-block'
      });
    }
  },
  type: "tm_AssignDefect"
});
/*! RESOURCE: HR_Utils_UI */
var HR_Utils_UI = Class.create();
HR_Utils_UI.prototype = {
  initialize: function() {},
  validatePhoneNumberForField: function(number, isLoading, phoneField) {
    if (isLoading || !number) {
      g_form.hideFieldMsg(phoneField, true);
      return;
    }
    var ajax = new GlideAjax('hr_CaseAjax');
    ajax.addParam('sysparm_name', 'isPhoneNumberValid');
    ajax.addParam('sysparm_phoneNumber', number);
    ajax.setWantSessionMessages(false);
    ajax.getXMLAnswer(function(answer) {
      var result = answer.evalJSON();
      if (result.valid) {
        if (number != result.number) {
          g_form.setValue(phoneField, result.number);
        }
      } else {
        g_form.hideFieldMsg(phoneField, true);
        g_form.showErrorBox(phoneField, getMessage('Invalid phone number'));
        return;
      }
      g_form.hideFieldMsg(phoneField, true);
    });
  },
  validatePhoneNumberForFieldSynchronously: function(number, phoneField) {
    if (!number) {
      g_form.hideFieldMsg(phoneField, true);
      return;
    }
    var isValid = false;
    var ajax = new GlideAjax('hr_CaseAjax');
    ajax.addParam('sysparm_name', 'isPhoneNumberValid');
    ajax.addParam('sysparm_phoneNumber', number);
    ajax.setWantSessionMessages(false);
    ajax.getXMLWait();
    var answer = ajax.getAnswer();
    var result = answer.evalJSON();
    if (result.valid) {
      if (number != result.number) {
        g_form.setValue(phoneField, result.number);
      }
      g_form.hideFieldMsg(phoneField, true);
      isValid = true;
    } else {
      g_form.hideFieldMsg(phoneField, true);
      g_form.showErrorBox(phoneField, getMessage('Invalid phone number'));
      isValid = false;
    }
    return isValid;
  },
  populateContextualSearch: function(searchField) {
    function triggerKnowledgeSearch() {
      if (!window.NOW || !window.NOW.cxs_searchService) {
        window.setTimeout(triggerKnowledgeSearch, 500);
        return;
      }
      var key = document.createEvent('Events');
      key.initEvent('keyup', true, true);
      key.keyCode = 13;
      g_form.getElement(searchField).dispatchEvent(key);
      g_form.setDisplay(searchField, false);
    }
    var gr = new GlideAjax('hr_CaseAjax');
    gr.addParam('sysparm_name', 'getCatalogProperties');
    gr.addParam('sysparm_catalogId', g_form.getParameter('id'));
    gr.getXMLAnswer(function(answer) {
      var result = answer.evalJSON();
      if (result && result[searchField]) {
        g_form.setValue(searchField, result[searchField]);
        window.setTimeout(triggerKnowledgeSearch, 100);
      }
    });
  },
  catalogAdjustPriorityClientScript: function(control, oldValue, newValue, isLoading) {
    if (!newValue)
      return;
    var userInfo = g_form.getReference('opened_for');
    var gr;
    if (userInfo.hasOwnProperty('vip') && userInfo.vip == 'true') {
      gr = new GlideAjax('hr_CaseAjax');
      gr.addParam('sysparm_name', 'getDefaultVIPPriority');
      gr.getXMLAnswer(function(answer) {
        if (answer)
          g_form.setValue('priority', answer);
        else
          g_form.setValue('priority', '2');
      });
    } else {
      gr = new GlideAjax('hr_CaseAjax');
      gr.addParam('sysparm_name', 'getCatalogProperties');
      gr.addParam('sysparm_catalogId', g_form.getParameter('id'));
      gr.getXMLAnswer(function(answer) {
        var result = answer.evalJSON();
        if (result && result.priority)
          g_form.setValue('priority', result.priority);
        else
          g_form.setValue('priority', '4');
      });
    }
  },
  catalogOpenedForClientScript: function() {
    if (g_user.hasRole('hr_case_writer'))
      g_form.setReadonly('opened_for', false);
    else
      g_form.setReadonly('opened_for', true);
  },
  type: 'HR_Utils_UI'
};
/*! RESOURCE: NotifyOnTaskClient */
function NotifyOnTaskClient(source_table, sys_id) {
  this.sourceTable = source_table;
  this.sysId = sys_id;
  this.number = null;
  this.submitCallback = null;
  this.successCallback = null;
  this.errorCallback = null;
  this.cancelCallback = null;
  this.notifyType = "sms";
  this.showLoading = false;
  this.addToWorkNotes = true;
  this.setNumber = function(val) {
    this.number = val;
  };
  this.setAddToWorkNotes = function(val) {
    this.addToWorkNotes = val;
  };
  this.setNotifyType = function(val) {
    this.notifyType = val;
  };
  this.setShowLoading = function(val) {
    this.showLoading = val;
  };
  this.setSourceTable = function(val) {
    this.sourceTable = val;
  };
  this.setSysId = function(val) {
    this.sysId = val;
  };
  this.setSubmitCallback = function(callback) {
    this.submitCallback = callback;
  };
  this.hasSubmitCallback = function() {
    return (this.submitCallback != null);
  };
  this.setSuccessCallback = function(callback) {
    this.successCallback = callback;
  };
  this.hasSuccessCallback = function() {
    return (this.successCallback != null);
  };
  this.setCancelCallback = function(callback) {
    this.cancelCallback = callback;
  };
  this.hasCancelCallback = function() {
    return (this.cancelCallback != null);
  };
  this.setErrorCallback = function(callback) {
    this.errorCallback = callback;
  };
  this.hasErrorCallback = function() {
    return (this.errorCallback != null);
  };
  this.open = function(title, notifyType) {
    if (notifyType)
      this.setNotifyType(notifyType);
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dialog = new dialogClass("notify_on_task");
    dialog.setWidth("350");
    dialog.setTitle(title);
    dialog.setPreference("source_table", this.sourceTable);
    dialog.setPreference("sys_id", this.sysId);
    dialog.setPreference("type", this.notifyType);
    dialog.setPreference("add_to_work_notes", this.addToWorkNotes);
    dialog.setPreference("show_loading", this.showLoading);
    if (this.hasSubmitCallback)
      dialog.setPreference("submit_callback", this.submitCallback);
    if (this.hasCancelCallback)
      dialog.setPreference("cancel_callback", this.cancelCallback);
    if (this.hasSuccessCallback)
      dialog.setPreference("success_callback", this.successCallback);
    if (this.hasErrorCallback)
      dialog.setPreference("error_callback", this.errorCallback);
    dialog.render();
  };
  this.openForSms = function() {
    this.open(new GwtMessage().format("SMS alert for {0}", this.number), "sms");
  };
  this.openForConferenceCall = function() {
    this.open(new GwtMessage().format("Conference call for {0}", this.number), "conference");
  };
}
/*! RESOURCE: tm_AddToTestPlanHandler */
var tm_AddToTestPlanHandler = Class.create({
  initialize: function(gr) {
    this._gr = gr;
    this._isList = (gr.type + "" == "GlideList2");
    this._tableName = this._gr.getTableName();
    this._prmErr = [];
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("tm_ref_choose_dialog");
    var titleMsg = '';
    if (this._gr.getTableName() == 'tm_test_case') {
      titleMsg = getMessage("Add Case(s) to Test Plan");
    } else if (this._gr.getTableName() == 'tm_test_suite') {
      titleMsg = getMessage("Add Suite(s) to Test Plan");
    }
    this._mstrDlg.setTitle(titleMsg);
    this._mstrDlg.setPreference("sysparam_field_label", getMessage("Test Plan"));
    this._mstrDlg.setPreference("sysparam_reference_table", "tm_test_plan");
    this._mstrDlg.setPreference("sysparam_query", "active=true");
    this._mstrDlg.setPreference("handler", this);
  },
  showDialog: function() {
    this._mstrDlg.render();
  },
  onSubmit: function() {
    var testPlanId = this._getValue('tm_test_plan_ref');
    if (!this._validate()) {
      return false;
    }
    this._mstrDlg.destroy();
    if (testPlanId) {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._plsWtDlg = new dialogClass("tm_wait_dialog");
      this._plsWtDlg.setTitle(getMessage("Working.  Please wait."));
      this._plsWtDlg.render();
      var ga = new GlideAjax("tm_AjaxProcessor");
      ga.addParam('sysparm_name', 'addToTestPlan');
      ga.addParam('sysparm_sys_id', this._isList ? this._gr.getChecked() : this._gr.getUniqueValue());
      ga.addParam('sysparm_tm_test_plan', testPlanId);
      ga.addParam('sysparm_tn', this._tableName);
      ga.getXML(this.callback.bind(this));
    }
    return false;
  },
  callback: function(response) {
    this._plsWtDlg.destroy();
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      return false;
    } else {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._createError = new dialogClass("tm_error_dialog");
      this._createError.setTitle(getMessage("Error while adding Test Cases from selected Test Suite."));
      this._createError.render();
    }
  },
  _refreshRelatedList: function() {
    this._gForm.setFilterAndRefresh('');
  },
  _validate: function() {
    var valid = true;
    this._prmErr = [];
    if (!this._isList)
      this._removeAllError('tm_ref_choose_dialog');
    if (this._getValue('tm_test_plan_ref') == 'undefined' || this._getValue('tm_test_plan_ref').trim() == "") {
      this._prmErr.push(getMessage("Select Test Plan"));
      if (!this._isList)
        this._showFieldError('ref_test_suite_field', this._prmErr[0]);
      valid = false;
    }
    return valid;
  },
  _removeAllError: function(dialogName) {
    $$('#' + dialogName + ' .form-group.has-error').each(function(item) {
      $(item).removeClassName('has-error');
      $(item).down('.help-block').setStyle({
        'display': 'none'
      });
    });
  },
  _showFieldError: function(groupId, message) {
    var $group = $(groupId);
    var $helpBlock = $group.down('.help-block');
    if (!$group.hasClassName('has-error'))
      $group.addClassName('has-error');
    if ($helpBlock.getStyle('display') != 'inline-block') {
      $helpBlock.update(message);
      $helpBlock.setStyle({
        'display': 'inline-block'
      });
    }
  },
  _getValue: function(inptNm) {
    return gel(inptNm).value;
  },
  type: "tm_AddToTestPlanHandler"
});
/*! RESOURCE: NavFilterExtension */
function navFilterExtension(val, msg) {
  if (val.endsWith('.list')) {
    if (allowAccess('Internal')) {
      return false;
    } else {
      return true;
    }
  }
  return false;
}

function allowAccess(type) {
  var role = '';
  if (type == 'Admin') {
    role = 'admin';
  }
  if (type == 'Internal') {
    role = 'internal';
  }
  if (!g_user.hasRole(role)) {
    return false;
  } else {
    return true;
  }
}
/*! RESOURCE: AddScrumTask */
var AddScrumTask = Class.create();
AddScrumTask.prototype = {
  initialize: function() {
    this.list = (typeof g_list != "undefined") ? g_list : null;
    this.storyID = typeof rowSysId == 'undefined' ? (gel('sys_uniqueValue') ? gel('sys_uniqueValue').value : "") : rowSysId;
    this.setUpFacade();
    this.setUpEvents();
    this.display(true);
    this.checkOKButton();
    this.focusFirstSelectElement();
  },
  toggleOKButton: function(visible) {
    $("ok").style.display = (visible ? "inline" : "none");
  },
  setUpFacade: function() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this.dialog = new dialogClass("task_window");
    this.dialog.setTitle(getMessage("Add Scrum Tasks"));
    var mapCount = this.getTypeCounts();
    this.dialog.setBody(this.getMarkUp(mapCount), false, false);
  },
  checkOKButton: function() {
    var visible = false;
    var self = this;
    $('task_window').select("select").each(function(elem) {
      if (elem.value + "" != "0") visible = true;
      if (!elem.onChangeAdded) {
        elem.onChangeAdded = true;
        elem.on("change", function() {
          self.checkOKButton();
        });
      }
    });
    this.toggleOKButton(visible);
  },
  focusFirstSelectElement: function() {
    $('task_window').select("select")[0].focus();
  },
  getTypeCounts: function() {
    var mapLabel = this.getLabels("rm_scrum_task", "type");
    var mapCount = {};
    for (var strKey in mapLabel) {
      mapCount[strKey] = getPreference("com.snc.sdlc.scrum.pp.tasks." + strKey, 0);
    }
    return mapCount;
  },
  setUpEvents: function() {
    var self = this,
      dialog = this.dialog;
    $("ok").on("click", function() {
      var mapTaskData = {};
      if (self.fillDataMap(mapTaskData)) {
        var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
        for (var strKey in mapTaskData) {
          taskProducer.addParam("sysparm_" + encodeURIComponent(strKey), mapTaskData[strKey]);
        }
        self.showStatus("Adding tasks...");
        taskProducer.getXML(function() {
          self.refresh();
          dialog.destroy();
        });
      } else {
        dialog.destroy();
      }
    });
    $("cancel").on("click", function() {
      dialog.destroy();
    });
  },
  refresh: function() {
    if (this.list) this.list.refresh();
    else this.reloadList("rm_story.rm_scrum_task.story");
  },
  getSysID: function() {
    return this.storyID;
  },
  fillDataMap: function(mapTaskData) {
    var bTasksRequired = false;
    mapTaskData.name = "createTasks";
    mapTaskData.sys_id = this.getSysID();
    var mapDetails = this.getLabels("rm_scrum_task", "type");
    var arrTaskTypes = [];
    for (var key in mapDetails) {
      arrTaskTypes.push(key);
    }
    for (var nSlot = 0; nSlot < arrTaskTypes.length; ++nSlot) {
      var strTaskType = arrTaskTypes[nSlot];
      var strTaskData = $(strTaskType).getValue();
      mapTaskData[strTaskType] = strTaskData;
      setPreference("com.snc.sdlc.scrum.pp.tasks." + strTaskType, strTaskData);
      if (strTaskData != "0") {
        bTasksRequired = true;
      }
    }
    return bTasksRequired;
  },
  getMarkUp: function(mapCounts) {
    function getSelectMarkUp(strFieldId, nValue) {
      var strMarkUp = '<select class="form-control select2" id="' + strFieldId + '" name="' + strFieldId + '">';
      for (var nSlot = 0; nSlot <= 10; nSlot++) {
        if (nValue != 0 && nValue == nSlot) {
          strMarkUp += '<option value="' + nSlot + '" selected="selected">' + nSlot + '</option>';
        } else {
          strMarkUp += '<option value="' + nSlot + '">' + nSlot + '</option>';
        }
      }
      strMarkUp += "</select>";
      return strMarkUp;
    }

    function buildRow(strMessage, nValue) {
      var row = '';
      row += '<div class="row" style="padding-top:10px;">';
      row += '<div class="form-group">';
      row += '<label class="control-label col-sm-3" for="' + strMessage + '" style="white-space:nowrap;">';
      row += strMessage;
      row += '</label>';
      row += '<span class="col-sm-9">';
      row += getSelectMarkUp(strMessage, nValue);
      row += '</span>';
      row += '</div>';
      row += '</div>';
      return row;
    }

    function buildTable(mapDetails, mapCounts) {
      var arrDetails = [];
      for (var strKey in mapDetails) {
        arrDetails.push(strKey + "");
      }
      arrDetails.sort();
      var strBuf = '';
      for (var index = 0; index < arrDetails.length; ++index) {
        var nCount = mapCounts[arrDetails[index]];
        strBuf += buildRow(arrDetails[index], nCount);
      }
      strBuf += '';
      return strBuf;
    }
    var mapLabels = this.getLabels("rm_scrum_task", "type");
    return buildTable(mapLabels, mapCounts) + "<div id='task_controls' style='text-align:right;padding-top:20px;'>" +
      "<button id='cancel' type='button' class='btn btn-default'>" + getMessage('Cancel') + "</button>" +
      "&nbsp;&nbsp;<button id='ok' type='button' class='btn btn-primary'>" + getMessage('OK') + "</button></div>";
  },
  reloadForm: function() {
    document.location.href = document.location.href;
  },
  reloadList: function(strListName) {
    var list = GlideList2.get(strListName);
    if (list)
      list.refresh();
  },
  showStatus: function(strMessage) {
    $("task_controls").update("Loading...");
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getLabels: function(strTable, strAttribute) {
    var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
    taskProducer.addParam("sysparm_name", "getLabels");
    taskProducer.addParam("sysparm_table", strTable);
    taskProducer.addParam("sysparm_attribute", strAttribute);
    var result = taskProducer.getXMLWait();
    return this._parseResponse(result);
  },
  _parseResponse: function(resultXML) {
    var jsonStr = resultXML.documentElement.getAttribute("answer");
    var map = JSON.parse(jsonStr);
    return map;
  }
};
/*! RESOURCE: Mirror42 */
var Mirror42 = {
  show: function(token, url, height, width) {
    if (!height) {
      height = "600px";
    }
    if (!width) {
      width = "100%";
    }
    if (/^\d+$/.test(height + '')) {
      height = height + 'px';
    }
    if (/^\d+$/.test(width + '')) {
      width = width + 'px';
    }
    token = token.split('#');
    url = url.replace(/^\s+/g, '');
    if (url.indexOf('http') !== 0) {
      if (url.indexOf('/') !== 0) {
        url = '/' + url;
      }
      url = token[0] + url;
    }
    url = url + (url.indexOf('?') === -1 ? "?" : "&");
    url = url + "apptoken=" + encodeURIComponent(token[1]);
    url = url + "&h=" + encodeURIComponent(height);
    var m42 = document.getElementById('mirror42');
    m42.innerHTML = '<iframe class="content_embedded" frameborder="0" src="' + url + '" style="height:' + height + ';width:' + width + ';" frameborder="0" scrolling="no"></iframe>';
  }
};
/*! RESOURCE: hi_int_ClientMetrics */
var hi_int_ClientMetrics = Class.create();
hi_int_ClientMetrics.prototype = {
  initialize: function() {},
  createMetric: function() {
    try {
      var gadt = new GlideAjax('DateTimeUtils');
      gadt.addParam("sysparm_name", "nowDateTime");
      gadt.getXMLWait();
      var startedOn = gadt.getAnswer();
      var parameters = {};
      parameters.u_type = "question";
      parameters.u_last_stage = "ciw_pan_1";
      parameters.u_started_on = startedOn;
      var ga = new GlideAjax('hi_int_SelfServiceMetric');
      ga.addParam('sysparm_name', 'processMetric');
      ga.addParam('sysparm_json', Object.toJSON(parameters));
      ga.getXMLWait();
      var answer = ga.getAnswer();
      var jsonObject = answer.evalJSON();
      return jsonObject;
    } catch (exception) {
      return null;
    }
  },
  updateMetric: function(parameters) {
    try {
      var that = this;
      parameters.sys_id = parameters.metricid;
      switch (parameters.control) {
        case "type":
          parameters.u_type = parameters.value;
          break;
        case "category":
          parameters.u_category = parameters.value;
          break;
        case "description":
          parameters.u_short_description = parameters.value;
          break;
        case "panel":
          parameters.u_last_stage = parameters.value;
          break;
        case "communityResult":
          parameters.u_result = parameters.value;
          break;
        case "communityUser":
          parameters.u_community_user = parameters.value;
          break;
        default:
          break;
      }
      var glideAjax = new GlideAjax("hi_int_SelfServiceMetric");
      glideAjax.addParam("sysparm_name", "processMetric");
      glideAjax.addParam("sysparm_json", Object.toJSON(parameters));
      glideAjax.getXMLAnswer(function(answer) {});
    } catch (exception) {}
  },
  closeMetric: function(payload) {
    try {
      var that = this;
      var glideAjax = new GlideAjax("DateTimeUtils");
      glideAjax.addParam("sysparm_name", "nowDateTime");
      glideAjax.getXMLAnswer(function(finishedOn) {
        var parameters = {};
        parameters.sys_id = payload.metricid;
        parameters.u_last_stage = "done";
        parameters.u_finished_on = finishedOn;
        if (payload.incidentID && payload.incidentID.length > 0)
          parameters.u_incident = payload.incidentID;
        if (payload.value && payload.value.toUpperCase() === 'CANCEL SUBMISSION')
          parameters.u_cancellation_reason = payload.value;
        var glideAjax2 = new GlideAjax("hi_int_SelfServiceMetric");
        glideAjax2.addParam("sysparm_name", "processMetric");
        glideAjax2.addParam("sysparm_json", Object.toJSON(parameters));
        glideAjax2.getXMLAnswer(function(answer) {});
      });
    } catch (exception) {}
  },
  type: "hi_int_ClientMetrics"
};
/*! RESOURCE: UI Action Context Menu */
function showUIActionContext(event) {
  if (!g_user.hasRole("ui_action_admin"))
    return;
  var element = Event.element(event);
  if (element.tagName.toLowerCase() == "span")
    element = element.parentNode;
  var id = element.getAttribute("gsft_id");
  var mcm = new GwtContextMenu('context_menu_action_' + id);
  mcm.clear();
  mcm.addURL(getMessage('Edit UI Action'), "sys_ui_action.do?sys_id=" + id, "gsft_main");
  contextShow(event, mcm.getID(), 500, 0, 0);
  Event.stop(event);
}
addLoadEvent(function() {
  document.on('contextmenu', '.action_context', function(evt, element) {
    showUIActionContext(evt);
  });
});
/*! RESOURCE: newui_navigator */
var isInternetExplorer = false;
var internetExplorerVersion = '';
var userId = "";
var myProfile = 'N';
var isAuth = 'N';
var mapping = {
  'Alerts': 'section1',
  'RealAvailability': 'section2',
  'Issues': 'section3',
  'Instances': 'section4',
  'Upgrade': 'section5',
  'Users': 'section6',
  'Support': 'section7',
  'catalog': 'section8'
};
var uriToSysID = {
  "/newui_incident_record_producer.do": '9524abaf2b31b100887d48e119da1599'
};
var link = {
  url: ''
};

function urlParam(name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null) {
    return null;
  } else {
    return results[1] || 0;
  }
}

function showMenu(id, text, e) {
  var posx = e.clientX + window.pageXOffset + 'px';
  var posy = e.clientY + window.pageYOffset + 'px';
  $j("#" + id).css("left", posx);
  $j("#" + id).css("top", posy);
  $j("#" + id).removeClass("hideContextMenu");
  $j("#" + id).addClass("displayContextMenu");
  link.url = 'https://' + location.host + text;
}

function showURL() {
  hideMenu('contextMenu');
  var msg = "Because of a browser limitation the URL cannot be placed directly in the clipboard.  Please use Ctrl-C to copy the data and escape to dismiss this dialog";
  window.prompt(msg, link.url);
}

function hideMenu(id) {
  $j("#" + id).removeClass("displayContextMenu");
  $j("#" + id).addClass("hideContextMenu");
}

function isAuthorised(user, flag) {
  userId = user;
  isAuth = flag;
}

function getParmVal(name, url) {
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  if (results == null) {
    return null;
  } else {
    return unescape(results[1]);
  }
}

function autoPopulateTargetInstance(iframe, instanceSysId, action) {
  var window = iframe.contentWindow;
  if (window.g_form) {
    switch (action) {
      case "plugin":
        setNavIcon('section8');
        window.g_form.setValue('instance', instanceSysId);
        break;
      case "zboot":
        setNavIcon('section8');
        window.g_form.setValue('Instance', instanceSysId);
        break;
      case "remove_demo_data":
        setNavIcon('section8');
        window.g_form.setValue('instance', instanceSysId);
        break;
      case "rename":
        setNavIcon('section8');
        window.g_form.setValue('instance_name', instanceSysId);
        break;
      case "clone":
        setNavIcon('section8');
        window.g_form.setValue('source', instanceSysId);
        break;
      case "retire":
        setNavIcon('section8');
        window.g_form.setValue('instance_name', instanceSysId);
        break;
      case "vpn":
        setNavIcon('section8');
        window.g_form.setValue('VPN_prod_instance', instanceSysId);
        break;
      case "upgrade":
        window.g_form.setValue('source', instanceSysId);
        break;
      case "email_reprovision":
        setNavIcon('section8');
        window.g_form.setValue('emailReprovisionInstance', instanceSysId);
        break;
      case "extend_expiration":
        setNavIcon('section8');
        window.g_form.setValue('u_instance_sysid', instanceSysId);
        break;
      default:
        break;
    }
  }
}

function onLoadOfIframe(id) {
  $j('#sectionIframe').contents().on('click', function() {
    $j('.searchform', window.parent.document).hide();
    $j('.searchform', window.parent.document).removeClass('opened');
    parent.parent.$j('body').click();
  });
  setIframeHeight(id);
  window.parent.scrollTo(0, 0);
}

function setIframeHeight(id) {
  var p = parent.parent;
  var ifrm = document.getElementById(id);
  var src = ifrm.getAttribute("src");
  if (src.indexOf("com.glideapp.servicecatalog_cat_item_view.do") > -1) {
    var origin = getParmVal('sysparm_origin', src);
    var instance_sys_id = getParmVal('sysparm_instance_sys_id', src);
    var action = getParmVal('sysparm_action', src);
    if (origin == 'manage_instances' && instance_sys_id != null) {
      autoPopulateTargetInstance(ifrm, instance_sys_id, action);
    }
  }
  try {
    if (src.indexOf('manage_users_list') > -1 || src.indexOf('sys_user') > -1) {
      var currSysID = '';
      var profileLink = $j('#sectionIframe').contents().find('#userLogo');
      if (profileLink)
        var updateLink = profileLink.children()[1];
      if (updateLink && navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
        updateLink.style.top = "70px";
      var sysid = $j('#sectionIframe').contents().find('#sys_uniqueValue');
      if (sysid)
        currSysID = sysid.val();
      if ($j(ifrm).contents().find('form')[0])
        var pageAction = $j(ifrm).contents().find('form')[0]['action'];
      if (pageAction && pageAction.indexOf('sys_user') > -1 && pageAction.indexOf('sys_user_image') < 0 &&
        window.NOW.user.id && currSysID == window.NOW.user.id) {
        var newImg = '';
        var currImg = '';
        var newImgElem = $j('#sectionIframe').contents().find('#userLogo');
        if (newImgElem.children()[0])
          newImg = newImgElem.children()[0].getAttribute('src');
        var currImgElem = parent.$j('#userLogo_header');
        if (currImgElem.children()[0]) {
          currImgElem.children()[0].setAttribute('src', newImg);
        } else if (newImg != '') {
          currImgElem.replaceWith("<span id='userLogo_header' style='height:100%';'><img class='pull-left user-profile-pic' src=" + newImg + "></span>");
        }
      }
    }
  } catch (err) {}
  var loadedPage = $j('#sectionIframe').contents().find('#pageUrl')[0];
  if (loadedPage) {
    loadedPage = loadedPage.value;
    var curPage = $j('.active').attr('data-name');
    if (curPage != loadedPage) {
      setNavIcon(mapping[loadedPage]);
    }
  }
  var padding = 30;
  var doc = ifrm.contentDocument ? ifrm.contentDocument : ifrm.contentWindow.document;
  ifrm.style.visibility = 'hidden';
  ifrm.style.height = "10px";
  var iframeBody = doc.body;
  var pageSrc = $j('#sectionIframe').attr("src");
  if (!pageSrc) {
    pageSrc = $j('#chgCalendar').attr("src");
  }
  var iframeHeight1 = getDocHeight(doc, pageSrc) + padding;
  var iframeWidth1 = 0;
  if (iframeBody != 'undefined' && iframeBody != undefined && iframeBody != 'null' && iframeBody != null) {
    if (iframeBody.scrollWidth != 'undefined' && iframeBody.scrollWidth != undefined && iframeBody.scrollWidth != 'null' && iframeBody.scrollWidth != null) {
      iframeWidth1 = iframeBody.scrollWidth;
    }
  }
  ifrm.style.height = iframeHeight1 + "px";
  ifrm.style.width = '100%';
  if (pageSrc) {
    if (pageSrc.indexOf('com.glideapp.servicecatalog_cat_item_view.do') > -1 ||
      pageSrc.indexOf('u_training_class_list.do') > -1 ||
      pageSrc.indexOf('sys_report_template.do') > -1) {
      $j('#sectionIframe').parent().css({
        "margin-top": '',
        "margin": "10px auto",
        "width": "95%"
      });
    } else {
      $j('#sectionIframe').parent().css({
        "margin": "",
        "margin-top": "10px",
        "width": "100%"
      });
    }
  }
  if (!(isInternetExplorer && internetExplorerVersion == 9)) {
    p.$j('#loadingFrame').height(iframeHeight1 + 150 + "px");
  } else {
    p.$j('#loadingFrame').height(iframeHeight1 + 150 + "px");
  }
  if ($j('#sectionIframe').contents().find('.caption_link_catalog')[0]) {
    setNavIcon('section8');
  }
  ifrm.style.visibility = 'visible';
}

function fillHeader() {
  getInternetExplorerVersion();
  var sectionName = urlParam('sectionParam');
  var sectionName2 = urlParam('sectionParam2');
  var uri = '/' + urlParam('uri');
  myProfile = urlParam('myProfile');
  parent.$j('#loadingFrame').contents().on('click', function() {
    parent.parent.$j('body').click();
  });
  parent.$j('#loadingFrame').contents().find('body')[0].style.padding = '0px';
  fillContent(sectionName, uri, sectionName2);
}

function setNavIcon(divId) {
  $j('.active').each(function() {
    $j(this).removeClass('active');
  });
  $j('#' + divId).addClass('active');
  drawBorderLine(document.getElementById(divId).getAttribute('data-name'));
  window.parent.scrollTo(0, 0);
}

function setIFrameAttr(attrObject) {
  $j("#sectionIframe").attr('page-sys-id', attrObject.pageSysId);
  $j("#sectionIframe").attr('page-class-name', attrObject.className);
  $j("#sectionIframe").attr('src', attrObject.targetURI);
}

function fillContent(divId, uri, searchParam) {
  var sectionname = document.getElementById(divId).getAttribute('data-name');
  var isExpressUser = getSessionVariable("isExpressUser");
  if (isExpressUser === "true" &&
    sectionname.toUpperCase() == "SUPPORT" &&
    (uri == null || uri == '')) {
    window.open('https://express.servicenow.com/support/');
    return;
  }
  setNavIcon(divId);
  switch (sectionname) {
    case 'Alerts':
      setIFrameAttr({
        pageSysId: '907782f62be93100074d48e119da1548',
        className: 'sys_ui_page',
        targetURI: '/newui_alerts.do'
      });
      break;
    case 'RealAvailability':
      setIFrameAttr({
        pageSysId: '3eb2a4d76f7075001b90c138eb3ee41a',
        className: 'sys_ui_page',
        targetURI: '/real_availability_section.do'
      });
      break;
    case 'Issues':
      setIFrameAttr({
        pageSysId: 'de937f4b6f3075001b90c138eb3ee41b',
        className: 'sys_ui_page',
        targetURI: (uri && uri !== '/null') ? uri + '&sysparm_stack=/open_issues_section.do' : '/open_issues_section.do'
      });
      break;
    case 'Instances':
      setIFrameAttr({
        pageSysId: '053f846c6f7d3100a3080e9c5d3ee411',
        className: 'sys_ui_page',
        targetURI: '/newui_manage_instances.do'
      });
      break;
    case 'Upgrade':
      setIFrameAttr({
        pageSysId: 'e9e195be6f52e100f043e06dbb3ee49a',
        className: 'sys_ui_page',
        targetURI: '/upgrade_dashboard.do?sysparm_origin=newui'
      });
      break;
    case 'Users':
      $j("#sectionIframe").attr('page-sys-id', '8a217d876fc9b100daa1409e9f3ee49d');
      $j("#sectionIframe").attr('page-class-name', 'sys_ui_page');
      setSectionIFrameURI(uri);
      break;
    case 'catalog':
      setIFrameAttr({
        pageSysId: '6fe64f504f458a00f52360001310c721',
        className: 'sys_ui_page',
        targetURI: '/self-service.do'
      });
      break;
    case 'Support':
      var srcVal = '/mySupport.do';
      if (searchParam && searchParam !== 'undefined' && searchParam !== '/null') {
        srcVal = srcVal + '?sectionParam2=' + searchParam;
      }
      setIFrameAttr({
        pageSysId: uriToSysID[uri] ? uriToSysID[uri] : '2c01a3702b86f10045f1311fe8da15de',
        className: 'sys_ui_page',
        targetURI: (uri && uri !== '/null') ? uri : srcVal
      });
      break;
  }
  $j("#sectionIframe").css('display', 'inline');
}

function getSessionVariable(key) {
  var ga = new GlideAjax('CSSPortalSessionData');
  ga.addParam("sysparm_name", "getURI");
  ga.addParam("sysparm_sessionkey", key);
  ga.getXMLWait();
  return ga.getAnswer();
}

function setSectionIFrameURI(uri) {
  var uriParams = '&sysparm_view=customer_new_view&sysparm_view_forced=true' + '&sysparm_stack=/manage_users_list.do';
  if (uri && uri !== 'undefined' && uri !== '/null') {
    if (uri.indexOf("manage_companies") > -1) {
      setIFrameAttr({
        pageSysId: '5caf82bf13eb4600d3d7ff304244b0d9',
        className: 'sys_ui_page',
        targetURI: '/manage_companies.do?sysparm_view=essp_company_view&sysparm_view_forced=true'
      });
    } else if (uri.indexOf('sys_user') > -1) {
      $j("#sectionIframe").attr('src', uri + uriParams);
    } else if (uri.indexOf("core_company") > -1) {
      setIFrameAttr({
        pageSysId: 'bf23aa876f7a31001b90c138eb3ee4cb',
        className: 'sys_ui_view',
        targetURI: uri + '&sysparm_view=css_company_view&sysparm_view_forced=true' + '&sysparm_stack=/manage_users_list.do'
      });
    }
  } else {
    var roles = window.NOW.user.roles;
    var split_str = roles.split(",");
    if (myProfile === 'Y') {
      if (split_str.indexOf("internal") !== -1) {
        setIFrameAttr({
          pageSysId: '064e54734fe5c600f52360001310c778',
          className: 'sys_ui_view',
          targetURI: '/sys_user.do?sys_id=' + userId + '&sysparm_view=internal_view&sysparm_view_forced=true' + '&sysparm_stack=/manage_users_list.do'
        });
      } else {
        setIFrameAttr({
          pageSysId: 'd1e327f12b2df100887d48e119da1546',
          className: 'sys_ui_view',
          targetURI: '/sys_user.do?sys_id=' + userId + uriParams
        });
      }
      myProfile = 'N';
    } else if (isAuth === 'N') {
      $j("#sectionIframe").attr('src', '/manage_users_list.do');
    } else {
      if (split_str.indexOf("internal") !== -1) {
        setIFrameAttr({
          pageSysId: '064e54734fe5c600f52360001310c778',
          className: 'sys_ui_view',
          targetURI: '/sys_user.do?sys_id=' + userId + '&sysparm_view=internal_view&sysparm_view_forced=true' + '&sysparm_stack=/manage_users_list.do'
        });
      } else {
        setIFrameAttr({
          pageSysId: 'd1e327f12b2df100887d48e119da1546',
          className: 'sys_ui_view',
          targetURI: '/sys_user.do?sys_id=' + userId + uriParams
        });
      }
    }
  }
}

function drawBorderLine(sectioName) {
  var temp = sectioName;
  if (temp == 'Alerts' || temp == 'Issues') {
    $j("#wrapper_section").css('border-bottom', '1px blue solid');
  }
  if (temp == 'RealAvailability') {
    $j("#wrapper_section").css('border-bottom', '1px #4bd762 solid');
  }
  if (temp == 'Support') {
    $j("#wrapper_section").css('border-bottom', '1px #ff402c solid');
  }
  if (temp == 'Upgrade') {
    $j("#wrapper_section").css('border-bottom', '1px #ff9416 solid');
  }
  if (temp == 'Users') {
    $j("#wrapper_section").css('border-bottom', '1px #ffca1f solid');
  }
  if (temp == 'Instances') {
    $j("#wrapper_section").css('border-bottom', '1px #278efc solid');
  }
  if (temp == 'catalog') {
    $j("#wrapper_section").css('border-bottom', '1px #9857c9 solid');
  }
}

function getDocHeight(doc, src) {
  doc = doc || document;
  var body = doc.body,
    html = doc.documentElement;
  var roleStr = window.NOW.user.roles;
  var sys_user_height = 200;
  if (roleStr.indexOf('internal') > -1) {
    sys_user_height = 600;
  }
  var additionalHeight = 0;
  if (src) {
    if (src.indexOf("upgrade_dashboard.do") > -1) {
      additionalHeight = -50;
    } else if (src.indexOf("self-service.do") > -1) {
      additionalHeight = 150;
    } else if (src.indexOf("sys_user.do") > -1) {
      additionalHeight = sys_user_height;
    } else if (src.indexOf("manage_users_list.do") > -1) {
      additionalHeight = 200;
    } else if (src.indexOf("mySupport.do") > -1) {
      additionalHeight = -200;
    } else if (src.indexOf("upgrade_dashboard.do") > -1) {
      additionalHeight = -150;
    } else if (src.indexOf("newui_manage_instances.do") > -1) {
      additionalHeight = 100;
    } else if (src.indexOf("real_availability_section.do") > -1) {
      additionalHeight = -80;
    } else if (src.indexOf("manage_companies") > -1) {
      additionalHeight = 200;
    } else if (src.indexOf("newui_alerts.do") > -1) {
      additionalHeight = -80;
    }
  }
  var scrollHeight = 750;
  if (body != 'undefined' && body != 'null' && body != null) {
    if (body.scrollHeight != 'undefined') {
      scrollHeight = body.scrollHeight;
    }
  }
  var offsetHeight = 750;
  if (body != 'undefined' && body != 'null' && body != null) {
    if (body.offsetHeight != 'undefined') {
      offsetHeight = body.offsetHeight;
    }
  }
  var height = (Math.max(scrollHeight, offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight) + 200);
  if (height < 800) {
    height = 800;
  }
  height = height + (additionalHeight);
  if (src && src.indexOf("com.glideapp.servicecatalog_cat_item_view.do") > -1) {
    height = (height + height + 200);
  }
  return height;
}

function getInternetExplorerVersion() {
  if (navigator.appName == "Microsoft Internet Explorer") {
    isInternetExplorer = true;
    var ua = navigator.userAgent;
    var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
    if (re.exec(ua) != null) {
      internetExplorerVersion = parseInt(RegExp.$1);
    }
  } else {
    isInternetExplorer = false;
  }
}

function updateUserLastVerifiedDate(buttonElement) {
  buttonElement.innerHTML = 'Submitting...';
  buttonElement.onclick = '';
  var userSysID = g_form.getUniqueValue();
  var verifyDateCheckRequest = new GlideAjax('CustomerContactAdminUtil');
  verifyDateCheckRequest.addParam('sysparm_name', 'updateLastVerifiedDateForUserAJAX');
  verifyDateCheckRequest.addParam('sysparm_user_sys_id', userSysID);
  verifyDateCheckRequest.getXML(updateUserLastVerifiedDateParse);
}

function updateUserLastVerifiedDateParse(response) {
  var responseData = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
  if (responseData.error) {} else {
    if (responseData.is_verified) {
      $j('#verificationMsg').fadeOut(200, function() {
        $j('#verificationMsg').html(responseData.success_message);
        $j('#verificationMsg').fadeIn(200);
      });
      g_form.getControl('email').style = "background-color:#fff";
      g_form.getControl('mobile_phone').style = "background-color:#fff";
      g_form.getControl('phone').style = "background-color:#fff";
      g_form.getControl('time_zone').style = "background-color:#fff";
    }
  }
}

function updateCompanyLastVerifiedDate(buttonElement) {
  buttonElement.innerHTML = 'Submitting...';
  buttonElement.onclick = '';
  var currentCompanyRecordSysID = g_form.getUniqueValue();
  var verifyDateCheckRequest = new GlideAjax('CustomerContactAdminUtil');
  verifyDateCheckRequest.addParam('sysparm_name', 'updateLastVerifiedDateForCompanyAJAX');
  verifyDateCheckRequest.addParam('sysparm_company_sys_id', currentCompanyRecordSysID);
  verifyDateCheckRequest.getXML(updateCompanyLastVerifiedDateParse);
}

function updateCompanyLastVerifiedDateParse(response) {
  var answer = response.responseXML.documentElement.getAttribute("answer");
  var responseData = JSON.parse(answer);
  if (responseData.error) {
    alert('updateCompanyLastVerifiedDateParse has experienced an error: ' + responseData.errorMessage);
  } else {
    if (responseData.is_verified) {
      $j('#verify_indicator').fadeOut(200, function() {
        $j('#verify_indicator').html(responseData.success_message);
        $j('#verify_indicator').fadeIn(200);
      });
    }
  }
}

function confirmNotDormantRequest(buttonElement) {
  buttonElement.innerHTML = 'Submitting...';
  var userSysID = buttonElement.getAttribute('user_sys_id');
  var confirmNotDormantRequest = new GlideAjax('CustomerContactAdminUtil');
  confirmNotDormantRequest.addParam('sysparm_name', 'confirmNotDormantAJAX');
  confirmNotDormantRequest.addParam('sysparm_user_sys_id', userSysID);
  confirmNotDormantRequest.getXML(confirmNotDormantResponse);
}

function confirmNotDormantResponse(response) {
  var responseData = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
  if (responseData.error) {
    alert('An error has occured');
  } else {
    if (document.getElementById('confirm-not-dormant-btn')) {
      $j('#confirm-not-dormant-btn').fadeOut(200);
      $j('#dormant_user_state').fadeOut(200, function() {
        $j('#dormant_user_state').html('$[SP]$[SP]$[SP]$[SP]Not Dormant').attr('class', 'newui-icon-check-circle pull-right col col-lg-4').css('color', '#4bd762');
        $j('#dormant_user_state').fadeIn(200);
      });
      document.getElementById('dormant_user_state').setAttribute('data-original-title', 'User has recently logged in or has been confirmed');
    }
    $j('#dormant_user_message').fadeOut(200, function() {
      $j('#dormant_user_message').html(responseData.successMessage);
      $j('#dormant_user_message').fadeIn(200);
    });
  }
}

function trackUserNavigation(objTracker) {
  var client = (navigator.appVersion.indexOf("Mobile") > -1) ? "Mobile" : "Desktop";
  var ga = new GlideAjax('CSSPortalTracker');
  ga.addParam("sysparm_name", "trackUserActivity");
  ga.addParam("currentPage", objTracker.sourcePage);
  ga.addParam("event", objTracker.event);
  ga.addParam("keyword", objTracker.keyword);
  ga.addParam("taskKey", objTracker.taskKey);
  ga.addParam("taskValue", objTracker.taskValue);
  ga.addParam("client", client);
  ga.addParam("browser", getBrowser());
  ga.getXML(function() {});
}

function getBrowser() {
  var browserName = 'Other',
    userAgent = navigator.userAgent;
  if (userAgent.indexOf('OPR/') !== -1 || userAgent.indexOf('Opera') !== -1) {
    browserName = 'Opera';
  } else if (userAgent.indexOf('MSIE') != -1) {
    browserName = 'Internet Explorer';
  } else if (userAgent.indexOf('Chrome') != -1) {
    browserName = 'Chrome';
  } else if (userAgent.indexOf('Safari') != -1) {
    browserName = 'Safari';
  } else if (userAgent.indexOf('Firefox') != -1) {
    browserName = 'Firefox';
  }
  return browserName;
}
/*! RESOURCE: AddMembersFromGroup */
var AddMembersFromGroup = Class.create(GlideDialogWindow, {
  initialize: function() {
    this.setUpFacade();
  },
  setUpFacade: function() {
    GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
    this.setTitle(getMessage("Add Members From Group"));
    this.setBody(this.getMarkUp(), false, false);
  },
  setUpEvents: function() {
    var dialog = this;
    var okButton = $("ok");
    if (okButton) {
      okButton.on("click", function() {
        var mapData = {};
        if (dialog.fillDataMap(mapData)) {
          var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembersProcessor");
          for (var strKey in mapData) {
            processor.addParam(strKey, mapData[strKey]);
          }
          dialog.showStatus(getMessage("Adding group users..."));
          processor.getXML(function() {
            dialog.refresh();
            dialog._onCloseClicked();
          });
        } else {
          dialog._onCloseClicked();
        }
      });
    }
    var cancelButton = $("cancel");
    if (cancelButton) {
      cancelButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var okNGButton = $("okNG");
    if (okNGButton) {
      okNGButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var cancelNGButton = $("cancelNG");
    if (cancelNGButton) {
      cancelNGButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
  },
  refresh: function() {
    GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
  },
  getScrumReleaseTeamSysId: function() {
    return g_form.getUniqueValue() + "";
  },
  getUserChosenGroupSysIds: function() {
    return $F('groupId') + "";
  },
  showStatus: function(strMessage) {
    $("task_controls").update(strMessage);
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getRoleIds: function() {
    var arrRoleNames = ["scrum_user", "scrum_admin", "scrum_release_planner", "scrum_sprint_planner", "scrum_story_creator"];
    var arrRoleIds = [];
    var record = new GlideRecord("sys_user_role");
    record.addQuery("name", "IN", arrRoleNames.join(","));
    record.query();
    while (record.next())
      arrRoleIds.push(record.sys_id + "");
    return arrRoleIds;
  },
  hasScrumRole: function(roleSysId, arrScrumRoleSysIds) {
    for (var index = 0; index < arrScrumRoleSysIds.length; ++index)
      if (arrScrumRoleSysIds[index] == "" + roleSysId)
        return true;
    var record = new GlideRecord("sys_user_role_contains");
    record.addQuery("role", roleSysId);
    record.query();
    while (record.next())
      if (this.hasScrumRole(record.contains, arrScrumRoleSysIds))
        return true;
    return false;
  },
  getGroupIds: function() {
    var arrScrumRoleIds = this.getRoleIds();
    var arrGroupIds = [];
    var record = new GlideRecord("sys_group_has_role");
    record.query();
    while (record.next())
      if (this.hasScrumRole(record.role, arrScrumRoleIds))
        arrGroupIds.push(record.group + "");
    return arrGroupIds;
  },
  getGroupInfo: function() {
    var mapGroupInfo = {};
    var arrRoleIds = this.getRoleIds();
    var arrGroupIds = this.getGroupIds(arrRoleIds);
    var record = new GlideRecord("sys_user_group");
    record.addQuery("sys_id", "IN", arrGroupIds.join(","));
    record.query();
    while (record.next()) {
      var strName = record.name + "";
      var strSysId = record.sys_id + "";
      mapGroupInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    return mapGroupInfo;
  },
  getMarkUp: function() {
    var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
    groupAjax.addParam('sysparm_name', 'getGroupInfo');
    groupAjax.getXML(this.generateMarkUp.bind(this));
  },
  generateMarkUp: function(response) {
    var mapGroupInfo = {};
    var groupData = response.responseXML.getElementsByTagName("group");
    var strName, strSysId;
    for (var i = 0; i < groupData.length; i++) {
      strName = groupData[i].getAttribute("name");
      strSysId = groupData[i].getAttribute("sysid");
      mapGroupInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    var arrGroupNames = [];
    for (var strGroupName in mapGroupInfo) {
      arrGroupNames.push(strGroupName + "");
    }
    arrGroupNames.sort();
    var strMarkUp = "";
    if (arrGroupNames.length > 0) {
      var strTable = "<table><tr><td><label for='groupId'><select id='groupId'>";
      for (var nSlot = 0; nSlot < arrGroupNames.length; ++nSlot) {
        strName = arrGroupNames[nSlot];
        strSysId = mapGroupInfo[strName].sysid;
        strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
      }
      strTable += "</select></label></td></tr></table>";
      strMarkUp = "<div id='task_controls'>" + strTable +
        "<div style='text-align: right;'>" +
        "<button id='ok' type='button'>" + getMessage("OK") + "</button>" +
        "<button id='cancel' type='button'>" + getMessage("Cancel") + "</button></div></div>";
    } else {
      strMarkUp = "<div id='task_controls'><p>No groups with scrum_user role found</p>" +
        "<div style='text-align: right;'>" +
        "<button id='okNG' type='button'>" + getMessage("OK") + "</button>" +
        "<button id='cancelNG' type='button'>" + getMessage("Cancel") +
        "</button></div></div>";
    }
    this.setBody(strMarkUp, false, false);
    this.setUpEvents();
    this.display(true);
    this.setWidth(180);
  },
  fillDataMap: function(mapData) {
    var strChosenGroupSysId = this.getUserChosenGroupSysIds();
    if (strChosenGroupSysId) {
      mapData.sysparm_name = "createReleaseTeamMembers";
      mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId();
      mapData.sysparm_groups = strChosenGroupSysId;
      return true;
    } else {
      return false;
    }
  }
});
/*! RESOURCE: Redirect Users */
(function() {
  try {
    if (window.HI_SKIP_REDIRECTION)
      return;
    var nav = jQuery(".navpage-header");
    nav.css("background", "white");
    var currentURL = window.location.href,
      pathName = window.location.pathname,
      userDomainDetails = getDomainDetails(),
      isCommunityDomain = userDomainDetails.isCommunityDomain,
      isPureCommunityUser = userDomainDetails.isPureCommunityUser,
      hasCommunityEditRole = userDomainDetails.hasCommunityEditRole,
      isAdminImpersonating = userDomainDetails.isAdminImpersonating,
      isPureCommunityUserWithNoEditRole = isPureCommunityUser && !hasCommunityEditRole,
      isPureCommunityUserWithEditRole = isPureCommunityUser && hasCommunityEditRole;
    if (isCommunityDomain) {
      if (isAdminImpersonating)
        return;
      else if (!isValidCommunityURL() && !isLoginPage()) {
        if ((isPureCommunityUserWithNoEditRole || (window.NOW.user && window.NOW.user.userID == 'guest')) && pathName != "/auth_redirect.do") {
          window.parent.location.replace('/community');
        } else if (isPureCommunityUserWithEditRole) {
          if (pathName == '/hisp') {
            window.parent.location.replace('/community');
          }
        }
      }
    } else if (!isValidHIURL()) {
      if (window.NOW.user.userID == 'guest') {
        routeToHISP();
      } else {
        loadEvent(routeUser);
      }
    } else {
      var isIndex = endsWith(currentURL, '.service-now.com/') || endsWith(currentURL, '.service-now.com') || endsWith(currentURL, 'home.do') || endsWith(currentURL, 'nav_to.do?uri=%2Fhisp');
      if (isIndex) {
        loadEvent(routeUser);
      }
    }
    window.HI_SKIP_REDIRECTION = true;
  } catch (error) {
    routeToHISP();
  }

  function isValidHIURL() {
    return !isCommunityDomain && pathName.replace(/\//g, '') != 'community';
  }

  function isValidCommunityURL() {
    return isCommunityDomain && pathName.replace(/\//g, '') == 'community';
  }

  function isLoginPage() {
    return isCommunityDomain && pathName == '/login.do';
  }

  function getDomainDetails() {
    var domainDetails = {};
    jQuery.ajax({
      method: "GET",
      dataType: "json",
      url: "/api/snc/community_user_redirection/getCommunityWebDomainInfo",
      async: false,
    }).done(function(response) {
      domainDetails = response.result;
    });
    return domainDetails;
  }

  function routeUser() {
    if (window.NOW.user.userID == 'guest')
      return;
    var isLegacy = true;
    jQuery.ajax({
      method: "GET",
      dataType: "json",
      url: "/api/snc/community_user_redirection/getLegacyPreference",
      async: false,
    }).done(function(response) {
      isLegacy = response.result.isLegacy;
    });
    if (isLegacy == 'false') {
      var sessionPreference = localStorage.getItem('hiLegacy');
      if (sessionPreference && sessionPreference == 'false') {
        routeToHISP();
      }
    }
  }

  function routeToHISP() {
    window.parent.location.replace('/hisp');
  }

  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  function loadEvent(func) {
    if (typeof addLoadEvent !== 'undefined') {
      addLoadEvent(func);
    } else {
      var oldonload = window.onload;
      if (typeof window.onload != 'function') {
        window.onload = func;
      } else {
        window.onload = function() {
          if (oldonload) {
            oldonload();
          }
          func();
        };
      }
    }
  }
})();
/*! RESOURCE: hi_int_wizard_survey_response */
var hi_int_wizard_survey_response = Class.create();
hi_int_wizard_survey_response.prototype = {
  createResponse: function(payload) {
    var userResponsesObj = this.payload;
    var sysIDSurvey = "484469711906c90035107efa5de22907";
    var si = new GlideRecord("survey_instance");
    si.initialize();
    si.taken_by = gs.getUserID();
    si.survey = sysIDSurvey;
    si.taken_on = gs.nowDateTime();
    var sysId1 = si.insert();
    var sq = new GlideRecord("survey_question_new");
    sq.addQuery('master', sysIDSurvey);
    sq.query();
    while (sq.next()) {
      if (sq.sys_id == "65b9ce4e19420d0035107efa5de229e6") {
        createResponseToQuestion(userResponsesObj.feedback, "65b9ce4e19420d0035107efa5de229e6");
      } else if (sq.sys_id == "962ac24e19420d0035107efa5de229df") {
        createResponseToQuestion(userResponsesObj.contact, "962ac24e19420d0035107efa5de229df");
      } else {
        createResponseToQuestion(userResponsesObj.feeling, "66e421b11906c90035107efa5de229f4");
      }
    }

    function createResponseToQuestion(value1, value2) {
      var sr = new GlideRecord("survey_response");
      sr.initialize();
      sr.instance = this.sysId1;
      sr.question = value2;
      sr.response = value1;
      var sysId2 = sr.insert();
    }
  }
}
/*! RESOURCE: ValidateStartEndDates */
function validateStartEndDate(startDateField, endDateField, processErrorMsg) {
  var startDate = g_form.getValue(startDateField);
  var endDate = g_form.getValue(endDateField);
  var format = g_user_date_format;
  if (startDate === "" || endDate === "")
    return true;
  var startDateFormat = getDateFromFormat(startDate, format);
  var endDateFormat = getDateFromFormat(endDate, format);
  if (startDateFormat < endDateFormat)
    return true;
  if (startDateFormat === 0 || endDateFormat === 0) {
    processErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(startDate === 0 ? startDateField : endDateField)));
    return false;
  }
  if (startDateFormat > endDateFormat) {
    processErrorMsg(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)));
    return false;
  }
  return true;
}
/*! RESOURCE: AddTeamMembers */
var AddTeamMembers = Class.create(GlideDialogWindow, {
  initialize: function() {
    this.setUpFacade();
  },
  setUpFacade: function() {
    GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
    this.setTitle(getMessage("Add Team Members"));
    this.setBody(this.getMarkUp(), false, false);
  },
  setUpEvents: function() {
    var dialog = this;
    var okButton = $("ok");
    if (okButton) {
      okButton.on("click", function() {
        var mapData = {};
        if (dialog.fillDataMap(mapData)) {
          var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembers2Processor");
          for (var strKey in mapData) {
            processor.addParam(strKey, mapData[strKey]);
          }
          dialog.showStatus(getMessage("Adding team members..."));
          processor.getXML(function() {
            dialog.refresh();
            dialog._onCloseClicked();
          });
        } else {
          dialog._onCloseClicked();
        }
      });
    }
    var cancelButton = $("cancel");
    if (cancelButton) {
      cancelButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var okNGButton = $("okNG");
    if (okNGButton) {
      okNGButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var cancelNGButton = $("cancelNG");
    if (cancelNGButton) {
      cancelNGButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var teamCombo = $("teamId");
    if (teamCombo) {
      teamCombo.on("change", function() {
        dialog.updateMembers();
      });
    }
  },
  updateMembers: function() {
    var arrMemberInfo = [];
    var teamCombo = $("teamId");
    if (teamCombo) {
      var strTeamSysId = teamCombo.value;
      var recTeamMember = new GlideRecord("scrum_pp_release_team_member");
      recTeamMember.addQuery("team", strTeamSysId);
      recTeamMember.query();
      while (recTeamMember.next()) {
        var recSysUser = new GlideRecord("sys_user");
        recSysUser.addQuery("sys_id", recTeamMember.name);
        recSysUser.query();
        var strName = recSysUser.next() ? recSysUser.name : "";
        var strPoints = recTeamMember.default_sprint_points + "";
        arrMemberInfo.push({
          name: strName,
          points: strPoints
        });
      }
    }
    if (arrMemberInfo.length > 0) {
      var strHtml = "<tr><th style='text-align: left; white-space: nowrap'>" +
        "Member</th><th style='text-align: left; white-space: nowrap'>Sprint Points</th><tr>";
      for (var nSlot = 0; nSlot < arrMemberInfo.length; ++nSlot) {
        var strMemberName = arrMemberInfo[nSlot].name + "";
        var strMemberPoints = arrMemberInfo[nSlot].points + "";
        strHtml += "<tr><td  style='text-align: left; white-space: nowrap'>" + strMemberName +
          "</td><td style='text-align: left; white-space: nowrap'>" + strMemberPoints + "</td></tr>";
      }
      $("memberId").update(strHtml);
    } else {
      $("memberId").update("<tr><td style='font-weight: bold'>" + getMessage("No team members") + "</td></tr>");
    }
  },
  refresh: function() {
    GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
  },
  getScrumReleaseTeamSysId: function() {
    return g_form.getUniqueValue() + "";
  },
  getUserChosenTeamSysIds: function() {
    return $F('teamId') + "";
  },
  showStatus: function(strMessage) {
    $("task_controls").update(strMessage);
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getMarkUp: function() {
    var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
    groupAjax.addParam('sysparm_name', 'getTeamInfo');
    groupAjax.addParam('sysparm_scrum_team_sysid', this.getScrumReleaseTeamSysId());
    groupAjax.getXML(this.generateMarkUp.bind(this));
  },
  generateMarkUp: function(response) {
    var mapTeamInfo = {};
    var teamData = response.responseXML.getElementsByTagName("team");
    var strName, strSysId;
    for (var i = 0; i < teamData.length; i++) {
      strName = teamData[i].getAttribute("name");
      strSysId = teamData[i].getAttribute("sysid");
      mapTeamInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    var arrTeamNames = [];
    for (var strTeamName in mapTeamInfo) {
      arrTeamNames.push(strTeamName + "");
    }
    arrTeamNames.sort();
    var strMarkUp = "";
    if (arrTeamNames.length > 0) {
      var strTable = "<table><tr><td><label for='teamId'>" + getMessage("Team") + "</label>&nbsp;<select id='teamId'>";
      for (var nSlot = 0; nSlot < arrTeamNames.length; ++nSlot) {
        strName = arrTeamNames[nSlot];
        strSysId = mapTeamInfo[strName].sysid;
        strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
      }
      strTable += "</select></label></td></tr></table>";
      var strTable2 = "<table style='width: 100%;'><tr><td style='width: 50%;'></td><td><table id='memberId'></table></td><td style='width: 50%;'></td></tr></table>";
      strMarkUp = "<div id='task_controls' style='overflow: auto;>" + strTable + strTable2 +
        "</div><table style='width: 100%'><tr><td style='white-space: nowrap; text-align: right;'><button id='ok' type='button'>" + getMessage("OK") + "</button>" +
        "<button id='cancel' type='button'>" + getMessage("Cancel") + "</button></td></tr></table>";
    } else {
      strMarkUp = "<div id='task_controls'><p>No release teams found</p>" +
        "<table style='width: 100%'><tr><td style='white-space: nowrap; text-align: right;'><button id='okNG' type='button'>" + getMessage("OK") + "</button>" +
        "<button id='cancelNG' type='button'>" + getMessage("Cancel") + "</button></td></tr></table></div>";
    }
    this.setBody(strMarkUp, false, false);
    this.setUpEvents();
    this.display(true);
    this.setWidth(280);
  },
  fillDataMap: function(mapData) {
    var strChosenTeamSysId = this.getUserChosenTeamSysIds();
    if (strChosenTeamSysId) {
      mapData.sysparm_name = "createReleaseTeamMembers";
      mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId();
      mapData.sysparm_teams = strChosenTeamSysId;
      return true;
    } else {
      return false;
    }
  }
});
/*! RESOURCE: ScrumAddSprints */
var ScrumAddSprints = Class.create({
  initialize: function(gr) {
    this._gr = gr;
    this._prmNms = ["spName", "spDuration", "spStartDate", "spStartNum", "spNum", "_tn", "_sys_id"];
    this._dateFN = ["spStartDate"];
    this._refObs = [];
    this._prmVls = [];
    for (var i = 0; i < this._prmNms.length; i++) {
      this._prmVls[this._prmNms[i]] = "";
    }
    this._prmErr = [];
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._crtDlg = new dialogClass("scrum_add_sprints_dialog");
    this._crtDlg.setTitle("Add Sprints");
    this._crtDlg.setPreference("_tn", this._gr.getTableName());
    this._crtDlg.setPreference("_sys_id", (this._gr.getUniqueValue()));
    this._crtDlg.setPreference("handler", this);
  },
  showDialog: function() {
    this._crtDlg.render();
  },
  onSubmit: function() {
    this._readFormValues();
    if (!this._validate()) {
      var errMsg = "Before you submit:";
      for (var i = 0; i < this._prmErr.length; i++) {
        errMsg += "\n * " + this._prmErr[i];
      }
      alert(errMsg);
      $j('#spName').focus();
      return false;
    }
    this._crtDlg.destroy();
    var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
    ga.addParam("sysparm_name", "checkDuration");
    for (var i = 0; i < this._prmNms.length; i++) {
      ga.addParam(this._prmNms[i], this._prmVls[this._prmNms[i]]);
    }
    ga.getXML(this.checkComplete.bind(this));
    return false;
  },
  checkComplete: function(response) {
    var resp = response.responseXML.getElementsByTagName("item");
    if (resp[0].getAttribute("result") == "success") {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._plsWtDlg = new dialogClass("scrum_please_wait");
      this._plsWtDlg.setTitle("Working.  Please wait.");
      this._plsWtDlg.render();
      var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
      ga.addParam("sysparm_name", "addSprints");
      for (var i = 0; i < this._prmNms.length; i++) {
        ga.addParam(this._prmNms[i], this._prmVls[this._prmNms[i]]);
      }
      ga.getXML(this.createComplete.bind(this));
      return false;
    }
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._rlsPshDlg = new dialogClass("scrum_release_push_confirm_dialog");
    this._rlsPshDlg.setTitle("Modify Release Dates");
    this._rlsPshDlg.setPreference("handler", this);
    this._rlsPshDlg.render();
  },
  confirmReleasePush: function() {
    this._rlsPshDlg.destroy();
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._plsWtDlg = new dialogClass("scrum_please_wait");
    this._plsWtDlg.setTitle("Working.  Please wait.");
    this._plsWtDlg.render();
    var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
    ga.addParam("sysparm_name", "addSprints");
    for (var i = 0; i < this._prmNms.length; i++) {
      ga.addParam(this._prmNms[i], this._prmVls[this._prmNms[i]]);
    }
    ga.getXML(this.createComplete.bind(this));
    return false;
  },
  cancelReleasePush: function(response) {
    this._rlsPshDlg.destroy();
    window.location.reload();
    return false;
  },
  createComplete: function(response) {
    this._plsWtDlg.destroy();
    var resp = response.responseXML.getElementsByTagName("item");
    if (resp[0].getAttribute("result") == "success") {
      this._sprints = response.responseXML.documentElement.getAttribute("answer");
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._viewConfirm = new dialogClass("scrum_sprints_view_confirm_dialog");
      this._viewConfirm.setTitle("Sprints Created");
      this._viewConfirm.setPreference("handler", this);
      this._viewConfirm.render();
    } else {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._createError = new dialogClass("scrum_error");
      this._createError.setTitle("Error Creating Sprints");
      this._createError.setPreference("handler", this);
      this._createError.render();
    }
  },
  viewConfirmed: function() {
    this._viewConfirm.destroy();
    window.location = "rm_sprint_list.do?sysparm_query=numberIN" + this._sprints + "&sysparm_view=scrum";
    return false;
  },
  viewCancelled: function() {
    this._viewConfirm.destroy();
    window.location.reload();
    return false;
  },
  popCal: function(dateFieldId) {
    return new GwtDateTimePicker(dateFieldId, g_user_date_time_format, true);
  },
  _validate: function() {
    var valid = true;
    this._prmErr = [];
    if (this._prmVls["spName"] == "") {
      this._prmErr.push("You must supply a Name");
      valid = false;
    }
    if (this._prmVls["spDuration"] == "" || isNaN(this._prmVls['spDuration'])) {
      this._prmErr.push("You must supply a valid numeric duration");
      valid = false;
    }
    if (this._prmVls["spStartDate"] == "") {
      this._prmErr.push("You must supply a Start Date");
      valid = false;
    }
    if (this._prmVls["spNum"] == "" || isNaN(this._prmVls['spNum'])) {
      this._prmErr.push("You must supply a valid Number of Sprints to create");
      valid = false;
    }
    if (this._prmVls["spStartNum"] == "" || isNaN(this._prmVls['spStartNum'])) {
      this._prmErr.push("You must supply a valid starting number");
      valid = false;
    }
    return valid;
  },
  _readFormValues: function() {
    for (var i = 0; i < this._prmNms.length; i++) {
      var frmVl = this._getValue(this._prmNms[i]);
      if ((typeof frmVl === "undefined") || frmVl == "undefined" || frmVl == null || frmVl == "null") {
        frmVl = "";
      }
      this._prmVls[this._prmNms[i]] = frmVl;
    }
  },
  _getValue: function(inptNm) {
    return gel(inptNm).value;
  },
  type: "ScrumAddSprints"
});
/*! RESOURCE: pdb_HighchartsConfigBuilder */
var HighchartsBuilder = {
  getChartConfig: function(chartOptions, tzOffset) {
    var chartTitle = chartOptions.title.text,
      xAxisTitle = chartOptions.xAxis.title.text,
      xAxisCategories = chartOptions.xAxis.categories,
      yAxisTitle = chartOptions.yAxis.title.text,
      series = chartOptions.series;
    this.convertEpochtoMs(xAxisCategories);
    this.formatDataSeries(xAxisCategories, series);
    var config = {
      chart: {
        type: 'area',
        zoomType: 'x'
      },
      credits: {
        enabled: false
      },
      title: {
        text: chartTitle
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: xAxisTitle,
          style: {
            textTransform: 'capitalize'
          }
        }
      },
      yAxis: {
        reversedStacks: false,
        title: {
          text: yAxisTitle,
          style: {
            textTransform: 'capitalize'
          }
        }
      },
      plotOptions: {
        area: {
          stacking: 'normal'
        },
        series: {
          marker: {
            enabled: true,
            symbol: 'circle',
            radius: 2
          },
          step: 'center'
        }
      },
      tooltip: {
        valueDecimals: 2,
        style: {
          whiteSpace: "wrap",
          width: "200px"
        }
      },
      series: series
    };
    var convertedOffset = -1 * (tzOffset / 60);
    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      },
      global: {
        timezoneOffset: convertedOffset
      }
    });
    return config;
  },
  convertEpochtoMs: function(categories) {
    categories.forEach(function(point, index, arr) {
      arr[index] *= 1000;
    });
  },
  formatDataSeries: function(categories, series) {
    series.forEach(function(row, index, arr) {
      arr[index].data.forEach(function(innerRow, innerIndex, innerArr) {
        var value = innerRow;
        if (value == "NaN") {
          value = 0;
        }
        var xValue = categories[innerIndex];
        innerArr[innerIndex] = [xValue, value];
      });
    });
  }
};
/*! RESOURCE: ScrumCloneReleaseTeamDialog */
var ScrumCloneReleaseTeamDialog = Class.create();
ScrumCloneReleaseTeamDialog.prototype = {
  initialize: function() {
    this.setUpFacade();
  },
  setUpFacade: function() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("task_window");
    this._mstrDlg.setTitle(getMessage("Add Team Members"));
    this._mstrDlg.setBody(this.getMarkUp(), false, false);
  },
  setUpEvents: function() {
    var dialog = this._mstrDlg;
    var _this = this;
    var okButton = $("ok");
    if (okButton) {
      okButton.on("click", function() {
        var mapData = {};
        if (_this.fillDataMap(mapData)) {
          var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembers2Processor");
          for (var strKey in mapData) {
            processor.addParam(strKey, mapData[strKey]);
          }
          _this.showStatus(getMessage("Adding team members..."));
          processor.getXML(function() {
            _this.refresh();
            dialog.destroy();
          });
        } else {
          dialog.destroy();
        }
      });
    }
    var cancelButton = $("cancel");
    if (cancelButton) {
      cancelButton.on("click", function() {
        dialog.destroy();
      });
    }
    var okNGButton = $("okNG");
    if (okNGButton) {
      okNGButton.on("click", function() {
        dialog.destroy();
      });
    }
    var cancelNGButton = $("cancelNG");
    if (cancelNGButton) {
      cancelNGButton.on("click", function() {
        dialog.destroy();
      });
    }
    var teamCombo = $("teamId");
    if (teamCombo) {
      teamCombo.on("change", function() {
        _this.updateMembers();
      });
    }
  },
  updateMembers: function() {
    var arrMemberInfo = [];
    var teamCombo = $("teamId");
    if (teamCombo) {
      var strTeamSysId = teamCombo.value;
      var recTeamMember = new GlideRecord("scrum_pp_release_team_member");
      recTeamMember.addQuery("team", strTeamSysId);
      recTeamMember.query();
      while (recTeamMember.next()) {
        var recSysUser = new GlideRecord("sys_user");
        recSysUser.addQuery("sys_id", recTeamMember.name);
        recSysUser.query();
        var strName = recSysUser.next() ? recSysUser.name : "";
        var strPoints = recTeamMember.default_sprint_points + "";
        arrMemberInfo.push({
          name: strName,
          points: strPoints
        });
      }
    }
    if (arrMemberInfo.length > 0) {
      var strHtml = "<tr><th style='text-align: left; white-space: nowrap'>" +
        "Member</th><th style='text-align: left; white-space: nowrap'>Sprint Points</th><tr>";
      for (var nSlot = 0; nSlot < arrMemberInfo.length; ++nSlot) {
        var strMemberName = arrMemberInfo[nSlot].name + "";
        var strMemberPoints = arrMemberInfo[nSlot].points + "";
        strHtml += "<tr><td  style='text-align: left; white-space: nowrap'>" + strMemberName +
          "</td><td style='text-align: left; white-space: nowrap'>" + strMemberPoints + "</td></tr>";
      }
      $("memberId").update(strHtml);
    } else {
      $("memberId").update("<tr><td style='font-weight: bold'>" + getMessage("No team members") + "</td></tr>");
    }
  },
  refresh: function() {
    GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
  },
  getScrumReleaseTeamSysId: function() {
    return g_form.getUniqueValue() + "";
  },
  getUserChosenTeamSysIds: function() {
    return $F('teamId') + "";
  },
  showStatus: function(strMessage) {
    $("task_controls").update(strMessage);
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getMarkUp: function() {
    var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
    groupAjax.addParam('sysparm_name', 'getTeamInfo');
    groupAjax.addParam('sysparm_scrum_team_sysid', this.getScrumReleaseTeamSysId());
    groupAjax.getXML(this.generateMarkUp.bind(this));
  },
  generateMarkUp: function(response) {
    var mapTeamInfo = {};
    var teamData = response.responseXML.getElementsByTagName("team");
    var strName, strSysId;
    for (var i = 0; i < teamData.length; i++) {
      strName = teamData[i].getAttribute("name");
      strSysId = teamData[i].getAttribute("sysid");
      mapTeamInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    var arrTeamNames = [];
    for (var strTeamName in mapTeamInfo) {
      arrTeamNames.push(strTeamName + "");
    }
    arrTeamNames.sort();
    var strMarkUp = "";
    if (arrTeamNames.length > 0) {
      var strTable = "<div class='row'><div class='form-group'><label class='col-sm-3 control-label' for='teamId'>" + getMessage("Team") + "</label><span class='col-sm-9'><select class='form-control' id='teamId'>";
      for (var nSlot = 0; nSlot < arrTeamNames.length; ++nSlot) {
        strName = arrTeamNames[nSlot];
        strSysId = mapTeamInfo[strName].sysid;
        strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
      }
      strTable += "</select></span></div></div>";
      var strTable2 = "<div class='row' style='padding-top:10px;'><div id='memberId' class='col-sm-12'></div></div>";
      strMarkUp = "<div id='task_controls'>" + strTable + strTable2 +
        "<div style='text-align:right;padding-top:20px;'>" +
        "<button id='cancel' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>" +
        "&nbsp;&nbsp;<button id='ok' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
        "</div></div>";
    } else {
      strMarkUp = "<div id='task_controls'><p>No release teams found</p>" +
        "<div style='padding-top:20px;text-align:right;'>" +
        "<button id='cancelNG' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>" +
        "&nbsp;&nbsp;<button id='okNG' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
        "</div></div>";
    }
    this._mstrDlg.setBody(strMarkUp, false, false);
    this.setUpEvents();
    this.display(true);
  },
  fillDataMap: function(mapData) {
    var strChosenTeamSysId = this.getUserChosenTeamSysIds();
    if (strChosenTeamSysId) {
      mapData.sysparm_name = "createReleaseTeamMembers";
      mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId();
      mapData.sysparm_teams = strChosenTeamSysId;
      return true;
    } else {
      return false;
    }
  }
};
/*! RESOURCE: hisputil */
function switchToHISP() {
  var postConfig = {
    sysparm_processor: 'HISPUtilAjax',
    sysparm_name: 'setSPPreference',
    sysparm_sp_preference: 'false',
    sysparm_global: true,
    sysparm_synch: false
  }
  $j.post('xmlhttp.do', postConfig, function(result) {
    window.location = '/hisp';
  });
}
/*! RESOURCE: SaveMe */
var g_list_edit_double = false;
/*! RESOURCE: PmClientDateAndDurationHandler */
var PmClientDateAndDurationHandler = Class.create();
PmClientDateAndDurationHandler.prototype = {
  initialize: function(_gForm) {
    this._gForm = _gForm;
  },
  showErrorMessage: function(column, message) {
    jslog("Into PmClientDateAndDurationHandler.showErrorMessage -> " + column);
    if (!column) {
      this._gForm.addErrorMessage("Enter a valid date");
    } else {
      try {
        if (!message)
          this._gForm.showFieldMsg(column, 'Enter a valid date', 'error');
        else
          this._gForm.showFieldMsg(column, message, 'error');
      } catch (e) {
        jslog("PmClientDateAndDurationHandler.showErrorMessage: " + colum + " is not available on the form");
      }
    }
  },
  isValidClientDate: function(column) {
    jslog("Into PmClientDateAndDurationHandler.isValidClientDate -> " + column);
    var dateValue = this._gForm.getValue(column);
    if (dateValue == null || dateValue == '') {
      this.showErrorMessage(column);
      return false;
    }
    var date = new Date(dateValue);
    if (date != 'Invalid Date' && String(date.getFullYear()).length != 4) {
      this.showErrorMessage(column);
      return false;
    }
    return true;
  },
  isValidServerDate: function(column, dateValue, callback) {
    jslog("Into PmClientDateAndDurationHandler.isValidServerDate -> " + column + " - " + dateValue);
    this.callback = callback;
    var ga = new GlideAjax('AjaxProjectTaskUtil');
    ga.addParam('sysparm_name', 'validateDisplayDate');
    ga.addParam('sysparm_column', column);
    ga.addParam('sysparm_date', dateValue);
    ga.getXMLAnswer(this.validateResponse);
    return false;
  },
  validateResponse: function(serverResponse) {
    jslog("Into validateResponse.validateResponse -> " + serverResponse);
    if (serverResponse && serverResponse.responseXML) {
      var result = serverResponse.responseXML.getElementByTagName("result");
      var status = result.getAttribute("status");
      var column = result.getAttribute("column");
      if (status == 'error') {
        this.showErrorMessage(column);
      } else {
        jslog("Into validateResponse.validateResponse -> Calling Callback PmClientDateAndDurationHandler");
        this.callback();
      }
    }
  },
  type: 'PmClientDateAndDurationHandler'
};
/*! RESOURCE: workaround_z_last_include */
addRenderEvent(function() {
  try {
    if (!window.initAngularForm)
      return;
    if (!window.angular)
      return;
    if (window.angular.element('sn-stream').length != 0) {
      initAngularForm();
    }
  } catch (e) {}
});
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function() {
  if (!window.jQuery)
    return;
  if (!window.$j_glide)
    window.$j = jQuery.noConflict();
  if (window.$j_glide && jQuery != window.$j_glide) {
    if (window.$j_glide)
      jQuery.noConflict(true);
    window.$j = window.$j_glide;
  }
})();;;