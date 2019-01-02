/*! RESOURCE: /scripts/js_includes_sp_tinymce.js */
/*! RESOURCE: /scripts/tinymce4_4_3/tinymce.min.js */
// 4.4.3 (2016-09-01)
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
    d = "tinymce/Env",
    f = "tinymce/dom/EventUtils",
    h = "tinymce/dom/Sizzle",
    p = "tinymce/util/Arr",
    m = "tinymce/util/Tools",
    g = "tinymce/dom/DomQuery",
    v = "tinymce/html/Styles",
    y = "tinymce/dom/TreeWalker",
    b = "tinymce/dom/Range",
    C = "tinymce/html/Entities",
    x = "tinymce/dom/StyleSheetLoader",
    w = "tinymce/dom/DOMUtils",
    N = "tinymce/dom/ScriptLoader",
    E = "tinymce/AddOnManager",
    _ = "tinymce/dom/NodeType",
    S = "tinymce/text/Zwsp",
    k = "tinymce/caret/CaretContainer",
    T = "tinymce/dom/RangeUtils",
    R = "tinymce/NodeChange",
    A = "tinymce/html/Node",
    B = "tinymce/html/Schema",
    D = "tinymce/html/SaxParser",
    L = "tinymce/html/DomParser",
    M = "tinymce/html/Writer",
    P = "tinymce/html/Serializer",
    O = "tinymce/dom/Serializer",
    H = "tinymce/dom/TridentSelection",
    I = "tinymce/util/VK",
    F = "tinymce/dom/ControlSelection",
    z = "tinymce/util/Fun",
    U = "tinymce/caret/CaretCandidate",
    W = "tinymce/geom/ClientRect",
    V = "tinymce/text/ExtendingChar",
    $ = "tinymce/caret/CaretPosition",
    q = "tinymce/caret/CaretBookmark",
    j = "tinymce/dom/BookmarkManager",
    Y = "tinymce/dom/Selection",
    X = "tinymce/dom/ElementUtils",
    K = "tinymce/fmt/Preview",
    G = "tinymce/fmt/Hooks",
    J = "tinymce/Formatter",
    Q = "tinymce/UndoManager",
    Z = "tinymce/EnterKey",
    ee = "tinymce/ForceBlocks",
    te = "tinymce/caret/CaretUtils",
    ne = "tinymce/caret/CaretWalker",
    re = "tinymce/InsertList",
    ie = "tinymce/InsertContent",
    oe = "tinymce/EditorCommands",
    ae = "tinymce/util/URI",
    se = "tinymce/util/Class",
    le = "tinymce/util/EventDispatcher",
    ce = "tinymce/data/Binding",
    ue = "tinymce/util/Observable",
    de = "tinymce/data/ObservableObject",
    fe = "tinymce/ui/Selector",
    he = "tinymce/ui/Collection",
    pe = "tinymce/ui/DomUtils",
    me = "tinymce/ui/BoxUtils",
    ge = "tinymce/ui/ClassList",
    ve = "tinymce/ui/ReflowQueue",
    ye = "tinymce/ui/Control",
    be = "tinymce/ui/Factory",
    Ce = "tinymce/ui/KeyboardNavigation",
    xe = "tinymce/ui/Container",
    we = "tinymce/ui/DragHelper",
    Ne = "tinymce/ui/Scrollable",
    Ee = "tinymce/ui/Panel",
    _e = "tinymce/ui/Movable",
    Se = "tinymce/ui/Resizable",
    ke = "tinymce/ui/FloatPanel",
    Te = "tinymce/ui/Window",
    Re = "tinymce/ui/MessageBox",
    Ae = "tinymce/WindowManager",
    Be = "tinymce/ui/Tooltip",
    De = "tinymce/ui/Widget",
    Le = "tinymce/ui/Progress",
    Me = "tinymce/ui/Notification",
    Pe = "tinymce/NotificationManager",
    Oe = "tinymce/dom/NodePath",
    He = "tinymce/util/Quirks",
    Ie = "tinymce/EditorObservable",
    Fe = "tinymce/Mode",
    ze = "tinymce/Shortcuts",
    Ue = "tinymce/file/Uploader",
    We = "tinymce/file/Conversions",
    Ve = "tinymce/file/ImageScanner",
    $e = "tinymce/file/BlobCache",
    qe = "tinymce/file/UploadStatus",
    je = "tinymce/EditorUpload",
    Ye = "tinymce/caret/FakeCaret",
    Xe = "tinymce/dom/Dimensions",
    Ke = "tinymce/caret/LineWalker",
    Ge = "tinymce/caret/LineUtils",
    Je = "tinymce/dom/MousePosition",
    Qe = "tinymce/DragDropOverrides",
    Ze = "tinymce/SelectionOverrides",
    et = "tinymce/util/Uuid",
    tt = "tinymce/Editor",
    nt = "tinymce/util/I18n",
    rt = "tinymce/FocusManager",
    it = "tinymce/EditorManager",
    ot = "tinymce/LegacyInput",
    at = "tinymce/util/XHR",
    st = "tinymce/util/JSON",
    lt = "tinymce/util/JSONRequest",
    ct = "tinymce/util/JSONP",
    ut = "tinymce/util/LocalStorage",
    dt = "tinymce/Compat",
    ft = "tinymce/ui/Layout",
    ht = "tinymce/ui/AbsoluteLayout",
    pt = "tinymce/ui/Button",
    mt = "tinymce/ui/ButtonGroup",
    gt = "tinymce/ui/Checkbox",
    vt = "tinymce/ui/ComboBox",
    yt = "tinymce/ui/ColorBox",
    bt = "tinymce/ui/PanelButton",
    Ct = "tinymce/ui/ColorButton",
    xt = "tinymce/util/Color",
    wt = "tinymce/ui/ColorPicker",
    Nt = "tinymce/ui/Path",
    Et = "tinymce/ui/ElementPath",
    _t = "tinymce/ui/FormItem",
    St = "tinymce/ui/Form",
    kt = "tinymce/ui/FieldSet",
    Tt = "tinymce/ui/FilePicker",
    Rt = "tinymce/ui/FitLayout",
    At = "tinymce/ui/FlexLayout",
    Bt = "tinymce/ui/FlowLayout",
    Dt = "tinymce/ui/FormatControls",
    Lt = "tinymce/ui/GridLayout",
    Mt = "tinymce/ui/Iframe",
    Pt = "tinymce/ui/InfoBox",
    Ot = "tinymce/ui/Label",
    Ht = "tinymce/ui/Toolbar",
    It = "tinymce/ui/MenuBar",
    Ft = "tinymce/ui/MenuButton",
    zt = "tinymce/ui/MenuItem",
    Ut = "tinymce/ui/Throbber",
    Wt = "tinymce/ui/Menu",
    Vt = "tinymce/ui/ListBox",
    $t = "tinymce/ui/Radio",
    qt = "tinymce/ui/ResizeHandle",
    jt = "tinymce/ui/SelectBox",
    Yt = "tinymce/ui/Slider",
    Xt = "tinymce/ui/Spacer",
    Kt = "tinymce/ui/SplitButton",
    Gt = "tinymce/ui/StackLayout",
    Jt = "tinymce/ui/TabPanel",
    Qt = "tinymce/ui/TextBox",
    Zt = "tinymce/Register";
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
        return "number" != typeof t && (t = 1), setInterval(e, t)
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
          var r, i;
          return i = function() {
            var i = arguments;
            clearTimeout(r), r = n(function() {
              e.apply(this, i)
            }, t)
          }, i.stop = function() {
            clearTimeout(r)
          }, i
        },
        clearInterval: o,
        clearTimeout: i
      }
    }), r(d, [], function() {
      function e(e) {
        return "matchMedia" in window ? matchMedia(e).matches : !1
      }
      var t = navigator,
        n = t.userAgent,
        r, i, o, a, s, l, c, u, d, f, h, p, m;
      r = window.opera && window.opera.buildNumber, d = /Android/.test(n), i = /WebKit/.test(n), o = !i && !r && /MSIE/gi.test(n) && /Explorer/gi.test(t.appName), o = o && /MSIE (\w+)\./.exec(n)[1], a = -1 == n.indexOf("Trident/") || -1 == n.indexOf("rv:") && -1 == t.appName.indexOf("Netscape") ? !1 : 11, s = -1 == n.indexOf("Edge/") || o || a ? !1 : 12, o = o || a || s, l = !i && !a && /Gecko/.test(n), c = -1 != n.indexOf("Mac"), u = /(iPad|iPhone)/.test(n), f = "FormData" in window && "FileReader" in window && "URL" in window && !!URL.createObjectURL, h = e("only screen and (max-device-width: 480px)") && (d || u), p = e("only screen and (min-width: 800px)") && (d || u), m = -1 != n.indexOf("Windows Phone"), s && (i = !1);
      var g = !u || f || n.match(/AppleWebKit\/(\d*)/)[1] >= 534;
      return {
        opera: r,
        webkit: i,
        ie: o,
        gecko: l,
        mac: c,
        iOS: u,
        android: d,
        contentEditable: g,
        transparentSrc: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        caretAfter: 8 != o,
        range: window.getSelection && "Range" in window,
        documentMode: o && !s ? document.documentMode || 7 : 10,
        fileApi: f,
        ceFalse: o === !1 || o > 8,
        canHaveCSP: o === !1 || o > 11,
        desktop: !h && !p,
        windowsPhone: m
      }
    }), r(f, [u, d], function(e, t) {
      function n(e, t, n, r) {
        e.addEventListener ? e.addEventListener(t, n, r || !1) : e.attachEvent && e.attachEvent("on" + t, n)
      }

      function r(e, t, n, r) {
        e.removeEventListener ? e.removeEventListener(t, n, r || !1) : e.detachEvent && e.detachEvent("on" + t, n)
      }

      function i(e, t) {
        var n, r = t;
        return n = e.path, n && n.length > 0 && (r = n[0]), e.deepPath && (n = e.deepPath(), n && n.length > 0 && (r = n[0])), r
      }

      function o(e, n) {
        function r() {
          return !1
        }

        function o() {
          return !0
        }
        var a, s = n || {},
          l;
        for (a in e) u[a] || (s[a] = e[a]);
        if (s.target || (s.target = s.srcElement || document), t.experimentalShadowDom && (s.target = i(e, s.target)), e && c.test(e.type) && e.pageX === l && e.clientX !== l) {
          var d = s.target.ownerDocument || document,
            f = d.documentElement,
            h = d.body;
          s.pageX = e.clientX + (f && f.scrollLeft || h && h.scrollLeft || 0) - (f && f.clientLeft || h && h.clientLeft || 0), s.pageY = e.clientY + (f && f.scrollTop || h && h.scrollTop || 0) - (f && f.clientTop || h && h.clientTop || 0)
        }
        return s.preventDefault = function() {
          s.isDefaultPrevented = o, e && (e.preventDefault ? e.preventDefault() : e.returnValue = !1)
        }, s.stopPropagation = function() {
          s.isPropagationStopped = o, e && (e.stopPropagation ? e.stopPropagation() : e.cancelBubble = !0)
        }, s.stopImmediatePropagation = function() {
          s.isImmediatePropagationStopped = o, s.stopPropagation()
        }, s.isDefaultPrevented || (s.isDefaultPrevented = r, s.isPropagationStopped = r, s.isImmediatePropagationStopped = r), "undefined" == typeof s.metaKey && (s.metaKey = !1), s
      }

      function a(t, i, o) {
        function a() {
          o.domLoaded || (o.domLoaded = !0, i(u))
        }

        function s() {
          ("complete" === c.readyState || "interactive" === c.readyState && c.body) && (r(c, "readystatechange", s), a())
        }

        function l() {
          try {
            c.documentElement.doScroll("left")
          } catch (t) {
            return void e.setTimeout(l)
          }
          a()
        }
        var c = t.document,
          u = {
            type: "ready"
          };
        return o.domLoaded ? void i(u) : (c.addEventListener ? "complete" === c.readyState ? a() : n(t, "DOMContentLoaded", a) : (n(c, "readystatechange", s), c.documentElement.doScroll && t.self === t.top && l()), void n(t, "load", a))
      }

      function s() {
        function e(e, t) {
          var n, r, o, a, s = i[t];
          if (n = s && s[e.type])
            for (r = 0, o = n.length; o > r; r++)
              if (a = n[r], a && a.func.call(a.scope, e) === !1 && e.preventDefault(), e.isImmediatePropagationStopped()) return
        }
        var t = this,
          i = {},
          s, c, u, d, f;
        c = l + (+new Date).toString(32), d = "onmouseenter" in document.documentElement, u = "onfocusin" in document.documentElement, f = {
          mouseenter: "mouseover",
          mouseleave: "mouseout"
        }, s = 1, t.domLoaded = !1, t.events = i, t.bind = function(r, l, h, p) {
          function m(t) {
            e(o(t || N.event), g)
          }
          var g, v, y, b, C, x, w, N = window;
          if (r && 3 !== r.nodeType && 8 !== r.nodeType) {
            for (r[c] ? g = r[c] : (g = s++, r[c] = g, i[g] = {}), p = p || r, l = l.split(" "), y = l.length; y--;) b = l[y], x = m, C = w = !1, "DOMContentLoaded" === b && (b = "ready"), t.domLoaded && "ready" === b && "complete" == r.readyState ? h.call(p, o({
              type: b
            })) : (d || (C = f[b], C && (x = function(t) {
              var n, r;
              if (n = t.currentTarget, r = t.relatedTarget, r && n.contains) r = n.contains(r);
              else
                for (; r && r !== n;) r = r.parentNode;
              r || (t = o(t || N.event), t.type = "mouseout" === t.type ? "mouseleave" : "mouseenter", t.target = n, e(t, g))
            })), u || "focusin" !== b && "focusout" !== b || (w = !0, C = "focusin" === b ? "focus" : "blur", x = function(t) {
              t = o(t || N.event), t.type = "focus" === t.type ? "focusin" : "focusout", e(t, g)
            }), v = i[g][b], v ? "ready" === b && t.domLoaded ? h({
              type: b
            }) : v.push({
              func: h,
              scope: p
            }) : (i[g][b] = v = [{
              func: h,
              scope: p
            }], v.fakeName = C, v.capture = w, v.nativeHandler = x, "ready" === b ? a(r, x, t) : n(r, C || b, x, w)));
            return r = v = 0, h
          }
        }, t.unbind = function(e, n, o) {
          var a, s, l, u, d, f;
          if (!e || 3 === e.nodeType || 8 === e.nodeType) return t;
          if (a = e[c]) {
            if (f = i[a], n) {
              for (n = n.split(" "), l = n.length; l--;)
                if (d = n[l], s = f[d]) {
                  if (o)
                    for (u = s.length; u--;)
                      if (s[u].func === o) {
                        var h = s.nativeHandler,
                          p = s.fakeName,
                          m = s.capture;
                        s = s.slice(0, u).concat(s.slice(u + 1)), s.nativeHandler = h, s.fakeName = p, s.capture = m, f[d] = s
                      }
                  o && 0 !== s.length || (delete f[d], r(e, s.fakeName || d, s.nativeHandler, s.capture))
                }
            } else {
              for (d in f) s = f[d], r(e, s.fakeName || d, s.nativeHandler, s.capture);
              f = {}
            }
            for (d in f) return t;
            delete i[a];
            try {
              delete e[c]
            } catch (g) {
              e[c] = null
            }
          }
          return t
        }, t.fire = function(n, r, i) {
          var a;
          if (!n || 3 === n.nodeType || 8 === n.nodeType) return t;
          i = o(null, i), i.type = r, i.target = n;
          do a = n[c], a && e(i, a), n = n.parentNode || n.ownerDocument || n.defaultView || n.parentWindow; while (n && !i.isPropagationStopped());
          return t
        }, t.clean = function(e) {
          var n, r, i = t.unbind;
          if (!e || 3 === e.nodeType || 8 === e.nodeType) return t;
          if (e[c] && i(e), e.getElementsByTagName || (e = e.document), e && e.getElementsByTagName)
            for (i(e), r = e.getElementsByTagName("*"), n = r.length; n--;) e = r[n], e[c] && i(e);
          return t
        }, t.destroy = function() {
          i = {}
        }, t.cancel = function(e) {
          return e && (e.preventDefault(), e.stopImmediatePropagation()), !1
        }
      }
      var l = "mce-data-",
        c = /^(?:mouse|contextmenu)|click/,
        u = {
          keyLocation: 1,
          layerX: 1,
          layerY: 1,
          returnValue: 1,
          webkitMovementX: 1,
          webkitMovementY: 1,
          keyIdentifier: 1
        };
      return s.Event = new s, s.Event.bind(window, "ready", function() {}), s
    }), r(h, [], function() {
      function e(e, t, n, r) {
        var i, o, a, s, l, c, d, h, p, m;
        if ((t ? t.ownerDocument || t : z) !== D && B(t), t = t || D, n = n || [], !e || "string" != typeof e) return n;
        if (1 !== (s = t.nodeType) && 9 !== s) return [];
        if (M && !r) {
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
          o = W++;
        return t.first ? function(t, n, o) {
          for (; t = t[r];)
            if (1 === t.nodeType || i) return e(t, n, o)
        } : function(t, n, a) {
          var s, l, c = [U, o];
          if (a) {
            for (; t = t[r];)
              if ((1 === t.nodeType || i) && e(t, n, a)) return !0
          } else
            for (; t = t[r];)
              if (1 === t.nodeType || i) {
                if (l = t[F] || (t[F] = {}), (s = l[r]) && s[0] === U && s[1] === o) return c[2] = s[2];
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
        for (var o, a = [], s = 0, l = e.length, c = null != t; l > s; s++)(o = e[s]) && (n && !n(o, r, i) || (a.push(o), c && t.push(s)));
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
              C = U += null == y ? 1 : Math.random() || .1,
              x = b.length;
            for (c && (T = a !== D && a); p !== x && null != (u = b[p]); p++) {
              if (o && u) {
                for (d = 0; f = t[d++];)
                  if (f(u, a, s)) {
                    l.push(u);
                    break
                  }
                c && (U = C)
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
            return c && (U = C, T = y), m
          };
        return i ? r(a) : a
      }
      var C, x, w, N, E, _, S, k, T, R, A, B, D, L, M, P, O, H, I, F = "sizzle" + -new Date,
        z = window.document,
        U = 0,
        W = 0,
        V = n(),
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
      x = e.support = {}, E = e.isXML = function(e) {
        var t = e && (e.ownerDocument || e).documentElement;
        return t ? "HTML" !== t.nodeName : !1
      }, B = e.setDocument = function(e) {
        function t(e) {
          try {
            return e.top
          } catch (t) {}
          return null
        }
        var n, r = e ? e.ownerDocument || e : z,
          o = r.defaultView;
        return r !== D && 9 === r.nodeType && r.documentElement ? (D = r, L = r.documentElement, M = !E(r), o && o !== t(o) && (o.addEventListener ? o.addEventListener("unload", function() {
          B()
        }, !1) : o.attachEvent && o.attachEvent("onunload", function() {
          B()
        })), x.attributes = i(function(e) {
          return e.className = "i", !e.getAttribute("className")
        }), x.getElementsByTagName = i(function(e) {
          return e.appendChild(r.createComment("")), !e.getElementsByTagName("*").length
        }), x.getElementsByClassName = ge.test(r.getElementsByClassName), x.getById = i(function(e) {
          return L.appendChild(e).id = F, !r.getElementsByName || !r.getElementsByName(F).length
        }), x.getById ? (w.find.ID = function(e, t) {
          if (typeof t.getElementById !== Y && M) {
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
          return M ? t.getElementsByClassName(e) : void 0
        }, O = [], P = [], (x.qsa = ge.test(r.querySelectorAll)) && (i(function(e) {
          e.innerHTML = "<select msallowcapture=''><option selected=''></option></select>", e.querySelectorAll("[msallowcapture^='']").length && P.push("[*^$]=" + re + "*(?:''|\"\")"), e.querySelectorAll("[selected]").length || P.push("\\[" + re + "*(?:value|" + ne + ")"), e.querySelectorAll(":checked").length || P.push(":checked")
        }), i(function(e) {
          var t = r.createElement("input");
          t.setAttribute("type", "hidden"), e.appendChild(t).setAttribute("name", "D"), e.querySelectorAll("[name=d]").length && P.push("name" + re + "*[*^$|!~]?="), e.querySelectorAll(":enabled").length || P.push(":enabled", ":disabled"), e.querySelectorAll("*,:x"), P.push(",.*:")
        })), (x.matchesSelector = ge.test(H = L.matches || L.webkitMatchesSelector || L.mozMatchesSelector || L.oMatchesSelector || L.msMatchesSelector)) && i(function(e) {
          x.disconnectedMatch = H.call(e, "div"), H.call(e, "[s!='']:x"), O.push("!=", ae)
        }), P = P.length && new RegExp(P.join("|")), O = O.length && new RegExp(O.join("|")), n = ge.test(L.compareDocumentPosition), I = n || ge.test(L.contains) ? function(e, t) {
          var n = 9 === e.nodeType ? e.documentElement : e,
            r = t && t.parentNode;
          return e === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r)))
        } : function(e, t) {
          if (t)
            for (; t = t.parentNode;)
              if (t === e) return !0;
          return !1
        }, j = n ? function(e, t) {
          if (e === t) return A = !0, 0;
          var n = !e.compareDocumentPosition - !t.compareDocumentPosition;
          return n ? n : (n = (e.ownerDocument || e) === (t.ownerDocument || t) ? e.compareDocumentPosition(t) : 1, 1 & n || !x.sortDetached && t.compareDocumentPosition(e) === n ? e === r || e.ownerDocument === z && I(z, e) ? -1 : t === r || t.ownerDocument === z && I(z, t) ? 1 : R ? te.call(R, e) - te.call(R, t) : 0 : 4 & n ? -1 : 1)
        } : function(e, t) {
          if (e === t) return A = !0, 0;
          var n, i = 0,
            o = e.parentNode,
            s = t.parentNode,
            l = [e],
            c = [t];
          if (!o || !s) return e === r ? -1 : t === r ? 1 : o ? -1 : s ? 1 : R ? te.call(R, e) - te.call(R, t) : 0;
          if (o === s) return a(e, t);
          for (n = e; n = n.parentNode;) l.unshift(n);
          for (n = t; n = n.parentNode;) c.unshift(n);
          for (; l[i] === c[i];) i++;
          return i ? a(l[i], c[i]) : l[i] === z ? -1 : c[i] === z ? 1 : 0
        }, r) : D
      }, e.matches = function(t, n) {
        return e(t, null, null, n)
      }, e.matchesSelector = function(t, n) {
        if ((t.ownerDocument || t) !== D && B(t), n = n.replace(ue, "='$1']"), x.matchesSelector && M && (!O || !O.test(n)) && (!P || !P.test(n))) try {
          var r = H.call(t, n);
          if (r || x.disconnectedMatch || t.document && 11 !== t.document.nodeType) return r
        } catch (i) {}
        return e(n, D, null, [t]).length > 0
      }, e.contains = function(e, t) {
        return (e.ownerDocument || e) !== D && B(e), I(e, t)
      }, e.attr = function(e, n) {
        (e.ownerDocument || e) !== D && B(e);
        var r = w.attrHandle[n.toLowerCase()],
          i = r && K.call(w.attrHandle, n.toLowerCase()) ? r(e, n, !M) : t;
        return i !== t ? i : x.attributes || !M ? e.getAttribute(n) : (i = e.getAttributeNode(n)) && i.specified ? i.value : null
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
      }, N = e.getText = function(e) {
        var t, n = "",
          r = 0,
          i = e.nodeType;
        if (i) {
          if (1 === i || 9 === i || 11 === i) {
            if ("string" == typeof e.textContent) return e.textContent;
            for (e = e.firstChild; e; e = e.nextSibling) n += N(e)
          } else if (3 === i || 4 === i) return e.nodeValue
        } else
          for (; t = e[r++];) n += N(t);
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
            var t = V[e + " "];
            return t || (t = new RegExp("(^|" + re + ")" + e + "(" + re + "|$)")) && V(e, function(e) {
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
                  for (u = g[F] || (g[F] = {}), c = u[e] || [], h = c[0] === U && c[1], f = c[0] === U && c[2], d = h && g.childNodes[h]; d = ++h && d && d[m] || (f = h = 0) || p.pop();)
                    if (1 === d.nodeType && ++f && d === t) {
                      u[e] = [U, h, f];
                      break
                    }
                } else if (y && (c = (t[F] || (t[F] = {}))[e]) && c[0] === U) f = c[1];
                else
                  for (;
                    (d = ++h && d && d[m] || (f = h = 0) || p.pop()) && ((s ? d.nodeName.toLowerCase() !== v : 1 !== d.nodeType) || !++f || (y && ((d[F] || (d[F] = {}))[e] = [U, f]), d !== t)););
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
                return (t.textContent || t.innerText || N(t)).indexOf(e) > -1
              }
          }),
          lang: r(function(t) {
            return fe.test(t || "") || e.error("unsupported lang: " + t), t = t.replace(Ce, xe).toLowerCase(),
              function(e) {
                var n;
                do
                  if (n = M ? e.lang : e.getAttribute("xml:lang") || e.getAttribute("lang")) return n = n.toLowerCase(), n === t || 0 === n.indexOf(t + "-"); while ((e = e.parentNode) && 1 === e.nodeType);
                return !1
              }
          }),
          target: function(e) {
            var t = window.location && window.location.hash;
            return t && t.slice(1) === e.id
          },
          root: function(e) {
            return e === L
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
          r && !(i = le.exec(s)) || (i && (s = s.slice(i[0].length) || s), l.push(o = [])), r = !1, (i = ce.exec(s)) && (r = i.shift(), o.push({
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
          if (o = d[0] = d[0].slice(0), o.length > 2 && "ID" === (a = o[0]).type && x.getById && 9 === t.nodeType && M && w.relative[o[1].type]) {
            if (t = (w.find.ID(a.matches[0].replace(Ce, xe), t) || [])[0], !t) return n;
            c && (t = t.parentNode), e = e.slice(o.shift().value.length)
          }
          for (i = he.needsContext.test(e) ? 0 : o.length; i-- && (a = o[i], !w.relative[s = a.type]);)
            if ((l = w.find[s]) && (r = l(a.matches[0].replace(Ce, xe), ye.test(o[0].type) && u(t.parentNode) || t))) {
              if (o.splice(i, 1), e = r.length && f(o), !e) return Z.apply(n, r), n;
              break
            }
        }
        return (c || S(e, d))(r, t, !M, n, ye.test(e) && u(t.parentNode) || t), n
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
          t && !t(n, i, e) || r.push(n)
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
    }), r(m, [d, p], function(e, n) {
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
    }), r(g, [f, h, m, d], function(e, n, r, i) {
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
        N = Array.prototype.push,
        E = Array.prototype.slice,
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
        L = {},
        M = {},
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
              for (i = l(e, v(t)).firstChild; i;) N.call(n, i), i = i.nextSibling;
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
          else N.apply(n, f.makeArray(e));
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
                if (r = L[e], r && r.get) return r.get(n[0], e);
                if (A[e]) return n.prop(e) ? e : k;
                t = n[0].getAttribute(e, 2), null === t && (t = k)
              }
              return t
            }
            this.each(function() {
              var n;
              if (1 === this.nodeType) {
                if (n = L[e], n && n.set) return void n.set(this, t);
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
            if (s = M[e], s && s.set) return void s.set(this, t);
            try {
              this.style[D[e] || e] = t
            } catch (i) {}
            null !== t && "" !== t || (n.removeProperty ? n.removeProperty(r(e)) : n.removeAttribute(e))
          });
          else {
            if (a = i[0], s = M[e], s && s.get) return s.get(a);
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
            (1 === this.nodeType || this.host && 1 === this.host.nodeType) && this.appendChild(e)
          })
        },
        prepend: function() {
          return c(this, arguments, function(e) {
            (1 === this.nodeType || this.host && 1 === this.host.nodeType) && this.insertBefore(e, this.firstChild)
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
          return new f(E.apply(this, arguments))
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
        push: N,
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
          }), this.length > 1 && (o = f.unique(o), 0 !== e.indexOf("parents") && "prevUntil" !== e || (o = o.reverse())), o = f(o), r ? o.filter(r) : o
        }
      }), f.fn.is = function(e) {
        return !!e && this.filter(e).length > 0
      }, f.fn.init.prototype = f.fn, f.overrideDefaults = function(e) {
        function t(r, i) {
          return n = n || e(), 0 === arguments.length && (r = n.element), i || (i = n.context), new t.fn.init(r, i)
        }
        var n;
        return f.extend(t, this), t
      }, i.ie && i.ie < 8 && (x(L, "get", {
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
      }), x(L, "set", {
        "class": function(e, t) {
          e.className = t
        },
        style: function(e, t) {
          e.style.cssText = t
        }
      })), i.ie && i.ie < 9 && (D["float"] = "styleFloat", x(M, "set", {
        opacity: function(e, t) {
          var n = e.style;
          null === t || "" === t ? n.removeAttribute("filter") : (n.zoom = 1, n.filter = "alpha(opacity=" + 100 * t + ")")
        }
      })), f.attrHooks = L, f.cssHooks = M, f
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
                  "font-weight" === v && "700" === y ? y = "bold" : "color" !== v && "background-color" !== v || (y = y.toLowerCase()), y = y.replace(r, n), y = y.replace(i, p), m[v] = b ? h(y, !0) : y
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
              return n = f["*"], n && n[e] ? !1 : (n = f[t], !n || !n[e])
            }
            var i = "",
              o, a;
            if (t && d) n("*"), n(t);
            else
              for (o in e) a = e[o], a !== s && a.length > 0 && (f && !r(o, t) || (i += (i.length > 0 ? " " : "") + o + ": " + a + ";"));
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

        function r(e, n, r, i) {
          var o, a, s;
          if (e) {
            if (o = e[r], t && o === t) return;
            if (o) {
              if (!i)
                for (s = o[n]; s; s = s[n])
                  if (!s[n]) return s;
              return o
            }
            if (a = e.parentNode, a && a !== t) return a
          }
        }
        var i = e;
        this.current = function() {
          return i
        }, this.next = function(e) {
          return i = n(i, "firstChild", "nextSibling", e)
        }, this.prev = function(e) {
          return i = n(i, "lastChild", "previousSibling", e)
        }, this.prev2 = function(e) {
          return i = r(i, "lastChild", "previousSibling", e)
        }
      }
    }), r(b, [m], function(e) {
      function t(n) {
        function r() {
          return P.createDocumentFragment()
        }

        function i(e, t) {
          N(F, e, t)
        }

        function o(e, t) {
          N(z, e, t)
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
          e ? (M[V] = M[W], M[$] = M[U]) : (M[W] = M[V], M[U] = M[$]), M.collapsed = F
        }

        function d(e) {
          a(e), c(e)
        }

        function f(e) {
          i(e, 0), o(e, 1 === e.nodeType ? e.childNodes.length : e.nodeValue.length)
        }

        function h(e, t) {
          var n = M[W],
            r = M[U],
            i = M[V],
            o = M[$],
            a = t.startContainer,
            s = t.startOffset,
            l = t.endContainer,
            c = t.endOffset;
          return 0 === e ? w(n, r, a, s) : 1 === e ? w(i, o, a, s) : 2 === e ? w(i, o, l, c) : 3 === e ? w(n, r, l, c) : void 0
        }

        function p() {
          E(I)
        }

        function m() {
          return E(O)
        }

        function g() {
          return E(H)
        }

        function v(e) {
          var t = this[W],
            r = this[U],
            i, o;
          3 !== t.nodeType && 4 !== t.nodeType || !t.nodeValue ? (t.childNodes.length > 0 && (o = t.childNodes[r]), o ? t.insertBefore(e, o) : 3 == t.nodeType ? n.insertAfter(e, t) : t.appendChild(e)) : r ? r >= t.nodeValue.length ? n.insertAfter(e, t) : (i = t.splitText(r), t.parentNode.insertBefore(e, i)) : t.parentNode.insertBefore(e, t)
        }

        function y(e) {
          var t = M.extractContents();
          M.insertNode(e), e.appendChild(t), M.selectNode(e)
        }

        function b() {
          return q(new t(n), {
            startContainer: M[W],
            startOffset: M[U],
            endContainer: M[V],
            endOffset: M[$],
            collapsed: M.collapsed,
            commonAncestorContainer: M.commonAncestorContainer
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
          return M[W] == M[V] && M[U] == M[$]
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

        function N(e, t, r) {
          var i, o;
          for (e ? (M[W] = t, M[U] = r) : (M[V] = t, M[$] = r), i = M[V]; i.parentNode;) i = i.parentNode;
          for (o = M[W]; o.parentNode;) o = o.parentNode;
          o == i ? w(M[W], M[U], M[V], M[$]) > 0 && M.collapse(e) : M.collapse(e), M.collapsed = x(), M.commonAncestorContainer = n.findCommonAncestor(M[W], M[V])
        }

        function E(e) {
          var t, n = 0,
            r = 0,
            i, o, a, s, l, c;
          if (M[W] == M[V]) return _(e);
          for (t = M[V], i = t.parentNode; i; t = i, i = i.parentNode) {
            if (i == M[W]) return S(t, e);
            ++n
          }
          for (t = M[W], i = t.parentNode; i; t = i, i = i.parentNode) {
            if (i == M[V]) return k(t, e);
            ++r
          }
          for (o = r - n, a = M[W]; o > 0;) a = a.parentNode, o--;
          for (s = M[V]; 0 > o;) s = s.parentNode, o++;
          for (l = a.parentNode, c = s.parentNode; l != c; l = l.parentNode, c = c.parentNode) a = l, s = c;
          return T(a, s, e)
        }

        function _(e) {
          var t, n, i, o, a, s, l, c, u;
          if (e != I && (t = r()), M[U] == M[$]) return t;
          if (3 == M[W].nodeType) {
            if (n = M[W].nodeValue, i = n.substring(M[U], M[$]), e != H && (o = M[W], c = M[U], u = M[$] - M[U], 0 === c && u >= o.nodeValue.length - 1 ? o.parentNode.removeChild(o) : o.deleteData(c, u), M.collapse(F)), e == I) return;
            return i.length > 0 && t.appendChild(P.createTextNode(i)), t
          }
          for (o = C(M[W], M[U]), a = M[$] - M[U]; o && a > 0;) s = o.nextSibling, l = D(o, e), t && t.appendChild(l), --a, o = s;
          return e != H && M.collapse(F), t
        }

        function S(e, t) {
          var n, i, o, a, s, l;
          if (t != I && (n = r()), i = R(e, t), n && n.appendChild(i), o = j(e), a = o - M[U], 0 >= a) return t != H && (M.setEndBefore(e), M.collapse(z)), n;
          for (i = e.previousSibling; a > 0;) s = i.previousSibling, l = D(i, t), n && n.insertBefore(l, n.firstChild), --a, i = s;
          return t != H && (M.setEndBefore(e), M.collapse(z)), n
        }

        function k(e, t) {
          var n, i, o, a, s, l;
          for (t != I && (n = r()), o = A(e, t), n && n.appendChild(o), i = j(e), ++i, a = M[$] - i, o = e.nextSibling; o && a > 0;) s = o.nextSibling, l = D(o, t), n && n.appendChild(l), --a, o = s;
          return t != H && (M.setStartAfter(e), M.collapse(F)), n
        }

        function T(e, t, n) {
          var i, o, a, s, l, c, u;
          for (n != I && (o = r()), i = A(e, n), o && o.appendChild(i), a = j(e), s = j(t), ++a, l = s - a, c = e.nextSibling; l > 0;) u = c.nextSibling, i = D(c, n), o && o.appendChild(i), c = u, --l;
          return i = R(t, n), o && o.appendChild(i), n != H && (M.setStartAfter(e), M.collapse(F)), o
        }

        function R(e, t) {
          var n = C(M[V], M[$] - 1),
            r, i, o, a, s, l = n != M[V];
          if (n == e) return B(n, l, z, t);
          for (r = n.parentNode, i = B(r, z, z, t); r;) {
            for (; n;) o = n.previousSibling, a = B(n, l, z, t), t != I && i.insertBefore(a, i.firstChild), l = F, n = o;
            if (r == e) return i;
            n = r.previousSibling, r = r.parentNode, s = B(r, z, z, t), t != I && s.appendChild(i), i = s
          }
        }

        function A(e, t) {
          var n = C(M[W], M[U]),
            r = n != M[W],
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
            if (o = e.nodeValue, r ? (l = M[U], a = o.substring(l), s = o.substring(0, l)) : (l = M[$], a = o.substring(0, l), s = o.substring(l)), i != H && (e.nodeValue = s), i == I) return;
            return c = n.clone(e, z), c.nodeValue = a, c
          }
          if (i != I) return n.clone(e, z)
        }

        function D(e, t) {
          return t != I ? t == H ? n.clone(e, F) : e : void e.parentNode.removeChild(e)
        }

        function L() {
          return n.create("body", null, g()).outerText
        }
        var M = this,
          P = n.doc,
          O = 0,
          H = 1,
          I = 2,
          F = !0,
          z = !1,
          U = "startOffset",
          W = "startContainer",
          V = "endContainer",
          $ = "endOffset",
          q = e.extend,
          j = n.nodeIndex;
        return q(M, {
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
          toStringIE: L
        }), M
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
    }), r(w, [h, g, v, f, y, b, C, d, m, x], function(e, n, r, i, o, a, s, l, c, u) {
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
          for (e = o.get(e), i = i === t, r = r || ("BODY" != o.getRoot().nodeName ? o.getRoot().parentNode : null), g(n, "string") && (a = n,
              n = "*" === n ? function(e) {
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
          return e(r, o[0].ownerDocument || o[0], null, o).length > 0
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
    }), r(N, [w, m], function(e, t) {
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
        }, this.remove = function(e) {
          delete l[e], delete u[e]
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
    }), r(E, [N, m], function(e, n) {
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
        remove: function(e) {
          delete this.urls[e], delete this.lookup[e]
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
      var n = "\ufeff";
      return {
        isZwsp: e,
        ZWSP: n,
        trim: t
      }
    }), r(k, [_, S], function(e, t) {
      function n(e) {
        return p(e) && (e = e.parentNode), h(e) && e.hasAttribute("data-mce-caret")
      }

      function r(e) {
        return p(e) && t.isZwsp(e.data)
      }

      function i(e) {
        return n(e) || r(e)
      }

      function o(e) {
        var t = e.parentNode;
        t && t.removeChild(e)
      }

      function a(e) {
        try {
          return e.nodeValue
        } catch (t) {
          return ""
        }
      }

      function s(e, t) {
        0 === t.length ? o(e) : e.nodeValue = t
      }

      function l(e, n) {
        var r, o, a, s;
        if (r = e.ownerDocument, a = r.createTextNode(t.ZWSP), s = e.parentNode, n) {
          if (o = e.previousSibling, p(o)) {
            if (i(o)) return o;
            if (f(o)) return o.splitText(o.data.length - 1)
          }
          s.insertBefore(a, e)
        } else {
          if (o = e.nextSibling, p(o)) {
            if (i(o)) return o;
            if (d(o)) return o.splitText(1), o
          }
          e.nextSibling ? s.insertBefore(a, e.nextSibling) : s.appendChild(a)
        }
        return a
      }

      function c(e, t, n) {
        var r, i, o;
        return r = t.ownerDocument, i = r.createElement(e), i.setAttribute("data-mce-caret", n ? "before" : "after"), i.setAttribute("data-mce-bogus", "all"), i.appendChild(r.createTextNode("\xa0")), o = t.parentNode, n ? o.insertBefore(i, t) : t.nextSibling ? o.insertBefore(i, t.nextSibling) : o.appendChild(i), i
      }

      function u(e) {
        if (h(e) && i(e) && ("&nbsp;" != e.innerHTML ? e.removeAttribute("data-mce-caret") : o(e)), p(e)) {
          var n = t.trim(a(e));
          s(e, n)
        }
      }

      function d(e) {
        return p(e) && e.data[0] == t.ZWSP
      }

      function f(e) {
        return p(e) && e.data[e.data.length - 1] == t.ZWSP
      }
      var h = e.isElement,
        p = e.isText;
      return {
        isCaretContainer: i,
        isCaretContainerBlock: n,
        isCaretContainerInline: r,
        insertInline: l,
        insertBlock: c,
        remove: u,
        startsWithCaretContainer: d,
        endsWithCaretContainer: f
      }
    }), r(T, [m, y, _, b, k], function(e, t, n, r, i) {
      function o(e, t) {
        var n = e.childNodes;
        return t--, t > n.length - 1 ? t = n.length - 1 : 0 > t && (t = 0), n[t] || e
      }

      function a(e) {
        this.walk = function(t, n) {
          function r(e) {
            var t;
            return t = e[0], 3 === t.nodeType && t === c && u >= t.nodeValue.length && e.splice(0, 1), t = e[e.length - 1], 0 === f && e.length > 0 && t === d && 3 === t.nodeType && e.splice(e.length - 1, 1), e
          }

          function i(e, t, n) {
            for (var r = []; e && e != n; e = e[t]) r.push(e);
            return r
          }

          function a(e, t) {
            do {
              if (e.parentNode == t) return e;
              e = e.parentNode
            } while (e)
          }

          function s(e, t, o) {
            var a = o ? "nextSibling" : "previousSibling";
            for (g = e, v = g.parentNode; g && g != t; g = v) v = g.parentNode, y = i(g == e ? g : g[a], a), y.length && (o || y.reverse(), n(r(y)))
          }
          var c = t.startContainer,
            u = t.startOffset,
            d = t.endContainer,
            f = t.endOffset,
            h, p, m, g, v, y, b;
          if (b = e.select("td[data-mce-selected],th[data-mce-selected]"), b.length > 0) return void l(b, function(e) {
            n([e])
          });
          if (1 == c.nodeType && c.hasChildNodes() && (c = c.childNodes[u]), 1 == d.nodeType && d.hasChildNodes() && (d = o(d, f)), c == d) return n(r([c]));
          for (h = e.findCommonAncestor(c, d), g = c; g; g = g.parentNode) {
            if (g === d) return s(c, h, !0);
            if (g === h) break
          }
          for (g = d; g; g = g.parentNode) {
            if (g === c) return s(d, h);
            if (g === h) break
          }
          p = a(c, h) || c, m = a(d, h) || d, s(c, p, !0), y = i(p == c ? p : p.nextSibling, "nextSibling", m == d ? m.nextSibling : m), y.length && n(r(y)), s(d, m)
        }, this.split = function(e) {
          function t(e, t) {
            return e.splitText(t)
          }
          var n = e.startContainer,
            r = e.startOffset,
            i = e.endContainer,
            o = e.endOffset;
          return n == i && 3 == n.nodeType ? r > 0 && r < n.nodeValue.length && (i = t(n, r), n = i.previousSibling, o > r ? (o -= r, n = i = t(i, o).previousSibling, o = i.nodeValue.length, r = 0) : o = 0) : (3 == n.nodeType && r > 0 && r < n.nodeValue.length && (n = t(n, r), r = 0), 3 == i.nodeType && o > 0 && o < i.nodeValue.length && (i = t(i, o).previousSibling, o = i.nodeValue.length)), {
            startContainer: n,
            startOffset: r,
            endContainer: i,
            endOffset: o
          }
        }, this.normalize = function(n) {
          function r(r) {
            function a(e) {
              return e && /^(TD|TH|CAPTION)$/.test(e.nodeName)
            }

            function s(n, r) {
              for (var i = new t(n, e.getParent(n.parentNode, e.isBlock) || g); n = i[r ? "prev" : "next"]();)
                if ("BR" === n.nodeName) return !0
            }

            function l(e) {
              for (; e && e != g;) {
                if (c(e)) return !0;
                e = e.parentNode
              }
              return !1
            }

            function d(e, t) {
              return e.previousSibling && e.previousSibling.nodeName == t
            }

            function f(n, r) {
              var a, s, l;
              if (r = r || h, l = e.getParent(r.parentNode, e.isBlock) || g, n && "BR" == r.nodeName && C && e.isEmpty(l)) return h = r.parentNode, p = e.nodeIndex(r), void(i = !0);
              for (a = new t(r, l); v = a[n ? "prev" : "next"]();) {
                if ("false" === e.getContentEditableParent(v) || u(v)) return;
                if (3 === v.nodeType && v.nodeValue.length > 0) return h = v, p = n ? v.nodeValue.length : 0, void(i = !0);
                if (e.isBlock(v) || y[v.nodeName.toLowerCase()]) return;
                s = v
              }
              o && s && (h = s, i = !0, p = 0)
            }
            var h, p, m, g = e.getRoot(),
              v, y, b, C;
            if (h = n[(r ? "start" : "end") + "Container"], p = n[(r ? "start" : "end") + "Offset"], C = 1 == h.nodeType && p === h.childNodes.length, y = e.schema.getNonEmptyElements(), b = r, !u(h)) {
              if (1 == h.nodeType && p > h.childNodes.length - 1 && (b = !1), 9 === h.nodeType && (h = e.getRoot(), p = 0), h === g) {
                if (b && (v = h.childNodes[p > 0 ? p - 1 : 0])) {
                  if (u(v)) return;
                  if (y[v.nodeName] || "TABLE" == v.nodeName) return
                }
                if (h.hasChildNodes()) {
                  if (p = Math.min(!b && p > 0 ? p - 1 : p, h.childNodes.length - 1), h = h.childNodes[p], p = 0, !o && h === g.lastChild && "TABLE" === h.nodeName) return;
                  if (l(h) || u(h)) return;
                  if (h.hasChildNodes() && !/TABLE/.test(h.nodeName)) {
                    v = h, m = new t(h, g);
                    do {
                      if (c(v) || u(v)) {
                        i = !1;
                        break
                      }
                      if (3 === v.nodeType && v.nodeValue.length > 0) {
                        p = b ? 0 : v.nodeValue.length, h = v, i = !0;
                        break
                      }
                      if (y[v.nodeName.toLowerCase()] && !a(v)) {
                        p = e.nodeIndex(v), h = v.parentNode, "IMG" != v.nodeName || b || p++, i = !0;
                        break
                      }
                    } while (v = b ? m.next() : m.prev())
                  }
                }
              }
              o && (3 === h.nodeType && 0 === p && f(!0), 1 === h.nodeType && (v = h.childNodes[p], v || (v = h.childNodes[p - 1]), !v || "BR" !== v.nodeName || d(v, "A") || s(v) || s(v, !0) || f(!0, v))), b && !o && 3 === h.nodeType && p === h.nodeValue.length && f(!1), i && n["set" + (r ? "Start" : "End")](h, p)
            }
          }
          var i, o;
          return o = n.collapsed, r(!0), o || r(), i && o && n.collapse(!0), i
        }
      }

      function s(t, n, r) {
        var i, o, a;
        if (i = r.elementFromPoint(t, n), o = r.body.createTextRange(), i && "HTML" != i.tagName || (i = r.body), o.moveToElementText(i), a = e.toArray(o.getClientRects()), a = a.sort(function(e, t) {
            return e = Math.abs(Math.max(e.top - n, e.bottom - n)), t = Math.abs(Math.max(t.top - n, t.bottom - n)), e - t
          }), a.length > 0) {
          n = (a[0].bottom + a[0].top) / 2;
          try {
            return o.moveToPoint(t, n), o.collapse(!0), o
          } catch (s) {}
        }
        return null
      }
      var l = e.each,
        c = n.isContentEditableFalse,
        u = i.isCaretContainer;
      return a.compareRanges = function(e, t) {
        if (e && t) {
          if (!e.item && !e.duplicate) return e.startContainer == t.startContainer && e.startOffset == t.startOffset;
          if (e.item && t.item && e.item(0) === t.item(0)) return !0;
          if (e.isEqual && t.isEqual && t.isEqual(e)) return !0
        }
        return !1
      }, a.getCaretRangeFromPoint = function(e, t, n) {
        var r, i;
        if (n.caretPositionFromPoint) i = n.caretPositionFromPoint(e, t), r = n.createRange(), r.setStart(i.offsetNode, i.offset), r.collapse(!0);
        else if (n.caretRangeFromPoint) r = n.caretRangeFromPoint(e, t);
        else if (n.body.createTextRange) {
          r = n.body.createTextRange();
          try {
            r.moveToPoint(e, t), r.collapse(!0)
          } catch (o) {
            r = s(e, t, n)
          }
        }
        return r
      }, a.getSelectedNode = function(e) {
        var t = e.startContainer,
          n = e.startOffset;
        return t.hasChildNodes() && e.endOffset == n + 1 ? t.childNodes[n] : null
      }, a.getNode = function(e, t) {
        return 1 == e.nodeType && e.hasChildNodes() && (t >= e.childNodes.length && (t = e.childNodes.length - 1), e = e.childNodes[t]), e
      }, a
    }), r(R, [T, d, u], function(e, t, n) {
      return function(r) {
        function i(e) {
          var t, n;
          if (n = r.$(e).parentsUntil(r.getBody()).add(e), n.length === a.length) {
            for (t = n.length; t >= 0 && n[t] === a[t]; t--);
            if (-1 === t) return a = n, !0
          }
          return a = n, !1
        }
        var o, a = [];
        "onselectionchange" in r.getDoc() || r.on("NodeChange Click MouseUp KeyUp Focus", function(t) {
          var n, i;
          n = r.selection.getRng(), i = {
            startContainer: n.startContainer,
            startOffset: n.startOffset,
            endContainer: n.endContainer,
            endOffset: n.endOffset
          }, "nodechange" != t.type && e.compareRanges(i, o) || r.fire("SelectionChange"), o = i
        }), r.on("contextmenu", function() {
          r.fire("SelectionChange")
        }), r.on("SelectionChange", function() {
          var e = r.selection.getStart(!0);
          !t.range && r.selection.isCollapsed() || !i(e) && r.dom.isChildOf(e, r.getBody()) && r.nodeChanged({
            selectionChange: !0
          })
        }), r.on("MouseUp", function(e) {
          e.isDefaultPrevented() || ("IMG" == r.selection.getNode().nodeName ? n.setEditorTimeout(r, function() {
            r.nodeChanged()
          }) : r.nodeChanged())
        }), this.nodeChanged = function(e) {
          var t = r.selection,
            n, i, o;
          r.initialized && t && !r.settings.disable_nodechange && !r.readonly && (o = r.getBody(), n = t.getStart() || o, n.ownerDocument == r.getDoc() && r.dom.isChildOf(n, o) || (n = o), "IMG" == n.nodeName && t.isCollapsed() && (n = n.parentNode), i = [], r.dom.getParent(n, function(e) {
            return e === o ? !0 : void i.push(e)
          }), e = e || {}, e.element = n, e.parents = i, r.fire("NodeChange", e))
        }
      }
    }), r(A, [], function() {
      function e(e, t, n) {
        var r, i, o = n ? "lastChild" : "firstChild",
          a = n ? "prev" : "next";
        if (e[o]) return e[o];
        if (e !== t) {
          if (r = e[a]) return r;
          for (i = e.parent; i && i !== t; i = i.parent)
            if (r = i[a]) return r
        }
      }

      function t(e, t) {
        this.name = e, this.type = t, 1 === t && (this.attributes = [], this.attributes.map = {})
      }
      var n = /^[ \t\r\n]*$/,
        r = {
          "#text": 3,
          "#comment": 8,
          "#cdata": 4,
          "#pi": 7,
          "#doctype": 10,
          "#document-fragment": 11
        };
      return t.prototype = {
        replace: function(e) {
          var t = this;
          return e.parent && e.remove(), t.insert(e, t), t.remove(), t
        },
        attr: function(e, t) {
          var n = this,
            r, i, o;
          if ("string" != typeof e) {
            for (i in e) n.attr(i, e[i]);
            return n
          }
          if (r = n.attributes) {
            if (t !== o) {
              if (null === t) {
                if (e in r.map)
                  for (delete r.map[e], i = r.length; i--;)
                    if (r[i].name === e) return r = r.splice(i, 1), n;
                return n
              }
              if (e in r.map) {
                for (i = r.length; i--;)
                  if (r[i].name === e) {
                    r[i].value = t;
                    break
                  }
              } else r.push({
                name: e,
                value: t
              });
              return r.map[e] = t, n
            }
            return r.map[e]
          }
        },
        clone: function() {
          var e = this,
            n = new t(e.name, e.type),
            r, i, o, a, s;
          if (o = e.attributes) {
            for (s = [], s.map = {}, r = 0, i = o.length; i > r; r++) a = o[r], "id" !== a.name && (s[s.length] = {
              name: a.name,
              value: a.value
            }, s.map[a.name] = a.value);
            n.attributes = s
          }
          return n.value = e.value, n.shortEnded = e.shortEnded, n
        },
        wrap: function(e) {
          var t = this;
          return t.parent.insert(e, t), e.append(t), t
        },
        unwrap: function() {
          var e = this,
            t, n;
          for (t = e.firstChild; t;) n = t.next, e.insert(t, e, !0), t = n;
          e.remove()
        },
        remove: function() {
          var e = this,
            t = e.parent,
            n = e.next,
            r = e.prev;
          return t && (t.firstChild === e ? (t.firstChild = n, n && (n.prev = null)) : r.next = n, t.lastChild === e ? (t.lastChild = r, r && (r.next = null)) : n.prev = r, e.parent = e.next = e.prev = null), e
        },
        append: function(e) {
          var t = this,
            n;
          return e.parent && e.remove(), n = t.lastChild, n ? (n.next = e, e.prev = n, t.lastChild = e) : t.lastChild = t.firstChild = e, e.parent = t, e
        },
        insert: function(e, t, n) {
          var r;
          return e.parent && e.remove(), r = t.parent || this, n ? (t === r.firstChild ? r.firstChild = e : t.prev.next = e, e.prev = t.prev, e.next = t, t.prev = e) : (t === r.lastChild ? r.lastChild = e : t.next.prev = e, e.next = t.next, e.prev = t, t.next = e), e.parent = r, e
        },
        getAll: function(t) {
          var n = this,
            r, i = [];
          for (r = n.firstChild; r; r = e(r, n)) r.name === t && i.push(r);
          return i
        },
        empty: function() {
          var t = this,
            n, r, i;
          if (t.firstChild) {
            for (n = [], i = t.firstChild; i; i = e(i, t)) n.push(i);
            for (r = n.length; r--;) i = n[r], i.parent = i.firstChild = i.lastChild = i.next = i.prev = null
          }
          return t.firstChild = t.lastChild = null, t
        },
        isEmpty: function(t) {
          var r = this,
            i = r.firstChild,
            o, a;
          if (i)
            do {
              if (1 === i.type) {
                if (i.attributes.map["data-mce-bogus"]) continue;
                if (t[i.name]) return !1;
                for (o = i.attributes.length; o--;)
                  if (a = i.attributes[o].name, "name" === a || 0 === a.indexOf("data-mce-bookmark")) return !1
              }
              if (8 === i.type) return !1;
              if (3 === i.type && !n.test(i.value)) return !1
            } while (i = e(i, r));
          return !0
        },
        walk: function(t) {
          return e(this, null, t)
        }
      }, t.create = function(e, n) {
        var i, o;
        if (i = new t(e, r[e] || 1), n)
          for (o in n) i.attr(o, n[o]);
        return i
      }, t
    }), r(B, [m], function(e) {
      function t(e, t) {
        return e ? e.split(t || " ") : []
      }

      function n(e) {
        function n(e, n, r) {
          function i(e, t) {
            var n = {},
              r, i;
            for (r = 0, i = e.length; i > r; r++) n[e[r]] = t || {};
            return n
          }
          var s, c, u, d = arguments;
          for (r = r || [], n = n || "", "string" == typeof r && (r = t(r)), c = 3; c < d.length; c++) "string" == typeof d[c] && (d[c] = t(d[c])), r.push.apply(r, d[c]);
          for (e = t(e), s = e.length; s--;) u = [].concat(l, t(n)), a[e[s]] = {
            attributes: i(u),
            attributesOrder: u,
            children: i(r, o)
          }
        }

        function r(e, n) {
          var r, i, o, s;
          for (e = t(e), r = e.length, n = t(n); r--;)
            for (i = a[e[r]], o = 0, s = n.length; s > o; o++) i.attributes[n[o]] = {}, i.attributesOrder.push(n[o])
        }
        var a = {},
          l, c, u, d, f, h;
        return i[e] ? i[e] : (l = t("id accesskey class dir lang style tabindex title"), c = t("address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul"), u = t("a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd label map noscript object q s samp script select small span strong sub sup textarea u var #text #comment"), "html4" != e && (l.push.apply(l, t("contenteditable contextmenu draggable dropzone hidden spellcheck translate")), c.push.apply(c, t("article aside details dialog figure header footer hgroup section nav")), u.push.apply(u, t("audio canvas command datalist mark meter output picture progress time wbr video ruby bdi keygen"))), "html5-strict" != e && (l.push("xml:lang"), h = t("acronym applet basefont big font strike tt"), u.push.apply(u, h), s(h, function(e) {
          n(e, "", u)
        }), f = t("center dir isindex noframes"), c.push.apply(c, f), d = [].concat(c, u), s(f, function(e) {
          n(e, "", d)
        })), d = d || [].concat(c, u), n("html", "manifest", "head body"), n("head", "", "base command link meta noscript script style title"), n("title hr noscript br"), n("base", "href target"), n("link", "href rel media hreflang type sizes hreflang"), n("meta", "name http-equiv content charset"), n("style", "media type scoped"), n("script", "src async defer type charset"), n("body", "onafterprint onbeforeprint onbeforeunload onblur onerror onfocus onhashchange onload onmessage onoffline ononline onpagehide onpageshow onpopstate onresize onscroll onstorage onunload", d), n("address dt dd div caption", "", d), n("h1 h2 h3 h4 h5 h6 pre p abbr code var samp kbd sub sup i b u bdo span legend em strong small s cite dfn", "", u), n("blockquote", "cite", d), n("ol", "reversed start type", "li"), n("ul", "", "li"), n("li", "value", d), n("dl", "", "dt dd"), n("a", "href target rel media hreflang type", u), n("q", "cite", u), n("ins del", "cite datetime", d), n("img", "src sizes srcset alt usemap ismap width height"), n("iframe", "src name width height", d), n("embed", "src type width height"), n("object", "data type typemustmatch name usemap form width height", d, "param"), n("param", "name value"), n("map", "name", d, "area"), n("area", "alt coords shape href target rel media hreflang type"), n("table", "border", "caption colgroup thead tfoot tbody tr" + ("html4" == e ? " col" : "")), n("colgroup", "span", "col"), n("col", "span"), n("tbody thead tfoot", "", "tr"), n("tr", "", "td th"), n("td", "colspan rowspan headers", d), n("th", "colspan rowspan headers scope abbr", d), n("form", "accept-charset action autocomplete enctype method name novalidate target", d), n("fieldset", "disabled form name", d, "legend"), n("label", "form for", u), n("input", "accept alt autocomplete checked dirname disabled form formaction formenctype formmethod formnovalidate formtarget height list max maxlength min multiple name pattern readonly required size src step type value width"), n("button", "disabled form formaction formenctype formmethod formnovalidate formtarget name type value", "html4" == e ? d : u), n("select", "disabled form multiple name required size", "option optgroup"), n("optgroup", "disabled label", "option"), n("option", "disabled label selected value"), n("textarea", "cols dirname disabled form maxlength name readonly required rows wrap"), n("menu", "type label", d, "li"), n("noscript", "", d), "html4" != e && (n("wbr"), n("ruby", "", u, "rt rp"), n("figcaption", "", d), n("mark rt rp summary bdi", "", u), n("canvas", "width height", d), n("video", "src crossorigin poster preload autoplay mediagroup loop muted controls width height buffered", d, "track source"), n("audio", "src crossorigin preload autoplay mediagroup loop muted controls buffered volume", d, "track source"), n("picture", "", "img source"), n("source", "src srcset type media sizes"), n("track", "kind src srclang label default"), n("datalist", "", u, "option"), n("article section nav aside header footer", "", d), n("hgroup", "", "h1 h2 h3 h4 h5 h6"), n("figure", "", d, "figcaption"), n("time", "datetime", u), n("dialog", "open", d), n("command", "type label icon disabled checked radiogroup command"), n("output", "for form name", u), n("progress", "value max", u), n("meter", "value min max low high optimum", u), n("details", "open", d, "summary"), n("keygen", "autofocus challenge disabled form keytype name")), "html5-strict" != e && (r("script", "language xml:space"), r("style", "xml:space"), r("object", "declare classid code codebase codetype archive standby align border hspace vspace"), r("embed", "align name hspace vspace"), r("param", "valuetype type"), r("a", "charset name rev shape coords"), r("br", "clear"), r("applet", "codebase archive code object alt name width height align hspace vspace"), r("img", "name longdesc align border hspace vspace"), r("iframe", "longdesc frameborder marginwidth marginheight scrolling align"), r("font basefont", "size color face"), r("input", "usemap align"), r("select", "onchange"), r("textarea"), r("h1 h2 h3 h4 h5 h6 div p legend caption", "align"), r("ul", "type compact"), r("li", "type"), r("ol dl menu dir", "compact"), r("pre", "width xml:space"), r("hr", "align noshade size width"), r("isindex", "prompt"), r("table", "summary width frame rules cellspacing cellpadding align bgcolor"), r("col", "width align char charoff valign"), r("colgroup", "width align char charoff valign"), r("thead", "align char charoff valign"), r("tr", "align char charoff valign bgcolor"), r("th", "axis align char charoff valign nowrap bgcolor width height"), r("form", "accept"), r("td", "abbr axis scope align char charoff valign nowrap bgcolor width height"), r("tfoot", "align char charoff valign"), r("tbody", "align char charoff valign"), r("area", "nohref"), r("body", "background bgcolor text link vlink alink")), "html4" != e && (r("input button select textarea", "autofocus"), r("input textarea", "placeholder"), r("a", "download"), r("link script img", "crossorigin"), r("iframe", "sandbox seamless allowfullscreen")), s(t("a form meter progress dfn"), function(e) {
          a[e] && delete a[e].children[e]
        }), delete a.caption.children.table, delete a.script, i[e] = a, a)
      }

      function r(e, t) {
        var n;
        return e && (n = {}, "string" == typeof e && (e = {
          "*": e
        }), s(e, function(e, r) {
          n[r] = n[r.toUpperCase()] = "map" == t ? a(e, /[, ]/) : c(e, /[, ]/)
        })), n
      }
      var i = {},
        o = {},
        a = e.makeMap,
        s = e.each,
        l = e.extend,
        c = e.explode,
        u = e.inArray;
      return function(e) {
        function o(t, n, r) {
          var o = e[t];
          return o ? o = a(o, /[, ]/, a(o.toUpperCase(), /[, ]/)) : (o = i[t], o || (o = a(n, " ", a(n.toUpperCase(), " ")), o = l(o, r), i[t] = o)), o
        }

        function d(e) {
          return new RegExp("^" + e.replace(/([?+*])/g, ".$1") + "$")
        }

        function f(e) {
          var n, r, i, o, s, l, c, f, h, p, m, g, v, b, x, w, N, E, _, S = /^([#+\-])?([^\[!\/]+)(?:\/([^\[!]+))?(?:(!?)\[([^\]]+)\])?$/,
            k = /^([!\-])?(\w+::\w+|[^=:<]+)?(?:([=:<])(.*))?$/,
            T = /[*?+]/;
          if (e)
            for (e = t(e, ","), y["@"] && (w = y["@"].attributes, N = y["@"].attributesOrder), n = 0, r = e.length; r > n; n++)
              if (s = S.exec(e[n])) {
                if (b = s[1], h = s[2], x = s[3], f = s[5], g = {}, v = [], l = {
                    attributes: g,
                    attributesOrder: v
                  }, "#" === b && (l.paddEmpty = !0), "-" === b && (l.removeEmpty = !0), "!" === s[4] && (l.removeEmptyAttrs = !0), w) {
                  for (E in w) g[E] = w[E];
                  v.push.apply(v, N)
                }
                if (f)
                  for (f = t(f, "|"), i = 0, o = f.length; o > i; i++)
                    if (s = k.exec(f[i])) {
                      if (c = {}, m = s[1], p = s[2].replace(/::/g, ":"), b = s[3], _ = s[4], "!" === m && (l.attributesRequired = l.attributesRequired || [], l.attributesRequired.push(p), c.required = !0), "-" === m) {
                        delete g[p], v.splice(u(v, p), 1);
                        continue
                      }
                      b && ("=" === b && (l.attributesDefault = l.attributesDefault || [], l.attributesDefault.push({
                          name: p,
                          value: _
                        }), c.defaultValue = _), ":" === b && (l.attributesForced = l.attributesForced || [], l.attributesForced.push({
                          name: p,
                          value: _
                        }), c.forcedValue = _), "<" === b && (c.validValues = a(_, "?"))),
                        T.test(p) ? (l.attributePatterns = l.attributePatterns || [], c.pattern = d(p), l.attributePatterns.push(c)) : (g[p] || v.push(p), g[p] = c)
                    }
                w || "@" != h || (w = g, N = v), x && (l.outputName = h, y[x] = l), T.test(h) ? (l.pattern = d(h), C.push(l)) : y[h] = l
              }
        }

        function h(e) {
          y = {}, C = [], f(e), s(N, function(e, t) {
            b[t] = e.children
          })
        }

        function p(e) {
          var n = /^(~)?(.+)$/;
          e && (i.text_block_elements = i.block_elements = null, s(t(e, ","), function(e) {
            var t = n.exec(e),
              r = "~" === t[1],
              i = r ? "span" : "div",
              o = t[2];
            if (b[o] = b[i], M[o] = i, r || (R[o.toUpperCase()] = {}, R[o] = {}), !y[o]) {
              var a = y[i];
              a = l({}, a), delete a.removeEmptyAttrs, delete a.removeEmpty, y[o] = a
            }
            s(b, function(e, t) {
              e[i] && (b[t] = e = l({}, b[t]), e[o] = e[i])
            })
          }))
        }

        function m(n) {
          var r = /^([+\-]?)(\w+)\[([^\]]+)\]$/;
          i[e.schema] = null, n && s(t(n, ","), function(e) {
            var n = r.exec(e),
              i, o;
            n && (o = n[1], i = o ? b[n[2]] : b[n[2]] = {
              "#comment": {}
            }, i = b[n[2]], s(t(n[3], "|"), function(e) {
              "-" === o ? delete i[e] : i[e] = {}
            }))
          })
        }

        function g(e) {
          var t = y[e],
            n;
          if (t) return t;
          for (n = C.length; n--;)
            if (t = C[n], t.pattern.test(e)) return t
        }
        var v = this,
          y = {},
          b = {},
          C = [],
          x, w, N, E, _, S, k, T, R, A, B, D, L, M = {},
          P = {};
        e = e || {}, N = n(e.schema), e.verify_html === !1 && (e.valid_elements = "*[*]"), x = r(e.valid_styles), w = r(e.invalid_styles, "map"), T = r(e.valid_classes, "map"), E = o("whitespace_elements", "pre script noscript style textarea video audio iframe object"), _ = o("self_closing_elements", "colgroup dd dt li option p td tfoot th thead tr"), S = o("short_ended_elements", "area base basefont br col frame hr img input isindex link meta param embed source wbr track"), k = o("boolean_attributes", "checked compact declare defer disabled ismap multiple nohref noresize noshade nowrap readonly selected autoplay loop controls"), A = o("non_empty_elements", "td th iframe video audio object script", S), B = o("move_caret_before_on_enter_elements", "table", A), D = o("text_block_elements", "h1 h2 h3 h4 h5 h6 p div address pre form blockquote center dir fieldset header footer article section hgroup aside nav figure"), R = o("block_elements", "hr table tbody thead tfoot th tr td li ol ul caption dl dt dd noscript menu isindex option datalist select optgroup figcaption", D), L = o("text_inline_elements", "span strong b em i font strike u var cite dfn code mark q sup sub samp"), s((e.special || "script noscript style textarea").split(" "), function(e) {
          P[e] = new RegExp("</" + e + "[^>]*>", "gi")
        }), e.valid_elements ? h(e.valid_elements) : (s(N, function(e, t) {
          y[t] = {
            attributes: e.attributes,
            attributesOrder: e.attributesOrder
          }, b[t] = e.children
        }), "html5" != e.schema && s(t("strong/b em/i"), function(e) {
          e = t(e, "/"), y[e[1]].outputName = e[0]
        }), s(t("ol ul sub sup blockquote span font a table tbody tr strong em b i"), function(e) {
          y[e] && (y[e].removeEmpty = !0)
        }), s(t("p h1 h2 h3 h4 h5 h6 th td pre div address caption"), function(e) {
          y[e].paddEmpty = !0
        }), s(t("span"), function(e) {
          y[e].removeEmptyAttrs = !0
        })), p(e.custom_elements), m(e.valid_children), f(e.extended_valid_elements), m("+ol[ul|ol],+ul[ul|ol]"), e.invalid_elements && s(c(e.invalid_elements), function(e) {
          y[e] && delete y[e]
        }), g("span") || f("span[!data-mce-type|*]"), v.children = b, v.getValidStyles = function() {
          return x
        }, v.getInvalidStyles = function() {
          return w
        }, v.getValidClasses = function() {
          return T
        }, v.getBoolAttrs = function() {
          return k
        }, v.getBlockElements = function() {
          return R
        }, v.getTextBlockElements = function() {
          return D
        }, v.getTextInlineElements = function() {
          return L
        }, v.getShortEndedElements = function() {
          return S
        }, v.getSelfClosingElements = function() {
          return _
        }, v.getNonEmptyElements = function() {
          return A
        }, v.getMoveCaretBeforeOnEnterElements = function() {
          return B
        }, v.getWhiteSpaceElements = function() {
          return E
        }, v.getSpecialElements = function() {
          return P
        }, v.isValidChild = function(e, t) {
          var n = b[e];
          return !(!n || !n[t])
        }, v.isValid = function(e, t) {
          var n, r, i = g(e);
          if (i) {
            if (!t) return !0;
            if (i.attributes[t]) return !0;
            if (n = i.attributePatterns)
              for (r = n.length; r--;)
                if (n[r].pattern.test(e)) return !0
          }
          return !1
        }, v.getElementRule = g, v.getCustomElements = function() {
          return M
        }, v.addValidElements = f, v.setValidElements = h, v.addCustomElements = p, v.addValidChildren = m, v.elements = y
      }
    }), r(D, [B, C, m], function(e, t, n) {
      function r(e, t, n) {
        var r = 1,
          i, o, a, s;
        for (s = e.getShortEndedElements(), a = /<([!?\/])?([A-Za-z0-9\-_\:\.]+)((?:\s+[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*|\/|\s+)>/g, a.lastIndex = i = n; o = a.exec(t);) {
          if (i = a.lastIndex, "/" === o[1]) r--;
          else if (!o[1]) {
            if (o[2] in s) continue;
            r++
          }
          if (0 === r) break
        }
        return i
      }

      function i(i, a) {
        function s() {}
        var l = this;
        i = i || {}, l.schema = a = a || new e, i.fix_self_closing !== !1 && (i.fix_self_closing = !0), o("comment cdata text start end pi doctype".split(" "), function(e) {
          e && (l[e] = i[e] || s)
        }), l.parse = function(e) {
          function o(e) {
            var t, n;
            for (t = h.length; t-- && h[t].name !== e;);
            if (t >= 0) {
              for (n = h.length - 1; n >= t; n--) e = h[n], e.valid && l.end(e.name);
              h.length = t
            }
          }

          function s(e, t, n, r, o) {
            var a, s, l = /[\s\u0000-\u001F]+/g;
            if (t = t.toLowerCase(), n = t in x ? t : z(n || r || o || ""), N && !y && 0 !== t.indexOf("data-")) {
              if (a = T[t], !a && R) {
                for (s = R.length; s-- && (a = R[s], !a.pattern.test(t));); - 1 === s && (a = null)
              }
              if (!a) return;
              if (a.validValues && !(n in a.validValues)) return
            }
            if (W[t] && !i.allow_script_urls) {
              var c = n.replace(l, "");
              try {
                c = decodeURIComponent(c)
              } catch (u) {
                c = unescape(c)
              }
              if (V.test(c)) return;
              if (!i.allow_html_data_urls && $.test(c) && !/^data:image\//i.test(c)) return
            }
            p.map[t] = n, p.push({
              name: t,
              value: n
            })
          }
          var l = this,
            c, u = 0,
            d, f, h = [],
            p, m, g, v, y, b, C, x, w, N, E, _, S, k, T, R, A, B, D, L, M, P, O, H, I, F = 0,
            z = t.decode,
            U, W = n.makeMap("src,href,data,background,formaction,poster"),
            V = /((java|vb)script|mhtml):/i,
            $ = /^data:/i;
          for (P = new RegExp("<(?:(?:!--([\\w\\W]*?)-->)|(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|(?:!DOCTYPE([\\w\\W]*?)>)|(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|(?:\\/([^>]+)>)|(?:([A-Za-z0-9\\-_\\:\\.]+)((?:\\s+[^\"'>]+(?:(?:\"[^\"]*\")|(?:'[^']*')|[^>]*))*|\\/|\\s+)>))", "g"), O = /([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:[^\"])*)\")|(?:\'((?:[^\'])*)\')|([^>\s]+)))?/g, C = a.getShortEndedElements(), M = i.self_closing_elements || a.getSelfClosingElements(), x = a.getBoolAttrs(), N = i.validate, b = i.remove_internals, U = i.fix_self_closing, H = a.getSpecialElements(); c = P.exec(e);) {
            if (u < c.index && l.text(z(e.substr(u, c.index - u))), d = c[6]) d = d.toLowerCase(), ":" === d.charAt(0) && (d = d.substr(1)), o(d);
            else if (d = c[7]) {
              if (d = d.toLowerCase(), ":" === d.charAt(0) && (d = d.substr(1)), w = d in C, U && M[d] && h.length > 0 && h[h.length - 1].name === d && o(d), !N || (E = a.getElementRule(d))) {
                if (_ = !0, N && (T = E.attributes, R = E.attributePatterns), (k = c[8]) ? (y = -1 !== k.indexOf("data-mce-type"), y && b && (_ = !1), p = [], p.map = {}, k.replace(O, s)) : (p = [], p.map = {}), N && !y) {
                  if (A = E.attributesRequired, B = E.attributesDefault, D = E.attributesForced, L = E.removeEmptyAttrs, L && !p.length && (_ = !1), D)
                    for (m = D.length; m--;) S = D[m], v = S.name, I = S.value, "{$uid}" === I && (I = "mce_" + F++), p.map[v] = I, p.push({
                      name: v,
                      value: I
                    });
                  if (B)
                    for (m = B.length; m--;) S = B[m], v = S.name, v in p.map || (I = S.value, "{$uid}" === I && (I = "mce_" + F++), p.map[v] = I, p.push({
                      name: v,
                      value: I
                    }));
                  if (A) {
                    for (m = A.length; m-- && !(A[m] in p.map);); - 1 === m && (_ = !1)
                  }
                  if (S = p.map["data-mce-bogus"]) {
                    if ("all" === S) {
                      u = r(a, e, P.lastIndex), P.lastIndex = u;
                      continue
                    }
                    _ = !1
                  }
                }
                _ && l.start(d, p, w)
              } else _ = !1;
              if (f = H[d]) {
                f.lastIndex = u = c.index + c[0].length, (c = f.exec(e)) ? (_ && (g = e.substr(u, c.index - u)), u = c.index + c[0].length) : (g = e.substr(u), u = e.length), _ && (g.length > 0 && l.text(g, !0), l.end(d)), P.lastIndex = u;
                continue
              }
              w || (k && k.indexOf("/") == k.length - 1 ? _ && l.end(d) : h.push({
                name: d,
                valid: _
              }))
            } else(d = c[1]) ? (">" === d.charAt(0) && (d = " " + d), i.allow_conditional_comments || "[if" !== d.substr(0, 3) || (d = " " + d), l.comment(d)) : (d = c[2]) ? l.cdata(d) : (d = c[3]) ? l.doctype(d) : (d = c[4]) && l.pi(d, c[5]);
            u = c.index + c[0].length
          }
          for (u < e.length && l.text(z(e.substr(u))), m = h.length - 1; m >= 0; m--) d = h[m], d.valid && l.end(d.name)
        }
      }
      var o = n.each;
      return i.findEndTag = r, i
    }), r(L, [A, B, D, m], function(e, t, n, r) {
      var i = r.makeMap,
        o = r.each,
        a = r.explode,
        s = r.extend;
      return function(r, l) {
        function c(t) {
          var n, r, o, a, s, c, d, f, h, p, m, g, v, y, b;
          for (m = i("tr,td,th,tbody,thead,tfoot,table"), p = l.getNonEmptyElements(), g = l.getTextBlockElements(), v = l.getSpecialElements(), n = 0; n < t.length; n++)
            if (r = t[n], r.parent && !r.fixed)
              if (g[r.name] && "li" == r.parent.name) {
                for (y = r.next; y && g[y.name];) y.name = "li", y.fixed = !0, r.parent.insert(y, r.parent), y = y.next;
                r.unwrap(r)
              } else {
                for (a = [r], o = r.parent; o && !l.isValidChild(o.name, r.name) && !m[o.name]; o = o.parent) a.push(o);
                if (o && a.length > 1) {
                  for (a.reverse(), s = c = u.filterNode(a[0].clone()), h = 0; h < a.length - 1; h++) {
                    for (l.isValidChild(c.name, a[h].name) ? (d = u.filterNode(a[h].clone()), c.append(d)) : d = c, f = a[h].firstChild; f && f != a[h + 1];) b = f.next, d.append(f), f = b;
                    c = d
                  }
                  s.isEmpty(p) ? o.insert(r, a[0], !0) : (o.insert(s, a[0], !0), o.insert(r, s)), o = a[0], (o.isEmpty(p) || o.firstChild === o.lastChild && "br" === o.firstChild.name) && o.empty().remove()
                } else if (r.parent) {
                  if ("li" === r.name) {
                    if (y = r.prev, y && ("ul" === y.name || "ul" === y.name)) {
                      y.append(r);
                      continue
                    }
                    if (y = r.next, y && ("ul" === y.name || "ul" === y.name)) {
                      y.insert(r, y.firstChild, !0);
                      continue
                    }
                    r.wrap(u.filterNode(new e("ul", 1)));
                    continue
                  }
                  l.isValidChild(r.parent.name, "div") && l.isValidChild("div", r.name) ? r.wrap(u.filterNode(new e("div", 1))) : v[r.name] ? r.empty().remove() : r.unwrap()
                }
              }
        }
        var u = this,
          d = {},
          f = [],
          h = {},
          p = {};
        r = r || {}, r.validate = "validate" in r ? r.validate : !0, r.root_name = r.root_name || "body", u.schema = l = l || new t, u.filterNode = function(e) {
          var t, n, r;
          n in d && (r = h[n], r ? r.push(e) : h[n] = [e]), t = f.length;
          for (; t--;) n = f[t].name, n in e.attributes.map && (r = p[n], r ? r.push(e) : p[n] = [e]);
          return e
        }, u.addNodeFilter = function(e, t) {
          o(a(e), function(e) {
            var n = d[e];
            n || (d[e] = n = []), n.push(t)
          })
        }, u.addAttributeFilter = function(e, t) {
          o(a(e), function(e) {
            var n;
            for (n = 0; n < f.length; n++)
              if (f[n].name === e) return void f[n].callbacks.push(t);
            f.push({
              name: e,
              callbacks: [t]
            })
          })
        }, u.parse = function(t, o) {
          function a() {
            function e(e) {
              e && (t = e.firstChild, t && 3 == t.type && (t.value = t.value.replace(R, "")), t = e.lastChild, t && 3 == t.type && (t.value = t.value.replace(D, "")))
            }
            var t = y.firstChild,
              n, i;
            if (l.isValidChild(y.name, I.toLowerCase())) {
              for (; t;) n = t.next, 3 == t.type || 1 == t.type && "p" !== t.name && !T[t.name] && !t.attr("data-mce-type") ? i ? i.append(t) : (i = u(I, 1), i.attr(r.forced_root_block_attrs), y.insert(i, t), i.append(t)) : (e(i), i = null), t = n;
              e(i)
            }
          }

          function u(t, n) {
            var r = new e(t, n),
              i;
            return t in d && (i = h[t], i ? i.push(r) : h[t] = [r]), r
          }

          function m(e) {
            var t, n, r, i, o = l.getBlockElements();
            for (t = e.prev; t && 3 === t.type;) {
              if (r = t.value.replace(D, ""), r.length > 0) return void(t.value = r);
              if (n = t.next) {
                if (3 == n.type && n.value.length) {
                  t = t.prev;
                  continue
                }
                if (!o[n.name] && "script" != n.name && "style" != n.name) {
                  t = t.prev;
                  continue
                }
              }
              i = t.prev, t.remove(), t = i
            }
          }

          function g(e) {
            var t, n = {};
            for (t in e) "li" !== t && "p" != t && (n[t] = e[t]);
            return n
          }
          var v, y, b, C, x, w, N, E, _, S, k, T, R, A = [],
            B, D, L, M, P, O, H, I;
          if (o = o || {}, h = {}, p = {}, T = s(i("script,style,head,html,body,title,meta,param"), l.getBlockElements()), H = l.getNonEmptyElements(), O = l.children, k = r.validate, I = "forced_root_block" in o ? o.forced_root_block : r.forced_root_block, P = l.getWhiteSpaceElements(), R = /^[ \t\r\n]+/, D = /[ \t\r\n]+$/, L = /[ \t\r\n]+/g, M = /^[ \t\r\n]+$/, v = new n({
              validate: k,
              allow_script_urls: r.allow_script_urls,
              allow_conditional_comments: r.allow_conditional_comments,
              self_closing_elements: g(l.getSelfClosingElements()),
              cdata: function(e) {
                b.append(u("#cdata", 4)).value = e
              },
              text: function(e, t) {
                var n;
                B || (e = e.replace(L, " "), b.lastChild && T[b.lastChild.name] && (e = e.replace(R, ""))), 0 !== e.length && (n = u("#text", 3), n.raw = !!t, b.append(n).value = e)
              },
              comment: function(e) {
                b.append(u("#comment", 8)).value = e
              },
              pi: function(e, t) {
                b.append(u(e, 7)).value = t, m(b)
              },
              doctype: function(e) {
                var t;
                t = b.append(u("#doctype", 10)), t.value = e, m(b)
              },
              start: function(e, t, n) {
                var r, i, o, a, s;
                if (o = k ? l.getElementRule(e) : {}) {
                  for (r = u(o.outputName || e, 1), r.attributes = t, r.shortEnded = n, b.append(r), s = O[b.name], s && O[r.name] && !s[r.name] && A.push(r), i = f.length; i--;) a = f[i].name, a in t.map && (_ = p[a], _ ? _.push(r) : p[a] = [r]);
                  T[e] && m(r), n || (b = r), !B && P[e] && (B = !0)
                }
              },
              end: function(t) {
                var n, r, i, o, a;
                if (r = k ? l.getElementRule(t) : {}) {
                  if (T[t] && !B) {
                    if (n = b.firstChild, n && 3 === n.type)
                      if (i = n.value.replace(R, ""), i.length > 0) n.value = i, n = n.next;
                      else
                        for (o = n.next, n.remove(), n = o; n && 3 === n.type;) i = n.value, o = n.next, (0 === i.length || M.test(i)) && (n.remove(), n = o), n = o;
                    if (n = b.lastChild, n && 3 === n.type)
                      if (i = n.value.replace(D, ""), i.length > 0) n.value = i, n = n.prev;
                      else
                        for (o = n.prev, n.remove(), n = o; n && 3 === n.type;) i = n.value, o = n.prev, (0 === i.length || M.test(i)) && (n.remove(), n = o), n = o
                  }
                  if (B && P[t] && (B = !1), (r.removeEmpty || r.paddEmpty) && b.isEmpty(H))
                    if (r.paddEmpty) b.empty().append(new e("#text", "3")).value = "\xa0";
                    else if (!b.attributes.map.name && !b.attributes.map.id) return a = b.parent, T[b.name] ? b.empty().remove() : b.unwrap(), void(b = a);
                  b = b.parent
                }
              }
            }, l), y = b = new e(o.context || r.root_name, 11), v.parse(t), k && A.length && (o.context ? o.invalid = !0 : c(A)), I && ("body" == y.name || o.isRootContent) && a(), !o.invalid) {
            for (S in h) {
              for (_ = d[S], C = h[S], N = C.length; N--;) C[N].parent || C.splice(N, 1);
              for (x = 0, w = _.length; w > x; x++) _[x](C, S, o)
            }
            for (x = 0, w = f.length; w > x; x++)
              if (_ = f[x], _.name in p) {
                for (C = p[_.name], N = C.length; N--;) C[N].parent || C.splice(N, 1);
                for (N = 0, E = _.callbacks.length; E > N; N++) _.callbacks[N](C, _.name, o)
              }
          }
          return y
        }, r.remove_trailing_brs && u.addNodeFilter("br", function(t) {
          var n, r = t.length,
            i, o = s({}, l.getBlockElements()),
            a = l.getNonEmptyElements(),
            c, u, d, f, h, p;
          for (o.body = 1, n = 0; r > n; n++)
            if (i = t[n], c = i.parent, o[i.parent.name] && i === c.lastChild) {
              for (d = i.prev; d;) {
                if (f = d.name, "span" !== f || "bookmark" !== d.attr("data-mce-type")) {
                  if ("br" !== f) break;
                  if ("br" === f) {
                    i = null;
                    break
                  }
                }
                d = d.prev
              }
              i && (i.remove(), c.isEmpty(a) && (h = l.getElementRule(c.name), h && (h.removeEmpty ? c.remove() : h.paddEmpty && (c.empty().append(new e("#text", 3)).value = "\xa0"))))
            } else {
              for (u = i; c && c.firstChild === u && c.lastChild === u && (u = c, !o[c.name]);) c = c.parent;
              u === c && (p = new e("#text", 3), p.value = "\xa0", i.replace(p))
            }
        }), r.allow_html_in_named_anchor || u.addAttributeFilter("id,name", function(e) {
          for (var t = e.length, n, r, i, o; t--;)
            if (o = e[t], "a" === o.name && o.firstChild && !o.attr("href")) {
              i = o.parent, n = o.lastChild;
              do r = n.prev, i.insert(n, o), n = r; while (n)
            }
        }), r.validate && l.getValidClasses() && u.addAttributeFilter("class", function(e) {
          for (var t = e.length, n, r, i, o, a, s = l.getValidClasses(), c, u; t--;) {
            for (n = e[t], r = n.attr("class").split(" "), a = "", i = 0; i < r.length; i++) o = r[i], u = !1, c = s["*"], c && c[o] && (u = !0), c = s[n.name], !u && c && c[o] && (u = !0), u && (a && (a += " "), a += o);
            a.length || (a = null), n.attr("class", a)
          }
        })
      }
    }), r(M, [C, m], function(e, t) {
      var n = t.makeMap;
      return function(t) {
        var r = [],
          i, o, a, s, l;
        return t = t || {}, i = t.indent, o = n(t.indent_before || ""), a = n(t.indent_after || ""), s = e.getEncodeFunc(t.entity_encoding || "raw", t.entities), l = "html" == t.element_format, {
          start: function(e, t, n) {
            var c, u, d, f;
            if (i && o[e] && r.length > 0 && (f = r[r.length - 1], f.length > 0 && "\n" !== f && r.push("\n")), r.push("<", e), t)
              for (c = 0, u = t.length; u > c; c++) d = t[c], r.push(" ", d.name, '="', s(d.value, !0), '"');
            !n || l ? r[r.length] = ">" : r[r.length] = " />", n && i && a[e] && r.length > 0 && (f = r[r.length - 1], f.length > 0 && "\n" !== f && r.push("\n"))
          },
          end: function(e) {
            var t;
            r.push("</", e, ">"), i && a[e] && r.length > 0 && (t = r[r.length - 1], t.length > 0 && "\n" !== t && r.push("\n"))
          },
          text: function(e, t) {
            e.length > 0 && (r[r.length] = t ? e : s(e))
          },
          cdata: function(e) {
            r.push("<![CDATA[", e, "]]>")
          },
          comment: function(e) {
            r.push("<!--", e, "-->")
          },
          pi: function(e, t) {
            t ? r.push("<?", e, " ", s(t), "?>") : r.push("<?", e, "?>"), i && r.push("\n")
          },
          doctype: function(e) {
            r.push("<!DOCTYPE", e, ">", i ? "\n" : "")
          },
          reset: function() {
            r.length = 0
          },
          getContent: function() {
            return r.join("").replace(/\n$/, "")
          }
        }
      }
    }), r(P, [M, B], function(e, t) {
      return function(n, r) {
        var i = this,
          o = new e(n);
        n = n || {}, n.validate = "validate" in n ? n.validate : !0, i.schema = r = r || new t, i.writer = o, i.serialize = function(e) {
          function t(e) {
            var n = i[e.type],
              s, l, c, u, d, f, h, p, m;
            if (n) n(e);
            else {
              if (s = e.name, l = e.shortEnded, c = e.attributes, a && c && c.length > 1 && (f = [], f.map = {}, m = r.getElementRule(e.name))) {
                for (h = 0, p = m.attributesOrder.length; p > h; h++) u = m.attributesOrder[h], u in c.map && (d = c.map[u], f.map[u] = d, f.push({
                  name: u,
                  value: d
                }));
                for (h = 0, p = c.length; p > h; h++) u = c[h].name, u in f.map || (d = c.map[u], f.map[u] = d, f.push({
                  name: u,
                  value: d
                }));
                c = f
              }
              if (o.start(e.name, c, l), !l) {
                if (e = e.firstChild)
                  do t(e); while (e = e.next);
                o.end(s)
              }
            }
          }
          var i, a;
          return a = n.validate, i = {
            3: function(e) {
              o.text(e.value, e.raw)
            },
            8: function(e) {
              o.comment(e.value)
            },
            7: function(e) {
              o.pi(e.name, e.value)
            },
            10: function(e) {
              o.doctype(e.value)
            },
            4: function(e) {
              o.cdata(e.value)
            },
            11: function(e) {
              if (e = e.firstChild)
                do t(e); while (e = e.next)
            }
          }, o.reset(), 1 != e.type || n.inner ? i[11](e) : t(e), o.getContent()
        }
      }
    }), r(O, [w, L, D, C, P, A, B, d, m, S], function(e, t, n, r, i, o, a, s, l, c) {
      function u(e) {
        function t(e) {
          return e && "br" === e.name
        }
        var n, r;
        n = e.lastChild, t(n) && (r = n.prev, t(r) && (n.remove(), r.remove()))
      }
      var d = l.each,
        f = l.trim,
        h = e.DOM,
        p = ["data-mce-selected"];
      return function(e, o) {
        function m(e) {
          var t = new RegExp(["<span[^>]+data-mce-bogus[^>]+>[\u200b\ufeff]+<\\/span>", "\\s?(" + p.join("|") + ')="[^"]+"'].join("|"), "gi");
          return e = c.trim(e.replace(t, ""))
        }

        function g() {
          var e = o.getBody().innerHTML,
            t = /<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g,
            r, i, a, s, l, c = o.schema;
          for (e = m(e), l = c.getShortEndedElements(); s = t.exec(e);) i = t.lastIndex, a = s[0].length, r = l[s[1]] ? i : n.findEndTag(c, e, i), e = e.substring(0, i - a) + e.substring(r), t.lastIndex = i - a;
          return f(e)
        }

        function v(e) {
          -1 === l.inArray(p, e) && (C.addAttributeFilter(e, function(e, t) {
            for (var n = e.length; n--;) e[n].attr(t, null)
          }), p.push(e))
        }
        var y, b, C;
        return o && (y = o.dom, b = o.schema), y = y || h, b = b || new a(e), e.entity_encoding = e.entity_encoding || "named", e.remove_trailing_brs = "remove_trailing_brs" in e ? e.remove_trailing_brs : !0, C = new t(e, b), C.addAttributeFilter("data-mce-tabindex", function(e, t) {
          for (var n = e.length, r; n--;) r = e[n], r.attr("tabindex", r.attributes.map["data-mce-tabindex"]), r.attr(t, null)
        }), C.addAttributeFilter("src,href,style", function(t, n) {
          for (var r = t.length, i, o, a = "data-mce-" + n, s = e.url_converter, l = e.url_converter_scope, c; r--;) i = t[r], o = i.attributes.map[a], o !== c ? (i.attr(n, o.length > 0 ? o : null), i.attr(a, null)) : (o = i.attributes.map[n], "style" === n ? o = y.serializeStyle(y.parseStyle(o), i.name) : s && (o = s.call(l, o, n, i.name)), i.attr(n, o.length > 0 ? o : null))
        }), C.addAttributeFilter("class", function(e) {
          for (var t = e.length, n, r; t--;) n = e[t], r = n.attr("class"), r && (r = n.attr("class").replace(/(?:^|\s)mce-item-\w+(?!\S)/g, ""), n.attr("class", r.length > 0 ? r : null))
        }), C.addAttributeFilter("data-mce-type", function(e, t, n) {
          for (var r = e.length, i; r--;) i = e[r], "bookmark" !== i.attributes.map["data-mce-type"] || n.cleanup || i.remove()
        }), C.addNodeFilter("noscript", function(e) {
          for (var t = e.length, n; t--;) n = e[t].firstChild, n && (n.value = r.decode(n.value))
        }), C.addNodeFilter("script,style", function(e, t) {
          function n(e) {
            return e.replace(/(<!--\[CDATA\[|\]\]-->)/g, "\n").replace(/^[\r\n]*|[\r\n]*$/g, "").replace(/^\s*((<!--)?(\s*\/\/)?\s*<!\[CDATA\[|(<!--\s*)?\/\*\s*<!\[CDATA\[\s*\*\/|(\/\/)?\s*<!--|\/\*\s*<!--\s*\*\/)\s*[\r\n]*/gi, "").replace(/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g, "")
          }
          for (var r = e.length, i, o, a; r--;) i = e[r], o = i.firstChild ? i.firstChild.value : "", "script" === t ? (a = i.attr("type"), a && i.attr("type", "mce-no/type" == a ? null : a.replace(/^mce\-/, "")), o.length > 0 && (i.firstChild.value = "// <![CDATA[\n" + n(o) + "\n// ]]>")) : o.length > 0 && (i.firstChild.value = "<!--\n" + n(o) + "\n-->")
        }), C.addNodeFilter("#comment", function(e) {
          for (var t = e.length, n; t--;) n = e[t], 0 === n.value.indexOf("[CDATA[") ? (n.name = "#cdata", n.type = 4, n.value = n.value.replace(/^\[CDATA\[|\]\]$/g, "")) : 0 === n.value.indexOf("mce:protected ") && (n.name = "#text", n.type = 3, n.raw = !0, n.value = unescape(n.value).substr(14))
        }), C.addNodeFilter("xml:namespace,input", function(e, t) {
          for (var n = e.length, r; n--;) r = e[n], 7 === r.type ? r.remove() : 1 === r.type && ("input" !== t || "type" in r.attributes.map || r.attr("type", "text"))
        }), e.fix_list_elements && C.addNodeFilter("ul,ol", function(e) {
          for (var t = e.length, n, r; t--;) n = e[t], r = n.parent, "ul" !== r.name && "ol" !== r.name || n.prev && "li" === n.prev.name && n.prev.append(n)
        }), C.addAttributeFilter("data-mce-src,data-mce-href,data-mce-style,data-mce-selected,data-mce-expando,data-mce-type,data-mce-resize", function(e, t) {
          for (var n = e.length; n--;) e[n].attr(t, null)
        }), {
          schema: b,
          addNodeFilter: C.addNodeFilter,
          addAttributeFilter: C.addAttributeFilter,
          serialize: function(t, n) {
            var r = this,
              o, a, l, h, p, m;
            return s.ie && y.select("script,style,select,map").length > 0 ? (p = t.innerHTML, t = t.cloneNode(!1), y.setHTML(t, p)) : t = t.cloneNode(!0), o = document.implementation, o.createHTMLDocument && (a = o.createHTMLDocument(""), d("BODY" == t.nodeName ? t.childNodes : [t], function(e) {
              a.body.appendChild(a.importNode(e, !0))
            }), t = "BODY" != t.nodeName ? a.body.firstChild : a.body, l = y.doc, y.doc = a), n = n || {}, n.format = n.format || "html", n.selection && (n.forced_root_block = ""), n.no_events || (n.node = t, r.onPreProcess(n)), m = C.parse(f(n.getInner ? t.innerHTML : y.getOuterHTML(t)), n), u(m), h = new i(e, b), n.content = h.serialize(m), n.cleanup || (n.content = c.trim(n.content), n.content = n.content.replace(/\uFEFF/g, "")), n.no_events || r.onPostProcess(n), l && (y.doc = l), n.node = null, n.content
          },
          addRules: function(e) {
            b.addValidElements(e)
          },
          setRules: function(e) {
            b.setValidElements(e)
          },
          onPreProcess: function(e) {
            o && o.fire("PreProcess", e)
          },
          onPostProcess: function(e) {
            o && o.fire("PostProcess", e)
          },
          addTempAttr: v,
          trimHtml: m,
          getTrimmedContent: g
        }
      }
    }), r(H, [], function() {
      function e(e) {
        function t(t, n) {
          var r, i = 0,
            o, a, s, l, c, u, d = -1,
            f;
          if (r = t.duplicate(), r.collapse(n), f = r.parentElement(), f.ownerDocument === e.dom.doc) {
            for (;
              "false" === f.contentEditable;) f = f.parentNode;
            if (!f.hasChildNodes()) return {
              node: f,
              inside: 1
            };
            for (s = f.children, o = s.length - 1; o >= i;)
              if (u = Math.floor((i + o) / 2), l = s[u], r.moveToElementText(l), d = r.compareEndPoints(n ? "StartToStart" : "EndToEnd", t), d > 0) o = u - 1;
              else {
                if (!(0 > d)) return {
                  node: l
                };
                i = u + 1
              }
            if (0 > d)
              for (l ? r.collapse(!1) : (r.moveToElementText(f), r.collapse(!0), l = f, a = !0), c = 0; 0 !== r.compareEndPoints(n ? "StartToStart" : "StartToEnd", t) && 0 !== r.move("character", 1) && f == r.parentElement();) c++;
            else
              for (r.collapse(!0), c = 0; 0 !== r.compareEndPoints(n ? "StartToStart" : "StartToEnd", t) && 0 !== r.move("character", -1) && f == r.parentElement();) c++;
            return {
              node: l,
              position: d,
              offset: c,
              inside: a
            }
          }
        }

        function n() {
          function n(e) {
            var n = t(o, e),
              r, i, s = 0,
              l, c, u;
            if (r = n.node, i = n.offset, n.inside && !r.hasChildNodes()) return void a[e ? "setStart" : "setEnd"](r, 0);
            if (i === c) return void a[e ? "setStartBefore" : "setEndAfter"](r);
            if (n.position < 0) {
              if (l = n.inside ? r.firstChild : r.nextSibling, !l) return void a[e ? "setStartAfter" : "setEndAfter"](r);
              if (!i) return void(3 == l.nodeType ? a[e ? "setStart" : "setEnd"](l, 0) : a[e ? "setStartBefore" : "setEndBefore"](l));
              for (; l;) {
                if (3 == l.nodeType && (u = l.nodeValue, s += u.length, s >= i)) {
                  r = l, s -= i, s = u.length - s;
                  break
                }
                l = l.nextSibling
              }
            } else {
              if (l = r.previousSibling, !l) return a[e ? "setStartBefore" : "setEndBefore"](r);
              if (!i) return void(3 == r.nodeType ? a[e ? "setStart" : "setEnd"](l, r.nodeValue.length) : a[e ? "setStartAfter" : "setEndAfter"](l));
              for (; l;) {
                if (3 == l.nodeType && (s += l.nodeValue.length, s >= i)) {
                  r = l, s -= i;
                  break
                }
                l = l.previousSibling
              }
            }
            a[e ? "setStart" : "setEnd"](r, s)
          }
          var o = e.getRng(),
            a = i.createRng(),
            s, l, c, u, d;
          if (s = o.item ? o.item(0) : o.parentElement(), s.ownerDocument != i.doc) return a;
          if (l = e.isCollapsed(), o.item) return a.setStart(s.parentNode, i.nodeIndex(s)), a.setEnd(a.startContainer, a.startOffset + 1), a;
          try {
            n(!0), l || n()
          } catch (f) {
            if (-2147024809 != f.number) throw f;
            d = r.getBookmark(2), c = o.duplicate(), c.collapse(!0), s = c.parentElement(), l || (c = o.duplicate(), c.collapse(!1), u = c.parentElement(), u.innerHTML = u.innerHTML), s.innerHTML = s.innerHTML, r.moveToBookmark(d), o = e.getRng(), n(!0), l || n()
          }
          return a
        }
        var r = this,
          i = e.dom,
          o = !1;
        this.getBookmark = function(n) {
          function r(e) {
            var t, n, r, o, a = [];
            for (t = e.parentNode, n = i.getRoot().parentNode; t != n && 9 !== t.nodeType;) {
              for (r = t.children, o = r.length; o--;)
                if (e === r[o]) {
                  a.push(o);
                  break
                }
              e = t, t = t.parentNode
            }
            return a
          }

          function o(e) {
            var n;
            return n = t(a, e), n ? {
              position: n.position,
              offset: n.offset,
              indexes: r(n.node),
              inside: n.inside
            } : void 0
          }
          var a = e.getRng(),
            s = {};
          return 2 === n && (a.item ? s.start = {
            ctrl: !0,
            indexes: r(a.item(0))
          } : (s.start = o(!0), e.isCollapsed() || (s.end = o()))), s
        }, this.moveToBookmark = function(e) {
          function t(e) {
            var t, n, r, o;
            for (t = i.getRoot(), n = e.length - 1; n >= 0; n--) o = t.children, r = e[n], r <= o.length - 1 && (t = o[r]);
            return t
          }

          function n(n) {
            var i = e[n ? "start" : "end"],
              a, s, l, c;
            i && (a = i.position > 0, s = o.createTextRange(), s.moveToElementText(t(i.indexes)), c = i.offset, c !== l ? (s.collapse(i.inside || a), s.moveStart("character", a ? -c : c)) : s.collapse(n), r.setEndPoint(n ? "StartToStart" : "EndToStart", s), n && r.collapse(!0))
          }
          var r, o = i.doc.body;
          e.start && (e.start.ctrl ? (r = o.createControlRange(), r.addElement(t(e.start.indexes)), r.select()) : (r = o.createTextRange(), n(!0), n(), r.select()))
        }, this.addRange = function(t) {
          function n(e) {
            var t, n, a, d, p;
            a = i.create("a"), t = e ? s : c, n = e ? l : u, d = r.duplicate(), t != f && t != f.documentElement || (t = h, n = 0), 3 == t.nodeType ? (t.parentNode.insertBefore(a, t), d.moveToElementText(a), d.moveStart("character", n), i.remove(a), r.setEndPoint(e ? "StartToStart" : "EndToEnd", d)) : (p = t.childNodes, p.length ? (n >= p.length ? i.insertAfter(a, p[p.length - 1]) : t.insertBefore(a, p[n]), d.moveToElementText(a)) : t.canHaveHTML && (t.innerHTML = "<span>&#xFEFF;</span>", a = t.firstChild, d.moveToElementText(a), d.collapse(o)), r.setEndPoint(e ? "StartToStart" : "EndToEnd", d), i.remove(a))
          }
          var r, a, s, l, c, u, d, f = e.dom.doc,
            h = f.body,
            p, m;
          if (s = t.startContainer, l = t.startOffset, c = t.endContainer, u = t.endOffset, r = h.createTextRange(), s == c && 1 == s.nodeType) {
            if (l == u && !s.hasChildNodes()) {
              if (s.canHaveHTML) return d = s.previousSibling, d && !d.hasChildNodes() && i.isBlock(d) ? d.innerHTML = "&#xFEFF;" : d = null, s.innerHTML = "<span>&#xFEFF;</span><span>&#xFEFF;</span>", r.moveToElementText(s.lastChild), r.select(), i.doc.selection.clear(), s.innerHTML = "", void(d && (d.innerHTML = ""));
              l = i.nodeIndex(s), s = s.parentNode
            }
            if (l == u - 1) try {
              if (m = s.childNodes[l], a = h.createControlRange(), a.addElement(m), a.select(), p = e.getRng(), p.item && m === p.item(0)) return
            } catch (g) {}
          }
          n(!0), n(), r.select()
        }, this.getRangeAt = n
      }
      return e
    }), r(I, [d], function(e) {
      return {
        BACKSPACE: 8,
        DELETE: 46,
        DOWN: 40,
        ENTER: 13,
        LEFT: 37,
        RIGHT: 39,
        SPACEBAR: 32,
        TAB: 9,
        UP: 38,
        modifierPressed: function(e) {
          return e.shiftKey || e.ctrlKey || e.altKey || this.metaKeyPressed(e)
        },
        metaKeyPressed: function(t) {
          return e.mac ? t.metaKey : t.ctrlKey && !t.altKey
        }
      }
    }), r(F, [I, m, u, d, _], function(e, t, n, r, i) {
      function o(e, t) {
        for (; t && t != e;) {
          if (s(t) || a(t)) return t;
          t = t.parentNode
        }
        return null
      }
      var a = i.isContentEditableFalse,
        s = i.isContentEditableTrue;
      return function(i, s) {
        function l(e) {
          var t = s.settings.object_resizing;
          return t === !1 || r.iOS ? !1 : ("string" != typeof t && (t = "table,img,div"), "false" === e.getAttribute("data-mce-resize") ? !1 : e == s.getBody() ? !1 : s.dom.is(e, t))
        }

        function c(t) {
          var n, r, i, o, a;
          n = t.screenX - L, r = t.screenY - M, U = n * B[2] + H, W = r * B[3] + I, U = 5 > U ? 5 : U, W = 5 > W ? 5 : W, i = "IMG" == k.nodeName && s.settings.resize_img_proportional !== !1 ? !e.modifierPressed(t) : e.modifierPressed(t) || "IMG" == k.nodeName && B[2] * B[3] !== 0, i && (j(n) > j(r) ? (W = Y(U * F), U = Y(W / F)) : (U = Y(W / F), W = Y(U * F))), _.setStyles(T, {
            width: U,
            height: W
          }), o = B.startPos.x + n, a = B.startPos.y + r, o = o > 0 ? o : 0, a = a > 0 ? a : 0, _.setStyles(R, {
            left: o,
            top: a,
            display: "block"
          }), R.innerHTML = U + " &times; " + W, B[2] < 0 && T.clientWidth <= U && _.setStyle(T, "left", P + (H - U)), B[3] < 0 && T.clientHeight <= W && _.setStyle(T, "top", O + (I - W)), n = X.scrollWidth - K, r = X.scrollHeight - G, n + r !== 0 && _.setStyles(R, {
            left: o - n,
            top: a - r
          }), z || (s.fire("ObjectResizeStart", {
            target: k,
            width: H,
            height: I
          }), z = !0)
        }

        function u() {
          function e(e, t) {
            t && (k.style[e] || !s.schema.isValid(k.nodeName.toLowerCase(), e) ? _.setStyle(k, e, t) : _.setAttrib(k, e, t))
          }
          z = !1, e("width", U), e("height", W), _.unbind(V, "mousemove", c), _.unbind(V, "mouseup", u), $ != V && (_.unbind($, "mousemove", c), _.unbind($, "mouseup", u)), _.remove(T), _.remove(R), q && "TABLE" != k.nodeName || d(k), s.fire("ObjectResized", {
            target: k,
            width: U,
            height: W
          }), _.setAttrib(k, "style", _.getAttrib(k, "style")), s.nodeChanged()
        }

        function d(e, t, n) {
          var i, o, a, d, h;
          f(), x(), i = _.getPos(e, X), P = i.x, O = i.y, h = e.getBoundingClientRect(), o = h.width || h.right - h.left, a = h.height || h.bottom - h.top, k != e && (C(), k = e, U = W = 0), d = s.fire("ObjectSelected", {
            target: e
          }), l(e) && !d.isDefaultPrevented() ? S(A, function(e, i) {
            function s(t) {
              L = t.screenX, M = t.screenY, H = k.clientWidth, I = k.clientHeight, F = I / H, B = e, e.startPos = {
                x: o * e[0] + P,
                y: a * e[1] + O
              }, K = X.scrollWidth, G = X.scrollHeight, T = k.cloneNode(!0), _.addClass(T, "mce-clonedresizable"), _.setAttrib(T, "data-mce-bogus", "all"), T.contentEditable = !1, T.unSelectabe = !0, _.setStyles(T, {
                left: P,
                top: O,
                margin: 0
              }), T.removeAttribute("data-mce-selected"), X.appendChild(T), _.bind(V, "mousemove", c), _.bind(V, "mouseup", u), $ != V && (_.bind($, "mousemove", c), _.bind($, "mouseup", u)), R = _.add(X, "div", {
                "class": "mce-resize-helper",
                "data-mce-bogus": "all"
              }, H + " &times; " + I)
            }
            var l;
            return t ? void(i == t && s(n)) : (l = _.get("mceResizeHandle" + i), l && _.remove(l), l = _.add(X, "div", {
              id: "mceResizeHandle" + i,
              "data-mce-bogus": "all",
              "class": "mce-resizehandle",
              unselectable: !0,
              style: "cursor:" + i + "-resize; margin:0; padding:0"
            }), r.ie && (l.contentEditable = !1), _.bind(l, "mousedown", function(e) {
              e.stopImmediatePropagation(), e.preventDefault(), s(e)
            }), e.elm = l, void _.setStyles(l, {
              left: o * e[0] + P - l.offsetWidth / 2,
              top: a * e[1] + O - l.offsetHeight / 2
            }))
          }) : f(), k.setAttribute("data-mce-selected", "1")
        }

        function f() {
          var e, t;
          x(), k && k.removeAttribute("data-mce-selected");
          for (e in A) t = _.get("mceResizeHandle" + e), t && (_.unbind(t), _.remove(t))
        }

        function h(e) {
          function t(e, t) {
            if (e)
              do
                if (e === t) return !0; while (e = e.parentNode)
          }
          var n, r;
          if (!z && !s.removed) return S(_.select("img[data-mce-selected],hr[data-mce-selected]"), function(e) {
            e.removeAttribute("data-mce-selected")
          }), r = "mousedown" == e.type ? e.target : i.getNode(), r = _.$(r).closest(q ? "table" : "table,img,hr")[0], t(r, X) && (w(), n = i.getStart(!0), t(n, r) && t(i.getEnd(!0), r) && (!q || r != n && "IMG" !== n.nodeName)) ? void d(r) : void f()
        }

        function p(e, t, n) {
          e && e.attachEvent && e.attachEvent("on" + t, n)
        }

        function m(e, t, n) {
          e && e.detachEvent && e.detachEvent("on" + t, n)
        }

        function g(e) {
          var t = e.srcElement,
            n, r, i, o, a, l, c;
          n = t.getBoundingClientRect(), l = D.clientX - n.left, c = D.clientY - n.top;
          for (r in A)
            if (i = A[r], o = t.offsetWidth * i[0], a = t.offsetHeight * i[1], j(o - l) < 8 && j(a - c) < 8) {
              B = i;
              break
            }
          z = !0, s.fire("ObjectResizeStart", {
            target: k,
            width: k.clientWidth,
            height: k.clientHeight
          }), s.getDoc().selection.empty(), d(t, r, D)
        }

        function v(e) {
          e.preventDefault ? e.preventDefault() : e.returnValue = !1
        }

        function y(e) {
          return a(o(s.getBody(), e))
        }

        function b(e) {
          var t = e.srcElement;
          if (y(t)) return void v(e);
          if (t != k) {
            if (s.fire("ObjectSelected", {
                target: t
              }), C(), 0 === t.id.indexOf("mceResizeHandle")) return void(e.returnValue = !1);
            "IMG" != t.nodeName && "TABLE" != t.nodeName || (f(), k = t, p(t, "resizestart", g))
          }
        }

        function C() {
          m(k, "resizestart", g)
        }

        function x() {
          for (var e in A) {
            var t = A[e];
            t.elm && (_.unbind(t.elm), delete t.elm)
          }
        }

        function w() {
          try {
            s.getDoc().execCommand("enableObjectResizing", !1, !1)
          } catch (e) {}
        }

        function N(e) {
          var t;
          if (q) {
            t = V.body.createControlRange();
            try {
              return t.addElement(e), t.select(), !0
            } catch (n) {}
          }
        }

        function E() {
          k = T = null, q && (C(), m(X, "controlselect", b))
        }
        var _ = s.dom,
          S = t.each,
          k, T, R, A, B, D, L, M, P, O, H, I, F, z, U, W, V = s.getDoc(),
          $ = document,
          q = r.ie && r.ie < 11,
          j = Math.abs,
          Y = Math.round,
          X = s.getBody(),
          K, G;
        A = {
          nw: [0, 0, -1, -1],
          ne: [1, 0, 1, -1],
          se: [1, 1, 1, 1],
          sw: [0, 1, -1, 1]
        };
        var J = ".mce-content-body";
        return s.contentStyles.push(J + " div.mce-resizehandle {position: absolute;border: 1px solid black;box-sizing: box-sizing;background: #FFF;width: 7px;height: 7px;z-index: 10000}" + J + " .mce-resizehandle:hover {background: #000}" + J + " img[data-mce-selected]," + J + " hr[data-mce-selected] {outline: 1px solid black;resize: none}" + J + " .mce-clonedresizable {position: absolute;" + (r.gecko ? "" : "outline: 1px dashed black;") + "opacity: .5;filter: alpha(opacity=50);z-index: 10000}" + J + " .mce-resize-helper {background: #555;background: rgba(0,0,0,0.75);border-radius: 3px;border: 1px;color: white;display: none;font-family: sans-serif;font-size: 12px;white-space: nowrap;line-height: 14px;margin: 5px 10px;padding: 5px;position: absolute;z-index: 10001}"), s.on("init", function() {
          q ? (s.on("ObjectResized", function(e) {
            "TABLE" != e.target.nodeName && (f(), N(e.target))
          }), p(X, "controlselect", b), s.on("mousedown", function(e) {
            D = e
          })) : (w(), r.ie >= 11 && (s.on("mousedown click", function(e) {
            var t = e.target,
              n = t.nodeName;
            z || !/^(TABLE|IMG|HR)$/.test(n) || y(t) || (s.selection.select(t, "TABLE" == n), "mousedown" == e.type && s.nodeChanged())
          }), s.dom.bind(X, "mscontrolselect", function(e) {
            function t(e) {
              n.setEditorTimeout(s, function() {
                s.selection.select(e)
              })
            }
            return y(e.target) ? (e.preventDefault(), void t(e.target)) : void(/^(TABLE|IMG|HR)$/.test(e.target.nodeName) && (e.preventDefault(), "IMG" == e.target.tagName && t(e.target)))
          })));
          var e = n.throttle(function(e) {
            s.composing || h(e)
          });
          s.on("nodechange ResizeEditor ResizeWindow drop", e), s.on("keyup compositionend", function(t) {
            k && "TABLE" == k.nodeName && e(t)
          }), s.on("hide blur", f)
        }), s.on("remove", x), {
          isResizable: l,
          showResizeRect: d,
          hideResizeRect: f,
          updateResizeRect: h,
          controlSelect: N,
          destroy: E
        }
      }
    }), r(z, [], function() {
      function e(e) {
        return function() {
          return e
        }
      }

      function t(e) {
        return function(t) {
          return !e(t)
        }
      }

      function n(e, t) {
        return function(n) {
          return e(t(n))
        }
      }

      function r() {
        var e = a.call(arguments);
        return function(t) {
          for (var n = 0; n < e.length; n++)
            if (e[n](t)) return !0;
          return !1
        }
      }

      function i() {
        var e = a.call(arguments);
        return function(t) {
          for (var n = 0; n < e.length; n++)
            if (!e[n](t)) return !1;
          return !0
        }
      }

      function o(e) {
        var t = a.call(arguments);
        return t.length - 1 >= e.length ? e.apply(this, t.slice(1)) : function() {
          var e = t.concat([].slice.call(arguments));
          return o.apply(this, e)
        }
      }
      var a = [].slice;
      return {
        constant: e,
        negate: t,
        and: i,
        or: r,
        curry: o,
        compose: n
      }
    }), r(U, [_, p, k], function(e, t, n) {
      function r(e) {
        return m(e) ? !1 : d(e) ? !f(e.parentNode) : h(e) || u(e) || p(e) || c(e)
      }

      function i(e, t) {
        for (e = e.parentNode; e && e != t; e = e.parentNode) {
          if (c(e)) return !1;
          if (l(e)) return !0
        }
        return !0
      }

      function o(e) {
        return c(e) ? t.reduce(e.getElementsByTagName("*"), function(e, t) {
          return e || l(t)
        }, !1) !== !0 : !1
      }

      function a(e) {
        return h(e) || o(e)
      }

      function s(e, t) {
        return r(e) && i(e, t)
      }
      var l = e.isContentEditableTrue,
        c = e.isContentEditableFalse,
        u = e.isBr,
        d = e.isText,
        f = e.matchNodeNames("script style textarea"),
        h = e.matchNodeNames("img input textarea hr iframe video audio object"),
        p = e.matchNodeNames("table"),
        m = n.isCaretContainer;
      return {
        isCaretCandidate: r,
        isInEditable: i,
        isAtomic: a,
        isEditableCaretCandidate: s
      }
    }), r(W, [], function() {
      function e(e) {
        return e ? {
          left: u(e.left),
          top: u(e.top),
          bottom: u(e.bottom),
          right: u(e.right),
          width: u(e.width),
          height: u(e.height)
        } : {
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0
        }
      }

      function t(t, n) {
        return t = e(t), n ? t.right = t.left : (t.left = t.left + t.width, t.right = t.left), t.width = 0, t
      }

      function n(e, t) {
        return e.left === t.left && e.top === t.top && e.bottom === t.bottom && e.right === t.right
      }

      function r(e, t, n) {
        return e >= 0 && e <= Math.min(t.height, n.height) / 2
      }

      function i(e, t) {
        return e.bottom < t.top ? !0 : e.top > t.bottom ? !1 : r(t.top - e.bottom, e, t)
      }

      function o(e, t) {
        return e.top > t.bottom ? !0 : e.bottom < t.top ? !1 : r(t.bottom - e.top, e, t)
      }

      function a(e, t) {
        return e.left < t.left
      }

      function s(e, t) {
        return e.right > t.right
      }

      function l(e, t) {
        return i(e, t) ? -1 : o(e, t) ? 1 : a(e, t) ? -1 : s(e, t) ? 1 : 0
      }

      function c(e, t, n) {
        return t >= e.left && t <= e.right && n >= e.top && n <= e.bottom
      }
      var u = Math.round;
      return {
        clone: e,
        collapse: t,
        isEqual: n,
        isAbove: i,
        isBelow: o,
        isLeft: a,
        isRight: s,
        compare: l,
        containsXY: c
      }
    }), r(V, [], function() {
      function e(e) {
        return "string" == typeof e && e.charCodeAt(0) >= 768 && t.test(e)
      }
      var t = new RegExp("[\u0300-\u036f\u0483-\u0487\u0488-\u0489\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7-\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e3-\u0902\u093a\u093c\u0941-\u0948\u094d\u0951-\u0957\u0962-\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2-\u09e3\u0a01-\u0a02\u0a3c\u0a41-\u0a42\u0a47-\u0a48\u0a4b-\u0a4d\u0a51\u0a70-\u0a71\u0a75\u0a81-\u0a82\u0abc\u0ac1-\u0ac5\u0ac7-\u0ac8\u0acd\u0ae2-\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62-\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c00\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56\u0c62-\u0c63\u0c81\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc-\u0ccd\u0cd5-\u0cd6\u0ce2-\u0ce3\u0d01\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62-\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb-\u0ebc\u0ec8-\u0ecd\u0f18-\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86-\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039-\u103a\u103d-\u103e\u1058-\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108d\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17b4-\u17b5\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193b\u1a17-\u1a18\u1a1b\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1ab0-\u1abd\u1abe\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80-\u1b81\u1ba2-\u1ba5\u1ba8-\u1ba9\u1bab-\u1bad\u1be6\u1be8-\u1be9\u1bed\u1bef-\u1bf1\u1c2c-\u1c33\u1c36-\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1cf4\u1cf8-\u1cf9\u1dc0-\u1df5\u1dfc-\u1dff\u200c-\u200d\u20d0-\u20dc\u20dd-\u20e0\u20e1\u20e2-\u20e4\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302d\u302e-\u302f\u3099-\u309a\ua66f\ua670-\ua672\ua674-\ua67d\ua69e-\ua69f\ua6f0-\ua6f1\ua802\ua806\ua80b\ua825-\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\ua9e5\uaa29-\uaa2e\uaa31-\uaa32\uaa35-\uaa36\uaa43\uaa4c\uaa7c\uaab0\uaab2-\uaab4\uaab7-\uaab8\uaabe-\uaabf\uaac1\uaaec-\uaaed\uaaf6\uabe5\uabe8\uabed\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\uff9e-\uff9f]");
      return {
        isExtendingChar: e
      }
    }), r($, [z, _, w, T, U, W, V], function(e, t, n, r, i, o, a) {
        function s(e) {
          return "createRange" in e ? e.createRange() : n.DOM.createRng()
        }

        function l(e) {
          return e && /[\r\n\t ]/.test(e)
        }

        function c(e) {
          var t = e.startContainer,
            n = e.startOffset,
            r;
          return !!(l(e.toString()) && v(t.parentNode) && (r = t.data, l(r[n - 1]) || l(r[n + 1])))
        }

        function u(e) {
          function t(e) {
            var t = e.ownerDocument,
              n = s(t),
              r = t.createTextNode("\xa0"),
              i = e.parentNode,
              a;
            return i.insertBefore(r, e), n.setStart(r, 0), n.setEnd(r, 1), a = o.clone(n.getBou