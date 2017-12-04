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
/*! RESOURCE: fruJAX */
function fruJAX(table, sys_id, array_of_fields, callback) {
  if (Object.prototype.toString.call(table) !== '[object String]')
    throw Error('Arg "table" must be a String');
  if (Object.prototype.toString.call(sys_id) !== '[object String]')
    throw Error('Arg "sys_id" must be a String');
  if (Object.prototype.toString.call(array_of_fields) !== '[object Array]')
    throw Error('Arg "array_of_fields" must be an Array');
  if (Object.prototype.toString.call(callback) !== '[object Function]')
    throw Error('Arg "callback" must be a Function');
  var ga = new GlideAjax('FruJAX');
  ga.addParam('sysparm_name', 'getFieldsForIdOnTable');
  ga.addParam('sysparm_table', table);
  ga.addParam('sysparm_sys_id', sys_id);
  ga.addParam('sysparm_fields', JSON.stringify(array_of_fields));
  ga.getXMLAnswer(function parseAnswer(answer) {
    callback(JSON.parse(answer));
  });
}
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
/*! RESOURCE: NikeNowHelper */
if (typeof NikeNowHelper != "object") {
  var NikeNowHelper = {
    setItemDescription: function(desc_html, catalog_id) {
      jQuery('#' + catalog_id + ' .guide-item-description').html(desc_html);
    },
    setImage: function(img_src, catalog_id) {
      jQuery('#' + catalog_id + ' .guide-item-image').attr('src', img_src);
    },
    setStandaloneImage: function(img_src, catalog_id) {
      jQuery('#' + catalog_id + '.catalog-item-image').attr('src', img_src);
    },
    setUserLabel: function(user_id, variable_id) {
      var my_variable = jQuery('#' + variable_id);
      if (my_variable.length == 0) {
        return;
      }
      var nnhAjax = new GlideAjax('nnhAjax');
      nnhAjax.addParam('sysparm_name', 'checkSpecialUser');
      nnhAjax.addParam('sysparm_user_id', user_id);
      nnhAjax.getXML(function(response) {
        var data = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
        var count_role = 0;
        my_variable.find('.select2-choice').css('color', '');
        my_variable.find('.field-label img').remove();
        if (data.u_sme == 'true' && data.vip == 'false' && data.u_net == 'false') {
          my_variable.find('.select2-choice').css('color', '#0c9ef1');
          my_variable.find('.field-label').prepend("<img src='new_sme.jpg' style='height:20px;vertical-align:top;margin-right:5px;' />");
          count_role++;
        }
        if (data.vip == 'true' && data.u_net == 'false') {
          my_variable.find('.select2-choice').css('color', '#27a700');
          my_variable.find('.field-label').prepend("<img src='new_vip.jpg' style='height:20px;vertical-align:top;margin-right:5px;' />");
          count_role++;
        }
        if (data.u_net == 'true') {
          my_variable.find('.select2-choice').css('color', '#f78e30');
          my_variable.find('.field-label').prepend("<img src='new_net.jpg' style='height:20px;vertical-align:top;margin-right:5px;' />");
          count_role++;
        }
        if (count_role == 0) {
          my_variable.find('.select2-choice').css('color', '');
          my_variable.find('.field-label img').remove();
        }
      });
    },
    setHtml: function(id, html) {
      jQuery("#" + id).html(html);
    },
    onPortal: function() {
      var pathname = window.location.pathname;
      if (pathname.indexOf('nikenow') != -1) {
        return true;
      }
      return false;
    },
    timeout: function(callback, ms) {
      window.setTimeout(callback, ms);
    },
    hasCartItems: function() {
      if (!window || !window.cart_item_count) {
        return false;
      }
      if (window.cart_item_count > 0) {
        return true;
      }
      return false;
    },
    redirectUrl: function(url) {
      alert('yo yo');
      window.location = url;
    },
    showDeviceDetails: function(product_type, location, order_guide, variable_id, company) {
      var gaDevices = new GlideAjax('hardwareCatalogDeviceAJAX');
      gaDevices.addParam('sysparm_name', 'getDevice');
      gaDevices.addParam('sysparm_product_type', product_type);
      gaDevices.addParam('sysparm_location', location);
      gaDevices.addParam('sysparm_order_guide', order_guide);
      gaDevices.addParam('sysparm_company', company);
      gaDevices.getXML(function(response) {
        var html;
        var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
        for (var i = 0; i < answer.length; i++) {
          var sys_id = answer[i].sys_id;
          var title = answer[i].title;
          var description = answer[i].description;
          var image = answer[i].image;
          var model = answer[i].modelid;
          html = '<div>' + title + '</br>' +
            '<hr />' +
            '<table>' +
            '<tr>' +
            '<td valign="top"><img src="' + image + '" width="150" /> </td>' +
            '<td>' +
            description +
            '</td>' +
            '</tr>' +
            '</table>';
        }
        if ($NNH.onPortal() == true) {
          jQuery("#" + variable_id).html(html);
        } else {
          var display = gel('label_IO:' + variable_id);
          display.innerHTML = html;
        }
      });
    }
  };
  var $NNH = NikeNowHelper;
}
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
        max_width: parseInt("400", 10) || 300,
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
      var tag = 'glide-jakarta-05-03-2017__patch6-11-14-2017';
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
/*! RESOURCE: NikeClient */
if (typeof NikeClient != "object") {
  var NikeClient = {
    $stash: {},
    onPortal: function() {
      var pathname = window.location.pathname;
      if (pathname.indexOf('nikenow') != -1) {
        return true;
      }
      return false;
    },
    loadUIScript: function(name, callback_onload) {
      var script = document.createElement('script');
      script.src = '/' + name.replace(/(^\/+)|((\.jsdbx)$)/g, '') + '.jsdbx?nocache=' + (Math.floor(Math.random() * 90000) + 10000).toString();
      script.onload = callback_onload;
      document.head.appendChild(script);
    },
    loadExternalScript: function(url, callback_onload) {
      var script = document.createElement('script');
      script.src = url + '?nocache=' + (Math.floor(Math.random() * 90000) + 10000).toString();
      script.onload = callback_onload;
      document.head.appendChild(script);
    },
    callScriptIncludeAsync: function(classname, method, callback, parameters) {
      var ga = new GlideAjax(classname);
      ga.addParam('sysparm_name', method);
      if (typeof parameters == "object") {
        Object.keys(parameters).forEach(function(prop) {
          ga.addParam('sysparm_' + prop, parameters[prop]);
        });
      }
      ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute('answer');
        callback(answer, response);
      });
    },
    callScriptInclude: function(classname, method, parameters) {
      if (this.onPortal() == true) {
        console.log('getXMLWait is not supported on the service portal.');
        return;
      }
      var ga = new GlideAjax(classname);
      ga.addParam('sysparm_name', method);
      if (typeof parameters == "object") {
        Object.keys(parameters).forEach(function(prop) {
          ga.addParam('sysparm_' + prop, parameters[prop]);
        });
      }
      ga.getXMLWait();
      return ga.getAnswer();
    },
    callServer: function(classname, method, parameters) {
      return this.callScriptInclude(classname, method, parameters);
    },
    callServerAsync: function(classname, method, callback, parameters) {
      this.callScriptIncludeAsync(classname, method, callback, parameters);
    },
    getURLHost: function() {
      var http = location.protocol;
      var slashes = http.concat("//");
      var host = slashes.concat(window.location.hostname);
      return host.trim();
    },
    getURLParameter: function(name) {
      var searchparam = null;
      if (location && location.search) {
        searchparam = location.search;
      } else if (this.location && this.location.search) {
        searchparam = this.location.search;
      }
      if (!searchparam) {
        return null;
      }
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(searchparam) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    },
    log: function(value) {
      var dateLocaleValue = new Date().toLocaleString();
      var style = "background: black; color: white; font-size: 13px; padding: 2px;";
      console.log("%c> Nike client log [" + dateLocaleValue + "]:", style);
      console.log(value);
    },
    sleep: function(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
          break;
        }
      }
    }
  };
  var $NC = NikeClient;
  if (String.prototype.curlyReplace == undefined) {
    String.prototype.curlyReplace = function(name, newValue) {
      return this.replace(new RegExp('\\{\\{' + name + '\\}\\}', 'g'), newValue);
    };
  }
  if (String.prototype.toUpperCaseWords == undefined) {
    String.prototype.toUpperCaseWords = function(lower_else) {
      var result = this;
      lower_else = lower_else == null ? false : lower_else;
      if (lower_else) {
        result.toLowerCase();
      }
      result = result.replace(/[^\s]+/g, function(word) {
        return word.replace(/^./, function(first) {
          return first.toUpperCase();
        });
      });
      return result;
    };
  }
  if (String.prototype.digitize == undefined) {
    String.prototype.digitize = function(digits) {
      var result = "";
      if (this.length < digits) {
        var count = digits - this.length;
        for (var i = 0; i < count; i++) {
          result += "0";
        }
      }
      result += this.toString().trim();
      return result;
    };
  }
}
/*! RESOURCE: CancelRecord */
function CancelRecord() {
  var fields = g_form.elements;
  var fieldcount = fields.length;
  var val = '';
  for (var i = 0; i < fieldcount; i++) {
    val = g_form.getValue(fields[i].fieldName);
    g_form.setMandatory("variables." + fields[i].fieldName, false);
  }
  var fields = g_form.getEditableFields();
  for (var x = 0; x < fields.length; x++) {
    g_form.setMandatory(fields[x], false);
  }
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
/*! RESOURCE: DisableEnableOption */
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
/*! RESOURCE: DateJs */
Date.CultureInfo = {
  name: "en-US",
  englishName: "English (United States)",
  nativeName: "English (United States)",
  dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  abbreviatedDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  shortestDayNames: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  firstLetterDayNames: ["S", "M", "T", "W", "T", "F", "S"],
  monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  abbreviatedMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  amDesignator: "AM",
  pmDesignator: "PM",
  firstDayOfWeek: 0,
  twoDigitYearMax: 2029,
  dateElementOrder: "mdy",
  formatPatterns: {
    shortDate: "M/d/yyyy",
    longDate: "dddd, MMMM dd, yyyy",
    shortTime: "h:mm tt",
    longTime: "h:mm:ss tt",
    fullDateTime: "dddd, MMMM dd, yyyy h:mm:ss tt",
    sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
    universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
    rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
    monthDay: "MMMM dd",
    yearMonth: "MMMM, yyyy"
  },
  regexPatterns: {
    jan: /^jan(uary)?/i,
    feb: /^feb(ruary)?/i,
    mar: /^mar(ch)?/i,
    apr: /^apr(il)?/i,
    may: /^may/i,
    jun: /^jun(e)?/i,
    jul: /^jul(y)?/i,
    aug: /^aug(ust)?/i,
    sep: /^sep(t(ember)?)?/i,
    oct: /^oct(ober)?/i,
    nov: /^nov(ember)?/i,
    dec: /^dec(ember)?/i,
    sun: /^su(n(day)?)?/i,
    mon: /^mo(n(day)?)?/i,
    tue: /^tu(e(s(day)?)?)?/i,
    wed: /^we(d(nesday)?)?/i,
    thu: /^th(u(r(s(day)?)?)?)?/i,
    fri: /^fr(i(day)?)?/i,
    sat: /^sa(t(urday)?)?/i,
    future: /^next/i,
    past: /^last|past|prev(ious)?/i,
    add: /^(\+|aft(er)?|from|hence)/i,
    subtract: /^(\-|bef(ore)?|ago)/i,
    yesterday: /^yes(terday)?/i,
    today: /^t(od(ay)?)?/i,
    tomorrow: /^tom(orrow)?/i,
    now: /^n(ow)?/i,
    millisecond: /^ms|milli(second)?s?/i,
    second: /^sec(ond)?s?/i,
    minute: /^mn|min(ute)?s?/i,
    hour: /^h(our)?s?/i,
    week: /^w(eek)?s?/i,
    month: /^m(onth)?s?/i,
    day: /^d(ay)?s?/i,
    year: /^y(ear)?s?/i,
    shortMeridian: /^(a|p)/i,
    longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
    timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt|utc)/i,
    ordinalSuffix: /^\s*(st|nd|rd|th)/i,
    timeContext: /^\s*(\:|a(?!u|p)|p)/i
  },
  timezones: [{
    name: "UTC",
    offset: "-000"
  }, {
    name: "GMT",
    offset: "-000"
  }, {
    name: "EST",
    offset: "-0500"
  }, {
    name: "EDT",
    offset: "-0400"
  }, {
    name: "CST",
    offset: "-0600"
  }, {
    name: "CDT",
    offset: "-0500"
  }, {
    name: "MST",
    offset: "-0700"
  }, {
    name: "MDT",
    offset: "-0600"
  }, {
    name: "PST",
    offset: "-0800"
  }, {
    name: "PDT",
    offset: "-0700"
  }]
};
(function() {
  var $D = Date,
    $P = $D.prototype,
    $C = $D.CultureInfo,
    p = function(s, l) {
      if (!l) {
        l = 2;
      }
      return ("000" + s).slice(l * -1);
    };
  $P.clearTime = function() {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
  };
  $P.setTimeToNow = function() {
    var n = new Date();
    this.setHours(n.getHours());
    this.setMinutes(n.getMinutes());
    this.setSeconds(n.getSeconds());
    this.setMilliseconds(n.getMilliseconds());
    return this;
  };
  $D.today = function() {
    return new Date().clearTime();
  };
  $D.compare = function(date1, date2) {
    if (isNaN(date1) || isNaN(date2)) {
      throw new Error(date1 + " - " + date2);
    } else if (date1 instanceof Date && date2 instanceof Date) {
      return (date1 < date2) ? -1 : (date1 > date2) ? 1 : 0;
    } else {
      throw new TypeError(date1 + " - " + date2);
    }
  };
  $D.equals = function(date1, date2) {
    return (date1.compareTo(date2) === 0);
  };
  $D.getDayNumberFromName = function(name) {
    var n = $C.dayNames,
      m = $C.abbreviatedDayNames,
      o = $C.shortestDayNames,
      s = name.toLowerCase();
    for (var i = 0; i < n.length; i++) {
      if (n[i].toLowerCase() == s || m[i].toLowerCase() == s || o[i].toLowerCase() == s) {
        return i;
      }
    }
    return -1;
  };
  $D.getMonthNumberFromName = function(name) {
    var n = $C.monthNames,
      m = $C.abbreviatedMonthNames,
      s = name.toLowerCase();
    for (var i = 0; i < n.length; i++) {
      if (n[i].toLowerCase() == s || m[i].toLowerCase() == s) {
        return i;
      }
    }
    return -1;
  };
  $D.isLeapYear = function(year) {
    return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
  };
  $D.getDaysInMonth = function(year, month) {
    return [31, ($D.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  };
  $D.getTimezoneAbbreviation = function(offset) {
    var z = $C.timezones,
      p;
    for (var i = 0; i < z.length; i++) {
      if (z[i].offset === offset) {
        return z[i].name;
      }
    }
    return null;
  };
  $D.getTimezoneOffset = function(name) {
    var z = $C.timezones,
      p;
    for (var i = 0; i < z.length; i++) {
      if (z[i].name === name.toUpperCase()) {
        return z[i].offset;
      }
    }
    return null;
  };
  $P.clone = function() {
    return new Date(this.getTime());
  };
  $P.compareTo = function(date) {
    return Date.compare(this, date);
  };
  $P.equals = function(date) {
    return Date.equals(this, date || new Date());
  };
  $P.between = function(start, end) {
    return this.getTime() >= start.getTime() && this.getTime() <= end.getTime();
  };
  $P.isAfter = function(date) {
    return this.compareTo(date || new Date()) === 1;
  };
  $P.isBefore = function(date) {
    return (this.compareTo(date || new Date()) === -1);
  };
  $P.isToday = function() {
    return this.isSameDay(new Date());
  };
  $P.isSameDay = function(date) {
    return this.clone().clearTime().equals(date.clone().clearTime());
  };
  $P.addMilliseconds = function(value) {
    this.setMilliseconds(this.getMilliseconds() + value);
    return this;
  };
  $P.addSeconds = function(value) {
    return this.addMilliseconds(value * 1000);
  };
  $P.addMinutes = function(value) {
    return this.addMilliseconds(value * 60000);
  };
  $P.addHours = function(value) {
    return this.addMilliseconds(value * 3600000);
  };
  $P.addDays = function(value) {
    this.setDate(this.getDate() + value);
    return this;
  };
  $P.addWeeks = function(value) {
    return this.addDays(value * 7);
  };
  $P.addMonths = function(value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, $D.getDaysInMonth(this.getFullYear(), this.getMonth())));
    return this;
  };
  $P.addYears = function(value) {
    return this.addMonths(value * 12);
  };
  $P.add = function(config) {
    if (typeof config == "number") {
      this._orient = config;
      return this;
    }
    var x = config;
    if (x.milliseconds) {
      this.addMilliseconds(x.milliseconds);
    }
    if (x.seconds) {
      this.addSeconds(x.seconds);
    }
    if (x.minutes) {
      this.addMinutes(x.minutes);
    }
    if (x.hours) {
      this.addHours(x.hours);
    }
    if (x.weeks) {
      this.addWeeks(x.weeks);
    }
    if (x.months) {
      this.addMonths(x.months);
    }
    if (x.years) {
      this.addYears(x.years);
    }
    if (x.days) {
      this.addDays(x.days);
    }
    return this;
  };
  var $y, $m, $d;
  $P.getWeek = function() {
    var a, b, c, d, e, f, g, n, s, w;
    $y = (!$y) ? this.getFullYear() : $y;
    $m = (!$m) ? this.getMonth() + 1 : $m;
    $d = (!$d) ? this.getDate() : $d;
    if ($m <= 2) {
      a = $y - 1;
      b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
      c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
      s = b - c;
      e = 0;
      f = $d - 1 + (31 * ($m - 1));
    } else {
      a = $y;
      b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
      c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
      s = b - c;
      e = s + 1;
      f = $d + ((153 * ($m - 3) + 2) / 5) + 58 + s;
    }
    g = (a + b) % 7;
    d = (f + g - e) % 7;
    n = (f + 3 - d) | 0;
    if (n < 0) {
      w = 53 - ((g - s) / 5 | 0);
    } else if (n > 364 + s) {
      w = 1;
    } else {
      w = (n / 7 | 0) + 1;
    }
    $y = $m = $d = null;
    return w;
  };
  $P.getISOWeek = function() {
    $y = this.getUTCFullYear();
    $m = this.getUTCMonth() + 1;
    $d = this.getUTCDate();
    return p(this.getWeek());
  };
  $P.setWeek = function(n) {
    return this.moveToDayOfWeek(1).addWeeks(n - this.getWeek());
  };
  $D._validate = function(n, min, max, name) {
    if (typeof n == "undefined") {
      return false;
    } else if (typeof n != "number") {
      throw new TypeError(n + " is not a Number.");
    } else if (n < min || n > max) {
      throw new RangeError(n + " is not a valid value for " + name + ".");
    }
    return true;
  };
  $D.validateMillisecond = function(value) {
    return $D._validate(value, 0, 999, "millisecond");
  };
  $D.validateSecond = function(value) {
    return $D._validate(value, 0, 59, "second");
  };
  $D.validateMinute = function(value) {
    return $D._validate(value, 0, 59, "minute");
  };
  $D.validateHour = function(value) {
    return $D._validate(value, 0, 23, "hour");
  };
  $D.validateDay = function(value, year, month) {
    return $D._validate(value, 1, $D.getDaysInMonth(year, month), "day");
  };
  $D.validateMonth = function(value) {
    return $D._validate(value, 0, 11, "month");
  };
  $D.validateYear = function(value) {
    return $D._validate(value, 0, 9999, "year");
  };
  $P.set = function(config) {
    if ($D.validateMillisecond(config.millisecond)) {
      this.addMilliseconds(config.millisecond - this.getMilliseconds());
    }
    if ($D.validateSecond(config.second)) {
      this.addSeconds(config.second - this.getSeconds());
    }
    if ($D.validateMinute(config.minute)) {
      this.addMinutes(config.minute - this.getMinutes());
    }
    if ($D.validateHour(config.hour)) {
      this.addHours(config.hour - this.getHours());
    }
    if ($D.validateMonth(config.month)) {
      this.addMonths(config.month - this.getMonth());
    }
    if ($D.validateYear(config.year)) {
      this.addYears(config.year - this.getFullYear());
    }
    if ($D.validateDay(config.day, this.getFullYear(), this.getMonth())) {
      this.addDays(config.day - this.getDate());
    }
    if (config.timezone) {
      this.setTimezone(config.timezone);
    }
    if (config.timezoneOffset) {
      this.setTimezoneOffset(config.timezoneOffset);
    }
    if (config.week && $D._validate(config.week, 0, 53, "week")) {
      this.setWeek(config.week);
    }
    return this;
  };
  $P.moveToFirstDayOfMonth = function() {
    return this.set({
      day: 1
    });
  };
  $P.moveToLastDayOfMonth = function() {
    return this.set({
      day: $D.getDaysInMonth(this.getFullYear(), this.getMonth())
    });
  };
  $P.moveToNthOccurrence = function(dayOfWeek, occurrence) {
    var shift = 0;
    if (occurrence > 0) {
      shift = occurrence - 1;
    } else if (occurrence === -1) {
      this.moveToLastDayOfMonth();
      if (this.getDay() !== dayOfWeek) {
        this.moveToDayOfWeek(dayOfWeek, -1);
      }
      return this;
    }
    return this.moveToFirstDayOfMonth().addDays(-1).moveToDayOfWeek(dayOfWeek, +1).addWeeks(shift);
  };
  $P.moveToDayOfWeek = function(dayOfWeek, orient) {
    var diff = (dayOfWeek - this.getDay() + 7 * (orient || +1)) % 7;
    return this.addDays((diff === 0) ? diff += 7 * (orient || +1) : diff);
  };
  $P.moveToMonth = function(month, orient) {
    var diff = (month - this.getMonth() + 12 * (orient || +1)) % 12;
    return this.addMonths((diff === 0) ? diff += 12 * (orient || +1) : diff);
  };
  $P.getOrdinalNumber = function() {
    return Math.ceil((this.clone().clearTime() - new Date(this.getFullYear(), 0, 1)) / 86400000) + 1;
  };
  $P.getTimezone = function() {
    return $D.getTimezoneAbbreviation(this.getUTCOffset());
  };
  $P.setTimezoneOffset = function(offset) {
    var here = this.getTimezoneOffset(),
      there = Number(offset) * -6 / 10;
    return this.addMinutes(there - here);
  };
  $P.setTimezone = function(offset) {
    return this.setTimezoneOffset($D.getTimezoneOffset(offset));
  };
  $P.hasDaylightSavingTime = function() {
    return (Date.today().set({
      month: 0,
      day: 1
    }).getTimezoneOffset() !== Date.today().set({
      month: 6,
      day: 1
    }).getTimezoneOffset());
  };
  $P.isDaylightSavingTime = function() {
    return (this.hasDaylightSavingTime() && new Date().getTimezoneOffset() === Date.today().set({
      month: 6,
      day: 1
    }).getTimezoneOffset());
  };
  $P.getUTCOffset = function() {
    var n = this.getTimezoneOffset() * -10 / 6,
      r;
    if (n < 0) {
      r = (n - 10000).toString();
      return r.charAt(0) + r.substr(2);
    } else {
      r = (n + 10000).toString();
      return "+" + r.substr(1);
    }
  };
  $P.getElapsed = function(date) {
    return (date || new Date()) - this;
  };
  if (!$P.toISOString) {
    $P.toISOString = function() {
      function f(n) {
        return n < 10 ? '0' + n : n;
      }
      return '"' + this.getUTCFullYear() + '-' +
        f(this.getUTCMonth() + 1) + '-' +
        f(this.getUTCDate()) + 'T' +
        f(this.getUTCHours()) + ':' +
        f(this.getUTCMinutes()) + ':' +
        f(this.getUTCSeconds()) + 'Z"';
    };
  }
  $P._toString = $P.toString;
  $P.toString = function(format) {
    var x = this;
    if (format && format.length == 1) {
      var c = $C.formatPatterns;
      x.t = x.toString;
      switch (format) {
        case "d":
          return x.t(c.shortDate);
        case "D":
          return x.t(c.longDate);
        case "F":
          return x.t(c.fullDateTime);
        case "m":
          return x.t(c.monthDay);
        case "r":
          return x.t(c.rfc1123);
        case "s":
          return x.t(c.sortableDateTime);
        case "t":
          return x.t(c.shortTime);
        case "T":
          return x.t(c.longTime);
        case "u":
          return x.t(c.universalSortableDateTime);
        case "y":
          return x.t(c.yearMonth);
      }
    }
    var ord = function(n) {
      switch (n * 1) {
        case 1:
        case 21:
        case 31:
          return "st";
        case 2:
        case 22:
          return "nd";
        case 3:
        case 23:
          return "rd";
        default:
          return "th";
      }
    };
    return format ? format.replace(/(\\)?(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|S)/g, function(m) {
      if (m.charAt(0) === "\\") {
        return m.replace("\\", "");
      }
      x.h = x.getHours;
      switch (m) {
        case "hh":
          return p(x.h() < 13 ? (x.h() === 0 ? 12 : x.h()) : (x.h() - 12));
        case "h":
          return x.h() < 13 ? (x.h() === 0 ? 12 : x.h()) : (x.h() - 12);
        case "HH":
          return p(x.h());
        case "H":
          return x.h();
        case "mm":
          return p(x.getMinutes());
        case "m":
          return x.getMinutes();
        case "ss":
          return p(x.getSeconds());
        case "s":
          return x.getSeconds();
        case "yyyy":
          return p(x.getFullYear(), 4);
        case "yy":
          return p(x.getFullYear());
        case "dddd":
          return $C.dayNames[x.getDay()];
        case "ddd":
          return $C.abbreviatedDayNames[x.getDay()];
        case "dd":
          return p(x.getDate());
        case "d":
          return x.getDate();
        case "MMMM":
          return $C.monthNames[x.getMonth()];
        case "MMM":
          return $C.abbreviatedMonthNames[x.getMonth()];
        case "MM":
          return p((x.getMonth() + 1));
        case "M":
          return x.getMonth() + 1;
        case "t":
          return x.h() < 12 ? $C.amDesignator.substring(0, 1) : $C.pmDesignator.substring(0, 1);
        case "tt":
          return x.h() < 12 ? $C.amDesignator : $C.pmDesignator;
        case "S":
          return ord(x.getDate());
        default:
          return m;
      }
    }) : this._toString();
  };
}());
(function() {
  var $D = Date,
    $P = $D.prototype,
    $C = $D.CultureInfo,
    $N = Number.prototype;
  $P._orient = +1;
  $P._nth = null;
  $P._is = false;
  $P._same = false;
  $P._isSecond = false;
  $N._dateElement = "day";
  $P.next = function() {
    this._orient = +1;
    return this;
  };
  $D.next = function() {
    return $D.today().next();
  };
  $P.last = $P.prev = $P.previous = function() {
    this._orient = -1;
    return this;
  };
  $D.last = $D.prev = $D.previous = function() {
    return $D.today().last();
  };
  $P.is = function() {
    this._is = true;
    return this;
  };
  $P.same = function() {
    this._same = true;
    this._isSecond = false;
    return this;
  };
  $P.today = function() {
    return this.same().day();
  };
  $P.weekday = function() {
    if (this._is) {
      this._is = false;
      return (!this.is().sat() && !this.is().sun());
    }
    return false;
  };
  $P.at = function(time) {
    return (typeof time === "string") ? $D.parse(this.toString("d") + " " + time) : this.set(time);
  };
  $N.fromNow = $N.after = function(date) {
    var c = {};
    c[this._dateElement] = this;
    return ((!date) ? new Date() : date.clone()).add(c);
  };
  $N.ago = $N.before = function(date) {
    var c = {};
    c[this._dateElement] = this * -1;
    return ((!date) ? new Date() : date.clone()).add(c);
  };
  var dx = ("sunday monday tuesday wednesday thursday friday saturday").split(/\s/),
    mx = ("january february march april may june july august september october november december").split(/\s/),
    px = ("Millisecond Second Minute Hour Day Week Month Year").split(/\s/),
    pxf = ("Milliseconds Seconds Minutes Hours Date Week Month FullYear").split(/\s/),
    nth = ("final first second third fourth fifth").split(/\s/),
    de;
  $P.toObject = function() {
    var o = {};
    for (var i = 0; i < px.length; i++) {
      o[px[i].toLowerCase()] = this["get" + pxf[i]]();
    }
    return o;
  };
  $D.fromObject = function(config) {
    config.week = null;
    return Date.today().set(config);
  };
  var df = function(n) {
    return function() {
      if (this._is) {
        this._is = false;
        return this.getDay() == n;
      }
      if (this._nth !== null) {
        if (this._isSecond) {
          this.addSeconds(this._orient * -1);
        }
        this._isSecond = false;
        var ntemp = this._nth;
        this._nth = null;
        var temp = this.clone().moveToLastDayOfMonth();
        this.moveToNthOccurrence(n, ntemp);
        if (this > temp) {
          throw new RangeError($D.getDayName(n) + " does not occur " + ntemp + " times in the month of " + $D.getMonthName(temp.getMonth()) + " " + temp.getFullYear() + ".");
        }
        return this;
      }
      return this.moveToDayOfWeek(n, this._orient);
    };
  };
  var sdf = function(n) {
    return function() {
      var t = $D.today(),
        shift = n - t.getDay();
      if (n === 0 && $C.firstDayOfWeek === 1 && t.getDay() !== 0) {
        shift = shift + 7;
      }
      return t.addDays(shift);
    };
  };
  for (var i = 0; i < dx.length; i++) {
    $D[dx[i].toUpperCase()] = $D[dx[i].toUpperCase().substring(0, 3)] = i;
    $D[dx[i]] = $D[dx[i].substring(0, 3)] = sdf(i);
    $P[dx[i]] = $P[dx[i].substring(0, 3)] = df(i);
  }
  var mf = function(n) {
    return function() {
      if (this._is) {
        this._is = false;
        return this.getMonth() === n;
      }
      return this.moveToMonth(n, this._orient);
    };
  };
  var smf = function(n) {
    return function() {
      return $D.today().set({
        month: n,
        day: 1
      });
    };
  };
  for (var j = 0; j < mx.length; j++) {
    $D[mx[j].toUpperCase()] = $D[mx[j].toUpperCase().substring(0, 3)] = j;
    $D[mx[j]] = $D[mx[j].substring(0, 3)] = smf(j);
    $P[mx[j]] = $P[mx[j].substring(0, 3)] = mf(j);
  }
  var ef = function(j) {
    return function() {
      if (this._isSecond) {
        this._isSecond = false;
        return this;
      }
      if (this._same) {
        this._same = this._is = false;
        var o1 = this.toObject(),
          o2 = (arguments[0] || new Date()).toObject(),
          v = "",
          k = j.toLowerCase();
        for (var m = (px.length - 1); m > -1; m--) {
          v = px[m].toLowerCase();
          if (o1[v] != o2[v]) {
            return false;
          }
          if (k == v) {
            break;
          }
        }
        return true;
      }
      if (j.substring(j.length - 1) != "s") {
        j += "s";
      }
      return this["add" + j](this._orient);
    };
  };
  var nf = function(n) {
    return function() {
      this._dateElement = n;
      return this;
    };
  };
  for (var k = 0; k < px.length; k++) {
    de = px[k].toLowerCase();
    $P[de] = $P[de + "s"] = ef(px[k]);
    $N[de] = $N[de + "s"] = nf(de);
  }
  $P._ss = ef("Second");
  var nthfn = function(n) {
    return function(dayOfWeek) {
      if (this._same) {
        return this._ss(arguments[0]);
      }
      if (dayOfWeek || dayOfWeek === 0) {
        return this.moveToNthOccurrence(dayOfWeek, n);
      }
      this._nth = n;
      if (n === 2 && (dayOfWeek === undefined || dayOfWeek === null)) {
        this._isSecond = true;
        return this.addSeconds(this._orient);
      }
      return this;
    };
  };
  for (var l = 0; l < nth.length; l++) {
    $P[nth[l]] = (l === 0) ? nthfn(-1) : nthfn(l);
  }
}());
(function() {
  Date.Parsing = {
    Exception: function(s) {
      this.message = "Parse error at '" + s.substring(0, 10) + " ...'";
    }
  };
  var $P = Date.Parsing;
  var _ = $P.Operators = {
    rtoken: function(r) {
      return function(s) {
        var mx = s.match(r);
        if (mx) {
          return ([mx[0], s.substring(mx[0].length)]);
        } else {
          throw new $P.Exception(s);
        }
      };
    },
    token: function(s) {
      return function(s) {
        return _.rtoken(new RegExp("^\s*" + s + "\s*"))(s);
      };
    },
    stoken: function(s) {
      return _.rtoken(new RegExp("^" + s));
    },
    until: function(p) {
      return function(s) {
        var qx = [],
          rx = null;
        while (s.length) {
          try {
            rx = p.call(this, s);
          } catch (e) {
            qx.push(rx[0]);
            s = rx[1];
            continue;
          }
          break;
        }
        return [qx, s];
      };
    },
    many: function(p) {
      return function(s) {
        var rx = [],
          r = null;
        while (s.length) {
          try {
            r = p.call(this, s);
          } catch (e) {
            return [rx, s];
          }
          rx.push(r[0]);
          s = r[1];
        }
        return [rx, s];
      };
    },
    optional: function(p) {
      return function(s) {
        var r = null;
        try {
          r = p.call(this, s);
        } catch (e) {
          return [null, s];
        }
        return [r[0], r[1]];
      };
    },
    not: function(p) {
      return function(s) {
        try {
          p.call(this, s);
        } catch (e) {
          return [null, s];
        }
        throw new $P.Exception(s);
      };
    },
    ignore: function(p) {
      return p ? function(s) {
        var r = null;
        r = p.call(this, s);
        return [null, r[1]];
      } : null;
    },
    product: function() {
      var px = arguments[0],
        qx = Array.prototype.slice.call(arguments, 1),
        rx = [];
      for (var i = 0; i < px.length; i++) {
        rx.push(_.each(px[i], qx));
      }
      return rx;
    },
    cache: function(rule) {
      var cache = {},
        r = null;
      return function(s) {
        try {
          r = cache[s] = (cache[s] || rule.call(this, s));
        } catch (e) {
          r = cache[s] = e;
        }
        if (r instanceof $P.Exception) {
          throw r;
        } else {
          return r;
        }
      };
    },
    any: function() {
      var px = arguments;
      return function(s) {
        var r = null;
        for (var i = 0; i < px.length; i++) {
          if (px[i] == null) {
            continue;
          }
          try {
            r = (px[i].call(this, s));
          } catch (e) {
            r = null;
          }
          if (r) {
            return r;
          }
        }
        throw new $P.Exception(s);
      };
    },
    each: function() {
      var px = arguments;
      return function(s) {
        var rx = [],
          r = null;
        for (var i = 0; i < px.length; i++) {
          if (px[i] == null) {
            continue;
          }
          try {
            r = (px[i].call(this, s));
          } catch (e) {
            throw new $P.Exception(s);
          }
          rx.push(r[0]);
          s = r[1];
        }
        return [rx, s];
      };
    },
    all: function() {
      var px = arguments,
        _ = _;
      return _.each(_.optional(px));
    },
    sequence: function(px, d, c) {
      d = d || _.rtoken(/^\s*/);
      c = c || null;
      if (px.length == 1) {
        return px[0];
      }
      return function(s) {
        var r = null,
          q = null;
        var rx = [];
        for (var i = 0; i < px.length; i++) {
          try {
            r = px[i].call(this, s);
          } catch (e) {
            break;
          }
          rx.push(r[0]);
          try {
            q = d.call(this, r[1]);
          } catch (ex) {
            q = null;
            break;
          }
          s = q[1];
        }
        if (!r) {
          throw new $P.Exception(s);
        }
        if (q) {
          throw new $P.Exception(q[1]);
        }
        if (c) {
          try {
            r = c.call(this, r[1]);
          } catch (ey) {
            throw new $P.Exception(r[1]);
          }
        }
        return [rx, (r ? r[1] : s)];
      };
    },
    between: function(d1, p, d2) {
      d2 = d2 || d1;
      var _fn = _.each(_.ignore(d1), p, _.ignore(d2));
      return function(s) {
        var rx = _fn.call(this, s);
        return [
          [rx[0][0], r[0][2]], rx[1]
        ];
      };
    },
    list: function(p, d, c) {
      d = d || _.rtoken(/^\s*/);
      c = c || null;
      return (p instanceof Array ? _.each(_.product(p.slice(0, -1), _.ignore(d)), p.slice(-1), _.ignore(c)) : _.each(_.many(_.each(p, _.ignore(d))), px, _.ignore(c)));
    },
    set: function(px, d, c) {
      d = d || _.rtoken(/^\s*/);
      c = c || null;
      return function(s) {
        var r = null,
          p = null,
          q = null,
          rx = null,
          best = [
            [], s
          ],
          last = false;
        for (var i = 0; i < px.length; i++) {
          q = null;
          p = null;
          r = null;
          last = (px.length == 1);
          try {
            r = px[i].call(this, s);
          } catch (e) {
            continue;
          }
          rx = [
            [r[0]], r[1]
          ];
          if (r[1].length > 0 && !last) {
            try {
              q = d.call(this, r[1]);
            } catch (ex) {
              last = true;
            }
          } else {
            last = true;
          }
          if (!last && q[1].length === 0) {
            last = true;
          }
          if (!last) {
            var qx = [];
            for (var j = 0; j < px.length; j++) {
              if (i != j) {
                qx.push(px[j]);
              }
            }
            p = _.set(qx, d).call(this, q[1]);
            if (p[0].length > 0) {
              rx[0] = rx[0].concat(p[0]);
              rx[1] = p[1];
            }
          }
          if (rx[1].length < best[1].length) {
            best = rx;
          }
          if (best[1].length === 0) {
            break;
          }
        }
        if (best[0].length === 0) {
          return best;
        }
        if (c) {
          try {
            q = c.call(this, best[1]);
          } catch (ey) {
            throw new $P.Exception(best[1]);
          }
          best[1] = q[1];
        }
        return best;
      };
    },
    forward: function(gr, fname) {
      return function(s) {
        return gr[fname].call(this, s);
      };
    },
    replace: function(rule, repl) {
      return function(s) {
        var r = rule.call(this, s);
        return [repl, r[1]];
      };
    },
    process: function(rule, fn) {
      return function(s) {
        var r = rule.call(this, s);
        return [fn.call(this, r[0]), r[1]];
      };
    },
    min: function(min, rule) {
      return function(s) {
        var rx = rule.call(this, s);
        if (rx[0].length < min) {
          throw new $P.Exception(s);
        }
        return rx;
      };
    }
  };
  var _generator = function(op) {
    return function() {
      var args = null,
        rx = [];
      if (arguments.length > 1) {
        args = Array.prototype.slice.call(arguments);
      } else if (arguments[0] instanceof Array) {
        args = arguments[0];
      }
      if (args) {
        for (var i = 0, px = args.shift(); i < px.length; i++) {
          args.unshift(px[i]);
          rx.push(op.apply(null, args));
          args.shift();
          return rx;
        }
      } else {
        return op.apply(null, arguments);
      }
    };
  };
  var gx = "optional not ignore cache".split(/\s/);
  for (var i = 0; i < gx.length; i++) {
    _[gx[i]] = _generator(_[gx[i]]);
  }
  var _vector = function(op) {
    return function() {
      if (arguments[0] instanceof Array) {
        return op.apply(null, arguments[0]);
      } else {
        return op.apply(null, arguments);
      }
    };
  };
  var vx = "each any all".split(/\s/);
  for (var j = 0; j < vx.length; j++) {
    _[vx[j]] = _vector(_[vx[j]]);
  }
}());
(function() {
  var $D = Date,
    $P = $D.prototype,
    $C = $D.CultureInfo;
  var flattenAndCompact = function(ax) {
    var rx = [];
    for (var i = 0; i < ax.length; i++) {
      if (ax[i] instanceof Array) {
        rx = rx.concat(flattenAndCompact(ax[i]));
      } else {
        if (ax[i]) {
          rx.push(ax[i]);
        }
      }
    }
    return rx;
  };
  $D.Grammar = {};
  $D.Translator = {
    hour: function(s) {
      return function() {
        this.hour = Number(s);
      };
    },
    minute: function(s) {
      return function() {
        this.minute = Number(s);
      };
    },
    second: function(s) {
      return function() {
        this.second = Number(s);
      };
    },
    meridian: function(s) {
      return function() {
        this.meridian = s.slice(0, 1).toLowerCase();
      };
    },
    timezone: function(s) {
      return function() {
        var n = s.replace(/[^\d\+\-]/g, "");
        if (n.length) {
          this.timezoneOffset = Number(n);
        } else {
          this.timezone = s.toLowerCase();
        }
      };
    },
    day: function(x) {
      var s = x[0];
      return function() {
        this.day = Number(s.match(/\d+/)[0]);
      };
    },
    month: function(s) {
      return function() {
        this.month = (s.length == 3) ? "jan feb mar apr may jun jul aug sep oct nov dec".indexOf(s) / 4 : Number(s) - 1;
      };
    },
    year: function(s) {
      return function() {
        var n = Number(s);
        this.year = ((s.length > 2) ? n : (n + (((n + 2000) < $C.twoDigitYearMax) ? 2000 : 1900)));
      };
    },
    rday: function(s) {
      return function() {
        switch (s) {
          case "yesterday":
            this.days = -1;
            break;
          case "tomorrow":
            this.days = 1;
            break;
          case "today":
            this.days = 0;
            break;
          case "now":
            this.days = 0;
            this.now = true;
            break;
        }
      };
    },
    finishExact: function(x) {
      x = (x instanceof Array) ? x : [x];
      for (var i = 0; i < x.length; i++) {
        if (x[i]) {
          x[i].call(this);
        }
      }
      var now = new Date();
      if ((this.hour || this.minute) && (!this.month && !this.year && !this.day)) {
        this.day = now.getDate();
      }
      if (!this.year) {
        this.year = now.getFullYear();
      }
      if (!this.month && this.month !== 0) {
        this.month = now.getMonth();
      }
      if (!this.day) {
        this.day = 1;
      }
      if (!this.hour) {
        this.hour = 0;
      }
      if (!this.minute) {
        this.minute = 0;
      }
      if (!this.second) {
        this.second = 0;
      }
      if (this.meridian && this.hour) {
        if (this.meridian == "p" && this.hour < 12) {
          this.hour = this.hour + 12;
        } else if (this.meridian == "a" && this.hour == 12) {
          this.hour = 0;
        }
      }
      if (this.day > $D.getDaysInMonth(this.year, this.month)) {
        throw new RangeError(this.day + " is not a valid value for days.");
      }
      var r = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second);
      if (this.timezone) {
        r.set({
          timezone: this.timezone
        });
      } else if (this.timezoneOffset) {
        r.set({
          timezoneOffset: this.timezoneOffset
        });
      }
      return r;
    },
    finish: function(x) {
      x = (x instanceof Array) ? flattenAndCompact(x) : [x];
      if (x.length === 0) {
        return null;
      }
      for (var i = 0; i < x.length; i++) {
        if (typeof x[i] == "function") {
          x[i].call(this);
        }
      }
      var today = $D.today();
      if (this.now && !this.unit && !this.operator) {
        return new Date();
      } else if (this.now) {
        today = new Date();
      }
      var expression = !!(this.days && this.days !== null || this.orient || this.operator);
      var gap, mod, orient;
      orient = ((this.orient == "past" || this.operator == "subtract") ? -1 : 1);
      if (!this.now && "hour minute second".indexOf(this.unit) != -1) {
        today.setTimeToNow();
      }
      if (this.month || this.month === 0) {
        if ("year day hour minute second".indexOf(this.unit) != -1) {
          this.value = this.month + 1;
          this.month = null;
          expression = true;
        }
      }
      if (!expression && this.weekday && !this.day && !this.days) {
        var temp = Date[this.weekday]();
        this.day = temp.getDate();
        if (!this.month) {
          this.month = temp.getMonth();
        }
        this.year = temp.getFullYear();
      }
      if (expression && this.weekday && this.unit != "month") {
        this.unit = "day";
        gap = ($D.getDayNumberFromName(this.weekday) - today.getDay());
        mod = 7;
        this.days = gap ? ((gap + (orient * mod)) % mod) : (orient * mod);
      }
      if (this.month && this.unit == "day" && this.operator) {
        this.value = (this.month + 1);
        this.month = null;
      }
      if (this.value != null && this.month != null && this.year != null) {
        this.day = this.value * 1;
      }
      if (this.month && !this.day && this.value) {
        today.set({
          day: this.value * 1
        });
        if (!expression) {
          this.day = this.value * 1;
        }
      }
      if (!this.month && this.value && this.unit == "month" && !this.now) {
        this.month = this.value;
        expression = true;
      }
      if (expression && (this.month || this.month === 0) && this.unit != "year") {
        this.unit = "month";
        gap = (this.month - today.getMonth());
        mod = 12;
        this.months = gap ? ((gap + (orient * mod)) % mod) : (orient * mod);
        this.month = null;
      }
      if (!this.unit) {
        this.unit = "day";
      }
      if (!this.value && this.operator && this.operator !== null && this[this.unit + "s"] && this[this.unit + "s"] !== null) {
        this[this.unit + "s"] = this[this.unit + "s"] + ((this.operator == "add") ? 1 : -1) + (this.value || 0) * orient;
      } else if (this[this.unit + "s"] == null || this.operator != null) {
        if (!this.value) {
          this.value = 1;
        }
        this[this.unit + "s"] = this.value * orient;
      }
      if (this.meridian && this.hour) {
        if (this.meridian == "p" && this.hour < 12) {
          this.hour = this.hour + 12;
        } else if (this.meridian == "a" && this.hour == 12) {
          this.hour = 0;
        }
      }
      if (this.weekday && !this.day && !this.days) {
        var temp = Date[this.weekday]();
        this.day = temp.getDate();
        if (temp.getMonth() !== today.getMonth()) {
          this.month = temp.getMonth();
        }
      }
      if ((this.month || this.month === 0) && !this.day) {
        this.day = 1;
      }
      if (!this.orient && !this.operator && this.unit == "week" && this.value && !this.day && !this.month) {
        return Date.today().setWeek(this.value);
      }
      if (expression && this.timezone && this.day && this.days) {
        this.day = this.days;
      }
      return (expression) ? today.add(this) : today.set(this);
    }
  };
  var _ = $D.Parsing.Operators,
    g = $D.Grammar,
    t = $D.Translator,
    _fn;
  g.datePartDelimiter = _.rtoken(/^([\s\-\.\,\/\x27]+)/);
  g.timePartDelimiter = _.stoken(":");
  g.whiteSpace = _.rtoken(/^\s*/);
  g.generalDelimiter = _.rtoken(/^(([\s\,]|at|@|on)+)/);
  var _C = {};
  g.ctoken = function(keys) {
    var fn = _C[keys];
    if (!fn) {
      var c = $C.regexPatterns;
      var kx = keys.split(/\s+/),
        px = [];
      for (var i = 0; i < kx.length; i++) {
        px.push(_.replace(_.rtoken(c[kx[i]]), kx[i]));
      }
      fn = _C[keys] = _.any.apply(null, px);
    }
    return fn;
  };
  g.ctoken2 = function(key) {
    return _.rtoken($C.regexPatterns[key]);
  };
  g.h = _.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2]|[1-9])/), t.hour));
  g.hh = _.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2])/), t.hour));
  g.H = _.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3]|[0-9])/), t.hour));
  g.HH = _.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3])/), t.hour));
  g.m = _.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/), t.minute));
  g.mm = _.cache(_.process(_.rtoken(/^[0-5][0-9]/), t.minute));
  g.s = _.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/), t.second));
  g.ss = _.cache(_.process(_.rtoken(/^[0-5][0-9]/), t.second));
  g.hms = _.cache(_.sequence([g.H, g.m, g.s], g.timePartDelimiter));
  g.t = _.cache(_.process(g.ctoken2("shortMeridian"), t.meridian));
  g.tt = _.cache(_.process(g.ctoken2("longMeridian"), t.meridian));
  g.z = _.cache(_.process(_.rtoken(/^((\+|\-)\s*\d\d\d\d)|((\+|\-)\d\d\:?\d\d)/), t.timezone));
  g.zz = _.cache(_.process(_.rtoken(/^((\+|\-)\s*\d\d\d\d)|((\+|\-)\d\d\:?\d\d)/), t.timezone));
  g.zzz = _.cache(_.process(g.ctoken2("timezone"), t.timezone));
  g.timeSuffix = _.each(_.ignore(g.whiteSpace), _.set([g.tt, g.zzz]));
  g.time = _.each(_.optional(_.ignore(_.stoken("T"))), g.hms, g.timeSuffix);
  g.d = _.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1]|\d)/), _.optional(g.ctoken2("ordinalSuffix"))), t.day));
  g.dd = _.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1])/), _.optional(g.ctoken2("ordinalSuffix"))), t.day));
  g.ddd = g.dddd = _.cache(_.process(g.ctoken("sun mon tue wed thu fri sat"), function(s) {
    return function() {
      this.weekday = s;
    };
  }));
  g.M = _.cache(_.process(_.rtoken(/^(1[0-2]|0\d|\d)/), t.month));
  g.MM = _.cache(_.process(_.rtoken(/^(1[0-2]|0\d)/), t.month));
  g.MMM = g.MMMM = _.cache(_.process(g.ctoken("jan feb mar apr may jun jul aug sep oct nov dec"), t.month));
  g.y = _.cache(_.process(_.rtoken(/^(\d\d?)/), t.year));
  g.yy = _.cache(_.process(_.rtoken(/^(\d\d)/), t.year));
  g.yyy = _.cache(_.process(_.rtoken(/^(\d\d?\d?\d?)/), t.year));
  g.yyyy = _.cache(_.process(_.rtoken(/^(\d\d\d\d)/), t.year));
  _fn = function() {
    return _.each(_.any.apply(null, arguments), _.not(g.ctoken2("timeContext")));
  };
  g.day = _fn(g.d, g.dd);
  g.month = _fn(g.M, g.MMM);
  g.year = _fn(g.yyyy, g.yy);
  g.orientation = _.process(g.ctoken("past future"), function(s) {
    return function() {
      this.orient = s;
    };
  });
  g.operator = _.process(g.ctoken("add subtract"), function(s) {
    return function() {
      this.operator = s;
    };
  });
  g.rday = _.process(g.ctoken("yesterday tomorrow today now"), t.rday);
  g.unit = _.process(g.ctoken("second minute hour day week month year"), function(s) {
    return function() {
      this.unit = s;
    };
  });
  g.value = _.process(_.rtoken(/^\d\d?(st|nd|rd|th)?/), function(s) {
    return function() {
      this.value = s.replace(/\D/g, "");
    };
  });
  g.expression = _.set([g.rday, g.operator, g.value, g.unit, g.orientation, g.ddd, g.MMM]);
  _fn = function() {
    return _.set(arguments, g.datePartDelimiter);
  };
  g.mdy = _fn(g.ddd, g.month, g.day, g.year);
  g.ymd = _fn(g.ddd, g.year, g.month, g.day);
  g.dmy = _fn(g.ddd, g.day, g.month, g.year);
  g.date = function(s) {
    return ((g[$C.dateElementOrder] || g.mdy).call(this, s));
  };
  g.format = _.process(_.many(_.any(_.process(_.rtoken(/^(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?)/), function(fmt) {
    if (g[fmt]) {
      return g[fmt];
    } else {
      throw $D.Parsing.Exception(fmt);
    }
  }), _.process(_.rtoken(/^[^dMyhHmstz]+/), function(s) {
    return _.ignore(_.stoken(s));
  }))), function(rules) {
    return _.process(_.each.apply(null, rules), t.finishExact);
  });
  var _F = {};
  var _get = function(f) {
    return _F[f] = (_F[f] || g.format(f)[0]);
  };
  g.formats = function(fx) {
    if (fx instanceof Array) {
      var rx = [];
      for (var i = 0; i < fx.length; i++) {
        rx.push(_get(fx[i]));
      }
      return _.any.apply(null, rx);
    } else {
      return _get(fx);
    }
  };
  g._formats = g.formats(["\"yyyy-MM-ddTHH:mm:ssZ\"", "yyyy-MM-ddTHH:mm:ssZ", "yyyy-MM-ddTHH:mm:ssz", "yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mmZ", "yyyy-MM-ddTHH:mmz", "yyyy-MM-ddTHH:mm", "ddd, MMM dd, yyyy H:mm:ss tt", "ddd MMM d yyyy HH:mm:ss zzz", "MMddyyyy", "ddMMyyyy", "Mddyyyy", "ddMyyyy", "Mdyyyy", "dMyyyy", "yyyy", "Mdyy", "dMyy", "d"]);
  g._start = _.process(_.set([g.date, g.time, g.expression], g.generalDelimiter, g.whiteSpace), t.finish);
  g.start = function(s) {
    try {
      var r = g._formats.call({}, s);
      if (r[1].length === 0) {
        return r;
      }
    } catch (e) {}
    return g._start.call({}, s);
  };
  $D._parse = $D.parse;
  $D.parse = function(s) {
    var r = null;
    if (!s) {
      return null;
    }
    if (s instanceof Date) {
      return s;
    }
    try {
      r = $D.Grammar.start.call({}, s.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
    } catch (e) {
      return null;
    }
    return ((r[1].length === 0) ? r[0] : null);
  };
  $D.getParseFunction = function(fx) {
    var fn = $D.Grammar.formats(fx);
    return function(s) {
      var r = null;
      try {
        r = fn.call({}, s);
      } catch (e) {
        return null;
      }
      return ((r[1].length === 0) ? r[0] : null);
    };
  };
  $D.parseExact = function(s, fx) {
    return $D.getParseFunction(fx)(s);
  };
}());
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
/*! RESOURCE: hideRefIcons */
(function() {
  addAfterPageLoadedEvent(function() {
    var roles = g_user.hasRoleFromList("asset, sam,asset_financial,admin,security_admin");
    if (((window.location.href.indexOf('alm_hardware') != -1) ||
        (window.location.href.indexOf('alm_license') != -1) ||
        (window.location.href.indexOf('alm_entitlement_user') != -1) || (window.location.href.indexOf('alm_entitlement') != -1)) && !roles) {
      hideRefIcons();
    }
  });
})();

function hideRefIcons() {
  $j('a[class="btn btn-icon table-btn-lg icon-info list_popup"').each(function() {
    $j(this).css("display", "none");
  });
}
/*! RESOURCE: PopupUINotification */
var intervalTest = setInterval(function() {
  if (typeof CustomEvent != 'undefined') {
    clearInterval(intervalTest);
    setCustomEvents();
  }
}, 500);

function setCustomEvents() {
  var notifName = "demo_notification";
  CustomEvent.observe('glide:ui_notification.' + notifName,
    function(notification) {
      var msgText = notification.getAttribute('text1');
      var options = {};
      options.text = "<span style='color:red;'>" + msgText + "</span>";
      options.closeDelay = 5000;
      options.fadeIn = 500;
      options.fadeOut = 500;
      new NotificationMessage(options);
    });
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
/*! RESOURCE: FruitionAddToTestEventHandler */
var FruitionAddToTestEventHandler = Class.create({
  initialize: function(gr) {
    this._gr = gr;
    this._isList = (gr.type + '' == 'GlideList2');
    this._tableName = this._gr.getTableName();
    this._prmErr = [];
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass('fruition_ref_choose_dialog');
    var titleMsg = '';
    if (this._gr.getTableName() == 'fruition_test_case') {
      titleMsg = getMessage('Add Case(s) to Test Event');
    } else if (this._gr.getTableName() == 'u_fruition_test_scenario') {
      titleMsg = getMessage('Add Scenario(s) to Test Event');
    }
    this._mstrDlg.setTitle(titleMsg);
    this._mstrDlg.setPreference('sysparam_field_label', getMessage('Test Event'));
    this._mstrDlg.setPreference('sysparam_reference_table', 'u_fruition_test_event');
    this._mstrDlg.setPreference('sysparam_query', 'active=true');
    this._mstrDlg.setPreference('handler', this);
  },
  showDialog: function() {
    this._mstrDlg.render();
  },
  onSubmit: function() {
    var testEventId = this._getValue('u_fruition_test_event_ref');
    if (!this._validate()) {
      return false;
    }
    this._mstrDlg.destroy();
    if (testEventId) {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._plsWtDlg = new dialogClass('fruition_wait_dialog');
      this._plsWtDlg.setTitle(getMessage('Working.  Please wait.'));
      this._plsWtDlg.render();
      var ga = new GlideAjax('FruitionAjaxProcessor');
      ga.addParam('sysparm_name', 'addToTestEvent');
      ga.addParam('sysparm_sys_id', this._isList ? this._gr.getChecked() : this._gr.getUniqueValue());
      ga.addParam('sysparm_fruition_test_event', testEventId);
      ga.addParam('sysparm_tn', this._tableName);
      ga.getXML(this.callback.bind(this));
    }
    return false;
  },
  callback: function(response) {
    this._plsWtDlg.destroy();
    var resp = response.responseXML.getElementsByTagName('result');
    if (resp[0] && resp[0].getAttribute('status') == 'success') {
      return false;
    } else {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._createError = new dialogClass('fruition_error_dialog');
      this._createError.setTitle(getMessage('Error while adding Test Cases from selected Test Scenario.'));
      this._createError.render();
    }
  },
  _refreshRelatedList: function() {
    this._gForm.setFilterAndRefresh('');
  },
  _validate: function() {
    var valid = true;
    this._prmErr = [];
    if (!this._isList) {
      this._removeAllError('fruition_ref_choose_dialog');
    }
    if (this._getValue('u_fruition_test_event_ref') == 'undefined' || this._getValue('u_fruition_test_event_ref').trim() == '') {
      this._prmErr.push(getMessage('Select Test Event'));
      if (!this._isList) {
        this._showFieldError('ref_test_scenario_field', this._prmErr[0]);
      }
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
    if (!$group.hasClassName('has-error')) {
      $group.addClassName('has-error');
    }
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
  type: 'FruitionAddToTestEventHandler'
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
/*! RESOURCE: UpdateSetPicker */
addLoadEvent(moveUpdateSetPicker);

function moveUpdateSetPicker() {
  try {
    if ($('navpage_header_control_button')) {
      $('update_set_picker_select').className = '';
      if ($('update_set_picker').select('li')[0]) {
        $('update_set_picker').select('ul')[0].style.marginBottom = "0px";
        $('update_set_picker').select('ul')[0].style.paddingLeft = "0px";
        $('update_set_picker').select('li')[0].className = '';
        $('update_set_picker').select('li')[0].style.paddingRight = "5px";
        $('update_set_picker').select('li')[0].style.listStyleType = "none";
        $('update_set_picker').select('li')[0].select('a')[0].style.color = "#FFF";
        $('update_set_picker').select('li')[0].select('a')[0].style.border = "none";
        $('update_set_picker').select('li')[0].select('a')[1].style.color = "#FFF";
        $('update_set_picker').select('li')[0].select('a')[1].style.border = "none";
        $('update_set_picker').select('li')[0].select('a')[2].style.color = "#FFF";
        $('update_set_picker').select('li')[0].select('a')[2].style.border = "none";
        $('update_set_picker_select').style.color = "#000";
        $$('.btn-icon').each(function(d) {
          d.style.lineHeight = 'inherit';
        });
      }
      if ($('update_set_picker').select('legend')[0]) {
        $('update_set_picker').select('legend')[0].remove();
      }
      $('nav_header_stripe_decorations').insert({
        top: $('update_set_picker')
      });
      $('update_set_picker').id = 'update_set_picker_new';
    }
  } catch (e) {}
}
/*! RESOURCE: CheckReferenceFieldValue */
function CheckReferenceFieldValues(catalogSys) {
  var ga = new GlideAjax('RequestHelper');
  ga.addParam('sysparm_name', 'getActiveReferenceFields');
  ga.addParam('sysparm_sysid', catalogSys);
  ga.getXMLWait();
  var fieldNamesString = ga.getAnswer();
  if (fieldNamesString != '') {
    var fieldArr = fieldNamesString.split(',');
    var finalFieldNames = [];
    for (var field = 0; field < fieldArr.length; field++) {
      var fieldID = g_form.getControl(fieldArr[field]).id;
      var displayFieldValue = g_form.getElement('display_hidden.' + fieldID).value;
      var hiddenValue = g_form.getElement(fieldID).value;
      if (displayFieldValue != '' && hiddenValue == '') {
        g_form.setValue(fieldArr[field], '');
        finalFieldNames.push(fieldArr[field]);
      }
    }
    if (finalFieldNames != '') {
      var fieldLabels = [];
      for (var fieldName = 0; fieldName < finalFieldNames.length; fieldName++) {
        fieldLabels.push(g_form.getLabelOf(finalFieldNames[fieldName]));
      }
      fieldLabels = fieldLabels.join(',');
      alert('The following reference fields have an invalid entry:\n\n' + fieldLabels.replace(/,/g, '\n') + '\n\nClick OK to return to the form to enter a valid value from the reference list or leave the field blank.');
      return false;
    }
  }
}
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
/*! RESOURCE: TimeZonePicker */
addLoadEvent(moveTimezonePicker);

function moveTimezonePicker() {
  try {
    if ($('navpage_header_control_button')) {
      if ($('timezone_changer').select('a')[0]) {
        $('timezone_changer').select('a')[0].style.color = "#FFF";
        $('timezone_changer').select('a')[0].style.border = "none";
      }
      var elements = document.getElementsByTagName('legend');
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].innerHTML == 'Time zone')
          elements[i].remove();
      }
      if ($('timezone_changer').select('legend')[0]) {
        $('timezone_changer').select('legend')[0].remove();
      }
      $('nav_header_stripe_decorations').insert({
        top: $('timezone_changer')
      });
      $('timezone_changer').id = 'timezone_changer_new';
      $('timezone_changer_new').style.display = "inline-block";
      $('timezone_changer_new').style.marginRight = "5px";
      $('timezone_changer_select').className = "";
      $('timezone_changer_select').style.color = "black";
      $('nav_header_stripe_decorations').style.width = "auto";
      var newlabel = document.createElement("Span");
      newlabel.id = "timezone_changer_new_label";
      newlabel.style.paddingRight = '30px';
      newlabel.style.marginBottom = '0px';
      newlabel.style.verticalAlign = 'middle';
      newlabel.innerHTML = "Session Time Zone";
      $('nav_header_stripe_decorations').insertBefore(newlabel, $('timezone_changer_new'));
    }
  } catch (e) {}
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