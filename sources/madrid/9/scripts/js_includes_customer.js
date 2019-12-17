/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: data.service */
(function() {
  'use strict';

  function dataService() {
    var data = {};
    var service = {
      getData: getData,
      setData: setData
    };
    return service;

    function getData() {
      return data;
    }

    function setData(item) {
      data = item;
    }
  }
  angular
    .module('data.module')
    .factory('dataService', dataService);
})();
/*! RESOURCE: ConnectionUtils */
var ConnectionUtils = {
  getSysConnection: function() {
    var connGR = new GlideRecord("sys_connection");
    connGR.addQuery('active', true);
    connGR.addQuery("connection_alias", g_form.getValue("connection_alias"));
    connGR.addQuery("sys_domain", g_form.getValue("sys_domain"));
    connGR.addQuery("sys_id", "!=", g_form.getUniqueValue());
    connGR.query();
    return connGR;
  },
  doConnection: function(verb) {
    if (g_form.getValue("active") == "false") {
      gsftSubmit(null, g_form.getFormElement(), verb);
    }
    var connGR;
    var performOverride = function() {
      connGR.active = false;
      connGR.update();
      gsftSubmit(null, g_form.getFormElement(), verb);
    };
    var grConnAlias = new GlideRecord("sys_alias");
    if (grConnAlias.get(g_form.getValue("connection_alias"))) {
      if (grConnAlias.multiple_connections == 'true') {
        gsftSubmit(null, g_form.getFormElement(), verb);
      } else {
        connGR = this.getSysConnection();
        if (connGR.next()) {
          var currName = g_form.getValue("name");
          if (connGR.name.toUpperCase() == currName.toUpperCase()) {
            var uniqueErrMsg = new GwtMessage().getMessage("A connection with {0} name already exists, duplicate connection names are not allowed", currName);
            g_form.addErrorMessage(uniqueErrMsg);
            return false;
          }
          var title = new GwtMessage().getMessage("Confirm inactivation");
          var question = new GwtMessage().getMessage("You already have a {0} connection active, {1}.<br/>By making this one active, {2} will become inactive. <br/>Are you sure you want to make {3} the active connection?", connGR.protocol, connGR.name, connGR.name, currName);
          this.confirmOverride(title, question, performOverride);
        } else {
          gsftSubmit(null, g_form.getFormElement(), verb);
        }
      }
    }
  },
  confirmOverride: function(title, question, onPromptComplete) {
    var dialogClass = (window.GlideModal) ? GlideModal : GlideDialogWindow;
    var dialog = new GlideDialogWindow('glide_confirm_basic');
    dialog.setTitle(title);
    dialog.setSize(400, 325);
    dialog.setPreference('title', question);
    dialog.setPreference('onPromptComplete', onPromptComplete);
    dialog.render();
  },
};
/*! RESOURCE: PE Highcharts No Data */
(function(a) {
  typeof module === "object" && module.exports ? module.exports = a : a(Highcharts)
})(function(a) {
  function h() {
    return !!this.points.length
  }

  function d() {
    this.hasData() ? this.hideNoData() : this.showNoData()
  }
  var e = a.seriesTypes,
    c = a.Chart.prototype,
    f = a.getOptions(),
    g = a.extend,
    i = a.each;
  g(f.lang, {
    noData: "No data to display"
  });
  f.noData = {
    position: {
      x: 0,
      y: 0,
      align: "center",
      verticalAlign: "middle"
    },
    attr: {},
    style: {
      fontWeight: "bold",
      fontSize: "12px",
      color: "#60606a"
    }
  };
  i(["pie", "gauge", "waterfall", "bubble", "treemap"],
    function(b) {
      if (e[b]) e[b].prototype.hasData = h
    });
  a.Series.prototype.hasData = function() {
    return this.visible && this.dataMax !== void 0 && this.dataMin !== void 0
  };
  c.showNoData = function(b) {
    var a = this.options,
      b = b || a.lang.noData,
      a = a.noData;
    if (!this.noDataLabel) this.noDataLabel = this.renderer.label(b, 0, 0, null, null, null, a.useHTML, null, "no-data").attr(a.attr).css(a.style).add(), this.noDataLabel.align(g(this.noDataLabel.getBBox(), a.position), !1, "plotBox")
  };
  c.hideNoData = function() {
    if (this.noDataLabel) this.noDataLabel =
      this.noDataLabel.destroy()
  };
  c.hasData = function() {
    for (var a = this.series, c = a.length; c--;)
      if (a[c].hasData() && !a[c].options.isInternal) return !0;
    return !1
  };
  c.callbacks.push(function(b) {
    a.addEvent(b, "load", d);
    a.addEvent(b, "redraw", d)
  })
});
/*! RESOURCE: PlannedTaskDateUtil */
var PlannedTaskDateUtil = Class.create();
PlannedTaskDateUtil.prototype = {
  initialize: function(g_form, g_scratchpad) {
    this.g_form = g_form;
    this.g_scratchpad = g_scratchpad;
    var tableName = g_form.getTableName();
    this.dayField = "ni." + tableName + ".durationdur_day";
    this.hourField = "ni." + tableName + ".durationdur_hour";
    this.minuteField = "ni." + tableName + ".durationdur_min";
    this.secondField = "ni." + tableName + ".durationdur_sec";
    this.tableName = tableName;
  },
  _showErrorMessage: function(column, message) {
    if (!message && !column) {
      try {
        this._gForm.showFieldMsg(column, message, 'error');
      } catch (e) {}
    }
  },
  setEndDate: function(answer) {
    this.g_scratchpad.flag = true;
    this.g_form.setValue('end_date', answer);
  },
  setDuration: function(answer) {
    this.g_scratchpad.flag = true;
    this.g_form.setValue('duration', answer);
  },
  getStartDate: function() {
    return this.g_form.getValue('start_date');
  },
  getDays: function() {
    var days = this.g_form.getValue(this.dayField);
    return this._getIntValue(days);
  },
  getHours: function() {
    var hours = this.g_form.getValue(this.hourField);
    return this._getIntValue(hours);
  },
  getMinutes: function() {
    var minutes = this.g_form.getValue(this.minuteField);
    return this._getIntValue(minutes);
  },
  getSeconds: function() {
    var seconds = this.g_form.getValue(this.secondField);
    return this._getIntValue(seconds);
  },
  _getIntValue: function(value) {
    var intValue = 0;
    if (value && !isNaN(value))
      intValue = parseInt(value);
    return intValue;
  },
  setDurationHoursAndDays: function() {
    var g_form = this.g_form;
    var days = this.getDays();
    var hours = this.getHours();
    var minutes = this.getMinutes();
    var seconds = this.getSeconds();
    this.g_scratchpad.flag = false;
    if (seconds >= 60) {
      minutes += Math.floor(seconds / 60);
      seconds = seconds % 60;
    }
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
    if (hours >= 24) {
      days += Math.floor(hours / 24);
      hours = hours % 24;
    }
    if (hours < 9)
      hours = "0" + hours;
    if (minutes < 9)
      minutes = "0" + minutes;
    if (seconds < 9)
      seconds = "0" + seconds;
    g_form.setValue(this.dayField, days);
    g_form.setValue(this.hourField, hours);
    g_form.setValue(this.minuteField, minutes);
    g_form.setValue(this.secondField, seconds);
  },
  validateDurationFields: function() {
    var g_form = this.g_form;
    var day = g_form.getValue(this.dayField);
    var hour = g_form.getValue(this.hourField);
    var minute = g_form.getValue(this.minuteField);
    var second = g_form.getValue(this.secondField);
    if (!day || day.trim() == '')
      g_form.setValue(this.dayField, "00");
    if (!hour || hour.trim() == '')
      g_form.setValue(this.hourField, "00");
    if (!minute || minute.trim() == '')
      g_form.setValue(this.minuteField, "00");
    if (!second || second.trim() == '')
      g_form.setValue(this.secondField, "00");
    var startDate = g_form.getValue("start_date");
    if (g_form.getValue("duration") == '')
      g_form.setValue("end_date", g_form.getValue("start_date"));
  },
  handleResponse: function(response, column) {
    if (response && response.responseXML) {
      var result = response.responseXML.getElementsByTagName("result");
      if (result) {
        result = result[0];
        var status = result.getAttribute("status");
        var answer = result.getAttribute("answer");
        if (status == 'error') {
          var message = result.getAttribute('message');
          this._showErrorMessage(result.getAttribute("column"), message);
        } else {
          if (column == 'duration' || column == 'start_date')
            this.setEndDate(answer);
          else if (column == 'end_date')
            this.setDuration(answer);
        }
      }
    }
  },
  calculateDateTime: function(column) {
    var self = this;
    var ga = new GlideAjax('AjaxPlannedTaskDateUtil');
    ga.addParam('sysparm_start_date', this.g_form.getValue('start_date'));
    if (column == 'duration' || column == 'start_date') {
      ga.addParam('sysparm_duration', this.g_form.getValue('duration'));
      ga.addParam('sysparm_name', 'getEndDate');
    } else if (column == 'end_date') {
      ga.addParam('sysparm_end_date', this.g_form.getValue('end_date'));
      ga.addParam('sysparm_name', 'getDuration');
    }
    ga.getXML(function(response) {
      self.handleResponse(response, column);
    });
  },
  calculateEndDateFromDuration: function(control, oldValue, newValue, isLoading, isTemplate) {
    var g_form = this.g_form;
    var g_scratchpad = this.g_scratchpad;
    this.validateDurationFields();
    if (isLoading || g_scratchpad.flag) {
      g_scratchpad.flag = false;
      return;
    }
    var startDate = this.getStartDate();
    var startDateEmpty = !startDate || startDate.trim() === '';
    if (newValue.indexOf("-") > -1 || startDateEmpty)
      return;
    this.setDurationHoursAndDays();
    this.calculateDateTime('duration');
  },
  calculateEndDateFromStartDate: function(control, oldValue, newValue, isLoading, isTemplate) {
    var g_form = this.g_form;
    var g_scratchpad = this.g_scratchpad;
    try {
      g_form.hideFieldMsg('start_date');
    } catch (e) {}
    if (isLoading || g_scratchpad.flag) {
      g_scratchpad.flag = false;
      return;
    }
    if (newValue == '')
      return;
    this.calculateDateTime('start_date');
  },
  calculateDurationFromEndDate: function(control, oldValue, newValue, isLoading, isTemplate) {
    var g_form = this.g_form;
    var g_scratchpad = this.g_scratchpad;
    var startDateColumn = 'start_date';
    var startDate;
    if (isLoading || g_scratchpad.flag) {
      g_scratchpad.flag = false;
      return;
    }
    startDate = g_form.getValue(startDateColumn);
    this.calculateDateTime('end_date');
  },
  type: "PlannedTaskDateUtil"
};
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
/*! RESOURCE: AppointmentBookingConfigHelper */
var APP_BOOKING_CONSTANTS = {};
APP_BOOKING_CONSTANTS.MESSAGES = {};
APP_BOOKING_CONSTANTS.MESSAGES.ERROR = {};
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT = "";
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE = "";
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.BREAKTIME = "";
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DURATION = "";
APP_BOOKING_CONSTANTS.MESSAGES.AVAILABLE = "";
APP_BOOKING_CONSTANTS.MESSAGES.BREAK = "";
APP_BOOKING_CONSTANTS.MESSAGES.INSUFFICIENT_TIME = "";
APP_BOOKING_CONSTANTS.MESSAGES.FETCHED = false;
var AppointmentBookingConfigHelper = Class.create();
AppointmentBookingConfigHelper.prototype = {
  initialize: function() {
    this.htmlTemplate = '';
  },
  clearTimespans: function() {
    var macroElem = $j("#appointmentBookingTimeSlotContainer")[0];
    if (macroElem) {
      macroElem.innerHTML = '';
    }
  },
  setBookableTime: function(bookableTime) {
    g_form.setValue("bookable_time", bookableTime);
  },
  initEventHandlers: function() {
    var breakStartElem = $j("#break-start");
    var breakEndElem = $j("#break-end");
    if (breakStartElem && breakEndElem) {
      breakStartElem.change(function() {
        var configHelper = new AppointmentBookingConfigHelper();
        if (configHelper.validateBreakTimes()) {
          configHelper.refreshTimeSlots();
        }
      });
      breakEndElem.change(function() {
        var configHelper = new AppointmentBookingConfigHelper();
        if (configHelper.validateBreakTimes()) {
          configHelper.refreshTimeSlots();
        }
      });
    }
  },
  validateDailySchedule: function() {
    var dailyStartTime = g_form.getValue("daily_start_time");
    var dailyEndTime = g_form.getValue("daily_end_time");
    g_form.hideFieldMsg('daily_start_time', true);
    g_form.hideFieldMsg('daily_end_time', true);
    if (!this.compareTime(dailyStartTime, dailyEndTime)) {
      g_form.showFieldMsg('daily_start_time', APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE, 'error');
      return false;
    }
    return true;
  },
  validateBreakTimes: function() {
    var considerBreak = g_form.getValue("include_daily_break");
    var breakStartElem = $j("#break-start");
    var breakEndElem = $j("#break-end");
    g_form.hideFieldMsg('include_daily_break', true);
    if (breakStartElem && breakEndElem) {
      if (breakStartElem[0].value == "" || breakEndElem[0].value == "")
        return true;
      if (!this.compareTime(breakStartElem[0].value, breakEndElem[0].value)) {
        g_form.showFieldMsg('include_daily_break', 'Break start time cannot be after break end time', 'error');
        return false;
      }
    }
    return true;
  },
  validateDurations: function() {
    var appointmentDuration = g_form.getValue("appointment_duration");
    var workDuration = g_form.getValue("work_duration");
    var avgTravelDuration = g_form.getValue("average_travel_duration");
    g_form.hideFieldMsg('appointment_duration', true);
    if ((Number(workDuration) + Number(avgTravelDuration)) > Number(appointmentDuration)) {
      g_form.showFieldMsg('appointment_duration', APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DURATION, 'error');
      return false;
    }
    return true;
  },
  validateOnSubmit: function() {
    var shouldSubmit = true;
    g_form.clearMessages();
    if (!this.validateDailySchedule()) {
      g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
      g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE);
      shouldSubmit = false;
    }
    if (!this.validateBreakTimes()) {
      if (shouldSubmit)
        g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
      g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.BREAKTIME);
      shouldSubmit = false;
    }
    if (!this.validateDurations()) {
      if (shouldSubmit)
        g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
      g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DURATION);
      shouldSubmit = false;
    }
    return shouldSubmit;
  },
  compareTime: function(start, end) {
    if (start && end) {
      var startComponentsArr = start.split(":");
      var endComponentsArr = end.split(":");
      var len = Math.min(startComponentsArr.length, endComponentsArr.length);
      var startNumeric = 0;
      var endNumeric = 0;
      try {
        for (var i = len - 1; i >= 0; i--) {
          startNumeric = startNumeric / 60.0 + parseInt(startComponentsArr[i]);
          endNumeric = endNumeric / 60.0 + parseInt(endComponentsArr[i]);
        }
        return startNumeric <= endNumeric;
      } catch (err) {
        return false;
      }
    }
  },
  refreshTimeSlots: function() {
    if (!APP_BOOKING_CONSTANTS.MESSAGES.FETCHED) {
      var appointmentBookingAjax = new GlideAjax('sn_apptmnt_booking.AppointmentBookingAjaxUtil');
      appointmentBookingAjax.addParam('sysparm_name', 'getTranslatedMessagesForAppBookingConfig');
      appointmentBookingAjax.getXML(this.processAppBookingTranslationMessagesResponse.bind(this));
    } else
      this._refreshTimeSlots();
  },
  processAppBookingTranslationMessagesResponse: function(response, args) {
    translatedMessages = response.responseXML.documentElement.getAttribute("answer");
    if (translatedMessages) {
      APP_BOOKING_CONSTANTS = JSON.parse(translatedMessages);
      APP_BOOKING_CONSTANTS.MESSAGES.FETCHED = true;
      this._refreshTimeSlots();
    }
  },
  _refreshTimeSlots: function() {
    var timeSlots = this.processTimeSpans();
    var bookableTime = [];
    for (var i = 0; i < timeSlots.length; i++) {
      var slot = timeSlots[i];
      if (slot) {
        var slotClassName = "time-slot";
        if (!slot.available)
          slotClassName += "-disable";
        this.htmlTemplate += '<div class="' + slotClassName + '">';
        if (slot.available)
          this.htmlTemplate += '<div class="time-slot-label"><span data-index=' + i + ' action-value=' + i + ' class="icon-check"></span></div>';
        else
          this.htmlTemplate += '<div class="time-slot-label"></div>';
        this.htmlTemplate += '<div class="time-slot-value"> <span class="m-l-xs m-r-xs"> ' + slot.start + ' </span>';
        this.htmlTemplate += '<span class="m-l-xs m-r-xs"> - </span>';
        this.htmlTemplate += '<span class="m-l-xs m-r-xs"> ' + slot.end + ' </span> </div>';
        if (slot.available)
          bookableTime.push(slot.start + "-" + slot.end);
        if (!slot.available)
          this.htmlTemplate += '<div class="time-slot-reason"> <span class="m-l-xs m-r-xs"> - ' + slot.reason + ' </span> </div>';
        this.htmlTemplate += '</div>';
      }
    }
    this.setBookableTime(bookableTime.join() + "");
    this.updateTimeSlots();
  },
  processTimeSpans: function() {
    var windowDuration = g_form.getValue("appointment_duration");
    var dailyStartTime = g_form.getValue("daily_start_time");
    var dailyEndTime = g_form.getValue("daily_end_time");
    if (this.isNil(windowDuration) || this.isNil(dailyStartTime) || this.isNil(dailyEndTime))
      return [];
    var considerBreak = g_form.getValue("include_daily_break");
    var breakStartElem = $j("#break-start")[0];
    var breakEndElem = $j("#break-end")[0];
    var breakStartTime = "0:00",
      breakEndTime = "0:00";
    if ((considerBreak == true || considerBreak == "true") && breakStartElem && breakEndElem) {
      breakStartTime = breakStartElem.value + "";
      breakEndTime = breakEndElem.value + "";
      considerBreak = true;
      var breakString = breakStartTime + "-" + breakEndTime;
      g_form.setValue("break_time", breakString);
    }
    return this.buildTimeSpans(dailyStartTime, dailyEndTime, breakStartTime, breakEndTime, windowDuration, considerBreak);
  },
  isNil: function(value) {
    return (value == "" || value == null || value == undefined || value == "null" || value == "undefined");
  },
  updateTimeSlots: function() {
    var macroElem = $j("#appointmentBookingTimeSlotContainer")[0];
    if (macroElem) {
      macroElem.innerHTML = this.htmlTemplate;
    }
  },
  setHourMin: function(now, hourMin) {
    var arr = hourMin.split(/[-: ]/);
    var hour = Number(arr[0]);
    var min = Number(arr[1]);
    now.setHours(hour);
    now.setMinutes(min);
    now.setSeconds(0);
    return now;
  },
  buildTimeSpans: function(dailyStartTime, dailyEndTime, breakStartTime, breakEndTime, windowDuration, considerBreak) {
    var timeSpans = [],
      now = new Date();
    var CONSTANTS = {};
    CONSTANTS.AVAILABLE = APP_BOOKING_CONSTANTS.MESSAGES.AVAILABLE;
    CONSTANTS.BREAK = APP_BOOKING_CONSTANTS.MESSAGES.BREAK;
    CONSTANTS.INSUFFICIENT_TIME = APP_BOOKING_CONSTANTS.MESSAGES.INSUFFICIENT_TIME;
    CONSTANTS.MAX_MINUTES_IN_A_DAY = 1440;
    var start = this.setHourMin(new Date(), dailyStartTime);
    var end = this.setHourMin(new Date(), dailyEndTime);
    if (start.getTimezoneOffset() != end.getTimezoneOffset()) {
      start.setDate(start.getDate() + 1);
      end.setDate(end.getDate() + 1);
    }
    var currNumVal = start.getTime(),
      dailyEndNumVal = end.getTime();
    var endNumVal = dailyEndNumVal;
    var startTimeStamp = dailyStartTime;
    if (currNumVal >= dailyEndNumVal) {
      console.error("daily start time cannot be on or after daily end time");
      return timeSpans;
    }
    var breakStart = this.setHourMin(new Date(), breakStartTime);
    var breakEnd = this.setHourMin(new Date(), breakEndTime);
    var breakStartNumVal = breakStart.getTime(),
      breakEndNumVal = breakEnd.getTime();
    var breakStartTimeStamp = -1,
      breakEndTimeStamp = -1;
    if (considerBreak)
      considerBreak = this.shouldConsiderBreak(currNumVal, endNumVal, breakStartNumVal, breakEndNumVal);
    if (considerBreak) {
      breakStartTimeStamp = this.getTimestamp(breakStart);
      breakEndTimeStamp = this.getTimestamp(breakEnd);
    }
    if (considerBreak && breakStartNumVal < currNumVal) {
      currNumVal = breakStartNumVal;
      start = breakStart;
      startTimeStamp = this.getTimestamp(breakStart);
    }
    var maxCounter = 0;
    while (currNumVal < dailyEndNumVal || maxCounter > CONSTANTS.MAX_MINUTES_IN_A_DAY) {
      var nextWindow = this.addMinutes(start, parseInt(windowDuration));
      endNumVal = nextWindow.getTime();
      if (endNumVal > dailyEndNumVal)
        break;
      var breakOverlapStartTime = this.doBreakOverlapStartTime(currNumVal, endNumVal, breakStartNumVal, breakEndNumVal);
      var breakOverlapEndTime = this.doBreakOverlapEndTime(currNumVal, endNumVal, breakStartNumVal, breakEndNumVal);
      if (considerBreak && (breakOverlapStartTime || breakOverlapEndTime)) {
        if (breakOverlapEndTime) {
          timeSpans.push(this.getWindowSpan(startTimeStamp, breakStartTimeStamp, false, CONSTANTS.INSUFFICIENT_TIME));
        }
        timeSpans.push(this.getWindowSpan(breakStartTimeStamp, breakEndTimeStamp, false, CONSTANTS.BREAK));
        currNumVal = breakEnd.getTime();
        start = breakEnd;
        startTimeStamp = breakEndTimeStamp;
      } else {
        var endTimeStamp = this.getTimestamp(nextWindow);
        timeSpans.push(this.getWindowSpan(startTimeStamp, endTimeStamp, true, CONSTANTS.AVAILABLE));
        startTimeStamp = endTimeStamp;
        start = nextWindow;
        currNumVal = start.getTime();
      }
      maxCounter++;
    }
    return timeSpans;
  },
  getWindowSpan: function(start, end, available, reason) {
    var windowSpan = {};
    windowSpan.start = start;
    windowSpan.end = end;
    windowSpan.window = start + "-" + end;
    windowSpan.available = available;
    windowSpan.reason = reason;
    return windowSpan;
  },
  shouldConsiderBreak: function(windowStart, windowEnd, breakStart, breakEnd) {
    var considerBreak = false;
    if (!breakStart || !breakEnd || breakStart == breakEnd)
      return false;
    if (breakStart > breakEnd) {
      return false;
    }
    if (breakStart < windowStart && breakEnd <= windowStart) {
      return false;
    }
    if (breakStart >= windowEnd && breakEnd > windowEnd) {
      return false;
    }
    return true;
  },
  doBreakOverlapStartTime: function(windowStart, windowEnd, breakStart, breakEnd) {
    return (breakStart <= windowStart && breakEnd > windowStart);
  },
  doBreakOverlapEndTime: function(windowStart, windowEnd, breakStart, breakEnd) {
    return (breakStart > windowStart && breakStart < windowEnd);
  },
  dateTimeInyyyymmdd: function(dt, time) {
    var dateVal = this._getDateInyyyymmdd(dt);
    var dateTimeVal = dateVal + " " + time;
    return dateTimeVal;
  },
  _getDateInyyyymmdd: function(dateVal) {
    if (dateVal) {
      var d = new Date(dateVal),
        month = '' + (d.getMonth() + 1),
        day = '' +
        d.getDate(),
        year = d.getFullYear();
      if (month.length < 2)
        month = '0' + month;
      if (day.length < 2)
        day = '0' + day;
      return [year, month, day].join('-');
    }
    return null;
  },
  addMinutes: function(dt, minutes) {
    return new Date(dt.getTime() + minutes * 60000);
  },
  getTimestamp: function(dt) {
    if (dt && dt instanceof Date) {
      var hours = dt.getHours(),
        minutes = dt.getMinutes(),
        seconds = dt
        .getSeconds();
      if (hours < 10) {
        hours = "0" + hours;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      return hours + ":" + minutes;
    }
    return null;
  },
  hideBreakTime: function() {
    document.getElementById("break-container").style.visibility = "hidden";
  },
  showBreakTime: function() {
    document.getElementById("break-container").style.visibility = "visible";
  },
  setBreakStart: function(startTime) {
    document.getElementById("break-start").value = startTime;
  },
  setBreakEnd: function(endTime) {
    document.getElementById("break-end").value = endTime;
  }
};
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
/*! RESOURCE: EvtMgmtPriorityOverride */
function normalizePriority(columnName) {
  var regexComma = /,/g;
  var index = getIndexByColumn(columnName);
  jQuery("tbody.list2_body tr.list_row:not([smart-priority-override])").each(function() {
    var row = jQuery(this);
    var cell = jQuery(row.find("td:not(.list_decoration_cell)")[index]);
    var value = cell.text();
    if (!value)
      return;
    value = value.replace(regexComma, "");
    if (isNaN(value))
      return;
    var priority = parseInt(parseInt(value) / 1000);
    cell.text(priority);
    row.attr("smart-priority-override", "true");
  });
}

function getIndexByColumn(name) {
  var index = -1;
  jQuery("thead th.list_header_cell").each(function(idx) {
    var curr = jQuery(this);
    if (curr.attr('name') === name) {
      if (index == -1) {
        index = idx;
      }
    }
  });
  return index;
}
/*! RESOURCE: PmClientDateAndDurationHandler */
var PmClientDateAndDurationHandler = Class.create();
PmClientDateAndDurationHandler.prototype = {
  initialize: function(_gForm) {
    this._gForm = _gForm;
    this.invokeForScheduleDateFormat = false;
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
  setStateonActualDateChange: function() {
    var ga = new GlideAjax('AjaxProjectTaskUtil');
    ga.addParam('sysparm_name', 'getStateForActualDates');
    ga.addParam('sysparm_sys_id', this._gForm.getUniqueValue());
    ga.addParam('sysparm_work_start_date', this._gForm.hasField('work_start') ? this._gForm.getValue('work_start') : g_scratchpad.actualStartDate);
    ga.addParam('sysparm_work_end_date', this._gForm.hasField('work_end') ? this._gForm.getValue('work_end') : g_scratchpad.actualEndDate);
    ga.addParam('sysparm_state', this._gForm.hasField('state') ? this._gForm.getValue('state') : g_scratchpad.state);
    ga.getXML(this.callbackForStateUpdate.bind(this));
  },
  setStateonPercentChange: function() {
    var ga = new GlideAjax('AjaxProjectTaskUtil');
    ga.addParam('sysparm_name', 'getStateForPercentComplete');
    ga.addParam('sysparm_sys_id', this._gForm.getUniqueValue());
    ga.addParam('sysparm_percent', this._gForm.hasField('percent_complete') ? this._gForm.getValue('percent_complete') : g_scratchpad.percentComplete);
    ga.addParam('sysparm_state', this._gForm.hasField('state') ? this._gForm.getValue('state') : g_scratchpad.state);
    ga.getXML(this.callbackForStateUpdate.bind(this));
  },
  callbackForStateUpdate: function(response) {
    var result = response.responseXML.getElementsByTagName("result");
    result = result[0];
    if (this._gForm.hasField('state')) {
      if (this._gForm.getValue('state') != result.getAttribute("state"))
        this._gForm.setValue('state', result.getAttribute("state"));
    } else {
      if (g_scratchpad.state != result.getAttribute("state")) {
        g_scratchpad.state = result.getAttribute("state");
        this.setActualDateonStateChange();
      }
    }
    this._gForm.setReadOnly('percent_complete', (result.getAttribute("isStateInactive") == 'true') ? true : false);
  },
  setActualDateonStateChange: function() {
    var ga = new GlideAjax('AjaxProjectTaskUtil');
    ga.addParam('sysparm_name', 'getActualDates');
    ga.addParam('sysparm_sys_id', this._gForm.getUniqueValue());
    ga.addParam('sysparm_start_date', this._gForm.hasField('start_date') ? this._gForm.getValue('start_date') : g_scratchpad.plannedStartDate);
    ga.addParam('sysparm_end_date', this._gForm.hasField('end_date') ? this._gForm.getValue('end_date') : g_scratchpad.plannedEndDate);
    ga.addParam('sysparm_work_start_date', this._gForm.hasField('work_start') ? this._gForm.getValue('work_start') : g_scratchpad.actualStartDate);
    ga.addParam('sysparm_work_end_date', this._gForm.hasField('work_end') ? this._gForm.getValue('work_end') : g_scratchpad.actualEndDate);
    ga.addParam('sysparm_duration', this._gForm.hasField('duration') ? this._gForm.getValue('duration') : g_scratchpad.plannedDuration);
    ga.addParam('sysparm_work_duration', '');
    ga.addParam('sysparm_outside_Schedule', this._gForm.hasField('allow_dates_outside_schedule') ? this._gForm.getValue('allow_dates_outside_schedule') : g_scratchpad.allowDatesOutsideSchedule);
    ga.addParam('sysparm_state', this._gForm.hasField('state') ? this._gForm.getValue('state') : g_scratchpad.state);
    ga.addParam('sysparm_percent', this._gForm.hasField('percent_complete') ? this._gForm.getValue('percent_complete') : g_scratchpad.percentComplete);
    ga.getXML(this.callbackForStateChange.bind(this));
  },
  callbackForStateChange: function(response) {
    var result = response.responseXML.getElementsByTagName("result");
    result = result[0];
    if (result.getAttribute("status") == 'success') {
      this.setActualStartDate(result.getAttribute("work_start"));
      this.setActualEndDate(result.getAttribute("work_end"));
      this.setActualDuration(result.getAttribute("work_duration"));
      this.setPercentComplete(result.getAttribute("percent_complete"));
      this._gForm.setReadOnly('percent_complete', (result.getAttribute("isStateInactive") == 'true') ? true : false);
    } else
      this.showErrorMessage('state', result.getAttribute('message'));
  },
  setDurationOnActualEndDateChange: function() {
    var startDate = this._gForm.hasField('work_start') ? this._gForm.getValue('work_start') : g_scratchpad.actualStartDate;
    var endDate = this._gForm.hasField('work_end') ? this._gForm.getValue('work_end') : g_scratchpad.actualEndDate;
    if ((startDate == null || startDate == '') && (endDate == null || endDate == ''))
      this.setActualDuration('');
    else if ((startDate == null || startDate == '') || (endDate == null || endDate == ''))
      return;
    else {
      var ga = new GlideAjax('AjaxProjectTaskUtil');
      ga.addParam('sysparm_name', 'getDuration');
      ga.addParam('sysparm_start_date', startDate);
      ga.addParam('sysparm_end_date', endDate);
      ga.addParam('sysparm_is_off_schedule', this._gForm.hasField('allow_dates_outside_schedule') ? this._gForm.getValue('allow_dates_outside_schedule') : g_scratchpad.allowDatesOutsideSchedule);
      ga.addParam('sysparm_sys_id', this._gForm.getUniqueValue());
      ga.getXML(this.callbackForActualEndDateChange.bind(this));
    }
  },
  callbackForActualEndDateChange: function(response) {
    jslog("Into handleResponse -> " + response);
    if (response && response.responseXML) {
      var result = response.responseXML.getElementsByTagName("result");
      if (result) {
        result = result[0];
        var status = result.getAttribute("status");
        var answer = result.getAttribute("answer");
        var message = result.getAttribute('message');
        if (status == 'error') {
          jslog("Into handleResponse -> Response is INVALID");
          this.showErrorMessage('work_end', message);
        } else {
          jslog("Into handleResponse -> Response is valid");
          this.setActualDuration(answer);
        }
      }
    }
  },
  setEndDateOnStartDateChange: function() {
    if (g_form.getValue('work_start') == '' && g_form.getValue('work_end') == '')
      this.setActualDuration('');
    else if (g_form.getValue('work_start') != '' && (g_form.getValue('work_end') != '' || g_scratchpad.actualEndDate != '')) {
      var startDate = this._gForm.hasField('work_start') ? this._gForm.getValue('work_start') : g_scratchpad.actualStartDate;
      var duration = this._gForm.hasField('work_duration') ? this._gForm.getValue('work_duration') : g_scratchpad.actualDuration;
      if (duration === '')
        return;
      else {
        jslog("Into calculateEndDate -> " + startDate);
        var ga = new GlideAjax('AjaxProjectTaskUtil');
        ga.addParam('sysparm_start_date', startDate);
        ga.addParam('sysparm_name', 'getEndDate');
        ga.addParam('sysparm_duration', duration);
        ga.addParam('sysparm_sys_id', g_scratchpad.projectTaskSysId);
        ga.addParam('sysparm_allow_dates_outside_schedule', this._gForm.hasField('allow_dates_outside_schedule') ? this._gForm.getValue('allow_dates_outside_schedule') : g_scratchpad.allowDatesOutsideSchedule);
        ga.addParam('sysparm_state', this._gForm.hasField('state') ? this._gForm.getValue('state') : g_scratchpad.state);
        ga.getXML(this.callbackForSettingActualEndDate.bind(this));
      }
    }
  },
  callbackForSettingActualEndDate: function(response) {
    jslog("Into handleResponse -> " + response);
    if (response && response.responseXML) {
      var result = response.responseXML.getElementsByTagName("result");
      if (result) {
        result = result[0];
        var status = result.getAttribute("status");
        var column = result.getAttribute("column");
        var answer = result.getAttribute("answer");
        var stateInactiveFlag = result.getAttribute("stateInactiveFlag");
        if (status == 'error') {
          jslog("Into handleResponse -> Response is INVALID");
          this.showErrorMessage(column);
        } else {
          jslog("Into handleResponse -> Response is valid");
          if (stateInactiveFlag == 'true' ||
            (this.invokeForScheduleDateFormat && this.isLaterThanActualStart(answer)))
            this.setActualEndDate(answer);
        }
      }
    }
  },
  setActualStartDate: function(startDate) {
    if (this._gForm.hasField('work_start')) {
      if (this._gForm.getValue('work_start') != startDate) {
        g_scratchpad.actual_field_flag = true;
        this._gForm.setValue('work_start', startDate);
        g_scratchpad.actual_field_flag = false;
      }
    } else
      g_scratchpad.actualStartDate = startDate;
  },
  setActualEndDate: function(endDate) {
    if (this._gForm.hasField('work_end')) {
      if (this._gForm.getValue('work_end') != endDate) {
        g_scratchpad.actual_field_flag = true;
        this._gForm.setValue('work_end', endDate);
        g_scratchpad.actual_field_flag = false;
      }
    } else
      g_scratchpad.actualEndDate = endDate;
  },
  setActualDuration: function(workDuration) {
    if (this._gForm.hasField('work_duration')) {
      if (this._gForm.getValue('work_duration') != workDuration) {
        g_scratchpad.actual_field_flag = true;
        this._gForm.setValue('work_duration', workDuration);
        g_scratchpad.actual_field_flag = false;
      }
    } else
      g_scratchpad.actualDuration = workDuration;
  },
  setPercentComplete: function(percentComplete) {
    if (this._gForm.hasField('percent_complete')) {
      if (this._gForm.getValue('percent_complete') != percentComplete) {
        g_scratchpad.actual_field_flag = true;
        this._gForm.setValue('percent_complete', percentComplete);
        g_scratchpad.actual_field_flag = false;
      }
    } else
      g_scratchpad.percentComplete = percentComplete;
  },
  handleActualStartDateChange: function() {
    var offset = (new Date()).getTimezoneOffset();
    if (this._gForm.hasField('work_start') &&
      (g_scratchpad.projectScheduleFormat == 'date' || g_scratchpad.timeComponentFromPlanned == 'true')) {
      this.replaceTimeComponentFromSourceToTarget(this._gForm.getUniqueValue(),
        'start_date', 'work_start', this._gForm.getValue('start_date'), this._gForm.getValue('work_start'));
    }
  },
  handleActualEndDateChange: function() {
    var offset = (new Date()).getTimezoneOffset();
    if (this._gForm.hasField('work_end') && (g_scratchpad.projectScheduleFormat == 'date' || g_scratchpad.timeComponentFromPlanned == 'true')) {
      this.replaceTimeComponentFromSourceToTarget(this._gForm.getUniqueValue(),
        'end_date', 'work_end', this._gForm.getValue('end_date'), this._gForm.getValue('work_end'));
    }
  },
  replaceTimeComponentFromSourceToTarget: function(taskId, sourceField, targetField, sourceValue, targetValue) {
    this.invokeForScheduleDateFormat = true;
    if (this._gForm.hasField(targetField) && targetValue) {
      jslog("Into replaceTimeComponentFromSourceToTarget -> " + taskId + " | " + targetField);
      var ga = new GlideAjax('AjaxProjectTaskUtil');
      ga.addParam('sysparm_name', 'correctTimeAsPerPlanned');
      ga.addParam('sysparm_sys_id', taskId);
      ga.addParam('sysparm_source_field', sourceField);
      ga.addParam('sysparm_target_field', targetField);
      ga.addParam('sysparm_source_value', sourceValue);
      ga.addParam('sysparm_target_value', targetValue);
      if (targetField == 'work_start')
        ga.getXML(this.callbackForSettingActualStartDate.bind(this));
      else if (targetField == 'work_end')
        ga.getXML(this.callbackForSettingActualEndDate.bind(this));
    }
  },
  callbackForSettingActualStartDate: function(response) {
    jslog("Into callbackForSettingActualStartDate - handleResponse -> " + response);
    if (response && response.responseXML) {
      var result = response.responseXML.getElementsByTagName("result");
      if (result) {
        result = result[0];
        var status = result.getAttribute("status");
        var answer = result.getAttribute("answer");
        var message = result.getAttribute('message');
        if (status == 'error') {
          jslog("Into handleResponse -> Response is INVALID");
          this.showErrorMessage('work_end', message);
        } else {
          jslog("Into handleResponse -> Response is valid");
          this.setActualStartDate(answer);
        }
      }
    }
  },
  isLaterThanActualStart: function(newWorkEnd) {
    jslog("Into isLaterThanActualStart - newWorkEnd -> " + newWorkEnd);
    if (this._gForm.hasField('work_start')) {
      var workStart = new Date(getDateFromFormat(this._gForm.getValue('work_start'), g_user_date_time_format));
      var workEnd = new Date(getDateFromFormat(newWorkEnd, g_user_date_time_format));
      if (workEnd.getTime() >= workStart.getTime())
        return true;
      return false;
    }
  },
  type: 'PmClientDateAndDurationHandler'
};
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