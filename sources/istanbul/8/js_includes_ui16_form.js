/*! RESOURCE: /scripts/js_includes_ui16_form.js */
/*! RESOURCE: /scripts/angular_includes_1.4.js */
/*! RESOURCE: /scripts/angular_1.4.8/angular.min.js */
/*
 AngularJS v1.4.8
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(S, X, u) {
  'use strict';

  function G(a) {
    return function() {
      var b = arguments[0],
        d;
      d = "[" + (a ? a + ":" : "") + b + "] http://errors.angularjs.org/1.4.8/" + (a ? a + "/" : "") + b;
      for (b = 1; b < arguments.length; b++) {
        d = d + (1 == b ? "?" : "&") + "p" + (b - 1) + "=";
        var c = encodeURIComponent,
          e;
        e = arguments[b];
        e = "function" == typeof e ? e.toString().replace(/ \{[\s\S]*$/, "") : "undefined" == typeof e ? "undefined" : "string" != typeof e ? JSON.stringify(e) : e;
        d += c(e)
      }
      return Error(d)
    }
  }

  function za(a) {
    if (null == a || Xa(a)) return !1;
    if (I(a) || E(a) || B && a instanceof B) return !0;
    var b = "length" in Object(a) && a.length;
    return Q(b) && (0 <= b && b - 1 in a || "function" == typeof a.item)
  }

  function n(a, b, d) {
    var c, e;
    if (a)
      if (z(a))
        for (c in a) "prototype" == c || "length" == c || "name" == c || a.hasOwnProperty && !a.hasOwnProperty(c) || b.call(d, a[c], c, a);
      else if (I(a) || za(a)) {
      var f = "object" !== typeof a;
      c = 0;
      for (e = a.length; c < e; c++)(f || c in a) && b.call(d, a[c], c, a)
    } else if (a.forEach && a.forEach !== n) a.forEach(b, d, a);
    else if (nc(a))
      for (c in a) b.call(d, a[c], c, a);
    else if ("function" === typeof a.hasOwnProperty)
      for (c in a) a.hasOwnProperty(c) &&
        b.call(d, a[c], c, a);
    else
      for (c in a) qa.call(a, c) && b.call(d, a[c], c, a);
    return a
  }

  function oc(a, b, d) {
    for (var c = Object.keys(a).sort(), e = 0; e < c.length; e++) b.call(d, a[c[e]], c[e]);
    return c
  }

  function pc(a) {
    return function(b, d) {
      a(d, b)
    }
  }

  function Td() {
    return ++nb
  }

  function Mb(a, b, d) {
    for (var c = a.$$hashKey, e = 0, f = b.length; e < f; ++e) {
      var g = b[e];
      if (H(g) || z(g))
        for (var h = Object.keys(g), k = 0, l = h.length; k < l; k++) {
          var m = h[k],
            r = g[m];
          d && H(r) ? da(r) ? a[m] = new Date(r.valueOf()) : Ma(r) ? a[m] = new RegExp(r) : r.nodeName ? a[m] = r.cloneNode(!0) :
            Nb(r) ? a[m] = r.clone() : (H(a[m]) || (a[m] = I(r) ? [] : {}), Mb(a[m], [r], !0)) : a[m] = r
        }
    }
    c ? a.$$hashKey = c : delete a.$$hashKey;
    return a
  }

  function M(a) {
    return Mb(a, ra.call(arguments, 1), !1)
  }

  function Ud(a) {
    return Mb(a, ra.call(arguments, 1), !0)
  }

  function ea(a) {
    return parseInt(a, 10)
  }

  function Ob(a, b) {
    return M(Object.create(a), b)
  }

  function x() {}

  function Ya(a) {
    return a
  }

  function na(a) {
    return function() {
      return a
    }
  }

  function qc(a) {
    return z(a.toString) && a.toString !== sa
  }

  function q(a) {
    return "undefined" === typeof a
  }

  function y(a) {
    return "undefined" !==
      typeof a
  }

  function H(a) {
    return null !== a && "object" === typeof a
  }

  function nc(a) {
    return null !== a && "object" === typeof a && !rc(a)
  }

  function E(a) {
    return "string" === typeof a
  }

  function Q(a) {
    return "number" === typeof a
  }

  function da(a) {
    return "[object Date]" === sa.call(a)
  }

  function z(a) {
    return "function" === typeof a
  }

  function Ma(a) {
    return "[object RegExp]" === sa.call(a)
  }

  function Xa(a) {
    return a && a.window === a
  }

  function Za(a) {
    return a && a.$evalAsync && a.$watch
  }

  function $a(a) {
    return "boolean" === typeof a
  }

  function sc(a) {
    return a && Q(a.length) &&
      Vd.test(sa.call(a))
  }

  function Nb(a) {
    return !(!a || !(a.nodeName || a.prop && a.attr && a.find))
  }

  function Wd(a) {
    var b = {};
    a = a.split(",");
    var d;
    for (d = 0; d < a.length; d++) b[a[d]] = !0;
    return b
  }

  function ta(a) {
    return F(a.nodeName || a[0] && a[0].nodeName)
  }

  function ab(a, b) {
    var d = a.indexOf(b);
    0 <= d && a.splice(d, 1);
    return d
  }

  function bb(a, b) {
    function d(a, b) {
      var d = b.$$hashKey,
        e;
      if (I(a)) {
        e = 0;
        for (var f = a.length; e < f; e++) b.push(c(a[e]))
      } else if (nc(a))
        for (e in a) b[e] = c(a[e]);
      else if (a && "function" === typeof a.hasOwnProperty)
        for (e in a) a.hasOwnProperty(e) &&
          (b[e] = c(a[e]));
      else
        for (e in a) qa.call(a, e) && (b[e] = c(a[e]));
      d ? b.$$hashKey = d : delete b.$$hashKey;
      return b
    }

    function c(a) {
      if (!H(a)) return a;
      var b = e.indexOf(a);
      if (-1 !== b) return f[b];
      if (Xa(a) || Za(a)) throw Aa("cpws");
      var b = !1,
        c;
      I(a) ? (c = [], b = !0) : sc(a) ? c = new a.constructor(a) : da(a) ? c = new Date(a.getTime()) : Ma(a) ? (c = new RegExp(a.source, a.toString().match(/[^\/]*$/)[0]), c.lastIndex = a.lastIndex) : z(a.cloneNode) ? c = a.cloneNode(!0) : (c = Object.create(rc(a)), b = !0);
      e.push(a);
      f.push(c);
      return b ? d(a, c) : c
    }
    var e = [],
      f = [];
    if (b) {
      if (sc(b)) throw Aa("cpta");
      if (a === b) throw Aa("cpi");
      I(b) ? b.length = 0 : n(b, function(a, c) {
        "$$hashKey" !== c && delete b[c]
      });
      e.push(a);
      f.push(b);
      return d(a, b)
    }
    return c(a)
  }

  function ia(a, b) {
    if (I(a)) {
      b = b || [];
      for (var d = 0, c = a.length; d < c; d++) b[d] = a[d]
    } else if (H(a))
      for (d in b = b || {}, a)
        if ("$" !== d.charAt(0) || "$" !== d.charAt(1)) b[d] = a[d];
    return b || a
  }

  function ma(a, b) {
    if (a === b) return !0;
    if (null === a || null === b) return !1;
    if (a !== a && b !== b) return !0;
    var d = typeof a,
      c;
    if (d == typeof b && "object" == d)
      if (I(a)) {
        if (!I(b)) return !1;
        if ((d = a.length) == b.length) {
          for (c =
            0; c < d; c++)
            if (!ma(a[c], b[c])) return !1;
          return !0
        }
      } else {
        if (da(a)) return da(b) ? ma(a.getTime(), b.getTime()) : !1;
        if (Ma(a)) return Ma(b) ? a.toString() == b.toString() : !1;
        if (Za(a) || Za(b) || Xa(a) || Xa(b) || I(b) || da(b) || Ma(b)) return !1;
        d = $();
        for (c in a)
          if ("$" !== c.charAt(0) && !z(a[c])) {
            if (!ma(a[c], b[c])) return !1;
            d[c] = !0
          }
        for (c in b)
          if (!(c in d) && "$" !== c.charAt(0) && y(b[c]) && !z(b[c])) return !1;
        return !0
      }
    return !1
  }

  function cb(a, b, d) {
    return a.concat(ra.call(b, d))
  }

  function tc(a, b) {
    var d = 2 < arguments.length ? ra.call(arguments, 2) : [];
    return !z(b) || b instanceof RegExp ? b : d.length ? function() {
      return arguments.length ? b.apply(a, cb(d, arguments, 0)) : b.apply(a, d)
    } : function() {
      return arguments.length ? b.apply(a, arguments) : b.call(a)
    }
  }

  function Xd(a, b) {
    var d = b;
    "string" === typeof a && "$" === a.charAt(0) && "$" === a.charAt(1) ? d = u : Xa(b) ? d = "$WINDOW" : b && X === b ? d = "$DOCUMENT" : Za(b) && (d = "$SCOPE");
    return d
  }

  function db(a, b) {
    if ("undefined" === typeof a) return u;
    Q(b) || (b = b ? 2 : null);
    return JSON.stringify(a, Xd, b)
  }

  function uc(a) {
    return E(a) ? JSON.parse(a) : a
  }

  function vc(a,
    b) {
    var d = Date.parse("Jan 01, 1970 00:00:00 " + a) / 6E4;
    return isNaN(d) ? b : d
  }

  function Pb(a, b, d) {
    d = d ? -1 : 1;
    var c = vc(b, a.getTimezoneOffset());
    b = a;
    a = d * (c - a.getTimezoneOffset());
    b = new Date(b.getTime());
    b.setMinutes(b.getMinutes() + a);
    return b
  }

  function ua(a) {
    a = B(a).clone();
    try {
      a.empty()
    } catch (b) {}
    var d = B("<div>").append(a).html();
    try {
      return a[0].nodeType === Na ? F(d) : d.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/, function(a, b) {
        return "<" + F(b)
      })
    } catch (c) {
      return F(d)
    }
  }

  function wc(a) {
    try {
      return decodeURIComponent(a)
    } catch (b) {}
  }

  function xc(a) {
    var b = {};
    n((a || "").split("&"), function(a) {
      var c, e, f;
      a && (e = a = a.replace(/\+/g, "%20"), c = a.indexOf("="), -1 !== c && (e = a.substring(0, c), f = a.substring(c + 1)), e = wc(e), y(e) && (f = y(f) ? wc(f) : !0, qa.call(b, e) ? I(b[e]) ? b[e].push(f) : b[e] = [b[e], f] : b[e] = f))
    });
    return b
  }

  function Qb(a) {
    var b = [];
    n(a, function(a, c) {
      I(a) ? n(a, function(a) {
        b.push(ja(c, !0) + (!0 === a ? "" : "=" + ja(a, !0)))
      }) : b.push(ja(c, !0) + (!0 === a ? "" : "=" + ja(a, !0)))
    });
    return b.length ? b.join("&") : ""
  }

  function ob(a) {
    return ja(a, !0).replace(/%26/gi, "&").replace(/%3D/gi,
      "=").replace(/%2B/gi, "+")
  }

  function ja(a, b) {
    return encodeURIComponent(a).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%3B/gi, ";").replace(/%20/g, b ? "%20" : "+")
  }

  function Yd(a, b) {
    var d, c, e = Oa.length;
    for (c = 0; c < e; ++c)
      if (d = Oa[c] + b, E(d = a.getAttribute(d))) return d;
    return null
  }

  function Zd(a, b) {
    var d, c, e = {};
    n(Oa, function(b) {
      b += "app";
      !d && a.hasAttribute && a.hasAttribute(b) && (d = a, c = a.getAttribute(b))
    });
    n(Oa, function(b) {
      b += "app";
      var e;
      !d && (e = a.querySelector("[" + b.replace(":",
        "\\:") + "]")) && (d = e, c = e.getAttribute(b))
    });
    d && (e.strictDi = null !== Yd(d, "strict-di"), b(d, c ? [c] : [], e))
  }

  function yc(a, b, d) {
    H(d) || (d = {});
    d = M({
      strictDi: !1
    }, d);
    var c = function() {
        a = B(a);
        if (a.injector()) {
          var c = a[0] === X ? "document" : ua(a);
          throw Aa("btstrpd", c.replace(/</, "&lt;").replace(/>/, "&gt;"));
        }
        b = b || [];
        b.unshift(["$provide", function(b) {
          b.value("$rootElement", a)
        }]);
        d.debugInfoEnabled && b.push(["$compileProvider", function(a) {
          a.debugInfoEnabled(!0)
        }]);
        b.unshift("ng");
        c = eb(b, d.strictDi);
        c.invoke(["$rootScope",
          "$rootElement", "$compile", "$injector",
          function(a, b, c, d) {
            a.$apply(function() {
              b.data("$injector", d);
              c(b)(a)
            })
          }
        ]);
        return c
      },
      e = /^NG_ENABLE_DEBUG_INFO!/,
      f = /^NG_DEFER_BOOTSTRAP!/;
    S && e.test(S.name) && (d.debugInfoEnabled = !0, S.name = S.name.replace(e, ""));
    if (S && !f.test(S.name)) return c();
    S.name = S.name.replace(f, "");
    fa.resumeBootstrap = function(a) {
      n(a, function(a) {
        b.push(a)
      });
      return c()
    };
    z(fa.resumeDeferredBootstrap) && fa.resumeDeferredBootstrap()
  }

  function $d() {
    S.name = "NG_ENABLE_DEBUG_INFO!" + S.name;
    S.location.reload()
  }

  function ae(a) {
    a = fa.element(a).injector();
    if (!a) throw Aa("test");
    return a.get("$$testability")
  }

  function zc(a, b) {
    b = b || "_";
    return a.replace(be, function(a, c) {
      return (c ? b : "") + a.toLowerCase()
    })
  }

  function ce() {
    var a;
    if (!Ac) {
      var b = pb();
      (oa = q(b) ? S.jQuery : b ? S[b] : u) && oa.fn.on ? (B = oa, M(oa.fn, {
        scope: Pa.scope,
        isolateScope: Pa.isolateScope,
        controller: Pa.controller,
        injector: Pa.injector,
        inheritedData: Pa.inheritedData
      }), a = oa.cleanData, oa.cleanData = function(b) {
        var c;
        if (Rb) Rb = !1;
        else
          for (var e = 0, f; null != (f = b[e]); e++)(c =
            oa._data(f, "events")) && c.$destroy && oa(f).triggerHandler("$destroy");
        a(b)
      }) : B = N;
      fa.element = B;
      Ac = !0
    }
  }

  function qb(a, b, d) {
    if (!a) throw Aa("areq", b || "?", d || "required");
    return a
  }

  function Qa(a, b, d) {
    d && I(a) && (a = a[a.length - 1]);
    qb(z(a), b, "not a function, got " + (a && "object" === typeof a ? a.constructor.name || "Object" : typeof a));
    return a
  }

  function Ra(a, b) {
    if ("hasOwnProperty" === a) throw Aa("badname", b);
  }

  function Bc(a, b, d) {
    if (!b) return a;
    b = b.split(".");
    for (var c, e = a, f = b.length, g = 0; g < f; g++) c = b[g], a && (a = (e = a)[c]);
    return !d &&
      z(a) ? tc(e, a) : a
  }

  function rb(a) {
    for (var b = a[0], d = a[a.length - 1], c, e = 1; b !== d && (b = b.nextSibling); e++)
      if (c || a[e] !== b) c || (c = B(ra.call(a, 0, e))), c.push(b);
    return c || a
  }

  function $() {
    return Object.create(null)
  }

  function de(a) {
    function b(a, b, c) {
      return a[b] || (a[b] = c())
    }
    var d = G("$injector"),
      c = G("ng");
    a = b(a, "angular", Object);
    a.$$minErr = a.$$minErr || G;
    return b(a, "module", function() {
      var a = {};
      return function(f, g, h) {
        if ("hasOwnProperty" === f) throw c("badname", "module");
        g && a.hasOwnProperty(f) && (a[f] = null);
        return b(a, f, function() {
          function a(b,
            d, e, f) {
            f || (f = c);
            return function() {
              f[e || "push"]([b, d, arguments]);
              return v
            }
          }

          function b(a, d) {
            return function(b, e) {
              e && z(e) && (e.$$moduleName = f);
              c.push([a, d, arguments]);
              return v
            }
          }
          if (!g) throw d("nomod", f);
          var c = [],
            e = [],
            t = [],
            A = a("$injector", "invoke", "push", e),
            v = {
              _invokeQueue: c,
              _configBlocks: e,
              _runBlocks: t,
              requires: g,
              name: f,
              provider: b("$provide", "provider"),
              factory: b("$provide", "factory"),
              service: b("$provide", "service"),
              value: a("$provide", "value"),
              constant: a("$provide", "constant", "unshift"),
              decorator: b("$provide",
                "decorator"),
              animation: b("$animateProvider", "register"),
              filter: b("$filterProvider", "register"),
              controller: b("$controllerProvider", "register"),
              directive: b("$compileProvider", "directive"),
              config: A,
              run: function(a) {
                t.push(a);
                return this
              }
            };
          h && A(h);
          return v
        })
      }
    })
  }

  function ee(a) {
    M(a, {
      bootstrap: yc,
      copy: bb,
      extend: M,
      merge: Ud,
      equals: ma,
      element: B,
      forEach: n,
      injector: eb,
      noop: x,
      bind: tc,
      toJson: db,
      fromJson: uc,
      identity: Ya,
      isUndefined: q,
      isDefined: y,
      isString: E,
      isFunction: z,
      isObject: H,
      isNumber: Q,
      isElement: Nb,
      isArray: I,
      version: fe,
      isDate: da,
      lowercase: F,
      uppercase: sb,
      callbacks: {
        counter: 0
      },
      getTestability: ae,
      $$minErr: G,
      $$csp: Ba,
      reloadWithDebugInfo: $d
    });
    Sb = de(S);
    Sb("ng", ["ngLocale"], ["$provide", function(a) {
      a.provider({
        $$sanitizeUri: ge
      });
      a.provider("$compile", Cc).directive({
        a: he,
        input: Dc,
        textarea: Dc,
        form: ie,
        script: je,
        select: ke,
        style: le,
        option: me,
        ngBind: ne,
        ngBindHtml: oe,
        ngBindTemplate: pe,
        ngClass: qe,
        ngClassEven: re,
        ngClassOdd: se,
        ngCloak: te,
        ngController: ue,
        ngForm: ve,
        ngHide: we,
        ngIf: xe,
        ngInclude: ye,
        ngInit: ze,
        ngNonBindable: Ae,
        ngPluralize: Be,
        ngRepeat: Ce,
        ngShow: De,
        ngStyle: Ee,
        ngSwitch: Fe,
        ngSwitchWhen: Ge,
        ngSwitchDefault: He,
        ngOptions: Ie,
        ngTransclude: Je,
        ngModel: Ke,
        ngList: Le,
        ngChange: Me,
        pattern: Ec,
        ngPattern: Ec,
        required: Fc,
        ngRequired: Fc,
        minlength: Gc,
        ngMinlength: Gc,
        maxlength: Hc,
        ngMaxlength: Hc,
        ngValue: Ne,
        ngModelOptions: Oe
      }).directive({
        ngInclude: Pe
      }).directive(tb).directive(Ic);
      a.provider({
        $anchorScroll: Qe,
        $animate: Re,
        $animateCss: Se,
        $$animateQueue: Te,
        $$AnimateRunner: Ue,
        $browser: Ve,
        $cacheFactory: We,
        $controller: Xe,
        $document: Ye,
        $exceptionHandler: Ze,
        $filter: Jc,
        $$forceReflow: $e,
        $interpolate: af,
        $interval: bf,
        $http: cf,
        $httpParamSerializer: df,
        $httpParamSerializerJQLike: ef,
        $httpBackend: ff,
        $xhrFactory: gf,
        $location: hf,
        $log: jf,
        $parse: kf,
        $rootScope: lf,
        $q: mf,
        $$q: nf,
        $sce: of ,
        $sceDelegate: pf,
        $sniffer: qf,
        $templateCache: rf,
        $templateRequest: sf,
        $$testability: tf,
        $timeout: uf,
        $window: vf,
        $$rAF: wf,
        $$jqLite: xf,
        $$HashMap: yf,
        $$cookieReader: zf
      })
    }])
  }

  function fb(a) {
    return a.replace(Af, function(a, d, c, e) {
      return e ? c.toUpperCase() : c
    }).replace(Bf, "Moz$1")
  }

  function Kc(a) {
    a = a.nodeType;
    return 1 === a || !a || 9 === a
  }

  function Lc(a, b) {
    var d, c, e = b.createDocumentFragment(),
      f = [];
    if (Tb.test(a)) {
      d = d || e.appendChild(b.createElement("div"));
      c = (Cf.exec(a) || ["", ""])[1].toLowerCase();
      c = ka[c] || ka._default;
      d.innerHTML = c[1] + a.replace(Df, "<$1></$2>") + c[2];
      for (c = c[0]; c--;) d = d.lastChild;
      f = cb(f, d.childNodes);
      d = e.firstChild;
      d.textContent = ""
    } else f.push(b.createTextNode(a));
    e.textContent = "";
    e.innerHTML = "";
    n(f, function(a) {
      e.appendChild(a)
    });
    return e
  }

  function N(a) {
    if (a instanceof N) return a;
    var b;
    E(a) && (a = U(a),
      b = !0);
    if (!(this instanceof N)) {
      if (b && "<" != a.charAt(0)) throw Ub("nosel");
      return new N(a)
    }
    if (b) {
      b = X;
      var d;
      a = (d = Ef.exec(a)) ? [b.createElement(d[1])] : (d = Lc(a, b)) ? d.childNodes : []
    }
    Mc(this, a)
  }

  function Vb(a) {
    return a.cloneNode(!0)
  }

  function ub(a, b) {
    b || vb(a);
    if (a.querySelectorAll)
      for (var d = a.querySelectorAll("*"), c = 0, e = d.length; c < e; c++) vb(d[c])
  }

  function Nc(a, b, d, c) {
    if (y(c)) throw Ub("offargs");
    var e = (c = wb(a)) && c.events,
      f = c && c.handle;
    if (f)
      if (b) {
        var g = function(b) {
          var c = e[b];
          y(d) && ab(c || [], d);
          y(d) && c && 0 < c.length ||
            (a.removeEventListener(b, f, !1), delete e[b])
        };
        n(b.split(" "), function(a) {
          g(a);
          xb[a] && g(xb[a])
        })
      } else
        for (b in e) "$destroy" !== b && a.removeEventListener(b, f, !1), delete e[b]
  }

  function vb(a, b) {
    var d = a.ng339,
      c = d && gb[d];
    c && (b ? delete c.data[b] : (c.handle && (c.events.$destroy && c.handle({}, "$destroy"), Nc(a)), delete gb[d], a.ng339 = u))
  }

  function wb(a, b) {
    var d = a.ng339,
      d = d && gb[d];
    b && !d && (a.ng339 = d = ++Ff, d = gb[d] = {
      events: {},
      data: {},
      handle: u
    });
    return d
  }

  function Wb(a, b, d) {
    if (Kc(a)) {
      var c = y(d),
        e = !c && b && !H(b),
        f = !b;
      a = (a = wb(a, !e)) && a.data;
      if (c) a[b] = d;
      else {
        if (f) return a;
        if (e) return a && a[b];
        M(a, b)
      }
    }
  }

  function yb(a, b) {
    return a.getAttribute ? -1 < (" " + (a.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").indexOf(" " + b + " ") : !1
  }

  function zb(a, b) {
    b && a.setAttribute && n(b.split(" "), function(b) {
      a.setAttribute("class", U((" " + (a.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").replace(" " + U(b) + " ", " ")))
    })
  }

  function Ab(a, b) {
    if (b && a.setAttribute) {
      var d = (" " + (a.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ");
      n(b.split(" "),
        function(a) {
          a = U(a); - 1 === d.indexOf(" " + a + " ") && (d += a + " ")
        });
      a.setAttribute("class", U(d))
    }
  }

  function Mc(a, b) {
    if (b)
      if (b.nodeType) a[a.length++] = b;
      else {
        var d = b.length;
        if ("number" === typeof d && b.window !== b) {
          if (d)
            for (var c = 0; c < d; c++) a[a.length++] = b[c]
        } else a[a.length++] = b
      }
  }

  function Oc(a, b) {
    return Bb(a, "$" + (b || "ngController") + "Controller")
  }

  function Bb(a, b, d) {
    9 == a.nodeType && (a = a.documentElement);
    for (b = I(b) ? b : [b]; a;) {
      for (var c = 0, e = b.length; c < e; c++)
        if (y(d = B.data(a, b[c]))) return d;
      a = a.parentNode || 11 === a.nodeType &&
        a.host
    }
  }

  function Pc(a) {
    for (ub(a, !0); a.firstChild;) a.removeChild(a.firstChild)
  }

  function Xb(a, b) {
    b || ub(a);
    var d = a.parentNode;
    d && d.removeChild(a)
  }

  function Gf(a, b) {
    b = b || S;
    if ("complete" === b.document.readyState) b.setTimeout(a);
    else B(b).on("load", a)
  }

  function Qc(a, b) {
    var d = Cb[b.toLowerCase()];
    return d && Rc[ta(a)] && d
  }

  function Hf(a, b) {
    var d = function(c, d) {
      c.isDefaultPrevented = function() {
        return c.defaultPrevented
      };
      var f = b[d || c.type],
        g = f ? f.length : 0;
      if (g) {
        if (q(c.immediatePropagationStopped)) {
          var h = c.stopImmediatePropagation;
          c.stopImmediatePropagation = function() {
            c.immediatePropagationStopped = !0;
            c.stopPropagation && c.stopPropagation();
            h && h.call(c)
          }
        }
        c.isImmediatePropagationStopped = function() {
          return !0 === c.immediatePropagationStopped
        };
        var k = f.specialHandlerWrapper || If;
        1 < g && (f = ia(f));
        for (var l = 0; l < g; l++) c.isImmediatePropagationStopped() || k(a, c, f[l])
      }
    };
    d.elem = a;
    return d
  }

  function If(a, b, d) {
    d.call(a, b)
  }

  function Jf(a, b, d) {
    var c = b.relatedTarget;
    c && (c === a || Kf.call(a, c)) || d.call(a, b)
  }

  function xf() {
    this.$get = function() {
      return M(N, {
        hasClass: function(a, b) {
          a.attr && (a = a[0]);
          return yb(a, b)
        },
        addClass: function(a, b) {
          a.attr && (a = a[0]);
          return Ab(a, b)
        },
        removeClass: function(a, b) {
          a.attr && (a = a[0]);
          return zb(a, b)
        }
      })
    }
  }

  function Ca(a, b) {
    var d = a && a.$$hashKey;
    if (d) return "function" === typeof d && (d = a.$$hashKey()), d;
    d = typeof a;
    return d = "function" == d || "object" == d && null !== a ? a.$$hashKey = d + ":" + (b || Td)() : d + ":" + a
  }

  function Sa(a, b) {
    if (b) {
      var d = 0;
      this.nextUid = function() {
        return ++d
      }
    }
    n(a, this.put, this)
  }

  function Lf(a) {
    return (a = a.toString().replace(Sc, "").match(Tc)) ?
      "function(" + (a[1] || "").replace(/[\s\r\n]+/, " ") + ")" : "fn"
  }

  function eb(a, b) {
    function d(a) {
      return function(b, c) {
        if (H(b)) n(b, pc(a));
        else return a(b, c)
      }
    }

    function c(a, b) {
      Ra(a, "service");
      if (z(b) || I(b)) b = t.instantiate(b);
      if (!b.$get) throw Da("pget", a);
      return r[a + "Provider"] = b
    }

    function e(a, b) {
      return function() {
        var c = v.invoke(b, this);
        if (q(c)) throw Da("undef", a);
        return c
      }
    }

    function f(a, b, d) {
      return c(a, {
        $get: !1 !== d ? e(a, b) : b
      })
    }

    function g(a) {
      qb(q(a) || I(a), "modulesToLoad", "not an array");
      var b = [],
        c;
      n(a, function(a) {
        function d(a) {
          var b,
            c;
          b = 0;
          for (c = a.length; b < c; b++) {
            var e = a[b],
              f = t.get(e[0]);
            f[e[1]].apply(f, e[2])
          }
        }
        if (!m.get(a)) {
          m.put(a, !0);
          try {
            E(a) ? (c = Sb(a), b = b.concat(g(c.requires)).concat(c._runBlocks), d(c._invokeQueue), d(c._configBlocks)) : z(a) ? b.push(t.invoke(a)) : I(a) ? b.push(t.invoke(a)) : Qa(a, "module")
          } catch (e) {
            throw I(a) && (a = a[a.length - 1]), e.message && e.stack && -1 == e.stack.indexOf(e.message) && (e = e.message + "\n" + e.stack), Da("modulerr", a, e.stack || e.message || e);
          }
        }
      });
      return b
    }

    function h(a, c) {
      function d(b, e) {
        if (a.hasOwnProperty(b)) {
          if (a[b] ===
            k) throw Da("cdep", b + " <- " + l.join(" <- "));
          return a[b]
        }
        try {
          return l.unshift(b), a[b] = k, a[b] = c(b, e)
        } catch (f) {
          throw a[b] === k && delete a[b], f;
        } finally {
          l.shift()
        }
      }

      function e(a, c, f, g) {
        "string" === typeof f && (g = f, f = null);
        var h = [],
          k = eb.$$annotate(a, b, g),
          l, m, t;
        m = 0;
        for (l = k.length; m < l; m++) {
          t = k[m];
          if ("string" !== typeof t) throw Da("itkn", t);
          h.push(f && f.hasOwnProperty(t) ? f[t] : d(t, g))
        }
        I(a) && (a = a[l]);
        return a.apply(c, h)
      }
      return {
        invoke: e,
        instantiate: function(a, b, c) {
          var d = Object.create((I(a) ? a[a.length - 1] : a).prototype ||
            null);
          a = e(a, d, b, c);
          return H(a) || z(a) ? a : d
        },
        get: d,
        annotate: eb.$$annotate,
        has: function(b) {
          return r.hasOwnProperty(b + "Provider") || a.hasOwnProperty(b)
        }
      }
    }
    b = !0 === b;
    var k = {},
      l = [],
      m = new Sa([], !0),
      r = {
        $provide: {
          provider: d(c),
          factory: d(f),
          service: d(function(a, b) {
            return f(a, ["$injector", function(a) {
              return a.instantiate(b)
            }])
          }),
          value: d(function(a, b) {
            return f(a, na(b), !1)
          }),
          constant: d(function(a, b) {
            Ra(a, "constant");
            r[a] = b;
            A[a] = b
          }),
          decorator: function(a, b) {
            var c = t.get(a + "Provider"),
              d = c.$get;
            c.$get = function() {
              var a =
                v.invoke(d, c);
              return v.invoke(b, null, {
                $delegate: a
              })
            }
          }
        }
      },
      t = r.$injector = h(r, function(a, b) {
        fa.isString(b) && l.push(b);
        throw Da("unpr", l.join(" <- "));
      }),
      A = {},
      v = A.$injector = h(A, function(a, b) {
        var c = t.get(a + "Provider", b);
        return v.invoke(c.$get, c, u, a)
      });
    n(g(a), function(a) {
      a && v.invoke(a)
    });
    return v
  }

  function Qe() {
    var a = !0;
    this.disableAutoScrolling = function() {
      a = !1
    };
    this.$get = ["$window", "$location", "$rootScope", function(b, d, c) {
      function e(a) {
        var b = null;
        Array.prototype.some.call(a, function(a) {
          if ("a" === ta(a)) return b =
            a, !0
        });
        return b
      }

      function f(a) {
        if (a) {
          a.scrollIntoView();
          var c;
          c = g.yOffset;
          z(c) ? c = c() : Nb(c) ? (c = c[0], c = "fixed" !== b.getComputedStyle(c).position ? 0 : c.getBoundingClientRect().bottom) : Q(c) || (c = 0);
          c && (a = a.getBoundingClientRect().top, b.scrollBy(0, a - c))
        } else b.scrollTo(0, 0)
      }

      function g(a) {
        a = E(a) ? a : d.hash();
        var b;
        a ? (b = h.getElementById(a)) ? f(b) : (b = e(h.getElementsByName(a))) ? f(b) : "top" === a && f(null) : f(null)
      }
      var h = b.document;
      a && c.$watch(function() {
        return d.hash()
      }, function(a, b) {
        a === b && "" === a || Gf(function() {
          c.$evalAsync(g)
        })
      });
      return g
    }]
  }

  function hb(a, b) {
    if (!a && !b) return "";
    if (!a) return b;
    if (!b) return a;
    I(a) && (a = a.join(" "));
    I(b) && (b = b.join(" "));
    return a + " " + b
  }

  function Mf(a) {
    E(a) && (a = a.split(" "));
    var b = $();
    n(a, function(a) {
      a.length && (b[a] = !0)
    });
    return b
  }

  function Ea(a) {
    return H(a) ? a : {}
  }

  function Nf(a, b, d, c) {
    function e(a) {
      try {
        a.apply(null, ra.call(arguments, 1))
      } finally {
        if (v--, 0 === v)
          for (; T.length;) try {
            T.pop()()
          } catch (b) {
            d.error(b)
          }
      }
    }

    function f() {
      L = null;
      g();
      h()
    }

    function g() {
      a: {
        try {
          p = m.state;
          break a
        } catch (a) {}
        p = void 0
      }
      p = q(p) ?
      null : p;ma(p, J) && (p = J);J = p
    }

    function h() {
      if (w !== k.url() || C !== p) w = k.url(), C = p, n(aa, function(a) {
        a(k.url(), p)
      })
    }
    var k = this,
      l = a.location,
      m = a.history,
      r = a.setTimeout,
      t = a.clearTimeout,
      A = {};
    k.isMock = !1;
    var v = 0,
      T = [];
    k.$$completeOutstandingRequest = e;
    k.$$incOutstandingRequestCount = function() {
      v++
    };
    k.notifyWhenNoOutstandingRequests = function(a) {
      0 === v ? a() : T.push(a)
    };
    var p, C, w = l.href,
      ga = b.find("base"),
      L = null;
    g();
    C = p;
    k.url = function(b, d, e) {
      q(e) && (e = null);
      l !== a.location && (l = a.location);
      m !== a.history && (m = a.history);
      if (b) {
        var f =
          C === e;
        if (w === b && (!c.history || f)) return k;
        var h = w && Fa(w) === Fa(b);
        w = b;
        C = e;
        if (!c.history || h && f) {
          if (!h || L) L = b;
          d ? l.replace(b) : h ? (d = l, e = b.indexOf("#"), e = -1 === e ? "" : b.substr(e), d.hash = e) : l.href = b;
          l.href !== b && (L = b)
        } else m[d ? "replaceState" : "pushState"](e, "", b), g(), C = p;
        return k
      }
      return L || l.href.replace(/%27/g, "'")
    };
    k.state = function() {
      return p
    };
    var aa = [],
      D = !1,
      J = null;
    k.onUrlChange = function(b) {
      if (!D) {
        if (c.history) B(a).on("popstate", f);
        B(a).on("hashchange", f);
        D = !0
      }
      aa.push(b);
      return b
    };
    k.$$applicationDestroyed = function() {
      B(a).off("hashchange popstate",
        f)
    };
    k.$$checkUrlChange = h;
    k.baseHref = function() {
      var a = ga.attr("href");
      return a ? a.replace(/^(https?\:)?\/\/[^\/]*/, "") : ""
    };
    k.defer = function(a, b) {
      var c;
      v++;
      c = r(function() {
        delete A[c];
        e(a)
      }, b || 0);
      A[c] = !0;
      return c
    };
    k.defer.cancel = function(a) {
      return A[a] ? (delete A[a], t(a), e(x), !0) : !1
    }
  }

  function Ve() {
    this.$get = ["$window", "$log", "$sniffer", "$document", function(a, b, d, c) {
      return new Nf(a, c, b, d)
    }]
  }

  function We() {
    this.$get = function() {
      function a(a, c) {
        function e(a) {
          a != r && (t ? t == a && (t = a.n) : t = a, f(a.n, a.p), f(a, r), r = a,
            r.n = null)
        }

        function f(a, b) {
          a != b && (a && (a.p = b), b && (b.n = a))
        }
        if (a in b) throw G("$cacheFactory")("iid", a);
        var g = 0,
          h = M({}, c, {
            id: a
          }),
          k = $(),
          l = c && c.capacity || Number.MAX_VALUE,
          m = $(),
          r = null,
          t = null;
        return b[a] = {
          put: function(a, b) {
            if (!q(b)) {
              if (l < Number.MAX_VALUE) {
                var c = m[a] || (m[a] = {
                  key: a
                });
                e(c)
              }
              a in k || g++;
              k[a] = b;
              g > l && this.remove(t.key);
              return b
            }
          },
          get: function(a) {
            if (l < Number.MAX_VALUE) {
              var b = m[a];
              if (!b) return;
              e(b)
            }
            return k[a]
          },
          remove: function(a) {
            if (l < Number.MAX_VALUE) {
              var b = m[a];
              if (!b) return;
              b == r && (r = b.p);
              b == t &&
                (t = b.n);
              f(b.n, b.p);
              delete m[a]
            }
            a in k && (delete k[a], g--)
          },
          removeAll: function() {
            k = $();
            g = 0;
            m = $();
            r = t = null
          },
          destroy: function() {
            m = h = k = null;
            delete b[a]
          },
          info: function() {
            return M({}, h, {
              size: g
            })
          }
        }
      }
      var b = {};
      a.info = function() {
        var a = {};
        n(b, function(b, e) {
          a[e] = b.info()
        });
        return a
      };
      a.get = function(a) {
        return b[a]
      };
      return a
    }
  }

  function rf() {
    this.$get = ["$cacheFactory", function(a) {
      return a("templates")
    }]
  }

  function Cc(a, b) {
    function d(a, b, c) {
      var d = /^\s*([@&]|=(\*?))(\??)\s*(\w*)\s*$/,
        e = {};
      n(a, function(a, f) {
        var g = a.match(d);
        if (!g) throw ha("iscp", b, f, a, c ? "controller bindings definition" : "isolate scope definition");
        e[f] = {
          mode: g[1][0],
          collection: "*" === g[2],
          optional: "?" === g[3],
          attrName: g[4] || f
        }
      });
      return e
    }

    function c(a) {
      var b = a.charAt(0);
      if (!b || b !== F(b)) throw ha("baddir", a);
      if (a !== a.trim()) throw ha("baddir", a);
    }
    var e = {},
      f = /^\s*directive\:\s*([\w\-]+)\s+(.*)$/,
      g = /(([\w\-]+)(?:\:([^;]+))?;?)/,
      h = Wd("ngSrc,ngSrcset,src,srcset"),
      k = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/,
      l = /^(on[a-z]+|formaction)$/;
    this.directive = function t(b, f) {
      Ra(b, "directive");
      E(b) ? (c(b), qb(f, "directiveFactory"), e.hasOwnProperty(b) || (e[b] = [], a.factory(b + "Directive", ["$injector", "$exceptionHandler", function(a, c) {
        var f = [];
        n(e[b], function(e, g) {
          try {
            var h = a.invoke(e);
            z(h) ? h = {
              compile: na(h)
            } : !h.compile && h.link && (h.compile = na(h.link));
            h.priority = h.priority || 0;
            h.index = g;
            h.name = h.name || b;
            h.require = h.require || h.controller && h.name;
            h.restrict = h.restrict || "EA";
            var k = h,
              l = h,
              m = h.name,
              t = {
                isolateScope: null,
                bindToController: null
              };
            H(l.scope) && (!0 === l.bindToController ? (t.bindToController = d(l.scope,
              m, !0), t.isolateScope = {}) : t.isolateScope = d(l.scope, m, !1));
            H(l.bindToController) && (t.bindToController = d(l.bindToController, m, !0));
            if (H(t.bindToController)) {
              var v = l.controller,
                R = l.controllerAs;
              if (!v) throw ha("noctrl", m);
              var V;
              a: if (R && E(R)) V = R;
                else {
                  if (E(v)) {
                    var n = Uc.exec(v);
                    if (n) {
                      V = n[3];
                      break a
                    }
                  }
                  V = void 0
                }
              if (!V) throw ha("noident", m);
            }
            var s = k.$$bindings = t;
            H(s.isolateScope) && (h.$$isolateBindings = s.isolateScope);
            h.$$moduleName = e.$$moduleName;
            f.push(h)
          } catch (u) {
            c(u)
          }
        });
        return f
      }])), e[b].push(f)) : n(b, pc(t));
      return this
    };
    this.aHrefSanitizationWhitelist = function(a) {
      return y(a) ? (b.aHrefSanitizationWhitelist(a), this) : b.aHrefSanitizationWhitelist()
    };
    this.imgSrcSanitizationWhitelist = function(a) {
      return y(a) ? (b.imgSrcSanitizationWhitelist(a), this) : b.imgSrcSanitizationWhitelist()
    };
    var m = !0;
    this.debugInfoEnabled = function(a) {
      return y(a) ? (m = a, this) : m
    };
    this.$get = ["$injector", "$interpolate", "$exceptionHandler", "$templateRequest", "$parse", "$controller", "$rootScope", "$document", "$sce", "$animate", "$$sanitizeUri", function(a,
      b, c, d, p, C, w, ga, L, aa, D) {
      function J(a, b) {
        try {
          a.addClass(b)
        } catch (c) {}
      }

      function K(a, b, c, d, e) {
        a instanceof B || (a = B(a));
        n(a, function(b, c) {
          b.nodeType == Na && b.nodeValue.match(/\S+/) && (a[c] = B(b).wrap("<span></span>").parent()[0])
        });
        var f = O(a, b, a, c, d, e);
        K.$$addScopeClass(a);
        var g = null;
        return function(b, c, d) {
          qb(b, "scope");
          e && e.needsNewScope && (b = b.$parent.$new());
          d = d || {};
          var h = d.parentBoundTranscludeFn,
            k = d.transcludeControllers;
          d = d.futureParentElement;
          h && h.$$boundTransclude && (h = h.$$boundTransclude);
          g || (g = (d =
            d && d[0]) ? "foreignobject" !== ta(d) && d.toString().match(/SVG/) ? "svg" : "html" : "html");
          d = "html" !== g ? B(Yb(g, B("<div>").append(a).html())) : c ? Pa.clone.call(a) : a;
          if (k)
            for (var l in k) d.data("$" + l + "Controller", k[l].instance);
          K.$$addScopeInfo(d, b);
          c && c(d, b);
          f && f(b, d, d, h);
          return d
        }
      }

      function O(a, b, c, d, e, f) {
        function g(a, c, d, e) {
          var f, k, l, m, t, w, D;
          if (p)
            for (D = Array(c.length), m = 0; m < h.length; m += 3) f = h[m], D[f] = c[f];
          else D = c;
          m = 0;
          for (t = h.length; m < t;) k = D[h[m++]], c = h[m++], f = h[m++], c ? (c.scope ? (l = a.$new(), K.$$addScopeInfo(B(k),
            l)) : l = a, w = c.transcludeOnThisElement ? R(a, c.transclude, e) : !c.templateOnThisElement && e ? e : !e && b ? R(a, b) : null, c(f, l, k, d, w)) : f && f(a, k.childNodes, u, e)
        }
        for (var h = [], k, l, m, t, p, w = 0; w < a.length; w++) {
          k = new fa;
          l = V(a[w], [], k, 0 === w ? d : u, e);
          (f = l.length ? Z(l, a[w], k, b, c, null, [], [], f) : null) && f.scope && K.$$addScopeClass(k.$$element);
          k = f && f.terminal || !(m = a[w].childNodes) || !m.length ? null : O(m, f ? (f.transcludeOnThisElement || !f.templateOnThisElement) && f.transclude : b);
          if (f || k) h.push(w, f, k), t = !0, p = p || f;
          f = null
        }
        return t ? g : null
      }

      function R(a,
        b, c) {
        return function(d, e, f, g, h) {
          d || (d = a.$new(!1, h), d.$$transcluded = !0);
          return b(d, e, {
            parentBoundTranscludeFn: c,
            transcludeControllers: f,
            futureParentElement: g
          })
        }
      }

      function V(a, b, c, d, e) {
        var h = c.$attr,
          k;
        switch (a.nodeType) {
          case 1:
            P(b, va(ta(a)), "E", d, e);
            for (var l, m, t, p = a.attributes, w = 0, D = p && p.length; w < D; w++) {
              var K = !1,
                A = !1;
              l = p[w];
              k = l.name;
              m = U(l.value);
              l = va(k);
              if (t = ka.test(l)) k = k.replace(Vc, "").substr(8).replace(/_(.)/g, function(a, b) {
                return b.toUpperCase()
              });
              (l = l.match(la)) && G(l[1]) && (K = k, A = k.substr(0, k.length -
                5) + "end", k = k.substr(0, k.length - 6));
              l = va(k.toLowerCase());
              h[l] = k;
              if (t || !c.hasOwnProperty(l)) c[l] = m, Qc(a, l) && (c[l] = !0);
              W(a, b, m, l, t);
              P(b, l, "A", d, e, K, A)
            }
            a = a.className;
            H(a) && (a = a.animVal);
            if (E(a) && "" !== a)
              for (; k = g.exec(a);) l = va(k[2]), P(b, l, "C", d, e) && (c[l] = U(k[3])), a = a.substr(k.index + k[0].length);
            break;
          case Na:
            if (11 === Ha)
              for (; a.parentNode && a.nextSibling && a.nextSibling.nodeType === Na;) a.nodeValue += a.nextSibling.nodeValue, a.parentNode.removeChild(a.nextSibling);
            N(b, a.nodeValue);
            break;
          case 8:
            try {
              if (k = f.exec(a.nodeValue)) l =
                va(k[1]), P(b, l, "M", d, e) && (c[l] = U(k[2]))
            } catch (R) {}
        }
        b.sort(Ia);
        return b
      }

      function Ta(a, b, c) {
        var d = [],
          e = 0;
        if (b && a.hasAttribute && a.hasAttribute(b)) {
          do {
            if (!a) throw ha("uterdir", b, c);
            1 == a.nodeType && (a.hasAttribute(b) && e++, a.hasAttribute(c) && e--);
            d.push(a);
            a = a.nextSibling
          } while (0 < e)
        } else d.push(a);
        return B(d)
      }

      function s(a, b, c) {
        return function(d, e, f, g, h) {
          e = Ta(e[0], b, c);
          return a(d, e, f, g, h)
        }
      }

      function Z(a, b, d, e, f, g, h, l, m) {
        function t(a, b, c, d) {
          if (a) {
            c && (a = s(a, c, d));
            a.require = q.require;
            a.directiveName = x;
            if (O ===
              q || q.$$isolateScope) a = ca(a, {
              isolateScope: !0
            });
            h.push(a)
          }
          if (b) {
            c && (b = s(b, c, d));
            b.require = q.require;
            b.directiveName = x;
            if (O === q || q.$$isolateScope) b = ca(b, {
              isolateScope: !0
            });
            l.push(b)
          }
        }

        function p(a, b, c, d) {
          var e;
          if (E(b)) {
            var f = b.match(k);
            b = b.substring(f[0].length);
            var g = f[1] || f[3],
              f = "?" === f[2];
            "^^" === g ? c = c.parent() : e = (e = d && d[b]) && e.instance;
            e || (d = "$" + b + "Controller", e = g ? c.inheritedData(d) : c.data(d));
            if (!e && !f) throw ha("ctreq", b, a);
          } else if (I(b))
            for (e = [], g = 0, f = b.length; g < f; g++) e[g] = p(a, b[g], c, d);
          return e ||
            null
        }

        function w(a, b, c, d, e, f) {
          var g = $(),
            h;
          for (h in d) {
            var k = d[h],
              l = {
                $scope: k === O || k.$$isolateScope ? e : f,
                $element: a,
                $attrs: b,
                $transclude: c
              },
              m = k.controller;
            "@" == m && (m = b[k.name]);
            l = C(m, l, !0, k.controllerAs);
            g[k.name] = l;
            aa || a.data("$" + k.name + "Controller", l.instance)
          }
          return g
        }

        function D(a, c, e, f, g) {
          function k(a, b, c) {
            var d;
            Za(a) || (c = b, b = a, a = u);
            aa && (d = v);
            c || (c = aa ? V.parent() : V);
            return g(a, b, d, c, Ta)
          }
          var m, t, A, v, C, V, Ga;
          b === e ? (f = d, V = d.$$element) : (V = B(e), f = new fa(V, d));
          A = c;
          O ? t = c.$new(!0) : R && (A = c.$parent);
          g && (C = k,
            C.$$boundTransclude = g);
          T && (v = w(V, f, C, T, t, c));
          O && (K.$$addScopeInfo(V, t, !0, !(J && (J === O || J === O.$$originalDirective))), K.$$addScopeClass(V, !0), t.$$isolateBindings = O.$$isolateBindings, (Ga = ba(c, f, t, t.$$isolateBindings, O)) && t.$on("$destroy", Ga));
          for (var n in v) {
            Ga = T[n];
            var ga = v[n],
              L = Ga.$$bindings.bindToController;
            ga.identifier && L && (m = ba(A, f, ga.instance, L, Ga));
            var q = ga();
            q !== ga.instance && (ga.instance = q, V.data("$" + Ga.name + "Controller", q), m && m(), m = ba(A, f, ga.instance, L, Ga))
          }
          F = 0;
          for (M = h.length; F < M; F++) m = h[F],
            ea(m, m.isolateScope ? t : c, V, f, m.require && p(m.directiveName, m.require, V, v), C);
          var Ta = c;
          O && (O.template || null === O.templateUrl) && (Ta = t);
          a && a(Ta, e.childNodes, u, g);
          for (F = l.length - 1; 0 <= F; F--) m = l[F], ea(m, m.isolateScope ? t : c, V, f, m.require && p(m.directiveName, m.require, V, v), C)
        }
        m = m || {};
        for (var A = -Number.MAX_VALUE, R = m.newScopeDirective, T = m.controllerDirectives, O = m.newIsolateScopeDirective, J = m.templateDirective, n = m.nonTlbTranscludeDirective, ga = !1, L = !1, aa = m.hasElementTranscludeDirective, Z = d.$$element = B(b), q, x, P, Ia =
            e, G, F = 0, M = a.length; F < M; F++) {
          q = a[F];
          var N = q.$$start,
            Q = q.$$end;
          N && (Z = Ta(b, N, Q));
          P = u;
          if (A > q.priority) break;
          if (P = q.scope) q.templateUrl || (H(P) ? (Ua("new/isolated scope", O || R, q, Z), O = q) : Ua("new/isolated scope", O, q, Z)), R = R || q;
          x = q.name;
          !q.templateUrl && q.controller && (P = q.controller, T = T || $(), Ua("'" + x + "' controller", T[x], q, Z), T[x] = q);
          if (P = q.transclude) ga = !0, q.$$tlb || (Ua("transclusion", n, q, Z), n = q), "element" == P ? (aa = !0, A = q.priority, P = Z, Z = d.$$element = B(X.createComment(" " + x + ": " + d[x] + " ")), b = Z[0], Y(f, ra.call(P, 0),
            b), Ia = K(P, e, A, g && g.name, {
            nonTlbTranscludeDirective: n
          })) : (P = B(Vb(b)).contents(), Z.empty(), Ia = K(P, e, u, u, {
            needsNewScope: q.$$isolateScope || q.$$newScope
          }));
          if (q.template)
            if (L = !0, Ua("template", J, q, Z), J = q, P = z(q.template) ? q.template(Z, d) : q.template, P = ja(P), q.replace) {
              g = q;
              P = Tb.test(P) ? Xc(Yb(q.templateNamespace, U(P))) : [];
              b = P[0];
              if (1 != P.length || 1 !== b.nodeType) throw ha("tplrt", x, "");
              Y(f, Z, b);
              P = {
                $attr: {}
              };
              var Wc = V(b, [], P),
                W = a.splice(F + 1, a.length - (F + 1));
              (O || R) && y(Wc, O, R);
              a = a.concat(Wc).concat(W);
              S(d, P);
              M = a.length
            } else Z.html(P);
          if (q.templateUrl) L = !0, Ua("template", J, q, Z), J = q, q.replace && (g = q), D = Of(a.splice(F, a.length - F), Z, d, f, ga && Ia, h, l, {
            controllerDirectives: T,
            newScopeDirective: R !== q && R,
            newIsolateScopeDirective: O,
            templateDirective: J,
            nonTlbTranscludeDirective: n
          }), M = a.length;
          else if (q.compile) try {
            G = q.compile(Z, d, Ia), z(G) ? t(null, G, N, Q) : G && t(G.pre, G.post, N, Q)
          } catch (da) {
            c(da, ua(Z))
          }
          q.terminal && (D.terminal = !0, A = Math.max(A, q.priority))
        }
        D.scope = R && !0 === R.scope;
        D.transcludeOnThisElement = ga;
        D.templateOnThisElement = L;
        D.transclude = Ia;
        m.hasElementTranscludeDirective = aa;
        return D
      }

      function y(a, b, c) {
        for (var d = 0, e = a.length; d < e; d++) a[d] = Ob(a[d], {
          $$isolateScope: b,
          $$newScope: c
        })
      }

      function P(b, d, f, g, h, k, l) {
        if (d === h) return null;
        h = null;
        if (e.hasOwnProperty(d)) {
          var m;
          d = a.get(d + "Directive");
          for (var p = 0, w = d.length; p < w; p++) try {
            m = d[p], (q(g) || g > m.priority) && -1 != m.restrict.indexOf(f) && (k && (m = Ob(m, {
              $$start: k,
              $$end: l
            })), b.push(m), h = m)
          } catch (D) {
            c(D)
          }
        }
        return h
      }

      function G(b) {
        if (e.hasOwnProperty(b))
          for (var c = a.get(b + "Directive"), d = 0, f = c.length; d < f; d++)
            if (b =
              c[d], b.multiElement) return !0;
        return !1
      }

      function S(a, b) {
        var c = b.$attr,
          d = a.$attr,
          e = a.$$element;
        n(a, function(d, e) {
          "$" != e.charAt(0) && (b[e] && b[e] !== d && (d += ("style" === e ? ";" : " ") + b[e]), a.$set(e, d, !0, c[e]))
        });
        n(b, function(b, f) {
          "class" == f ? (J(e, b), a["class"] = (a["class"] ? a["class"] + " " : "") + b) : "style" == f ? (e.attr("style", e.attr("style") + ";" + b), a.style = (a.style ? a.style + ";" : "") + b) : "$" == f.charAt(0) || a.hasOwnProperty(f) || (a[f] = b, d[f] = c[f])
        })
      }

      function Of(a, b, c, e, f, g, h, k) {
        var l = [],
          m, t, p = b[0],
          w = a.shift(),
          D = Ob(w, {
            templateUrl: null,
            transclude: null,
            replace: null,
            $$originalDirective: w
          }),
          A = z(w.templateUrl) ? w.templateUrl(b, c) : w.templateUrl,
          K = w.templateNamespace;
        b.empty();
        d(A).then(function(d) {
          var T, v;
          d = ja(d);
          if (w.replace) {
            d = Tb.test(d) ? Xc(Yb(K, U(d))) : [];
            T = d[0];
            if (1 != d.length || 1 !== T.nodeType) throw ha("tplrt", w.name, A);
            d = {
              $attr: {}
            };
            Y(e, b, T);
            var C = V(T, [], d);
            H(w.scope) && y(C, !0);
            a = C.concat(a);
            S(c, d)
          } else T = p, b.html(d);
          a.unshift(D);
          m = Z(a, T, c, f, b, w, g, h, k);
          n(e, function(a, c) {
            a == T && (e[c] = b[0])
          });
          for (t = O(b[0].childNodes, f); l.length;) {
            d = l.shift();
            v = l.shift();
            var ga = l.shift(),
              L = l.shift(),
              C = b[0];
            if (!d.$$destroyed) {
              if (v !== p) {
                var q = v.className;
                k.hasElementTranscludeDirective && w.replace || (C = Vb(T));
                Y(ga, B(v), C);
                J(B(C), q)
              }
              v = m.transcludeOnThisElement ? R(d, m.transclude, L) : L;
              m(t, d, C, e, v)
            }
          }
          l = null
        });
        return function(a, b, c, d, e) {
          a = e;
          b.$$destroyed || (l ? l.push(b, c, d, a) : (m.transcludeOnThisElement && (a = R(b, m.transclude, e)), m(t, b, c, d, a)))
        }
      }

      function Ia(a, b) {
        var c = b.priority - a.priority;
        return 0 !== c ? c : a.name !== b.name ? a.name < b.name ? -1 : 1 : a.index - b.index
      }

      function Ua(a,
        b, c, d) {
        function e(a) {
          return a ? " (module: " + a + ")" : ""
        }
        if (b) throw ha("multidir", b.name, e(b.$$moduleName), c.name, e(c.$$moduleName), a, ua(d));
      }

      function N(a, c) {
        var d = b(c, !0);
        d && a.push({
          priority: 0,
          compile: function(a) {
            a = a.parent();
            var b = !!a.length;
            b && K.$$addBindingClass(a);
            return function(a, c) {
              var e = c.parent();
              b || K.$$addBindingClass(e);
              K.$$addBindingInfo(e, d.expressions);
              a.$watch(d, function(a) {
                c[0].nodeValue = a
              })
            }
          }
        })
      }

      function Yb(a, b) {
        a = F(a || "html");
        switch (a) {
          case "svg":
          case "math":
            var c = X.createElement("div");
            c.innerHTML = "<" + a + ">" + b + "</" + a + ">";
            return c.childNodes[0].childNodes;
          default:
            return b
        }
      }

      function Q(a, b) {
        if ("srcdoc" == b) return L.HTML;
        var c = ta(a);
        if ("xlinkHref" == b || "form" == c && "action" == b || "img" != c && ("src" == b || "ngSrc" == b)) return L.RESOURCE_URL
      }

      function W(a, c, d, e, f) {
        var g = Q(a, e);
        f = h[e] || f;
        var k = b(d, !0, g, f);
        if (k) {
          if ("multiple" === e && "select" === ta(a)) throw ha("selmulti", ua(a));
          c.push({
            priority: 100,
            compile: function() {
              return {
                pre: function(a, c, h) {
                  c = h.$$observers || (h.$$observers = $());
                  if (l.test(e)) throw ha("nodomevents");
                  var m = h[e];
                  m !== d && (k = m && b(m, !0, g, f), d = m);
                  k && (h[e] = k(a), (c[e] || (c[e] = [])).$$inter = !0, (h.$$observers && h.$$observers[e].$$scope || a).$watch(k, function(a, b) {
                    "class" === e && a != b ? h.$updateClass(a, b) : h.$set(e, a)
                  }))
                }
              }
            }
          })
        }
      }

      function Y(a, b, c) {
        var d = b[0],
          e = b.length,
          f = d.parentNode,
          g, h;
        if (a)
          for (g = 0, h = a.length; g < h; g++)
            if (a[g] == d) {
              a[g++] = c;
              h = g + e - 1;
              for (var k = a.length; g < k; g++, h++) h < k ? a[g] = a[h] : delete a[g];
              a.length -= e - 1;
              a.context === d && (a.context = c);
              break
            }
        f && f.replaceChild(c, d);
        a = X.createDocumentFragment();
        a.appendChild(d);
        B.hasData(d) && (B.data(c, B.data(d)), oa ? (Rb = !0, oa.cleanData([d])) : delete B.cache[d[B.expando]]);
        d = 1;
        for (e = b.length; d < e; d++) f = b[d], B(f).remove(), a.appendChild(f), delete b[d];
        b[0] = c;
        b.length = 1
      }

      function ca(a, b) {
        return M(function() {
          return a.apply(null, arguments)
        }, a, b)
      }

      function ea(a, b, d, e, f, g) {
        try {
          a(b, d, e, f, g)
        } catch (h) {
          c(h, ua(d))
        }
      }

      function ba(a, c, d, e, f) {
        var g = [];
        n(e, function(e, h) {
          var k = e.attrName,
            l = e.optional,
            m, t, w, D;
          switch (e.mode) {
            case "@":
              l || qa.call(c, k) || (d[h] = c[k] = void 0);
              c.$observe(k, function(a) {
                E(a) &&
                  (d[h] = a)
              });
              c.$$observers[k].$$scope = a;
              E(c[k]) && (d[h] = b(c[k])(a));
              break;
            case "=":
              if (!qa.call(c, k)) {
                if (l) break;
                c[k] = void 0
              }
              if (l && !c[k]) break;
              t = p(c[k]);
              D = t.literal ? ma : function(a, b) {
                return a === b || a !== a && b !== b
              };
              w = t.assign || function() {
                m = d[h] = t(a);
                throw ha("nonassign", c[k], f.name);
              };
              m = d[h] = t(a);
              l = function(b) {
                D(b, d[h]) || (D(b, m) ? w(a, b = d[h]) : d[h] = b);
                return m = b
              };
              l.$stateful = !0;
              l = e.collection ? a.$watchCollection(c[k], l) : a.$watch(p(c[k], l), null, t.literal);
              g.push(l);
              break;
            case "&":
              t = c.hasOwnProperty(k) ? p(c[k]) :
                x;
              if (t === x && l) break;
              d[h] = function(b) {
                return t(a, b)
              }
          }
        });
        return g.length && function() {
          for (var a = 0, b = g.length; a < b; ++a) g[a]()
        }
      }
      var fa = function(a, b) {
        if (b) {
          var c = Object.keys(b),
            d, e, f;
          d = 0;
          for (e = c.length; d < e; d++) f = c[d], this[f] = b[f]
        } else this.$attr = {};
        this.$$element = a
      };
      fa.prototype = {
        $normalize: va,
        $addClass: function(a) {
          a && 0 < a.length && aa.addClass(this.$$element, a)
        },
        $removeClass: function(a) {
          a && 0 < a.length && aa.removeClass(this.$$element, a)
        },
        $updateClass: function(a, b) {
          var c = Yc(a, b);
          c && c.length && aa.addClass(this.$$element,
            c);
          (c = Yc(b, a)) && c.length && aa.removeClass(this.$$element, c)
        },
        $set: function(a, b, d, e) {
          var f = Qc(this.$$element[0], a),
            g = Zc[a],
            h = a;
          f ? (this.$$element.prop(a, b), e = f) : g && (this[g] = b, h = g);
          this[a] = b;
          e ? this.$attr[a] = e : (e = this.$attr[a]) || (this.$attr[a] = e = zc(a, "-"));
          f = ta(this.$$element);
          if ("a" === f && "href" === a || "img" === f && "src" === a) this[a] = b = D(b, "src" === a);
          else if ("img" === f && "srcset" === a) {
            for (var f = "", g = U(b), k = /(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/, k = /\s/.test(g) ? k : /(,)/, g = g.split(k), k = Math.floor(g.length / 2), l = 0; l <
              k; l++) var m = 2 * l,
              f = f + D(U(g[m]), !0),
              f = f + (" " + U(g[m + 1]));
            g = U(g[2 * l]).split(/\s/);
            f += D(U(g[0]), !0);
            2 === g.length && (f += " " + U(g[1]));
            this[a] = b = f
          }!1 !== d && (null === b || q(b) ? this.$$element.removeAttr(e) : this.$$element.attr(e, b));
          (a = this.$$observers) && n(a[h], function(a) {
            try {
              a(b)
            } catch (d) {
              c(d)
            }
          })
        },
        $observe: function(a, b) {
          var c = this,
            d = c.$$observers || (c.$$observers = $()),
            e = d[a] || (d[a] = []);
          e.push(b);
          w.$evalAsync(function() {
            e.$$inter || !c.hasOwnProperty(a) || q(c[a]) || b(c[a])
          });
          return function() {
            ab(e, b)
          }
        }
      };
      var da = b.startSymbol(),
        ia = b.endSymbol(),
        ja = "{{" == da || "}}" == ia ? Ya : function(a) {
          return a.replace(/\{\{/g, da).replace(/}}/g, ia)
        },
        ka = /^ngAttr[A-Z]/,
        la = /^(.+)Start$/;
      K.$$addBindingInfo = m ? function(a, b) {
        var c = a.data("$binding") || [];
        I(b) ? c = c.concat(b) : c.push(b);
        a.data("$binding", c)
      } : x;
      K.$$addBindingClass = m ? function(a) {
        J(a, "ng-binding")
      } : x;
      K.$$addScopeInfo = m ? function(a, b, c, d) {
        a.data(c ? d ? "$isolateScopeNoTemplate" : "$isolateScope" : "$scope", b)
      } : x;
      K.$$addScopeClass = m ? function(a, b) {
        J(a, b ? "ng-isolate-scope" : "ng-scope")
      } : x;
      return K
    }]
  }

  function va(a) {
    return fb(a.replace(Vc,
      ""))
  }

  function Yc(a, b) {
    var d = "",
      c = a.split(/\s+/),
      e = b.split(/\s+/),
      f = 0;
    a: for (; f < c.length; f++) {
      for (var g = c[f], h = 0; h < e.length; h++)
        if (g == e[h]) continue a;
      d += (0 < d.length ? " " : "") + g
    }
    return d
  }

  function Xc(a) {
    a = B(a);
    var b = a.length;
    if (1 >= b) return a;
    for (; b--;) 8 === a[b].nodeType && Pf.call(a, b, 1);
    return a
  }

  function Xe() {
    var a = {},
      b = !1;
    this.register = function(b, c) {
      Ra(b, "controller");
      H(b) ? M(a, b) : a[b] = c
    };
    this.allowGlobals = function() {
      b = !0
    };
    this.$get = ["$injector", "$window", function(d, c) {
      function e(a, b, c, d) {
        if (!a || !H(a.$scope)) throw G("$controller")("noscp",
          d, b);
        a.$scope[b] = c
      }
      return function(f, g, h, k) {
        var l, m, r;
        h = !0 === h;
        k && E(k) && (r = k);
        if (E(f)) {
          k = f.match(Uc);
          if (!k) throw Qf("ctrlfmt", f);
          m = k[1];
          r = r || k[3];
          f = a.hasOwnProperty(m) ? a[m] : Bc(g.$scope, m, !0) || (b ? Bc(c, m, !0) : u);
          Qa(f, m, !0)
        }
        if (h) return h = (I(f) ? f[f.length - 1] : f).prototype, l = Object.create(h || null), r && e(g, r, l, m || f.name), M(function() {
          var a = d.invoke(f, l, g, m);
          a !== l && (H(a) || z(a)) && (l = a, r && e(g, r, l, m || f.name));
          return l
        }, {
          instance: l,
          identifier: r
        });
        l = d.instantiate(f, g, m);
        r && e(g, r, l, m || f.name);
        return l
      }
    }]
  }

  function Ye() {
    this.$get = ["$window", function(a) {
      return B(a.document)
    }]
  }

  function Ze() {
    this.$get = ["$log", function(a) {
      return function(b, d) {
        a.error.apply(a, arguments)
      }
    }]
  }

  function Zb(a) {
    return H(a) ? da(a) ? a.toISOString() : db(a) : a
  }

  function df() {
    this.$get = function() {
      return function(a) {
        if (!a) return "";
        var b = [];
        oc(a, function(a, c) {
          null === a || q(a) || (I(a) ? n(a, function(a, d) {
            b.push(ja(c) + "=" + ja(Zb(a)))
          }) : b.push(ja(c) + "=" + ja(Zb(a))))
        });
        return b.join("&")
      }
    }
  }

  function ef() {
    this.$get = function() {
      return function(a) {
        function b(a, e, f) {
          null === a || q(a) ||
            (I(a) ? n(a, function(a, c) {
              b(a, e + "[" + (H(a) ? c : "") + "]")
            }) : H(a) && !da(a) ? oc(a, function(a, c) {
              b(a, e + (f ? "" : "[") + c + (f ? "" : "]"))
            }) : d.push(ja(e) + "=" + ja(Zb(a))))
        }
        if (!a) return "";
        var d = [];
        b(a, "", !0);
        return d.join("&")
      }
    }
  }

  function $b(a, b) {
    if (E(a)) {
      var d = a.replace(Rf, "").trim();
      if (d) {
        var c = b("Content-Type");
        (c = c && 0 === c.indexOf($c)) || (c = (c = d.match(Sf)) && Tf[c[0]].test(d));
        c && (a = uc(d))
      }
    }
    return a
  }

  function ad(a) {
    var b = $(),
      d;
    E(a) ? n(a.split("\n"), function(a) {
      d = a.indexOf(":");
      var e = F(U(a.substr(0, d)));
      a = U(a.substr(d + 1));
      e &&
        (b[e] = b[e] ? b[e] + ", " + a : a)
    }) : H(a) && n(a, function(a, d) {
      var f = F(d),
        g = U(a);
      f && (b[f] = b[f] ? b[f] + ", " + g : g)
    });
    return b
  }

  function bd(a) {
    var b;
    return function(d) {
      b || (b = ad(a));
      return d ? (d = b[F(d)], void 0 === d && (d = null), d) : b
    }
  }

  function cd(a, b, d, c) {
    if (z(c)) return c(a, b, d);
    n(c, function(c) {
      a = c(a, b, d)
    });
    return a
  }

  function cf() {
    var a = this.defaults = {
        transformResponse: [$b],
        transformRequest: [function(a) {
          return H(a) && "[object File]" !== sa.call(a) && "[object Blob]" !== sa.call(a) && "[object FormData]" !== sa.call(a) ? db(a) : a
        }],
        headers: {
          common: {
            Accept: "application/json, text/plain, */*"
          },
          post: ia(ac),
          put: ia(ac),
          patch: ia(ac)
        },
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN",
        paramSerializer: "$httpParamSerializer"
      },
      b = !1;
    this.useApplyAsync = function(a) {
      return y(a) ? (b = !!a, this) : b
    };
    var d = !0;
    this.useLegacyPromiseExtensions = function(a) {
      return y(a) ? (d = !!a, this) : d
    };
    var c = this.interceptors = [];
    this.$get = ["$httpBackend", "$$cookieReader", "$cacheFactory", "$rootScope", "$q", "$injector", function(e, f, g, h, k, l) {
      function m(b) {
        function c(a) {
          var b = M({}, a);
          b.data = cd(a.data, a.headers, a.status, f.transformResponse);
          a = a.status;
          return 200 <= a && 300 > a ? b : k.reject(b)
        }

        function e(a, b) {
          var c, d = {};
          n(a, function(a, e) {
            z(a) ? (c = a(b), null != c && (d[e] = c)) : d[e] = a
          });
          return d
        }
        if (!fa.isObject(b)) throw G("$http")("badreq", b);
        var f = M({
          method: "get",
          transformRequest: a.transformRequest,
          transformResponse: a.transformResponse,
          paramSerializer: a.paramSerializer
        }, b);
        f.headers = function(b) {
          var c = a.headers,
            d = M({}, b.headers),
            f, g, h, c = M({}, c.common, c[F(b.method)]);
          a: for (f in c) {
            g = F(f);
            for (h in d)
              if (F(h) === g) continue a;
            d[f] = c[f]
          }
          return e(d, ia(b))
        }(b);
        f.method = sb(f.method);
        f.paramSerializer = E(f.paramSerializer) ? l.get(f.paramSerializer) : f.paramSerializer;
        var g = [function(b) {
            var d = b.headers,
              e = cd(b.data, bd(d), u, b.transformRequest);
            q(e) && n(d, function(a, b) {
              "content-type" === F(b) && delete d[b]
            });
            q(b.withCredentials) && !q(a.withCredentials) && (b.withCredentials = a.withCredentials);
            return r(b, e).then(c, c)
          }, u],
          h = k.when(f);
        for (n(v, function(a) {
            (a.request || a.requestError) && g.unshift(a.request, a.requestError);
            (a.response || a.responseError) && g.push(a.response, a.responseError)
          }); g.length;) {
          b =
            g.shift();
          var m = g.shift(),
            h = h.then(b, m)
        }
        d ? (h.success = function(a) {
          Qa(a, "fn");
          h.then(function(b) {
            a(b.data, b.status, b.headers, f)
          });
          return h
        }, h.error = function(a) {
          Qa(a, "fn");
          h.then(null, function(b) {
            a(b.data, b.status, b.headers, f)
          });
          return h
        }) : (h.success = dd("success"), h.error = dd("error"));
        return h
      }

      function r(c, d) {
        function g(a, c, d, e) {
          function f() {
            l(c, a, d, e)
          }
          J && (200 <= a && 300 > a ? J.put(R, [a, c, ad(d), e]) : J.remove(R));
          b ? h.$applyAsync(f) : (f(), h.$$phase || h.$apply())
        }

        function l(a, b, d, e) {
          b = -1 <= b ? b : 0;
          (200 <= b && 300 > b ? n.resolve :
            n.reject)({
            data: a,
            status: b,
            headers: bd(d),
            config: c,
            statusText: e
          })
        }

        function r(a) {
          l(a.data, a.status, ia(a.headers()), a.statusText)
        }

        function v() {
          var a = m.pendingRequests.indexOf(c); - 1 !== a && m.pendingRequests.splice(a, 1)
        }
        var n = k.defer(),
          D = n.promise,
          J, K, O = c.headers,
          R = t(c.url, c.paramSerializer(c.params));
        m.pendingRequests.push(c);
        D.then(v, v);
        !c.cache && !a.cache || !1 === c.cache || "GET" !== c.method && "JSONP" !== c.method || (J = H(c.cache) ? c.cache : H(a.cache) ? a.cache : A);
        J && (K = J.get(R), y(K) ? K && z(K.then) ? K.then(r, r) : I(K) ? l(K[1],
          K[0], ia(K[2]), K[3]) : l(K, 200, {}, "OK") : J.put(R, D));
        q(K) && ((K = ed(c.url) ? f()[c.xsrfCookieName || a.xsrfCookieName] : u) && (O[c.xsrfHeaderName || a.xsrfHeaderName] = K), e(c.method, R, d, g, O, c.timeout, c.withCredentials, c.responseType));
        return D
      }

      function t(a, b) {
        0 < b.length && (a += (-1 == a.indexOf("?") ? "?" : "&") + b);
        return a
      }
      var A = g("$http");
      a.paramSerializer = E(a.paramSerializer) ? l.get(a.paramSerializer) : a.paramSerializer;
      var v = [];
      n(c, function(a) {
        v.unshift(E(a) ? l.get(a) : l.invoke(a))
      });
      m.pendingRequests = [];
      (function(a) {
        n(arguments,
          function(a) {
            m[a] = function(b, c) {
              return m(M({}, c || {}, {
                method: a,
                url: b
              }))
            }
          })
      })("get", "delete", "head", "jsonp");
      (function(a) {
        n(arguments, function(a) {
          m[a] = function(b, c, d) {
            return m(M({}, d || {}, {
              method: a,
              url: b,
              data: c
            }))
          }
        })
      })("post", "put", "patch");
      m.defaults = a;
      return m
    }]
  }

  function gf() {
    this.$get = function() {
      return function() {
        return new S.XMLHttpRequest
      }
    }
  }

  function ff() {
    this.$get = ["$browser", "$window", "$document", "$xhrFactory", function(a, b, d, c) {
      return Uf(a, c, a.defer, b.angular.callbacks, d[0])
    }]
  }

  function Uf(a, b, d,
    c, e) {
    function f(a, b, d) {
      var f = e.createElement("script"),
        m = null;
      f.type = "text/javascript";
      f.src = a;
      f.async = !0;
      m = function(a) {
        f.removeEventListener("load", m, !1);
        f.removeEventListener("error", m, !1);
        e.body.removeChild(f);
        f = null;
        var g = -1,
          A = "unknown";
        a && ("load" !== a.type || c[b].called || (a = {
          type: "error"
        }), A = a.type, g = "error" === a.type ? 404 : 200);
        d && d(g, A)
      };
      f.addEventListener("load", m, !1);
      f.addEventListener("error", m, !1);
      e.body.appendChild(f);
      return m
    }
    return function(e, h, k, l, m, r, t, A) {
      function v() {
        C && C();
        w && w.abort()
      }

      function T(b, c, e, f, g) {
        y(L) && d.cancel(L);
        C = w = null;
        b(c, e, f, g);
        a.$$completeOutstandingRequest(x)
      }
      a.$$incOutstandingRequestCount();
      h = h || a.url();
      if ("jsonp" == F(e)) {
        var p = "_" + (c.counter++).toString(36);
        c[p] = function(a) {
          c[p].data = a;
          c[p].called = !0
        };
        var C = f(h.replace("JSON_CALLBACK", "angular.callbacks." + p), p, function(a, b) {
          T(l, a, c[p].data, "", b);
          c[p] = x
        })
      } else {
        var w = b(e, h);
        w.open(e, h, !0);
        n(m, function(a, b) {
          y(a) && w.setRequestHeader(b, a)
        });
        w.onload = function() {
          var a = w.statusText || "",
            b = "response" in w ? w.response : w.responseText,
            c = 1223 === w.status ? 204 : w.status;
          0 === c && (c = b ? 200 : "file" == wa(h).protocol ? 404 : 0);
          T(l, c, b, w.getAllResponseHeaders(), a)
        };
        e = function() {
          T(l, -1, null, null, "")
        };
        w.onerror = e;
        w.onabort = e;
        t && (w.withCredentials = !0);
        if (A) try {
          w.responseType = A
        } catch (ga) {
          if ("json" !== A) throw ga;
        }
        w.send(q(k) ? null : k)
      }
      if (0 < r) var L = d(v, r);
      else r && z(r.then) && r.then(v)
    }
  }

  function af() {
    var a = "{{",
      b = "}}";
    this.startSymbol = function(b) {
      return b ? (a = b, this) : a
    };
    this.endSymbol = function(a) {
      return a ? (b = a, this) : b
    };
    this.$get = ["$parse", "$exceptionHandler",
      "$sce",
      function(d, c, e) {
        function f(a) {
          return "\\\\\\" + a
        }

        function g(c) {
          return c.replace(m, a).replace(r, b)
        }

        function h(f, h, m, r) {
          function p(a) {
            try {
              var b = a;
              a = m ? e.getTrusted(m, b) : e.valueOf(b);
              var d;
              if (r && !y(a)) d = a;
              else if (null == a) d = "";
              else {
                switch (typeof a) {
                  case "string":
                    break;
                  case "number":
                    a = "" + a;
                    break;
                  default:
                    a = db(a)
                }
                d = a
              }
              return d
            } catch (g) {
              c(Ja.interr(f, g))
            }
          }
          r = !!r;
          for (var C, w, n = 0, L = [], s = [], D = f.length, J = [], K = []; n < D;)
            if (-1 != (C = f.indexOf(a, n)) && -1 != (w = f.indexOf(b, C + k))) n !== C && J.push(g(f.substring(n, C))), n = f.substring(C +
              k, w), L.push(n), s.push(d(n, p)), n = w + l, K.push(J.length), J.push("");
            else {
              n !== D && J.push(g(f.substring(n)));
              break
            }
          m && 1 < J.length && Ja.throwNoconcat(f);
          if (!h || L.length) {
            var O = function(a) {
              for (var b = 0, c = L.length; b < c; b++) {
                if (r && q(a[b])) return;
                J[K[b]] = a[b]
              }
              return J.join("")
            };
            return M(function(a) {
              var b = 0,
                d = L.length,
                e = Array(d);
              try {
                for (; b < d; b++) e[b] = s[b](a);
                return O(e)
              } catch (g) {
                c(Ja.interr(f, g))
              }
            }, {
              exp: f,
              expressions: L,
              $$watchDelegate: function(a, b) {
                var c;
                return a.$watchGroup(s, function(d, e) {
                  var f = O(d);
                  z(b) && b.call(this,
                    f, d !== e ? c : f, a);
                  c = f
                })
              }
            })
          }
        }
        var k = a.length,
          l = b.length,
          m = new RegExp(a.replace(/./g, f), "g"),
          r = new RegExp(b.replace(/./g, f), "g");
        h.startSymbol = function() {
          return a
        };
        h.endSymbol = function() {
          return b
        };
        return h
      }
    ]
  }

  function bf() {
    this.$get = ["$rootScope", "$window", "$q", "$$q", function(a, b, d, c) {
      function e(e, h, k, l) {
        var m = 4 < arguments.length,
          r = m ? ra.call(arguments, 4) : [],
          t = b.setInterval,
          A = b.clearInterval,
          v = 0,
          n = y(l) && !l,
          p = (n ? c : d).defer(),
          C = p.promise;
        k = y(k) ? k : 0;
        C.then(null, null, m ? function() {
          e.apply(null, r)
        } : e);
        C.$$intervalId =
          t(function() {
            p.notify(v++);
            0 < k && v >= k && (p.resolve(v), A(C.$$intervalId), delete f[C.$$intervalId]);
            n || a.$apply()
          }, h);
        f[C.$$intervalId] = p;
        return C
      }
      var f = {};
      e.cancel = function(a) {
        return a && a.$$intervalId in f ? (f[a.$$intervalId].reject("canceled"), b.clearInterval(a.$$intervalId), delete f[a.$$intervalId], !0) : !1
      };
      return e
    }]
  }

  function bc(a) {
    a = a.split("/");
    for (var b = a.length; b--;) a[b] = ob(a[b]);
    return a.join("/")
  }

  function fd(a, b) {
    var d = wa(a);
    b.$$protocol = d.protocol;
    b.$$host = d.hostname;
    b.$$port = ea(d.port) || Vf[d.protocol] ||
      null
  }

  function gd(a, b) {
    var d = "/" !== a.charAt(0);
    d && (a = "/" + a);
    var c = wa(a);
    b.$$path = decodeURIComponent(d && "/" === c.pathname.charAt(0) ? c.pathname.substring(1) : c.pathname);
    b.$$search = xc(c.search);
    b.$$hash = decodeURIComponent(c.hash);
    b.$$path && "/" != b.$$path.charAt(0) && (b.$$path = "/" + b.$$path)
  }

  function pa(a, b) {
    if (0 === b.indexOf(a)) return b.substr(a.length)
  }

  function Fa(a) {
    var b = a.indexOf("#");
    return -1 == b ? a : a.substr(0, b)
  }

  function ib(a) {
    return a.replace(/(#.+)|#$/, "$1")
  }

  function cc(a, b, d) {
    this.$$html5 = !0;
    d = d || "";
    fd(a, this);
    this.$$parse = function(a) {
      var d = pa(b, a);
      if (!E(d)) throw Db("ipthprfx", a, b);
      gd(d, this);
      this.$$path || (this.$$path = "/");
      this.$$compose()
    };
    this.$$compose = function() {
      var a = Qb(this.$$search),
        d = this.$$hash ? "#" + ob(this.$$hash) : "";
      this.$$url = bc(this.$$path) + (a ? "?" + a : "") + d;
      this.$$absUrl = b + this.$$url.substr(1)
    };
    this.$$parseLinkUrl = function(c, e) {
      if (e && "#" === e[0]) return this.hash(e.slice(1)), !0;
      var f, g;
      y(f = pa(a, c)) ? (g = f, g = y(f = pa(d, f)) ? b + (pa("/", f) || f) : a + g) : y(f = pa(b, c)) ? g = b + f : b == c + "/" && (g = b);
      g && this.$$parse(g);
      return !!g
    }
  }

  function dc(a, b, d) {
    fd(a, this);
    this.$$parse = function(c) {
      var e = pa(a, c) || pa(b, c),
        f;
      q(e) || "#" !== e.charAt(0) ? this.$$html5 ? f = e : (f = "", q(e) && (a = c, this.replace())) : (f = pa(d, e), q(f) && (f = e));
      gd(f, this);
      c = this.$$path;
      var e = a,
        g = /^\/[A-Z]:(\/.*)/;
      0 === f.indexOf(e) && (f = f.replace(e, ""));
      g.exec(f) || (c = (f = g.exec(c)) ? f[1] : c);
      this.$$path = c;
      this.$$compose()
    };
    this.$$compose = function() {
      var b = Qb(this.$$search),
        e = this.$$hash ? "#" + ob(this.$$hash) : "";
      this.$$url = bc(this.$$path) + (b ? "?" + b : "") + e;
      this.$$absUrl = a + (this.$$url ?
        d + this.$$url : "")
    };
    this.$$parseLinkUrl = function(b, d) {
      return Fa(a) == Fa(b) ? (this.$$parse(b), !0) : !1
    }
  }

  function hd(a, b, d) {
    this.$$html5 = !0;
    dc.apply(this, arguments);
    this.$$parseLinkUrl = function(c, e) {
      if (e && "#" === e[0]) return this.hash(e.slice(1)), !0;
      var f, g;
      a == Fa(c) ? f = c : (g = pa(b, c)) ? f = a + d + g : b === c + "/" && (f = b);
      f && this.$$parse(f);
      return !!f
    };
    this.$$compose = function() {
      var b = Qb(this.$$search),
        e = this.$$hash ? "#" + ob(this.$$hash) : "";
      this.$$url = bc(this.$$path) + (b ? "?" + b : "") + e;
      this.$$absUrl = a + d + this.$$url
    }
  }

  function Eb(a) {
    return function() {
      return this[a]
    }
  }

  function id(a, b) {
    return function(d) {
      if (q(d)) return this[a];
      this[a] = b(d);
      this.$$compose();
      return this
    }
  }

  function hf() {
    var a = "",
      b = {
        enabled: !1,
        requireBase: !0,
        rewriteLinks: !0
      };
    this.hashPrefix = function(b) {
      return y(b) ? (a = b, this) : a
    };
    this.html5Mode = function(a) {
      return $a(a) ? (b.enabled = a, this) : H(a) ? ($a(a.enabled) && (b.enabled = a.enabled), $a(a.requireBase) && (b.requireBase = a.requireBase), $a(a.rewriteLinks) && (b.rewriteLinks = a.rewriteLinks), this) : b
    };
    this.$get = ["$rootScope", "$browser", "$sniffer", "$rootElement", "$window",
      function(d, c, e, f, g) {
        function h(a, b, d) {
          var e = l.url(),
            f = l.$$state;
          try {
            c.url(a, b, d), l.$$state = c.state()
          } catch (g) {
            throw l.url(e), l.$$state = f, g;
          }
        }

        function k(a, b) {
          d.$broadcast("$locationChangeSuccess", l.absUrl(), a, l.$$state, b)
        }
        var l, m;
        m = c.baseHref();
        var r = c.url(),
          t;
        if (b.enabled) {
          if (!m && b.requireBase) throw Db("nobase");
          t = r.substring(0, r.indexOf("/", r.indexOf("//") + 2)) + (m || "/");
          m = e.history ? cc : hd
        } else t = Fa(r), m = dc;
        var A = t.substr(0, Fa(t).lastIndexOf("/") + 1);
        l = new m(t, A, "#" + a);
        l.$$parseLinkUrl(r, r);
        l.$$state =
          c.state();
        var v = /^\s*(javascript|mailto):/i;
        f.on("click", function(a) {
          if (b.rewriteLinks && !a.ctrlKey && !a.metaKey && !a.shiftKey && 2 != a.which && 2 != a.button) {
            for (var e = B(a.target);
              "a" !== ta(e[0]);)
              if (e[0] === f[0] || !(e = e.parent())[0]) return;
            var h = e.prop("href"),
              k = e.attr("href") || e.attr("xlink:href");
            H(h) && "[object SVGAnimatedString]" === h.toString() && (h = wa(h.animVal).href);
            v.test(h) || !h || e.attr("target") || a.isDefaultPrevented() || !l.$$parseLinkUrl(h, k) || (a.preventDefault(), l.absUrl() != c.url() && (d.$apply(), g.angular["ff-684208-preventDefault"] = !0))
          }
        });
        ib(l.absUrl()) != ib(r) && c.url(l.absUrl(), !0);
        var n = !0;
        c.onUrlChange(function(a, b) {
          q(pa(A, a)) ? g.location.href = a : (d.$evalAsync(function() {
            var c = l.absUrl(),
              e = l.$$state,
              f;
            a = ib(a);
            l.$$parse(a);
            l.$$state = b;
            f = d.$broadcast("$locationChangeStart", a, c, b, e).defaultPrevented;
            l.absUrl() === a && (f ? (l.$$parse(c), l.$$state = e, h(c, !1, e)) : (n = !1, k(c, e)))
          }), d.$$phase || d.$digest())
        });
        d.$watch(function() {
          var a = ib(c.url()),
            b = ib(l.absUrl()),
            f = c.state(),
            g = l.$$replace,
            m = a !== b || l.$$html5 && e.history && f !== l.$$state;
          if (n ||
            m) n = !1, d.$evalAsync(function() {
            var b = l.absUrl(),
              c = d.$broadcast("$locationChangeStart", b, a, l.$$state, f).defaultPrevented;
            l.absUrl() === b && (c ? (l.$$parse(a), l.$$state = f) : (m && h(b, g, f === l.$$state ? null : l.$$state), k(a, f)))
          });
          l.$$replace = !1
        });
        return l
      }
    ]
  }

  function jf() {
    var a = !0,
      b = this;
    this.debugEnabled = function(b) {
      return y(b) ? (a = b, this) : a
    };
    this.$get = ["$window", function(d) {
      function c(a) {
        a instanceof Error && (a.stack ? a = a.message && -1 === a.stack.indexOf(a.message) ? "Error: " + a.message + "\n" + a.stack : a.stack : a.sourceURL &&
          (a = a.message + "\n" + a.sourceURL + ":" + a.line));
        return a
      }

      function e(a) {
        var b = d.console || {},
          e = b[a] || b.log || x;
        a = !1;
        try {
          a = !!e.apply
        } catch (k) {}
        return a ? function() {
          var a = [];
          n(arguments, function(b) {
            a.push(c(b))
          });
          return e.apply(b, a)
        } : function(a, b) {
          e(a, null == b ? "" : b)
        }
      }
      return {
        log: e("log"),
        info: e("info"),
        warn: e("warn"),
        error: e("error"),
        debug: function() {
          var c = e("debug");
          return function() {
            a && c.apply(b, arguments)
          }
        }()
      }
    }]
  }

  function Va(a, b) {
    if ("__defineGetter__" === a || "__defineSetter__" === a || "__lookupGetter__" === a || "__lookupSetter__" ===
      a || "__proto__" === a) throw ba("isecfld", b);
    return a
  }

  function jd(a, b) {
    a += "";
    if (!E(a)) throw ba("iseccst", b);
    return a
  }

  function xa(a, b) {
    if (a) {
      if (a.constructor === a) throw ba("isecfn", b);
      if (a.window === a) throw ba("isecwindow", b);
      if (a.children && (a.nodeName || a.prop && a.attr && a.find)) throw ba("isecdom", b);
      if (a === Object) throw ba("isecobj", b);
    }
    return a
  }

  function kd(a, b) {
    if (a) {
      if (a.constructor === a) throw ba("isecfn", b);
      if (a === Wf || a === Xf || a === Yf) throw ba("isecff", b);
    }
  }

  function ld(a, b) {
    if (a && (a === (0).constructor || a ===
        (!1).constructor || a === "".constructor || a === {}.constructor || a === [].constructor || a === Function.constructor)) throw ba("isecaf", b);
  }

  function Zf(a, b) {
    return "undefined" !== typeof a ? a : b
  }

  function md(a, b) {
    return "undefined" === typeof a ? b : "undefined" === typeof b ? a : a + b
  }

  function W(a, b) {
    var d, c;
    switch (a.type) {
      case s.Program:
        d = !0;
        n(a.body, function(a) {
          W(a.expression, b);
          d = d && a.expression.constant
        });
        a.constant = d;
        break;
      case s.Literal:
        a.constant = !0;
        a.toWatch = [];
        break;
      case s.UnaryExpression:
        W(a.argument, b);
        a.constant = a.argument.constant;
        a.toWatch = a.argument.toWatch;
        break;
      case s.BinaryExpression:
        W(a.left, b);
        W(a.right, b);
        a.constant = a.left.constant && a.right.constant;
        a.toWatch = a.left.toWatch.concat(a.right.toWatch);
        break;
      case s.LogicalExpression:
        W(a.left, b);
        W(a.right, b);
        a.constant = a.left.constant && a.right.constant;
        a.toWatch = a.constant ? [] : [a];
        break;
      case s.ConditionalExpression:
        W(a.test, b);
        W(a.alternate, b);
        W(a.consequent, b);
        a.constant = a.test.constant && a.alternate.constant && a.consequent.constant;
        a.toWatch = a.constant ? [] : [a];
        break;
      case s.Identifier:
        a.constant = !1;
        a.toWatch = [a];
        break;
      case s.MemberExpression:
        W(a.object, b);
        a.computed && W(a.property, b);
        a.constant = a.object.constant && (!a.computed || a.property.constant);
        a.toWatch = [a];
        break;
      case s.CallExpression:
        d = a.filter ? !b(a.callee.name).$stateful : !1;
        c = [];
        n(a.arguments, function(a) {
          W(a, b);
          d = d && a.constant;
          a.constant || c.push.apply(c, a.toWatch)
        });
        a.constant = d;
        a.toWatch = a.filter && !b(a.callee.name).$stateful ? c : [a];
        break;
      case s.AssignmentExpression:
        W(a.left, b);
        W(a.right, b);
        a.constant = a.left.constant && a.right.constant;
        a.toWatch = [a];
        break;
      case s.ArrayExpression:
        d = !0;
        c = [];
        n(a.elements, function(a) {
          W(a, b);
          d = d && a.constant;
          a.constant || c.push.apply(c, a.toWatch)
        });
        a.constant = d;
        a.toWatch = c;
        break;
      case s.ObjectExpression:
        d = !0;
        c = [];
        n(a.properties, function(a) {
          W(a.value, b);
          d = d && a.value.constant;
          a.value.constant || c.push.apply(c, a.value.toWatch)
        });
        a.constant = d;
        a.toWatch = c;
        break;
      case s.ThisExpression:
        a.constant = !1, a.toWatch = []
    }
  }

  function nd(a) {
    if (1 == a.length) {
      a = a[0].expression;
      var b = a.toWatch;
      return 1 !== b.length ? b : b[0] !== a ? b : u
    }
  }

  function od(a) {
    return a.type === s.Identifier || a.type === s.MemberExpression
  }

  function pd(a) {
    if (1 === a.body.length && od(a.body[0].expression)) return {
      type: s.AssignmentExpression,
      left: a.body[0].expression,
      right: {
        type: s.NGValueParameter
      },
      operator: "="
    }
  }

  function qd(a) {
    return 0 === a.body.length || 1 === a.body.length && (a.body[0].expression.type === s.Literal || a.body[0].expression.type === s.ArrayExpression || a.body[0].expression.type === s.ObjectExpression)
  }

  function rd(a, b) {
    this.astBuilder = a;
    this.$filter = b
  }

  function sd(a,
    b) {
    this.astBuilder = a;
    this.$filter = b
  }

  function Fb(a) {
    return "constructor" == a
  }

  function ec(a) {
    return z(a.valueOf) ? a.valueOf() : $f.call(a)
  }

  function kf() {
    var a = $(),
      b = $();
    this.$get = ["$filter", function(d) {
      function c(a, b) {
        return null == a || null == b ? a === b : "object" === typeof a && (a = ec(a), "object" === typeof a) ? !1 : a === b || a !== a && b !== b
      }

      function e(a, b, d, e, f) {
        var g = e.inputs,
          h;
        if (1 === g.length) {
          var k = c,
            g = g[0];
          return a.$watch(function(a) {
            var b = g(a);
            c(b, k) || (h = e(a, u, u, [b]), k = b && ec(b));
            return h
          }, b, d, f)
        }
        for (var l = [], m = [], r = 0, n =
            g.length; r < n; r++) l[r] = c, m[r] = null;
        return a.$watch(function(a) {
          for (var b = !1, d = 0, f = g.length; d < f; d++) {
            var k = g[d](a);
            if (b || (b = !c(k, l[d]))) m[d] = k, l[d] = k && ec(k)
          }
          b && (h = e(a, u, u, m));
          return h
        }, b, d, f)
      }

      function f(a, b, c, d) {
        var e, f;
        return e = a.$watch(function(a) {
          return d(a)
        }, function(a, c, d) {
          f = a;
          z(b) && b.apply(this, arguments);
          y(a) && d.$$postDigest(function() {
            y(f) && e()
          })
        }, c)
      }

      function g(a, b, c, d) {
        function e(a) {
          var b = !0;
          n(a, function(a) {
            y(a) || (b = !1)
          });
          return b
        }
        var f, g;
        return f = a.$watch(function(a) {
          return d(a)
        }, function(a,
          c, d) {
          g = a;
          z(b) && b.call(this, a, c, d);
          e(a) && d.$$postDigest(function() {
            e(g) && f()
          })
        }, c)
      }

      function h(a, b, c, d) {
        var e;
        return e = a.$watch(function(a) {
          return d(a)
        }, function(a, c, d) {
          z(b) && b.apply(this, arguments);
          e()
        }, c)
      }

      function k(a, b) {
        if (!b) return a;
        var c = a.$$watchDelegate,
          d = !1,
          c = c !== g && c !== f ? function(c, e, f, g) {
            f = d && g ? g[0] : a(c, e, f, g);
            return b(f, c, e)
          } : function(c, d, e, f) {
            e = a(c, d, e, f);
            c = b(e, c, d);
            return y(e) ? c : e
          };
        a.$$watchDelegate && a.$$watchDelegate !== e ? c.$$watchDelegate = a.$$watchDelegate : b.$stateful || (c.$$watchDelegate =
          e, d = !a.inputs, c.inputs = a.inputs ? a.inputs : [a]);
        return c
      }
      var l = Ba().noUnsafeEval,
        m = {
          csp: l,
          expensiveChecks: !1
        },
        r = {
          csp: l,
          expensiveChecks: !0
        };
      return function(c, l, v) {
        var n, p, q;
        switch (typeof c) {
          case "string":
            q = c = c.trim();
            var w = v ? b : a;
            n = w[q];
            n || (":" === c.charAt(0) && ":" === c.charAt(1) && (p = !0, c = c.substring(2)), v = v ? r : m, n = new fc(v), n = (new gc(n, d, v)).parse(c), n.constant ? n.$$watchDelegate = h : p ? n.$$watchDelegate = n.literal ? g : f : n.inputs && (n.$$watchDelegate = e), w[q] = n);
            return k(n, l);
          case "function":
            return k(c, l);
          default:
            return x
        }
      }
    }]
  }

  function mf() {
    this.$get = ["$rootScope", "$exceptionHandler", function(a, b) {
      return td(function(b) {
        a.$evalAsync(b)
      }, b)
    }]
  }

  function nf() {
    this.$get = ["$browser", "$exceptionHandler", function(a, b) {
      return td(function(b) {
        a.defer(b)
      }, b)
    }]
  }

  function td(a, b) {
    function d(a, b, c) {
      function d(b) {
        return function(c) {
          e || (e = !0, b.call(a, c))
        }
      }
      var e = !1;
      return [d(b), d(c)]
    }

    function c() {
      this.$$state = {
        status: 0
      }
    }

    function e(a, b) {
      return function(c) {
        b.call(a, c)
      }
    }

    function f(c) {
      !c.processScheduled && c.pending && (c.processScheduled = !0, a(function() {
        var a,
          d, e;
        e = c.pending;
        c.processScheduled = !1;
        c.pending = u;
        for (var f = 0, g = e.length; f < g; ++f) {
          d = e[f][0];
          a = e[f][c.status];
          try {
            z(a) ? d.resolve(a(c.value)) : 1 === c.status ? d.resolve(c.value) : d.reject(c.value)
          } catch (h) {
            d.reject(h), b(h)
          }
        }
      }))
    }

    function g() {
      this.promise = new c;
      this.resolve = e(this, this.resolve);
      this.reject = e(this, this.reject);
      this.notify = e(this, this.notify)
    }
    var h = G("$q", TypeError);
    M(c.prototype, {
      then: function(a, b, c) {
        if (q(a) && q(b) && q(c)) return this;
        var d = new g;
        this.$$state.pending = this.$$state.pending || [];
        this.$$state.pending.push([d, a, b, c]);
        0 < this.$$state.status && f(this.$$state);
        return d.promise
      },
      "catch": function(a) {
        return this.then(null, a)
      },
      "finally": function(a, b) {
        return this.then(function(b) {
          return l(b, !0, a)
        }, function(b) {
          return l(b, !1, a)
        }, b)
      }
    });
    M(g.prototype, {
      resolve: function(a) {
        this.promise.$$state.status || (a === this.promise ? this.$$reject(h("qcycle", a)) : this.$$resolve(a))
      },
      $$resolve: function(a) {
        var c, e;
        e = d(this, this.$$resolve, this.$$reject);
        try {
          if (H(a) || z(a)) c = a && a.then;
          z(c) ? (this.promise.$$state.status = -1, c.call(a, e[0], e[1], this.notify)) : (this.promise.$$state.value = a, this.promise.$$state.status = 1, f(this.promise.$$state))
        } catch (g) {
          e[1](g), b(g)
        }
      },
      reject: function(a) {
        this.promise.$$state.status || this.$$reject(a)
      },
      $$reject: function(a) {
        this.promise.$$state.value = a;
        this.promise.$$state.status = 2;
        f(this.promise.$$state)
      },
      notify: function(c) {
        var d = this.promise.$$state.pending;
        0 >= this.promise.$$state.status && d && d.length && a(function() {
          for (var a, e, f = 0, g = d.length; f < g; f++) {
            e = d[f][0];
            a = d[f][3];
            try {
              e.notify(z(a) ?
                a(c) : c)
            } catch (h) {
              b(h)
            }
          }
        })
      }
    });
    var k = function(a, b) {
        var c = new g;
        b ? c.resolve(a) : c.reject(a);
        return c.promise
      },
      l = function(a, b, c) {
        var d = null;
        try {
          z(c) && (d = c())
        } catch (e) {
          return k(e, !1)
        }
        return d && z(d.then) ? d.then(function() {
          return k(a, b)
        }, function(a) {
          return k(a, !1)
        }) : k(a, b)
      },
      m = function(a, b, c, d) {
        var e = new g;
        e.resolve(a);
        return e.promise.then(b, c, d)
      },
      r = function A(a) {
        if (!z(a)) throw h("norslvr", a);
        if (!(this instanceof A)) return new A(a);
        var b = new g;
        a(function(a) {
          b.resolve(a)
        }, function(a) {
          b.reject(a)
        });
        return b.promise
      };
    r.defer = function() {
      return new g
    };
    r.reject = function(a) {
      var b = new g;
      b.reject(a);
      return b.promise
    };
    r.when = m;
    r.resolve = m;
    r.all = function(a) {
      var b = new g,
        c = 0,
        d = I(a) ? [] : {};
      n(a, function(a, e) {
        c++;
        m(a).then(function(a) {
          d.hasOwnProperty(e) || (d[e] = a, --c || b.resolve(d))
        }, function(a) {
          d.hasOwnProperty(e) || b.reject(a)
        })
      });
      0 === c && b.resolve(d);
      return b.promise
    };
    return r
  }

  function wf() {
    this.$get = ["$window", "$timeout", function(a, b) {
      var d = a.requestAnimationFrame || a.webkitRequestAnimationFrame,
        c = a.cancelAnimationFrame || a.webkitCancelAnimationFrame ||
        a.webkitCancelRequestAnimationFrame,
        e = !!d,
        f = e ? function(a) {
          var b = d(a);
          return function() {
            c(b)
          }
        } : function(a) {
          var c = b(a, 16.66, !1);
          return function() {
            b.cancel(c)
          }
        };
      f.supported = e;
      return f
    }]
  }

  function lf() {
    function a(a) {
      function b() {
        this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null;
        this.$$listeners = {};
        this.$$listenerCount = {};
        this.$$watchersCount = 0;
        this.$id = ++nb;
        this.$$ChildScope = null
      }
      b.prototype = a;
      return b
    }
    var b = 10,
      d = G("$rootScope"),
      c = null,
      e = null;
    this.digestTtl = function(a) {
      arguments.length &&
        (b = a);
      return b
    };
    this.$get = ["$injector", "$exceptionHandler", "$parse", "$browser", function(f, g, h, k) {
      function l(a) {
        a.currentScope.$$destroyed = !0
      }

      function m(a) {
        9 === Ha && (a.$$childHead && m(a.$$childHead), a.$$nextSibling && m(a.$$nextSibling));
        a.$parent = a.$$nextSibling = a.$$prevSibling = a.$$childHead = a.$$childTail = a.$root = a.$$watchers = null
      }

      function r() {
        this.$id = ++nb;
        this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null;
        this.$root = this;
        this.$$destroyed = !1;
        this.$$listeners = {};
        this.$$listenerCount = {};
        this.$$watchersCount = 0;
        this.$$isolateBindings = null
      }

      function t(a) {
        if (w.$$phase) throw d("inprog", w.$$phase);
        w.$$phase = a
      }

      function A(a, b) {
        do a.$$watchersCount += b; while (a = a.$parent)
      }

      function v(a, b, c) {
        do a.$$listenerCount[c] -= b, 0 === a.$$listenerCount[c] && delete a.$$listenerCount[c]; while (a = a.$parent)
      }

      function s() {}

      function p() {
        for (; aa.length;) try {
          aa.shift()()
        } catch (a) {
          g(a)
        }
        e = null
      }

      function C() {
        null === e && (e = k.defer(function() {
          w.$apply(p)
        }))
      }
      r.prototype = {
        constructor: r,
        $new: function(b, c) {
          var d;
          c = c || this;
          b ? (d = new r, d.$root = this.$root) : (this.$$ChildScope || (this.$$ChildScope = a(this)), d = new this.$$ChildScope);
          d.$parent = c;
          d.$$prevSibling = c.$$childTail;
          c.$$childHead ? (c.$$childTail.$$nextSibling = d, c.$$childTail = d) : c.$$childHead = c.$$childTail = d;
          (b || c != this) && d.$on("$destroy", l);
          return d
        },
        $watch: function(a, b, d, e) {
          var f = h(a);
          if (f.$$watchDelegate) return f.$$watchDelegate(this, b, d, f, a);
          var g = this,
            k = g.$$watchers,
            l = {
              fn: b,
              last: s,
              get: f,
              exp: e || a,
              eq: !!d
            };
          c = null;
          z(b) || (l.fn = x);
          k ||
            (k = g.$$watchers = []);
          k.unshift(l);
          A(this, 1);
          return function() {
            0 <= ab(k, l) && A(g, -1);
            c = null
          }
        },
        $watchGroup: function(a, b) {
          function c() {
            h = !1;
            k ? (k = !1, b(e, e, g)) : b(e, d, g)
          }
          var d = Array(a.length),
            e = Array(a.length),
            f = [],
            g = this,
            h = !1,
            k = !0;
          if (!a.length) {
            var l = !0;
            g.$evalAsync(function() {
              l && b(e, e, g)
            });
            return function() {
              l = !1
            }
          }
          if (1 === a.length) return this.$watch(a[0], function(a, c, f) {
            e[0] = a;
            d[0] = c;
            b(e, a === c ? e : d, f)
          });
          n(a, function(a, b) {
            var k = g.$watch(a, function(a, f) {
              e[b] = a;
              d[b] = f;
              h || (h = !0, g.$evalAsync(c))
            });
            f.push(k)
          });
          return function() {
            for (; f.length;) f.shift()()
          }
        },
        $watchCollection: function(a, b) {
          function c(a) {
            e = a;
            var b, d, g, h;
            if (!q(e)) {
              if (H(e))
                if (za(e))
                  for (f !== r && (f = r, n = f.length = 0, l++), a = e.length, n !== a && (l++, f.length = n = a), b = 0; b < a; b++) h = f[b], g = e[b], d = h !== h && g !== g, d || h === g || (l++, f[b] = g);
                else {
                  f !== t && (f = t = {}, n = 0, l++);
                  a = 0;
                  for (b in e) qa.call(e, b) && (a++, g = e[b], h = f[b], b in f ? (d = h !== h && g !== g, d || h === g || (l++, f[b] = g)) : (n++, f[b] = g, l++));
                  if (n > a)
                    for (b in l++, f) qa.call(e, b) || (n--, delete f[b])
                }
              else f !== e && (f = e, l++);
              return l
            }
          }
          c.$stateful = !0;
          var d = this,
            e, f, g, k = 1 < b.length,
            l = 0,
            m =
            h(a, c),
            r = [],
            t = {},
            p = !0,
            n = 0;
          return this.$watch(m, function() {
            p ? (p = !1, b(e, e, d)) : b(e, g, d);
            if (k)
              if (H(e))
                if (za(e)) {
                  g = Array(e.length);
                  for (var a = 0; a < e.length; a++) g[a] = e[a]
                } else
                  for (a in g = {}, e) qa.call(e, a) && (g[a] = e[a]);
            else g = e
          })
        },
        $digest: function() {
          var a, f, h, l, m, r, n = b,
            A, q = [],
            v, C;
          t("$digest");
          k.$$checkUrlChange();
          this === w && null !== e && (k.defer.cancel(e), p());
          c = null;
          do {
            r = !1;
            for (A = this; u.length;) {
              try {
                C = u.shift(), C.scope.$eval(C.expression, C.locals)
              } catch (aa) {
                g(aa)
              }
              c = null
            }
            a: do {
              if (l = A.$$watchers)
                for (m = l.length; m--;) try {
                  if (a =
                    l[m])
                    if ((f = a.get(A)) !== (h = a.last) && !(a.eq ? ma(f, h) : "number" === typeof f && "number" === typeof h && isNaN(f) && isNaN(h))) r = !0, c = a, a.last = a.eq ? bb(f, null) : f, a.fn(f, h === s ? f : h, A), 5 > n && (v = 4 - n, q[v] || (q[v] = []), q[v].push({
                      msg: z(a.exp) ? "fn: " + (a.exp.name || a.exp.toString()) : a.exp,
                      newVal: f,
                      oldVal: h
                    }));
                    else if (a === c) {
                    r = !1;
                    break a
                  }
                } catch (y) {
                  g(y)
                }
              if (!(l = A.$$watchersCount && A.$$childHead || A !== this && A.$$nextSibling))
                for (; A !== this && !(l = A.$$nextSibling);) A = A.$parent
            } while (A = l);
            if ((r || u.length) && !n--) throw w.$$phase = null, d("infdig",
              b, q);
          } while (r || u.length);
          for (w.$$phase = null; L.length;) try {
            L.shift()()
          } catch (x) {
            g(x)
          }
        },
        $destroy: function() {
          if (!this.$$destroyed) {
            var a = this.$parent;
            this.$broadcast("$destroy");
            this.$$destroyed = !0;
            this === w && k.$$applicationDestroyed();
            A(this, -this.$$watchersCount);
            for (var b in this.$$listenerCount) v(this, this.$$listenerCount[b], b);
            a && a.$$childHead == this && (a.$$childHead = this.$$nextSibling);
            a && a.$$childTail == this && (a.$$childTail = this.$$prevSibling);
            this.$$prevSibling && (this.$$prevSibling.$$nextSibling =
              this.$$nextSibling);
            this.$$nextSibling && (this.$$nextSibling.$$prevSibling = this.$$prevSibling);
            this.$destroy = this.$digest = this.$apply = this.$evalAsync = this.$applyAsync = x;
            this.$on = this.$watch = this.$watchGroup = function() {
              return x
            };
            this.$$listeners = {};
            this.$$nextSibling = null;
            m(this)
          }
        },
        $eval: function(a, b) {
          return h(a)(this, b)
        },
        $evalAsync: function(a, b) {
          w.$$phase || u.length || k.defer(function() {
            u.length && w.$digest()
          });
          u.push({
            scope: this,
            expression: a,
            locals: b
          })
        },
        $$postDigest: function(a) {
          L.push(a)
        },
        $apply: function(a) {
          try {
            t("$apply");
            try {
              return this.$eval(a)
            } finally {
              w.$$phase = null
            }
          } catch (b) {
            g(b)
          } finally {
            try {
              w.$digest()
            } catch (c) {
              throw g(c), c;
            }
          }
        },
        $applyAsync: function(a) {
          function b() {
            c.$eval(a)
          }
          var c = this;
          a && aa.push(b);
          C()
        },
        $on: function(a, b) {
          var c = this.$$listeners[a];
          c || (this.$$listeners[a] = c = []);
          c.push(b);
          var d = this;
          do d.$$listenerCount[a] || (d.$$listenerCount[a] = 0), d.$$listenerCount[a]++; while (d = d.$parent);
          var e = this;
          return function() {
            var d = c.indexOf(b); - 1 !== d && (c[d] = null, v(e, 1, a))
          }
        },
        $emit: function(a, b) {
          var c = [],
            d, e = this,
            f = !1,
            h = {
              name: a,
              targetScope: e,
              stopPropagation: function() {
                f = !0
              },
              preventDefault: function() {
                h.defaultPrevented = !0
              },
              defaultPrevented: !1
            },
            k = cb([h], arguments, 1),
            l, m;
          do {
            d = e.$$listeners[a] || c;
            h.currentScope = e;
            l = 0;
            for (m = d.length; l < m; l++)
              if (d[l]) try {
                d[l].apply(null, k)
              } catch (r) {
                g(r)
              } else d.splice(l, 1), l--, m--;
            if (f) return h.currentScope = null, h;
            e = e.$parent
          } while (e);
          h.currentScope = null;
          return h
        },
        $broadcast: function(a, b) {
          var c = this,
            d = this,
            e = {
              name: a,
              targetScope: this,
              preventDefault: function() {
                e.defaultPrevented = !0
              },
              defaultPrevented: !1
            };
          if (!this.$$listenerCount[a]) return e;
          for (var f = cb([e], arguments, 1), h, k; c = d;) {
            e.currentScope = c;
            d = c.$$listeners[a] || [];
            h = 0;
            for (k = d.length; h < k; h++)
              if (d[h]) try {
                d[h].apply(null, f)
              } catch (l) {
                g(l)
              } else d.splice(h, 1), h--, k--;
            if (!(d = c.$$listenerCount[a] && c.$$childHead || c !== this && c.$$nextSibling))
              for (; c !== this && !(d = c.$$nextSibling);) c = c.$parent
          }
          e.currentScope = null;
          return e
        }
      };
      var w = new r,
        u = w.$$asyncQueue = [],
        L = w.$$postDigestQueue = [],
        aa = w.$$applyAsyncQueue = [];
      return w
    }]
  }

  function ge() {
    var a = /^\s*(https?|ftp|mailto|tel|file):/,
      b = /^\s*((https?|ftp|file|blob):|data:image\/)/;
    this.aHrefSanitizationWhitelist = function(b) {
      return y(b) ? (a = b, this) : a
    };
    this.imgSrcSanitizationWhitelist = function(a) {
      return y(a) ? (b = a, this) : b
    };
    this.$get = function() {
      return function(d, c) {
        var e = c ? b : a,
          f;
        f = wa(d).href;
        return "" === f || f.match(e) ? d : "unsafe:" + f
      }
    }
  }

  function ag(a) {
    if ("self" === a) return a;
    if (E(a)) {
      if (-1 < a.indexOf("***")) throw ya("iwcard", a);
      a = ud(a).replace("\\*\\*", ".*").replace("\\*", "[^:/.?&;]*");
      return new RegExp("^" + a + "$")
    }
    if (Ma(a)) return new RegExp("^" +
      a.source + "$");
    throw ya("imatcher");
  }

  function vd(a) {
    var b = [];
    y(a) && n(a, function(a) {
      b.push(ag(a))
    });
    return b
  }

  function pf() {
    this.SCE_CONTEXTS = la;
    var a = ["self"],
      b = [];
    this.resourceUrlWhitelist = function(b) {
      arguments.length && (a = vd(b));
      return a
    };
    this.resourceUrlBlacklist = function(a) {
      arguments.length && (b = vd(a));
      return b
    };
    this.$get = ["$injector", function(d) {
      function c(a, b) {
        return "self" === a ? ed(b) : !!a.exec(b.href)
      }

      function e(a) {
        var b = function(a) {
          this.$$unwrapTrustedValue = function() {
            return a
          }
        };
        a && (b.prototype =
          new a);
        b.prototype.valueOf = function() {
          return this.$$unwrapTrustedValue()
        };
        b.prototype.toString = function() {
          return this.$$unwrapTrustedValue().toString()
        };
        return b
      }
      var f = function(a) {
        throw ya("unsafe");
      };
      d.has("$sanitize") && (f = d.get("$sanitize"));
      var g = e(),
        h = {};
      h[la.HTML] = e(g);
      h[la.CSS] = e(g);
      h[la.URL] = e(g);
      h[la.JS] = e(g);
      h[la.RESOURCE_URL] = e(h[la.URL]);
      return {
        trustAs: function(a, b) {
          var c = h.hasOwnProperty(a) ? h[a] : null;
          if (!c) throw ya("icontext", a, b);
          if (null === b || q(b) || "" === b) return b;
          if ("string" !== typeof b) throw ya("itype",
            a);
          return new c(b)
        },
        getTrusted: function(d, e) {
          if (null === e || q(e) || "" === e) return e;
          var g = h.hasOwnProperty(d) ? h[d] : null;
          if (g && e instanceof g) return e.$$unwrapTrustedValue();
          if (d === la.RESOURCE_URL) {
            var g = wa(e.toString()),
              r, t, n = !1;
            r = 0;
            for (t = a.length; r < t; r++)
              if (c(a[r], g)) {
                n = !0;
                break
              }
            if (n)
              for (r = 0, t = b.length; r < t; r++)
                if (c(b[r], g)) {
                  n = !1;
                  break
                }
            if (n) return e;
            throw ya("insecurl", e.toString());
          }
          if (d === la.HTML) return f(e);
          throw ya("unsafe");
        },
        valueOf: function(a) {
          return a instanceof g ? a.$$unwrapTrustedValue() : a
        }
      }
    }]
  }

  function of () {
    var a = !0;
    this.enabled = function(b) {
      arguments.length && (a = !!b);
      return a
    };
    this.$get = ["$parse", "$sceDelegate", function(b, d) {
      if (a && 8 > Ha) throw ya("iequirks");
      var c = ia(la);
      c.isEnabled = function() {
        return a
      };
      c.trustAs = d.trustAs;
      c.getTrusted = d.getTrusted;
      c.valueOf = d.valueOf;
      a || (c.trustAs = c.getTrusted = function(a, b) {
        return b
      }, c.valueOf = Ya);
      c.parseAs = function(a, d) {
        var e = b(d);
        return e.literal && e.constant ? e : b(d, function(b) {
          return c.getTrusted(a, b)
        })
      };
      var e = c.parseAs,
        f = c.getTrusted,
        g = c.trustAs;
      n(la, function(a,
        b) {
        var d = F(b);
        c[fb("parse_as_" + d)] = function(b) {
          return e(a, b)
        };
        c[fb("get_trusted_" + d)] = function(b) {
          return f(a, b)
        };
        c[fb("trust_as_" + d)] = function(b) {
          return g(a, b)
        }
      });
      return c
    }]
  }

  function qf() {
    this.$get = ["$window", "$document", function(a, b) {
      var d = {},
        c = ea((/android (\d+)/.exec(F((a.navigator || {}).userAgent)) || [])[1]),
        e = /Boxee/i.test((a.navigator || {}).userAgent),
        f = b[0] || {},
        g, h = /^(Moz|webkit|ms)(?=[A-Z])/,
        k = f.body && f.body.style,
        l = !1,
        m = !1;
      if (k) {
        for (var r in k)
          if (l = h.exec(r)) {
            g = l[0];
            g = g.substr(0, 1).toUpperCase() +
              g.substr(1);
            break
          }
        g || (g = "WebkitOpacity" in k && "webkit");
        l = !!("transition" in k || g + "Transition" in k);
        m = !!("animation" in k || g + "Animation" in k);
        !c || l && m || (l = E(k.webkitTransition), m = E(k.webkitAnimation))
      }
      return {
        history: !(!a.history || !a.history.pushState || 4 > c || e),
        hasEvent: function(a) {
          if ("input" === a && 11 >= Ha) return !1;
          if (q(d[a])) {
            var b = f.createElement("div");
            d[a] = "on" + a in b
          }
          return d[a]
        },
        csp: Ba(),
        vendorPrefix: g,
        transitions: l,
        animations: m,
        android: c
      }
    }]
  }

  function sf() {
    this.$get = ["$templateCache", "$http", "$q", "$sce",
      function(a, b, d, c) {
        function e(f, g) {
          e.totalPendingRequests++;
          E(f) && a.get(f) || (f = c.getTrustedResourceUrl(f));
          var h = b.defaults && b.defaults.transformResponse;
          I(h) ? h = h.filter(function(a) {
            return a !== $b
          }) : h === $b && (h = null);
          return b.get(f, {
            cache: a,
            transformResponse: h
          })["finally"](function() {
            e.totalPendingRequests--
          }).then(function(b) {
            a.put(f, b.data);
            return b.data
          }, function(a) {
            if (!g) throw ha("tpload", f, a.status, a.statusText);
            return d.reject(a)
          })
        }
        e.totalPendingRequests = 0;
        return e
      }
    ]
  }

  function tf() {
    this.$get = ["$rootScope",
      "$browser", "$location",
      function(a, b, d) {
        return {
          findBindings: function(a, b, d) {
            a = a.getElementsByClassName("ng-binding");
            var g = [];
            n(a, function(a) {
              var c = fa.element(a).data("$binding");
              c && n(c, function(c) {
                d ? (new RegExp("(^|\\s)" + ud(b) + "(\\s|\\||$)")).test(c) && g.push(a) : -1 != c.indexOf(b) && g.push(a)
              })
            });
            return g
          },
          findModels: function(a, b, d) {
            for (var g = ["ng-", "data-ng-", "ng\\:"], h = 0; h < g.length; ++h) {
              var k = a.querySelectorAll("[" + g[h] + "model" + (d ? "=" : "*=") + '"' + b + '"]');
              if (k.length) return k
            }
          },
          getLocation: function() {
            return d.url()
          },
          setLocation: function(b) {
            b !== d.url() && (d.url(b), a.$digest())
          },
          whenStable: function(a) {
            b.notifyWhenNoOutstandingRequests(a)
          }
        }
      }
    ]
  }

  function uf() {
    this.$get = ["$rootScope", "$browser", "$q", "$$q", "$exceptionHandler", function(a, b, d, c, e) {
      function f(f, k, l) {
        z(f) || (l = k, k = f, f = x);
        var m = ra.call(arguments, 3),
          r = y(l) && !l,
          t = (r ? c : d).defer(),
          n = t.promise,
          q;
        q = b.defer(function() {
          try {
            t.resolve(f.apply(null, m))
          } catch (b) {
            t.reject(b), e(b)
          } finally {
            delete g[n.$$timeoutId]
          }
          r || a.$apply()
        }, k);
        n.$$timeoutId = q;
        g[q] = t;
        return n
      }
      var g = {};
      f.cancel = function(a) {
        return a && a.$$timeoutId in g ? (g[a.$$timeoutId].reject("canceled"), delete g[a.$$timeoutId], b.defer.cancel(a.$$timeoutId)) : !1
      };
      return f
    }]
  }

  function wa(a) {
    Ha && (Y.setAttribute("href", a), a = Y.href);
    Y.setAttribute("href", a);
    return {
      href: Y.href,
      protocol: Y.protocol ? Y.protocol.replace(/:$/, "") : "",
      host: Y.host,
      search: Y.search ? Y.search.replace(/^\?/, "") : "",
      hash: Y.hash ? Y.hash.replace(/^#/, "") : "",
      hostname: Y.hostname,
      port: Y.port,
      pathname: "/" === Y.pathname.charAt(0) ? Y.pathname : "/" + Y.pathname
    }
  }

  function ed(a) {
    a =
      E(a) ? wa(a) : a;
    return a.protocol === wd.protocol && a.host === wd.host
  }

  function vf() {
    this.$get = na(S)
  }

  function xd(a) {
    function b(a) {
      try {
        return decodeURIComponent(a)
      } catch (b) {
        return a
      }
    }
    var d = a[0] || {},
      c = {},
      e = "";
    return function() {
      var a, g, h, k, l;
      a = d.cookie || "";
      if (a !== e)
        for (e = a, a = e.split("; "), c = {}, h = 0; h < a.length; h++) g = a[h], k = g.indexOf("="), 0 < k && (l = b(g.substring(0, k)), q(c[l]) && (c[l] = b(g.substring(k + 1))));
      return c
    }
  }

  function zf() {
    this.$get = xd
  }

  function Jc(a) {
    function b(d, c) {
      if (H(d)) {
        var e = {};
        n(d, function(a, c) {
          e[c] =
            b(c, a)
        });
        return e
      }
      return a.factory(d + "Filter", c)
    }
    this.register = b;
    this.$get = ["$injector", function(a) {
      return function(b) {
        return a.get(b + "Filter")
      }
    }];
    b("currency", yd);
    b("date", zd);
    b("filter", bg);
    b("json", cg);
    b("limitTo", dg);
    b("lowercase", eg);
    b("number", Ad);
    b("orderBy", Bd);
    b("uppercase", fg)
  }

  function bg() {
    return function(a, b, d) {
      if (!za(a)) {
        if (null == a) return a;
        throw G("filter")("notarray", a);
      }
      var c;
      switch (hc(b)) {
        case "function":
          break;
        case "boolean":
        case "null":
        case "number":
        case "string":
          c = !0;
        case "object":
          b =
            gg(b, d, c);
          break;
        default:
          return a
      }
      return Array.prototype.filter.call(a, b)
    }
  }

  function gg(a, b, d) {
    var c = H(a) && "$" in a;
    !0 === b ? b = ma : z(b) || (b = function(a, b) {
      if (q(a)) return !1;
      if (null === a || null === b) return a === b;
      if (H(b) || H(a) && !qc(a)) return !1;
      a = F("" + a);
      b = F("" + b);
      return -1 !== a.indexOf(b)
    });
    return function(e) {
      return c && !H(e) ? Ka(e, a.$, b, !1) : Ka(e, a, b, d)
    }
  }

  function Ka(a, b, d, c, e) {
    var f = hc(a),
      g = hc(b);
    if ("string" === g && "!" === b.charAt(0)) return !Ka(a, b.substring(1), d, c);
    if (I(a)) return a.some(function(a) {
      return Ka(a, b, d, c)
    });
    switch (f) {
      case "object":
        var h;
        if (c) {
          for (h in a)
            if ("$" !== h.charAt(0) && Ka(a[h], b, d, !0)) return !0;
          return e ? !1 : Ka(a, b, d, !1)
        }
        if ("object" === g) {
          for (h in b)
            if (e = b[h], !z(e) && !q(e) && (f = "$" === h, !Ka(f ? a : a[h], e, d, f, f))) return !1;
          return !0
        }
        return d(a, b);
      case "function":
        return !1;
      default:
        return d(a, b)
    }
  }

  function hc(a) {
    return null === a ? "null" : typeof a
  }

  function yd(a) {
    var b = a.NUMBER_FORMATS;
    return function(a, c, e) {
      q(c) && (c = b.CURRENCY_SYM);
      q(e) && (e = b.PATTERNS[1].maxFrac);
      return null == a ? a : Cd(a, b.PATTERNS[1], b.GROUP_SEP, b.DECIMAL_SEP,
        e).replace(/\u00A4/g, c)
    }
  }

  function Ad(a) {
    var b = a.NUMBER_FORMATS;
    return function(a, c) {
      return null == a ? a : Cd(a, b.PATTERNS[0], b.GROUP_SEP, b.DECIMAL_SEP, c)
    }
  }

  function Cd(a, b, d, c, e) {
    if (H(a)) return "";
    var f = 0 > a;
    a = Math.abs(a);
    var g = Infinity === a;
    if (!g && !isFinite(a)) return "";
    var h = a + "",
      k = "",
      l = !1,
      m = [];
    g && (k = "\u221e");
    if (!g && -1 !== h.indexOf("e")) {
      var r = h.match(/([\d\.]+)e(-?)(\d+)/);
      r && "-" == r[2] && r[3] > e + 1 ? a = 0 : (k = h, l = !0)
    }
    if (g || l) 0 < e && 1 > a && (k = a.toFixed(e), a = parseFloat(k), k = k.replace(ic, c));
    else {
      g = (h.split(ic)[1] || "").length;
      q(e) && (e = Math.min(Math.max(b.minFrac, g), b.maxFrac));
      a = +(Math.round(+(a.toString() + "e" + e)).toString() + "e" + -e);
      var g = ("" + a).split(ic),
        h = g[0],
        g = g[1] || "",
        r = 0,
        t = b.lgSize,
        n = b.gSize;
      if (h.length >= t + n)
        for (r = h.length - t, l = 0; l < r; l++) 0 === (r - l) % n && 0 !== l && (k += d), k += h.charAt(l);
      for (l = r; l < h.length; l++) 0 === (h.length - l) % t && 0 !== l && (k += d), k += h.charAt(l);
      for (; g.length < e;) g += "0";
      e && "0" !== e && (k += c + g.substr(0, e))
    }
    0 === a && (f = !1);
    m.push(f ? b.negPre : b.posPre, k, f ? b.negSuf : b.posSuf);
    return m.join("")
  }

  function Gb(a, b, d) {
    var c = "";
    0 > a && (c = "-", a = -a);
    for (a = "" + a; a.length < b;) a = "0" + a;
    d && (a = a.substr(a.length - b));
    return c + a
  }

  function ca(a, b, d, c) {
    d = d || 0;
    return function(e) {
      e = e["get" + a]();
      if (0 < d || e > -d) e += d;
      0 === e && -12 == d && (e = 12);
      return Gb(e, b, c)
    }
  }

  function Hb(a, b) {
    return function(d, c) {
      var e = d["get" + a](),
        f = sb(b ? "SHORT" + a : a);
      return c[f][e]
    }
  }

  function Dd(a) {
    var b = (new Date(a, 0, 1)).getDay();
    return new Date(a, 0, (4 >= b ? 5 : 12) - b)
  }

  function Ed(a) {
    return function(b) {
      var d = Dd(b.getFullYear());
      b = +new Date(b.getFullYear(), b.getMonth(), b.getDate() + (4 - b.getDay())) -
        +d;
      b = 1 + Math.round(b / 6048E5);
      return Gb(b, a)
    }
  }

  function jc(a, b) {
    return 0 >= a.getFullYear() ? b.ERAS[0] : b.ERAS[1]
  }

  function zd(a) {
    function b(a) {
      var b;
      if (b = a.match(d)) {
        a = new Date(0);
        var f = 0,
          g = 0,
          h = b[8] ? a.setUTCFullYear : a.setFullYear,
          k = b[8] ? a.setUTCHours : a.setHours;
        b[9] && (f = ea(b[9] + b[10]), g = ea(b[9] + b[11]));
        h.call(a, ea(b[1]), ea(b[2]) - 1, ea(b[3]));
        f = ea(b[4] || 0) - f;
        g = ea(b[5] || 0) - g;
        h = ea(b[6] || 0);
        b = Math.round(1E3 * parseFloat("0." + (b[7] || 0)));
        k.call(a, f, g, h, b)
      }
      return a
    }
    var d = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
    return function(c, d, f) {
      var g = "",
        h = [],
        k, l;
      d = d || "mediumDate";
      d = a.DATETIME_FORMATS[d] || d;
      E(c) && (c = hg.test(c) ? ea(c) : b(c));
      Q(c) && (c = new Date(c));
      if (!da(c) || !isFinite(c.getTime())) return c;
      for (; d;)(l = ig.exec(d)) ? (h = cb(h, l, 1), d = h.pop()) : (h.push(d), d = null);
      var m = c.getTimezoneOffset();
      f && (m = vc(f, c.getTimezoneOffset()), c = Pb(c, f, !0));
      n(h, function(b) {
        k = jg[b];
        g += k ? k(c, a.DATETIME_FORMATS, m) : b.replace(/(^'|'$)/g, "").replace(/''/g, "'")
      });
      return g
    }
  }

  function cg() {
    return function(a, b) {
      q(b) && (b = 2);
      return db(a, b)
    }
  }

  function dg() {
    return function(a,
      b, d) {
      b = Infinity === Math.abs(Number(b)) ? Number(b) : ea(b);
      if (isNaN(b)) return a;
      Q(a) && (a = a.toString());
      if (!I(a) && !E(a)) return a;
      d = !d || isNaN(d) ? 0 : ea(d);
      d = 0 > d ? Math.max(0, a.length + d) : d;
      return 0 <= b ? a.slice(d, d + b) : 0 === d ? a.slice(b, a.length) : a.slice(Math.max(0, d + b), d)
    }
  }

  function Bd(a) {
    function b(b, d) {
      d = d ? -1 : 1;
      return b.map(function(b) {
        var c = 1,
          h = Ya;
        if (z(b)) h = b;
        else if (E(b)) {
          if ("+" == b.charAt(0) || "-" == b.charAt(0)) c = "-" == b.charAt(0) ? -1 : 1, b = b.substring(1);
          if ("" !== b && (h = a(b), h.constant)) var k = h(),
            h = function(a) {
              return a[k]
            }
        }
        return {
          get: h,
          descending: c * d
        }
      })
    }

    function d(a) {
      switch (typeof a) {
        case "number":
        case "boolean":
        case "string":
          return !0;
        default:
          return !1
      }
    }
    return function(a, e, f) {
      if (!za(a)) return a;
      I(e) || (e = [e]);
      0 === e.length && (e = ["+"]);
      var g = b(e, f);
      g.push({
        get: function() {
          return {}
        },
        descending: f ? -1 : 1
      });
      a = Array.prototype.map.call(a, function(a, b) {
        return {
          value: a,
          predicateValues: g.map(function(c) {
            var e = c.get(a);
            c = typeof e;
            if (null === e) c = "string", e = "null";
            else if ("string" === c) e = e.toLowerCase();
            else if ("object" === c) a: {
              if ("function" === typeof e.valueOf &&
                (e = e.valueOf(), d(e))) break a;
              if (qc(e) && (e = e.toString(), d(e))) break a;e = b
            }
            return {
              value: e,
              type: c
            }
          })
        }
      });
      a.sort(function(a, b) {
        for (var c = 0, d = 0, e = g.length; d < e; ++d) {
          var c = a.predicateValues[d],
            f = b.predicateValues[d],
            n = 0;
          c.type === f.type ? c.value !== f.value && (n = c.value < f.value ? -1 : 1) : n = c.type < f.type ? -1 : 1;
          if (c = n * g[d].descending) break
        }
        return c
      });
      return a = a.map(function(a) {
        return a.value
      })
    }
  }

  function La(a) {
    z(a) && (a = {
      link: a
    });
    a.restrict = a.restrict || "AC";
    return na(a)
  }

  function Fd(a, b, d, c, e) {
    var f = this,
      g = [];
    f.$error = {};
    f.$$success = {};
    f.$pending = u;
    f.$name = e(b.name || b.ngForm || "")(d);
    f.$dirty = !1;
    f.$pristine = !0;
    f.$valid = !0;
    f.$invalid = !1;
    f.$submitted = !1;
    f.$$parentForm = Ib;
    f.$rollbackViewValue = function() {
      n(g, function(a) {
        a.$rollbackViewValue()
      })
    };
    f.$commitViewValue = function() {
      n(g, function(a) {
        a.$commitViewValue()
      })
    };
    f.$addControl = function(a) {
      Ra(a.$name, "input");
      g.push(a);
      a.$name && (f[a.$name] = a);
      a.$$parentForm = f
    };
    f.$$renameControl = function(a, b) {
      var c = a.$name;
      f[c] === a && delete f[c];
      f[b] = a;
      a.$name = b
    };
    f.$removeControl = function(a) {
      a.$name &&
        f[a.$name] === a && delete f[a.$name];
      n(f.$pending, function(b, c) {
        f.$setValidity(c, null, a)
      });
      n(f.$error, function(b, c) {
        f.$setValidity(c, null, a)
      });
      n(f.$$success, function(b, c) {
        f.$setValidity(c, null, a)
      });
      ab(g, a);
      a.$$parentForm = Ib
    };
    Gd({
      ctrl: this,
      $element: a,
      set: function(a, b, c) {
        var d = a[b];
        d ? -1 === d.indexOf(c) && d.push(c) : a[b] = [c]
      },
      unset: function(a, b, c) {
        var d = a[b];
        d && (ab(d, c), 0 === d.length && delete a[b])
      },
      $animate: c
    });
    f.$setDirty = function() {
      c.removeClass(a, Wa);
      c.addClass(a, Jb);
      f.$dirty = !0;
      f.$pristine = !1;
      f.$$parentForm.$setDirty()
    };
    f.$setPristine = function() {
      c.setClass(a, Wa, Jb + " ng-submitted");
      f.$dirty = !1;
      f.$pristine = !0;
      f.$submitted = !1;
      n(g, function(a) {
        a.$setPristine()
      })
    };
    f.$setUntouched = function() {
      n(g, function(a) {
        a.$setUntouched()
      })
    };
    f.$setSubmitted = function() {
      c.addClass(a, "ng-submitted");
      f.$submitted = !0;
      f.$$parentForm.$setSubmitted()
    }
  }

  function kc(a) {
    a.$formatters.push(function(b) {
      return a.$isEmpty(b) ? b : b.toString()
    })
  }

  function jb(a, b, d, c, e, f) {
    var g = F(b[0].type);
    if (!e.android) {
      var h = !1;
      b.on("compositionstart", function(a) {
        h = !0
      });
      b.on("compositionend", function() {
        h = !1;
        k()
      })
    }
    var k = function(a) {
      l && (f.defer.cancel(l), l = null);
      if (!h) {
        var e = b.val();
        a = a && a.type;
        "password" === g || d.ngTrim && "false" === d.ngTrim || (e = U(e));
        (c.$viewValue !== e || "" === e && c.$$hasNativeValidators) && c.$setViewValue(e, a)
      }
    };
    if (e.hasEvent("input")) b.on("input", k);
    else {
      var l, m = function(a, b, c) {
        l || (l = f.defer(function() {
          l = null;
          b && b.value === c || k(a)
        }))
      };
      b.on("keydown", function(a) {
        var b = a.keyCode;
        91 === b || 15 < b && 19 > b || 37 <= b && 40 >= b || m(a, this, this.value)
      });
      if (e.hasEvent("paste")) b.on("paste cut",
        m)
    }
    b.on("change", k);
    c.$render = function() {
      var a = c.$isEmpty(c.$viewValue) ? "" : c.$viewValue;
      b.val() !== a && b.val(a)
    }
  }

  function Kb(a, b) {
    return function(d, c) {
      var e, f;
      if (da(d)) return d;
      if (E(d)) {
        '"' == d.charAt(0) && '"' == d.charAt(d.length - 1) && (d = d.substring(1, d.length - 1));
        if (kg.test(d)) return new Date(d);
        a.lastIndex = 0;
        if (e = a.exec(d)) return e.shift(), f = c ? {
          yyyy: c.getFullYear(),
          MM: c.getMonth() + 1,
          dd: c.getDate(),
          HH: c.getHours(),
          mm: c.getMinutes(),
          ss: c.getSeconds(),
          sss: c.getMilliseconds() / 1E3
        } : {
          yyyy: 1970,
          MM: 1,
          dd: 1,
          HH: 0,
          mm: 0,
          ss: 0,
          sss: 0
        }, n(e, function(a, c) {
          c < b.length && (f[b[c]] = +a)
        }), new Date(f.yyyy, f.MM - 1, f.dd, f.HH, f.mm, f.ss || 0, 1E3 * f.sss || 0)
      }
      return NaN
    }
  }

  function kb(a, b, d, c) {
    return function(e, f, g, h, k, l, m) {
      function r(a) {
        return a && !(a.getTime && a.getTime() !== a.getTime())
      }

      function n(a) {
        return y(a) && !da(a) ? d(a) || u : a
      }
      Hd(e, f, g, h);
      jb(e, f, g, h, k, l);
      var A = h && h.$options && h.$options.timezone,
        v;
      h.$$parserName = a;
      h.$parsers.push(function(a) {
        return h.$isEmpty(a) ? null : b.test(a) ? (a = d(a, v), A && (a = Pb(a, A)), a) : u
      });
      h.$formatters.push(function(a) {
        if (a &&
          !da(a)) throw lb("datefmt", a);
        if (r(a)) return (v = a) && A && (v = Pb(v, A, !0)), m("date")(a, c, A);
        v = null;
        return ""
      });
      if (y(g.min) || g.ngMin) {
        var s;
        h.$validators.min = function(a) {
          return !r(a) || q(s) || d(a) >= s
        };
        g.$observe("min", function(a) {
          s = n(a);
          h.$validate()
        })
      }
      if (y(g.max) || g.ngMax) {
        var p;
        h.$validators.max = function(a) {
          return !r(a) || q(p) || d(a) <= p
        };
        g.$observe("max", function(a) {
          p = n(a);
          h.$validate()
        })
      }
    }
  }

  function Hd(a, b, d, c) {
    (c.$$hasNativeValidators = H(b[0].validity)) && c.$parsers.push(function(a) {
      var c = b.prop("validity") || {};
      return c.badInput && !c.typeMismatch ? u : a
    })
  }

  function Id(a, b, d, c, e) {
    if (y(c)) {
      a = a(c);
      if (!a.constant) throw lb("constexpr", d, c);
      return a(b)
    }
    return e
  }

  function lc(a, b) {
    a = "ngClass" + a;
    return ["$animate", function(d) {
      function c(a, b) {
        var c = [],
          d = 0;
        a: for (; d < a.length; d++) {
          for (var e = a[d], m = 0; m < b.length; m++)
            if (e == b[m]) continue a;
          c.push(e)
        }
        return c
      }

      function e(a) {
        var b = [];
        return I(a) ? (n(a, function(a) {
          b = b.concat(e(a))
        }), b) : E(a) ? a.split(" ") : H(a) ? (n(a, function(a, c) {
          a && (b = b.concat(c.split(" ")))
        }), b) : a
      }
      return {
        restrict: "AC",
        link: function(f, g, h) {
          function k(a, b) {
            var c = g.data("$classCounts") || $(),
              d = [];
            n(a, function(a) {
              if (0 < b || c[a]) c[a] = (c[a] || 0) + b, c[a] === +(0 < b) && d.push(a)
            });
            g.data("$classCounts", c);
            return d.join(" ")
          }

          function l(a) {
            if (!0 === b || f.$index % 2 === b) {
              var l = e(a || []);
              if (!m) {
                var n = k(l, 1);
                h.$addClass(n)
              } else if (!ma(a, m)) {
                var q = e(m),
                  n = c(l, q),
                  l = c(q, l),
                  n = k(n, 1),
                  l = k(l, -1);
                n && n.length && d.addClass(g, n);
                l && l.length && d.removeClass(g, l)
              }
            }
            m = ia(a)
          }
          var m;
          f.$watch(h[a], l, !0);
          h.$observe("class", function(b) {
            l(f.$eval(h[a]))
          });
          "ngClass" !==
          a && f.$watch("$index", function(c, d) {
            var g = c & 1;
            if (g !== (d & 1)) {
              var l = e(f.$eval(h[a]));
              g === b ? (g = k(l, 1), h.$addClass(g)) : (g = k(l, -1), h.$removeClass(g))
            }
          })
        }
      }
    }]
  }

  function Gd(a) {
    function b(a, b) {
      b && !f[a] ? (k.addClass(e, a), f[a] = !0) : !b && f[a] && (k.removeClass(e, a), f[a] = !1)
    }

    function d(a, c) {
      a = a ? "-" + zc(a, "-") : "";
      b(mb + a, !0 === c);
      b(Jd + a, !1 === c)
    }
    var c = a.ctrl,
      e = a.$element,
      f = {},
      g = a.set,
      h = a.unset,
      k = a.$animate;
    f[Jd] = !(f[mb] = e.hasClass(mb));
    c.$setValidity = function(a, e, f) {
      q(e) ? (c.$pending || (c.$pending = {}), g(c.$pending, a, f)) : (c.$pending &&
        h(c.$pending, a, f), Kd(c.$pending) && (c.$pending = u));
      $a(e) ? e ? (h(c.$error, a, f), g(c.$$success, a, f)) : (g(c.$error, a, f), h(c.$$success, a, f)) : (h(c.$error, a, f), h(c.$$success, a, f));
      c.$pending ? (b(Ld, !0), c.$valid = c.$invalid = u, d("", null)) : (b(Ld, !1), c.$valid = Kd(c.$error), c.$invalid = !c.$valid, d("", c.$valid));
      e = c.$pending && c.$pending[a] ? u : c.$error[a] ? !1 : c.$$success[a] ? !0 : null;
      d(a, e);
      c.$$parentForm.$setValidity(a, e, c)
    }
  }

  function Kd(a) {
    if (a)
      for (var b in a)
        if (a.hasOwnProperty(b)) return !1;
    return !0
  }
  var lg = /^\/(.+)\/([a-z]*)$/,
    F = function(a) {
      return E(a) ? a.toLowerCase() : a
    },
    qa = Object.prototype.hasOwnProperty,
    sb = function(a) {
      return E(a) ? a.toUpperCase() : a
    },
    Ha, B, oa, ra = [].slice,
    Pf = [].splice,
    mg = [].push,
    sa = Object.prototype.toString,
    rc = Object.getPrototypeOf,
    Aa = G("ng"),
    fa = S.angular || (S.angular = {}),
    Sb, nb = 0;
  Ha = X.documentMode;
  x.$inject = [];
  Ya.$inject = [];
  var I = Array.isArray,
    Vd = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/,
    U = function(a) {
      return E(a) ? a.trim() : a
    },
    ud = function(a) {
      return a.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,
        "\\$1").replace(/\x08/g, "\\x08")
    },
    Ba = function() {
      if (!y(Ba.rules)) {
        var a = X.querySelector("[ng-csp]") || X.querySelector("[data-ng-csp]");
        if (a) {
          var b = a.getAttribute("ng-csp") || a.getAttribute("data-ng-csp");
          Ba.rules = {
            noUnsafeEval: !b || -1 !== b.indexOf("no-unsafe-eval"),
            noInlineStyle: !b || -1 !== b.indexOf("no-inline-style")
          }
        } else {
          a = Ba;
          try {
            new Function(""), b = !1
          } catch (d) {
            b = !0
          }
          a.rules = {
            noUnsafeEval: b,
            noInlineStyle: !1
          }
        }
      }
      return Ba.rules
    },
    pb = function() {
      if (y(pb.name_)) return pb.name_;
      var a, b, d = Oa.length,
        c, e;
      for (b = 0; b <
        d; ++b)
        if (c = Oa[b], a = X.querySelector("[" + c.replace(":", "\\:") + "jq]")) {
          e = a.getAttribute(c + "jq");
          break
        }
      return pb.name_ = e
    },
    Oa = ["ng-", "data-ng-", "ng:", "x-ng-"],
    be = /[A-Z]/g,
    Ac = !1,
    Rb, Na = 3,
    fe = {
      full: "1.4.8",
      major: 1,
      minor: 4,
      dot: 8,
      codeName: "ice-manipulation"
    };
  N.expando = "ng339";
  var gb = N.cache = {},
    Ff = 1;
  N._data = function(a) {
    return this.cache[a[this.expando]] || {}
  };
  var Af = /([\:\-\_]+(.))/g,
    Bf = /^moz([A-Z])/,
    xb = {
      mouseleave: "mouseout",
      mouseenter: "mouseover"
    },
    Ub = G("jqLite"),
    Ef = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,
    Tb = /<|&#?\w+;/,
    Cf = /<([\w:-]+)/,
    Df = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
    ka = {
      option: [1, '<select multiple="multiple">', "</select>"],
      thead: [1, "<table>", "</table>"],
      col: [2, "<table><colgroup>", "</colgroup></table>"],
      tr: [2, "<table><tbody>", "</tbody></table>"],
      td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
      _default: [0, "", ""]
    };
  ka.optgroup = ka.option;
  ka.tbody = ka.tfoot = ka.colgroup = ka.caption = ka.thead;
  ka.th = ka.td;
  var Kf = Node.prototype.contains || function(a) {
      return !!(this.compareDocumentPosition(a) &
        16)
    },
    Pa = N.prototype = {
      ready: function(a) {
        function b() {
          d || (d = !0, a())
        }
        var d = !1;
        "complete" === X.readyState ? setTimeout(b) : (this.on("DOMContentLoaded", b), N(S).on("load", b))
      },
      toString: function() {
        var a = [];
        n(this, function(b) {
          a.push("" + b)
        });
        return "[" + a.join(", ") + "]"
      },
      eq: function(a) {
        return 0 <= a ? B(this[a]) : B(this[this.length + a])
      },
      length: 0,
      push: mg,
      sort: [].sort,
      splice: [].splice
    },
    Cb = {};
  n("multiple selected checked disabled readOnly required open".split(" "), function(a) {
    Cb[F(a)] = a
  });
  var Rc = {};
  n("input select option textarea button form details".split(" "),
    function(a) {
      Rc[a] = !0
    });
  var Zc = {
    ngMinlength: "minlength",
    ngMaxlength: "maxlength",
    ngMin: "min",
    ngMax: "max",
    ngPattern: "pattern"
  };
  n({
    data: Wb,
    removeData: vb,
    hasData: function(a) {
      for (var b in gb[a.ng339]) return !0;
      return !1
    }
  }, function(a, b) {
    N[b] = a
  });
  n({
    data: Wb,
    inheritedData: Bb,
    scope: function(a) {
      return B.data(a, "$scope") || Bb(a.parentNode || a, ["$isolateScope", "$scope"])
    },
    isolateScope: function(a) {
      return B.data(a, "$isolateScope") || B.data(a, "$isolateScopeNoTemplate")
    },
    controller: Oc,
    injector: function(a) {
      return Bb(a,
        "$injector")
    },
    removeAttr: function(a, b) {
      a.removeAttribute(b)
    },
    hasClass: yb,
    css: function(a, b, d) {
      b = fb(b);
      if (y(d)) a.style[b] = d;
      else return a.style[b]
    },
    attr: function(a, b, d) {
      var c = a.nodeType;
      if (c !== Na && 2 !== c && 8 !== c)
        if (c = F(b), Cb[c])
          if (y(d)) d ? (a[b] = !0, a.setAttribute(b, c)) : (a[b] = !1, a.removeAttribute(c));
          else return a[b] || (a.attributes.getNamedItem(b) || x).specified ? c : u;
      else if (y(d)) a.setAttribute(b, d);
      else if (a.getAttribute) return a = a.getAttribute(b, 2), null === a ? u : a
    },
    prop: function(a, b, d) {
      if (y(d)) a[b] = d;
      else return a[b]
    },
    text: function() {
      function a(a, d) {
        if (q(d)) {
          var c = a.nodeType;
          return 1 === c || c === Na ? a.textContent : ""
        }
        a.textContent = d
      }
      a.$dv = "";
      return a
    }(),
    val: function(a, b) {
      if (q(b)) {
        if (a.multiple && "select" === ta(a)) {
          var d = [];
          n(a.options, function(a) {
            a.selected && d.push(a.value || a.text)
          });
          return 0 === d.length ? null : d
        }
        return a.value
      }
      a.value = b
    },
    html: function(a, b) {
      if (q(b)) return a.innerHTML;
      ub(a, !0);
      a.innerHTML = b
    },
    empty: Pc
  }, function(a, b) {
    N.prototype[b] = function(b, c) {
      var e, f, g = this.length;
      if (a !== Pc && q(2 == a.length && a !== yb && a !== Oc ?
          b : c)) {
        if (H(b)) {
          for (e = 0; e < g; e++)
            if (a === Wb) a(this[e], b);
            else
              for (f in b) a(this[e], f, b[f]);
          return this
        }
        e = a.$dv;
        g = q(e) ? Math.min(g, 1) : g;
        for (f = 0; f < g; f++) {
          var h = a(this[f], b, c);
          e = e ? e + h : h
        }
        return e
      }
      for (e = 0; e < g; e++) a(this[e], b, c);
      return this
    }
  });
  n({
    removeData: vb,
    on: function(a, b, d, c) {
      if (y(c)) throw Ub("onargs");
      if (Kc(a)) {
        c = wb(a, !0);
        var e = c.events,
          f = c.handle;
        f || (f = c.handle = Hf(a, e));
        c = 0 <= b.indexOf(" ") ? b.split(" ") : [b];
        for (var g = c.length, h = function(b, c, g) {
            var h = e[b];
            h || (h = e[b] = [], h.specialHandlerWrapper = c, "$destroy" ===
              b || g || a.addEventListener(b, f, !1));
            h.push(d)
          }; g--;) b = c[g], xb[b] ? (h(xb[b], Jf), h(b, u, !0)) : h(b)
      }
    },
    off: Nc,
    one: function(a, b, d) {
      a = B(a);
      a.on(b, function e() {
        a.off(b, d);
        a.off(b, e)
      });
      a.on(b, d)
    },
    replaceWith: function(a, b) {
      var d, c = a.parentNode;
      ub(a);
      n(new N(b), function(b) {
        d ? c.insertBefore(b, d.nextSibling) : c.replaceChild(b, a);
        d = b
      })
    },
    children: function(a) {
      var b = [];
      n(a.childNodes, function(a) {
        1 === a.nodeType && b.push(a)
      });
      return b
    },
    contents: function(a) {
      return a.contentDocument || a.childNodes || []
    },
    append: function(a, b) {
      var d =
        a.nodeType;
      if (1 === d || 11 === d) {
        b = new N(b);
        for (var d = 0, c = b.length; d < c; d++) a.appendChild(b[d])
      }
    },
    prepend: function(a, b) {
      if (1 === a.nodeType) {
        var d = a.firstChild;
        n(new N(b), function(b) {
          a.insertBefore(b, d)
        })
      }
    },
    wrap: function(a, b) {
      b = B(b).eq(0).clone()[0];
      var d = a.parentNode;
      d && d.replaceChild(b, a);
      b.appendChild(a)
    },
    remove: Xb,
    detach: function(a) {
      Xb(a, !0)
    },
    after: function(a, b) {
      var d = a,
        c = a.parentNode;
      b = new N(b);
      for (var e = 0, f = b.length; e < f; e++) {
        var g = b[e];
        c.insertBefore(g, d.nextSibling);
        d = g
      }
    },
    addClass: Ab,
    removeClass: zb,
    toggleClass: function(a, b, d) {
      b && n(b.split(" "), function(b) {
        var e = d;
        q(e) && (e = !yb(a, b));
        (e ? Ab : zb)(a, b)
      })
    },
    parent: function(a) {
      return (a = a.parentNode) && 11 !== a.nodeType ? a : null
    },
    next: function(a) {
      return a.nextElementSibling
    },
    find: function(a, b) {
      return a.getElementsByTagName ? a.getElementsByTagName(b) : []
    },
    clone: Vb,
    triggerHandler: function(a, b, d) {
      var c, e, f = b.type || b,
        g = wb(a);
      if (g = (g = g && g.events) && g[f]) c = {
        preventDefault: function() {
          this.defaultPrevented = !0
        },
        isDefaultPrevented: function() {
          return !0 === this.defaultPrevented
        },
        stopImmediatePropagation: function() {
          this.immediatePropagationStopped = !0
        },
        isImmediatePropagationStopped: function() {
          return !0 === this.immediatePropagationStopped
        },
        stopPropagation: x,
        type: f,
        target: a
      }, b.type && (c = M(c, b)), b = ia(g), e = d ? [c].concat(d) : [c], n(b, function(b) {
        c.isImmediatePropagationStopped() || b.apply(a, e)
      })
    }
  }, function(a, b) {
    N.prototype[b] = function(b, c, e) {
      for (var f, g = 0, h = this.length; g < h; g++) q(f) ? (f = a(this[g], b, c, e), y(f) && (f = B(f))) : Mc(f, a(this[g], b, c, e));
      return y(f) ? f : this
    };
    N.prototype.bind = N.prototype.on;
    N.prototype.unbind = N.prototype.off
  });
  Sa.prototype = {
    put: function(a, b) {
      this[Ca(a, this.nextUid)] = b
    },
    get: function(a) {
      return this[Ca(a, this.nextUid)]
    },
    remove: function(a) {
      var b = this[a = Ca(a, this.nextUid)];
      delete this[a];
      return b
    }
  };
  var yf = [function() {
      this.$get = [function() {
        return Sa
      }]
    }],
    Tc = /^[^\(]*\(\s*([^\)]*)\)/m,
    ng = /,/,
    og = /^\s*(_?)(\S+?)\1\s*$/,
    Sc = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
    Da = G("$injector");
  eb.$$annotate = function(a, b, d) {
    var c;
    if ("function" === typeof a) {
      if (!(c = a.$inject)) {
        c = [];
        if (a.length) {
          if (b) throw E(d) &&
            d || (d = a.name || Lf(a)), Da("strictdi", d);
          b = a.toString().replace(Sc, "");
          b = b.match(Tc);
          n(b[1].split(ng), function(a) {
            a.replace(og, function(a, b, d) {
              c.push(d)
            })
          })
        }
        a.$inject = c
      }
    } else I(a) ? (b = a.length - 1, Qa(a[b], "fn"), c = a.slice(0, b)) : Qa(a, "fn", !0);
    return c
  };
  var Md = G("$animate"),
    Ue = function() {
      this.$get = ["$q", "$$rAF", function(a, b) {
        function d() {}
        d.all = x;
        d.chain = x;
        d.prototype = {
          end: x,
          cancel: x,
          resume: x,
          pause: x,
          complete: x,
          then: function(c, d) {
            return a(function(a) {
              b(function() {
                a()
              })
            }).then(c, d)
          }
        };
        return d
      }]
    },
    Te = function() {
      var a =
        new Sa,
        b = [];
      this.$get = ["$$AnimateRunner", "$rootScope", function(d, c) {
        function e(a, b, c) {
          var d = !1;
          b && (b = E(b) ? b.split(" ") : I(b) ? b : [], n(b, function(b) {
            b && (d = !0, a[b] = c)
          }));
          return d
        }

        function f() {
          n(b, function(b) {
            var c = a.get(b);
            if (c) {
              var d = Mf(b.attr("class")),
                e = "",
                f = "";
              n(c, function(a, b) {
                a !== !!d[b] && (a ? e += (e.length ? " " : "") + b : f += (f.length ? " " : "") + b)
              });
              n(b, function(a) {
                e && Ab(a, e);
                f && zb(a, f)
              });
              a.remove(b)
            }
          });
          b.length = 0
        }
        return {
          enabled: x,
          on: x,
          off: x,
          pin: x,
          push: function(g, h, k, l) {
            l && l();
            k = k || {};
            k.from && g.css(k.from);
            k.to && g.css(k.to);
            if (k.addClass || k.removeClass)
              if (h = k.addClass, l = k.removeClass, k = a.get(g) || {}, h = e(k, h, !0), l = e(k, l, !1), h || l) a.put(g, k), b.push(g), 1 === b.length && c.$$postDigest(f);
            return new d
          }
        }
      }]
    },
    Re = ["$provide", function(a) {
      var b = this;
      this.$$registeredAnimations = Object.create(null);
      this.register = function(d, c) {
        if (d && "." !== d.charAt(0)) throw Md("notcsel", d);
        var e = d + "-animation";
        b.$$registeredAnimations[d.substr(1)] = e;
        a.factory(e, c)
      };
      this.classNameFilter = function(a) {
        if (1 === arguments.length && (this.$$classNameFilter =
            a instanceof RegExp ? a : null) && /(\s+|\/)ng-animate(\s+|\/)/.test(this.$$classNameFilter.toString())) throw Md("nongcls", "ng-animate");
        return this.$$classNameFilter
      };
      this.$get = ["$$animateQueue", function(a) {
        function b(a, c, d) {
          if (d) {
            var h;
            a: {
              for (h = 0; h < d.length; h++) {
                var k = d[h];
                if (1 === k.nodeType) {
                  h = k;
                  break a
                }
              }
              h = void 0
            }!h || h.parentNode || h.previousElementSibling || (d = null)
          }
          d ? d.after(a) : c.prepend(a)
        }
        return {
          on: a.on,
          off: a.off,
          pin: a.pin,
          enabled: a.enabled,
          cancel: function(a) {
            a.end && a.end()
          },
          enter: function(e, f, g, h) {
            f =
              f && B(f);
            g = g && B(g);
            f = f || g.parent();
            b(e, f, g);
            return a.push(e, "enter", Ea(h))
          },
          move: function(e, f, g, h) {
            f = f && B(f);
            g = g && B(g);
            f = f || g.parent();
            b(e, f, g);
            return a.push(e, "move", Ea(h))
          },
          leave: function(b, c) {
            return a.push(b, "leave", Ea(c), function() {
              b.remove()
            })
          },
          addClass: function(b, c, g) {
            g = Ea(g);
            g.addClass = hb(g.addclass, c);
            return a.push(b, "addClass", g)
          },
          removeClass: function(b, c, g) {
            g = Ea(g);
            g.removeClass = hb(g.removeClass, c);
            return a.push(b, "removeClass", g)
          },
          setClass: function(b, c, g, h) {
            h = Ea(h);
            h.addClass = hb(h.addClass,
              c);
            h.removeClass = hb(h.removeClass, g);
            return a.push(b, "setClass", h)
          },
          animate: function(b, c, g, h, k) {
            k = Ea(k);
            k.from = k.from ? M(k.from, c) : c;
            k.to = k.to ? M(k.to, g) : g;
            k.tempClasses = hb(k.tempClasses, h || "ng-inline-animate");
            return a.push(b, "animate", k)
          }
        }
      }]
    }],
    Se = function() {
      this.$get = ["$$rAF", "$q", function(a, b) {
        var d = function() {};
        d.prototype = {
          done: function(a) {
            this.defer && this.defer[!0 === a ? "reject" : "resolve"]()
          },
          end: function() {
            this.done()
          },
          cancel: function() {
            this.done(!0)
          },
          getPromise: function() {
            this.defer || (this.defer =
              b.defer());
            return this.defer.promise
          },
          then: function(a, b) {
            return this.getPromise().then(a, b)
          },
          "catch": function(a) {
            return this.getPromise()["catch"](a)
          },
          "finally": function(a) {
            return this.getPromise()["finally"](a)
          }
        };
        return function(b, e) {
          function f() {
            a(function() {
              e.addClass && (b.addClass(e.addClass), e.addClass = null);
              e.removeClass && (b.removeClass(e.removeClass), e.removeClass = null);
              e.to && (b.css(e.to), e.to = null);
              g || h.done();
              g = !0
            });
            return h
          }
          e.cleanupStyles && (e.from = e.to = null);
          e.from && (b.css(e.from), e.from =
            null);
          var g, h = new d;
          return {
            start: f,
            end: f
          }
        }
      }]
    },
    ha = G("$compile");
  Cc.$inject = ["$provide", "$$sanitizeUriProvider"];
  var Vc = /^((?:x|data)[\:\-_])/i,
    Qf = G("$controller"),
    Uc = /^(\S+)(\s+as\s+(\w+))?$/,
    $e = function() {
      this.$get = ["$document", function(a) {
        return function(b) {
          b ? !b.nodeType && b instanceof B && (b = b[0]) : b = a[0].body;
          return b.offsetWidth + 1
        }
      }]
    },
    $c = "application/json",
    ac = {
      "Content-Type": $c + ";charset=utf-8"
    },
    Sf = /^\[|^\{(?!\{)/,
    Tf = {
      "[": /]$/,
      "{": /}$/
    },
    Rf = /^\)\]\}',?\n/,
    pg = G("$http"),
    dd = function(a) {
      return function() {
        throw pg("legacy",
          a);
      }
    },
    Ja = fa.$interpolateMinErr = G("$interpolate");
  Ja.throwNoconcat = function(a) {
    throw Ja("noconcat", a);
  };
  Ja.interr = function(a, b) {
    return Ja("interr", a, b.toString())
  };
  var qg = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/,
    Vf = {
      http: 80,
      https: 443,
      ftp: 21
    },
    Db = G("$location"),
    rg = {
      $$html5: !1,
      $$replace: !1,
      absUrl: Eb("$$absUrl"),
      url: function(a) {
        if (q(a)) return this.$$url;
        var b = qg.exec(a);
        (b[1] || "" === a) && this.path(decodeURIComponent(b[1]));
        (b[2] || b[1] || "" === a) && this.search(b[3] || "");
        this.hash(b[5] || "");
        return this
      },
      protocol: Eb("$$protocol"),
      host: Eb("$$host"),
      port: Eb("$$port"),
      path: id("$$path", function(a) {
        a = null !== a ? a.toString() : "";
        return "/" == a.charAt(0) ? a : "/" + a
      }),
      search: function(a, b) {
        switch (arguments.length) {
          case 0:
            return this.$$search;
          case 1:
            if (E(a) || Q(a)) a = a.toString(), this.$$search = xc(a);
            else if (H(a)) a = bb(a, {}), n(a, function(b, c) {
              null == b && delete a[c]
            }), this.$$search = a;
            else throw Db("isrcharg");
            break;
          default:
            q(b) || null === b ? delete this.$$search[a] : this.$$search[a] = b
        }
        this.$$compose();
        return this
      },
      hash: id("$$hash", function(a) {
        return null !==
          a ? a.toString() : ""
      }),
      replace: function() {
        this.$$replace = !0;
        return this
      }
    };
  n([hd, dc, cc], function(a) {
    a.prototype = Object.create(rg);
    a.prototype.state = function(b) {
      if (!arguments.length) return this.$$state;
      if (a !== cc || !this.$$html5) throw Db("nostate");
      this.$$state = q(b) ? null : b;
      return this
    }
  });
  var ba = G("$parse"),
    Wf = Function.prototype.call,
    Xf = Function.prototype.apply,
    Yf = Function.prototype.bind,
    Lb = $();
  n("+ - * / % === !== == != < > <= >= && || ! = |".split(" "), function(a) {
    Lb[a] = !0
  });
  var sg = {
      n: "\n",
      f: "\f",
      r: "\r",
      t: "\t",
      v: "\v",
      "'": "'",
      '"': '"'
    },
    fc = function(a) {
      this.options = a
    };
  fc.prototype = {
    constructor: fc,
    lex: function(a) {
      this.text = a;
      this.index = 0;
      for (this.tokens = []; this.index < this.text.length;)
        if (a = this.text.charAt(this.index), '"' === a || "'" === a) this.readString(a);
        else if (this.isNumber(a) || "." === a && this.isNumber(this.peek())) this.readNumber();
      else if (this.isIdent(a)) this.readIdent();
      else if (this.is(a, "(){}[].,;:?")) this.tokens.push({
        index: this.index,
        text: a
      }), this.index++;
      else if (this.isWhitespace(a)) this.index++;
      else {
        var b = a + this.peek(),
          d = b + this.peek(2),
          c = Lb[b],
          e = Lb[d];
        Lb[a] || c || e ? (a = e ? d : c ? b : a, this.tokens.push({
          index: this.index,
          text: a,
          operator: !0
        }), this.index += a.length) : this.throwError("Unexpected next character ", this.index, this.index + 1)
      }
      return this.tokens
    },
    is: function(a, b) {
      return -1 !== b.indexOf(a)
    },
    peek: function(a) {
      a = a || 1;
      return this.index + a < this.text.length ? this.text.charAt(this.index + a) : !1
    },
    isNumber: function(a) {
      return "0" <= a && "9" >= a && "string" === typeof a
    },
    isWhitespace: function(a) {
      return " " === a || "\r" === a ||
        "\t" === a || "\n" === a || "\v" === a || "\u00a0" === a
    },
    isIdent: function(a) {
      return "a" <= a && "z" >= a || "A" <= a && "Z" >= a || "_" === a || "$" === a
    },
    isExpOperator: function(a) {
      return "-" === a || "+" === a || this.isNumber(a)
    },
    throwError: function(a, b, d) {
      d = d || this.index;
      b = y(b) ? "s " + b + "-" + this.index + " [" + this.text.substring(b, d) + "]" : " " + d;
      throw ba("lexerr", a, b, this.text);
    },
    readNumber: function() {
      for (var a = "", b = this.index; this.index < this.text.length;) {
        var d = F(this.text.charAt(this.index));
        if ("." == d || this.isNumber(d)) a += d;
        else {
          var c = this.peek();
          if ("e" == d && this.isExpOperator(c)) a += d;
          else if (this.isExpOperator(d) && c && this.isNumber(c) && "e" == a.charAt(a.length - 1)) a += d;
          else if (!this.isExpOperator(d) || c && this.isNumber(c) || "e" != a.charAt(a.length - 1)) break;
          else this.throwError("Invalid exponent")
        }
        this.index++
      }
      this.tokens.push({
        index: b,
        text: a,
        constant: !0,
        value: Number(a)
      })
    },
    readIdent: function() {
      for (var a = this.index; this.index < this.text.length;) {
        var b = this.text.charAt(this.index);
        if (!this.isIdent(b) && !this.isNumber(b)) break;
        this.index++
      }
      this.tokens.push({
        index: a,
        text: this.text.slice(a, this.index),
        identifier: !0
      })
    },
    readString: function(a) {
      var b = this.index;
      this.index++;
      for (var d = "", c = a, e = !1; this.index < this.text.length;) {
        var f = this.text.charAt(this.index),
          c = c + f;
        if (e) "u" === f ? (e = this.text.substring(this.index + 1, this.index + 5), e.match(/[\da-f]{4}/i) || this.throwError("Invalid unicode escape [\\u" + e + "]"), this.index += 4, d += String.fromCharCode(parseInt(e, 16))) : d += sg[f] || f, e = !1;
        else if ("\\" === f) e = !0;
        else {
          if (f === a) {
            this.index++;
            this.tokens.push({
              index: b,
              text: c,
              constant: !0,
              value: d
            });
            return
          }
          d += f
        }
        this.index++
      }
      this.throwError("Unterminated quote", b)
    }
  };
  var s = function(a, b) {
    this.lexer = a;
    this.options = b
  };
  s.Program = "Program";
  s.ExpressionStatement = "ExpressionStatement";
  s.AssignmentExpression = "AssignmentExpression";
  s.ConditionalExpression = "ConditionalExpression";
  s.LogicalExpression = "LogicalExpression";
  s.BinaryExpression = "BinaryExpression";
  s.UnaryExpression = "UnaryExpression";
  s.CallExpression = "CallExpression";
  s.MemberExpression = "MemberExpression";
  s.Identifier = "Identifier";
  s.Literal =
    "Literal";
  s.ArrayExpression = "ArrayExpression";
  s.Property = "Property";
  s.ObjectExpression = "ObjectExpression";
  s.ThisExpression = "ThisExpression";
  s.NGValueParameter = "NGValueParameter";
  s.prototype = {
    ast: function(a) {
      this.text = a;
      this.tokens = this.lexer.lex(a);
      a = this.program();
      0 !== this.tokens.length && this.throwError("is an unexpected token", this.tokens[0]);
      return a
    },
    program: function() {
      for (var a = [];;)
        if (0 < this.tokens.length && !this.peek("}", ")", ";", "]") && a.push(this.expressionStatement()), !this.expect(";")) return {
          type: s.Program,
          body: a
        }
    },
    expressionStatement: function() {
      return {
        type: s.ExpressionStatement,
        expression: this.filterChain()
      }
    },
    filterChain: function() {
      for (var a = this.expression(); this.expect("|");) a = this.filter(a);
      return a
    },
    expression: function() {
      return this.assignment()
    },
    assignment: function() {
      var a = this.ternary();
      this.expect("=") && (a = {
        type: s.AssignmentExpression,
        left: a,
        right: this.assignment(),
        operator: "="
      });
      return a
    },
    ternary: function() {
      var a = this.logicalOR(),
        b, d;
      return this.expect("?") && (b = this.expression(), this.consume(":")) ?
        (d = this.expression(), {
          type: s.ConditionalExpression,
          test: a,
          alternate: b,
          consequent: d
        }) : a
    },
    logicalOR: function() {
      for (var a = this.logicalAND(); this.expect("||");) a = {
        type: s.LogicalExpression,
        operator: "||",
        left: a,
        right: this.logicalAND()
      };
      return a
    },
    logicalAND: function() {
      for (var a = this.equality(); this.expect("&&");) a = {
        type: s.LogicalExpression,
        operator: "&&",
        left: a,
        right: this.equality()
      };
      return a
    },
    equality: function() {
      for (var a = this.relational(), b; b = this.expect("==", "!=", "===", "!==");) a = {
        type: s.BinaryExpression,
        operator: b.text,
        left: a,
        right: this.relational()
      };
      return a
    },
    relational: function() {
      for (var a = this.additive(), b; b = this.expect("<", ">", "<=", ">=");) a = {
        type: s.BinaryExpression,
        operator: b.text,
        left: a,
        right: this.additive()
      };
      return a
    },
    additive: function() {
      for (var a = this.multiplicative(), b; b = this.expect("+", "-");) a = {
        type: s.BinaryExpression,
        operator: b.text,
        left: a,
        right: this.multiplicative()
      };
      return a
    },
    multiplicative: function() {
      for (var a = this.unary(), b; b = this.expect("*", "/", "%");) a = {
        type: s.BinaryExpression,
        operator: b.text,
        left: a,
        right: this.unary()
      };
      return a
    },
    unary: function() {
      var a;
      return (a = this.expect("+", "-", "!")) ? {
        type: s.UnaryExpression,
        operator: a.text,
        prefix: !0,
        argument: this.unary()
      } : this.primary()
    },
    primary: function() {
      var a;
      this.expect("(") ? (a = this.filterChain(), this.consume(")")) : this.expect("[") ? a = this.arrayDeclaration() : this.expect("{") ? a = this.object() : this.constants.hasOwnProperty(this.peek().text) ? a = bb(this.constants[this.consume().text]) : this.peek().identifier ? a = this.identifier() : this.peek().constant ? a = this.constant() :
        this.throwError("not a primary expression", this.peek());
      for (var b; b = this.expect("(", "[", ".");) "(" === b.text ? (a = {
        type: s.CallExpression,
        callee: a,
        arguments: this.parseArguments()
      }, this.consume(")")) : "[" === b.text ? (a = {
        type: s.MemberExpression,
        object: a,
        property: this.expression(),
        computed: !0
      }, this.consume("]")) : "." === b.text ? a = {
        type: s.MemberExpression,
        object: a,
        property: this.identifier(),
        computed: !1
      } : this.throwError("IMPOSSIBLE");
      return a
    },
    filter: function(a) {
      a = [a];
      for (var b = {
          type: s.CallExpression,
          callee: this.identifier(),
          arguments: a,
          filter: !0
        }; this.expect(":");) a.push(this.expression());
      return b
    },
    parseArguments: function() {
      var a = [];
      if (")" !== this.peekToken().text) {
        do a.push(this.expression()); while (this.expect(","))
      }
      return a
    },
    identifier: function() {
      var a = this.consume();
      a.identifier || this.throwError("is not a valid identifier", a);
      return {
        type: s.Identifier,
        name: a.text
      }
    },
    constant: function() {
      return {
        type: s.Literal,
        value: this.consume().value
      }
    },
    arrayDeclaration: function() {
      var a = [];
      if ("]" !== this.peekToken().text) {
        do {
          if (this.peek("]")) break;
          a.push(this.expression())
        } while (this.expect(","))
      }
      this.consume("]");
      return {
        type: s.ArrayExpression,
        elements: a
      }
    },
    object: function() {
      var a = [],
        b;
      if ("}" !== this.peekToken().text) {
        do {
          if (this.peek("}")) break;
          b = {
            type: s.Property,
            kind: "init"
          };
          this.peek().constant ? b.key = this.constant() : this.peek().identifier ? b.key = this.identifier() : this.throwError("invalid key", this.peek());
          this.consume(":");
          b.value = this.expression();
          a.push(b)
        } while (this.expect(","))
      }
      this.consume("}");
      return {
        type: s.ObjectExpression,
        properties: a
      }
    },
    throwError: function(a, b) {
      throw ba("syntax", b.text, a, b.index + 1, this.text, this.text.substring(b.index));
    },
    consume: function(a) {
      if (0 === this.tokens.length) throw ba("ueoe", this.text);
      var b = this.expect(a);
      b || this.throwError("is unexpected, expecting [" + a + "]", this.peek());
      return b
    },
    peekToken: function() {
      if (0 === this.tokens.length) throw ba("ueoe", this.text);
      return this.tokens[0]
    },
    peek: function(a, b, d, c) {
      return this.peekAhead(0, a, b, d, c)
    },
    peekAhead: function(a, b, d, c, e) {
      if (this.tokens.length > a) {
        a = this.tokens[a];
        var f = a.text;
        if (f === b || f === d || f === c || f === e || !(b || d || c || e)) return a
      }
      return !1
    },
    expect: function(a, b, d, c) {
      return (a = this.peek(a, b, d, c)) ? (this.tokens.shift(), a) : !1
    },
    constants: {
      "true": {
        type: s.Literal,
        value: !0
      },
      "false": {
        type: s.Literal,
        value: !1
      },
      "null": {
        type: s.Literal,
        value: null
      },
      undefined: {
        type: s.Literal,
        value: u
      },
      "this": {
        type: s.ThisExpression
      }
    }
  };
  rd.prototype = {
    compile: function(a, b) {
      var d = this,
        c = this.astBuilder.ast(a);
      this.state = {
        nextId: 0,
        filters: {},
        expensiveChecks: b,
        fn: {
          vars: [],
          body: [],
          own: {}
        },
        assign: {
          vars: [],
          body: [],
          own: {}
        },
        inputs: []
      };
      W(c, d.$filter);
      var e = "",
        f;
      this.stage = "assign";
      if (f = pd(c)) this.state.computing = "assign", e = this.nextId(), this.recurse(f, e), this.return_(e), e = "fn.assign=" + this.generateFunction("assign", "s,v,l");
      f = nd(c.body);
      d.stage = "inputs";
      n(f, function(a, b) {
        var c = "fn" + b;
        d.state[c] = {
          vars: [],
          body: [],
          own: {}
        };
        d.state.computing = c;
        var e = d.nextId();
        d.recurse(a, e);
        d.return_(e);
        d.state.inputs.push(c);
        a.watchId = b
      });
      this.state.computing = "fn";
      this.stage = "main";
      this.recurse(c);
      e = '"' + this.USE + " " + this.STRICT +
        '";\n' + this.filterPrefix() + "var fn=" + this.generateFunction("fn", "s,l,a,i") + e + this.watchFns() + "return fn;";
      e = (new Function("$filter", "ensureSafeMemberName", "ensureSafeObject", "ensureSafeFunction", "getStringValue", "ensureSafeAssignContext", "ifDefined", "plus", "text", e))(this.$filter, Va, xa, kd, jd, ld, Zf, md, a);
      this.state = this.stage = u;
      e.literal = qd(c);
      e.constant = c.constant;
      return e
    },
    USE: "use",
    STRICT: "strict",
    watchFns: function() {
      var a = [],
        b = this.state.inputs,
        d = this;
      n(b, function(b) {
        a.push("var " + b + "=" + d.generateFunction(b,
          "s"))
      });
      b.length && a.push("fn.inputs=[" + b.join(",") + "];");
      return a.join("")
    },
    generateFunction: function(a, b) {
      return "function(" + b + "){" + this.varsPrefix(a) + this.body(a) + "};"
    },
    filterPrefix: function() {
      var a = [],
        b = this;
      n(this.state.filters, function(d, c) {
        a.push(d + "=$filter(" + b.escape(c) + ")")
      });
      return a.length ? "var " + a.join(",") + ";" : ""
    },
    varsPrefix: function(a) {
      return this.state[a].vars.length ? "var " + this.state[a].vars.join(",") + ";" : ""
    },
    body: function(a) {
      return this.state[a].body.join("")
    },
    recurse: function(a, b,
      d, c, e, f) {
      var g, h, k = this,
        l, m;
      c = c || x;
      if (!f && y(a.watchId)) b = b || this.nextId(), this.if_("i", this.lazyAssign(b, this.computedMember("i", a.watchId)), this.lazyRecurse(a, b, d, c, e, !0));
      else switch (a.type) {
        case s.Program:
          n(a.body, function(b, c) {
            k.recurse(b.expression, u, u, function(a) {
              h = a
            });
            c !== a.body.length - 1 ? k.current().body.push(h, ";") : k.return_(h)
          });
          break;
        case s.Literal:
          m = this.escape(a.value);
          this.assign(b, m);
          c(m);
          break;
        case s.UnaryExpression:
          this.recurse(a.argument, u, u, function(a) {
            h = a
          });
          m = a.operator + "(" + this.ifDefined(h,
            0) + ")";
          this.assign(b, m);
          c(m);
          break;
        case s.BinaryExpression:
          this.recurse(a.left, u, u, function(a) {
            g = a
          });
          this.recurse(a.right, u, u, function(a) {
            h = a
          });
          m = "+" === a.operator ? this.plus(g, h) : "-" === a.operator ? this.ifDefined(g, 0) + a.operator + this.ifDefined(h, 0) : "(" + g + ")" + a.operator + "(" + h + ")";
          this.assign(b, m);
          c(m);
          break;
        case s.LogicalExpression:
          b = b || this.nextId();
          k.recurse(a.left, b);
          k.if_("&&" === a.operator ? b : k.not(b), k.lazyRecurse(a.right, b));
          c(b);
          break;
        case s.ConditionalExpression:
          b = b || this.nextId();
          k.recurse(a.test,
            b);
          k.if_(b, k.lazyRecurse(a.alternate, b), k.lazyRecurse(a.consequent, b));
          c(b);
          break;
        case s.Identifier:
          b = b || this.nextId();
          d && (d.context = "inputs" === k.stage ? "s" : this.assign(this.nextId(), this.getHasOwnProperty("l", a.name) + "?l:s"), d.computed = !1, d.name = a.name);
          Va(a.name);
          k.if_("inputs" === k.stage || k.not(k.getHasOwnProperty("l", a.name)), function() {
            k.if_("inputs" === k.stage || "s", function() {
              e && 1 !== e && k.if_(k.not(k.nonComputedMember("s", a.name)), k.lazyAssign(k.nonComputedMember("s", a.name), "{}"));
              k.assign(b, k.nonComputedMember("s",
                a.name))
            })
          }, b && k.lazyAssign(b, k.nonComputedMember("l", a.name)));
          (k.state.expensiveChecks || Fb(a.name)) && k.addEnsureSafeObject(b);
          c(b);
          break;
        case s.MemberExpression:
          g = d && (d.context = this.nextId()) || this.nextId();
          b = b || this.nextId();
          k.recurse(a.object, g, u, function() {
            k.if_(k.notNull(g), function() {
              if (a.computed) h = k.nextId(), k.recurse(a.property, h), k.getStringValue(h), k.addEnsureSafeMemberName(h), e && 1 !== e && k.if_(k.not(k.computedMember(g, h)), k.lazyAssign(k.computedMember(g, h), "{}")), m = k.ensureSafeObject(k.computedMember(g,
                h)), k.assign(b, m), d && (d.computed = !0, d.name = h);
              else {
                Va(a.property.name);
                e && 1 !== e && k.if_(k.not(k.nonComputedMember(g, a.property.name)), k.lazyAssign(k.nonComputedMember(g, a.property.name), "{}"));
                m = k.nonComputedMember(g, a.property.name);
                if (k.state.expensiveChecks || Fb(a.property.name)) m = k.ensureSafeObject(m);
                k.assign(b, m);
                d && (d.computed = !1, d.name = a.property.name)
              }
            }, function() {
              k.assign(b, "undefined")
            });
            c(b)
          }, !!e);
          break;
        case s.CallExpression:
          b = b || this.nextId();
          a.filter ? (h = k.filter(a.callee.name), l = [], n(a.arguments,
            function(a) {
              var b = k.nextId();
              k.recurse(a, b);
              l.push(b)
            }), m = h + "(" + l.join(",") + ")", k.assign(b, m), c(b)) : (h = k.nextId(), g = {}, l = [], k.recurse(a.callee, h, g, function() {
            k.if_(k.notNull(h), function() {
                k.addEnsureSafeFunction(h);
                n(a.arguments, function(a) {
                  k.recurse(a, k.nextId(), u, function(a) {
                    l.push(k.ensureSafeObject(a))
                  })
                });
                g.name ? (k.state.expensiveChecks || k.addEnsureSafeObject(g.context), m = k.member(g.context, g.name, g.computed) + "(" + l.join(",") + ")") : m = h + "(" + l.join(",") + ")";
                m = k.ensureSafeObject(m);
                k.assign(b, m)
              },
              function() {
                k.assign(b, "undefined")
              });
            c(b)
          }));
          break;
        case s.AssignmentExpression:
          h = this.nextId();
          g = {};
          if (!od(a.left)) throw ba("lval");
          this.recurse(a.left, u, g, function() {
            k.if_(k.notNull(g.context), function() {
              k.recurse(a.right, h);
              k.addEnsureSafeObject(k.member(g.context, g.name, g.computed));
              k.addEnsureSafeAssignContext(g.context);
              m = k.member(g.context, g.name, g.computed) + a.operator + h;
              k.assign(b, m);
              c(b || m)
            })
          }, 1);
          break;
        case s.ArrayExpression:
          l = [];
          n(a.elements, function(a) {
            k.recurse(a, k.nextId(), u, function(a) {
              l.push(a)
            })
          });
          m = "[" + l.join(",") + "]";
          this.assign(b, m);
          c(m);
          break;
        case s.ObjectExpression:
          l = [];
          n(a.properties, function(a) {
            k.recurse(a.value, k.nextId(), u, function(b) {
              l.push(k.escape(a.key.type === s.Identifier ? a.key.name : "" + a.key.value) + ":" + b)
            })
          });
          m = "{" + l.join(",") + "}";
          this.assign(b, m);
          c(m);
          break;
        case s.ThisExpression:
          this.assign(b, "s");
          c("s");
          break;
        case s.NGValueParameter:
          this.assign(b, "v"), c("v")
      }
    },
    getHasOwnProperty: function(a, b) {
      var d = a + "." + b,
        c = this.current().own;
      c.hasOwnProperty(d) || (c[d] = this.nextId(!1, a + "&&(" +
        this.escape(b) + " in " + a + ")"));
      return c[d]
    },
    assign: function(a, b) {
      if (a) return this.current().body.push(a, "=", b, ";"), a
    },
    filter: function(a) {
      this.state.filters.hasOwnProperty(a) || (this.state.filters[a] = this.nextId(!0));
      return this.state.filters[a]
    },
    ifDefined: function(a, b) {
      return "ifDefined(" + a + "," + this.escape(b) + ")"
    },
    plus: function(a, b) {
      return "plus(" + a + "," + b + ")"
    },
    return_: function(a) {
      this.current().body.push("return ", a, ";")
    },
    if_: function(a, b, d) {
      if (!0 === a) b();
      else {
        var c = this.current().body;
        c.push("if(", a,
          "){");
        b();
        c.push("}");
        d && (c.push("else{"), d(), c.push("}"))
      }
    },
    not: function(a) {
      return "!(" + a + ")"
    },
    notNull: function(a) {
      return a + "!=null"
    },
    nonComputedMember: function(a, b) {
      return a + "." + b
    },
    computedMember: function(a, b) {
      return a + "[" + b + "]"
    },
    member: function(a, b, d) {
      return d ? this.computedMember(a, b) : this.nonComputedMember(a, b)
    },
    addEnsureSafeObject: function(a) {
      this.current().body.push(this.ensureSafeObject(a), ";")
    },
    addEnsureSafeMemberName: function(a) {
      this.current().body.push(this.ensureSafeMemberName(a), ";")
    },
    addEnsureSafeFunction: function(a) {
      this.current().body.push(this.ensureSafeFunction(a), ";")
    },
    addEnsureSafeAssignContext: function(a) {
      this.current().body.push(this.ensureSafeAssignContext(a), ";")
    },
    ensureSafeObject: function(a) {
      return "ensureSafeObject(" + a + ",text)"
    },
    ensureSafeMemberName: function(a) {
      return "ensureSafeMemberName(" + a + ",text)"
    },
    ensureSafeFunction: function(a) {
      return "ensureSafeFunction(" + a + ",text)"
    },
    getStringValue: function(a) {
      this.assign(a, "getStringValue(" + a + ",text)")
    },
    ensureSafeAssignContext: function(a) {
      return "ensureSafeAssignContext(" +
        a + ",text)"
    },
    lazyRecurse: function(a, b, d, c, e, f) {
      var g = this;
      return function() {
        g.recurse(a, b, d, c, e, f)
      }
    },
    lazyAssign: function(a, b) {
      var d = this;
      return function() {
        d.assign(a, b)
      }
    },
    stringEscapeRegex: /[^ a-zA-Z0-9]/g,
    stringEscapeFn: function(a) {
      return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
    },
    escape: function(a) {
      if (E(a)) return "'" + a.replace(this.stringEscapeRegex, this.stringEscapeFn) + "'";
      if (Q(a)) return a.toString();
      if (!0 === a) return "true";
      if (!1 === a) return "false";
      if (null === a) return "null";
      if ("undefined" ===
        typeof a) return "undefined";
      throw ba("esc");
    },
    nextId: function(a, b) {
      var d = "v" + this.state.nextId++;
      a || this.current().vars.push(d + (b ? "=" + b : ""));
      return d
    },
    current: function() {
      return this.state[this.state.computing]
    }
  };
  sd.prototype = {
    compile: function(a, b) {
      var d = this,
        c = this.astBuilder.ast(a);
      this.expression = a;
      this.expensiveChecks = b;
      W(c, d.$filter);
      var e, f;
      if (e = pd(c)) f = this.recurse(e);
      e = nd(c.body);
      var g;
      e && (g = [], n(e, function(a, b) {
        var c = d.recurse(a);
        a.input = c;
        g.push(c);
        a.watchId = b
      }));
      var h = [];
      n(c.body, function(a) {
        h.push(d.recurse(a.expression))
      });
      e = 0 === c.body.length ? function() {} : 1 === c.body.length ? h[0] : function(a, b) {
        var c;
        n(h, function(d) {
          c = d(a, b)
        });
        return c
      };
      f && (e.assign = function(a, b, c) {
        return f(a, c, b)
      });
      g && (e.inputs = g);
      e.literal = qd(c);
      e.constant = c.constant;
      return e
    },
    recurse: function(a, b, d) {
      var c, e, f = this,
        g;
      if (a.input) return this.inputs(a.input, a.watchId);
      switch (a.type) {
        case s.Literal:
          return this.value(a.value, b);
        case s.UnaryExpression:
          return e = this.recurse(a.argument), this["unary" + a.operator](e, b);
        case s.BinaryExpression:
          return c = this.recurse(a.left),
            e = this.recurse(a.right), this["binary" + a.operator](c, e, b);
        case s.LogicalExpression:
          return c = this.recurse(a.left), e = this.recurse(a.right), this["binary" + a.operator](c, e, b);
        case s.ConditionalExpression:
          return this["ternary?:"](this.recurse(a.test), this.recurse(a.alternate), this.recurse(a.consequent), b);
        case s.Identifier:
          return Va(a.name, f.expression), f.identifier(a.name, f.expensiveChecks || Fb(a.name), b, d, f.expression);
        case s.MemberExpression:
          return c = this.recurse(a.object, !1, !!d), a.computed || (Va(a.property.name,
            f.expression), e = a.property.name), a.computed && (e = this.recurse(a.property)), a.computed ? this.computedMember(c, e, b, d, f.expression) : this.nonComputedMember(c, e, f.expensiveChecks, b, d, f.expression);
        case s.CallExpression:
          return g = [], n(a.arguments, function(a) {
            g.push(f.recurse(a))
          }), a.filter && (e = this.$filter(a.callee.name)), a.filter || (e = this.recurse(a.callee, !0)), a.filter ? function(a, c, d, f) {
            for (var r = [], n = 0; n < g.length; ++n) r.push(g[n](a, c, d, f));
            a = e.apply(u, r, f);
            return b ? {
              context: u,
              name: u,
              value: a
            } : a
          } : function(a,
            c, d, m) {
            var r = e(a, c, d, m),
              n;
            if (null != r.value) {
              xa(r.context, f.expression);
              kd(r.value, f.expression);
              n = [];
              for (var q = 0; q < g.length; ++q) n.push(xa(g[q](a, c, d, m), f.expression));
              n = xa(r.value.apply(r.context, n), f.expression)
            }
            return b ? {
              value: n
            } : n
          };
        case s.AssignmentExpression:
          return c = this.recurse(a.left, !0, 1), e = this.recurse(a.right),
            function(a, d, g, m) {
              var n = c(a, d, g, m);
              a = e(a, d, g, m);
              xa(n.value, f.expression);
              ld(n.context);
              n.context[n.name] = a;
              return b ? {
                value: a
              } : a
            };
        case s.ArrayExpression:
          return g = [], n(a.elements, function(a) {
              g.push(f.recurse(a))
            }),
            function(a, c, d, e) {
              for (var f = [], n = 0; n < g.length; ++n) f.push(g[n](a, c, d, e));
              return b ? {
                value: f
              } : f
            };
        case s.ObjectExpression:
          return g = [], n(a.properties, function(a) {
              g.push({
                key: a.key.type === s.Identifier ? a.key.name : "" + a.key.value,
                value: f.recurse(a.value)
              })
            }),
            function(a, c, d, e) {
              for (var f = {}, n = 0; n < g.length; ++n) f[g[n].key] = g[n].value(a, c, d, e);
              return b ? {
                value: f
              } : f
            };
        case s.ThisExpression:
          return function(a) {
            return b ? {
              value: a
            } : a
          };
        case s.NGValueParameter:
          return function(a, c, d, e) {
            return b ? {
              value: d
            } : d
          }
      }
    },
    "unary+": function(a,
      b) {
      return function(d, c, e, f) {
        d = a(d, c, e, f);
        d = y(d) ? +d : 0;
        return b ? {
          value: d
        } : d
      }
    },
    "unary-": function(a, b) {
      return function(d, c, e, f) {
        d = a(d, c, e, f);
        d = y(d) ? -d : 0;
        return b ? {
          value: d
        } : d
      }
    },
    "unary!": function(a, b) {
      return function(d, c, e, f) {
        d = !a(d, c, e, f);
        return b ? {
          value: d
        } : d
      }
    },
    "binary+": function(a, b, d) {
      return function(c, e, f, g) {
        var h = a(c, e, f, g);
        c = b(c, e, f, g);
        h = md(h, c);
        return d ? {
          value: h
        } : h
      }
    },
    "binary-": function(a, b, d) {
      return function(c, e, f, g) {
        var h = a(c, e, f, g);
        c = b(c, e, f, g);
        h = (y(h) ? h : 0) - (y(c) ? c : 0);
        return d ? {
          value: h
        } : h
      }
    },
    "binary*": function(a,
      b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) * b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary/": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) / b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary%": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) % b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary===": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) === b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary!==": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) !== b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary==": function(a, b,
      d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) == b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary!=": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) != b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary<": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) < b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary>": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) > b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary<=": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) <= b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary>=": function(a, b, d) {
      return function(c,
        e, f, g) {
        c = a(c, e, f, g) >= b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary&&": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) && b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary||": function(a, b, d) {
      return function(c, e, f, g) {
        c = a(c, e, f, g) || b(c, e, f, g);
        return d ? {
          value: c
        } : c
      }
    },
    "ternary?:": function(a, b, d, c) {
      return function(e, f, g, h) {
        e = a(e, f, g, h) ? b(e, f, g, h) : d(e, f, g, h);
        return c ? {
          value: e
        } : e
      }
    },
    value: function(a, b) {
      return function() {
        return b ? {
          context: u,
          name: u,
          value: a
        } : a
      }
    },
    identifier: function(a, b, d, c, e) {
      return function(f, g, h, k) {
        f =
          g && a in g ? g : f;
        c && 1 !== c && f && !f[a] && (f[a] = {});
        g = f ? f[a] : u;
        b && xa(g, e);
        return d ? {
          context: f,
          name: a,
          value: g
        } : g
      }
    },
    computedMember: function(a, b, d, c, e) {
      return function(f, g, h, k) {
        var l = a(f, g, h, k),
          m, n;
        null != l && (m = b(f, g, h, k), m = jd(m), Va(m, e), c && 1 !== c && l && !l[m] && (l[m] = {}), n = l[m], xa(n, e));
        return d ? {
          context: l,
          name: m,
          value: n
        } : n
      }
    },
    nonComputedMember: function(a, b, d, c, e, f) {
      return function(g, h, k, l) {
        g = a(g, h, k, l);
        e && 1 !== e && g && !g[b] && (g[b] = {});
        h = null != g ? g[b] : u;
        (d || Fb(b)) && xa(h, f);
        return c ? {
          context: g,
          name: b,
          value: h
        } : h
      }
    },
    inputs: function(a,
      b) {
      return function(d, c, e, f) {
        return f ? f[b] : a(d, c, e)
      }
    }
  };
  var gc = function(a, b, d) {
    this.lexer = a;
    this.$filter = b;
    this.options = d;
    this.ast = new s(this.lexer);
    this.astCompiler = d.csp ? new sd(this.ast, b) : new rd(this.ast, b)
  };
  gc.prototype = {
    constructor: gc,
    parse: function(a) {
      return this.astCompiler.compile(a, this.options.expensiveChecks)
    }
  };
  $();
  $();
  var $f = Object.prototype.valueOf,
    ya = G("$sce"),
    la = {
      HTML: "html",
      CSS: "css",
      URL: "url",
      RESOURCE_URL: "resourceUrl",
      JS: "js"
    },
    ha = G("$compile"),
    Y = X.createElement("a"),
    wd = wa(S.location.href);
  xd.$inject = ["$document"];
  Jc.$inject = ["$provide"];
  yd.$inject = ["$locale"];
  Ad.$inject = ["$locale"];
  var ic = ".",
    jg = {
      yyyy: ca("FullYear", 4),
      yy: ca("FullYear", 2, 0, !0),
      y: ca("FullYear", 1),
      MMMM: Hb("Month"),
      MMM: Hb("Month", !0),
      MM: ca("Month", 2, 1),
      M: ca("Month", 1, 1),
      dd: ca("Date", 2),
      d: ca("Date", 1),
      HH: ca("Hours", 2),
      H: ca("Hours", 1),
      hh: ca("Hours", 2, -12),
      h: ca("Hours", 1, -12),
      mm: ca("Minutes", 2),
      m: ca("Minutes", 1),
      ss: ca("Seconds", 2),
      s: ca("Seconds", 1),
      sss: ca("Milliseconds", 3),
      EEEE: Hb("Day"),
      EEE: Hb("Day", !0),
      a: function(a, b) {
        return 12 >
          a.getHours() ? b.AMPMS[0] : b.AMPMS[1]
      },
      Z: function(a, b, d) {
        a = -1 * d;
        return a = (0 <= a ? "+" : "") + (Gb(Math[0 < a ? "floor" : "ceil"](a / 60), 2) + Gb(Math.abs(a % 60), 2))
      },
      ww: Ed(2),
      w: Ed(1),
      G: jc,
      GG: jc,
      GGG: jc,
      GGGG: function(a, b) {
        return 0 >= a.getFullYear() ? b.ERANAMES[0] : b.ERANAMES[1]
      }
    },
    ig = /((?:[^yMdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z|G+|w+))(.*)/,
    hg = /^\-?\d+$/;
  zd.$inject = ["$locale"];
  var eg = na(F),
    fg = na(sb);
  Bd.$inject = ["$parse"];
  var he = na({
      restrict: "E",
      compile: function(a, b) {
        if (!b.href && !b.xlinkHref) return function(a,
          b) {
          if ("a" === b[0].nodeName.toLowerCase()) {
            var e = "[object SVGAnimatedString]" === sa.call(b.prop("href")) ? "xlink:href" : "href";
            b.on("click", function(a) {
              b.attr(e) || a.preventDefault()
            })
          }
        }
      }
    }),
    tb = {};
  n(Cb, function(a, b) {
    function d(a, d, e) {
      a.$watch(e[c], function(a) {
        e.$set(b, !!a)
      })
    }
    if ("multiple" != a) {
      var c = va("ng-" + b),
        e = d;
      "checked" === a && (e = function(a, b, e) {
        e.ngModel !== e[c] && d(a, b, e)
      });
      tb[c] = function() {
        return {
          restrict: "A",
          priority: 100,
          link: e
        }
      }
    }
  });
  n(Zc, function(a, b) {
    tb[b] = function() {
      return {
        priority: 100,
        link: function(a,
          c, e) {
          if ("ngPattern" === b && "/" == e.ngPattern.charAt(0) && (c = e.ngPattern.match(lg))) {
            e.$set("ngPattern", new RegExp(c[1], c[2]));
            return
          }
          a.$watch(e[b], function(a) {
            e.$set(b, a)
          })
        }
      }
    }
  });
  n(["src", "srcset", "href"], function(a) {
    var b = va("ng-" + a);
    tb[b] = function() {
      return {
        priority: 99,
        link: function(d, c, e) {
          var f = a,
            g = a;
          "href" === a && "[object SVGAnimatedString]" === sa.call(c.prop("href")) && (g = "xlinkHref", e.$attr[g] = "xlink:href", f = null);
          e.$observe(b, function(b) {
            b ? (e.$set(g, b), Ha && f && c.prop(f, e[g])) : "href" === a && e.$set(g, null)
          })
        }
      }
    }
  });
  var Ib = {
    $addControl: x,
    $$renameControl: function(a, b) {
      a.$name = b
    },
    $removeControl: x,
    $setValidity: x,
    $setDirty: x,
    $setPristine: x,
    $setSubmitted: x
  };
  Fd.$inject = ["$element", "$attrs", "$scope", "$animate", "$interpolate"];
  var Nd = function(a) {
      return ["$timeout", "$parse", function(b, d) {
        function c(a) {
          return "" === a ? d('this[""]').assign : d(a).assign || x
        }
        return {
          name: "form",
          restrict: a ? "EAC" : "E",
          require: ["form", "^^?form"],
          controller: Fd,
          compile: function(d, f) {
            d.addClass(Wa).addClass(mb);
            var g = f.name ? "name" : a && f.ngForm ? "ngForm" :
              !1;
            return {
              pre: function(a, d, e, f) {
                var n = f[0];
                if (!("action" in e)) {
                  var q = function(b) {
                    a.$apply(function() {
                      n.$commitViewValue();
                      n.$setSubmitted()
                    });
                    b.preventDefault()
                  };
                  d[0].addEventListener("submit", q, !1);
                  d.on("$destroy", function() {
                    b(function() {
                      d[0].removeEventListener("submit", q, !1)
                    }, 0, !1)
                  })
                }(f[1] || n.$$parentForm).$addControl(n);
                var s = g ? c(n.$name) : x;
                g && (s(a, n), e.$observe(g, function(b) {
                  n.$name !== b && (s(a, u), n.$$parentForm.$$renameControl(n, b), s = c(n.$name), s(a, n))
                }));
                d.on("$destroy", function() {
                  n.$$parentForm.$removeControl(n);
                  s(a, u);
                  M(n, Ib)
                })
              }
            }
          }
        }
      }]
    },
    ie = Nd(),
    ve = Nd(!0),
    kg = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
    tg = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/,
    ug = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i,
    vg = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/,
    Od = /^(\d{4})-(\d{2})-(\d{2})$/,
    Pd = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
    mc = /^(\d{4})-W(\d\d)$/,
    Qd = /^(\d{4})-(\d\d)$/,
    Rd = /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
    Sd = {
      text: function(a, b, d, c, e, f) {
        jb(a, b, d, c, e, f);
        kc(c)
      },
      date: kb("date", Od, Kb(Od, ["yyyy", "MM", "dd"]), "yyyy-MM-dd"),
      "datetime-local": kb("datetimelocal", Pd, Kb(Pd, "yyyy MM dd HH mm ss sss".split(" ")), "yyyy-MM-ddTHH:mm:ss.sss"),
      time: kb("time", Rd, Kb(Rd, ["HH", "mm", "ss", "sss"]), "HH:mm:ss.sss"),
      week: kb("week", mc, function(a, b) {
        if (da(a)) return a;
        if (E(a)) {
          mc.lastIndex = 0;
          var d = mc.exec(a);
          if (d) {
            var c = +d[1],
              e = +d[2],
              f = d = 0,
              g = 0,
              h = 0,
              k = Dd(c),
              e = 7 * (e - 1);
            b && (d = b.getHours(), f =
              b.getMinutes(), g = b.getSeconds(), h = b.getMilliseconds());
            return new Date(c, 0, k.getDate() + e, d, f, g, h)
          }
        }
        return NaN
      }, "yyyy-Www"),
      month: kb("month", Qd, Kb(Qd, ["yyyy", "MM"]), "yyyy-MM"),
      number: function(a, b, d, c, e, f) {
        Hd(a, b, d, c);
        jb(a, b, d, c, e, f);
        c.$$parserName = "number";
        c.$parsers.push(function(a) {
          return c.$isEmpty(a) ? null : vg.test(a) ? parseFloat(a) : u
        });
        c.$formatters.push(function(a) {
          if (!c.$isEmpty(a)) {
            if (!Q(a)) throw lb("numfmt", a);
            a = a.toString()
          }
          return a
        });
        if (y(d.min) || d.ngMin) {
          var g;
          c.$validators.min = function(a) {
            return c.$isEmpty(a) ||
              q(g) || a >= g
          };
          d.$observe("min", function(a) {
            y(a) && !Q(a) && (a = parseFloat(a, 10));
            g = Q(a) && !isNaN(a) ? a : u;
            c.$validate()
          })
        }
        if (y(d.max) || d.ngMax) {
          var h;
          c.$validators.max = function(a) {
            return c.$isEmpty(a) || q(h) || a <= h
          };
          d.$observe("max", function(a) {
            y(a) && !Q(a) && (a = parseFloat(a, 10));
            h = Q(a) && !isNaN(a) ? a : u;
            c.$validate()
          })
        }
      },
      url: function(a, b, d, c, e, f) {
        jb(a, b, d, c, e, f);
        kc(c);
        c.$$parserName = "url";
        c.$validators.url = function(a, b) {
          var d = a || b;
          return c.$isEmpty(d) || tg.test(d)
        }
      },
      email: function(a, b, d, c, e, f) {
        jb(a, b, d, c, e, f);
        kc(c);
        c.$$parserName = "email";
        c.$validators.email = function(a, b) {
          var d = a || b;
          return c.$isEmpty(d) || ug.test(d)
        }
      },
      radio: function(a, b, d, c) {
        q(d.name) && b.attr("name", ++nb);
        b.on("click", function(a) {
          b[0].checked && c.$setViewValue(d.value, a && a.type)
        });
        c.$render = function() {
          b[0].checked = d.value == c.$viewValue
        };
        d.$observe("value", c.$render)
      },
      checkbox: function(a, b, d, c, e, f, g, h) {
        var k = Id(h, a, "ngTrueValue", d.ngTrueValue, !0),
          l = Id(h, a, "ngFalseValue", d.ngFalseValue, !1);
        b.on("click", function(a) {
          c.$setViewValue(b[0].checked, a &&
            a.type)
        });
        c.$render = function() {
          b[0].checked = c.$viewValue
        };
        c.$isEmpty = function(a) {
          return !1 === a
        };
        c.$formatters.push(function(a) {
          return ma(a, k)
        });
        c.$parsers.push(function(a) {
          return a ? k : l
        })
      },
      hidden: x,
      button: x,
      submit: x,
      reset: x,
      file: x
    },
    Dc = ["$browser", "$sniffer", "$filter", "$parse", function(a, b, d, c) {
      return {
        restrict: "E",
        require: ["?ngModel"],
        link: {
          pre: function(e, f, g, h) {
            h[0] && (Sd[F(g.type)] || Sd.text)(e, f, g, h[0], b, a, d, c)
          }
        }
      }
    }],
    wg = /^(true|false|\d+)$/,
    Ne = function() {
      return {
        restrict: "A",
        priority: 100,
        compile: function(a,
          b) {
          return wg.test(b.ngValue) ? function(a, b, e) {
            e.$set("value", a.$eval(e.ngValue))
          } : function(a, b, e) {
            a.$watch(e.ngValue, function(a) {
              e.$set("value", a)
            })
          }
        }
      }
    },
    ne = ["$compile", function(a) {
      return {
        restrict: "AC",
        compile: function(b) {
          a.$$addBindingClass(b);
          return function(b, c, e) {
            a.$$addBindingInfo(c, e.ngBind);
            c = c[0];
            b.$watch(e.ngBind, function(a) {
              c.textContent = q(a) ? "" : a
            })
          }
        }
      }
    }],
    pe = ["$interpolate", "$compile", function(a, b) {
      return {
        compile: function(d) {
          b.$$addBindingClass(d);
          return function(c, d, f) {
            c = a(d.attr(f.$attr.ngBindTemplate));
            b.$$addBindingInfo(d, c.expressions);
            d = d[0];
            f.$observe("ngBindTemplate", function(a) {
              d.textContent = q(a) ? "" : a
            })
          }
        }
      }
    }],
    oe = ["$sce", "$parse", "$compile", function(a, b, d) {
      return {
        restrict: "A",
        compile: function(c, e) {
          var f = b(e.ngBindHtml),
            g = b(e.ngBindHtml, function(a) {
              return (a || "").toString()
            });
          d.$$addBindingClass(c);
          return function(b, c, e) {
            d.$$addBindingInfo(c, e.ngBindHtml);
            b.$watch(g, function() {
              c.html(a.getTrustedHtml(f(b)) || "")
            })
          }
        }
      }
    }],
    Me = na({
      restrict: "A",
      require: "ngModel",
      link: function(a, b, d, c) {
        c.$viewChangeListeners.push(function() {
          a.$eval(d.ngChange)
        })
      }
    }),
    qe = lc("", !0),
    se = lc("Odd", 0),
    re = lc("Even", 1),
    te = La({
      compile: function(a, b) {
        b.$set("ngCloak", u);
        a.removeClass("ng-cloak")
      }
    }),
    ue = [function() {
      return {
        restrict: "A",
        scope: !0,
        controller: "@",
        priority: 500
      }
    }],
    Ic = {},
    xg = {
      blur: !0,
      focus: !0
    };
  n("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "), function(a) {
    var b = va("ng-" + a);
    Ic[b] = ["$parse", "$rootScope", function(d, c) {
      return {
        restrict: "A",
        compile: function(e, f) {
          var g =
            d(f[b], null, !0);
          return function(b, d) {
            d.on(a, function(d) {
              var e = function() {
                g(b, {
                  $event: d
                })
              };
              xg[a] && c.$$phase ? b.$evalAsync(e) : b.$apply(e)
            })
          }
        }
      }
    }]
  });
  var xe = ["$animate", function(a) {
      return {
        multiElement: !0,
        transclude: "element",
        priority: 600,
        terminal: !0,
        restrict: "A",
        $$tlb: !0,
        link: function(b, d, c, e, f) {
          var g, h, k;
          b.$watch(c.ngIf, function(b) {
            b ? h || f(function(b, e) {
              h = e;
              b[b.length++] = X.createComment(" end ngIf: " + c.ngIf + " ");
              g = {
                clone: b
              };
              a.enter(b, d.parent(), d)
            }) : (k && (k.remove(), k = null), h && (h.$destroy(), h = null), g && (k =
              rb(g.clone), a.leave(k).then(function() {
                k = null
              }), g = null))
          })
        }
      }
    }],
    ye = ["$templateRequest", "$anchorScroll", "$animate", function(a, b, d) {
      return {
        restrict: "ECA",
        priority: 400,
        terminal: !0,
        transclude: "element",
        controller: fa.noop,
        compile: function(c, e) {
          var f = e.ngInclude || e.src,
            g = e.onload || "",
            h = e.autoscroll;
          return function(c, e, m, n, q) {
            var s = 0,
              v, u, p, C = function() {
                u && (u.remove(), u = null);
                v && (v.$destroy(), v = null);
                p && (d.leave(p).then(function() {
                  u = null
                }), u = p, p = null)
              };
            c.$watch(f, function(f) {
              var m = function() {
                  !y(h) || h && !c.$eval(h) ||
                    b()
                },
                u = ++s;
              f ? (a(f, !0).then(function(a) {
                if (u === s) {
                  var b = c.$new();
                  n.template = a;
                  a = q(b, function(a) {
                    C();
                    d.enter(a, null, e).then(m)
                  });
                  v = b;
                  p = a;
                  v.$emit("$includeContentLoaded", f);
                  c.$eval(g)
                }
              }, function() {
                u === s && (C(), c.$emit("$includeContentError", f))
              }), c.$emit("$includeContentRequested", f)) : (C(), n.template = null)
            })
          }
        }
      }
    }],
    Pe = ["$compile", function(a) {
      return {
        restrict: "ECA",
        priority: -400,
        require: "ngInclude",
        link: function(b, d, c, e) {
          /SVG/.test(d[0].toString()) ? (d.empty(), a(Lc(e.template, X).childNodes)(b, function(a) {
            d.append(a)
          }, {
            futureParentElement: d
          })) : (d.html(e.template), a(d.contents())(b))
        }
      }
    }],
    ze = La({
      priority: 450,
      compile: function() {
        return {
          pre: function(a, b, d) {
            a.$eval(d.ngInit)
          }
        }
      }
    }),
    Le = function() {
      return {
        restrict: "A",
        priority: 100,
        require: "ngModel",
        link: function(a, b, d, c) {
          var e = b.attr(d.$attr.ngList) || ", ",
            f = "false" !== d.ngTrim,
            g = f ? U(e) : e;
          c.$parsers.push(function(a) {
            if (!q(a)) {
              var b = [];
              a && n(a.split(g), function(a) {
                a && b.push(f ? U(a) : a)
              });
              return b
            }
          });
          c.$formatters.push(function(a) {
            return I(a) ? a.join(e) : u
          });
          c.$isEmpty = function(a) {
            return !a ||
              !a.length
          }
        }
      }
    },
    mb = "ng-valid",
    Jd = "ng-invalid",
    Wa = "ng-pristine",
    Jb = "ng-dirty",
    Ld = "ng-pending",
    lb = G("ngModel"),
    yg = ["$scope", "$exceptionHandler", "$attrs", "$element", "$parse", "$animate", "$timeout", "$rootScope", "$q", "$interpolate", function(a, b, d, c, e, f, g, h, k, l) {
      this.$modelValue = this.$viewValue = Number.NaN;
      this.$$rawModelValue = u;
      this.$validators = {};
      this.$asyncValidators = {};
      this.$parsers = [];
      this.$formatters = [];
      this.$viewChangeListeners = [];
      this.$untouched = !0;
      this.$touched = !1;
      this.$pristine = !0;
      this.$dirty = !1;
      this.$valid = !0;
      this.$invalid = !1;
      this.$error = {};
      this.$$success = {};
      this.$pending = u;
      this.$name = l(d.name || "", !1)(a);
      this.$$parentForm = Ib;
      var m = e(d.ngModel),
        r = m.assign,
        t = m,
        s = r,
        v = null,
        B, p = this;
      this.$$setOptions = function(a) {
        if ((p.$options = a) && a.getterSetter) {
          var b = e(d.ngModel + "()"),
            f = e(d.ngModel + "($$$p)");
          t = function(a) {
            var c = m(a);
            z(c) && (c = b(a));
            return c
          };
          s = function(a, b) {
            z(m(a)) ? f(a, {
              $$$p: p.$modelValue
            }) : r(a, p.$modelValue)
          }
        } else if (!m.assign) throw lb("nonassign", d.ngModel, ua(c));
      };
      this.$render = x;
      this.$isEmpty =
        function(a) {
          return q(a) || "" === a || null === a || a !== a
        };
      var C = 0;
      Gd({
        ctrl: this,
        $element: c,
        set: function(a, b) {
          a[b] = !0
        },
        unset: function(a, b) {
          delete a[b]
        },
        $animate: f
      });
      this.$setPristine = function() {
        p.$dirty = !1;
        p.$pristine = !0;
        f.removeClass(c, Jb);
        f.addClass(c, Wa)
      };
      this.$setDirty = function() {
        p.$dirty = !0;
        p.$pristine = !1;
        f.removeClass(c, Wa);
        f.addClass(c, Jb);
        p.$$parentForm.$setDirty()
      };
      this.$setUntouched = function() {
        p.$touched = !1;
        p.$untouched = !0;
        f.setClass(c, "ng-untouched", "ng-touched")
      };
      this.$setTouched = function() {
        p.$touched = !0;
        p.$untouched = !1;
        f.setClass(c, "ng-touched", "ng-untouched")
      };
      this.$rollbackViewValue = function() {
        g.cancel(v);
        p.$viewValue = p.$$lastCommittedViewValue;
        p.$render()
      };
      this.$validate = function() {
        if (!Q(p.$modelValue) || !isNaN(p.$modelValue)) {
          var a = p.$$rawModelValue,
            b = p.$valid,
            c = p.$modelValue,
            d = p.$options && p.$options.allowInvalid;
          p.$$runValidators(a, p.$$lastCommittedViewValue, function(e) {
            d || b === e || (p.$modelValue = e ? a : u, p.$modelValue !== c && p.$$writeModelToScope())
          })
        }
      };
      this.$$runValidators = function(a, b, c) {
        function d() {
          var c = !0;
          n(p.$validators, function(d, e) {
            var g = d(a, b);
            c = c && g;
            f(e, g)
          });
          return c ? !0 : (n(p.$asyncValidators, function(a, b) {
            f(b, null)
          }), !1)
        }

        function e() {
          var c = [],
            d = !0;
          n(p.$asyncValidators, function(e, g) {
            var h = e(a, b);
            if (!h || !z(h.then)) throw lb("$asyncValidators", h);
            f(g, u);
            c.push(h.then(function() {
              f(g, !0)
            }, function(a) {
              d = !1;
              f(g, !1)
            }))
          });
          c.length ? k.all(c).then(function() {
            g(d)
          }, x) : g(!0)
        }

        function f(a, b) {
          h === C && p.$setValidity(a, b)
        }

        function g(a) {
          h === C && c(a)
        }
        C++;
        var h = C;
        (function() {
          var a = p.$$parserName || "parse";
          if (q(B)) f(a,
            null);
          else return B || (n(p.$validators, function(a, b) {
            f(b, null)
          }), n(p.$asyncValidators, function(a, b) {
            f(b, null)
          })), f(a, B), B;
          return !0
        })() ? d() ? e() : g(!1): g(!1)
      };
      this.$commitViewValue = function() {
        var a = p.$viewValue;
        g.cancel(v);
        if (p.$$lastCommittedViewValue !== a || "" === a && p.$$hasNativeValidators) p.$$lastCommittedViewValue = a, p.$pristine && this.$setDirty(), this.$$parseAndValidate()
      };
      this.$$parseAndValidate = function() {
        var b = p.$$lastCommittedViewValue;
        if (B = q(b) ? u : !0)
          for (var c = 0; c < p.$parsers.length; c++)
            if (b = p.$parsers[c](b),
              q(b)) {
              B = !1;
              break
            }
        Q(p.$modelValue) && isNaN(p.$modelValue) && (p.$modelValue = t(a));
        var d = p.$modelValue,
          e = p.$options && p.$options.allowInvalid;
        p.$$rawModelValue = b;
        e && (p.$modelValue = b, p.$modelValue !== d && p.$$writeModelToScope());
        p.$$runValidators(b, p.$$lastCommittedViewValue, function(a) {
          e || (p.$modelValue = a ? b : u, p.$modelValue !== d && p.$$writeModelToScope())
        })
      };
      this.$$writeModelToScope = function() {
        s(a, p.$modelValue);
        n(p.$viewChangeListeners, function(a) {
          try {
            a()
          } catch (c) {
            b(c)
          }
        })
      };
      this.$setViewValue = function(a, b) {
        p.$viewValue =
          a;
        p.$options && !p.$options.updateOnDefault || p.$$debounceViewValueCommit(b)
      };
      this.$$debounceViewValueCommit = function(b) {
        var c = 0,
          d = p.$options;
        d && y(d.debounce) && (d = d.debounce, Q(d) ? c = d : Q(d[b]) ? c = d[b] : Q(d["default"]) && (c = d["default"]));
        g.cancel(v);
        c ? v = g(function() {
          p.$commitViewValue()
        }, c) : h.$$phase ? p.$commitViewValue() : a.$apply(function() {
          p.$commitViewValue()
        })
      };
      a.$watch(function() {
        var b = t(a);
        if (b !== p.$modelValue && (p.$modelValue === p.$modelValue || b === b)) {
          p.$modelValue = p.$$rawModelValue = b;
          B = u;
          for (var c = p.$formatters,
              d = c.length, e = b; d--;) e = c[d](e);
          p.$viewValue !== e && (p.$viewValue = p.$$lastCommittedViewValue = e, p.$render(), p.$$runValidators(b, e, x))
        }
        return b
      })
    }],
    Ke = ["$rootScope", function(a) {
      return {
        restrict: "A",
        require: ["ngModel", "^?form", "^?ngModelOptions"],
        controller: yg,
        priority: 1,
        compile: function(b) {
          b.addClass(Wa).addClass("ng-untouched").addClass(mb);
          return {
            pre: function(a, b, e, f) {
              var g = f[0];
              b = f[1] || g.$$parentForm;
              g.$$setOptions(f[2] && f[2].$options);
              b.$addControl(g);
              e.$observe("name", function(a) {
                g.$name !== a && g.$$parentForm.$$renameControl(g,
                  a)
              });
              a.$on("$destroy", function() {
                g.$$parentForm.$removeControl(g)
              })
            },
            post: function(b, c, e, f) {
              var g = f[0];
              if (g.$options && g.$options.updateOn) c.on(g.$options.updateOn, function(a) {
                g.$$debounceViewValueCommit(a && a.type)
              });
              c.on("blur", function(c) {
                g.$touched || (a.$$phase ? b.$evalAsync(g.$setTouched) : b.$apply(g.$setTouched))
              })
            }
          }
        }
      }
    }],
    zg = /(\s+|^)default(\s+|$)/,
    Oe = function() {
      return {
        restrict: "A",
        controller: ["$scope", "$attrs", function(a, b) {
          var d = this;
          this.$options = bb(a.$eval(b.ngModelOptions));
          y(this.$options.updateOn) ?
            (this.$options.updateOnDefault = !1, this.$options.updateOn = U(this.$options.updateOn.replace(zg, function() {
              d.$options.updateOnDefault = !0;
              return " "
            }))) : this.$options.updateOnDefault = !0
        }]
      }
    },
    Ae = La({
      terminal: !0,
      priority: 1E3
    }),
    Ag = G("ngOptions"),
    Bg = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
    Ie = ["$compile", "$parse", function(a,
      b) {
      function d(a, c, d) {
        function e(a, b, c, d, f) {
          this.selectValue = a;
          this.viewValue = b;
          this.label = c;
          this.group = d;
          this.disabled = f
        }

        function l(a) {
          var b;
          if (!q && za(a)) b = a;
          else {
            b = [];
            for (var c in a) a.hasOwnProperty(c) && "$" !== c.charAt(0) && b.push(c)
          }
          return b
        }
        var m = a.match(Bg);
        if (!m) throw Ag("iexp", a, ua(c));
        var n = m[5] || m[7],
          q = m[6];
        a = / as /.test(m[0]) && m[1];
        var s = m[9];
        c = b(m[2] ? m[1] : n);
        var v = a && b(a) || c,
          u = s && b(s),
          p = s ? function(a, b) {
            return u(d, b)
          } : function(a) {
            return Ca(a)
          },
          C = function(a, b) {
            return p(a, z(a, b))
          },
          w = b(m[2] ||
            m[1]),
          y = b(m[3] || ""),
          B = b(m[4] || ""),
          x = b(m[8]),
          D = {},
          z = q ? function(a, b) {
            D[q] = b;
            D[n] = a;
            return D
          } : function(a) {
            D[n] = a;
            return D
          };
        return {
          trackBy: s,
          getTrackByValue: C,
          getWatchables: b(x, function(a) {
            var b = [];
            a = a || [];
            for (var c = l(a), e = c.length, f = 0; f < e; f++) {
              var g = a === c ? f : c[f],
                k = z(a[g], g),
                g = p(a[g], k);
              b.push(g);
              if (m[2] || m[1]) g = w(d, k), b.push(g);
              m[4] && (k = B(d, k), b.push(k))
            }
            return b
          }),
          getOptions: function() {
            for (var a = [], b = {}, c = x(d) || [], f = l(c), g = f.length, m = 0; m < g; m++) {
              var n = c === f ? m : f[m],
                r = z(c[n], n),
                q = v(d, r),
                n = p(q, r),
                t = w(d,
                  r),
                u = y(d, r),
                r = B(d, r),
                q = new e(n, q, t, u, r);
              a.push(q);
              b[n] = q
            }
            return {
              items: a,
              selectValueMap: b,
              getOptionFromViewValue: function(a) {
                return b[C(a)]
              },
              getViewValueFromOption: function(a) {
                return s ? fa.copy(a.viewValue) : a.viewValue
              }
            }
          }
        }
      }
      var c = X.createElement("option"),
        e = X.createElement("optgroup");
      return {
        restrict: "A",
        terminal: !0,
        require: ["select", "?ngModel"],
        link: {
          pre: function(a, b, c, d) {
            d[0].registerOption = x
          },
          post: function(b, g, h, k) {
            function l(a, b) {
              a.element = b;
              b.disabled = a.disabled;
              a.label !== b.label && (b.label = a.label,
                b.textContent = a.label);
              a.value !== b.value && (b.value = a.selectValue)
            }

            function m(a, b, c, d) {
              b && F(b.nodeName) === c ? c = b : (c = d.cloneNode(!1), b ? a.insertBefore(c, b) : a.appendChild(c));
              return c
            }

            function r(a) {
              for (var b; a;) b = a.nextSibling, Xb(a), a = b
            }

            function q(a) {
              var b = p && p[0],
                c = z && z[0];
              if (b || c)
                for (; a && (a === b || a === c || 8 === a.nodeType || "" === a.value);) a = a.nextSibling;
              return a
            }

            function s() {
              var a = D && u.readValue();
              D = E.getOptions();
              var b = {},
                d = g[0].firstChild;
              x && g.prepend(p);
              d = q(d);
              D.items.forEach(function(a) {
                var f, h;
                a.group ?
                  (f = b[a.group], f || (f = m(g[0], d, "optgroup", e), d = f.nextSibling, f.label = a.group, f = b[a.group] = {
                    groupElement: f,
                    currentOptionElement: f.firstChild
                  }), h = m(f.groupElement, f.currentOptionElement, "option", c), l(a, h), f.currentOptionElement = h.nextSibling) : (h = m(g[0], d, "option", c), l(a, h), d = h.nextSibling)
              });
              Object.keys(b).forEach(function(a) {
                r(b[a].currentOptionElement)
              });
              r(d);
              v.$render();
              if (!v.$isEmpty(a)) {
                var f = u.readValue();
                (E.trackBy ? ma(a, f) : a === f) || (v.$setViewValue(f), v.$render())
              }
            }
            var v = k[1];
            if (v) {
              var u = k[0];
              k =
                h.multiple;
              for (var p, C = 0, w = g.children(), y = w.length; C < y; C++)
                if ("" === w[C].value) {
                  p = w.eq(C);
                  break
                }
              var x = !!p,
                z = B(c.cloneNode(!1));
              z.val("?");
              var D, E = d(h.ngOptions, g, b);
              k ? (v.$isEmpty = function(a) {
                return !a || 0 === a.length
              }, u.writeValue = function(a) {
                D.items.forEach(function(a) {
                  a.element.selected = !1
                });
                a && a.forEach(function(a) {
                  (a = D.getOptionFromViewValue(a)) && !a.disabled && (a.element.selected = !0)
                })
              }, u.readValue = function() {
                var a = g.val() || [],
                  b = [];
                n(a, function(a) {
                  (a = D.selectValueMap[a]) && !a.disabled && b.push(D.getViewValueFromOption(a))
                });
                return b
              }, E.trackBy && b.$watchCollection(function() {
                if (I(v.$viewValue)) return v.$viewValue.map(function(a) {
                  return E.getTrackByValue(a)
                })
              }, function() {
                v.$render()
              })) : (u.writeValue = function(a) {
                var b = D.getOptionFromViewValue(a);
                b && !b.disabled ? g[0].value !== b.selectValue && (z.remove(), x || p.remove(), g[0].value = b.selectValue, b.element.selected = !0, b.element.setAttribute("selected", "selected")) : null === a || x ? (z.remove(), x || g.prepend(p), g.val(""), p.prop("selected", !0), p.attr("selected", !0)) : (x || p.remove(), g.prepend(z),
                  g.val("?"), z.prop("selected", !0), z.attr("selected", !0))
              }, u.readValue = function() {
                var a = D.selectValueMap[g.val()];
                return a && !a.disabled ? (x || p.remove(), z.remove(), D.getViewValueFromOption(a)) : null
              }, E.trackBy && b.$watch(function() {
                return E.getTrackByValue(v.$viewValue)
              }, function() {
                v.$render()
              }));
              x ? (p.remove(), a(p)(b), p.removeClass("ng-scope")) : p = B(c.cloneNode(!1));
              s();
              b.$watchCollection(E.getWatchables, s)
            }
          }
        }
      }
    }],
    Be = ["$locale", "$interpolate", "$log", function(a, b, d) {
      var c = /{}/g,
        e = /^when(Minus)?(.+)$/;
      return {
        link: function(f,
          g, h) {
          function k(a) {
            g.text(a || "")
          }
          var l = h.count,
            m = h.$attr.when && g.attr(h.$attr.when),
            r = h.offset || 0,
            s = f.$eval(m) || {},
            u = {},
            v = b.startSymbol(),
            y = b.endSymbol(),
            p = v + l + "-" + r + y,
            C = fa.noop,
            w;
          n(h, function(a, b) {
            var c = e.exec(b);
            c && (c = (c[1] ? "-" : "") + F(c[2]), s[c] = g.attr(h.$attr[b]))
          });
          n(s, function(a, d) {
            u[d] = b(a.replace(c, p))
          });
          f.$watch(l, function(b) {
            var c = parseFloat(b),
              e = isNaN(c);
            e || c in s || (c = a.pluralCat(c - r));
            c === w || e && Q(w) && isNaN(w) || (C(), e = u[c], q(e) ? (null != b && d.debug("ngPluralize: no rule defined for '" + c + "' in " +
              m), C = x, k()) : C = f.$watch(e, k), w = c)
          })
        }
      }
    }],
    Ce = ["$parse", "$animate", function(a, b) {
      var d = G("ngRepeat"),
        c = function(a, b, c, d, k, l, m) {
          a[c] = d;
          k && (a[k] = l);
          a.$index = b;
          a.$first = 0 === b;
          a.$last = b === m - 1;
          a.$middle = !(a.$first || a.$last);
          a.$odd = !(a.$even = 0 === (b & 1))
        };
      return {
        restrict: "A",
        multiElement: !0,
        transclude: "element",
        priority: 1E3,
        terminal: !0,
        $$tlb: !0,
        compile: function(e, f) {
          var g = f.ngRepeat,
            h = X.createComment(" end ngRepeat: " + g + " "),
            k = g.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
          if (!k) throw d("iexp", g);
          var l = k[1],
            m = k[2],
            r = k[3],
            q = k[4],
            k = l.match(/^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/);
          if (!k) throw d("iidexp", l);
          var s = k[3] || k[1],
            v = k[2];
          if (r && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(r) || /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(r))) throw d("badident", r);
          var x, p, y, w, z = {
            $id: Ca
          };
          q ? x = a(q) : (y = function(a, b) {
            return Ca(b)
          }, w = function(a) {
            return a
          });
          return function(a, e, f, k, l) {
            x && (p = function(b, c, d) {
              v && (z[v] = b);
              z[s] = c;
              z.$index =
                d;
              return x(a, z)
            });
            var q = $();
            a.$watchCollection(m, function(f) {
              var k, m, t = e[0],
                x, z = $(),
                D, E, H, F, I, G, J;
              r && (a[r] = f);
              if (za(f)) I = f, m = p || y;
              else
                for (J in m = p || w, I = [], f) qa.call(f, J) && "$" !== J.charAt(0) && I.push(J);
              D = I.length;
              J = Array(D);
              for (k = 0; k < D; k++)
                if (E = f === I ? k : I[k], H = f[E], F = m(E, H, k), q[F]) G = q[F], delete q[F], z[F] = G, J[k] = G;
                else {
                  if (z[F]) throw n(J, function(a) {
                    a && a.scope && (q[a.id] = a)
                  }), d("dupes", g, F, H);
                  J[k] = {
                    id: F,
                    scope: u,
                    clone: u
                  };
                  z[F] = !0
                }
              for (x in q) {
                G = q[x];
                F = rb(G.clone);
                b.leave(F);
                if (F[0].parentNode)
                  for (k = 0, m = F.length; k <
                    m; k++) F[k].$$NG_REMOVED = !0;
                G.scope.$destroy()
              }
              for (k = 0; k < D; k++)
                if (E = f === I ? k : I[k], H = f[E], G = J[k], G.scope) {
                  x = t;
                  do x = x.nextSibling; while (x && x.$$NG_REMOVED);
                  G.clone[0] != x && b.move(rb(G.clone), null, B(t));
                  t = G.clone[G.clone.length - 1];
                  c(G.scope, k, s, H, v, E, D)
                } else l(function(a, d) {
                  G.scope = d;
                  var e = h.cloneNode(!1);
                  a[a.length++] = e;
                  b.enter(a, null, B(t));
                  t = e;
                  G.clone = a;
                  z[G.id] = G;
                  c(G.scope, k, s, H, v, E, D)
                });
              q = z
            })
          }
        }
      }
    }],
    De = ["$animate", function(a) {
      return {
        restrict: "A",
        multiElement: !0,
        link: function(b, d, c) {
          b.$watch(c.ngShow, function(b) {
            a[b ?
              "removeClass" : "addClass"](d, "ng-hide", {
              tempClasses: "ng-hide-animate"
            })
          })
        }
      }
    }],
    we = ["$animate", function(a) {
      return {
        restrict: "A",
        multiElement: !0,
        link: function(b, d, c) {
          b.$watch(c.ngHide, function(b) {
            a[b ? "addClass" : "removeClass"](d, "ng-hide", {
              tempClasses: "ng-hide-animate"
            })
          })
        }
      }
    }],
    Ee = La(function(a, b, d) {
      a.$watch(d.ngStyle, function(a, d) {
        d && a !== d && n(d, function(a, c) {
          b.css(c, "")
        });
        a && b.css(a)
      }, !0)
    }),
    Fe = ["$animate", function(a) {
      return {
        require: "ngSwitch",
        controller: ["$scope", function() {
          this.cases = {}
        }],
        link: function(b,
          d, c, e) {
          var f = [],
            g = [],
            h = [],
            k = [],
            l = function(a, b) {
              return function() {
                a.splice(b, 1)
              }
            };
          b.$watch(c.ngSwitch || c.on, function(b) {
            var c, d;
            c = 0;
            for (d = h.length; c < d; ++c) a.cancel(h[c]);
            c = h.length = 0;
            for (d = k.length; c < d; ++c) {
              var q = rb(g[c].clone);
              k[c].$destroy();
              (h[c] = a.leave(q)).then(l(h, c))
            }
            g.length = 0;
            k.length = 0;
            (f = e.cases["!" + b] || e.cases["?"]) && n(f, function(b) {
              b.transclude(function(c, d) {
                k.push(d);
                var e = b.element;
                c[c.length++] = X.createComment(" end ngSwitchWhen: ");
                g.push({
                  clone: c
                });
                a.enter(c, e.parent(), e)
              })
            })
          })
        }
      }
    }],
    Ge = La({
      transclude: "element",
      priority: 1200,
      require: "^ngSwitch",
      multiElement: !0,
      link: function(a, b, d, c, e) {
        c.cases["!" + d.ngSwitchWhen] = c.cases["!" + d.ngSwitchWhen] || [];
        c.cases["!" + d.ngSwitchWhen].push({
          transclude: e,
          element: b
        })
      }
    }),
    He = La({
      transclude: "element",
      priority: 1200,
      require: "^ngSwitch",
      multiElement: !0,
      link: function(a, b, d, c, e) {
        c.cases["?"] = c.cases["?"] || [];
        c.cases["?"].push({
          transclude: e,
          element: b
        })
      }
    }),
    Je = La({
      restrict: "EAC",
      link: function(a, b, d, c, e) {
        if (!e) throw G("ngTransclude")("orphan", ua(b));
        e(function(a) {
          b.empty();
          b.append(a)
        })
      }
    }),
    je = ["$templateCache", function(a) {
      return {
        restrict: "E",
        terminal: !0,
        compile: function(b, d) {
          "text/ng-template" == d.type && a.put(d.id, b[0].text)
        }
      }
    }],
    Cg = {
      $setViewValue: x,
      $render: x
    },
    Dg = ["$element", "$scope", "$attrs", function(a, b, d) {
      var c = this,
        e = new Sa;
      c.ngModelCtrl = Cg;
      c.unknownOption = B(X.createElement("option"));
      c.renderUnknownOption = function(b) {
        b = "? " + Ca(b) + " ?";
        c.unknownOption.val(b);
        a.prepend(c.unknownOption);
        a.val(b)
      };
      b.$on("$destroy", function() {
        c.renderUnknownOption = x
      });
      c.removeUnknownOption =
        function() {
          c.unknownOption.parent() && c.unknownOption.remove()
        };
      c.readValue = function() {
        c.removeUnknownOption();
        return a.val()
      };
      c.writeValue = function(b) {
        c.hasOption(b) ? (c.removeUnknownOption(), a.val(b), "" === b && c.emptyOption.prop("selected", !0)) : null == b && c.emptyOption ? (c.removeUnknownOption(), a.val("")) : c.renderUnknownOption(b)
      };
      c.addOption = function(a, b) {
        Ra(a, '"option value"');
        "" === a && (c.emptyOption = b);
        var d = e.get(a) || 0;
        e.put(a, d + 1);
        c.ngModelCtrl.$render();
        b[0].hasAttribute("selected") && (b[0].selected = !0)
      };
      c.removeOption = function(a) {
        var b = e.get(a);
        b && (1 === b ? (e.remove(a), "" === a && (c.emptyOption = u)) : e.put(a, b - 1))
      };
      c.hasOption = function(a) {
        return !!e.get(a)
      };
      c.registerOption = function(a, b, d, e, l) {
        if (e) {
          var m;
          d.$observe("value", function(a) {
            y(m) && c.removeOption(m);
            m = a;
            c.addOption(a, b)
          })
        } else l ? a.$watch(l, function(a, e) {
          d.$set("value", a);
          e !== a && c.removeOption(e);
          c.addOption(a, b)
        }) : c.addOption(d.value, b);
        b.on("$destroy", function() {
          c.removeOption(d.value);
          c.ngModelCtrl.$render()
        })
      }
    }],
    ke = function() {
      return {
        restrict: "E",
        require: ["select", "?ngModel"],
        controller: Dg,
        priority: 1,
        link: {
          pre: function(a, b, d, c) {
            var e = c[1];
            if (e) {
              var f = c[0];
              f.ngModelCtrl = e;
              e.$render = function() {
                f.writeValue(e.$viewValue)
              };
              b.on("change", function() {
                a.$apply(function() {
                  e.$setViewValue(f.readValue())
                })
              });
              if (d.multiple) {
                f.readValue = function() {
                  var a = [];
                  n(b.find("option"), function(b) {
                    b.selected && a.push(b.value)
                  });
                  return a
                };
                f.writeValue = function(a) {
                  var c = new Sa(a);
                  n(b.find("option"), function(a) {
                    a.selected = y(c.get(a.value))
                  })
                };
                var g, h = NaN;
                a.$watch(function() {
                  h !==
                    e.$viewValue || ma(g, e.$viewValue) || (g = ia(e.$viewValue), e.$render());
                  h = e.$viewValue
                });
                e.$isEmpty = function(a) {
                  return !a || 0 === a.length
                }
              }
            }
          }
        }
      }
    },
    me = ["$interpolate", function(a) {
      return {
        restrict: "E",
        priority: 100,
        compile: function(b, d) {
          if (y(d.value)) var c = a(d.value, !0);
          else {
            var e = a(b.text(), !0);
            e || d.$set("value", b.text())
          }
          return function(a, b, d) {
            var k = b.parent();
            (k = k.data("$selectController") || k.parent().data("$selectController")) && k.registerOption(a, b, d, c, e)
          }
        }
      }
    }],
    le = na({
      restrict: "E",
      terminal: !1
    }),
    Fc = function() {
      return {
        restrict: "A",
        require: "?ngModel",
        link: function(a, b, d, c) {
          c && (d.required = !0, c.$validators.required = function(a, b) {
            return !d.required || !c.$isEmpty(b)
          }, d.$observe("required", function() {
            c.$validate()
          }))
        }
      }
    },
    Ec = function() {
      return {
        restrict: "A",
        require: "?ngModel",
        link: function(a, b, d, c) {
          if (c) {
            var e, f = d.ngPattern || d.pattern;
            d.$observe("pattern", function(a) {
              E(a) && 0 < a.length && (a = new RegExp("^" + a + "$"));
              if (a && !a.test) throw G("ngPattern")("noregexp", f, a, ua(b));
              e = a || u;
              c.$validate()
            });
            c.$validators.pattern = function(a, b) {
              return c.$isEmpty(b) ||
                q(e) || e.test(b)
            }
          }
        }
      }
    },
    Hc = function() {
      return {
        restrict: "A",
        require: "?ngModel",
        link: function(a, b, d, c) {
          if (c) {
            var e = -1;
            d.$observe("maxlength", function(a) {
              a = ea(a);
              e = isNaN(a) ? -1 : a;
              c.$validate()
            });
            c.$validators.maxlength = function(a, b) {
              return 0 > e || c.$isEmpty(b) || b.length <= e
            }
          }
        }
      }
    },
    Gc = function() {
      return {
        restrict: "A",
        require: "?ngModel",
        link: function(a, b, d, c) {
          if (c) {
            var e = 0;
            d.$observe("minlength", function(a) {
              e = ea(a) || 0;
              c.$validate()
            });
            c.$validators.minlength = function(a, b) {
              return c.$isEmpty(b) || b.length >= e
            }
          }
        }
      }
    };
  S.angular.bootstrap ?
    console.log("WARNING: Tried to load angular more than once.") : (ce(), ee(fa), fa.module("ngLocale", [], ["$provide", function(a) {
      function b(a) {
        a += "";
        var b = a.indexOf(".");
        return -1 == b ? 0 : a.length - b - 1
      }
      a.value("$locale", {
        DATETIME_FORMATS: {
          AMPMS: ["AM", "PM"],
          DAY: "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
          ERANAMES: ["Before Christ", "Anno Domini"],
          ERAS: ["BC", "AD"],
          FIRSTDAYOFWEEK: 6,
          MONTH: "January February March April May June July August September October November December".split(" "),
          SHORTDAY: "Sun Mon Tue Wed Thu Fri Sat".split(" "),
          SHORTMONTH: "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
          WEEKENDRANGE: [5, 6],
          fullDate: "EEEE, MMMM d, y",
          longDate: "MMMM d, y",
          medium: "MMM d, y h:mm:ss a",
          mediumDate: "MMM d, y",
          mediumTime: "h:mm:ss a",
          "short": "M/d/yy h:mm a",
          shortDate: "M/d/yy",
          shortTime: "h:mm a"
        },
        NUMBER_FORMATS: {
          CURRENCY_SYM: "$",
          DECIMAL_SEP: ".",
          GROUP_SEP: ",",
          PATTERNS: [{
            gSize: 3,
            lgSize: 3,
            maxFrac: 3,
            minFrac: 0,
            minInt: 1,
            negPre: "-",
            negSuf: "",
            posPre: "",
            posSuf: ""
          }, {
            gSize: 3,
            lgSize: 3,
            maxFrac: 2,
            minFrac: 2,
            minInt: 1,
            negPre: "-\u00a4",
            negSuf: "",
            posPre: "\u00a4",
            posSuf: ""
          }]
        },
        id: "en-us",
        pluralCat: function(a, c) {
          var e = a | 0,
            f = c;
          u === f && (f = Math.min(b(a), 3));
          Math.pow(10, f);
          return 1 == e && 0 == f ? "one" : "other"
        }
      })
    }]), B(X).ready(function() {
      Zd(X, yc)
    }))
})(window, document);
!window.angular.$$csp().noInlineStyle && window.angular.element(document.head).prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}.ng-animate-shim{visibility:hidden;}.ng-anchor{position:absolute;}</style>');
/*! RESOURCE: /scripts/angular_1.4.8/angular-sanitize.min.js */
/*
 AngularJS v1.4.8
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(n, h, p) {
  'use strict';

  function E(a) {
    var f = [];
    r(f, h.noop).chars(a);
    return f.join("")
  }

  function g(a, f) {
    var d = {},
      c = a.split(","),
      b;
    for (b = 0; b < c.length; b++) d[f ? h.lowercase(c[b]) : c[b]] = !0;
    return d
  }

  function F(a, f) {
    function d(a, b, d, l) {
      b = h.lowercase(b);
      if (s[b])
        for (; e.last() && t[e.last()];) c("", e.last());
      u[b] && e.last() == b && c("", b);
      (l = v[b] || !!l) || e.push(b);
      var m = {};
      d.replace(G, function(b, a, f, c, d) {
        m[a] = q(f || c || d || "")
      });
      f.start && f.start(b, m, l)
    }

    function c(b, a) {
      var c = 0,
        d;
      if (a = h.lowercase(a))
        for (c = e.length -
          1; 0 <= c && e[c] != a; c--);
      if (0 <= c) {
        for (d = e.length - 1; d >= c; d--) f.end && f.end(e[d]);
        e.length = c
      }
    }
    "string" !== typeof a && (a = null === a || "undefined" === typeof a ? "" : "" + a);
    var b, k, e = [],
      m = a,
      l;
    for (e.last = function() {
        return e[e.length - 1]
      }; a;) {
      l = "";
      k = !0;
      if (e.last() && w[e.last()]) a = a.replace(new RegExp("([\\W\\w]*)<\\s*\\/\\s*" + e.last() + "[^>]*>", "i"), function(a, b) {
        b = b.replace(H, "$1").replace(I, "$1");
        f.chars && f.chars(q(b));
        return ""
      }), c("", e.last());
      else {
        if (0 === a.indexOf("\x3c!--")) b = a.indexOf("--", 4), 0 <= b && a.lastIndexOf("--\x3e",
          b) === b && (f.comment && f.comment(a.substring(4, b)), a = a.substring(b + 3), k = !1);
        else if (x.test(a)) {
          if (b = a.match(x)) a = a.replace(b[0], ""), k = !1
        } else if (J.test(a)) {
          if (b = a.match(y)) a = a.substring(b[0].length), b[0].replace(y, c), k = !1
        } else K.test(a) && ((b = a.match(z)) ? (b[4] && (a = a.substring(b[0].length), b[0].replace(z, d)), k = !1) : (l += "<", a = a.substring(1)));
        k && (b = a.indexOf("<"), l += 0 > b ? a : a.substring(0, b), a = 0 > b ? "" : a.substring(b), f.chars && f.chars(q(l)))
      }
      if (a == m) throw L("badparse", a);
      m = a
    }
    c()
  }

  function q(a) {
    if (!a) return "";
    A.innerHTML =
      a.replace(/</g, "&lt;");
    return A.textContent
  }

  function B(a) {
    return a.replace(/&/g, "&amp;").replace(M, function(a) {
      var d = a.charCodeAt(0);
      a = a.charCodeAt(1);
      return "&#" + (1024 * (d - 55296) + (a - 56320) + 65536) + ";"
    }).replace(N, function(a) {
      return "&#" + a.charCodeAt(0) + ";"
    }).replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }

  function r(a, f) {
    var d = !1,
      c = h.bind(a, a.push);
    return {
      start: function(a, k, e) {
        a = h.lowercase(a);
        !d && w[a] && (d = a);
        d || !0 !== C[a] || (c("<"), c(a), h.forEach(k, function(d, e) {
          var k = h.lowercase(e),
            g = "img" === a && "src" === k ||
            "background" === k;
          !0 !== O[k] || !0 === D[k] && !f(d, g) || (c(" "), c(e), c('="'), c(B(d)), c('"'))
        }), c(e ? "/>" : ">"))
      },
      end: function(a) {
        a = h.lowercase(a);
        d || !0 !== C[a] || (c("</"), c(a), c(">"));
        a == d && (d = !1)
      },
      chars: function(a) {
        d || c(B(a))
      }
    }
  }
  var L = h.$$minErr("$sanitize"),
    z = /^<((?:[a-zA-Z])[\w:-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*(>?)/,
    y = /^<\/\s*([\w:-]+)[^>]*>/,
    G = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,
    K = /^</,
    J = /^<\//,
    H = /\x3c!--(.*?)--\x3e/g,
    x = /<!DOCTYPE([^>]*?)>/i,
    I = /<!\[CDATA\[(.*?)]]\x3e/g,
    M = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
    N = /([^\#-~| |!])/g,
    v = g("area,br,col,hr,img,wbr");
  n = g("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr");
  p = g("rp,rt");
  var u = h.extend({}, p, n),
    s = h.extend({}, n, g("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul")),
    t = h.extend({}, p, g("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var"));
  n = g("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,stop,svg,switch,text,title,tspan,use");
  var w = g("script,style"),
    C = h.extend({}, v, s, t, u, n),
    D = g("background,cite,href,longdesc,src,usemap,xlink:href");
  n = g("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,valign,value,vspace,width");
  p = g("accent-height,accumulate,additive,alphabetic,arabic-form,ascent,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan", !0);
  var O = h.extend({}, D, p, n),
    A = document.createElement("pre");
  h.module("ngSanitize", []).provider("$sanitize", function() {
    this.$get = ["$$sanitizeUri", function(a) {
      return function(f) {
        var d = [];
        F(f, r(d, function(c, b) {
          return !/^unsafe/.test(a(c, b))
        }));
        return d.join("")
      }
    }]
  });
  h.module("ngSanitize").filter("linky", ["$sanitize", function(a) {
    var f = /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
      d = /^mailto:/i;
    return function(c, b) {
      function k(a) {
        a && g.push(E(a))
      }

      function e(a,
        c) {
        g.push("<a ");
        h.isDefined(b) && g.push('target="', b, '" ');
        g.push('href="', a.replace(/"/g, "&quot;"), '">');
        k(c);
        g.push("</a>")
      }
      if (!c) return c;
      for (var m, l = c, g = [], n, p; m = l.match(f);) n = m[0], m[2] || m[4] || (n = (m[3] ? "http://" : "mailto:") + n), p = m.index, k(l.substr(0, p)), e(n, m[0].replace(d, "")), l = l.substring(p + m[0].length);
      k(l);
      return a(g.join(""))
    }
  }])
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.4.8/angular-animate.min.js */
/*
 AngularJS v1.4.8
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(H, u, Sa) {
  'use strict';

  function wa(a, b, c) {
    if (!a) throw ngMinErr("areq", b || "?", c || "required");
    return a
  }

  function xa(a, b) {
    if (!a && !b) return "";
    if (!a) return b;
    if (!b) return a;
    X(a) && (a = a.join(" "));
    X(b) && (b = b.join(" "));
    return a + " " + b
  }

  function Ia(a) {
    var b = {};
    a && (a.to || a.from) && (b.to = a.to, b.from = a.from);
    return b
  }

  function T(a, b, c) {
    var d = "";
    a = X(a) ? a : a && I(a) && a.length ? a.split(/\s+/) : [];
    q(a, function(a, s) {
      a && 0 < a.length && (d += 0 < s ? " " : "", d += c ? b + a : a + b)
    });
    return d
  }

  function Ja(a) {
    if (a instanceof L) switch (a.length) {
      case 0:
        return [];
      case 1:
        if (1 === a[0].nodeType) return a;
        break;
      default:
        return L(ma(a))
    }
    if (1 === a.nodeType) return L(a)
  }

  function ma(a) {
    if (!a[0]) return a;
    for (var b = 0; b < a.length; b++) {
      var c = a[b];
      if (1 == c.nodeType) return c
    }
  }

  function Ka(a, b, c) {
    q(b, function(b) {
      a.addClass(b, c)
    })
  }

  function La(a, b, c) {
    q(b, function(b) {
      a.removeClass(b, c)
    })
  }

  function N(a) {
    return function(b, c) {
      c.addClass && (Ka(a, b, c.addClass), c.addClass = null);
      c.removeClass && (La(a, b, c.removeClass), c.removeClass = null)
    }
  }

  function ia(a) {
    a = a || {};
    if (!a.$$prepared) {
      var b = a.domOperation ||
        M;
      a.domOperation = function() {
        a.$$domOperationFired = !0;
        b();
        b = M
      };
      a.$$prepared = !0
    }
    return a
  }

  function da(a, b) {
    ya(a, b);
    za(a, b)
  }

  function ya(a, b) {
    b.from && (a.css(b.from), b.from = null)
  }

  function za(a, b) {
    b.to && (a.css(b.to), b.to = null)
  }

  function Q(a, b, c) {
    var d = (b.addClass || "") + " " + (c.addClass || ""),
      e = (b.removeClass || "") + " " + (c.removeClass || "");
    a = Ma(a.attr("class"), d, e);
    c.preparationClasses && (b.preparationClasses = Y(c.preparationClasses, b.preparationClasses), delete c.preparationClasses);
    d = b.domOperation !== M ? b.domOperation :
      null;
    Aa(b, c);
    d && (b.domOperation = d);
    b.addClass = a.addClass ? a.addClass : null;
    b.removeClass = a.removeClass ? a.removeClass : null;
    return b
  }

  function Ma(a, b, c) {
    function d(a) {
      I(a) && (a = a.split(" "));
      var b = {};
      q(a, function(a) {
        a.length && (b[a] = !0)
      });
      return b
    }
    var e = {};
    a = d(a);
    b = d(b);
    q(b, function(a, b) {
      e[b] = 1
    });
    c = d(c);
    q(c, function(a, b) {
      e[b] = 1 === e[b] ? null : -1
    });
    var s = {
      addClass: "",
      removeClass: ""
    };
    q(e, function(b, c) {
      var e, d;
      1 === b ? (e = "addClass", d = !a[c]) : -1 === b && (e = "removeClass", d = a[c]);
      d && (s[e].length && (s[e] += " "), s[e] += c)
    });
    return s
  }

  function B(a) {
    return a instanceof u.element ? a[0] : a
  }

  function Na(a, b, c) {
    var d = "";
    b && (d = T(b, "ng-", !0));
    c.addClass && (d = Y(d, T(c.addClass, "-add")));
    c.removeClass && (d = Y(d, T(c.removeClass, "-remove")));
    d.length && (c.preparationClasses = d, a.addClass(d))
  }

  function ja(a, b) {
    var c = b ? "-" + b + "s" : "";
    ea(a, [fa, c]);
    return [fa, c]
  }

  function na(a, b) {
    var c = b ? "paused" : "",
      d = U + "PlayState";
    ea(a, [d, c]);
    return [d, c]
  }

  function ea(a, b) {
    a.style[b[0]] = b[1]
  }

  function Y(a, b) {
    return a ? b ? a + " " + b : a : b
  }

  function Ba(a, b, c) {
    var d = Object.create(null),
      e = a.getComputedStyle(b) || {};
    q(c, function(a, b) {
      var c = e[a];
      if (c) {
        var v = c.charAt(0);
        if ("-" === v || "+" === v || 0 <= v) c = Oa(c);
        0 === c && (c = null);
        d[b] = c
      }
    });
    return d
  }

  function Oa(a) {
    var b = 0;
    a = a.split(/\s*,\s*/);
    q(a, function(a) {
      "s" == a.charAt(a.length - 1) && (a = a.substring(0, a.length - 1));
      a = parseFloat(a) || 0;
      b = b ? Math.max(a, b) : a
    });
    return b
  }

  function oa(a) {
    return 0 === a || null != a
  }

  function Ca(a, b) {
    var c = O,
      d = a + "s";
    b ? c += "Duration" : d += " linear all";
    return [c, d]
  }

  function Da() {
    var a = Object.create(null);
    return {
      flush: function() {
        a = Object.create(null)
      },
      count: function(b) {
        return (b = a[b]) ? b.total : 0
      },
      get: function(b) {
        return (b = a[b]) && b.value
      },
      put: function(b, c) {
        a[b] ? a[b].total++ : a[b] = {
          total: 1,
          value: c
        }
      }
    }
  }

  function Ea(a, b, c) {
    q(c, function(c) {
      a[c] = V(a[c]) ? a[c] : b.style.getPropertyValue(c)
    })
  }
  var M = u.noop,
    Aa = u.extend,
    L = u.element,
    q = u.forEach,
    X = u.isArray,
    I = u.isString,
    pa = u.isObject,
    qa = u.isUndefined,
    V = u.isDefined,
    Fa = u.isFunction,
    ra = u.isElement,
    O, sa, U, ta;
  qa(H.ontransitionend) && V(H.onwebkittransitionend) ? (O = "WebkitTransition", sa = "webkitTransitionEnd transitionend") :
    (O = "transition", sa = "transitionend");
  qa(H.onanimationend) && V(H.onwebkitanimationend) ? (U = "WebkitAnimation", ta = "webkitAnimationEnd animationend") : (U = "animation", ta = "animationend");
  var ka = U + "Delay",
    ua = U + "Duration",
    fa = O + "Delay";
  H = O + "Duration";
  var Pa = {
      transitionDuration: H,
      transitionDelay: fa,
      transitionProperty: O + "Property",
      animationDuration: ua,
      animationDelay: ka,
      animationIterationCount: U + "IterationCount"
    },
    Qa = {
      transitionDuration: H,
      transitionDelay: fa,
      animationDuration: ua,
      animationDelay: ka
    };
  u.module("ngAnimate", []).directive("ngAnimateChildren", [function() {
    return function(a, b, c) {
      a = c.ngAnimateChildren;
      u.isString(a) && 0 === a.length ? b.data("$$ngAnimateChildren", !0) : c.$observe("ngAnimateChildren", function(a) {
        b.data("$$ngAnimateChildren", "on" === a || "true" === a)
      })
    }
  }]).factory("$$rAFScheduler", ["$$rAF", function(a) {
    function b(a) {
      d = d.concat(a);
      c()
    }

    function c() {
      if (d.length) {
        for (var b = d.shift(), h = 0; h < b.length; h++) b[h]();
        e || a(function() {
          e || c()
        })
      }
    }
    var d, e;
    d = b.queue = [];
    b.waitUntilQuiet = function(b) {
      e && e();
      e = a(function() {
        e =
          null;
        b();
        c()
      })
    };
    return b
  }]).factory("$$AnimateRunner", ["$q", "$sniffer", "$$animateAsyncRun", function(a, b, c) {
    function d(a) {
      this.setHost(a);
      this._doneCallbacks = [];
      this._runInAnimationFrame = c();
      this._state = 0
    }
    d.chain = function(a, b) {
      function c() {
        if (d === a.length) b(!0);
        else a[d](function(a) {
          !1 === a ? b(!1) : (d++, c())
        })
      }
      var d = 0;
      c()
    };
    d.all = function(a, b) {
      function c(h) {
        v = v && h;
        ++d === a.length && b(v)
      }
      var d = 0,
        v = !0;
      q(a, function(a) {
        a.done(c)
      })
    };
    d.prototype = {
      setHost: function(a) {
        this.host = a || {}
      },
      done: function(a) {
        2 === this._state ?
          a() : this._doneCallbacks.push(a)
      },
      progress: M,
      getPromise: function() {
        if (!this.promise) {
          var b = this;
          this.promise = a(function(a, c) {
            b.done(function(b) {
              !1 === b ? c() : a()
            })
          })
        }
        return this.promise
      },
      then: function(a, b) {
        return this.getPromise().then(a, b)
      },
      "catch": function(a) {
        return this.getPromise()["catch"](a)
      },
      "finally": function(a) {
        return this.getPromise()["finally"](a)
      },
      pause: function() {
        this.host.pause && this.host.pause()
      },
      resume: function() {
        this.host.resume && this.host.resume()
      },
      end: function() {
        this.host.end && this.host.end();
        this._resolve(!0)
      },
      cancel: function() {
        this.host.cancel && this.host.cancel();
        this._resolve(!1)
      },
      complete: function(a) {
        var b = this;
        0 === b._state && (b._state = 1, b._runInAnimationFrame(function() {
          b._resolve(a)
        }))
      },
      _resolve: function(a) {
        2 !== this._state && (q(this._doneCallbacks, function(b) {
          b(a)
        }), this._doneCallbacks.length = 0, this._state = 2)
      }
    };
    return d
  }]).factory("$$animateAsyncRun", ["$$rAF", function(a) {
    function b(b) {
      c.push(b);
      1 < c.length || a(function() {
        for (var a = 0; a < c.length; a++) c[a]();
        c = []
      })
    }
    var c = [];
    return function() {
      var a = !1;
      b(function() {
        a = !0
      });
      return function(c) {
        a ? c() : b(c)
      }
    }
  }]).provider("$$animateQueue", ["$animateProvider", function(a) {
    function b(a, b, c, q) {
      return d[a].some(function(a) {
        return a(b, c, q)
      })
    }

    function c(a, b) {
      a = a || {};
      var c = 0 < (a.addClass || "").length,
        d = 0 < (a.removeClass || "").length;
      return b ? c && d : c || d
    }
    var d = this.rules = {
      skip: [],
      cancel: [],
      join: []
    };
    d.join.push(function(a, b, d) {
      return !b.structural && c(b.options)
    });
    d.skip.push(function(a, b, d) {
      return !b.structural && !c(b.options)
    });
    d.skip.push(function(a, b, c) {
      return "leave" ==
        c.event && b.structural
    });
    d.skip.push(function(a, b, c) {
      return c.structural && 2 === c.state && !b.structural
    });
    d.cancel.push(function(a, b, c) {
      return c.structural && b.structural
    });
    d.cancel.push(function(a, b, c) {
      return 2 === c.state && b.structural
    });
    d.cancel.push(function(a, b, c) {
      a = b.options;
      c = c.options;
      return a.addClass && a.addClass === c.removeClass || a.removeClass && a.removeClass === c.addClass
    });
    this.$get = ["$$rAF", "$rootScope", "$rootElement", "$document", "$$HashMap", "$$animation", "$$AnimateRunner", "$templateRequest", "$$jqLite",
      "$$forceReflow",
      function(d, s, h, g, v, r, $, u, R, C) {
        function D() {
          var a = !1;
          return function(b) {
            a ? b() : s.$$postDigest(function() {
              a = !0;
              b()
            })
          }
        }

        function K(a, b, c) {
          var f = B(b),
            d = B(a),
            n = [];
          (a = t[c]) && q(a, function(a) {
            a.node.contains(f) ? n.push(a.callback) : "leave" === c && a.node.contains(d) && n.push(a.callback)
          });
          return n
        }

        function l(a, f, k) {
          function n(b, c, f, t) {
            R(function() {
              var b = K(v, a, c);
              b.length && d(function() {
                q(b, function(b) {
                  b(a, f, t)
                })
              })
            });
            b.progress(c, f, t)
          }

          function t(b) {
            var c = a,
              f = k;
            f.preparationClasses && (c.removeClass(f.preparationClasses),
              f.preparationClasses = null);
            f.activeClasses && (c.removeClass(f.activeClasses), f.activeClasses = null);
            Ha(a, k);
            da(a, k);
            k.domOperation();
            h.complete(!b)
          }
          var A, v;
          if (a = Ja(a)) A = B(a), v = a.parent();
          k = ia(k);
          var h = new $,
            R = D();
          X(k.addClass) && (k.addClass = k.addClass.join(" "));
          k.addClass && !I(k.addClass) && (k.addClass = null);
          X(k.removeClass) && (k.removeClass = k.removeClass.join(" "));
          k.removeClass && !I(k.removeClass) && (k.removeClass = null);
          k.from && !pa(k.from) && (k.from = null);
          k.to && !pa(k.to) && (k.to = null);
          if (!A) return t(), h;
          var z = [A.className, k.addClass, k.removeClass].join(" ");
          if (!Ra(z)) return t(), h;
          var l = 0 <= ["enter", "move", "leave"].indexOf(f),
            g = !G || F.get(A),
            z = !g && m.get(A) || {},
            C = !!z.state;
          g || C && 1 == z.state || (g = !la(a, v, f));
          if (g) return t(), h;
          l && y(a);
          g = {
            structural: l,
            element: a,
            event: f,
            close: t,
            options: k,
            runner: h
          };
          if (C) {
            if (b("skip", a, g, z)) {
              if (2 === z.state) return t(), h;
              Q(a, z.options, k);
              return z.runner
            }
            if (b("cancel", a, g, z))
              if (2 === z.state) z.runner.end();
              else if (z.structural) z.close();
            else return Q(a, z.options, g.options), z.runner;
            else if (b("join", a, g, z))
              if (2 === z.state) Q(a, k, {});
              else return Na(a, l ? f : null, k), f = g.event = z.event, k = Q(a, z.options, g.options), z.runner
          } else Q(a, k, {});
          (C = g.structural) || (C = "animate" === g.event && 0 < Object.keys(g.options.to || {}).length || c(g.options));
          if (!C) return t(), w(a), h;
          var u = (z.counter || 0) + 1;
          g.counter = u;
          x(a, 1, g);
          s.$$postDigest(function() {
            var b = m.get(A),
              d = !b,
              b = b || {},
              K = 0 < (a.parent() || []).length && ("animate" === b.event || b.structural || c(b.options));
            if (d || b.counter !== u || !K) {
              d && (Ha(a, k), da(a, k));
              if (d || l && b.event !==
                f) k.domOperation(), h.end();
              K || w(a)
            } else f = !b.structural && c(b.options, !0) ? "setClass" : b.event, x(a, 2), b = r(a, f, b.options), b.done(function(b) {
              t(!b);
              (b = m.get(A)) && b.counter === u && w(B(a));
              n(h, f, "close", {})
            }), h.setHost(b), n(h, f, "start", {})
          });
          return h
        }

        function y(a) {
          a = B(a).querySelectorAll("[data-ng-animate]");
          q(a, function(a) {
            var b = parseInt(a.getAttribute("data-ng-animate")),
              c = m.get(a);
            switch (b) {
              case 2:
                c.runner.end();
              case 1:
                c && m.remove(a)
            }
          })
        }

        function w(a) {
          a = B(a);
          a.removeAttribute("data-ng-animate");
          m.remove(a)
        }

        function f(a, b) {
          return B(a) === B(b)
        }

        function la(a, b, c) {
          c = L(g[0].body);
          var d = f(a, c) || "HTML" === a[0].nodeName,
            t = f(a, h),
            n = !1,
            w;
          for ((a = a.data("$ngAnimatePin")) && (b = a); b && b.length;) {
            t || (t = f(b, h));
            a = b[0];
            if (1 !== a.nodeType) break;
            var x = m.get(a) || {};
            n || (n = x.structural || F.get(a));
            if (qa(w) || !0 === w) a = b.data("$$ngAnimateChildren"), V(a) && (w = a);
            if (n && !1 === w) break;
            t || (t = f(b, h), t || (a = b.data("$ngAnimatePin")) && (b = a));
            d || (d = f(b, c));
            b = b.parent()
          }
          return (!n || w) && t && d
        }

        function x(a, b, c) {
          c = c || {};
          c.state = b;
          a = B(a);
          a.setAttribute("data-ng-animate",
            b);
          c = (b = m.get(a)) ? Aa(b, c) : c;
          m.put(a, c)
        }
        var m = new v,
          F = new v,
          G = null,
          A = s.$watch(function() {
            return 0 === u.totalPendingRequests
          }, function(a) {
            a && (A(), s.$$postDigest(function() {
              s.$$postDigest(function() {
                null === G && (G = !0)
              })
            }))
          }),
          t = {},
          n = a.classNameFilter(),
          Ra = n ? function(a) {
            return n.test(a)
          } : function() {
            return !0
          },
          Ha = N(R);
        return {
          on: function(a, b, c) {
            b = ma(b);
            t[a] = t[a] || [];
            t[a].push({
              node: b,
              callback: c
            })
          },
          off: function(a, b, c) {
            function f(a, b, c) {
              var d = ma(b);
              return a.filter(function(a) {
                return !(a.node === d && (!c || a.callback ===
                  c))
              })
            }
            var d = t[a];
            d && (t[a] = 1 === arguments.length ? null : f(d, b, c))
          },
          pin: function(a, b) {
            wa(ra(a), "element", "not an element");
            wa(ra(b), "parentElement", "not an element");
            a.data("$ngAnimatePin", b)
          },
          push: function(a, b, c, f) {
            c = c || {};
            c.domOperation = f;
            return l(a, b, c)
          },
          enabled: function(a, b) {
            var c = arguments.length;
            if (0 === c) b = !!G;
            else if (ra(a)) {
              var f = B(a),
                d = F.get(f);
              1 === c ? b = !d : (b = !!b) ? d && F.remove(f) : F.put(f, !0)
            } else b = G = !!a;
            return b
          }
        }
      }
    ]
  }]).provider("$$animation", ["$animateProvider", function(a) {
    function b(a) {
      return a.data("$$animationRunner")
    }
    var c = this.drivers = [];
    this.$get = ["$$jqLite", "$rootScope", "$injector", "$$AnimateRunner", "$$HashMap", "$$rAFScheduler", function(a, e, s, h, g, v) {
      function r(a) {
        function b(a) {
          if (a.processed) return a;
          a.processed = !0;
          var f = a.domNode,
            d = f.parentNode;
          e.put(f, a);
          for (var x; d;) {
            if (x = e.get(d)) {
              x.processed || (x = b(x));
              break
            }
            d = d.parentNode
          }(x || c).children.push(a);
          return a
        }
        var c = {
            children: []
          },
          d, e = new g;
        for (d = 0; d < a.length; d++) {
          var h = a[d];
          e.put(h.domNode, a[d] = {
            domNode: h.domNode,
            fn: h.fn,
            children: []
          })
        }
        for (d = 0; d < a.length; d++) b(a[d]);
        return function(a) {
          var b = [],
            c = [],
            d;
          for (d = 0; d < a.children.length; d++) c.push(a.children[d]);
          a = c.length;
          var m = 0,
            e = [];
          for (d = 0; d < c.length; d++) {
            var h = c[d];
            0 >= a && (a = m, m = 0, b.push(e), e = []);
            e.push(h.fn);
            h.children.forEach(function(a) {
              m++;
              c.push(a)
            });
            a--
          }
          e.length && b.push(e);
          return b
        }(c)
      }
      var $ = [],
        u = N(a);
      return function(g, C, D) {
        function K(a) {
          a = a.hasAttribute("ng-animate-ref") ? [a] : a.querySelectorAll("[ng-animate-ref]");
          var b = [];
          q(a, function(a) {
            var c = a.getAttribute("ng-animate-ref");
            c && c.length && b.push(a)
          });
          return b
        }

        function l(a) {
          var b = [],
            c = {};
          q(a, function(a, f) {
            var d = B(a.element),
              t = 0 <= ["enter", "move"].indexOf(a.event),
              d = a.structural ? K(d) : [];
            if (d.length) {
              var m = t ? "to" : "from";
              q(d, function(a) {
                var b = a.getAttribute("ng-animate-ref");
                c[b] = c[b] || {};
                c[b][m] = {
                  animationID: f,
                  element: L(a)
                }
              })
            } else b.push(a)
          });
          var f = {},
            d = {};
          q(c, function(c, m) {
            var w = c.from,
              e = c.to;
            if (w && e) {
              var h = a[w.animationID],
                g = a[e.animationID],
                x = w.animationID.toString();
              if (!d[x]) {
                var A = d[x] = {
                  structural: !0,
                  beforeStart: function() {
                    h.beforeStart();
                    g.beforeStart()
                  },
                  close: function() {
                    h.close();
                    g.close()
                  },
                  classes: y(h.classes, g.classes),
                  from: h,
                  to: g,
                  anchors: []
                };
                A.classes.length ? b.push(A) : (b.push(h), b.push(g))
              }
              d[x].anchors.push({
                out: w.element,
                "in": e.element
              })
            } else w = w ? w.animationID : e.animationID, e = w.toString(), f[e] || (f[e] = !0, b.push(a[w]))
          });
          return b
        }

        function y(a, b) {
          a = a.split(" ");
          b = b.split(" ");
          for (var c = [], f = 0; f < a.length; f++) {
            var d = a[f];
            if ("ng-" !== d.substring(0, 3))
              for (var m = 0; m < b.length; m++)
                if (d === b[m]) {
                  c.push(d);
                  break
                }
          }
          return c.join(" ")
        }

        function w(a) {
          for (var b =
              c.length - 1; 0 <= b; b--) {
            var f = c[b];
            if (s.has(f) && (f = s.get(f)(a))) return f
          }
        }

        function f(a, c) {
          a.from && a.to ? (b(a.from.element).setHost(c), b(a.to.element).setHost(c)) : b(a.element).setHost(c)
        }

        function la() {
          var a = b(g);
          !a || "leave" === C && D.$$domOperationFired || a.end()
        }

        function x(b) {
          g.off("$destroy", la);
          g.removeData("$$animationRunner");
          u(g, D);
          da(g, D);
          D.domOperation();
          A && a.removeClass(g, A);
          g.removeClass("ng-animate");
          F.complete(!b)
        }
        D = ia(D);
        var m = 0 <= ["enter", "move", "leave"].indexOf(C),
          F = new h({
            end: function() {
              x()
            },
            cancel: function() {
              x(!0)
            }
          });
        if (!c.length) return x(), F;
        g.data("$$animationRunner", F);
        var G = xa(g.attr("class"), xa(D.addClass, D.removeClass)),
          A = D.tempClasses;
        A && (G += " " + A, D.tempClasses = null);
        $.push({
          element: g,
          classes: G,
          event: C,
          structural: m,
          options: D,
          beforeStart: function() {
            g.addClass("ng-animate");
            A && a.addClass(g, A)
          },
          close: x
        });
        g.on("$destroy", la);
        if (1 < $.length) return F;
        e.$$postDigest(function() {
          var a = [];
          q($, function(c) {
            b(c.element) ? a.push(c) : c.close()
          });
          $.length = 0;
          var c = l(a),
            d = [];
          q(c, function(a) {
            d.push({
              domNode: B(a.from ?
                a.from.element : a.element),
              fn: function() {
                a.beforeStart();
                var c, d = a.close;
                if (b(a.anchors ? a.from.element || a.to.element : a.element)) {
                  var m = w(a);
                  m && (c = m.start)
                }
                c ? (c = c(), c.done(function(a) {
                  d(!a)
                }), f(a, c)) : d()
              }
            })
          });
          v(r(d))
        });
        return F
      }
    }]
  }]).provider("$animateCss", ["$animateProvider", function(a) {
    var b = Da(),
      c = Da();
    this.$get = ["$window", "$$jqLite", "$$AnimateRunner", "$timeout", "$$forceReflow", "$sniffer", "$$rAFScheduler", "$animate", function(a, e, s, h, g, v, r, u) {
      function Ga(a, b) {
        var c = a.parentNode;
        return (c.$$ngAnimateParentKey ||
          (c.$$ngAnimateParentKey = ++l)) + "-" + a.getAttribute("class") + "-" + b
      }

      function R(w, f, h, g) {
        var m;
        0 < b.count(h) && (m = c.get(h), m || (f = T(f, "-stagger"), e.addClass(w, f), m = Ba(a, w, g), m.animationDuration = Math.max(m.animationDuration, 0), m.transitionDuration = Math.max(m.transitionDuration, 0), e.removeClass(w, f), c.put(h, m)));
        return m || {}
      }

      function C(a) {
        y.push(a);
        r.waitUntilQuiet(function() {
          b.flush();
          c.flush();
          for (var a = g(), d = 0; d < y.length; d++) y[d](a);
          y.length = 0
        })
      }

      function D(c, f, e) {
        f = b.get(e);
        f || (f = Ba(a, c, Pa), "infinite" ===
          f.animationIterationCount && (f.animationIterationCount = 1));
        b.put(e, f);
        c = f;
        e = c.animationDelay;
        f = c.transitionDelay;
        c.maxDelay = e && f ? Math.max(e, f) : e || f;
        c.maxDuration = Math.max(c.animationDuration * c.animationIterationCount, c.transitionDuration);
        return c
      }
      var K = N(e),
        l = 0,
        y = [];
      return function(a, c) {
        function d() {
          m()
        }

        function g() {
          m(!0)
        }

        function m(b) {
          if (!(ga || va && k)) {
            ga = !0;
            k = !1;
            c.$$skipPreparationClasses || e.removeClass(a, Z);
            e.removeClass(a, Y);
            na(n, !1);
            ja(n, !1);
            q(y, function(a) {
              n.style[a[0]] = ""
            });
            K(a, c);
            da(a, c);
            Object.keys(t).length &&
              q(t, function(a, b) {
                a ? n.style.setProperty(b, a) : n.style.removeProperty(b)
              });
            if (c.onDone) c.onDone();
            H && H.complete(!b)
          }
        }

        function F(a) {
          p.blockTransition && ja(n, a);
          p.blockKeyframeAnimation && na(n, !!a)
        }

        function G() {
          H = new s({
            end: d,
            cancel: g
          });
          C(M);
          m();
          return {
            $$willAnimate: !1,
            start: function() {
              return H
            },
            end: d
          }
        }

        function A() {
          function b() {
            if (!ga) {
              F(!1);
              q(y, function(a) {
                n.style[a[0]] = a[1]
              });
              K(a, c);
              e.addClass(a, Y);
              if (p.recalculateTimingStyles) {
                ha = n.className + " " + Z;
                aa = Ga(n, ha);
                E = D(n, ha, aa);
                W = E.maxDelay;
                I = Math.max(W, 0);
                J = E.maxDuration;
                if (0 === J) {
                  m();
                  return
                }
                p.hasTransitions = 0 < E.transitionDuration;
                p.hasAnimations = 0 < E.animationDuration
              }
              p.applyAnimationDelay && (W = "boolean" !== typeof c.delay && oa(c.delay) ? parseFloat(c.delay) : W, I = Math.max(W, 0), E.animationDelay = W, ca = [ka, W + "s"], y.push(ca), n.style[ca[0]] = ca[1]);
              N = 1E3 * I;
              z = 1E3 * J;
              if (c.easing) {
                var k, l = c.easing;
                p.hasTransitions && (k = O + "TimingFunction", y.push([k, l]), n.style[k] = l);
                p.hasAnimations && (k = U + "TimingFunction", y.push([k, l]), n.style[k] = l)
              }
              E.transitionDuration && x.push(sa);
              E.animationDuration &&
                x.push(ta);
              A = Date.now();
              var v = N + 1.5 * z;
              k = A + v;
              var l = a.data("$$animateCss") || [],
                r = !0;
              if (l.length) {
                var G = l[0];
                (r = k > G.expectedEndTime) ? h.cancel(G.timer): l.push(m)
              }
              r && (v = h(d, v, !1), l[0] = {
                timer: v,
                expectedEndTime: k
              }, l.push(m), a.data("$$animateCss", l));
              a.on(x.join(" "), g);
              c.to && (c.cleanupStyles && Ea(t, n, Object.keys(c.to)), za(a, c))
            }
          }

          function d() {
            var b = a.data("$$animateCss");
            if (b) {
              for (var c = 1; c < b.length; c++) b[c]();
              a.removeData("$$animateCss")
            }
          }

          function g(a) {
            a.stopPropagation();
            var b = a.originalEvent || a;
            a = b.$manualTimeStamp ||
              b.timeStamp || Date.now();
            b = parseFloat(b.elapsedTime.toFixed(3));
            Math.max(a - A, 0) >= N && b >= J && (va = !0, m())
          }
          if (!ga)
            if (n.parentNode) {
              var A, x = [],
                l = function(a) {
                  if (va) k && a && (k = !1, m());
                  else if (k = !a, E.animationDuration)
                    if (a = na(n, k), k) y.push(a);
                    else {
                      var b = y,
                        c = b.indexOf(a);
                      0 <= a && b.splice(c, 1)
                    }
                },
                v = 0 < V && (E.transitionDuration && 0 === S.transitionDuration || E.animationDuration && 0 === S.animationDuration) && Math.max(S.animationDelay, S.transitionDelay);
              v ? h(b, Math.floor(v * V * 1E3), !1) : b();
              L.resume = function() {
                l(!0)
              };
              L.pause = function() {
                l(!1)
              }
            } else m()
        }
        var t = {},
          n = B(a);
        if (!n || !n.parentNode || !u.enabled()) return G();
        c = ia(c);
        var y = [],
          r = a.attr("class"),
          l = Ia(c),
          ga, k, va, H, L, I, N, J, z;
        if (0 === c.duration || !v.animations && !v.transitions) return G();
        var ba = c.event && X(c.event) ? c.event.join(" ") : c.event,
          Q = "",
          P = "";
        ba && c.structural ? Q = T(ba, "ng-", !0) : ba && (Q = ba);
        c.addClass && (P += T(c.addClass, "-add"));
        c.removeClass && (P.length && (P += " "), P += T(c.removeClass, "-remove"));
        c.applyClassesEarly && P.length && K(a, c);
        var Z = [Q, P].join(" ").trim(),
          ha = r + " " + Z,
          Y = T(Z, "-active"),
          r = l.to && 0 <
          Object.keys(l.to).length;
        if (!(0 < (c.keyframeStyle || "").length || r || Z)) return G();
        var aa, S;
        0 < c.stagger ? (l = parseFloat(c.stagger), S = {
          transitionDelay: l,
          animationDelay: l,
          transitionDuration: 0,
          animationDuration: 0
        }) : (aa = Ga(n, ha), S = R(n, Z, aa, Qa));
        c.$$skipPreparationClasses || e.addClass(a, Z);
        c.transitionStyle && (l = [O, c.transitionStyle], ea(n, l), y.push(l));
        0 <= c.duration && (l = 0 < n.style[O].length, l = Ca(c.duration, l), ea(n, l), y.push(l));
        c.keyframeStyle && (l = [U, c.keyframeStyle], ea(n, l), y.push(l));
        var V = S ? 0 <= c.staggerIndex ?
          c.staggerIndex : b.count(aa) : 0;
        (ba = 0 === V) && !c.skipBlocking && ja(n, 9999);
        var E = D(n, ha, aa),
          W = E.maxDelay;
        I = Math.max(W, 0);
        J = E.maxDuration;
        var p = {};
        p.hasTransitions = 0 < E.transitionDuration;
        p.hasAnimations = 0 < E.animationDuration;
        p.hasTransitionAll = p.hasTransitions && "all" == E.transitionProperty;
        p.applyTransitionDuration = r && (p.hasTransitions && !p.hasTransitionAll || p.hasAnimations && !p.hasTransitions);
        p.applyAnimationDuration = c.duration && p.hasAnimations;
        p.applyTransitionDelay = oa(c.delay) && (p.applyTransitionDuration ||
          p.hasTransitions);
        p.applyAnimationDelay = oa(c.delay) && p.hasAnimations;
        p.recalculateTimingStyles = 0 < P.length;
        if (p.applyTransitionDuration || p.applyAnimationDuration) J = c.duration ? parseFloat(c.duration) : J, p.applyTransitionDuration && (p.hasTransitions = !0, E.transitionDuration = J, l = 0 < n.style[O + "Property"].length, y.push(Ca(J, l))), p.applyAnimationDuration && (p.hasAnimations = !0, E.animationDuration = J, y.push([ua, J + "s"]));
        if (0 === J && !p.recalculateTimingStyles) return G();
        if (null != c.delay) {
          var ca = parseFloat(c.delay);
          p.applyTransitionDelay && y.push([fa, ca + "s"]);
          p.applyAnimationDelay && y.push([ka, ca + "s"])
        }
        null == c.duration && 0 < E.transitionDuration && (p.recalculateTimingStyles = p.recalculateTimingStyles || ba);
        N = 1E3 * I;
        z = 1E3 * J;
        c.skipBlocking || (p.blockTransition = 0 < E.transitionDuration, p.blockKeyframeAnimation = 0 < E.animationDuration && 0 < S.animationDelay && 0 === S.animationDuration);
        c.from && (c.cleanupStyles && Ea(t, n, Object.keys(c.from)), ya(a, c));
        p.blockTransition || p.blockKeyframeAnimation ? F(J) : c.skipBlocking || ja(n, !1);
        return {
          $$willAnimate: !0,
          end: d,
          start: function() {
            if (!ga) return L = {
              end: d,
              cancel: g,
              resume: null,
              pause: null
            }, H = new s(L), C(A), H
          }
        }
      }
    }]
  }]).provider("$$animateCssDriver", ["$$animationProvider", function(a) {
    a.drivers.push("$$animateCssDriver");
    this.$get = ["$animateCss", "$rootScope", "$$AnimateRunner", "$rootElement", "$sniffer", "$$jqLite", "$document", function(a, c, d, e, s, h, g) {
      function v(a) {
        return a.replace(/\bng-\S+\b/g, "")
      }

      function r(a, b) {
        I(a) && (a = a.split(" "));
        I(b) && (b = b.split(" "));
        return a.filter(function(a) {
          return -1 === b.indexOf(a)
        }).join(" ")
      }

      function u(c, e, g) {
        function h(a) {
          var b = {},
            c = B(a).getBoundingClientRect();
          q(["width", "height", "top", "left"], function(a) {
            var d = c[a];
            switch (a) {
              case "top":
                d += C.scrollTop;
                break;
              case "left":
                d += C.scrollLeft
            }
            b[a] = Math.floor(d) + "px"
          });
          return b
        }

        function f() {
          var c = v(g.attr("class") || ""),
            d = r(c, m),
            c = r(m, c),
            d = a(x, {
              to: h(g),
              addClass: "ng-anchor-in " + d,
              removeClass: "ng-anchor-out " + c,
              delay: !0
            });
          return d.$$willAnimate ? d : null
        }

        function s() {
          x.remove();
          e.removeClass("ng-animate-shim");
          g.removeClass("ng-animate-shim")
        }
        var x =
          L(B(e).cloneNode(!0)),
          m = v(x.attr("class") || "");
        e.addClass("ng-animate-shim");
        g.addClass("ng-animate-shim");
        x.addClass("ng-anchor");
        D.append(x);
        var F;
        c = function() {
          var c = a(x, {
            addClass: "ng-anchor-out",
            delay: !0,
            from: h(e)
          });
          return c.$$willAnimate ? c : null
        }();
        if (!c && (F = f(), !F)) return s();
        var G = c || F;
        return {
          start: function() {
            function a() {
              c && c.end()
            }
            var b, c = G.start();
            c.done(function() {
              c = null;
              if (!F && (F = f())) return c = F.start(), c.done(function() {
                c = null;
                s();
                b.complete()
              }), c;
              s();
              b.complete()
            });
            return b = new d({
              end: a,
              cancel: a
            })
          }
        }
      }

      function H(a, b, c, e) {
        var f = R(a, M),
          g = R(b, M),
          h = [];
        q(e, function(a) {
          (a = u(c, a.out, a["in"])) && h.push(a)
        });
        if (f || g || 0 !== h.length) return {
          start: function() {
            function a() {
              q(b, function(a) {
                a.end()
              })
            }
            var b = [];
            f && b.push(f.start());
            g && b.push(g.start());
            q(h, function(a) {
              b.push(a.start())
            });
            var c = new d({
              end: a,
              cancel: a
            });
            d.all(b, function(a) {
              c.complete(a)
            });
            return c
          }
        }
      }

      function R(c) {
        var d = c.element,
          e = c.options || {};
        c.structural && (e.event = c.event, e.structural = !0, e.applyClassesEarly = !0, "leave" === c.event && (e.onDone =
          e.domOperation));
        e.preparationClasses && (e.event = Y(e.event, e.preparationClasses));
        c = a(d, e);
        return c.$$willAnimate ? c : null
      }
      if (!s.animations && !s.transitions) return M;
      var C = g[0].body;
      c = B(e);
      var D = L(c.parentNode && 11 === c.parentNode.nodeType || C.contains(c) ? c : C);
      N(h);
      return function(a) {
        return a.from && a.to ? H(a.from, a.to, a.classes, a.anchors) : R(a)
      }
    }]
  }]).provider("$$animateJs", ["$animateProvider", function(a) {
    this.$get = ["$injector", "$$AnimateRunner", "$$jqLite", function(b, c, d) {
      function e(c) {
        c = X(c) ? c : c.split(" ");
        for (var d = [], e = {}, r = 0; r < c.length; r++) {
          var q = c[r],
            s = a.$$registeredAnimations[q];
          s && !e[q] && (d.push(b.get(s)), e[q] = !0)
        }
        return d
      }
      var s = N(d);
      return function(a, b, d, r) {
        function u() {
          r.domOperation();
          s(a, r)
        }

        function H(a, b, d, e, f) {
          switch (d) {
            case "animate":
              b = [b, e.from, e.to, f];
              break;
            case "setClass":
              b = [b, D, K, f];
              break;
            case "addClass":
              b = [b, D, f];
              break;
            case "removeClass":
              b = [b, K, f];
              break;
            default:
              b = [b, f]
          }
          b.push(e);
          if (a = a.apply(a, b))
            if (Fa(a.start) && (a = a.start()), a instanceof c) a.done(f);
            else if (Fa(a)) return a;
          return M
        }

        function B(a, b, d, e, f) {
          var g = [];
          q(e, function(e) {
            var h = e[f];
            h && g.push(function() {
              var e, f, g = !1,
                k = function(a) {
                  g || (g = !0, (f || M)(a), e.complete(!a))
                };
              e = new c({
                end: function() {
                  k()
                },
                cancel: function() {
                  k(!0)
                }
              });
              f = H(h, a, b, d, function(a) {
                k(!1 === a)
              });
              return e
            })
          });
          return g
        }

        function C(a, b, d, e, f) {
          var g = B(a, b, d, e, f);
          if (0 === g.length) {
            var h, l;
            "beforeSetClass" === f ? (h = B(a, "removeClass", d, e, "beforeRemoveClass"), l = B(a, "addClass", d, e, "beforeAddClass")) : "setClass" === f && (h = B(a, "removeClass", d, e, "removeClass"), l = B(a, "addClass",
              d, e, "addClass"));
            h && (g = g.concat(h));
            l && (g = g.concat(l))
          }
          if (0 !== g.length) return function(a) {
            var b = [];
            g.length && q(g, function(a) {
              b.push(a())
            });
            b.length ? c.all(b, a) : a();
            return function(a) {
              q(b, function(b) {
                a ? b.cancel() : b.end()
              })
            }
          }
        }
        3 === arguments.length && pa(d) && (r = d, d = null);
        r = ia(r);
        d || (d = a.attr("class") || "", r.addClass && (d += " " + r.addClass), r.removeClass && (d += " " + r.removeClass));
        var D = r.addClass,
          K = r.removeClass,
          l = e(d),
          y, w;
        if (l.length) {
          var f, I;
          "leave" == b ? (I = "leave", f = "afterLeave") : (I = "before" + b.charAt(0).toUpperCase() +
            b.substr(1), f = b);
          "enter" !== b && "move" !== b && (y = C(a, b, r, l, I));
          w = C(a, b, r, l, f)
        }
        if (y || w) return {
          start: function() {
            function b(c) {
              f = !0;
              u();
              da(a, r);
              g.complete(c)
            }
            var d, e = [];
            y && e.push(function(a) {
              d = y(a)
            });
            e.length ? e.push(function(a) {
              u();
              a(!0)
            }) : u();
            w && e.push(function(a) {
              d = w(a)
            });
            var f = !1,
              g = new c({
                end: function() {
                  f || ((d || M)(void 0), b(void 0))
                },
                cancel: function() {
                  f || ((d || M)(!0), b(!0))
                }
              });
            c.chain(e, b);
            return g
          }
        }
      }
    }]
  }]).provider("$$animateJsDriver", ["$$animationProvider", function(a) {
    a.drivers.push("$$animateJsDriver");
    this.$get = ["$$animateJs", "$$AnimateRunner", function(a, c) {
      function d(c) {
        return a(c.element, c.event, c.classes, c.options)
      }
      return function(a) {
        if (a.from && a.to) {
          var b = d(a.from),
            h = d(a.to);
          if (b || h) return {
            start: function() {
              function a() {
                return function() {
                  q(d, function(a) {
                    a.end()
                  })
                }
              }
              var d = [];
              b && d.push(b.start());
              h && d.push(h.start());
              c.all(d, function(a) {
                e.complete(a)
              });
              var e = new c({
                end: a(),
                cancel: a()
              });
              return e
            }
          }
        } else return d(a)
      }
    }]
  }])
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.4.8/angular-resource.min.js */
/*
 AngularJS v1.4.8
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(I, f, C) {
  'use strict';

  function D(t, e) {
    e = e || {};
    f.forEach(e, function(f, k) {
      delete e[k]
    });
    for (var k in t) !t.hasOwnProperty(k) || "$" === k.charAt(0) && "$" === k.charAt(1) || (e[k] = t[k]);
    return e
  }
  var y = f.$$minErr("$resource"),
    B = /^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;
  f.module("ngResource", ["ng"]).provider("$resource", function() {
    var t = /^https?:\/\/[^\/]*/,
      e = this;
    this.defaults = {
      stripTrailingSlashes: !0,
      actions: {
        get: {
          method: "GET"
        },
        save: {
          method: "POST"
        },
        query: {
          method: "GET",
          isArray: !0
        },
        remove: {
          method: "DELETE"
        },
        "delete": {
          method: "DELETE"
        }
      }
    };
    this.$get = ["$http", "$q", function(k, F) {
      function w(f, g) {
        this.template = f;
        this.defaults = r({}, e.defaults, g);
        this.urlParams = {}
      }

      function z(l, g, s, h) {
        function c(a, q) {
          var c = {};
          q = r({}, g, q);
          u(q, function(b, q) {
            x(b) && (b = b());
            var m;
            if (b && b.charAt && "@" == b.charAt(0)) {
              m = a;
              var d = b.substr(1);
              if (null == d || "" === d || "hasOwnProperty" === d || !B.test("." + d)) throw y("badmember", d);
              for (var d = d.split("."), n = 0, g = d.length; n < g && f.isDefined(m); n++) {
                var e = d[n];
                m = null !== m ? m[e] : C
              }
            } else m = b;
            c[q] = m
          });
          return c
        }

        function G(a) {
          return a.resource
        }

        function d(a) {
          D(a || {}, this)
        }
        var t = new w(l, h);
        s = r({}, e.defaults.actions, s);
        d.prototype.toJSON = function() {
          var a = r({}, this);
          delete a.$promise;
          delete a.$resolved;
          return a
        };
        u(s, function(a, q) {
          var g = /^(POST|PUT|PATCH)$/i.test(a.method);
          d[q] = function(b, A, m, e) {
            var n = {},
              h, l, s;
            switch (arguments.length) {
              case 4:
                s = e, l = m;
              case 3:
              case 2:
                if (x(A)) {
                  if (x(b)) {
                    l = b;
                    s = A;
                    break
                  }
                  l = A;
                  s = m
                } else {
                  n = b;
                  h = A;
                  l = m;
                  break
                }
              case 1:
                x(b) ? l = b : g ? h = b : n = b;
                break;
              case 0:
                break;
              default:
                throw y("badargs", arguments.length);
            }
            var w = this instanceof d,
              p = w ?
              h : a.isArray ? [] : new d(h),
              v = {},
              z = a.interceptor && a.interceptor.response || G,
              B = a.interceptor && a.interceptor.responseError || C;
            u(a, function(a, b) {
              switch (b) {
                default: v[b] = H(a);
                break;
                case "params":
                    case "isArray":
                    case "interceptor":
                    break;
                case "timeout":
                    v[b] = a
              }
            });
            g && (v.data = h);
            t.setUrlParams(v, r({}, c(h, a.params || {}), n), a.url);
            n = k(v).then(function(b) {
              var c = b.data,
                m = p.$promise;
              if (c) {
                if (f.isArray(c) !== !!a.isArray) throw y("badcfg", q, a.isArray ? "array" : "object", f.isArray(c) ? "array" : "object", v.method, v.url);
                a.isArray ?
                  (p.length = 0, u(c, function(b) {
                    "object" === typeof b ? p.push(new d(b)) : p.push(b)
                  })) : (D(c, p), p.$promise = m)
              }
              p.$resolved = !0;
              b.resource = p;
              return b
            }, function(b) {
              p.$resolved = !0;
              (s || E)(b);
              return F.reject(b)
            });
            n = n.then(function(b) {
              var a = z(b);
              (l || E)(a, b.headers);
              return a
            }, B);
            return w ? n : (p.$promise = n, p.$resolved = !1, p)
          };
          d.prototype["$" + q] = function(b, a, c) {
            x(b) && (c = a, a = b, b = {});
            b = d[q].call(this, b, this, a, c);
            return b.$promise || b
          }
        });
        d.bind = function(a) {
          return z(l, r({}, g, a), s)
        };
        return d
      }
      var E = f.noop,
        u = f.forEach,
        r = f.extend,
        H = f.copy,
        x = f.isFunction;
      w.prototype = {
        setUrlParams: function(l, g, e) {
          var h = this,
            c = e || h.template,
            k, d, r = "",
            a = h.urlParams = {};
          u(c.split(/\W/), function(d) {
            if ("hasOwnProperty" === d) throw y("badname");
            !/^\d+$/.test(d) && d && (new RegExp("(^|[^\\\\]):" + d + "(\\W|$)")).test(c) && (a[d] = !0)
          });
          c = c.replace(/\\:/g, ":");
          c = c.replace(t, function(a) {
            r = a;
            return ""
          });
          g = g || {};
          u(h.urlParams, function(a, e) {
            k = g.hasOwnProperty(e) ? g[e] : h.defaults[e];
            f.isDefined(k) && null !== k ? (d = encodeURIComponent(k).replace(/%40/gi, "@").replace(/%3A/gi,
              ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "%20").replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+"), c = c.replace(new RegExp(":" + e + "(\\W|$)", "g"), function(b, a) {
              return d + a
            })) : c = c.replace(new RegExp("(/?):" + e + "(\\W|$)", "g"), function(b, a, c) {
              return "/" == c.charAt(0) ? c : a + c
            })
          });
          h.defaults.stripTrailingSlashes && (c = c.replace(/\/+$/, "") || "/");
          c = c.replace(/\/\.(?=\w+($|\?))/, ".");
          l.url = r + c.replace(/\/\\\./, "/.");
          u(g, function(a, c) {
            h.urlParams[c] || (l.params = l.params || {}, l.params[c] =
              a)
          })
        }
      };
      return z
    }]
  })
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.4.8/angular-route.min.js */
/*
 AngularJS v1.4.8
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(p, c, C) {
  'use strict';

  function v(r, h, g) {
    return {
      restrict: "ECA",
      terminal: !0,
      priority: 400,
      transclude: "element",
      link: function(a, f, b, d, y) {
        function z() {
          k && (g.cancel(k), k = null);
          l && (l.$destroy(), l = null);
          m && (k = g.leave(m), k.then(function() {
            k = null
          }), m = null)
        }

        function x() {
          var b = r.current && r.current.locals;
          if (c.isDefined(b && b.$template)) {
            var b = a.$new(),
              d = r.current;
            m = y(b, function(b) {
              g.enter(b, null, m || f).then(function() {
                !c.isDefined(t) || t && !a.$eval(t) || h()
              });
              z()
            });
            l = d.scope = b;
            l.$emit("$viewContentLoaded");
            l.$eval(w)
          } else z()
        }
        var l, m, k, t = b.autoscroll,
          w = b.onload || "";
        a.$on("$routeChangeSuccess", x);
        x()
      }
    }
  }

  function A(c, h, g) {
    return {
      restrict: "ECA",
      priority: -400,
      link: function(a, f) {
        var b = g.current,
          d = b.locals;
        f.html(d.$template);
        var y = c(f.contents());
        b.controller && (d.$scope = a, d = h(b.controller, d), b.controllerAs && (a[b.controllerAs] = d), f.data("$ngControllerController", d), f.children().data("$ngControllerController", d));
        y(a)
      }
    }
  }
  p = c.module("ngRoute", ["ng"]).provider("$route", function() {
    function r(a, f) {
      return c.extend(Object.create(a),
        f)
    }

    function h(a, c) {
      var b = c.caseInsensitiveMatch,
        d = {
          originalPath: a,
          regexp: a
        },
        g = d.keys = [];
      a = a.replace(/([().])/g, "\\$1").replace(/(\/)?:(\w+)([\?\*])?/g, function(a, c, b, d) {
        a = "?" === d ? d : null;
        d = "*" === d ? d : null;
        g.push({
          name: b,
          optional: !!a
        });
        c = c || "";
        return "" + (a ? "" : c) + "(?:" + (a ? c : "") + (d && "(.+?)" || "([^/]+)") + (a || "") + ")" + (a || "")
      }).replace(/([\/$\*])/g, "\\$1");
      d.regexp = new RegExp("^" + a + "$", b ? "i" : "");
      return d
    }
    var g = {};
    this.when = function(a, f) {
      var b = c.copy(f);
      c.isUndefined(b.reloadOnSearch) && (b.reloadOnSearch = !0);
      c.isUndefined(b.caseInsensitiveMatch) && (b.caseInsensitiveMatch = this.caseInsensitiveMatch);
      g[a] = c.extend(b, a && h(a, b));
      if (a) {
        var d = "/" == a[a.length - 1] ? a.substr(0, a.length - 1) : a + "/";
        g[d] = c.extend({
          redirectTo: a
        }, h(d, b))
      }
      return this
    };
    this.caseInsensitiveMatch = !1;
    this.otherwise = function(a) {
      "string" === typeof a && (a = {
        redirectTo: a
      });
      this.when(null, a);
      return this
    };
    this.$get = ["$rootScope", "$location", "$routeParams", "$q", "$injector", "$templateRequest", "$sce", function(a, f, b, d, h, p, x) {
      function l(b) {
        var e = s.current;
        (v = (n = k()) && e && n.$$route === e.$$route && c.equals(n.pathParams, e.pathParams) && !n.reloadOnSearch && !w) || !e && !n || a.$broadcast("$routeChangeStart", n, e).defaultPrevented && b && b.preventDefault()
      }

      function m() {
        var u = s.current,
          e = n;
        if (v) u.params = e.params, c.copy(u.params, b), a.$broadcast("$routeUpdate", u);
        else if (e || u) w = !1, (s.current = e) && e.redirectTo && (c.isString(e.redirectTo) ? f.path(t(e.redirectTo, e.params)).search(e.params).replace() : f.url(e.redirectTo(e.pathParams, f.path(), f.search())).replace()), d.when(e).then(function() {
          if (e) {
            var a =
              c.extend({}, e.resolve),
              b, f;
            c.forEach(a, function(b, e) {
              a[e] = c.isString(b) ? h.get(b) : h.invoke(b, null, null, e)
            });
            c.isDefined(b = e.template) ? c.isFunction(b) && (b = b(e.params)) : c.isDefined(f = e.templateUrl) && (c.isFunction(f) && (f = f(e.params)), c.isDefined(f) && (e.loadedTemplateUrl = x.valueOf(f), b = p(f)));
            c.isDefined(b) && (a.$template = b);
            return d.all(a)
          }
        }).then(function(f) {
          e == s.current && (e && (e.locals = f, c.copy(e.params, b)), a.$broadcast("$routeChangeSuccess", e, u))
        }, function(b) {
          e == s.current && a.$broadcast("$routeChangeError",
            e, u, b)
        })
      }

      function k() {
        var a, b;
        c.forEach(g, function(d, g) {
          var q;
          if (q = !b) {
            var h = f.path();
            q = d.keys;
            var l = {};
            if (d.regexp)
              if (h = d.regexp.exec(h)) {
                for (var k = 1, m = h.length; k < m; ++k) {
                  var n = q[k - 1],
                    p = h[k];
                  n && p && (l[n.name] = p)
                }
                q = l
              } else q = null;
            else q = null;
            q = a = q
          }
          q && (b = r(d, {
            params: c.extend({}, f.search(), a),
            pathParams: a
          }), b.$$route = d)
        });
        return b || g[null] && r(g[null], {
          params: {},
          pathParams: {}
        })
      }

      function t(a, b) {
        var d = [];
        c.forEach((a || "").split(":"), function(a, c) {
          if (0 === c) d.push(a);
          else {
            var f = a.match(/(\w+)(?:[?*])?(.*)/),
              g = f[1];
            d.push(b[g]);
            d.push(f[2] || "");
            delete b[g]
          }
        });
        return d.join("")
      }
      var w = !1,
        n, v, s = {
          routes: g,
          reload: function() {
            w = !0;
            a.$evalAsync(function() {
              l();
              m()
            })
          },
          updateParams: function(a) {
            if (this.current && this.current.$$route) a = c.extend({}, this.current.params, a), f.path(t(this.current.$$route.originalPath, a)), f.search(a);
            else throw B("norout");
          }
        };
      a.$on("$locationChangeStart", l);
      a.$on("$locationChangeSuccess", m);
      return s
    }]
  });
  var B = c.$$minErr("ngRoute");
  p.provider("$routeParams", function() {
    this.$get = function() {
      return {}
    }
  });
  p.directive("ngView", v);
  p.directive("ngView", A);
  v.$inject = ["$route", "$anchorScroll", "$animate"];
  A.$inject = ["$compile", "$controller", "$route"]
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.4.8/angular-touch.min.js */
/*
 AngularJS v1.4.8
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(x, s, y) {
  'use strict';

  function t(f, k, p) {
    n.directive(f, ["$parse", "$swipe", function(c, e) {
      return function(l, m, g) {
        function h(a) {
          if (!b) return !1;
          var d = Math.abs(a.y - b.y);
          a = (a.x - b.x) * k;
          return r && 75 > d && 0 < a && 30 < a && .3 > d / a
        }
        var d = c(g[f]),
          b, r, a = ["touch"];
        s.isDefined(g.ngSwipeDisableMouse) || a.push("mouse");
        e.bind(m, {
          start: function(a, d) {
            b = a;
            r = !0
          },
          cancel: function(a) {
            r = !1
          },
          end: function(a, b) {
            h(a) && l.$apply(function() {
              m.triggerHandler(p);
              d(l, {
                $event: b
              })
            })
          }
        }, a)
      }
    }])
  }
  var n = s.module("ngTouch", []);
  n.factory("$swipe", [function() {
    function f(c) {
      c = c.originalEvent || c;
      var e = c.touches && c.touches.length ? c.touches : [c];
      c = c.changedTouches && c.changedTouches[0] || e[0];
      return {
        x: c.clientX,
        y: c.clientY
      }
    }

    function k(c, e) {
      var l = [];
      s.forEach(c, function(c) {
        (c = p[c][e]) && l.push(c)
      });
      return l.join(" ")
    }
    var p = {
      mouse: {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup"
      },
      touch: {
        start: "touchstart",
        move: "touchmove",
        end: "touchend",
        cancel: "touchcancel"
      }
    };
    return {
      bind: function(c, e, l) {
        var m, g, h, d, b = !1;
        l = l || ["mouse", "touch"];
        c.on(k(l, "start"), function(a) {
          h =
            f(a);
          b = !0;
          g = m = 0;
          d = h;
          e.start && e.start(h, a)
        });
        var r = k(l, "cancel");
        if (r) c.on(r, function(a) {
          b = !1;
          e.cancel && e.cancel(a)
        });
        c.on(k(l, "move"), function(a) {
          if (b && h) {
            var c = f(a);
            m += Math.abs(c.x - d.x);
            g += Math.abs(c.y - d.y);
            d = c;
            10 > m && 10 > g || (g > m ? (b = !1, e.cancel && e.cancel(a)) : (a.preventDefault(), e.move && e.move(c, a)))
          }
        });
        c.on(k(l, "end"), function(a) {
          b && (b = !1, e.end && e.end(f(a), a))
        })
      }
    }
  }]);
  n.config(["$provide", function(f) {
    f.decorator("ngClickDirective", ["$delegate", function(k) {
      k.shift();
      return k
    }])
  }]);
  n.directive("ngClick", ["$parse", "$timeout", "$rootElement", function(f, k, p) {
    function c(d, b, c) {
      for (var a = 0; a < d.length; a += 2) {
        var e = d[a + 1],
          g = c;
        if (25 > Math.abs(d[a] - b) && 25 > Math.abs(e - g)) return d.splice(a, a + 2), !0
      }
      return !1
    }

    function e(d) {
      if (!(2500 < Date.now() - m)) {
        var b = d.touches && d.touches.length ? d.touches : [d],
          e = b[0].clientX,
          b = b[0].clientY;
        if (!(1 > e && 1 > b || h && h[0] === e && h[1] === b)) {
          h && (h = null);
          var a = d.target;
          "label" === s.lowercase(a.nodeName || a[0] && a[0].nodeName) && (h = [e, b]);
          c(g, e, b) || (d.stopPropagation(), d.preventDefault(), d.target &&
            d.target.blur && d.target.blur())
        }
      }
    }

    function l(d) {
      d = d.touches && d.touches.length ? d.touches : [d];
      var b = d[0].clientX,
        c = d[0].clientY;
      g.push(b, c);
      k(function() {
        for (var a = 0; a < g.length; a += 2)
          if (g[a] == b && g[a + 1] == c) {
            g.splice(a, a + 2);
            break
          }
      }, 2500, !1)
    }
    var m, g, h;
    return function(d, b, h) {
      var a = f(h.ngClick),
        k = !1,
        q, n, t, v;
      b.on("touchstart", function(a) {
        k = !0;
        q = a.target ? a.target : a.srcElement;
        3 == q.nodeType && (q = q.parentNode);
        b.addClass("ng-click-active");
        n = Date.now();
        a = a.originalEvent || a;
        a = (a.touches && a.touches.length ? a.touches : [a])[0];
        t = a.clientX;
        v = a.clientY
      });
      b.on("touchcancel", function(a) {
        k = !1;
        b.removeClass("ng-click-active")
      });
      b.on("touchend", function(a) {
        var d = Date.now() - n,
          f = a.originalEvent || a,
          u = (f.changedTouches && f.changedTouches.length ? f.changedTouches : f.touches && f.touches.length ? f.touches : [f])[0],
          f = u.clientX,
          u = u.clientY,
          w = Math.sqrt(Math.pow(f - t, 2) + Math.pow(u - v, 2));
        k && 750 > d && 12 > w && (g || (p[0].addEventListener("click", e, !0), p[0].addEventListener("touchstart", l, !0), g = []), m = Date.now(), c(g, f, u), q && q.blur(), s.isDefined(h.disabled) &&
          !1 !== h.disabled || b.triggerHandler("click", [a]));
        k = !1;
        b.removeClass("ng-click-active")
      });
      b.onclick = function(a) {};
      b.on("click", function(b, c) {
        d.$apply(function() {
          a(d, {
            $event: c || b
          })
        })
      });
      b.on("mousedown", function(a) {
        b.addClass("ng-click-active")
      });
      b.on("mousemove mouseup", function(a) {
        b.removeClass("ng-click-active")
      })
    }
  }]);
  t("ngSwipeLeft", -1, "swipeleft");
  t("ngSwipeRight", 1, "swiperight")
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.4.8/angular-cookies.min.js */
/*
 AngularJS v1.4.8
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(p, c, n) {
  'use strict';

  function l(b, a, g) {
    var d = g.baseHref(),
      k = b[0];
    return function(b, e, f) {
      var g, h;
      f = f || {};
      h = f.expires;
      g = c.isDefined(f.path) ? f.path : d;
      c.isUndefined(e) && (h = "Thu, 01 Jan 1970 00:00:00 GMT", e = "");
      c.isString(h) && (h = new Date(h));
      e = encodeURIComponent(b) + "=" + encodeURIComponent(e);
      e = e + (g ? ";path=" + g : "") + (f.domain ? ";domain=" + f.domain : "");
      e += h ? ";expires=" + h.toUTCString() : "";
      e += f.secure ? ";secure" : "";
      f = e.length + 1;
      4096 < f && a.warn("Cookie '" + b + "' possibly not set or overflowed because it was too large (" +
        f + " > 4096 bytes)!");
      k.cookie = e
    }
  }
  c.module("ngCookies", ["ng"]).provider("$cookies", [function() {
    var b = this.defaults = {};
    this.$get = ["$$cookieReader", "$$cookieWriter", function(a, g) {
      return {
        get: function(d) {
          return a()[d]
        },
        getObject: function(d) {
          return (d = this.get(d)) ? c.fromJson(d) : d
        },
        getAll: function() {
          return a()
        },
        put: function(d, a, m) {
          g(d, a, m ? c.extend({}, b, m) : b)
        },
        putObject: function(d, b, a) {
          this.put(d, c.toJson(b), a)
        },
        remove: function(a, k) {
          g(a, n, k ? c.extend({}, b, k) : b)
        }
      }
    }]
  }]);
  c.module("ngCookies").factory("$cookieStore", ["$cookies", function(b) {
    return {
      get: function(a) {
        return b.getObject(a)
      },
      put: function(a, c) {
        b.putObject(a, c)
      },
      remove: function(a) {
        b.remove(a)
      }
    }
  }]);
  l.$inject = ["$document", "$log", "$browser"];
  c.module("ngCookies").provider("$$cookieWriter", function() {
    this.$get = l
  })
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.4.8/angular-aria.min.js */
/*
 AngularJS v1.4.8
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(u, n, v) {
  'use strict';
  var r = "BUTTON A INPUT TEXTAREA SELECT DETAILS SUMMARY".split(" "),
    p = function(a, c) {
      if (-1 !== c.indexOf(a[0].nodeName)) return !0
    };
  n.module("ngAria", ["ng"]).provider("$aria", function() {
    function a(a, f, l, m) {
      return function(d, e, b) {
        var g = b.$normalize(f);
        !c[g] || p(e, l) || b[g] || d.$watch(b[a], function(b) {
          b = m ? !b : !!b;
          e.attr(f, b)
        })
      }
    }
    var c = {
      ariaHidden: !0,
      ariaChecked: !0,
      ariaDisabled: !0,
      ariaRequired: !0,
      ariaInvalid: !0,
      ariaMultiline: !0,
      ariaValue: !0,
      tabindex: !0,
      bindKeypress: !0,
      bindRoleForClick: !0
    };
    this.config = function(a) {
      c = n.extend(c, a)
    };
    this.$get = function() {
      return {
        config: function(a) {
          return c[a]
        },
        $$watchExpr: a
      }
    }
  }).directive("ngShow", ["$aria", function(a) {
    return a.$$watchExpr("ngShow", "aria-hidden", [], !0)
  }]).directive("ngHide", ["$aria", function(a) {
    return a.$$watchExpr("ngHide", "aria-hidden", [], !1)
  }]).directive("ngModel", ["$aria", function(a) {
    function c(c, m, d) {
      return a.config(m) && !d.attr(c)
    }

    function k(a, c) {
      return !c.attr("role") && c.attr("type") === a && "INPUT" !== c[0].nodeName
    }

    function f(a, c) {
      var d =
        a.type,
        e = a.role;
      return "checkbox" === (d || e) || "menuitemcheckbox" === e ? "checkbox" : "radio" === (d || e) || "menuitemradio" === e ? "radio" : "range" === d || "progressbar" === e || "slider" === e ? "range" : "textbox" === (d || e) || "TEXTAREA" === c[0].nodeName ? "multiline" : ""
    }
    return {
      restrict: "A",
      require: "?ngModel",
      priority: 200,
      compile: function(l, m) {
        var d = f(m, l);
        return {
          pre: function(a, b, c, h) {
            "checkbox" === d && "checkbox" !== c.type && (h.$isEmpty = function(b) {
              return !1 === b
            })
          },
          post: function(e, b, g, h) {
            function f() {
              return h.$modelValue
            }

            function m() {
              return q ?
                (q = !1, function(a) {
                  a = g.value == h.$viewValue;
                  b.attr("aria-checked", a);
                  b.attr("tabindex", 0 - !a)
                }) : function(a) {
                  b.attr("aria-checked", g.value == h.$viewValue)
                }
            }

            function l() {
              b.attr("aria-checked", !h.$isEmpty(h.$viewValue))
            }
            var q = c("tabindex", "tabindex", b) && !p(b, r);
            switch (d) {
              case "radio":
              case "checkbox":
                k(d, b) && b.attr("role", d);
                c("aria-checked", "ariaChecked", b) && e.$watch(f, "radio" === d ? m() : l);
                q && b.attr("tabindex", 0);
                break;
              case "range":
                k(d, b) && b.attr("role", "slider");
                if (a.config("ariaValue")) {
                  var n = !b.attr("aria-valuemin") &&
                    (g.hasOwnProperty("min") || g.hasOwnProperty("ngMin")),
                    s = !b.attr("aria-valuemax") && (g.hasOwnProperty("max") || g.hasOwnProperty("ngMax")),
                    t = !b.attr("aria-valuenow");
                  n && g.$observe("min", function(a) {
                    b.attr("aria-valuemin", a)
                  });
                  s && g.$observe("max", function(a) {
                    b.attr("aria-valuemax", a)
                  });
                  t && e.$watch(f, function(a) {
                    b.attr("aria-valuenow", a)
                  })
                }
                q && b.attr("tabindex", 0);
                break;
              case "multiline":
                c("aria-multiline", "ariaMultiline", b) && b.attr("aria-multiline", !0)
            }
            h.$validators.required && c("aria-required", "ariaRequired",
              b) && e.$watch(function() {
              return h.$error.required
            }, function(a) {
              b.attr("aria-required", !!a)
            });
            c("aria-invalid", "ariaInvalid", b) && e.$watch(function() {
              return h.$invalid
            }, function(a) {
              b.attr("aria-invalid", !!a)
            })
          }
        }
      }
    }
  }]).directive("ngDisabled", ["$aria", function(a) {
    return a.$$watchExpr("ngDisabled", "aria-disabled", [])
  }]).directive("ngMessages", function() {
    return {
      restrict: "A",
      require: "?ngMessages",
      link: function(a, c, k, f) {
        c.attr("aria-live") || c.attr("aria-live", "assertive")
      }
    }
  }).directive("ngClick", ["$aria", "$parse",
    function(a, c) {
      return {
        restrict: "A",
        compile: function(k, f) {
          var l = c(f.ngClick, null, !0);
          return function(c, d, e) {
            if (!p(d, r) && (a.config("bindRoleForClick") && !d.attr("role") && d.attr("role", "button"), a.config("tabindex") && !d.attr("tabindex") && d.attr("tabindex", 0), a.config("bindKeypress") && !e.ngKeypress)) d.on("keypress", function(a) {
              function d() {
                l(c, {
                  $event: a
                })
              }
              var e = a.which || a.keyCode;
              32 !== e && 13 !== e || c.$apply(d)
            })
          }
        }
      }
    }
  ]).directive("ngDblclick", ["$aria", function(a) {
    return function(c, k, f) {
      !a.config("tabindex") ||
        k.attr("tabindex") || p(k, r) || k.attr("tabindex", 0)
    }
  }])
})(window, window.angular);
/*! RESOURCE: /scripts/app/base/_module.js */
angular.module('sn.base', ['sn.common.auth']);
window.countWatchers = window.countWatchers || function(root) {
  var watchers = [];
  var f = function(element) {
    angular.forEach(['$scope', '$isolateScope'], function(scopeProperty) {
      if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
        angular.forEach(element.data()[scopeProperty].$$watchers, function(watcher) {
          watchers.push(watcher);
        });
      }
    });
    angular.forEach(element.children(), function(childElement) {
      f(angular.element(childElement));
    });
  };
  f(root);
  var watchersWithoutDuplicates = [];
  angular.forEach(watchers, function(item) {
    if (watchersWithoutDuplicates.indexOf(item) < 0) {
      watchersWithoutDuplicates.push(item);
    }
  });
  console.log(watchersWithoutDuplicates.length);
};;
/*! RESOURCE: /scripts/sn/common/auth/_module.js */
angular.module('sn.common.auth', []);
angular.module('sn.auth', ['sn.common.auth']);;
/*! RESOURCE: /scripts/sn/common/auth/service.authInterceptor.js */
angular.module('sn.common.auth').config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope, $q, $injector, $window, $log) {
    var LOG_PREFIX = '(authIntercepter) ';

    function error(response) {
      var status = response.status;
      if (status == 401) {
        var newPromise = handle401(response);
        if (newPromise)
          return newPromise;
      }
      return $q.reject(response);
    }

    function handle401(response) {
      if (canResendRequest(response)) {
        var deferredAgain = $q.defer();
        var $http = $injector.get('$http');
        $http(response.config).then(function success(newResponse) {
          deferredAgain.resolve(newResponse);
        }, function error(newResponse) {
          deferredAgain.reject(newResponse);
        });
        return deferredAgain.promise;
      }
      $log.info(LOG_PREFIX + 'User has been logged out');
      $rootScope.$broadcast("@page.login");
      return null;
    }

    function canResendRequest(response) {
      var headers = response.headers();
      var requestToken = response.config.headers['X-UserToken'];
      if (!requestToken) {
        requestToken = headers['x-usertoken-request'];
      }
      if ($window.g_ck && (requestToken !== $window.g_ck)) {
        $log.info(LOG_PREFIX + 'Token refreshed since request -- retrying');
        response.config.headers['X-UserToken'] = $window.g_ck;
        return true;
      }
      if (headers['x-sessionloggedin'] != 'true')
        return false;
      if (headers['x-usertoken-allowresubmit'] == 'false')
        return false;
      var token = headers['x-usertoken-response'];
      if (token) {
        $log.info(LOG_PREFIX + 'Received new token -- retrying');
        response.config.headers['X-UserToken'] = token;
        setToken(token);
        return true;
      }
      return false;
    }

    function setToken(token) {
      $window.g_ck = token;
      if (!token) {
        $httpProvider.defaults.headers.common["X-UserToken"] = 'token_intentionally_left_blank';
      } else {
        $httpProvider.defaults.headers.common["X-UserToken"] = token;
      }
      if ($window.jQuery) {
        jQuery.ajaxSetup({
          headers: {
            'X-UserToken': token
          }
        });
      }
      if ($window.Zepto) {
        if (!Zepto.ajaxSettings.headers)
          Zepto.ajaxSettings.headers = {};
        Zepto.ajaxSettings.headers['X-UserToken'] = token;
      }
    }
    setToken($window.g_ck);
    return {
      responseError: error
    }
  });
});;;
/*! RESOURCE: /scripts/app.ng.amb/app.ng.amb.js */
angular.module("ng.amb", ['sn.common.presence', 'sn.common.util'])
  .value("ambLogLevel", 'info')
  .value("ambServletURI", '/amb')
  .value("cometd", angular.element.cometd)
  .value("ambLoginWindow", 'true');;
/*! RESOURCE: /scripts/app.ng.amb/service.AMB.js */
angular.module("ng.amb").service("amb", function(AMBOverlay, $window, $q, $log, $rootScope, $timeout) {
  "use strict";
  var ambClient = null;
  var _window = $window.self;
  var loginWindow = null;
  var sameScope = false;
  ambClient = amb.getClient();
  if (_window.g_ambClient) {
    sameScope = true;
  }
  if (sameScope) {
    var serverConnection = ambClient.getServerConnection();
    serverConnection.loginShow = function() {
      if (!serverConnection.isLoginWindowEnabled())
        return;
      if (loginWindow && loginWindow.isVisible())
        return;
      if (serverConnection.isLoginWindowOverride())
        return;
      loginWindow = new AMBOverlay();
      loginWindow.render();
      loginWindow.show();
    };
    serverConnection.loginHide = function() {
      if (!loginWindow)
        return;
      loginWindow.hide();
      loginWindow.destroy();
      loginWindow = null;
    }
  }
  var connected = $q.defer();
  var connectionInterrupted = false;
  var monitorAMB = false;
  $timeout(function() {
    monitorAMB = true;
  }, 5 * 1000);

  function ambInterrupted() {
    var state = ambClient.getState();
    return monitorAMB && state !== "opened" && state !== "initialized"
  }
  var interruptionTimeout;
  var extendedInterruption = false;

  function setInterrupted(eventName) {
    connectionInterrupted = true;
    $rootScope.$broadcast(eventName);
    if (!interruptionTimeout) {
      interruptionTimeout = $timeout(function() {
        extendedInterruption = true;
      }, 30 * 1000)
    }
    connected = $q.defer();
  }
  var connectOpenedEventId = ambClient.subscribeToEvent("connection.opened", function() {
    $rootScope.$broadcast("amb.connection.opened");
    if (interruptionTimeout) {
      $timeout.cancel(interruptionTimeout);
      interruptionTimeout = null;
    }
    extendedInterruption = false;
    if (connectionInterrupted) {
      connectionInterrupted = false;
      $rootScope.$broadcast("amb.connection.recovered");
    }
    connected.resolve();
  });
  var connectClosedEventId = ambClient.subscribeToEvent("connection.closed", function() {
    setInterrupted("amb.connection.closed");
  });
  var connectBrokenEventId = ambClient.subscribeToEvent("connection.broken", function() {
    setInterrupted("amb.connection.broken");
  });
  jQuery(window).unload(function fixMemoryLeakInGlobalAMBEventManager(event) {
    ambClient.unsubscribeFromEvent(connectOpenedEventId);
    ambClient.unsubscribeFromEvent(connectClosedEventId);
    ambClient.unsubscribeFromEvent(connectBrokenEventId);
    jQuery(this).unbind(event);
  });
  ambClient.connect();
  return {
    getServerConnection: function() {
      return ambClient.getServerConnection();
    },
    connect: function() {
      ambClient.connect();
      return connected.promise;
    },
    get interrupted() {
      return ambInterrupted();
    },
    get extendedInterruption() {
      return extendedInterruption;
    },
    get connected() {
      return connected.promise;
    },
    abort: function() {
      ambClient.abort();
    },
    disconnect: function() {
      ambClient.disconnect();
    },
    getConnectionState: function() {
      return ambClient.getConnectionState();
    },
    getClientId: function() {
      return ambClient.getClientId();
    },
    getChannel: function(channelName) {
      var channel = ambClient.getChannel0(channelName);
      var originalSubscribe = channel.subscribe;
      var originalUnsubscribe = channel.unsubscribe;
      channel.subscribe = function(listener) {
        originalSubscribe.call(channel, listener);
        jQuery(window).unload(function() {
          originalUnsubscribe.call(channel);
        });
        return channel;
      };
      return channel;
    },
    registerExtension: function(extensionName, extension) {
      ambClient.registerExtension(extensionName, extension);
    },
    unregisterExtension: function(extensionName) {
      ambClient.unregisterExtension(extensionName);
    },
    batch: function(batch) {
      ambClient.batch(batch);
    },
    getState: function() {
      return ambClient.getState();
    },
    getFilterString: function(filter) {
      filter = filter.
      replace(/\^EQ/g, '').
      replace(/\^ORDERBY(?:DESC)?[^^]*/g, '').
      replace(/^GOTO/, '');
      return btoa(filter).replace(/=/g, '-');
    },
    getChannelRW: function(table, filter) {
      var t = '/rw/default/' + table + '/' + this.getFilterString(filter);
      return this.getChannel(t);
    },
    isLoggedIn: function() {
      return ambClient.isLoggedIn();
    },
    subscribeToEvent: function(event, callback) {
      ambClient.subscribeToEvent(event, callback);
    },
    getConnectionEvents: function() {
      return ambClient.getConnectionEvents();
    },
    getEvents: function() {
      return ambClient.getConnectionEvents();
    },
    loginComplete: function() {
      ambClient.loginComplete();
    }
  };
});;
/*! RESOURCE: /scripts/app.ng.amb/controller.AMBRecordWatcher.js */
angular.module("ng.amb").controller("AMBRecordWatcher", function($scope, $timeout, $window) {
  "use strict";
  var amb = $window.top.g_ambClient;
  $scope.messages = [];
  var lastFilter;
  var watcherChannel;
  var watcher;

  function onMessage(message) {
    $scope.messages.push(message.data);
  }
  $scope.getState = function() {
    return amb.getState();
  };
  $scope.initWatcher = function() {
    angular.element(":focus").blur();
    if (!$scope.filter || $scope.filter === lastFilter)
      return;
    lastFilter = $scope.filter;
    console.log("initiating watcher on " + $scope.filter);
    $scope.messages = [];
    if (watcher) {
      watcher.unsubscribe();
    }
    var base64EncodeQuery = btoa($scope.filter).replace(/=/g, '-');
    var channelId = '/rw/' + base64EncodeQuery;
    watcherChannel = amb.getChannel(channelId)
    watcher = watcherChannel.subscribe(onMessage);
  };
  amb.connect();
});
/*! RESOURCE: /scripts/app.ng.amb/factory.snRecordWatcher.js */
angular.module("ng.amb").factory('snRecordWatcher', function($rootScope, amb, $timeout, snPresence, $log, urlTools) {
  "use strict";
  var watcherChannel;
  var connected = false;
  var diagnosticLog = true;

  function initWatcher(table, sys_id, query) {
    if (!table)
      return;
    if (sys_id)
      var filter = "sys_id=" + sys_id;
    else
      filter = query;
    if (!filter)
      return;
    return initChannel(table, filter);
  }

  function initList(table, query) {
    if (!table)
      return;
    query = query || "sys_idISNOTEMPTY";
    return initChannel(table, query);
  }

  function initTaskList(list, prevChannel) {
    if (prevChannel)
      prevChannel.unsubscribe();
    var sys_ids = list.toString();
    var filter = "sys_idIN" + sys_ids;
    return initChannel("task", filter);
  }

  function initChannel(table, filter) {
    if (isBlockedTable(table)) {
      $log.log("Blocked from watching", table);
      return null;
    }
    if (diagnosticLog)
      log(">>> init " + table + "?" + filter);
    watcherChannel = amb.getChannelRW(table, filter);
    watcherChannel.subscribe(onMessage);
    amb.connect();
    return watcherChannel;
  }

  function onMessage(message) {
    var r = message.data;
    var c = message.channel;
    if (diagnosticLog)
      log(">>> record " + r.operation + ": " + r.table_name + "." + r.sys_id + " " + r.display_value);
    $rootScope.$broadcast('record.updated', r);
    $rootScope.$broadcast("sn.stream.tap");
    $rootScope.$broadcast('list.updated', r, c);
  }

  function log(message) {
    $log.log(message);
  }

  function isBlockedTable(table) {
    return table == 'sys_amb_message' || table.startsWith('sys_rw');
  }
  return {
    initTaskList: initTaskList,
    initChannel: initChannel,
    init: function() {
      var location = urlTools.parseQueryString(window.location.search);
      var table = location['table'] || location['sysparm_table'];
      var sys_id = location['sys_id'] || location['sysparm_sys_id'];
      var query = location['sysparm_query'];
      initWatcher(table, sys_id, query);
      snPresence.init(table, sys_id, query);
    },
    initList: initList,
    initRecord: function(table, sysId) {
      initWatcher(table, sysId, null);
      snPresence.initWithDocument(table, sysId);
    }
  }
});;
/*! RESOURCE: /scripts/app.ng.amb/factory.AMBOverlay.js */
angular.module("ng.amb").factory("AMBOverlay", function($templateCache, $compile, $rootScope) {
  "use strict";
  var showCallbacks = [],
    hideCallbacks = [],
    isRendered = false,
    modal,
    modalScope,
    modalOptions;
  var defaults = {
    backdrop: 'static',
    keyboard: false,
    show: true
  };

  function AMBOverlay(config) {
    config = config || {};
    if (angular.isFunction(config.onShow))
      showCallbacks.push(config.onShow);
    if (angular.isFunction(config.onHide))
      hideCallbacks.push(config.onHide);

    function lazyRender() {
      if (!angular.element('html')['modal']) {
        var bootstrapInclude = "/scripts/bootstrap3/bootstrap.js";
        ScriptLoader.getScripts([bootstrapInclude], renderModal);
      } else
        renderModal();
    }

    function renderModal() {
      if (isRendered)
        return;
      modalScope = angular.extend($rootScope.$new(), config);
      modal = $compile($templateCache.get("amb_disconnect_modal.xml"))(modalScope);
      angular.element("body").append(modal);
      modal.on("shown.bs.modal", function(e) {
        for (var i = 0, len = showCallbacks.length; i < len; i++)
          showCallbacks[i](e);
      });
      modal.on("hidden.bs.modal", function(e) {
        for (var i = 0, len = hideCallbacks.length; i < len; i++)
          hideCallbacks[i](e);
      });
      modalOptions = angular.extend({}, defaults, config);
      modal.modal(modalOptions);
      isRendered = true;
    }

    function showModal() {
      if (isRendered)
        modal.modal('show');
    }

    function hideModal() {
      if (isRendered)
        modal.modal('hide');
    }

    function destroyModal() {
      if (!isRendered)
        return;
      modal.modal('hide');
      modal.remove();
      modalScope.$destroy();
      modalScope = void(0);
      isRendered = false;
      var pos = showCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        showCallbacks.splice(pos, 1);
      pos = hideCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        hideCallbacks.splice(pos, 1);
    }
    return {
      render: lazyRender,
      destroy: destroyModal,
      show: showModal,
      hide: hideModal,
      isVisible: function() {
        if (!isRendered)
          false;
        return modal.visible();
      }
    }
  }
  $templateCache.put('amb_disconnect_modal.xml',
    '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
    '	<div class="modal-dialog small-modal" style="width:450px">' +
    '		<div class="modal-content">' +
    '			<header class="modal-header">' +
    '				<h4 id="small_modal1_title" class="modal-title">{{title || "Login"}}</h4>' +
    '			</header>' +
    '			<div class="modal-body">' +
    '			<iframe class="concourse_modal" ng-src=\'{{iframe || "/amb_login.do"}}\' frameborder="0" scrolling="no" height="400px" width="405px"></iframe>' +
    '			</div>' +
    '		</div>' +
    '	</div>' +
    '</div>'
  );
  return AMBOverlay;
});;
/*! RESOURCE: /scripts/sn/common/_module.js */
angular.module('sn.common', [
  'ngSanitize',
  'ngAnimate',
  'sn.common.avatar',
  'sn.common.controls',
  'sn.common.datetime',
  'sn.common.glide',
  'sn.common.i18n',
  'sn.common.link',
  'sn.common.mention',
  'sn.common.messaging',
  'sn.common.notification',
  'sn.common.presence',
  'sn.common.stream',
  'sn.common.ui',
  'sn.common.user_profile',
  'sn.common.util'
]);
angular.module('ng.common', [
  'sn.common'
]);;
/*! RESOURCE: /scripts/sn/common/dist/templates.js */
angular.module('sn.common.dist.templates', []);;
/*! RESOURCE: /scripts/sn/common/datetime/js_includes_datetime.js */
/*! RESOURCE: /scripts/sn/common/datetime/_module.js */
angular.module('sn.common.datetime', [
  'sn.common.i18n'
]);
angular.module('sn.timeAgo', [
  'sn.common.datetime'
]);;
/*! RESOURCE: /scripts/sn/common/datetime/directive.snTimeAgo.js */
angular.module('sn.common.datetime').constant('DATE_GRANULARITY', {
  DATETIME: 1,
  DATE: 2
});
angular.module('sn.common.datetime').factory('timeAgoTimer', function($interval, $rootScope, DATE_GRANULARITY) {
  "use strict";
  var digestInterval;
  return function(displayGranularityType) {
    displayGranularityType = typeof displayGranularityType !== 'undefined' ? displayGranularityType : DATE_GRANULARITY.DATETIME;
    if (!digestInterval && displayGranularityType == DATE_GRANULARITY.DATETIME)
      digestInterval = $interval(function() {
        $rootScope.$broadcast('sn.TimeAgo.tick');
      }, 30 * 1000);
    return Date.now();
  };
});
angular.module('sn.common.datetime').factory('timeAgo', function(timeAgoSettings, DATE_GRANULARITY) {
  var service = {
    settings: timeAgoSettings.get(),
    allowFuture: function allowFuture(bool) {
      this.settings.allowFuture = bool;
      return this;
    },
    toWords: function toWords(distanceMillis, messageGranularity) {
      messageGranularity = messageGranularity || DATE_GRANULARITY.DATETIME;
      var $l = service.settings.strings;
      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if ((seconds < 45 && messageGranularity == DATE_GRANULARITY.DATETIME) || (hours < 24 && messageGranularity == DATE_GRANULARITY.DATE))
        prefix = suffix = '';
      if (service.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = suffix = "";
        }
      }
      if (!service.settings.allowFuture && distanceMillis < 0)
        prefix = suffix = "";

      function substitute(stringOrFunction, number) {
        var string = angular.isFunction(stringOrFunction) ?
          stringOrFunction(number, distanceMillis) : stringOrFunction;
        if (!string)
          return "";
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }
      var wantDate = messageGranularity == DATE_GRANULARITY.DATE;
      var wantDateTime = messageGranularity == DATE_GRANULARITY.DATETIME;
      var words = distanceMillis <= 0 && wantDateTime && substitute($l.justNow, 0) ||
        distanceMillis <= 0 && wantDate && substitute($l.today, 0) ||
        seconds < 45 && (distanceMillis >= 0 || !service.settings.allowFuture) && wantDateTime && substitute($l.justNow, Math.round(seconds)) ||
        seconds < 45 && wantDateTime && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && wantDateTime && substitute($l.minute, 1) ||
        minutes < 45 && wantDateTime && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && wantDateTime && substitute($l.hour, 1) ||
        hours < 24 && wantDateTime && substitute($l.hours, Math.round(hours)) ||
        hours < 24 && wantDate && substitute($l.today, 0) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.ceil(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));
      var separator = $l.wordSeparator === undefined ? " " : $l.wordSeparator;
      return [prefix, words, suffix].join(separator).trim();
    },
    parse: function(iso8601) {
      if (angular.isNumber(iso8601))
        return new Date(parseInt(iso8601, 10));
      var s = iso8601.trim();
      s = s.replace(/\.\d+/, "");
      s = s.replace(/-/, "/").replace(/-/, "/");
      s = s.replace(/T/, " ").replace(/Z/, " UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2");
      return new Date(s);
    }
  };
  return service;
});
angular.module('sn.common.datetime').directive("snTimeAgo", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
  "use strict";
  return {
    restrict: "E",
    template: '<time title="{{ ::titleTime }}">{{timeAgo}}</time>',
    scope: {
      timestamp: "=",
      local: "="
    },
    link: function(scope) {
      timeAgoSettings.ready.then(function() {
        timeAgoTimer(DATE_GRANULARITY.DATETIME)
        scope.$on('sn.TimeAgo.tick', setTimeAgo);
        setTimeAgo();
      });

      function setTimeAgo() {
        scope.timeAgo = timeAgoConverter(scope.timestamp, true);
      }

      function timeAgoConverter(input, noFuture) {
        if (!input)
          return;
        var allowFuture = !noFuture;
        var date = timeAgo.parse(input);
        if (scope.local) {
          scope.titleTime = input;
          return timeAgo.allowFuture(allowFuture).toWords(new Date() - date);
        }
        if (Object.prototype.toString.call(date) !== "[object Date]" && Object.prototype.toString.call(date) !== "[object Number]")
          return input;
        else if (Object.prototype.toString.call(date) == "[object Date]" && isNaN(date.getTime()))
          return input;
        setTitleTime(date);
        var currentDate = new Date();
        currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds());
        var diff = currentDate - date;
        return timeAgo.allowFuture(allowFuture).toWords(diff);
      }

      function setTitleTime(date) {
        var t = date.getTime();
        var o = date.getTimezoneOffset();
        t -= o * 60 * 1000;
        scope.titleTime = new Date(t).toLocaleString();
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/datetime/directive.snDayAgo.js */
angular.module('sn.common.datetime').directive("snDayAgo", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
  "use strict";
  return {
    restrict: "E",
    template: '<time>{{dayAgo}}</time>',
    scope: {
      date: "="
    },
    link: function(scope) {
      timeAgoSettings.ready.then(function() {
        setDayAgo();
      });

      function setDayAgo() {
        scope.dayAgo = dayAgoConverter(scope.date, "noFuture");
      }

      function dayAgoConverter(input, option) {
        if (!input) return;
        var allowFuture = !((option === 'noFuture') || (option === 'no_future'));
        var date = timeAgo.parse(input);
        if (Object.prototype.toString.call(date) !== "[object Date]")
          return input;
        else if (isNaN(date.getTime()))
          return input;
        var diff = timeAgoTimer(DATE_GRANULARITY.DATE) - date;
        return timeAgo.allowFuture(allowFuture).toWords(diff, DATE_GRANULARITY.DATE);
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/datetime/snTimeAgoSettings.js */
angular.module('sn.common.datetime').provider('snTimeAgoSettings', function() {
  "use strict";
  var INIT_NEVER = 'never';
  var INIT_AUTO = 'auto';
  var INIT_MANUAL = 'manual';
  var _initMethod = INIT_AUTO;
  this.setInitializationMethod = function(init) {
    switch (init) {
      default: init = INIT_AUTO;
      case INIT_NEVER:
          case INIT_AUTO:
          case INIT_MANUAL:
          _initMethod = init;
        break;
    }
  };
  this.$get = function(i18n, $q) {
    var settings = {
      allowFuture: true,
      dateOnly: false,
      strings: {}
    };
    var _initialized = false;
    var ready = $q.defer();

    function initialize() {
      if (_initMethod === INIT_NEVER) {
        return $q.reject();
      }
      if (!_initialized) {
        _initialized = true;
        i18n.getMessages(['%d ago', '%d from now', 'just now',
          'less than a minute', 'about a minute', '%d minutes', 'about an hour', 'about %d hours', 'today', 'a day', '%d days',
          'about a month', '%d months', 'about a year', 'about a year', '%d years'
        ], function(msgs) {
          settings.strings = {
            ago: msgs['%d ago'],
            fromNow: msgs['%d from now'],
            justNow: msgs["just now"],
            seconds: msgs["less than a minute"],
            minute: msgs["about a minute"],
            minutes: msgs["%d minutes"],
            hour: msgs["about an hour"],
            hours: msgs["about %d hours"],
            day: msgs["a day"],
            days: msgs["%d days"],
            month: msgs["about a month"],
            months: msgs["%d months"],
            year: msgs["about a year"],
            years: msgs["%d years"],
            today: msgs["today"],
            wordSeparator: msgs["timeago_number_separator"],
            numbers: []
          };
          ready.resolve();
        });
      }
      return ready.promise;
    }
    if (_initMethod === INIT_AUTO) {
      initialize();
    }
    return {
      initialize: initialize,
      ready: ready.promise,
      get: function get() {
        return settings;
      },
      set: function set(translated) {
        settings = angular.extend(settings, translated);
      }
    };
  };
}).factory('timeAgoSettings', function(snTimeAgoSettings) {
  return snTimeAgoSettings;
});;;
/*! RESOURCE: /scripts/sn/common/glide/js_includes_glide.js */
/*! RESOURCE: /scripts/sn/common/glide/_module.js */
angular.module('sn.common.glide', [
  'sn.common.util'
]);;
/*! RESOURCE: /scripts/sn/common/glide/factory.glideUrlBuilder.js */
angular.module('sn.common.glide').factory('glideUrlBuilder', ['$window', function($window) {
  "use strict";

  function GlideUrl(contextPath) {
    var objDef = {
      contextPath: '',
      params: {},
      encodedString: '',
      encode: true,
      setFromCurrent: function() {
        this.setFromString($window.location.href);
      },
      setFromString: function(href) {
        var pos = href.indexOf('?');
        if (pos < 0) {
          this.contextPath = href;
          return;
        }
        this.contextPath = href.slice(0, pos);
        var hashes = href.slice(pos + 1).split('&');
        var i = hashes.length;
        while (i--) {
          var pos = hashes[i].indexOf('=');
          this.params[hashes[i].substring(0, pos)] = hashes[i].substring(++pos);
        }
      },
      setContextPath: function(c) {
        this.contextPath = c;
      },
      getParam: function(p) {
        return this.params[p];
      },
      getParams: function() {
        return this.params;
      },
      addParam: function(name, value) {
        this.params[name] = value;
        return this;
      },
      addToken: function() {
        if (typeof g_ck != 'undefined' && g_ck != "")
          this.addParam('sysparm_ck', g_ck);
        return this;
      },
      deleteParam: function(name) {
        delete this.params[name];
      },
      addEncodedString: function(s) {
        if (!s)
          return;
        if (s.substr(0, 1) != "&")
          this.encodedString += "&";
        this.encodedString += s;
        return this;
      },
      getQueryString: function(additionalParams) {
        var qs = this._getParamsForURL(this.params);
        qs += this._getParamsForURL(additionalParams);
        qs += this.encodedString;
        if (qs.length == 0)
          return "";
        return qs.substring(1);
      },
      _getParamsForURL: function(params) {
        if (!params)
          return '';
        var url = '';
        for (var n in params) {
          var p = params[n] || '';
          url += '&' + n + '=' + (this.encode ? encodeURIComponent(p + '') : p);
        }
        return url;
      },
      getURL: function(additionalParams) {
        var url = this.contextPath;
        var qs = this.getQueryString(additionalParams);
        if (qs)
          url += "?" + qs;
        return url;
      },
      setEncode: function(b) {
        this.encode = b;
      },
      toString: function() {
        return 'GlideURL';
      }
    }
    return objDef;
  }
  return {
    newGlideUrl: function(contextPath) {
      var glideUrl = new GlideUrl();
      glideUrl.setFromString(contextPath ? contextPath : '');
      return glideUrl;
    },
    refresh: function() {
      $window.location.replace($window.location.href);
    },
    getCancelableLink: function(link) {
      if ($window.NOW && $window.NOW.g_cancelPreviousTransaction) {
        var nextChar = link.indexOf('?') > -1 ? '&' : '?';
        link += nextChar + "sysparm_cancelable=true";
      }
      return link;
    }
  };
}]);;
/*! RESOURCE: /scripts/sn/common/glide/service.queryFilter.js */
angular.module('sn.common.glide').factory('queryFilter', function() {
  "use strict";
  return {
    create: function() {
      var that = {};
      that.conditions = [];

      function newCondition(field, operator, value, label, displayValue, type) {
        var condition = {
          field: field,
          operator: operator,
          value: value,
          displayValue: displayValue,
          label: label,
          left: null,
          right: null,
          type: null,
          setValue: function(value, displayValue) {
            this.value = value;
            this.displayValue = displayValue ? displayValue : value;
          }
        };
        if (type)
          condition.type = type;
        return condition;
      }

      function addCondition(condition) {
        that.conditions.push(condition);
        return condition;
      }

      function removeCondition(condition) {
        for (var i = that.conditions.length - 1; i >= 0; i--) {
          if (that.conditions[i] === condition)
            that.conditions.splice(i, 1);
        }
      }

      function getConditionsByField(conditions, field) {
        var conditionsToReturn = [];
        for (var condition in conditions) {
          if (conditions.hasOwnProperty(condition)) {
            if (conditions[condition].field == field)
              conditionsToReturn.push(conditions[condition]);
          }
        }
        return conditionsToReturn;
      }

      function encodeCondition(condition) {
        var output = "";
        if (condition.hasOwnProperty("left") && condition.left) {
          output += encodeCondition(condition.left);
        }
        if (condition.hasOwnProperty("right") && condition.right) {
          var right = encodeCondition(condition.right);
          if (right.length > 0) {
            output += "^" + condition.type + right;
          }
        }
        if (condition.field) {
          output += condition.field;
          output += condition.operator;
          if (condition.value !== null && typeof condition.value !== "undefined")
            output += condition.value;
        }
        return output;
      }

      function createEncodedQuery() {
        var eq = "";
        var ca = that.conditions;
        for (var i = 0; i < ca.length; i++) {
          var condition = ca[i];
          if (eq.length)
            eq += '^';
          eq += encodeCondition(condition);
        }
        eq += "^EQ";
        return eq;
      }
      that.addCondition = addCondition;
      that.newCondition = newCondition;
      that.createEncodedQuery = createEncodedQuery;
      that.getConditionsByField = getConditionsByField;
      that.removeCondition = removeCondition;
      return that;
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/glide/service.filterExpressionParser.js */
angular.module('sn.common.glide').factory('filterExpressionParser', function() {
  'use strict';
  var operatorExpressions = [{
    wildcardExp: '(.*)',
    operator: 'STARTSWITH',
    toExpression: function(filter) {
      return filter;
    }
  }, {
    wildcardExp: '^\\*(.*)',
    operator: 'LIKE',
    toExpression: function(filter) {
      return (filter === '*' ? filter : '*' + filter);
    }
  }, {
    wildcardExp: '^\\.(.*)',
    operator: 'LIKE',
    toExpression: function(filter) {
      return '.' + filter;
    }
  }, {
    wildcardExp: '^%(.*)',
    operator: 'ENDSWITH',
    toExpression: function(filter) {
      return (filter === '%' ? filter : '%' + filter);
    }
  }, {
    wildcardExp: '(.*)%',
    operator: 'LIKE',
    toExpression: function(filter) {
      return filter + '%';
    }
  }, {
    wildcardExp: '^=(.*)',
    operator: '=',
    toExpression: function(filter) {
      return (filter === '=' ? filter : '=' + filter);
    }
  }, {
    wildcardExp: '^!\\*(.*)',
    operator: 'NOT LIKE',
    toExpression: function(filter) {
      return (filter === '!*' || filter === '!' ? filter : '!*' + filter);
    }
  }, {
    wildcardExp: '^!=(.*)',
    operator: '!=',
    toExpression: function(filter) {
      return (filter === '!=' || filter === '!' ? filter : '!=' + filter);
    }
  }];
  return {
    getOperatorExpressionForOperator: function(operator) {
      for (var i = 0; i < operatorExpressions.length; i++) {
        var item = operatorExpressions[i];
        if (item.operator === operator)
          return item;
      }
      throw {
        name: 'OperatorNotSupported',
        message: 'The operator ' + operator + ' is not in the list of operatorExpressions.'
      };
    },
    parse: function(val, defaultOperator) {
      var parsedValue = {
        filterText: val,
        operator: defaultOperator || 'STARTSWITH'
      };
      for (var i = 1; i < operatorExpressions.length; i++) {
        var operatorItem = operatorExpressions[i];
        var match = val.match(operatorItem.wildcardExp);
        if (match && match[1] !== '') {
          parsedValue.operator = operatorItem.operator;
          parsedValue.filterText = match[1];
        }
      }
      return parsedValue;
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/glide/service.userPreferences.js */
angular.module('sn.common.glide').factory("userPreferences", function($http, $q, unwrappedHTTPPromise, urlTools) {
  "use strict";
  var preferencesCache = {};

  function getPreference(preferenceName) {
    if (preferenceName in preferencesCache)
      return preferencesCache[preferenceName];
    var targetURL = urlTools.getURL('user_preference', {
        "sysparm_pref_name": preferenceName,
        "sysparm_action": "get"
      }),
      deferred = $q.defer();
    $http.get(targetURL).success(function(response) {
      deferred.resolve(response.sysparm_pref_value);
    }).error(function(data, status) {
      deferred.reject("Error getting preference " + preferenceName + ": " + status);
    });
    preferencesCache[preferenceName] = deferred.promise;
    return deferred.promise;
  }

  function setPreference(preferenceName, preferenceValue) {
    var targetURL = urlTools.getURL('user_preference', {
      "sysparm_pref_name": preferenceName,
      "sysparm_action": "set",
      "sysparm_pref_value": "" + preferenceValue
    });
    var httpPromise = $http.get(targetURL);
    addToCache(preferenceName, preferenceValue);
    return unwrappedHTTPPromise(httpPromise);
  }

  function addToCache(preferenceName, preferenceValue) {
    preferencesCache[preferenceName] = $q.when(preferenceValue);
  }
  var userPreferences = {
    getPreference: getPreference,
    setPreference: setPreference,
    addToCache: addToCache
  };
  return userPreferences;
});;
/*! RESOURCE: /scripts/sn/common/glide/service.nowStream.js */
angular.module('sn.common.glide').constant('nowStreamTimerInterval', 5000);
angular.module('sn.common.glide').factory('nowStream', function($q, $timeout, urlTools, nowStreamTimerInterval, snResource, $log) {
  'use strict';
  var Stream = function() {
    this.initialize.apply(this, arguments);
  };
  Stream.prototype = {
    initialize: function(table, query, sys_id, processor, interval, source, includeAttachments) {
      this.table = table;
      this.query = query;
      this.sysparmQuery = null;
      this.sys_id = sys_id;
      this.processor = processor;
      this.lastTimestamp = 0;
      this.inflightRequest = null;
      this.requestImmediateUpdate = false;
      this.interval = interval;
      this.source = source;
      this.includeAttachments = includeAttachments;
      this.stopped = true;
    },
    setQuery: function(sysparmQuery) {
      this.sysparmQuery = sysparmQuery;
    },
    poll: function(callback, preRequestCallback) {
      this.callback = callback;
      this.preRequestCallback = preRequestCallback;
      this._stopPolling();
      this._startPolling();
    },
    tap: function() {
      if (!this.inflightRequest) {
        this._stopPolling();
        this._startPolling();
      } else
        this.requestImmediateUpdate = true;
    },
    insert: function(field, text) {
      this.insertForEntry(field, text, this.table, this.sys_id);
    },
    insertForEntry: function(field, text, table, sys_id) {
      return this.insertEntries([{
        field: field,
        text: text
      }], table, sys_id);
    },
    expandMentions: function(entryText, mentionIDMap) {
      return entryText.replace(/@\[(.+?)\]/gi, function(mention) {
        var mentionedName = mention.substring(2, mention.length - 1);
        if (mentionIDMap[mentionedName]) {
          return "@[" + mentionIDMap[mentionedName] + ":" + mentionedName + "]";
        } else {
          return mention;
        }
      });
    },
    insertEntries: function(entries, table, sys_id, mentionIDMap) {
      mentionIDMap = mentionIDMap || {};
      var sanitizedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var entryText = entries[i].text;
        if (entryText && entryText.endsWith('\n'))
          entryText = entryText.substring(0, entryText.length - 1);
        if (!entryText)
          continue;
        entries[i].text = this.expandMentions(entryText, mentionIDMap);
        sanitizedEntries.push(entries[i]);
      }
      if (sanitizedEntries.length === 0)
        return;
      this._isInserting = true;
      var url = this._getInsertURL(table, sys_id);
      var that = this;
      return snResource().post(url, {
        entries: sanitizedEntries
      }).then(this._successCallback.bind(this), function() {
        $log.warn('Error submitting entries', sanitizedEntries);
      }).then(function() {
        that._isInserting = false;
      });
    },
    cancel: function() {
      this._stopPolling();
    },
    _startPolling: function() {
      var interval = this._getInterval();
      var that = this;
      var successCallback = this._successCallback.bind(this);
      that.stopped = false;

      function runPoll() {
        if (that._isInserting) {
          establishNextRequest();
          return;
        }
        if (!that.inflightRequest) {
          that.inflightRequest = that._executeRequest();
          that.inflightRequest.then(successCallback);
          that.inflightRequest.finally(function() {
            that.inflightRequest = null;
            if (that.requestImmediateUpdate) {
              that.requestImmediateUpdate = false;
              establishNextRequest(0);
            } else {
              establishNextRequest();
            }
          });
        }
      }

      function establishNextRequest(intervalOverride) {
        if (that.stopped)
          return;
        intervalOverride = (parseFloat(intervalOverride) >= 0) ? intervalOverride : interval;
        $timeout.cancel(that.timer);
        that.timer = $timeout(runPoll, intervalOverride);
      }
      runPoll();
    },
    _stopPolling: function() {
      if (this.timer)
        $timeout.cancel(this.timer);
      this.stopped = true;
    },
    _executeRequest: function() {
      var url = this._getURL();
      if (this.preRequestCallback) {
        this.preRequestCallback();
      }
      return snResource().get(url);
    },
    _getURL: function() {
      var params = {
        table: this.table,
        action: this._getAction(),
        sysparm_silent_request: true,
        sysparm_auto_request: true,
        sysparm_timestamp: this.lastTimestamp,
        include_attachments: this.includeAttachments
      };
      if (this.sys_id) {
        params['sys_id'] = this.sys_id;
      } else if (this.sysparmQuery) {
        params['sysparm_query'] = this.sysparmQuery;
      }
      var url = urlTools.getURL(this.processor, params);
      if (!this.sys_id) {
        url += "&p=" + this.query;
      }
      return url;
    },
    _getInsertURL: function(table, sys_id) {
      return urlTools.getURL(this.processor, {
        action: 'insert',
        table: table,
        sys_id: sys_id,
        sysparm_timestamp: this.timestamp || 0,
        sysparm_source: this.source
      });
    },
    _successCallback: function(response) {
      var response = response.data;
      if (response.entries && response.entries.length) {
        response.entries = this._filterOld(response.entries);
        if (response.entries.length > 0) {
          this.lastEntry = angular.copy(response.entries[0]);
          this.lastTimestamp = response.sys_timestamp || response.entries[0].sys_timestamp;
        }
      }
      this.callback.call(null, response);
    },
    _filterOld: function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].sys_timestamp == this.lastTimestamp) {
          if (!angular.equals(this._makeComparable(entries[i]), this._makeComparable(this.lastEntry)))
            continue;
        }
        if (entries[i].sys_timestamp <= this.lastTimestamp)
          return entries.slice(0, i);
      }
      return entries;
    },
    _makeComparable: function(entry) {
      var copy = angular.copy(entry);
      delete copy.short_description;
      delete copy.display_value;
      return copy;
    },
    _getAction: function() {
      return this.sys_id ? 'get_new_entries' : 'get_set_entries';
    },
    _getInterval: function() {
      if (this.interval)
        return this.interval;
      else if (window.NOW && NOW.stream_poll_interval)
        return NOW.stream_poll_interval * 1000;
      else
        return nowStreamTimerInterval;
    }
  };
  return {
    create: function(table, query, sys_id, processor, interval, source) {
      return new Stream(table, query, sys_id, processor, interval, source);
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/glide/service.nowServer.js */
angular.module('sn.common.glide').factory('nowServer', function($http, $q, userPreferences, angularProcessorUrl, urlTools) {
  return {
    getBaseURL: function() {
      return angularProcessorUrl;
    },
    getPartial: function(scope, partial, parms, callback) {
      var url = this.getPartialURL(partial, parms);
      if (url === scope.url) {
        callback.call();
        return;
      }
      var fn = scope.$on('$includeContentLoaded', function() {
        fn.call();
        callback.call();
      });
      scope.url = url;
    },
    replaceView: function($location, newView) {
      var p = $location.path();
      var a = p.split("/");
      a[1] = newView;
      p = a.join("/");
      return p;
    },
    getPartialURL: urlTools.getPartialURL,
    getURL: urlTools.getURL,
    urlFor: urlTools.urlFor,
    getPropertyURL: urlTools.getPropertyURL,
    setPreference: userPreferences.setPreference,
    getPreference: userPreferences.getPreference
  }
});;;
/*! RESOURCE: /scripts/sn/common/user_profile/js_includes_user_profile.js */
/*! RESOURCE: /scripts/sn/common/user_profile/_module.js */
angular.module("sn.common.user_profile", ['sn.common.ui']);;
/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http) {
  "use strict";
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snUserProfile.xml'),
    scope: {
      profile: "=",
      showDirectMessagePrompt: "="
    },
    link: function(scope) {
      scope.showDirectMessagePromptFn = function() {
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          return !(!scope.profile ||
            activeUserID === scope.profile.sysID ||
            (scope.profile.document && activeUserID === scope.profile.document));
        } else {
          return false;
        }
      };
    },
    controller: function($scope, snConnectService) {
      if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID)) {
        $scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
        $scope.$emit("sn-user-profile.ready");
      } else {
        $http.get('/api/now/live/profiles/sys_user.' + $scope.profile.userID).then(function(response) {
          angular.merge($scope.profile, response.data.result);
          avatarProfilePersister.setAvatar($scope.profile.userID, $scope.profile);
          $scope.$emit("sn-user-profile.ready");
        })
      }
      $scope.openDirectMessageConversation = function(evt) {
        if (evt.keyCode === 9)
          return;
        $timeout(function() {
          snConnectService.openWithProfile($scope.profile);
        }, 0, false);
        angular.element('.popover').each(function() {
          angular.element('body').off('click.snUserAvatarPopoverClose');
          angular.element(this).popover('hide');
        });
      };
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/avatar/_module.js */
angular.module('sn.common.avatar', ['sn.common.presence', 'sn.common.messaging', 'sn.common.user_profile']).config(function($provide) {
  $provide.value("liveProfileID", '');
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatarPopover.js */
angular.module('sn.common.avatar').directive('snAvatarPopover', function($http, $compile, getTemplateUrl, avatarProfilePersister, $injector) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_avatar_popover.xml'),
    replace: true,
    transclude: true,
    scope: {
      members: '=',
      primary: '=?',
      showPresence: '=?',
      enableContextMenu: '=?',
      enableTooltip: '=?',
      enableBindOnce: '@',
      displayMemberCount: "=?",
      groupAvatar: "@",
      nopopover: "=",
      directconversation: '@',
      conversation: '=',
      primaryNonAssign: '=?'
    },
    compile: function(tElement) {
      var template = tElement.html();
      return function(scope, element, attrs, controller, transcludeFn) {
        if (scope.directconversation) {
          if (scope.directconversation === "true")
            scope.directconversation = true;
          else
            scope.directconversation = false;
          scope.showdirectconversation = !scope.directconversation;
        } else {
          scope.showdirectconversation = true;
        }
        if ($injector.has('inSupportClient') && $injector.get('inSupportClient'))
          scope.showdirectconversation = false;
        if (scope.primaryNonAssign) {
          scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
          if (scope.users && scope.users[0])
            scope.users[0] = scope.primary;
        }

        function recompile() {
          if (scope.primaryNonAssign) {
            scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
            if (scope.users && scope.users[0])
              scope.users[0] = scope.primary;
          }
          var newElement = $compile(template, transcludeFn)(scope);
          element.html(newElement);
          if (scope.enableTooltip) {
            element.tooltip({
              placement: 'auto top',
              container: 'body'
            }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
            if (element.hideFix)
              element.hideFix();
          }
        }
        if (attrs.enableBindOnce === 'false') {
          scope.$watch('primary', recompile);
          scope.$watch('primaryNonAssign', recompile);
          scope.$watch('members', recompile);
        }
        if (scope.enableTooltip && scope.nopopover) {
          var usersWatch = scope.$watch('users', function() {
            if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
              element.tooltip({
                placement: 'auto top',
                container: 'body'
              }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
              if (element.hideFix)
                element.hideFix();
              usersWatch();
            }
          });
        }
      };
    },
    controller: function($scope, liveProfileID, $timeout, $element, $document, snCustomEvent) {
      $scope.randId = Math.random();
      $scope.loadEvent = 'sn-user-profile.ready';
      $scope.closeEvent = ['chat:open_conversation', 'snAvatar.closePopover', 'body_clicked'];
      $scope.popoverConfig = {
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      $scope.displayMemberCount = $scope.displayMemberCount || false;
      $scope.liveProfileID = liveProfileID;
      if ($scope.primaryNonAssign) {
        $scope.primary = angular.extend({}, $scope.primary, $scope.primaryNonAssign);
        if ($scope.users && $scope.users[0])
          $scope.users[0] = $scope.primary;
      }
      $scope.$watch('members', function(newVal, oldVal) {
        if (newVal === oldVal)
          return;
        if ($scope.members)
          buildAvatar();
      });
      $scope.noPopover = function() {
        $scope.popoverCursor = ($scope.nopopover || ($scope.members && $scope.members.length > 2)) ? "default" : "pointer";
        return ($scope.nopopover || ($scope.members && $scope.members.length > 2));
      }
      $scope.avatarType = function() {
        var result = [];
        if ($scope.groupAvatar || !$scope.users)
          return result;
        if ($scope.users.length > 1)
          result.push("group")
        if ($scope.users.length === 2)
          result.push("avatar-duo")
        if ($scope.users.length === 3)
          result.push("avatar-trio")
        if ($scope.users.length >= 4)
          result.push("avatar-quad")
        return result;
      }
      $scope.getBackgroundStyle = function(user) {
        var avatar = (user ? user.avatar : '');
        if ($scope.groupAvatar)
          avatar = $scope.groupAvatar;
        if (avatar && avatar !== '')
          return {
            'background-image': 'url(' + avatar + ')'
          };
        if (user && user.name)
          return '';
        return void(0);
      };
      $scope.stopPropCheck = function(evt) {
        $scope.$broadcast("snAvatar.closeOtherPopovers", $scope.randId);
        if (!$scope.nopopover) {
          evt.stopPropagation();
        }
      };
      $scope.$on("snAvatar.closeOtherPopovers", function(id) {
        if (id !== $scope.randId)
          snCustomEvent.fireTop('snAvatar.closePopover');
      });
      $scope.maxStringWidth = function() {
        var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
        return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
      };

      function buildInitials(name) {
        if (!name)
          return "--";
        var initials = name.split(" ").map(function(word) {
          return word.toUpperCase();
        }).filter(function(word) {
          return word.match(/^[A-Z]/);
        }).map(function(word) {
          return word.substring(0, 1);
        }).join("");
        return (initials.length > 3) ?
          initials.substr(0, 3) :
          initials;
      }
      $scope.avatartooltip = function() {
        if (!$scope.enableTooltip) {
          return '';
        }
        if (!$scope.users) {
          return '';
        }
        var names = [];
        $scope.users.forEach(function(user) {
          if (!user) {
            return;
          }
          names.push(user.name);
        });
        return names.join(', ');
      };

      function buildAvatar() {
        if (typeof $scope.primary === 'string') {
          $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
            $scope.users = [{
              userID: $scope.primary,
              name: response.data.result.name,
              initials: buildInitials(response.data.result.name),
              avatar: response.data.result.avatar
            }];
          });
          return;
        }
        if ($scope.primary) {
          if ($scope.primary.userImage)
            $scope.primary.avatar = $scope.primary.userImage;
          if (!$scope.primary.userID && $scope.primary.sys_id)
            $scope.primary.userID = $scope.primary.sys_id;
        }
        $scope.isGroup = $scope.conversation && $scope.conversation.isGroup;
        $scope.users = [$scope.primary];
        if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
          $scope.users = [$scope.primary];
        } else if ($scope.members && $scope.members.length > 0) {
          $scope.users = buildCompositeAvatar($scope.members);
        }
        $scope.presenceEnabled = $scope.showPresence && !$scope.isGroup && $scope.users.length === 1;
      }

      function buildCompositeAvatar(members) {
        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
        var users = angular.isArray(members) ? members.slice() : [members];
        users = users.sort(function(a, b) {
          var aID = a.userID || a.document;
          var bID = b.userID || b.document;
          if (a.table === "chat_queue_entry")
            return 1;
          if (aID === currentUser)
            return 1;
          else if (bID === currentUser)
            return -1;
          return 0;
        });
        if (users.length === 2)
          users = [users[0]];
        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
          var index = -1;
          angular.forEach(users, function(user, i) {
            if (user.sys_id === $scope.primary.sys_id) {
              index = i;
            }
          });
          if (index > -1) {
            users.splice(index, 1);
          }
          users.splice(1, 0, $scope.primary);
        }
        return users;
      }
      buildAvatar();
      $scope.loadFullProfile = function() {
        if ($scope.primary && !$scope.primary.sys_id && !avatarProfilePersister.getAvatar($scope.primary.userID)) {
          $http.get('/api/now/live/profiles/' + $scope.primary.userID).then(
            function(response) {
              try {
                angular.extend($scope.primary, response.data.result);
                avatarProfilePersister.setAvatar($scope.primary.userID, $scope.primary);
              } catch (e) {}
            });
        }
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatar.js */
angular.module('sn.common.avatar').directive('snAvatar', function($http, $compile, getTemplateUrl, snCustomEvent, snConnectService) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_avatar.xml'),
    replace: true,
    transclude: true,
    scope: {
      members: '=',
      primary: '=',
      showPresence: '=?',
      enableContextMenu: '=?',
      enableTooltip: '=?',
      enableBindOnce: '@',
      displayMemberCount: "=?",
      groupAvatar: "@"
    },
    compile: function(tElement) {
      var template = tElement.html();
      return function(scope, element, attrs, controller, transcludeFn) {
        function recompile() {
          var newElement = $compile(template, transcludeFn)(scope);
          element.html(newElement);
          if (scope.enableTooltip) {
            element.tooltip({
              placement: 'auto top',
              container: 'body'
            }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
            if (element.hideFix)
              element.hideFix();
          }
        }
        if (attrs.enableBindOnce === 'false') {
          scope.$watch('primary', recompile);
          scope.$watch('members', recompile);
        }
        if (scope.enableTooltip) {
          var usersWatch = scope.$watch('users', function() {
            if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
              element.tooltip({
                placement: 'auto top',
                container: 'body'
              }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
              if (element.hideFix)
                element.hideFix();
              usersWatch();
            }
          });
        }
        if (scope.enableContextMenu !== false) {
          scope.contextOptions = [];
          var gUser = null;
          try {
            gUser = g_user;
          } catch (err) {}
          if (scope.users && scope.users.length === 1 && scope.users[0] && (scope.users[0].userID || scope.users[0].sys_id)) {
            scope.contextOptions = [
              ["Open user's profile", function() {
                if (scope.users && scope.users.length > 0) {
                  window.open('/nav_to.do?uri=' + encodeURIComponent('sys_user.do?sys_id=' + scope.users[0].userID), '_blank');
                }
              }]
            ];
            if ((gUser && scope.users[0].userID && scope.users[0].userID !== gUser.userID) ||
              (scope.liveProfileID && scope.users[0] && scope.users[0].sysID !== scope.liveProfileID)) {
              scope.contextOptions.push(["Open a new chat", function() {
                snConnectService.openWithProfile(scope.users[0]);
              }]);
            }
          }
        } else {
          scope.contextOptions = [];
        }
      };
    },
    controller: function($scope, liveProfileID) {
      $scope.displayMemberCount = $scope.displayMemberCount || false;
      $scope.liveProfileID = liveProfileID;
      $scope.$watch('primary', function(newValue, oldValue) {
        if ($scope.primary && newValue !== oldValue) {
          buildAvatar();
          if ($scope.contextOptions.length > 0) {
            $scope.contextOptions = [
              ["Open user's profile", function() {
                if ($scope.users && $scope.users.length > 0) {
                  window.location.href = 'sys_user.do?sys_id=' + $scope.users[0].userID || $scope.users[0].userID;
                }
              }]
            ];
            var gUser = null;
            try {
              gUser = g_user;
            } catch (err) {}
            if ((!gUser && !liveProfileID) || ($scope.users && $scope.users.length === 1 && $scope.users[0])) {
              if ((gUser && $scope.users[0].userID && $scope.users[0].userID !== gUser.userID) ||
                ($scope.liveProfileID && $scope.users[0] && $scope.users[0].sysID !== $scope.liveProfileID)) {
                $scope.contextOptions.push(["Open a new chat", function() {
                  snConnectService.openWithProfile($scope.users[0]);
                }]);
              }
            }
          }
        }
      });
      $scope.$watch('members', function() {
        if ($scope.members)
          buildAvatar();
      });
      $scope.avatarType = function() {
        var result = [];
        if ($scope.groupAvatar || !$scope.users)
          return result;
        if ($scope.users.length > 1)
          result.push("group");
        if ($scope.users.length === 2)
          result.push("avatar-duo");
        if ($scope.users.length === 3)
          result.push("avatar-trio");
        if ($scope.users.length >= 4)
          result.push("avatar-quad");
        return result;
      };
      $scope.getBackgroundStyle = function(user) {
        var avatar = (user ? user.avatar : '');
        if ($scope.groupAvatar)
          avatar = $scope.groupAvatar;
        if (avatar && avatar !== '')
          return {
            'background-image': 'url(' + avatar + ')'
          };
        if (user && user.name)
          return '';
        return void(0);
      };
      $scope.maxStringWidth = function() {
        var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
        return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
      };

      function buildInitials(name) {
        if (!name)
          return "--";
        var initials = name.split(" ").map(function(word) {
          return word.toUpperCase();
        }).filter(function(word) {
          return word.match(/^[A-Z]/);
        }).map(function(word) {
          return word.substring(0, 1);
        }).join("");
        return (initials.length > 3) ?
          initials.substr(0, 3) :
          initials;
      }
      $scope.avatartooltip = function() {
        if (!$scope.enableTooltip) {
          return '';
        }
        if (!$scope.users) {
          return '';
        }
        var names = [];
        $scope.users.forEach(function(user) {
          if (!user) {
            return;
          }
          names.push(user.name);
        });
        return names.join(', ');
      };

      function buildAvatar() {
        if (typeof $scope.primary === 'string') {
          $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
            $scope.users = [{
              userID: $scope.primary,
              name: response.data.result.name,
              initials: buildInitials(response.data.result.name),
              avatar: response.data.result.avatar
            }];
            $scope.presenceEnabled = $scope.showPresence && !$scope.isDocument && $scope.users.length === 1;
          });
          return;
        }
        if ($scope.primary) {
          if ($scope.primary.userImage)
            $scope.primary.avatar = $scope.primary.userImage;
          if (!$scope.primary.userID && $scope.primary.sys_id)
            $scope.primary.userID = $scope.primary.sys_id;
        }
        $scope.isDocument = $scope.primary && $scope.primary.table && $scope.primary.table !== "sys_user" && $scope.primary.table !== "chat_queue_entry";
        $scope.users = [$scope.primary];
        if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
          $scope.users = [$scope.primary];
        } else if ($scope.members && $scope.members.length > 0) {
          $scope.users = buildCompositeAvatar($scope.members);
        }
        $scope.presenceEnabled = $scope.showPresence && !$scope.isDocument && $scope.users.length === 1;
      }

      function buildCompositeAvatar(members) {
        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
        var users = angular.isArray(members) ? members.slice() : [members];
        users = users.sort(function(a, b) {
          var aID = a.userID || a.document;
          var bID = b.userID || b.document;
          if (a.table === "chat_queue_entry")
            return 1;
          if (aID === currentUser)
            return 1;
          else if (bID === currentUser)
            return -1;
          return 0;
        });
        if (users.length === 2)
          users = [users[0]];
        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
          var index = -1;
          angular.forEach(users, function(user, i) {
            if (user.sys_id === $scope.primary.sys_id) {
              index = i;
            }
          });
          if (index > -1) {
            users.splice(index, 1);
          }
          users.splice(1, 0, $scope.primary);
        }
        return users;
      }
      buildAvatar();
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/service.avatarProfilePersister.js */
angular.module('sn.common.avatar').service('avatarProfilePersister', function() {
  "use strict";
  var avatars = {};

  function setAvatar(id, payload) {
    avatars[id] = payload;
  }

  function getAvatar(id) {
    return avatars[id];
  }
  return {
    setAvatar: setAvatar,
    getAvatar: getAvatar
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snUserAvatar.js */
angular.module('sn.common.avatar').directive('snUserAvatar', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_user_avatar.xml'),
    replace: true,
    scope: {
      profile: '=?',
      userId: '=?',
      avatarUrl: '=?',
      initials: '=?',
      enablePresence: '@',
      disablePopover: '=?',
      directConversationButton: '=?'
    },
    link: function(scope, element) {
      scope.evaluatedProfile = undefined;
      scope.backgroundStyle = undefined;
      scope.enablePresence = scope.enablePresence !== 'false';
      if (scope.profile) {
        scope.evaluatedProfile = scope.profile;
        scope.userId = scope.profile.userID || "";
        scope.avatarUrl = scope.profile.avatar || "";
        scope.initials = scope.profile.initials || "";
        scope.backgroundStyle = scope.getBackgroundStyle();
      } else if (scope.userId || scope.avatarUrl || scope.initials) {
        scope.evaluatedProfile = scope.profile = {
          'userID': scope.userId || "",
          'avatar': scope.avatarUrl || "",
          'initials': scope.initials || ""
        }
        scope.backgroundStyle = scope.getBackgroundStyle();
      } else {
        var unwatch = scope.$watch('profile', function(newVal) {
          if (newVal) {
            scope.evaluatedProfile = newVal;
            scope.backgroundStyle = scope.getBackgroundStyle();
            unwatch();
          }
        })
      }
      scope.directConversationButton = scope.directConversationButton !== 'false' && scope.directConversationButton !== false;
      scope.template = '<sn-user-profile profile="evaluatedProfile" show-direct-message-prompt="::directConversationButton" class="avatar-popover avatar-popover-padding"></sn-user-profile>';
    },
    controller: function($scope) {
      $scope.getBackgroundStyle = function() {
        if (($scope.avatarUrl && $scope.avatarUrl !== '') || $scope.evaluatedProfile && $scope.evaluatedProfile.avatar !== '')
          return {
            "background-image": 'url(' + ($scope.avatarUrl || $scope.evaluatedProfile.avatar) + ')'
          };
        return {
          "background-image": ""
        };
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/controls/js_includes_controls.js */
/*! RESOURCE: /scripts/sn/common/controls/_module.js */
angular.module('sn.common.controls', []);;
/*! RESOURCE: /scripts/sn/common/controls/directive.snChoiceList.js */
angular.module('sn.common.controls').directive('snChoiceList', function($timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      snModel: "=",
      snTextField: "@",
      snValueField: "@",
      snOptions: "=?",
      snItems: "=?",
      snOnChange: "&",
      snDisabled: "=",
      snDialogName: "=",
    },
    template: '<select ng-disabled="snDisabled" ng-model="model" ng-options="item[snValueField] as item[snTextField] for item in snItems"><option value="" ng-show="snOptions.placeholder">{{snOptions.placeholder}}</option></select>',
    link: function(scope, element, attrs) {
      if (scope.snDialogName)
        scope.$on("dialog." + scope.snDialogName + ".close", function() {
          $timeout(function() {
            $(element).select2("destroy");
          })
        });
      $(element).css("opacity", 0);
      var config = {
        width: "100%"
      };
      if (scope.snOptions) {
        if (scope.snOptions.placeholder) {
          config.placeholderOption = "first";
        }
        if (scope.snOptions.hideSearch && scope.snOptions.hideSearch === true) {
          config.minimumResultsForSearch = -1;
        }
      }

      function init() {
        scope.model = scope.snModel;
        render();
      }

      function render() {
        if (!attrs) {
          $timeout(function() {
            render();
          });
          return;
        }
        $timeout(function() {
          $(element).css("opacity", 1);
          $(element).select2("destroy");
          $(element).select2(config);
        });
      }
      init();
      scope.$watch("snItems", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          init();
        }
      }, true);
      scope.$watch("snModel", function(newValue) {
        if (newValue !== undefined && newValue !== scope.model) {
          init();
        }
      });
      scope.$watch("model", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          scope.snModel = newValue;
          if (scope.snOnChange)
            scope.snOnChange({
              selectedValue: newValue
            });
        }
      });
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snReferencePicker.js */
angular.module('sn.common.controls').directive('snReferencePicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      ed: "=?",
      field: "=",
      refTable: "=?",
      refId: "=?",
      snOptions: "=?",
      snOnChange: "&",
      snOnBlur: "&",
      snOnClose: "&",
      snOnOpen: '&',
      minimumInputLength: "@",
      snDisabled: "=",
      snPageSize: "@",
      dropdownCssClass: "@",
      formatResultCssClass: "&",
      overlay: "=",
      additionalDisplayColumns: "@",
      displayColumn: "@",
      recordValues: '&',
      getGlideForm: '&glideForm',
      domain: "@",
      snSelectWidth: '@',
    },
    template: '<input type="text" name="{{field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" ng-model="field.displayValue" />',
    link: function(scope, element, attrs, ctrl) {
      scope.ed = scope.ed || scope.field.ed;
      scope.selectWidth = scope.snSelectWidth || '100%';
      element.css("opacity", 0);
      var fireReadyEvent = true;
      var g_form;
      if (angular.isDefined(scope.getGlideForm))
        g_form = scope.getGlideForm();
      var fieldAttributes = {};
      if (angular.isDefined(scope.field) && angular.isDefined(scope.field.attributes) && typeof scope.ed.attributes == 'undefined')
        if (Array.isArray(scope.field.attributes))
          fieldAttributes = scope.field.attributes;
        else
          fieldAttributes = parseAttributes(scope.field.attributes);
      else
        fieldAttributes = parseAttributes(scope.ed.attributes);
      if (!angular.isDefined(scope.additionalDisplayColumns) && angular.isDefined(fieldAttributes['ref_ac_columns']))
        scope.additionalDisplayColumns = fieldAttributes['ref_ac_columns'];
      var select2AjaxHelpers = {
        formatSelection: function(item) {
          return $sanitize(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayValues = getDisplayValues(item);
          if (displayValues.length == 1)
            return $sanitize(displayValues[0]);
          if (displayValues.length > 1) {
            var width = 100 / displayValues.length;
            var markup = "";
            for (var i = 0; i < displayValues.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-result-cell'>" + $sanitize(displayValues[i]) + "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          if ('sysparm_include_variables' in queryParams.data) {
            var url = urlTools.getURL('ref_list_data', queryParams.data);
            return $http.get(url).then(queryParams.success);
          } else {
            var url = urlTools.getURL('ref_list_data');
            return $http.post(url, queryParams.data).then(queryParams.success);
          }
        },
        initSelection: function(elem, callback) {
          if (scope.field.displayValue)
            callback({
              sys_id: scope.field.value,
              name: scope.field.displayValue
            });
        }
      };
      var config = {
        width: scope.selectWidth,
        minimumInputLength: scope.minimumInputLength ? parseInt(scope.minimumInputLength, 10) : 0,
        overlay: scope.overlay,
        containerCssClass: 'select2-reference ng-form-element',
        placeholder: '   ',
        formatSearching: '',
        allowClear: attrs.allowClear !== 'false',
        id: function(item) {
          return item.sys_id;
        },
        sortResults: (scope.snOptions && scope.snOptions.sortResults) ? scope.snOptions.sortResults : undefined,
        ajax: {
          quietMillis: NOW.ac_wait_time,
          data: function(filterText, page) {
            var filterExpression = filterExpressionParser.parse(filterText, scope.ed.defaultOperator);
            var colToSearch = getReferenceColumnToSearch();
            var q = colToSearch + filterExpression.operator + filterExpression.filterText +
              '^' + colToSearch + 'ISNOTEMPTY' + getExcludedValues() + "^EQ";
            var params = {
              start: (scope.pageSize * (page - 1)),
              count: scope.pageSize,
              sysparm_target_table: scope.refTable,
              sysparm_target_sys_id: scope.refId,
              sysparm_target_field: scope.ed.dependent_field || scope.ed.name,
              table: scope.ed.reference,
              qualifier: scope.ed.qualifier,
              data_adapter: scope.ed.data_adapter,
              attributes: scope.ed.attributes,
              dependent_field: scope.ed.dependent_field,
              dependent_table: scope.ed.dependent_table,
              dependent_value: scope.ed.dependent_value,
              p: scope.ed.reference + ';q:' + q + ';r:' + scope.ed.qualifier
            };
            if (scope.domain) {
              params.sysparm_domain = scope.domain;
            }
            if (angular.isDefined(scope.field) && scope.field['_cat_variable'] === true) {
              delete params['sysparm_target_table'];
              params['sysparm_include_variables'] = true;
              params['variable_ids'] = scope.field.sys_id;
              var getFieldSequence = g_form.$private.options('getFieldSequence');
              if (getFieldSequence) {
                params['variable_sequence1'] = getFieldSequence();
              }
              var itemSysId = g_form.$private.options('itemSysId');
              params['sysparm_id'] = itemSysId;
              var getFieldParams = g_form.$private.options('getFieldParams');
              if (getFieldParams) {
                angular.extend(params, getFieldParams());
              }
            }
            if (scope.recordValues)
              params.sysparm_record_values = scope.recordValues();
            return params;
          },
          results: function(data, page) {
            return ctrl.filterResults(data, page, scope.pageSize);
          },
          transport: select2AjaxHelpers.search
        },
        formatSelection: select2AjaxHelpers.formatSelection,
        formatResult: select2AjaxHelpers.formatResult,
        initSelection: select2AjaxHelpers.initSelection,
        dropdownCssClass: attrs.dropdownCssClass,
        formatResultCssClass: scope.formatResultCssClass || null
      };
      if (scope.snOptions) {
        if (scope.snOptions.placeholder) {
          config.placeholder = scope.snOptions.placeholder;
        }
        if (scope.snOptions.width) {
          config.width = scope.snOptions.width;
        }
      }

      function getReferenceColumnToSearch() {
        var colName = 'name';
        if (scope.ed.searchField)
          colName = scope.ed.searchField;
        else if (fieldAttributes['ref_ac_columns_search'] == 'true' && 'ref_ac_columns' in fieldAttributes && fieldAttributes['ref_ac_columns'] != '') {
          var refAcColumns = fieldAttributes['ref_ac_columns'].split(';');
          colName = refAcColumns[0];
        } else if (fieldAttributes['ref_ac_order_by'])
          colName = fieldAttributes['ref_ac_order_by'];
        return colName;
      }

      function getExcludedValues() {
        if (scope.ed.excludeValues && scope.ed.excludeValues != '') {
          return '^sys_idNOT IN' + scope.ed.excludeValues;
        }
        return '';
      }

      function parseAttributes(strAttributes) {
        var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
        var attributeObj = {};
        for (var i = 0; i < attributeArray.length; i++) {
          if (attributeArray[i].length > 0) {
            var attribute = attributeArray[i].split('=');
            attributeObj[attribute[0]] = attribute.length > 1 ? attribute[1] : '';
          }
        }
        return attributeObj;
      }

      function init() {
        scope.model = scope.snModel;
        render();
      }

      function render() {
        $timeout(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          var select2 = element.select2(config);
          select2.bind("change", select2Change);
          select2.bind("select2-removed", select2Change);
          select2.bind("select2-blur", function() {
            scope.$apply(function() {
              scope.snOnBlur();
            });
          });
          select2.bind("select2-close", function() {
            scope.$apply(function() {
              scope.snOnClose();
            });
          });
          select2.bind("select2-open", function() {
            scope.$apply(function() {
              if (scope.snOnOpen)
                scope.snOnOpen();
            });
          });
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      }

      function select2Change(e) {
        e.stopImmediatePropagation();
        if (e.added) {
          if (scope.$$phase || scope.$root.$$phase)
            return;
          var selectedItem = e.added;
          var value = selectedItem.sys_id;
          var displayValue = value ? getDisplayValue(selectedItem) : '';
          if (scope.snOptions && scope.snOptions.useGlideForm === true) {
            g_form.setValue(scope.field.name, value, displayValue);
            scope.rowSelected();
          } else {
            scope.$apply(function() {
              scope.field.value = value;
              scope.field.displayValue = displayValue;
              scope.rowSelected();
            });
          }
          if (scope.snOnChange) {
            e.displayValue = displayValue;
            scope.snOnChange(e);
          }
        } else if (e.removed) {
          if (scope.snOptions && scope.snOptions.useGlideForm === true) {
            g_form.clearValue(scope.field.name);
            if (scope.snOnChange)
              scope.snOnChange(e);
          } else {
            scope.$apply(function() {
              scope.field.displayValue = '';
              scope.field.value = '';
              if (scope.snOnChange)
                scope.snOnChange(e);
            });
          }
        }
      }

      function getDisplayValue(selectedItem) {
        var displayValue = '';
        if (selectedItem && selectedItem.sys_id) {
          if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
            displayValue = selectedItem[scope.displayColumn];
          else if (selectedItem.$$displayValue)
            displayValue = selectedItem.$$displayValue;
          else if (selectedItem.name)
            displayValue = selectedItem.name;
          else if (selectedItem.title)
            displayValue = selectedItem.title;
        }
        return displayValue;
      }

      function getDisplayValues(selectedItem) {
        var displayValues = [];
        if (selectedItem && selectedItem.sys_id) {
          var current = "";
          if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
            current = selectedItem[scope.displayColumn];
          else if (selectedItem.$$displayValue)
            current = selectedItem.$$displayValue;
          else if (selectedItem.name)
            current = selectedItem.name;
          else if (selectedItem.title)
            current = selectedItem.title;
          displayValues.push(current);
        }
        if (scope.additionalDisplayColumns) {
          var columns = scope.additionalDisplayColumns.split(",");
          for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (selectedItem[column])
              displayValues.push(selectedItem[column]);
          }
        }
        return displayValues;
      }
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue != oldValue && newValue !== scope.model) {
          init();
        }
      });
      scope.$on("snReferencePicker.activate", function(evt, parms) {
        $timeout(function() {
          element.select2("open");
        })
      });
      init();
    },
    controller: function($scope, $rootScope) {
      $scope.pageSize = 20;
      if ($scope.snPageSize)
        $scope.pageSize = parseInt($scope.snPageSize);
      $scope.rowSelected = function() {
        $rootScope.$broadcast("@page.reference.selected", {
          field: $scope.field,
          ed: $scope.ed
        });
      };
      this.filterResults = function(data, page) {
        return {
          results: data.data.items,
          more: (page * $scope.pageSize < data.data.total)
        };
      };
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snRecordPicker.js */
angular.module('sn.common.controls').directive('snRecordPicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
  "use strict";
  var cache = {};

  function cleanLabel(val) {
    if (typeof val == "object")
      return "";
    return typeof val == "string" ? val.trim() : val;
  }
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: '=',
      table: '=',
      defaultQuery: '=?',
      searchFields: '=?',
      valueField: '=?',
      displayField: '=?',
      displayFields: '=?',
      pageSize: '=?',
      onChange: '&',
      snDisabled: '=',
      multiple: '=?',
      options: '=?',
      placeholder: '@'
    },
    template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{field.name}}" ng-model="field.value" />',
    controller: function($scope) {
      if (!angular.isNumber($scope.pageSize))
        $scope.pageSize = 20;
      if (!angular.isDefined($scope.valueField))
        $scope.valueField = 'sys_id';
      this.filterResults = function(data, page) {
        return {
          results: data.data.result,
          more: (page * $scope.pageSize < parseInt(data.headers('x-total-count'), 10))
        };
      };
    },
    link: function(scope, element, attrs, ctrl) {
      var isExecuting = false;
      var select2Helpers = {
        formatSelection: function(item) {
          return $sanitize(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayFields = getdisplayFields(item);
          if (displayFields.length == 1)
            return $sanitize(cleanLabel(displayFields[0]));
          if (displayFields.length > 1) {
            var markup = $sanitize(displayFields[0]);
            var width = 100 / (displayFields.length - 1);
            markup += "<div>";
            for (var i = 1; i < displayFields.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-additional-display-field'>" + $sanitize(cleanLabel(displayFields[i])) + "</div>";
            markup += "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          var url = '/api/now/table/' + scope.table + '?' + urlTools.encodeURIParameters(queryParams.data);
          if (scope.options && scope.options.cache && cache[url])
            return queryParams.success(cache[url]);
          return $http.get(url).then(function(response) {
            if (scope.options && scope.options.cache) {
              cache[url] = response;
            }
            return queryParams.success(response)
          });
        },
        initSelection: function(elem, callback) {
          if (scope.field.displayValue) {
            if (scope.multiple) {
              var items = [],
                sel;
              var values = scope.field.value.split(',');
              var displayValues = scope.field.displayValue.split(',');
              for (var i = 0; i < values.length; i++) {
                sel = {};
                sel[scope.valueField] = values[i];
                sel[scope.displayField] = displayValues[i];
                items.push(sel);
              }
              callback(items);
            } else {
              var sel = {};
              sel[scope.valueField] = scope.field.value;
              sel[scope.displayField] = scope.field.displayValue;
              callback(sel);
            }
          } else
            callback([]);
        }
      };
      var config = {
        width: '100%',
        containerCssClass: 'select2-reference ng-form-element',
        placeholder: scope.placeholder || '    ',
        formatSearching: '',
        allowClear: (scope.options && typeof scope.options.allowClear !== "undefined") ? scope.options.allowClear : true,
        id: function(item) {
          return item[scope.valueField];
        },
        ajax: {
          quietMillis: NOW.ac_wait_time,
          data: function(filterText, page) {
            var params = {
              sysparm_offset: (scope.pageSize * (page - 1)),
              sysparm_limit: scope.pageSize,
              sysparm_query: buildQuery(filterText, scope.searchFields, scope.defaultQuery)
            };
            return params;
          },
          results: function(data, page) {
            return ctrl.filterResults(data, page, scope.pageSize);
          },
          transport: select2Helpers.search
        },
        formatSelection: select2Helpers.formatSelection,
        formatResult: select2Helpers.formatResult,
        formatResultCssClass: function() {
          return '';
        },
        initSelection: select2Helpers.initSelection,
        multiple: scope.multiple
      };

      function buildQuery(filterText, searchFields, defaultQuery) {
        var queryParts = [];
        var operator = "CONTAINS";
        if (filterText.startsWith("*"))
          filterText = filterText.substring(1);
        if (defaultQuery)
          queryParts.push(defaultQuery);
        var filterExpression = filterExpressionParser.parse(filterText, operator);
        if (searchFields != null) {
          var fields = searchFields.split(',');
          if (filterExpression.filterText != '') {
            var OR = "";
            for (var i = 0; i < fields.length; i++) {
              queryParts.push(OR + fields[i] + filterExpression.operator + filterExpression.filterText);
              OR = "OR";
            }
          }
          for (var i = 0; i < fields.length; i++)
            queryParts.push('ORDERBY' + fields[i]);
          queryParts.push('EQ');
        }
        return queryParts.join('^');
      }
      scope.field = scope.field || {};
      var initTimeout = null;
      var value = scope.field.value;
      var oldValue = scope.field.value;
      var $select;

      function init() {
        element.css("opacity", 0);
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          $select = element.select2(config);
          $select.bind("change", onChanged);
          $select.bind("select2-removed", onChanged);
          $select.bind("select2-selecting", onSelecting);
          $select.bind("select2-removing", onRemoving);
          scope.$emit('select2.ready', element);
        });
      }

      function onSelecting(e) {
        isExecuting = true;
        oldValue = scope.field.value;
        var selectedItem = e.choice;
        if (scope.multiple && selectedItem[scope.valueField] != '') {
          var values = scope.field.value == '' ? [] : scope.field.value.split(',');
          var displayValues = scope.field.displayValue == '' ? [] : scope.field.displayValue.split(',');
          values.push(selectedItem[scope.valueField]);
          displayValues.push(getDisplayValue(selectedItem));
          scope.field.value = values.join(',');
          scope.field.displayValue = displayValues.join(',');
          e.preventDefault();
          $select.select2('val', values).select2('close');
          scope.$apply(function() {
            callChange(oldValue, e);
          });
        }
      }

      function onRemoving(e) {
        isExecuting = true;
        oldValue = scope.field.value;
        var removed = e.choice;
        if (scope.multiple) {
          var values = scope.field.value.split(',');
          var displayValues = scope.field.displayValue.split(',');
          for (var i = values.length - 1; i >= 0; i--) {
            if (removed[scope.valueField] == values[i]) {
              values.splice(i, 1);
              displayValues.splice(i, 1);
              break;
            }
          }
          scope.field.value = values.join(',');
          scope.field.displayValue = displayValues.join(',');
          e.preventDefault();
          $select.select2('val', scope.field.value.split(','));
          scope.$apply(function() {
            callChange(oldValue, e);
          });
        }
      }

      function callChange(oldValue, e) {
        var f = scope.field;
        var p = {
          field: f,
          newValue: f.value,
          oldValue: oldValue,
          displayValue: f.displayValue
        }
        scope.$emit("field.change", p);
        scope.$emit("field.change." + f.name, p);
        if (scope.onChange)
          try {
            scope.onChange(e);
          } catch (ex) {
            console.log("directive.snRecordPicker error in onChange")
            console.log(ex)
          }
        isExecuting = false;
      }

      function onChanged(e) {
        e.stopImmediatePropagation();
        if (scope.$$phase || scope.$root.$$phase) {
          console.warn('in digest, returning early');
          return;
        }
        if (e.added) {
          var selectedItem = e.added;
          if (!scope.multiple) {
            scope.field.value = selectedItem[scope.valueField];
            if (scope.field.value) {
              scope.field.displayValue = getDisplayValue(selectedItem);
            } else
              scope.field.displayValue = '';
          }
        } else if (e.removed) {
          if (!scope.multiple) {
            scope.field.displayValue = '';
            scope.field.value = '';
          }
        }
        scope.$apply(function() {
          callChange(oldValue, e);
        });
      }

      function getDisplayValue(selectedItem) {
        var displayValue = selectedItem[scope.valueField];
        if (selectedItem) {
          if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
            displayValue = selectedItem[scope.displayField];
          else if (selectedItem.name)
            displayValue = selectedItem.name;
          else if (selectedItem.title)
            displayValue = selectedItem.title;
        }
        return cleanLabel(displayValue);
      }

      function getdisplayFields(selectedItem) {
        var displayFields = [];
        if (selectedItem && selectedItem[scope.valueField]) {
          var current = "";
          if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
            current = selectedItem[scope.displayField];
          else if (selectedItem.name)
            current = selectedItem.name;
          else if (selectedItem.title)
            current = selectedItem.title;
          displayFields.push(current);
        }
        if (scope.displayFields) {
          var columns = scope.displayFields.split(",");
          for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (selectedItem[column])
              displayFields.push(selectedItem[column]);
          }
        }
        return displayFields;
      }
      scope.$watch("field.value", function(newValue) {
        if (isExecuting) return;
        if (angular.isDefined(newValue) && $select) {
          if (scope.multiple)
            $select.select2('val', newValue.split(',')).select2('close');
          else
            $select.select2('val', newValue).select2('close');
        }
      });
      if (attrs.displayValue) {
        attrs.$observe('displayValue', function(value) {
          scope.field.value = value;
        });
      }
      init();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSelectBasic.js */
angular.module('sn.common.controls').directive('snSelectBasic', function($timeout) {
  return {
    restrict: 'C',
    priority: 1,
    require: '?ngModel',
    scope: {
      'snAllowClear': '@',
      'snSelectWidth': '@',
      'snChoices': '=?'
    },
    link: function(scope, element, attrs, ngModel) {
      if (angular.isFunction(element.select2)) {
        element.css("opacity", 0);
        scope.selectWidth = scope.snSelectWidth || '100%';
        scope.selectAllowClear = scope.snAllowClear === "true";
        $timeout(function() {
          element.css("opacity", 1);
          element.select2({
            allowClear: scope.selectAllowClear,
            width: scope.selectWidth
          });
          ngModel.$render = function() {
            element.select2('val', ngModel.$viewValue);
            element.val(ngModel.$viewValue);
          };
        });
        element.on('change', function() {
          scope.$evalAsync(setModelValue);
        });
        scope.$watch('snChoices', function(newValue, oldValue) {
          if (angular.isDefined(newValue) && newValue != oldValue) {
            $timeout(function() {
              setModelValue();
            });
          }
        }, true);

        function setModelValue() {
          ngModel.$setViewValue(element.val());
        };
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snTableReference.js */
angular.module('sn.common.controls').directive('snTableReference', function($timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: "=",
      snChange: "&",
      snDisabled: "="
    },
    template: '<select ng-disabled="snDisabled" style="min-width: 150px;" name="{{field.name}}" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.value as choice.label for choice in field.choices"></select>',
    controller: function($scope) {
      $scope.fieldValue = function(selected) {
        if (angular.isDefined(selected)) {
          $scope.snChange({
            newValue: selected
          });
        }
        return $scope.field.value;
      }
    },
    link: function(scope, element) {
      var initTimeout = null;
      var fireReadyEvent = true;
      element.css("opacity", 0);

      function render() {
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          element.css("opacity", 1);
          element.select2("destroy");
          element.select2();
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      }
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue !== undefined && newValue != oldValue) {
          render();
        }
      });
      render();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snFieldReference.js */
angular.module('sn.common.controls').directive('snFieldReference', function($timeout, $http, nowServer) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: "=",
      snChange: "&",
      snDisabled: "=",
      getGlideForm: '&glideForm'
    },
    template: '<select ng-disabled="snDisabled" name="{{field.name}}" style="min-width: 150px;" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.name as choice.label for choice in field.choices"></select>',
    controller: function($scope) {
      $scope.fieldValue = function(selected) {
        if (angular.isDefined(selected))
          $scope.snChange({
            newValue: selected
          });
        return $scope.field.value;
      }
      $scope.$watch('field.dependentValue', function(newVal, oldVal) {
        if (!angular.isDefined(newVal))
          return;
        var src = nowServer.getURL('table_fields', 'exclude_formatters=true&fd_table=' + newVal);
        $http.post(src).success(function(response) {
          $scope.field.choices = response;
          $scope.render();
        });
      });
    },
    link: function(scope, element) {
      var initTimeout = null;
      var fireReadyEvent = true;
      scope.render = function() {
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          element.select2("destroy");
          element.select2();
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      };
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue !== undefined && newValue != oldValue) {
          scope.render();
        }
      });
      scope.render();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSyncWith.js */
angular.module("sn.common.controls").directive('snSyncWith', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: false,
    link: function(scope, elem, attr) {
      scope.journalField = scope.$eval(attr.snSyncWith);
      scope.value = scope.$eval(attr.ngModel);
      if (attr.snSyncWithValueInFn)
        scope.$eval(attr.ngModel + "=" + attr.snSyncWithValueInFn, {
          text: scope.value
        });
      scope.$watch(function() {
        return scope.$eval(attr.snSyncWith);
      }, function(nv, ov) {
        if (nv !== ov)
          scope.journalField = nv;
      });
      scope.$watch(function() {
        return scope.$eval(attr.ngModel);
      }, function(nv, ov) {
        if (nv !== ov)
          scope.value = nv;
      });
      if (!window.g_form)
        return;
      scope.$watch('value', function(n, o) {
        if (n !== o)
          setFieldValue();
      });

      function setFieldValue() {
        setValue(scope.journalField, scope.value);
      }

      function setValue(field, value) {
        value = !!value ? value : '';
        var control = g_form.getControl(field);
        if (attr.snSyncWithValueOutFn)
          value = scope.$eval(attr.snSyncWithValueOutFn, {
            text: value
          })
        control.value = value;
        onChange(control.id);
      }
      scope.$watch('journalField', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (oldValue)
            setValue(oldValue, '');
          if (newValue)
            setFieldValue();
        }
      }, true);
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.contenteditable.js */
angular.module('sn.common.controls').directive('contenteditable', function($timeout, $sanitize) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      var changehandler = scope.changehandler;
      scope.usenewline = scope.usenewline + "" != "false";
      var newLine = "\n";
      var nodeBR = "BR";
      var nodeDIV = "DIV";
      var nodeText = "#text";
      var nbspRegExp = new RegExp(String.fromCharCode(160), "g");
      if (!scope.usenewline)
        elem.keypress(function(event) {
          if (event.which == "13") {
            if (scope.entercallback)
              scope.entercallback(elem);
            event.preventDefault();
          }
        });

      function processNodes(nodes) {
        var val = "";
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          var follow = true;
          switch (node.nodeName) {
            case nodeText:
              val += node.nodeValue.replace(nbspRegExp, " ");
              break;
            case nodeDIV:
              val += newLine;
              if (node.childNodes.length == 1 && node.childNodes[0].nodeName == nodeBR)
                follow = false;
              break;
            case nodeBR:
              val += scope.usenewline ? newLine : "";
          }
          if (follow)
            val += processNodes(node.childNodes)
        }
        return val;
      }

      function readHtml() {
        var val = processNodes(elem[0].childNodes);
        ctrl.$setViewValue(val);
      }

      function writeHtml() {
        var val = ctrl.$viewValue;
        if (!val || val === null)
          val = "";
        val = val.replace(/\n/gi, scope.usenewline ? "<br/>" : "");
        val = val.replace(/  /gi, " &nbsp;");
        try {
          if (attrs.contenteditableEscapeHtml == "true")
            val = $sanitize(val);
        } catch (err) {
          var replacement = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
          };
          val = val.replace(/[&<>"'\/]/g, function(pattern) {
            return replacement[pattern]
          });
        };
        elem.html(val);
      }

      function processPlaceholder() {
        if (elem[0].dataset) {
          if (elem[0].textContent)
            elem[0].dataset.divPlaceholderContent = 'true';
          else if (elem[0].dataset.divPlaceholderContent)
            delete(elem[0].dataset.divPlaceholderContent);
        }
      }
      elem.bind('keyup', function() {
        scope.$apply(function() {
          readHtml();
          processPlaceholder();
        });
      });

      function selectText(elem) {
        var range;
        var selection;
        if (document.body.createTextRange) {
          range = document.body.createTextRange();
          range.moveToElementText(elem);
          range.select();
        } else if (window.getSelection) {
          selection = window.getSelection();
          range = document.createRange();
          range.selectNodeContents(elem);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      elem.bind('focus', function() {
        if (scope[attrs.tracker] && scope[attrs.tracker]['isDefault_' + attrs.trackeratt])
          $timeout(function() {
            selectText(elem[0]);
          });
        elem.original = ctrl.$viewValue;
      });
      elem.bind('blur', function() {
        scope.$apply(function() {
          readHtml();
          processPlaceholder();
          if (elem.original != ctrl.$viewValue && changehandler) {
            if (scope[attrs.tracker] && typeof scope[attrs.tracker]['isDefault_' + attrs.trackeratt] != "undefined")
              scope[attrs.tracker]['isDefault_' + attrs.trackeratt] = false;
            changehandler(scope[attrs.tracker], attrs.trackeratt);
          }
        });
      });
      elem.bind('paste', function() {
        scope.$apply(function() {
          setTimeout(function() {
            readHtml();
            writeHtml();
          }, 0);
          return false;
        });
      });
      ctrl.$render = function() {
        writeHtml();
      };
      scope.$watch('field.readonly', function() {
        elem[0].contentEditable = !scope.$eval('field.readonly');
      });
      scope.$watch(
        function() {
          return {
            val: elem[0].textContent
          };
        },
        function(newValue, oldValue) {
          if (newValue.val != oldValue.val)
            processPlaceholder();
        },
        true);
      writeHtml();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snGlyph.js */
angular.module("sn.common.controls").directive("snGlyph", function() {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      char: "@",
    },
    template: '<span class="glyphicon glyphicon-{{char}}" />',
    link: function(scope) {}
  }
});
angular.module("sn.common.controls").directive('fa', function() {
    return {
      restrict: 'E',
      template: '<span class="fa" aria-hidden="true"></span>',
      replace: true,
      link: function(scope, element, attrs) {
        'use strict';
        var currentClasses = {};

        function _observeStringAttr(attr, baseClass) {
          var className;
          attrs.$observe(attr, function() {
            baseClass = baseClass || 'fa-' + attr;
            element.removeClass(currentClasses[attr]);
            if (attrs[attr]) {
              className = [baseClass, attrs[attr]].join('-');
              element.addClass(className);
              currentClasses[attr] = className;
            }
          });
        }
        _observeStringAttr('name', 'fa');
        _observeStringAttr('rotate');
        _observeStringAttr('flip');
        _observeStringAttr('stack');
        attrs.$observe('size', function() {
          var className;
          element.removeClass(currentClasses.size);
          if (attrs.size === 'large') {
            className = 'fa-lg';
          } else if (!isNaN(parseInt(attrs.size, 10))) {
            className = 'fa-' + attrs.size + 'x';
          }
          element.addClass(className);
          currentClasses.size = className;
        });
        attrs.$observe('stack', function() {
          var className;
          element.removeClass(currentClasses.stack);
          if (attrs.stack === 'large') {
            className = 'fa-stack-lg';
          } else if (!isNaN(parseInt(attrs.stack, 10))) {
            className = 'fa-stack-' + attrs.stack + 'x';
          }
          element.addClass(className);
          currentClasses.stack = className;
        });

        function _observeBooleanAttr(attr, className) {
          var value;
          attrs.$observe(attr, function() {
            className = className || 'fa-' + attr;
            value = attr in attrs && attrs[attr] !== 'false' && attrs[attr] !== false;
            element.toggleClass(className, value);
          });
        }
        _observeBooleanAttr('border');
        _observeBooleanAttr('fw');
        _observeBooleanAttr('inverse');
        _observeBooleanAttr('spin');
        element.toggleClass('fa-li',
          element.parent() &&
          element.parent().prop('tagName') === 'LI' &&
          element.parent().parent() &&
          element.parent().parent().hasClass('fa-ul') &&
          element.parent().children()[0] === element[0] &&
          attrs.list !== 'false' &&
          attrs.list !== false
        );
        attrs.$observe('alt', function() {
          var altText = attrs.alt,
            altElem = element.next(),
            altElemClass = 'fa-alt-text';
          if (altText) {
            element.removeAttr('alt');
            if (!altElem || !altElem.hasClass(altElemClass)) {
              element.after('<span class="sr-only fa-alt-text"></span>');
              altElem = element.next();
            }
            altElem.text(altText);
          } else if (altElem && altElem.hasClass(altElemClass)) {
            altElem.remove();
          }
        });
      }
    };
  })
  .directive('faStack', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<span ng-transclude class="fa-stack fa-lg"></span>',
      replace: true,
      link: function(scope, element, attrs) {
        var currentClasses = {};

        function _observeStringAttr(attr, baseClass) {
          var className;
          attrs.$observe(attr, function() {
            baseClass = baseClass || 'fa-' + attr;
            element.removeClass(currentClasses[attr]);
            if (attrs[attr]) {
              className = [baseClass, attrs[attr]].join('-');
              element.addClass(className);
              currentClasses[attr] = className;
            }
          });
        }
        _observeStringAttr('size');
        attrs.$observe('size', function() {
          var className;
          element.removeClass(currentClasses.size);
          if (attrs.size === 'large') {
            className = 'fa-lg';
          } else if (!isNaN(parseInt(attrs.size, 10))) {
            className = 'fa-' + attrs.size + 'x';
          }
          element.addClass(className);
          currentClasses.size = className;
        });
      }
    };
  });;
/*! RESOURCE: /scripts/sn/common/controls/directive.snImageUploader.js */
angular.module('sn.common.controls').directive('snImageUploader', function($window, $rootScope, $timeout, getTemplateUrl, i18n, snAttachmentHandler) {
  var DRAG_IMAGE_SELECT = i18n.getMessage('Drag image or click to select');
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('directive.snImageUploader'),
    transclude: true,
    scope: {
      readOnly: '@',
      tableName: '@',
      sysId: '@',
      fieldName: '@',
      onUpload: '&',
      onDelete: '&',
      uploadMessage: '@',
      src: '='
    },
    controller: function($scope) {
      $scope.uploading = false;
      $scope.getTitle = function() {
        if ($scope.readOnly !== 'true')
          return DRAG_IMAGE_SELECT;
        return '';
      }
    },
    link: function(scope, element) {
      function isValidImage(file) {
        if (file.type.indexOf('image') != 0) {
          $alert(i18n.getMessage('Please select an image'));
          return false;
        }
        if (file.type.indexOf('tiff') > 0) {
          $alert(i18n.getMessage('Please select a common image format such as gif, jpeg or png'));
          return false;
        }
        return true;
      }

      function $alert(message) {
        alert(message);
      }
      scope.onFileSelect = function($files) {
        if (scope.readOnly === 'true')
          return;
        if ($files.length == 0)
          return;
        var file = $files[0];
        if (!isValidImage(file))
          return;
        var uploadParams = {
          sysparm_fieldname: scope.fieldName
        };
        scope.uploading = true;
        snAttachmentHandler.create(scope.tableName, scope.sysId).uploadAttachment(file, uploadParams).then(function(response) {
          $timeout(function() {
            scope.uploading = false;
          });
          if (scope.onUpload)
            scope.onUpload({
              thumbnail: response.thumbnail
            });
          $rootScope.$broadcast("snImageUploader:complete", scope.sysId, response);
        });
      }
      scope.openFileSelector = function($event) {
        $event.stopPropagation();
        var input = element.find('input[type=file]');
        input.click();
      }
      scope.activateUpload = function($event) {
        if (scope.readOnly !== 'true')
          scope.openFileSelector($event);
        else
          scope.showUpload = !scope.showUpload;
      }
      scope.deleteAttachment = function() {
        var sys_id = scope.src.split(".")[0];
        snAttachmentHandler.deleteAttachment(sys_id).then(function() {
          scope.src = null;
          if (scope.onDelete)
            scope.onDelete();
          $rootScope.$broadcast("snImageUploader:delete", scope.sysId, sys_id);
        });
      }
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/i18n/js_includes_i18n.js */
/*! RESOURCE: /scripts/sn/common/i18n/_module.js */
angular.module('sn.common.i18n', ['sn.common.glide']);
angular.module('sn.i18n', ['sn.common.i18n']);;
/*! RESOURCE: /scripts/sn/common/i18n/directive.snBindI18n.js */
angular.module('sn.common.i18n').directive('snBindI18n', function(i18n, $sanitize) {
  return {
    restrict: 'A',
    link: function(scope, iElem, iAttrs) {
      i18n.getMessage(iAttrs.snBindI18n, function(translatedValue) {
        var sanitizedValue = $sanitize(translatedValue);
        iElem.append(sanitizedValue);
      });
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/i18n/directive.message.js */
angular.module('sn.common.i18n').directive('nowMessage', function(i18n) {
  return {
    restrict: 'E',
    priority: 0,
    template: '',
    replace: true,
    compile: function(element, attrs, transclude) {
      var value = element.attr('value');
      if (!attrs.key || !value)
        return;
      i18n.loadMessage(attrs.key, value);
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/i18n/service.i18n.js */
angular.module('sn.common.i18n').provider('i18n', function() {
  var messageMap = {};

  function loadMessage(msgKey, msgValue) {
    messageMap[msgKey] = msgValue;
  }
  this.preloadMessages = function(messages) {
    angular.forEach(messages, function(key, val) {
      loadMessage(key, val);
    });
  };

  function interpolate(param) {
    return this.replace(/{([^{}]*)}/g,
      function(a, b) {
        var r = param[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      }
    );
  }
  if (!String.prototype.withValues)
    String.prototype.withValues = interpolate;
  this.$get = function(nowServer, $http, $window, $log) {
    var isDebug = $window.NOW ? $window.NOW.i18n_debug : true;

    function debug(msg) {
      if (!isDebug)
        return;
      $log.log('i18n: ' + msg);
    }

    function getMessageFromServer(msgKey, callback) {
      getMessagesFromServer([msgKey], function() {
        if (callback)
          callback(messageMap[msgKey]);
      });
    }

    function getMessagesFromServer(msgArray, callback, msgArrayFull) {
      var url = nowServer.getURL('message');
      $http.post(url, {
        messages: msgArray
      }).success(function(response) {
        var messages = response.messages;
        for (var i in messages) {
          loadMessage(i, messages[i]);
        }
        var returnMessages = {},
          allMessages = msgArrayFull || msgArray;
        for (var j = 0; j < allMessages.length; j++) {
          var key = allMessages[j];
          returnMessages[key] = messageMap[key];
        }
        if (callback)
          callback(returnMessages);
      });
    }
    return {
      getMessage: function(msgKey, callback) {
        debug('getMessage: Checking for ' + msgKey);
        if (messageMap.hasOwnProperty(msgKey)) {
          var message = messageMap[msgKey];
          if (typeof(callback) == 'function')
            callback(message);
          debug('getMessage: Found: ' + msgKey + ', message: ' + message);
          return message;
        }
        debug('getMessage: Not found: ' + msgKey + ', querying server');
        getMessageFromServer(msgKey, callback);
        msgKey.withValues = interpolate;
        if (typeof(callback) != 'function')
          $log.warn('getMessage (key="' + msgKey + '"): synchronous use not supported in Mobile or Service Portal unless message is already cached');
        return msgKey;
      },
      format: function(message) {
        if (arguments.length == 1)
          return message;
        if (arguments.length == 2 && (typeof arguments[1] === 'object'))
          return interpolate.call(message, arguments[1]);
        return interpolate.call(message, [].slice.call(arguments, 1));
      },
      getMessages: function(msgArray, callback) {
        debug('getMessages: Checking for ' + msgArray.join(','));
        var results = {},
          needMessage = [],
          needServerRequest = false;
        for (var i = 0; i < msgArray.length; i++) {
          var key = msgArray[i];
          if (!messageMap.hasOwnProperty(key)) {
            debug('getMessages: Did not find ' + key);
            needMessage.push(key);
            needServerRequest = true;
            results[key] = key;
            continue;
          }
          results[key] = messageMap[key];
          debug('getMessages: Found ' + key + ', message: ' + results[key]);
        }
        if (needServerRequest) {
          debug('getMessages: Querying server for ' + needMessage.join(','));
          getMessagesFromServer(needMessage, callback, msgArray);
        } else if (typeof(callback) == 'function') {
          debug('getMessages: Found all messages');
          callback(results);
        }
        return results;
      },
      clearMessages: function() {
        debug('clearMessages: clearing messages');
        messageMap = {};
      },
      loadMessage: function(msgKey, msgValue) {
        loadMessage(msgKey, msgValue);
        debug('loadMessage: loaded key: ' + msgKey + ', value: ' + msgValue);
      },
      preloadMessages: function() {
        var that = this
        angular.element('now-message').each(function() {
          var elem = angular.element(this);
          that.loadMessage(elem.attr('key'), elem.attr('value'));
        })
      }
    };
  };
});;;
/*! RESOURCE: /scripts/sn/common/link/js_includes_link.js */
/*! RESOURCE: /scripts/sn/common/link/_module.js */
angular.module("sn.common.link", []);;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContent.js */
angular.module('sn.common.link').directive('snLinkContent', function($compile, linkContentTypes) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    template: "<span />",
    scope: {
      link: "="
    },
    link: function(scope, elem) {
      scope.isShowing = function() {
        return (scope.link.isActive || scope.link.isUnauthorized) && !scope.link.isPending;
      };
      var linkDirective = linkContentTypes.forType(scope.link);
      elem.attr(linkDirective, "");
      elem.attr('ng-if', 'isShowing()');
      $compile(elem)(scope);
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentYoutube.js */
angular.module('sn.common.link').directive('snLinkContentYoutube', function(getTemplateUrl, $sce, inFrameSet) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentYoutube.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {
      $scope.playerActive = false;
      $scope.width = (inFrameSet) ? '248px' : '500px';
      $scope.height = (inFrameSet) ? '139px' : '281px';
      $scope.showPlayer = function() {
        $scope.playerActive = true;
      };
      $scope.getVideoEmbedLink = function() {
        if ($scope.link.embedLink) {
          var videoLink = $scope.link.embedLink + "?autoplay=1";
          return $sce.trustAsHtml("<iframe width='" + $scope.width + "' height='" + $scope.height + "' autoplay='1' frameborder='0' allowfullscreen='' src='" + videoLink + "'></iframe>");
        }
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentSoundcloud.js */
angular.module('sn.common.link').directive('snLinkContentSoundcloud', function(getTemplateUrl, $sce, inFrameSet) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentSoundcloud.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {
      $scope.playerActive = false;
      $scope.width = (inFrameSet) ? '248px' : '500px';
      $scope.height = (inFrameSet) ? '139px' : '281px';
      $scope.showPlayer = function() {
        $scope.playerActive = true;
      };
      $scope.getVideoEmbedLink = function() {
        if ($scope.link.embedLink) {
          var videoLink = $scope.link.embedLink + "&amp;auto_play=true";
          var width = (inFrameSet) ? 248 : 500;
          return $sce.trustAsHtml("<iframe width='" + $scope.width + "' height='" + $scope.height + "' autoplay='1' frameborder='0' allowfullscreen='' src='" + videoLink + "'></iframe>");
        }
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentArticle.js */
angular.module('sn.common.link').directive('snLinkContentArticle', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentArticle.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {
      $scope.backgroundImageStyle = $scope.link.imageLink ?
        {
          "background-image": 'url(' + $scope.link.imageLink + ')'
        } :
        {};
      $scope.isVisible = function() {
        var link = $scope.link;
        return !!link.shortDescription || !!link.imageLink;
      };
      $scope.hasDescription = function() {
        var link = $scope.link;
        return link.shortDescription && (link.shortDescription !== link.title);
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentError.js */
angular.module('sn.common.link').directive('snLinkContentError', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentError.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentImage.js */
angular.module('sn.common.link').directive('snLinkContentImage', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentImage.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentAttachment.js */
angular.module('sn.common.link').directive('snLinkContentAttachment', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentAttachment.xml'),
    scope: {
      attachment: '=',
      link: '='
    },
    controller: function($scope, $element, snCustomEvent) {
      $scope.attachment = $scope.attachment || $scope.link.attachment;
      $scope.calcImageSize = function() {
        var imageWidth = $scope.width;
        var imageHeight = $scope.height;
        var MAX_IMAGE_SIZE = $element.width() < 298 ? $element.width() : 298;
        if (imageHeight < 0 || imageWidth < 0)
          return "";
        if (imageHeight > imageWidth) {
          if (imageHeight >= MAX_IMAGE_SIZE) {
            imageWidth *= MAX_IMAGE_SIZE / imageHeight;
            imageHeight = MAX_IMAGE_SIZE;
          }
        } else {
          if (imageWidth >= MAX_IMAGE_SIZE) {
            imageHeight *= MAX_IMAGE_SIZE / imageWidth;
            imageWidth = MAX_IMAGE_SIZE
          }
        }
        return "height: " + imageHeight + "px; width: " + imageWidth + "px;";
      };
      $scope.aspectRatioClass = function() {
        return ($scope.height > $scope.width) ? 'limit-height' : 'limit-width';
      };
      $scope.showImage = function(event) {
        if (event.keyCode === 9)
          return;
        snCustomEvent.fire('sn.attachment.preview', event, $scope.attachment.rawData);
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentRecord.js */
angular.module('sn.common.link').directive('snLinkContentRecord', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentRecord.xml'),
    scope: {
      link: '='
    },
    controller: function($scope) {
      $scope.isTitleVisible = function() {
        return !$scope.isDescriptionVisible() && $scope.link.title;
      };
      $scope.isDescriptionVisible = function() {
        return $scope.link.shortDescription;
      };
      $scope.hasNoHeader = function() {
        return !$scope.isTitleVisible() && !$scope.isDescriptionVisible();
      };
      $scope.isUnassigned = function() {
        return $scope.link.isTask && !$scope.link.avatarID;
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/provider.linkContentTypes.js */
angular.module('sn.common.link').provider('linkContentTypes', function linkContentTypesProvider() {
  "use strict";
  var linkDirectiveMap = {
    'record': "sn-link-content-record",
    'attachment': "sn-link-content-attachment",
    'video': "sn-link-content-youtube",
    'music.song': "sn-link-content-soundcloud",
    'link': 'sn-link-content-article',
    'article': 'sn-link-content-article',
    'website': 'sn-link-content-article',
    'image': 'sn-link-content-image'
  };
  this.$get = function linkContentTypesFactory() {
    return {
      forType: function(link) {
        if (link.isUnauthorized)
          return "sn-link-content-error";
        return linkDirectiveMap[link.type] || "no-card";
      }
    }
  };
});;;
/*! RESOURCE: /scripts/sn/common/mention/js_includes_mention.js */
/*! RESOURCE: /scripts/sn/common/mention/_module.js */
angular.module("sn.common.mention", []);;
/*! RESOURCE: /scripts/sn/common/mention/directive.snMentionPopover.js */
angular.module('sn.common.mention').directive("snMentionPopover", function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snMentionPopover.xml'),
    link: function(scope, elem, $attrs) {
      elem.detach().appendTo(document.body);
      scope.dontPositionManually = scope.$eval($attrs.dontpositionmanually) || false;
      scope.onClick = function(event) {
        if (!angular.element(event.target).closest("#mention-popover").length ||
          angular.element(event.target).closest("#direct-message-popover-trigger").length) {
          scope.$evalAsync(function() {
            scope.$parent.showPopover = false;
            scope.$emit("snMentionPopover.showPopoverIsFalse");
            if (scope.dontPositionManually && !(scope.$eval($attrs.snavatarpopover))) {
              elem.remove();
            } else {
              scope.$broadcast("sn-avatar-popover-destroy");
            }
            angular.element('.popover').each(function() {
              var object = angular.element(this);
              if (object.popover) {
                object.popover('hide');
              }
            })
          });
        }
      };
      scope.clickListener = $timeout(function() {
        angular.element('html').on('click.mentionPopover', scope.onClick);
      }, 0, false);
      scope.$on('sn-bootstrap-popover.close-other-popovers', scope.onClick);

      function setPopoverPosition(clickX, clickY) {
        var topPosition;
        var leftPosition;
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        if (((clickY - (elem.height() / 2))) < 10)
          topPosition = 10;
        else
          topPosition = ((clickY + (elem.height() / 2)) > windowHeight) ? windowHeight - elem.height() - 15 : clickY - (elem.height() / 2);
        leftPosition = ((clickX + 20 + (elem.width())) > windowWidth) ? windowWidth - elem.width() - 15 : clickX + 20;
        elem.css("top", topPosition + "px").css("left", leftPosition + "px");
      }
      if (!scope.dontPositionManually) {
        $timeout(function() {
          var clickX = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageX) ? scope.$parent.clickEvent.pageX : clickX || 300;
          var clickY = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageY) ? scope.$parent.clickEvent.pageY : clickY || 300;
          setPopoverPosition(clickX, clickY);
          elem.velocity({
            opacity: 1
          }, {
            duration: 100,
            easing: "cubic"
          });
        });
      }
    },
    controller: function($scope, $element, $attrs) {
      $scope.profile = $scope.$eval($attrs.profile);
      $scope.$on("$destroy", function() {
        angular.element('html').off('click.mentionPopover', $scope.onClick);
        $element.remove();
      });
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/mention/service.snMention.js */
angular.module("sn.common.mention").factory("snMention", function(liveProfileID, $q, $http) {
  "use strict";
  var MENTION_PATH = "/api/now/form/mention/record";
  var USER_PATH = '/api/now/ui/user/';
  var avatarCache = {};

  function retrieveMembers(table, document, term) {
    if (!term || !document || !table) {
      var deferred = $q.defer();
      deferred.resolve([]);
      return deferred.promise;
    }
    return $http({
      url: MENTION_PATH + "/" + table + "/" + document,
      method: "GET",
      params: {
        term: term
      }
    }).then(function(response) {
      var members = response.data.result;
      var promises = [];
      angular.forEach(members, function(user) {
        if (avatarCache[user.sys_id]) {
          user.initials = avatarCache[user.sys_id].initials;
          user.avatar = avatarCache[user.sys_id].avatar;
        } else {
          var promise = $http.get(USER_PATH + user.sys_id).success(function(response) {
            user.initials = response.result.user_initials;
            user.avatar = response.result.user_avatar;
            avatarCache[user.sys_id] = {
              initials: user.initials,
              avatar: user.avatar
            };
          });
          promises.push(promise);
        }
      });
      return $q.all(promises).then(function() {
        return members;
      });
    })
  }
  return {
    retrieveMembers: retrieveMembers
  }
});;;
/*! RESOURCE: /scripts/sn/common/messaging/_module.js */
angular.module('sn.common.messaging', []);
angular.module('sn.messaging', ['sn.common.messaging']);;
/*! RESOURCE: /scripts/sn/common/messaging/service.snCustomEvent.js */
angular.module('sn.common.messaging').factory('snCustomEvent', function() {
  "use strict";
  if (typeof NOW.CustomEvent === 'undefined')
    throw "CustomEvent not found in NOW global";
  return NOW.CustomEvent;
});;
/*! RESOURCE: /scripts/sn/common/notification/js_includes_notification.js */
/*! RESOURCE: /scripts/sn/common/notification/_module.js */
angular.module('sn.common.notification', ['sn.common.util', 'ngSanitize']);;
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
angular.module('sn.common.notification').factory('snNotification', function($document, $templateCache, $compile, $rootScope,
  $timeout, $q, getTemplateUrl, $http) {
  'use strict';
  var openNotifications = [],
    timeouts = {},
    options = {
      top: 20,
      gap: 10,
      duration: 5000
    };
  return {
    show: function(type, message, duration, onClick) {
      return createNotificationElement(type, message).then(function(element) {
        displayNotification(element);
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
    return getTemplate().then(function(template) {
      thisScope = $rootScope.$new();
      thisScope.type = type;
      thisScope.message = message;
      thisElement = $compile(template)(thisScope);
      return angular.element(thisElement[0]);
    });
  }

  function displayNotification(element) {
    var body = $document.find('body'),
      id = 'elm' + Date.now(),
      pos;
    body.append(element);
    pos = options.top + openNotifications.length * getElementHeight(element);
    positionElement(element, pos);
    element.addClass('visible');
    element.attr('id', id);
    element.find('button').bind('click', function(e) {
      hideElement(element);
    });
    openNotifications.push(element);
    if (options.duration > 0)
      timeouts[id] = $timeout(function() {
        hideNext();
      }, options.duration);
  }

  function hide(element) {
    $timeout.cancel(timeouts[element.attr('id')]);
    element.removeClass('visible');
    element.addClass('hidden');
    element.find('button').eq(0).unbind();
    element.scope().$destroy();
    element.remove();
    repositionAll();
  }

  function hideElement(element) {
    var index = openNotifications.indexOf(element);
    openNotifications.splice(index, 1);
    hide(element);
  }

  function hideNext() {
    var element = openNotifications.shift();
    if (element)
      hide(element);
  }

  function getElementHeight(element) {
    return element[0].offsetHeight + options.gap;
  }

  function positionElement(element, pos) {
    element[0].style.top = pos + 'px';
  }

  function repositionAll() {
    var pos = options.top;
    openNotifications.forEach(function(element) {
      positionElement(element, pos);
      pos += getElementHeight(element);
    });
  }

  function checkAndSetDestroyDuration(element, duration) {
    if (duration) {
      timeouts[element.attr('id')] = $timeout(function() {
        hideElement(element);
      }, duration);
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/presence/_module.js */
angular.module('sn.common.presence', ['ng.amb', 'sn.common.glide']).config(function($provide) {
  "use strict";
  $provide.constant("PRESENCE_DISABLED", "false" === "true");
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snPresence.js */
angular.module("sn.common.presence").factory('snPresence', function($rootScope, $window, $log, amb, $timeout, $http, snRecordPresence, snTabActivity, urlTools, PRESENCE_DISABLED) {
  "use strict";
  var REST = {
    PRESENCE: "/api/now/ui/presence"
  };
  var databaseInterval = ($window.NOW.presence_interval || 15) * 1000;
  var initialized = false;
  var primary = false;
  var presenceArray = [];
  var serverTimeMillis;
  var skew = 0;
  var st = 0;

  function init() {
    var location = urlTools.parseQueryString(window.location.search);
    var table = location['table'] || location['sysparm_table'];
    var sys_id = location['sys_id'] || location['sysparm_sys_id'];
    var query = location['sysparm_query'];
    initPresence(table, sys_id, query);
  }

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!initialized) {
      initialized = true;
      initRootScopes();
      if (!primary) {
        CustomEvent.observe('sn.presence', onPresenceEvent);
        CustomEvent.fireTop('sn.presence.ping');
      } else {
        presenceArray = getLocalPresence();
        if (presenceArray)
          $timeout(schedulePresence, 100);
        else
          updateDatabase();
      }
    }
    snRecordPresence.initPresence(t, id);
  }

  function onPresenceEvent(parms) {
    presenceArray = parms;
    $timeout(broadcastPresence);
  }

  function initRootScopes() {
    if ($window.NOW.presence_scopes) {
      var ps = $window.NOW.presence_scopes;
      if (ps.indexOf($rootScope) == -1)
        ps.push($rootScope);
    } else {
      $window.NOW.presence_scopes = [$rootScope];
      primary = CustomEvent.isTopWindow();
    }
  }

  function updateDatabase() {
    presenceArray = getLocalPresence();
    if (presenceArray) {
      determineStatus();
      $timeout(schedulePresence);
      return;
    }
    if (!amb.isLoggedIn() || !snTabActivity.isPrimary) {
      $timeout(schedulePresence);
      return;
    }
    var p = {
      user_agent: navigator.userAgent,
      ua_time: new Date().toISOString(),
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      path: window.location.pathname + window.location.search
    };
    st = new Date().getTime();
    $http.post(REST.PRESENCE + '?sysparm_auto_request=true&cd=' + st, p).success(function(data) {
      var rt = new Date().getTime() - st;
      if (rt > 500)
        console.log("snPresence response time " + rt + "ms");
      if (data.result && data.result.presenceArray) {
        presenceArray = data.result.presenceArray;
        setLocalPresence(presenceArray);
        serverTimeMillis = data.result.serverTimeMillis;
        skew = new Date().getTime() - serverTimeMillis;
        var t = Math.floor(skew / 1000);
        if (t < -15)
          console.log(">>>>> server ahead " + Math.abs(t) + " seconds");
        else if (t > 15)
          console.log(">>>>> browser time ahead " + t + " seconds");
      }
      schedulePresence();
    }).error(function(response, status) {
      console.log("snPresence " + status);
      if (429 == status)
        $timeout(updateDatabase, databaseInterval);
      else
        schedulePresence();
    })
  }

  function schedulePresence() {
    $timeout(updateDatabase, databaseInterval);
    determineStatus();
    broadcastPresence();
  }

  function broadcastPresence() {
    $rootScope.$broadcast("sn.presence", presenceArray);
    if (!primary)
      return;
    CustomEvent.fireAll('sn.presence', presenceArray);
  }

  function determineStatus() {
    if (!presenceArray || !presenceArray.forEach)
      return;
    var t = new Date().getTime();
    t -= skew;
    presenceArray.forEach(function(p) {
      var x = 0 + p.last_on;
      var y = t - x;
      p.status = "online";
      if (y > (5 * databaseInterval))
        p.status = "offline";
      else if (y > (3 * databaseInterval))
        p.status = "probably offline";
      else if (y > (2.5 * databaseInterval))
        p.status = "maybe offline";
    })
  }

  function setLocalPresence(value) {
    var p = {
      saved: new Date().getTime(),
      presenceArray: value
    }
    $window.localStorage.setItem('snPresence', angular.toJson(p));
  }

  function getLocalPresence() {
    var p = $window.localStorage.getItem('snPresence');
    if (!p)
      return null;
    try {
      p = angular.fromJson(p);
    } catch (e) {
      p = {};
    }
    if (!p.presenceArray)
      return null;
    var now = new Date().getTime();
    if (now - p.saved >= databaseInterval)
      return null;
    return p.presenceArray;
  }
  return {
    init: init,
    initWithDocument: initPresence,
    initPresence: initPresence
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
  "use strict";
  var statChannel;
  var interval = ($window.NOW.record_presence_interval || 20) * 1000;
  var sessions = {};
  var primary = false;
  var table;
  var sys_id;

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!t || !id)
      return;
    if (t == table && id == sys_id)
      return;
    initRootScopes();
    if (!primary)
      return;
    termPresence();
    table = t;
    sys_id = id;
    var recordPresence = "/sn/rp/" + table + "/" + sys_id;
    $rootScope.me = NOW.session_id;
    statChannel = amb.getChannel(recordPresence);
    statChannel.subscribe(onStatus);
    amb.connected.then(function() {
      setStatus("entered");
      $rootScope.status = "viewing";
    });
    return statChannel;
  }

  function initRootScopes() {
    if ($window.NOW.record_presence_scopes) {
      var ps = $window.NOW.record_presence_scopes;
      if (ps.indexOf($rootScope) == -1) {
        ps.push($rootScope);
        CustomEvent.observe('sn.sessions', onPresenceEvent);
      }
    } else {
      $window.NOW.record_presence_scopes = [$rootScope];
      primary = true;
    }
  }

  function onPresenceEvent(sessionsToSend) {
    $rootScope.$broadcast("sn.sessions", sessionsToSend);
    $rootScope.$broadcast("sp.sessions", sessionsToSend);
  }

  function termPresence() {
    if (!statChannel)
      return;
    statChannel.unsubscribe();
    statChannel = table = sys_id = null;
  }

  function setStatus(status) {
    if (status == $rootScope.status)
      return;
    $rootScope.status = status;
    if (Object.keys(sessions).length == 0)
      return;
    if (getStatusPrecedence(status) > 1)
      return;
    publish($rootScope.status);
  }

  function publish(status) {
    if (!statChannel)
      return;
    if (amb.getState() !== "opened")
      return;
    statChannel.publish({
      presences: [{
        status: status,
        session_id: NOW.session_id,
        user_name: NOW.user_name,
        user_id: NOW.user_id,
        user_display_name: NOW.user_display_name,
        user_initials: NOW.user_initials,
        user_avatar: NOW.user_avatar,
        ua: navigator.userAgent,
        table: table,
        sys_id: sys_id,
        time: new Date().toString().substring(0, 24)
      }]
    });
  }

  function onStatus(message) {
    message.data.presences.forEach(function(d) {
      if (!d.session_id || d.session_id == NOW.session_id)
        return;
      var s = sessions[d.session_id];
      if (s)
        angular.extend(s, d);
      else
        s = sessions[d.session_id] = d;
      s.lastUpdated = new Date();
      if (s.status == 'exited')
        delete sessions[d.session_id];
    });
    broadcastSessions();
  }

  function broadcastSessions() {
    var sessionsToSend = getUniqueSessions();
    $rootScope.$broadcast("sn.sessions", sessionsToSend);
    $rootScope.$broadcast("sp.sessions", sessionsToSend);
    if (primary)
      $timeout(function() {
        CustomEvent.fire('sn.sessions', sessionsToSend);
      })
  }

  function getUniqueSessions() {
    var uniqueSessionsByUser = {};
    var sessionKeys = Object.keys(sessions);
    sessionKeys.forEach(function(key) {
      var session = sessions[key];
      if (session.user_id == NOW.user_id)
        return;
      if (session.user_id in uniqueSessionsByUser) {
        var otherSession = uniqueSessionsByUser[session.user_id];
        var thisPrecedence = getStatusPrecedence(session.status);
        var otherPrecedence = getStatusPrecedence(otherSession.status);
        uniqueSessionsByUser[session.user_id] = thisPrecedence < otherPrecedence ? session : otherSession;
        return
      }
      uniqueSessionsByUser[session.user_id] = session;
    });
    var uniqueSessions = {};
    angular.forEach(uniqueSessionsByUser, function(item) {
      uniqueSessions[item.session_id] = item;
    });
    return uniqueSessions;
  }

  function getStatusPrecedence(status) {
    switch (status) {
      case 'typing':
        return 0;
      case 'viewing':
        return 1;
      case 'entered':
        return 2;
      case 'exited':
      case 'probably left':
        return 4;
      case 'offline':
        return 5;
      default:
        return 3;
    }
  }
  $rootScope.$on("record.typing", function(evt, data) {
    setStatus(data.status);
  });
  var idleTable, idleSysID;
  snTabActivity.onIdle({
    onIdle: function RecordPresenceTabIdle() {
      idleTable = table;
      idleSysID = sys_id;
      sessions = {};
      termPresence();
      broadcastSessions();
    },
    onReturn: function RecordPresenceTabActive() {
      initPresence(idleTable, idleSysID, true);
      idleTable = idleSysID = void(0);
    },
    delay: interval * 4
  });
  return {
    initPresence: initPresence,
    termPresence: termPresence
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snPresence.js */
angular.module('sn.common.presence').directive('snPresence', function(snPresence, $rootScope, $timeout) {
  'use strict';
  $timeout(snPresence.init, 100);
  var presences = {};
  $rootScope.$on('sn.presence', function(event, presenceArray) {
    if (!presenceArray) {
      angular.forEach(presences, function(p) {
        p.status = "offline";
      });
      return;
    }
    presenceArray.forEach(function(presence) {
      presences[presence.user] = presence;
    });
  });
  return {
    restrict: 'EA',
    replace: false,
    scope: {
      snPresence: '=?',
      user: '=?',
      profile: '=?'
    },
    link: function(scope, element) {
      if (scope.profile)
        scope.user = scope.profile.userID;
      if (!element.hasClass('presence'))
        element.addClass('presence');

      function updatePresence() {
        var id = scope.snPresence || scope.user;
        if (presences[id]) {
          var status = presences[id].status;
          if (status === 'maybe offline' || status === 'probably offline') {
            element.removeClass('presence-online presence-offline presence-away');
            element.addClass('presence-away');
          } else if (status == "offline" && !element.hasClass('presence-offline')) {
            element.removeClass('presence-online presence-away');
            element.addClass('presence-offline');
          } else if ((status == "online" || status == "entered" || status == "viewing") && !element.hasClass('presence-online')) {
            element.removeClass('presence-offline presence-away');
            element.addClass('presence-online');
          }
        } else {
          if (!element.hasClass('presence-offline'))
            element.addClass('presence-offline');
        }
      }
      $rootScope.$on('sn.presence', updatePresence);
      updatePresence();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/util/js_includes_util.js */
/*! RESOURCE: /scripts/sn/common/util/_module.js */
angular.module('sn.common.util', ['sn.common.auth']);
angular.module('sn.util', ['sn.common.util']);;
/*! RESOURCE: /scripts/sn/common/util/service.dateUtils.js */
angular.module('sn.common.util').factory('dateUtils', function() {
  var dateUtils = {
    SYS_DATE_FORMAT: "yyyy-MM-dd",
    SYS_TIME_FORMAT: "HH:mm:ss",
    SYS_DATE_TIME_FORMAT: "yyyy-MM-dd HH:mm:ss",
    MONTH_NAMES: new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
    DAY_NAMES: new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
    LZ: function(x) {
      return (x < 0 || x > 9 ? "" : "0") + x
    },
    isDate: function(val, format) {
      var date = this.getDateFromFormat(val, format);
      if (date == 0) {
        return false;
      }
      return true;
    },
    compareDates: function(date1, dateformat1, date2, dateformat2) {
      var d1 = this.getDateFromFormat(date1, dateformat1);
      var d2 = this.getDateFromFormat(date2, dateformat2);
      if (d1 == 0 || d2 == 0) {
        return -1;
      } else if (d1 > d2) {
        return 1;
      }
      return 0;
    },
    formatDateServer: function(date, format) {
      var ga = new GlideAjax("DateTimeUtils");
      ga.addParam("sysparm_name", "formatCalendarDate");
      var browserOffset = date.getTimezoneOffset() * 60000;
      var utcTime = date.getTime() - browserOffset;
      var userDateTime = utcTime - g_tz_offset;
      ga.addParam("sysparm_value", userDateTime);
      ga.getXMLWait();
      return ga.getAnswer();
    },
    formatDate: function(date, format) {
      if (format.indexOf("z") > 0)
        return this.formatDateServer(date, format);
      format = format + "";
      var result = "";
      var i_format = 0;
      var c = "";
      var token = "";
      var y = date.getYear() + "";
      var M = date.getMonth() + 1;
      var d = date.getDate();
      var E = date.getDay();
      var H = date.getHours();
      var m = date.getMinutes();
      var s = date.getSeconds();
      var yyyy, yy, MMM, MM, dd, hh, h, mm, ss, ampm, HH, H, KK, K, kk, k;
      var value = new Object();
      value["M"] = M;
      value["MM"] = this.LZ(M);
      value["MMM"] = this.MONTH_NAMES[M + 11];
      value["NNN"] = this.MONTH_NAMES[M + 11];
      value["MMMM"] = this.MONTH_NAMES[M - 1];
      value["d"] = d;
      value["dd"] = this.LZ(d);
      value["E"] = this.DAY_NAMES[E + 7];
      value["EE"] = this.DAY_NAMES[E];
      value["H"] = H;
      value["HH"] = this.LZ(H);
      if (format.indexOf('w') != -1) {
        var wk = date.getWeek();
        if (wk >= 52 && M == 1) {
          y = date.getYear();
          y--;
          y = y + "";
        }
        if (wk == 1 && M == 12) {
          y = date.getYear();
          y++;
          y = y + "";
        }
        value["w"] = wk;
        value["ww"] = this.LZ(wk);
      }
      var dayOfWeek = (7 + (E + 1) - (g_first_day_of_week - 1)) % 7;
      if (dayOfWeek == 0)
        dayOfWeek = 7;
      value["D"] = dayOfWeek;
      if (y.length < 4) {
        y = "" + (y - 0 + 1900);
      }
      value["y"] = "" + y;
      value["yyyy"] = y;
      value["yy"] = y.substring(2, 4);
      if (H == 0) {
        value["h"] = 12;
      } else if (H > 12) {
        value["h"] = H - 12;
      } else {
        value["h"] = H;
      }
      value["hh"] = this.LZ(value["h"]);
      if (H > 11) {
        value["K"] = H - 12;
      } else {
        value["K"] = H;
      }
      value["k"] = H + 1;
      value["KK"] = this.LZ(value["K"]);
      value["kk"] = this.LZ(value["k"]);
      if (H > 11) {
        value["a"] = "PM";
      } else {
        value["a"] = "AM";
      }
      value["m"] = m;
      value["mm"] = this.LZ(m);
      value["s"] = s;
      value["ss"] = this.LZ(s);
      while (i_format < format.length) {
        c = format.charAt(i_format);
        token = "";
        while ((format.charAt(i_format) == c) && (i_format < format.length)) {
          token += format.charAt(i_format++);
        }
        if (value[token] != null) {
          result = result + value[token];
        } else {
          result = result + token;
        }
      }
      return result;
    },
    _isInteger: function(val) {
      var digits = "1234567890";
      for (var i = 0; i < val.length; i++) {
        if (digits.indexOf(val.charAt(i)) == -1) {
          return false;
        }
      }
      return true;
    },
    _getInt: function(str, i, minlength, maxlength) {
      for (var x = maxlength; x >= minlength; x--) {
        var token = str.substring(i, i + x);
        if (token.length < minlength) {
          return null;
        }
        if (this._isInteger(token)) {
          return token;
        }
      }
      return null;
    },
    getDateFromFormat: function(val, format) {
      val = val + "";
      format = format + "";
      var i_val = 0;
      var i_format = 0;
      var c = "";
      var token = "";
      var token2 = "";
      var x, y;
      var now = new Date();
      var year = now.getYear();
      var month = now.getMonth() + 1;
      var date = 0;
      var hh = now.getHours();
      var mm = now.getMinutes();
      var ss = now.getSeconds();
      var ampm = "";
      var week = false;
      while (i_format < format.length) {
        c = format.charAt(i_format);
        token = "";
        while ((format.charAt(i_format) == c) && (i_format < format.length)) {
          token += format.charAt(i_format++);
        }
        if (token == "yyyy" || token == "yy" || token == "y") {
          if (token == "yyyy") {
            x = 4;
            y = 4;
          }
          if (token == "yy") {
            x = 2;
            y = 2;
          }
          if (token == "y") {
            x = 2;
            y = 4;
          }
          year = this._getInt(val, i_val, x, y);
          if (year == null) {
            return 0;
          }
          i_val += year.length;
          if (year.length == 2) {
            if (year > 70) {
              year = 1900 + (year - 0);
            } else {
              year = 2000 + (year - 0);
            }
          }
        } else if (token == "MMM" || token == "NNN") {
          month = 0;
          for (var i = 0; i < this.MONTH_NAMES.length; i++) {
            var month_name = this.MONTH_NAMES[i];
            if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
              if (token == "MMM" || (token == "NNN" && i > 11)) {
                month = i + 1;
                if (month > 12) {
                  month -= 12;
                }
                i_val += month_name.length;
                break;
              }
            }
          }
          if ((month < 1) || (month > 12)) {
            return 0;
          }
        } else if (token == "EE" || token == "E") {
          for (var i = 0; i < this.DAY_NAMES.length; i++) {
            var day_name = this.DAY_NAMES[i];
            if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
              if (week) {
                if (i == 0 || i == 7)
                  date += 6;
                else if (i == 2 || i == 9)
                  date += 1;
                else if (i == 3 || i == 10)
                  date += 2;
                else if (i == 4 || i == 11)
                  date += 3;
                else if (i == 5 || i == 12)
                  date += 4;
                else if (i == 6 || i == 13)
                  date += 5;
              }
              i_val += day_name.length;
              break;
            }
          }
        } else if (token == "MM" || token == "M") {
          month = this._getInt(val, i_val, token.length, 2);
          if (month == null || (month < 1) || (month > 12)) {
            return 0;
          }
          i_val += month.length;
        } else if (token == "dd" || token == "d") {
          date = this._getInt(val, i_val, token.length, 2);
          if (date == null || (date < 1) || (date > 31)) {
            return 0;
          }
          i_val += date.length;
        } else if (token == "hh" || token == "h") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 1) || (hh > 12)) {
            return 0;
          }
          i_val += hh.length;
        } else if (token == "HH" || token == "H") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 0) || (hh > 23)) {
            return 0;
          }
          i_val += hh.length;
        } else if (token == "KK" || token == "K") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 0) || (hh > 11)) {
            return 0;
          }
          i_val += hh.length;
        } else if (token == "kk" || token == "k") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 1) || (hh > 24)) {
            return 0;
          }
          i_val += hh.length;
          hh--;
        } else if (token == "mm" || token == "m") {
          mm = this._getInt(val, i_val, token.length, 2);
          if (mm == null || (mm < 0) || (mm > 59)) {
            return 0;
          }
          i_val += mm.length;
        } else if (token == "ss" || token == "s") {
          ss = this._getInt(val, i_val, token.length, 2);
          if (ss == null || (ss < 0) || (ss > 59)) {
            return 0;
          }
          i_val += ss.length;
        } else if (token == "a") {
          if (val.substring(i_val, i_val + 2).toLowerCase() == "am") {
            ampm = "AM";
          } else if (val.substring(i_val, i_val + 2).toLowerCase() == "pm") {
            ampm = "PM";
          } else {
            return 0;
          }
          i_val += 2;
        } else if (token == "w" || token == "ww") {
          var weekNum = this._getInt(val, i_val, token.length, 2);
          week = true;
          if (weekNum != null) {
            var temp = new Date(year, 0, 1, 0, 0, 0);
            temp.setWeek(parseInt(weekNum, 10));
            year = temp.getFullYear();
            month = temp.getMonth() + 1;
            date = temp.getDate();
          }
          weekNum += "";
          i_val += weekNum.length;
        } else if (token == "D") {
          if (week) {
            var day = this._getInt(val, i_val, token.length, 1);
            if ((day == null) || (day <= 0) || (day > 7))
              return 0;
            var temp = new Date(year, month - 1, date, hh, mm, ss);
            var dayOfWeek = temp.getDay();
            day = parseInt(day, 10);
            day = (day + g_first_day_of_week - 1) % 7;
            if (day == 0)
              day = 7;
            day--;
            if (day < dayOfWeek)
              day = 7 - (dayOfWeek - day);
            else
              day -= dayOfWeek;
            if (day > 0) {
              temp.setDate(temp.getDate() + day);
              year = temp.getFullYear();
              month = temp.getMonth() + 1;
              date = temp.getDate();
            }
            i_val++;
          }
        } else if (token == "z")
          i_val += 3;
        else {
          if (val.substring(i_val, i_val + token.length) != token) {
            return 0;
          } else {
            i_val += token.length;
          }
        }
      }
      if (i_val != val.length) {
        return 0;
      }
      if (month == 2) {
        if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
          if (date > 29) {
            return 0;
          }
        } else {
          if (date > 28) {
            return 0;
          }
        }
      }
      if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
        if (date > 30) {
          return 0;
        }
      }
      if (hh < 12 && ampm == "PM") {
        hh = hh - 0 + 12;
      } else if (hh > 11 && ampm == "AM") {
        hh -= 12;
      }
      var newdate = new Date(year, month - 1, date, hh, mm, ss);
      return newdate.getTime();
    },
    parseDate: function(val) {
      var preferEuro = (arguments.length == 2) ? arguments[1] : false;
      generalFormats = new Array('y-M-d', 'MMM d, y', 'MMM d,y', 'y-MMM-d', 'd-MMM-y', 'MMM d');
      monthFirst = new Array('M/d/y', 'M-d-y', 'M.d.y', 'MMM-d', 'M/d', 'M-d');
      dateFirst = new Array('d/M/y', 'd-M-y', 'd.M.y', 'd-MMM', 'd/M', 'd-M');
      yearFirst = new Array('yyyyw.F', 'yyw.F');
      var checkList = new Array('generalFormats', preferEuro ? 'dateFirst' : 'monthFirst', preferEuro ? 'monthFirst' : 'dateFirst', 'yearFirst');
      var d = null;
      for (var i = 0; i < checkList.length; i++) {
        var l = window[checkList[i]];
        for (var j = 0; j < l.length; j++) {
          d = this.getDateFromFormat(val, l[j]);
          if (d != 0) {
            return new Date(d);
          }
        }
      }
      return null;
    }
  };
  Date.prototype.getWeek = function() {
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - (g_first_day_of_week - 1);
    day = (day >= 0 ? day : day + 7);
    var dayNum = Math.floor((this.getTime() - newYear.getTime() - (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weekNum;
    if (day < 4) {
      weekNum = Math.floor((dayNum + day - 1) / 7) + 1;
      if (weekNum > 52)
        weekNum = this._checkNextYear(weekNum);
      return weekNum;
    }
    weekNum = Math.floor((dayNum + day - 1) / 7);
    if (weekNum < 1)
      weekNum = this._lastWeekOfYear();
    else if (weekNum > 52)
      weekNum = this._checkNextYear(weekNum);
    return weekNum;
  };
  Date.prototype._lastWeekOfYear = function() {
    var newYear = new Date(this.getFullYear() - 1, 0, 1);
    var endOfYear = new Date(this.getFullYear() - 1, 11, 31);
    var day = newYear.getDay() - (g_first_day_of_week - 1);
    var dayNum = Math.floor((endOfYear.getTime() - newYear.getTime() - (endOfYear.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    return day < 4 ? Math.floor((dayNum + day - 1) / 7) + 1 : Math.floor((dayNum + day - 1) / 7);
  };
  Date.prototype._checkNextYear = function() {
    var nYear = new Date(this.getFullYear() + 1, 0, 1);
    var nDay = nYear.getDay() - (g_first_day_of_week - 1);
    nDay = nDay >= 0 ? nDay : nDay + 7;
    return nDay < 4 ? 1 : 53;
  };
  Date.prototype.setWeek = function(weekNum) {
    weekNum--;
    var startOfYear = new Date(this.getFullYear(), 0, 1);
    var day = startOfYear.getDay() - (g_first_day_of_week - 1);
    if (day > 0 && day < 4) {
      this.setFullYear(startOfYear.getFullYear() - 1);
      this.setDate(31 - day + 1);
      this.setMonth(11);
    } else if (day > 3)
      this.setDate(startOfYear.getDate() + (7 - day));
    this.setDate(this.getDate() + (7 * weekNum));
  };
  return dateUtils;
});
/*! RESOURCE: /scripts/sn/common/util/service.debounceFn.js */
angular.module("sn.common.util").service("debounceFn", function() {
  "use strict";

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  return {
    debounce: debounce
  }
});;
/*! RESOURCE: /scripts/sn/common/util/factory.unwrappedHTTPPromise.js */
angular.module('sn.common.util').factory("unwrappedHTTPPromise", function($q) {
  "use strict";

  function isGenericPromise(promise) {
    return (typeof promise.then === "function" &&
      promise.success === undefined &&
      promise.error === undefined);
  }
  return function(httpPromise) {
    if (isGenericPromise(httpPromise))
      return httpPromise;
    var deferred = $q.defer();
    httpPromise.success(function(data) {
      deferred.resolve(data);
    }).error(function(data, status) {
      deferred.reject({
        data: data,
        status: status
      })
    });
    return deferred.promise;
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.urlTools.js */
angular.module('sn.common.util').constant('angularProcessorUrl', 'angular.do?sysparm_type=');
angular.module('sn.common.util').factory("urlTools", function(getTemplateUrl, angularProcessorUrl) {
  "use strict";

  function getPartialURL(name, parameters) {
    var url = getTemplateUrl(name);
    if (parameters) {
      if (typeof parameters !== 'string') {
        parameters = encodeURIParameters(parameters);
      }
      if (parameters.length) {
        url += "&" + parameters;
      }
    }
    if (window.NOW && window.NOW.ng_cache_defeat)
      url += "&t=" + new Date().getTime();
    return url;
  }

  function getURL(name, parameters) {
    if (parameters && typeof parameters === 'object')
      return urlFor(name, parameters);
    var url = angularProcessorUrl;
    url += name;
    if (parameters)
      url += "&" + parameters;
    return url;
  }

  function urlFor(route, parameters) {
    var p = encodeURIParameters(parameters);
    return angularProcessorUrl + route + (p.length ? '&' + p : '');
  }

  function getPropertyURL(name) {
    var url = angularProcessorUrl + "get_property&name=" + name;
    url += "&t=" + new Date().getTime();
    return url;
  }

  function encodeURIParameters(parameters) {
    var s = [];
    for (var parameter in parameters) {
      if (parameters.hasOwnProperty(parameter)) {
        var key = encodeURIComponent(parameter);
        var value = parameters[parameter] ? encodeURIComponent(parameters[parameter]) : '';
        s.push(key + "=" + value);
      }
    }
    return s.join('&');
  }

  function parseQueryString(qs) {
    qs = qs || '';
    if (qs.charAt(0) === '?') {
      qs = qs.substr(1);
    }
    var a = qs.split('&');
    if (a === "") {
      return {};
    }
    if (a && a[0].indexOf('http') != -1)
      a[0] = a[0].split("?")[1];
    var b = {};
    for (var i = 0; i < a.length; i++) {
      var p = a[i].split('=', 2);
      if (p.length == 1) {
        b[p[0]] = "";
      } else {
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
      }
    }
    return b;
  }
  return {
    getPartialURL: getPartialURL,
    getURL: getURL,
    urlFor: urlFor,
    getPropertyURL: getPropertyURL,
    encodeURIParameters: encodeURIParameters,
    parseQueryString: parseQueryString
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.getTemplateUrl.js */
angular.module('sn.common.util').provider('getTemplateUrl', function(angularProcessorUrl) {
  'use strict';
  var _handlerId = 0;
  var _handlers = {};
  this.registerHandler = function(handler) {
    var registeredId = _handlerId;
    _handlers[_handlerId] = handler;
    _handlerId++;
    return function() {
      delete _handlers[registeredId];
    };
  };
  this.$get = function() {
    return getTemplateUrl;
  };

  function getTemplateUrl(templatePath) {
    if (_handlerId > 0) {
      var path;
      var handled = false;
      angular.forEach(_handlers, function(handler) {
        if (!handled) {
          var handlerPath = handler(templatePath);
          if (typeof handlerPath !== 'undefined') {
            path = handlerPath;
            handled = true;
          }
        }
      });
      if (handled) {
        return path;
      }
    }
    return angularProcessorUrl + 'get_partial&name=' + templatePath;
  }
});;
/*! RESOURCE: /scripts/sn/common/util/service.snTabActivity.js */
angular.module("sn.common.util").service("snTabActivity", function($window, $timeout, $rootElement, $document) {
  "use strict";
  var activeEvents = ["keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "mousemove", "mouseenter", "input", "focus", "scroll"],
    defaultIdle = 75000,
    isPrimary = true,
    idleTime = 0,
    isVisible = true,
    idleTimeout = void(0),
    pageIdleTimeout = void(0),
    hasActed = false,
    appName = $rootElement.attr('ng-app') || "",
    storageKey = "sn.tabs." + appName + ".activeTab";
  var callbacks = {
    "tab.primary": [],
    "tab.secondary": [],
    "activity.active": [],
    "activity.idle": [{
      delay: defaultIdle,
      cb: function() {}
    }]
  };
  $window.tabGUID = $window.tabGUID || createGUID();

  function getActiveEvents() {
    return activeEvents.join(".snTabActivity ") + ".snTabActivity";
  }

  function setAppName(an) {
    appName = an;
    storageKey = "sn.tabs." + appName + ".activeTab";
    makePrimary(true);
  }

  function createGUID(l) {
    l = l || 32;
    var strResult = '';
    while (strResult.length < l)
      strResult += (((1 + Math.random() + new Date().getTime()) * 0x10000) | 0).toString(16).substring(1);
    return strResult.substr(0, l);
  }

  function ngObjectIndexOf(arr, obj) {
    for (var i = 0, len = arr.length; i < len; i++)
      if (angular.equals(arr[i], obj))
        return i;
    return -1;
  }
  var detectedApi,
    apis = [{
      eventName: 'visibilitychange',
      propertyName: 'hidden'
    }, {
      eventName: 'mozvisibilitychange',
      propertyName: 'mozHidden'
    }, {
      eventName: 'msvisibilitychange',
      propertyName: 'msHidden'
    }, {
      eventName: 'webkitvisibilitychange',
      propertyName: 'webkitHidden'
    }];
  apis.some(function(api) {
    if (angular.isDefined($document[0][api.propertyName])) {
      detectedApi = api;
      return true;
    }
  });
  if (detectedApi)
    $document.on(detectedApi.eventName, function() {
      if (!$document[0][detectedApi.propertyName]) {
        makePrimary();
        isVisible = true;
      } else {
        if (!idleTimeout && !idleTime)
          waitForIdle(0);
        isVisible = false;
      }
    });
  angular.element($window).on({
    "mouseleave": function(e) {
      var destination = angular.isUndefined(e.toElement) ? e.relatedTarget : e.toElement;
      if (destination === null && $document[0].hasFocus()) {
        waitForIdle(0);
      }
    },
    "storage": function(e) {
      if (e.originalEvent.key !== storageKey)
        return;
      if ($window.localStorage.getItem(storageKey) !== $window.tabGUID)
        makeSecondary();
    }
  });

  function waitForIdle(index, delayOffset) {
    var callback = callbacks['activity.idle'][index];
    var numCallbacks = callbacks['activity.idle'].length;
    delayOffset = delayOffset || callback.delay;
    angular.element($window).off(getActiveEvents());
    angular.element($window).one(getActiveEvents(), setActive);
    if (index >= numCallbacks)
      return;
    if (idleTimeout)
      $timeout.cancel(idleTimeout);
    idleTimeout = $timeout(function() {
      idleTime = callback.delay;
      callback.cb();
      $timeout.cancel(idleTimeout);
      idleTimeout = void(0);
      angular.element($window).off(getActiveEvents());
      angular.element($window).one(getActiveEvents(), setActive);
      for (var i = index + 1; i < numCallbacks; i++) {
        var nextDelay = callbacks['activity.idle'][i].delay;
        if (nextDelay <= callback.delay)
          callbacks['activity.idle'][i].cb();
        else {
          waitForIdle(i, nextDelay - callback.delay);
          break;
        }
      }
    }, delayOffset, false);
  }

  function setActive() {
    angular.element($window).off(getActiveEvents());
    if (idleTimeout) {
      $timeout.cancel(idleTimeout);
      idleTimeout = void(0);
    }
    var activeCallbacks = callbacks['activity.active'];
    activeCallbacks.some(function(callback) {
      if (callback.delay <= idleTime)
        callback.cb();
      else
        return true;
    });
    idleTime = 0;
    makePrimary();
    if (pageIdleTimeout) {
      $timeout.cancel(pageIdleTimeout);
      pageIdleTimeout = void(0);
    }
    var minDelay = callbacks['activity.idle'][0].delay;
    hasActed = false;
    if (!pageIdleTimeout)
      pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
    listenForActivity();
  }

  function pageIdleHandler() {
    if (idleTimeout)
      return;
    var minDelay = callbacks['activity.idle'][0].delay;
    if (hasActed) {
      hasActed = false;
      if (pageIdleTimeout)
        $timeout.cancel(pageIdleTimeout);
      pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
      listenForActivity();
      return;
    }
    var delayOffset = minDelay;
    if (callbacks['activity.idle'].length > 1)
      delayOffset = callbacks['activity.idle'][1].delay - minDelay;
    idleTime = minDelay;
    callbacks['activity.idle'][0].cb();
    waitForIdle(1, delayOffset);
    pageIdleTimeout = void(0);
  }

  function listenForActivity() {
    angular.element($window).off(getActiveEvents());
    angular.element($window).one(getActiveEvents(), onActivity);
    angular.element("#gsft_main").on("load.snTabActivity", function() {
      var src = angular.element(this).attr('src');
      if (src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
        var iframeWindow = this.contentWindow ? this.contentWindow : this.contentDocument.defaultView;
        angular.element(iframeWindow).off(getActiveEvents());
        angular.element(iframeWindow).one(getActiveEvents(), onActivity);
      }
    });
    angular.element('iframe').each(function(idx, iframe) {
      var src = angular.element(iframe).attr('src');
      if (!src)
        return;
      if (src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
        var iframeWindow = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.defaultView;
        angular.element(iframeWindow).off(getActiveEvents());
        angular.element(iframeWindow).one(getActiveEvents(), onActivity);
      }
    });
  }

  function onActivity() {
    hasActed = true;
    makePrimary();
  }

  function makePrimary(initial) {
    var oldGuid = $window.localStorage.getItem(storageKey);
    isPrimary = true;
    isVisible = true;
    $timeout.cancel(idleTimeout);
    idleTimeout = void(0);
    if (canUseStorage() && oldGuid !== $window.tabGUID && !initial)
      for (var i = 0, len = callbacks["tab.primary"].length; i < len; i++)
        callbacks["tab.primary"][i].cb();
    try {
      $window.localStorage.setItem(storageKey, $window.tabGUID);
    } catch (ignored) {}
    if (idleTime && $document[0].hasFocus())
      setActive();
  }

  function makeSecondary() {
    isPrimary = false;
    isVisible = false;
    for (var i = 0, len = callbacks["tab.secondary"].length; i < len; i++)
      callbacks["tab.secondary"][i].cb();
  }

  function registerCallback(event, callback, scope) {
    var cbObject = angular.isObject(callback) ? callback : {
      delay: defaultIdle,
      cb: callback
    };
    if (callbacks[event]) {
      callbacks[event].push(cbObject);
      callbacks[event].sort(function(a, b) {
        return a.delay - b.delay;
      })
    }

    function destroyCallback() {
      if (callbacks[event]) {
        var pos = ngObjectIndexOf(callbacks[event], cbObject);
        if (pos !== -1)
          callbacks[event].splice(pos, 1);
      }
    }
    if (scope)
      scope.$on("$destroy", function() {
        destroyCallback();
      });
    return destroyCallback;
  }

  function registerIdleCallback(options, onIdle, onReturn, scope) {
    var delay = options,
      onIdleDestroy,
      onReturnDestroy;
    if (angular.isObject(options)) {
      delay = options.delay;
      onIdle = options.onIdle || onIdle;
      onReturn = options.onReturn || onReturn;
      scope = options.scope || scope;
    }
    if (angular.isFunction(onIdle))
      onIdleDestroy = registerCallback("activity.idle", {
        delay: delay,
        cb: onIdle
      });
    else if (angular.isFunction(onReturn)) {
      onIdleDestroy = registerCallback("activity.idle", {
        delay: delay,
        cb: function() {}
      });
    }
    if (angular.isFunction(onReturn))
      onReturnDestroy = registerCallback("activity.active", {
        delay: delay,
        cb: onReturn
      });

    function destroyAll() {
      if (angular.isFunction(onIdleDestroy))
        onIdleDestroy();
      if (angular.isFunction(onReturnDestroy))
        onReturnDestroy();
    }
    if (scope)
      scope.$on("$destroy", function() {
        destroyAll();
      });
    return destroyAll;
  }

  function canUseStorage() {
    var canWe = false;
    try {
      $window.localStorage.setItem(storageKey, $window.tabGUID);
      canWe = true;
    } catch (ignored) {}
    return canWe;
  }
  makePrimary(true);
  listenForActivity();
  pageIdleTimeout = $timeout(pageIdleHandler, defaultIdle, false);
  return {
    on: registerCallback,
    onIdle: registerIdleCallback,
    setAppName: setAppName,
    get isPrimary() {
      return isPrimary;
    },
    get isIdle() {
      return idleTime > 0;
    },
    get idleTime() {
      return idleTime;
    },
    get isVisible() {
      return isVisible;
    },
    get appName() {
      return appName;
    },
    get defaultIdleTime() {
      return defaultIdle
    },
    isActive: function() {
      return this.idleTime < this.defaultIdleTime && this.isVisible;
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/util/factory.ArraySynchronizer.js */
angular.module("sn.common.util").factory("ArraySynchronizer", function() {
  'use strict';

  function ArraySynchronizer() {}

  function index(key, arr) {
    var result = {};
    var keys = [];
    result.orderedKeys = keys;
    angular.forEach(arr, function(item) {
      var keyValue = item[key];
      result[keyValue] = item;
      keys.push(keyValue);
    });
    return result;
  }

  function sortByKeyAndModel(arr, key, model) {
    arr.sort(function(a, b) {
      var aIndex = model.indexOf(a[key]);
      var bIndex = model.indexOf(b[key]);
      if (aIndex > bIndex)
        return 1;
      else if (aIndex < bIndex)
        return -1;
      return 0;
    });
  }
  ArraySynchronizer.prototype = {
    add: function(syncField, dest, source, end) {
      end = end || "bottom";
      var destIndex = index(syncField, dest);
      var sourceIndex = index(syncField, source);
      angular.forEach(sourceIndex.orderedKeys, function(key) {
        if (destIndex.orderedKeys.indexOf(key) === -1) {
          if (end === "bottom") {
            dest.push(sourceIndex[key]);
          } else {
            dest.unshift(sourceIndex[key]);
          }
        }
      });
    },
    synchronize: function(syncField, dest, source, deepKeySyncArray) {
      var destIndex = index(syncField, dest);
      var sourceIndex = index(syncField, source);
      deepKeySyncArray = (typeof deepKeySyncArray === "undefined") ? [] : deepKeySyncArray;
      for (var i = destIndex.orderedKeys.length - 1; i >= 0; i--) {
        var key = destIndex.orderedKeys[i];
        if (sourceIndex.orderedKeys.indexOf(key) === -1) {
          destIndex.orderedKeys.splice(i, 1);
          dest.splice(i, 1);
        }
        if (deepKeySyncArray.length > 0) {
          angular.forEach(deepKeySyncArray, function(deepKey) {
            if (sourceIndex[key] && destIndex[key][deepKey] !== sourceIndex[key][deepKey]) {
              destIndex[key][deepKey] = sourceIndex[key][deepKey];
            }
          });
        }
      }
      angular.forEach(sourceIndex.orderedKeys, function(key) {
        if (destIndex.orderedKeys.indexOf(key) === -1)
          dest.push(sourceIndex[key]);
      });
      sortByKeyAndModel(dest, syncField, sourceIndex.orderedKeys);
    }
  };
  return ArraySynchronizer;
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snBindOnce.js */
angular.module("sn.common.util").directive("snBindOnce", function($sanitize) {
  "use strict";
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      var value = scope.$eval(attrs.snBindOnce);
      var sanitizedValue = $sanitize(value);
      element.append(sanitizedValue);
    }
  }
});
/*! RESOURCE: /scripts/sn/common/util/directive.snCloak.js */
angular.module("sn.common.util").directive("snCloak", function() {
  "use strict";
  return {
    restrict: "A",
    compile: function(element, attr) {
      return function() {
        attr.$set('snCloak', undefined);
        element.removeClass('sn-cloak');
      }
    }
  };
});
/*! RESOURCE: /scripts/sn/common/util/service.md5.js */
angular.module('sn.common.util').factory('md5', function() {
  'use strict';
  var md5cycle = function(x, k) {
    var a = x[0],
      b = x[1],
      c = x[2],
      d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  };
  var cmn = function(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  };
  var ff = function(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  };
  var gg = function(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  };
  var hh = function(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  };
  var ii = function(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  };
  var md51 = function(s) {
    var txt = '';
    var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  };
  var md5blk = function(s) {
    var md5blks = [],
      i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  };
  var hex_chr = '0123456789abcdef'.split('');
  var rhex = function(n) {
    var s = '',
      j = 0;
    for (; j < 4; j++)
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] +
      hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
  };
  var hex = function(x) {
    for (var i = 0; i < x.length; i++)
      x[i] = rhex(x[i]);
    return x.join('');
  };
  var add32 = function(a, b) {
    return (a + b) & 0xFFFFFFFF;
  };
  return function(s) {
    return hex(md51(s));
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.priorityQueue.js */
angular.module('sn.common.util').factory('priorityQueue', function() {
  'use strict';
  return function(comparator) {
    var items = [];
    var compare = comparator || function(a, b) {
      return a - b;
    };
    var swap = function(a, b) {
      var temp = items[a];
      items[a] = items[b];
      items[b] = temp;
    };
    var bubbleUp = function(pos) {
      var parent;
      while (pos > 0) {
        parent = (pos - 1) >> 1;
        if (compare(items[pos], items[parent]) >= 0)
          break;
        swap(parent, pos);
        pos = parent;
      }
    };
    var bubbleDown = function(pos) {
      var left, right, min, last = items.length - 1;
      while (true) {
        left = (pos << 1) + 1;
        right = left + 1;
        min = pos;
        if (left <= last && compare(items[left], items[min]) < 0)
          min = left;
        if (right <= last && compare(items[right], items[min]) < 0)
          min = right;
        if (min === pos)
          break;
        swap(min, pos);
        pos = min;
      }
    };
    return {
      add: function(item) {
        items.push(item);
        bubbleUp(items.length - 1);
      },
      poll: function() {
        var first = items[0],
          last = items.pop();
        if (items.length > 0) {
          items[0] = last;
          bubbleDown(0);
        }
        return first;
      },
      peek: function() {
        return items[0];
      },
      clear: function() {
        items = [];
      },
      inspect: function() {
        return angular.toJson(items, true);
      },
      get size() {
        return items.length;
      },
      get all() {
        return items;
      },
      set comparator(fn) {
        compare = fn;
      }
    };
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.snResource.js */
angular.module('sn.common.util').factory('snResource', function($http, $q, priorityQueue, md5) {
  'use strict';
  var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'jsonp', 'trace'],
    queue = priorityQueue(function(a, b) {
      return a.timestamp - b.timestamp;
    }),
    resource = {},
    pendingRequests = [],
    inFlightRequests = [];
  return function() {
    var requestInterceptors = $http.defaults.transformRequest,
      responseInterceptors = $http.defaults.transformResponse;
    var next = function() {
      var request = queue.peek();
      pendingRequests.shift();
      inFlightRequests.push(request.hash);
      $http(request.config).then(function(response) {
        request.deferred.resolve(response);
      }, function(reason) {
        request.deferred.reject(reason);
      }).finally(function() {
        queue.poll();
        inFlightRequests.shift();
        if (queue.size > 0)
          next();
      });
    };
    angular.forEach(methods, function(method) {
      resource[method] = function(url, data) {
        var deferredRequest = $q.defer(),
          promise = deferredRequest.promise,
          deferredAbort = $q.defer(),
          config = {
            method: method,
            url: url,
            data: data,
            transformRequest: requestInterceptors,
            transformResponse: responseInterceptors,
            timeout: deferredAbort.promise
          },
          hash = md5(JSON.stringify(config));
        pendingRequests.push(hash);
        queue.add({
          config: config,
          deferred: deferredRequest,
          timestamp: Date.now(),
          hash: hash
        });
        if (queue.size === 1)
          next();
        promise.abort = function() {
          deferredAbort.resolve('Request cancelled');
        };
        return promise;
      };
    });
    resource.addRequestInterceptor = function(fn) {
      requestInterceptors = requestInterceptors.concat([fn]);
    };
    resource.addResponseInterceptor = function(fn) {
      responseInterceptors = responseInterceptors.concat([fn]);
    };
    resource.queueSize = function() {
      return queue.size;
    };
    resource.queuedRequests = function() {
      return queue.all;
    };
    return resource;
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.snConnect.js */
angular.module("sn.common.util").service("snConnectService", function($http, snCustomEvent) {
  "use strict";
  var connectPaths = ["/$c.do", "/$chat.do"];

  function canOpenInFrameset() {
    return window.top.NOW.collaborationFrameset;
  }

  function isInConnect() {
    var parentPath = getParentPath();
    return connectPaths.some(function(path) {
      return parentPath == path;
    });
  }

  function getParentPath() {
    try {
      return window.top.location.pathname;
    } catch (IGNORED) {
      return "";
    }
  }

  function openWithProfile(profile) {
    if (isInConnect() || canOpenInFrameset())
      snCustomEvent.fireTop('chat:open_conversation', profile);
    else
      window.open("$c.do#/with/" + profile.sys_id, "_blank");
  }
  return {
    openWithProfile: openWithProfile
  }
});;
/*! RESOURCE: /scripts/sn/common/util/snPolyfill.js */
(function() {
  "use strict";
  polyfill(String.prototype, 'startsWith', function(prefix) {
    return this.indexOf(prefix) === 0;
  });
  polyfill(String.prototype, 'endsWith', function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  });
  polyfill(Number, 'isNaN', function(value) {
    return value !== value;
  });
  polyfill(window, 'btoa', function(input) {
    var str = String(input);
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    for (
      var block, charCode, idx = 0, map = chars, output = ''; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  function polyfill(obj, slot, fn) {
    if (obj[slot] === void(0)) {
      obj[slot] = fn;
    }
  }
  window.console = window.console || {
    log: function() {}
  };
})();;
/*! RESOURCE: /scripts/sn/common/util/directive.snFocus.js */
angular.module('sn.common.util').directive('snFocus', function($timeout) {
  'use strict';
  return function(scope, element, attrs) {
    scope.$watch(attrs.snFocus, function(value) {
      if (value !== true)
        return;
      $timeout(function() {
        element[0].focus();
      });
    });
  };
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snResizeHeight.js */
angular.module('sn.common.util').directive('snResizeHeight', function($timeout, $window) {
  "use strict";
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var typographyStyles = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'letterSpacing',
        'textTransform',
        'wordSpacing',
        'textIndent'
      ];
      var maxHeight = parseInt(elem.css('max-height'), 10) || 0;
      var offset = 0;
      var IS_EDGE = $window.navigator.userAgent.indexOf("Edge") > -1;
      if (elem.css('box-sizing') === 'border-box' || elem.css('-moz-box-sizing') === 'border-box' || elem.css('-webkit-box-sizing') === 'border-box')
        offset = elem.outerHeight() - elem.height();
      var styles = {};
      angular.forEach(typographyStyles, function(val) {
        styles[val] = elem.css(val);
      });
      var $clone = angular.element('<textarea rows="1" tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; padding: 0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden; transition:none; -webkit-transition:none; -moz-transition:none;"></textarea>');
      $clone.css(styles);
      $timeout(function() {
        angular.element(document.body).append($clone);
        if (elem[0].value) {
          reSize();
        }
      }, 0, false);

      function _fixValueForEdge(value) {
        if (typeof value === "undefined" || !value) {
          return "";
        }
        var valueWithoutReturns = value.replace(/\r?\n|\r/gm, "").length;
        if (valueWithoutReturns === 0) {
          return value + '&nbsp';
        }
        return value;
      }

      function reSize() {
        var elemValue;
        if (!isVisible(elem[0]) || !setWidth())
          return;
        if (IS_EDGE) {
          elemValue = _fixValueForEdge(elem[0].value);
        } else {
          elemValue = elem[0].value;
        }
        if (!elem[0].value && attrs['placeholder'])
          $clone[0].value = attrs['placeholder'] || '';
        else
          $clone[0].value = elemValue;
        $clone[0].scrollTop = 0;
        $clone[0].scrollTop = 9e4;
        var newHeight = $clone[0].scrollTop;
        if (maxHeight && newHeight > maxHeight) {
          newHeight = maxHeight;
          elem[0].style.overflow = "auto";
        } else
          elem[0].style.overflow = "hidden";
        newHeight += offset;
        elem[0].style.height = newHeight + "px";
      }
      var style, bordersAndPadding;

      function setWidth() {
        style = style || window.getComputedStyle(elem[0], null);
        var width = elem[0].getBoundingClientRect().width;
        if (width === 0 || typeof width !== 'number')
          width = parseInt(style.width, 10);
        if (width === 0 || typeof width !== 'number') {
          if (style.width.length && style.width[style.width.length - 1] === '%') {
            $timeout(reSize, 0, false);
            return false;
          }
          width = parseInt(style.width, 10);
        }
        if (!bordersAndPadding) {
          bordersAndPadding = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce(function(acc, val) {
            return acc + parseInt(style[val], 10);
          }, 0);
        }
        $clone[0].style.width = (width - bordersAndPadding) + 'px';
        return true;
      }
      scope.$watch(
        function() {
          return elem[0].value
        },
        function watchBinding(newValue, oldValue) {
          if (newValue === oldValue)
            return;
          reSize();
        }
      );
      elem.on('input.resize', reSize);
      if (attrs['snResizeHeight'] == "trim") {
        elem.on('blur', function() {
          elem.val(elem.val().trim());
          reSize();
        });
      }
      scope.$on('$destroy', function() {
        $clone.remove();
      });

      function isVisible(elem) {
        return !!elem.offsetParent;
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snBlurOnEnter.js */
angular.module('sn.common.util').directive('snBlurOnEnter', function() {
  'use strict';
  return function(scope, element) {
    element.bind("keydown keypress", function(event) {
      if (event.which !== 13)
        return;
      element.blur();
      event.preventDefault();
    });
  };
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snStickyHeaders.js */
angular.module('sn.common.util').directive('snStickyHeaders', function() {
  "use strict";
  return {
    restrict: 'A',
    transclude: false,
    replace: false,
    link: function(scope, element, attrs) {
      element.addClass('sticky-headers');
      var containers;
      var scrollContainer = element.find('[sn-sticky-scroll-container]');
      scrollContainer.addClass('sticky-scroll-container');

      function refreshHeaders() {
        if (attrs.snStickyHeaders !== 'false') {
          angular.forEach(containers, function(container) {
            var stickyContainer = angular.element(container);
            var stickyHeader = stickyContainer.find('[sn-sticky-header]');
            var stickyOffset = stickyContainer.position().top + stickyContainer.outerHeight();
            stickyContainer.addClass('sticky-container');
            if (stickyOffset < stickyContainer.outerHeight() && stickyOffset > -stickyHeader.outerHeight()) {
              stickyContainer.css('padding-top', stickyHeader.outerHeight());
              stickyHeader.css('width', stickyHeader.outerWidth());
              stickyHeader.removeClass('sticky-header-disabled').addClass('sticky-header-enabled');
            } else {
              stickyContainer.css('padding-top', '');
              stickyHeader.css('width', '');
              stickyHeader.removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
            }
          });
        } else {
          element.find('[sn-sticky-container]').removeClass('sticky-container');
          element.find('[sn-sticky-container]').css('padding-top', '');
          element.find('[sn-sticky-header]').css('width', '');
          element.find('[sn-sticky-header]').removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
        }
      }
      scope.$watch(function() {
        scrollContainer.find('[sn-sticky-header]').addClass('sticky-header');
        containers = element.find('[sn-sticky-container]');
        return attrs.snStickyHeaders;
      }, refreshHeaders);
      scope.$watch(function() {
        return scrollContainer[0].scrollHeight;
      }, refreshHeaders);
      scrollContainer.on('scroll', refreshHeaders);
    }
  };
});;;
/*! RESOURCE: /scripts/sn/common/ui/js_includes_ui.js */
/*! RESOURCE: /scripts/sn/common/ui/_module.js */
angular.module('sn.common.ui', ['sn.common.messaging']);;
/*! RESOURCE: /scripts/sn/common/ui/popover/js_includes_ui_popover.js */
/*! RESOURCE: /scripts/sn/common/ui/popover/_module.js */
angular.module('sn.common.ui.popover', []);;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snBindPopoverSelection.js */
angular.module('sn.common.ui.popover').directive('snBindPopoverSelection', function(snCustomEvent) {
  "use strict";
  return {
    restrict: "A",
    controller: function($scope, $element, $attrs, snCustomEvent) {
      snCustomEvent.observe('list.record_select', recordSelectDataHandler);

      function recordSelectDataHandler(data, event) {
        if (!data || !event)
          return;
        event.stopPropagation();
        var ref = ($scope.field) ? $scope.field.ref : $attrs.ref;
        if (data.ref === ref) {
          if (window.g_form) {
            if ($attrs.addOption) {
              addGlideListChoice('select_0' + $attrs.ref, data.value, data.displayValue);
            } else {
              var fieldValue = typeof $attrs.ref === 'undefined' ? data.ref : $attrs.ref;
              window.g_form._setValue(fieldValue, data.value, data.displayValue);
              clearDerivedFields(data.value);
            }
          }
          if ($scope.field) {
            $scope.field.value = data.value;
            $scope.field.displayValue = data.displayValue;
          }
        }
      }

      function clearDerivedFields(value) {
        if (window.DerivedFields) {
          var df = new DerivedFields($scope.field ? $scope.field.ref : $attrs.ref);
          df.clearRelated();
          df.updateRelated(value);
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snComplexPopover.js */
angular.module('sn.common.ui.popover').directive('snComplexPopover', function(getTemplateUrl, $q, $http, $templateCache, $compile, $timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    templateUrl: function(elem, attrs) {
      return getTemplateUrl(attrs.buttonTemplate);
    },
    controller: function($scope, $element, $attrs, $q, $document, snCustomEvent, snComplexPopoverService) {
      $scope.type = $attrs.complexPopoverType || "complex_popover";
      if ($scope.closeEvent) {
        snCustomEvent.observe($scope.closeEvent, destroyPopover);
        $scope.$on($scope.closeEvent, destroyPopover);
      }
      $scope.$parent.$on('$destroy', destroyPopover);
      var newScope;
      var open;
      var popover;
      var content;
      var popoverDefaults = {
        container: 'body',
        html: true,
        placement: 'auto',
        trigger: 'manual',
        template: '<div class="complex_popover popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      var popoverConfig = angular.extend(popoverDefaults, $scope.popoverConfig);
      $scope.loading = false;
      $scope.initialized = false;
      $scope.togglePopover = function(event) {
        if (!$scope.initialized) {
          showPopover(event);
        } else {
          destroyPopover();
        }
      };

      function showPopover(e) {
        if ($scope.loading)
          return;
        $scope.$toggleButton = angular.element(e.target);
        $scope.loading = true;
        if (popoverDefaults.initialize && typeof popoverDefaults.initialize == 'function') {
          popoverDefaults.initialize.apply(null, []);
        }
        $scope.$emit('list.toggleLoadingState', true);
        _getTemplate()
          .then(_insertTemplate)
          .then(_createPopover)
          .then(_bindHtml)
          .then(function() {
            $scope.loading = false;
            $scope.initialized = true;
            if (!$scope.loadEvent)
              _openPopover();
          });
      }

      function destroyPopover() {
        if (!newScope)
          return;
        $scope.$toggleButton.on('hidden.bs.popover', function() {
          open = false;
          $scope.$toggleButton.data('bs.popover').$element.removeData('bs.popover').off('.popover');
          $scope.$toggleButton = null;
          snCustomEvent.fire('hidden.complexpopover.' + $scope.ref);
        });
        $scope.$toggleButton.popover('hide');
        snCustomEvent.fire('hide.complexpopover.' + $scope.ref, $scope.$toggleButton);
        newScope.$broadcast('$destroy');
        newScope.$destroy();
        newScope = null;
        $scope.initialized = false;
        angular.element('html').off('click', complexHtmlHandler);
      }

      function _getTemplate() {
        return snComplexPopoverService.getTemplate(getTemplateUrl($attrs.template));
      }

      function _createPopover() {
        $scope.$toggleButton.popover(popoverConfig);
        return $q.when(true);
      }

      function _insertTemplate(response) {
        newScope = $scope.$new();
        if ($scope.loadEvent)
          newScope.$on($scope.loadEvent, _openPopover);
        content = $compile(response.data)(newScope);
        popoverConfig.content = content;
        newScope.open = true;
        snCustomEvent.fire('inserted.complexpopover.' + $scope.ref, $scope.$toggleButton);
        return $q.when(true);
      }

      function _bindHtml() {
        angular.element('html').on('click', complexHtmlHandler);
        return $q.when(true);
      }

      function complexHtmlHandler(e) {
        var parentComplexPopoverScope = angular.element(e.target).parents('.popover-content').children().scope();
        if (parentComplexPopoverScope && (parentComplexPopoverScope.type = "complex_popover") && $scope.type === "complex_popover")
          return;
        if (angular.element(e.target).parents('html').length === 0)
          return;
        if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length === 0) {
          e.preventDefault();
          e.stopPropagation();
          destroyPopover(e);
        }
      }

      function _openPopover() {
        if (open)
          return;
        open = true;
        $timeout(function() {
          $scope.$toggleButton.popover('show');
          snCustomEvent.fire('show.complexpopover.' + $scope.ref, $scope.$toggleButton);
          $scope.$toggleButton.on('shown.bs.popover', function() {
            snCustomEvent.fire('shown.complexpopover.' + $scope.ref, $scope.$toggleButton);
          });
        }, 0);
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/service.snComplexPopoverService.js */
angular.module('sn.common.ui.popover').service('snComplexPopoverService', function($http, $q, $templateCache) {
  "use strict";
  return {
    getTemplate: getTemplate
  };

  function getTemplate(template) {
    return $http.get(template, {
      cache: $templateCache
    });
  }
});;;
/*! RESOURCE: /scripts/sn/common/ui/directive.snConfirmModal.js */
angular.module('sn.common.ui').directive('snConfirmModal', function(getTemplateUrl) {
  return {
    templateUrl: getTemplateUrl('sn_confirm_modal.xml'),
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      config: '=?',
      modalName: '@',
      title: '@?',
      message: '@?',
      cancelButton: '@?',
      okButton: '@?',
      alertButton: '@?',
      cancel: '&?',
      ok: '&?',
      alert: '&?'
    },
    link: function(scope, element) {
      element.find('.modal').remove();
    },
    controller: function($scope, $rootScope) {
      $scope.config = $scope.config || {};

      function Button(fn, text) {
        return {
          fn: fn,
          text: text
        }
      }
      var buttons = {
        'cancelButton': new Button('cancel', 'Cancel'),
        'okButton': new Button('ok', 'OK'),
        'alertButton': new Button('alert', 'Close'),
        getText: function(type) {
          var button = this[type];
          if (button && $scope.get(button.fn))
            return button.text;
        }
      };
      $scope.get = function(type) {
        if ($scope.config[type])
          return $scope.config[type];
        if (!$scope[type]) {
          var text = buttons.getText(type);
          if (text)
            return $scope.config[type] = text;
        }
        return $scope.config[type] = $scope[type];
      };
      if (!$scope.get('modalName'))
        $scope.config.modalName = 'confirm-modal';

      function call(type) {
        var action = $scope.get(type);
        if (action) {
          if (angular.isFunction(action))
            action();
          return true;
        }
        return !!buttons.getText(type);
      }
      $scope.cancelPressed = close('cancel');
      $scope.okPressed = close('ok');
      $scope.alertPressed = close('alert');

      function close(type) {
        return function() {
          actionClosed = true;
          $rootScope.$broadcast('dialog.' + $scope.config.modalName + '.close');
          call(type);
        }
      }
      var actionClosed;
      $scope.$on('dialog.' + $scope.get('modalName') + '.opened', function() {
        actionClosed = false;
      });
      $scope.$on('dialog.' + $scope.get('modalName') + '.closed', function() {
        if (actionClosed)
          return;
        if (call('cancel'))
          return;
        if (call('alert'))
          return;
        call('ok');
      });
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snContextMenu.js */
angular.module('sn.common.ui').directive('contextMenu', function($document, $window, snCustomEvent) {
  var $contextMenu, $ul;
  var scrollHeight = angular.element("body").get(0).scrollHeight;
  var contextMenuItemHeight = 0;

  function setContextMenuPosition(event, $ul) {
    if (contextMenuItemHeight === 0)
      contextMenuItemHeight = 24;
    var cmWidth = 150;
    var cmHeight = contextMenuItemHeight * $ul.children().length;
    var startX = event.pageX + cmWidth >= $window.innerWidth ? event.pageX - cmWidth : event.pageX;
    var startY = event.pageY + cmHeight >= $window.innerHeight ? event.pageY - cmHeight : event.pageY;
    $ul.css({
      display: 'block',
      position: 'absolute',
      left: startX,
      top: startY
    });
  }

  function renderContextMenuItems($scope, event, options) {
    $ul.empty();
    angular.forEach(options, function(item) {
      var $li = angular.element('<li>');
      if (item === null) {
        $li.addClass('divider');
      } else {
        var $a = angular.element('<a>');
        $a.attr({
          tabindex: '-1'
        });
        $a.text(typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope));
        $li.append($a);
        $li.on('click', function($event) {
          $event.preventDefault();
          $scope.$apply(function() {
            _clearContextMenus(event);
            item[1].call($scope, $scope);
          });
        });
      }
      $ul.append($li);
    });
    setContextMenuPosition(event, $ul);
  }
  var renderContextMenu = function($scope, event, options) {
    angular.element(event.currentTarget).addClass('context');
    $contextMenu = angular.element('<div>', {
      'class': 'dropdown clearfix context-dropdown open'
    });
    $contextMenu.on('click', function(e) {
      if (angular.element(e.target).hasClass('dropdown')) {
        _clearContextMenus(event);
      }
    });
    $contextMenu.on('contextmenu', function(event) {
      event.preventDefault();
      _clearContextMenus(event);
    });
    $contextMenu.css({
      position: 'absolute',
      top: 0,
      height: scrollHeight,
      left: 0,
      right: 0,
      zIndex: 9999
    });
    $document.find('body').append($contextMenu);
    $ul = angular.element('<ul>', {
      'class': 'dropdown-menu',
      'role': 'menu'
    });
    renderContextMenuItems($scope, event, options);
    $contextMenu.append($ul);
    $contextMenu.data('resizeHandler', function() {
      scrollHeight = angular.element("body").get(0).scrollHeight;
      $contextMenu.css('height', scrollHeight);
    });
    snCustomEvent.observe('partial.page.reload', $contextMenu.data('resizeHandler'));
  };

  function _clearContextMenus(event) {
    if (!event) {
      return;
    }
    angular.element(event.currentTarget).removeClass('context');
    var els = angular.element(".context-dropdown");
    angular.forEach(els, function(el) {
      snCustomEvent.un('partial.page.reload', angular.element(el).data('resizeHandler'));
      angular.element(el).remove();
    });
  }
  return function(scope, element, attrs) {
    element.on('contextmenu', function(event) {
      if (event.ctrlKey)
        return;
      if (angular.element(element).attr('context-type'))
        return;
      scope.$apply(function() {
        applyMenu(event);
        clearWindowSelection();
      });
    });
    element.on('click', function(event) {
      var $el = angular.element(element);
      var $target = angular.element(event.target);
      if (!$el.attr('context-type') && !$target.hasClass('context-menu-click'))
        return;
      scope.$apply(function() {
        applyMenu(event);
        clearWindowSelection();
      });
    });

    function clearWindowSelection() {
      if (window.getSelection)
        if (window.getSelection().empty)
          window.getSelection().empty();
        else if (window.getSelection().removeAllRanges)
        window.getSelection().removeAllRanges();
      else if (document.selection)
        document.selection.empty();
    }

    function applyMenu(event) {
      var tagName = event.target.tagName;
      if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'BUTTON') {
        return;
      }
      var menu = scope.$eval(attrs.contextMenu);
      if (menu instanceof Array) {
        if (menu.length > 0) {
          event.stopPropagation();
          event.preventDefault();
          scope.$watch(function() {
            return menu;
          }, function(newValue, oldValue) {
            if (newValue !== oldValue) renderContextMenuItems(scope, event, menu);
          }, true);
          renderContextMenu(scope, event, menu);
        }
      } else if (typeof menu !== 'undefined' && typeof menu.then === 'function') {
        event.stopPropagation();
        event.preventDefault();
        menu.then(function(response) {
          var contextMenu = response;
          if (contextMenu.length > 0) {
            scope.$watch(function() {
              return contextMenu;
            }, function(newValue, oldValue) {
              if (newValue !== oldValue)
                renderContextMenuItems(scope, event, contextMenu);
            }, true);
            renderContextMenu(scope, event, contextMenu);
          } else {
            throw '"' + attrs.contextMenu + '" is not an array or promise';
          }
        });
      } else {
        throw '"' + attrs.contextMenu + '" is not an array or promise';
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snDialog.js */
angular.module("sn.common.ui").directive("snDialog", function($timeout, $rootScope, $document) {
  "use strict";
  return {
    restrict: "AE",
    transclude: true,
    scope: {
      modal: "=?",
      disableAutoFocus: "=?",
      classCheck: "="
    },
    replace: true,
    template: '<dialog><div ng-click="onClickClose()" class="close-button icon-button icon-cross"></div></dialog>',
    link: function(scope, element, attrs, ctrl, transcludeFn) {
      var transcludeScope = {};
      scope.isOpen = function() {
        return element[0].open;
      };
      transcludeFn(element.scope().$new(), function(a, b) {
        element.append(a);
        transcludeScope = b;
      });
      element.click(function(event) {
        event.stopPropagation();
        if (event.offsetX < 0 || event.offsetX > element[0].offsetWidth || event.offsetY < 0 || event.offsetY > element[0].offsetHeight)
          if (!scope.classCheck)
            scope.onClickClose();
          else {
            var classes = scope.classCheck.split(",");
            var found = false;
            for (var i = 0; i < classes.length; i++)
              if (angular.element(event.srcElement).closest(classes[i]).length > 0)
                found = true;
            if (!found)
              scope.onClickClose();
          }
      });
      scope.show = function() {
        var d = element[0];
        if (!d.showModal || true) {
          dialogPolyfill.registerDialog(d);
          d.setDisableAutoFocus(scope.disableAutoFocus);
        }
        if (scope.modal)
          d.showModal();
        else
          d.show();
        if (!angular.element(d).hasClass('sn-alert')) {
          $timeout(function() {
            if (d.dialogPolyfillInfo && d.dialogPolyfillInfo.backdrop) {
              angular.element(d.dialogPolyfillInfo.backdrop).one('click', function(event) {
                if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
                  scope.onClickClose();
              })
            } else {
              $document.on('click', function(event) {
                if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
                  scope.onClickClose();
              })
            }
          });
        }
      };
      scope.setPosition = function(data) {
        var contextData = scope.getContextData(data);
        if (contextData && element && element[0]) {
          if (contextData.position) {
            element[0].style.top = contextData.position.top + "px";
            element[0].style.left = contextData.position.left + "px";
            element[0].style.margin = "0px";
          }
          if (contextData.dimensions) {
            element[0].style.width = contextData.dimensions.width + "px";
            element[0].style.height = contextData.dimensions.height + "px";
          }
        }
      }
      scope.$on("dialog." + attrs.name + ".move", function(event, data) {
        scope.setPosition(data);
      })
      scope.$on("dialog." + attrs.name + ".show", function(event, data) {
        scope.setPosition(data);
        scope.setKeyEvents(data);
        if (scope.isOpen() === true)
          scope.close();
        else
          scope.show();
        angular.element(".sn-dialog-menu").each(function(index, value) {
          var name = angular.element(this).attr('name');
          if (name != attrs.name && !angular.element(this).attr('open')) {
            return true;
          }
          if (name != attrs.name && angular.element(this).attr('open')) {
            $rootScope.$broadcast("dialog." + name + ".close");
          }
        });
      })
      scope.onClickClose = function() {
        if (scope.isOpen())
          $rootScope.$broadcast("dialog." + attrs.name + ".close");
      }
      scope.close = function() {
        var d = element[0];
        d.close();
        scope.removeListeners();
      }
      scope.ok = function(contextData) {
        contextData.ok();
        scope.removeListeners();
      }
      scope.cancel = function(contextData) {
        contextData.cancel();
        scope.removeListeners();
      }
      scope.removeListeners = function() {
        element[0].removeEventListener("ok", scope.handleContextOk, false);
        element[0].removeEventListener("cancel", scope.handleContextCancel, false);
      }
      scope.setKeyEvents = function(data) {
        var contextData = scope.getContextData(data);
        if (contextData && contextData.cancel) {
          scope.handleContextOk = function() {
            scope.ok(contextData);
          }
          scope.handleContextCancel = function() {
            scope.cancel(contextData);
          }
          element[0].addEventListener("ok", scope.handleContextOk, false);
          element[0].addEventListener("cancel", scope.handleContextCancel, false);
        }
      }
      scope.getContextData = function(data) {
        var context = attrs.context;
        var contextData = null;
        if (context && data && context in data) {
          contextData = data[context];
          transcludeScope[context] = contextData;
        }
        return contextData;
      }
      scope.$on("dialog." + attrs.name + ".close", scope.close);
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snFlyout.js */
angular.module('sn.common.ui').directive('snFlyout', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    replace: 'true',
    templateUrl: getTemplateUrl('sn_flyout.xml'),
    scope: true,
    link: function($scope, element, attrs) {
      $scope.open = false;
      $scope.more = false;
      $scope.position = attrs.position || 'left';
      $scope.flyoutControl = attrs.control;
      $scope.register = attrs.register;
      var body = angular.element('.flyout-body', element);
      var header = angular.element('.flyout-header', element);
      var tabs = angular.element('.flyout-tabs', element);
      var distance = 0;
      var position = $scope.position;
      var options = {
        duration: 800,
        easing: 'easeOutBounce'
      }
      var animation = {};
      if ($scope.flyoutControl) {
        $('.flyout-handle', element).hide();
        var controls = angular.element('#' + $scope.flyoutControl);
        controls.click(function() {
          angular.element(this).trigger("snFlyout.open");
        });
        controls.on('snFlyout.open', function() {
          $scope.$apply(function() {
            $scope.open = !$scope.open;
          });
        });
      }
      var animate = function() {
        element.velocity(animation, options);
      }
      var setup = function() {
        animation[position] = -distance;
        if ($scope.open)
          element.css(position, 0);
        else
          element.css(position, -distance);
      }
      var calculatePosition = function() {
        if ($scope.open) {
          animation[position] = 0;
        } else {
          if ($scope.position === 'left' || $scope.position === 'right')
            animation[position] = -body.outerWidth();
          else
            animation[position] = -body.outerHeight();
        }
      }
      $scope.$watch('open', function(newValue, oldValue) {
        if (newValue === oldValue)
          return;
        calculatePosition();
        animate();
      });
      $scope.$watch('more', function(newValue, oldValue) {
        if (newValue === oldValue)
          return;
        var moreAnimation = {};
        if ($scope.more) {
          element.addClass('fly-double');
          moreAnimation = {
            width: body.outerWidth() * 2
          };
        } else {
          element.removeClass('fly-double');
          moreAnimation = {
            width: body.outerWidth() / 2
          };
        }
        body.velocity(moreAnimation, options);
        header.velocity(moreAnimation, options);
      });
      if ($scope.position === 'left' || $scope.position === 'right') {
        $scope.$watch(element[0].offsetWidth, function() {
          element.addClass('fly-from-' + $scope.position);
          distance = body.outerWidth();
          setup();
        });
      } else if ($scope.position === 'top' || $scope.position === 'bottom') {
        $scope.$watch(element[0].offsetWidth, function() {
          element.addClass('fly-from-' + $scope.position);
          distance = body.outerHeight() + header.outerHeight();
          setup();
        });
      }
      $scope.$on($scope.register + ".bounceTabByIndex", function(event, index) {
        $scope.bounceTab(index);
      });
      $scope.$on($scope.register + ".bounceTab", function(event, tab) {
        $scope.bounceTab($scope.tabs.indexOf(tab));
      });
      $scope.$on($scope.register + ".selectTabByIndex", function(event, index) {
        $scope.selectTab($scope.tabs[index]);
      });
      $scope.$on($scope.register + ".selectTab", function(event, tab) {
        $scope.selectTab(tab);
      });
    },
    controller: function($scope, $element) {
      $scope.tabs = [];
      var baseColor, highLightColor;
      $scope.selectTab = function(tab) {
        if ($scope.selectedTab)
          $scope.selectedTab.selected = false;
        tab.selected = true;
        $scope.selectedTab = tab;
        normalizeTab($scope.tabs.indexOf(tab));
      }

      function expandTab(tabElem) {
        tabElem.queue("tabBounce", function(next) {
          tabElem.velocity({
            width: ["2.5rem", "2.125rem"],
            backgroundColorRed: [highLightColor[0], baseColor[0]],
            backgroundColorGreen: [highLightColor[1], baseColor[1]],
            backgroundColorBlue: [highLightColor[2], baseColor[2]]
          }, {
            easing: "easeInExpo",
            duration: 250
          });
          next();
        });
      }

      function contractTab(tabElem) {
        tabElem.queue("tabBounce", function(next) {
          tabElem.velocity({
            width: ["2.125rem", "2.5rem"],
            backgroundColorRed: [baseColor[0], highLightColor[0]],
            backgroundColorGreen: [baseColor[1], highLightColor[1]],
            backgroundColorBlue: [baseColor[2], highLightColor[2]]
          }, {
            easing: "easeInExpo",
            duration: 250
          });
          next();
        });
      }
      $scope.bounceTab = function(index) {
        if (index >= $scope.tabs.length || index < 0)
          return;
        var tabScope = $scope.tabs[index];
        if (!tabScope.selected) {
          var tabElem = $element.find('.flyout-tab').eq(index);
          if (!baseColor) {
            baseColor = tabElem.css('backgroundColor').match(/[0-9]+/g);
            for (var i = 0; i < baseColor.length; i++)
              baseColor[i] = parseInt(baseColor[i], 10);
          }
          if (!highLightColor)
            highLightColor = invertColor(baseColor);
          if (tabScope.highlighted)
            contractTab(tabElem);
          for (var i = 0; i < 2; i++) {
            expandTab(tabElem);
            contractTab(tabElem);
          }
          expandTab(tabElem);
          tabElem.dequeue("tabBounce");
          tabScope.highlighted = true;
        }
      }
      $scope.toggleOpen = function() {
        $scope.open = !$scope.open;
      }
      this.addTab = function(tab) {
        $scope.tabs.push(tab);
        if ($scope.tabs.length === 1)
          $scope.selectTab(tab)
      }

      function normalizeTab(index) {
        if (index < 0 || index >= $scope.tabs.length || !$scope.tabs[index].highlighted)
          return;
        var tabElem = $element.find('.flyout-tab').eq(index);
        tabElem.velocity({
          width: ["2.125rem", "2.5rem"]
        }, {
          easing: "easeInExpo",
          duration: 250
        });
        tabElem.css('backgroundColor', '');
        $scope.tabs[index].highlighted = false;
      }

      function invertColor(rgb) {
        if (typeof rgb === "string")
          var color = rgb.match(/[0-9]+/g);
        else
          var color = rgb.slice(0);
        for (var i = 0; i < color.length; i++)
          color[i] = 255 - parseInt(color[i], 10);
        return color;
      }
    }
  }
}).directive("snFlyoutTab", function() {
  "use strict";
  return {
    restrict: "E",
    require: "^snFlyout",
    replace: true,
    scope: true,
    transclude: true,
    template: "<div ng-show='selected' ng-transclude='' style='height: 100%'></div>",
    link: function(scope, element, attrs, flyoutCtrl) {
      flyoutCtrl.addTab(scope);
    }
  }
});
/*! RESOURCE: /scripts/sn/common/ui/directive.snModal.js */
angular.module("sn.common.ui").directive("snModal", function($timeout, $rootScope) {
  "use strict";
  return {
    restrict: "AE",
    transclude: true,
    scope: {},
    replace: true,
    template: '<div tabindex="-1" aria-hidden="true" class="modal" role="dialog"></div>',
    link: function(scope, element, attrs, ctrl, transcludeFn) {
      var transcludeScope = {};
      transcludeFn(element.scope().$new(), function(a, b) {
        element.append(a);
        transcludeScope = b;
      });
      scope.$on("dialog." + attrs.name + ".show", function(event, data) {
        if (!isOpen())
          show(data);
      });
      scope.$on("dialog." + attrs.name + ".close", function() {
        if (isOpen())
          close();
      });

      function eventFn(eventName) {
        return function(e) {
          $rootScope.$broadcast("dialog." + attrs.name + "." + eventName, e);
        }
      }
      var events = {
        'shown.bs.modal': eventFn("opened"),
        'hide.bs.modal': eventFn("hide"),
        'hidden.bs.modal': eventFn("closed")
      };

      function show(data) {
        var context = attrs.context;
        var contextData = null;
        if (context && data && context in data) {
          contextData = data[context];
          transcludeScope[context] = contextData;
        }
        $timeout(function() {
          angular.element('.sn-popover-basic').each(function() {
            var $this = angular.element(this);
            if (angular.element($this.attr('data-target')).is(':visible')) {
              $this.popover('hide');
            }
          });
        });
        element.modal('show');
        for (var event in events)
          if (events.hasOwnProperty(event))
            element.on(event, events[event]);
        if (attrs.moveBackdrop == 'true')
          moveBackdrop(element);
      }

      function close() {
        element.modal('hide');
        for (var event in events)
          if (events.hasOwnProperty(event))
            element.off(event, events[event]);
      }

      function isOpen() {
        return element.hasClass('in');
      }

      function moveBackdrop(element) {
        element.after(angular.element('.modal-backdrop:visible').remove());
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snModalShow.js */
angular.module('sn.common.ui').directive('snModalShow', function() {
  "use strict";
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.click(function() {
        showDialog();
      });
      element.keyup(function(evt) {
        if (evt.which != 13)
          return;
        showDialog();
      });

      function showDialog() {
        scope.$broadcast('dialog.' + attrs.snModalShow + '.show');
      }
      if (window.SingletonKeyboardRegistry) {
        SingletonKeyboardRegistry.getInstance().bind('ctrl + alt + i', function() {
          scope.$broadcast('dialog.impersonate.show');
        }).selector(null, true);
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snTabs.js */
angular.module('sn.common.ui').directive('snTabs', function() {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    replace: 'true',
    scope: {
      tabData: '='
    },
    link: function($scope, element, attrs) {
      $scope.tabClass = attrs.tabClass;
      $scope.register = attrs.register;
      attrs.$observe('register', function(value) {
        $scope.register = value;
        $scope.setupListeners();
      });
      $scope.bounceTab = function() {
        angular.element()
      }
    },
    controller: 'snTabs'
  }
}).controller('snTabs', function($scope, $rootScope) {
  $scope.selectedTabIndex = 0;
  $scope.tabData[$scope.selectedTabIndex].selected = true;
  $scope.setupListeners = function() {
    $scope.$on($scope.register + '.selectTabByIndex', function(event, index) {
      $scope.selectTabByIndex(event, index);
    });
  }
  $scope.selectTabByIndex = function(event, index) {
    if (index === $scope.selectedTabIndex)
      return;
    if (event.stopPropagation)
      event.stopPropagation();
    $scope.tabData[$scope.selectedTabIndex].selected = false;
    $scope.tabData[index].selected = true;
    $scope.selectedTabIndex = index;
    $rootScope.$broadcast($scope.register + '.selectTabByIndex', $scope.selectedTabIndex);
  }
}).directive('snTab', function() {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    replace: 'true',
    scope: {
      tabData: '=',
      index: '='
    },
    template: '',
    controller: 'snTab',
    link: function($scope, element, attrs) {
      $scope.register = attrs.register;
      attrs.$observe('register', function(value) {
        $scope.register = value;
        $scope.setupListeners();
      });
      $scope.bounceTab = function() {
        alert('Bounce Tab at Index: ' + $scope.index);
      }
    }
  }
}).controller('snTab', function($scope) {
  $scope.selectTabByIndex = function(index) {
    $scope.$emit($scope.register + '.selectTabByIndex', index);
  }
  $scope.setupListeners = function() {
    $scope.$on($scope.register + '.showTabActivity', function(event, index, type) {
      $scope.showTabActivity(index, type);
    });
  }
  $scope.showTabActivity = function(index, type) {
    if ($scope.index !== index)
      return;
    switch (type) {
      case 'message':
        break;
      case 'error':
        break;
      default:
        $scope.bounceTab();
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snTextExpander.js */
angular.module('sn.common.ui').directive('snTextExpander', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('sn_text_expander.xml'),
    scope: {
      maxHeight: '&',
      value: '='
    },
    link: function compile(scope, element, attrs) {
      var container = angular.element(element).find('.textblock-content-container');
      var content = angular.element(element).find('.textblock-content');
      if (scope.maxHeight() === undefined) {
        scope.maxHeight = function() {
          return 100;
        }
      }
      container.css('overflow-y', 'hidden');
      container.css('max-height', scope.maxHeight() + 'px');
    },
    controller: function($scope, $element) {
      var container = $element.find('.textblock-content-container');
      var content = $element.find('.textblock-content');
      $scope.value = $scope.value || '';
      $scope.toggleExpand = function() {
        $scope.showMore = !$scope.showMore;
        if ($scope.showMore) {
          container.css('max-height', content.height());
        } else {
          container.css('max-height', $scope.maxHeight());
        }
      };
      $timeout(function() {
        if (content.height() > $scope.maxHeight()) {
          $scope.showToggle = true;
          $scope.showMore = false;
        }
      });
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snAttachmentPreview.js */
angular.module('sn.common.ui').directive('snAttachmentPreview', function(getTemplateUrl, snCustomEvent) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_attachment_preview.xml'),
    controller: function($scope) {
      snCustomEvent.observe('sn.attachment.preview', function(evt, attachment) {
        if (evt.stopPropagation)
          evt.stopPropagation();
        if (evt.preventDefault)
          evt.preventDefault();
        $scope.image = attachment;
        $scope.$broadcast('dialog.attachment_preview.show');
        return false;
      });
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/service.progressDialog.js */
angular.module('sn.common.ui').factory('progressDialog', ['$rootScope', '$compile', '$timeout', '$http', '$templateCache', 'nowServer', 'i18n', function($rootScope, $compile, $timeout, $http, $templateCache, nowServer, i18n) {
  'use strict';
  i18n.getMessages(['Close']);
  return {
    STATES: ["Pending", "Running", "Succeeded", "Failed", "Cancelled"],
    STATUS_IMAGES: ["images/workflow_skipped.gif", "images/loading_anim2.gifx",
      "images/progress_success.png", "images/progress_failure.png",
      'images/request_cancelled.gif'
    ],
    EXPAND_IMAGE: "images/icons/filter_hide.gif",
    COLLAPSE_IMAGE: "images/icons/filter_reveal.gif",
    BACK_IMAGE: "images/activity_filter_off.gif",
    TIMEOUT_INTERVAL: 750,
    _findChildMessage: function(statusObject) {
      if (!statusObject.children) return null;
      for (var i = 0; i < statusObject.children.length; i++) {
        var child = statusObject.children[i];
        if (child.state == '1') {
          var msg = child.message;
          var submsg = this._findChildMessage(child);
          if (submsg == null)
            return msg;
          else
            return null;
        } else if (child.state == '0') {
          return null;
        } else {}
      }
      return null;
    },
    create: function(scope, elemid, title, startCallback, endCallback, closeCallback) {
      var namespace = this;
      var progressItem = scope.$new(true);
      progressItem.id = elemid + "_progressDialog";
      progressItem.overlayVisible = true;
      progressItem.state = 0;
      progressItem.message = '';
      progressItem.percentComplete = 0;
      progressItem.enableChildMessages = false;
      if (!title) title = '';
      progressItem.title = title;
      progressItem.button_close = i18n.getMessage('Close');
      var overlayElement;
      overlayElement = $compile(
        '<div id="{{id}}" ng-show="overlayVisible" class="modal modal-mask" role="dialog" tabindex="-1">' +
        '<div class="modal-dialog m_progress_overlay_content">' +
        '<div class="modal-content">' +
        '<header class="modal-header">' +
        '<h4 class="modal-title">{{title}}</h4>' +
        '</header>' +
        '<div class="modal-body">' +
        '<div class="progress" ng-class="{\'progress-danger\': (state == 3)}">' +
        '<div class="progress-bar" ng-class="{\'progress-bar-danger\': (state == 3)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{percentComplete}}" ng-style="{width: percentComplete + \'%\'}">' +
        '</div>' +
        '</div>' +
        '<div>{{message}}<span style="float: right;" ng-show="state==1 || state == 2">{{percentComplete}}%</span></div>' +
        '</div>' +
        '<footer class="modal-footer">' +
        '<button class="btn btn-default sn-button sn-button-normal" ng-click="close()" ng-show="state > 1">{{button_close}}</button>' +
        '</footer>' +
        '</div>' +
        '</div>' +
        '</div>')(progressItem);
      $("body")[0].appendChild(overlayElement[0]);
      progressItem.setEnableChildMessages = function(enableChildren) {
        progressItem.enableChildMessages = enableChildren;
      }
      progressItem.start = function(src, dataArray) {
        $http.post(src, dataArray).success(function(response) {
            progressItem.trackerId = response;
            try {
              if (startCallback) startCallback(response);
            } catch (e) {}
            $timeout(progressItem.checkProgress.bind(progressItem));
          })
          .error(function(response, status, headers, config) {
            progressItem.state = '3';
            if (endCallback) endCallback(response);
          });
      };
      progressItem.checkProgress = function() {
        var src = nowServer.getURL('progress_status', {
          sysparm_execution_id: this.trackerId
        });
        $http.post(src).success(function(response) {
            if ($.isEmptyObject(response)) {
              progressItem.state = '3';
              if (endCallback) endCallback(response);
              return;
            }
            progressItem.update(response);
            if (response.status == 'error' || response.state == '') {
              progressItem.state = '3';
              if (response.message)
                progressItem.message = response.message;
              else
                progressItem.message = response;
              if (endCallback) endCallback(response);
              return;
            }
            if (response.state == '0' || response.state == '1') {
              $timeout(progressItem.checkProgress.bind(progressItem), namespace.TIMEOUT_INTERVAL);
            } else {
              if (endCallback) endCallback(response);
            }
          })
          .error(function(response, status, headers, config) {
            progressItem.state = '3';
            progressItem.message = response;
            if (endCallback) endCallback(response);
          });
      };
      progressItem.update = function(statusObject) {
        var msg = statusObject.message;
        if (progressItem.enableChildMessages) {
          var childMsg = namespace._findChildMessage(statusObject);
          if (childMsg != null)
            msg = childMsg;
        }
        this.message = msg;
        this.state = statusObject.state;
        this.percentComplete = statusObject.percent_complete;
      };
      progressItem.close = function(ev) {
        try {
          if (closeCallback) closeCallback();
        } catch (e) {}
        $("body")[0].removeChild($("#" + this.id)[0]);
        delete namespace.progressItem;
      };
      return progressItem;
    }
  }
}]);;
/*! RESOURCE: /scripts/sn/common/ui/factory.paneManager.js */
angular.module("sn.common.ui").factory("paneManager", ['$timeout', 'userPreferences', 'snCustomEvent', function($timeout, userPreferences, snCustomEvent) {
  "use strict";
  var paneIndex = {};

  function registerPane(paneName) {
    if (!paneName in paneIndex) {
      paneIndex[paneName] = false;
    }
    userPreferences.getPreference(paneName + '.opened').then(function(value) {
      var isOpen = value !== 'false';
      if (isOpen) {
        togglePane(paneName);
      }
    });
  }

  function togglePane(paneName) {
    for (var currentPane in paneIndex) {
      if (paneName != currentPane && paneIndex[currentPane]) {
        CustomEvent.fireTop(currentPane + '.toggle');
        saveState(currentPane, false);
      }
    }
    snCustomEvent.fireTop(paneName + '.toggle');
    saveState(paneName, !paneIndex[paneName]);
  };

  function saveState(paneName, state) {
    paneIndex[paneName] = state;
    userPreferences.setPreference(paneName + '.opened', state);
  }
  return {
    registerPane: registerPane,
    togglePane: togglePane
  };
}]);;
/*! RESOURCE: /scripts/sn/common/ui/directive.snBootstrapPopover.js */
angular.module('sn.common.ui').directive('snBootstrapPopover', function($timeout, $compile, $rootScope) {
      'use strict';
      return {
        restrict: 'A',
        link: function(scope, element) {
            element.on('click.snBootstrapPopover', function(event) {
              $rootScope.$broadcast('sn-bootstrap-popover.close-other-popovers');
              createPopover(event);
            });
            element.on('keypress.snBootstrapPopover', function(event) {
              if (event.keyCode == 9)
                return;
              scope.$broadcast('sn-bootstrap-popover.close-other-popovers');
              createPopover(event);
            });
            var popoverOpen = false;

            function _hidePopover() {
              popoverOpen = false;
              var api = element.data('bs.popover');
              if (api) {
                api.hide();
                element.off('.popover').removeData('bs.popover');
                element.data('bs.popover', void(0));
              }
            }

            function _openPopover() {
              $timeout(function() {
                popoverOpen = true;
                element.on('hidden.bs.popover', function() {
                  _hidePopover();
                  popoverOpen = false;
                });
                element.popover('show');
              }, 0, false);
            }

            function createPopover(evt) {
              angular.element('.popover').each(function() {
                    var object = angular.element(this);
                    if (!object.is(evt.target) && object.has(evt.target).length === 0 && angular.element('.popover').h