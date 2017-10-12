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
                          c[k] =