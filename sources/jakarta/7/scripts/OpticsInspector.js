/*! RESOURCE: /scripts/OpticsInspector.js */
var OpticsInspector = Class
  .create({
    CATEGORIES: {
      "sys_script": "BUSINESS RULE",
      "sys_script_client": "CLIENT SCRIPT",
      "data_lookup": "DATA LOOKUP",
      "sys_data_policy2": "DATA POLICY",
      "ui_policy": "UI POLICY",
      "wf_context": "WORKFLOW",
      "request_action": "REQUEST ACTION",
      "script_engine": "SCRIPT ENGINE",
      "wf_activity": "WORKFLOW ACTIVITY",
      "acl": "ACL",
      "sys_ui_action": "UI ACTION",
      "reference_qual": "REFERENCE QUALIFIER QUERY",
      "container_action": "CONTAINER ACTION"
    },
    initialize: function() {
      this.opticsContextStack = new Array();
      this.tableName = null;
      this.fieldName = null;
      this.enabled = false;
    },
    pushOpticsContext: function(category, name, sys_id, sourceTable) {
      var context = {
        "category": category,
        "name": name,
        "sys_id": sys_id,
        "startTime": new Date(),
        actions: [],
        type: 'context',
        "sourceTable": sourceTable || category
      };
      if ((typeof g_form !== 'undefined') && g_form.actionStack)
        g_form.actionStack.push(context);
      if (this.isInspecting() && category !== 'container_action')
        this.opticsContextStack.push(context);
    },
    popOpticsContext: function() {
      var context;
      if ((typeof g_form !== 'undefined') && g_form.actionStack) {
        context = g_form.actionStack.pop();
        if (g_form._pushAction)
          g_form._pushAction(context);
      }
      if (this.isInspecting() && this.opticsContextStack.length > 0 && (context && context.category !== 'container_action'))
        return this.opticsContextStack.pop();
      return null;
    },
    isInspecting: function(tableName, fieldName) {
      if (this.tableName == null && this.fieldName == null)
        return false;
      if (arguments.length == 0)
        return (this.tableName && this.tableName.length > 0 &&
          this.fieldName && this.fieldName.length > 0);
      if (arguments.length == 2)
        return tableName == this.tableName &&
          fieldName == this.fieldName;
      return false;
    },
    getTableName: function() {
      return (this.tableName && this.tableName.length > 0) ? this.tableName :
        '';
    },
    getFieldName: function() {
      return (this.fieldName && this.fieldName.length > 0) ? this.fieldName :
        '';
    },
    hideWatchIcons: function() {
      if (isDoctype()) {
        $$(".icon-debug.watch_icon").each(function(element) {
          $(element).hide()
        });
      } else {
        $$("img.watch_icon").each(function(element) {
          $(element).hide()
        });
      }
    },
    addWatchIcon: function(watchField) {
      if (!watchField) {
        return;
      }
      var td = $('label.' + watchField);
      if (!td) {
        var fieldParts = watchField.split(".");
        if ((fieldParts.length == 2 && fieldParts[0].length > 0 && fieldParts[1].length > 0)) {
          td = $('label_' + fieldParts[1]);
          if (td && td.tagName !== 'TD') {
            var tds = td.getElementsByTagName("TD");
            if (tds && tds.length > 0) {
              td = tds[0];
            }
          }
          if (!td) {
            td = $('ni.' + fieldParts[1] + '_label');
          }
        }
      }
      var icon;
      if (td) {
        if (isDoctype()) {
          var label = td.select('label');
          if (label.length > 0) {
            label = label[0];
          } else {
            label = td.select('legend');
            if (label.length > 0) {
              label = label[0];
            } else if (td.nodeName == "LABEL") {
              label = td;
            }
          }
          icon = '<span class="label-icon icon-debug watch_icon" id="' +
            watchField +
            '.watch_icon"' +
            ' onclick="CustomEvent.fireTop(\'showFieldWatcher\')" ' +
            ' src="images/debug.gifx" ' +
            ' alt="Field is being watched"' +
            ' title="Field is being watched"></span>';
          if (label) {
            $(label).insert(icon);
          }
        } else {
          if (fieldParts.length === 2 &&
            fieldParts[1].startsWith("IO:")) {
            var legend = td.select('legend');
            if (legend.length > 0) {
              td = legend[0];
            }
          }
          icon = '<img class="watch_icon" id="' +
            watchField +
            '.watch_icon"' +
            ' onclick="CustomEvent.fireTop(\'showFieldWatcher\')" ' +
            ' src="images/debug.gifx" ' +
            ' alt="Field is being watched"' +
            ' title="Field is being watched" />';
          td.insert(icon);
        }
      }
    },
    clearWatchField: function(watchfield) {
      this.opticsContextStack = new Array();
      this.tableName = null;
      this.fieldName = null;
      this.hideWatchIcons();
      var debuggerTools = getTopWindow().debuggerTools;
      if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
        var wndw = debuggerTools.getJsDebugWindow();
        if (wndw.updateFieldInfo)
          wndw.updateFieldInfo(null);
      } else {
        debuggerTools = parent.parent.debuggerTools;
        if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
          var wndw = debuggerTools.getJsDebugWindow();
          if (wndw.updateFieldInfo)
            wndw.updateFieldInfo(null);
        }
      }
    },
    setWatchField: function(watchField) {
      if (!watchField)
        return;
      var fieldParts = watchField.split(".");
      if (!(fieldParts.length == 2 && fieldParts[0].length > 0 && fieldParts[1].length > 0))
        return;
      this.tableName = fieldParts[0];
      this.fieldName = fieldParts[1];
      this.hideWatchIcons();
      var icon = $(watchField + ".watch_icon");
      if (icon) {
        icon.show();
      } else {
        this.addWatchIcon(watchField);
      }
      var debuggerTools = getTopWindow().debuggerTools;
      if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
        var wndw = debuggerTools.getJsDebugWindow();
        if (wndw.updateFieldInfo)
          wndw.updateFieldInfo(watchField);
      } else {
        debuggerTools = parent.parent.debuggerTools;
        if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
          var wndw = debuggerTools.getJsDebugWindow();
          if (wndw.updateFieldInfo)
            wndw.updateFieldInfo(watchField);
        }
      }
    },
    showWatchField: function(watchField) {
      var debuggerTools = getTopWindow().debuggerTools;
      if (debuggerTools) {
        if (!debuggerTools.isDebugPanelVisible())
          debuggerTools.showFieldWatcher();
        setWatchField(watchField);
      } else {
        debuggerTools = parent.parent.debuggerTools;
        if (debuggerTools) {
          if (!debuggerTools.isDebugPanelVisible())
            debuggerTools.showFieldWatcher();
          setWatchField(watchField);
        }
      }
    },
    processClientMessage: function(notification) {
      var opticsContext = this.opticsContextStack[this.opticsContextStack.length - 1];
      if (!opticsContext) {
        jslog("No optics context found");
        return;
      }
      var info = {
        type: 'CLIENT ',
        message: notification.message,
        message_type: "static",
        category: opticsContext.category,
        name: opticsContext.name,
        level: this.opticsContextStack.length,
        time: getFormattedTime(new Date()),
        call_trace: this._getCallTrace(this.opticsContextStack),
        sys_id: opticsContext["sys_id"],
        sourceTable: opticsContext["sourceTable"]
      };
      if (notification["oldvalue"] && notification["newvalue"]) {
        info.message_type = "change";
        info.oldvalue = notification["oldvalue"];
        info.newvalue = notification["newvalue"];
      }
      this.process(info);
    },
    processServerMessages: function() {
      var spans = $$('span[data-type="optics_debug"]');
      for (var i = 0; i < spans.length; i++) {
        var notification = new GlideUINotification({
          xml: spans[i]
        });
        this.processServerMessage(notification);
        spans[i].setAttribute("data-attr-processed", "true");
      }
    },
    processServerMessage: function(notification) {
      if (notification.getAttribute('processed') == "true")
        return;
      var info = {
        type: 'SERVER',
        category: notification.getAttribute('category'),
        name: notification.getAttribute('name'),
        message: notification.getAttribute('message'),
        message_type: notification.getAttribute('message_type'),
        oldvalue: notification.getAttribute('oldvalue'),
        newvalue: notification.getAttribute('newvalue'),
        level: notification.getAttribute('level'),
        time: notification.getAttribute('time'),
        sys_id: notification.getAttribute('sys_id'),
        sourceTable: notification.getAttribute('sourceTable'),
        call_trace: this._getCallTrace(eval(notification
          .getAttribute('call_trace')))
      };
      this.process(info);
    },
    process: function(notification) {
      var msg = '<div class="debug_line ' + notification['category'] + '">' + this._getMessage(notification) + '</div>';
      this._log(msg);
    },
    addLine: function() {
      this._log('<hr class="logs-divider"/>');
    },
    openScriptWindow: function(tablename, sysid) {
      if (tablename && sysid) {
        if (tablename == "request_action")
          tablename = "sys_ui_action";
        var url = "/" + tablename + ".do?sys_id=" + sysid;
        window.open(url, "tablewindow");
      }
    },
    _log: function(msg) {
      var debuggerTools = getTopWindow().debuggerTools;
      if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
        var wndw = debuggerTools.getJsDebugWindow();
        if (wndw.insertJsDebugMsg)
          wndw.insertJsDebugMsg(msg);
      } else {
        debuggerTools = parent.parent.debuggerTools;
        if (debuggerTools && debuggerTools.isDebugPanelVisible()) {
          var wndw = debuggerTools.getJsDebugWindow();
          if (wndw.insertJsDebugMsg)
            wndw.insertJsDebugMsg(msg);
        }
      }
    },
    _getCallTrace: function(contextStack) {
      var trace = '';
      var arrows = '<span class="rtl-arrow"> &larr;</span><span class="lrt-arrow">&rarr; </span>';
      var space = arrows;
      for (i = 0, maxi = contextStack.length; i < maxi; i++) {
        var context = contextStack[i];
        if (i > 0)
          space = arrows + space;
        if (context['name'] && context['name'].length > 0)
          trace += '<div>' + space +
          this._getCategoryName(context['category']) +
          '&nbsp;-&nbsp;' + context['name'] + '</div>';
        else
          trace += '<div>' + space +
          this._getCategoryName(context['category']) +
          '</div>';
      }
      if (trace && trace.length > 0)
        trace = '<div class="call_trace">' + trace + '</div>';
      return trace;
    },
    _getMessage: function(notification) {
      var notif_type = notification['type'];
      var legend_title = (notif_type.indexOf('CLIENT') > -1) ? 'Client-side activity' :
        'Server-side activity';
      var msg = '<span class="expand-button" onclick="toggleCallTrace(this);">&nbsp;</span>';
      msg += '<img class="infoIcon" height="16"  width="16" border="0" src="images/info-icon.png" title="' +
        legend_title + '" alt="' + legend_title + '">';
      msg += '<span class="log-time ' + notif_type + '">' +
        notification['time'] + '</span>';
      msg += '<span class="log-category">' +
        this.CATEGORIES[notification['category']];
      if (notification['name'] && notification['name'].length > 0) {
        if (notification["sys_id"])
          msg += '&nbsp;-&nbsp;<a data-tablename="' +
          notification['sourceTable'] +
          '" data-sys_id="' +
          notification['sys_id'] +
          '" onclick="javascript:openScriptWindow(this);">' +
          notification['name'] + '</a></span>';
        else
          msg += '&nbsp;-&nbsp;' + notification['name'] +
          '</span>';
      } else
        msg += '</span>';
      msg += '<span class="log-value">';
      if ("request_action" === notification['category']) {
        msg += 'Value received from client is: <span class="value" title="Value">' +
          notification['message'] + '</span>';
      } else if (notification["message_type"] == "change") {
        msg += '<span>' +
          notification["oldvalue"] +
          '</span><span class="rtl-arrow"> &larr; </span><span class="lrt-arrow"> &rarr; </span><span>' +
          notification["newvalue"] + '</span>';
      } else {
        msg += notification['message'];
      }
      msg += '</span>';
      msg += notification['call_trace'];
      return msg;
    },
    _getCategoryName: function(category) {
      var name = this.CATEGORIES[category];
      if (name === 'undefined' || name === null)
        name = category;
      return name;
    },
    _getLevelStr: function(level) {
      if (level == 'undefined' || level == null || level <= 0)
        level = 1;
      var levelStr = '';
      for (i = 0; i < level; i++)
        levelStr += '-';
      return levelStr + '>';
    },
    toString: function() {
      return 'OpticsInspector';
    }
  });
var g_optics_inspect_handler = new OpticsInspector();
OpticsInspector.WATCH_EVENT = 'glide:ui_notification.optics_debug';
OpticsInspector.WATCH_EVENT_UI = 'glide:ui_notification.optics_debug_ui';
OpticsInspector.WATCH_FIELD = 'glide_optics_inspect_watchfield';
OpticsInspector.SHOW_WATCH_FIELD = 'glide_optics_inspect_watchfield';
OpticsInspector.UPDATE_WATCH_FIELD = 'glide_optics_inspect_update_watchfield';
OpticsInspector.CLEAR_WATCH_FIELD = 'glide_optics_inspect_clear_watchfield';
OpticsInspector.SHOW_WATCH_FIELD = 'glide_optics_inspect_show_watchfield';
OpticsInspector.PUT_CONTEXT = 'glide_optics_inspect_put_context';
OpticsInspector.POP_CONTEXT = 'glide_optics_inspect_pop_context';
OpticsInspector.PUT_CS_CONTEXT = 'glide_optics_inspect_put_cs_context';
OpticsInspector.POP_CS_CONTEXT = 'glide_optics_inspect_pop_cs_context';
OpticsInspector.PUT_CONTEXT = 'glide_optics_inspect_put_context';
OpticsInspector.POP_CONTEXT = 'glide_optics_inspect_pop_context';
OpticsInspector.LOG_MESSAGE = 'glide_optics_inspect_log_message';
OpticsInspector.WINDOW_OPEN = 'glide_optics_inspect_window_open';

function getClientScriptContextName(name, type) {
  var csname = null;
  if (type === "submit")
    csname = g_event_handlers_onSubmit[name];
  else if (type === "load")
    csname = g_event_handlers_onLoad[name];
  else if (type === "change")
    csname = g_event_handlers_onChange[name];
  return csname;
}
CustomEvent.observe(OpticsInspector.PUT_CONTEXT, function(category, name, sys_id, sourceTable) {
  g_optics_inspect_handler.pushOpticsContext(category, name, sys_id, sourceTable);
});
CustomEvent.observe(OpticsInspector.POP_CONTEXT, function() {
  g_optics_inspect_handler.popOpticsContext();
});
CustomEvent.observe(OpticsInspector.PUT_CS_CONTEXT, function(name, type) {
  var csname = getClientScriptContextName(name, type);
  if (csname)
    g_optics_inspect_handler.pushOpticsContext("sys_script_client", csname,
      g_event_handler_ids[name]);
});
CustomEvent.observe(OpticsInspector.POP_CS_CONTEXT, function(name, type) {
  var csname = getClientScriptContextName(name, type);
  if (csname)
    g_optics_inspect_handler.popOpticsContext();
});
CustomEvent.observe(OpticsInspector.LOG_MESSAGE, function(notification) {
  if (g_optics_inspect_handler.isInspecting(notification["table"],
      notification["field"])) {
    g_optics_inspect_handler.processClientMessage(notification);
  }
});
CustomEvent.observe(OpticsInspector.WATCH_EVENT_UI, function(notification) {
  g_optics_inspect_handler.process(notification);
});
CustomEvent.observe(OpticsInspector.WATCH_EVENT, function(notification) {
  g_optics_inspect_handler.processServerMessage(notification);
});
CustomEvent.observe(OpticsInspector.WATCH_FIELD, function(watchfield) {
  g_optics_inspect_handler.setWatchField(watchfield);
});
CustomEvent.observe(OpticsInspector.SHOW_WATCH_FIELD, function(watchfield) {
  g_optics_inspect_handler.showWatchField(watchfield);
});
CustomEvent.observe(OpticsInspector.CLEAR_WATCH_FIELD, function(watchfield) {
  g_optics_inspect_handler.clearWatchField(watchfield);
});
CustomEvent.observe(OpticsInspector.UPDATE_WATCH_FIELD, function(watchfield) {
  g_optics_inspect_handler.setWatchField(watchfield);
  if (window.name !== "jsdebugger") {
    g_optics_inspect_handler.addLine();
    g_optics_inspect_handler.processServerMessages();
  }
});;