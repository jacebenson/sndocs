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
            c.getTruste