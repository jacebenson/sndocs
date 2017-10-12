/*! RESOURCE: /scripts/js_includes_navpage15.js */
/*! RESOURCE: /scripts/concourse_gjsv.js */
var GJSV = 2.0;;
/*! RESOURCE: /scripts/concourse_framebuster.js */
$j(function() {
  if (window.self != window.top && window.name.indexOf('sn_frame') == -1) {
    var path = window.location.pathname;
    if (path.indexOf('/navpage.do') != 0 && path != '/') {
      top.location.href = window.location.href;
      return;
    }
    var src = $j('iframe#gsft_main').attr('src');
    top.location.href = "/nav_to.do?uri=" + encodeURIComponent(src);
  }
});;
/*! RESOURCE: /scripts/consts/GlideEvent.js */
var GlideEvent = {
  WINDOW_CLICKED: 'glide:window_clicked',
  WINDOW_BLURRED: 'glide:window_blurred',
  WINDOW_FOCUSED: 'glide:window_focused',
  IMAGE_PICKED: 'glide:image_picked',
  NAV_MANAGER_LOADED: 'glide:nav_manager_loaded',
  NAV_FORM_DIRTY_CANCEL_STAY: 'glide:nav_form_dirty_cancel_stay',
  NAV_SYNC_LIST_WITH_FORM: 'glide:nav_sync_list_with_form',
  NAV_LOAD_FORM_FROM_LIST: 'glide:nav_load_form_from_list',
  NAV_SAVE_PREFERENCES: 'glide:nav_save_preferences',
  NAV_UPDATE_EDGE_BUTTON_STATES: 'glide:nav_update_edge_button_states',
  NAV_OPEN_URL: 'glide:nav_open_url',
  NAV_ADD_BOOKMARK: 'glide:nav_add_bookmark',
  NAV_REMOVE_BOOKMARK: 'glide:nav_remove_bookmark',
  NAV_UPDATE_BOOKMARK: 'glide:nav_update_bookmark',
  NAV_DRAGGING_BOOKMARK_START: 'glide:nav_dragging_bookmark_start',
  NAV_DRAGGING_BOOKMARK_STOP: 'glide:nav_dragging_bookmark_stop',
  NAV_HIDE_ALL_TOOLTIPS: 'glide:nav_hide_all_tooltips',
  NAV_QUEUE_BOOKMARK_OPEN_FLYOUT: 'glide:nav_queue_bookmark_open_flyout',
  NAV_OPEN_BOOKMARK: 'glide:nav_open_bookmark',
  NAV_BOOKMARK_ADDED: 'glide:nav_bookmark_added',
  NAV_BOOKMARK_REMOVED: 'glide:nav_bookmark_removed',
  NAV_EAST_PANE_RESIZED: 'glide:nav_east_pane_resized',
  NAV_ADD_FLYOUT: 'glide:nav_add_flyout',
  NAV_REMOVE_FLYOUT: 'glide:nav_remove_flyout',
  NAV_TOGGLE_FLYOUT: 'glide:nav_toggle_flyout',
  NAV_HIDE_FLYOUTS: 'glide:nav_hide_flyouts',
  NAV_PANE_CLICKED: 'glide:nav_window_clicked'
};;
/*! RESOURCE: /scripts/libs/keyboardJS/keyboard.0.2.2.min.js */
(function(e, t) {
  if (typeof define === "function" && define.amd) {
    define(t)
  } else {
    var n = e.parent != null ? e.parent : e;
    n.k = n.KeyboardJS = t
  }
})(this, function(e, t, n) {
  function r(e, t, n) {
    if (e.addEventListener) {
      e.addEventListener(t, n, false)
    } else {
      e.attachEvent("on" + t, function(t) {
        return n.call(e, t)
      })
    }
  }

  function f() {
    var e = [];
    for (var t = a.length; t > -1; t -= 1) {
      if (a[t]) {
        var n = a[t];
        for (var r = 0; r < n.length; r += 1) {
          var i = n[r],
            s = true;
          for (var u = 0; u < i.keys.length; u += 1) {
            var f = i.keys[u];
            if (o.indexOf(f) < 0) {
              s = false
            }
          }
          if (s) {
            e.push(i)
          }
        }
      }
    }
    return e
  }

  function l(e) {
    if (o < 1) {
      return true
    }
    var t = f(),
      n = [],
      r;
    for (var i = 0; i < t.length; i += 1) {
      var s = t[i],
        a = false;
      for (var l = 0; l < s.keys.length; l += 1) {
        var c = s.keys[l];
        if (n.indexOf(c) > -1) {
          break
        }
      }
      if (!a) {
        if (typeof s.callback === "function") {
          if (!s.callback(e, s.keys, s.keyCombo)) {
            r = false
          }
        }
        if (!u[s.keyCombo]) {
          u[s.keyCombo] = [s]
        } else {
          u[s.keyCombo].push(s)
        }
        for (var l = 0; l < s.keys.length; l += 1) {
          var c = s.keys[l];
          if (n.indexOf(c) < 0) {
            n.push(c)
          }
        }
      }
    }
    return r
  }

  function c(e) {
    var t = f();
    var n;
    for (var r in u) {
      if (u.hasOwnProperty(r)) {
        var i = u[r],
          s = false;
        for (var o = 0; o < t.length; o += 1) {
          var a = t[o].keyCombo;
          if (a === r) {
            s = true;
            break
          }
        }
        if (!s) {
          var l = i != null ? i.length : 0;
          for (var c = 0; c < l; c++) {
            if (typeof i[c].endCallback === "function") {
              if (!i[c].endCallback(e, i[c].keys, i[c].keyCombo)) {
                n = false
              }
            }
          }
          delete u[r]
        }
      }
    }
    return n
  }

  function h(e, t, n) {
    function r() {
      if (o && o.length) {
        var e = a[o.length];
        if (e.indexOf(u) > -1) {
          var t = a[o.length].indexOf(u);
          a[o.length].splice(t, 1)
        }
      }
      return a
    }
    var i = e.toLowerCase().replace(/\s/g, "").split(",");
    for (var s = 0; s < i.length; s += 1) {
      var o = i[s].split("+");
      if (o.length) {
        if (!a[o.length]) {
          a[o.length] = []
        }
        var u = {
          callback: t,
          endCallback: n,
          keyCombo: i[s],
          keys: o
        };
        a[o.length].push(u)
      }
    }
    return {
      clear: r
    }
  }

  function p(e, t, n, r, i) {
    function s() {
      if (typeof u === "function") {
        u()
      }
      if (typeof a === "function") {
        a()
      }
      if (typeof f === "function") {
        f()
      }
      if (typeof l === "function") {
        l()
      }
      if (typeof c === "function") {
        clearInterval(c)
      }
    }
    var o = [0, 0];
    if (typeof i !== "function") {
      return false
    }
    var u = h(e, function() {
      if (o[0] === 0) {
        o[0] = -1
      }
    }, function() {
      o[0] = 0
    }).clear;
    var a = h(t, function() {
      if (o[0] === 0) {
        o[0] = 1
      }
    }, function() {
      o[0] = 0
    }).clear;
    var f = h(n, function() {
      if (o[1] === 0) {
        o[1] = -1
      }
    }, function() {
      o[1] = 0
    }).clear;
    var l = h(r, function() {
      if (o[1] === 0) {
        o[1] = 1
      }
    }, function() {
      o[1] = 0
    }).clear;
    var c = setInterval(function() {
      if (o[0] === 0 && o[1] === 0) {
        return
      }
      i(o)
    }, 1);
    return {
      clear: s
    }
  }

  function d(e) {
    if (e === "all") {
      a = [];
      return
    }
    e = e.replace(/\s/g, "").split(",");
    for (var t = a.length; t > -1; t -= 1) {
      if (a[t]) {
        var n = a[t];
        for (var r = 0; r < n.length; r += 1) {
          var i = n[r],
            s = false;
          for (var o = 0; o < i.keys.length; o += 1) {
            var u = i.keys[o];
            for (var f = 0; f < e.length; f += 1) {
              var l = e[f];
              if (l === u) {
                s = true;
                break
              }
            }
            if (s) {
              break
            }
          }
          if (s) {
            a[t].splice(r, 1);
            r -= 1;
            if (a[t].length < 1) {
              delete a[t]
            }
          }
        }
      }
    }
  }

  function v() {
    return o
  }

  function m(e, t) {
    i[e] = t
  }

  function g(e) {
    if (i[e]) {
      s = i[e]
    }
  }[].indexOf || (Array.prototype.indexOf = function(e, t, n) {
    for (n = this.length, t = (n + ~~t) % n; t < n && (!(t in this) || this[t] !== e); t++);
    return t ^ n ? t : -1
  });
  var i = {
    us: {
      backspace: 8,
      tab: 9,
      enter: 13,
      shift: 16,
      ctrl: 17,
      alt: 18,
      pause: 19,
      "break": 19,
      capslock: 20,
      escape: 27,
      esc: 27,
      space: 32,
      spacebar: 32,
      pageup: 33,
      pagedown: 34,
      end: 35,
      home: 36,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      insert: 45,
      "delete": 46,
      0: 48,
      1: 49,
      2: 50,
      3: 51,
      4: 52,
      5: 53,
      6: 54,
      7: 55,
      8: 56,
      9: 57,
      a: 65,
      b: 66,
      c: 67,
      d: 68,
      e: 69,
      f: 70,
      g: 71,
      h: 72,
      i: 73,
      j: 74,
      k: 75,
      l: 76,
      m: 77,
      n: 78,
      o: 79,
      p: 80,
      q: 81,
      r: 82,
      s: 83,
      t: 84,
      u: 85,
      v: 86,
      w: 87,
      x: 88,
      y: 89,
      z: 90,
      meta: 91,
      command: 91,
      windows: 91,
      win: 91,
      _91: 92,
      select: 93,
      num0: 96,
      num1: 97,
      num2: 98,
      num3: 99,
      num4: 100,
      num5: 101,
      num6: 102,
      num7: 103,
      num8: 104,
      num9: 105,
      multiply: 106,
      add: 107,
      subtract: 109,
      decimal: 110,
      divide: 111,
      f1: 112,
      f2: 113,
      f3: 114,
      f4: 115,
      f5: 116,
      f6: 117,
      f7: 118,
      f8: 119,
      f9: 120,
      f10: 121,
      f11: 122,
      f12: 123,
      numlock: 144,
      num: 144,
      scrolllock: 145,
      scroll: 145,
      semicolon: 186,
      equal: 187,
      equalsign: 187,
      comma: 188,
      dash: 189,
      period: 190,
      slash: 191,
      forwardslash: 191,
      graveaccent: 192,
      openbracket: 219,
      backslash: 220,
      closebracket: 221,
      singlequote: 222
    }
  };
  var s = i["us"],
    o = [],
    u = {};
  var a = n != null ? n.keyBindingGroups : [];
  $j(e.document).bind("keydown.keyJS", function(e) {
    for (var t in s) {
      if (s.hasOwnProperty(t) && e.keyCode === s[t]) {
        if (o.indexOf(t) < 0) {
          o.push(t)
        }
      }
    }
    return l(e)
  });
  $j(e.document).bind("keyup.keyJS", function(e) {
    for (var t in s) {
      if (s.hasOwnProperty(t) && e.keyCode === s[t]) {
        var n = o.indexOf(t);
        if (n > -1) {
          o.splice(n, 1)
        }
      }
    }
    return c(e)
  });
  r(e, "blur", function(e) {
    o = [];
    return c(e)
  });
  return {
    bind: {
      key: h,
      axis: p
    },
    activeKeys: v,
    keyBindingGroups: a,
    unbind: {
      key: d
    },
    locale: {
      add: m,
      set: g
    },
    context: e,
    frame: t
  }
})
/*! RESOURCE: /scripts/keyboard/KeyboardRegistry.js */
var KeyboardRegistry = function(context) {
  this.initialize(context);
}
KeyboardRegistry.prototype = {
  mainFrame: "gsft_main",
  formFrame: "gsft_main_form",
  initialize: function(context) {
    var primary = window.KeyboardJS(window);
    var children = new Object();
    if ($j(window.document).find('iframe').length > 0) {
      var frames = $j(window.document).find('iframe');
      for (var i = 0; i < frames.length; i++) {
        var frameElem = frames.get(i);
        var index = $j(frameElem).attr('name');
        var fWindow = frameElem.contentWindow;
        children[index] = window.KeyboardJS(fWindow, frameElem);
        $j(fWindow).bind('unload.keyJS', {
          context: context,
          index: index,
          children: children,
          registry: this
        }, function(e) {
          $j(this.document).unbind('.keyJS');
          $j(this).unbind('.keyJS');
        });
        $j(frameElem).bind('load.keyJS', {
          children: children,
          index: index,
          win: window,
          registry: this
        }, function(e) {
          e.data.children[e.data.index] = e.data.win.KeyboardJS(this.contentWindow, this, e.data.children[e.data.index]);
          $j(this.contentWindow).bind('unload.keyJS', {
            index: e.data.index,
            children: e.data.children,
            registry: e.data.registry
          }, function(e) {
            $j(this.document).unbind('.keyJS');
            $j(this).unbind('.keyJS');
          });
        });
      }
    }
    this.primary = primary;
    this.children = children;
  },
  bind: function(keyCombo, onDownCallback, onUpCallbackOrData, data) {
    var obj = {
      registry: this,
      global: function(exclude) {
        return this._selector(null, null, null, exclude);
      },
      formFrame: function() {
        return this.frame(this.registry.formFrame);
      },
      form: function(id, name, action, method) {
        var elementName = 'form';
        var attrMap1 = new Object();
        var attrMap2 = new Object();
        attrMap1['id'] = attrMap2['id'] = id;
        attrMap1['name'] = attrMap2['name'] = name;
        attrMap1['action'] = attrMap2['action'] = action;
        attrMap1['method'] = method != null ? method.toLowerCase() : null;
        attrMap2['method'] = method != null ? method.toUpperCase() : null;
        return this._selector(this._buildSelector(elementName, attrMap1, attrMap2));
      },
      frame: function(name, selector, exact) {
        return this._selector(selector, name, exact);
      },
      selector: function(selector, exact) {
        return this._selector(selector, null, exact);
      },
      _selector: function(selector, frameName, exact, exclude) {
        var onDownCallback = this.onDownCallback;
        var getEventTarget = this._getEventTarget;
        var onUpCallback = this.onUpCallback;
        var data = typeof onUpCallback === 'function' || onUpCallback == null ? this.data : onUpCallback;
        var callback = function(event, keys, combo, callback) {
          if (callback == null || typeof callback !== 'function')
            return true;
          var target = getEventTarget(event)
          var isMatch = selector == null || $j(target).is(selector);
          if (!isMatch && exact)
            return true;
          if (!isMatch) {
            $j(target).parents().each(function() {
              isMatch = $j(this).is(selector);
              if (isMatch)
                return false;
            });
            if (!isMatch)
              return true;
          }
          var e = !event ? window.event : event;
          e.data = data != null ? data : {};
          e.data._target = target;
          var output = callback(e, keys, combo);
          return output === false ? false : true;
        };
        var onDown = function(event, keys, combo) {
          return callback(event, keys, combo, onDownCallback);
        };
        var onUp = function(event, keys, combo) {
          return callback(event, keys, combo, onUpCallback);
        };
        frameName = this.registry.primary != null ? frameName :
          (frameName == null || frameName == this.registry.mainFrame ? this.registry.formFrame : 'dummy');
        exclude = frameName == null ? exclude : null;
        var response = new Object();
        if ((frameName == null || frameName == 'top' || $j.isEmptyObject(this.registry.children)) && (exclude == null || exclude != 'top')) {
          response['top'] = this.registry.primary.bind.key(this.keyCombo, onDown, onUp);
        }
        var c = typeof window.console == "undefined" ? {
          log: function(str) {}
        } : window.console;
        for (var key in this.registry.children) {
          if ((frameName == null || frameName == key) && (exclude == null || exclude != key)) {
            response[key] = this.registry.children[key].bind.key(this.keyCombo, onDown, onUp);
          }
        }
        if (frameName == null || frameName != 'dummy') {
          var fName = frameName != null && this.registry.children[key] != null ? frameName : null;
          var logging = false;
          if (logging && (fName != null || frameName == null || $j.isEmptyObject(this.registry.children)) &&
            (exclude == null || fName != exclude)) {
            c.log("KeyboardRegistry: The '" + this.keyCombo + "' key has been bound to the " +
              (selector != null ? "selector '" + selector + "' " : "document ") + (exact ? "as an exact match " : "as a parent match ") +
              (fName != null ? ("to frame '" + fName + "'") : "to all frames") + ".");
          }
        }
        return {
          "clear": function() {
            for (var key in response) {
              var keyBindingGroups = response[key].clear();
            }
          }
        }
      },
      _buildSelector: function(selector, attrMap1, attrMap2) {
        var sel1 = this._buildSelector0(selector, attrMap1);
        if (attrMap2 != null) {
          var sel2 = this._buildSelector0(selector, attrMap2);
          return sel1 + "," + sel2;
        } else {
          return sel1;
        }
      },
      _buildSelector0: function(selector, attrMap) {
        for (var key in attrMap) {
          if (attrMap[key] != null) {
            selector += '[' + key + '="' + attrMap[key] + '"]';
          }
        }
        return selector;
      },
      _getEventTarget: function(e) {
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3)
          targ = targ.parentNode;
        return targ;
      }
    };
    obj.keyCombo = keyCombo.toLowerCase();
    obj.onDownCallback = onDownCallback;
    obj.onUpCallback = onUpCallbackOrData;
    obj.data = data;
    return obj;
  },
  toString: function() {
    return "KeyboardRegistry";
  }
};;
/*! RESOURCE: /scripts/concourse/SingletonKeyboardRegistry.js */
var SingletonKeyboardRegistry = (function($) {
  var instance;
  var windowNames = [];
  var createInstance = function() {
    instance = new ChildKeyboardRegistry();
    return instance;
  };
  var ChildKeyboardRegistry = function() {
    this.initialize(window);
  };
  ChildKeyboardRegistry.prototype = Object.create(KeyboardRegistry.prototype);
  ChildKeyboardRegistry.prototype.addFrame = function(frameWindow) {
    var bindings, binding, index, frame;
    if (frameWindow.name) {
      index = frameWindow.name;
      frame = $(frameWindow.parent.document).find('iframe[name=' + index + ']');
      if (frame.length) {
        if (!frame.data('keyboard-js')) {
          frame.data('keyboard-js', true);
          this.children[index] = window.top.KeyboardJS(frame[0]);
          bindings = this.primary.keyBindingGroups;
          for (var j = 0; j < bindings.length; j++) {
            if (bindings[j]) {
              for (var i = 0; i < bindings[j].length; i++) {
                binding = bindings[j][i];
                this.children[index].bind.key(binding.keyCombo, binding.callback, binding.endCallback);
              }
            }
          }
        }
        $(frameWindow).bind('unload.keyJS', {
          context: window,
          index: index,
          children: this.children,
          registry: this
        }, function(e) {
          $(this.document).unbind('.keyJS');
          $(this).unbind('.keyJS');
        });
        $(frame).bind('load.keyJS', {
          children: this.children,
          index: index,
          win: window,
          registry: this
        }, function(e) {
          if (!this.contentWindow)
            return;
          e.data.children[e.data.index] = e.data.win.KeyboardJS(this.contentWindow, this, e.data.children[e.data.index]);
          $(this.contentWindow).bind('unload.keyJS', {
            index: e.data.index,
            children: e.data.children,
            registry: e.data.registry
          }, function(e) {
            $(this.document).unbind('.keyJS');
            $(this).unbind('.keyJS');
          });
        });
      }
    }
  };
  if (window.self != window.top)
    return null;
  CustomEvent.on('navigation.complete', function(frame) {
    if (instance) {
      instance.addFrame(frame);
    }
  });
  return {
    getInstance: function() {
      if (!instance) {
        return createInstance();
      } else {
        return instance;
      }
    }
  }
})(jQuery);;
/*! RESOURCE: /scripts/concourse/keyboardShortcuts.js */
(function($) {
  if (window.top != window.self)
    return;
  $('document').ready(function() {
    var keyboardRegistry = SingletonKeyboardRegistry.getInstance();
    keyboardRegistry.bind('ctrl + alt + g', function(evt, keys, combo) {
      $('#sysparm_search').focus();
    }).selector(null, true);
    keyboardRegistry.bind('ctrl + alt + c', function(evt, keys, combo) {
      CustomEvent.fireAll('magellan_collapse.toggle');
    }).selector(null, true);
    keyboardRegistry.bind('ctrl + alt + f', function(evt, keys, combo) {
      if ($('.navpage-layout').hasClass('navpage-nav-collapsed')) {
        CustomEvent.fireAll('magellan_collapse.toggle');
        $(document).one("nav.expanded", function() {
          $('#filter').focus();
        });
      } else {
        if (!$('.navpage-layout').hasClass('magellan-edit-mode')) {
          $('#filter').focus();
        }
      }
    }).selector(null, true);
  });
})(jQuery);;
/*! RESOURCE: /scripts/sn/common/messaging/js_includes_messaging.js */
/*! RESOURCE: /scripts/doctype/CustomEventManager.js */
var NOW = NOW || {};
var CustomEventManager = (function(existingCustomEvent) {
  "use strict";
  var events = (existingCustomEvent && existingCustomEvent.events) || {};
  var isFiringFlag = false;
  var trace = false;
  var suppressEvents = false;
  var NOW_MSG = 'NOW.PostMessage';

  function observe(eventName, fn) {
    if (trace)
      jslog("$CustomEventManager observing: " + eventName);
    on(eventName, fn);
  }

  function on(name, func) {
    if (!func || typeof func !== 'function')
      return;
    if (typeof name === 'undefined')
      return;
    if (!events[name])
      events[name] = [];
    events[name].push(func);
  }

  function un(name, func) {
    if (!events[name])
      return;
    var idx = -1;
    for (var i = 0; i < events[name].length; i++) {
      if (events[name][i] === func) {
        idx = i;
        break;
      }
    }
    if (idx >= 0)
      events[name].splice(idx, 1)
  }

  function unAll(name) {
    if (events[name])
      delete events[name];
  }

  function fire(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    return fireEvent.apply(null, arguments);
  }

  function fireUp(eventName, args) {
    var win = window;
    while (win) {
      try {
        if (win.CustomEvent.fireEvent.apply(null, arguments) === false)
          return;
        win = win.parent === win ? null : win.parent;
      } catch (e) {
        return;
      }
    }
  }

  function fireEvent() {
    if (suppressEvents)
      return true;
    var args = Array.prototype.slice.apply(arguments);
    var name = args.shift();
    var eventList = events[name];
    if (!eventList)
      return true;
    var event = eventList.slice();
    isFiringFlag = true;
    for (var i = 0, l = event.length; i < l; i++) {
      var ev = event[i];
      if (!ev)
        continue;
      if (ev.apply(null, args) === false) {
        isFiringFlag = false;
        return false;
      }
    }
    isFiringFlag = false;
    return true;
  }

  function isFiring() {
    return isFiringFlag;
  }

  function forward(name, element, func) {
    on(name, func);
    element.addEventListener(name, function(e) {
      fireEvent(e.type, this, e);
    }.bind(api));
  }

  function registerPostMessageEvent() {
    if (NOW.registeredPostMessageEvent) {
      return;
    }
    if (!window.postMessage) {
      return;
    }
    window.addEventListener('message', function(event) {
      var nowMessageJSON = event.data;
      var nowMessage;
      try {
        nowMessage = JSON.parse(nowMessageJSON.toString());
      } catch (e) {
        return;
      }
      if (!nowMessage.type == NOW_MSG) {
        return;
      }
      fire(nowMessage.eventName, nowMessage.args);
    }, false);
    NOW.registeredPostMessageEvent = true;
  }

  function doPostMessage(win, event, msg, targetOrigin) {
    var nowMessage = {
      type: NOW_MSG,
      eventName: event,
      args: msg
    };
    var nowMessageJSON;
    if (!win || !win.postMessage) {
      return
    }
    nowMessageJSON = JSON.stringify(nowMessage);
    win.postMessage(nowMessageJSON, targetOrigin);
  }

  function fireTop(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    fireEvent.apply(null, arguments);
    var t = getTopWindow();
    if (t !== null && window !== t)
      t.CustomEvent.fire(eventName, args);
  }

  function fireAll(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    var topWindow = getTopWindow();
    notifyAllFrom(topWindow);

    function notifyAllFrom(rootFrame) {
      var childFrame;
      rootFrame.CustomEvent.fireEvent(eventName, args);
      for (var i = 0; i < rootFrame.length; i++) {
        try {
          childFrame = rootFrame[i];
          if (!childFrame)
            continue;
          if (childFrame.CustomEvent && typeof childFrame.CustomEvent.fireEvent === "function") {
            notifyAllFrom(childFrame);
          }
        } catch (e) {}
      }
    }
  }

  function fireToWindow(targetWindow, eventName, args, usePostMessage, targetOrigin) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + args.length);
    if (usePostMessage) {
      doPostMessage(targetWindow, eventName, args, targetOrigin);
    } else {
      targetWindow.CustomEvent.fireEvent(eventName, args);
    }
  }

  function getTopWindow() {
    var topWindow = window.self;
    try {
      while (topWindow.CustomEvent.fireEvent && topWindow !== topWindow.parent && topWindow.parent.CustomEvent.fireEvent) {
        topWindow = topWindow.parent;
      }
    } catch (e) {}
    return topWindow;
  }

  function isTopWindow() {
    return getTopWindow() == window.self;
  }

  function jslog(msg, src, dateTime) {
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
      } else {
        if (window.console && window.console.log)
          console.log(msg);
      }
    } catch (e) {}
  }
  var api = {
    set trace(value) {
      trace = !!value;
    },
    get trace() {
      return trace;
    },
    set suppressEvents(value) {
      suppressEvents = !!value;
    },
    get suppressEvents() {
      return suppressEvents;
    },
    get events() {
      return events;
    },
    on: on,
    un: un,
    unAll: unAll,
    forward: forward,
    isFiring: isFiring,
    fireEvent: fireEvent,
    observe: observe,
    fire: fire,
    fireTop: fireTop,
    fireAll: fireAll,
    fireToWindow: fireToWindow,
    isTopWindow: isTopWindow,
    fireUp: fireUp,
    toString: function() {
      return 'CustomEventManager';
    }
  };
  registerPostMessageEvent();
  return api;
})(NOW.CustomEvent);
NOW.CustomEvent = CustomEventManager;
if (typeof CustomEvent !== "undefined") {
  CustomEvent.observe = NOW.CustomEvent.observe.bind(NOW.CustomEvent);
  CustomEvent.fire = NOW.CustomEvent.fire.bind(NOW.CustomEvent);
  CustomEvent.fireUp = NOW.CustomEvent.fireUp.bind(NOW.CustomEvent);
  CustomEvent.fireTop = NOW.CustomEvent.fireTop.bind(NOW.CustomEvent);
  CustomEvent.fireAll = NOW.CustomEvent.fireAll.bind(NOW.CustomEvent);
  CustomEvent.fireToWindow = NOW.CustomEvent.fireToWindow.bind(NOW.CustomEvent);
  CustomEvent.on = NOW.CustomEvent.on.bind(NOW.CustomEvent);
  CustomEvent.un = NOW.CustomEvent.un.bind(NOW.CustomEvent);
  CustomEvent.unAll = NOW.CustomEvent.unAll.bind(NOW.CustomEvent);
  CustomEvent.forward = NOW.CustomEvent.forward.bind(NOW.CustomEvent);
  CustomEvent.isFiring = NOW.CustomEvent.isFiring.bind(NOW.CustomEvent);
  CustomEvent.fireEvent = NOW.CustomEvent.fireEvent.bind(NOW.CustomEvent);
  CustomEvent.events = NOW.CustomEvent.events;
  CustomEvent.isTopWindow = NOW.CustomEvent.isTopWindow.bind(NOW.CustomEvent);
} else {
  window.CustomEvent = NOW.CustomEvent;
};
/*! RESOURCE: /scripts/sn/common/messaging/_module.js */
angular.module('sn.common.messaging', []);
angular.module('sn.messaging', ['sn.common.messaging']);;
/*! RESOURCE: /scripts/sn/common/messaging/service.snCustomEvent.js */
angular.module('sn.common.messaging').factory('snCustomEvent', function() {
  "use strict";
  if (typeof NOW.CustomEvent === 'undefined')
    throw "CustomEvent not found in NOW global";
  return NOW.CustomEvent;
});;;
/*! RESOURCE: /scripts/concourse/_module.js */
angular.module('sn.concourse', [
  'ng.common',
  'sn.messaging',
  'sn.common.session_notification',
  'sn.common.bindWatch',
  'ngSanitize',
  'ngAnimate',
  'sn.concourse_pane_extension',
  'sn.concourse_view_stack'
]);;
/*! RESOURCE: /scripts/concourse/factory.keyboardRegistry.js */
angular.module('ng.common').factory('keyboardRegistry', [function() {
  if (window.top.SingletonKeyboardRegistry) {
    var keyboardRegistry = window.top.SingletonKeyboardRegistry.getInstance();
    return keyboardRegistry;
  }
}]);;
/*! RESOURCE: /scripts/concourse/directive.preferenceChanger.js */
angular.module('sn.concourse').directive('preferenceChanger', function(getTemplateUrl, snCustomEvent, userPreferences) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      label: '@',
      moreinfo: '@',
      type: '@',
      fireEvent: '@',
      preference: '@',
      reload: '@',
      confirm: '@',
      options: '='
    },
    replace: true,
    templateUrl: getTemplateUrl('cc_preference_changer.xml'),
    controller: function($scope, $window, $timeout) {
      $scope.id = (Math.random() * 1000) + $scope.preference.replace(/\./g, '_');
      userPreferences.getPreference($scope.preference).then(function(val) {
        if (val)
          $scope.prefValue = $scope.type == 'boolean' ? JSON.parse(val) : val;
        else
          $scope.prefValue = val;
        if (val == "null" && $scope.options) {
          $scope.prefValue = $scope.options[0].value;
        }
        $scope.origValue = $scope.prefValue;
        if ($scope.fireEvent) {
          snCustomEvent.on($scope.fireEvent, function(newVal) {
            if ($scope.prefValue === newVal)
              return;
            $timeout(function() {
              $scope.prefValue = newVal || newVal === "true";
            });
          });
        }
        $scope.$watch('prefValue', function(newValue, oldValue) {
          if (newValue != oldValue) {
            if ($scope.confirm) {
              if (newValue == $scope.origValue)
                return;
              if (!confirm($scope.confirm)) {
                $timeout(function() {
                  $scope.prefValue = $scope.origValue;
                });
                return;
              }
            }
            userPreferences.setPreference($scope.preference, newValue).then(function() {
              if ($scope.reload)
                $window.location.reload();
              if ($scope.fireEvent)
                snCustomEvent.fireAll($scope.fireEvent, newValue);
            });
          }
        });
      });
    },
    link: function($scope, $element) {
      $element.on('change', 'input[type=checkbox]', function() {
        $scope.prefValue = angular.element(this).prop('checked');
        $scope.$apply();
      });
      $element.on('change', 'input[type=radio]', function() {
        $scope.prefValue = this.getAttribute('value');
        $scope.$apply();
      })
    }
  }
});;
/*! RESOURCE: /scripts/concourse/directive.themePicker.js */
angular.module('sn.concourse').directive('themePicker', function(getTemplateUrl, userPreferences, $timeout, snCustomEvent) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('concourse_theme_picker.xml'),
    controller: function($scope, $http) {
      $scope.executionCount = 0;
      var lazyLoaded = false;

      function getData() {
        $http.get("/api/now/ui/theme").then(function(response) {
          if (response && response.data && response.data.result && response.data.result.themes) {
            $scope.themes = response.data.result.themes;
            if (response.data.result.defaultTheme)
              $scope.defaultTheme = response.data.result.defaultTheme;
            var initialPress = true;
            document.getElementById("nav-settings-button").addEventListener("click", function() {
              if (initialPress) {
                initialPress = false;
                processLazyLoad();
              }
            });
          }
        });
      }
      getData();

      function processLazyLoad() {
        if (lazyLoaded)
          return;
        var cb = function() {
          lazyLoad($scope.themes, document);
          if (document.getElementById("gsft_main"))
            lazyLoad($scope.themes, document.getElementById("gsft_main").contentDocument);
        };
        (function() {
          var lastTime = 0;
          var vendors = ['webkit', 'moz'];
          for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
          }
          if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback) {
              var currTime = new Date().getTime();
              var timeToCall = Math.max(0, 16 - (currTime - lastTime));
              var id = window.setTimeout(function() {
                  callback(currTime + timeToCall);
                },
                timeToCall);
              lastTime = currTime + timeToCall;
              return id;
            };
          if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
              clearTimeout(id);
            };
        }());
        var raf = requestAnimationFrame;
        if (raf) raf(cb);
        else document.getElementById("gsft_main").contentWindow.addEventListener('load', cb);
        lazyLoaded = true;
      }

      function lazyLoad(themes, frameContext) {
        var links = frameContext.getElementsByTagName("link");
        var styles = [];
        for (var i = 0; links.length > i; i++) {
          if (links[i].getAttribute("type") == "text/css") {
            styles.push(links[i]);
          }
        }
        var styleFrame;
        if (!document.getElementById("styleFrame")) {
          styleFrame = frameContext.createElement("iframe");
          document.head.appendChild(styleFrame);
          styleFrame.id = "styleFrame0";
          lazyLoadStyles(themes, frameContext, styleFrame, styles);
        } else {
          var highestStyle = 0;
          var currentStyle = 0;
          var allFrames = document.getElementsByTagName("iframe");
          for (i = 0; i < allFrames.length; i++) {
            if (allFrames[i].id.indexOf("styleFrame") > -1) {
              currentStyle = allFrames[i].id.split("styleFrame")[0];
              if (currentStyle.parseInt() > highestStyle)
                highestStyle = currentStyle;
            }
          }
          styleFrame = document.getElementById("styleFrame" + highestStyle);
          styleFrame.setAttribute("style", "display:none");
          lazyLoadStyles(themes, frameContext, styleFrame, styles);
        }
      }

      function lazyLoadStyles(themes, frameContext, styleFrame, styles) {
        var styleCount = 0;
        var frameCount = 1;
        var firstRun = true;
        for (var i = 0; styles.length > i; i++) {
          var styleLink = styles[i].getAttribute("href");
          styleLink = styleLink.split("&theme=");
          for (var n = 0; themes.length > n; n++) {
            if (!styleLink[1] || styleLink[1] != $scope.themes[n].id) {
              if (firstRun && !styleFrame.contentDocument.body) {
                var frameForm = styleFrame.contentDocument.createElement('html');
                styleFrame.contentDocument.appendChild(frameForm);
                var frameHead = styleFrame.contentDocument.createElement('body');
                styleFrame.contentDocument.getElementsByTagName("html")[0].appendChild(frameHead);
                firstRun = false;
              }
              insertStyles(styleFrame, styleLink, n);
              styleCount++;
              if (styleCount >= (31 * frameCount) && !document.getElementById("styleFrame" + frameCount)) {
                styleFrame = frameContext.createElement("iframe");
                document.head.appendChild(styleFrame);
                styleFrame.id = "styleFrame" + frameCount;
                styleFrame.setAttribute("style", "display:none");
                frameCount++;
                firstRun = true;
              }
            }
          }
        }
      }

      function insertStyles(styleFrame, styleLink, count) {
        var linkElement = styleFrame.contentDocument.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.type = "text/css";
        linkElement.href = styleLink[0] + "&theme=" + $scope.themes[count].id;
        styleFrame.contentDocument.body.appendChild(linkElement);
      }
      snCustomEvent.observe('sn:set_theme', function(themeId) {
        processLazyLoad();
        setTimeout(function() {
          $scope.updateTheme({
            id: themeId
          });
        }, 500);
      });
      $scope.updateTheme = function(theme) {
        userPreferences.setPreference('glide.css.theme.ui16', theme.id);
        $http.put("/api/now/ui/theme/preference", theme);
        if (theme.name)
          document.getElementById(theme.name).children[2].checked = true;
        $scope.executionCount++;
        if ($scope.executionCount < 2) {
          callStylePanes(theme);
        } else {
          setTimeout(function() {
            callStylePanes(theme);
          }, 1000);
        }
        $scope.defaultTheme = theme.id;

        function callStylePanes(theme) {
          setStyles(theme, "nav");
          setStyles(theme, "content");
          setStyles(theme, "collab");
          setStyles(theme, "jsdebug");
        }

        function setStyles(theme, pane) {
          var styles = [];
          var frameContext = "";
          var headTag = "";
          if (pane == "nav") {
            headTag = document.getElementsByTagName("head")[0];
            if (!headTag)
              return;
            styles = headTag.getElementsByTagName("link");
            frameContext = document;
          } else if (pane == "content") {
            if (!document.getElementById("gsft_main"))
              return;
            headTag = document.getElementById("gsft_main").contentDocument.getElementsByTagName("head")[0];
            styles = headTag.getElementsByTagName("link");
            frameContext = document.getElementById("gsft_main").contentDocument;
          } else if (pane == "collab") {
            if (document.getElementById("edge_east")) {
              headTag = document.getElementById("edge_east").parentElement;
              if (!headTag)
                return;
              styles = headTag.getElementsByTagName("link");
              if (!styles)
                return;
              frameContext = document;
            } else
              return;
          } else if (pane == "jsdebug") {
            if (document.getElementById("javascript_debugger")) {
              headTag = document.getElementById("javascript_debugger").contentDocument.getElementsByTagName("body")[0];
              if (!headTag)
                return;
              styles = headTag.getElementsByTagName("link");
              if (!styles)
                return;
              frameContext = document.getElementById("javascript_debugger").contentDocument;
            } else
              return;
          }
          applyStyles(styles, theme, frameContext);
        }

        function applyStyles(styles, theme, frameContext) {
          var styleObject = [];
          var styleList = [];
          if (styles.length > 20)
            removeOldStyles(frameContext);
          for (var i = 0; styles.length > i; i++) {
            var styleLink = styles[i].getAttribute("href");
            var link = styles[i].getAttribute("href");
            if (styles[i].getAttribute("type") == "text/css" && styles[i].getAttribute("class") != "old-template" &&
              link != "/styles/spectrum.css" && link != "/styles/third-party/jquery_notification.css") {
              styleObject.push(styles[i]);
              styleLink = styleLink.split("&theme=");
              styleLink = styleLink[0];
              styleLink += "&theme=" + theme.id;
              var newStyle = frameContext.createElement("link");
              newStyle.setAttribute("type", "text/css");
              newStyle.setAttribute("rel", "stylesheet");
              newStyle.setAttribute("href", styleLink);
              styleList.push(newStyle);
              styles[i].setAttribute("class", "old-template");
            }
          }
          for (i = 0; styleList.length > i; i++) {
            styleObject[i].parentNode.appendChild(styleList[i]);
          }
          setTimeout(function() {
            removeOldStyles(frameContext)
          }, 2000);
          $scope.executionCount--;
        }

        function removeOldStyles(frameContext) {
          var oldTemplates = frameContext.getElementsByClassName("old-template");
          var otLength = oldTemplates.length;
          for (var i = 0; otLength > i; i++) {
            oldTemplates[0].parentNode.removeChild(oldTemplates[0]);
          }
        }
      }
    },
    link: function(scope, element) {
      scope.addTooltip = function(first) {
        if (first) {
          $timeout(function() {
            jQuery(element).find('a').tooltip({
              placement: 'auto',
              container: 'body'
            })
          });
        }
      };
    }
  }
});;
/*! RESOURCE: /scripts/concourse/directive.requestManager.js */
angular.module("sn.concourse").directive("requestManager", ["$http", "snCustomEvent", "getTemplateUrl", "$timeout", function($http, snCustomEvent, getTemplateUrl, $timeout) {
  return {
    restrict: 'E',
    scope: {
      timerDelay: '@'
    },
    templateUrl: getTemplateUrl('concourse_request_manager.xml'),
    controller: function($scope, $http) {
      var interval = 0;
      var timeOut;
      var loadingStartTime = 0;
      var startTime = 0;
      var finalMsgTimeOut = 0;
      var checkingWithServer = false;
      var serverCheckTime = 0;
      var loadCancelValidation = false;
      $scope.cancelling = false;
      $scope.showAlert = false;
      $scope.hideButton = false;
      if (!$scope.timerDelay) {
        $scope.timerDelay = 15;
      }
      var delayTime = $scope.timerDelay * 1000;
      snCustomEvent.observe("request_start", function() {
        if (timeOut)
          return;
        startTime = new Date();
        if (finalMsgTimeOut)
          $timeout.cancel(finalMsgTimeOut);
        finalMsgTimeOut = 0;
        timeOut = $timeout(checkTransaction, $scope.timerDelay * 1000);
      });
      snCustomEvent.observe("load_page_request_start", function() {
        loadCancelValidation = true;
        if (loadingStartTime)
          return;
        startTime = new Date();
        if (finalMsgTimeOut)
          $timeout.cancel(finalMsgTimeOut);
        finalMsgTimeOut = 0;
        timeOut = $timeout(checkTransaction, delayTime);
      });
      snCustomEvent.observe("request_complete", handleRequestComplete);
      snCustomEvent.observe("load_page_request_complete", function() {
        loadCancelValidation = false;
        handleRequestComplete();
      });
      snCustomEvent.observe("request_cancel", $scope.handleRequestCancel);
      snCustomEvent.observe("clear_message", clearMessage);

      function checkTransaction() {
        if (checkingWithServer)
          return;
        checkingWithServer = true;
        serverCheckTime = new Date();
        $http.get("/cancel_my_transaction.do?status=true&sysparm_output=json").then(function(response) {
          checkTransactionResponse(response);
        });
      }

      function checkTransactionResponse(response) {
        if (response && response.data && response.data.status) {
          checkingWithServer = false;
          var message = response.data.status;
          if ("No session, nothing to cancel" == message)
            clearMessage();
          else if ("complete" == message)
            handleRequestComplete();
          else
            startIntervalTimer();
        } else
          clearMessage();
      }

      function clearMessage() {
        $scope.showAlertBar(false);
      }

      function handleRequestComplete() {
        if (loadCancelValidation == false) {
          if ($scope.cancelling)
            setStatus("Cancelled after");
          else
            setStatus("Completed in");
          $scope.hideAlertButton(true);
          $scope.cancelling = false;
          clearTimers();
          if (startTime == 0) {
            clearMessage();
            return;
          }
          $scope.timer = getTime();
          finalMsgTimeOut = $timeout(clearMessage, 2500);
          startTime = 0;
          serverCheckTime = 0;
        }
      }

      function startIntervalTimer() {
        if (interval)
          return;
        $scope.showAlertBar(true);
        $scope.hideAlertButton(false);
        handleInterval();
        interval = setInterval(handleInterval, 300);
      }

      function clearTimers() {
        if (interval)
          clearInterval(interval);
        if (timeOut)
          $timeout.cancel(timeOut);
        interval = 0;
        timeOut = 0;
      }

      function handleInterval() {
        var timer = new Date() - serverCheckTime;
        if (timer > 2000)
          checkTransaction();
        if ($scope.cancelling)
          setStatus("Cancelling:");
        else
          setStatus("Running Transaction:");
        $scope.timer = getTime();
        if ($scope.timer == 0) {
          handleRequestComplete();
        }
      }

      function getTime() {
        if (startTime == 0)
          return 0;
        var timer = new Date() - startTime;
        return Math.round(timer / 100) / 10 + 's';
      }

      function setStatus(message) {
        $scope.statusMessage = message;
      }
      $scope.handleRequestCancel = function() {
        if ($scope.cancelling)
          return;
        $scope.cancelling = true;
        $scope.hideAlertButton(true);
        $scope.statusMessage = "Cancelling:";
        $http.get("cancel_my_transaction.do?sysparm_output=xml").then(checkTransactionResponse);
      };
      $scope.hideAlertButton = function(disabled) {
        $scope.hideButton = disabled;
      };
      $scope.showAlertBar = function(enabled) {
        $scope.showAlert = enabled;
      };
    }
  }
}]);;
/*! RESOURCE: /scripts/concourse/directive.elevateRoleIndicator.js */
angular.module('sn.concourse').directive('elevateRoleIndicator', ['snCustomEvent', function(snCustomEvent) {
  "use strict"
  return {
    restrict: 'E',
    replace: true,
    template: '<span ng-show="hasActiveRole" class="icon icon-unlocked elevated-role-indicator"></span>',
    controller: function($scope) {
      $scope.hasActiveRole = false;
      snCustomEvent.on('user.elevatedRoles.updated', function(activeRoles) {
        if (activeRoles.length) {
          $scope.hasActiveRole = true;
        } else {
          $scope.hasActiveRole = false;
        }
      });
    }
  }
}]);;
/*! RESOURCE: /scripts/concourse/directive.printerFriendly.js */
angular.module("sn.concourse").directive('printerFriendly', function(getTemplateUrl) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('concourse_print_friendly.xml'),
    controller: function($scope) {
      $scope.printList = function(maxRows) {
        verifyEventHandlers();
        var veryLargeNumber = "999999999";
        var print = true;
        var features = "resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=yes,location=no";
        if (navigator.appVersion.indexOf("Mac OS X") != -1 && navigator.appVersion.indexOf("Chrome") != -1)
          features = "";
        var href = "";
        if (top.gsft_main)
          var frame = top.gsft_main.gsft_list_form_modal;
        if (!frame) {
          frame = top.gsft_main;
          if (!frame)
            frame = top;
        }
        if (frame.document.getElementById("printURL") != null) {
          href = frame.document.getElementById("printURL").value;
          href = printListURLDecode(href);
        }
        if (!href) {
          if (frame.document.getElementById("sysparm_total_rows") != null) {
            validateMaxRows(maxRows);
          }
          var formTest;
          var f = 0;
          var form;
          while ((formTest = frame.document.forms[f++])) {
            if (formTest.id == 'sys_personalize_ajax') {
              form = formTest;
              break;
            }
          }
          if (!form)
            form = frame.document.forms['sys_personalize'];
          if (form && form.sysparm_referring_url) {
            href = form.sysparm_referring_url.value;
            if (href.indexOf("?sys_id=-1") != -1 && !href.startsWith('sys_report_template')) {
              alert(getMessage("Please save the current form before printing."));
              return false;
            }
            if (navigator.appVersion.indexOf("MSIE") != -1) {
              var isFormPage = frame.document.getElementById("isFormPage");
              if (isFormPage != null && isFormPage.value == "true")
                href = href.replace(/javascript%3A/gi, "_javascript_%3A");
            }
            href = printListURLDecode(href);
          } else
            href = document.getElementById("gsft_main").contentWindow.location.href;
        }
        if (href.indexOf("?") < 0)
          href += "?";
        else
          href += "&";
        href = href.replace("partial_page=", "syshint_unimportant=");
        href = href.replace("sysparm_media=", "syshint_unimportant=");
        href += "sysparm_stack=no&sysparm_force_row_count=" + veryLargeNumber + "&sysparm_media=print";
        if (print) {
          if (href != null && href != "") {
            win = window.open(href, "Printer_friendly_format", features);
            win.focus();
          } else {
            alert("Nothing to print");
          }
        }
      };

      function verifyEventHandlers(maxRows) {
        var mainWin = getMainWindow();
        if (mainWin && mainWin.CustomEvent && mainWin.CustomEvent.fire && mainWin.CustomEvent.fire("print", maxRows) === false)
          return false;
      }

      function validateMaxRows(maxRows) {
        var mRows = parseInt(maxRows);
        if (mRows < 1)
          mRows = 5000;
        var totalrows = frame.document.getElementById("sysparm_total_rows").value;
        if (parseInt(totalrows) > parseInt(mRows))
          print = confirm(getMessage("Printing large lists may affect system performance. Continue?"));
      }

      function printListURLDecode(href) {
        href = href.replace(/@99@/g, "&");
        href = href.replace(/@88@/g, "@99@");
        href = href.replace(/@77@/g, "@88@");
        href = href.replace(/@66@/g, "@77@");
        return href;
      }

      function getMainWindow() {
        var topWindow = getTopWindow();
        return topWindow['gsft_main'];
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
    }
  }
});;
/*! RESOURCE: /scripts/concourse/directive.applicationPicker.js */
angular.module('sn.concourse').directive('applicationPicker', [
  'snCustomEvent',
  'getTemplateUrl',
  '$rootScope',
  'userPreferences',
  'applicationService',
  function(snCustomEvent, getTemplateUrl, $rootScope, userPreferences, applicationService) {
    "use strict"
    return {
      restrict: 'E',
      replace: false,
      templateUrl: getTemplateUrl('concourse_application_picker.xml'),
      scope: {
        current: '=',
        inHeader: '=',
        showInHeader: '='
      },
      controller: function($scope) {
        $scope.closeModal = function() {
          angular.element('#settings_modal').modal('hide');
        };
        $scope.app = applicationService.applicationData;
        if ($scope.current) {
          applicationService.initialize($scope.current, $scope.showInHeader);
        }
        $scope.refreshApplicationPicker = function() {
          applicationService.getApplicationList();
        };
        $scope.updateCurrent = function() {
          applicationService.updateCurrent();
        };
        snCustomEvent.observe('glide:ui_notification.application_change', function() {
          applicationService.getApplicationList();
        });
        snCustomEvent.observe('sn:refresh_application_picker', function() {
          applicationService.getApplicationList();
        });
        snCustomEvent.observe('sn:change_application', function(appId) {
          applicationService.getApplicationList().then(function() {
            applicationService.applicationData.currentId = appId;
            $scope.updateCurrent();
          });
        });
      },
      link: function(scope, element) {
        element.tooltip({
          selector: '[data-toggle="tooltip"]',
          title: function() {
            var $this = angular.element(this);
            return $this.attr('title') || $this.text();
          }
        });
        element.on('mouseover', function() {
          if (!applicationService.hasFetchedData()) {
            applicationService.getApplicationList();
          }
        });
        element.on('change', 'input[type=checkbox]', function() {
          var showInHeader = angular.element(this).prop('checked');
          applicationService.applicationData.showInHeader = showInHeader;
          scope.showInHeader = showInHeader;
          if (showInHeader) {
            userPreferences.setPreference('glide.ui.application_picker.in_header', 'true');
          } else {
            userPreferences.setPreference('glide.ui.application_picker.in_header', '');
          }
        });
        $rootScope.$on('concourse.application.refresh', function() {
          var iframe = jQuery('iframe#gsft_main');
          if (iframe.length) {
            iframe[0].contentWindow.location.reload();
          }
        });
      }
    }
  }
]).factory('applicationService', ['$http', 'snCustomEvent', '$rootScope', function($http, snCustomEvent, $rootScope) {
  var fetchedInitialData = false;
  var initialized = false;
  var applicationData = {
    list: [],
    current: {},
    currentId: '',
    showInHeader: false
  };
  var hasFetchedData = function() {
    return fetchedInitialData;
  };
  var initialize = function(current, showInHeader) {
    if (initialized)
      return;
    initialized = true;
    applicationData.list = [current];
    applicationData.current = current;
    applicationData.currentId = current.sysId;
    applicationData.showInHeader = showInHeader;
  };
  var getApplicationList = function() {
    fetchedInitialData = true;
    return $http.get('/api/now/ui/concoursepicker/application?cache=' + new Date().getTime()).then(function(response) {
      if (response && response.data && response.data.result) {
        applicationData.list = response.data.result.list;
        if (response.data.result.current && response.data.result.current != applicationData.currentId) {
          var apps = response.data.result.list;
          var curr = response.data.result.current;
          for (var i = 0; i < apps.length; i++) {
            if (curr == apps[i].sysId) {
              applicationData.current = apps[i]
              applicationData.currentId = apps[i].sysId;
              break;
            }
          }
          triggerChangeEvent();
        }
      }
    });
  };
  var updateCurrent = function() {
    var apps = applicationData.list;
    var curr = applicationData.currentId;
    for (var i = 0; i < apps.length; i++) {
      if (curr == apps[i].sysId) {
        applicationData.current = apps[i];
        break;
      }
    }
    $http.put('/api/now/ui/concoursepicker/application', {
      app_id: applicationData.currentId
    }).then(function(response) {
      if (response && response.data && response.data.result && response.data.result.app_id) {
        triggerRefreshFrameEvent();
        triggerChangeEvent();
      }
    });
  };

  function triggerChangeEvent() {
    $rootScope.$broadcast('concourse.application.changed', applicationData.current);
  }

  function triggerRefreshFrameEvent() {
    $rootScope.$broadcast('concourse.application.refresh', {});
  }
  $rootScope.$on('concourse.application.changed', function(evt, current) {
    applicationData.current = current;
    applicationData.currentId = current.sysId;
  });
  return {
    hasFetchedData: hasFetchedData,
    getApplicationList: getApplicationList,
    updateCurrent: updateCurrent,
    applicationData: applicationData,
    initialize: initialize
  }
}]);;
/*! RESOURCE: /scripts/concourse/directive.updateSetPicker.js */
angular.module('sn.concourse').directive('updateSetPicker', [
  'snCustomEvent',
  'getTemplateUrl',
  '$rootScope',
  'userPreferences',
  'updateSetService',
  function(snCustomEvent, getTemplateUrl, $rootScope, userPreferences, updateSetService) {
    "use strict"
    return {
      restrict: 'E',
      replace: false,
      templateUrl: getTemplateUrl('concourse_update_set_picker.xml'),
      scope: {
        current: '=',
        inHeader: '=',
        showInHeader: '='
      },
      controller: function($scope) {
        $scope.closeModal = function() {
          angular.element('#settings_modal').modal('hide');
        };
        if ($scope.current) {
          updateSetService.initialize($scope.current, $scope.showInHeader);
        }
        $scope.updateSets = updateSetService.updateSetData;
        $scope.getUpdateSetList = function() {
          return updateSetService.getUpdateSetList();
        };
        $scope.refreshUpdateSetList = $scope.getUpdateSetList;
        $scope.updateCurrent = function() {
          updateSetService.updateCurrent();
        };
        $rootScope.$on('concourse.update_set.in_header.change', function(evt, showInHeader) {
          $scope.showInHeader = showInHeader;
        });
        snCustomEvent.observe('sn:change_update_set', function(updateSetId) {
          $scope.getUpdateSetList().then(function() {
            updateSetService.updateSetData.currentId = updateSetId;
            $scope.updateCurrent();
          });
        });
      },
      link: function(scope, element) {
        element.tooltip({
          selector: '[data-toggle="tooltip"]',
          title: function() {
            var $this = angular.element(this);
            return $this.attr('title') || $this.text();
          }
        });
        element.on('mouseover', function() {
          if (!updateSetService.hasFetchedData()) {
            updateSetService.getUpdateSetList();
          }
        });
        element.on('change', 'input[type=checkbox]', function() {
          var showInHeader = angular.element(this).prop('checked');
          updateSetService.updateSetData.showInHeader = showInHeader;
          scope.showInHeader = showInHeader;
          if (showInHeader) {
            userPreferences.setPreference('glide.ui.update_set_picker.in_header', 'true');
          } else {
            userPreferences.setPreference('glide.ui.update_set_picker.in_header', '');
          }
        });
      }
    }
  }
]).factory('updateSetService', ['$http', 'snCustomEvent', '$rootScope', function($http, snCustomEvent, $rootScope) {
  var fetchedInitialData = false;
  var initialized = false;
  var updateSetData = {
    list: [],
    current: {},
    currentId: '',
    showInHeader: false
  };
  var hasFetchedData = function() {
    return fetchedInitialData;
  };
  var initialize = function(current, showInHeader) {
    if (initialized)
      return;
    initialized = true;
    updateSetData.list = [current];
    updateSetData.current = current;
    updateSetData.currentId = current.sysId;
    updateSetData.showInHeader = showInHeader;
  };
  var updateCurrent = function() {
    var updateSets = updateSetData.list;
    var curr = updateSetData.currentId;
    for (var i = 0; i < updateSets.length; i++) {
      if (curr == updateSets[i].sysId) {
        updateSetData.current = updateSets[i];
      }
    }
    $http.put('/api/now/ui/concoursepicker/updateset', updateSetData.current);
  };
  var getUpdateSetList = function() {
    fetchedInitialData = true;
    return $http.get('/api/now/ui/concoursepicker/updateset?cache=' + new Date().getTime()).then(function(response) {
      if (response && response.data && response.data.result) {
        if (response.data.result.updateSet) {
          updateSetData.list = response.data.result.updateSet;
          if (response.data.result.current) {
            var updateSets = response.data.result.updateSet;
            var curr = response.data.result.current;
            for (var i = 0; i < updateSets.length; i++) {
              if (curr.sysId == updateSets[i].sysId) {
                updateSetData.current = updateSets[i];
                updateSetData.currentId = updateSets[i].sysId;
                break;
              }
            }
          }
        }
      }
    });
  };
  snCustomEvent.observe('sn:refresh_update_set', function() {
    getUpdateSetList();
  });
  $rootScope.$on('concourse.application.changed', function() {
    getUpdateSetList();
  });
  return {
    hasFetchedData: hasFetchedData,
    updateSetData: updateSetData,
    initialize: initialize,
    updateCurrent: updateCurrent,
    getUpdateSetList: getUpdateSetList
  }
}]);;
/*! RESOURCE: /scripts/concourse/directive.preferencePicker.js */
angular.module('sn.concourse').directive('preferencePicker', ['$http', 'getTemplateUrl', function($http, getTemplateUrl) {
  "use strict";
  return {
    templateUrl: getTemplateUrl('concourse_preference_picker.xml'),
    restrict: 'E',
    scope: {
      current: '=',
      list: '=',
      endpoint: '@',
      reload: '@',
      labelTitle: '@',
      refreshTitle: '@'
    },
    controller: function($scope) {
      $scope.getList = function() {
        $http.get('/api/now/ui/concoursepicker/' + $scope.endpoint).then(function(response) {
          if (response && response.data && response.data.result && response.data.result.list) {
            $scope.list = response.data.result.list;
            if (response.data.result.current) {
              $scope.current = response.data.result.current;
            }
          }
        });
      };
      $scope.refreshPicker = function() {
        $scope.getList();
      };
      $scope.updateCurrent = function() {
        $http.put('/api/now/ui/concoursepicker/' + $scope.endpoint, {
          current: $scope.current
        }).then(function(response) {
          if (response && response.data && response.data.result && response.data.result.success) {
            if ($scope.reload) {
              $scope.reloadPage();
            }
          }
        })
      };
      $scope.reloadPage = function() {
        window.top.location.reload(true);
      };
    }
  }
}]);;
/*! RESOURCE: /scripts/concourse/directive.domainPicker.js */
angular.module('sn.concourse').directive('domainPicker', [
  'getTemplateUrl',
  'domainService',
  '$rootScope',
  'userPreferences',
  'snCustomEvent',
  function(getTemplateUrl, domainService, $rootScope, userPreferences, snCustomEvent) {
    "use strict";
    return {
      templateUrl: getTemplateUrl('concourse_domain_picker.xml'),
      restrict: 'E',
      replace: false,
      scope: {
        current: '=',
        inHeader: '=',
        showInHeader: '='
      },
      controller: function($scope) {
        $scope.domains = domainService.domainData;
        if ($scope.current)
          domainService.initialize($scope.current, $scope.showInHeader);
        $scope.domainList = $scope.domains.list;
        $scope.getDomains = function() {
          domainService.getDomainList();
        };
        $scope.updateDomain = function() {
          domainService.setDomain();
        };
        $rootScope.$on('concourse.domain.refresh', function() {
          $scope.refreshMainFrame();
        });
      },
      link: function(scope, element) {
        element.on('mouseover', function() {
          if (!domainService.hasFetchedData()) {
            domainService.getDomainList();
          }
        });
        scope.refreshMainFrame = function() {
          var iframe = jQuery('iframe#gsft_main');
          if (iframe.length) {
            iframe[0].contentWindow.location.reload();
          }
          snCustomEvent.fireTop('navigator.refresh');
        };
        element.on('change', 'input[type=checkbox]', function() {
          var showInHeader = angular.element(this).prop('checked');
          domainService.domainData.showInHeader = showInHeader;
          scope.showInHeader = showInHeader;
          if (showInHeader) {
            userPreferences.setPreference('glide.ui.domain_picker.in_header', 'true');
          } else {
            userPreferences.setPreference('glide.ui.domain_picker.in_header', '');
          }
        });
      }
    }
  }
]).factory('domainService', ['$http', 'snCustomEvent', '$rootScope', '$timeout', function($http, snCustomEvent, $rootScope, $timeout) {
  var fetchedInitialData = false;
  var initialized = false;
  var domainData = {
    list: [],
    current: {},
    currentValue: "",
    showInHeader: false
  };
  var hasFetchedData = function() {
    return fetchedInitialData;
  };
  var initialize = function(current, showInHeader) {
    if (initialized)
      return;
    initialized = true;
    domainData.list = [current];
    domainData.current = current;
    domainData.currentValue = current.value;
    domainData.showInHeader = showInHeader;
  };
  var getDomainList = function() {
    fetchedInitialData = true;
    return $http.get('/api/now/ui/concoursepicker/domain?cache=' + new Date().getTime()).then(function(response) {
      if (response && response.data && response.data.result) {
        if (response.data.result.list) {
          domainData.list = response.data.result.list;
          if (response.data.result.current) {
            var list = domainData.list;
            var curr = response.data.result.current.value;
            for (var i = 0; i < list.length; i++) {
              if (curr == list[i].value) {
                domainData.current = list[i];
                domainData.currentValue = list[i].value;
              }
            }
          }
        }
      }
    });
  };
  var setDomain = function() {
    setCurrent(domainData.currentValue);
    $http.put('/api/now/ui/concoursepicker/domain', domainData.current).then(function(response) {
      if (response && response.data && response.data.result && response.data.result.current) {
        triggerMainFrameRefresh();
      }
    });
  };

  function triggerMainFrameRefresh() {
    $rootScope.$broadcast('concourse.domain.refresh', {});
    snCustomEvent.fireTop('navigator.refresh');
  }

  function setCurrent(value) {
    var list = domainData.list;
    for (var i = 0; i < list.length; i++) {
      if (value == list[i].value) {
        domainData.current = list[i];
        return;
      }
    }
  }

  function setDomainFromName(domainName) {
    if (!fetchedInitialData) {
      getDomainList().then(function() {
        $timeout(setDomainFromName(domainName));
      });
    }
    for (var i = 0; i < domainData.list.length; i++) {
      if (domainData.list[i].label == domainName) {
        domainData.current = domainData.list[i];
        domainData.currentValue = domainData.list[i].value;
      }
    }
  }
  snCustomEvent.observe('glide:ui_notification.session_change', function(data) {
    if (typeof data.xml.dataset !== 'undefined' &&
      data.xml.dataset.attrSession_domain !== 'undefined' &&
      domainData.currentValue !== data.xml.dataset.attrSession_domain) {
      domainData.currentValue = data.xml.dataset.attrSession_domain;
      setCurrent(domainData.currentValue);
    }
  });
  snCustomEvent.observe('record.domain', function(domain) {
    if (typeof domain === 'string' && domain.length && domainData.currentValue !== domain) {
      setDomainFromName(domain);
    }
  });
  return {
    initialize: initialize,
    setDomain: setDomain,
    getDomainList: getDomainList,
    hasFetchedData: hasFetchedData,
    domainData: domainData
  }
}]);;
/*! RESOURCE: /scripts/concourse/directive.encryptionPicker.js */
angular.module('sn.concourse').directive('encryptionPicker', [
  'snCustomEvent',
  'getTemplateUrl',
  'encryptionService',
  '$rootScope',
  'userPreferences',
  function(snCustomEvent, getTemplateUrl, encryptionService, $rootScope, userPreferences) {
    "use strict"
    return {
      templateUrl: getTemplateUrl('concourse_encryption_picker.xml'),
      restrict: 'E',
      replace: false,
      scope: {
        current: '=',
        inHeader: '=',
        showInHeader: '='
      },
      controller: function($scope) {
        $scope.encryptions = encryptionService.encryptionData;
        if ($scope.current)
          encryptionService.initialize($scope.current, $scope.showInHeader);
        $scope.getEncryptions = function() {
          encryptionService.getEncryptionList();
        };
        $scope.updateEncryption = function() {
          encryptionService.setEncryption();
        };
      },
      link: function(scope, element) {
        element.on('mouseover', function() {
          if (!encryptionService.hasFetchedData()) {
            encryptionService.getEncryptionList();
          }
        });
        element.on('change', 'input[type=checkbox]', function() {
          var showInHeader = angular.element(this).prop('checked');
          encryptionService.encryptionData.showInHeader = showInHeader;
          scope.showInHeader = showInHeader;
          if (showInHeader) {
            userPreferences.setPreference('glide.ui.encryption_picker.in_header', 'true');
          } else {
            userPreferences.setPreference('glide.ui.encryption_picker.in_header', '');
          }
        });
      }
    }
  }
]).factory('encryptionService', ['$http', 'snCustomEvent', '$rootScope', function($http, snCustomEvent, $rootScope) {
  var fetchedInitialData = false;
  var initialized = false;
  var encryptionData = {
    list: [],
    current: {},
    currentValue: "",
    showInHeader: false
  };
  var hasFetchedData = function() {
    return fetchedInitialData;
  };
  var initialize = function(current, showInHeader) {
    if (initialized)
      return;
    initialized = true;
    encryptionData.list = [current];
    encryptionData.current = current;
    encryptionData.currentValue = current.value;
    encryptionData.showInHeader = showInHeader;
  };
  var getEncryptionList = function() {
    fetchedInitialData = true;
    $http.get('/api/now/ui/concoursepicker/encryption?cache=' + new Date().getTime()).then(function(response) {
      if (response && response.data && response.data.result) {
        if (response.data.result.list) {
          encryptionData.list = response.data.result.list;
          if (response.data.result.current) {
            var list = encryptionData.list;
            var curr = response.data.result.current.value;
            for (var i = 0; i < list.length; i++) {
              if (curr == list[i].value) {
                encryptionData.current = list[i];
                encryptionData.currentValue = list[i].value;
              }
            }
          }
        }
      }
    });
  };
  var setEncryption = function() {
    setCurrent(encryptionData.currentValue);
    $http.put('/api/now/ui/concoursepicker/encryption', {
      id: encryptionData.current.value
    }).then(function(response) {});
  };

  function setCurrent(id) {
    var list = encryptionData.list;
    for (var i = 0; i < list.length; i++) {
      if (id == list[i].value) {
        encryptionData.current = list[i];
        return;
      }
    }
  };
  return {
    initialize: initialize,
    setEncryption: setEncryption,
    getEncryptionList: getEncryptionList,
    hasFetchedData: hasFetchedData,
    encryptionData: encryptionData
  }
}]);;
/*! RESOURCE: /scripts/concourse/directive.javascriptDebugger.js */
angular.module("sn.concourse").directive('javascriptDebugger', function(getTemplateUrl) {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      moreinfo: '@',
      type: '@'
    },
    templateUrl: getTemplateUrl('concourse_javascript_debugger.xml'),
    controller: function($scope) {
      $scope.visible = isDebugPanelVisible();
      $scope.showJsDebugger = function() {
        var isVisible = isDebugPanelVisible();
        if (!isVisible)
          initDebugIframe();
        var jqueryLayout = document.getElementById('edge_south_debug').parentNode;
        if (jqueryLayout.className.indexOf("navpage-bottom-hidden") == -1) {
          jqueryLayout.className += " navpage-bottom-hidden";
        } else {
          jqueryLayout.className = jqueryLayout.className.replace(' navpage-bottom-hidden', '');
        }
        isVisible = !isVisible;
        var debuggerFrame = getTopWindow()['javascript_debugger'];
        var cevt = debuggerFrame.CustomEvent;
        if (!cevt && debuggerFrame.contentWindow)
          cevt = debuggerFrame.contentWindow.CustomEvent;
        if (cevt && cevt.fire) {
          cevt.fire(isVisible ? 'debuggerTools.visible' : 'debuggerTools.hidden');
        }
      };

      function isDebugPanelVisible() {
        var jqueryLayout = document.getElementById('edge_south_debug').parentNode;
        if (jqueryLayout) {
          return jqueryLayout.className.indexOf("navpage-bottom-hidden") == -1;
        } else {
          return false;
        }
      }

      function initDebugIframe() {
        var footerTrayFrm = document.getElementById('javascript_debugger');
        if (!footerTrayFrm.isLoaded) {
          footerTrayFrm.src = 'concourseJsDebug.do?sysparm_doctype=true&sysparm_stack=no';
          footerTrayFrm.isLoaded = true;
          debugToolSplitterContext.init();
          var debugToolsSplitterH = document.getElementById('debugToolsSplitterH');
          if (debugToolsSplitterH)
            debugToolsSplitterH.observe('mousedown', debugToolSplitterContext.mouseDownHandler);
        }
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
      var debugToolSplitterContext = function() {
        var isDragSplitter = false;
        var footerTray = null;
        var splitter_h = null;
        var ghostSplitter = null;
        var glassPane = null;
        var minCloseHeight = 15;
        var minHeight = 38;
        var me = null;

        function setGhost() {
          var dims = footerTray.getDimensions();
          var rect = splitter_h.getClientRects();
          ghostSplitter.setStyle('width:' + dims.width + 'px;left:' + rect.left + 'px;display:block;');
        }

        function hideGhost() {
          ghostSplitter.setStyle('display:none;top:-100px;');
          glassPane.setStyle('display:none;width:0px;height:0px;');
        }

        function mouseMoveHandler(e) {
          if (isDragSplitter !== true) return;
          var mouseY = e.pageY || e.clientY + document.documentElement.scrollTop - 3;
          var size = glassPane.getDimensions().height - mouseY;
          if (size >= minCloseHeight)
            ghostSplitter.setStyle('top:' + mouseY + 'px');
        }

        function mouseDownHandler(e) {
          if (e.element().id == 'debugToolsSplitterH') {
            Event.stop(e);
            footerTray = $('footerTray');
            splitter_h = $('debugToolsSplitterH');
            ghostSplitter = $('ghostSplitter');
            glassPane = $('glassPane');
            if (glassPane == null) {
              var div = document.createElement('div');
              div.id = 'glassPane';
              div.className = 'glass-pane';
              document.body.appendChild(div);
              glassPane = $('glassPane');
            } else {
              glassPane.setStyle('display:block;height:100%;width:100%;');
            }
            glassPane.observe('mouseup', me.endDragHandler);
            glassPane.observe('mouseout', me.endDragHandler);
            glassPane.observe('mousemove', me.mouseMoveHandler);
            isDragSplitter = true;
            setGhost();
            me.mouseMoveHandler(e);
          }
        }

        function endDragHandler(e) {
          if (isDragSplitter === true) {
            isDragSplitter = false;
            var mouseY = e.pageY || e.clientY + document.documentElement.scrollTop;
            mouseY = glassPane.getDimensions().height - mouseY;
            if (mouseY < minCloseHeight) {
              debuggerTools.toggleJSDebugger();
            } else {
              mouseY = (mouseY < minHeight) ? minHeight : mouseY + 5;
              footerTray.setStyle('height:' + mouseY + 'px');
              footerTray.restoreHeight = mouseY;
            }
            hideGhost();
          }
          if (glassPane) {
            glassPane.stopObserving('mouseup', me.endDragHandler);
            glassPane.stopObserving('mouseout', me.endDragHandler);
            glassPane.stopObserving('mousemove', me.mouseMoveHandler);
          }
          footerTray = null;
          splitter_h = null;
          ghostSplitter = null;
          glassPane = null;
        }
        return {
          init: function() {
            me = this;
          },
          mouseDownHandler: mouseDownHandler,
          endDragHandler: endDragHandler,
          mouseMoveHandler: mouseMoveHandler
        };
      }();
    }
  }
});;
/*! RESOURCE: /scripts/concourse/debuggerTools.js */
var debuggerTools = function() {
    var minHeight = 38;

    function restoreHeight() {
      if (!isDebugPanelVisible())
        return;
      var panel = document.getElementById('edge_south_debug') || document.getElementById('footerTray');
      if (panel.getHeight() <= minHeight)
        toggleTrayCollapsed();
    }

    function toggleTrayCollapsed() {
      if (!isDebugPanelVisible())
        return;
      var jqueryLayout = document.getElementById('edge_south_debug');
      var minimize = false;
      if (jqueryLayout) {
        var myLayout = $j(document.body).layout();
        var height = minHeight - 7;
        minimize = (jqueryLayout.getHeight() > height);
        myLayout.sizePane("south", minimize ? height : myLayout.restoreHeight);
      } else {
        var footerTray = document.getElementById('footerTray');
        minimize = (footerTray.getHeight() > minHeight);
        footerTray.style.height = (minimize ? minHeight : footerTray.restoreHeight) + 'px';
      }
    }

    function initDebugIframe() {
      var javascriptDebugger = document.getElementById('javascript_debugger');
      if (!javascriptDebugger.isLoaded) {
        javascriptDebugger.src = 'concourseJsDebug.do?sysparm_doctype=true&sysparm_stack=no';
        javascriptDebugger.isLoaded = true;
        debugToolSplitterContext.init();
        var debugToolsSplitterH = document.getElementById('debugToolsSplitterH');
        if (debugToolsSplitterH)
          debugToolsSplitterH.observe('mousedown', debugToolSplitterContext.mouseDownHandler);
      }
    }

    function selectFieldWatcherTab() {
      var wndw = getJsDebugWindow();
      if (!wndw || !wndw.selectFieldWatcherTab)
        setTimeout(selectFieldWatcherTab, 100);
      else
        wndw.selectFieldWatcherTab();
    }

    function isDebugPanelVisible() {
      var jqueryLayout = document.getElementById('edge_south_debug');
      if (jqueryLayout) {
        return window.getComputedStyle(jqueryLayout, null).height != "0px";
      } else {
        var footerTrayRow = document.getElementById('footerTrayRow');
        if (footerTrayRow)
          return (footerTrayRow.className.indexOf('footer-tray-hidden') == -1);
        else
          return false;
      }
    }

    function t