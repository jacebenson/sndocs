/*! RESOURCE: /scripts/labels.js */
var refreshRateProperty = "60";
var refreshLabelRate = (refreshRateProperty != null && refreshRateProperty > 0 ? refreshRateProperty : 60);
var refreshLabelTimer = null;
var g_label_status = initLabelStatus();
CustomEvent.observe('nav.loaded', refreshLabels);

function initLabelStatus() {
  var answer = new Object();
  answer.loading = false;
  answer.error_count = 0;
  return answer;
}

function refreshLabels() {
  var labelList = new Array();
  var divTags = document.getElementsByTagName('div');
  if (divTags) {
    for (var c = 0; c != divTags.length; ++c) {
      var divTag = divTags[c];
      var label = divTag.sclabel || divTag.getAttribute('sclabel');
      if (label && label == 'true') {
        var id = divTag.appid || divTag.getAttribute('appid');
        labelList.push(id);
      }
    }
  }
  startRefresh(labelList);
}

function clearLabelRefresh() {
  if (refreshLabelTimer == null)
    return;
  clearTimeout(refreshLabelTimer);
  refreshLabelTimer = null;
}

function startRefresh(labelRefresh) {
  clearLabelRefresh();
  if (labelRefresh.length < 1)
    return;
  if (labelsGetRequest(labelRefresh))
    refreshLabelTimer = setTimeout(refreshLabels, refreshLabelRate * 1000);
}

function labelsGetRequest(labelIds) {
  if (g_label_status.loading)
    return true;
  if (g_label_status.error_count > 3) {
    jslog('Stopped tag fetch due to excessive error counts');
    return false;
  }
  g_label_status.loading = true;
  var aj = new GlideAjax("LabelsAjax");
  aj.addParam("sysparm_value", labelIds.join(","));
  aj.addParam("sysparm_type", 'get');
  aj.getXML(labelsGetResponse);
  return true;
}

function labelsGetResponse(request) {
  g_label_status.loading = false;
  if (request.status == 200)
    g_label_status.error_count = 0;
  else
    g_label_status.error_count += 1;
  if (!request.responseXML)
    return;
  var labels = request.responseXML.getElementsByTagName("label");
  if (labels && labels.length > 0) {
    for (var i = 0; i < labels.length; i++) {
      var labelEntry = labels[i];
      updateMenuItems(labelEntry);
    }
  }
}

function updateMenuItems(labelElement) {
  var appid = labelElement.getAttribute("id");
  var divElem = gel('div.' + appid)
  var tds = divElem.getElementsByTagName("td");
  var appTD = tds[0];
  var notRead = 0;
  var span = gel(appid);
  var table = cel("table");
  var tbody = cel("tbody", table);
  var label;
  var items = labelElement.getElementsByTagName("item");
  if (items && items.length > 0) {
    for (var i = 0; i < items.length; i++) {
      label = items[i].getAttribute("label");
      var lid = items[i].getAttribute("name");
      var style = items[i].getAttribute("style");
      var read = items[i].getAttribute("read");
      if ("true" != read)
        notRead++;
      var url = items[i].getAttribute("url");
      var title = items[i].getAttribute("title");
      var image = items[i].getAttribute("image");
      createLabelMod(tbody, style, lid, url, title, image, appid);
    }
  }
  updateLabelReadCount(appTD, notRead);
  clearNodes(span)
  span.appendChild(table);
  table = null;
}

function createLabelMod(parent, style, id, url, title, image, appid) {
  var tr = cel("tr", parent);
  var scrollIcon = isTextDirectionRTL() ? "images/scroll_lft.gifx" : "images/scroll_rt.gifx";
  if (image == "images/s.gifx")
    image = scrollIcon;
  var img;
  if (image == null || image == '')
    img = '<img style="width:16px; cursor:hand" src="images/icons/remove.gifx" alt="Click me to remove the tag entry" onmouseover="this.src = \'images/closex_hover.gifx\'" onmouseout="this.src = \'images/icons/remove.gifx\'" src="images/icons/remove.gifx"/>';
  else
    img = "<img style='width:16px' src='" + image + "' alt='' />";
  var tdimg = cel("td", tr);
  tdimg.style.width = "16px";
  var tdhtml;
  if (image == scrollIcon)
    tdhtml = img;
  else
    tdhtml = '<a onclick="removeLabel(\'' + appid + '\',\'' + id + '\');" onmouseover="this.src = \'images/closex_hover.gifx\'" onmouseout="this.src = \'images/icons/remove.gifx\'" title="Click me to remove the tag entry">' + img + '</a>';
  tdimg.innerHTML = tdhtml;
  var td = cel("td", tr);
  var html = '<a class="menulabel" style="' + style + '" id= "' + id + '"';
  html += ' target="gsft_main" href="' + url + '">' + title + '</a>';
  td.innerHTML = html;
  tr = null;
  tdimg = null;
  td = null;
}

function updateLabelReadCount(appTD, notRead) {
  var inner = appTD.innerHTML;
  var term = '</H2>';
  var paren = inner.indexOf("</H2>");
  if (paren < 0) {
    paren = inner.indexOf("</h2");
    term = '</h2>';
  }
  if (paren > -1) {
    inner = inner.substring(0, paren);
    paren--;
    var c = inner.substring(paren, paren + 1);
    if (c == ')') {
      while (paren > 0 && c != '(') {
        paren--;
        c = inner.substring(paren, paren + 1)
      }
      if (paren > 0) {
        inner = inner.substring(0, paren);
      }
    }
    inner = inner.trim();
    if (notRead > 0)
      inner = inner + ' (' + notRead + ')';
    inner = inner + term;
    clearNodes(appTD);
    appTD.innerHTML = inner;
  }
}

function doAssignLabel(tableName, label, sysId) {
  var form = getFormByTableName(tableName);
  if (sysId == null || !sysId) {
    if (!populateParmQuery(form, '', 'NULL'))
      return false;
  } else {
    addInput(form, 'HIDDEN', 'sysparm_checked_items', sysId);
  }
  if (!label && typeof option != 'undefined' && option.getAttribute("gsft_base_label"))
    label = option.getAttribute("gsft_base_label");
  addInput(form, 'HIDDEN', 'sys_action', 'java:com.glide.labels.LabelActions');
  addInput(form, 'HIDDEN', 'sys_action_type', 'assign_label');
  addInput(form, 'HIDDEN', 'sysparm_label_picked', label);
  form.submit();
}

function doRemoveLabel(tableName, label, sysId) {
  var form = getFormByTableName(tableName);
  if (sysId == null || !sysId) {
    if (!populateParmQuery(form, '', 'NULL'))
      return false;
  } else {
    addInput(form, 'HIDDEN', 'sysparm_checked_items', sysId);
  }
  if (!label && typeof option != 'undefined' && option.getAttribute("gsft_base_label"))
    label = option.getAttribute("gsft_base_label");
  addInput(form, 'HIDDEN', 'sys_action', 'java:com.glide.labels.LabelActions');
  addInput(form, 'HIDDEN', 'sys_action_type', 'remove_label');
  addInput(form, 'HIDDEN', 'sysparm_label_picked', label);
  form.submit();
}

function assignLabelActionViaLookupModal(tableName, listId) {
  var list = GlideList2.get(listId);
  if (!list)
    return;
  var sysIds = list.getChecked();
  if (!sysIds)
    return;
  assignLabelViaLookup(tableName, sysIds, list.getView());
}

function assignLabelViaLookup(tableName, sysId, viewName) {
  var assignCallback = function(labelId) {
    assignLabel(labelId, tableName, sysId, viewName);
  };
  showLabelLookupWindow("Assign Tag", tableName, sysId, assignCallback);
}

function removeLabelActionViaLookupModal(tableName, listId) {
  var list = GlideList2.get(listId);
  if (!list)
    return;
  var sysIds = list.getChecked();
  if (!sysIds)
    return;
  removeLabelViaLookup(tableName, sysIds);
}

function removeLabelViaLookup(tableName, sysId) {
  var removeCallback = function(labelId) {
    removeLabelById(labelId, sysId);
  };
  showLabelLookupWindow("Remove Tag", tableName, sysId, removeCallback);
}

function showLabelLookupWindow(actionName, tableName, sysID, callback) {
  var tagLookupForm = new GlideDialogWindow("tag_lookup_form");
  tagLookupForm.setTitle(actionName);
  tagLookupForm.setPreference("sys_ids", sysID);
  tagLookupForm.setPreference("table_name", tableName);
  tagLookupForm.setPreference('on_accept', callback);
  tagLookupForm.removeCloseDecoration();
  tagLookupForm.render();
}

function newLabel(tableName, sysID, callback) {
  var isDoctype = document.documentElement.getAttribute("data-doctype") == "true";
  if (isDoctype) {
    var tagForm = new GlideDialogWindow("tag_form");
    tagForm.setTitle("");
    tagForm.setPreference("sys_ids", sysID);
    tagForm.setPreference("table_name", tableName);
    tagForm.removeCloseDecoration();
    tagForm.render();
  } else {
    var keys = ["Please enter the name for the new tag", "New tag"];
    var msgs = getMessages(keys);
    if (!callback)
      gsftPrompt(msgs["New tag"], msgs["Please enter the name for the new tag"], function(labelName) {
        newLabelRequest(tableName, labelName, sysID)
      });
    else
      gsftPrompt(msgs["New tag"], msgs["Please enter the name for the new tag"], callback);
  }
}

function newLabelRequest(tableName, labelName, sysID) {
  if (labelName == null)
    return;
  var viewName;
  var view = gel('sysparm_view');
  if (view != null)
    viewName = view.value;
  assignLabel(labelName, tableName, sysID, viewName);
}

function assignLabel(labelName, tableName, sysId, viewName) {
  if (!labelName)
    return;
  var url = new GlideAjax("LabelsAjax");
  url.addParam("sysparm_name", tableName);
  url.addParam("sysparm_value", sysId);
  url.addParam("sysparm_chars", labelName);
  url.addParam("sysparm_type", "create");
  if (viewName)
    url.addParam("sysparm_view", viewName);
  url.getXML(refreshNavIfNotDoctypeUI);
}

function removeLabel(appid, labelid) {
  var aj = new GlideAjax("LabelsAjax");
  aj.addParam("sysparm_name", appid);
  aj.addParam("sysparm_value", labelid);
  aj.addParam("sysparm_type", 'delete');
  aj.getXML(removeLabelResponse);
}

function removeLabelByName(labelName, sysId) {
  var aj = new GlideAjax("LabelsAjax");
  aj.addParam("sysparm_name", labelName);
  aj.addParam("sysparm_value", sysId);
  aj.addParam("sysparm_type", 'removeByName');
  aj.getXML(refreshNavIfNotDoctypeUI);
}

function removeLabelById(labelId, sysId) {
  var aj = new GlideAjax("LabelsAjax");
  aj.addParam("sysparm_name", labelId);
  aj.addParam("sysparm_value", sysId);
  aj.addParam("sysparm_type", 'remove');
  aj.getXML(refreshNavIfNotDoctypeUI);
}

function removeLabelResponse(response, args) {
  var labelId = response.responseXML.documentElement.getAttribute("sysparm_name");
  if (!labelId)
    refreshNavIfNotDoctypeUI();
  else {
    var labelIds = new Array();
    labelIds.push(labelId);
    labelsGetRequest(labelIds);
  }
}

function newLabelPromptListAction(tableName, listId) {
  var nonDoctypeUICallback = function(labelName) {
    assignLabelToCheckedSysIds(labelName, tableName, listId)
  };
  var list = GlideList2.get(listId);
  if (!list)
    return;
  var sysIds = list.getChecked();
  if (!sysIds)
    return;
  newLabel(tableName, sysIds, nonDoctypeUICallback);
}

function assignLabelToCheckedSysIds(labelName, tableName, listId) {
  if (!labelName || labelName.strip() == '')
    return;
  var list = GlideList2.get(listId);
  if (!list)
    return;
  var sysIds = list.getChecked();
  if (!sysIds)
    return;
  assignLabel(labelName, tableName, sysIds, list.getView());
}

function removeLabelFromCheckedSysIds(labelName, listId) {
  var list = GlideList2.get(listId);
  var sysIds = list.getChecked();
  if (!sysIds)
    return;
  removeLabelByName(labelName, sysIds);
}

function getFormByTableName(tableName) {
  var form = getControlForm(tableName);
  if (!form)
    form = document.forms[tableName + '.do'];
  return form;
}

function refreshNavIfNotDoctypeUI() {
  var isDoctype = document.documentElement.getAttribute("data-doctype") == "true";
  if (!isDoctype)
    refreshNav();
};