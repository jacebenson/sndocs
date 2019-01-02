/*! RESOURCE: /scripts/lib/glide_updates/prototype.effects.js */
(function() {
  var elemdisplay = {};
  var rfxtypes = /^(?:toggle|show|hide)$/;
  var ralpha = /alpha\([^)]*\)/i;
  var rdigit = /\d/;
  var ropacity = /opacity=([^)]*)/;
  var rfxnum = /^([+\-]=)?([\d+.\-]+)(.*)$/;
  var rnumpx = /^-?\d+(?:px)?$/i;
  var rnum = /^-?\d/;
  var timerId;
  var fxAttrs = [
    ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
    ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
    ["opacity"]
  ];
  var shrinkWrapBlocks = false;
  var inlineBlockNeedsLayout = false;
  var cssFloat = false;
  var curCSS;
  var opacitySupport;
  document.observe("dom:loaded", function() {
    var div = document.createElement("div");
    div.style.width = div.style.paddingLeft = "1px";
    document.body.appendChild(div);
    if ("zoom" in div.style) {
      div.style.display = "inline";
      div.style.zoom = 1;
      inlineBlockNeedsLayout = div.offsetWidth === 2;
      div.style.display = "";
      div.innerHTML = "<div style='width:4px;'></div>";
      shrinkWrapBlocks = div.offsetWidth !== 2;
      document.body.removeChild(div);
    }
    div = document.createElement("div");
    div.style.display = "none";
    div.innerHTML = "<link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
    document.body.appendChild(div);
    var a = div.getElementsByTagName("a")[0];
    opacitySupport = /^0.55$/.test(a.style.opacity);
    cssFloat = !!a.style.cssFloat;
    document.body.removeChild(div);
    if (!opacitySupport) {
      Prototype.cssHooks.opacity = {
        get: function(elem, computed) {
          return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ?
            (parseFloat(RegExp.$1) / 100) + "" :
            computed ? "1" : "";
        },
        set: function(elem, value) {
          var style = elem.style;
          style.zoom = 1;
          var opacity = Prototype.isNaN(value) ?
            "" :
            "alpha(opacity=" + value * 100 + ")",
            filter = style.filter || "";
          style.filter = ralpha.test(filter) ?
            filter.replace(ralpha, opacity) :
            style.filter + ' ' + opacity;
        }
      };
    }
  });
  if (document.defaultView && document.defaultView.getComputedStyle) {
    curCSS = function(elem, newName, name) {
      var ret;
      var defaultView;
      var computedStyle;
      name = name.replace(rupper, "-$1").toLowerCase();
      if (!(defaultView = elem.ownerDocument.defaultView))
        return undefined;
      if ((computedStyle = defaultView.getComputedStyle(elem, null))) {
        ret = computedStyle.getPropertyValue(name);
        if (ret === "" && !contains(elem.ownerDocument.documentElement, elem))
          ret = style(elem, name);
      }
      return ret;
    };
  } else if (document.documentElement.currentStyle) {
    curCSS = function(elem, name) {
      var left;
      var rsLeft;
      var ret = elem.currentStyle && elem.currentStyle[name];
      var style = elem.style;
      if (!rnumpx.test(ret) && rnum.test(ret)) {
        left = style.left;
        rsLeft = elem.runtimeStyle.left;
        elem.runtimeStyle.left = elem.currentStyle.left;
        style.left = name === "fontSize" ? "1em" : (ret || 0);
        ret = style.pixelLeft + "px";
        style.left = left;
        elem.runtimeStyle.left = rsLeft;
      }
      return ret === "" ? "auto" : ret;
    };
  }

  function contains(a, b) {
    return document.compareDocumentPosition ? a.compareDocumentPosition(b) & 16 :
      (a !== b && (a.contains ? a.contains(b) : true));
  }

  function style(elem, name, value, extra) {
    if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style)
      return;
    var ret;
    var origName = name.camelize();
    var s = elem.style;
    var hooks = Prototype.cssHooks[origName];
    name = Prototype.cssProps[origName] || origName;
    if (value !== undefined) {
      if (typeof value === "number" && isNaN(value) || value == null)
        return;
      if (typeof value === "number" && !Prototype.cssNumber[origName])
        value += "px";
      if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined) {
        try {
          s[name] = value;
        } catch (e) {}
      }
    } else {
      if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined)
        return ret;
      return s[name];
    }
  }

  function isEmptyObject(obj) {
    for (var name in obj)
      return false;
    return true;
  }

  function isWindow(obj) {
    return obj && typeof obj === "object" && "setInterval" in obj;
  }

  function arrayMerge(first, second) {
    var i = first.length;
    var j = 0;
    if (typeof second.length === "number") {
      for (var l = second.length; j < l; j++)
        first[i++] = second[j];
    } else {
      while (second[j] !== undefined)
        first[i++] = second[j++];
    }
    first.length = i;
    return first;
  }

  function makeArray(array) {
    var ret = [];
    if (array != null) {
      var type = typeof array;
      if (array.length == null || type === "string" || type === "function" || type === "regexp" || isWindow(array))
        Array.prototype.push.call(ret, array);
      else
        arrayMerge(ret, array);
    }
    return ret;
  }

  function genFx(type, num) {
    var obj = {};
    fxAttrs.concat.apply([], fxAttrs.slice(0, num)).each(function(context) {
      obj[context] = type;
    });
    return obj;
  }

  function defaultDisplay(nodeName) {
    if (elemdisplay[nodeName])
      return elemdisplay[nodeName];
    var e = $(document.createElement(nodeName));
    document.body.appendChild(e);
    var display = e.getStyle("display");
    e.remove();
    if (display === "none" || display === "")
      display = "block";
    elemdisplay[nodeName] = display;
    return display;
  }
  Prototype.effects = {
    speed: function(speed, easing, fn) {
      var opt = speed && typeof speed === "object" ? Object.extend({}, speed) : {
        complete: fn || !fn && easing || typeof speed == 'function' && speed,
        duration: speed,
        easing: fn && easing || easing && !(typeof easing == 'function') && easing
      };
      opt.duration = Prototype.effects.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
        opt.duration in Prototype.effects.fx.speeds ? Prototype.effects.fx.speeds[opt.duration] : Prototype.effects.fx.speeds._default;
      opt.old = opt.complete;
      opt.complete = function() {
        if (opt.queue !== false)
          $(this).dequeue();
        if (typeof opt.old == 'function')
          opt.old.call(this);
      };
      return opt;
    },
    easing: {
      linear: function(p, n, firstNum, diff) {
        return firstNum + diff * p;
      },
      swing: function(p, n, firstNum, diff) {
        return ((-Math.cos(p * Math.PI) / 2) + 0.5) * diff + firstNum;
      }
    },
    timers: [],
    fx: function(elem, options, prop) {
      this.elem = elem;
      this.options = options;
      this.prop = prop;
      if (!options.orig)
        options.orig = {};
    }
  };
  Prototype.effects.fx.prototype = {
    update: function() {
      if (this.options.step)
        this.options.step.call(this.elem, this.now, this);
      (Prototype.effects.fx.step[this.prop] || Prototype.effects.fx.step._default)(this);
    },
    cur: function() {
      if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null))
        return this.elem[this.prop];
      var r = parseFloat(this.elem.getStyle(this.prop));
      return r || 0;
    },
    custom: function(from, to, unit) {
      var self = this;
      var fx = Prototype.effects.fx;
      this.startTime = new Date().getTime()
      this.start = from;
      this.end = to;
      this.unit = unit || this.unit || "px";
      this.now = this.start;
      this.pos = this.state = 0;

      function t(gotoEnd) {
        return self.step(gotoEnd);
      }
      t.elem = this.elem;
      if (t() && Prototype.effects.timers.push(t) && !timerId)
        timerId = setInterval(fx.tick, fx.interval);
    },
    show: function() {
      this.options.orig[this.prop] = style(this.elem, this.prop);
      this.options.show = true;
      this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
      $(this.elem).show();
    },
    hide: function() {
      this.options.orig[this.prop] = style(this.elem, this.prop);
      this.options.hide = true;
      this.custom(this.cur(), 0);
    },
    step: function(gotoEnd) {
      var t = new Date().getTime();
      var done = true;
      if (gotoEnd || t >= this.options.duration + this.startTime) {
        this.now = this.end;
        this.pos = this.state = 1;
        this.update();
        this.options.curAnim[this.prop] = true;
        for (var i in this.options.curAnim) {
          if (this.options.curAnim[i] !== true)
            done = false;
        }
        if (done) {
          if (this.options.overflow != null && !shrinkWrapBlocks) {
            var elem = this.elem;
            var options = this.options;
            var overflowArray = ["", "X", "Y"];
            for (var ii = 0, ll = overflowArray.length; ii < ll; ii++)
              elem.style["overflow" + overflowArray[ii]] = options.overflow[ii];
          }
          if (this.options.hide) {
            $(this.elem).hide();
            if (Prototype.Browser.IE)
              $(this.elem).setStyle({
                filter: ''
              });
          }
          if (this.options.hide || this.options.show) {
            for (var p in this.options.curAnim)
              style(this.elem, p, this.options.orig[p]);
          }
          this.options.complete.call(this.elem);
        }
        return false;
      } else {
        var n = t - this.startTime;
        this.state = n / this.options.duration;
        var specialEasing = this.options.specialEasing && this.options.specialEasing[this.prop];
        var defaultEasing = this.options.easing || (Prototype.effects.easing.swing ? "swing" : "linear");
        this.pos = Prototype.effects.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
        this.now = this.start + ((this.end - this.start) * this.pos);
        this.update();
      }
      return true;
    }
  };
  Object.extend(Prototype.effects.fx, {
    tick: function() {
      var timers = Prototype.effects.timers;
      for (var i = 0; i < timers.length; i++) {
        if (!timers[i]())
          timers.splice(i--, 1);
      }
      if (!timers.length)
        Prototype.effects.fx.stop();
    },
    interval: 13,
    stop: function() {
      clearInterval(timerId);
      timerId = null;
    },
    speeds: {
      slow: 600,
      fast: 200,
      _default: 400
    },
    step: {
      opacity: function(fx) {
        fx.elem.setStyle({
          opacity: fx.now
        });
      },
      _default: function(fx) {
        if (fx.elem.style && fx.elem.style[fx.prop] != null)
          fx.elem.style[fx.prop] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
        else
          fx.elem[fx.prop] = fx.now;
      }
    }
  });
  Object.extend(Prototype, {
    isNaN: function(obj) {
      return obj == null || !rdigit.test(obj) || isNaN(obj);
    },
    queue: function(elem, type, data) {
      if (!elem)
        return;
      type = (type || "fx") + "queue";
      var q = elem.retrieve(type);
      if (!data)
        return q || [];
      if (!q || Object.isArray(data))
        q = elem.store(type, makeArray(data));
      else
        q.push(data);
      return q;
    },
    dequeue: function(elem, type) {
      type = type || "fx";
      var queue = Prototype.queue(elem, type);
      var fn = queue.shift();
      if (fn === "inprogress")
        fn = queue.shift();
      if (fn) {
        if (type === "fx")
          queue.unshift("inprogress");
        fn.call(elem, function() {
          Prototype.dequeue(elem, type);
        });
      }
    },
    cssHooks: {
      opacity: {
        get: function(elem, computed) {
          if (computed) {
            var ret = curCSS(elem, "opacity", "opacity");
            return ret === "" ? "1" : ret;
          }
          return elem.style.opacity;
        }
      }
    },
    cssProps: {
      "float": cssFloat ? "cssFloat" : "styleFloat"
    },
    cssNumber: {
      "zIndex": true,
      "fontWeight": true,
      "opacity": true,
      "zoom": true,
      "lineHeight": true
    }
  });

  function show(elem, speed, easing, callback) {
    if (speed || speed === 0)
      return animate(elem, genFx("show", 3), speed, easing, callback);
    var display = elem.style.display;
    if (!elem.retrieve("olddisplay") && display === "none")
      display = elem.style.display = "";
    if (display === "" && elem.getStyle("display") === "none")
      elem.store("olddisplay", defaultDisplay(elem.nodeName));
    display = elem.style.display;
    if (display === "" || display === "none")
      elem.style.display = elem.retrieve("olddisplay") || "";
    return elem;
  }

  function hide(elem, speed, easing, callback) {
    if (speed || speed === 0)
      return animate(elem, genFx("hide", 3), speed, easing, callback);
    var display = elem.getStyle('display');
    if (display !== "none")
      elem.store("olddisplay", elem.getStyle('display'));
    elem.style.display = "none";
    return elem;
  }

  function toggle(elem, fn, fn2, callback) {
    var bool = typeof fn === "boolean";
    if (typeof fn == 'function' && typeof fn2 == 'function')
      toggle.apply(this, arguments);
    else if (fn == null || bool) {
      var state = bool ? fn : !elem.visible();
      elem[state ? "show" : "hide"]();
    } else
      animate(elem, genFx("toggle", 3), fn, fn2, callback);
    return elem;
  }

  function fadeTo(elem, speed, to, easing, callback) {
    elem.setStyle({
      opacity: 0
    });
    if (!elem.visible())
      elem.show();
    return animate(elem, {
      opacity: to
    }, speed, easing, callback);
  }

  function animate(elem, prop, speed, easing, callback) {
    var optall = Prototype.effects.speed(speed, easing, callback);
    if (isEmptyObject(prop))
      return optall.complete;
    return elem[optall.queue === false ? "_execute" : "queue"](function() {
      var opt = Object.extend({}, optall);
      var p;
      var isElement = elem.nodeType === 1;
      var hidden = isElement && !elem.visible();
      for (p in prop) {
        var name = p.camelize();
        if (p !== name) {
          prop[name] = prop[p];
          delete prop[p];
          p = name;
        }
        if (prop[p] === "hide" && hidden || prop[p] === "show" && !hidden)
          return opt.complete.call(this);
        if (isElement && (p === "height" || p === "width")) {
          opt.overflow = [elem.style.overflow, elem.style.overflowX, elem.style.overflowY];
          if (elem.getStyle("display") === "inline" && elem.getStyle("float") === "none") {
            if (!inlineBlockNeedsLayout)
              elem.style.display = "inline-block";
            else {
              var display = defaultDisplay(this.nodeName);
              if (display === "inline")
                elem.style.display = "inline-block";
              else {
                elem.style.display = "inline";
                elem.style.zoom = 1;
              }
            }
          }
        }
        if (Object.isArray(prop[p])) {
          (opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];
          prop[p] = prop[p][0];
        }
      }
      if (opt.overflow != null)
        elem.style.overflow = "hidden";
      opt.curAnim = Object.extend({}, prop);
      for (var i in prop) {
        var name = i;
        var val = prop[i];
        var e = new Prototype.effects.fx(elem, opt, name);
        if (rfxtypes.test(val)) {
          e[val === "toggle" ? hidden ? "show" : "hide" : val](prop);
        } else {
          var parts = rfxnum.exec(val);
          var start = e.cur() || 0;
          if (parts) {
            var end = parseFloat(parts[2]);
            var unit = parts[3] || "px";
            if (unit !== "px") {
              style(elem, name, (end || 1) + unit);
              start = ((end || 1) / e.cur()) * start;
              style(name, start + unit);
            }
            if (parts[1])
              end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
            e.custom(start, end, unit);
          } else {
            e.custom(start, val, "");
          }
        }
      }
      return true;
    });
  }

  function stop(elem, clearQueue, gotoEnd) {
    var timers = Prototype.effects.timers;
    if (clearQueue)
      elem.queue([]);
    for (var i = timers.length - 1; i >= 0; i--) {
      if (timers[i].elem === elem) {
        if (gotoEnd) {
          timers[i](true);
        }
        timers.splice(i, 1);
      }
    }
    if (!gotoEnd)
      elem.dequeue();
    return elem;
  }

  function queue(elem, type, data) {
    if (typeof type !== "string") {
      data = type;
      type = "fx";
    }
    if (data === undefined)
      return Prototype.queue(elem, type);
    var queue = Prototype.queue(elem, type, data);
    if (type === "fx" && queue[0] !== "inprogress")
      Prototype.dequeue(elem, type);
    return elem;
  }

  function dequeue(elem, type) {
    Prototype.dequeue(elem, type);
    return elem;
  }

  function delay(elem, time, type) {
    time = Prototype.effects.fx ? Prototype.effects.fx.speeds[time] || time : time;
    type = type || "fx";
    return elem.queue(type, function() {
      setTimeout(function() {
        Prototype.dequeue(elem, type);
      }, time);
    });
  }

  function clearQueue(elem, type) {
    return elem.queue(type || "fx", []);
  }
  return Element.addMethods({
    show: show,
    hide: hide,
    toggle: toggle,
    fadeTo: fadeTo,
    animate: animate,
    slideDown: function(elem, speed, easing, callback) {
      return animate(elem, genFx('show', 1), speed, easing, callback);
    },
    slideUp: function(elem, speed, easing, callback) {
      return animate(elem, genFx('hide', 1), speed, easing, callback);
    },
    slideToggle: function(elem, speed, easing, callback) {
      return animate(elem, genFx('toggle', 1), speed, easing, callback);
    },
    fadeIn: function(elem, speed, easing, callback) {
      return animate(elem, {
        opacity: 'show'
      }, speed, easing, callback);
    },
    fadeOut: function(elem, speed, easing, callback) {
      return animate(elem, {
        opacity: 'hide'
      }, speed, easing, callback);
    },
    fadeToggle: function(elem, speed, easing, callback) {
      return animate(elem, {
        opacity: 'toggle'
      }, speed, easing, callback);
    },
    stop: stop,
    queue: queue,
    dequeue: dequeue,
    delay: delay,
    clearQueue: clearQueue,
    _execute: function(elem, f) {
      f();
      return elem;
    }
  });
}());;