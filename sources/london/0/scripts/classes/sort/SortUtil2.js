/*! RESOURCE: /scripts/classes/sort/SortUtil2.js */
var BodyGlideDialogWindow = Class.create(GlideDialogWindow, {
  initialize: function(id, readOnly, width, height, containerElement) {
    this.containerElement = containerElement;
    GlideDialogWindow.prototype.initialize.call(this, id, readOnly, width, height);
  },
  insert: function(element) {
    GlideDialogWindow.prototype.insert.call(this, (this.containerElement ? this.containerElement : element));
  },
  _getScrollTop: function() {
    if ($(document.body).hasClassName("section_header_body_no_scroll"))
      return 0;
    else
      return GlideWindow.prototype._getScrollTop.call();
  },
  _getScrollLeft: function() {
    if ($(document.body).hasClassName("section_header_body_no_scroll"))
      return 0;
    else
      return GlideWindow.prototype._getScrollLeft.call();
  }
});
var SortUtil = Class.create({
  processListLoad: function(sourceContainerID, targetContainerID) {
    if (isMSIE) {
      if ($(sourceContainerID).originalScrollTop) {
        setTimeout(function() {
          if ($(sourceContainerID).originalScrollTop) {
            $(sourceContainerID).scrollTop = $(sourceContainerID).originalScrollTop;
            $(sourceContainerID).originalScrollTop = null;
          }
        }, 250);
      }
      if ($(targetContainerID).originalScrollTop) {
        setTimeout(function() {
          if ($(targetContainerID).originalScrollTop) {
            $(targetContainerID).scrollTop = $(targetContainerID).originalScrollTop;
            $(targetContainerID).originalScrollTop = null;
          }
        }, 250);
      }
    } else {
      if (this.alreadySetupScolling)
        return;
      this.alreadySetupScolling = true;
      Event.observe($(sourceContainerID), 'scroll', function() {
        if ($(sourceContainerID).originalScrollTop) {
          $(sourceContainerID).scrollTop = $(sourceContainerID).originalScrollTop;
          $(sourceContainerID).originalScrollTop = null;
        }
      });
      Event.observe($(targetContainerID), 'scroll', function() {
        if ($(targetContainerID).originalScrollTop) {
          $(targetContainerID).scrollTop = $(targetContainerID).originalScrollTop;
          $(targetContainerID).originalScrollTop = null;
        }
      });
    }
  },
  getSysIDArray: function(selected, callback, suffixCallback) {
    var sysIDs = [];
    for (var i = 0; i < selected.length; i++) {
      var dr = selected[i];
      var sysID = dr.getSysID();
      if (suffixCallback)
        sysIDs[sysIDs.length] = sysID + suffixCallback(dr);
      else
        sysIDs[sysIDs.length] = sysID;
      callback(dr.dr.getElem(), sysID);
    }
    return sysIDs;
  },
  getSelectedOrdered: function(selected) {
    var newSelected = [];
    var maxIndex = -1;
    for (var i = 0; i < selected.length; i++) {
      var index = selected[i].dr.getElem().previousSiblings().length;
      if (index > maxIndex)
        maxIndex = index;
      newSelected[index] = selected[i];
    }
    if (maxIndex > -1) {
      selected = [];
      for (var i = 0; i < maxIndex + 1; i++)
        if (newSelected[i])
          selected[selected.length] = newSelected[i];
    }
    return selected;
  },
  commitChanges: function(sysIDs, targetSysID, targetInsertLocation, callback, sysParms, sourceContainerID, targetContainerID, errorCallback) {
    if (!sysParms)
      return;
    var sysIDsCSV = "";
    for (var i = 0; i < sysIDs.length; i++)
      if (i > 0)
        sysIDsCSV += ("," + sysIDs[i]);
      else
        sysIDsCSV += sysIDs[i];
    var ga = new GlideAjax('AjaxSortUpdateHandler');
    ga.addParam('sysparm_name', 'updateItems');
    ga.addParam('sysparm_ids', sysIDsCSV);
    ga.addParam('sysparm_target_id', targetSysID);
    ga.addParam('sysparm_target_insert_location', targetInsertLocation);
    ga.setErrorCallback(errorCallback);
    for (var key in sysParms)
      ga.addParam(key, sysParms[key]);
    ga.getXML(function(res) {
      $(sourceContainerID).originalScrollTop = $(sourceContainerID).scrollTop;
      $(targetContainerID).originalScrollTop = $(targetContainerID).scrollTop;
      callback();
    });
  },
  createPopupHandlers: function(elem, tableName, getIDCallback) {
    elem.on('mousedown', '.list_popup', function(ev, el) {
      ev.stop();
    });
    elem.on('click', '.list_popup', function(ev, el) {
      ev.stop();
    });
    elem.on('mouseover', '.list_popup', function(ev, el) {
      var record_class = el.up("tr").getAttribute("record_class");
      var sys_id = el.up("tr").getAttribute("sys_id");
      var id = el.up(".list_row").getAttribute("id");
      if (!getIDCallback || id.endsWith("_temp"))
        popListDiv(ev, tableName, sys_id, 'default');
      else if (getIDCallback)
        popListDiv(ev, tableName, getIDCallback(sys_id), 'default');
      if (isMSIE && getFormContentParent() != document.body) {
        var handler;
        handler = function() {
          var pop = $(nowapi.g_popup_manager.POPUP_PREFIX + sys_id + "POPPER");
          var shim = $(nowapi.g_popup_manager.POPUP_PREFIX + sys_id + "POPPERSHIM");
          if (pop) {
            CustomEvent.un('frame.resized', handler);
            var pos = getViewableArea().getTopLeft();
            var bounds = BoundsUtil.getInstance().getElemBounds(el);
            var x = bounds.left + pos.x + 15;
            var y = bounds.top + pos.y + 15;
            if (shim) {
              shim.parentNode.removeChild(shim);
              document.body.appendChild(shim);
              shim.style.top = y + "px";
              shim.style.left = x + "px";
            }
            pop.parentNode.removeChild(pop);
            document.body.appendChild(pop);
            pop.style.top = y + "px";
            pop.style.left = x + "px";
          }
        }
        CustomEvent.observe('frame.resized', handler);
      }
      ev.stop();
    });
    elem.on('mouseout', '.list_popup', function(ev, el) {
      lockPopup(ev);
      ev.stop();
    });
  },
  prepareList: function(containerID, ignoreID, formDetails, tableName, getIDCallback) {
    var thisUtil = this;
    var formDialogDef;
    if (formDetails)
      formDialogDef = new FormDialogDefinition(null, formDetails.table, formDetails.container, formDetails.view, "false").setCloseCallback(formDetails.callback).setOpenCallback(formDetails.openCallback);
    if (tableName)
      thisUtil.createPopupHandlers($(containerID), tableName, getIDCallback);
    $(containerID).select(".list_popup").each(function(elem) {
      if (tableName) {} else if (formDetails) {
        var sys_id = "";
        var decoRow = elem.up("tr");
        sys_id = decoRow.getAttribute("sys_id");
        decoRow.setAttribute("record_class", formDetails.table);
        elem.parentNode.on("click", function(evt) {
          evt.stop();
          return false;
        });
        elem.on("click", function() {
          if (nowapi.g_popup_manager)
            nowapi.g_popup_manager.destroypopDiv();
          formDialogDef.open(sys_id, null, null, null);
          return false;
        });
      } else
        elem.parentNode.style.display = "none";
    });
    $(containerID).select(".linked").each(function(elem) {
      if (ignoreID && elem.getAttribute("id") == ignoreID)
        return;
      if (document.all)
        $(elem.parentNode).update(elem.innerText);
      else
        $(elem.parentNode).update(elem.textContent);
    });
  },
  sortAllBySpecificColumn: function(column, callback, sysParms, sourceContainerID, targetContainerID, errorCallback) {
    var ga = new GlideAjax('AjaxSortUpdateHandler');
    ga.addParam('sysparm_name', 'sortAllBySpecificColumn');
    for (var key in sysParms)
      ga.addParam(key, sysParms[key]);
    ga.addParam('sysparm_order_by', column);
    ga.setErrorCallback(errorCallback);
    ga.getXML(function(res) {
      $(sourceContainerID).originalScrollTop = $(sourceContainerID).scrollTop;
      $(targetContainerID).originalScrollTop = $(targetContainerID).scrollTop;
      callback();
    });
  },
  createDialog: function(topTarget, target, id, title, markup, backSuffix, noClose, getContainerBounds) {
    Utility.getInstance().showBackground(target, 1050, backSuffix);
    var dialog = new GlideDialogWindow(id, noClose);
    dialog.setTitle(title);
    dialog.setBody(markup, false, false);
    var div = $(id);
    div.style.zIndex = 1051;
    div.style.visibility = "visible";
    return dialog;
  },
  promptOK: function(topTarget, target, title, message, callback) {
    var markup = "<div id='promptDiv' style='overflow-x: hidden; padding-right: 14px; overflow-y: auto'><table>" +
      "<tr><td style='text-align: center'>&nbsp;</td></tr>" +
      "<tr><td style='text-align: center'>" + message + "</td></tr>" +
      "<tr><td style='text-align: center'>&nbsp;</td></tr>" +
      "<tr><td style='text-align: center'><button id='ok_button_bottom' type='button'>" + getMessage("OK") + "</button></td></tr>" +
      "</table></div>";
    var dialog = this.createDialog(topTarget, target, "prompt_window", title, markup, "sort_prompt", false);
    $("ok_button_bottom").on("click", function() {
      dialog._onCloseClicked();
    });
    dialog.on("beforeclose", function() {
      Utility.getInstance().hideBackground("sort_prompt");
      if (callback)
        callback();
    });
  },
  getEnabled: function(tableID) {
    var listElem;
    if (!$(tableID + "_table"))
      listElem = $(tableID);
    else
      listElem = $(tableID + "_table");
    var count = 0;
    if (listElem) {
      var elems = $(listElem).childElements();
      for (var i = 0; i < elems.length; i++)
        if (elems[i].tagName == "tbody" || elems[i].tagName == "TBODY") {
          var row = elems[i].down("tr");
          while (row) {
            if (row.hasClassName("list_row") && row.dr && !row.dr.dr.isDisabled())
              count++;
            row = row.next();
          }
        }
    }
    return count;
  }
});
SortUtil.instance = new SortUtil();
SortUtil.getInstance = function() {
  return SortUtil.instance;
};