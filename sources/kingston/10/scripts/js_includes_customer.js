/*! RESOURCE: /scripts/js_includes_customer.js */
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
/*! RESOURCE: Redirect end users to SP */
var ga = new GlideAjax('CheckUserRoleUtil');
ga.addParam('sysparm_name', 'goToSP');
ga.getXML(parseAnswer);

function parseAnswer(response) {
  var answer = response.responseXML.documentElement.getAttribute('answer');
  if (answer == 'true' && top.location.pathname.indexOf('$pwd') == -1)
    top.location.pathname = '/sp';
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
/*! RESOURCE: AppointmentBookingConfigHelper */
var AppointmentBookingConfigHelper = Class.create();
AppointmentBookingConfigHelper.prototype = {
  initialize: function() {
    this.htmlTemplate = '';
    this.CONSTANTS = {};
    this.CONSTANTS.MESSAGES = {};
    this.CONSTANTS.MESSAGES.ERROR = {};
    this.CONSTANTS.MESSAGES.ERROR.ONSUBMIT = new GwtMessage().getMessage("Please fix the following errors before submitting:");
    this.CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE = new GwtMessage().getMessage("Daily start time cannot be after daily end time.");
    this.CONSTANTS.MESSAGES.ERROR.BREAKTIME = new GwtMessage().getMessage("Break start time cannot be after break end time.");
    this.CONSTANTS.MESSAGES.ERROR.DURATION = new GwtMessage().getMessage("Appointment window must be greater than or equal to sum of work and average travel duration");
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
    console.log("AppointmentBookingConfigHelper inside UI script  - initEventHandlers");
    var breakStartElem = $j("#break-start");
    var breakEndElem = $j("#break-end");
    if (breakStartElem && breakEndElem) {
      breakStartElem.change(function() {
        console.log("break-start changed!");
        var configHelper = new AppointmentBookingConfigHelper();
        if (configHelper.validateBreakTimes()) {
          configHelper.refreshTimeSlots();
        }
      });
      breakEndElem.change(function() {
        console.log("break-end changed!");
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
      g_form.showFieldMsg('daily_start_time', this.CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE, 'error');
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
      g_form.showFieldMsg('appointment_duration', this.CONSTANTS.MESSAGES.ERROR.DURATION, 'error');
      return false;
    }
    return true;
  },
  validateOnSubmit: function() {
    var shouldSubmit = true;
    g_form.clearMessages();
    if (!this.validateDailySchedule()) {
      g_form.addErrorMessage(this.CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
      g_form.addErrorMessage(this.CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE);
      shouldSubmit = false;
    }
    if (!this.validateBreakTimes()) {
      if (shouldSubmit)
        g_form.addErrorMessage(this.CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
      g_form.addErrorMessage(this.CONSTANTS.MESSAGES.ERROR.BREAKTIME);
      shouldSubmit = false;
    }
    if (!this.validateDurations()) {
      if (shouldSubmit)
        g_form.addErrorMessage(this.CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
      g_form.addErrorMessage(this.CONSTANTS.MESSAGES.ERROR.DURATION);
      shouldSubmit = false;
    }
    return shouldSubmit;
  },
  compareTime: function(start, end) {
    if (start && end) {
      var startComponentsArr = start.split(":");
      var endComponentsArr = end.split(":");
      var len = Math.min(startComponentsArr.length, endComponentsArr.length)
      var startNumeric = 0;
      var endNumeric = 0;
      try {
        for (var i = len - 1; i >= 0; i--) {
          startNumeric = startNumeric / 60.0 + parseInt(startComponentsArr[i]);
          endNumeric = endNumeric / 60.0 + parseInt(endComponentsArr[i]);
        }
        return startNumeric <= endNumeric
      } catch (err) {
        return false;
      }
    }
  },
  refreshTimeSlots: function() {
    console.log("AppointmentBookingConfigHelper inside UI script  - refreshTimeSlots");
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
    console.log("AppointmentBookingConfigHelper refreshTimeSlots this.htmlTemplate = " + this.htmlTemplate);
    this.setBookableTime(bookableTime.join() + "");
    this.updateTimeSlots();
  },
  processTimeSpans: function() {
    console.log("AppointmentBookingConfigHelper inside processTimeSpans");
    var windowDuration = g_form.getValue("appointment_duration");;
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
    console.log("AppointmentBookingConfigHelper inside buildTimeSpans");
    var timeSpans = [],
      now = new Date();
    var CONSTANTS = {};
    CONSTANTS.AVAILABLE = "available";
    CONSTANTS.BREAK = "break";
    CONSTANTS.INSUFFICIENT_TIME = "insufficient time";
    CONSTANTS.MAX_MINUTES_IN_A_DAY = 1440;
    var start = this.setHourMin(new Date(), dailyStartTime);
    var end = this.setHourMin(new Date(), dailyEndTime);
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
    console.log("breakStartNumVal = " + breakStartNumVal + " | breakEndNumVal = " + breakEndNumVal);
    var breakStartTimeStamp = -1,
      breakEndTimeStamp = -1;
    if (considerBreak)
      considerBreak = this.shouldConsiderBreak(currNumVal, endNumVal, breakStartNumVal, breakEndNumVal);
    console.log("considerBreak = " + considerBreak);
    if (considerBreak) {
      breakStartTimeStamp = this.getTimestamp(breakStart);
      breakEndTimeStamp = this.getTimestamp(breakEnd);
    }
    if (considerBreak && breakStartNumVal < currNumVal) {
      currNumVal = breakStartNumVal;
      start = breakStart;
      startTimeStamp = this.getTimestamp(breakStart);
    }
    console.log("considerBreak = " + considerBreak);
    var maxCounter = 0;
    while (currNumVal < dailyEndNumVal || maxCounter > CONSTANTS.MAX_MINUTES_IN_A_DAY) {
      console.log("currNumVal = " + currNumVal + " | endNumVal = " + endNumVal);
      var nextWindow = this.addMinutes(start, windowDuration);
      console.log("nextWindow = " + nextWindow + " | nextWindow Value = " + nextWindow.getTime());
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
        console.log("endTimeStamp = " + endTimeStamp);
        timeSpans.push(this.getWindowSpan(startTimeStamp, endTimeStamp, true, CONSTANTS.AVAILABLE));
        startTimeStamp = endTimeStamp;
        start = nextWindow;
        currNumVal = start.getTime();
      }
      maxCounter++;
    }
    console.log("timeSpans = " + JSON.stringify(timeSpans));
    return timeSpans;
    return timeSlots;
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
      console.log("break start time cannot be on or after break end time");
      return false;
    }
    if (breakStart < windowStart && breakEnd <= windowStart) {
      console.log("break is outside of the daily window schedule");
      return false;
    }
    if (breakStart >= windowEnd && breakEnd > windowEnd) {
      console.log("break is outside of the daily window schedule");
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
    console.log("dateVal = " + dateVal);
    var dateTimeVal = dateVal + " " + time;
    console.log("dateTimeVal = " + dateTimeVal);
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