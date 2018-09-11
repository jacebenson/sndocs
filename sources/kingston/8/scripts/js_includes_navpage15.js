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
        if (val && $scope.type === 'boolean') {
          try {
            $scope.prefValue = JSON.parse(val);
          } catch (e) {
            $scope.prefValue = val;
          }
        } else
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

  function toggleJSDebugger() {
    var isVisible = isDebugPanelVisible();
    if (!isVisible)
      initDebugIframe();
    var jqueryLayout = document.getElementById('edge_south_debug').parentElement;
    if (jqueryLayout) {
      if (jqueryLayout.className.indexOf("navpage-bottom-hidden") == -1)
        jqueryLayout.className += " navpage-bottom-hidden";
      else
        jqueryLayout.className = jqueryLayout.className.replace(" navpage-bottom-hidden", "");
    } else {
      var footerTrayRow = document.getElementById('footerTrayRow');
      if (footerTrayRow)
        footerTrayRow.toggleClassName('footer-tray-hidden');
    }
    isVisible = !isVisible;
    var debuggerFrame = getTopWindow()['javascript_debugger'];
    var cevt = debuggerFrame.CustomEvent;
    if (!cevt && debuggerFrame.contentWindow)
      cevt = debuggerFrame.contentWindow.CustomEvent;
    if (cevt && cevt.fire) {
      cevt.fire(isVisible ? 'debuggerTools.visible' : 'debuggerTools.hidden');
    }
  }

  function showFieldWatcher() {
    toggleJSDebugger();
    selectFieldWatcherTab();
  }

  function getJsDebugWindow() {
    return document.getElementById('javascript_debugger').contentWindow;
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
  return {
    restoreHeight: restoreHeight,
    toggleTrayCollapsed: toggleTrayCollapsed,
    isDebugPanelVisible: isDebugPanelVisible,
    toggleJSDebugger: toggleJSDebugger,
    showJSDebugger: toggleJSDebugger,
    showFieldWatcher: showFieldWatcher,
    getJsDebugWindow: getJsDebugWindow
  };
}();

function jslog(msg, src, dateTime) {
  if (window.console && window.console.log)
    console.log(msg);
  if (debuggerTools.isDebugPanelVisible()) {
    if (!src)
      src = "navpage.do";
    if (typeof getFormattedTime == "function") {
      msg = '<div class="debug_line"><span class="log-time CLIENT">' + getFormattedTime(dateTime) + '</span><span class="log-category">' + src + '</span><span class="log-message">' + msg + "</span></div>";
    } else {
      msg = '<div class="debug_line"><span class="log-time CLIENT">' + getTimeFormatted(dateTime) + '</span><span class="log-category">' + src + '</span><span class="log-message">' + msg + "</span></div>";
    }
    var wndw = debuggerTools.getJsDebugWindow();
    if (typeof wndw != undefined && wndw.addJsLogMessage)
      wndw.addJsLogMessage(msg);
  }
}

function getTimeFormatted(dateTime) {
  var d = new Date();
  var hour = d.getHours();
  var minute = d.getMinutes();
  var second = d.getSeconds();
  var millisecond = d.getMilliseconds();
  if (10 > hour)
    hour = "0" + hour;
  if (10 > minute)
    minute = "0" + minute;
  if (10 > second)
    second = "0" + second;
  if (100 > millisecond) {
    if (10 > millisecond)
      millisecond = "0" + millisecond;
    millisecond = "0" + millisecond;
  }
  var formattedTime = hour + ":" + minute + ":" + second + " (" + millisecond + ")";
  return formattedTime;
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
    ghostSplitter.setAttribute('style', 'width:' + dims.width + 'px;left:' + rect.left + 'px;display:block;');
  }

  function hideGhost() {
    ghostSplitter.setAttribute('style', 'display:none;top:-100px;');
    glassPane.setAttribute('style', 'display:none;width:0px;height:0px;');
  }

  function mouseMoveHandler(e) {
    if (isDragSplitter !== true) return;
    var mouseY = e.pageY || e.clientY + document.documentElement.scrollTop - 3;
    var size = glassPane.getDimensions().height - mouseY;
    if (size >= minCloseHeight)
      ghostSplitter.setAttribute('style', 'top:' + mouseY + 'px');
  }

  function mouseDownHandler(e) {
    if (e.element().id == 'debugToolsSplitterH') {
      Event.stop(e);
      footerTray = document.getElementById('footerTray');
      splitter_h = document.getElementById('debugToolsSplitterH');
      ghostSplitter = document.getElementById('ghostSplitter');
      glassPane = document.getElementById('glassPane');
      if (glassPane == null) {
        var div = document.createElement('div');
        div.id = 'glassPane';
        div.className = 'glass-pane';
        document.body.appendChild(div);
        glassPane = document.getElementById('glassPane');
      } else {
        glassPane.setAttribute('style', 'display:block;height:100%;width:100%;');
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
        footerTray.setAttribute('style', 'height:' + mouseY + 'px');
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
}();;
/*! RESOURCE: /scripts/concourse/directive.navBannerLogo.js */
angular.module('sn.concourse').directive('navBannerLogo', function(snCustomEvent, $sanitize) {
  "use strict";
  return {
    restrict: 'A',
    link: function($scope, $element) {
      snCustomEvent.observe('glide.product.image.light', function(value) {
        if (value)
          $element.find('[data-sys-properties="glide.product.image.light"]').css('background-image', 'url(' + value + ')');
      });
      snCustomEvent.observe('glide.product.description', function(value) {
        if (value)
          $element.find('[data-sys-properties="glide.product.description"]').html($sanitize(value));
      });
      snCustomEvent.observe('css.$navpage-header-bg', function(value) {
        if (value) {
          var props = {
            'background-color': [
              '.navpage-header',
              '.tabs-container ul li',
              '.panel-tool-icons',
              '.sn-connect-aside.sn-aside_inverted .sn-aside-group-title',
              '.nav-body .nav-favorites-show-application .nav-favorites-show-application-title',
              '.nav-body .nav-favorites-show-application .nav-favorites-show-more-title',
              '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-title',
              '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-title',
              '.sn-frameset-header'
            ],
            'border-color': ['.sn-navhub.sn-connect-aside-navhub']
          };
          for (var prop in props) {
            jQuery(props[prop].join(',')).css(prop, value);
          }
          var bannerImageContainer = jQuery('iFrame').contents().find('.header_color');
          if (bannerImageContainer)
            bannerImageContainer.css('background-color', value);
        }
      });
      snCustomEvent.observe('css.$navpage-header-color', function(value) {
        if (value) {
          var selectors = [
            '.sn-frameset-header .sysparm-search-icon:before',
            '.navpage-pickers .label-icon',
            '.tabs-container ul li a',
            '.sn-connect-aside.sn-aside_inverted',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li:active .sn-widget-list-title',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li:active .sn-widget-list-details',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-title',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-content',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-details',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-members-list-btn-close',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-title span',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-content span',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-details span',
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-members-list-btn-close span',
            '.nav-body .nav-favorites-show-application .nav-favorites-show-application-title',
            '.nav-body .nav-favorites-show-application .nav-favorites-show-more-title',
            '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-title',
            '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-title',
            '.nav-body ul.nav-application-tree .app-node:hover > .nav-favorite-app',
            '.nav-body ul.nav-history-list li a:hover span',
            '.sn-frameset-header .banner-text',
            '.current-user-dropdown'
          ];
          jQuery(selectors.join(',')).css('color', value);
        }
      });
      snCustomEvent.observe('css.$navpage-header-divider-color', function(value) {
        if (value) {
          var selectors = '.navpage-layout .navbar-divider';
          jQuery(selectors).css('background-color', value);
        }
      });
      snCustomEvent.observe('css.$navpage-nav-bg', function(value) {
        if (value) {
          var props = {
            'background-color': [
              '.navpage-nav',
              '.navpage-right',
              '.tabs-container',
              '.sn-connect-aside.sn-aside_inverted',
              '.sn-navhub.sn-connect-aside-navhub',
              '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons',
              '#favorite_preview',
              '.nav-edit-favorites-icon-grid > a.selected',
              '.magellan_navigator',
              '.nav-header input[name=filter]',
              '.nav-header input[name=filter]:focus',
              '.nav-body .nav-favorites-show-more',
              '.nav-body .nav-favorites-show-application .nav-favorites-show-application-inner',
              '.nav-body .nav-favorites-show-application .nav-favorites-show-more-inner',
              '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-inner',
              '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-inner',
              '.nav-body .nav-favorites-show-application .nav-favorites-show-application-inner .nav-favorite-group-title',
              '.nav-body .nav-favorites-show-application .nav-favorites-show-more-inner .nav-favorite-group-title',
              '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-inner .nav-favorite-group-title',
              '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-inner .nav-favorite-group-title',
              '.nav-body ul.nav-favorites-list',
              '.nav-body ul.nav-favorites-list .nav-favorite-group .nav-favorite-group-title',
              '.nav-footer',
              '.navpage-history ul > li',
              '.sn-pane-footer',
              '.sn-live-search'
            ],
            'border-color': [
              '.create-favorite .nav-edit-favorites-icon-grid > a.selected',
              '#icon_colors a.color-bg-white:focus, #icon_colors a.color-bg-white:active',
              '#icon_colors a:focus, #icon_colors a:active',
              '.favorite-preview',
              '.nav-edit-favorites-icon-grid > a:focus, .nav-edit-favorites-icon-grid > a:active'
            ],
            'border-right-color': [
              '.nav-body .nav-favorites-show-application .arrow',
              '.nav-body .nav-favorites-show-more-panel .arrow'
            ]
          };
          for (var prop in props) {
            jQuery(props[prop].join(',')).css(prop, value);
          }
        }
      });
      snCustomEvent.observe('css.$navpage-nav-bg-sub', function(value) {
        if (value) {
          var props = {
            'background-color': [
              '.sn-connect-aside.sn-aside_inverted',
              '.sn-navhub.sn-connect-aside-navhub',
              '.favorite-preview',
              '.nav-edit-favorites-icon-grid > a.selected',
              '.nav-body .nav-favorites-show-application .nav-favorites-show-application-inner',
              '.nav-body .nav-favorites-show-application .nav-favorites-show-more-inner',
              '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-inner',
              '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-inner',
              '.nav-body ul.nav-favorites-list',
              '.navpage-history ul > li',
              '.sn-aside.sn-aside_themed',
              '.sn-aside.sn-aside_themed .sn-widget-list_v2 .sn-widget-list-item:not(.module-node)'
            ],
            'border-color': [
              '#icon_colors a.color-bg-white:focus, #icon_colors a.color-bg-white:active',
              '#icon_colors a:focus, #icon_colors a:active',
              '.nav-edit-favorites-icon-grid > a:focus, .nav-edit-favorites-icon-grid > a:active'
            ],
            'border-right-color': [
              '.nav-body .nav-favorites-show-application .arrow',
              '.nav-body .nav-favorites-show-more-panel .arrow'
            ]
          };
          for (var prop in props) {
            jQuery(props[prop].join(',')).css(prop, value);
          }
        }
      });
      snCustomEvent.observe('css.$subnav-background-color', function(value) {
        if (value)
          jQuery('.nav-body ul li ul').css('background-color', value);
      });
      snCustomEvent.observe('css.$navpage-nav-border', function(value) {
        if (value) {
          var props = {
            'border-color': [
              '.sn-frameset-header #sysparm_search:focus',
              '.sn-frameset-header .dropdown.open button',
              '.nav-header input[name=filter]',
              '.nav-header input[name=filter]:focus',
              '.sn-live-search .twitter-typeahead input',
              '.sn-live-search-flex .form-control',
              '.sn-live-search-flex .form-control:focus'
            ],
            'border-top-color': [
              '.nav-body .nav-favorites-show-more',
              '.nav-footer',
              '.sn-pane-footer',
              '.panel-tool-icons'
            ],
            'border-left-color': [
              '.panel-tool-icons'
            ],
            'border-bottom-color': [
              '.navpage-nav-collapsed .nav-header',
              '.navpage-nav-collapsed .nav-body ul.nav-favorites-list > li > a'
            ]
          };
          for (var prop in props) {
            jQuery(props[prop].join(',')).css(prop, value);
          }
        }
      });
      snCustomEvent.observe('css.$navpage-nav-color-sub', function(value) {
        if (value) {
          var selectors = [
            '.magellan_navigator .sn-aside.sn-aside_themed .sn-widget-list_v2 li .sn-widget-list-action',
            '.magellan_navigator .sn-aside.sn-aside_themed .sn-widget-list_v2 .sn-widget-list_v2 li .sn-widget-list-action',
            '.magellan_navigator .sn-application-tree .sn-widget-list_v2 li .sn-widget-list-title',
            '.magellan_navigator .sn-application-tree .sn-widget-list_v2 li .sn-widget-list-subtitle',
            '.magellan_navigator .sn-application-tree .sn-widget-list_v2 li .sn-widget-list-action',
            '.magellan_navigator .sn-widget-list_indentation .sn-widget-list_v2 .sn-aside-group-title'
          ];
          jQuery(selectors.join(',')).css('color', value);
        }
      });
      snCustomEvent.observe('css.$navpage-nav-unselected-color', function(value) {
        if (value) {
          var selectors = [
            '.magellan_navigator .sn-navhub.sn-navhub_themed .sn-navhub-btn::before'
          ];
          jQuery(selectors.join(',')).css('color', value);
          try {
            document.styleSheets[0].addRule('.magellan_navigator .sn-navhub.sn-navhub_themed .sn-navhub-btn::before', 'color: ' + value + ' !important;');
          } catch (e) {}
        }
      });
      snCustomEvent.observe('css.$navpage-nav-selected-color', function(value) {
        if (value) {
          var selectors = [
            '.sn-connect-aside.sn-aside_inverted .sn-widget-list li:active',
            '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn:active',
            '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn.state-active',
            '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn:active::before',
            '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn.state-active::before',
            '.magellan-edit-mode .selected',
            '.magellan-edit-mode .selected .draggable',
            '.magellan-edit-mode .selected .nav-favorite-group-title',
            '.magellan-edit-mode .selected > a > div.nav-favorite-title',
            '.nav-header .nav-segmented li.active',
            '.nav-header .nav-segmented li.active a:focus',
            '.nav-body ul.nav-history-list li a:hover',
            '.sn-navhub.sn-navhub_themed .sn-navhub-btn.state-active'
          ];
          jQuery(selectors.join(',')).css('color', value);
          try {
            document.styleSheets[0].addRule('.sn-navhub.sn-navhub_themed .sn-navhub-btn.state-active::before', 'color: ' + value + ' !important;');
          } catch (e) {}
        }
      });
      snCustomEvent.observe('css.$nav-highlight-main', function(value) {
        if (value) {
          var selectors = [
            '.nav-body a:hover',
            '.nav-body a:focus',
            '.nav-body .nav-expandable:hover',
            '.nav-body .nav-app:hover, .nav-body .nav-app:focus',
            '.nav-body .nav-highlight',
            '.nav-body ul.nav-favorites-list > li > span:hover',
            '.nav-body ul.nav-favorites-list > li > a:hover',
            '.nav-body ul.nav-favorites-list .nav-favorite-group .nav-favorite-group-title:hover',
            '.nav-body ul.nav-history-list li a:hover',
            '.navpage-nav-collapsed .nav-body ul.nav-favorites-list > li .nav-favorite-group:hover'
          ];
          jQuery(selectors.join(',')).css('background-color', value);
        }
      });
      snCustomEvent.observe('css.$navpage-nav-selected-bg', function(value) {
        if (value) {
          var selectors = [
            '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn:active',
            '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn.state-active',
            '.magellan-edit-mode .selected',
            '.magellan-edit-mode .selected .nav-favorite-group-title',
            '.nav-header .nav-segmented li.active',
            '.sn-navhub.sn-navhub_themed .sn-navhub-btn.state-active'
          ];
          jQuery(selectors.join(',')).css('background-color', value);
          try {
            document.styleSheets[0].addRule('.sn-navhub.sn-navhub_themed .sn-navhub-btn.state-active::before', 'background-color: ' + value + ' !important;');
          } catch (e) {}
        }
      });
      snCustomEvent.observe('css.$nav-hr-color', function(value) {
        if (value)
          jQuery('.sn-aside.sn-aside_themed .sn-widget-list_v2 .sn-widget-list-divider').css('background-color', value);
      });
    }
  }
});;
/*! RESOURCE: /scripts/concourse/directive.concourseMainPane.js */
angular.module('sn.concourse').directive('concourseMainPane', function(getTemplateUrl, snCustomEvent, concoursePaneExtensionRegistry) {
  return {
    restrict: 'A',
    scope: {
      initialUrl: '@',
      test: '@',
      enableExtensions: '@'
    },
    link: function(scope, element) {
      init();

      function init() {
        var isIE9 = navigator.userAgent.indexOf('MSIE9') != -1;
        if (isIE9) {
          loadForIE9();
          return;
        }
        loadUrl(scope.initialUrl);
      }

      function loadForIE9() {
        var hash = window.location.hash;
        if (hash != '' && hash.indexOf('#/nav_to.do?uri=') == 0) {
          var uri = hash.substr(16);
          uri = decodeURIComponent(uri);
          if (uri.length > 1) {
            loadUrl(url);
          }
        }
      }

      function loadUrl(url) {
        getFrame().attr('src', url);
      }
      getFrame().bind('load', function() {
        showFrame();
      });
      snCustomEvent.observe('sn.spa.intercept', function(srcInfo) {
        if (scope.enableExtensions !== 'true')
          return;
        var type = srcInfo.type;
        var url = srcInfo.window.location.href;
        if (!concoursePaneExtensionRegistry.hasHandler(type))
          return;
        hideFrame();
        concoursePaneExtensionRegistry.process(type, getPaneExtensionContainer(), url, {
          startTime: srcInfo.window.g_loadTime
        });
        if ("stop" in srcInfo.window)
          srcInfo.window.stop();
        else
          srcInfo.document.execCommand("Stop");
        srcInfo.document.write('<!--');
      });

      function getPaneExtensionContainer() {
        return element.find('.extension-pane-container');
      }

      function getFrame() {
        return element.find('iframe[name=gsft_main]');
      }

      function hideFrame() {
        getFrame().hide();
        getPaneExtensionContainer().show();
      }

      function showFrame() {
        getPaneExtensionContainer().hide();
        getFrame().show();
      }
    }
  }
});;
/*! RESOURCE: /scripts/concourse_pane_extension/js_includes_concourse_pane_extension.js */
/*! RESOURCE: /scripts/thirdparty/ocLazyLoad/ocLazyLoad.js */
(function(angular, window) {
  'use strict';
  var regModules = ['ng', 'oc.lazyLoad'],
    regInvokes = {},
    regConfigs = [],
    modulesToLoad = [],
    realModules = [],
    recordDeclarations = [],
    broadcast = angular.noop,
    runBlocks = {},
    justLoaded = [];
  var ocLazyLoad = angular.module('oc.lazyLoad', ['ng']);
  ocLazyLoad.provider('$ocLazyLoad', ["$controllerProvider", "$provide", "$compileProvider", "$filterProvider", "$injector", "$animateProvider", function($controllerProvider, $provide, $compileProvider, $filterProvider, $injector, $animateProvider) {
    var modules = {},
      providers = {
        $controllerProvider: $controllerProvider,
        $compileProvider: $compileProvider,
        $filterProvider: $filterProvider,
        $provide: $provide,
        $injector: $injector,
        $animateProvider: $animateProvider
      },
      debug = false,
      events = false,
      moduleCache = [],
      modulePromises = {};
    moduleCache.push = function(value) {
      if (this.indexOf(value) === -1) {
        Array.prototype.push.apply(this, arguments);
      }
    };
    this.config = function(config) {
      if (angular.isDefined(config.modules)) {
        if (angular.isArray(config.modules)) {
          angular.forEach(config.modules, function(moduleConfig) {
            modules[moduleConfig.name] = moduleConfig;
          });
        } else {
          modules[config.modules.name] = config.modules;
        }
      }
      if (angular.isDefined(config.debug)) {
        debug = config.debug;
      }
      if (angular.isDefined(config.events)) {
        events = config.events;
      }
    };
    this._init = function _init(element) {
      if (modulesToLoad.length === 0) {
        var elements = [element],
          names = ['ng:app', 'ng-app', 'x-ng-app', 'data-ng-app'],
          NG_APP_CLASS_REGEXP = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/,
          append = function append(elm) {
            return elm && elements.push(elm);
          };
        angular.forEach(names, function(name) {
          names[name] = true;
          append(document.getElementById(name));
          name = name.replace(':', '\\:');
          if (typeof element[0] !== 'undefined' && element[0].querySelectorAll) {
            angular.forEach(element[0].querySelectorAll('.' + name), append);
            angular.forEach(element[0].querySelectorAll('.' + name + '\\:'), append);
            angular.forEach(element[0].querySelectorAll('[' + name + ']'), append);
          }
        });
        angular.forEach(elements, function(elm) {
          if (modulesToLoad.length === 0) {
            var className = ' ' + element.className + ' ';
            var match = NG_APP_CLASS_REGEXP.exec(className);
            if (match) {
              modulesToLoad.push((match[2] || '').replace(/\s+/g, ','));
            } else {
              angular.forEach(elm.attributes, function(attr) {
                if (modulesToLoad.length === 0 && names[attr.name]) {
                  modulesToLoad.push(attr.value);
                }
              });
            }
          }
        });
      }
      if (modulesToLoad.length === 0 && !((window.jasmine || window.mocha) && angular.isDefined(angular.mock))) {
        console.error('No module found during bootstrap, unable to init ocLazyLoad. You should always use the ng-app directive or angular.boostrap when you use ocLazyLoad.');
      }
      var addReg = function addReg(moduleName) {
        if (regModules.indexOf(moduleName) === -1) {
          regModules.push(moduleName);
          var mainModule = angular.module(moduleName);
          _invokeQueue(null, mainModule._invokeQueue, moduleName);
          _invokeQueue(null, mainModule._configBlocks, moduleName);
          angular.forEach(mainModule.requires, addReg);
        }
      };
      angular.forEach(modulesToLoad, function(moduleName) {
        addReg(moduleName);
      });
      modulesToLoad = [];
      recordDeclarations.pop();
    };
    var stringify = function stringify(obj) {
      try {
        return JSON.stringify(obj);
      } catch (e) {
        var cache = [];
        return JSON.stringify(obj, function(key, value) {
          if (angular.isObject(value) && value !== null) {
            if (cache.indexOf(value) !== -1) {
              return;
            }
            cache.push(value);
          }
          return value;
        });
      }
    };
    var hashCode = function hashCode(str) {
      var hash = 0,
        i,
        chr,
        len;
      if (str.length == 0) {
        return hash;
      }
      for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
      }
      return hash;
    };

    function _register(providers, registerModules, params) {
      if (registerModules) {
        var k,
          moduleName,
          moduleFn,
          tempRunBlocks = [];
        for (k = registerModules.length - 1; k >= 0; k--) {
          moduleName = registerModules[k];
          if (!angular.isString(moduleName)) {
            moduleName = getModuleName(moduleName);
          }
          if (!moduleName || justLoaded.indexOf(moduleName) !== -1 || modules[moduleName] && realModules.indexOf(moduleName) === -1) {
            continue;
          }
          var newModule = regModules.indexOf(moduleName) === -1;
          moduleFn = ngModuleFct(moduleName);
          if (newModule) {
            regModules.push(moduleName);
            _register(providers, moduleFn.requires, params);
          }
          if (moduleFn._runBlocks.length > 0) {
            runBlocks[moduleName] = [];
            while (moduleFn._runBlocks.length > 0) {
              runBlocks[moduleName].push(moduleFn._runBlocks.shift());
            }
          }
          if (angular.isDefined(runBlocks[moduleName]) && (newModule || params.rerun)) {
            tempRunBlocks = tempRunBlocks.concat(runBlocks[moduleName]);
          }
          _invokeQueue(providers, moduleFn._invokeQueue, moduleName, params.reconfig);
          _invokeQueue(providers, moduleFn._configBlocks, moduleName, params.reconfig);
          broadcast(newModule ? 'ocLazyLoad.moduleLoaded' : 'ocLazyLoad.moduleReloaded', moduleName);
          registerModules.pop();
          justLoaded.push(moduleName);
        }
        var instanceInjector = providers.getInstanceInjector();
        angular.forEach(tempRunBlocks, function(fn) {
          instanceInjector.invoke(fn);
        });
      }
    }

    function _registerInvokeList(args, moduleName) {
      var invokeList = args[2][0],
        type = args[1],
        newInvoke = false;
      if (angular.isUndefined(regInvokes[moduleName])) {
        regInvokes[moduleName] = {};
      }
      if (angular.isUndefined(regInvokes[moduleName][type])) {
        regInvokes[moduleName][type] = {};
      }
      var onInvoke = function onInvoke(invokeName, invoke) {
        if (!regInvokes[moduleName][type].hasOwnProperty(invokeName)) {
          regInvokes[moduleName][type][invokeName] = [];
        }
        if (checkHashes(invoke, regInvokes[moduleName][type][invokeName])) {
          newInvoke = true;
          regInvokes[moduleName][type][invokeName].push(invoke);
          broadcast('ocLazyLoad.componentLoaded', [moduleName, type, invokeName]);
        }
      };

      function checkHashes(potentialNew, invokes) {
        var isNew = true,
          newHash;
        if (invokes.length) {
          newHash = signature(potentialNew);
          angular.forEach(invokes, function(invoke) {
            isNew = isNew && signature(invoke) !== newHash;
          });
        }
        return isNew;
      }

      function signature(data) {
        if (angular.isArray(data)) {
          return hashCode(data.toString());
        } else if (angular.isObject(data)) {
          return hashCode(stringify(data));
        } else {
          if (angular.isDefined(data) && data !== null) {
            return hashCode(data.toString());
          } else {
            return data;
          }
        }
      }
      if (angular.isString(invokeList)) {
        onInvoke(invokeList, args[2][1]);
      } else if (angular.isObject(invokeList)) {
        angular.forEach(invokeList, function(invoke, key) {
          if (angular.isString(invoke)) {
            onInvoke(invoke, invokeList[1]);
          } else {
            onInvoke(key, invoke);
          }
        });
      } else {
        return false;
      }
      return newInvoke;
    }

    function _invokeQueue(providers, queue, moduleName, reconfig) {
      if (!queue) {
        return;
      }
      var i, len, args, provider;
      for (i = 0, len = queue.length; i < len; i++) {
        args = queue[i];
        if (angular.isArray(args)) {
          if (providers !== null) {
            if (providers.hasOwnProperty(args[0])) {
              provider = providers[args[0]];
            } else {
              throw new Error('unsupported provider ' + args[0]);
            }
          }
          var isNew = _registerInvokeList(args, moduleName);
          if (args[1] !== 'invoke') {
            if (isNew && angular.isDefined(provider)) {
              provider[args[1]].apply(provider, args[2]);
            }
          } else {
            var callInvoke = function callInvoke(fct) {
              var invoked = regConfigs.indexOf(moduleName + '-' + fct);
              if (invoked === -1 || reconfig) {
                if (invoked === -1) {
                  regConfigs.push(moduleName + '-' + fct);
                }
                if (angular.isDefined(provider)) {
                  provider[args[1]].apply(provider, args[2]);
                }
              }
            };
            if (angular.isFunction(args[2][0])) {
              callInvoke(args[2][0]);
            } else if (angular.isArray(args[2][0])) {
              for (var j = 0, jlen = args[2][0].length; j < jlen; j++) {
                if (angular.isFunction(args[2][0][j])) {
                  callInvoke(args[2][0][j]);
                }
              }
            }
          }
        }
      }
    }

    function getModuleName(module) {
      var moduleName = null;
      if (angular.isString(module)) {
        moduleName = module;
      } else if (angular.isObject(module) && module.hasOwnProperty('name') && angular.isString(module.name)) {
        moduleName = module.name;
      }
      return moduleName;
    }

    function moduleExists(moduleName) {
      if (!angular.isString(moduleName)) {
        return false;
      }
      try {
        return ngModuleFct(moduleName);
      } catch (e) {
        if (/No module/.test(e) || e.message.indexOf('$injector:nomod') > -1) {
          return false;
        }
      }
    }
    this.$get = ["$log", "$rootElement", "$rootScope", "$cacheFactory", "$q", function($log, $rootElement, $rootScope, $cacheFactory, $q) {
      var instanceInjector,
        filesCache = $cacheFactory('ocLazyLoad');
      if (!debug) {
        $log = {};
        $log['error'] = angular.noop;
        $log['warn'] = angular.noop;
        $log['info'] = angular.noop;
      }
      providers.getInstanceInjector = function() {
        return instanceInjector ? instanceInjector : instanceInjector = $rootElement.data('$injector') || angular.injector();
      };
      broadcast = function broadcast(eventName, params) {
        if (events) {
          $rootScope.$broadcast(eventName, params);
        }
        if (debug) {
          $log.info(eventName, params);
        }
      };

      function reject(e) {
        var deferred = $q.defer();
        $log.error(e.message);
        deferred.reject(e);
        return deferred.promise;
      }
      return {
        _broadcast: broadcast,
        _$log: $log,
        _getFilesCache: function getFilesCache() {
          return filesCache;
        },
        toggleWatch: function toggleWatch(watch) {
          if (watch) {
            recordDeclarations.push(true);
          } else {
            recordDeclarations.pop();
          }
        },
        getModuleConfig: function getModuleConfig(moduleName) {
          if (!angular.isString(moduleName)) {
            throw new Error('You need to give the name of the module to get');
          }
          if (!modules[moduleName]) {
            return null;
          }
          return angular.copy(modules[moduleName]);
        },
        setModuleConfig: function setModuleConfig(moduleConfig) {
          if (!angular.isObject(moduleConfig)) {
            throw new Error('You need to give the module config object to set');
          }
          modules[moduleConfig.name] = moduleConfig;
          return moduleConfig;
        },
        getModules: function getModules() {
          return regModules;
        },
        isLoaded: function isLoaded(modulesNames) {
          var moduleLoaded = function moduleLoaded(module) {
            var isLoaded = regModules.indexOf(module) > -1;
            if (!isLoaded) {
              isLoaded = !!moduleExists(module);
            }
            return isLoaded;
          };
          if (angular.isString(modulesNames)) {
            modulesNames = [modulesNames];
          }
          if (angular.isArray(modulesNames)) {
            var i, len;
            for (i = 0, len = modulesNames.length; i < len; i++) {
              if (!moduleLoaded(modulesNames[i])) {
                return false;
              }
            }
            return true;
          } else {
            throw new Error('You need to define the module(s) name(s)');
          }
        },
        _getModuleName: getModuleName,
        _getModule: function getModule(moduleName) {
          try {
            return ngModuleFct(moduleName);
          } catch (e) {
            if (/No module/.test(e) || e.message.indexOf('$injector:nomod') > -1) {
              e.message = 'The module "' + stringify(moduleName) + '" that you are trying to load does not exist. ' + e.message;
            }
            throw e;
          }
        },
        moduleExists: moduleExists,
        _loadDependencies: function _loadDependencies(moduleName, localParams) {
          var loadedModule,
            requires,
            diff,
            promisesList = [],
            self = this;
          moduleName = self._getModuleName(moduleName);
          if (moduleName === null) {
            return $q.when();
          } else {
            try {
              loadedModule = self._getModule(moduleName);
            } catch (e) {
              return reject(e);
            }
            requires = self.getRequires(loadedModule);
          }
          angular.forEach(requires, function(requireEntry) {
            if (angular.isString(requireEntry)) {
              var config = self.getModuleConfig(requireEntry);
              if (config === null) {
                moduleCache.push(requireEntry);
                return;
              }
              requireEntry = config;
              config.name = undefined;
            }
            if (self.moduleExists(requireEntry.name)) {
              diff = requireEntry.files.filter(function(n) {
                return self.getModuleConfig(requireEntry.name).files.indexOf(n) < 0;
              });
              if (diff.length !== 0) {
                self._$log.warn('Module "', moduleName, '" attempted to redefine configuration for dependency. "', requireEntry.name, '"\n Additional Files Loaded:', diff);
              }
              if (angular.isDefined(self.filesLoader)) {
                promisesList.push(self.filesLoader(requireEntry, localParams).then(function() {
                  return self._loadDependencies(requireEntry);
                }));
              } else {
                return reject(new Error('Error: New dependencies need to be loaded from external files (' + requireEntry.files + '), but no loader has been defined.'));
              }
              return;
            } else if (angular.isArray(requireEntry)) {
              var files = [];
              angular.forEach(requireEntry, function(entry) {
                var config = self.getModuleConfig(entry);
                if (config === null) {
                  files.push(entry);
                } else if (config.files) {
                  files = files.concat(config.files);
                }
              });
              if (files.length > 0) {
                requireEntry = {
                  files: files
                };
              }
            } else if (angular.isObject(requireEntry)) {
              if (requireEntry.hasOwnProperty('name') && requireEntry['name']) {
                self.setModuleConfig(requireEntry);
                moduleCache.push(requireEntry['name']);
              }
            }
            if (angular.isDefined(requireEntry.files) && requireEntry.files.length !== 0) {
              if (angular.isDefined(self.filesLoader)) {
                promisesList.push(self.filesLoader(requireEntry, localParams).then(function() {
                  return self._loadDependencies(requireEntry);
                }));
              } else {
                return reject(new Error('Error: the module "' + requireEntry.name + '" is defined in external files (' + requireEntry.files + '), but no loader has been defined.'));
              }
            }
          });
          return $q.all(promisesList);
        },
        inject: function inject(moduleName) {
          var localParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
          var real = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
          var self = this,
            deferred = $q.defer();
          if (angular.isDefined(moduleName) && moduleName !== null) {
            if (angular.isArray(moduleName)) {
              var promisesList = [];
              angular.forEach(moduleName, function(module) {
                promisesList.push(self.inject(module, localParams, real));
              });
              return $q.all(promisesList);
            } else {
              self._addToLoadList(self._getModuleName(moduleName), true, real);
            }
          }
          if (modulesToLoad.length > 0) {
            var res = modulesToLoad.slice();
            var loadNext = function loadNext(moduleName) {
              moduleCache.push(moduleName);
              modulePromises[moduleName] = deferred.promise;
              self._loadDependencies(moduleName, localParams).then(function success() {
                try {
                  justLoaded = [];
                  _register(providers, moduleCache, localParams);
                } catch (e) {
                  self._$log.error(e.message);
                  deferred.reject(e);
                  return;
                }
                if (modulesToLoad.length > 0) {
                  loadNext(modulesToLoad.shift());
                } else {
                  deferred.resolve(res);
                }
              }, function error(err) {
                deferred.reject(err);
              });
            };
            loadNext(modulesToLoad.shift());
          } else if (localParams && localParams.name && modulePromises[localParams.name]) {
            return modulePromises[localParams.name];
          } else {
            deferred.resolve();
          }
          return deferred.promise;
        },
        getRequires: function getRequires(module) {
          var requires = [];
          angular.forEach(module.requires, function(requireModule) {
            if (regModules.indexOf(requireModule) === -1) {
              requires.push(requireModule);
            }
          });
          return requires;
        },
        _invokeQueue: _invokeQueue,
        _registerInvokeList: _registerInvokeList,
        _register: _register,
        _addToLoadList: _addToLoadList,
        _unregister: function _unregister(modules) {
          if (angular.isDefined(modules)) {
            if (angular.isArray(modules)) {
              angular.forEach(modules, function(module) {
                regInvokes[module] = undefined;
              });
            }
          }
        }
      };
    }];
    this._init(angular.element(window.document));
  }]);
  var bootstrapFct = angular.bootstrap;
  angular.bootstrap = function(element, modules, config) {
    angular.forEach(modules.slice(), function(module) {
      _addToLoadList(module, true, true);
    });
    return bootstrapFct(element, modules, config);
  };
  var _addToLoadList = function _addToLoadList(name, force, real) {
    if ((recordDeclarations.length > 0 || force) && angular.isString(name) && modulesToLoad.indexOf(name) === -1) {
      modulesToLoad.push(name);
      if (real) {
        realModules.push(name);
      }
    }
  };
  var ngModuleFct = angular.module;
  angular.module = function(name, requires, configFn) {
    _addToLoadList(name, false, true);
    return ngModuleFct(name, requires, configFn);
  };
  if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
    module.exports = 'oc.lazyLoad';
  }
})(angular, window);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').directive('ocLazyLoad', ["$ocLazyLoad", "$compile", "$animate", "$parse", "$timeout", function($ocLazyLoad, $compile, $animate, $parse, $timeout) {
    return {
      restrict: 'A',
      terminal: true,
      priority: 1000,
      compile: function compile(element, attrs) {
        var content = element[0].innerHTML;
        element.html('');
        return function($scope, $element, $attr) {
          var model = $parse($attr.ocLazyLoad);
          $scope.$watch(function() {
            return model($scope) || $attr.ocLazyLoad;
          }, function(moduleName) {
            if (angular.isDefined(moduleName)) {
              $ocLazyLoad.load(moduleName).then(function() {
                $animate.enter(content, $element);
                $compile($element.contents())($scope);
              });
            }
          }, true);
        };
      }
    };
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$q", "$window", "$interval", function($delegate, $q, $window, $interval) {
      var uaCssChecked = false,
        useCssLoadPatch = false,
        anchor = $window.document.getElementsByTagName('head')[0] || $window.document.getElementsByTagName('body')[0];
      $delegate.buildElement = function buildElement(type, path, params) {
        var deferred = $q.defer(),
          el,
          loaded,
          filesCache = $delegate._getFilesCache(),
          cacheBuster = function cacheBuster(url) {
            var dc = new Date().getTime();
            if (url.indexOf('?') >= 0) {
              if (url.substring(0, url.length - 1) === '&') {
                return url + '_dc=' + dc;
              }
              return url + '&_dc=' + dc;
            } else {
              return url + '?_dc=' + dc;
            }
          };
        if (angular.isUndefined(filesCache.get(path))) {
          filesCache.put(path, deferred.promise);
        }
        switch (type) {
          case 'css':
            el = $window.document.createElement('link');
            el.type = 'text/css';
            el.rel = 'stylesheet';
            el.href = params.cache === false ? cacheBuster(path) : path;
            break;
          case 'js':
            el = $window.document.createElement('script');
            el.src = params.cache === false ? cacheBuster(path) : path;
            break;
          default:
            filesCache.remove(path);
            deferred.reject(new Error('Requested type "' + type + '" is not known. Could not inject "' + path + '"'));
            break;
        }
        el.onload = el['onreadystatechange'] = function(e) {
          if (el['readyState'] && !/^c|loade/.test(el['readyState']) || loaded) return;
          el.onload = el['onreadystatechange'] = null;
          loaded = 1;
          $delegate._broadcast('ocLazyLoad.fileLoaded', path);
          deferred.resolve();
        };
        el.onerror = function() {
          filesCache.remove(path);
          deferred.reject(new Error('Unable to load ' + path));
        };
        el.async = params.serie ? 0 : 1;
        var insertBeforeElem = anchor.lastChild;
        if (params.insertBefore) {
          var element = angular.element(angular.isDefined(window.jQuery) ? params.insertBefore : document.querySelector(params.insertBefore));
          if (element && element.length > 0) {
            insertBeforeElem = element[0];
          }
        }
        insertBeforeElem.parentNode.insertBefore(el, insertBeforeElem);
        if (type == 'css') {
          if (!uaCssChecked) {
            var ua = $window.navigator.userAgent.toLowerCase();
            if (/iP(hone|od|ad)/.test($window.navigator.platform)) {
              var v = $window.navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
              var iOSVersion = parseFloat([parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)].join('.'));
              useCssLoadPatch = iOSVersion < 6;
            } else if (ua.indexOf("android") > -1) {
              var androidVersion = parseFloat(ua.slice(ua.indexOf("android") + 8));
              useCssLoadPatch = androidVersion < 4.4;
            } else if (ua.indexOf('safari') > -1) {
              var versionMatch = ua.match(/version\/([\.\d]+)/i);
              useCssLoadPatch = versionMatch && versionMatch[1] && parseFloat(versionMatch[1]) < 6;
            }
          }
          if (useCssLoadPatch) {
            var tries = 1000;
            var interval = $interval(function() {
              try {
                el.sheet.cssRules;
                $interval.cancel(interval);
                el.onload();
              } catch (e) {
                if (--tries <= 0) {
                  el.onerror();
                }
              }
            }, 20);
          }
        }
        return deferred.promise;
      };
      return $delegate;
    }]);
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$q", function($delegate, $q) {
      $delegate.filesLoader = function filesLoader(config) {
        var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var cssFiles = [],
          templatesFiles = [],
          jsFiles = [],
          promises = [],
          cachePromise = null,
          filesCache = $delegate._getFilesCache();
        $delegate.toggleWatch(true);
        angular.extend(params, config);
        var pushFile = function pushFile(path) {
          var file_type = null,
            m;
          if (angular.isObject(path)) {
            file_type = path.type;
            path = path.path;
          }
          cachePromise = filesCache.get(path);
          if (angular.isUndefined(cachePromise) || params.cache === false) {
            if ((m = /^(css|less|html|htm|js)?(?=!)/.exec(path)) !== null) {
              file_type = m[1];
              path = path.substr(m[1].length + 1, path.length);
            }
            if (!file_type) {
              if ((m = /[.](css|less|html|htm|js)?((\?|#).*)?$/.exec(path)) !== null) {
                file_type = m[1];
              } else if (!$delegate.jsLoader.hasOwnProperty('ocLazyLoadLoader') && $delegate.jsLoader.hasOwnProperty('requirejs')) {
                file_type = 'js';
              } else {
                $delegate._$log.error('File type could not be determined. ' + path);
                return;
              }
            }
            if ((file_type === 'css' || file_type === 'less') && cssFiles.indexOf(path) === -1) {
              cssFiles.push(path);
            } else if ((file_type === 'html' || file_type === 'htm') && templatesFiles.indexOf(path) === -1) {
              templatesFiles.push(path);
            } else if (file_type === 'js' || jsFiles.indexOf(path) === -1) {
              jsFiles.push(path);
            } else {
              $delegate._$log.error('File type is not valid. ' + path);
            }
          } else if (cachePromise) {
            promises.push(cachePromise);
          }
        };
        if (params.serie) {
          pushFile(params.files.shift());
        } else {
          angular.forEach(params.files, function(path) {
            pushFile(path);
          });
        }
        if (cssFiles.length > 0) {
          var cssDeferred = $q.defer();
          $delegate.cssLoader(cssFiles, function(err) {
            if (angular.isDefined(err) && $delegate.cssLoader.hasOwnProperty('ocLazyLoadLoader')) {
              $delegate._$log.error(err);
              cssDeferred.reject(err);
            } else {
              cssDeferred.resolve();
            }
          }, params);
          promises.push(cssDeferred.promise);
        }
        if (templatesFiles.length > 0) {
          var templatesDeferred = $q.defer();
          $delegate.templatesLoader(templatesFiles, function(err) {
            if (angular.isDefined(err) && $delegate.templatesLoader.hasOwnProperty('ocLazyLoadLoader')) {
              $delegate._$log.error(err);
              templatesDeferred.reject(err);
            } else {
              templatesDeferred.resolve();
            }
          }, params);
          promises.push(templatesDeferred.promise);
        }
        if (jsFiles.length > 0) {
          var jsDeferred = $q.defer();
          $delegate.jsLoader(jsFiles, function(err) {
            if (angular.isDefined(err) && ($delegate.jsLoader.hasOwnProperty("ocLazyLoadLoader") || $delegate.jsLoader.hasOwnProperty("requirejs"))) {
              $delegate._$log.error(err);
              jsDeferred.reject(err);
            } else {
              jsDeferred.resolve();
            }
          }, params);
          promises.push(jsDeferred.promise);
        }
        if (promises.length === 0) {
          var deferred = $q.defer(),
            err = "Error: no file to load has been found, if you're trying to load an existing module you should use the 'inject' method instead of 'load'.";
          $delegate._$log.error(err);
          deferred.reject(err);
          return deferred.promise;
        } else if (params.serie && params.files.length > 0) {
          return $q.all(promises).then(function() {
            return $delegate.filesLoader(config, params);
          });
        } else {
          return $q.all(promises)['finally'](function(res) {
            $delegate.toggleWatch(false);
            return res;
          });
        }
      };
      $delegate.load = function(originalModule) {
        var originalParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var self = this,
          config = null,
          deferredList = [],
          deferred = $q.defer(),
          errText;
        var module = angular.copy(originalModule);
        var params = angular.copy(originalParams);
        if (angular.isArray(module)) {
          angular.forEach(module, function(m) {
            deferredList.push(self.load(m, params));
          });
          $q.all(deferredList).then(function(res) {
            deferred.resolve(res);
          }, function(err) {
            deferred.reject(err);
          });
          return deferred.promise;
        }
        if (angular.isString(module)) {
          config = self.getModuleConfig(module);
          if (!config) {
            config = {
              files: [module]
            };
          }
        } else if (angular.isObject(module)) {
          if (angular.isDefined(module.path) && angular.isDefined(module.type)) {
            config = {
              files: [module]
            };
          } else {
            config = self.setModuleConfig(module);
          }
        }
        if (config === null) {
          var moduleName = self._getModuleName(module);
          errText = 'Module "' + (moduleName || 'unknown') + '" is not configured, cannot load.';
          $delegate._$log.error(errText);
          deferred.reject(new Error(errText));
          return deferred.promise;
        } else {
          if (angular.isDefined(config.template)) {
            if (angular.isUndefined(config.files)) {
              config.files = [];
            }
            if (angular.isString(config.template)) {
              config.files.push(config.template);
            } else if (angular.isArray(config.template)) {
              config.files.concat(config.template);
            }
          }
        }
        var localParams = angular.extend({}, params, config);
        if (angular.isUndefined(config.files) && angular.isDefined(config.name) && $delegate.moduleExists(config.name)) {
          return $delegate.inject(config.name, localParams, true);
        }
        $delegate.filesLoader(config, localParams).then(function() {
          $delegate.inject(null, localParams).then(function(res) {
            deferred.resolve(res);
          }, function(err) {
            deferred.reject(err);
          });
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      };
      return $delegate;
    }]);
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$q", function($delegate, $q) {
      $delegate.cssLoader = function(paths, callback, params) {
        var promises = [];
        angular.forEach(paths, function(path) {
          promises.push($delegate.buildElement('css', path, params));
        });
        $q.all(promises).then(function() {
          callback();
        }, function(err) {
          callback(err);
        });
      };
      $delegate.cssLoader.ocLazyLoadLoader = true;
      return $delegate;
    }]);
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$q", function($delegate, $q) {
      $delegate.jsLoader = function(paths, callback, params) {
        var promises = [];
        angular.forEach(paths, function(path) {
          promises.push($delegate.buildElement('js', path, params));
        });
        $q.all(promises).then(function() {
          callback();
        }, function(err) {
          callback(err);
        });
      };
      $delegate.jsLoader.ocLazyLoadLoader = true;
      return $delegate;
    }]);
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$templateCache", "$q", "$http", function($delegate, $templateCache, $q, $http) {
      $delegate.templatesLoader = function(paths, callback, params) {
        var promises = [],
          filesCache = $delegate._getFilesCache();
        angular.forEach(paths, function(url) {
          var deferred = $q.defer();
          promises.push(deferred.promise);
          $http.get(url, params).success(function(data) {
            if (angular.isString(data) && data.length > 0) {
              angular.forEach(angular.element(data), function(node) {
                if (node.nodeName === 'SCRIPT' && node.type === 'text/ng-template') {
                  $templateCache.put(node.id, node.innerHTML);
                }
              });
            }
            if (angular.isUndefined(filesCache.get(url))) {
              filesCache.put(url, true);
            }
            deferred.resolve();
          }).error(function(err) {
            deferred.reject(new Error('Unable to load template file "' + url + '": ' + err));
          });
        });
        return $q.all(promises).then(function() {
          callback();
        }, function(err) {
          callback(err);
        });
      };
      $delegate.templatesLoader.ocLazyLoadLoader = true;
      return $delegate;
    }]);
  }]);
})(angular);
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {
    var k;
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = +fromIndex || 0;
    if (Math.abs(n) === Infinity) {
      n = 0;
    }
    if (n >= len) {
      return -1;
    }
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
};
/*! RESOURCE: /scripts/concourse_pane_extension/_module.js */
angular.module('sn.concourse_pane_extension', ['oc.lazyLoad']);;
/*! RESOURCE: /scripts/concourse_pane_extension/service.concoursePaneExtensionRegistry.js */
angular.module('sn.concourse_pane_extension').service('concoursePaneExtensionRegistry', function() {
  var handlers = {};
  return {
    register: function(type, handler) {
      handlers[type] = handler;
    },
    hasHandler: function(type) {
      return handlers.hasOwnProperty(type);
    },
    process: function(type, elementRoot, url, otherStuff) {
      handlers[type].call(null, elementRoot, url, otherStuff);
      console.log("Intercept handled", type, url, otherStuff);
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/bindWatch/js_includes_bind_watch.js */
/*! RESOURCE: /scripts/sn/common/bindWatch/_module.js */
angular.module('sn.common.bindWatch', []);;
/*! RESOURCE: /scripts/sn/common/bindWatch/config.bindWatch.js */
angular.module('sn.common.bindWatch').config(function($provide) {
  "use strict";
  $parseExpressionator.$inject = ['$delegate'];

  function $parseExpressionator($delegate) {
    function wrapParse(parse, exp, interceptor) {
      var parts;
      var part;
      var expression;
      var rawExpression;
      var notifiers;
      if (typeof exp === 'string' && /^:([a-zA-Z0-9][\w-]*):(.+)$/.test(exp)) {
        parts = exp.split(/:/);
        notifiers = [];
        while (parts.length) {
          part = parts.shift();
          if (part) {
            if (/^\s*[\{\[]/.test(part)) {
              rawExpression = [part].concat(parts).join(':');
              break;
            }
            notifiers.push(part);
          }
        }
        if (!rawExpression)
          rawExpression = notifiers.splice(-1, 1)[0];
        expression = parse.call(this, '::' + rawExpression, interceptor);
        expression.$$watchDelegate = dynamicWatcher(expression, notifiers);
        return expression;
      } else {
        return parse.call(this, exp, interceptor);
      }
    }
    return wrapParse.bind(null, $delegate);
  }

  function dynamicWatcher(expression, keys) {
    if (expression.$$watchDelegate.wrapped)
      return expression.$$watchDelegate;

    function setupListeners(scope, callback) {
      keys.forEach(function(newKey) {
        scope.$on('$$applyTwoWayBinding::' + newKey, callback);
      });
    }

    function wrapDelegate(watchDelegate, scope, listener, objectEquality, parsedExpression) {
      var delegateCall = watchDelegate.bind(this, scope, listener, objectEquality, parsedExpression);
      setupListeners(scope, delegateCall);
      delegateCall();
    }
    var delegate = wrapDelegate.bind(this, expression.$$watchDelegate);
    delegate.wrapped = true;
    return delegate;
  }
  $provide.decorator('$parse', $parseExpressionator);
});;
/*! RESOURCE: /scripts/sn/common/bindWatch/BindWatch.js */
angular.module('sn.common.bindWatch').factory('BindWatch', function() {
  "use strict";
  return function(scope, map) {
    if (!scope || !map)
      throw new Error('No scope or map provided');
    Object.keys(map).forEach(function(key) {
      scope.$watch(map[key], function(key, n, o) {
        if (n !== o)
          scope.$broadcast('$$applyTwoWayBinding::' + key);
      }.bind(null, key));
    });
  }
});;;;
/*! RESOURCE: /scripts/concourse_view_stack/js_includes_concourse_view_stack.js */
/*! RESOURCE: /scripts/concourse_view_stack/_module.js */
angular.module('sn.concourse_view_stack', []);;
/*! RESOURCE: /scripts/concourse_view_stack/service.viewStack.js */
angular.module('sn.concourse_view_stack').service('viewStackService', function(i18n, systemProperties) {
  "use strict";
  var defaultViews = [{
      tab: 'general',
      name: 'general',
      replace: true,
      template: 'concourse_settings_general.xml',
      icon: 'cog',
      title: i18n.getMessage('General')
    },
    {
      tab: 'theme',
      name: 'theme',
      template: 'concourse_settings_theme.xml',
      replace: true,
      icon: 'image',
      title: i18n.getMessage('Theme')
    },
    {
      tab: 'list',
      name: 'list',
      template: 'concourse_settings_lists.xml',
      replace: true,
      icon: 'table',
      title: i18n.getMessage('Lists')
    },
    {
      tab: 'form',
      name: 'form',
      template: 'concourse_settings_forms.xml',
      replace: true,
      icon: 'form',
      title: i18n.getMessage('Forms')
    },
    {
      tab: 'notifications',
      name: 'notifications_category',
      template: 'notification_preference_category.xml',
      title: i18n.getMessage('Applications')
    },
    {
      tab: 'notifications',
      name: 'notifications_channel',
      template: 'notification_preference_channel.xml',
      title: i18n.getMessage('Channels')
    },
    {
      tab: 'notifications',
      name: 'notifications_form',
      template: 'notification_preference_form.xml',
      title: i18n.getMessage('Apply Conditions')
    },
    {
      tab: 'notifications',
      name: 'notifications_general',
      template: systemProperties.notifications ? 'notification_preference_general.xml' : 'concourse_settings_notifications_connect.xml',
      replace: true,
      icon: 'notification-bell',
      title: i18n.getMessage('Notifications')
    }
  ];
  if (systemProperties.developer) {
    defaultViews.push({
      tab: 'developer',
      name: 'developer',
      template: 'concourse_settings_developer.xml',
      replace: true,
      icon: 'console',
      title: i18n.getMessage('Developer')
    })
  }
  return {
    get: function get(key, options) {
      var defaultView = defaultViews.filter(function(item) {
        return item.name == key;
      })[0];
      if (!defaultView) {
        throw 'Invalid view key: ' + key;
      }
      return angular.extend({}, defaultView, options);
    },
    getTopLevelViews: function getTopLevelViews() {
      return defaultViews
        .filter(function(view) {
          return view.replace;
        })
        .map(function(view) {
          return angular.extend({}, view);
        })
    }
  };
});;;
/*! RESOURCE: /scripts/concourse/directive.mainPane.js */
angular.module('sn.concourse').directive('mainPane', function(snCustomEvent, $log) {
  "use strict";
  return {
    restrict: 'A',
    link: function($scope, $element) {
      var permalinkBlacklist = new RegExp('login_redirect.do|about:blank|sysparm_nostack=|/welcome.do|/blank.do|/login.do');

      function isBlacklisted(uri) {
        return permalinkBlacklist.test(uri);
      }

      function setPermalink(win) {
        if (win && win.location && !isBlacklisted(win.location.href)) {
          var pageUrl = win.location.href.substr(win.location.href.indexOf(win.location.pathname));
          snCustomEvent.fire('magellanNavigator.permalink.set', {
            title: win.document.title,
            relativePath: pageUrl
          });
          overloadTitle(win);
        }
      }

      function overloadTitle(win) {
        win.document.origTitle = win.document.title;
        $element[0].title = win.document.title;
        try {
          Object.defineProperty(win.document, "title", {
            set: function(title) {
              this.origTitle = title;
              snCustomEvent.fire('magellanNavigator.permalink.set', {
                title: title
              });
            },
            get: function() {
              if (typeof this.origTitle == 'undefined')
                return '';
              return this.origTitle;
            },
            configurable: true
          });
        } catch (e) {
          $log.error(e);
        }
      }
      $element.load(function() {
        var win = this.contentWindow;
        setPermalink(win);
      });
      var iframeWindow = $element.get(0).contentWindow;
      if (iframeWindow)
        setPermalink(iframeWindow);
      snCustomEvent.observe('glide:nav_open_url', function(options) {
        if (options && options.url) {
          $element.attr('src', options.url);
        }
      });
    }
  }
});
/*! RESOURCE: /scripts/heisenberg/angular/_module.heisenberg.js */
(function() {
  "use strict";
  angular.module('heisenberg', []);
})();;
/*! RESOURCE: /scripts/heisenberg/angular/directive.snPopoverBasic.js */
(function($) {
  angular.module('heisenberg').directive('snPopoverBasic', function() {
    "use strict";
    return {
      restrict: 'C',
      link: function(scope, elem) {
        elem.each(function() {
          var $this = $(this);
          if (!$this.data('bs.popover'))
            $this.popover();
        });
      }
    }
  });
})(jQuery);;
/*! RESOURCE: /scripts/heisenberg/angular/directive.snTooltipBasic.js */
(function($) {
  "use strict";
  if ('ontouchstart' in document.documentElement)
    return;
  angular.module('heisenberg').directive('snTooltipBasic', function() {
    return {
      restrict: 'C',
      link: function(scope, elem) {
        if (isMobile())
          return;
        var $elem = $(elem);
        if ($elem.data('bs.tooltip'))
          return;
        var bsTooltip = $.fn.tooltip.Constructor;
        var delayShow = bsTooltip.DEFAULTS.delay.show || 500;
        $elem.hideFix();
        $elem.one('mouseenter', function() {
          if ($elem.data('bs.tooltip'))
            return;
          $elem.tooltip({
            container: $elem.attr('data-container') || 'body'
          });
          $elem.data('hover', setTimeout(function() {
            $elem.tooltip('show');
          }, delayShow));
        });
        $elem.one('mouseleave', function() {
          var hover = $elem.data('hover');
          if (hover) {
            clearTimeout($elem.data('hover'));
            $elem.removeData('hover')
          }
        });
        $elem.click(function() {
          hideToolTip();
        });
        scope.$on('$destroy', function() {
          destroyToolTip();
        });

        function destroyToolTip() {
          if ($elem.tooltip) {
            $elem.tooltip('destroy');
          }
        }

        function hideToolTip() {
          if ($elem.tooltip) {
            $elem.tooltip('hide');
          }
        }

        function isMobile() {
          if (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)) {
            return true;
          } else {
            return false;
          }
        }
      }
    };
  });
})(jQuery);;
/*! RESOURCE: /scripts/concourse/controller.impersonate.js */
angular.module('sn.concourse').controller('Impersonate', function($scope, $http, $log, $window, userPreferences, snCustomEvent) {
  "use strict";
  $scope.searchConfig = {
    field: {
      value: null,
      displayValue: null,
      attributes: 'ref_ac_columns_search=true,ref_ac_columns=name;sys_id;user_name'
    },
    additionalDisplayColumns: 'user_name',
    disabled: false
  };
  $scope.submitFromReference = function() {
    var user = $scope.searchConfig.field.value;
    $scope.impersonate(user);
  };
  $scope.$on('dialog.impersonate.show', function loadRecents() {
    $scope.show_error = false;
    $http.get('/api/now/ui/impersonate/recent').then(function(response) {
      $scope.recent_impersonations = response.data.result;
    });
  });
  snCustomEvent.observe('sn:impersonate', function(user_name) {
    $scope.impersonate(user_name);
  });
  $scope.impersonate = function(user_name) {
    if (!user_name)
      return;
    $http.post('/api/now/ui/impersonate/' + user_name, {}).success(function() {
      $scope.show_error = false;
      window.location = "/";
    }).error(function(response) {
      if (response.error) {
        $scope.show_error = true;
        $scope.error = response.error;
        $log.error("Impersonate failed", response.error);
      }
    });
  };
});;
/*! RESOURCE: /scripts/concourse/controller.elevateRoles.js */
angular.module('sn.concourse').controller('elevateRoles', ['$http', '$scope', '$rootScope', '$window', 'snCustomEvent', function($http, $scope, $rootScope, $window, snCustomEvent) {
  "use strict";
  $scope.selected = [];
  $scope.activeRoles = [];
  $scope.activeElevatedRoles = [];
  $scope.sessionExpired = false;
  $http.get('/api/now/ui/impersonate/role').then(function(response) {
    if (response && response.data && response.data.result && response.data.result.roles && response.data.result.activeRoles) {
      $scope.roles = response.data.result.roles;
      $scope.activeRoles = response.data.result.activeRoles;
      setSelected(response.data.result.roles, response.data.result.activeRoles);
    }
  });
  snCustomEvent.on('glide:ui_notification.security', function(notification) {
    expireElevatedRoles(notification);
  });
  $scope.$on('dialog.elevateRoles.closed', function() {
    $scope.sessionExpired = false;
  });

  function expireElevatedRoles(notification) {
    if ($scope.activeElevatedRoles && $scope.activeElevatedRoles.length) {
      $scope.sessionExpired = true;
      $rootScope.$broadcast('dialog.elevateRoles.show');
    }
  }

  function setSelected(roles, activeRoles) {
    $scope.activeElevatedRoles = [];
    $scope.selected = [];
    for (var i = 0; i < roles.length; i++) {
      for (var j = 0; j < activeRoles.length; j++) {
        if (roles[i].name === activeRoles[j]) {
          $scope.selected.push(activeRoles[j]);
          $scope.activeElevatedRoles.push(roles[i]);
        }
      }
    }
    snCustomEvent.fireAll('user.elevatedRoles.updated', $scope.activeElevatedRoles);
  }
  $scope.toggleRole = function(role) {
    if ($scope.selected.indexOf(role.name) != -1) {
      $scope.selected.splice($scope.selected.indexOf(role.name), 1);
    } else {
      $scope.selected.push(role.name);
    }
  };
  $scope.isSelected = function(role) {
    return $scope.selected.indexOf(role.name) != -1;
  };
  snCustomEvent.observe('sn:elevate_roles', function(roles) {
    if (!angular.isArray(roles))
      roles = [roles];
    $scope.selected = roles;
    $scope.updateElevatedRoles();
  });
  $scope.updateElevatedRoles = function() {
    $http.post('/api/now/ui/impersonate/role', {
      roles: $scope.selected.join(',')
    }).then(function(response) {
      if (response && response.data && response.data.result) {
        var frame = jQuery('#gsft_main');
        if (frame.length) {
          frame[0].contentWindow.location.reload();
        }
        snCustomEvent.fireAll('navigator.refresh');
        $rootScope.$broadcast('dialog.elevateRoles.close');
        if (response.data.result.activeRoles) {
          setSelected($scope.roles, response.data.result.activeRoles)
        }
      }
    });
  };
}]);;
/*! RESOURCE: /scripts/concourse/controller.settings.js */
angular.module('sn.concourse').controller('settings', function($scope, $timeout, getTemplateUrl, i18n, snCustomEvent, modalPath, shouldModalOpen, viewStackService, concourseSettings) {
  "use strict";
  $scope.settings = angular.extend({}, concourseSettings);
  $scope.animateViewStackHeaders = false;
  activate();
  $scope.previousView = function previousView() {
    if ($scope.viewStack.length > 1) {
      return $scope.viewStack[$scope.viewStack.length - 2];
    }
  };
  $scope.currentView = function currentView() {
    return $scope.viewStack[$scope.viewStack.length - 1];
  };
  $scope.getViewTemplate = function getViewTemplate(view) {
    return getTemplateUrl(view.template);
  };
  $scope.openView = openView;
  $scope.back = function($event) {
    if ($event.type === 'keypress' && $event.keyCode !== 13 && $event.keyCode !== 32) {
      return;
    }
    back($event.type === 'keypress');
  };
  $scope.$on('dialog.settingsModal.show', function() {
    $scope.$broadcast('concourse_settings.view.refresh');
  });
  $scope.$on('concourse_settings.view.open', function(e, data) {
    _addViewObject(data)
  });
  $scope.$on('concourse_settings.view.back', function() {
    back(true);
  });

  function back(focusPreviousElement) {
    if ($scope.viewStack.length === 1) {
      return;
    }
    var view = $scope.viewStack.pop();
    $scope.$broadcast('concourse_settings.view.closed', view);
    if (focusPreviousElement && view.previouslyFocusedElement) {
      $timeout(function() {
        view.previouslyFocusedElement.focus();
      });
    } else if ($scope.viewStack.length === 1) {
      angular.element('[data-tab-name=' + $scope.viewStack[0].name + ']').focus();
    }
  }

  function activate() {
    $scope.viewStack = [viewStackService.get("general")];
    $scope.views = viewStackService.getTopLevelViews();
    if (!modalPath)
      return;
    var parts = getModalPathParts();
    parts.forEach(function(part) {
      openView(part);
    });
    if (shouldModalOpen)
      toggleModal(true);
  }

  function openView(view, options) {
    var view = viewStackService.get(view, options);
    _addViewObject(view);
  }

  function _addViewObject(view) {
    if (view.replace) {
      $scope.viewStack = [];
      $scope.animateViewStackHeaders = false;
    }
    $scope.viewStack.push(view);
    if ($scope.viewStack.length > 1) {
      $scope.animateViewStackHeaders = true;
    }
  }

  function getModalPathParts() {
    var parts = (modalPath || "").split(".");
    parts.shift();
    return parts;
  }

  function toggleModal(bool) {
    var message = bool ? 'dialog.settingsModal.show' : 'dialog.settingsModal.close';
    $scope.$evalAsync(function() {
      $scope.$broadcast(message);
    });
  }
});;
/*! RESOURCE: /scripts/concourse/directive.domainReferencePicker.js */
angular.module('sn.concourse').directive('domainReferencePicker', function($http, $rootScope, snCustomEvent, getTemplateUrl, domainReferenceService, userPreferences) {
  return {
    templateUrl: getTemplateUrl('concourse_domain_reference_picker.xml'),
    restrict: 'E',
    replace: false,
    scope: {
      current: '=',
      inHeader: '=',
      showInHeader: '='
    },
    controller: function($scope, $http, $rootScope, snCustomEvent) {
      $scope.domainConfig = domainReferenceService.domainConfig;
      $scope.domainOptions = {
        placeholder: $scope.current ? $scope.current.label : '',
        width: $scope.inHeader ? '150px' : '89%'
      };
      $scope.$watch('current', function() {
        $scope.domainOptions.placeholder = $scope.current.label;
      });
      domainReferenceService.showInHeader = $scope.showInHeader;
      $scope.domains = domainReferenceService;
      $scope.updateDomainFromReference = function() {
        $http.put('/api/now/ui/concoursepicker/domain', {
          value: $scope.domainConfig.field.value
        }).then(function() {
          triggerMainFrameRefresh();
        });
      };
      $scope.resetDomain = function() {
        $http.put('/api/now/ui/concoursepicker/domain', {}).then(function(response) {
          if (response && response.data && response.data.result && response.data.result.current) {
            $scope.domainConfig.field.displayValue = response.data.result.current.label;
            $scope.domainConfig.field.value = response.data.result.current.value;
          }
          triggerMainFrameRefresh();
        });
      };
      $scope.$watch("domainReferenceService.domainConfig", function(n, o) {
        if (n != o) {
          $scope.updateSelect(n.field.displayValue);
        }
      });

      function triggerMainFrameRefresh() {
        var iframe = jQuery('iframe#gsft_main');
        if (iframe.length) {
          iframe[0].contentWindow.location.reload();
        }
        snCustomEvent.fireTop('navigator.refresh');
      }
    },
    link: function(scope, element) {
      scope.updateSelect = function(text) {
        element.find('.select2-chosen').text(text);
      };
      element.on('change', 'input[type=checkbox]', function() {
        var showInHeader = angular.element(this).prop('checked');
        domainReferenceService.showInHeader = showInHeader;
        scope.showInHeader = showInHeader;
        if (showInHeader) {
          userPreferences.setPreference('glide.ui.domain_picker.in_header', 'true');
        } else {
          userPreferences.setPreference('glide.ui.domain_picker.in_header', '');
        }
      });
    }
  }
}).factory('domainReferenceService', function() {
  var domainConfig = {
    field: {
      value: null,
      displayValue: null
    }
  };
  var showInHeader = false;
  return {
    domainConfig: domainConfig,
    showInHeader: showInHeader
  };
});;
/*! RESOURCE: /scripts/concourse/dateTimeFormat.js */
(function() {
  CustomEvent.observe('cc_dateformat_set', function(preferences) {
    try {
      preferences = JSON.parse(preferences);
    } catch (ex) {
      preferences = {};
    }
    if (preferences.timeAgo === false && preferences.dateBoth === false)
      CustomEvent.fireAll('timeago_set', false);
    if (preferences.timeAgo === true && preferences.dateBoth === false)
      CustomEvent.fireAll('timeago_set', true);
    if (preferences.dateBoth === true)
      CustomEvent.fireAll('date_both', true);
  });
  CustomEvent.observe('cc_dateformat_compact_set', function(bool) {
    CustomEvent.fireAll('shortdates_set', bool);
  });
})();;
/*! RESOURCE: /scripts/sn/common/notification/js_includes_notification.js */
/*! RESOURCE: /scripts/sn/common/notification/_module.js */
angular.module('sn.common.notification', ['sn.common.util', 'ngSanitize', 'sn.common.i18n']);;
/*! RESOURCE: /scripts/sn/common/notification/factory.notificationWrapper.js */
angular.module("sn.common.notification").factory("snNotificationWrapper", function($window, $timeout) {
  "use strict";

  function assignHandler(notification, handlerName, options) {
    if (typeof options[handlerName] === "function")
      notification[handlerName.toLowerCase()] = options[handlerName];
  }
  return function NotificationWrapper(title, options) {
    var defaults = {
      dir: 'auto',
      lang: 'en_US',
      decay: true,
      lifespan: 4000,
      body: "",
      tag: "",
      icon: '/native_notification_icon.png'
    };
    var optionsOnClick = options.onClick;
    options.onClick = function() {
      if (angular.isFunction($window.focus))
        $window.focus();
      if (typeof optionsOnClick === "function")
        optionsOnClick();
    }
    var result = {};
    options = angular.extend(defaults, options);
    var previousOnClose = options.onClose;
    options.onClose = function() {
      if (angular.isFunction(result.onclose))
        result.onclose();
      if (angular.isFunction(previousOnClose))
        previousOnClose();
    }
    var notification = new $window.Notification(title, options);
    assignHandler(notification, "onShow", options);
    assignHandler(notification, "onClick", options);
    assignHandler(notification, "onError", options);
    assignHandler(notification, "onClose", options);
    if (options.decay && options.lifespan > 0)
      $timeout(function() {
        notification.close();
      }, options.lifespan)
    result.close = function() {
      notification.close();
    }
    return result;
  }
});
/*! RESOURCE: /scripts/sn/common/notification/service.snNotifier.js */
angular.module("sn.common.notification").factory("snNotifier", function($window, snNotificationWrapper) {
  "use strict";
  return function(settings) {
    function requestNotificationPermission() {
      if ($window.Notification && $window.Notification.permission === "default")
        $window.Notification.requestPermission();
    }

    function canUseNativeNotifications() {
      return ($window.Notification && $window.Notification.permission === "granted");
    }
    var currentNotifications = [];
    settings = angular.extend({
      notifyMethods: ["native", "glide"]
    }, settings);
    var methods = {
      'native': nativeNotify,
      'glide': glideNotify
    };

    function nativeNotify(title, options) {
      if (canUseNativeNotifications()) {
        var newNotification = snNotificationWrapper(title, options);
        newNotification.onclose = function() {
          stopTrackingNotification(newNotification)
        };
        currentNotifications.push(newNotification);
        return true;
      }
      return false;
    }

    function glideNotify(title, options) {
      return false;
    }

    function stopTrackingNotification(newNotification) {
      var index = currentNotifications.indexOf(newNotification);
      if (index > -1)
        currentNotifications.splice(index, 1);
    }

    function notify(title, options) {
      if (typeof options === "string")
        options = {
          body: options
        };
      options = options || {};
      for (var i = 0, len = settings.notifyMethods.length; i < len; i++)
        if (typeof settings.notifyMethods[i] == "string") {
          if (methods[settings.notifyMethods[i]](title, options))
            break;
        } else {
          if (settings.notifyMethods[i](title, options))
            break;
        }
    }

    function clearAllNotifications() {
      while (currentNotifications.length > 0)
        currentNotifications.pop().close();
    }
    return {
      notify: notify,
      canUseNativeNotifications: canUseNativeNotifications,
      clearAllNotifications: clearAllNotifications,
      requestNotificationPermission: requestNotificationPermission
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/notification/directive.snNotification.js */
angular.module('sn.common.notification').directive('snNotification', function($timeout, $rootScope) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="notification-container"></div>',
    link: function(scope, element) {
      scope.addNotification = function(payload) {
          if (!payload)
            payload = {};
          if (!payload.text)
            payload.text = '';
          if (!payload.classes)
            payload.classes = '';
          if (!payload.duration)
            payload.duration = 5000;
          angular.element('<div/>').qtip({
            content: {
              text: payload.text,
              title: {
                button: false
              }
            },
            position: {
              target: [0, 0],
              container: angular.element('.notification-container')
            },
            show: {
              event: false,
              ready: true,
              effect: function() {
                angular.element(this).stop(0, 1).animate({
                  height: 'toggle'
                }, 400, 'swing');
              },
              delay: 0,
              persistent: false
            },
            hide: {
              event: false,
              effect: function(api) {
                angular.element(this).stop(0, 1).animate({
                  height: 'toggle'
                }, 400, 'swing');
              }
            },
            style: {
              classes: 'jgrowl' + ' ' + payload.classes,
              tip: false
            },
            events: {
              render: function(event, api) {
                if (!api.options.show.persistent) {
                  angular.element(this).bind('mouseover mouseout', function(e) {
                      clearTimeout(api.timer);
                      if (e.type !== 'mouseover') {
                        api.timer = setTimeout(function() {
                          api.hide(e);
                        }, payload.duration);
                      }
                    })
                    .triggerHandler('mouseout');
                }
              }
            }
          });
        },
        scope.$on('notification.notify', function(event, payload) {
          scope.addNotification(payload);
        });
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/notification/service.snNotification.js */
angular.module('sn.common.notification').factory('snNotification', function($document, $templateCache, $compile, $rootScope, $timeout, $q, getTemplateUrl, $http, i18n) {
      'use strict';
      var openNotifications = [],
        timeouts = {},
        options = {
          top: 20,
          gap: 10,
          duration: 5000
        };
      return {
        show: function(type, message, duration, onClick, container) {
          return createNotificationElement(type, message).then(function(element) {
            displayNotification(element, container);
            checkAndSetDestroyDuration(element, duration);
            return element;
          });
        },
        hide: hide,
        setOptions: function(opts) {
          if (angular.isObject(opts))
            angular.extend(options, opts);
        }
      };

      function getTemplate() {
        var templateName = 'sn_notification.xml',
          template = $templateCache.get(templateName),
          deferred = $q.defer();
        if (!template) {
          var url = getTemplateUrl(templateName);
          $http.get(url).then(function(result) {
              $templateCache.put(templateName, result.data);
              deferred.resolve(result.data);
            },
            function(reason) {
              return $q.reject(reason);
            });
        } else
          deferred.resolve(template);
        return deferred.promise;
      }

      function createNotificationElement(type, message) {
        var thisScope, thisElement;
        var icon = 'icon-info';
        if (type == 'error') {
          icon = 'icon-cross-circle';
        } else if (type == 'warning') {
          icon = 'icon-alert';
        } else if (type = 'success') {
          icon = 'icon-check-circle';
        }
        return getTemplate().then(function(temp