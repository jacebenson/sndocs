/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: amd.outage.global.functions */
function GetParameters(sQuery) {
  var query_string = {};
  var query = sQuery;
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], pair[1]];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
  return query_string;
}

function ContainValidDates(TaskNumber) {
  var isValid = 0;
  var c_task = new GlideRecord('task');
  if (c_task.get('number', TaskNumber)) {
    var c_outage = new GlideRecord('cmdb_ci_outage');
    c_outage.addQuery('task_number', c_task.sys_id);
    c_outage.addQuery('type', '!=', 'No Outage');
    c_outage.query();
    while (c_outage.next()) {
      if (null2string(c_outage.begin) == '' || null2string(c_outage.end) == '') {
        isValid++;
      }
      if (isValid > 0) {
        break;
      }
    }
  }
  return isValid == 0 ? true : false;
}

function null2string(value) {
  return '' + value;
}

function ReplaceObjectValue(TagName, Name, Value) {
  try {
    var refs = document.getElementsByTagName(TagName.toLowerCase());
    var Color = GetSystemProperty('amd.global.highlight.colorcode');
    if (refs) {
      for (var i = 0; i < refs.length; i++) {
        var ref = refs[i];
        var inner = trim(ref.innerHTML);
        if (inner.indexOf(Name) >= 0) {
          ref.innerHTML = Value;
        }
      }
    }
  } catch (err) {
    alert(err.message);
  }
  return false;
}

function SetHighlightObject(TagName, Value) {
  try {
    var refs = document.getElementsByTagName(TagName.toLowerCase());
    var Color = GetSystemProperty('amd.global.highlight.colorcode');
    if (refs) {
      for (var i = 0; i < refs.length; i++) {
        var ref = refs[i];
        var inner = ref.innerHTML;
        if (inner.indexOf(Value) >= 0) {
          ref.style.backgroundColor = Color;
        }
      }
    }
  } catch (err) {
    alert(err.message);
  }
}

function ShowHideObject(TagName, Value, Action) {
  try {
    var refs = document.getElementsByTagName(TagName.toLowerCase());
    if (refs) {
      for (var i = 0; i < refs.length; i++) {
        var ref = refs[i];
        var inner = ref.innerHTML;
        if (inner.indexOf(Value) >= 0) {
          if (Action == 'Hide') {
            ref.style.display = 'none';
          } else {
            ref.style.display = '';
          }
        }
      }
    }
  } catch (err) {
    alert(err.message);
  }
  return false;
}

function GetSystemProperty(property_name) {
  var ajax = new GlideAjax('amd_outage_functions');
  ajax.addParam('sysparm_name', 'getSystemProperty');
  ajax.addParam('sysparm_sys_property_value', property_name);
  ajax.getXMLWait();
  return ajax.getAnswer();
}

function GetExistingOutagesPerCI(ci, begin, end, type, task) {
  var ajax = new GlideAjax('amd_outage_functions');
  ajax.addParam('sysparm_name', 'getOutageCount');
  ajax.addParam('sysparm_ci', ci);
  ajax.addParam('sysparm_begin', begin);
  ajax.addParam('sysparm_end', end);
  ajax.addParam('sysparm_type', type);
  ajax.addParam('sysparm_task', task);
  ajax.getXMLWait();
  return ajax.getAnswer();
}

function addOutageToTask(outage, task, begin) {
  var ajax = new GlideAjax('amd_outage_functions');
  ajax.addParam('sysparm_name', 'addOutageToTask');
  ajax.addParam('sysparm_outage', outage);
  ajax.addParam('sysparm_task', task);
  ajax.addParam('sysparm_begin', begin);
  ajax.getXMLWait();
  return ajax.getAnswer();
}

function getCurrentTime(sdate) {
  var ajax = new GlideAjax('amd_outage_functions');
  ajax.addParam('sysparm_name', 'getCurrentTime');
  ajax.addParam('sysparm_clientdate', sdate);
  ajax.getXMLWait();
  return ajax.getAnswer();
}

function getOutageRecord(task_number) {
  var ajax = new GlideAjax('amd_outage_functions');
  ajax.addParam('sysparm_name', 'getOutageRecord');
  ajax.addParam('sysparm_tasknumber', task_number);
  ajax.getXMLWait();
  return ajax.getAnswer();
}

function ObjectToString(obj) {
  var str = '';
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str += p + '::' + obj[p] + '\n';
    }
  }
  return str;
}

function ZeroPadding(value) {
  return (value.toString().length == 1) ? '0' + value : value;
}

function trim(stringToTrim) {
  return stringToTrim.replace(/^\s+|\s+$/g, "");
}

function ltrim(stringToTrim) {
  return stringToTrim.replace(/^\s+/, "");
}

function rtrim(stringToTrim) {
  return stringToTrim.replace(/\s+$/, "");
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
/*! RESOURCE: showLoadingDialogWrapper */
function showLoadingDialog(callbackFn) {
  var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
  window.loadingDialog = new dialogClass("dialog_loading", true, 300);
  window.loadingDialog.setPreference('table', 'loading');
  window.loadingDialog._isLoadingDialogRendered = false;
  window.loadingDialog.on('bodyrendered', function() {
    window.loadingDialog._isLoadingDialogRendered = true;
  });
  if (callbackFn)
    window.loadingDialog.on('bodyrendered', callbackFn);
  window.loadingDialog.render();
}

function hideLoadingDialog() {
  if (!window.loadingDialog) {
    jslog('hideLoadingDialog called with no loading dialog on the page');
    return;
  }
  if (!window.loadingDialog._isLoadingDialogRendered) {
    window.loadingDialog.on('bodyrendered', function() {
      window.loadingDialog.destroy();
    });
    return;
  }
  window.loadingDialog.destroy();
}
/*! RESOURCE: Hide streaming errors */
(function() {
  var style = document.createElement("style");
  style.setAttribute("id", "remove_this_override");
  style.innerHTML = "#output_messages {display: none;}";
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(style);
  addLoadEvent(function() {
    try {
      $$(".outputmsg_text").each(function(elem) {
        elem = $(elem);
        if (elem.innerHTML.toLowerCase().startsWith("streaming error")) {
          elem.up().remove();
        }
      });
      $$(".outputmsg_div").each(function(elem) {
        elem = $(elem);
        if (elem.childElements().size() < 1) {
          var closeButton = elem.adjacent("img.outputmsg_close")[0];
          GlideUI.get().clearOutputMessages(closeButton);
        } else {
          var style = document.getElementById("remove_this_override");
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  });
})();
/*! RESOURCE: DisableEnableOptions */
function disableOption(fieldName, choiceValue) {
  fieldName = g_form.removeCurrentPrefix(fieldName);
  var control = g_form.getControl(fieldName);
  if (control && !control.options) {
    var name = "sys_select." + this.tableName + "." + fieldName;
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
      break;
    }
  }
}

function enableOption(fieldName, choiceValue) {
  fieldName = g_form.removeCurrentPrefix(fieldName);
  var control = g_form.getControl(fieldName);
  if (control && !control.options) {
    var name = "sys_select." + this.tableName + "." + fieldName;
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
      break;
    }
  }
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
/*! RESOURCE: amd.global.timezones.functions */
var jstz = (function() {
  var HEMISPHERE_SOUTH = 's',
    get_date_offset = function(date) {
      var offset = -date.getTimezoneOffset();
      return (offset !== null ? offset : 0);
    },
    get_january_offset = function() {
      return get_date_offset(new Date(2010, 0, 1, 0, 0, 0, 0));
    },
    get_june_offset = function() {
      return get_date_offset(new Date(2010, 5, 1, 0, 0, 0, 0));
    },
    date_is_dst = function(date) {
      var base_offset = ((date.getMonth() > 5 ? get_june_offset() :
          get_january_offset())),
        date_offset = get_date_offset(date);
      return (base_offset - date_offset) !== 0;
    },
    lookup_key = function() {
      var january_offset = get_january_offset(),
        june_offset = get_june_offset(),
        diff = get_january_offset() - get_june_offset();
      if (diff < 0) {
        return january_offset + ",1";
      } else if (diff > 0) {
        return june_offset + ",1," + HEMISPHERE_SOUTH;
      }
      return january_offset + ",0";
    },
    determine_timezone = function() {
      var key = lookup_key();
      return new jstz.TimeZone(jstz.olson.timezones[key]);
    };
  return {
    determine_timezone: determine_timezone,
    date_is_dst: date_is_dst
  };
}());
jstz.TimeZone = (function() {
  var timezone_name = null,
    uses_dst = null,
    utc_offset = null,
    name = function() {
      return timezone_name;
    },
    dst = function() {
      return uses_dst;
    },
    offset = function() {
      return utc_offset;
    },
    ambiguity_check = function() {
      var ambiguity_list = jstz.olson.ambiguity_list[timezone_name],
        length = ambiguity_list.length,
        i = 0,
        tz = ambiguity_list[0];
      for (; i < length; i += 1) {
        tz = ambiguity_list[i];
        if (jstz.date_is_dst(jstz.olson.dst_start_dates[tz])) {
          timezone_name = tz;
          return;
        }
      }
    },
    is_ambiguous = function() {
      return typeof(jstz.olson.ambiguity_list[timezone_name]) !== 'undefined';
    },
    Constr = function(tz_info) {
      utc_offset = tz_info[0];
      timezone_name = tz_info[1];
      uses_dst = tz_info[2];
      if (is_ambiguous()) {
        ambiguity_check();
      }
    };
  Constr.prototype = {
    constructor: jstz.TimeZone,
    name: name,
    dst: dst,
    offset: offset
  };
  return Constr;
}());
jstz.olson = {};
jstz.olson.timezones = (function() {
  return {
    '-720,0': ['-12:00', 'Etc/GMT+12', false],
    '-660,0': ['-11:00', 'Pacific/Pago_Pago', false],
    '-600,1': ['-11:00', 'America/Adak', true],
    '-600,0': ['-10:00', 'Pacific/Honolulu', false],
    '-570,0': ['-09:30', 'Pacific/Marquesas', false],
    '-540,0': ['-09:00', 'Pacific/Gambier', false],
    '-540,1': ['-09:00', 'America/Anchorage', true],
    '-480,1': ['-08:00', 'America/Los_Angeles', true],
    '-480,0': ['-08:00', 'Pacific/Pitcairn', false],
    '-420,0': ['-07:00', 'America/Phoenix', false],
    '-420,1': ['-07:00', 'America/Denver', true],
    '-360,0': ['-06:00', 'America/Guatemala', false],
    '-360,1': ['-06:00', 'America/Chicago', true],
    '-360,1,s': ['-06:00', 'Pacific/Easter', true],
    '-300,0': ['-05:00', 'America/Bogota', false],
    '-300,1': ['-05:00', 'America/New_York', true],
    '-270,0': ['-04:30', 'America/Caracas', false],
    '-240,1': ['-04:00', 'America/Halifax', true],
    '-240,0': ['-04:00', 'America/Santo_Domingo', false],
    '-240,1,s': ['-04:00', 'America/Asuncion', true],
    '-210,1': ['-03:30', 'America/St_Johns', true],
    '-180,1': ['-03:00', 'America/Godthab', true],
    '-180,0': ['-03:00', 'America/Argentina/Buenos_Aires', false],
    '-180,1,s': ['-03:00', 'America/Montevideo', true],
    '-120,0': ['-02:00', 'America/Noronha', false],
    '-120,1': ['-02:00', 'Etc/GMT+2', true],
    '-60,1': ['-01:00', 'Atlantic/Azores', true],
    '-60,0': ['-01:00', 'Atlantic/Cape_Verde', false],
    '0,0': ['00:00', 'Etc/UTC', false],
    '0,1': ['00:00', 'Europe/London', true],
    '60,1': ['+01:00', 'Europe/Berlin', true],
    '60,0': ['+01:00', 'Africa/Lagos', false],
    '60,1,s': ['+01:00', 'Africa/Windhoek', true],
    '120,1': ['+02:00', 'Asia/Beirut', true],
    '120,0': ['+02:00', 'Africa/Johannesburg', false],
    '180,1': ['+03:00', 'Europe/Moscow', true],
    '180,0': ['+03:00', 'Asia/Baghdad', false],
    '210,1': ['+03:30', 'Asia/Tehran', true],
    '240,0': ['+04:00', 'Asia/Dubai', false],
    '240,1': ['+04:00', 'Asia/Yerevan', true],
    '270,0': ['+04:30', 'Asia/Kabul', false],
    '300,1': ['+05:00', 'Asia/Yekaterinburg', true],
    '300,0': ['+05:00', 'Asia/Karachi', false],
    '330,0': ['+05:30', 'Asia/Kolkata', false],
    '345,0': ['+05:45', 'Asia/Kathmandu', false],
    '360,0': ['+06:00', 'Asia/Dhaka', false],
    '360,1': ['+06:00', 'Asia/Omsk', true],
    '390,0': ['+06:30', 'Asia/Rangoon', false],
    '420,1': ['+07:00', 'Asia/Krasnoyarsk', true],
    '420,0': ['+07:00', 'Asia/Jakarta', false],
    '480,0': ['+08:00', 'Asia/Shanghai', false],
    '480,1': ['+08:00', 'Asia/Irkutsk', true],
    '525,0': ['+08:45', 'Australia/Eucla', true],
    '525,1,s': ['+08:45', 'Australia/Eucla', true],
    '540,1': ['+09:00', 'Asia/Yakutsk', true],
    '540,0': ['+09:00', 'Asia/Tokyo', false],
    '570,0': ['+09:30', 'Australia/Darwin', false],
    '570,1,s': ['+09:30', 'Australia/Adelaide', true],
    '600,0': ['+10:00', 'Australia/Brisbane', false],
    '600,1': ['+10:00', 'Asia/Vladivostok', true],
    '600,1,s': ['+10:00', 'Australia/Sydney', true],
    '630,1,s': ['+10:30', 'Australia/Lord_Howe', true],
    '660,1': ['+11:00', 'Asia/Kamchatka', true],
    '660,0': ['+11:00', 'Pacific/Noumea', false],
    '690,0': ['+11:30', 'Pacific/Norfolk', false],
    '720,1,s': ['+12:00', 'Pacific/Auckland', true],
    '720,0': ['+12:00', 'Pacific/Tarawa', false],
    '765,1,s': ['+12:45', 'Pacific/Chatham', true],
    '780,0': ['+13:00', 'Pacific/Tongatapu', false],
    '780,1,s': ['+13:00', 'Pacific/Apia', true],
    '840,0': ['+14:00', 'Pacific/Kiritimati', false]
  };
}());
jstz.olson.dst_start_dates = (function() {
  return {
    'America/Denver': new Date(2011, 2, 13, 3, 0, 0, 0),
    'America/Mazatlan': new Date(2011, 3, 3, 3, 0, 0, 0),
    'America/Chicago': new Date(2011, 2, 13, 3, 0, 0, 0),
    'America/Mexico_City': new Date(2011, 3, 3, 3, 0, 0, 0),
    'Atlantic/Stanley': new Date(2011, 8, 4, 7, 0, 0, 0),
    'America/Asuncion': new Date(2011, 9, 2, 3, 0, 0, 0),
    'America/Santiago': new Date(2011, 9, 9, 3, 0, 0, 0),
    'America/Campo_Grande': new Date(2011, 9, 16, 5, 0, 0, 0),
    'America/Montevideo': new Date(2011, 9, 2, 3, 0, 0, 0),
    'America/Sao_Paulo': new Date(2011, 9, 16, 5, 0, 0, 0),
    'America/Los_Angeles': new Date(2011, 2, 13, 8, 0, 0, 0),
    'America/Santa_Isabel': new Date(2011, 3, 5, 8, 0, 0, 0),
    'America/Havana': new Date(2011, 2, 13, 2, 0, 0, 0),
    'America/New_York': new Date(2011, 2, 13, 7, 0, 0, 0),
    'Asia/Gaza': new Date(2011, 2, 26, 23, 0, 0, 0),
    'Asia/Beirut': new Date(2011, 2, 27, 1, 0, 0, 0),
    'Europe/Minsk': new Date(2011, 2, 27, 2, 0, 0, 0),
    'Europe/Helsinki': new Date(2011, 2, 27, 4, 0, 0, 0),
    'Europe/Istanbul': new Date(2011, 2, 28, 5, 0, 0, 0),
    'Asia/Damascus': new Date(2011, 3, 1, 2, 0, 0, 0),
    'Asia/Jerusalem': new Date(2011, 3, 1, 6, 0, 0, 0),
    'Africa/Cairo': new Date(2010, 3, 30, 4, 0, 0, 0),
    'Asia/Yerevan': new Date(2011, 2, 27, 4, 0, 0, 0),
    'Asia/Baku': new Date(2011, 2, 27, 8, 0, 0, 0),
    'Pacific/Auckland': new Date(2011, 8, 26, 7, 0, 0, 0),
    'Pacific/Fiji': new Date(2010, 11, 29, 23, 0, 0, 0),
    'America/Halifax': new Date(2011, 2, 13, 6, 0, 0, 0),
    'America/Goose_Bay': new Date(2011, 2, 13, 2, 1, 0, 0),
    'America/Miquelon': new Date(2011, 2, 13, 5, 0, 0, 0),
    'America/Godthab': new Date(2011, 2, 27, 1, 0, 0, 0)
  };
}());
jstz.olson.ambiguity_list = {
  'America/Denver': ['America/Denver', 'America/Mazatlan'],
  'America/Chicago': ['America/Chicago', 'America/Mexico_City'],
  'America/Asuncion': ['Atlantic/Stanley', 'America/Asuncion', 'America/Santiago', 'America/Campo_Grande'],
  'America/Montevideo': ['America/Montevideo', 'America/Sao_Paulo'],
  'Asia/Beirut': ['Asia/Gaza', 'Asia/Beirut', 'Europe/Minsk', 'Europe/Helsinki', 'Europe/Istanbul', 'Asia/Damascus', 'Asia/Jerusalem', 'Africa/Cairo'],
  'Asia/Yerevan': ['Asia/Yerevan', 'Asia/Baku'],
  'Pacific/Auckland': ['Pacific/Auckland', 'Pacific/Fiji'],
  'America/Los_Angeles': ['America/Los_Angeles', 'America/Santa_Isabel'],
  'America/New_York': ['America/Havana', 'America/New_York'],
  'America/Halifax': ['America/Goose_Bay', 'America/Halifax'],
  'America/Godthab': ['America/Miquelon', 'America/Godthab']
};
/*! RESOURCE: JSON Functions */
var jsonParse = (function() {
  var number = '(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)';
  var oneChar = '(?:[^\\0-\\x08\\x0a-\\x1f\"\\\\]' +
    '|\\\\(?:[\"/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';
  var string = '(?:\"' + oneChar + '*\")';
  var jsonToken = new RegExp(
    '(?:false|true|null|[\\{\\}\\[\\]]' +
    '|' + number +
    '|' + string +
    ')', 'g');
  var escapeSequence = new RegExp('\\\\(?:([^u])|u(.{4}))', 'g');
  var escapes = {
    '"': '"',
    '/': '/',
    '\\': '\\',
    'b': '\b',
    'f': '\f',
    'n': '\n',
    'r': '\r',
    't': '\t'
  };

  function unescapeOne(_, ch, hex) {
    return ch ? escapes[ch] : String.fromCharCode(parseInt(hex, 16));
  }
  var EMPTY_STRING = new String('');
  var SLASH = '\\';
  var firstTokenCtors = {
    '{': Object,
    '[': Array
  };
  var hop = Object.hasOwnProperty;
  return function(json, opt_reviver) {
    var toks = json.match(jsonToken);
    var result;
    var tok = toks[0];
    var topLevelPrimitive = false;
    if ('{' === tok) {
      result = {};
    } else if ('[' === tok) {
      result = [];
    } else {
      result = [];
      topLevelPrimitive = true;
    }
    var key;
    var stack = [result];
    for (var i = 1 - topLevelPrimitive, n = toks.length; i < n; ++i) {
      tok = toks[i];
      var cont;
      switch (tok.charCodeAt(0)) {
        default: cont = stack[0];
        cont[key || cont.length] = +(tok);
        key = void 0;
        break;
        case 0x22:
            tok = tok.substring(1, tok.length - 1);
          if (tok.indexOf(SLASH) !== -1) {
            tok = tok.replace(escapeSequence, unescapeOne);
          }
          cont = stack[0];
          if (!key) {
            if (cont instanceof Array) {
              key = cont.length;
            } else {
              key = tok || EMPTY_STRING;
              break;
            }
          }
          cont[key] = tok;
          key = void 0;
          break;
        case 0x5b:
            cont = stack[0];
          stack.unshift(cont[key || cont.length] = []);
          key = void 0;
          break;
        case 0x5d:
            stack.shift();
          break;
        case 0x66:
            cont = stack[0];
          cont[key || cont.length] = false;
          key = void 0;
          break;
        case 0x6e:
            cont = stack[0];
          cont[key || cont.length] = null;
          key = void 0;
          break;
        case 0x74:
            cont = stack[0];
          cont[key || cont.length] = true;
          key = void 0;
          break;
        case 0x7b:
            cont = stack[0];
          stack.unshift(cont[key || cont.length] = {});
          key = void 0;
          break;
        case 0x7d:
            stack.shift();
          break;
      }
    }
    if (topLevelPrimitive) {
      if (stack.length !== 1) {
        throw new Error();
      }
      result = result[0];
    } else {
      if (stack.length) {
        throw new Error();
      }
    }
    if (opt_reviver) {
      var walk = function(holder, key) {
        var value = holder[key];
        if (value && typeof value === 'object') {
          var toDelete = null;
          for (var k in value) {
            if (hop.call(value, k) && value !== holder) {
              var v = walk(value, k);
              if (v !== void 0) {
                value[k] = v;
              } else {
                if (!toDelete) {
                  toDelete = [];
                }
                toDelete.push(k);
              }
            }
          }
          if (toDelete) {
            for (var i = toDelete.length; --i >= 0;) {
              delete value[toDelete[i]];
            }
          }
        }
        return opt_reviver.call(holder, key, value);
      };
      result = walk({
        '': result
      }, '');
    }
    return result;
  };
})();
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