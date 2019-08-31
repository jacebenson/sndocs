/*! RESOURCE: /scripts/doctype/GwtNavFilterDoctype.js */
var GwtNavFilter = {
  cachedElements: {},
  clearText: function() {
    this.text = '';
  },
  filter: function(text, favoritesOnly) {
    if (!text && favoritesOnly) {
      this._clearFilter();
      CustomEvent.fire('favorites.show');
      return;
    }
    this.favoritesOnly = favoritesOnly;
    this.timers = {};
    this.m = text;
    var sw = new StopWatch();
    if (!this.text)
      this._saveUserPreferences();
    this.text = this._cleanupText(text);
    if (!this.text)
      this._clearFilter();
    else
      this._filter();
    this.timers['total'] = sw.getTime();
  },
  _cleanupText: function(text) {
    var answer = text.toLowerCase();
    if (answer == "**")
      return "";
    if (answer.indexOf("*") == 0)
      answer = answer.substring(1);
    return answer;
  },
  _clearFilter: function() {
    this._showAppsCollapsed();
    this._restoreUserPreferences();
  },
  _filter: function() {
    this.displayed = {};
    var sw = new StopWatch();
    this._matchApps();
    this.timers['matchApps'] = sw.getTime();
    sw = new StopWatch();
    this._matchModules();
    this.timers['matchModules'] = sw.getTime();
  },
  _matchApps: function() {
    var apps = this._getApps();
    for (var id in apps) {
      if (this._textMatch(apps[id]) && !this.favoritesOnly)
        this._showAppAndModules(id);
      else
        this._hideAppAndModules(id);
    }
  },
  _matchModules: function() {
    var modules = this._getModules();
    var category = '';
    var categoryparent = '';
    this.timers['module count'] = modules.length;
    for (var i = 0, n = modules.length; i < n; i++) {
      var module = modules[i];
      var id = module.getAttribute('moduleid');
      if (this.displayed[id])
        continue;
      if (this.favoritesOnly) {
        if ($j(module).find(".icon-star").length == 0)
          continue;
      }
      var label = module.getAttribute('modulename');
      var type = module.getAttribute('moduletype');
      var parent = module.getAttribute('moduleparent');
      if (categoryparent != parent) {
        category = '';
        categoryparent = parent;
      }
      if (type == 'SEPARATOR') {
        var categoryElem = this._findByClass(module.childNodes, 'nav_menu_header');
        if (categoryElem) {
          category = this._getInnerText(categoryElem);
          if (this.favoritesOnly)
            module.style.display = '';
        }
      } else if (this._textMatch(label) || this._textMatch(category)) {
        this._showModule(module);
      }
    }
  },
  _findByClass: function(nodes, classname) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes.item(i);
      if (node.className.indexOf(classname) != -1)
        return node;
    }
    return null;
  },
  _textMatch: function(label) {
    return label && label.toLowerCase().indexOf(this.text) > -1;
  },
  _getApps: function() {
    if (this.appList)
      return this.appList;
    var sw = new StopWatch();
    this.appList = new Object();
    var apps = document.getElementsByTagName("label");
    for (var i = 0, n = apps.length; i != n; i++) {
      var app = apps[i];
      var appid = app.getAttribute('for');
      if (!appid)
        continue;
      if (app.id == "div.perspectives")
        continue;
      var t = this._getInnerText(app);
      this.appList[appid] = t;
    }
    this.timers["getApps"] = sw.getTime();
    return this.appList;
  },
  _getModules: function() {
    if (!this.modList) {
      var sw = new StopWatch();
      this.modList = [];
      var rows = document.getElementsByTagName("li");
      for (var i = 0, n = rows.length; i != n; i++) {
        var row = rows[i];
        var parent = row.getAttribute('moduleparent');
        if (!parent || (parent == 'perspectives'))
          continue;
        this.modList.push(row);
      }
      this.timers['getModules'] = sw.getTime();
    }
    return this.modList;
  },
  _showAppsCollapsed: function() {
    var apps = this._getApps();
    for (var id in apps) {
      var appDiv = this._getCachedElement('div.' + id);
      if (!appDiv)
        continue;
      showObject(appDiv);
    }
    var rows = document.getElementsByTagName("li");
    for (var i = 0; i < rows.length; i++) {
      var module = rows[i];
      module.style.display = '';
      if (module.getAttribute('moduletype') == 'SEPARATOR') {
        var id = module.getAttribute('moduleid');
        var tr = this._getCachedElement("children." + id);
        if (tr)
          tr.style.display = '';
        var span = this._getCachedElement(id);
        if (span) {
          span.style.height = 'auto';
          showObject(span);
          var img = this._getCachedElement('img.' + id);
          if (!img)
            continue;
          img.src = "images/arrow_reveal.gifx";
        }
      }
    }
  },
  _showModulesForApp: function(span, displayed) {
    var trs = span.getElementsByTagName("li");
    for (var i = 0, n = trs.length; i != n; i++) {
      trs[i].style.display = '';
      var id = trs[i].getAttribute('moduleid');
      if (displayed && id)
        this.displayed[id] = 1;
    }
  },
  _saveUserPreferences: function() {
    var sw = new StopWatch();
    this.expandedSeparators = {};
    var apps = this._getApps();
    this.expandedApps = {};
    for (var id in apps) {
      var span = this._getCachedElement('app_' + id);
      if ($j(span).height())
        this.expandedApps[id] = 1;
    }
    var modules = this._getModules();
    for (var i = 0, n = modules.length; i < n; i++) {
      var module = modules[i];
      var type = module.getAttribute('moduletype');
      if (type != 'SEPARATOR')
        continue;
      var id = module.getAttribute('moduleid');
      var tr = module.getElementsByTagName('ul')[0];
      if (!tr)
        continue;
      if ($j(tr).css('display') != 'none')
        this.expandedSeparators[id] = 1;
    }
    this.timers["saveUserPreferences"] = sw.getTime();
  },
  _getCachedElement: function(id) {
    var element = this.cachedElements[id];
    if (element)
      return element;
    element = gel(id);
    this.cachedElements[id] = element;
    return element;
  },
  _restoreUserPreferences: function() {
    var apps = this._getApps();
    for (var id in apps) {
      var div = this._getCachedElement('div.' + id);
      var input = this._getCachedElement(id);
      if (this.expandedApps[id]) {
        input.checked = true
      } else {
        input.checked = false;
      }
      $j(input).trigger('change');
    }
    var colImg = isTextDirectionRTL() ? "images/arrow_rtl_hide.gifx" : "images/arrow_hide.gifx";
    var expImg = "images/arrow_reveal.gifx";
    var modules = this._getModules();
    for (var i = 0, n = modules.length; i < n; i++) {
      var module = modules[i];
      var id = module.getAttribute('moduleid');
      var type = module.getAttribute('moduletype');
      if (type != 'SEPARATOR')
        continue;
      var tr = this._getCachedElement("children." + id);
      var span = this._getCachedElement(id);
      var img = this._getCachedElement('img.' + id);
      if (this.expandedSeparators[id]) {
        if (tr)
          tr.style.display = '';
        if (span) {
          showObject(span);
          span.style.height = 'auto';
        }
        if (img)
          img.src = expImg;
      } else {
        if (tr)
          tr.style.display = '';
        if (span) {
          hideObject(span);
          span.style.height = 'auto';
        }
        if (img)
          img.src = colImg;
      }
    }
  },
  _showAppAndModules: function(id) {
    this._showApp(id);
    var span = this._getCachedElement('app_' + id);
    this._showModulesForApp(span, true);
  },
  _showApp: function(id) {
    if (this.displayed[id])
      return;
    var app = this._getCachedElement('div.' + id);
    if (!app)
      return;
    app.style.display = '';
    this.displayed[id] = 1;
    var checkbox = app.nextSibling;
    checkbox.checked = true;
    $j(checkbox).trigger('change');
  },
  _hideAppAndModules: function(id) {
    var e = this._getCachedElement('div.' + id);
    if (!e)
      return;
    e.style.display = "none";
    e = this._getCachedElement(id);
    e.checked = false;
    $j(e).trigger('change');
    var app = this._getCachedElement('app_' + id);
    $j(app).find('li').each(function(index, elem) {
      elem.style.display = 'none';
    });
  },
  _showModule: function(module) {
    var id = module.getAttribute('moduleid');
    if (id) {
      if (this.displayed[id])
        return;
      this.displayed[id] = 1;
    }
    module.style.display = '';
    if (module.getAttribute('moduletype') == 'SEPARATOR') {
      var tr = this._getCachedElement("children." + id);
      if (tr)
        tr.style.display = '';
      var span = this._getCachedElement('app_' + id);
      showObject(span);
      span.style.height = 'auto';
      span.setAttribute('data-open', 'true');
      var img = this._getCachedElement('img_' + id);
      if (img)
        img.src = img.getAttribute('data-expanded');
    }
    var container = module.getAttribute('modulecontainer');
    if (container) {
      var row = this._getCachedElement('module.' + container);
      this._showModule(row);
      return;
    }
    var app = module.getAttribute('moduleparent');
    if (app)
      this._showApp(app);
  },
  _getInnerText: function(node) {
    return node.textContent || node.innerText;
  },
  type: 'GwtNavFilter'
};