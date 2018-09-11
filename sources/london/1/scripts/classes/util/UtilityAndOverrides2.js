/*! RESOURCE: /scripts/classes/util/UtilityAndOverrides2.js */
var FormDialogDefinition = Class.create({
  initialize: function(title, table, container, view, formOnly) {
    this.title = title;
    this.table = table;
    this.container = container;
    this.view = view;
    this.formOnly = formOnly;
  },
  setCloseCallback: function(closeCallback) {
    this.closeCallback = closeCallback;
    return this;
  },
  setAfterCloseCallback: function(afterCloseCallback) {
    this.afterCloseCallback = afterCloseCallback;
    return this;
  },
  setOpenCallback: function(openCallback) {
    this.openCallback = openCallback;
    return this;
  },
  open: function(sys_id, parentID, parentColumnRef, fieldDetails) {
    this._openItemForm(this.title, this.table, this.container, this.view, sys_id, this.closeCallback, this.formOnly, parentID, parentColumnRef, this.openCallback, fieldDetails)
  },
  _openItemForm: function(title, table, container, view, sys_id, closeCallback, formOnly, parentID, parentColumnRef, openCallback, fieldDetails) {
    if ($("FormDialog"))
      return;
    var dialog = new GlidePaneForm(
      title ? title : "<span></span>",
      table,
      document.body,
      this.afterCloseCallback ? this.afterCloseCallback : function(action_verb, sys_id, updated_table, display_value) {});
    dialog.setLoadCallback(
      function(frame) {
        $("dialog_frame").noContext = true;
        if (isMSIE) {
          var shim = $("iframeDragShim_FormDialog");
          var theFrame = $("FormDialog");
          shim.parentNode.removeChild(shim);
          document.body.appendChild(shim);
          theFrame.parentNode.removeChild(theFrame);
          document.body.appendChild(theFrame);
          var dimensions = $("iframeDragShim_FormDialog").getDimensions();
          var elems = {
            "window.FormDialog": "XY",
            "FormDialog": "XY",
            "body_FormDialog": "X",
            "dialog_frame": "X"
          };
          for (var id in elems) {
            if (elems[id] == "XY" || elems[id] == "X") $(id).style.width = dimensions.width + "px";
            if (elems[id] == "XY" || elems[id] == "Y") $(id).style.height = dimensions.height + "px";
          }
          $("dialog_frame").style.height = (dimensions.height - $("window.FormDialog").down(".glide_pane_header").getDimensions().height) + "px";
        } else
          $("dialog_frame").style.height = ($("dialog_frame").getDimensions().height - 12) + "px";
        if ($("grayBackground")) {
          var dimensions = BoundsUtil.getInstance().getElemBounds(container);
          $("grayBackground").style.width = dimensions.width + "px";
          $("grayBackground").style.height = dimensions.height + "px";
        }
        if (frame && ((parentID && parentColumnRef) || fieldDetails)) {
          var dFrame = 'defaultView' in frame ? frame.defaultView : frame.parentWindow;
          if (dFrame) {
            var interval;
            var count = 0;
            interval = setInterval(function() {
              try {
                if (dFrame.g_form) {
                  if (fieldDetails) {
                    for (var fieldName in fieldDetails) {
                      var fieldValue = fieldDetails[fieldName];
                      dFrame.g_form.setValue(fieldName, fieldValue);
                    }
                  } else if (parentColumnRef)
                    dFrame.g_form.setValue(parentColumnRef, parentID);
                  clearInterval(interval);
                  dFrame = null;
                } else if (count > 50) {
                  clearInterval(interval);
                  dFrame = null;
                }
              } catch (e) {
                clearInterval(interval);
                dFrame = null;
              }
              count++;
            }, 200);
          }
        }
        if (openCallback)
          openCallback("loaded");
      });
    dialog.addParm('sysparm_form_only', 'true');
    dialog.addParm('sysparm_titleless', 'false');
    dialog.addParm('sysparm_view', view);
    dialog.addParm('sysparm_link_less', 'true');
    this._checkAndInitializeIfStory(dialog, parentID, parentColumnRef);
    if (sys_id)
      dialog.setSysID(sys_id);
    if (closeCallback)
      dialog.on("beforeclose", closeCallback);
    dialog.render();
    if (isMSIE7)
      dialog._centerOnScreen();
    if (openCallback)
      openCallback("rendered");
  },
  _checkAndInitializeIfStory: function(dialog, parentID, parentColumnRef) {
    if (parentID && parentColumnRef && (parentColumnRef == 'story')) {
      dialog.addParm('sysparm_collection_key', parentColumnRef);
      dialog.addParm('sysparm_collectionID', parentID);
      dialog.addParm('sysparm_collection', 'rm_story');
    }
  }
});
var Utility = Class.create({
  removeStyleProperty: function(elem, style) {
    if (elem.style.removeProperty)
      elem.style.removeProperty(style);
    else
      elem.style[style] = "";
  },
  hideBackground: function(idSuffix) {
    var gb;
    if (!idSuffix)
      gb = $('grayBackground');
    else
      gb = $('grayBackground' + idSuffix);
    if (gb) {
      gb.resizeHandler.stop();
      gb.style.display = "none";
      gb.parentNode.removeChild(gb);
      Event.stopObserving(window, 'resize', gb.resizeHandler);
    }
  },
  refreshBackground: function(id, idSuffix) {
    var backId = "grayBackground";
    if (idSuffix)
      backId += idSuffix;
    var dimensions = $(id).getDimensions();
    var back = $("grayBackground");
    if (parseInt(back.style.width) < dimensions.width)
      back.style.width = dimensions.width + "px";
    if (parseInt(back.style.height) < dimensions.height)
      back.style.height = dimensions.height + "px";
  },
  showBackground: function(id, zIndex, idSuffix) {
    var backId = "grayBackground";
    if (idSuffix)
      backId += idSuffix;
    if (!$(backId)) {
      var gb = $(cel("div"));
      gb.setAttribute("id", backId);
      var bounds = BoundsUtil.getInstance().getElemBounds($(id));
      gb.style.top = bounds.top + "px";
      gb.style.left = bounds.left + "px";
      gb.style.width = bounds.width + "px";
      gb.style.height = bounds.height + "px";
      gb.style.position = "absolute";
      gb.style.display = "block";
      gb.style.zIndex = zIndex;
      gb.style.backgroundColor = "#444444";
      gb.style.opacity = 0.33;
      gb.style.filter = "alpha(opacity=33)";
      document.body.appendChild(gb);
      gb.resizeHandler = function() {
        gb.style.width = $(id).getDimensions().width + "px";
        gb.style.height = $(id).getDimensions().height + "px";
      }
      gb.resizeHandler.stop = function() {};
      Event.observe(window, 'resize', gb.resizeHandler);
    }
  }
});
Utility.instance = new Utility();
Utility.getInstance = function() {
  return Utility.instance;
};