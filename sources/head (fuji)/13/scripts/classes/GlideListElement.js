/*! RESOURCE: /scripts/classes/GlideListElement.js */
var GlideListElement = Class.create({
  initialize: function(name, table) {
    this.name = name;
    this.table = table;
  },
  setValue: function(newValue, newDisplayValue) {
    var isArbitraryEmail = false;
    var hiddenElement = gel(this.name);
    var visibleElement = gel("select_0" + this.name);
    this.visibleElementId = visibleElement.id;
    hiddenElement.value = "";
    visibleElement.options.length = 0;
    if (newValue || newDisplayValue) {
      if (typeof newValue == "string" && newValue != "") {
        newValue = newValue.split(",");
        if (typeof newDisplayValue == "undefined" || newDisplayValue == "")
          isArbitraryEmail = true;
      }
      if (typeof newDisplayValue == "string" && newDisplayValue != "")
        this._setValue(newValue, newDisplayValue);
      else {
        var allEmail = true;
        if (typeof newDisplayValue == "undefined" || newDisplayValue == "") {
          for (var i = 0; i < newValue.length; i++) {
            var item = newValue[i];
            if (item.length == 32)
              if (item.indexOf("@") == -1) {
                allEmail = false;
                break;
              }
          }
          if (!allEmail) {
            hiddenElement.value = newValue.join();
            var ajaxArgs = this.table + "," + newValue.join();
            var aj = new GlideAjax("ElementGlideListAjax");
            aj.addParam("sysparm_type", "getDisplayValues");
            aj.addParam("sysparm_value", ajaxArgs);
            aj.getXML(this._glideListGetDisplayValuesDone.bind(this));
            return;
          }
        } else
          allEmail = false;
        if (typeof newDisplayValue != "undefined" && newValue.length > 0 && newDisplayValue.length != newValue.length) {
          jslog("Error: Length of first and second parameter arrays to setValue for " + this.name + " are not the same");
          return;
        }
        if (typeof newDisplayValue != "undefined") {
          for (i = 0; i < newDisplayValue.length; i++) {
            if (allEmail)
              this._setValue("", newValue[i]);
            else
              this._setValue(newValue[i], newDisplayValue[i]);
          }
        } else if (allEmail && isArbitraryEmail) {
          for (var i = 0; i < newValue.length; i++) {
            this._setValue(newValue[i], newValue[i]);
          }
        } else
          this._setValue("", newValue);
      }
    }
    this._updateDisplay();
  },
  _setValue: function(newValue, displayValue) {
    if (!newValue)
      addGlideListChoice(this.visibleElementId, displayValue, displayValue, false);
    else
      addGlideListChoice(this.visibleElementId, newValue, displayValue, false);
  },
  _glideListGetDisplayValuesDone: function(response, args) {
    if (!response || !response.responseXML)
      return;
    var hiddenElement = gel(this.name);
    hiddenElement.values = "";
    var references = response.responseXML.getElementsByTagName("reference");
    for (var i = 0; i < references.length; i++) {
      var displayValue = references[i].attributes.getNamedItem("display").nodeValue;
      var referenceValue = references[i].attributes.getNamedItem("sys_id").nodeValue;
      this._setValue(referenceValue, displayValue);
    }
    this._updateDisplay();
  },
  _showSpacer: function(display) {
    var spacer = gel("make_spacing_ok_" + this.name);
    if (spacer)
      spacer.style.display = "inline";
  },
  _updateDisplay: function() {
    toggleGlideListIcons(this.name);
    var lockImg = gel(this.name + "_lock");
    if (lockImg && lockImg.style.display == "none")
      lock(lockImg, this.name, this.name + '_edit', this.name + '_nonedit', 'select_0' + this.name, this.name + '_nonedit')
  },
  setReadOnly: function(disabled) {
    var element = gel(this.name + "_unlock");
    if (!element)
      return;
    if (disabled) {
      lock(element, this.name, this.name + '_edit', this.name + '_nonedit', 'select_0' + this.name, this.name + '_nonedit');
      this._showSpacer();
      hideObject(element);
      var addMe = $("add_me_locked." + this.name)
      if (addMe)
        addMe.hide();
    } else {
      showObjectInlineBlock(element);
      toggleAddMe(this.name);
    }
  },
  isDisabled: function() {
    var unlockElement = $(this.name + "_unlock");
    if (unlockElement.style.visibility == "visible")
      return false;
    return true;
  }
});

function viewSelection(sourceSelect, tableName, urlBase, idField, clickThroughPopup, popupView) {
  var sysid = glideListGetSelected(sourceSelect);
  if (clickThroughPopup && window.g_form) {
    var refTable = urlBase.substring(0, urlBase.lastIndexOf('.do'));
    var view = popupView || g_form.getViewName();
    tearOff(refTable, sysid, view, false, null);
    return;
  }
  checkSaveID(tableName, urlBase, sysid);
}

function glideListGetSelected(sourceSelect) {
  var sourceOptions = sourceSelect.options;
  var index = 0;
  var selectedId = -1;
  for (var i = 0; i < sourceSelect.length; i++) {
    option = sourceOptions[i];
    if (option.selected) {
      selectedId = i;
      if (index == 1)
        return;
      index++;
    }
  }
  if (index == 0)
    return;
  var option = sourceOptions[selectedId];
  return option.value;
}

function editList(tableName, urlBase, idField, reference) {
  g_form.setMandatoryOnlyIfModified(true);
  var form = document.forms[tableName + '.do'];
  addInput(form, "HIDDEN", "sysparm_collection", tableName);
  addInput(form, "HIDDEN", "sysparm_collection_key", idField);
  addInput(form, "HIDDEN", "sysparm_collection_related_file", reference);
  var sysid = document.getElementsByName("sys_uniqueValue")[0].value;
  sysid = trim(sysid);
  addInput(form, "HIDDEN", "sysparm_collectionID", sysid);
  var url = tableName + '.do?sys_id=' + sysid;
  var view = gel('sysparm_view');
  if (view != null) {
    view = view.value;
    if (view != '')
      url = url + "&sysparm_view=" + view;
  }
  var changeset = gel('sysparm_changeset');
  if (changeset != null) {
    changeset = changeset.value;
    if (changeset != '')
      url = url + "&sysparm_changeset=" + changeset;
  }
  var sysparm_record_row = gel('sysparm_record_row');
  if (sysparm_record_row)
    url = url + "&sysparm_record_row=" + sysparm_record_row.value;
  var sysparm_record_rows = gel('sysparm_record_rows');
  if (sysparm_record_rows)
    url = url + "&sysparm_record_rows=" + sysparm_record_rows.value;
  var sysparm_record_list = gel('sysparm_record_list');
  if (sysparm_record_list)
    url = url + "&sysparm_record_list=" + encodeURIComponent(sysparm_record_list.value);
  addInput(form, "HIDDEN", "sysparm_referring_url", url);
  getRefQualURI(tableName, "*");
  addInput(form, "HIDDEN", "sysparm_client_record", "session");
  form.sys_action.value = 'sysverb_m2ms';
  if (typeof form.onsubmit == "function") {
    var rc = form.onsubmit();
    if (!rc)
      return;
  }
  form.submit();
  return false;
}

function addGlideListChoice(selectID, value, displayValue, toggleIcons) {
  if (!value)
    return;
  var select = new Select(selectID);
  if (select.contains(value))
    return;
  select.addOption(value, displayValue);
  select = null;
  if (typeof toggleIcons == "undefined" || toggleIcons == true)
    toggleGlideListIcons(selectID.substring('select_0'.length));
}

function addEmailAddressToList(selectID, input, msg) {
  g_form.hideErrorBox(input);
  if (input.value == null || input.value == "")
    return;
  if (!isEmailValid(input.value)) {
    g_form.showErrorBox(input, msg);
    return;
  }
  addGlideListChoice(selectID, input.value, input.value);
  input.value = "";
}

function emailInputKeyPress(e, selectID, input, msg) {
  g_form.hideErrorBox(input);
  var keyCode = getKeyCode(e);
  if (keyCode != KEY_ENTER)
    return;
  Event.stop(e);
  addEmailAddressToList(selectID, input, msg);
  return false;
}

function removefieldBackgroundText(the_field, the_text, ref) {
  if (the_field.value == the_text) {
    the_field.value = "";
    var standard_field = gel("select_0" + ref);
    the_field.style.color = standard_field.style.color;
    the_field.style.fontStyle = standard_field.style.fontStyle;
  }
}

function selectFromFieldList(selectID, depTableElementID, refTables, types, title, evt) {
  if (evt)
    Event.stop(evt);
  var depElement = gel(depTableElementID);
  if (!depElement) {
    jslog("Dependent table not found for list");
    return;
  }
  var table = depElement.value;
  if (!table) {
    jslog("Dependent table not specified for list");
    return;
  }
  var gDialog = new GlideDialogWindow('field_list_selector');
  gDialog.setTitle(title);
  gDialog.setPreference('sysparm_elementID', selectID);
  gDialog.setPreference('sysparm_table', table);
  gDialog.setPreference('sysparm_ref_tables', refTables);
  gDialog.setPreference('sysparm_types', types);
  gDialog.setPreference('sysparm_prefix', '__dollar__{');
  gDialog.setPreference('sysparm_suffix', '}');
  gDialog.setPreference('set_request_params', 'true');
  gDialog.render();
  gDialog = null;
}

function addGlideListReference(fieldid) {
  var value = gel(fieldid).value;
  var displayWidget = gel('sys_display.' + fieldid);
  var display = displayWidget.value;
  displayWidget.value = '';
  addGlideListChoice('select_0' + fieldid, value, display);
}

function addGlideListFromSelect(selectID, select) {
  var option = select.options[select.selectedIndex];
  addGlideListChoice(selectID, option.value, option.value);
}

function addfieldBackgroundText(the_field, the_text) {
  if (the_field.value == "") {
    the_field.value = the_text;
    the_field.save_old_color = the_field.style.color;
    the_field.style.color = "blue";
    the_field.style.fontStyle = "italic";
  }
}

function toggleGlideListIcons(id, performOnChange) {
  var add_me = gel('add_me.' + id);
  var remove = gel('remove.' + id);
  var view2 = gel('view2.' + id);
  if (!view2)
    view2 = gel('view2link.' + id);
  var select = gel('select_0' + id);
  var options = select.options;
  var selCnt = 0;
  var isMe = false;
  for (var i = 0; i != options.length; i++) {
    if (options[i].selected)
      selCnt++;
    if (typeof g_user !== "undefined" && options[i].value == g_user.userID)
      isMe = true;
  }
  if (view2) {
    var isEmail = false;
    if (selCnt == 1) {
      var selectValue = select.options[select.selectedIndex].value;
      if (selectValue.indexOf("@") > -1) {
        var selectText = select.options[select.selectedIndex].text;
        if (selectValue == selectText)
          isEmail = true;
      }
    }
    var view2Link = gel('view2link.' + id);
    if (selCnt == 1 && !isEmail) {
      view2.src = 'images/icons/hover_icon_small2.gifx';
      view2Link.disabled = false;
    } else {
      view2.src = 'images/icons/hover_icon_small2_off.gifx';
      view2Link.disabled = true;
    }
  }
  if (remove) {
    if (selCnt > 0)
      if (remove.tagName == "BUTTON")
        remove.disabled = false;
      else
        remove.src = 'images/delete_edit.gifx';
    else
    if (remove.tagName == "BUTTON")
      remove.disabled = true;
    else
      remove.src = 'images/delete_edit_off.gifx';
  }
  if (add_me) {
    if (!isMe)
      if (add_me.tagName == "BUTTON")
        add_me.disabled = false;
      else
        add_me.src = 'images/icons/user_obj.gifx';
    else
    if (add_me.tagName == "BUTTON")
      add_me.disabled = true;
    else
      add_me.src = 'images/icons/user_obj_off.gifx';
  }
  add_me = null;
  remove = null;
  view2 = null;
  options = null;
  if (typeof performOnChange != "undefined")
    if (performOnChange == false)
      return;
  glideListSaveList(id);
}

function toggleAddMe(id) {
  var add_me_locked = $('add_me_locked.' + id);
  if (!add_me_locked)
    return;
  var select = gel('select_0' + id);
  var options = select.options;
  var isMe = false;
  for (var i = 0; i != options.length; i++) {
    if (options[i].value == g_user.userID)
      isMe = true;
  }
  var unlockImg = $(id + "_unlock");
  if (isMe)
    add_me_locked.hide();
  else if (unlockImg.style.display == "none")
    add_me_locked.hide();
  else
    add_me_locked.show();
}

function glideListSaveList(id) {
  var sel0 = gel('select_0' + id);
  var distribution = gel(id);
  saveAllSelected([sel0], [distribution], ',', '\\', '--None--');
  onChange(id);
}

function glideListViewSelection(id, refParent, reference, clickThroughPopup) {
  var view2Link = gel("view2link." + id);
  if (view2Link.disabled == true)
    return false;
  var popupView = view2Link.getAttribute('data-popup-view');
  viewSelection(gel("select_0" + id), refParent, reference + ".do", id, clickThroughPopup === 'true', popupView);
}

function glideListPopupSelection(event, id, table) {
  var select = gel("select_0" + id);
  var sysid = glideListGetSelected(select);
  if (sysid)
    popRecordDiv(event, table, sysid);
}

function glideListInit(id, ref, reference) {
  var sel = gel(id);
  if (sel.form) {
    addOnSubmitEvent(sel.form, function() {
      var sel0 = gel(id)
      var distribution = gel(ref)
      saveAllSelected([sel0], [distribution], ',', '\\', '--None--');
    });
  }
  var listObject = new GlideListElement(ref, reference);
  g_form.registerHandler(ref, listObject);
  toggleAddMe(ref);
  toggleGlideListIcons(ref, false);
};