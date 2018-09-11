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
/*! RESOURCE: getSCAttachmentCount */
function getSCAttachmentCount() {
  var length;
  try {
    length = angular.element("#sc_cat_item").scope().attachments.length;
  } catch (e) {
    length = -1;
  }
  return length;
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
    else {
      var tableName = 'rm_story';
      if (g_form)
        tableName = g_form.tableName;
      this.reloadList(tableName + ".rm_scrum_task.story");
    }
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
/*! RESOURCE: KCSFunctions */
addLoadEvent(loadStars);

function solutionForIncident(x, sys_id) {
  var gf = self.parent.window;
  var lastSaved = self.parent.window.document.getElementById("onLoad_sys_updated_on").value;
  var f = x.form;
  var sysID;
  if (sys_id == '') {
    sysID = f.sys_id.value;
  } else {
    sysID = sys_id;
  }
  var rel = new RelationType();
  rel.findType('task', 'kb_knowledge');
  var id = self.parent.window.document.getElementById("sys_uniqueValue");
  rel.setRelatedInfo(id.value, 'task', 'kb_knowledge');
  rel.addSelected(rel, sysID);
  var knowledge = new GlideRecord('kb_knowledge');
  knowledge.addQuery('sys_id', sys_id);
  knowledge.query();
  if (knowledge.next()) {
    var knowledge_number = knowledge.number;
  }
  var incident = new GlideRecord('incident');
  incident.addQuery('sys_id', id.value);
  incident.query();
  if (incident.next()) {
    gf.g_form.setValue('u_kb_solution', sys_id);
    gf.g_form.save();
  }
  return true;
}

function unsolutionForIncident(kcs_id) {
  var gf = self.parent.window;
  var incident_sys_id = gf.g_form.getValue('sys_uniqueValue');
  var relation = new GlideRecord('task_rel_kb');
  relation.addQuery('parent.sys_id', incident_sys_id);
  relation.addQuery('child.sys_id', kcs_id);
  relation.query();
  if (relation.next()) {
    relation.deleteRecord();
    setTimeout(incident_remove_kb_solution(incident_sys_id, gf), 3000);
  }
}

function incident_remove_kb_solution(incident_sys_id, gf) {
  var incident = new GlideRecord('incident');
  incident.addQuery('sys_id', incident_sys_id);
  incident.query();
  if (incident.next()) {
    gf.g_form.setValue('u_kb_solution', '');
    gf.g_form.save();
  }
  return true;
}

function getKcSRelation(x) {
  var gf = self.parent.window;
  var relation = new GlideRecord('task_rel_kb');
  relation.addQuery('parent.sys_id', gf.g_form.getValue('sys_uniqueValue'));
  relation.query();
  while (relation.next()) {
    var relation_sys_id = relation.child;
    $(".kb-fixed").each(function() {
      $(this).addClass("kb-fixed-readonly-button");
      $(this).prop('disabled', true);
      var generated_kcs = $(this).attr('rel');
      if (relation_sys_id == generated_kcs) {
        $(this).addClass("kb-fixed-selected-button");
        $(this).removeClass("kb-fixed-readonly-button");
        $(this).prop('disabled', false);
      }
    });
  }
}

function printError() {
  self.opener.g_form.addErrorMessage(gel('error_msg').value);
}

function loadStars() {
  var vote = document.getElementById('vote');
  if (vote) {
    star1 = new Image();
    star1.src = "images/icons/kb_star_off.gifx";
    star2 = new Image();
    star2.src = "images/icons/kb_star_on.gifx";
    starFull = new Image();
    starFull.src = "images/icons/kb_star_full.gifx";
    starHalf = new Image();
    starHalf.src = "images/icons/kb_star_half.gifx";
  }
}

function postUsed(id, used) {
  var view = document.getElementById("view_id");
  var query = document.getElementById("sysparm_search");
  openFeedback();
  if (id) {
    var ajax = new GlideAjax("KnowledgeAjax");
    ajax.addParam("sysparm_type", "kbGetText");
    ajax.addParam("sysparm_search", escape(query.value));
    ajax.addParam("article_id", id);
    ajax.addParam("used", used);
    if (view)
      ajax.addParam("view_id", view.value);
    ajax.getXML(doNothing);
  }
  if (isNaN(used)) {
    var e;
    if (used == 'yes') {
      hideObject(gel('noarticlerating'));
      e = document.getElementById('yesarticlerating');
      if (e) {
        e.setAttribute("onclick", "");
        e.setAttribute("class", "kb_link_disable");
        e.setAttribute("className", "kb_link_disable");
      }
    } else if (used == 'no') {
      hideObject(gel('yesarticlerating'));
      show("kb_create_incident_link");
      e = document.getElementById('noarticlerating');
      if (e) {
        e.setAttribute("onclick", "");
        e.setAttribute("class", "kb_link_disable");
        e.setAttribute("className", "kb_link_disable");
      }
    } else hideObject(gel('articlerating'));
    showObject(gel('articleratingsubmitted'));
  }
}
var answer = new GwtMessage().getMessages(["Not rated", "Rated", "Rating", "by you", "average", "user rating", "user ratings"]);

function setStar(x) {
  a = x + "";
  set = true;
  gel('vote').innerHTML = answer["Rated"] + " " + x + "/5 " + answer["by you"];
  gel('rated_value').value = x;
  var id = gel('sys_id').value;
  postUsed(id, x);
}

function toggleArticleFlag(e) {
  var msg = document.getElementById("commentsdiv_flagmsg");
  var inputdiv = document.getElementById("commentsdiv");
  var donemsg = document.getElementById("commentsdiv_done");
  var input = document.getElementById("article_comments");
  if (e.checked) {
    showObject(msg);
    hideObject(donemsg);
    openFeedback();
  } else
    hideObject(msg);
}

function openFeedback() {
  var cmtdivdone = document.getElementById('commentsdiv_done');
  if (cmtdivdone.style.display != "block") {
    var commentsdiv = document.getElementById('commentsdiv');
    showObject(commentsdiv);
    document.getElementById('commentsimg').src = "images/filter_reveal.gifx";
    document.getElementById('commentsimg').alt = "Collapse";
    window.scrollBy(0, 9999999);
    var e = document.getElementById('article_comments');
    if (e)
      e.focus();
    window.scrollBy(0, -20);
  }
}
var set = false;
var v = 0;
var a;

function highlight(x) {
  for (i = 1; i < 6; i++) {
    if (i < x * 1 + 1)
      document.getElementById(i).src = star2.src;
    else
      document.getElementById(i).src = star1.src;
  }
  document.getElementById('vote').innerHTML = answer["Rating"] + ": " + x + "/5";
}

function losehighlight() {
  var vote = gel('vote');
  var num = gel("num_ratings").value * 1;
  var rating = gel("rating_value").value * 1;
  if (set == false) {
    for (i = 1; i < 6; i++) {
      if (rating > i - 0.25)
        document.getElementById(i).src = starFull.src;
      else if (rating > i - 0.75)
        document.getElementById(i).src = starHalf.src;
      else
        document.getElementById(i).src = star1.src;
    }
    if (rating == 0)
      vote.innerHTML = answer["Not rated"];
    else
      vote.innerHTML = answer["Rated"] + " " + rating.toFixed(2);
    if (num == 1)
      vote.title = num + " " + answer["user rating"];
    else
      vote.title = num + " " + answer["user ratings"];
  } else {
    var rated = gel("rated_value").value * 1;
    for (i = 1; i < 6; i++) {
      if (i <= rated)
        document.getElementById(i).src = star2.src;
      else
        document.getElementById(i).src = star1.src;
    }
    vote.innerHTML = answer["Rated"] + " " + rated + "/5 " + answer["by you"];
    var totalScore = rating * num + rated;
    var totalRatings = num * 1 + 1;
    if (totalRatings == 1)
      vote.title = (totalScore / totalRatings).toFixed(2) + " " + answer["average"] + ", " + totalRatings + " " + answer["user rating"];
    else
      vote.title = (totalScore / totalRatings).toFixed(2) + " " + answer["average"] + ", " + totalRatings + " " + answer["user ratings"];
  }
}

function attachTaskKCS(x, target, taskID, table, version) {
  var task;
  if (taskID.length > 0) {
    task = taskID;
  } else {
    return false;
  }
  var sysID;
  if (version == '2') {
    var f = x.form;
    sysID = f.sys_id.value;
    if (typeof sysID == "undefined") {
      sysID = f.sys_id[0].value;
    }
  } else {
    sysID = x.value;
  }
  var args = [];
  args.push(sysID);
  args.push(target);
  args.push(table);
  args.push(window.self.parent.window);
  var ajax = new GlideAjax("KnowledgeAjax");
  ajax.addParam("sysparm_type", "kbAttachArticle");
  ajax.addParam("sysparm_value", sysID + "," + task);
  ajax.getXML(kbReturnAttachKCS, "", args);
  return false;
}

function kbReturnAttachKCS(AJAXResponse, args) {
  var sourceID = args[0];
  var targetFields = args[1];
  var tableName = args[2];
  var winRef = args[3];
  var fieldName = 'short_description';
  var items = AJAXResponse.responseXML.getElementsByTagName("item");
  var value;
  if (items.length > 0) {
    var item = items[0];
    var name = item.getAttribute("name");
    value = item.getAttribute("value");
  }
  var names = [];
  if (targetFields) {
    var parts = targetFields.split(",");
    for (var i = 0; i < parts.length; i++)
      names.push(parts[i]);
  }
  names.push('comments');
  names.push('description');
  var target = null;
  var targetName = null;
  for (var i2 = 0; i2 < names.length; i2++) {
    targetName = names[i2];
    target = winRef.document.getElementById(tableName + "." + targetName);
    if (target)
      break;
  }
  if (target) {
    var ed = winRef.g_form.getGlideUIElement(targetName);
    if (ed && ed.type == 'reference') {
      winRef.g_form.setValue(targetName, sourceID);
    } else {
      var newValue = "";
      if (target.value == "")
        newValue = value;
      else
        newValue = target.value + "\n" + value;
      winRef.g_form.setValue(targetName, newValue);
    }
  }
}

function kbFeedback2(name) {
  var comments = ($(name) ? $(name).value : "");
  if (comments == "") {
    showObject(gel('commentsdiv_empty'));
    return false;
  }
  var sys_id = ($('sys_id') ? $('sys_id').value : "");
  var flag = document.getElementById("article_flag");
  var view_id = document.getElementById("view_id");
  var query = document.getElementById("sysparm_search");
  var ajax = new GlideAjax("KnowledgeAjax");
  ajax.addParam("sysparm_type", "kbWriteComment");
  ajax.addParam("sysparm_search", escape(query.value));
  ajax.addParam("sysparm_id", sys_id);
  if (flag)
    ajax.addParam("sysparm_flag", flag.checked);
  ajax.addParam("sysparm_feedback", escape(comments));
  ajax.addParam("view_id", view_id.value);
  ajax.getXML(kbFeedbackDone);
  var commentLinkDiv = $("comment_link_div");
  if (commentLinkDiv)
    commentLinkDiv.hide();
  return false;
}
addLoadEvent(KBArticleReferenceLink);

function KBArticleReferenceLink() {
  $$('a[href^="#KBREF_"]').each(function(item) {
    item.on("click", function(event) {
      var lk = event.target;
      if (lk.next() && lk.next().hasClassName("kbarticlecontent")) {
        lk.next().remove();
      } else {
        var kbid = lk.href.substring(item.href.lastIndexOf("#KBREF_") + 7);
        var kcah = new GlideAjax('KnowledgeCustomAjaxHelpers');
        kcah.addParam('sysparm_name', 'getKBText');
        kcah.addParam('sysparm_kb_number', kbid);
        kcah.getXML(setKBArticleReferenceLinkText, null, lk);
      }
    });
  });
}

function setKBArticleReferenceLinkText(response, elem) {
  var answer = response.responseXML.documentElement.getAttribute("answer");
  var content = document.createElement("p");
  content.setAttribute("class", "kbarticlecontent");
  content.style.border = "1px solid black";
  content.style.padding = "10px";
  content.innerHTML = answer;
  elem.insert({
    after: content
  });
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
    ga.addParam('sysparm_work_duration', this._gForm.hasField('work_duration') ? this._gForm.getValue('work_duration') : g_scratchpad.actualDuration);
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
      ga.addParam('sysparm_sys_id', g_scratchpad.projectTaskSysId);
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
    else if (g_form.getValue('work_start') != '') {
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