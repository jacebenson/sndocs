/*! RESOURCE: /scripts/functions_attachments.js */
function addAttachmentNameToForm(sysid, name, hoverText, image, showRename, showView, showPopup) {
  var modified = $("attachments_modified");
  if (modified)
    modified.value = "true";
  showObjectInline($("header_attachment_list_label"));
  var line = $("header_attachment_line");
  if (line)
    line.setStyle({
      visibility: 'visible',
      display: ''
    });
  var span = $(cel('span'));
  span.id = "attachment_" + sysid;
  span.style.marginRight = "10px";
  span.innerHTML = '<a href="sys_attachment.do?sys_id=' + sysid + '" title="' + hoverText + '" style="margin-right:4px;"><img src="' + image + '" alt="" /></a>';
  var txt = $(cel('a'));
  if ('innerText' in txt)
    txt.innerText = name;
  else
    txt.textContent = name;
  txt.href = '#';
  txt.onkeydown = function(event) {
    return allowInPlaceEditModification(txt, event);
  };
  getMessage("Download {0}", function(msg) {
    txt.setAttribute("aria-label", new GwtMessage().format(msg, name));
  });
  txt.href = 'sys_attachment.do?sys_id=' + sysid;
  txt.setAttribute('data-id', sysid);
  txt.style.display = 'inline';
  txt.inPlaceEdit({
    selectOnStart: true,
    turnClickEditingOff: true,
    onBeforeEdit: function() {
      txt.lastAriaLabel = txt.getAttribute("aria-label");
      txt.removeAttribute("aria-label");
      txt.setAttribute("role", "textbox");
    },
    onEditCancelled: function() {
      txt.removeAttribute("role");
      if (txt.lastAriaLabel) {
        txt.setAttribute("aria-label", txt.lastAriaLabel);
      }
    },
    onAfterEdit: function(newName) {
      var oldName = this.oldValue;
      var ga = new GlideAjax('AttachmentAjax');
      ga.addParam('sysparm_type', 'initialRename');
      ga.addParam('sysparm_value', sysid);
      ga.addParam('sysparm_name', newName);
      ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer !== '0')
          alert(new GwtMessage().getMessage("Renaming attachment {0} to new name {1} is not allowed", oldName, newName));
        $$('a[data-id="' + sysid + '"]').each(function(elem) {
          if ('innerText' in elem)
            elem.innerText = (answer === '0') ? newName : oldName;
          else
            elem.textContent = (answer === '0') ? newName : oldName;
        });
        updateAriaLabels(sysid, newName);
      });
      txt.removeAttribute("role");
    }
  });
  txt.style.marginRight = "5px";
  span.appendChild(txt);
  if (showRename == 'true') {
    var renameAttachment = $(cel('a'));
    renameAttachment.className = 'attachment rename_' + sysid;
    renameAttachment.href = "#";
    renameAttachment.setAttribute("role", "button");
    getMessage("Rename {0}", function(msg) {
      renameAttachment.setAttribute("aria-label", new GwtMessage().format(msg, name));
    });
    renameAttachment.onclick = function() {
      txt.beginEdit();
    };
    renameAttachment.innerHTML = getMessage('[rename]');
    span.appendChild(renameAttachment);
  }
  if (showView == "true") {
    var blank = document.createTextNode(" ");
    span.appendChild(blank);
    var view = cel("a");
    view.href = "#";
    getMessage("View {0}", function(msg) {
      view.setAttribute("aria-label", new GwtMessage().format(msg, name));
    });
    var newText = document.createTextNode(getMessage('[view]'));
    view.appendChild(newText);
    view.className = "attachment view_" + sysid;
    if (showPopup == "false")
      view.href = "sys_attachment.do?sys_id=" + sysid + "&view=true";
    else
      view.onclick = function() {
        tearOffAttachment(sysid)
      };
    span.appendChild(view);
    span.appendChild(blank);
  }
  var storage = cel('li');
  storage.className = 'attachment_list_items';
  storage.appendChild(span);
  var attachList = $("header_attachment_list");
  if (attachList)
    attachList.appendChild(storage);
  var header_attachment = $('header_attachment');
  if (header_attachment) {
    _frameChanged();
  }
  var ga = new GlideAjax('AttachmentAjax');
  ga.addParam('sysparm_type', 'attachmentParentSysId');
  ga.addParam('sysparm_value', sysid);
  ga.getXMLAnswer(changeCount, null, 'increase');
  addEllipsesToAttachments();
}

function updateAriaLabels(sysid, newName) {
  getMessage(["Download {0}", "View {0}", "Rename {0}"], function(msg) {
    var newDownloadText = new GwtMessage().format(msg["Download {0}"], newName);
    var newViewText = new GwtMessage().format(msg["View {0}"], newName);
    var newRenameText = new GwtMessage().format(msg["Rename {0}"], newName);
    $$('a[data-id="' + sysid + '"]').each(function(elem) {
      elem.setAttribute("aria-label", newDownloadText);
    })
    $$('.view_' + sysid).each(function(elem) {
      elem.setAttribute("aria-label", newViewText);
    })
    $$('.rename_' + sysid).each(function(elem) {
      elem.setAttribute("aria-label", newRenameText);
    })
  });
}

function addEllipsesToAttachments() {
  var list = document.getElementById('header_attachment_list');
  if (!list)
    return;
  var more = document.getElementById('more_attachments');
  if (list.scrollHeight > list.clientHeight * 2)
    setElementStyle(more, 'display:block');
  else
    setElementStyle(more, 'display:none');
}

function setElementStyle(elm, rules) {
  window.requestAnimationFrame(function() {
    elm.style.cssText = rules;
  });
}

function addAttachmentNameToDialog(id, fileName, canDelete, createdBy, createdOn, contentType, iconPath) {
  if ($('attachment') == null)
    return;
  var encryptCheck = gel("encrypt_checkbox");
  if (encryptCheck) {
    encryptCheck.checked = false;
    $('sysparm_encryption_context').value = "";
  }
  gel("please_wait").style.display = "none";
  if (typeof id == "undefined")
    return;
  var noAttachments = gel("no_attachments");
  if (noAttachments.style.display == "block")
    noAttachments.style.display = "none";
  var table = gel("attachment_table_body");
  var tr = cel("tr");
  var td = cel("td");
  td.style.whiteSpace = "nowrap";
  td.colspan = "2";
  if (canDelete) {
    var input = cel("input");
    var checkId = "sys_id_" + id;
    input.name = checkId;
    input.id = checkId;
    input.type = "checkbox";
    input.onclick = function() {
      setRemoveButton(gel(checkId));
    };
    td.appendChild(input);
    gel("delete_button_span").style.display = "inline";
    var text = document.createTextNode(" ");
    td.appendChild(text);
    input = cel("input");
    input.type = "hidden";
    input.name = "Name";
    input.value = "false";
    td.appendChild(input);
  }
  var anchor = cel("a");
  anchor.style.marginRight = "4px";
  anchor.href = "sys_attachment.do?sys_id=" + id;
  anchor.title = " " + createdBy + "  " + createdOn;
  var imgSrc = iconPath;
  var img = cel("img");
  img.src = imgSrc;
  img.alt = anchor.title;
  anchor.appendChild(img);
  var text = $(cel('a'));
  text.style.display = "inline";
  getMessage("Download {0}", function(msg) {
    text.setAttribute("aria-label", new GwtMessage().format(msg, fileName));
  });
  text.href = '#';
  text.href = "sys_attachment.do?sys_id=" + id;
  text.onkeydown = function(event) {
    return allowInPlaceEditModification(text, event);
  };
  text.style.marginRight = "5px";
  text.style.maxWidth = "75%";
  text.style.display = "inline-block";
  text.style.overflow = "hidden";
  text.style.verticalAlign = "middle";
  if ('innerText' in text)
    text.innerText = fileName;
  else
    text.textContent = fileName;
  text.setAttribute("data-id", id);
  text.inPlaceEdit({
    selectOnStart: true,
    turnClickEditingOff: true,
    onBeforeEdit: function() {
      text.lastAriaLabel = txt.getAttribute("aria-label");
      text.removeAttribute("aria-label");
      text.setAttribute("role", "textbox");
    },
    onEditCancelled: function() {
      text.removeAttribute("role");
      if (text.lastAriaLabel) {
        text.setAttribute("aria-label", txt.lastAriaLabel);
      }
    },
    onAfterEdit: function(newName) {
      var ga = new GlideAjax('AttachmentAjax');
      ga.addParam('sysparm_type', 'rename');
      ga.addParam('sysparm_value', id);
      ga.addParam('sysparm_name', newName);
      ga.getXML();
      $$('a[data-id="' + id + '"]').each(function(elem) {
        if ('innerText' in elem)
          elem.innerText = newName;
        else
          elem.textContent = newName;
      });
      $$('span[data-id="' + id + '"]').each(function(el) {
        if ('innerText' in el)
          el.innerText = newName;
        else
          el.textContent = newName;
      });
      updateAriaLabels(id, newname);
      txt.removeAttribute("role");
    }
  });
  if (contentType == "text/html")
    anchor.target = "_blank";
  td.appendChild(anchor);
  td.appendChild(text);
  if ($('ni.show_rename_link').value) {
    var renameAttachment = $(cel('a'));
    renameAttachment.className = 'attachment';
    renameAttachment.href = '#';
    renameAttachment.setAttribute("role", "button");
    getMessage("Rename {0}", function(msg) {
      renameAttachment.setAttribute("aria-label", new GwtMessage().format(msg, fileName));
    })
    renameAttachment.onclick = function() {
      text.beginEdit();
    };
    renameAttachment.innerHTML = getMessage('[rename]');
    td.appendChild(renameAttachment);
  }
  var showView = gel("ni.show_attachment_view").value;
  if (showView == "true") {
    var blank = document.createTextNode(" ");
    tr.appendChild(blank);
    var view = cel("a");
    href = "#";
    getMessage("View {0}", function(msg) {
      view.setAttribute("aria-label", new GwtMessage().format(msg, fileName));
    })
    var newText = document.createTextNode(getMessage("[view]"));
    view.appendChild(newText);
    view.className = "attachment";
    if (showPopup == "false")
      view.href = "sys_attachment.do?sys_id=" + id + "&view=true";
    else
      view.onclick = function() {
        tearOffAttachment(id)
      };
    td.appendChild(blank);
    td.appendChild(view);
  }
  var showPopup = gel("ni.show_attachment_popup").value;
  tr.appendChild(td);
  table.appendChild(tr);
  var alert508 = "$[GlideAccessibility.isEnabled()]";
  if (alert508 == 'true')
    alert(fileName + " " + anchor.title);
}

function computeAttachmentWidth() {
  var temp = $('header_attachment_list').select('li');
  var totalWidth = 0;
  for (var i = 0; i < temp.length; i++) {
    totalWidth += temp[i].getWidth();
  }
  return totalWidth;
}

function updateAttachmentCount(sysid) {
  var ga = new GlideAjax('AttachmentAjax');
  ga.addParam('sysparm_type', 'attachmentCount');
  ga.addParam('sysparm_value', sysid);
  ga.getXMLAnswer(numberOfAttachments, null, sysid);
}

function numberOfAttachments(answer, sysid) {
  var number = parseInt(answer);
  var buttons = $$('.attachmentNumber_' + sysid);
  if (buttons[0] == undefined)
    $('header_attachment_list_label').down().innerHTML = number;
  else {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].innerHTML = number;
    }
  }
}

function getCurrentAttachmentNumber(sysid) {
  if ($$('.attachmentNumber_' + sysid)[0] == undefined) {
    if ($('header_attachment_list_label') == undefined)
      return undefined;
    else
      return $('header_attachment_list_label').down().innerHTML;
  }
  return $$('.attachmentNumber_' + sysid)[0].innerHTML;
}

function updateAttachmentCount2(number, sysid) {
  var buttons = $$('.attachmentNumber_' + sysid);
  if (buttons[0] == undefined)
    $('header_attachment_list_label').down().innerHTML = number;
  else {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].innerHTML = number;
    }
  }
}

function changeCount(sysid, type) {
  var number = getCurrentAttachmentNumber(sysid);
  if (number != undefined) {
    if (type == 'increase')
      number++;
    else
      number--;
    updateAttachmentCount2(number, sysid);
  }
}

function deleteAttachment(sysid) {
  var gr = new GlideRecord('sys_attachment');
  var parentRecord = recordAttachmentBelongsTo(sysid);
  gr.addQuery('sys_id', sysid);
  gr.query();
  if (gr.next()) {
    if (confirmDeletion(gr.file_name, sysid)) {
      var ol = GlideOverlay.get('attachment_manager_overlay');
      alert(ol._box.select('div[data-id="' + sysid + '"]')[0].up().up().inspect());
      ol._box.select('div[data-id="' + sysid + '"]')[0].up().up().remove();
      ol.autoDimension();
      $("attachment_" + sysid).remove();
      if (numberOfAttachments(gr.table_sys_id) == 1) {
        hideObject($("header_attachment_list_label"));
        var line = $("header_attachment_line");
        if (line) {
          line.setStyle({
            visibility: "hidden",
            display: "none"
          });
        }
        $("header_attachment").style.height = "auto";
        ol.close();
      }
      gr.deleteRecord();
      updateAttachmentCount(parentRecord);
    }
  }
}

function saveAttachment(tableName, sys_id, allowAttachment) {
  var g_dialog = new GlideModal('attachment', false, 500);
  g_dialog.setTitle(getMessage('Attachments'));
  g_dialog.setPreference('target_table', tableName);
  g_dialog.setPreference('target_sys_id', sys_id);
  g_dialog.setPreference('focusTrap', true);
  if (allowAttachment)
    g_dialog.setPreference('sc_override', 'true');
  g_dialog.setPreference('attachment_disabled',
    (window["AttachmentUploader"] ? AttachmentUploader.isAttachmentDisabled() : "false"));
  g_dialog.setPreference('focusTrap', true);
  g_dialog.on("closeconfirm", _saveAttachmentConfirm);
  g_dialog.render();
}

function _saveAttachmentConfirm(dialog) {
  var attachmentRows = $$('.attachmentRow');
  var value = '';
  for (var i = 0; i < attachmentRows.length; i++) {
    if (isMSIE) {
      var files = attachmentRows[i].select('input')[0].getValue();
      if (!files.empty())
        value += files + "\n";
    } else {
      var files = attachmentRows[i].select('input')[0].files;
      for (var j = 0; j < files.length; j++) {
        if (files[j] != null) {
          value += files[j].name + "\n";
        }
      }
    }
  }
  if (!value.empty())
    if (!confirm(getMessage("Close before uploading attachments?") + "\n" + value.substring(0, value.length - 1)))
      return false;
  _saveAttachmentClose();
  return true;
}

function _saveAttachmentClose() {
  var modified = $("attachments_modified");
  if (modified) {
    var attachmentsModified = modified.value;
    if (attachmentsModified != "true")
      return;
  }
  if (typeof g_form == "undefined")
    return;
  if (g_form.newRecord)
    g_form.modified = true;
  if (typeof GlideLists2 == "undefined")
    return;
  for (var id in GlideLists2) {
    var list = GlideLists2[id];
    if (list.getTableName() === 'sys_attachment')
      list.refresh();
  }
}

function allowInPlaceEditModification(elem, event) {
  var length = (elem.textContent != null) ? elem.textContent.length : elem.innerText.length;
  var max_length = maximumCharacterLimit();
  if (length >= max_length) {
    var keyCode = (event) ? event.keyCode : window.event.keyCode;
    switch (keyCode) {
      case Event.KEY_LEFT:
      case Event.KEY_RIGHT:
      case Event.KEY_UP:
      case Event.KEY_DOWN:
      case Event.KEY_BACKSPACE:
      case Event.KEY_DELETE:
        return true;
      default:
        var key = "Filename has reached the character limit of {0}";
        var gMessage = new GwtMessage();
        gMessage.fetch([key], function(msgs) {
          var msg = gMessage.format(msgs[key], max_length);
          alert(msg);
        });
        return false;
    }
  }
  return true;
}

function maximumCharacterLimit() {
  var f = $('header_attachment_list');
  if (f)
    return f.getAttribute('data-max-filename-length');
  return 100;
}

function confirmDeletion(file_name, sysid) {
  var r = confirm("Are you sure you want to delete " +
    file_name +
    "?");
  return r;
}

function saveFileAttachment(tableName, gotourl) {
  var form = document.forms[tableName + '.do'];
  var viewwidget = form['sysparm_view'];
  if (viewwidget)
    gotourl += '&sysparm_view=' + viewwidget.value;
  form.sys_action.value = 'sysverb_check_save';
  addInput(form, 'HIDDEN', 'sysparm_goto_url', gotourl);
  var okToSubmit = true;
  if (typeof form.onsubmit == "function")
    okToSubmit = form.onsubmit();
  if (okToSubmit)
    form.submit();
  return false;
}

function deleteFileAttachment(attachment_id, replacement) {
  var ajax = new GlideAjax("AttachmentAjax");
  ajax.addParam("sysparm_value", attachment_id);
  ajax.addParam("sysparm_type", "delete");
  ajax.getXML(doNothing);
  var attachment = $(attachment_id);
  if (attachment) {
    attachment.src = "attachments/s.gif";
    attachment.alt = "";
  }
  var delspan = $(attachment_id + "_delete");
  if (delspan)
    delspan.innerHTML = '';
  var addanchor = $(attachment_id + "_update");
  if (addanchor)
    addanchor.innerHTML = "";
  var attachmentspan = $(attachment_id + "_attachment");
  if (attachmentspan)
    attachmentspan.innerHTML = "";
  var noattachmentspan = $(attachment_id + "_noattachment");
  if (noattachmentspan)
    noattachmentspan.style.visibility = "";
  return false;
};