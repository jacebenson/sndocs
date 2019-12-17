/*! RESOURCE: /scripts/GlideEditor5Includes.js */
/*! RESOURCE: /scripts/classes/syntax_editor5/discover.js */
var discover = (function() {
  'use strict';
  var showContextMenu = '';
  if (showContextMenu !== 'true')
    return;
  if (typeof(window.SharedWorker) === 'undefined')
    return;
  var editors = {},
    callbacks = {},
    discoverWorker = new SharedWorker('scripts/classes/syntax_editor5/discoverWorker.js?v=11-15-2019_1010'),
    workerPort = discoverWorker.port;
  workerPort.onmessage = function(message) {
    var data = message.data;
    var id = data.id,
      cmd = data.command;
    if (callbacks[cmd] && callbacks[cmd][id])
      callbacks[cmd][id].callback && callbacks[cmd][id].callback(editors[cmd][id], data.result);
    removeCallback(data.command, data.id);
  };

  function addCallback(command, editor, callback) {
    editors[command] || (editors[command] = {});
    callbacks[command] || (callbacks[command] = {});
    var id = Math.floor(Math.random() * 1001);
    editors[command][id] = editor;
    callbacks[command][id] = {
      callback: callback,
      start: Date.now()
    };
    return id;
  }

  function removeCallback(command, id) {
    if (command) {
      if (editors[command])
        delete editors[command][id];
      if (callbacks[command])
        delete callbacks[command][id];
    }
  }
  return {
    storeCache: function(cacheFlushTime, editor, callback) {
      var cmd = 'loadCache';
      var id = addCallback(cmd, editor, callback);
      workerPort.postMessage({
        command: cmd,
        id: id,
        cacheFlushTime: cacheFlushTime,
        g_ck: window.g_ck
      });
    },
    discoverTokens: function(lines, apiDocResourceIdsJson, options, editor, callback) {
      var cmd = 'discover';
      var id = addCallback(cmd, editor, callback);
      workerPort.postMessage({
        command: cmd,
        id: id,
        lines: lines,
        currentScope: options.currentScope,
        apiDocIdsJson: apiDocResourceIdsJson
      });
    },
    destroy: function() {
      if (workerPort) {
        workerPort.close && workerPort.close();
        discoverWorker = workerPort = null;
      }
    }
  };
})();;
/*! RESOURCE: /scripts/classes/syntax_editor5/linter.js */
var linter = (function() {
  'use strict';
  if (typeof(Worker) === 'undefined')
    return;
  var editors = {},
    callbacks = {},
    worker = new Worker('scripts/classes/syntax_editor5/lintWorker.js?v=11-15-2019_1010'),
    eslintConfig;
  worker.onmessage = function(message) {
    var id = message.data.id,
      errors = message.data.errors;
    callbacks[id].callback(editors[id], errors);
    delete callbacks[id];
    delete editors[id];
  };
  return {
    validate: function(cm, updateLinting, options, editor) {
      var id = Math.floor(Math.random() * 1001);
      editors[id] = editor;
      callbacks[id] = {
        callback: updateLinting,
        start: Date.now()
      };
      worker.postMessage({
        id: id,
        code: cm,
        eslintConfig: options.eslintConfig
      });
    },
    destroy: function() {
      if (worker) {
        worker.terminate();
        worker = null;
      }
    }
  };
})();;
/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditorJSBreakpoints.js */
var GlideEditorJSBreakpoints = (function() {
  return {
    init: function(id, editor) {
      const isNewRecord = g_form.isNewRecord();
      if (isNewRecord) return;
      const lineNumberSelector = ".Debugger-breakpoints-gutter-marker div.CodeMirror-linenumber";
      const lineNumberGhostClass = "Debugger-linenumber-ghost";
      $j(window.document).on("mouseover", lineNumberSelector, function(e) {
        e.target.classList.add(lineNumberGhostClass);
        showBreakpointReadonlyMode(e);
      });
      $j(window.document).on("mouseout", lineNumberSelector, function(e) {
        e.target.classList.remove(lineNumberGhostClass);
        hideBreakpointReadonlyMode();
      });
      window.document.oncontextmenu = function(e) {
        if (isContextMenuClickedOnGutter(e.target.classList))
          return false;
      };
      $j("#gutterContextMenu").find("li").hover(function() {
        $j(this).focus();
      });
      $j(window).keydown(function(e) {
        if (contextMenuOpened) {
          if (e.which === 40) {
            if (liSelected) {
              var nextNotHidden;
              $j(displayedContextMenuItems).each(function(index, item) {
                if ($j(item).is(':focus'))
                  nextNotHidden = $j(item).nextAll('.breakpoint-menu-item').not('.hide-me').first();
              });
              nextNotHidden.focus();
            } else {
              liSelected = $j(displayedContextMenuItems[0]).nextAll('.breakpoint-menu-item').not('.hide-me').first();
              liSelected.focus();
            }
          } else if (e.which === 38) {
            if (liSelected) {
              var prevNotHidden;
              $j(displayedContextMenuItems).each(function(index, item) {
                if ($j(item).is(':focus'))
                  prevNotHidden = $j(item).prevAll('.breakpoint-menu-item').not('.hide-me').first();
              });
              prevNotHidden.focus();
            } else {
              liSelected = $j(displayedContextMenuItems[0]).prevAll('.breakpoint-menu-item').not('.hide-me').first();
              liSelected.focus();
            }
          } else if (e.which === 27) {
            if (contextMenuOpened)
              hideContextMenu();
          }
        }
      });
      loadBreakpoints(id, editor, function() {
        editor.on('gutterClick', function(cm, line, gutter, event) {
          hideBreakpointReadonlyMode();
          onGutterClick(id, cm, line, gutter, event);
        });
        let _lastLineCount = editor.lineCount();
        editor.on('change', function(cm, changed) {
          const curLineCount = editor.lineCount();
          if (curLineCount !== _lastLineCount) {
            _lastLineCount = curLineCount;
            updateGutterMarkers(editor, changed);
          }
        });
        editor.on('gutterContextMenu', function(cm, line, gutter, event) {
          onGutterContextMenu(id, cm, line, gutter, event);
        });
        lintingEnabled = editor.getOption('lint');
        editor.on('optionChange', function(cm, option) {
          if (option == 'gutters' || option == 'lint') {
            const lintEnabled = cm.options.lint;
            if (lintEnabled == false) {
              $j(".CodeMirror-lines").each(function(index, item) {
                item.classList.add('linter-toggled');
              });
              lintingEnabled = false;
            } else {
              $j(".CodeMirror-lines").each(function(index, item) {
                item.classList.remove('linter-toggled');
              });
              lintingEnabled = true;
            }
          }
          if (option == "format_code") {
            updateGutterMarkers(editor);
          }
        });
      });
      window.document.onmouseup = function(e) {
        const contextMenu = $j(gutterContextMenuId);
        if (!contextMenu.is(e.target) && contextMenu.has(e.target).length === 0 &&
          !($j(e.target).hasClass("CodeMirror-linenumber") || $j(e.target).hasClass("CodeMirror-gutter-background")))
          hideContextMenu();
        hideBreakpointEditor(e);
      };
      window.addEventListener('scroll', function() {
        hideContextMenu();
      }, true);
      addBreakpointId = "#addBreakpoint";
      addConditionId = "#addCondition";
      editConditionId = "#editCondition";
      removeConditionId = "#removeCondition";
      removeBreakpointId = "#removeBreakpoint";
      addConditionalBreakpointId = "#addConditionalBreakpoint";
      breakConditionId = "#breakCondition";
      gutterContextMenuId = "#gutterContextMenu";
      breakpointContainerId = "#breakpointContainer";
      $j(addBreakpointId).on('click', onAddBreakpointClick);
      $j(addConditionId).on('click', onAddConditionClick);
      $j(editConditionId).on('click', onEditConditionClick);
      $j(removeConditionId).on('click', onRemoveConditionClick);
      $j(removeBreakpointId).on('click', onRemoveBreakpointClick);
      $j(addConditionalBreakpointId).on('click', onAddConditionClick);
      $j(breakConditionId).keydown(onConditionTextboxKeyDown);
      $j(breakConditionId).keyup(onConditionTextboxKeyUp);
    }
  };
  var BREAKPOINTS = {};
  var LINE_ID;
  var LINE_NUMBER;
  var CONTEXT_EVENT;
  var GUTTER;
  var EDITOR;
  var CONDITION_WIDGET;
  var addBreakpointId;
  var addConditionId;
  var editConditionId;
  var removeConditionId;
  var removeBreakpointId;
  var addConditionalBreakpointId;
  var breakConditionId;
  var gutterContextMenuId;
  var breakpointContainerId;
  var lintingEnabled;
  var contextMenuOpened;
  var displayedContextMenuItems;
  var liSelected;

  function updateBreakpointStyles(editor, changedOrigin, breakpointLine, className, lineCount) {
    const breakpointLineNumber = Number(breakpointLine);
    if (lineCount >= breakpointLineNumber)
      editor.addLineClass(breakpointLineNumber - 1, 'gutter', className);
    editor.addLineClass(breakpointLineNumber - 1, 'background', "Debugger-breakpoints-highlight");
  }

  function updateGutterMarkers(editor, changed) {
    const changedOrigin = changed ? changed.origin : null;
    const lineCount = editor.lineCount();
    editor.operation(function() {
      editor.eachLine(function(line) {
        editor.removeLineClass(line, 'gutter');
        editor.addLineClass(line, 'gutter', 'Debugger-breakpoints-gutter-marker');
      })
    });
    Object.keys(BREAKPOINTS).forEach(function(breakpointLine) {
      const classNameToApply =
        BREAKPOINTS[breakpointLine] != null && BREAKPOINTS[breakpointLine] != '' ?
        'Debugger-breakpoints-condition-gutter' :
        'Debugger-breakpoints-gutter';
      updateBreakpointStyles(editor, changedOrigin, breakpointLine, classNameToApply, lineCount);
    });
  }

  function loadBreakpoints(id, editor, then) {
    $j.ajax({
        url: '/api/now/js/debugger/scripts',
        method: "GET",
        headers: {
          'X-UserToken': window.g_ck
        }
      })
      .done(function(data) {
        if (!data || typeof data !== 'object')
          return;
        let key = getKey();
        key += '.' + id.split('.')[1];
        const result = data.result || {};
        const script = result[key] || {};
        BREAKPOINTS = {};
        const breakpoints = script.breakpoints;
        if (breakpoints) {
          Object.keys(breakpoints).map(function(line) {
            const breakpointData = breakpoints[line];
            const condition = breakpointData ? breakpointData.condition : null;
            BREAKPOINTS[line] = condition;
          })
        }
        updateGutterMarkers(editor);
        if (then)
          then();
      });
  }

  function onGutterClick(id, editor, lineNumber, gutter, event) {
    if (event.which == 3) {
      event.preventDefault();
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.indexOf('firefox') > -1 || isBrowserIE() || userAgent.indexOf('edge') > -1)
        onGutterContextMenu(id, editor, lineNumber, gutter, event);
      return;
    }
    if (event.target.classList.contains('CodeMirror-foldgutter-open') || event.target.classList.contains('CodeMirror-foldgutter-folded'))
      return;
    toggleBreakpoint(id, editor, lineNumber + 1, gutter);
    editor.removeLineClass(lineNumber, "gutter", "Debugger-breakpoints-gutter");
    editor.removeLineClass(lineNumber, "gutter", "Debugger-breakpoints-condition-gutter");
    editor.removeLineClass(lineNumber, "background", "Debugger-breakpoints-highlight");
  }

  function updateSysBreakpoints(id, lineNumber, then, breakCondition) {
    const scriptType = g_form.getTableName();
    const scriptId = g_form.getUniqueValue();
    const scriptField = id.split('.')[1];
    const isBreakpointNull = breakCondition == null;
    const requestData = isBreakpointNull ? null : JSON.stringify({
      'breakpointCondition': breakCondition
    });
    const url = '/api/now/js/debugger/breakpoint/' + scriptType + '/' + scriptId + '/' + scriptField + '/' + lineNumber;
    $j.ajax({
        url: url,
        method: "POST",
        headers: {
          'X-UserToken': window.g_ck,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        data: requestData
      })
      .done(function(response) {
        then(true);
      });
  }

  function toggleBreakpoint(id, editor, lineNumber, gutter, condition) {
    hideContextMenu();
    const lineInfo = editor.lineInfo(lineNumber - 1);
    const gutters = lineInfo.gutterMarkers || {};
    if ('CodeMirror-foldgutter' === gutter && gutters[gutter]) {
      return;
    }
    updateSysBreakpoints(id, lineNumber, function(ok) {
      if (ok)
        loadBreakpoints(id, editor);
    }, condition);
  }

  function onAddBreakpointClick() {
    toggleBreakpoint(LINE_ID, EDITOR, LINE_NUMBER, GUTTER);
  }

  function onAddConditionClick() {
    showBreakpointEditor();
  }

  function onEditConditionClick() {
    showBreakpointEditor(BREAKPOINTS[LINE_NUMBER]);
  }

  function showBreakpointEditor(condition) {
    EDITOR.addLineClass(LINE_NUMBER - 1, 'gutter', 'Debugger-breakpoints-condition-outline');
    let conditionTextbox = $j("#breakCondition");
    conditionTextbox.val(condition || "");
    $j("#debuggerLineNumber").text(LINE_NUMBER);
    removeErrorConditionClass();
    CONDITION_WIDGET = EDITOR.doc.addLineWidget(LINE_NUMBER - 1, document.getElementById("breakpointContainer"));
    hideContextMenu();
    showElement(breakpointContainerId);
    conditionTextbox.focus();
  }

  function hideBreakpointEditor(e) {
    const breakpointContainer = $j(breakpointContainerId);
    if (!breakpointContainer.is(e.target) && breakpointContainer.has(e.target).length === 0) {
      const conditionTextboxElement = $j(breakConditionId);
      const isWidgetDisplayed = conditionTextboxElement.is(':visible');
      const conditionValue = $j.trim(conditionTextboxElement.val());
      if (isWidgetDisplayed && BREAKPOINTS[LINE_NUMBER] != conditionValue) {
        if (!trySaveCondition(conditionValue))
          return;
      }
      hideElement(breakpointContainerId);
      if (EDITOR) {
        removeBreakpointOutlineClass();
        EDITOR.refresh();
      }
    }
  }

  function onRemoveConditionClick() {
    BREAKPOINTS[LINE_NUMBER] = "";
    hideContextMenu();
    removeConditionClass();
    updateBreakpointsWithVal("");
  }

  function onRemoveBreakpointClick() {
    toggleBreakpoint(LINE_ID, EDITOR, LINE_NUMBER, GUTTER);
    removeConditionClass();
    removeBreakpointClass();
  }

  function isValidConditionExpression(expr) {
    return true;
  }

  function displayErrorOnConditionSyntaxFail() {
    showElement("#conditionError");
    $j("#breakCondition").addClass('condition-input-error');
  }

  function removeErrorConditionClass() {
    hideElement("#conditionError");
    $j("#breakCondition").removeClass('condition-input-error');
  }

  function onConditionTextboxKeyDown(event) {
    const enterEventCode = 13;
    const escEventCode = 27;
    if (event.keyCode === enterEventCode || event.keyCode === escEventCode) {
      const isValid = trySaveCondition(event.target.value);
      if (isValid || event.keyCode === escEventCode) {
        hideElement(breakpointContainerId);
        removeBreakpointOutlineClass();
      }
    }
  }

  function onConditionTextboxKeyUp(event) {
    const dotEventCode = 190;
    if (event.keyCode === dotEventCode)
      event.stopPropagation();
  }

  function trySaveCondition(val) {
    const trimmedValue = $j.trim(val);
    if (ifBreakpointAtLineHasConditionVal(LINE_NUMBER, val))
      return true;
    if (trimmedValue.length > 0 && !isValidConditionExpression(trimmedValue))
      return false;
    BREAKPOINTS[LINE_NUMBER] = trimmedValue;
    updateBreakpointsWithVal(trimmedValue);
    if (trimmedValue.length < 1)
      removeConditionClass();
    return true;
  }

  function onGutterContextMenu(id, editor, lineNumber, gutter, event) {
    hideBreakpointReadonlyMode();
    const conditionTextboxElement = $j(breakConditionId);
    const isWidgetDisplayed = conditionTextboxElement.is(':visible');
    if (isWidgetDisplayed)
      return;
    removeBreakpointOutlineClass();
    if (CONTEXT_EVENT)
      hideContextMenu();
    LINE_NUMBER = lineNumber + 1;
    CONTEXT_EVENT = event;
    LINE_ID = id;
    GUTTER = gutter;
    EDITOR = editor;
    if (ifLineHasBreakpoint(LINE_NUMBER)) {
      hideElement(addBreakpointId);
      hideElement(addConditionalBreakpointId);
      if (ifBreakpointAtLineHasCondition(LINE_NUMBER)) {
        hideElement(addConditionId);
        showElement(editConditionId);
        showElement(removeConditionId);
        showElement(removeBreakpointId);
      } else {
        showElement(addConditionId);
        showElement(removeBreakpointId);
        hideElement(editConditionId);
        hideElement(removeConditionId);
      }
    } else {
      showElement(addBreakpointId);
      showElement(addConditionalBreakpointId);
      hideElement(addConditionId);
      hideElement(editConditionId);
      hideElement(removeConditionId);
      hideElement(removeBreakpointId);
    }
    if (document.getElementById("gutterContextMenu"))
      showContextMenu();
    event.preventDefault();
  }

  function updateBreakpointsWithVal(val) {
    updateSysBreakpoints(LINE_ID, LINE_NUMBER, function(ok) {
      if (ok)
        loadBreakpoints(LINE_ID, EDITOR);
    }, val)
  }

  function getKey() {
    const tbl = g_form.getTableName();
    const sysId = g_form.getUniqueValue();
    return tbl + '.' + sysId;
  }

  function ifLineHasBreakpoint(lineNum) {
    return Object.keys(BREAKPOINTS).filter(function(breakpoint) {
      return breakpoint == lineNum;
    }).length > 0;
  }

  function ifBreakpointAtLineHasCondition(lineNum) {
    return BREAKPOINTS[lineNum] && BREAKPOINTS[lineNum].length > 0;
  }

  function ifBreakpointAtLineHasConditionVal(lineNum, val) {
    return BREAKPOINTS[LINE_NUMBER] && BREAKPOINTS[LINE_NUMBER].length > 0 && BREAKPOINTS[LINE_NUMBER] == val;
  }

  function showElement(elementId) {
    $j(elementId).removeClass('hide-me');
  }

  function hideElement(elementId) {
    $j(elementId).addClass('hide-me');
  }

  function showBreakpointReadonlyMode(e) {
    const shouldDisplayCondition =
      e.target.parentNode.classList.contains('Debugger-breakpoints-condition-gutter') &&
      $j(gutterContextMenuId).hasClass('hide-me') &&
      $j(breakpointContainerId).hasClass('hide-me');
    if (shouldDisplayCondition) {
      let lineNumber = e.target.textContent;
      CONTEXT_EVENT = e;
      var offset = $j(e.target).closest('.CodeMirror-scroll').offset();
      $j(".breakpoint-readonly").text(BREAKPOINTS[lineNumber]).css({
        "display": "block",
        top: (CONTEXT_EVENT.pageY - offset.top + 15) + "px",
        left: lintingEnabled ? "76px" : "60px"
      });
    }
  }

  function hideBreakpointReadonlyMode() {
    $j(".breakpoint-readonly").css({
      "display": "none"
    });
  }

  function isContextMenuClickedOnGutter(targetContextMenuClassList) {
    return targetContextMenuClassList.contains('CodeMirror-gutter-elt') ||
      targetContextMenuClassList.contains('CodeMirror-linenumber') ||
      targetContextMenuClassList.contains('CodeMirror-gutter-background') ||
      targetContextMenuClassList.contains('breakpoint-menu-item');
  }

  function isBrowserIE() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.indexOf("msie ") > -1 || userAgent.indexOf("trident/") > -1;
  }

  function showContextMenu() {
    let gutterContextMenuElement = $j(gutterContextMenuId);
    gutterContextMenuElement.css({
      top: CONTEXT_EVENT.pageY + "px",
      left: CONTEXT_EVENT.pageX + "px",
      "position": "fixed"
    });
    if (!isBrowserIE()) {
      gutterContextMenuElement.css({
        "z-index": "1000"
      });
    }
    EDITOR.addLineClass(LINE_NUMBER - 1, 'gutter', 'Debugger-linenumber-ghost-clone');
    showElement(gutterContextMenuId);
    contextMenuOpened = true;
    focusContextMenu(gutterContextMenuElement);
  }

  function focusContextMenu(gutterContextMenuElement) {
    const listNodes = gutterContextMenuElement.children().first().children();
    displayedContextMenuItems = [];
    listNodes.each(function(index, item) {
      if (!item.classList.contains("hide-me"))
        displayedContextMenuItems.push(item);
    });
    if (displayedContextMenuItems && displayedContextMenuItems.length > 0)
      displayedContextMenuItems[0].focus();
  }

  function hideContextMenu() {
    hideElement(gutterContextMenuId);
    if (EDITOR)
      EDITOR.removeLineClass(LINE_NUMBER - 1, 'gutter', 'Debugger-linenumber-ghost-clone');
    contextMenuOpened = false;
  }

  function removeConditionClass() {
    EDITOR.removeLineClass(LINE_NUMBER - 1, "gutter", "Debugger-breakpoints-condition-gutter");
  }

  function removeBreakpointClass() {
    EDITOR.removeLineClass(LINE_NUMBER - 1, "gutter", "Debugger-breakpoints-gutter");
  }

  function removeBreakpointOutlineClass() {
    if (EDITOR && LINE_NUMBER)
      EDITOR.removeLineClass(LINE_NUMBER - 1, 'gutter', 'Debugger-breakpoints-condition-outline');
  }
})();;
/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditorContextMenu.js */
var GlideEditorContextMenu = (function() {
  var showDocLabel = getMessage("Show Documentation");
  var contextMenuItems = [{
      type: "sys_db_object",
      menu: getMessage("Show Definition"),
      action: "record",
      keyField: "name"
    },
    {
      type: "sys_db_object",
      menu: getMessage("Show Data"),
      action: "list",
      keyField: "name"
    },
    {
      type: "sys_script_include",
      menu: getMessage("Open Definition"),
      action: "record",
      keyField: "api_name"
    }
  ];
  var prefix = "nav_to.do?uri=";

  function showEditorContext(event, literal) {
    var cMenu = new GwtContextMenu('context_menu_editor_' + literal.name);
    cMenu.clear();
    addContextMenuItems(cMenu, literal);
    return contextShow(event, cMenu.getID(), 500, 0, 0);
  }

  function openDefinitionTab(literal) {
    if (literal.type === "api")
      window.open("/api/now/v1/context_doc_url/CSHelp:" + literal.key, "_blank");
    else {
      if (window.isDevStudio || literal.type === 'sys_script_include')
        openDefinition(literal)
      else {
        var uri = literal.type + ".do?sysparm_query=name=" + literal.key
        window.open(prefix + uri, "_blank");
      }
    }
  }

  function openDefinition(literal) {
    $j.ajax({
        url: 'api/now/v1/syntax_editor/cache/' + literal.type + '?name=' + literal.key,
        method: "GET",
        headers: {
          'X-UserToken': window.g_ck
        }
      })
      .done(function(data) {
        if (!data || typeof data !== 'object')
          return;
        var sys_id = data.result && data.result.result;
        var id = literal.type + "_" + sys_id;
        var uri = literal.type + ".do?sys_id=" + sys_id;
        if (window.isDevStudio) {
          if (window.openStudioTab)
            window.openStudioTab(uri, id);
        } else
          window.open(prefix + uri, "_blank");
      });
  }

  function addContextMenuItems(cMenu, literal) {
    if (literal.type === "api") {
      var openDocumenation = function() {
        window.open("/api/now/v1/context_doc_url/CSHelp:" + literal.key, "_blank");
      }
      cMenu.addFunc(showDocLabel, openDocumenation, literal.key);
    } else
      contextMenuItems.forEach(function(item) {
        if (item.type == literal.type) {
          var id = (item.action == 'list' ? literal.name + "_list" : literal.type + "_" + literal.key);
          if ((window.isDevStudio && item.action === 'record') || literal.type === 'sys_script_include') {
            var openContextMenuTab = function() {
              openDefinition(literal);
            };
            cMenu.addFunc(item.menu, openContextMenuTab, id);
          } else {
            var uri = (item.action == 'list' ? literal.name + "_list.do?sys_id=-1" : literal.type + ".do?sysparm_query=" + item.keyField + "=" + literal.key);
            cMenu.addURL(item.menu, prefix + uri, "_blank", id);
          }
        }
      });
  }
  return {
    showEditorContext: showEditorContext,
    openDefinitionTab: openDefinitionTab
  };
})();;
/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditor.js */
var g_glideEditors = g_glideEditors || {};
var g_glideEditorArray = g_glideEditorArray || [];
var GlideEditor = Class.create({
  initialize: function(id, options, jvarAccessKey, isReadOnly, apiJSON, linter, codeComplete) {
    var isJavaScript = options.mode == "javascript";
    var webWorker = typeof(Worker) !== "undefined";
    this.macros = {};
    this._initMacros();
    this.id = id;
    var el = $(id);
    this.originalValue = el.value;
    this.curCursor = null;
    var self = this;
    if (isJavaScript && webWorker && codeComplete) {
      var defs = [];
      if (apiJSON)
        defs.push(JSON.parse(apiJSON));
      var server = new CodeMirror.TernServer({
        defs: defs,
        showError: function(e, m) {},
        workerDeps: ["/scripts/snc-code-editor/tern-bundle.min.js?sysparm_substitute=false"],
        workerScript: "scripts/snc-code-editor/codemirror/addon/tern/worker.js",
        useWorker: true,
        queryOptions: {
          completions: {
            caseInsensitive: true,
            guess: false
          }
        }
      });
    }
    var ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
    this.mac = ios || /Mac/.test(navigator.platform);
    this.win = /Win/.test(navigator.platform);
    var ie = /MSIE \d/.test(navigator.userAgent);
    CodeMirror.extraCommands = {
      'showKeyMap': getMessage('Help'),
      'fullScreen': getMessage('Toggle Full Screen'),
      'find': getMessage('Start Searching'),
      'findNext': getMessage('Find Next'),
      'findPrev': getMessage('Find Previous'),
      'replace': getMessage('Replace'),
      'replaceAll': getMessage('Replace All'),
      'commentSelection': getMessage('Toggle Comment'),
      'scriptDebugger': getMessage('Open Script Debugger'),
      'autoComplete': getMessage('Scripting Assistance')
    };
    CodeMirror.extraCommandsJS = {
      'formatCode': getMessage('Format Code'),
      'showDocs': getMessage('Show Description')
    };
    jvarAccessKey = jvarAccessKey.replace('CTRL', 'Ctrl').replace('SHIFT', 'Shift').replace('OPT', 'Alt').replace('ALT', 'Alt').replace(' + ', '-');
    CodeMirror.extraKeyMap = {
      'showKeyMap': jvarAccessKey + '-H',
      'fullScreen': 'Ctrl-M',
      'find': jvarAccessKey + '-F',
      'findNext': jvarAccessKey + '-G',
      'findPrev': jvarAccessKey + '-Shift-G',
      'replace': jvarAccessKey + '-E',
      'replaceAll': jvarAccessKey + '-;',
      'commentSelection': jvarAccessKey + '-/',
      'autoComplete': 'Ctrl-Space'
    };
    var extraKeys = {};
    extraKeys[CodeMirror.extraKeyMap['showKeyMap']] = function(editor) {
      self.showKeyMap(editor);
    };
    extraKeys[CodeMirror.extraKeyMap['fullScreen']] = function(editor) {
      self.fullScreen(editor, id);
    };
    extraKeys[CodeMirror.extraKeyMap['commentSelection']] = function(editor) {
      self.commentSelection(editor);
    };
    extraKeys[CodeMirror.extraKeyMap['find']] = function(editor) {
      CodeMirror.commands['find'](editor);
    };
    extraKeys[CodeMirror.extraKeyMap['findNext']] = function(editor) {
      CodeMirror.commands['findNext'](editor);
    };
    extraKeys[CodeMirror.extraKeyMap['findPrev']] = function(editor) {
      CodeMirror.commands['findPrev'](editor);
    };
    extraKeys[CodeMirror.extraKeyMap['replace']] = function(editor) {
      CodeMirror.commands['replace'](editor);
    };
    extraKeys[CodeMirror.extraKeyMap['replaceAll']] = function(editor) {
      CodeMirror.commands['replaceAll'](editor);
    };
    extraKeys['Tab'] = function(editor) {
      self._getMacro(editor, self.macros);
    };
    if (isJavaScript) {
      CodeMirror.extraKeyMap['showDocs'] = jvarAccessKey + '-J';
      if (typeof(Worker) === "undefined") {
        delete CodeMirror.extraCommandsJS['autoComplete'];
        delete CodeMirror.extraCommandsJS['showDocs'];
      }
      if (options.readOnly) {
        delete CodeMirror.extraCommands['commentSelection'];
        delete CodeMirror.extraCommands['replace'];
        delete CodeMirror.extraCommands['replaceAll'];
        delete CodeMirror.extraCommandsJS['formatCode'];
        delete CodeMirror.extraCommandsJS['autoComplete'];
      }
      if (!isReadOnly && webWorker && codeComplete) {
        extraKeys[CodeMirror.extraKeyMap['autoComplete']] = function(cm) {
          server.complete(cm, server);
        };
      }
      extraKeys[CodeMirror.extraKeyMap['showDocs']] = function(cm) {
        server.showDocs(cm);
        setTimeout(function() {
          if ($$('div.CodeMirror-Tern-tooltip')[0])
            $$('div.CodeMirror-Tern-tooltip')[0].show();
        }, 100);
      };
    }
    var cmStyle = isReadOnly ? 'snc_readonly' : 'snc';
    this.options = Object.extend({
      indentUnit: 4,
      softTabs: true,
      theme: cmStyle,
      height: el.getHeight(),
      lineWrapping: true,
      onGutterClick: self.foldCode,
      matchBrackets: true,
      indentWithTabs: true,
      matchTags: {
        bothTags: true
      },
      readOnly: !isReadOnly,
      styleActiveLine: true,
      extraKeys: extraKeys,
      viewportMargin: 10
    }, options || {});
    var ed = this.editor = CodeMirror.fromTextArea(el, this.options);
    if (this.options.mode === 'xml')
      this.editor.doc.mode.electricInput = /<\//;
    this.editor.on('mousedown', function(cm, event) {
      var osKeyFlag = event.metaKey;
      if ('Ctrl'.indexOf(jvarAccessKey) === 0)
        osKeyFlag = event.ctrlKey;
      if (osKeyFlag && event.altKey)
        event.altKey = false;
      else if (osKeyFlag === true)
        event.preventDefault();
    });
    if (!isReadOnly && isJavaScript && webWorker && codeComplete) {
      this.editor.on('cursorActivity', function(cm) {
        server.updateArgHints(cm, server);
      });
      this.editor.on('startCompletion', function(cm) {
        self.codeCompleteHandler(cm);
      });
      this.editor.on('scroll', function() {
        if ($$('div.CodeMirror-Tern-tooltip')[0])
          $$('div.CodeMirror-Tern-tooltip')[0].hide();
      });
      var cmVariables = $(id).next('.CodeMirror');
      var shiftKey = false;
      cmVariables.onkeydown = function(event) {
        shiftKey = event.shiftKey;
      };
      cmVariables.onkeyup = function(event) {
        var ternToolTip = $$('div.CodeMirror-Tern-tooltip')[0];
        var keyCode = ('which' in event) ? event.which : event.keyCode;
        if (keyCode == 190)
          if (event.shiftKey || shiftKey)
            return;
          else {
            if (self.editor && self.editor.getTokenAt(self.editor.getCursor()).type == 'string')
              return;
            var cm = this.CodeMirror.glideEditor.editor;
            server.complete(cm, server);
          }
        if (keyCode == 57 && window.event.shiftKey && ternToolTip)
          ternToolTip.show();
        if (keyCode == 27 && ternToolTip)
          ternToolTip.hide();
      };
    }
    if (el.form && this.editor.options.mode == 'javascript')
      addOnSubmitEvent(el.form, function() {
        if (this.textAreaMode)
          this.editor.setValue(this.editor.getTextArea().value);
        this.editor.save();
      }.bind(this));
    this.editor.on('change', function(i) {
      i.glideEditor._onTextChange(i.glideEditor);
      i.save();
    });
    this.editor.on('codemirror_hint_pick', function(i) {
      var data = i.data.data;
      var editor = i.editor;
      var cur = editor.getCursor();
      var token = data.type;
      if (token && token.indexOf('fn(') != -1) {
        if (editor.getTokenAt({
            ch: cur.ch + 1,
            line: cur.line
          }).string != '(') {
          editor.replaceRange('()', {
            line: cur.line,
            ch: cur.ch
          }, {
            line: cur.line,
            ch: cur.ch
          });
          if (token && token.indexOf('fn()') == -1 && $$('div.CodeMirror-Tern-tooltip')[0]) {
            editor.execCommand('goCharLeft');
            setTimeout(function() {
              if ($$('div.CodeMirror-Tern-tooltip')[0])
                $$('div.CodeMirror-Tern-tooltip')[0].show();
            }, 100);
          }
        } else if (token && token.indexOf('fn()') == -1) {
          editor.execCommand('goCharRight');
        }
      }
    });
    this.editor.getTextArea().style.display = 'block';
    this.editor.getTextArea().style.position = 'absolute';
    this.editor.getTextArea().style.top = "-1000000px";
    ed.setHeight = function(height) {};
    this.curLine = this.editor.addLineClass(0, "cm_active_line");
    CustomEvent.observe('textarea.resize', this._onTextAreaResize.bind(this));
    CodeMirror.commands.processTab = function(cm) {
      if (cm.somethingSelected())
        cm.indentSelection("add");
      else
        CodeMirror.commands.insertTab(cm);
    };
    CodeMirror.keyMap.basic['Tab'] = "processTab";
    g_glideEditors[this.id] = this;
    g_glideEditorArray[g_glideEditorArray.length] = this;
    this.editor.glideEditor = this;
    this.textAreaMode = false;
    var form = $(this.id.split('.')[0] + '.form_scroll');
    form.onscroll = function() {
      var ternTip = $$('div.CodeMirror-Tern-tooltip');
      if (ternTip.length == 0)
        return;
      for (var i = 0; i < ternTip.length; i++) {
        ternTip[i].remove();
      }
      var hintBox = $$('ul.CodeMirror-hints')[0];
      if (hintBox)
        hintBox.hide();
      var autoCompleteBox = $$('ul.ui-autocomplete')[0];
      if (autoCompleteBox)
        autoCompleteBox.hide();
    };
    if (g_form.getTableName() == "sys_script" && g_scratchpad.execute_function) {
      var script = '';
      if (g_form.getValue('when') == 'before')
        script = "onBefore(current, previous);";
      if (g_form.getValue('when') == 'after')
        script = "onAfter(current, previous);";
      if (g_form.getValue('when') == 'async')
        script = "onAsync(current);";
      if (g_form.getValue('when') == 'before_display')
        script = "onDisplay(current, {});";
      this.addDocs("businessRule.js", script, server);
    }
    if (linter)
      self.toggleLinter();
    if (g_form.isDisabled(id.split('.')[1])) {
      addAfterPageLoadedEvent(function() {
        g_form.setReadOnly(id.split('.')[1], true);
      });
    }
    CodeMirror.scriptInfo = {
      id: '',
      type: '',
      field: ''
    };
    var tabNextOrPrev = function(goPrevious) {
      var selectables = jQuery(':tabbable');
      var current = jQuery(':focus');
      var incrementor = goPrevious ? -1 : 1;
      var targetIndex = goPrevious ? selectables.length - 1 : 0;
      if (current.length === 1) {
        var currentIndex = selectables.index(current);
        var updateIndexCondition = goPrevious ? currentIndex > 0 : currentIndex + 1 < selectables.length
        if (updateIndexCondition)
          targetIndex = currentIndex + incrementor;
      }
      selectables.eq(targetIndex).focus();
    }
    var tabNext = function() {
      tabNextOrPrev(false);
    }
    var tabPrevious = function() {
      tabNextOrPrev(true);
    }
    this.editor.addKeyMap({
      'Shift-Esc': tabPrevious
    });
    this.editor.addKeyMap({
      'Esc': tabNext
    });
    var ref = this.editor.getTextArea().id;
    jQuery(this.editor.getInputField())
      .attr({
        'aria-describedby': [ref + '_editor-keyboard-trap-help-1', ref + '_editor-keyboard-trap-help-2'].join(' ')
      });
  },
  fullScreen: function(editor, id, exit) {
    var TREE_OFF = 'Tree-Off';
    var TOOL_FULLSCREEN = 'CodeMirror-Toolbar-fullscreen';
    var NONE = 'none';
    var FULLSCREEN = 'fullScreen';
    if (!id) {
      id = editor.glideEditor.id;
    }
    var ie = /MSIE \d/.test(navigator.userAgent);
    if (ie) {
      alert(getMessage('Full Screen mode is not available for IE versions 10 and under'));
      return;
    }
    var inFullScreen = editor.getOption(FULLSCREEN);
    fieldsScriptTree = gel(id + '.fields_script_tree'),
      labelElem = gel('label.' + id),
      columnElem = gel('column.' + id),
      editorElem = gel(id + '.editor.toolbar');
    if (!inFullScreen && !exit) {
      labelElem.appendChild(editorElem);
      labelElem.className += ' ' + TOOL_FULLSCREEN;
      $('js_editor_true.' + id).hide();
      editor.setOption(FULLSCREEN, !inFullScreen);
      if (fieldsScriptTree) {
        fieldsScriptTree.className = "CodeMirror-Tree-fullscreen well";
        if (fieldsScriptTree.parentNode.style.display == NONE) {
          $$('div.CodeMirror-fullscreen')[0].addClassName(TREE_OFF);
        }
      } else {
        $$('div.CodeMirror-fullscreen')[0].addClassName(TREE_OFF);
      }
      if ($$('div.CodeMirror-Tern-tooltip')[0])
        $$('div.CodeMirror-Tern-tooltip').each(Element.hide);
      if ($$('ul.CodeMirror-hints')[0])
        $$('ul.CodeMirror-hints').each(Element.hide);
    } else {
      if (fieldsScriptTree) {
        fieldsScriptTree.className = 'well script_tree';
        if (fieldsScriptTree.parentNode.style.display == NONE) {
          $$('div.CodeMirror-fullscreen')[0].removeClassName(TREE_OFF);
        }
      } else {
        $$('div.CodeMirror-fullscreen')[0].removeClassName(TREE_OFF);
      }
      editor.setOption(FULLSCREEN, false);
      columnElem.appendChild(editorElem);
      labelElem.className = labelElem.className.replace(' ' + TOOL_FULLSCREEN, "");
      editor.setHeight($(id).getHeight() + "px");
      $('js_editor_true.' + id).show();
      if ($$('div.CodeMirror-Tern-tooltip')[0])
        $$('div.CodeMirror-Tern-tooltip').each(Element.hide);
      if ($$('ul.CodeMirror-hints')[0])
        $$('ul.CodeMirror-hints').each(Element.hide);
    }
  },
  showKeyMap: function(editor) {
    var isJavaScript = editor.options.mode == "javascript";
    var dialog = new GlideModal('cm_key_map');
    dialog.setTitle('Editor Key Map');
    dialog.setWidth(400);
    var bodyText = '<style>td {padding-right: 5px;}</style><table style="margin-left: 5px">';
    var shortCut;
    for (var key in CodeMirror.extraCommands) {
      shortCut = CodeMirror.extraKeyMap[key];
      if (!shortCut)
        continue;
      shortCut = shortCut.replace(/\-/g, '+');
      bodyText += '<tr><td><li>' + CodeMirror.extraCommands[key] + '</li></td><td><b>' + shortCut + '</b></td></tr>';
    }
    if (isJavaScript) {
      for (var key in CodeMirror.extraCommandsJS) {
        shortCut = CodeMirror.extraKeyMap[key];
        if (!shortCut)
          continue;
        shortCut = shortCut.replace(/\-/g, '+');
        bodyText += '<tr><td><li>' + CodeMirror.extraCommandsJS[key] + '</li></td><td><b>' + shortCut + '</b></td></tr>';
      }
    }
    if (editor.options.enableMacros) {
      bodyText += "</table><hr><b>Macros:</b> Type help and hit TAB to view the list of macros";
    }
    dialog.setBody(bodyText);
  },
  commentSelection: function(editor) {
    var fromCursor = editor.getCursor('from');
    var toCursor = editor.getCursor('to');
    if (editor.somethingSelected()) {
      if (this._shouldToggleComment(editor, fromCursor.line, toCursor.line, true)) {
        editor.lineComment(fromCursor, toCursor);
        var fromCh = fromCursor.ch == 0 ? 0 : fromCursor.ch + 3;
        var toCh = toCursor.ch == 0 ? 0 : toCursor.ch + 3;
        editor.setSelection({
          line: fromCursor.line,
          ch: fromCh
        }, {
          line: toCursor.line,
          ch: toCh
        });
      } else if (this._shouldToggleComment(editor, fromCursor.line, toCursor.line, false)) {
        editor.uncomment(fromCursor, toCursor);
      }
      editor.focus();
      return;
    }
    if (editor.getLine(fromCursor.line).trim().startsWith("//")) {
      editor.uncomment(fromCursor, toCursor);
      editor.focus();
      return;
    }
    editor.lineComment(fromCursor, toCursor);
    editor.focus();
  },
  _shouldToggleComment: function(editor, fromLine, toLine, isComment) {
    var anchorLine = editor.getCursor('anchor').line;
    var headLine = editor.getCursor('head').line;
    if (anchorLine > headLine)
      toLine++;
    for (var i = fromLine; i < toLine; i++) {
      if (editor.getLine(i).blank())
        continue;
      if (isComment && !editor.getLine(i).trim().startsWith("//"))
        return true;
      if (!isComment && editor.getLine(i).trim().startsWith("//"))
        return true;
    }
    return false;
  },
  _format: function(editor, txt) {
    var oneLineIndent = false;
    var spacesForTab = "\t";
    var indentWithTabs = this.editor.getOption('indentWithTabs');
    if (!indentWithTabs) {
      var indent = this.editor.getOption('indentUnit');
      spacesForTab = new Array(indent + 1).join(' ');
    }
    var spacesLen = spacesForTab.length;
    var lines = txt.split("\n");
    var indentSpaces = "";
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/^\s+|\s+$/g, "");
      line = line + '';
      if (line.startsWith("}")) {
        if (indentSpaces.length >= spacesLen) {
          indentSpaces = indentSpaces.substring(0, indentSpaces.length - spacesLen);
        }
      }
      if (line.startsWith('*'))
        lines[i] = " " + indentSpaces + line;
      else
        lines[i] = indentSpaces + line;
      if (oneLineIndent) {
        oneLineIndent = false;
        indentSpaces = indentSpaces.substring(0, indentSpaces.length - spacesLen);
      }
      if (line.endsWith("{")) {
        indentSpaces += spacesForTab;
      } else if (line.startsWith("if") || line.startsWith("else") || line.startsWith("for") || line.startsWith("while")) {
        indentSpaces += spacesForTab;
        oneLineIndent = true;
      }
    }
    return lines.join("\n");
  },
  _hideEditor: function() {
    this.editor.getTextArea().style.position = "";
    this.editor.getTextArea().style.top = 0;
    this.editor.save();
    this.editor.getWrapperElement().style.display = 'none';
    this.editor.getTextArea().style.display = "";
    $(this.id + ".editor.toolbar").style.display = "none";
    $(this.id + ".editor.toolbar.instructional.info").style.display = "none";
    $(this.id + ".noeditor.toolbar").style.display = '';
    $("go_to_script." + this.id).style.visibility = "";
    $("go_to_script." + this.id).style.display = "";
    this.textAreaMode = true;
  },
  _showEditor: function() {
    this.editor.getWrapperElement().style.display = "";
    this.editor.getTextArea().style.position = 'absolute';
    this.editor.getTextArea().style.top = "-1000000px";
    this.editor.setValue(this.editor.getTextArea().value);
    $(this.id + ".noeditor.toolbar").style.display = 'none';
    $(this.id + ".editor.toolbar").style.display = "";
    $(this.id + ".editor.toolbar.instructional.info").style.display = "";
    this.textAreaMode = false;
  },
  _onTextChange: function(ge) {
    if (!ge.editor)
      return;
    var el = $(ge.id);
    var value = ge.editor.getValue();
    if (el.changed) {
      if (value === ge.originalValue)
        ge._clearModified(el);
    } else {
      if (!el.changed && (ge.editor.getValue() !== ge.originalValue)) {
        ge._setModified(el);
      }
    }
    onChangeLabelProcess(ge.id);
    fieldChanged(ge.id, el.changed);
  },
  _onTextAreaResize: function(id) {
    if (id !== this.id)
      return;
    this.editor.setHeight($(id).getHeight() + "px");
    this.editor.focus();
  },
  _clearModified: function(el) {
    el.changed = false;
    var original = $$('input.' + this.id.replace('.', '_') + '_editor_original_input');
    if (original[0] && original[0].value != "XXmultiChangeXX")
      original[0].value = this.originalValue;
  },
  _setModified: function(el) {
    var form = el.up('form');
    if (!form)
      return;
    var original = $$('input.' + this.id.replace('.', '_') + '_editor_original_input');
    if (original[0] && original[0].value != "XXmultiChangeXX")
      original[0].value = "XXmultiChangeXX";
    if ($('sys_original.' + this.id).getValue() !== $(this.id).getValue())
      el.changed = true;
    onChangeLabelProcess(this.id);
    fieldChanged(this.id, el.changed);
  },
  _initMacros: function() {
    var helpList = [];
    helpList.push("The Syntax Editor macros are:\n-----------------------------");
    var div = $('syntax_macros');
    if (!div)
      return false;
    var macros = div.select("textarea");
    for (var i = 0; i < macros.length; i++) {
      var macro = macros[i];
      this.macros[macro.getAttribute('name') + ''] = this._initMacro(macro.value);
      helpList.push(macro.getAttribute('name') + " - " + macro.getAttribute('comments'));
    }
    var helpMacro = {};
    helpMacro.text = helpList.join("\n");
    this.macros['help'] = helpMacro;
    return macros.length > 0;
  },
  _initMacro: function(text) {
    var lines = text.split('\n');
    var macro = {};
    macro['text'] = text;
    macro['length'] = lines.length;
    macro['curLine'] = -1;
    macro['curCh'] = 0;
    for (var i = 0; i < lines.length; i++) {
      var pos = lines[i].indexOf('$0');
      if (pos == -1)
        continue;
      macro['curLine'] = i;
      macro['curCh'] = pos;
      lines[i] = lines[i].replace(/\$0/, '');
      macro['text'] = lines.join('\n');
    }
    return macro;
  },
  _getMacro: function(editor, macros) {
    var cur = editor.getCursor();
    var token = editor.getTokenAt(cur);
    var m = macros[token.string];
    if (!m) {
      editor.indentSelection("add");
      return undefined;
    }
    var cursor = {
      line: cur.line,
      ch: token.start
    };
    if (m.curLine >= 0) {
      cursor.line += m.curLine;
      if (m.curLine == 0)
        cursor.ch += m.curCh;
      else
        cursor.ch = m.curCh;
    }
    editor.replaceRange(m.text, {
      line: cur.line,
      ch: token.start
    }, {
      line: cur.line,
      ch: token.end
    });
  },
  format: function(txt) {
    return txt;
  },
  toString: function() {
    return 'GlideEditor';
  },
  addDocs: function(name, script, server) {
    var doc = new CodeMirror.Doc(script, "javascript");
    server.addDoc(name, doc);
  },
  codeCompleteHandler: function(editor) {
    var completion = editor.state.completionActive;
    completion.options.completeSingle = false;
    var pick = completion.pick;
    completion.pick = function(data, i) {
      var completion = data.list[i];
      CodeMirror.signal(editor, "codemirror_hint_pick", {
        data: completion,
        editor: editor
      });
      pick.apply(this, arguments);
    };
  },
  _launchScriptDebugger: function(id, type, field) {
    var width = window.top.innerWidth - 40,
      height = window.top.innerHeight,
      x = window.top.screenX + 20,
      y = window.top.screenY + 20,
      features = 'width=' + width + ',height=' + height + ',toolbar=no,status=no,directories=no,menubar=no,resizable=yes,screenX=' + x + ',left=' + x + ',screenY=' + y + ',top=' + y;
    var debuggerWind = window.open('', 'sn_ScriptDebugger', features, false),
      prevFullUrl = debuggerWind.location.href,
      reload = false;
    if (prevFullUrl === 'about:blank') {
      try {
        var storedTime = localStorage.getItem('sn_ScriptDebugger'),
          currentTime = new Date().getTime();
        if (storedTime && currentTime - storedTime < 60000) {
          debuggerWind.close();
          localStorage.setItem('sn_ScriptDebuggerExist_ShowNotification', new Date().getTime());
          return;
        }
      } catch (e) {}
      reload = true;
    }
    var url = '$jsdebugger.do?scriptId=' + id + '&scriptType=' + type + '&scriptField=' + field + '&sysparm_nostack=true';
    if (!reload) {
      var prevUrl = prevFullUrl.slice(prevFullUrl.indexOf('$jsdebugger.do'));
      if (prevUrl != url) {
        reload = true;
      }
    }
    if (reload) {
      debuggerWind = window.open(url, 'sn_ScriptDebugger', features, false);
    }
    debuggerWind.focus();
    debuggerWind.setTimeout(focus, 100);
  },
  scriptDebugger: function(editor) {
    var launchFunction;
    if (window.top.launchScriptDebugger) {
      launchFunction = window.top.launchScriptDebugger;
    } else if (window.top.opener && window.top.opener.top.launchScriptDebugger) {
      launchFunction = window.top.opener.top.launchScriptDebugger;
    } else {
      launchFunction = this._launchScriptDebugger;
    }
    launchFunction(CodeMirror.scriptInfo.id, CodeMirror.scriptInfo.type, CodeMirror.scriptInfo.field);
  }
});
GlideEditor.get = function(id) {
  return g_glideEditors[id];
};
GlideEditor.getAll = function() {
  return g_glideEditorArray;
};;
/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditorJS.js */
var GlideEditorJS = Class.create(GlideEditor, {
  initialize: function($super, id, options, jvarAccessKey, isReadOnly, apiJSON, linter, codeComplete, breakpoints, eslintConfig, showContextMenu, contextMenuData) {
    try {
      eslintConfig = JSON.parse(eslintConfig);
    } catch (e) {
      eslintConfig = {};
    }
    options = Object.extend({
      mode: 'javascript',
      lineNumbers: true,
      enableMacros: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      autoCloseBrackets: true,
      eslintConfig: eslintConfig
    }, options || {});
    jvarAccessKey = jvarAccessKey.replace('CTRL', 'Ctrl').replace('SHIFT', 'Shift').replace('OPT', 'Alt').replace('ALT', 'Alt').replace(' + ', '-');
    $super(id, options, jvarAccessKey, isReadOnly, apiJSON, linter, codeComplete);
    if (breakpoints) {
      GlideEditorJSBreakpoints.init(id, this.editor);
    }
    if (showContextMenu === 'true' && typeof discover !== 'undefined') {
      var self = this;
      var contextMenuInfo = contextMenuData ? JSON.parse(contextMenuData) : '';
      var apiDocResourceIds = contextMenuInfo.apiDocResourceIds;
      discover.storeCache(contextMenuInfo.flushTime, this.editor, function(editorObj, result) {
        if (!editorObj || !result)
          return;
        if (result.type === 'error')
          console.error(result.error);
        else
          discoverContextMenuTokens(editorObj);
      });
      var discoverContextMenuTokens = function(ed) {
        var updateEditor = function(editorObj, result) {
          if (!editorObj || !result)
            return;
          var tokens = result.tokens;
          editorObj.getAllMarks().forEach(function(marker) {
            marker.clear();
          });
          for (var i = 0; i < tokens.length; i++)
            for (var j = 0; j < tokens[i].length; j++) {
              var discoverableToken = tokens[i][j];
              editorObj.markText({
                line: discoverableToken.token.line,
                ch: discoverableToken.token.start
              }, {
                line: discoverableToken.token.line,
                ch: discoverableToken.token.end
              }, {
                className: "discoverable-text " + (discoverableToken.type + '-' + discoverableToken.key)
              });
            }
        };
        var lines = [];
        var lineCount = ed.lineCount();
        for (var i = 0; i < lineCount; i++) {
          var lineTokens = ed.getLineTokens(i);
          lines[lines.length] = lineTokens.map(function(item) {
            return {
              line: i,
              start: item.start,
              end: item.end,
              string: item.string,
              type: item.type
            };
          });
        }
        if (lines.length > 0)
          discover.discoverTokens(lines, apiDocResourceIds, {
            currentScope: g_scratchpad.scope
          }, ed, updateEditor);
      };
      var showEditorContext = function(event, literal) {
        event.preventDefault();
        return GlideEditorContextMenu.showEditorContext(event, literal);
      };
      var getDiscoveredLiteral = function(elem) {
        var elemClassList = elem.classList;
        if (elemClassList.contains('discoverable-text')) {
          var type, key;
          var name = elem.innerText.replace(/'|"/g, "");
          var listLength = elemClassList.length;
          for (var i = 0; i < listLength; i++) {
            var className = elemClassList.item(i);
            if (className.startsWith('scriptInclude')) {
              type = "sys_script_include";
              key = className.substring(className.indexOf('-') + 1);
            }
            if (className.startsWith('dbObject')) {
              type = "sys_db_object";
              key = className.substring(className.indexOf('-') + 1);
            }
            if (className.startsWith('glideApi')) {
              type = "api";
              key = className.substring(className.indexOf('-') + 1);
            }
          }
          if (!!key && !!type && !!name)
            return {
              type: type,
              key: key,
              name: name
            };
        }
        return;
      };
      this.editor.on('changes', discoverContextMenuTokens);
      this.editor.on('mousedown', function(cm, event) {
        var osKeyFlag = event.metaKey;
        if ('Ctrl'.indexOf(jvarAccessKey) === 0)
          osKeyFlag = event.ctrlKey;
        if (osKeyFlag && event.which == '1') {
          var literal = getDiscoveredLiteral(event.target);
          if (literal)
            GlideEditorContextMenu.openDefinitionTab(literal);
        }
      });
      this.editor.getWrapperElement().oncontextmenu = function(event) {
        if (self.editor.getSelection())
          return true;
        var literal = getDiscoveredLiteral(event.target);
        if (literal)
          return showEditorContext(event, literal);
        return false;
      };
    }
  },
  formatCode: function(editor) {
    editor.format_code(editor.somethingSelected(), {
      indent_size: editor.getOption('indentUnit')
    });
    const format_code_option = "format_code";
    let format_code_value = editor.getOption(format_code_option);
    editor.setOption("format_code", format_code_value ? 1 : format_code_value++);
  },
  changeJsEditorPreference: function(value) {
    var opposite;
    if (value == "true")
      opposite = "false";
    else if (value == "false")
      opposite = "true";
    else
      return;
    setPreference("glide.ui.javascript_editor", value);
    if (value == "false") {
      this._hideEditor();
    } else {
      this._showEditor();
    }
    var toggleElementShow = gel("js_editor_" + value + "." + this.id);
    var toggleElementHide = gel("js_editor_" + opposite + "." + this.id);
    showObjectInline(toggleElementShow);
    hideObject(toggleElementHide);
  },
  _setErrorText: function(msg) {
    var d = $(this.id + ".lint");
    var tr = $(this.id + ".lint.tr");
    d.innerHTML = msg;
    if (msg != '') {
      tr.style.display = "";
    } else {
      tr.style.display = "none";
    }
  },
  toString: function() {
    return 'GlideEditorJS';
  },
  toggleLinter: function() {
    if (typeof(Worker) === 'undefined' || typeof linter === 'undefined')
      return;
    var self = this;
    if (self.editor.getOption('lint'))
      turnOffLinting();
    else
      turnOnLinting();

    function turnOnLinting() {
      var eslintConfig = self.editor.getOption("eslintConfig");
      self.editor.setOption('gutters', ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter']);
      self.editor.setOption('lint', {
        es3: true,
        rhino: true,
        async: true,
        getAnnotations: lint,
        eslintConfig: eslintConfig,
        onUpdateLinting: handleResults
      });
    }

    function turnOffLinting() {
      self.editor.setOption('lint', false);
      self.editor.setOption('gutters', ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']);
    }

    function lint() {
      return linter.validate.apply(this, arguments);
    }

    function handleResults(results) {}
  }
});;
/*! RESOURCE: /scripts/classes/GlideEditorXML.js */
var GlideEditorXML = Class.create(GlideEditor, {
  initialize: function($super, id, options, jvarAccessKey, isReadOnly, apiJSON) {
    var schemaInfo = {};
    var schemaInfoSorted = {};
    if (JSON.parse(apiJSON).jellySchema)
      schemaInfo = Object.extend(JSON.parse(apiJSON).jellySchema, CodeMirror.htmlSchema);
    Object.keys(schemaInfo).sort().forEach(function(key) {
      schemaInfoSorted[key] = schemaInfo[key];
    });
    options = Object.extend({
      mode: 'xml',
      lineNumbers: true,
      enableMacros: false,
      extraKeys: {
        "Ctrl-Space": "autocomplete"
      },
      hintOptions: {
        schemaInfo: schemaInfoSorted,
        closeCharacters: /[\s()\[\]{};>,]/
      }
    }, options || {});
    $super(id, options, jvarAccessKey, isReadOnly, apiJSON);
    CustomEvent.observe('js_editor.validate', this._onValidate.bind(this));
  },
  formatCode: function(editor) {
    editor.focus();
    return;
  },
  commentSelection: function(editor) {
    var cursor = editor.getCursor();
    var lineNo = editor.getCursor().line;
    var lineStr = editor.getLine(lineNo);
    if (editor.somethingSelected() && editor.getSelection().trim().startsWith('<!-- ')) {
      editor.replaceSelection(editor.getSelection().replace('<!-- ', '').replace(' -->', ''));
      editor.focus();
      return;
    } else if (lineStr.trim().startsWith('<!-- ')) {
      editor.replaceRange(lineStr.replace('<!-- ', '').replace(' -->', ''), CodeMirror.Pos(lineNo, 0), CodeMirror.Pos(lineNo, lineStr.length));
      editor.setCursor({
        line: cursor.line,
        ch: cursor.ch - 5
      });
      editor.focus();
      return;
    }
    if (editor.somethingSelected()) {
      editor.replaceSelection("<!-- " + editor.getSelection() + " -->");
    } else {
      editor.replaceRange("<!-- " + lineStr + " -->", CodeMirror.Pos(lineNo, 0), CodeMirror.Pos(lineNo, lineStr.length));
      editor.setCursor({
        line: cursor.line,
        ch: cursor.ch + 2
      });
    }
    editor.focus();
  },
  _onValidate: function(id, autoValidation) {
    if (id !== this.id)
      return 0;
    return 0;
  },
  changeJsEditorPreference: function(value) {
    var opposite;
    if (value == "true")
      opposite = "false"
    else if (value == "false")
      opposite = "true";
    else
      return;
    setPreference("glide.ui.javascript_editor", value);
    if (value == "false") {
      this._hideEditor();
    } else {
      this._showEditor();
    }
    var toggleElementShow = gel("js_editor_" + value + "." + this.id);
    var toggleElementHide = gel("js_editor_" + opposite + "." + this.id);
    showObjectInline(toggleElementShow);
    hideObject(toggleElementHide);
  },
  toString: function() {
    return 'GlideEditorXML';
  }
});;
/*! RESOURCE: /scripts/classes/syntax_editor5/CodeMirrorTextAreaElement.js */
var CodeMirrorTextAreaElement = Class.create({
  initialize: function(name) {
    this.name = name;
    this.elem = document.getElementById(this.name);
    if (typeof window.textareaResize === "function")
      textareaResize(this.name);
    this.setAria();
  },
  setReadOnly: function(disabled) {
    gel(this.name).disabled = disabled;
    var cmName = this.name;
    var cmEditor = $(cmName).parentNode;
    var cmStyle = disabled ? "snc_readonly" : "snc";
    var DISABLED = "disabled";
    var gEditor = GlideEditor.get(cmName);
    var formatCode = cmName + ".formatCode";
    var toggleLinter = cmName + ".toggleLinter";
    var replace = cmName + ".replace";
    var replaceAll = cmName + ".replaceAll";
    var save = cmName + ".save";
    var gTreeButton = $(cmName + ".scriptTreeToggleImage");
    var gTree = $(cmName + ".fields_script_tree");
    gEditor.editor.setOption("readOnly", disabled);
    gEditor.editor.setOption("theme", cmStyle);
    if (disabled) {
      if (gEditor.options.mode == "javascript") {
        $(formatCode).addClassName(DISABLED);
        $(toggleLinter).addClassName(DISABLED);
        this.codeCompleteFunction = gEditor.options.extraKeys['Ctrl-Space'];
        gEditor.options.extraKeys['Ctrl-Space'] = '';
        if (gTreeButton) {
          gTreeButton.hide();
          cmEditor.addClassName("col-lg-12");
        }
        if (gTree)
          gTree.hide();
      }
      $(replace).addClassName(DISABLED);
      $(replaceAll).addClassName(DISABLED);
      $(save).addClassName(DISABLED);
    } else {
      if (gEditor.options.mode == "javascript") {
        $(formatCode).removeClassName(DISABLED);
        $(toggleLinter).removeClassName(DISABLED);
        gEditor.options.extraKeys['Ctrl-Space'] = this.codeCompleteFunction;
        if (gTreeButton) {
          gTreeButton.show();
          cmEditor.removeClassName("col-lg-12");
        }
        if (gTree)
          gTree.show();
      }
      $(replace).removeClassName(DISABLED);
      $(replaceAll).removeClassName(DISABLED);
      $(save).removeClassName(DISABLED);
    }
  },
  isDisabled: function() {
    return GlideEditor.get(this.name).editor.getOption("readOnly");
  },
  isReadOnly: function() {
    return GlideEditor.get(this.name).editor.getOption("readOnly");
  },
  getValue: function() {
    return GlideEditor.get(this.name).editor.getValue();
  },
  setValue: function(newValue) {
    GlideEditor.get(this.name).editor.setValue(newValue);
    onChange(this.name);
    if (typeof window.jQuery === "function") {
      $j(this.elem)
        .trigger("autosize.resize");
    }
  },
  isVisible: function() {
    return true;
  },
  setAria: function() {
    var scriptTextArea = this.elem.nextSibling.querySelector('textarea');
    scriptTextArea.setAttribute("aria-labelledby", "label." + this.name);
  },
  type: "CodeMirrorTextAreaElement",
  z: null
});
var CodeMirrorNoScriptTextAreaElement = Class.create({
  initialize: function(name) {
    this.id = name;
    this.elem = document.getElementById(this.id);
    if (typeof window.textareaResize === "function")
      textareaResize(this.id);
  },
  setValue: function(newValue) {
    if (newValue == " XXmultiChangeXX")
      newValue = '';
    if (typeof window.jQuery === "function") {
      $j(this.elem)
        .val(newValue)
        .trigger("autosize.resize");
    } else {
      $(this.elem).setValue(newValue);
    }
    onChange(this.id);
  },
  type: "CodeMirrorNoScriptTextAreaElement",
  z: null
});;
/*! RESOURCE: /scripts/classes/syntax_editor2/jshint.js */
var JSHINT = (function() {
  "use strict";
  var anonname,
    bang = {
      '<': true,
      '<=': true,
      '==': true,
      '===': true,
      '!==': true,
      '!=': true,
      '>': true,
      '>=': true,
      '+': true,
      '-': true,
      '*': true,
      '/': true,
      '%': true
    },
    boolOptions = {
      asi: true,
      bitwise: true,
      boss: true,
      browser: true,
      couch: true,
      curly: true,
      debug: true,
      devel: true,
      eqeqeq: true,
      eqnull: true,
      es5: true,
      evil: true,
      expr: true,
      forin: true,
      globalstrict: true,
      immed: true,
      jquery: true,
      latedef: true,
      laxbreak: true,
      loopfunc: true,
      mootools: true,
      newcap: true,
      noarg: true,
      node: true,
      noempty: true,
      nonew: true,
      nomen: true,
      onevar: true,
      passfail: true,
      plusplus: true,
      prototypejs: true,
      regexp: true,
      rhino: true,
      undef: true,
      shadow: true,
      strict: true,
      sub: true,
      supernew: true,
      white: true,
      wsh: true,
      poorRelation: true,
      namefunc: true
    },
    browser = {
      ArrayBuffer: false,
      ArrayBufferView: false,
      addEventListener: false,
      applicationCache: false,
      blur: false,
      clearInterval: false,
      clearTimeout: false,
      close: false,
      closed: false,
      DataView: false,
      defaultStatus: false,
      document: false,
      event: false,
      FileReader: false,
      Float32Array: false,
      Float64Array: false,
      focus: false,
      frames: false,
      getComputedStyle: false,
      HTMLElement: false,
      history: false,
      Int16Array: false,
      Int32Array: false,
      Int8Array: false,
      Image: false,
      length: false,
      localStorage: false,
      location: false,
      moveBy: false,
      moveTo: false,
      name: false,
      navigator: false,
      onbeforeunload: true,
      onblur: true,
      onerror: true,
      onfocus: true,
      onload: true,
      onresize: true,
      onunload: true,
      open: false,
      openDatabase: false,
      opener: false,
      Option: false,
      parent: false,
      print: false,
      removeEventListener: false,
      resizeBy: false,
      resizeTo: false,
      screen: false,
      scroll: false,
      scrollBy: false,
      scrollTo: false,
      setInterval: false,
      setTimeout: false,
      status: false,
      top: false,
      Uint16Array: false,
      Uint32Array: false,
      Uint8Array: false,
      WebSocket: false,
      window: false,
      Worker: false,
      XMLHttpRequest: false,
      XPathEvaluator: false,
      XPathException: false,
      XPathExpression: false,
      XPathNamespace: false,
      XPathNSResolver: false,
      XPathResult: false
    },
    couch = {
      "require": false,
      respond: false,
      getRow: false,
      emit: false,
      send: false,
      start: false,
      sum: false,
      log: false,
      exports: false,
      module: false
    },
    devel = {
      alert: false,
      confirm: false,
      console: false,
      Debug: false,
      opera: false,
      prompt: false
    },
    escapes = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '/': '\\/',
      '\\': '\\\\'
    },
    funct,
    functionicity = [
      'closure', 'exception', 'global', 'label',
      'outer', 'unused', 'var'
    ],
    functions,
    global,
    implied,
    inblock,
    indent,
    jsonmode,
    jquery = {
      '$': false,
      jQuery: false
    },
    lines,
    lookahead,
    member,
    membersOnly,
    mootools = {
      '$': false,
      '$$': false,
      Assets: false,
      Browser: false,
      Chain: false,
      Class: false,
      Color: false,
      Cookie: false,
      Core: false,
      Document: false,
      DomReady: false,
      DOMReady: false,
      Drag: false,
      Element: false,
      Elements: false,
      Event: false,
      Events: false,
      Fx: false,
      Group: false,
      Hash: false,
      HtmlTable: false,
      Iframe: false,
      IframeShim: false,
      InputValidator: false,
      instanceOf: false,
      Keyboard: false,
      Locale: false,
      Mask: false,
      MooTools: false,
      Native: false,
      Options: false,
      OverText: false,
      Request: false,
      Scroller: false,
      Slick: false,
      Slider: false,
      Sortables: false,
      Spinner: false,
      Swiff: false,
      Tips: false,
      Type: false,
      typeOf: false,
      URI: false,
      Window: false
    },
    nexttoken,
    node = {
      __filename: false,
      __dirname: false,
      exports: false,
      Buffer: false,
      GLOBAL: false,
      global: false,
      module: false,
      process: false,
      require: false
    },
    noreach,
    option,
    predefined,
    prereg,
    prevtoken,
    prototypejs = {
      '$': false,
      '$$': false,
      '$A': false,
      '$F': false,
      '$H': false,
      '$R': false,
      '$break': false,
      '$continue': false,
      '$w': false,
      Abstract: false,
      Ajax: false,
      Class: false,
      Enumerable: false,
      Element: false,
      Event: false,
      Field: false,
      Form: false,
      Hash: false,
      Insertion: false,
      ObjectRange: false,
      PeriodicalExecuter: false,
      Position: false,
      Prototype: false,
      Selector: false,
      Template: false,
      Toggle: false,
      Try: false,
      Autocompleter: false,
      Builder: false,
      Control: false,
      Draggable: false,
      Draggables: false,
      Droppables: false,
      Effect: false,
      Sortable: false,
      SortableObserver: false,
      Sound: false,
      Scriptaculous: false
    },
    rhino = {
      defineClass: false,
      deserialize: false,
      gc: false,
      help: false,
      load: false,
      loadClass: false,
      print: false,
      quit: false,
      readFile: false,
      readUrl: false,
      runCommand: false,
      seal: false,
      serialize: false,
      spawn: false,
      sync: false,
      toint32: false,
      version: false
    },
    scope,
    src,
    stack,
    standard = {
      Array: false,
      Boolean: false,
      Date: false,
      decodeURI: false,
      decodeURIComponent: false,
      encodeURI: false,
      encodeURIComponent: false,
      Error: false,
      'eval': false,
      EvalError: false,
      Function: false,
      hasOwnProperty: false,
      isFinite: false,
      isNaN: false,
      JSON: false,
      Math: false,
      Number: false,
      Object: false,
      parseInt: false,
      parseFloat: false,
      RangeError: false,
      ReferenceError: false,
      RegExp: false,
      String: false,
      SyntaxError: false,
      TypeError: false,
      URIError: false
    },
    standard_member = {
      E: true,
      LN2: true,
      LN10: true,
      LOG2E: true,
      LOG10E: true,
      MAX_VALUE: true,
      MIN_VALUE: true,
      NEGATIVE_INFINITY: true,
      PI: true,
      POSITIVE_INFINITY: true,
      SQRT1_2: true,
      SQRT2: true
    },
    strict_mode,
    syntax = {},
    tab,
    token,
    urls,
    warnings,
    wsh = {
      ActiveXObject: true,
      Enumerator: true,
      GetObject: true,
      ScriptEngine: true,
      ScriptEngineBuildVersion: true,
      ScriptEngineMajorVersion: true,
      ScriptEngineMinorVersion: true,
      VBArray: true,
      WSH: true,
      WScript: true
    },
    ax = /@cc|<\/?|script|\]\s*\]|<\s*!|&lt/i,
    cx = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/,
    tx = /^\s*([(){}\[.,:;'"~\?\]#@]|==?=?|\/(\*(jshint|jslint|members?|global)?|=|\/)?|\*[\/=]?|\+(?:=|\++)?|-(?:=|-+)?|%=?|&[&=]?|\|[|=]?|>>?>?=?|<([\/=!]|\!(\[|--)?|<=?)?|\^=?|\!=?=?|[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+([xX][0-9a-fA-F]+|\.[0-9]*)?([eE][+\-]?[0-9]+)?)/,
    nx = /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/,
    nxg = /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    lx = /\*\/|\/\*/,
    ix = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/,
    jx = /^(?:javascript|jscript|ecmascript|vbscript|mocha|livescript)\s*:/i,
    ft = /^\s*\/\*\s*falls\sthrough\s*\*\/\s*$/;

  function F() {}

  function is_own(object, name) {
    return Object.prototype.hasOwnProperty.call(object, name);
  }
  if (typeof Array.isArray !== 'function') {
    Array.isArray = function(o) {
      return Object.prototype.toString.apply(o) === '[object Array]';
    };
  }
  if (typeof Object.create !== 'function') {
    Object.create = function(o) {
      F.prototype = o;
      return new F();
    };
  }
  if (typeof Object.keys !== 'function') {
    Object.keys = function(o) {
      var a = [],
        k;
      for (k in o) {
        if (is_own(o, k)) {
          a.push(k);
        }
      }
      return a;
    };
  }
  if (typeof String.prototype.entityify !== 'function') {
    String.prototype.entityify = function() {
      return this
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };
  }
  if (typeof String.prototype.isAlpha !== 'function') {
    String.prototype.isAlpha = function() {
      return (this >= 'a' && this <= 'z\uffff') ||
        (this >= 'A' && this <= 'Z\uffff');
    };
  }
  if (typeof String.prototype.isDigit !== 'function') {
    String.prototype.isDigit = function() {
      return (this >= '0' && this <= '9');
    };
  }
  if (typeof String.prototype.supplant !== 'function') {
    String.prototype.supplant = function(o) {
      return this.replace(/\{([^{}]*)\}/g, function(a, b) {
        var r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      });
    };
  }
  if (typeof String.prototype.name !== 'function') {
    String.prototype.name = function() {
      if (ix.test(this)) {
        return this;
      }
      if (nx.test(this)) {
        return '"' + this.replace(nxg, function(a) {
          var c = escapes[a];
          if (c) {
            return c;
          }
          return '\\u' + ('0000' + a.charCodeAt().toString(16)).slice(-4);
        }) + '"';
      }
      return '"' + this + '"';
    };
  }

  function combine(t, o) {
    var n;
    for (n in o) {
      if (is_own(o, n)) {
        t[n] = o[n];
      }
    }
  }

  function assume() {
    if (option.couch)
      combine(predefined, couch);
    if (option.rhino)
      combine(predefined, rhino);
    if (option.prototypejs)
      combine(predefined, prototypejs);
    if (option.node)
      combine(predefined, node);
    if (option.devel)
      combine(predefined, devel);
    if (option.browser)
      combine(predefined, browser);
    if (option.jquery)
      combine(predefined, jquery);
    if (option.mootools)
      combine(predefined, mootools);
    if (option.wsh)
      combine(predefined, wsh);
    if (option.globalstrict)
      option.strict = true;
  }

  function quit(message, line, chr) {
    var percentage = Math.floor((line / lines.length) * 100);
    throw {
      name: 'JSHintError',
      line: line,
      character: chr,
      message: message + " (" + percentage + "% scanned)."
    };
  }

  function warning(m, t, a, b, c, d, type) {
    var ch, l, w;
    t = t || nexttoken;
    if (t.id === '(end)') {
      t = token;
    }
    l = t.line || 0;
    ch = t.from || 0;
    w = {
      type: type || 'warning',
      id: '(error)',
      raw: m,
      evidence: lines[l - 1] || '',
      line: l,
      character: ch,
      a: a,
      b: b,
      c: c,
      d: d
    };
    w.reason = m.supplant(w);
    JSHINT.errors.push(w);
    if (option.passfail) {
      quit('Stopping. ', l, ch);
    }
    warnings += 1;
    if (warnings >= option.maxerr) {
      quit("Too many errors.", l, ch);
    }
    return w;
  }

  function warningAt(m, l, ch, a, b, c, d) {
    return warning(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }

  function error(m, t, a, b, c, d) {
    var w = warning(m, t, a, b, c, d, 'error');
    quit("Stopping, unable to continue.", w.line, w.character);
  }

  function errorAt(m, l, ch, a, b, c, d) {
    return error(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }
  var lex = (function lex() {
    var character, from, line, s;

    function nextLine() {
      var at,
        tw;
      if (line >= lines.length)
        return false;
      character = 1;
      s = lines[line];
      line += 1;
      at = s.search(/ \t/);
      if (at >= 0)
        warningAt("Mixed spaces and tabs.", line, at + 1);
      s = s.replace(/\t/g, tab);
      at = s.search(cx);
      if (at >= 0)
        warningAt("Unsafe character.", line, at);
      if (option.maxlen && option.maxlen < s.length)
        warningAt("Line too long.", line, s.length);
      tw = s.search(/\s+$/);
      if (option.white && ~tw)
        warningAt("Trailing whitespace.", line, tw);
      return true;
    }

    function it(type, value) {
      var i, t;
      if (type === '(color)' || type === '(range)') {
        t = {
          type: type
        };
      } else if (type === '(punctuator)' ||
        (type === '(identifier)' && is_own(syntax, value))) {
        t = syntax[value] || syntax['(error)'];
      } else {
        t = syntax[type];
      }
      t = Object.create(t);
      if (type === '(string)' || type === '(range)') {
        if (jx.test(value)) {
          warningAt("Script URL.", line, from);
        }
      }
      if (type === '(identifier)') {
        t.identifier = true;
        if (value === '__iterator__' || value === '__proto__') {
          errorAt("Reserved name '{a}'.",
            line, from, value);
        } else if (option.nomen &&
          (value.charAt(0) === '_' ||
            value.charAt(value.length - 1) === '_')) {
          warningAt("Unexpected {a} in '{b}'.", line, from,
            "dangling '_'", value);
        }
      }
      t.value = value;
      t.line = line;
      t.character = character;
      t.from = from;
      i = t.id;
      if (i !== '(endline)') {
        prereg = i &&
          (('(,=:[!&|?{};'.indexOf(i.charAt(i.length - 1)) >= 0) ||
            i === 'return');
      }
      return t;
    }
    return {
      init: function(source) {
        if (typeof source === 'string') {
          lines = source
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n');
        } else {
          lines = source;
        }
        if (lines[0] && lines[0].substr(0, 2) == '#!')
          lines[0] = '';
        line = 0;
        nextLine();
        from = 1;
      },
      range: function(begin, end) {
        var c, value = '';
        from = character;
        if (s.charAt(0) !== begin) {
          errorAt("Expected '{a}' and instead saw '{b}'.",
            line, character, begin, s.charAt(0));
        }
        for (;;) {
          s = s.slice(1);
          character += 1;
          c = s.charAt(0);
          switch (c) {
            case '':
              errorAt("Missing '{a}'.", line, character, c);
              break;
            case end:
              s = s.slice(1);
              character += 1;
              return it('(range)', value);
            case '\\':
              warningAt("Unexpected '{a}'.", line, character, c);
          }
          value += c;
        }
      },
      token: function() {
        var b, c, captures, d, depth, high, i, l, low, q, t;

        function match(x) {
          var r = x.exec(s),
            r1;
          if (r) {
            l = r[0].length;
            r1 = r[1];
            c = r1.charAt(0);
            s = s.substr(l);
            from = character + l - r1.length;
            character += l;
            return r1;
          }
        }

        function string(x) {
          var c, j, r = '';
          if (jsonmode && x !== '"') {
            warningAt("Strings must use doublequote.",
              line, character);
          }

          function esc(n) {
            var i = parseInt(s.substr(j + 1, n), 16);
            j += n;
            if (i >= 32 && i <= 126 &&
              i !== 34 && i !== 92 && i !== 39) {
              warningAt("Unnecessary escapement.", line, character);
            }
            character += n;
            c = String.fromCharCode(i);
          }
          j = 0;
          for (;;) {
            while (j >= s.length) {
              j = 0;
              if (!nextLine()) {
                errorAt("Unclosed string.", line, from);
              }
            }
            c = s.charAt(j);
            if (c === x) {
              character += 1;
              s = s.substr(j + 1);
              return it('(string)', r, x);
            }
            if (c < ' ') {
              if (c === '\n' || c === '\r') {
                break;
              }
              warningAt("Control character in string: {a}.",
                line, character + j, s.slice(0, j));
            } else if (c === '\\') {
              j += 1;
              character += 1;
              c = s.charAt(j);
              switch (c) {
                case '\\':
                case '"':
                case '/':
                  break;
                case '\'':
                  if (jsonmode) {
                    warningAt("Avoid \\'.", line, character);
                  }
                  break;
                case 'b':
                  c = '\b';
                  break;
                case 'f':
                  c = '\f';
                  break;
                case 'n':
                  c = '\n';
                  break;
                case 'r':
                  c = '\r';
                  break;
                case 't':
                  c = '\t';
                  break;
                case 'u':
                  esc(4);
                  break;
                case 'v':
                  if (jsonmode) {
                    warningAt("Avoid \\v.", line, character);
                  }
                  c = '\v';
                  break;
                case 'x':
                  if (jsonmode) {
                    warningAt("Avoid \\x-.", line, character);
                  }
                  esc(2);
                  break;
                default:
                  warningAt("Bad escapement.", line, character);
              }
            }
            r += c;
            character += 1;
            j += 1;
          }
        }
        for (;;) {
          if (!s) {
            return it(nextLine() ? '(endline)' : '(end)', '');
          }
          t = match(tx);
          if (!t) {
            t = '';
            c = '';
            while (s && s < '!') {
              s = s.substr(1);
            }
            if (s) {
              if (s.charCodeAt(0) > 127)
                warningAt("Unexpected non ascii char: '{a}'. (ASCII Code: {b})", line, character, s.substr(0, 1), s.charCodeAt(0));
              else
                errorAt("Unexpected '{a}'.", line, character, s.substr(0, 1));
            }
          } else {
            if (c.isAlpha() || c === '_' || c === '$') {
              return it('(identifier)', t);
            }
            if (c.isDigit()) {
              if (!isFinite(Number(t))) {
                warningAt("Bad number '{a}'.",
                  line, character, t);
              }
              if (s.substr(0, 1).isAlpha()) {
                warningAt("Missing space after '{a}'.",
                  line, character, t);
              }
              if (c === '0') {
                d = t.substr(1, 1);
                if (d.isDigit()) {
                  if (token.id !== '.') {
                    warningAt("Don't use extra leading zeros '{a}'.",
                      line, character, t);
                  }
                } else if (jsonmode && (d === 'x' || d === 'X')) {
                  warningAt("Avoid 0x-. '{a}'.",
                    line, character, t);
                }
              }
              if (t.substr(t.length - 1) === '.') {
                warningAt(
                  "A trailing decimal point can be confused with a dot '{a}'.", line, character, t);
              }
              return it('(number)', t);
            }
            switch (t) {
              case '"':
              case "'":
                return string(t);
              case '//':
                if (src) {
                  warningAt("Unexpected comment.", line, character);
                }
                s = '';
                token.comment = true;
                break;
              case '/*':
                if (src) {
                  warningAt("Unexpected comment.", line, character);
                }
                for (;;) {
                  i = s.search(lx);
                  if (i >= 0) {
                    break;
                  }
                  if (!nextLine()) {
                    errorAt("Unclosed comment.", line, character);
                  }
                }
                character += i + 2;
                if (s.substr(i, 1) === '/') {
                  errorAt("Nested comment.", line, character);
                }
                s = s.substr(i + 2);
                token.comment = true;
                break;
              case '/*members':
              case '/*member':
              case '/*jshint':
              case '/*jslint':
              case '/*global':
              case '*/':
                return {
                  value: t,
                    type: 'special',
                    line: line,
                    character: character,
                    from: from
                };
              case '':
                break;
              case '/':
                if (token.id === '/=') {
                  errorAt(
                    "A regular expression literal can be confused with '/='.", line, from);
                }
                if (prereg) {
                  depth = 0;
                  captures = 0;
                  l = 0;
                  for (;;) {
                    b = true;
                    c = s.charAt(l);
                    l += 1;
                    switch (c) {
                      case '':
                        errorAt("Unclosed regular expression.",
                          line, from);
                        return;
                      case '/':
                        if (depth > 0) {
                          warningAt("Unescaped '{a}'.",
                            line, from + l, '/');
                        }
                        c = s.substr(0, l - 1);
                        q = {
                          g: true,
                          i: true,
                          m: true
                        };
                        while (q[s.charAt(l)] === true) {
                          q[s.charAt(l)] = false;
                          l += 1;
                        }
                        character += l;
                        s = s.substr(l);
                        q = s.charAt(0);
                        if (q === '/' || q === '*') {
                          errorAt("Confusing regular expression.",
                            line, from);
                        }
                        return it('(regexp)', c);
                      case '\\':
                        c = s.charAt(l);
                        if (c < ' ') {
                          warningAt(
                            "Unexpected control character in regular expression.", line, from + l);
                        } else if (c === '<') {
                          warningAt(
                            "Unexpected escaped character '{a}' in regular expression.", line, from + l, c);
                        }
                        l += 1;
                        break;
                      case '(':
                        depth += 1;
                        b = false;
                        if (s.charAt(l) === '?') {
                          l += 1;
                          switch (s.charAt(l)) {
                            case ':':
                            case '=':
                            case '!':
                              l += 1;
                              break;
                            default:
                              warningAt(
                                "Expected '{a}' and instead saw '{b}'.", line, from + l, ':', s.charAt(l));
                          }
                        } else {
                          captures += 1;
                        }
                        break;
                      case '|':
                        b = false;
                        break;
                      case ')':
                        if (depth === 0) {
                          warningAt("Unescaped '{a}'.",
                            line, from + l, ')');
                        } else {
                          depth -= 1;
                        }
                        break;
                      case ' ':
                        q = 1;
                        while (s.charAt(l) === ' ') {
                          l += 1;
                          q += 1;
                        }
                        if (q > 1) {
                          warningAt(
                            "Spaces are hard to count. Use {{a}}.", line, from + l, q);
                        }
                        break;
                      case '[':
                        c = s.charAt(l);
                        if (c === '^') {
                          l += 1;
                          if (option.regexp) {
                            warningAt("Insecure '{a}'.",
                              line, from + l, c);
                          } else if (s.charAt(l) === ']') {
                            errorAt("Unescaped '{a}'.",
                              line, from + l, '^');
                          }
                        }
                        q = false;
                        if (c === ']') {
                          warningAt("Empty class.", line,
                            from + l - 1);
                          q = true;
                        }
                        klass: do {
                          c = s.charAt(l);
                          l += 1;
                          switch (c) {
                            case '[':
                            case '^':
                              warningAt("Unescaped '{a}'.",
                                line, from + l, c);
                              q = true;
                              break;
                            case '-':
                              if (q) {
                                q = false;
                              } else {
                                warningAt("Unescaped '{a}'.",
                                  line, from + l, '-');
                                q = true;
                              }
                              break;
                            case ']':
                              if (!q) {
                                warningAt("Unescaped '{a}'.",
                                  line, from + l - 1, '-');
                              }
                              break klass;
                            case '\\':
                              c = s.charAt(l);
                              if (c < ' ') {
                                warningAt(
                                  "Unexpected control character in regular expression.", line, from + l);
                              } else if (c === '<') {
                                warningAt(
                                  "Unexpected escaped character '{a}' in regular expression.", line, from + l, c);
                              }
                              l += 1;
                              q = true;
                              break;
                            case '/':
                              warningAt("Unescaped '{a}'.",
                                line, from + l - 1, '/');
                              q = true;
                              break;
                            case '<':
                              q = true;
                              break;
                            default:
                              q = true;
                          }
                        } while (c);
                        break;
                      case '.':
                        if (option.regexp) {
                          warningAt("Insecure '{a}'.", line,
                            from + l, c);
                        }
                        break;
                      case ']':
                      case '?':
                      case '{':
                      case '}':
                      case '+':
                      case '*':
                        warningAt("Unescaped '{a}'.", line,
                          from + l, c);
                    }
                    if (b) {
                      switch (s.charAt(l)) {
                        case '?':
                        case '+':
                        case '*':
                          l += 1;
                          if (s.charAt(l) === '?') {
                            l += 1;
                          }
                          break;
                        case '{':
                          l += 1;
                          c = s.charAt(l);
                          if (c < '0' || c > '9') {
                            warningAt(
                              "Expected a number and instead saw '{a}'.", line, from + l, c);
                          }
                          l += 1;
                          low = +c;
                          for (;;) {
                            c = s.charAt(l);
                            if (c < '0' || c > '9') {
                              break;
                            }
                            l += 1;
                            low = +c + (low * 10);
                          }
                          high = low;
                          if (c === ',') {
                            l += 1;
                            high = Infinity;
                            c = s.charAt(l);
                            if (c >= '0' && c <= '9') {
                              l += 1;
                              high = +c;
                              for (;;) {
                                c = s.charAt(l);
                                if (c < '0' || c > '9') {
                                  break;
                                }
                                l += 1;
                                high = +c + (high * 10);
                              }
                            }
                          }
                          if (s.charAt(l) !== '}') {
                            errorAt(
                              "Expected '{a}' and instead saw '{b}'.", line, from + l, '}', c);
                          } else {
                            l += 1;
                          }
                          if (s.charAt(l) === '?') {
                            l += 1;
                          }
                          if (low > high) {
                            warningAt(
                              "'{a}' should not be greater than '{b}'.", line, from + l, low, high);
                          }
                      }
                    }
                  }
                  c = s.substr(0, l - 1);
                  character += l;
                  s = s.substr(l);
                  return it('(regexp)', c);
                }
                return it('(punctuator)', t);
              case '#':
                return it('(punctuator)', t);
              default:
                return it('(punctuator)', t);
            }
          }
        }
      }
    };
  }());

  function addlabel(t, type) {
    if (t === 'hasOwnProperty') {
      warning("'hasOwnProperty' is a really bad name.");
    }
    if (is_own(funct, t) && !funct['(global)']) {
      if (funct[t] === true) {
        if (option.latedef)
          warning("'{a}' was used before it was defined.", nexttoken, t);
      } else {
        if (!option.shadow)
          warning("'{a}' is already defined.", nexttoken, t);
      }
    }
    funct[t] = type;
    if (funct['(global)']) {
      global[t] = funct;
      if (is_own(implied, t)) {
        if (option.latedef)
          warning("'{a}' was used before it was defined.", nexttoken, t);
        delete implied[t];
      }
    } else {
      scope[t] = funct;
    }
  }

  function doOption() {
    var b, obj, filter, o = nexttoken.value,
      t, v;
    switch (o) {
      case '*/':
        error("Unbegun comment.");
        break;
      case '/*members':
      case '/*member':
        o = '/*members';
        if (!membersOnly) {
          membersOnly = {};
        }
        obj = membersOnly;
        break;
      case '/*jshint':
      case '/*jslint':
        obj = option;
        filter = boolOptions;
        break;
      case '/*global':
        obj = predefined;
        break;
      default:
        error("What?");
    }
    t = lex.token();
    loop: for (;;) {
      for (;;) {
        if (t.type === 'special' && t.value === '*/') {
          break loop;
        }
        if (t.id !== '(endline)' && t.id !== ',') {
          break;
        }
        t = lex.token();
      }
      if (t.type !== '(string)' && t.type !== '(identifier)' &&
        o !== '/*members') {
        error("Bad option.", t);
      }
      v = lex.token();
      if (v.id === ':') {
        v = lex.token();
        if (obj === membersOnly) {
          error("Expected '{a}' and instead saw '{b}'.",
            t, '*/', ':');
        }
        if (t.value === 'indent' && (o === '/*jshint' || o === '/*jslint')) {
          b = +v.value;
          if (typeof b !== 'number' || !isFinite(b) || b <= 0 ||
            Math.floor(b) !== b) {
            error("Expected a small integer and instead saw '{a}'.",
              v, v.value);
          }
          obj.white = true;
          obj.indent = b;
        } else if (t.value === 'maxerr' && (o === '/*jshint' || o === '/*jslint')) {
          b = +v.value;
          if (typeof b !== 'number' || !isFinite(b) || b <= 0 ||
            Math.floor(b) !== b) {
            error("Expected a small integer and instead saw '{a}'.",
              v, v.value);
          }
          obj.maxerr = b;
        } else if (t.value === 'maxlen' && (o === '/*jshint' || o === '/*jslint')) {
          b = +v.value;
          if (typeof b !== 'number' || !isFinite(b) || b <= 0 ||
            Math.floor(b) !== b) {
            error("Expected a small integer and instead saw '{a}'.",
              v, v.value);
          }
          obj.maxlen = b;
        } else if (v.value === 'true') {
          obj[t.value] = true;
        } else if (v.value === 'false') {
          obj[t.value] = false;
        } else {
          error("Bad option value.", v);
        }
        t = lex.token();
      } else {
        if (o === '/*jshint' || o === '/*jslint') {
          error("Missing option value.", t);
        }
        obj[t.value] = false;
        t = v;
      }
    }
    if (filter) {
      assume();
    }
  }

  function peek(p) {
    var i = p || 0,
      j = 0,
      t;
    while (j <= i) {
      t = lookahead[j];
      if (!t) {
        t = lookahead[j] = lex.token();
      }
      j += 1;
    }
    return t;
  }

  function advance(id, t) {
    switch (token.id) {
      case '(number)':
        if (nexttoken.id === '.') {
          warning("A dot following a number can be confused with a decimal point.", token);
        }
        break;
      case '-':
        if (nexttoken.id === '-' || nexttoken.id === '--') {
          warning("Confusing minusses.");
        }
        break;
      case '+':
        if (nexttoken.id === '+' || nexttoken.id === '++') {
          warning("Confusing plusses.");
        }
        break;
    }
    if (token.type === '(string)' || token.identifier) {
      anonname = token.value;
    }
    if (id && nexttoken.id !== id) {
      if (t) {
        if (nexttoken.id === '(end)') {
          error("Unmatched '{a}'.", t, t.id);
        } else {
          error("Expected '{a}' to match '{b}' from line {c} and instead saw '{d}'.",
            nexttoken, id, t.id, t.line, nexttoken.value);
        }
      } else if (nexttoken.type !== '(identifier)' ||
        nexttoken.value !== id) {
        error("Expected '{a}' and instead saw '{b}'.",
          nexttoken, id, nexttoken.value);
      }
    }
    prevtoken = token;
    token = nexttoken;
    for (;;) {
      nexttoken = lookahead.shift() || lex.token();
      if (nexttoken.id === '(end)' || nexttoken.id === '(error)') {
        return;
      }
      if (nexttoken.type === 'special') {
        doOption();
      } else {
        if (nexttoken.id !== '(endline)') {
          break;
        }
      }
    }
  }

  function expression(rbp, initial) {
    var left, isArray = false;
    if (nexttoken.id === '(end)')
      error("Unexpected early end of program.", token);
    advance();
    if (initial) {
      anonname = 'anonymous';
      funct['(verb)'] = token.value;
    }
    if (initial === true && token.fud) {
      left = token.fud();
    } else {
      if (token.nud) {
        left = token.nud();
      } else {
        if (nexttoken.type === '(number)' && token.id === '.') {
          warning("A leading decimal point can be confused with a dot: '.{a}'.",
            token, nexttoken.value);
          advance();
          return token;
        } else {
          error("Expected an identifier and instead saw '{a}'.",
            token, token.id);
        }
      }
      while (rbp < nexttoken.lbp) {
        isArray = token.value == 'Array';
        advance();
        if (isArray && token.id == '(' && nexttoken.id == ')')
          warning("Use the array literal notation [].", token);
        if (token.led) {
          left = token.led(left);
        } else {
          error("Expected an operator and instead saw '{a}'.",
            token, token.id);
        }
      }
    }
    return left;
  }

  function adjacent(left, right) {
    left = left || token;
    right = right || nexttoken;
    if (option.white) {
      if (left.character !== right.from && left.line === right.line) {
        warning("Unexpected space after '{a}'.", right, left.value);
      }
    }
  }

  function nobreak(left, right) {
    left = left || token;
    right = right || nexttoken;
    if (option.white && (left.character !== right.from || left.line !== right.line)) {
      warning("Unexpected space before '{a}'.", right, right.value);
    }
  }

  function nospace(left, right) {
    left = left || token;
    right = right || nexttoken;
    if (option.white && !left.comment) {
      if (left.line === right.line) {
        adjacent(left, right);
      }
    }
  }

  function nonadjacent(left, right) {
    if (option.white) {
      left = left || token;
      right = right || nexttoken;
      if (left.line === right.line && left.character === right.from) {
        warning("Missing space after '{a}'.",
          nexttoken, left.value);
      }
    }
  }

  function nobreaknonadjacent(left, right) {
    left = left || token;
    right = right || nexttoken;
    if (!option.laxbreak && left.line !== right.line) {
      warning("Bad line breaking before '{a}'.", right, right.id);
    } else if (option.white) {
      left = left || token;
      right = right || nexttoken;
      if (left.character === right.from) {
        warning("Missing space after '{a}'.",
          nexttoken, left.value);
      }
    }
  }

  function indentation(bias) {
    var i;
    if (option.white && nexttoken.id !== '(end)') {
      i = indent + (bias || 0);
      if (nexttoken.from !== i) {
        warning(
          "Expected '{a}' to have an indentation at {b} instead at {c}.",
          nexttoken, nexttoken.value, i, nexttoken.from);
      }
    }
  }

  function nolinebreak(t) {
    t = t || token;
    if (t.line !== nexttoken.line) {
      warning("Line breaking error '{a}'.", t, t.value);
    }
  }

  function comma() {
    if (token.line !== nexttoken.line) {
      if (!option.laxbreak) {
        warning("Bad line breaking before '{a}'.", token, nexttoken.id);
      }
    } else if (token.character !== nexttoken.from && option.white) {
      warning("Unexpected space after '{a}'.", nexttoken, token.value);
    }
    advance(',');
    nonadjacent(token, nexttoken);
  }

  function symbol(s, p) {
    var x = syntax[s];
    if (!x || typeof x !== 'object') {
      syntax[s] = x = {
        id: s,
        lbp: p,
        value: s
      };
    }
    return x;
  }

  function delim(s) {
    return symbol(s, 0);
  }

  function stmt(s, f) {
    var x = delim(s);
    x.identifier = x.reserved = true;
    x.fud = f;
    return x;
  }

  function blockstmt(s, f) {
    var x = stmt(s, f);
    x.block = true;
    return x;
  }

  function reserveName(x) {
    var c = x.id.charAt(0);
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
      x.identifier = x.reserved = true;
    }
    return x;
  }

  function prefix(s, f) {
    var x = symbol(s, 150);
    reserveName(x);
    x.nud = (typeof f === 'function') ? f : function() {
      this.right = expression(150);
      this.arity = 'unary';
      if (this.id === '++' || this.id === '--') {
        if (option.plusplus) {
          warning("Unexpected use of '{a}'.", this, this.id);
        } else if ((!this.right.identifier || this.right.reserved) &&
          this.right.id !== '.' && this.right.id !== '[') {
          warning("Bad operand.", this);
        }
      }
      return this;
    };
    return x;
  }

  function type(s, f) {
    var x = delim(s);
    x.type = s;
    x.nud = f;
    return x;
  }

  function reserve(s, f) {
    var x = type(s, f);
    x.identifier = x.reserved = true;
    return x;
  }

  function reservevar(s, v) {
    return reserve(s, function() {
      if (typeof v === 'function') {
        v(this);
      }
      return this;
    });
  }

  function infix(s, f, p, w) {
    var x = symbol(s, p);
    reserveName(x);
    x.led = function(left) {
      if (!w) {
        nobreaknonadjacent(prevtoken, token);
        nonadjacent(token, nexttoken);
      }
      if (typeof f === 'function') {
        return f(left, this);
      } else {
        this.left = left;
        this.right = expression(p);
        return this;
      }
    };
    return x;
  }

  function relation(s, f) {
    var x = symbol(s, 100);
    x.led = function(left) {
      nobreaknonadjacent(prevtoken, token);
      nonadjacent(token, nexttoken);
      var right = expression(100);
      if ((left && left.id === 'NaN') || (right && right.id === 'NaN')) {
        warning("Use the isNaN function to compare with NaN.", this);
      } else if (f) {
        f.apply(this, [left, right]);
      }
      if (left.id === '!') {
        warning("Confusing use of '{a}'.", left, '!');
      }
      if (right.id === '!') {
        warning("Confusing use of '{a}'.", left, '!');
      }
      this.left = left;
      this.right = right;
      return this;
    };
    return x;
  }

  function isPoorRelation(node) {
    return node &&
      ((node.type === '(number)' && +node.value === 0) ||
        (node.type === '(string)' && node.value === '') ||
        (node.type === 'null' && !option.eqnull) ||
        node.type === 'true' ||
        node.type === 'false' ||
        node.type === 'undefined');
  }

  function assignop(s, f) {
    symbol(s, 20).exps = true;
    return infix(s, function(left, that) {
      var l;
      that.left = left;
      if (predefined[left.value] === false &&
        scope[left.value]['(global)'] === true) {
        warning("Read only.", left);
      } else if (left['function']) {
        warning("'{a}' is a function.", left, left.value);
      }
      if (left) {
        if (left.id === '.' || left.id === '[') {
          if (!left.left || left.left.value === 'arguments') {
            warning('Bad assignment.', that);
          }
          that.right = expression(19);
          return that;
        } else if (left.identifier && !left.reserved) {
          if (funct[left.value] === 'exception') {
            warning("Do not assign to the exception parameter.", left);
          }
          that.right = expression(19);
          return that;
        }
        if (left === syntax['function']) {
          warning(
            "Expected an identifier in an assignment and instead saw a function invocation.",
            token);
        }
      }
      error("Bad assignment.", that);
    }, 20);
  }

  function bitwise(s, f, p) {
    var x = symbol(s, p);
    reserveName(x);
    x.led = (typeof f === 'function') ? f : function(left) {
      if (option.bitwise) {
        warning("Unexpected use of '{a}'.", this, this.id);
      }
      this.left = left;
      this.right = expression(p);
      return this;
    };
    return x;
  }

  function bitwiseassignop(s) {
    symbol(s, 20).exps = true;
    return infix(s, function(left, that) {
      if (option.bitwise) {
        warning("Unexpected use of '{a}'.", that, that.id);
      }
      nonadjacent(prevtoken, token);
      nonadjacent(token, nexttoken);
      if (left) {
        if (left.id === '.' || left.id === '[' ||
          (left.identifier && !left.reserved)) {
          expression(19);
          return that;
        }
        if (left === syntax['function']) {
          warning(
            "Expected an identifier in an assignment, and instead saw a function invocation.",
            token);
        }
        return that;
      }
      error("Bad assignment.", that);
    }, 20);
  }

  function suffix(s, f) {
    var x = symbol(s, 150);
    x.led = function(left) {
      if (option.plusplus) {
        warning("Unexpected use of '{a}'.", this, this.id);
      } else if ((!left.identifier || left.reserved) &&
        left.id !== '.' && left.id !== '[') {
        warning("Bad operand.", this);
      }
      this.left = left;
      return this;
    };
    return x;
  }

  function optionalidentifier(fnparam) {
    if (nexttoken.identifier) {
      advance();
      if (token.reserved && !option.es5) {
        if (!fnparam || token.value != 'undefined') {
          warning("Expected an identifier and instead saw '{a}' (a reserved word).",
            token, token.id);
        }
      }
      return token.value;
    }
  }

  function identifier(fnparam) {
    var i = optionalidentifier(fnparam);
    if (i) {
      return i;
    }
    if (token.id === 'function' && nexttoken.id === '(') {
      if (option.namefunc) {
        error("Missing name in function declaration.");
      }
    } else {
      error("Expected an identifier and instead saw '{a}'.",
        nexttoken, nexttoken.value);
    }
  }

  function reachable(s) {
    var i = 0,
      t;
    if (nexttoken.id !== ';' || noreach) {
      return;
    }
    for (;;) {
      t = peek(i);
      if (t.reach) {
        return;
      }
      if (t.id !== '(endline)') {
        if (t.id === 'function') {
          warning(
            "Inner functions should be listed at the top of the outer function.", t);
          break;
        }
        warning("Unreachable '{a}' after '{b}'.", t, t.value, s);
        break;
      }
      i += 1;
    }
  }

  function statement(noindent) {
    var i = indent,
      r, s = scope,
      t = nexttoken;
    if (t.id === ';') {
      warning("Unnecessary semicolon.", t);
      advance(';');
      return;
    }
    if (t.identifier && !t.reserved && peek().id === ':') {
      advance();
      advance(':');
      scope = Object.create(s);
      addlabel(t.value, 'label');
      if (!nexttoken.labelled) {
        warning("Label '{a}' on {b} statement.",
          nexttoken, t.value, nexttoken.value);
      }
      if (jx.test(t.value + ':')) {
        warning("Label '{a}' looks like a javascript url.",
          t, t.value);
      }
      nexttoken.label = t.value;
      t = nexttoken;
    }
    if (!noindent) {
      indentation();
    }
    r = expression(0, true);
    if (!t.block) {
      if (!option.expr && (!r || !r.exps)) {
        error("Expected an assignment or function call and instead saw an expression.", token);
      } else if (option.nonew && r.id === '(' && r.left.id === 'new') {
        warning("Do not use 'new' for side effects.");
      }
      if (nexttoken.id !== ';') {
        if (!option.asi) {
          warningAt("Missing semicolon.", token.line, token.from + token.value.length);
        }
      } else {
        adjacent(token, nexttoken);
        advance(';');
        nonadjacent(token, nexttoken);
      }
    }
    indent = i;
    scope = s;
    return r;
  }

  function use_strict() {
    if (nexttoken.value === 'use strict') {
      if (strict_mode) {
        warning("Unnecessary \"use strict\".");
      }
      advance();
      advance(';');
      strict_mode = true;
      option.newcap = true;
      option.undef = true;
      return true;
    } else {
      return false;
    }
  }

  function statements(begin) {
    var a = [],
      f, p;
    while (!nexttoken.reach && nexttoken.id !== '(end)') {
      if (nexttoken.id === ';') {
        warning("Unnecessary semicolon.");
        advance(';');
      } else {
        a.push(statement());
      }
    }
    return a;
  }

  function block(ordinary, stmt) {
    var a,
      b = inblock,
      old_indent = indent,
      m = strict_mode,
      s = scope,
      t;
    inblock = ordinary;
    scope = Object.create(scope);
    nonadjacent(token, nexttoken);
    t = nexttoken;
    if (nexttoken.id === '{') {
      advance('{');
      if (nexttoken.id !== '}' || token.line !== nexttoken.line) {
        indent += option.indent;
        while (!ordinary && nexttoken.from > indent) {
          indent += option.indent;
        }
        if (!ordinary && !use_strict() && !m && option.strict &&
          funct['(context)']['(global)']) {
          warning("Missing \"use strict\" statement.");
        }
        a = statements();
        strict_mode = m;
        indent -= option.indent;
        indentation();
      }
      advance('}', t);
      indent = old_indent;
    } else if (!ordinary) {
      error("Expected '{a}' and instead saw '{b}'.",
        nexttoken, '{', nexttoken.value);
    } else {
      if (!stmt || option.curly)
        error("Expected '{a}' and instead saw '{b}'.",
          nexttoken, '{', nexttoken.value);
      noreach = true;
      a = [statement()];
      noreach = false;
    }
    funct['(verb)'] = null;
    scope = s;
    inblock = b;
    if (ordinary && option.noempty && (!a || a.length === 0)) {
      warning("Empty block.");
    }
    return a;
  }

  function countMember(m) {
    if (membersOnly && typeof membersOnly[m] !== 'boolean') {
      warning("Unexpected /*member '{a}'.", token, m);
    }
    if (typeof member[m] === 'number') {
      member[m] += 1;
    } else {
      member[m] = 1;
    }
  }

  function note_implied(token) {
    var name = token.value,
      line = token.line,
      a = implied[name];
    if (typeof a === 'function') {
      a = false;
    }
    if (!a) {
      a = [line];
      implied[name] = a;
    } else if (a[a.length - 1] !== line) {
      a.push(line);
    }
  }
  type('(number)', function() {
    return this;
  });
  type('(string)', function() {
    return this;
  });
  syntax['(identifier)'] = {
    type: '(identifier)',
    lbp: 0,
    identifier: true,
    nud: function() {
      var v = this.value,
        s = scope[v],
        f;
      if (typeof s === 'function') {
        s = undefined;
      } else if (typeof s === 'boolean') {
        f = funct;
        funct = functions[0];
        addlabel(v, 'var');
        s = funct;
        funct = f;
      }
      if (funct === s) {
        switch (funct[v]) {
          case 'unused':
            funct[v] = 'var';
            break;
          case 'unction':
            funct[v] = 'function';
            this['function'] = true;
            break;
          case 'function':
            this['function'] = true;
            break;
          case 'label':
            warning("'{a}' is a statement label.", token, v);
            break;
        }
      } else if (funct['(global)']) {
        if (anonname != 'typeof' && anonname != 'delete' &&
          option.undef && typeof predefined[v] !== 'boolean') {
          warning("'{a}' is not defined.", token, v);
        }
        note_implied(token);
      } else {
        switch (funct[v]) {
          case 'closure':
          case 'function':
          case 'var':
          case 'unused':
            warning("'{a}' used out of scope.", token, v);
            break;
          case 'label':
            warning("'{a}' is a statement label.", token, v);
            break;
          case 'outer':
          case 'global':
            break;
          default:
            if (s === true) {
              funct[v] = true;
            } else if (s === null) {
              warning("'{a}' is not allowed.", token, v);
              note_implied(token);
            } else if (typeof s !== 'object') {
              if (anonname != 'typeof' && anonname != 'delete' && option.undef) {
                warning("'{a}' is not defined.", token, v);
              } else {
                funct[v] = true;
              }
              note_implied(token);
            } else {
              switch (s[v]) {
                case 'function':
                case 'unction':
                  this['function'] = true;
                  s[v] = 'closure';
                  funct[v] = s['(global)'] ? 'global' : 'outer';
                  break;
                case 'var':
                case 'unused':
                  s[v] = 'closure';
                  funct[v] = s['(global)'] ? 'global' : 'outer';
                  break;
                case 'closure':
                case 'parameter':
                  funct[v] = s['(global)'] ? 'global' : 'outer';
                  break;
                case 'label':
                  warning("'{a}' is a statement label.", token, v);
              }
            }
        }
      }
      return this;
    },
    led: function() {
      error("Expected an operator and instead saw '{a}'.",
        nexttoken, nexttoken.value);
    }
  };
  type('(regexp)', function() {
    return this;
  });
  delim('(endline)');
  delim('(begin)');
  delim('(end)').reach = true;
  delim('</').reach = true;
  delim('<!');
  delim('<!--');
  delim('-->');
  delim('(error)').reach = true;
  delim('}').reach = true;
  delim(')');
  delim(']');
  delim('"').reach = true;
  delim("'").reach = true;
  delim(';');
  delim(':').reach = true;
  delim(',');
  delim('#');
  delim('@');
  reserve('else');
  reserve('case').reach = true;
  reserve('catch');
  reserve('default').reach = true;
  reserve('finally');
  reservevar('arguments', function(x) {
    if (strict_mode && funct['(global)']) {
      warning("Strict violation.", x);
    }
  });
  reservevar('eval');
  reservevar('false');
  reservevar('Infinity');
  reservevar('NaN');
  reservevar('null');
  reservevar('this', function(x) {
    if (strict_mode && ((funct['(statement)'] &&
        funct['(name)'].charAt(0) > 'Z') || funct['(global)'])) {
      warning("Strict violation.", x);
    }
  });
  reservevar('true');
  reservevar('undefined');
  assignop('=', 'assign', 20);
  assignop('+=', 'assignadd', 20);
  assignop('-=', 'assignsub', 20);
  assignop('*=', 'assignmult', 20);
  assignop('/=', 'assigndiv', 20).nud = function() {
    error("A regular expression literal can be confused with '/='.");
  };
  assignop('%=', 'assignmod', 20);
  bitwiseassignop('&=', 'assignbitand', 20);
  bitwiseassignop('|=', 'assignbitor', 20);
  bitwiseassignop('^=', 'assignbitxor', 20);
  bitwiseassignop('<<=', 'assignshiftleft', 20);
  bitwiseassignop('>>=', 'assignshiftright', 20);
  bitwiseassignop('>>>=', 'assignshiftrightunsigned', 20);
  infix('?', function(left, that) {
    that.left = left;
    that.right = expression(10);
    advance(':');
    that['else'] = expression(10);
    return that;
  }, 30);
  infix('||', 'or', 40);
  infix('&&', 'and', 50);
  bitwise('|', 'bitor', 70);
  bitwise('^', 'bitxor', 80);
  bitwise('&', 'bitand', 90);
  relation('==', function(left, right) {
    var eqnull = option.eqnull &&
      (left.value == 'null' || right.value == 'null');
    if (!eqnull && option.eqeqeq) {
      warning("Expected '{a}' and instead saw '{b}'.",
        this, '===', '==');
    } else if (option.poorRelation && isPoorRelation(left)) {
      warning("Use '{a}' to compare with '{b}'.",
        this, '===', left.value);
    } else if (option.poorRelation && isPoorRelation(right)) {
      warning("Use '{a}' to compare with '{b}'.",
        this, '===', right.value);
    }
    return this;
  });
  relation('===');
  relation('!=', function(left, right) {
    if (option.eqeqeq) {
      warning("Expected '{a}' and instead saw '{b}'.",
        this, '!==', '!=');
    } else if (option.poorRelation && isPoorRelation(left)) {
      warning("Use '{a}' to compare with '{b}'.",
        this, '!==', left.value);
    } else if (option.poorRelation && isPoorRelation(right)) {
      warning("Use '{a}' to compare with '{b}'.",
        this, '!==', right.value);
    }
    return this;
  });
  relation('!==');
  relation('<');
  relation('>');
  relation('<=');
  relation('>=');
  bitwise('<<', 'shiftleft', 120);
  bitwise('>>', 'shiftright', 120);
  bitwise('>>>', 'shiftrightunsigned', 120);
  infix('in', 'in', 120);
  infix('instanceof', 'instanceof', 120);
  infix('+', function(left, that) {
    var right = expression(130);
    if (left && right && left.id === '(string)' && right.id === '(string)') {
      left.value += right.value;
      left.character = right.character;
      if (jx.test(left.value)) {
        warning("JavaScript URL.", left);
      }
      return left;
    }
    that.left = left;
    that.right = right;
    return that;
  }, 130);
  prefix('+', 'num');
  prefix('+++', function() {
    warning("Confusing pluses.");
    this.right = expression(150);
    this.arity = 'unary';
    return this;
  });
  infix('+++', function(left) {
    warning("Confusing pluses.");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix('-', 'sub', 130);
  prefix('-', 'neg');
  prefix('---', function() {
    warning("Confusing minuses.");
    this.right = expression(150);
    this.arity = 'unary';
    return this;
  });
  infix('---', function(left) {
    warning("Confusing minuses.");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix('*', 'mult', 140);
  infix('/', 'div', 140);
  infix('%', 'mod', 140);
  suffix('++', 'postinc');
  prefix('++', 'preinc');
  syntax['++'].exps = true;
  suffix('--', 'postdec');
  prefix('--', 'predec');
  syntax['--'].exps = true;
  prefix('delete', function() {
    var p = expression(0);
    if (!p || (p.id !== '.' && p.id !== '[')) {
      warning("Variables should not be deleted.");
    }
    this.first = p;
    return this;
  }).exps = true;
  prefix('~', function() {
    if (option.bitwise) {
      warning("Unexpected '{a}'.", this, '~');
    }
    expression(150);
    return this;
  });
  prefix('!', function() {
    this.right = expression(150);
    this.arity = 'unary';
    if (bang[this.right.id] === true) {
      warning("Confusing use of '{a}'.", this, '!');
    }
    return this;
  });
  prefix('typeof', 'typeof');
  prefix('new', function() {
    var c = expression(155),
      i;
    if (c && c.id !== 'function') {
      if (c.identifier) {
        c['new'] = true;
        switch (c.value) {
          case 'Object':
            warning("Use the object literal notation {}.", token);
            break;
          case 'Number':
          case 'String':
          case 'Boolean':
          case 'Math':
            warning("Do not use {a} as a constructor.", token, c.value);
            break;
          case 'Function':
            if (!option.evil) {
              warning("The Function constructor is eval.");
            }
            break;
          case 'Date':
          case 'RegExp':
            break;
          default:
            if (c.id !== 'function') {
              i = c.value.substr(0, 1);
              if (option.newcap && (i < 'A' || i > 'Z')) {
                warning("A constructor name should start with an uppercase letter.", token);
              }
            }
        }
      } else {
        if (c.id !== '.' && c.id !== '[' && c.id !== '(') {
          warning("Bad constructor.", token);
        }
      }
    } else {
      if (!option.supernew)
        warning("Weird construction. Delete 'new'.", this);
    }
    adjacent(token, nexttoken);
    if (nexttoken.id !== '(' && !option.supernew) {
      warning("Missing '()' invoking a constructor.");
    }
    this.first = c;
    return this;
  });
  syntax['new'].exps = true;
  prefix('void').exps = true;
  infix('.', function(left, that) {
    adjacent(prevtoken, token);
    nobreak();
    var m = identifier();
    if (typeof m === 'string') {
      countMember(m);
    }
    that.left = left;
    that.right = m;
    if (option.noarg && left && left.value === 'arguments' &&
      (m === 'callee' || m === 'caller')) {
      warning("Avoid arguments.{a}.", left, m);
    } else if (!option.evil && left && left.value === 'document' &&
      (m === 'write' || m === 'writeln')) {
      warning("document.write can be a form of eval.", left);
    }
    if (!option.evil && (m === 'eval' || m === 'execScript')) {
      warning('eval is evil.');
    }
    return that;
  }, 160, true);
  infix('(', function(left, that) {
    if (prevtoken.id !== '}' && prevtoken.id !== ')') {
      nobreak(prevtoken, token);
    }
    nospace();
    if (option.immed && !left.immed && left.id === 'function') {
      warning("Wrap an immediate function invocation in parentheses " +
        "to assist the reader in understanding that the expression " +
        "is the result of a function, and not the function itself.");
    }
    var n = 0,
      p = [];
    if (left) {
      if (left.type === '(identifier)') {
        if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)) {
          if (left.value !== 'Number' && left.value !== 'String' &&
            left.value !== 'Boolean' &&
            left.value !== 'Date') {
            if (left.value === 'Math') {
              warning("Math is not a function.", left);
            } else if (option.newcap) {
              warning(
                "Missing 'new' prefix when invoking a constructor.", left);
            }
          }
        }
      }
    }
    if (nexttoken.id !== ')') {
      for (;;) {
        p[p.length] = expression(10);
        n += 1;
        if (nexttoken.id !== ',') {
          break;
        }
        comma();
      }
    }
    advance(')');
    nospace(prevtoken, token);
    if (typeof left === 'object') {
      if (!option.evil) {
        if (left.value === 'eval' || left.value === 'Function' ||
          left.value === 'execScript') {
          warning("eval is evil.", left);
        } else if (p[0] && p[0].id === '(string)' &&
          (left.value === 'setTimeout' ||
            left.value === 'setInterval')) {
          warning(
            "Implied eval is evil. Pass a function instead of a string.", left);
        }
      }
      if (!left.identifier && left.id !== '.' && left.id !== '[' &&
        left.id !== '(' && left.id !== '&&' && left.id !== '||' &&
        left.id !== '?') {
        warning("Bad invocation.", left);
      }
    }
    that.left = left;
    return that;
  }, 155, true).exps = true;
  prefix('(', function() {
    nospace();
    if (nexttoken.id === 'function') {
      nexttoken.immed = true;
    }
    var v = expression(0);
    advance(')', this);
    nospace(prevtoken, token);
    if (option.immed && v.id === 'function') {
      if (nexttoken.id === '(') {
        warning(
          "Move the invocation into the parens that contain the function.", nexttoken);
      } else {
        warning(
          "Do not wrap function literals in parens unless they are to be immediately invoked.",
          this);
      }
    }
    return v;
  });
  infix('[', function(left, that) {
    nobreak(prevtoken, token);
    nospace();
    var e = expression(0),
      s;
    if (e && e.type === '(string)') {
      if (!option.evil && (e.value === 'eval' || e.value === 'execScript')) {
        warning("eval is evil.", that);
      }
      countMember(e.value);
      if (!option.sub && ix.test(e.value)) {
        s = syntax[e.value];
        if (!s || !s.reserved) {
          warning("['{a}'] is better written in dot notation.",
            e, e.value);
        }
      }
    }
    advance(']', that);
    nospace(prevtoken, token);
    that.left = left;
    that.right = e;
    return that;
  }, 160, true);
  prefix('[', function() {
    var b = token.line !== nexttoken.line;
    this.first = [];
    if (b) {
      indent += option.indent;
      if (nexttoken.from === indent + option.indent) {
        indent += option.indent;
      }
    }
    while (nexttoken.id !== '(end)') {
      while (nexttoken.id === ',') {
        warning("Extra comma.");
        advance(',');
      }
      if (nexttoken.id === ']') {
        break;
      }
      if (b && token.line !== nexttoken.line) {
        indentation();
      }
      this.first.push(expression(10));
      if (nexttoken.id === ',') {
        comma();
        if (nexttoken.id === ']' && !option.es5) {
          warning("Extra comma.", token);
          break;
        }
      } else {
        break;
      }
    }
    if (b) {
      indent -= option.indent;
      indentation();
    }
    advance(']', this);
    return this;
  }, 160);

  function property_name() {
    var id = optionalidentifier(true);
    if (!id) {
      if (nexttoken.id === '(string)') {
        id = nexttoken.value;
        advance();
      } else if (nexttoken.id === '(number)') {
        id = nexttoken.value.toString();
        advance();
      }
    }
    return id;
  }

  function functionparams() {
    var i, t = nexttoken,
      p = [];
    advance('(');
    nospace();
    if (nexttoken.id === ')') {
      advance(')');
      nospace(prevtoken, token);
      return;
    }
    for (;;) {
      i = identifier(true);
      p.push(i);
      addlabel(i, 'parameter');
      if (nexttoken.id === ',') {
        comma();
      } else {
        advance(')', t);
        nospace(prevtoken, token);
        return p;
      }
    }
  }

  function doFunction(i, statement) {
    var f,
      oldOption = option,
      oldScope = scope;
    option = Object.create(option);
    scope = Object.create(scope);
    funct = {
      '(name)': i || '"' + anonname + '"',
      '(line)': nexttoken.line,
      '(context)': funct,
      '(breakage)': 0,
      '(loopage)': 0,
      '(scope)': scope,
      '(statement)': statement
    };
    f = funct;
    token.funct = funct;
    functions.push(funct);
    if (i) {
      addlabel(i, 'function');
    }
    funct['(params)'] = functionparams();
    block(false);
    scope = oldScope;
    option = oldOption;
    funct['(last)'] = token.line;
    funct = funct['(context)'];
    return f;
  }
  (function(x) {
    x.nud = function() {
      var b, f, i, j, p, seen = {},
        t;
      b = token.line !== nexttoken.line;
      if (b) {
        indent += option.indent;
        if (nexttoken.from === indent + option.indent) {
          indent += option.indent;
        }
      }
      for (;;) {
        if (nexttoken.id === '}') {
          break;
        }
        if (b) {
          indentation();
        }
        if (nexttoken.value === 'get' && peek().id !== ':') {
          advance('get');
          if (!option.es5) {
            error("get/set are ES5 features.");
          }
          i = property_name();
          if (!i) {
            error("Missing property name.");
          }
          t = nexttoken;
          adjacent(token, nexttoken);
          f = doFunction();
          if (!option.loopfunc && funct['(loopage)']) {
            warning("Don't make functions within a loop.", t);
          }
          p = f['(params)'];
          if (p) {
            warning("Unexpected parameter '{a}' in get {b} function.", t, p[0], i);
          }
          adjacent(token, nexttoken);
          advance(',');
          indentation();
          advance('set');
          j = property_name();
          if (i !== j) {
            error("Expected {a} and instead saw {b}.", token, i, j);
          }
          t = nexttoken;
          adjacent(token, nexttoken);
          f = doFunction();
          p = f['(params)'];
          if (!p || p.length !== 1 || p[0] !== 'value') {
            warning("Expected (value) in set {a} function.", t, i);
          }
        } else {
          i = property_name();
          if (typeof i !== 'string') {
            break;
          }
          advance(':');
          nonadjacent(token, nexttoken);
          expression(10);
        }
        if (seen[i] === true) {
          warning("Duplicate member '{a}'.", nexttoken, i);
        }
        seen[i] = true;
        countMember(i);
        if (nexttoken.id === ',') {
          comma();
          if (nexttoken.id === ',') {
            warning("Extra comma.", token);
          } else if (nexttoken.id === '}' && !option.es5) {
            warning("Extra comma.", token);
          }
        } else {
          break;
        }
      }
      if (b) {
        indent -= option.indent;
        indentation();
      }
      advance('}', this);
      return this;
    };
    x.fud = function() {
      error("Expected to see a statement and instead saw a block.", token);
    };
  }(delim('{')));
  var varstatement = stmt('var', function(prefix) {
    var id, name, value;
    if (funct['(onevar)'] && option.onevar) {
      warning("Too many var statements.");
    } else if (!funct['(global)']) {
      funct['(onevar)'] = true;
    }
    this.first = [];
    for (;;) {
      nonadjacent(token, nexttoken);
      id = identifier();
      if (funct['(global)'] && predefined[id] === false) {
        warning("Redefinition of '{a}'.", token, id);
      }
      addlabel(id, 'unused');
      if (prefix) {
        break;
      }
      name = token;
      this.first.push(token);
      if (nexttoken.id === '=') {
        nonadjacent(token, nexttoken);
        advance('=');
        nonadjacent(token, nexttoken);
        if (nexttoken.id === 'undefined') {
          warning("It is not necessary to initialize '{a}' to 'undefined'.", token, id);
        }
        if (peek(0).id === '=' && nexttoken.identifier) {
          error("Variable {a} was not declared correctly.",
            nexttoken, nexttoken.value);
        }
        value = expression(0);
        name.first = value;
      }
      if (nexttoken.id !== ',') {
        break;
      }
      comma();
    }
    return this;
  });
  varstatement.exps = true;
  blockstmt('function', function() {
    if (inblock) {
      warning(
        "Function declarations should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.", token);
    }
    var i = identifier();
    adjacent(token, nexttoken);
    addlabel(i, 'unction');
    doFunction(i, true);
    if (nexttoken.id === '(' && nexttoken.line === token.line) {
      error(
        "Function declarations are not invocable. Wrap the whole function invocation in parens.");
    }
    return this;
  });
  prefix('function', function() {
    var i = optionalidentifier();
    if (i) {
      adjacent(token, nexttoken);
    } else {
      nonadjacent(token, nexttoken);
    }
    doFunction(i);
    if (!option.loopfunc && funct['(loopage)']) {
      warning("Don't make functions within a loop.");
    }
    return this;
  });
  blockstmt('if', function() {
    var t = nexttoken;
    advance('(');
    nonadjacent(this, t);
    nospace();
    expression(20);
    if (nexttoken.id === '=') {
      if (!option.boss)
        warning("Expected a conditional expression and instead saw an assignment.");
      advance('=');
      expression(20);
    }
    advance(')', t);
    nospace(prevtoken, token);
    block(true, true);
    if (nexttoken.id === 'else') {
      nonadjacent(token, nexttoken);
      advance('else');
      if (nexttoken.id === 'if' || nexttoken.id === 'switch') {
        statement(true);
      } else {
        block(true, true);
      }
    }
    return this;
  });
  blockstmt('try', function() {
    var b, e, s;
    block(false);
    if (nexttoken.id === 'catch') {
      advance('catch');
      nonadjacent(token, nexttoken);
      advance('(');
      s = scope;
      scope = Object.create(s);
      e = nexttoken.value;
      if (nexttoken.type !== '(identifier)') {
        warning("Expected an identifier and instead saw '{a}'.",
          nexttoken, e);
      } else {
        addlabel(e, 'exception');
      }
      advance();
      advance(')');
      block(false);
      b = true;
      scope = s;
    }
    if (nexttoken.id === 'finally') {
      advance('finally');
      block(false);
      return;
    } else if (!b) {
      error("Expected '{a}' and instead saw '{b}'.",
        nexttoken, 'catch', nexttoken.value);
    }
    return this;
  });
  blockstmt('while', function() {
    var t = nexttoken;
    funct['(breakage)'] += 1;
    funct['(loopage)'] += 1;
    advance('(');
    nonadjacent(this, t);
    nospace();
    expression(20);
    if (nexttoken.id === '=') {
      if (!option.boss)
        warning("Expected a conditional expression and instead saw an assignment.");
      advance('=');
      expression(20);
    }
    advance(')', t);
    nospace(prevtoken, token);
    block(true, true);
    funct['(breakage)'] -= 1;
    funct['(loopage)'] -= 1;
    return this;
  }).labelled = true;
  reserve('with');
  blockstmt('switch', function() {
    var t = nexttoken,
      g = false;
    funct['(breakage)'] += 1;
    advance('(');
    nonadjacent(this, t);
    nospace();
    this.condition = expression(20);
    advance(')', t);
    nospace(prevtoken, token);
    nonadjacent(token, nexttoken);
    t = nexttoken;
    advance('{');
    nonadjacent(token, nexttoken);
    indent += option.indent;
    this.cases = [];
    for (;;) {
      switch (nexttoken.id) {
        case 'case':
          switch (funct['(verb)']) {
            case 'break':
            case 'case':
            case 'continue':
            case 'return':
            case 'switch':
            case 'throw':
              break;
            default:
              if (!ft.test(lines[nexttoken.line - 2])) {
                warning(
                  "Expected a 'break' statement before 'case'.",
                  token);
              }
          }
          indentation(-option.indent);
          advance('case');
          this.cases.push(expression(20));
          g = true;
          advance(':');
          funct['(verb)'] = 'case';
          break;
        case 'default':
          switch (funct['(verb)']) {
            case 'break':
            case 'continue':
            case 'return':
            case 'throw':
              break;
            default:
              if (!ft.test(lines[nexttoken.line - 2])) {
                warning(
                  "Expected a 'break' statement before 'default'.",
                  token);
              }
          }
          indentation(-option.indent);
          advance('default');
          g = true;
          advance(':');
          break;
        case '}':
          indent -= option.indent;
          indentation();
          advance('}', t);
          if (this.cases.length === 1 || this.condition.id === 'true' ||
            this.condition.id === 'false') {
            warning("This 'switch' should be an 'if'.", this);
          }
          funct['(breakage)'] -= 1;
          funct['(verb)'] = undefined;
          return;
        case '(end)':
          error("Missing '{a}'.", nexttoken, '}');
          return;
        default:
          if (g) {
            switch (token.id) {
              case ',':
                error("Each value should have its own case label.");
                return;
              case ':':
                statements();
                break;
              default:
                error("Missing ':' on a case clause.", token);
            }
          } else {
            error("Expected '{a}' and instead saw '{b}'.",
              nexttoken, 'case', nexttoken.value);
          }
      }
    }
  }).labelled = true;
  stmt('debugger', function() {
    if (!option.debug) {
      warning("All 'debugger' statements should be removed.");
    }
    return this;
  }).exps = true;
  (function() {
    var x = stmt('do', function() {
      funct['(breakage)'] += 1;
      funct['(loopage)'] += 1;
      this.first = block(true);
      advance('while');
      var t = nexttoken;
      nonadjacent(token, t);
      advance('(');
      nospace();
      expression(20);
      if (nexttoken.id === '=') {
        if (!option.boss)
          warning("Expected a conditional expression and instead saw an assignment.");
        advance('=');
        expression(20);
      }
      advance(')', t);
      nospace(prevtoken, token);
      funct['(breakage)'] -= 1;
      funct['(loopage)'] -= 1;
      return this;
    });
    x.labelled = true;
    x.exps = true;
  }());
  blockstmt('for', function() {
    var s, t = nexttoken;
    funct['(breakage)'] += 1;
    funct['(loopage)'] += 1;
    advance('(');
    nonadjacent(this, t);
    nospace();
    if (peek(nexttoken.id === 'var' ? 1 : 0).id === 'in') {
      if (nexttoken.id === 'var') {
        advance('var');
        varstatement.fud.call(varstatement, true);
      } else {
        switch (funct[nexttoken.value]) {
          case 'unused':
            funct[nexttoken.value] = 'var';
            break;
          case 'var':
            break;
          default:
            warning("Bad for in variable '{a}'.",
              nexttoken, nexttoken.value);
        }
        advance();
      }
      advance('in');
      expression(20);
      advance(')', t);
      s = block(true, true);
      if (option.forin && (s.length > 1 || typeof s[0] !== 'object' ||
          s[0].value !== 'if')) {
        warning("The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.", this);
      }
      funct['(breakage)'] -= 1;
      funct['(loopage)'] -= 1;
      return this;
    } else {
      if (nexttoken.id !== ';') {
        if (nexttoken.id === 'var') {
          advance('var');
          varstatement.fud.call(varstatement);
        } else {
          for (;;) {
            expression(0, 'for');
            if (nexttoken.id !== ',') {
              break;
            }
            comma();
          }
        }
      }
      nolinebreak(token);
      advance(';');
      if (nexttoken.id !== ';') {
        expression(20);
        if (nexttoken.id === '=') {
          if (!option.boss)
            warning("Expected a conditional expression and instead saw an assignment.");
          advance('=');
          expression(20);
        }
      }
      nolinebreak(token);
      advance(';');
      if (nexttoken.id === ';') {
        error("Expected '{a}' and instead saw '{b}'.",
          nexttoken, ')', ';');
      }
      if (nexttoken.id !== ')') {
        for (;;) {
          expression(0, 'for');
          if (nexttoken.id !== ',') {
            break;
          }
          comma();
        }
      }
      advance(')', t);
      nospace(prevtoken, token);
      block(true, true);
      funct['(breakage)'] -= 1;
      funct['(loopage)'] -= 1;
      return this;
    }
  }).labelled = true;
  stmt('break', function() {
    var v = nexttoken.value;
    if (funct['(breakage)'] === 0) {
      warning("Unexpected '{a}'.", nexttoken, this.value);
    }
    nolinebreak(this);
    if (nexttoken.id !== ';') {
      if (token.line === nexttoken.line) {
        if (funct[v] !== 'label') {
          warning("'{a}' is not a statement label.", nexttoken, v);
        } else if (scope[v] !== funct) {
          warning("'{a}' is out of scope.", nexttoken, v);
        }
        this.first = nexttoken;
        advance();
      }
    }
    reachable('break');
    return this;
  }).exps = true;
  stmt('continue', function() {
    var v = nexttoken.value;
    if (funct['(breakage)'] === 0) {
      warning("Unexpected '{a}'.", nexttoken, this.value);
    }
    nolinebreak(this);
    if (nexttoken.id !== ';') {
      if (token.line === nexttoken.line) {
        if (funct[v] !== 'label') {
          warning("'{a}' is not a statement label.", nexttoken, v);
        } else if (scope[v] !== funct) {
          warning("'{a}' is out of scope.", nexttoken, v);
        }
        this.first = nexttoken;
        advance();
      }
    } else if (!funct['(loopage)']) {
      warning("Unexpected '{a}'.", nexttoken, this.value);
    }
    reachable('continue');
    return this;
  }).exps = true;
  stmt('return', function() {
    nolinebreak(this);
    if (nexttoken.id === '(regexp)') {
      warning("Wrap the /regexp/ literal in parens to disambiguate the slash operator.");
    }
    if (nexttoken.id !== ';' && !nexttoken.reach) {
      nonadjacent(token, nexttoken);
      this.first = expression(20);
    }
    reachable('return');
    return this;
  }).exps = true;
  stmt('throw', function() {
    nolinebreak(this);
    nonadjacent(token, nexttoken);
    this.first = expression(20);
    reachable('throw');
    return this;
  }).exps = true;
  reserve('class');
  reserve('const');
  reserve('enum');
  reserve('export');
  reserve('extends');
  reserve('import');
  reserve('super');
  reserve('let');
  reserve('yield');
  reserve('implements');
  reserve('interface');
  reserve('package');
  reserve('private');
  reserve('protected');
  reserve('public');
  reserve('static');

  function jsonValue() {
    function jsonObject() {
      var o = {},
        t = nexttoken;
      advance('{');
      if (nexttoken.id !== '}') {
        for (;;) {
          if (nexttoken.id === '(end)') {
            error("Missing '}' to match '{' from line {a}.",
              nexttoken, t.line);
          } else if (nexttoken.id === '}') {
            warning("Unexpected comma.", token);
            break;
          } else if (nexttoken.id === ',') {
            error("Unexpected comma.", nexttoken);
          } else if (nexttoken.id !== '(string)') {
            warning("Expected a string and instead saw {a}.",
              nexttoken, nexttoken.value);
          }
          if (o[nexttoken.value] === true) {
            warning("Duplicate key '{a}'.",
              nexttoken, nexttoken.value);
          } else if (nexttoken.value === '__proto__') {
            warning("Stupid key '{a}'.",
              nexttoken, nexttoken.value);
          } else {
            o[nexttoken.value] = true;
          }
          advance();
          advance(':');
          jsonValue();
          if (nexttoken.id !== ',') {
            break;
          }
          advance(',');
        }
      }
      advance('}');
    }

    function jsonArray() {
      var t = nexttoken;
      advance('[');
      if (nexttoken.id !== ']') {
        for (;;) {
          if (nexttoken.id === '(end)') {
            error("Missing ']' to match '[' from line {a}.",
              nexttoken, t.line);
          } else if (nexttoken.id === ']') {
            warning("Unexpected comma.", token);
            break;
          } else if (nexttoken.id === ',') {
            error("Unexpected comma.", nexttoken);
          }
          jsonValue();
          if (nexttoken.id !== ',') {
            break;
          }
          advance(',');
        }
      }
      advance(']');
    }
    switch (nexttoken.id) {
      case '{':
        jsonObject();
        break;
      case '[':
        jsonArray();
        break;
      case 'true':
      case 'false':
      case 'null':
      case '(number)':
      case '(string)':
        advance();
        break;
      case '-':
        advance('-');
        if (token.character !== nexttoken.from) {
          warning("Unexpected space after '-'.", token);
        }
        adjacent(token, nexttoken);
        advance('(number)');
        break;
      default:
        error("Expected a JSON value.", nexttoken);
    }
  }
  var itself = function(s, o, g) {
    var a, i, k;
    JSHINT.errors = [];
    predefined = Object.create(standard);
    combine(predefined, g || {});
    if (o) {
      a = o.predef;
      if (a) {
        if (Array.isArray(a)) {
          for (i = 0; i < a.length; i += 1) {
            predefined[a[i]] = true;
          }
        } else if (typeof a === 'object') {
          k = Object.keys(a);
          for (i = 0; i < k.length; i += 1) {
            predefined[k[i]] = !!a[k];
          }
        }
      }
      option = o;
    } else {
      option = {};
    }
    option.indent = option.indent || 4;
    option.maxerr = option.maxerr || 50;
    tab = '';
    for (i = 0; i < option.indent; i += 1) {
      tab += ' ';
    }
    indent = 1;
    global = Object.create(predefined);
    scope = global;
    funct = {
      '(global)': true,
      '(name)': '(global)',
      '(scope)': scope,
      '(breakage)': 0,
      '(loopage)': 0
    };
    functions = [funct];
    urls = [];
    src = false;
    stack = null;
    member = {};
    membersOnly = null;
    implied = {};
    inblock = false;
    lookahead = [];
    jsonmode = false;
    warnings = 0;
    lex.init(s);
    prereg = true;
    strict_mode = false;
    prevtoken = token = nexttoken = syntax['(begin)'];
    assume();
    try {
      advance();
      switch (nexttoken.id) {
        case '{':
        case '[':
          option.laxbreak = true;
          jsonmode = true;
          jsonValue();
          break;
        default:
          if (nexttoken.value === 'use strict') {
            if (!option.globalstrict)
              warning("Use the function form of \"use strict\".");
            use_strict();
          }
          statements('lib');
      }
      advance('(end)');
    } catch (e) {
      if (e) {
        JSHINT.errors.push({
          type: 'quit',
          reason: e.message,
          line: e.line || nexttoken.line,
          character: e.character || nexttoken.from
        }, null);
      }
    }
    return JSHINT.errors.length === 0;
  };
  itself.data = function() {
    var data = {
        functions: []
      },
      fu, globals, implieds = [],
      f, i, j,
      members = [],
      n, unused = [],
      v;
    if (itself.errors.length) {
      data.errors = itself.errors;
    }
    if (jsonmode) {
      data.json = true;
    }
    for (n in implied) {
      if (is_own(implied, n)) {
        implieds.push({
          name: n,
          line: implied[n]
        });
      }
    }
    if (implieds.length > 0) {
      data.implieds = implieds;
    }
    if (urls.length > 0) {
      data.urls = urls;
    }
    globals = Object.keys(scope);
    if (globals.length > 0) {
      data.globals = globals;
    }
    for (i = 1; i < functions.length; i += 1) {
      f = functions[i];
      fu = {};
      for (j = 0; j < functionicity.length; j += 1) {
        fu[functionicity[j]] = [];
      }
      for (n in f) {
        if (is_own(f, n) && n.charAt(0) !== '(') {
          v = f[n];
          if (v === 'unction') {
            v = 'unused';
          }
          if (Array.isArray(fu[v])) {
            fu[v].push(n);
            if (v === 'unused') {
              unused.push({
                name: n,
                line: f['(line)'],
                'function': f['(name)']
              });
            }
          }
        }
      }
      for (j = 0; j < functionicity.length; j += 1) {
        if (fu[functionicity[j]].length === 0) {
          delete fu[functionicity[j]];
        }
      }
      fu.name = f['(name)'];
      fu.param = f['(params)'];
      fu.line = f['(line)'];
      fu.last = f['(last)'];
      data.functions.push(fu);
    }
    if (unused.length > 0) {
      data.unused = unused;
    }
    members = [];
    for (n in member) {
      if (typeof member[n] === 'number') {
        data.member = member;
        break;
      }
    }
    return data;
  };
  itself.report = function(option) {
    var data = itself.data();
    var a = [],
      c, e, err, f, i, k, l, m = '',
      n, o = [],
      s;

    function detail(h, array) {
      var b, i, singularity;
      if (array) {
        o.push('<div><i>' + h + '</i> ');
        array = array.sort();
        for (i = 0; i < array.length; i += 1) {
          if (array[i] !== singularity) {
            singularity = array[i];
            o.push((b ? ', ' : '') + singularity);
            b = true;
          }
        }
        o.push('</div>');
      }
    }
    if (data.errors || data.implieds || data.unused) {
      err = true;
      o.push('<div id=errors><i>Error:</i>');
      if (data.errors) {
        for (i = 0; i < data.errors.length; i += 1) {
          c = data.errors[i];
          if (c) {
            e = c.evidence || '';
            o.push('<p>Problem' + (isFinite(c.line) ? ' at line ' +
                c.line + ' character ' + c.character : '') +
              ': ' + c.reason.entityify() +
              '</p><p class=evidence>' +
              (e && (e.length > 80 ? e.slice(0, 77) + '...' :
                e).entityify()) + '</p>');
          }
        }
      }
      if (data.implieds) {
        s = [];
        for (i = 0; i < data.implieds.length; i += 1) {
          s[i] = '<code>' + data.implieds[i].name + '</code>&nbsp;<i>' +
            data.implieds[i].line + '</i>';
        }
        o.push('<p><i>Implied global:</i> ' + s.join(', ') + '</p>');
      }
      if (data.unused) {
        s = [];
        for (i = 0; i < data.unused.length; i += 1) {
          s[i] = '<code><u>' + data.unused[i].name + '</u></code>&nbsp;<i>' +
            data.unused[i].line + '</i> <code>' +
            data.unused[i]['function'] + '</code>';
        }
        o.push('<p><i>Unused variable:</i> ' + s.join(', ') + '</p>');
      }
      if (data.json) {
        o.push('<p>JSON: bad.</p>');
      }
      o.push('</div>');
    }
    if (!option) {
      o.push('<br><div id=functions>');
      if (data.urls) {
        detail("URLs<br>", data.urls, '<br>');
      }
      if (data.json && !err) {
        o.push('<p>JSON: good.</p>');
      } else if (data.globals) {
        o.push('<div><i>Global</i> ' +
          data.globals.sort().join(', ') + '</div>');
      } else {
        o.push('<div><i>No new global variables introduced.</i></div>');
      }
      for (i = 0; i < data.functions.length; i += 1) {
        f = data.functions[i];
        o.push('<br><div class=function><i>' + f.line + '-' +
          f.last + '</i> ' + (f.name || '') + '(' +
          (f.param ? f.param.join(', ') : '') + ')</div>');
        detail('<big><b>Unused</b></big>', f.unused);
        detail('Closure', f.closure);
        detail('Variable', f['var']);
        detail('Exception', f.exception);
        detail('Outer', f.outer);
        detail('Global', f.global);
        detail('Label', f.label);
      }
      if (data.member) {
        a = Object.keys(data.member);
        if (a.length) {
          a = a.sort();
          m = '<br><pre id=members>/*members ';
          l = 10;
          for (i = 0; i < a.length; i += 1) {
            k = a[i];
            n = k.name();
            if (l + n.length > 72) {
              o.push(m + '<br>');
              m = '    ';
              l = 1;
            }
            l += n.length + 2;
            if (data.member[k] === 1) {
              n = '<i>' + n + '</i>';
            }
            if (i < a.length - 1) {
              n += ', ';
            }
            m += n;
          }
          o.push(m + '<br>*/</pre>');
        }
        o.push('</div>');
      }
    }
    return o.join('');
  };
  itself.jshint = itself;
  itself.edition = '2011-04-16';
  return itself;
}());
if (typeof exports == 'object' && exports)
  exports.JSHINT = JSHINT;;
/*! RESOURCE: /scripts/snc-code-editor/codemirror-bundle.min.js */
! function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : e.CodeMirror = t()
}(this, function() {
  "use strict";

  function e(e) {
    return new RegExp("(^|\\s)" + e + "(?:$|\\s)\\s*")
  }

  function t(e) {
    for (var t = e.childNodes.length; t > 0; --t) e.removeChild(e.firstChild);
    return e
  }

  function n(e, n) {
    return t(e).appendChild(n)
  }

  function r(e, t, n, r) {
    var i = document.createElement(e);
    if (n && (i.className = n), r && (i.style.cssText = r), "string" == typeof t) i.appendChild(document.createTextNode(t));
    else if (t)
      for (var o = 0; o < t.length; ++o) i.appendChild(t[o]);
    return i
  }

  function i(e, t, n, i) {
    var o = r(e, t, n, i);
    return o.setAttribute("role", "presentation"), o
  }

  function o(e, t) {
    if (3 == t.nodeType && (t = t.parentNode), e.contains) return e.contains(t);
    do
      if (11 == t.nodeType && (t = t.host), t == e) return !0; while (t = t.parentNode)
  }

  function l() {
    var e;
    try {
      e = document.activeElement
    } catch (t) {
      e = document.body || null
    }
    for (; e && e.shadowRoot && e.shadowRoot.activeElement;) e = e.shadowRoot.activeElement;
    return e
  }

  function a(t, n) {
    var r = t.className;
    e(n).test(r) || (t.className += (r ? " " : "") + n)
  }

  function s(t, n) {
    for (var r = t.split(" "), i = 0; i < r.length; i++) r[i] && !e(r[i]).test(n) && (n += " " + r[i]);
    return n
  }

  function c(e) {
    var t = Array.prototype.slice.call(arguments, 1);
    return function() {
      return e.apply(null, t)
    }
  }

  function u(e, t, n) {
    t || (t = {});
    for (var r in e) !e.hasOwnProperty(r) || n === !1 && t.hasOwnProperty(r) || (t[r] = e[r]);
    return t
  }

  function f(e, t, n, r, i) {
    null == t && (t = e.search(/[^\s\u00a0]/), t == -1 && (t = e.length));
    for (var o = r || 0, l = i || 0;;) {
      var a = e.indexOf("\t", o);
      if (a < 0 || a >= t) return l + (t - o);
      l += a - o, l += n - l % n, o = a + 1
    }
  }

  function d(e, t) {
    for (var n = 0; n < e.length; ++n)
      if (e[n] == t) return n;
    return -1
  }

  function h(e, t, n) {
    for (var r = 0, i = 0;;) {
      var o = e.indexOf("\t", r);
      o == -1 && (o = e.length);
      var l = o - r;
      if (o == e.length || i + l >= t) return r + Math.min(l, t - i);
      if (i += o - r, i += n - i % n, r = o + 1, i >= t) return r
    }
  }

  function p(e) {
    for (; Yl.length <= e;) Yl.push(g(Yl) + " ");
    return Yl[e]
  }

  function g(e) {
    return e[e.length - 1]
  }

  function m(e, t) {
    for (var n = [], r = 0; r < e.length; r++) n[r] = t(e[r], r);
    return n
  }

  function v(e, t, n) {
    for (var r = 0, i = n(t); r < e.length && n(e[r]) <= i;) r++;
    e.splice(r, 0, t)
  }

  function y() {}

  function b(e, t) {
    var n;
    return Object.create ? n = Object.create(e) : (y.prototype = e, n = new y), t && u(t, n), n
  }

  function x(e) {
    return /\w/.test(e) || e > "" && (e.toUpperCase() != e.toLowerCase() || Zl.test(e))
  }

  function w(e, t) {
    return t ? !!(t.source.indexOf("\\w") > -1 && x(e)) || t.test(e) : x(e)
  }

  function C(e) {
    for (var t in e)
      if (e.hasOwnProperty(t) && e[t]) return !1;
    return !0
  }

  function k(e) {
    return e.charCodeAt(0) >= 768 && Ql.test(e)
  }

  function S(e, t, n) {
    for (;
      (n < 0 ? t > 0 : t < e.length) && k(e.charAt(t));) t += n;
    return t
  }

  function L(e, t, n) {
    for (var r = t > n ? -1 : 1;;) {
      if (t == n) return t;
      var i = (t + n) / 2,
        o = r < 0 ? Math.ceil(i) : Math.floor(i);
      if (o == t) return e(o) ? t : n;
      e(o) ? n = o : t = o + r
    }
  }

  function T(e, t, n) {
    var o = this;
    this.input = n, o.scrollbarFiller = r("div", null, "CodeMirror-scrollbar-filler"), o.scrollbarFiller.setAttribute("cm-not-content", "true"), o.gutterFiller = r("div", null, "CodeMirror-gutter-filler"), o.gutterFiller.setAttribute("cm-not-content", "true"), o.lineDiv = i("div", null, "CodeMirror-code"), o.selectionDiv = r("div", null, null, "position: relative; z-index: 1"), o.cursorDiv = r("div", null, "CodeMirror-cursors"), o.measure = r("div", null, "CodeMirror-measure"), o.lineMeasure = r("div", null, "CodeMirror-measure"), o.lineSpace = i("div", [o.measure, o.lineMeasure, o.selectionDiv, o.cursorDiv, o.lineDiv], null, "position: relative; outline: none");
    var l = i("div", [o.lineSpace], "CodeMirror-lines");
    o.mover = r("div", [l], null, "position: relative"), o.sizer = r("div", [o.mover], "CodeMirror-sizer"), o.sizerWidth = null, o.heightForcer = r("div", null, null, "position: absolute; height: " + Kl + "px; width: 1px;"), o.gutters = r("div", null, "CodeMirror-gutters"), o.lineGutter = null, o.scroller = r("div", [o.sizer, o.heightForcer, o.gutters], "CodeMirror-scroll"), o.scroller.setAttribute("tabIndex", "-1"), o.wrapper = r("div", [o.scrollbarFiller, o.gutterFiller, o.scroller], "CodeMirror"), wl && Cl < 8 && (o.gutters.style.zIndex = -1, o.scroller.style.paddingRight = 0), kl || vl && Dl || (o.scroller.draggable = !0), e && (e.appendChild ? e.appendChild(o.wrapper) : e(o.wrapper)), o.viewFrom = o.viewTo = t.first, o.reportedViewFrom = o.reportedViewTo = t.first, o.view = [], o.renderedView = null, o.externalMeasured = null, o.viewOffset = 0, o.lastWrapHeight = o.lastWrapWidth = 0, o.updateLineNumbers = null, o.nativeBarWidth = o.barHeight = o.barWidth = 0, o.scrollbarsClipped = !1, o.lineNumWidth = o.lineNumInnerWidth = o.lineNumChars = null, o.alignWidgets = !1, o.cachedCharWidth = o.cachedTextHeight = o.cachedPaddingH = null, o.maxLine = null, o.maxLineLength = 0, o.maxLineChanged = !1, o.wheelDX = o.wheelDY = o.wheelStartX = o.wheelStartY = null, o.shift = !1, o.selForContextMenu = null, o.activeTouch = null, n.init(o)
  }

  function M(e, t) {
    if (t -= e.first, t < 0 || t >= e.size) throw new Error("There is no line " + (t + e.first) + " in the document.");
    for (var n = e; !n.lines;)
      for (var r = 0;; ++r) {
        var i = n.children[r],
          o = i.chunkSize();
        if (t < o) {
          n = i;
          break
        }
        t -= o
      }
    return n.lines[t]
  }

  function O(e, t, n) {
    var r = [],
      i = t.line;
    return e.iter(t.line, n.line + 1, function(e) {
      var o = e.text;
      i == n.line && (o = o.slice(0, n.ch)), i == t.line && (o = o.slice(t.ch)), r.push(o), ++i
    }), r
  }

  function N(e, t, n) {
    var r = [];
    return e.iter(t, n, function(e) {
      r.push(e.text)
    }), r
  }

  function A(e, t) {
    var n = t - e.height;
    if (n)
      for (var r = e; r; r = r.parent) r.height += n
  }

  function P(e) {
    if (null == e.parent) return null;
    for (var t = e.parent, n = d(t.lines, e), r = t.parent; r; t = r, r = r.parent)
      for (var i = 0; r.children[i] != t; ++i) n += r.children[i].chunkSize();
    return n + t.first
  }

  function D(e, t) {
    var n = e.first;
    e: do {
      for (var r = 0; r < e.children.length; ++r) {
        var i = e.children[r],
          o = i.height;
        if (t < o) {
          e = i;
          continue e
        }
        t -= o, n += i.chunkSize()
      }
      return n
    } while (!e.lines);
    for (var l = 0; l < e.lines.length; ++l) {
      var a = e.lines[l],
        s = a.height;
      if (t < s) break;
      t -= s
    }
    return n + l
  }

  function H(e, t) {
    return t >= e.first && t < e.first + e.size
  }

  function F(e, t) {
    return String(e.lineNumberFormatter(t + e.firstLineNumber))
  }

  function W(e, t, n) {
    return void 0 === n && (n = null), this instanceof W ? (this.line = e, this.ch = t, void(this.sticky = n)) : new W(e, t, n)
  }

  function E(e, t) {
    return e.line - t.line || e.ch - t.ch
  }

  function I(e, t) {
    return e.sticky == t.sticky && 0 == E(e, t)
  }

  function R(e) {
    return W(e.line, e.ch)
  }

  function z(e, t) {
    return E(e, t) < 0 ? t : e
  }

  function B(e, t) {
    return E(e, t) < 0 ? e : t
  }

  function j(e, t) {
    return Math.max(e.first, Math.min(t, e.first + e.size - 1))
  }

  function q(e, t) {
    if (t.line < e.first) return W(e.first, 0);
    var n = e.first + e.size - 1;
    return t.line > n ? W(n, M(e, n).text.length) : G(t, M(e, t.line).text.length)
  }

  function G(e, t) {
    var n = e.ch;
    return null == n || n > t ? W(e.line, t) : n < 0 ? W(e.line, 0) : e
  }

  function U(e, t) {
    for (var n = [], r = 0; r < t.length; r++) n[r] = q(e, t[r]);
    return n
  }

  function K() {
    Jl = !0
  }

  function V() {
    ea = !0
  }

  function _(e, t, n) {
    this.marker = e, this.from = t, this.to = n
  }

  function $(e, t) {
    if (e)
      for (var n = 0; n < e.length; ++n) {
        var r = e[n];
        if (r.marker == t) return r
      }
  }

  function X(e, t) {
    for (var n, r = 0; r < e.length; ++r) e[r] != t && (n || (n = [])).push(e[r]);
    return n
  }

  function Y(e, t) {
    e.markedSpans = e.markedSpans ? e.markedSpans.concat([t]) : [t], t.marker.attachLine(e)
  }

  function Z(e, t, n) {
    var r;
    if (e)
      for (var i = 0; i < e.length; ++i) {
        var o = e[i],
          l = o.marker,
          a = null == o.from || (l.inclusiveLeft ? o.from <= t : o.from < t);
        if (a || o.from == t && "bookmark" == l.type && (!n || !o.marker.insertLeft)) {
          var s = null == o.to || (l.inclusiveRight ? o.to >= t : o.to > t);
          (r || (r = [])).push(new _(l, o.from, s ? null : o.to))
        }
      }
    return r
  }

  function Q(e, t, n) {
    var r;
    if (e)
      for (var i = 0; i < e.length; ++i) {
        var o = e[i],
          l = o.marker,
          a = null == o.to || (l.inclusiveRight ? o.to >= t : o.to > t);
        if (a || o.from == t && "bookmark" == l.type && (!n || o.marker.insertLeft)) {
          var s = null == o.from || (l.inclusiveLeft ? o.from <= t : o.from < t);
          (r || (r = [])).push(new _(l, s ? null : o.from - t, null == o.to ? null : o.to - t))
        }
      }
    return r
  }

  function J(e, t) {
    if (t.full) return null;
    var n = H(e, t.from.line) && M(e, t.from.line).markedSpans,
      r = H(e, t.to.line) && M(e, t.to.line).markedSpans;
    if (!n && !r) return null;
    var i = t.from.ch,
      o = t.to.ch,
      l = 0 == E(t.from, t.to),
      a = Z(n, i, l),
      s = Q(r, o, l),
      c = 1 == t.text.length,
      u = g(t.text).length + (c ? i : 0);
    if (a)
      for (var f = 0; f < a.length; ++f) {
        var d = a[f];
        if (null == d.to) {
          var h = $(s, d.marker);
          h ? c && (d.to = null == h.to ? null : h.to + u) : d.to = i
        }
      }
    if (s)
      for (var p = 0; p < s.length; ++p) {
        var m = s[p];
        if (null != m.to && (m.to += u), null == m.from) {
          var v = $(a, m.marker);
          v || (m.from = u, c && (a || (a = [])).push(m))
        } else m.from += u, c && (a || (a = [])).push(m)
      }
    a && (a = ee(a)), s && s != a && (s = ee(s));
    var y = [a];
    if (!c) {
      var b, x = t.text.length - 2;
      if (x > 0 && a)
        for (var w = 0; w < a.length; ++w) null == a[w].to && (b || (b = [])).push(new _(a[w].marker, null, null));
      for (var C = 0; C < x; ++C) y.push(b);
      y.push(s)
    }
    return y
  }

  function ee(e) {
    for (var t = 0; t < e.length; ++t) {
      var n = e[t];
      null != n.from && n.from == n.to && n.marker.clearWhenEmpty !== !1 && e.splice(t--, 1)
    }
    return e.length ? e : null
  }

  function te(e, t, n) {
    var r = null;
    if (e.iter(t.line, n.line + 1, function(e) {
        if (e.markedSpans)
          for (var t = 0; t < e.markedSpans.length; ++t) {
            var n = e.markedSpans[t].marker;
            !n.readOnly || r && d(r, n) != -1 || (r || (r = [])).push(n)
          }
      }), !r) return null;
    for (var i = [{
        from: t,
        to: n
      }], o = 0; o < r.length; ++o)
      for (var l = r[o], a = l.find(0), s = 0; s < i.length; ++s) {
        var c = i[s];
        if (!(E(c.to, a.from) < 0 || E(c.from, a.to) > 0)) {
          var u = [s, 1],
            f = E(c.from, a.from),
            h = E(c.to, a.to);
          (f < 0 || !l.inclusiveLeft && !f) && u.push({
            from: c.from,
            to: a.from
          }), (h > 0 || !l.inclusiveRight && !h) && u.push({
            from: a.to,
            to: c.to
          }), i.splice.apply(i, u), s += u.length - 3
        }
      }
    return i
  }

  function ne(e) {
    var t = e.markedSpans;
    if (t) {
      for (var n = 0; n < t.length; ++n) t[n].marker.detachLine(e);
      e.markedSpans = null
    }
  }

  function re(e, t) {
    if (t) {
      for (var n = 0; n < t.length; ++n) t[n].marker.attachLine(e);
      e.markedSpans = t
    }
  }

  function ie(e) {
    return e.inclusiveLeft ? -1 : 0
  }

  function oe(e) {
    return e.inclusiveRight ? 1 : 0
  }

  function le(e, t) {
    var n = e.lines.length - t.lines.length;
    if (0 != n) return n;
    var r = e.find(),
      i = t.find(),
      o = E(r.from, i.from) || ie(e) - ie(t);
    if (o) return -o;
    var l = E(r.to, i.to) || oe(e) - oe(t);
    return l ? l : t.id - e.id
  }

  function ae(e, t) {
    var n, r = ea && e.markedSpans;
    if (r)
      for (var i = void 0, o = 0; o < r.length; ++o) i = r[o], i.marker.collapsed && null == (t ? i.from : i.to) && (!n || le(n, i.marker) < 0) && (n = i.marker);
    return n
  }

  function se(e) {
    return ae(e, !0)
  }

  function ce(e) {
    return ae(e, !1)
  }

  function ue(e, t) {
    var n, r = ea && e.markedSpans;
    if (r)
      for (var i = 0; i < r.length; ++i) {
        var o = r[i];
        o.marker.collapsed && (null == o.from || o.from < t) && (null == o.to || o.to > t) && (!n || le(n, o.marker) < 0) && (n = o.marker)
      }
    return n
  }

  function fe(e, t, n, r, i) {
    var o = M(e, t),
      l = ea && o.markedSpans;
    if (l)
      for (var a = 0; a < l.length; ++a) {
        var s = l[a];
        if (s.marker.collapsed) {
          var c = s.marker.find(0),
            u = E(c.from, n) || ie(s.marker) - ie(i),
            f = E(c.to, r) || oe(s.marker) - oe(i);
          if (!(u >= 0 && f <= 0 || u <= 0 && f >= 0) && (u <= 0 && (s.marker.inclusiveRight && i.inclusiveLeft ? E(c.to, n) >= 0 : E(c.to, n) > 0) || u >= 0 && (s.marker.inclusiveRight && i.inclusiveLeft ? E(c.from, r) <= 0 : E(c.from, r) < 0))) return !0
        }
      }
  }

  function de(e) {
    for (var t; t = se(e);) e = t.find(-1, !0).line;
    return e
  }

  function he(e) {
    for (var t; t = ce(e);) e = t.find(1, !0).line;
    return e
  }

  function pe(e) {
    for (var t, n; t = ce(e);) e = t.find(1, !0).line, (n || (n = [])).push(e);
    return n
  }

  function ge(e, t) {
    var n = M(e, t),
      r = de(n);
    return n == r ? t : P(r)
  }

  function me(e, t) {
    if (t > e.lastLine()) return t;
    var n, r = M(e, t);
    if (!ve(e, r)) return t;
    for (; n = ce(r);) r = n.find(1, !0).line;
    return P(r) + 1
  }

  function ve(e, t) {
    var n = ea && t.markedSpans;
    if (n)
      for (var r = void 0, i = 0; i < n.length; ++i)
        if (r = n[i], r.marker.collapsed) {
          if (null == r.from) return !0;
          if (!r.marker.widgetNode && 0 == r.from && r.marker.inclusiveLeft && ye(e, t, r)) return !0
        }
  }

  function ye(e, t, n) {
    if (null == n.to) {
      var r = n.marker.find(1, !0);
      return ye(e, r.line, $(r.line.markedSpans, n.marker))
    }
    if (n.marker.inclusiveRight && n.to == t.text.length) return !0;
    for (var i = void 0, o = 0; o < t.markedSpans.length; ++o)
      if (i = t.markedSpans[o], i.marker.collapsed && !i.marker.widgetNode && i.from == n.to && (null == i.to || i.to != n.from) && (i.marker.inclusiveLeft || n.marker.inclusiveRight) && ye(e, t, i)) return !0
  }

  function be(e) {
    e = de(e);
    for (var t = 0, n = e.parent, r = 0; r < n.lines.length; ++r) {
      var i = n.lines[r];
      if (i == e) break;
      t += i.height
    }
    for (var o = n.parent; o; n = o, o = n.parent)
      for (var l = 0; l < o.children.length; ++l) {
        var a = o.children[l];
        if (a == n) break;
        t += a.height
      }
    return t
  }

  function xe(e) {
    if (0 == e.height) return 0;
    for (var t, n = e.text.length, r = e; t = se(r);) {
      var i = t.find(0, !0);
      r = i.from.line, n += i.from.ch - i.to.ch
    }
    for (r = e; t = ce(r);) {
      var o = t.find(0, !0);
      n -= r.text.length - o.from.ch, r = o.to.line, n += r.text.length - o.to.ch
    }
    return n
  }

  function we(e) {
    var t = e.display,
      n = e.doc;
    t.maxLine = M(n, n.first), t.maxLineLength = xe(t.maxLine), t.maxLineChanged = !0, n.iter(function(e) {
      var n = xe(e);
      n > t.maxLineLength && (t.maxLineLength = n, t.maxLine = e)
    })
  }

  function Ce(e, t, n, r) {
    if (!e) return r(t, n, "ltr", 0);
    for (var i = !1, o = 0; o < e.length; ++o) {
      var l = e[o];
      (l.from < n && l.to > t || t == n && l.to == t) && (r(Math.max(l.from, t), Math.min(l.to, n), 1 == l.level ? "rtl" : "ltr", o), i = !0)
    }
    i || r(t, n, "ltr")
  }

  function ke(e, t, n) {
    var r;
    ta = null;
    for (var i = 0; i < e.length; ++i) {
      var o = e[i];
      if (o.from < t && o.to > t) return i;
      o.to == t && (o.from != o.to && "before" == n ? r = i : ta = i), o.from == t && (o.from != o.to && "before" != n ? r = i : ta = i)
    }
    return null != r ? r : ta
  }

  function Se(e, t) {
    var n = e.order;
    return null == n && (n = e.order = na(e.text, t)), n
  }

  function Le(e, t) {
    return e._handlers && e._handlers[t] || ra
  }

  function Te(e, t, n) {
    if (e.removeEventListener) e.removeEventListener(t, n, !1);
    else if (e.detachEvent) e.detachEvent("on" + t, n);
    else {
      var r = e._handlers,
        i = r && r[t];
      if (i) {
        var o = d(i, n);
        o > -1 && (r[t] = i.slice(0, o).concat(i.slice(o + 1)))
      }
    }
  }

  function Me(e, t) {
    var n = Le(e, t);
    if (n.length)
      for (var r = Array.prototype.slice.call(arguments, 2), i = 0; i < n.length; ++i) n[i].apply(null, r)
  }

  function Oe(e, t, n) {
    return "string" == typeof t && (t = {
      type: t,
      preventDefault: function() {
        this.defaultPrevented = !0
      }
    }), Me(e, n || t.type, e, t), Fe(t) || t.codemirrorIgnore
  }

  function Ne(e) {
    var t = e._handlers && e._handlers.cursorActivity;
    if (t)
      for (var n = e.curOp.cursorActivityHandlers || (e.curOp.cursorActivityHandlers = []), r = 0; r < t.length; ++r) d(n, t[r]) == -1 && n.push(t[r])
  }

  function Ae(e, t) {
    return Le(e, t).length > 0
  }

  function Pe(e) {
    e.prototype.on = function(e, t) {
      ia(this, e, t)
    }, e.prototype.off = function(e, t) {
      Te(this, e, t)
    }
  }

  function De(e) {
    e.preventDefault ? e.preventDefault() : e.returnValue = !1
  }

  function He(e) {
    e.stopPropagation ? e.stopPropagation() : e.cancelBubble = !0
  }

  function Fe(e) {
    return null != e.defaultPrevented ? e.defaultPrevented : 0 == e.returnValue
  }

  function We(e) {
    De(e), He(e)
  }

  function Ee(e) {
    return e.target || e.srcElement
  }

  function Ie(e) {
    var t = e.which;
    return null == t && (1 & e.button ? t = 1 : 2 & e.button ? t = 3 : 4 & e.button && (t = 2)), Hl && e.ctrlKey && 1 == t && (t = 3), t
  }

  function Re(e) {
    if (null == Gl) {
      var t = r("span", "​");
      n(e, r("span", [t, document.createTextNode("x")])), 0 != e.firstChild.offsetHeight && (Gl = t.offsetWidth <= 1 && t.offsetHeight > 2 && !(wl && Cl < 8))
    }
    var i = Gl ? r("span", "​") : r("span", " ", null, "display: inline-block; width: 1px; margin-right: -1px");
    return i.setAttribute("cm-text", ""), i
  }

  function ze(e) {
    if (null != Ul) return Ul;
    var r = n(e, document.createTextNode("AخA")),
      i = Il(r, 0, 1).getBoundingClientRect(),
      o = Il(r, 1, 2).getBoundingClientRect();
    return t(e), !(!i || i.left == i.right) && (Ul = o.right - i.right < 3)
  }

  function Be(e) {
    if (null != ca) return ca;
    var t = n(e, r("span", "x")),
      i = t.getBoundingClientRect(),
      o = Il(t, 0, 1).getBoundingClientRect();
    return ca = Math.abs(i.left - o.left) > 1
  }

  function je(e, t) {
    arguments.length > 2 && (t.dependencies = Array.prototype.slice.call(arguments, 2)), ua[e] = t
  }

  function qe(e, t) {
    fa[e] = t
  }

  function Ge(e) {
    if ("string" == typeof e && fa.hasOwnProperty(e)) e = fa[e];
    else if (e && "string" == typeof e.name && fa.hasOwnProperty(e.name)) {
      var t = fa[e.name];
      "string" == typeof t && (t = {
        name: t
      }), e = b(t, e), e.name = t.name
    } else {
      if ("string" == typeof e && /^[\w\-]+\/[\w\-]+\+xml$/.test(e)) return Ge("application/xml");
      if ("string" == typeof e && /^[\w\-]+\/[\w\-]+\+json$/.test(e)) return Ge("application/json")
    }
    return "string" == typeof e ? {
      name: e
    } : e || {
      name: "null"
    }
  }

  function Ue(e, t) {
    t = Ge(t);
    var n = ua[t.name];
    if (!n) return Ue(e, "text/plain");
    var r = n(e, t);
    if (da.hasOwnProperty(t.name)) {
      var i = da[t.name];
      for (var o in i) i.hasOwnProperty(o) && (r.hasOwnProperty(o) && (r["_" + o] = r[o]), r[o] = i[o])
    }
    if (r.name = t.name, t.helperType && (r.helperType = t.helperType), t.modeProps)
      for (var l in t.modeProps) r[l] = t.modeProps[l];
    return r
  }

  function Ke(e, t) {
    var n = da.hasOwnProperty(e) ? da[e] : da[e] = {};
    u(t, n)
  }

  function Ve(e, t) {
    if (t === !0) return t;
    if (e.copyState) return e.copyState(t);
    var n = {};
    for (var r in t) {
      var i = t[r];
      i instanceof Array && (i = i.concat([])), n[r] = i
    }
    return n
  }

  function _e(e, t) {
    for (var n; e.innerMode && (n = e.innerMode(t), n && n.mode != e);) t = n.state, e = n.mode;
    return n || {
      mode: e,
      state: t
    }
  }

  function $e(e, t, n) {
    return !e.startState || e.startState(t, n)
  }

  function Xe(e, t, n, r) {
    var i = [e.state.modeGen],
      o = {};
    rt(e, t.text, e.doc.mode, n, function(e, t) {
      return i.push(e, t)
    }, o, r);
    for (var l = n.state, a = function(r) {
        n.baseTokens = i;
        var a = e.state.overlays[r],
          s = 1,
          c = 0;
        n.state = !0, rt(e, t.text, a.mode, n, function(e, t) {
          for (var n = s; c < e;) {
            var r = i[s];
            r > e && i.splice(s, 1, e, i[s + 1], r), s += 2, c = Math.min(e, r)
          }
          if (t)
            if (a.opaque) i.splice(n, s - n, e, "overlay " + t), s = n + 2;
            else
              for (; n < s; n += 2) {
                var o = i[n + 1];
                i[n + 1] = (o ? o + " " : "") + "overlay " + t
              }
        }, o), n.state = l, n.baseTokens = null, n.baseTokenPos = 1
      }, s = 0; s < e.state.overlays.length; ++s) a(s);
    return {
      styles: i,
      classes: o.bgClass || o.textClass ? o : null
    }
  }

  function Ye(e, t, n) {
    if (!t.styles || t.styles[0] != e.state.modeGen) {
      var r = Ze(e, P(t)),
        i = t.text.length > e.options.maxHighlightLength && Ve(e.doc.mode, r.state),
        o = Xe(e, t, r);
      i && (r.state = i), t.stateAfter = r.save(!i), t.styles = o.styles, o.classes ? t.styleClasses = o.classes : t.styleClasses && (t.styleClasses = null), n === e.doc.highlightFrontier && (e.doc.modeFrontier = Math.max(e.doc.modeFrontier, ++e.doc.highlightFrontier))
    }
    return t.styles
  }

  function Ze(e, t, n) {
    var r = e.doc,
      i = e.display;
    if (!r.mode.startState) return new ga(r, (!0), t);
    var o = it(e, t, n),
      l = o > r.first && M(r, o - 1).stateAfter,
      a = l ? ga.fromSaved(r, l, o) : new ga(r, $e(r.mode), o);
    return r.iter(o, t, function(n) {
      Qe(e, n.text, a);
      var r = a.line;
      n.stateAfter = r == t - 1 || r % 5 == 0 || r >= i.viewFrom && r < i.viewTo ? a.save() : null, a.nextLine()
    }), n && (r.modeFrontier = a.line), a
  }

  function Qe(e, t, n, r) {
    var i = e.doc.mode,
      o = new ha(t, e.options.tabSize, n);
    for (o.start = o.pos = r || 0, "" == t && Je(i, n.state); !o.eol();) et(i, o, n.state), o.start = o.pos
  }

  function Je(e, t) {
    if (e.blankLine) return e.blankLine(t);
    if (e.innerMode) {
      var n = _e(e, t);
      return n.mode.blankLine ? n.mode.blankLine(n.state) : void 0
    }
  }

  function et(e, t, n, r) {
    for (var i = 0; i < 10; i++) {
      r && (r[0] = _e(e, n).mode);
      var o = e.token(t, n);
      if (t.pos > t.start) return o
    }
    throw new Error("Mode " + e.name + " failed to advance stream.")
  }

  function tt(e, t, n, r) {
    var i, o = e.doc,
      l = o.mode;
    t = q(o, t);
    var a, s = M(o, t.line),
      c = Ze(e, t.line, n),
      u = new ha(s.text, e.options.tabSize, c);
    for (r && (a = []);
      (r || u.pos < t.ch) && !u.eol();) u.start = u.pos, i = et(l, u, c.state), r && a.push(new ma(u, i, Ve(o.mode, c.state)));
    return r ? a : new ma(u, i, c.state)
  }

  function nt(e, t) {
    if (e)
      for (;;) {
        var n = e.match(/(?:^|\s+)line-(background-)?(\S+)/);
        if (!n) break;
        e = e.slice(0, n.index) + e.slice(n.index + n[0].length);
        var r = n[1] ? "bgClass" : "textClass";
        null == t[r] ? t[r] = n[2] : new RegExp("(?:^|s)" + n[2] + "(?:$|s)").test(t[r]) || (t[r] += " " + n[2])
      }
    return e
  }

  function rt(e, t, n, r, i, o, l) {
    var a = n.flattenSpans;
    null == a && (a = e.options.flattenSpans);
    var s, c = 0,
      u = null,
      f = new ha(t, e.options.tabSize, r),
      d = e.options.addModeClass && [null];
    for ("" == t && nt(Je(n, r.state), o); !f.eol();) {
      if (f.pos > e.options.maxHighlightLength ? (a = !1, l && Qe(e, t, r, f.pos), f.pos = t.length, s = null) : s = nt(et(n, f, r.state, d), o), d) {
        var h = d[0].name;
        h && (s = "m-" + (s ? h + " " + s : h))
      }
      if (!a || u != s) {
        for (; c < f.start;) c = Math.min(f.start, c + 5e3), i(c, u);
        u = s
      }
      f.start = f.pos
    }
    for (; c < f.pos;) {
      var p = Math.min(f.pos, c + 5e3);
      i(p, u), c = p
    }
  }

  function it(e, t, n) {
    for (var r, i, o = e.doc, l = n ? -1 : t - (e.doc.mode.innerMode ? 1e3 : 100), a = t; a > l; --a) {
      if (a <= o.first) return o.first;
      var s = M(o, a - 1),
        c = s.stateAfter;
      if (c && (!n || a + (c instanceof pa ? c.lookAhead : 0) <= o.modeFrontier)) return a;
      var u = f(s.text, null, e.options.tabSize);
      (null == i || r > u) && (i = a - 1, r = u)
    }
    return i
  }

  function ot(e, t) {
    if (e.modeFrontier = Math.min(e.modeFrontier, t), !(e.highlightFrontier < t - 10)) {
      for (var n = e.first, r = t - 1; r > n; r--) {
        var i = M(e, r).stateAfter;
        if (i && (!(i instanceof pa) || r + i.lookAhead < t)) {
          n = r + 1;
          break
        }
      }
      e.highlightFrontier = Math.min(e.highlightFrontier, n)
    }
  }

  function lt(e, t, n, r) {
    e.text = t, e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null), null != e.order && (e.order = null), ne(e), re(e, n);
    var i = r ? r(e) : 1;
    i != e.height && A(e, i)
  }

  function at(e) {
    e.parent = null, ne(e)
  }

  function st(e, t) {
    if (!e || /^\s*$/.test(e)) return null;
    var n = t.addModeClass ? xa : ba;
    return n[e] || (n[e] = e.replace(/\S+/g, "cm-$&"))
  }

  function ct(e, t) {
    var n = i("span", null, null, kl ? "padding-right: .1px" : null),
      r = {
        pre: i("pre", [n], "CodeMirror-line"),
        content: n,
        col: 0,
        pos: 0,
        cm: e,
        trailingSpace: !1,
        splitSpaces: (wl || kl) && e.getOption("lineWrapping")
      };
    t.measure = {};
    for (var o = 0; o <= (t.rest ? t.rest.length : 0); o++) {
      var l = o ? t.rest[o - 1] : t.line,
        a = void 0;
      r.pos = 0, r.addToken = ft, ze(e.display.measure) && (a = Se(l, e.doc.direction)) && (r.addToken = ht(r.addToken, a)), r.map = [];
      var c = t != e.display.externalMeasured && P(l);
      gt(l, r, Ye(e, l, c)), l.styleClasses && (l.styleClasses.bgClass && (r.bgClass = s(l.styleClasses.bgClass, r.bgClass || "")), l.styleClasses.textClass && (r.textClass = s(l.styleClasses.textClass, r.textClass || ""))), 0 == r.map.length && r.map.push(0, 0, r.content.appendChild(Re(e.display.measure))), 0 == o ? (t.measure.map = r.map, t.measure.cache = {}) : ((t.measure.maps || (t.measure.maps = [])).push(r.map), (t.measure.caches || (t.measure.caches = [])).push({}))
    }
    if (kl) {
      var u = r.content.lastChild;
      (/\bcm-tab\b/.test(u.className) || u.querySelector && u.querySelector(".cm-tab")) && (r.content.className = "cm-tab-wrap-hack")
    }
    return Me(e, "renderLine", e, t.line, r.pre), r.pre.className && (r.textClass = s(r.pre.className, r.textClass || "")), r
  }

  function ut(e) {
    var t = r("span", "•", "cm-invalidchar");
    return t.title = "\\u" + e.charCodeAt(0).toString(16), t.setAttribute("aria-label", t.title), t
  }

  function ft(e, t, n, i, o, l, a) {
    if (t) {
      var s, c = e.splitSpaces ? dt(t, e.trailingSpace) : t,
        u = e.cm.state.specialChars,
        f = !1;
      if (u.test(t)) {
        s = document.createDocumentFragment();
        for (var d = 0;;) {
          u.lastIndex = d;
          var h = u.exec(t),
            g = h ? h.index - d : t.length - d;
          if (g) {
            var m = document.createTextNode(c.slice(d, d + g));
            wl && Cl < 9 ? s.appendChild(r("span", [m])) : s.appendChild(m), e.map.push(e.pos, e.pos + g, m), e.col += g, e.pos += g
          }
          if (!h) break;
          d += g + 1;
          var v = void 0;
          if ("\t" == h[0]) {
            var y = e.cm.options.tabSize,
              b = y - e.col % y;
            v = s.appendChild(r("span", p(b), "cm-tab")), v.setAttribute("role", "presentation"), v.setAttribute("cm-text", "\t"), e.col += b
          } else "\r" == h[0] || "\n" == h[0] ? (v = s.appendChild(r("span", "\r" == h[0] ? "␍" : "␤", "cm-invalidchar")), v.setAttribute("cm-text", h[0]), e.col += 1) : (v = e.cm.options.specialCharPlaceholder(h[0]), v.setAttribute("cm-text", h[0]), wl && Cl < 9 ? s.appendChild(r("span", [v])) : s.appendChild(v), e.col += 1);
          e.map.push(e.pos, e.pos + 1, v), e.pos++
        }
      } else e.col += t.length, s = document.createTextNode(c), e.map.push(e.pos, e.pos + t.length, s), wl && Cl < 9 && (f = !0), e.pos += t.length;
      if (e.trailingSpace = 32 == c.charCodeAt(t.length - 1), n || i || o || f || a) {
        var x = n || "";
        i && (x += i), o && (x += o);
        var w = r("span", [s], x, a);
        return l && (w.title = l), e.content.appendChild(w)
      }
      e.content.appendChild(s)
    }
  }

  function dt(e, t) {
    if (e.length > 1 && !/  /.test(e)) return e;
    for (var n = t, r = "", i = 0; i < e.length; i++) {
      var o = e.charAt(i);
      " " != o || !n || i != e.length - 1 && 32 != e.charCodeAt(i + 1) || (o = " "), r += o, n = " " == o
    }
    return r
  }

  function ht(e, t) {
    return function(n, r, i, o, l, a, s) {
      i = i ? i + " cm-force-border" : "cm-force-border";
      for (var c = n.pos, u = c + r.length;;) {
        for (var f = void 0, d = 0; d < t.length && (f = t[d], !(f.to > c && f.from <= c)); d++);
        if (f.to >= u) return e(n, r, i, o, l, a, s);
        e(n, r.slice(0, f.to - c), i, o, null, a, s), o = null, r = r.slice(f.to - c), c = f.to
      }
    }
  }

  function pt(e, t, n, r) {
    var i = !r && n.widgetNode;
    i && e.map.push(e.pos, e.pos + t, i), !r && e.cm.display.input.needsContentAttribute && (i || (i = e.content.appendChild(document.createElement("span"))), i.setAttribute("cm-marker", n.id)), i && (e.cm.display.input.setUneditable(i), e.content.appendChild(i)), e.pos += t, e.trailingSpace = !1
  }

  function gt(e, t, n) {
    var r = e.markedSpans,
      i = e.text,
      o = 0;
    if (r)
      for (var l, a, s, c, u, f, d, h = i.length, p = 0, g = 1, m = "", v = 0;;) {
        if (v == p) {
          s = c = u = f = a = "", d = null, v = 1 / 0;
          for (var y = [], b = void 0, x = 0; x < r.length; ++x) {
            var w = r[x],
              C = w.marker;
            "bookmark" == C.type && w.from == p && C.widgetNode ? y.push(C) : w.from <= p && (null == w.to || w.to > p || C.collapsed && w.to == p && w.from == p) ? (null != w.to && w.to != p && v > w.to && (v = w.to, c = ""), C.className && (s += " " + C.className), C.css && (a = (a ? a + ";" : "") + C.css), C.startStyle && w.from == p && (u += " " + C.startStyle), C.endStyle && w.to == v && (b || (b = [])).push(C.endStyle, w.to), C.title && !f && (f = C.title), C.collapsed && (!d || le(d.marker, C) < 0) && (d = w)) : w.from > p && v > w.from && (v = w.from)
          }
          if (b)
            for (var k = 0; k < b.length; k += 2) b[k + 1] == v && (c += " " + b[k]);
          if (!d || d.from == p)
            for (var S = 0; S < y.length; ++S) pt(t, 0, y[S]);
          if (d && (d.from || 0) == p) {
            if (pt(t, (null == d.to ? h + 1 : d.to) - p, d.marker, null == d.from), null == d.to) return;
            d.to == p && (d = !1)
          }
        }
        if (p >= h) break;
        for (var L = Math.min(h, v);;) {
          if (m) {
            var T = p + m.length;
            if (!d) {
              var M = T > L ? m.slice(0, L - p) : m;
              t.addToken(t, M, l ? l + s : s, u, p + M.length == v ? c : "", f, a)
            }
            if (T >= L) {
              m = m.slice(L - p), p = L;
              break
            }
            p = T, u = ""
          }
          m = i.slice(o, o = n[g++]), l = st(n[g++], t.cm.options)
        }
      } else
        for (var O = 1; O < n.length; O += 2) t.addToken(t, i.slice(o, o = n[O]), st(n[O + 1], t.cm.options))
  }

  function mt(e, t, n) {
    this.line = t, this.rest = pe(t), this.size = this.rest ? P(g(this.rest)) - n + 1 : 1, this.node = this.text = null, this.hidden = ve(e, t)
  }

  function vt(e, t, n) {
    for (var r, i = [], o = t; o < n; o = r) {
      var l = new mt(e.doc, M(e.doc, o), o);
      r = o + l.size, i.push(l)
    }
    return i
  }

  function yt(e) {
    wa ? wa.ops.push(e) : e.ownsGroup = wa = {
      ops: [e],
      delayedCallbacks: []
    }
  }

  function bt(e) {
    var t = e.delayedCallbacks,
      n = 0;
    do {
      for (; n < t.length; n++) t[n].call(null);
      for (var r = 0; r < e.ops.length; r++) {
        var i = e.ops[r];
        if (i.cursorActivityHandlers)
          for (; i.cursorActivityCalled < i.cursorActivityHandlers.length;) i.cursorActivityHandlers[i.cursorActivityCalled++].call(null, i.cm)
      }
    } while (n < t.length)
  }

  function xt(e, t) {
    var n = e.ownsGroup;
    if (n) try {
      bt(n)
    } finally {
      wa = null, t(n)
    }
  }

  function wt(e, t) {
    var n = Le(e, t);
    if (n.length) {
      var r, i = Array.prototype.slice.call(arguments, 2);
      wa ? r = wa.delayedCallbacks : Ca ? r = Ca : (r = Ca = [], setTimeout(Ct, 0));
      for (var o = function(e) {
          r.push(function() {
            return n[e].apply(null, i)
          })
        }, l = 0; l < n.length; ++l) o(l)
    }
  }

  function Ct() {
    var e = Ca;
    Ca = null;
    for (var t = 0; t < e.length; ++t) e[t]()
  }

  function kt(e, t, n, r) {
    for (var i = 0; i < t.changes.length; i++) {
      var o = t.changes[i];
      "text" == o ? Mt(e, t) : "gutter" == o ? Nt(e, t, n, r) : "class" == o ? Ot(e, t) : "widget" == o && At(e, t, r)
    }
    t.changes = null
  }

  function St(e) {
    return e.node == e.text && (e.node = r("div", null, null, "position: relative"), e.text.parentNode && e.text.parentNode.replaceChild(e.node, e.text), e.node.appendChild(e.text), wl && Cl < 8 && (e.node.style.zIndex = 2)), e.node
  }

  function Lt(e, t) {
    var n = t.bgClass ? t.bgClass + " " + (t.line.bgClass || "") : t.line.bgClass;
    if (n && (n += " CodeMirror-linebackground"), t.background) n ? t.background.className = n : (t.background.parentNode.removeChild(t.background), t.background = null);
    else if (n) {
      var i = St(t);
      t.background = i.insertBefore(r("div", null, n), i.firstChild), e.display.input.setUneditable(t.background)
    }
  }

  function Tt(e, t) {
    var n = e.display.externalMeasured;
    return n && n.line == t.line ? (e.display.externalMeasured = null, t.measure = n.measure, n.built) : ct(e, t)
  }

  function Mt(e, t) {
    var n = t.text.className,
      r = Tt(e, t);
    t.text == t.node && (t.node = r.pre), t.text.parentNode.replaceChild(r.pre, t.text), t.text = r.pre, r.bgClass != t.bgClass || r.textClass != t.textClass ? (t.bgClass = r.bgClass, t.textClass = r.textClass, Ot(e, t)) : n && (t.text.className = n)
  }

  function Ot(e, t) {
    Lt(e, t), t.line.wrapClass ? St(t).className = t.line.wrapClass : t.node != t.text && (t.node.className = "");
    var n = t.textClass ? t.textClass + " " + (t.line.textClass || "") : t.line.textClass;
    t.text.className = n || ""
  }

  function Nt(e, t, n, i) {
    if (t.gutter && (t.node.removeChild(t.gutter), t.gutter = null), t.gutterBackground && (t.node.removeChild(t.gutterBackground), t.gutterBackground = null), t.line.gutterClass) {
      var o = St(t);
      t.gutterBackground = r("div", null, "CodeMirror-gutter-background " + t.line.gutterClass, "left: " + (e.options.fixedGutter ? i.fixedPos : -i.gutterTotalWidth) + "px; width: " + i.gutterTotalWidth + "px"), e.display.input.setUneditable(t.gutterBackground), o.insertBefore(t.gutterBackground, t.text)
    }
    var l = t.line.gutterMarkers;
    if (e.options.lineNumbers || l) {
      var a = St(t),
        s = t.gutter = r("div", null, "CodeMirror-gutter-wrapper", "left: " + (e.options.fixedGutter ? i.fixedPos : -i.gutterTotalWidth) + "px");
      if (e.display.input.setUneditable(s), a.insertBefore(s, t.text), t.line.gutterClass && (s.className += " " + t.line.gutterClass), !e.options.lineNumbers || l && l["CodeMirror-linenumbers"] || (t.lineNumber = s.appendChild(r("div", F(e.options, n), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + i.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + e.display.lineNumInnerWidth + "px"))), l)
        for (var c = 0; c < e.options.gutters.length; ++c) {
          var u = e.options.gutters[c],
            f = l.hasOwnProperty(u) && l[u];
          f && s.appendChild(r("div", [f], "CodeMirror-gutter-elt", "left: " + i.gutterLeft[u] + "px; width: " + i.gutterWidth[u] + "px"))
        }
    }
  }

  function At(e, t, n) {
    t.alignable && (t.alignable = null);
    for (var r = t.node.firstChild, i = void 0; r; r = i) i = r.nextSibling, "CodeMirror-linewidget" == r.className && t.node.removeChild(r);
    Dt(e, t, n)
  }

  function Pt(e, t, n, r) {
    var i = Tt(e, t);
    return t.text = t.node = i.pre, i.bgClass && (t.bgClass = i.bgClass), i.textClass && (t.textClass = i.textClass), Ot(e, t), Nt(e, t, n, r), Dt(e, t, r), t.node
  }

  function Dt(e, t, n) {
    if (Ht(e, t.line, t, n, !0), t.rest)
      for (var r = 0; r < t.rest.length; r++) Ht(e, t.rest[r], t, n, !1)
  }

  function Ht(e, t, n, i, o) {
    if (t.widgets)
      for (var l = St(n), a = 0, s = t.widgets; a < s.length; ++a) {
        var c = s[a],
          u = r("div", [c.node], "CodeMirror-linewidget");
        c.handleMouseEvents || u.setAttribute("cm-ignore-events", "true"), Ft(c, u, n, i), e.display.input.setUneditable(u), o && c.above ? l.insertBefore(u, n.gutter || n.text) : l.appendChild(u), wt(c, "redraw")
      }
  }

  function Ft(e, t, n, r) {
    if (e.noHScroll) {
      (n.alignable || (n.alignable = [])).push(t);
      var i = r.wrapperWidth;
      t.style.left = r.fixedPos + "px", e.coverGutter || (i -= r.gutterTotalWidth, t.style.paddingLeft = r.gutterTotalWidth + "px"), t.style.width = i + "px"
    }
    e.coverGutter && (t.style.zIndex = 5, t.style.position = "relative", e.noHScroll || (t.style.marginLeft = -r.gutterTotalWidth + "px"))
  }

  function Wt(e) {
    if (null != e.height) return e.height;
    var t = e.doc.cm;
    if (!t) return 0;
    if (!o(document.body, e.node)) {
      var i = "position: relative;";
      e.coverGutter && (i += "margin-left: -" + t.display.gutters.offsetWidth + "px;"), e.noHScroll && (i += "width: " + t.display.wrapper.clientWidth + "px;"), n(t.display.measure, r("div", [e.node], null, i))
    }
    return e.height = e.node.parentNode.offsetHeight
  }

  function Et(e, t) {
    for (var n = Ee(t); n != e.wrapper; n = n.parentNode)
      if (!n || 1 == n.nodeType && "true" == n.getAttribute("cm-ignore-events") || n.parentNode == e.sizer && n != e.mover) return !0
  }

  function It(e) {
    return e.lineSpace.offsetTop
  }

  function Rt(e) {
    return e.mover.offsetHeight - e.lineSpace.offsetHeight
  }

  function zt(e) {
    if (e.cachedPaddingH) return e.cachedPaddingH;
    var t = n(e.measure, r("pre", "x")),
      i = window.getComputedStyle ? window.getComputedStyle(t) : t.currentStyle,
      o = {
        left: parseInt(i.paddingLeft),
        right: parseInt(i.paddingRight)
      };
    return isNaN(o.left) || isNaN(o.right) || (e.cachedPaddingH = o), o
  }

  function Bt(e) {
    return Kl - e.display.nativeBarWidth
  }

  function jt(e) {
    return e.display.scroller.clientWidth - Bt(e) - e.display.barWidth
  }

  function qt(e) {
    return e.display.scroller.clientHeight - Bt(e) - e.display.barHeight
  }

  function Gt(e, t, n) {
    var r = e.options.lineWrapping,
      i = r && jt(e);
    if (!t.measure.heights || r && t.measure.width != i) {
      var o = t.measure.heights = [];
      if (r) {
        t.measure.width = i;
        for (var l = t.text.firstChild.getClientRects(), a = 0; a < l.length - 1; a++) {
          var s = l[a],
            c = l[a + 1];
          Math.abs(s.bottom - c.bottom) > 2 && o.push((s.bottom + c.top) / 2 - n.top)
        }
      }
      o.push(n.bottom - n.top)
    }
  }

  function Ut(e, t, n) {
    if (e.line == t) return {
      map: e.measure.map,
      cache: e.measure.cache
    };
    for (var r = 0; r < e.rest.length; r++)
      if (e.rest[r] == t) return {
        map: e.measure.maps[r],
        cache: e.measure.caches[r]
      };
    for (var i = 0; i < e.rest.length; i++)
      if (P(e.rest[i]) > n) return {
        map: e.measure.maps[i],
        cache: e.measure.caches[i],
        before: !0
      }
  }

  function Kt(e, t) {
    t = de(t);
    var r = P(t),
      i = e.display.externalMeasured = new mt(e.doc, t, r);
    i.lineN = r;
    var o = i.built = ct(e, i);
    return i.text = o.pre, n(e.display.lineMeasure, o.pre), i
  }

  function Vt(e, t, n, r) {
    return Xt(e, $t(e, t), n, r)
  }

  function _t(e, t) {
    if (t >= e.display.viewFrom && t < e.display.viewTo) return e.display.view[Mn(e, t)];
    var n = e.display.externalMeasured;
    return n && t >= n.lineN && t < n.lineN + n.size ? n : void 0
  }

  function $t(e, t) {
    var n = P(t),
      r = _t(e, n);
    r && !r.text ? r = null : r && r.changes && (kt(e, r, n, Cn(e)), e.curOp.forceUpdate = !0), r || (r = Kt(e, t));
    var i = Ut(r, t, n);
    return {
      line: t,
      view: r,
      rect: null,
      map: i.map,
      cache: i.cache,
      before: i.before,
      hasHeights: !1
    }
  }

  function Xt(e, t, n, r, i) {
    t.before && (n = -1);
    var o, l = n + (r || "");
    return t.cache.hasOwnProperty(l) ? o = t.cache[l] : (t.rect || (t.rect = t.view.text.getBoundingClientRect()), t.hasHeights || (Gt(e, t.view, t.rect), t.hasHeights = !0), o = Qt(e, t, n, r), o.bogus || (t.cache[l] = o)), {
      left: o.left,
      right: o.right,
      top: i ? o.rtop : o.top,
      bottom: i ? o.rbottom : o.bottom
    }
  }

  function Yt(e, t, n) {
    for (var r, i, o, l, a, s, c = 0; c < e.length; c += 3)
      if (a = e[c], s = e[c + 1], t < a ? (i = 0, o = 1, l = "left") : t < s ? (i = t - a, o = i + 1) : (c == e.length - 3 || t == s && e[c + 3] > t) && (o = s - a, i = o - 1, t >= s && (l = "right")), null != i) {
        if (r = e[c + 2], a == s && n == (r.insertLeft ? "left" : "right") && (l = n), "left" == n && 0 == i)
          for (; c && e[c - 2] == e[c - 3] && e[c - 1].insertLeft;) r = e[(c -= 3) + 2], l = "left";
        if ("right" == n && i == s - a)
          for (; c < e.length - 3 && e[c + 3] == e[c + 4] && !e[c + 5].insertLeft;) r = e[(c += 3) + 2], l = "right";
        break
      } return {
      node: r,
      start: i,
      end: o,
      collapse: l,
      coverStart: a,
      coverEnd: s
    }
  }

  function Zt(e, t) {
    var n = ka;
    if ("left" == t)
      for (var r = 0; r < e.length && (n = e[r]).left == n.right; r++);
    else
      for (var i = e.length - 1; i >= 0 && (n = e[i]).left == n.right; i--);
    return n
  }

  function Qt(e, t, n, r) {
    var i, o = Yt(t.map, n, r),
      l = o.node,
      a = o.start,
      s = o.end,
      c = o.collapse;
    if (3 == l.nodeType) {
      for (var u = 0; u < 4; u++) {
        for (; a && k(t.line.text.charAt(o.coverStart + a));) --a;
        for (; o.coverStart + s < o.coverEnd && k(t.line.text.charAt(o.coverStart + s));) ++s;
        if (i = wl && Cl < 9 && 0 == a && s == o.coverEnd - o.coverStart ? l.parentNode.getBoundingClientRect() : Zt(Il(l, a, s).getClientRects(), r), i.left || i.right || 0 == a) break;
        s = a, a -= 1, c = "right"
      }
      wl && Cl < 11 && (i = Jt(e.display.measure, i))
    } else {
      a > 0 && (c = r = "right");
      var f;
      i = e.options.lineWrapping && (f = l.getClientRects()).length > 1 ? f["right" == r ? f.length - 1 : 0] : l.getBoundingClientRect()
    }
    if (wl && Cl < 9 && !a && (!i || !i.left && !i.right)) {
      var d = l.parentNode.getClientRects()[0];
      i = d ? {
        left: d.left,
        right: d.left + wn(e.display),
        top: d.top,
        bottom: d.bottom
      } : ka
    }
    for (var h = i.top - t.rect.top, p = i.bottom - t.rect.top, g = (h + p) / 2, m = t.view.measure.heights, v = 0; v < m.length - 1 && !(g < m[v]); v++);
    var y = v ? m[v - 1] : 0,
      b = m[v],
      x = {
        left: ("right" == c ? i.right : i.left) - t.rect.left,
        right: ("left" == c ? i.left : i.right) - t.rect.left,
        top: y,
        bottom: b
      };
    return i.left || i.right || (x.bogus = !0), e.options.singleCursorHeightPerLine || (x.rtop = h, x.rbottom = p), x
  }

  function Jt(e, t) {
    if (!window.screen || null == screen.logicalXDPI || screen.logicalXDPI == screen.deviceXDPI || !Be(e)) return t;
    var n = screen.logicalXDPI / screen.deviceXDPI,
      r = screen.logicalYDPI / screen.deviceYDPI;
    return {
      left: t.left * n,
      right: t.right * n,
      top: t.top * r,
      bottom: t.bottom * r
    }
  }

  function en(e) {
    if (e.measure && (e.measure.cache = {}, e.measure.heights = null, e.rest))
      for (var t = 0; t < e.rest.length; t++) e.measure.caches[t] = {}
  }

  function tn(e) {
    e.display.externalMeasure = null, t(e.display.lineMeasure);
    for (var n = 0; n < e.display.view.length; n++) en(e.display.view[n])
  }

  function nn(e) {
    tn(e), e.display.cachedCharWidth = e.display.cachedTextHeight = e.display.cachedPaddingH = null, e.options.lineWrapping || (e.display.maxLineChanged = !0), e.display.lineNumChars = null
  }

  function rn() {
    return Ll && Pl ? -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft)) : window.pageXOffset || (document.documentElement || document.body).scrollLeft
  }

  function on() {
    return Ll && Pl ? -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop)) : window.pageYOffset || (document.documentElement || document.body).scrollTop
  }

  function ln(e) {
    var t = 0;
    if (e.widgets)
      for (var n = 0; n < e.widgets.length; ++n) e.widgets[n].above && (t += Wt(e.widgets[n]));
    return t
  }

  function an(e, t, n, r, i) {
    if (!i) {
      var o = ln(t);
      n.top += o, n.bottom += o
    }
    if ("line" == r) return n;
    r || (r = "local");
    var l = be(t);
    if ("local" == r ? l += It(e.display) : l -= e.display.viewOffset, "page" == r || "window" == r) {
      var a = e.display.lineSpace.getBoundingClientRect();
      l += a.top + ("window" == r ? 0 : on());
      var s = a.left + ("window" == r ? 0 : rn());
      n.left += s, n.right += s
    }
    return n.top += l, n.bottom += l, n
  }

  function sn(e, t, n) {
    if ("div" == n) return t;
    var r = t.left,
      i = t.top;
    if ("page" == n) r -= rn(), i -= on();
    else if ("local" == n || !n) {
      var o = e.display.sizer.getBoundingClientRect();
      r += o.left, i += o.top
    }
    var l = e.display.lineSpace.getBoundingClientRect();
    return {
      left: r - l.left,
      top: i - l.top
    }
  }

  function cn(e, t, n, r, i) {
    return r || (r = M(e.doc, t.line)), an(e, r, Vt(e, r, t.ch, i), n)
  }

  function un(e, t, n, r, i, o) {
    function l(t, l) {
      var a = Xt(e, i, t, l ? "right" : "left", o);
      return l ? a.left = a.right : a.right = a.left, an(e, r, a, n)
    }

    function a(e, t, n) {
      var r = s[t],
        i = 1 == r.level;
      return l(n ? e - 1 : e, i != n)
    }
    r = r || M(e.doc, t.line), i || (i = $t(e, r));
    var s = Se(r, e.doc.direction),
      c = t.ch,
      u = t.sticky;
    if (c >= r.text.length ? (c = r.text.length, u = "before") : c <= 0 && (c = 0, u = "after"), !s) return l("before" == u ? c - 1 : c, "before" == u);
    var f = ke(s, c, u),
      d = ta,
      h = a(c, f, "before" == u);
    return null != d && (h.other = a(c, d, "before" != u)), h
  }

  function fn(e, t) {
    var n = 0;
    t = q(e.doc, t), e.options.lineWrapping || (n = wn(e.display) * t.ch);
    var r = M(e.doc, t.line),
      i = be(r) + It(e.display);
    return {
      left: n,
      right: n,
      top: i,
      bottom: i + r.height
    }
  }

  function dn(e, t, n, r, i) {
    var o = W(e, t, n);
    return o.xRel = i, r && (o.outside = !0), o
  }

  function hn(e, t, n) {
    var r = e.doc;
    if (n += e.display.viewOffset, n < 0) return dn(r.first, 0, null, !0, -1);
    var i = D(r, n),
      o = r.first + r.size - 1;
    if (i > o) return dn(r.first + r.size - 1, M(r, o).text.length, null, !0, 1);
    t < 0 && (t = 0);
    for (var l = M(r, i);;) {
      var a = vn(e, l, i, t, n),
        s = ue(l, a.ch + (a.xRel > 0 ? 1 : 0));
      if (!s) return a;
      var c = s.find(1);
      if (c.line == i) return c;
      l = M(r, i = c.line)
    }
  }

  function pn(e, t, n, r) {
    r -= ln(t);
    var i = t.text.length,
      o = L(function(t) {
        return Xt(e, n, t - 1).bottom <= r
      }, i, 0);
    return i = L(function(t) {
      return Xt(e, n, t).top > r
    }, o, i), {
      begin: o,
      end: i
    }
  }

  function gn(e, t, n, r) {
    n || (n = $t(e, t));
    var i = an(e, t, Xt(e, n, r), "line").top;
    return pn(e, t, n, i)
  }

  function mn(e, t, n, r) {
    return !(e.bottom <= n) && (e.top > n || (r ? e.left : e.right) > t)
  }

  function vn(e, t, n, r, i) {
    i -= be(t);
    var o = $t(e, t),
      l = ln(t),
      a = 0,
      s = t.text.length,
      c = !0,
      u = Se(t, e.doc.direction);
    if (u) {
      var f = (e.options.lineWrapping ? bn : yn)(e, t, n, o, u, r, i);
      c = 1 != f.level, a = c ? f.from : f.to - 1, s = c ? f.to : f.from - 1
    }
    var d, h, p = null,
      g = null,
      m = L(function(t) {
        var n = Xt(e, o, t);
        return n.top += l, n.bottom += l, !!mn(n, r, i, !1) && (n.top <= i && n.left <= r && (p = t, g = n), !0)
      }, a, s),
      v = !1;
    if (g) {
      var y = r - g.left < g.right - r,
        b = y == c;
      m = p + (b ? 0 : 1), h = b ? "after" : "before", d = y ? g.left : g.right
    } else {
      c || m != s && m != a || m++, h = 0 == m ? "after" : m == t.text.length ? "before" : Xt(e, o, m - (c ? 1 : 0)).bottom + l <= i == c ? "after" : "before";
      var x = un(e, W(n, m, h), "line", t, o);
      d = x.left, v = i < x.top || i >= x.bottom
    }
    return m = S(t.text, m, 1), dn(n, m, h, v, r - d)
  }

  function yn(e, t, n, r, i, o, l) {
    var a = L(function(a) {
        var s = i[a],
          c = 1 != s.level;
        return mn(un(e, W(n, c ? s.to : s.from, c ? "before" : "after"), "line", t, r), o, l, !0)
      }, 0, i.length - 1),
      s = i[a];
    if (a > 0) {
      var c = 1 != s.level,
        u = un(e, W(n, c ? s.from : s.to, c ? "after" : "before"), "line", t, r);
      mn(u, o, l, !0) && u.top > l && (s = i[a - 1])
    }
    return s
  }

  function bn(e, t, n, r, i, o, l) {
    var a = pn(e, t, r, l),
      s = a.begin,
      c = a.end;
    /\s/.test(t.text.charAt(c - 1)) && c--;
    for (var u = null, f = null, d = 0; d < i.length; d++) {
      var h = i[d];
      if (!(h.from >= c || h.to <= s)) {
        var p = 1 != h.level,
          g = Xt(e, r, p ? Math.min(c, h.to) - 1 : Math.max(s, h.from)).right,
          m = g < o ? o - g + 1e9 : g - o;
        (!u || f > m) && (u = h, f = m)
      }
    }
    return u || (u = i[i.length - 1]), u.from < s && (u = {
      from: s,
      to: u.to,
      level: u.level
    }), u.to > c && (u = {
      from: u.from,
      to: c,
      level: u.level
    }), u
  }

  function xn(e) {
    if (null != e.cachedTextHeight) return e.cachedTextHeight;
    if (null == ya) {
      ya = r("pre");
      for (var i = 0; i < 49; ++i) ya.appendChild(document.createTextNode("x")), ya.appendChild(r("br"));
      ya.appendChild(document.createTextNode("x"))
    }
    n(e.measure, ya);
    var o = ya.offsetHeight / 50;
    return o > 3 && (e.cachedTextHeight = o), t(e.measure), o || 1
  }

  function wn(e) {
    if (null != e.cachedCharWidth) return e.cachedCharWidth;
    var t = r("span", "xxxxxxxxxx"),
      i = r("pre", [t]);
    n(e.measure, i);
    var o = t.getBoundingClientRect(),
      l = (o.right - o.left) / 10;
    return l > 2 && (e.cachedCharWidth = l), l || 10
  }

  function Cn(e) {
    for (var t = e.display, n = {}, r = {}, i = t.gutters.clientLeft, o = t.gutters.firstChild, l = 0; o; o = o.nextSibling, ++l) n[e.options.gutters[l]] = o.offsetLeft + o.clientLeft + i, r[e.options.gutters[l]] = o.clientWidth;
    return {
      fixedPos: kn(t),
      gutterTotalWidth: t.gutters.offsetWidth,
      gutterLeft: n,
      gutterWidth: r,
      wrapperWidth: t.wrapper.clientWidth
    }
  }

  function kn(e) {
    return e.scroller.getBoundingClientRect().left - e.sizer.getBoundingClientRect().left
  }

  function Sn(e) {
    var t = xn(e.display),
      n = e.options.lineWrapping,
      r = n && Math.max(5, e.display.scroller.clientWidth / wn(e.display) - 3);
    return function(i) {
      if (ve(e.doc, i)) return 0;
      var o = 0;
      if (i.widgets)
        for (var l = 0; l < i.widgets.length; l++) i.widgets[l].height && (o += i.widgets[l].height);
      return n ? o + (Math.ceil(i.text.length / r) || 1) * t : o + t
    }
  }

  function Ln(e) {
    var t = e.doc,
      n = Sn(e);
    t.iter(function(e) {
      var t = n(e);
      t != e.height && A(e, t)
    })
  }

  function Tn(e, t, n, r) {
    var i = e.display;
    if (!n && "true" == Ee(t).getAttribute("cm-not-content")) return null;
    var o, l, a = i.lineSpace.getBoundingClientRect();
    try {
      o = t.clientX - a.left, l = t.clientY - a.top
    } catch (t) {
      return null
    }
    var s, c = hn(e, o, l);
    if (r && 1 == c.xRel && (s = M(e.doc, c.line).text).length == c.ch) {
      var u = f(s, s.length, e.options.tabSize) - s.length;
      c = W(c.line, Math.max(0, Math.round((o - zt(e.display).left) / wn(e.display)) - u))
    }
    return c
  }

  function Mn(e, t) {
    if (t >= e.display.viewTo) return null;
    if (t -= e.display.viewFrom, t < 0) return null;
    for (var n = e.display.view, r = 0; r < n.length; r++)
      if (t -= n[r].size, t < 0) return r
  }

  function On(e) {
    e.display.input.showSelection(e.display.input.prepareSelection())
  }

  function Nn(e, t) {
    void 0 === t && (t = !0);
    for (var n = e.doc, r = {}, i = r.cursors = document.createDocumentFragment(), o = r.selection = document.createDocumentFragment(), l = 0; l < n.sel.ranges.length; l++)
      if (t || l != n.sel.primIndex) {
        var a = n.sel.ranges[l];
        if (!(a.from().line >= e.display.viewTo || a.to().line < e.display.viewFrom)) {
          var s = a.empty();
          (s || e.options.showCursorWhenSelecting) && An(e, a.head, i), s || Dn(e, a, o)
        }
      } return r
  }

  function An(e, t, n) {
    var i = un(e, t, "div", null, null, !e.options.singleCursorHeightPerLine),
      o = n.appendChild(r("div", " ", "CodeMirror-cursor"));
    if (o.style.left = i.left + "px", o.style.top = i.top + "px", o.style.height = Math.max(0, i.bottom - i.top) * e.options.cursorHeight + "px", i.other) {
      var l = n.appendChild(r("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor"));
      l.style.display = "", l.style.left = i.other.left + "px", l.style.top = i.other.top + "px", l.style.height = .85 * (i.other.bottom - i.other.top) + "px"
    }
  }

  function Pn(e, t) {
    return e.top - t.top || e.left - t.left
  }

  function Dn(e, t, n) {
    function i(e, t, n, i) {
      t < 0 && (t = 0), t = Math.round(t), i = Math.round(i), s.appendChild(r("div", null, "CodeMirror-selected", "position: absolute; left: " + e + "px;\n                             top: " + t + "px; width: " + (null == n ? f - e : n) + "px;\n                             height: " + (i - t) + "px"))
    }

    function o(t, n, r) {
      function o(n, r) {
        return cn(e, W(t, n), "div", h, r)
      }

      function l(t, n, r) {
        var i = gn(e, h, null, t),
          l = "ltr" == n == ("after" == r) ? "left" : "right",
          a = "after" == r ? i.begin : i.end - (/\s/.test(h.text.charAt(i.end - 1)) ? 2 : 1);
        return o(a, l)[l]
      }
      var s, c, h = M(a, t),
        p = h.text.length,
        g = Se(h, a.direction);
      return Ce(g, n || 0, null == r ? p : r, function(e, t, a, h) {
        var m = "ltr" == a,
          v = o(e, m ? "left" : "right"),
          y = o(t - 1, m ? "right" : "left"),
          b = null == n && 0 == e,
          x = null == r && t == p,
          w = 0 == h,
          C = !g || h == g.length - 1;
        if (y.top - v.top <= 3) {
          var k = (d ? b : x) && w,
            S = (d ? x : b) && C,
            L = k ? u : (m ? v : y).left,
            T = S ? f : (m ? y : v).right;
          i(L, v.top, T - L, v.bottom)
        } else {
          var M, O, N, A;
          m ? (M = d && b && w ? u : v.left, O = d ? f : l(e, a, "before"), N = d ? u : l(t, a, "after"), A = d && x && C ? f : y.right) : (M = d ? l(e, a, "before") : u, O = !d && b && w ? f : v.right, N = !d && x && C ? u : y.left, A = d ? l(t, a, "after") : f), i(M, v.top, O - M, v.bottom), v.bottom < y.top && i(u, v.bottom, null, y.top), i(N, y.top, A - N, y.bottom)
        }(!s || Pn(v, s) < 0) && (s = v), Pn(y, s) < 0 && (s = y), (!c || Pn(v, c) < 0) && (c = v), Pn(y, c) < 0 && (c = y)
      }), {
        start: s,
        end: c
      }
    }
    var l = e.display,
      a = e.doc,
      s = document.createDocumentFragment(),
      c = zt(e.display),
      u = c.left,
      f = Math.max(l.sizerWidth, jt(e) - l.sizer.offsetLeft) - c.right,
      d = "ltr" == a.direction,
      h = t.from(),
      p = t.to();
    if (h.line == p.line) o(h.line, h.ch, p.ch);
    else {
      var g = M(a, h.line),
        m = M(a, p.line),
        v = de(g) == de(m),
        y = o(h.line, h.ch, v ? g.text.length + 1 : null).end,
        b = o(p.line, v ? 0 : null, p.ch).start;
      v && (y.top < b.top - 2 ? (i(y.right, y.top, null, y.bottom), i(u, b.top, b.left, b.bottom)) : i(y.right, y.top, b.left - y.right, y.bottom)), y.bottom < b.top && i(u, y.bottom, null, b.top)
    }
    n.appendChild(s)
  }

  function Hn(e) {
    if (e.state.focused) {
      var t = e.display;
      clearInterval(t.blinker);
      var n = !0;
      t.cursorDiv.style.visibility = "", e.options.cursorBlinkRate > 0 ? t.blinker = setInterval(function() {
        return t.cursorDiv.style.visibility = (n = !n) ? "" : "hidden"
      }, e.options.cursorBlinkRate) : e.options.cursorBlinkRate < 0 && (t.cursorDiv.style.visibility = "hidden")
    }
  }

  function Fn(e) {
    e.state.focused || (e.display.input.focus(), En(e))
  }

  function Wn(e) {
    e.state.delayingBlurEvent = !0, setTimeout(function() {
      e.state.delayingBlurEvent && (e.state.delayingBlurEvent = !1, In(e))
    }, 100)
  }

  function En(e, t) {
    e.state.delayingBlurEvent && (e.state.delayingBlurEvent = !1), "nocursor" != e.options.readOnly && (e.state.focused || (Me(e, "focus", e, t), e.state.focused = !0, a(e.display.wrapper, "CodeMirror-focused"), e.curOp || e.display.selForContextMenu == e.doc.sel || (e.display.input.reset(), kl && setTimeout(function() {
      return e.display.input.reset(!0)
    }, 20)), e.display.input.receivedFocus()), Hn(e))
  }

  function In(e, t) {
    e.state.delayingBlurEvent || (e.state.focused && (Me(e, "blur", e, t), e.state.focused = !1, Bl(e.display.wrapper, "CodeMirror-focused")), clearInterval(e.display.blinker), setTimeout(function() {
      e.state.focused || (e.display.shift = !1)
    }, 150))
  }

  function Rn(e) {
    for (var t = e.display, n = t.lineDiv.offsetTop, r = 0; r < t.view.length; r++) {
      var i = t.view[r],
        o = void 0;
      if (!i.hidden) {
        if (wl && Cl < 8) {
          var l = i.node.offsetTop + i.node.offsetHeight;
          o = l - n, n = l
        } else {
          var a = i.node.getBoundingClientRect();
          o = a.bottom - a.top
        }
        var s = i.line.height - o;
        if (o < 2 && (o = xn(t)), (s > .005 || s < -.005) && (A(i.line, o), zn(i.line), i.rest))
          for (var c = 0; c < i.rest.length; c++) zn(i.rest[c])
      }
    }
  }

  function zn(e) {
    if (e.widgets)
      for (var t = 0; t < e.widgets.length; ++t) {
        var n = e.widgets[t],
          r = n.node.parentNode;
        r && (n.height = r.offsetHeight)
      }
  }

  function Bn(e, t, n) {
    var r = n && null != n.top ? Math.max(0, n.top) : e.scroller.scrollTop;
    r = Math.floor(r - It(e));
    var i = n && null != n.bottom ? n.bottom : r + e.wrapper.clientHeight,
      o = D(t, r),
      l = D(t, i);
    if (n && n.ensure) {
      var a = n.ensure.from.line,
        s = n.ensure.to.line;
      a < o ? (o = a, l = D(t, be(M(t, a)) + e.wrapper.clientHeight)) : Math.min(s, t.lastLine()) >= l && (o = D(t, be(M(t, s)) - e.wrapper.clientHeight), l = s)
    }
    return {
      from: o,
      to: Math.max(l, o + 1)
    }
  }

  function jn(e) {
    var t = e.display,
      n = t.view;
    if (t.alignWidgets || t.gutters.firstChild && e.options.fixedGutter) {
      for (var r = kn(t) - t.scroller.scrollLeft + e.doc.scrollLeft, i = t.gutters.offsetWidth, o = r + "px", l = 0; l < n.length; l++)
        if (!n[l].hidden) {
          e.options.fixedGutter && (n[l].gutter && (n[l].gutter.style.left = o), n[l].gutterBackground && (n[l].gutterBackground.style.left = o));
          var a = n[l].alignable;
          if (a)
            for (var s = 0; s < a.length; s++) a[s].style.left = o
        } e.options.fixedGutter && (t.gutters.style.left = r + i + "px")
    }
  }

  function qn(e) {
    if (!e.options.lineNumbers) return !1;
    var t = e.doc,
      n = F(e.options, t.first + t.size - 1),
      i = e.display;
    if (n.length != i.lineNumChars) {
      var o = i.measure.appendChild(r("div", [r("div", n)], "CodeMirror-linenumber CodeMirror-gutter-elt")),
        l = o.firstChild.offsetWidth,
        a = o.offsetWidth - l;
      return i.lineGutter.style.width = "", i.lineNumInnerWidth = Math.max(l, i.lineGutter.offsetWidth - a) + 1, i.lineNumWidth = i.lineNumInnerWidth + a, i.lineNumChars = i.lineNumInnerWidth ? n.length : -1, i.lineGutter.style.width = i.lineNumWidth + "px", Hr(e), !0
    }
    return !1
  }

  function Gn(e, t) {
    if (!Oe(e, "scrollCursorIntoView")) {
      var n = e.display,
        i = n.sizer.getBoundingClientRect(),
        o = null;
      if (t.top + i.top < 0 ? o = !0 : t.bottom + i.top > (window.innerHeight || document.documentElement.clientHeight) && (o = !1), null != o && !Nl) {
        var l = r("div", "​", null, "position: absolute;\n                         top: " + (t.top - n.viewOffset - It(e.display)) + "px;\n                         height: " + (t.bottom - t.top + Bt(e) + n.barHeight) + "px;\n                         left: " + t.left + "px; width: " + Math.max(2, t.right - t.left) + "px;");
        e.display.lineSpace.appendChild(l), l.scrollIntoView(o), e.display.lineSpace.removeChild(l)
      }
    }
  }

  function Un(e, t, n, r) {
    null == r && (r = 0);
    var i;
    e.options.lineWrapping || t != n || (t = t.ch ? W(t.line, "before" == t.sticky ? t.ch - 1 : t.ch, "after") : t, n = "before" == t.sticky ? W(t.line, t.ch + 1, "before") : t);
    for (var o = 0; o < 5; o++) {
      var l = !1,
        a = un(e, t),
        s = n && n != t ? un(e, n) : a;
      i = {
        left: Math.min(a.left, s.left),
        top: Math.min(a.top, s.top) - r,
        right: Math.max(a.left, s.left),
        bottom: Math.max(a.bottom, s.bottom) + r
      };
      var c = Vn(e, i),
        u = e.doc.scrollTop,
        f = e.doc.scrollLeft;
      if (null != c.scrollTop && (Jn(e, c.scrollTop), Math.abs(e.doc.scrollTop - u) > 1 && (l = !0)), null != c.scrollLeft && (tr(e, c.scrollLeft), Math.abs(e.doc.scrollLeft - f) > 1 && (l = !0)), !l) break
    }
    return i
  }

  function Kn(e, t) {
    var n = Vn(e, t);
    null != n.scrollTop && Jn(e, n.scrollTop), null != n.scrollLeft && tr(e, n.scrollLeft)
  }

  function Vn(e, t) {
    var n = e.display,
      r = xn(e.display);
    t.top < 0 && (t.top = 0);
    var i = e.curOp && null != e.curOp.scrollTop ? e.curOp.scrollTop : n.scroller.scrollTop,
      o = qt(e),
      l = {};
    t.bottom - t.top > o && (t.bottom = t.top + o);
    var a = e.doc.height + Rt(n),
      s = t.top < r,
      c = t.bottom > a - r;
    if (t.top < i) l.scrollTop = s ? 0 : t.top;
    else if (t.bottom > i + o) {
      var u = Math.min(t.top, (c ? a : t.bottom) - o);
      u != i && (l.scrollTop = u)
    }
    var f = e.curOp && null != e.curOp.scrollLeft ? e.curOp.scrollLeft : n.scroller.scrollLeft,
      d = jt(e) - (e.options.fixedGutter ? n.gutters.offsetWidth : 0),
      h = t.right - t.left > d;
    return h && (t.right = t.left + d), t.left < 10 ? l.scrollLeft = 0 : t.left < f ? l.scrollLeft = Math.max(0, t.left - (h ? 0 : 10)) : t.right > d + f - 3 && (l.scrollLeft = t.right + (h ? 0 : 10) - d), l
  }

  function _n(e, t) {
    null != t && (Zn(e), e.curOp.scrollTop = (null == e.curOp.scrollTop ? e.doc.scrollTop : e.curOp.scrollTop) + t)
  }

  function $n(e) {
    Zn(e);
    var t = e.getCursor();
    e.curOp.scrollToPos = {
      from: t,
      to: t,
      margin: e.options.cursorScrollMargin
    }
  }

  function Xn(e, t, n) {
    null == t && null == n || Zn(e), null != t && (e.curOp.scrollLeft = t), null != n && (e.curOp.scrollTop = n)
  }

  function Yn(e, t) {
    Zn(e), e.curOp.scrollToPos = t
  }

  function Zn(e) {
    var t = e.curOp.scrollToPos;
    if (t) {
      e.curOp.scrollToPos = null;
      var n = fn(e, t.from),
        r = fn(e, t.to);
      Qn(e, n, r, t.margin)
    }
  }

  function Qn(e, t, n, r) {
    var i = Vn(e, {
      left: Math.min(t.left, n.left),
      top: Math.min(t.top, n.top) - r,
      right: Math.max(t.right, n.right),
      bottom: Math.max(t.bottom, n.bottom) + r
    });
    Xn(e, i.scrollLeft, i.scrollTop)
  }

  function Jn(e, t) {
    Math.abs(e.doc.scrollTop - t) < 2 || (vl || Pr(e, {
      top: t
    }), er(e, t, !0), vl && Pr(e), Sr(e, 100))
  }

  function er(e, t, n) {
    t = Math.min(e.display.scroller.scrollHeight - e.display.scroller.clientHeight, t), (e.display.scroller.scrollTop != t || n) && (e.doc.scrollTop = t, e.display.scrollbars.setScrollTop(t), e.display.scroller.scrollTop != t && (e.display.scroller.scrollTop = t))
  }

  function tr(e, t, n, r) {
    t = Math.min(t, e.display.scroller.scrollWidth - e.display.scroller.clientWidth), (n ? t == e.doc.scrollLeft : Math.abs(e.doc.scrollLeft - t) < 2) && !r || (e.doc.scrollLeft = t, jn(e), e.display.scroller.scrollLeft != t && (e.display.scroller.scrollLeft = t), e.display.scrollbars.setScrollLeft(t))
  }

  function nr(e) {
    var t = e.display,
      n = t.gutters.offsetWidth,
      r = Math.round(e.doc.height + Rt(e.display));
    return {
      clientHeight: t.scroller.clientHeight,
      viewHeight: t.wrapper.clientHeight,
      scrollWidth: t.scroller.scrollWidth,
      clientWidth: t.scroller.clientWidth,
      viewWidth: t.wrapper.clientWidth,
      barLeft: e.options.fixedGutter ? n : 0,
      docHeight: r,
      scrollHeight: r + Bt(e) + t.barHeight,
      nativeBarWidth: t.nativeBarWidth,
      gutterWidth: n
    }
  }

  function rr(e, t) {
    t || (t = nr(e));
    var n = e.display.barWidth,
      r = e.display.barHeight;
    ir(e, t);
    for (var i = 0; i < 4 && n != e.display.barWidth || r != e.display.barHeight; i++) n != e.display.barWidth && e.options.lineWrapping && Rn(e), ir(e, nr(e)), n = e.display.barWidth, r = e.display.barHeight
  }

  function ir(e, t) {
    var n = e.display,
      r = n.scrollbars.update(t);
    n.sizer.style.paddingRight = (n.barWidth = r.right) + "px", n.sizer.style.paddingBottom = (n.barHeight = r.bottom) + "px", n.heightForcer.style.borderBottom = r.bottom + "px solid transparent", r.right && r.bottom ? (n.scrollbarFiller.style.display = "block", n.scrollbarFiller.style.height = r.bottom + "px", n.scrollbarFiller.style.width = r.right + "px") : n.scrollbarFiller.style.display = "", r.bottom && e.options.coverGutterNextToScrollbar && e.options.fixedGutter ? (n.gutterFiller.style.display = "block", n.gutterFiller.style.height = r.bottom + "px", n.gutterFiller.style.width = t.gutterWidth + "px") : n.gutterFiller.style.display = ""
  }

  function or(e) {
    e.display.scrollbars && (e.display.scrollbars.clear(), e.display.scrollbars.addClass && Bl(e.display.wrapper, e.display.scrollbars.addClass)), e.display.scrollbars = new Ta[e.options.scrollbarStyle](function(t) {
      e.display.wrapper.insertBefore(t, e.display.scrollbarFiller), ia(t, "mousedown", function() {
        e.state.focused && setTimeout(function() {
          return e.display.input.focus()
        }, 0)
      }), t.setAttribute("cm-not-content", "true")
    }, function(t, n) {
      "horizontal" == n ? tr(e, t) : Jn(e, t)
    }, e), e.display.scrollbars.addClass && a(e.display.wrapper, e.display.scrollbars.addClass)
  }

  function lr(e) {
    e.curOp = {
      cm: e,
      viewChanged: !1,
      startHeight: e.doc.height,
      forceUpdate: !1,
      updateInput: null,
      typing: !1,
      changeObjs: null,
      cursorActivityHandlers: null,
      cursorActivityCalled: 0,
      selectionChanged: !1,
      updateMaxLine: !1,
      scrollLeft: null,
      scrollTop: null,
      scrollToPos: null,
      focus: !1,
      id: ++Ma
    }, yt(e.curOp)
  }

  function ar(e) {
    var t = e.curOp;
    xt(t, function(e) {
      for (var t = 0; t < e.ops.length; t++) e.ops[t].cm.curOp = null;
      sr(e)
    })
  }

  function sr(e) {
    for (var t = e.ops, n = 0; n < t.length; n++) cr(t[n]);
    for (var r = 0; r < t.length; r++) ur(t[r]);
    for (var i = 0; i < t.length; i++) fr(t[i]);
    for (var o = 0; o < t.length; o++) dr(t[o]);
    for (var l = 0; l < t.length; l++) hr(t[l])
  }

  function cr(e) {
    var t = e.cm,
      n = t.display;
    Tr(t), e.updateMaxLine && we(t), e.mustUpdate = e.viewChanged || e.forceUpdate || null != e.scrollTop || e.scrollToPos && (e.scrollToPos.from.line < n.viewFrom || e.scrollToPos.to.line >= n.viewTo) || n.maxLineChanged && t.options.lineWrapping, e.update = e.mustUpdate && new Oa(t, e.mustUpdate && {
      top: e.scrollTop,
      ensure: e.scrollToPos
    }, e.forceUpdate)
  }

  function ur(e) {
    e.updatedDisplay = e.mustUpdate && Nr(e.cm, e.update)
  }

  function fr(e) {
    var t = e.cm,
      n = t.display;
    e.updatedDisplay && Rn(t), e.barMeasure = nr(t), n.maxLineChanged && !t.options.lineWrapping && (e.adjustWidthTo = Vt(t, n.maxLine, n.maxLine.text.length).left + 3, t.display.sizerWidth = e.adjustWidthTo, e.barMeasure.scrollWidth = Math.max(n.scroller.clientWidth, n.sizer.offsetLeft + e.adjustWidthTo + Bt(t) + t.display.barWidth), e.maxScrollLeft = Math.max(0, n.sizer.offsetLeft + e.adjustWidthTo - jt(t))), (e.updatedDisplay || e.selectionChanged) && (e.preparedSelection = n.input.prepareSelection())
  }

  function dr(e) {
    var t = e.cm;
    null != e.adjustWidthTo && (t.display.sizer.style.minWidth = e.adjustWidthTo + "px", e.maxScrollLeft < t.doc.scrollLeft && tr(t, Math.min(t.display.scroller.scrollLeft, e.maxScrollLeft), !0), t.display.maxLineChanged = !1);
    var n = e.focus && e.focus == l();
    e.preparedSelection && t.display.input.showSelection(e.preparedSelection, n), (e.updatedDisplay || e.startHeight != t.doc.height) && rr(t, e.barMeasure), e.updatedDisplay && Fr(t, e.barMeasure), e.selectionChanged && Hn(t), t.state.focused && e.updateInput && t.display.input.reset(e.typing), n && Fn(e.cm)
  }

  function hr(e) {
    var t = e.cm,
      n = t.display,
      r = t.doc;
    if (e.updatedDisplay && Ar(t, e.update), null == n.wheelStartX || null == e.scrollTop && null == e.scrollLeft && !e.scrollToPos || (n.wheelStartX = n.wheelStartY = null), null != e.scrollTop && er(t, e.scrollTop, e.forceScroll), null != e.scrollLeft && tr(t, e.scrollLeft, !0, !0), e.scrollToPos) {
      var i = Un(t, q(r, e.scrollToPos.from), q(r, e.scrollToPos.to), e.scrollToPos.margin);
      Gn(t, i)
    }
    var o = e.maybeHiddenMarkers,
      l = e.maybeUnhiddenMarkers;
    if (o)
      for (var a = 0; a < o.length; ++a) o[a].lines.length || Me(o[a], "hide");
    if (l)
      for (var s = 0; s < l.length; ++s) l[s].lines.length && Me(l[s], "unhide");
    n.wrapper.offsetHeight && (r.scrollTop = t.display.scroller.scrollTop), e.changeObjs && Me(t, "changes", t, e.changeObjs), e.update && e.update.finish()
  }

  function pr(e, t) {
    if (e.curOp) return t();
    lr(e);
    try {
      return t()
    } finally {
      ar(e)
    }
  }

  function gr(e, t) {
    return function() {
      if (e.curOp) return t.apply(e, arguments);
      lr(e);
      try {
        return t.apply(e, arguments)
      } finally {
        ar(e)
      }
    }
  }

  function mr(e) {
    return function() {
      if (this.curOp) return e.apply(this, arguments);
      lr(this);
      try {
        return e.apply(this, arguments)
      } finally {
        ar(this)
      }
    }
  }

  function vr(e) {
    return function() {
      var t = this.cm;
      if (!t || t.curOp) return e.apply(this, arguments);
      lr(t);
      try {
        return e.apply(this, arguments)
      } finally {
        ar(t)
      }
    }
  }

  function yr(e, t, n, r) {
    null == t && (t = e.doc.first), null == n && (n = e.doc.first + e.doc.size), r || (r = 0);
    var i = e.display;
    if (r && n < i.viewTo && (null == i.updateLineNumbers || i.updateLineNumbers > t) && (i.updateLineNumbers = t), e.curOp.viewChanged = !0, t >= i.viewTo) ea && ge(e.doc, t) < i.viewTo && xr(e);
    else if (n <= i.viewFrom) ea && me(e.doc, n + r) > i.viewFrom ? xr(e) : (i.viewFrom += r, i.viewTo += r);
    else if (t <= i.viewFrom && n >= i.viewTo) xr(e);
    else if (t <= i.viewFrom) {
      var o = wr(e, n, n + r, 1);
      o ? (i.view = i.view.slice(o.index), i.viewFrom = o.lineN, i.viewTo += r) : xr(e)
    } else if (n >= i.viewTo) {
      var l = wr(e, t, t, -1);
      l ? (i.view = i.view.slice(0, l.index), i.viewTo = l.lineN) : xr(e)
    } else {
      var a = wr(e, t, t, -1),
        s = wr(e, n, n + r, 1);
      a && s ? (i.view = i.view.slice(0, a.index).concat(vt(e, a.lineN, s.lineN)).concat(i.view.slice(s.index)), i.viewTo += r) : xr(e)
    }
    var c = i.externalMeasured;
    c && (n < c.lineN ? c.lineN += r : t < c.lineN + c.size && (i.externalMeasured = null))
  }

  function br(e, t, n) {
    e.curOp.viewChanged = !0;
    var r = e.display,
      i = e.display.externalMeasured;
    if (i && t >= i.lineN && t < i.lineN + i.size && (r.externalMeasured = null), !(t < r.viewFrom || t >= r.viewTo)) {
      var o = r.view[Mn(e, t)];
      if (null != o.node) {
        var l = o.changes || (o.changes = []);
        d(l, n) == -1 && l.push(n)
      }
    }
  }

  function xr(e) {
    e.display.viewFrom = e.display.viewTo = e.doc.first, e.display.view = [], e.display.viewOffset = 0
  }

  function wr(e, t, n, r) {
    var i, o = Mn(e, t),
      l = e.display.view;
    if (!ea || n == e.doc.first + e.doc.size) return {
      index: o,
      lineN: n
    };
    for (var a = e.display.viewFrom, s = 0; s < o; s++) a += l[s].size;
    if (a != t) {
      if (r > 0) {
        if (o == l.length - 1) return null;
        i = a + l[o].size - t, o++
      } else i = a - t;
      t += i, n += i
    }
    for (; ge(e.doc, n) != n;) {
      if (o == (r < 0 ? 0 : l.length - 1)) return null;
      n += r * l[o - (r < 0 ? 1 : 0)].size, o += r
    }
    return {
      index: o,
      lineN: n
    }
  }

  function Cr(e, t, n) {
    var r = e.display,
      i = r.view;
    0 == i.length || t >= r.viewTo || n <= r.viewFrom ? (r.view = vt(e, t, n), r.viewFrom = t) : (r.viewFrom > t ? r.view = vt(e, t, r.viewFrom).concat(r.view) : r.viewFrom < t && (r.view = r.view.slice(Mn(e, t))), r.viewFrom = t, r.viewTo < n ? r.view = r.view.concat(vt(e, r.viewTo, n)) : r.viewTo > n && (r.view = r.view.slice(0, Mn(e, n)))), r.viewTo = n
  }

  function kr(e) {
    for (var t = e.display.view, n = 0, r = 0; r < t.length; r++) {
      var i = t[r];
      i.hidden || i.node && !i.changes || ++n
    }
    return n
  }

  function Sr(e, t) {
    e.doc.highlightFrontier < e.display.viewTo && e.state.highlight.set(t, c(Lr, e))
  }

  function Lr(e) {
    var t = e.doc;
    if (!(t.highlightFrontier >= e.display.viewTo)) {
      var n = +new Date + e.options.workTime,
        r = Ze(e, t.highlightFrontier),
        i = [];
      t.iter(r.line, Math.min(t.first + t.size, e.display.viewTo + 500), function(o) {
        if (r.line >= e.display.viewFrom) {
          var l = o.styles,
            a = o.text.length > e.options.maxHighlightLength ? Ve(t.mode, r.state) : null,
            s = Xe(e, o, r, !0);
          a && (r.state = a), o.styles = s.styles;
          var c = o.styleClasses,
            u = s.classes;
          u ? o.styleClasses = u : c && (o.styleClasses = null);
          for (var f = !l || l.length != o.styles.length || c != u && (!c || !u || c.bgClass != u.bgClass || c.textClass != u.textClass), d = 0; !f && d < l.length; ++d) f = l[d] != o.styles[d];
          f && i.push(r.line), o.stateAfter = r.save(), r.nextLine()
        } else o.text.length <= e.options.maxHighlightLength && Qe(e, o.text, r), o.stateAfter = r.line % 5 == 0 ? r.save() : null, r.nextLine();
        if (+new Date > n) return Sr(e, e.options.workDelay), !0
      }), t.highlightFrontier = r.line, t.modeFrontier = Math.max(t.modeFrontier, r.line), i.length && pr(e, function() {
        for (var t = 0; t < i.length; t++) br(e, i[t], "text")
      })
    }
  }

  function Tr(e) {
    var t = e.display;
    !t.scrollbarsClipped && t.scroller.offsetWidth && (t.nativeBarWidth = t.scroller.offsetWidth - t.scroller.clientWidth, t.heightForcer.style.height = Bt(e) + "px", t.sizer.style.marginBottom = -t.nativeBarWidth + "px", t.sizer.style.borderRightWidth = Bt(e) + "px", t.scrollbarsClipped = !0)
  }

  function Mr(e) {
    if (e.hasFocus()) return null;
    var t = l();
    if (!t || !o(e.display.lineDiv, t)) return null;
    var n = {
      activeElt: t
    };
    if (window.getSelection) {
      var r = window.getSelection();
      r.anchorNode && r.extend && o(e.display.lineDiv, r.anchorNode) && (n.anchorNode = r.anchorNode, n.anchorOffset = r.anchorOffset, n.focusNode = r.focusNode, n.focusOffset = r.focusOffset)
    }
    return n
  }

  function Or(e) {
    if (e && e.activeElt && e.activeElt != l() && (e.activeElt.focus(), e.anchorNode && o(document.body, e.anchorNode) && o(document.body, e.focusNode))) {
      var t = window.getSelection(),
        n = document.createRange();
      n.setEnd(e.anchorNode, e.anchorOffset), n.collapse(!1), t.removeAllRanges(), t.addRange(n), t.extend(e.focusNode, e.focusOffset)
    }
  }

  function Nr(e, n) {
    var r = e.display,
      i = e.doc;
    if (n.editorIsHidden) return xr(e), !1;
    if (!n.force && n.visible.from >= r.viewFrom && n.visible.to <= r.viewTo && (null == r.updateLineNumbers || r.updateLineNumbers >= r.viewTo) && r.renderedView == r.view && 0 == kr(e)) return !1;
    qn(e) && (xr(e), n.dims = Cn(e));
    var o = i.first + i.size,
      l = Math.max(n.visible.from - e.options.viewportMargin, i.first),
      a = Math.min(o, n.visible.to + e.options.viewportMargin);
    r.viewFrom < l && l - r.viewFrom < 20 && (l = Math.max(i.first, r.viewFrom)), r.viewTo > a && r.viewTo - a < 20 && (a = Math.min(o, r.viewTo)), ea && (l = ge(e.doc, l), a = me(e.doc, a));
    var s = l != r.viewFrom || a != r.viewTo || r.lastWrapHeight != n.wrapperHeight || r.lastWrapWidth != n.wrapperWidth;
    Cr(e, l, a), r.viewOffset = be(M(e.doc, r.viewFrom)), e.display.mover.style.top = r.viewOffset + "px";
    var c = kr(e);
    if (!s && 0 == c && !n.force && r.renderedView == r.view && (null == r.updateLineNumbers || r.updateLineNumbers >= r.viewTo)) return !1;
    var u = Mr(e);
    return c > 4 && (r.lineDiv.style.display = "none"), Dr(e, r.updateLineNumbers, n.dims), c > 4 && (r.lineDiv.style.display = ""), r.renderedView = r.view, Or(u), t(r.cursorDiv), t(r.selectionDiv), r.gutters.style.height = r.sizer.style.minHeight = 0, s && (r.lastWrapHeight = n.wrapperHeight, r.lastWrapWidth = n.wrapperWidth, Sr(e, 400)), r.updateLineNumbers = null, !0
  }

  function Ar(e, t) {
    for (var n = t.viewport, r = !0;
      (r && e.options.lineWrapping && t.oldDisplayWidth != jt(e) || (n && null != n.top && (n = {
        top: Math.min(e.doc.height + Rt(e.display) - qt(e), n.top)
      }), t.visible = Bn(e.display, e.doc, n), !(t.visible.from >= e.display.viewFrom && t.visible.to <= e.display.viewTo))) && Nr(e, t); r = !1) {
      Rn(e);
      var i = nr(e);
      On(e), rr(e, i), Fr(e, i), t.force = !1
    }
    t.signal(e, "update", e), e.display.viewFrom == e.display.reportedViewFrom && e.display.viewTo == e.display.reportedViewTo || (t.signal(e, "viewportChange", e, e.display.viewFrom, e.display.viewTo), e.display.reportedViewFrom = e.display.viewFrom, e.display.reportedViewTo = e.display.viewTo)
  }

  function Pr(e, t) {
    var n = new Oa(e, t);
    if (Nr(e, n)) {
      Rn(e), Ar(e, n);
      var r = nr(e);
      On(e), rr(e, r), Fr(e, r), n.finish()
    }
  }

  function Dr(e, n, r) {
    function i(t) {
      var n = t.nextSibling;
      return kl && Hl && e.display.currentWheelTarget == t ? t.style.display = "none" : t.parentNode.removeChild(t), n
    }
    for (var o = e.display, l = e.options.lineNumbers, a = o.lineDiv, s = a.firstChild, c = o.view, u = o.viewFrom, f = 0; f < c.length; f++) {
      var h = c[f];
      if (h.hidden);
      else if (h.node && h.node.parentNode == a) {
        for (; s != h.node;) s = i(s);
        var p = l && null != n && n <= u && h.lineNumber;
        h.changes && (d(h.changes, "gutter") > -1 && (p = !1), kt(e, h, u, r)), p && (t(h.lineNumber), h.lineNumber.appendChild(document.createTextNode(F(e.options, u)))), s = h.node.nextSibling
      } else {
        var g = Pt(e, h, u, r);
        a.insertBefore(g, s)
      }
      u += h.size
    }
    for (; s;) s = i(s)
  }

  function Hr(e) {
    var t = e.display.gutters.offsetWidth;
    e.display.sizer.style.marginLeft = t + "px"
  }

  function Fr(e, t) {
    e.display.sizer.style.minHeight = t.docHeight + "px", e.display.heightForcer.style.top = t.docHeight + "px", e.display.gutters.style.height = t.docHeight + e.display.barHeight + Bt(e) + "px"
  }

  function Wr(e) {
    var n = e.display.gutters,
      i = e.options.gutters;
    t(n);
    for (var o = 0; o < i.length; ++o) {
      var l = i[o],
        a = n.appendChild(r("div", null, "CodeMirror-gutter " + l));
      "CodeMirror-linenumbers" == l && (e.display.lineGutter = a, a.style.width = (e.display.lineNumWidth || 1) + "px")
    }
    n.style.display = o ? "" : "none", Hr(e)
  }

  function Er(e) {
    var t = d(e.gutters, "CodeMirror-linenumbers");
    t == -1 && e.lineNumbers ? e.gutters = e.gutters.concat(["CodeMirror-linenumbers"]) : t > -1 && !e.lineNumbers && (e.gutters = e.gutters.slice(0), e.gutters.splice(t, 1))
  }

  function Ir(e) {
    var t = e.wheelDeltaX,
      n = e.wheelDeltaY;
    return null == t && e.detail && e.axis == e.HORIZONTAL_AXIS && (t = e.detail), null == n && e.detail && e.axis == e.VERTICAL_AXIS ? n = e.detail : null == n && (n = e.wheelDelta), {
      x: t,
      y: n
    }
  }

  function Rr(e) {
    var t = Ir(e);
    return t.x *= Aa, t.y *= Aa, t
  }

  function zr(e, t) {
    var n = Ir(t),
      r = n.x,
      i = n.y,
      o = e.display,
      l = o.scroller,
      a = l.scrollWidth > l.clientWidth,
      s = l.scrollHeight > l.clientHeight;
    if (r && a || i && s) {
      if (i && Hl && kl) e: for (var c = t.target, u = o.view; c != l; c = c.parentNode)
        for (var f = 0; f < u.length; f++)
          if (u[f].node == c) {
            e.display.currentWheelTarget = c;
            break e
          } if (r && !vl && !Tl && null != Aa) return i && s && Jn(e, Math.max(0, l.scrollTop + i * Aa)), tr(e, Math.max(0, l.scrollLeft + r * Aa)), (!i || i && s) && De(t), void(o.wheelStartX = null);
      if (i && null != Aa) {
        var d = i * Aa,
          h = e.doc.scrollTop,
          p = h + o.wrapper.clientHeight;
        d < 0 ? h = Math.max(0, h + d - 50) : p = Math.min(e.doc.height, p + d + 50), Pr(e, {
          top: h,
          bottom: p
        })
      }
      Na < 20 && (null == o.wheelStartX ? (o.wheelStartX = l.scrollLeft, o.wheelStartY = l.scrollTop, o.wheelDX = r, o.wheelDY = i, setTimeout(function() {
        if (null != o.wheelStartX) {
          var e = l.scrollLeft - o.wheelStartX,
            t = l.scrollTop - o.wheelStartY,
            n = t && o.wheelDY && t / o.wheelDY || e && o.wheelDX && e / o.wheelDX;
          o.wheelStartX = o.wheelStartY = null, n && (Aa = (Aa * Na + n) / (Na + 1), ++Na)
        }
      }, 200)) : (o.wheelDX += r, o.wheelDY += i))
    }
  }

  function Br(e, t) {
    var n = e[t];
    e.sort(function(e, t) {
      return E(e.from(), t.from())
    }), t = d(e, n);
    for (var r = 1; r < e.length; r++) {
      var i = e[r],
        o = e[r - 1];
      if (E(o.to(), i.from()) >= 0) {
        var l = B(o.from(), i.from()),
          a = z(o.to(), i.to()),
          s = o.empty() ? i.from() == i.head : o.from() == o.head;
        r <= t && --t, e.splice(--r, 2, new Da(s ? a : l, s ? l : a))
      }
    }
    return new Pa(e, t)
  }

  function jr(e, t) {
    return new Pa([new Da(e, t || e)], 0)
  }

  function qr(e) {
    return e.text ? W(e.from.line + e.text.length - 1, g(e.text).length + (1 == e.text.length ? e.from.ch : 0)) : e.to
  }

  function Gr(e, t) {
    if (E(e, t.from) < 0) return e;
    if (E(e, t.to) <= 0) return qr(t);
    var n = e.line + t.text.length - (t.to.line - t.from.line) - 1,
      r = e.ch;
    return e.line == t.to.line && (r += qr(t).ch - t.to.ch), W(n, r)
  }

  function Ur(e, t) {
    for (var n = [], r = 0; r < e.sel.ranges.length; r++) {
      var i = e.sel.ranges[r];
      n.push(new Da(Gr(i.anchor, t), Gr(i.head, t)))
    }
    return Br(n, e.sel.primIndex)
  }

  function Kr(e, t, n) {
    return e.line == t.line ? W(n.line, e.ch - t.ch + n.ch) : W(n.line + (e.line - t.line), e.ch)
  }

  function Vr(e, t, n) {
    for (var r = [], i = W(e.first, 0), o = i, l = 0; l < t.length; l++) {
      var a = t[l],
        s = Kr(a.from, i, o),
        c = Kr(qr(a), i, o);
      if (i = a.to, o = c, "around" == n) {
        var u = e.sel.ranges[l],
          f = E(u.head, u.anchor) < 0;
        r[l] = new Da(f ? c : s, f ? s : c)
      } else r[l] = new Da(s, s)
    }
    return new Pa(r, e.sel.primIndex);
  }

  function _r(e) {
    e.doc.mode = Ue(e.options, e.doc.modeOption), $r(e)
  }

  function $r(e) {
    e.doc.iter(function(e) {
      e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null)
    }), e.doc.modeFrontier = e.doc.highlightFrontier = e.doc.first, Sr(e, 100), e.state.modeGen++, e.curOp && yr(e)
  }

  function Xr(e, t) {
    return 0 == t.from.ch && 0 == t.to.ch && "" == g(t.text) && (!e.cm || e.cm.options.wholeLineUpdateBefore)
  }

  function Yr(e, t, n, r) {
    function i(e) {
      return n ? n[e] : null
    }

    function o(e, n, i) {
      lt(e, n, i, r), wt(e, "change", e, t)
    }

    function l(e, t) {
      for (var n = [], o = e; o < t; ++o) n.push(new va(c[o], i(o), r));
      return n
    }
    var a = t.from,
      s = t.to,
      c = t.text,
      u = M(e, a.line),
      f = M(e, s.line),
      d = g(c),
      h = i(c.length - 1),
      p = s.line - a.line;
    if (t.full) e.insert(0, l(0, c.length)), e.remove(c.length, e.size - c.length);
    else if (Xr(e, t)) {
      var m = l(0, c.length - 1);
      o(f, f.text, h), p && e.remove(a.line, p), m.length && e.insert(a.line, m)
    } else if (u == f)
      if (1 == c.length) o(u, u.text.slice(0, a.ch) + d + u.text.slice(s.ch), h);
      else {
        var v = l(1, c.length - 1);
        v.push(new va(d + u.text.slice(s.ch), h, r)), o(u, u.text.slice(0, a.ch) + c[0], i(0)), e.insert(a.line + 1, v)
      }
    else if (1 == c.length) o(u, u.text.slice(0, a.ch) + c[0] + f.text.slice(s.ch), i(0)), e.remove(a.line + 1, p);
    else {
      o(u, u.text.slice(0, a.ch) + c[0], i(0)), o(f, d + f.text.slice(s.ch), h);
      var y = l(1, c.length - 1);
      p > 1 && e.remove(a.line + 1, p - 1), e.insert(a.line + 1, y)
    }
    wt(e, "change", e, t)
  }

  function Zr(e, t, n) {
    function r(e, i, o) {
      if (e.linked)
        for (var l = 0; l < e.linked.length; ++l) {
          var a = e.linked[l];
          if (a.doc != i) {
            var s = o && a.sharedHist;
            n && !s || (t(a.doc, s), r(a.doc, e, s))
          }
        }
    }
    r(e, null, !0)
  }

  function Qr(e, t) {
    if (t.cm) throw new Error("This document is already in use.");
    e.doc = t, t.cm = e, Ln(e), _r(e), Jr(e), e.options.lineWrapping || we(e), e.options.mode = t.modeOption, yr(e)
  }

  function Jr(e) {
    ("rtl" == e.doc.direction ? a : Bl)(e.display.lineDiv, "CodeMirror-rtl")
  }

  function ei(e) {
    pr(e, function() {
      Jr(e), yr(e)
    })
  }

  function ti(e) {
    this.done = [], this.undone = [], this.undoDepth = 1 / 0, this.lastModTime = this.lastSelTime = 0, this.lastOp = this.lastSelOp = null, this.lastOrigin = this.lastSelOrigin = null, this.generation = this.maxGeneration = e || 1
  }

  function ni(e, t) {
    var n = {
      from: R(t.from),
      to: qr(t),
      text: O(e, t.from, t.to)
    };
    return ci(e, n, t.from.line, t.to.line + 1), Zr(e, function(e) {
      return ci(e, n, t.from.line, t.to.line + 1)
    }, !0), n
  }

  function ri(e) {
    for (; e.length;) {
      var t = g(e);
      if (!t.ranges) break;
      e.pop()
    }
  }

  function ii(e, t) {
    return t ? (ri(e.done), g(e.done)) : e.done.length && !g(e.done).ranges ? g(e.done) : e.done.length > 1 && !e.done[e.done.length - 2].ranges ? (e.done.pop(), g(e.done)) : void 0
  }

  function oi(e, t, n, r) {
    var i = e.history;
    i.undone.length = 0;
    var o, l, a = +new Date;
    if ((i.lastOp == r || i.lastOrigin == t.origin && t.origin && ("+" == t.origin.charAt(0) && i.lastModTime > a - (e.cm ? e.cm.options.historyEventDelay : 500) || "*" == t.origin.charAt(0))) && (o = ii(i, i.lastOp == r))) l = g(o.changes), 0 == E(t.from, t.to) && 0 == E(t.from, l.to) ? l.to = qr(t) : o.changes.push(ni(e, t));
    else {
      var s = g(i.done);
      for (s && s.ranges || si(e.sel, i.done), o = {
          changes: [ni(e, t)],
          generation: i.generation
        }, i.done.push(o); i.done.length > i.undoDepth;) i.done.shift(), i.done[0].ranges || i.done.shift()
    }
    i.done.push(n), i.generation = ++i.maxGeneration, i.lastModTime = i.lastSelTime = a, i.lastOp = i.lastSelOp = r, i.lastOrigin = i.lastSelOrigin = t.origin, l || Me(e, "historyAdded")
  }

  function li(e, t, n, r) {
    var i = t.charAt(0);
    return "*" == i || "+" == i && n.ranges.length == r.ranges.length && n.somethingSelected() == r.somethingSelected() && new Date - e.history.lastSelTime <= (e.cm ? e.cm.options.historyEventDelay : 500)
  }

  function ai(e, t, n, r) {
    var i = e.history,
      o = r && r.origin;
    n == i.lastSelOp || o && i.lastSelOrigin == o && (i.lastModTime == i.lastSelTime && i.lastOrigin == o || li(e, o, g(i.done), t)) ? i.done[i.done.length - 1] = t : si(t, i.done), i.lastSelTime = +new Date, i.lastSelOrigin = o, i.lastSelOp = n, r && r.clearRedo !== !1 && ri(i.undone)
  }

  function si(e, t) {
    var n = g(t);
    n && n.ranges && n.equals(e) || t.push(e)
  }

  function ci(e, t, n, r) {
    var i = t["spans_" + e.id],
      o = 0;
    e.iter(Math.max(e.first, n), Math.min(e.first + e.size, r), function(n) {
      n.markedSpans && ((i || (i = t["spans_" + e.id] = {}))[o] = n.markedSpans), ++o
    })
  }

  function ui(e) {
    if (!e) return null;
    for (var t, n = 0; n < e.length; ++n) e[n].marker.explicitlyCleared ? t || (t = e.slice(0, n)) : t && t.push(e[n]);
    return t ? t.length ? t : null : e
  }

  function fi(e, t) {
    var n = t["spans_" + e.id];
    if (!n) return null;
    for (var r = [], i = 0; i < t.text.length; ++i) r.push(ui(n[i]));
    return r
  }

  function di(e, t) {
    var n = fi(e, t),
      r = J(e, t);
    if (!n) return r;
    if (!r) return n;
    for (var i = 0; i < n.length; ++i) {
      var o = n[i],
        l = r[i];
      if (o && l) e: for (var a = 0; a < l.length; ++a) {
        for (var s = l[a], c = 0; c < o.length; ++c)
          if (o[c].marker == s.marker) continue e;
        o.push(s)
      } else l && (n[i] = l)
    }
    return n
  }

  function hi(e, t, n) {
    for (var r = [], i = 0; i < e.length; ++i) {
      var o = e[i];
      if (o.ranges) r.push(n ? Pa.prototype.deepCopy.call(o) : o);
      else {
        var l = o.changes,
          a = [];
        r.push({
          changes: a
        });
        for (var s = 0; s < l.length; ++s) {
          var c = l[s],
            u = void 0;
          if (a.push({
              from: c.from,
              to: c.to,
              text: c.text
            }), t)
            for (var f in c)(u = f.match(/^spans_(\d+)$/)) && d(t, Number(u[1])) > -1 && (g(a)[f] = c[f], delete c[f])
        }
      }
    }
    return r
  }

  function pi(e, t, n, r) {
    if (r) {
      var i = e.anchor;
      if (n) {
        var o = E(t, i) < 0;
        o != E(n, i) < 0 ? (i = t, t = n) : o != E(t, n) < 0 && (t = n)
      }
      return new Da(i, t)
    }
    return new Da(n || t, t)
  }

  function gi(e, t, n, r, i) {
    null == i && (i = e.cm && (e.cm.display.shift || e.extend)), wi(e, new Pa([pi(e.sel.primary(), t, n, i)], 0), r)
  }

  function mi(e, t, n) {
    for (var r = [], i = e.cm && (e.cm.display.shift || e.extend), o = 0; o < e.sel.ranges.length; o++) r[o] = pi(e.sel.ranges[o], t[o], null, i);
    var l = Br(r, e.sel.primIndex);
    wi(e, l, n)
  }

  function vi(e, t, n, r) {
    var i = e.sel.ranges.slice(0);
    i[t] = n, wi(e, Br(i, e.sel.primIndex), r)
  }

  function yi(e, t, n, r) {
    wi(e, jr(t, n), r)
  }

  function bi(e, t, n) {
    var r = {
      ranges: t.ranges,
      update: function(t) {
        var n = this;
        this.ranges = [];
        for (var r = 0; r < t.length; r++) n.ranges[r] = new Da(q(e, t[r].anchor), q(e, t[r].head))
      },
      origin: n && n.origin
    };
    return Me(e, "beforeSelectionChange", e, r), e.cm && Me(e.cm, "beforeSelectionChange", e.cm, r), r.ranges != t.ranges ? Br(r.ranges, r.ranges.length - 1) : t
  }

  function xi(e, t, n) {
    var r = e.history.done,
      i = g(r);
    i && i.ranges ? (r[r.length - 1] = t, Ci(e, t, n)) : wi(e, t, n)
  }

  function wi(e, t, n) {
    Ci(e, t, n), ai(e, e.sel, e.cm ? e.cm.curOp.id : NaN, n)
  }

  function Ci(e, t, n) {
    (Ae(e, "beforeSelectionChange") || e.cm && Ae(e.cm, "beforeSelectionChange")) && (t = bi(e, t, n));
    var r = n && n.bias || (E(t.primary().head, e.sel.primary().head) < 0 ? -1 : 1);
    ki(e, Li(e, t, r, !0)), n && n.scroll === !1 || !e.cm || $n(e.cm)
  }

  function ki(e, t) {
    t.equals(e.sel) || (e.sel = t, e.cm && (e.cm.curOp.updateInput = e.cm.curOp.selectionChanged = !0, Ne(e.cm)), wt(e, "cursorActivity", e))
  }

  function Si(e) {
    ki(e, Li(e, e.sel, null, !1))
  }

  function Li(e, t, n, r) {
    for (var i, o = 0; o < t.ranges.length; o++) {
      var l = t.ranges[o],
        a = t.ranges.length == e.sel.ranges.length && e.sel.ranges[o],
        s = Mi(e, l.anchor, a && a.anchor, n, r),
        c = Mi(e, l.head, a && a.head, n, r);
      (i || s != l.anchor || c != l.head) && (i || (i = t.ranges.slice(0, o)), i[o] = new Da(s, c))
    }
    return i ? Br(i, t.primIndex) : t
  }

  function Ti(e, t, n, r, i) {
    var o = M(e, t.line);
    if (o.markedSpans)
      for (var l = 0; l < o.markedSpans.length; ++l) {
        var a = o.markedSpans[l],
          s = a.marker;
        if ((null == a.from || (s.inclusiveLeft ? a.from <= t.ch : a.from < t.ch)) && (null == a.to || (s.inclusiveRight ? a.to >= t.ch : a.to > t.ch))) {
          if (i && (Me(s, "beforeCursorEnter"), s.explicitlyCleared)) {
            if (o.markedSpans) {
              --l;
              continue
            }
            break
          }
          if (!s.atomic) continue;
          if (n) {
            var c = s.find(r < 0 ? 1 : -1),
              u = void 0;
            if ((r < 0 ? s.inclusiveRight : s.inclusiveLeft) && (c = Oi(e, c, -r, c && c.line == t.line ? o : null)), c && c.line == t.line && (u = E(c, n)) && (r < 0 ? u < 0 : u > 0)) return Ti(e, c, t, r, i)
          }
          var f = s.find(r < 0 ? -1 : 1);
          return (r < 0 ? s.inclusiveLeft : s.inclusiveRight) && (f = Oi(e, f, r, f.line == t.line ? o : null)), f ? Ti(e, f, t, r, i) : null
        }
      }
    return t
  }

  function Mi(e, t, n, r, i) {
    var o = r || 1,
      l = Ti(e, t, n, o, i) || !i && Ti(e, t, n, o, !0) || Ti(e, t, n, -o, i) || !i && Ti(e, t, n, -o, !0);
    return l ? l : (e.cantEdit = !0, W(e.first, 0))
  }

  function Oi(e, t, n, r) {
    return n < 0 && 0 == t.ch ? t.line > e.first ? q(e, W(t.line - 1)) : null : n > 0 && t.ch == (r || M(e, t.line)).text.length ? t.line < e.first + e.size - 1 ? W(t.line + 1, 0) : null : new W(t.line, t.ch + n)
  }

  function Ni(e) {
    e.setSelection(W(e.firstLine(), 0), W(e.lastLine()), _l)
  }

  function Ai(e, t, n) {
    var r = {
      canceled: !1,
      from: t.from,
      to: t.to,
      text: t.text,
      origin: t.origin,
      cancel: function() {
        return r.canceled = !0
      }
    };
    return n && (r.update = function(t, n, i, o) {
      t && (r.from = q(e, t)), n && (r.to = q(e, n)), i && (r.text = i), void 0 !== o && (r.origin = o)
    }), Me(e, "beforeChange", e, r), e.cm && Me(e.cm, "beforeChange", e.cm, r), r.canceled ? null : {
      from: r.from,
      to: r.to,
      text: r.text,
      origin: r.origin
    }
  }

  function Pi(e, t, n) {
    if (e.cm) {
      if (!e.cm.curOp) return gr(e.cm, Pi)(e, t, n);
      if (e.cm.state.suppressEdits) return
    }
    if (!(Ae(e, "beforeChange") || e.cm && Ae(e.cm, "beforeChange")) || (t = Ai(e, t, !0))) {
      var r = Jl && !n && te(e, t.from, t.to);
      if (r)
        for (var i = r.length - 1; i >= 0; --i) Di(e, {
          from: r[i].from,
          to: r[i].to,
          text: i ? [""] : t.text,
          origin: t.origin
        });
      else Di(e, t)
    }
  }

  function Di(e, t) {
    if (1 != t.text.length || "" != t.text[0] || 0 != E(t.from, t.to)) {
      var n = Ur(e, t);
      oi(e, t, n, e.cm ? e.cm.curOp.id : NaN), Wi(e, t, n, J(e, t));
      var r = [];
      Zr(e, function(e, n) {
        n || d(r, e.history) != -1 || (Bi(e.history, t), r.push(e.history)), Wi(e, t, null, J(e, t))
      })
    }
  }

  function Hi(e, t, n) {
    var r = e.cm && e.cm.state.suppressEdits;
    if (!r || n) {
      for (var i, o = e.history, l = e.sel, a = "undo" == t ? o.done : o.undone, s = "undo" == t ? o.undone : o.done, c = 0; c < a.length && (i = a[c], n ? !i.ranges || i.equals(e.sel) : i.ranges); c++);
      if (c != a.length) {
        for (o.lastOrigin = o.lastSelOrigin = null;;) {
          if (i = a.pop(), !i.ranges) {
            if (r) return void a.push(i);
            break
          }
          if (si(i, s), n && !i.equals(e.sel)) return void wi(e, i, {
            clearRedo: !1
          });
          l = i
        }
        var u = [];
        si(l, s), s.push({
          changes: u,
          generation: o.generation
        }), o.generation = i.generation || ++o.maxGeneration;
        for (var f = Ae(e, "beforeChange") || e.cm && Ae(e.cm, "beforeChange"), h = function(n) {
            var r = i.changes[n];
            if (r.origin = t, f && !Ai(e, r, !1)) return a.length = 0, {};
            u.push(ni(e, r));
            var o = n ? Ur(e, r) : g(a);
            Wi(e, r, o, di(e, r)), !n && e.cm && e.cm.scrollIntoView({
              from: r.from,
              to: qr(r)
            });
            var l = [];
            Zr(e, function(e, t) {
              t || d(l, e.history) != -1 || (Bi(e.history, r), l.push(e.history)), Wi(e, r, null, di(e, r))
            })
          }, p = i.changes.length - 1; p >= 0; --p) {
          var m = h(p);
          if (m) return m.v
        }
      }
    }
  }

  function Fi(e, t) {
    if (0 != t && (e.first += t, e.sel = new Pa(m(e.sel.ranges, function(e) {
        return new Da(W(e.anchor.line + t, e.anchor.ch), W(e.head.line + t, e.head.ch))
      }), e.sel.primIndex), e.cm)) {
      yr(e.cm, e.first, e.first - t, t);
      for (var n = e.cm.display, r = n.viewFrom; r < n.viewTo; r++) br(e.cm, r, "gutter")
    }
  }

  function Wi(e, t, n, r) {
    if (e.cm && !e.cm.curOp) return gr(e.cm, Wi)(e, t, n, r);
    if (t.to.line < e.first) return void Fi(e, t.text.length - 1 - (t.to.line - t.from.line));
    if (!(t.from.line > e.lastLine())) {
      if (t.from.line < e.first) {
        var i = t.text.length - 1 - (e.first - t.from.line);
        Fi(e, i), t = {
          from: W(e.first, 0),
          to: W(t.to.line + i, t.to.ch),
          text: [g(t.text)],
          origin: t.origin
        }
      }
      var o = e.lastLine();
      t.to.line > o && (t = {
        from: t.from,
        to: W(o, M(e, o).text.length),
        text: [t.text[0]],
        origin: t.origin
      }), t.removed = O(e, t.from, t.to), n || (n = Ur(e, t)), e.cm ? Ei(e.cm, t, r) : Yr(e, t, r), Ci(e, n, _l)
    }
  }

  function Ei(e, t, n) {
    var r = e.doc,
      i = e.display,
      o = t.from,
      l = t.to,
      a = !1,
      s = o.line;
    e.options.lineWrapping || (s = P(de(M(r, o.line))), r.iter(s, l.line + 1, function(e) {
      if (e == i.maxLine) return a = !0, !0
    })), r.sel.contains(t.from, t.to) > -1 && Ne(e), Yr(r, t, n, Sn(e)), e.options.lineWrapping || (r.iter(s, o.line + t.text.length, function(e) {
      var t = xe(e);
      t > i.maxLineLength && (i.maxLine = e, i.maxLineLength = t, i.maxLineChanged = !0, a = !1)
    }), a && (e.curOp.updateMaxLine = !0)), ot(r, o.line), Sr(e, 400);
    var c = t.text.length - (l.line - o.line) - 1;
    t.full ? yr(e) : o.line != l.line || 1 != t.text.length || Xr(e.doc, t) ? yr(e, o.line, l.line + 1, c) : br(e, o.line, "text");
    var u = Ae(e, "changes"),
      f = Ae(e, "change");
    if (f || u) {
      var d = {
        from: o,
        to: l,
        text: t.text,
        removed: t.removed,
        origin: t.origin
      };
      f && wt(e, "change", e, d), u && (e.curOp.changeObjs || (e.curOp.changeObjs = [])).push(d)
    }
    e.display.selForContextMenu = null
  }

  function Ii(e, t, n, r, i) {
    if (r || (r = n), E(r, n) < 0) {
      var o;
      o = [r, n], n = o[0], r = o[1]
    }
    "string" == typeof t && (t = e.splitLines(t)), Pi(e, {
      from: n,
      to: r,
      text: t,
      origin: i
    })
  }

  function Ri(e, t, n, r) {
    n < e.line ? e.line += r : t < e.line && (e.line = t, e.ch = 0)
  }

  function zi(e, t, n, r) {
    for (var i = 0; i < e.length; ++i) {
      var o = e[i],
        l = !0;
      if (o.ranges) {
        o.copied || (o = e[i] = o.deepCopy(), o.copied = !0);
        for (var a = 0; a < o.ranges.length; a++) Ri(o.ranges[a].anchor, t, n, r), Ri(o.ranges[a].head, t, n, r)
      } else {
        for (var s = 0; s < o.changes.length; ++s) {
          var c = o.changes[s];
          if (n < c.from.line) c.from = W(c.from.line + r, c.from.ch), c.to = W(c.to.line + r, c.to.ch);
          else if (t <= c.to.line) {
            l = !1;
            break
          }
        }
        l || (e.splice(0, i + 1), i = 0)
      }
    }
  }

  function Bi(e, t) {
    var n = t.from.line,
      r = t.to.line,
      i = t.text.length - (r - n) - 1;
    zi(e.done, n, r, i), zi(e.undone, n, r, i)
  }

  function ji(e, t, n, r) {
    var i = t,
      o = t;
    return "number" == typeof t ? o = M(e, j(e, t)) : i = P(t), null == i ? null : (r(o, i) && e.cm && br(e.cm, i, n), o)
  }

  function qi(e) {
    var t = this;
    this.lines = e, this.parent = null;
    for (var n = 0, r = 0; r < e.length; ++r) e[r].parent = t, n += e[r].height;
    this.height = n
  }

  function Gi(e) {
    var t = this;
    this.children = e;
    for (var n = 0, r = 0, i = 0; i < e.length; ++i) {
      var o = e[i];
      n += o.chunkSize(), r += o.height, o.parent = t
    }
    this.size = n, this.height = r, this.parent = null
  }

  function Ui(e, t, n) {
    be(t) < (e.curOp && e.curOp.scrollTop || e.doc.scrollTop) && _n(e, n)
  }

  function Ki(e, t, n, r) {
    var i = new Ha(e, n, r),
      o = e.cm;
    return o && i.noHScroll && (o.display.alignWidgets = !0), ji(e, t, "widget", function(t) {
      var n = t.widgets || (t.widgets = []);
      if (null == i.insertAt ? n.push(i) : n.splice(Math.min(n.length - 1, Math.max(0, i.insertAt)), 0, i), i.line = t, o && !ve(e, t)) {
        var r = be(t) < e.scrollTop;
        A(t, t.height + Wt(i)), r && _n(o, i.height), o.curOp.forceUpdate = !0
      }
      return !0
    }), o && wt(o, "lineWidgetAdded", o, i, "number" == typeof t ? t : P(t)), i
  }

  function Vi(e, t, n, r, o) {
    if (r && r.shared) return _i(e, t, n, r, o);
    if (e.cm && !e.cm.curOp) return gr(e.cm, Vi)(e, t, n, r, o);
    var l = new Wa(e, o),
      a = E(t, n);
    if (r && u(r, l, !1), a > 0 || 0 == a && l.clearWhenEmpty !== !1) return l;
    if (l.replacedWith && (l.collapsed = !0, l.widgetNode = i("span", [l.replacedWith], "CodeMirror-widget"), r.handleMouseEvents || l.widgetNode.setAttribute("cm-ignore-events", "true"), r.insertLeft && (l.widgetNode.insertLeft = !0)), l.collapsed) {
      if (fe(e, t.line, t, n, l) || t.line != n.line && fe(e, n.line, t, n, l)) throw new Error("Inserting collapsed marker partially overlapping an existing one");
      V()
    }
    l.addToHistory && oi(e, {
      from: t,
      to: n,
      origin: "markText"
    }, e.sel, NaN);
    var s, c = t.line,
      f = e.cm;
    if (e.iter(c, n.line + 1, function(e) {
        f && l.collapsed && !f.options.lineWrapping && de(e) == f.display.maxLine && (s = !0), l.collapsed && c != t.line && A(e, 0), Y(e, new _(l, c == t.line ? t.ch : null, c == n.line ? n.ch : null)), ++c
      }), l.collapsed && e.iter(t.line, n.line + 1, function(t) {
        ve(e, t) && A(t, 0)
      }), l.clearOnEnter && ia(l, "beforeCursorEnter", function() {
        return l.clear()
      }), l.readOnly && (K(), (e.history.done.length || e.history.undone.length) && e.clearHistory()), l.collapsed && (l.id = ++Fa, l.atomic = !0), f) {
      if (s && (f.curOp.updateMaxLine = !0), l.collapsed) yr(f, t.line, n.line + 1);
      else if (l.className || l.title || l.startStyle || l.endStyle || l.css)
        for (var d = t.line; d <= n.line; d++) br(f, d, "text");
      l.atomic && Si(f.doc), wt(f, "markerAdded", f, l)
    }
    return l
  }

  function _i(e, t, n, r, i) {
    r = u(r), r.shared = !1;
    var o = [Vi(e, t, n, r, i)],
      l = o[0],
      a = r.widgetNode;
    return Zr(e, function(e) {
      a && (r.widgetNode = a.cloneNode(!0)), o.push(Vi(e, q(e, t), q(e, n), r, i));
      for (var s = 0; s < e.linked.length; ++s)
        if (e.linked[s].isParent) return;
      l = g(o)
    }), new Ea(o, l)
  }

  function $i(e) {
    return e.findMarks(W(e.first, 0), e.clipPos(W(e.lastLine())), function(e) {
      return e.parent
    })
  }

  function Xi(e, t) {
    for (var n = 0; n < t.length; n++) {
      var r = t[n],
        i = r.find(),
        o = e.clipPos(i.from),
        l = e.clipPos(i.to);
      if (E(o, l)) {
        var a = Vi(e, o, l, r.primary, r.primary.type);
        r.markers.push(a), a.parent = r
      }
    }
  }

  function Yi(e) {
    for (var t = function(t) {
        var n = e[t],
          r = [n.primary.doc];
        Zr(n.primary.doc, function(e) {
          return r.push(e)
        });
        for (var i = 0; i < n.markers.length; i++) {
          var o = n.markers[i];
          d(r, o.doc) == -1 && (o.parent = null, n.markers.splice(i--, 1))
        }
      }, n = 0; n < e.length; n++) t(n)
  }

  function Zi(e) {
    var t = this;
    if (eo(t), !Oe(t, e) && !Et(t.display, e)) {
      De(e), wl && (za = +new Date);
      var n = Tn(t, e, !0),
        r = e.dataTransfer.files;
      if (n && !t.isReadOnly())
        if (r && r.length && window.FileReader && window.File)
          for (var i = r.length, o = Array(i), l = 0, a = function(e, r) {
              if (!t.options.allowDropFileTypes || d(t.options.allowDropFileTypes, e.type) != -1) {
                var a = new FileReader;
                a.onload = gr(t, function() {
                  var e = a.result;
                  if (/[\x00-\x08\x0e-\x1f]{2}/.test(e) && (e = ""), o[r] = e, ++l == i) {
                    n = q(t.doc, n);
                    var s = {
                      from: n,
                      to: n,
                      text: t.doc.splitLines(o.join(t.doc.lineSeparator())),
                      origin: "paste"
                    };
                    Pi(t.doc, s), xi(t.doc, jr(n, qr(s)))
                  }
                }), a.readAsText(e)
              }
            }, s = 0; s < i; ++s) a(r[s], s);
        else {
          if (t.state.draggingText && t.doc.sel.contains(n) > -1) return t.state.draggingText(e), void setTimeout(function() {
            return t.display.input.focus()
          }, 20);
          try {
            var c = e.dataTransfer.getData("Text");
            if (c) {
              var u;
              if (t.state.draggingText && !t.state.draggingText.copy && (u = t.listSelections()), Ci(t.doc, jr(n, n)), u)
                for (var f = 0; f < u.length; ++f) Ii(t.doc, "", u[f].anchor, u[f].head, "drag");
              t.replaceSelection(c, "around", "paste"), t.display.input.focus()
            }
          } catch (e) {}
        }
    }
  }

  function Qi(e, t) {
    if (wl && (!e.state.draggingText || +new Date - za < 100)) return void We(t);
    if (!Oe(e, t) && !Et(e.display, t) && (t.dataTransfer.setData("Text", e.getSelection()), t.dataTransfer.effectAllowed = "copyMove", t.dataTransfer.setDragImage && !Ml)) {
      var n = r("img", null, null, "position: fixed; left: 0; top: 0;");
      n.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", Tl && (n.width = n.height = 1, e.display.wrapper.appendChild(n), n._top = n.offsetTop), t.dataTransfer.setDragImage(n, 0, 0), Tl && n.parentNode.removeChild(n)
    }
  }

  function Ji(e, t) {
    var i = Tn(e, t);
    if (i) {
      var o = document.createDocumentFragment();
      An(e, i, o), e.display.dragCursor || (e.display.dragCursor = r("div", null, "CodeMirror-cursors CodeMirror-dragcursors"), e.display.lineSpace.insertBefore(e.display.dragCursor, e.display.cursorDiv)), n(e.display.dragCursor, o)
    }
  }

  function eo(e) {
    e.display.dragCursor && (e.display.lineSpace.removeChild(e.display.dragCursor), e.display.dragCursor = null)
  }

  function to(e) {
    if (document.getElementsByClassName)
      for (var t = document.getElementsByClassName("CodeMirror"), n = 0; n < t.length; n++) {
        var r = t[n].CodeMirror;
        r && e(r)
      }
  }

  function no() {
    Ba || (ro(), Ba = !0)
  }

  function ro() {
    var e;
    ia(window, "resize", function() {
      null == e && (e = setTimeout(function() {
        e = null, to(io)
      }, 100))
    }), ia(window, "blur", function() {
      return to(In)
    })
  }

  function io(e) {
    var t = e.display;
    t.lastWrapHeight == t.wrapper.clientHeight && t.lastWrapWidth == t.wrapper.clientWidth || (t.cachedCharWidth = t.cachedTextHeight = t.cachedPaddingH = null, t.scrollbarsClipped = !1, e.setSize())
  }

  function oo(e) {
    var t = e.split(/-(?!$)/);
    e = t[t.length - 1];
    for (var n, r, i, o, l = 0; l < t.length - 1; l++) {
      var a = t[l];
      if (/^(cmd|meta|m)$/i.test(a)) o = !0;
      else if (/^a(lt)?$/i.test(a)) n = !0;
      else if (/^(c|ctrl|control)$/i.test(a)) r = !0;
      else {
        if (!/^s(hift)?$/i.test(a)) throw new Error("Unrecognized modifier name: " + a);
        i = !0
      }
    }
    return n && (e = "Alt-" + e), r && (e = "Ctrl-" + e), o && (e = "Cmd-" + e), i && (e = "Shift-" + e), e
  }

  function lo(e) {
    var t = {};
    for (var n in e)
      if (e.hasOwnProperty(n)) {
        var r = e[n];
        if (/^(name|fallthrough|(de|at)tach)$/.test(n)) continue;
        if ("..." == r) {
          delete e[n];
          continue
        }
        for (var i = m(n.split(" "), oo), o = 0; o < i.length; o++) {
          var l = void 0,
            a = void 0;
          o == i.length - 1 ? (a = i.join(" "), l = r) : (a = i.slice(0, o + 1).join(" "), l = "...");
          var s = t[a];
          if (s) {
            if (s != l) throw new Error("Inconsistent bindings for " + a)
          } else t[a] = l
        }
        delete e[n]
      } for (var c in t) e[c] = t[c];
    return e
  }

  function ao(e, t, n, r) {
    t = fo(t);
    var i = t.call ? t.call(e, r) : t[e];
    if (i === !1) return "nothing";
    if ("..." === i) return "multi";
    if (null != i && n(i)) return "handled";
    if (t.fallthrough) {
      if ("[object Array]" != Object.prototype.toString.call(t.fallthrough)) return ao(e, t.fallthrough, n, r);
      for (var o = 0; o < t.fallthrough.length; o++) {
        var l = ao(e, t.fallthrough[o], n, r);
        if (l) return l
      }
    }
  }

  function so(e) {
    var t = "string" == typeof e ? e : ja[e.keyCode];
    return "Ctrl" == t || "Alt" == t || "Shift" == t || "Mod" == t
  }

  function co(e, t, n) {
    var r = e;
    return t.altKey && "Alt" != r && (e = "Alt-" + e), (Rl ? t.metaKey : t.ctrlKey) && "Ctrl" != r && (e = "Ctrl-" + e), (Rl ? t.ctrlKey : t.metaKey) && "Cmd" != r && (e = "Cmd-" + e), !n && t.shiftKey && "Shift" != r && (e = "Shift-" + e), e
  }

  function uo(e, t) {
    if (Tl && 34 == e.keyCode && e["char"]) return !1;
    var n = ja[e.keyCode];
    return null != n && !e.altGraphKey && (3 == e.keyCode && e.code && (n = e.code), co(n, e, t))
  }

  function fo(e) {
    return "string" == typeof e ? Ka[e] : e
  }

  function ho(e, t) {
    for (var n = e.doc.sel.ranges, r = [], i = 0; i < n.length; i++) {
      for (var o = t(n[i]); r.length && E(o.from, g(r).to) <= 0;) {
        var l = r.pop();
        if (E(l.from, o.from) < 0) {
          o.from = l.from;
          break
        }
      }
      r.push(o)
    }
    pr(e, function() {
      for (var t = r.length - 1; t >= 0; t--) Ii(e.doc, "", r[t].from, r[t].to, "+delete");
      $n(e)
    })
  }

  function po(e, t, n) {
    var r = S(e.text, t + n, n);
    return r < 0 || r > e.text.length ? null : r
  }

  function go(e, t, n) {
    var r = po(e, t.ch, n);
    return null == r ? null : new W(t.line, r, n < 0 ? "after" : "before")
  }

  function mo(e, t, n, r, i) {
    if (e) {
      var o = Se(n, t.doc.direction);
      if (o) {
        var l, a = i < 0 ? g(o) : o[0],
          s = i < 0 == (1 == a.level),
          c = s ? "after" : "before";
        if (a.level > 0 || "rtl" == t.doc.direction) {
          var u = $t(t, n);
          l = i < 0 ? n.text.length - 1 : 0;
          var f = Xt(t, u, l).top;
          l = L(function(e) {
            return Xt(t, u, e).top == f
          }, i < 0 == (1 == a.level) ? a.from : a.to - 1, l), "before" == c && (l = po(n, l, 1))
        } else l = i < 0 ? a.to : a.from;
        return new W(r, l, c)
      }
    }
    return new W(r, i < 0 ? n.text.length : 0, i < 0 ? "before" : "after")
  }

  function vo(e, t, n, r) {
    var i = Se(t, e.doc.direction);
    if (!i) return go(t, n, r);
    n.ch >= t.text.length ? (n.ch = t.text.length, n.sticky = "before") : n.ch <= 0 && (n.ch = 0, n.sticky = "after");
    var o = ke(i, n.ch, n.sticky),
      l = i[o];
    if ("ltr" == e.doc.direction && l.level % 2 == 0 && (r > 0 ? l.to > n.ch : l.from < n.ch)) return go(t, n, r);
    var a, s = function(e, n) {
        return po(t, e instanceof W ? e.ch : e, n)
      },
      c = function(n) {
        return e.options.lineWrapping ? (a = a || $t(e, t), gn(e, t, a, n)) : {
          begin: 0,
          end: t.text.length
        }
      },
      u = c("before" == n.sticky ? s(n, -1) : n.ch);
    if ("rtl" == e.doc.direction || 1 == l.level) {
      var f = 1 == l.level == r < 0,
        d = s(n, f ? 1 : -1);
      if (null != d && (f ? d <= l.to && d <= u.end : d >= l.from && d >= u.begin)) {
        var h = f ? "before" : "after";
        return new W(n.line, d, h)
      }
    }
    var p = function(e, t, r) {
        for (var o = function(e, t) {
            return t ? new W(n.line, s(e, 1), "before") : new W(n.line, e, "after")
          }; e >= 0 && e < i.length; e += t) {
          var l = i[e],
            a = t > 0 == (1 != l.level),
            c = a ? r.begin : s(r.end, -1);
          if (l.from <= c && c < l.to) return o(c, a);
          if (c = a ? l.from : s(l.to, -1), r.begin <= c && c < r.end) return o(c, a)
        }
      },
      g = p(o + r, r, u);
    if (g) return g;
    var m = r > 0 ? u.end : s(u.begin, -1);
    return null == m || r > 0 && m == t.text.length || !(g = p(r > 0 ? 0 : i.length - 1, r, c(m))) ? null : g
  }

  function yo(e, t) {
    var n = M(e.doc, t),
      r = de(n);
    return r != n && (t = P(r)), mo(!0, e, r, t, 1)
  }

  function bo(e, t) {
    var n = M(e.doc, t),
      r = he(n);
    return r != n && (t = P(r)), mo(!0, e, n, t, -1)
  }

  function xo(e, t) {
    var n = yo(e, t.line),
      r = M(e.doc, n.line),
      i = Se(r, e.doc.direction);
    if (!i || 0 == i[0].level) {
      var o = Math.max(0, r.text.search(/\S/)),
        l = t.line == n.line && t.ch <= o && t.ch;
      return W(n.line, l ? 0 : o, n.sticky)
    }
    return n
  }

  function wo(e, t, n) {
    if ("string" == typeof t && (t = Va[t], !t)) return !1;
    e.display.input.ensurePolled();
    var r = e.display.shift,
      i = !1;
    try {
      e.isReadOnly() && (e.state.suppressEdits = !0), n && (e.display.shift = !1), i = t(e) != Vl
    } finally {
      e.display.shift = r, e.state.suppressEdits = !1
    }
    return i
  }

  function Co(e, t, n) {
    for (var r = 0; r < e.state.keyMaps.length; r++) {
      var i = ao(t, e.state.keyMaps[r], n, e);
      if (i) return i
    }
    return e.options.extraKeys && ao(t, e.options.extraKeys, n, e) || ao(t, e.options.keyMap, n, e)
  }

  function ko(e, t, n, r) {
    var i = e.state.keySeq;
    if (i) {
      if (so(t)) return "handled";
      if (/\'$/.test(t) ? e.state.keySeq = null : _a.set(50, function() {
          e.state.keySeq == i && (e.state.keySeq = null, e.display.input.reset())
        }), So(e, i + " " + t, n, r)) return !0
    }
    return So(e, t, n, r)
  }

  function So(e, t, n, r) {
    var i = Co(e, t, r);
    return "multi" == i && (e.state.keySeq = t), "handled" == i && wt(e, "keyHandled", e, t, n), "handled" != i && "multi" != i || (De(n), Hn(e)), !!i
  }

  function Lo(e, t) {
    var n = uo(t, !0);
    return !!n && (t.shiftKey && !e.state.keySeq ? ko(e, "Shift-" + n, t, function(t) {
      return wo(e, t, !0)
    }) || ko(e, n, t, function(t) {
      if ("string" == typeof t ? /^go[A-Z]/.test(t) : t.motion) return wo(e, t)
    }) : ko(e, n, t, function(t) {
      return wo(e, t)
    }))
  }

  function To(e, t, n) {
    return ko(e, "'" + n + "'", t, function(t) {
      return wo(e, t, !0)
    })
  }

  function Mo(e) {
    var t = this;
    if (t.curOp.focus = l(), !Oe(t, e)) {
      wl && Cl < 11 && 27 == e.keyCode && (e.returnValue = !1);
      var n = e.keyCode;
      t.display.shift = 16 == n || e.shiftKey;
      var r = Lo(t, e);
      Tl && ($a = r ? n : null, !r && 88 == n && !sa && (Hl ? e.metaKey : e.ctrlKey) && t.replaceSelection("", null, "cut")), 18 != n || /\bCodeMirror-crosshair\b/.test(t.display.lineDiv.className) || Oo(t)
    }
  }

  function Oo(e) {
    function t(e) {
      18 != e.keyCode && e.altKey || (Bl(n, "CodeMirror-crosshair"), Te(document, "keyup", t), Te(document, "mouseover", t))
    }
    var n = e.display.lineDiv;
    a(n, "CodeMirror-crosshair"), ia(document, "keyup", t), ia(document, "mouseover", t)
  }

  function No(e) {
    16 == e.keyCode && (this.doc.sel.shift = !1), Oe(this, e)
  }

  function Ao(e) {
    var t = this;
    if (!(Et(t.display, e) || Oe(t, e) || e.ctrlKey && !e.altKey || Hl && e.metaKey)) {
      var n = e.keyCode,
        r = e.charCode;
      if (Tl && n == $a) return $a = null, void De(e);
      if (!Tl || e.which && !(e.which < 10) || !Lo(t, e)) {
        var i = String.fromCharCode(null == r ? n : r);
        "\b" != i && (To(t, e, i) || t.display.input.onKeyPress(e))
      }
    }
  }

  function Po(e, t) {
    var n = +new Date;
    return Qa && Qa.compare(n, e, t) ? (Za = Qa = null, "triple") : Za && Za.compare(n, e, t) ? (Qa = new Ya(n, e, t), Za = null, "double") : (Za = new Ya(n, e, t), Qa = null, "single")
  }

  function Do(e) {
    var t = this,
      n = t.display;
    if (!(Oe(t, e) || n.activeTouch && n.input.supportsTouch())) {
      if (n.input.ensurePolled(), n.shift = e.shiftKey, Et(n, e)) return void(kl || (n.scroller.draggable = !1, setTimeout(function() {
        return n.scroller.draggable = !0
      }, 100)));
      if (!jo(t, e)) {
        var r = Tn(t, e),
          i = Ie(e),
          o = r ? Po(r, i) : "single";
        window.focus(), 1 == i && t.state.selectingText && t.state.selectingText(e), r && Ho(t, i, r, o, e) || (1 == i ? r ? Wo(t, r, o, e) : Ee(e) == n.scroller && De(e) : 2 == i ? (r && gi(t.doc, r), setTimeout(function() {
          return n.input.focus()
        }, 20)) : 3 == i && (zl ? qo(t, e) : Wn(t)))
      }
    }
  }

  function Ho(e, t, n, r, i) {
    var o = "Click";
    return "double" == r ? o = "Double" + o : "triple" == r && (o = "Triple" + o), o = (1 == t ? "Left" : 2 == t ? "Middle" : "Right") + o, ko(e, co(o, i), i, function(t) {
      if ("string" == typeof t && (t = Va[t]), !t) return !1;
      var r = !1;
      try {
        e.isReadOnly() && (e.state.suppressEdits = !0), r = t(e, n) != Vl
      } finally {
        e.state.suppressEdits = !1
      }
      return r
    })
  }

  function Fo(e, t, n) {
    var r = e.getOption("configureMouse"),
      i = r ? r(e, t, n) : {};
    if (null == i.unit) {
      var o = Fl ? n.shiftKey && n.metaKey : n.altKey;
      i.unit = o ? "rectangle" : "single" == t ? "char" : "double" == t ? "word" : "line"
    }
    return (null == i.extend || e.doc.extend) && (i.extend = e.doc.extend || n.shiftKey), null == i.addNew && (i.addNew = Hl ? n.metaKey : n.ctrlKey), null == i.moveOnDrag && (i.moveOnDrag = !(Hl ? n.altKey : n.ctrlKey)), i
  }

  function Wo(e, t, n, r) {
    wl ? setTimeout(c(Fn, e), 0) : e.curOp.focus = l();
    var i, o = Fo(e, n, r),
      a = e.doc.sel;
    e.options.dragDrop && oa && !e.isReadOnly() && "single" == n && (i = a.contains(t)) > -1 && (E((i = a.ranges[i]).from(), t) < 0 || t.xRel > 0) && (E(i.to(), t) > 0 || t.xRel < 0) ? Eo(e, r, t, o) : Ro(e, r, t, o)
  }

  function Eo(e, t, n, r) {
    var i = e.display,
      o = !1,
      l = gr(e, function(t) {
        kl && (i.scroller.draggable = !1), e.state.draggingText = !1, Te(i.wrapper.ownerDocument, "mouseup", l), Te(i.wrapper.ownerDocument, "mousemove", a), Te(i.scroller, "dragstart", s), Te(i.scroller, "drop", l), o || (De(t), r.addNew || gi(e.doc, n, null, null, r.extend), kl || wl && 9 == Cl ? setTimeout(function() {
          i.wrapper.ownerDocument.body.focus(), i.input.focus()
        }, 20) : i.input.focus())
      }),
      a = function(e) {
        o = o || Math.abs(t.clientX - e.clientX) + Math.abs(t.clientY - e.clientY) >= 10
      },
      s = function() {
        return o = !0
      };
    kl && (i.scroller.draggable = !0), e.state.draggingText = l, l.copy = !r.moveOnDrag, i.scroller.dragDrop && i.scroller.dragDrop(), ia(i.wrapper.ownerDocument, "mouseup", l), ia(i.wrapper.ownerDocument, "mousemove", a), ia(i.scroller, "dragstart", s), ia(i.scroller, "drop", l), Wn(e), setTimeout(function() {
      return i.input.focus()
    }, 20)
  }

  function Io(e, t, n) {
    if ("char" == n) return new Da(t, t);
    if ("word" == n) return e.findWordAt(t);
    if ("line" == n) return new Da(W(t.line, 0), q(e.doc, W(t.line + 1, 0)));
    var r = n(e, t);
    return new Da(r.from, r.to)
  }

  function Ro(e, t, n, r) {
    function i(t) {
      if (0 != E(v, t))
        if (v = t, "rectangle" == r.unit) {
          for (var i = [], o = e.options.tabSize, l = f(M(c, n.line).text, n.ch, o), a = f(M(c, t.line).text, t.ch, o), s = Math.min(l, a), g = Math.max(l, a), m = Math.min(n.line, t.line), y = Math.min(e.lastLine(), Math.max(n.line, t.line)); m <= y; m++) {
            var b = M(c, m).text,
              x = h(b, s, o);
            s == g ? i.push(new Da(W(m, x), W(m, x))) : b.length > x && i.push(new Da(W(m, x), W(m, h(b, g, o))))
          }
          i.length || i.push(new Da(n, n)), wi(c, Br(p.ranges.slice(0, d).concat(i), d), {
            origin: "*mouse",
            scroll: !1
          }), e.scrollIntoView(t)
        } else {
          var w, C = u,
            k = Io(e, t, r.unit),
            S = C.anchor;
          E(k.anchor, S) > 0 ? (w = k.head, S = B(C.from(), k.anchor)) : (w = k.anchor, S = z(C.to(), k.head));
          var L = p.ranges.slice(0);
          L[d] = zo(e, new Da(q(c, S), w)), wi(c, Br(L, d), $l)
        }
    }

    function o(t) {
      var n = ++b,
        a = Tn(e, t, !0, "rectangle" == r.unit);
      if (a)
        if (0 != E(a, v)) {
          e.curOp.focus = l(), i(a);
          var u = Bn(s, c);
          (a.line >= u.to || a.line < u.from) && setTimeout(gr(e, function() {
            b == n && o(t)
          }), 150)
        } else {
          var f = t.clientY < y.top ? -20 : t.clientY > y.bottom ? 20 : 0;
          f && setTimeout(gr(e, function() {
            b == n && (s.scroller.scrollTop += f, o(t))
          }), 50)
        }
    }

    function a(t) {
      e.state.selectingText = !1, b = 1 / 0, De(t), s.input.focus(), Te(s.wrapper.ownerDocument, "mousemove", x), Te(s.wrapper.ownerDocument, "mouseup", w), c.history.lastSelOrigin = null
    }
    var s = e.display,
      c = e.doc;
    De(t);
    var u, d, p = c.sel,
      g = p.ranges;
    if (r.addNew && !r.extend ? (d = c.sel.contains(n), u = d > -1 ? g[d] : new Da(n, n)) : (u = c.sel.primary(), d = c.sel.primIndex), "rectangle" == r.unit) r.addNew || (u = new Da(n, n)), n = Tn(e, t, !0, !0), d = -1;
    else {
      var m = Io(e, n, r.unit);
      u = r.extend ? pi(u, m.anchor, m.head, r.extend) : m
    }
    r.addNew ? d == -1 ? (d = g.length, wi(c, Br(g.concat([u]), d), {
      scroll: !1,
      origin: "*mouse"
    })) : g.length > 1 && g[d].empty() && "char" == r.unit && !r.extend ? (wi(c, Br(g.slice(0, d).concat(g.slice(d + 1)), 0), {
      scroll: !1,
      origin: "*mouse"
    }), p = c.sel) : vi(c, d, u, $l) : (d = 0, wi(c, new Pa([u], 0), $l), p = c.sel);
    var v = n,
      y = s.wrapper.getBoundingClientRect(),
      b = 0,
      x = gr(e, function(e) {
        0 !== e.buttons && Ie(e) ? o(e) : a(e)
      }),
      w = gr(e, a);
    e.state.selectingText = w, ia(s.wrapper.ownerDocument, "mousemove", x), ia(s.wrapper.ownerDocument, "mouseup", w)
  }

  function zo(e, t) {
    var n = t.anchor,
      r = t.head,
      i = M(e.doc, n.line);
    if (0 == E(n, r) && n.sticky == r.sticky) return t;
    var o = Se(i);
    if (!o) return t;
    var l = ke(o, n.ch, n.sticky),
      a = o[l];
    if (a.from != n.ch && a.to != n.ch) return t;
    var s = l + (a.from == n.ch == (1 != a.level) ? 0 : 1);
    if (0 == s || s == o.length) return t;
    var c;
    if (r.line != n.line) c = (r.line - n.line) * ("ltr" == e.doc.direction ? 1 : -1) > 0;
    else {
      var u = ke(o, r.ch, r.sticky),
        f = u - l || (r.ch - n.ch) * (1 == a.level ? -1 : 1);
      c = u == s - 1 || u == s ? f < 0 : f > 0
    }
    var d = o[s + (c ? -1 : 0)],
      h = c == (1 == d.level),
      p = h ? d.from : d.to,
      g = h ? "after" : "before";
    return n.ch == p && n.sticky == g ? t : new Da(new W(n.line, p, g), r)
  }

  function Bo(e, t, n, r) {
    var i, o;
    if (t.touches) i = t.touches[0].clientX, o = t.touches[0].clientY;
    else try {
      i = t.clientX, o = t.clientY
    } catch (t) {
      return !1
    }
    if (i >= Math.floor(e.display.gutters.getBoundingClientRect().right)) return !1;
    r && De(t);
    var l = e.display,
      a = l.lineDiv.getBoundingClientRect();
    if (o > a.bottom || !Ae(e, n)) return Fe(t);
    o -= a.top - l.viewOffset;
    for (var s = 0; s < e.options.gutters.length; ++s) {
      var c = l.gutters.childNodes[s];
      if (c && c.getBoundingClientRect().right >= i) {
        var u = D(e.doc, o),
          f = e.options.gutters[s];
        return Me(e, n, e, u, f, t), Fe(t)
      }
    }
  }

  function jo(e, t) {
    return Bo(e, t, "gutterClick", !0)
  }

  function qo(e, t) {
    Et(e.display, t) || Go(e, t) || Oe(e, t, "contextmenu") || e.display.input.onContextMenu(t)
  }

  function Go(e, t) {
    return !!Ae(e, "gutterContextMenu") && Bo(e, t, "gutterContextMenu", !1)
  }

  function Uo(e) {
    e.display.wrapper.className = e.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + e.options.theme.replace(/(^|\s)\s*/g, " cm-s-"), nn(e)
  }

  function Ko(e) {
    function t(t, r, i, o) {
      e.defaults[t] = r, i && (n[t] = o ? function(e, t, n) {
        n != Ja && i(e, t, n)
      } : i)
    }
    var n = e.optionHandlers;
    e.defineOption = t, e.Init = Ja, t("value", "", function(e, t) {
      return e.setValue(t)
    }, !0), t("mode", null, function(e, t) {
      e.doc.modeOption = t, _r(e)
    }, !0), t("indentUnit", 2, _r, !0), t("indentWithTabs", !1), t("smartIndent", !0), t("tabSize", 4, function(e) {
      $r(e), nn(e), yr(e)
    }, !0), t("lineSeparator", null, function(e, t) {
      if (e.doc.lineSep = t, t) {
        var n = [],
          r = e.doc.first;
        e.doc.iter(function(e) {
          for (var i = 0;;) {
            var o = e.text.indexOf(t, i);
            if (o == -1) break;
            i = o + t.length, n.push(W(r, o))
          }
          r++
        });
        for (var i = n.length - 1; i >= 0; i--) Ii(e.doc, t, n[i], W(n[i].line, n[i].ch + t.length))
      }
    }), t("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g, function(e, t, n) {
      e.state.specialChars = new RegExp(t.source + (t.test("\t") ? "" : "|\t"), "g"), n != Ja && e.refresh()
    }), t("specialCharPlaceholder", ut, function(e) {
      return e.refresh()
    }, !0), t("electricChars", !0), t("inputStyle", Dl ? "contenteditable" : "textarea", function() {
      throw new Error("inputStyle can not (yet) be changed in a running editor")
    }, !0), t("spellcheck", !1, function(e, t) {
      return e.getInputField().spellcheck = t
    }, !0), t("rtlMoveVisually", !Wl), t("wholeLineUpdateBefore", !0), t("theme", "default", function(e) {
      Uo(e), Vo(e)
    }, !0), t("keyMap", "default", function(e, t, n) {
      var r = fo(t),
        i = n != Ja && fo(n);
      i && i.detach && i.detach(e, r), r.attach && r.attach(e, i || null)
    }), t("extraKeys", null), t("configureMouse", null), t("lineWrapping", !1, $o, !0), t("gutters", [], function(e) {
      Er(e.options), Vo(e)
    }, !0), t("fixedGutter", !0, function(e, t) {
      e.display.gutters.style.left = t ? kn(e.display) + "px" : "0", e.refresh()
    }, !0), t("coverGutterNextToScrollbar", !1, function(e) {
      return rr(e)
    }, !0), t("scrollbarStyle", "native", function(e) {
      or(e), rr(e), e.display.scrollbars.setScrollTop(e.doc.scrollTop), e.display.scrollbars.setScrollLeft(e.doc.scrollLeft)
    }, !0), t("lineNumbers", !1, function(e) {
      Er(e.options), Vo(e)
    }, !0), t("firstLineNumber", 1, Vo, !0), t("lineNumberFormatter", function(e) {
      return e
    }, Vo, !0), t("showCursorWhenSelecting", !1, On, !0), t("resetSelectionOnContextMenu", !0), t("lineWiseCopyCut", !0), t("pasteLinesPerSelection", !0), t("readOnly", !1, function(e, t) {
      "nocursor" == t && (In(e), e.display.input.blur()), e.display.input.readOnlyChanged(t)
    }), t("disableInput", !1, function(e, t) {
      t || e.display.input.reset();
    }, !0), t("dragDrop", !0, _o), t("allowDropFileTypes", null), t("cursorBlinkRate", 530), t("cursorScrollMargin", 0), t("cursorHeight", 1, On, !0), t("singleCursorHeightPerLine", !0, On, !0), t("workTime", 100), t("workDelay", 100), t("flattenSpans", !0, $r, !0), t("addModeClass", !1, $r, !0), t("pollInterval", 100), t("undoDepth", 200, function(e, t) {
      return e.doc.history.undoDepth = t
    }), t("historyEventDelay", 1250), t("viewportMargin", 10, function(e) {
      return e.refresh()
    }, !0), t("maxHighlightLength", 1e4, $r, !0), t("moveInputWithCursor", !0, function(e, t) {
      t || e.display.input.resetPosition()
    }), t("tabindex", null, function(e, t) {
      return e.display.input.getField().tabIndex = t || ""
    }), t("autofocus", null), t("direction", "ltr", function(e, t) {
      return e.doc.setDirection(t)
    }, !0)
  }

  function Vo(e) {
    Wr(e), yr(e), jn(e)
  }

  function _o(e, t, n) {
    var r = n && n != Ja;
    if (!t != !r) {
      var i = e.display.dragFunctions,
        o = t ? ia : Te;
      o(e.display.scroller, "dragstart", i.start), o(e.display.scroller, "dragenter", i.enter), o(e.display.scroller, "dragover", i.over), o(e.display.scroller, "dragleave", i.leave), o(e.display.scroller, "drop", i.drop)
    }
  }

  function $o(e) {
    e.options.lineWrapping ? (a(e.display.wrapper, "CodeMirror-wrap"), e.display.sizer.style.minWidth = "", e.display.sizerWidth = null) : (Bl(e.display.wrapper, "CodeMirror-wrap"), we(e)), Ln(e), yr(e), nn(e), setTimeout(function() {
      return rr(e)
    }, 100)
  }

  function Xo(e, t) {
    var n = this;
    if (!(this instanceof Xo)) return new Xo(e, t);
    this.options = t = t ? u(t) : {}, u(es, t, !1), Er(t);
    var r = t.value;
    "string" == typeof r && (r = new Ra(r, t.mode, null, t.lineSeparator, t.direction)), this.doc = r;
    var i = new Xo.inputStyles[t.inputStyle](this),
      o = this.display = new T(e, r, i);
    o.wrapper.CodeMirror = this, Wr(this), Uo(this), t.lineWrapping && (this.display.wrapper.className += " CodeMirror-wrap"), or(this), this.state = {
      keyMaps: [],
      overlays: [],
      modeGen: 0,
      overwrite: !1,
      delayingBlurEvent: !1,
      focused: !1,
      suppressEdits: !1,
      pasteIncoming: !1,
      cutIncoming: !1,
      selectingText: !1,
      draggingText: !1,
      highlight: new ql,
      keySeq: null,
      specialChars: null
    }, t.autofocus && !Dl && o.input.focus(), wl && Cl < 11 && setTimeout(function() {
      return n.display.input.reset(!0)
    }, 20), Yo(this), no(), lr(this), this.curOp.forceUpdate = !0, Qr(this, r), t.autofocus && !Dl || this.hasFocus() ? setTimeout(c(En, this), 20) : In(this);
    for (var l in ts) ts.hasOwnProperty(l) && ts[l](n, t[l], Ja);
    qn(this), t.finishInit && t.finishInit(this);
    for (var a = 0; a < ns.length; ++a) ns[a](n);
    ar(this), kl && t.lineWrapping && "optimizelegibility" == getComputedStyle(o.lineDiv).textRendering && (o.lineDiv.style.textRendering = "auto")
  }

  function Yo(e) {
    function t() {
      i.activeTouch && (o = setTimeout(function() {
        return i.activeTouch = null
      }, 1e3), l = i.activeTouch, l.end = +new Date)
    }

    function n(e) {
      if (1 != e.touches.length) return !1;
      var t = e.touches[0];
      return t.radiusX <= 1 && t.radiusY <= 1
    }

    function r(e, t) {
      if (null == t.left) return !0;
      var n = t.left - e.left,
        r = t.top - e.top;
      return n * n + r * r > 400
    }
    var i = e.display;
    ia(i.scroller, "mousedown", gr(e, Do)), wl && Cl < 11 ? ia(i.scroller, "dblclick", gr(e, function(t) {
      if (!Oe(e, t)) {
        var n = Tn(e, t);
        if (n && !jo(e, t) && !Et(e.display, t)) {
          De(t);
          var r = e.findWordAt(n);
          gi(e.doc, r.anchor, r.head)
        }
      }
    })) : ia(i.scroller, "dblclick", function(t) {
      return Oe(e, t) || De(t)
    }), zl || ia(i.scroller, "contextmenu", function(t) {
      return qo(e, t)
    });
    var o, l = {
      end: 0
    };
    ia(i.scroller, "touchstart", function(t) {
      if (!Oe(e, t) && !n(t) && !jo(e, t)) {
        i.input.ensurePolled(), clearTimeout(o);
        var r = +new Date;
        i.activeTouch = {
          start: r,
          moved: !1,
          prev: r - l.end <= 300 ? l : null
        }, 1 == t.touches.length && (i.activeTouch.left = t.touches[0].pageX, i.activeTouch.top = t.touches[0].pageY)
      }
    }), ia(i.scroller, "touchmove", function() {
      i.activeTouch && (i.activeTouch.moved = !0)
    }), ia(i.scroller, "touchend", function(n) {
      var o = i.activeTouch;
      if (o && !Et(i, n) && null != o.left && !o.moved && new Date - o.start < 300) {
        var l, a = e.coordsChar(i.activeTouch, "page");
        l = !o.prev || r(o, o.prev) ? new Da(a, a) : !o.prev.prev || r(o, o.prev.prev) ? e.findWordAt(a) : new Da(W(a.line, 0), q(e.doc, W(a.line + 1, 0))), e.setSelection(l.anchor, l.head), e.focus(), De(n)
      }
      t()
    }), ia(i.scroller, "touchcancel", t), ia(i.scroller, "scroll", function() {
      i.scroller.clientHeight && (Jn(e, i.scroller.scrollTop), tr(e, i.scroller.scrollLeft, !0), Me(e, "scroll", e))
    }), ia(i.scroller, "mousewheel", function(t) {
      return zr(e, t)
    }), ia(i.scroller, "DOMMouseScroll", function(t) {
      return zr(e, t)
    }), ia(i.wrapper, "scroll", function() {
      return i.wrapper.scrollTop = i.wrapper.scrollLeft = 0
    }), i.dragFunctions = {
      enter: function(t) {
        Oe(e, t) || We(t)
      },
      over: function(t) {
        Oe(e, t) || (Ji(e, t), We(t))
      },
      start: function(t) {
        return Qi(e, t)
      },
      drop: gr(e, Zi),
      leave: function(t) {
        Oe(e, t) || eo(e)
      }
    };
    var a = i.input.getField();
    ia(a, "keyup", function(t) {
      return No.call(e, t)
    }), ia(a, "keydown", gr(e, Mo)), ia(a, "keypress", gr(e, Ao)), ia(a, "focus", function(t) {
      return En(e, t)
    }), ia(a, "blur", function(t) {
      return In(e, t)
    })
  }

  function Zo(e, t, n, r) {
    var i, o = e.doc;
    null == n && (n = "add"), "smart" == n && (o.mode.indent ? i = Ze(e, t).state : n = "prev");
    var l = e.options.tabSize,
      a = M(o, t),
      s = f(a.text, null, l);
    a.stateAfter && (a.stateAfter = null);
    var c, u = a.text.match(/^\s*/)[0];
    if (r || /\S/.test(a.text)) {
      if ("smart" == n && (c = o.mode.indent(i, a.text.slice(u.length), a.text), c == Vl || c > 150)) {
        if (!r) return;
        n = "prev"
      }
    } else c = 0, n = "not";
    "prev" == n ? c = t > o.first ? f(M(o, t - 1).text, null, l) : 0 : "add" == n ? c = s + e.options.indentUnit : "subtract" == n ? c = s - e.options.indentUnit : "number" == typeof n && (c = s + n), c = Math.max(0, c);
    var d = "",
      h = 0;
    if (e.options.indentWithTabs)
      for (var g = Math.floor(c / l); g; --g) h += l, d += "\t";
    if (h < c && (d += p(c - h)), d != u) return Ii(o, d, W(t, 0), W(t, u.length), "+input"), a.stateAfter = null, !0;
    for (var m = 0; m < o.sel.ranges.length; m++) {
      var v = o.sel.ranges[m];
      if (v.head.line == t && v.head.ch < u.length) {
        var y = W(t, u.length);
        vi(o, m, new Da(y, y));
        break
      }
    }
  }

  function Qo(e) {
    rs = e
  }

  function Jo(e, t, n, r, i) {
    var o = e.doc;
    e.display.shift = !1, r || (r = o.sel);
    var l = e.state.pasteIncoming || "paste" == i,
      a = la(t),
      s = null;
    if (l && r.ranges.length > 1)
      if (rs && rs.text.join("\n") == t) {
        if (r.ranges.length % rs.text.length == 0) {
          s = [];
          for (var c = 0; c < rs.text.length; c++) s.push(o.splitLines(rs.text[c]))
        }
      } else a.length == r.ranges.length && e.options.pasteLinesPerSelection && (s = m(a, function(e) {
        return [e]
      }));
    for (var u, f = r.ranges.length - 1; f >= 0; f--) {
      var d = r.ranges[f],
        h = d.from(),
        p = d.to();
      d.empty() && (n && n > 0 ? h = W(h.line, h.ch - n) : e.state.overwrite && !l ? p = W(p.line, Math.min(M(o, p.line).text.length, p.ch + g(a).length)) : rs && rs.lineWise && rs.text.join("\n") == t && (h = p = W(h.line, 0))), u = e.curOp.updateInput;
      var v = {
        from: h,
        to: p,
        text: s ? s[f % s.length] : a,
        origin: i || (l ? "paste" : e.state.cutIncoming ? "cut" : "+input")
      };
      Pi(e.doc, v), wt(e, "inputRead", e, v)
    }
    t && !l && tl(e, t), $n(e), e.curOp.updateInput = u, e.curOp.typing = !0, e.state.pasteIncoming = e.state.cutIncoming = !1
  }

  function el(e, t) {
    var n = e.clipboardData && e.clipboardData.getData("Text");
    if (n) return e.preventDefault(), t.isReadOnly() || t.options.disableInput || pr(t, function() {
      return Jo(t, n, 0, null, "paste")
    }), !0
  }

  function tl(e, t) {
    if (e.options.electricChars && e.options.smartIndent)
      for (var n = e.doc.sel, r = n.ranges.length - 1; r >= 0; r--) {
        var i = n.ranges[r];
        if (!(i.head.ch > 100 || r && n.ranges[r - 1].head.line == i.head.line)) {
          var o = e.getModeAt(i.head),
            l = !1;
          if (o.electricChars) {
            for (var a = 0; a < o.electricChars.length; a++)
              if (t.indexOf(o.electricChars.charAt(a)) > -1) {
                l = Zo(e, i.head.line, "smart");
                break
              }
          } else o.electricInput && o.electricInput.test(M(e.doc, i.head.line).text.slice(0, i.head.ch)) && (l = Zo(e, i.head.line, "smart"));
          l && wt(e, "electricInput", e, i.head.line)
        }
      }
  }

  function nl(e) {
    for (var t = [], n = [], r = 0; r < e.doc.sel.ranges.length; r++) {
      var i = e.doc.sel.ranges[r].head.line,
        o = {
          anchor: W(i, 0),
          head: W(i + 1, 0)
        };
      n.push(o), t.push(e.getRange(o.anchor, o.head))
    }
    return {
      text: t,
      ranges: n
    }
  }

  function rl(e, t) {
    e.setAttribute("autocorrect", "off"), e.setAttribute("autocapitalize", "off"), e.setAttribute("spellcheck", !!t)
  }

  function il() {
    var e = r("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none"),
      t = r("div", [e], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    return kl ? e.style.width = "1000px" : e.setAttribute("wrap", "off"), Al && (e.style.border = "1px solid black"), rl(e), t
  }

  function ol(e, t, n, r, i) {
    function o() {
      var r = t.line + n;
      return !(r < e.first || r >= e.first + e.size) && (t = new W(r, t.ch, t.sticky), c = M(e, r))
    }

    function l(r) {
      var l;
      if (l = i ? vo(e.cm, c, t, n) : go(c, t, n), null == l) {
        if (r || !o()) return !1;
        t = mo(i, e.cm, c, t.line, n)
      } else t = l;
      return !0
    }
    var a = t,
      s = n,
      c = M(e, t.line);
    if ("char" == r) l();
    else if ("column" == r) l(!0);
    else if ("word" == r || "group" == r)
      for (var u = null, f = "group" == r, d = e.cm && e.cm.getHelper(t, "wordChars"), h = !0; !(n < 0) || l(!h); h = !1) {
        var p = c.text.charAt(t.ch) || "\n",
          g = w(p, d) ? "w" : f && "\n" == p ? "n" : !f || /\s/.test(p) ? null : "p";
        if (!f || h || g || (g = "s"), u && u != g) {
          n < 0 && (n = 1, l(), t.sticky = "after");
          break
        }
        if (g && (u = g), n > 0 && !l(!h)) break
      }
    var m = Mi(e, t, a, s, !0);
    return I(a, m) && (m.hitSide = !0), m
  }

  function ll(e, t, n, r) {
    var i, o = e.doc,
      l = t.left;
    if ("page" == r) {
      var a = Math.min(e.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight),
        s = Math.max(a - .5 * xn(e.display), 3);
      i = (n > 0 ? t.bottom : t.top) + n * s
    } else "line" == r && (i = n > 0 ? t.bottom + 3 : t.top - 3);
    for (var c; c = hn(e, l, i), c.outside;) {
      if (n < 0 ? i <= 0 : i >= o.height) {
        c.hitSide = !0;
        break
      }
      i += 5 * n
    }
    return c
  }

  function al(e, t) {
    var n = _t(e, t.line);
    if (!n || n.hidden) return null;
    var r = M(e.doc, t.line),
      i = Ut(n, r, t.line),
      o = Se(r, e.doc.direction),
      l = "left";
    if (o) {
      var a = ke(o, t.ch);
      l = a % 2 ? "right" : "left"
    }
    var s = Yt(i.map, t.ch, l);
    return s.offset = "right" == s.collapse ? s.end : s.start, s
  }

  function sl(e) {
    for (var t = e; t; t = t.parentNode)
      if (/CodeMirror-gutter-wrapper/.test(t.className)) return !0;
    return !1
  }

  function cl(e, t) {
    return t && (e.bad = !0), e
  }

  function ul(e, t, n, r, i) {
    function o(e) {
      return function(t) {
        return t.id == e
      }
    }

    function l() {
      u && (c += f, d && (c += f), u = d = !1)
    }

    function a(e) {
      e && (l(), c += e)
    }

    function s(t) {
      if (1 == t.nodeType) {
        var n = t.getAttribute("cm-text");
        if (n) return void a(n);
        var c, h = t.getAttribute("cm-marker");
        if (h) {
          var p = e.findMarks(W(r, 0), W(i + 1, 0), o(+h));
          return void(p.length && (c = p[0].find(0)) && a(O(e.doc, c.from, c.to).join(f)))
        }
        if ("false" == t.getAttribute("contenteditable")) return;
        var g = /^(pre|div|p|li|table|br)$/i.test(t.nodeName);
        if (!/^br$/i.test(t.nodeName) && 0 == t.textContent.length) return;
        g && l();
        for (var m = 0; m < t.childNodes.length; m++) s(t.childNodes[m]);
        /^(pre|p)$/i.test(t.nodeName) && (d = !0), g && (u = !0)
      } else 3 == t.nodeType && a(t.nodeValue.replace(/\u200b/g, "").replace(/\u00a0/g, " "))
    }
    for (var c = "", u = !1, f = e.doc.lineSeparator(), d = !1; s(t), t != n;) t = t.nextSibling, d = !1;
    return c
  }

  function fl(e, t, n) {
    var r;
    if (t == e.display.lineDiv) {
      if (r = e.display.lineDiv.childNodes[n], !r) return cl(e.clipPos(W(e.display.viewTo - 1)), !0);
      t = null, n = 0
    } else
      for (r = t;; r = r.parentNode) {
        if (!r || r == e.display.lineDiv) return null;
        if (r.parentNode && r.parentNode == e.display.lineDiv) break
      }
    for (var i = 0; i < e.display.view.length; i++) {
      var o = e.display.view[i];
      if (o.node == r) return dl(o, t, n)
    }
  }

  function dl(e, t, n) {
    function r(t, n, r) {
      for (var i = -1; i < (f ? f.length : 0); i++)
        for (var o = i < 0 ? u.map : f[i], l = 0; l < o.length; l += 3) {
          var a = o[l + 2];
          if (a == t || a == n) {
            var s = P(i < 0 ? e.line : e.rest[i]),
              c = o[l] + r;
            return (r < 0 || a != t) && (c = o[l + (r ? 1 : 0)]), W(s, c)
          }
        }
    }
    var i = e.text.firstChild,
      l = !1;
    if (!t || !o(i, t)) return cl(W(P(e.line), 0), !0);
    if (t == i && (l = !0, t = i.childNodes[n], n = 0, !t)) {
      var a = e.rest ? g(e.rest) : e.line;
      return cl(W(P(a), a.text.length), l)
    }
    var s = 3 == t.nodeType ? t : null,
      c = t;
    for (s || 1 != t.childNodes.length || 3 != t.firstChild.nodeType || (s = t.firstChild, n && (n = s.nodeValue.length)); c.parentNode != i;) c = c.parentNode;
    var u = e.measure,
      f = u.maps,
      d = r(s, c, n);
    if (d) return cl(d, l);
    for (var h = c.nextSibling, p = s ? s.nodeValue.length - n : 0; h; h = h.nextSibling) {
      if (d = r(h, h.firstChild, 0)) return cl(W(d.line, d.ch - p), l);
      p += h.textContent.length
    }
    for (var m = c.previousSibling, v = n; m; m = m.previousSibling) {
      if (d = r(m, m.firstChild, -1)) return cl(W(d.line, d.ch + v), l);
      v += m.textContent.length
    }
  }

  function hl(e, t) {
    function n() {
      e.value = c.getValue()
    }
    if (t = t ? u(t) : {}, t.value = e.value, !t.tabindex && e.tabIndex && (t.tabindex = e.tabIndex), !t.placeholder && e.placeholder && (t.placeholder = e.placeholder), null == t.autofocus) {
      var r = l();
      t.autofocus = r == e || null != e.getAttribute("autofocus") && r == document.body
    }
    var i;
    if (e.form && (ia(e.form, "submit", n), !t.leaveSubmitMethodAlone)) {
      var o = e.form;
      i = o.submit;
      try {
        var a = o.submit = function() {
          n(), o.submit = i, o.submit(), o.submit = a
        }
      } catch (s) {}
    }
    t.finishInit = function(t) {
      t.save = n, t.getTextArea = function() {
        return e
      }, t.toTextArea = function() {
        t.toTextArea = isNaN, n(), e.parentNode.removeChild(t.getWrapperElement()), e.style.display = "", e.form && (Te(e.form, "submit", n), "function" == typeof e.form.submit && (e.form.submit = i))
      }
    }, e.style.display = "none";
    var c = Xo(function(t) {
      return e.parentNode.insertBefore(t, e.nextSibling)
    }, t);
    return c
  }

  function pl(e) {
    e.off = Te, e.on = ia, e.wheelEventPixels = Rr, e.Doc = Ra, e.splitLines = la, e.countColumn = f, e.findColumn = h, e.isWordChar = x, e.Pass = Vl, e.signal = Me, e.Line = va, e.changeEnd = qr, e.scrollbarModel = Ta, e.Pos = W, e.cmpPos = E, e.modes = ua, e.mimeModes = fa, e.resolveMode = Ge, e.getMode = Ue, e.modeExtensions = da, e.extendMode = Ke, e.copyState = Ve, e.startState = $e, e.innerMode = _e, e.commands = Va, e.keyMap = Ka, e.keyName = uo, e.isModifierKey = so, e.lookupKey = ao, e.normalizeKeyMap = lo, e.StringStream = ha, e.SharedTextMarker = Ea, e.TextMarker = Wa, e.LineWidget = Ha, e.e_preventDefault = De, e.e_stopPropagation = He, e.e_stop = We, e.addClass = a, e.contains = o, e.rmClass = Bl, e.keyNames = ja
  }
  var gl = navigator.userAgent,
    ml = navigator.platform,
    vl = /gecko\/\d/i.test(gl),
    yl = /MSIE \d/.test(gl),
    bl = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(gl),
    xl = /Edge\/(\d+)/.exec(gl),
    wl = yl || bl || xl,
    Cl = wl && (yl ? document.documentMode || 6 : +(xl || bl)[1]),
    kl = !xl && /WebKit\//.test(gl),
    Sl = kl && /Qt\/\d+\.\d+/.test(gl),
    Ll = !xl && /Chrome\//.test(gl),
    Tl = /Opera\//.test(gl),
    Ml = /Apple Computer/.test(navigator.vendor),
    Ol = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(gl),
    Nl = /PhantomJS/.test(gl),
    Al = !xl && /AppleWebKit/.test(gl) && /Mobile\/\w+/.test(gl),
    Pl = /Android/.test(gl),
    Dl = Al || Pl || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(gl),
    Hl = Al || /Mac/.test(ml),
    Fl = /\bCrOS\b/.test(gl),
    Wl = /win/i.test(ml),
    El = Tl && gl.match(/Version\/(\d*\.\d*)/);
  El && (El = Number(El[1])), El && El >= 15 && (Tl = !1, kl = !0);
  var Il, Rl = Hl && (Sl || Tl && (null == El || El < 12.11)),
    zl = vl || wl && Cl >= 9,
    Bl = function(t, n) {
      var r = t.className,
        i = e(n).exec(r);
      if (i) {
        var o = r.slice(i.index + i[0].length);
        t.className = r.slice(0, i.index) + (o ? i[1] + o : "")
      }
    };
  Il = document.createRange ? function(e, t, n, r) {
    var i = document.createRange();
    return i.setEnd(r || e, n), i.setStart(e, t), i
  } : function(e, t, n) {
    var r = document.body.createTextRange();
    try {
      r.moveToElementText(e.parentNode)
    } catch (i) {
      return r
    }
    return r.collapse(!0), r.moveEnd("character", n), r.moveStart("character", t), r
  };
  var jl = function(e) {
    e.select()
  };
  Al ? jl = function(e) {
    e.selectionStart = 0, e.selectionEnd = e.value.length
  } : wl && (jl = function(e) {
    try {
      e.select()
    } catch (t) {}
  });
  var ql = function() {
    this.id = null
  };
  ql.prototype.set = function(e, t) {
    clearTimeout(this.id), this.id = setTimeout(t, e)
  };
  var Gl, Ul, Kl = 30,
    Vl = {
      toString: function() {
        return "CodeMirror.Pass"
      }
    },
    _l = {
      scroll: !1
    },
    $l = {
      origin: "*mouse"
    },
    Xl = {
      origin: "+move"
    },
    Yl = [""],
    Zl = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/,
    Ql = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/,
    Jl = !1,
    ea = !1,
    ta = null,
    na = function() {
      function e(e) {
        return e <= 247 ? n.charAt(e) : 1424 <= e && e <= 1524 ? "R" : 1536 <= e && e <= 1785 ? r.charAt(e - 1536) : 1774 <= e && e <= 2220 ? "r" : 8192 <= e && e <= 8203 ? "w" : 8204 == e ? "b" : "L"
      }

      function t(e, t, n) {
        this.level = e, this.from = t, this.to = n
      }
      var n = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN",
        r = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111",
        i = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/,
        o = /[stwN]/,
        l = /[LRr]/,
        a = /[Lb1n]/,
        s = /[1n]/;
      return function(n, r) {
        var c = "ltr" == r ? "L" : "R";
        if (0 == n.length || "ltr" == r && !i.test(n)) return !1;
        for (var u = n.length, f = [], d = 0; d < u; ++d) f.push(e(n.charCodeAt(d)));
        for (var h = 0, p = c; h < u; ++h) {
          var m = f[h];
          "m" == m ? f[h] = p : p = m
        }
        for (var v = 0, y = c; v < u; ++v) {
          var b = f[v];
          "1" == b && "r" == y ? f[v] = "n" : l.test(b) && (y = b, "r" == b && (f[v] = "R"))
        }
        for (var x = 1, w = f[0]; x < u - 1; ++x) {
          var C = f[x];
          "+" == C && "1" == w && "1" == f[x + 1] ? f[x] = "1" : "," != C || w != f[x + 1] || "1" != w && "n" != w || (f[x] = w), w = C
        }
        for (var k = 0; k < u; ++k) {
          var S = f[k];
          if ("," == S) f[k] = "N";
          else if ("%" == S) {
            var L = void 0;
            for (L = k + 1; L < u && "%" == f[L]; ++L);
            for (var T = k && "!" == f[k - 1] || L < u && "1" == f[L] ? "1" : "N", M = k; M < L; ++M) f[M] = T;
            k = L - 1
          }
        }
        for (var O = 0, N = c; O < u; ++O) {
          var A = f[O];
          "L" == N && "1" == A ? f[O] = "L" : l.test(A) && (N = A)
        }
        for (var P = 0; P < u; ++P)
          if (o.test(f[P])) {
            var D = void 0;
            for (D = P + 1; D < u && o.test(f[D]); ++D);
            for (var H = "L" == (P ? f[P - 1] : c), F = "L" == (D < u ? f[D] : c), W = H == F ? H ? "L" : "R" : c, E = P; E < D; ++E) f[E] = W;
            P = D - 1
          } for (var I, R = [], z = 0; z < u;)
          if (a.test(f[z])) {
            var B = z;
            for (++z; z < u && a.test(f[z]); ++z);
            R.push(new t(0, B, z))
          } else {
            var j = z,
              q = R.length;
            for (++z; z < u && "L" != f[z]; ++z);
            for (var G = j; G < z;)
              if (s.test(f[G])) {
                j < G && R.splice(q, 0, new t(1, j, G));
                var U = G;
                for (++G; G < z && s.test(f[G]); ++G);
                R.splice(q, 0, new t(2, U, G)), j = G
              } else ++G;
            j < z && R.splice(q, 0, new t(1, j, z))
          } return "ltr" == r && (1 == R[0].level && (I = n.match(/^\s+/)) && (R[0].from = I[0].length, R.unshift(new t(0, 0, I[0].length))), 1 == g(R).level && (I = n.match(/\s+$/)) && (g(R).to -= I[0].length, R.push(new t(0, u - I[0].length, u)))), "rtl" == r ? R.reverse() : R
      }
    }(),
    ra = [],
    ia = function(e, t, n) {
      if (e.addEventListener) e.addEventListener(t, n, !1);
      else if (e.attachEvent) e.attachEvent("on" + t, n);
      else {
        var r = e._handlers || (e._handlers = {});
        r[t] = (r[t] || ra).concat(n)
      }
    },
    oa = function() {
      if (wl && Cl < 9) return !1;
      var e = r("div");
      return "draggable" in e || "dragDrop" in e
    }(),
    la = 3 != "\n\nb".split(/\n/).length ? function(e) {
      for (var t = 0, n = [], r = e.length; t <= r;) {
        var i = e.indexOf("\n", t);
        i == -1 && (i = e.length);
        var o = e.slice(t, "\r" == e.charAt(i - 1) ? i - 1 : i),
          l = o.indexOf("\r");
        l != -1 ? (n.push(o.slice(0, l)), t += l + 1) : (n.push(o), t = i + 1)
      }
      return n
    } : function(e) {
      return e.split(/\r\n?|\n/)
    },
    aa = window.getSelection ? function(e) {
      try {
        return e.selectionStart != e.selectionEnd
      } catch (t) {
        return !1
      }
    } : function(e) {
      var t;
      try {
        t = e.ownerDocument.selection.createRange()
      } catch (n) {}
      return !(!t || t.parentElement() != e) && 0 != t.compareEndPoints("StartToEnd", t)
    },
    sa = function() {
      var e = r("div");
      return "oncopy" in e || (e.setAttribute("oncopy", "return;"), "function" == typeof e.oncopy)
    }(),
    ca = null,
    ua = {},
    fa = {},
    da = {},
    ha = function(e, t, n) {
      this.pos = this.start = 0, this.string = e, this.tabSize = t || 8, this.lastColumnPos = this.lastColumnValue = 0, this.lineStart = 0, this.lineOracle = n
    };
  ha.prototype.eol = function() {
    return this.pos >= this.string.length
  }, ha.prototype.sol = function() {
    return this.pos == this.lineStart
  }, ha.prototype.peek = function() {
    return this.string.charAt(this.pos) || void 0
  }, ha.prototype.next = function() {
    if (this.pos < this.string.length) return this.string.charAt(this.pos++)
  }, ha.prototype.eat = function(e) {
    var t, n = this.string.charAt(this.pos);
    if (t = "string" == typeof e ? n == e : n && (e.test ? e.test(n) : e(n))) return ++this.pos, n
  }, ha.prototype.eatWhile = function(e) {
    for (var t = this.pos; this.eat(e););
    return this.pos > t
  }, ha.prototype.eatSpace = function() {
    for (var e = this, t = this.pos;
      /[\s\u00a0]/.test(this.string.charAt(this.pos));) ++e.pos;
    return this.pos > t
  }, ha.prototype.skipToEnd = function() {
    this.pos = this.string.length
  }, ha.prototype.skipTo = function(e) {
    var t = this.string.indexOf(e, this.pos);
    if (t > -1) return this.pos = t, !0
  }, ha.prototype.backUp = function(e) {
    this.pos -= e
  }, ha.prototype.column = function() {
    return this.lastColumnPos < this.start && (this.lastColumnValue = f(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue - (this.lineStart ? f(this.string, this.lineStart, this.tabSize) : 0)
  }, ha.prototype.indentation = function() {
    return f(this.string, null, this.tabSize) - (this.lineStart ? f(this.string, this.lineStart, this.tabSize) : 0)
  }, ha.prototype.match = function(e, t, n) {
    if ("string" != typeof e) {
      var r = this.string.slice(this.pos).match(e);
      return r && r.index > 0 ? null : (r && t !== !1 && (this.pos += r[0].length), r)
    }
    var i = function(e) {
        return n ? e.toLowerCase() : e
      },
      o = this.string.substr(this.pos, e.length);
    if (i(o) == i(e)) return t !== !1 && (this.pos += e.length), !0
  }, ha.prototype.current = function() {
    return this.string.slice(this.start, this.pos)
  }, ha.prototype.hideFirstChars = function(e, t) {
    this.lineStart += e;
    try {
      return t()
    } finally {
      this.lineStart -= e
    }
  }, ha.prototype.lookAhead = function(e) {
    var t = this.lineOracle;
    return t && t.lookAhead(e)
  }, ha.prototype.baseToken = function() {
    var e = this.lineOracle;
    return e && e.baseToken(this.pos)
  };
  var pa = function(e, t) {
      this.state = e, this.lookAhead = t
    },
    ga = function(e, t, n, r) {
      this.state = t, this.doc = e, this.line = n, this.maxLookAhead = r || 0, this.baseTokens = null, this.baseTokenPos = 1
    };
  ga.prototype.lookAhead = function(e) {
    var t = this.doc.getLine(this.line + e);
    return null != t && e > this.maxLookAhead && (this.maxLookAhead = e), t
  }, ga.prototype.baseToken = function(e) {
    var t = this;
    if (!this.baseTokens) return null;
    for (; this.baseTokens[this.baseTokenPos] <= e;) t.baseTokenPos += 2;
    var n = this.baseTokens[this.baseTokenPos + 1];
    return {
      type: n && n.replace(/( |^)overlay .*/, ""),
      size: this.baseTokens[this.baseTokenPos] - e
    }
  }, ga.prototype.nextLine = function() {
    this.line++, this.maxLookAhead > 0 && this.maxLookAhead--
  }, ga.fromSaved = function(e, t, n) {
    return t instanceof pa ? new ga(e, Ve(e.mode, t.state), n, t.lookAhead) : new ga(e, Ve(e.mode, t), n)
  }, ga.prototype.save = function(e) {
    var t = e !== !1 ? Ve(this.doc.mode, this.state) : this.state;
    return this.maxLookAhead > 0 ? new pa(t, this.maxLookAhead) : t
  };
  var ma = function(e, t, n) {
      this.start = e.start, this.end = e.pos, this.string = e.current(), this.type = t || null, this.state = n
    },
    va = function(e, t, n) {
      this.text = e, re(this, t), this.height = n ? n(this) : 1
    };
  va.prototype.lineNo = function() {
    return P(this)
  }, Pe(va);
  var ya, ba = {},
    xa = {},
    wa = null,
    Ca = null,
    ka = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    Sa = function(e, t, n) {
      this.cm = n;
      var i = this.vert = r("div", [r("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar"),
        o = this.horiz = r("div", [r("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
      i.tabIndex = o.tabIndex = -1, e(i), e(o), ia(i, "scroll", function() {
        i.clientHeight && t(i.scrollTop, "vertical")
      }), ia(o, "scroll", function() {
        o.clientWidth && t(o.scrollLeft, "horizontal")
      }), this.checkedZeroWidth = !1, wl && Cl < 8 && (this.horiz.style.minHeight = this.vert.style.minWidth = "18px")
    };
  Sa.prototype.update = function(e) {
    var t = e.scrollWidth > e.clientWidth + 1,
      n = e.scrollHeight > e.clientHeight + 1,
      r = e.nativeBarWidth;
    if (n) {
      this.vert.style.display = "block", this.vert.style.bottom = t ? r + "px" : "0";
      var i = e.viewHeight - (t ? r : 0);
      this.vert.firstChild.style.height = Math.max(0, e.scrollHeight - e.clientHeight + i) + "px"
    } else this.vert.style.display = "", this.vert.firstChild.style.height = "0";
    if (t) {
      this.horiz.style.display = "block", this.horiz.style.right = n ? r + "px" : "0", this.horiz.style.left = e.barLeft + "px";
      var o = e.viewWidth - e.barLeft - (n ? r : 0);
      this.horiz.firstChild.style.width = Math.max(0, e.scrollWidth - e.clientWidth + o) + "px"
    } else this.horiz.style.display = "", this.horiz.firstChild.style.width = "0";
    return !this.checkedZeroWidth && e.clientHeight > 0 && (0 == r && this.zeroWidthHack(), this.checkedZeroWidth = !0), {
      right: n ? r : 0,
      bottom: t ? r : 0
    }
  }, Sa.prototype.setScrollLeft = function(e) {
    this.horiz.scrollLeft != e && (this.horiz.scrollLeft = e), this.disableHoriz && this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz")
  }, Sa.prototype.setScrollTop = function(e) {
    this.vert.scrollTop != e && (this.vert.scrollTop = e), this.disableVert && this.enableZeroWidthBar(this.vert, this.disableVert, "vert")
  }, Sa.prototype.zeroWidthHack = function() {
    var e = Hl && !Ol ? "12px" : "18px";
    this.horiz.style.height = this.vert.style.width = e, this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none", this.disableHoriz = new ql, this.disableVert = new ql
  }, Sa.prototype.enableZeroWidthBar = function(e, t, n) {
    function r() {
      var i = e.getBoundingClientRect(),
        o = "vert" == n ? document.elementFromPoint(i.right - 1, (i.top + i.bottom) / 2) : document.elementFromPoint((i.right + i.left) / 2, i.bottom - 1);
      o != e ? e.style.pointerEvents = "none" : t.set(1e3, r)
    }
    e.style.pointerEvents = "auto", t.set(1e3, r)
  }, Sa.prototype.clear = function() {
    var e = this.horiz.parentNode;
    e.removeChild(this.horiz), e.removeChild(this.vert)
  };
  var La = function() {};
  La.prototype.update = function() {
    return {
      bottom: 0,
      right: 0
    }
  }, La.prototype.setScrollLeft = function() {}, La.prototype.setScrollTop = function() {}, La.prototype.clear = function() {};
  var Ta = {
      "native": Sa,
      "null": La
    },
    Ma = 0,
    Oa = function(e, t, n) {
      var r = e.display;
      this.viewport = t, this.visible = Bn(r, e.doc, t), this.editorIsHidden = !r.wrapper.offsetWidth, this.wrapperHeight = r.wrapper.clientHeight, this.wrapperWidth = r.wrapper.clientWidth, this.oldDisplayWidth = jt(e), this.force = n, this.dims = Cn(e), this.events = []
    };
  Oa.prototype.signal = function(e, t) {
    Ae(e, t) && this.events.push(arguments)
  }, Oa.prototype.finish = function() {
    for (var e = this, t = 0; t < this.events.length; t++) Me.apply(null, e.events[t])
  };
  var Na = 0,
    Aa = null;
  wl ? Aa = -.53 : vl ? Aa = 15 : Ll ? Aa = -.7 : Ml && (Aa = -1 / 3);
  var Pa = function(e, t) {
    this.ranges = e, this.primIndex = t
  };
  Pa.prototype.primary = function() {
    return this.ranges[this.primIndex]
  }, Pa.prototype.equals = function(e) {
    var t = this;
    if (e == this) return !0;
    if (e.primIndex != this.primIndex || e.ranges.length != this.ranges.length) return !1;
    for (var n = 0; n < this.ranges.length; n++) {
      var r = t.ranges[n],
        i = e.ranges[n];
      if (!I(r.anchor, i.anchor) || !I(r.head, i.head)) return !1
    }
    return !0
  }, Pa.prototype.deepCopy = function() {
    for (var e = this, t = [], n = 0; n < this.ranges.length; n++) t[n] = new Da(R(e.ranges[n].anchor), R(e.ranges[n].head));
    return new Pa(t, this.primIndex)
  }, Pa.prototype.somethingSelected = function() {
    for (var e = this, t = 0; t < this.ranges.length; t++)
      if (!e.ranges[t].empty()) return !0;
    return !1
  }, Pa.prototype.contains = function(e, t) {
    var n = this;
    t || (t = e);
    for (var r = 0; r < this.ranges.length; r++) {
      var i = n.ranges[r];
      if (E(t, i.from()) >= 0 && E(e, i.to()) <= 0) return r
    }
    return -1
  };
  var Da = function(e, t) {
    this.anchor = e, this.head = t
  };
  Da.prototype.from = function() {
    return B(this.anchor, this.head)
  }, Da.prototype.to = function() {
    return z(this.anchor, this.head)
  }, Da.prototype.empty = function() {
    return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch
  }, qi.prototype = {
    chunkSize: function() {
      return this.lines.length
    },
    removeInner: function(e, t) {
      for (var n = this, r = e, i = e + t; r < i; ++r) {
        var o = n.lines[r];
        n.height -= o.height, at(o), wt(o, "delete")
      }
      this.lines.splice(e, t)
    },
    collapse: function(e) {
      e.push.apply(e, this.lines)
    },
    insertInner: function(e, t, n) {
      var r = this;
      this.height += n, this.lines = this.lines.slice(0, e).concat(t).concat(this.lines.slice(e));
      for (var i = 0; i < t.length; ++i) t[i].parent = r
    },
    iterN: function(e, t, n) {
      for (var r = this, i = e + t; e < i; ++e)
        if (n(r.lines[e])) return !0
    }
  }, Gi.prototype = {
    chunkSize: function() {
      return this.size
    },
    removeInner: function(e, t) {
      var n = this;
      this.size -= t;
      for (var r = 0; r < this.children.length; ++r) {
        var i = n.children[r],
          o = i.chunkSize();
        if (e < o) {
          var l = Math.min(t, o - e),
            a = i.height;
          if (i.removeInner(e, l), n.height -= a - i.height, o == l && (n.children.splice(r--, 1), i.parent = null), 0 == (t -= l)) break;
          e = 0
        } else e -= o
      }
      if (this.size - t < 25 && (this.children.length > 1 || !(this.children[0] instanceof qi))) {
        var s = [];
        this.collapse(s), this.children = [new qi(s)], this.children[0].parent = this
      }
    },
    collapse: function(e) {
      for (var t = this, n = 0; n < this.children.length; ++n) t.children[n].collapse(e)
    },
    insertInner: function(e, t, n) {
      var r = this;
      this.size += t.length, this.height += n;
      for (var i = 0; i < this.children.length; ++i) {
        var o = r.children[i],
          l = o.chunkSize();
        if (e <= l) {
          if (o.insertInner(e, t, n), o.lines && o.lines.length > 50) {
            for (var a = o.lines.length % 25 + 25, s = a; s < o.lines.length;) {
              var c = new qi(o.lines.slice(s, s += 25));
              o.height -= c.height, r.children.splice(++i, 0, c), c.parent = r
            }
            o.lines = o.lines.slice(0, a), r.maybeSpill()
          }
          break
        }
        e -= l
      }
    },
    maybeSpill: function() {
      if (!(this.children.length <= 10)) {
        var e = this;
        do {
          var t = e.children.splice(e.children.length - 5, 5),
            n = new Gi(t);
          if (e.parent) {
            e.size -= n.size, e.height -= n.height;
            var r = d(e.parent.children, e);
            e.parent.children.splice(r + 1, 0, n)
          } else {
            var i = new Gi(e.children);
            i.parent = e, e.children = [i, n], e = i
          }
          n.parent = e.parent
        } while (e.children.length > 10);
        e.parent.maybeSpill()
      }
    },
    iterN: function(e, t, n) {
      for (var r = this, i = 0; i < this.children.length; ++i) {
        var o = r.children[i],
          l = o.chunkSize();
        if (e < l) {
          var a = Math.min(t, l - e);
          if (o.iterN(e, a, n)) return !0;
          if (0 == (t -= a)) break;
          e = 0
        } else e -= l
      }
    }
  };
  var Ha = function(e, t, n) {
    var r = this;
    if (n)
      for (var i in n) n.hasOwnProperty(i) && (r[i] = n[i]);
    this.doc = e, this.node = t
  };
  Ha.prototype.clear = function() {
    var e = this,
      t = this.doc.cm,
      n = this.line.widgets,
      r = this.line,
      i = P(r);
    if (null != i && n) {
      for (var o = 0; o < n.length; ++o) n[o] == e && n.splice(o--, 1);
      n.length || (r.widgets = null);
      var l = Wt(this);
      A(r, Math.max(0, r.height - l)), t && (pr(t, function() {
        Ui(t, r, -l), br(t, i, "widget")
      }), wt(t, "lineWidgetCleared", t, this, i))
    }
  }, Ha.prototype.changed = function() {
    var e = this,
      t = this.height,
      n = this.doc.cm,
      r = this.line;
    this.height = null;
    var i = Wt(this) - t;
    i && (A(r, r.height + i), n && pr(n, function() {
      n.curOp.forceUpdate = !0, Ui(n, r, i), wt(n, "lineWidgetChanged", n, e, P(r))
    }))
  }, Pe(Ha);
  var Fa = 0,
    Wa = function(e, t) {
      this.lines = [], this.type = t, this.doc = e, this.id = ++Fa
    };
  Wa.prototype.clear = function() {
    var e = this;
    if (!this.explicitlyCleared) {
      var t = this.doc.cm,
        n = t && !t.curOp;
      if (n && lr(t), Ae(this, "clear")) {
        var r = this.find();
        r && wt(this, "clear", r.from, r.to)
      }
      for (var i = null, o = null, l = 0; l < this.lines.length; ++l) {
        var a = e.lines[l],
          s = $(a.markedSpans, e);
        t && !e.collapsed ? br(t, P(a), "text") : t && (null != s.to && (o = P(a)), null != s.from && (i = P(a))), a.markedSpans = X(a.markedSpans, s), null == s.from && e.collapsed && !ve(e.doc, a) && t && A(a, xn(t.display))
      }
      if (t && this.collapsed && !t.options.lineWrapping)
        for (var c = 0; c < this.lines.length; ++c) {
          var u = de(e.lines[c]),
            f = xe(u);
          f > t.display.maxLineLength && (t.display.maxLine = u, t.display.maxLineLength = f, t.display.maxLineChanged = !0)
        }
      null != i && t && this.collapsed && yr(t, i, o + 1), this.lines.length = 0, this.explicitlyCleared = !0, this.atomic && this.doc.cantEdit && (this.doc.cantEdit = !1, t && Si(t.doc)), t && wt(t, "markerCleared", t, this, i, o), n && ar(t), this.parent && this.parent.clear()
    }
  }, Wa.prototype.find = function(e, t) {
    var n = this;
    null == e && "bookmark" == this.type && (e = 1);
    for (var r, i, o = 0; o < this.lines.length; ++o) {
      var l = n.lines[o],
        a = $(l.markedSpans, n);
      if (null != a.from && (r = W(t ? l : P(l), a.from), e == -1)) return r;
      if (null != a.to && (i = W(t ? l : P(l), a.to), 1 == e)) return i
    }
    return r && {
      from: r,
      to: i
    }
  }, Wa.prototype.changed = function() {
    var e = this,
      t = this.find(-1, !0),
      n = this,
      r = this.doc.cm;
    t && r && pr(r, function() {
      var i = t.line,
        o = P(t.line),
        l = _t(r, o);
      if (l && (en(l), r.curOp.selectionChanged = r.curOp.forceUpdate = !0), r.curOp.updateMaxLine = !0, !ve(n.doc, i) && null != n.height) {
        var a = n.height;
        n.height = null;
        var s = Wt(n) - a;
        s && A(i, i.height + s)
      }
      wt(r, "markerChanged", r, e)
    })
  }, Wa.prototype.attachLine = function(e) {
    if (!this.lines.length && this.doc.cm) {
      var t = this.doc.cm.curOp;
      t.maybeHiddenMarkers && d(t.maybeHiddenMarkers, this) != -1 || (t.maybeUnhiddenMarkers || (t.maybeUnhiddenMarkers = [])).push(this)
    }
    this.lines.push(e)
  }, Wa.prototype.detachLine = function(e) {
    if (this.lines.splice(d(this.lines, e), 1), !this.lines.length && this.doc.cm) {
      var t = this.doc.cm.curOp;
      (t.maybeHiddenMarkers || (t.maybeHiddenMarkers = [])).push(this)
    }
  }, Pe(Wa);
  var Ea = function(e, t) {
    var n = this;
    this.markers = e, this.primary = t;
    for (var r = 0; r < e.length; ++r) e[r].parent = n;
  };
  Ea.prototype.clear = function() {
    var e = this;
    if (!this.explicitlyCleared) {
      this.explicitlyCleared = !0;
      for (var t = 0; t < this.markers.length; ++t) e.markers[t].clear();
      wt(this, "clear")
    }
  }, Ea.prototype.find = function(e, t) {
    return this.primary.find(e, t)
  }, Pe(Ea);
  var Ia = 0,
    Ra = function(e, t, n, r, i) {
      if (!(this instanceof Ra)) return new Ra(e, t, n, r, i);
      null == n && (n = 0), Gi.call(this, [new qi([new va("", null)])]), this.first = n, this.scrollTop = this.scrollLeft = 0, this.cantEdit = !1, this.cleanGeneration = 1, this.modeFrontier = this.highlightFrontier = n;
      var o = W(n, 0);
      this.sel = jr(o), this.history = new ti(null), this.id = ++Ia, this.modeOption = t, this.lineSep = r, this.direction = "rtl" == i ? "rtl" : "ltr", this.extend = !1, "string" == typeof e && (e = this.splitLines(e)), Yr(this, {
        from: o,
        to: o,
        text: e
      }), wi(this, jr(o), _l)
    };
  Ra.prototype = b(Gi.prototype, {
    constructor: Ra,
    iter: function(e, t, n) {
      n ? this.iterN(e - this.first, t - e, n) : this.iterN(this.first, this.first + this.size, e)
    },
    insert: function(e, t) {
      for (var n = 0, r = 0; r < t.length; ++r) n += t[r].height;
      this.insertInner(e - this.first, t, n)
    },
    remove: function(e, t) {
      this.removeInner(e - this.first, t)
    },
    getValue: function(e) {
      var t = N(this, this.first, this.first + this.size);
      return e === !1 ? t : t.join(e || this.lineSeparator())
    },
    setValue: vr(function(e) {
      var t = W(this.first, 0),
        n = this.first + this.size - 1;
      Pi(this, {
        from: t,
        to: W(n, M(this, n).text.length),
        text: this.splitLines(e),
        origin: "setValue",
        full: !0
      }, !0), this.cm && Xn(this.cm, 0, 0), wi(this, jr(t), _l)
    }),
    replaceRange: function(e, t, n, r) {
      t = q(this, t), n = n ? q(this, n) : t, Ii(this, e, t, n, r)
    },
    getRange: function(e, t, n) {
      var r = O(this, q(this, e), q(this, t));
      return n === !1 ? r : r.join(n || this.lineSeparator())
    },
    getLine: function(e) {
      var t = this.getLineHandle(e);
      return t && t.text
    },
    getLineHandle: function(e) {
      if (H(this, e)) return M(this, e)
    },
    getLineNumber: function(e) {
      return P(e)
    },
    getLineHandleVisualStart: function(e) {
      return "number" == typeof e && (e = M(this, e)), de(e)
    },
    lineCount: function() {
      return this.size
    },
    firstLine: function() {
      return this.first
    },
    lastLine: function() {
      return this.first + this.size - 1
    },
    clipPos: function(e) {
      return q(this, e)
    },
    getCursor: function(e) {
      var t, n = this.sel.primary();
      return t = null == e || "head" == e ? n.head : "anchor" == e ? n.anchor : "end" == e || "to" == e || e === !1 ? n.to() : n.from()
    },
    listSelections: function() {
      return this.sel.ranges
    },
    somethingSelected: function() {
      return this.sel.somethingSelected()
    },
    setCursor: vr(function(e, t, n) {
      yi(this, q(this, "number" == typeof e ? W(e, t || 0) : e), null, n)
    }),
    setSelection: vr(function(e, t, n) {
      yi(this, q(this, e), q(this, t || e), n)
    }),
    extendSelection: vr(function(e, t, n) {
      gi(this, q(this, e), t && q(this, t), n)
    }),
    extendSelections: vr(function(e, t) {
      mi(this, U(this, e), t)
    }),
    extendSelectionsBy: vr(function(e, t) {
      var n = m(this.sel.ranges, e);
      mi(this, U(this, n), t)
    }),
    setSelections: vr(function(e, t, n) {
      var r = this;
      if (e.length) {
        for (var i = [], o = 0; o < e.length; o++) i[o] = new Da(q(r, e[o].anchor), q(r, e[o].head));
        null == t && (t = Math.min(e.length - 1, this.sel.primIndex)), wi(this, Br(i, t), n)
      }
    }),
    addSelection: vr(function(e, t, n) {
      var r = this.sel.ranges.slice(0);
      r.push(new Da(q(this, e), q(this, t || e))), wi(this, Br(r, r.length - 1), n)
    }),
    getSelection: function(e) {
      for (var t, n = this, r = this.sel.ranges, i = 0; i < r.length; i++) {
        var o = O(n, r[i].from(), r[i].to());
        t = t ? t.concat(o) : o
      }
      return e === !1 ? t : t.join(e || this.lineSeparator())
    },
    getSelections: function(e) {
      for (var t = this, n = [], r = this.sel.ranges, i = 0; i < r.length; i++) {
        var o = O(t, r[i].from(), r[i].to());
        e !== !1 && (o = o.join(e || t.lineSeparator())), n[i] = o
      }
      return n
    },
    replaceSelection: function(e, t, n) {
      for (var r = [], i = 0; i < this.sel.ranges.length; i++) r[i] = e;
      this.replaceSelections(r, t, n || "+input")
    },
    replaceSelections: vr(function(e, t, n) {
      for (var r = this, i = [], o = this.sel, l = 0; l < o.ranges.length; l++) {
        var a = o.ranges[l];
        i[l] = {
          from: a.from(),
          to: a.to(),
          text: r.splitLines(e[l]),
          origin: n
        }
      }
      for (var s = t && "end" != t && Vr(this, i, t), c = i.length - 1; c >= 0; c--) Pi(r, i[c]);
      s ? xi(this, s) : this.cm && $n(this.cm)
    }),
    undo: vr(function() {
      Hi(this, "undo")
    }),
    redo: vr(function() {
      Hi(this, "redo")
    }),
    undoSelection: vr(function() {
      Hi(this, "undo", !0)
    }),
    redoSelection: vr(function() {
      Hi(this, "redo", !0)
    }),
    setExtending: function(e) {
      this.extend = e
    },
    getExtending: function() {
      return this.extend
    },
    historySize: function() {
      for (var e = this.history, t = 0, n = 0, r = 0; r < e.done.length; r++) e.done[r].ranges || ++t;
      for (var i = 0; i < e.undone.length; i++) e.undone[i].ranges || ++n;
      return {
        undo: t,
        redo: n
      }
    },
    clearHistory: function() {
      this.history = new ti(this.history.maxGeneration)
    },
    markClean: function() {
      this.cleanGeneration = this.changeGeneration(!0)
    },
    changeGeneration: function(e) {
      return e && (this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null), this.history.generation
    },
    isClean: function(e) {
      return this.history.generation == (e || this.cleanGeneration)
    },
    getHistory: function() {
      return {
        done: hi(this.history.done),
        undone: hi(this.history.undone)
      }
    },
    setHistory: function(e) {
      var t = this.history = new ti(this.history.maxGeneration);
      t.done = hi(e.done.slice(0), null, !0), t.undone = hi(e.undone.slice(0), null, !0)
    },
    setGutterMarker: vr(function(e, t, n) {
      return ji(this, e, "gutter", function(e) {
        var r = e.gutterMarkers || (e.gutterMarkers = {});
        return r[t] = n, !n && C(r) && (e.gutterMarkers = null), !0
      })
    }),
    clearGutter: vr(function(e) {
      var t = this;
      this.iter(function(n) {
        n.gutterMarkers && n.gutterMarkers[e] && ji(t, n, "gutter", function() {
          return n.gutterMarkers[e] = null, C(n.gutterMarkers) && (n.gutterMarkers = null), !0
        })
      })
    }),
    lineInfo: function(e) {
      var t;
      if ("number" == typeof e) {
        if (!H(this, e)) return null;
        if (t = e, e = M(this, e), !e) return null
      } else if (t = P(e), null == t) return null;
      return {
        line: t,
        handle: e,
        text: e.text,
        gutterMarkers: e.gutterMarkers,
        textClass: e.textClass,
        bgClass: e.bgClass,
        wrapClass: e.wrapClass,
        widgets: e.widgets
      }
    },
    addLineClass: vr(function(t, n, r) {
      return ji(this, t, "gutter" == n ? "gutter" : "class", function(t) {
        var i = "text" == n ? "textClass" : "background" == n ? "bgClass" : "gutter" == n ? "gutterClass" : "wrapClass";
        if (t[i]) {
          if (e(r).test(t[i])) return !1;
          t[i] += " " + r
        } else t[i] = r;
        return !0
      })
    }),
    removeLineClass: vr(function(t, n, r) {
      return ji(this, t, "gutter" == n ? "gutter" : "class", function(t) {
        var i = "text" == n ? "textClass" : "background" == n ? "bgClass" : "gutter" == n ? "gutterClass" : "wrapClass",
          o = t[i];
        if (!o) return !1;
        if (null == r) t[i] = null;
        else {
          var l = o.match(e(r));
          if (!l) return !1;
          var a = l.index + l[0].length;
          t[i] = o.slice(0, l.index) + (l.index && a != o.length ? " " : "") + o.slice(a) || null
        }
        return !0
      })
    }),
    addLineWidget: vr(function(e, t, n) {
      return Ki(this, e, t, n)
    }),
    removeLineWidget: function(e) {
      e.clear()
    },
    markText: function(e, t, n) {
      return Vi(this, q(this, e), q(this, t), n, n && n.type || "range")
    },
    setBookmark: function(e, t) {
      var n = {
        replacedWith: t && (null == t.nodeType ? t.widget : t),
        insertLeft: t && t.insertLeft,
        clearWhenEmpty: !1,
        shared: t && t.shared,
        handleMouseEvents: t && t.handleMouseEvents
      };
      return e = q(this, e), Vi(this, e, e, n, "bookmark")
    },
    findMarksAt: function(e) {
      e = q(this, e);
      var t = [],
        n = M(this, e.line).markedSpans;
      if (n)
        for (var r = 0; r < n.length; ++r) {
          var i = n[r];
          (null == i.from || i.from <= e.ch) && (null == i.to || i.to >= e.ch) && t.push(i.marker.parent || i.marker)
        }
      return t
    },
    findMarks: function(e, t, n) {
      e = q(this, e), t = q(this, t);
      var r = [],
        i = e.line;
      return this.iter(e.line, t.line + 1, function(o) {
        var l = o.markedSpans;
        if (l)
          for (var a = 0; a < l.length; a++) {
            var s = l[a];
            null != s.to && i == e.line && e.ch >= s.to || null == s.from && i != e.line || null != s.from && i == t.line && s.from >= t.ch || n && !n(s.marker) || r.push(s.marker.parent || s.marker)
          }++i
      }), r
    },
    getAllMarks: function() {
      var e = [];
      return this.iter(function(t) {
        var n = t.markedSpans;
        if (n)
          for (var r = 0; r < n.length; ++r) null != n[r].from && e.push(n[r].marker)
      }), e
    },
    posFromIndex: function(e) {
      var t, n = this.first,
        r = this.lineSeparator().length;
      return this.iter(function(i) {
        var o = i.text.length + r;
        return o > e ? (t = e, !0) : (e -= o, void++n)
      }), q(this, W(n, t))
    },
    indexFromPos: function(e) {
      e = q(this, e);
      var t = e.ch;
      if (e.line < this.first || e.ch < 0) return 0;
      var n = this.lineSeparator().length;
      return this.iter(this.first, e.line, function(e) {
        t += e.text.length + n
      }), t
    },
    copy: function(e) {
      var t = new Ra(N(this, this.first, this.first + this.size), this.modeOption, this.first, this.lineSep, this.direction);
      return t.scrollTop = this.scrollTop, t.scrollLeft = this.scrollLeft, t.sel = this.sel, t.extend = !1, e && (t.history.undoDepth = this.history.undoDepth, t.setHistory(this.getHistory())), t
    },
    linkedDoc: function(e) {
      e || (e = {});
      var t = this.first,
        n = this.first + this.size;
      null != e.from && e.from > t && (t = e.from), null != e.to && e.to < n && (n = e.to);
      var r = new Ra(N(this, t, n), e.mode || this.modeOption, t, this.lineSep, this.direction);
      return e.sharedHist && (r.history = this.history), (this.linked || (this.linked = [])).push({
        doc: r,
        sharedHist: e.sharedHist
      }), r.linked = [{
        doc: this,
        isParent: !0,
        sharedHist: e.sharedHist
      }], Xi(r, $i(this)), r
    },
    unlinkDoc: function(e) {
      var t = this;
      if (e instanceof Xo && (e = e.doc), this.linked)
        for (var n = 0; n < this.linked.length; ++n) {
          var r = t.linked[n];
          if (r.doc == e) {
            t.linked.splice(n, 1), e.unlinkDoc(t), Yi($i(t));
            break
          }
        }
      if (e.history == this.history) {
        var i = [e.id];
        Zr(e, function(e) {
          return i.push(e.id)
        }, !0), e.history = new ti(null), e.history.done = hi(this.history.done, i), e.history.undone = hi(this.history.undone, i)
      }
    },
    iterLinkedDocs: function(e) {
      Zr(this, e)
    },
    getMode: function() {
      return this.mode
    },
    getEditor: function() {
      return this.cm
    },
    splitLines: function(e) {
      return this.lineSep ? e.split(this.lineSep) : la(e)
    },
    lineSeparator: function() {
      return this.lineSep || "\n"
    },
    setDirection: vr(function(e) {
      "rtl" != e && (e = "ltr"), e != this.direction && (this.direction = e, this.iter(function(e) {
        return e.order = null
      }), this.cm && ei(this.cm))
    })
  }), Ra.prototype.eachLine = Ra.prototype.iter;
  for (var za = 0, Ba = !1, ja = {
      3: "Pause",
      8: "Backspace",
      9: "Tab",
      13: "Enter",
      16: "Shift",
      17: "Ctrl",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Esc",
      32: "Space",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "Left",
      38: "Up",
      39: "Right",
      40: "Down",
      44: "PrintScrn",
      45: "Insert",
      46: "Delete",
      59: ";",
      61: "=",
      91: "Mod",
      92: "Mod",
      93: "Mod",
      106: "*",
      107: "=",
      109: "-",
      110: ".",
      111: "/",
      127: "Delete",
      145: "ScrollLock",
      173: "-",
      186: ";",
      187: "=",
      188: ",",
      189: "-",
      190: ".",
      191: "/",
      192: "`",
      219: "[",
      220: "\\",
      221: "]",
      222: "'",
      63232: "Up",
      63233: "Down",
      63234: "Left",
      63235: "Right",
      63272: "Delete",
      63273: "Home",
      63275: "End",
      63276: "PageUp",
      63277: "PageDown",
      63302: "Insert"
    }, qa = 0; qa < 10; qa++) ja[qa + 48] = ja[qa + 96] = String(qa);
  for (var Ga = 65; Ga <= 90; Ga++) ja[Ga] = String.fromCharCode(Ga);
  for (var Ua = 1; Ua <= 12; Ua++) ja[Ua + 111] = ja[Ua + 63235] = "F" + Ua;
  var Ka = {};
  Ka.basic = {
    Left: "goCharLeft",
    Right: "goCharRight",
    Up: "goLineUp",
    Down: "goLineDown",
    End: "goLineEnd",
    Home: "goLineStartSmart",
    PageUp: "goPageUp",
    PageDown: "goPageDown",
    Delete: "delCharAfter",
    Backspace: "delCharBefore",
    "Shift-Backspace": "delCharBefore",
    Tab: "defaultTab",
    "Shift-Tab": "indentAuto",
    Enter: "newlineAndIndent",
    Insert: "toggleOverwrite",
    Esc: "singleSelection"
  }, Ka.pcDefault = {
    "Ctrl-A": "selectAll",
    "Ctrl-D": "deleteLine",
    "Ctrl-Z": "undo",
    "Shift-Ctrl-Z": "redo",
    "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart",
    "Ctrl-End": "goDocEnd",
    "Ctrl-Up": "goLineUp",
    "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft",
    "Ctrl-Right": "goGroupRight",
    "Alt-Left": "goLineStart",
    "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore",
    "Ctrl-Delete": "delGroupAfter",
    "Ctrl-S": "save",
    "Ctrl-F": "find",
    "Ctrl-G": "findNext",
    "Shift-Ctrl-G": "findPrev",
    "Shift-Ctrl-F": "replace",
    "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess",
    "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection",
    "Shift-Ctrl-U": "redoSelection",
    "Alt-U": "redoSelection",
    fallthrough: "basic"
  }, Ka.emacsy = {
    "Ctrl-F": "goCharRight",
    "Ctrl-B": "goCharLeft",
    "Ctrl-P": "goLineUp",
    "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight",
    "Alt-B": "goWordLeft",
    "Ctrl-A": "goLineStart",
    "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown",
    "Shift-Ctrl-V": "goPageUp",
    "Ctrl-D": "delCharAfter",
    "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter",
    "Alt-Backspace": "delWordBefore",
    "Ctrl-K": "killLine",
    "Ctrl-T": "transposeChars",
    "Ctrl-O": "openLine"
  }, Ka.macDefault = {
    "Cmd-A": "selectAll",
    "Cmd-D": "deleteLine",
    "Cmd-Z": "undo",
    "Shift-Cmd-Z": "redo",
    "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart",
    "Cmd-Up": "goDocStart",
    "Cmd-End": "goDocEnd",
    "Cmd-Down": "goDocEnd",
    "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight",
    "Cmd-Left": "goLineLeft",
    "Cmd-Right": "goLineRight",
    "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter",
    "Alt-Delete": "delGroupAfter",
    "Cmd-S": "save",
    "Cmd-F": "find",
    "Cmd-G": "findNext",
    "Shift-Cmd-G": "findPrev",
    "Cmd-Alt-F": "replace",
    "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess",
    "Cmd-]": "indentMore",
    "Cmd-Backspace": "delWrappedLineLeft",
    "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection",
    "Shift-Cmd-U": "redoSelection",
    "Ctrl-Up": "goDocStart",
    "Ctrl-Down": "goDocEnd",
    fallthrough: ["basic", "emacsy"]
  }, Ka["default"] = Hl ? Ka.macDefault : Ka.pcDefault;
  var Va = {
      selectAll: Ni,
      singleSelection: function(e) {
        return e.setSelection(e.getCursor("anchor"), e.getCursor("head"), _l)
      },
      killLine: function(e) {
        return ho(e, function(t) {
          if (t.empty()) {
            var n = M(e.doc, t.head.line).text.length;
            return t.head.ch == n && t.head.line < e.lastLine() ? {
              from: t.head,
              to: W(t.head.line + 1, 0)
            } : {
              from: t.head,
              to: W(t.head.line, n)
            }
          }
          return {
            from: t.from(),
            to: t.to()
          }
        })
      },
      deleteLine: function(e) {
        return ho(e, function(t) {
          return {
            from: W(t.from().line, 0),
            to: q(e.doc, W(t.to().line + 1, 0))
          }
        })
      },
      delLineLeft: function(e) {
        return ho(e, function(e) {
          return {
            from: W(e.from().line, 0),
            to: e.from()
          }
        })
      },
      delWrappedLineLeft: function(e) {
        return ho(e, function(t) {
          var n = e.charCoords(t.head, "div").top + 5,
            r = e.coordsChar({
              left: 0,
              top: n
            }, "div");
          return {
            from: r,
            to: t.from()
          }
        })
      },
      delWrappedLineRight: function(e) {
        return ho(e, function(t) {
          var n = e.charCoords(t.head, "div").top + 5,
            r = e.coordsChar({
              left: e.display.lineDiv.offsetWidth + 100,
              top: n
            }, "div");
          return {
            from: t.from(),
            to: r
          }
        })
      },
      undo: function(e) {
        return e.undo()
      },
      redo: function(e) {
        return e.redo()
      },
      undoSelection: function(e) {
        return e.undoSelection()
      },
      redoSelection: function(e) {
        return e.redoSelection()
      },
      goDocStart: function(e) {
        return e.extendSelection(W(e.firstLine(), 0))
      },
      goDocEnd: function(e) {
        return e.extendSelection(W(e.lastLine()))
      },
      goLineStart: function(e) {
        return e.extendSelectionsBy(function(t) {
          return yo(e, t.head.line)
        }, {
          origin: "+move",
          bias: 1
        })
      },
      goLineStartSmart: function(e) {
        return e.extendSelectionsBy(function(t) {
          return xo(e, t.head)
        }, {
          origin: "+move",
          bias: 1
        })
      },
      goLineEnd: function(e) {
        return e.extendSelectionsBy(function(t) {
          return bo(e, t.head.line)
        }, {
          origin: "+move",
          bias: -1
        })
      },
      goLineRight: function(e) {
        return e.extendSelectionsBy(function(t) {
          var n = e.cursorCoords(t.head, "div").top + 5;
          return e.coordsChar({
            left: e.display.lineDiv.offsetWidth + 100,
            top: n
          }, "div")
        }, Xl)
      },
      goLineLeft: function(e) {
        return e.extendSelectionsBy(function(t) {
          var n = e.cursorCoords(t.head, "div").top + 5;
          return e.coordsChar({
            left: 0,
            top: n
          }, "div")
        }, Xl)
      },
      goLineLeftSmart: function(e) {
        return e.extendSelectionsBy(function(t) {
          var n = e.cursorCoords(t.head, "div").top + 5,
            r = e.coordsChar({
              left: 0,
              top: n
            }, "div");
          return r.ch < e.getLine(r.line).search(/\S/) ? xo(e, t.head) : r
        }, Xl)
      },
      goLineUp: function(e) {
        return e.moveV(-1, "line")
      },
      goLineDown: function(e) {
        return e.moveV(1, "line")
      },
      goPageUp: function(e) {
        return e.moveV(-1, "page")
      },
      goPageDown: function(e) {
        return e.moveV(1, "page")
      },
      goCharLeft: function(e) {
        return e.moveH(-1, "char")
      },
      goCharRight: function(e) {
        return e.moveH(1, "char")
      },
      goColumnLeft: function(e) {
        return e.moveH(-1, "column")
      },
      goColumnRight: function(e) {
        return e.moveH(1, "column")
      },
      goWordLeft: function(e) {
        return e.moveH(-1, "word")
      },
      goGroupRight: function(e) {
        return e.moveH(1, "group")
      },
      goGroupLeft: function(e) {
        return e.moveH(-1, "group")
      },
      goWordRight: function(e) {
        return e.moveH(1, "word")
      },
      delCharBefore: function(e) {
        return e.deleteH(-1, "char")
      },
      delCharAfter: function(e) {
        return e.deleteH(1, "char")
      },
      delWordBefore: function(e) {
        return e.deleteH(-1, "word")
      },
      delWordAfter: function(e) {
        return e.deleteH(1, "word")
      },
      delGroupBefore: function(e) {
        return e.deleteH(-1, "group")
      },
      delGroupAfter: function(e) {
        return e.deleteH(1, "group")
      },
      indentAuto: function(e) {
        return e.indentSelection("smart")
      },
      indentMore: function(e) {
        return e.indentSelection("add")
      },
      indentLess: function(e) {
        return e.indentSelection("subtract")
      },
      insertTab: function(e) {
        return e.replaceSelection("\t")
      },
      insertSoftTab: function(e) {
        for (var t = [], n = e.listSelections(), r = e.options.tabSize, i = 0; i < n.length; i++) {
          var o = n[i].from(),
            l = f(e.getLine(o.line), o.ch, r);
          t.push(p(r - l % r))
        }
        e.replaceSelections(t)
      },
      defaultTab: function(e) {
        e.somethingSelected() ? e.indentSelection("add") : e.execCommand("insertTab")
      },
      transposeChars: function(e) {
        return pr(e, function() {
          for (var t = e.listSelections(), n = [], r = 0; r < t.length; r++)
            if (t[r].empty()) {
              var i = t[r].head,
                o = M(e.doc, i.line).text;
              if (o)
                if (i.ch == o.length && (i = new W(i.line, i.ch - 1)), i.ch > 0) i = new W(i.line, i.ch + 1), e.replaceRange(o.charAt(i.ch - 1) + o.charAt(i.ch - 2), W(i.line, i.ch - 2), i, "+transpose");
                else if (i.line > e.doc.first) {
                var l = M(e.doc, i.line - 1).text;
                l && (i = new W(i.line, 1), e.replaceRange(o.charAt(0) + e.doc.lineSeparator() + l.charAt(l.length - 1), W(i.line - 1, l.length - 1), i, "+transpose"))
              }
              n.push(new Da(i, i))
            } e.setSelections(n)
        })
      },
      newlineAndIndent: function(e) {
        return pr(e, function() {
          for (var t = e.listSelections(), n = t.length - 1; n >= 0; n--) e.replaceRange(e.doc.lineSeparator(), t[n].anchor, t[n].head, "+input");
          t = e.listSelections();
          for (var r = 0; r < t.length; r++) e.indentLine(t[r].from().line, null, !0);
          $n(e)
        })
      },
      openLine: function(e) {
        return e.replaceSelection("\n", "start")
      },
      toggleOverwrite: function(e) {
        return e.toggleOverwrite()
      }
    },
    _a = new ql,
    $a = null,
    Xa = 400,
    Ya = function(e, t, n) {
      this.time = e, this.pos = t, this.button = n
    };
  Ya.prototype.compare = function(e, t, n) {
    return this.time + Xa > e && 0 == E(t, this.pos) && n == this.button
  };
  var Za, Qa, Ja = {
      toString: function() {
        return "CodeMirror.Init"
      }
    },
    es = {},
    ts = {};
  Xo.defaults = es, Xo.optionHandlers = ts;
  var ns = [];
  Xo.defineInitHook = function(e) {
    return ns.push(e)
  };
  var rs = null,
    is = function(e) {
      var t = e.optionHandlers,
        n = e.helpers = {};
      e.prototype = {
        constructor: e,
        focus: function() {
          window.focus(), this.display.input.focus()
        },
        setOption: function(e, n) {
          var r = this.options,
            i = r[e];
          r[e] == n && "mode" != e || (r[e] = n, t.hasOwnProperty(e) && gr(this, t[e])(this, n, i), Me(this, "optionChange", this, e))
        },
        getOption: function(e) {
          return this.options[e]
        },
        getDoc: function() {
          return this.doc
        },
        addKeyMap: function(e, t) {
          this.state.keyMaps[t ? "push" : "unshift"](fo(e))
        },
        removeKeyMap: function(e) {
          for (var t = this.state.keyMaps, n = 0; n < t.length; ++n)
            if (t[n] == e || t[n].name == e) return t.splice(n, 1), !0
        },
        addOverlay: mr(function(t, n) {
          var r = t.token ? t : e.getMode(this.options, t);
          if (r.startState) throw new Error("Overlays may not be stateful.");
          v(this.state.overlays, {
            mode: r,
            modeSpec: t,
            opaque: n && n.opaque,
            priority: n && n.priority || 0
          }, function(e) {
            return e.priority
          }), this.state.modeGen++, yr(this)
        }),
        removeOverlay: mr(function(e) {
          for (var t = this, n = this.state.overlays, r = 0; r < n.length; ++r) {
            var i = n[r].modeSpec;
            if (i == e || "string" == typeof e && i.name == e) return n.splice(r, 1), t.state.modeGen++, void yr(t)
          }
        }),
        indentLine: mr(function(e, t, n) {
          "string" != typeof t && "number" != typeof t && (t = null == t ? this.options.smartIndent ? "smart" : "prev" : t ? "add" : "subtract"), H(this.doc, e) && Zo(this, e, t, n)
        }),
        indentSelection: mr(function(e) {
          for (var t = this, n = this.doc.sel.ranges, r = -1, i = 0; i < n.length; i++) {
            var o = n[i];
            if (o.empty()) o.head.line > r && (Zo(t, o.head.line, e, !0), r = o.head.line, i == t.doc.sel.primIndex && $n(t));
            else {
              var l = o.from(),
                a = o.to(),
                s = Math.max(r, l.line);
              r = Math.min(t.lastLine(), a.line - (a.ch ? 0 : 1)) + 1;
              for (var c = s; c < r; ++c) Zo(t, c, e);
              var u = t.doc.sel.ranges;
              0 == l.ch && n.length == u.length && u[i].from().ch > 0 && vi(t.doc, i, new Da(l, u[i].to()), _l)
            }
          }
        }),
        getTokenAt: function(e, t) {
          return tt(this, e, t)
        },
        getLineTokens: function(e, t) {
          return tt(this, W(e), t, !0)
        },
        getTokenTypeAt: function(e) {
          e = q(this.doc, e);
          var t, n = Ye(this, M(this.doc, e.line)),
            r = 0,
            i = (n.length - 1) / 2,
            o = e.ch;
          if (0 == o) t = n[2];
          else
            for (;;) {
              var l = r + i >> 1;
              if ((l ? n[2 * l - 1] : 0) >= o) i = l;
              else {
                if (!(n[2 * l + 1] < o)) {
                  t = n[2 * l + 2];
                  break
                }
                r = l + 1
              }
            }
          var a = t ? t.indexOf("overlay ") : -1;
          return a < 0 ? t : 0 == a ? null : t.slice(0, a - 1)
        },
        getModeAt: function(t) {
          var n = this.doc.mode;
          return n.innerMode ? e.innerMode(n, this.getTokenAt(t).state).mode : n
        },
        getHelper: function(e, t) {
          return this.getHelpers(e, t)[0]
        },
        getHelpers: function(e, t) {
          var r = this,
            i = [];
          if (!n.hasOwnProperty(t)) return i;
          var o = n[t],
            l = this.getModeAt(e);
          if ("string" == typeof l[t]) o[l[t]] && i.push(o[l[t]]);
          else if (l[t])
            for (var a = 0; a < l[t].length; a++) {
              var s = o[l[t][a]];
              s && i.push(s)
            } else l.helperType && o[l.helperType] ? i.push(o[l.helperType]) : o[l.name] && i.push(o[l.name]);
          for (var c = 0; c < o._global.length; c++) {
            var u = o._global[c];
            u.pred(l, r) && d(i, u.val) == -1 && i.push(u.val)
          }
          return i
        },
        getStateAfter: function(e, t) {
          var n = this.doc;
          return e = j(n, null == e ? n.first + n.size - 1 : e), Ze(this, e + 1, t).state
        },
        cursorCoords: function(e, t) {
          var n, r = this.doc.sel.primary();
          return n = null == e ? r.head : "object" == typeof e ? q(this.doc, e) : e ? r.from() : r.to(), un(this, n, t || "page")
        },
        charCoords: function(e, t) {
          return cn(this, q(this.doc, e), t || "page")
        },
        coordsChar: function(e, t) {
          return e = sn(this, e, t || "page"), hn(this, e.left, e.top)
        },
        lineAtHeight: function(e, t) {
          return e = sn(this, {
            top: e,
            left: 0
          }, t || "page").top, D(this.doc, e + this.display.viewOffset)
        },
        heightAtLine: function(e, t, n) {
          var r, i = !1;
          if ("number" == typeof e) {
            var o = this.doc.first + this.doc.size - 1;
            e < this.doc.first ? e = this.doc.first : e > o && (e = o, i = !0), r = M(this.doc, e)
          } else r = e;
          return an(this, r, {
            top: 0,
            left: 0
          }, t || "page", n || i).top + (i ? this.doc.height - be(r) : 0)
        },
        defaultTextHeight: function() {
          return xn(this.display)
        },
        defaultCharWidth: function() {
          return wn(this.display)
        },
        getViewport: function() {
          return {
            from: this.display.viewFrom,
            to: this.display.viewTo
          }
        },
        addWidget: function(e, t, n, r, i) {
          var o = this.display;
          e = un(this, q(this.doc, e));
          var l = e.bottom,
            a = e.left;
          if (t.style.position = "absolute", t.setAttribute("cm-ignore-events", "true"), this.display.input.setUneditable(t), o.sizer.appendChild(t), "over" == r) l = e.top;
          else if ("above" == r || "near" == r) {
            var s = Math.max(o.wrapper.clientHeight, this.doc.height),
              c = Math.max(o.sizer.clientWidth, o.lineSpace.clientWidth);
            ("above" == r || e.bottom + t.offsetHeight > s) && e.top > t.offsetHeight ? l = e.top - t.offsetHeight : e.bottom + t.offsetHeight <= s && (l = e.bottom), a + t.offsetWidth > c && (a = c - t.offsetWidth)
          }
          t.style.top = l + "px", t.style.left = t.style.right = "", "right" == i ? (a = o.sizer.clientWidth - t.offsetWidth, t.style.right = "0px") : ("left" == i ? a = 0 : "middle" == i && (a = (o.sizer.clientWidth - t.offsetWidth) / 2), t.style.left = a + "px"), n && Kn(this, {
            left: a,
            top: l,
            right: a + t.offsetWidth,
            bottom: l + t.offsetHeight
          })
        },
        triggerOnKeyDown: mr(Mo),
        triggerOnKeyPress: mr(Ao),
        triggerOnKeyUp: No,
        triggerOnMouseDown: mr(Do),
        execCommand: function(e) {
          if (Va.hasOwnProperty(e)) return Va[e].call(null, this)
        },
        triggerElectric: mr(function(e) {
          tl(this, e)
        }),
        findPosH: function(e, t, n, r) {
          var i = this,
            o = 1;
          t < 0 && (o = -1, t = -t);
          for (var l = q(this.doc, e), a = 0; a < t && (l = ol(i.doc, l, o, n, r), !l.hitSide); ++a);
          return l
        },
        moveH: mr(function(e, t) {
          var n = this;
          this.extendSelectionsBy(function(r) {
            return n.display.shift || n.doc.extend || r.empty() ? ol(n.doc, r.head, e, t, n.options.rtlMoveVisually) : e < 0 ? r.from() : r.to()
          }, Xl)
        }),
        deleteH: mr(function(e, t) {
          var n = this.doc.sel,
            r = this.doc;
          n.somethingSelected() ? r.replaceSelection("", null, "+delete") : ho(this, function(n) {
            var i = ol(r, n.head, e, t, !1);
            return e < 0 ? {
              from: i,
              to: n.head
            } : {
              from: n.head,
              to: i
            }
          })
        }),
        findPosV: function(e, t, n, r) {
          var i = this,
            o = 1,
            l = r;
          t < 0 && (o = -1, t = -t);
          for (var a = q(this.doc, e), s = 0; s < t; ++s) {
            var c = un(i, a, "div");
            if (null == l ? l = c.left : c.left = l, a = ll(i, c, o, n), a.hitSide) break
          }
          return a
        },
        moveV: mr(function(e, t) {
          var n = this,
            r = this.doc,
            i = [],
            o = !this.display.shift && !r.extend && r.sel.somethingSelected();
          if (r.extendSelectionsBy(function(l) {
              if (o) return e < 0 ? l.from() : l.to();
              var a = un(n, l.head, "div");
              null != l.goalColumn && (a.left = l.goalColumn), i.push(a.left);
              var s = ll(n, a, e, t);
              return "page" == t && l == r.sel.primary() && _n(n, cn(n, s, "div").top - a.top), s
            }, Xl), i.length)
            for (var l = 0; l < r.sel.ranges.length; l++) r.sel.ranges[l].goalColumn = i[l]
        }),
        findWordAt: function(e) {
          var t = this.doc,
            n = M(t, e.line).text,
            r = e.ch,
            i = e.ch;
          if (n) {
            var o = this.getHelper(e, "wordChars");
            "before" != e.sticky && i != n.length || !r ? ++i : --r;
            for (var l = n.charAt(r), a = w(l, o) ? function(e) {
                return w(e, o)
              } : /\s/.test(l) ? function(e) {
                return /\s/.test(e)
              } : function(e) {
                return !/\s/.test(e) && !w(e)
              }; r > 0 && a(n.charAt(r - 1));) --r;
            for (; i < n.length && a(n.charAt(i));) ++i
          }
          return new Da(W(e.line, r), W(e.line, i))
        },
        toggleOverwrite: function(e) {
          null != e && e == this.state.overwrite || ((this.state.overwrite = !this.state.overwrite) ? a(this.display.cursorDiv, "CodeMirror-overwrite") : Bl(this.display.cursorDiv, "CodeMirror-overwrite"), Me(this, "overwriteToggle", this, this.state.overwrite))
        },
        hasFocus: function() {
          return this.display.input.getField() == l()
        },
        isReadOnly: function() {
          return !(!this.options.readOnly && !this.doc.cantEdit)
        },
        scrollTo: mr(function(e, t) {
          Xn(this, e, t)
        }),
        getScrollInfo: function() {
          var e = this.display.scroller;
          return {
            left: e.scrollLeft,
            top: e.scrollTop,
            height: e.scrollHeight - Bt(this) - this.display.barHeight,
            width: e.scrollWidth - Bt(this) - this.display.barWidth,
            clientHeight: qt(this),
            clientWidth: jt(this)
          }
        },
        scrollIntoView: mr(function(e, t) {
          null == e ? (e = {
            from: this.doc.sel.primary().head,
            to: null
          }, null == t && (t = this.options.cursorScrollMargin)) : "number" == typeof e ? e = {
            from: W(e, 0),
            to: null
          } : null == e.from && (e = {
            from: e,
            to: null
          }), e.to || (e.to = e.from), e.margin = t || 0, null != e.from.line ? Yn(this, e) : Qn(this, e.from, e.to, e.margin)
        }),
        setSize: mr(function(e, t) {
          var n = this,
            r = function(e) {
              return "number" == typeof e || /^\d+$/.test(String(e)) ? e + "px" : e
            };
          null != e && (this.display.wrapper.style.width = r(e)), null != t && (this.display.wrapper.style.height = r(t)), this.options.lineWrapping && tn(this);
          var i = this.display.viewFrom;
          this.doc.iter(i, this.display.viewTo, function(e) {
            if (e.widgets)
              for (var t = 0; t < e.widgets.length; t++)
                if (e.widgets[t].noHScroll) {
                  br(n, i, "widget");
                  break
                }++ i
          }), this.curOp.forceUpdate = !0, Me(this, "refresh", this)
        }),
        operation: function(e) {
          return pr(this, e)
        },
        startOperation: function() {
          return lr(this)
        },
        endOperation: function() {
          return ar(this)
        },
        refresh: mr(function() {
          var e = this.display.cachedTextHeight;
          yr(this), this.curOp.forceUpdate = !0, nn(this), Xn(this, this.doc.scrollLeft, this.doc.scrollTop), Hr(this), (null == e || Math.abs(e - xn(this.display)) > .5) && Ln(this), Me(this, "refresh", this)
        }),
        swapDoc: mr(function(e) {
          var t = this.doc;
          return t.cm = null, Qr(this, e), nn(this), this.display.input.reset(), Xn(this, e.scrollLeft, e.scrollTop), this.curOp.forceScroll = !0, wt(this, "swapDoc", this, t), t
        }),
        getInputField: function() {
          return this.display.input.getField()
        },
        getWrapperElement: function() {
          return this.display.wrapper
        },
        getScrollerElement: function() {
          return this.display.scroller
        },
        getGutterElement: function() {
          return this.display.gutters
        }
      }, Pe(e), e.registerHelper = function(t, r, i) {
        n.hasOwnProperty(t) || (n[t] = e[t] = {
          _global: []
        }), n[t][r] = i
      }, e.registerGlobalHelper = function(t, r, i, o) {
        e.registerHelper(t, r, o), n[t]._global.push({
          pred: i,
          val: o
        })
      }
    },
    os = function(e) {
      this.cm = e, this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null, this.polling = new ql, this.composing = null, this.gracePeriod = !1, this.readDOMTimeout = null
    };
  os.prototype.init = function(e) {
    function t(e) {
      if (!Oe(i, e)) {
        if (i.somethingSelected()) Qo({
          lineWise: !1,
          text: i.getSelections()
        }), "cut" == e.type && i.replaceSelection("", null, "cut");
        else {
          if (!i.options.lineWiseCopyCut) return;
          var t = nl(i);
          Qo({
            lineWise: !0,
            text: t.text
          }), "cut" == e.type && i.operation(function() {
            i.setSelections(t.ranges, 0, _l), i.replaceSelection("", null, "cut")
          })
        }
        if (e.clipboardData) {
          e.clipboardData.clearData();
          var n = rs.text.join("\n");
          if (e.clipboardData.setData("Text", n), e.clipboardData.getData("Text") == n) return void e.preventDefault()
        }
        var l = il(),
          a = l.firstChild;
        i.display.lineSpace.insertBefore(l, i.display.lineSpace.firstChild), a.value = rs.text.join("\n");
        var s = document.activeElement;
        jl(a), setTimeout(function() {
          i.display.lineSpace.removeChild(l), s.focus(), s == o && r.showPrimarySelection()
        }, 50)
      }
    }
    var n = this,
      r = this,
      i = r.cm,
      o = r.div = e.lineDiv;
    rl(o, i.options.spellcheck), ia(o, "paste", function(e) {
      Oe(i, e) || el(e, i) || Cl <= 11 && setTimeout(gr(i, function() {
        return n.updateFromDOM()
      }), 20)
    }), ia(o, "compositionstart", function(e) {
      n.composing = {
        data: e.data,
        done: !1
      }
    }), ia(o, "compositionupdate", function(e) {
      n.composing || (n.composing = {
        data: e.data,
        done: !1
      })
    }), ia(o, "compositionend", function(e) {
      n.composing && (e.data != n.composing.data && n.readFromDOMSoon(), n.composing.done = !0)
    }), ia(o, "touchstart", function() {
      return r.forceCompositionEnd()
    }), ia(o, "input", function() {
      n.composing || n.readFromDOMSoon()
    }), ia(o, "copy", t), ia(o, "cut", t)
  }, os.prototype.prepareSelection = function() {
    var e = Nn(this.cm, !1);
    return e.focus = this.cm.state.focused, e
  }, os.prototype.showSelection = function(e, t) {
    e && this.cm.display.view.length && ((e.focus || t) && this.showPrimarySelection(), this.showMultipleSelections(e))
  }, os.prototype.getSelection = function() {
    return this.cm.display.wrapper.ownerDocument.getSelection()
  }, os.prototype.showPrimarySelection = function() {
    var e = this.getSelection(),
      t = this.cm,
      n = t.doc.sel.primary(),
      r = n.from(),
      i = n.to();
    if (t.display.viewTo == t.display.viewFrom || r.line >= t.display.viewTo || i.line < t.display.viewFrom) return void e.removeAllRanges();
    var o = fl(t, e.anchorNode, e.anchorOffset),
      l = fl(t, e.focusNode, e.focusOffset);
    if (!o || o.bad || !l || l.bad || 0 != E(B(o, l), r) || 0 != E(z(o, l), i)) {
      var a = t.display.view,
        s = r.line >= t.display.viewFrom && al(t, r) || {
          node: a[0].measure.map[2],
          offset: 0
        },
        c = i.line < t.display.viewTo && al(t, i);
      if (!c) {
        var u = a[a.length - 1].measure,
          f = u.maps ? u.maps[u.maps.length - 1] : u.map;
        c = {
          node: f[f.length - 1],
          offset: f[f.length - 2] - f[f.length - 3]
        }
      }
      if (!s || !c) return void e.removeAllRanges();
      var d, h = e.rangeCount && e.getRangeAt(0);
      try {
        d = Il(s.node, s.offset, c.offset, c.node)
      } catch (p) {}
      d && (!vl && t.state.focused ? (e.collapse(s.node, s.offset), d.collapsed || (e.removeAllRanges(), e.addRange(d))) : (e.removeAllRanges(), e.addRange(d)), h && null == e.anchorNode ? e.addRange(h) : vl && this.startGracePeriod()), this.rememberSelection()
    }
  }, os.prototype.startGracePeriod = function() {
    var e = this;
    clearTimeout(this.gracePeriod), this.gracePeriod = setTimeout(function() {
      e.gracePeriod = !1, e.selectionChanged() && e.cm.operation(function() {
        return e.cm.curOp.selectionChanged = !0
      })
    }, 20)
  }, os.prototype.showMultipleSelections = function(e) {
    n(this.cm.display.cursorDiv, e.cursors), n(this.cm.display.selectionDiv, e.selection)
  }, os.prototype.rememberSelection = function() {
    var e = this.getSelection();
    this.lastAnchorNode = e.anchorNode, this.lastAnchorOffset = e.anchorOffset, this.lastFocusNode = e.focusNode, this.lastFocusOffset = e.focusOffset
  }, os.prototype.selectionInEditor = function() {
    var e = this.getSelection();
    if (!e.rangeCount) return !1;
    var t = e.getRangeAt(0).commonAncestorContainer;
    return o(this.div, t)
  }, os.prototype.focus = function() {
    "nocursor" != this.cm.options.readOnly && (this.selectionInEditor() || this.showSelection(this.prepareSelection(), !0), this.div.focus())
  }, os.prototype.blur = function() {
    this.div.blur()
  }, os.prototype.getField = function() {
    return this.div
  }, os.prototype.supportsTouch = function() {
    return !0
  }, os.prototype.receivedFocus = function() {
    function e() {
      t.cm.state.focused && (t.pollSelection(), t.polling.set(t.cm.options.pollInterval, e))
    }
    var t = this;
    this.selectionInEditor() ? this.pollSelection() : pr(this.cm, function() {
      return t.cm.curOp.selectionChanged = !0
    }), this.polling.set(this.cm.options.pollInterval, e)
  }, os.prototype.selectionChanged = function() {
    var e = this.getSelection();
    return e.anchorNode != this.lastAnchorNode || e.anchorOffset != this.lastAnchorOffset || e.focusNode != this.lastFocusNode || e.focusOffset != this.lastFocusOffset
  }, os.prototype.pollSelection = function() {
    if (null == this.readDOMTimeout && !this.gracePeriod && this.selectionChanged()) {
      var e = this.getSelection(),
        t = this.cm;
      if (Pl && Ll && this.cm.options.gutters.length && sl(e.anchorNode)) return this.cm.triggerOnKeyDown({
        type: "keydown",
        keyCode: 8,
        preventDefault: Math.abs
      }), this.blur(), void this.focus();
      if (!this.composing) {
        this.rememberSelection();
        var n = fl(t, e.anchorNode, e.anchorOffset),
          r = fl(t, e.focusNode, e.focusOffset);
        n && r && pr(t, function() {
          wi(t.doc, jr(n, r), _l), (n.bad || r.bad) && (t.curOp.selectionChanged = !0)
        })
      }
    }
  }, os.prototype.pollContent = function() {
    null != this.readDOMTimeout && (clearTimeout(this.readDOMTimeout), this.readDOMTimeout = null);
    var e = this.cm,
      t = e.display,
      n = e.doc.sel.primary(),
      r = n.from(),
      i = n.to();
    if (0 == r.ch && r.line > e.firstLine() && (r = W(r.line - 1, M(e.doc, r.line - 1).length)), i.ch == M(e.doc, i.line).text.length && i.line < e.lastLine() && (i = W(i.line + 1, 0)), r.line < t.viewFrom || i.line > t.viewTo - 1) return !1;
    var o, l, a;
    r.line == t.viewFrom || 0 == (o = Mn(e, r.line)) ? (l = P(t.view[0].line), a = t.view[0].node) : (l = P(t.view[o].line), a = t.view[o - 1].node.nextSibling);
    var s, c, u = Mn(e, i.line);
    if (u == t.view.length - 1 ? (s = t.viewTo - 1, c = t.lineDiv.lastChild) : (s = P(t.view[u + 1].line) - 1, c = t.view[u + 1].node.previousSibling), !a) return !1;
    for (var f = e.doc.splitLines(ul(e, a, c, l, s)), d = O(e.doc, W(l, 0), W(s, M(e.doc, s).text.length)); f.length > 1 && d.length > 1;)
      if (g(f) == g(d)) f.pop(), d.pop(), s--;
      else {
        if (f[0] != d[0]) break;
        f.shift(), d.shift(), l++
      } for (var h = 0, p = 0, m = f[0], v = d[0], y = Math.min(m.length, v.length); h < y && m.charCodeAt(h) == v.charCodeAt(h);) ++h;
    for (var b = g(f), x = g(d), w = Math.min(b.length - (1 == f.length ? h : 0), x.length - (1 == d.length ? h : 0)); p < w && b.charCodeAt(b.length - p - 1) == x.charCodeAt(x.length - p - 1);) ++p;
    if (1 == f.length && 1 == d.length && l == r.line)
      for (; h && h > r.ch && b.charCodeAt(b.length - p - 1) == x.charCodeAt(x.length - p - 1);) h--, p++;
    f[f.length - 1] = b.slice(0, b.length - p).replace(/^\u200b+/, ""),
      f[0] = f[0].slice(h).replace(/\u200b+$/, "");
    var C = W(l, h),
      k = W(s, d.length ? g(d).length - p : 0);
    return f.length > 1 || f[0] || E(C, k) ? (Ii(e.doc, f, C, k, "+input"), !0) : void 0
  }, os.prototype.ensurePolled = function() {
    this.forceCompositionEnd()
  }, os.prototype.reset = function() {
    this.forceCompositionEnd()
  }, os.prototype.forceCompositionEnd = function() {
    this.composing && (clearTimeout(this.readDOMTimeout), this.composing = null, this.updateFromDOM(), this.div.blur(), this.div.focus())
  }, os.prototype.readFromDOMSoon = function() {
    var e = this;
    null == this.readDOMTimeout && (this.readDOMTimeout = setTimeout(function() {
      if (e.readDOMTimeout = null, e.composing) {
        if (!e.composing.done) return;
        e.composing = null
      }
      e.updateFromDOM()
    }, 80))
  }, os.prototype.updateFromDOM = function() {
    var e = this;
    !this.cm.isReadOnly() && this.pollContent() || pr(this.cm, function() {
      return yr(e.cm)
    })
  }, os.prototype.setUneditable = function(e) {
    e.contentEditable = "false"
  }, os.prototype.onKeyPress = function(e) {
    0 == e.charCode || this.composing || (e.preventDefault(), this.cm.isReadOnly() || gr(this.cm, Jo)(this.cm, String.fromCharCode(null == e.charCode ? e.keyCode : e.charCode), 0))
  }, os.prototype.readOnlyChanged = function(e) {
    this.div.contentEditable = String("nocursor" != e)
  }, os.prototype.onContextMenu = function() {}, os.prototype.resetPosition = function() {}, os.prototype.needsContentAttribute = !0;
  var ls = function(e) {
    this.cm = e, this.prevInput = "", this.pollingFast = !1, this.polling = new ql, this.hasSelection = !1, this.composing = null
  };
  ls.prototype.init = function(e) {
    function t(e) {
      if (!Oe(i, e)) {
        if (i.somethingSelected()) Qo({
          lineWise: !1,
          text: i.getSelections()
        });
        else {
          if (!i.options.lineWiseCopyCut) return;
          var t = nl(i);
          Qo({
            lineWise: !0,
            text: t.text
          }), "cut" == e.type ? i.setSelections(t.ranges, null, _l) : (r.prevInput = "", o.value = t.text.join("\n"), jl(o))
        }
        "cut" == e.type && (i.state.cutIncoming = !0)
      }
    }
    var n = this,
      r = this,
      i = this.cm;
    this.createField(e);
    var o = this.textarea;
    e.wrapper.insertBefore(this.wrapper, e.wrapper.firstChild), Al && (o.style.width = "0px"), ia(o, "input", function() {
      wl && Cl >= 9 && n.hasSelection && (n.hasSelection = null), r.poll()
    }), ia(o, "paste", function(e) {
      Oe(i, e) || el(e, i) || (i.state.pasteIncoming = !0, r.fastPoll())
    }), ia(o, "cut", t), ia(o, "copy", t), ia(e.scroller, "paste", function(t) {
      Et(e, t) || Oe(i, t) || (i.state.pasteIncoming = !0, r.focus())
    }), ia(e.lineSpace, "selectstart", function(t) {
      Et(e, t) || De(t)
    }), ia(o, "compositionstart", function() {
      var e = i.getCursor("from");
      r.composing && r.composing.range.clear(), r.composing = {
        start: e,
        range: i.markText(e, i.getCursor("to"), {
          className: "CodeMirror-composing"
        })
      }
    }), ia(o, "compositionend", function() {
      r.composing && (r.poll(), r.composing.range.clear(), r.composing = null)
    })
  }, ls.prototype.createField = function(e) {
    this.wrapper = il(), this.textarea = this.wrapper.firstChild
  }, ls.prototype.prepareSelection = function() {
    var e = this.cm,
      t = e.display,
      n = e.doc,
      r = Nn(e);
    if (e.options.moveInputWithCursor) {
      var i = un(e, n.sel.primary().head, "div"),
        o = t.wrapper.getBoundingClientRect(),
        l = t.lineDiv.getBoundingClientRect();
      r.teTop = Math.max(0, Math.min(t.wrapper.clientHeight - 10, i.top + l.top - o.top)), r.teLeft = Math.max(0, Math.min(t.wrapper.clientWidth - 10, i.left + l.left - o.left))
    }
    return r
  }, ls.prototype.showSelection = function(e) {
    var t = this.cm,
      r = t.display;
    n(r.cursorDiv, e.cursors), n(r.selectionDiv, e.selection), null != e.teTop && (this.wrapper.style.top = e.teTop + "px", this.wrapper.style.left = e.teLeft + "px")
  }, ls.prototype.reset = function(e) {
    if (!this.contextMenuPending && !this.composing) {
      var t = this.cm;
      if (t.somethingSelected()) {
        this.prevInput = "";
        var n = t.getSelection();
        this.textarea.value = n, t.state.focused && jl(this.textarea), wl && Cl >= 9 && (this.hasSelection = n)
      } else e || (this.prevInput = this.textarea.value = "", wl && Cl >= 9 && (this.hasSelection = null))
    }
  }, ls.prototype.getField = function() {
    return this.textarea
  }, ls.prototype.supportsTouch = function() {
    return !1
  }, ls.prototype.focus = function() {
    if ("nocursor" != this.cm.options.readOnly && (!Dl || l() != this.textarea)) try {
      this.textarea.focus()
    } catch (e) {}
  }, ls.prototype.blur = function() {
    this.textarea.blur()
  }, ls.prototype.resetPosition = function() {
    this.wrapper.style.top = this.wrapper.style.left = 0
  }, ls.prototype.receivedFocus = function() {
    this.slowPoll()
  }, ls.prototype.slowPoll = function() {
    var e = this;
    this.pollingFast || this.polling.set(this.cm.options.pollInterval, function() {
      e.poll(), e.cm.state.focused && e.slowPoll()
    })
  }, ls.prototype.fastPoll = function() {
    function e() {
      var r = n.poll();
      r || t ? (n.pollingFast = !1, n.slowPoll()) : (t = !0, n.polling.set(60, e))
    }
    var t = !1,
      n = this;
    n.pollingFast = !0, n.polling.set(20, e)
  }, ls.prototype.poll = function() {
    var e = this,
      t = this.cm,
      n = this.textarea,
      r = this.prevInput;
    if (this.contextMenuPending || !t.state.focused || aa(n) && !r && !this.composing || t.isReadOnly() || t.options.disableInput || t.state.keySeq) return !1;
    var i = n.value;
    if (i == r && !t.somethingSelected()) return !1;
    if (wl && Cl >= 9 && this.hasSelection === i || Hl && /[\uf700-\uf7ff]/.test(i)) return t.display.input.reset(), !1;
    if (t.doc.sel == t.display.selForContextMenu) {
      var o = i.charCodeAt(0);
      if (8203 != o || r || (r = "​"), 8666 == o) return this.reset(), this.cm.execCommand("undo")
    }
    for (var l = 0, a = Math.min(r.length, i.length); l < a && r.charCodeAt(l) == i.charCodeAt(l);) ++l;
    return pr(t, function() {
      Jo(t, i.slice(l), r.length - l, null, e.composing ? "*compose" : null), i.length > 1e3 || i.indexOf("\n") > -1 ? n.value = e.prevInput = "" : e.prevInput = i, e.composing && (e.composing.range.clear(), e.composing.range = t.markText(e.composing.start, t.getCursor("to"), {
        className: "CodeMirror-composing"
      }))
    }), !0
  }, ls.prototype.ensurePolled = function() {
    this.pollingFast && this.poll() && (this.pollingFast = !1)
  }, ls.prototype.onKeyPress = function() {
    wl && Cl >= 9 && (this.hasSelection = null), this.fastPoll()
  }, ls.prototype.onContextMenu = function(e) {
    function t() {
      if (null != l.selectionStart) {
        var e = i.somethingSelected(),
          t = "​" + (e ? l.value : "");
        l.value = "⇚", l.value = t, r.prevInput = e ? "" : "​", l.selectionStart = 1, l.selectionEnd = t.length, o.selForContextMenu = i.doc.sel
      }
    }

    function n() {
      if (r.contextMenuPending = !1, r.wrapper.style.cssText = f, l.style.cssText = u, wl && Cl < 9 && o.scrollbars.setScrollTop(o.scroller.scrollTop = s), null != l.selectionStart) {
        (!wl || wl && Cl < 9) && t();
        var e = 0,
          n = function() {
            o.selForContextMenu == i.doc.sel && 0 == l.selectionStart && l.selectionEnd > 0 && "​" == r.prevInput ? gr(i, Ni)(i) : e++ < 10 ? o.detectingSelectAll = setTimeout(n, 500) : (o.selForContextMenu = null, o.input.reset())
          };
        o.detectingSelectAll = setTimeout(n, 200)
      }
    }
    var r = this,
      i = r.cm,
      o = i.display,
      l = r.textarea,
      a = Tn(i, e),
      s = o.scroller.scrollTop;
    if (a && !Tl) {
      var c = i.options.resetSelectionOnContextMenu;
      c && i.doc.sel.contains(a) == -1 && gr(i, wi)(i.doc, jr(a), _l);
      var u = l.style.cssText,
        f = r.wrapper.style.cssText;
      r.wrapper.style.cssText = "position: absolute";
      var d = r.wrapper.getBoundingClientRect();
      l.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - d.top - 5) + "px; left: " + (e.clientX - d.left - 5) + "px;\n      z-index: 1000; background: " + (wl ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
      var h;
      if (kl && (h = window.scrollY), o.input.focus(), kl && window.scrollTo(null, h), o.input.reset(), i.somethingSelected() || (l.value = r.prevInput = " "), r.contextMenuPending = !0, o.selForContextMenu = i.doc.sel, clearTimeout(o.detectingSelectAll), wl && Cl >= 9 && t(), zl) {
        We(e);
        var p = function() {
          Te(window, "mouseup", p), setTimeout(n, 20)
        };
        ia(window, "mouseup", p)
      } else setTimeout(n, 50)
    }
  }, ls.prototype.readOnlyChanged = function(e) {
    e || this.reset(), this.textarea.disabled = "nocursor" == e
  }, ls.prototype.setUneditable = function() {}, ls.prototype.needsContentAttribute = !1, Ko(Xo), is(Xo);
  var as = "iter insert remove copy getEditor constructor".split(" ");
  for (var ss in Ra.prototype) Ra.prototype.hasOwnProperty(ss) && d(as, ss) < 0 && (Xo.prototype[ss] = function(e) {
    return function() {
      return e.apply(this.doc, arguments)
    }
  }(Ra.prototype[ss]));
  return Pe(Ra), Xo.inputStyles = {
    textarea: ls,
    contenteditable: os
  }, Xo.defineMode = function(e) {
    Xo.defaults.mode || "null" == e || (Xo.defaults.mode = e), je.apply(this, arguments)
  }, Xo.defineMIME = qe, Xo.defineMode("null", function() {
    return {
      token: function(e) {
        return e.skipToEnd()
      }
    }
  }), Xo.defineMIME("text/plain", "null"), Xo.defineExtension = function(e, t) {
    Xo.prototype[e] = t
  }, Xo.defineDocExtension = function(e, t) {
    Ra.prototype[e] = t
  }, Xo.fromTextArea = hl, pl(Xo), Xo.version = "5.38.0", Xo
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  var t = {
      autoSelfClosers: {
        area: !0,
        base: !0,
        br: !0,
        col: !0,
        command: !0,
        embed: !0,
        frame: !0,
        hr: !0,
        img: !0,
        input: !0,
        keygen: !0,
        link: !0,
        meta: !0,
        param: !0,
        source: !0,
        track: !0,
        wbr: !0,
        menuitem: !0
      },
      implicitlyClosed: {
        dd: !0,
        li: !0,
        optgroup: !0,
        option: !0,
        p: !0,
        rp: !0,
        rt: !0,
        tbody: !0,
        td: !0,
        tfoot: !0,
        th: !0,
        tr: !0
      },
      contextGrabbers: {
        dd: {
          dd: !0,
          dt: !0
        },
        dt: {
          dd: !0,
          dt: !0
        },
        li: {
          li: !0
        },
        option: {
          option: !0,
          optgroup: !0
        },
        optgroup: {
          optgroup: !0
        },
        p: {
          address: !0,
          article: !0,
          aside: !0,
          blockquote: !0,
          dir: !0,
          div: !0,
          dl: !0,
          fieldset: !0,
          footer: !0,
          form: !0,
          h1: !0,
          h2: !0,
          h3: !0,
          h4: !0,
          h5: !0,
          h6: !0,
          header: !0,
          hgroup: !0,
          hr: !0,
          menu: !0,
          nav: !0,
          ol: !0,
          p: !0,
          pre: !0,
          section: !0,
          table: !0,
          ul: !0
        },
        rp: {
          rp: !0,
          rt: !0
        },
        rt: {
          rp: !0,
          rt: !0
        },
        tbody: {
          tbody: !0,
          tfoot: !0
        },
        td: {
          td: !0,
          th: !0
        },
        tfoot: {
          tbody: !0
        },
        th: {
          td: !0,
          th: !0
        },
        thead: {
          tbody: !0,
          tfoot: !0
        },
        tr: {
          tr: !0
        }
      },
      doNotIndent: {
        pre: !0
      },
      allowUnquoted: !0,
      allowMissing: !0,
      caseFold: !0
    },
    n = {
      autoSelfClosers: {},
      implicitlyClosed: {},
      contextGrabbers: {},
      doNotIndent: {},
      allowUnquoted: !1,
      allowMissing: !1,
      allowMissingTagName: !1,
      caseFold: !1
    };
  e.defineMode("xml", function(r, i) {
    function o(e, t) {
      function n(n) {
        return t.tokenize = n, n(e, t)
      }
      var r = e.next();
      if ("<" == r) return e.eat("!") ? e.eat("[") ? e.match("CDATA[") ? n(s("atom", "]]>")) : null : e.match("--") ? n(s("comment", "-->")) : e.match("DOCTYPE", !0, !0) ? (e.eatWhile(/[\w\._\-]/), n(c(1))) : null : e.eat("?") ? (e.eatWhile(/[\w\._\-]/), t.tokenize = s("meta", "?>"), "meta") : (T = e.eat("/") ? "closeTag" : "openTag", t.tokenize = l, "tag bracket");
      if ("&" == r) {
        var i;
        return i = e.eat("#") ? e.eat("x") ? e.eatWhile(/[a-fA-F\d]/) && e.eat(";") : e.eatWhile(/[\d]/) && e.eat(";") : e.eatWhile(/[\w\.\-:]/) && e.eat(";"), i ? "atom" : "error"
      }
      return e.eatWhile(/[^&<]/), null
    }

    function l(e, t) {
      var n = e.next();
      if (">" == n || "/" == n && e.eat(">")) return t.tokenize = o, T = ">" == n ? "endTag" : "selfcloseTag", "tag bracket";
      if ("=" == n) return T = "equals", null;
      if ("<" == n) {
        t.tokenize = o, t.state = h, t.tagName = t.tagStart = null;
        var r = t.tokenize(e, t);
        return r ? r + " tag error" : "tag error"
      }
      return /[\'\"]/.test(n) ? (t.tokenize = a(n), t.stringStartCol = e.column(), t.tokenize(e, t)) : (e.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/), "word")
    }

    function a(e) {
      var t = function(t, n) {
        for (; !t.eol();)
          if (t.next() == e) {
            n.tokenize = l;
            break
          } return "string"
      };
      return t.isInAttribute = !0, t
    }

    function s(e, t) {
      return function(n, r) {
        for (; !n.eol();) {
          if (n.match(t)) {
            r.tokenize = o;
            break
          }
          n.next()
        }
        return e
      }
    }

    function c(e) {
      return function(t, n) {
        for (var r; null != (r = t.next());) {
          if ("<" == r) return n.tokenize = c(e + 1), n.tokenize(t, n);
          if (">" == r) {
            if (1 == e) {
              n.tokenize = o;
              break
            }
            return n.tokenize = c(e - 1), n.tokenize(t, n)
          }
        }
        return "meta"
      }
    }

    function u(e, t, n) {
      this.prev = e.context, this.tagName = t, this.indent = e.indented, this.startOfLine = n, (k.doNotIndent.hasOwnProperty(t) || e.context && e.context.noIndent) && (this.noIndent = !0)
    }

    function f(e) {
      e.context && (e.context = e.context.prev)
    }

    function d(e, t) {
      for (var n;;) {
        if (!e.context) return;
        if (n = e.context.tagName, !k.contextGrabbers.hasOwnProperty(n) || !k.contextGrabbers[n].hasOwnProperty(t)) return;
        f(e)
      }
    }

    function h(e, t, n) {
      return "openTag" == e ? (n.tagStart = t.column(), p) : "closeTag" == e ? g : h
    }

    function p(e, t, n) {
      return "word" == e ? (n.tagName = t.current(), M = "tag", y) : k.allowMissingTagName && "endTag" == e ? (M = "tag bracket", y(e, t, n)) : (M = "error", p)
    }

    function g(e, t, n) {
      if ("word" == e) {
        var r = t.current();
        return n.context && n.context.tagName != r && k.implicitlyClosed.hasOwnProperty(n.context.tagName) && f(n), n.context && n.context.tagName == r || k.matchClosing === !1 ? (M = "tag", m) : (M = "tag error", v)
      }
      return k.allowMissingTagName && "endTag" == e ? (M = "tag bracket", m(e, t, n)) : (M = "error", v)
    }

    function m(e, t, n) {
      return "endTag" != e ? (M = "error", m) : (f(n), h)
    }

    function v(e, t, n) {
      return M = "error", m(e, t, n)
    }

    function y(e, t, n) {
      if ("word" == e) return M = "attribute", b;
      if ("endTag" == e || "selfcloseTag" == e) {
        var r = n.tagName,
          i = n.tagStart;
        return n.tagName = n.tagStart = null, "selfcloseTag" == e || k.autoSelfClosers.hasOwnProperty(r) ? d(n, r) : (d(n, r), n.context = new u(n, r, i == n.indented)), h
      }
      return M = "error", y
    }

    function b(e, t, n) {
      return "equals" == e ? x : (k.allowMissing || (M = "error"), y(e, t, n))
    }

    function x(e, t, n) {
      return "string" == e ? w : "word" == e && k.allowUnquoted ? (M = "string", y) : (M = "error", y(e, t, n))
    }

    function w(e, t, n) {
      return "string" == e ? w : y(e, t, n)
    }
    var C = r.indentUnit,
      k = {},
      S = i.htmlMode ? t : n;
    for (var L in S) k[L] = S[L];
    for (var L in i) k[L] = i[L];
    var T, M;
    return o.isInText = !0, {
      startState: function(e) {
        var t = {
          tokenize: o,
          state: h,
          indented: e || 0,
          tagName: null,
          tagStart: null,
          context: null
        };
        return null != e && (t.baseIndent = e), t
      },
      token: function(e, t) {
        if (!t.tagName && e.sol() && (t.indented = e.indentation()), e.eatSpace()) return null;
        T = null;
        var n = t.tokenize(e, t);
        return (n || T) && "comment" != n && (M = null, t.state = t.state(T || n, e, t), M && (n = "error" == M ? n + " error" : M)), n
      },
      indent: function(t, n, r) {
        var i = t.context;
        if (t.tokenize.isInAttribute) return t.tagStart == t.indented ? t.stringStartCol + 1 : t.indented + C;
        if (i && i.noIndent) return e.Pass;
        if (t.tokenize != l && t.tokenize != o) return r ? r.match(/^(\s*)/)[0].length : 0;
        if (t.tagName) return k.multilineTagIndentPastTag !== !1 ? t.tagStart + t.tagName.length + 2 : t.tagStart + C * (k.multilineTagIndentFactor || 1);
        if (k.alignCDATA && /<!\[CDATA\[/.test(n)) return 0;
        var a = n && /^<(\/)?([\w_:\.-]*)/.exec(n);
        if (a && a[1])
          for (; i;) {
            if (i.tagName == a[2]) {
              i = i.prev;
              break
            }
            if (!k.implicitlyClosed.hasOwnProperty(i.tagName)) break;
            i = i.prev
          } else if (a)
            for (; i;) {
              var s = k.contextGrabbers[i.tagName];
              if (!s || !s.hasOwnProperty(a[2])) break;
              i = i.prev
            }
        for (; i && i.prev && !i.startOfLine;) i = i.prev;
        return i ? i.indent + C : t.baseIndent || 0
      },
      electricInput: /<\/[\s\w:]+>$/,
      blockCommentStart: "<!--",
      blockCommentEnd: "-->",
      configuration: k.htmlMode ? "html" : "xml",
      helperType: k.htmlMode ? "html" : "xml",
      skipAttribute: function(e) {
        e.state == x && (e.state = y)
      }
    }
  }), e.defineMIME("text/xml", "xml"), e.defineMIME("application/xml", "xml"), e.mimeModes.hasOwnProperty("text/html") || e.defineMIME("text/html", {
    name: "xml",
    htmlMode: !0
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("../xml/xml"), require("../javascript/javascript"), require("../css/css")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../xml/xml", "../javascript/javascript", "../css/css"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t, n) {
    var r = e.current(),
      i = r.search(t);
    return i > -1 ? e.backUp(r.length - i) : r.match(/<\/?$/) && (e.backUp(r.length), e.match(t, !1) || e.match(r)), n
  }

  function n(e) {
    var t = s[e];
    return t ? t : s[e] = new RegExp("\\s+" + e + "\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*")
  }

  function r(e, t) {
    var r = e.match(n(t));
    return r ? /^\s*(.*?)\s*$/.exec(r[2])[1] : ""
  }

  function i(e, t) {
    return new RegExp((t ? "^" : "") + "</s*" + e + "s*>", "i")
  }

  function o(e, t) {
    for (var n in e)
      for (var r = t[n] || (t[n] = []), i = e[n], o = i.length - 1; o >= 0; o--) r.unshift(i[o])
  }

  function l(e, t) {
    for (var n = 0; n < e.length; n++) {
      var i = e[n];
      if (!i[0] || i[1].test(r(t, i[0]))) return i[2]
    }
  }
  var a = {
      script: [
        ["lang", /(javascript|babel)/i, "javascript"],
        ["type", /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i, "javascript"],
        ["type", /./, "text/plain"],
        [null, null, "javascript"]
      ],
      style: [
        ["lang", /^css$/i, "css"],
        ["type", /^(text\/)?(x-)?(stylesheet|css)$/i, "css"],
        ["type", /./, "text/plain"],
        [null, null, "css"]
      ]
    },
    s = {};
  e.defineMode("htmlmixed", function(n, r) {
    function s(r, o) {
      var a, f = c.token(r, o.htmlState),
        d = /\btag\b/.test(f);
      if (d && !/[<>\s\/]/.test(r.current()) && (a = o.htmlState.tagName && o.htmlState.tagName.toLowerCase()) && u.hasOwnProperty(a)) o.inTag = a + " ";
      else if (o.inTag && d && />$/.test(r.current())) {
        var h = /^([\S]+) (.*)/.exec(o.inTag);
        o.inTag = null;
        var p = ">" == r.current() && l(u[h[1]], h[2]),
          g = e.getMode(n, p),
          m = i(h[1], !0),
          v = i(h[1], !1);
        o.token = function(e, n) {
          return e.match(m, !1) ? (n.token = s, n.localState = n.localMode = null, null) : t(e, v, n.localMode.token(e, n.localState))
        }, o.localMode = g, o.localState = e.startState(g, c.indent(o.htmlState, ""))
      } else o.inTag && (o.inTag += r.current(), r.eol() && (o.inTag += " "));
      return f
    }
    var c = e.getMode(n, {
        name: "xml",
        htmlMode: !0,
        multilineTagIndentFactor: r.multilineTagIndentFactor,
        multilineTagIndentPastTag: r.multilineTagIndentPastTag
      }),
      u = {},
      f = r && r.tags,
      d = r && r.scriptTypes;
    if (o(a, u), f && o(f, u), d)
      for (var h = d.length - 1; h >= 0; h--) u.script.unshift(["type", d[h].matches, d[h].mode]);
    return {
      startState: function() {
        var t = e.startState(c);
        return {
          token: s,
          inTag: null,
          localMode: null,
          localState: null,
          htmlState: t
        }
      },
      copyState: function(t) {
        var n;
        return t.localState && (n = e.copyState(t.localMode, t.localState)), {
          token: t.token,
          inTag: t.inTag,
          localMode: t.localMode,
          localState: n,
          htmlState: e.copyState(c, t.htmlState)
        }
      },
      token: function(e, t) {
        return t.token(e, t)
      },
      indent: function(t, n, r) {
        return !t.localMode || /^\s*<\//.test(n) ? c.indent(t.htmlState, n) : t.localMode.indent ? t.localMode.indent(t.localState, n, r) : e.Pass
      },
      innerMode: function(e) {
        return {
          state: e.localState || e.htmlState,
          mode: e.localMode || c
        }
      }
    }
  }, "xml", "javascript", "css"), e.defineMIME("text/html", "htmlmixed")
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t) {
    if (!window.JSHINT) return window.console && window.console.error("Error: window.JSHINT not defined, CodeMirror JavaScript linting cannot run."), [];
    t.indent || (t.indent = 1), JSHINT(e, t, t.globals);
    var r = JSHINT.data().errors,
      i = [];
    return r && n(r, i), i
  }

  function n(t, n) {
    for (var r = 0; r < t.length; r++) {
      var i = t[r];
      if (i) {
        if (i.line <= 0) {
          window.console && window.console.warn("Cannot display JSHint error (invalid line " + i.line + ")", i);
          continue
        }
        var o = i.character - 1,
          l = o + 1;
        if (i.evidence) {
          var a = i.evidence.substring(o).search(/.\b/);
          a > -1 && (l += a)
        }
        var s = {
          message: i.reason,
          severity: i.code && i.code.startsWith("W") ? "warning" : "error",
          from: e.Pos(i.line - 1, o),
          to: e.Pos(i.line - 1, l)
        };
        n.push(s)
      }
    }
  }
  e.registerHelper("lint", "javascript", t)
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(t, n) {
    function r(t) {
      return i.parentNode ? (i.style.top = Math.max(0, t.clientY - i.offsetHeight - 5) + "px", void(i.style.left = t.clientX + 5 + "px")) : e.off(document, "mousemove", r)
    }
    var i = document.createElement("div");
    return i.className = "CodeMirror-lint-tooltip", i.appendChild(n.cloneNode(!0)), document.body.appendChild(i), e.on(document, "mousemove", r), r(t), null != i.style.opacity && (i.style.opacity = 1), i
  }

  function n(e) {
    e.parentNode && e.parentNode.removeChild(e)
  }

  function r(e) {
    e.parentNode && (null == e.style.opacity && n(e), e.style.opacity = 0, setTimeout(function() {
      n(e)
    }, 600))
  }

  function i(n, i, o) {
    function l() {
      e.off(o, "mouseout", l), a && (r(a), a = null)
    }
    var a = t(n, i),
      s = setInterval(function() {
        if (a)
          for (var e = o;; e = e.parentNode) {
            if (e && 11 == e.nodeType && (e = e.host), e == document.body) return;
            if (!e) {
              l();
              break
            }
          }
        if (!a) return clearInterval(s)
      }, 400);
    e.on(o, "mouseout", l)
  }

  function o(e, t, n) {
    this.marked = [], this.options = t, this.timeout = null, this.hasGutter = n, this.onMouseOver = function(t) {
      v(e, t)
    }, this.waitingFor = 0
  }

  function l(e, t) {
    return t instanceof Function ? {
      getAnnotations: t
    } : (t && t !== !0 || (t = {}), t)
  }

  function a(e) {
    var t = e.state.lint;
    t.hasGutter && e.clearGutter(y);
    for (var n = 0; n < t.marked.length; ++n) t.marked[n].clear();
    t.marked.length = 0
  }

  function s(t, n, r, o) {
    var l = document.createElement("div"),
      a = l;
    return l.className = "CodeMirror-lint-marker-" + n, r && (a = l.appendChild(document.createElement("div")), a.className = "CodeMirror-lint-marker-multiple"), 0 != o && e.on(a, "mouseover", function(e) {
      i(e, t, a)
    }), l
  }

  function c(e, t) {
    return "error" == e ? e : t
  }

  function u(e) {
    for (var t = [], n = 0; n < e.length; ++n) {
      var r = e[n],
        i = r.from.line;
      (t[i] || (t[i] = [])).push(r)
    }
    return t
  }

  function f(e) {
    var t = e.severity;
    t || (t = "error");
    var n = document.createElement("div");
    return n.className = "CodeMirror-lint-message-" + t, "undefined" != typeof e.messageHTML ? n.innerHTML = e.messageHTML : n.appendChild(document.createTextNode(e.message)), n
  }

  function d(t, n, r) {
    function i() {
      l = -1, t.off("change", i)
    }
    var o = t.state.lint,
      l = ++o.waitingFor;
    t.on("change", i), n(t.getValue(), function(n, r) {
      t.off("change", i), o.waitingFor == l && (r && n instanceof e && (n = r), t.operation(function() {
        p(t, n)
      }))
    }, r, t)
  }

  function h(t) {
    var n = t.state.lint,
      r = n.options,
      i = r.options || r,
      o = r.getAnnotations || t.getHelper(e.Pos(0, 0), "lint");
    if (o)
      if (r.async || o.async) d(t, o, i);
      else {
        var l = o(t.getValue(), i, t);
        if (!l) return;
        l.then ? l.then(function(e) {
          t.operation(function() {
            p(t, e)
          })
        }) : t.operation(function() {
          p(t, l)
        })
      }
  }

  function p(e, t) {
    a(e);
    for (var n = e.state.lint, r = n.options, i = u(t), o = 0; o < i.length; ++o) {
      var l = i[o];
      if (l) {
        for (var d = null, h = n.hasGutter && document.createDocumentFragment(), p = 0; p < l.length; ++p) {
          var g = l[p],
            m = g.severity;
          m || (m = "error"), d = c(d, m), r.formatAnnotation && (g = r.formatAnnotation(g)), n.hasGutter && h.appendChild(f(g)), g.to && n.marked.push(e.markText(g.from, g.to, {
            className: "CodeMirror-lint-mark-" + m,
            __annotation: g
          }))
        }
        n.hasGutter && e.setGutterMarker(o, y, s(h, d, l.length > 1, n.options.tooltips))
      }
    }
    r.onUpdateLinting && r.onUpdateLinting(t, i, e)
  }

  function g(e) {
    var t = e.state.lint;
    t && (clearTimeout(t.timeout), t.timeout = setTimeout(function() {
      h(e)
    }, t.options.delay || 500))
  }

  function m(e, t) {
    for (var n = t.target || t.srcElement, r = document.createDocumentFragment(), o = 0; o < e.length; o++) {
      var l = e[o];
      r.appendChild(f(l))
    }
    i(t, r, n)
  }

  function v(e, t) {
    var n = t.target || t.srcElement;
    if (/\bCodeMirror-lint-mark-/.test(n.className)) {
      for (var r = n.getBoundingClientRect(), i = (r.left + r.right) / 2, o = (r.top + r.bottom) / 2, l = e.findMarksAt(e.coordsChar({
          left: i,
          top: o
        }, "client")), a = [], s = 0; s < l.length; ++s) {
        var c = l[s].__annotation;
        c && a.push(c)
      }
      a.length && m(a, t)
    }
  }
  var y = "CodeMirror-lint-markers";
  e.defineOption("lint", !1, function(t, n, r) {
    if (r && r != e.Init && (a(t), t.state.lint.options.lintOnChange !== !1 && t.off("change", g), e.off(t.getWrapperElement(), "mouseover", t.state.lint.onMouseOver), clearTimeout(t.state.lint.timeout), delete t.state.lint), n) {
      for (var i = t.getOption("gutters"), s = !1, c = 0; c < i.length; ++c) i[c] == y && (s = !0);
      var u = t.state.lint = new o(t, l(t, n), s);
      u.options.lintOnChange !== !1 && t.on("change", g), 0 != u.options.tooltips && "gutter" != u.options.tooltips && e.on(t.getWrapperElement(), "mouseover", u.onMouseOver), h(t)
    }
  }), e.defineExtension("performLint", function() {
    this.state.lint && h(this)
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  function t(e, t) {
    for (var n = 0, r = e.length; n < r; ++n) t(e[n])
  }

  function n(e, t) {
    if (!Array.prototype.indexOf) {
      for (var n = e.length; n--;)
        if (e[n] === t) return !0;
      return !1
    }
    return e.indexOf(t) != -1
  }

  function r(t, n, r, i) {
    var o = t.getCursor(),
      l = r(t, o);
    if (!/\b(?:string|comment)\b/.test(l.type)) {
      var a = e.innerMode(t.getMode(), l.state);
      if ("json" !== a.mode.helperType) {
        l.state = a.state, /^[\w$_]*$/.test(l.string) ? l.end > o.ch && (l.end = o.ch, l.string = l.string.slice(0, o.ch - l.start)) : l = {
          start: o.ch,
          end: o.ch,
          string: "",
          state: l.state,
          type: "." == l.string ? "property" : null
        };
        for (var u = l;
          "property" == u.type;) {
          if (u = r(t, c(o.line, u.start)), "." != u.string) return;
          if (u = r(t, c(o.line, u.start)), !f) var f = [];
          f.push(u)
        }
        return {
          list: s(l, f, n, i),
          from: c(o.line, l.start),
          to: c(o.line, l.end)
        }
      }
    }
  }

  function i(e, t) {
    return r(e, h, function(e, t) {
      return e.getTokenAt(t)
    }, t)
  }

  function o(e, t) {
    var n = e.getTokenAt(t);
    return t.ch == n.start + 1 && "." == n.string.charAt(0) ? (n.end = n.start, n.string = ".", n.type = "property") : /^\.[\w$_]*$/.test(n.string) && (n.type = "property", n.start++, n.string = n.string.replace(/\./, "")), n
  }

  function l(e, t) {
    return r(e, p, o, t)
  }

  function a(e, t) {
    if (Object.getOwnPropertyNames && Object.getPrototypeOf)
      for (var n = e; n; n = Object.getPrototypeOf(n)) Object.getOwnPropertyNames(n).forEach(t);
    else
      for (var r in e) t(r)
  }

  function s(e, r, i, o) {
    function l(e) {
      0 != e.lastIndexOf(h, 0) || n(c, e) || c.push(e)
    }

    function s(e) {
      "string" == typeof e ? t(u, l) : e instanceof Array ? t(f, l) : e instanceof Function && t(d, l), a(e, l)
    }
    var c = [],
      h = e.string,
      p = o && o.globalScope || window;
    if (r && r.length) {
      var g, m = r.pop();
      for (m.type && 0 === m.type.indexOf("variable") ? (o && o.additionalContext && (g = o.additionalContext[m.string]), o && o.useGlobalScope === !1 || (g = g || p[m.string])) : "string" == m.type ? g = "" : "atom" == m.type ? g = 1 : "function" == m.type && (null == p.jQuery || "$" != m.string && "jQuery" != m.string || "function" != typeof p.jQuery ? null != p._ && "_" == m.string && "function" == typeof p._ && (g = p._()) : g = p.jQuery()); null != g && r.length;) g = g[r.pop().string];
      null != g && s(g)
    } else {
      for (var v = e.state.localVars; v; v = v.next) l(v.name);
      for (var v = e.state.globalVars; v; v = v.next) l(v.name);
      o && o.useGlobalScope === !1 || s(p), t(i, l)
    }
    return c
  }
  var c = e.Pos;
  e.registerHelper("hint", "javascript", i), e.registerHelper("hint", "coffeescript", l);
  var u = "charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight toUpperCase toLowerCase split concat match replace search".split(" "),
    f = "length concat join splice push pop shift unshift slice reverse sort indexOf lastIndexOf every some filter forEach map reduce reduceRight ".split(" "),
    d = "prototype apply call bind".split(" "),
    h = "break case catch class const continue debugger default delete do else export extends false finally for function if in import instanceof new null return super switch this throw true try typeof var void while with yield".split(" "),
    p = "and break catch class continue delete do else extends false finally for if in instanceof isnt new no not null of off on or return switch then throw true try typeof until void while with yes".split(" ")
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  function t(t, n, r) {
    var i, o = t.getWrapperElement();
    return i = o.appendChild(document.createElement("div")), r ? i.className = "CodeMirror-dialog CodeMirror-dialog-bottom" : i.className = "CodeMirror-dialog CodeMirror-dialog-top", "string" == typeof n ? i.innerHTML = n : i.appendChild(n), e.addClass(o, "dialog-opened"), i
  }

  function n(e, t) {
    e.state.currentNotificationClose && e.state.currentNotificationClose(), e.state.currentNotificationClose = t
  }
  e.defineExtension("openDialog", function(r, i, o) {
    function l(t) {
      if ("string" == typeof t) f.value = t;
      else {
        if (c) return;
        c = !0, e.rmClass(s.parentNode, "dialog-opened"), s.parentNode.removeChild(s), u.focus(), o.onClose && o.onClose(s)
      }
    }
    o || (o = {}), n(this, null);
    var a, s = t(this, r, o.bottom),
      c = !1,
      u = this,
      f = s.getElementsByTagName("input")[0];
    return f ? (f.focus(), o.value && (f.value = o.value, o.selectValueOnOpen !== !1 && f.select()), o.onInput && e.on(f, "input", function(e) {
      o.onInput(e, f.value, l)
    }), o.onKeyUp && e.on(f, "keyup", function(e) {
      o.onKeyUp(e, f.value, l)
    }), e.on(f, "keydown", function(t) {
      o && o.onKeyDown && o.onKeyDown(t, f.value, l) || ((27 == t.keyCode || o.closeOnEnter !== !1 && 13 == t.keyCode) && (f.blur(), e.e_stop(t), l()), 13 == t.keyCode && i(f.value, t))
    }), o.closeOnBlur !== !1 && e.on(f, "blur", l)) : (a = s.getElementsByTagName("button")[0]) && (e.on(a, "click", function() {
      l(), u.focus()
    }), o.closeOnBlur !== !1 && e.on(a, "blur", l), a.focus()), l
  }), e.defineExtension("openConfirm", function(r, i, o) {
    function l() {
      c || (c = !0, e.rmClass(a.parentNode, "dialog-opened"), a.parentNode.removeChild(a), u.focus())
    }
    n(this, null);
    var a = t(this, r, o && o.bottom),
      s = a.getElementsByTagName("button"),
      c = !1,
      u = this,
      f = 1;
    s[0].focus();
    for (var d = 0; d < s.length; ++d) {
      var h = s[d];
      ! function(t) {
        e.on(h, "click", function(n) {
          e.e_preventDefault(n), l(), t && t(u)
        })
      }(i[d]), e.on(h, "blur", function() {
        --f, setTimeout(function() {
          f <= 0 && l()
        }, 200)
      }), e.on(h, "focus", function() {
        ++f
      })
    }
  }), e.defineExtension("openNotification", function(r, i) {
    function o() {
      s || (s = !0, clearTimeout(l), e.rmClass(a.parentNode, "dialog-opened"), a.parentNode.removeChild(a))
    }
    n(this, o);
    var l, a = t(this, r, i && i.bottom),
      s = !1,
      c = i && "undefined" != typeof i.duration ? i.duration : 5e3;
    return e.on(a, "click", function(t) {
      e.e_preventDefault(t), o()
    }), c && (l = setTimeout(o, c)), o
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(t, i, o, l) {
    function a(e) {
      var n = s(t, i);
      if (!n || n.to.line - n.from.line < c) return null;
      for (var r = t.findMarksAt(n.from), o = 0; o < r.length; ++o)
        if (r[o].__isFold && "fold" !== l) {
          if (!e) return null;
          n.cleared = !0, r[o].clear()
        } return n
    }
    if (o && o.call) {
      var s = o;
      o = null
    } else var s = r(t, o, "rangeFinder");
    "number" == typeof i && (i = e.Pos(i, 0));
    var c = r(t, o, "minFoldSize"),
      u = a(!0);
    if (r(t, o, "scanUp"))
      for (; !u && i.line > t.firstLine();) i = e.Pos(i.line - 1, 0), u = a(!1);
    if (u && !u.cleared && "unfold" !== l) {
      var f = n(t, o);
      e.on(f, "mousedown", function(t) {
        d.clear(), e.e_preventDefault(t)
      });
      var d = t.markText(u.from, u.to, {
        replacedWith: f,
        clearOnEnter: r(t, o, "clearOnEnter"),
        __isFold: !0
      });
      d.on("clear", function(n, r) {
        e.signal(t, "unfold", t, n, r)
      }), e.signal(t, "fold", t, u.from, u.to)
    }
  }

  function n(e, t) {
    var n = r(e, t, "widget");
    if ("string" == typeof n) {
      var i = document.createTextNode(n);
      n = document.createElement("span"), n.appendChild(i), n.className = "CodeMirror-foldmarker"
    } else n && (n = n.cloneNode(!0));
    return n
  }

  function r(e, t, n) {
    if (t && void 0 !== t[n]) return t[n];
    var r = e.options.foldOptions;
    return r && void 0 !== r[n] ? r[n] : i[n]
  }
  e.newFoldFunction = function(e, n) {
    return function(r, i) {
      t(r, i, {
        rangeFinder: e,
        widget: n
      })
    }
  }, e.defineExtension("foldCode", function(e, n, r) {
    t(this, e, n, r)
  }), e.defineExtension("isFolded", function(e) {
    for (var t = this.findMarksAt(e), n = 0; n < t.length; ++n)
      if (t[n].__isFold) return !0
  }), e.commands.toggleFold = function(e) {
    e.foldCode(e.getCursor())
  }, e.commands.fold = function(e) {
    e.foldCode(e.getCursor(), null, "fold")
  }, e.commands.unfold = function(e) {
    e.foldCode(e.getCursor(), null, "unfold")
  }, e.commands.foldAll = function(t) {
    t.operation(function() {
      for (var n = t.firstLine(), r = t.lastLine(); n <= r; n++) t.foldCode(e.Pos(n, 0), null, "fold")
    })
  }, e.commands.unfoldAll = function(t) {
    t.operation(function() {
      for (var n = t.firstLine(), r = t.lastLine(); n <= r; n++) t.foldCode(e.Pos(n, 0), null, "unfold")
    })
  }, e.registerHelper("fold", "combine", function() {
    var e = Array.prototype.slice.call(arguments, 0);
    return function(t, n) {
      for (var r = 0; r < e.length; ++r) {
        var i = e[r](t, n);
        if (i) return i
      }
    }
  }), e.registerHelper("fold", "auto", function(e, t) {
    for (var n = e.getHelpers(t, "fold"), r = 0; r < n.length; r++) {
      var i = n[r](e, t);
      if (i) return i
    }
  });
  var i = {
    rangeFinder: e.fold.auto,
    widget: "↔",
    minFoldSize: 0,
    scanUp: !1,
    clearOnEnter: !0
  };
  e.defineOption("foldOptions", null), e.defineExtension("foldOption", function(e, t) {
    return r(this, e, t)
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.registerHelper("fold", "brace", function(t, n) {
    function r(r) {
      for (var a = n.ch, s = 0;;) {
        var c = a <= 0 ? -1 : l.lastIndexOf(r, a - 1);
        if (c != -1) {
          if (1 == s && c < n.ch) break;
          if (i = t.getTokenTypeAt(e.Pos(o, c + 1)), !/^(comment|string)/.test(i)) return c + 1;
          a = c - 1
        } else {
          if (1 == s) break;
          s = 1, a = l.length
        }
      }
    }
    var i, o = n.line,
      l = t.getLine(o),
      a = "{",
      s = "}",
      c = r("{");
    if (null == c && (a = "[", s = "]", c = r("[")), null != c) {
      var u, f, d = 1,
        h = t.lastLine();
      e: for (var p = o; p <= h; ++p)
        for (var g = t.getLine(p), m = p == o ? c : 0;;) {
          var v = g.indexOf(a, m),
            y = g.indexOf(s, m);
          if (v < 0 && (v = g.length), y < 0 && (y = g.length), m = Math.min(v, y), m == g.length) break;
          if (t.getTokenTypeAt(e.Pos(p, m + 1)) == i)
            if (m == v) ++d;
            else if (!--d) {
            u = p, f = m;
            break e
          }++m
        }
      if (null != u && (o != u || f != c)) return {
        from: e.Pos(o, c),
        to: e.Pos(u, f)
      }
    }
  }), e.registerHelper("fold", "import", function(t, n) {
    function r(n) {
      if (n < t.firstLine() || n > t.lastLine()) return null;
      var r = t.getTokenAt(e.Pos(n, 1));
      if (/\S/.test(r.string) || (r = t.getTokenAt(e.Pos(n, r.end + 1))), "keyword" != r.type || "import" != r.string) return null;
      for (var i = n, o = Math.min(t.lastLine(), n + 10); i <= o; ++i) {
        var l = t.getLine(i),
          a = l.indexOf(";");
        if (a != -1) return {
          startCh: r.end,
          end: e.Pos(i, a)
        }
      }
    }
    var i, o = n.line,
      l = r(o);
    if (!l || r(o - 1) || (i = r(o - 2)) && i.end.line == o - 1) return null;
    for (var a = l.end;;) {
      var s = r(a.line + 1);
      if (null == s) break;
      a = s.end
    }
    return {
      from: t.clipPos(e.Pos(o, l.startCh + 1)),
      to: a
    }
  }), e.registerHelper("fold", "include", function(t, n) {
    function r(n) {
      if (n < t.firstLine() || n > t.lastLine()) return null;
      var r = t.getTokenAt(e.Pos(n, 1));
      return /\S/.test(r.string) || (r = t.getTokenAt(e.Pos(n, r.end + 1))), "meta" == r.type && "#include" == r.string.slice(0, 8) ? r.start + 8 : void 0
    }
    var i = n.line,
      o = r(i);
    if (null == o || null != r(i - 1)) return null;
    for (var l = i;;) {
      var a = r(l + 1);
      if (null == a) break;
      ++l
    }
    return {
      from: e.Pos(i, o + 1),
      to: t.clipPos(e.Pos(l))
    }
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("./foldcode")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./foldcode"], e) : e(CodeMirror);
}(function(e) {
  "use strict";

  function t(e) {
    this.options = e, this.from = this.to = 0
  }

  function n(e) {
    return e === !0 && (e = {}), null == e.gutter && (e.gutter = "CodeMirror-foldgutter"), null == e.indicatorOpen && (e.indicatorOpen = "CodeMirror-foldgutter-open"), null == e.indicatorFolded && (e.indicatorFolded = "CodeMirror-foldgutter-folded"), e
  }

  function r(e, t) {
    for (var n = e.findMarks(f(t, 0), f(t + 1, 0)), r = 0; r < n.length; ++r)
      if (n[r].__isFold && n[r].find().from.line == t) return n[r]
  }

  function i(e) {
    if ("string" == typeof e) {
      var t = document.createElement("div");
      return t.className = e + " CodeMirror-guttermarker-subtle", t
    }
    return e.cloneNode(!0)
  }

  function o(e, t, n) {
    var o = e.state.foldGutter.options,
      l = t,
      a = e.foldOption(o, "minFoldSize"),
      s = e.foldOption(o, "rangeFinder");
    e.eachLine(t, n, function(t) {
      var n = null;
      if (r(e, l)) n = i(o.indicatorFolded);
      else {
        var c = f(l, 0),
          u = s && s(e, c);
        u && u.to.line - u.from.line >= a && (n = i(o.indicatorOpen))
      }
      e.setGutterMarker(t, o.gutter, n), ++l
    })
  }

  function l(e) {
    var t = e.getViewport(),
      n = e.state.foldGutter;
    n && (e.operation(function() {
      o(e, t.from, t.to)
    }), n.from = t.from, n.to = t.to)
  }

  function a(e, t, n) {
    var i = e.state.foldGutter;
    if (i) {
      var o = i.options;
      if (n == o.gutter) {
        var l = r(e, t);
        l ? l.clear() : e.foldCode(f(t, 0), o.rangeFinder)
      }
    }
  }

  function s(e) {
    var t = e.state.foldGutter;
    if (t) {
      var n = t.options;
      t.from = t.to = 0, clearTimeout(t.changeUpdate), t.changeUpdate = setTimeout(function() {
        l(e)
      }, n.foldOnChangeTimeSpan || 600)
    }
  }

  function c(e) {
    var t = e.state.foldGutter;
    if (t) {
      var n = t.options;
      clearTimeout(t.changeUpdate), t.changeUpdate = setTimeout(function() {
        var n = e.getViewport();
        t.from == t.to || n.from - t.to > 20 || t.from - n.to > 20 ? l(e) : e.operation(function() {
          n.from < t.from && (o(e, n.from, t.from), t.from = n.from), n.to > t.to && (o(e, t.to, n.to), t.to = n.to)
        })
      }, n.updateViewportTimeSpan || 400)
    }
  }

  function u(e, t) {
    var n = e.state.foldGutter;
    if (n) {
      var r = t.line;
      r >= n.from && r < n.to && o(e, r, r + 1)
    }
  }
  e.defineOption("foldGutter", !1, function(r, i, o) {
    o && o != e.Init && (r.clearGutter(r.state.foldGutter.options.gutter), r.state.foldGutter = null, r.off("gutterClick", a), r.off("change", s), r.off("viewportChange", c), r.off("fold", u), r.off("unfold", u), r.off("swapDoc", s)), i && (r.state.foldGutter = new t(n(i)), l(r), r.on("gutterClick", a), r.on("change", s), r.on("viewportChange", c), r.on("fold", u), r.on("unfold", u), r.on("swapDoc", s))
  });
  var f = e.Pos
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.registerHelper("fold", "markdown", function(t, n) {
    function r(n) {
      var r = t.getTokenTypeAt(e.Pos(n, 0));
      return r && /\bheader\b/.test(r)
    }

    function i(e, t, n) {
      var i = t && t.match(/^#+/);
      return i && r(e) ? i[0].length : (i = n && n.match(/^[=\-]+\s*$/), i && r(e + 1) ? "=" == n[0] ? 1 : 2 : o)
    }
    var o = 100,
      l = t.getLine(n.line),
      a = t.getLine(n.line + 1),
      s = i(n.line, l, a);
    if (s !== o) {
      for (var c = t.lastLine(), u = n.line, f = t.getLine(u + 2); u < c && !(i(u + 1, a, f) <= s);) ++u, a = f, f = t.getLine(u + 2);
      return {
        from: e.Pos(n.line, l.length),
        to: e.Pos(u, t.getLine(u).length)
      }
    }
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t) {
    return e.line - t.line || e.ch - t.ch
  }

  function n(e, t, n, r) {
    this.line = t, this.ch = n, this.cm = e, this.text = e.getLine(t), this.min = r ? Math.max(r.from, e.firstLine()) : e.firstLine(), this.max = r ? Math.min(r.to - 1, e.lastLine()) : e.lastLine()
  }

  function r(e, t) {
    var n = e.cm.getTokenTypeAt(d(e.line, t));
    return n && /\btag\b/.test(n)
  }

  function i(e) {
    if (!(e.line >= e.max)) return e.ch = 0, e.text = e.cm.getLine(++e.line), !0
  }

  function o(e) {
    if (!(e.line <= e.min)) return e.text = e.cm.getLine(--e.line), e.ch = e.text.length, !0
  }

  function l(e) {
    for (;;) {
      var t = e.text.indexOf(">", e.ch);
      if (t == -1) {
        if (i(e)) continue;
        return
      } {
        if (r(e, t + 1)) {
          var n = e.text.lastIndexOf("/", t),
            o = n > -1 && !/\S/.test(e.text.slice(n + 1, t));
          return e.ch = t + 1, o ? "selfClose" : "regular"
        }
        e.ch = t + 1
      }
    }
  }

  function a(e) {
    for (;;) {
      var t = e.ch ? e.text.lastIndexOf("<", e.ch - 1) : -1;
      if (t == -1) {
        if (o(e)) continue;
        return
      }
      if (r(e, t + 1)) {
        g.lastIndex = t, e.ch = t;
        var n = g.exec(e.text);
        if (n && n.index == t) return n
      } else e.ch = t
    }
  }

  function s(e) {
    for (;;) {
      g.lastIndex = e.ch;
      var t = g.exec(e.text);
      if (!t) {
        if (i(e)) continue;
        return
      } {
        if (r(e, t.index + 1)) return e.ch = t.index + t[0].length, t;
        e.ch = t.index + 1
      }
    }
  }

  function c(e) {
    for (;;) {
      var t = e.ch ? e.text.lastIndexOf(">", e.ch - 1) : -1;
      if (t == -1) {
        if (o(e)) continue;
        return
      } {
        if (r(e, t + 1)) {
          var n = e.text.lastIndexOf("/", t),
            i = n > -1 && !/\S/.test(e.text.slice(n + 1, t));
          return e.ch = t + 1, i ? "selfClose" : "regular"
        }
        e.ch = t
      }
    }
  }

  function u(e, t) {
    for (var n = [];;) {
      var r, i = s(e),
        o = e.line,
        a = e.ch - (i ? i[0].length : 0);
      if (!i || !(r = l(e))) return;
      if ("selfClose" != r)
        if (i[1]) {
          for (var c = n.length - 1; c >= 0; --c)
            if (n[c] == i[2]) {
              n.length = c;
              break
            } if (c < 0 && (!t || t == i[2])) return {
            tag: i[2],
            from: d(o, a),
            to: d(e.line, e.ch)
          }
        } else n.push(i[2])
    }
  }

  function f(e, t) {
    for (var n = [];;) {
      var r = c(e);
      if (!r) return;
      if ("selfClose" != r) {
        var i = e.line,
          o = e.ch,
          l = a(e);
        if (!l) return;
        if (l[1]) n.push(l[2]);
        else {
          for (var s = n.length - 1; s >= 0; --s)
            if (n[s] == l[2]) {
              n.length = s;
              break
            } if (s < 0 && (!t || t == l[2])) return {
            tag: l[2],
            from: d(e.line, e.ch),
            to: d(i, o)
          }
        }
      } else a(e)
    }
  }
  var d = e.Pos,
    h = "A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD",
    p = h + "-:.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040",
    g = new RegExp("<(/?)([" + h + "][" + p + "]*)", "g");
  e.registerHelper("fold", "xml", function(e, r) {
    for (var i = new n(e, r.line, 0);;) {
      var o = s(i);
      if (!o || i.line != r.line) return;
      var a = l(i);
      if (!a) return;
      if (!o[1] && "selfClose" != a) {
        var c = d(i.line, i.ch),
          f = u(i, o[2]);
        return f && t(f.from, c) > 0 ? {
          from: c,
          to: f.from
        } : null
      }
    }
  }), e.findMatchingTag = function(e, r, i) {
    var o = new n(e, r.line, r.ch, i);
    if (o.text.indexOf(">") != -1 || o.text.indexOf("<") != -1) {
      var s = l(o),
        c = s && d(o.line, o.ch),
        h = s && a(o);
      if (s && h && !(t(o, r) > 0)) {
        var p = {
          from: d(o.line, o.ch),
          to: c,
          tag: h[2]
        };
        return "selfClose" == s ? {
          open: p,
          close: null,
          at: "open"
        } : h[1] ? {
          open: f(o, h[2]),
          close: p,
          at: "close"
        } : (o = new n(e, c.line, c.ch, i), {
          open: p,
          close: u(o, h[2]),
          at: "open"
        })
      }
    }
  }, e.findEnclosingTag = function(e, t, r, i) {
    for (var o = new n(e, t.line, t.ch, r);;) {
      var l = f(o, i);
      if (!l) break;
      var a = new n(e, t.line, t.ch, r),
        s = u(a, l.tag);
      if (s) return {
        open: l,
        close: s
      }
    }
  }, e.scanForClosingTag = function(e, t, r, i) {
    var o = new n(e, t.line, t.ch, i ? {
      from: 0,
      to: i
    } : null);
    return u(o, r)
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(t, n) {
    var r = t.getLine(n),
      i = r.search(/\S/);
    return i == -1 || /\bcomment\b/.test(t.getTokenTypeAt(e.Pos(n, i + 1))) ? -1 : e.countColumn(r, null, t.getOption("tabSize"))
  }
  e.registerHelper("fold", "indent", function(n, r) {
    var i = t(n, r.line);
    if (!(i < 0)) {
      for (var o = null, l = r.line + 1, a = n.lastLine(); l <= a; ++l) {
        var s = t(n, l);
        if (s == -1);
        else {
          if (!(s > i)) break;
          o = l
        }
      }
      return o ? {
        from: e.Pos(r.line, n.getLine(r.line).length),
        to: e.Pos(o, n.getLine(o).length)
      } : void 0
    }
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.registerGlobalHelper("fold", "comment", function(e) {
    return e.blockCommentStart && e.blockCommentEnd
  }, function(t, n) {
    var r = t.getModeAt(n),
      i = r.blockCommentStart,
      o = r.blockCommentEnd;
    if (i && o) {
      for (var l, a = n.line, s = t.getLine(a), c = n.ch, u = 0;;) {
        var f = c <= 0 ? -1 : s.lastIndexOf(i, c - 1);
        if (f != -1) {
          if (1 == u && f < n.ch) return;
          if (/comment/.test(t.getTokenTypeAt(e.Pos(a, f + 1))) && (0 == f || s.slice(f - o.length, f) == o || !/comment/.test(t.getTokenTypeAt(e.Pos(a, f))))) {
            l = f + i.length;
            break
          }
          c = f - 1
        } else {
          if (1 == u) return;
          u = 1, c = s.length
        }
      }
      var d, h, p = 1,
        g = t.lastLine();
      e: for (var m = a; m <= g; ++m)
        for (var v = t.getLine(m), y = m == a ? l : 0;;) {
          var b = v.indexOf(i, y),
            x = v.indexOf(o, y);
          if (b < 0 && (b = v.length), x < 0 && (x = v.length), y = Math.min(b, x), y == v.length) break;
          if (y == b) ++p;
          else if (!--p) {
            d = m, h = y;
            break e
          }++y
        }
      if (null != d && (a != d || h != l)) return {
        from: e.Pos(a, l),
        to: e.Pos(d, h)
      }
    }
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    var t = e.getWrapperElement();
    e.state.fullScreenRestore = {
      scrollTop: window.pageYOffset,
      scrollLeft: window.pageXOffset,
      width: t.style.width,
      height: t.style.height
    }, t.style.width = "", t.style.height = "auto", t.className += " CodeMirror-fullscreen", document.documentElement.style.overflow = "hidden", e.refresh()
  }

  function n(e) {
    var t = e.getWrapperElement();
    t.className = t.className.replace(/\s*CodeMirror-fullscreen\b/, ""), document.documentElement.style.overflow = "";
    var n = e.state.fullScreenRestore;
    t.style.width = n.width, t.style.height = n.height, window.scrollTo(n.scrollLeft, n.scrollTop), e.refresh()
  }
  e.defineOption("fullScreen", !1, function(r, i, o) {
    o == e.Init && (o = !1), !o != !i && (i ? t(r) : n(r))
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    for (var t = 0; t < e.state.activeLines.length; t++) e.removeLineClass(e.state.activeLines[t], "wrap", o), e.removeLineClass(e.state.activeLines[t], "background", l), e.removeLineClass(e.state.activeLines[t], "gutter", a)
  }

  function n(e, t) {
    if (e.length != t.length) return !1;
    for (var n = 0; n < e.length; n++)
      if (e[n] != t[n]) return !1;
    return !0
  }

  function r(e, r) {
    for (var i = [], s = 0; s < r.length; s++) {
      var c = r[s],
        u = e.getOption("styleActiveLine");
      if ("object" == typeof u && u.nonEmpty ? c.anchor.line == c.head.line : c.empty()) {
        var f = e.getLineHandleVisualStart(c.head.line);
        i[i.length - 1] != f && i.push(f)
      }
    }
    n(e.state.activeLines, i) || e.operation(function() {
      t(e);
      for (var n = 0; n < i.length; n++) e.addLineClass(i[n], "wrap", o), e.addLineClass(i[n], "background", l), e.addLineClass(i[n], "gutter", a);
      e.state.activeLines = i
    })
  }

  function i(e, t) {
    r(e, t.ranges)
  }
  var o = "CodeMirror-activeline",
    l = "CodeMirror-activeline-background",
    a = "CodeMirror-activeline-gutter";
  e.defineOption("styleActiveLine", !1, function(n, o, l) {
    var a = l != e.Init && l;
    o != a && (a && (n.off("beforeSelectionChange", i), t(n), delete n.state.activeLines), o && (n.state.activeLines = [], r(n, n.listSelections()), n.on("beforeSelectionChange", i)))
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.overlayMode = function(t, n, r) {
    return {
      startState: function() {
        return {
          base: e.startState(t),
          overlay: e.startState(n),
          basePos: 0,
          baseCur: null,
          overlayPos: 0,
          overlayCur: null,
          streamSeen: null
        }
      },
      copyState: function(r) {
        return {
          base: e.copyState(t, r.base),
          overlay: e.copyState(n, r.overlay),
          basePos: r.basePos,
          baseCur: null,
          overlayPos: r.overlayPos,
          overlayCur: null
        }
      },
      token: function(e, i) {
        return (e != i.streamSeen || Math.min(i.basePos, i.overlayPos) < e.start) && (i.streamSeen = e, i.basePos = i.overlayPos = e.start), e.start == i.basePos && (i.baseCur = t.token(e, i.base), i.basePos = e.pos), e.start == i.overlayPos && (e.pos = e.start, i.overlayCur = n.token(e, i.overlay), i.overlayPos = e.pos), e.pos = Math.min(i.basePos, i.overlayPos), null == i.overlayCur ? i.baseCur : null != i.baseCur && i.overlay.combineTokens || r && null == i.overlay.combineTokens ? i.baseCur + " " + i.overlayCur : i.overlayCur
      },
      indent: t.indent && function(e, n) {
        return t.indent(e.base, n)
      },
      electricChars: t.electricChars,
      innerMode: function(e) {
        return {
          state: e.base,
          mode: t
        }
      },
      blankLine: function(e) {
        var i, o;
        return t.blankLine && (i = t.blankLine(e.base)), n.blankLine && (o = n.blankLine(e.overlay)), null == o ? i : r && null != i ? i + " " + o : o
      }
    }
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.runMode = function(t, n, r, i) {
    var o = e.getMode(e.defaults, n),
      l = /MSIE \d/.test(navigator.userAgent),
      a = l && (null == document.documentMode || document.documentMode < 9);
    if (r.appendChild) {
      var s = i && i.tabSize || e.defaults.tabSize,
        c = r,
        u = 0;
      c.innerHTML = "", r = function(e, t) {
        if ("\n" == e) return c.appendChild(document.createTextNode(a ? "\r" : e)), void(u = 0);
        for (var n = "", r = 0;;) {
          var i = e.indexOf("\t", r);
          if (i == -1) {
            n += e.slice(r), u += e.length - r;
            break
          }
          u += i - r, n += e.slice(r, i);
          var o = s - u % s;
          u += o;
          for (var l = 0; l < o; ++l) n += " ";
          r = i + 1
        }
        if (t) {
          var f = c.appendChild(document.createElement("span"));
          f.className = "cm-" + t.replace(/ +/g, " cm-"), f.appendChild(document.createTextNode(n))
        } else c.appendChild(document.createTextNode(n))
      }
    }
    for (var f = e.splitLines(t), d = i && i.state || e.startState(o), h = 0, p = f.length; h < p; ++h) {
      h && r("\n");
      var g = new e.StringStream(f[h]);
      for (!g.string && o.blankLine && o.blankLine(d); !g.eol();) {
        var m = o.token(g, d);
        r(g.current(), m, h, g.start, d), g.start = g.pos
      }
    }
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("./searchcursor"), require("../dialog/dialog")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./searchcursor", "../dialog/dialog"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t) {
    return "string" == typeof e ? e = new RegExp(e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), t ? "gi" : "g") : e.global || (e = new RegExp(e.source, e.ignoreCase ? "gi" : "g")), {
      token: function(t) {
        e.lastIndex = t.pos;
        var n = e.exec(t.string);
        return n && n.index == t.pos ? (t.pos += n[0].length || 1, "searching") : void(n ? t.pos = n.index : t.skipToEnd())
      }
    }
  }

  function n() {
    this.posFrom = this.posTo = this.lastQuery = this.query = null, this.overlay = null
  }

  function r(e) {
    return e.state.search || (e.state.search = new n)
  }

  function i(e) {
    return "string" == typeof e && e == e.toLowerCase()
  }

  function o(e, t, n) {
    return e.getSearchCursor(t, n, {
      caseFold: i(t),
      multiline: !0
    })
  }

  function l(e, t, n, r, i) {
    e.openDialog(t, r, {
      value: n,
      selectValueOnOpen: !0,
      closeOnEnter: !1,
      onClose: function() {
        p(e)
      },
      onKeyDown: i
    })
  }

  function a(e, t, n, r, i) {
    e.openDialog ? e.openDialog(t, i, {
      value: r,
      selectValueOnOpen: !0
    }) : i(prompt(n, r))
  }

  function s(e, t, n, r) {
    e.openConfirm ? e.openConfirm(t, r) : confirm(n) && r[0]()
  }

  function c(e) {
    return e.replace(/\\(.)/g, function(e, t) {
      return "n" == t ? "\n" : "r" == t ? "\r" : t
    })
  }

  function u(e) {
    var t = e.match(/^\/(.*)\/([a-z]*)$/);
    if (t) try {
      e = new RegExp(t[1], t[2].indexOf("i") == -1 ? "" : "i")
    } catch (n) {} else e = c(e);
    return ("string" == typeof e ? "" == e : e.test("")) && (e = /x^/), e
  }

  function f(e, n, r) {
    n.queryText = r, n.query = u(r), e.removeOverlay(n.overlay, i(n.query)), n.overlay = t(n.query, i(n.query)), e.addOverlay(n.overlay), e.showMatchesOnScrollbar && (n.annotate && (n.annotate.clear(), n.annotate = null), n.annotate = e.showMatchesOnScrollbar(n.query, i(n.query)))
  }

  function d(t, n, i, o) {
    var s = r(t);
    if (s.query) return h(t, n);
    var c = t.getSelection() || s.lastQuery;
    if (c instanceof RegExp && "x^" == c.source && (c = null), i && t.openDialog) {
      var u = null,
        d = function(n, r) {
          e.e_stop(r), n && (n != s.queryText && (f(t, s, n), s.posFrom = s.posTo = t.getCursor()), u && (u.style.opacity = 1), h(t, r.shiftKey, function(e, n) {
            var r;
            n.line < 3 && document.querySelector && (r = t.display.wrapper.querySelector(".CodeMirror-dialog")) && r.getBoundingClientRect().bottom - 4 > t.cursorCoords(n, "window").top && ((u = r).style.opacity = .4)
          }))
        };
      l(t, v, c, d, function(n, i) {
        var o = e.keyName(n),
          l = t.getOption("extraKeys"),
          a = l && l[o] || e.keyMap[t.getOption("keyMap")][o];
        "findNext" == a || "findPrev" == a || "findPersistentNext" == a || "findPersistentPrev" == a ? (e.e_stop(n), f(t, r(t), i), t.execCommand(a)) : "find" != a && "findPersistent" != a || (e.e_stop(n), d(i, n))
      }), o && c && (f(t, s, c), h(t, n))
    } else a(t, v, "Search for:", c, function(e) {
      e && !s.query && t.operation(function() {
        f(t, s, e), s.posFrom = s.posTo = t.getCursor(), h(t, n)
      })
    })
  }

  function h(t, n, i) {
    t.operation(function() {
      var l = r(t),
        a = o(t, l.query, n ? l.posFrom : l.posTo);
      (a.find(n) || (a = o(t, l.query, n ? e.Pos(t.lastLine()) : e.Pos(t.firstLine(), 0)), a.find(n))) && (t.setSelection(a.from(), a.to()), t.scrollIntoView({
        from: a.from(),
        to: a.to()
      }, 20), l.posFrom = a.from(), l.posTo = a.to(), i && i(a.from(), a.to()))
    })
  }

  function p(e) {
    e.operation(function() {
      var t = r(e);
      t.lastQuery = t.query, t.query && (t.query = t.queryText = null, e.removeOverlay(t.overlay), t.annotate && (t.annotate.clear(), t.annotate = null))
    })
  }

  function g(e, t, n) {
    e.operation(function() {
      for (var r = o(e, t); r.findNext();)
        if ("string" != typeof t) {
          var i = e.getRange(r.from(), r.to()).match(t);
          r.replace(n.replace(/\$(\d)/g, function(e, t) {
            return i[t]
          }))
        } else r.replace(n)
    })
  }

  function m(e, t) {
    if (!e.getOption("readOnly")) {
      var n = e.getSelection() || r(e).lastQuery,
        i = '<span class="CodeMirror-search-label">' + (t ? "Replace all:" : "Replace:") + "</span>";
      a(e, i + y, i, n, function(n) {
        n && (n = u(n), a(e, b, "Replace with:", "", function(r) {
          if (r = c(r), t) g(e, n, r);
          else {
            p(e);
            var i = o(e, n, e.getCursor("from")),
              l = function() {
                var t, c = i.from();
                !(t = i.findNext()) && (i = o(e, n), !(t = i.findNext()) || c && i.from().line == c.line && i.from().ch == c.ch) || (e.setSelection(i.from(), i.to()), e.scrollIntoView({
                  from: i.from(),
                  to: i.to()
                }), s(e, x, "Replace?", [function() {
                  a(t)
                }, l, function() {
                  g(e, n, r)
                }]))
              },
              a = function(e) {
                i.replace("string" == typeof n ? r : r.replace(/\$(\d)/g, function(t, n) {
                  return e[n]
                })), l()
              };
            l()
          }
        }))
      })
    }
  }
  var v = '<span class="CodeMirror-search-label">Search:</span> <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint">(Use /re/ syntax for regexp search)</span>',
    y = ' <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint">(Use /re/ syntax for regexp search)</span>',
    b = '<span class="CodeMirror-search-label">With:</span> <input type="text" style="width: 10em" class="CodeMirror-search-field"/>',
    x = '<span class="CodeMirror-search-label">Replace?</span> <button>Yes</button> <button>No</button> <button>All</button> <button>Stop</button>';
  e.commands.find = function(e) {
    p(e), d(e)
  }, e.commands.findPersistent = function(e) {
    p(e), d(e, !1, !0)
  }, e.commands.findPersistentNext = function(e) {
    d(e, !1, !0, !0)
  }, e.commands.findPersistentPrev = function(e) {
    d(e, !0, !0, !0)
  }, e.commands.findNext = d, e.commands.findPrev = function(e) {
    d(e, !0)
  }, e.commands.clearSearch = p, e.commands.replace = m, e.commands.replaceAll = function(e) {
    m(e, !0)
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    var t = e.flags;
    return null != t ? t : (e.ignoreCase ? "i" : "") + (e.global ? "g" : "") + (e.multiline ? "m" : "")
  }

  function n(e, n) {
    for (var r = t(e), i = r, o = 0; o < n.length; o++) i.indexOf(n.charAt(o)) == -1 && (i += n.charAt(o));
    return r == i ? e : new RegExp(e.source, i)
  }

  function r(e) {
    return /\\s|\\n|\n|\\W|\\D|\[\^/.test(e.source)
  }

  function i(e, t, r) {
    t = n(t, "g");
    for (var i = r.line, o = r.ch, l = e.lastLine(); i <= l; i++, o = 0) {
      t.lastIndex = o;
      var a = e.getLine(i),
        s = t.exec(a);
      if (s) return {
        from: g(i, s.index),
        to: g(i, s.index + s[0].length),
        match: s
      }
    }
  }

  function o(e, t, o) {
    if (!r(t)) return i(e, t, o);
    t = n(t, "gm");
    for (var l, a = 1, s = o.line, c = e.lastLine(); s <= c;) {
      for (var u = 0; u < a && !(s > c); u++) {
        var f = e.getLine(s++);
        l = null == l ? f : l + "\n" + f
      }
      a = 2 * a, t.lastIndex = o.ch;
      var d = t.exec(l);
      if (d) {
        var h = l.slice(0, d.index).split("\n"),
          p = d[0].split("\n"),
          m = o.line + h.length - 1,
          v = h[h.length - 1].length;
        return {
          from: g(m, v),
          to: g(m + p.length - 1, 1 == p.length ? v + p[0].length : p[p.length - 1].length),
          match: d
        }
      }
    }
  }

  function l(e, t) {
    for (var n, r = 0;;) {
      t.lastIndex = r;
      var i = t.exec(e);
      if (!i) return n;
      if (n = i, r = n.index + (n[0].length || 1), r == e.length) return n
    }
  }

  function a(e, t, r) {
    t = n(t, "g");
    for (var i = r.line, o = r.ch, a = e.firstLine(); i >= a; i--, o = -1) {
      var s = e.getLine(i);
      o > -1 && (s = s.slice(0, o));
      var c = l(s, t);
      if (c) return {
        from: g(i, c.index),
        to: g(i, c.index + c[0].length),
        match: c
      }
    }
  }

  function s(e, t, r) {
    t = n(t, "gm");
    for (var i, o = 1, a = r.line, s = e.firstLine(); a >= s;) {
      for (var c = 0; c < o; c++) {
        var u = e.getLine(a--);
        i = null == i ? u.slice(0, r.ch) : u + "\n" + i
      }
      o *= 2;
      var f = l(i, t);
      if (f) {
        var d = i.slice(0, f.index).split("\n"),
          h = f[0].split("\n"),
          p = a + d.length,
          m = d[d.length - 1].length;
        return {
          from: g(p, m),
          to: g(p + h.length - 1, 1 == h.length ? m + h[0].length : h[h.length - 1].length),
          match: f
        }
      }
    }
  }

  function c(e, t, n, r) {
    if (e.length == t.length) return n;
    for (var i = 0, o = n + Math.max(0, e.length - t.length);;) {
      if (i == o) return i;
      var l = i + o >> 1,
        a = r(e.slice(0, l)).length;
      if (a == n) return l;
      a > n ? o = l : i = l + 1
    }
  }

  function u(e, t, n, r) {
    if (!t.length) return null;
    var i = r ? h : p,
      o = i(t).split(/\r|\n\r?/);
    e: for (var l = n.line, a = n.ch, s = e.lastLine() + 1 - o.length; l <= s; l++, a = 0) {
      var u = e.getLine(l).slice(a),
        f = i(u);
      if (1 == o.length) {
        var d = f.indexOf(o[0]);
        if (d == -1) continue e;
        var n = c(u, f, d, i) + a;
        return {
          from: g(l, c(u, f, d, i) + a),
          to: g(l, c(u, f, d + o[0].length, i) + a)
        }
      }
      var m = f.length - o[0].length;
      if (f.slice(m) == o[0]) {
        for (var v = 1; v < o.length - 1; v++)
          if (i(e.getLine(l + v)) != o[v]) continue e;
        var y = e.getLine(l + o.length - 1),
          b = i(y),
          x = o[o.length - 1];
        if (b.slice(0, x.length) == x) return {
          from: g(l, c(u, f, m, i) + a),
          to: g(l + o.length - 1, c(y, b, x.length, i))
        }
      }
    }
  }

  function f(e, t, n, r) {
    if (!t.length) return null;
    var i = r ? h : p,
      o = i(t).split(/\r|\n\r?/);
    e: for (var l = n.line, a = n.ch, s = e.firstLine() - 1 + o.length; l >= s; l--, a = -1) {
      var u = e.getLine(l);
      a > -1 && (u = u.slice(0, a));
      var f = i(u);
      if (1 == o.length) {
        var d = f.lastIndexOf(o[0]);
        if (d == -1) continue e;
        return {
          from: g(l, c(u, f, d, i)),
          to: g(l, c(u, f, d + o[0].length, i))
        }
      }
      var m = o[o.length - 1];
      if (f.slice(0, m.length) == m) {
        for (var v = 1, n = l - o.length + 1; v < o.length - 1; v++)
          if (i(e.getLine(n + v)) != o[v]) continue e;
        var y = e.getLine(l + 1 - o.length),
          b = i(y);
        if (b.slice(b.length - o[0].length) == o[0]) return {
          from: g(l + 1 - o.length, c(y, b, y.length - o[0].length, i)),
          to: g(l, c(u, f, m.length, i))
        }
      }
    }
  }

  function d(e, t, r, l) {
    this.atOccurrence = !1, this.doc = e, r = r ? e.clipPos(r) : g(0, 0), this.pos = {
      from: r,
      to: r
    };
    var c;
    "object" == typeof l ? c = l.caseFold : (c = l, l = null), "string" == typeof t ? (null == c && (c = !1), this.matches = function(n, r) {
      return (n ? f : u)(e, t, r, c)
    }) : (t = n(t, "gm"), l && l.multiline === !1 ? this.matches = function(n, r) {
      return (n ? a : i)(e, t, r)
    } : this.matches = function(n, r) {
      return (n ? s : o)(e, t, r)
    })
  }
  var h, p, g = e.Pos;
  String.prototype.normalize ? (h = function(e) {
    return e.normalize("NFD").toLowerCase()
  }, p = function(e) {
    return e.normalize("NFD")
  }) : (h = function(e) {
    return e.toLowerCase()
  }, p = function(e) {
    return e
  }), d.prototype = {
    findNext: function() {
      return this.find(!1)
    },
    findPrevious: function() {
      return this.find(!0)
    },
    find: function(t) {
      for (var n = this.matches(t, this.doc.clipPos(t ? this.pos.from : this.pos.to)); n && 0 == e.cmpPos(n.from, n.to);) t ? n.from.ch ? n.from = g(n.from.line, n.from.ch - 1) : n = n.from.line == this.doc.firstLine() ? null : this.matches(t, this.doc.clipPos(g(n.from.line - 1))) : n.to.ch < this.doc.getLine(n.to.line).length ? n.to = g(n.to.line, n.to.ch + 1) : n = n.to.line == this.doc.lastLine() ? null : this.matches(t, g(n.to.line + 1, 0));
      if (n) return this.pos = n, this.atOccurrence = !0, this.pos.match || !0;
      var r = g(t ? this.doc.firstLine() : this.doc.lastLine() + 1, 0);
      return this.pos = {
        from: r,
        to: r
      }, this.atOccurrence = !1
    },
    from: function() {
      if (this.atOccurrence) return this.pos.from
    },
    to: function() {
      if (this.atOccurrence) return this.pos.to
    },
    replace: function(t, n) {
      if (this.atOccurrence) {
        var r = e.splitLines(t);
        this.doc.replaceRange(r, this.pos.from, this.pos.to, n), this.pos.to = g(this.pos.from.line + r.length - 1, r[r.length - 1].length + (1 == r.length ? this.pos.from.ch : 0))
      }
    }
  }, e.defineExtension("getSearchCursor", function(e, t, n) {
    return new d(this.doc, e, t, n)
  }), e.defineDocExtension("getSearchCursor", function(e, t, n) {
    return new d(this, e, t, n)
  }), e.defineExtension("selectMatches", function(t, n) {
    for (var r = [], i = this.getSearchCursor(t, this.getCursor("from"), n); i.findNext() && !(e.cmpPos(i.to(), this.getCursor("to")) > 0);) r.push({
      anchor: i.from(),
      head: i.to()
    });
    r.length && this.setSelections(r, 0)
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("../fold/xml-fold")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../fold/xml-fold"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    e.state.tagHit && e.state.tagHit.clear(), e.state.tagOther && e.state.tagOther.clear(), e.state.tagHit = e.state.tagOther = null
  }

  function n(n) {
    n.state.failedTagMatch = !1, n.operation(function() {
      if (t(n), !n.somethingSelected()) {
        var r = n.getCursor(),
          i = n.getViewport();
        i.from = Math.min(i.from, r.line), i.to = Math.max(r.line + 1, i.to);
        var o = e.findMatchingTag(n, r, i);
        if (o) {
          if (n.state.matchBothTags) {
            var l = "open" == o.at ? o.open : o.close;
            l && (n.state.tagHit = n.markText(l.from, l.to, {
              className: "CodeMirror-matchingtag"
            }))
          }
          var a = "close" == o.at ? o.open : o.close;
          a ? n.state.tagOther = n.markText(a.from, a.to, {
            className: "CodeMirror-matchingtag"
          }) : n.state.failedTagMatch = !0
        }
      }
    })
  }

  function r(e) {
    e.state.failedTagMatch && n(e)
  }
  e.defineOption("matchTags", !1, function(i, o, l) {
    l && l != e.Init && (i.off("cursorActivity", n), i.off("viewportChange", r), t(i)), o && (i.state.matchBothTags = "object" == typeof o && o.bothTags, i.on("cursorActivity", n), i.on("viewportChange", r), n(i))
  }), e.commands.toMatchingTag = function(t) {
    var n = e.findMatchingTag(t, t.getCursor());
    if (n) {
      var r = "close" == n.at ? n.open : n.close;
      r && t.extendSelection(r.to, r.from)
    }
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  function t(e, t, r) {
    var i = e.getLineHandle(t.line),
      o = t.ch - 1,
      s = r && r.afterCursor;
    null == s && (s = /(^| )cm-fat-cursor($| )/.test(e.getWrapperElement().className));
    var c = !s && o >= 0 && a[i.text.charAt(o)] || a[i.text.charAt(++o)];
    if (!c) return null;
    var u = ">" == c.charAt(1) ? 1 : -1;
    if (r && r.strict && u > 0 != (o == t.ch)) return null;
    var f = e.getTokenTypeAt(l(t.line, o + 1)),
      d = n(e, l(t.line, o + (u > 0 ? 1 : 0)), u, f || null, r);
    return null == d ? null : {
      from: l(t.line, o),
      to: d && d.pos,
      match: d && d.ch == c.charAt(0),
      forward: u > 0
    }
  }

  function n(e, t, n, r, i) {
    for (var o = i && i.maxScanLineLength || 1e4, s = i && i.maxScanLines || 1e3, c = [], u = i && i.bracketRegex ? i.bracketRegex : /[(){}[\]]/, f = n > 0 ? Math.min(t.line + s, e.lastLine() + 1) : Math.max(e.firstLine() - 1, t.line - s), d = t.line; d != f; d += n) {
      var h = e.getLine(d);
      if (h) {
        var p = n > 0 ? 0 : h.length - 1,
          g = n > 0 ? h.length : -1;
        if (!(h.length > o))
          for (d == t.line && (p = t.ch - (n < 0 ? 1 : 0)); p != g; p += n) {
            var m = h.charAt(p);
            if (u.test(m) && (void 0 === r || e.getTokenTypeAt(l(d, p + 1)) == r)) {
              var v = a[m];
              if (">" == v.charAt(1) == n > 0) c.push(m);
              else {
                if (!c.length) return {
                  pos: l(d, p),
                  ch: m
                };
                c.pop()
              }
            }
          }
      }
    }
    return d - n != (n > 0 ? e.lastLine() : e.firstLine()) && null
  }

  function r(e, n, r) {
    for (var i = e.state.matchBrackets.maxHighlightLineLength || 1e3, a = [], s = e.listSelections(), c = 0; c < s.length; c++) {
      var u = s[c].empty() && t(e, s[c].head, r);
      if (u && e.getLine(u.from.line).length <= i) {
        var f = u.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
        a.push(e.markText(u.from, l(u.from.line, u.from.ch + 1), {
          className: f
        })), u.to && e.getLine(u.to.line).length <= i && a.push(e.markText(u.to, l(u.to.line, u.to.ch + 1), {
          className: f
        }))
      }
    }
    if (a.length) {
      o && e.state.focused && e.focus();
      var d = function() {
        e.operation(function() {
          for (var e = 0; e < a.length; e++) a[e].clear()
        })
      };
      if (!n) return d;
      setTimeout(d, 800)
    }
  }

  function i(e) {
    e.operation(function() {
      e.state.matchBrackets.currentlyHighlighted && (e.state.matchBrackets.currentlyHighlighted(), e.state.matchBrackets.currentlyHighlighted = null), e.state.matchBrackets.currentlyHighlighted = r(e, !1, e.state.matchBrackets)
    })
  }
  var o = /MSIE \d/.test(navigator.userAgent) && (null == document.documentMode || document.documentMode < 8),
    l = e.Pos,
    a = {
      "(": ")>",
      ")": "(<",
      "[": "]>",
      "]": "[<",
      "{": "}>",
      "}": "{<"
    };
  e.defineOption("matchBrackets", !1, function(t, n, r) {
    r && r != e.Init && (t.off("cursorActivity", i), t.state.matchBrackets && t.state.matchBrackets.currentlyHighlighted && (t.state.matchBrackets.currentlyHighlighted(), t.state.matchBrackets.currentlyHighlighted = null)), n && (t.state.matchBrackets = "object" == typeof n ? n : {}, t.on("cursorActivity", i))
  }), e.defineExtension("matchBrackets", function() {
    r(this, !0)
  }), e.defineExtension("findMatchingBracket", function(e, n, r) {
    return (r || "boolean" == typeof n) && (r ? (r.strict = n, n = r) : n = n ? {
      strict: !0
    } : null), t(this, e, n)
  }), e.defineExtension("scanForBracket", function(e, t, r, i) {
    return n(this, e, t, r, i)
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  function t(e, t) {
    return "pairs" == t && "string" == typeof e ? e : "object" == typeof e && null != e[t] ? e[t] : d[t]
  }

  function n(e) {
    for (var t = 0; t < e.length; t++) {
      var n = e.charAt(t),
        i = "'" + n + "'";
      p[i] || (p[i] = r(n))
    }
  }

  function r(e) {
    return function(t) {
      return s(t, e)
    }
  }

  function i(e) {
    var t = e.state.closeBrackets;
    if (!t || t.override) return t;
    var n = e.getModeAt(e.getCursor());
    return n.closeBrackets || t
  }

  function o(n) {
    var r = i(n);
    if (!r || n.getOption("disableInput")) return e.Pass;
    for (var o = t(r, "pairs"), l = n.listSelections(), a = 0; a < l.length; a++) {
      if (!l[a].empty()) return e.Pass;
      var s = u(n, l[a].head);
      if (!s || o.indexOf(s) % 2 != 0) return e.Pass
    }
    for (var a = l.length - 1; a >= 0; a--) {
      var c = l[a].head;
      n.replaceRange("", h(c.line, c.ch - 1), h(c.line, c.ch + 1), "+delete")
    }
  }

  function l(n) {
    var r = i(n),
      o = r && t(r, "explode");
    if (!o || n.getOption("disableInput")) return e.Pass;
    for (var l = n.listSelections(), a = 0; a < l.length; a++) {
      if (!l[a].empty()) return e.Pass;
      var s = u(n, l[a].head);
      if (!s || o.indexOf(s) % 2 != 0) return e.Pass
    }
    n.operation(function() {
      var e = n.lineSeparator() || "\n";
      n.replaceSelection(e + e, null), n.execCommand("goCharLeft"), l = n.listSelections();
      for (var t = 0; t < l.length; t++) {
        var r = l[t].head.line;
        n.indentLine(r, null, !0), n.indentLine(r + 1, null, !0)
      }
    })
  }

  function a(t) {
    var n = e.cmpPos(t.anchor, t.head) > 0;
    return {
      anchor: new h(t.anchor.line, t.anchor.ch + (n ? -1 : 1)),
      head: new h(t.head.line, t.head.ch + (n ? 1 : -1))
    }
  }

  function s(n, r) {
    var o = i(n);
    if (!o || n.getOption("disableInput")) return e.Pass;
    var l = t(o, "pairs"),
      s = l.indexOf(r);
    if (s == -1) return e.Pass;
    for (var u, d = t(o, "triples"), p = l.charAt(s + 1) == r, g = n.listSelections(), m = s % 2 == 0, v = 0; v < g.length; v++) {
      var y, b = g[v],
        x = b.head,
        w = n.getRange(x, h(x.line, x.ch + 1));
      if (m && !b.empty()) y = "surround";
      else if (!p && m || w != r)
        if (p && x.ch > 1 && d.indexOf(r) >= 0 && n.getRange(h(x.line, x.ch - 2), x) == r + r) {
          if (x.ch > 2 && /\bstring/.test(n.getTokenTypeAt(h(x.line, x.ch - 2)))) return e.Pass;
          y = "addFour"
        } else if (p) {
        var C = 0 == x.ch ? " " : n.getRange(h(x.line, x.ch - 1), x);
        if (e.isWordChar(w) || C == r || e.isWordChar(C)) return e.Pass;
        y = "both"
      } else {
        if (!m || n.getLine(x.line).length != x.ch && !c(w, l) && !/\s/.test(w)) return e.Pass;
        y = "both"
      } else y = p && f(n, x) ? "both" : d.indexOf(r) >= 0 && n.getRange(x, h(x.line, x.ch + 3)) == r + r + r ? "skipThree" : "skip";
      if (u) {
        if (u != y) return e.Pass
      } else u = y
    }
    var k = s % 2 ? l.charAt(s - 1) : r,
      S = s % 2 ? r : l.charAt(s + 1);
    n.operation(function() {
      if ("skip" == u) n.execCommand("goCharRight");
      else if ("skipThree" == u)
        for (var e = 0; e < 3; e++) n.execCommand("goCharRight");
      else if ("surround" == u) {
        for (var t = n.getSelections(), e = 0; e < t.length; e++) t[e] = k + t[e] + S;
        n.replaceSelections(t, "around"), t = n.listSelections().slice();
        for (var e = 0; e < t.length; e++) t[e] = a(t[e]);
        n.setSelections(t)
      } else "both" == u ? (n.replaceSelection(k + S, null), n.triggerElectric(k + S), n.execCommand("goCharLeft")) : "addFour" == u && (n.replaceSelection(k + k + k + k, "before"), n.execCommand("goCharRight"))
    })
  }

  function c(e, t) {
    var n = t.lastIndexOf(e);
    return n > -1 && n % 2 == 1
  }

  function u(e, t) {
    var n = e.getRange(h(t.line, t.ch - 1), h(t.line, t.ch + 1));
    return 2 == n.length ? n : null
  }

  function f(e, t) {
    var n = e.getTokenAt(h(t.line, t.ch + 1));
    return /\bstring/.test(n.type) && n.start == t.ch && (0 == t.ch || !/\bstring/.test(e.getTokenTypeAt(t)))
  }
  var d = {
      pairs: "()[]{}''\"\"",
      triples: "",
      explode: "[]{}"
    },
    h = e.Pos;
  e.defineOption("autoCloseBrackets", !1, function(r, i, o) {
    o && o != e.Init && (r.removeKeyMap(p), r.state.closeBrackets = null), i && (n(t(i, "pairs")), r.state.closeBrackets = i, r.addKeyMap(p))
  });
  var p = {
    Backspace: o,
    Enter: l
  };
  n(d.pairs + "`")
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("../fold/xml-fold")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../fold/xml-fold"], e) : e(CodeMirror)
}(function(e) {
  function t(t) {
    if (t.getOption("disableInput")) return e.Pass;
    for (var n = t.listSelections(), r = [], s = t.getOption("autoCloseTags"), c = 0; c < n.length; c++) {
      if (!n[c].empty()) return e.Pass;
      var u = n[c].head,
        f = t.getTokenAt(u),
        d = e.innerMode(t.getMode(), f.state),
        h = d.state;
      if ("xml" != d.mode.name || !h.tagName) return e.Pass;
      var p = "html" == d.mode.configuration,
        g = "object" == typeof s && s.dontCloseTags || p && l,
        m = "object" == typeof s && s.indentTags || p && a,
        v = h.tagName;
      f.end > u.ch && (v = v.slice(0, v.length - f.end + u.ch));
      var y = v.toLowerCase();
      if (!v || "string" == f.type && (f.end != u.ch || !/[\"\']/.test(f.string.charAt(f.string.length - 1)) || 1 == f.string.length) || "tag" == f.type && "closeTag" == h.type || f.string.indexOf("/") == f.string.length - 1 || g && i(g, y) > -1 || o(t, v, u, h, !0)) return e.Pass;
      var b = m && i(m, y) > -1;
      r[c] = {
        indent: b,
        text: ">" + (b ? "\n\n" : "") + "</" + v + ">",
        newPos: b ? e.Pos(u.line + 1, 0) : e.Pos(u.line, u.ch + 1)
      }
    }
    for (var x = "object" == typeof s && s.dontIndentOnAutoClose, c = n.length - 1; c >= 0; c--) {
      var w = r[c];
      t.replaceRange(w.text, n[c].head, n[c].anchor, "+insert");
      var C = t.listSelections().slice(0);
      C[c] = {
        head: w.newPos,
        anchor: w.newPos
      }, t.setSelections(C), !x && w.indent && (t.indentLine(w.newPos.line, null, !0),
        t.indentLine(w.newPos.line + 1, null, !0))
    }
  }

  function n(t, n) {
    for (var r = t.listSelections(), i = [], l = n ? "/" : "</", a = t.getOption("autoCloseTags"), s = "object" == typeof a && a.dontIndentOnSlash, c = 0; c < r.length; c++) {
      if (!r[c].empty()) return e.Pass;
      var u = r[c].head,
        f = t.getTokenAt(u),
        d = e.innerMode(t.getMode(), f.state),
        h = d.state;
      if (n && ("string" == f.type || "<" != f.string.charAt(0) || f.start != u.ch - 1)) return e.Pass;
      var p;
      if ("xml" != d.mode.name)
        if ("htmlmixed" == t.getMode().name && "javascript" == d.mode.name) p = l + "script";
        else {
          if ("htmlmixed" != t.getMode().name || "css" != d.mode.name) return e.Pass;
          p = l + "style"
        }
      else {
        if (!h.context || !h.context.tagName || o(t, h.context.tagName, u, h)) return e.Pass;
        p = l + h.context.tagName
      }
      ">" != t.getLine(u.line).charAt(f.end) && (p += ">"), i[c] = p
    }
    if (t.replaceSelections(i), r = t.listSelections(), !s)
      for (var c = 0; c < r.length; c++)(c == r.length - 1 || r[c].head.line < r[c + 1].head.line) && t.indentLine(r[c].head.line)
  }

  function r(t) {
    return t.getOption("disableInput") ? e.Pass : n(t, !0)
  }

  function i(e, t) {
    if (e.indexOf) return e.indexOf(t);
    for (var n = 0, r = e.length; n < r; ++n)
      if (e[n] == t) return n;
    return -1
  }

  function o(t, n, r, i, o) {
    if (!e.scanForClosingTag) return !1;
    var l = Math.min(t.lastLine() + 1, r.line + 500),
      a = e.scanForClosingTag(t, r, null, l);
    if (!a || a.tag != n) return !1;
    for (var s = i.context, c = o ? 1 : 0; s && s.tagName == n; s = s.prev) ++c;
    r = a.to;
    for (var u = 1; u < c; u++) {
      var f = e.scanForClosingTag(t, r, null, l);
      if (!f || f.tag != n) return !1;
      r = f.to
    }
    return !0
  }
  e.defineOption("autoCloseTags", !1, function(n, i, o) {
    if (o != e.Init && o && n.removeKeyMap("autoCloseTags"), i) {
      var l = {
        name: "autoCloseTags"
      };
      ("object" != typeof i || i.whenClosing) && (l["'/'"] = function(e) {
        return r(e)
      }), ("object" != typeof i || i.whenOpening) && (l["'>'"] = function(e) {
        return t(e)
      }), n.addKeyMap(l)
    }
  });
  var l = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"],
    a = ["applet", "blockquote", "body", "button", "div", "dl", "fieldset", "form", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "html", "iframe", "layer", "legend", "object", "ol", "p", "select", "table", "ul"];
  e.commands.closeTag = function(e) {
    return n(e)
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("./xml-hint")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./xml-hint"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    for (var t in f) f.hasOwnProperty(t) && (e.attrs[t] = f[t])
  }

  function n(t, n) {
    var r = {
      schemaInfo: u
    };
    if (n)
      for (var i in n) r[i] = n[i];
    return e.hint.xml(t, r)
  }
  var r = "ab aa af ak sq am ar an hy as av ae ay az bm ba eu be bn bh bi bs br bg my ca ch ce ny zh cv kw co cr hr cs da dv nl dz en eo et ee fo fj fi fr ff gl ka de el gn gu ht ha he hz hi ho hu ia id ie ga ig ik io is it iu ja jv kl kn kr ks kk km ki rw ky kv kg ko ku kj la lb lg li ln lo lt lu lv gv mk mg ms ml mt mi mr mh mn na nv nb nd ne ng nn no ii nr oc oj cu om or os pa pi fa pl ps pt qu rm rn ro ru sa sc sd se sm sg sr gd sn si sk sl so st es su sw ss sv ta te tg th ti bo tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa cy wo fy xh yi yo za zu".split(" "),
    i = ["_blank", "_self", "_top", "_parent"],
    o = ["ascii", "utf-8", "utf-16", "latin1", "latin1"],
    l = ["get", "post", "put", "delete"],
    a = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"],
    s = ["all", "screen", "print", "embossed", "braille", "handheld", "print", "projection", "screen", "tty", "tv", "speech", "3d-glasses", "resolution [>][<][=] [X]", "device-aspect-ratio: X/Y", "orientation:portrait", "orientation:landscape", "device-height: [X]", "device-width: [X]"],
    c = {
      attrs: {}
    },
    u = {
      a: {
        attrs: {
          href: null,
          ping: null,
          type: null,
          media: s,
          target: i,
          hreflang: r
        }
      },
      abbr: c,
      acronym: c,
      address: c,
      applet: c,
      area: {
        attrs: {
          alt: null,
          coords: null,
          href: null,
          target: null,
          ping: null,
          media: s,
          hreflang: r,
          type: null,
          shape: ["default", "rect", "circle", "poly"]
        }
      },
      article: c,
      aside: c,
      audio: {
        attrs: {
          src: null,
          mediagroup: null,
          crossorigin: ["anonymous", "use-credentials"],
          preload: ["none", "metadata", "auto"],
          autoplay: ["", "autoplay"],
          loop: ["", "loop"],
          controls: ["", "controls"]
        }
      },
      b: c,
      base: {
        attrs: {
          href: null,
          target: i
        }
      },
      basefont: c,
      bdi: c,
      bdo: c,
      big: c,
      blockquote: {
        attrs: {
          cite: null
        }
      },
      body: c,
      br: c,
      button: {
        attrs: {
          form: null,
          formaction: null,
          name: null,
          value: null,
          autofocus: ["", "autofocus"],
          disabled: ["", "autofocus"],
          formenctype: a,
          formmethod: l,
          formnovalidate: ["", "novalidate"],
          formtarget: i,
          type: ["submit", "reset", "button"]
        }
      },
      canvas: {
        attrs: {
          width: null,
          height: null
        }
      },
      caption: c,
      center: c,
      cite: c,
      code: c,
      col: {
        attrs: {
          span: null
        }
      },
      colgroup: {
        attrs: {
          span: null
        }
      },
      command: {
        attrs: {
          type: ["command", "checkbox", "radio"],
          label: null,
          icon: null,
          radiogroup: null,
          command: null,
          title: null,
          disabled: ["", "disabled"],
          checked: ["", "checked"]
        }
      },
      data: {
        attrs: {
          value: null
        }
      },
      datagrid: {
        attrs: {
          disabled: ["", "disabled"],
          multiple: ["", "multiple"]
        }
      },
      datalist: {
        attrs: {
          data: null
        }
      },
      dd: c,
      del: {
        attrs: {
          cite: null,
          datetime: null
        }
      },
      details: {
        attrs: {
          open: ["", "open"]
        }
      },
      dfn: c,
      dir: c,
      div: c,
      dl: c,
      dt: c,
      em: c,
      embed: {
        attrs: {
          src: null,
          type: null,
          width: null,
          height: null
        }
      },
      eventsource: {
        attrs: {
          src: null
        }
      },
      fieldset: {
        attrs: {
          disabled: ["", "disabled"],
          form: null,
          name: null
        }
      },
      figcaption: c,
      figure: c,
      font: c,
      footer: c,
      form: {
        attrs: {
          action: null,
          name: null,
          "accept-charset": o,
          autocomplete: ["on", "off"],
          enctype: a,
          method: l,
          novalidate: ["", "novalidate"],
          target: i
        }
      },
      frame: c,
      frameset: c,
      h1: c,
      h2: c,
      h3: c,
      h4: c,
      h5: c,
      h6: c,
      head: {
        attrs: {},
        children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
      },
      header: c,
      hgroup: c,
      hr: c,
      html: {
        attrs: {
          manifest: null
        },
        children: ["head", "body"]
      },
      i: c,
      iframe: {
        attrs: {
          src: null,
          srcdoc: null,
          name: null,
          width: null,
          height: null,
          sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
          seamless: ["", "seamless"]
        }
      },
      img: {
        attrs: {
          alt: null,
          src: null,
          ismap: null,
          usemap: null,
          width: null,
          height: null,
          crossorigin: ["anonymous", "use-credentials"]
        }
      },
      input: {
        attrs: {
          alt: null,
          dirname: null,
          form: null,
          formaction: null,
          height: null,
          list: null,
          max: null,
          maxlength: null,
          min: null,
          name: null,
          pattern: null,
          placeholder: null,
          size: null,
          src: null,
          step: null,
          value: null,
          width: null,
          accept: ["audio/*", "video/*", "image/*"],
          autocomplete: ["on", "off"],
          autofocus: ["", "autofocus"],
          checked: ["", "checked"],
          disabled: ["", "disabled"],
          formenctype: a,
          formmethod: l,
          formnovalidate: ["", "novalidate"],
          formtarget: i,
          multiple: ["", "multiple"],
          readonly: ["", "readonly"],
          required: ["", "required"],
          type: ["hidden", "text", "search", "tel", "url", "email", "password", "datetime", "date", "month", "week", "time", "datetime-local", "number", "range", "color", "checkbox", "radio", "file", "submit", "image", "reset", "button"]
        }
      },
      ins: {
        attrs: {
          cite: null,
          datetime: null
        }
      },
      kbd: c,
      keygen: {
        attrs: {
          challenge: null,
          form: null,
          name: null,
          autofocus: ["", "autofocus"],
          disabled: ["", "disabled"],
          keytype: ["RSA"]
        }
      },
      label: {
        attrs: {
          "for": null,
          form: null
        }
      },
      legend: c,
      li: {
        attrs: {
          value: null
        }
      },
      link: {
        attrs: {
          href: null,
          type: null,
          hreflang: r,
          media: s,
          sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
        }
      },
      map: {
        attrs: {
          name: null
        }
      },
      mark: c,
      menu: {
        attrs: {
          label: null,
          type: ["list", "context", "toolbar"]
        }
      },
      meta: {
        attrs: {
          content: null,
          charset: o,
          name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
          "http-equiv": ["content-language", "content-type", "default-style", "refresh"]
        }
      },
      meter: {
        attrs: {
          value: null,
          min: null,
          low: null,
          high: null,
          max: null,
          optimum: null
        }
      },
      nav: c,
      noframes: c,
      noscript: c,
      object: {
        attrs: {
          data: null,
          type: null,
          name: null,
          usemap: null,
          form: null,
          width: null,
          height: null,
          typemustmatch: ["", "typemustmatch"]
        }
      },
      ol: {
        attrs: {
          reversed: ["", "reversed"],
          start: null,
          type: ["1", "a", "A", "i", "I"]
        }
      },
      optgroup: {
        attrs: {
          disabled: ["", "disabled"],
          label: null
        }
      },
      option: {
        attrs: {
          disabled: ["", "disabled"],
          label: null,
          selected: ["", "selected"],
          value: null
        }
      },
      output: {
        attrs: {
          "for": null,
          form: null,
          name: null
        }
      },
      p: c,
      param: {
        attrs: {
          name: null,
          value: null
        }
      },
      pre: c,
      progress: {
        attrs: {
          value: null,
          max: null
        }
      },
      q: {
        attrs: {
          cite: null
        }
      },
      rp: c,
      rt: c,
      ruby: c,
      s: c,
      samp: c,
      script: {
        attrs: {
          type: ["text/javascript"],
          src: null,
          async: ["", "async"],
          defer: ["", "defer"],
          charset: o
        }
      },
      section: c,
      select: {
        attrs: {
          form: null,
          name: null,
          size: null,
          autofocus: ["", "autofocus"],
          disabled: ["", "disabled"],
          multiple: ["", "multiple"]
        }
      },
      small: c,
      source: {
        attrs: {
          src: null,
          type: null,
          media: null
        }
      },
      span: c,
      strike: c,
      strong: c,
      style: {
        attrs: {
          type: ["text/css"],
          media: s,
          scoped: null
        }
      },
      sub: c,
      summary: c,
      sup: c,
      table: c,
      tbody: c,
      td: {
        attrs: {
          colspan: null,
          rowspan: null,
          headers: null
        }
      },
      textarea: {
        attrs: {
          dirname: null,
          form: null,
          maxlength: null,
          name: null,
          placeholder: null,
          rows: null,
          cols: null,
          autofocus: ["", "autofocus"],
          disabled: ["", "disabled"],
          readonly: ["", "readonly"],
          required: ["", "required"],
          wrap: ["soft", "hard"]
        }
      },
      tfoot: c,
      th: {
        attrs: {
          colspan: null,
          rowspan: null,
          headers: null,
          scope: ["row", "col", "rowgroup", "colgroup"]
        }
      },
      thead: c,
      time: {
        attrs: {
          datetime: null
        }
      },
      title: c,
      tr: c,
      track: {
        attrs: {
          src: null,
          label: null,
          "default": null,
          kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
          srclang: r
        }
      },
      tt: c,
      u: c,
      ul: c,
      "var": c,
      video: {
        attrs: {
          src: null,
          poster: null,
          width: null,
          height: null,
          crossorigin: ["anonymous", "use-credentials"],
          preload: ["auto", "metadata", "none"],
          autoplay: ["", "autoplay"],
          mediagroup: ["movie"],
          muted: ["", "muted"],
          controls: ["", "controls"]
        }
      },
      wbr: c
    },
    f = {
      accesskey: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      "class": null,
      contenteditable: ["true", "false"],
      contextmenu: null,
      dir: ["ltr", "rtl", "auto"],
      draggable: ["true", "false", "auto"],
      dropzone: ["copy", "move", "link", "string:", "file:"],
      hidden: ["hidden"],
      id: null,
      inert: ["inert"],
      itemid: null,
      itemprop: null,
      itemref: null,
      itemscope: ["itemscope"],
      itemtype: null,
      lang: ["en", "es"],
      spellcheck: ["true", "false"],
      style: null,
      tabindex: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      title: null,
      translate: ["yes", "no"],
      onclick: null,
      rel: ["stylesheet", "alternate", "author", "bookmark", "help", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"]
    };
  t(c);
  for (var d in u) u.hasOwnProperty(d) && u[d] != c && t(u[d]);
  e.htmlSchema = u, e.registerHelper("hint", "html", n)
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(t, r) {
    var i = r && r.schemaInfo,
      o = r && r.quoteChar || '"';
    if (i) {
      var l = t.getCursor(),
        a = t.getTokenAt(l);
      a.end > l.ch && (a.end = l.ch, a.string = a.string.slice(0, l.ch - a.start));
      var s = e.innerMode(t.getMode(), a.state);
      if ("xml" == s.mode.name) {
        var c, u, f = [],
          d = !1,
          h = /\btag\b/.test(a.type) && !/>$/.test(a.string),
          p = h && /^\w/.test(a.string);
        if (p) {
          var g = t.getLine(l.line).slice(Math.max(0, a.start - 2), a.start),
            m = /<\/$/.test(g) ? "close" : /<$/.test(g) ? "open" : null;
          m && (u = a.start - ("close" == m ? 2 : 1))
        } else h && "<" == a.string ? m = "open" : h && "</" == a.string && (m = "close");
        if (!h && !s.state.tagName || m) {
          p && (c = a.string), d = m;
          var v = s.state.context,
            y = v && i[v.tagName],
            b = v ? y && y.children : i["!top"];
          if (b && "close" != m)
            for (var x = 0; x < b.length; ++x) c && 0 != b[x].lastIndexOf(c, 0) || f.push("<" + b[x]);
          else if ("close" != m)
            for (var w in i) !i.hasOwnProperty(w) || "!top" == w || "!attrs" == w || c && 0 != w.lastIndexOf(c, 0) || f.push("<" + w);
          v && (!c || "close" == m && 0 == v.tagName.lastIndexOf(c, 0)) && f.push("</" + v.tagName + ">")
        } else {
          var y = i[s.state.tagName],
            C = y && y.attrs,
            k = i["!attrs"];
          if (!C && !k) return;
          if (C) {
            if (k) {
              var S = {};
              for (var L in k) k.hasOwnProperty(L) && (S[L] = k[L]);
              for (var L in C) C.hasOwnProperty(L) && (S[L] = C[L]);
              C = S
            }
          } else C = k;
          if ("string" == a.type || "=" == a.string) {
            var T, g = t.getRange(n(l.line, Math.max(0, l.ch - 60)), n(l.line, "string" == a.type ? a.start : a.end)),
              M = g.match(/([^\s\u00a0=<>\"\']+)=$/);
            if (!M || !C.hasOwnProperty(M[1]) || !(T = C[M[1]])) return;
            if ("function" == typeof T && (T = T.call(this, t)), "string" == a.type) {
              c = a.string;
              var O = 0;
              /['"]/.test(a.string.charAt(0)) && (o = a.string.charAt(0), c = a.string.slice(1), O++);
              var N = a.string.length;
              /['"]/.test(a.string.charAt(N - 1)) && (o = a.string.charAt(N - 1), c = a.string.substr(O, N - 2)), d = !0
            }
            for (var x = 0; x < T.length; ++x) c && 0 != T[x].lastIndexOf(c, 0) || f.push(o + T[x] + o)
          } else {
            "attribute" == a.type && (c = a.string, d = !0);
            for (var A in C) !C.hasOwnProperty(A) || c && 0 != A.lastIndexOf(c, 0) || f.push(A)
          }
        }
        return {
          list: f,
          from: d ? n(l.line, null == u ? a.start : u) : l,
          to: d ? n(l.line, a.end) : l
        }
      }
    }
  }
  var n = e.Pos;
  e.registerHelper("hint", "xml", t)
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t, n) {
    var r = e.docs[t];
    r ? n(P(e, r)) : e.options.getFile ? e.options.getFile(t, n) : n(null)
  }

  function n(e, t, n) {
    for (var r in e.docs) {
      var i = e.docs[r];
      if (i.doc == t) return i
    }
    if (!n)
      for (var o = 0;; ++o)
        if (r = "[doc" + (o || "") + "]", !e.docs[r]) {
          n = r;
          break
        } return e.addDoc(n, t)
  }

  function r(t, r) {
    return "string" == typeof r ? t.docs[r] : (r instanceof e && (r = r.getDoc()), r instanceof e.Doc ? n(t, r) : void 0)
  }

  function i(e, t, r) {
    var i = n(e, t),
      l = e.cachedArgHints;
    l && l.doc == t && I(l.start, r.to) >= 0 && (e.cachedArgHints = null);
    var a = i.changed;
    null == a && (i.changed = a = {
      from: r.from.line,
      to: r.from.line
    });
    var s = r.from.line + (r.text.length - 1);
    r.from.line < a.to && (a.to = a.to - (r.to.line - s)), s >= a.to && (a.to = s + 1), a.from > r.from.line && (a.from = r.from.line), t.lineCount() > W && r.to - a.from > 100 && setTimeout(function() {
      i.changed && i.changed.to - i.changed.from > 100 && o(e, i)
    }, 200)
  }

  function o(e, t) {
    e.server.request({
      files: [{
        type: "full",
        name: t.name,
        text: P(e, t)
      }]
    }, function(e) {
      e ? window.console.error(e) : t.changed = null
    })
  }

  function l(t, n, r) {
    t.request(n, {
      type: "completions",
      types: !0,
      docs: !0,
      urls: !0
    }, function(i, o) {
      if (i) return N(t, n, i);
      var l = [],
        s = "",
        c = o.start,
        u = o.end;
      '["' == n.getRange(H(c.line, c.ch - 2), c) && '"]' != n.getRange(u, H(u.line, u.ch + 2)) && (s = '"]');
      for (var f = 0; f < o.completions.length; ++f) {
        var d = o.completions[f],
          h = a(d.type);
        o.guess && (h += " " + F + "guess"), l.push({
          text: d.name + s,
          displayText: d.displayName || d.name,
          className: h,
          data: d
        })
      }
      var p = {
          from: c,
          to: u,
          list: l
        },
        g = null;
      e.on(p, "close", function() {
        M(g)
      }), e.on(p, "update", function() {
        M(g)
      }), e.on(p, "select", function(e, n) {
        M(g);
        var r = t.options.completionTip ? t.options.completionTip(e.data) : e.data.doc;
        r && (g = T(n.parentNode.getBoundingClientRect().right + window.pageXOffset, n.getBoundingClientRect().top + window.pageYOffset, r), g.className += " " + F + "hint-doc")
      }), r(p)
    })
  }

  function a(e) {
    var t;
    return t = "?" == e ? "unknown" : "number" == e || "string" == e || "bool" == e ? e : /^fn\(/.test(e) ? "fn" : /^\[/.test(e) ? "array" : "object", F + "completion " + F + "completion-" + t
  }

  function s(e, t, n, r, i) {
    e.request(t, r, function(n, r) {
      if (n) return N(e, t, n);
      if (e.options.typeTip) var o = e.options.typeTip(r);
      else {
        var o = C("span", null, C("strong", null, r.type || "not found"));
        if (r.doc && o.appendChild(document.createTextNode(" — " + r.doc)), r.url) {
          o.appendChild(document.createTextNode(" "));
          var l = o.appendChild(C("a", null, "[docs]"));
          l.href = r.url, l.target = "_blank"
        }
      }
      S(t, o, e), i && i()
    }, n)
  }

  function c(t, n) {
    if (A(t), !n.somethingSelected()) {
      var r = n.getTokenAt(n.getCursor()).state,
        i = e.innerMode(n.getMode(), r);
      if ("javascript" == i.mode.name) {
        var o = i.state.lexical;
        if ("call" == o.info) {
          for (var l, a = o.pos || 0, s = n.getOption("tabSize"), c = n.getCursor().line, d = Math.max(0, c - 9), h = !1; c >= d; --c) {
            for (var p = n.getLine(c), g = 0, m = 0;;) {
              var v = p.indexOf("\t", m);
              if (v == -1) break;
              g += s - (v + g) % s - 1, m = v + 1
            }
            if (l = o.column - g, "(" == p.charAt(l)) {
              h = !0;
              break
            }
          }
          if (h) {
            var y = H(c, l),
              b = t.cachedArgHints;
            return b && b.doc == n.getDoc() && 0 == I(y, b.start) ? u(t, n, a) : void t.request(n, {
              type: "type",
              preferFunction: !0,
              end: y
            }, function(e, r) {
              !e && r.type && /^fn\(/.test(r.type) && (t.cachedArgHints = {
                start: y,
                type: f(r.type),
                name: r.exprName || r.name || "fn",
                guess: r.guess,
                doc: n.getDoc()
              }, u(t, n, a))
            })
          }
        }
      }
    }
  }

  function u(e, t, n) {
    A(e);
    for (var r = e.cachedArgHints, i = r.type, o = C("span", r.guess ? F + "fhint-guess" : null, C("span", F + "fname", r.name), "("), l = 0; l < i.args.length; ++l) {
      l && o.appendChild(document.createTextNode(", "));
      var a = i.args[l];
      o.appendChild(C("span", F + "farg" + (l == n ? " " + F + "farg-current" : ""), a.name || "?")), "?" != a.type && (o.appendChild(document.createTextNode(": ")), o.appendChild(C("span", F + "type", a.type)))
    }
    o.appendChild(document.createTextNode(i.rettype ? ") -> " : ")")), i.rettype && o.appendChild(C("span", F + "type", i.rettype));
    var s = t.cursorCoords(null, "page"),
      c = e.activeArgHints = T(s.right + 1, s.bottom, o);
    setTimeout(function() {
      c.clear = L(t, function() {
        e.activeArgHints == c && A(e)
      })
    }, 20)
  }

  function f(e) {
    function t(t) {
      for (var n = 0, i = r;;) {
        var o = e.charAt(r);
        if (t.test(o) && !n) return e.slice(i, r);
        /[{\[\(]/.test(o) ? ++n : /[}\]\)]/.test(o) && --n, ++r
      }
    }
    var n = [],
      r = 3;
    if (")" != e.charAt(r))
      for (;;) {
        var i = e.slice(r).match(/^([^, \(\[\{]+): /);
        if (i && (r += i[0].length, i = i[1]), n.push({
            name: i,
            type: t(/[\),]/)
          }), ")" == e.charAt(r)) break;
        r += 2
      }
    var o = e.slice(r).match(/^\) -> (.*)$/);
    return {
      args: n,
      rettype: o && o[1]
    }
  }

  function d(e, t) {
    function r(r) {
      var i = {
          type: "definition",
          variable: r || null
        },
        o = n(e, t.getDoc());
      e.server.request(x(e, o, i), function(n, r) {
        if (n) return N(e, t, n);
        if (!r.file && r.url) return void window.open(r.url);
        if (r.file) {
          var i, l = e.docs[r.file];
          if (l && (i = g(l.doc, r))) return e.jumpStack.push({
            file: o.name,
            start: t.getCursor("from"),
            end: t.getCursor("to")
          }), void p(e, o, l, i.start, i.end)
        }
        N(e, t, "Could not find a definition.")
      })
    }
    m(t) ? r() : k(t, "Jump to variable", function(e) {
      e && r(e)
    })
  }

  function h(e, t) {
    var r = e.jumpStack.pop(),
      i = r && e.docs[r.file];
    i && p(e, n(e, t.getDoc()), i, r.start, r.end)
  }

  function p(e, t, n, r, i) {
    n.doc.setSelection(r, i), t != n && e.options.switchToDoc && (A(e), e.options.switchToDoc(n.name, n.doc))
  }

  function g(e, t) {
    for (var n = t.context.slice(0, t.contextOffset).split("\n"), r = t.start.line - (n.length - 1), i = H(r, (1 == n.length ? t.start.ch : e.getLine(r).length) - n[0].length), o = e.getLine(r).slice(i.ch), l = r + 1; l < e.lineCount() && o.length < t.context.length; ++l) o += "\n" + e.getLine(l);
    if (o.slice(0, t.context.length) == t.context) return t;
    for (var a, s = e.getSearchCursor(t.context, 0, !1), c = 1 / 0; s.findNext();) {
      var u = s.from(),
        f = 1e4 * Math.abs(u.line - i.line);
      f || (f = Math.abs(u.ch - i.ch)), f < c && (a = u, c = f)
    }
    if (!a) return null;
    if (1 == n.length ? a.ch += n[0].length : a = H(a.line + (n.length - 1), n[n.length - 1].length), t.start.line == t.end.line) var d = H(a.line, a.ch + (t.end.ch - t.start.ch));
    else var d = H(a.line + (t.end.line - t.start.line), t.end.ch);
    return {
      start: a,
      end: d
    }
  }

  function m(e) {
    var t = e.getCursor("end"),
      n = e.getTokenAt(t);
    return !(n.start < t.ch && "comment" == n.type) && /[\w)\]]/.test(e.getLine(t.line).slice(Math.max(t.ch - 1, 0), t.ch + 1))
  }

  function v(e, t) {
    var n = t.getTokenAt(t.getCursor());
    return /\w/.test(n.string) ? void k(t, "New name for " + n.string, function(n) {
      e.request(t, {
        type: "rename",
        newName: n,
        fullDocs: !0
      }, function(n, r) {
        return n ? N(e, t, n) : void b(e, r.changes)
      })
    }) : N(e, t, "Not at a variable")
  }

  function y(e, t) {
    var r = n(e, t.doc).name;
    e.request(t, {
      type: "refs"
    }, function(n, i) {
      if (n) return N(e, t, n);
      for (var o = [], l = 0, a = t.getCursor(), s = 0; s < i.refs.length; s++) {
        var c = i.refs[s];
        c.file == r && (o.push({
          anchor: c.start,
          head: c.end
        }), I(a, c.start) >= 0 && I(a, c.end) <= 0 && (l = o.length - 1))
      }
      t.setSelections(o, l)
    })
  }

  function b(e, t) {
    for (var n = Object.create(null), r = 0; r < t.length; ++r) {
      var i = t[r];
      (n[i.file] || (n[i.file] = [])).push(i)
    }
    for (var o in n) {
      var l = e.docs[o],
        a = n[o];
      if (l) {
        a.sort(function(e, t) {
          return I(t.start, e.start)
        });
        for (var s = "*rename" + ++E, r = 0; r < a.length; ++r) {
          var i = a[r];
          l.doc.replaceRange(i.text, i.start, i.end, s)
        }
      }
    }
  }

  function x(e, t, n, r) {
    var i = [],
      o = 0,
      l = !n.fullDocs;
    l || delete n.fullDocs, "string" == typeof n && (n = {
      type: n
    }), n.lineCharPositions = !0, null == n.end && (n.end = r || t.doc.getCursor("end"), t.doc.somethingSelected() && (n.start = t.doc.getCursor("start")));
    var a = n.start || n.end;
    if (t.changed)
      if (t.doc.lineCount() > W && l !== !1 && t.changed.to - t.changed.from < 100 && t.changed.from <= a.line && t.changed.to > n.end.line) {
        i.push(w(t, a, n.end)), n.file = "#0";
        var o = i[0].offsetLines;
        null != n.start && (n.start = H(n.start.line - -o, n.start.ch)), n.end = H(n.end.line - o, n.end.ch)
      } else i.push({
        type: "full",
        name: t.name,
        text: P(e, t)
      }), n.file = t.name, t.changed = null;
    else n.file = t.name;
    for (var s in e.docs) {
      var c = e.docs[s];
      c.changed && c != t && (i.push({
        type: "full",
        name: c.name,
        text: P(e, c)
      }), c.changed = null)
    }
    return {
      query: n,
      files: i
    }
  }

  function w(t, n, r) {
    for (var i, o = t.doc, l = null, a = null, s = 4, c = n.line - 1, u = Math.max(0, c - 50); c >= u; --c) {
      var f = o.getLine(c),
        d = f.search(/\bfunction\b/);
      if (!(d < 0)) {
        var h = e.countColumn(f, null, s);
        null != l && l <= h || (l = h, a = c)
      }
    }
    null == a && (a = u);
    var p = Math.min(o.lastLine(), r.line + 20);
    if (null == l || l == e.countColumn(o.getLine(n.line), null, s)) i = p;
    else
      for (i = r.line + 1; i < p; ++i) {
        var h = e.countColumn(o.getLine(i), null, s);
        if (h <= l) break
      }
    var g = H(a, 0);
    return {
      type: "part",
      name: t.name,
      offsetLines: g.line,
      text: o.getRange(g, H(i, r.line == i ? null : 0))
    }
  }

  function C(e, t) {
    var n = document.createElement(e);
    t && (n.className = t);
    for (var r = 2; r < arguments.length; ++r) {
      var i = arguments[r];
      "string" == typeof i && (i = document.createTextNode(i)), n.appendChild(i)
    }
    return n
  }

  function k(e, t, n) {
    e.openDialog ? e.openDialog(t + ": <input type=text>", n) : n(prompt(t, ""))
  }

  function S(t, n, r) {
    function i() {
      c = !0, s || o()
    }

    function o() {
      t.state.ternTooltip = null, a.parentNode && O(a), u()
    }
    t.state.ternTooltip && M(t.state.ternTooltip);
    var l = t.cursorCoords(),
      a = t.state.ternTooltip = T(l.right + 1, l.bottom, n),
      s = !1,
      c = !1;
    e.on(a, "mousemove", function() {
      s = !0
    }), e.on(a, "mouseout", function(t) {
      var n = t.relatedTarget || t.toElement;
      n && e.contains(a, n) || (c ? o() : s = !1)
    }), setTimeout(i, r.options.hintDelay ? r.options.hintDelay : 1700);
    var u = L(t, o)
  }

  function L(e, t) {
    return e.on("cursorActivity", t), e.on("blur", t), e.on("scroll", t), e.on("setDoc", t),
      function() {
        e.off("cursorActivity", t), e.off("blur", t), e.off("scroll", t), e.off("setDoc", t)
      }
  }

  function T(e, t, n) {
    var r = C("div", F + "tooltip", n);
    return r.style.left = e + "px", r.style.top = t + "px", document.body.appendChild(r), r
  }

  function M(e) {
    var t = e && e.parentNode;
    t && t.removeChild(e)
  }

  function O(e) {
    e.style.opacity = "0", setTimeout(function() {
      M(e)
    }, 1100)
  }

  function N(e, t, n) {
    e.options.showError ? e.options.showError(t, n) : S(t, String(n), e)
  }

  function A(e) {
    e.activeArgHints && (e.activeArgHints.clear && e.activeArgHints.clear(), M(e.activeArgHints), e.activeArgHints = null)
  }

  function P(e, t) {
    var n = t.doc.getValue();
    return e.options.fileFilter && (n = e.options.fileFilter(n, t.name, t.doc)), n
  }

  function D(e) {
    function n(e, t) {
      t && (e.id = ++i, o[i] = t), r.postMessage(e)
    }
    var r = e.worker = new Worker(e.options.workerScript);
    r.postMessage({
      type: "init",
      defs: e.options.defs,
      plugins: e.options.plugins,
      scripts: e.options.workerDeps
    });
    var i = 0,
      o = {};
    r.onmessage = function(r) {
      var i = r.data;
      "getFile" == i.type ? t(e, i.name, function(e, t) {
        n({
          type: "getFile",
          err: String(e),
          text: t,
          id: i.id
        })
      }) : "debug" == i.type ? window.console.log(i.message) : i.id && o[i.id] && (o[i.id](i.err, i.body), delete o[i.id])
    }, r.onerror = function(e) {
      for (var t in o) o[t](e);
      o = {}
    }, this.addFile = function(e, t) {
      n({
        type: "add",
        name: e,
        text: t
      })
    }, this.delFile = function(e) {
      n({
        type: "del",
        name: e
      })
    }, this.request = function(e, t) {
      n({
        type: "req",
        body: e
      }, t)
    }
  }
  e.TernServer = function(e) {
    var n = this;
    this.options = e || {};
    var r = this.options.plugins || (this.options.plugins = {});
    r.doc_comment || (r.doc_comment = !0), this.docs = Object.create(null), this.options.useWorker ? this.server = new D(this) : this.server = new tern.Server({
      getFile: function(e, r) {
        return t(n, e, r)
      },
      async: !0,
      defs: this.options.defs || [],
      plugins: r
    }), this.trackChange = function(e, t) {
      i(n, e, t)
    }, this.cachedArgHints = null, this.activeArgHints = null, this.jumpStack = [], this.getHint = function(e, t) {
      return l(n, e, t)
    }, this.getHint.async = !0
  }, e.TernServer.prototype = {
    addDoc: function(t, n) {
      var r = {
        doc: n,
        name: t,
        changed: null
      };
      return this.server.addFile(t, P(this, r)), e.on(n, "change", this.trackChange), this.docs[t] = r
    },
    delDoc: function(t) {
      var n = r(this, t);
      n && (e.off(n.doc, "change", this.trackChange), delete this.docs[n.name], this.server.delFile(n.name))
    },
    hideDoc: function(e) {
      A(this);
      var t = r(this, e);
      t && t.changed && o(this, t)
    },
    complete: function(e) {
      e.showHint({
        hint: this.getHint
      })
    },
    showType: function(e, t, n) {
      s(this, e, t, "type", n)
    },
    showDocs: function(e, t, n) {
      s(this, e, t, "documentation", n)
    },
    updateArgHints: function(e) {
      c(this, e)
    },
    jumpToDef: function(e) {
      d(this, e)
    },
    jumpBack: function(e) {
      h(this, e)
    },
    rename: function(e) {
      v(this, e)
    },
    selectName: function(e) {
      y(this, e)
    },
    request: function(e, t, r, i) {
      var o = this,
        l = n(this, e.getDoc()),
        a = x(this, l, t, i),
        s = a.query && this.options.queryOptions && this.options.queryOptions[a.query.type];
      if (s)
        for (var c in s) a.query[c] = s[c];
      this.server.request(a, function(e, n) {
        !e && o.options.responseFilter && (n = o.options.responseFilter(l, t, a, e, n)), r(e, n)
      })
    },
    destroy: function() {
      A(this), this.worker && (this.worker.terminate(), this.worker = null)
    }
  };
  var H = e.Pos,
    F = "CodeMirror-Tern-",
    W = 250,
    E = 0,
    I = e.cmpPos
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t) {
    this.cm = e, this.options = t, this.widget = null, this.debounce = 0, this.tick = 0, this.startPos = this.cm.getCursor("start"), this.startLen = this.cm.getLine(this.startPos.line).length - this.cm.getSelection().length;
    var n = this;
    e.on("cursorActivity", this.activityFunc = function() {
      n.cursorActivity()
    })
  }

  function n(e, t, n) {
    var r = e.options.hintOptions,
      i = {};
    for (var o in p) i[o] = p[o];
    if (r)
      for (var o in r) void 0 !== r[o] && (i[o] = r[o]);
    if (n)
      for (var o in n) void 0 !== n[o] && (i[o] = n[o]);
    return i.hint.resolve && (i.hint = i.hint.resolve(e, t)), i
  }

  function r(e) {
    return "string" == typeof e ? e : e.text
  }

  function i(e, t) {
    function n(e, n) {
      var i;
      i = "string" != typeof n ? function(e) {
        return n(e, t)
      } : r.hasOwnProperty(n) ? r[n] : n, o[e] = i
    }
    var r = {
        Up: function() {
          t.moveFocus(-1)
        },
        Down: function() {
          t.moveFocus(1)
        },
        PageUp: function() {
          t.moveFocus(-t.menuSize() + 1, !0)
        },
        PageDown: function() {
          t.moveFocus(t.menuSize() - 1, !0)
        },
        Home: function() {
          t.setFocus(0)
        },
        End: function() {
          t.setFocus(t.length - 1)
        },
        Enter: t.pick,
        Tab: t.pick,
        Esc: t.close
      },
      i = e.options.customKeys,
      o = i ? {} : r;
    if (i)
      for (var l in i) i.hasOwnProperty(l) && n(l, i[l]);
    var a = e.options.extraKeys;
    if (a)
      for (var l in a) a.hasOwnProperty(l) && n(l, a[l]);
    return o
  }

  function o(e, t) {
    for (; t && t != e;) {
      if ("LI" === t.nodeName.toUpperCase() && t.parentNode == e) return t;
      t = t.parentNode
    }
  }

  function l(t, n) {
    this.completion = t, this.data = n, this.picked = !1;
    var l = this,
      a = t.cm,
      s = this.hints = document.createElement("ul");
    s.className = "CodeMirror-hints", this.selectedHint = n.selectedHint || 0;
    for (var c = n.list, d = 0; d < c.length; ++d) {
      var h = s.appendChild(document.createElement("li")),
        p = c[d],
        g = u + (d != this.selectedHint ? "" : " " + f);
      null != p.className && (g = p.className + " " + g), h.className = g, p.render ? p.render(h, n, p) : h.appendChild(document.createTextNode(p.displayText || r(p))), h.hintId = d
    }
    var m = a.cursorCoords(t.options.alignWithWord ? n.from : null),
      v = m.left,
      y = m.bottom,
      b = !0;
    s.style.left = v + "px", s.style.top = y + "px";
    var x = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
      w = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
    (t.options.container || document.body).appendChild(s);
    var C = s.getBoundingClientRect(),
      k = C.bottom - w,
      S = s.scrollHeight > s.clientHeight + 1,
      L = a.getScrollInfo();
    if (k > 0) {
      var T = C.bottom - C.top,
        M = m.top - (m.bottom - C.top);
      if (M - T > 0) s.style.top = (y = m.top - T) + "px", b = !1;
      else if (T > w) {
        s.style.height = w - 5 + "px", s.style.top = (y = m.bottom - C.top) + "px";
        var O = a.getCursor();
        n.from.ch != O.ch && (m = a.cursorCoords(O), s.style.left = (v = m.left) + "px", C = s.getBoundingClientRect())
      }
    }
    var N = C.right - x;
    if (N > 0 && (C.right - C.left > x && (s.style.width = x - 5 + "px", N -= C.right - C.left - x), s.style.left = (v = m.left - N) + "px"), S)
      for (var A = s.firstChild; A; A = A.nextSibling) A.style.paddingRight = a.display.nativeBarWidth + "px";
    if (a.addKeyMap(this.keyMap = i(t, {
        moveFocus: function(e, t) {
          l.changeActive(l.selectedHint + e, t)
        },
        setFocus: function(e) {
          l.changeActive(e)
        },
        menuSize: function() {
          return l.screenAmount()
        },
        length: c.length,
        close: function() {
          t.close()
        },
        pick: function() {
          l.pick()
        },
        data: n
      })), t.options.closeOnUnfocus) {
      var P;
      a.on("blur", this.onBlur = function() {
        P = setTimeout(function() {
          t.close()
        }, 100)
      }), a.on("focus", this.onFocus = function() {
        clearTimeout(P)
      })
    }
    return a.on("scroll", this.onScroll = function() {
      var e = a.getScrollInfo(),
        n = a.getWrapperElement().getBoundingClientRect(),
        r = y + L.top - e.top,
        i = r - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
      return b || (i += s.offsetHeight), i <= n.top || i >= n.bottom ? t.close() : (s.style.top = r + "px", void(s.style.left = v + L.left - e.left + "px"))
    }), e.on(s, "dblclick", function(e) {
      var t = o(s, e.target || e.srcElement);
      t && null != t.hintId && (l.changeActive(t.hintId), l.pick())
    }), e.on(s, "click", function(e) {
      var n = o(s, e.target || e.srcElement);
      n && null != n.hintId && (l.changeActive(n.hintId), t.options.completeOnSingleClick && l.pick())
    }), e.on(s, "mousedown", function() {
      setTimeout(function() {
        a.focus()
      }, 20)
    }), e.signal(n, "select", c[this.selectedHint], s.childNodes[this.selectedHint]), !0
  }

  function a(e, t) {
    if (!e.somethingSelected()) return t;
    for (var n = [], r = 0; r < t.length; r++) t[r].supportsSelection && n.push(t[r]);
    return n
  }

  function s(e, t, n, r) {
    if (e.async) e(t, r, n);
    else {
      var i = e(t, n);
      i && i.then ? i.then(r) : r(i)
    }
  }

  function c(t, n) {
    var r, i = t.getHelpers(n, "hint");
    if (i.length) {
      var o = function(e, t, n) {
        function r(i) {
          return i == o.length ? t(null) : void s(o[i], e, n, function(e) {
            e && e.list.length > 0 ? t(e) : r(i + 1)
          })
        }
        var o = a(e, i);
        r(0)
      };
      return o.async = !0, o.supportsSelection = !0, o
    }
    return (r = t.getHelper(t.getCursor(), "hintWords")) ? function(t) {
      return e.hint.fromList(t, {
        words: r
      })
    } : e.hint.anyword ? function(t, n) {
      return e.hint.anyword(t, n)
    } : function() {}
  }
  var u = "CodeMirror-hint",
    f = "CodeMirror-hint-active";
  e.showHint = function(e, t, n) {
    if (!t) return e.showHint(n);
    n && n.async && (t.async = !0);
    var r = {
      hint: t
    };
    if (n)
      for (var i in n) r[i] = n[i];
    return e.showHint(r)
  }, e.defineExtension("showHint", function(r) {
    r = n(this, this.getCursor("start"), r);
    var i = this.listSelections();
    if (!(i.length > 1)) {
      if (this.somethingSelected()) {
        if (!r.hint.supportsSelection) return;
        for (var o = 0; o < i.length; o++)
          if (i[o].head.line != i[o].anchor.line) return
      }
      this.state.completionActive && this.state.completionActive.close();
      var l = this.state.completionActive = new t(this, r);
      l.options.hint && (e.signal(this, "startCompletion", this), l.update(!0))
    }
  });
  var d = window.requestAnimationFrame || function(e) {
      return setTimeout(e, 1e3 / 60)
    },
    h = window.cancelAnimationFrame || clearTimeout;
  t.prototype = {
    close: function() {
      this.active() && (this.cm.state.completionActive = null, this.tick = null, this.cm.off("cursorActivity", this.activityFunc), this.widget && this.data && e.signal(this.data, "close"), this.widget && this.widget.close(), e.signal(this.cm, "endCompletion", this.cm))
    },
    active: function() {
      return this.cm.state.completionActive == this
    },
    pick: function(t, n) {
      var i = t.list[n];
      i.hint ? i.hint(this.cm, t, i) : this.cm.replaceRange(r(i), i.from || t.from, i.to || t.to, "complete"), e.signal(t, "pick", i), this.close()
    },
    cursorActivity: function() {
      this.debounce && (h(this.debounce), this.debounce = 0);
      var e = this.cm.getCursor(),
        t = this.cm.getLine(e.line);
      if (e.line != this.startPos.line || t.length - e.ch != this.startLen - this.startPos.ch || e.ch < this.startPos.ch || this.cm.somethingSelected() || e.ch && this.options.closeCharacters.test(t.charAt(e.ch - 1))) this.close();
      else {
        var n = this;
        this.debounce = d(function() {
          n.update()
        }), this.widget && this.widget.disable()
      }
    },
    update: function(e) {
      if (null != this.tick) {
        var t = this,
          n = ++this.tick;
        s(this.options.hint, this.cm, this.options, function(r) {
          t.tick == n && t.finishUpdate(r, e)
        })
      }
    },
    finishUpdate: function(t, n) {
      this.data && e.signal(this.data, "update");
      var r = this.widget && this.widget.picked || n && this.options.completeSingle;
      this.widget && this.widget.close(), this.data = t, t && t.list.length && (r && 1 == t.list.length ? this.pick(t, 0) : (this.widget = new l(this, t), e.signal(t, "shown")))
    }
  }, l.prototype = {
    close: function() {
      if (this.completion.widget == this) {
        this.completion.widget = null, this.hints.parentNode.removeChild(this.hints), this.completion.cm.removeKeyMap(this.keyMap);
        var e = this.completion.cm;
        this.completion.options.closeOnUnfocus && (e.off("blur", this.onBlur), e.off("focus", this.onFocus)), e.off("scroll", this.onScroll)
      }
    },
    disable: function() {
      this.completion.cm.removeKeyMap(this.keyMap);
      var e = this;
      this.keyMap = {
        Enter: function() {
          e.picked = !0
        }
      }, this.completion.cm.addKeyMap(this.keyMap)
    },
    pick: function() {
      this.completion.pick(this.data, this.selectedHint)
    },
    changeActive: function(t, n) {
      if (t >= this.data.list.length ? t = n ? this.data.list.length - 1 : 0 : t < 0 && (t = n ? 0 : this.data.list.length - 1), this.selectedHint != t) {
        var r = this.hints.childNodes[this.selectedHint];
        r && (r.className = r.className.replace(" " + f, "")), r = this.hints.childNodes[this.selectedHint = t], r.className += " " + f, r.offsetTop < this.hints.scrollTop ? this.hints.scrollTop = r.offsetTop - 3 : r.offsetTop + r.offsetHeight > this.hints.scrollTop + this.hints.clientHeight && (this.hints.scrollTop = r.offsetTop + r.offsetHeight - this.hints.clientHeight + 3), e.signal(this.data, "select", this.data.list[this.selectedHint], r)
      }
    },
    screenAmount: function() {
      return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1
    }
  }, e.registerHelper("hint", "auto", {
    resolve: c
  }), e.registerHelper("hint", "fromList", function(t, n) {
    var r, i = t.getCursor(),
      o = t.getTokenAt(i),
      l = e.Pos(i.line, o.start),
      a = i;
    o.start < i.ch && /\w/.test(o.string.charAt(i.ch - o.start - 1)) ? r = o.string.substr(0, i.ch - o.start) : (r = "", l = i);
    for (var s = [], c = 0; c < n.words.length; c++) {
      var u = n.words[c];
      u.slice(0, r.length) == r && s.push(u)
    }
    if (s.length) return {
      list: s,
      from: l,
      to: a
    }
  }), e.commands.autocomplete = e.showHint;
  var p = {
    hint: e.hint.auto,
    completeSingle: !0,
    alignWithWord: !0,
    closeCharacters: /[\s()\[\]{};:>,]/,
    closeOnUnfocus: !0,
    completeOnSingleClick: !0,
    container: null,
    customKeys: null,
    extraKeys: null
  };
  e.defineOption("hintOptions", null)
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    var t = e.search(o);
    return t == -1 ? 0 : t
  }

  function n(e, t, n) {
    return /\bstring\b/.test(e.getTokenTypeAt(l(t.line, 0))) && !/^[\'\"\`]/.test(n)
  }

  function r(e, t) {
    var n = e.getMode();
    return n.useInnerComments !== !1 && n.innerMode ? e.getModeAt(t) : n
  }
  var i = {},
    o = /[^\s\u00a0]/,
    l = e.Pos;
  e.commands.toggleComment = function(e) {
    e.toggleComment()
  }, e.defineExtension("toggleComment", function(e) {
    e || (e = i);
    for (var t = this, n = 1 / 0, r = this.listSelections(), o = null, a = r.length - 1; a >= 0; a--) {
      var s = r[a].from(),
        c = r[a].to();
      s.line >= n || (c.line >= n && (c = l(n, 0)), n = s.line, null == o ? t.uncomment(s, c, e) ? o = "un" : (t.lineComment(s, c, e), o = "line") : "un" == o ? t.uncomment(s, c, e) : t.lineComment(s, c, e))
    }
  }), e.defineExtension("lineComment", function(e, a, s) {
    s || (s = i);
    var c = this,
      u = r(c, e),
      f = c.getLine(e.line);
    if (null != f && !n(c, e, f)) {
      var d = s.lineComment || u.lineComment;
      if (!d) return void((s.blockCommentStart || u.blockCommentStart) && (s.fullLines = !0, c.blockComment(e, a, s)));
      var h = Math.min(0 != a.ch || a.line == e.line ? a.line + 1 : a.line, c.lastLine() + 1),
        p = null == s.padding ? " " : s.padding,
        g = s.commentBlankLines || e.line == a.line;
      c.operation(function() {
        if (s.indent) {
          for (var n = null, r = e.line; r < h; ++r) {
            var i = c.getLine(r),
              a = i.slice(0, t(i));
            (null == n || n.length > a.length) && (n = a)
          }
          for (var r = e.line; r < h; ++r) {
            var i = c.getLine(r),
              u = n.length;
            (g || o.test(i)) && (i.slice(0, u) != n && (u = t(i)), c.replaceRange(n + d + p, l(r, 0), l(r, u)))
          }
        } else
          for (var r = e.line; r < h; ++r)(g || o.test(c.getLine(r))) && c.replaceRange(d + p, l(r, 0))
      })
    }
  }), e.defineExtension("blockComment", function(e, t, n) {
    n || (n = i);
    var a = this,
      s = r(a, e),
      c = n.blockCommentStart || s.blockCommentStart,
      u = n.blockCommentEnd || s.blockCommentEnd;
    if (!c || !u) return void((n.lineComment || s.lineComment) && 0 != n.fullLines && a.lineComment(e, t, n));
    if (!/\bcomment\b/.test(a.getTokenTypeAt(l(e.line, 0)))) {
      var f = Math.min(t.line, a.lastLine());
      f != e.line && 0 == t.ch && o.test(a.getLine(f)) && --f;
      var d = null == n.padding ? " " : n.padding;
      e.line > f || a.operation(function() {
        if (0 != n.fullLines) {
          var r = o.test(a.getLine(f));
          a.replaceRange(d + u, l(f)), a.replaceRange(c + d, l(e.line, 0));
          var i = n.blockCommentLead || s.blockCommentLead;
          if (null != i)
            for (var h = e.line + 1; h <= f; ++h)(h != f || r) && a.replaceRange(i + d, l(h, 0))
        } else a.replaceRange(u, t), a.replaceRange(c, e)
      })
    }
  }), e.defineExtension("uncomment", function(e, t, n) {
    n || (n = i);
    var a, s = this,
      c = r(s, e),
      u = Math.min(0 != t.ch || t.line == e.line ? t.line : t.line - 1, s.lastLine()),
      f = Math.min(e.line, u),
      d = n.lineComment || c.lineComment,
      h = [],
      p = null == n.padding ? " " : n.padding;
    e: if (d) {
      for (var g = f; g <= u; ++g) {
        var m = s.getLine(g),
          v = m.indexOf(d);
        if (v > -1 && !/comment/.test(s.getTokenTypeAt(l(g, v + 1))) && (v = -1), v == -1 && o.test(m)) break e;
        if (v > -1 && o.test(m.slice(0, v))) break e;
        h.push(m)
      }
      if (s.operation(function() {
          for (var e = f; e <= u; ++e) {
            var t = h[e - f],
              n = t.indexOf(d),
              r = n + d.length;
            n < 0 || (t.slice(r, r + p.length) == p && (r += p.length), a = !0, s.replaceRange("", l(e, n), l(e, r)))
          }
        }), a) return !0
    }
    var y = n.blockCommentStart || c.blockCommentStart,
      b = n.blockCommentEnd || c.blockCommentEnd;
    if (!y || !b) return !1;
    var x = n.blockCommentLead || c.blockCommentLead,
      w = s.getLine(f),
      C = w.indexOf(y);
    if (C == -1) return !1;
    var k = u == f ? w : s.getLine(u),
      S = k.indexOf(b, u == f ? C + y.length : 0),
      L = l(f, C + 1),
      T = l(u, S + 1);
    if (S == -1 || !/comment/.test(s.getTokenTypeAt(L)) || !/comment/.test(s.getTokenTypeAt(T)) || s.getRange(L, T, "\n").indexOf(b) > -1) return !1;
    var M = w.lastIndexOf(y, e.ch),
      O = M == -1 ? -1 : w.slice(0, e.ch).indexOf(b, M + y.length);
    if (M != -1 && O != -1 && O + b.length != e.ch) return !1;
    O = k.indexOf(b, t.ch);
    var N = k.slice(t.ch).lastIndexOf(y, O - t.ch);
    return M = O == -1 || N == -1 ? -1 : t.ch + N, (O == -1 || M == -1 || M == t.ch) && (s.operation(function() {
      s.replaceRange("", l(u, S - (p && k.slice(S - p.length, S) == p ? p.length : 0)), l(u, S + b.length));
      var e = C + y.length;
      if (p && w.slice(e, e + p.length) == p && (e += p.length), s.replaceRange("", l(f, C), l(f, e)), x)
        for (var t = f + 1; t <= u; ++t) {
          var n = s.getLine(t),
            r = n.indexOf(x);
          if (r != -1 && !o.test(n.slice(0, r))) {
            var i = r + x.length;
            p && n.slice(i, i + p.length) == p && (i += p.length), s.replaceRange("", l(t, r), l(t, i))
          }
        }
    }), !0)
  })
});
/*! RESOURCE: /scripts/snc-code-editor/js-beautify.js */
(function() {
  var legacy_beautify_js =
    (function(modules) {
      var installedModules = {};

      function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
          return installedModules[moduleId].exports;
        }
        var module = installedModules[moduleId] = {
          i: moduleId,
          l: false,
          exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = true;
        return module.exports;
      }
      __webpack_require__.m = modules;
      __webpack_require__.c = installedModules;
      __webpack_require__.d = function(exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
          Object.defineProperty(exports, name, {
            enumerable: true,
            get: getter
          });
        }
      };
      __webpack_require__.r = function(exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module'
          });
        }
        Object.defineProperty(exports, '__esModule', {
          value: true
        });
      };
      __webpack_require__.t = function(value, mode) {
        if (mode & 1) value = __webpack_require__(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        var ns = Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, 'default', {
          enumerable: true,
          value: value
        });
        if (mode & 2 && typeof value != 'string')
          for (var key in value) __webpack_require__.d(ns, key, function(key) {
            return value[key];
          }.bind(null, key));
        return ns;
      };
      __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ?
          function getDefault() {
            return module['default'];
          } :
          function getModuleExports() {
            return module;
          };
        __webpack_require__.d(getter, 'a', getter);
        return getter;
      };
      __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      __webpack_require__.p = "";
      return __webpack_require__(__webpack_require__.s = 0);
    })
    ([
      (function(module, exports, __webpack_require__) {
        "use strict";
        var Beautifier = __webpack_require__(1).Beautifier,
          Options = __webpack_require__(5).Options;

        function js_beautify(js_source_text, options) {
          var beautifier = new Beautifier(js_source_text, options);
          return beautifier.beautify();
        }
        module.exports = js_beautify;
        module.exports.defaultOptions = function() {
          return new Options();
        };
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";
        var Output = __webpack_require__(2).Output;
        var Token = __webpack_require__(3).Token;
        var acorn = __webpack_require__(4);
        var Options = __webpack_require__(5).Options;
        var Tokenizer = __webpack_require__(7).Tokenizer;
        var line_starters = __webpack_require__(7).line_starters;
        var positionable_operators = __webpack_require__(7).positionable_operators;
        var TOKEN = __webpack_require__(7).TOKEN;

        function remove_redundant_indentation(output, frame) {
          if (frame.multiline_frame ||
            frame.mode === MODE.ForInitializer ||
            frame.mode === MODE.Conditional) {
            return;
          }
          output.remove_indent(frame.start_line_index);
        }

        function in_array(what, arr) {
          return arr.indexOf(what) !== -1;
        }

        function ltrim(s) {
          return s.replace(/^\s+/g, '');
        }

        function generateMapFromStrings(list) {
          var result = {};
          for (var x = 0; x < list.length; x++) {
            result[list[x].replace(/-/g, '_')] = list[x];
          }
          return result;
        }

        function reserved_word(token, word) {
          return token && token.type === TOKEN.RESERVED && token.text === word;
        }

        function reserved_array(token, words) {
          return token && token.type === TOKEN.RESERVED && in_array(token.text, words);
        }
        var special_words = ['case', 'return', 'do', 'if', 'throw', 'else', 'await', 'break', 'continue', 'async'];
        var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];
        var OPERATOR_POSITION = generateMapFromStrings(validPositionValues);
        var OPERATOR_POSITION_BEFORE_OR_PRESERVE = [OPERATOR_POSITION.before_newline, OPERATOR_POSITION.preserve_newline];
        var MODE = {
          BlockStatement: 'BlockStatement',
          Statement: 'Statement',
          ObjectLiteral: 'ObjectLiteral',
          ArrayLiteral: 'ArrayLiteral',
          ForInitializer: 'ForInitializer',
          Conditional: 'Conditional',
          Expression: 'Expression'
        };

        function split_linebreaks(s) {
          s = s.replace(acorn.allLineBreaks, '\n');
          var out = [],
            idx = s.indexOf("\n");
          while (idx !== -1) {
            out.push(s.substring(0, idx));
            s = s.substring(idx + 1);
            idx = s.indexOf("\n");
          }
          if (s.length) {
            out.push(s);
          }
          return out;
        }

        function is_array(mode) {
          return mode === MODE.ArrayLiteral;
        }

        function is_expression(mode) {
          return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
        }

        function all_lines_start_with(lines, c) {
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.charAt(0) !== c) {
              return false;
            }
          }
          return true;
        }

        function each_line_matches_indent(lines, indent) {
          var i = 0,
            len = lines.length,
            line;
          for (; i < len; i++) {
            line = lines[i];
            if (line && line.indexOf(indent) !== 0) {
              return false;
            }
          }
          return true;
        }

        function Beautifier(source_text, options) {
          options = options || {};
          this._source_text = source_text || '';
          this._output = null;
          this._tokens = null;
          this._last_last_text = null;
          this._flags = null;
          this._previous_flags = null;
          this._flag_store = null;
          this._options = new Options(options);
        }
        Beautifier.prototype.create_flags = function(flags_base, mode) {
          var next_indent_level = 0;
          if (flags_base) {
            next_indent_level = flags_base.indentation_level;
            if (!this._output.just_added_newline() &&
              flags_base.line_indent_level > next_indent_level) {
              next_indent_level = flags_base.line_indent_level;
            }
          }
          var next_flags = {
            mode: mode,
            parent: flags_base,
            last_token: flags_base ? flags_base.last_token : new Token(TOKEN.START_BLOCK, ''),
            last_word: flags_base ? flags_base.last_word : '',
            declaration_statement: false,
            declaration_assignment: false,
            multiline_frame: false,
            inline_frame: false,
            if_block: false,
            else_block: false,
            do_block: false,
            do_while: false,
            import_block: false,
            in_case_statement: false,
            in_case: false,
            case_body: false,
            indentation_level: next_indent_level,
            line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
            start_line_index: this._output.get_line_number(),
            ternary_depth: 0
          };
          return next_flags;
        };
        Beautifier.prototype._reset = function(source_text) {
          var baseIndentString = source_text.match(/^[\t ]*/)[0];
          this._last_last_text = '';
          this._output = new Output(this._options, baseIndentString);
          this._output.raw = this._options.test_output_raw;
          this._flag_store = [];
          this.set_mode(MODE.BlockStatement);
          var tokenizer = new Tokenizer(source_text, this._options);
          this._tokens = tokenizer.tokenize();
          return source_text;
        };
        Beautifier.prototype.beautify = function() {
          if (this._options.disabled) {
            return this._source_text;
          }
          var sweet_code;
          var source_text = this._reset(this._source_text);
          var eol = this._options.eol;
          if (this._options.eol === 'auto') {
            eol = '\n';
            if (source_text && acorn.lineBreak.test(source_text || '')) {
              eol = source_text.match(acorn.lineBreak)[0];
            }
          }
          var current_token = this._tokens.next();
          while (current_token) {
            this.handle_token(current_token);
            this._last_last_text = this._flags.last_token.text;
            this._flags.last_token = current_token;
            current_token = this._tokens.next();
          }
          sweet_code = this._output.get_code(eol);
          return sweet_code;
        };
        Beautifier.prototype.handle_token = function(current_token, preserve_statement_flags) {
          if (current_token.type === TOKEN.START_EXPR) {
            this.handle_start_expr(current_token);
          } else if (current_token.type === TOKEN.END_EXPR) {
            this.handle_end_expr(current_token);
          } else if (current_token.type === TOKEN.START_BLOCK) {
            this.handle_start_block(current_token);
          } else if (current_token.type === TOKEN.END_BLOCK) {
            this.handle_end_block(current_token);
          } else if (current_token.type === TOKEN.WORD) {
            this.handle_word(current_token);
          } else if (current_token.type === TOKEN.RESERVED) {
            this.handle_word(current_token);
          } else if (current_token.type === TOKEN.SEMICOLON) {
            this.handle_semicolon(current_token);
          } else if (current_token.type === TOKEN.STRING) {
            this.handle_string(current_token);
          } else if (current_token.type === TOKEN.EQUALS) {
            this.handle_equals(current_token);
          } else if (current_token.type === TOKEN.OPERATOR) {
            this.handle_operator(current_token);
          } else if (current_token.type === TOKEN.COMMA) {
            this.handle_comma(current_token);
          } else if (current_token.type === TOKEN.BLOCK_COMMENT) {
            this.handle_block_comment(current_token, preserve_statement_flags);
          } else if (current_token.type === TOKEN.COMMENT) {
            this.handle_comment(current_token, preserve_statement_flags);
          } else if (current_token.type === TOKEN.DOT) {
            this.handle_dot(current_token);
          } else if (current_token.type === TOKEN.EOF) {
            this.handle_eof(current_token);
          } else if (current_token.type === TOKEN.UNKNOWN) {
            this.handle_unknown(current_token, preserve_statement_flags);
          } else {
            this.handle_unknown(current_token, preserve_statement_flags);
          }
        };
        Beautifier.prototype.handle_whitespace_and_comments = function(current_token, preserve_statement_flags) {
          var newlines = current_token.newlines;
          var keep_whitespace = this._options.keep_array_indentation && is_array(this._flags.mode);
          if (current_token.comments_before) {
            var comment_token = current_token.comments_before.next();
            while (comment_token) {
              this.handle_whitespace_and_comments(comment_token, preserve_statement_flags);
              this.handle_token(comment_token, preserve_statement_flags);
              comment_token = current_token.comments_before.next();
            }
          }
          if (keep_whitespace) {
            for (var i = 0; i < newlines; i += 1) {
              this.print_newline(i > 0, preserve_statement_flags);
            }
          } else {
            if (this._options.max_preserve_newlines && newlines > this._options.max_preserve_newlines) {
              newlines = this._options.max_preserve_newlines;
            }
            if (this._options.preserve_newlines) {
              if (newlines > 1) {
                this.print_newline(false, preserve_statement_flags);
                for (var j = 1; j < newlines; j += 1) {
                  this.print_newline(true, preserve_statement_flags);
                }
              }
            }
          }
        };
        var newline_restricted_tokens = ['async', 'break', 'continue', 'return', 'throw', 'yield'];
        Beautifier.prototype.allow_wrap_or_preserved_newline = function(current_token, force_linewrap) {
          force_linewrap = (force_linewrap === undefined) ? false : force_linewrap;
          if (this._output.just_added_newline()) {
            return;
          }
          var shouldPreserveOrForce = (this._options.preserve_newlines && current_token.newlines) || force_linewrap;
          var operatorLogicApplies = in_array(this._flags.last_token.text, positionable_operators) ||
            in_array(current_token.text, positionable_operators);
          if (operatorLogicApplies) {
            var shouldPrintOperatorNewline = (
                in_array(this._flags.last_token.text, positionable_operators) &&
                in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)
              ) ||
              in_array(current_token.text, positionable_operators);
            shouldPreserveOrForce = shouldPreserveOrForce && shouldPrintOperatorNewline;
          }
          if (shouldPreserveOrForce) {
            this.print_newline(false, true);
          } else if (this._options.wrap_line_length) {
            if (reserved_array(this._flags.last_token, newline_restricted_tokens)) {
              return;
            }
            var proposed_line_length = this._output.current_line.get_character_count() + current_token.text.length +
              (this._output.space_before_token ? 1 : 0);
            if (proposed_line_length >= this._options.wrap_line_length) {
              this.print_newline(false, true);
            }
          }
        };
        Beautifier.prototype.print_newline = function(force_newline, preserve_statement_flags) {
          if (!preserve_statement_flags) {
            if (this._flags.last_token.text !== ';' && this._flags.last_token.text !== ',' && this._flags.last_token.text !== '=' && (this._flags.last_token.type !== TOKEN.OPERATOR || this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) {
              var next_token = this._tokens.peek();
              while (this._flags.mode === MODE.Statement &&
                !(this._flags.if_block && reserved_word(next_token, 'else')) &&
                !this._flags.do_block) {
                this.restore_mode();
              }
            }
          }
          if (this._output.add_new_line(force_newline)) {
            this._flags.multiline_frame = true;
          }
        };
        Beautifier.prototype.print_token_line_indentation = function(current_token) {
          if (this._output.just_added_newline()) {
            if (this._options.keep_array_indentation && is_array(this._flags.mode) && current_token.newlines) {
              this._output.current_line.push(current_token.whitespace_before);
              this._output.space_before_token = false;
            } else if (this._output.set_indent(this._flags.indentation_level)) {
              this._flags.line_indent_level = this._flags.indentation_level;
            }
          }
        };
        Beautifier.prototype.print_token = function(current_token, printable_token) {
          if (this._output.raw) {
            this._output.add_raw_token(current_token);
            return;
          }
          if (this._options.comma_first && current_token.previous && current_token.previous.type === TOKEN.COMMA &&
            this._output.just_added_newline()) {
            if (this._output.previous_line.last() === ',') {
              var popped = this._output.previous_line.pop();
              if (this._output.previous_line.is_empty()) {
                this._output.previous_line.push(popped);
                this._output.trim(true);
                this._output.current_line.pop();
                this._output.trim();
              }
              this.print_token_line_indentation(current_token);
              this._output.add_token(',');
              this._output.space_before_token = true;
            }
          }
          printable_token = printable_token || current_token.text;
          this.print_token_line_indentation(current_token);
          this._output.add_token(printable_token);
        };
        Beautifier.prototype.indent = function() {
          this._flags.indentation_level += 1;
        };
        Beautifier.prototype.deindent = function() {
          if (this._flags.indentation_level > 0 &&
            ((!this._flags.parent) || this._flags.indentation_level > this._flags.parent.indentation_level)) {
            this._flags.indentation_level -= 1;
          }
        };
        Beautifier.prototype.set_mode = function(mode) {
          if (this._flags) {
            this._flag_store.push(this._flags);
            this._previous_flags = this._flags;
          } else {
            this._previous_flags = this.create_flags(null, mode);
          }
          this._flags = this.create_flags(this._previous_flags, mode);
        };
        Beautifier.prototype.restore_mode = function() {
          if (this._flag_store.length > 0) {
            this._previous_flags = this._flags;
            this._flags = this._flag_store.pop();
            if (this._previous_flags.mode === MODE.Statement) {
              remove_redundant_indentation(this._output, this._previous_flags);
            }
          }
        };
        Beautifier.prototype.start_of_object_property = function() {
          return this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement && (
            (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || (reserved_array(this._flags.last_token, ['get', 'set'])));
        };
        Beautifier.prototype.start_of_statement = function(current_token) {
          var start = false;
          start = start || reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD;
          start = start || reserved_word(this._flags.last_token, 'do');
          start = start || (!(this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement)) && reserved_array(this._flags.last_token, newline_restricted_tokens) && !current_token.newlines;
          start = start || reserved_word(this._flags.last_token, 'else') &&
            !(reserved_word(current_token, 'if') && !current_token.comments_before);
          start = start || (this._flags.last_token.type === TOKEN.END_EXPR && (this._previous_flags.mode === MODE.ForInitializer || this._previous_flags.mode === MODE.Conditional));
          start = start || (this._flags.last_token.type === TOKEN.WORD && this._flags.mode === MODE.BlockStatement &&
            !this._flags.in_case &&
            !(current_token.text === '--' || current_token.text === '++') &&
            this._last_last_text !== 'function' &&
            current_token.type !== TOKEN.WORD && current_token.type !== TOKEN.RESERVED);
          start = start || (this._flags.mode === MODE.ObjectLiteral && (
            (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || reserved_array(this._flags.last_token, ['get', 'set'])));
          if (start) {
            this.set_mode(MODE.Statement);
            this.indent();
            this.handle_whitespace_and_comments(current_token, true);
            if (!this.start_of_object_property()) {
              this.allow_wrap_or_preserved_newline(current_token,
                reserved_array(current_token, ['do', 'for', 'if', 'while']));
            }
            return true;
          }
          return false;
        };
        Beautifier.prototype.handle_start_expr = function(current_token) {
          if (!this.start_of_statement(current_token)) {
            this.handle_whitespace_and_comments(current_token);
          }
          var next_mode = MODE.Expression;
          if (current_token.text === '[') {
            if (this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === ')') {
              if (reserved_array(this._flags.last_token, line_starters)) {
                this._output.space_before_token = true;
              }
              this.set_mode(next_mode);
              this.print_token(current_token);
              this.indent();
              if (this._options.space_in_paren) {
                this._output.space_before_token = true;
              }
              return;
            }
            next_mode = MODE.ArrayLiteral;
            if (is_array(this._flags.mode)) {
              if (this._flags.last_token.text === '[' ||
                (this._flags.last_token.text === ',' && (this._last_last_text === ']' || this._last_last_text === '}'))) {
                if (!this._options.keep_array_indentation) {
                  this.print_newline();
                }
              }
            }
            if (!in_array(this._flags.last_token.type, [TOKEN.START_EXPR, TOKEN.END_EXPR, TOKEN.WORD, TOKEN.OPERATOR])) {
              this._output.space_before_token = true;
            }
          } else {
            if (this._flags.last_token.type === TOKEN.RESERVED) {
              if (this._flags.last_token.text === 'for') {
                this._output.space_before_token = this._options.space_before_conditional;
                next_mode = MODE.ForInitializer;
              } else if (in_array(this._flags.last_token.text, ['if', 'while'])) {
                this._output.space_before_token = this._options.space_before_conditional;
                next_mode = MODE.Conditional;
              } else if (in_array(this._flags.last_word, ['await', 'async'])) {
                this._output.space_before_token = true;
              } else if (this._flags.last_token.text === 'import' && current_token.whitespace_before === '') {
                this._output.space_before_token = false;
              } else if (in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === 'catch') {
                this._output.space_before_token = true;
              }
            } else if (this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
              if (!this.start_of_object_property()) {
                this.allow_wrap_or_preserved_newline(current_token);
              }
            } else if (this._flags.last_token.type === TOKEN.WORD) {
              this._output.space_before_token = false;
              var peek_back_two = this._tokens.peek(-3);
              if (this._options.space_after_named_function && peek_back_two) {
                var peek_back_three = this._tokens.peek(-4);
                if (reserved_array(peek_back_two, ['async', 'function']) ||
                  (peek_back_two.text === '*' && reserved_array(peek_back_three, ['async', 'function']))) {
                  this._output.space_before_token = true;
                } else if (this._flags.mode === MODE.ObjectLiteral) {
                  if ((peek_back_two.text === '{' || peek_back_two.text === ',') ||
                    (peek_back_two.text === '*' && (peek_back_three.text === '{' || peek_back_three.text === ','))) {
                    this._output.space_before_token = true;
                  }
                }
              }
            } else {
              this.allow_wrap_or_preserved_newline(current_token);
            }
            if ((this._flags.last_token.type === TOKEN.RESERVED && (this._flags.last_word === 'function' || this._flags.last_word === 'typeof')) ||
              (this._flags.last_token.text === '*' &&
                (in_array(this._last_last_text, ['function', 'yield']) ||
                  (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
              this._output.space_before_token = this._options.space_after_anon_function;
            }
          }
          if (this._flags.last_token.text === ';' || this._flags.last_token.type === TOKEN.START_BLOCK) {
            this.print_newline();
          } else if (this._flags.last_token.type === TOKEN.END_EXPR || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.END_BLOCK || this._flags.last_token.text === '.' || this._flags.last_token.type === TOKEN.COMMA) {
            this.allow_wrap_or_preserved_newline(current_token, current_token.newlines);
          }
          this.set_mode(next_mode);
          this.print_token(current_token);
          if (this._options.space_in_paren) {
            this._output.space_before_token = true;
          }
          this.indent();
        };
        Beautifier.prototype.handle_end_expr = function(current_token) {
          while (this._flags.mode === MODE.Statement) {
            this.restore_mode();
          }
          this.handle_whitespace_and_comments(current_token);
          if (this._flags.multiline_frame) {
            this.allow_wrap_or_preserved_newline(current_token,
              current_token.text === ']' && is_array(this._flags.mode) && !this._options.keep_array_indentation);
          }
          if (this._options.space_in_paren) {
            if (this._flags.last_token.type === TOKEN.START_EXPR && !this._options.space_in_empty_paren) {
              this._output.trim();
              this._output.space_before_token = false;
            } else {
              this._output.space_before_token = true;
            }
          }
          if (current_token.text === ']' && this._options.keep_array_indentation) {
            this.print_token(current_token);
            this.restore_mode();
          } else {
            this.restore_mode();
            this.print_token(current_token);
          }
          remove_redundant_indentation(this._output, this._previous_flags);
          if (this._flags.do_while && this._previous_flags.mode === MODE.Conditional) {
            this._previous_flags.mode = MODE.Expression;
            this._flags.do_block = false;
            this._flags.do_while = false;
          }
        };
        Beautifier.prototype.handle_start_block = function(current_token) {
          this.handle_whitespace_and_comments(current_token);
          var next_token = this._tokens.peek();
          var second_token = this._tokens.peek(1);
          if (this._flags.last_word === 'switch' && this._flags.last_token.type === TOKEN.END_EXPR) {
            this.set_mode(MODE.BlockStatement);
            this._flags.in_case_statement = true;
          } else if (second_token && (
              (in_array(second_token.text, [':', ',']) && in_array(next_token.type, [TOKEN.STRING, TOKEN.WORD, TOKEN.RESERVED])) ||
              (in_array(next_token.text, ['get', 'set', '...']) && in_array(second_token.type, [TOKEN.WORD, TOKEN.RESERVED]))
            )) {
            if (!in_array(this._last_last_text, ['class', 'interface'])) {
              this.set_mode(MODE.ObjectLiteral);
            } else {
              this.set_mode(MODE.BlockStatement);
            }
          } else if (this._flags.last_token.type === TOKEN.OPERATOR && this._flags.last_token.text === '=>') {
            this.set_mode(MODE.BlockStatement);
          } else if (in_array(this._flags.last_token.type, [TOKEN.EQUALS, TOKEN.START_EXPR, TOKEN.COMMA, TOKEN.OPERATOR]) ||
            reserved_array(this._flags.last_token, ['return', 'throw', 'import', 'default'])
          ) {
            this.set_mode(MODE.ObjectLiteral);
          } else {
            this.set_mode(MODE.BlockStatement);
          }
          var empty_braces = !next_token.comments_before && next_token.text === '}';
          var empty_anonymous_function = empty_braces && this._flags.last_word === 'function' &&
            this._flags.last_token.type === TOKEN.END_EXPR;
          if (this._options.brace_preserve_inline) {
            var index = 0;
            var check_token = null;
            this._flags.inline_frame = true;
            do {
              index += 1;
              check_token = this._tokens.peek(index - 1);
              if (check_token.newlines) {
                this._flags.inline_frame = false;
                break;
              }
            } while (check_token.type !== TOKEN.EOF &&
              !(check_token.type === TOKEN.END_BLOCK && check_token.opened === current_token));
          }
          if ((this._options.brace_style === "expand" ||
              (this._options.brace_style === "none" && current_token.newlines)) &&
            !this._flags.inline_frame) {
            if (this._flags.last_token.type !== TOKEN.OPERATOR &&
              (empty_anonymous_function ||
                this._flags.last_token.type === TOKEN.EQUALS ||
                (reserved_array(this._flags.last_token, special_words) && this._flags.last_token.text !== 'else'))) {
              this._output.space_before_token = true;
            } else {
              this.print_newline(false, true);
            }
          } else {
            if (is_array(this._previous_flags.mode) && (this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.COMMA)) {
              if (this._flags.last_token.type === TOKEN.COMMA || this._options.space_in_paren) {
                this._output.space_before_token = true;
              }
              if (this._flags.last_token.type === TOKEN.COMMA || (this._flags.last_token.type === TOKEN.START_EXPR && this._flags.inline_frame)) {
                this.allow_wrap_or_preserved_newline(current_token);
                this._previous_flags.multiline_frame = this._previous_flags.multiline_frame || this._flags.multiline_frame;
                this._flags.multiline_frame = false;
              }
            }
            if (this._flags.last_token.type !== TOKEN.OPERATOR && this._flags.last_token.type !== TOKEN.START_EXPR) {
              if (this._flags.last_token.type === TOKEN.START_BLOCK && !this._flags.inline_frame) {
                this.print_newline();
              } else {
                this._output.space_before_token = true;
              }
            }
          }
          this.print_token(current_token);
          this.indent();
          if (!empty_braces && !(this._options.brace_preserve_inline && this._flags.inline_frame)) {
            this.print_newline();
          }
        };
        Beautifier.prototype.handle_end_block = function(current_token) {
          this.handle_whitespace_and_comments(current_token);
          while (this._flags.mode === MODE.Statement) {
            this.restore_mode();
          }
          var empty_braces = this._flags.last_token.type === TOKEN.START_BLOCK;
          if (this._flags.inline_frame && !empty_braces) {
            this._output.space_before_token = true;
          } else if (this._options.brace_style === "expand") {
            if (!empty_braces) {
              this.print_newline();
            }
          } else {
            if (!empty_braces) {
              if (is_array(this._flags.mode) && this._options.keep_array_indentation) {
                this._options.keep_array_indentation = false;
                this.print_newline();
                this._options.keep_array_indentation = true;
              } else {
                this.print_newline();
              }
            }
          }
          this.restore_mode();
          this.print_token(current_token);
        };
        Beautifier.prototype.handle_word = function(current_token) {
          if (current_token.type === TOKEN.RESERVED) {
            if (in_array(current_token.text, ['set', 'get']) && this._flags.mode !== MODE.ObjectLiteral) {
              current_token.type = TOKEN.WORD;
            } else if (current_token.text === 'import' && this._tokens.peek().text === '(') {
              current_token.type = TOKEN.WORD;
            } else if (in_array(current_token.text, ['as', 'from']) && !this._flags.import_block) {
              current_token.type = TOKEN.WORD;
            } else if (this._flags.mode === MODE.ObjectLiteral) {
              var next_token = this._tokens.peek();
              if (next_token.text === ':') {
                current_token.type = TOKEN.WORD;
              }
            }
          }
          if (this.start_of_statement(current_token)) {
            if (reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD) {
              this._flags.declaration_statement = true;
            }
          } else if (current_token.newlines && !is_expression(this._flags.mode) &&
            (this._flags.last_token.type !== TOKEN.OPERATOR || (this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) &&
            this._flags.last_token.type !== TOKEN.EQUALS &&
            (this._options.preserve_newlines || !reserved_array(this._flags.last_token, ['var', 'let', 'const', 'set', 'get']))) {
            this.handle_whitespace_and_comments(current_token);
            this.print_newline();
          } else {
            this.handle_whitespace_and_comments(current_token);
          }
          if (this._flags.do_block && !this._flags.do_while) {
            if (reserved_word(current_token, 'while')) {
              this._output.space_before_token = true;
              this.print_token(current_token);
              this._output.space_before_token = true;
              this._flags.do_while = true;
              return;
            } else {
              this.print_newline();
              this._flags.do_block = false;
            }
          }
          if (this._flags.if_block) {
            if (!this._flags.else_block && reserved_word(current_token, 'else')) {
              this._flags.else_block = true;
            } else {
              while (this._flags.mode === MODE.Statement) {
                this.restore_mode();
              }
              this._flags.if_block = false;
              this._flags.else_block = false;
            }
          }
          if (this._flags.in_case_statement && reserved_array(current_token, ['case', 'default'])) {
            this.print_newline();
            if (this._flags.case_body || this._options.jslint_happy) {
              this.deindent();
              this._flags.case_body = false;
            }
            this.print_token(current_token);
            this._flags.in_case = true;
            return;
          }
          if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
            if (!this.start_of_object_property()) {
              this.allow_wrap_or_preserved_newline(current_token);
            }
          }
          if (reserved_word(current_token, 'function')) {
            if (in_array(this._flags.last_token.text, ['}', ';']) ||
              (this._output.just_added_newline() && !(in_array(this._flags.last_token.text, ['(', '[', '{', ':', '=', ',']) || this._flags.last_token.type === TOKEN.OPERATOR))) {
              if (!this._output.just_added_blankline() && !current_token.comments_before) {
                this.print_newline();
                this.print_newline(true);
              }
            }
            if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD) {
              if (reserved_array(this._flags.last_token, ['get', 'set', 'new', 'export']) ||
                reserved_array(this._flags.last_token, newline_restricted_tokens)) {
                this._output.space_before_token = true;
              } else if (reserved_word(this._flags.last_token, 'default') && this._last_last_text === 'export') {
                this._output.space_before_token = true;
              } else if (this._flags.last_token.text === 'declare') {
                this._output.space_before_token = true;
              } else {
                this.print_newline();
              }
            } else if (this._flags.last_token.type === TOKEN.OPERATOR || this._flags.last_token.text === '=') {
              this._output.space_before_token = true;
            } else if (!this._flags.multiline_frame && (is_expression(this._flags.mode) || is_array(this._flags.mode))) {} else {
              this.print_newline();
            }
            this.print_token(current_token);
            this._flags.last_word = current_token.text;
            return;
          }
          var prefix = 'NONE';
          if (this._flags.last_token.type === TOKEN.END_BLOCK) {
            if (this._previous_flags.inline_frame) {
              prefix = 'SPACE';
            } else if (!reserved_array(current_token, ['else', 'catch', 'finally', 'from'])) {
              prefix = 'NEWLINE';
            } else {
              if (this._options.brace_style === "expand" ||
                this._options.brace_style === "end-expand" ||
                (this._options.brace_style === "none" && current_token.newlines)) {
                prefix = 'NEWLINE';
              } else {
                prefix = 'SPACE';
                this._output.space_before_token = true;
              }
            }
          } else if (this._flags.last_token.type === TOKEN.SEMICOLON && this._flags.mode === MODE.BlockStatement) {
            prefix = 'NEWLINE';
          } else if (this._flags.last_token.type === TOKEN.SEMICOLON && is_expression(this._flags.mode)) {
            prefix = 'SPACE';
          } else if (this._flags.last_token.type === TOKEN.STRING) {
            prefix = 'NEWLINE';
          } else if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD ||
            (this._flags.last_token.text === '*' &&
              (in_array(this._last_last_text, ['function', 'yield']) ||
                (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
            prefix = 'SPACE';
          } else if (this._flags.last_token.type === TOKEN.START_BLOCK) {
            if (this._flags.inline_frame) {
              prefix = 'SPACE';
            } else {
              prefix = 'NEWLINE';
            }
          } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
            this._output.space_before_token = true;
            prefix = 'NEWLINE';
          }
          if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
            if (this._flags.inline_frame || this._flags.last_token.text === 'else' || this._flags.last_token.text === 'export') {
              prefix = 'SPACE';
            } else {
              prefix = 'NEWLINE';
            }
          }
          if (reserved_array(current_token, ['else', 'catch', 'finally'])) {
            if ((!(this._flags.last_token.type === TOKEN.END_BLOCK && this._previous_flags.mode === MODE.BlockStatement) ||
                this._options.brace_style === "expand" ||
                this._options.brace_style === "end-expand" ||
                (this._options.brace_style === "none" && current_token.newlines)) &&
              !this._flags.inline_frame) {
              this.print_newline();
            } else {
              this._output.trim(true);
              var line = this._output.current_line;
              if (line.last() !== '}') {
                this.print_newline();
              }
              this._output.space_before_token = true;
            }
          } else if (prefix === 'NEWLINE') {
            if (reserved_array(this._flags.last_token, special_words)) {
              this._output.space_before_token = true;
            } else if (this._flags.last_token.text === 'declare' && reserved_array(current_token, ['var', 'let', 'const'])) {
              this._output.space_before_token = true;
            } else if (this._flags.last_token.type !== TOKEN.END_EXPR) {
              if ((this._flags.last_token.type !== TOKEN.START_EXPR || !reserved_array(current_token, ['var', 'let', 'const'])) && this._flags.last_token.text !== ':') {
                if (reserved_word(current_token, 'if') && reserved_word(current_token.previous, 'else')) {
                  this._output.space_before_token = true;
                } else {
                  this.print_newline();
                }
              }
            } else if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
              this.print_newline();
            }
          } else if (this._flags.multiline_frame && is_array(this._flags.mode) && this._flags.last_token.text === ',' && this._last_last_text === '}') {
            this.print_newline();
          } else if (prefix === 'SPACE') {
            this._output.space_before_token = true;
          }
          if (current_token.previous && (current_token.previous.type === TOKEN.WORD || current_token.previous.type === TOKEN.RESERVED)) {
            this._output.space_before_token = true;
          }
          this.print_token(current_token);
          this._flags.last_word = current_token.text;
          if (current_token.type === TOKEN.RESERVED) {
            if (current_token.text === 'do') {
              this._flags.do_block = true;
            } else if (current_token.text === 'if') {
              this._flags.if_block = true;
            } else if (current_token.text === 'import') {
              this._flags.import_block = true;
            } else if (this._flags.import_block && reserved_word(current_token, 'from')) {
              this._flags.import_block = false;
            }
          }
        };
        Beautifier.prototype.handle_semicolon = function(current_token) {
          if (this.start_of_statement(current_token)) {
            this._output.space_before_token = false;
          } else {
            this.handle_whitespace_and_comments(current_token);
          }
          var next_token = this._tokens.peek();
          while (this._flags.mode === MODE.Statement &&
            !(this._flags.if_block && reserved_word(next_token, 'else')) &&
            !this._flags.do_block) {
            this.restore_mode();
          }
          if (this._flags.import_block) {
            this._flags.import_block = false;
          }
          this.print_token(current_token);
        };
        Beautifier.prototype.handle_string = function(current_token) {
          if (this.start_of_statement(current_token)) {
            this._output.space_before_token = true;
          } else {
            this.handle_whitespace_and_comments(current_token);
            if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.inline_frame) {
              this._output.space_before_token = true;
            } else if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
              if (!this.start_of_object_property()) {
                this.allow_wrap_or_preserved_newline(current_token);
              }
            } else {
              this.print_newline();
            }
          }
          this.print_token(current_token);
        };
        Beautifier.prototype.handle_equals = function(current_token) {
          if (this.start_of_statement(current_token)) {} else {
            this.handle_whitespace_and_comments(current_token);
          }
          if (this._flags.declaration_statement) {
            this._flags.declaration_assignment = true;
          }
          this._output.space_before_token = true;
          this.print_token(current_token);
          this._output.space_before_token = true;
        };
        Beautifier.prototype.handle_comma = function(current_token) {
          this.handle_whitespace_and_comments(current_token, true);
          this.print_token(current_token);
          this._output.space_before_token = true;
          if (this._flags.declaration_statement) {
            if (is_expression(this._flags.parent.mode)) {
              this._flags.declaration_assignment = false;
            }
            if (this._flags.declaration_assignment) {
              this._flags.declaration_assignment = false;
              this.print_newline(false, true);
            } else if (this._options.comma_first) {
              this.allow_wrap_or_preserved_newline(current_token);
            }
          } else if (this._flags.mode === MODE.ObjectLiteral ||
            (this._flags.mode === MODE.Statement && this._flags.parent.mode === MODE.ObjectLiteral)) {
            if (this._flags.mode === MODE.Statement) {
              this.restore_mode();
            }
            if (!this._flags.inline_frame) {
              this.print_newline();
            }
          } else if (this._options.comma_first) {
            this.allow_wrap_or_preserved_newline(current_token);
          }
        };
        Beautifier.prototype.handle_operator = function(current_token) {
          var isGeneratorAsterisk = current_token.text === '*' &&
            (reserved_array(this._flags.last_token, ['function', 'yield']) ||
              (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.COMMA, TOKEN.END_BLOCK, TOKEN.SEMICOLON]))
            );
          var isUnary = in_array(current_token.text, ['-', '+']) && (
            in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.START_EXPR, TOKEN.EQUALS, TOKEN.OPERATOR]) ||
            in_array(this._flags.last_token.text, line_starters) ||
            this._flags.last_token.text === ','
          );
          if (this.start_of_statement(current_token)) {} else {
            var preserve_statement_flags = !isGeneratorAsterisk;
            this.handle_whitespace_and_comments(current_token, preserve_statement_flags);
          }
          if (reserved_array(this._flags.last_token, special_words)) {
            this._output.space_before_token = true;
            this.print_token(current_token);
            return;
          }
          if (current_token.text === '*' && this._flags.last_token.type === TOKEN.DOT) {
            this.print_token(current_token);
            return;
          }
          if (current_token.text === '::') {
            this.print_token(current_token);
            return;
          }
          if (this._flags.last_token.type === TOKEN.OPERATOR && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)) {
            this.allow_wrap_or_preserved_newline(current_token);
          }
          if (current_token.text === ':' && this._flags.in_case) {
            this._flags.case_body = true;
            this.indent();
            this.print_token(current_token);
            this.print_newline();
            this._flags.in_case = false;
            return;
          }
          var space_before = true;
          var space_after = true;
          var in_ternary = false;
          if (current_token.text === ':') {
            if (this._flags.ternary_depth === 0) {
              space_before = false;
            } else {
              this._flags.ternary_depth -= 1;
              in_ternary = true;
            }
          } else if (current_token.text === '?') {
            this._flags.ternary_depth += 1;
          }
          if (!isUnary && !isGeneratorAsterisk && this._options.preserve_newlines && in_array(current_token.text, positionable_operators)) {
            var isColon = current_token.text === ':';
            var isTernaryColon = (isColon && in_ternary);
            var isOtherColon = (isColon && !in_ternary);
            switch (this._options.operator_position) {
              case OPERATOR_POSITION.before_newline:
                this._output.space_before_token = !isOtherColon;
                this.print_token(current_token);
                if (!isColon || isTernaryColon) {
                  this.allow_wrap_or_preserved_newline(current_token);
                }
                this._output.space_before_token = true;
                return;
              case OPERATOR_POSITION.after_newline:
                this._output.space_before_token = true;
                if (!isColon || isTernaryColon) {
                  if (this._tokens.peek().newlines) {
                    this.print_newline(false, true);
                  } else {
                    this.allow_wrap_or_preserved_newline(current_token);
                  }
                } else {
                  this._output.space_before_token = false;
                }
                this.print_token(current_token);
                this._output.space_before_token = true;
                return;
              case OPERATOR_POSITION.preserve_newline:
                if (!isOtherColon) {
                  this.allow_wrap_or_preserved_newline(current_token);
                }
                space_before = !(this._output.just_added_newline() || isOtherColon);
                this._output.space_before_token = space_before;
                this.print_token(current_token);
                this._output.space_before_token = true;
                return;
            }
          }
          if (isGeneratorAsterisk) {
            this.allow_wrap_or_preserved_newline(current_token);
            space_before = false;
            var next_token = this._tokens.peek();
            space_after = next_token && in_array(next_token.type, [TOKEN.WORD, TOKEN.RESERVED]);
          } else if (current_token.text === '...') {
            this.allow_wrap_or_preserved_newline(current_token);
            space_before = this._flags.last_token.type === TOKEN.START_BLOCK;
            space_after = false;
          } else if (in_array(current_token.text, ['--', '++', '!', '~']) || isUnary) {
            if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR) {
              this.allow_wrap_or_preserved_newline(current_token);
            }
            space_before = false;
            space_after = false;
            if (current_token.newlines && (current_token.text === '--' || current_token.text === '++')) {
              this.print_newline(false, true);
            }
            if (this._flags.last_token.text === ';' && is_expression(this._flags.mode)) {
              space_before = true;
            }
            if (this._flags.last_token.type === TOKEN.RESERVED) {
              space_before = true;
            } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
              space_before = !(this._flags.last_token.text === ']' && (current_token.text === '--' || current_token.text === '++'));
            } else if (this._flags.last_token.type === TOKEN.OPERATOR) {
              space_before = in_array(current_token.text, ['--', '-', '++', '+']) && in_array(this._flags.last_token.text, ['--', '-', '++', '+']);
              if (in_array(current_token.text, ['+', '-']) && in_array(this._flags.last_token.text, ['--', '++'])) {
                space_after = true;
              }
            }
            if (((this._flags.mode === MODE.BlockStatement && !this._flags.inline_frame) || this._flags.mode === MODE.Statement) &&
              (this._flags.last_token.text === '{' || this._flags.last_token.text === ';')) {
              this.print_newline();
            }
          }
          this._output.space_before_token = this._output.space_before_token || space_before;
          this.print_token(current_token);
          this._output.space_before_token = space_after;
        };
        Beautifier.prototype.handle_block_comment = function(current_token, preserve_statement_flags) {
          if (this._output.raw) {
            this._output.add_raw_token(current_token);
            if (current_token.directives && current_token.directives.preserve === 'end') {
              this._output.raw = this._options.test_output_raw;
            }
            return;
          }
          if (current_token.directives) {
            this.print_newline(false, preserve_statement_flags);
            this.print_token(current_token);
            if (current_token.directives.preserve === 'start') {
              this._output.raw = true;
            }
            this.print_newline(false, true);
            return;
          }
          if (!acorn.newline.test(current_token.text) && !current_token.newlines) {
            this._output.space_before_token = true;
            this.print_token(current_token);
            this._output.space_before_token = true;
            return;
          }
          var lines = split_linebreaks(current_token.text);
          var j;
          var javadoc = false;
          var starless = false;
          var lastIndent = current_token.whitespace_before;
          var lastIndentLength = lastIndent.length;
          this.print_newline(false, preserve_statement_flags);
          if (lines.length > 1) {
            javadoc = all_lines_start_with(lines.slice(1), '*');
            starless = each_line_matches_indent(lines.slice(1), lastIndent);
          }
          this.print_token(current_token, lines[0]);
          for (j = 1; j < lines.length; j++) {
            this.print_newline(false, true);
            if (javadoc) {
              this.print_token(current_token, ' ' + ltrim(lines[j]));
            } else if (starless && lines[j].length > lastIndentLength) {
              this.print_token(current_token, lines[j].substring(lastIndentLength));
            } else {
              this._output.add_token(lines[j]);
            }
          }
          this.print_newline(false, preserve_statement_flags);
        };
        Beautifier.prototype.handle_comment = function(current_token, preserve_statement_flags) {
          if (current_token.newlines) {
            this.print_newline(false, preserve_statement_flags);
          } else {
            this._output.trim(true);
          }
          this._output.space_before_token = true;
          this.print_token(current_token);
          this.print_newline(false, preserve_statement_flags);
        };
        Beautifier.prototype.handle_dot = function(current_token) {
          if (this.start_of_statement(current_token)) {} else {
            this.handle_whitespace_and_comments(current_token, true);
          }
          if (reserved_array(this._flags.last_token, special_words)) {
            this._output.space_before_token = false;
          } else {
            this.allow_wrap_or_preserved_newline(current_token,
              this._flags.last_token.text === ')' && this._options.break_chained_methods);
          }
          if (this._options.unindent_chained_methods && this._output.just_added_newline()) {
            this.deindent();
          }
          this.print_token(current_token);
        };
        Beautifier.prototype.handle_unknown = function(current_token, preserve_statement_flags) {
          this.print_token(current_token);
          if (current_token.text[current_token.text.length - 1] === '\n') {
            this.print_newline(false, preserve_statement_flags);
          }
        };
        Beautifier.prototype.handle_eof = function(current_token) {
          while (this._flags.mode === MODE.Statement) {
            this.restore_mode();
          }
          this.handle_whitespace_and_comments(current_token);
        };
        module.exports.Beautifier = Beautifier;
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";

        function OutputLine(parent) {
          this.__parent = parent;
          this.__character_count = 0;
          this.__indent_count = -1;
          this.__alignment_count = 0;
          this.__items = [];
        }
        OutputLine.prototype.item = function(index) {
          if (index < 0) {
            return this.__items[this.__items.length + index];
          } else {
            return this.__items[index];
          }
        };
        OutputLine.prototype.has_match = function(pattern) {
          for (var lastCheckedOutput = this.__items.length - 1; lastCheckedOutput >= 0; lastCheckedOutput--) {
            if (this.__items[lastCheckedOutput].match(pattern)) {
              return true;
            }
          }
          return false;
        };
        OutputLine.prototype.set_indent = function(indent, alignment) {
          this.__indent_count = indent || 0;
          this.__alignment_count = alignment || 0;
          this.__character_count = this.__parent.baseIndentLength + this.__alignment_count + this.__indent_count * this.__parent.indent_length;
        };
        OutputLine.prototype.get_character_count = function() {
          return this.__character_count;
        };
        OutputLine.prototype.is_empty = function() {
          return this.__items.length === 0;
        };
        OutputLine.prototype.last = function() {
          if (!this.is_empty()) {
            return this.__items[this.__items.length - 1];
          } else {
            return null;
          }
        };
        OutputLine.prototype.push = function(item) {
          this.__items.push(item);
          this.__character_count += item.length;
        };
        OutputLine.prototype.push_raw = function(item) {
          this.push(item);
          var last_newline_index = item.lastIndexOf('\n');
          if (last_newline_index !== -1) {
            this.__character_count = item.length - last_newline_index;
          }
        };
        OutputLine.prototype.pop = function() {
          var item = null;
          if (!this.is_empty()) {
            item = this.__items.pop();
            this.__character_count -= item.length;
          }
          return item;
        };
        OutputLine.prototype.remove_indent = function() {
          if (this.__indent_count > 0) {
            this.__indent_count -= 1;
            this.__character_count -= this.__parent.indent_length;
          }
        };
        OutputLine.prototype.trim = function() {
          while (this.last() === ' ') {
            this.__items.pop();
            this.__character_count -= 1;
          }
        };
        OutputLine.prototype.toString = function() {
          var result = '';
          if (!this.is_empty()) {
            if (this.__indent_count >= 0) {
              result = this.__parent.get_indent_string(this.__indent_count);
            }
            if (this.__alignment_count >= 0) {
              result += this.__parent.get_alignment_string(this.__alignment_count);
            }
            result += this.__items.join('');
          }
          return result;
        };

        function IndentCache(base_string, level_string) {
          this.__cache = [base_string];
          this.__level_string = level_string;
        }
        IndentCache.prototype.__ensure_cache = function(level) {
          while (level >= this.__cache.length) {
            this.__cache.push(this.__cache[this.__cache.length - 1] + this.__level_string);
          }
        };
        IndentCache.prototype.get_level_string = function(level) {
          this.__ensure_cache(level);
          return this.__cache[level];
        };

        function Output(options, baseIndentString) {
          var indent_string = options.indent_char;
          if (options.indent_size > 1) {
            indent_string = new Array(options.indent_size + 1).join(options.indent_char);
          }
          baseIndentString = baseIndentString || '';
          if (options.indent_level > 0) {
            baseIndentString = new Array(options.indent_level + 1).join(indent_string);
          }
          this.__indent_cache = new IndentCache(baseIndentString, indent_string);
          this.__alignment_cache = new IndentCache('', ' ');
          this.baseIndentLength = baseIndentString.length;
          this.indent_length = indent_string.length;
          this.raw = false;
          this._end_with_newline = options.end_with_newline;
          this.__lines = [];
          this.previous_line = null;
          this.current_line = null;
          this.space_before_token = false;
          this.__add_outputline();
        }
        Output.prototype.__add_outputline = function() {
          this.previous_line = this.current_line;
          this.current_line = new OutputLine(this);
          this.__lines.push(this.current_line);
        };
        Output.prototype.get_line_number = function() {
          return this.__lines.length;
        };
        Output.prototype.get_indent_string = function(level) {
          return this.__indent_cache.get_level_string(level);
        };
        Output.prototype.get_alignment_string = function(level) {
          return this.__alignment_cache.get_level_string(level);
        };
        Output.prototype.is_empty = function() {
          return !this.previous_line && this.current_line.is_empty();
        };
        Output.prototype.add_new_line = function(force_newline) {
          if (this.is_empty() ||
            (!force_newline && this.just_added_newline())) {
            return false;
          }
          if (!this.raw) {
            this.__add_outputline();
          }
          return true;
        };
        Output.prototype.get_code = function(eol) {
          var sweet_code = this.__lines.join('\n').replace(/[\r\n\t ]+$/, '');
          if (this._end_with_newline) {
            sweet_code += '\n';
          }
          if (eol !== '\n') {
            sweet_code = sweet_code.replace(/[\n]/g, eol);
          }
          return sweet_code;
        };
        Output.prototype.set_indent = function(indent, alignment) {
          indent = indent || 0;
          alignment = alignment || 0;
          if (this.__lines.length > 1) {
            this.current_line.set_indent(indent, alignment);
            return true;
          }
          this.current_line.set_indent();
          return false;
        };
        Output.prototype.add_raw_token = function(token) {
          for (var x = 0; x < token.newlines; x++) {
            this.__add_outputline();
          }
          this.current_line.push(token.whitespace_before);
          this.current_line.push_raw(token.text);
          this.space_before_token = false;
        };
        Output.prototype.add_token = function(printable_token) {
          this.add_space_before_token();
          this.current_line.push(printable_token);
        };
        Output.prototype.add_space_before_token = function() {
          if (this.space_before_token && !this.just_added_newline()) {
            this.current_line.push(' ');
          }
          this.space_before_token = false;
        };
        Output.prototype.remove_indent = function(index) {
          var output_length = this.__lines.length;
          while (index < output_length) {
            this.__lines[index].remove_indent();
            index++;
          }
        };
        Output.prototype.trim = function(eat_newlines) {
          eat_newlines = (eat_newlines === undefined) ? false : eat_newlines;
          this.current_line.trim(this.indent_string, this.baseIndentString);
          while (eat_newlines && this.__lines.length > 1 &&
            this.current_line.is_empty()) {
            this.__lines.pop();
            this.current_line = this.__lines[this.__lines.length - 1];
            this.current_line.trim();
          }
          this.previous_line = this.__lines.length > 1 ?
            this.__lines[this.__lines.length - 2] : null;
        };
        Output.prototype.just_added_newline = function() {
          return this.current_line.is_empty();
        };
        Output.prototype.just_added_blankline = function() {
          return this.is_empty() ||
            (this.current_line.is_empty() && this.previous_line.is_empty());
        };
        Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
          var index = this.__lines.length - 2;
          while (index >= 0) {
            var potentialEmptyLine = this.__lines[index];
            if (potentialEmptyLine.is_empty()) {
              break;
            } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 &&
              potentialEmptyLine.item(-1) !== ends_with) {
              this.__lines.splice(index + 1, 0, new OutputLine(this));
              this.previous_line = this.__lines[this.__lines.length - 2];
              break;
            }
            index--;
          }
        };
        module.exports.Output = Output;
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";

        function Token(type, text, newlines, whitespace_before) {
          this.type = type;
          this.text = text;
          this.comments_before = null;
          this.newlines = newlines || 0;
          this.whitespace_before = whitespace_before || '';
          this.parent = null;
          this.next = null;
          this.previous = null;
          this.opened = null;
          this.closed = null;
          this.directives = null;
        }
        module.exports.Token = Token;
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";
        var baseASCIIidentifierStartChars = "\x24\x40\x41-\x5a\x5f\x61-\x7a";
        var baseASCIIidentifierChars = "\x24\x30-\x39\x41-\x5a\x5f\x61-\x7a";
        var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
        var nonASCIIidentifierChars = "\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u0620-\u0649\u0672-\u06d3\u06e7-\u06e8\u06fb-\u06fc\u0730-\u074a\u0800-\u0814\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0840-\u0857\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962-\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09d7\u09df-\u09e0\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5f-\u0b60\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2-\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d46-\u0d48\u0d57\u0d62-\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e34-\u0e3a\u0e40-\u0e45\u0e50-\u0e59\u0eb4-\u0eb9\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f41-\u0f47\u0f71-\u0f84\u0f86-\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1029\u1040-\u1049\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u170e-\u1710\u1720-\u1730\u1740-\u1750\u1772\u1773\u1780-\u17b2\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1920-\u192b\u1930-\u193b\u1951-\u196d\u19b0-\u19c0\u19c8-\u19c9\u19d0-\u19d9\u1a00-\u1a15\u1a20-\u1a53\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b46-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1bb0-\u1bb9\u1be6-\u1bf3\u1c00-\u1c22\u1c40-\u1c49\u1c5b-\u1c7d\u1cd0-\u1cd2\u1d00-\u1dbe\u1e01-\u1f15\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2d81-\u2d96\u2de0-\u2dff\u3021-\u3028\u3099\u309a\ua640-\ua66d\ua674-\ua67d\ua69f\ua6f0-\ua6f1\ua7f8-\ua800\ua806\ua80b\ua823-\ua827\ua880-\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8f3-\ua8f7\ua900-\ua909\ua926-\ua92d\ua930-\ua945\ua980-\ua983\ua9b3-\ua9c0\uaa00-\uaa27\uaa40-\uaa41\uaa4c-\uaa4d\uaa50-\uaa59\uaa7b\uaae0-\uaae9\uaaf2-\uaaf3\uabc0-\uabe1\uabec\uabed\uabf0-\uabf9\ufb20-\ufb28\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
        var identifierStart = "[" + baseASCIIidentifierStartChars + nonASCIIidentifierStartChars + "]";
        var identifierChars = "[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]*";
        exports.identifier = new RegExp(identifierStart + identifierChars, 'g');
        var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
        exports.newline = /[\n\r\u2028\u2029]/;
        exports.lineBreak = new RegExp('\r\n|' + exports.newline.source);
        exports.allLineBreaks = new RegExp(exports.lineBreak.source, 'g');
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";
        var BaseOptions = __webpack_require__(6).Options;
        var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];

        function Options(options) {
          BaseOptions.call(this, options, 'js');
          var raw_brace_style = this.raw_options.brace_style || null;
          if (raw_brace_style === "expand-strict") {
            this.raw_options.brace_style = "expand";
          } else if (raw_brace_style === "collapse-preserve-inline") {
            this.raw_options.brace_style = "collapse,preserve-inline";
          } else if (this.raw_options.braces_on_own_line !== undefined) {
            this.raw_options.brace_style = this.raw_options.braces_on_own_line ? "expand" : "collapse";
          }
          var brace_style_split = this._get_selection_list('brace_style', ['collapse', 'expand', 'end-expand', 'none', 'preserve-inline']);
          this.brace_preserve_inline = false;
          this.brace_style = "collapse";
          for (var bs = 0; bs < brace_style_split.length; bs++) {
            if (brace_style_split[bs] === "preserve-inline") {
              this.brace_preserve_inline = true;
            } else {
              this.brace_style = brace_style_split[bs];
            }
          }
          this.unindent_chained_methods = this._get_boolean('unindent_chained_methods');
          this.break_chained_methods = this._get_boolean('break_chained_methods');
          this.space_in_paren = this._get_boolean('space_in_paren');
          this.space_in_empty_paren = this._get_boolean('space_in_empty_paren');
          this.jslint_happy = this._get_boolean('jslint_happy');
          this.space_after_anon_function = this._get_boolean('space_after_anon_function');
          this.space_after_named_function = this._get_boolean('space_after_named_function');
          this.keep_array_indentation = this._get_boolean('keep_array_indentation');
          this.space_before_conditional = this._get_boolean('space_before_conditional', true);
          this.unescape_strings = this._get_boolean('unescape_strings');
          this.e4x = this._get_boolean('e4x');
          this.comma_first = this._get_boolean('comma_first');
          this.operator_position = this._get_selection('operator_position', validPositionValues);
          this.test_output_raw = this._get_boolean('test_output_raw');
          if (this.jslint_happy) {
            this.space_after_anon_function = true;
          }
        }
        Options.prototype = new BaseOptions();
        module.exports.Options = Options;
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";

        function Options(options, merge_child_field) {
          this.raw_options = _mergeOpts(options, merge_child_field);
          this.disabled = this._get_boolean('disabled');
          this.eol = this._get_characters('eol', 'auto');
          this.end_with_newline = this._get_boolean('end_with_newline');
          this.indent_size = this._get_number('indent_size', 4);
          this.indent_char = this._get_characters('indent_char', ' ');
          this.indent_level = this._get_number('indent_level');
          this.preserve_newlines = this._get_boolean('preserve_newlines', true);
          this.max_preserve_newlines = this._get_number('max_preserve_newlines', 32786);
          if (!this.preserve_newlines) {
            this.max_preserve_newlines = 0;
          }
          this.indent_with_tabs = this._get_boolean('indent_with_tabs');
          if (this.indent_with_tabs) {
            this.indent_char = '\t';
            this.indent_size = 1;
          }
          this.wrap_line_length = this._get_number('wrap_line_length', this._get_number('max_char'));
        }
        Options.prototype._get_array = function(name, default_value) {
          var option_value = this.raw_options[name];
          var result = default_value || [];
          if (typeof option_value === 'object') {
            if (option_value !== null && typeof option_value.concat === 'function') {
              result = option_value.concat();
            }
          } else if (typeof option_value === 'string') {
            result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
          }
          return result;
        };
        Options.prototype._get_boolean = function(name, default_value) {
          var option_value = this.raw_options[name];
          var result = option_value === undefined ? !!default_value : !!option_value;
          return result;
        };
        Options.prototype._get_characters = function(name, default_value) {
          var option_value = this.raw_options[name];
          var result = default_value || '';
          if (typeof option_value === 'string') {
            result = option_value.replace(/\\r/, '\r').replace(/\\n/, '\n').replace(/\\t/, '\t');
          }
          return result;
        };
        Options.prototype._get_number = function(name, default_value) {
          var option_value = this.raw_options[name];
          default_value = parseInt(default_value, 10);
          if (isNaN(default_value)) {
            default_value = 0;
          }
          var result = parseInt(option_value, 10);
          if (isNaN(result)) {
            result = default_value;
          }
          return result;
        };
        Options.prototype._get_selection = function(name, selection_list, default_value) {
          var result = this._get_selection_list(name, selection_list, default_value);
          if (result.length !== 1) {
            throw new Error(
              "Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" +
              selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
          }
          return result[0];
        };
        Options.prototype._get_selection_list = function(name, selection_list, default_value) {
          if (!selection_list || selection_list.length === 0) {
            throw new Error("Selection list cannot be empty.");
          }
          default_value = default_value || [selection_list[0]];
          if (!this._is_valid_selection(default_value, selection_list)) {
            throw new Error("Invalid Default Value!");
          }
          var result = this._get_array(name, default_value);
          if (!this._is_valid_selection(result, selection_list)) {
            throw new Error(
              "Invalid Option Value: The option '" + name + "' can contain only the following values:\n" +
              selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
          }
          return result;
        };
        Options.prototype._is_valid_selection = function(result, selection_list) {
          return result.length && selection_list.length &&
            !result.some(function(item) {
              return selection_list.indexOf(item) === -1;
            });
        };

        function _mergeOpts(allOptions, childFieldName) {
          var finalOpts = {};
          allOptions = _normalizeOpts(allOptions);
          var name;
          for (name in allOptions) {
            if (name !== childFieldName) {
              finalOpts[name] = allOptions[name];
            }
          }
          if (childFieldName && allOptions[childFieldName]) {
            for (name in allOptions[childFieldName]) {
              finalOpts[name] = allOptions[childFieldName][name];
            }
          }
          return finalOpts;
        }

        function _normalizeOpts(options) {
          var convertedOpts = {};
          var key;
          for (key in options) {
            var newKey = key.replace(/-/g, "_");
            convertedOpts[newKey] = options[key];
          }
          return convertedOpts;
        }
        module.exports.Options = Options;
        module.exports.normalizeOpts = _normalizeOpts;
        module.exports.mergeOpts = _mergeOpts;
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";
        var InputScanner = __webpack_require__(8).InputScanner;
        var BaseTokenizer = __webpack_require__(9).Tokenizer;
        var BASETOKEN = __webpack_require__(9).TOKEN;
        var Directives = __webpack_require__(11).Directives;
        var acorn = __webpack_require__(4);

        function in_array(what, arr) {
          return arr.indexOf(what) !== -1;
        }
        var TOKEN = {
          START_EXPR: 'TK_START_EXPR',
          END_EXPR: 'TK_END_EXPR',
          START_BLOCK: 'TK_START_BLOCK',
          END_BLOCK: 'TK_END_BLOCK',
          WORD: 'TK_WORD',
          RESERVED: 'TK_RESERVED',
          SEMICOLON: 'TK_SEMICOLON',
          STRING: 'TK_STRING',
          EQUALS: 'TK_EQUALS',
          OPERATOR: 'TK_OPERATOR',
          COMMA: 'TK_COMMA',
          BLOCK_COMMENT: 'TK_BLOCK_COMMENT',
          COMMENT: 'TK_COMMENT',
          DOT: 'TK_DOT',
          UNKNOWN: 'TK_UNKNOWN',
          START: BASETOKEN.START,
          RAW: BASETOKEN.RAW,
          EOF: BASETOKEN.EOF
        };
        var directives_core = new Directives(/\/\*/, /\*\//);
        var number_pattern = /0[xX][0123456789abcdefABCDEF]*|0[oO][01234567]*|0[bB][01]*|\d+n|(?:\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/g;
        var digit = /[0-9]/;
        var dot_pattern = /[^\d\.]/;
        var positionable_operators = (
          ">>> === !== " +
          "<< && >= ** != == <= >> || " +
          "< / - + > : & % ? ^ | *").split(' ');
        var punct =
          ">>>= " +
          "... >>= <<= === >>> !== **= " +
          "=> ^= :: /= << <= == && -= >= >> != -- += ** || ++ %= &= *= |= " +
          "= ! ? > < : / ^ - + * & % ~ |";
        punct = punct.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
        punct = punct.replace(/ /g, '|');
        var punct_pattern = new RegExp(punct, 'g');
        var shebang_pattern = /#![^\n\r\u2028\u2029]*(?:\r\n|[\n\r\u2028\u2029])?/g;
        var include_pattern = /#include[^\n\r\u2028\u2029]*(?:\r\n|[\n\r\u2028\u2029])?/g;
        var line_starters = 'continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export'.split(',');
        var reserved_words = line_starters.concat(['do', 'in', 'of', 'else', 'get', 'set', 'new', 'catch', 'finally', 'typeof', 'yield', 'async', 'await', 'from', 'as']);
        var reserved_word_pattern = new RegExp('^(?:' + reserved_words.join('|') + ')$');
        var block_comment_pattern = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g;
        var comment_pattern = /\/\/(?:[^\n\r\u2028\u2029]*)/g;
        var template_pattern = /(?:(?:<\?php|<\?=)[\s\S]*?\?>)|(?:<%[\s\S]*?%>)/g;
        var in_html_comment;
        var Tokenizer = function(input_string, options) {
          BaseTokenizer.call(this, input_string, options);
          this._whitespace_pattern = /[\n\r\u2028\u2029\t\u000B\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff ]+/g;
          this._newline_pattern = /([^\n\r\u2028\u2029]*)(\r\n|[\n\r\u2028\u2029])?/g;
        };
        Tokenizer.prototype = new BaseTokenizer();
        Tokenizer.prototype._is_comment = function(current_token) {
          return current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.BLOCK_COMMENT || current_token.type === TOKEN.UNKNOWN;
        };
        Tokenizer.prototype._is_opening = function(current_token) {
          return current_token.type === TOKEN.START_BLOCK || current_token.type === TOKEN.START_EXPR;
        };
        Tokenizer.prototype._is_closing = function(current_token, open_token) {
          return (current_token.type === TOKEN.END_BLOCK || current_token.type === TOKEN.END_EXPR) &&
            (open_token && (
              (current_token.text === ']' && open_token.text === '[') ||
              (current_token.text === ')' && open_token.text === '(') ||
              (current_token.text === '}' && open_token.text === '{')));
        };
        Tokenizer.prototype._reset = function() {
          in_html_comment = false;
        };
        Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
          this._readWhitespace();
          var token = null;
          var c = this._input.peek();
          token = token || this._read_singles(c);
          token = token || this._read_word(previous_token);
          token = token || this._read_comment(c);
          token = token || this._read_string(c);
          token = token || this._read_regexp(c, previous_token);
          token = token || this._read_xml(c, previous_token);
          token = token || this._read_non_javascript(c);
          token = token || this._read_punctuation();
          token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());
          return token;
        };
        Tokenizer.prototype._read_word = function(previous_token) {
          var resulting_string;
          resulting_string = this._input.read(acorn.identifier);
          if (resulting_string !== '') {
            if (!(previous_token.type === TOKEN.DOT ||
                (previous_token.type === TOKEN.RESERVED && (previous_token.text === 'set' || previous_token.text === 'get'))) &&
              reserved_word_pattern.test(resulting_string)) {
              if (resulting_string === 'in' || resulting_string === 'of') {
                return this._create_token(TOKEN.OPERATOR, resulting_string);
              }
              return this._create_token(TOKEN.RESERVED, resulting_string);
            }
            return this._create_token(TOKEN.WORD, resulting_string);
          }
          resulting_string = this._input.read(number_pattern);
          if (resulting_string !== '') {
            return this._create_token(TOKEN.WORD, resulting_string);
          }
        };
        Tokenizer.prototype._read_singles = function(c) {
          var token = null;
          if (c === null) {
            token = this._create_token(TOKEN.EOF, '');
          } else if (c === '(' || c === '[') {
            token = this._create_token(TOKEN.START_EXPR, c);
          } else if (c === ')' || c === ']') {
            token = this._create_token(TOKEN.END_EXPR, c);
          } else if (c === '{') {
            token = this._create_token(TOKEN.START_BLOCK, c);
          } else if (c === '}') {
            token = this._create_token(TOKEN.END_BLOCK, c);
          } else if (c === ';') {
            token = this._create_token(TOKEN.SEMICOLON, c);
          } else if (c === '.' && dot_pattern.test(this._input.peek(1))) {
            token = this._create_token(TOKEN.DOT, c);
          } else if (c === ',') {
            token = this._create_token(TOKEN.COMMA, c);
          }
          if (token) {
            this._input.next();
          }
          return token;
        };
        Tokenizer.prototype._read_punctuation = function() {
          var resulting_string = this._input.read(punct_pattern);
          if (resulting_string !== '') {
            if (resulting_string === '=') {
              return this._create_token(TOKEN.EQUALS, resulting_string);
            } else {
              return this._create_token(TOKEN.OPERATOR, resulting_string);
            }
          }
        };
        Tokenizer.prototype._read_non_javascript = function(c) {
          var resulting_string = '';
          if (c === '#') {
            if (this._is_first_token()) {
              resulting_string = this._input.read(shebang_pattern);
              if (resulting_string) {
                return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
              }
            }
            resulting_string = this._input.read(include_pattern);
            if (resulting_string) {
              return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
            }
            c = this._input.next();
            var sharp = '#';
            if (this._input.hasNext() && this._input.testChar(digit)) {
              do {
                c = this._input.next();
                sharp += c;
              } while (this._input.hasNext() && c !== '#' && c !== '=');
              if (c === '#') {} else if (this._input.peek() === '[' && this._input.peek(1) === ']') {
                sharp += '[]';
                this._input.next();
                this._input.next();
              } else if (this._input.peek() === '{' && this._input.peek(1) === '}') {
                sharp += '{}';
                this._input.next();
                this._input.next();
              }
              return this._create_token(TOKEN.WORD, sharp);
            }
            this._input.back();
          } else if (c === '<') {
            if (this._input.peek(1) === '?' || this._input.peek(1) === '%') {
              resulting_string = this._input.read(template_pattern);
              if (resulting_string) {
                resulting_string = resulting_string.replace(acorn.allLineBreaks, '\n');
                return this._create_token(TOKEN.STRING, resulting_string);
              }
            } else if (this._input.match(/<\!--/g)) {
              c = '<!--';
              while (this._input.hasNext() && !this._input.testChar(acorn.newline)) {
                c += this._input.next();
              }
              in_html_comment = true;
              return this._create_token(TOKEN.COMMENT, c);
            }
          } else if (c === '-' && in_html_comment && this._input.match(/-->/g)) {
            in_html_comment = false;
            return this._create_token(TOKEN.COMMENT, '-->');
          }
          return null;
        };
        Tokenizer.prototype._read_comment = function(c) {
          var token = null;
          if (c === '/') {
            var comment = '';
            if (this._input.peek(1) === '*') {
              comment = this._input.read(block_comment_pattern);
              var directives = directives_core.get_directives(comment);
              if (directives && directives.ignore === 'start') {
                comment += directives_core.readIgnored(this._input);
              }
              comment = comment.replace(acorn.allLineBreaks, '\n');
              token = this._create_token(TOKEN.BLOCK_COMMENT, comment);
              token.directives = directives;
            } else if (this._input.peek(1) === '/') {
              comment = this._input.read(comment_pattern);
              token = this._create_token(TOKEN.COMMENT, comment);
            }
          }
          return token;
        };
        Tokenizer.prototype._read_string = function(c) {
          if (c === '`' || c === "'" || c === '"') {
            var resulting_string = this._input.next();
            this.has_char_escapes = false;
            if (c === '`') {
              resulting_string += this._read_string_recursive('`', true, '${');
            } else {
              resulting_string += this._read_string_recursive(c);
            }
            if (this.has_char_escapes && this._options.unescape_strings) {
              resulting_string = unescape_string(resulting_string);
            }
            if (this._input.peek() === c) {
              resulting_string += this._input.next();
            }
            return this._create_token(TOKEN.STRING, resulting_string);
          }
          return null;
        };
        Tokenizer.prototype._allow_regexp_or_xml = function(previous_token) {
          return (previous_token.type === TOKEN.RESERVED && in_array(previous_token.text, ['return', 'case', 'throw', 'else', 'do', 'typeof', 'yield'])) ||
            (previous_token.type === TOKEN.END_EXPR && previous_token.text === ')' &&
              previous_token.opened.previous.type === TOKEN.RESERVED && in_array(previous_token.opened.previous.text, ['if', 'while', 'for'])) ||
            (in_array(previous_token.type, [TOKEN.COMMENT, TOKEN.START_EXPR, TOKEN.START_BLOCK, TOKEN.START,
              TOKEN.END_BLOCK, TOKEN.OPERATOR, TOKEN.EQUALS, TOKEN.EOF, TOKEN.SEMICOLON, TOKEN.COMMA
            ]));
        };
        Tokenizer.prototype._read_regexp = function(c, previous_token) {
          if (c === '/' && this._allow_regexp_or_xml(previous_token)) {
            var resulting_string = this._input.next();
            var esc = false;
            var in_char_class = false;
            while (this._input.hasNext() &&
              ((esc || in_char_class || this._input.peek() !== c) &&
                !this._input.testChar(acorn.newline))) {
              resulting_string += this._input.peek();
              if (!esc) {
                esc = this._input.peek() === '\\';
                if (this._input.peek() === '[') {
                  in_char_class = true;
                } else if (this._input.peek() === ']') {
                  in_char_class = false;
                }
              } else {
                esc = false;
              }
              this._input.next();
            }
            if (this._input.peek() === c) {
              resulting_string += this._input.next();
              resulting_string += this._input.read(acorn.identifier);
            }
            return this._create_token(TOKEN.STRING, resulting_string);
          }
          return null;
        };
        var startXmlRegExp = /<()([-a-zA-Z:0-9_.]+|{[\s\S]+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{[\s\S]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{[\s\S]+?}))*\s*(\/?)\s*>/g;
        var xmlRegExp = /[\s\S]*?<(\/?)([-a-zA-Z:0-9_.]+|{[\s\S]+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{[\s\S]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{[\s\S]+?}))*\s*(\/?)\s*>/g;
        Tokenizer.prototype._read_xml = function(c, previous_token) {
          if (this._options.e4x && c === "<" && this._input.test(startXmlRegExp) && this._allow_regexp_or_xml(previous_token)) {
            var xmlStr = '';
            var match = this._input.match(startXmlRegExp);
            if (match) {
              var rootTag = match[2].replace(/^{\s+/, '{').replace(/\s+}$/, '}');
              var isCurlyRoot = rootTag.indexOf('{') === 0;
              var depth = 0;
              while (match) {
                var isEndTag = !!match[1];
                var tagName = match[2];
                var isSingletonTag = (!!match[match.length - 1]) || (tagName.slice(0, 8) === "![CDATA[");
                if (!isSingletonTag &&
                  (tagName === rootTag || (isCurlyRoot && tagName.replace(/^{\s+/, '{').replace(/\s+}$/, '}')))) {
                  if (isEndTag) {
                    --depth;
                  } else {
                    ++depth;
                  }
                }
                xmlStr += match[0];
                if (depth <= 0) {
                  break;
                }
                match = this._input.match(xmlRegExp);
              }
              if (!match) {
                xmlStr += this._input.match(/[\s\S]*/g)[0];
              }
              xmlStr = xmlStr.replace(acorn.allLineBreaks, '\n');
              return this._create_token(TOKEN.STRING, xmlStr);
            }
          }
          return null;
        };

        function unescape_string(s) {
          var out = '',
            escaped = 0;
          var input_scan = new InputScanner(s);
          var matched = null;
          while (input_scan.hasNext()) {
            matched = input_scan.match(/([\s]|[^\\]|\\\\)+/g);
            if (matched) {
              out += matched[0];
            }
            if (input_scan.peek() === '\\') {
              input_scan.next();
              if (input_scan.peek() === 'x') {
                matched = input_scan.match(/x([0-9A-Fa-f]{2})/g);
              } else if (input_scan.peek() === 'u') {
                matched = input_scan.match(/u([0-9A-Fa-f]{4})/g);
              } else {
                out += '\\';
                if (input_scan.hasNext()) {
                  out += input_scan.next();
                }
                continue;
              }
              if (!matched) {
                return s;
              }
              escaped = parseInt(matched[1], 16);
              if (escaped > 0x7e && escaped <= 0xff && matched[0].indexOf('x') === 0) {
                return s;
              } else if (escaped >= 0x00 && escaped < 0x20) {
                out += '\\' + matched[0];
                continue;
              } else if (escaped === 0x22 || escaped === 0x27 || escaped === 0x5c) {
                out += '\\' + String.fromCharCode(escaped);
              } else {
                out += String.fromCharCode(escaped);
              }
            }
          }
          return out;
        }
        Tokenizer.prototype._read_string_recursive = function(delimiter, allow_unescaped_newlines, start_sub) {
          var current_char;
          var resulting_string = '';
          var esc = false;
          while (this._input.hasNext()) {
            current_char = this._input.peek();
            if (!(esc || (current_char !== delimiter &&
                (allow_unescaped_newlines || !acorn.newline.test(current_char))))) {
              break;
            }
            if ((esc || allow_unescaped_newlines) && acorn.newline.test(current_char)) {
              if (current_char === '\r' && this._input.peek(1) === '\n') {
                this._input.next();
                current_char = this._input.peek();
              }
              resulting_string += '\n';
            } else {
              resulting_string += current_char;
            }
            if (esc) {
              if (current_char === 'x' || current_char === 'u') {
                this.has_char_escapes = true;
              }
              esc = false;
            } else {
              esc = current_char === '\\';
            }
            this._input.next();
            if (start_sub && resulting_string.indexOf(start_sub, resulting_string.length - start_sub.length) !== -1) {
              if (delimiter === '`') {
                resulting_string += this._read_string_recursive('}', allow_unescaped_newlines, '`');
              } else {
                resulting_string += this._read_string_recursive('`', allow_unescaped_newlines, '${');
              }
              if (this._input.hasNext()) {
                resulting_string += this._input.next();
              }
            }
          }
          return resulting_string;
        };
        module.exports.Tokenizer = Tokenizer;
        module.exports.TOKEN = TOKEN;
        module.exports.positionable_operators = positionable_operators.slice();
        module.exports.line_starters = line_starters.slice();
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";

        function InputScanner(input_string) {
          this.__input = input_string || '';
          this.__input_length = this.__input.length;
          this.__position = 0;
        }
        InputScanner.prototype.restart = function() {
          this.__position = 0;
        };
        InputScanner.prototype.back = function() {
          if (this.__position > 0) {
            this.__position -= 1;
          }
        };
        InputScanner.prototype.hasNext = function() {
          return this.__position < this.__input_length;
        };
        InputScanner.prototype.next = function() {
          var val = null;
          if (this.hasNext()) {
            val = this.__input.charAt(this.__position);
            this.__position += 1;
          }
          return val;
        };
        InputScanner.prototype.peek = function(index) {
          var val = null;
          index = index || 0;
          index += this.__position;
          if (index >= 0 && index < this.__input_length) {
            val = this.__input.charAt(index);
          }
          return val;
        };
        InputScanner.prototype.test = function(pattern, index) {
          index = index || 0;
          index += this.__position;
          pattern.lastIndex = index;
          if (index >= 0 && index < this.__input_length) {
            var pattern_match = pattern.exec(this.__input);
            return pattern_match && pattern_match.index === index;
          } else {
            return false;
          }
        };
        InputScanner.prototype.testChar = function(pattern, index) {
          var val = this.peek(index);
          return val !== null && pattern.test(val);
        };
        InputScanner.prototype.match = function(pattern) {
          pattern.lastIndex = this.__position;
          var pattern_match = pattern.exec(this.__input);
          if (pattern_match && pattern_match.index === this.__position) {
            this.__position += pattern_match[0].length;
          } else {
            pattern_match = null;
          }
          return pattern_match;
        };
        InputScanner.prototype.read = function(pattern) {
          var val = '';
          var match = this.match(pattern);
          if (match) {
            val = match[0];
          }
          return val;
        };
        InputScanner.prototype.readUntil = function(pattern, include_match) {
          var val = '';
          var match_index = this.__position;
          pattern.lastIndex = this.__position;
          var pattern_match = pattern.exec(this.__input);
          if (pattern_match) {
            if (include_match) {
              match_index = pattern_match.index + pattern_match[0].length;
            } else {
              match_index = pattern_match.index;
            }
          } else {
            match_index = this.__input_length;
          }
          val = this.__input.substring(this.__position, match_index);
          this.__position = match_index;
          return val;
        };
        InputScanner.prototype.readUntilAfter = function(pattern) {
          return this.readUntil(pattern, true);
        };
        InputScanner.prototype.peekUntilAfter = function(pattern) {
          var start = this.__position;
          var val = this.readUntilAfter(pattern);
          this.__position = start;
          return val;
        };
        InputScanner.prototype.lookBack = function(testVal) {
          var start = this.__position - 1;
          return start >= testVal.length && this.__input.substring(start - testVal.length, start)
            .toLowerCase() === testVal;
        };
        module.exports.InputScanner = InputScanner;
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";
        var InputScanner = __webpack_require__(8).InputScanner;
        var Token = __webpack_require__(3).Token;
        var TokenStream = __webpack_require__(10).TokenStream;
        var TOKEN = {
          START: 'TK_START',
          RAW: 'TK_RAW',
          EOF: 'TK_EOF'
        };
        var Tokenizer = function(input_string, options) {
          this._input = new InputScanner(input_string);
          this._options = options || {};
          this.__tokens = null;
          this.__newline_count = 0;
          this.__whitespace_before_token = '';
          this._whitespace_pattern = /[\n\r\t ]+/g;
          this._newline_pattern = /([^\n\r]*)(\r\n|[\n\r])?/g;
        };
        Tokenizer.prototype.tokenize = function() {
          this._input.restart();
          this.__tokens = new TokenStream();
          this._reset();
          var current;
          var previous = new Token(TOKEN.START, '');
          var open_token = null;
          var open_stack = [];
          var comments = new TokenStream();
          while (previous.type !== TOKEN.EOF) {
            current = this._get_next_token(previous, open_token);
            while (this._is_comment(current)) {
              comments.add(current);
              current = this._get_next_token(previous, open_token);
            }
            if (!comments.isEmpty()) {
              current.comments_before = comments;
              comments = new TokenStream();
            }
            current.parent = open_token;
            if (this._is_opening(current)) {
              open_stack.push(open_token);
              open_token = current;
            } else if (open_token && this._is_closing(current, open_token)) {
              current.opened = open_token;
              open_token.closed = current;
              open_token = open_stack.pop();
              current.parent = open_token;
            }
            current.previous = previous;
            previous.next = current;
            this.__tokens.add(current);
            previous = current;
          }
          return this.__tokens;
        };
        Tokenizer.prototype._is_first_token = function() {
          return this.__tokens.isEmpty();
        };
        Tokenizer.prototype._reset = function() {};
        Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
          this._readWhitespace();
          var resulting_string = this._input.read(/.+/g);
          if (resulting_string) {
            return this._create_token(TOKEN.RAW, resulting_string);
          } else {
            return this._create_token(TOKEN.EOF, '');
          }
        };
        Tokenizer.prototype._is_comment = function(current_token) {
          return false;
        };
        Tokenizer.prototype._is_opening = function(current_token) {
          return false;
        };
        Tokenizer.prototype._is_closing = function(current_token, open_token) {
          return false;
        };
        Tokenizer.prototype._create_token = function(type, text) {
          var token = new Token(type, text, this.__newline_count, this.__whitespace_before_token);
          this.__newline_count = 0;
          this.__whitespace_before_token = '';
          return token;
        };
        Tokenizer.prototype._readWhitespace = function() {
          var resulting_string = this._input.read(this._whitespace_pattern);
          if (resulting_string === ' ') {
            this.__whitespace_before_token = resulting_string;
          } else if (resulting_string !== '') {
            this._newline_pattern.lastIndex = 0;
            var nextMatch = this._newline_pattern.exec(resulting_string);
            while (nextMatch[2]) {
              this.__newline_count += 1;
              nextMatch = this._newline_pattern.exec(resulting_string);
            }
            this.__whitespace_before_token = nextMatch[1];
          }
        };
        module.exports.Tokenizer = Tokenizer;
        module.exports.TOKEN = TOKEN;
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";

        function TokenStream(parent_token) {
          this.__tokens = [];
          this.__tokens_length = this.__tokens.length;
          this.__position = 0;
          this.__parent_token = parent_token;
        }
        TokenStream.prototype.restart = function() {
          this.__position = 0;
        };
        TokenStream.prototype.isEmpty = function() {
          return this.__tokens_length === 0;
        };
        TokenStream.prototype.hasNext = function() {
          return this.__position < this.__tokens_length;
        };
        TokenStream.prototype.next = function() {
          var val = null;
          if (this.hasNext()) {
            val = this.__tokens[this.__position];
            this.__position += 1;
          }
          return val;
        };
        TokenStream.prototype.peek = function(index) {
          var val = null;
          index = index || 0;
          index += this.__position;
          if (index >= 0 && index < this.__tokens_length) {
            val = this.__tokens[index];
          }
          return val;
        };
        TokenStream.prototype.add = function(token) {
          if (this.__parent_token) {
            token.parent = this.__parent_token;
          }
          this.__tokens.push(token);
          this.__tokens_length += 1;
        };
        module.exports.TokenStream = TokenStream;
      }),
      (function(module, exports, __webpack_require__) {
        "use strict";

        function Directives(start_block_pattern, end_block_pattern) {
          start_block_pattern = typeof start_block_pattern === 'string' ? start_block_pattern : start_block_pattern.source;
          end_block_pattern = typeof end_block_pattern === 'string' ? end_block_pattern : end_block_pattern.source;
          this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, 'g');
          this.__directive_pattern = / (\w+)[:](\w+)/g;
          this.__directives_end_ignore_pattern = new RegExp('(?:[\\s\\S]*?)((?:' + start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern + ')|$)', 'g');
        }
        Directives.prototype.get_directives = function(text) {
          if (!text.match(this.__directives_block_pattern)) {
            return null;
          }
          var directives = {};
          this.__directive_pattern.lastIndex = 0;
          var directive_match = this.__directive_pattern.exec(text);
          while (directive_match) {
            directives[directive_match[1]] = directive_match[2];
            directive_match = this.__directive_pattern.exec(text);
          }
          return directives;
        };
        Directives.prototype.readIgnored = function(input) {
          return input.read(this.__directives_end_ignore_pattern);
        };
        module.exports.Directives = Directives;
      })
    ]);
  var js_beautify = legacy_beautify_js;
  if (typeof define === "function" && define.amd) {
    define([], function() {
      return {
        js_beautify: js_beautify
      };
    });
  } else if (typeof exports !== "undefined") {
    exports.js_beautify = js_beautify;
  } else if (typeof window !== "undefined") {
    window.js_beautify = js_beautify;
  } else if (typeof global !== "undefined") {
    global.js_beautify = js_beautify;
  }
}());;
/*! RESOURCE: /codeFormat.js */
(function() {
  var beautifierOptions = {
    javascript: {
      beautifyFunc: js_beautify,
    },
    css: {
      beautifyFunc: "",
    },
    htmlmixed: {
      beautifyFunc: "",
    }
  };

  function getOptions(cm) {
    if (!cm || !cm.doc || !cm.doc.mode || !cm.state)
      return;
    if (cm.doc.mode.name === 'javascript')
      return beautifierOptions.javascript;
    else if (cm.doc.mode.name === 'css')
      return beautifierOptions.css;
    else if (cm.doc.mode.name === 'htmlmixed')
      return beautifierOptions.html;
    else
      return;
  }

  function beautify(cm, isSomethingSelected, formatConfig) {
    var options = getOptions(cm);
    if (!options)
      return;
    if (isSomethingSelected)
      cm.replaceSelection(options.beautifyFunc(cm.getSelection(), formatConfig));
    else
      cm.setValue(options.beautifyFunc(cm.getValue().replace(/^\s+/, ''), formatConfig));
  }
  CodeMirror.defineExtension('format_code', function(isSomethingSelected, formatConfig) {
    beautify(this, isSomethingSelected, formatConfig);
  });
})();;;