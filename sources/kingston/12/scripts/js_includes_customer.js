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
/*! RESOURCE: snd_ui16_developer_patch */
if (!window.top.hasOwnProperty('snd_ui16_developer_patched')) {
  jslog('snd_ui16_developer_patch loading in top window.');
  (function(t) {
    function fail(jqxhr, settings, e) {
      if (jqxhr.readyState === 0) {
        jslog('snd_ui16_developer_patch unable to load script.');
      } else {
        jslog('snd_ui16_developer_patch script loading error: ' + e.toString());
      }
    }
    var i;
    t.snd_ui16_developer_patched = null;
    i = setInterval(function() {
      var $ = t.jQuery;
      if (typeof $ == 'function') {
        clearInterval(i);
        $.when(
          $.getScript('/snd_ui16_developer_patch_menus.jsdbx').fail(fail),
          $.getScript('/snd_ui16_developer_patch.jsdbx').fail(fail),
          $.Deferred(function(deferred) {
            $(deferred.resolve);
          })
        ).done(function() {
          t.snd_ui16_developer_patch();
        });
      }
    }, 500);
  })(window.top);
} else if (window.top.snd_ui16_developer_patched != null) {} else if (window == window.top) {
  (function($, window) {
    var config = {
      navigator: {
        width: parseInt("", 10) || 285,
      },
      navigator_context: {
        active: "true" == "true",
        hide_pencil: "true" == "true"
      },
      picker_width: {
        active: "true" == "true",
        max_width: parseInt("300", 10) || 300,
        min_width: parseInt("30", 10) || 60,
        load_timeout: parseInt("2000", 10) || 2000,
        max_search_width: parseInt("", 10) || 150
      },
      picker_icon: {
        active: "true" == "true",
        domain_table: "" || "domain"
      },
      profile_menu: {
        active: "true" == "true",
        check_impersonation: "true" == "true",
        link_preferences: "false" == "true"
      },
      dev_studio: {
        allow_multiple: "true" == "true"
      }
    };
    $.fn.snd_ui16dp_menu = (function() {
      var menus = {},
        loaded = false;

      function getMenuPosition($menu, mouse, direction, scrollDir) {
        var win = $(window)[direction](),
          scroll = $(window)[scrollDir](),
          menu = $menu[direction](),
          position = mouse + scroll;
        if (mouse + menu > win && menu < mouse) position -= menu;
        return position;
      }

      function closeAll() {
        for (var id in menus) {
          $(id).hide();
        }
      }
      return function(settings) {
        menus[settings.menu_id] = true;
        if (!loaded) {
          $(document).click(function() {
            closeAll();
          });
          $('iframe').on('load', function() {
            $(this).contents().on('click', function() {
              closeAll();
            });
          });
          loaded = true;
        }
        return this.each(function() {
          $(this).on(settings.event || 'click', settings.selector, function(e) {
            var $menu;
            closeAll();
            if (e.ctrlKey) return;
            $menu = $(settings.menu_id);
            $menu.data("invokedOn", $(e.target))
              .show()
              .css({
                position: "absolute",
                left: getMenuPosition($menu, e.clientX, 'width', 'scrollLeft'),
                top: getMenuPosition($menu, e.clientY, 'height', 'scrollTop')
              })
              .off('click')
              .on('click', 'a', function(e) {
                $menu.hide();
                var $invokedOn = $menu.data("invokedOn");
                var $selectedMenu = $(e.target);
                settings.callback.call(this, $invokedOn, $selectedMenu);
              });
            return false;
          });
        });
      };
    })();

    function minVersion(letter) {
      var tag = 'glide-kingston-10-17-2017__patch12-11-28-2018';
      var tag_word = tag.match(/glide-([^-]+)/);
      var tag_letter = tag_word ? tag_word[1].toString()[0].toUpperCase() : '';
      return letter <= tag_letter;
    }

    function addStyle(css) {
      $(document).ready(function() {
        $('<style type="text/css">\n' + css + '\n</style>').appendTo(document.head);
      });
    }

    function isUI16() {
      if (!window.top.angular) return false;
      var a = window.top.angular.element('overviewhelp').attr('page-name');
      return a == 'ui16' || a == 'helsinki';
    }

    function createContextMenu(id, items) {
      var menu, item, i;
      menu = '<ul id="' + id + '" class="dropdown-menu" role="menu" ' +
        'style="display: none; z-index: 999;">';
      for (i = 0; i < items.length; i++) {
        item = items[i];
        if (item.role && !userHasRole(item.role)) {
          continue;
        }
        if (item.name === '-') {
          menu += '<li class="divider"></li>';
        } else {
          menu += '<li><a href="#" tabindex="-1">' + item.name + '</a></li>';
        }
      }
      menu += '</ul>';
      $('body').append(menu);
    }

    function executeMenuItem(item, options) {
      var target = item.target,
        url = item.url,
        fn = item.fn;
      if (item.name == 'Refresh') {
        refreshPickers();
        return;
      }
      if (fn && typeof fn == 'function') {
        fn.call(window, options, config);
      }
      if (url) {
        if (typeof url == 'function') {
          url = url.call(window, options, config);
        }
        url += '';
        if (!url) {
          jslog('No URL to open.');
          return;
        }
        if (typeof target == 'function') {
          target = target.call(window, options, config);
        }
        if (!target || target == 'gsft_main') {
          openInFrame(url);
        } else {
          window.open(url, target);
        }
      }
    }

    function navigatorMenuPatch() {
      function callback(invokedOn, selectedMenu) {
        var module = invokedOn.closest('a'),
          id = module.attr('data-id'),
          url = '/sys_app_module.do',
          text = selectedMenu.text();
        if (!id) {
          id = module.attr('id');
          if (post_helsinki) {
            if (!module.hasClass('app-node') && !module.hasClass('module-node')) {
              jslog('Not an app or module node.');
              return;
            }
          }
          if (!id) {
            jslog('No data id.');
            return;
          }
        }
        module.$id = id;
        var item, i;
        for (i = 0; i < items.length; i++) {
          item = items[i];
          if (item.name == text) {
            executeMenuItem(item, {
              module: module
            });
            return;
          }
        }
        jslog('Unknown item selected: "' + text + '"');
      }
      var items = snd_ui16_developer_patch_menus.navigator(),
        post_helsinki;
      if (!userHasRole('teamdev_configure_instance')) {
        return;
      }
      createContextMenu('snd_ui16dp_navigator_module_menu', items);
      post_helsinki = minVersion('I');
      $('#gsft_nav').snd_ui16dp_menu({
        event: 'contextmenu',
        selector: 'a[data-id],a[id]',
        menu_id: "#snd_ui16dp_navigator_module_menu",
        callback: callback
      });
      jslog('snd_ui16_developer_patch navigator patch applied');
    }

    function navigatorPencilPatch() {
      var post_helsinki = minVersion('I');
      if (post_helsinki) {
        addStyle(
          'div.sn-widget-list-action.nav-edit-module,' +
          'a.sn-aside-btn.nav-edit-app {' +
          'display: none !important;' +
          '}'
        );
        var width = config.navigator.width;
        if (width != 285) {
          $('.navpage-nav').width(width);
          $('#nav_west').width(width);
          $('.navpage-main').css('left', width + 'px');
        }
        jslog('snd_ui16_developer_patch navigator pencil patch applied.');
      }
    }

    function pickerWidthPatch(offset) {
      var max_w = config.picker_width.max_width,
        min_w = config.picker_width.min_width,
        pickers = $('.navpage-pickers .selector:has(select)'),
        nav_w,
        logo_w,
        float_w,
        diff,
        size;
      if (!pickers.length) {
        jslog('snd_ui16_developer_patch picked width patch failed. No pickers found.');
        return;
      }
      $('.navpage-pickers').css('display', '');
      pickers.css('width', '');
      nav_w = $('header.navpage-header').width();
      logo_w = $('div.navbar-header').outerWidth();
      float_w = $('div.navbar-right').outerWidth();
      diff = nav_w - logo_w - float_w - (offset || 0);
      size = 100 + (diff / pickers.length);
      size = size > max_w ? max_w : size;
      if (size < min_w) {
        $('.navpage-pickers').css('display', 'none');
        jslog('snd_ui16_developer_patch pickers hidden as less than minimum width (' + size + ' < ' + min_w + ')');
      } else {
        pickers.css('width', size);
        jslog('snd_ui16_developer_patch picker width patch applied (diff: ' + diff + '; size: ' + size + ')');
      }
    }

    function patchIcon(name, className, items, callback) {
      var id = 'snd_ui16dp_' + name + '_menu',
        post_istanbul = minVersion('J'),
        icon;
      createContextMenu(id, items);
      icon = $('.' + className + ' ' + (post_istanbul ? 'a.btn-icon' : 'span.label-icon'));
      if (icon.length) {
        icon.snd_ui16dp_menu({
          menu_id: "#" + id,
          callback: callback
        }).css('cursor', 'pointer');
        jslog('snd_ui16_developer_patch icon picker patch applied to ' + name + ' picker.');
      } else {
        jslog('snd_ui16_developer_patch icon picker patch unable to find ' + name + ' picker.');
      }
    }

    function patchUpdateSetPickerIcon() {
      function callback(invokedOn, selectedMenu) {
        var set_id = set_id = $('#update_set_picker_select').val(),
          text = selectedMenu.text(),
          item,
          i;
        for (i = 0; i < items.length; i++) {
          item = items[i];
          if (item.name == text) {
            executeMenuItem(item, {
              set_id: set_id
            });
            return;
          }
        }
        jslog('Unknown item selected: "' + text + '"');
      }
      var items = snd_ui16_developer_patch_menus.update_set();
      patchIcon('updateset', 'concourse-update-set-picker', items, callback);
    }

    function patchAppPickerIcon() {
      function getAppId() {
        var app_id = $('#application_picker_select').val();
        return app_id.split(':').pop();
      }

      function callback(invokedOn, selectedMenu) {
        var app_id = getAppId(),
          text = selectedMenu.text(),
          item,
          i;
        for (i = 0; i < items.length; i++) {
          item = items[i];
          if (item.name == text) {
            executeMenuItem(item, {
              app_id: app_id
            });
            return;
          }
        }
        jslog('Unknown item selected: "' + text + '"');
      }
      var items = snd_ui16_developer_patch_menus.application();
      patchIcon('application', 'concourse-application-picker', items, callback);
    }

    function patchDomainPickerIcon() {
      function getDomainId() {
        var sys_id = $('#domain_picker_select').val();
        if (sys_id) {
          sys_id = sys_id.split(':').pop();
        }
        return sys_id;
      }

      function callback(invokedOn, selectedMenu) {
        var domain_id = getDomainId(),
          text = selectedMenu.text(),
          item,
          i;
        for (i = 0; i < items.length; i++) {
          item = items[i];
          if (item.name == text) {
            executeMenuItem(item, {
              domain_table: domain_table,
              domain_id: domain_id
            });
            return;
          }
        }
        jslog('Unknown item selected: "' + text + '"');
      }
      var domain_table = config.picker_icon.domain_table;
      var items = snd_ui16_developer_patch_menus.domain();
      patchIcon('domain', 'concourse-domain-picker', items, callback);
    }

    function pickerIconPatch() {
      patchUpdateSetPickerIcon();
      patchAppPickerIcon();
      if (userHasRole('domain_admin')) {
        patchDomainPickerIcon();
      }
    }

    function profileMenuPatch() {
      var user_dropdown = $('#user_info_dropdown').next('ul'),
        impersonate_item;

      function addUnimpersonateItem() {
        impersonate_item.parent().after('<li><a href="snd_ui16dp_unimpersonate.do"' +
          ' target="gsft_main">Unimpersonate</a>');
        jslog('snd_ui16_developer_patch user menu patch applied.');
      }
      impersonate_item = user_dropdown.find('[sn-modal-show="impersonate"]');
      if (impersonate_item) {
        if (config.profile_menu.check_impersonation) {
          $.ajax({
            url: '/snd_ui16dp.do?action=getImpersonationDetails',
            type: 'GET',
            dataType: 'JSON'
          }).done(function(data) {
            if (data.result && data.result.is_impersonating) {
              addUnimpersonateItem();
            } else {
              jslog('snd_ui16_developer_patch confirmed user is not impersonating.');
            }
          }).fail(function() {
            jslog('snd_ui16_developer_patch failed to check impersonation details.');
          });
        } else {
          addUnimpersonateItem();
        }
      }
      if (config.profile_menu.link_preferences && userHasRole()) {
        user_dropdown.children().first()
          .after('<li><a href="/sys_user_preference_list.do?sysparm_query=user=' + top.NOW.user.userID + '" ' +
            'target="gsft_main">Preferences</a></li>');
      }
    }

    function openInFrame(target) {
      jslog('snd_ui16_developer_patch opening target: ' + target);
      var frame = $('#gsft_main');
      if (frame.length) {
        frame[0].src = target;
      } else {
        jslog('> gsftMain frame not found.');
      }
    }

    function refreshPickers() {
      var injector = angular.element('body').injector();
      try {
        injector.get('snCustomEvent').fire('sn:refresh_update_set');
      } catch (e) {}
      try {
        injector.get('applicationService').getApplicationList();
      } catch (e) {}
      try {
        injector.get('domainService').getDomainList();
      } catch (e) {}
    }

    function userHasRole(role) {
      var roles = (',' + window.NOW.user.roles + ','),
        is_admin = roles.indexOf(',admin,') > -1;
      if (role) {
        return is_admin || roles.indexOf(',' + role + ',') > -1;
      }
      return is_admin;
    }

    function patch() {
      var nav_interval,
        picker_interval;
      if (config.navigator_context.active) {
        navigatorMenuPatch();
        if (config.navigator_context.hide_pencil) {
          navigatorPencilPatch();
        }
      }
      if (config.picker_width.active) {
        $('.navpage-pickers').removeClass('hidden-md');
        setTimeout(function() {
          pickerWidthPatch();
          picker_interval = setInterval(function() {
            pickerWidthPatch();
          }, 1000);
          setTimeout(function() {
            clearInterval(picker_interval);
          }, config.picker_width.load_timeout);
        }, config.picker_width.load_timeout);
        angular.element(window).on('resize', function() {
          pickerWidthPatch();
        });
        $('input#sysparm_search').focus(function() {
          pickerWidthPatch(config.picker_width.max_search_width);
        });
        $('input#sysparm_search').blur(function() {
          setTimeout(function() {
            pickerWidthPatch();
          }, 500);
        });
      }
      if (config.picker_icon.active) {
        pickerIconPatch();
      }
      if (config.profile_menu.active) {
        profileMenuPatch();
      }
    }
    window.top.snd_ui16_developer_patch = function() {
      try {
        if (window.top.snd_ui16_developer_patched != null) {
          jslog('snd_ui16_developer_patch already applied.');
          return;
        }
        if (!isUI16()) {
          window.top.snd_ui16_developer_patched = false;
          jslog('snd_ui16_developer_patch ignored. Not UI16.');
        } else {
          jslog('Running snd_ui16_developer_patch...');
          patch();
          window.top.snd_ui16_developer_patched = true;
        }
      } catch (e) {
        jslog('[ws] UI16 Developer Patch mod failure: ' + e);
      }
    };
  })(jQuery, window);
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
/*! RESOURCE: snd_xplore_glasses */
function snd_xplore_glasses() {
  if (typeof jQuery === 'function' && typeof top.$j === 'function') {
    jQuery(document).ready(function() {
      var top = window.top;
      if (typeof top.snd_xplore_loaded != 'undefined') {
        return;
      }
      top.snd_xplore_loaded = true;
      var hasAdmin = (function() {
        try {
          var roles;
          if (typeof top.NOW == 'object') {
            roles = top.NOW.user.roles.split(',');
          } else if (typeof window.g_user == 'object' && window.g_user.roles) {
            roles = window.g_user.roles;
          }
          if (!roles) return false;
          for (var i = roles.length - 1; i > -1; i--) {
            if (roles[i] == 'admin') return true;
          }
        } catch (e) {
          jslog('Error with snd_xplore_glasses script finding user roles: ' + e);
        }
        return false;
      })();
      var isUI16 = top.$j('.navpage-header-content').length > 0;
      var title = "Xplore: the professional ServiceNow developer toolkit.";
      var widgetHtml;
      if (hasAdmin) {
        if (isUI16) {
          widgetHtml = '<div class="navpage-header-content">' +
            '<button data-placement="auto" class="btn btn-icon icon-glasses"' +
            ' title="' + title + '" data-original-title="Xplore" onclick="window.open(\'/snd_xplore.do\', \'_blank\');">' +
            '<span class="sr-only">Xplore</span>' +
            '</button></div>';
          top.$j('#sysparm_search').parents('div.navpage-header-content').first().after(widgetHtml);
        } else {
          widgetHtml = '<span id="snd_xplore_span" ' +
            'style="visibility: visible; display: inline-block; zoom: 1; vertical-align: middle;">' +
            '<span tabindex="0" onclick="window.open(\'/snd_xplore.do\', \'_blank\');"' +
            ' class="icon-glasses sn-tooltip-basic"' +
            ' style="cursor: pointer; font-size: 20px; border: 0;"' +
            ' title="' + title + '"><span class="sr-only">' + title +
            '</span></span></span>';
          top.$j('#nav_header_stripe_decorations_left').append(widgetHtml);
        }
      }
    });
  }
}
snd_xplore_glasses();
/*! RESOURCE: snd_xplore_glist */
var snd_xplore_list = {};
snd_xplore_list.openQuery = function openQuery() {
  var query = ('' + g_list.getFixedQuery()).replace('null', '');
  if (query == '') {
    query = ('' + g_list.getRelatedQuery()).replace('null', '');
  }
  var user_query = '' + g_list.getQuery();
  if (user_query) {
    query = query ? '^' + user_query : user_query;
  }
  var newline = '\n';
  var script = 'function run() {' + newline;
  script += '    var gr = new GlideRecord(\'' + g_list.tableName + '\');' + newline;
  if (query) {
    script += '    gr.addEncodedQuery(\'' + query + '\');' + newline;
  }
  script += '    //gr.orderBy(\'name\');' + newline;
  script += '    //gr.setLimit(100);' + newline;
  script += '    //gr.setWorkflow(false);' + newline;
  script += '    //gr.autoSysFields(false);' + newline;
  script += '    gr.query();' + newline;
  script += '    ' + newline;
  script += '    var log = [];' + newline;
  script += '    while (gr.next()) {' + newline;
  script += '        log.push(gr.getDisplayValue());' + newline;
  script += '        ' + newline;
  script += '    }' + newline;
  script += '    return log;' + newline;
  script += '}' + newline;
  script += 'run();';
  snd_xplore_list.open(script);
};
snd_xplore_list.openRecord = function openRow() {
  var newline = '\n';
  var script = 'var gr = new GlideRecord(\'' + g_list.tableName + '\');' + newline;
  script += 'gr.get(\'' + g_sysId + '\');' + newline;
  script += 'gr;';
  snd_xplore_list.open(script);
};
snd_xplore_list.open = function open(script) {
  var win = window.open('/snd_xplore.do');
  jQuery(win).bind('load', function() {
    win.snd_xplore_editor.setValue(script);
  });
};
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