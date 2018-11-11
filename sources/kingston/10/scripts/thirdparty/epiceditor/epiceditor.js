/*! RESOURCE: /scripts/thirdparty/epiceditor/epiceditor.js */
(function(window, undefined) {
  function _applyAttrs(context, attrs) {
    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        context[attr] = attrs[attr];
      }
    }
  }

  function _applyStyles(context, attrs) {
    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        context.style[attr] = attrs[attr];
      }
    }
  }

  function _getStyle(el, styleProp) {
    var x = el,
      y = null;
    if (window.getComputedStyle) {
      y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
    } else if (x.currentStyle) {
      y = x.currentStyle[styleProp];
    }
    return y;
  }

  function _saveStyleState(el, type, styles) {
    var returnState = {},
      style;
    if (type === 'save') {
      for (style in styles) {
        if (styles.hasOwnProperty(style)) {
          returnState[style] = _getStyle(el, style);
        }
      }
      _applyStyles(el, styles);
    } else if (type === 'apply') {
      _applyStyles(el, styles);
    }
    return returnState;
  }

  function _outerWidth(el) {
    var b = parseInt(_getStyle(el, 'border-left-width'), 10) + parseInt(_getStyle(el, 'border-right-width'), 10),
      p = parseInt(_getStyle(el, 'padding-left'), 10) + parseInt(_getStyle(el, 'padding-right'), 10),
      w = el.offsetWidth,
      t;
    if (isNaN(b)) {
      b = 0;
    }
    t = b + p + w;
    return t;
  }

  function _outerHeight(el) {
    var b = parseInt(_getStyle(el, 'border-top-width'), 10) + parseInt(_getStyle(el, 'border-bottom-width'), 10),
      p = parseInt(_getStyle(el, 'padding-top'), 10) + parseInt(_getStyle(el, 'padding-bottom'), 10),
      w = parseInt(_getStyle(el, 'height'), 10),
      t;
    if (isNaN(b)) {
      b = 0;
    }
    t = b + p + w;
    return t;
  }

  function _insertCSSLink(path, context, id) {
    id = id || '';
    var headID = context.getElementsByTagName("head")[0],
      cssNode = context.createElement('link');
    _applyAttrs(cssNode, {
      type: 'text/css',
      id: id,
      rel: 'stylesheet',
      href: path,
      name: path,
      media: 'screen'
    });
    headID.appendChild(cssNode);
  }

  function _replaceClass(e, o, n) {
    e.className = e.className.replace(o, n);
  }

  function _getIframeInnards(el) {
    return el.contentDocument || el.contentWindow.document;
  }

  function _getText(el) {
    var theText;
    if (typeof document.body.innerText == 'string') {
      theText = el.innerText;
    } else {
      theText = el.innerHTML.replace(/<br>/gi, "\n");
      theText = theText.replace(/<(?:.|\n)*?>/gm, '');
      theText = theText.replace(/&lt;/gi, '<');
      theText = theText.replace(/&gt;/gi, '>');
    }
    return theText;
  }

  function _setText(el, content) {
    content = content.replace(/</g, '&lt;');
    content = content.replace(/>/g, '&gt;');
    content = content.replace(/\n/g, '<br>');
    content = content.replace(/<br>\s/g, '<br>&nbsp;')
    content = content.replace(/\s\s\s/g, '&nbsp; &nbsp;')
    content = content.replace(/\s\s/g, '&nbsp; ')
    content = content.replace(/^ /, '&nbsp;')
    el.innerHTML = content;
    return true;
  }

  function _sanitizeRawContent(content) {
    return content.replace(/\u00a0/g, ' ').replace(/&nbsp;/g, ' ');
  }

  function _isIE() {
    var rv = -1,
      ua = navigator.userAgent,
      re;
    if (navigator.appName == 'Microsoft Internet Explorer') {
      re = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
      if (re.exec(ua) != null) {
        rv = parseFloat(RegExp.$1, 10);
      }
    }
    return rv;
  }

  function _isSafari() {
    var n = window.navigator;
    return n.userAgent.indexOf('Safari') > -1 && n.userAgent.indexOf('Chrome') == -1;
  }

  function _isFirefox() {
    var n = window.navigator;
    return n.userAgent.indexOf('Firefox') > -1 && n.userAgent.indexOf('Seamonkey') == -1;
  }

  function _isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  function _mergeObjs() {
    var target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false,
      options, name, src, copy
    if (typeof target === "boolean") {
      deep = target;
      target = arguments[1] || {};
      i = 2;
    }
    if (typeof target !== "object" && !_isFunction(target)) {
      target = {};
    }
    if (length === i) {
      target = this;
      --i;
    }
    for (; i < length; i++) {
      if ((options = arguments[i]) != null) {
        for (name in options) {
          if (options.hasOwnProperty(name)) {
            src = target[name];
            copy = options[name];
            if (target === copy) {
              continue;
            }
            if (deep && copy && typeof copy === "object" && !copy.nodeType) {
              target[name] = _mergeObjs(deep,
                src || (copy.length != null ? [] : {}), copy);
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }
    }
    return target;
  }

  function EpicEditor(options) {
    var self = this,
      opts = options || {},
      _defaultFileSchema, _defaultFile, defaults = {
        container: 'epiceditor',
        basePath: 'epiceditor',
        textarea: undefined,
        clientSideStorage: true,
        localStorageName: 'epiceditor',
        useNativeFullscreen: true,
        file: {
          name: null,
          defaultContent: '',
          autoSave: 100
        },
        theme: {
          base: '/themes/base/epiceditor.css',
          preview: '/themes/preview/github.css',
          editor: '/themes/editor/epic-dark.css'
        },
        focusOnLoad: false,
        shortcut: {
          modifier: 18,
          fullscreen: 70,
          preview: 80
        },
        string: {
          togglePreview: 'Toggle Preview Mode',
          toggleEdit: 'Toggle Edit Mode',
          toggleFullscreen: 'Enter Fullscreen'
        },
        parser: typeof marked == 'function' ? marked : null,
        autogrow: false,
        button: {
          fullscreen: true,
          preview: true,
          bar: "auto"
        }
      },
      defaultStorage, autogrowDefaults = {
        minHeight: 80,
        maxHeight: false,
        scroll: true
      };
    self.settings = _mergeObjs(true, defaults, opts);
    var buttons = self.settings.button;
    self._fullscreenEnabled = typeof(buttons) === 'object' ? typeof buttons.fullscreen === 'undefined' || buttons.fullscreen : buttons === true;
    self._editEnabled = typeof(buttons) === 'object' ? typeof buttons.edit === 'undefined' || buttons.edit : buttons === true;
    self._previewEnabled = typeof(buttons) === 'object' ? typeof buttons.preview === 'undefined' || buttons.preview : buttons === true;
    if (!(typeof self.settings.parser == 'function' && typeof self.settings.parser('TEST') == 'string')) {
      self.settings.parser = function(str) {
        return str;
      }
    }
    if (self.settings.autogrow) {
      if (self.settings.autogrow === true) {
        self.settings.autogrow = autogrowDefaults;
      } else {
        self.settings.autogrow = _mergeObjs(true, autogrowDefaults, self.settings.autogrow);
      }
      self._oldHeight = -1;
    }
    if (!self.settings.theme.preview.match(/^https?:\/\//)) {
      self.settings.theme.preview = self.settings.basePath + self.settings.theme.preview;
    }
    if (!self.settings.theme.editor.match(/^https?:\/\//)) {
      self.settings.theme.editor = self.settings.basePath + self.settings.theme.editor;
    }
    if (!self.settings.theme.base.match(/^https?:\/\//)) {
      self.settings.theme.base = self.settings.basePath + self.settings.theme.base;
    }
    if (typeof self.settings.container == 'string') {
      self.element = document.getElementById(self.settings.container);
    } else if (typeof self.settings.container == 'object') {
      self.element = self.settings.container;
    }
    if (!self.settings.file.name) {
      if (typeof self.settings.container == 'string') {
        self.settings.file.name = self.settings.container;
      } else if (typeof self.settings.container == 'object') {
        if (self.element.id) {
          self.settings.file.name = self.element.id;
        } else {
          if (!EpicEditor._data.unnamedEditors) {
            EpicEditor._data.unnamedEditors = [];
          }
          EpicEditor._data.unnamedEditors.push(self);
          self.settings.file.name = '__epiceditor-untitled-' + EpicEditor._data.unnamedEditors.length;
        }
      }
    }
    if (self.settings.button.bar === "show") {
      self.settings.button.bar = true;
    }
    if (self.settings.button.bar === "hide") {
      self.settings.button.bar = false;
    }
    self._instanceId = 'epiceditor-' + Math.round(Math.random() * 100000);
    self._storage = {};
    self._canSave = true;
    self._defaultFileSchema = function() {
      return {
        content: self.settings.file.defaultContent,
        created: new Date(),
        modified: new Date()
      }
    }
    if (localStorage && self.settings.clientSideStorage) {
      this._storage = localStorage;
      if (this._storage[self.settings.localStorageName] && self.getFiles(self.settings.file.name) === undefined) {
        _defaultFile = self._defaultFileSchema();
        _defaultFile.content = self.settings.file.defaultContent;
      }
    }
    if (!this._storage[self.settings.localStorageName]) {
      defaultStorage = {};
      defaultStorage[self.settings.file.name] = self._defaultFileSchema();
      defaultStorage = JSON.stringify(defaultStorage);
      this._storage[self.settings.localStorageName] = defaultStorage;
    }
    self._previewDraftLocation = '__draft-';
    self._storage[self._previewDraftLocation + self.settings.localStorageName] = self._storage[self.settings.localStorageName];
    self._eeState = {
      fullscreen: false,
      preview: false,
      edit: false,
      loaded: false,
      unloaded: false
    }
    if (!self.events) {
      self.events = {};
    }
    return this;
  }
  EpicEditor.prototype.load = function(callback) {
    if (this.is('loaded')) {
      return this;
    }
    var self = this,
      _HtmlTemplates, iframeElement, baseTag, utilBtns, utilBar, utilBarTimer, keypressTimer, mousePos = {
        y: -1,
        x: -1
      },
      _elementStates, _isInEdit, nativeFs = false,
      nativeFsWebkit = false,
      nativeFsMoz = false,
      nativeFsW3C = false,
      fsElement, isMod = false,
      isCtrl = false,
      eventableIframes, i, boundAutogrow;
    self._eeState.startup = true;
    if (self.settings.useNativeFullscreen) {
      nativeFsWebkit = document.body.webkitRequestFullScreen ? true : false;
      nativeFsMoz = document.body.mozRequestFullScreen ? true : false;
      nativeFsW3C = document.body.requestFullscreen ? true : false;
      nativeFs = nativeFsWebkit || nativeFsMoz || nativeFsW3C;
    }
    if (_isSafari()) {
      nativeFs = false;
      nativeFsWebkit = false;
    }
    if (!self.is('edit') && !self.is('preview')) {
      self._eeState.edit = true;
    }
    callback = callback || function() {};
    _HtmlTemplates = {
      chrome: '<div id="epiceditor-wrapper" class="epiceditor-edit-mode">' +
        '<iframe frameborder="0" id="epiceditor-editor-frame"></iframe>' +
        '<iframe frameborder="0" id="epiceditor-previewer-frame"></iframe>' +
        '<div id="epiceditor-utilbar">' +
        (self._previewEnabled ? '<button title="' + this.settings.string.togglePreview + '" class="epiceditor-toggle-btn epiceditor-toggle-preview-btn"></button> ' : '') +
        (self._editEnabled ? '<button title="' + this.settings.string.toggleEdit + '" class="epiceditor-toggle-btn epiceditor-toggle-edit-btn"></button> ' : '') +
        (self._fullscreenEnabled ? '<button title="' + this.settings.string.toggleFullscreen + '" class="epiceditor-fullscreen-btn"></button>' : '') +
        '</div>' +
        '</div>',
      previewer: '<div id="epiceditor-preview"></div>',
      editor: '<!doctype HTML>'
    };
    self.element.innerHTML = '<iframe scrolling="no" frameborder="0" id= "' + self._instanceId + '"></iframe>';
    self.element.style.height = self.element.offsetHeight + 'px';
    iframeElement = document.getElementById(self._instanceId);
    self.iframeElement = iframeElement;
    self.iframe = _getIframeInnards(iframeElement);
    self.iframe.open();
    self.iframe.write(_HtmlTemplates.chrome);
    self.editorIframe = self.iframe.getElementById('epiceditor-editor-frame')
    self.previewerIframe = self.iframe.getElementById('epiceditor-previewer-frame');
    self.editorIframeDocument = _getIframeInnards(self.editorIframe);
    self.editorIframeDocument.open();
    self.editorIframeDocument.write(_HtmlTemplates.editor);
    self.editorIframeDocument.close();
    self.previewerIframeDocument = _getIframeInnards(self.previewerIframe);
    self.previewerIframeDocument.open();
    self.previewerIframeDocument.write(_HtmlTemplates.previewer);
    baseTag = self.previewerIframeDocument.createElement('base');
    baseTag.target = '_blank';
    self.previewerIframeDocument.getElementsByTagName('head')[0].appendChild(baseTag);
    self.previewerIframeDocument.close();
    self.reflow();
    _insertCSSLink(self.settings.theme.base, self.iframe, 'theme');
    _insertCSSLink(self.settings.theme.editor, self.editorIframeDocument, 'theme');
    _insertCSSLink(self.settings.theme.preview, self.previewerIframeDocument, 'theme');
    self.iframe.getElementById('epiceditor-wrapper').style.position = 'relative';
    self.editorIframe.style.position = 'absolute';
    self.previewerIframe.style.position = 'absolute';
    self.editor = self.editorIframeDocument.body;
    self.previewer = self.previewerIframeDocument.getElementById('epiceditor-preview');
    self.editor.contentEditable = true;
    self.iframe.body.style.height = this.element.offsetHeight + 'px';
    self.previewerIframe.style.left = '-999999px';
    this.editorIframeDocument.body.style.wordWrap = 'break-word';
    if (_isIE() > -1) {
      this.previewer.style.height = parseInt(_getStyle(this.previewer, 'height'), 10) + 2;
    }
    this.open(self.settings.file.name);
    if (self.settings.focusOnLoad) {
      self.iframe.addEventListener('readystatechange', function() {
        if (self.iframe.readyState == 'complete') {
          self.focus();
        }
      });
    }
    self.previewerIframeDocument.addEventListener('click', function(e) {
      var el = e.target,
        body = self.previewerIframeDocument.body;
      if (el.nodeName == 'A') {
        if (el.hash && el.hostname == window.location.hostname) {
          e.preventDefault();
          el.target = '_self';
          if (body.querySelector(el.hash)) {
            body.scrollTop = body.querySelector(el.hash).offsetTop;
          }
        }
      }
    });
    utilBtns = self.iframe.getElementById('epiceditor-utilbar');
    _elementStates = {}
    self._goFullscreen = function(el) {
      this._fixScrollbars('auto');
      if (self.is('fullscreen')) {
        self._exitFullscreen(el);
        return;
      }
      if (nativeFs) {
        if (nativeFsWebkit) {
          el.webkitRequestFullScreen();
        } else if (nativeFsMoz) {
          el.mozRequestFullScreen();
        } else if (nativeFsW3C) {
          el.requestFullscreen();
        }
      }
      _isInEdit = self.is('edit');
      self._eeState.fullscreen = true;
      self._eeState.edit = true;
      self._eeState.preview = true;
      var windowInnerWidth = window.innerWidth,
        windowInnerHeight = window.innerHeight,
        windowOuterWidth = window.outerWidth,
        windowOuterHeight = window.outerHeight;
      if (!nativeFs) {
        windowOuterHeight = window.innerHeight;
      }
      _elementStates.editorIframe = _saveStyleState(self.editorIframe, 'save', {
        'width': windowOuterWidth / 2 + 'px',
        'height': windowOuterHeight + 'px',
        'float': 'left',
        'cssFloat': 'left',
        'styleFloat': 'left',
        'display': 'block',
        'position': 'static',
        'left': ''
      });
      _elementStates.previewerIframe = _saveStyleState(self.previewerIframe, 'save', {
        'width': windowOuterWidth / 2 + 'px',
        'height': windowOuterHeight + 'px',
        'float': 'right',
        'cssFloat': 'right',
        'styleFloat': 'right',
        'display': 'block',
        'position': 'static',
        'left': ''
      });
      _elementStates.element = _saveStyleState(self.element, 'save', {
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'width': '100%',
        'z-index': '9999',
        'zIndex': '9999',
        'border': 'none',
        'margin': '0',
        'background': _getStyle(self.editor, 'background-color'),
        'height': windowInnerHeight + 'px'
      });
      _elementStates.iframeElement = _saveStyleState(self.iframeElement, 'save', {
        'width': windowOuterWidth + 'px',
        'height': windowInnerHeight + 'px'
      });
      utilBtns.style.visibility = 'hidden';
      if (!nativeFs) {
        document.body.style.overflow = 'hidden';
      }
      self.preview();
      self.focus();
      self.emit('fullscreenenter');
    };
    self._exitFullscreen = function(el) {
      this._fixScrollbars();
      _saveStyleState(self.element, 'apply', _elementStates.element);
      _saveStyleState(self.iframeElement, 'apply', _elementStates.iframeElement);
      _saveStyleState(self.editorIframe, 'apply', _elementStates.editorIframe);
      _saveStyleState(self.previewerIframe, 'apply', _elementStates.previewerIframe);
      self.element.style.width = self._eeState.reflowWidth ? self._eeState.reflowWidth : '';
      self.element.style.height = self._eeState.reflowHeight ? self._eeState.reflowHeight : '';
      utilBtns.style.visibility = 'visible';
      self._eeState.fullscreen = false;
      if (!nativeFs) {
        document.body.style.overflow = 'auto';
      } else {
        if (nativeFsWebkit) {
          document.webkitCancelFullScreen();
        } else if (nativeFsMoz) {
          document.mozCancelFullScreen();
        } else if (nativeFsW3C) {
          document.exitFullscreen();
        }
      }
      if (_isInEdit) {
        self.edit();
      } else {
        self.preview();
      }
      self.reflow();
      self.emit('fullscreenexit');
    };
    self.editor.addEventListener('keyup', function() {
      if (keypressTimer) {
        window.clearTimeout(keypressTimer);
      }
      keypressTimer = window.setTimeout(function() {
        if (self.is('fullscreen')) {
          self.preview();
        }
      }, 250);
    });
    fsElement = self.iframeElement;
    utilBtns.addEventListener('click', function(e) {
      var targetClass = e.target.className;
      if (targetClass.indexOf('epiceditor-toggle-preview-btn') > -1) {
        self.preview();
      } else if (targetClass.indexOf('epiceditor-toggle-edit-btn') > -1) {
        self.edit();
      } else if (targetClass.indexOf('epiceditor-fullscreen-btn') > -1) {
        self._goFullscreen(fsElement);
      }
    });
    if (nativeFsWebkit) {
      document.addEventListener('webkitfullscreenchange', function() {
        if (!document.webkitIsFullScreen && self._eeState.fullscreen) {
          self._exitFullscreen(fsElement);
        }
      }, false);
    } else if (nativeFsMoz) {
      document.addEventListener('mozfullscreenchange', function() {
        if (!document.mozFullScreen && self._eeState.fullscreen) {
          self._exitFullscreen(fsElement);
        }
      }, false);
    } else if (nativeFsW3C) {
      document.addEventListener('fullscreenchange', function() {
        if (document.fullscreenElement == null && self._eeState.fullscreen) {
          self._exitFullscreen(fsElement);
        }
      }, false);
    }
    utilBar = self.iframe.getElementById('epiceditor-utilbar');
    if (self.settings.button.bar !== true) {
      utilBar.style.display = 'none';
    }
    utilBar.addEventListener('mouseover', function() {
      if (utilBarTimer) {
        clearTimeout(utilBarTimer);
      }
    });

    function utilBarHandler(e) {
      if (self.settings.button.bar !== "auto") {
        return;
      }
      if (Math.abs(mousePos.y - e.pageY) >= 5 || Math.abs(mousePos.x - e.pageX) >= 5) {
        utilBar.style.display = 'block';
        if (utilBarTimer) {
          clearTimeout(utilBarTimer);
        }
        utilBarTimer = window.setTimeout(function() {
          utilBar.style.display = 'none';
        }, 1000);
      }
      mousePos = {
        y: e.pageY,
        x: e.pageX
      };
    }

    function shortcutHandler(e) {
      if (e.keyCode == self.settings.shortcut.modifier) {
        isMod = true
      }
      if (e.keyCode == 17) {
        isCtrl = true
      }
      if (isMod === true && e.keyCode == self.settings.shortcut.preview && !self.is('fullscreen')) {
        e.preventDefault();
        if (self.is('edit') && self._previewEnabled) {
          self.preview();
        } else if (self._editEnabled) {
          self.edit();
        }
      }
      if (isMod === true && e.keyCode == self.settings.shortcut.fullscreen && self._fullscreenEnabled) {
        e.preventDefault();
        self._goFullscreen(fsElement);
      }
      if (isMod === true && e.keyCode !== self.settings.shortcut.modifier) {
        isMod = false;
      }
      if (e.keyCode == 27 && self.is('fullscreen')) {
        self._exitFullscreen(fsElement);
      }
      if (isCtrl === true && e.keyCode == 83) {
        self.save();
        e.preventDefault();
        isCtrl = false;
      }
      if (e.metaKey && e.keyCode == 83) {
        self.save();
        e.preventDefault();
      }
    }

    function shortcutUpHandler(e) {
      if (e.keyCode == self.settings.shortcut.modifier) {
        isMod = false
      }
      if (e.keyCode == 17) {
        isCtrl = false
      }
    }

    function pasteHandler(e) {
      var content;
      if (e.clipboardData) {
        e.preventDefault();
        content = e.clipboardData.getData("text/plain");
        self.editorIframeDocument.execCommand("insertText", false, content);
      } else if (window.clipboardData) {
        e.preventDefault();
        content = window.clipboardData.getData("Text");
        content = content.replace(/</g, '&lt;');
        content = content.replace(/>/g, '&gt;');
        content = content.replace(/\n/g, '<br>');
        content = content.replace(/\r/g, '');
        content = content.replace(/<br>\s/g, '<br>&nbsp;')
        content = content.replace(/\s\s\s/g, '&nbsp; &nbsp;')
        content = content.replace(/\s\s/g, '&nbsp; ')
        self.editorIframeDocument.selection.createRange().pasteHTML(content);
      }
    }
    eventableIframes = [self.previewerIframeDocument, self.editorIframeDocument];
    for (i = 0; i < eventableIframes.length; i++) {
      eventableIframes[i].addEventListener('mousemove', function(e) {
        utilBarHandler(e);
      });
      eventableIframes[i].addEventListener('scroll', function(e) {
        utilBarHandler(e);
      });
      eventableIframes[i].addEventListener('keyup', function(e) {
        shortcutUpHandler(e);
      });
      eventableIframes[i].addEventListener('keydown', function(e) {
        shortcutHandler(e);
      });
      eventableIframes[i].addEventListener('paste', function(e) {
        pasteHandler(e);
      });
    }
    if (self.settings.file.autoSave) {
      self._saveIntervalTimer = window.setInterval(function() {
        if (!self._canSave) {
          return;
        }
        self.save(false, true);
      }, self.settings.file.autoSave);
    }
    if (self.settings.textarea) {
      self._setupTextareaSync();
    }
    window.addEventListener('resize', function() {
      if (self.is('fullscreen')) {
        _applyStyles(self.iframeElement, {
          'width': window.outerWidth + 'px',
          'height': window.innerHeight + 'px'
        });
        _applyStyles(self.element, {
          'height': window.innerHeight + 'px'
        });
        _applyStyles(self.previewerIframe, {
          'width': window.outerWidth / 2 + 'px',
          'height': window.innerHeight + 'px'
        });
        _applyStyles(self.editorIframe, {
          'width': window.outerWidth / 2 + 'px',
          'height': window.innerHeight + 'px'
        });
      } else if (!self.is('fullscreen')) {
        self.reflow();
      }
    });
    self._eeState.loaded = true;
    self._eeState.unloaded = false;
    if (self.is('preview')) {
      self.preview();
    } else {
      self.edit();
    }
    self.iframe.close();
    self._eeState.startup = false;
    if (self.settings.autogrow) {
      self._fixScrollbars();
      boundAutogrow = function() {
        setTimeout(function() {
          self._autogrow();
        }, 1);
      };
      ['keydown', 'keyup', 'paste', 'cut'].forEach(function(ev) {
        self.getElement('editor').addEventListener(ev, boundAutogrow);
      });
      self.on('__update', boundAutogrow);
      self.on('edit', function() {
        setTimeout(boundAutogrow, 50)
      });
      self.on('preview', function() {
        setTimeout(boundAutogrow, 50)
      });
      setTimeout(boundAutogrow, 50);
      boundAutogrow();
    }
    callback.call(this);
    this.emit('load');
    return this;
  }
  EpicEditor.prototype._setupTextareaSync = function() {
    var self = this,
      textareaFileName = self.settings.file.name,
      _syncTextarea;
    self._textareaSaveTimer = window.setInterval(function() {
      if (!self._canSave) {
        return;
      }
      self.save(true);
    }, 100);
    _syncTextarea = function() {
      self._textareaElement.value = self.exportFile(textareaFileName, 'text', true) || self.settings.file.defaultContent;
    }
    if (typeof self.settings.textarea == 'string') {
      self._textareaElement = document.getElementById(self.settings.textarea);
    } else if (typeof self.settings.textarea == 'object') {
      self._textareaElement = self.settings.textarea;
    }
    if (self._textareaElement.value !== '') {
      self.importFile(textareaFileName, self._textareaElement.value);
      self.save(true);
    }
    _syncTextarea();
    self.on('__update', _syncTextarea);
  }
  EpicEditor.prototype._focusExceptOnLoad = function() {
    var self = this;
    if ((self._eeState.startup && self.settings.focusOnLoad) || !self._eeState.startup) {
      self.focus();
    }
  }
  EpicEditor.prototype.unload = function(callback) {
    if (this.is('unloaded')) {
      throw new Error('Editor isn\'t loaded');
    }
    var self = this,
      editor = window.parent.document.getElementById(self._instanceId);
    editor.parentNode.removeChild(editor);
    self._eeState.loaded = false;
    self._eeState.unloaded = true;
    callback = callback || function() {};
    if (self.settings.textarea) {
      self._textareaElement.value = "";
      self.removeListener('__update');
    }
    if (self._saveIntervalTimer) {
      window.clearInterval(self._saveIntervalTimer);
    }
    if (self._textareaSaveTimer) {
      window.clearInterval(self._textareaSaveTimer);
    }
    callback.call(this);
    self.emit('unload');
    return self;
  }
  EpicEditor.prototype.reflow = function(kind, callback) {
    var self = this,
      widthDiff = _outerWidth(self.element) - self.element.offsetWidth,
      heightDiff = _outerHeight(self.element) - self.element.offsetHeight,
      elements = [self.iframeElement, self.editorIframe, self.previewerIframe],
      eventData = {},
      newWidth, newHeight;
    if (typeof kind == 'function') {
      callback = kind;
      kind = null;
    }
    if (!callback) {
      callback = function() {};
    }
    for (var x = 0; x < elements.length; x++) {
      if (!kind || kind == 'width') {
        newWidth = self.element.offsetWidth - widthDiff + 'px';
        elements[x].style.width = newWidth;
        self._eeState.reflowWidth = newWidth;
        eventData.width = newWidth;
      }
      if (!kind || kind == 'height') {
        newHeight = self.element.offsetHeight - heightDiff + 'px';
        elements[x].style.height = newHeight;
        self._eeState.reflowHeight = newHeight
        eventData.height = newHeight;
      }
    }
    self.emit('reflow', eventData);
    callback.call(this, eventData);
    return self;
  }
  EpicEditor.prototype.preview = function() {
    var self = this,
      x, theme = self.settings.theme.preview,
      anchors;
    _replaceClass(self.getElement('wrapper'), 'epiceditor-edit-mode', 'epiceditor-preview-mode');
    if (!self.previewerIframeDocument.getElementById('theme')) {
      _insertCSSLink(theme, self.previewerIframeDocument, 'theme');
    } else if (self.previewerIframeDocument.getElementById('theme').name !== theme) {
      self.previewerIframeDocument.getElementById('theme').href = theme;
    }
    self.save(true);
    self.previewer.innerHTML = self.exportFile(null, 'html', true);
    if (!self.is('fullscreen')) {
      self.editorIframe.style.left = '-999999px';
      self.previewerIframe.style.left = '';
      self._eeState.preview = true;
      self._eeState.edit = false;
      self._focusExceptOnLoad();
    }
    self.emit('preview');
    return self;
  }
  EpicEditor.prototype.focus = function(pageload) {
    var self = this,
      isPreview = self.is('preview'),
      focusElement = isPreview ? self.previewerIframeDocument.body :
      self.editorIframeDocument.body;
    if (_isFirefox() && isPreview) {
      focusElement = self.previewerIframe;
    }
    focusElement.focus();
    return this;
  }
  EpicEditor.prototype.enterFullscreen = function() {
    if (this.is('fullscreen')) {
      return this;
    }
    this._goFullscreen(this.iframeElement);
    return this;
  }
  EpicEditor.prototype.exitFullscreen = function() {
    if (!this.is('fullscreen')) {
      return this;
    }
    this._exitFullscreen(this.iframeElement);
    return this;
  }
  EpicEditor.prototype.edit = function() {
    var self = this;
    _replaceClass(self.getElement('wrapper'), 'epiceditor-preview-mode', 'epiceditor-edit-mode');
    self._eeState.preview = false;
    self._eeState.edit = true;
    self.editorIframe.style.left = '';
    self.previewerIframe.style.left = '-999999px';
    self._focusExceptOnLoad();
    self.emit('edit');
    return this;
  }
  EpicEditor.prototype.getElement = function(name) {
    var available = {
      "container": this.element,
      "wrapper": this.iframe.getElementById('epiceditor-wrapper'),
      "wrapperIframe": this.iframeElement,
      "editor": this.editorIframeDocument,
      "editorIframe": this.editorIframe,
      "previewer": this.previewerIframeDocument,
      "previewerIframe": this.previewerIframe
    }
    if (!available[name] || this.is('unloaded')) {
      return null;
    } else {
      return available[name];
    }
  }
  EpicEditor.prototype.is = function(what) {
    var self = this;
    switch (what) {
      case 'loaded':
        return self._eeState.loaded;
      case 'unloaded':
        return self._eeState.unloaded
      case 'preview':
        return self._eeState.preview
      case 'edit':
        return self._eeState.edit;
      case 'fullscreen':
        return self._eeState.fullscreen;
      default:
        return false;
    }
  }
  EpicEditor.prototype.open = function(name) {
    var self = this,
      defaultContent = self.settings.file.defaultContent,
      fileObj;
    name = name || self.settings.file.name;
    self.settings.file.name = name;
    if (this._storage[self.settings.localStorageName]) {
      fileObj = self.exportFile(name);
      if (fileObj !== undefined) {
        _setText(self.editor, fileObj);
        self.emit('read');
      } else {
        _setText(self.editor, defaultContent);
        self.save();
        self.emit('create');
      }
      self.previewer.innerHTML = self.exportFile(null, 'html');
      self.emit('open');
    }
    return this;
  }
  EpicEditor.prototype.save = function(_isPreviewDraft, _isAuto) {
    var self = this,
      storage, isUpdate = false,
      file = self.settings.file.name,
      previewDraftName = '',
      data = this._storage[previewDraftName + self.settings.localStorageName],
      content = _getText(this.editor);
    if (_isPreviewDraft) {
      previewDraftName = self._previewDraftLocation;
    }
    this._canSave = true;
    if (data) {
      storage = JSON.parse(this._storage[previewDraftName + self.settings.localStorageName]);
      if (storage[file] === undefined) {
        storage[file] = self._defaultFileSchema();
      } else if (content !== storage[file].content) {
        storage[file].modified = new Date();
        isUpdate = true;
      } else if (_isAuto) {
        return;
      }
      storage[file].content = content;
      this._storage[previewDraftName + self.settings.localStorageName] = JSON.stringify(storage);
      if (isUpdate) {
        self.emit('update');
        self.emit('__update');
      }
      if (_isAuto) {
        this.emit('autosave');
      } else if (!_isPreviewDraft) {
        this.emit('save');
      }
    }
    return this;
  }
  EpicEditor.prototype.remove = function(name) {
    var self = this,
      s;
    name = name || self.settings.file.name;
    if (name == self.settings.file.name) {
      self._canSave = false;
    }
    s = JSON.parse(this._storage[self.settings.localStorageName]);
    delete s[name];
    this._storage[self.settings.localStorageName] = JSON.stringify(s);
    this.emit('remove');
    return this;
  };
  EpicEditor.prototype.rename = function(oldName, newName) {
    var self = this,
      s = JSON.parse(this._storage[self.settings.localStorageName]);
    s[newName] = s[oldName];
    delete s[oldName];
    this._storage[self.settings.localStorageName] = JSON.stringify(s);
    self.open(newName);
    return this;
  };
  EpicEditor.prototype.importFile = function(name, content, kind, meta) {
    var self = this,
      isNew = false;
    name = name || self.settings.file.name;
    content = content || '';
    kind = kind || 'md';
    meta = meta || {};
    if (JSON.parse(this._storage[self.settings.localStorageName])[name] === undefined) {
      isNew = true;
    }
    self.settings.file.name = name;
    _setText(self.editor, content);
    if (isNew) {
      self.emit('create');
    }
    self.save();
    if (self.is('fullscreen')) {
      self.preview();
    }
    if (self.settings.autogrow) {
      setTimeout(function() {
        self._autogrow();
      }, 50);
    }
    return this;
  };
  EpicEditor.prototype._getFileStore = function(name, _isPreviewDraft) {
    var previewDraftName = '',
      store;
    if (_isPreviewDraft) {
      previewDraftName = this._previewDraftLocation;
    }
    store = JSON.parse(this._storage[previewDraftName + this.settings.localStorageName]);
    if (name) {
      return store[name];
    } else {
      return store;
    }
  }
  EpicEditor.prototype.exportFile = function(name, kind, _isPreviewDraft) {
    var self = this,
      file, content;
    name = name || self.settings.file.name;
    kind = kind || 'text';
    file = self._getFileStore(name, _isPreviewDraft);
    if (file === undefined) {
      return;
    }
    content = file.content;
    switch (kind) {
      case 'html':
        content = _sanitizeRawContent(content);
        return self.settings.parser(content);
      case 'text':
        return _sanitizeRawContent(content);
      case 'json':
        file.content = _sanitizeRawContent(file.content);
        return JSON.stringify(file);
      case 'raw':
        return content;
      default:
        return content;
    }
  }
  EpicEditor.prototype.getFiles = function(name, excludeContent) {
    var file, data = this._getFileStore(name);
    if (name) {
      if (data !== undefined) {
        if (excludeContent) {
          delete data.content;
        } else {
          data.content = _sanitizeRawContent(data.content);
        }
      }
      return data;
    } else {
      for (file in data) {
        if (data.hasOwnProperty(file)) {
          if (excludeContent) {
            delete data[file].content;
          } else {
            data[file].content = _sanitizeRawContent(data[file].content);
          }
        }
      }
      return data;
    }
  }
  EpicEditor.prototype.on = function(ev, handler) {
    var self = this;
    if (!this.events[ev]) {
      this.events[ev] = [];
    }
    this.events[ev].push(handler);
    return self;
  };
  EpicEditor.prototype.emit = function(ev, data) {
    var self = this,
      x;
    data = data || self.getFiles(self.settings.file.name);
    if (!this.events[ev]) {
      return;
    }

    function invokeHandler(handler) {
      handler.call(self, data);
    }
    for (x = 0; x < self.events[ev].length; x++) {
      invokeHandler(self.events[ev][x]);
    }
    return self;
  };
  EpicEditor.prototype.removeListener = function(ev, handler) {
    var self = this;
    if (!handler) {
      this.events[ev] = [];
      return self;
    }
    if (!this.events[ev]) {
      return self;
    }
    this.events[ev].splice(this.events[ev].indexOf(handler), 1);
    return self;
  }
  EpicEditor.prototype._autogrow = function() {
    var editorHeight, newHeight, minHeight, maxHeight, el, style, maxedOut = false;
    if (!this.is('fullscreen')) {
      if (this.is('edit')) {
        el = this.getElement('editor').documentElement;
      } else {
        el = this.getElement('previewer').documentElement;
      }
      editorHeight = _outerHeight(el);
      newHeight = editorHeight;
      minHeight = this.settings.autogrow.minHeight;
      if (typeof minHeight === 'function') {
        minHeight = minHeight(this);
      }
      if (minHeight && newHeight < minHeight) {
        newHeight = minHeight;
      }
      maxHeight = this.settings.autogrow.maxHeight;
      if (typeof maxHeight === 'function') {
        maxHeight = maxHeight(this);
      }
      if (maxHeight && newHeight > maxHeight) {
        newHeight = maxHeight;
        maxedOut = true;
      }
      if (maxedOut) {
        this._fixScrollbars('auto');
      } else {
        this._fixScrollbars('hidden');
      }
      if (newHeight != this.oldHeight) {
        this.getElement('container').style.height = newHeight + 'px';
        this.reflow();
        if (this.settings.autogrow.scroll) {
          window.scrollBy(0, newHeight - this.oldHeight);
        }
        this.oldHeight = newHeight;
      }
    }
  }
  EpicEditor.prototype._fixScrollbars = function(forceSetting) {
    var setting;
    if (this.settings.autogrow) {
      setting = 'hidden';
    } else {
      setting = 'auto';
    }
    setting = forceSetting || setting;
    this.getElement('editor').documentElement.style.overflow = setting;
    this.getElement('previewer').documentElement.style.overflow = setting;
  }
  EpicEditor.version = '0.2.2';
  EpicEditor._data = {};
  window.EpicEditor = EpicEditor;
})(window);;
(function() {
  var block = {
    newline: /^\n+/,
    code: /^( {4}[^\n]+\n*)+/,
    fences: noop,
    hr: /^( *[-*_]){3,} *(?:\n+|$)/,
    heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    nptable: noop,
    lheading: /^([^\n]+)\n *(=|-){3,} *\n*/,
    blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
    list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
    html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
    def: /^ *\[([^\]]+)\]: *([^\s]+)(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
    table: noop,
    paragraph: /^([^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+\n*/,
    text: /^[^\n]+/
  };
  block.bullet = /(?:[*+-]|\d+\.)/;
  block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
  block.item = replace(block.item, 'gm')
    (/bull/g, block.bullet)
    ();
  block.list = replace(block.list)
    (/bull/g, block.bullet)
    ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
    ();
  block._tag = '(?!(?:' +
    'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code' +
    '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo' +
    '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';
  block.html = replace(block.html)
    ('comment', /<!--[\s\S]*?-->/)
    ('closed', /<(tag)[\s\S]+?<\/\1>/)
    ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
    (/tag/g, block._tag)
    ();
  block.paragraph = replace(block.paragraph)
    ('hr', block.hr)
    ('heading', block.heading)
    ('lheading', block.lheading)
    ('blockquote', block.blockquote)
    ('tag', '<' + block._tag)
    ('def', block.def)
    ();
  block.normal = merge({}, block);
  block.gfm = merge({}, block.normal, {
    fences: /^ *(`{3,}|~{3,}) *(\w+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
    paragraph: /^/
  });
  block.gfm.paragraph = replace(block.paragraph)
    ('(?!', '(?!' + block.gfm.fences.source.replace('\\1', '\\2') + '|')
    ();
  block.tables = merge({}, block.gfm, {
    nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
  });

  function Lexer(options) {
    this.tokens = [];
    this.tokens.links = {};
    this.options = options || marked.defaults;
    this.rules = block.normal;
    if (this.options.gfm) {
      if (this.options.tables) {
        this.rules = block.tables;
      } else {
        this.rules = block.gfm;
      }
    }
  }
  Lexer.rules = block;
  Lexer.lex = function(src, options) {
    var lexer = new Lexer(options);
    return lexer.lex(src);
  };
  Lexer.prototype.lex = function(src) {
    src = src
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/\u00a0/g, ' ')
      .replace(/\u2424/g, '\n');
    return this.token(src, true);
  };
  Lexer.prototype.token = function(src, top) {
    var src = src.replace(/^ +$/gm, ''),
      next, loose, cap, item, space, i, l;
    while (src) {
      if (cap = this.rules.newline.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[0].length > 1) {
          this.tokens.push({
            type: 'space'
          });
        }
      }
      if (cap = this.rules.code.exec(src)) {
        src = src.substring(cap[0].length);
        cap = cap[0].replace(/^ {4}/gm, '');
        this.tokens.push({
          type: 'code',
          text: !this.options.pedantic ?
            cap.replace(/\n+$/, '') :
            cap
        });
        continue;
      }
      if (cap = this.rules.fences.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'code',
          lang: cap[2],
          text: cap[3]
        });
        continue;
      }
      if (cap = this.rules.heading.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[1].length,
          text: cap[2]
        });
        continue;
      }
      if (top && (cap = this.rules.nptable.exec(src))) {
        src = src.substring(cap[0].length);
        item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3].replace(/\n$/, '').split('\n')
        };
        for (i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = 'right';
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = 'center';
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }
        for (i = 0; i < item.cells.length; i++) {
          item.cells[i] = item.cells[i].split(/ *\| */);
        }
        this.tokens.push(item);
        continue;
      }
      if (cap = this.rules.lheading.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[2] === '=' ? 1 : 2,
          text: cap[1]
        });
        continue;
      }
      if (cap = this.rules.hr.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'hr'
        });
        continue;
      }
      if (cap = this.rules.blockquote.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'blockquote_start'
        });
        cap = cap[0].replace(/^ *> ?/gm, '');
        this.token(cap, top);
        this.tokens.push({
          type: 'blockquote_end'
        });
        continue;
      }
      if (cap = this.rules.list.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'list_start',
          ordered: isFinite(cap[2])
        });
        cap = cap[0].match(this.rules.item);
        next = false;
        l = cap.length;
        i = 0;
        for (; i < l; i++) {
          item = cap[i];
          space = item.length;
          item = item.replace(/^ *([*+-]|\d+\.) +/, '');
          if (~item.indexOf('\n ')) {
            space -= item.length;
            item = !this.options.pedantic ?
              item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') :
              item.replace(/^ {1,4}/gm, '');
          }
          loose = next || /\n\n(?!\s*$)/.test(item);
          if (i !== l - 1) {
            next = item[item.length - 1] === '\n';
            if (!loose) loose = next;
          }
          this.tokens.push({
            type: loose ?
              'loose_item_start' :
              'list_item_start'
          });
          this.token(item, false);
          this.tokens.push({
            type: 'list_item_end'
          });
        }
        this.tokens.push({
          type: 'list_end'
        });
        continue;
      }
      if (cap = this.rules.html.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: this.options.sanitize ?
            'paragraph' :
            'html',
          pre: cap[1] === 'pre',
          text: cap[0]
        });
        continue;
      }
      if (top && (cap = this.rules.def.exec(src))) {
        src = src.substring(cap[0].length);
        this.tokens.links[cap[1].toLowerCase()] = {
          href: cap[2],
          title: cap[3]
        };
        continue;
      }
      if (top && (cap = this.rules.table.exec(src))) {
        src = src.substring(cap[0].length);
        item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
        };
        for (i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = 'right';
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = 'center';
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }
        for (i = 0; i < item.cells.length; i++) {
          item.cells[i] = item.cells[i]
            .replace(/^ *\| *| *\| *$/g, '')
            .split(/ *\| */);
        }
        this.tokens.push(item);
        continue;
      }
      if (top && (cap = this.rules.paragraph.exec(src))) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'paragraph',
          text: cap[0]
        });
        continue;
      }
      if (cap = this.rules.text.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'text',
          text: cap[0]
        });
        continue;
      }
      if (src) {
        throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
      }
    }
    return this.tokens;
  };
  var inline = {
    escape: /^\\([\\`*{}\[\]()#+\-.!_>|])/,
    autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
    url: noop,
    tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
    link: /^!?\[(inside)\]\(href\)/,
    reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
    nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
    strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
    em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    code: /^(`+)([\s\S]*?[^`])\1(?!`)/,
    br: /^ {2,}\n(?!\s*$)/,
    del: noop,
    text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
  };
  inline._inside = /(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/;
  inline._href = /\s*<?([^\s]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;
  inline.link = replace(inline.link)
    ('inside', inline._inside)
    ('href', inline._href)
    ();
  inline.reflink = replace(inline.reflink)
    ('inside', inline._inside)
    ();
  inline.normal = merge({}, inline);
  inline.pedantic = merge({}, inline.normal, {
    strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
  });
  inline.gfm = merge({}, inline.normal, {
    escape: replace(inline.escape)('])', '~])')(),
    url: /^(https?:\/\/[^\s]+[^.,:;"')\]\s])/,
    del: /^~{2,}([\s\S]+?)~{2,}/,
    text: replace(inline.text)
      (']|', '~]|')
      ('|', '|https?://|')
      ()
  });
  inline.breaks = merge({}, inline.gfm, {
    br: replace(inline.br)('{2,}', '*')(),
    text: replace(inline.gfm.text)('{2,}', '*')()
  });

  function InlineLexer(links, options) {
    this.options = options || marked.defaults;
    this.links = links;
    this.rules = inline.normal;
    if (!this.links) {
      throw new
      Error('Tokens array requires a `links` property.');
    }
    if (this.options.gfm) {
      if (this.options.breaks) {
        this.rules = inline.breaks;
      } else {
        this.rules = inline.gfm;
      }
    } else if (this.options.pedantic) {
      this.rules = inline.pedantic;
    }
  }
  InlineLexer.rules = inline;
  InlineLexer.output = function(src, links, opt) {
    var inline = new InlineLexer(links, opt);
    return inline.output(src);
  };
  InlineLexer.prototype.output = function(src) {
    var out = '',
      link, text, href, cap;
    while (src) {
      if (cap = this.rules.escape.exec(src)) {
        src = src.substring(cap[0].length);
        out += cap[1];
        continue;
      }
      if (cap = this.rules.autolink.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[2] === '@') {
          text = cap[1][6] === ':' ?
            this.mangle(cap[1].substring(7)) :
            this.mangle(cap[1]);
          href = this.mangle('mailto:') + text;
        } else {
          text = escape(cap[1]);
          href = text;
        }
        out += '<a href="' +
          href +
          '">' +
          text +
          '</a>';
        continue;
      }
      if (cap = this.rules.url.exec(src)) {
        src = src.substring(cap[0].length);
        text = escape(cap[1]);
        href = text;
        out += '<a href="' +
          href +
          '">' +
          text +
          '</a>';
        continue;
      }
      if (cap = this.rules.tag.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.options.sanitize ?
          escape(cap[0]) :
          cap[0];
        continue;
      }
      if (cap = this.rules.link.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.outputLink(cap, {
          href: cap[2],
          title: cap[3]
        });
        continue;
      }
      if ((cap = this.rules.reflink.exec(src)) ||
        (cap = this.rules.nolink.exec(src))) {
        src = src.substring(cap[0].length);
        link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
        link = this.links[link.toLowerCase()];
        if (!link || !link.href) {
          out += cap[0][0];
          src = cap[0].substring(1) + src;
          continue;
        }
        out += this.outputLink(cap, link);
        continue;
      }
      if (cap = this.rules.strong.exec(src)) {
        src = src.substring(cap[0].length);
        out += '<strong>' +
          this.output(cap[2] || cap[1]) +
          '</strong>';
        continue;
      }
      if (cap = this.rules.em.exec(src)) {
        src = src.substring(cap[0].length);
        out += '<em>' +
          this.output(cap[2] || cap[1]) +
          '</em>';
        continue;
      }
      if (cap = this.rules.code.exec(src)) {
        src = src.substring(cap[0].length);
        out += '<code>' +
          escape(cap[2], true) +
          '</code>';
        continue;
      }
      if (cap = this.rules.br.exec(src)) {
        src = src.substring(cap[0].length);
        out += '<br>';
        continue;
      }
      if (cap = this.rules.del.exec(src)) {
        src = src.substring(cap[0].length);
        out += '<del>' +
          this.output(cap[1]) +
          '</del>';
        continue;
      }
      if (cap = this.rules.text.exec(src)) {
        src = src.substring(cap[0].length);
        out += escape(cap[0]);
        continue;
      }
      if (src) {
        throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
      }
    }
    return out;
  };
  InlineLexer.prototype.outputLink = function(cap, link) {
    if (cap[0][0] !== '!') {
      return '<a href="' +
        escape(link.href) +
        '"' +
        (link.title ?
          ' title="' +
          escape(link.title) +
          '"' :
          '') +
        '>' +
        this.output(cap[1]) +
        '</a>';
    } else {
      return '<img src="' +
        escape(link.href) +
        '" alt="' +
        escape(cap[1]) +
        '"' +
        (link.title ?
          ' title="' +
          escape(link.title) +
          '"' :
          '') +
        '>';
    }
  };
  InlineLexer.prototype.mangle = function(text) {
    var out = '',
      l = text.length,
      i = 0,
      ch;
    for (; i < l; i++) {
      ch = text.charCodeAt(i);
      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }
      out += '&#' + ch + ';';
    }
    return out;
  };

  function Parser(options) {
    this.tokens = [];
    this.token = null;
    this.options = options || marked.defaults;
  }
  Parser.parse = function(src, options) {
    var parser = new Parser(options);
    return parser.parse(src);
  };
  Parser.prototype.parse = function(src) {
    this.inline = new InlineLexer(src.links, this.options);
    this.tokens = src.reverse();
    var out = '';
    while (this.next()) {
      out += this.tok();
    }
    return out;
  };
  Parser.prototype.next = function() {
    return this.token = this.tokens.pop();
  };
  Parser.prototype.peek = function() {
    return this.tokens[this.tokens.length - 1] || 0;
  };
  Parser.prototype.parseText = function() {
    var body = this.token.text;
    while (this.peek().type === 'text') {
      body += '\n' + this.next().text;
    }
    return this.inline.output(body);
  };
  Parser.prototype.tok = function() {
    switch (this.token.type) {
      case 'space':
        {
          return '';
        }
      case 'hr':
        {
          return '<hr>\n';
        }
      case 'heading':
        {
          return '<h' +
            this.token.depth +
            '>' +
            this.inline.output(this.token.text) +
            '</h' +
            this.token.depth +
            '>\n';
        }
      case 'code':
        {
          if (this.options.highlight) {
            var code = this.options.highlight(this.token.text, this.token.lang);
            if (code != null && code !== this.token.text) {
              this.token.escaped = true;
              this.token.text = code;
            }
          }
          if (!this.token.escaped) {
            this.token.text = escape(this.token.text, true);
          }
          return '<pre><code' +
            (this.token.lang ?
              ' class="lang-' +
              this.token.lang +
              '"' :
              '') +
            '>' +
            this.token.text +
            '</code></pre>\n';
        }
      case 'table':
        {
          var body = '',
            heading, i, row, cell, j;
          body += '<thead>\n<tr>\n';
          for (i = 0; i < this.token.header.length; i++) {
            heading = this.inline.output(this.token.header[i]);
            body += this.token.align[i] ?
              '<th align="' + this.token.align[i] + '">' + heading + '</th>\n' :
              '<th>' + heading + '</th>\n';
          }
          body += '</tr>\n</thead>\n';
          body += '<tbody>\n'
          for (i = 0; i < this.token.cells.length; i++) {
            row = this.token.cells[i];
            body += '<tr>\n';
            for (j = 0; j < row.length; j++) {
              cell = this.inline.output(row[j]);
              body += this.token.align[j] ?
                '<td align="' + this.token.align[j] + '">' + cell + '</td>\n' :
                '<td>' + cell + '</td>\n';
            }
            body += '</tr>\n';
          }
          body += '</tbody>\n';
          return '<table>\n' +
            body +
            '</table>\n';
        }
      case 'blockquote_start':
        {
          var body = '';
          while (this.next().type !== 'blockquote_end') {
            body += this.tok();
          }
          return '<blockquote>\n' +
            body +
            '</blockquote>\n';
        }
      case 'list_start':
        {
          var type = this.token.ordered ? 'ol' : 'ul',
            body = '';
          while (this.next().type !== 'list_end') {
            body += this.tok();
          }
          return '<' +
            type +
            '>\n' +
            body +
            '</' +
            type +
            '>\n';
        }
      case 'list_item_start':
        {
          var body = '';
          while (this.next().type !== 'list_item_end') {
            body += this.token.type === 'text' ?
              this.parseText() :
              this.tok();
          }
          return '<li>' +
            body +
            '</li>\n';
        }
      case 'loose_item_start':
        {
          var body = '';
          while (this.next().type !== 'list_item_end') {
            body += this.tok();
          }
          return '<li>' +
            body +
            '</li>\n';
        }
      case 'html':
        {
          return !this.token.pre && !this.options.pedantic ?
            this.inline.output(this.token.text) :
            this.token.text;
        }
      case 'paragraph':
        {
          return '<p>' +
            this.inline.output(this.token.text) +
            '</p>\n';
        }
      case 'text':
        {
          return '<p>' +
            this.parseText() +
            '</p>\n';
        }
    }
  };

  function escape(html, encode) {
    return html
      .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function replace(regex, opt) {
    regex = regex.source;
    opt = opt || '';
    return function self(name, val) {
      if (!name) return new RegExp(regex, opt);
      val = val.source || val;
      val = val.replace(/(^|[^\[])\^/g, '$1');
      regex = regex.replace(name, val);
      return self;
    };
  }

  function noop() {}
  noop.exec = noop;

  function merge(obj) {
    var i = 1,
      target, key;
    for (; i < arguments.length; i++) {
      target = arguments[i];
      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }
    return obj;
  }

  function marked(src, opt) {
    try {
      return Parser.parse(Lexer.lex(src, opt), opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/chjj/marked.';
      if ((opt || marked.defaults).silent) {
        return 'An error occured:\n' + e.message;
      }
      throw e;
    }
  }
  marked.options =
    marked.setOptions = function(opt) {
      marked.defaults = opt;
      return marked;
    };
  marked.defaults = {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    silent: false,
    highlight: null
  };
  marked.Parser = Parser;
  marked.parser = Parser.parse;
  marked.Lexer = Lexer;
  marked.lexer = Lexer.lex;
  marked.InlineLexer = InlineLexer;
  marked.inlineLexer = InlineLexer.output;
  marked.parse = marked;
  if (typeof module !== 'undefined') {
    module.exports = marked;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return marked;
    });
  } else {
    this.marked = marked;
  }
}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());;