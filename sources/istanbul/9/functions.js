/*! RESOURCE: /scripts/doctype/functions.js */
function isDoctype() {
  return true;
}

function gsftSubmitBack() {
  var backButton = document.getElementById('sysverb_back');
  checkDirtyForm(function save() {
    if (isDirtyFormAutosave())
      gsftSubmit(backButton);
    else
      gsftSubmit(null, $j(backButton).closest('form')[0], 'sysverb_check_save');
  }, function discard() {
    gsftSubmit(backButton);
  });
}

function gsftSubmit(control, form, action_name) {
  var f;
  if (typeof form == "undefined") {
    f = findParentByTag(control, 'form');
    if (typeof form == "undefined") {
      var sectionFormId = $("section_form_id");
      if (sectionFormId)
        f = $(sectionFormId.value);
    }
  } else
    f = form;
  if (g_submitted)
    return false;
  if (typeof action_name == "undefined" && control)
    action_name = control.id;
  if (action_name == 'sysverb_delete') {
    if (!confirm(getMessage("Delete this record") + "?")) {
      g_submitted = false;
      return false;
    }
  }
  f.sys_action.value = action_name;
  if (typeof f.onsubmit == "function" && action_name != 'sysverb_back') {
    var rc = f.onsubmit();
    if (rc === false) {
      g_submitted = g_form.submitted = false;
      return false;
    }
  }
  if (control && control.getAttribute('gsft_id')) {
    action_name = control.getAttribute('gsft_id');
    f.sys_action.value = action_name;
  }
  if (action_name == 'sysverb_back')
    g_submitted = false;
  else
    g_submitted = true;
  if (typeof g_form != 'undefined' && g_form && g_submitted)
    g_form.enableUIPolicyFields();
  CustomEvent.fire("glide:form_submitted");
  try {
    GlideAjax.disableSessionMessages();
    f.submit();
  } catch (ex) {
    GlideAjax.enableSessionMessages();
    if (ex.message.indexOf('Unspecified') == -1)
      throw ex;
  }
  return false;
}

function setCheckBox(box) {
  var name = box.name;
  var id = name.substring(3);
  var frm = box.form;
  if (frm)
    frm[id].value = box.checked;
  else {
    var widget = $(id);
    if (widget)
      widget.value = box.checked;
  }
  if (box['onchange'])
    box.onchange();
}

function populateParmQuery(form, prefix, defaultNULL, action) {
  var keys = ['No records selected', 'Delete the selected item?', 'Delete these', 'items?'];
  var msgs = getMessages(keys);
  var keyset = getChecked(form);
  if (!action)
    action = form.sys_action.value;
  if (action.indexOf("sysverb") != 0) {
    if (keyset == '') {
      if (!alert(msgs["No records selected"]))
        return false;
    } else {
      if (action == "delete_checked") {
        var items = keyset.split(",");
        if (items.length == 1) {
          if (!confirm(msgs["Delete the selected item?"]))
            return false;
        } else if (items.length > 0) {
          if (!confirm(msgs["Delete these"] + " " + items.length + " " + msgs["items?"]))
            return false;
        }
      }
    }
  } else if (form.sys_action.value == "sysverb_new") {
    addInput(form, 'HIDDEN', 'sys_id', '-1');
  }
  if (keyset == '' && defaultNULL)
    keyset = defaultNULL;
  if (prefix)
    keyset = prefix + keyset;
  addInput(form, 'HIDDEN', 'sysparm_checked_items', keyset);
  return true;
}

function getChecked(form) {
  var keyset = '';
  var lookup = form;
  for (i = 0; i < lookup.elements.length; i++) {
    if (lookup.elements[i].type != "checkbox")
      continue;
    var v = lookup.elements[i];
    if (v.checked) {
      var id = v.id.substring(3);
      var skip = v.name.substring(0, 4);
      if (skip == "SKIP")
        continue;
      if (id == "all")
        continue;
      if (keyset == '')
        keyset = id;
      else
        keyset = keyset + ',' + id;
    }
  }
  return keyset;
}

function iterateList(e, row, value, update) {
  update = (typeof update === 'undefined') ? true : update;
  if (update)
    g_form.setMandatoryOnlyIfModified(true);
  var form = g_form.getFormElement();
  form.sys_action.value = value;
  var query = e.getAttribute("query");
  addInput(form, 'HIDDEN', 'sys_record_row', row);
  addInput(form, 'HIDDEN', 'sys_record_list', query);
  if (update && typeof form.onsubmit == "function") {
    var rc = form.onsubmit();
    if (!rc) {
      g_submitted = false;
      return false;
    }
  }
  try {
    form.submit();
  } catch (ex) {
    if (ex.message.indexOf('Unspecified') == -1)
      throw ex;
  }
  return false;
}

function refreshNav() {
  CustomEvent.fireTop('navigator.refresh');
}

function checkSave(tableName, urlBase, idField, refKey) {
  var sysid = document.getElementsByName(idField)[0].value;
  checkSaveID(tableName, urlBase, sysid, refKey);
}

function checkSaveID(tableName, urlBase, sysid, refKey) {
  sysid = trim(sysid);
  var url = urlBase + "?sys_id=" + sysid;
  if (refKey)
    url += "&sysparm_refkey=" + refKey;
  var view = $('sysparm_view');
  if (view != null) {
    view = view.value;
    if (view != '')
      url += "&sysparm_view=" + view;
  }
  var nameOfStack = $('sysparm_nameofstack');
  if (nameOfStack != null) {
    nameOfStack = nameOfStack.value;
    if (nameOfStack != '')
      url += "&sysparm_nameofstack=" + nameOfStack;
  }
  if (typeof GlideTransactionScope != 'undefined') {
    GlideTransactionScope.appendTransactionScope(function(name, value) {
      url += "&" + name + "=" + value;
    });
  }
  return checkSaveURL(tableName, url);
}

function isDirtyFormAutosave() {
  return !window.g_form_dirty_support || window.g_form_dirty_autosave || !window.g_form || !g_form.modified;
}

function checkDirtyForm(successCallback, discardCallback) {
  if (isDirtyFormAutosave()) {
    successCallback();
    return;
  }
  var gm = new GlideModal();
  gm.setSize(200);
  gm.setTitle(getMessage('Save changes'));
  var content = $j(new XMLTemplate('dirty_form_modal').evaluate({
    displayValue: g_form.getDisplayValue()
  }));
  content.on('click', 'button', function(evt) {
    var button = evt.target;
    if (button.getAttribute('data-action') == 'discard') {
      g_form.modified = false;
      discardCallback();
    } else if (button.getAttribute('data-action') == 'save') {
      successCallback();
    }
  });
  gm.renderWithContent(content);
}

function checkSaveURL(tableName, url) {
  checkDirtyForm(function save() {
    saveAndRedirect(tableName, url);
  }, function discard() {
    g_navigation.open(url);
  });
}

function saveAndRedirect(tableName, url) {
  if (g_submitted)
    return false;
  var f = document.getElementById(tableName + ".do");
  if (g_form.getTableName() == tableName) {
    var fs = document.forms;
    for (var z = 0; z < fs.length; z++) {
      if (typeof fs[z].sys_uniqueValue != 'undefined') {
        f = fs[z];
        break;
      }
    }
  }
  if (!g_form.isNewRecord())
    g_form.setMandatoryOnlyIfModified(true);
  f.sys_action.value = 'sysverb_check_save';
  addInput(f, 'HIDDEN', 'sysparm_goto_url', url);
  if (typeof f.onsubmit == "function") {
    var rc = f.onsubmit();
    if (!rc) {
      g_submitted = false;
      return false;
    }
  }
  g_submitted = true;
  if (typeof g_form != 'undefined' && g_form)
    g_form.enableUIPolicyFields();
  f.submit();
  return false;
}

function submitTextSearch(event, tableName) {
  if (event != true && event.keyCode != 13)
    return;
  var form = getControlForm(tableName);
  addHidden(form, 'sysverb_textsearch', form['sys_searchtext'].value);
  addHidden(form, 'sysparm_query', '');
  addHidden(form, 'sysparm_referring_url', '');
  form.submit();
}

function getControlForm(name) {
  var form = document.forms[name + '_control'];
  if (isSafari || isChrome) {
    if (form) {
      var collectionType = form.toString();
      if (collectionType != "[object HTMLFormElement]")
        form = form[0];
    }
  }
  return form;
}

function getFormForList(listId) {
  return $(listId + "_control");
}

function getFormForElement(element) {
  var f = element.form;
  if (f)
    return f;
  return findParentByTag(element, "form");
}

function hideReveal(sectionName, imagePrefix, snap) {
  var el = $(sectionName);
  if (!el)
    return;
  var $s = $j('#section-' + sectionName);
  if ($s.length == 0)
    return _hideRevealDirect(sectionName, imagePrefix, snap);
  var $b = $j(".section-content", $s);
  if ($s.hasClass("state-closed"))
    $b.show("medium");
  else
    $b.hide("medium");
  $s.toggleClass('state-closed');
  setPreference("collapse.section." + sectionName, $s.hasClass('state-closed') ? "true" : "false");
}

function _hideRevealDirect(sectionName, imagePrefix, snap) {
  var el = $(sectionName);
  if (!el)
    return;
  var img = $("img." + sectionName);
  var imageName = "section";
  if (imagePrefix)
    imageName = imagePrefix;
  if (el.style.display == "block") {
    hide(el);
    if (img) {
      img.src = "images/" + imageName + "_hide.gifx";
      img.alt = getMessage("Display / Hide");
    }
  } else {
    show(el);
    if (img) {
      img.src = "images/" + imageName + "_reveal.gifx";
      img.alt = getMessage("Display / Hide");
    }
  }
}

function hideRevealWithTitle(name, hideMsg, showMsg) {
  var el = $(name);
  if (!el)
    return;
  var img = $("img." + name);
  if (el.style.display == "block") {
    el.style.display = "none";
    img.src = "images/section_hide.gifx"
    img.title = showMsg;
    img.alt = showMsg;
  } else {
    el.style.display = "block";
    img.src = "images/section_reveal.gifx"
    img.title = hideMsg;
    img.alt = hideMsg;
  }
}

function forceHideWithTitle(name, msg) {
  var el = $(name);
  if (!el)
    return;
  var img = $("img." + name);
  el.style.display = "none";
  img.src = "images/section_hide.gifx"
  img.title = msg;
  img.alt = msg;
}

function forceHide(sectionName) {
  var el = $(sectionName);
  if (!el)
    return;
  var img = $("img." + sectionName);
  el.style.display = "none";
  img.src = "images/s