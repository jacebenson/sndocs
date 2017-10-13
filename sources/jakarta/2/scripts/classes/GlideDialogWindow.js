/*! RESOURCE: /scripts/classes/GlideDialogWindow.js */
var GlideDialogWindow = Class.create(GlideWindow, {
  BACKGROUND_COLOR: "#DDDDDD",
  DEFAULT_RENDERER: "RenderForm",
  WINDOW_INVISIBLE: 1,
  ZINDEX: 1050,
  initialize: function(id, readOnly, width, height) {
    GlideWindow.prototype.initialize.call(this, id, readOnly);
    if (width) {
      this.setSize(width, height);
      this.adjustBodySize();
    }
    this.grayBackground = null;
    this.setTitle("Dialog");
    this.setDialog(id);
    this.parentElement = getFormContentParent();
    this.insert(this.parentElement);
    this._initDefaults();
    this.setShim(true);
    this.focusTrap = null;
  },
  destroy: function() {
    var self = this;
    this.disableFocusTrap();
    window.setTimeout(function() {
      Event.stopObserving(self.getWindowDOM(), 'resize', self.resizeFunc);
      self._hideBackground();
      self.parentElement = null;
      GlideWindow.prototype.destroy.call(self);
      if (isMSIE10 || isMSIE11)
        document.body.focus();
    }, 0);
  },
  insert: function(element) {
    this.setZIndex(this._determineZIndex());
    this._showBackground();
    GlideWindow.prototype.insert.call(this, element, '', this.WINDOW_INVISIBLE);
    this.container.setAttribute('role', 'dialog');
    this.container.setAttribute('tabindex', -1);
    this.onResize();
    this.visible();
  },
  enableFocusTrap: function() {
    if (window.focusTrap && this.container)
      this.focusTrap = window.focusTrap(this.container, {
        escapeDeactivates: false
      });
    if (this.focusTrap)
      this.focusTrap.activate();
  },
  disableFocusTrap: function() {
    if (!this.focusTrap)
      return;
    this.focusTrap.deactivate({
      returnFocus: true
    });
    this.focusTrap = null;
  },
  setBody: function(html, noEvaluate, setAlt) {
    GlideWindow.prototype.setBody.call(this, html, noEvaluate, setAlt);
    if (typeof this.elementToFocus != 'undefined' && !this.elementToFocus) {
      self.focus();
      this.getWindowDOM().focus();
    }
    if (this.getPreference('focusTrap'))
      this.enableFocusTrap();
    this.onResize();
  },
  setDialog: function(dialogName) {
    this.setPreference('table', dialogName);
  },
  setAriaLabel: function(label) {
    if (this.container) {
      this.container.setAttribute('aria-label', label);
    }
  },
  setAriaLabelledBy: function(labelId) {
    if (this.container) {
      this.container.setAttribute('aria-labelledby', labelId);
    }
  },
  onResize: function() {
    this._centerOnScreen();
  },
  _eventKeyUp: function(e) {
    e = getEvent(e);
    if (e.keyCode == 27)
      this.destroy();
  },
  hideBackground: function() {
    return this._hideBackground();
  },
  _hideBackground: function() {
    if (this.grayBackground)
      this.parentElement.removeChild(this.grayBackground);
    this.grayBackground = null;
  },
  _initDefaults: function() {
    this.setPreference('renderer', this.DEFAULT_RENDERER);
    this.setPreference('type', 'direct');
    if (!this.isReadOnly())
      Event.observe(this.getWindowDOM(), 'keyup', this._eventKeyUp.bind(this));
    this.resizeFunc = this.onResize.bind(this);
    Event.observe(this.getWindowDOM(), 'resize', this.resizeFunc);
  },
  _showBackground: function() {
    var parent = document.viewport;
    if (document.compatMode == 'BackCompat' && this.parentElement != document.body)
      parent = this.parentElement;
    if (!gel('grayBackground')) {
      var gb = cel("div");
      gb.id = gb.name = "grayBackground";
      gb.style.top = gb.style.left = 0;
      gb.style.width = "100%";
      var hgt = this._getOverlayHeight();
      gb.style.height = hgt + "px";
      gb.style.position = "absolute";
      gb.style.display = "block";
      gb.style.zIndex = this.ZINDEX - 1;
      gb.style.zIndex = this.getZIndex() - 1;
      gb.style.backgroundColor = this.BACKGROUND_COLOR;
      gb.style.opacity = 0.33;
      gb.style.filter = "alpha(opacity=33)";
      this.parentElement.appendChild(gb);
      this.grayBackground = gb;
    }
  },
  _getOverlayHeight: function() {
    var elements = $$('body > div.section_header_content_no_scroll');
    if (elements && elements.length > 0)
      return elements[0].scrollHeight;
    elements = $$('body div.form_document');
    if (elements && elements.length > 0)
      return elements[0].scrollHeight;
    if (document.body.scrollHeight)
      return document.body.scrollHeight;
    return document.body.offsetHeight;
  },
  _determineZIndex: function() {
    if (!window.$j)
      return this.ZINDEX;
    var zIndex = this.ZINDEX;
    $j('.modal:visible').each(function(index, el) {
      var elZindex = $j(el).zIndex();
      if (elZindex >= zIndex)
        zIndex = elZindex + 2;
    })
    return zIndex;
  },
  type: function() {
    return "GlideDialogWindow";
  }
});;