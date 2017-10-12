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
/*! RESOURCE: snd_ui16_developer_patch */
if (!window.top.hasOwnProperty('snd_ui16_developer_patch')) {
  jslog('snd_ui16_developer_patch loading in top window.');
  (function(t) {
    var i;
    t.snd_ui16_developer_patch = null;
    i = setInterval(function() {
      if (typeof t.jQuery === 'function') {
        t.jQuery.getScript('/snd_ui16_developer_patch.jsdbx');
        clearInterval(i);
      }
    }, 500);
  })(window.top);
} else if (window.top.snd_ui16_developer_patch != null) {} else if (window == window.top) {
  (function($, window) {
    var config = {
      navigator_context: {
        active: "true" == "true",
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

    function isUI16() {
      if (!window.top.angular) return false;
      var a = window.top.angular.element('overviewhelp').attr('page-name');
      return a == 'ui16' || a == 'helsinki';
    }

    function createContextMenu(id, items) {
      var menu, i;
      menu = '<ul id="' + id + '" class="dropdown-menu" role="menu" ' +
        'style="display: none; z-index: 999;">';
      for (i = 0; i < items.length; i++) {
        if (items[i] === '-') {
          menu += '<li class="divider"></li>';
        } else {
          menu += '<li><a href="#" tabindex="-1">' + items[i] + '</a></li>';
        }
      }
      menu += '</ul>';
      $('body').append(menu);
    }

    function navigatorPatch() {
      if (!userHasRole('teamdev_configure_instance')) {
        return;
      }
      createContextMenu('snd_ui16dp_navigator_module_menu', [
        'Edit module'
      ]);
      $('#gsft_nav').snd_ui16dp_menu({
        event: 'contextmenu',
        selector: 'a[data-id]',
        menu_id: "#snd_ui16dp_navigator_module_menu",
        callback: function(invokedOn, selectedMenu) {
          var id = invokedOn.attr('data-id'),
            url = '/sys_app_module.do';
          if (!id) {
            jslog('No data id.');
            return;
          }
          if (selectedMenu.text() == 'Edit module') {
            if (invokedOn.hasClass('nav-app')) {
              url = '/sys_app_application.do';
            }
            jslog('snd_ui16_developer_patch opening navigation module');
            openLink(url + '?sys_id=' + id);
          } else {
            jslog('Unknown item selected.');
          }
        }
      });
      jslog('snd_ui16_developer_patch navigator patch applied');
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
        icon;
      createContextMenu(id, items);
      icon = $('.' + className + ' span.label-icon');
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

    function pickerIconPatch() {
      var is_admin = userHasRole(),
        domain_table = config.picker_icon.domain_table,
        callback,
        items;
      items = [];
      items.push('View Current');
      items.push('Create New');
      items.push('-');
      items.push('View All');
      items.push('View In Progress');
      if (is_admin) items.push('View Retrieved');
      items.push('-');
      items.push('Refresh');
      if (is_admin) items.push('Import from XML');
      callback = function(invokedOn, selectedMenu) {
        switch (selectedMenu.text()) {
          case 'View Current':
            var sys_id = $('#update_set_picker_select').val();
            if (sys_id) {
              sys_id = sys_id.split(':').pop();
              openLink('/sys_update_set.do?sys_id=' + sys_id);
            }
            break;
          case 'Create New':
            openLink('/sys_update_set.do?sys_id=-1');
            break;
          case 'View All':
            openLink('sys_update_set_list.do');
            break;
          case 'View In Progress':
            openLink('sys_update_set_list.do?sysparm_query=state%3Din%20progress');
            break;
          case 'View Retrieved':
            openLink('sys_remote_update_set_list.do');
            break;
          case 'Import from XML':
            var url = 'upload.do';
            url += '?';
            url += 'sysparm_referring_url=sys_remote_update_set_list.do';
            url += '&';
            url += 'sysparm_target=sys_remote_update_set';
            openLink(url);
            break;
          case 'Refresh':
            refreshPickers();
            break;
          default:
            jslog('Unknown item selected.');
        }
      };
      patchIcon('updateset', 'concourse-update-set-picker', items, callback);
      items = [];
      items.push('View Current');
      items.push('Create New');
      items.push('-');
      items.push('View All');
      items.push('App Manager');
      items.push('-');
      items.push('Refresh');
      callback = function(invokedOn, selectedMenu) {
        switch (selectedMenu.text()) {
          case 'View Current':
            var sys_id = $('#application_picker_select').val();
            if (sys_id) {
              sys_id = sys_id.split(':').pop();
              openLink('/sys_scope.do?sys_id=' + sys_id);
            }
            break;
          case 'Create New':
            openLink('$sn_appcreator.do');
            break;
          case 'View All':
            openLink('sys_scope_list.do');
            break;
          case 'App Manager':
            openLink('$myappsmgmt.do');
            break;
          case 'Refresh':
            refreshPickers();
            break;
          default:
            jslog('Unknown item selected.');
        }
      };
      patchIcon('application', 'concourse-application-picker', items, callback);
      if (userHasRole('domain_admin')) {
        items = [];
        items.push('View Current');
        items.push('Create New');
        items.push('-');
        items.push('View All');
        items.push('Domain Map');
        items.push('-');
        items.push('Refresh');
        callback = function(invokedOn, selectedMenu) {
          switch (selectedMenu.text()) {
            case 'View Current':
              var sys_id = $('#domain_picker_select').val();
              if (sys_id) {
                sys_id = sys_id.split(':').pop();
                if (sys_id == 'global') {
                  alert('The global domain does not exist as a domain record.');
                } else {
                  openLink('/' + domain_table + '.do?sys_id=' + sys_id);
                }
              }
              break;
            case 'Create New':
              openLink(domain_table + '.do?sys_id=-1');
              break;
            case 'View All':
              openLink(domain_table + '_list.do');
              break;
            case 'Domain Map':
              openLink('domain_hierarchy.do?sysparm_stack=no&sysparm_attributes=record=domain,parent=parent,title=name,description=description,baseid=javascript:getPrimaryDomain();');
              break;
            case 'Refresh':
              refreshPickers();
              break;
            default:
              jslog('Unknown item selected.');
          }
        };
        patchIcon('domain', 'concourse-domain-picker', items, callback);
      }
    }

    function profileMenuPatch() {
      var impersonate_item;

      function addUnimpersonateItem() {
        impersonate_item.parent().after('<li><a href="snd_ui16dp_unimpersonate.do"' +
          ' target="gsft_main">Unimpersonate</a>');
        jslog('snd_ui16_developer_patch user menu patch applied.');
      }
      impersonate_item = $('#user_info_dropdown').next('ul').find('[sn-modal-show="impersonate"]');
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
    }

    function openLink(target) {
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

    function patch() {
      var interval;
      if (config.navigator_context.active) {
        navigatorPatch();
      }
      if (config.picker_width.active) {
        $('.navpage-pickers').removeClass('hidden-md');
        setTimeout(function() {
          pickerWidthPatch();
          interval = setInterval(function() {
            pickerWidthPatch();
          }, 1000);
          setTimeout(function() {
            clearInterval(interval);
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

    function userHasRole(role) {
      var roles = (',' + window.NOW.user.roles + ','),
        is_admin = roles.indexOf(',admin,') > -1;
      if (roles) {
        return is_admin || roles.indexOf(',' + role + ',') > -1;
      }
      return is_admin;
    }
    $(document).ready(function() {
      try {
        if (!isUI16()) {
          window.snd_ui16_developer_patch = false;
          jslog('snd_ui16_developer_patch ignored. Not UI16.');
        } else {
          jslog('Running snd_ui16_developer_patch...');
          patch();
          window.snd_ui16_developer_patch = true;
        }
      } catch (e) {
        jslog('SND Developer Patch UI16 mod failure: ' + e);
      }
    });
  })(jQuery, window);
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
/*! RESOURCE: addLoadEvent */
addLoadEvent(ESSUserRedirect);

function ESSUserRedirect() {
  try {
    if (document.URL.indexOf('login.do') == -1 && !g_user.hasRoles()) {
      if (document.URL.indexOf('selfservice') == -1) {
        window.location = "https://moneygram.service-now.com/selfservice";
      }
    }
  } catch (err) {}
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
/*! RESOURCE: image_gallery */
(function($) {
  $.fn.piroBox_ext = function(opt) {
    opt = jQuery.extend({
      piro_speed: 700,
      bg_alpha: 0.9,
      piro_scroll: true
    }, opt);
    $.fn.piroFadeIn = function(speed, callback) {
      $(this).fadeIn(speed, function() {
        if (jQuery.browser.msie)
          $(this).get(0).style.removeAttribute('filter');
        if (callback != undefined)
          callback();
      });
    };
    $.fn.piroFadeOut = function(speed, callback) {
      $(this).fadeOut(speed, function() {
        if (jQuery.browser.msie)
          $(this).get(0).style.removeAttribute('filter');
        if (callback != undefined)
          callback();
      });
    };
    var my_gall_obj = $('a[class*="pirobox"]');
    var map = new Object();
    for (var i = 0; i < my_gall_obj.length; i++) {
      var it = $(my_gall_obj[i]);
      map['a.' + it.attr('class').match(/^pirobox_gall\w*/)] = 0;
    }
    var gall_settings = new Array();
    for (var key in map) {
      gall_settings.push(key);
    }
    for (var i = 0; i < gall_settings.length; i++) {
      $(gall_settings[i] + ':first').addClass('first');
      $(gall_settings[i] + ':last').addClass('last');
    }
    var piro_gallery = $(my_gall_obj);
    $('a[class*="pirobox_gall"]').each(function(rev) {
      this.rev = rev + 0
    });
    var struct = (
      '<div class="piro_overlay"></div>' +
      '<table class="piro_html"  cellpadding="0" cellspacing="0">' +
      '<tr>' +
      '<td class="h_t_l"></td>' +
      '<td class="h_t_c" title="drag me!!"></td>' +
      '<td class="h_t_r"></td>' +
      '</tr>' +
      '<tr>' +
      '<td class="h_c_l"></td>' +
      '<td class="h_c_c">' +
      '<div class="piro_loader" title="close"><span></span></div>' +
      '<div class="resize">' +
      '<div class="nav_container">' +
      '<a href="#prev" class="piro_prev" title="previous"></a>' +
      '<a href="#next" class="piro_next" title="next"></a>' +
      '<div class="piro_prev_fake">prev</div>' +
      '<div class="piro_next_fake">next</div>' +
      '<div class="piro_close" title="close"></div>' +
      '</div>' +
      '<div class="caption"></div>' +
      '<div class="div_reg"></div>' +
      '</div>' +
      '</td>' +
      '<td class="h_c_r"></td>' +
      '</tr>' +
      '<tr>' +
      '<td class="h_b_l"></td>' +
      '<td class="h_b_c"></td>' +
      '<td class="h_b_r"></td>' +
      '</tr>' +
      '</table>'
    );
    $('body').append(struct);
    var wrapper = $('.piro_html'),
      piro_capt = $('.caption'),
      piro_bg = $('.piro_overlay'),
      piro_next = $('.piro_next'),
      piro_prev = $('.piro_prev'),
      piro_next_fake = $('.piro_next_fake'),
      piro_prev_fake = $('.piro_prev_fake'),
      piro_close = $('.piro_close'),
      div_reg = $('.div_reg'),
      piro_loader = $('.piro_loader'),
      resize = $('.resize'),
      btn_info = $('.btn_info');
    var rz_img = 0.95;
    if ($.browser.msie) {
      wrapper.draggable({
        handle: '.h_t_c,.h_b_c,.div_reg img'
      });
    } else {
      wrapper.draggable({
        handle: '.h_t_c,.h_b_c,.div_reg img',
        opacity: 0.80
      });
    }
    var y = $(window).height();
    var x = $(window).width();
    $('.nav_container').hide();
    wrapper.css({
      left: ((x / 2) - (250)) + 'px',
      top: parseInt($(document).scrollTop()) + (100)
    });
    $(wrapper).add(piro_capt).add(piro_bg).hide();
    piro_bg.css({
      'opacity': opt.bg_alpha
    });
    $(piro_prev).add(piro_next).bind('click', function(c) {
      $('.nav_container').hide();
      c.preventDefault();
      piro_next.add(piro_prev).hide();
      var obj_count = parseInt($('a[class*="pirobox_gall"]').filter('.item').attr('rev'));
      var start = $(this).is('.piro_prev') ? $('a[class*="pirobox_gall"]').eq(obj_count - 1) : $('a[class*="pirobox_gall"]').eq(obj_count + 1);
      start.click();
    });
    $('html').bind('keyup', function(c) {
      if (c.keyCode == 27) {
        c.preventDefault();
        if ($(piro_close).is(':visible')) {
          close_all();
        }
      }
    });
    $('html').bind('keyup', function(e) {
      if ($('.item').is('.first')) {} else if (e.keyCode == 37) {
        e.preventDefault();
        if ($(piro_close).is(':visible')) {
          piro_prev.click();
        }
      }
    });
    $('html').bind('keyup', function(z) {
      if ($('.item').is('.last')) {} else if (z.keyCode == 39) {
        z.preventDefault();
        if ($(piro_close).is(':visible')) {
          piro_next.click();
        }
      }
    });
    $(window).resize(function() {
      var new_y = $(window).height();
      var new_x = $(window).width();
      var new_h = wrapper.height();
      var new_w = wrapper.width();
      wrapper.css({
        left: ((new_x / 2) - (new_w / 2)) + 'px',
        top: parseInt($(document).scrollTop()) + (new_y - new_h) / 2
      });
    });

    function scrollIt() {
      $(window).scroll(function() {
        var new_y = $(window).height();
        var new_x = $(window).width();
        var new_h = wrapper.height();
        var new_w = wrapper.width();
        wrapper.css({
          left: ((new_x / 2) - (new_w / 2)) + 'px',
          top: parseInt($(document).scrollTop()) + (new_y - new_h) / 2
        });
      });
    }
    if (opt.piro_scroll == true) {
      scrollIt()
    }
    $(piro_gallery).each(function() {
      var descr = $(this).attr('title');
      var params = $(this).attr('rel').split('-');
      var p_link = $(this).attr('href');
      $(this).unbind();
      $(this).bind('click', function(e) {
        piro_bg.css({
          'opacity': opt.bg_alpha
        });
        e.preventDefault();
        piro_next.add(piro_prev).hide().css('visibility', 'hidden');
        $(piro_gallery).filter('.item').removeClass('item');
        $(this).addClass('item');
        open_all();
        if ($(this).is('.first')) {
          piro_prev.hide();
          piro_next.show();
          piro_prev_fake.show().css({
            'opacity': 0.5,
            'visibility': 'hidden'
          });
        } else {
          piro_next.add(piro_prev).show();
          piro_next_fake.add(piro_prev_fake).hide();
        }
        if ($(this).is('.last')) {
          piro_prev.show();
          piro_next_fake.show().css({
            'opacity': 0.5,
            'visibility': 'hidden'
          });
          piro_next.hide();
        }
        if ($(this).is('.pirobox')) {
          piro_next.add(piro_prev).hide();
        }
      });

      function open_all() {
        wrapper.add(piro_bg).add(div_reg).add(piro_loader).show();

        function animate_html() {
          if (params[1] == 'full' && params[2] == 'full') {
            params[2] = $(window).height() - 70;
            params[1] = $(window).width() - 55;
          }
          var y = $(window).height();
          var x = $(window).width();
          piro_close.hide();
          div_reg.add(resize).animate({
            'height': +(params[2]) + 'px',
            'width': +(params[1]) + 'px'
          }, opt.piro_speed).css('visibility', 'visible');
          wrapper.animate({
            height: +(params[2]) + 20 + 'px',
            width: +(params[1]) + 20 + 'px',
            left: ((x / 2) - ((params[1]) / 2 + 10)) + 'px',
            top: parseInt($(document).scrollTop()) + (y - params[2]) / 2 - 10
          }, opt.piro_speed, function() {
            piro_next.add(piro_prev).css({
              'height': '20px',
              'width': '20px'
            });
            piro_next.add(piro_prev).add(piro_prev_fake).add(piro_next_fake).css('visibility', 'visible');
            $('.nav_container').show();
            piro_close.show();
          });
        }

        function animate_image() {
          var img = new Image();
          img.onerror = function() {
            piro_capt.html('');
            img.src = "http://www.pirolab.it/pirobox/js/error.jpg";
          }
          img.onload = function() {
            piro_capt.add(btn_info).hide();
            var y = $(window).height();
            var x = $(window).width();
            var imgH = img.height;
            var imgW = img.width;
            if (imgH + 20 > y || imgW + 20 > x) {
              var _x = (imgW + 20) / x;
              var _y = (imgH + 20) / y;
              if (_y > _x) {
                imgW = Math.round(img.width * (rz_img / _y));
                imgH = Math.round(img.height * (rz_img / _y));
              } else {
                imgW = Math.round(img.width * (rz_img / _x));
                imgH = Math.round(img.height * (rz_img / _x));
              }
            } else {
              imgH = img.height;
              imgW = img.width;
            }
            var y = $(window).height();
            var x = $(window).width();
            $(img).height(imgH).width(imgW).hide();
            $(img).fadeOut(300, function() {});
            $('.div_reg img').remove();
            $('.div_reg').html('');
            div_reg.append(img).show();
            $(img).addClass('immagine');
            div_reg.add(resize).animate({
              height: imgH + 'px',
              width: imgW + 'px'
            }, opt.piro_speed);
            wrapper.animate({
              height: (imgH + 20) + 'px',
              width: (imgW + 20) + 'px',
              left: ((x / 2) - ((imgW + 20) / 2)) + 'px',
              top: parseInt($(document).scrollTop()) + (y - imgH) / 2 - 20
            }, opt.piro_speed, function() {
              var cap_w = resize.width();
              piro_capt.css({
                width: cap_w + 'px'
              });
              piro_loader.hide();
              $(img).fadeIn(300, function() {
                piro_close.add(btn_info).show();
                piro_capt.slideDown(200);
                piro_next.add(piro_prev).css({
                  'height': '20px',
                  'width': '20px'
                });
                piro_next.add(piro_prev).add(piro_prev_fake).add(piro_next_fake).css('visibility', 'visible');
                $('.nav_container').show();
                resize.resize(function() {
                  NimgW = img.width;
                  NimgH = img.heigh;
                  piro_capt.css({
                    width: (NimgW) + 'px'
                  });
                });
              });
            });
          }
          img.src = p_link;
          piro_loader.click(function() {
            img.src = 'about:blank';
          });
        }
        switch (params[0]) {
          case 'iframe':
            div_reg.html('').css('overflow', 'hidden');
            resize.css('overflow', 'hidden');
            piro_close.add(btn_info).add(piro_capt).hide();
            animate_html();
            div_reg.piroFadeIn(300, function() {
              div_reg.append(
                '<iframe id="my_frame" class="my_frame" src="' + p_link + '" frameborder="0" allowtransparency="true" scrolling="auto" align="top"></iframe>'
              );
              $('.my_frame').css({
                'height': +(params[2]) + 'px',
                'width': +(params[1]) + 'px'
              });
              piro_loader.hide();
            });
            break;
          case 'content':
            div_reg.html('').css('overflow', 'auto');
            resize.css('overflow', 'auto');
            $('.my_frame').remove();
            piro_close.add(btn_info).add(piro_capt).hide();
            animate_html()
            div_reg.piroFadeIn(300, function() {
              div_reg.load(p_link);
              piro_loader.hide();
            });
            break;
          case 'inline':
            div_reg.html('').css('overflow', 'auto');
            resize.css('overflow', 'auto');
            $('.my_frame').remove();
            piro_close.add(btn_info).add(piro_capt).hide();
            animate_html()
            div_reg.piroFadeIn(300, function() {
              $(p_link).clone(true).appendTo(div_reg).piroFadeIn(300);
              piro_loader.hide();
            });
            break
          case 'gallery':
            div_reg.css('overflow', 'hidden');
            resize.css('overflow', 'hidden');
            $('.my_frame').remove();
            piro_close.add(btn_info).add(piro_capt).hide();
            if (descr == "") {
              piro_capt.html('');
            } else {
              piro_capt.html('<p>' + descr + '</p>');
            }
            animate_image();
            break;
          case 'single':
            piro_close.add(btn_info).add(piro_capt).hide();
            div_reg.html('').css('overflow', 'hidden');
            resize.css('overflow', 'hidden');
            $('.my_frame').remove();
            if (descr == "") {
              piro_capt.html('');
            } else {
              piro_capt.html('<p>' + descr + '</p>');
            }
            animate_image();
            break
        }
      }
    });
    $('.immagine').live('click', function() {
      piro_capt.slideToggle(200);
    });

    function close_all() {
      if ($('.piro_close').is(':visible')) {
        $('.my_frame').remove();
        wrapper.add(div_reg).add(resize).stop();
        var ie_sucks = wrapper;
        if ($.browser.msie) {
          ie_sucks = div_reg.add(piro_bg);
          $('.div_reg img').remove();
        } else {
          ie_sucks = wrapper.add(piro_bg);
        }
        ie_sucks.piroFadeOut(200, function() {
          div_reg.html('');
          piro_loader.add(piro_capt).add(btn_info).hide();
          $('.nav_container').hide();
          piro_bg.add(wrapper).hide().css('visibility', 'visible');
        });
      }
    }
    piro_close.add(piro_loader).add(piro_bg).bind('click', function(y) {
      y.preventDefault();
      close_all();
    });
  }
})(jQuery);
/*! RESOURCE: lightbox */
(function() {
  var b, d, c;
  b = jQuery;
  c = (function() {
    function b() {
      this.fadeDuration = 500;
      this.fitImagesInViewport = true;
      this.resizeDuration = 700;
      this.showImageNumberLabel = true;
      this.wrapAround = false
    }
    b.prototype.albumLabel = function(b, c) {
      return "Image " + b + " of " + c
    };
    return b
  })();
  d = (function() {
    function c(b) {
      this.options = b;
      this.album = [];
      this.currentImageIndex = void 0;
      this.init()
    }
    c.prototype.init = function() {
      this.enable();
      return this.build()
    };
    c.prototype.enable = function() {
      var c = this;
      return b('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', function(d) {
        c.start(b(d.currentTarget));
        return false
      })
    };
    c.prototype.build = function() {
      var c = this;
      b("<div id='lightboxOverlay' class='lightboxOverlay'></div><div id='lightbox' class='lightbox'><div class='lb-outerContainer'><div class='lb-container'><img class='lb-image' src='' /><div class='lb-nav'><a class='lb-prev' href='' ></a><a class='lb-next' href='' ></a></div><div class='lb-loader'><a class='lb-cancel'></a></div></div></div><div class='lb-dataContainer'><div class='lb-data'><div class='lb-details'><span class='lb-caption'></span><span class='lb-number'></span></div><div class='lb-closeContainer'><a class='lb-close'></a></div></div></div></div>").appendTo(b('body'));
      this.$lightbox = b('#lightbox');
      this.$overlay = b('#lightboxOverlay');
      this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
      this.$container = this.$lightbox.find('.lb-container');
      this.containerTopPadding = parseInt(this.$container.css('padding-top'), 10);
      this.containerRightPadding = parseInt(this.$container.css('padding-right'), 10);
      this.containerBottomPadding = parseInt(this.$container.css('padding-bottom'), 10);
      this.containerLeftPadding = parseInt(this.$container.css('padding-left'), 10);
      this.$overlay.hide().on('click', function() {
        c.end();
        return false
      });
      this.$lightbox.hide().on('click', function(d) {
        if (b(d.target).attr('id') === 'lightbox') {
          c.end()
        }
        return false
      });
      this.$outerContainer.on('click', function(d) {
        if (b(d.target).attr('id') === 'lightbox') {
          c.end()
        }
        return false
      });
      this.$lightbox.find('.lb-prev').on('click', function() {
        if (c.currentImageIndex === 0) {
          c.changeImage(c.album.length - 1)
        } else {
          c.changeImage(c.currentImageIndex - 1)
        }
        return false
      });
      this.$lightbox.find('.lb-next').on('click', function() {
        if (c.currentImageIndex === c.album.length - 1) {
          c.changeImage(0)
        } else {
          c.changeImage(c.currentImageIndex + 1)
        }
        return false
      });
      return this.$lightbox.find('.lb-loader, .lb-close').on('click', function() {
        c.end();
        return false
      })
    };
    c.prototype.start = function(c) {
      var f, e, j, d, g, n, o, k, l, m, p, h, i;
      b(window).on("resize", this.sizeOverlay);
      b('select, object, embed').css({
        visibility: "hidden"
      });
      this.$overlay.width(b(document).width()).height(b(document).height()).fadeIn(this.options.fadeDuration);
      this.album = [];
      g = 0;
      j = c.attr('data-lightbox');
      if (j) {
        h = b(c.prop("tagName") + '[data-lightbox="' + j + '"]');
        for (d = k = 0, m = h.length; k < m; d = ++k) {
          e = h[d];
          this.album.push({
            link: b(e).attr('href'),
            title: b(e).attr('title')
          });
          if (b(e).attr('href') === c.attr('href')) {
            g = d
          }
        }
      } else {
        if (c.attr('rel') === 'lightbox') {
          this.album.push({
            link: c.attr('href'),
            title: c.attr('title')
          })
        } else {
          i = b(c.prop("tagName") + '[rel="' + c.attr('rel') + '"]');
          for (d = l = 0, p = i.length; l < p; d = ++l) {
            e = i[d];
            this.album.push({
              link: b(e).attr('href'),
              title: b(e).attr('title')
            });
            if (b(e).attr('href') === c.attr('href')) {
              g = d
            }
          }
        }
      }
      f = b(window);
      o = f.scrollTop() + f.height() / 10;
      n = f.scrollLeft();
      this.$lightbox.css({
        top: o + 'px',
        left: n + 'px'
      }).fadeIn(this.options.fadeDuration);
      this.changeImage(g)
    };
    c.prototype.changeImage = function(f) {
      var d, c, e = this;
      this.disableKeyboardNav();
      d = this.$lightbox.find('.lb-image');
      this.sizeOverlay();
      this.$overlay.fadeIn(this.options.fadeDuration);
      b('.lb-loader').fadeIn('slow');
      this.$lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();
      this.$outerContainer.addClass('animating');
      c = new Image();
      c.onload = function() {
        var m, g, h, i, j, k, l;
        d.attr('src', e.album[f].link);
        m = b(c);
        d.width(c.width);
        d.height(c.height);
        if (e.options.fitImagesInViewport) {
          l = b(window).width();
          k = b(window).height();
          j = l - e.containerLeftPadding - e.containerRightPadding - 20;
          i = k - e.containerTopPadding - e.containerBottomPadding - 110;
          if ((c.width > j) || (c.height > i)) {
            if ((c.width / j) > (c.height / i)) {
              h = j;
              g = parseInt(c.height / (c.width / h), 10);
              d.width(h);
              d.height(g)
            } else {
              g = i;
              h = parseInt(c.width / (c.height / g), 10);
              d.width(h);
              d.height(g)
            }
          }
        }
        return e.sizeContainer(d.width(), d.height())
      };
      c.src = this.album[f].link;
      this.currentImageIndex = f
    };
    c.prototype.sizeOverlay = function() {
      return b('#lightboxOverlay').width(b(document).width()).height(b(document).height())
    };
    c.prototype.sizeContainer = function(f, g) {
      var b, d, e, h, c = this;
      h = this.$outerContainer.outerWidth();
      e = this.$outerContainer.outerHeight();
      d = f + this.containerLeftPadding + this.containerRightPadding;
      b = g + this.containerTopPadding + this.containerBottomPadding;
      this.$outerContainer.animate({
        width: d,
        height: b
      }, this.options.resizeDuration, 'swing');
      setTimeout(function() {
        c.$lightbox.find('.lb-dataContainer').width(d);
        c.$lightbox.find('.lb-prevLink').height(b);
        c.$lightbox.find('.lb-nextLink').height(b);
        c.showImage()
      }, this.options.resizeDuration)
    };
    c.prototype.showImage = function() {
      this.$lightbox.find('.lb-loader').hide();
      this.$lightbox.find('.lb-image').fadeIn('slow');
      this.updateNav();
      this.updateDetails();
      this.preloadNeighboringImages();
      this.enableKeyboardNav()
    };
    c.prototype.updateNav = function() {
      this.$lightbox.find('.lb-nav').show();
      if (this.album.length > 1) {
        if (this.options.wrapAround) {
          this.$lightbox.find('.lb-prev, .lb-next').show()
        } else {
          if (this.currentImageIndex > 0) {
            this.$lightbox.find('.lb-prev').show()
          }
          if (this.currentImageIndex < this.album.length - 1) {
            this.$lightbox.find('.lb-next').show()
          }
        }
      }
    };
    c.prototype.updateDetails = function() {
      var b = this;
      if (typeof this.album[this.currentImageIndex].title !== 'undefined' && this.album[this.currentImageIndex].title !== "") {
        this.$lightbox.find('.lb-caption').html(this.album[this.currentImageIndex].title).fadeIn('fast')
      }
      if (this.album.length > 1 && this.options.showImageNumberLabel) {
        this.$lightbox.find('.lb-number').text(this.options.albumLabel(this.currentImageIndex + 1, this.album.length)).fadeIn('fast')
      } else {
        this.$lightbox.find('.lb-number').hide()
      }
      this.$outerContainer.removeClass('animating');
      this.$lightbox.find('.lb-dataContainer').fadeIn(this.resizeDuration, function() {
        return b.sizeOverlay()
      })
    };
    c.prototype.preloadNeighboringImages = function() {
      var c, b;
      if (this.album.length > this.currentImageIndex + 1) {
        c = new Image();
        c.src = this.album[this.currentImageIndex + 1].link
      }
      if (this.currentImageIndex > 0) {
        b = new Image();
        b.src = this.album[this.currentImageIndex - 1].link
      }
    };
    c.prototype.enableKeyboardNav = function() {
      b(document).on('keyup.keyboard', b.proxy(this.keyboardAction, this))
    };
    c.prototype.disableKeyboardNav = function() {
      b(document).off('.keyboard')
    };
    c.prototype.keyboardAction = function(g) {
      var d, e, f, c, b;
      d = 27;
      e = 37;
      f = 39;
      b = g.keyCode;
      c = String.fromCharCode(b).toLowerCase();
      if (b === d || c.match(/x|o|c/)) {
        this.end()
      } else if (c === 'p' || b === e) {
        if (this.currentImageIndex !== 0) {
          this.changeImage(this.currentImageIndex - 1)
        }
      } else if (c === 'n' || b === f) {
        if (this.currentImageIndex !== this.album.length - 1) {
          this.changeImage(this.currentImageIndex + 1)
        }
      }
    };
    c.prototype.end = function() {
      this.disableKeyboardNav();
      b(window).off("resize", this.sizeOverlay);
      this.$lightbox.fadeOut(this.options.fadeDuration);
      this.$overlay.fadeOut(this.options.fadeDuration);
      return b('select, object, embed').css({
        visibility: "visible"
      })
    };
    return c
  })();
  b(function() {
    var e, b;
    b = new c();
    return e = new d(b)
  })
}).call(this);
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