/*! RESOURCE: /scripts/classes/nowapi/js_includes_nowapi.js */
/*! RESOURCE: /scripts/classes/GlideNavigation.js */
;
(function() {
  var GlideNavigation = function() {};
  GlideNavigation.prototype = {
    open: function(url, target) {
      if (target) {
        window.open(url, target);
        return;
      }
      window.location.href = url;
    },
    openList: function(table, query) {
      var url = table + '_list.do';
      if (query)
        url += "?sysparm_query=" + encodeURIComponent(query);
      this.open(url);
    },
    openRecord: function(table, sys_id) {
      var url = table + '.do?sys_id=' + sys_id;
      this.open(url);
    },
    reloadWindow: function() {
      if (window.location.reload)
        window.location.reload();
    },
    refreshNavigator: function() {
      CustomEvent.fireTop('navigator.refresh');
    },
    getURL: function() {
      return window.location.href;
    },
    openPopup: function(url, name, features, noStack) {
      if (noStack === true && url.indexOf("sysparm_nameofstack") == -1)
        url += "&sysparm_stack=no";
      var win = window.open(url, name, features, false);
      return win;
    },
    setPermalink: function(title, relativePath) {
      CustomEvent.fireTop('magellanNavigator.permalink.set', {
        title: title,
        relativePath: relativePath
      });
    },
    addUserHistoryEntry: function(title, relativePath, description, isTable) {
      if (typeof description == "undefined")
        description = "";
      if (typeof isTable == "undefined")
        isTable = false;
      CustomEvent.fireTop('magellanNavigator.sendHistoryEvent', {
        title: title,
        url: relativePath,
        description: description,
        isTable: isTable
      });
    }
  };
  window.g_navigation = new GlideNavigation();
})();;
/*! RESOURCE: /scripts/classes/nowapi/nowapi.js */
"use strict";
window.nowapi = {
  g_guid: {
    generate: function(l) {
      var l = l || 32,
        strResult = '';
      while (strResult.length < l)
        strResult += (((1 + Math.random() + new Date().getTime()) * 0x10000) | 0).toString(16).substring(1);
      return strResult.substr(0, l);
    }
  },
  g_document: {
    getElement: function(selector, context) {
      context = context || document;
      return context.querySelector(selector);
    },
    getElements: function(selector, context) {
      context = context || document;
      return context.querySelectorAll(selector);
    },
    createElement: function(tagname) {
      return document.createElement(tagname);
    }
  },
  g_navigation: window.g_navigation,
  g_api: 2
};
angular.injector(['ng']).invoke(function($log) {
  window.nowapi.log = $log.log;
  window.jslog = window.jslog || $log.log;
});;
/*! RESOURCE: /scripts/classes/nowapi/ui/_ui_includes.js */
/*! RESOURCE: /scripts/classes/nowapi/ui/GlideModal.js */
(function(exports, $) {
  "use strict";
  if (window.GlideModal) {
    exports.GlideModal = window.GlideModal;
    return;
  }
  var GlideModal = function() {
    GlideModal.prototype.initialize.apply(this, arguments);
  };
  var objPrototype = {
    initialize: function(id, readOnly, width, height) {
      this.preferences = {};
      this.id = id;
      this.readOnly = readOnly;
      this.backdropStatic = false;
      this.isAutoFullHeight = false;
      this.nologValue = false;
      this.setDialog(id);
      this.setSize(width, height);
      this.setPreference('renderer', 'RenderForm');
      this.setPreference('type', 'direct');
      $(window).on('resize', this._onWindowResize(this));
    },
    setAutoFullHeight: function(isAutoFullHeight) {
      this.isAutoFullHeight = isAutoFullHeight;
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
    setSize: function(width, height) {
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
      if (height)
        this.height = height;
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
    setNologValue: function(nolog) {
      this.nologValue = !!nolog;
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
      var ajax = new nowapi.GlideAjax("RenderInfo");
      if (this.getPreference("sysparm_scope"))
        ajax.setScope(this.getPreference("sysparm_scope"));
      if (this.nologValue)
        ajax.addParam("ni.nolog.sysparm_value", true);
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
      xml = newBody.xml ? newBody.xml : new XMLSerializer().serializeToString(newBody);
      if (!xml)
        return;
      this.setPreferencesFromBody(response.responseXML);
      this.setEscapedBody(xml);
      this._evalScripts(xml);
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
          self.maximizeHeight(function() {
            this.$window.velocity({
              opacity: 1
            }, {
              visibility: 'visible'
            }, {
              easing: "easeOutQuint"
            });
          });
      }).on('hidden.bs.modal', function() {
        self.isOpen = false;
      });
      if (self.isAutoFullHeight)
        this.$window.css('visibility', 'hidden');
      this.$window.modal();
      this.fireEvent("bodyrendered", this);
    },
    locate: function(domElement) {
      while (domElement.parentNode) {
        domElement = domElement.parentNode;
        if (jQuery(domElement).data('gWindow'))
          return jQuery(domElement).data('gWindow');
      }
      alert('GlideModal.locate: window not found');
      return null;
    },
    _onWindowResize: function(context) {
      return function() {
        if (context.isOpen && context.isAutoFullHeight) {
          context.maximizeHeight();
        }
      };
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
    renderIframe: function(src, onloadCallback) {
      var html = this.interpolate('<div style="position: absolute; top: 2px; right: 2px; bottom: 2px; left: 2px;"><div style="position: absolute; top: 10px; left: 10px;" class="loading">' + window.nowapi.g_i18n.getMessage('Loading...') + '</div><iframe style="width: 100%; height: 100%; border: 0; background-color: white; visibility: hidden;" src="{{src}}" /></div>', {
        src: src
      });
      var context = this;
      this.on('bodyrendered', function() {
        this.$modalContent.find('iframe').load(function(evt) {
          context.$modalContent.find('.loading').hide();
          $(this).velocity({
            opacity: 1
          }, {
            visibility: 'visible'
          }, "easeOutQuint");
          if (onloadCallback && evt.target && evt.target.contentWindow)
            onloadCallback.apply(evt.target.contentWindow);
        });
      });
      this.renderWithContent(html);
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
      var templateProps = {
        title: this.title,
        id: this.id,
        size: this.size,
        readOnly: this.readOnly ? 'true' : 'false',
        showHelp: this.showHelp ? 'true' : 'false'
      };
      if (this.height)
        templateProps.height = parseInt(this.height) + "px";
      var html = this.interpolate(template, templateProps);
      var $modal = $(html);
      $modal.data('gWindow', this);
      this.$window = $modal;
      $(document.body).append(this.$window);
      this._watchForClose();
      this._watchHelp();
    },
    interpolate: function(html, map) {
      var output = "";
      angular.injector(['ng']).invoke(function($interpolate) {
        output = $interpolate(html)(map);
      });
      return output;
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
      var x = this.loadXML("<xml>" + html + "</xml>");
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
            s = this.getTextValue(script);
            if (!s)
              s = script.innerHTML;
          }
          if (s)
            window.eval(s);
        }
      }
      if (!window.G_vmlCanvasManager)
        return;
      window.G_vmlCanvasManager.init_(document)
    },
    getTextValue: function(node) {
      if (node.textContent)
        return node.textContent;
      var firstNode = node.childNodes[0];
      if (!firstNode)
        return null;
      if (firstNode.data)
        return firstNode.data;
      return firstNode.nodeValue;
    },
    loadXML: function(r) {
      var xml = r.responseXML;
      if (typeof xml != 'undefined')
        return xml;
      var dom = null;
      try {
        dom = new DOMParser().parseFromString(r, 'text/xml');
      } catch (e) {}
      return dom;
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
    setScope: function(scope) {
      if (scope) {
        this.setPreference('sysparm_scope', scope);
      }
      return this;
    },
    type: function() {
      return "GlideModal";
    }
  };
  GlideModal.prototype = objPrototype;

  function getTemplate() {
    return '<div id="{{id}}" tabindex="-1" ' +
      'aria-hidden="true" class="modal" role="dialog" ' +
      'aria-labelledby="{{id}}_title" data-readonly="{{readOnly}}" data-has-help="{{showHelp}}">' +
      '	<div class="modal-dialog {{size}}">' +
      '		<div class="modal-content" style="{{height}}">' +
      '			<header class="modal-header">' +
      '				<button data-dismiss="GlideModal" class="btn btn-icon close icon-cross">' +
      '					<span class="sr-only">Close</span>' +
      '				</button>' +
      '			<h4 id="{{id}}_title" class="modal-title">{{title}}' +
      '			<button class="btn btn-icon icon-help help">' +
      '				<span class="sr-only">Help</span>' +
      '			</button>' +
      '			</h4>' +
      '			</header>' +
      '			<div class="modal-body container-fluid" style="position: relative"></div>' +
      '		</div>' +
      '	</div>' +
      '</div>';
  }
  exports.GlideModal = GlideModal;
})(window.nowapi, jQuery);;
/*! RESOURCE: /scripts/classes/nowapi/ui/GlideModalForm.js */
(function(exports, $) {
  "use strict";
  if (window.GlideModalForm) {
    exports.GlideModalForm = window.GlideModalForm;
    return;
  }
  var GlideModalForm = function() {
    GlideModalForm.prototype.init.apply(this, arguments);
  };
  GlideModalForm.prototype = $.extend({}, exports.GlideModal.prototype, {
    IGNORED_PREFERENCES: {
      'renderer': true,
      'type': true,
      'table': true
    },
    init: function(title, tableName, onCompletionCallback, readOnly) {
      this.initialize.call(this, tableName, readOnly, 800);
      this.tableName = tableName;
      if (title) {
        this.setTitle(title);
      }
      if (onCompletionCallback) {
        this.setCompletionCallback(onCompletionCallback);
      }
    },
    setSize: function(width) {
      this.size = 'modal-95';
    },
    setFooter: function(bool) {
      this.hasFooter = !!bool;
    },
    setSysID: function(id) {
      this.setPreference('sys_id', id);
    },
    setType: function(type) {
      this.setPreference('type', type);
    },
    setTemplate: function(template) {
      this.template = template;
    },
    setCompletionCallback: function(func) {
      this.onCompletionFunc = func;
    },
    setOnloadCallback: function(func) {
      this.onFormLoad = func;
    },
    render: function() {
      this._createModal();
      var body = $('.modal-body', this.$window)[0];
      body.innerHTML = getFormTemplate();
      var frame = $('.modal-frame', this.$window);
      frame.on('load', function() {
        this._formLoaded();
      }.bind(this));
      this.$window.modal({
        backdrop: 'static'
      });
      this._bodyHeight = $('#' + this.id).first().height();
      var margin = $('.modal-dialog', this.$window)[0].offsetTop * 2;
      margin += frame.offset().top;
      if (this._bodyHeight > margin)
        this._bodyHeight -= margin;
      if (this.hasFooter) {
        this._bodyHeight = this._bodyHeight - 40;
      }
      frame.css('height', this._bodyHeight);
      var $doc = frame[0].contentWindow ? frame[0].contentWindow.document : frame[0].contentDocument;
      var $body = $($doc.body);
      $body.html('');
      $body.append($('link').clone());
      $body.append('<center>' + window.nowapi.g_i18n.getMessage('Loading') + '... <br/><img src="images/ajax-loader.gifx"/></center></span>');
      var f = $('.modal_dialog_form_poster', this.$window)[0];
      f.action = this.getPreference('table') + '.do';
      addHidden(f, 'sysparm_clear_stack', 'true');
      addHidden(f, 'sysparm_nameofstack', 'formDialog');
      addHidden(f, 'sysparm_titleless', 'true');
      addHidden(f, 'sysparm_is_dialog_form', 'true');
      var sysId = this.getPreference('sys_id');
      if (!sysId)
        sysId = '';
      addHidden(f, 'sys_id', sysId);
      var targetField = '';
      if (this.fieldIDSet)
        targetField = this.getPreference('sysparm_target_field');
      for (var id in this.preferences) {
        if (!this.IGNORED_PREFERENCES[id])
          addHidden(f, id, this.preferences[id]);
      }
      var parms = [];
      parms.push('sysparm_skipmsgs=true');
      parms.push('sysparm_nostack=true');
      parms.push('sysparm_target_field=' + targetField);
      parms.push('sysparm_returned_action=$action');
      parms.push('sysparm_returned_sysid=$sys_id');
      parms.push('sysparm_returned_value=$display_value');
      addHidden(f, 'sysparm_goto_url', 'modal_dialog_form_response.do?' + parms.join('&'));
      f.submit();

      function addHidden(formEl, name, value) {
        if ($j(formEl).find("input[name='" + name + "'][value='" + value + "']").length === 0)
          $j(formEl).append('<input type="hidden" name="' + name + '" value="' + value + '"/>');
      }
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
    _formLoaded: function() {
      var frame = $('.modal-frame', this.$window);
      if (frame.contents().get(0).location.href.indexOf('modal_dialog_form_response') != -1) {
        if (this.onCompletionFunc) {
          var f = $('.modal_dialog_form_response form', frame.contents())[0];
          this.onCompletionFunc(f.action.value, f.sysid.value, this.tableName, f.value.value);
        }
        this.destroy();
        return;
      }
      if (this.onFormLoad)
        this.onFormLoad(this);
    },
    addParm: function(k, v) {
      this.setPreference(k, v);
    }
  });

  function getFormTemplate() {
    return '<form class="modal_dialog_form_poster" target="dialog_frame" method="POST" style="display: inline;"/>' +
      '<iframe id="dialog_frame" name="dialog_frame" class="modal-frame" style="width:100%;height:100%;" frameborder="no" />';
  }
  exports.GlideModalForm = GlideModalForm;
})(window.nowapi, jQuery);;
/*! RESOURCE: /scripts/classes/nowapi/ui/Notification.js */
(function(exports, angular) {
  "use strict";
  angular.injector(['ng', 'sn.common.notification']).invoke(function(snNotification) {
    exports.g_notification = snNotification;
  });
})(window.nowapi, angular);;;
/*! RESOURCE: /scripts/classes/nowapi/util/_util_includes.js */
/*! RESOURCE: /scripts/lib/labjs/LAB.min.js */
/*! LAB.js (LABjs :: Loading And Blocking JavaScript)
    v2.0.3 (c) Kyle Simpson
    MIT License
*/
(function(o) {
  var K = o.$LAB,
    y = "UseLocalXHR",
    z = "AlwaysPreserveOrder",
    u = "AllowDuplicates",
    A = "CacheBust",
    B = "BasePath",
    C = /^[^?#]*\//.exec(location.href)[0],
    D = /^\w+\:\/\/\/?[^\/]+/.exec(C)[0],
    i = document.head || document.getElementsByTagName("head"),
    L = (o.opera && Object.prototype.toString.call(o.opera) == "[object Opera]") || ("MozAppearance" in document.documentElement.style),
    q = document.createElement("script"),
    E = typeof q.preload == "boolean",
    r = E || (q.readyState && q.readyState == "uninitialized"),
    F = !r && q.async === true,
    M = !r && !F && !L;

  function G(a) {
    return Object.prototype.toString.call(a) == "[object Function]"
  }

  function H(a) {
    return Object.prototype.toString.call(a) == "[object Array]"
  }

  function N(a, c) {
    var b = /^\w+\:\/\//;
    if (/^\/\/\/?/.test(a)) {
      a = location.protocol + a
    } else if (!b.test(a) && a.charAt(0) != "/") {
      a = (c || "") + a
    }
    return b.test(a) ? a : ((a.charAt(0) == "/" ? D : C) + a)
  }

  function s(a, c) {
    for (var b in a) {
      if (a.hasOwnProperty(b)) {
        c[b] = a[b]
      }
    }
    return c
  }

  function O(a) {
    var c = false;
    for (var b = 0; b < a.scripts.length; b++) {
      if (a.scripts[b].ready && a.scripts[b].exec_trigger) {
        c = true;
        a.scripts[b].exec_trigger();
        a.scripts[b].exec_trigger = null
      }
    }
    return c
  }

  function t(a, c, b, d) {
    a.onload = a.onreadystatechange = function() {
      if ((a.readyState && a.readyState != "complete" && a.readyState != "loaded") || c[b]) return;
      a.onload = a.onreadystatechange = null;
      d()
    }
  }

  function I(a) {
    a.ready = a.finished = true;
    for (var c = 0; c < a.finished_listeners.length; c++) {
      a.finished_listeners[c]()
    }
    a.ready_listeners = [];
    a.finished_listeners = []
  }

  function P(d, f, e, g, h) {
    setTimeout(function() {
      var a, c = f.real_src,
        b;
      if ("item" in i) {
        if (!i[0]) {
          setTimeout(arguments.callee, 25);
          return
        }
        i = i[0]
      }
      a = document.createElement("script");
      if (f.type) a.type = f.type;
      if (f.charset) a.charset = f.charset;
      if (h) {
        if (r) {
          e.elem = a;
          if (E) {
            a.preload = true;
            a.onpreload = g
          } else {
            a.onreadystatechange = function() {
              if (a.readyState == "loaded") g()
            }
          }
          a.src = c
        } else if (h && c.indexOf(D) == 0 && d[y]) {
          b = new XMLHttpRequest();
          b.onreadystatechange = function() {
            if (b.readyState == 4) {
              b.onreadystatechange = function() {};
              e.text = b.responseText + "\n//@ sourceURL=" + c;
              g()
            }
          };
          b.open("GET", c);
          b.send()
        } else {
          a.type = "text/cache-script";
          t(a, e, "ready", function() {
            i.removeChild(a);
            g()
          });
          a.src = c;
          i.insertBefore(a, i.firstChild)
        }
      } else if (F) {
        a.async = false;
        t(a, e, "finished", g);
        a.src = c;
        i.insertBefore(a, i.firstChild)
      } else {
        t(a, e, "finished", g);
        a.src = c;
        i.insertBefore(a, i.firstChild)
      }
    }, 0)
  }

  function J() {
    var l = {},
      Q = r || M,
      n = [],
      p = {},
      m;
    l[y] = true;
    l[z] = false;
    l[u] = false;
    l[A] = false;
    l[B] = "";

    function R(a, c, b) {
      var d;

      function f() {
        if (d != null) {
          d = null;
          I(b)
        }
      }
      if (p[c.src].finished) return;
      if (!a[u]) p[c.src].finished = true;
      d = b.elem || document.createElement("script");
      if (c.type) d.type = c.type;
      if (c.charset) d.charset = c.charset;
      t(d, b, "finished", f);
      if (b.elem) {
        b.elem = null
      } else if (b.text) {
        d.onload = d.onreadystatechange = null;
        d.text = b.text
      } else {
        d.src = c.real_src
      }
      i.insertBefore(d, i.firstChild);
      if (b.text) {
        f()
      }
    }

    function S(c, b, d, f) {
      var e, g, h = function() {
          b.ready_cb(b, function() {
            R(c, b, e)
          })
        },
        j = function() {
          b.finished_cb(b, d)
        };
      b.src = N(b.src, c[B]);
      b.real_src = b.src + (c[A] ? ((/\?.*$/.test(b.src) ? "&_" : "?_") + ~~(Math.random() * 1E9) + "=") : "");
      if (!p[b.src]) p[b.src] = {
        items: [],
        finished: false
      };
      g = p[b.src].items;
      if (c[u] || g.length == 0) {
        e = g[g.length] = {
          ready: false,
          finished: false,
          ready_listeners: [h],
          finished_listeners: [j]
        };
        P(c, b, e, ((f) ? function() {
          e.ready = true;
          for (var a = 0; a < e.ready_listeners.length; a++) {
            e.ready_listeners[a]()
          }
          e.ready_listeners = []
        } : function() {
          I(e)
        }), f)
      } else {
        e = g[0];
        if (e.finished) {
          j()
        } else {
          e.finished_listeners.push(j)
        }
      }
    }

    function v() {
      var e, g = s(l, {}),
        h = [],
        j = 0,
        w = false,
        k;

      function T(a, c) {
        a.ready = true;
        a.exec_trigger = c;
        x()
      }

      function U(a, c) {
        a.ready = a.finished = true;
        a.exec_trigger = null;
        for (var b = 0; b < c.scripts.length; b++) {
          if (!c.scripts[b].finished) return
        }
        c.finished = true;
        x()
      }

      function x() {
        while (j < h.length) {
          if (G(h[j])) {
            try {
              h[j++]()
            } catch (err) {}
            continue
          } else if (!h[j].finished) {
            if (O(h[j])) continue;
            break
          }
          j++
        }
        if (j == h.length) {
          w = false;
          k = false
        }
      }

      function V() {
        if (!k || !k.scripts) {
          h.push(k = {
            scripts: [],
            finished: true
          })
        }
      }
      e = {
        script: function() {
          for (var f = 0; f < arguments.length; f++) {
            (function(a, c) {
              var b;
              if (!H(a)) {
                c = [a]
              }
              for (var d = 0; d < c.length; d++) {
                V();
                a = c[d];
                if (G(a)) a = a();
                if (!a) continue;
                if (H(a)) {
                  b = [].slice.call(a);
                  b.unshift(d, 1);
                  [].splice.apply(c, b);
                  d--;
                  continue
                }
                if (typeof a == "string") a = {
                  src: a
                };
                a = s(a, {
                  ready: false,
                  ready_cb: T,
                  finished: false,
                  finished_cb: U
                });
                k.finished = false;
                k.scripts.push(a);
                S(g, a, k, (Q && w));
                w = true;
                if (g[z]) e.wait()
              }
            })(arguments[f], arguments[f])
          }
          return e
        },
        wait: function() {
          if (arguments.length > 0) {
            for (var a = 0; a < arguments.length; a++) {
              h.push(arguments[a])
            }
            k = h[h.length - 1]
          } else k = false;
          x();
          return e
        }
      };
      return {
        script: e.script,
        wait: e.wait,
        setOptions: function(a) {
          s(a, g);
          return e
        }
      }
    }
    m = {
      setGlobalDefaults: function(a) {
        s(a, l);
        return m
      },
      setOptions: function() {
        return v().setOptions.apply(null, arguments)
      },
      script: function() {
        return v().script.apply(null, arguments)
      },
      wait: function() {
        return v().wait.apply(null, arguments)
      },
      queueScript: function() {
        n[n.length] = {
          type: "script",
          args: [].slice.call(arguments)
        };
        return m
      },
      queueWait: function() {
        n[n.length] = {
          type: "wait",
          args: [].slice.call(arguments)
        };
        return m
      },
      runQueue: function() {
        var a = m,
          c = n.length,
          b = c,
          d;
        for (; --b >= 0;) {
          d = n.shift();
          a = a[d.type].apply(null, d.args)
        }
        return a
      },
      noConflict: function() {
        o.$LAB = K;
        return m
      },
      sandbox: function() {
        return J()
      }
    };
    return m
  }
  o.$LAB = J();
  (function(a, c, b) {
    if (document.readyState == null && document[a]) {
      document.readyState = "loading";
      document[a](c, b = function() {
        document.removeEventListener(c, b, false);
        document.readyState = "complete"
      }, false)
    }
  })("addEventListener", "DOMContentLoaded")
})(this);
/*! RESOURCE: /scripts/classes/nowapi/util/GlideUrlBuilder.js */
(function(exports, angular) {
  "use strict";
  angular.injector(['ng', 'sn.common.glide']).invoke(function(glideUrlBuilder) {
    exports.GlideURLBuilder = glideUrlBuilder;
    exports.GlideURL = glideUrlBuilder.newGlideUrl;
  });
})(window.nowapi, angular);;
/*! RESOURCE: /scripts/classes/nowapi/util/ScriptLoader.js */
window.nowapi.ScriptLoader = {
  getScripts: function(scripts, callback) {
    if (!(scripts instanceof Array))
      scripts = [scripts];
    for (var i = 0; i < scripts.length; i++)
      $LAB.queueScript(scripts[i]);
    $LAB.queueWait(callback);
    $LAB.runQueue();
  }
};;
/*! RESOURCE: /scripts/classes/nowapi/util/StopWatch.js */
(function(global) {
  "use strict";
  var StopWatch = function() {
    StopWatch.prototype.initialize.apply(this, arguments);
  };

  function doubleDigitFormat(num) {
    if (num >= 10)
      return num;
    return "0" + num;
  }

  function tripleDigitFormat(num) {
    if (num >= 100)
      return num;
    if (num >= 10)
      return "0" + doubleDigitFormat(num);
    return "00" + num;
  }
  var objPrototype = {
    MILLIS_IN_SECOND: 1000,
    MILLIS_IN_MINUTE: 60 * 1000,
    MILLIS_IN_HOUR: 60 * 60 * 1000,
    initialize: function(started) {
      this.started = started || new Date();
    },
    getTime: function() {
      var now = new Date();
      return now.getTime() - this.started.getTime();
    },
    restart: function() {
      this.initialize();
    },
    jslog: function(msg, src, date) {
      global.log('[' + this.toString() + '] ' + msg, src, date);
      return;
    },
    toString: function() {
      return this.formatISO(this.getTime());
    },
    formatISO: function(millis) {
      var hours = 0,
        minutes = 0,
        seconds = 0,
        milliseconds = 0;
      if (millis >= this.MILLIS_IN_HOUR) {
        hours = parseInt(millis / this.MILLIS_IN_HOUR);
        millis = millis - (hours * this.MILLIS_IN_HOUR);
      }
      if (millis >= this.MILLIS_IN_MINUTE) {
        minutes = parseInt(millis / this.MILLIS_IN_MINUTE);
        millis = millis - (minutes * this.MILLIS_IN_MINUTE);
      }
      if (millis >= this.MILLIS_IN_SECOND) {
        seconds = parseInt(millis / this.MILLIS_IN_SECOND);
        millis = millis - (seconds * this.MILLIS_IN_SECOND);
      }
      milliseconds = parseInt(millis);
      return doubleDigitFormat(hours) + ":" + doubleDigitFormat(minutes) + ":" + doubleDigitFormat(seconds) +
        "." + tripleDigitFormat(milliseconds);
    },
    type: "StopWatch"
  };
  StopWatch.prototype = objPrototype;
  global.GlideStopWatch = StopWatch;
})(window.nowapi);;;
/*! RESOURCE: /scripts/classes/nowapi/GlideAjax.js */
(function(exports, $) {
  'use strict';
  var url = "xmlhttp.do";

  function GlideAjax() {
    this.initialize.apply(this, arguments);
  }
  var objDef = {
    initialize: function(targetProcessor, targetURL) {
      this.processor = null;
      this.params = {};
      this.callbackFn = function() {};
      this.errorCallbackFn = function() {};
      this.wantAnswer = false;
      this.requestObject = null;
      this.setProcessor(targetProcessor);
      url = targetURL || url;
    },
    addParam: function(name, value) {
      this.params[name] = value;
    },
    getParam: function(name) {
      return this.params[name];
    },
    getXML: function(callback) {
      this.wantAnswer = false;
      this.callbackFn = callback;
      this.execute();
    },
    getXMLAnswer: function(callback) {
      this.wantAnswer = true;
      this.callbackFn = callback;
      this.execute();
    },
    getJSON: function(callback) {
      this.getXMLAnswer(function(answer) {
        var answerJSON = JSON.parse(answer);
        callback(answerJSON);
      });
    },
    getAnswer: function() {
      return this.requestObject.responseXML.documentElement.getAttribute('answer');
    },
    setErrorCallback: function(errorCallback) {
      this.errorCallbackFn = errorCallback;
    },
    getURL: function() {
      return url;
    },
    getParams: function() {
      return this.params;
    },
    setProcessor: function(p) {
      this.addParam('sysparm_processor', p);
      if (!p)
        alert('GlideAjax.initalize: must specify a processor');
      this.processor = p;
    },
    getProcessor: function() {
      return this.processor;
    },
    execute: function() {
      $.ajax({
        type: 'POST',
        url: url,
        data: this.params,
        dataType: 'xml',
        success: this.successCallback.bind(this),
        error: this.errorCallback.bind(this)
      });
    },
    successCallback: function(data, status, xhr) {
      this.requestObject = xhr;
      this._fireUINotifications();
      var args = [this.wantAnswer ? this.getAnswer() : xhr];
      this.callbackFn.apply(null, args);
    },
    errorCallback: function(xhr) {
      this.requestObject = xhr;
      this._handleError();
      this._fireUINotifications();
      this.errorCallbackFn(xhr);
    },
    setScope: function(scope) {
      if (scope)
        this.addParam('sysparm_scope', scope);
      return this;
    },
    _outOfScope: function() {
      var callerScope = this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global";
      var isAppScope = callerScope != "global";
      return isAppScope && this.requestObject.responseXML.documentElement.getAttribute("error").indexOf("HTTP Processor class not found") == 0;
    },
    _fireUINotifications: function() {
      if (!this.requestObject || !this.requestObject.responseXML)
        return;
      var notifications = this.requestObject.responseXML.getElementsByTagName('ui_notifications');
      if (!notifications || notifications.length == 0)
        return;
      var spans = notifications[0].childNodes;
      for (var i = 0; i < spans.length; i++) {
        var span = spans[i];
        CustomEvent.fire('legacy_session_notification', span);
      }
    },
    _handleError: function() {
      var responseCode = this._getResponseCode();
      if (responseCode == 404 && this._outOfScope()) {
        var err_options = {
          text: "Access to Script Include " + this.processor + " blocked from scope: " + (this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global"),
          notification_type: "system",
          attributes: {
            type: "error"
          }
        };
        CustomEvent.fire('session_notification', err_options);
      }
    },
    _getResponseCode: function() {
      return this.requestObject.status;
    },
  };
  GlideAjax.prototype = objDef;
  exports.GlideAjax = window.GlideAjax || GlideAjax;
})(nowapi, jQuery);;
/*! RESOURCE: /scripts/classes/nowapi/GlideRecord.js */
(function(exports) {
  'use strict';

  function GlideRecord() {
    this.initialize.apply(this, arguments);
  }
  var objDef = {
    AJAX_PROCESSOR: "AJAXGlideRecord",
    initialized: false,
    initialize: function(tableName) {
      this.currentRow = -1;
      this.rows = [];
      this.conditions = [];
      this.encodedQuery = "";
      this.orderByFields = [];
      this.orderByDescFields = [];
      this.displayFields = [];
      this.maxQuerySize = -1;
      if (tableName)
        this.setTableName(tableName);
      if (this.initialized == false) {
        this.ignoreNames = {};
        for (var xname in this) {
          this.ignoreNames[xname] = true;
        }
      } else {
        for (var xname in this) {
          if (this.ignoreNames[xname] && this.ignoreNames[xname] == true)
            continue;
          delete this[xname];
        }
      }
      this.initialized = true;
    },
    addQuery: function() {
      var fName;
      var fOper;
      var fValue;
      if (arguments.length == 2) {
        fName = arguments[0];
        fOper = '=';
        fValue = arguments[1];
      } else if (arguments.length == 3) {
        fName = arguments[0];
        fOper = arguments[1];
        fValue = arguments[2];
      }
      this.conditions.push({
        'name': fName,
        'oper': fOper,
        'value': fValue
      });
    },
    getEncodedQuery: function() {
      var ec = this.encodedQuery;
      for (var i = 0; i < this.conditions.length; i++) {
        var q = this.conditions[i];
        ec += "^" + q['name'] + q['oper'] + q['value'];
      }
      return ec;
    },
    deleteRecord: function(responseFunction) {
      var ajax = new nowapi.GlideAjax(this.AJAX_PROCESSOR);
      ajax.addParam("sysparm_type", "delete");
      ajax.addParam("sysparm_name", this.getTableName());
      ajax.addParam("sysparm_chars", this._getXMLSerialized());
      if (typeof responseFunction != 'function') {
        ajax.getXML();
        return;
      }
      ajax.getXML(this._deleteRecord0.bind(this, responseFunction));
    },
    _deleteRecord0: function(responseFunction, response) {
      if (!response || !response.responseXML)
        return;
      responseFunction(this);
    },
    get: function(id) {
      this.initialize();
      this.addQuery('sys_id', id);
      this.query();
      return this.next();
    },
    getTableName: function() {
      return this.tableName;
    },
    hasNext: function() {
      return (this.currentRow + 1 < this.rows.length);
    },
    insert: function(responseFunction) {
      return this.update(responseFunction);
    },
    gotoTop: function() {
      this.currentRow = -1;
    },
    next: function() {
      if (!this.hasNext())
        return false;
      this.currentRow++;
      this.loadRow(this.rows[this.currentRow]);
      return true;
    },
    loadRow: function(r) {
      for (var i = 0; i < r.length; i++) {
        var name = r[i].name;
        var value = r[i].value;
        if (this.isDotWalkField(name)) {
          var start = this;
          var parts = name.split(/-/);
          for (var p = 0; p < parts.length - 1; p++) {
            var part = parts[p];
            if (typeof start[part] != 'object')
              start[part] = new Object();
            start = start[part];
          }
          var fieldName = parts[parts.length - 1];
          start[fieldName] = value;
        } else {
          this[name] = value;
        }
      }
    },
    getValue: function(fieldName) {
      return this[fieldName];
    },
    setValue: function(fieldName, value) {
      this[fieldName] = value;
    },
    isDotWalkField: function(name) {
      for (var i = 0; i < this.displayFields.length; i++) {
        var fieldName = this.displayFields[i];
        if (fieldName.indexOf(".") == -1)
          continue;
        var encodedFieldName = fieldName.replace(/\./g, "-");
        if (name == encodedFieldName)
          return true;
      }
      return false;
    },
    addOrderBy: function(f) {
      this.orderByFields.push(f);
    },
    orderBy: function(f) {
      this.orderByFields.push(f);
    },
    orderByDesc: function(f) {
      this.orderByDescFields.push(f);
    },
    setDisplayFields: function(fields) {
      this.displayFields = fields;
    },
    query: function() {
      var responseFunction = this._parseArgs(arguments);
      if (this._getBaseLine()) {
        var rxml = loadXML(g_filter_description.getBaseLine());
        this._queryResponse(rxml);
        return;
      }
      var ajax = new nowapi.GlideAjax(this.AJAX_PROCESSOR);
      ajax.addParam("sysparm_type", "query");
      ajax.addParam("sysparm_name", this.getTableName());
      ajax.addParam("sysparm_chars", this.getEncodedQuery());
      if (this.getLimit() != -1)
        ajax.addParam("sysparm_max_query", this.getLimit());
      if (this.orderByFields.length > 0)
        ajax.addParam("sysparm_orderby", this.orderByFields.join(","));
      if (this.orderByDescFields.length > 0)
        ajax.addParam("sysparm_orderby_desc", this.orderByDescFields.join(","));
      if (this.displayFields.length > 0)
        ajax.addParam("sysparm_display_fields", this.displayFields.join(","));
      ajax.getXML(this._query0.bind(this, responseFunction));
    },
    _parseArgs: function(args) {
      var responseFunction = null;
      var i = 0;
      while (i < args.length) {
        if (typeof args[i] == 'function') {
          responseFunction = args[i];
          i++;
          continue;
        }
        if (i + 1 < args.length) {
          this.conditions.push({
            'name': args[i],
            'oper': '=',
            'value': args[i + 1]
          });
          i += 2;
        } else
          i++;
      }
      return responseFunction;
    },
    _query0: function(responseFunction, response) {
      if (!response || !response.responseXML)
        return;
      this._queryResponse(response.responseXML);
      responseFunction(this);
    },
    _queryResponse: function(rxml) {
      var rows = [];
      var items = rxml.getElementsByTagName("item");
      for (var i = 0; i < items.length; i++) {
        if ((items[i].parentNode.parentNode == rxml)) {
          var grData = items[i];
          var cnodes = grData.childNodes;
          var fields = [];
          for (var z = 0; z < cnodes.length; z++) {
            var field = cnodes[z];
            var name = field.nodeName;
            var value = getTextValue(field);
            if (!value)
              value = "";
            fields.push({
              'name': name,
              'value': value
            });
          }
          if (cnodes.length && cnodes.length > 0)
            rows.push(fields);
        }
      }
      this.setRows(rows);
    },
    setRows: function(r) {
      this.rows = r;
    },
    setTableName: function(tableName) {
      this.tableName = tableName;
    },
    update: function(responseFunction) {
      var ajax = new nowapi.GlideAjax(this.AJAX_PROCESSOR);
      ajax.addParam("sysparm_type", "save_list");
      ajax.addParam("sysparm_name", this.getTableName());
      ajax.addParam("sysparm_chars", this._getXMLSerialized());
      if (typeof responseFunction != 'function')
        responseFunction = doNothing;
      ajax.getXML(this._update0.bind(this, responseFunction));
    },
    _update0: function(responseFunction, response) {
      if (!response || !response.responseXML)
        return;
      var answer = this._updateResponse(response.responseXML);
      responseFunction(this, answer);
    },
    _updateResponse: function(rxml) {
      var items = rxml.getElementsByTagName("item");
      if (items && items.length > 0)
        return getTextValue(items[0]);
    },
    setLimit: function(maxQuery) {
      this.maxQuerySize = maxQuery;
    },
    getLimit: function() {
      return this.maxQuerySize;
    },
    _getXMLSerialized: function() {
      var xml = loadXML("<record_update/>");
      var root = xml.documentElement;
      if (this.sys_id)
        root.setAttribute("id", this.sys_id);
      root.setAttribute('table', this.getTableName());
      var item = xml.createElement(this.getTableName());
      root.appendChild(item);
      for (var xname in this) {
        if (this.ignoreNames[xname])
          continue;
        var f = xml.createElement(xname);
        item.appendChild(f);
        var v = this[xname];
        if (!v)
          v = "NULL";
        var t = xml.createTextNode(v);
        f.appendChild(t);
      }
      return getXMLString(xml);
    },
    _getBaseLine: function() {
      return window.g_filter_description &&
        typeof g_filter_description.getBaseLine() != 'undefined' &&
        this.getTableName() == 'cmdb_baseline' &&
        this.getEncodedQuery() &&
        this.orderByFields.length < 1 &&
        this.displayFields.length < 1;
    },
    z: null
  };
  GlideRecord.prototype = objDef;

  function getTextValue(node) {
    if (node.textContent)
      return node.textContent;
    var firstNode = node.childNodes[0];
    if (!firstNode)
      return null;
    if (firstNode.data)
      return firstNode.data;
    return firstNode.nodeValue;
  }

  function loadXML(r) {
    var xml = r.responseXML;
    if (typeof xml != 'undefined')
      return xml;
    var dom = null;
    try {
      dom = new DOMParser().parseFromString(r, 'text/xml');
    } catch (e) {}
    return dom;
  }

  function doNothing() {}

  function getXMLString(node) {
    var xml = "???";
    if (node.xml) {
      xml = node.xml;
    } else if (window.XMLSerializer) {
      xml = (new XMLSerializer()).serializeToString(node);
    }
    return xml;
  }
  exports.GlideRecord = window.GlideRecord || GlideRecord;
})(nowapi);;
/*! RESOURCE: /scripts/classes/nowapi/i18n.js */
(function(exports, angular) {
  "use strict";
  var i18nService;
  angular.injector(['ng', 'sn.common.i18n']).invoke(function(i18n) {
    i18nService = i18n;
  });
  exports.g_i18n = {
    getMessage: i18nService.getMessage,
    format: i18nService.format,
    getMessages: i18nService.getMessages
  };
})(window.nowapi, angular);;
/*! RESOURCE: /scripts/scoped_object_generators.js */
function ScopedGlideAjaxGenerator(scope) {
  var ScopedGlideAjax = function() {
    ScopedGlideAjax.prototype.initialize.apply(this, arguments);
  };
  ScopedGlideAjax.prototype = classExtendForScope({}, window.GlideAjax.prototype, {
    scope: scope,
    initialize: function(endpoint, url) {
      GlideAjax.prototype.initialize.call(this, endpoint, url);
      this.setScope(this.scope);
    },
    getXMLWait: function() {
      var err_options = {
        text: "Access to getXMLWait is not available in scoped applications.",
        type: "system",
        attributes: {
          type: "error"
        }
      };
      notifyFromWrappedScopedObject(err_options);
    },
    setScope: function(newScope) {
      if (newScope != this.scope && newScope !== "global") {
        var err_options = {
          text: "Scoped applications cannot impersonate other scopes.",
          type: "system",
          attributes: {
            type: "error"
          }
        };
        notifyFromWrappedScopedObject(err_options);
        return;
      }
      return GlideAjax.prototype.setScope.call(this, scope);
    },
    addParam: function(param, value) {
      if (param == "sysparm_scope" && value != this.scope && value != "global") {
        var err_options = {
          text: "Scoped applications cannot impersonate other scopes.",
          type: "system",
          attributes: {
            type: "error"
          }
        };
        notifyFromWrappedScopedObject(err_options);
        return;
      }
      return window.GlideAjax.prototype.addParam.call(this, param, value);
    }
  })
  return ScopedGlideAjax;
}

function ScopedGFormGenerator(scope) {
  var ScopedGForm = function() {};
  if ("undefined" == typeof g_form) {
    return ScopedGForm;
  }
  ScopedGForm.prototype = g_form;
  var scoped_g_form = new ScopedGForm();

  function inScope(fieldName) {
    try {
      if (scope == g_form.getGlideUIElement(fieldName).getScope())
        return true;
      if (g_form.getGlideUIElement(fieldName).isInherited && (scope == g_form.getScope()))
        return true;
    } catch (e) {
      jslog(e);
    }
    return false;
  }

  function _noCallbackError(displayName, fieldName) {
    var text = displayName + " for " + fieldName + " not allowed: missing callback function as parameter";
    var err_options = {
      text: text,
      type: "system",
      attributes: {
        type: "error"
      }
    }
    notifyFromWrappedScopedObject(err_options);
  }

  function _showScopeError(displayName, fieldName, value) {
    var text = displayName + " " + value + " not set on field " + fieldName + ": cross-scope access denied.";
    var err_options = {
      text: text,
      type: "system",
      attributes: {
        type: "error"
      }
    }
    opticsLog(scoped_g_form.getTableName(), fieldName, text);
    notifyFromWrappedScopedObject(err_options);
  }

  function validField(fieldName) {
    fieldName = g_form.removeCurrentPrefix(fieldName);
    return g_form.hasField(fieldName) || g_form.getPrefixHandler(fieldName);
  }
  scoped_g_form.setReadOnly = function(fieldName, disabled) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setReadOnly(fieldName, disabled);
    _showScopeError("ReadOnly", fieldName, disabled);
  }
  scoped_g_form.setReadonly = function(fieldName, disabled) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setReadonly(fieldName, disabled);
    _showScopeError("ReadOnly", fieldName, disabled);
  }
  scoped_g_form.setMandatory = function(fieldName, mandatory) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setMandatory(fieldName, mandatory);
    _showScopeError("Mandatory", fieldName, mandatory);
  }
  scoped_g_form.setDisplay = function(fieldName, display) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setDisplay(fieldName, display);
    _showScopeError("Display", fieldName, display);
  }
  scoped_g_form.setDisabled = function(fieldName, disabled) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setDisabled(fieldName, disabled);
    _showScopeError("Disabled", fieldName, disabled);
  }
  scoped_g_form.getReference = function(fieldName, callBack) {
    if (!validField(fieldName))
      return;
    if ('function' == typeof callBack)
      return g_form.getReference(fieldName, callBack);
    _noCallbackError("getReference", fieldName, false);
  }
  return scoped_g_form;
}

function ScopedGlideDialogWindowGenerator(scope) {
  var extendFrom = window.GlideDialogWindow ? GlideDialogWindow.prototype : GlideModal.prototype;
  var ScopedGlideDialogWindow = function() {
    ScopedGlideDialogWindow.prototype.initialize.apply(this, arguments);
  };
  ScopedGlideDialogWindow.prototype = classExtendForScope({}, extendFrom, {
    scope: scope,
    initialize: function(id, readOnly, width, height) {
      extendFrom.initialize.call(this, id, readOnly, width, height);
      this.setScope(this.scope);
    }
  });
  return ScopedGlideDialogWindow;
}

function classExtendForScope(extended, defaults, options) {
  if (window.jQuery)
    return jQuery.extend(extended, defaults, options);
  var prop;
  for (prop in defaults) {
    extended[prop] = defaults[prop];
  }
  for (prop in options) {
    extended[prop] = options[prop];
  }
  return extended;
}

function notifyFromWrappedScopedObject(msgObject) {
  jslog(msgObject.text);
  if (typeof nowapi !== 'undefined' && nowapi && typeof nowapi.hasOwnProperty('g_notification'))
    nowapi.g_notification.show(msgObject.attributes.type, msgObject.text);
  else if (typeof GlideUI != 'undefined')
    GlideUI.get().display(new GlideUINotification(msgObject));
};
/*! RESOURCE: /scripts/classes/nowapi/scoped_object_bridge.js */
window.nowapi.ScopedGlideAjaxGenerator = ScopedGlideAjaxGenerator;
window.nowapi.ScopedGForm = ScopedGFormGenerator;
window.nowapi.ScopedGlideDialogWindowGenerator = ScopedGlideDialogWindowGenerator;;;