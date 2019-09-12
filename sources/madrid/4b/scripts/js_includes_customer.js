/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: BookingClient */
var BookingClient = (function() {
  var populatingDate, previousTime;

  function parseNewLineCommas(str) {
    var ret = [];
    var items = str.split('\n');
    var len = items.length;
    var displayAndValue;
    for (var i = 0; i < len; i += 1) {
      displayAndValue = items[i].split(',');
      if (displayAndValue.length == 2) {
        ret[i] = {
          display: displayAndValue[0],
          value: displayAndValue[1]
        };
      }
    }
    return ret;
  }

  function checkForValue(arr, value) {
    for (var i = 0; i < arr.length; i += 1) {
      if (arr[i].value == value) {
        return true;
      }
    }
    return false
  }

  function populateChoiceList(choiceField, data, existingValue, addNone) {
    if (addNone) {
      g_form.addOption(choiceField, '', '-- None --');
    }
    var len = data.length;
    var foundExisting = false;
    for (var i = 0; i < len; i += 1) {
      if (existingValue && data[i].value == existingValue) {
        foundExisting = i;
      }
      g_form.addOption(choiceField, data[i].value, data[i].display);
    }
    if (foundExisting !== false && existingValue) {
      g_form.setValue(choiceField, existingValue);
    }
  }

  function populateField(typeField, dateField, timeField, populateDate, existingValue, date, addNone, options) {
    options = options ? options : {};
    var type = g_form.getValue(typeField);
    if (type && (populateDate || (date && date != 'undefined'))) {
      var ga = new GlideAjax('BookingDates');
      g_form.clearOptions(timeField);
      ga.addParam('sysparm_type', type);
      if (populateDate) {
        g_form.clearOptions(dateField);
      } else {
        ga.addParam('sysparm_date', date);
      }
      if (!g_form.isNewRecord()) {
        ga.addParam('sysparm_current_record', g_form.getUniqueValue());
      }
      ga.addParam('sysparm_name', populateDate ? 'csGetDates' : 'csGetTimes');
      var parseAnswer = function(answer) {
        if (answer) {
          var data = parseNewLineCommas(answer);
          populateChoiceList(populateDate ? dateField : timeField, data, existingValue, addNone);
          if (populateDate) {
            populatingDate = false;
            if (g_form.getValue(timeField) == '') {
              var formDate = g_form.getValue(dateField);
              populateField(typeField, dateField, timeField, false, previousTime, formDate);
            }
          }
        } else {
          jslog('BookingClient no answer from server for type ' + type + ' form date ' + formDate + ' populate date is ' + populateDate +
            ' existing value ' + existingValue + ' specified date ' + date + ' date is ' + !!date);
        }
      }
      ga.getXMLAnswer(parseAnswer);
    } else {
      jslog('BookingClient type not set');
    }
  }
  return {
    populateDate: function(typeField, dateField, timeField, existingValue, addNone) {
      jslog('BookingClient Setting up date field');
      previousTime = g_form.getValue(timeField);
      populatingDate = true;
      populateField(typeField, dateField, timeField, true, existingValue, null, addNone);
    },
    populateTime: function(typeField, dateField, timeField, existingValue, date) {
      if (!populatingDate) {
        populateField(typeField, dateField, timeField, false, existingValue, date);
      }
    },
    clearDate: function(dateField) {
      g_form.clearOptions(dateField);
      g_form.setValue(dateField, '');
    },
    checkForSubmission: function(typeField, dateField, timeField, reservationField) {
      var type = g_form.getValue(typeField);
      if (type == '' || type == 'undefined') {
        return false;
      }
      var date = g_form.getValue(dateField);
      var time = g_form.getValue(timeField);
      var ga = new GlideAjax('BookingDates');
      ga.addParam('sysparm_date', date);
      ga.addParam('sysparm_time', time);
      ga.addParam('sysparm_type', type);
      if (!g_form.isNewRecord()) {
        ga.addParam('sysparm_current_record', g_form.getUniqueValue());
      }
      ga.addParam('sysparm_name', 'csReserveBooking');
      ga.getXMLWait();
      var answer = ga.getAnswer();
      jslog('checkForSubmission date ' + date + ' time ' + time + ' type ' + type + ' result ' + answer);
      if (!answer || answer == '') {
        return 'UNAVAILABLE: This date has now been booked, please choose another booking time.';
      } else {
        if (answer.length == 32) {
          g_form.setValue(reservationField, answer);
        }
      }
    }
  }
}());
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
/*! RESOURCE: removeLinks */
function removeLinks(snippet) {
  var refs = document.getElementsByTagName("a");
  if (refs) {
    for (i = 0; i < refs.length; i++) {
      ref = refs[i];
      var inner = ref.innerHTML;
      if (inner.indexOf(snippet) > 0) {
        ref.style.display = "none";
      }
    }
  }
}

function uiInputRemoveIconsBtn(iconName) {
  $$('a.btn-ref.icon.' + iconName).each(function(elem) {
    $(elem).hide();
  });
}

function removeInputGroupBtnSections(searchFlag, infoFlag) {
  if (searchFlag) {
    $$('span.icon.icon-search').each(function(elem) {
      $(elem).parentNode.setStyle({
        'visibility': 'hidden'
      });
    });
  }
  if (infoFlag) {
    $$('a.icon.icon-info').each(function(elem) {
      $(elem.hide());
    });
  }
}
/*! RESOURCE: uow - get date from string */
function getDate(dateStr) {
  return new Date(getDateFromFormat(dateStr, "dd/MM/yyyy HH:mm:ss"));
}

function getDateYearFirst(dateStr) {
  return new Date(getDateFromFormat(dateStr, "yyyy-MM-dd HH:mm:ss"));
}
/*! RESOURCE: uow - validate start & end diff */
function checkDateDiff(start_date, end_date) {
  var startDate = getDate(start_date);
  var endDate = getDate(end_date);
  var diff = daysDifference(startDate, endDate);
  if (diff > 7) {
    return false;
  }
  return true;
}

function checkRecordingLength(start_date, end_date) {
  var startDate = getDate(start_date);
  var endDate = getDate(end_date);
  var diff = hoursDifference(startDate, endDate);
  if (diff > 4) {
    return false;
  }
  return true;
}

function checkMonthApart(start_date, end_date) {
  var startdate = new Array();
  var enddate = new Array();
  var splittime = new Array();
  splittime = start_date.split(" ");
  var splittime2 = new Array();
  splittime2 = end_date.split(" ");
  startdate = splittime[0].split("/");
  enddate = splittime2[0].split("/");
  var year = startdate[2];
  var year2 = enddate[2];
  var month = startdate[1];
  var month2 = enddate[1];
  var day = startdate[0];
  var day2 = enddate[0];
  var monthchk;
  if (year2 > year) {
    if (month != 12 && month2 != 1) {
      return "Dates must be no more than a month apart";
    } else {
      if (day2 > day) {
        return "Dates must be no more than a month apart";
      }
    }
  } else {
    if (year2 == year) {
      monthchk = parseFloat(month);
      monthchk = monthchk + 1;
      if (monthchk < month2) {
        return "Dates must be no more than a month apart";
      }
      if (monthchk == month2) {
        if (day2 > day) {
          return "Dates must be no more than a month apart";
        }
      }
    }
  }
  return "";
}

function daysDifference(d1, d2) {
  var day = 1000 * 60 * 60 * 24;
  var diff = Math.ceil((d2.getTime() - d1.getTime()) / (day));
  return diff - 1;
}

function hoursDifference(d1, d2) {
  var hour = 1000 * 60 * 60;
  var diff = Math.ceil((d2.getTime() - d1.getTime()) / (hour));
  return diff - 1;
}
/*! RESOURCE: TU Remove buttons on buttom of form */
addLateLoadEvent(function() {
  try {
    if (($("sysparm_nameofstack").value == "formDialog") && ($("section_form_id").value == "sys_template.do")) {
      return;
    }
    jslog("RUNNING REMOVE LOWER BUTTONS FUNCTION");
    $$('BUTTON:not([class~=header]).form_action_button').each(function(elem) {
      $(elem).hide();
    });
  } catch (e) {
    jslog(e);
  }
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
/*! RESOURCE: uow - validate start & end dates */
function checkDates(start_date, end_date) {
  var startDate = getDate(start_date);
  var endDate = getDate(end_date);
  if (endDate <= startDate) {
    return false;
  }
  return true;
}
/*! RESOURCE: uow - printer wizard valid */
function getClick(staff, mac, wireless) {
  if (staff == "How do I get a printer removed and disposed?") {
    return "document.location.href='com.glideapp.servicecatalog_cat_item_view.do?sysparm_id=243fc0c2f53b10007a7ec8c2586dbb29';";
  } else if (staff == "--None Selected--" && mac == "--None Selected--" && wireless == "--None Selected--") {
    return "alert('Please select an item from one of the drop down lists provided');";
  } else {
    return "g_expert.next();";
  }
}
/*! RESOURCE: Detect User Type */
try {
  var path = window.location.pathname + '';
  var parentPath = window.parent.location.pathname + '';
  var prefix = "** - ";
  var log = [];
  log.push(prefix + "****PB**** Detect user Type UI Script Running: " + path);
  log.push(prefix + "(window.name != 'lookup'): " + (window.name != 'lookup'));
  log.push(prefix + "(window.name != 'dialog_frame'): " + (window.name != 'dialog_frame'));
  log.push(prefix + "(parentPath.indexOf('/ess/') != 0): " + (parentPath.indexOf('/ess/') != 0));
  log.push(prefix + "(parentPath.indexOf('/training/') != 0): " + (parentPath.indexOf('/training/') != 0));
  log.push(prefix + "(path != '/welcome.do'): " + (path != '/welcome.do'));
  log.push(prefix + "(path != '/navpage.do'): " + (path != '/navpage.do'));
  log.push(prefix + "(path != '/logout_redirect.do'): " + (path != '/navpage.do'));
  log.push(prefix + "(path.indexOf('/ess/') != 0): " + (path.indexOf('/ess/') != 0));
  log.push(prefix + "(path.indexOf('/training/') != 0): " + (path.indexOf('/training/') != 0));
  var windowChecks = (window.name != 'lookup' && window.name != 'dialog_frame') && (parentPath.indexOf('/ess/') != 0) && (parentPath.indexOf('/training/') != 0);
  log.push(prefix + "(windowChecks variable): " + windowChecks);
  gs.info("Detect User Type UI Script ran.  Here is its log: \n " + log);
  if (windowChecks && (path != '/welcome.do') && (path != '/logout_redirect.do') && (path != '/navpage.do') && (path.indexOf('/ess/') != 0) && (path.indexOf('/training/') != 0)) {
    addLateLoadEvent(function() {
      try {
        if (typeof g_user != 'undefined' && typeof g_user.roles != 'undefined' &&
          typeof g_user.roles.length != 'undefined' && g_user.roles.length === 0) {
          jslog('Detect User Type: original path ' + path);
          path = path.substring(1);
          var newPath = path + window.location.search;
          jslog('newPath: ' + newPath);
          if (newPath) {
            newPath = 'ess/catalog.do?uri=' + encodeURIComponent(newPath);
          } else {
            newPath = 'ess';
          }
          jslog('Detect User Type: Redirecting to ' + newPath);
          window.location = newPath;
        }
      } catch (e) {
        jslog('Detect User Type: Error in late load function');
        jslog(e);
      }
    });
  }
  jslog(log.join("\n"));
} catch (e) {
  jslog('Detect User Type: Error in outer function');
  jslog(e);
}
/*! RESOURCE: GwtDateTimePickerFix */
addLoadEvent(function() {
  if (typeof window.GwtDateTimePicker != 'undefined') {
    window.GwtDateTimePicker.prototype.initialize = function(dateFieldId, dateTimeFormat, includeTime, positionElement, defaultValue) {
      this.dayCells = [];
      this.cleanup = [];
      this._getMessages();
      this.includeTime = includeTime;
      this.firstDay = Math.min(Math.max(g_date_picker_first_day_of_week - 1, 0), 6);
      if (isDoctype()) {
        this.modalParent = $j(positionElement || gel(dateFieldId)).parents('.modal');
        this.isInModal = !!this.modalParent.length;
        if (this.isInModal) {
          this.isInModalForm = !!$j(positionElement || gel(dateFieldId))
            .parents('[id*=".form_scroll"]')
            .parents('.modal').length;
        }
      }
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
      else if (dateField.next() && dateField.next().type && dateField.next().type != 'hidden')
        this._moveToPosition(dateField.next());
      else
        this._moveToPosition(dateField);
      this.setZIndex(10000);
      this.setShim(true);
      this._shimResize();
      this.keyUpFunc = this.onKeyUp.bind(this);
      Event.observe(this.window, "keypress", this.keyUpFunc);
      Event.observe(document, "keypress", this.keyUpFunc);
      Event.observe(window.self, 'beforeunload', this.preventPageLeaveConfirmDialog);
      this.mouseUpFunc = this.onMouseUp.bindAsEventListener(this);
      Event.observe(document, "mouseup", this.mouseUpFunc);
      this.canFocus = true;
      this.focusEditor();
    };
  }
});
/*! RESOURCE: uowFunctions */
var uowFunctions = {
  getUserInfo: function(param, value, fntn) {
    var ga = new GlideAjax('userRecord');
    ga.addParam('sysparm_name', 'getUserInfo');
    ga.addParam(param, value);
    ga.getXMLAnswer(function(answer) {
      if (answer != '') {
        try {
          var userObject = JSON.parse(answer);
          fntn(userObject);
        } catch (err) {
          jslog('ERROR: uowFunctions.getUserInfo JSON parse error');
        }
      }
    });
  },
  getUserInfoAndSetValues: function(param, value, valueSet, callback) {
    var ga = new GlideAjax('UserInformation');
    ga.addParam('sysparm_name', 'getUserInformation');
    ga.addParam(param, value);
    ga.getXMLAnswer(function(answer) {
      if (answer != '') {
        jslog('uowFunctions.getUserInfoAndSetValues: ' + answer);
        var userObject = {};
        try {
          userObject = JSON.parse(answer);
        } catch (err) {
          jslog('ERROR: uowFunctions.getUserInfo JSON parse error');
        }
        if (userObject) {
          var item;
          for (var elem in valueSet) {
            if (valueSet.hasOwnProperty(elem)) {
              item = valueSet[elem];
              if (userObject.hasOwnProperty(item) && userObject[item] != '') {
                jslog('uowFunctions.getUserInfoAndSetValues: ' + elem + ' item ' + item + ' value ' + userObject[item]);
                g_form.setValue(elem, userObject[item]);
              }
            }
          }
        }
      }
      if (typeof callback == 'function') {
        callback();
      }
    });
  }
};
/*! RESOURCE: loanScripts */
var loanScripts = (function() {
  jslog('$$$$ loanScripts entered');

  function baseLoanUpdate(tickBoxChosen, equipmentLoanName, equipmentNameFilter, equipmentLoanType, filterObject,
    requestObject, days, enablePickersTestFunction) {
    jslog('$$$$ baseLoanUpdate entered');
    var startdate = new Date();
    startdate = g_form.getValue('start_date');
    var enddate = new Date();
    enddate = g_form.getValue('end_date');
    jslog('$$$$ days : ' + days);
    if (g_form.getValue(tickBoxChosen) == "true") {
      jslog('$$$$ option ticked');
      disableDatePickers();
      amendFilterQuery();
    } else {
      jslog('$$$$ option UNticked');
      findOptionsInSelectedList();
      if (enablePickersTestFunction()) {
        enableDatePickers();
      }
    }

    function findOptionsInSelectedList() {
      jslog('$$$$ findOptionsin sleectedlist entered');
      var sourceOptions = gel(tickBoxChosen + '_lst_select_1').options;
      var selectedIds = [];
      var index = 0;
      for (var i = 0; i < sourceOptions.length; i++) {
        selectedIds[index] = i;
        index++;
      }
      moveSelectedOptions(selectedIds, gel(tickBoxChosen + '_lst_select_1'), gel(tickBoxChosen + '_lst_select_0'), '--None--');
      sortSelect(gel(tickBoxChosen + '_lst_select_0'));
    }

    function removeListCollectorBaseInfo() {
      jslog('$$$$ removeListCollectorBaseInfo entered');
      var object = null;
      var id = tickBoxChosen + '_lstrecordpreview';
      if (document.layers) {
        object = document.layers[id];
      } else if (document.all) {
        object = document.all[id];
      } else if (document.getElementById) {
        object = document.getElementById(id);
      }
      object.style.display = 'none';
    }

    function amendFilterQuery() {
      jslog('$$$$ amendFilterQuery entered');
      var today = new Date();
      var none = '';
      var loansFilter1 = startdate + ', ' + enddate + ', ' + equipmentNameFilter + ', ' + equipmentLoanType + ', ' + days;
      jslog('$$$$ loansFilter1 is : ' + loansFilter1);
      var query = "u_equipment_typeSTARTSWITH" + equipmentLoanName +
        "^sys_idNOT INjavascript:loansFilter('" + startdate + "', '" + enddate +
        "', '" + equipmentNameFilter + "', '" + equipmentLoanType + "', '" + days + "')";
      jslog('$$$$ query is : ' + query);
      filterObject.reset();
      jslog('$$$$ filterObject.reset called');
      filterObject.setQuery(query);
      requestObject(null);
    }

    function disableDatePickers() {
      jslog('$$$$ disableDatePickers entered');
      g_form.setDisabled('start_date', true);
      g_form.setDisabled('end_date', true);
      hideDatePicker(g_form.getControl('start_date'));
      hideDatePicker(g_form.getControl('end_date'));
    }

    function changeDatePickerDisplay(controlElement, display) {
      jslog('$$$$ changeDatePickerDisplay entered');
      var el = controlElement.nextSibling;
      if (el) {
        el = el.nextSibling;
        if (el) {
          el.style.display = display;
        }
      }
    }

    function hideDatePicker(controlElement) {
      changeDatePickerDisplay(controlElement, 'none');
    }

    function showDatePicker(controlElement) {
      changeDatePickerDisplay(controlElement, 'inline');
    }

    function enableDatePickers() {
      g_form.setDisabled('start_date', false);
      g_form.setDisabled('end_date', false);
      showDatePicker(g_form.getControl('start_date'));
      showDatePicker(g_form.getControl('end_date'));
    }
  }
  jslog('$$$$ about to return');
  return {
    pcLoanUpdate: function(tickBoxChosen, equipmentLoanName, equipmentNameFilter, equipmentLoanType, filterObject, requestObject, days) {
      baseLoanUpdate(tickBoxChosen, equipmentLoanName, equipmentNameFilter, equipmentLoanType,
        filterObject, requestObject, days,
        function() {
          return g_form.getValue('ww') == "false";
        });
    },
    laptopLoanUpdate: function(tickBoxChosen, equipmentLoanName, equipmentNameFilter, equipmentLoanType, filterObject, requestObject, days) {
      baseLoanUpdate(tickBoxChosen, equipmentLoanName, equipmentNameFilter, equipmentLoanType,
        filterObject, requestObject, days,
        function() {
          return g_form.getValue('portege') == "false" && g_form.getValue('tecra') == "false" && g_form.getValue('lenovo') == "false" && g_form.getValue('usbmouse') == "false" && g_form.getValue('HP') == "false" && g_form.getValue('Dell') == "false";
        });
    },
    printerLoanUpdate: function(tickBoxChosen, equipmentLoanName, equipmentNameFilter, equipmentLoanType, filterObject, requestObject, days) {
      jslog('$$$$ printerLoanUpdate for ' + tickBoxChosen);
      baseLoanUpdate(tickBoxChosen, equipmentLoanName, equipmentNameFilter, equipmentLoanType,
        filterObject, requestObject, days,
        function() {
          return g_form.getValue('tier1') == "false" && g_form.getValue('tier2') == "false" && g_form.getValue('tier3') == "false";
        });
    },
    test: function() {
      jslog("test!!");
    },
    resetFilterAndRefresh: function(varName, equipmentLoanName, equipmentNameFilter, equipmentLoanType, filterObject, requestObject, days) {
      if (!this.options) {
        this.options = {
          startDateField: 'u_request_start_date',
          endDateField: 'u_request_end_date'
        };
      }
      if (this.options.filterObjectSetQuery) {
        jslog('$$$$ putting filterObject.setQuery back');
        filterObject.setQuery = this.options.filterObjectSetQuery;
      }
      jslog('$$$$ daysBefore & daysAfter : ');
      jslog('$$$$ resetFilterAndRefresh starting');
      if (!this.options.dontHideField) {
        g_form.setDisplay(varName, false);
      }
      g_form.setDisabled('u_request_start_date', true);
      g_form.setDisabled('u_request_end_date', true);
      var startdate = new Date();
      startdate = g_form.getValue(this.options.startDateField);
      var enddate = new Date();
      enddate = g_form.getValue(this.options.endDateField);
      var qry = "u_equipment_typeSTARTSWITH" + equipmentLoanName +
        "^sys_idNOT INjavascript:loansFilter('" + startdate + "', '" + enddate +
        "', '" + equipmentNameFilter + "', '" + equipmentLoanType + "', '" + days + "')";
      jslog('$$$$ resetFilterAndRefresh qry : ' + qry);
      filterObject.reset();
      filterObject.setQuery(qry);
      requestObject(null);
      jslog('$$$$ resetFilterAndRefresh STAGE TWO');
      var object = null;
      var id = varName + '_lstrecordpreview';
      if (document.layers) {
        object = document.layers[id];
      } else if (document.all) {
        object = document.all[id];
      } else if (document.getElementById) {
        object = document.getElementById(id);
      }
      object.style.display = 'none';
      var sourceOptions = gel(varName + '_lst_select_1').options;
      var listOptions = gel(varName + '_lst_select_0').options;
      if (sourceOptions[0].text == "--None--") {
        g_form.setMandatory(varName + '_lst', false);
      }
      var selectedIds = [];
      var index = 0;
      for (var i = 0; i < sourceOptions.length; i++) {
        selectedIds[index] = i;
        index++;
      }
      moveSelectedOptions(selectedIds, gel(varName + '_lst_select_1'), gel(varName + '_lst_select_0'), '--None--');
      sortSelect(gel(varName + '_lst_select_0'));

      function timedRefresh(timeoutPeriod) {
        setTimeout(function() {
          window.location.reload(true);
        }, timeoutPeriod);
      }
      timedRefresh(300000);
    }
  };
}());
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
/*! RESOURCE: uow - validate email address */
function validEmail(address) {
  if (address.length == 0) {
    return true;
  }
  var indx = address.indexOf('@');
  if (indx == -1) {
    return false;
  }
  var domain = address.substring(indx, address.length);
  if (domain.indexOf('.') == -1) {
    return false;
  }
  if (address.endsWith(".")) {
    return false;
  }
  return true;
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
/*! RESOURCE: uow - validate start date */
function checkStartDate(start_date) {
  var startDate = getDate(start_date);
  var now = new Date();
  if (now > startDate) {
    return false;
  }
  return true;
}

function checkStartDateThreeHours(start_date) {
  var startDate = getDate(start_date);
  var threeHours = new Date().addHours(3);
  if (threeHours > startDate) {
    return false;
  }
  return true;
}

function checkStartDateOneDay(start_date) {
  var startDate = getDate(start_date);
  var oneDay = new Date().addHours(24);
  if (oneDay > startDate) {
    return false;
  }
  return true;
}
Date.prototype.addHours = function(h) {
  this.setHours(this.getHours() + h);
  return this;
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
/*! RESOURCE: uow - two dates full validation */
function checkDateDiffSpec(start_date, end_date, timediff) {
  var startDate = getDate(start_date);
  var endDate = getDate(end_date);
  var diff = daysDifference(startDate, endDate);
  if (diff > timediff) {
    if (timediff > 1) {
      return "End date should be no more than " + timediff + " days after start date";
    } else {
      return "End date should be no more than " + timediff + " day after start date";
    }
  }
  return "";
}

function checkDatesSpec(start_date, end_date) {
  var startDate = getDate(start_date);
  var endDate = getDate(end_date);
  if (endDate <= startDate) {
    return "End date should be after start date";
  }
  return "";
}

function checkStartDateSpec(start_date) {
  var startDate = getDate(start_date);
  var now = new Date();
  if (now > startDate) {
    return "Start date should be in the future";
  }
  return "";
}

function checkStartDateNoTime(start_date) {
  var dateArr = new Array();
  dateArr = start_date.split(" ");
  var startDate = dateArr[0];
  return checkStartDay(startDate);
}

function checkECDLHours(start_date) {
  var startdateArr = new Array();
  startdateArr = start_date.split(" ");
  var startTime = startdateArr[1];
  var startTimeArr = new Array();
  startTimeArr = startTime.split(":");
  var startHour = startTimeArr[0];
  var startMin = startTimeArr[1];
  var startSec = startTimeArr[2];
  if (startHour < 9 || startHour > 15) {
    return "The time entered must be between 9am and 3:00pm";
  } else {
    if (startHour == 15) {
      if (startMin > 0) {
        return "The time entered must be between 9am and 3:00pm";
      } else {
        return "";
      }
    } else {
      return "";
    }
  }
}

function checkSetupHours(start_date) {
  var startdateArr = new Array();
  startdateArr = start_date.split(" ");
  var startTime = startdateArr[1];
  var startTimeArr = new Array();
  startTimeArr = startTime.split(":");
  var startHour = startTimeArr[0];
  var startMin = startTimeArr[1];
  var startSec = startTimeArr[2];
  if (startHour < 9 || startHour > 16) {
    return "The time entered must be between 9am and 4:30pm";
  } else {
    if (startHour == 16) {
      if (startMin > 30) {
        return "The time entered must be between 9am and 4:30pm";
      } else {
        return "";
      }
    } else {
      return "";
    }
  }
}

function checkOpenHours(start_date, end_date) {
  var startdateArr = new Array();
  var enddateArr = new Array();
  startdateArr = start_date.split(" ");
  enddateArr = end_date.split(" ");
  var startTime = startdateArr[1];
  var startTimeArr = new Array();
  startTimeArr = startTime.split(":");
  var endTime = enddateArr[1];
  var endTimeArr = new Array();
  endTimeArr = startTime.split(":");
  var startHour = startTimeArr[0];
  var startMin = startTimeArr[1];
  var startSec = startTimeArr[2];
  var endHour = endTimeArr[0];
  var endMin = endTimeArr[1];
  var endSec = endTimeArr[2];
  if (startHour < 9 || startHour > 17 || endHour < 9 || endHour > 17) {
    return "The times entered must be between 9am and 5:30pm";
  } else {
    if (startHour == 17 || endHour == 17) {
      if (startHour == 17) {
        if (startMin > 30) {
          return "The times entered must be between 9am and 5:30pm";
        } else {
          return "";
        }
      }
      if (endHour == 17) {
        if (endMin > 30) {
          return "The times entered must be between 9am and 5:30pm";
        } else {
          return "";
        }
      }
    } else {
      return "";
    }
  }
}

function checkStartDay(start_date) {
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();
  var StartDate = new Array();
  startDate = start_date.split("/");
  var day2 = startDate[0];
  var month2 = startDate[1];
  var year2 = startDate[2];
  month2 = month2 - 1;
  if (day2 == day && month2 == month && year2 == year) {
    return "";
  } else if (year2 < year) {
    return "Start date should be in the future";
  } else {
    if (year == year2) {
      if (month2 < month) {
        return "Start date should be in the future";
      } else {
        if (month2 > month) {
          return "";
        } else {
          if (day2 < day) {
            return "Start date should be in the future";
          } else {
            return "";
          }
        }
      }
    } else {
      if (year2 < year) {
        return "Start date should be in the future";
      } else {
        return "";
      }
    }
  }
}

function checkHoursLength(start_date, end_date, hourapart) {
  var startDate = getDate(start_date);
  var endDate = getDate(end_date);
  var diff = hoursDifference(startDate, endDate);
  if (diff > hourapart) {
    if (hourapart != 1) {
      return "End time should be no more than " + hourapart + " hours after start time";
    } else {
      return "End time should be no more than " + hourapart + " hour after start time";
    }
  }
  return "";
}
/*! RESOURCE: TUclient */
addRenderEventLogged(function() {
  if (parent && parent.document) {
    var el = parent.document.getElementById('update_set_picker');
    var title = parent.document.getElementById('update_set_picker_select_title');
    if (el && el.style.display != 'none') {
      if (el.parentNode.id == 'select_decorations') {
        var dest = parent.document.getElementById('banner_top_right');
        if (dest) {
          dest.insertBefore(el, dest.childNodes[0]);
          if (title && title.style) {
            if (title.style.removeProperty) {
              title.style.removeProperty('color');
            } else if (title.style.color) {
              title.style.color = '';
            }
          }
        }
      }

      function TUupdateSetChecker() {
        el = parent.document.getElementById('update_set_picker_select');
        var ga = new GlideAjax('TUupdateSetChecker');
        ga.addParam('sysparm_selected', el.value);
        ga.addParam('sysparm_name', 'getPickerColour');
        ga.getXMLAnswer(function(answer) {
          jslog('TUupdateSetChecker the answer is ' + answer);
          el.style.background = answer;
          window.setTimeout(TUupdateSetChecker, 60000);
        });
      }
      TUupdateSetChecker();
    }
  }
}, 'TUupdateSetChecker');
var TUclient = {};
TUclient.InfoBoxFromMultiLineText = function(name) {
  var ga = new GlideAjax('VariableIDFromName');
  ga.addParam('sysparm_name', 'getID');
  ga.addParam('sysparm_variable_name', name);
  ga.getXMLAnswer(function(answer) {
    jslog('InfoBoxFromMultiLineText updating ' + name + ' received answer ' + answer);
    var el = gel(answer);
    var defaultValue = el.value + '';
    if (defaultValue.indexOf('<tr') == 0) {
      var id = el.id.toString();
      id = id.substring(id.indexOf('IO:') + 3);
      var parent = el.parentNode;
      if (parent.nodeName != 'TBODY' || parent.nodeName != 'TABLE') {
        parent = el.parentNode;
        if (parent.nodeName != 'TBODY' || parent.nodeName != 'TABLE') {
          parent = parent.parentNode;
          if (parent.nodeName != 'TBODY' || parent.nodeName != 'TABLE') {
            parent = parent.parentNode;
          }
        }
      }
      if (parent.nodeName == 'TBODY' || parent.nodeName == 'TABLE') {
        parent.innerHTML = defaultValue;
        parent.parentNode.id = 'container_' + id;
      }
    } else {
      var div = document.createElement('div');
      div.innerHTML = defaultValue;
      el.style.display = 'none';
      el.parentNode.appendChild(div);
    }
  });
};
TUclient.checkEndDate = function(start, end, failFntn, succFntn, options) {
  if (typeof succFntn !== 'function' && typeof succFntn === 'object') {
    options = succFntn;
    succFntn = false;
  }
  options = options ? options : {};
  var gaCheck = new GlideAjax('TUserver');
  gaCheck.addParam('sysparm_name', 'csCheckDate');
  gaCheck.addParam('start', start);
  gaCheck.addParam('end', end);
  if (options.days) {
    gaCheck.addParam('days', options.days);
  }
  if (options.hours) {
    gaCheck.addParam('hours', options.hours);
  }
  if (options.defaultSchedule) {
    gaCheck.addParam('defaultSchedule', 'y');
  }
  if (options.schedule) {
    gaCheck.addParam('schedule', options.schedule);
  }

  function processResult(answer) {
    jslog('tuClient.checkEndDate answer ' + answer);
    if (answer == '-1' && typeof failFntn === 'function') {
      return failFntn();
    }
    if (answer == '1' && typeof succFntn === 'function') {
      return succFntn();
    }
    if (answer == '0') {
      if (options.equalFntn && typeof options.equalFntn === 'function') {
        return options.equalFntn();
      } else {
        if (typeof failFntn === 'function') {
          return failFntn();
        }
      }
    }
  }
  if (options.sync) {
    gaCheck.getXMLWait();
    return processResult(gaCheck.getAnswer());
  } else {
    gaCheck.getXMLAnswer(processResult);
  }
};
TUclient.addContribution = function(field, clickFntn, imgSrc, imgTitle, linkName) {
  var img = document.createElement('img');
  img.src = imgSrc;
  img.alt = imgTitle;
  img.title = imgTitle;
  var link = document.createElement('a');
  link.onclick = clickFntn;
  link.name = linkName;
  link.id = linkName;
  link.appendChild(img);
  var fieldEl = document.getElementById(field);
  if (fieldEl) {
    var parent = fieldEl.parentNode;
    if (parent) {
      var found = false;
      for (var i = 0; !found && i < parent.childNodes.length; i += 1) {
        if (TUclient.hasClass(parent.childNodes[i], 'ref_contributions')) {
          found = parent.childNodes[i];
        }
      }
      if (!found) {
        var fullElement = document.getElementById('element.' + field);
        if (fullElement) {
          var addons = fullElement.getElementsByClassName("form-field-addons")[0];
          if (addons) {
            link.className = "btn btn-default btn-ref reference_decoration";
            found = addons;
          } else {
            found = parent;
          }
        }
      }
      found.appendChild(link);
    }
  }
};
TUclient.hasClass = function(el, selector) {
  var className = " " + selector + " ";
  if ((" " + el.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1) {
    return true;
  }
};
/*! RESOURCE: changeDisplayOfCatalogSubCategory */
addLateLoadEvent(function() {
  var labels = document.getElementsByTagName('label');
  var len = labels.length,
    i, label;
  for (i = 0; i < len; i += 1) {
    label = labels[i];
    if (label.textContent.indexOf('Options') > -1) {
      label.style.display = 'none';
      label.parentNode.style.display = 'none';
    }
  }
  var catItemElements = document.getElementsByClassName('sc_category_item');
  len = catItemElements.length;
  if (len > 0) {
    jslog('changeDisplayOfCatalogSubCategory found: ' + len);
    var el, spans;
    spans = document.getElementsByClassName('header_bar_title');
    var categoryID = document.getElementsByName('sysparm_parent')[0].value;
    if (categoryID) {
      var ga = new GlideAjax('CatalogScripts');
      ga.addParam('sysparm_name', 'imageAndDescription');
      ga.addParam('sysparm_categoryid', categoryID);
      jslog('changeDisplayOfCatalogSubCategory asking for description');
      ga.getXMLAnswer(function(answer) {
        jslog('changeDisplayOfCatalogSubCategory got an answer');
        if (answer) {
          div = document.getElementById('category_description');
          if (div) {
            div.innerHTML = answer;
          }
        }
      });
    }
  }
  $j('div[name=checkbox_container_label] legend:first-child').css({
    "font-weight": "bold",
    "border-bottom": "2px solid WhiteSmoke"
  });
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