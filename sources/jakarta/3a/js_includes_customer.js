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
/*! RESOURCE: ScrumMoveToProjectHandler */
var ScrumMoveToProjectHandler = Class.create({
  initialize: function(g_list) {
    this.g_list = g_list;
  },
  showDialog: function() {
    if (this.g_list.getChecked() == '') {
      var span = document.createElement('span');
      span.setAttribute('data-type', 'system');
      span.setAttribute('data-text', getMessage('Please select a Story'));
      span.setAttribute('data-duration', '4000');
      span.setAttribute('data-attr-type', 'error');
      var notification = {
        xml: span
      };
      GlideUI.get().fire(new GlideUINotification(notification));
    } else {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this.dlg = new dialogClass("scrum_move_to_project_dialog");
      var titleMsg = getMessage("Assign to project");
      this.dlg.setTitle(titleMsg);
      this.dlg.setPreference('handler', this);
      this.dlg.setPreference('sysparam_reference_table', 'pm_project');
      this.dlg.setPreference('sysparam_query', 'active=true');
      this.dlg.setPreference('sysparam_field_label', getMessage('Project'));
      this.dlg.render();
    }
  },
  onSubmit: function() {
    if (!this.valid()) {
      return false;
    }
    var projectType = this.getValue('project_type_radiobutton');
    var ga;
    var dialogClass;
    if (projectType != 'new') {
      var projectId = this.getValue('pm_project_ref');
      var phaseId = this.getValue('pm_project_phase');
      this.dlg.destroy();
      dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this.wtDlg = new dialogClass('scrum_please_wait');
      this.wtDlg.render();
      ga = new GlideAjax("agile2_AjaxProcessor");
      ga.addParam('sysparm_name', 'addStoriesToProject');
      ga.addParam('sysparm_project', projectId);
      ga.addParam('sysparm_phase', phaseId);
      ga.addParam('sysparm_stories', this.g_list.getChecked());
      ga.getXML(this.callback.bind(this));
      return false;
    } else {
      var projectName = this.getValue('new_project_field');
      var projectStartDate = this.getValue('new_project_start_date');
      this.dlg.destroy();
      dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this.wtDlg = new dialogClass('scrum_please_wait');
      this.wtDlg.render();
      ga = new GlideAjax("agile2_AjaxProcessor");
      ga.addParam('sysparm_name', 'createProjectForStories');
      ga.addParam('sysparm_project', projectName);
      ga.addParam('sysparm_startDate', projectStartDate);
      ga.addParam('sysparm_stories', this.g_list.getChecked());
      ga.getXML(this.callback.bind(this));
      return false;
    }
  },
  onCancel: function() {
    this.dlg.destroy();
    return false;
  },
  getValue: function(fieldId) {
    if (fieldId == 'project_type_radiobutton')
      return $j("input[name='project_type_radiobutton']:checked").val();
    return gel(fieldId).value;
  },
  callback: function(response) {
    this.wtDlg.destroy();
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      var projectId = resp[0].getAttribute("projectId");
      if (projectId) {
        var url = "pm_project.do?sys_id=" + projectId;
        window.location = url;
      } else
        window.location.reload();
    }
  },
  valid: function() {
    var projectType = this.getValue('project_type_radiobutton');
    var errMsg;
    this._hideAllFieldErrors();
    if (projectType != 'new') {
      if (typeof this.getValue('pm_project_ref') == 'undefined' || this.getValue('pm_project_ref').trim() == '') {
        errMsg = getMessage("Select a project");
        this._showFieldError('ref_project_field', errMsg, 'sys_display.pm_project_ref');
        return false;
      } else if (this._isVisible('ref_project_phase') && (typeof this.getValue('pm_project_phase') == 'undefined' || this.getValue('pm_project_phase').trim() == '')) {
        errMsg = getMessage("Select a phase");
        this._showFieldError('ref_project_phase', errMsg, 'ref_project_phase');
        return false;
      } else
        return true;
    } else {
      if (typeof this.getValue('new_project_field') == 'undefined' || this.getValue('new_project_field').trim() == '') {
        errMsg = getMessage("Enter the project name");
        this._showFieldError('ref_new_project_field', errMsg, 'new_project_field');
        return false;
      } else if (typeof this.getValue('new_project_start_date') == 'undefined' || this.getValue('new_project_start_date').trim() == '') {
        errMsg = getMessage("Enter the project start date");
        this._showFieldError('ref_new_project_start_date', errMsg, 'new_project_start_date');
        return false;
      } else
        return true;
    }
  },
  _showFieldError: function(groupId, message, focusField) {
    var $group = $j('#' + groupId);
    var $helpBlock = $group.find('.help-block');
    if (!$group.hasClass('has-error'))
      $group.addClass('has-error');
    if ($helpBlock.css('display') != "inline") {
      $helpBlock.text(message);
      $helpBlock.css('display', 'inline');
    } else
      $helpBlock.css('display', 'none');
    if (focusField) {
      var elem = gel(focusField);
      elem.focus();
    }
  },
  _hideAllFieldErrors: function() {
    var fields = ['ref_project_field', 'ref_new_project_field', 'ref_new_project_start_date'];
    var $group;
    var $helpBlock;
    fields.forEach(function(field) {
      $group = $j('#' + field);
      $helpBlock = $group.find('.help-block');
      $helpBlock.css('display', 'none');
    });
  },
  _isVisible: function(field) {
    return $j('#' + field).is(":visible");
  },
  type: "ScrumMoveToProjectHandler"
});
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
          return gel(inpt