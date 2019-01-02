/*! RESOURCE: /scripts/classes/GlideWindow.js */
var GlideWindow = Class.create(GwtObservable, {
      FORWARD_EVENTS: {
        "mouseover": true,
        "mouseout": true,
        "mousemove": true,
        "click": true,
        "dblclick": true,
        "keyup": true,
        "mouseenter": true,
        "mouseleave": true
      },
      initialize: function(id, readOnly) {
        if (typeof this.DEFAULT_BODY == 'undefined')
          this.DEFAULT_BODY = "<center> " + getMessage("Loading...") + " <br/><img src='images/ajax-loader.gifx' alt='" + getMessage("Loading...") + "' /></center>";
        this._dir = $$('html')[0].readAttribute('dir') === "rtl" ? "right" : "left";
        this.id = id;
        this.window = null;
        this.windowClass = "drag_section_picker";
        this.zIndex = 1;
        this.position = "absolute";
        this.padding = 3;
        this.container = null;
        this._readOnly = readOnly;
        this.preferences = new Object();
        this.titleHTML = null;
        this.elementToFocus = null;
        this.offsetHorizontal = 0;
        this.offsetTop = 0;
        this.gd = null;
        this.shim = null;
        this.valid = true;
        this.closeDecoration = null;
        this._draw(id);
        this.initDecorations();
        this.headerWrap = false;
        this.setScope("global");
        this.doctype = document.documentElement.getAttribute('data-doctype') == 'true';
        this.nologValue = false;
      },
      addDecoration: function(decorationElement, leftSide) {
        if (leftSide) {
          var ld = this.leftDecorations;
          ld.style.display = "block";
          if (ld.hasChildNodes()) {
            ld.insertBefore(decorationElement, ld.childNodes[0].nextSibling);
          } else {
            ld.appendChild(decorationElement);
          }
        } else {
          if (this.rightDecorations) {
            var rd = this.rightDecorations;
            if (rd.hasChildNodes()) {
              rd.insertBefore(decorationElement, rd.childNodes[0]);
            } else {
              rd.appendChild(decorationElement);
            }
          } else {}
        }
      },
      addFunctionDecoration: function(imgSrc, imgAlt, func, side) {
        var span = cel('span');
        var img = cel("img", span);
        img.id = 'popup_close_image';
        img.height = "12"
        img.width = "13"
        img.style.cursor = 'pointer';
        img.src = imgSrc;
        img.alt = getMessage(imgAlt);
        img.gWindow = this;
        img.onclick = func;
        this.addDecoration(span, side);
        img = null;
        return span;
      },
      addHelpDecoration: function(func) {
        this.addFunctionDecoration('images/help.gif', 'Help', func);
      },
      clearLeftDecorations: function() {
        clearNodes(this.leftDecorations);
      },
      clearRightDecorations: function() {
        clearNodes(this.rightDecorations);
      },
      dragging: function(me, x, y) {
        x = Math.max(x, 0);
        y = Math.max(y, 0);
        this.fireEvent("dragging", this);
        me.draggable.style.left = x + 'px';
        me.draggable.style.top = y + 'px';
        this._setShimBounds(x, y, "", "");
      },
      destroy: function() {
        this.fireEvent("beforeclose", this);
        if (this.container) {
          var parent = this.container.parentNode;
          if (parent)
            parent.removeChild(this.container);
        } else {
          var gWindow = this.getWindowDOM();
          var parent = gWindow.parentNode;
          if (parent)
            parent.removeChild(gWindow);
        }
        this.setShim(false);
        if (isMSIE)
          this.container.outerHTML = '';
        this.release();
        this.valid = false;
        this.closeDecoration = null;
      },
      getAbsoluteRect: function(addScroll) {
        return getBounds(this.getWindowDOM(), addScroll);
      },
      getBody: function() {
        return this.body;
      },
      getContainer: function() {
        var obj;
        if (this.container) {
          obj = this.container;
        } else {
          obj = this.getWindowDOM();
        }
        return obj;
      },
      getClassName: function() {
        return this.getWindowDOM().className;
      },
      getDecorations: function(left) {
        if (left)
          return this.leftDecorations;
        return this.rightDecorations;
      },
      getDescribingXML: function() {
        var section = document.createElement("section");
        section.setAttribute("name", this.getID());
        var preferences = this.getPreferences();
        for (var name in preferences) {
          var p = document.createElement("preference");
          var v = preferences[name];
          p.setAttribute("name", name);
          if (v != null && typeof v == 'object') {
            if (typeof v.join == "function") {
              v = v.join(",");
            } else if (typeof v.toString == "function") {
              v = v.toString();
            }
          }
          if (v && typeof v.escapeHTML === "function")
            v = v.escapeHTML();
          if (v)
            p.setAttribute("value", v);
          section.appendChild(p);
        }
        return section;
      },
      getDescribingText: function() {
        var gxml = document.createElement("gxml");
        var x = this.getDescribingXML();
        gxml.appendChild(x);
        return gxml.innerHTML;
      },
      getHeader: function() {
        return this.header;
      },
      getID: function() {
        return this.id;
      },
      getPosition: function() {
        return this.position;
      },
      getPreferences: function() {
        return this.preferences;
      },
      getPreference: function(id) {
        return this.preferences[id];
      },
      getTitle: function() {
        return this.title;
      },
      locate: function(domElement) {
        while (domElement.parentNode) {
          domElement = domElement.parentNode;
          if (domElement.gWindow)
            return domElement.gWindow;
          if (window.$j && $j(domElement).data('gWindow')) {
            return $j(domElement).data('gWindow');
          }
        }
        alert('GlideWindow.locate: window not found');
        return null;
      },
      get: function(id) {
        if (!id || !gel('window.' + id))
          return this;
        return gel('window.' + id).gWindow;
      },
      getWindowDOM: function() {
        return this.window;
      },
      getZIndex: function() {
        return this.zIndex;
      },
      initDecorations: function() {
        if (!this.isReadOnly()) {
          this.closeDecoration = this.addFunctionDecoration("images/x.gifx", 'Close', this._onCloseClicked.bind(this));
        }
      },
      removeCloseDecoration: function() {
        if (this.closeDecoration)
          this.closeDecoration.parentNode.removeChild(this.closeDecoration);
        this.closeDecoration = null;
      },
      showCloseOnMouseOver: function() {
        Event.observe(this.window, "mouseover", this.showCloseButton.bind(this));
        Event.observe(this.window, "mouseout", this.hideCloseButton.bind(this));
        this.hideCloseButton();
      },
      showCloseButton: function() {
        if (this.closeDecoration)
          this.closeDecoration.style.visibility = "visible";
      },
      hideCloseButton: function() {
        if (this.closeDecoration)
          this.closeDecoration.style.visibility = "hidden";
      },
      insert: function(element, beforeElement, invisible) {
        var id = this.getID();
        element = $(element);
        var div = $(id);
        if (!div) {
          var div = cel("div");
          div.name = div.id = id;
          div.gWindow = this;
          div.setAttribute("dragpart", id);
          div.className += " drag_section_part";
          div.style.position = this.getPosition();
          div.style.zIndex = this.getZIndex();
          div.style[this._dir] = this.offsetHorizontal + "px";
          div.style.top = this.offsetTop + "px";
          div.appendChild(this.getWindowDOM());
          if (invisible)
            div.style.visibility = "hidden";
          if (beforeElement)
            element.insertBefore(div, beforeElement);
          else
            element.appendChild(div);
        }
        this.container = div;
        this._enableDragging(div);
      },
      isActive: function() {
        return this.active;
      },
      isReadOnly: function() {
        return this._readOnly;
      },
      isValid: function() {
        return this.valid;
      },
      moveTo: function(x, y) {
        var o = this.getContainer();
        o.style[this._dir] = x + 'px';
        o.style.top = y + 'px';
        this._setShimBounds(x, y, "", "");
      },
      release: function() {
        this.window.gWindow = null;
        this.window = null;
        this.container = null;
        this.body = null;
        if (this.gd)
          this.gd.destroy();
        this.title = null;
        this.header = null;
        this.shim = null;
        this.rightDecorations = null;
        this.leftDecorations = null;
      },
      removePreference: function(name, value) {
        delete this.preferences[name];
      },
      render: function() {
        var id = this.getID();
        var description = this.getDescribingText();
        var ajax = new GlideAjax("RenderInfo");
        if (this.getPreference("sysparm_scope"))
          ajax.setScope(this.getPreference("sysparm_scope"));
        if (this.nologValue)
          ajax.addParam("ni.nolog.sysparm_value", true);
        ajax.addParam("sysparm_value", description);
        ajax.addParam("sysparm_name", id);
        ajax.getXML(this._bodyRendered.bind(this));
      },
      invisible: function() {
        var e = this.getContainer();
        e.style.visibility = "hidden";
      },
      visible: function() {
        var e = this.getContainer();
        e.style.visibility = "visible";
      },
      setAlt: function(alt) {
        this.window.title = alt;
      },
      setEscapedBody: function(body) {
        if (!body)
          return;
        body = body.replace(/\t/g, "");
        body = body.replace(/\r/g, "");
        body = body.replace(/\n+/g, "\n");
        body = body.replace(/%27/g, "'");
        body = body.replace(/%3c/g, "<");
        body = body.replace(/%3e/g, ">");
        body = body.replace(/&amp;/g, "&");
        this.setBody(body, true);
      },
      setBody: function(html, noEvaluate, setAlt) {
        this.body.innerHTML = "";
        if (typeof html == 'string') {
          var showBody = true;
          if (html.length == 0)
            showBody = false;
          this.showBody(showBody);
          html = this._substituteGet(html);
          html = this._fixBrowserTags(html);
          this.body.innerHTML = html;
          if (setAlt)
            this.setBodyAlt(html);
          if (!noEvaluate)
            this._evalScripts(html);
        } else {
          this.body.appendChild(html);
        }
        var prefs = this.body.getElementsByTagName("renderpreference");
        if (prefs.length > 0) {
          for (var i = 0; i < prefs.length; i++) {
            var pref = prefs[i];
            var name = pref.getAttribute("name");
            var valu = pref.getAttribute("value");
            if (name == "render_time") {
              this.debugTD.innerHTML = valu;
              this.debugTD.style.display = "table-cell";
              continue;
            }
            this.setPreference(name, valu);
            if (name == "title")
              this.setTitle(valu);
            if (name == "render_title" && valu == "false")
              this.header.style.display = "none";
            if (name == "hide_close_decoration" && valu == "true")
              this.removeCloseDecoration();
          }
        }
        var decorations = this.body.getElementsByTagName("decoration");
        if (decorations.length > 0) {
          for (var x = 0; x < decorations.length; x++) {
            var thisDecoration = new GlideDecoration(decorations[x]);
            thisDecoration.attach(this);
          }
        }
        if (this.elementToFocus) {
          if (gel(this.elementToFocus)) {
            self.focus();
            gel(this.elementToFocus).focus();
          }
        }
        this._shimResize();
      },
      showBody: function(show) {
        if (this.divMode)
          var tr = this.body;
        else
          var tr = this.body.parentNode.parentNode;
        if (show)
          tr.style.display = "";
        else
          tr.style.display = "none";
      },
      setBodyAlt: function(alt) {
        this.body.title = alt;
      },
      setClassName: function(className) {
        this.windowClass = className;
        if (this.getWindowDOM())
          this.getWindowDOM().className = className;
      },
      setColor: function(color) {
        this.windowBackground = color;
        if (this.getBody())
          this.getBody().parentNode.style.backgroundColor = color;
      },
      setFocus: function(id) {
        this.elementToFocus = id;
      },
      setFont: function(family, size, fontUnit, weight) {
        this.setFontSize(size, fontUnit);
        this.setStyle("fontFamily", family);
        this.setFontWeight(weight);
      },
      setFontSize: function(size, fontUnit) {
        if (!fontUnit)
          fontUnit = "pt";
        this.setStyle("fontSize", size + fontUnit);
      },
      setFontWeight: function(weight) {
        this.setStyle("fontWeight", weight);
      },
      setStyle: function(name, value) {
        if (!value)
          return;
        this.getTitle().style[name] = value;
        this.getBody().style[name] = value;
      },
      setHeaderClassName: function(className) {
        this.getHeader().className = className;
      },
      setHeaderColor: function(background) {
        this.header.style.backgroundColor = background;
      },
      setHeaderColors: function(color, background) {
        this.setHeaderColor(background);
        this.title.style.color = color;
      },
      setOpacity: function(opacity) {
        if (this.divMode) {
          var element = this.getBody().parentNode;
          element.style.filter = "alpha(opacity=" + (opacity * 100) + ")";
          element.style.MozOpacity = opacity + "";
          element.style.opacity = opacity + "";
          element.style.opacity = opacity;
        }
      },
      setPreferences: function(preferences) {
        this.preferences = preferences;
      },
      setPreference: function(name, value) {
        this.preferences[name] = value;
      },
      setPosition: function(name) {
        if (this.getContainer() != this.getWindowDOM())
          this.getContainer().style.position = name;
        this.position = name;
      },
      setReadOnly: function(r) {
        this._readOnly = r;
      },
      setWidth: function(width) {
        this.setSize(width, "");
      },
      getWidth: function() {
        if (this.window)
          return this.window.clientWidth;
        else
          return;
      },
      setHeight: function(height) {
        this.definedHeight = height;
        this.setSize("", height);
      },
      removeHeight: function() {
          this.definedHeight = null;
          var obj = this.getContainer();
          obj.style.height = "";
          this.window.style.height = "";
          var bo = this.