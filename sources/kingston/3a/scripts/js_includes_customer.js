/*! RESOURCE: /scripts/js_includes_customer.js */
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
/*! RESOURCE: ConfigAutoClientScriptHelper */
var ConfigAutoClientScriptHelper = Class.create();
ConfigAutoClientScriptHelper.getQueryVariableFromQuery =
  function(query, variable) {
    return ConfigAutoClientScriptHelper._getQueryVariable(query, variable);
  };
ConfigAutoClientScriptHelper.getQueryVariableFromCurrentLocation =
  function(variable) {
    var query = window.location.search.substring(1);
    return ConfigAutoClientScriptHelper._getQueryVariable(query, variable);
  };
ConfigAutoClientScriptHelper._getQueryVariable =
  function(query, variable) {
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return;
  };
ConfigAutoClientScriptHelper.escapeHTML =
  function(str) {
    return $j("<div/>").text(str).html();
  };
ConfigAutoClientScriptHelper.redirectWithErrorMessage =
  function(base64URL, errorMsg) {
    var url = 'RedirectWithMessage.do?sysparm_base64_url=' + base64URL + '&sysparm_error_msg=' + encodeURIComponent(errorMsg);
    window.location = url;
  };
ConfigAutoClientScriptHelper.redirectWithInfoMessage =
  function(base64URL, infoMsg) {
    var url = 'RedirectWithMessage.do?sysparm_base64_url=' + base64URL + '&sysparm_info_msg=' + encodeURIComponent(infoMsg);
    window.location = url;
  };
/*! RESOURCE: u_addPlaceholderAttribute */
function u_addPlaceholderAttribute(variableName, hint) {
  try {
    var fieldName = g_form.getControl(variableName).name.toString();
    if (Prototype.Browser.IE) {
      fieldName.placeholder = hint;
    } else {
      $(fieldName).writeAttribute('placeholder', hint);
    }
  } catch (err) {}
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
/*! RESOURCE: sndUI16DevPatch */
if (!window.top.hasOwnProperty('sndUI16DevPatch')) {
  jslog('sndUI16DevPatch loading in top window.');
  (function(t) {
    var i;
    t.sndUI16DevPatch = null;
    i = setInterval(function() {
      if (typeof t.jQuery === 'function') {
        t.$j.getScript('/sndUI16DevPatch.jsdbx');
        clearInterval(i);
      }
    }, 500);
  })(window.top);
} else if (window.top.sndUI16DevPatch != null) {} else if (window == window.top) {
  jslog('Running sndUI16DevPatch...');
  (function() {
    var config = {
      navigator_context: {
        active: true,
        hold_key: 'ctrlKey'
      },
      picker_width: {
        active: true,
        max_width: 300,
        min_width: 120,
        load_timeout: 5500
      },
      picker_icon: {
        active: true
      }
    };

    function isUI16() {
      if (!window.top.angular) return false;
      var a = window.top.angular.element('overviewhelp').attr('page-name');
      return a == 'ui16' || a == 'helsinki';
    }

    function navigatorPatch() {
      $j('#gsft_nav').on('contextmenu', function(e) {
        if (e[config.navigator_context.hold_key]) {
          jslog('sndUI16DevPatch opening navigation module');
          e.preventDefault();
          var $el = $j(e.target);
          var target;
          var id = $el.attr('data-id');
          if (!id) {
            return;
          }
          target = $el.hasClass('nav-app') ?
            '/sys_app_application.do' :
            '/sys_app_module.do';
          openLink(target + '?sys_id=' + id);
        }
      });
      jslog('sndUI16DevPatch navigator patch applied');
    }

    function pickerWidthPatch() {
      var max_width = config.picker_width.max_width,
        oobWidth = config.picker_width.min_width,
        pickers = $j('.navpage-pickers .selector.three-controls'),
        navWidth,
        logoWidth,
        floatWidth,
        diff,
        size;
      if (!pickers.length) {
        jslog('sndUI16DevPatch picked width patch failed. No pickers found.');
        return;
      }
      pickers.css('width', '');
      navWidth = $j('header.navpage-header').width();
      logoWidth = $j('div.navbar-header').outerWidth();
      floatWidth = $j('div.navbar-right').outerWidth();
      diff = parseInt(navWidth, 10) - parseInt(logoWidth, 10) - parseInt(floatWidth, 10);
      size = 100 + (diff / pickers.length);
      size = size < oobWidth ? '' : size > max_width ? max_width : size;
      pickers.css('width', size);
      jslog('sndUI16DevPatch picker width patch applied (diff: ' + diff + '; size: ' + size + ')');
    }

    function pickerIconPatch() {
      var pickers;
      pickers = $j('.concourse-update-set-picker span.label-icon');
      if (pickers.length) {
        pickers.on('click', function() {
          var sys_id = $j('#update_set_picker_select').val();
          if (sys_id) {
            sys_id = sys_id.split(':').pop();
            openLink('/sys_update_set.do?sys_id=' + sys_id);
          } else {
            jslog('sndUI16DevPatch icon picker patch unable to find update set picker sys_id.');
          }
        }).css('cursor', 'pointer');
        jslog('sndUI16DevPatch icon picker patch applied to update set picker.');
      } else {
        jslog('sndUI16DevPatch icon picker patch unable to find update set picker.');
      }
      pickers = $j('.concourse-application-picker span.label-icon');
      if (pickers.length) {
        pickers.on('click', function() {
          var sys_id = $j('#application_picker_select').val();
          if (sys_id) {
            sys_id = sys_id.split(':').pop();
            openLink('/sys_scope.do?sys_id=' + sys_id);
          } else {
            jslog('sndUI16DevPatch icon picker patch unable to find application picker sys_id.');
          }
        }).css('cursor', 'pointer');
        jslog('sndUI16DevPatch icon picker patch applied to application picker.');
      } else {
        jslog('sndUI16DevPatch icon picker patch unable to find application picker.');
      }
    }

    function openLink(target) {
      jslog('sndUI16DevPatch opening target: ' + target);
      var frame = $j('#gsft_main');
      if (frame.length) {
        frame[0].src = target;
      } else {
        jslog('> gsftMain frame not found.');
      }
    }

    function patch() {
      var timer;
      if (config.navigator_context.active) {
        navigatorPatch();
      }
      if (config.picker_width.active) {
        timer = setInterval(pickerWidthPatch, 1000);
        setTimeout(function() {
          clearInterval(timer);
        }, config.picker_width.load_timeout);
        angular.element(window).on('resize', pickerWidthPatch);
      }
      if (config.picker_icon.active) {
        pickerIconPatch();
      }
    }
    $j(document).ready(function() {
      try {
        if ((',' + window.NOW.user.roles + ',').indexOf(',admin,') > -1) {
          if (!isUI16()) {
            window.sndUI16DevPatch = false;
            jslog('sndUI16DevPatch ignored. Not UI16.')
          } else {
            patch();
            window.sndUI16DevPatch = true;
          }
        }
      } catch (e) {
        jslog('SND Developer Patch UI16 mod failure: ' + e);
      }
    });
  })();
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

function getHRAttachmentCount() {
  var length;
  try {
    length = angular.element("#hr_case_total_rewards").scope().attachments.length;
  } catch (e) {
    length = -1;
  }
  return length;
}
/*! RESOURCE: CIInNodeGroupAjax */
var CIInNodeGroupAjax = Class.create();
CIInNodeGroupAjax.performValidation =
  function(ciId) {
    var ga = new GlideAjax('ConfigurationAutomationAjax');
    ga.addParam('sysparm_name', 'isCIInNodeGroup');
    ga.addParam('sysparm_ci', ciId);
    ga.getXMLAnswer(CIInNodeGroupAjax.handleNodeGroupResponse);
  };
CIInNodeGroupAjax.formatWarningMessage =
  function(response) {
    var records = response.records;
    if (records.length == 0)
      return message;
    if (response.more_records == 'true')
      records.push(" ...");
    var msgs = new GwtMessage().getMessages(['This computer belongs to a node group.',
      'If the node group is modified then the node definition may be overwritten.',
      'Click \'OK\' to generate a change request anyway.',
      'Node groups which contain this computer: '
    ]);
    var msg = msgs['This computer belongs to a node group.'] + '<br/>' +
      msgs['If the node group is modified then the node definition may be overwritten.'] + '<br/><br/>' +
      msgs['Node groups which contain this computer: '];
    msg += records.join(', ') + '<br/><br/>';
    msg += msgs['Click \'OK\' to generate a change request anyway.'];
    return msg;
  };
CIInNodeGroupAjax.showCIInNodeGroupWarning =
  function(formattedMessage) {
    var dlg = new GlideDialogWindow('glide_confirm_basic');
    var title = new GwtMessage().getMessage('Warning');
    dlg.setTitle(title);
    dlg.setPreference('title', formattedMessage);
    dlg.setPreference('onPromptComplete', function() {
      proceed();
    });
    dlg.render();
  };
CIInNodeGroupAjax.handleNodeGroupResponse =
  function(responseData) {
    var response = responseData.evalJSON();
    if (response.in_group == 'yes') {
      CIInNodeGroupAjax.showCIInNodeGroupWarning(CIInNodeGroupAjax.formatWarningMessage(response));
      return false;
    }
    proceed();
    return true;
  };
/*! RESOURCE: NodeGroupSaveAjax */
var NodeGroupSaveAjax = Class.create({
  save: function() {
    var nodeGroup = g_form.getValue('node_group');
    this.ajaxValidateAndSave(nodeGroup);
  },
  ajaxValidateAndSave: function(nodeGroup) {
    var ga = new GlideAjax('ConfigurationAutomationAjax');
    ga.addParam('sysparm_name', 'validateNodeGroupHasNoCIChanges');
    ga.addParam('sysparm_ng', nodeGroup);
    ga.getXMLAnswer(this.handleResponse);
  },
  handleResponse: function(responseData) {
    var response = responseData.evalJSON();
    if (response.status == 'success')
      g_form.save();
    else {
      g_form.clearMessages();
      g_form.addErrorMessage(response.message);
      g_form.addErrorMessage(NodeGroupSaveAjax.retryMessage);
    }
    return false;
  }
});
NodeGroupSaveAjax.retryMessage = getMessage("Try closing or canceling the ongoing changes, or try again later");
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
              return t