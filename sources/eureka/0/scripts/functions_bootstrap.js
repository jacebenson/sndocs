var userAgentLowerCase = navigator.userAgent.toLowerCase();
var isMSIE = userAgentLowerCase.indexOf("msie") >= 0;
var ie5 = false;
if (isMSIE) {
  ie5 = !!(document.all && document.getElementById);
}
var isMSIE6 = userAgentLowerCase.indexOf("msie 6") >= 0;
var isMSIE7 = userAgentLowerCase.indexOf("msie 7") >= 0;
var isMSIE8 = userAgentLowerCase.indexOf("msie 8") >= 0;
var isMSIE9 = userAgentLowerCase.indexOf("msie 9") >= 0;
var isMSIE10 = userAgentLowerCase.indexOf("msie 10") >= 0;
var isMSIE11 = userAgentLowerCase.indexOf("rv:11.0") > 0;
var isChrome = userAgentLowerCase.indexOf("chrome") >= 0;
var isFirefox = userAgentLowerCase.indexOf("firefox") >= 0;
var isSafari = !isChrome && (userAgentLowerCase.indexOf("safari") >= 0);
var isMacintosh = userAgentLowerCase.indexOf("macintosh") >= 0;
var isWebKit = navigator.userAgent.indexOf("WebKit") >= 0;
var isTouchDevice = navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1;
var GJSV = 1.0;
var g_load_functions = new Array();
var g_late_load_functions = new Array();
var g_render_functions = new Array();

function addLoadEvent(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_load_functions.push(func);
}

function addLateLoadEvent(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_late_load_functions.push(func);
}

function runAfterAllLoaded() {
  if (isMSIE6)
    Event.observe(window, 'load', _runOnLoad, false);
  else
    _runAfterAllLoaded();
}

function _runOnLoad() {
  _runBeforeRender();
  _runAfterAllLoaded();
}

function _runAfterAllLoaded() {
  var sw = new StopWatch();
  jslog("runAfterAllLoaded, functions: " + g_load_functions.length);
  for (var i = 0; i != g_load_functions.length; i++) {
    var f = g_load_functions[i];
    var t = new Date().getTime();
    f.call();
    t = new Date().getTime() - t;
    if (t > 5000)
      jslog("Time: " + t + " for: [" + i + "] " + f);
  }
  jslog("late load functions: " + g_late_load_functions.length);
  for (var i = 0; i != g_late_load_functions.length; i++) {
    var f = g_late_load_functions[i];
    f.call();
  }
  window.self.loaded = true;
  sw.jslog("runAfterAllLoaded finished");
}

function _addLoadEvent(func) {
  if (self.unloadAlreadyCalled) {
    setTimeout(func, 50);
    return;
  }
  Event.observe(window, 'load', func, false);
}

function pageLoaded() {
  CustomEvent.observe("body_clicked", contextMenuHide);
  _addLoadEvent(markUnloadCalled);
  setMandatoryExplained.defer();
}

function markUnloadCalled() {
  window.self.unloadAlreadyCalled = true;
}

function contextMenuHide(e) {
  if (typeof contextHide === 'undefined')
    return;
  if (!isMSIE && e) {
    if (isTouchDevice && !isTouchRightClick(e)) {
      if (e.type == 'touchend' && $(e.target).up('.context_menu'))
        return;
      contextHide();
    } else if (isLeftClick(e)) {
      contextHide();
    }
  } else
    contextHide();
}

function addRenderEvent(func) {
  if (isRenderEventRegistered(func))
    return;
  addRenderEventToArray(func);
}

function addRenderEventToArray(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_render_functions.push(func);
}

function isRenderEventRegistered(func) {
  var s = func.toString();
  for (var i = 0; i < g_render_functions.length; i++)
    if (g_render_functions[i].toString() == s)
      return true;
  return false;
}

function addRenderEventLogged(func, name, funcname) {
  addRenderEventToArray(function() {
    CustomEvent.fire('glide_optics_inspect_put_cs_context', funcname, 'load');
    var sw = new StopWatch();
    var __rtmr = new Date();
    func();
    CustomEvent.fire('page_timing', {
      name: 'CSOL',
      child: name.substr(6),
      startTime: __rtmr,
      win: window
    });
    sw.jslog(name);
    CustomEvent.fire('glide_optics_inspect_pop_cs_context', funcname, 'load');
  });
}

function addTopRenderEvent(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_render_functions.unshift(func);
}

function runBeforeRender() {
  if (!isMSIE6)
    _runBeforeRender();
}

function _runBeforeRender() {
  jslog("runBeforeRender");
  for (var i = 0; i != g_render_functions.length; i++) {
    var f = g_render_functions[i];
    f.call();
  }
}
var g_afterPageLoadedFunctions = [];

function addAfterPageLoadedEvent(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_afterPageLoadedFunctions.push(func);
}

function runAfterPageLoadedEvents() {
  jslog("after page loaded starting");
  var sw = new StopWatch();
  for (var i = 0; i != g_afterPageLoadedFunctions.length; i++) {
    var f = g_afterPageLoadedFunctions[i];
    f.call();
  }
  sw.jslog("after page loaded complete, functions called: " + g_afterPageLoadedFunctions.length);
  g_afterPageLoadedFunctions = [];
}
addLateLoadEvent(function() {
  setTimeout(runAfterPageLoadedEvents, 30);
});

function addUnloadEvent(func) {
  Event.observe(window, 'unload', func, false);
}

function gel(id) {
  if (typeof id != 'string')
    return id;
  return document.getElementById(id);
}

function cel(name, parent) {
  var e = document.createElement(name);
  if (arguments.length > 1)
    parent.appendChild(e);
  return e;
}

function rel(id) {
  var e = gel(id);
  if (e)
    e.parentNode.removeChild(e);
}

function addChild(element) {
  getFormContentParent().appendChild(element);
}

function inner(id, data) {
  var el = gel(id);
  if (el != null)
    el.innerHTML = data;
}

function clearNodes(t) {
  if (!t)
    return;
  while (t.hasChildNodes())
    t.removeChild(t.childNodes[0]);
}

function getTopWindow() {
  var topWindow = window.self;
  try {
    while (topWindow.GJSV && topWindow != topWindow.parent && topWindow.parent.GJSV) {
      topWindow = topWindow.parent;
    }
  } catch (e) {}
  return topWindow;
}

function inFrame() {
  return getTopWindow() != window.self;
}

function getMainWindow() {
  var topWindow = getTopWindow();
  return topWindow['gsft_main'];
}

function getMainFormWindow() {
  var topWindow = getTopWindow();
  return topWindow['gsft_main_form'];
}

function getNavWindow() {
  var topWindow = getTopWindow();
  return topWindow['gsft_nav'];
}

function reloadWindow(win) {
  var href = win.location.href;
  var len = href.length;
  if (win.frames['iframe_live_feed'] && href.endsWith('#') && len > 2)
    href = href.substring(0, len - 2)
  win.location.href = href;
}

function addOnSubmitEvent(form, func, funcname) {
  if (!form)
    return;
  var oldonsubmit = form.onsubmit;
  if (typeof form.onsubmit != 'function')
    form.onsubmit = func;
  else {
    if (g_jsErrorNotify == "true") {
      form.onsubmit = function() {
        var formFuncCalled = false;
        try {
          if (oldonsubmit() == false)
            return false;
          CustomEvent.fire('glide_optics_inspect_put_cs_context', funcname, 'submit');
          formFuncCalled = true;
          var returnvalue = func();
          formFuncCalled = false;
          CustomEvent.fire('glide_optics_inspect_pop_cs_context', funcname, 'submit');
          if (returnvalue == false)
            return false;
          return true;
        } catch (ex) {
          if (formFuncCalled)
            CustomEvent.fire('glide_optics_inspect_pop_cs_context', funcname, 'load');
          formFuncError("onSubmit", func, ex);
          return false;
        }
      }
    } else {
      form.onsubmit = function() {
        if (oldonsubmit() == false)
          return false;
        if (func() == false)
          return false;
        return true;
      }
    }
  }
  form = null;
}

function formFuncError(type, func, ex) {
  var funcStr = func.toString();
  funcStr = funcStr.replace(/onSubmit[a-fA-F0-9]{32}\(/, "onSubmit(");
  var msg;
  if (g_user.hasRole("client_script_admin"))
    msg = type + " script error: " + ex.toString() + ":<br/>" + funcStr.replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
  else
    msg = "Submit canceled due to a script error - please contact your System Administrator";
  g_form.addErrorMessage(msg);
}

function hide(element) {
  var e = typeof element === "string" ? gel(element) : element;
  if (!e)
    return;
  e.style.display = 'none';
  _frameChanged();
}

function show(element) {
  var e = typeof element === "string" ? gel(element) : element;
  if (!e)
    return;
  if (e.tagName == "TR" && !ie5)
    e.style.display = 'table-row';
  else
    e.style.display = 'block';
  _frameChanged();
}

function hideObject(o, visibilityOnly) {
  if (!o)
    return;
  o.style.visibility = "hidden";
  if (!visibilityOnly)
    o.style.display = "none";
  _frameChanged();
}

function showObject(o, visibilityOnly) {
  if (!o)
    return;
  o.style.visibility = "visible";
  if (!visibilityOnly)
    o.style.display = "block";
  _frameChanged();
}

function showObjectInline(o) {
  if (!o)
    return;
  o.style.visibility = "visible";
  o.style.display = "inline";
  _frameChanged();
}

function showObjectInlineBlock(o) {
  if (!o)
    return;
  o.style.visibility = "visible";
  if (!isMSIE7)
    o.style.display = "inline-block";
  else
    o.style.display = "inline";
  o.style.zoom = 1;
  _frameChanged();
}
var msgTimerID;

function showOutputMessages(message, divname, type) {
  var span = getTopWindow().gel(divname);
  if (span != null) {
    var image = "images/info.gifx";
    var map = getMessages(["Informational Message", "Error Message"]);
    var imageAlt = map["Informational Message"];
    if (type == "error") {
      image = "images/outputmsg_error.gifx";
      imageAlt = map["Error Message"];
    }
    var html = "<table cellpadding='0' cellspacing='0' ><tr class='header'><td align='left'>" +
      "<img style='margin-right: 5px;height: 16px; width: 16px' src='" + image + "' alt = '" + imageAlt + "'/>" +
      "</td><td align='left'>" +
      "<span style='font-weight: normal; color: white;'>" + message + "</span>" +
      "</td></tr></table>";
    span.innerHTML = html;
    span.style.display = 'inline';
  }
  timeoutOutputMessages(divname);
}

function hideOutputMessages(divname) {
  var span = getTopWindow().gel(divname);
  if (span != null)
    span.style.display = 'none';
  clearTimeout(msgTimerID);
}

function timeoutOutputMessages(divname) {
  clearTimeout(msgTimerID);
  msgTimerID = setTimeout("hideOutputMessages('" + divname + "')", 5000);
}

function focusFirstElement(form) {
  try {
    var e = findFirstEditableElement(form);
    if (e) {
      Field.activate(e);
      triggerEvent(e, 'focus', true);
    }
  } catch (ex) {}
}

function findFirstEditableElement(form) {
  var tags = ['input', 'select', 'textarea'];
  var elements = form.getElementsByTagName('*');
  for (var i = 0, n = elements.length; i < n; i++) {
    var element = elements[i];
    if (element.type == 'hidden')
      continue;
    var tagName = element.tagName.toLowerCase();
    if (!tags.include(tagName))
      continue;
    element = $(element);
    if (element.type != 'hidden' &&
      !element.disabled &&
      !element.readOnly &&
      element.style.visibility != 'hidden' &&
      element.style.display != 'none' &&
      tags.include(element.tagName.toLowerCase()))
      return element;
  }
  return null;
}

function triggerEvent(element, eventType, canBubble) {
  canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
  if (element && element.disabled && eventType == "change" && element.onchange) {
    element.onchange.call(element);
    return;
  }
  if (element.fireEvent) {
    element.fireEvent('on' + eventType);
  } else {
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent(eventType, canBubble, true);
    element.dispatchEvent(evt);
  }
}
var g_form_dirty_message;

function onWindowClose() {
  if (typeof g_form != 'undefined') {
    if (!g_form.submitted && g_form.modified) {
      g_submitted = false;
      setTimeout(function() {
        CustomEvent.fireTop('glide:nav_form_dirty_cancel_stay', window);
      }, 750);
      return g_form_dirty_message;
    }
    g_form.submitted = false;
  }
}

function jslog(msg, src, dateTime) {
  if (window.console && window.console.log) {
    console.log(msg);
  }
  try {
    if (!src) {
      var path = window.self.location.pathname;
      src = path.substring(path.lastIndexOf('/') + 1);
    }
    if (window.self.opener && window != window.self.opener) {
      if (window.self.opener.jslog) {
        window.self.opener.jslog(msg, src, dateTime);
      }
    } else if (parent && parent.jslog && jslog != parent.jslog) {
      parent.jslog(msg, src, dateTime);
    }
  } catch (e) {}
}

function getXMLIsland(name) {
  var xml = gel(name);
  if (xml == null)
    return null;
  xml = "<xml>" + xml.innerHTML + "</xml>";
  xml = loadXML(xml);
  return xml;
}

function lock(me, ref, edit_id, nonedit_id, current_value_id, update_id) {
  me.style.display = "none";
  var unlock = gel(ref + '_unlock');
  unlock.style.display = "inline";
  var edit_span = gel(edit_id);
  edit_span.style.display = "none";
  var nonedit_span = gel(nonedit_id);
  nonedit_span.style.display = "inline";
  var current_value = gel(current_value_id);
  var the_value = "";
  if (current_value.options) {
    for (var i = 0; i < current_value.options.length; i++) {
      if (i > 0)
        the_value += g_glide_list_separator;
      the_value += current_value.options[i].text;
    }
  } else
    the_value = current_value.value;
  var update_element = gel(update_id);
  if (update_element.href)
    update_element.href = the_value;
  update_element.innerHTML = htmlEscape(the_value);
}

function unlock(me, ref, edit_id, nonedit_id) {
  if (me)
    me.style.display = "none";
  var unlock = gel(ref + '_lock');
  if (unlock)
    unlock.style.display = "inline";
  var edit_span = gel(edit_id);
  edit_span.style.display = "inline";
  var nonedit_span = gel(nonedit_id);
  nonedit_span.style.display = "none";
  var list_foc = gel("sys_display." + ref);
  if (list_foc) {
    try {
      list_foc.focus();
    } catch (e) {}
  }
}

function setMandatoryExplained(enforce) {
  var showexp = gel('mandatory_explained');
  if (!showexp)
    return;
  if (enforce || foundAMandatoryField())
    showexp.style.display = "inline";
  else
    showexp.style.display = "none";
}

function foundAMandatoryField() {
  var spanTags = document.getElementsByTagName('span');
  if (!spanTags)
    return false;
  for (var c = 0, n = spanTags.length; c != n; ++c) {
    var spanTag = spanTags[c];
    var id = spanTag.id;
    if (!id)
      continue;
    if (id.indexOf('status.') == 0) {
      var mandatory = spanTag.getAttribute("mandatory") + "";
      if (mandatory == 'true')
        return true;
    }
  }
  return false;
}
var _frameChangedTimer = null;

function _frameChanged() {
  if (_frameChangedTimer)
    clearTimeout(_frameChangedTimer);
  _frameChangedTimer = setTimeout(function() {
    _frameChangedTimer = null;
    CustomEvent.fire('frame.resized');
    CustomEvent.fire('refresh.event');
  }, 300);
}

function getFormContentParent() {
  var glideOverlay = $(document.body).select("div.glide_overlay");
  var exposeMask = $('glide_expose_mask');
  if (glideOverlay.length > 0 && exposeMask && exposeMask.visible())
    return glideOverlay[0];
  if (typeof g_section_contents == 'undefined' || !g_section_contents)
    g_section_contents = $(document.body).select(".section_header_content_no_scroll");
  if (g_section_contents.length > 0)
    return g_section_contents[0];
  return document.body;
}

function addClassName(element, name) {
  if (!element)
    return;
  var names = element.className.split(" ");
  if (names.exists(name))
    return;
  names.push(name);
  element.className = names.join(" ");
}

function removeClassName(element, name) {
  if (!element)
    return;
  var names = element.className.split(" ");
  if (names.removeItem(name))
    element.className = names.join(" ");
}

function hasClassName(element, name) {
  if (!element)
    return;
  var names = element.className.split(" ");
  return names.exists(name);
}

function getIFrameDocument(iframe) {
  return iframe.contentWindow ? iframe.contentWindow.document : (iframe.contentDocument || null);
}

function writeTitle(element, title) {
  element.title = title;
  if (element.alt)
    element.alt = title;
}

function trim(s) {
  return s.replace(/^\s+|\s+$/g, '');
}
if (!String.prototype.trim) {
  String.prototype.trim = function() {
    return trim(this);
  }
}
if (!Array.prototype.remove) {
  Array.prototype.remove = function(ndx) {
    if (isNaN(ndx) || ndx >= this.length)
      return false;
    for (var i = (ndx + 1); i < this.length; i++)
      this[i - 1] = this[i];
    this.length--;
    return true;
  };
}
if (!Array.prototype.removeItem) {
  Array.prototype.removeItem = function(item) {
    for (var i = 0; i < this.length; i++)
      if (this[i] == item) {
        this.remove(i);
        return true;
      }
    return false;
  };
}
if (!Array.prototype.exists) {
  Array.prototype.exists = function(item) {
    for (var i = 0; i < this.length; i++)
      if (this[i] == item)
        return true;
    return false;
  };
}
if (!Array.prototype.insert) {
  Array.prototype.insert = function(ndx) {
    if (isNaN(ndx) || ndx > this.length)
      return false;
    for (var i = this.length; i > ndx; i--)
      this[i] = this[i - 1];
    this[ndx] = null;
    return true;
  };
}

function getIEVersion() {
  if (isMSIE6)
    return "msie6";
  else if (isMSIE7)
    return "msie7";
  else if (isMSIE8)
    return "msie8";
  else if (isMSIE9)
    return "msie9";
  else if (isMSIE10)
    return "msie10";
  else if (isMSIE11)
    return "msie11";
  else
    return "";
}
addAfterPageLoadedEvent(function() {
  addClassName(document.getElementsByTagName('body')[0], getIEVersion());
});