/*! RESOURCE: /scripts/classes/doctype/GlideModal.js */
(function(global, $) {
  "use strict";
  var GlideModal = function() {
    GlideModal.prototype.initialize.apply(this, arguments);
  };
  GlideModal.prototype = {
    initialize: function(id, readOnly, width, height) {
      this.preferences = {};
      this.id = id;
      this.readOnly = readOnly;
      this.backdropStatic = false;
      this.setDialog(id);
      this.setSize(width, height);
      this.setPreference('renderer', 'RenderForm');
      this.setPreference('type', 'direct');
    },
    setDialog: function(dialogName) {
      this.setPreference('table', dialogName);
    },
    setPreference: function(name, value) {
      this.preferences[name] = value;
    },
    getPreference: function(name) {
      return this.preferences[name];
    },
    setAutoFullHeight: function(isAutoFullHeight) {
      this.isAutoFullHeight = isAutoFullHeight;
    },
    setSize: function(width) {
      this.size = 'modal-md';
      if (!width)
        this.size = 'modal-md';
      else if (typeof width == 'string' && width.indexOf('modal-') == 0)
        this.size = width;
      else if (width < 350)
        this.size = 'modal-alert';
      else if (width < 450)
        this.size = 'modal-sm';
      else if (width < 650)
        this.size = 'modal-md';
      else
        this.size = 'modal-lg';
    },
    setWidth: function(width) {
      this.setSize(width);
    },
    setTitle: function(title) {
      this.title = title;
    },
    setBackdropStatic: function(makeStatic) {
      this.backdropStatic = makeStatic;
    },
    updateTitle: function() {
      $('.modal-title', this.$window).html(this.title);
    },
    updateSize: function() {
      $('.modal-dialog', this.$window).attr('class', 'modal-dialog').addClass(this.size);
    },
    setFocus: function(el) {},
    render: function() {
      var description = this.getDescribingText();
      var ajax = new GlideAjax("RenderInfo");
      ajax.addParam("sysparm_value", description);
      ajax.addParam("sysparm_name", this.id);
      ajax.getXML(this._renderFromAjax.bind(this));
    },
    switchView: function(newView) {
      this.setPreferenceAndReload({
        'sysparm_view': newView
      });
    },
    setPreferenceAndReload: function(params) {
      for (var key in params)
        this.preferences[key] = params[key];
      this.render();
    },
    _renderFromAjax: function(response) {
      var xml = response.responseXML;
      var newBody = xml.getElementsByTagName("html")[0];
      xml = newBody.xml ? newBody.xml :
        new XMLSerializer().serializeToString(newBody);
      if (!xml)
        return;
      this.setPreferencesFromBody(response.responseXML);
      this.setEscapedBody(xml);
      this._evalScripts(xml);
    },
    maximizeHeight: function(callback) {
      if (this.resizeTimeout)
        clearTimeout(this.resizeTimeout);
      var context = this;
      this.resizeTimeout = setTimeout(function() {
        var padding = 100;
        var $modalBody = context.$modalContent.find('.modal-body');
        var modalHeight = context.$modalContent.height();
        var modalToolsHeight = modalHeight - $modalBody.height();
        var newHeight = $(window).height() - padding - modalToolsHeight;
        $modalBody.height(newHeight);
        if (callback)
          callback.apply(context);
      }, 150);
    },
    renderWithContent: function(content) {
      this._createModal();
      if (typeof content == 'string')
        $('.modal-body', this.$window)[0].innerHTML = content;
      else
        $('.modal-body', this.$window).html(content);
      var self = this;
      this.$window.on('show.bs.modal', function() {
        self.isOpen = true;
        self.$modalContent = self.$window.find('.modal-content');
        if (self.isAutoFullHeight)
          self.maximizeHeight();
      }).on('hidden.bs.modal', function() {
        self.isOpen = false;
      });
      this.$window.modal({
        backdrop: this.readOnly || this.backdropStatic ? 'static' : undefined,
        keyboard: !this.readOnly
      });
      this.fireEvent("bodyrendered", this);
      _frameChanged();
    },
    renderIframe: function(url, onloadCallback) {
      var loadingMessage = 'Loading...';
      var div = document.createElement('div');
      div.setAttribute('style', 'position: absolute; top: 2px; right: 2px; bottom: 2px; left: 2px;');
      var loading = document.createElement('div');
      loading.setAttribute('style', 'position: absolute; top: 10px; left: 10px;');
      loading.setAttribute('class', 'loading');
      if (loading.textContent)
        loading.textContent = loadingMessage;
      else
        loading.innerText = loadingMessage;
      var iframe = document.createElement('iframe');
      iframe.setAttribute('style', 'width: 100%; height: 100%; border: 0; background-color: white; visibility: hidden;');
      iframe.src = url;
      div.appendChild(loading);
      div.appendChild(iframe);
      var context = this;
      this.on('bodyrendered', function() {
        context.$modalContent.find('iframe').load(function(evt) {
          context.$modalContent.find('.loading').hide();
          iframe.setAttribute('style', 'width: 100%; height: 100%; border: 0; background-color: white;');
          if (onloadCallback && evt.target && evt.target.contentWindow)
            onloadCallback.apply(evt.target.contentWindow);
        });
      });
      this.renderWithContent(div);
    },
    _createModal: function() {
      var template;
      if (this.$window) {
        this.updateTitle();
        this.updateSize();
        return;
      }
      if (this.template) {
        template = this.template
      } else {
        template = getTemplate();
      }
      this._closeIdenticalModals();
      var html = new Template(template).evaluate({
        title: this.title,
        id: this.id,
        size: this.size,
        readOnly: this.readOnly ? 'true' : 'false',
        showHelp: this.showHelp ? 'true' : 'false'
      });
      var $modal = $(html);
      $modal.data('gWindow', this);
      this.$window = $modal;
      $(document.body).append(this.$window);
      this._watchForClose();
      this._watchHelp();
    },
    _onWindowResize: function(context) {
      return function() {
        if (context.isOpen && context.isAutoFullHeight) {
          context.maximizeHeight();
        }
      }
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
    setBody: function(html, noEvaluate) {
      if (typeof html == 'string') {
        html = this._substituteGet(html);
        html = this._fixBrowserTags(html);
        this.renderWithContent(html);
        if (!noEvaluate)
          this._evalScripts(html);
      } else {
        this.renderWithContent(html);
      }
    },
    setPreferencesFromBody: function(xml) {
      var prefs = xml.getElementsByTagName("renderpreference");
      if (prefs.length > 0) {
        for (var i = 0; i < prefs.length; i++) {
          var pref = prefs[i];
          var name = pref.getAttribute("name");
          var valu = pref.getAttribute("value");
          this.setPreference(name, valu);
          if (name == "title")
            this.setTitle(valu);
          if (name == "render_title" && valu == "false")
            this.setTitle("");
        }
      }
    },
    _substituteGet: function(html) {
      if (!html)
        return html;
      var substitutions = [this.type(), 'GlideDialogWindow', 'GlideDialogForm'];
      for (var i = 0; i < substitutions.length; i++) {
        var reg = new RegExp(substitutions[i] + ".get\\(", "g");
        html = html.replace(reg, this.type() + ".prototype.get('" + this.getID() + "'");
      }
      return html;
    },
    _fixBrowserTags: function(html) {
      if (!html)
        return html;
      var tags = ["script", "a ", "div", "span", "select"];
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        html = html.replace(new RegExp('<' + tag + '([^>]*?)/>', 'img'), '<' + tag + '$1></' + tag + '>');
      }
      return html;
    },
    _evalScripts: function(html) {
      html = this._substituteGet(html, this.type());
      var x = loadXML("<xml>" + html + "</xml>");
      if (x) {
        var scripts = x.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
          var script = scripts[i];
          var s = "";
          if (script.getAttribute("type") == "application/xml")
            continue;
          if (script.getAttribute("src")) {
            var url = script.getAttribute("src");
            var req = serverRequestWait(url);
            s = req.responseText;
          } else {
            s = getTextValue(script);
            if (!s)
              s = script.innerHTML;
          }
          if (s)
            evalScript(s, true);
        }
      }
      if (!window.G_vmlCanvasManager)
        return;
      window.G_vmlCanvasManager.init_(document)
    },
    getID: function() {
      return this.id;
    },
    getPreferences: function() {
      return this.preferences;
    },
    getDescribingXML: function() {
      var section = document.createElement("section");
      section.setAttribute("name", this.getID());
      var preferences = this.getPreferences();
      for (var name in preferences) {
        if (!preferences.hasOwnProperty(name))
          continue;
        var p = document.createElement("preference");
        var v = preferences[name];
        p.setAttribute("name", name);
        if (v !== null && typeof v == 'object') {
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
    destroy: function() {
      if (!this.fireEvent('closeconfirm', this))
        return;
      if (this.$window)
        this.$window.modal('hide');
    },
    _removeWindow: function() {
      this.fireEvent('beforeclose', this);
      this.$window.remove();
    },
    get: function(id) {
      if (!id)
        return this;
      var win = document.getElementById(id);
      if (!win)
        return this;
      return $(win).data('gWindow');
    },
    _watchForClose: function() {
      this.$window.on('click', '[data-dismiss=GlideModal]', function() {
        this.destroy();
      }.bind(this));
      this.$window.on('hidden.bs.modal', function() {
        this._removeWindow(true);
      }.bind(this));
    },
    _watchHelp: function() {
      this.$window.on('click', '.help', function() {
        if (this._helpCallback)
          this._helpCallback.call();
      }.bind(this));
    },
    on: function(evtName, callbackFn) {
      if (!this._events)
        this._events = {};
      if (!this._events[evtName])
        this._events[evtName] = [];
      this._events[evtName].push(callbackFn);
    },
    fireEvent: function() {
      var args = Array.prototype.slice.call(arguments, 0);
      var evtName = args.shift();
      if (!this._events || !this._events[evtName])
        return true;
      for (var i = 0; i < this._events[evtName].length; i++) {
        var ev = this._events[evtName][i];
        if (!ev)
          continue;
        if (ev.apply(this, args) === false)
          return false;
      }
      return true;
    },
    _closeIdenticalModals: function() {
      var $existingModal = $('#' + this.id).data('gWindow');
      if (!$existingModal)
        return;
      $existingModal.destroy();
    },
    addDecoration: function(decorationElement, leftSide) {},
    addFunctionDecoration: function(imgSrc, imgAlt, func, side) {
      if (imgSrc == 'images/help.gif')
        this.addHelpDecoration(func);
    },
    addHelpDecoration: function(func) {
      this.showHelp = true;
      this._helpCallback = func;
    },
    type: function() {
      return "GlideModal";
    }
  };

  function getTemplate() {
    return '<div id="#{HTML:id}" tabindex="-1" ' +
      'aria-hidden="true" class="modal" role="dialog" ' +
      'aria-labelledby="#{HTML:id}_title" data-readonly="#{HTML:readOnly}" data-has-help="#{HTML:showHelp}">' +
      '	<div class="modal-dialog #{size}">' +
      '		<div class="modal-content">' +
      '			<header class="modal-header">' +
      '				<button data-dismiss="GlideModal" class="btn btn-icon close icon-cross">' +
      '					<span class="sr-only">Close</span>' +
      '				</button>' +
      '			<h4 id="#{HTML:id}_title" class="modal-title">' +
      '				#{HTML:title}' +
      '			<button class="btn btn-icon icon-help help">' +
      '				<span class="sr-only">Help</span>' +
      '			</button>' +
      '			</h4>' +
      '			</header>' +
      '			<div class="modal-body container-fluid"></div>' +
      '		</div>' +
      '	</div>' +
      '</div>';
  }
  global.GlideModal = GlideModal;
})(window, jQuery);;