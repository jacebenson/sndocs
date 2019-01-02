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
/*! RESOURCE: addInfoMessage */
function addInfoMessage(message, messageType) {
  var refs = document.getElementsByTagName("BODY");
  if (refs) {
    for (var i = 0; i < refs.length; i++) {
      var ref = refs[i];
      var rows = ref;
      if (messageType == 'formInfo' || messageType == 'formError') {
        var frameTd = document.createElement('TD');
        frameTd.setAttribute("width", "100%");
        frameTd.innerHTML = message;
        var frameTr = document.createElement('TR');
        var imageTd = document.createElement('TD');
        imageTd.className = "message_image";
        var infoImg = document.createElement('IMG');
        var formInfoTBody = document.createElement('TBODY');
        var formInfoTable = document.createElement('TABLE');
        var formInfoDiv = document.createElement('DIV');
      }
      if (messageType == 'formInfo') {
        switch (messageType.toString()) {
          case ('info'):
            infoDiv.className = "infoMessage";
            break;
          case ('formInfo'):
            formInfoDiv.className = "system_message outputmsg_info";
            formInfoTable.style.cssText = 'background-color: #F0F5FB;';
            break;
        }
        infoImg.src = "images/outputmsg_info.gifx";
      }
      if (messageType == 'formError') {
        switch (messageType.toString()) {
          case ('error'):
            infoDiv.className = "errorMessage";
            break;
          case ('formError'):
            formInfoDiv.className = "system_message outputmsg_error";
            formInfoTable.style.cssText = 'background-color: #FFEBE8';
            break;
        }
        infoImg.src = "images/outputmsg_error.gifx";
      }
      if (messageType == 'formInfo' || messageType == 'formError') {
        frameTr.appendChild(imageTd);
        imageTd.appendChild(infoImg);
        frameTr.appendChild(frameTd);
        formInfoTBody.appendChild(frameTr);
        formInfoTable.appendChild(formInfoTBody);
        formInfoDiv.appendChild(formInfoTable);
        document.getElementById('output_messages').appendChild(formInfoDiv);
      }
    }
  }
}

function removeInfoMessage(messageType) {
  var classname = "system_message outputmsg_" + messageType;
  var refs = document.getElementsByClassName(classname);
  if (refs) {
    for (var i = 0; i < refs.length; i++) {
      var ref = refs[i];
      var rows = ref.parentNode;
      rows.removeChild(ref);
    }
  }
}
/*! RESOURCE: u_catalogFieldToMoney */
function u_catalogFieldToMoney(field) {
  if (g_form.ignoreChangeTrigger == true)
    return false;
  var value = g_form.getValue(field);
  if (value.empty())
    return false;
  var i = value.replace(/,/g, '');
  i = i.replace(/\$/, '');
  if (isNaN(i)) {
    g_form.hideFieldMsg(field);
    g_form.showFieldMsg(field, 'Invalid input, please enter an integer', 'error');
    g_form.setValue(field, "");
    return false;
  }
  g_form.ignoreChangeTrigger = true;
  g_form.setValue(field, (parseFloat(i)).formatMoney(2));
  g_form.ignoreChangeTrigger = false;
  g_form.hideFieldMsg(field);
  return true;
}
/*! RESOURCE: populateRightListCollector */
function populateRightListCollector(lcName, value, display) {
  var leftBucket = gel(lcName + '_select_0');
  var rightBucket = gel(lcName + '_select_1');
  addOption(rightBucket, value, display);
  leftBucket.onchange();
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
/*! RESOURCE: addUnimpersonateButton */
addLoadEvent(addUnimpersonateButton);

function addUnimpersonateButton() {
  try {
    if ($('impersonating_toggle_id').value != '') {
      $('impersonate_span').insert({
        after: '<span id="unimpersonate_span"><img onclick="unimpersonateMe();" title="End impersonation" src="images/icons/stop.gifx" style="cursor:pointer;cursor:hand;visibility:visible"></img></span>'
      });
    }
  } catch (e) {}
}

function unimpersonateMe() {
  top.location.href = 'ui_page_process.do?sys_id=b071b5dc0a0a0a7900846d21db8e4db6&sys_user=' + $('impersonating_toggle_id').value;
}
/*! RESOURCE: Functions for Purchase Request */
function checkATCParent() {
  if (window.parent.location.href.indexOf('u_atc_parent') > -1) {
    return true;
  } else {
    return false;
  }
}

function getGUID() {
  var guid = document.getElementById('sysparm_item_guid').value;
  alert(guid);
  return guid;
}

function u_getParameter(name) {
  var value = u_getURLParameter(name, window.location);
  return value;
}

function u_getURLParameter(name, url) {
  if (url == null) {
    url = window.location.href;
  }
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  if (results == null)
    return "";
  else
    return results[1];
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
/*! RESOURCE: WWT.BaselineDelta */
var WWT = WWT || {};
WWT.BaselineDelta = {
  WAIT_INTERVAL_MS: 2000,
  setIntervalId: function(id) {
    this.intervalId = id;
  },
  process: function() {
    if (g_form.isNewRecord()) {
      return;
    }
    if (g_scratchpad.baselineVisibilityEnabled == false) {
      return;
    }
    if (g_scratchpad.processingDeltas == false) {
      this.getDeltas();
    } else {
      g_form.addInfoMessage(getMessage('Calculating baseline differences...') + ' <i class="fa fa-spin calculating-spinner"></i>');
      this.setIntervalId(setInterval(function() {
        WWT.BaselineDelta.isRunning();
      }, this.WAIT_INTERVAL_MS));
    }
  },
  getDeltas: function() {
    var ga = new GlideAjax('BaselineDeltaAjax');
    ga.addParam('sysparm_name', 'getDeltas');
    ga.addParam('sysparm_source_sys_id', g_form.getUniqueValue());
    ga.getXMLAnswer(this.displayDeltas);
  },
  displayDeltas: function(response) {
    var answer = response.evalJSON(true);
    if (answer.disposition == 'new') {
      var e = document.getElementsByClassName('form_header')[0];
      var icon = document.createElement('i');
      icon.setAttribute('class', 'delta-icon new-record');
      icon.setAttribute('title', getMessage('New record'));
      e.insertBefore(icon, e.firstChild)
    }
    if (answer.deltas.length > 0) {
      var deltas = answer.deltas;
      g_form.deltas = deltas;
      for (var i = 0; i < deltas.length; i++) {
        var delta = deltas[i].evalJSON(true);
        try {
          var fieldLabel = 'label.' + g_form.getTableName() + '.' + delta.u_field_name;
          var e = document.getElementById(fieldLabel);
          var ie8 = navigator.appVersion.indexOf('MSIE 8.') != -1;
          if (!ie8) {
            var icon = document.createElement('i');
            icon.setAttribute('class', 'delta-icon field-updated');
            icon.setAttribute('title', getMessage('Previous value: ') + WWT.StringUtil.stripHTML((delta.u_display_value || 'NULL')));
            y = e.firstChild;
            y.insertBefore(icon, y.firstChild);
          } else {
            var img = document.createElement('img');
            img.setAttribute('src', 'star.pngx');
            img.setAttribute('title', getMessage('Previous value: ') + WWT.StringUtil.stripHTML((delta.u_display_value || 'NULL')));
            img.setAttribute('style', 'padding-left:3px;');
            y = e.firstChild;
            y.insertBefore(img, y.firstChild);
          }
        } catch (e) {}
      }
    }
    g_form.clearMessages();
  },
  isRunning: function() {
    var ga = new GlideAjax('BaselineDeltaAjax');
    ga.addParam('sysparm_name', 'isRunning');
    ga.addParam('sysparm_source_sys_id', g_form.getUniqueValue());
    ga.getXMLAnswer(this._isRunningParse, null, this);
  },
  _isRunningParse: function(answer, me) {
    answer = (answer == 'true') ? true : false;
    if (answer) {
      return;
    }
    g_form.clearMessages();
    g_scratchpad.processingDeltas = false;
    clearInterval(me.intervalId);
    me.getDeltas();
  }
};
/*! RESOURCE: u_resizeContentFrame */
function u_resizeContentFrame(frame, height) {
  height = typeof height !== undefined ? height : 'auto';
  getTopWindow().contentFrameResized(frame, height);
}

function contentFrameResized(name, height) {
  if (!name)
    return;
  var f = $(name);
  if (!f)
    return;
  if (!isFirefox || height == 10)
    _resize(f, height);
  else {
    setTimeout(function() {
      _resize(f, height);
    }, 0);
  }
}

function _resize(f, height) {
  var fHeight = parseInt(f.height.split('px')[0].toString());
  var pHeight = parseInt(height.split('px')[0].toString());
  if (fHeight < pHeight || height == "auto") {
    f.height = height;
  }
}
/*! RESOURCE: WWT.TimberUtil */
var WWT = WWT || {};
WWT.TimberUtil = {
  overrideModified: function() {
    try {
      g_form.modified = false;
    } catch (e) {}
  }
};
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
/*! RESOURCE: u_toggleCatalogHelpText */
function u_toggleCatalogHelpText() {
  setTimeout(function() {
    var help_labels = document.getElementsByClassName("catalog_help");
    for (i = 0; i < help_labels.length; i++) {
      var anchors = help_labels[i].getElementsByTagName("a");
      for (j = 0; j < anchors.length; j++)
        anchors[j].onclick();
    }
  }, 200);
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
  var re1 = '.*?';
  var re2 = '(\\.)';
  var re3 = '(\\d+)';
  var p = new RegExp(re1 + re2 + re3, ["i"]);
  var m = p.exec(val);
  if (m != null) {
    var links = [];
    var c1 = m[1];
    var int1 = m[2];
    var item = c1.replace(/</, "<") + int1.replace(/</, "<");
    var tags = parent.frames['gsft_nav'].document.getElementsByTagName('a');
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].innerText.toString().toLowerCase().startsWith(val.replace(item, '').toLowerCase())) {
        links.push(tags[i].toString());
      }
    }
  }
  var extension;
  if (val.indexOf('.') == -1) {
    extension = '';
  } else {
    extension = val.split('.')[1];
  }
  var uppercase = false;
  if (extension === extension.toUpperCase() && extension.length > 0) {
    uppercase = true;
  }
  val = val.toLowerCase();
  if (val.endsWith('.uia')) {
    val = val.replace(/ /g, '');
    url = "sys_ui_action_list.do?sysparm_query=table%3D" + val.replace('.uia', '');
    openQuery(uppercase, url);
  } else if (val.endsWith('.uip')) {
    val = val.replace(/ /g, '');
    url = "sys_ui_policy_list.do?sysparm_query=table%3D" + val.replace('.uip', '');
    openQuery(uppercase, url);
  } else if (val.endsWith('.uis')) {
    val = val.replace(/ /g, '');
    url = "sys_ui_script_list.do?";
    openQuery(uppercase, url);
  } else if (val.endsWith('.logs')) {
    val = val.replace(/ /g, '');
    url = "syslog_list.do?sysparm_query=sys_created_onONToday%40javascript%3Ags.daysAgoStart(0)%40javascript%3Ags.daysAgoEnd(0)%5Esys_created_by%3D" + val.replace('.logs', '');
    openQuery(uppercase, url);
  } else if (val.endsWith('.tlogs')) {
    val = val.replace(/ /g, '');
    url = "syslog_transaction_list.do?sysparm_query=sys_created_onONToday%40javascript%3Ags.daysAgoStart(0)%40javascript%3Ags.daysAgoEnd(0)%5Esys_created_by%3D" + val.replace('.tlogs', '');
    openQuery(uppercase, url);
  } else if (val.endsWith('.ci')) {
    val = val.replace(/ /g, '');
    url = "cmdb_ci_list.do?sysparm_query=nameLIKE" + val.replace('.ci', '');
    openQuery(uppercase, url);
  } else if (val.endsWith('.email')) {
    val = val.replace(/ /g, '');
    url = "sysevent_email_action_list.do?sysparm_query=collection%3D" + val.replace('.email', '');
    openQuery(uppercase, url);
  } else if (val.endsWith('.filter')) {
    val = val.replace(/ /g, '');
    url = val.replace('.filter', '') + "_list.do?sysparm_filter_only=true";
    openQuery(uppercase, url);
  } else if (val.endsWith('.br')) {
    val = val.replace(/ /g, '');
    url = "sys_script_list.do?sysparm_query=collection=" + val.replace('.br', '');
    openQuery(uppercase, url);
  } else if (val.endsWith('.cs')) {
    val = val.replace(/ /g, '');
    url = "sys_script_client_list.do?sysparm_query=table=" + val.replace('.cs', '');
    openQuery(uppercase, url);
  } else if (val.endsWith('.table')) {
    val = val.replace(/ /g, '');
    url = "sys_db_object_list.do?sysparm_query=name=" + val.replace('.table', '');
    openQuery(uppercase, url);
  } else if (val.endsWith('.acl')) {
    val = val.replace(/ /g, '');
    url = "sys_security_acl_list.do?sysparm_query=nameSTARTSWITH" + val.replace('.acl', '');
    openQuery(uppercase, url);
  }
  return false;
}

function clearFilter() {
  window.frames['gsft_nav'].document.getElementById('filter').value = '';
}

function openQuery(uppercase, url) {
  if (uppercase) {
    window.open(url, '_blank');
  } else {
    document.getElementById('gsft_main').src = url;
  }
  clearFilter();
}
/*! RESOURCE: u_redirectToPlanningBoard */
function u_redirectToPlanningBoard(product) {
  var url = "u_scrum_planning_board.do?sysparm_product_id=" + product + "&sysparm_doctype=true";
  window.location = url;
}
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
/*! RESOURCE: u_formSectionShow() */
function u_formSectionShow(sectionName) {
  var section = $$('span[tab_caption="' + sectionName + '"]')[0].select('span[id*=section.]')[0];
  section.show();
}
/*! RESOURCE: u_formSectionHide() */
function u_formSectionHide(sectionName) {
  var section = $$('span[tab_caption="' + sectionName + '"]')[0].select('span[id*=section.]')[0];
  section.hide();
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
/*! RESOURCE: u_fieldDecoration */
function u_fieldDecoration(name, src, onClick) {
  var id = 'u_' + name.toLowerCase().replace(/ /g, '_');
  var img = document.createElement('img');
  img.src = src;
  img.alt = name;
  img.title = name;
  var link = document.createElement('a');
  if (navigator.appName == 'Microsoft Internet Explorer') {
    link.setAttribute('onclick', Function(onClick));
  } else {
    link.setAttribute('onclick', onClick);
  }
  link.name = id;
  link.id = id;
  link.appendChild(img);
  return link;
}
/*! RESOURCE: getElementByClass */
function getElementByClass(theClass) {
  var allHTMLTags = new Array();
  var elements = new Array();
  allHTMLTags = document.getElementsByTagName("*");
  for (i = 0; i < allHTMLTags.length; i++) {
    if (allHTMLTags[i].className == theClass) {
      elements.push(allHTMLTags[i]);
    }
  }
  return elements;
}
/*! RESOURCE: u_ajaxFields */
function u_ajaxFields(sys_id, name, overwrite) {
  var ga = new GlideAjax("TableConfigAjax");
  ga.addParam('sysparm_name', 'getAjaxFields');
  ga.addParam('sysparm_ajaxName', name);
  ga.addParam('sysparm_sysID', sys_id);
  ga.addParam('sysparm_overwrite', overwrite);
  ga.getXMLAnswer(ajaxFieldParse);

  function ajaxFieldParse(response) {
    var answer = response.evalJSON();
    var fieldsFrom = answer.fieldsFrom;
    var fieldsTo = answer.fieldsTo;
    for (var i = 0; i < fieldsFrom.length; i++) {
      try {
        var currentValue = g_form.getValue(fieldsTo[i].toString());
      } catch (e) {}
      if (typeof fieldsFrom[i][1] == "object") {
        if (currentValue != fieldsFrom[i][1][0] && checkOverwrite(answer.overwrite, fieldsTo[i])) {
          try {
            g_form.setValue(fieldsTo[i].toString(), fieldsFrom[i][1][0], fieldsFrom[i][1][1])
          } catch (e) {};
        }
      } else if (currentValue != fieldsFrom[i][1] && checkOverwrite(answer.overwrite, fieldsTo[i])) {
        try {
          g_form.setValue(fieldsTo[i].toString(), fieldsFrom[i][1])
        } catch (e) {};
      }
    }
  }

  function checkOverwrite(overwrite, current_field) {
    if (overwrite) {
      return true;
    }
    if (u_hasValue(current_field)) {
      return false;
    }
    return true;
  }
}
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
/*! RESOURCE: WWT.DeploymentObject */
var WWT = WWT || {};
WWT.DeploymentObject = {
  setSourcePath: function() {
    if (g_form.getValue('u_type').empty() || g_form.getValue('u_version').empty() || g_form.getValue('u_configuration_item').empty()) {
      g_form.setValue('u_path', '');
      return;
    }
    g_form.getReference('u_type', this.setSourcePathFromType);
  },
  setSourcePathFromType: function(type) {
    if (type.u_gen_source_path != 'true') {
      return;
    }
    var ga = new GlideAjax('ApplicationAjax');
    ga.addParam('sysparm_name', 'getRepoSourcePath');
    ga.addParam('sysparm_appl_sys_id', g_form.getValue('u_configuration_item'));
    ga.addParam('sysparm_version', g_form.getValue('u_version'));
    ga.addParam('sysparm_extension', type.u_build_file_extension);
    ga.getXMLAnswer(WWT.DeploymentObject._setSourcePath);
  },
  _setSourcePath: function(response) {
    if (response != null && response != 'error') {
      g_form.setValue('u_path', response);
    } else {
      g_form.setValue('u_path', '');
    }
  }
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
/*! RESOURCE: u_hasValue */
function u_hasValue(field) {
  return (g_form.getValue(field) == '') ? false : true;
}
/*! RESOURCE: u_checkConfirm */
function u_checkConfirm(actionName, message) {
  var actionID = g_form.getActionName();
  if (actionID == actionName) {
    if (!confirm(message)) {
      return false;
    }
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
/*! RESOURCE: navFilterExtensionInit */
(function navFilterExtensionInitPage() {
  var elem = parent.document.getElementById('nav_west');
  if (typeof elem === 'undefined' || elem == null)
    return;
  if (typeof parent.msg === 'undefined') {
    var script = parent.document.createElement('script');
    var msgFix = parent.document.createElement('script');
    script.type = 'text/javascript';
    msgFix.type = 'text/javascript';
    msgFix.text = "var msg = '';";
    script.src = 'NavFilterExtension.jsdbx' + "?ts=" + new Date().getTime();
    parent.document.getElementsByTagName('head')[0].appendChild(msgFix);
    parent.document.getElementsByTagName('head')[0].appendChild(script);
  }
})();
/*! RESOURCE: OpportunityLookupFunctions */
function stageOpportunityLookup(fieldName, isVariable) {
  var olparms = {};
  olparms.fieldName = fieldName;
  olparms.isVariable = (isVariable == true) ? true : false;
  var lookup_id = 'lookup.';
  lookup_id += (isVariable) ? g_form.resolveNameMap(fieldName) : g_form.getTableName() + '.' + fieldName;
  olparms.lookupId = lookup_id;
  var display_id = 'sys_display.';
  display_id += (isVariable) ? g_form.resolveNameMap(fieldName) : g_form.getTableName() + '.' + fieldName;
  olparms.displayId = display_id;
  var l = $(lookup_id);
  l.hide();
  l.writeAttribute('sf-opp-lookup', 'true');
  if (!isVariable) {
    olparms.dataType = l.readAttribute('data-type');
    l.writeAttribute('data-type', olparms.dataType + 'BLOCK');
  }
  olparms.onclick = l.onclick;
  l.onclick = null;
  document.body.on('click', 'button[sf-opp-lookup="true"]', function(evt, element) {
    callOpportunityLookup(olparms);
  });
  document.body.on('click', 'a[sf-opp-lookup="true"]', function(evt, element) {
    callOpportunityLookup(olparms);
  });
  l.show();
}

function callOpportunityLookup(p) {
  showLoadingDialog();
  var query_string = gel(p.displayId).value;
  gel(p.displayId).value = getMessage('Please wait...');
  setTimeout(function() {
    var ga = new GlideAjax('SFOpportunityLookupAjax');
    ga.addParam('sysparm_name', 'process');
    ga.addParam('sysparm_query_string', query_string);
    ga.getXMLWait();
    var answer = ga.getAnswer();
    var response = answer.evalJSON(true);
    gel(p.displayId).value = query_string;
    hideLoadingDialog();
    if (response.success) {
      var e = $(p.lookupId);
      e.writeAttribute('sf-opp-lookup', 'false');
      e.onclick = p.onclick;
      if (!p.isVariable) {
        e.writeAttribute('data-type', p.dataType);
      }
      console.log(e);
      try {
        e.click();
        angular.element(e).trigger('click');
        console.log('click');
      } catch (error) {
        console.log(error);
        e.click();
      }
      if (!p.isVariable) e.writeAttribute('data-type', p.dataType + 'BLOCK');
      e.writeAttribute('sf-opp-lookup', 'true');
      e.onclick = null;
    } else {
      alert(response.errors.join('\n'));
    }
  }, 100);
}

function populateOppAttributes(oppLookup) {
  try {
    for (var i in oppLookup) {
      g_form.setValue(i, oppLookup[i] || '');
    }
  } catch (e) {}
}

function populateOppAttributesURL() {
  var url;
  var oppObj = {};
  if (window.location.href.indexOf('oppName') > -1) {
    url = window.location.href;
  } else if (parent.window.location.href.indexOf('oppName') > -1) {
    url = parent.window.location.href;
  } else {
    return;
  }
  oppObj.u_sf_opportunity = unescape(u_getURLParameter("oppName", url).replace(/\+/g, '%20'));
  oppObj.u_sf_opportunity_id = u_getURLParameter("oppId", url);
  oppObj.u_sf_account = unescape(u_getURLParameter("acctName", url).replace(/\+/g, '%20'));
  oppObj.u_sf_account_id = u_getURLParameter("acctId", url);
  oppObj.short_description = unescape(u_getURLParameter("oppName", url).replace(/\+/g, '%20'));
  oppObj.u_account_manager = getUserByID(u_getURLParameter("OppOwner", url));
  g_form.setValue("u_purpose", "Customer");
  populateOppAttributes(oppObj);
  try {
    $('oppReset').onclick = function() {
      clickHereReset();
    };
  } catch (e) {}
  g_form.setDisplay("u_sf_opportunity", true);
  g_form.setDisplay("u_sf_account", true);
}

function clickHereReset() {
  g_form.setValue("u_purpose", "");
  g_form.setValue("u_purpose", "Customer");
}

function getUserByID(user) {
  var ga = new GlideAjax('UserAjax');
  ga.addParam('sysparm_name', 'getUserId');
  ga.addParam('sysparm_user_name', user);
  ga.getXMLWait();
  return ga.getAnswer();
}
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
/*! RESOURCE: u_isValidEmail */
function u_isValidEmail(val) {
  var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(val);
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
/*! RESOURCE: WWT.StringUtil */
var WWT = WWT || {};
WWT.StringUtil = {
  stripHTML: function(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
};
/*! RESOURCE: Number Prototypes */
Number.prototype.formatMoney = function(c, d, t) {
  var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
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