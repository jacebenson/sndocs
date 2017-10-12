/*! RESOURCE: /scripts/doctype/js_includes_last_doctype.js */
/*! RESOURCE: /scripts/functions_showloading.js */
function showLoadingDialog(callbackFn) {
  var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
  window.loadingDialog = new dialogClass("dialog_loading", true, 300);
  window.loadingDialog.setPreference('table', 'loading');
  window.loadingDialog._isLoadingDialogRendered = false;
  window.loadingDialog.on('bodyrendered', function() {
    window.loadingDialog._isLoadingDialogRendered = true;
  });
  if (callbackFn)
    window.loadingDialog.on('bodyrendered', callbackFn);
  window.loadingDialog.render();
}

function hideLoadingDialog() {
  if (!window.loadingDialog) {
    jslog('hideLoadingDialog called with no loading dialog on the page')
    return;
  }
  if (!window.loadingDialog._isLoadingDialogRendered) {
    window.loadingDialog.on('bodyrendered', function() {
      window.loadingDialog.destroy();
    });
    return;
  }
  window.loadingDialog.destroy();
};
/*! RESOURCE: /scripts/doctype/event_initialize.js */
$(document.body);
addAfterPageLoadedEvent(function() {
  document.on('keypress', 'input[data-type="ac_reference_input"]', function(evt, element) {
    acPopulate(element);
    acReferenceKeyPress(element, evt);
  });
  document.on('keydown', 'input[data-type="ac_reference_input"]', function(evt, element) {
    acPopulate(element);
    acReferenceKeyDown(element, evt);
  });
  document.on('keyup', 'input[data-type="ac_reference_input"]', function(evt, element) {
    acPopulate(element);
    acReferenceKeyUp(element, evt);
  });
  document.on('paste', 'input[data-type="ac_reference_input"]', function(evt, element) {
    setTimeout(function() {
      acPopulate(element);
      acReferenceKeyPress(element, evt);
    }, 0);
  });

  function acPopulate(element) {
    if (!element) {
      return;
    }
    var answer = element.ac;
    if (answer)
      return answer;
    var c = element.getAttribute('data-completer');
    var ref = element.getAttribute('data-ref');
    var d = element.getAttribute('data-dependent');
    var rq = element.getAttribute('data-ref-qual');
    new window[c](element, ref, d, rq);
  }
  document.body.on('click', 'a[data-type="ac_reference_input"]', function(evt, element) {
    var name = element.getAttribute('data-for');
    var target = $(name);
    if (!target) {
      return;
    }
    acPopulate(target);
    mousePositionSave(evt);
    var ref = target.getAttribute('data-ref');
    var d = target.getAttribute('data-dependent');
    var rq = target.getAttribute('data-ref-qual');
    var n = target.getAttribute('data-name');
    var table = target.getAttribute('data-table');
    reflistOpen(ref, n, table, d, 'false', rq);
  });
  window.addEventListener('focus', function(evt, element) {
    if (window.popupClose)
      popupClose();
  });
  document.body.on('click', 'a[data-type="reference_popup"]', function(evt, element) {
    var table = element.getAttribute('data-table');
    var form = element.getAttribute('data-form');
    var ref = element.getAttribute('data-ref');
    var refKey = element.getAttribute('data-ref-key');
    checkSave(table, form, ref, refKey);
  });
  document.on('mouseover', 'a[data-type="reference_popup"], a[data-type="reference_hover"]', function(evt, element) {
    var ref = element.getAttribute('data-ref');
    var view = element.getAttribute('data-view');
    var refKey = element.getAttribute('data-ref-key');
    popReferenceDiv(evt, ref, view, null, refKey);
  });
  document.on('mouseout', 'a[data-type="reference_popup"], a[data-type="reference_hover"]', function(evt, element) {
    lockPopup(evt);
  });
  document.body.on('click', 'a[data-type="reference_hover"]', function(evt, element) {
    alert(getMessage("Reference field click-through not available when updating multiple records"));
  });
  document.body.on('click', 'img[data-type="section_toggle"], span[data-type="section_toggle"]', function(evt, element) {
    var id = element.getAttribute("data-id");
    var prefix = element.getAttribute("data-image-prefix");
    var first = element.getAttribute("data-first");
    toggleSectionDisplay(id, prefix, first);
  });
  document.body.on('click', '[data-type="glide_list_unlock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    unlock(element, ref, ref + "_edit", ref + "_nonedit");
    toggleGlideListIcons(ref, false);
    var spaceElement = $('make_spacing_ok_' + ref);
    if (spaceElement)
      spaceElement.style.display = 'none';
    toggleAddMe(ref);
    evt.stop();
  });
  document.body.on('click', '[data-type="user_roles_unlock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var title = element.getAttribute("data-title");
    var modal = new GlideModal(ref + "_edit_modal", false);
    modal.setTitle(title);
    modal.on('bodyrendered', function() {
      gel(ref + 'select_0').focus();
    });
    var $content = $j(gel(ref + "_edit")).show();
    modal.renderWithContent($content);
    modal.on('beforeclose', function() {
      lock(element, ref, ref + '_edit', ref + '_nonedit', ref + 'select_1', ref + '_nonedit');
      $j(element).append($content);
    });
    evt.stop();
  });
  document.body.on('click', '[data-type="user_roles_lock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    $j(gel(ref + "_edit_modal")).data('gWindow').destroy();
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_remove"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    simpleRemoveOption($('select_0' + ref));
    toggleGlideListIcons(ref);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_lock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    lock(element, ref, ref + "_edit", ref + "_nonedit", "select_0" + ref, ref + "_nonedit");
    var spaceElement = $('make_spacing_ok_' + ref);
    if (spaceElement)
      spaceElement.style.display = 'inline';
    toggleAddMe(ref);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_add_me"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var u = element.getAttribute("data-user-id");
    var name = element.getAttribute("data-user").replace(/\\'/, "'");;
    addGlideListChoice('select_0' + ref, u, name);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_add_me_locked"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var u = element.getAttribute("data-user-id");
    var name = element.getAttribute("data-user").replace(/\\'/, "'");;
    addGlideListChoice('select_0' + ref, u, name);
    lock($(ref + "_lock"), ref, ref + "_edit", ref + "_nonedit", "select_0" + ref, ref + "_nonedit");
    element.hide();
    evt.stop();
  });
  document.on('contextmenu', 'div[data-type="label"]', function(evt, element) {
    if (!elementAction(element, evt))
      evt.stop();
  });
  document.on('contextmenu', 'nav[data-type="section_head"]', function(evt, element) {
    var id = element.getAttribute("data-id");
    if (!contextShow(evt, "1", -1, 0, 0))
      evt.stop();
  });
});;
/*! RESOURCE: /scripts/functions_clipboard.js */
window.NOW = window.NOW || {};
window.NOW.g_clipboard = {};
(function(exports) {
  var browserReturnsErroneousStatus = navigator.userAgent.indexOf('MSIE 9') != -1 ||
    navigator.userAgent.indexOf('MSIE 10') != -1 ||
    navigator.userAgent.indexOf('rv:11') != -1;
  exports.copyToClipboard = function(str, messageMethod) {
    if (document.execCommand && isCapableMessageMethod(messageMethod)) {
      var v = document.createElement('textarea');
      v.innerHTML = str;
      v.className = "sr-only";
      document.body.appendChild(v);
      v.select();
      var result = true;
      try {
        result = document.execCommand('copy');
        if (result && browserReturnsErroneousStatus) {
          var checkDiv = document.createElement('textarea');
          checkDiv.className = "sr-only";
          document.body.appendChild(checkDiv);
          checkDiv.select();
          try {
            document.execCommand('paste');
            result = checkDiv.value == str;
          } finally {
            document.body.removeChild(checkDiv);
          }
        }
      } catch (e) {
        result = false;
        if (window.jslog)
          jslog("Couldn't access clipboard " + e);
      } finally {
        document.body.removeChild(v);
      }
      if (result) {
        fireCopiedMessage(messageMethod);
        return true;
      }
    }
    legacyClipboardCopy(str);
    return false;
  }

  function isCapableMessageMethod(messageMethod) {
    if (messageMethod == 'custom')
      return true;
    return 'GlideUI' in window;
  }

  function fireCopiedMessage(messageMethod) {
    if (!messageMethod || messageMethod == 'GlideUI') {
      var span = document.createElement('span');
      span.setAttribute('data-type', 'info');
      span.setAttribute('data-text', 'Copied to clipboard');
      span.setAttribute('data-duration', '2500');
      GlideUI.get().fire(new GlideUINotification({
        xml: span
      }));
    }
  }

  function legacyClipboardCopy(meintext) {
    prompt("Because of a browser limitation the URL can not be placed directly in the clipboard. " +
      "Please use Ctrl-C to copy the data and escape to dismiss this dialog", meintext);
  }
})(window.NOW.g_clipboard);;
/*! RESOURCE: /scripts/context_actions.js */
function switchView(type, tableName, viewName) {
  ScriptLoader.getScripts('scripts/classes/GlideViewManager.js', function() {
    if (type == 'list')
      new GlideViewManager(tableName, viewName).refreshList();
    else
      new GlideViewManager(tableName, viewName).refreshDetail();
  })
}

function copyRowToClipboard(base, ref, sysId, view) {
  var url = base + "nav_to.do?uri=" + ref + ".do?sys_id=" + sysId;
  if (view)
    url += "%26sysparm_view=" + view;
  copyToClipboard(url);
}

function doUpdate(scope) {
  var name = gActiveContext.getTableName();
  var temp = name + '_update.do';
  var form = getControlForm(name);
  var msg = ['There are no rows selected', 'Update the entire list?', 'records'];
  var answer = getMessages(msg);
  if (scope == 'selected' && getChecked(form) == '') {
    alert(answer['There are no rows selected']);
    return;
  }
  form.action = temp;
  addInput(form, 'HIDDEN', 'sys_action', 'sysverb_multiple_update');
  addInput(form, 'HIDDEN', 'sysparm_multiple', 'true');
  addInput(form, 'HIDDEN', 'sysparm_nostack', 'yes');
  if (scope == 'selected')
    populateParmQuery(form, 'sys_idIN', 'NULL');
  else {
    if (!confirm(answer['Update the entire list?'] + " (" +
        form.sysparm_total_rows.value + " " + answer['records'] + ")")) {
      return;
    }
  }
  form.submit();
}

function contextAction(tableName, actionName) {
  var form = getControlForm(tableName);
  addInput(form, 'HIDDEN', 'sys_action', actionName);
  form.submit();
}

function contextConfirm(tableName, actionName) {
  var sysparm_rows = gel('sysparm_total_rows').value;
  var num_rows = parseInt(sysparm_rows);
  var sysparm_query = gel('sysparm_query');
  if (sysparm_query)
    sysparm_query = sysparm_query.value;
  else
    sysparm_query = '';
  var sysparm_view = getView(tableName);
  if (num_rows < g_export_warn_threshold) {
    var dialog = new GwtPollDialog(tableName, sysparm_query, sysparm_rows, sysparm_view, actionName);
    dialog.execute();
    return;
  }
  var dialog = new GwtExportScheduleDialog(tableName, sysparm_query, sysparm_rows, sysparm_view, actionName);
  dialog.execute();
}

function executeRecentSearch(searchTerm, url) {
  parent.document.getElementById('sysparm_search').value = decodeURIComponent(searchTerm);
  window.open(url, 'gsft_main');
  CustomEvent.fire('adjustsearch');
}

function getView(tableName) {
  var sysparm_view = '';
  if (isReport()) {
    var form = getControlForm(tableName);
    if (form) {
      var temp = form['sysparm_view'];
      if (temp)
        sysparm_view = temp.value;
    }
  }
  if (sysparm_view != '')
    return sysparm_view;
  var sp = gel('sysparm_view');
  if (sp)
    sysparm_view = sp.value;
  return sysparm_view;

  function isReport() {
    var list = gel('reportform_control');
    if (list)
      return true;
    return false;
  }
}
var copyToClipboard = typeof window.NOW.g_clipboard !== 'undefined' ? window.NOW.g_clipboard.copyToClipboard : null;

function showQuickForm(id, action, width, height) {
  var form;
  var tableName;
  var srcElement;
  var keyset;
  if (window.lastEvent) {
    srcElement = getSrcElement(window.lastEvent);
    form = srcElement.form;
    if (srcElement.tagName == "SELECT") {
      var o = srcElement.options[srcElement.selectedIndex];
      tableName = o.getAttribute("table");
    } else
      tableName = srcElement.getAttribute("table");
    if ((action == undefined || action == '') && srcElement.value)
      action = srcElement.value;
    if (!form)
      keyset = g_list.getChecked();
    else
      keyset = getChecked(form);
    window.lastEvent = null;
  }
  if (tableName == undefined) {
    if (typeof(gcm) == 'undefined')
      gcm = crumbMenu;
    tableName = gcm.getTableName();
    form = getFormForList(tableName);
    if (typeof(rowSysId) != 'undefined')
      keyset = rowSysId;
    else
      keyset = getChecked(form);
    gcm.setFiringObject();
  }
  if ((!form && !tableName) || (!tableName && g_list))
    return;
  if (!keyset || keyset == '') {
    alert("No records selected");
    return;
  }
  var gForm = new GlideDialogForm("", tableName + "_update");
  if (width && height)
    gForm.setDialogSize(width, height);
  gForm.addParm('sysparm_view', id);
  gForm.setMultiple(form);
  gForm.addParm('sysparm_checked_items', "sys_idIN" + keyset);
  if (action && action != '')
    gForm.addParm('sysparm_action_name', action);
  gForm.render();
}

function personalizeResponses(id) {
  var parts = id.split('.');
  var mytable = parts[0];
  var myfield = parts[1];
  var myreferurl = document.getElementById('sysparm_this_url_enc');
  var url = "response_list.do?sysparm_name=" + mytable +
    "&sysparm_element=" + myfield +
    "&sysparm_target=" + id +
    "&sysparm_view=sys_response_tailor";
  if (myreferurl)
    url += "&sysparm_referring_url=" + myreferurl.value;
  self.location = url;
}

function personalizeChoices(id) {
  var mytable = id.split('.')[0];
  var mydependent = document.getElementById('ni.dependent_reverse.' + id);
  var url = new GlideURL("slushbucket_choice.do");
  url.addParam('sysparm_ref', id);
  url.addParam('sysparm_form', 'sys_choice');
  url.addParam('sysparm_dependent', (mydependent ? mydependent.value : ""));
  url.addParam('sysparm_stack', 'no');
  if (mydependent != null) {
    var el = document.getElementsByName(mytable + "." + mydependent.value)[0];
    if (el != null) {
      var selectValue;
      if (el.options)
        selectValue = el.options[el.selectedIndex].value;
      else
        selectValue = el.value;
      url.addParam('sysparm_dependent_value', selectValue);
    }
  }
  self.location = url.getURL();
}

function personalizeControl(strIdent, id, query) {
  var url = 'sys_ui_list_control.do?sys_id=' + id;
  if (query && query != '')
    url += "&sysparm_query=" + query;
  window.location = url;
}

function personalizer(strIdent, strForm, strSysId) {
  if (strIdent == 'auto' && window.$j) {
    strIdent = $j('[data-section-id]').first().attr('data-section-id');
  }
  var parentForm = getControlForm(strIdent);
  var form = document.forms['sys_personalize'];
  if (parentForm && parentForm['sysparm_collection_relationship'])
    addInput(form, 'HIDDEN', 'sysparm_collection_relationship', parentForm['sysparm_collection_relationship'].value);
  else
    addInput(form, 'HIDDEN', 'sysparm_collection_relationship', '');
  addInput(form, 'HIDDEN', 'sysparm_list', strIdent);
  addInput(form, 'HIDDEN', 'sysparm_form', strForm);
  addInput(form, 'HIDDEN', 'sysparm_sys_id', strSysId);
  if (parentForm && parentForm['sysparm_collection'])
    addInput(form, 'HIDDEN', 'sysparm_collection', parentForm['sysparm_collection'].value);
  var scopeElement = gel('sysparm_domain_scope');
  if (scopeElement && scopeElement.value) {
    addInput(form, 'HIDDEN', 'sysparm_domain_scope', scopeElement.value);
  }
  if (typeof GlideTransactionScope != 'undefined') {
    GlideTransactionScope.appendTransactionScope(function(name, value) {
      addInput(form, 'HIDDEN', name, value);
    });
  }
  form.submit();
}

function personalizeList(listId, tableName) {
  var parentForm = getFormForList(listId);
  var form = document.forms['sys_personalize'];
  if (parentForm && parentForm['sysparm_collection_relationship'])
    addInput(form, 'HIDDEN', 'sysparm_collection_relationship', parentForm['sysparm_collection_relationship'].value);
  else
    addInput(form, 'HIDDEN', 'sysparm_collection_relationship', '');
  addInput(form, 'HIDDEN', 'sysparm_list', tableName);
  addInput(form, 'HIDDEN', 'sysparm_form', 'list');
  if (parentForm && parentForm['sysparm_collection'])
    addInput(form, 'HIDDEN', 'sysparm_collection', parentForm['sysparm_collection'].value);
  else
    addInput(form, 'HIDDEN', 'sysparm_collection', '');
  if (typeof GlideTransactionScope !== 'undefined') {
    GlideTransactionScope.appendTransactionScope(function(name, value) {
      addInput(form, 'HIDDEN', name, value);
    });
  }
  form.submit();
}

function personalizeField(identifier, formName) {
  var form = document.forms['sys_personalize'];
  var fields = 'name.element.language';
  if (formName && formName.indexOf('sys_dictionary') == 0)
    fields = 'name.element';
  addQueryFilter(form, fields, identifier, '', formName);
  form.action = formName;
  form.submit();
}

function personalizeFields(identifier, formName) {
  var form = document.forms['sys_personalize'];
  addQueryFilter(form, 'name', identifier);
  form.action = formName;
  form.submit();
}

function personalizeSecurity(identifier, field_name) {
  var a = field_name.split('.');
  var g_dialog = new GlideDialogWindow('security_mechanic');
  g_dialog.setPreference('table_name', a[0]);
  g_dialog.setPreference('field_name', a[1]);
  g_dialog.setSize(600, '');
  g_dialog.setTitle('Security Mechanic');
  g_dialog.render();
}

function showDictionary(identifier, field_id) {
  var a = field_id.split('.');
  var g_dialog = new GlideDialogWindow('dictionary_viewer');
  g_dialog.setPreference('table_name', a[0]);
  g_dialog.setPreference('field_name', a[1]);
  g_dialog.setTitle('Dictionary Info: ' + field_id);
  g_dialog.render();
}

function listSecurity(identifier, field_name) {
  var form = document.forms['sys_personalize'];
  addQueryFilter(form, 'CALCULATED:SecurityQueryCalculator', field_name);
  form.action = "sys_security_acl_list.do";
  form.submit();
}

function listCollection(coll_table, coll_field, of_table, view_name) {
  var form = document.forms['sys_personalize'];
  addQueryFilter(form, 'CALCULATED:CollectionQueryCalculator', of_table + ',' + coll_field + ',' + view_name);
  addInput(form, 'HIDDEN', 'sysparm_domain_restore', 'false');
  form.action = coll_table + "_list.do";
  form.submit();
}

function exportToPDF(table, sys_id, isLandscape, sysparm_view) {
  var relatedListFilters = "";
  if (window.g_tabs2List && g_tabs2List.tabIDs) {
    var relatedLists = g_tabs2List.tabIDs;
    var relatedListCount = relatedLists.length;
    if (relatedListCount > 0) {
      for (var i = 0; i < relatedListCount; i++) {
        var relatedListName = relatedLists[i].substring(0, relatedLists[i].lastIndexOf("_list"));
        var filter = getFilter(relatedListName);
        if (filter && filter.length > 0) {
          if (i == relatedListCount - 1)
            relatedListFilters += relatedListName + "=" + encodeURIComponent(encodeURIComponent(filter));
          else
            relatedListFilters += relatedListName + "=" + encodeURIComponent(encodeURIComponent(filter)) + "^";
        }
      }
    }
  }
  var url = table + ".do?sys_id=" + sys_id + "&PDF" + "&sysparm_view=" + sysparm_view + "&related_list_filter=" + relatedListFilters;
  if (isLandscape)
    url += "&landscape=true";
  window.location = url;
}

function showList(tableName, fields, ids) {
  if (!ids)
    ids = gActiveContext.getTableName();
  self.location = tableName + "_list.do?sysparm_query=" + addQueryFilter('', fields, ids, tableName);
}

function showItem(tableName, fields, ids, view) {
  if (!ids)
    ids = gActiveContext.getTableName();
  var url = tableName + ".do?sysparm_query=" + addQueryFilter('', fields, ids, tableName);
  if (typeof(view) != "undefined") {
    url += "&sysparm_view=" + view;
  }
  self.location = url;
}

function addQueryFilter(form, names, values, table, formName) {
  var tableName = table;
  if ((names == '' || names == null) || (values == '' || values == null))
    return;
  if (names.indexOf("CALCULATED") == 0) {
    var ec = "";
    if (names.indexOf("CollectionQueryCalculator") > 0)
      ec = collectionQueryCalculator(values);
    else
      ec = securityQueryCalculator(values);
    addInput(form, "HIDDEN", "sysparm_query", ec);
    addInput(form, "HIDDEN", "sysparm_query_encoced", ec);
    return;
  }
  var vNames = names.split(".");
  var vValues = values.split(".");
  if (names.indexOf("name.element") == 0) {
    if (vValues.length > 2) {
      var tableElement = TableElement.get(values);
      vValues[0] = tableElement.getTableName();
      vValues[1] = tableElement.getName();
    } else {
      var tableR = new Table(vValues[0]);
      var element = tableR.getElement(vValues[1]);
      var label = '';
      if (formName && formName.indexOf("sys_documentation") == 0)
        label = getTableLabel(tableR.getName(), element.getName());
      if (label == '' && element != null)
        vValues[0] = element.getTableName();
    }
  }
  if (names.indexOf("name.element.language") == 0) {
    vValues[2] = g_lang;
  }
  var query = new Array();
  for (var i = 0; i < vNames.length; i++) {
    if ("sys_choice" == tableName && "name" == vNames[i]) {
      query.push("nameINjavascript:getTableExtensions('" + vValues[i] + "')");
    } else if ("sys_ui_style" == tableName && "name" == vNames[i]) {
      query.push(buildQueryClause(values.split(".")[0], "name"));
    } else
      query.push(vNames[i] + "=" + vValues[i]);
  }
  if (tableName)
    return query.join('^');
  addInput(form, "HIDDEN", "sysparm_query", query.join('^'));
  addInput(form, "HIDDEN", "sysparm_query_encoded", query.join('^'));
  setStack(form);
}

function getTableLabel(tabel, element) {
  var ajax = new GlideAjax('ContextActionsAjax');
  ajax.addParam("sysparm_name", "getLabel");
  ajax.addParam("sysparm_type", tabel);
  ajax.addParam("sysparm_value", element);
  ajax.getXMLWait();
  return ajax.getAnswer();
}

function collectionQueryCalculator(args) {
  var sa = args.split(",");
  var tableName = sa[0];
  var collField = sa[1];
  return buildQueryClause(tableName, collField);
}

function buildQueryClause(tableName, collField) {
  var tableDef = Table.get(tableName);
  var tables = tableDef.getTables();
  var result = new Array();
  result.push(collField);
  result.push("=");
  result.push(tableName);
  result.push("^OR");
  result.push(collField);
  result.push("IN");
  result.push(tables.join());
  return result.join("");
}

function securityQueryCalculator(values) {
  var sa = values.split(".");
  var fieldName = null;
  var element = null;
  var tableName = sa[0];
  if (sa.length > 1)
    fieldName = sa[1];
  var allTables = new Array();
  var table = new Table(tableName);
  if (fieldName == null)
    allTables = table.getTables();
  else {
    allTables.push(tableName);
    element = table.getElement(fieldName);
    if (element != null && element.getTableName() != tableName)
      allTables.push(element.getTableName());
    allTables.push("*");
  }
  var rc = getRules(allTables, fieldName);
  return rc;
}

function getRules(allTables, fieldName) {
  var rules = null;
  if (fieldName == null) {
    rules = "name=*^ORnameSTARTSWITH*.";
    for (var i = 0; i < allTables.length; i++)
      rules += "^ORname=" + allTables[i] + "^ORnameSTARTSWITH" + allTables[i] + ".";
    return rules;
  }
  var rc = new Array();
  for (var x = 0; x < allTables.length; x++) {
    var tableName = allTables[x];
    rc.push(tableName);
    rc.push(tableName + ".*");
    if (fieldName != null)
      rc.push(tableName + "." + fieldName);
  }
  rules = "nameIN" + rc.join();
  return rules;
}

function setWatchField(id) {
  var ajax = new GlideAjax('ContextActionsAjax');
  ajax.addParam("sysparm_name", "setWatchField");
  ajax.addParam("sysparm_id", id);
  ajax.getXML(function() {
    CustomEvent.fire('glide_optics_inspect_watchfield', id)
  });
}

function showWatchField(id) {
  var ajax = new GlideAjax('ContextActionsAjax');
  ajax.addParam("sysparm_name", "setWatchField");
  ajax.addParam("sysparm_id", id);
  ajax.getXML(function() {
    CustomEvent.fire('glide_optics_inspect_show_watchfield', id)
  });
}

function clearWatchField(id) {
  var ajax = new GlideAjax('ContextActionsAjax');
  ajax.addParam("sysparm_name", "clearWatchField");
  ajax.getXML();
  ajax.getXML(function() {
    CustomEvent.fire('glide_optics_inspect_clear_watchfield', id)
  });
}

function setStack(form) {
  var url = new GlideURL(window.location.href);
  var stack = url.getParam('sysparm_nameofstack');
  if (stack)
    addInput(form, 'HIDDEN', 'sysparm_nameofstack', stack);
};
/*! RESOURCE: /scripts/classes/ui/GlideBox.js */
var g_glideBoxes = {};
var GlideBox = Class.create({
      QUIRKS_MODE: document.compatMode != 'CSS1Compat',
      initialize: function(options) {
        if (isMSIE9)
          this.QUIRKS_MODE = this._isQuirksMode();
        this.options = Object.extend({
          id: typeof options == 'string' ? options : guid(),
          title: 'Default Title',
          boxClass: '',
          body: '',
          form: null,
          iframe: null,
          iframeId: null,
          bodyPadding: 4,
          fadeOutTime: 200,
          draggable: true,
          showClose: true,
          parent: document.body,
          boundingContainer: options.parent || document.body,
          position: Prototype.Browser.IE || options.parent ? 'absolute' : 'fixed',
          allowOverflowY: true,
          allowOverflowX: true,
          height: null,
          maxHeight: null,
          minHeight: 50,
          width: null,
          minWidth: 70,
          maxWidth: null,
          top: null,
          bottom: null,
          maxTop: null,
          minBottom: null,
          left: null,
          right: null,
          preferences: {},
          onBeforeLoad: function() {},
          onAfterLoad: function() {},
          onBeforeHide: function() {},
          onAfterHide: function() {},
          onBeforeShow: function() {},
          onAfterShow: function() {},
          onBeforeClose: function() {},
          onAfterClose: function() {},
          onBeforeDrag: function() {},
          onAfterDrag: function() {},
          onBeforeResize: function() {},
          onAfterResize: function() {},
          onHeightAdjust: function() {},
          onWidthAdjust: function() {},
          autoDimensionOnPreLoad: true,
          autoDimensionOnLoad: true,
          autoPositionOnLoad: true,
          fadeInTime: 250
        }, options || {});
        this.options.padding = Object.extend({
          top: 15,
          right: 15,
          bottom: 15,
          left: 15
        }, this.options.padding || {});
        this._iframeShim = null;
        this._dataCache = {};
        this._box = $(document.createElement('div'));
        this._box.id = this.options.id;
        this._box.className = (new Array('glide_box', 'gb_mw', trim(this.options.boxClass), this.options.iframe && this.options.iframe != '' ? 'iframe' : '').join(' '));
        this._box.setAttribute('role', 'dialog');
        this._box.innerHTML = gb_BoxTemplateInner;
        if (this._box.hasClassName('frame'))
          this.getBodyWrapperElement().update(gb_BodyFrameTemplate);
        this.options.parent.appendChild(this._box);
        this.setBody(this.options.body);
        this.setBodyPadding(this.options.bodyPadding);
        if (this.options.titleHtml)
          this.setTitleHtml(this.options.titleHtml)
        else
          this.setTitle(this.options.title);
        this.setDraggable(this.options.draggable);
        this.setStyle({
          position: this.options.position
        });
        if (this.options.maxWidth)
          this.setMaxWidth(this.options.maxWidth);
        if (this.options.showClose)
          this.addToolbarCloseButton();
        if (this.options.allowOverflowY === false)
          this.getBodyElement().setStyle({
            overflowY: 'hidden'
          });
        if (this.options.allowOverflowX === false)
          this.getBodyElement().setStyle({
            overflowX: 'hidden'
          });
        g_glideBoxes[this.options.id] = this;
      },
      getId: function() {
        return this.options.id;
      },
      getBoxElement: function() {
        return this._box;
      },
      getBoxWrapperElement: function() {
        return this._box.select('.gb_wrapper')[0];
      },
      getIFrameElement: function() {
        return this._box.select('iframe')[0];
      },
      isVisible: function() {
        return this._box.visible();
      },
      isLoading: function() {
        return this._isLoading;
      },
      setOnClick: function(f) {
        this._box.observe('click', f.bind(this));
      },
      setOnBeforeLoad: function(f) {
        this.options.onBeforeLoad = f;
      },
      setOnAfterLoad: function(f) {
        this.options.onAfterLoad = f;
      },
      setOnBeforeClose: function(f) {
        this.options.onBeforeClose = f;
      },
      setOnAfterClose: function(f) {
        this.options.onAfterClose = f;
      },
      setOnBeforeDrag: function(f) {
        this.options.onBeforeDrag = f;
      },
      setOnAfterDrag: function(f) {
        this.options.onAfterDrag = f;
      },
      setOnBeforeResize: function(f) {
        this.options.onBeforeResize = f;
      },
      setOnAfterResizes: function(f) {
        this.options.onAfterResize = f;
      },
      setOnHeightAdjust: function(f) {
        this.options.onHeightAdjust = f;
      },
      setOnWidthAdjust: function(f) {
        this.options.onWidthAdjust = f;
      },
      addData: function(key, value) {
        this._dataCache[key] = value;
      },
      getData: function(key) {
        return this._dataCache[key];
      },
      getToolbar: function() {
        return this._box.select('.gb_toolbar')[0];
      },
      addToolbarRow: function(html) {
        var thead = this._box.select('.gb_table > thead')[0];
        var td = thead.insertRow(thead.rows.length).insertCell(0);
        td.className = 'gb_table_col_l1';
        td.innerHTML = html;
        return td;
      },
      setTitle: function(html) {
        var titleZone = this._box.select('.gb_title_zone')[0];
        titleZone.addClassName('gb_toolbar_text');
        if (titleZone.firstChild)
          titleZone.removeChild(titleZone.firstChild);
        var text = document.createTextNode(html);
        titleZone.appendChild(text);
        this._box.setAttribute('aria-label', html);
      },
      setTitleHtml: function(html) {
        this._box.select('.gb_title_zone')[0].removeClassName('gb_toolbar_text').innerHTML = html;
      },
      setWindowIcon: function(html) {
        var tr = this._box.select('.gb_toolbar_left tr')[0];
        for (var i = 0, l = tr.childNodes.length; i < l; i++)
          tr.deleteCell(i);
        this.addWindowIcon(html);
      },
      addWindowIcon: function(html) {
        this.addToolbarLeftDecoration('<div style="margin-left:5px;">' + html + '</div>');
      },
      removeToolbarDecoration: function(objSelector) {
        var e = this.getToolbar().select(objSelector);
        if (!e || e.length == 0)
          return;
        if (e[0].tagName.toLowerCase() == 'td')
          var td = e;
        else if (e[0].parentNode.tagName.toLowerCase() == 'td')
          var td = e[0].parentNode;
        else
          return;
        var tr = td.parentNode;
        for (var i = 0, l = tr.childNodes.length; i < l; i++) {
          if (tr.childNodes[i] == td) {
            tr.deleteCell(i);
            break;
          }
        }
      },
      addToolbarLeftDecoration: function(html, boolPrepend) {
        return this._addToolbarDecoration(html, boolPrepend || false, '.gb_toolbar_left');
      },
      addToolbarRightDecoration: function(html, boolPrepend) {
        return this._addToolbarDecoration(html, boolPrepend || false, '.gb_toolbar_right');
      },
      addToolbarCloseButton: function() {
        var arr = this._box.getElementsByClassName('gb_close');
        if (arr.length == 1)
          return;
        var className = this._box.hasClassName('dark') || this._box.hasClassName('iframe') ?
          'icon-cross-circle i12 i12_close' :
          'icon-cross-circle i16 i16_close2';
        this.addToolbarRightDecoration('<span style="float:none;cursor:pointer;" ' +
          'tabindex="0" aria-label="Close" role="button" class="gb_close ' + className + '"></span>');
        this.setToolbarCloseOnClick(function(event) {
          this.close();
        }.bind(this));
      },
      removeToolbarCloseButton: function() {
        this.removeToolbarDecoration('.gb_close');
      },
      setToolbarCloseOnClick: function(f) {
        var arr = this._box.getElementsByClassName('gb_close');
        if (arr.length == 0)
          return;
        arr[0].stopObserving('mousedown');
        arr[0].observe('mousedown', function(event) {
          f.call(this, event);
          event.stop();
        }.bind(this));
        arr[0].stopObserving('keydown');
        arr[0].observe('keydown', function(event) {
          if (event.keyCode != 13)
            return;
          f.call(this, event);
          event.stop();
        }.bind(this));
      },
      _addToolbarDecoration: function(html, boolPrepend, tableClassSelector) {
        var table = this._box.select(tableClassSelector)[0].show();
        var tr = table.select('tr')[0];
        var td = tr.insertCell(boolPrepend ? 0 : -1);
        td.innerHTML = html;
        return td;
      },
      getFooter: function() {
        return this._box.select('.gb_footer')[0];
      },
      showFooter: function() {
        if (this._isFooterVisible === true)
          return;
        this.getFooter().show();
        this._box.select('.gb_table > tfoot')[0].setStyle({
          display: 'table-footer-group'
        });
        this._isFooterVisible = true;
      },
      hideFooter: function() {
        if (!this._isFooterVisible !== true)
          return;
        this.getFooter().hide();
        this._box.select('.gb_table > tfoot')[0].setStyle({
          display: 'none'
        });
        this._isFooterVisible = false;
      },
      showFooterResizeGrips: function() {
          this.showFooter();
          var footer = this.getFooter();
          if (!footer.select('.i16_resize_grip_left'))
            return;
          footer.select('.gb_footer_left_resize')[0].innerHTML = '<span class="i16 i16_resize_grip_left" style="float:none;" />';
          footer.select('.gb_footer_right_resize')[0].innerHTML = '<span class="i16 i16_resize_grip_right" style="float:none;" />';
          this.leftResizeDragger = new GlideDraggable(footer.select('.i16_resize_grip_left')[0], footer);
          this.leftResizeDragger.setHoverCursor('sw-resize');
          this.leftResizeDragger.setDragCursor('sw-resize');
          this.leftResizeDragger.setStartFunction(function(e, dragElem, pageCoords, shift, dragCoords) {
            var dims = this._getViewportDimensions();
            var offsets = document.viewport.getScrollOffsets();
            this._currentOffset = this.getOffset();
            this._currentOffset.right = this._currentOffset.left + this.getWidth();
            this._isLeftPositioned = this.convertToRightPosition();
            this._maxWidth = this._currentOffset.right - this.options.padding.left - offsets.left;
            this._maxHeight = dims.height - this.options.padding.top - this._currentOffset.top + offsets.top;
            this.options.onBeforeResize.call(this);
          }.bind(this));
          this.leftResizeDragger.setDragFunction(function(e, dragElem, pageCoords, shift, dragCoords) {
            this.setWidth(Math.min(this._maxWidth, (this._currentOffset.right - pageCoords.x)));
            this.setHeight(Math.min(this._maxHeight, (pageCoords.y - this._currentOffset.top)));
          }.bind(this));
          this.leftResizeDragger.setEndFunction(function() {
            if (this._isLeftPositioned)
              this.convertToLeftPosition();
            this._isLeftPositioned = null;
            this.options.onAfterResize.call(this);
          }.bind(this));
          this.rightResizeDragger = new GlideDraggable(footer.select('.i16_resize_grip_right')[0], footer);
          this.rightResizeDragger.setHoverCursor('se-resize');
          this.rightResizeDragger.setDragCursor('s