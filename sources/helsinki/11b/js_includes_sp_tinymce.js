/*! RESOURCE: /scripts/js_includes_sp_tinymce.js */
/*! RESOURCE: /scripts/sp-tinymce/tinymce.min.js */
// 4.3.3 (2016-01-14)
! function(e, t) {
  "use strict";

  function n(e, t) {
    for (var n, r = [], i = 0; i < e.length; ++i) {
      if (n = s[e[i]] || o(e[i]), !n) throw "module definition dependecy not found: " + e[i];
      r.push(n)
    }
    t.apply(null, r)
  }

  function r(e, r, i) {
    if ("string" != typeof e) throw "invalid module definition, module id must be defined and be a string";
    if (r === t) throw "invalid module definition, dependencies must be specified";
    if (i === t) throw "invalid module definition, definition function must be specified";
    n(r, function() {
      s[e] = i.apply(null, arguments)
    })
  }

  function i(e) {
    return !!s[e]
  }

  function o(t) {
    for (var n = e, r = t.split(/[.\/]/), i = 0; i < r.length; ++i) {
      if (!n[r[i]]) return;
      n = n[r[i]]
    }
    return n
  }

  function a(n) {
    var r, i, o, a, l;
    for (r = 0; r < n.length; r++) {
      i = e, o = n[r], a = o.split(/[.\/]/);
      for (var c = 0; c < a.length - 1; ++c) i[a[c]] === t && (i[a[c]] = {}), i = i[a[c]];
      i[a[a.length - 1]] = s[o]
    }
    if (e.AMDLC_TESTS) {
      l = e.privateModules || {};
      for (o in s) l[o] = s[o];
      for (r = 0; r < n.length; r++) delete l[n[r]];
      e.privateModules = l
    }
  }
  var s = {},
    l = "tinymce/geom/Rect",
    c = "tinymce/util/Promise",
    u = "tinymce/util/Delay",
    d = "tinymce/dom/EventUtils",
    f = "tinymce/dom/Sizzle",
    h = "tinymce/Env",
    p = "tinymce/util/Arr",
    m = "tinymce/util/Tools",
    g = "tinymce/dom/DomQuery",
    v = "tinymce/html/Styles",
    y = "tinymce/dom/TreeWalker",
    b = "tinymce/dom/Range",
    C = "tinymce/html/Entities",
    x = "tinymce/dom/StyleSheetLoader",
    w = "tinymce/dom/DOMUtils",
    E = "tinymce/dom/ScriptLoader",
    N = "tinymce/AddOnManager",
    _ = "tinymce/dom/NodeType",
    S = "tinymce/text/Zwsp",
    k = "tinymce/caret/CaretContainer",
    T = "tinymce/dom/RangeUtils",
    R = "tinymce/NodeChange",
    A = "tinymce/html/Node",
    B = "tinymce/html/Schema",
    D = "tinymce/html/SaxParser",
    M = "tinymce/html/DomParser",
    L = "tinymce/html/Writer",
    P = "tinymce/html/Serializer",
    H = "tinymce/dom/Serializer",
    O = "tinymce/dom/TridentSelection",
    I = "tinymce/util/VK",
    F = "tinymce/dom/ControlSelection",
    z = "tinymce/util/Fun",
    W = "tinymce/caret/CaretCandidate",
    V = "tinymce/geom/ClientRect",
    U = "tinymce/text/ExtendingChar",
    $ = "tinymce/caret/CaretPosition",
    q = "tinymce/caret/CaretBookmark",
    j = "tinymce/dom/BookmarkManager",
    Y = "tinymce/dom/Selection",
    X = "tinymce/dom/ElementUtils",
    K = "tinymce/fmt/Preview",
    G = "tinymce/Formatter",
    J = "tinymce/UndoManager",
    Q = "tinymce/EnterKey",
    Z = "tinymce/ForceBlocks",
    ee = "tinymce/EditorCommands",
    te = "tinymce/util/URI",
    ne = "tinymce/util/Class",
    re = "tinymce/util/EventDispatcher",
    ie = "tinymce/data/Binding",
    oe = "tinymce/util/Observable",
    ae = "tinymce/data/ObservableObject",
    se = "tinymce/ui/Selector",
    le = "tinymce/ui/Collection",
    ce = "tinymce/ui/DomUtils",
    ue = "tinymce/ui/BoxUtils",
    de = "tinymce/ui/ClassList",
    fe = "tinymce/ui/ReflowQueue",
    he = "tinymce/ui/Control",
    pe = "tinymce/ui/Factory",
    me = "tinymce/ui/KeyboardNavigation",
    ge = "tinymce/ui/Container",
    ve = "tinymce/ui/DragHelper",
    ye = "tinymce/ui/Scrollable",
    be = "tinymce/ui/Panel",
    Ce = "tinymce/ui/Movable",
    xe = "tinymce/ui/Resizable",
    we = "tinymce/ui/FloatPanel",
    Ee = "tinymce/ui/Window",
    Ne = "tinymce/ui/MessageBox",
    _e = "tinymce/WindowManager",
    Se = "tinymce/ui/Tooltip",
    ke = "tinymce/ui/Widget",
    Te = "tinymce/ui/Progress",
    Re = "tinymce/ui/Notification",
    Ae = "tinymce/NotificationManager",
    Be = "tinymce/dom/NodePath",
    De = "tinymce/util/Quirks",
    Me = "tinymce/EditorObservable",
    Le = "tinymce/Mode",
    Pe = "tinymce/Shortcuts",
    He = "tinymce/file/Uploader",
    Oe = "tinymce/file/Conversions",
    Ie = "tinymce/file/ImageScanner",
    Fe = "tinymce/file/BlobCache",
    ze = "tinymce/EditorUpload",
    We = "tinymce/caret/CaretUtils",
    Ve = "tinymce/caret/CaretWalker",
    Ue = "tinymce/caret/FakeCaret",
    $e = "tinymce/dom/Dimensions",
    qe = "tinymce/caret/LineWalker",
    je = "tinymce/caret/LineUtils",
    Ye = "tinymce/DragDropOverrides",
    Xe = "tinymce/SelectionOverrides",
    Ke = "tinymce/Editor",
    Ge = "tinymce/util/I18n",
    Je = "tinymce/FocusManager",
    Qe = "tinymce/EditorManager",
    Ze = "tinymce/LegacyInput",
    et = "tinymce/util/XHR",
    tt = "tinymce/util/JSON",
    nt = "tinymce/util/JSONRequest",
    rt = "tinymce/util/JSONP",
    it = "tinymce/util/LocalStorage",
    ot = "tinymce/Compat",
    at = "tinymce/ui/Layout",
    st = "tinymce/ui/AbsoluteLayout",
    lt = "tinymce/ui/Button",
    ct = "tinymce/ui/ButtonGroup",
    ut = "tinymce/ui/Checkbox",
    dt = "tinymce/ui/ComboBox",
    ft = "tinymce/ui/ColorBox",
    ht = "tinymce/ui/PanelButton",
    pt = "tinymce/ui/ColorButton",
    mt = "tinymce/util/Color",
    gt = "tinymce/ui/ColorPicker",
    vt = "tinymce/ui/Path",
    yt = "tinymce/ui/ElementPath",
    bt = "tinymce/ui/FormItem",
    Ct = "tinymce/ui/Form",
    xt = "tinymce/ui/FieldSet",
    wt = "tinymce/ui/FilePicker",
    Et = "tinymce/ui/FitLayout",
    Nt = "tinymce/ui/FlexLayout",
    _t = "tinymce/ui/FlowLayout",
    St = "tinymce/ui/FormatControls",
    kt = "tinymce/ui/GridLayout",
    Tt = "tinymce/ui/Iframe",
    Rt = "tinymce/ui/Label",
    At = "tinymce/ui/Toolbar",
    Bt = "tinymce/ui/MenuBar",
    Dt = "tinymce/ui/MenuButton",
    Mt = "tinymce/ui/MenuItem",
    Lt = "tinymce/ui/Menu",
    Pt = "tinymce/ui/ListBox",
    Ht = "tinymce/ui/Radio",
    Ot = "tinymce/ui/ResizeHandle",
    It = "tinymce/ui/SelectBox",
    Ft = "tinymce/ui/Slider",
    zt = "tinymce/ui/Spacer",
    Wt = "tinymce/ui/SplitButton",
    Vt = "tinymce/ui/StackLayout",
    Ut = "tinymce/ui/TabPanel",
    $t = "tinymce/ui/TextBox",
    qt = "tinymce/ui/Throbber";
  r(l, [], function() {
      function e(e, t, n) {
        var r, i, a, s, l, u;
        return r = t.x, i = t.y, a = e.w, s = e.h, l = t.w, u = t.h, n = (n || "").split(""), "b" === n[0] && (i += u), "r" === n[1] && (r += l), "c" === n[0] && (i += c(u / 2)), "c" === n[1] && (r += c(l / 2)), "b" === n[3] && (i -= s), "r" === n[4] && (r -= a), "c" === n[3] && (i -= c(s / 2)), "c" === n[4] && (r -= c(a / 2)), o(r, i, a, s)
      }

      function t(t, n, r, i) {
        var o, a;
        for (a = 0; a < i.length; a++)
          if (o = e(t, n, i[a]), o.x >= r.x && o.x + o.w <= r.w + r.x && o.y >= r.y && o.y + o.h <= r.h + r.y) return i[a];
        return null
      }

      function n(e, t, n) {
        return o(e.x - t, e.y - n, e.w + 2 * t, e.h + 2 * n)
      }

      function r(e, t) {
        var n, r, i, a;
        return n = l(e.x, t.x), r = l(e.y, t.y), i = s(e.x + e.w, t.x + t.w), a = s(e.y + e.h, t.y + t.h), 0 > i - n || 0 > a - r ? null : o(n, r, i - n, a - r)
      }

      function i(e, t, n) {
        var r, i, a, s, c, u, d, f, h, p;
        return c = e.x, u = e.y, d = e.x + e.w, f = e.y + e.h, h = t.x + t.w, p = t.y + t.h, r = l(0, t.x - c), i = l(0, t.y - u), a = l(0, d - h), s = l(0, f - p), c += r, u += i, n && (d += r, f += i, c -= a, u -= s), d -= a, f -= s, o(c, u, d - c, f - u)
      }

      function o(e, t, n, r) {
        return {
          x: e,
          y: t,
          w: n,
          h: r
        }
      }

      function a(e) {
        return o(e.left, e.top, e.width, e.height)
      }
      var s = Math.min,
        l = Math.max,
        c = Math.round;
      return {
        inflate: n,
        relativePosition: e,
        findBestRelativePosition: t,
        intersect: r,
        clamp: i,
        create: o,
        fromClientRect: a
      }
    }), r(c, [], function() {
      function e(e, t) {
        return function() {
          e.apply(t, arguments)
        }
      }

      function t(t) {
        if ("object" != typeof this) throw new TypeError("Promises must be constructed via new");
        if ("function" != typeof t) throw new TypeError("not a function");
        this._state = null, this._value = null, this._deferreds = [], s(t, e(r, this), e(i, this))
      }

      function n(e) {
        var t = this;
        return null === this._state ? void this._deferreds.push(e) : void l(function() {
          var n = t._state ? e.onFulfilled : e.onRejected;
          if (null === n) return void(t._state ? e.resolve : e.reject)(t._value);
          var r;
          try {
            r = n(t._value)
          } catch (i) {
            return void e.reject(i)
          }
          e.resolve(r)
        })
      }

      function r(t) {
        try {
          if (t === this) throw new TypeError("A promise cannot be resolved with itself.");
          if (t && ("object" == typeof t || "function" == typeof t)) {
            var n = t.then;
            if ("function" == typeof n) return void s(e(n, t), e(r, this), e(i, this))
          }
          this._state = !0, this._value = t, o.call(this)
        } catch (a) {
          i.call(this, a)
        }
      }

      function i(e) {
        this._state = !1, this._value = e, o.call(this)
      }

      function o() {
        for (var e = 0, t = this._deferreds.length; t > e; e++) n.call(this, this._deferreds[e]);
        this._deferreds = null
      }

      function a(e, t, n, r) {
        this.onFulfilled = "function" == typeof e ? e : null, this.onRejected = "function" == typeof t ? t : null, this.resolve = n, this.reject = r
      }

      function s(e, t, n) {
        var r = !1;
        try {
          e(function(e) {
            r || (r = !0, t(e))
          }, function(e) {
            r || (r = !0, n(e))
          })
        } catch (i) {
          if (r) return;
          r = !0, n(i)
        }
      }
      if (window.Promise) return window.Promise;
      var l = t.immediateFn || "function" == typeof setImmediate && setImmediate || function(e) {
          setTimeout(e, 1)
        },
        c = Array.isArray || function(e) {
          return "[object Array]" === Object.prototype.toString.call(e)
        };
      return t.prototype["catch"] = function(e) {
        return this.then(null, e)
      }, t.prototype.then = function(e, r) {
        var i = this;
        return new t(function(t, o) {
          n.call(i, new a(e, r, t, o))
        })
      }, t.all = function() {
        var e = Array.prototype.slice.call(1 === arguments.length && c(arguments[0]) ? arguments[0] : arguments);
        return new t(function(t, n) {
          function r(o, a) {
            try {
              if (a && ("object" == typeof a || "function" == typeof a)) {
                var s = a.then;
                if ("function" == typeof s) return void s.call(a, function(e) {
                  r(o, e)
                }, n)
              }
              e[o] = a, 0 === --i && t(e)
            } catch (l) {
              n(l)
            }
          }
          if (0 === e.length) return t([]);
          for (var i = e.length, o = 0; o < e.length; o++) r(o, e[o])
        })
      }, t.resolve = function(e) {
        return e && "object" == typeof e && e.constructor === t ? e : new t(function(t) {
          t(e)
        })
      }, t.reject = function(e) {
        return new t(function(t, n) {
          n(e)
        })
      }, t.race = function(e) {
        return new t(function(t, n) {
          for (var r = 0, i = e.length; i > r; r++) e[r].then(t, n)
        })
      }, t
    }), r(u, [c], function(e) {
      function t(e, t) {
        function n(e) {
          window.setTimeout(e, 0)
        }
        var r, i = window.requestAnimationFrame,
          o = ["ms", "moz", "webkit"];
        for (r = 0; r < o.length && !i; r++) i = window[o[r] + "RequestAnimationFrame"];
        i || (i = n), i(e, t)
      }

      function n(e, t) {
        return "number" != typeof t && (t = 0), setTimeout(e, t)
      }

      function r(e, t) {
        return "number" != typeof t && (t = 0), setInterval(e, t)
      }

      function i(e) {
        return clearTimeout(e)
      }

      function o(e) {
        return clearInterval(e)
      }
      var a;
      return {
        requestAnimationFrame: function(n, r) {
          return a ? void a.then(n) : void(a = new e(function(e) {
            r || (r = document.body), t(e, r)
          }).then(n))
        },
        setTimeout: n,
        setInterval: r,
        setEditorTimeout: function(e, t, r) {
          return n(function() {
            e.removed || t()
          }, r)
        },
        setEditorInterval: function(e, t, n) {
          var i;
          return i = r(function() {
            e.removed ? clearInterval(i) : t()
          }, n)
        },
        throttle: function(e, t) {
          var r;
          return function() {
            var i = arguments;
            clearTimeout(r), r = n(function() {
              e.apply(this, i)
            }, t)
          }
        },
        clearInterval: o,
        clearTimeout: i
      }
    }), r(d, [u], function(e) {
      function t(e, t, n, r) {
        e.addEventListener ? e.addEventListener(t, n, r || !1) : e.attachEvent && e.attachEvent("on" + t, n)
      }

      function n(e, t, n, r) {
        e.removeEventListener ? e.removeEventListener(t, n, r || !1) : e.detachEvent && e.detachEvent("on" + t, n)
      }

      function r(e, t) {
        function n() {
          return !1
        }

        function r() {
          return !0
        }
        var i, o = t || {},
          a;
        for (i in e) l[i] || (o[i] = e[i]);
        if (o.target || (o.target = o.srcElement || document), e && s.test(e.type) && e.pageX === a && e.clientX !== a) {
          var c = o.target.ownerDocument || document,
            u = c.documentElement,
            d = c.body;
          o.pageX = e.clientX + (u && u.scrollLeft || d && d.scrollLeft || 0) - (u && u.clientLeft || d && d.clientLeft || 0), o.pageY = e.clientY + (u && u.scrollTop || d && d.scrollTop || 0) - (u && u.clientTop || d && d.clientTop || 0)
        }
        return o.preventDefault = function() {
          o.isDefaultPrevented = r, e && (e.preventDefault ? e.preventDefault() : e.returnValue = !1)
        }, o.stopPropagation = function() {
          o.isPropagationStopped = r, e && (e.stopPropagation ? e.stopPropagation() : e.cancelBubble = !0)
        }, o.stopImmediatePropagation = function() {
          o.isImmediatePropagationStopped = r, o.stopPropagation()
        }, o.isDefaultPrevented || (o.isDefaultPrevented = n, o.isPropagationStopped = n, o.isImmediatePropagationStopped = n), "undefined" == typeof o.metaKey && (o.metaKey = !1), o
      }

      function i(r, i, o) {
        function a() {
          o.domLoaded || (o.domLoaded = !0, i(u))
        }

        function s() {
          ("complete" === c.readyState || "interactive" === c.readyState && c.body) && (n(c, "readystatechange", s), a())
        }

        function l() {
          try {
            c.documentElement.doScroll("left")
          } catch (t) {
            return void e.setTimeout(l)
          }
          a()
        }
        var c = r.document,
          u = {
            type: "ready"
          };
        return o.domLoaded ? void i(u) : (c.addEventListener ? "complete" === c.readyState ? a() : t(r, "DOMContentLoaded", a) : (t(c, "readystatechange", s), c.documentElement.doScroll && r.self === r.top && l()), void t(r, "load", a))
      }

      function o() {
        function e(e, t) {
          var n, r, i, o, a = s[t];
          if (n = a && a[e.type])
            for (r = 0, i = n.length; i > r; r++)
              if (o = n[r], o && o.func.call(o.scope, e) === !1 && e.preventDefault(), e.isImmediatePropagationStopped()) return
        }
        var o = this,
          s = {},
          l, c, u, d, f;
        c = a + (+new Date).toString(32), d = "onmouseenter" in document.documentElement, u = "onfocusin" in document.documentElement, f = {
          mouseenter: "mouseover",
          mouseleave: "mouseout"
        }, l = 1, o.domLoaded = !1, o.events = s, o.bind = function(n, a, h, p) {
          function m(t) {
            e(r(t || E.event), g)
          }
          var g, v, y, b, C, x, w, E = window;
          if (n && 3 !== n.nodeType && 8 !== n.nodeType) {
            for (n[c] ? g = n[c] : (g = l++, n[c] = g, s[g] = {}), p = p || n, a = a.split(" "), y = a.length; y--;) b = a[y], x = m, C = w = !1, "DOMContentLoaded" === b && (b = "ready"), o.domLoaded && "ready" === b && "complete" == n.readyState ? h.call(p, r({
              type: b
            })) : (d || (C = f[b], C && (x = function(t) {
              var n, i;
              if (n = t.currentTarget, i = t.relatedTarget, i && n.contains) i = n.contains(i);
              else
                for (; i && i !== n;) i = i.parentNode;
              i || (t = r(t || E.event), t.type = "mouseout" === t.type ? "mouseleave" : "mouseenter", t.target = n, e(t, g))
            })), u || "focusin" !== b && "focusout" !== b || (w = !0, C = "focusin" === b ? "focus" : "blur", x = function(t) {
              t = r(t || E.event), t.type = "focus" === t.type ? "focusin" : "focusout", e(t, g)
            }), v = s[g][b], v ? "ready" === b && o.domLoaded ? h({
              type: b
            }) : v.push({
              func: h,
              scope: p
            }) : (s[g][b] = v = [{
              func: h,
              scope: p
            }], v.fakeName = C, v.capture = w, v.nativeHandler = x, "ready" === b ? i(n, x, o) : t(n, C || b, x, w)));
            return n = v = 0, h
          }
        }, o.unbind = function(e, t, r) {
          var i, a, l, u, d, f;
          if (!e || 3 === e.nodeType || 8 === e.nodeType) return o;
          if (i = e[c]) {
            if (f = s[i], t) {
              for (t = t.split(" "), l = t.length; l--;)
                if (d = t[l], a = f[d]) {
                  if (r)
                    for (u = a.length; u--;)
                      if (a[u].func === r) {
                        var h = a.nativeHandler,
                          p = a.fakeName,
                          m = a.capture;
                        a = a.slice(0, u).concat(a.slice(u + 1)), a.nativeHandler = h, a.fakeName = p, a.capture = m, f[d] = a
                      }
                  r && 0 !== a.length || (delete f[d], n(e, a.fakeName || d, a.nativeHandler, a.capture))
                }
            } else {
              for (d in f) a = f[d], n(e, a.fakeName || d, a.nativeHandler, a.capture);
              f = {}
            }
            for (d in f) return o;
            delete s[i];
            try {
              delete e[c]
            } catch (g) {
              e[c] = null
            }
          }
          return o
        }, o.fire = function(t, n, i) {
          var a;
          if (!t || 3 === t.nodeType || 8 === t.nodeType) return o;
          i = r(null, i), i.type = n, i.target = t;
          do a = t[c], a && e(i, a), t = t.parentNode || t.ownerDocument || t.defaultView || t.parentWindow; while (t && !i.isPropagationStopped());
          return o
        }, o.clean = function(e) {
          var t, n, r = o.unbind;
          if (!e || 3 === e.nodeType || 8 === e.nodeType) return o;
          if (e[c] && r(e), e.getElementsByTagName || (e = e.document), e && e.getElementsByTagName)
            for (r(e), n = e.getElementsByTagName("*"), t = n.length; t--;) e = n[t], e[c] && r(e);
          return o
        }, o.destroy = function() {
          s = {}
        }, o.cancel = function(e) {
          return e && (e.preventDefault(), e.stopImmediatePropagation()), !1
        }
      }
      var a = "mce-data-",
        s = /^(?:mouse|contextmenu)|click/,
        l = {
          keyLocation: 1,
          layerX: 1,
          layerY: 1,
          returnValue: 1,
          webkitMovementX: 1,
          webkitMovementY: 1
        };
      return o.Event = new o, o.Event.bind(window, "ready", function() {}), o
    }), r(f, [], function() {
      function e(e, t, n, r) {
        var i, o, a, s, l, c, d, h, p, m;
        if ((t ? t.ownerDocument || t : z) !== D && B(t), t = t || D, n = n || [], !e || "string" != typeof e) return n;
        if (1 !== (s = t.nodeType) && 9 !== s) return [];
        if (L && !r) {
          if (i = ve.exec(e))
            if (a = i[1]) {
              if (9 === s) {
                if (o = t.getElementById(a), !o || !o.parentNode) return n;
                if (o.id === a) return n.push(o), n
              } else if (t.ownerDocument && (o = t.ownerDocument.getElementById(a)) && I(t, o) && o.id === a) return n.push(o), n
            } else {
              if (i[2]) return Z.apply(n, t.getElementsByTagName(e)), n;
              if ((a = i[3]) && x.getElementsByClassName) return Z.apply(n, t.getElementsByClassName(a)), n
            }
          if (x.qsa && (!P || !P.test(e))) {
            if (h = d = F, p = t, m = 9 === s && e, 1 === s && "object" !== t.nodeName.toLowerCase()) {
              for (c = _(e), (d = t.getAttribute("id")) ? h = d.replace(be, "\\$&") : t.setAttribute("id", h), h = "[id='" + h + "'] ", l = c.length; l--;) c[l] = h + f(c[l]);
              p = ye.test(e) && u(t.parentNode) || t, m = c.join(",")
            }
            if (m) try {
              return Z.apply(n, p.querySelectorAll(m)), n
            } catch (g) {} finally {
              d || t.removeAttribute("id")
            }
          }
        }
        return k(e.replace(se, "$1"), t, n, r)
      }

      function n() {
        function e(n, r) {
          return t.push(n + " ") > w.cacheLength && delete e[t.shift()], e[n + " "] = r
        }
        var t = [];
        return e
      }

      function r(e) {
        return e[F] = !0, e
      }

      function i(e) {
        var t = D.createElement("div");
        try {
          return !!e(t)
        } catch (n) {
          return !1
        } finally {
          t.parentNode && t.parentNode.removeChild(t), t = null
        }
      }

      function o(e, t) {
        for (var n = e.split("|"), r = e.length; r--;) w.attrHandle[n[r]] = t
      }

      function a(e, t) {
        var n = t && e,
          r = n && 1 === e.nodeType && 1 === t.nodeType && (~t.sourceIndex || X) - (~e.sourceIndex || X);
        if (r) return r;
        if (n)
          for (; n = n.nextSibling;)
            if (n === t) return -1;
        return e ? 1 : -1
      }

      function s(e) {
        return function(t) {
          var n = t.nodeName.toLowerCase();
          return "input" === n && t.type === e
        }
      }

      function l(e) {
        return function(t) {
          var n = t.nodeName.toLowerCase();
          return ("input" === n || "button" === n) && t.type === e
        }
      }

      function c(e) {
        return r(function(t) {
          return t = +t, r(function(n, r) {
            for (var i, o = e([], n.length, t), a = o.length; a--;) n[i = o[a]] && (n[i] = !(r[i] = n[i]))
          })
        })
      }

      function u(e) {
        return e && typeof e.getElementsByTagName !== Y && e
      }

      function d() {}

      function f(e) {
        for (var t = 0, n = e.length, r = ""; n > t; t++) r += e[t].value;
        return r
      }

      function h(e, t, n) {
        var r = t.dir,
          i = n && "parentNode" === r,
          o = V++;
        return t.first ? function(t, n, o) {
          for (; t = t[r];)
            if (1 === t.nodeType || i) return e(t, n, o)
        } : function(t, n, a) {
          var s, l, c = [W, o];
          if (a) {
            for (; t = t[r];)
              if ((1 === t.nodeType || i) && e(t, n, a)) return !0
          } else
            for (; t = t[r];)
              if (1 === t.nodeType || i) {
                if (l = t[F] || (t[F] = {}), (s = l[r]) && s[0] === W && s[1] === o) return c[2] = s[2];
                if (l[r] = c, c[2] = e(t, n, a)) return !0
              }
        }
      }

      function p(e) {
        return e.length > 1 ? function(t, n, r) {
          for (var i = e.length; i--;)
            if (!e[i](t, n, r)) return !1;
          return !0
        } : e[0]
      }

      function m(t, n, r) {
        for (var i = 0, o = n.length; o > i; i++) e(t, n[i], r);
        return r
      }

      function g(e, t, n, r, i) {
        for (var o, a = [], s = 0, l = e.length, c = null != t; l > s; s++)(o = e[s]) && (!n || n(o, r, i)) && (a.push(o), c && t.push(s));
        return a
      }

      function v(e, t, n, i, o, a) {
        return i && !i[F] && (i = v(i)), o && !o[F] && (o = v(o, a)), r(function(r, a, s, l) {
          var c, u, d, f = [],
            h = [],
            p = a.length,
            v = r || m(t || "*", s.nodeType ? [s] : s, []),
            y = !e || !r && t ? v : g(v, f, e, s, l),
            b = n ? o || (r ? e : p || i) ? [] : a : y;
          if (n && n(y, b, s, l), i)
            for (c = g(b, h), i(c, [], s, l), u = c.length; u--;)(d = c[u]) && (b[h[u]] = !(y[h[u]] = d));
          if (r) {
            if (o || e) {
              if (o) {
                for (c = [], u = b.length; u--;)(d = b[u]) && c.push(y[u] = d);
                o(null, b = [], c, l)
              }
              for (u = b.length; u--;)(d = b[u]) && (c = o ? te.call(r, d) : f[u]) > -1 && (r[c] = !(a[c] = d))
            }
          } else b = g(b === a ? b.splice(p, b.length) : b), o ? o(null, a, b, l) : Z.apply(a, b)
        })
      }

      function y(e) {
        for (var t, n, r, i = e.length, o = w.relative[e[0].type], a = o || w.relative[" "], s = o ? 1 : 0, l = h(function(e) {
            return e === t
          }, a, !0), c = h(function(e) {
            return te.call(t, e) > -1
          }, a, !0), u = [function(e, n, r) {
            return !o && (r || n !== T) || ((t = n).nodeType ? l(e, n, r) : c(e, n, r))
          }]; i > s; s++)
          if (n = w.relative[e[s].type]) u = [h(p(u), n)];
          else {
            if (n = w.filter[e[s].type].apply(null, e[s].matches), n[F]) {
              for (r = ++s; i > r && !w.relative[e[r].type]; r++);
              return v(s > 1 && p(u), s > 1 && f(e.slice(0, s - 1).concat({
                value: " " === e[s - 2].type ? "*" : ""
              })).replace(se, "$1"), n, r > s && y(e.slice(s, r)), i > r && y(e = e.slice(r)), i > r && f(e))
            }
            u.push(n)
          }
        return p(u)
      }

      function b(t, n) {
        var i = n.length > 0,
          o = t.length > 0,
          a = function(r, a, s, l, c) {
            var u, d, f, h = 0,
              p = "0",
              m = r && [],
              v = [],
              y = T,
              b = r || o && w.find.TAG("*", c),
              C = W += null == y ? 1 : Math.random() || .1,
              x = b.length;
            for (c && (T = a !== D && a); p !== x && null != (u = b[p]); p++) {
              if (o && u) {
                for (d = 0; f = t[d++];)
                  if (f(u, a, s)) {
                    l.push(u);
                    break
                  }
                c && (W = C)
              }
              i && ((u = !f && u) && h--, r && m.push(u))
            }
            if (h += p, i && p !== h) {
              for (d = 0; f = n[d++];) f(m, v, a, s);
              if (r) {
                if (h > 0)
                  for (; p--;) m[p] || v[p] || (v[p] = J.call(l));
                v = g(v)
              }
              Z.apply(l, v), c && !r && v.length > 0 && h + n.length > 1 && e.uniqueSort(l)
            }
            return c && (W = C, T = y), m
          };
        return i ? r(a) : a
      }
      var C, x, w, E, N, _, S, k, T, R, A, B, D, M, L, P, H, O, I, F = "sizzle" + -new Date,
        z = window.document,
        W = 0,
        V = 0,
        U = n(),
        $ = n(),
        q = n(),
        j = function(e, t) {
          return e === t && (A = !0), 0
        },
        Y = typeof t,
        X = 1 << 31,
        K = {}.hasOwnProperty,
        G = [],
        J = G.pop,
        Q = G.push,
        Z = G.push,
        ee = G.slice,
        te = G.indexOf || function(e) {
          for (var t = 0, n = this.length; n > t; t++)
            if (this[t] === e) return t;
          return -1
        },
        ne = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
        re = "[\\x20\\t\\r\\n\\f]",
        ie = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
        oe = "\\[" + re + "*(" + ie + ")(?:" + re + "*([*^$|!~]?=)" + re + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + ie + "))|)" + re + "*\\]",
        ae = ":(" + ie + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + oe + ")*)|.*)\\)|)",
        se = new RegExp("^" + re + "+|((?:^|[^\\\\])(?:\\\\.)*)" + re + "+$", "g"),
        le = new RegExp("^" + re + "*," + re + "*"),
        ce = new RegExp("^" + re + "*([>+~]|" + re + ")" + re + "*"),
        ue = new RegExp("=" + re + "*([^\\]'\"]*?)" + re + "*\\]", "g"),
        de = new RegExp(ae),
        fe = new RegExp("^" + ie + "$"),
        he = {
          ID: new RegExp("^#(" + ie + ")"),
          CLASS: new RegExp("^\\.(" + ie + ")"),
          TAG: new RegExp("^(" + ie + "|[*])"),
          ATTR: new RegExp("^" + oe),
          PSEUDO: new RegExp("^" + ae),
          CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + re + "*(even|odd|(([+-]|)(\\d*)n|)" + re + "*(?:([+-]|)" + re + "*(\\d+)|))" + re + "*\\)|)", "i"),
          bool: new RegExp("^(?:" + ne + ")$", "i"),
          needsContext: new RegExp("^" + re + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + re + "*((?:-\\d)?\\d*)" + re + "*\\)|)(?=[^-]|$)", "i")
        },
        pe = /^(?:input|select|textarea|button)$/i,
        me = /^h\d$/i,
        ge = /^[^{]+\{\s*\[native \w/,
        ve = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
        ye = /[+~]/,
        be = /'|\\/g,
        Ce = new RegExp("\\\\([\\da-f]{1,6}" + re + "?|(" + re + ")|.)", "ig"),
        xe = function(e, t, n) {
          var r = "0x" + t - 65536;
          return r !== r || n ? t : 0 > r ? String.fromCharCode(r + 65536) : String.fromCharCode(r >> 10 | 55296, 1023 & r | 56320)
        };
      try {
        Z.apply(G = ee.call(z.childNodes), z.childNodes), G[z.childNodes.length].nodeType
      } catch (we) {
        Z = {
          apply: G.length ? function(e, t) {
            Q.apply(e, ee.call(t))
          } : function(e, t) {
            for (var n = e.length, r = 0; e[n++] = t[r++];);
            e.length = n - 1
          }
        }
      }
      x = e.support = {}, N = e.isXML = function(e) {
        var t = e && (e.ownerDocument || e).documentElement;
        return t ? "HTML" !== t.nodeName : !1
      }, B = e.setDocument = function(e) {
        var t, n = e ? e.ownerDocument || e : z,
          r = n.defaultView;
        return n !== D && 9 === n.nodeType && n.documentElement ? (D = n, M = n.documentElement, L = !N(n), r && r !== r.top && (r.addEventListener ? r.addEventListener("unload", function() {
          B()
        }, !1) : r.attachEvent && r.attachEvent("onunload", function() {
          B()
        })), x.attributes = i(function(e) {
          return e.className = "i", !e.getAttribute("className")
        }), x.getElementsByTagName = i(function(e) {
          return e.appendChild(n.createComment("")), !e.getElementsByTagName("*").length
        }), x.getElementsByClassName = ge.test(n.getElementsByClassName), x.getById = i(function(e) {
          return M.appendChild(e).id = F, !n.getElementsByName || !n.getElementsByName(F).length
        }), x.getById ? (w.find.ID = function(e, t) {
          if (typeof t.getElementById !== Y && L) {
            var n = t.getElementById(e);
            return n && n.parentNode ? [n] : []
          }
        }, w.filter.ID = function(e) {
          var t = e.replace(Ce, xe);
          return function(e) {
            return e.getAttribute("id") === t
          }
        }) : (delete w.find.ID, w.filter.ID = function(e) {
          var t = e.replace(Ce, xe);
          return function(e) {
            var n = typeof e.getAttributeNode !== Y && e.getAttributeNode("id");
            return n && n.value === t
          }
        }), w.find.TAG = x.getElementsByTagName ? function(e, t) {
          return typeof t.getElementsByTagName !== Y ? t.getElementsByTagName(e) : void 0
        } : function(e, t) {
          var n, r = [],
            i = 0,
            o = t.getElementsByTagName(e);
          if ("*" === e) {
            for (; n = o[i++];) 1 === n.nodeType && r.push(n);
            return r
          }
          return o
        }, w.find.CLASS = x.getElementsByClassName && function(e, t) {
          return L ? t.getElementsByClassName(e) : void 0
        }, H = [], P = [], (x.qsa = ge.test(n.querySelectorAll)) && (i(function(e) {
          e.innerHTML = "<select msallowcapture=''><option selected=''></option></select>", e.querySelectorAll("[msallowcapture^='']").length && P.push("[*^$]=" + re + "*(?:''|\"\")"), e.querySelectorAll("[selected]").length || P.push("\\[" + re + "*(?:value|" + ne + ")"), e.querySelectorAll(":checked").length || P.push(":checked")
        }), i(function(e) {
          var t = n.createElement("input");
          t.setAttribute("type", "hidden"), e.appendChild(t).setAttribute("name", "D"), e.querySelectorAll("[name=d]").length && P.push("name" + re + "*[*^$|!~]?="), e.querySelectorAll(":enabled").length || P.push(":enabled", ":disabled"), e.querySelectorAll("*,:x"), P.push(",.*:")
        })), (x.matchesSelector = ge.test(O = M.matches || M.webkitMatchesSelector || M.mozMatchesSelector || M.oMatchesSelector || M.msMatchesSelector)) && i(function(e) {
          x.disconnectedMatch = O.call(e, "div"), O.call(e, "[s!='']:x"), H.push("!=", ae)
        }), P = P.length && new RegExp(P.join("|")), H = H.length && new RegExp(H.join("|")), t = ge.test(M.compareDocumentPosition), I = t || ge.test(M.contains) ? function(e, t) {
          var n = 9 === e.nodeType ? e.documentElement : e,
            r = t && t.parentNode;
          return e === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r)))
        } : function(e, t) {
          if (t)
            for (; t = t.parentNode;)
              if (t === e) return !0;
          return !1
        }, j = t ? function(e, t) {
          if (e === t) return A = !0, 0;
          var r = !e.compareDocumentPosition - !t.compareDocumentPosition;
          return r ? r : (r = (e.ownerDocument || e) === (t.ownerDocument || t) ? e.compareDocumentPosition(t) : 1, 1 & r || !x.sortDetached && t.compareDocumentPosition(e) === r ? e === n || e.ownerDocument === z && I(z, e) ? -1 : t === n || t.ownerDocument === z && I(z, t) ? 1 : R ? te.call(R, e) - te.call(R, t) : 0 : 4 & r ? -1 : 1)
        } : function(e, t) {
          if (e === t) return A = !0, 0;
          var r, i = 0,
            o = e.parentNode,
            s = t.parentNode,
            l = [e],
            c = [t];
          if (!o || !s) return e === n ? -1 : t === n ? 1 : o ? -1 : s ? 1 : R ? te.call(R, e) - te.call(R, t) : 0;
          if (o === s) return a(e, t);
          for (r = e; r = r.parentNode;) l.unshift(r);
          for (r = t; r = r.parentNode;) c.unshift(r);
          for (; l[i] === c[i];) i++;
          return i ? a(l[i], c[i]) : l[i] === z ? -1 : c[i] === z ? 1 : 0
        }, n) : D
      }, e.matches = function(t, n) {
        return e(t, null, null, n)
      }, e.matchesSelector = function(t, n) {
        if ((t.ownerDocument || t) !== D && B(t), n = n.replace(ue, "='$1']"), x.matchesSelector && L && (!H || !H.test(n)) && (!P || !P.test(n))) try {
          var r = O.call(t, n);
          if (r || x.disconnectedMatch || t.document && 11 !== t.document.nodeType) return r
        } catch (i) {}
        return e(n, D, null, [t]).length > 0
      }, e.contains = function(e, t) {
        return (e.ownerDocument || e) !== D && B(e), I(e, t)
      }, e.attr = function(e, n) {
        (e.ownerDocument || e) !== D && B(e);
        var r = w.attrHandle[n.toLowerCase()],
          i = r && K.call(w.attrHandle, n.toLowerCase()) ? r(e, n, !L) : t;
        return i !== t ? i : x.attributes || !L ? e.getAttribute(n) : (i = e.getAttributeNode(n)) && i.specified ? i.value : null
      }, e.error = function(e) {
        throw new Error("Syntax error, unrecognized expression: " + e)
      }, e.uniqueSort = function(e) {
        var t, n = [],
          r = 0,
          i = 0;
        if (A = !x.detectDuplicates, R = !x.sortStable && e.slice(0), e.sort(j), A) {
          for (; t = e[i++];) t === e[i] && (r = n.push(i));
          for (; r--;) e.splice(n[r], 1)
        }
        return R = null, e
      }, E = e.getText = function(e) {
        var t, n = "",
          r = 0,
          i = e.nodeType;
        if (i) {
          if (1 === i || 9 === i || 11 === i) {
            if ("string" == typeof e.textContent) return e.textContent;
            for (e = e.firstChild; e; e = e.nextSibling) n += E(e)
          } else if (3 === i || 4 === i) return e.nodeValue
        } else
          for (; t = e[r++];) n += E(t);
        return n
      }, w = e.selectors = {
        cacheLength: 50,
        createPseudo: r,
        match: he,
        attrHandle: {},
        find: {},
        relative: {
          ">": {
            dir: "parentNode",
            first: !0
          },
          " ": {
            dir: "parentNode"
          },
          "+": {
            dir: "previousSibling",
            first: !0
          },
          "~": {
            dir: "previousSibling"
          }
        },
        preFilter: {
          ATTR: function(e) {
            return e[1] = e[1].replace(Ce, xe), e[3] = (e[3] || e[4] || e[5] || "").replace(Ce, xe), "~=" === e[2] && (e[3] = " " + e[3] + " "), e.slice(0, 4)
          },
          CHILD: function(t) {
            return t[1] = t[1].toLowerCase(), "nth" === t[1].slice(0, 3) ? (t[3] || e.error(t[0]), t[4] = +(t[4] ? t[5] + (t[6] || 1) : 2 * ("even" === t[3] || "odd" === t[3])), t[5] = +(t[7] + t[8] || "odd" === t[3])) : t[3] && e.error(t[0]), t
          },
          PSEUDO: function(e) {
            var t, n = !e[6] && e[2];
            return he.CHILD.test(e[0]) ? null : (e[3] ? e[2] = e[4] || e[5] || "" : n && de.test(n) && (t = _(n, !0)) && (t = n.indexOf(")", n.length - t) - n.length) && (e[0] = e[0].slice(0, t), e[2] = n.slice(0, t)), e.slice(0, 3))
          }
        },
        filter: {
          TAG: function(e) {
            var t = e.replace(Ce, xe).toLowerCase();
            return "*" === e ? function() {
              return !0
            } : function(e) {
              return e.nodeName && e.nodeName.toLowerCase() === t
            }
          },
          CLASS: function(e) {
            var t = U[e + " "];
            return t || (t = new RegExp("(^|" + re + ")" + e + "(" + re + "|$)")) && U(e, function(e) {
              return t.test("string" == typeof e.className && e.className || typeof e.getAttribute !== Y && e.getAttribute("class") || "")
            })
          },
          ATTR: function(t, n, r) {
            return function(i) {
              var o = e.attr(i, t);
              return null == o ? "!=" === n : n ? (o += "", "=" === n ? o === r : "!=" === n ? o !== r : "^=" === n ? r && 0 === o.indexOf(r) : "*=" === n ? r && o.indexOf(r) > -1 : "$=" === n ? r && o.slice(-r.length) === r : "~=" === n ? (" " + o + " ").indexOf(r) > -1 : "|=" === n ? o === r || o.slice(0, r.length + 1) === r + "-" : !1) : !0
            }
          },
          CHILD: function(e, t, n, r, i) {
            var o = "nth" !== e.slice(0, 3),
              a = "last" !== e.slice(-4),
              s = "of-type" === t;
            return 1 === r && 0 === i ? function(e) {
              return !!e.parentNode
            } : function(t, n, l) {
              var c, u, d, f, h, p, m = o !== a ? "nextSibling" : "previousSibling",
                g = t.parentNode,
                v = s && t.nodeName.toLowerCase(),
                y = !l && !s;
              if (g) {
                if (o) {
                  for (; m;) {
                    for (d = t; d = d[m];)
                      if (s ? d.nodeName.toLowerCase() === v : 1 === d.nodeType) return !1;
                    p = m = "only" === e && !p && "nextSibling"
                  }
                  return !0
                }
                if (p = [a ? g.firstChild : g.lastChild], a && y) {
                  for (u = g[F] || (g[F] = {}), c = u[e] || [], h = c[0] === W && c[1], f = c[0] === W && c[2], d = h && g.childNodes[h]; d = ++h && d && d[m] || (f = h = 0) || p.pop();)
                    if (1 === d.nodeType && ++f && d === t) {
                      u[e] = [W, h, f];
                      break
                    }
                } else if (y && (c = (t[F] || (t[F] = {}))[e]) && c[0] === W) f = c[1];
                else
                  for (;
                    (d = ++h && d && d[m] || (f = h = 0) || p.pop()) && ((s ? d.nodeName.toLowerCase() !== v : 1 !== d.nodeType) || !++f || (y && ((d[F] || (d[F] = {}))[e] = [W, f]), d !== t)););
                return f -= i, f === r || f % r === 0 && f / r >= 0
              }
            }
          },
          PSEUDO: function(t, n) {
            var i, o = w.pseudos[t] || w.setFilters[t.toLowerCase()] || e.error("unsupported pseudo: " + t);
            return o[F] ? o(n) : o.length > 1 ? (i = [t, t, "", n], w.setFilters.hasOwnProperty(t.toLowerCase()) ? r(function(e, t) {
              for (var r, i = o(e, n), a = i.length; a--;) r = te.call(e, i[a]), e[r] = !(t[r] = i[a])
            }) : function(e) {
              return o(e, 0, i)
            }) : o
          }
        },
        pseudos: {
          not: r(function(e) {
            var t = [],
              n = [],
              i = S(e.replace(se, "$1"));
            return i[F] ? r(function(e, t, n, r) {
              for (var o, a = i(e, null, r, []), s = e.length; s--;)(o = a[s]) && (e[s] = !(t[s] = o))
            }) : function(e, r, o) {
              return t[0] = e, i(t, null, o, n), !n.pop()
            }
          }),
          has: r(function(t) {
            return function(n) {
              return e(t, n).length > 0
            }
          }),
          contains: r(function(e) {
            return e = e.replace(Ce, xe),
              function(t) {
                return (t.textContent || t.innerText || E(t)).indexOf(e) > -1
              }
          }),
          lang: r(function(t) {
            return fe.test(t || "") || e.error("unsupported lang: " + t), t = t.replace(Ce, xe).toLowerCase(),
              function(e) {
                var n;
                do
                  if (n = L ? e.lang : e.getAttribute("xml:lang") || e.getAttribute("lang")) return n = n.toLowerCase(), n === t || 0 === n.indexOf(t + "-"); while ((e = e.parentNode) && 1 === e.nodeType);
                return !1
              }
          }),
          target: function(e) {
            var t = window.location && window.location.hash;
            return t && t.slice(1) === e.id
          },
          root: function(e) {
            return e === M
          },
          focus: function(e) {
            return e === D.activeElement && (!D.hasFocus || D.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
          },
          enabled: function(e) {
            return e.disabled === !1
          },
          disabled: function(e) {
            return e.disabled === !0
          },
          checked: function(e) {
            var t = e.nodeName.toLowerCase();
            return "input" === t && !!e.checked || "option" === t && !!e.selected
          },
          selected: function(e) {
            return e.parentNode && e.parentNode.selectedIndex, e.selected === !0
          },
          empty: function(e) {
            for (e = e.firstChild; e; e = e.nextSibling)
              if (e.nodeType < 6) return !1;
            return !0
          },
          parent: function(e) {
            return !w.pseudos.empty(e)
          },
          header: function(e) {
            return me.test(e.nodeName)
          },
          input: function(e) {
            return pe.test(e.nodeName)
          },
          button: function(e) {
            var t = e.nodeName.toLowerCase();
            return "input" === t && "button" === e.type || "button" === t
          },
          text: function(e) {
            var t;
            return "input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || "text" === t.toLowerCase())
          },
          first: c(function() {
            return [0]
          }),
          last: c(function(e, t) {
            return [t - 1]
          }),
          eq: c(function(e, t, n) {
            return [0 > n ? n + t : n]
          }),
          even: c(function(e, t) {
            for (var n = 0; t > n; n += 2) e.push(n);
            return e
          }),
          odd: c(function(e, t) {
            for (var n = 1; t > n; n += 2) e.push(n);
            return e
          }),
          lt: c(function(e, t, n) {
            for (var r = 0 > n ? n + t : n; --r >= 0;) e.push(r);
            return e
          }),
          gt: c(function(e, t, n) {
            for (var r = 0 > n ? n + t : n; ++r < t;) e.push(r);
            return e
          })
        }
      }, w.pseudos.nth = w.pseudos.eq;
      for (C in {
          radio: !0,
          checkbox: !0,
          file: !0,
          password: !0,
          image: !0
        }) w.pseudos[C] = s(C);
      for (C in {
          submit: !0,
          reset: !0
        }) w.pseudos[C] = l(C);
      return d.prototype = w.filters = w.pseudos, w.setFilters = new d, _ = e.tokenize = function(t, n) {
        var r, i, o, a, s, l, c, u = $[t + " "];
        if (u) return n ? 0 : u.slice(0);
        for (s = t, l = [], c = w.preFilter; s;) {
          (!r || (i = le.exec(s))) && (i && (s = s.slice(i[0].length) || s), l.push(o = [])), r = !1, (i = ce.exec(s)) && (r = i.shift(), o.push({
            value: r,
            type: i[0].replace(se, " ")
          }), s = s.slice(r.length));
          for (a in w.filter) !(i = he[a].exec(s)) || c[a] && !(i = c[a](i)) || (r = i.shift(), o.push({
            value: r,
            type: a,
            matches: i
          }), s = s.slice(r.length));
          if (!r) break
        }
        return n ? s.length : s ? e.error(t) : $(t, l).slice(0)
      }, S = e.compile = function(e, t) {
        var n, r = [],
          i = [],
          o = q[e + " "];
        if (!o) {
          for (t || (t = _(e)), n = t.length; n--;) o = y(t[n]), o[F] ? r.push(o) : i.push(o);
          o = q(e, b(i, r)), o.selector = e
        }
        return o
      }, k = e.select = function(e, t, n, r) {
        var i, o, a, s, l, c = "function" == typeof e && e,
          d = !r && _(e = c.selector || e);
        if (n = n || [], 1 === d.length) {
          if (o = d[0] = d[0].slice(0), o.length > 2 && "ID" === (a = o[0]).type && x.getById && 9 === t.nodeType && L && w.relative[o[1].type]) {
            if (t = (w.find.ID(a.matches[0].replace(Ce, xe), t) || [])[0], !t) return n;
            c && (t = t.parentNode), e = e.slice(o.shift().value.length)
          }
          for (i = he.needsContext.test(e) ? 0 : o.length; i-- && (a = o[i], !w.relative[s = a.type]);)
            if ((l = w.find[s]) && (r = l(a.matches[0].replace(Ce, xe), ye.test(o[0].type) && u(t.parentNode) || t))) {
              if (o.splice(i, 1), e = r.length && f(o), !e) return Z.apply(n, r), n;
              break
            }
        }
        return (c || S(e, d))(r, t, !L, n, ye.test(e) && u(t.parentNode) || t), n
      }, x.sortStable = F.split("").sort(j).join("") === F, x.detectDuplicates = !!A, B(), x.sortDetached = i(function(e) {
        return 1 & e.compareDocumentPosition(D.createElement("div"))
      }), i(function(e) {
        return e.innerHTML = "<a href='#'></a>", "#" === e.firstChild.getAttribute("href")
      }) || o("type|href|height|width", function(e, t, n) {
        return n ? void 0 : e.getAttribute(t, "type" === t.toLowerCase() ? 1 : 2)
      }), x.attributes && i(function(e) {
        return e.innerHTML = "<input/>", e.firstChild.setAttribute("value", ""), "" === e.firstChild.getAttribute("value")
      }) || o("value", function(e, t, n) {
        return n || "input" !== e.nodeName.toLowerCase() ? void 0 : e.defaultValue
      }), i(function(e) {
        return null == e.getAttribute("disabled")
      }) || o(ne, function(e, t, n) {
        var r;
        return n ? void 0 : e[t] === !0 ? t.toLowerCase() : (r = e.getAttributeNode(t)) && r.specified ? r.value : null
      }), e
    }), r(h, [], function() {
      function e(e) {
        return "matchMedia" in window ? matchMedia(e).matches : !1
      }
      var t = navigator,
        n = t.userAgent,
        r, i, o, a, s, l, c, u, d, f, h, p;
      r = window.opera && window.opera.buildNumber, d = /Android/.test(n), i = /WebKit/.test(n), o = !i && !r && /MSIE/gi.test(n) && /Explorer/gi.test(t.appName), o = o && /MSIE (\w+)\./.exec(n)[1], a = -1 == n.indexOf("Trident/") || -1 == n.indexOf("rv:") && -1 == t.appName.indexOf("Netscape") ? !1 : 11, s = -1 == n.indexOf("Edge/") || o || a ? !1 : 12, o = o || a || s, l = !i && !a && /Gecko/.test(n), c = -1 != n.indexOf("Mac"),
        u = /(iPad|iPhone)/.test(n), f = "FormData" in window && "FileReader" in window && "URL" in window && !!URL.createObjectURL, h = e("only screen and (max-device-width: 480px)") && (d || u), p = e("only screen and (min-width: 800px)") && (d || u), s && (i = !1);
      var m = !u || f || n.match(/AppleWebKit\/(\d*)/)[1] >= 534;
      return {
        opera: r,
        webkit: i,
        ie: o,
        gecko: l,
        mac: c,
        iOS: u,
        android: d,
        contentEditable: m,
        transparentSrc: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        caretAfter: 8 != o,
        range: window.getSelection && "Range" in window,
        documentMode: o && !s ? document.documentMode || 7 : 10,
        fileApi: f,
        ceFalse: o === !1 || o > 8,
        desktop: !h && !p
      }
    }), r(p, [], function() {
      function e(e) {
        var t = e,
          n, r;
        if (!u(e))
          for (t = [], n = 0, r = e.length; r > n; n++) t[n] = e[n];
        return t
      }

      function n(e, n, r) {
        var i, o;
        if (!e) return 0;
        if (r = r || e, e.length !== t) {
          for (i = 0, o = e.length; o > i; i++)
            if (n.call(r, e[i], i, e) === !1) return 0
        } else
          for (i in e)
            if (e.hasOwnProperty(i) && n.call(r, e[i], i, e) === !1) return 0;
        return 1
      }

      function r(e, t) {
        var r = [];
        return n(e, function(n, i) {
          r.push(t(n, i, e))
        }), r
      }

      function i(e, t) {
        var r = [];
        return n(e, function(n, i) {
          (!t || t(n, i, e)) && r.push(n)
        }), r
      }

      function o(e, t) {
        var n, r;
        if (e)
          for (n = 0, r = e.length; r > n; n++)
            if (e[n] === t) return n;
        return -1
      }

      function a(e, t, n, r) {
        var i = 0;
        for (arguments.length < 3 && (n = e[0]); i < e.length; i++) n = t.call(r, n, e[i], i);
        return n
      }

      function s(e, t, n) {
        var r, i;
        for (r = 0, i = e.length; i > r; r++)
          if (t.call(n, e[r], r, e)) return r;
        return -1
      }

      function l(e, n, r) {
        var i = s(e, n, r);
        return -1 !== i ? e[i] : t
      }

      function c(e) {
        return e[e.length - 1]
      }
      var u = Array.isArray || function(e) {
        return "[object Array]" === Object.prototype.toString.call(e)
      };
      return {
        isArray: u,
        toArray: e,
        each: n,
        map: r,
        filter: i,
        indexOf: o,
        reduce: a,
        findIndex: s,
        find: l,
        last: c
      }
    }), r(m, [h, p], function(e, n) {
      function r(e) {
        return null === e || e === t ? "" : ("" + e).replace(h, "")
      }

      function i(e, r) {
        return r ? "array" == r && n.isArray(e) ? !0 : typeof e == r : e !== t
      }

      function o(e, t, n) {
        var r;
        for (e = e || [], t = t || ",", "string" == typeof e && (e = e.split(t)), n = n || {}, r = e.length; r--;) n[e[r]] = {};
        return n
      }

      function a(e, t, n) {
        var r = this,
          i, o, a, s, l, c = 0;
        if (e = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(e), a = e[3].match(/(^|\.)(\w+)$/i)[2], o = r.createNS(e[3].replace(/\.\w+$/, ""), n), !o[a]) {
          if ("static" == e[2]) return o[a] = t, void(this.onCreate && this.onCreate(e[2], e[3], o[a]));
          t[a] || (t[a] = function() {}, c = 1), o[a] = t[a], r.extend(o[a].prototype, t), e[5] && (i = r.resolve(e[5]).prototype, s = e[5].match(/\.(\w+)$/i)[1], l = o[a], c ? o[a] = function() {
            return i[s].apply(this, arguments)
          } : o[a] = function() {
            return this.parent = i[s], l.apply(this, arguments)
          }, o[a].prototype[a] = o[a], r.each(i, function(e, t) {
            o[a].prototype[t] = i[t]
          }), r.each(t, function(e, t) {
            i[t] ? o[a].prototype[t] = function() {
              return this.parent = i[t], e.apply(this, arguments)
            } : t != a && (o[a].prototype[t] = e)
          })), r.each(t["static"], function(e, t) {
            o[a][t] = e
          })
        }
      }

      function s(e, n) {
        var r, i, o, a = arguments,
          s;
        for (r = 1, i = a.length; i > r; r++) {
          n = a[r];
          for (o in n) n.hasOwnProperty(o) && (s = n[o], s !== t && (e[o] = s))
        }
        return e
      }

      function l(e, t, r, i) {
        i = i || this, e && (r && (e = e[r]), n.each(e, function(e, n) {
          return t.call(i, e, n, r) === !1 ? !1 : void l(e, t, r, i)
        }))
      }

      function c(e, t) {
        var n, r;
        for (t = t || window, e = e.split("."), n = 0; n < e.length; n++) r = e[n], t[r] || (t[r] = {}), t = t[r];
        return t
      }

      function u(e, t) {
        var n, r;
        for (t = t || window, e = e.split("."), n = 0, r = e.length; r > n && (t = t[e[n]], t); n++);
        return t
      }

      function d(e, t) {
        return !e || i(e, "array") ? e : n.map(e.split(t || ","), r)
      }

      function f(t) {
        var n = e.cacheSuffix;
        return n && (t += (-1 === t.indexOf("?") ? "?" : "&") + n), t
      }
      var h = /^\s*|\s*$/g;
      return {
        trim: r,
        isArray: n.isArray,
        is: i,
        toArray: n.toArray,
        makeMap: o,
        each: n.each,
        map: n.map,
        grep: n.filter,
        inArray: n.indexOf,
        extend: s,
        create: a,
        walk: l,
        createNS: c,
        resolve: u,
        explode: d,
        _addCacheSuffix: f
      }
    }), r(g, [d, f, m, h], function(e, n, r, i) {
      function o(e) {
        return "undefined" != typeof e
      }

      function a(e) {
        return "string" == typeof e
      }

      function s(e) {
        return e && e == e.window
      }

      function l(e, t) {
        var n, r, i;
        for (t = t || w, i = t.createElement("div"), n = t.createDocumentFragment(), i.innerHTML = e; r = i.firstChild;) n.appendChild(r);
        return n
      }

      function c(e, t, n, r) {
        var i;
        if (a(t)) t = l(t, v(e[0]));
        else if (t.length && !t.nodeType) {
          if (t = f.makeArray(t), r)
            for (i = t.length - 1; i >= 0; i--) c(e, t[i], n, r);
          else
            for (i = 0; i < t.length; i++) c(e, t[i], n, r);
          return e
        }
        if (t.nodeType)
          for (i = e.length; i--;) n.call(e[i], t);
        return e
      }

      function u(e, t) {
        return e && t && -1 !== (" " + e.className + " ").indexOf(" " + t + " ")
      }

      function d(e, t, n) {
        var r, i;
        return t = f(t)[0], e.each(function() {
          var e = this;
          n && r == e.parentNode ? i.appendChild(e) : (r = e.parentNode, i = t.cloneNode(!1), e.parentNode.insertBefore(i, e), i.appendChild(e))
        }), e
      }

      function f(e, t) {
        return new f.fn.init(e, t)
      }

      function h(e, t) {
        var n;
        if (t.indexOf) return t.indexOf(e);
        for (n = t.length; n--;)
          if (t[n] === e) return n;
        return -1
      }

      function p(e) {
        return null === e || e === k ? "" : ("" + e).replace(P, "")
      }

      function m(e, t) {
        var n, r, i, o, a;
        if (e)
          if (n = e.length, n === o) {
            for (r in e)
              if (e.hasOwnProperty(r) && (a = e[r], t.call(a, r, a) === !1)) break
          } else
            for (i = 0; n > i && (a = e[i], t.call(a, i, a) !== !1); i++);
        return e
      }

      function g(e, t) {
        var n = [];
        return m(e, function(e, r) {
          t(r, e) && n.push(r)
        }), n
      }

      function v(e) {
        return e ? 9 == e.nodeType ? e : e.ownerDocument : w
      }

      function y(e, n, r) {
        var i = [],
          o = e[n];
        for ("string" != typeof r && r instanceof f && (r = r[0]); o && 9 !== o.nodeType;) {
          if (r !== t) {
            if (o === r) break;
            if ("string" == typeof r && f(o).is(r)) break
          }
          1 === o.nodeType && i.push(o), o = o[n]
        }
        return i
      }

      function b(e, n, r, i) {
        var o = [];
        for (i instanceof f && (i = i[0]); e; e = e[n])
          if (!r || e.nodeType === r) {
            if (i !== t) {
              if (e === i) break;
              if ("string" == typeof i && f(e).is(i)) break
            }
            o.push(e)
          }
        return o
      }

      function C(e, t, n) {
        for (e = e[t]; e; e = e[t])
          if (e.nodeType == n) return e;
        return null
      }

      function x(e, t, n) {
        m(n, function(n, r) {
          e[n] = e[n] || {}, e[n][t] = r
        })
      }
      var w = document,
        E = Array.prototype.push,
        N = Array.prototype.slice,
        _ = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
        S = e.Event,
        k, T = r.makeMap("children,contents,next,prev"),
        R = r.makeMap("fillOpacity fontWeight lineHeight opacity orphans widows zIndex zoom", " "),
        A = r.makeMap("checked compact declare defer disabled ismap multiple nohref noshade nowrap readonly selected", " "),
        B = {
          "for": "htmlFor",
          "class": "className",
          readonly: "readOnly"
        },
        D = {
          "float": "cssFloat"
        },
        M = {},
        L = {},
        P = /^\s*|\s*$/g;
      return f.fn = f.prototype = {
        constructor: f,
        selector: "",
        context: null,
        length: 0,
        init: function(e, t) {
          var n = this,
            r, i;
          if (!e) return n;
          if (e.nodeType) return n.context = n[0] = e, n.length = 1, n;
          if (t && t.nodeType) n.context = t;
          else {
            if (t) return f(e).attr(t);
            n.context = t = document
          }
          if (a(e)) {
            if (n.selector = e, r = "<" === e.charAt(0) && ">" === e.charAt(e.length - 1) && e.length >= 3 ? [null, e, null] : _.exec(e), !r) return f(t).find(e);
            if (r[1])
              for (i = l(e, v(t)).firstChild; i;) E.call(n, i), i = i.nextSibling;
            else {
              if (i = v(t).getElementById(r[2]), !i) return n;
              if (i.id !== r[2]) return n.find(e);
              n.length = 1, n[0] = i
            }
          } else this.add(e, !1);
          return n
        },
        toArray: function() {
          return r.toArray(this)
        },
        add: function(e, t) {
          var n = this,
            r, i;
          if (a(e)) return n.add(f(e));
          if (t !== !1)
            for (r = f.unique(n.toArray().concat(f.makeArray(e))), n.length = r.length, i = 0; i < r.length; i++) n[i] = r[i];
          else E.apply(n, f.makeArray(e));
          return n
        },
        attr: function(e, t) {
          var n = this,
            r;
          if ("object" == typeof e) m(e, function(e, t) {
            n.attr(e, t)
          });
          else {
            if (!o(t)) {
              if (n[0] && 1 === n[0].nodeType) {
                if (r = M[e], r && r.get) return r.get(n[0], e);
                if (A[e]) return n.prop(e) ? e : k;
                t = n[0].getAttribute(e, 2), null === t && (t = k)
              }
              return t
            }
            this.each(function() {
              var n;
              if (1 === this.nodeType) {
                if (n = M[e], n && n.set) return void n.set(this, t);
                null === t ? this.removeAttribute(e, 2) : this.setAttribute(e, t, 2)
              }
            })
          }
          return n
        },
        removeAttr: function(e) {
          return this.attr(e, null)
        },
        prop: function(e, t) {
          var n = this;
          if (e = B[e] || e, "object" == typeof e) m(e, function(e, t) {
            n.prop(e, t)
          });
          else {
            if (!o(t)) return n[0] && n[0].nodeType && e in n[0] ? n[0][e] : t;
            this.each(function() {
              1 == this.nodeType && (this[e] = t)
            })
          }
          return n
        },
        css: function(e, t) {
          function n(e) {
            return e.replace(/-(\D)/g, function(e, t) {
              return t.toUpperCase()
            })
          }

          function r(e) {
            return e.replace(/[A-Z]/g, function(e) {
              return "-" + e
            })
          }
          var i = this,
            a, s;
          if ("object" == typeof e) m(e, function(e, t) {
            i.css(e, t)
          });
          else if (o(t)) e = n(e), "number" != typeof t || R[e] || (t += "px"), i.each(function() {
            var n = this.style;
            if (s = L[e], s && s.set) return void s.set(this, t);
            try {
              this.style[D[e] || e] = t
            } catch (i) {}(null === t || "" === t) && (n.removeProperty ? n.removeProperty(r(e)) : n.removeAttribute(e))
          });
          else {
            if (a = i[0], s = L[e], s && s.get) return s.get(a);
            if (a.ownerDocument.defaultView) try {
              return a.ownerDocument.defaultView.getComputedStyle(a, null).getPropertyValue(r(e))
            } catch (l) {
              return k
            } else if (a.currentStyle) return a.currentStyle[n(e)]
          }
          return i
        },
        remove: function() {
          for (var e = this, t, n = this.length; n--;) t = e[n], S.clean(t), t.parentNode && t.parentNode.removeChild(t);
          return this
        },
        empty: function() {
          for (var e = this, t, n = this.length; n--;)
            for (t = e[n]; t.firstChild;) t.removeChild(t.firstChild);
          return this
        },
        html: function(e) {
          var t = this,
            n;
          if (o(e)) {
            n = t.length;
            try {
              for (; n--;) t[n].innerHTML = e
            } catch (r) {
              f(t[n]).empty().append(e)
            }
            return t
          }
          return t[0] ? t[0].innerHTML : ""
        },
        text: function(e) {
          var t = this,
            n;
          if (o(e)) {
            for (n = t.length; n--;) "innerText" in t[n] ? t[n].innerText = e : t[0].textContent = e;
            return t
          }
          return t[0] ? t[0].innerText || t[0].textContent : ""
        },
        append: function() {
          return c(this, arguments, function(e) {
            1 === this.nodeType && this.appendChild(e)
          })
        },
        prepend: function() {
          return c(this, arguments, function(e) {
            1 === this.nodeType && this.insertBefore(e, this.firstChild)
          }, !0)
        },
        before: function() {
          var e = this;
          return e[0] && e[0].parentNode ? c(e, arguments, function(e) {
            this.parentNode.insertBefore(e, this)
          }) : e
        },
        after: function() {
          var e = this;
          return e[0] && e[0].parentNode ? c(e, arguments, function(e) {
            this.parentNode.insertBefore(e, this.nextSibling)
          }, !0) : e
        },
        appendTo: function(e) {
          return f(e).append(this), this
        },
        prependTo: function(e) {
          return f(e).prepend(this), this
        },
        replaceWith: function(e) {
          return this.before(e).remove()
        },
        wrap: function(e) {
          return d(this, e)
        },
        wrapAll: function(e) {
          return d(this, e, !0)
        },
        wrapInner: function(e) {
          return this.each(function() {
            f(this).contents().wrapAll(e)
          }), this
        },
        unwrap: function() {
          return this.parent().each(function() {
            f(this).replaceWith(this.childNodes)
          })
        },
        clone: function() {
          var e = [];
          return this.each(function() {
            e.push(this.cloneNode(!0))
          }), f(e)
        },
        addClass: function(e) {
          return this.toggleClass(e, !0)
        },
        removeClass: function(e) {
          return this.toggleClass(e, !1)
        },
        toggleClass: function(e, t) {
          var n = this;
          return "string" != typeof e ? n : (-1 !== e.indexOf(" ") ? m(e.split(" "), function() {
            n.toggleClass(this, t)
          }) : n.each(function(n, r) {
            var i, o;
            o = u(r, e), o !== t && (i = r.className, o ? r.className = p((" " + i + " ").replace(" " + e + " ", " ")) : r.className += i ? " " + e : e)
          }), n)
        },
        hasClass: function(e) {
          return u(this[0], e)
        },
        each: function(e) {
          return m(this, e)
        },
        on: function(e, t) {
          return this.each(function() {
            S.bind(this, e, t)
          })
        },
        off: function(e, t) {
          return this.each(function() {
            S.unbind(this, e, t)
          })
        },
        trigger: function(e) {
          return this.each(function() {
            "object" == typeof e ? S.fire(this, e.type, e) : S.fire(this, e)
          })
        },
        show: function() {
          return this.css("display", "")
        },
        hide: function() {
          return this.css("display", "none")
        },
        slice: function() {
          return new f(N.apply(this, arguments))
        },
        eq: function(e) {
          return -1 === e ? this.slice(e) : this.slice(e, +e + 1)
        },
        first: function() {
          return this.eq(0)
        },
        last: function() {
          return this.eq(-1)
        },
        find: function(e) {
          var t, n, r = [];
          for (t = 0, n = this.length; n > t; t++) f.find(e, this[t], r);
          return f(r)
        },
        filter: function(e) {
          return f("function" == typeof e ? g(this.toArray(), function(t, n) {
            return e(n, t)
          }) : f.filter(e, this.toArray()))
        },
        closest: function(e) {
          var t = [];
          return e instanceof f && (e = e[0]), this.each(function(n, r) {
            for (; r;) {
              if ("string" == typeof e && f(r).is(e)) {
                t.push(r);
                break
              }
              if (r == e) {
                t.push(r);
                break
              }
              r = r.parentNode
            }
          }), f(t)
        },
        offset: function(e) {
          var t, n, r, i = 0,
            o = 0,
            a;
          return e ? this.css(e) : (t = this[0], t && (n = t.ownerDocument, r = n.documentElement, t.getBoundingClientRect && (a = t.getBoundingClientRect(), i = a.left + (r.scrollLeft || n.body.scrollLeft) - r.clientLeft, o = a.top + (r.scrollTop || n.body.scrollTop) - r.clientTop)), {
            left: i,
            top: o
          })
        },
        push: E,
        sort: [].sort,
        splice: [].splice
      }, r.extend(f, {
        extend: r.extend,
        makeArray: function(e) {
          return s(e) || e.nodeType ? [e] : r.toArray(e)
        },
        inArray: h,
        isArray: r.isArray,
        each: m,
        trim: p,
        grep: g,
        find: n,
        expr: n.selectors,
        unique: n.uniqueSort,
        text: n.getText,
        contains: n.contains,
        filter: function(e, t, n) {
          var r = t.length;
          for (n && (e = ":not(" + e + ")"); r--;) 1 != t[r].nodeType && t.splice(r, 1);
          return t = 1 === t.length ? f.find.matchesSelector(t[0], e) ? [t[0]] : [] : f.find.matches(e, t)
        }
      }), m({
        parent: function(e) {
          var t = e.parentNode;
          return t && 11 !== t.nodeType ? t : null
        },
        parents: function(e) {
          return y(e, "parentNode")
        },
        next: function(e) {
          return C(e, "nextSibling", 1)
        },
        prev: function(e) {
          return C(e, "previousSibling", 1)
        },
        children: function(e) {
          return b(e.firstChild, "nextSibling", 1)
        },
        contents: function(e) {
          return r.toArray(("iframe" === e.nodeName ? e.contentDocument || e.contentWindow.document : e).childNodes)
        }
      }, function(e, t) {
        f.fn[e] = function(n) {
          var r = this,
            i = [];
          return r.each(function() {
            var e = t.call(i, this, n, i);
            e && (f.isArray(e) ? i.push.apply(i, e) : i.push(e))
          }), this.length > 1 && (T[e] || (i = f.unique(i)), 0 === e.indexOf("parents") && (i = i.reverse())), i = f(i), n ? i.filter(n) : i
        }
      }), m({
        parentsUntil: function(e, t) {
          return y(e, "parentNode", t)
        },
        nextUntil: function(e, t) {
          return b(e, "nextSibling", 1, t).slice(1)
        },
        prevUntil: function(e, t) {
          return b(e, "previousSibling", 1, t).slice(1)
        }
      }, function(e, t) {
        f.fn[e] = function(n, r) {
          var i = this,
            o = [];
          return i.each(function() {
            var e = t.call(o, this, n, o);
            e && (f.isArray(e) ? o.push.apply(o, e) : o.push(e))
          }), this.length > 1 && (o = f.unique(o), (0 === e.indexOf("parents") || "prevUntil" === e) && (o = o.reverse())), o = f(o), r ? o.filter(r) : o
        }
      }), f.fn.is = function(e) {
        return !!e && this.filter(e).length > 0
      }, f.fn.init.prototype = f.fn, f.overrideDefaults = function(e) {
        function t(r, i) {
          return n = n || e(), 0 === arguments.length && (r = n.element), i || (i = n.context), new t.fn.init(r, i)
        }
        var n;
        return f.extend(t, this), t
      }, i.ie && i.ie < 8 && (x(M, "get", {
        maxlength: function(e) {
          var t = e.maxLength;
          return 2147483647 === t ? k : t
        },
        size: function(e) {
          var t = e.size;
          return 20 === t ? k : t
        },
        "class": function(e) {
          return e.className
        },
        style: function(e) {
          var t = e.style.cssText;
          return 0 === t.length ? k : t
        }
      }), x(M, "set", {
        "class": function(e, t) {
          e.className = t
        },
        style: function(e, t) {
          e.style.cssText = t
        }
      })), i.ie && i.ie < 9 && (D["float"] = "styleFloat", x(L, "set", {
        opacity: function(e, t) {
          var n = e.style;
          null === t || "" === t ? n.removeAttribute("filter") : (n.zoom = 1, n.filter = "alpha(opacity=" + 100 * t + ")")
        }
      })), f.attrHooks = M, f.cssHooks = L, f
    }), r(v, [], function() {
      return function(e, t) {
        function n(e, t, n, r) {
          function i(e) {
            return e = parseInt(e, 10).toString(16), e.length > 1 ? e : "0" + e
          }
          return "#" + i(t) + i(n) + i(r)
        }
        var r = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi,
          i = /(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi,
          o = /\s*([^:]+):\s*([^;]+);?/g,
          a = /\s+$/,
          s, l, c = {},
          u, d, f, h = "\ufeff";
        for (e = e || {}, t && (d = t.getValidStyles(), f = t.getInvalidStyles()), u = ("\\\" \\' \\; \\: ; : " + h).split(" "), l = 0; l < u.length; l++) c[u[l]] = h + l, c[h + l] = u[l];
        return {
          toHex: function(e) {
            return e.replace(r, n)
          },
          parse: function(t) {
            function s(e, t, n) {
              var r, i, o, a;
              if (r = m[e + "-top" + t], r && (i = m[e + "-right" + t], i && (o = m[e + "-bottom" + t], o && (a = m[e + "-left" + t])))) {
                var s = [r, i, o, a];
                for (l = s.length - 1; l-- && s[l] === s[l + 1];);
                l > -1 && n || (m[e + t] = -1 == l ? s[0] : s.join(" "), delete m[e + "-top" + t], delete m[e + "-right" + t], delete m[e + "-bottom" + t], delete m[e + "-left" + t])
              }
            }

            function u(e) {
              var t = m[e],
                n;
              if (t) {
                for (t = t.split(" "), n = t.length; n--;)
                  if (t[n] !== t[0]) return !1;
                return m[e] = t[0], !0
              }
            }

            function d(e, t, n, r) {
              u(t) && u(n) && u(r) && (m[e] = m[t] + " " + m[n] + " " + m[r], delete m[t], delete m[n], delete m[r])
            }

            function f(e) {
              return b = !0, c[e]
            }

            function h(e, t) {
              return b && (e = e.replace(/\uFEFF[0-9]/g, function(e) {
                return c[e]
              })), t || (e = e.replace(/\\([\'\";:])/g, "$1")), e
            }

            function p(t, n, r, i, o, a) {
              if (o = o || a) return o = h(o), "'" + o.replace(/\'/g, "\\'") + "'";
              if (n = h(n || r || i), !e.allow_script_urls) {
                var s = n.replace(/[\s\r\n]+/, "");
                if (/(java|vb)script:/i.test(s)) return "";
                if (!e.allow_svg_data_urls && /^data:image\/svg/i.test(s)) return ""
              }
              return C && (n = C.call(x, n, "style")), "url('" + n.replace(/\'/g, "\\'") + "')"
            }
            var m = {},
              g, v, y, b, C = e.url_converter,
              x = e.url_converter_scope || this;
            if (t) {
              for (t = t.replace(/[\u0000-\u001F]/g, ""), t = t.replace(/\\[\"\';:\uFEFF]/g, f).replace(/\"[^\"]+\"|\'[^\']+\'/g, function(e) {
                  return e.replace(/[;:]/g, f)
                }); g = o.exec(t);) {
                if (v = g[1].replace(a, "").toLowerCase(), y = g[2].replace(a, ""), y = y.replace(/\\[0-9a-f]+/g, function(e) {
                    return String.fromCharCode(parseInt(e.substr(1), 16))
                  }), v && y.length > 0) {
                  if (!e.allow_script_urls && ("behavior" == v || /expression\s*\(|\/\*|\*\//.test(y))) continue;
                  "font-weight" === v && "700" === y ? y = "bold" : ("color" === v || "background-color" === v) && (y = y.toLowerCase()), y = y.replace(r, n), y = y.replace(i, p), m[v] = b ? h(y, !0) : y
                }
                o.lastIndex = g.index + g[0].length
              }
              s("border", "", !0), s("border", "-width"), s("border", "-color"), s("border", "-style"), s("padding", ""), s("margin", ""), d("border", "border-width", "border-style", "border-color"), "medium none" === m.border && delete m.border, "none" === m["border-image"] && delete m["border-image"]
            }
            return m
          },
          serialize: function(e, t) {
            function n(t) {
              var n, r, o, a;
              if (n = d[t])
                for (r = 0, o = n.length; o > r; r++) t = n[r], a = e[t], a !== s && a.length > 0 && (i += (i.length > 0 ? " " : "") + t + ": " + a + ";")
            }

            function r(e, t) {
              var n;
              return n = f["*"], n && n[e] ? !1 : (n = f[t], n && n[e] ? !1 : !0)
            }
            var i = "",
              o, a;
            if (t && d) n("*"), n(t);
            else
              for (o in e) a = e[o], a !== s && a.length > 0 && (!f || r(o, t)) && (i += (i.length > 0 ? " " : "") + o + ": " + a + ";");
            return i
          }
        }
      }
    }), r(y, [], function() {
      return function(e, t) {
        function n(e, n, r, i) {
          var o, a;
          if (e) {
            if (!i && e[n]) return e[n];
            if (e != t) {
              if (o = e[r]) return o;
              for (a = e.parentNode; a && a != t; a = a.parentNode)
                if (o = a[r]) return o
            }
          }
        }
        var r = e;
        this.current = function() {
          return r
        }, this.next = function(e) {
          return r = n(r, "firstChild", "nextSibling", e)
        }, this.prev = function(e) {
          return r = n(r, "lastChild", "previousSibling", e)
        }
      }
    }), r(b, [m], function(e) {
      function t(n) {
        function r() {
          return P.createDocumentFragment()
        }

        function i(e, t) {
          E(F, e, t)
        }

        function o(e, t) {
          E(z, e, t)
        }

        function a(e) {
          i(e.parentNode, j(e))
        }

        function s(e) {
          i(e.parentNode, j(e) + 1)
        }

        function l(e) {
          o(e.parentNode, j(e))
        }

        function c(e) {
          o(e.parentNode, j(e) + 1)
        }

        function u(e) {
          e ? (L[U] = L[V], L[$] = L[W]) : (L[V] = L[U], L[W] = L[$]), L.collapsed = F
        }

        function d(e) {
          a(e), c(e)
        }

        function f(e) {
          i(e, 0), o(e, 1 === e.nodeType ? e.childNodes.length : e.nodeValue.length)
        }

        function h(e, t) {
          var n = L[V],
            r = L[W],
            i = L[U],
            o = L[$],
            a = t.startContainer,
            s = t.startOffset,
            l = t.endContainer,
            c = t.endOffset;
          return 0 === e ? w(n, r, a, s) : 1 === e ? w(i, o, a, s) : 2 === e ? w(i, o, l, c) : 3 === e ? w(n, r, l, c) : void 0
        }

        function p() {
          N(I)
        }

        function m() {
          return N(H)
        }

        function g() {
          return N(O)
        }

        function v(e) {
          var t = this[V],
            r = this[W],
            i, o;
          3 !== t.nodeType && 4 !== t.nodeType || !t.nodeValue ? (t.childNodes.length > 0 && (o = t.childNodes[r]), o ? t.insertBefore(e, o) : 3 == t.nodeType ? n.insertAfter(e, t) : t.appendChild(e)) : r ? r >= t.nodeValue.length ? n.insertAfter(e, t) : (i = t.splitText(r), t.parentNode.insertBefore(e, i)) : t.parentNode.insertBefore(e, t)
        }

        function y(e) {
          var t = L.extractContents();
          L.insertNode(e), e.appendChild(t), L.selectNode(e)
        }

        function b() {
          return q(new t(n), {
            startContainer: L[V],
            startOffset: L[W],
            endContainer: L[U],
            endOffset: L[$],
            collapsed: L.collapsed,
            commonAncestorContainer: L.commonAncestorContainer
          })
        }

        function C(e, t) {
          var n;
          if (3 == e.nodeType) return e;
          if (0 > t) return e;
          for (n = e.firstChild; n && t > 0;) --t, n = n.nextSibling;
          return n ? n : e
        }

        function x() {
          return L[V] == L[U] && L[W] == L[$]
        }

        function w(e, t, r, i) {
          var o, a, s, l, c, u;
          if (e == r) return t == i ? 0 : i > t ? -1 : 1;
          for (o = r; o && o.parentNode != e;) o = o.parentNode;
          if (o) {
            for (a = 0, s = e.firstChild; s != o && t > a;) a++, s = s.nextSibling;
            return a >= t ? -1 : 1
          }
          for (o = e; o && o.parentNode != r;) o = o.parentNode;
          if (o) {
            for (a = 0, s = r.firstChild; s != o && i > a;) a++, s = s.nextSibling;
            return i > a ? -1 : 1
          }
          for (l = n.findCommonAncestor(e, r), c = e; c && c.parentNode != l;) c = c.parentNode;
          for (c || (c = l), u = r; u && u.parentNode != l;) u = u.parentNode;
          if (u || (u = l), c == u) return 0;
          for (s = l.firstChild; s;) {
            if (s == c) return -1;
            if (s == u) return 1;
            s = s.nextSibling
          }
        }

        function E(e, t, r) {
          var i, o;
          for (e ? (L[V] = t, L[W] = r) : (L[U] = t, L[$] = r), i = L[U]; i.parentNode;) i = i.parentNode;
          for (o = L[V]; o.parentNode;) o = o.parentNode;
          o == i ? w(L[V], L[W], L[U], L[$]) > 0 && L.collapse(e) : L.collapse(e), L.collapsed = x(), L.commonAncestorContainer = n.findCommonAncestor(L[V], L[U])
        }

        function N(e) {
          var t, n = 0,
            r = 0,
            i, o, a, s, l, c;
          if (L[V] == L[U]) return _(e);
          for (t = L[U], i = t.parentNode; i; t = i, i = i.parentNode) {
            if (i == L[V]) return S(t, e);
            ++n
          }
          for (t = L[V], i = t.parentNode; i; t = i, i = i.parentNode) {
            if (i == L[U]) return k(t, e);
            ++r
          }
          for (o = r - n, a = L[V]; o > 0;) a = a.parentNode, o--;
          for (s = L[U]; 0 > o;) s = s.parentNode, o++;
          for (l = a.parentNode, c = s.parentNode; l != c; l = l.parentNode, c = c.parentNode) a = l, s = c;
          return T(a, s, e)
        }

        function _(e) {
          var t, n, i, o, a, s, l, c, u;
          if (e != I && (t = r()), L[W] == L[$]) return t;
          if (3 == L[V].nodeType) {
            if (n = L[V].nodeValue, i = n.substring(L[W], L[$]), e != O && (o = L[V], c = L[W], u = L[$] - L[W], 0 === c && u >= o.nodeValue.length - 1 ? o.parentNode.removeChild(o) : o.deleteData(c, u), L.collapse(F)), e == I) return;
            return i.length > 0 && t.appendChild(P.createTextNode(i)), t
          }
          for (o = C(L[V], L[W]), a = L[$] - L[W]; o && a > 0;) s = o.nextSibling, l = D(o, e), t && t.appendChild(l), --a, o = s;
          return e != O && L.collapse(F), t
        }

        function S(e, t) {
          var n, i, o, a, s, l;
          if (t != I && (n = r()), i = R(e, t), n && n.appendChild(i), o = j(e), a = o - L[W], 0 >= a) return t != O && (L.setEndBefore(e), L.collapse(z)), n;
          for (i = e.previousSibling; a > 0;) s = i.previousSibling, l = D(i, t), n && n.insertBefore(l, n.firstChild), --a, i = s;
          return t != O && (L.setEndBefore(e), L.collapse(z)), n
        }

        function k(e, t) {
          var n, i, o, a, s, l;
          for (t != I && (n = r()), o = A(e, t), n && n.appendChild(o), i = j(e), ++i, a = L[$] - i, o = e.nextSibling; o && a > 0;) s = o.nextSibling, l = D(o, t), n && n.appendChild(l), --a, o = s;
          return t != O && (L.setStartAfter(e), L.collapse(F)), n
        }

        function T(e, t, n) {
          var i, o, a, s, l, c, u;
          for (n != I && (o = r()), i = A(e, n), o && o.appendChild(i), a = j(e), s = j(t), ++a, l = s - a, c = e.nextSibling; l > 0;) u = c.nextSibling, i = D(c, n), o && o.appendChild(i), c = u, --l;
          return i = R(t, n), o && o.appendChild(i), n != O && (L.setStartAfter(e), L.collapse(F)), o
        }

        function R(e, t) {
          var n = C(L[U], L[$] - 1),
            r, i, o, a, s, l = n != L[U];
          if (n == e) return B(n, l, z, t);
          for (r = n.parentNode, i = B(r, z, z, t); r;) {
            for (; n;) o = n.previousSibling, a = B(n, l, z, t), t != I && i.insertBefore(a, i.firstChild), l = F, n = o;
            if (r == e) return i;
            n = r.previousSibling, r = r.parentNode, s = B(r, z, z, t), t != I && s.appendChild(i), i = s
          }
        }

        function A(e, t) {
          var n = C(L[V], L[W]),
            r = n != L[V],
            i, o, a, s, l;
          if (n == e) return B(n, r, F, t);
          for (i = n.parentNode, o = B(i, z, F, t); i;) {
            for (; n;) a = n.nextSibling, s = B(n, r, F, t), t != I && o.appendChild(s), r = F, n = a;
            if (i == e) return o;
            n = i.nextSibling, i = i.parentNode, l = B(i, z, F, t), t != I && l.appendChild(o), o = l
          }
        }

        function B(e, t, r, i) {
          var o, a, s, l, c;
          if (t) return D(e, i);
          if (3 == e.nodeType) {
            if (o = e.nodeValue, r ? (l = L[W], a = o.substring(l), s = o.substring(0, l)) : (l = L[$], a = o.substring(0, l), s = o.substring(l)), i != O && (e.nodeValue = s), i == I) return;
            return c = n.clone(e, z), c.nodeValue = a, c
          }
          if (i != I) return n.clone(e, z)
        }

        function D(e, t) {
          return t != I ? t == O ? n.clone(e, F) : e : void e.parentNode.removeChild(e)
        }

        function M() {
          return n.create("body", null, g()).outerText
        }
        var L = this,
          P = n.doc,
          H = 0,
          O = 1,
          I = 2,
          F = !0,
          z = !1,
          W = "startOffset",
          V = "startContainer",
          U = "endContainer",
          $ = "endOffset",
          q = e.extend,
          j = n.nodeIndex;
        return q(L, {
          startContainer: P,
          startOffset: 0,
          endContainer: P,
          endOffset: 0,
          collapsed: F,
          commonAncestorContainer: P,
          START_TO_START: 0,
          START_TO_END: 1,
          END_TO_END: 2,
          END_TO_START: 3,
          setStart: i,
          setEnd: o,
          setStartBefore: a,
          setStartAfter: s,
          setEndBefore: l,
          setEndAfter: c,
          collapse: u,
          selectNode: d,
          selectNodeContents: f,
          compareBoundaryPoints: h,
          deleteContents: p,
          extractContents: m,
          cloneContents: g,
          insertNode: v,
          surroundContents: y,
          cloneRange: b,
          toStringIE: M
        }), L
      }
      return t.prototype.toString = function() {
        return this.toStringIE()
      }, t
    }), r(C, [m], function(e) {
      function t(e) {
        var t;
        return t = document.createElement("div"), t.innerHTML = e, t.textContent || t.innerText || e
      }

      function n(e, t) {
        var n, r, i, a = {};
        if (e) {
          for (e = e.split(","), t = t || 10, n = 0; n < e.length; n += 2) r = String.fromCharCode(parseInt(e[n], t)), o[r] || (i = "&" + e[n + 1] + ";", a[r] = i, a[i] = r);
          return a
        }
      }
      var r = e.makeMap,
        i, o, a, s = /[&<>\"\u0060\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
        l = /[<>&\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
        c = /[<>&\"\']/g,
        u = /&#([a-z0-9]+);?|&([a-z0-9]+);/gi,
        d = {
          128: "\u20ac",
          130: "\u201a",
          131: "\u0192",
          132: "\u201e",
          133: "\u2026",
          134: "\u2020",
          135: "\u2021",
          136: "\u02c6",
          137: "\u2030",
          138: "\u0160",
          139: "\u2039",
          140: "\u0152",
          142: "\u017d",
          145: "\u2018",
          146: "\u2019",
          147: "\u201c",
          148: "\u201d",
          149: "\u2022",
          150: "\u2013",
          151: "\u2014",
          152: "\u02dc",
          153: "\u2122",
          154: "\u0161",
          155: "\u203a",
          156: "\u0153",
          158: "\u017e",
          159: "\u0178"
        };
      o = {
        '"': "&quot;",
        "'": "&#39;",
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "`": "&#96;"
      }, a = {
        "&lt;": "<",
        "&gt;": ">",
        "&amp;": "&",
        "&quot;": '"',
        "&apos;": "'"
      }, i = n("50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,t9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro", 32);
      var f = {
        encodeRaw: function(e, t) {
          return e.replace(t ? s : l, function(e) {
            return o[e] || e
          })
        },
        encodeAllRaw: function(e) {
          return ("" + e).replace(c, function(e) {
            return o[e] || e
          })
        },
        encodeNumeric: function(e, t) {
          return e.replace(t ? s : l, function(e) {
            return e.length > 1 ? "&#" + (1024 * (e.charCodeAt(0) - 55296) + (e.charCodeAt(1) - 56320) + 65536) + ";" : o[e] || "&#" + e.charCodeAt(0) + ";"
          })
        },
        encodeNamed: function(e, t, n) {
          return n = n || i, e.replace(t ? s : l, function(e) {
            return o[e] || n[e] || e
          })
        },
        getEncodeFunc: function(e, t) {
          function a(e, n) {
            return e.replace(n ? s : l, function(e) {
              return o[e] || t[e] || "&#" + e.charCodeAt(0) + ";" || e
            })
          }

          function c(e, n) {
            return f.encodeNamed(e, n, t)
          }
          return t = n(t) || i, e = r(e.replace(/\+/g, ",")), e.named && e.numeric ? a : e.named ? t ? c : f.encodeNamed : e.numeric ? f.encodeNumeric : f.encodeRaw
        },
        decode: function(e) {
          return e.replace(u, function(e, n) {
            return n ? (n = "x" === n.charAt(0).toLowerCase() ? parseInt(n.substr(1), 16) : parseInt(n, 10), n > 65535 ? (n -= 65536, String.fromCharCode(55296 + (n >> 10), 56320 + (1023 & n))) : d[n] || String.fromCharCode(n)) : a[e] || i[e] || t(e)
          })
        }
      };
      return f
    }), r(x, [m, u], function(e, t) {
      return function(n, r) {
        function i(e) {
          n.getElementsByTagName("head")[0].appendChild(e)
        }

        function o(r, o, c) {
          function u() {
            for (var e = b.passed, t = e.length; t--;) e[t]();
            b.status = 2, b.passed = [], b.failed = []
          }

          function d() {
            for (var e = b.failed, t = e.length; t--;) e[t]();
            b.status = 3, b.passed = [], b.failed = []
          }

          function f() {
            var e = navigator.userAgent.match(/WebKit\/(\d*)/);
            return !!(e && e[1] < 536)
          }

          function h(e, n) {
            e() || ((new Date).getTime() - y < l ? t.setTimeout(n) : d())
          }

          function p() {
            h(function() {
              for (var e = n.styleSheets, t, r = e.length, i; r--;)
                if (t = e[r], i = t.ownerNode ? t.ownerNode : t.owningElement, i && i.id === g.id) return u(), !0
            }, p)
          }

          function m() {
            h(function() {
              try {
                var e = v.sheet.cssRules;
                return u(), !!e
              } catch (t) {}
            }, m)
          }
          var g, v, y, b;
          if (r = e._addCacheSuffix(r), s[r] ? b = s[r] : (b = {
              passed: [],
              failed: []
            }, s[r] = b), o && b.passed.push(o), c && b.failed.push(c), 1 != b.status) {
            if (2 == b.status) return void u();
            if (3 == b.status) return void d();
            if (b.status = 1, g = n.createElement("link"), g.rel = "stylesheet", g.type = "text/css", g.id = "u" + a++, g.async = !1, g.defer = !1, y = (new Date).getTime(), "onload" in g && !f()) g.onload = p, g.onerror = d;
            else {
              if (navigator.userAgent.indexOf("Firefox") > 0) return v = n.createElement("style"), v.textContent = '@import "' + r + '"', m(), void i(v);
              p()
            }
            i(g), g.href = r
          }
        }
        var a = 0,
          s = {},
          l;
        r = r || {}, l = r.maxLoadTime || 5e3, this.load = o
      }
    }), r(w, [f, g, v, d, y, b, C, h, m, x], function(e, n, r, i, o, a, s, l, c, u) {
      function d(e, t) {
        var n = {},
          r = t.keep_values,
          i;
        return i = {
          set: function(n, r, i) {
            t.url_converter && (r = t.url_converter.call(t.url_converter_scope || e, r, i, n[0])), n.attr("data-mce-" + i, r).attr(i, r)
          },
          get: function(e, t) {
            return e.attr("data-mce-" + t) || e.attr(t)
          }
        }, n = {
          style: {
            set: function(e, t) {
              return null !== t && "object" == typeof t ? void e.css(t) : (r && e.attr("data-mce-style", t), void e.attr("style", t))
            },
            get: function(t) {
              var n = t.attr("data-mce-style") || t.attr("style");
              return n = e.serializeStyle(e.parseStyle(n), t[0].nodeName)
            }
          }
        }, r && (n.href = n.src = i), n
      }

      function f(e, t) {
        var n = t.attr("style");
        n = e.serializeStyle(e.parseStyle(n), t[0].nodeName), n || (n = null), t.attr("data-mce-style", n)
      }

      function h(e, t) {
        var n = 0,
          r, i;
        if (e)
          for (r = e.nodeType, e = e.previousSibling; e; e = e.previousSibling) i = e.nodeType, (!t || 3 != i || i != r && e.nodeValue.length) && (n++, r = i);
        return n
      }

      function p(e, t) {
        var o = this,
          a;
        o.doc = e, o.win = window, o.files = {}, o.counter = 0, o.stdMode = !b || e.documentMode >= 8, o.boxModel = !b || "CSS1Compat" == e.compatMode || o.stdMode, o.styleSheetLoader = new u(e), o.boundEvents = [], o.settings = t = t || {}, o.schema = t.schema, o.styles = new r({
          url_converter: t.url_converter,
          url_converter_scope: t.url_converter_scope
        }, t.schema), o.fixDoc(e), o.events = t.ownEvents ? new i(t.proxy) : i.Event, o.attrHooks = d(o, t), a = t.schema ? t.schema.getBlockElements() : {}, o.$ = n.overrideDefaults(function() {
          return {
            context: e,
            element: o.getRoot()
          }
        }), o.isBlock = function(e) {
          if (!e) return !1;
          var t = e.nodeType;
          return t ? !(1 !== t || !a[e.nodeName]) : !!a[e]
        }
      }
      var m = c.each,
        g = c.is,
        v = c.grep,
        y = c.trim,
        b = l.ie,
        C = /^([a-z0-9],?)+$/i,
        x = /^[ \t\r\n]*$/;
      return p.prototype = {
        $$: function(e) {
          return "string" == typeof e && (e = this.get(e)), this.$(e)
        },
        root: null,
        fixDoc: function(e) {
          var t = this.settings,
            n;
          if (b && t.schema) {
            "abbr article aside audio canvas details figcaption figure footer header hgroup mark menu meter nav output progress section summary time video".replace(/\w+/g, function(t) {
              e.createElement(t)
            });
            for (n in t.schema.getCustomElements()) e.createElement(n)
          }
        },
        clone: function(e, t) {
          var n = this,
            r, i;
          return !b || 1 !== e.nodeType || t ? e.cloneNode(t) : (i = n.doc, t ? r.firstChild : (r = i.createElement(e.nodeName), m(n.getAttribs(e), function(t) {
            n.setAttrib(r, t.nodeName, n.getAttrib(e, t.nodeName))
          }), r))
        },
        getRoot: function() {
          var e = this;
          return e.settings.root_element || e.doc.body
        },
        getViewPort: function(e) {
          var t, n;
          return e = e ? e : this.win, t = e.document, n = this.boxModel ? t.documentElement : t.body, {
            x: e.pageXOffset || n.scrollLeft,
            y: e.pageYOffset || n.scrollTop,
            w: e.innerWidth || n.clientWidth,
            h: e.innerHeight || n.clientHeight
          }
        },
        getRect: function(e) {
          var t = this,
            n, r;
          return e = t.get(e), n = t.getPos(e), r = t.getSize(e), {
            x: n.x,
            y: n.y,
            w: r.w,
            h: r.h
          }
        },
        getSize: function(e) {
          var t = this,
            n, r;
          return e = t.get(e), n = t.getStyle(e, "width"), r = t.getStyle(e, "height"), -1 === n.indexOf("px") && (n = 0), -1 === r.indexOf("px") && (r = 0), {
            w: parseInt(n, 10) || e.offsetWidth || e.clientWidth,
            h: parseInt(r, 10) || e.offsetHeight || e.clientHeight
          }
        },
        getParent: function(e, t, n) {
          return this.getParents(e, t, n, !1)
        },
        getParents: function(e, n, r, i) {
          var o = this,
            a, s = [];
          for (e = o.get(e), i = i === t, r = r || ("BODY" != o.getRoot().nodeName ? o.getRoot().parentNode : null), g(n, "string") && (a = n, n = "*" === n ? function(e) {
              return 1 == e.nodeType
            } : function(e) {
              return o.is(e, a)
            }); e && e != r && e.nodeType && 9 !== e.nodeType;) {
            if (!n || n(e)) {
              if (!i) return e;
              s.push(e)
            }
            e = e.parentNode
          }
          return i ? s : null
        },
        get: function(e) {
          var t;
          return e && this.doc && "string" == typeof e && (t = e, e = this.doc.getElementById(e), e && e.id !== t) ? this.doc.getElementsByName(t)[1] : e
        },
        getNext: function(e, t) {
          return this._findSib(e, t, "nextSibling")
        },
        getPrev: function(e, t) {
          return this._findSib(e, t, "previousSibling")
        },
        select: function(t, n) {
          var r = this;
          return e(t, r.get(n) || r.settings.root_element || r.doc, [])
        },
        is: function(n, r) {
          var i;
          if (n.length === t) {
            if ("*" === r) return 1 == n.nodeType;
            if (C.test(r)) {
              for (r = r.toLowerCase().split(/,/), n = n.nodeName.toLowerCase(), i = r.length - 1; i >= 0; i--)
                if (r[i] == n) return !0;
              return !1
            }
          }
          if (n.nodeType && 1 != n.nodeType) return !1;
          var o = n.nodeType ? [n] : n;
          return e(r, o[0].ownerDocument || o[0], null, o).length > 0;
        },
        add: function(e, t, n, r, i) {
          var o = this;
          return this.run(e, function(e) {
            var a;
            return a = g(t, "string") ? o.doc.createElement(t) : t, o.setAttribs(a, n), r && (r.nodeType ? a.appendChild(r) : o.setHTML(a, r)), i ? a : e.appendChild(a)
          })
        },
        create: function(e, t, n) {
          return this.add(this.doc.createElement(e), e, t, n, 1)
        },
        createHTML: function(e, t, n) {
          var r = "",
            i;
          r += "<" + e;
          for (i in t) t.hasOwnProperty(i) && null !== t[i] && "undefined" != typeof t[i] && (r += " " + i + '="' + this.encode(t[i]) + '"');
          return "undefined" != typeof n ? r + ">" + n + "</" + e + ">" : r + " />"
        },
        createFragment: function(e) {
          var t, n, r = this.doc,
            i;
          for (i = r.createElement("div"), t = r.createDocumentFragment(), e && (i.innerHTML = e); n = i.firstChild;) t.appendChild(n);
          return t
        },
        remove: function(e, t) {
          return e = this.$$(e), t ? e.each(function() {
            for (var e; e = this.firstChild;) 3 == e.nodeType && 0 === e.data.length ? this.removeChild(e) : this.parentNode.insertBefore(e, this)
          }).remove() : e.remove(), e.length > 1 ? e.toArray() : e[0]
        },
        setStyle: function(e, t, n) {
          e = this.$$(e).css(t, n), this.settings.update_styles && f(this, e)
        },
        getStyle: function(e, n, r) {
          return e = this.$$(e), r ? e.css(n) : (n = n.replace(/-(\D)/g, function(e, t) {
            return t.toUpperCase()
          }), "float" == n && (n = l.ie && l.ie < 12 ? "styleFloat" : "cssFloat"), e[0] && e[0].style ? e[0].style[n] : t)
        },
        setStyles: function(e, t) {
          e = this.$$(e).css(t), this.settings.update_styles && f(this, e)
        },
        removeAllAttribs: function(e) {
          return this.run(e, function(e) {
            var t, n = e.attributes;
            for (t = n.length - 1; t >= 0; t--) e.removeAttributeNode(n.item(t))
          })
        },
        setAttrib: function(e, t, n) {
          var r = this,
            i, o, a = r.settings;
          "" === n && (n = null), e = r.$$(e), i = e.attr(t), e.length && (o = r.attrHooks[t], o && o.set ? o.set(e, n, t) : e.attr(t, n), i != n && a.onSetAttrib && a.onSetAttrib({
            attrElm: e,
            attrName: t,
            attrValue: n
          }))
        },
        setAttribs: function(e, t) {
          var n = this;
          n.$$(e).each(function(e, r) {
            m(t, function(e, t) {
              n.setAttrib(r, t, e)
            })
          })
        },
        getAttrib: function(e, t, n) {
          var r = this,
            i, o;
          return e = r.$$(e), e.length && (i = r.attrHooks[t], o = i && i.get ? i.get(e, t) : e.attr(t)), "undefined" == typeof o && (o = n || ""), o
        },
        getPos: function(e, t) {
          var r = this,
            i = 0,
            o = 0,
            a, s = r.doc,
            l = s.body,
            c;
          if (e = r.get(e), t = t || l, e) {
            if (t === l && e.getBoundingClientRect && "static" === n(l).css("position")) return c = e.getBoundingClientRect(), t = r.boxModel ? s.documentElement : l, i = c.left + (s.documentElement.scrollLeft || l.scrollLeft) - t.clientLeft, o = c.top + (s.documentElement.scrollTop || l.scrollTop) - t.clientTop, {
              x: i,
              y: o
            };
            for (a = e; a && a != t && a.nodeType;) i += a.offsetLeft || 0, o += a.offsetTop || 0, a = a.offsetParent;
            for (a = e.parentNode; a && a != t && a.nodeType;) i -= a.scrollLeft || 0, o -= a.scrollTop || 0, a = a.parentNode
          }
          return {
            x: i,
            y: o
          }
        },
        parseStyle: function(e) {
          return this.styles.parse(e)
        },
        serializeStyle: function(e, t) {
          return this.styles.serialize(e, t)
        },
        addStyle: function(e) {
          var t = this,
            n = t.doc,
            r, i;
          if (t !== p.DOM && n === document) {
            var o = p.DOM.addedStyles;
            if (o = o || [], o[e]) return;
            o[e] = !0, p.DOM.addedStyles = o
          }
          i = n.getElementById("mceDefaultStyles"), i || (i = n.createElement("style"), i.id = "mceDefaultStyles", i.type = "text/css", r = n.getElementsByTagName("head")[0], r.firstChild ? r.insertBefore(i, r.firstChild) : r.appendChild(i)), i.styleSheet ? i.styleSheet.cssText += e : i.appendChild(n.createTextNode(e))
        },
        loadCSS: function(e) {
          var t = this,
            n = t.doc,
            r;
          return t !== p.DOM && n === document ? void p.DOM.loadCSS(e) : (e || (e = ""), r = n.getElementsByTagName("head")[0], void m(e.split(","), function(e) {
            var i;
            e = c._addCacheSuffix(e), t.files[e] || (t.files[e] = !0, i = t.create("link", {
              rel: "stylesheet",
              href: e
            }), b && n.documentMode && n.recalc && (i.onload = function() {
              n.recalc && n.recalc(), i.onload = null
            }), r.appendChild(i))
          }))
        },
        addClass: function(e, t) {
          this.$$(e).addClass(t)
        },
        removeClass: function(e, t) {
          this.toggleClass(e, t, !1)
        },
        hasClass: function(e, t) {
          return this.$$(e).hasClass(t)
        },
        toggleClass: function(e, t, r) {
          this.$$(e).toggleClass(t, r).each(function() {
            "" === this.className && n(this).attr("class", null)
          })
        },
        show: function(e) {
          this.$$(e).show()
        },
        hide: function(e) {
          this.$$(e).hide()
        },
        isHidden: function(e) {
          return "none" == this.$$(e).css("display")
        },
        uniqueId: function(e) {
          return (e ? e : "mce_") + this.counter++
        },
        setHTML: function(e, t) {
          e = this.$$(e), b ? e.each(function(e, r) {
            if (r.canHaveHTML !== !1) {
              for (; r.firstChild;) r.removeChild(r.firstChild);
              try {
                r.innerHTML = "<br>" + t, r.removeChild(r.firstChild)
              } catch (i) {
                n("<div>").html("<br>" + t).contents().slice(1).appendTo(r)
              }
              return t
            }
          }) : e.html(t)
        },
        getOuterHTML: function(e) {
          return e = this.get(e), 1 == e.nodeType && "outerHTML" in e ? e.outerHTML : n("<div>").append(n(e).clone()).html()
        },
        setOuterHTML: function(e, t) {
          var r = this;
          r.$$(e).each(function() {
            try {
              if ("outerHTML" in this) return void(this.outerHTML = t)
            } catch (e) {}
            r.remove(n(this).html(t), !0)
          })
        },
        decode: s.decode,
        encode: s.encodeAllRaw,
        insertAfter: function(e, t) {
          return t = this.get(t), this.run(e, function(e) {
            var n, r;
            return n = t.parentNode, r = t.nextSibling, r ? n.insertBefore(e, r) : n.appendChild(e), e
          })
        },
        replace: function(e, t, n) {
          var r = this;
          return r.run(t, function(t) {
            return g(t, "array") && (e = e.cloneNode(!0)), n && m(v(t.childNodes), function(t) {
              e.appendChild(t)
            }), t.parentNode.replaceChild(e, t)
          })
        },
        rename: function(e, t) {
          var n = this,
            r;
          return e.nodeName != t.toUpperCase() && (r = n.create(t), m(n.getAttribs(e), function(t) {
            n.setAttrib(r, t.nodeName, n.getAttrib(e, t.nodeName))
          }), n.replace(r, e, 1)), r || e
        },
        findCommonAncestor: function(e, t) {
          for (var n = e, r; n;) {
            for (r = t; r && n != r;) r = r.parentNode;
            if (n == r) break;
            n = n.parentNode
          }
          return !n && e.ownerDocument ? e.ownerDocument.documentElement : n
        },
        toHex: function(e) {
          return this.styles.toHex(c.trim(e))
        },
        run: function(e, t, n) {
          var r = this,
            i;
          return "string" == typeof e && (e = r.get(e)), e ? (n = n || this, e.nodeType || !e.length && 0 !== e.length ? t.call(n, e) : (i = [], m(e, function(e, o) {
            e && ("string" == typeof e && (e = r.get(e)), i.push(t.call(n, e, o)))
          }), i)) : !1
        },
        getAttribs: function(e) {
          var t;
          if (e = this.get(e), !e) return [];
          if (b) {
            if (t = [], "OBJECT" == e.nodeName) return e.attributes;
            "OPTION" === e.nodeName && this.getAttrib(e, "selected") && t.push({
              specified: 1,
              nodeName: "selected"
            });
            var n = /<\/?[\w:\-]+ ?|=[\"][^\"]+\"|=\'[^\']+\'|=[\w\-]+|>/gi;
            return e.cloneNode(!1).outerHTML.replace(n, "").replace(/[\w:\-]+/gi, function(e) {
              t.push({
                specified: 1,
                nodeName: e
              })
            }), t
          }
          return e.attributes
        },
        isEmpty: function(e, t) {
          var n = this,
            r, i, a, s, l, c = 0;
          if (e = e.firstChild) {
            s = new o(e, e.parentNode), t = t || (n.schema ? n.schema.getNonEmptyElements() : null);
            do {
              if (a = e.nodeType, 1 === a) {
                if (e.getAttribute("data-mce-bogus")) continue;
                if (l = e.nodeName.toLowerCase(), t && t[l]) {
                  if ("br" === l) {
                    c++;
                    continue
                  }
                  return !1
                }
                for (i = n.getAttribs(e), r = i.length; r--;)
                  if (l = i[r].nodeName, "name" === l || "data-mce-bookmark" === l) return !1
              }
              if (8 == a) return !1;
              if (3 === a && !x.test(e.nodeValue)) return !1
            } while (e = s.next())
          }
          return 1 >= c
        },
        createRng: function() {
          var e = this.doc;
          return e.createRange ? e.createRange() : new a(this)
        },
        nodeIndex: h,
        split: function(e, t, n) {
          function r(e) {
            function t(e) {
              var t = e.previousSibling && "SPAN" == e.previousSibling.nodeName,
                n = e.nextSibling && "SPAN" == e.nextSibling.nodeName;
              return t && n
            }
            var n, o = e.childNodes,
              a = e.nodeType;
            if (1 != a || "bookmark" != e.getAttribute("data-mce-type")) {
              for (n = o.length - 1; n >= 0; n--) r(o[n]);
              if (9 != a) {
                if (3 == a && e.nodeValue.length > 0) {
                  var s = y(e.nodeValue).length;
                  if (!i.isBlock(e.parentNode) || s > 0 || 0 === s && t(e)) return
                } else if (1 == a && (o = e.childNodes, 1 == o.length && o[0] && 1 == o[0].nodeType && "bookmark" == o[0].getAttribute("data-mce-type") && e.parentNode.insertBefore(o[0], e), o.length || /^(br|hr|input|img)$/i.test(e.nodeName))) return;
                i.remove(e)
              }
              return e
            }
          }
          var i = this,
            o = i.createRng(),
            a, s, l;
          return e && t ? (o.setStart(e.parentNode, i.nodeIndex(e)), o.setEnd(t.parentNode, i.nodeIndex(t)), a = o.extractContents(), o = i.createRng(), o.setStart(t.parentNode, i.nodeIndex(t) + 1), o.setEnd(e.parentNode, i.nodeIndex(e) + 1), s = o.extractContents(), l = e.parentNode, l.insertBefore(r(a), e), n ? l.insertBefore(n, e) : l.insertBefore(t, e), l.insertBefore(r(s), e), i.remove(e), n || t) : void 0
        },
        bind: function(e, t, n, r) {
          var i = this;
          if (c.isArray(e)) {
            for (var o = e.length; o--;) e[o] = i.bind(e[o], t, n, r);
            return e
          }
          return !i.settings.collect || e !== i.doc && e !== i.win || i.boundEvents.push([e, t, n, r]), i.events.bind(e, t, n, r || i)
        },
        unbind: function(e, t, n) {
          var r = this,
            i;
          if (c.isArray(e)) {
            for (i = e.length; i--;) e[i] = r.unbind(e[i], t, n);
            return e
          }
          if (r.boundEvents && (e === r.doc || e === r.win))
            for (i = r.boundEvents.length; i--;) {
              var o = r.boundEvents[i];
              e != o[0] || t && t != o[1] || n && n != o[2] || this.events.unbind(o[0], o[1], o[2])
            }
          return this.events.unbind(e, t, n)
        },
        fire: function(e, t, n) {
          return this.events.fire(e, t, n)
        },
        getContentEditable: function(e) {
          var t;
          return e && 1 == e.nodeType ? (t = e.getAttribute("data-mce-contenteditable"), t && "inherit" !== t ? t : "inherit" !== e.contentEditable ? e.contentEditable : null) : null
        },
        getContentEditableParent: function(e) {
          for (var t = this.getRoot(), n = null; e && e !== t && (n = this.getContentEditable(e), null === n); e = e.parentNode);
          return n
        },
        destroy: function() {
          var t = this;
          if (t.boundEvents) {
            for (var n = t.boundEvents.length; n--;) {
              var r = t.boundEvents[n];
              this.events.unbind(r[0], r[1], r[2])
            }
            t.boundEvents = null
          }
          e.setDocument && e.setDocument(), t.win = t.doc = t.root = t.events = t.frag = null
        },
        isChildOf: function(e, t) {
          for (; e;) {
            if (t === e) return !0;
            e = e.parentNode
          }
          return !1
        },
        dumpRng: function(e) {
          return "startContainer: " + e.startContainer.nodeName + ", startOffset: " + e.startOffset + ", endContainer: " + e.endContainer.nodeName + ", endOffset: " + e.endOffset
        },
        _findSib: function(e, t, n) {
          var r = this,
            i = t;
          if (e)
            for ("string" == typeof i && (i = function(e) {
                return r.is(e, t)
              }), e = e[n]; e; e = e[n])
              if (i(e)) return e;
          return null
        }
      }, p.DOM = new p(document), p.nodeIndex = h, p
    }), r(E, [w, m], function(e, t) {
      function n() {
        function e(e, n) {
          function i() {
            a.remove(l), s && (s.onreadystatechange = s.onload = s = null), n()
          }

          function o() {
            "undefined" != typeof console && console.log && console.log("Failed to load: " + e)
          }
          var a = r,
            s, l;
          l = a.uniqueId(), s = document.createElement("script"), s.id = l, s.type = "text/javascript", s.src = t._addCacheSuffix(e), "onreadystatechange" in s ? s.onreadystatechange = function() {
            /loaded|complete/.test(s.readyState) && i()
          } : s.onload = i, s.onerror = o, (document.getElementsByTagName("head")[0] || document.body).appendChild(s)
        }
        var n = 0,
          a = 1,
          s = 2,
          l = {},
          c = [],
          u = {},
          d = [],
          f = 0,
          h;
        this.isDone = function(e) {
          return l[e] == s
        }, this.markDone = function(e) {
          l[e] = s
        }, this.add = this.load = function(e, t, r) {
          var i = l[e];
          i == h && (c.push(e), l[e] = n), t && (u[e] || (u[e] = []), u[e].push({
            func: t,
            scope: r || this
          }))
        }, this.loadQueue = function(e, t) {
          this.loadScripts(c, e, t)
        }, this.loadScripts = function(t, n, r) {
          function c(e) {
            i(u[e], function(e) {
              e.func.call(e.scope)
            }), u[e] = h
          }
          var p;
          d.push({
            func: n,
            scope: r || this
          }), (p = function() {
            var n = o(t);
            t.length = 0, i(n, function(t) {
              return l[t] == s ? void c(t) : void(l[t] != a && (l[t] = a, f++, e(t, function() {
                l[t] = s, f--, c(t), p()
              })))
            }), f || (i(d, function(e) {
              e.func.call(e.scope)
            }), d.length = 0)
          })()
        }
      }
      var r = e.DOM,
        i = t.each,
        o = t.grep;
      return n.ScriptLoader = new n, n
    }), r(N, [E, m], function(e, n) {
      function r() {
        var e = this;
        e.items = [], e.urls = {}, e.lookup = {}
      }
      var i = n.each;
      return r.prototype = {
        get: function(e) {
          return this.lookup[e] ? this.lookup[e].instance : t
        },
        dependencies: function(e) {
          var t;
          return this.lookup[e] && (t = this.lookup[e].dependencies), t || []
        },
        requireLangPack: function(t, n) {
          var i = r.language;
          if (i && r.languageLoad !== !1) {
            if (n)
              if (n = "," + n + ",", -1 != n.indexOf("," + i.substr(0, 2) + ",")) i = i.substr(0, 2);
              else if (-1 == n.indexOf("," + i + ",")) return;
            e.ScriptLoader.add(this.urls[t] + "/langs/" + i + ".js")
          }
        },
        add: function(e, t, n) {
          return this.items.push(t), this.lookup[e] = {
            instance: t,
            dependencies: n
          }, t
        },
        createUrl: function(e, t) {
          return "object" == typeof t ? t : {
            prefix: e.prefix,
            resource: t,
            suffix: e.suffix
          }
        },
        addComponents: function(t, n) {
          var r = this.urls[t];
          i(n, function(t) {
            e.ScriptLoader.add(r + "/" + t)
          })
        },
        load: function(n, o, a, s) {
          function l() {
            var r = c.dependencies(n);
            i(r, function(e) {
              var n = c.createUrl(o, e);
              c.load(n.resource, n, t, t)
            }), a && (s ? a.call(s) : a.call(e))
          }
          var c = this,
            u = o;
          c.urls[n] || ("object" == typeof o && (u = o.prefix + o.resource + o.suffix), 0 !== u.indexOf("/") && -1 == u.indexOf("://") && (u = r.baseURL + "/" + u), c.urls[n] = u.substring(0, u.lastIndexOf("/")), c.lookup[n] ? l() : e.ScriptLoader.add(u, l, s))
        }
      }, r.PluginManager = new r, r.ThemeManager = new r, r
    }), r(_, [], function() {
      function e(e) {
        return function(t) {
          return !!t && t.nodeType == e
        }
      }

      function t(e) {
        return e = e.toLowerCase().split(" "),
          function(t) {
            var n, r;
            if (t && t.nodeType)
              for (r = t.nodeName.toLowerCase(), n = 0; n < e.length; n++)
                if (r === e[n]) return !0;
            return !1
          }
      }

      function n(e, t) {
        return t = t.toLowerCase().split(" "),
          function(n) {
            var r, i;
            if (s(n))
              for (r = 0; r < t.length; r++)
                if (i = getComputedStyle(n, null).getPropertyValue(e), i === t[r]) return !0;
            return !1
          }
      }

      function r(e, t) {
        return function(n) {
          return s(n) && n[e] === t
        }
      }

      function i(e, t) {
        return function(n) {
          return s(n) && n.getAttribute(e) === t
        }
      }

      function o(e) {
        return s(e) && e.hasAttribute("data-mce-bogus")
      }

      function a(e) {
        return function(t) {
          if (s(t)) {
            if (t.contentEditable === e) return !0;
            if (t.getAttribute("data-mce-contenteditable") === e) return !0
          }
          return !1
        }
      }
      var s = e(1);
      return {
        isText: e(3),
        isElement: s,
        isComment: e(8),
        isBr: t("br"),
        isContentEditableTrue: a("true"),
        isContentEditableFalse: a("false"),
        matchNodeNames: t,
        hasPropValue: r,
        hasAttributeValue: i,
        matchStyleValues: n,
        isBogus: o
      }
    }), r(S, [], function() {
      function e(e) {
        return e == n
      }

      function t(e) {
        return e.replace(new RegExp(n, "g"), "")
      }
      var n = "\u200b";
      return {
        isZwsp: e,
        ZWSP: n,
        trim: t
      }
    }), r(k, [_, S], function(e, t) {
      function n(e) {
        return d(e) && (e = e.parentNode), u(e) && e.hasAttribute("data-mce-caret")
      }

      function r(e) {
        return d(e) && t.isZwsp(e.data)
      }

      function i(e) {
        return n(e) || r(e)
      }

      function o(e, n) {
        var r, o, a, s;
        if (r = e.ownerDocument, a = r.createTextNode(t.ZWSP), s = e.parentNode, n) {
          if (o = e.previousSibling, d(o)) {
            if (i(o)) return o;
            if (c(o)) return o.splitText(o.data.length - 1)
          }
          s.insertBefore(a, e)
        } else {
          if (o = e.nextSibling, d(o)) {
            if (i(o)) return o;
            if (l(o)) return o.splitText(1), o
          }
          e.nextSibling ? s.insertBefore(a, e.nextSibling) : s.appendChild(a)
        }
        return a
      }

      function a(e, t, n) {
        var r, i, o;
        return r = t.ownerDocument, i = r.createElement(e), i.setAttribute("data-mce-caret", n ? "before" : "after"), i.setAttribute("data-mce-bogus", "all"), i.appendChild(r.createTextNode("\xa0")), o = t.parentNode, n ? o.insertBefore(i, t) : t.nextSibling ? o.insertBefore(i, t.nextSibling) : o.appendChild(i), i
      }

      function s(e) {
        var n;
        u(e) && i(e) && ("&nbsp;" != e.innerHTML ? e.removeAttribute("data-mce-caret") : e.parentNode && e.parentNode.removeChild(e)), d(e) && (n = t.trim(e.data), 0 === n.length && e.parentNode && e.parentNode.removeChild(e), e.nodeValue = n)
      }

      function l(e) {
        return d(e) && e.data[0] == t.ZWSP
      }

      function c(e) {
        return d(e) && e.data[e.data.length - 1] == t.ZWSP
      }
      var u = e.isElement,
        d = e.isText;
      return {
        isCaretContainer: i,
        isCaretContainerBlock: n,
        isCaretContainerInline: r,
        insertInline: o,
        insertBlock: a,
        remove: s,
        startsWithCaretContainer: l,
        endsWithCaretContainer: c
      }
    }), r(T, [m, y, _, k], function(e, t, n, r) {
        function i(e, t) {
          var n = e.childNodes;
          return t--, t > n.length - 1 ? t = n.length - 1 : 0 > t && (t = 0), n[t] || e
        }

        function o(e) {
          this.walk = function(t, n) {
              function r(e) {
                var t;
                return t = e[0], 3 === t.nodeType && t === c && u >= t.nodeValue.length && e.splice(0, 1), t = e[e.length - 1], 0 === f && e.length > 0 && t === d && 3 === t.nodeType && e.splice(e.length - 1, 1), e
              }

              function o(e, t, n) {
                for (var r = []; e && e != n; e = e[t]) r.push(e);
                return r
              }

              function a(e, t) {
                do {
                  if (e.parentNode == t) return e;
                  e = e.parentNode
                } while (e)
              }

              function l(e, t, i) {
                var a = i ? "nextSibling" : "previousSibling";
                for (g