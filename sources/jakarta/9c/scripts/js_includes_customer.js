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
/*! RESOURCE: (UWS) Change Label Display Text */
function changeFieldLabel(field, label, color, weight) {
  try {
    var labelElement = $('label.' + g_form.getControl(field).id);
    labelElement.select('label').each(function(elmt) {
      elmt.innerHTML = label + ':';
    });
    if (color)
      labelElement.style.color = color;
    if (weight)
      labelElement.style.fontWeight = weight;
  } catch (e) {}
}
/*! RESOURCE: (UWS) Banner Marquee */
try {
  var instanceName = document.domain.split(".service-now.com")[0];
  var instanceMarquee;
  switch (document.domain.split(".service-now.com")[0]) {
    case 'uwsdev':
      instanceMarquee = "DEVELOPMENT ENVIRONMENT !";
      break;
    case 'uwsdev2':
      instanceMarquee = "DEVELOPMENT 2 ENVIRONMENT !";
      break;
    case 'uwstest':
      instanceMarquee = "TEST ENVIRONMENT !";
      break;
    case 'uwstraining':
      instanceMarquee = "TRAINING ENVIRONMENT !";
      break;
    default:
  }
  if (instanceMarquee) {
    window.parent.$('nav_header_text').innerHTML = '<marquee><strong><font color="white">' + instanceMarquee + '</font></strong></marquee>';
  }
} catch (e) {}
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
/*! RESOURCE: (UWS) Hides Shopping Cart */
addLoadEvent(hideShoppingCart);

function hideShoppingCart() {
  if ($('cartContent')) {
    hideObject(gel('cartContent'));
  }
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
/*! RESOURCE: (FRU) Ask.Western - UI Script */
jQuery(document).ready(function() {
  try {
    jQuery('.categories-menu .expandable > a').unbind('click');
    jQuery('.categories-menu .expandable > a').click(function(e) {
      jQuery(this).next().slideToggle();
      jQuery(this).parent().toggleClass('active');
      e.preventDefault();
      return false;
    });
    jQuery('.askw--search-bar--menu-toggle').unbind('click');
    jQuery('.askw--search-bar--menu-toggle').click(function(e) {
      jQuery('.askw--categories-menu').slideToggle(350);
      jQuery(this).toggleClass('active');
      e.preventDefault();
      return false;
    });
    jQuery('#askw--search-results--browser-topics').click(function(e) {
      jQuery('html, body').animate({
        scrollTop: jQuery("#askw-header").offset().top
      }, 1500, 'easeInOutExpo');
    });
  } catch (e) {}
  jQuery(window).resize(function() {
    BrowserResize();
  });
  BrowserResize();
});

function BrowserResize() {
  var win_w = jQuery(window).width();
  var mobile_menu = jQuery('.askw--categories-menu');
  var layout_1col = Boolean(jQuery('.askw--body-wrapper').hasClass('layout--1-col'));
  if (win_w > 768 && !layout_1col) {
    mobile_menu.show();
  }
  if (win_w > 768 && layout_1col) {
    mobile_menu.hide();
  }
  if (win_w < 768) {
    mobile_menu.hide();
    jQuery('.askw--search-bar--menu-toggle').removeClass('active');
  }
  InitialiseTopicsMenu();
}

function InitialiseTopicsMenu() {
  var item = jQuery('.categories-menu li');
  jQuery(item).each(function() {
    if (jQuery(this).hasClass('active')) {
      jQuery(this).find('.categories-menu--sub-menu').show();
    }
  });
}

function PrintArticle() {
  w = window.open(null, 'Print_Page', 'scrollbars=yes');
  var css_main = '<link rel="stylesheet" href="https://uwsdev.service-now.com/8bec18756f2aa200d069fe764b3ee424.cssdbx" />';
  var css_fontawesome = '<link rel="stylesheet" href="https://uwsdev.service-now.com/bdb98b6a4f0f4600025b4aa28110c761.cssdbx" />';
  var css_print = '<link rel="stylesheet" href="https://uwsdev.service-now.com/20c22b524f0b2e402e81faf11310c714.cssdbx" />';
  w.document.write(css_main + css_fontawesome + css_print + jQuery('.askw--article-wrapper').html());
  setTimeout(function() {
    w.document.close();
    w.print();
  }, 1500);
}

function EmailArticle(art_subject, art_url) {
  var emailAddress = '';
  var emailsubject = 'Western Sydney University - Help Article: ' + art_subject;
  var emailBody = art_url;
  console.log(emailsubject);
  window.location = "mailto:" + emailAddress + "?subject=" + emailsubject + "&body=" + emailBody;
}

function FeedbackEmail() {
  var email = 'studentcentral@westernsydney.edu.au';
  var subject = 'Help Feedback';
  window.location = "mailto:" + email + "?subject=" + subject;
}
/*! RESOURCE: (UWS) MyIT UI action scripts */
window.onclick = function(event) {
  var classes = event.target.className.split(' ');
  var found = false;
  var i = 0;
  var filterOpt = false;
  var saveOpt = false;
  while (i < classes.length && !found) {
    if (classes[i] == 'fa-floppy-o') {
      found = true;
      saveOpt = true;
    } else if (classes[i] == 'fa-filter') {
      found = true;
      filterOpt = true;
    } else {
      ++i;
    }
  }
  if (saveOpt) {
    hideFilterDropDown();
  }
  if (filterOpt) {
    hideSaveDropDown();
  }
  if (!found) {
    hideFilterDropDown();
    hideSaveDropDown();
  }
};

function hideFilterDropDown() {
  var dropdownfilter = document.getElementsByClassName("tab--filter--select");
  var l;
  for (l = 0; l < dropdownfilter.length; l++) {
    var openDropdownFilter = dropdownfilter[l];
    if (openDropdownFilter.classList.contains('tab--filter--show')) {
      openDropdownFilter.classList.remove('tab--filter--show');
    }
  }
}

function hideSaveDropDown() {
  var dropdownsave = document.getElementsByClassName("tab--save--select");
  var l;
  for (l = 0; l < dropdownsave.length; l++) {
    var openDropdownSave = dropdownsave[l];
    if (openDropdownSave.classList.contains('tab--save--show')) {
      openDropdownSave.classList.remove('tab--save--show');
    }
  }
}

function selectSaveOptionTab_1() {
  document.getElementById("save_options_tab_1").classList.toggle("tab--save--show");
}

function selectSaveOptionTab_2() {
  document.getElementById("save_options_tab_2").classList.toggle("tab--save--show");
}

function selectSaveOptionTab_3() {
  document.getElementById("save_options_tab_3").classList.toggle("tab--save--show");
}

function selectSaveOptionTab_4() {
  document.getElementById("save_options_tab_4").classList.toggle("tab--save--show");
}

function selectFilterOptionTab_1() {
  document.getElementById("filter_options_tab_1").classList.toggle("tab--filter--show");
}

function selectFilterOptionTab_2() {
  document.getElementById("filter_options_tab_2").classList.toggle("tab--filter--show");
}

function activeMyTicketsTab(evt, mytickets) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("myit--mytickets--tab--content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(mytickets).style.display = "block";
  evt.currentTarget.className += " active";
}

function sortThisColumn(column, tab) {
  var search_text, search_tab;
  var sort_by = getParmVal('sysparm_sort_by');
  if (sort_by == undefined) {
    sort_by = column;
  }
  var sort_type = getParmVal('sysparm_sort_type');
  var current_tab = getParmVal('sysparm_doc');
  if (current_tab == undefined) {
    current_tab = 'current_tickets';
  }
  var filter_by = getParmVal('sysparm_task_filter');
  if (filter_by == undefined) {
    filter_by = '';
  }
  if (sort_by == column && current_tab == tab) {
    if (sort_type == undefined || sort_type == '' || sort_type == 'asc') {
      sort_type = 'desc';
    } else {
      sort_type = 'asc';
    }
  } else if (sort_by != column && current_tab == tab) {
    sort_type = 'desc';
  } else if (sort_by == column && current_tab != tab) {
    sort_type = 'desc';
  }
  var search_tickets = getParmVal('sysparm_search_tickets');
  var search_ticket_hist = getParmVal('sysparm_search_ticket_hist');
  var search_approval = getParmVal('sysparm_search_approval');
  var search_approval_hist = getParmVal('sysparm_search_approval_hist');
  if (search_tickets != '' && search_tickets != undefined) {
    search_tab = '&sysparm_search_tickets=' + search_tickets;
  } else if (search_ticket_hist != '' && search_ticket_hist != undefined) {
    search_tab = '&sysparm_search_ticket_hist=' + search_ticket_hist;
  } else if (search_approval != '' && search_approval != undefined) {
    search_tab = '&sysparm_search_approval=' + search_approval;
  } else if (search_approval_hist != '' && search_approval_hist != undefined) {
    search_tab = '&sysparm_search_approval_hist=' + search_approval_hist;
  } else {
    search_tab = '&sysparm_search_tickets=';
  }
  var urlPage = '/Portal/my_tickets.do?sysparm_sort_by=' + column + '&sysparm_sort_type=' + sort_type + search_tab + '&sysparm_doc=' + tab;
  if (filter_by != '') {
    urlPage += "&sysparm_task_filter=" + filter_by;
  }
  window.open(urlPage, '_self', false);
}

function currentTicketFilter(taskID, doc) {
  var doc_type, search_tab;
  var search_text = '';
  var url = "/Portal/my_tickets.do?sysparm_task_filter=" + taskID;
  if (doc == '') {
    doc_type = getParmVal('sysparm_doc');
    if (doc_type == undefined) {
      doc_type = '';
    }
  } else {
    doc_type = doc;
  }
  var search_tickets = getParmVal('sysparm_search_tickets');
  var search_ticket_hist = getParmVal('sysparm_search_ticket_hist');
  if (search_tickets != '' && search_tickets != undefined && doc_type == 'current_tickets') {
    search_tab = '&sysparm_search_tickets=' + search_tickets;
  } else if (search_ticket_hist != '' && search_ticket_hist != undefined && doc_type == 'ticket_history') {
    search_tab = '&sysparm_search_ticket_hist=' + search_ticket_hist;
  } else {
    search_tab = '&sysparm_search_tickets=';
  }
  url += search_tab;
  var sort_type = getParmVal('sysparm_sort_type');
  if (sort_type == undefined) {
    sort_type = '';
  }
  var sort_by = getParmVal('sysparm_sort_by');
  if (sort_by == undefined) {
    sort_by = '';
  }
  if (doc_type != '') {
    url += "&sysparm_doc=" + doc_type;
  }
  if (sort_type != '' || sort_by != '') {
    url += "&sysparm_sort_type=" + sort_type + "&sysparm_sort_by=" + sort_by;
  }
  location.href = url;
  return false;
}

function currentTicketSearch() {
  var sort_type = getParmVal('sysparm_sort_type');
  if (sort_type == undefined) {
    sort_type = '';
  }
  var sort_by = getParmVal('sysparm_sort_by');
  if (sort_by == undefined) {
    sort_by = '';
  }
  var filter_by = getParmVal('sysparm_task_filter');
  if (filter_by == undefined) {
    filter_by = '';
  }
  var url = "/Portal/my_tickets.do?sysparm_doc=current_tickets&sysparm_search_tickets=" + document.getElementById("sysparm_search_tickets").value;
  if (sort_type != '' || sort_by != '') {
    url += "&sysparm_sort_type=" + sort_type + "&sysparm_sort_by=" + sort_by;
  }
  if (filter_by != '') {
    url += "&sysparm_task_filter=" + filter_by;
  }
  location.href = url;
  return false;
}

function ticketHistorySearch() {
  var sort_type = getParmVal('sysparm_sort_type');
  if (sort_type == undefined) {
    sort_type = '';
  }
  var sort_by = getParmVal('sysparm_sort_by');
  if (sort_by == undefined) {
    sort_by = '';
  }
  var filter_by = getParmVal('sysparm_task_filter');
  if (filter_by == undefined) {
    filter_by = '';
  }
  var url = "/Portal/my_tickets.do?sysparm_doc=ticket_history&sysparm_search_ticket_hist=" + document.getElementById("sysparm_search_ticket_hist").value;
  if (sort_type != '' || sort_by != '') {
    url += "&sysparm_sort_type=" + sort_type + "&sysparm_sort_by=" + sort_by;
  }
  if (filter_by != '') {
    url += "&sysparm_task_filter=" + filter_by;
  }
  location.href = url;
  return false;
}

function currentApprovalSearch() {
  var sort_type = getParmVal('sysparm_sort_type');
  if (sort_type == undefined) {
    sort_type = '';
  }
  var sort_by = getParmVal('sysparm_sort_by');
  if (sort_by == undefined) {
    sort_by = '';
  }
  var url = "/Portal/my_tickets.do?sysparm_doc=current_approval&sysparm_search_approval=" + document.getElementById("sysparm_search_approval").value;
  if (sort_type != '' || sort_by != '') {
    url += "&sysparm_sort_type=" + sort_type + "&sysparm_sort_by=" + sort_by;
  }
  location.href = url;
  return false;
}

function approvalHistorySearch() {
  var sort_type = getParmVal('sysparm_sort_type');
  if (sort_type == undefined) {
    sort_type = '';
  }
  var sort_by = getParmVal('sysparm_sort_by');
  if (sort_by == undefined) {
    sort_by = '';
  }
  var url = "/Portal/my_tickets.do?sysparm_doc=approval_history&sysparm_search_approval_hist=" + document.getElementById("sysparm_search_approval_hist").value;
  if (sort_type != '' || sort_by != '') {
    url += "&sysparm_sort_type=" + sort_type + "&sysparm_sort_by=" + sort_by;
  }
  location.href = url;
  return false;
}

function MyITOpenSelectedRecord(record_type, task_type, id, srce, search_parm) {
  var search_text = getParmVal(search_parm);
  if (search_text == undefined) {
    search_text = '';
  }
  var search_filter = getParmVal('sysparm_task_filter');
  if (search_filter == undefined) {
    search_filter = '';
  }
  var sort_by = getParmVal('sysparm_sort_by');
  if (sort_by == undefined) {
    sort_by = '';
  }
  var sort_type = getParmVal('sysparm_sort_type');
  if (sort_type == undefined) {
    sort_type = '';
  }
  var url = "/Portal";
  if (record_type == 'task') {
    url += "/task_detail.do?sysparm_document_key=" + task_type + "," + id + "&sysparm_source_page=" + srce;
    if (search_filter != '') {
      url += "&sysparm_task_filter=" + search_filter;
    }
  } else if (record_type == 'approval') {
    url += "/approval_detail.do?sysparm_document_key=sysapproval_approver," + id + "&sysparm_source_page=" + srce;
  }
  if (search_text != '') {
    url += "&" + search_parm + "=" + search_text;
  }
  if (sort_by != '') {
    url += "&sysparm_sort_by=" + sort_by;
  }
  if (sort_type != '') {
    url += "&sysparm_sort_type=" + sort_type;
  }
  url += "&sysparm_view=ess";
  location.href = url;
  return false;
}

function MyITSaveCurrentRecord() {
  var docKey = getParmVal('sysparm_document_key');
  var task_table = docKey.split(",")[0];
  var task_id = docKey.split(",")[1];
  var use_query = "/nav_to.do?uri=" + task_table + ".do?";
  use_query += "sys_id=" + task_id;
  use_query += "%26PDF%26sysparm_view=ess";
  var w = window.open(use_query, "Print", "width=500, height=100");
}

function MyITPrintCurrentTickets() {
  var sort_by = getParmVal('sysparm_sort_by');
  var sort_type = getParmVal('sysparm_sort_type');
  var search_text = getParmVal('sysparm_search_tickets');
  var search_filter = getParmVal('sysparm_task_filter');
  if (search_filter == undefined) {
    search_filter = '';
  }
  if (sort_type == undefined) {
    sort_type = '';
  }
  if (sort_by == undefined) {
    sort_by = '';
  }
  if (search_text == undefined) {
    search_text = '';
  }
  var task_id = g_user.userID;
  var use_query = 'u_requestor=' + task_id + '^ORu_affected_contact=' + task_id + '^active=true^state<7^sys_class_name!=sc_req_item';
  if (search_text != '') {
    use_query += "^123TEXTQUERY321=" + search_text;
  }
  if (search_filter != '') {
    use_query += "^sys_class_name=" + search_filter;
  }
  if (sort_type == 'asc' && sort_by != '') {
    use_query += "^ORDERBY" + sort_by;
  } else if (sort_type == 'desc' && sort_by != '') {
    use_query += "^ORDERBYDESC" + sort_by;
  } else {
    use_query += "^ORDERBYnumber";
  }
  var ajax = new GlideAjax('u_MyIT_PrintTicketsUtil');
  ajax.addParam('sysparm_name', 'printTickets');
  ajax.addParam('sysparm_task_id', task_id);
  ajax.addParam('sysparm_use_query', use_query);
  ajax.getXML(doSomething);

  function doSomething(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    var w = window.open("", "_blank", "scrollbars=yes,width=1024,height=960");
    w.document.write(answer);
    setTimeout(function() {
      w.document.close();
      w.document.title = "My Current Tickets";
      w.print();
    }, 1500);
  }
}

function MyITPrintHistoricalTickets() {
  var sort_by = getParmVal('sysparm_sort_by');
  var sort_type = getParmVal('sysparm_sort_type');
  var search_text = getParmVal('sysparm_search_ticket_hist');
  var search_filter = getParmVal('sysparm_task_filter');
  if (search_filter == undefined) {
    search_filter = '';
  }
  if (sort_type == undefined) {
    sort_type = '';
  }
  if (sort_by == undefined) {
    sort_by = '';
  }
  if (search_text == undefined) {
    search_text = '';
  }
  var task_id = g_user.userID;
  var use_query = 'u_requestor=' + task_id + '^ORu_affected_contact=' + task_id + '^active=false^state=7^sys_class_name!=sc_req_item';
  if (search_text != '') {
    use_query += "^123TEXTQUERY321=" + search_text;
  }
  if (search_filter != '') {
    use_query += "^sys_class_name=" + search_filter;
  }
  if (sort_type == 'asc' && sort_by != '') {
    use_query += "^ORDERBY" + sort_by;
  } else if (sort_type == 'desc' && sort_by != '') {
    use_query += "^ORDERBYDESC" + sort_by;
  } else {
    use_query += "^ORDERBYnumber";
  }
  var ajax = new GlideAjax('u_MyIT_PrintTicketsUtil');
  ajax.addParam('sysparm_name', 'printTickets');
  ajax.addParam('sysparm_task_id', task_id);
  ajax.addParam('sysparm_use_query', use_query);
  ajax.getXML(doSomething);

  function doSomething(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    var w = window.open("", "_blank", "scrollbars=yes,width=1024,height=960");
    w.document.write(answer);
    setTimeout(function() {
      w.document.close();
      w.document.title = "My Ticket History";
      w.print();
    }, 1500);
  }
}

function MyITPrintCurrentApprovals() {
  var sort_by = getParmVal('sysparm_sort_by');
  var sort_type = getParmVal('sysparm_sort_type');
  var search_text = getParmVal('sysparm_search_approval');
  if (sort_type == undefined) {
    sort_type = '';
  }
  if (sort_by == undefined) {
    sort_by = '';
  }
  if (search_text == undefined) {
    search_text = '';
  }
  var task_id = g_user.userID;
  var use_query = 'approver=' + task_id + '^sysapprovalISNOTEMPTY^state=requested';
  if (search_text != '') {
    use_query += "^sysapproval.u_componentLIKE" + search_text;
    use_query += "^ORsysapproval.short_descriptionLIKE" + search_text;
    use_query += "^ORsysapproval.descriptionLIKE" + search_text;
    use_query += "^ORsysapproval.u_requestorLIKE" + search_text;
    use_query += "^ORsysapproval.u_affected_contactLIKE" + search_text;
  }
  if (sort_type == 'asc' && sort_by != '') {
    use_query += "^ORDERBY" + sort_by;
  } else if (sort_type == 'desc' && sort_by != '') {
    use_query += "^ORDERBYDESC" + sort_by;
  } else {
    use_query += "^ORDERBYsysapproval";
  }
  var ajax = new GlideAjax('u_MyIT_PrintTicketsUtil');
  ajax.addParam('sysparm_name', 'printApprovals');
  ajax.addParam('sysparm_task_id', task_id);
  ajax.addParam('sysparm_use_query', use_query);
  ajax.getXML(doSomething);

  function doSomething(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    var w = window.open("", "_blank", "scrollbars=yes,width=1024,height=960");
    w.document.write(answer);
    setTimeout(function() {
      w.document.close();
      w.document.title = "My Current Approvals";
      w.print();
    }, 1500);
  }
}

function MyITPrintApprovalHistory() {
  var sort_by = getParmVal('sysparm_sort_by');
  var sort_type = getParmVal('sysparm_sort_type');
  var search_text = getParmVal('sysparm_search_approval_hist');
  if (sort_type == undefined) {
    sort_type = '';
  }
  if (sort_by == undefined) {
    sort_by = '';
  }
  if (search_text == undefined) {
    search_text = '';
  }
  var task_id = g_user.userID;
  var use_query = 'approver=' + task_id + '^sysapprovalISNOTEMPTY^state=approved^ORstate=rejected';
  if (search_text != '') {
    use_query += "^sysapproval.u_componentLIKE" + search_text;
    use_query += "^ORsysapproval.short_descriptionLIKE" + search_text;
    use_query += "^ORsysapproval.descriptionLIKE" + search_text;
    use_query += "^ORsysapproval.u_requestorLIKE" + search_text;
    use_query += "^ORsysapproval.u_affected_contactLIKE" + search_text;
  }
  if (sort_type == 'asc' && sort_by != '') {
    use_query += "^ORDERBY" + sort_by;
  } else if (sort_type == 'desc' && sort_by != '') {
    use_query += "^ORDERBYDESC" + sort_by;
  } else {
    use_query += "^ORDERBYsysapproval";
  }
  var ajax = new GlideAjax('u_MyIT_PrintTicketsUtil');
  ajax.addParam('sysparm_name', 'printApprovals');
  ajax.addParam('sysparm_task_id', task_id);
  ajax.addParam('sysparm_use_query', use_query);
  ajax.getXML(doSomething);

  function doSomething(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    var w = window.open("", "_blank", "scrollbars=yes,width=1024,height=960");
    w.document.write(answer);
    setTimeout(function() {
      w.document.close();
      w.document.title = "My Current Approvals";
      w.print();
    }, 1500);
  }
}

function MyITSaveCurrentTickets(ext) {
  var sort_by = getParmVal('sysparm_sort_by');
  var sort_type = getParmVal('sysparm_sort_type');
  var search_text = getParmVal('sysparm_search_tickets');
  var search_filter = getParmVal('sysparm_task_filter');
  if (search_filter == undefined) {
    search_filter = '';
  }
  if (sort_type == undefined) {
    sort_type = '';
  }
  if (sort_by == undefined) {
    sort_by = '';
  }
  if (search_text == undefined) {
    search_text = '';
  }
  var task_id = g_user.userID;
  var use_query = "/task_list.do?" + ext;
  use_query += "&sysparm_query=u_requestor%3D" + task_id + "%5EORu_affected_contact%3D" + task_id;
  use_query += "%5Eactive%3Dtrue";
  use_query += "%5Estate%3C7";
  use_query += "%5Esys_class_name!%3Dsc_req_item";
  if (search_text != '') {
    use_query += "%5E123TEXTQUERY321%3D" + search_text;
  }
  if (search_filter != '') {
    use_query += "%5Esys_class_name%3D" + search_filter;
  }
  if (sort_type == 'asc' && sort_by != '') {
    use_query += "%5EORDERBY" + sort_by;
  } else if (sort_type == 'desc' && sort_by != '') {
    use_query += "%5EORDERBYDESC" + sort_by;
  } else {
    use_query += "%5EORDERBYnumber";
  }
  use_query += "&sysparm_view=ess";
  window.open(use_query, "_blank");
}

function MyITSaveHistoricalTickets(ext) {
  var sort_by = getParmVal('sysparm_sort_by');
  var sort_type = getParmVal('sysparm_sort_type');
  var search_text = getParmVal('sysparm_search_ticket_hist');
  var search_filter = getParmVal('sysparm_task_filter');
  if (search_filter == undefined) {
    search_filter = '';
  }
  if (sort_type == undefined) {
    sort_type = '';
  }
  if (sort_by == undefined) {
    sort_by = '';
  }
  if (search_text == undefined) {
    search_text = '';
  }
  var task_id = g_user.userID;
  var use_query = "/task_list.do?" + ext;
  use_query += "&sysparm_query=u_requestor%3D" + task_id + "%5EORu_affected_contact%3D" + task_id;
  use_query += "%5Estate%3D7";
  use_query += "%5Esys_class_name!%3Dsc_req_item";
  if (search_text != '') {
    use_query += "%5E123TEXTQUERY321%3D" + search_text;
  }
  if (search_filter != '') {
    use_query += "%5Esys_class_name%3D" + search_filter;
  }
  if (sort_type == 'asc' && sort_by != '') {
    use_query += "%5EORDERBY" + sort_by;
  } else if (sort_type == 'desc' && sort_by != '') {
    use_query += "%5EORDERBYDESC" + sort_by;
  } else {
    use_query += "%5EORDERBYnumber";
  }
  use_query += "&sysparm_view=ess";
  window.open(use_query, "_blank");
}

function MyITSaveCurrentApprovals(ext) {
  var sort_by = getParmVal('sysparm_sort_by');
  var sort_type = getParmVal('sysparm_sort_type');
  var search_text = getParmVal('sysparm_search_approval');
  if (sort_type == undefined) {
    sort_type = '';
  }
  if (sort_by == undefined) {
    sort_by = '';
  }
  if (search_text == undefined) {
    search_text = '';
  }
  var task_id = g_user.userID;
  var use_query = "/sysapproval_approver_list.do?" + ext;
  use_query += "&sysparm_query=approver%3D" + task_id;
  use_query += "%5EsysapprovalISNOTEMPTY";
  use_query += "%5Estate%3Drequested";
  if (search_text != '') {
    use_query += "%5Esysapproval.u_componentLIKE" + search_text;
    use_query += "%5EORsysapproval.short_descriptionLIKE" + search_text;
    use_query += "%5EORsysapproval.descriptionLIKE" + search_text;
    use_query += "%5EORsysapproval.u_requestorLIKE" + search_text;
    use_query += "%5EORsysapproval.u_affected_contactLIKE" + search_text;
  }
  if (sort_type == 'asc' && sort_by != '') {
    use_query += "%5EORDERBY" + sort_by;
  } else if (sort_type == 'desc' && sort_by != '') {
    use_query += "%5EORDERBYDESC" + sort_by;
  } else {
    use_query += "%5EORDERBYsysapproval";
  }
  use_query += "&sysparm_view=ess";
  window.open(use_query, "_blank");
}

function MyITSaveApprovalHistory(ext) {
  var sort_by = getParmVal('sysparm_sort_by');
  var sort_type = getParmVal('sysparm_sort_type');
  var search_text = getParmVal('sysparm_search_approval_hist');
  if (sort_type == undefined) {
    sort_type = '';
  }
  if (sort_by == undefined) {
    sort_by = '';
  }
  if (search_text == undefined) {
    search_text = '';
  }
  var task_id = g_user.userID;
  var use_query = "/sysapproval_approver_list.do?" + ext;
  use_query += "&sysparm_query=approver%3D" + task_id;
  use_query += "%5EsysapprovalISNOTEMPTY";
  use_query += "%5Estate%3Dapproved%5EORstate%3Drejected";
  if (search_text != '') {
    use_query += "%5Esysapproval.u_componentLIKE" + search_text;
    use_query += "%5EORsysapproval.short_descriptionLIKE" + search_text;
    use_query += "%5EORsysapproval.descriptionLIKE" + search_text;
    use_query += "%5EORsysapproval.u_requestorLIKE" + search_text;
    use_query += "%5EORsysapproval.u_affected_contactLIKE" + search_text;
  }
  if (sort_type == 'asc' && sort_by != '') {
    use_query += "%5EORDERBY" + sort_by;
  } else if (sort_type == 'desc' && sort_by != '') {
    use_query += "%5EORDERBYDESC" + sort_by;
  } else {
    use_query += "%5EORDERBYsysapproval";
  }
  use_query += "&sysparm_view=ess";
  window.open(use_query, "_blank");
}

function MyITApproveTask(number, task_id) {
  var ajax = new GlideAjax('u_MyIT_PrintTicketsUtil');
  ajax.addParam('sysparm_name', 'approveTask');
  ajax.addParam('sysparm_task_id', task_id);
  ajax.addParam('sysparm_number', number);
  ajax.getXML(doSomething);

  function doSomething(response) {
    var urlPage = response.responseXML.documentElement.getAttribute("answer");
    window.open(urlPage, '_self', false);
  }
}

function MyITDeclineTask(number, task_id) {
  var ajax = new GlideAjax('u_MyIT_PrintTicketsUtil');
  ajax.addParam('sysparm_name', 'declineTask');
  ajax.addParam('sysparm_task_id', task_id);
  ajax.addParam('sysparm_number', number);
  ajax.getXML(doSomething);

  function doSomething(response) {
    var urlPage = response.responseXML.documentElement.getAttribute("answer");
    window.open(urlPage, '_self', false);
  }
}

function MyITHideSearchResult(showHide, switchText) {
  var ele = document.getElementById(showHide);
  var text = document.getElementById(switchText);
  if (ele.style.display == "block") {
    ele.style.display = "none";
    text.innerHTML = "<i class='fa fa-plus-square' style='font-size:30px;color:#FFFFFF'></i>";
  } else {
    ele.style.display = "block";
    text.innerHTML = "<i class='fa fa-minus-square' style='font-size:30px;color:#FFFFFF'></i>";
  }
}

function MyITPrintArticle(kb_id, kb_number) {
  var kb_text;
  var prn = true;
  var kbRecText = new GlideRecord('kb_knowledge');
  kbRecText.addQuery('sys_id', kb_id);
  kbRecText.query();
  while (kbRecText.next()) {
    kb_text = kbRecText.text;
  }
  if (kb_text == '' || kb_text == undefined) {
    prn = false;
  }
  if (prn == true) {
    var w_1 = window.open("", "_blank", "scrollbars=yes");
    w_1.document.write(kb_text);
    setTimeout(function() {
      w_1.document.close();
      w_1.document.title = kb_number;
      w_1.print();
    }, 1500);
  } else {
    var url = '/kb_view.do?sysparm_article=' + kb_number;
    var w_2 = window.open(url, "_blank", "scrollbars=yes");
    setTimeout(function() {
      w_2.document.close();
      w_2.document.title = kb_number;
      w_2.print();
    }, 1500);
  }
}

function MyITEmailArticle(kb_id, kb_number) {
  var emailAddress = '';
  var emailsubject = 'Western Sydney University: ' + kb_number;
  var domain = 'uws';
  var url_instance = window.location.toString();
  if (url_instance.indexOf('uwsdev.service-now.com') >= 0) {
    domain = 'uwsdev';
  } else if (url_instance.indexOf('uwstest.service-now.com') >= 0) {
    domain = 'uwstest';
  } else if (url_instance.indexOf('uwstraining.service-now.com') >= 0) {
    domain = 'uwstraining';
  }
  var emailBody = 'https://' + domain + '.service-now.com/kb_view.do?sysparm_article=' + kb_number;
  window.location = "mailto:" + emailAddress + "?Content-type=text/html&subject=" + emailsubject + "&body=" + emailBody;
}

function getParmVal(name) {
  var url = document.URL.parseQuery();
  if (url[name]) {
    return decodeURI(url[name]);
  } else {
    return;
  }
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
/*! RESOURCE: (UWS) Force cms site if logged in */
(function() {
  addLoadEvent(function() {
    var userName = g_user.userName;
    var url = window.location.toString();
    if (url.search("Portal_pub") > -1 && userName != 'guest') {
      window.location = '/Portal/home.do';
    }
  });
})();
/*! RESOURCE: (Keysite) JQuery Easing 1.3 */
jQuery.easing.jswing = jQuery.easing.swing;
jQuery.extend(jQuery.easing, {
  def: "easeOutQuad",
  swing: function(e, f, a, h, g) {
    return jQuery.easing[jQuery.easing.def](e, f, a, h, g)
  },
  easeInQuad: function(e, f, a, h, g) {
    return h * (f /= g) * f + a
  },
  easeOutQuad: function(e, f, a, h, g) {
    return -h * (f /= g) * (f - 2) + a
  },
  easeInOutQuad: function(e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return h / 2 * f * f + a
    }
    return -h / 2 * ((--f) * (f - 2) - 1) + a
  },
  easeInCubic: function(e, f, a, h, g) {
    return h * (f /= g) * f * f + a
  },
  easeOutCubic: function(e, f, a, h, g) {
    return h * ((f = f / g - 1) * f * f + 1) + a
  },
  easeInOutCubic: function(e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return h / 2 * f * f * f + a
    }
    return h / 2 * ((f -= 2) * f * f + 2) + a
  },
  easeInQuart: function(e, f, a, h, g) {
    return h * (f /= g) * f * f * f + a
  },
  easeOutQuart: function(e, f, a, h, g) {
    return -h * ((f = f / g - 1) * f * f * f - 1) + a
  },
  easeInOutQuart: function(e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return h / 2 * f * f * f * f + a
    }
    return -h / 2 * ((f -= 2) * f * f * f - 2) + a
  },
  easeInQuint: function(e, f, a, h, g) {
    return h * (f /= g) * f * f * f * f + a
  },
  easeOutQuint: function(e, f, a, h, g) {
    return h * ((f = f / g - 1) * f * f * f * f + 1) + a
  },
  easeInOutQuint: function(e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return h / 2 * f * f * f * f * f + a
    }
    return h / 2 * ((f -= 2) * f * f * f * f + 2) + a
  },
  easeInSine: function(e, f, a, h, g) {
    return -h * Math.cos(f / g * (Math.PI / 2)) + h + a
  },
  easeOutSine: function(e, f, a, h, g) {
    return h * Math.sin(f / g * (Math.PI / 2)) + a
  },
  easeInOutSine: function(e, f, a, h, g) {
    return -h / 2 * (Math.cos(Math.PI * f / g) - 1) + a
  },
  easeInExpo: function(e, f, a, h, g) {
    return (f == 0) ? a : h * Math.pow(2, 10 * (f / g - 1)) + a
  },
  easeOutExpo: function(e, f, a, h, g) {
    return (f == g) ? a + h : h * (-Math.pow(2, -10 * f / g) + 1) + a
  },
  easeInOutExpo: function(e, f, a, h, g) {
    if (f == 0) {
      return a
    }
    if (f == g) {
      return a + h
    }
    if ((f /= g / 2) < 1) {
      return h / 2 * Math.pow(2, 10 * (f - 1)) + a
    }
    return h / 2 * (-Math.pow(2, -10 * --f) + 2) + a
  },
  easeInCirc: function(e, f, a, h, g) {
    return -h * (Math.sqrt(1 - (f /= g) * f) - 1) + a
  },
  easeOutCirc: function(e, f, a, h, g) {
    return h * Math.sqrt(1 - (f = f / g - 1) * f) + a
  },
  easeInOutCirc: function(e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return -h / 2 * (Math.sqrt(1 - f * f) - 1) + a
    }
    return h / 2 * (Math.sqrt(1 - (f -= 2) * f) + 1) + a
  },
  easeInElastic: function(f, h, e, l, k) {
    var i = 1.70158;
    var j = 0;
    var g = l;
    if (h == 0) {
      return e
    }
    if ((h /= k) == 1) {
      return e + l
    }
    if (!j) {
      j = k * 0.3
    }
    if (g < Math.abs(l)) {
      g = l;
      var i = j / 4
    } else {
      var i = j / (2 * Math.PI) * Math.asin(l / g)
    }
    return -(g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e
  },
  easeOutElastic: function(f, h, e, l, k) {
    var i = 1.70158;
    var j = 0;
    var g = l;
    if (h == 0) {
      return e
    }
    if ((h /= k) == 1) {
      return e + l
    }
    if (!j) {
      j = k * 0.3
    }
    if (g < Math.abs(l)) {
      g = l;
      var i = j / 4
    } else {
      var i = j / (2 * Math.PI) * Math.asin(l / g)
    }
    return g * Math.pow(2, -10 * h) * Math.sin((h * k - i) * (2 * Math.PI) / j) + l + e
  },
  easeInOutElastic: function(f, h, e, l, k) {
    var i = 1.70158;
    var j = 0;
    var g = l;
    if (h == 0) {
      return e
    }
    if ((h /= k / 2) == 2) {
      return e + l
    }
    if (!j) {
      j = k * (0.3 * 1.5)
    }
    if (g < Math.abs(l)) {
      g = l;
      var i = j / 4
    } else {
      var i = j / (2 * Math.PI) * Math.asin(l / g)
    }
    if (h < 1) {
      return -0.5 * (g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e
    }
    return g * Math.pow(2, -10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j) * 0.5 + l + e
  },
  easeInBack: function(e, f, a, i, h, g) {
    if (g == undefined) {
      g = 1.70158
    }
    return i * (f /= h) * f * ((g + 1) * f - g) + a
  },
  easeOutBack: function(e, f, a, i, h, g) {
    if (g == undefined) {
      g = 1.70158
    }
    return i * ((f = f / h - 1) * f * ((g + 1) * f + g) + 1) + a
  },
  easeInOutBack: function(e, f, a, i, h, g) {
    if (g == undefined) {
      g = 1.70158
    }
    if ((f /= h / 2) < 1) {
      return i / 2 * (f * f * (((g *= (1.525)) + 1) * f - g)) + a
    }
    return i / 2 * ((f -= 2) * f * (((g *= (1.525)) + 1) * f + g) + 2) + a
  },
  easeInBounce: function(e, f, a, h, g) {
    return h - jQuery.easing.easeOutBounce(e, g - f, 0, h, g) + a
  },
  easeOutBounce: function(e, f, a, h, g) {
    if ((f /= g) < (1 / 2.75)) {
      return h * (7.5625 * f * f) + a
    } else {
      if (f < (2 / 2.75)) {
        return h * (7.5625 * (f -= (1.5 / 2.75)) * f + 0.75) + a
      } else {
        if (f < (2.5 / 2.75)) {
          return h * (7.5625 * (f -= (2.25 / 2.75)) * f + 0.9375) + a
        } else {
          return h * (7.5625 * (f -= (2.625 / 2.75)) * f + 0.984375) + a
        }
      }
    }
  },
  easeInOutBounce: function(e, f, a, h, g) {
    if (f < g / 2) {
      return jQuery.easing.easeInBounce(e, f * 2, 0, h, g) * 0.5 + a
    }
    return jQuery.easing.easeOutBounce(e, f * 2 - g, 0, h, g) * 0.5 + h * 0.5 + a
  }
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
/*! RESOURCE: (UWS) MyIT hide feedback header */
(function() {
  addLoadEvent(function() {
    var header = document.getElementsByClassName('header sc_header');
    var url = window.location.toString();
    if (url.search("kb_article") > -1) {
      for (i = 0; i != header.length; i++) {
        header[i].hide();
      }
    }
  });
})();
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
/*! RESOURCE: (UWS) hide chat on Portal on iPad */
document.observe("dom:loaded", function() {
  g_afterPageLoadedFunctions.push(hideChatOnIpad);
});

function hideChatOnIpad() {
  try {
    if (window.location.href.indexOf('Portal') > 0 && navigator.userAgent.match(/iPad/i)) {
      var chatElementCollection = document.getElementsByClassName("chat_btn");
      for (i = 0, len = chatElementCollection.length; i < len; ++i) {
        chatElementCollection[i].style.display = "none";
      }
    }
  } catch (e) {}
}
/*! RESOURCE: KBPB Utilities */
function setVIP(tableName, fieldName, isVIP) {
  var fieldLabel = $('label.' + tableName + '.' + fieldName);
  var field = $('sys_display.' + tableName + '.' + fieldName);
  if (!fieldLabel || !field) {
    return;
  }
  if (isVIP == true) {
    fieldLabel.setStyle({
      backgroundImage: "url(images/icons/vip.gif)",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "95% 55%"
    });
    field.setStyle({
      color: "red"
    });
  } else {
    fieldLabel.setStyle({
      backgroundImage: ""
    });
    field.setStyle({
      color: ""
    });
  }
}

function UWSsetInactive(tableName, fieldName, isInactive) {
  var fieldLabel = $('label.' + tableName + '.' + fieldName);
  var field = $('sys_display.' + tableName + '.' + fieldName);
  if (!fieldLabel || !field) {
    return;
  }
  if (isInactive == true) {
    field.setStyle({
      backgroundColor: "yellow"
    });
  } else {
    field.setStyle({
      backgroundColor: ""
    });
  }
}

function UWSsetemailnil(tableName, fieldName, isEmailnil) {
  var fieldLabel = $('label.' + tableName + '.' + fieldName);
  var field = $('sys_display.' + tableName + '.' + fieldName);
  if (!fieldLabel || !field) {
    return;
  }
  if (isEmailnil == true) {
    field.setStyle({
      backgroundColor: "yellowgreen"
    });
  } else {
    field.setStyle({
      backgroundColor: ""
    });
  }
}
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
/*! RESOURCE: PmClientDateAndDurationHandler */
var PmClientDateAndDurationHandler = Class.create();
PmClientDateAndDurationHandler.prototype = {
  initialize: function(_gForm) {
    this._gForm = _gForm;
  },
  showErrorMessage: function(column) {
    jslog("Into PmClientDateAndDurationHandler.showErrorMessage -> " + column);
    if (!column) {
      this._gForm.addErrorMessage("Enter a valid date");
    } else {
      try {
        this._gForm.showFieldMsg(column, 'Enter a valid date', 'error');
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