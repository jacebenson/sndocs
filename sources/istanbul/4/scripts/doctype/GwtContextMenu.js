/*! RESOURCE: /scripts/doctype/GwtContextMenu.js */
var gActiveContext;
var contextMenus = new Object();
var shortcuts = new Object();
var GwtContextMenu = Class.create({
  SUBMENU_INDICATOR: "<img src='images/context_arrow.gifx' class='context_item_menu_img' alt='Add' />",
  initialize: function(id, useBodyAsParent) {
    this.timeout = null;
    this.properties = new Object();
    this.setID(id);
    this.getMenu();
    this.onshow = null;
    this.onhide = null;
    this.beforehide = null;
    this.docRoot = this._getDocRoot();
    this.hasItems = false;
    this.hideOnlySelf = false;
    this.trackSelected = false;
    if (typeof useBodyAsParent == "undefined")
      useBodyAsParent = false;
    this._getParentElement(useBodyAsParent);
  },
  isEmpty: function() {
    return !this.hasItems;
  },
  _getParentElement: function(useBodyAsParent) {
    if (useBodyAsParent) {
      this.parentElement = document.body;
      return;
    }
    this.parentElement = getFormContentParent();
  },
  _getDocRoot: function() {
    var docRoot = window.location.protocol + "//" + window.location.host;
    if (window.location.pathname.indexOf("/") > -1) {
      var fp = window.location.pathname;
      fp = fp.substring(0, fp.lastIndexOf("/"));
      if (fp.substring(0, 1).indexOf("/") != -1)
        docRoot = docRoot + fp;
      else
        docRoot = docRoot + "/" + fp;
    }
    docRoot += "/";
    return docRoot;
  },
  add: function(label, id, keys) {
    this.hasItems = true;
    var m = this.getMenu();
    var d = document.createElement("div");
    d.setAttribute("item_id", id);
    d.className = "context_item";
    d.isMenuItem = true;
    var l = !keys ? label : (label + ' (' + keys + ')');
    d.innerHTML = l;
    if (keys)
      d.setAttribute("data-label", label);
    m.appendChild(d);
    return d;
  },
  addHref: function(label, href, img, title, id, keys) {
    keys = this.addKeyShortcut(keys, href);
    var d = this.add(label, id, keys);
    d.setAttribute("href", href);
    if (title && title != null)
      d.setAttribute("title", title);
    this.setImage(d, img);
    return d;
  },
  addFunc: function(label, func, id) {
    var d = this.add(label, id);
    d.setAttribute("func_set", "true");
    d.func = func;
    return d;
  },
  addURL: function(label, url, target, id) {
    var d = this.add(label, id);
    url = this._updateURL(d, label, url);
    d.setAttribute("url", url);
    if (target)
      d.setAttribute("target", target);
    return d;
  },
  addHrefNoSort: function(label, href, id) {
    var item = this.addHref(label, href, null, null, id);
    item.setAttribute("not_sortable", "true");
    return item;
  },
  addHrefNoFilter: function(label, href, id) {
    var item = this.addHref(label, href, null, null, id);
    item.setAttribute("not_filterable", "true");
    return item;
  },
  addMenu: function(label, menu, id) {
    var item = this.add(label + this.SUBMENU_INDICATOR, id);
    item.setAttribute("label", "true");
    menu.setParent(this);
    item.subMenu = menu;
    return item;
  },
  addAction: function(label, action, id) {
    return this.addHref(label, "contextAction('" + this.getTableName() + "', '" + action + "')", null, null, id);
  },
  addConfirmedAction: function(label, action, id) {
    return this.addHref(label, "contextConfirm('" + this.getTableName() + "', '" + action + "')", null, null, id);
  },
  addLine: function() {
    this.hasItems = true;
    var m = this.getMenu();
    var d = document.createElement("div");
    d.className = "context_item_hr";
    d.isMenuItem = true;
    d.disabled = "disabled";
    m.appendChild(d);
    return d;
  },
  addLabel: function(label, id) {
    var m = this.getMenu();
    var d = document.createElement("div");
    d.setAttribute("item_id", id);
    d.className = "context_item";
    d.isMenuItem = true;
    d.innerHTML = label;
    d.disabled = "disabled";
    m.appendChild(d);
    return d;
  },
  addKeyShortcut: function(keys, href) {
    var topWindow = getTopWindow();
    var keyboardEnabled = topWindow.com && topWindow.com.glide && topWindow.com.glide.ui && topWindow.com.glide.ui.keyboard;
    if (!keyboardEnabled)
      return null;
    if (!keys)
      return keys;
    if (shortcuts[keys])
      return keys;
    shortcuts[keys] = {};
    var callback = function(e) {
      var start = e.data.href.indexOf('javascript:') == 0 ? 11 : 0;
      var startParen = e.data.href.indexOf('(');
      var functionName = startParen > start ? e.data.href.substring(start, startParen) : {};
      var func = eval(functionName);
      if (typeof func == 'function')
        eval(e.data.href);
      else
        document.location.href = e.data.href;
    };
    addLoadEvent(function() {
      var keyboard = getTopWindow().com.glide.ui.keyboard;
      var isMainFrame = window.frameElement.id == keyboard.mainFrame;
      var isFormFrame = window.frameElement.id == keyboard.formFrame;
      if (isMainFrame)
        shortcuts[keys] = keyboard.bind(keys, callback, {
          href: href
        }).global(keyboard.formFrame);
      else if (isFormFrame)
        shortcuts[keys] = keyboard.bind(keys, callback, {
          href: href
        }).formFrame();
      else
        shortcuts[keys] = null;
    });
    return keys;
  },
  getItem: function(itemId) {
    var items = this.getMenu().getElementsByTagName("div");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.getAttribute("item_id") == itemId)
        return item;
    }
    return null;
  },
  setImage: function(item, img) {
    if (item && img) {
      item.style.backgroundImage = "url(" + this.docRoot + img + ")";
      item.style.backgroundRepeat = "no-repeat";
    }
  },
  setChecked: function(item) {
    if (item)
      this.setImage(item, "images/checked.pngx");
  },
  clearImage: function(item) {
    if (item) {
      item.style.backgroundImage = "";
      item.style.backgroundRepeat = "";
    }
  },
  setDisabled: function(item) {
    if (!item)
      return;
    this._dullItem(item);
  },
  setEnabled: function(item) {
    if (!item)
      return;
    this._undullItem(item);
  },
  setHidden: function(item) {
    if (!item)
      return;
    this._hideItem(item);
  },
  setVisible: function(item) {
    if (!item)
      return;
    this._showItem(item);
  },
  setLabel: function(item, label) {
    if (item)
      item.innerHTML = label;
  },
  setHideOnlySelf: function(hideSelf) {
    this.hideOnlySelf = hideSelf;
  },
  clearSelected: function() {
    var items = this.getMenu().getElementsByTagName("div");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.isMenuItem)
        this.clearImage(item);
    }
  },
  clear: function() {
    var m = this.getMenu();
    clearNodes(m);
    this._setMinWidth();
    this.hasItems = false;
  },
  destroy: function() {
    this.parentElement = null;
    this.menu.context = null;
    this.menu.onmouseover = null;
    this.menu.onmouseout = null;
    this.menu.onclick = null;
    if (isMSIE)
      this.menu.outerHTML = null;
    this.parentMenu = null;
    this.onshow = null;
    this.onhide = null;
    this.properties = null;
    this.timeout = null;
    this.menu = null;
  },
  display: function(e) {
    if (!this.getParent())
      CustomEvent.fireAll('body_clicked', null);
    menuSort = true;
    this._dullMenu();
    this._toggleMenuItems("not_sortable", this.getProperty('sortable'));
    this._toggleMenuItems("not_filterable", this.getProperty('filterable'));
    this.setFiringObject(this._getElement(e));
    e = this._getRealEvent(e);
    var menu = this.getMenu();
    if (this._isEmpty(menu))
      return;
    menu.style.left = "0";
    menu.style.top = "0";
    this.parentElement.appendChild(menu);
    if (this.getProperty("top") > 0 && ((this.getProperty("left") > 0) || (this.getProperty("right") > 0))) {
      menu.style.visibility = 'hidden';
      menu.style.display = 'block';
      this.moveMenuToXY(e, this.getProperty("left"), this.getProperty("top"), this.getProperty("right"));
    } else if (this.getParent()) {
      var x = this._getElement(e);
      menu.style.visibility = 'hidden';
      menu.style.display = 'block';
      this.moveMenuToParent(e, x);
    } else {
      var x = this._getElement(e);
      menu.style.visibility = 'hidden';
      menu.style.display = 'block';
      this.moveMenuToCursor(e);
    }
    gActiveContext = this;
    showObject(menu);
  },
  hide: function() {
    gActiveContext = "";
    hideObject(this.getMenu());
    if (this.getMenu().parentNode)
      this.getMenu().parentNode.removeChild(this.getMenu());
    if (this.onhide)
      this.onhide();
    CustomEvent.fire('refresh.event');
  },
  hideAll: function() {
    var m = this;
    while (m) {
      m.hide();
      m = m.getParent();
    }
  },
  execute: function(e) {
    var x = this._getElement(e);
    if (x.isMenuItem && !x.disabled) {
      if (x.getAttribute("label") == "true") {
        this._getRealEvent(e).cancelBubble = true;
        return;
      }
      if (x.getAttribute("target")) {
        window.open(x.getAttribute("url"), x.getAttribute("target"));
      } else if (x.getAttribute("href")) {
        var expression = x.getAttribute("href");
        gActiveContext = this;
        eval(expression);
      } else if (x.getAttribute("func_set") == "true") {
        x.func();
      } else {
        window.location = x.getAttribute("url");
      }
      if (this.trackSelected) {
        this.clearSelected();
        this.setChecked(x);
      }
    }
    if (x.subMenu)
      x.subMenu.hideAll();
    else
      this.hideAll();
    return false;
  },
  menuLowLight: function(e) {
    var x = this._getElement(e);
    this._handleTimeout(false, x);
    if (!x.isMenuItem)
      return;
    if (!x.subMenu || x.subMenu.getMenu().style.display == 'none')
      this._disableItem(x);
    window.status = '';
    CustomEvent.fire('refresh.event');
  },
  menuHighLight: function(e) {
    var x = this._getElement(e);
    this._handleTimeout(true, x);
    if (!x.isMenuItem)
      return;
    this._hideAllSubs(x.parentNode);
    this._enableItem(x);
    if (x.subMenu) {
      x.subMenu.setParent(this);
      x.subMenu.display(e);
    }
  },
  moveMenuToXY: function(e, left, top, right) {
    var menu = this.getMenu();
    if (right)
      left = right - menu.offsetWidth;
    var offsetTop = window.pageYOffset + top;
    var offsetLeft = window.pageXOffset + left;
    this.moveMenu(top, left, 0, 0, offsetTop, offsetLeft);
  },
  moveMenuToCursor: function(e) {
    var offsetTop = 0;
    var offsetLeft = 0;
    if (isTouchDevice) {
      offsetTop = e.pageY;
      offsetLeft = e.pageX;
    } else {
      offsetTop = e.clientY;
      offsetLeft = e.clientX;
    }
    this.moveMenu(e.clientY, e.clientX, 0, 0, offsetTop, offsetLeft);
  },
  moveMenuToParent: function(e, firingObject) {
    var parent = this.getParent().getMenu();
    var offsetTop = grabOffsetTop(firingObject) - parent.scrollTop;
    var borderLeftWidth = parseInt($j(this.getParent().getMenu()).css('border-right-width'), 10);
    var offsetLeft = grabOffsetLeft(parent) - borderLeftWidth;
    this.moveMenu(offsetTop, offsetLeft, firingObject.offsetHeight, parent.offsetWidth, offsetTop, offsetLeft);
  },
  moveMenu: function(top, left, height, width, offsetTop, offsetLeft) {
    var menu = this.getMenu();
    menu.style.overflowY = "visible";
    menu.setAttribute('gsft_has_scroll', false);
    if (menu.getAttribute('gsft_width'))
      menu.style.width = menu.getAttribute('gsft_width') + "px";
    if (menu.getAttribute('gsft_height'))
      menu.style.height = menu.getAttribute('gsft_height') + "px";
    var leftPos;
    var viewport = new WindowSize();
    if ((left + width + menu.offsetWidth) > viewport.width)
      leftPos = offsetLeft - menu.offsetWidth;
    else
      leftPos = offsetLeft + width;
    menu.style.left = leftPos + "px";
    var scrollOffsets = this._getScrollOffsets(this.parentElement);
    var scrollTop = scrollOffsets.top;
    var direction = 'down';
    var clip = 0;
    if ((top + menu.offsetHeight) > viewport.height) {
      var bottomClip = menu.offsetHeight - (viewport.height - top);
      var topClip = menu.offsetHeight - top + height;
      if (topClip < bottomClip) {
        direction = 'up';
        clip = topClip;
      } else
        clip = bottomClip;
    }
    var topPos;
    if (direction == 'up') {
      var mHeight = menu.offsetHeight;
      var bottomEdge = offsetTop + height;
      topPos = (bottomEdge > mHeight) ? (bottomEdge - mHeight) : 0;
    } else
      topPos = offsetTop;
    if ((topPos - scrollTop + menu.offsetHeight) > viewport.height)
      clip = (topPos - scrollTop + menu.offsetHeight) - viewport.height;
    menu.style.top = topPos + "px";
    if (clip > 0) {
      if (!menu.getAttribute('gsft_width')) {
        menu.setAttribute('gsft_width', menu.offsetWidth);
        menu.setAttribute('gsft_height', menu.offsetHeight);
      }
      menu.setAttribute('gsft_has_scroll', true);
      menu.style.overflowY = "auto";
      var w = menu.offsetWidth + 18;
      menu.style.width = w + "px";
      var h = menu.offsetHeight - clip - 4;
      menu.style.height = h + "px";
    }
  },
  _getScrollOffsets: function(e) {
    var offsets = {};
    if (e.nodeName.toUpperCase() == "BODY") {
      offsets.top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      offsets.left = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
    } else {
      offsets.top = e.scrollTop;
      offsets.left = e.scrollLeft;
    }
    return offsets;
  },
  getFiringObject: function() {
    return this.eventObject;
  },
  getID: function() {
    return this.id;
  },
  getMenu: function() {
    if (!this.menu) {
      this.menu = contextMenus[this.getID()];
      if (!this.menu)
        this._createMenu();
      this._setMenuAttrs();
      this._setMinWidth();
    }
    return this.menu;
  },
  getParent: function() {
    return this.parentMenu;
  },
  getProperty: function(c) {
    if (this.properties)
      return this.properties[c];
    else
      return "";
  },
  getTableName: function() {
    return this.tableName;
  },
  setFiringObject: function(e) {
    this.eventObject = e;
  },
  setID: function(id) {
    this.id = id;
  },
  setOnShow: function(onshow) {
    this.onshow = onshow;
  },
  setOnHide: function(oh) {
    this.onhide = oh;
  },
  setBeforeHide: function(beforeHide) {
    this.beforehide = beforeHide;
  },
  setParent: function(m) {
    this.parentMenu = m;
    this.parentElement = m.parentElement;
  },
  setProperty: function(c, v) {
    this.properties[c] = v;
  },
  setTableName: function(name) {
    this.tableName = name;
  },
  setTimeout: function(t) {
    this.timeout = t;
  },
  setTrackSelected: function(flag) {
    this.trackSelected = flag;
  },
  _createMenu: function() {
    this.menu = document.createElement("div");
    this.menu.name = this.menu.id = this.getID();
    contextMenus[this.getID()] = this.menu;
  },
  _disableItem: function(item) {
    if (item && !item.disabled) {
      removeClassName(item, "context_menu_hover");
    }
  },
  _dullMenu: function() {
    var items = this.getMenu().childNodes;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      this._disableItem(item);
    }
  },
  _enableItem: function(item) {
    if (item && !item.disabled) {
      addClassName(item, "context_menu_hover");
    }
  },
  _getElement: function(e) {
    var x = e.target;
    try {
      if (!x.isMenuItem && x.parentNode.isMenuItem)
        x = x.parentNode;
    } catch (err) {}
    return x;
  },
  _getRealEvent: function(e) {
    return e;
  },
  _handleTimeout: function(lght, firingObject) {
    if (this.getProperty("timeout") > 0) {
      if (lght) {
        clearTimeout(this.timeout);
      } else {
        if (!firingObject.subMenu || firingObject.subMenu != gActiveContext)
          this.timeout = setTimeout('contextHide()', this.getProperty("timeout"));
      }
    }
  },
  _hideAllSubs: function(el) {
    var list = el.getElementsByTagName("div");
    for (var i = 0; i < list.length; i++) {
      var element = list[i];
      if (element.subMenu) {
        var subMenu = element.subMenu.getMenu();
        this._hideAllSubs(element.subMenu.getMenu());
        hideObject(subMenu);
        this._disableItem(element);
      }
    }
  },
  _setMenuAttrs: function() {
    this.menu.context = this;
    this.menu.className = "context_menu";
    this.menu.style.display = "none";
    this.menu.style.zIndex = (this.getParent() ? GwtContextMenu.zIndex + 1 : GwtContextMenu.zIndex);
    this.menu.onmouseover = this.menuHighLight.bind(this);
    this.menu.onmouseout = this.menuLowLight.bind(this);
    if ("ontouchstart" in window && (typeof FastButton != 'undefined'))
      new FastButton(this.menu, this.execute.bind(this));
    else
      this.menu.onclick = this.execute.bind(this);
  },
  _setMinWidth: function() {
    var widther = document.createElement("div");
    widther.style.width = "120px";
    widther.style.height = "1px";
    widther.style.overflow = "hidden";
    this.menu.appendChild(widther);
  },
  _toggleMenuItems: function(attr, enabled) {
    var items = this.getMenu().childNodes;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.getAttribute(attr) == "true") {
        if (enabled) {
          this._undullItem(item);
        } else {
          this._dullItem(item);
        }
      }
    }
  },
  _dullItem: function(item) {
    item.disabled = "disabled";
    item.style.color = "#cccccc";
    removeClassName(item, "context_menu_hover");
  },
  _undullItem: function(item) {
    item.disabled = "";
    item.style.color = "";
  },
  _hideItem: function(item) {
    item.style.display = 'none';
  },
  _showItem: function(item) {
    item.style.display = '';
  },
  _isEmpty: function(menu) {
    if (!menu)
      return true;
    if (!menu.firstChild)
      return true;
    return false;
  },
  _updateURL: function(d, label, url) {
    if (typeof GlideTransactionScope != 'undefined') {
      GlideTransactionScope.appendTransactionScope(function(name, value) {
        url += "&" + name + "=" + value;
      });
      return url;
    }
    if (typeof g_form != 'undefined') {
      this.dmap = this.dmap || {};
      this.dmap[label] = d;
      $(g_form.getFormElement()).observe('glidescope:initialized', function(e) {
        e.memo.gts.appendTransactionScope(function(name, value) {
          var _d = this.dmap[label];
          var _url = _d.getAttribute("url");
          _url += "&" + name + "=" + value;
          _d.setAttribute("url", _url);
        }.bind(this));
      }.bind(this));
    }
    return url;
  },
  z: function() {}
});
GwtContextMenu.zIndex = 1100;

function displayContextMenu(e, name, filterable) {
  if (!getMenuByName(name))
    return;
  var contextMenu = getMenuByName(name).context;
  contextMenu.setProperty('sortable', true);
  contextMenu.setProperty('filterable', filterable);
  contextMenu.display(e);
}

function contextShow(e, tableName, timeoutValue, ttop, lleft, rright) {
  var frameWindow = null;
  try {
    frameWindow = window.frameElement;
    if (frameWindow && frameWindow.id == "dialog_frame" && frameWindow.noContext == true)
      return true;
  } catch (err) {}
  if (shouldSkipContextMenu(e))
    return true;
  e = getRealEvent(e);
  menuTable = tableName;
  var name = tableName;
  if (name && name.substring(0, 8) != "context_")
    name = "context_" + name;
  if (document.readyState && document.readyState != "complete" && document.readyState != "interactive" && typeof window.g_hasCompleted == "undefined") {
    jslog("Ignored context menu show for " + name + " because document was not ready");
    return false;
  }
  window.g_hasCompleted = true;
  if (getMenuByName(name)) {
    var contextMenu = getMenuByName(name).context;
    contextMenu.setProperty('timeout', timeoutValue);
    contextMenu.setProperty('top', ttop);
    contextMenu.setProperty('left', lleft);
    contextMenu.setProperty('right', rright);
    if (contextMenu.menu.style.display == "block")
      contextMenu.menu.style.display = "none";
    else
      contextMenu.display(e);
    if (contextMenu.onshow)
      contextMenu.onshow();
  }
  return false;
}

function contextQuestionLabel(e, sys_id) {
  if (shouldSkipContextMenu(e))
    return true;
  e = getRealEvent(e);
  var name = "context_question_label";
  menuTable = "not_important";
  menuField = "not_important";
  rowSysId = sys_id;
  if (getMenuByName(name)) {
    var contextMenu = getMenuByName(name).context;
    contextMenu.setProperty('sysparm_sys_id', sys_id);
    contextMenu.display(e);
  }
  return false;
}

function shouldSkipContextMenu(e) {
  if (e.ctrlKey && trustCtrlKeyResponse())
    return true;
  return false;
}

function trustCtrlKeyResponse() {
  return isMacintosh || !isSafari;
}

function contextTimeout(e, tableName, waitCount) {
  var name = "context_" + tableName;
  if (!getMenuByName(name))
    return;
  var contextMenu = getMenuByName(name).context;
  if (typeof waitCount == "undefined")
    waitCount = 500;
  contextMenu.setProperty("timeout", waitCount);
  var hideParam;
  if (contextMenu.hideOnlySelf == true)
    hideParam = '"' + name + '"';
  contextMenu.setTimeout(setTimeout('contextHide(' + hideParam + ')', waitCount));
}

function getMenuByName(name) {
  return contextMenus[name];
}

function getRowID(e) {
  var id = null;
  var cell = e.srcElement;
  if (cell == null)
    cell = e.target;
  var row = cell.parentNode;
  var id = row.id;
  if (id == null || id.length == 0)
    id = row.parentNode.id;
  return id;
}

function contextHide(name) {
  if (!gActiveContext)
    return;
  if (typeof name != "undefined" && gActiveContext.getID() != name)
    return;
  if (gActiveContext.beforehide) {
    if (gActiveContext.beforehide() == false)
      return;
  }
  gActiveContext.hideAll();
}

function elementAction(e, event, gcm) {
  var type = e.getAttribute("type");
  var choice = e.getAttribute("choice");
  var id = e.id;
  var fName = id.substring(id.indexOf('.') + 1);
  var tableName = fName.substring(0, fName.indexOf('.'));
  var haveAccess = $("personalizer_" + tableName);
  if (typeof(g_user) != 'undefined') {
    var count = 1;
    if (!gcm)
      gcm = addActionItems(fName, tableName, type, choice);
    if (gcm)
      return contextShow(event, gcm.getID(), -1, 0, 0);
  }
  return true;
}

function addActionItems(id, table, type, choice) {
  var jr = new GlideAjax("AJAXJellyRunner", "AJAXJellyRunner.do");
  jr.addParam('template', 'element_context.xml');
  jr.addParam('sysparm_id', id);
  jr.addParam('sysparm_table', table);
  jr.addParam('sysparm_type', type);
  jr.addParam('sysparm_choice', choice);
  jr.addParam('sysparm_contextual_security', g_form.hasAttribute('contextual_security'));
  jr.setWantRequestObject(true);
  var response = jr.getXMLWait();
  if (!response)
    return;
  var html = response.responseText;
  html.evalScripts(true);
  return gcm;
}
Event.observe(window, 'unload', clearMenus, false);
Event.observe(window, 'scroll', debounceContextScroll(100));

function debounceContextScroll(ms) {
  var timeout;
  return function() {
    if (timeout)
      clearTimeout(timeout);
    timeout = setTimeout(function() {
      contextMenuHide();
      timeout = null;
    }, ms);
  }
}

function clearMenus() {
  for (av in contextMenus) {
    if (contextMenus[av]) {
      var c = contextMenus[av].context;
      if (c) {
        c.destroy();
      }
      contextMenus[av] = null;
    }
  }
  for (var keys in shortcuts) {
    if (shortcuts[keys])
      shortcuts[keys].clear();
  }
  shortcuts = null;
};