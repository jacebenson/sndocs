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
  if (parentF