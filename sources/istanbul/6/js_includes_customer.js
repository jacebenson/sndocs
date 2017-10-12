/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: N helper */
var N = {};
N.logs = true;
N.l = function(msg, append) {
  if (!this.logs) {
    return;
  }
  var str = (append) ? append + ": " : this.type + ": ";
  msg = str + msg;
  if (!this.nil(window.console) && !this.nil(window.console.log)) {
    console.log(msg);
  }
  try {
    var path = window.self.location.pathname;
    var src = path.substring(path.lastIndexOf('/') + 1);
    if (window.self.opener && window != window.self.opener) {
      if (window.self.opener.jslog) {
        window.self.opener.jslog(msg, src);
      }
    } else if (parent && parent.jslog && jslog != parent.jslog) {
      parent.jslog(msg, src);
    }
  } catch (e) {}
};
N.nil = function(given) {
  try {
    if (typeof given == 'undefined') {
      return true;
    } else if (given === null || given == '' || given == 0 || given == false) {
      return true;
    }
  } catch (e) {
    return true;
  }
  return false;
};
N.isNil = function(given) {
  return this.nil(given);
};
N.notNil = function(given) {
  return !this.nil(given);
};
N.isNotNil = function(given) {
  return !this.nil(given);
};
N.getRefID = function(table, field, relField, callback) {
  if (arguments.length < 3) {
    this.l("Missing required inputs", "N.getRefID");
    return false;
  }
  var fieldValue = g_form.getValue(field);
  if (this.nil(fieldValue)) {
    fieldValue = field + '';
  }
  if (arguments.length == 3) {
    callback = relField;
    N._ajax('getRefID', table, field, callback);
  } else {
    N._ajax('getRefID', table, field, relField, callback);
  }
};
N.getDuration = function(startField, endField, warn) {
  var startTimeField = startField;
  var endTimeField = endField;
  if (!g_form) {
    return '';
  }
  var endTimeFieldLabel = g_form.getLabel(endTimeField).innerHTML.split(':').join('');
  var startTimeFieldLabel = g_form.getLabel(startTimeField).innerHTML.split(':').join('');
  var msg = 'The ' + endTimeFieldLabel + ' time  cannot be prior to the ' + startTimeFieldLabel + '.';
  var endTime = g_form.getValue(endTimeField);
  var endTimeObj = this.dff(endTime);
  var startTime = g_form.getValue(startTimeField);
  var startTimeObj = this.dff(startTime);
  var diff = endTimeObj - startTimeObj;
  var afterToday = (new Date() - startTimeObj) > 0;
  if (diff <= 0) {
    if (warn && ((endTime && !afterToday) || (startTime && endTime))) {
      g_form.showErrorBox(endTimeField, msg);
      g_form.setValue(endTimeField, '');
    }
    return '';
  }
  var dateDur = new Date(diff);
  var days = dateDur.getUTCDate() - 1;
  var hours = dateDur.getUTCHours();
  var mins = dateDur.getUTCMinutes();
  var secs = dateDur.getUTCSeconds();
  return days + " " + this._two(hours) + ":" + this._two(mins) + ":" + this._two(secs);
};
N.isAfterToday = function(start) {
  return this.isAfterDate(start);
};
N.isBeforeToday = function(start) {
  return !this.isAfterDate(start);
};
N.isAfter = function(start, end) {
  if (this.nil(start)) {
    this.l("N.isAfter called with no start");
    return;
  }
  start = this.dff(start);
  if (this.nil(end)) {
    end = new Date().getTime();
  } else {
    end = this.dff(end);
  }
  if (start < end) {
    return true;
  }
  return false;
};
N.isBefore = function(start, end) {
  return !this.isAfter(start, end);
};
N.isAfterDate = function(start, end) {
  if (this.nil(start)) {
    this.l("N.isAfterDate called with no start");
    return;
  }
  start = this.dff(start, true);
  var startMS = start.setHours(23, 59, 59, 999);
  if (this.nil(end)) {
    end = new Date().getTime();
  } else {
    end = this.dff(end);
  }
  return start < end;
};
N.isBeforeDate = function(start, end) {
  if (this.nil(start)) {
    this.l("N.isAfterDate called with no start");
    return;
  }
  start = this.dff(start);
  if (this.nil(end)) {
    end = new Date().getTime();
  } else {
    end = this.dff(end);
  }
  var endMS = end.setHours(0, 0, 0, 0);
  return start < end;
};
N.dff = function(d, obj) {
  if (this.nil(d)) {
    this.l("N.dff called with no input");
    return;
  }
  if (this.nil(d.getTime)) {
    if (/ /.test(d)) {
      d = getDateFromFormat(d, g_user_date_time_format);
    } else {
      d = getDateFromFormat(d, g_user_date_format);
    }
  }
  return (obj) ? new Date(d) : d + 0;
};
N.showSection = function(sectName, bool) {
  var section = $$('span[tab_caption="' + sectName + '"]')[0].select('span[id*=section.]')[0];
  var sectHead = this._getSectHead(sectName);
  if (bool) {
    sectHead.show();
    section.show();
  } else {
    section.hide();
    sectHead.hide();
  }
};
N.showRelatedPopup = function(refFieldElID, title, table, column, value) {
  var s = (refFieldElID == null) ? '' : refFieldElID.split('.');
  var encQ;
  title = (this.notNil(title)) ? title : "Related records";
  table = (this.notNil(table)) ? table : $('sys_display.' + s.join('.')).readAttribute('data-table') + '';
  if (this.notNil(column) && this.nil(value)) {
    encQ = column + '';
  }
  column = (this.notNil(column)) ? column : s[1] + '';
  value = (this.notNil(value)) ? value : g_form.getValue(s[1]);
  var referenceField = s[1] + '';
  var v = g_form.getValue(referenceField);
  var w = new GlideDialogWindow('show_list');
  w.setTitle(title);
  w.setPreference('table', table + '_list');
  if (this.notNil(encQ)) {
    w.setPreference('sysparm_query', encQ);
  } else {
    w.setPreference('sysparm_query', "sys_id!=" + g_form.getUniqueValue() + "^" + column + "=" + value);
  }
  w.render();
};
N.selectRelatedList = function(title, scroll) {
  var rlHeader = this._getRelatedListHeader(title);
  if (rlHeader) {
    rlHeader.click();
    if (this.notNil(scroll)) {
      g_form._scrollToElementTR(rlHeader.up("tr"));
    }
  } else {
    this.l("Couldn't find Related List with title " + title, "N.SelectRelatedList");
  }
};
N.saveOptions = function(fieldName) {
  if (this.nil(g_scratchpad) || this.nil(g_scratchpad[fieldName])) {
    return;
  }
  try {
    var ctrl = $(g_form.getTableName() + '.' + fieldName);
    var opts = ctrl.childElements();
    var optArr = [];
    for (var i = 0; i < opts.length; i++) {
      optArr.push({
        value: opts[i].value + '',
        label: opts[i].innerHTML + ''
      });
    }
    g_scratchpad[fieldName] = optArr;
  } catch (e) {
    this.l("N.saveOptions errored with: " + e, "N.saveOptions");
  }
};
N.restoreOptions = function(fieldName) {
  g_form.clearOptions(fieldName);
  var optArr = g_scratchpad[fieldName];
  try {
    for (var i = 0; i < optArr.length; i++) {
      g_form.addOption(fieldName, optArr[i].value, optArr[i].label);
    }
  } catch (e) {
    jslog('restoreOptions did not have any options to restore');
  }
};
N.getProperty = function(propName, defaultVal) {
  var propVal = N._ajaxWait("getProperty", propName);
  if (this.notNil(propVal)) {
    return propVal;
  }
  if (this.notNil(defaultVal)) {
    return defaultVal;
  }
  return '';
};
N.setStyle = function(fieldName, styleAttr, styleValue) {
  var fldCtrl;
  if (arguments.length < 2) {
    return;
  } else if (arguments.length == 2) {
    styleValue = styleAttr + '';
    styleAttr = 'width';
  }
  try {
    fldCtrl = g_form.getControl(fieldName);
  } catch (e) {
    this.l("N.setStyle failed with: " + e);
  }
  if (this.notNil(fldCtrl)) {
    if (this.notNil(fldCtrl.style)) {
      fldCtrl.style[styleAttr] = styleValue + '';
    }
  }
};
N._getSectHead = function(sectName) {
  var sectNameNBSP = sectName.replace(/ /g, "&nbsp;");
  var tabs = $$('span.tab_caption_text');
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].innerHTML == sectName || tabs[i].innerHTML == sectNameNBSP) {
      return $(tabs[i]).up('h3');
    }
  }
  return;
};
N._getRelatedListHeader = function(title) {
  title = title.toString().toLowerCase();
  var elArr = $$('span.tab_caption_text');
  for (var i = 0; i < elArr.length; i++) {
    var eln = elArr[i].innerHTML.toString().toLowerCase();
    eln = eln.replace(/&nbsp;/gi, " ");
    if (eln.indexOf(title) >= 0) {
      return elArr[i];
    }
  }
  return false;
};
N._ajaxWait = function(funcName) {
  var ga = new GlideAjax('NAjax');
  ga.addParam('sysparm_name', funcName);
  for (var i = 1; i < arguments.length; i++) {
    ga.addParam("sysparm_arg" + i, arguments[i]);
  }
  ga.getXMLWait();
  var ans = ga.getAnswer();
  if (this.nil(ans)) {
    this.l("Response for NAjax call " + funcName + " is nil", "N._ajaxWait");
    return null;
  }
  return ans;
};
N._ajax = function(funcName) {
  var ga = new GlideAjax('NAjax');
  ga.addParam('sysparm_name', funcName);
  for (var i = 1; i < arguments.length - 1; i++) {
    ga.addParam("sysparm_arg" + i, arguments[i]);
  }
  ga.getXMLAnswer(arguments[arguments.length - 1]);
};
N._two = function(x) {
  return ((x > 9) ? "" : "0") + x;
};
N.type = "N Helper - UI Script";
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
/*! RESOURCE: Stop Impersonation button */
addLoadEvent(addUnimpersonateButton);

function addUnimpersonateButton() {
  try {
    if ($('impersonating_toggle_id').value != '') {
      $('impersonate_span').insert({
        after: '<span id="unimpersonate_span"><img onclick="unimpersonateMe();" title="End impersonation" src="images/icons/stop.gifx" style="cursor:pointer;cursor:hand"></img></span>'
      });
    }
  } catch (e) {}
}

function unimpersonateMe() {
  top.location.href = 'ui_page_process.do?sys_id=b071b5dc0a0a0a7900846d21db8e4db6&sys_user=' + $('impersonating_toggle_id').value;
}
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
/*! RESOURCE: Redirect ESS Users to CMS portal */
addLoadEvent(function() {
  try {
    if (g_user.hasRole("admin") || g_user.hasRole("itil") || g_user.hasRole("ui_access") || document.URL.indexOf('reset_password') >= 0) {} else if (!g_user.hasRoles() && document.URL.indexOf('ess') == -1) {
      top.window.location = '/ess_portal/home.do';
    } else if (g_user.hasRoles() && document.URL.indexOf('ess') == -1 && top.document.referrer.indexOf('ess') == -1) {
      top.window.location = '/ess_portal/home.do';
    }
  } catch (err) {}
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