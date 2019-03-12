/*! RESOURCE: /scripts/js_includes_customer.js */
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
/*! RESOURCE: GlobalCatalogItemFunctions */
function getSCAttachmentCount() {
  var length;
  try {
    length = angular.element("#sc_cat_item").scope().attachments.length;
  } catch (e) {
    length = -1;
  }
  return length;
}
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
/*! RESOURCE: ReportingVariablesHack */
var uri = window.location.href;
if (uri.search('sys_report_template.do')) {
  $j(document).ready(function() {
    rh_hideVariableSetButton();
    if ($j("#sysparm_table option:selected").val() == 'sc_req_item')
      rh_showVariableSetButton();
    $j(document).on('change', '#sysparm_table', function() {
      if ($j("#sysparm_table option:selected").val() == 'sc_req_item')
        rh_showVariableSetButton();
      else
        rh_hideVariableSetButton();
    });
  });
}

function rh_showVariableSetButton() {
  $j('.list-button-col').first().append('<div id="reportHackVariableSetOpen"><a onclick="rh_openReportHackVariableSetPicker()">VS</a></div>');
}

function rh_hideVariableSetButton() {
  $j('#reportHackVariableSetOpen').remove();
}

function rh_openReportHackVariableSetPicker() {
  var dialog = new GlideDialogWindow('add_variable_set_variables');
  dialog.setTitle('Select Variable Set to Add Variables');
  dialog.render();
  return false;
}

function rh_setVariableSetOptions(request, args) {
  var prefix = args[0];
  var scItemId = args[1];
  var scItemLabel = args[2] || 'Variable Set';
  var select = $(prefix + 'select_0');
  var option = getSingleSelectedOption(select);
  baseTable = 'sc_req_item';
  baseTableLabel = 'Requested Item';
  select.options.length = 0;
  appendHeaderOption(select, baseTable, baseTableLabel, baseTableLabel + " fields");
  appendHeaderOption(select, baseTable, baseTableLabel, ".Variables-->" + scItemLabel);
  var variables = getScItemVariables(request);
  var selectedOptions = document.getElementById(prefix + 'select_1').options;
  for (var i = 0; i < variables.length; i++) {
    var variableId = variables[i].variableId;
    var questionText = variables[i].questionText;
    if (isNotInSelectedOptions(variableId, selectedOptions))
      appendVariableOption(select, variableId, questionText, scItemLabel);
  }
  return true;
}
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
var appointmentBookingAjax = new GlideAjax('sn_apptmnt_booking.AppointmentBookingAjaxUtil');
appointmentBookingAjax.addParam('sysparm_name', 'getTranslatedMessagesForAppBookingConfig');
appointmentBookingAjax.getXML(processAppBookingTranslationMessagesResponse);

function processAppBookingTranslationMessagesResponse(response) {
  translatedMessages = response.responseXML.documentElement.getAttribute("answer");
  if (translatedMessages) {
    APP_BOOKING_CONSTANTS = JSON.parse(translatedMessages);
  }
};
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
/*! RESOURCE: enableDisableArticleStates */
function disableAllOptions(fieldName) {
  fieldName = g_form.removeCurrentPrefix(fieldName);
  var control = g_form.getControl(fieldName);
  if (control && !control.options) {
    var name = 'sys_select.' + this.tableName + '.' + fieldName;
    control = gel(name);
  }
  if (!control)
    return;
  if (!control.options)
    return;
  var options = control.options;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    control.options[i].disabled = 'true';
    control.options[i].hidden = 'true';
  }
}

function disableOption(fieldName, choiceValue) {
  fieldName = g_form.removeCurrentPrefix(fieldName);
  var control = g_form.getControl(fieldName);
  if (control && !control.options) {
    var name = 'sys_select.' + this.tableName + '.' + fieldName;
    control = gel(name);
  }
  if (!control)
    return;
  if (!control.options)
    return;
  var options = control.options;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (option.value == choiceValue) {
      control.options[i].disabled = 'true';
      control.options[i].hidden = 'true';
      break;
    }
  }
}

function enableOption(fieldName, choiceValue) {
  fieldName = g_form.removeCurrentPrefix(fieldName);
  var control = g_form.getControl(fieldName);
  if (control && !control.options) {
    var name = 'sys_select.' + this.tableName + '.' + fieldName;
    control = gel(name);
  }
  if (!control)
    return;
  if (!control.options)
    return;
  var options = control.options;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (option.value == choiceValue) {
      control.options[i].disabled = '';
      control.options[i].hidden = '';
      break;
    }
  }
}
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