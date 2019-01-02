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
/*! RESOURCE: A - Redirection - Wabtec */
addLoadEvent(do_forceEssPortal);

function do_forceEssPortal() {
  var usr_domain;
  var usr_id = g_user.userID;
  var usr_details = new GlideRecord('sys_user');
  usr_details.addQuery('sys_id', usr_id);
  usr_details.query();
  if (usr_details.next()) {
    usr_domain = usr_details.sys_domain;
  }
  var path_name = window.location.pathname;
  if (usr_domain == '76f9748c0f713a803cb1918172050efb' && document.URL == 'https://railnms.wabtecone.io/home.do?') {
    top.window.location = 'https://railnms.wabtecone.io/PTC-IMS';
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
      return "<tr><td><label for='" + strLabel + "'>" + getMessage(strMessage) + "</label></td><td>" + getSelectMarkUp(strLabel, nValue) + "</td></tr>";
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
/*! RESOURCE: Show Survey Popup */
window.setTimeout(surveySplash, 2000);

function surveySplash() {
  var state = 'ready';
  var user_id = window.NOW.user.id;
  var pref2 = new GlideRecord('asmt_assessment_instance');
  pref2.addQuery('state', '=', state);
  pref2.addQuery('user', '=', user_id);
  pref2.addQuery('sys_domain', '=', '4769b1020f7061009935945f62050ef9');
  pref2.query();
  var yesRole = g_user.hasRoles();
  if (pref2.next() && !yesRole) {
    if (user_id == pref2.user) {
      var pref = new GlideRecord('sys_user_preference');
      pref.addQuery('user', '=', user_id);
      pref.addQuery('name', '=', 'splash_viewed');
      pref.query();
      if (pref.next()) {
        if (getPreference("splash_viewed") == 'true') {
          return;
        } else {
          popupDispList(pref2.sys_id);
        }
      } else {
        popupDispList(pref2.sys_id);
      }
    }
  }
}

function popupDispList(sys_id) {
  var user_id = window.NOW.user.id;
  var gdw = new GlideDialogWindow('Survey_PopUp');
  gdw.setTitle('Survey ready to take');
  gdw.setPreference('table', 'Survey_Splash_Screen');
  gdw.setPreference('sysparm_view', 'default');
  var query = 'sys_id=' + sys_id;
  gdw.setPreference('sysparm_query', query);
  gdw.render();
}
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
      row += getMessage(strMessage);
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
/*! RESOURCE: jquery.min */
! function(a, b) {
  "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function(a) {
    if (!a.document) throw new Error("jQuery requires a window with a document");
    return b(a)
  } : b(a)
}("undefined" != typeof window ? window : this, function(a, b) {
    var c = [],
      d = c.slice,
      e = c.concat,
      f = c.push,
      g = c.indexOf,
      h = {},
      i = h.toString,
      j = h.hasOwnProperty,
      k = {},
      l = "1.11.3",
      m = function(a, b) {
        return new m.fn.init(a, b)
      },
      n = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
      o = /^-ms-/,
      p = /-([\da-z])/gi,
      q = function(a, b) {
        return b.toUpperCase()
      };
    m.fn = m.prototype = {
      jquery: l,
      constructor: m,
      selector: "",
      length: 0,
      toArray: function() {
        return d.call(this)
      },
      get: function(a) {
        return null != a ? 0 > a ? this[a + this.length] : this[a] : d.call(this)
      },
      pushStack: function(a) {
        var b = m.merge(this.constructor(), a);
        return b.prevObject = this, b.context = this.context, b
      },
      each: function(a, b) {
        return m.each(this, a, b)
      },
      map: function(a) {
        return this.pushStack(m.map(this, function(b, c) {
          return a.call(b, c, b)
        }))
      },
      slice: function() {
        return this.pushStack(d.apply(this, arguments))
      },
      first: function() {
        return this.eq(0)
      },
      last: function() {
        return this.eq(-1)
      },
      eq: function(a) {
        var b = this.length,
          c = +a + (0 > a ? b : 0);
        return this.pushStack(c >= 0 && b > c ? [this[c]] : [])
      },
      end: function() {
        return this.prevObject || this.constructor(null)
      },
      push: f,
      sort: c.sort,
      splice: c.splice
    }, m.extend = m.fn.extend = function() {
      var a, b, c, d, e, f, g = arguments[0] || {},
        h = 1,
        i = arguments.length,
        j = !1;
      for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || m.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++)
        if (null != (e = arguments[h]))
          for (d in e) a = g[d], c = e[d], g !== c && (j && c && (m.isPlainObject(c) || (b = m.isArray(c))) ? (b ? (b = !1, f = a && m.isArray(a) ? a : []) : f = a && m.isPlainObject(a) ? a : {}, g[d] = m.extend(j, f, c)) : void 0 !== c && (g[d] = c));
      return g
    }, m.extend({
      expando: "jQuery" + (l + Math.random()).replace(/\D/g, ""),
      isReady: !0,
      error: function(a) {
        throw new Error(a)
      },
      noop: function() {},
      isFunction: function(a) {
        return "function" === m.type(a)
      },
      isArray: Array.isArray || function(a) {
        return "array" === m.type(a)
      },
      isWindow: function(a) {
        return null != a && a == a.window
      },
      isNumeric: function(a) {
        return !m.isArray(a) && a - parseFloat(a) + 1 >= 0
      },
      isEmptyObject: function(a) {
        var b;
        for (b in a) return !1;
        return !0
      },
      isPlainObject: function(a) {
        var b;
        if (!a || "object" !== m.type(a) || a.nodeType || m.isWindow(a)) return !1;
        try {
          if (a.constructor && !j.call(a, "constructor") && !j.call(a.constructor.prototype, "isPrototypeOf")) return !1
        } catch (c) {
          return !1
        }
        if (k.ownLast)
          for (b in a) return j.call(a, b);
        for (b in a);
        return void 0 === b || j.call(a, b)
      },
      type: function(a) {
        return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? h[i.call(a)] || "object" : typeof a
      },
      globalEval: function(b) {
        b && m.trim(b) && (a.execScript || function(b) {
          a.eval.call(a, b)
        })(b)
      },
      camelCase: function(a) {
        return a.replace(o, "ms-").replace(p, q)
      },
      nodeName: function(a, b) {
        return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase()
      },
      each: function(a, b, c) {
        var d, e = 0,
          f = a.length,
          g = r(a);
        if (c) {
          if (g) {
            for (; f > e; e++)
              if (d = b.apply(a[e], c), d === !1) break
          } else
            for (e in a)
              if (d = b.apply(a[e], c), d === !1) break
        } else if (g) {
          for (; f > e; e++)
            if (d = b.call(a[e], e, a[e]), d === !1) break
        } else
          for (e in a)
            if (d = b.call(a[e], e, a[e]), d === !1) break;
        return a
      },
      trim: function(a) {
        return null == a ? "" : (a + "").replace(n, "")
      },
      makeArray: function(a, b) {
        var c = b || [];
        return null != a && (r(Object(a)) ? m.merge(c, "string" == typeof a ? [a] : a) : f.call(c, a)), c
      },
      inArray: function(a, b, c) {
        var d;
        if (b) {
          if (g) return g.call(b, a, c);
          for (d = b.length, c = c ? 0 > c ? Math.max(0, d + c) : c : 0; d > c; c++)
            if (c in b && b[c] === a) return c
        }
        return -1
      },
      merge: function(a, b) {
        var c = +b.length,
          d = 0,
          e = a.length;
        while (c > d) a[e++] = b[d++];
        if (c !== c)
          while (void 0 !== b[d]) a[e++] = b[d++];
        return a.length = e, a
      },
      grep: function(a, b, c) {
        for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++) d = !b(a[f], f), d !== h && e.push(a[f]);
        return e
      },
      map: function(a, b, c) {
        var d, f = 0,
          g = a.length,
          h = r(a),
          i = [];
        if (h)
          for (; g > f; f++) d = b(a[f], f, c), null != d && i.push(d);
        else
          for (f in a) d = b(a[f], f, c), null != d && i.push(d);
        return e.apply([], i)
      },
      guid: 1,
      proxy: function(a, b) {
        var c, e, f;
        return "string" == typeof b && (f = a[b], b = a, a = f), m.isFunction(a) ? (c = d.call(arguments, 2), e = function() {
          return a.apply(b || this, c.concat(d.call(arguments)))
        }, e.guid = a.guid = a.guid || m.guid++, e) : void 0
      },
      now: function() {
        return +new Date
      },
      support: k
    }), m.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(a, b) {
      h["[object " + b + "]"] = b.toLowerCase()
    });

    function r(a) {
      var b = "length" in a && a.length,
        c = m.type(a);
      return "function" === c || m.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a
    }
    var s = function(a) {
      var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u = "sizzle" + 1 * new Date,
        v = a.document,
        w = 0,
        x = 0,
        y = ha(),
        z = ha(),
        A = ha(),
        B = function(a, b) {
          return a === b && (l = !0), 0
        },
        C = 1 << 31,
        D = {}.hasOwnProperty,
        E = [],
        F = E.pop,
        G = E.push,
        H = E.push,
        I = E.slice,
        J = function(a, b) {
          for (var c = 0, d = a.length; d > c; c++)
            if (a[c] === b) return c;
          return -1
        },
        K = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
        L = "[\\x20\\t\\r\\n\\f]",
        M = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
        N = M.replace("w", "w#"),
        O = "\\[" + L + "*(" + M + ")(?:" + L + "*([*^$|!~]?=)" + L + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + N + "))|)" + L + "*\\]",
        P = ":(" + M + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + O + ")*)|.*)\\)|)",
        Q = new RegExp(L + "+", "g"),
        R = new RegExp("^" + L + "+|((?:^|[^\\\\])(?:\\\\.)*)" + L + "+$", "g"),
        S = new RegExp("^" + L + "*," + L + "*"),
        T = new RegExp("^" + L + "*([>+~]|" + L + ")" + L + "*"),
        U = new RegExp("=" + L + "*([^\\]'\"]*?)" + L + "*\\]", "g"),
        V = new RegExp(P),
        W = new RegExp("^" + N + "$"),
        X = {
          ID: new RegExp("^#(" + M + ")"),
          CLASS: new RegExp("^\\.(" + M + ")"),
          TAG: new RegExp("^(" + M.replace("w", "w*") + ")"),
          ATTR: new RegExp("^" + O),
          PSEUDO: new RegExp("^" + P),
          CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + L + "*(even|odd|(([+-]|)(\\d*)n|)" + L + "*(?:([+-]|)" + L + "*(\\d+)|))" + L + "*\\)|)", "i"),
          bool: new RegExp("^(?:" + K + ")$", "i"),
          needsContext: new RegExp("^" + L + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + L + "*((?:-\\d)?\\d*)" + L + "*\\)|)(?=[^-]|$)", "i")
        },
        Y = /^(?:input|select|textarea|button)$/i,
        Z = /^h\d$/i,
        $ = /^[^{]+\{\s*\[native \w/,
        _ = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
        aa = /[+~]/,
        ba = /'|\\/g,
        ca = new RegExp("\\\\([\\da-f]{1,6}" + L + "?|(" + L + ")|.)", "ig"),
        da = function(a, b, c) {
          var d = "0x" + b - 65536;
          return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320)
        },
        ea = function() {
          m()
        };
      try {
        H.apply(E = I.call(v.childNodes), v.childNodes), E[v.childNodes.length].nodeType
      } catch (fa) {
        H = {
          apply: E.length ? function(a, b) {
            G.apply(a, I.call(b))
          } : function(a, b) {
            var c = a.length,
              d = 0;
            while (a[c++] = b[d++]);
            a.length = c - 1
          }
        }
      }

      function ga(a, b, d, e) {
        var f, h, j, k, l, o, r, s, w, x;
        if ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, d = d || [], k = b.nodeType, "string" != typeof a || !a || 1 !== k && 9 !== k && 11 !== k) return d;
        if (!e && p) {
          if (11 !== k && (f = _.exec(a)))
            if (j = f[1]) {
              if (9 === k) {
                if (h = b.getElementById(j), !h || !h.parentNode) return d;
                if (h.id === j) return d.push(h), d
              } else if (b.ownerDocument && (h = b.ownerDocument.getElementById(j)) && t(b, h) && h.id === j) return d.push(h), d
            } else {
              if (f[2]) return H.apply(d, b.getElementsByTagName(a)), d;
              if ((j = f[3]) && c.getElementsByClassName) return H.apply(d, b.getElementsByClassName(j)), d
            }
          if (c.qsa && (!q || !q.test(a))) {
            if (s = r = u, w = b, x = 1 !== k && a, 1 === k && "object" !== b.nodeName.toLowerCase()) {
              o = g(a), (r = b.getAttribute("id")) ? s = r.replace(ba, "\\$&") : b.setAttribute("id", s), s = "[id='" + s + "'] ", l = o.length;
              while (l--) o[l] = s + ra(o[l]);
              w = aa.test(a) && pa(b.parentNode) || b, x = o.join(",")
            }
            if (x) try {
              return H.apply(d, w.querySelectorAll(x)), d
            } catch (y) {} finally {
              r || b.removeAttribute("id")
            }
          }
        }
        return i(a.replace(R, "$1"), b, d, e)
      }

      function ha() {
        var a = [];

        function b(c, e) {
          return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e
        }
        return b
      }

      function ia(a) {
        return a[u] = !0, a
      }

      function ja(a) {
        var b = n.createElement("div");
        try {
          return !!a(b)
        } catch (c) {
          return !1
        } finally {
          b.parentNode && b.parentNode.removeChild(b), b = null
        }
      }

      function ka(a, b) {
        var c = a.split("|"),
          e = a.length;
        while (e--) d.attrHandle[c[e]] = b
      }

      function la(a, b) {
        var c = b && a,
          d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || C) - (~a.sourceIndex || C);
        if (d) return d;
        if (c)
          while (c = c.nextSibling)
            if (c === b) return -1;
        return a ? 1 : -1
      }

      function ma(a) {
        return function(b) {
          var c = b.nodeName.toLowerCase();
          return "input" === c && b.type === a
        }
      }

      function na(a) {
        return function(b) {
          var c = b.nodeName.toLowerCase();
          return ("input" === c || "button" === c) && b.type === a
        }
      }

      function oa(a) {
        return ia(function(b) {
          return b = +b, ia(function(c, d) {
            var e, f = a([], c.length, b),
              g = f.length;
            while (g--) c[e = f[g]] && (c[e] = !(d[e] = c[e]))
          })
        })
      }

      function pa(a) {
        return a && "undefined" != typeof a.getElementsByTagName && a
      }
      c = ga.support = {}, f = ga.isXML = function(a) {
        var b = a && (a.ownerDocument || a).documentElement;
        return b ? "HTML" !== b.nodeName : !1
      }, m = ga.setDocument = function(a) {
        var b, e, g = a ? a.ownerDocument || a : v;
        return g !== n && 9 === g.nodeType && g.documentElement ? (n = g, o = g.documentElement, e = g.defaultView, e && e !== e.top && (e.addEventListener ? e.addEventListener("unload", ea, !1) : e.attachEvent && e.attachEvent("onunload", ea)), p = !f(g), c.attributes = ja(function(a) {
          return a.className = "i", !a.getAttribute("className")
        }), c.getElementsByTagName = ja(function(a) {
          return a.appendChild(g.createComment("")), !a.getElementsByTagName("*").length
        }), c.getElementsByClassName = $.test(g.getElementsByClassName), c.getById = ja(function(a) {
          return o.appendChild(a).id = u, !g.getElementsByName || !g.getElementsByName(u).length
        }), c.getById ? (d.find.ID = function(a, b) {
          if ("undefined" != typeof b.getElementById && p) {
            var c = b.getElementById(a);
            return c && c.parentNode ? [c] : []
          }
        }, d.filter.ID = function(a) {
          var b = a.replace(ca, da);
          return function(a) {
            return a.getAttribute("id") === b
          }
        }) : (delete d.find.ID, d.filter.ID = function(a) {
          var b = a.replace(ca, da);
          return function(a) {
            var c = "undefined" != typeof a.getAttributeNode && a.getAttributeNode("id");
            return c && c.value === b
          }
        }), d.find.TAG = c.getElementsByTagName ? function(a, b) {
          return "undefined" != typeof b.getElementsByTagName ? b.getElementsByTagName(a) : c.qsa ? b.querySelectorAll(a) : void 0
        } : function(a, b) {
          var c, d = [],
            e = 0,
            f = b.getElementsByTagName(a);
          if ("*" === a) {
            while (c = f[e++]) 1 === c.nodeType && d.push(c);
            return d
          }
          return f
        }, d.find.CLASS = c.getElementsByClassName && function(a, b) {
          return p ? b.getElementsByClassName(a) : void 0
        }, r = [], q = [], (c.qsa = $.test(g.querySelectorAll)) && (ja(function(a) {
          o.appendChild(a).innerHTML = "<a id='" + u + "'></a><select id='" + u + "-\f]' msallowcapture=''><option selected=''></option></select>", a.querySelectorAll("[msallowcapture^='']").length && q.push("[*^$]=" + L + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || q.push("\\[" + L + "*(?:value|" + K + ")"), a.querySelectorAll("[id~=" + u + "-]").length || q.push("~="), a.querySelectorAll(":checked").length || q.push(":checked"), a.querySelectorAll("a#" + u + "+*").length || q.push(".#.+[+~]")
        }), ja(function(a) {
          var b = g.createElement("input");
          b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && q.push("name" + L + "*[*^$|!~]?="), a.querySelectorAll(":enabled").length || q.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), q.push(",.*:")
        })), (c.matchesSelector = $.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && ja(function(a) {
          c.disconnectedMatch = s.call(a, "div"), s.call(a, "[s!='']:x"), r.push("!=", P)
        }), q = q.length && new RegExp(q.join("|")), r = r.length && new RegExp(r.join("|")), b = $.test(o.compareDocumentPosition), t = b || $.test(o.contains) ? function(a, b) {
          var c = 9 === a.nodeType ? a.documentElement : a,
            d = b && b.parentNode;
          return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)))
        } : function(a, b) {
          if (b)
            while (b = b.parentNode)
              if (b === a) return !0;
          return !1
        }, B = b ? function(a, b) {
          if (a === b) return l = !0, 0;
          var d = !a.compareDocumentPosition - !b.compareDocumentPosition;
          return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === g || a.ownerDocument === v && t(v, a) ? -1 : b === g || b.ownerDocument === v && t(v, b) ? 1 : k ? J(k, a) - J(k, b) : 0 : 4 & d ? -1 : 1)
        } : function(a, b) {
          if (a === b) return l = !0, 0;
          var c, d = 0,
            e = a.parentNode,
            f = b.parentNode,
            h = [a],
            i = [b];
          if (!e || !f) return a === g ? -1 : b === g ? 1 : e ? -1 : f ? 1 : k ? J(k, a) - J(k, b) : 0;
          if (e === f) return la(a, b);
          c = a;
          while (c = c.parentNode) h.unshift(c);
          c = b;
          while (c = c.parentNode) i.unshift(c);
          while (h[d] === i[d]) d++;
          return d ? la(h[d], i[d]) : h[d] === v ? -1 : i[d] === v ? 1 : 0
        }, g) : n
      }, ga.matches = function(a, b) {
        return ga(a, null, null, b)
      }, ga.matchesSelector = function(a, b) {
        if ((a.ownerDocument || a) !== n && m(a), b = b.replace(U, "='$1']"), !(!c.matchesSelector || !p || r && r.test(b) || q && q.test(b))) try {
          var d = s.call(a, b);
          if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d
        } catch (e) {}
        return ga(b, n, null, [a]).length > 0
      }, ga.contains = function(a, b) {
        return (a.ownerDocument || a) !== n && m(a), t(a, b)
      }, ga.attr = function(a, b) {
        (a.ownerDocument || a) !== n && m(a);
        var e = d.attrHandle[b.toLowerCase()],
          f = e && D.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0;
        return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null
      }, ga.error = function(a) {
        throw new Error("Syntax error, unrecognized expression: " + a)
      }, ga.uniqueSort = function(a) {
        var b, d = [],
          e = 0,
          f = 0;
        if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) {
          while (b = a[f++]) b === a[f] && (e = d.push(f));
          while (e--) a.splice(d[e], 1)
        }
        return k = null, a
      }, e = ga.getText = function(a) {
        var b, c = "",
          d = 0,
          f = a.nodeType;
        if (f) {
          if (1 === f || 9 === f || 11 === f) {
            if ("string" == typeof a.textContent) return a.textContent;
            for (a = a.firstChild; a; a = a.nextSibling) c += e(a)
          } else if (3 === f || 4 === f) return a.nodeValue
        } else
          while (b = a[d++]) c += e(b);
        return c
      }, d = ga.selectors = {
        cacheLength: 50,
        createPseudo: ia,
        match: X,
        attrHandle: {},
        find: {},
        relative: {
          ">": {
            dir: "parentNode",
            first: !0
          },
          " ": {
            dir: "parentNode"
          },
          "+": {
            dir: "previousSibling",
            first: !0
          },
          "~": {
            dir: "previousSibling"
          }
        },
        preFilter: {
          ATTR: function(a) {
            return a[1] = a[1].replace(ca, da), a[3] = (a[3] || a[4] || a[5] || "").replace(ca, da), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4)
          },
          CHILD: function(a) {
            return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || ga.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && ga.error(a[0]), a
          },
          PSEUDO: function(a) {
            var b, c = !a[6] && a[2];
            return X.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && V.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3))
          }
        },
        filter: {
          TAG: function(a) {
            var b = a.replace(ca, da).toLowerCase();
            return "*" === a ? function() {
              return !0
            } : function(a) {
              return a.nodeName && a.nodeName.toLowerCase() === b
            }
          },
          CLASS: function(a) {
            var b = y[a + " "];
            return b || (b = new RegExp("(^|" + L + ")" + a + "(" + L + "|$)")) && y(a, function(a) {
              return b.test("string" == typeof a.className && a.className || "undefined" != typeof a.getAttribute && a.getAttribute("class") || "")
            })
          },
          ATTR: function(a, b, c) {
            return function(d) {
              var e = ga.attr(d, a);
              return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e.replace(Q, " ") + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0
            }
          },
          CHILD: function(a, b, c, d, e) {
            var f = "nth" !== a.slice(0, 3),
              g = "last" !== a.slice(-4),
              h = "of-type" === b;
            return 1 === d && 0 === e ? function(a) {
              return !!a.parentNode
            } : function(b, c, i) {
              var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling",
                q = b.parentNode,
                r = h && b.nodeName.toLowerCase(),
                s = !i && !h;
              if (q) {
                if (f) {
                  while (p) {
                    l = b;
                    while (l = l[p])
                      if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) return !1;
                    o = p = "only" === a && !o && "nextSibling"
                  }
                  return !0
                }
                if (o = [g ? q.firstChild : q.lastChild], g && s) {
                  k = q[u] || (q[u] = {}), j = k[a] || [], n = j[0] === w && j[1], m = j[0] === w && j[2], l = n && q.childNodes[n];
                  while (l = ++n && l && l[p] || (m = n = 0) || o.pop())
                    if (1 === l.nodeType && ++m && l === b) {
                      k[a] = [w, n, m];
                      break
                    }
                } else if (s && (j = (b[u] || (b[u] = {}))[a]) && j[0] === w) m = j[1];
                else
                  while (l = ++n && l && l[p] || (m = n = 0) || o.pop())
                    if ((h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) && ++m && (s && ((l[u] || (l[u] = {}))[a] = [w, m]), l === b)) break;
                return m -= e, m === d || m % d === 0 && m / d >= 0
              }
            }
          },
          PSEUDO: function(a, b) {
            var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || ga.error("unsupported pseudo: " + a);
            return e[u] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? ia(function(a, c) {
              var d, f = e(a, b),
                g = f.length;
              while (g--) d = J(a, f[g]), a[d] = !(c[d] = f[g])
            }) : function(a) {
              return e(a, 0, c)
            }) : e
          }
        },
        pseudos: {
          not: ia(function(a) {
            var b = [],
              c = [],
              d = h(a.replace(R, "$1"));
            return d[u] ? ia(function(a, b, c, e) {
              var f, g = d(a, null, e, []),
                h = a.length;
              while (h--)(f = g[h]) && (a[h] = !(b[h] = f))
            }) : function(a, e, f) {
              return b[0] = a, d(b, null, f, c), b[0] = null, !c.pop()
            }
          }),
          has: ia(function(a) {
            return function(b) {
              return ga(a, b).length > 0
            }
          }),
          contains: ia(function(a) {
            return a = a.replace(ca, da),
              function(b) {
                return (b.textContent || b.innerText || e(b)).indexOf(a) > -1
              }
          }),
          lang: ia(function(a) {
            return W.test(a || "") || ga.error("unsupported lang: " + a), a = a.replace(ca, da).toLowerCase(),
              function(b) {
                var c;
                do
                  if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType);
                return !1
              }
          }),
          target: function(b) {
            var c = a.location && a.location.hash;
            return c && c.slice(1) === b.id
          },
          root: function(a) {
            return a === o
          },
          focus: function(a) {
            return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex)
          },
          enabled: function(a) {
            return a.disabled === !1
          },
          disabled: function(a) {
            return a.disabled === !0
          },
          checked: function(a) {
            var b = a.nodeName.toLowerCase();
            return "input" === b && !!a.checked || "option" === b && !!a.selected
          },
          selected: function(a) {
            return a.parentNode && a.parentNode.selectedIndex, a.selected === !0
          },
          empty: function(a) {
            for (a = a.firstChild; a; a = a.nextSibling)
              if (a.nodeType < 6) return !1;
            return !0
          },
          parent: function(a) {
            return !d.pseudos.empty(a)
          },
          header: function(a) {
            return Z.test(a.nodeName)
          },
          input: function(a) {
            return Y.test(a.nodeName)
          },
          button: function(a) {
            var b = a.nodeName.toLowerCase();
            return "input" === b && "button" === a.type || "button" === b
          },
          text: function(a) {
            var b;
            return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase())
          },
          first: oa(function() {
            return [0]
          }),
          last: oa(function(a, b) {
            return [b - 1]
          }),
          eq: oa(function(a, b, c) {
            return [0 > c ? c + b : c]
          }),
          even: oa(function(a, b) {
            for (var c = 0; b > c; c += 2) a.push(c);
            return a
          }),
          odd: oa(function(a, b) {
            for (var c = 1; b > c; c += 2) a.push(c);
            return a
          }),
          lt: oa(function(a, b, c) {
            for (var d = 0 > c ? c + b : c; --d >= 0;) a.push(d);
            return a
          }),
          gt: oa(function(a, b, c) {
            for (var d = 0 > c ? c + b : c; ++d < b;) a.push(d);
            return a
          })
        }
      }, d.pseudos.nth = d.pseudos.eq;
      for (b in {
          radio: !0,
          checkbox: !0,
          file: !0,
          password: !0,
          image: !0
        }) d.pseudos[b] = ma(b);
      for (b in {
          submit: !0,
          reset: !0
        }) d.pseudos[b] = na(b);

      function qa() {}
      qa.prototype = d.filters = d.pseudos, d.setFilters = new qa, g = ga.tokenize = function(a, b) {
        var c, e, f, g, h, i, j, k = z[a + " "];
        if (k) return b ? 0 : k.slice(0);
        h = a, i = [], j = d.preFilter;
        while (h) {
          (!c || (e = S.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = T.exec(h)) && (c = e.shift(), f.push({
            value: c,
            type: e[0].replace(R, " ")
          }), h = h.slice(c.length));
          for (g in d.filter) !(e = X[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({
            value: c,
            type: g,
            matches: e
          }), h = h.slice(c.length));
          if (!c) break
        }
        return b ? h.length : h ? ga.error(a) : z(a, i).slice(0)
      };

      function ra(a) {
        for (var b = 0, c = a.length, d = ""; c > b; b++) d += a[b].value;
        return d
      }

      function sa(a, b, c) {
        var d = b.dir,
          e = c && "parentNode" === d,
          f = x++;
        return b.first ? function(b, c, f) {
          while (b = b[d])
            if (1 === b.nodeType || e) return a(b, c, f)
        } : function(b, c, g) {
          var h, i, j = [w, f];
          if (g) {
            while (b = b[d])
              if ((1 === b.nodeType || e) && a(b, c, g)) return !0
          } else
            while (b = b[d])
              if (1 === b.nodeType || e) {
                if (i = b[u] || (b[u] = {}), (h = i[d]) && h[0] === w && h[1] === f) return j[2] = h[2];
                if (i[d] = j, j[2] = a(b, c, g)) return !0
              }
        }
      }

      function ta(a) {
        return a.length > 1 ? function(b, c, d) {
          var e = a.length;
          while (e--)
            if (!a[e](b, c, d)) return !1;
          return !0
        } : a[0]
      }

      function ua(a, b, c) {
        for (var d = 0, e = b.length; e > d; d++) ga(a, b[d], c);
        return c
      }

      function va(a, b, c, d, e) {
        for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++)(f = a[h]) && (!c || c(f, d, e)) && (g.push(f), j && b.push(h));
        return g
      }

      function wa(a, b, c, d, e, f) {
        return d && !d[u] && (d = wa(d)), e && !e[u] && (e = wa(e, f)), ia(function(f, g, h, i) {
          var j, k, l, m = [],
            n = [],
            o = g.length,
            p = f || ua(b || "*", h.nodeType ? [h] : h, []),
            q = !a || !f && b ? p : va(p, m, a, h, i),
            r = c ? e || (f ? a : o || d) ? [] : g : q;
          if (c && c(q, r, h, i), d) {
            j = va(r, n), d(j, [], h, i), k = j.length;
            while (k--)(l = j[k]) && (r[n[k]] = !(q[n[k]] = l))
          }
          if (f) {
            if (e || a) {
              if (e) {
                j = [], k = r.length;
                while (k--)(l = r[k]) && j.push(q[k] = l);
                e(null, r = [], j, i)
              }
              k = r.length;
              while (k--)(l = r[k]) && (j = e ? J(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l))
            }
          } else r = va(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : H.apply(g, r)
        })
      }

      function xa(a) {
        for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = sa(function(a) {
            return a === b
          }, h, !0), l = sa(function(a) {
            return J(b, a) > -1
          }, h, !0), m = [function(a, c, d) {
            var e = !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d));
            return b = null, e
          }]; f > i; i++)
          if (c = d.relative[a[i].type]) m = [sa(ta(m), c)];
          else {
            if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) {
              for (e = ++i; f > e; e++)
                if (d.relative[a[e].type]) break;
              return wa(i > 1 && ta(m), i > 1 && ra(a.slice(0, i - 1).concat({
                value: " " === a[i - 2].type ? "*" : ""
              })).replace(R, "$1"), c, e > i && xa(a.slice(i, e)), f > e && xa(a = a.slice(e)), f > e && ra(a))
            }
            m.push(c)
          }
        return ta(m)
      }

      function ya(a, b) {
        var c = b.length > 0,
          e = a.length > 0,
          f = function(f, g, h, i, k) {
            var l, m, o, p = 0,
              q = "0",
              r = f && [],
              s = [],
              t = j,
              u = f || e && d.find.TAG("*", k),
              v = w += null == t ? 1 : Math.random() || .1,
              x = u.length;
            for (k && (j = g !== n && g); q !== x && null != (l = u[q]); q++) {
              if (e && l) {
                m = 0;
                while (o = a[m++])
                  if (o(l, g, h)) {
                    i.push(l);
                    break
                  }
                k && (w = v)
              }
              c && ((l = !o && l) && p--, f && r.push(l))
            }
            if (p += q, c && q !== p) {
              m = 0;
              while (o = b[m++]) o(r, s, g, h);
              if (f) {
                if (p > 0)
                  while (q--) r[q] || s[q] || (s[q] = F.call(i));
                s = va(s)
              }
              H.apply(i, s), k && !f && s.length > 0 && p + b.length > 1 && ga.uniqueSort(i)
            }
            return k && (w = v, j = t), r
          };
        return c ? ia(f) : f
      }
      return h = ga.compile = function(a, b) {
        var c, d = [],
          e = [],
          f = A[a + " "];
        if (!f) {
          b || (b = g(a)), c = b.length;
          while (c--) f = xa(b[c]), f[u] ? d.push(f) : e.push(f);
          f = A(a, ya(e, d)), f.selector = a
        }
        return f
      }, i = ga.select = function(a, b, e, f) {
        var i, j, k, l, m, n = "function" == typeof a && a,
          o = !f && g(a = n.selector || a);
        if (e = e || [], 1 === o.length) {
          if (j = o[0] = o[0].slice(0), j.length > 2 && "ID" === (k = j[0]).type && c.getById && 9 === b.nodeType && p && d.relative[j[1].type]) {
            if (b = (d.find.ID(k.matches[0].replace(ca, da), b) || [])[0], !b) return e;
            n && (b = b.parentNode), a = a.slice(j.shift().value.length)
          }
          i = X.needsContext.test(a) ? 0 : j.length;
          while (i--) {
            if (k = j[i], d.relative[l = k.type]) break;
            if ((m = d.find[l]) && (f = m(k.matches[0].replace(ca, da), aa.test(j[0].type) && pa(b.parentNode) || b))) {
              if (j.splice(i, 1), a = f.length && ra(j), !a) return H.apply(e, f), e;
              break
            }
          }
        }
        return (n || h(a, o))(f, b, !p, e, aa.test(a) && pa(b.parentNode) || b), e
      }, c.sortStable = u.split("").sort(B).join("") === u, c.detectDuplicates = !!l, m(), c.sortDetached = ja(function(a) {
        return 1 & a.compareDocumentPosition(n.createElement("div"))
      }), ja(function(a) {
        return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href")
      }) || ka("type|href|height|width", function(a, b, c) {
        return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2)
      }), c.attributes && ja(function(a) {
        return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value")
      }) || ka("value", function(a, b, c) {
        return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue
      }), ja(function(a) {
        return null == a.getAttribute("disabled")
      }) || ka(K, function(a, b, c) {
        var d;
        return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null
      }), ga
    }(a);
    m.find = s, m.expr = s.selectors, m.expr[":"] = m.expr.pseudos, m.unique = s.uniqueSort, m.text = s.getText, m.isXMLDoc = s.isXML, m.contains = s.contains;
    var t = m.expr.match.needsContext,
      u = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
      v = /^.[^:#\[\.,]*$/;

    function w(a, b, c) {
      if (m.isFunction(b)) return m.grep(a, function(a, d) {
        return !!b.call(a, d, a) !== c
      });
      if (b.nodeType) return m.grep(a, function(a) {
        return a === b !== c
      });
      if ("string" == typeof b) {
        if (v.test(b)) return m.filter(b, a, c);
        b = m.filter(b, a)
      }
      return m.grep(a, function(a) {
        return m.inArray(a, b) >= 0 !== c
      })
    }
    m.filter = function(a, b, c) {
      var d = b[0];
      return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? m.find.matchesSelector(d, a) ? [d] : [] : m.find.matches(a, m.grep(b, function(a) {
        return 1 === a.nodeType
      }))
    }, m.fn.extend({
      find: function(a) {
        var b, c = [],
          d = this,
          e = d.length;
        if ("string" != typeof a) return this.pushStack(m(a).filter(function() {
          for (b = 0; e > b; b++)
            if (m.contains(d[b], this)) return !0
        }));
        for (b = 0; e > b; b++) m.find(a, d[b], c);
        return c = this.pushStack(e > 1 ? m.unique(c) : c), c.selector = this.selector ? this.selector + " " + a : a, c
      },
      filter: function(a) {
        return this.pushStack(w(this, a || [], !1))
      },
      not: function(a) {
        return this.pushStack(w(this, a || [], !0))
      },
      is: function(a) {
        return !!w(this, "string" == typeof a && t.test(a) ? m(a) : a || [], !1).length
      }
    });
    var x, y = a.document,
      z = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
      A = m.fn.init = function(a, b) {
        var c, d;
        if (!a) return this;
        if ("string" == typeof a) {
          if (c = "<" === a.charAt(0) && ">" === a.charAt(a.length - 1) && a.length >= 3 ? [null, a, null] : z.exec(a), !c || !c[1] && b) return !b || b.jquery ? (b || x).find(a) : this.constructor(b).find(a);
          if (c[1]) {
            if (b = b instanceof m ? b[0] : b, m.merge(this, m.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : y, !0)), u.test(c[1]) && m.isPlainObject(b))
              for (c in b) m.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]);
            return this
          }
          if (d = y.getElementById(c[2]), d && d.parentNode) {
            if (d.id !== c[2]) return x.find(a);
            this.length = 1, this[0] = d
          }
          return this.context = y, this.selector = a, this
        }
        return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : m.isFunction(a) ? "undefined" != typeof x.ready ? x.ready(a) : a(m) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), m.makeArray(a, this))
      };
    A.prototype = m.fn, x = m(y);
    var B = /^(?:parents|prev(?:Until|All))/,
      C = {
        children: !0,
        contents: !0,
        next: !0,
        prev: !0
      };
    m.extend({
      dir: function(a, b, c) {
        var d = [],
          e = a[b];
        while (e && 9 !== e.nodeType && (void 0 === c || 1 !== e.nodeType || !m(e).is(c))) 1 === e.nodeType && d.push(e), e = e[b];
        return d
      },
      sibling: function(a, b) {
        for (var c = []; a; a = a.nextSibling) 1 === a.nodeType && a !== b && c.push(a);
        return c
      }
    }), m.fn.extend({
      has: function(a) {
        var b, c = m(a, this),
          d = c.length;
        return this.filter(function() {
          for (b = 0; d > b; b++)
            if (m.contains(this, c[b])) return !0
        })
      },
      closest: function(a, b) {
        for (var c, d = 0, e = this.length, f = [], g = t.test(a) || "string" != typeof a ? m(a, b || this.context) : 0; e > d; d++)
          for (c = this[d]; c && c !== b; c = c.parentNode)
            if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && m.find.matchesSelector(c, a))) {
              f.push(c);
              break
            }
        return this.pushStack(f.length > 1 ? m.unique(f) : f)
      },
      index: function(a) {
        return a ? "string" == typeof a ? m.inArray(this[0], m(a)) : m.inArray(a.jquery ? a[0] : a, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
      },
      add: function(a, b) {
        return this.pushStack(m.unique(m.merge(this.get(), m(a, b))))
      },
      addBack: function(a) {
        return this.add(null == a ? this.prevObject : this.prevObject.filter(a))
      }
    });

    function D(a, b) {
      do a = a[b]; while (a && 1 !== a.nodeType);
      return a
    }
    m.each({
      parent: function(a) {
        var b = a.parentNode;
        return b && 11 !== b.nodeType ? b : null
      },
      parents: function(a) {
        return m.dir(a, "parentNode")
      },
      parentsUntil: function(a, b, c) {
        return m.dir(a, "parentNode", c)
      },
      next: function(a) {
        return D(a, "nextSibling")
      },
      prev: function(a) {
        return D(a, "previousSibling")
      },
      nextAll: function(a) {
        return m.dir(a, "nextSibling")
      },
      prevAll: function(a) {
        return m.dir(a, "previousSibling")
      },
      nextUntil: function(a, b, c) {
        return m.dir(a, "nextSibling", c)
      },
      prevUntil: function(a, b, c) {
        return m.dir(a, "previousSibling", c)
      },
      siblings: function(a) {
        return m.sibling((a.parentNode || {}).firstChild, a)
      },
      children: function(a) {
        return m.sibling(a.firstChild)
      },
      contents: function(a) {
        return m.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : m.merge([], a.childNodes)
      }
    }, function(a, b) {
      m.fn[a] = function(c, d) {
        var e = m.map(this, b, c);
        return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = m.filter(d, e)), this.length > 1 && (C[a] || (e = m.unique(e)), B.test(a) && (e = e.reverse())), this.pushStack(e)
      }
    });
    var E = /\S+/g,
      F = {};

    function G(a) {
      var b = F[a] = {};
      return m.each(a.match(E) || [], function(a, c) {
        b[c] = !0
      }), b
    }
    m.Callbacks = function(a) {
      a = "string" == typeof a ? F[a] || G(a) : m.extend({}, a);
      var b, c, d, e, f, g, h = [],
        i = !a.once && [],
        j = function(l) {
          for (c = a.memory && l, d = !0, f = g || 0, g = 0, e = h.length, b = !0; h && e > f; f++)
            if (h[f].apply(l[0], l[1]) === !1 && a.stopOnFalse) {
              c = !1;
              break
            }
          b = !1, h && (i ? i.length && j(i.shift()) : c ? h = [] : k.disable())
        },
        k = {
          add: function() {
            if (h) {
              var d = h.length;
              ! function f(b) {
                m.each(b, function(b, c) {
                  var d = m.type(c);
                  "function" === d ? a.unique && k.has(c) || h.push(c) : c && c.length && "string" !== d && f(c)
                })
              }(arguments), b ? e = h.length : c && (g = d, j(c))
            }
            return this
          },
          remove: function() {
            return h && m.each(arguments, function(a, c) {
              var d;
              while ((d = m.inArray(c, h, d)) > -1) h.splice(d, 1), b && (e >= d && e--, f >= d && f--)
            }), this
          },
          has: function(a) {
            return a ? m.inArray(a, h) > -1 : !(!h || !h.length)
          },
          empty: function() {
            return h = [], e = 0, this
          },
          disable: function() {
            return h = i = c = void 0, this
          },
          disabled: function() {
            return !h
          },
          lock: function() {
            return i = void 0, c || k.disable(), this
          },
          locked: function() {
            return !i
          },
          fireWith: function(a, c) {
            return !h || d && !i || (c = c || [], c = [a, c.slice ? c.slice() : c], b ? i.push(c) : j(c)), this
          },
          fire: function() {
            return k.fireWith(this, arguments), this
          },
          fired: function() {
            return !!d
          }
        };
      return k
    }, m.extend({
      Deferred: function(a) {
        var b = [
            ["resolve", "done", m.Callbacks("once memory"), "resolved"],
            ["reject", "fail", m.Callbacks("once memory"), "rejected"],
            ["notify", "progress", m.Callbacks("memory")]
          ],
          c = "pending",
          d = {
            state: function() {
              return c
            },
            always: function() {
              return e.done(arguments).fail(arguments), this
            },
            then: function() {
              var a = arguments;
              return m.Deferred(function(c) {
                m.each(b, function(b, f) {
                  var g = m.isFunction(a[b]) && a[b];
                  e[f[1]](function() {
                    var a = g && g.apply(this, arguments);
                    a && m.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [a] : arguments)
                  })
                }), a = null
              }).promise()
            },
            promise: function(a) {
              return null != a ? m.extend(a, d) : d
            }
          },
          e = {};
        return d.pipe = d.then, m.each(b, function(a, f) {
          var g = f[2],
            h = f[3];
          d[f[1]] = g.add, h && g.add(function() {
            c = h
          }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function() {
            return e[f[0] + "With"](this === e ? d : this, arguments), this
          }, e[f[0] + "With"] = g.fireWith
        }), d.promise(e), a && a.call(e, e), e
      },
      when: function(a) {
        var b = 0,
          c = d.call(arguments),
          e = c.length,
          f = 1 !== e || a && m.isFunction(a.promise) ? e : 0,
          g = 1 === f ? a : m.Deferred(),
          h = function(a, b, c) {
            return function(e) {
              b[a] = this, c[a] = arguments.length > 1 ? d.call(arguments) : e, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c)
            }
          },
          i, j, k;
        if (e > 1)
          for (i = new Array(e), j = new Array(e), k = new Array(e); e > b; b++) c[b] && m.isFunction(c[b].promise) ? c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)) : --f;
        return f || g.resolveWith(k, c), g.promise()
      }
    });
    var H;
    m.fn.ready = function(a) {
      return m.ready.promise().done(a), this
    }, m.extend({
      isReady: !1,
      readyWait: 1,
      holdReady: function(a) {
        a ? m.readyWait++ : m.ready(!0)
      },
      ready: function(a) {
        if (a === !0 ? !--m.readyWait : !m.isReady) {
          if (!y.body) return setTimeout(m.ready);
          m.isReady = !0, a !== !0 && --m.readyWait > 0 || (H.resolveWith(y, [m]), m.fn.triggerHandler && (m(y).triggerHandler("ready"), m(y).off("ready")))
        }
      }
    });

    function I() {
      y.addEventListener ? (y.removeEventListener("DOMContentLoaded", J, !1), a.removeEventListener("load", J, !1)) : (y.detachEvent("onreadystatechange", J), a.detachEvent("onload", J))
    }

    function J() {
      (y.addEventListener || "load" === event.type || "complete" === y.readyState) && (I(), m.ready())
    }
    m.ready.promise = function(b) {
        if (!H)
          if (H = m.Deferred(), "complete" === y.readyState) setTimeout(m.ready);
          else if (y.addEventListener) y.addEventListener("DOMContentLoaded", J, !1), a.addEventListener("load", J, !1);
        else {
          y.attachEvent("onreadystatechange", J), a.attachEvent("onload", J);
          var c = !1;
          try {
            c = null == a.f