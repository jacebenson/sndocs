/*! RESOURCE: /scripts/GlideEditor5Includes.js */
/*! RESOURCE: /scripts/classes/syntax_editor5/linter.js */
var linter = (function() {
  'use strict';
  if (typeof(Worker) === 'undefined')
    return;
  var editors = {},
    callbacks = {},
    worker = new Worker('scripts/classes/syntax_editor5/lintWorker.js');
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
        code: cm
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
      var isNewRecord = g_form.isNewRecord();
      if (isNewRecord) return;
      window.document.onmouseover = function(e) {
        var target = e.target;
        var classList = target.classList;
        if (classList.contains('CodeMirror-gutter-background') && !classList.contains('Debugger-breakpoints-gutter')) {
          classList.add('Debugger-breakpoints-ghost');
        } else if (classList.contains('CodeMirror-gutter-elt')) {
          var parentNode = target.parentNode;
          if (parentNode.previousSibling) {
            var parentClassList = parentNode.previousSibling.classList;
            if (!parentClassList.contains('Debugger-breakpoints-gutter')) {
              parentClassList.add('Debugger-breakpoints-ghost');
            }
          }
        }
      };
      window.document.onmouseout = function(e) {
        var target = e.target;
        var classList = target.classList;
        if (classList.contains('CodeMirror-gutter-background')) {
          classList.remove('Debugger-breakpoints-ghost');
        } else if (classList.contains('CodeMirror-gutter-elt')) {
          var parentNode = target.parentNode;
          if (parentNode.previousSibling) {
            parentNode.previousSibling.classList.remove('Debugger-breakpoints-ghost');
          }
        }
      };
      loadBreakpoints(id, editor, function() {
        editor.on('gutterClick', function(e, line, gutter) {
          onGutterClick(id, e, line, gutter);
        });
        var _lastLineCount = editor.lineCount();
        editor.on('change', function(e) {
          var curLineCount = editor.lineCount();
          if (curLineCount !== _lastLineCount) {
            _lastLineCount = curLineCount;
            updateGutterMarkers(editor);
          }
        });
      });
    }
  };
  var BREAKPOINTS = [];

  function updateGutterMarkers(editor) {
    editor.eachLine(function(line) {
      editor.removeLineClass(line, 'background', 'Debugger-breakpoints-highlight');
      editor.removeLineClass(line, 'gutter', 'Debugger-breakpoints-gutter');
      editor.addLineClass(line, 'wrap', 'Debugger-breakpoint-ghost');
      editor.addLineClass(line, 'gutter', 'Debugger-breakpoint-ghost-gutter');
    });
    BREAKPOINTS.forEach(function(line) {
      editor.addLineClass(line - 1, 'gutter', 'Debugger-breakpoints-gutter');
      editor.addLineClass(line - 1, 'background', 'Debugger-breakpoints-highlight');
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
        var key = getKey();
        key += '.' + id.split('.')[1];
        var result = data.result || {};
        var script = result[key] || {};
        BREAKPOINTS = script.breakpoints || [];
        updateGutterMarkers(editor);
        if (then)
          then();
      });
  }

  function onGutterClick(id, editor, lineNumber, gutter) {
    var lineInfo = editor.lineInfo(lineNumber);
    var gutters = lineInfo.gutterMarkers || {};
    if ('CodeMirror-foldgutter' === gutter && gutters[gutter]) {
      return;
    }
    updateSysBreakpoints(id, lineNumber, function(ok) {
      if (ok)
        loadBreakpoints(id, editor);
    });
  }

  function updateSysBreakpoints(id, lineNumber, then) {
    var scriptType = g_form.getTableName();
    var scriptId = g_form.getUniqueValue();
    var scriptField = id.split('.')[1];
    var url = '/api/now/js/debugger/breakpoint/' + scriptType + '/' + scriptId + '/' + scriptField + '/' + (lineNumber + 1);
    $j.ajax({
        url: url,
        method: "POST",
        headers: {
          'X-UserToken': window.g_ck
        }
      })
      .done(function(response) {
        then(true);
      });
  }

  function getKey() {
    var tbl = g_form.getTableName();
    var sysId = g_form.getUniqueValue();
    return tbl + '.' + sysId;
  }
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
      'scriptDebugger': getMessage('Open Script Debugger')
    };
    CodeMirror.extraCommandsJS = {
      'formatCode': getMessage('Format Code'),
      'autoComplete': getMessage('Scripting Assistance'),
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
      'commentSelection': jvarAccessKey + '-/'
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
      CodeMirror.extraKeyMap['autoComplete'] = 'Ctrl-Space';
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
  initialize: function($super, id, options, jvarAccessKey, isReadOnly, apiJSON, linter, codeComplete, breakpoints) {
    options = Object.extend({
      mode: 'javascript',
      lineNumbers: true,
      enableMacros: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      autoCloseBrackets: true
    }, options || {});
    $super(id, options, jvarAccessKey, isReadOnly, apiJSON, linter, codeComplete);
    if (breakpoints) {
      GlideEditorJSBreakpoints.init(id, this.editor);
    }
  },
  formatCode: function(editor) {
    if (editor.somethingSelected())
      editor.replaceSelection(editor.glideEditor._format(editor, editor.getSelection()));
    else
      editor.setValue(editor.glideEditor._format(editor, editor.getValue()));
    editor.focus();
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
      if (line.startsWith('*')) {
        lines[i] = " " + indentSpaces + line;
      } else
        lines[i] = indentSpaces + line;
      if (oneLineIndent) {
        oneLineIndent = false;
        indentSpaces = indentSpaces.substring(0, indentSpaces.length - spacesLen);
      }
      if (line.includes("{")) {
        indentSpaces += spacesForTab;
      } else if (line.startsWith("if") || line.startsWith("else") || line.startsWith("for") || line.startsWith("while")) {
        indentSpaces += spacesForTab;
        oneLineIndent = true;
      }
    }
    return lines.join("\n");
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
      self.editor.setOption('gutters', ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter']);
      self.editor.setOption('lint', {
        es3: true,
        rhino: true,
        async: true,
        getAnnotations: lint,
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
  initialize: function($super, id, options, jvarAccessKey, isReadOnly) {
    options = Object.extend({
      mode: 'xml',
      lineNumbers: true,
      enableMacros: false
    }, options || {});
    $super(id, options, jvarAccessKey, isReadOnly);
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
! function(e) {
  if ("object" == typeof exports && "object" == typeof module) module.exports = e();
  else {
    if ("function" == typeof define && define.amd) return define([], e);
    this.CodeMirror = e()
  }
}(function() {
    "use strict";

    function e(n, r) {
      if (!(this instanceof e)) return new e(n, r);
      this.options = r = r ? Di(r) : {}, Di(Xo, r, !1), h(r);
      var i = r.value;
      "string" == typeof i && (i = new yl(i, r.mode, null, r.lineSeparator)), this.doc = i;
      var o = new e.inputStyles[r.inputStyle](this),
        l = this.display = new t(n, i, o);
      l.wrapper.CodeMirror = this, c(this), s(this), r.lineWrapping && (this.display.wrapper.className += " CodeMirror-wrap"), r.autofocus && !Lo && l.input.focus(), v(this), this.state = {
        keyMaps: [],
        overlays: [],
        modeGen: 0,
        overwrite: !1,
        delayingBlurEvent: !1,
        focused: !1,
        suppressEdits: !1,
        pasteIncoming: !1,
        cutIncoming: !1,
        draggingText: !1,
        highlight: new Ti,
        keySeq: null,
        specialChars: null
      };
      var a = this;
      po && 11 > go && setTimeout(function() {
        a.display.input.reset(!0)
      }, 20), jt(this), Ki(), bt(this), this.curOp.forceUpdate = !0, _r(this, i), r.autofocus && !Lo || a.hasFocus() ? setTimeout(Ei(pn, this), 20) : gn(this);
      for (var u in Yo) Yo.hasOwnProperty(u) && Yo[u](this, r[u], $o);
      w(this), r.finishInit && r.finishInit(this);
      for (var f = 0; f < el.length; ++f) el[f](this);
      Ct(this), mo && r.lineWrapping && "optimizelegibility" == getComputedStyle(l.lineDiv).textRendering && (l.lineDiv.style.textRendering = "auto")
    }

    function t(e, t, n) {
      var r = this;
      this.input = n, r.scrollbarFiller = Ri("div", null, "CodeMirror-scrollbar-filler"), r.scrollbarFiller.setAttribute("cm-not-content", "true"), r.gutterFiller = Ri("div", null, "CodeMirror-gutter-filler"), r.gutterFiller.setAttribute("cm-not-content", "true"), r.lineDiv = Ri("div", null, "CodeMirror-code"), r.selectionDiv = Ri("div", null, null, "position: relative; z-index: 1"), r.cursorDiv = Ri("div", null, "CodeMirror-cursors"), r.measure = Ri("div", null, "CodeMirror-measure"), r.lineMeasure = Ri("div", null, "CodeMirror-measure"), r.lineSpace = Ri("div", [r.measure, r.lineMeasure, r.selectionDiv, r.cursorDiv, r.lineDiv], null, "position: relative; outline: none"), r.mover = Ri("div", [Ri("div", [r.lineSpace], "CodeMirror-lines")], null, "position: relative"), r.sizer = Ri("div", [r.mover], "CodeMirror-sizer"), r.sizerWidth = null, r.heightForcer = Ri("div", null, null, "position: absolute; height: " + Al + "px; width: 1px;"), r.gutters = Ri("div", null, "CodeMirror-gutters"), r.lineGutter = null, r.scroller = Ri("div", [r.sizer, r.heightForcer, r.gutters], "CodeMirror-scroll"), r.scroller.setAttribute("tabIndex", "-1"), r.wrapper = Ri("div", [r.scrollbarFiller, r.gutterFiller, r.scroller], "CodeMirror"), po && 8 > go && (r.gutters.style.zIndex = -1, r.scroller.style.paddingRight = 0), mo || uo && Lo || (r.scroller.draggable = !0), e && (e.appendChild ? e.appendChild(r.wrapper) : e(r.wrapper)), r.viewFrom = r.viewTo = t.first, r.reportedViewFrom = r.reportedViewTo = t.first, r.view = [], r.renderedView = null, r.externalMeasured = null, r.viewOffset = 0, r.lastWrapHeight = r.lastWrapWidth = 0, r.updateLineNumbers = null, r.nativeBarWidth = r.barHeight = r.barWidth = 0, r.scrollbarsClipped = !1, r.lineNumWidth = r.lineNumInnerWidth = r.lineNumChars = null, r.alignWidgets = !1, r.cachedCharWidth = r.cachedTextHeight = r.cachedPaddingH = null, r.maxLine = null, r.maxLineLength = 0, r.maxLineChanged = !1, r.wheelDX = r.wheelDY = r.wheelStartX = r.wheelStartY = null, r.shift = !1, r.selForContextMenu = null, r.activeTouch = null, n.init(r)
    }

    function n(t) {
      t.doc.mode = e.getMode(t.options, t.doc.modeOption), r(t)
    }

    function r(e) {
      e.doc.iter(function(e) {
        e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null)
      }), e.doc.frontier = e.doc.first, ze(e, 100), e.state.modeGen++, e.curOp && Dt(e)
    }

    function i(e) {
      e.options.lineWrapping ? (Ul(e.display.wrapper, "CodeMirror-wrap"), e.display.sizer.style.minWidth = "", e.display.sizerWidth = null) : (ql(e.display.wrapper, "CodeMirror-wrap"), d(e)), l(e), Dt(e), lt(e), setTimeout(function() {
        y(e)
      }, 100)
    }

    function o(e) {
      var t = vt(e.display),
        n = e.options.lineWrapping,
        r = n && Math.max(5, e.display.scroller.clientWidth / yt(e.display) - 3);
      return function(i) {
        if (br(e.doc, i)) return 0;
        var o = 0;
        if (i.widgets)
          for (var l = 0; l < i.widgets.length; l++) i.widgets[l].height && (o += i.widgets[l].height);
        return n ? o + (Math.ceil(i.text.length / r) || 1) * t : o + t
      }
    }

    function l(e) {
      var t = e.doc,
        n = o(e);
      t.iter(function(e) {
        var t = n(e);
        t != e.height && Qr(e, t)
      })
    }

    function s(e) {
      e.display.wrapper.className = e.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + e.options.theme.replace(/(^|\s)\s*/g, " cm-s-"), lt(e)
    }

    function a(e) {
      c(e), Dt(e), setTimeout(function() {
        C(e)
      }, 20)
    }

    function c(e) {
      var t = e.display.gutters,
        n = e.options.gutters;
      Bi(t);
      for (var r = 0; r < n.length; ++r) {
        var i = n[r],
          o = t.appendChild(Ri("div", null, "CodeMirror-gutter " + i));
        "CodeMirror-linenumbers" == i && (e.display.lineGutter = o, o.style.width = (e.display.lineNumWidth || 1) + "px")
      }
      t.style.display = r ? "" : "none", u(e)
    }

    function u(e) {
      var t = e.display.gutters.offsetWidth;
      e.display.sizer.style.marginLeft = t + "px"
    }

    function f(e) {
      if (0 == e.height) return 0;
      for (var t, n = e.text.length, r = e; t = dr(r);) {
        var i = t.find(0, !0);
        r = i.from.line, n += i.from.ch - i.to.ch
      }
      for (r = e; t = hr(r);) {
        var i = t.find(0, !0);
        n -= r.text.length - i.from.ch, r = i.to.line, n += r.text.length - i.to.ch
      }
      return n
    }

    function d(e) {
      var t = e.display,
        n = e.doc;
      t.maxLine = Xr(n, n.first), t.maxLineLength = f(t.maxLine), t.maxLineChanged = !0, n.iter(function(e) {
        var n = f(e);
        n > t.maxLineLength && (t.maxLineLength = n, t.maxLine = e)
      })
    }

    function h(e) {
      var t = Ni(e.gutters, "CodeMirror-linenumbers"); - 1 == t && e.lineNumbers ? e.gutters = e.gutters.concat(["CodeMirror-linenumbers"]) : t > -1 && !e.lineNumbers && (e.gutters = e.gutters.slice(0), e.gutters.splice(t, 1))
    }

    function p(e) {
      var t = e.display,
        n = t.gutters.offsetWidth,
        r = Math.round(e.doc.height + qe(e.display));
      return {
        clientHeight: t.scroller.clientHeight,
        viewHeight: t.wrapper.clientHeight,
        scrollWidth: t.scroller.scrollWidth,
        clientWidth: t.scroller.clientWidth,
        viewWidth: t.wrapper.clientWidth,
        barLeft: e.options.fixedGutter ? n : 0,
        docHeight: r,
        scrollHeight: r + Ve(e) + t.barHeight,
        nativeBarWidth: t.nativeBarWidth,
        gutterWidth: n
      }
    }

    function g(e, t, n) {
      this.cm = n;
      var r = this.vert = Ri("div", [Ri("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar"),
        i = this.horiz = Ri("div", [Ri("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
      e(r), e(i), Ll(r, "scroll", function() {
        r.clientHeight && t(r.scrollTop, "vertical")
      }), Ll(i, "scroll", function() {
        i.clientWidth && t(i.scrollLeft, "horizontal")
      }), this.checkedOverlay = !1, po && 8 > go && (this.horiz.style.minHeight = this.vert.style.minWidth = "18px")
    }

    function m() {}

    function v(t) {
      t.display.scrollbars && (t.display.scrollbars.clear(), t.display.scrollbars.addClass && ql(t.display.wrapper, t.display.scrollbars.addClass)), t.display.scrollbars = new e.scrollbarModel[t.options.scrollbarStyle](function(e) {
        t.display.wrapper.insertBefore(e, t.display.scrollbarFiller), Ll(e, "mousedown", function() {
          t.state.focused && setTimeout(function() {
            t.display.input.focus()
          }, 0)
        }), e.setAttribute("cm-not-content", "true")
      }, function(e, n) {
        "horizontal" == n ? tn(t, e) : en(t, e)
      }, t), t.display.scrollbars.addClass && Ul(t.display.wrapper, t.display.scrollbars.addClass)
    }

    function y(e, t) {
      t || (t = p(e));
      var n = e.display.barWidth,
        r = e.display.barHeight;
      b(e, t);
      for (var i = 0; 4 > i && n != e.display.barWidth || r != e.display.barHeight; i++) n != e.display.barWidth && e.options.lineWrapping && H(e), b(e, p(e)), n = e.display.barWidth, r = e.display.barHeight
    }

    function b(e, t) {
      var n = e.display,
        r = n.scrollbars.update(t);
      n.sizer.style.paddingRight = (n.barWidth = r.right) + "px", n.sizer.style.paddingBottom = (n.barHeight = r.bottom) + "px", r.right && r.bottom ? (n.scrollbarFiller.style.display = "block", n.scrollbarFiller.style.height = r.bottom + "px", n.scrollbarFiller.style.width = r.right + "px") : n.scrollbarFiller.style.display = "", r.bottom && e.options.coverGutterNextToScrollbar && e.options.fixedGutter ? (n.gutterFiller.style.display = "block", n.gutterFiller.style.height = r.bottom + "px", n.gutterFiller.style.width = t.gutterWidth + "px") : n.gutterFiller.style.display = ""
    }

    function x(e, t, n) {
      var r = n && null != n.top ? Math.max(0, n.top) : e.scroller.scrollTop;
      r = Math.floor(r - Ge(e));
      var i = n && null != n.bottom ? n.bottom : r + e.wrapper.clientHeight,
        o = Jr(t, r),
        l = Jr(t, i);
      if (n && n.ensure) {
        var s = n.ensure.from.line,
          a = n.ensure.to.line;
        o > s ? (o = s, l = Jr(t, ei(Xr(t, s)) + e.wrapper.clientHeight)) : Math.min(a, t.lastLine()) >= l && (o = Jr(t, ei(Xr(t, a)) - e.wrapper.clientHeight), l = a)
      }
      return {
        from: o,
        to: Math.max(l, o + 1)
      }
    }

    function C(e) {
      var t = e.display,
        n = t.view;
      if (t.alignWidgets || t.gutters.firstChild && e.options.fixedGutter) {
        for (var r = L(t) - t.scroller.scrollLeft + e.doc.scrollLeft, i = t.gutters.offsetWidth, o = r + "px", l = 0; l < n.length; l++)
          if (!n[l].hidden) {
            e.options.fixedGutter && n[l].gutter && (n[l].gutter.style.left = o);
            var s = n[l].alignable;
            if (s)
              for (var a = 0; a < s.length; a++) s[a].style.left = o
          } e.options.fixedGutter && (t.gutters.style.left = r + i + "px")
      }
    }

    function w(e) {
      if (!e.options.lineNumbers) return !1;
      var t = e.doc,
        n = S(e.options, t.first + t.size - 1),
        r = e.display;
      if (n.length != r.lineNumChars) {
        var i = r.measure.appendChild(Ri("div", [Ri("div", n)], "CodeMirror-linenumber CodeMirror-gutter-elt")),
          o = i.firstChild.offsetWidth,
          l = i.offsetWidth - o;
        return r.lineGutter.style.width = "", r.lineNumInnerWidth = Math.max(o, r.lineGutter.offsetWidth - l) + 1, r.lineNumWidth = r.lineNumInnerWidth + l, r.lineNumChars = r.lineNumInnerWidth ? n.length : -1, r.lineGutter.style.width = r.lineNumWidth + "px", u(e), !0
      }
      return !1
    }

    function S(e, t) {
      return String(e.lineNumberFormatter(t + e.firstLineNumber))
    }

    function L(e) {
      return e.scroller.getBoundingClientRect().left - e.sizer.getBoundingClientRect().left
    }

    function k(e, t, n) {
      var r = e.display;
      this.viewport = t, this.visible = x(r, e.doc, t), this.editorIsHidden = !r.wrapper.offsetWidth, this.wrapperHeight = r.wrapper.clientHeight, this.wrapperWidth = r.wrapper.clientWidth, this.oldDisplayWidth = Ke(e), this.force = n, this.dims = W(e), this.events = []
    }

    function T(e) {
      var t = e.display;
      !t.scrollbarsClipped && t.scroller.offsetWidth && (t.nativeBarWidth = t.scroller.offsetWidth - t.scroller.clientWidth, t.heightForcer.style.height = Ve(e) + "px", t.sizer.style.marginBottom = -t.nativeBarWidth + "px", t.sizer.style.borderRightWidth = Ve(e) + "px", t.scrollbarsClipped = !0)
    }

    function M(e, t) {
      var n = e.display,
        r = e.doc;
      if (t.editorIsHidden) return Ft(e), !1;
      if (!t.force && t.visible.from >= n.viewFrom && t.visible.to <= n.viewTo && (null == n.updateLineNumbers || n.updateLineNumbers >= n.viewTo) && n.renderedView == n.view && 0 == Bt(e)) return !1;
      w(e) && (Ft(e), t.dims = W(e));
      var i = r.first + r.size,
        o = Math.max(t.visible.from - e.options.viewportMargin, r.first),
        l = Math.min(i, t.visible.to + e.options.viewportMargin);
      n.viewFrom < o && o - n.viewFrom < 20 && (o = Math.max(r.first, n.viewFrom)), n.viewTo > l && n.viewTo - l < 20 && (l = Math.min(i, n.viewTo)), Ho && (o = vr(e.doc, o), l = yr(e.doc, l));
      var s = o != n.viewFrom || l != n.viewTo || n.lastWrapHeight != t.wrapperHeight || n.lastWrapWidth != t.wrapperWidth;
      Rt(e, o, l), n.viewOffset = ei(Xr(e.doc, n.viewFrom)), e.display.mover.style.top = n.viewOffset + "px";
      var a = Bt(e);
      if (!s && 0 == a && !t.force && n.renderedView == n.view && (null == n.updateLineNumbers || n.updateLineNumbers >= n.viewTo)) return !1;
      var c = Gi();
      return a > 4 && (n.lineDiv.style.display = "none"), D(e, n.updateLineNumbers, t.dims), a > 4 && (n.lineDiv.style.display = ""), n.renderedView = n.view, c && Gi() != c && c.offsetHeight && c.focus(), Bi(n.cursorDiv), Bi(n.selectionDiv), n.gutters.style.height = n.sizer.style.minHeight = 0, s && (n.lastWrapHeight = t.wrapperHeight, n.lastWrapWidth = t.wrapperWidth, ze(e, 400)), n.updateLineNumbers = null, !0
    }

    function A(e, t) {
      for (var n = t.viewport, r = !0;
        (r && e.options.lineWrapping && t.oldDisplayWidth != Ke(e) || (n && null != n.top && (n = {
          top: Math.min(e.doc.height + qe(e.display) - _e(e), n.top)
        }), t.visible = x(e.display, e.doc, n), !(t.visible.from >= e.display.viewFrom && t.visible.to <= e.display.viewTo))) && M(e, t); r = !1) {
        H(e);
        var i = p(e);
        We(e), N(e, i), y(e, i)
      }
      t.signal(e, "update", e), (e.display.viewFrom != e.display.reportedViewFrom || e.display.viewTo != e.display.reportedViewTo) && (t.signal(e, "viewportChange", e, e.display.viewFrom, e.display.viewTo), e.display.reportedViewFrom = e.display.viewFrom, e.display.reportedViewTo = e.display.viewTo)
    }

    function O(e, t) {
      var n = new k(e, t);
      if (M(e, n)) {
        H(e), A(e, n);
        var r = p(e);
        We(e), N(e, r), y(e, r), n.finish()
      }
    }

    function N(e, t) {
      e.display.sizer.style.minHeight = t.docHeight + "px";
      var n = t.docHeight + e.display.barHeight;
      e.display.heightForcer.style.top = n + "px", e.display.gutters.style.height = Math.max(n + Ve(e), t.clientHeight) + "px"
    }

    function H(e) {
      for (var t = e.display, n = t.lineDiv.offsetTop, r = 0; r < t.view.length; r++) {
        var i, o = t.view[r];
        if (!o.hidden) {
          if (po && 8 > go) {
            var l = o.node.offsetTop + o.node.offsetHeight;
            i = l - n, n = l
          } else {
            var s = o.node.getBoundingClientRect();
            i = s.bottom - s.top
          }
          var a = o.line.height - i;
          if (2 > i && (i = vt(t)), (a > .001 || -.001 > a) && (Qr(o.line, i), P(o.line), o.rest))
            for (var c = 0; c < o.rest.length; c++) P(o.rest[c])
        }
      }
    }

    function P(e) {
      if (e.widgets)
        for (var t = 0; t < e.widgets.length; ++t) e.widgets[t].height = e.widgets[t].node.offsetHeight
    }

    function W(e) {
      for (var t = e.display, n = {}, r = {}, i = t.gutters.clientLeft, o = t.gutters.firstChild, l = 0; o; o = o.nextSibling, ++l) n[e.options.gutters[l]] = o.offsetLeft + o.clientLeft + i, r[e.options.gutters[l]] = o.clientWidth;
      return {
        fixedPos: L(t),
        gutterTotalWidth: t.gutters.offsetWidth,
        gutterLeft: n,
        gutterWidth: r,
        wrapperWidth: t.wrapper.clientWidth
      }
    }

    function D(e, t, n) {
      function r(t) {
        var n = t.nextSibling;
        return mo && ko && e.display.currentWheelTarget == t ? t.style.display = "none" : t.parentNode.removeChild(t), n
      }
      for (var i = e.display, o = e.options.lineNumbers, l = i.lineDiv, s = l.firstChild, a = i.view, c = i.viewFrom, u = 0; u < a.length; u++) {
        var f = a[u];
        if (f.hidden);
        else if (f.node && f.node.parentNode == l) {
          for (; s != f.node;) s = r(s);
          var d = o && null != t && c >= t && f.lineNumber;
          f.changes && (Ni(f.changes, "gutter") > -1 && (d = !1), E(e, f, c, n)), d && (Bi(f.lineNumber), f.lineNumber.appendChild(document.createTextNode(S(e.options, c)))), s = f.node.nextSibling
        } else {
          var h = q(e, f, c, n);
          l.insertBefore(h, s)
        }
        c += f.size
      }
      for (; s;) s = r(s)
    }

    function E(e, t, n, r) {
      for (var i = 0; i < t.changes.length; i++) {
        var o = t.changes[i];
        "text" == o ? R(e, t) : "gutter" == o ? j(e, t, n, r) : "class" == o ? B(t) : "widget" == o && G(e, t, r)
      }
      t.changes = null
    }

    function F(e) {
      return e.node == e.text && (e.node = Ri("div", null, null, "position: relative"), e.text.parentNode && e.text.parentNode.replaceChild(e.node, e.text), e.node.appendChild(e.text), po && 8 > go && (e.node.style.zIndex = 2)), e.node
    }

    function I(e) {
      var t = e.bgClass ? e.bgClass + " " + (e.line.bgClass || "") : e.line.bgClass;
      if (t && (t += " CodeMirror-linebackground"), e.background) t ? e.background.className = t : (e.background.parentNode.removeChild(e.background), e.background = null);
      else if (t) {
        var n = F(e);
        e.background = n.insertBefore(Ri("div", null, t), n.firstChild)
      }
    }

    function z(e, t) {
      var n = e.display.externalMeasured;
      return n && n.line == t.line ? (e.display.externalMeasured = null, t.measure = n.measure, n.built) : Er(e, t)
    }

    function R(e, t) {
      var n = t.text.className,
        r = z(e, t);
      t.text == t.node && (t.node = r.pre), t.text.parentNode.replaceChild(r.pre, t.text), t.text = r.pre, r.bgClass != t.bgClass || r.textClass != t.textClass ? (t.bgClass = r.bgClass, t.textClass = r.textClass, B(t)) : n && (t.text.className = n)
    }

    function B(e) {
      I(e), e.line.wrapClass ? F(e).className = e.line.wrapClass : e.node != e.text && (e.node.className = "");
      var t = e.textClass ? e.textClass + " " + (e.line.textClass || "") : e.line.textClass;
      e.text.className = t || ""
    }

    function j(e, t, n, r) {
      if (t.gutter && (t.node.removeChild(t.gutter), t.gutter = null), t.gutterBackground && (t.node.removeChild(t.gutterBackground), t.gutterBackground = null), t.line.gutterClass) {
        var i = F(t);
        t.gutterBackground = Ri("div", null, "CodeMirror-gutter-background " + t.line.gutterClass, "left: " + (e.options.fixedGutter ? r.fixedPos : -r.gutterTotalWidth) + "px; width: " + r.gutterTotalWidth + "px"), i.insertBefore(t.gutterBackground, t.text)
      }
      var o = t.line.gutterMarkers;
      if (e.options.lineNumbers || o) {
        var i = F(t),
          l = t.gutter = Ri("div", null, "CodeMirror-gutter-wrapper", "left: " + (e.options.fixedGutter ? r.fixedPos : -r.gutterTotalWidth) + "px");
        if (e.display.input.setUneditable(l), i.insertBefore(l, t.text), t.line.gutterClass && (l.className += " " + t.line.gutterClass), !e.options.lineNumbers || o && o["CodeMirror-linenumbers"] || (t.lineNumber = l.appendChild(Ri("div", S(e.options, n), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + r.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + e.display.lineNumInnerWidth + "px"))), o)
          for (var s = 0; s < e.options.gutters.length; ++s) {
            var a = e.options.gutters[s],
              c = o.hasOwnProperty(a) && o[a];
            c && l.appendChild(Ri("div", [c], "CodeMirror-gutter-elt", "left: " + r.gutterLeft[a] + "px; width: " + r.gutterWidth[a] + "px"))
          }
      }
    }

    function G(e, t, n) {
      t.alignable && (t.alignable = null);
      for (var r, i = t.node.firstChild; i; i = r) {
        var r = i.nextSibling;
        "CodeMirror-linewidget" == i.className && t.node.removeChild(i)
      }
      U(e, t, n)
    }

    function q(e, t, n, r) {
      var i = z(e, t);
      return t.text = t.node = i.pre, i.bgClass && (t.bgClass = i.bgClass), i.textClass && (t.textClass = i.textClass), B(t), j(e, t, n, r), U(e, t, r), t.node
    }

    function U(e, t, n) {
      if (V(e, t.line, t, n, !0), t.rest)
        for (var r = 0; r < t.rest.length; r++) V(e, t.rest[r], t, n, !1)
    }

    function V(e, t, n, r, i) {
      if (t.widgets)
        for (var o = F(n), l = 0, s = t.widgets; l < s.length; ++l) {
          var a = s[l],
            c = Ri("div", [a.node], "CodeMirror-linewidget");
          a.handleMouseEvents || c.setAttribute("cm-ignore-events", "true"), K(a, c, n, r), e.display.input.setUneditable(c), i && a.above ? o.insertBefore(c, n.gutter || n.text) : o.appendChild(c), xi(a, "redraw")
        }
    }

    function K(e, t, n, r) {
      if (e.noHScroll) {
        (n.alignable || (n.alignable = [])).push(t);
        var i = r.wrapperWidth;
        t.style.left = r.fixedPos + "px", e.coverGutter || (i -= r.gutterTotalWidth, t.style.paddingLeft = r.gutterTotalWidth + "px"), t.style.width = i + "px"
      }
      e.coverGutter && (t.style.zIndex = 5, t.style.position = "relative", e.noHScroll || (t.style.marginLeft = -r.gutterTotalWidth + "px"))
    }

    function _(e) {
      return Po(e.line, e.ch)
    }

    function X(e, t) {
      return Wo(e, t) < 0 ? t : e
    }

    function Y(e, t) {
      return Wo(e, t) < 0 ? e : t
    }

    function $(e) {
      e.state.focused || (e.display.input.focus(), pn(e))
    }

    function Q(e) {
      return e.options.readOnly || e.doc.cantEdit
    }

    function Z(e, t, n, r, i) {
      var o = e.doc;
      e.display.shift = !1, r || (r = o.sel);
      var l = e.state.pasteIncoming || "paste" == i,
        s = o.splitLines(t),
        a = null;
      if (l && r.ranges.length > 1)
        if (Do && Do.join("\n") == t) {
          if (r.ranges.length % Do.length == 0) {
            a = [];
            for (var c = 0; c < Do.length; c++) a.push(o.splitLines(Do[c]))
          }
        } else s.length == r.ranges.length && (a = Hi(s, function(e) {
          return [e]
        }));
      for (var c = r.ranges.length - 1; c >= 0; c--) {
        var u = r.ranges[c],
          f = u.from(),
          d = u.to();
        u.empty() && (n && n > 0 ? f = Po(f.line, f.ch - n) : e.state.overwrite && !l && (d = Po(d.line, Math.min(Xr(o, d.line).text.length, d.ch + Oi(s).length))));
        var h = e.curOp.updateInput,
          p = {
            from: f,
            to: d,
            text: a ? a[c % a.length] : s,
            origin: i || (l ? "paste" : e.state.cutIncoming ? "cut" : "+input")
          };
        Sn(e.doc, p), xi(e, "inputRead", e, p)
      }
      t && !l && ee(e, t), En(e), e.curOp.updateInput = h, e.curOp.typing = !0, e.state.pasteIncoming = e.state.cutIncoming = !1
    }

    function J(e, t) {
      var n = e.clipboardData && e.clipboardData.getData("text/plain");
      return n ? (e.preventDefault(), At(t, function() {
        Z(t, n, 0, null, "paste")
      }), !0) : void 0
    }

    function ee(e, t) {
      if (e.options.electricChars && e.options.smartIndent)
        for (var n = e.doc.sel, r = n.ranges.length - 1; r >= 0; r--) {
          var i = n.ranges[r];
          if (!(i.head.ch > 100 || r && n.ranges[r - 1].head.line == i.head.line)) {
            var o = e.getModeAt(i.head),
              l = !1;
            if (o.electricChars) {
              for (var s = 0; s < o.electricChars.length; s++)
                if (t.indexOf(o.electricChars.charAt(s)) > -1) {
                  l = In(e, i.head.line, "smart");
                  break
                }
            } else o.electricInput && o.electricInput.test(Xr(e.doc, i.head.line).text.slice(0, i.head.ch)) && (l = In(e, i.head.line, "smart"));
            l && xi(e, "electricInput", e, i.head.line)
          }
        }
    }

    function te(e) {
      for (var t = [], n = [], r = 0; r < e.doc.sel.ranges.length; r++) {
        var i = e.doc.sel.ranges[r].head.line,
          o = {
            anchor: Po(i, 0),
            head: Po(i + 1, 0)
          };
        n.push(o), t.push(e.getRange(o.anchor, o.head))
      }
      return {
        text: t,
        ranges: n
      }
    }

    function ne(e) {
      e.setAttribute("autocorrect", "off"), e.setAttribute("autocapitalize", "off"), e.setAttribute("spellcheck", "false")
    }

    function re(e) {
      this.cm = e, this.prevInput = "", this.pollingFast = !1, this.polling = new Ti, this.inaccurateSelection = !1, this.hasSelection = !1, this.composing = null
    }

    function ie() {
      var e = Ri("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none"),
        t = Ri("div", [e], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
      return mo ? e.style.width = "1000px" : e.setAttribute("wrap", "off"), So && (e.style.border = "1px solid black"), ne(e), t
    }

    function oe(e) {
      this.cm = e, this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null, this.polling = new Ti, this.gracePeriod = !1
    }

    function le(e, t) {
      var n = Ze(e, t.line);
      if (!n || n.hidden) return null;
      var r = Xr(e.doc, t.line),
        i = Ye(n, r, t.line),
        o = ti(r),
        l = "left";
      if (o) {
        var s = lo(o, t.ch);
        l = s % 2 ? "right" : "left"
      }
      var a = tt(i.map, t.ch, l);
      return a.offset = "right" == a.collapse ? a.end : a.start, a
    }

    function se(e, t) {
      return t && (e.bad = !0), e
    }

    function ae(e, t, n) {
      var r;
      if (t == e.display.lineDiv) {
        if (r = e.display.lineDiv.childNodes[n], !r) return se(e.clipPos(Po(e.display.viewTo - 1)), !0);
        t = null, n = 0
      } else
        for (r = t;; r = r.parentNode) {
          if (!r || r == e.display.lineDiv) return null;
          if (r.parentNode && r.parentNode == e.display.lineDiv) break
        }
      for (var i = 0; i < e.display.view.length; i++) {
        var o = e.display.view[i];
        if (o.node == r) return ce(o, t, n)
      }
    }

    function ce(e, t, n) {
      function r(t, n, r) {
        for (var i = -1; i < (u ? u.length : 0); i++)
          for (var o = 0 > i ? c.map : u[i], l = 0; l < o.length; l += 3) {
            var s = o[l + 2];
            if (s == t || s == n) {
              var a = Zr(0 > i ? e.line : e.rest[i]),
                f = o[l] + r;
              return (0 > r || s != t) && (f = o[l + (r ? 1 : 0)]), Po(a, f)
            }
          }
      }
      var i = e.text.firstChild,
        o = !1;
      if (!t || !Bl(i, t)) return se(Po(Zr(e.line), 0), !0);
      if (t == i && (o = !0, t = i.childNodes[n], n = 0, !t)) {
        var l = e.rest ? Oi(e.rest) : e.line;
        return se(Po(Zr(l), l.text.length), o)
      }
      var s = 3 == t.nodeType ? t : null,
        a = t;
      for (s || 1 != t.childNodes.length || 3 != t.firstChild.nodeType || (s = t.firstChild, n && (n = s.nodeValue.length)); a.parentNode != i;) a = a.parentNode;
      var c = e.measure,
        u = c.maps,
        f = r(s, a, n);
      if (f) return se(f, o);
      for (var d = a.nextSibling, h = s ? s.nodeValue.length - n : 0; d; d = d.nextSibling) {
        if (f = r(d, d.firstChild, 0)) return se(Po(f.line, f.ch - h), o);
        h += d.textContent.length
      }
      for (var p = a.previousSibling, h = n; p; p = p.previousSibling) {
        if (f = r(p, p.firstChild, -1)) return se(Po(f.line, f.ch + h), o);
        h += d.textContent.length
      }
    }

    function ue(e, t, n, r, i) {
      function o(e) {
        return function(t) {
          return t.id == e
        }
      }

      function l(t) {
        if (1 == t.nodeType) {
          var n = t.getAttribute("cm-text");
          if (null != n) return "" == n && (n = t.textContent.replace(/\u200b/g, "")), void(s += n);
          var u, f = t.getAttribute("cm-marker");
          if (f) {
            var d = e.findMarks(Po(r, 0), Po(i + 1, 0), o(+f));
            return void(d.length && (u = d[0].find()) && (s += Yr(e.doc, u.from, u.to).join(c)))
          }
          if ("false" == t.getAttribute("contenteditable")) return;
          for (var h = 0; h < t.childNodes.length; h++) l(t.childNodes[h]);
          /^(pre|div|p)$/i.test(t.nodeName) && (a = !0)
        } else if (3 == t.nodeType) {
          var p = t.nodeValue;
          if (!p) return;
          a && (s += c, a = !1), s += p
        }
      }
      for (var s = "", a = !1, c = e.doc.lineSeparator(); l(t), t != n;) t = t.nextSibling;
      return s
    }

    function fe(e, t) {
      this.ranges = e, this.primIndex = t
    }

    function de(e, t) {
      this.anchor = e, this.head = t
    }

    function he(e, t) {
      var n = e[t];
      e.sort(function(e, t) {
        return Wo(e.from(), t.from())
      }), t = Ni(e, n);
      for (var r = 1; r < e.length; r++) {
        var i = e[r],
          o = e[r - 1];
        if (Wo(o.to(), i.from()) >= 0) {
          var l = Y(o.from(), i.from()),
            s = X(o.to(), i.to()),
            a = o.empty() ? i.from() == i.head : o.from() == o.head;
          t >= r && --t, e.splice(--r, 2, new de(a ? s : l, a ? l : s))
        }
      }
      return new fe(e, t)
    }

    function pe(e, t) {
      return new fe([new de(e, t || e)], 0)
    }

    function ge(e, t) {
      return Math.max(e.first, Math.min(t, e.first + e.size - 1))
    }

    function me(e, t) {
      if (t.line < e.first) return Po(e.first, 0);
      var n = e.first + e.size - 1;
      return t.line > n ? Po(n, Xr(e, n).text.length) : ve(t, Xr(e, t.line).text.length)
    }

    function ve(e, t) {
      var n = e.ch;
      return null == n || n > t ? Po(e.line, t) : 0 > n ? Po(e.line, 0) : e
    }

    function ye(e, t) {
      return t >= e.first && t < e.first + e.size
    }

    function be(e, t) {
      for (var n = [], r = 0; r < t.length; r++) n[r] = me(e, t[r]);
      return n
    }

    function xe(e, t, n, r) {
      if (e.cm && e.cm.display.shift || e.extend) {
        var i = t.anchor;
        if (r) {
          var o = Wo(n, i) < 0;
          o != Wo(r, i) < 0 ? (i = n, n = r) : o != Wo(n, r) < 0 && (n = r)
        }
        return new de(i, n)
      }
      return new de(r || n, n)
    }

    function Ce(e, t, n, r) {
      Me(e, new fe([xe(e, e.sel.primary(), t, n)], 0), r)
    }

    function we(e, t, n) {
      for (var r = [], i = 0; i < e.sel.ranges.length; i++) r[i] = xe(e, e.sel.ranges[i], t[i], null);
      var o = he(r, e.sel.primIndex);
      Me(e, o, n)
    }

    function Se(e, t, n, r) {
      var i = e.sel.ranges.slice(0);
      i[t] = n, Me(e, he(i, e.sel.primIndex), r)
    }

    function Le(e, t, n, r) {
      Me(e, pe(t, n), r)
    }

    function ke(e, t) {
      var n = {
        ranges: t.ranges,
        update: function(t) {
          this.ranges = [];
          for (var n = 0; n < t.length; n++) this.ranges[n] = new de(me(e, t[n].anchor), me(e, t[n].head))
        }
      };
      return Tl(e, "beforeSelectionChange", e, n), e.cm && Tl(e.cm, "beforeSelectionChange", e.cm, n), n.ranges != t.ranges ? he(n.ranges, n.ranges.length - 1) : t
    }

    function Te(e, t, n) {
      var r = e.history.done,
        i = Oi(r);
      i && i.ranges ? (r[r.length - 1] = t, Ae(e, t, n)) : Me(e, t, n)
    }

    function Me(e, t, n) {
      Ae(e, t, n), ai(e, e.sel, e.cm ? e.cm.curOp.id : 0 / 0, n)
    }

    function Ae(e, t, n) {
      (Li(e, "beforeSelectionChange") || e.cm && Li(e.cm, "beforeSelectionChange")) && (t = ke(e, t));
      var r = n && n.bias || (Wo(t.primary().head, e.sel.primary().head) < 0 ? -1 : 1);
      Oe(e, He(e, t, r, !0)), n && n.scroll === !1 || !e.cm || En(e.cm)
    }

    function Oe(e, t) {
      t.equals(e.sel) || (e.sel = t, e.cm && (e.cm.curOp.updateInput = e.cm.curOp.selectionChanged = !0, Si(e.cm)), xi(e, "cursorActivity", e))
    }

    function Ne(e) {
      Oe(e, He(e, e.sel, null, !1), Nl)
    }

    function He(e, t, n, r) {
      for (var i, o = 0; o < t.ranges.length; o++) {
        var l = t.ranges[o],
          s = Pe(e, l.anchor, n, r),
          a = Pe(e, l.head, n, r);
        (i || s != l.anchor || a != l.head) && (i || (i = t.ranges.slice(0, o)), i[o] = new de(s, a))
      }
      return i ? he(i, t.primIndex) : t
    }

    function Pe(e, t, n, r) {
      var i = !1,
        o = t,
        l = n || 1;
      e.cantEdit = !1;
      e: for (;;) {
        var s = Xr(e, o.line);
        if (s.markedSpans)
          for (var a = 0; a < s.markedSpans.length; ++a) {
            var c = s.markedSpans[a],
              u = c.marker;
            if ((null == c.from || (u.inclusiveLeft ? c.from <= o.ch : c.from < o.ch)) && (null == c.to || (u.inclusiveRight ? c.to >= o.ch : c.to > o.ch))) {
              if (r && (Tl(u, "beforeCursorEnter"), u.explicitlyCleared)) {
                if (s.markedSpans) {
                  --a;
                  continue
                }
                break
              }
              if (!u.atomic) continue;
              var f = u.find(0 > l ? -1 : 1);
              if (0 == Wo(f, o) && (f.ch += l, f.ch < 0 ? f = f.line > e.first ? me(e, Po(f.line - 1)) : null : f.ch > s.text.length && (f = f.line < e.first + e.size - 1 ? Po(f.line + 1, 0) : null), !f)) {
                if (i) return r ? (e.cantEdit = !0, Po(e.first, 0)) : Pe(e, t, n, !0);
                i = !0, f = t, l = -l
              }
              o = f;
              continue e
            }
          }
        return o
      }
    }

    function We(e) {
      e.display.input.showSelection(e.display.input.prepareSelection())
    }

    function De(e, t) {
      for (var n = e.doc, r = {}, i = r.cursors = document.createDocumentFragment(), o = r.selection = document.createDocumentFragment(), l = 0; l < n.sel.ranges.length; l++)
        if (t !== !1 || l != n.sel.primIndex) {
          var s = n.sel.ranges[l],
            a = s.empty();
          (a || e.options.showCursorWhenSelecting) && Ee(e, s, i), a || Fe(e, s, o)
        } return r
    }

    function Ee(e, t, n) {
      var r = dt(e, t.head, "div", null, null, !e.options.singleCursorHeightPerLine),
        i = n.appendChild(Ri("div", " ", "CodeMirror-cursor"));
      if (i.style.left = r.left + "px", i.style.top = r.top + "px", i.style.height = Math.max(0, r.bottom - r.top) * e.options.cursorHeight + "px", r.other) {
        var o = n.appendChild(Ri("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor"));
        o.style.display = "", o.style.left = r.other.left + "px", o.style.top = r.other.top + "px", o.style.height = .85 * (r.other.bottom - r.other.top) + "px"
      }
    }

    function Fe(e, t, n) {
      function r(e, t, n, r) {
        0 > t && (t = 0), t = Math.round(t), r = Math.round(r), s.appendChild(Ri("div", null, "CodeMirror-selected", "position: absolute; left: " + e + "px; top: " + t + "px; width: " + (null == n ? u - e : n) + "px; height: " + (r - t) + "px"))
      }

      function i(t, n, i) {
        function o(n, r) {
          return ft(e, Po(t, n), "div", f, r)
        }
        var s, a, f = Xr(l, t),
          d = f.text.length;
        return Qi(ti(f), n || 0, null == i ? d : i, function(e, t, l) {
          var f, h, p, g = o(e, "left");
          if (e == t) f = g, h = p = g.left;
          else {
            if (f = o(t - 1, "right"), "rtl" == l) {
              var m = g;
              g = f, f = m
            }
            h = g.left, p = f.right
          }
          null == n && 0 == e && (h = c), f.top - g.top > 3 && (r(h, g.top, null, g.bottom), h = c, g.bottom < f.top && r(h, g.bottom, null, f.top)), null == i && t == d && (p = u), (!s || g.top < s.top || g.top == s.top && g.left < s.left) && (s = g), (!a || f.bottom > a.bottom || f.bottom == a.bottom && f.right > a.right) && (a = f), c + 1 > h && (h = c), r(h, f.top, p - h, f.bottom)
        }), {
          start: s,
          end: a
        }
      }
      var o = e.display,
        l = e.doc,
        s = document.createDocumentFragment(),
        a = Ue(e.display),
        c = a.left,
        u = Math.max(o.sizerWidth, Ke(e) - o.sizer.offsetLeft) - a.right,
        f = t.from(),
        d = t.to();
      if (f.line == d.line) i(f.line, f.ch, d.ch);
      else {
        var h = Xr(l, f.line),
          p = Xr(l, d.line),
          g = gr(h) == gr(p),
          m = i(f.line, f.ch, g ? h.text.length + 1 : null).end,
          v = i(d.line, g ? 0 : null, d.ch).start;
        g && (m.top < v.top - 2 ? (r(m.right, m.top, null, m.bottom), r(c, v.top, v.left, v.bottom)) : r(m.right, m.top, v.left - m.right, m.bottom)), m.bottom < v.top && r(c, m.bottom, null, v.top)
      }
      n.appendChild(s)
    }

    function Ie(e) {
      if (e.state.focused) {
        var t = e.display;
        clearInterval(t.blinker);
        var n = !0;
        t.cursorDiv.style.visibility = "", e.options.cursorBlinkRate > 0 ? t.blinker = setInterval(function() {
          t.cursorDiv.style.visibility = (n = !n) ? "" : "hidden"
        }, e.options.cursorBlinkRate) : e.options.cursorBlinkRate < 0 && (t.cursorDiv.style.visibility = "hidden")
      }
    }

    function ze(e, t) {
      e.doc.mode.startState && e.doc.frontier < e.display.viewTo && e.state.highlight.set(t, Ei(Re, e))
    }

    function Re(e) {
      var t = e.doc;
      if (t.frontier < t.first && (t.frontier = t.first), !(t.frontier >= e.display.viewTo)) {
        var n = +new Date + e.options.workTime,
          r = nl(t.mode, je(e, t.frontier)),
          i = [];
        t.iter(t.frontier, Math.min(t.first + t.size, e.display.viewTo + 500), function(o) {
          if (t.frontier >= e.display.viewFrom) {
            var l = o.styles,
              s = Hr(e, o, r, !0);
            o.styles = s.styles;
            var a = o.styleClasses,
              c = s.classes;
            c ? o.styleClasses = c : a && (o.styleClasses = null);
            for (var u = !l || l.length != o.styles.length || a != c && (!a || !c || a.bgClass != c.bgClass || a.textClass != c.textClass), f = 0; !u && f < l.length; ++f) u = l[f] != o.styles[f];
            u && i.push(t.frontier), o.stateAfter = nl(t.mode, r)
          } else Wr(e, o.text, r), o.stateAfter = t.frontier % 5 == 0 ? nl(t.mode, r) : null;
          return ++t.frontier, +new Date > n ? (ze(e, e.options.workDelay), !0) : void 0
        }), i.length && At(e, function() {
          for (var t = 0; t < i.length; t++) Et(e, i[t], "text")
        })
      }
    }

    function Be(e, t, n) {
      for (var r, i, o = e.doc, l = n ? -1 : t - (e.doc.mode.innerMode ? 1e3 : 100), s = t; s > l; --s) {
        if (s <= o.first) return o.first;
        var a = Xr(o, s - 1);
        if (a.stateAfter && (!n || s <= o.frontier)) return s;
        var c = Wl(a.text, null, e.options.tabSize);
        (null == i || r > c) && (i = s - 1, r = c)
      }
      return i
    }

    function je(e, t, n) {
      var r = e.doc,
        i = e.display;
      if (!r.mode.startState) return !0;
      var o = Be(e, t, n),
        l = o > r.first && Xr(r, o - 1).stateAfter;
      return l = l ? nl(r.mode, l) : rl(r.mode), r.iter(o, t, function(n) {
        Wr(e, n.text, l);
        var s = o == t - 1 || o % 5 == 0 || o >= i.viewFrom && o < i.viewTo;
        n.stateAfter = s ? nl(r.mode, l) : null, ++o
      }), n && (r.frontier = o), l
    }

    function Ge(e) {
      return e.lineSpace.offsetTop
    }

    function qe(e) {
      return e.mover.offsetHeight - e.lineSpace.offsetHeight
    }

    function Ue(e) {
      if (e.cachedPaddingH) return e.cachedPaddingH;
      var t = ji(e.measure, Ri("pre", "x")),
        n = window.getComputedStyle ? window.getComputedStyle(t) : t.currentStyle,
        r = {
          left: parseInt(n.paddingLeft),
          right: parseInt(n.paddingRight)
        };
      return isNaN(r.left) || isNaN(r.right) || (e.cachedPaddingH = r), r
    }

    function Ve(e) {
      return Al - e.display.nativeBarWidth
    }

    function Ke(e) {
      return e.display.scroller.clientWidth - Ve(e) - e.display.barWidth
    }

    function _e(e) {
      return e.display.scroller.clientHeight - Ve(e) - e.display.barHeight
    }

    function Xe(e, t, n) {
      var r = e.options.lineWrapping,
        i = r && Ke(e);
      if (!t.measure.heights || r && t.measure.width != i) {
        var o = t.measure.heights = [];
        if (r) {
          t.measure.width = i;
          for (var l = t.text.firstChild.getClientRects(), s = 0; s < l.length - 1; s++) {
            var a = l[s],
              c = l[s + 1];
            Math.abs(a.bottom - c.bottom) > 2 && o.push((a.bottom + c.top) / 2 - n.top)
          }
        }
        o.push(n.bottom - n.top)
      }
    }

    function Ye(e, t, n) {
      if (e.line == t) return {
        map: e.measure.map,
        cache: e.measure.cache
      };
      for (var r = 0; r < e.rest.length; r++)
        if (e.rest[r] == t) return {
          map: e.measure.maps[r],
          cache: e.measure.caches[r]
        };
      for (var r = 0; r < e.rest.length; r++)
        if (Zr(e.rest[r]) > n) return {
          map: e.measure.maps[r],
          cache: e.measure.caches[r],
          before: !0
        }
    }

    function $e(e, t) {
      t = gr(t);
      var n = Zr(t),
        r = e.display.externalMeasured = new Pt(e.doc, t, n);
      r.lineN = n;
      var i = r.built = Er(e, r);
      return r.text = i.pre, ji(e.display.lineMeasure, i.pre), r
    }

    function Qe(e, t, n, r) {
      return et(e, Je(e, t), n, r)
    }

    function Ze(e, t) {
      if (t >= e.display.viewFrom && t < e.display.viewTo) return e.display.view[It(e, t)];
      var n = e.display.externalMeasured;
      return n && t >= n.lineN && t < n.lineN + n.size ? n : void 0
    }

    function Je(e, t) {
      var n = Zr(t),
        r = Ze(e, n);
      r && !r.text ? r = null : r && r.changes && (E(e, r, n, W(e)), e.curOp.forceUpdate = !0), r || (r = $e(e, t));
      var i = Ye(r, t, n);
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

    function et(e, t, n, r, i) {
      t.before && (n = -1);
      var o, l = n + (r || "");
      return t.cache.hasOwnProperty(l) ? o = t.cache[l] : (t.rect || (t.rect = t.view.text.getBoundingClientRect()), t.hasHeights || (Xe(e, t.view, t.rect), t.hasHeights = !0), o = nt(e, t, n, r), o.bogus || (t.cache[l] = o)), {
        left: o.left,
        right: o.right,
        top: i ? o.rtop : o.top,
        bottom: i ? o.rbottom : o.bottom
      }
    }

    function tt(e, t, n) {
      for (var r, i, o, l, s = 0; s < e.length; s += 3) {
        var a = e[s],
          c = e[s + 1];
        if (a > t ? (i = 0, o = 1, l = "left") : c > t ? (i = t - a, o = i + 1) : (s == e.length - 3 || t == c && e[s + 3] > t) && (o = c - a, i = o - 1, t >= c && (l = "right")), null != i) {
          if (r = e[s + 2], a == c && n == (r.insertLeft ? "left" : "right") && (l = n), "left" == n && 0 == i)
            for (; s && e[s - 2] == e[s - 3] && e[s - 1].insertLeft;) r = e[(s -= 3) + 2], l = "left";
          if ("right" == n && i == c - a)
            for (; s < e.length - 3 && e[s + 3] == e[s + 4] && !e[s + 5].insertLeft;) r = e[(s += 3) + 2], l = "right";
          break
        }
      }
      return {
        node: r,
        start: i,
        end: o,
        collapse: l,
        coverStart: a,
        coverEnd: c
      }
    }

    function nt(e, t, n, r) {
      var i, o = tt(t.map, n, r),
        l = o.node,
        s = o.start,
        a = o.end,
        c = o.collapse;
      if (3 == l.nodeType) {
        for (var u = 0; 4 > u; u++) {
          for (; s && zi(t.line.text.charAt(o.coverStart + s));) --s;
          for (; o.coverStart + a < o.coverEnd && zi(t.line.text.charAt(o.coverStart + a));) ++a;
          if (po && 9 > go && 0 == s && a == o.coverEnd - o.coverStart) i = l.parentNode.getBoundingClientRect();
          else if (po && e.options.lineWrapping) {
            var f = Fl(l, s, a).getClientRects();

            i = f.length ? f["right" == r ? f.length - 1 : 0] : zo
          } else i = Fl(l, s, a).getBoundingClientRect() || zo;
          if (i.left || i.right || 0 == s) break;
          a = s, s -= 1, c = "right"
        }
        po && 11 > go && (i = rt(e.display.measure, i))
      } else {
        s > 0 && (c = r = "right");
        var f;
        i = e.options.lineWrapping && (f = l.getClientRects()).length > 1 ? f["right" == r ? f.length - 1 : 0] : l.getBoundingClientRect()
      }
      if (po && 9 > go && !s && (!i || !i.left && !i.right)) {
        var d = l.parentNode.getClientRects()[0];
        i = d ? {
          left: d.left,
          right: d.left + yt(e.display),
          top: d.top,
          bottom: d.bottom
        } : zo
      }
      for (var h = i.top - t.rect.top, p = i.bottom - t.rect.top, g = (h + p) / 2, m = t.view.measure.heights, u = 0; u < m.length - 1 && !(g < m[u]); u++);
      var v = u ? m[u - 1] : 0,
        y = m[u],
        b = {
          left: ("right" == c ? i.right : i.left) - t.rect.left,
          right: ("left" == c ? i.left : i.right) - t.rect.left,
          top: v,
          bottom: y
        };
      return i.left || i.right || (b.bogus = !0), e.options.singleCursorHeightPerLine || (b.rtop = h, b.rbottom = p), b
    }

    function rt(e, t) {
      if (!window.screen || null == screen.logicalXDPI || screen.logicalXDPI == screen.deviceXDPI || !$i(e)) return t;
      var n = screen.logicalXDPI / screen.deviceXDPI,
        r = screen.logicalYDPI / screen.deviceYDPI;
      return {
        left: t.left * n,
        right: t.right * n,
        top: t.top * r,
        bottom: t.bottom * r
      }
    }

    function it(e) {
      if (e.measure && (e.measure.cache = {}, e.measure.heights = null, e.rest))
        for (var t = 0; t < e.rest.length; t++) e.measure.caches[t] = {}
    }

    function ot(e) {
      e.display.externalMeasure = null, Bi(e.display.lineMeasure);
      for (var t = 0; t < e.display.view.length; t++) it(e.display.view[t])
    }

    function lt(e) {
      ot(e), e.display.cachedCharWidth = e.display.cachedTextHeight = e.display.cachedPaddingH = null, e.options.lineWrapping || (e.display.maxLineChanged = !0), e.display.lineNumChars = null
    }

    function st() {
      return window.pageXOffset || (document.documentElement || document.body).scrollLeft
    }

    function at() {
      return window.pageYOffset || (document.documentElement || document.body).scrollTop
    }

    function ct(e, t, n, r) {
      if (t.widgets)
        for (var i = 0; i < t.widgets.length; ++i)
          if (t.widgets[i].above) {
            var o = wr(t.widgets[i]);
            n.top += o, n.bottom += o
          } if ("line" == r) return n;
      r || (r = "local");
      var l = ei(t);
      if ("local" == r ? l += Ge(e.display) : l -= e.display.viewOffset, "page" == r || "window" == r) {
        var s = e.display.lineSpace.getBoundingClientRect();
        l += s.top + ("window" == r ? 0 : at());
        var a = s.left + ("window" == r ? 0 : st());
        n.left += a, n.right += a
      }
      return n.top += l, n.bottom += l, n
    }

    function ut(e, t, n) {
      if ("div" == n) return t;
      var r = t.left,
        i = t.top;
      if ("page" == n) r -= st(), i -= at();
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

    function ft(e, t, n, r, i) {
      return r || (r = Xr(e.doc, t.line)), ct(e, r, Qe(e, r, t.ch, i), n)
    }

    function dt(e, t, n, r, i, o) {
      function l(t, l) {
        var s = et(e, i, t, l ? "right" : "left", o);
        return l ? s.left = s.right : s.right = s.left, ct(e, r, s, n)
      }

      function s(e, t) {
        var n = a[t],
          r = n.level % 2;
        return e == Zi(n) && t && n.level < a[t - 1].level ? (n = a[--t], e = Ji(n) - (n.level % 2 ? 0 : 1), r = !0) : e == Ji(n) && t < a.length - 1 && n.level < a[t + 1].level && (n = a[++t], e = Zi(n) - n.level % 2, r = !1), r && e == n.to && e > n.from ? l(e - 1) : l(e, r)
      }
      r = r || Xr(e.doc, t.line), i || (i = Je(e, r));
      var a = ti(r),
        c = t.ch;
      if (!a) return l(c);
      var u = lo(a, c),
        f = s(c, u);
      return null != Zl && (f.other = s(c, Zl)), f
    }

    function ht(e, t) {
      var n = 0,
        t = me(e.doc, t);
      e.options.lineWrapping || (n = yt(e.display) * t.ch);
      var r = Xr(e.doc, t.line),
        i = ei(r) + Ge(e.display);
      return {
        left: n,
        right: n,
        top: i,
        bottom: i + r.height
      }
    }

    function pt(e, t, n, r) {
      var i = Po(e, t);
      return i.xRel = r, n && (i.outside = !0), i
    }

    function gt(e, t, n) {
      var r = e.doc;
      if (n += e.display.viewOffset, 0 > n) return pt(r.first, 0, !0, -1);
      var i = Jr(r, n),
        o = r.first + r.size - 1;
      if (i > o) return pt(r.first + r.size - 1, Xr(r, o).text.length, !0, 1);
      0 > t && (t = 0);
      for (var l = Xr(r, i);;) {
        var s = mt(e, l, i, t, n),
          a = hr(l),
          c = a && a.find(0, !0);
        if (!a || !(s.ch > c.from.ch || s.ch == c.from.ch && s.xRel > 0)) return s;
        i = Zr(l = c.to.line)
      }
    }

    function mt(e, t, n, r, i) {
      function o(r) {
        var i = dt(e, Po(n, r), "line", t, c);
        return s = !0, l > i.bottom ? i.left - a : l < i.top ? i.left + a : (s = !1, i.left)
      }
      var l = i - ei(t),
        s = !1,
        a = 2 * e.display.wrapper.clientWidth,
        c = Je(e, t),
        u = ti(t),
        f = t.text.length,
        d = eo(t),
        h = to(t),
        p = o(d),
        g = s,
        m = o(h),
        v = s;
      if (r > m) return pt(n, h, v, 1);
      for (;;) {
        if (u ? h == d || h == ao(t, d, 1) : 1 >= h - d) {
          for (var y = p > r || m - r >= r - p ? d : h, b = r - (y == d ? p : m); zi(t.text.charAt(y));) ++y;
          var x = pt(n, y, y == d ? g : v, -1 > b ? -1 : b > 1 ? 1 : 0);
          return x
        }
        var C = Math.ceil(f / 2),
          w = d + C;
        if (u) {
          w = d;
          for (var S = 0; C > S; ++S) w = ao(t, w, 1)
        }
        var L = o(w);
        L > r ? (h = w, m = L, (v = s) && (m += 1e3), f = C) : (d = w, p = L, g = s, f -= C)
      }
    }

    function vt(e) {
      if (null != e.cachedTextHeight) return e.cachedTextHeight;
      if (null == Eo) {
        Eo = Ri("pre");
        for (var t = 0; 49 > t; ++t) Eo.appendChild(document.createTextNode("x")), Eo.appendChild(Ri("br"));
        Eo.appendChild(document.createTextNode("x"))
      }
      ji(e.measure, Eo);
      var n = Eo.offsetHeight / 50;
      return n > 3 && (e.cachedTextHeight = n), Bi(e.measure), n || 1
    }

    function yt(e) {
      if (null != e.cachedCharWidth) return e.cachedCharWidth;
      var t = Ri("span", "xxxxxxxxxx"),
        n = Ri("pre", [t]);
      ji(e.measure, n);
      var r = t.getBoundingClientRect(),
        i = (r.right - r.left) / 10;
      return i > 2 && (e.cachedCharWidth = i), i || 10
    }

    function bt(e) {
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
        id: ++Bo
      }, Ro ? Ro.ops.push(e.curOp) : e.curOp.ownsGroup = Ro = {
        ops: [e.curOp],
        delayedCallbacks: []
      }
    }

    function xt(e) {
      var t = e.delayedCallbacks,
        n = 0;
      do {
        for (; n < t.length; n++) t[n]();
        for (var r = 0; r < e.ops.length; r++) {
          var i = e.ops[r];
          if (i.cursorActivityHandlers)
            for (; i.cursorActivityCalled < i.cursorActivityHandlers.length;) i.cursorActivityHandlers[i.cursorActivityCalled++](i.cm)
        }
      } while (n < t.length)
    }

    function Ct(e) {
      var t = e.curOp,
        n = t.ownsGroup;
      if (n) try {
        xt(n)
      } finally {
        Ro = null;
        for (var r = 0; r < n.ops.length; r++) n.ops[r].cm.curOp = null;
        wt(n)
      }
    }

    function wt(e) {
      for (var t = e.ops, n = 0; n < t.length; n++) St(t[n]);
      for (var n = 0; n < t.length; n++) Lt(t[n]);
      for (var n = 0; n < t.length; n++) kt(t[n]);
      for (var n = 0; n < t.length; n++) Tt(t[n]);
      for (var n = 0; n < t.length; n++) Mt(t[n])
    }

    function St(e) {
      var t = e.cm,
        n = t.display;
      T(t), e.updateMaxLine && d(t), e.mustUpdate = e.viewChanged || e.forceUpdate || null != e.scrollTop || e.scrollToPos && (e.scrollToPos.from.line < n.viewFrom || e.scrollToPos.to.line >= n.viewTo) || n.maxLineChanged && t.options.lineWrapping, e.update = e.mustUpdate && new k(t, e.mustUpdate && {
        top: e.scrollTop,
        ensure: e.scrollToPos
      }, e.forceUpdate)
    }

    function Lt(e) {
      e.updatedDisplay = e.mustUpdate && M(e.cm, e.update)
    }

    function kt(e) {
      var t = e.cm,
        n = t.display;
      e.updatedDisplay && H(t), e.barMeasure = p(t), n.maxLineChanged && !t.options.lineWrapping && (e.adjustWidthTo = Qe(t, n.maxLine, n.maxLine.text.length).left + 3, t.display.sizerWidth = e.adjustWidthTo, e.barMeasure.scrollWidth = Math.max(n.scroller.clientWidth, n.sizer.offsetLeft + e.adjustWidthTo + Ve(t) + t.display.barWidth), e.maxScrollLeft = Math.max(0, n.sizer.offsetLeft + e.adjustWidthTo - Ke(t))), (e.updatedDisplay || e.selectionChanged) && (e.preparedSelection = n.input.prepareSelection())
    }

    function Tt(e) {
      var t = e.cm;
      null != e.adjustWidthTo && (t.display.sizer.style.minWidth = e.adjustWidthTo + "px", e.maxScrollLeft < t.doc.scrollLeft && tn(t, Math.min(t.display.scroller.scrollLeft, e.maxScrollLeft), !0), t.display.maxLineChanged = !1), e.preparedSelection && t.display.input.showSelection(e.preparedSelection), e.updatedDisplay && N(t, e.barMeasure), (e.updatedDisplay || e.startHeight != t.doc.height) && y(t, e.barMeasure), e.selectionChanged && Ie(t), t.state.focused && e.updateInput && t.display.input.reset(e.typing), e.focus && e.focus == Gi() && $(e.cm)
    }

    function Mt(e) {
      var t = e.cm,
        n = t.display,
        r = t.doc;
      if (e.updatedDisplay && A(t, e.update), null == n.wheelStartX || null == e.scrollTop && null == e.scrollLeft && !e.scrollToPos || (n.wheelStartX = n.wheelStartY = null), null == e.scrollTop || n.scroller.scrollTop == e.scrollTop && !e.forceScroll || (r.scrollTop = Math.max(0, Math.min(n.scroller.scrollHeight - n.scroller.clientHeight, e.scrollTop)), n.scrollbars.setScrollTop(r.scrollTop), n.scroller.scrollTop = r.scrollTop), null == e.scrollLeft || n.scroller.scrollLeft == e.scrollLeft && !e.forceScroll || (r.scrollLeft = Math.max(0, Math.min(n.scroller.scrollWidth - Ke(t), e.scrollLeft)), n.scrollbars.setScrollLeft(r.scrollLeft), n.scroller.scrollLeft = r.scrollLeft, C(t)), e.scrollToPos) {
        var i = Hn(t, me(r, e.scrollToPos.from), me(r, e.scrollToPos.to), e.scrollToPos.margin);
        e.scrollToPos.isCursor && t.state.focused && Nn(t, i)
      }
      var o = e.maybeHiddenMarkers,
        l = e.maybeUnhiddenMarkers;
      if (o)
        for (var s = 0; s < o.length; ++s) o[s].lines.length || Tl(o[s], "hide");
      if (l)
        for (var s = 0; s < l.length; ++s) l[s].lines.length && Tl(l[s], "unhide");
      n.wrapper.offsetHeight && (r.scrollTop = t.display.scroller.scrollTop), e.changeObjs && Tl(t, "changes", t, e.changeObjs), e.update && e.update.finish()
    }

    function At(e, t) {
      if (e.curOp) return t();
      bt(e);
      try {
        return t()
      } finally {
        Ct(e)
      }
    }

    function Ot(e, t) {
      return function() {
        if (e.curOp) return t.apply(e, arguments);
        bt(e);
        try {
          return t.apply(e, arguments)
        } finally {
          Ct(e)
        }
      }
    }

    function Nt(e) {
      return function() {
        if (this.curOp) return e.apply(this, arguments);
        bt(this);
        try {
          return e.apply(this, arguments)
        } finally {
          Ct(this)
        }
      }
    }

    function Ht(e) {
      return function() {
        var t = this.cm;
        if (!t || t.curOp) return e.apply(this, arguments);
        bt(t);
        try {
          return e.apply(this, arguments)
        } finally {
          Ct(t)
        }
      }
    }

    function Pt(e, t, n) {
      this.line = t, this.rest = mr(t), this.size = this.rest ? Zr(Oi(this.rest)) - n + 1 : 1, this.node = this.text = null, this.hidden = br(e, t)
    }

    function Wt(e, t, n) {
      for (var r, i = [], o = t; n > o; o = r) {
        var l = new Pt(e.doc, Xr(e.doc, o), o);
        r = o + l.size, i.push(l)
      }
      return i
    }

    function Dt(e, t, n, r) {
      null == t && (t = e.doc.first), null == n && (n = e.doc.first + e.doc.size), r || (r = 0);
      var i = e.display;
      if (r && n < i.viewTo && (null == i.updateLineNumbers || i.updateLineNumbers > t) && (i.updateLineNumbers = t), e.curOp.viewChanged = !0, t >= i.viewTo) Ho && vr(e.doc, t) < i.viewTo && Ft(e);
      else if (n <= i.viewFrom) Ho && yr(e.doc, n + r) > i.viewFrom ? Ft(e) : (i.viewFrom += r, i.viewTo += r);
      else if (t <= i.viewFrom && n >= i.viewTo) Ft(e);
      else if (t <= i.viewFrom) {
        var o = zt(e, n, n + r, 1);
        o ? (i.view = i.view.slice(o.index), i.viewFrom = o.lineN, i.viewTo += r) : Ft(e)
      } else if (n >= i.viewTo) {
        var o = zt(e, t, t, -1);
        o ? (i.view = i.view.slice(0, o.index), i.viewTo = o.lineN) : Ft(e)
      } else {
        var l = zt(e, t, t, -1),
          s = zt(e, n, n + r, 1);
        l && s ? (i.view = i.view.slice(0, l.index).concat(Wt(e, l.lineN, s.lineN)).concat(i.view.slice(s.index)), i.viewTo += r) : Ft(e)
      }
      var a = i.externalMeasured;
      a && (n < a.lineN ? a.lineN += r : t < a.lineN + a.size && (i.externalMeasured = null))
    }

    function Et(e, t, n) {
      e.curOp.viewChanged = !0;
      var r = e.display,
        i = e.display.externalMeasured;
      if (i && t >= i.lineN && t < i.lineN + i.size && (r.externalMeasured = null), !(t < r.viewFrom || t >= r.viewTo)) {
        var o = r.view[It(e, t)];
        if (null != o.node) {
          var l = o.changes || (o.changes = []); - 1 == Ni(l, n) && l.push(n)
        }
      }
    }

    function Ft(e) {
      e.display.viewFrom = e.display.viewTo = e.doc.first, e.display.view = [], e.display.viewOffset = 0
    }

    function It(e, t) {
      if (t >= e.display.viewTo) return null;
      if (t -= e.display.viewFrom, 0 > t) return null;
      for (var n = e.display.view, r = 0; r < n.length; r++)
        if (t -= n[r].size, 0 > t) return r
    }

    function zt(e, t, n, r) {
      var i, o = It(e, t),
        l = e.display.view;
      if (!Ho || n == e.doc.first + e.doc.size) return {
        index: o,
        lineN: n
      };
      for (var s = 0, a = e.display.viewFrom; o > s; s++) a += l[s].size;
      if (a != t) {
        if (r > 0) {
          if (o == l.length - 1) return null;
          i = a + l[o].size - t, o++
        } else i = a - t;
        t += i, n += i
      }
      for (; vr(e.doc, n) != n;) {
        if (o == (0 > r ? 0 : l.length - 1)) return null;
        n += r * l[o - (0 > r ? 1 : 0)].size, o += r
      }
      return {
        index: o,
        lineN: n
      }
    }

    function Rt(e, t, n) {
      var r = e.display,
        i = r.view;
      0 == i.length || t >= r.viewTo || n <= r.viewFrom ? (r.view = Wt(e, t, n), r.viewFrom = t) : (r.viewFrom > t ? r.view = Wt(e, t, r.viewFrom).concat(r.view) : r.viewFrom < t && (r.view = r.view.slice(It(e, t))), r.viewFrom = t, r.viewTo < n ? r.view = r.view.concat(Wt(e, r.viewTo, n)) : r.viewTo > n && (r.view = r.view.slice(0, It(e, n)))), r.viewTo = n
    }

    function Bt(e) {
      for (var t = e.display.view, n = 0, r = 0; r < t.length; r++) {
        var i = t[r];
        i.hidden || i.node && !i.changes || ++n
      }
      return n
    }

    function jt(e) {
      function t() {
        i.activeTouch && (o = setTimeout(function() {
          i.activeTouch = null
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
      Ll(i.scroller, "mousedown", Ot(e, Kt)), po && 11 > go ? Ll(i.scroller, "dblclick", Ot(e, function(t) {
        if (!wi(e, t)) {
          var n = Vt(e, t);
          if (n && !Qt(e, t) && !Ut(e.display, t)) {
            Cl(t);
            var r = e.findWordAt(n);
            Ce(e.doc, r.anchor, r.head)
          }
        }
      })) : Ll(i.scroller, "dblclick", function(t) {
        wi(e, t) || Cl(t)
      }), Oo || Ll(i.scroller, "contextmenu", function(t) {
        mn(e, t)
      });
      var o, l = {
        end: 0
      };
      Ll(i.scroller, "touchstart", function(e) {
        if (!n(e)) {
          clearTimeout(o);
          var t = +new Date;
          i.activeTouch = {
            start: t,
            moved: !1,
            prev: t - l.end <= 300 ? l : null
          }, 1 == e.touches.length && (i.activeTouch.left = e.touches[0].pageX, i.activeTouch.top = e.touches[0].pageY)
        }
      }), Ll(i.scroller, "touchmove", function() {
        i.activeTouch && (i.activeTouch.moved = !0)
      }), Ll(i.scroller, "touchend", function(n) {
        var o = i.activeTouch;
        if (o && !Ut(i, n) && null != o.left && !o.moved && new Date - o.start < 300) {
          var l, s = e.coordsChar(i.activeTouch, "page");
          l = !o.prev || r(o, o.prev) ? new de(s, s) : !o.prev.prev || r(o, o.prev.prev) ? e.findWordAt(s) : new de(Po(s.line, 0), me(e.doc, Po(s.line + 1, 0))), e.setSelection(l.anchor, l.head), e.focus(), Cl(n)
        }
        t()
      }), Ll(i.scroller, "touchcancel", t), Ll(i.scroller, "scroll", function() {
        i.scroller.clientHeight && (en(e, i.scroller.scrollTop), tn(e, i.scroller.scrollLeft, !0), Tl(e, "scroll", e))
      }), Ll(i.scroller, "mousewheel", function(t) {
        nn(e, t)
      }), Ll(i.scroller, "DOMMouseScroll", function(t) {
        nn(e, t)
      }), Ll(i.wrapper, "scroll", function() {
        i.wrapper.scrollTop = i.wrapper.scrollLeft = 0
      }), i.dragFunctions = {
        simple: function(t) {
          wi(e, t) || Sl(t)
        },
        start: function(t) {
          Jt(e, t)
        },
        drop: Ot(e, Zt)
      };
      var s = i.input.getField();
      Ll(s, "keyup", function(t) {
        fn.call(e, t)
      }), Ll(s, "keydown", Ot(e, cn)), Ll(s, "keypress", Ot(e, dn)), Ll(s, "focus", Ei(pn, e)), Ll(s, "blur", Ei(gn, e))
    }

    function Gt(t, n, r) {
      var i = r && r != e.Init;
      if (!n != !i) {
        var o = t.display.dragFunctions,
          l = n ? Ll : kl;
        l(t.display.scroller, "dragstart", o.start), l(t.display.scroller, "dragenter", o.simple), l(t.display.scroller, "dragover", o.simple), l(t.display.scroller, "drop", o.drop)
      }
    }

    function qt(e) {
      var t = e.display;
      (t.lastWrapHeight != t.wrapper.clientHeight || t.lastWrapWidth != t.wrapper.clientWidth) && (t.cachedCharWidth = t.cachedTextHeight = t.cachedPaddingH = null, t.scrollbarsClipped = !1, e.setSize())
    }

    function Ut(e, t) {
      for (var n = yi(t); n != e.wrapper; n = n.parentNode)
        if (!n || 1 == n.nodeType && "true" == n.getAttribute("cm-ignore-events") || n.parentNode == e.sizer && n != e.mover) return !0
    }

    function Vt(e, t, n, r) {
      var i = e.display;
      if (!n && "true" == yi(t).getAttribute("cm-not-content")) return null;
      var o, l, s = i.lineSpace.getBoundingClientRect();
      try {
        o = t.clientX - s.left, l = t.clientY - s.top
      } catch (t) {
        return null
      }
      var a, c = gt(e, o, l);
      if (r && 1 == c.xRel && (a = Xr(e.doc, c.line).text).length == c.ch) {
        var u = Wl(a, a.length, e.options.tabSize) - a.length;
        c = Po(c.line, Math.max(0, Math.round((o - Ue(e.display).left) / yt(e.display)) - u))
      }
      return c
    }

    function Kt(e) {
      var t = this,
        n = t.display;
      if (!(n.activeTouch && n.input.supportsTouch() || wi(t, e))) {
        if (n.shift = e.shiftKey, Ut(n, e)) return void(mo || (n.scroller.draggable = !1, setTimeout(function() {
          n.scroller.draggable = !0
        }, 100)));
        if (!Qt(t, e)) {
          var r = Vt(t, e);
          switch (window.focus(), bi(e)) {
            case 1:
              r ? _t(t, e, r) : yi(e) == n.scroller && Cl(e);
              break;
            case 2:
              mo && (t.state.lastMiddleDown = +new Date), r && Ce(t.doc, r), setTimeout(function() {
                n.input.focus()
              }, 20), Cl(e);
              break;
            case 3:
              Oo ? mn(t, e) : hn(t)
          }
        }
      }
    }

    function _t(e, t, n) {
      po ? setTimeout(Ei($, e), 0) : e.curOp.focus = Gi();
      var r, i = +new Date;
      Io && Io.time > i - 400 && 0 == Wo(Io.pos, n) ? r = "triple" : Fo && Fo.time > i - 400 && 0 == Wo(Fo.pos, n) ? (r = "double", Io = {
        time: i,
        pos: n
      }) : (r = "single", Fo = {
        time: i,
        pos: n
      });
      var o, l = e.doc.sel,
        s = ko ? t.metaKey : t.ctrlKey;
      e.options.dragDrop && Kl && !Q(e) && "single" == r && (o = l.contains(n)) > -1 && (Wo((o = l.ranges[o]).from(), n) < 0 || n.xRel > 0) && (Wo(o.to(), n) > 0 || n.xRel < 0) ? Xt(e, t, n, s) : Yt(e, t, n, r, s)
    }

    function Xt(e, t, n, r) {
      var i = e.display,
        o = +new Date,
        l = Ot(e, function(s) {
          mo && (i.scroller.draggable = !1), e.state.draggingText = !1, kl(document, "mouseup", l), kl(i.scroller, "drop", l), Math.abs(t.clientX - s.clientX) + Math.abs(t.clientY - s.clientY) < 10 && (Cl(s), !r && +new Date - 200 < o && Ce(e.doc, n), mo || po && 9 == go ? setTimeout(function() {
            document.body.focus(), i.input.focus()
          }, 20) : i.input.focus())
        });
      mo && (i.scroller.draggable = !0), e.state.draggingText = l, i.scroller.dragDrop && i.scroller.dragDrop(), Ll(document, "mouseup", l), Ll(i.scroller, "drop", l)
    }

    function Yt(e, t, n, r, i) {
      function o(t) {
        if (0 != Wo(m, t))
          if (m = t, "rect" == r) {
            for (var i = [], o = e.options.tabSize, l = Wl(Xr(c, n.line).text, n.ch, o), s = Wl(Xr(c, t.line).text, t.ch, o), a = Math.min(l, s), h = Math.max(l, s), p = Math.min(n.line, t.line), g = Math.min(e.lastLine(), Math.max(n.line, t.line)); g >= p; p++) {
              var v = Xr(c, p).text,
                y = Mi(v, a, o);
              a == h ? i.push(new de(Po(p, y), Po(p, y))) : v.length > y && i.push(new de(Po(p, y), Po(p, Mi(v, h, o))))
            }
            i.length || i.push(new de(n, n)), Me(c, he(d.ranges.slice(0, f).concat(i), f), {
              origin: "*mouse",
              scroll: !1
            }), e.scrollIntoView(t)
          } else {
            var b = u,
              x = b.anchor,
              C = t;
            if ("single" != r) {
              if ("double" == r) var w = e.findWordAt(t);
              else var w = new de(Po(t.line, 0), me(c, Po(t.line + 1, 0)));
              Wo(w.anchor, x) > 0 ? (C = w.head, x = Y(b.from(), w.anchor)) : (C = w.anchor, x = X(b.to(), w.head))
            }
            var i = d.ranges.slice(0);
            i[f] = new de(me(c, x), C), Me(c, he(i, f), Hl)
          }
      }

      function l(t) {
        var n = ++y,
          i = Vt(e, t, !0, "rect" == r);
        if (i)
          if (0 != Wo(i, m)) {
            e.curOp.focus = Gi(), o(i);
            var s = x(a, c);
            (i.line >= s.to || i.line < s.from) && setTimeout(Ot(e, function() {
              y == n && l(t)
            }), 150)
          } else {
            var u = t.clientY < v.top ? -20 : t.clientY > v.bottom ? 20 : 0;
            u && setTimeout(Ot(e, function() {
              y == n && (a.scroller.scrollTop += u, l(t))
            }), 50)
          }
      }

      function s(e) {
        y = 1 / 0, Cl(e), a.input.focus(), kl(document, "mousemove", b), kl(document, "mouseup", C), c.history.lastSelOrigin = null
      }
      var a = e.display,
        c = e.doc;
      Cl(t);
      var u, f, d = c.sel,
        h = d.ranges;
      if (i && !t.shiftKey ? (f = c.sel.contains(n), u = f > -1 ? h[f] : new de(n, n)) : (u = c.sel.primary(), f = c.sel.primIndex), t.altKey) r = "rect", i || (u = new de(n, n)), n = Vt(e, t, !0, !0), f = -1;
      else if ("double" == r) {
        var p = e.findWordAt(n);
        u = e.display.shift || c.extend ? xe(c, u, p.anchor, p.head) : p
      } else if ("triple" == r) {
        var g = new de(Po(n.line, 0), me(c, Po(n.line + 1, 0)));
        u = e.display.shift || c.extend ? xe(c, u, g.anchor, g.head) : g
      } else u = xe(c, u, n);
      i ? -1 == f ? (f = h.length, Me(c, he(h.concat([u]), f), {
        scroll: !1,
        origin: "*mouse"
      })) : h.length > 1 && h[f].empty() && "single" == r && !t.shiftKey ? (Me(c, he(h.slice(0, f).concat(h.slice(f + 1)), 0)), d = c.sel) : Se(c, f, u, Hl) : (f = 0, Me(c, new fe([u], 0), Hl), d = c.sel);
      var m = n,
        v = a.wrapper.getBoundingClientRect(),
        y = 0,
        b = Ot(e, function(e) {
          bi(e) ? l(e) : s(e)
        }),
        C = Ot(e, s);
      Ll(document, "mousemove", b), Ll(document, "mouseup", C)
    }

    function $t(e, t, n, r, i) {
      try {
        var o = t.clientX,
          l = t.clientY
      } catch (t) {
        return !1
      }
      if (o >= Math.floor(e.display.gutters.getBoundingClientRect().right)) return !1;
      r && Cl(t);
      var s = e.display,
        a = s.lineDiv.getBoundingClientRect();
      if (l > a.bottom || !Li(e, n)) return vi(t);
      l -= a.top - s.viewOffset;
      for (var c = 0; c < e.options.gutters.length; ++c) {
        var u = s.gutters.childNodes[c];
        if (u && u.getBoundingClientRect().right >= o) {
          var f = Jr(e.doc, l),
            d = e.options.gutters[c];
          return i(e, n, e, f, d, t), vi(t)
        }
      }
    }

    function Qt(e, t) {
      return $t(e, t, "gutterClick", !0, xi)
    }

    function Zt(e) {
      var t = this;
      if (!wi(t, e) && !Ut(t.display, e)) {
        Cl(e), po && (jo = +new Date);
        var n = Vt(t, e, !0),
          r = e.dataTransfer.files;
        if (n && !Q(t))
          if (r && r.length && window.FileReader && window.File)
            for (var i = r.length, o = Array(i), l = 0, s = function(e, r) {
                var s = new FileReader;
                s.onload = Ot(t, function() {
                  if (o[r] = s.result, ++l == i) {
                    n = me(t.doc, n);
                    var e = {
                      from: n,
                      to: n,
                      text: t.doc.splitLines(o.join(t.doc.lineSeparator())),
                      origin: "paste"
                    };
                    Sn(t.doc, e), Te(t.doc, pe(n, _o(e)))
                  }
                }), s.readAsText(e)
              }, a = 0; i > a; ++a) s(r[a], a);
          else {
            if (t.state.draggingText && t.doc.sel.contains(n) > -1) return t.state.draggingText(e), void setTimeout(function() {
              t.display.input.focus()
            }, 20);
            try {
              var o = e.dataTransfer.getData("Text");
              if (o) {
                if (t.state.draggingText && !(ko ? e.altKey : e.ctrlKey)) var c = t.listSelections();
                if (Ae(t.doc, pe(n, n)), c)
                  for (var a = 0; a < c.length; ++a) On(t.doc, "", c[a].anchor, c[a].head, "drag");
                t.replaceSelection(o, "around", "paste"), t.display.input.focus()
              }
            } catch (e) {}
          }
      }
    }

    function Jt(e, t) {
      if (po && (!e.state.draggingText || +new Date - jo < 100)) return void Sl(t);
      if (!wi(e, t) && !Ut(e.display, t) && (t.dataTransfer.setData("Text", e.getSelection()), t.dataTransfer.setDragImage && !xo)) {
        var n = Ri("img", null, null, "position: fixed; left: 0; top: 0;");
        n.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", bo && (n.width = n.height = 1, e.display.wrapper.appendChild(n), n._top = n.offsetTop), t.dataTransfer.setDragImage(n, 0, 0), bo && n.parentNode.removeChild(n)
      }
    }

    function en(e, t) {
      Math.abs(e.doc.scrollTop - t) < 2 || (e.doc.scrollTop = t, uo || O(e, {
        top: t
      }), e.display.scroller.scrollTop != t && (e.display.scroller.scrollTop = t), e.display.scrollbars.setScrollTop(t), uo && O(e), ze(e, 100))
    }

    function tn(e, t, n) {
      (n ? t == e.doc.scrollLeft : Math.abs(e.doc.scrollLeft - t) < 2) || (t = Math.min(t, e.display.scroller.scrollWidth - e.display.scroller.clientWidth), e.doc.scrollLeft = t, C(e), e.display.scroller.scrollLeft != t && (e.display.scroller.scrollLeft = t), e.display.scrollbars.setScrollLeft(t))
    }

    function nn(e, t) {
      var n = Uo(t),
        r = n.x,
        i = n.y,
        o = e.display,
        l = o.scroller;
      if (r && l.scrollWidth > l.clientWidth || i && l.scrollHeight > l.clientHeight) {
        if (i && ko && mo) e: for (var s = t.target, a = o.view; s != l; s = s.parentNode)
          for (var c = 0; c < a.length; c++)
            if (a[c].node == s) {
              e.display.currentWheelTarget = s;
              break e
            } if (r && !uo && !bo && null != qo) return i && en(e, Math.max(0, Math.min(l.scrollTop + i * qo, l.scrollHeight - l.clientHeight))), tn(e, Math.max(0, Math.min(l.scrollLeft + r * qo, l.scrollWidth - l.clientWidth))), Cl(t), void(o.wheelStartX = null);
        if (i && null != qo) {
          var u = i * qo,
            f = e.doc.scrollTop,
            d = f + o.wrapper.clientHeight;
          0 > u ? f = Math.max(0, f + u - 50) : d = Math.min(e.doc.height, d + u + 50), O(e, {
            top: f,
            bottom: d
          })
        }
        20 > Go && (null == o.wheelStartX ? (o.wheelStartX = l.scrollLeft, o.wheelStartY = l.scrollTop, o.wheelDX = r, o.wheelDY = i, setTimeout(function() {
          if (null != o.wheelStartX) {
            var e = l.scrollLeft - o.wheelStartX,
              t = l.scrollTop - o.wheelStartY,
              n = t && o.wheelDY && t / o.wheelDY || e && o.wheelDX && e / o.wheelDX;
            o.wheelStartX = o.wheelStartY = null, n && (qo = (qo * Go + n) / (Go + 1), ++Go)
          }
        }, 200)) : (o.wheelDX += r, o.wheelDY += i))
      }
    }

    function rn(e, t, n) {
      if ("string" == typeof t && (t = il[t], !t)) return !1;
      e.display.input.ensurePolled();
      var r = e.display.shift,
        i = !1;
      try {
        Q(e) && (e.state.suppressEdits = !0), n && (e.display.shift = !1), i = t(e) != Ol
      } finally {
        e.display.shift = r, e.state.suppressEdits = !1
      }
      return i
    }

    function on(e, t, n) {
      for (var r = 0; r < e.state.keyMaps.length; r++) {
        var i = ll(t, e.state.keyMaps[r], n, e);
        if (i) return i
      }
      return e.options.extraKeys && ll(t, e.options.extraKeys, n, e) || ll(t, e.options.keyMap, n, e)
    }

    function ln(e, t, n, r) {
      var i = e.state.keySeq;
      if (i) {
        if (sl(t)) return "handled";
        Vo.set(50, function() {
          e.state.keySeq == i && (e.state.keySeq = null, e.display.input.reset())
        }), t = i + " " + t
      }
      var o = on(e, t, r);
      return "multi" == o && (e.state.keySeq = t), "handled" == o && xi(e, "keyHandled", e, t, n), ("handled" == o || "multi" == o) && (Cl(n), Ie(e)), i && !o && /\'$/.test(t) ? (Cl(n), !0) : !!o
    }

    function sn(e, t) {
      var n = al(t, !0);
      return n ? t.shiftKey && !e.state.keySeq ? ln(e, "Shift-" + n, t, function(t) {
        return rn(e, t, !0)
      }) || ln(e, n, t, function(t) {
        return ("string" == typeof t ? /^go[A-Z]/.test(t) : t.motion) ? rn(e, t) : void 0
      }) : ln(e, n, t, function(t) {
        return rn(e, t)
      }) : !1
    }

    function an(e, t, n) {
      return ln(e, "'" + n + "'", t, function(t) {
        return rn(e, t, !0)
      })
    }

    function cn(e) {
      var t = this;
      if (t.curOp.focus = Gi(), !wi(t, e)) {
        po && 11 > go && 27 == e.keyCode && (e.returnValue = !1);
        var n = e.keyCode;
        t.display.shift = 16 == n || e.shiftKey;
        var r = sn(t, e);
        bo && (Ko = r ? n : null, !r && 88 == n && !Yl && (ko ? e.metaKey : e.ctrlKey) && t.replaceSelection("", null, "cut")), 18 != n || /\bCodeMirror-crosshair\b/.test(t.display.lineDiv.className) || un(t)
      }
    }

    function un(e) {
      function t(e) {
        18 != e.keyCode && e.altKey || (ql(n, "CodeMirror-crosshair"), kl(document, "keyup", t), kl(document, "mouseover", t))
      }
      var n = e.display.lineDiv;
      Ul(n, "CodeMirror-crosshair"), Ll(document, "keyup", t), Ll(document, "mouseover", t)
    }

    function fn(e) {
      16 == e.keyCode && (this.doc.sel.shift = !1), wi(this, e)
    }

    function dn(e) {
      var t = this;
      if (!(Ut(t.display, e) || wi(t, e) || e.ctrlKey && !e.altKey || ko && e.metaKey)) {
        var n = e.keyCode,
          r = e.charCode;
        if (bo && n == Ko) return Ko = null, void Cl(e);
        if (!bo || e.which && !(e.which < 10) || !sn(t, e)) {
          var i = String.fromCharCode(null == r ? n : r);
          an(t, e, i) || t.display.input.onKeyPress(e)
        }
      }
    }

    function hn(e) {
      e.state.delayingBlurEvent = !0, setTimeout(function() {
        e.state.delayingBlurEvent && (e.state.delayingBlurEvent = !1, gn(e))
      }, 100)
    }

    function pn(e) {
      e.state.delayingBlurEvent && (e.state.delayingBlurEvent = !1), "nocursor" != e.options.readOnly && (e.state.focused || (Tl(e, "focus", e), e.state.focused = !0, Ul(e.display.wrapper, "CodeMirror-focused"), e.curOp || e.display.selForContextMenu == e.doc.sel || (e.display.input.reset(), mo && setTimeout(function() {
        e.display.input.reset(!0)
      }, 20)), e.display.input.receivedFocus()), Ie(e))
    }

    function gn(e) {
      e.state.delayingBlurEvent || (e.state.focused && (Tl(e, "blur", e), e.state.focused = !1, ql(e.display.wrapper, "CodeMirror-focused")), clearInterval(e.display.blinker), setTimeout(function() {
        e.state.focused || (e.display.shift = !1)
      }, 150))
    }

    function mn(e, t) {
      Ut(e.display, t) || vn(e, t) || e.display.input.onContextMenu(t)
    }

    function vn(e, t) {
      return Li(e, "gutterContextMenu") ? $t(e, t, "gutterContextMenu", !1, Tl) : !1
    }

    function yn(e, t) {
      if (Wo(e, t.from) < 0) return e;
      if (Wo(e, t.to) <= 0) return _o(t);
      var n = e.line + t.text.length - (t.to.line - t.from.line) - 1,
        r = e.ch;
      return e.line == t.to.line && (r += _o(t).ch - t.to.ch), Po(n, r)
    }

    function bn(e, t) {
      for (var n = [], r = 0; r < e.sel.ranges.length; r++) {
        var i = e.sel.ranges[r];
        n.push(new de(yn(i.anchor, t), yn(i.head, t)))
      }
      return he(n, e.sel.primIndex)
    }

    function xn(e, t, n) {
      return e.line == t.line ? Po(n.line, e.ch - t.ch + n.ch) : Po(n.line + (e.line - t.line), e.ch)
    }

    function Cn(e, t, n) {
      for (var r = [], i = Po(e.first, 0), o = i, l = 0; l < t.length; l++) {
        var s = t[l],
          a = xn(s.from, i, o),
          c = xn(_o(s), i, o);
        if (i = s.to, o = c, "around" == n) {
          var u = e.sel.ranges[l],
            f = Wo(u.head, u.anchor) < 0;
          r[l] = new de(f ? c : a, f ? a : c)
        } else r[l] = new de(a, a)
      }
      return new fe(r, e.sel.primIndex)
    }

    function wn(e, t, n) {
      var r = {
        canceled: !1,
        from: t.from,
        to: t.to,
        text: t.text,
        origin: t.origin,
        cancel: function() {
          this.canceled = !0
        }
      };
      return n && (r.update = function(t, n, r, i) {
        t && (this.from = me(e, t)), n && (this.to = me(e, n)), r && (this.text = r), void 0 !== i && (this.origin = i)
      }), Tl(e, "beforeChange", e, r), e.cm && Tl(e.cm, "beforeChange", e.cm, r), r.canceled ? null : {
        from: r.from,
        to: r.to,
        text: r.text,
        origin: r.origin
      }
    }

    function Sn(e, t, n) {
      if (e.cm) {
        if (!e.cm.curOp) return Ot(e.cm, Sn)(e, t, n);
        if (e.cm.state.suppressEdits) return
      }
      if (!(Li(e, "beforeChange") || e.cm && Li(e.cm, "beforeChange")) || (t = wn(e, t, !0))) {
        var r = No && !n && or(e, t.from, t.to);
        if (r)
          for (var i = r.length - 1; i >= 0; --i) Ln(e, {
            from: r[i].from,
            to: r[i].to,
            text: i ? [""] : t.text
          });
        else Ln(e, t)
      }
    }

    function Ln(e, t) {
      if (1 != t.text.length || "" != t.text[0] || 0 != Wo(t.from, t.to)) {
        var n = bn(e, t);
        li(e, t, n, e.cm ? e.cm.curOp.id : 0 / 0), Mn(e, t, n, nr(e, t));
        var r = [];
        Kr(e, function(e, n) {
          n || -1 != Ni(r, e.history) || (mi(e.history, t), r.push(e.history)), Mn(e, t, null, nr(e, t))
        })
      }
    }

    function kn(e, t, n) {
      if (!e.cm || !e.cm.state.suppressEdits) {
        for (var r, i = e.history, o = e.sel, l = "undo" == t ? i.done : i.undone, s = "undo" == t ? i.undone : i.done, a = 0; a < l.length && (r = l[a], n ? !r.ranges || r.equals(e.sel) : r.ranges); a++);
        if (a != l.length) {
          for (i.lastOrigin = i.lastSelOrigin = null; r = l.pop(), r.ranges;) {
            if (ci(r, s), n && !r.equals(e.sel)) return void Me(e, r, {
              clearRedo: !1
            });
            o = r
          }
          var c = [];
          ci(o, s), s.push({
            changes: c,
            generation: i.generation
          }), i.generation = r.generation || ++i.maxGeneration;
          for (var u = Li(e, "beforeChange") || e.cm && Li(e.cm, "beforeChange"), a = r.changes.length - 1; a >= 0; --a) {
            var f = r.changes[a];
            if (f.origin = t, u && !wn(e, f, !1)) return void(l.length = 0);
            c.push(ri(e, f));
            var d = a ? bn(e, f) : Oi(l);
            Mn(e, f, d, ir(e, f)), !a && e.cm && e.cm.scrollIntoView({
              from: f.from,
              to: _o(f)
            });
            var h = [];
            Kr(e, function(e, t) {
              t || -1 != Ni(h, e.history) || (mi(e.history, f), h.push(e.history)), Mn(e, f, null, ir(e, f))
            })
          }
        }
      }
    }

    function Tn(e, t) {
      if (0 != t && (e.first += t, e.sel = new fe(Hi(e.sel.ranges, function(e) {
          return new de(Po(e.anchor.line + t, e.anchor.ch), Po(e.head.line + t, e.head.ch))
        }), e.sel.primIndex), e.cm)) {
        Dt(e.cm, e.first, e.first - t, t);
        for (var n = e.cm.display, r = n.viewFrom; r < n.viewTo; r++) Et(e.cm, r, "gutter")
      }
    }

    function Mn(e, t, n, r) {
      if (e.cm && !e.cm.curOp) return Ot(e.cm, Mn)(e, t, n, r);
      if (t.to.line < e.first) return void Tn(e, t.text.length - 1 - (t.to.line - t.from.line));
      if (!(t.from.line > e.lastLine())) {
        if (t.from.line < e.first) {
          var i = t.text.length - 1 - (e.first - t.from.line);
          Tn(e, i), t = {
            from: Po(e.first, 0),
            to: Po(t.to.line + i, t.to.ch),
            text: [Oi(t.text)],
            origin: t.origin
          }
        }
        var o = e.lastLine();
        t.to.line > o && (t = {
          from: t.from,
          to: Po(o, Xr(e, o).text.length),
          text: [t.text[0]],
          origin: t.origin
        }), t.removed = Yr(e, t.from, t.to), n || (n = bn(e, t)), e.cm ? An(e.cm, t, r) : qr(e, t, r), Ae(e, n, Nl)
      }
    }

    function An(e, t, n) {
      var r = e.doc,
        i = e.display,
        l = t.from,
        s = t.to,
        a = !1,
        c = l.line;
      e.options.lineWrapping || (c = Zr(gr(Xr(r, l.line))), r.iter(c, s.line + 1, function(e) {
        return e == i.maxLine ? (a = !0, !0) : void 0
      })), r.sel.contains(t.from, t.to) > -1 && Si(e), qr(r, t, n, o(e)), e.options.lineWrapping || (r.iter(c, l.line + t.text.length, function(e) {
        var t = f(e);
        t > i.maxLineLength && (i.maxLine = e, i.maxLineLength = t, i.maxLineChanged = !0, a = !1)
      }), a && (e.curOp.updateMaxLine = !0)), r.frontier = Math.min(r.frontier, l.line), ze(e, 400);
      var u = t.text.length - (s.line - l.line) - 1;
      t.full ? Dt(e) : l.line != s.line || 1 != t.text.length || Gr(e.doc, t) ? Dt(e, l.line, s.line + 1, u) : Et(e, l.line, "text");
      var d = Li(e, "changes"),
        h = Li(e, "change");
      if (h || d) {
        var p = {
          from: l,
          to: s,
          text: t.text,
          removed: t.removed,
          origin: t.origin
        };
        h && xi(e, "change", e, p), d && (e.curOp.changeObjs || (e.curOp.changeObjs = [])).push(p)
      }
      e.display.selForContextMenu = null
    }

    function On(e, t, n, r, i) {
      if (r || (r = n), Wo(r, n) < 0) {
        var o = r;
        r = n, n = o
      }
      "string" == typeof t && (t = e.splitLines(t)), Sn(e, {
        from: n,
        to: r,
        text: t,
        origin: i
      })
    }

    function Nn(e, t) {
      if (!wi(e, "scrollCursorIntoView")) {
        var n = e.display,
          r = n.sizer.getBoundingClientRect(),
          i = null;
        if (t.top + r.top < 0 ? i = !0 : t.bottom + r.top > (window.innerHeight || document.documentElement.clientHeight) && (i = !1), null != i && !wo) {
          var o = Ri("div", "​", null, "position: absolute; top: " + (t.top - n.viewOffset - Ge(e.display)) + "px; height: " + (t.bottom - t.top + Ve(e) + n.barHeight) + "px; left: " + t.left + "px; width: 2px;");
          e.display.lineSpace.appendChild(o), o.scrollIntoView(i), e.display.lineSpace.removeChild(o)
        }
      }
    }

    function Hn(e, t, n, r) {
      null == r && (r = 0);
      for (var i = 0; 5 > i; i++) {
        var o = !1,
          l = dt(e, t),
          s = n && n != t ? dt(e, n) : l,
          a = Wn(e, Math.min(l.left, s.left), Math.min(l.top, s.top) - r, Math.max(l.left, s.left), Math.max(l.bottom, s.bottom) + r),
          c = e.doc.scrollTop,
          u = e.doc.scrollLeft;
        if (null != a.scrollTop && (en(e, a.scrollTop), Math.abs(e.doc.scrollTop - c) > 1 && (o = !0)), null != a.scrollLeft && (tn(e, a.scrollLeft), Math.abs(e.doc.scrollLeft - u) > 1 && (o = !0)), !o) break
      }
      return l
    }

    function Pn(e, t, n, r, i) {
      var o = Wn(e, t, n, r, i);
      null != o.scrollTop && en(e, o.scrollTop), null != o.scrollLeft && tn(e, o.scrollLeft)
    }

    function Wn(e, t, n, r, i) {
      var o = e.display,
        l = vt(e.display);
      0 > n && (n = 0);
      var s = e.curOp && null != e.curOp.scrollTop ? e.curOp.scrollTop : o.scroller.scrollTop,
        a = _e(e),
        c = {};
      i - n > a && (i = n + a);
      var u = e.doc.height + qe(o),
        f = l > n,
        d = i > u - l;
      if (s > n) c.scrollTop = f ? 0 : n;
      else if (i > s + a) {
        var h = Math.min(n, (d ? u : i) - a);
        h != s && (c.scrollTop = h)
      }
      var p = e.curOp && null != e.curOp.scrollLeft ? e.curOp.scrollLeft : o.scroller.scrollLeft,
        g = Ke(e) - (e.options.fixedGutter ? o.gutters.offsetWidth : 0),
        m = r - t > g;
      return m && (r = t + g), 10 > t ? c.scrollLeft = 0 : p > t ? c.scrollLeft = Math.max(0, t - (m ? 0 : 10)) : r > g + p - 3 && (c.scrollLeft = r + (m ? 0 : 10) - g), c
    }

    function Dn(e, t, n) {
      (null != t || null != n) && Fn(e), null != t && (e.curOp.scrollLeft = (null == e.curOp.scrollLeft ? e.doc.scrollLeft : e.curOp.scrollLeft) + t), null != n && (e.curOp.scrollTop = (null == e.curOp.scrollTop ? e.doc.scrollTop : e.curOp.scrollTop) + n)
    }

    function En(e) {
      Fn(e);
      var t = e.getCursor(),
        n = t,
        r = t;
      e.options.lineWrapping || (n = t.ch ? Po(t.line, t.ch - 1) : t, r = Po(t.line, t.ch + 1)), e.curOp.scrollToPos = {
        from: n,
        to: r,
        margin: e.options.cursorScrollMargin,
        isCursor: !0
      }
    }

    function Fn(e) {
      var t = e.curOp.scrollToPos;
      if (t) {
        e.curOp.scrollToPos = null;
        var n = ht(e, t.from),
          r = ht(e, t.to),
          i = Wn(e, Math.min(n.left, r.left), Math.min(n.top, r.top) - t.margin, Math.max(n.right, r.right), Math.max(n.bottom, r.bottom) + t.margin);
        e.scrollTo(i.scrollLeft, i.scrollTop)
      }
    }

    function In(e, t, n, r) {
      var i, o = e.doc;
      null == n && (n = "add"), "smart" == n && (o.mode.indent ? i = je(e, t) : n = "prev");
      var l = e.options.tabSize,
        s = Xr(o, t),
        a = Wl(s.text, null, l);
      s.stateAfter && (s.stateAfter = null);
      var c, u = s.text.match(/^\s*/)[0];
      if (r || /\S/.test(s.text)) {
        if ("smart" == n && (c = o.mode.indent(i, s.text.slice(u.length), s.text), c == Ol || c > 150)) {
          if (!r) return;
          n = "prev"
        }
      } else c = 0, n = "not";
      "prev" == n ? c = t > o.first ? Wl(Xr(o, t - 1).text, null, l) : 0 : "add" == n ? c = a + e.options.indentUnit : "subtract" == n ? c = a - e.options.indentUnit : "number" == typeof n && (c = a + n), c = Math.max(0, c);
      var f = "",
        d = 0;
      if (e.options.indentWithTabs)
        for (var h = Math.floor(c / l); h; --h) d += l, f += "	";
      if (c > d && (f += Ai(c - d)), f != u) return On(o, f, Po(t, 0), Po(t, u.length), "+input"), s.stateAfter = null, !0;
      for (var h = 0; h < o.sel.ranges.length; h++) {
        var p = o.sel.ranges[h];
        if (p.head.line == t && p.head.ch < u.length) {
          var d = Po(t, u.length);
          Se(o, h, new de(d, d));
          break
        }
      }
    }

    function zn(e, t, n, r) {
      var i = t,
        o = t;
      return "number" == typeof t ? o = Xr(e, ge(e, t)) : i = Zr(t), null == i ? null : (r(o, i) && e.cm && Et(e.cm, i, n), o)
    }

    function Rn(e, t) {
      for (var n = e.doc.sel.ranges, r = [], i = 0; i < n.length; i++) {
        for (var o = t(n[i]); r.length && Wo(o.from, Oi(r).to) <= 0;) {
          var l = r.pop();
          if (Wo(l.from, o.from) < 0) {
            o.from = l.from;
            break
          }
        }
        r.push(o)
      }
      At(e, function() {
        for (var t = r.length - 1; t >= 0; t--) On(e.doc, "", r[t].from, r[t].to, "+delete");
        En(e)
      })
    }

    function Bn(e, t, n, r, i) {
      function o() {
        var t = s + n;

        return t < e.first || t >= e.first + e.size ? f = !1 : (s = t, u = Xr(e, t))
      }

      function l(e) {
        var t = (i ? ao : co)(u, a, n, !0);
        if (null == t) {
          if (e || !o()) return f = !1;
          a = i ? (0 > n ? to : eo)(u) : 0 > n ? u.text.length : 0
        } else a = t;
        return !0
      }
      var s = t.line,
        a = t.ch,
        c = n,
        u = Xr(e, s),
        f = !0;
      if ("char" == r) l();
      else if ("column" == r) l(!0);
      else if ("word" == r || "group" == r)
        for (var d = null, h = "group" == r, p = e.cm && e.cm.getHelper(t, "wordChars"), g = !0; !(0 > n) || l(!g); g = !1) {
          var m = u.text.charAt(a) || "\n",
            v = Fi(m, p) ? "w" : h && "\n" == m ? "n" : !h || /\s/.test(m) ? null : "p";
          if (!h || g || v || (v = "s"), d && d != v) {
            0 > n && (n = 1, l());
            break
          }
          if (v && (d = v), n > 0 && !l(!g)) break
        }
      var y = Pe(e, Po(s, a), c, !0);
      return f || (y.hitSide = !0), y
    }

    function jn(e, t, n, r) {
      var i, o = e.doc,
        l = t.left;
      if ("page" == r) {
        var s = Math.min(e.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
        i = t.top + n * (s - (0 > n ? 1.5 : .5) * vt(e.display))
      } else "line" == r && (i = n > 0 ? t.bottom + 3 : t.top - 3);
      for (;;) {
        var a = gt(e, l, i);
        if (!a.outside) break;
        if (0 > n ? 0 >= i : i >= o.height) {
          a.hitSide = !0;
          break
        }
        i += 5 * n
      }
      return a
    }

    function Gn(t, n, r, i) {
      e.defaults[t] = n, r && (Yo[t] = i ? function(e, t, n) {
        n != $o && r(e, t, n)
      } : r)
    }

    function qn(e) {
      for (var t, n, r, i, o = e.split(/-(?!$)/), e = o[o.length - 1], l = 0; l < o.length - 1; l++) {
        var s = o[l];
        if (/^(cmd|meta|m)$/i.test(s)) i = !0;
        else if (/^a(lt)?$/i.test(s)) t = !0;
        else if (/^(c|ctrl|control)$/i.test(s)) n = !0;
        else {
          if (!/^s(hift)$/i.test(s)) throw new Error("Unrecognized modifier name: " + s);
          r = !0
        }
      }
      return t && (e = "Alt-" + e), n && (e = "Ctrl-" + e), i && (e = "Cmd-" + e), r && (e = "Shift-" + e), e
    }

    function Un(e) {
      return "string" == typeof e ? ol[e] : e
    }

    function Vn(e, t, n, r, i) {
      if (r && r.shared) return Kn(e, t, n, r, i);
      if (e.cm && !e.cm.curOp) return Ot(e.cm, Vn)(e, t, n, r, i);
      var o = new fl(e, i),
        l = Wo(t, n);
      if (r && Di(r, o, !1), l > 0 || 0 == l && o.clearWhenEmpty !== !1) return o;
      if (o.replacedWith && (o.collapsed = !0, o.widgetNode = Ri("span", [o.replacedWith], "CodeMirror-widget"), r.handleMouseEvents || o.widgetNode.setAttribute("cm-ignore-events", "true"), r.insertLeft && (o.widgetNode.insertLeft = !0)), o.collapsed) {
        if (pr(e, t.line, t, n, o) || t.line != n.line && pr(e, n.line, t, n, o)) throw new Error("Inserting collapsed marker partially overlapping an existing one");
        Ho = !0
      }
      o.addToHistory && li(e, {
        from: t,
        to: n,
        origin: "markText"
      }, e.sel, 0 / 0);
      var s, a = t.line,
        c = e.cm;
      if (e.iter(a, n.line + 1, function(e) {
          c && o.collapsed && !c.options.lineWrapping && gr(e) == c.display.maxLine && (s = !0), o.collapsed && a != t.line && Qr(e, 0), Jn(e, new $n(o, a == t.line ? t.ch : null, a == n.line ? n.ch : null)), ++a
        }), o.collapsed && e.iter(t.line, n.line + 1, function(t) {
          br(e, t) && Qr(t, 0)
        }), o.clearOnEnter && Ll(o, "beforeCursorEnter", function() {
          o.clear()
        }), o.readOnly && (No = !0, (e.history.done.length || e.history.undone.length) && e.clearHistory()), o.collapsed && (o.id = ++ul, o.atomic = !0), c) {
        if (s && (c.curOp.updateMaxLine = !0), o.collapsed) Dt(c, t.line, n.line + 1);
        else if (o.className || o.title || o.startStyle || o.endStyle || o.css)
          for (var u = t.line; u <= n.line; u++) Et(c, u, "text");
        o.atomic && Ne(c.doc), xi(c, "markerAdded", c, o)
      }
      return o
    }

    function Kn(e, t, n, r, i) {
      r = Di(r), r.shared = !1;
      var o = [Vn(e, t, n, r, i)],
        l = o[0],
        s = r.widgetNode;
      return Kr(e, function(e) {
        s && (r.widgetNode = s.cloneNode(!0)), o.push(Vn(e, me(e, t), me(e, n), r, i));
        for (var a = 0; a < e.linked.length; ++a)
          if (e.linked[a].isParent) return;
        l = Oi(o)
      }), new dl(o, l)
    }

    function _n(e) {
      return e.findMarks(Po(e.first, 0), e.clipPos(Po(e.lastLine())), function(e) {
        return e.parent
      })
    }

    function Xn(e, t) {
      for (var n = 0; n < t.length; n++) {
        var r = t[n],
          i = r.find(),
          o = e.clipPos(i.from),
          l = e.clipPos(i.to);
        if (Wo(o, l)) {
          var s = Vn(e, o, l, r.primary, r.primary.type);
          r.markers.push(s), s.parent = r
        }
      }
    }

    function Yn(e) {
      for (var t = 0; t < e.length; t++) {
        var n = e[t],
          r = [n.primary.doc];
        Kr(n.primary.doc, function(e) {
          r.push(e)
        });
        for (var i = 0; i < n.markers.length; i++) {
          var o = n.markers[i]; - 1 == Ni(r, o.doc) && (o.parent = null, n.markers.splice(i--, 1))
        }
      }
    }

    function $n(e, t, n) {
      this.marker = e, this.from = t, this.to = n
    }

    function Qn(e, t) {
      if (e)
        for (var n = 0; n < e.length; ++n) {
          var r = e[n];
          if (r.marker == t) return r
        }
    }

    function Zn(e, t) {
      for (var n, r = 0; r < e.length; ++r) e[r] != t && (n || (n = [])).push(e[r]);
      return n
    }

    function Jn(e, t) {
      e.markedSpans = e.markedSpans ? e.markedSpans.concat([t]) : [t], t.marker.attachLine(e)
    }

    function er(e, t, n) {
      if (e)
        for (var r, i = 0; i < e.length; ++i) {
          var o = e[i],
            l = o.marker,
            s = null == o.from || (l.inclusiveLeft ? o.from <= t : o.from < t);
          if (s || o.from == t && "bookmark" == l.type && (!n || !o.marker.insertLeft)) {
            var a = null == o.to || (l.inclusiveRight ? o.to >= t : o.to > t);
            (r || (r = [])).push(new $n(l, o.from, a ? null : o.to))
          }
        }
      return r
    }

    function tr(e, t, n) {
      if (e)
        for (var r, i = 0; i < e.length; ++i) {
          var o = e[i],
            l = o.marker,
            s = null == o.to || (l.inclusiveRight ? o.to >= t : o.to > t);
          if (s || o.from == t && "bookmark" == l.type && (!n || o.marker.insertLeft)) {
            var a = null == o.from || (l.inclusiveLeft ? o.from <= t : o.from < t);
            (r || (r = [])).push(new $n(l, a ? null : o.from - t, null == o.to ? null : o.to - t))
          }
        }
      return r
    }

    function nr(e, t) {
      if (t.full) return null;
      var n = ye(e, t.from.line) && Xr(e, t.from.line).markedSpans,
        r = ye(e, t.to.line) && Xr(e, t.to.line).markedSpans;
      if (!n && !r) return null;
      var i = t.from.ch,
        o = t.to.ch,
        l = 0 == Wo(t.from, t.to),
        s = er(n, i, l),
        a = tr(r, o, l),
        c = 1 == t.text.length,
        u = Oi(t.text).length + (c ? i : 0);
      if (s)
        for (var f = 0; f < s.length; ++f) {
          var d = s[f];
          if (null == d.to) {
            var h = Qn(a, d.marker);
            h ? c && (d.to = null == h.to ? null : h.to + u) : d.to = i
          }
        }
      if (a)
        for (var f = 0; f < a.length; ++f) {
          var d = a[f];
          if (null != d.to && (d.to += u), null == d.from) {
            var h = Qn(s, d.marker);
            h || (d.from = u, c && (s || (s = [])).push(d))
          } else d.from += u, c && (s || (s = [])).push(d)
        }
      s && (s = rr(s)), a && a != s && (a = rr(a));
      var p = [s];
      if (!c) {
        var g, m = t.text.length - 2;
        if (m > 0 && s)
          for (var f = 0; f < s.length; ++f) null == s[f].to && (g || (g = [])).push(new $n(s[f].marker, null, null));
        for (var f = 0; m > f; ++f) p.push(g);
        p.push(a)
      }
      return p
    }

    function rr(e) {
      for (var t = 0; t < e.length; ++t) {
        var n = e[t];
        null != n.from && n.from == n.to && n.marker.clearWhenEmpty !== !1 && e.splice(t--, 1)
      }
      return e.length ? e : null
    }

    function ir(e, t) {
      var n = di(e, t),
        r = nr(e, t);
      if (!n) return r;
      if (!r) return n;
      for (var i = 0; i < n.length; ++i) {
        var o = n[i],
          l = r[i];
        if (o && l) e: for (var s = 0; s < l.length; ++s) {
          for (var a = l[s], c = 0; c < o.length; ++c)
            if (o[c].marker == a.marker) continue e;
          o.push(a)
        } else l && (n[i] = l)
      }
      return n
    }

    function or(e, t, n) {
      var r = null;
      if (e.iter(t.line, n.line + 1, function(e) {
          if (e.markedSpans)
            for (var t = 0; t < e.markedSpans.length; ++t) {
              var n = e.markedSpans[t].marker;
              !n.readOnly || r && -1 != Ni(r, n) || (r || (r = [])).push(n)
            }
        }), !r) return null;
      for (var i = [{
          from: t,
          to: n
        }], o = 0; o < r.length; ++o)
        for (var l = r[o], s = l.find(0), a = 0; a < i.length; ++a) {
          var c = i[a];
          if (!(Wo(c.to, s.from) < 0 || Wo(c.from, s.to) > 0)) {
            var u = [a, 1],
              f = Wo(c.from, s.from),
              d = Wo(c.to, s.to);
            (0 > f || !l.inclusiveLeft && !f) && u.push({
              from: c.from,
              to: s.from
            }), (d > 0 || !l.inclusiveRight && !d) && u.push({
              from: s.to,
              to: c.to
            }), i.splice.apply(i, u), a += u.length - 1
          }
        }
      return i
    }

    function lr(e) {
      var t = e.markedSpans;
      if (t) {
        for (var n = 0; n < t.length; ++n) t[n].marker.detachLine(e);
        e.markedSpans = null
      }
    }

    function sr(e, t) {
      if (t) {
        for (var n = 0; n < t.length; ++n) t[n].marker.attachLine(e);
        e.markedSpans = t
      }
    }

    function ar(e) {
      return e.inclusiveLeft ? -1 : 0
    }

    function cr(e) {
      return e.inclusiveRight ? 1 : 0
    }

    function ur(e, t) {
      var n = e.lines.length - t.lines.length;
      if (0 != n) return n;
      var r = e.find(),
        i = t.find(),
        o = Wo(r.from, i.from) || ar(e) - ar(t);
      if (o) return -o;
      var l = Wo(r.to, i.to) || cr(e) - cr(t);
      return l ? l : t.id - e.id
    }

    function fr(e, t) {
      var n, r = Ho && e.markedSpans;
      if (r)
        for (var i, o = 0; o < r.length; ++o) i = r[o], i.marker.collapsed && null == (t ? i.from : i.to) && (!n || ur(n, i.marker) < 0) && (n = i.marker);
      return n
    }

    function dr(e) {
      return fr(e, !0)
    }

    function hr(e) {
      return fr(e, !1)
    }

    function pr(e, t, n, r, i) {
      var o = Xr(e, t),
        l = Ho && o.markedSpans;
      if (l)
        for (var s = 0; s < l.length; ++s) {
          var a = l[s];
          if (a.marker.collapsed) {
            var c = a.marker.find(0),
              u = Wo(c.from, n) || ar(a.marker) - ar(i),
              f = Wo(c.to, r) || cr(a.marker) - cr(i);
            if (!(u >= 0 && 0 >= f || 0 >= u && f >= 0) && (0 >= u && (Wo(c.to, n) > 0 || a.marker.inclusiveRight && i.inclusiveLeft) || u >= 0 && (Wo(c.from, r) < 0 || a.marker.inclusiveLeft && i.inclusiveRight))) return !0
          }
        }
    }

    function gr(e) {
      for (var t; t = dr(e);) e = t.find(-1, !0).line;
      return e
    }

    function mr(e) {
      for (var t, n; t = hr(e);) e = t.find(1, !0).line, (n || (n = [])).push(e);
      return n
    }

    function vr(e, t) {
      var n = Xr(e, t),
        r = gr(n);
      return n == r ? t : Zr(r)
    }

    function yr(e, t) {
      if (t > e.lastLine()) return t;
      var n, r = Xr(e, t);
      if (!br(e, r)) return t;
      for (; n = hr(r);) r = n.find(1, !0).line;
      return Zr(r) + 1
    }

    function br(e, t) {
      var n = Ho && t.markedSpans;
      if (n)
        for (var r, i = 0; i < n.length; ++i)
          if (r = n[i], r.marker.collapsed) {
            if (null == r.from) return !0;
            if (!r.marker.widgetNode && 0 == r.from && r.marker.inclusiveLeft && xr(e, t, r)) return !0
          }
    }

    function xr(e, t, n) {
      if (null == n.to) {
        var r = n.marker.find(1, !0);
        return xr(e, r.line, Qn(r.line.markedSpans, n.marker))
      }
      if (n.marker.inclusiveRight && n.to == t.text.length) return !0;
      for (var i, o = 0; o < t.markedSpans.length; ++o)
        if (i = t.markedSpans[o], i.marker.collapsed && !i.marker.widgetNode && i.from == n.to && (null == i.to || i.to != n.from) && (i.marker.inclusiveLeft || n.marker.inclusiveRight) && xr(e, t, i)) return !0
    }

    function Cr(e, t, n) {
      ei(t) < (e.curOp && e.curOp.scrollTop || e.doc.scrollTop) && Dn(e, null, n)
    }

    function wr(e) {
      if (null != e.height) return e.height;
      var t = e.doc.cm;
      if (!t) return 0;
      if (!Bl(document.body, e.node)) {
        var n = "position: relative;";
        e.coverGutter && (n += "margin-left: -" + t.display.gutters.offsetWidth + "px;"), e.noHScroll && (n += "width: " + t.display.wrapper.clientWidth + "px;"), ji(t.display.measure, Ri("div", [e.node], null, n))
      }
      return e.height = e.node.offsetHeight
    }

    function Sr(e, t, n, r) {
      var i = new hl(e, n, r),
        o = e.cm;
      return o && i.noHScroll && (o.display.alignWidgets = !0), zn(e, t, "widget", function(t) {
        var n = t.widgets || (t.widgets = []);
        if (null == i.insertAt ? n.push(i) : n.splice(Math.min(n.length - 1, Math.max(0, i.insertAt)), 0, i), i.line = t, o && !br(e, t)) {
          var r = ei(t) < e.scrollTop;
          Qr(t, t.height + wr(i)), r && Dn(o, null, i.height), o.curOp.forceUpdate = !0
        }
        return !0
      }), i
    }

    function Lr(e, t, n, r) {
      e.text = t, e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null), null != e.order && (e.order = null), lr(e), sr(e, n);
      var i = r ? r(e) : 1;
      i != e.height && Qr(e, i)
    }

    function kr(e) {
      e.parent = null, lr(e)
    }

    function Tr(e, t) {
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

    function Mr(t, n) {
      if (t.blankLine) return t.blankLine(n);
      if (t.innerMode) {
        var r = e.innerMode(t, n);
        return r.mode.blankLine ? r.mode.blankLine(r.state) : void 0
      }
    }

    function Ar(t, n, r, i) {
      for (var o = 0; 10 > o; o++) {
        i && (i[0] = e.innerMode(t, r).mode);
        var l = t.token(n, r);
        if (n.pos > n.start) return l
      }
      throw new Error("Mode " + t.name + " failed to advance stream.")
    }

    function Or(e, t, n, r) {
      function i(e) {
        return {
          start: f.start,
          end: f.pos,
          string: f.current(),
          type: o || null,
          state: e ? nl(l.mode, u) : u
        }
      }
      var o, l = e.doc,
        s = l.mode;
      t = me(l, t);
      var a, c = Xr(l, t.line),
        u = je(e, t.line, n),
        f = new cl(c.text, e.options.tabSize);
      for (r && (a = []);
        (r || f.pos < t.ch) && !f.eol();) f.start = f.pos, o = Ar(s, f, u), r && a.push(i(!0));
      return r ? a : i()
    }

    function Nr(e, t, n, r, i, o, l) {
      var s = n.flattenSpans;
      null == s && (s = e.options.flattenSpans);
      var a, c = 0,
        u = null,
        f = new cl(t, e.options.tabSize),
        d = e.options.addModeClass && [null];
      for ("" == t && Tr(Mr(n, r), o); !f.eol();) {
        if (f.pos > e.options.maxHighlightLength ? (s = !1, l && Wr(e, t, r, f.pos), f.pos = t.length, a = null) : a = Tr(Ar(n, f, r, d), o), d) {
          var h = d[0].name;
          h && (a = "m-" + (a ? h + " " + a : h))
        }
        if (!s || u != a) {
          for (; c < f.start;) c = Math.min(f.start, c + 5e4), i(c, u);
          u = a
        }
        f.start = f.pos
      }
      for (; c < f.pos;) {
        var p = Math.min(f.pos, c + 5e4);
        i(p, u), c = p
      }
    }

    function Hr(e, t, n, r) {
      var i = [e.state.modeGen],
        o = {};
      Nr(e, t.text, e.doc.mode, n, function(e, t) {
        i.push(e, t)
      }, o, r);
      for (var l = 0; l < e.state.overlays.length; ++l) {
        var s = e.state.overlays[l],
          a = 1,
          c = 0;
        Nr(e, t.text, s.mode, !0, function(e, t) {
          for (var n = a; e > c;) {
            var r = i[a];
            r > e && i.splice(a, 1, e, i[a + 1], r), a += 2, c = Math.min(e, r)
          }
          if (t)
            if (s.opaque) i.splice(n, a - n, e, "cm-overlay " + t), a = n + 2;
            else
              for (; a > n; n += 2) {
                var o = i[n + 1];
                i[n + 1] = (o ? o + " " : "") + "cm-overlay " + t
              }
        }, o)
      }
      return {
        styles: i,
        classes: o.bgClass || o.textClass ? o : null
      }
    }

    function Pr(e, t, n) {
      if (!t.styles || t.styles[0] != e.state.modeGen) {
        var r = Hr(e, t, t.stateAfter = je(e, Zr(t)));
        t.styles = r.styles, r.classes ? t.styleClasses = r.classes : t.styleClasses && (t.styleClasses = null), n === e.doc.frontier && e.doc.frontier++
      }
      return t.styles
    }

    function Wr(e, t, n, r) {
      var i = e.doc.mode,
        o = new cl(t, e.options.tabSize);
      for (o.start = o.pos = r || 0, "" == t && Mr(i, n); !o.eol() && o.pos <= e.options.maxHighlightLength;) Ar(i, o, n), o.start = o.pos
    }

    function Dr(e, t) {
      if (!e || /^\s*$/.test(e)) return null;
      var n = t.addModeClass ? ml : gl;
      return n[e] || (n[e] = e.replace(/\S+/g, "cm-$&"))
    }

    function Er(e, t) {
      var n = Ri("span", null, null, mo ? "padding-right: .1px" : null),
        r = {
          pre: Ri("pre", [n], "CodeMirror-line"),
          content: n,
          col: 0,
          pos: 0,
          cm: e,
          splitSpaces: (po || mo) && e.getOption("lineWrapping")
        };
      t.measure = {};
      for (var i = 0; i <= (t.rest ? t.rest.length : 0); i++) {
        var o, l = i ? t.rest[i - 1] : t.line;
        r.pos = 0, r.addToken = Ir, Yi(e.display.measure) && (o = ti(l)) && (r.addToken = Rr(r.addToken, o)), r.map = [];
        var s = t != e.display.externalMeasured && Zr(l);
        jr(l, r, Pr(e, l, s)), l.styleClasses && (l.styleClasses.bgClass && (r.bgClass = Ui(l.styleClasses.bgClass, r.bgClass || "")), l.styleClasses.textClass && (r.textClass = Ui(l.styleClasses.textClass, r.textClass || ""))), 0 == r.map.length && r.map.push(0, 0, r.content.appendChild(Xi(e.display.measure))), 0 == i ? (t.measure.map = r.map, t.measure.cache = {}) : ((t.measure.maps || (t.measure.maps = [])).push(r.map), (t.measure.caches || (t.measure.caches = [])).push({}))
      }
      return mo && /\bcm-tab\b/.test(r.content.lastChild.className) && (r.content.className = "cm-tab-wrap-hack"), Tl(e, "renderLine", e, t.line, r.pre), r.pre.className && (r.textClass = Ui(r.pre.className, r.textClass || "")), r
    }

    function Fr(e) {
      var t = Ri("span", "•", "cm-invalidchar");
      return t.title = "\\u" + e.charCodeAt(0).toString(16), t.setAttribute("aria-label", t.title), t
    }

    function Ir(e, t, n, r, i, o, l) {
      if (t) {
        var s = e.splitSpaces ? t.replace(/ {3,}/g, zr) : t,
          a = e.cm.state.specialChars,
          c = !1;
        if (a.test(t))
          for (var u = document.createDocumentFragment(), f = 0;;) {
            a.lastIndex = f;
            var d = a.exec(t),
              h = d ? d.index - f : t.length - f;
            if (h) {
              var p = document.createTextNode(s.slice(f, f + h));
              u.appendChild(po && 9 > go ? Ri("span", [p]) : p), e.map.push(e.pos, e.pos + h, p), e.col += h, e.pos += h
            }
            if (!d) break;
            if (f += h + 1, "	" == d[0]) {
              var g = e.cm.options.tabSize,
                m = g - e.col % g,
                p = u.appendChild(Ri("span", Ai(m), "cm-tab"));
              p.setAttribute("role", "presentation"), p.setAttribute("cm-text", "	"), e.col += m
            } else if ("\r" == d[0] || "\n" == d[0]) {
              var p = u.appendChild(Ri("span", "\r" == d[0] ? "␍" : "␤", "cm-invalidchar"));
              p.setAttribute("cm-text", d[0]), e.col += 1
            } else {
              var p = e.cm.options.specialCharPlaceholder(d[0]);
              p.setAttribute("cm-text", d[0]), u.appendChild(po && 9 > go ? Ri("span", [p]) : p), e.col += 1
            }
            e.map.push(e.pos, e.pos + 1, p), e.pos++
          } else {
            e.col += t.length;
            var u = document.createTextNode(s);
            e.map.push(e.pos, e.pos + t.length, u), po && 9 > go && (c = !0), e.pos += t.length
          }
        if (n || r || i || c || l) {
          var v = n || "";
          r && (v += r), i && (v += i);
          var y = Ri("span", [u], v, l);
          return o && (y.title = o), e.content.appendChild(y)
        }
        e.content.appendChild(u)
      }
    }

    function zr(e) {
      for (var t = " ", n = 0; n < e.length - 2; ++n) t += n % 2 ? " " : " ";
      return t += " "
    }

    function Rr(e, t) {
      return function(n, r, i, o, l, s, a) {
        i = i ? i + " cm-force-border" : "cm-force-border";
        for (var c = n.pos, u = c + r.length;;) {
          for (var f = 0; f < t.length; f++) {
            var d = t[f];
            if (d.to > c && d.from <= c) break
          }
          if (d.to >= u) return e(n, r, i, o, l, s, a);
          e(n, r.slice(0, d.to - c), i, o, null, s, a), o = null, r = r.slice(d.to - c), c = d.to
        }
      }
    }

    function Br(e, t, n, r) {
      var i = !r && n.widgetNode;
      i && e.map.push(e.pos, e.pos + t, i), !r && e.cm.display.input.needsContentAttribute && (i || (i = e.content.appendChild(document.createElement("span"))), i.setAttribute("cm-marker", n.id)), i && (e.cm.display.input.setUneditable(i), e.content.appendChild(i)), e.pos += t
    }

    function jr(e, t, n) {
      var r = e.markedSpans,
        i = e.text,
        o = 0;
      if (r)
        for (var l, s, a, c, u, f, d, h = i.length, p = 0, g = 1, m = "", v = 0;;) {
          if (v == p) {
            a = c = u = f = s = "", d = null, v = 1 / 0;
            for (var y = [], b = 0; b < r.length; ++b) {
              var x = r[b],
                C = x.marker;
              "bookmark" == C.type && x.from == p && C.widgetNode ? y.push(C) : x.from <= p && (null == x.to || x.to > p || C.collapsed && x.to == p && x.from == p) ? (null != x.to && x.to != p && v > x.to && (v = x.to, c = ""), C.className && (a += " " + C.className), C.css && (s = C.css), C.startStyle && x.from == p && (u += " " + C.startStyle), C.endStyle && x.to == v && (c += " " + C.endStyle), C.title && !f && (f = C.title), C.collapsed && (!d || ur(d.marker, C) < 0) && (d = x)) : x.from > p && v > x.from && (v = x.from)
            }
            if (d && (d.from || 0) == p) {
              if (Br(t, (null == d.to ? h + 1 : d.to) - p, d.marker, null == d.from), null == d.to) return;
              d.to == p && (d = !1)
            }
            if (!d && y.length)
              for (var b = 0; b < y.length; ++b) Br(t, 0, y[b])
          }
          if (p >= h) break;
          for (var w = Math.min(h, v);;) {
            if (m) {
              var S = p + m.length;
              if (!d) {
                var L = S > w ? m.slice(0, w - p) : m;
                t.addToken(t, L, l ? l + a : a, u, p + L.length == v ? c : "", f, s)
              }
              if (S >= w) {
                m = m.slice(w - p), p = w;
                break
              }
              p = S, u = ""
            }
            m = i.slice(o, o = n[g++]), l = Dr(n[g++], t.cm.options)
          }
        } else
          for (var g = 1; g < n.length; g += 2) t.addToken(t, i.slice(o, o = n[g]), Dr(n[g + 1], t.cm.options))
    }

    function Gr(e, t) {
      return 0 == t.from.ch && 0 == t.to.ch && "" == Oi(t.text) && (!e.cm || e.cm.options.wholeLineUpdateBefore)
    }

    function qr(e, t, n, r) {
      function i(e) {
        return n ? n[e] : null
      }

      function o(e, n, i) {
        Lr(e, n, i, r), xi(e, "change", e, t)
      }

      function l(e, t) {
        for (var n = e, o = []; t > n; ++n) o.push(new pl(c[n], i(n), r));
        return o
      }
      var s = t.from,
        a = t.to,
        c = t.text,
        u = Xr(e, s.line),
        f = Xr(e, a.line),
        d = Oi(c),
        h = i(c.length - 1),
        p = a.line - s.line;
      if (t.full) e.insert(0, l(0, c.length)), e.remove(c.length, e.size - c.length);
      else if (Gr(e, t)) {
        var g = l(0, c.length - 1);
        o(f, f.text, h), p && e.remove(s.line, p), g.length && e.insert(s.line, g)
      } else if (u == f)
        if (1 == c.length) o(u, u.text.slice(0, s.ch) + d + u.text.slice(a.ch), h);
        else {
          var g = l(1, c.length - 1);
          g.push(new pl(d + u.text.slice(a.ch), h, r)), o(u, u.text.slice(0, s.ch) + c[0], i(0)), e.insert(s.line + 1, g)
        }
      else if (1 == c.length) o(u, u.text.slice(0, s.ch) + c[0] + f.text.slice(a.ch), i(0)), e.remove(s.line + 1, p);
      else {
        o(u, u.text.slice(0, s.ch) + c[0], i(0)), o(f, d + f.text.slice(a.ch), h);
        var g = l(1, c.length - 1);
        p > 1 && e.remove(s.line + 1, p - 1), e.insert(s.line + 1, g)
      }
      xi(e, "change", e, t)
    }

    function Ur(e) {
      this.lines = e, this.parent = null;
      for (var t = 0, n = 0; t < e.length; ++t) e[t].parent = this, n += e[t].height;
      this.height = n
    }

    function Vr(e) {
      this.children = e;
      for (var t = 0, n = 0, r = 0; r < e.length; ++r) {
        var i = e[r];
        t += i.chunkSize(), n += i.height, i.parent = this
      }
      this.size = t, this.height = n, this.parent = null
    }

    function Kr(e, t, n) {
      function r(e, i, o) {
        if (e.linked)
          for (var l = 0; l < e.linked.length; ++l) {
            var s = e.linked[l];
            if (s.doc != i) {
              var a = o && s.sharedHist;
              (!n || a) && (t(s.doc, a), r(s.doc, e, a))
            }
          }
      }
      r(e, null, !0)
    }

    function _r(e, t) {
      if (t.cm) throw new Error("This document is already in use.");
      e.doc = t, t.cm = e, l(e), n(e), e.options.lineWrapping || d(e), e.options.mode = t.modeOption, Dt(e)
    }

    function Xr(e, t) {
      if (t -= e.first, 0 > t || t >= e.size) throw new Error("There is no line " + (t + e.first) + " in the document.");
      for (var n = e; !n.lines;)
        for (var r = 0;; ++r) {
          var i = n.children[r],
            o = i.chunkSize();
          if (o > t) {
            n = i;
            break
          }
          t -= o
        }
      return n.lines[t]
    }

    function Yr(e, t, n) {
      var r = [],
        i = t.line;
      return e.iter(t.line, n.line + 1, function(e) {
        var o = e.text;
        i == n.line && (o = o.slice(0, n.ch)), i == t.line && (o = o.slice(t.ch)), r.push(o), ++i
      }), r
    }

    function $r(e, t, n) {
      var r = [];
      return e.iter(t, n, function(e) {
        r.push(e.text)
      }), r
    }

    function Qr(e, t) {
      var n = t - e.height;
      if (n)
        for (var r = e; r; r = r.parent) r.height += n
    }

    function Zr(e) {
      if (null == e.parent) return null;
      for (var t = e.parent, n = Ni(t.lines, e), r = t.parent; r; t = r, r = r.parent)
        for (var i = 0; r.children[i] != t; ++i) n += r.children[i].chunkSize();
      return n + t.first
    }

    function Jr(e, t) {
      var n = e.first;
      e: do {
        for (var r = 0; r < e.children.length; ++r) {
          var i = e.children[r],
            o = i.height;
          if (o > t) {
            e = i;
            continue e
          }
          t -= o, n += i.chunkSize()
        }
        return n
      } while (!e.lines);
      for (var r = 0; r < e.lines.length; ++r) {
        var l = e.lines[r],
          s = l.height;
        if (s > t) break;
        t -= s
      }
      return n + r
    }

    function ei(e) {
      e = gr(e);
      for (var t = 0, n = e.parent, r = 0; r < n.lines.length; ++r) {
        var i = n.lines[r];
        if (i == e) break;
        t += i.height
      }
      for (var o = n.parent; o; n = o, o = n.parent)
        for (var r = 0; r < o.children.length; ++r) {
          var l = o.children[r];
          if (l == n) break;
          t += l.height
        }
      return t
    }

    function ti(e) {
      var t = e.order;
      return null == t && (t = e.order = Jl(e.text)), t
    }

    function ni(e) {
      this.done = [], this.undone = [], this.undoDepth = 1 / 0, this.lastModTime = this.lastSelTime = 0, this.lastOp = this.lastSelOp = null, this.lastOrigin = this.lastSelOrigin = null, this.generation = this.maxGeneration = e || 1
    }

    function ri(e, t) {
      var n = {
        from: _(t.from),
        to: _o(t),
        text: Yr(e, t.from, t.to)
      };
      return ui(e, n, t.from.line, t.to.line + 1), Kr(e, function(e) {
        ui(e, n, t.from.line, t.to.line + 1)
      }, !0), n
    }

    function ii(e) {
      for (; e.length;) {
        var t = Oi(e);
        if (!t.ranges) break;
        e.pop()
      }
    }

    function oi(e, t) {
      return t ? (ii(e.done), Oi(e.done)) : e.done.length && !Oi(e.done).ranges ? Oi(e.done) : e.done.length > 1 && !e.done[e.done.length - 2].ranges ? (e.done.pop(), Oi(e.done)) : void 0
    }

    function li(e, t, n, r) {
      var i = e.history;
      i.undone.length = 0;
      var o, l = +new Date;
      if ((i.lastOp == r || i.lastOrigin == t.origin && t.origin && ("+" == t.origin.charAt(0) && e.cm && i.lastModTime > l - e.cm.options.historyEventDelay || "*" == t.origin.charAt(0))) && (o = oi(i, i.lastOp == r))) {
        var s = Oi(o.changes);
        0 == Wo(t.from, t.to) && 0 == Wo(t.from, s.to) ? s.to = _o(t) : o.changes.push(ri(e, t))
      } else {
        var a = Oi(i.done);
        for (a && a.ranges || ci(e.sel, i.done), o = {
            changes: [ri(e, t)],
            generation: i.generation
          }, i.done.push(o); i.done.length > i.undoDepth;) i.done.shift(), i.done[0].ranges || i.done.shift()
      }
      i.done.push(n), i.generation = ++i.maxGeneration, i.lastModTime = i.lastSelTime = l, i.lastOp = i.lastSelOp = r, i.lastOrigin = i.lastSelOrigin = t.origin, s || Tl(e, "historyAdded")
    }

    function si(e, t, n, r) {
      var i = t.charAt(0);
      return "*" == i || "+" == i && n.ranges.length == r.ranges.length && n.somethingSelected() == r.somethingSelected() && new Date - e.history.lastSelTime <= (e.cm ? e.cm.options.historyEventDelay : 500)
    }

    function ai(e, t, n, r) {
      var i = e.history,
        o = r && r.origin;
      n == i.lastSelOp || o && i.lastSelOrigin == o && (i.lastModTime == i.lastSelTime && i.lastOrigin == o || si(e, o, Oi(i.done), t)) ? i.done[i.done.length - 1] = t : ci(t, i.done), i.lastSelTime = +new Date, i.lastSelOrigin = o, i.lastSelOp = n, r && r.clearRedo !== !1 && ii(i.undone)
    }

    function ci(e, t) {
      var n = Oi(t);
      n && n.ranges && n.equals(e) || t.push(e)
    }

    function ui(e, t, n, r) {
      var i = t["spans_" + e.id],
        o = 0;
      e.iter(Math.max(e.first, n), Math.min(e.first + e.size, r), function(n) {
        n.markedSpans && ((i || (i = t["spans_" + e.id] = {}))[o] = n.markedSpans), ++o
      })
    }

    function fi(e) {
      if (!e) return null;
      for (var t, n = 0; n < e.length; ++n) e[n].marker.explicitlyCleared ? t || (t = e.slice(0, n)) : t && t.push(e[n]);
      return t ? t.length ? t : null : e
    }

    function di(e, t) {
      var n = t["spans_" + e.id];
      if (!n) return null;
      for (var r = 0, i = []; r < t.text.length; ++r) i.push(fi(n[r]));
      return i
    }

    function hi(e, t, n) {
      for (var r = 0, i = []; r < e.length; ++r) {
        var o = e[r];
        if (o.ranges) i.push(n ? fe.prototype.deepCopy.call(o) : o);
        else {
          var l = o.changes,
            s = [];
          i.push({
            changes: s
          });
          for (var a = 0; a < l.length; ++a) {
            var c, u = l[a];
            if (s.push({
                from: u.from,
                to: u.to,
                text: u.text
              }), t)
              for (var f in u)(c = f.match(/^spans_(\d+)$/)) && Ni(t, Number(c[1])) > -1 && (Oi(s)[f] = u[f], delete u[f])
          }
        }
      }
      return i
    }

    function pi(e, t, n, r) {
      n < e.line ? e.line += r : t < e.line && (e.line = t, e.ch = 0)
    }

    function gi(e, t, n, r) {
      for (var i = 0; i < e.length; ++i) {
        var o = e[i],
          l = !0;
        if (o.ranges) {
          o.copied || (o = e[i] = o.deepCopy(), o.copied = !0);
          for (var s = 0; s < o.ranges.length; s++) pi(o.ranges[s].anchor, t, n, r), pi(o.ranges[s].head, t, n, r)
        } else {
          for (var s = 0; s < o.changes.length; ++s) {
            var a = o.changes[s];
            if (n < a.from.line) a.from = Po(a.from.line + r, a.from.ch), a.to = Po(a.to.line + r, a.to.ch);
            else if (t <= a.to.line) {
              l = !1;
              break
            }
          }
          l || (e.splice(0, i + 1), i = 0)
        }
      }
    }

    function mi(e, t) {
      var n = t.from.line,
        r = t.to.line,
        i = t.text.length - (r - n) - 1;
      gi(e.done, n, r, i), gi(e.undone, n, r, i)
    }

    function vi(e) {
      return null != e.defaultPrevented ? e.defaultPrevented : 0 == e.returnValue
    }

    function yi(e) {
      return e.target || e.srcElement
    }

    function bi(e) {
      var t = e.which;
      return null == t && (1 & e.button ? t = 1 : 2 & e.button ? t = 3 : 4 & e.button && (t = 2)), ko && e.ctrlKey && 1 == t && (t = 3), t
    }

    function xi(e, t) {
      function n(e) {
        return function() {
          e.apply(null, o)
        }
      }
      var r = e._handlers && e._handlers[t];
      if (r) {
        var i, o = Array.prototype.slice.call(arguments, 2);
        Ro ? i = Ro.delayedCallbacks : Ml ? i = Ml : (i = Ml = [], setTimeout(Ci, 0));
        for (var l = 0; l < r.length; ++l) i.push(n(r[l]))
      }
    }

    function Ci() {
      var e = Ml;
      Ml = null;
      for (var t = 0; t < e.length; ++t) e[t]()
    }

    function wi(e, t, n) {
      return "string" == typeof t && (t = {
        type: t,
        preventDefault: function() {
          this.defaultPrevented = !0
        }
      }), Tl(e, n || t.type, e, t), vi(t) || t.codemirrorIgnore
    }

    function Si(e) {
      var t = e._handlers && e._handlers.cursorActivity;
      if (t)
        for (var n = e.curOp.cursorActivityHandlers || (e.curOp.cursorActivityHandlers = []), r = 0; r < t.length; ++r) - 1 == Ni(n, t[r]) && n.push(t[r])
    }

    function Li(e, t) {
      var n = e._handlers && e._handlers[t];
      return n && n.length > 0
    }

    function ki(e) {
      e.prototype.on = function(e, t) {
        Ll(this, e, t)
      }, e.prototype.off = function(e, t) {
        kl(this, e, t)
      }
    }

    function Ti() {
      this.id = null
    }

    function Mi(e, t, n) {
      for (var r = 0, i = 0;;) {
        var o = e.indexOf("	", r); - 1 == o && (o = e.length);
        var l = o - r;
        if (o == e.length || i + l >= t) return r + Math.min(l, t - i);
        if (i += o - r, i += n - i % n, r = o + 1, i >= t) return r
      }
    }

    function Ai(e) {
      for (; Dl.length <= e;) Dl.push(Oi(Dl) + " ");
      return Dl[e]
    }

    function Oi(e) {
      return e[e.length - 1]
    }

    function Ni(e, t) {
      for (var n = 0; n < e.length; ++n)
        if (e[n] == t) return n;
      return -1
    }

    function Hi(e, t) {
      for (var n = [], r = 0; r < e.length; r++) n[r] = t(e[r], r);
      return n
    }

    function Pi() {}

    function Wi(e, t) {
      var n;
      return Object.create ? n = Object.create(e) : (Pi.prototype = e, n = new Pi), t && Di(t, n), n
    }

    function Di(e, t, n) {
      t || (t = {});
      for (var r in e) !e.hasOwnProperty(r) || n === !1 && t.hasOwnProperty(r) || (t[r] = e[r]);
      return t
    }

    function Ei(e) {
      var t = Array.prototype.slice.call(arguments, 1);
      return function() {
        return e.apply(null, t)
      }
    }

    function Fi(e, t) {
      return t ? t.source.indexOf("\\w") > -1 && zl(e) ? !0 : t.test(e) : zl(e)
    }

    function Ii(e) {
      for (var t in e)
        if (e.hasOwnProperty(t) && e[t]) return !1;
      return !0
    }

    function zi(e) {
      return e.charCodeAt(0) >= 768 && Rl.test(e)
    }

    function Ri(e, t, n, r) {
      var i = document.createElement(e);
      if (n && (i.className = n), r && (i.style.cssText = r), "string" == typeof t) i.appendChild(document.createTextNode(t));
      else if (t)
        for (var o = 0; o < t.length; ++o) i.appendChild(t[o]);
      return i
    }

    function Bi(e) {
      for (var t = e.childNodes.length; t > 0; --t) e.removeChild(e.firstChild);
      return e
    }

    function ji(e, t) {
      return Bi(e).appendChild(t)
    }

    function Gi() {
      for (var e = document.activeElement; e && e.root && e.root.activeElement;) e = e.root.activeElement;
      return e
    }

    function qi(e) {
      return new RegExp("(^|\\s)" + e + "(?:$|\\s)\\s*")
    }

    function Ui(e, t) {
      for (var n = e.split(" "), r = 0; r < n.length; r++) n[r] && !qi(n[r]).test(t) && (t += " " + n[r]);
      return t
    }

    function Vi(e) {
      if (document.body.getElementsByClassName)
        for (var t = document.body.getElementsByClassName("CodeMirror"), n = 0; n < t.length; n++) {
          var r = t[n].CodeMirror;
          r && e(r)
        }
    }

    function Ki() {
      Vl || (_i(), Vl = !0)
    }

    function _i() {
      var e;
      Ll(window, "resize", function() {
        null == e && (e = setTimeout(function() {
          e = null, Vi(qt)
        }, 100))
      }), Ll(window, "blur", function() {
        Vi(gn)
      })
    }

    function Xi(e) {
      if (null == jl) {
        var t = Ri("span", "​");
        ji(e, Ri("span", [t, document.createTextNode("x")])), 0 != e.firstChild.offsetHeight && (jl = t.offsetWidth <= 1 && t.offsetHeight > 2 && !(po && 8 > go))
      }
      var n = jl ? Ri("span", "​") : Ri("span", " ", null, "display: inline-block; width: 1px; margin-right: -1px");
      return n.setAttribute("cm-text", ""), n
    }

    function Yi(e) {
      if (null != Gl) return Gl;
      var t = ji(e, document.createTextNode("AخA")),
        n = Fl(t, 0, 1).getBoundingClientRect();
      if (!n || n.left == n.right) return !1;
      var r = Fl(t, 1, 2).getBoundingClientRect();
      return Gl = r.right - n.right < 3
    }

    function $i(e) {
      if (null != $l) return $l;
      var t = ji(e, Ri("span", "x")),
        n = t.getBoundingClientRect(),
        r = Fl(t, 0, 1).getBoundingClientRect();
      return $l = Math.abs(n.left - r.left) > 1
    }

    function Qi(e, t, n, r) {
      if (!e) return r(t, n, "ltr");
      for (var i = !1, o = 0; o < e.length; ++o) {
        var l = e[o];
        (l.from < n && l.to > t || t == n && l.to == t) && (r(Math.max(l.from, t), Math.min(l.to, n), 1 == l.level ? "rtl" : "ltr"), i = !0)
      }
      i || r(t, n, "ltr")
    }

    function Zi(e) {
      return e.level % 2 ? e.to : e.from
    }

    function Ji(e) {
      return e.level % 2 ? e.from : e.to
    }

    function eo(e) {
      var t = ti(e);
      return t ? Zi(t[0]) : 0
    }

    function to(e) {
      var t = ti(e);
      return t ? Ji(Oi(t)) : e.text.length
    }

    function no(e, t) {
      var n = Xr(e.doc, t),
        r = gr(n);
      r != n && (t = Zr(r));
      var i = ti(r),
        o = i ? i[0].level % 2 ? to(r) : eo(r) : 0;
      return Po(t, o)
    }

    function ro(e, t) {
      for (var n, r = Xr(e.doc, t); n = hr(r);) r = n.find(1, !0).line, t = null;
      var i = ti(r),
        o = i ? i[0].level % 2 ? eo(r) : to(r) : r.text.length;
      return Po(null == t ? Zr(r) : t, o)
    }

    function io(e, t) {
      var n = no(e, t.line),
        r = Xr(e.doc, n.line),
        i = ti(r);
      if (!i || 0 == i[0].level) {
        var o = Math.max(0, r.text.search(/\S/)),
          l = t.line == n.line && t.ch <= o && t.ch;
        return Po(n.line, l ? 0 : o)
      }
      return n
    }

    function oo(e, t, n) {
      var r = e[0].level;
      return t == r ? !0 : n == r ? !1 : n > t
    }

    function lo(e, t) {
      Zl = null;
      for (var n, r = 0; r < e.length; ++r) {
        var i = e[r];
        if (i.from < t && i.to > t) return r;
        if (i.from == t || i.to == t) {
          if (null != n) return oo(e, i.level, e[n].level) ? (i.from != i.to && (Zl = n), r) : (i.from != i.to && (Zl = r), n);
          n = r
        }
      }
      return n
    }

    function so(e, t, n, r) {
      if (!r) return t + n;
      do t += n; while (t > 0 && zi(e.text.charAt(t)));
      return t
    }

    function ao(e, t, n, r) {
      var i = ti(e);
      if (!i) return co(e, t, n, r);
      for (var o = lo(i, t), l = i[o], s = so(e, t, l.level % 2 ? -n : n, r);;) {
        if (s > l.from && s < l.to) return s;
        if (s == l.from || s == l.to) return lo(i, s) == o ? s : (l = i[o += n], n > 0 == l.level % 2 ? l.to : l.from);
        if (l = i[o += n], !l) return null;
        s = n > 0 == l.level % 2 ? so(e, l.to, -1, r) : so(e, l.from, 1, r)
      }
    }

    function co(e, t, n, r) {
      var i = t + n;
      if (r)
        for (; i > 0 && zi(e.text.charAt(i));) i += n;
      return 0 > i || i > e.text.length ? null : i
    }
    var uo = /gecko\/\d/i.test(navigator.userAgent),
      fo = /MSIE \d/.test(navigator.userAgent),
      ho = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent),
      po = fo || ho,
      go = po && (fo ? document.documentMode || 6 : ho[1]),
      mo = /WebKit\//.test(navigator.userAgent),
      vo = mo && /Qt\/\d+\.\d+/.test(navigator.userAgent),
      yo = /Chrome\//.test(navigator.userAgent),
      bo = /Opera\//.test(navigator.userAgent),
      xo = /Apple Computer/.test(navigator.vendor),
      Co = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(navigator.userAgent),
      wo = /PhantomJS/.test(navigator.userAgent),
      So = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent),
      Lo = So || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent),
      ko = So || /Mac/.test(navigator.platform),
      To = /win/i.test(navigator.platform),
      Mo = bo && navigator.userAgent.match(/Version\/(\d*\.\d*)/);
    Mo && (Mo = Number(Mo[1])), Mo && Mo >= 15 && (bo = !1, mo = !0);
    var Ao = ko && (vo || bo && (null == Mo || 12.11 > Mo)),
      Oo = uo || po && go >= 9,
      No = !1,
      Ho = !1;
    g.prototype = Di({
      update: function(e) {
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
          this.horiz.firstChild.style.width = e.scrollWidth - e.clientWidth + o + "px"
        } else this.horiz.style.display = "", this.horiz.firstChild.style.width = "0";
        return !this.checkedOverlay && e.clientHeight > 0 && (0 == r && this.overlayHack(), this.checkedOverlay = !0), {
          right: n ? r : 0,
          bottom: t ? r : 0
        }
      },
      setScrollLeft: function(e) {
        this.horiz.scrollLeft != e && (this.horiz.scrollLeft = e)
      },
      setScrollTop: function(e) {
        this.vert.scrollTop != e && (this.vert.scrollTop = e)
      },
      overlayHack: function() {
        var e = ko && !Co ? "12px" : "18px";
        this.horiz.style.minHeight = this.vert.style.minWidth = e;
        var t = this,
          n = function(e) {
            yi(e) != t.vert && yi(e) != t.horiz && Ot(t.cm, Kt)(e)
          };
        Ll(this.vert, "mousedown", n), Ll(this.horiz, "mousedown", n)
      },
      clear: function() {
        var e = this.horiz.parentNode;
        e.removeChild(this.horiz), e.removeChild(this.vert)
      }
    }, g.prototype), m.prototype = Di({
      update: function() {
        return {
          bottom: 0,
          right: 0
        }
      },
      setScrollLeft: function() {},
      setScrollTop: function() {},
      clear: function() {}
    }, m.prototype), e.scrollbarModel = {
      "native": g,
      "null": m
    }, k.prototype.signal = function(e, t) {
      Li(e, t) && this.events.push(arguments)
    }, k.prototype.finish = function() {
      for (var e = 0; e < this.events.length; e++) Tl.apply(null, this.events[e])
    };
    var Po = e.Pos = function(e, t) {
        return this instanceof Po ? (this.line = e, void(this.ch = t)) : new Po(e, t)
      },
      Wo = e.cmpPos = function(e, t) {
        return e.line - t.line || e.ch - t.ch
      },
      Do = null;
    re.prototype = Di({
      init: function(e) {
        function t(e) {
          if (r.somethingSelected()) Do = r.getSelections(), n.inaccurateSelection && (n.prevInput = "", n.inaccurateSelection = !1, o.value = Do.join("\n"), El(o));
          else {
            if (!r.options.lineWiseCopyCut) return;
            var t = te(r);
            Do = t.text, "cut" == e.type ? r.setSelections(t.ranges, null, Nl) : (n.prevInput = "", o.value = t.text.join("\n"), El(o))
          }
          "cut" == e.type && (r.state.cutIncoming = !0)
        }
        var n = this,
          r = this.cm,
          i = this.wrapper = ie(),
          o = this.textarea = i.firstChild;
        e.wrapper.insertBefore(i, e.wrapper.firstChild), So && (o.style.width = "0px"), Ll(o, "input", function() {
          po && go >= 9 && n.hasSelection && (n.hasSelection = null), n.poll()
        }), Ll(o, "paste", function(e) {
          return J(e, r) ? !0 : (r.state.pasteIncoming = !0, void n.fastPoll())
        }), Ll(o, "cut", t), Ll(o, "copy", t), Ll(e.scroller, "paste", function(t) {
          Ut(e, t) || (r.state.pasteIncoming = !0, n.focus())
        }), Ll(e.lineSpace, "selectstart", function(t) {
          Ut(e, t) || Cl(t)
        }), Ll(o, "compositionstart", function() {
          var e = r.getCursor("from");
          n.composing = {
            start: e,
            range: r.markText(e, r.getCursor("to"), {
              className: "CodeMirror-composing"
            })
          }
        }), Ll(o, "compositionend", function() {
          n.composing && (n.poll(), n.composing.range.clear(), n.composing = null)
        })
      },
      prepareSelection: function() {
        var e = this.cm,
          t = e.display,
          n = e.doc,
          r = De(e);
        if (e.options.moveInputWithCursor) {
          var i = dt(e, n.sel.primary().head, "div"),
            o = t.wrapper.getBoundingClientRect(),
            l = t.lineDiv.getBoundingClientRect();
          r.teTop = Math.max(0, Math.min(t.wrapper.clientHeight - 10, i.top + l.top - o.top)), r.teLeft = Math.max(0, Math.min(t.wrapper.clientWidth - 10, i.left + l.left - o.left))
        }
        return r
      },
      showSelection: function(e) {
        var t = this.cm,
          n = t.display;
        ji(n.cursorDiv, e.cursors),
          ji(n.selectionDiv, e.selection), null != e.teTop && (this.wrapper.style.top = e.teTop + "px", this.wrapper.style.left = e.teLeft + "px")
      },
      reset: function(e) {
        if (!this.contextMenuPending) {
          var t, n, r = this.cm,
            i = r.doc;
          if (r.somethingSelected()) {
            this.prevInput = "";
            var o = i.sel.primary();
            t = Yl && (o.to().line - o.from().line > 100 || (n = r.getSelection()).length > 1e3);
            var l = t ? "-" : n || r.getSelection();
            this.textarea.value = l, r.state.focused && El(this.textarea), po && go >= 9 && (this.hasSelection = l)
          } else e || (this.prevInput = this.textarea.value = "", po && go >= 9 && (this.hasSelection = null));
          this.inaccurateSelection = t
        }
      },
      getField: function() {
        return this.textarea
      },
      supportsTouch: function() {
        return !1
      },
      focus: function() {
        if ("nocursor" != this.cm.options.readOnly && (!Lo || Gi() != this.textarea)) try {
          this.textarea.focus()
        } catch (e) {}
      },
      blur: function() {
        this.textarea.blur()
      },
      resetPosition: function() {
        this.wrapper.style.top = this.wrapper.style.left = 0
      },
      receivedFocus: function() {
        this.slowPoll()
      },
      slowPoll: function() {
        var e = this;
        e.pollingFast || e.polling.set(this.cm.options.pollInterval, function() {
          e.poll(), e.cm.state.focused && e.slowPoll()
        })
      },
      fastPoll: function() {
        function e() {
          var r = n.poll();
          r || t ? (n.pollingFast = !1, n.slowPoll()) : (t = !0, n.polling.set(60, e))
        }
        var t = !1,
          n = this;
        n.pollingFast = !0, n.polling.set(20, e)
      },
      poll: function() {
        var e = this.cm,
          t = this.textarea,
          n = this.prevInput;
        if (this.contextMenuPending || !e.state.focused || Xl(t) && !n && !this.composing || Q(e) || e.options.disableInput || e.state.keySeq) return !1;
        var r = t.value;
        if (r == n && !e.somethingSelected()) return !1;
        if (po && go >= 9 && this.hasSelection === r || ko && /[\uf700-\uf7ff]/.test(r)) return e.display.input.reset(), !1;
        if (e.doc.sel == e.display.selForContextMenu) {
          var i = r.charCodeAt(0);
          if (8203 != i || n || (n = "​"), 8666 == i) return this.reset(), this.cm.execCommand("undo")
        }
        for (var o = 0, l = Math.min(n.length, r.length); l > o && n.charCodeAt(o) == r.charCodeAt(o);) ++o;
        var s = this;
        return At(e, function() {
          Z(e, r.slice(o), n.length - o, null, s.composing ? "*compose" : null), r.length > 1e3 || r.indexOf("\n") > -1 ? t.value = s.prevInput = "" : s.prevInput = r, s.composing && (s.composing.range.clear(), s.composing.range = e.markText(s.composing.start, e.getCursor("to"), {
            className: "CodeMirror-composing"
          }))
        }), !0
      },
      ensurePolled: function() {
        this.pollingFast && this.poll() && (this.pollingFast = !1)
      },
      onKeyPress: function() {
        po && go >= 9 && (this.hasSelection = null), this.fastPoll()
      },
      onContextMenu: function(e) {
        function t() {
          if (null != l.selectionStart) {
            var e = i.somethingSelected(),
              t = "​" + (e ? l.value : "");
            l.value = "⇚", l.value = t, r.prevInput = e ? "" : "​", l.selectionStart = 1, l.selectionEnd = t.length, o.selForContextMenu = i.doc.sel
          }
        }

        function n() {
          if (r.contextMenuPending = !1, r.wrapper.style.position = "relative", l.style.cssText = u, po && 9 > go && o.scrollbars.setScrollTop(o.scroller.scrollTop = a), null != l.selectionStart) {
            (!po || po && 9 > go) && t();
            var e = 0,
              n = function() {
                o.selForContextMenu == i.doc.sel && 0 == l.selectionStart && l.selectionEnd > 0 && "​" == r.prevInput ? Ot(i, il.selectAll)(i) : e++ < 10 ? o.detectingSelectAll = setTimeout(n, 500) : o.input.reset()
              };
            o.detectingSelectAll = setTimeout(n, 200)
          }
        }
        var r = this,
          i = r.cm,
          o = i.display,
          l = r.textarea,
          s = Vt(i, e),
          a = o.scroller.scrollTop;
        if (s && !bo) {
          var c = i.options.resetSelectionOnContextMenu;
          c && -1 == i.doc.sel.contains(s) && Ot(i, Me)(i.doc, pe(s), Nl);
          var u = l.style.cssText;
          if (r.wrapper.style.position = "absolute", l.style.cssText = "position: fixed; width: 30px; height: 30px; top: " + (e.clientY - 5) + "px; left: " + (e.clientX - 5) + "px; z-index: 1000; background: " + (po ? "rgba(255, 255, 255, .05)" : "transparent") + "; outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);", mo) var f = window.scrollY;
          if (o.input.focus(), mo && window.scrollTo(null, f), o.input.reset(), i.somethingSelected() || (l.value = r.prevInput = " "), r.contextMenuPending = !0, o.selForContextMenu = i.doc.sel, clearTimeout(o.detectingSelectAll), po && go >= 9 && t(), Oo) {
            Sl(e);
            var d = function() {
              kl(window, "mouseup", d), setTimeout(n, 20)
            };
            Ll(window, "mouseup", d)
          } else setTimeout(n, 50)
        }
      },
      setUneditable: Pi,
      needsContentAttribute: !1
    }, re.prototype), oe.prototype = Di({
      init: function(e) {
        function t(e) {
          if (r.somethingSelected()) Do = r.getSelections(), "cut" == e.type && r.replaceSelection("", null, "cut");
          else {
            if (!r.options.lineWiseCopyCut) return;
            var t = te(r);
            Do = t.text, "cut" == e.type && r.operation(function() {
              r.setSelections(t.ranges, 0, Nl), r.replaceSelection("", null, "cut")
            })
          }
          if (e.clipboardData && !So) e.preventDefault(), e.clipboardData.clearData(), e.clipboardData.setData("text/plain", Do.join("\n"));
          else {
            var n = ie(),
              i = n.firstChild;
            r.display.lineSpace.insertBefore(n, r.display.lineSpace.firstChild), i.value = Do.join("\n");
            var o = document.activeElement;
            El(i), setTimeout(function() {
              r.display.lineSpace.removeChild(n), o.focus()
            }, 50)
          }
        }
        var n = this,
          r = n.cm,
          i = n.div = e.lineDiv;
        i.contentEditable = "true", ne(i), Ll(i, "paste", function(e) {
          J(e, r)
        }), Ll(i, "compositionstart", function(e) {
          var t = e.data;
          if (n.composing = {
              sel: r.doc.sel,
              data: t,
              startData: t
            }, t) {
            var i = r.doc.sel.primary(),
              o = r.getLine(i.head.line),
              l = o.indexOf(t, Math.max(0, i.head.ch - t.length));
            l > -1 && l <= i.head.ch && (n.composing.sel = pe(Po(i.head.line, l), Po(i.head.line, l + t.length)))
          }
        }), Ll(i, "compositionupdate", function(e) {
          n.composing.data = e.data
        }), Ll(i, "compositionend", function(e) {
          var t = n.composing;
          t && (e.data == t.startData || /\u200b/.test(e.data) || (t.data = e.data), setTimeout(function() {
            t.handled || n.applyComposition(t), n.composing == t && (n.composing = null)
          }, 50))
        }), Ll(i, "touchstart", function() {
          n.forceCompositionEnd()
        }), Ll(i, "input", function() {
          n.composing || n.pollContent() || At(n.cm, function() {
            Dt(r)
          })
        }), Ll(i, "copy", t), Ll(i, "cut", t)
      },
      prepareSelection: function() {
        var e = De(this.cm, !1);
        return e.focus = this.cm.state.focused, e
      },
      showSelection: function(e) {
        e && this.cm.display.view.length && (e.focus && this.showPrimarySelection(), this.showMultipleSelections(e))
      },
      showPrimarySelection: function() {
        var e = window.getSelection(),
          t = this.cm.doc.sel.primary(),
          n = ae(this.cm, e.anchorNode, e.anchorOffset),
          r = ae(this.cm, e.focusNode, e.focusOffset);
        if (!n || n.bad || !r || r.bad || 0 != Wo(Y(n, r), t.from()) || 0 != Wo(X(n, r), t.to())) {
          var i = le(this.cm, t.from()),
            o = le(this.cm, t.to());
          if (i || o) {
            var l = this.cm.display.view,
              s = e.rangeCount && e.getRangeAt(0);
            if (i) {
              if (!o) {
                var a = l[l.length - 1].measure,
                  c = a.maps ? a.maps[a.maps.length - 1] : a.map;
                o = {
                  node: c[c.length - 1],
                  offset: c[c.length - 2] - c[c.length - 3]
                }
              }
            } else i = {
              node: l[0].measure.map[2],
              offset: 0
            };
            try {
              var u = Fl(i.node, i.offset, o.offset, o.node)
            } catch (f) {}
            u && (e.removeAllRanges(), e.addRange(u), s && null == e.anchorNode ? e.addRange(s) : uo && this.startGracePeriod()), this.rememberSelection()
          }
        }
      },
      startGracePeriod: function() {
        var e = this;
        clearTimeout(this.gracePeriod), this.gracePeriod = setTimeout(function() {
          e.gracePeriod = !1, e.selectionChanged() && e.cm.operation(function() {
            e.cm.curOp.selectionChanged = !0
          })
        }, 20)
      },
      showMultipleSelections: function(e) {
        ji(this.cm.display.cursorDiv, e.cursors), ji(this.cm.display.selectionDiv, e.selection)
      },
      rememberSelection: function() {
        var e = window.getSelection();
        this.lastAnchorNode = e.anchorNode, this.lastAnchorOffset = e.anchorOffset, this.lastFocusNode = e.focusNode, this.lastFocusOffset = e.focusOffset
      },
      selectionInEditor: function() {
        var e = window.getSelection();
        if (!e.rangeCount) return !1;
        var t = e.getRangeAt(0).commonAncestorContainer;
        return Bl(this.div, t)
      },
      focus: function() {
        "nocursor" != this.cm.options.readOnly && this.div.focus()
      },
      blur: function() {
        this.div.blur()
      },
      getField: function() {
        return this.div
      },
      supportsTouch: function() {
        return !0
      },
      receivedFocus: function() {
        function e() {
          t.cm.state.focused && (t.pollSelection(), t.polling.set(t.cm.options.pollInterval, e))
        }
        var t = this;
        this.selectionInEditor() ? this.pollSelection() : At(this.cm, function() {
          t.cm.curOp.selectionChanged = !0
        }), this.polling.set(this.cm.options.pollInterval, e)
      },
      selectionChanged: function() {
        var e = window.getSelection();
        return e.anchorNode != this.lastAnchorNode || e.anchorOffset != this.lastAnchorOffset || e.focusNode != this.lastFocusNode || e.focusOffset != this.lastFocusOffset
      },
      pollSelection: function() {
        if (!this.composing && !this.gracePeriod && this.selectionChanged()) {
          var e = window.getSelection(),
            t = this.cm;
          this.rememberSelection();
          var n = ae(t, e.anchorNode, e.anchorOffset),
            r = ae(t, e.focusNode, e.focusOffset);
          n && r && At(t, function() {
            Me(t.doc, pe(n, r), Nl), (n.bad || r.bad) && (t.curOp.selectionChanged = !0)
          })
        }
      },
      pollContent: function() {
        var e = this.cm,
          t = e.display,
          n = e.doc.sel.primary(),
          r = n.from(),
          i = n.to();
        if (r.line < t.viewFrom || i.line > t.viewTo - 1) return !1;
        var o;
        if (r.line == t.viewFrom || 0 == (o = It(e, r.line))) var l = Zr(t.view[0].line),
          s = t.view[0].node;
        else var l = Zr(t.view[o].line),
          s = t.view[o - 1].node.nextSibling;
        var a = It(e, i.line);
        if (a == t.view.length - 1) var c = t.viewTo - 1,
          u = t.lineDiv.lastChild;
        else var c = Zr(t.view[a + 1].line) - 1,
          u = t.view[a + 1].node.previousSibling;
        for (var f = e.doc.splitLines(ue(e, s, u, l, c)), d = Yr(e.doc, Po(l, 0), Po(c, Xr(e.doc, c).text.length)); f.length > 1 && d.length > 1;)
          if (Oi(f) == Oi(d)) f.pop(), d.pop(), c--;
          else {
            if (f[0] != d[0]) break;
            f.shift(), d.shift(), l++
          } for (var h = 0, p = 0, g = f[0], m = d[0], v = Math.min(g.length, m.length); v > h && g.charCodeAt(h) == m.charCodeAt(h);) ++h;
        for (var y = Oi(f), b = Oi(d), x = Math.min(y.length - (1 == f.length ? h : 0), b.length - (1 == d.length ? h : 0)); x > p && y.charCodeAt(y.length - p - 1) == b.charCodeAt(b.length - p - 1);) ++p;
        f[f.length - 1] = y.slice(0, y.length - p), f[0] = f[0].slice(h);
        var C = Po(l, h),
          w = Po(c, d.length ? Oi(d).length - p : 0);
        return f.length > 1 || f[0] || Wo(C, w) ? (On(e.doc, f, C, w, "+input"), !0) : void 0
      },
      ensurePolled: function() {
        this.forceCompositionEnd()
      },
      reset: function() {
        this.forceCompositionEnd()
      },
      forceCompositionEnd: function() {
        this.composing && !this.composing.handled && (this.applyComposition(this.composing), this.composing.handled = !0, this.div.blur(), this.div.focus())
      },
      applyComposition: function(e) {
        e.data && e.data != e.startData && Ot(this.cm, Z)(this.cm, e.data, 0, e.sel)
      },
      setUneditable: function(e) {
        e.setAttribute("contenteditable", "false")
      },
      onKeyPress: function(e) {
        e.preventDefault(), Ot(this.cm, Z)(this.cm, String.fromCharCode(null == e.charCode ? e.keyCode : e.charCode), 0)
      },
      onContextMenu: Pi,
      resetPosition: Pi,
      needsContentAttribute: !0
    }, oe.prototype), e.inputStyles = {
      textarea: re,
      contenteditable: oe
    }, fe.prototype = {
      primary: function() {
        return this.ranges[this.primIndex]
      },
      equals: function(e) {
        if (e == this) return !0;
        if (e.primIndex != this.primIndex || e.ranges.length != this.ranges.length) return !1;
        for (var t = 0; t < this.ranges.length; t++) {
          var n = this.ranges[t],
            r = e.ranges[t];
          if (0 != Wo(n.anchor, r.anchor) || 0 != Wo(n.head, r.head)) return !1
        }
        return !0
      },
      deepCopy: function() {
        for (var e = [], t = 0; t < this.ranges.length; t++) e[t] = new de(_(this.ranges[t].anchor), _(this.ranges[t].head));
        return new fe(e, this.primIndex)
      },
      somethingSelected: function() {
        for (var e = 0; e < this.ranges.length; e++)
          if (!this.ranges[e].empty()) return !0;
        return !1
      },
      contains: function(e, t) {
        t || (t = e);
        for (var n = 0; n < this.ranges.length; n++) {
          var r = this.ranges[n];
          if (Wo(t, r.from()) >= 0 && Wo(e, r.to()) <= 0) return n
        }
        return -1
      }
    }, de.prototype = {
      from: function() {
        return Y(this.anchor, this.head)
      },
      to: function() {
        return X(this.anchor, this.head)
      },
      empty: function() {
        return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch
      }
    };
    var Eo, Fo, Io, zo = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      Ro = null,
      Bo = 0,
      jo = 0,
      Go = 0,
      qo = null;
    po ? qo = -.53 : uo ? qo = 15 : yo ? qo = -.7 : xo && (qo = -1 / 3);
    var Uo = function(e) {
      var t = e.wheelDeltaX,
        n = e.wheelDeltaY;
      return null == t && e.detail && e.axis == e.HORIZONTAL_AXIS && (t = e.detail), null == n && e.detail && e.axis == e.VERTICAL_AXIS ? n = e.detail : null == n && (n = e.wheelDelta), {
        x: t,
        y: n
      }
    };
    e.wheelEventPixels = function(e) {
      var t = Uo(e);
      return t.x *= qo, t.y *= qo, t
    };
    var Vo = new Ti,
      Ko = null,
      _o = e.changeEnd = function(e) {
        return e.text ? Po(e.from.line + e.text.length - 1, Oi(e.text).length + (1 == e.text.length ? e.from.ch : 0)) : e.to
      };
    e.prototype = {
      constructor: e,
      focus: function() {
        window.focus(), this.display.input.focus()
      },
      setOption: function(e, t) {
        var n = this.options,
          r = n[e];
        (n[e] != t || "mode" == e) && (n[e] = t, Yo.hasOwnProperty(e) && Ot(this, Yo[e])(this, t, r))
      },
      getOption: function(e) {
        return this.options[e]
      },
      getDoc: function() {
        return this.doc
      },
      addKeyMap: function(e, t) {
        this.state.keyMaps[t ? "push" : "unshift"](Un(e))
      },
      removeKeyMap: function(e) {
        for (var t = this.state.keyMaps, n = 0; n < t.length; ++n)
          if (t[n] == e || t[n].name == e) return t.splice(n, 1), !0
      },
      addOverlay: Nt(function(t, n) {
        var r = t.token ? t : e.getMode(this.options, t);
        if (r.startState) throw new Error("Overlays may not be stateful.");
        this.state.overlays.push({
          mode: r,
          modeSpec: t,
          opaque: n && n.opaque
        }), this.state.modeGen++, Dt(this)
      }),
      removeOverlay: Nt(function(e) {
        for (var t = this.state.overlays, n = 0; n < t.length; ++n) {
          var r = t[n].modeSpec;
          if (r == e || "string" == typeof e && r.name == e) return t.splice(n, 1), this.state.modeGen++, void Dt(this)
        }
      }),
      indentLine: Nt(function(e, t, n) {
        "string" != typeof t && "number" != typeof t && (t = null == t ? this.options.smartIndent ? "smart" : "prev" : t ? "add" : "subtract"), ye(this.doc, e) && In(this, e, t, n)
      }),
      indentSelection: Nt(function(e) {
        for (var t = this.doc.sel.ranges, n = -1, r = 0; r < t.length; r++) {
          var i = t[r];
          if (i.empty()) i.head.line > n && (In(this, i.head.line, e, !0), n = i.head.line, r == this.doc.sel.primIndex && En(this));
          else {
            var o = i.from(),
              l = i.to(),
              s = Math.max(n, o.line);
            n = Math.min(this.lastLine(), l.line - (l.ch ? 0 : 1)) + 1;
            for (var a = s; n > a; ++a) In(this, a, e);
            var c = this.doc.sel.ranges;
            0 == o.ch && t.length == c.length && c[r].from().ch > 0 && Se(this.doc, r, new de(o, c[r].to()), Nl)
          }
        }
      }),
      getTokenAt: function(e, t) {
        return Or(this, e, t)
      },
      getLineTokens: function(e, t) {
        return Or(this, Po(e), t, !0)
      },
      getTokenTypeAt: function(e) {
        e = me(this.doc, e);
        var t, n = Pr(this, Xr(this.doc, e.line)),
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
        var s = t ? t.indexOf("cm-overlay ") : -1;
        return 0 > s ? t : 0 == s ? null : t.slice(0, s - 1)
      },
      getModeAt: function(t) {
        var n = this.doc.mode;
        return n.innerMode ? e.innerMode(n, this.getTokenAt(t).state).mode : n
      },
      getHelper: function(e, t) {
        return this.getHelpers(e, t)[0]
      },
      getHelpers: function(e, t) {
        var n = [];
        if (!tl.hasOwnProperty(t)) return n;
        var r = tl[t],
          i = this.getModeAt(e);
        if ("string" == typeof i[t]) r[i[t]] && n.push(r[i[t]]);
        else if (i[t])
          for (var o = 0; o < i[t].length; o++) {
            var l = r[i[t][o]];
            l && n.push(l)
          } else i.helperType && r[i.helperType] ? n.push(r[i.helperType]) : r[i.name] && n.push(r[i.name]);
        for (var o = 0; o < r._global.length; o++) {
          var s = r._global[o];
          s.pred(i, this) && -1 == Ni(n, s.val) && n.push(s.val)
        }
        return n
      },
      getStateAfter: function(e, t) {
        var n = this.doc;
        return e = ge(n, null == e ? n.first + n.size - 1 : e), je(this, e + 1, t)
      },
      cursorCoords: function(e, t) {
        var n, r = this.doc.sel.primary();
        return n = null == e ? r.head : "object" == typeof e ? me(this.doc, e) : e ? r.from() : r.to(), dt(this, n, t || "page")
      },
      charCoords: function(e, t) {
        return ft(this, me(this.doc, e), t || "page")
      },
      coordsChar: function(e, t) {
        return e = ut(this, e, t || "page"), gt(this, e.left, e.top)
      },
      lineAtHeight: function(e, t) {
        return e = ut(this, {
          top: e,
          left: 0
        }, t || "page").top, Jr(this.doc, e + this.display.viewOffset)
      },
      heightAtLine: function(e, t) {
        var n, r = !1;
        if ("number" == typeof e) {
          var i = this.doc.first + this.doc.size - 1;
          e < this.doc.first ? e = this.doc.first : e > i && (e = i, r = !0), n = Xr(this.doc, e)
        } else n = e;
        return ct(this, n, {
          top: 0,
          left: 0
        }, t || "page").top + (r ? this.doc.height - ei(n) : 0)
      },
      defaultTextHeight: function() {
        return vt(this.display)
      },
      defaultCharWidth: function() {
        return yt(this.display)
      },
      setGutterMarker: Nt(function(e, t, n) {
        return zn(this.doc, e, "gutter", function(e) {
          var r = e.gutterMarkers || (e.gutterMarkers = {});
          return r[t] = n, !n && Ii(r) && (e.gutterMarkers = null), !0
        })
      }),
      clearGutter: Nt(function(e) {
        var t = this,
          n = t.doc,
          r = n.first;
        n.iter(function(n) {
          n.gutterMarkers && n.gutterMarkers[e] && (n.gutterMarkers[e] = null, Et(t, r, "gutter"), Ii(n.gutterMarkers) && (n.gutterMarkers = null)), ++r
        })
      }),
      lineInfo: function(e) {
        if ("number" == typeof e) {
          if (!ye(this.doc, e)) return null;
          var t = e;
          if (e = Xr(this.doc, e), !e) return null
        } else {
          var t = Zr(e);
          if (null == t) return null
        }
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
      getViewport: function() {
        return {
          from: this.display.viewFrom,
          to: this.display.viewTo
        }
      },
      addWidget: function(e, t, n, r, i) {
        var o = this.display;
        e = dt(this, me(this.doc, e));
        var l = e.bottom,
          s = e.left;
        if (t.style.position = "absolute", t.setAttribute("cm-ignore-events", "true"), this.display.input.setUneditable(t), o.sizer.appendChild(t), "over" == r) l = e.top;
        else if ("above" == r || "near" == r) {
          var a = Math.max(o.wrapper.clientHeight, this.doc.height),
            c = Math.max(o.sizer.clientWidth, o.lineSpace.clientWidth);
          ("above" == r || e.bottom + t.offsetHeight > a) && e.top > t.offsetHeight ? l = e.top - t.offsetHeight : e.bottom + t.offsetHeight <= a && (l = e.bottom), s + t.offsetWidth > c && (s = c - t.offsetWidth)
        }
        t.style.top = l + "px", t.style.left = t.style.right = "", "right" == i ? (s = o.sizer.clientWidth - t.offsetWidth, t.style.right = "0px") : ("left" == i ? s = 0 : "middle" == i && (s = (o.sizer.clientWidth - t.offsetWidth) / 2), t.style.left = s + "px"), n && Pn(this, s, l, s + t.offsetWidth, l + t.offsetHeight)
      },
      triggerOnKeyDown: Nt(cn),
      triggerOnKeyPress: Nt(dn),
      triggerOnKeyUp: fn,
      execCommand: function(e) {
        return il.hasOwnProperty(e) ? il[e](this) : void 0
      },
      triggerElectric: Nt(function(e) {
        ee(this, e)
      }),
      findPosH: function(e, t, n, r) {
        var i = 1;
        0 > t && (i = -1, t = -t);
        for (var o = 0, l = me(this.doc, e); t > o && (l = Bn(this.doc, l, i, n, r), !l.hitSide); ++o);
        return l
      },
      moveH: Nt(function(e, t) {
        var n = this;
        n.extendSelectionsBy(function(r) {
          return n.display.shift || n.doc.extend || r.empty() ? Bn(n.doc, r.head, e, t, n.options.rtlMoveVisually) : 0 > e ? r.from() : r.to()
        }, Pl)
      }),
      deleteH: Nt(function(e, t) {
        var n = this.doc.sel,
          r = this.doc;
        n.somethingSelected() ? r.replaceSelection("", null, "+delete") : Rn(this, function(n) {
          var i = Bn(r, n.head, e, t, !1);
          return 0 > e ? {
            from: i,
            to: n.head
          } : {
            from: n.head,
            to: i
          }
        })
      }),
      findPosV: function(e, t, n, r) {
        var i = 1,
          o = r;
        0 > t && (i = -1, t = -t);
        for (var l = 0, s = me(this.doc, e); t > l; ++l) {
          var a = dt(this, s, "div");
          if (null == o ? o = a.left : a.left = o, s = jn(this, a, i, n), s.hitSide) break
        }
        return s
      },
      moveV: Nt(function(e, t) {
        var n = this,
          r = this.doc,
          i = [],
          o = !n.display.shift && !r.extend && r.sel.somethingSelected();
        if (r.extendSelectionsBy(function(l) {
            if (o) return 0 > e ? l.from() : l.to();
            var s = dt(n, l.head, "div");
            null != l.goalColumn && (s.left = l.goalColumn), i.push(s.left);
            var a = jn(n, s, e, t);
            return "page" == t && l == r.sel.primary() && Dn(n, null, ft(n, a, "div").top - s.top), a
          }, Pl), i.length)
          for (var l = 0; l < r.sel.ranges.length; l++) r.sel.ranges[l].goalColumn = i[l]
      }),
      findWordAt: function(e) {
        var t = this.doc,
          n = Xr(t, e.line).text,
          r = e.ch,
          i = e.ch;
        if (n) {
          var o = this.getHelper(e, "wordChars");
          (e.xRel < 0 || i == n.length) && r ? --r : ++i;
          for (var l = n.charAt(r), s = Fi(l, o) ? function(e) {
              return Fi(e, o)
            } : /\s/.test(l) ? function(e) {
              return /\s/.test(e)
            } : function(e) {
              return !/\s/.test(e) && !Fi(e)
            }; r > 0 && s(n.charAt(r - 1));) --r;
          for (; i < n.length && s(n.charAt(i));) ++i
        }
        return new de(Po(e.line, r), Po(e.line, i))
      },
      toggleOverwrite: function(e) {
        (null == e || e != this.state.overwrite) && ((this.state.overwrite = !this.state.overwrite) ? Ul(this.display.cursorDiv, "CodeMirror-overwrite") : ql(this.display.cursorDiv, "CodeMirror-overwrite"), Tl(this, "overwriteToggle", this, this.state.overwrite))
      },
      hasFocus: function() {
        return this.display.input.getField() == Gi()
      },
      scrollTo: Nt(function(e, t) {
        (null != e || null != t) && Fn(this), null != e && (this.curOp.scrollLeft = e), null != t && (this.curOp.scrollTop = t)
      }),
      getScrollInfo: function() {
        var e = this.display.scroller;
        return {
          left: e.scrollLeft,
          top: e.scrollTop,
          height: e.scrollHeight - Ve(this) - this.display.barHeight,
          width: e.scrollWidth - Ve(this) - this.display.barWidth,
          clientHeight: _e(this),
          clientWidth: Ke(this)
        }
      },
      scrollIntoView: Nt(function(e, t) {
        if (null == e ? (e = {
            from: this.doc.sel.primary().head,
            to: null
          }, null == t && (t = this.options.cursorScrollMargin)) : "number" == typeof e ? e = {
            from: Po(e, 0),
            to: null
          } : null == e.from && (e = {
            from: e,
            to: null
          }), e.to || (e.to = e.from), e.margin = t || 0, null != e.from.line) Fn(this), this.curOp.scrollToPos = e;
        else {
          var n = Wn(this, Math.min(e.from.left, e.to.left), Math.min(e.from.top, e.to.top) - e.margin, Math.max(e.from.right, e.to.right), Math.max(e.from.bottom, e.to.bottom) + e.margin);
          this.scrollTo(n.scrollLeft, n.scrollTop)
        }
      }),
      setSize: Nt(function(e, t) {
        function n(e) {
          return "number" == typeof e || /^\d+$/.test(String(e)) ? e + "px" : e
        }
        var r = this;
        null != e && (r.display.wrapper.style.width = n(e)), null != t && (r.display.wrapper.style.height = n(t)), r.options.lineWrapping && ot(this);
        var i = r.display.viewFrom;
        r.doc.iter(i, r.display.viewTo, function(e) {
          if (e.widgets)
            for (var t = 0; t < e.widgets.length; t++)
              if (e.widgets[t].noHScroll) {
                Et(r, i, "widget");
                break
              }++ i
        }), r.curOp.forceUpdate = !0, Tl(r, "refresh", this)
      }),
      operation: function(e) {
        return At(this, e)
      },
      refresh: Nt(function() {
        var e = this.display.cachedTextHeight;
        Dt(this), this.curOp.forceUpdate = !0, lt(this), this.scrollTo(this.doc.scrollLeft, this.doc.scrollTop), u(this), (null == e || Math.abs(e - vt(this.display)) > .5) && l(this), Tl(this, "refresh", this)
      }),
      swapDoc: Nt(function(e) {
        var t = this.doc;
        return t.cm = null, _r(this, e), lt(this), this.display.input.reset(), this.scrollTo(e.scrollLeft, e.scrollTop), this.curOp.forceScroll = !0, xi(this, "swapDoc", this, t), t
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
    }, ki(e);
    var Xo = e.defaults = {},
      Yo = e.optionHandlers = {},
      $o = e.Init = {
        toString: function() {
          return "CodeMirror.Init"
        }
      };
    Gn("value", "", function(e, t) {
      e.setValue(t)
    }, !0), Gn("mode", null, function(e, t) {
      e.doc.modeOption = t, n(e)
    }, !0), Gn("indentUnit", 2, n, !0), Gn("indentWithTabs", !1), Gn("smartIndent", !0), Gn("tabSize", 4, function(e) {
      r(e), lt(e), Dt(e)
    }, !0), Gn("lineSeparator", null, function(e, t) {
      if (e.doc.lineSep = t, t) {
        var n = [],
          r = e.doc.first;
        e.doc.iter(function(e) {
          for (var i = 0;;) {
            var o = e.text.indexOf(t, i);
            if (-1 == o) break;
            i = o + t.length, n.push(Po(r, o))
          }
          r++
        });
        for (var i = n.length - 1; i >= 0; i--) On(e.doc, t, n[i], Po(n[i].line, n[i].ch + t.length))
      }
    }), Gn("specialChars", /[\t\u0000-\u0019\u00ad\u200b-\u200f\u2028\u2029\ufeff]/g, function(t, n, r) {
      t.state.specialChars = new RegExp(n.source + (n.test("	") ? "" : "|	"), "g"), r != e.Init && t.refresh()
    }), Gn("specialCharPlaceholder", Fr, function(e) {
      e.refresh()
    }, !0), Gn("electricChars", !0), Gn("inputStyle", Lo ? "contenteditable" : "textarea", function() {
      throw new Error("inputStyle can not (yet) be changed in a running editor")
    }, !0), Gn("rtlMoveVisually", !To), Gn("wholeLineUpdateBefore", !0), Gn("theme", "default", function(e) {
      s(e), a(e)
    }, !0), Gn("keyMap", "default", function(t, n, r) {
      var i = Un(n),
        o = r != e.Init && Un(r);
      o && o.detach && o.detach(t, i), i.attach && i.attach(t, o || null)
    }), Gn("extraKeys", null), Gn("lineWrapping", !1, i, !0), Gn("gutters", [], function(e) {
      h(e.options), a(e)
    }, !0), Gn("fixedGutter", !0, function(e, t) {
      e.display.gutters.style.left = t ? L(e.display) + "px" : "0", e.refresh()
    }, !0), Gn("coverGutterNextToScrollbar", !1, function(e) {
      y(e)
    }, !0), Gn("scrollbarStyle", "native", function(e) {
      v(e), y(e), e.display.scrollbars.setScrollTop(e.doc.scrollTop), e.display.scrollbars.setScrollLeft(e.doc.scrollLeft)
    }, !0), Gn("lineNumbers", !1, function(e) {
      h(e.options), a(e)
    }, !0), Gn("firstLineNumber", 1, a, !0), Gn("lineNumberFormatter", function(e) {
      return e
    }, a, !0), Gn("showCursorWhenSelecting", !1, We, !0), Gn("resetSelectionOnContextMenu", !0), Gn("lineWiseCopyCut", !0), Gn("readOnly", !1, function(e, t) {
      "nocursor" == t ? (gn(e), e.display.input.blur(), e.display.disabled = !0) : (e.display.disabled = !1, t || e.display.input.reset())
    }), Gn("disableInput", !1, function(e, t) {
      t || e.display.input.reset()
    }, !0), Gn("dragDrop", !0, Gt), Gn("cursorBlinkRate", 530), Gn("cursorScrollMargin", 0), Gn("cursorHeight", 1, We, !0), Gn("singleCursorHeightPerLine", !0, We, !0), Gn("workTime", 100), Gn("workDelay", 100), Gn("flattenSpans", !0, r, !0), Gn("addModeClass", !1, r, !0), Gn("pollInterval", 100), Gn("undoDepth", 200, function(e, t) {
      e.doc.history.undoDepth = t
    }), Gn("historyEventDelay", 1250), Gn("viewportMargin", 10, function(e) {
      e.refresh()
    }, !0), Gn("maxHighlightLength", 1e4, r, !0), Gn("moveInputWithCursor", !0, function(e, t) {
      t || e.display.input.resetPosition()
    }), Gn("tabindex", null, function(e, t) {
      e.display.input.getField().tabIndex = t || ""
    }), Gn("autofocus", null);
    var Qo = e.modes = {},
      Zo = e.mimeModes = {};
    e.defineMode = function(t, n) {
      e.defaults.mode || "null" == t || (e.defaults.mode = t), arguments.length > 2 && (n.dependencies = Array.prototype.slice.call(arguments, 2)), Qo[t] = n
    }, e.defineMIME = function(e, t) {
      Zo[e] = t
    }, e.resolveMode = function(t) {
      if ("string" == typeof t && Zo.hasOwnProperty(t)) t = Zo[t];
      else if (t && "string" == typeof t.name && Zo.hasOwnProperty(t.name)) {
        var n = Zo[t.name];
        "string" == typeof n && (n = {
          name: n
        }), t = Wi(n, t), t.name = n.name
      } else if ("string" == typeof t && /^[\w\-]+\/[\w\-]+\+xml$/.test(t)) return e.resolveMode("application/xml");
      return "string" == typeof t ? {
        name: t
      } : t || {
        name: "null"
      }
    }, e.getMode = function(t, n) {
      var n = e.resolveMode(n),
        r = Qo[n.name];
      if (!r) return e.getMode(t, "text/plain");
      var i = r(t, n);
      if (Jo.hasOwnProperty(n.name)) {
        var o = Jo[n.name];
        for (var l in o) o.hasOwnProperty(l) && (i.hasOwnProperty(l) && (i["_" + l] = i[l]), i[l] = o[l])
      }
      if (i.name = n.name, n.helperType && (i.helperType = n.helperType), n.modeProps)
        for (var l in n.modeProps) i[l] = n.modeProps[l];
      return i
    }, e.defineMode("null", function() {
      return {
        token: function(e) {
          e.skipToEnd()
        }
      }
    }), e.defineMIME("text/plain", "null");
    var Jo = e.modeExtensions = {};
    e.extendMode = function(e, t) {
      var n = Jo.hasOwnProperty(e) ? Jo[e] : Jo[e] = {};
      Di(t, n)
    }, e.defineExtension = function(t, n) {
      e.prototype[t] = n
    }, e.defineDocExtension = function(e, t) {
      yl.prototype[e] = t
    }, e.defineOption = Gn;
    var el = [];
    e.defineInitHook = function(e) {
      el.push(e)
    };
    var tl = e.helpers = {};
    e.registerHelper = function(t, n, r) {
      tl.hasOwnProperty(t) || (tl[t] = e[t] = {
        _global: []
      }), tl[t][n] = r
    }, e.registerGlobalHelper = function(t, n, r, i) {
      e.registerHelper(t, n, i), tl[t]._global.push({
        pred: r,
        val: i
      })
    };
    var nl = e.copyState = function(e, t) {
        if (t === !0) return t;
        if (e.copyState) return e.copyState(t);
        var n = {};
        for (var r in t) {
          var i = t[r];
          i instanceof Array && (i = i.concat([])), n[r] = i
        }
        return n
      },
      rl = e.startState = function(e, t, n) {
        return e.startState ? e.startState(t, n) : !0
      };
    e.innerMode = function(e, t) {
      for (; e.innerMode;) {
        var n = e.innerMode(t);
        if (!n || n.mode == e) break;
        t = n.state, e = n.mode
      }
      return n || {
        mode: e,
        state: t
      }
    };
    var il = e.commands = {
        selectAll: function(e) {
          e.setSelection(Po(e.firstLine(), 0), Po(e.lastLine()), Nl)
        },
        singleSelection: function(e) {
          e.setSelection(e.getCursor("anchor"), e.getCursor("head"), Nl)
        },
        killLine: function(e) {
          Rn(e, function(t) {
            if (t.empty()) {
              var n = Xr(e.doc, t.head.line).text.length;
              return t.head.ch == n && t.head.line < e.lastLine() ? {
                from: t.head,
                to: Po(t.head.line + 1, 0)
              } : {
                from: t.head,
                to: Po(t.head.line, n)
              }
            }
            return {
              from: t.from(),
              to: t.to()
            }
          })
        },
        deleteLine: function(e) {
          Rn(e, function(t) {
            return {
              from: Po(t.from().line, 0),
              to: me(e.doc, Po(t.to().line + 1, 0))
            }
          })
        },
        delLineLeft: function(e) {
          Rn(e, function(e) {
            return {
              from: Po(e.from().line, 0),
              to: e.from()
            }
          })
        },
        delWrappedLineLeft: function(e) {
          Rn(e, function(t) {
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
          Rn(e, function(t) {
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
          e.undo()
        },
        redo: function(e) {
          e.redo()
        },
        undoSelection: function(e) {
          e.undoSelection()
        },
        redoSelection: function(e) {
          e.redoSelection()
        },
        goDocStart: function(e) {
          e.extendSelection(Po(e.firstLine(), 0))
        },
        goDocEnd: function(e) {
          e.extendSelection(Po(e.lastLine()))
        },
        goLineStart: function(e) {
          e.extendSelectionsBy(function(t) {
            return no(e, t.head.line)
          }, {
            origin: "+move",
            bias: 1
          })
        },
        goLineStartSmart: function(e) {
          e.extendSelectionsBy(function(t) {
            return io(e, t.head)
          }, {
            origin: "+move",
            bias: 1
          })
        },
        goLineEnd: function(e) {
          e.extendSelectionsBy(function(t) {
            return ro(e, t.head.line)
          }, {
            origin: "+move",
            bias: -1
          })
        },
        goLineRight: function(e) {
          e.extendSelectionsBy(function(t) {
            var n = e.charCoords(t.head, "div").top + 5;
            return e.coordsChar({
              left: e.display.lineDiv.offsetWidth + 100,
              top: n
            }, "div")
          }, Pl)
        },
        goLineLeft: function(e) {
          e.extendSelectionsBy(function(t) {
            var n = e.charCoords(t.head, "div").top + 5;
            return e.coordsChar({
              left: 0,
              top: n
            }, "div")
          }, Pl)
        },
        goLineLeftSmart: function(e) {
          e.extendSelectionsBy(function(t) {
            var n = e.charCoords(t.head, "div").top + 5,
              r = e.coordsChar({
                left: 0,
                top: n
              }, "div");
            return r.ch < e.getLine(r.line).search(/\S/) ? io(e, t.head) : r
          }, Pl)
        },
        goLineUp: function(e) {
          e.moveV(-1, "line")
        },
        goLineDown: function(e) {
          e.moveV(1, "line")
        },
        goPageUp: function(e) {
          e.moveV(-1, "page")
        },
        goPageDown: function(e) {
          e.moveV(1, "page")
        },
        goCharLeft: function(e) {
          e.moveH(-1, "char")
        },
        goCharRight: function(e) {
          e.moveH(1, "char")
        },
        goColumnLeft: function(e) {
          e.moveH(-1, "column")
        },
        goColumnRight: function(e) {
          e.moveH(1, "column")
        },
        goWordLeft: function(e) {
          e.moveH(-1, "word")
        },
        goGroupRight: function(e) {
          e.moveH(1, "group")
        },
        goGroupLeft: function(e) {
          e.moveH(-1, "group")
        },
        goWordRight: function(e) {
          e.moveH(1, "word")
        },
        delCharBefore: function(e) {
          e.deleteH(-1, "char")
        },
        delCharAfter: function(e) {
          e.deleteH(1, "char")
        },
        delWordBefore: function(e) {
          e.deleteH(-1, "word")
        },
        delWordAfter: function(e) {
          e.deleteH(1, "word")
        },
        delGroupBefore: function(e) {
          e.deleteH(-1, "group")
        },
        delGroupAfter: function(e) {
          e.deleteH(1, "group")
        },
        indentAuto: function(e) {
          e.indentSelection("smart")
        },
        indentMore: function(e) {
          e.indentSelection("add")
        },
        indentLess: function(e) {
          e.indentSelection("subtract")
        },
        insertTab: function(e) {
          e.replaceSelection("	")
        },
        insertSoftTab: function(e) {
          for (var t = [], n = e.listSelections(), r = e.options.tabSize, i = 0; i < n.length; i++) {
            var o = n[i].from(),
              l = Wl(e.getLine(o.line), o.ch, r);
            t.push(new Array(r - l % r + 1).join(" "))
          }
          e.replaceSelections(t)
        },
        defaultTab: function(e) {
          e.somethingSelected() ? e.indentSelection("add") : e.execCommand("insertTab")
        },
        transposeChars: function(e) {
          At(e, function() {
            for (var t = e.listSelections(), n = [], r = 0; r < t.length; r++) {
              var i = t[r].head,
                o = Xr(e.doc, i.line).text;
              if (o)
                if (i.ch == o.length && (i = new Po(i.line, i.ch - 1)), i.ch > 0) i = new Po(i.line, i.ch + 1), e.replaceRange(o.charAt(i.ch - 1) + o.charAt(i.ch - 2), Po(i.line, i.ch - 2), i, "+transpose");
                else if (i.line > e.doc.first) {
                var l = Xr(e.doc, i.line - 1).text;
                l && e.replaceRange(o.charAt(0) + e.doc.lineSeparator() + l.charAt(l.length - 1), Po(i.line - 1, l.length - 1), Po(i.line, 1), "+transpose")
              }
              n.push(new de(i, i))
            }
            e.setSelections(n)
          })
        },
        newlineAndIndent: function(e) {
          At(e, function() {
            for (var t = e.listSelections().length, n = 0; t > n; n++) {
              var r = e.listSelections()[n];
              e.replaceRange(e.doc.lineSeparator(), r.anchor, r.head, "+input"), e.indentLine(r.from().line + 1, null, !0), En(e)
            }
          })
        },
        toggleOverwrite: function(e) {
          e.toggleOverwrite()
        }
      },
      ol = e.keyMap = {};
    ol.basic = {
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
    }, ol.pcDefault = {
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
    }, ol.emacsy = {
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
      "Ctrl-T": "transposeChars"
    }, ol.macDefault = {
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
    }, ol["default"] = ko ? ol.macDefault : ol.pcDefault, e.normalizeKeyMap = function(e) {
      var t = {};
      for (var n in e)
        if (e.hasOwnProperty(n)) {
          var r = e[n];
          if (/^(name|fallthrough|(de|at)tach)$/.test(n)) continue;
          if ("..." == r) {
            delete e[n];
            continue
          }
          for (var i = Hi(n.split(" "), qn), o = 0; o < i.length; o++) {
            var l, s;
            o == i.length - 1 ? (s = i.join(" "), l = r) : (s = i.slice(0, o + 1).join(" "), l = "...");
            var a = t[s];
            if (a) {
              if (a != l) throw new Error("Inconsistent bindings for " + s)
            } else t[s] = l
          }
          delete e[n]
        } for (var c in t) e[c] = t[c];
      return e
    };
    var ll = e.lookupKey = function(e, t, n, r) {
        t = Un(t);
        var i = t.call ? t.call(e, r) : t[e];

        if (i === !1) return "nothing";
        if ("..." === i) return "multi";
        if (null != i && n(i)) return "handled";
        if (t.fallthrough) {
          if ("[object Array]" != Object.prototype.toString.call(t.fallthrough)) return ll(e, t.fallthrough, n, r);
          for (var o = 0; o < t.fallthrough.length; o++) {
            var l = ll(e, t.fallthrough[o], n, r);
            if (l) return l
          }
        }
      },
      sl = e.isModifierKey = function(e) {
        var t = "string" == typeof e ? e : Ql[e.keyCode];
        return "Ctrl" == t || "Alt" == t || "Shift" == t || "Mod" == t
      },
      al = e.keyName = function(e, t) {
        if (bo && 34 == e.keyCode && e["char"]) return !1;
        var n = Ql[e.keyCode],
          r = n;
        return null == r || e.altGraphKey ? !1 : (e.altKey && "Alt" != n && (r = "Alt-" + r), (Ao ? e.metaKey : e.ctrlKey) && "Ctrl" != n && (r = "Ctrl-" + r), (Ao ? e.ctrlKey : e.metaKey) && "Cmd" != n && (r = "Cmd-" + r), !t && e.shiftKey && "Shift" != n && (r = "Shift-" + r), r)
      };
    e.fromTextArea = function(t, n) {
      function r() {
        t.value = c.getValue()
      }
      if (n = n ? Di(n) : {}, n.value = t.value, !n.tabindex && t.tabIndex && (n.tabindex = t.tabIndex), !n.placeholder && t.placeholder && (n.placeholder = t.placeholder), null == n.autofocus) {
        var i = Gi();
        n.autofocus = i == t || null != t.getAttribute("autofocus") && i == document.body
      }
      if (t.form && (Ll(t.form, "submit", r), !n.leaveSubmitMethodAlone)) {
        var o = t.form,
          l = o.submit;
        try {
          var s = o.submit = function() {
            r(), o.submit = l, o.submit(), o.submit = s
          }
        } catch (a) {}
      }
      n.finishInit = function(e) {
        e.save = r, e.getTextArea = function() {
          return t
        }, e.toTextArea = function() {
          e.toTextArea = isNaN, r(), t.parentNode.removeChild(e.getWrapperElement()), t.style.display = "", t.form && (kl(t.form, "submit", r), "function" == typeof t.form.submit && (t.form.submit = l))
        }
      }, t.style.display = "none";
      var c = e(function(e) {
        t.parentNode.insertBefore(e, t.nextSibling)
      }, n);
      return c
    };
    var cl = e.StringStream = function(e, t) {
      this.pos = this.start = 0, this.string = e, this.tabSize = t || 8, this.lastColumnPos = this.lastColumnValue = 0, this.lineStart = 0
    };
    cl.prototype = {
      eol: function() {
        return this.pos >= this.string.length
      },
      sol: function() {
        return this.pos == this.lineStart
      },
      peek: function() {
        return this.string.charAt(this.pos) || void 0
      },
      next: function() {
        return this.pos < this.string.length ? this.string.charAt(this.pos++) : void 0
      },
      eat: function(e) {
        var t = this.string.charAt(this.pos);
        if ("string" == typeof e) var n = t == e;
        else var n = t && (e.test ? e.test(t) : e(t));
        return n ? (++this.pos, t) : void 0
      },
      eatWhile: function(e) {
        for (var t = this.pos; this.eat(e););
        return this.pos > t
      },
      eatSpace: function() {
        for (var e = this.pos;
          /[\s\u00a0]/.test(this.string.charAt(this.pos));) ++this.pos;
        return this.pos > e
      },
      skipToEnd: function() {
        this.pos = this.string.length
      },
      skipTo: function(e) {
        var t = this.string.indexOf(e, this.pos);
        return t > -1 ? (this.pos = t, !0) : void 0
      },
      backUp: function(e) {
        this.pos -= e
      },
      column: function() {
        return this.lastColumnPos < this.start && (this.lastColumnValue = Wl(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue - (this.lineStart ? Wl(this.string, this.lineStart, this.tabSize) : 0)
      },
      indentation: function() {
        return Wl(this.string, null, this.tabSize) - (this.lineStart ? Wl(this.string, this.lineStart, this.tabSize) : 0)
      },
      match: function(e, t, n) {
        if ("string" != typeof e) {
          var r = this.string.slice(this.pos).match(e);
          return r && r.index > 0 ? null : (r && t !== !1 && (this.pos += r[0].length), r)
        }
        var i = function(e) {
            return n ? e.toLowerCase() : e
          },
          o = this.string.substr(this.pos, e.length);
        return i(o) == i(e) ? (t !== !1 && (this.pos += e.length), !0) : void 0
      },
      current: function() {
        return this.string.slice(this.start, this.pos)
      },
      hideFirstChars: function(e, t) {
        this.lineStart += e;
        try {
          return t()
        } finally {
          this.lineStart -= e
        }
      }
    };
    var ul = 0,
      fl = e.TextMarker = function(e, t) {
        this.lines = [], this.type = t, this.doc = e, this.id = ++ul
      };
    ki(fl), fl.prototype.clear = function() {
      if (!this.explicitlyCleared) {
        var e = this.doc.cm,
          t = e && !e.curOp;
        if (t && bt(e), Li(this, "clear")) {
          var n = this.find();
          n && xi(this, "clear", n.from, n.to)
        }
        for (var r = null, i = null, o = 0; o < this.lines.length; ++o) {
          var l = this.lines[o],
            s = Qn(l.markedSpans, this);
          e && !this.collapsed ? Et(e, Zr(l), "text") : e && (null != s.to && (i = Zr(l)), null != s.from && (r = Zr(l))), l.markedSpans = Zn(l.markedSpans, s), null == s.from && this.collapsed && !br(this.doc, l) && e && Qr(l, vt(e.display))
        }
        if (e && this.collapsed && !e.options.lineWrapping)
          for (var o = 0; o < this.lines.length; ++o) {
            var a = gr(this.lines[o]),
              c = f(a);
            c > e.display.maxLineLength && (e.display.maxLine = a, e.display.maxLineLength = c, e.display.maxLineChanged = !0)
          }
        null != r && e && this.collapsed && Dt(e, r, i + 1), this.lines.length = 0, this.explicitlyCleared = !0, this.atomic && this.doc.cantEdit && (this.doc.cantEdit = !1, e && Ne(e.doc)), e && xi(e, "markerCleared", e, this), t && Ct(e), this.parent && this.parent.clear()
      }
    }, fl.prototype.find = function(e, t) {
      null == e && "bookmark" == this.type && (e = 1);
      for (var n, r, i = 0; i < this.lines.length; ++i) {
        var o = this.lines[i],
          l = Qn(o.markedSpans, this);
        if (null != l.from && (n = Po(t ? o : Zr(o), l.from), -1 == e)) return n;
        if (null != l.to && (r = Po(t ? o : Zr(o), l.to), 1 == e)) return r
      }
      return n && {
        from: n,
        to: r
      }
    }, fl.prototype.changed = function() {
      var e = this.find(-1, !0),
        t = this,
        n = this.doc.cm;
      e && n && At(n, function() {
        var r = e.line,
          i = Zr(e.line),
          o = Ze(n, i);
        if (o && (it(o), n.curOp.selectionChanged = n.curOp.forceUpdate = !0), n.curOp.updateMaxLine = !0, !br(t.doc, r) && null != t.height) {
          var l = t.height;
          t.height = null;
          var s = wr(t) - l;
          s && Qr(r, r.height + s)
        }
      })
    }, fl.prototype.attachLine = function(e) {
      if (!this.lines.length && this.doc.cm) {
        var t = this.doc.cm.curOp;
        t.maybeHiddenMarkers && -1 != Ni(t.maybeHiddenMarkers, this) || (t.maybeUnhiddenMarkers || (t.maybeUnhiddenMarkers = [])).push(this)
      }
      this.lines.push(e)
    }, fl.prototype.detachLine = function(e) {
      if (this.lines.splice(Ni(this.lines, e), 1), !this.lines.length && this.doc.cm) {
        var t = this.doc.cm.curOp;
        (t.maybeHiddenMarkers || (t.maybeHiddenMarkers = [])).push(this)
      }
    };
    var ul = 0,
      dl = e.SharedTextMarker = function(e, t) {
        this.markers = e, this.primary = t;
        for (var n = 0; n < e.length; ++n) e[n].parent = this
      };
    ki(dl), dl.prototype.clear = function() {
      if (!this.explicitlyCleared) {
        this.explicitlyCleared = !0;
        for (var e = 0; e < this.markers.length; ++e) this.markers[e].clear();
        xi(this, "clear")
      }
    }, dl.prototype.find = function(e, t) {
      return this.primary.find(e, t)
    };
    var hl = e.LineWidget = function(e, t, n) {
      if (n)
        for (var r in n) n.hasOwnProperty(r) && (this[r] = n[r]);
      this.doc = e, this.node = t
    };
    ki(hl), hl.prototype.clear = function() {
      var e = this.doc.cm,
        t = this.line.widgets,
        n = this.line,
        r = Zr(n);
      if (null != r && t) {
        for (var i = 0; i < t.length; ++i) t[i] == this && t.splice(i--, 1);
        t.length || (n.widgets = null);
        var o = wr(this);
        Qr(n, Math.max(0, n.height - o)), e && At(e, function() {
          Cr(e, n, -o), Et(e, r, "widget")
        })
      }
    }, hl.prototype.changed = function() {
      var e = this.height,
        t = this.doc.cm,
        n = this.line;
      this.height = null;
      var r = wr(this) - e;
      r && (Qr(n, n.height + r), t && At(t, function() {
        t.curOp.forceUpdate = !0, Cr(t, n, r)
      }))
    };
    var pl = e.Line = function(e, t, n) {
      this.text = e, sr(this, t), this.height = n ? n(this) : 1
    };
    ki(pl), pl.prototype.lineNo = function() {
      return Zr(this)
    };
    var gl = {},
      ml = {};
    Ur.prototype = {
      chunkSize: function() {
        return this.lines.length
      },
      removeInner: function(e, t) {
        for (var n = e, r = e + t; r > n; ++n) {
          var i = this.lines[n];
          this.height -= i.height, kr(i), xi(i, "delete")
        }
        this.lines.splice(e, t)
      },
      collapse: function(e) {
        e.push.apply(e, this.lines)
      },
      insertInner: function(e, t, n) {
        this.height += n, this.lines = this.lines.slice(0, e).concat(t).concat(this.lines.slice(e));
        for (var r = 0; r < t.length; ++r) t[r].parent = this
      },
      iterN: function(e, t, n) {
        for (var r = e + t; r > e; ++e)
          if (n(this.lines[e])) return !0
      }
    }, Vr.prototype = {
      chunkSize: function() {
        return this.size
      },
      removeInner: function(e, t) {
        this.size -= t;
        for (var n = 0; n < this.children.length; ++n) {
          var r = this.children[n],
            i = r.chunkSize();
          if (i > e) {
            var o = Math.min(t, i - e),
              l = r.height;
            if (r.removeInner(e, o), this.height -= l - r.height, i == o && (this.children.splice(n--, 1), r.parent = null), 0 == (t -= o)) break;
            e = 0
          } else e -= i
        }
        if (this.size - t < 25 && (this.children.length > 1 || !(this.children[0] instanceof Ur))) {
          var s = [];
          this.collapse(s), this.children = [new Ur(s)], this.children[0].parent = this
        }
      },
      collapse: function(e) {
        for (var t = 0; t < this.children.length; ++t) this.children[t].collapse(e)
      },
      insertInner: function(e, t, n) {
        this.size += t.length, this.height += n;
        for (var r = 0; r < this.children.length; ++r) {
          var i = this.children[r],
            o = i.chunkSize();
          if (o >= e) {
            if (i.insertInner(e, t, n), i.lines && i.lines.length > 50) {
              for (; i.lines.length > 50;) {
                var l = i.lines.splice(i.lines.length - 25, 25),
                  s = new Ur(l);
                i.height -= s.height, this.children.splice(r + 1, 0, s), s.parent = this
              }
              this.maybeSpill()
            }
            break
          }
          e -= o
        }
      },
      maybeSpill: function() {
        if (!(this.children.length <= 10)) {
          var e = this;
          do {
            var t = e.children.splice(e.children.length - 5, 5),
              n = new Vr(t);
            if (e.parent) {
              e.size -= n.size, e.height -= n.height;
              var r = Ni(e.parent.children, e);
              e.parent.children.splice(r + 1, 0, n)
            } else {
              var i = new Vr(e.children);
              i.parent = e, e.children = [i, n], e = i
            }
            n.parent = e.parent
          } while (e.children.length > 10);
          e.parent.maybeSpill()
        }
      },
      iterN: function(e, t, n) {
        for (var r = 0; r < this.children.length; ++r) {
          var i = this.children[r],
            o = i.chunkSize();
          if (o > e) {
            var l = Math.min(t, o - e);
            if (i.iterN(e, l, n)) return !0;
            if (0 == (t -= l)) break;
            e = 0
          } else e -= o
        }
      }
    };
    var vl = 0,
      yl = e.Doc = function(e, t, n, r) {
        if (!(this instanceof yl)) return new yl(e, t, n, r);
        null == n && (n = 0), Vr.call(this, [new Ur([new pl("", null)])]), this.first = n, this.scrollTop = this.scrollLeft = 0, this.cantEdit = !1, this.cleanGeneration = 1, this.frontier = n;
        var i = Po(n, 0);
        this.sel = pe(i), this.history = new ni(null), this.id = ++vl, this.modeOption = t, this.lineSep = r, "string" == typeof e && (e = this.splitLines(e)), qr(this, {
          from: i,
          to: i,
          text: e
        }), Me(this, pe(i), Nl)
      };
    yl.prototype = Wi(Vr.prototype, {
          constructor: yl,
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
            var t = $r(this, this.first, this.first + this.size);
            return e === !1 ? t : t.join(e || this.lineSeparator())
          },
          setValue: Ht(function(e) {
            var t = Po(this.first, 0),
              n = this.first + this.size - 1;
            Sn(this, {
              from: t,
              to: Po(n, Xr(this, n).text.length),
              text: this.splitLines(e),
              origin: "setValue",
              full: !0
            }, !0), Me(this, pe(t))
          }),
          replaceRange: function(e, t, n, r) {
            t = me(this, t), n = n ? me(this, n) : t, On(this, e, t, n, r)
          },
          getRange: function(e, t, n) {
            var r = Yr(this, me(this, e), me(this, t));
            return n === !1 ? r : r.join(n || this.lineSeparator())
          },
          getLine: function(e) {
            var t = this.getLineHandle(e);
            return t && t.text
          },
          getLineHandle: function(e) {
            return ye(this, e) ? Xr(this, e) : void 0
          },
          getLineNumber: function(e) {
            return Zr(e)
          },
          getLineHandleVisualStart: function(e) {
            return "number" == typeof e && (e = Xr(this, e)), gr(e)
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
            return me(this, e)
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
          setCursor: Ht(function(e, t, n) {
            Le(this, me(this, "number" == typeof e ? Po(e, t || 0) : e), null, n)
          }),
          setSelection: Ht(function(e, t, n) {
            Le(this, me(this, e), me(this, t || e), n)
          }),
          extendSelection: Ht(function(e, t, n) {
            Ce(this, me(this, e), t && me(this, t), n)
          }),
          extendSelections: Ht(function(e, t) {
            we(this, be(this, e, t))
          }),
          extendSelectionsBy: Ht(function(e, t) {
            we(this, Hi(this.sel.ranges, e), t)
          }),
          setSelections: Ht(function(e, t, n) {
            if (e.length) {
              for (var r = 0, i = []; r < e.length; r++) i[r] = new de(me(this, e[r].anchor), me(this, e[r].head));
              null == t && (t = Math.min(e.length - 1, this.sel.primIndex)), Me(this, he(i, t), n)
            }
          }),
          addSelection: Ht(function(e, t, n) {
            var r = this.sel.ranges.slice(0);
            r.push(new de(me(this, e), me(this, t || e))), Me(this, he(r, r.length - 1), n)
          }),
          getSelection: function(e) {
            for (var t, n = this.sel.ranges, r = 0; r < n.length; r++) {
              var i = Yr(this, n[r].from(), n[r].to());
              t = t ? t.concat(i) : i
            }
            return e === !1 ? t : t.join(e || this.lineSeparator())
          },
          getSelections: function(e) {
            for (var t = [], n = this.sel.ranges, r = 0; r < n.length; r++) {
              var i = Yr(this, n[r].from(), n[r].to());
              e !== !1 && (i = i.join(e || this.lineSeparator())), t[r] = i
            }
            return t
          },
          replaceSelection: function(e, t, n) {
            for (var r = [], i = 0; i < this.sel.ranges.length; i++) r[i] = e;
            this.replaceSelections(r, t, n || "+input")
          },
          replaceSelections: Ht(function(e, t, n) {
            for (var r = [], i = this.sel, o = 0; o < i.ranges.length; o++) {
              var l = i.ranges[o];
              r[o] = {
                from: l.from(),
                to: l.to(),
                text: this.splitLines(e[o]),
                origin: n
              }
            }
            for (var s = t && "end" != t && Cn(this, r, t), o = r.length - 1; o >= 0; o--) Sn(this, r[o]);
            s ? Te(this, s) : this.cm && En(this.cm)
          }),
          undo: Ht(function() {
            kn(this, "undo")
          }),
          redo: Ht(function() {
            kn(this, "redo")
          }),
          undoSelection: Ht(function() {
            kn(this, "undo", !0)
          }),
          redoSelection: Ht(function() {
            kn(this, "redo", !0)
          }),
          setExtending: function(e) {
            this.extend = e
          },
          getExtending: function() {
            return this.extend
          },
          historySize: function() {
            for (var e = this.history, t = 0, n = 0, r = 0; r < e.done.length; r++) e.done[r].ranges || ++t;
            for (var r = 0; r < e.undone.length; r++) e.undone[r].ranges || ++n;
            return {
              undo: t,
              redo: n
            }
          },
          clearHistory: function() {
            this.history = new ni(this.history.maxGeneration)
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
              var t =