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
/*! RESOURCE: ssaAddDomEvent */
function ssaAddDomEvent(elements, event, func) {
  for (var i = 0; i < elements.length; i++) {
    var control = g_form.getControl(elements[i]);
    control[event] = func;
  }
}
/*! RESOURCE: GeneralListEditor */
var GeneralListEditor = function(table, relatedList, debug, recordClassName) {
  var output = 'GeneralListEditor\n';
  var headers = table.select('th');
  var rows = table.select('tr');
  this.index = 0;
  this.record = {};
  this.GeneralListRecords = GeneralListEditor.getRecords(headers, rows, relatedList, debug, recordClassName);
  if (!this.GeneralListRecords) {
    console.log('No list found');
    this.GeneralListRecords = {};
  }
  if (debug) {
    console.log(output);
    GeneralListEditor.parseList(this.GeneralListRecords);
  }
};
GeneralListEditor.getRecords = function(headers, rows, relatedList, debug, recordClassName) {
  var output = 'GeneralListEditor.getRecords';
  var GeneralListObj = GeneralListEditor.getGeneralListObject(headers, debug);
  var ret = [];
  rows.each(function(rowElmt) {
    console.log('recordClassName' + recordClassName);
    console.log('Row data type = ' + rowElmt.getAttribute('data-type'));
    if (rowElmt.getAttribute('data-type') == 'list2_row' || rowElmt.getAttribute('record_class') == recordClassName) {
      if (rowElmt.select('td')) {
        var record = Object.create(GeneralListObj);
        var values = [];
        var cols = rowElmt.select('td');
        if (cols != undefined && cols != null && cols != '') {
          cols.each(function(colElmt) {
            if (colElmt != undefined) {
              console.log('Defined element ' + colElmt);
              values.push(colElmt);
            } else {
              console.log('Undefined element');
            }
          });
          var index = 0;
          for (var k in record) {
            console.log('record');
            var value = values[index];
            if (index == 0) {
              if (relatedList == true) {
                if (value.select('input') != undefined) {
                  value.select('input').each(function(elmt) {
                    var sysIdSplit = elmt.getAttribute('id').split('_');
                    value = sysIdSplit[sysIdSplit.length - 1];
                  });
                } else {
                  console.log('No Input in TD');
                }
              } else {
                if (value.select('span') != undefined) {
                  value.select('span').each(function(elmt) {
                    if (elmt.getAttribute('id') != null && elmt.getAttribute('id').Length != 0) {
                      var sysIdSplit = elmt.getAttribute('id').split('_');
                      value = sysIdSplit[0];
                    }
                  });
                } else {
                  console.log('No Span in TD');
                }
              }
            }
            record[k] = value;
            index += 1;
          }
          ret.push(record);
        }
      } else {
        console.log('No TD found in Row');
      }
    }
  });
  if (debug) {
    console.log(output);
  }
  return ret;
};
GeneralListEditor.getGeneralListObject = function(headers, debug) {
  var output = '';
  var ret = {};
  headers.each(function(elmt) {
    var property = '"' + elmt.innerText + '"';
    output += 'Header dat type = ' + elmt.getAttribute('data-type');
    if (elmt.getAttribute('data-type') != 'list2_hdrcell') {
      property = '"sys_id"';
    }
    ret[property] = {};
  });
  if (debug) {
    console.log(output);
  }
  return ret;
};
GeneralListEditor.parseList = function(GeneralListRecords) {
  var output = 'GeneralListEditor.parseList\n';
  for (var i = 0; i < GeneralListRecords.length; i += 1) {
    output += 'Record #: ' + i + '\n';
    var record = GeneralListRecords[i];
    for (var k in record) {
      var htmlElement = record[k];
      var value = '';
      if (k == '"sys_id"') {
        value = htmlElement;
      } else {
        if (htmlElement != undefined)
          value = htmlElement.innerText;
      }
      output += 'Property: ' + k + ' = ' + value + '\n';
    }
    console.log(output + '\n\n');
  }
};
GeneralListEditor.validateRequired = function(elmt, property, value) {
  if (property == '"' + value + '"') {
    if (elmt.innerText == '') {
      return false;
    }
  }
};
GeneralListEditor.prototype.next = function() {
  this.record = this.GeneralListRecords[this.index];
  this.index += 1;
  if (this.index <= this.GeneralListRecords.length) {
    return true;
  }
  return false;
};
GeneralListEditor.prototype.getValue = function(fieldName) {
  var ele = this.record['"' + fieldName + '"'];
  var value = '';
  if (fieldName == 'sys_id') {
    value = ele;
  } else {
    if (ele != undefined)
      value = ele.innerText;
  }
  return value;
};
GeneralListEditor.prototype.setValue = function(fieldName, newText) {
  var ele = this.record['"' + fieldName + '"'];
  var oldText = ele.innerText;
  var html = ele.innerHTML + '';
  ele.innerHTML = html.replace(oldText, newText);
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
/*! RESOURCE: HR_Case_UI */
var HR_Case_UI = Class.create();
HR_Case_UI.prototype = {
  initialize: function() {},
  validatePhoneNumberForField: function(number, isLoading, phoneField) {
    if (isLoading || !number) {
      g_form.hideFieldMsg(phoneField, true);
      return;
    }
    var ajax = new GlideAjax('hr_CaseAjax');
    ajax.addParam('sysparm_name', 'isPhoneNumberValid');
    ajax.addParam('sysparm_phoneNumber', number);
    ajax.getXMLAnswer(function(answer) {
      var result = answer.evalJSON();
      if (result.valid) {
        if (number != result.number) {
          g_form.setValue(phoneField, result.number);
        }
      } else {
        g_form.hideFieldMsg(phoneField, true);
        g_form.showErrorBox(phoneField, getMessage('Invalid phone number. Country Code is required.'));
        return;
      }
      g_form.hideFieldMsg(phoneField, true);
    });
  },
  setRegionforCountry: function(country) {
    var result = {};
    var response = '';
    var ajax = new GlideAjax('HRAjaxHelper');
    ajax.addParam('sysparm_name', 'getRegionforCountry');
    ajax.addParam('sysparm_country', country);
    ajax.getXMLAnswer(function(answer) {
      result = answer.evalJSON();
      console.log("Before RESULT " + result.region);
      response = result.region;
      console.log("response " + response);
      g_form.setValue('bank_country_region', response);
    });
    console.log("Before Returning response " + response);
    return response;
  },
  validateBankAccountNumberForField: function(bankAccountNumValue, bankAccountNumField, bankCountryValue) {
    if (!bankAccountNumValue || !bankAccountNumField || !bankCountryValue) {
      g_form.hideFieldMsg(bankAccountNumField, true);
      return true;
    }
    bankCountryValue = bankCountryValue.toLowerCase();
    console.log("is_country_brazil" + bankCountryValue);
    if ("brazil" == bankCountryValue) {
      var dash_index = bankAccountNumValue.indexOf('-');
      console.log("dash_index" + dash_index);
      if (dash_index != -1) {
        g_form.hideFieldMsg(bankAccountNumField, true);
        g_form.showErrorBox(bankAccountNumField, getMessage('Invalid Bank Account Number. No dashes allowed in Bank Account Number.'));
        return;
      } else
        g_form.hideFieldMsg(bankAccountNumField, true);
    }
    return true;
  },
  validateRoutingNumberForField: function(routingNumValue, routingNumField, bankCountryValue) {
    if (!routingNumValue || !routingNumField || !bankCountryValue) {
      g_form.hideFieldMsg(routingNumField, true);
      return true;
    }
    bankCountryValue = bankCountryValue.toLowerCase();
    switch (bankCountryValue) {
      case "australia":
        var matches = routingNumValue.match(/^[0-9]{2}-[0-9]{2}-[0-9]{2}$/);
        console.log("matches" + matches);
        if (matches == null || matches == undefined) {
          g_form.hideFieldMsg(routingNumField, true);
          g_form.showErrorBox(routingNumField, getMessage('Invalid Routing Number. Format should be xx-xx-xx.'));
          return;
        } else
          g_form.hideFieldMsg(routingNumField, true);
        console.log("matches:" + matches);
        break;
      default:
        break;
    }
    return true;
  },
  validateBankCodeForField: function(bankCodeValue, bankCodeField, bankCountryValue) {
    if (!bankCodeValue || !bankCodeField || !bankCountryValue) {
      g_form.hideFieldMsg(bankCodeField, true);
      return true;
    }
    bankCountryValue = bankCountryValue.toLowerCase();
    var matches = bankCodeValue.match(/^[0-9]{3}$/);
    console.log("matches" + matches);
    if (matches == null || matches == undefined) {
      g_form.hideFieldMsg(bankCodeField, true);
      g_form.showErrorBox(bankCodeField, getMessage('Invalid Institution Number/Bank Code. Should have a 3-digit value.'));
      return;
    } else
      g_form.hideFieldMsg(bankCodeField, true);
    console.log("matches:" + matches);
    return true;
  },
  validateBankTransitNumberForField: function(bankTransitNumberValue, bankTransitNumberField, bankCountryValue) {
    if (!bankTransitNumberValue || !bankTransitNumberField || !bankCountryValue) {
      g_form.hideFieldMsg(bankTransitNumberField, true);
      return true;
    }
    bankCountryValue = bankCountryValue.toLowerCase();
    var matches = bankTransitNumberValue.match(/^[0-9]{5}$/);
    console.log("matches" + matches);
    if (matches == null || matches == undefined) {
      g_form.hideFieldMsg(bankTransitNumberField, true);
      g_form.showErrorBox(bankTransitNumberField, getMessage('Invalid Bank Transit Number. Should have a 5-digit value.'));
      return;
    } else
      g_form.hideFieldMsg(bankTransitNumberField, true);
    return true;
  },
  validateClabeNumberForField: function(clabeNumberValue, clabeNumberField, bankCountryValue) {
    if (!clabeNumberValue || !clabeNumberField || !bankCountryValue) {
      g_form.hideFieldMsg(clabeNumberField, true);
      return true;
    }
    bankCountryValue = bankCountryValue.toLowerCase();
    var matches = clabeNumberValue.match(/^[0-9]{5}$/);
    console.log("matches" + matches);
    if (matches == null || matches == undefined) {
      g_form.hideFieldMsg(clabeNumberField, true);
      g_form.showErrorBox(clabeNumberField, getMessage('Invalid Clabe Number. Should have a 5-digit value.'));
      return;
    } else
      g_form.hideFieldMsg(clabeNumberField, true);
    return true;
  },
  validateBranchCodeForField: function(branchCodeValue, branchCodeField, bankCountryValue) {
    if (!branchCodeValue || !branchCodeField || !bankCountryValue) {
      g_form.hideFieldMsg(branchCodeField, true);
      return true;
    }
    bankCountryValue = bankCountryValue.toLowerCase();
    var matches = branchCodeValue.match(/^[0-9]{4}$/);
    console.log("matches" + matches);
    if (matches == null || matches == undefined) {
      g_form.hideFieldMsg(branchCodeField, true);
      g_form.showErrorBox(branchCodeField, getMessage('Invalid Branch Code. Should have a 4-digit value.'));
      return;
    } else
      g_form.hideFieldMsg(branchCodeField, true);
    return true;
  },
  type: 'HR_Case_UI'
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
/*! RESOURCE: ssaGetAjaxResponseXmlElements */
function ssaGetAjaxResponseXmlElements(ajaxResponse, tagName, xmlString, verbose) {
  var debug = 'ssaGetAjaxResponseXmlElements\n';
  debug += 'Getting XML elements for tagName: ' + tagName + '\n';
  var ret = {};
  var elements = [];
  if (ajaxResponse != false) {
    elements = ajaxResponse.responseXML.getElementsByTagName(tagName);
  } else if (xmlString != false) {
    var xmlDoc = ssaXmlDocFromString(xmlString);
    elements = xmlDoc.getElementsByTagName(tagName);
  }
  debug += 'elements = ' + elements + '\n';
  debug += 'Star reading the elements...\n';
  debug += 'Number of elements found: ' + elements.length + '\n';
  for (var i = 0; i < elements.length; i++) {
    var name = elements[i].getAttribute("name");
    var value = elements[i].getAttribute("value");
    debug += name + ' = ' + value + '\n';
    ret[name] = value;
  }
  debug += 'Finished reading the elements.\n';
  if (verbose != false) {
    ret.debug = debug;
  }
  return ret;
}
/*! RESOURCE: Setting Page Title */
function setTitle() {
  try {
    if (g_form.isNewRecord()) {
      var title = 'ServiceNow SURF';
      top.document.title = title;
    }
  } catch (e) {}
}
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
/*! RESOURCE: ssaSetPrecisionTermByTermField */
function ssaSetPrecisionTermByTermField() {
  var source_field = 'u_term_months_and_days';
  var source_hint_field = 'u_term';
  var target_field = 'u_contract_duration';
  if (g_form.getTableName() == 'sales_opportunity_item') {
    source_hint_field = 'u_new_term';
    target_field = 'u_term';
  } else if (g_form.getTableName() == 'sales_contract') {
    target_field = 'duration';
  }
  var newTermValue = g_form.getValue(source_hint_field);
  var termInMonthsAndDays = g_form.getValue(source_field);
  if (termInMonthsAndDays == '' && (g_form.getDisplayBox('u_product_price') && g_form.getDisplayBox('u_product_price').value.indexOf('Extended Support') > -1)) {
    termInMonthsAndDays = '0 Month';
  } else if (termInMonthsAndDays == '') {
    termInMonthsAndDays = g_scratchpad.u_term_months_and_days;
  }
  if (termInMonthsAndDays != '' && termInMonthsAndDays) {
    var labelTag = document.createElement("label");
    labelTag.className = 'control-label';
    labelTag.innerHTML = "(" + termInMonthsAndDays + ")";
    labelTag.title = "Precision Term : " + newTermValue;
    surfAddFieldAddOn(target_field, labelTag.outerHTML, '_precision_term_span');
  }
}

function calculateSSAMonthsAndDays() {
  var startDateField = 'u_order_term_start_date';
  var endDateField = 'u_order_term_end_date';
  if (g_form.getTableName() == 'sales_opportunity_item') {
    startDateField = 'u_term_start_date';
    endDateField = 'u_term_end_date';
  } else if (g_form.getTableName() == 'sales_contract') {
    startDateField = 'start_date';
    endDateField = 'end_date';
  }
  var monthsAndDaysAjax = new GlideAjax('SSAOpportunityAjax');
  monthsAndDaysAjax.addParam('sysparm_name', 'ajaxFunction_getMonthsAndDays');
  monthsAndDaysAjax.addParam('sysparm_sys_id', g_form.getUniqueValue());
  monthsAndDaysAjax.addParam('sysparm_table', g_form.getTableName());
  monthsAndDaysAjax.addParam('sysparm_u_order_term_start_date', g_form.getValue(startDateField));
  monthsAndDaysAjax.addParam('sysparm_u_order_term_end_date', g_form.getValue(endDateField));
  monthsAndDaysAjax.getXML(function(response) {
    var result = response.responseXML.getElementsByTagName("result");
    var months = result[0].getAttribute("months");
    var days = result[0].getAttribute("days");
    var monthsAndDaysStr = '';
    if (months != null && days != null) {
      if (days == 0) {
        if (months != 0) {
          monthsAndDaysStr = months + ' Months';
        }
      } else {
        if (months == 0) {
          monthsAndDaysStr = days + ' Days';
        } else {
          monthsAndDaysStr = months + ' Months' + ', ' + days + ' Days';
        }
      }
    }
    g_form.setValue('u_term_months_and_days', monthsAndDaysStr);
    ssaSetPrecisionTermByTermField();
  });
}
/*! RESOURCE: ssaSetCurrencyField */
function ssaSetCurrencyField(fieldName, str) {
  try {
    if (str.indexOf(';') != -1) {
      var currencyStr = str.split(';');
      var currency = currencyStr[0];
      var amount = currencyStr[1];
      g_form.setValue(fieldName + '.display', amount);
      g_form.setValue(fieldName + '.currency', currency);
      g_form.setValue(fieldName, currency + ';' + amount);
    }
  } catch (e) {
    throw "ssaSetCurrencyFieldException: " + e;
  }
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
/*! RESOURCE: getMeetingDetails */
var getMeetingDetails = Class.create();
getMeetingDetails.prototype = {
  initialize: function() {},
  getMeetingDetails: function(month, year, user) {
    var ga = new GlideAjax('MeetingQuotaAjax');
    ga.addParam('sysparm_name', 'getMeetings');
    ga.addParam('sysparm_month', month);
    ga.addParam('sysparm_year', year);
    ga.addParam('sysparm_user', user);
    ga.getXMLAnswer(this._getMeetingCount.bind(this));
  },
  _getMeetingCount: function(response) {
    var result = JSON.parse(response);
    var completed_meetings = 0;
    var scheduled_meetings = 0;
    var notAccepted_meeting = 0;
    if (result != null) {
      if (result.completed) {
        g_form.setValue('u_meetings_completed', result.completed);
        completed_meetings = parseInt(result.completed);
      } else {
        g_form.setValue('u_meetings_completed', '0');
      }
      if (result.scheduled) {
        g_form.setValue('u_meeting_scheduled', result.scheduled);
        scheduled_meetings = parseInt(result.scheduled);
      } else {
        g_form.setValue('u_meeting_scheduled', '0');
      }
      if (result.notAccepted) {
        g_form.setValue('u_not_accepted_meetings', result.notAccepted);
        notAccepted_meeting = parseInt(result.notAccepted);
      } else
        g_form.setValue('u_not_accepted_meetings', 0);
    }
    g_form.setValue('u_total_meetings', completed_meetings + scheduled_meetings + notAccepted_meeting);
    var quota = g_form.getValue('u_meeting_quota').replace(',', '');
    if (quota && quota != '0') {
      quota = g_form.getValue('u_meeting_quota').replace(',', '');
      var _attain = 0;
      _attain = ((completed_meetings * 100) / quota).toFixed(0);
      g_form.setValue('u_attain_2', _attain + '%');
    } else {
      g_form.setValue('u_attain_2', '0' + '%');
    }
  },
  type: 'getMeetingDetails'
};
/*! RESOURCE: Lead List view five star rating */
try {
  var sales_lead_list_view_indx = document.URL.indexOf('sales_lead_list.do');
  if (sales_lead_list_view_indx != -1) {
    document.onreadystatechange = function() {
      if (document.readyState === "complete") {
        var trlist = $j('table[data-list_id="sales_lead"] > thead > tr');
        var index = -1;
        if (trlist && trlist.length > 0) {
          for (var i = 0; trlist[0].childNodes && i < trlist[0].childNodes.length; i++) {
            if ((trlist[0].childNodes[i].attributes['name'] && trlist[0].childNodes[i].attributes['name'].value == 'u_lead_score_star') || (trlist[0].childNodes[i].attributes['data-column-label'] && trlist[0].childNodes[i].attributes['data-column-label'].value == 'u_lead_score_star')) {
              index = i;
              break;
            }
          }
          if (index != -1) {
            var regex = '<a .*>(.*)<\/a>';
            var numregex = /^\d*\.?\d*$/;
            var starifyList = function() {
              $j('table[data-list_id="sales_lead"]').append('<style>.list-star-label { color: #ddd; float: right; margin: 1px;font-size: 22px;display: inline-block;} .list-star-label-full:before {display: inline-block;} .list-star-label-half:before { width: 11px;overflow: hidden;position: absolute;display: inline-block;margin-top:6px;margin-left: 2px} .list-custom-5star-rating {width: 140px; float: left;}</style>');
              var trbodylist = $j('table[data-list_id="sales_lead"] > tbody > tr');
              for (var j = 0; trbodylist && j < trbodylist.length; j++) {
                if (!trbodylist[j].childNodes[index]) {
                  continue;
                }
                var ld_scr_ratn = trbodylist[j].childNodes[index].innerHTML;
                if (ld_scr_ratn && ld_scr_ratn.indexOf('<a class') != -1) {
                  var matches = ld_scr_ratn.match(regex);
                  if (matches && matches.length > 1) {
                    ld_scr_ratn = matches[1];
                  }
                }
                if (!numregex.test(ld_scr_ratn)) {
                  ld_scr_ratn = '0';
                }
                var ld_scr_ratn_num;
                try {
                  ld_scr_ratn_num = parseFloat(ld_scr_ratn);
                } catch (e) {}
                if (!isNaN(ld_scr_ratn_num) || ld_scr_ratn == '' || ld_scr_ratn == ' (empty) ') {
                  trbodylist[j].childNodes[index].innerHTML = '<div class="list-custom-5star-rating"><label class = "icon-star-empty list-star-label list-star-label-full" ' + (ld_scr_ratn_num == 5 ? 'checked' : '') + '></label><label class="icon-star-empty list-star-label list-star-label-half" ' + (ld_scr_ratn_num == 4.5 ? 'checked' : '') + '></label><label class = "icon-star-empty list-star-label list-star-label-full" ' + (ld_scr_ratn_num == 4 ? 'checked' : '') + '></label><label class="icon-star-empty list-star-label list-star-label-half" ' + (ld_scr_ratn_num == 3.5 ? 'checked' : '') + '></label><label class = "icon-star-empty list-star-label list-star-label-full" ' + (ld_scr_ratn_num == 3 ? 'checked' : '') + '></label><label class="icon-star-empty list-star-label list-star-label-half" ' + (ld_scr_ratn_num == 2.5 ? 'checked' : '') + '></label><label class = "icon-star-empty list-star-label list-star-label-full" ' + (ld_scr_ratn_num == 2 ? 'checked' : '') + '></label><label class="icon-star-empty list-star-label list-star-label-half" ' + (ld_scr_ratn_num == 1.5 ? 'checked' : '') + '></label><label class = "icon-star-empty list-star-label list-star-label-full" ' + (ld_scr_ratn_num == 1 ? 'checked' : '') + '></label> <label class="icon-star-empty list-star-label list-star-label-half" ' + (ld_scr_ratn_num == 0.5 ? 'checked' : '') + '></label></div>';
                }
              }
              $j('.list-star-label[checked]').css('color', '#FFD700').removeClass('icon-star-empty').addClass('icon-star').nextAll('label').css('color', '#FFD700').removeClass('icon-star-empty').addClass('icon-star');
              $j('label.list-star-label-half[checked]').prev().css('color', '#FFD700');
            };
            starifyList();
            var observeDOM = (function() {
              var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
                eventListenerSupported = window.addEventListener;
              return function(obj, callback) {
                if (MutationObserver) {
                  var obs = new MutationObserver(function(mutations, observer) {
                    if (mutations[0].addedNodes.length)
                      callback();
                  });
                  obs.observe(obj, {
                    childList: true,
                    subtree: false
                  });
                } else if (eventListenerSupported) {
                  obj.addEventListener('DOMNodeInserted', callback, false);
                }
              };
            })();
            observeDOM(document.getElementById('sales_lead'), function() {
              starifyList();
            });
          }
        }
      }
    };
  }
} catch (e) {}
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
/*! RESOURCE: surf.newhire.redirect */
(function(window) {
  var url = window.parent.location.href;
  ajaxNewHireRole("sn_hr_sp.hrsp_new_hire", url);
})(window);

function ajaxNewHireRole(role, url) {
  var ga = new GlideAjax('CheckUserRole');
  ga.addParam('sysparm_name', 'u_hasRole');
  ga.addParam('sysparm_role', role);
  ga.addParam('sysparm_url', url);
  ga.getXML(ajaxNewHireRoleResponse);
}

function ajaxNewHireRoleResponse(response) {
  var answer = response.responseXML.documentElement.getAttribute("answer");
  if (answer) {
    window.location.href = '/newhire';
  }
}
/*! RESOURCE: 3CLogic_Global */
function load3cLogic() {
  if ((window.parent.location.href.indexOf('nav_to.do') < 0 && window.parent.location.href.indexOf('navpage') < 0)) {
    var openFrame = '<div id="openframeCont" style="position: relative;">\
<div ng-controller="OpenFrame" style="background-color:transparent;" ng-cloak="true" class="ng-cloak openFrame">\
<of-main-frame data="config"></of-main-frame>\
</div>\
</div>';
    jQuery('body').prepend(openFrame);
    setTimeout(function() {
      if ($j("#mainFrame").length == 0) {
        compileDirective();
      }
    }, 5000);
  }
}

function compileDirective() {
  var openframeCont = jQuery('#openframeCont');
  angular.element(document).injector().invoke(function($rootScope, $compile) {
    jQuery('body').prepend($compile(openframeCont)($rootScope));
  });
}
var Open3CFrameWork = function() {};
Open3CFrameWork.prototype.openSechduleFollowup = function(params, flag) {
  var width = document.body.clientWidth;
  var gdw = new GlideDialogWindow('display_activity');
  gdw.setTitle('Create a New Activity');
  gdw.setSize(300, 300);
  gdw.setPreference('sysparm_view', 'default');
  gdw.setPreference("sysparm_doc_width", width);
  gdw.setPreference("sysparm_activity_type", 'Schedule - Follow Up');
  gdw.setPreference("sysparm_lead_sysid", params[0]);
  gdw.setPreference("sysparm_lead_selected_sysids", [params[0]]);
  gdw.render();
  if (flag) {
    setTimeout(function() {
      document.getElementById("display_activity").style.left = '270px';
    }, 600);
  }
};
Open3CFrameWork.prototype.getLeadInfo = function(lead) {
  var name = lead.name,
    firstname = lead.first_name,
    lastname = lead.last_name;
  if (!name || name.length === 0) {
    if ((!firstname || firstname.length === 0) && (!lastname || lastname.length === 0)) {
      name = "noname";
    } else {
      name = firstname + " " + lastname;
    }
  }
  var sysid = lead.sys_id,
    metaData = {
      "countrycode": lead.country,
      "phoneNumber": lead.phone.replace(/\D+/g, ''),
      "sys_id": sysid
    },
    accountContext = {
      "entity": "Lead",
      "contact_name": name,
      "additionalFieldsCaptured": {
        "account": lead.account,
        "contact": lead.contact
      },
      "query": "sys_id=" + sysid + "&sysparm_view=ess",
      "value": sysid
    };
  var callContext = [];
  var emptyContext = {};
  callContext.push(emptyContext);
  callContext.push(accountContext);
  var data = {
    "metaData": metaData,
    "data": callContext
  };
  var payload = {
    "type": "OUTGOING_CALL",
    "data": data
  };
  var context = {
    "payload": payload,
    "method": "openframe_communication"
  };
  return context;
};
Open3CFrameWork.prototype.get3cInfo = function(phoneField) {
  var name = g_form.getValue('name'),
    firstname = g_form.getValue('first_name'),
    lastname = g_form.getValue('last_name');
  if (!name || name.length === 0) {
    if ((!firstname || firstname.length === 0) && (!lastname || lastname.length === 0)) {
      name = "noname";
    } else {
      name = firstname + " " + lastname;
    }
  }
  var sysid = g_form.getUniqueValue(),
    metaData = {
      "countrycode": g_form.getValue('country'),
      "phoneNumber": g_form.getValue(phoneField).replace(/\D+/g, ''),
      "sys_id": sysid
    },
    accountContext = {
      "entity": "Lead",
      "contact_name": name,
      "additionalFieldsCaptured": {
        "account": g_form.getValue('account'),
        "contact": g_form.getValue('contact')
      },
      "query": "sys_id=" + sysid + "&sysparm_view=ess",
      "value": sysid
    };
  var callContext = [];
  var emptyContext = {};
  callContext.push(emptyContext);
  callContext.push(accountContext);
  var data = {
    "metaData": metaData,
    "data": callContext
  };
  var payload = {
    "type": "OUTGOING_CALL",
    "data": data
  };
  var context = {
    "payload": payload,
    "method": "openframe_communication"
  };
  CustomEvent.fireAll('openframe_request', context);
};
Open3CFrameWork.prototype.showOpenFrame = function(context, target) {
  var data = {
    "event": "blockCallButton",
    "target": target
  };
  window.postMessage(data, '*');
  if (this.checkCondition()) {
    CustomEvent.fireTop("openframe_show");
  }
  CustomEvent.fireAll("openframe_request", context);
};
Open3CFrameWork.prototype.load3clogic = function() {
  if (this.checkCondition()) {
    var openFrame = '<div id="openframeCont" style="position: relative;">\
<div ng-controller="OpenFrame" style="background-color:transparent;" ng-cloak="true" class="ng-cloak openFrame">\
<of-main-frame data="config"></of-main-frame>\
</div>\
</div>';
    if (!window.top.document.getElementById("openframeCont") && !window.top.document.querySelector(".openFrame")) {
      jQuery('body').prepend(openFrame);
      setTimeout(function() {
        if (jQuery("#mainFrame").length == 0) {
          this.compileDirective();
        }
      }, 5000);
    }
  }
};
Open3CFrameWork.prototype.compileDirective = function() {
  var openframeCont = jQuery('#openframeCont');
  angular.element(document).injector().invoke(function($rootScope, $compile) {
    jQuery('body').prepend($compile(openframeCont)($rootScope));
  });
};
Open3CFrameWork.prototype.addPhoneIcon = function(input, mobile_phone) {
  var field1 = input,
    field2 = mobile_phone,
    className = 'icon ref-button icon-phone btn btn-default btn-ref',
    span1Id,
    span2Id;
  var phone,
    hyperLink1,
    hyperLink2,
    mobile;
  if (document.getElementById('sp_formfield_' + input)) {
    className = ' input-group-btn';
    document.querySelector("#sp_formfield_phone").parentNode.className = 'input-group';
    field1 = 'sp_formfield_' + field1;
    field2 = 'sp_formfield_' + field2;
    phone = angular.element(document.getElementById(field1))[0].value;
    mobile = angular.element(document.getElementById(field2))[0].value;
    span1Id = "sp_formfield_" + 'call_btn1';
    span2Id = "sp_formfield_" + 'call_btn2';
    hyperLink1 = document.createElement('a'),
      hyperLink2 = document.createElement('a'),
      hyperLink1.className = 'btn btn-default btn-ref',
      hyperLink2.className = 'btn btn-default btn-ref';
    var icon1 = document.createElement('i'),
      icon2 = document.createElement('i');
    icon1.className = 'fa fa-phone',
      icon2.className = 'fa fa-phone';
    hyperLink1.appendChild(icon1);
    hyperLink2.appendChild(icon2);
  } else if (document.getElementById(g_form.tableName + '.' + input)) {
    field1 = g_form.tableName + '.' + field1;
    field2 = g_form.tableName + '.' + field2;
    phone = g_form.getValue(field1);
    span1Id = g_form.tableName + 'call_btn1';
    span2Id = g_form.tableName + 'call_btn2';
  }
  var callspan1 = document.createElement('span'),
    callspan2;
  callspan1.className = className;
  callspan1.alt = 'Call';
  callspan1.title = 'Call';
  callspan1.id = span1Id;
  if (mobile_phone) {
    document.querySelector("#sp_formfield_u_mobile_phone").parentNode.className = 'input-group';
    callspan2 = document.createElement('span');
    callspan2.className = className;
    callspan2.alt = 'Call';
    callspan2.title = 'Call';
    callspan2.id = span2Id;
  }
  if (field1.indexOf('sp_formfield_') > -1) {
    if (hyperLink1) {
      callspan1.appendChild(hyperLink1);
    }
    callspan1.setAttribute('onclick', 'NOW.MKT.clickToCall("' + span1Id + '","' + phone + '")');
    angular.element(document.getElementById(field1))[0].parentNode.appendChild(callspan1);
  } else {
    callspan1.setAttribute('onclick', 'NOW.MKT.clickToCall("' + span1Id + '","' + phone + '")');
    document.getElementById(field1).parentNode.nextSibling.appendChild(callspan1);
  }
  if (field2.indexOf('sp_formfield_') > -1) {
    if (hyperLink2) {
      callspan2.appendChild(hyperLink2);
    }
    callspan2.setAttribute('onclick', 'NOW.MKT.clickToCall("' + span2Id + '","' + mobile + '")');
    angular.element(document.getElementById(field2))[0].parentNode.appendChild(callspan2);
  } else {
    callspan1.setAttribute('onclick', 'NOW.MKT.clickToCall("' + span2Id + '","' + mobile + '")');
    document.getElementById(field2).parentNode.nextSibling.appendChild(callspan2);
  }
};
Open3CFrameWork.prototype.constructDOM = function(field, spanId, number, callSpan) {
  if (field.indexOf('sp_formfield_') > -1) {
    callSpan.setAttribute('onclick', 'NOW.MKT.clickToCall("' + spanId + '","' + number + '")');
    angular.element(document.getElementById(field))[0].parentNode.appendChild(callSpan);
  } else {
    callSpan.setAttribute('onclick', 'NOW.MKT.clickToCall("' + spanId + '","' + number + '")');
    document.getElementById(field).parentNode.nextSibling.appendChild(callSpan);
  }
};
Open3CFrameWork.prototype.blockCallButton = function(target) {
  document.getElementById(target).setAttribute('disabled', 'disabled');
  document.getElementById(target).style.pointerEvents = 'none';
  setTimeout(function() {
    document.getElementById(target).removeAttribute('disabled');
    document.getElementById(target).style.pointerEvents = 'auto';
  }, 3000);
};
Open3CFrameWork.prototype.checkCondition = function() {
  return (
    window.parent.location.href.indexOf('nav_to.do') < 0 &&
    window.parent.location.href.indexOf('navpage') < 0
  );
};
/*! RESOURCE: generalLoader */
function generalLoader(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    };
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
/*! RESOURCE: SalesTeamGlobalUIScript */
IgnoreConflict = false;
var SaleTeamBulkAssignment = Class.create();
SaleTeamBulkAssignment.prototype = {
  initialize: function(g_list, type) {
    this.g_list = g_list;
    this.type = type;
    this.gdw = new GlideDialogWindow("sales_team_bulk_assignment");
  },
  showDialog: function() {
    var width = document.body.clientWidth;
    var selectedIds = this.g_list.getChecked();
    this.gdw.setTitle("Sales Team Bulk Assignment");
    this.gdw.setPreference('sysparm_selectedIds', selectedIds);
    this.gdw.setPreference('sysparm_tableName', this.g_list.tableName);
    this.gdw.setPreference("sysparm_doc_width", width);
    this.gdw.setPreference("sysparm_list_type", this.type);
    this.gdw.setPreference("sysparm_bulk_assignment_service", this);
    this.gdw.setWidth(950);
    this.gdw.render();
  },
  closeDialog: function() {
    this.g_list.refresh();
    this.gdw.destroy();
  },
  updateRecords: function(table, ids) {
    ids = ids.split(",");
    if (this._validateDate(ids)) {
      var data = this._buildJSON(ids);
      this._callAjax(table, data);
    }
  },
  _buildJSON: function(ids) {
    var data = [];
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var tx_status_flag = $j("#" + id + "_tx_status_flag").val();
      if (tx_status_flag == "success") {
        continue;
      }
      var rec = {};
      rec.u_rec_sys_id = id;
      rec.u_user = $j("#" + id + "_user").val();
      rec.u_job_function = $j("#" + id + "_job_function").val();
      rec.u_start_date = $j("#" + id + "_start_date").val();
      rec.u_end_date = $j("#" + id + "_end_date").val();
      rec.u_old_sta_end_date = $j("#" + id + "_old_sta_end_date").val();
      var isPrimary = $j("#ni\\." + id + "_primary").attr('checked');
      rec.u_primary = (isPrimary == 'checked') ? true : false;
      rec.ignoreConflict = IgnoreConflict;
      data.push(rec);
    }
    return data;
  },
  _validateDate: function(ids) {
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var start_date = $j("#" + id + "_start_date").val();
      var end_date = $j("#" + id + "_end_date").val();
      start_date = start_date ? Date.parse(start_date) : "";
      end_date = end_date ? Date.parse(end_date) : "";
      if (end_date && end_date < start_date) {
        $j("#" + id + "_end_date").focus();
        alert("End date must be after start date");
        return false;
      }
    }
    return true;
  },
  _callAjax: function(table, data) {
    jslog('---------------Ignore: ' + IgnoreConflict);
    var ga = new GlideAjax("SalesTeamAjax");
    ga.addParam('sysparm_name', 'bulkAssignment');
    ga.addParam('sysparm_table', table);
    ga.addParam("sysparm_list_type", this.type);
    ga.addParam('sysparm_data', JSON.stringify(data));
    ga.getXML(assignmentCallBack);
    var that = this;

    function assignmentCallBack(response) {
      var answer = response.responseXML.documentElement.getAttribute("answer");
      answer = JSON.parse(answer);
      for (var key in answer) {
        var rec = answer[key];
        if (rec.success == true) {
          $j("#" + key + "_tx_status_flag").val("success");
          $j("#" + key + "_tx_status").html('<img src="eValuePrompter-4.png" width="20" height="20"/>');
          that._makeFieldReadOnly(key);
        } else {
          $j("#" + key + "_tx_status_flag").val("failed");
          $j("#" + key + "_tx_status").html(' <img src="icons_important_25x.png" width="25" height="25"/> <span class="outputmsg outputmsg_error  notification-error"> ' + rec.errorMessageForUser + "</span>");
          if (rec.errorMessageInternal == 'Conflict') {
            IgnoreConflict = true;
            jslog('----------------Ignore condition true');
          } else {
            jslog('----------------Ignore condition false');
          }
        }
      }
    }
  },
  _makeFieldReadOnly: function(id) {
    $j("#" + id + " input").prop('disabled', true);
    $j("#" + id + " .icon-search").hide();
  },
  type: "SaleTeamBulkAssignment"
};
addAfterPageLoadedEvent(function() {});
/*! RESOURCE: NotifyOnTaskClient */
function NotifyOnTaskClient(source_table, sys_id, confId, uiPage, siProcessor) {
  this.sourceTable = source_table;
  this.sysId = sys_id;
  this.confId = confId;
  this.uiPage = uiPage || 'add_to_conference';
  this.siProcessor = siProcessor || 'NotifyOnTaskAjaxProcessor_V2';
  this.number = null;
  this.submitCallback = null;
  this.successCallback = null;
  this.errorCallback = null;
  this.cancelCallback = null;
  this.notifyType = "sms";
  this.showLoading = false;
  this.showAllMsgs = false;
  this.addToWorkNotes = true;
  this.reloadPage = false;
  this.allowMulticonference = true;
  this.setNumber = function(val) {
    this.number = val;
  };
  this.setAllowMulticonfernece = function(val) {
    this.allowMulticonference = val;
  };
  this.setReloadPage = function(val) {
    this.reloadPage = val;
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
  this.showResults = function(par1, par2, par3, result) {
    if (!this.showAllMsgs)
      return;
    var i = 0;
    if (Array.isArray(result.errorMessages)) {
      for (i = 0; i < result.errorMessages.length; i++)
        g_form.addErrorMessage(result.errorMessages[i]);
    }
    if (Arra.isArray(result.successMessages)) {
      for (i = 0; i < result.successMessages.length; i++)
        g_form.addSuccessMessage(result.successMessages[i]);
    }
    if (Array.isArray(result.warnMessages)) {
      for (i = 0; i < result.warnMessages.length; i++)
        g_form.addWarningMessage(result.warnMessages[i]);
    }
  };
  var self = this;
  var NOTIFY_CONFERENCE_DIALOG_MSG = 'NOTIFY_CONFERENCE_DIALOG_MSG';
  CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
  NotifyOnTaskClient.observeConferenceDialogEvents = function(msg) {
    var dlg = GlideModal.prototype.get(self.uiPage);
    if (dlg == null)
      return;
    var callback = null;
    if (msg.cmd == 'cancel') {
      CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
      dlg.destroy();
      callback = self.cancelCallback;
    } else if (msg.cmd == 'submit') {
      callback = self.submitCallback;
    } else if (msg.cmd == 'ok') {
      CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
      dlg.destroy();
      if (!!msg.data && !!msg.data.status)
        callback = self.successCallback;
      else
        callback = self.errorCallback;
    } else
      return;
    if (msg.cmd == 'cancel' || msg.cmd == 'ok')
      callback = callback || self.showResults.bind(self);
    if (!callback)
      return;
    try {
      callback({}, {}, {}, msg.data || []);
    } catch (e) {} finally {
      if (self.reloadPage && (msg.cmd == 'ok'))
        document.location.reload();
    }
  };
  this.openConferenceDialog = function(data) {
    for (var prop in data)
      this[prop] = data[prop];
    var self = this;
    var inputData = {
      table: self.sourceTable,
      sysId: self.sysId,
      confId: self.confId,
      siProcessor: self.siProcessor,
      addToWorkNotes: self.addToWorkNotes,
      reloadPage: self.reloadPage,
      allowMulticonference: self.allowMulticonference
    };
    if (!!data) {
      for (var p in data) {
        inputData[p] = data[p];
      }
    }

    function openDialog() {
      CustomEvent.observe(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
      var queryParms = '&sysparm_focustrap=true&sysparm_wb=true&sysparm_stack=no';
      queryParms += '&sysparm_data=' + JSON.stringify(inputData);
      var url = self.uiPage + '.do?' + queryParms;
      var dialog = new GlideModal(self.uiPage, false, 'modal-md', 250);
      ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
        dialog.template = glideModalTemplate;
        dialog.on('bodyrendered', function(event) {
          glideModalKeyDownHandler(event, dialog.getID());
        });
        dialog.renderIframe(url, function() {});
        if (!!self.confId) {
          getMessage('Add Participants', function(msg) {
            dialog.setTitle(msg);
            dialog.updateTitle();
          });
        } else {
          getMessage('Initiate conference call', function(msg) {
            dialog.setTitle(msg);
            dialog.updateTitle();
          });
        }
      });
    }
    if (!!inputData.confId) {
      var ga = new GlideAjax(inputData.siProcessor);
      ga.addParam('sysparm_name', 'isConferenceActive');
      ga.addParam('sysparm_data', JSON.stringify(inputData));
      ga.getXMLAnswer(function(r) {
        var result = JSON.parse(r);
        if (!!result.status) {
          openDialog();
          return;
        }
        for (var i = 0; i < result.errorMessages.length; i++)
          g_form.addErrorMessage(result.errorMessages[i]);
      });
    } else
      openDialog();
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
    return gel(inptNm).value;
  },
  type: "tm_AddToTestPlanHandler"
});
/*! RESOURCE: NavFilterExtension */
function navFilterExtension(val, msg) {
  if (val.endsWith('.dict')) {
    val = val.replace(/ /g, '');
    document.getElementById('gsft_main').src = "sys_dictionary_list.do?sysparm_query=name=" + val.replace('.dict', '');
    restoreFilterText(msg);
    return true;
  }
  if (val.endsWith('.cs')) {
    val = val.replace(/ /g, '');
    document.getElementById('gsft_main').src = "sys_script_client_list.do?sysparm_query=table=" + val.replace('.cs', '');
    restoreFilterText(msg);
    return true;
  }
  if (val.endsWith('.br')) {
    val = val.replace(/ /g, '');
    document.getElementById('gsft_main').src = "sys_script_list.do?sysparm_query=collection=" + val.replace('.br', '');
    restoreFilterText(msg);
    return true;
  }
  if (val.endsWith('.uia')) {
    val = val.replace(/ /g, '');
    document.getElementById('gsft_main').src = "sys_ui_action_list.do?sysparm_query=table=" + val.replace('.uia', '');
    restoreFilterText(msg);
    return true;
  }
  if (val.endsWith('.uip')) {
    val = val.replace(/ /g, '');
    document.getElementById('gsft_main').src = "sys_ui_policy_list.do?sysparm_query=table=" + val.replace('.uip', '');
    restoreFilterText(msg);
    return true;
  }
  if (val.endsWith('.all')) {
    val = val.replace(/ /g, '');
    document.getElementById('gsft_main').src = "personalize_all.do?sysparm_rules_table=" + val.replace('.all', '');
    restoreFilterText(msg);
    return true;
  }
  if (val.endsWith('?')) {
    val = val.replace(/ /g, '');
    var table = val.split(":")[0];
    var query = val.split(":")[1].replace('?', '');
    document.getElementById('gsft_main').src = table + "_list.do?sysparm_query=" + query;
    restoreFilterText(msg);
    return true;
  }
  return false;
}
/*! RESOURCE: ESM Phase 2 UI Script */
(function($, window) {
  $(function() {
    if ((top.location.href).indexOf('/esm') != -1) {
      var continue_shopping_selectors = '#catalog_cart_continue_shopping,#header_button_continue_shopping_in_header,#header_button_continue_shopping_in_footer,#continue_shopping';
      $(document).on('click', continue_shopping_selectors, function(event) {
        event.preventDefault();
        top.location.href = '/esm_portal?id=esm_sc_category';
      });
      $(continue_shopping_selectors).attr('onclick', '').click(function() {
        top.location.href = '/esm_portal?id=esm_sc_category';
      });
      $('#goto_home,#redirect_home').attr('onclick', '').click(function() {
        top.location.href = '/esm_portal';
      });
    }
  });
})(jQuery, window);
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
/*! RESOURCE: Mirror42 */
var Mirror42 = {
  show: function(token, url, height, width) {
    if (!height) {
      height = "600px";
    }
    if (!width) {
      width = "100%";
    }
    if (/^\d+$/.test(height + '')) {
      height = height + 'px';
    }
    if (/^\d+$/.test(width + '')) {
      width = width + 'px';
    }
    token = token.split('#');
    url = url.replace(/^\s+/g, '');
    if (url.indexOf('http') !== 0) {
      if (url.indexOf('/') !== 0) {
        url = '/' + url;
      }
      url = token[0] + url;
    }
    url = url + (url.indexOf('?') === -1 ? "?" : "&");
    url = url + "apptoken=" + encodeURIComponent(token[1]);
    url = url + "&h=" + encodeURIComponent(height);
    var m42 = document.getElementById('mirror42');
    m42.innerHTML = '<iframe class="content_embedded" frameborder="0" src="' + url + '" style="height:' + height + ';width:' + width + ';" frameborder="0" scrolling="no"></iframe>';
  }
};
/*! RESOURCE: extracted_ui_actions */
function onToggleDomainScope_sys_ui_action_7a3a3910c3122100f0d95b787dba8fa2() {
  onToggleDomainScope();

  function onToggleDomainScope() {
    var currentScopeElement = gel('sysparm_domain_scope');
    if (currentScopeElement) {
      toggleScope(currentScopeElement);
      refreshAllLists();
      sendSecurityEvent();
      CustomEvent.fire('domain_scope_changed');
    }
  }

  function toggleScope(currentScopeElement) {
    var currentScope = currentScopeElement.value;
    if (currentScope == 'record')
      switchScope(currentScopeElement, 'session', 'session', 'inline');
    else if (currentScope == 'session')
      switchScope(currentScopeElement, gel('sysparm_record_domain').value, 'record', 'none');
  }

  function switchScope(currentScopeElement, formDomain, newScope, displayValue) {
    var domainElement = gel('sysparm_domain');
    if (domainElement) {
      domainElement.value = formDomain;
      currentScopeElement.value = newScope;
      toggleNotification(displayValue);
    }
  }

  function toggleNotification(displayValue) {
    var alertPreferenceElement = gel('sysparm_domain_alert_preference');
    if (!alertPreferenceElement || alertPreferenceElement.value != 'true')
      return;
    if (displayValue == 'inline') {
      var infoMessageElement = gel('domain_alert');
      if (!infoMessageElement)
        g_form.addInfoMessage(getMessage('Domain scope expanded!'), 'domain_alert');
      else
        infoMessageElement.show();
    } else {
      if (GlideUI.get()._getOutputMessageDivs().container.childNodes.length == 1) {
        g_form.clearMessages();
        return;
      }
      var infoMessageElement = gel('domain_alert');
      if (infoMessageElement)
        infoMessageElement.hide();
    }
  }

  function refreshAllLists() {
    var id;
    var domainElement = gel('sysparm_domain');
    var scopeElement = gel('sysparm_domain_scope');
    if (domainElement && domainElement.value) {
      for (id in GlideLists2) {
        GlideLists2[id].setSubmitValue('sysparm_domain', domainElement.value);
        if (scopeElement && scopeElement.value)
          GlideLists2[id].setSubmitValue('sysparm_domain_scope', scopeElement.value);
        GlideLists2[id].refresh();
      }
    }
    if (typeof GlideList !== 'undefined') {
      for (id in GlideList.lists) {
        var list = GlideList.get(id);
        list.setSubmitValue('sysparm_domain', domainElement.value);
        if (scopeElement && scopeElement.value)
          list.setSubmitValue('sysparm_domain_scope', scopeElement.value);
        list.refresh();
      }
    }
  }

  function sendSecurityEvent() {
    var ga = new GlideAjax('SecurityEventSender');
    ga.addParam('sysparm_eventName', 'domain_toggle');
    ga.addParam('sysparm_parm1', '');
    ga.addParam('sysparm_parm2', '');
    ga.getXML();
  }
}

function universal_merge_sys_ui_action_3f4ac87ec0a800644d71b13ab1fbb240() {
  universal_merge();

  function universal_merge() {
    var document_table = '';
    var loc = window.location.toString();
    document_table = loc.match("[^/]*(?=_list\.do.*)");
    var list = GlideList2.get(document_table.toString());
    if (typeof(list) == 'undefined') {
      document_table = gel('sys_target').value;
      var inputs = document.getElementsByTagName('input');
      var sysids = [];
      for (var i = 0; i < inputs.length; i++) {
        var inputID = inputs[i].id.toString();
        if (inputID.indexOf('ni:') == 0 && inputs[i].checked)
          sysids.push(inputID.substring(inputID.indexOf(':') + 1, inputID.length));
      }
    } else {
      sysids = list.getChecked();
      sysids = sysids.split(',');
    }
    if (document_table == 'sales_account')
      merge_sales_account(document_table, sysids);
    else
      universal_merge_tool();
  }

  function universal_merge_tool() {
    var loc = window.location.toString();
    var document_table = loc.match("[^/]*(?=_list\.do.*)");
    var list = GlideList2.get(document_table.toString());
    if (typeof(list) == 'undefined') {
      var document_table = gel('sys_target').value;
      var inputs = document.getElementsByTagName('input');
      var sysids = [];
      for (i = 0; i < inputs.length; i++) {
        var inputID = inputs[i].id.toString();
        if (inputID.indexOf('ni:') == 0 && inputs[i].checked)
          sysids.push(inputID.substring(inputID.indexOf(':') + 1, inputID.length));
      }
    } else {
      sysids = list.getChecked();
      sysids = sysids.split(',');
    }
    if (sysids.length != 2)
      return alert('You must select exactly two documents to perform a merge from this list.');
    var primary_id = sysids.pop();
    var secondary_id = sysids.pop();
    if (document_table && primary_id && secondary_id) {
      var dd = new GlideDialogWindow("merge_tool");
      dd.setTitle('Universal Merge Tool');
      dd.setPreference('sysparm_primary_table', document_table);
      dd.setPreference('sysparm_primary_id', primary_id);
      dd.setPreference('sysparm_secondary_id', secondary_id);
      dd.render();
    }
  }

  function merge_sales_account(document_table, sysids) {
    if (document_table != 'sales_account' && sysids.length != 2)
      return alert('You must select exactly two documents to perform a merge from this list');
    if (document_table == 'sales_account' && sysids.length != 1)
      return alert('You must select only one account to perform account merge from this list');
    var parent_id = '';
    var child_id = '';
    var selected_id = '';
    var parent_number = '';
    var child_number = '';
    var parent_gr = '';
    var child_gr = '';
    if (document_table == 'sales_account') {
      selected_id = sysids.pop() + '';
      child_gr = new GlideRecord(document_table);
      child_gr.get(selected_id);
      if (child_gr.u_merge_with != '') {
        parent_id = child_gr.u_merge_with + '';
        child_id = selected_id;
      } else {
        return alert('Cannot merge accounts! Only accounts with an Account Maintenance type of "Merge%" can actually be merged, and that record must have a "Merge With" field populated with it');
      }
    } else {
      parent_id = sysids.pop();
      child_id = sysids.pop();
    }
    parent_gr = new GlideRecord(document_table);
    parent_gr.get(parent_id);
    parent_number = parent_gr.u_number + '';
    if (child_gr != '') {
      child_gr = new GlideRecord(document_table);
      child_gr.get(child_id);
    }
    child_number = child_gr.u_number + '';
    if (document_table == '') {
      return alert('No merge table found');
    }
    if (parent_id == '') {
      return alert('No parent record found');
    } else if (child_id == '') {
      return alert('No child record found');
    } else if (parent_id == child_id) {
      return alert('Cannot merge accounts! Parent and child accounts are the same');
    }
    if (document_table == 'sales_account' && isChildAccountValid(parent_gr, child_gr) == false)
      return false;
    if (document_table == 'sales_account' && ifChildHasInstancesInHi(child_id, child_gr) == true)
      return false;
    var dd = new GlideDialogWindow("universal_merge_tool");
    dd.setTitle('Universal Merge Tool');
    dd.setPreference('sysparm_target_table', document_table);
    dd.setPreference('sysparm_parent_id', parent_id);
    dd.setPreference('sysparm_child_id', child_id);
    dd.setPreference('sysparm_parent_acc', parent_number);
    dd.setPreference('sysparm_child_acc', child_number);
    dd.render();
  }

  function isChildAccountValid(parent_gr, child_gr) {
    var childAccountType = child_gr.type;
    var childPartnerStatus = child_gr.partner_type;
    var errorCode = '';
    if (childAccountType == 'Customer' || childAccountType == 'Customer - Subsidiary' || childAccountType == 'Inactive-Former Customer') {
      errorCode = 'Cannot merge accounts! Child account ' + child_gr.u_number + ' [' + child_gr.name + '] is of account type Customer, Customer-Subsidiary or Inactive-Former Customer';
      alert(errorCode);
      return false;
    } else if (childPartnerStatus == 'Partner' || childPartnerStatus == 'Inactive - Former Partner') {
      errorCode = 'Cannot merge accounts!  Child account ' + child_gr.u_number + ' [' + child_gr.name + '] is of partner status Partner or Inactive-Former Partner';
      alert(errorCode);
      return false;
    } else
      return true;
  }

  function ifChildHasInstancesInHi(sysID, child_gr) {
    var ga = new GlideAjax('CheckAccountCiInstancesInHi');
    var errorCode = '';
    ga.addParam('sysparm_name', 'checkIfCiInstancesExistInHi');
    ga.addParam('sysparm_sysid', sysID + '');
    ga.addParam('sysparm_debug', true);
    ga.getXMLWait();
    var result = ga.getAnswer();
    if (result != null && (result == 'false' || result == false)) {
      return false;
    } else {
      var choice = confirm('Warning : One of these Accounts is synced to HI, please review before proceeding. Proceed OK/Cancel?');
      return !choice;
    }
  }
}

function confirmAndDeleteFromList_sys_ui_action_75a1fcce0a0a0b3400d6ed99cf8a87e0() {
  var tblName;
  var ajaxHelper;
  var selSysIds;
  var sysIdList;
  var indx = 0;
  var numSel = 0;
  confirmAndDeleteFromList();

  function confirmAndDeleteFromList() {
    tblName = g_list.getTableName();
    selSysIds = g_list.getChecked();
    sysIdList = selSysIds.split(',');
    numSel = sysIdList.length;
    if (numSel > 0) {
      indx = 0;
      ajaxHelper = new GlideAjax('DeleteRecordAjax');
      getCascadeDeleteTables();
    }
  }

  function getCascadeDeleteTables() {
    if (sysIdList[indx] != '') {
      ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
      ajaxHelper.addParam('sysparm_obj_id', sysIdList[indx]);
      ajaxHelper.addParam('sysparm_table_name', tblName);
      ajaxHelper.addParam('sysparm_nameofstack', null);
      ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneList.bind(this), null, null);
    }
  }

  function getCascadeDelTablesDoneList(answer, s) {
    var delObjList = '';
    var selObjName = '';
    if (answer != '') {
      var ansrArray = answer.split(';');
      if (ansrArray.length > 1) selObjName = ansrArray[1];
      if (ansrArray.length > 2) delObjList = ansrArray[2];
    }
    if (delObjList != '') {
      if (numSel > 1) {
        showListConfDlg("true", selObjName, delObjList);
      } else {
        showListConfDlg("true", '', delObjList);
      }
    } else {
      indx++;
      if (indx < numSel) {
        ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
        ajaxHelper.addParam('sysparm_table_name', tblName);
        ajaxHelper.addParam('sysparm_obj_id', sysIdList[indx]);
        ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneList.bind(this), null, null);
      } else {
        showListConfDlg("false", '');
      }
    }
  }

  function showListConfDlg(hasCascadeDel, selObjName, delObjList) {
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('delete_confirm_list');
    dlg.setTitle('Confirmation');
    if (delObjList == null) {
      dlg.setWidth(300);
    } else {
      dlg.setWidth(450);
    }
    dlg.setPreference('sysparm_obj_list', selSysIds);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_has_cascade_del', hasCascadeDel);
    dlg.setPreference('sysparm_sel_obj_name', selObjName);
    dlg.setPreference('sysparm_del_obj_list', delObjList);
    dlg.render();
  }
}

function confirmAndDeleteFromForm_sys_ui_action_57dc4c970a0a0b3400f8f0538d3faf94() {
  var ajaxHelper;
  var objSysId;
  var tblName;
  var dlg;
  var returnUrl;
  var fromRelList;
  var module;
  var listQuery;
  var stackName = null;
  var gotoUrl = null;
  confirmAndDeleteFromForm();

  function confirmAndDeleteFromForm() {
    objSysId = g_form.getUniqueValue();
    tblName = g_form.getTableName();
    fromRelList = g_form.getParameter('sysparm_from_related_list');
    module = g_form.getParameter('sysparm_userpref_module');
    listQuery = g_form.getParameter('sysparm_record_list');
    stackName = g_form.getParameter('sysparm_nameofstack');
    gotoUrl = g_form.getParameter('sysparm_goto_url');
    ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
    ajaxHelper.addParam('sysparm_obj_id', objSysId);
    ajaxHelper.addParam('sysparm_table_name', tblName);
    ajaxHelper.addParam('sysparm_nameofstack', stackName);
    ajaxHelper.setWantSessionMessages(false);
    if (gotoUrl && gotoUrl != "")
      ajaxHelper.addParam('sysparm_goto_url', setRedirectFields(gotoUrl));
    ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneForm.bind(this), null, null);
  }

  function getCascadeDelTablesDoneForm(answer, s) {
    var ansrArray = answer.split(';');
    returnUrl = ansrArray[0];
    var objList = ansrArray[2];
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    dlg = new dialogClass('delete_confirm_form');
    dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
    if (objList == null) {
      dlg.setWidth(275);
    } else {
      dlg.setWidth(450);
    }
    dlg.setPreference('sysparm_obj_id', objSysId);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_delobj_list', objList);
    dlg.setPreference('sysparm_parent_form', this);
    dlg.render();
  }

  function deleteCompleted() {
    dlg.destroy();
    var w = getTopWindow();
    cbField = w.document.getElementById('glide_dialog_form_target_' + tblName);
    if (cbField != null) {
      cbField.value = 'sysverb_delete:' + objSysId;
      cbField.onchange();
      var elem = window.parent.document.getElementById('body_FormDialog');
      if (elem)
        new GlideWindow().locate(elem).destroy();
    } else {
      if (returnUrl != 'null') {
        window.location.href = returnUrl;
      } else {
        window.location.href = window.location.protocol + '//' + window.location.host + '/' + tblName + '_list.do?sysparm_userpref_module=' + module + '&sysparm_query=' + listQuery + '&sysparm_cancelable=true';
      }
    }
  }

  function setRedirectFields(gotoURL) {
    if (gotoURL.indexOf('$sys_id') > -1)
      gotoURL = gotoURL.replace(/\$sys_id/g, g_form.getUniqueValue());
    if (gotoURL.indexOf('$action') > -1)
      gotoURL = gotoURL.replace(/\$action/g, 'sysverb_delete');
    if (gotoURL.indexOf('$display_value') > -1)
      gotoURL = gotoURL.replace(/\$display_value/g, g_form.getDisplayValue());
    return gotoURL;
  }
}

function confirmAndDeleteFromForm_sys_ui_action_1f12506f7f532200348ef0d8adfa9139() {
  var ajaxHelper;
  var objSysId;
  var tblName;
  var dlg;
  var returnUrl;
  var fromRelList;
  var module;
  var listQuery;
  var stackName = null;
  var gotoUrl = null;
  confirmAndDeleteFromForm();

  function confirmAndDeleteFromForm() {
    objSysId = g_form.getUniqueValue();
    tblName = g_form.getTableName();
    fromRelList = g_form.getParameter('sysparm_from_related_list');
    module = g_form.getParameter('sysparm_userpref_module');
    listQuery = g_form.getParameter('sysparm_record_list');
    stackName = g_form.getParameter('sysparm_nameofstack');
    gotoUrl = g_form.getParameter('sysparm_goto_url');
    ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
    ajaxHelper.addParam('sysparm_obj_id', objSysId);
    ajaxHelper.addParam('sysparm_table_name', tblName);
    ajaxHelper.addParam('sysparm_nameofstack', stackName);
    ajaxHelper.setWantSessionMessages(false);
    if (gotoUrl && gotoUrl != "")
      ajaxHelper.addParam('sysparm_goto_url', setRedirectFields(gotoUrl));
    ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneForm.bind(this), null, null);
  };

  function getCascadeDelTablesDoneForm(answer, s) {
    var ansrArray = answer.split(';');
    returnUrl = ansrArray[0];
    var objList = ansrArray[2];
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    dlg = new dialogClass('delete_confirm_form');
    dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
    if (objList == null) {
      dlg.setWidth(275);
    } else {
      dlg.setWidth(450);
    }
    dlg.setPreference('sysparm_obj_id', objSysId);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_delobj_list', objList);
    dlg.setPreference('sysparm_parent_form', this);
    switch (tblName) {
      case 'cmn_notif_device':
        dlg.setPreference('sysparm_msg_override', 'Delete this channel?');
        dlg.setPreference('sysparm_cascade_msg_override', 'Deleting this channel will result in the automatic deletion of the following related records:');
        break;
      case 'cmn_notif_message':
        dlg.setPreference('sysparm_msg_override', 'Delete these conditions?');
        dlg.setPreference('sysparm_cascade_msg_override', 'Deleting these conditions will result in the automatic deletion of the following related records:');
        break;
      case 'sys_notif_subscription':
        dlg.setPreference('sysparm_msg_override', 'Delete this notification?');
        dlg.setPreference('sysparm_cascade_msg_override', 'Deleting this notification will result in the automatic deletion of the following related records:');
        break;
    }
    dlg.render();
  }

  function deleteCompleted() {
    dlg.destroy();
    var w = getTopWindow();
    cbField = w.document.getElementById('glide_dialog_form_target_' + tblName);
    if (cbField != null) {
      cbField.value = 'sysverb_delete:' + objSysId;
      cbField.onchange();
      var elem = window.parent.document.getElementById('body_FormDialog');
      if (elem)
        new GlideWindow().locate(elem).destroy();
    } else {
      if (returnUrl != 'null') {
        window.location.href = returnUrl;
      } else {
        window.location.href = window.location.protocol + '//' + window.location.host + '/' + tblName + '_list.do?sysparm_userpref_module=' + module + '&sysparm_query=' + listQuery + '&sysparm_cancelable=true';
      }
    }
  }

  function setRedirectFields(gotoURL) {
    if (gotoURL.indexOf('$sys_id') > -1)
      gotoURL = gotoURL.replace(/\$sys_id/g, g_form.getUniqueValue());
    if (gotoURL.indexOf('$action') > -1)
      gotoURL = gotoURL.replace(/\$action/g, 'sysverb_delete');
    if (gotoURL.indexOf('$display_value') > -1)
      gotoURL = gotoURL.replace(/\$display_value/g, g_form.getDisplayValue());
    return gotoURL;
  }
}

function pa_analyse(message, isError) {
  g_form.clearMessages();
  jQuery('.injected').remove();
  g_form.addInfoMessage('Mouseover <span class="icon icon-workflow"></span> ' +
    'icons, to see breakdown advice. Caution: Advanced use-cases like scripting, bucket groups and dot walking not covered');
  if (message) {
    if (isError) g_form.addErrorMessage(message);
    else g_form.addInfoMessage(message);
  }
  window.pahelped = true;
  jQuery.getJSON("/pahelper.do?action=gettabledata&table=" + g_form.getTableName(), function(data) {
    doChecks(data);
  });

  function doChecks(data) {
    var myurl = '/api/now/ui/meta/' + g_form.getTableName();
    restCall(myurl).done(function(jsn, statusText, jqXHR) {
      window.jsn = jsn.result;
      jQuery('[id^=element]')
        .each(function(index, value) {
          var elm = jQuery(this).closest('div.form-group').attr('id').split('.').slice(2).join('.');
          var elmMeta = jsn.result.columns[elm];
          var title = "";
          var color = '';
          var links = '';
          if (elm.indexOf('.') > -1) {
            var ref = jsn.result.columns[elm.split('.')[0]];
            title = "Field from dot walked table " + ref.reference + " go to table, to analyse breakdown";
            color = 'grey';
          } else if (elmMeta.type == 'choice') {
            title = "Field type Choice appropriate for Breakdown";
            color = 'green';
            var bdsCond = '';
            var bdCond = '';
            for (var i = 0; i < data.tables.length - 1; i++) {
              bdsCond += '^ORconditionsLIKEname=' + data.tables[i];
              bdCond += '^ORdimension.conditionsLIKEname=' + data.tables[i];
            }
            var bdsUrl = '/api/now/table/pa_dimensions?sysparm_display_value=true&sysparm_query=facts_table=sys_choice^conditionsLIKEelement=' + elm + '^conditionsLIKEname=' + data.tables[data.tables.length - 1] + bdsCond;
            var bdUrl = '/api/now/table/pa_breakdowns?sysparm_display_value=true&sysparm_query=dimension.facts_table=sys_choice^dimension.conditionsLIKEelement=' + elm + '^dimension.conditionsLIKEname=' + data.tables[data.tables.length - 1] + bdCond;
            var bdmUrl = '/api/now/table/pa_breakdown_mappings?sysparm_display_value=true&sysparm_query=facts_tableIN' + data.tables + '^field=' + elm;
            var bdsHl = '/pa_dimensions_list.do?sysparm_query=facts_table=sys_choice^conditionsLIKEelement=' + elm + '^conditionsLIKEname=' + data.tables[data.tables.length - 1] + bdsCond;
            var bdHl = '/pa_breakdowns_list.do?sysparm_query=dimension.facts_table=sys_choice^dimension.conditionsLIKEelement=' + elm + '^dimension.conditionsLIKEname=' + data.tables[data.tables.length - 1] + bdCond;
            var bdmHl = '/pa_breakdown_mappings_list.do?sysparm_query=facts_tableIN' + data.tables + '^field=' + elm;
            var bds = restCall(bdsUrl, index);
            var bd = restCall(bdUrl, index);
            var bdm = restCall(bdmUrl, index);
            Promise.all([index, elm, title, color, bds, bd, bdm, bdsHl, bdHl, bdmHl, data.tables]).then(function(res) {
              buildLinks(res);
            });
          } else if (elmMeta.type == 'reference') {
            if (data.tasktables.indexOf(elmMeta.reference) == -1) {
              if (elmMeta.reference == 'cmdb_ci') {
                title = "Reference to CMDB CI table. Breakdown not recommended, when creating a Breakdown, add conditions to limit results to max. 500 records";
                color = 'orange';
              } else if (elmMeta.reference == 'sys_user') {
                title = "Reference to User table. Breakdown not recommended, when creating a Breakdown, add conditions to limit results to max. 500 records";
                color = 'orange';
              } else {
                title = "Reference to " + elmMeta.reference + ". Breakdown appropriate, when creating a Breakdown, add conditions to limit results to max. 500 records";
                color = 'green';
              }
              var bdsUrl = '/api/now/table/pa_dimensions?sysparm_display_value=true&sysparm_query=facts_table=' + elmMeta.reference;
              var bdUrl = '/api/now/table/pa_breakdowns?sysparm_display_value=true&sysparm_query=dimension.facts_table=' + elmMeta.reference;
              var bdmUrl = '/api/now/table/pa_breakdown_mappings?sysparm_display_value=true&sysparm_query=facts_tableIN' + data.tables + '^field=' + elm;
              var bdsHl = '/pa_dimensions_list.do?sysparm_query=facts_table=' + elmMeta.reference;
              var bdHl = '/pa_breakdowns_list.do?sysparm_query=dimension.facts_table=' + elmMeta.reference;
              var bdmHl = '/pa_breakdown_mappings_list.do?sysparm_query=facts_tableIN' + data.tables + '^field=' + elm;
              var bds = restCall(bdsUrl, index);
              var bd = restCall(bdUrl, index);
              var bdm = restCall(bdmUrl, index);
              Promise.all([index, elm, title, color, bds, bd, bdm, bdsHl, bdHl, bdmHl, data.tables]).then(function(res) {
                buildLinks(res);
              });
            } else {
              title = elm + " is a reference to a task extended table, not appropriate for Breakdown";
              color = 'red';
            }
          } else if (elmMeta.type == 'glide_list') {
            title = "Field type " + elmMeta.type + " maybe appropriate for Breakdown";
            color = 'orange';
          } else if (elmMeta.type == 'boolean') {
            title = "Field type " + elmMeta.type + " appropriate for Breakdown";
            color = 'green';
          } else {
            title = "Field type " + elmMeta.type + " not appropriate for Breakdown (Only choice and reference fields are)";
            color = 'red';
          }
          jQuery(this).find('.form-field-addons:first').prepend('<span id="bdspan' + index + '">1</span>');
          if (title)
            injectDom(index, elm, title, color, '');
        });
    });
  }

  function buildLinks(res) {
    var isSame = false;
    var isZero = false;
    if (res[4].result.length == 0 && res[5].result.length == 0 && res[6].result.length == 0) {
      isZero = true;
    }
    if (res[4].result.length == res[5].result.length && res[4].result.length == res[6].result.length)
      isSame = true;
    var link = '<span style="font-size:8pt; font-family: \'Courier New\', Courier, monospace;">[';
    if (isZero) {
      link += '<a href="javascript:createBreakDown(\'' + res[10] + '\',\'' + g_form.getTableName() + '\',\'' + res[1] + '\')">+</a>';
    }
    if (!isSame) {
      if (res[4].result.length == 0)
        link += '0|';
      else if (res[4].result.length == 1)
        link += '<a href="/pa_dimensions.do?sys_id=' + res[4].result[0].sys_id + '" target="bd">' + res[4].result.length + '</a>|';
      else
        link += '<a href="' + res[7] + '" target="bd">' + res[4].result.length + '</a>|';
    }
    if (!isZero) {
      if (res[5].result.length == 0)
        link += '0';
      else if (res[5].result.length == 1)
        link += '<a href="/pa_breakdowns.do?sys_id=' + res[5].result[0].sys_id + '" target="bd">' + res[5].result.length + '</a>';
      else
        link += '<a href="' + res[8] + '" target="bd">' + res[5].result.length + '</a>';
    }
    if (!isSame) {
      if (res[6].result.length == 0)
        link += '|0';
      else if (res[6].result.length == 1)
        link += '|<a href="/pa_breakdown_mappings.do?sys_id=' + res[6].result[0].sys_id + '" target="bd">' + res[6].result.length + '</a>';
      else
        link += '|<a href="' + res[9] + '" target="bd">' + res[6].result.length + '</a>';
    }
    link += ']</span>';
    injectDom(res[0], res[1], res[2], res[3], link);
  }

  function injectDom(id, elm, title, color, links) {
    var htm = '<span class="injected"><span id="tt' + id + '" class="icon icon-workflow" data-container="body" data-field="' +
      elm + '" title="' + title + '" style="color:' + color + '; display:inline !important"></span> ' + links + '</span>';
    jQuery('#bdspan' + id).html(htm);
    jQuery('#tt' + id).tooltip()
      .on('hide.bs.tooltip', function(e) {
        e.preventDefault();
        jQuery('div.tooltip').hide();
      });
  }

  function restCall(url) {
    var hdrs = {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
    if (g_ck)
      hdrs['X-UserToken'] = g_ck;
    respObj = jQuery.ajax({
      url: url,
      method: 'GET',
      headers: hdrs
    });
    return respObj
  }

  function createBreakDown(tables, table, field) {
    g_form.clearMessages();
    g_form.addInfoMessage('<span class="icon icon-loading"></span> Breakdown being created...');
    jQuery.getJSON("/pahelper.do?action=createbreakdown&tables=" + tables + "&table=" + table + '&field=' + field, function(data) {
      var err = false;
      if (data.error) err = true;
      var msg = 'Please review the created Breakdown: <a href="/pa_breakdowns.do?sys_id=' + data.sys_id + '" target="bd">' + data.name + '</a>';
      if (data.error) msg = data.error;
      pa_analyse(msg, err);
    });
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
/*! RESOURCE: ssaGetGlideUiElementName */
function ssaGetGlideUiElementName(ele) {
  if (!ele)
    return '';
  return ele.name.split('.')[1] + '';
}
/*! RESOURCE: openFrameStyle */
window.onload = function() {
  try {
    var button = window.top.$j.find("#openframe-button")[0];
    if (window.top.location.pathname.indexOf("nav_to") < 0 && window.top.location.pathname.indexOf("navpage") < 0) {
      window.top.$j("#mainFrame").css("z-index", "10000");
    } else {
      window.top.$j("#mainFrame").css("top", "200px");
      window.top.$j("#mainFrame").css("z-index", "10000");
    }
  } catch (error) {}
};
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
/*! RESOURCE: Show security verification message  */
addLoadEvent(function() {
  try {
    if (window.top == null || window.top == window || window.top.PSWD_UTIL_AJAX_COMPLETED)
      return;
    var ga_user = new GlideAjax('PwdUtilsAjax');
    ga_user.addParam('sysparm_name', 'getPwdResetSecurityVerificationFlagField');
    ga_user.addParam('sysparm_user_name', g_user.userName);
    ga_user.getXML(_showSecurityVerificationMsg);
  } catch (e) {}
});
_showSecurityVerificationMsg = function(response) {
  var $banner_elem = window.top.$j('#verification_msg');
  var verification_msg = ($banner_elem.length == 0);
  var enrollmentUrl = _getAnswer(response);
  if (g_user.hasRoles() && verification_msg && enrollmentUrl) {
    _addBanner(enrollmentUrl);
  }
  window.top.PSWD_UTIL_AJAX_COMPLETED = true;
};
_addBanner = function(url) {
  var pwdResetEnrollmentUrl = url;
  var security_verification_msg = '<span id="verification_msg">  You are required to enroll into the security verification process <a target="_blank" href="' + pwdResetEnrollmentUrl + '">Click here </a> to enroll</span>';
  var $banner_elem = window.top.$j(".banner-text");
  $banner_elem.append(security_verification_msg);
};
_getAnswer = function(resp) {
  return resp.responseXML.documentElement.getAttribute("answer");
};
getSSoEnrollmentPageUrl = function() {
  var ga = new GlideAjax('PwdUtilsAjax');
  ga.addParam('sysparm_name', 'getPwdResetEnrollmentFormUrl');
  ga.getXMLWait();
  return ga.getAnswer();
};
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
/*! RESOURCE: addFieldAnnotationRight */
function addFieldAnnotationRight(source_field_name, text_value, elem_style) {
  var debugPrefix = "[addFieldAnnotationRight] - ";
  try {
    jslog(debugPrefix + "Argument values - source_field_name: " + source_field_name + " - text_value: " + text_value + " - elem_style: " + elem_style);
    if (!source_field_name || !text_value) {
      jslog(debugPrefix + "Missing necessary arguments! - source_field_name: " + source_field_name + " - text_value: " + text_value);
      return;
    }
    var sourceField = gel(source_field_name);
    var tableName = g_form.getTableName();
    var annotationElement = document.createElement("span");
    annotationElement.setAttribute('id', tableName + "_" + source_field_name + '_annotation');
    var innerHtml = "";
    if (elem_style) innerHtml = '<span style="' + elem_style + '">' + text_value + '</span>';
    else innerHtml = '<span>' + text_value + '</span>';
    annotationElement.innerHTML = innerHtml;
    sourceField.parentNode.appendChild(annotationElement);
    return annotationElement;
  } catch (e) {
    jslog(debugPrefix + "Unable to add element. Error: " + e.message);
  }
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
/*! RESOURCE: ChoiceListUtils */
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
/*! RESOURCE: LeadUrlChange */
var queryParameters = document.URL.parseQuery();
$j(document).ready(function() {
  if (document.URL.indexOf("/sales_lead_list.do") > -1) {
    var length = $j(".list_decoration_cell a").length;
    for (var i = 0; i < length; i++) {
      var url = new URL($j(".list_decoration_cell a")[i].href);
      var sys_id = url.searchParams.get('sys_id');
      var view = url.searchParams.get('sysparm_view');
      var newURL = "/lead_workbench/?id=lead&table=sales_lead&sys_id=" + sys_id + '&view=' + view;
      $j(".list_decoration_cell a")[i].href = newURL;
      $j(".formlink")[i].href = "/lead_workbench/?id=lead&table=sales_lead&sys_id=" + sys_id + '&view=' + view;
    }
  }
});

function checkAccountInfo() {
  var sysparm_query = '';
  if (queryParameters['sysparm_collection_key'] === 'account') {
    sysparm_query = 'account=' + queryParameters['sysparm_collectionID'];
  }
  return sysparm_query;
}
if (document.URL.indexOf("sales_lead.do") > -1 && document.URL.indexOf("allow") < 0) {
  window.location = "/lead_workbench/?id=lead&table=sales_lead&sys_id=" + queryParameters['sys_id'] + "&view=" + queryParameters['sysparm_view'] + "&sysparm_query=" + checkAccountInfo();
}
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
          this._plsWtDlg.render(