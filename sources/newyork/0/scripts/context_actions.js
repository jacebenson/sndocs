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

function exportToPDF(table, sys_id, isLandscape, sysparm_view, sysparm_domain) {
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
  var url = table + ".do?sys_id=" + sys_id + "&PDF" + "&sysparm_view=" + sysparm_view + "&related_list_filter=" + relatedListFilters + "&sysparm_domain=" + sysparm_domain;
  if (isLandscape)
    url += "&landscape=true";
  window.location = url;
}

function showList(tableName, fields, ids) {
  if (!ids)
    ids = gActiveContext.getTableName();
  self.location = tableName + "_list.do?sysparm_query=" + addQueryFilter('', fields, ids, tableName, null, true);
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

function addQueryFilter(form, names, values, table, formName, useBaseTable) {
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
      if (tableElement.type == 'glide_var') {
        vValues[0] = vValues[2];
        vValues[1] = vValues[3];
      } else {
        vValues[0] = tableElement.getTableName();
        vValues[1] = tableElement.getName();
      }
    } else {
      var tableR = new Table(vValues[0]);
      var element = tableR.getElement(vValues[1]);
      var label = '';
      if (formName && formName.indexOf("sys_documentation") == 0)
        label = getTableLabel(tableR.getName(), element.getName());
      if (label == '' && element != null)
        vValues[0] = useBaseTable === true ? element.getBaseTableName() : element.getTableName();
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