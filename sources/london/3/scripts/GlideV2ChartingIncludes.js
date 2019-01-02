/*! RESOURCE: /scripts/GlideV2ChartingIncludes.js */
/*! RESOURCE: /scripts/lib/jquery2_includes.js */
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function() {
  if (!window.jQuery)
    return;
  if (!window.$j_glide)
    window.$j = jQuery.noConflict();
  if (window.$j_glide && jQuery != window.$j_glide) {
    if (window.$j_glide)
      jQuery.noConflict(true);
    window.$j = window.$j_glide;
  }
})();;
/*! RESOURCE: /scripts/lib/jquery/jquery-2.2.3.min.js */
/*! jQuery v2.2.3 | (c) jQuery Foundation | jquery.org/license */
! function(a, b) {
  "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function(a) {
    if (!a.document) throw new Error("jQuery requires a window with a document");
    return b(a)
  } : b(a)
}("undefined" != typeof window ? window : this, function(a, b) {
  var c = [],
    d = a.document,
    e = c.slice,
    f = c.concat,
    g = c.push,
    h = c.indexOf,
    i = {},
    j = i.toString,
    k = i.hasOwnProperty,
    l = {},
    m = "2.2.3",
    n = function(a, b) {
      return new n.fn.init(a, b)
    },
    o = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
    p = /^-ms-/,
    q = /-([\da-z])/gi,
    r = function(a, b) {
      return b.toUpperCase()
    };
  n.fn = n.prototype = {
    jquery: m,
    constructor: n,
    selector: "",
    length: 0,
    toArray: function() {
      return e.call(this)
    },
    get: function(a) {
      return null != a ? 0 > a ? this[a + this.length] : this[a] : e.call(this)
    },
    pushStack: function(a) {
      var b = n.merge(this.constructor(), a);
      return b.prevObject = this, b.context = this.context, b
    },
    each: function(a) {
      return n.each(this, a)
    },
    map: function(a) {
      return this.pushStack(n.map(this, function(b, c) {
        return a.call(b, c, b)
      }))
    },
    slice: function() {
      return this.pushStack(e.apply(this, arguments))
    },
    first: function() {
      return this.eq(0)
    },
    last: function() {
      return this.eq(-1)
    },
    eq: function(a) {
      var b = this.length,
        c = +a + (0 > a ? b : 0);
      return this.pushStack(c >= 0 && b > c ? [this[c]] : [])
    },
    end: function() {
      return this.prevObject || this.constructor()
    },
    push: g,
    sort: c.sort,
    splice: c.splice
  }, n.extend = n.fn.extend = function() {
    var a, b, c, d, e, f, g = arguments[0] || {},
      h = 1,
      i = arguments.length,
      j = !1;
    for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || n.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++)
      if (null != (a = arguments[h]))
        for (b in a) c = g[b], d = a[b], g !== d && (j && d && (n.isPlainObject(d) || (e = n.isArray(d))) ? (e ? (e = !1, f = c && n.isArray(c) ? c : []) : f = c && n.isPlainObject(c) ? c : {}, g[b] = n.extend(j, f, d)) : void 0 !== d && (g[b] = d));
    return g
  }, n.extend({
    expando: "jQuery" + (m + Math.random()).replace(/\D/g, ""),
    isReady: !0,
    error: function(a) {
      throw new Error(a)
    },
    noop: function() {},
    isFunction: function(a) {
      return "function" === n.type(a)
    },
    isArray: Array.isArray,
    isWindow: function(a) {
      return null != a && a === a.window
    },
    isNumeric: function(a) {
      var b = a && a.toString();
      return !n.isArray(a) && b - parseFloat(b) + 1 >= 0
    },
    isPlainObject: function(a) {
      var b;
      if ("object" !== n.type(a) || a.nodeType || n.isWindow(a)) return !1;
      if (a.constructor && !k.call(a, "constructor") && !k.call(a.constructor.prototype || {}, "isPrototypeOf")) return !1;
      for (b in a);
      return void 0 === b || k.call(a, b)
    },
    isEmptyObject: function(a) {
      var b;
      for (b in a) return !1;
      return !0
    },
    type: function(a) {
      return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? i[j.call(a)] || "object" : typeof a
    },
    globalEval: function(a) {
      var b, c = eval;
      a = n.trim(a), a && (1 === a.indexOf("use strict") ? (b = d.createElement("script"), b.text = a, d.head.appendChild(b).parentNode.removeChild(b)) : c(a))
    },
    camelCase: function(a) {
      return a.replace(p, "ms-").replace(q, r)
    },
    nodeName: function(a, b) {
      return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase()
    },
    each: function(a, b) {
      var c, d = 0;
      if (s(a)) {
        for (c = a.length; c > d; d++)
          if (b.call(a[d], d, a[d]) === !1) break
      } else
        for (d in a)
          if (b.call(a[d], d, a[d]) === !1) break;
      return a
    },
    trim: function(a) {
      return null == a ? "" : (a + "").replace(o, "")
    },
    makeArray: function(a, b) {
      var c = b || [];
      return null != a && (s(Object(a)) ? n.merge(c, "string" == typeof a ? [a] : a) : g.call(c, a)), c
    },
    inArray: function(a, b, c) {
      return null == b ? -1 : h.call(b, a, c)
    },
    merge: function(a, b) {
      for (var c = +b.length, d = 0, e = a.length; c > d; d++) a[e++] = b[d];
      return a.length = e, a
    },
    grep: function(a, b, c) {
      for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++) d = !b(a[f], f), d !== h && e.push(a[f]);
      return e
    },
    map: function(a, b, c) {
      var d, e, g = 0,
        h = [];
      if (s(a))
        for (d = a.length; d > g; g++) e = b(a[g], g, c), null != e && h.push(e);
      else
        for (g in a) e = b(a[g], g, c), null != e && h.push(e);
      return f.apply([], h)
    },
    guid: 1,
    proxy: function(a, b) {
      var c, d, f;
      return "string" == typeof b && (c = a[b], b = a, a = c), n.isFunction(a) ? (d = e.call(arguments, 2), f = function() {
        return a.apply(b || this, d.concat(e.call(arguments)))
      }, f.guid = a.guid = a.guid || n.guid++, f) : void 0
    },
    now: Date.now,
    support: l
  }), "function" == typeof Symbol && (n.fn[Symbol.iterator] = c[Symbol.iterator]), n.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(a, b) {
    i["[object " + b + "]"] = b.toLowerCase()
  });

  function s(a) {
    var b = !!a && "length" in a && a.length,
      c = n.type(a);
    return "function" === c || n.isWindow(a) ? !1 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a
  }
  var t = function(a) {
    var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u = "sizzle" + 1 * new Date,
      v = a.document,
      w = 0,
      x = 0,
      y = ga(),
      z = ga(),
      A = ga(),
      B = function(a, b) {
        return a === b && (l = !0), 0
      },
      C = 1 << 31,
      D = {}.hasOwnProperty,
      E = [],
      F = E.pop,
      G = E.push,
      H = E.push,
      I = E.slice,
      J = function(a, b) {
        for (var c = 0, d = a.length; d > c; c++)
          if (a[c] === b) return c;
        return -1
      },
      K = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
      L = "[\\x20\\t\\r\\n\\f]",
      M = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
      N = "\\[" + L + "*(" + M + ")(?:" + L + "*([*^$|!~]?=)" + L + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + M + "))|)" + L + "*\\]",
      O = ":(" + M + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + N + ")*)|.*)\\)|)",
      P = new RegExp(L + "+", "g"),
      Q = new RegExp("^" + L + "+|((?:^|[^\\\\])(?:\\\\.)*)" + L + "+$", "g"),
      R = new RegExp("^" + L + "*," + L + "*"),
      S = new RegExp("^" + L + "*([>+~]|" + L + ")" + L + "*"),
      T = new RegExp("=" + L + "*([^\\]'\"]*?)" + L + "*\\]", "g"),
      U = new RegExp(O),
      V = new RegExp("^" + M + "$"),
      W = {
        ID: new RegExp("^#(" + M + ")"),
        CLASS: new RegExp("^\\.(" + M + ")"),
        TAG: new RegExp("^(" + M + "|[*])"),
        ATTR: new RegExp("^" + N),
        PSEUDO: new RegExp("^" + O),
        CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + L + "*(even|odd|(([+-]|)(\\d*)n|)" + L + "*(?:([+-]|)" + L + "*(\\d+)|))" + L + "*\\)|)", "i"),
        bool: new RegExp("^(?:" + K + ")$", "i"),
        needsContext: new RegExp("^" + L + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + L + "*((?:-\\d)?\\d*)" + L + "*\\)|)(?=[^-]|$)", "i")
      },
      X = /^(?:input|select|textarea|button)$/i,
      Y = /^h\d$/i,
      Z = /^[^{]+\{\s*\[native \w/,
      $ = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
      _ = /[+~]/,
      aa = /'|\\/g,
      ba = new RegExp("\\\\([\\da-f]{1,6}" + L + "?|(" + L + ")|.)", "ig"),
      ca = function(a, b, c) {
        var d = "0x" + b - 65536;
        return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320)
      },
      da = function() {
        m()
      };
    try {
      H.apply(E = I.call(v.childNodes), v.childNodes), E[v.childNodes.length].nodeType
    } catch (ea) {
      H = {
        apply: E.length ? function(a, b) {
          G.apply(a, I.call(b))
        } : function(a, b) {
          var c = a.length,
            d = 0;
          while (a[c++] = b[d++]);
          a.length = c - 1
        }
      }
    }

    function fa(a, b, d, e) {
      var f, h, j, k, l, o, r, s, w = b && b.ownerDocument,
        x = b ? b.nodeType : 9;
      if (d = d || [], "string" != typeof a || !a || 1 !== x && 9 !== x && 11 !== x) return d;
      if (!e && ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, p)) {
        if (11 !== x && (o = $.exec(a)))
          if (f = o[1]) {
            if (9 === x) {
              if (!(j = b.getElementById(f))) return d;
              if (j.id === f) return d.push(j), d
            } else if (w && (j = w.getElementById(f)) && t(b, j) && j.id === f) return d.push(j), d
          } else {
            if (o[2]) return H.apply(d, b.getElementsByTagName(a)), d;
            if ((f = o[3]) && c.getElementsByClassName && b.getElementsByClassName) return H.apply(d, b.getElementsByClassName(f)), d
          }
        if (c.qsa && !A[a + " "] && (!q || !q.test(a))) {
          if (1 !== x) w = b, s = a;
          else if ("object" !== b.nodeName.toLowerCase()) {
            (k = b.getAttribute("id")) ? k = k.replace(aa, "\\$&"): b.setAttribute("id", k = u), r = g(a), h = r.length, l = V.test(k) ? "#" + k : "[id='" + k + "']";
            while (h--) r[h] = l + " " + qa(r[h]);
            s = r.join(","), w = _.test(a) && oa(b.parentNode) || b
          }
          if (s) try {
            return H.apply(d, w.querySelectorAll(s)), d
          } catch (y) {} finally {
            k === u && b.removeAttribute("id")
          }
        }
      }
      return i(a.replace(Q, "$1"), b, d, e)
    }

    function ga() {
      var a = [];

      function b(c, e) {
        return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e
      }
      return b
    }

    function ha(a) {
      return a[u] = !0, a
    }

    function ia(a) {
      var b = n.createElement("div");
      try {
        return !!a(b)
      } catch (c) {
        return !1
      } finally {
        b.parentNode && b.parentNode.removeChild(b), b = null
      }
    }

    function ja(a, b) {
      var c = a.split("|"),
        e = c.length;
      while (e--) d.attrHandle[c[e]] = b
    }

    function ka(a, b) {
      var c = b && a,
        d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || C) - (~a.sourceIndex || C);
      if (d) return d;
      if (c)
        while (c = c.nextSibling)
          if (c === b) return -1;
      return a ? 1 : -1
    }

    function la(a) {
      return function(b) {
        var c = b.nodeName.toLowerCase();
        return "input" === c && b.type === a
      }
    }

    function ma(a) {
      return function(b) {
        var c = b.nodeName.toLowerCase();
        return ("input" === c || "button" === c) && b.type === a
      }
    }

    function na(a) {
      return ha(function(b) {
        return b = +b, ha(function(c, d) {
          var e, f = a([], c.length, b),
            g = f.length;
          while (g--) c[e = f[g]] && (c[e] = !(d[e] = c[e]))
        })
      })
    }

    function oa(a) {
      return a && "undefined" != typeof a.getElementsByTagName && a
    }
    c = fa.support = {}, f = fa.isXML = function(a) {
      var b = a && (a.ownerDocument || a).documentElement;
      return b ? "HTML" !== b.nodeName : !1
    }, m = fa.setDocument = function(a) {
      var b, e, g = a ? a.ownerDocument || a : v;
      return g !== n && 9 === g.nodeType && g.documentElement ? (n = g, o = n.documentElement, p = !f(n), (e = n.defaultView) && e.top !== e && (e.addEventListener ? e.addEventListener("unload", da, !1) : e.attachEvent && e.attachEvent("onunload", da)), c.attributes = ia(function(a) {
        return a.className = "i", !a.getAttribute("className")
      }), c.getElementsByTagName = ia(function(a) {
        return a.appendChild(n.createComment("")), !a.getElementsByTagName("*").length
      }), c.getElementsByClassName = Z.test(n.getElementsByClassName), c.getById = ia(function(a) {
        return o.appendChild(a).id = u, !n.getElementsByName || !n.getElementsByName(u).length
      }), c.getById ? (d.find.ID = function(a, b) {
        if ("undefined" != typeof b.getElementById && p) {
          var c = b.getElementById(a);
          return c ? [c] : []
        }
      }, d.filter.ID = function(a) {
        var b = a.replace(ba, ca);
        return function(a) {
          return a.getAttribute("id") === b
        }
      }) : (delete d.find.ID, d.filter.ID = function(a) {
        var b = a.replace(ba, ca);
        return function(a) {
          var c = "undefined" != typeof a.getAttributeNode && a.getAttributeNode("id");
          return c && c.value === b
        }
      }), d.find.TAG = c.getElementsByTagName ? function(a, b) {
        return "undefined" != typeof b.getElementsByTagName ? b.getElementsByTagName(a) : c.qsa ? b.querySelectorAll(a) : void 0
      } : function(a, b) {
        var c, d = [],
          e = 0,
          f = b.getElementsByTagName(a);
        if ("*" === a) {
          while (c = f[e++]) 1 === c.nodeType && d.push(c);
          return d
        }
        return f
      }, d.find.CLASS = c.getElementsByClassName && function(a, b) {
        return "undefined" != typeof b.getElementsByClassName && p ? b.getElementsByClassName(a) : void 0
      }, r = [], q = [], (c.qsa = Z.test(n.querySelectorAll)) && (ia(function(a) {
        o.appendChild(a).innerHTML = "<a id='" + u + "'></a><select id='" + u + "-\r\\' msallowcapture=''><option selected=''></option></select>", a.querySelectorAll("[msallowcapture^='']").length && q.push("[*^$]=" + L + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || q.push("\\[" + L + "*(?:value|" + K + ")"), a.querySelectorAll("[id~=" + u + "-]").length || q.push("~="), a.querySelectorAll(":checked").length || q.push(":checked"), a.querySelectorAll("a#" + u + "+*").length || q.push(".#.+[+~]")
      }), ia(function(a) {
        var b = n.createElement("input");
        b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && q.push("name" + L + "*[*^$|!~]?="), a.querySelectorAll(":enabled").length || q.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), q.push(",.*:")
      })), (c.matchesSelector = Z.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && ia(function(a) {
        c.disconnectedMatch = s.call(a, "div"), s.call(a, "[s!='']:x"), r.push("!=", O)
      }), q = q.length && new RegExp(q.join("|")), r = r.length && new RegExp(r.join("|")), b = Z.test(o.compareDocumentPosition), t = b || Z.test(o.contains) ? function(a, b) {
        var c = 9 === a.nodeType ? a.documentElement : a,
          d = b && b.parentNode;
        return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)))
      } : function(a, b) {
        if (b)
          while (b = b.parentNode)
            if (b === a) return !0;
        return !1
      }, B = b ? function(a, b) {
        if (a === b) return l = !0, 0;
        var d = !a.compareDocumentPosition - !b.compareDocumentPosition;
        return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === n || a.ownerDocument === v && t(v, a) ? -1 : b === n || b.ownerDocument === v && t(v, b) ? 1 : k ? J(k, a) - J(k, b) : 0 : 4 & d ? -1 : 1)
      } : function(a, b) {
        if (a === b) return l = !0, 0;
        var c, d = 0,
          e = a.parentNode,
          f = b.parentNode,
          g = [a],
          h = [b];
        if (!e || !f) return a === n ? -1 : b === n ? 1 : e ? -1 : f ? 1 : k ? J(k, a) - J(k, b) : 0;
        if (e === f) return ka(a, b);
        c = a;
        while (c = c.parentNode) g.unshift(c);
        c = b;
        while (c = c.parentNode) h.unshift(c);
        while (g[d] === h[d]) d++;
        return d ? ka(g[d], h[d]) : g[d] === v ? -1 : h[d] === v ? 1 : 0
      }, n) : n
    }, fa.matches = function(a, b) {
      return fa(a, null, null, b)
    }, fa.matchesSelector = function(a, b) {
      if ((a.ownerDocument || a) !== n && m(a), b = b.replace(T, "='$1']"), c.matchesSelector && p && !A[b + " "] && (!r || !r.test(b)) && (!q || !q.test(b))) try {
        var d = s.call(a, b);
        if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d
      } catch (e) {}
      return fa(b, n, null, [a]).length > 0
    }, fa.contains = function(a, b) {
      return (a.ownerDocument || a) !== n && m(a), t(a, b)
    }, fa.attr = function(a, b) {
      (a.ownerDocument || a) !== n && m(a);
      var e = d.attrHandle[b.toLowerCase()],
        f = e && D.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0;
      return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null
    }, fa.error = function(a) {
      throw new Error("Syntax error, unrecognized expression: " + a)
    }, fa.uniqueSort = function(a) {
      var b, d = [],
        e = 0,
        f = 0;
      if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) {
        while (b = a[f++]) b === a[f] && (e = d.push(f));
        while (e--) a.splice(d[e], 1)
      }
      return k = null, a
    }, e = fa.getText = function(a) {
      var b, c = "",
        d = 0,
        f = a.nodeType;
      if (f) {
        if (1 === f || 9 === f || 11 === f) {
          if ("string" == typeof a.textContent) return a.textContent;
          for (a = a.firstChild; a; a = a.nextSibling) c += e(a)
        } else if (3 === f || 4 === f) return a.nodeValue
      } else
        while (b = a[d++]) c += e(b);
      return c
    }, d = fa.selectors = {
      cacheLength: 50,
      createPseudo: ha,
      match: W,
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
        ATTR: function(a) {
          return a[1] = a[1].replace(ba, ca), a[3] = (a[3] || a[4] || a[5] || "").replace(ba, ca), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4)
        },
        CHILD: function(a) {
          return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || fa.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && fa.error(a[0]), a
        },
        PSEUDO: function(a) {
          var b, c = !a[6] && a[2];
          return W.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && U.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3))
        }
      },
      filter: {
        TAG: function(a) {
          var b = a.replace(ba, ca).toLowerCase();
          return "*" === a ? function() {
            return !0
          } : function(a) {
            return a.nodeName && a.nodeName.toLowerCase() === b
          }
        },
        CLASS: function(a) {
          var b = y[a + " "];
          return b || (b = new RegExp("(^|" + L + ")" + a + "(" + L + "|$)")) && y(a, function(a) {
            return b.test("string" == typeof a.className && a.className || "undefined" != typeof a.getAttribute && a.getAttribute("class") || "")
          })
        },
        ATTR: function(a, b, c) {
          return function(d) {
            var e = fa.attr(d, a);
            return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e.replace(P, " ") + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0
          }
        },
        CHILD: function(a, b, c, d, e) {
          var f = "nth" !== a.slice(0, 3),
            g = "last" !== a.slice(-4),
            h = "of-type" === b;
          return 1 === d && 0 === e ? function(a) {
            return !!a.parentNode
          } : function(b, c, i) {
            var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling",
              q = b.parentNode,
              r = h && b.nodeName.toLowerCase(),
              s = !i && !h,
              t = !1;
            if (q) {
              if (f) {
                while (p) {
                  m = b;
                  while (m = m[p])
                    if (h ? m.nodeName.toLowerCase() === r : 1 === m.nodeType) return !1;
                  o = p = "only" === a && !o && "nextSibling"
                }
                return !0
              }
              if (o = [g ? q.firstChild : q.lastChild], g && s) {
                m = q, l = m[u] || (m[u] = {}), k = l[m.uniqueID] || (l[m.uniqueID] = {}), j = k[a] || [], n = j[0] === w && j[1], t = n && j[2], m = n && q.childNodes[n];
                while (m = ++n && m && m[p] || (t = n = 0) || o.pop())
                  if (1 === m.nodeType && ++t && m === b) {
                    k[a] = [w, n, t];
                    break
                  }
              } else if (s && (m = b, l = m[u] || (m[u] = {}), k = l[m.uniqueID] || (l[m.uniqueID] = {}), j = k[a] || [], n = j[0] === w && j[1], t = n), t === !1)
                while (m = ++n && m && m[p] || (t = n = 0) || o.pop())
                  if ((h ? m.nodeName.toLowerCase() === r : 1 === m.nodeType) && ++t && (s && (l = m[u] || (m[u] = {}), k = l[m.uniqueID] || (l[m.uniqueID] = {}), k[a] = [w, t]), m === b)) break;
              return t -= e, t === d || t % d === 0 && t / d >= 0
            }
          }
        },
        PSEUDO: function(a, b) {
          var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || fa.error("unsupported pseudo: " + a);
          return e[u] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? ha(function(a, c) {
            var d, f = e(a, b),
              g = f.length;
            while (g--) d = J(a, f[g]), a[d] = !(c[d] = f[g])
          }) : function(a) {
            return e(a, 0, c)
          }) : e
        }
      },
      pseudos: {
        not: ha(function(a) {
          var b = [],
            c = [],
            d = h(a.replace(Q, "$1"));
          return d[u] ? ha(function(a, b, c, e) {
            var f, g = d(a, null, e, []),
              h = a.length;
            while (h--)(f = g[h]) && (a[h] = !(b[h] = f))
          }) : function(a, e, f) {
            return b[0] = a, d(b, null, f, c), b[0] = null, !c.pop()
          }
        }),
        has: ha(function(a) {
          return function(b) {
            return fa(a, b).length > 0
          }
        }),
        contains: ha(function(a) {
          return a = a.replace(ba, ca),
            function(b) {
              return (b.textContent || b.innerText || e(b)).indexOf(a) > -1
            }
        }),
        lang: ha(function(a) {
          return V.test(a || "") || fa.error("unsupported lang: " + a), a = a.replace(ba, ca).toLowerCase(),
            function(b) {
              var c;
              do
                if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType);
              return !1
            }
        }),
        target: function(b) {
          var c = a.location && a.location.hash;
          return c && c.slice(1) === b.id
        },
        root: function(a) {
          return a === o
        },
        focus: function(a) {
          return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex)
        },
        enabled: function(a) {
          return a.disabled === !1
        },
        disabled: function(a) {
          return a.disabled === !0
        },
        checked: function(a) {
          var b = a.nodeName.toLowerCase();
          return "input" === b && !!a.checked || "option" === b && !!a.selected
        },
        selected: function(a) {
          return a.parentNode && a.parentNode.selectedIndex, a.selected === !0
        },
        empty: function(a) {
          for (a = a.firstChild; a; a = a.nextSibling)
            if (a.nodeType < 6) return !1;
          return !0
        },
        parent: function(a) {
          return !d.pseudos.empty(a)
        },
        header: function(a) {
          return Y.test(a.nodeName)
        },
        input: function(a) {
          return X.test(a.nodeName)
        },
        button: function(a) {
          var b = a.nodeName.toLowerCase();
          return "input" === b && "button" === a.type || "button" === b
        },
        text: function(a) {
          var b;
          return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase())
        },
        first: na(function() {
          return [0]
        }),
        last: na(function(a, b) {
          return [b - 1]
        }),
        eq: na(function(a, b, c) {
          return [0 > c ? c + b : c]
        }),
        even: na(function(a, b) {
          for (var c = 0; b > c; c += 2) a.push(c);
          return a
        }),
        odd: na(function(a, b) {
          for (var c = 1; b > c; c += 2) a.push(c);
          return a
        }),
        lt: na(function(a, b, c) {
          for (var d = 0 > c ? c + b : c; --d >= 0;) a.push(d);
          return a
        }),
        gt: na(function(a, b, c) {
          for (var d = 0 > c ? c + b : c; ++d < b;) a.push(d);
          return a
        })
      }
    }, d.pseudos.nth = d.pseudos.eq;
    for (b in {
        radio: !0,
        checkbox: !0,
        file: !0,
        password: !0,
        image: !0
      }) d.pseudos[b] = la(b);
    for (b in {
        submit: !0,
        reset: !0
      }) d.pseudos[b] = ma(b);

    function pa() {}
    pa.prototype = d.filters = d.pseudos, d.setFilters = new pa, g = fa.tokenize = function(a, b) {
      var c, e, f, g, h, i, j, k = z[a + " "];
      if (k) return b ? 0 : k.slice(0);
      h = a, i = [], j = d.preFilter;
      while (h) {
        c && !(e = R.exec(h)) || (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = S.exec(h)) && (c = e.shift(), f.push({
          value: c,
          type: e[0].replace(Q, " ")
        }), h = h.slice(c.length));
        for (g in d.filter) !(e = W[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({
          value: c,
          type: g,
          matches: e
        }), h = h.slice(c.length));
        if (!c) break
      }
      return b ? h.length : h ? fa.error(a) : z(a, i).slice(0)
    };

    function qa(a) {
      for (var b = 0, c = a.length, d = ""; c > b; b++) d += a[b].value;
      return d
    }

    function ra(a, b, c) {
      var d = b.dir,
        e = c && "parentNode" === d,
        f = x++;
      return b.first ? function(b, c, f) {
        while (b = b[d])
          if (1 === b.nodeType || e) return a(b, c, f)
      } : function(b, c, g) {
        var h, i, j, k = [w, f];
        if (g) {
          while (b = b[d])
            if ((1 === b.nodeType || e) && a(b, c, g)) return !0
        } else
          while (b = b[d])
            if (1 === b.nodeType || e) {
              if (j = b[u] || (b[u] = {}), i = j[b.uniqueID] || (j[b.uniqueID] = {}), (h = i[d]) && h[0] === w && h[1] === f) return k[2] = h[2];
              if (i[d] = k, k[2] = a(b, c, g)) return !0
            }
      }
    }

    function sa(a) {
      return a.length > 1 ? function(b, c, d) {
        var e = a.length;
        while (e--)
          if (!a[e](b, c, d)) return !1;
        return !0
      } : a[0]
    }

    function ta(a, b, c) {
      for (var d = 0, e = b.length; e > d; d++) fa(a, b[d], c);
      return c
    }

    function ua(a, b, c, d, e) {
      for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++)(f = a[h]) && (c && !c(f, d, e) || (g.push(f), j && b.push(h)));
      return g
    }

    function va(a, b, c, d, e, f) {
      return d && !d[u] && (d = va(d)), e && !e[u] && (e = va(e, f)), ha(function(f, g, h, i) {
        var j, k, l, m = [],
          n = [],
          o = g.length,
          p = f || ta(b || "*", h.nodeType ? [h] : h, []),
          q = !a || !f && b ? p : ua(p, m, a, h, i),
          r = c ? e || (f ? a : o || d) ? [] : g : q;
        if (c && c(q, r, h, i), d) {
          j = ua(r, n), d(j, [], h, i), k = j.length;
          while (k--)(l = j[k]) && (r[n[k]] = !(q[n[k]] = l))
        }
        if (f) {
          if (e || a) {
            if (e) {
              j = [], k = r.length;
              while (k--)(l = r[k]) && j.push(q[k] = l);
              e(null, r = [], j, i)
            }
            k = r.length;
            while (k--)(l = r[k]) && (j = e ? J(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l))
          }
        } else r = ua(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : H.apply(g, r)
      })
    }

    function wa(a) {
      for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = ra(function(a) {
          return a === b
        }, h, !0), l = ra(function(a) {
          return J(b, a) > -1
        }, h, !0), m = [function(a, c, d) {
          var e = !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d));
          return b = null, e
        }]; f > i; i++)
        if (c = d.relative[a[i].type]) m = [ra(sa(m), c)];
        else {
          if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) {
            for (e = ++i; f > e; e++)
              if (d.relative[a[e].type]) break;
            return va(i > 1 && sa(m), i > 1 && qa(a.slice(0, i - 1).concat({
              value: " " === a[i - 2].type ? "*" : ""
            })).replace(Q, "$1"), c, e > i && wa(a.slice(i, e)), f > e && wa(a = a.slice(e)), f > e && qa(a))
          }
          m.push(c)
        }
      return sa(m)
    }

    function xa(a, b) {
      var c = b.length > 0,
        e = a.length > 0,
        f = function(f, g, h, i, k) {
          var l, o, q, r = 0,
            s = "0",
            t = f && [],
            u = [],
            v = j,
            x = f || e && d.find.TAG("*", k),
            y = w += null == v ? 1 : Math.random() || .1,
            z = x.length;
          for (k && (j = g === n || g || k); s !== z && null != (l = x[s]); s++) {
            if (e && l) {
              o = 0, g || l.ownerDocument === n || (m(l), h = !p);
              while (q = a[o++])
                if (q(l, g || n, h)) {
                  i.push(l);
                  break
                }
              k && (w = y)
            }
            c && ((l = !q && l) && r--, f && t.push(l))
          }
          if (r += s, c && s !== r) {
            o = 0;
            while (q = b[o++]) q(t, u, g, h);
            if (f) {
              if (r > 0)
                while (s--) t[s] || u[s] || (u[s] = F.call(i));
              u = ua(u)
            }
            H.apply(i, u), k && !f && u.length > 0 && r + b.length > 1 && fa.uniqueSort(i)
          }
          return k && (w = y, j = v), t
        };
      return c ? ha(f) : f
    }
    return h = fa.compile = function(a, b) {
      var c, d = [],
        e = [],
        f = A[a + " "];
      if (!f) {
        b || (b = g(a)), c = b.length;
        while (c--) f = wa(b[c]), f[u] ? d.push(f) : e.push(f);
        f = A(a, xa(e, d)), f.selector = a
      }
      return f
    }, i = fa.select = function(a, b, e, f) {
      var i, j, k, l, m, n = "function" == typeof a && a,
        o = !f && g(a = n.selector || a);
      if (e = e || [], 1 === o.length) {
        if (j = o[0] = o[0].slice(0), j.length > 2 && "ID" === (k = j[0]).type && c.getById && 9 === b.nodeType && p && d.relative[j[1].type]) {
          if (b = (d.find.ID(k.matches[0].replace(ba, ca), b) || [])[0], !b) return e;
          n && (b = b.parentNode), a = a.slice(j.shift().value.length)
        }
        i = W.needsContext.test(a) ? 0 : j.length;
        while (i--) {
          if (k = j[i], d.relative[l = k.type]) break;
          if ((m = d.find[l]) && (f = m(k.matches[0].replace(ba, ca), _.test(j[0].type) && oa(b.parentNode) || b))) {
            if (j.splice(i, 1), a = f.length && qa(j), !a) return H.apply(e, f), e;
            break
          }
        }
      }
      return (n || h(a, o))(f, b, !p, e, !b || _.test(a) && oa(b.parentNode) || b), e
    }, c.sortStable = u.split("").sort(B).join("") === u, c.detectDuplicates = !!l, m(), c.sortDetached = ia(function(a) {
      return 1 & a.compareDocumentPosition(n.createElement("div"))
    }), ia(function(a) {
      return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href")
    }) || ja("type|href|height|width", function(a, b, c) {
      return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2)
    }), c.attributes && ia(function(a) {
      return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value")
    }) || ja("value", function(a, b, c) {
      return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue
    }), ia(function(a) {
      return null == a.getAttribute("disabled")
    }) || ja(K, function(a, b, c) {
      var d;
      return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null
    }), fa
  }(a);
  n.find = t, n.expr = t.selectors, n.expr[":"] = n.expr.pseudos, n.uniqueSort = n.unique = t.uniqueSort, n.text = t.getText, n.isXMLDoc = t.isXML, n.contains = t.contains;
  var u = function(a, b, c) {
      var d = [],
        e = void 0 !== c;
      while ((a = a[b]) && 9 !== a.nodeType)
        if (1 === a.nodeType) {
          if (e && n(a).is(c)) break;
          d.push(a)
        }
      return d
    },
    v = function(a, b) {
      for (var c = []; a; a = a.nextSibling) 1 === a.nodeType && a !== b && c.push(a);
      return c
    },
    w = n.expr.match.needsContext,
    x = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,
    y = /^.[^:#\[\.,]*$/;

  function z(a, b, c) {
    if (n.isFunction(b)) return n.grep(a, function(a, d) {
      return !!b.call(a, d, a) !== c
    });
    if (b.nodeType) return n.grep(a, function(a) {
      return a === b !== c
    });
    if ("string" == typeof b) {
      if (y.test(b)) return n.filter(b, a, c);
      b = n.filter(b, a)
    }
    return n.grep(a, function(a) {
      return h.call(b, a) > -1 !== c
    })
  }
  n.filter = function(a, b, c) {
    var d = b[0];
    return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? n.find.matchesSelector(d, a) ? [d] : [] : n.find.matches(a, n.grep(b, function(a) {
      return 1 === a.nodeType
    }))
  }, n.fn.extend({
    find: function(a) {
      var b, c = this.length,
        d = [],
        e = this;
      if ("string" != typeof a) return this.pushStack(n(a).filter(function() {
        for (b = 0; c > b; b++)
          if (n.contains(e[b], this)) return !0
      }));
      for (b = 0; c > b; b++) n.find(a, e[b], d);
      return d = this.pushStack(c > 1 ? n.unique(d) : d), d.selector = this.selector ? this.selector + " " + a : a, d
    },
    filter: function(a) {
      return this.pushStack(z(this, a || [], !1))
    },
    not: function(a) {
      return this.pushStack(z(this, a || [], !0))
    },
    is: function(a) {
      return !!z(this, "string" == typeof a && w.test(a) ? n(a) : a || [], !1).length
    }
  });
  var A, B = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
    C = n.fn.init = function(a, b, c) {
      var e, f;
      if (!a) return this;
      if (c = c || A, "string" == typeof a) {
        if (e = "<" === a[0] && ">" === a[a.length - 1] && a.length >= 3 ? [null, a, null] : B.exec(a), !e || !e[1] && b) return !b || b.jquery ? (b || c).find(a) : this.constructor(b).find(a);
        if (e[1]) {
          if (b = b instanceof n ? b[0] : b, n.merge(this, n.parseHTML(e[1], b && b.nodeType ? b.ownerDocument || b : d, !0)), x.test(e[1]) && n.isPlainObject(b))
            for (e in b) n.isFunction(this[e]) ? this[e](b[e]) : this.attr(e, b[e]);
          return this
        }
        return f = d.getElementById(e[2]), f && f.parentNode && (this.length = 1, this[0] = f), this.context = d, this.selector = a, this
      }
      return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : n.isFunction(a) ? void 0 !== c.ready ? c.ready(a) : a(n) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), n.makeArray(a, this))
    };
  C.prototype = n.fn, A = n(d);
  var D = /^(?:parents|prev(?:Until|All))/,
    E = {
      children: !0,
      contents: !0,
      next: !0,
      prev: !0
    };
  n.fn.extend({
    has: function(a) {
      var b = n(a, this),
        c = b.length;
      return this.filter(function() {
        for (var a = 0; c > a; a++)
          if (n.contains(this, b[a])) return !0
      })
    },
    closest: function(a, b) {
      for (var c, d = 0, e = this.length, f = [], g = w.test(a) || "string" != typeof a ? n(a, b || this.context) : 0; e > d; d++)
        for (c = this[d]; c && c !== b; c = c.parentNode)
          if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && n.find.matchesSelector(c, a))) {
            f.push(c);
            break
          }
      return this.pushStack(f.length > 1 ? n.uniqueSort(f) : f)
    },
    index: function(a) {
      return a ? "string" == typeof a ? h.call(n(a), this[0]) : h.call(this, a.jquery ? a[0] : a) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
    },
    add: function(a, b) {
      return this.pushStack(n.uniqueSort(n.merge(this.get(), n(a, b))))
    },
    addBack: function(a) {
      return this.add(null == a ? this.prevObject : this.prevObject.filter(a))
    }
  });

  function F(a, b) {
    while ((a = a[b]) && 1 !== a.nodeType);
    return a
  }
  n.each({
    parent: function(a) {
      var b = a.parentNode;
      return b && 11 !== b.nodeType ? b : null
    },
    parents: function(a) {
      return u(a, "parentNode")
    },
    parentsUntil: function(a, b, c) {
      return u(a, "parentNode", c)
    },
    next: function(a) {
      return F(a, "nextSibling")
    },
    prev: function(a) {
      return F(a, "previousSibling")
    },
    nextAll: function(a) {
      return u(a, "nextSibling")
    },
    prevAll: function(a) {
      return u(a, "previousSibling")
    },
    nextUntil: function(a, b, c) {
      return u(a, "nextSibling", c)
    },
    prevUntil: function(a, b, c) {
      return u(a, "previousSibling", c)
    },
    siblings: function(a) {
      return v((a.parentNode || {}).firstChild, a)
    },
    children: function(a) {
      return v(a.firstChild)
    },
    contents: function(a) {
      return a.contentDocument || n.merge([], a.childNodes)
    }
  }, function(a, b) {
    n.fn[a] = function(c, d) {
      var e = n.map(this, b, c);
      return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = n.filter(d, e)), this.length > 1 && (E[a] || n.uniqueSort(e), D.test(a) && e.reverse()), this.pushStack(e)
    }
  });
  var G = /\S+/g;

  function H(a) {
    var b = {};
    return n.each(a.match(G) || [], function(a, c) {
      b[c] = !0
    }), b
  }
  n.Callbacks = function(a) {
    a = "string" == typeof a ? H(a) : n.extend({}, a);
    var b, c, d, e, f = [],
      g = [],
      h = -1,
      i = function() {
        for (e = a.once, d = b = !0; g.length; h = -1) {
          c = g.shift();
          while (++h < f.length) f[h].apply(c[0], c[1]) === !1 && a.stopOnFalse && (h = f.length, c = !1)
        }
        a.memory || (c = !1), b = !1, e && (f = c ? [] : "")
      },
      j = {
        add: function() {
          return f && (c && !b && (h = f.length - 1, g.push(c)), function d(b) {
            n.each(b, function(b, c) {
              n.isFunction(c) ? a.unique && j.has(c) || f.push(c) : c && c.length && "string" !== n.type(c) && d(c)
            })
          }(arguments), c && !b && i()), this
        },
        remove: function() {
          return n.each(arguments, function(a, b) {
            var c;
            while ((c = n.inArray(b, f, c)) > -1) f.splice(c, 1), h >= c && h--
          }), this
        },
        has: function(a) {
          return a ? n.inArray(a, f) > -1 : f.length > 0
        },
        empty: function() {
          return f && (f = []), this
        },
        disable: function() {
          return e = g = [], f = c = "", this
        },
        disabled: function() {
          return !f
        },
        lock: function() {
          return e = g = [], c || (f = c = ""), this
        },
        locked: function() {
          return !!e
        },
        fireWith: function(a, c) {
          return e || (c = c || [], c = [a, c.slice ? c.slice() : c], g.push(c), b || i()), this
        },
        fire: function() {
          return j.fireWith(this, arguments), this
        },
        fired: function() {
          return !!d
        }
      };
    return j
  }, n.extend({
    Deferred: function(a) {
      var b = [
          ["resolve", "done", n.Callbacks("once memory"), "resolved"],
          ["reject", "fail", n.Callbacks("once memory"), "rejected"],
          ["notify", "progress", n.Callbacks("memory")]
        ],
        c = "pending",
        d = {
          state: function() {
            return c
          },
          always: function() {
            return e.done(arguments).fail(arguments), this
          },
          then: function() {
            var a = arguments;
            return n.Deferred(function(c) {
              n.each(b, function(b, f) {
                var g = n.isFunction(a[b]) && a[b];
                e[f[1]](function() {
                  var a = g && g.apply(this, arguments);
                  a && n.isFunction(a.promise) ? a.promise().progress(c.notify).done(c.resolve).fail(c.reject) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [a] : arguments)
                })
              }), a = null
            }).promise()
          },
          promise: function(a) {
            return null != a ? n.extend(a, d) : d
          }
        },
        e = {};
      return d.pipe = d.then, n.each(b, function(a, f) {
        var g = f[2],
          h = f[3];
        d[f[1]] = g.add, h && g.add(function() {
          c = h
        }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function() {
          return e[f[0] + "With"](this === e ? d : this, arguments), this
        }, e[f[0] + "With"] = g.fireWith
      }), d.promise(e), a && a.call(e, e), e
    },
    when: function(a) {
      var b = 0,
        c = e.call(arguments),
        d = c.length,
        f = 1 !== d || a && n.isFunction(a.promise) ? d : 0,
        g = 1 === f ? a : n.Deferred(),
        h = function(a, b, c) {
          return function(d) {
            b[a] = this, c[a] = arguments.length > 1 ? e.call(arguments) : d, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c)
          }
        },
        i, j, k;
      if (d > 1)
        for (i = new Array(d), j = new Array(d), k = new Array(d); d > b; b++) c[b] && n.isFunction(c[b].promise) ? c[b].promise().progress(h(b, j, i)).done(h(b, k, c)).fail(g.reject) : --f;
      return f || g.resolveWith(k, c), g.promise()
    }
  });
  var I;
  n.fn.ready = function(a) {
    return n.ready.promise().done(a), this
  }, n.extend({
    isReady: !1,
    readyWait: 1,
    holdReady: function(a) {
      a ? n.readyWait++ : n.ready(!0)
    },
    ready: function(a) {
      (a === !0 ? --n.readyWait : n.isReady) || (n.isReady = !0, a !== !0 && --n.readyWait > 0 || (I.resolveWith(d, [n]), n.fn.triggerHandler && (n(d).triggerHandler("ready"), n(d).off("ready"))))
    }
  });

  function J() {
    d.removeEventListener("DOMContentLoaded", J), a.removeEventListener("load", J), n.ready()
  }
  n.ready.promise = function(b) {
    return I || (I = n.Deferred(), "complete" === d.readyState || "loading" !== d.readyState && !d.documentElement.doScroll ? a.setTimeout(n.ready) : (d.addEventListener("DOMContentLoaded", J), a.addEventListener("load", J))), I.promise(b)
  }, n.ready.promise();
  var K = function(a, b, c, d, e, f, g) {
      var h = 0,
        i = a.length,
        j = null == c;
      if ("object" === n.type(c)) {
        e = !0;
        for (h in c) K(a, b, h, c[h], !0, f, g)
      } else if (void 0 !== d && (e = !0, n.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function(a, b, c) {
          return j.call(n(a), c)
        })), b))
        for (; i > h; h++) b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c)));
      return e ? a : j ? b.call(a) : i ? b(a[0], c) : f
    },
    L = function(a) {
      return 1 === a.nodeType || 9 === a.nodeType || !+a.nodeType
    };

  function M() {
    this.expando = n.expando + M.uid++
  }
  M.uid = 1, M.prototype = {
    register: function(a, b) {
      var c = b || {};
      return a.nodeType ? a[this.expando] = c : Object.defineProperty(a, this.expando, {
        value: c,
        writable: !0,
        configurable: !0
      }), a[this.expando]
    },
    cache: function(a) {
      if (!L(a)) return {};
      var b = a[this.expando];
      return b || (b = {}, L(a) && (a.nodeType ? a[this.expando] = b : Object.defineProperty(a, this.expando, {
        value: b,
        configurable: !0
      }))), b
    },
    set: function(a, b, c) {
      var d, e = this.cache(a);
      if ("string" == typeof b) e[b] = c;
      else
        for (d in b) e[d] = b[d];
      return e
    },
    get: function(a, b) {
      return void 0 === b ? this.cache(a) : a[this.expando] && a[this.expando][b]
    },
    access: function(a, b, c) {
      var d;
      return void 0 === b || b && "string" == typeof b && void 0 === c ? (d = this.get(a, b), void 0 !== d ? d : this.get(a, n.camelCase(b))) : (this.set(a, b, c), void 0 !== c ? c : b)
    },
    remove: function(a, b) {
      var c, d, e, f = a[this.expando];
      if (void 0 !== f) {
        if (void 0 === b) this.register(a);
        else {
          n.isArray(b) ? d = b.concat(b.map(n.camelCase)) : (e = n.camelCase(b), b in f ? d = [b, e] : (d = e, d = d in f ? [d] : d.match(G) || [])), c = d.length;
          while (c--) delete f[d[c]]
        }(void 0 === b || n.isEmptyObject(f)) && (a.nodeType ? a[this.expando] = void 0 : delete a[this.expando])
      }
    },
    hasData: function(a) {
      var b = a[this.expando];
      return void 0 !== b && !n.isEmptyObject(b)
    }
  };
  var N = new M,
    O = new M,
    P = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    Q = /[A-Z]/g;

  function R(a, b, c) {
    var d;
    if (void 0 === c && 1 === a.nodeType)
      if (d = "data-" + b.replace(Q, "-$&").toLowerCase(), c = a.getAttribute(d), "string" == typeof c) {
        try {
          c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : P.test(c) ? n.parseJSON(c) : c;
        } catch (e) {}
        O.set(a, b, c)
      } else c = void 0;
    return c
  }
  n.extend({
    hasData: function(a) {
      return O.hasData(a) || N.hasData(a)
    },
    data: function(a, b, c) {
      return O.access(a, b, c)
    },
    removeData: function(a, b) {
      O.remove(a, b)
    },
    _data: function(a, b, c) {
      return N.access(a, b, c)
    },
    _removeData: function(a, b) {
      N.remove(a, b)
    }
  }), n.fn.extend({
    data: function(a, b) {
      var c, d, e, f = this[0],
        g = f && f.attributes;
      if (void 0 === a) {
        if (this.length && (e = O.get(f), 1 === f.nodeType && !N.get(f, "hasDataAttrs"))) {
          c = g.length;
          while (c--) g[c] && (d = g[c].name, 0 === d.indexOf("data-") && (d = n.camelCase(d.slice(5)), R(f, d, e[d])));
          N.set(f, "hasDataAttrs", !0)
        }
        return e
      }
      return "object" == typeof a ? this.each(function() {
        O.set(this, a)
      }) : K(this, function(b) {
        var c, d;
        if (f && void 0 === b) {
          if (c = O.get(f, a) || O.get(f, a.replace(Q, "-$&").toLowerCase()), void 0 !== c) return c;
          if (d = n.camelCase(a), c = O.get(f, d), void 0 !== c) return c;
          if (c = R(f, d, void 0), void 0 !== c) return c
        } else d = n.camelCase(a), this.each(function() {
          var c = O.get(this, d);
          O.set(this, d, b), a.indexOf("-") > -1 && void 0 !== c && O.set(this, a, b)
        })
      }, null, b, arguments.length > 1, null, !0)
    },
    removeData: function(a) {
      return this.each(function() {
        O.remove(this, a)
      })
    }
  }), n.extend({
    queue: function(a, b, c) {
      var d;
      return a ? (b = (b || "fx") + "queue", d = N.get(a, b), c && (!d || n.isArray(c) ? d = N.access(a, b, n.makeArray(c)) : d.push(c)), d || []) : void 0
    },
    dequeue: function(a, b) {
      b = b || "fx";
      var c = n.queue(a, b),
        d = c.length,
        e = c.shift(),
        f = n._queueHooks(a, b),
        g = function() {
          n.dequeue(a, b)
        };
      "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire()
    },
    _queueHooks: function(a, b) {
      var c = b + "queueHooks";
      return N.get(a, c) || N.access(a, c, {
        empty: n.Callbacks("once memory").add(function() {
          N.remove(a, [b + "queue", c])
        })
      })
    }
  }), n.fn.extend({
    queue: function(a, b) {
      var c = 2;
      return "string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? n.queue(this[0], a) : void 0 === b ? this : this.each(function() {
        var c = n.queue(this, a, b);
        n._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && n.dequeue(this, a)
      })
    },
    dequeue: function(a) {
      return this.each(function() {
        n.dequeue(this, a)
      })
    },
    clearQueue: function(a) {
      return this.queue(a || "fx", [])
    },
    promise: function(a, b) {
      var c, d = 1,
        e = n.Deferred(),
        f = this,
        g = this.length,
        h = function() {
          --d || e.resolveWith(f, [f])
        };
      "string" != typeof a && (b = a, a = void 0), a = a || "fx";
      while (g--) c = N.get(f[g], a + "queueHooks"), c && c.empty && (d++, c.empty.add(h));
      return h(), e.promise(b)
    }
  });
  var S = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
    T = new RegExp("^(?:([+-])=|)(" + S + ")([a-z%]*)$", "i"),
    U = ["Top", "Right", "Bottom", "Left"],
    V = function(a, b) {
      return a = b || a, "none" === n.css(a, "display") || !n.contains(a.ownerDocument, a)
    };

  function W(a, b, c, d) {
    var e, f = 1,
      g = 20,
      h = d ? function() {
        return d.cur()
      } : function() {
        return n.css(a, b, "")
      },
      i = h(),
      j = c && c[3] || (n.cssNumber[b] ? "" : "px"),
      k = (n.cssNumber[b] || "px" !== j && +i) && T.exec(n.css(a, b));
    if (k && k[3] !== j) {
      j = j || k[3], c = c || [], k = +i || 1;
      do f = f || ".5", k /= f, n.style(a, b, k + j); while (f !== (f = h() / i) && 1 !== f && --g)
    }
    return c && (k = +k || +i || 0, e = c[1] ? k + (c[1] + 1) * c[2] : +c[2], d && (d.unit = j, d.start = k, d.end = e)), e
  }
  var X = /^(?:checkbox|radio)$/i,
    Y = /<([\w:-]+)/,
    Z = /^$|\/(?:java|ecma)script/i,
    $ = {
      option: [1, "<select multiple='multiple'>", "</select>"],
      thead: [1, "<table>", "</table>"],
      col: [2, "<table><colgroup>", "</colgroup></table>"],
      tr: [2, "<table><tbody>", "</tbody></table>"],
      td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
      _default: [0, "", ""]
    };
  $.optgroup = $.option, $.tbody = $.tfoot = $.colgroup = $.caption = $.thead, $.th = $.td;

  function _(a, b) {
    var c = "undefined" != typeof a.getElementsByTagName ? a.getElementsByTagName(b || "*") : "undefined" != typeof a.querySelectorAll ? a.querySelectorAll(b || "*") : [];
    return void 0 === b || b && n.nodeName(a, b) ? n.merge([a], c) : c
  }

  function aa(a, b) {
    for (var c = 0, d = a.length; d > c; c++) N.set(a[c], "globalEval", !b || N.get(b[c], "globalEval"))
  }
  var ba = /<|&#?\w+;/;

  function ca(a, b, c, d, e) {
    for (var f, g, h, i, j, k, l = b.createDocumentFragment(), m = [], o = 0, p = a.length; p > o; o++)
      if (f = a[o], f || 0 === f)
        if ("object" === n.type(f)) n.merge(m, f.nodeType ? [f] : f);
        else if (ba.test(f)) {
      g = g || l.appendChild(b.createElement("div")), h = (Y.exec(f) || ["", ""])[1].toLowerCase(), i = $[h] || $._default, g.innerHTML = i[1] + n.htmlPrefilter(f) + i[2], k = i[0];
      while (k--) g = g.lastChild;
      n.merge(m, g.childNodes), g = l.firstChild, g.textContent = ""
    } else m.push(b.createTextNode(f));
    l.textContent = "", o = 0;
    while (f = m[o++])
      if (d && n.inArray(f, d) > -1) e && e.push(f);
      else if (j = n.contains(f.ownerDocument, f), g = _(l.appendChild(f), "script"), j && aa(g), c) {
      k = 0;
      while (f = g[k++]) Z.test(f.type || "") && c.push(f)
    }
    return l
  }! function() {
    var a = d.createDocumentFragment(),
      b = a.appendChild(d.createElement("div")),
      c = d.createElement("input");
    c.setAttribute("type", "radio"), c.setAttribute("checked", "checked"), c.setAttribute("name", "t"), b.appendChild(c), l.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, b.innerHTML = "<textarea>x</textarea>", l.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue
  }();
  var da = /^key/,
    ea = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
    fa = /^([^.]*)(?:\.(.+)|)/;

  function ga() {
    return !0
  }

  function ha() {
    return !1
  }

  function ia() {
    try {
      return d.activeElement
    } catch (a) {}
  }

  function ja(a, b, c, d, e, f) {
    var g, h;
    if ("object" == typeof b) {
      "string" != typeof c && (d = d || c, c = void 0);
      for (h in b) ja(a, h, c, d, b[h], f);
      return a
    }
    if (null == d && null == e ? (e = c, d = c = void 0) : null == e && ("string" == typeof c ? (e = d, d = void 0) : (e = d, d = c, c = void 0)), e === !1) e = ha;
    else if (!e) return a;
    return 1 === f && (g = e, e = function(a) {
      return n().off(a), g.apply(this, arguments)
    }, e.guid = g.guid || (g.guid = n.guid++)), a.each(function() {
      n.event.add(this, b, e, d, c)
    })
  }
  n.event = {
    global: {},
    add: function(a, b, c, d, e) {
      var f, g, h, i, j, k, l, m, o, p, q, r = N.get(a);
      if (r) {
        c.handler && (f = c, c = f.handler, e = f.selector), c.guid || (c.guid = n.guid++), (i = r.events) || (i = r.events = {}), (g = r.handle) || (g = r.handle = function(b) {
          return "undefined" != typeof n && n.event.triggered !== b.type ? n.event.dispatch.apply(a, arguments) : void 0
        }), b = (b || "").match(G) || [""], j = b.length;
        while (j--) h = fa.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o && (l = n.event.special[o] || {}, o = (e ? l.delegateType : l.bindType) || o, l = n.event.special[o] || {}, k = n.extend({
          type: o,
          origType: q,
          data: d,
          handler: c,
          guid: c.guid,
          selector: e,
          needsContext: e && n.expr.match.needsContext.test(e),
          namespace: p.join(".")
        }, f), (m = i[o]) || (m = i[o] = [], m.delegateCount = 0, l.setup && l.setup.call(a, d, p, g) !== !1 || a.addEventListener && a.addEventListener(o, g)), l.add && (l.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, k) : m.push(k), n.event.global[o] = !0)
      }
    },
    remove: function(a, b, c, d, e) {
      var f, g, h, i, j, k, l, m, o, p, q, r = N.hasData(a) && N.get(a);
      if (r && (i = r.events)) {
        b = (b || "").match(G) || [""], j = b.length;
        while (j--)
          if (h = fa.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o) {
            l = n.event.special[o] || {}, o = (d ? l.delegateType : l.bindType) || o, m = i[o] || [], h = h[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), g = f = m.length;
            while (f--) k = m[f], !e && q !== k.origType || c && c.guid !== k.guid || h && !h.test(k.namespace) || d && d !== k.selector && ("**" !== d || !k.selector) || (m.splice(f, 1), k.selector && m.delegateCount--, l.remove && l.remove.call(a, k));
            g && !m.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || n.removeEvent(a, o, r.handle), delete i[o])
          } else
            for (o in i) n.event.remove(a, o + b[j], c, d, !0);
        n.isEmptyObject(i) && N.remove(a, "handle events")
      }
    },
    dispatch: function(a) {
      a = n.event.fix(a);
      var b, c, d, f, g, h = [],
        i = e.call(arguments),
        j = (N.get(this, "events") || {})[a.type] || [],
        k = n.event.special[a.type] || {};
      if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) {
        h = n.event.handlers.call(this, a, j), b = 0;
        while ((f = h[b++]) && !a.isPropagationStopped()) {
          a.currentTarget = f.elem, c = 0;
          while ((g = f.handlers[c++]) && !a.isImmediatePropagationStopped()) a.rnamespace && !a.rnamespace.test(g.namespace) || (a.handleObj = g, a.data = g.data, d = ((n.event.special[g.origType] || {}).handle || g.handler).apply(f.elem, i), void 0 !== d && (a.result = d) === !1 && (a.preventDefault(), a.stopPropagation()))
        }
        return k.postDispatch && k.postDispatch.call(this, a), a.result
      }
    },
    handlers: function(a, b) {
      var c, d, e, f, g = [],
        h = b.delegateCount,
        i = a.target;
      if (h && i.nodeType && ("click" !== a.type || isNaN(a.button) || a.button < 1))
        for (; i !== this; i = i.parentNode || this)
          if (1 === i.nodeType && (i.disabled !== !0 || "click" !== a.type)) {
            for (d = [], c = 0; h > c; c++) f = b[c], e = f.selector + " ", void 0 === d[e] && (d[e] = f.needsContext ? n(e, this).index(i) > -1 : n.find(e, this, null, [i]).length), d[e] && d.push(f);
            d.length && g.push({
              elem: i,
              handlers: d
            })
          }
      return h < b.length && g.push({
        elem: this,
        handlers: b.slice(h)
      }), g
    },
    props: "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
    fixHooks: {},
    keyHooks: {
      props: "char charCode key keyCode".split(" "),
      filter: function(a, b) {
        return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a
      }
    },
    mouseHooks: {
      props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
      filter: function(a, b) {
        var c, e, f, g = b.button;
        return null == a.pageX && null != b.clientX && (c = a.target.ownerDocument || d, e = c.documentElement, f = c.body, a.pageX = b.clientX + (e && e.scrollLeft || f && f.scrollLeft || 0) - (e && e.clientLeft || f && f.clientLeft || 0), a.pageY = b.clientY + (e && e.scrollTop || f && f.scrollTop || 0) - (e && e.clientTop || f && f.clientTop || 0)), a.which || void 0 === g || (a.which = 1 & g ? 1 : 2 & g ? 3 : 4 & g ? 2 : 0), a
      }
    },
    fix: function(a) {
      if (a[n.expando]) return a;
      var b, c, e, f = a.type,
        g = a,
        h = this.fixHooks[f];
      h || (this.fixHooks[f] = h = ea.test(f) ? this.mouseHooks : da.test(f) ? this.keyHooks : {}), e = h.props ? this.props.concat(h.props) : this.props, a = new n.Event(g), b = e.length;
      while (b--) c = e[b], a[c] = g[c];
      return a.target || (a.target = d), 3 === a.target.nodeType && (a.target = a.target.parentNode), h.filter ? h.filter(a, g) : a
    },
    special: {
      load: {
        noBubble: !0
      },
      focus: {
        trigger: function() {
          return this !== ia() && this.focus ? (this.focus(), !1) : void 0
        },
        delegateType: "focusin"
      },
      blur: {
        trigger: function() {
          return this === ia() && this.blur ? (this.blur(), !1) : void 0
        },
        delegateType: "focusout"
      },
      click: {
        trigger: function() {
          return "checkbox" === this.type && this.click && n.nodeName(this, "input") ? (this.click(), !1) : void 0
        },
        _default: function(a) {
          return n.nodeName(a.target, "a")
        }
      },
      beforeunload: {
        postDispatch: function(a) {
          void 0 !== a.result && a.originalEvent && (a.originalEvent.returnValue = a.result)
        }
      }
    }
  }, n.removeEvent = function(a, b, c) {
    a.removeEventListener && a.removeEventListener(b, c)
  }, n.Event = function(a, b) {
    return this instanceof n.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.returnValue === !1 ? ga : ha) : this.type = a, b && n.extend(this, b), this.timeStamp = a && a.timeStamp || n.now(), void(this[n.expando] = !0)) : new n.Event(a, b)
  }, n.Event.prototype = {
    constructor: n.Event,
    isDefaultPrevented: ha,
    isPropagationStopped: ha,
    isImmediatePropagationStopped: ha,
    preventDefault: function() {
      var a = this.originalEvent;
      this.isDefaultPrevented = ga, a && a.preventDefault()
    },
    stopPropagation: function() {
      var a = this.originalEvent;
      this.isPropagationStopped = ga, a && a.stopPropagation()
    },
    stopImmediatePropagation: function() {
      var a = this.originalEvent;
      this.isImmediatePropagationStopped = ga, a && a.stopImmediatePropagation(), this.stopPropagation()
    }
  }, n.each({
    mouseenter: "mouseover",
    mouseleave: "mouseout",
    pointerenter: "pointerover",
    pointerleave: "pointerout"
  }, function(a, b) {
    n.event.special[a] = {
      delegateType: b,
      bindType: b,
      handle: function(a) {
        var c, d = this,
          e = a.relatedTarget,
          f = a.handleObj;
        return e && (e === d || n.contains(d, e)) || (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c
      }
    }
  }), n.fn.extend({
    on: function(a, b, c, d) {
      return ja(this, a, b, c, d)
    },
    one: function(a, b, c, d) {
      return ja(this, a, b, c, d, 1)
    },
    off: function(a, b, c) {
      var d, e;
      if (a && a.preventDefault && a.handleObj) return d = a.handleObj, n(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), this;
      if ("object" == typeof a) {
        for (e in a) this.off(e, b, a[e]);
        return this
      }
      return b !== !1 && "function" != typeof b || (c = b, b = void 0), c === !1 && (c = ha), this.each(function() {
        n.event.remove(this, a, c, b)
      })
    }
  });
  var ka = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
    la = /<script|<style|<link/i,
    ma = /checked\s*(?:[^=]|=\s*.checked.)/i,
    na = /^true\/(.*)/,
    oa = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

  function pa(a, b) {
    return n.nodeName(a, "table") && n.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a
  }

  function qa(a) {
    return a.type = (null !== a.getAttribute("type")) + "/" + a.type, a
  }

  function ra(a) {
    var b = na.exec(a.type);
    return b ? a.type = b[1] : a.removeAttribute("type"), a
  }

  function sa(a, b) {
    var c, d, e, f, g, h, i, j;
    if (1 === b.nodeType) {
      if (N.hasData(a) && (f = N.access(a), g = N.set(b, f), j = f.events)) {
        delete g.handle, g.events = {};
        for (e in j)
          for (c = 0, d = j[e].length; d > c; c++) n.event.add(b, e, j[e][c])
      }
      O.hasData(a) && (h = O.access(a), i = n.extend({}, h), O.set(b, i))
    }
  }

  function ta(a, b) {
    var c = b.nodeName.toLowerCase();
    "input" === c && X.test(a.type) ? b.checked = a.checked : "input" !== c && "textarea" !== c || (b.defaultValue = a.defaultValue)
  }

  function ua(a, b, c, d) {
    b = f.apply([], b);
    var e, g, h, i, j, k, m = 0,
      o = a.length,
      p = o - 1,
      q = b[0],
      r = n.isFunction(q);
    if (r || o > 1 && "string" == typeof q && !l.checkClone && ma.test(q)) return a.each(function(e) {
      var f = a.eq(e);
      r && (b[0] = q.call(this, e, f.html())), ua(f, b, c, d)
    });
    if (o && (e = ca(b, a[0].ownerDocument, !1, a, d), g = e.firstChild, 1 === e.childNodes.length && (e = g), g || d)) {
      for (h = n.map(_(e, "script"), qa), i = h.length; o > m; m++) j = e, m !== p && (j = n.clone(j, !0, !0), i && n.merge(h, _(j, "script"))), c.call(a[m], j, m);
      if (i)
        for (k = h[h.length - 1].ownerDocument, n.map(h, ra), m = 0; i > m; m++) j = h[m], Z.test(j.type || "") && !N.access(j, "globalEval") && n.contains(k, j) && (j.src ? n._evalUrl && n._evalUrl(j.src) : n.globalEval(j.textContent.replace(oa, "")))
    }
    return a
  }

  function va(a, b, c) {
    for (var d, e = b ? n.filter(b, a) : a, f = 0; null != (d = e[f]); f++) c || 1 !== d.nodeType || n.cleanData(_(d)), d.parentNode && (c && n.contains(d.ownerDocument, d) && aa(_(d, "script")), d.parentNode.removeChild(d));
    return a
  }
  n.extend({
    htmlPrefilter: function(a) {
      return a.replace(ka, "<$1></$2>")
    },
    clone: function(a, b, c) {
      var d, e, f, g, h = a.cloneNode(!0),
        i = n.contains(a.ownerDocument, a);
      if (!(l.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || n.isXMLDoc(a)))
        for (g = _(h), f = _(a), d = 0, e = f.length; e > d; d++) ta(f[d], g[d]);
      if (b)
        if (c)
          for (f = f || _(a), g = g || _(h), d = 0, e = f.length; e > d; d++) sa(f[d], g[d]);
        else sa(a, h);
      return g = _(h, "script"), g.length > 0 && aa(g, !i && _(a, "script")), h
    },
    cleanData: function(a) {
      for (var b, c, d, e = n.event.special, f = 0; void 0 !== (c = a[f]); f++)
        if (L(c)) {
          if (b = c[N.expando]) {
            if (b.events)
              for (d in b.events) e[d] ? n.event.remove(c, d) : n.removeEvent(c, d, b.handle);
            c[N.expando] = void 0
          }
          c[O.expando] && (c[O.expando] = void 0)
        }
    }
  }), n.fn.extend({
    domManip: ua,
    detach: function(a) {
      return va(this, a, !0)
    },
    remove: function(a) {
      return va(this, a)
    },
    text: function(a) {
      return K(this, function(a) {
        return void 0 === a ? n.text(this) : this.empty().each(function() {
          1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || (this.textContent = a)
        })
      }, null, a, arguments.length)
    },
    append: function() {
      return ua(this, arguments, function(a) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var b = pa(this, a);
          b.appendChild(a)
        }
      })
    },
    prepend: function() {
      return ua(this, arguments, function(a) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var b = pa(this, a);
          b.insertBefore(a, b.firstChild)
        }
      })
    },
    before: function() {
      return ua(this, arguments, function(a) {
        this.parentNode && this.parentNode.insertBefore(a, this)
      })
    },
    after: function() {
      return ua(this, arguments, function(a) {
        this.parentNode && this.parentNode.insertBefore(a, this.nextSibling)
      })
    },
    empty: function() {
      for (var a, b = 0; null != (a = this[b]); b++) 1 === a.nodeType && (n.cleanData(_(a, !1)), a.textContent = "");
      return this
    },
    clone: function(a, b) {
      return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function() {
        return n.clone(this, a, b)
      })
    },
    html: function(a) {
      return K(this, function(a) {
        var b = this[0] || {},
          c = 0,
          d = this.length;
        if (void 0 === a && 1 === b.nodeType) return b.innerHTML;
        if ("string" == typeof a && !la.test(a) && !$[(Y.exec(a) || ["", ""])[1].toLowerCase()]) {
          a = n.htmlPrefilter(a);
          try {
            for (; d > c; c++) b = this[c] || {}, 1 === b.nodeType && (n.cleanData(_(b, !1)), b.innerHTML = a);
            b = 0
          } catch (e) {}
        }
        b && this.empty().append(a)
      }, null, a, arguments.length)
    },
    replaceWith: function() {
      var a = [];
      return ua(this, arguments, function(b) {
        var c = this.parentNode;
        n.inArray(this, a) < 0 && (n.cleanData(_(this)), c && c.replaceChild(b, this))
      }, a)
    }
  }), n.each({
    appendTo: "append",
    prependTo: "prepend",
    insertBefore: "before",
    insertAfter: "after",
    replaceAll: "replaceWith"
  }, function(a, b) {
    n.fn[a] = function(a) {
      for (var c, d = [], e = n(a), f = e.length - 1, h = 0; f >= h; h++) c = h === f ? this : this.clone(!0), n(e[h])[b](c), g.apply(d, c.get());
      return this.pushStack(d)
    }
  });
  var wa, xa = {
    HTML: "block",
    BODY: "block"
  };

  function ya(a, b) {
    var c = n(b.createElement(a)).appendTo(b.body),
      d = n.css(c[0], "display");
    return c.detach(), d
  }

  function za(a) {
    var b = d,
      c = xa[a];
    return c || (c = ya(a, b), "none" !== c && c || (wa = (wa || n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), b = wa[0].contentDocument, b.write(), b.close(), c = ya(a, b), wa.detach()), xa[a] = c), c
  }
  var Aa = /^margin/,
    Ba = new RegExp("^(" + S + ")(?!px)[a-z%]+$", "i"),
    Ca = function(b) {
      var c = b.ownerDocument.defaultView;
      return c && c.opener || (c = a), c.getComputedStyle(b)
    },
    Da = function(a, b, c, d) {
      var e, f, g = {};
      for (f in b) g[f] = a.style[f], a.style[f] = b[f];
      e = c.apply(a, d || []);
      for (f in b) a.style[f] = g[f];
      return e
    },
    Ea = d.documentElement;
  ! function() {
    var b, c, e, f, g = d.createElement("div"),
      h = d.createElement("div");
    if (h.style) {
      h.style.backgroundClip = "content-box", h.cloneNode(!0).style.backgroundClip = "", l.clearCloneStyle = "content-box" === h.style.backgroundClip, g.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute", g.appendChild(h);

      function i() {
        h.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%", h.innerHTML = "", Ea.appendChild(g);
        var d = a.getComputedStyle(h);
        b = "1%" !== d.top, f = "2px" === d.marginLeft, c = "4px" === d.width, h.style.marginRight = "50%", e = "4px" === d.marginRight, Ea.removeChild(g)
      }
      n.extend(l, {
        pixelPosition: function() {
          return i(), b
        },
        boxSizingReliable: function() {
          return null == c && i(), c
        },
        pixelMarginRight: function() {
          return null == c && i(), e
        },
        reliableMarginLeft: function() {
          return null == c && i(), f
        },
        reliableMarginRight: function() {
          var b, c = h.appendChild(d.createElement("div"));
          return c.style.cssText = h.style.cssText = "-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", c.style.marginRight = c.style.width = "0", h.style.width = "1px", Ea.appendChild(g), b = !parseFloat(a.getComputedStyle(c).marginRight), Ea.removeChild(g), h.removeChild(c), b
        }
      })
    }
  }();

  function Fa(a, b, c) {
    var d, e, f, g, h = a.style;
    return c = c || Ca(a), g = c ? c.getPropertyValue(b) || c[b] : void 0, "" !== g && void 0 !== g || n.contains(a.ownerDocument, a) || (g = n.style(a, b)), c && !l.pixelMarginRight() && Ba.test(g) && Aa.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f), void 0 !== g ? g + "" : g
  }

  function Ga(a, b) {
    return {
      get: function() {
        return a() ? void delete this.get : (this.get = b).apply(this, arguments)
      }
    }
  }
  var Ha = /^(none|table(?!-c[ea]).+)/,
    Ia = {
      position: "absolute",
      visibility: "hidden",
      display: "block"
    },
    Ja = {
      letterSpacing: "0",
      fontWeight: "400"
    },
    Ka = ["Webkit", "O", "Moz", "ms"],
    La = d.createElement("div").style;

  function Ma(a) {
    if (a in La) return a;
    var b = a[0].toUpperCase() + a.slice(1),
      c = Ka.length;
    while (c--)
      if (a = Ka[c] + b, a in La) return a
  }

  function Na(a, b, c) {
    var d = T.exec(b);
    return d ? Math.max(0, d[2] - (c || 0)) + (d[3] || "px") : b
  }

  function Oa(a, b, c, d, e) {
    for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2) "margin" === c && (g += n.css(a, c + U[f], !0, e)), d ? ("content" === c && (g -= n.css(a, "padding" + U[f], !0, e)), "margin" !== c && (g -= n.css(a, "border" + U[f] + "Width", !0, e))) : (g += n.css(a, "padding" + U[f], !0, e), "padding" !== c && (g += n.css(a, "border" + U[f] + "Width", !0, e)));
    return g
  }

  function Pa(b, c, e) {
    var f = !0,
      g = "width" === c ? b.offsetWidth : b.offsetHeight,
      h = Ca(b),
      i = "border-box" === n.css(b, "boxSizing", !1, h);
    if (d.msFullscreenElement && a.top !== a && b.getClientRects().length && (g = Math.round(100 * b.getBoundingClientRect()[c])), 0 >= g || null == g) {
      if (g = Fa(b, c, h), (0 > g || null == g) && (g = b.style[c]), Ba.test(g)) return g;
      f = i && (l.boxSizingReliable() || g === b.style[c]), g = parseFloat(g) || 0
    }
    return g + Oa(b, c, e || (i ? "border" : "content"), f, h) + "px"
  }

  function Qa(a, b) {
    for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++) d = a[g], d.style && (f[g] = N.get(d, "olddisplay"), c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && V(d) && (f[g] = N.access(d, "olddisplay", za(d.nodeName)))) : (e = V(d), "none" === c && e || N.set(d, "olddisplay", e ? c : n.css(d, "display"))));
    for (g = 0; h > g; g++) d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none"));
    return a
  }
  n.extend({
    cssHooks: {
      opacity: {
        get: function(a, b) {
          if (b) {
            var c = Fa(a, "opacity");
            return "" === c ? "1" : c
          }
        }
      }
    },
    cssNumber: {
      animationIterationCount: !0,
      columnCount: !0,
      fillOpacity: !0,
      flexGrow: !0,
      flexShrink: !0,
      fontWeight: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0
    },
    cssProps: {
      "float": "cssFloat"
    },
    style: function(a, b, c, d) {
      if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
        var e, f, g, h = n.camelCase(b),
          i = a.style;
        return b = n.cssProps[h] || (n.cssProps[h] = Ma(h) || h), g = n.cssHooks[b] || n.cssHooks[h], void 0 === c ? g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b] : (f = typeof c, "string" === f && (e = T.exec(c)) && e[1] && (c = W(a, b, e), f = "number"), null != c && c === c && ("number" === f && (c += e && e[3] || (n.cssNumber[h] ? "" : "px")), l.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), g && "set" in g && void 0 === (c = g.set(a, c, d)) || (i[b] = c)), void 0)
      }
    },
    css: function(a, b, c, d) {
      var e, f, g, h = n.camelCase(b);
      return b = n.cssProps[h] || (n.cssProps[h] = Ma(h) || h), g = n.cssHooks[b] || n.cssHooks[h], g && "get" in g && (e = g.get(a, !0, c)), void 0 === e && (e = Fa(a, b, d)), "normal" === e && b in Ja && (e = Ja[b]), "" === c || c ? (f = parseFloat(e), c === !0 || isFinite(f) ? f || 0 : e) : e
    }
  }), n.each(["height", "width"], function(a, b) {
    n.cssHooks[b] = {
      get: function(a, c, d) {
        return c ? Ha.test(n.css(a, "display")) && 0 === a.offsetWidth ? Da(a, Ia, function() {
          return Pa(a, b, d)
        }) : Pa(a, b, d) : void 0
      },
      set: function(a, c, d) {
        var e, f = d && Ca(a),
          g = d && Oa(a, b, d, "border-box" === n.css(a, "boxSizing", !1, f), f);
        return g && (e = T.exec(c)) && "px" !== (e[3] || "px") && (a.style[b] = c, c = n.css(a, b)), Na(a, c, g)
      }
    }
  }), n.cssHooks.marginLeft = Ga(l.reliableMarginLeft, function(a, b) {
    return b ? (parseFloat(Fa(a, "marginLeft")) || a.getBoundingClientRect().left - Da(a, {
      marginLeft: 0
    }, function() {
      return a.getBoundingClientRect().left
    })) + "px" : void 0
  }), n.cssHooks.marginRight = Ga(l.reliableMarginRight, function(a, b) {
    return b ? Da(a, {
      display: "inline-block"
    }, Fa, [a, "marginRight"]) : void 0
  }), n.each({
    margin: "",
    padding: "",
    border: "Width"
  }, function(a, b) {
    n.cssHooks[a + b] = {
      expand: function(c) {
        for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [c]; 4 > d; d++) e[a + U[d] + b] = f[d] || f[d - 2] || f[0];
        return e
      }
    }, Aa.test(a) || (n.cssHooks[a + b].set = Na)
  }), n.fn.extend({
    css: function(a, b) {
      return K(this, function(a, b, c) {
        var d, e, f = {},
          g = 0;
        if (n.isArray(b)) {
          for (d = Ca(a), e = b.length; e > g; g++) f[b[g]] = n.css(a, b[g], !1, d);
          return f
        }
        return void 0 !== c ? n.style(a, b, c) : n.css(a, b)
      }, a, b, arguments.length > 1)
    },
    show: function() {
      return Qa(this, !0)
    },
    hide: function() {
      return Qa(this)
    },
    toggle: function(a) {
      return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function() {
        V(this) ? n(this).show() : n(this).hide()
      })
    }
  });

  function Ra(a, b, c, d, e) {
    return new Ra.prototype.init(a, b, c, d, e)
  }
  n.Tween = Ra, Ra.prototype = {
    constructor: Ra,
    init: function(a, b, c, d, e, f) {
      this.elem = a, this.prop = c, this.easing = e || n.easing._default, this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (n.cssNumber[c] ? "" : "px")
    },
    cur: function() {
      var a = Ra.propHooks[this.prop];
      return a && a.get ? a.get(this) : Ra.propHooks._default.get(this)
    },
    run: function(a) {
      var b, c = Ra.propHooks[this.prop];
      return this.options.duration ? this.pos = b = n.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : this.pos = b = a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : Ra.propHooks._default.set(this), this
    }
  }, Ra.prototype.init.prototype = Ra.prototype, Ra.propHooks = {
    _default: {
      get: function(a) {
        var b;
        return 1 !== a.elem.nodeType || null != a.elem[a.prop] && null == a.elem.style[a.prop] ? a.elem[a.prop] : (b = n.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0)
      },
      set: function(a) {
        n.fx.step[a.prop] ? n.fx.step[a.prop](a) : 1 !== a.elem.nodeType || null == a.elem.style[n.cssProps[a.prop]] && !n.cssHooks[a.prop] ? a.elem[a.prop] = a.now : n.style(a.elem, a.prop, a.now + a.unit)
      }
    }
  }, Ra.propHooks.scrollTop = Ra.propHooks.scrollLeft = {
    set: function(a) {
      a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now)
    }
  }, n.easing = {
    linear: function(a) {
      return a
    },
    swing: function(a) {
      return .5 - Math.cos(a * Math.PI) / 2
    },
    _default: "swing"
  }, n.fx = Ra.prototype.init, n.fx.step = {};
  var Sa, Ta, Ua = /^(?:toggle|show|hide)$/,
    Va = /queueHooks$/;

  function Wa() {
    return a.setTimeout(function() {
      Sa = void 0
    }), Sa = n.now()
  }

  function Xa(a, b) {
    var c, d = 0,
      e = {
        height: a
      };
    for (b = b ? 1 : 0; 4 > d; d += 2 - b) c = U[d], e["margin" + c] = e["padding" + c] = a;
    return b && (e.opacity = e.width = a), e
  }

  function Ya(a, b, c) {
    for (var d, e = (_a.tweeners[b] || []).concat(_a.tweeners["*"]), f = 0, g = e.length; g > f; f++)
      if (d = e[f].call(c, b, a)) return d
  }

  function Za(a, b, c) {
    var d, e, f, g, h, i, j, k, l = this,
      m = {},
      o = a.style,
      p = a.nodeType && V(a),
      q = N.get(a, "fxshow");
    c.queue || (h = n._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function() {
      h.unqueued || i()
    }), h.unqueued++, l.always(function() {
      l.always(function() {
        h.unqueued--, n.queue(a, "fx").length || h.empty.fire()
      })
    })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [o.overflow, o.overflowX, o.overflowY], j = n.css(a, "display"), k = "none" === j ? N.get(a, "olddisplay") || za(a.nodeName) : j, "inline" === k && "none" === n.css(a, "float") && (o.display = "inline-block")), c.overflow && (o.overflow = "hidden", l.always(function() {
      o.overflow = c.overflow[0], o.overflowX = c.overflow[1], o.overflowY = c.overflow[2]
    }));
    for (d in b)
      if (e = b[d], Ua.exec(e)) {
        if (delete b[d], f = f || "toggle" === e, e === (p ? "hide" : "show")) {
          if ("show" !== e || !q || void 0 === q[d]) continue;
          p = !0
        }
        m[d] = q && q[d] || n.style(a, d)
      } else j = void 0;
    if (n.isEmptyObject(m)) "inline" === ("none" === j ? za(a.nodeName) : j) && (o.display = j);
    else {
      q ? "hidden" in q && (p = q.hidden) : q = N.access(a, "fxshow", {}), f && (q.hidden = !p), p ? n(a).show() : l.done(function() {
        n(a).hide()
      }), l.done(function() {
        var b;
        N.remove(a, "fxshow");
        for (b in m) n.style(a, b, m[b])
      });
      for (d in m) g = Ya(p ? q[d] : 0, d, l), d in q || (q[d] = g.start, p && (g.end = g.start, g.start = "width" === d || "height" === d ? 1 : 0))
    }
  }

  function $a(a, b) {
    var c, d, e, f, g;
    for (c in a)
      if (d = n.camelCase(c), e = b[d], f = a[c], n.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = n.cssHooks[d], g && "expand" in g) {
        f = g.expand(f), delete a[d];
        for (c in f) c in a || (a[c] = f[c], b[c] = e)
      } else b[d] = e
  }

  function _a(a, b, c) {
    var d, e, f = 0,
      g = _a.prefilters.length,
      h = n.Deferred().always(function() {
        delete i.elem
      }),
      i = function() {
        if (e) return !1;
        for (var b = Sa || Wa(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++) j.tweens[g].run(f);
        return h.notifyWith(a, [j, f, c]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1)
      },
      j = h.promise({
        elem: a,
        props: n.extend({}, b),
        opts: n.extend(!0, {
          specialEasing: {},
          easing: n.easing._default
        }, c),
        originalProperties: b,
        originalOptions: c,
        startTime: Sa || Wa(),
        duration: c.duration,
        tweens: [],
        createTween: function(b, c) {
          var d = n.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);
          return j.tweens.push(d), d
        },
        stop: function(b) {
          var c = 0,
            d = b ? j.tweens.length : 0;
          if (e) return this;
          for (e = !0; d > c; c++) j.tweens[c].run(1);
          return b ? (h.notifyWith(a, [j, 1, 0]), h.resolveWith(a, [j, b])) : h.rejectWith(a, [j, b]), this
        }
      }),
      k = j.props;
    for ($a(k, j.opts.specialEasing); g > f; f++)
      if (d = _a.prefilters[f].call(j, a, k, j.opts)) return n.isFunction(d.stop) && (n._queueHooks(j.elem, j.opts.queue).stop = n.proxy(d.stop, d)), d;
    return n.map(k, Ya, j), n.isFunction(j.opts.start) && j.opts.start.call(a, j), n.fx.timer(n.extend(i, {
      elem: a,
      anim: j,
      queue: j.opts.queue
    })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always)
  }
  n.Animation = n.extend(_a, {
      tweeners: {
        "*": [function(a, b) {
          var c = this.createTween(a, b);
          return W(c.elem, a, T.exec(b), c), c
        }]
      },
      tweener: function(a, b) {
        n.isFunction(a) ? (b = a, a = ["*"]) : a = a.match(G);
        for (var c, d = 0, e = a.length; e > d; d++) c = a[d], _a.tweeners[c] = _a.tweeners[c] || [], _a.tweeners[c].unshift(b)
      },
      prefilters: [Za],
      prefilter: function(a, b) {
        b ? _a.prefilters.unshift(a) : _a.prefilters.push(a)
      }
    }), n.speed = function(a, b, c) {
      var d = a && "object" == typeof a ? n.extend({}, a) : {
        complete: c || !c && b || n.isFunction(a) && a,
        duration: a,
        easing: c && b || b && !n.isFunction(b) && b
      };
      return d.duration = n.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in n.fx.speeds ? n.fx.speeds[d.duration] : n.fx.speeds._default, null != d.queue && d.queue !== !0 || (d.queue = "fx"), d.old = d.complete, d.complete = function() {
        n.isFunction(d.old) && d.old.call(this), d.queue && n.dequeue(this, d.queue)
      }, d
    }, n.fn.extend({
      fadeTo: function(a, b, c, d) {
        return this.filter(V).css("opacity", 0).show().end().animate({
          opacity: b
        }, a, c, d)
      },
      animate: function(a, b, c, d) {
        var e = n.isEmptyObject(a),
          f = n.speed(b, c, d),
          g = function() {
            var b = _a(this, n.extend({}, a), f);
            (e || N.get(this, "finish")) && b.stop(!0)
          };
        return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g)
      },
      stop: function(a, b, c) {
        var d = function(a) {
          var b = a.stop;
          delete a.stop, b(c)
        };
        return "string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), this.each(function() {
          var b = !0,
            e = null != a && a + "queueHooks",
            f = n.timers,
            g = N.get(this);
          if (e) g[e] && g[e].stop && d(g[e]);
          else
            for (e in g) g[e] && g[e].stop && Va.test(e) && d(g[e]);
          for (e = f.length; e--;) f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1));
          !b && c || n.dequeue(this, a)
        })
      },
      finish: function(a) {
        return a !== !1 && (a = a || "fx"), this.each(function() {
          var b, c = N.get(this),
            d = c[a + "queue"],
            e = c[a + "queueHooks"],
            f = n.timers,
            g = d ? d.length : 0;
          for (c.finish = !0, n.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;) f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1));
          for (b = 0; g > b; b++) d[b] && d[b].finish && d[b].finish.call(this);
          delete c.finish
        })
      }
    }), n.each(["toggle", "show", "hide"], function(a, b) {
      var c = n.fn[b];
      n.fn[b] = function(a, d, e) {
        return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(Xa(b, !0), a, d, e)
      }
    }), n.each({
      slideDown: Xa("show"),
      slideUp: Xa("hide"),
      slideToggle: Xa("toggle"),
      fadeIn: {
        opacity: "show"
      },
      fadeOut: {
        opacity: "hide"
      },
      fadeToggle: {
        opacity: "toggle"
      }
    }, function(a, b) {
      n.fn[a] = function(a, c, d) {
        return this.animate(b, a, c, d)
      }
    }), n.timers = [], n.fx.tick = function() {
      var a, b = 0,
        c = n.timers;
      for (Sa = n.now(); b < c.length; b++) a = c[b], a() || c[b] !== a || c.splice(b--, 1);
      c.length || n.fx.stop(), Sa = void 0
    }, n.fx.timer = function(a) {
      n.timers.push(a), a() ? n.fx.start() : n.timers.pop()
    }, n.fx.interval = 13, n.fx.start = function() {
      Ta || (Ta = a.setInterval(n.fx.tick, n.fx.interval))
    }, n.fx.stop = function() {
      a.clearInterval(Ta), Ta = null
    }, n.fx.speeds = {
      slow: 600,
      fast: 200,
      _default: 400
    }, n.fn.delay = function(b, c) {
      return b = n.fx ? n.fx.speeds[b] || b : b, c = c || "fx", this.queue(c, function(c, d) {
        var e = a.setTimeout(c, b);
        d.stop = function() {
          a.clearTimeout(e)
        }
      })
    },
    function() {
      var a = d.createElement("input"),
        b = d.createElement("select"),
        c = b.appendChild(d.createElement("option"));
      a.type = "checkbox", l.checkOn = "" !== a.value, l.optSelected = c.selected, b.disabled = !0, l.optDisabled = !c.disabled, a = d.createElement("input"), a.value = "t", a.type = "radio", l.radioValue = "t" === a.value
    }();
  var ab, bb = n.expr.attrHandle;
  n.fn.extend({
    attr: function(a, b) {
      return K(this, n.attr, a, b, arguments.length > 1)
    },
    removeAttr: function(a) {
      return this.each(function() {
        n.removeAttr(this, a)
      })
    }
  }), n.extend({
    attr: function(a, b, c) {
      var d, e, f = a.nodeType;
      if (3 !== f && 8 !== f && 2 !== f) return "undefined" == typeof a.getAttribute ? n.prop(a, b, c) : (1 === f && n.isXMLDoc(a) || (b = b.toLowerCase(), e = n.attrHooks[b] || (n.expr.match.bool.test(b) ? ab : void 0)), void 0 !== c ? null === c ? void n.removeAttr(a, b) : e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : (a.setAttribute(b, c + ""), c) : e && "get" in e && null !== (d = e.get(a, b)) ? d : (d = n.find.attr(a, b), null == d ? void 0 : d))
    },
    attrHooks: {
      type: {
        set: function(a, b) {
          if (!l.radioValue && "radio" === b && n.nodeName(a, "input")) {
            var c = a.value;
            return a.setAttribute("type", b), c && (a.value = c), b
          }
        }
      }
    },
    removeAttr: function(a, b) {
      var c, d, e = 0,
        f = b && b.match(G);
      if (f && 1 === a.nodeType)
        while (c = f[e++]) d = n.propFix[c] || c, n.expr.match.bool.test(c) && (a[d] = !1), a.removeAttribute(c)
    }
  }), ab = {
    set: function(a, b, c) {
      return b === !1 ? n.removeAttr(a, c) : a.setAttribute(c, c), c
    }
  }, n.each(n.expr.match.bool.source.match(/\w+/g), function(a, b) {
    var c = bb[b] || n.find.attr;
    bb[b] = function(a, b, d) {
      var e, f;
      return d || (f = bb[b], bb[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, bb[b] = f), e
    }
  });
  var cb = /^(?:input|select|textarea|button)$/i,
    db = /^(?:a|area)$/i;
  n.fn.extend({
    prop: function(a, b) {
      return K(this, n.prop, a, b, arguments.length > 1)
    },
    removeProp: function(a) {
      return this.each(function() {
        delete this[n.propFix[a] || a]
      })
    }
  }), n.extend({
    prop: function(a, b, c) {
      var d, e, f = a.nodeType;
      if (3 !== f && 8 !== f && 2 !== f) return 1 === f && n.isXMLDoc(a) || (b = n.propFix[b] || b,
        e = n.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b]
    },
    propHooks: {
      tabIndex: {
        get: function(a) {
          var b = n.find.attr(a, "tabindex");
          return b ? parseInt(b, 10) : cb.test(a.nodeName) || db.test(a.nodeName) && a.href ? 0 : -1
        }
      }
    },
    propFix: {
      "for": "htmlFor",
      "class": "className"
    }
  }), l.optSelected || (n.propHooks.selected = {
    get: function(a) {
      var b = a.parentNode;
      return b && b.parentNode && b.parentNode.selectedIndex, null
    },
    set: function(a) {
      var b = a.parentNode;
      b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex)
    }
  }), n.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
    n.propFix[this.toLowerCase()] = this
  });
  var eb = /[\t\r\n\f]/g;

  function fb(a) {
    return a.getAttribute && a.getAttribute("class") || ""
  }
  n.fn.extend({
    addClass: function(a) {
      var b, c, d, e, f, g, h, i = 0;
      if (n.isFunction(a)) return this.each(function(b) {
        n(this).addClass(a.call(this, b, fb(this)))
      });
      if ("string" == typeof a && a) {
        b = a.match(G) || [];
        while (c = this[i++])
          if (e = fb(c), d = 1 === c.nodeType && (" " + e + " ").replace(eb, " ")) {
            g = 0;
            while (f = b[g++]) d.indexOf(" " + f + " ") < 0 && (d += f + " ");
            h = n.trim(d), e !== h && c.setAttribute("class", h)
          }
      }
      return this
    },
    removeClass: function(a) {
      var b, c, d, e, f, g, h, i = 0;
      if (n.isFunction(a)) return this.each(function(b) {
        n(this).removeClass(a.call(this, b, fb(this)))
      });
      if (!arguments.length) return this.attr("class", "");
      if ("string" == typeof a && a) {
        b = a.match(G) || [];
        while (c = this[i++])
          if (e = fb(c), d = 1 === c.nodeType && (" " + e + " ").replace(eb, " ")) {
            g = 0;
            while (f = b[g++])
              while (d.indexOf(" " + f + " ") > -1) d = d.replace(" " + f + " ", " ");
            h = n.trim(d), e !== h && c.setAttribute("class", h)
          }
      }
      return this
    },
    toggleClass: function(a, b) {
      var c = typeof a;
      return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : n.isFunction(a) ? this.each(function(c) {
        n(this).toggleClass(a.call(this, c, fb(this), b), b)
      }) : this.each(function() {
        var b, d, e, f;
        if ("string" === c) {
          d = 0, e = n(this), f = a.match(G) || [];
          while (b = f[d++]) e.hasClass(b) ? e.removeClass(b) : e.addClass(b)
        } else void 0 !== a && "boolean" !== c || (b = fb(this), b && N.set(this, "__className__", b), this.setAttribute && this.setAttribute("class", b || a === !1 ? "" : N.get(this, "__className__") || ""))
      })
    },
    hasClass: function(a) {
      var b, c, d = 0;
      b = " " + a + " ";
      while (c = this[d++])
        if (1 === c.nodeType && (" " + fb(c) + " ").replace(eb, " ").indexOf(b) > -1) return !0;
      return !1
    }
  });
  var gb = /\r/g,
    hb = /[\x20\t\r\n\f]+/g;
  n.fn.extend({
    val: function(a) {
      var b, c, d, e = this[0]; {
        if (arguments.length) return d = n.isFunction(a), this.each(function(c) {
          var e;
          1 === this.nodeType && (e = d ? a.call(this, c, n(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : n.isArray(e) && (e = n.map(e, function(a) {
            return null == a ? "" : a + ""
          })), b = n.valHooks[this.type] || n.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e))
        });
        if (e) return b = n.valHooks[e.type] || n.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, "string" == typeof c ? c.replace(gb, "") : null == c ? "" : c)
      }
    }
  }), n.extend({
    valHooks: {
      option: {
        get: function(a) {
          var b = n.find.attr(a, "value");
          return null != b ? b : n.trim(n.text(a)).replace(hb, " ")
        }
      },
      select: {
        get: function(a) {
          for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++)
            if (c = d[i], (c.selected || i === e) && (l.optDisabled ? !c.disabled : null === c.getAttribute("disabled")) && (!c.parentNode.disabled || !n.nodeName(c.parentNode, "optgroup"))) {
              if (b = n(c).val(), f) return b;
              g.push(b)
            }
          return g
        },
        set: function(a, b) {
          var c, d, e = a.options,
            f = n.makeArray(b),
            g = e.length;
          while (g--) d = e[g], (d.selected = n.inArray(n.valHooks.option.get(d), f) > -1) && (c = !0);
          return c || (a.selectedIndex = -1), f
        }
      }
    }
  }), n.each(["radio", "checkbox"], function() {
    n.valHooks[this] = {
      set: function(a, b) {
        return n.isArray(b) ? a.checked = n.inArray(n(a).val(), b) > -1 : void 0
      }
    }, l.checkOn || (n.valHooks[this].get = function(a) {
      return null === a.getAttribute("value") ? "on" : a.value
    })
  });
  var ib = /^(?:focusinfocus|focusoutblur)$/;
  n.extend(n.event, {
    trigger: function(b, c, e, f) {
      var g, h, i, j, l, m, o, p = [e || d],
        q = k.call(b, "type") ? b.type : b,
        r = k.call(b, "namespace") ? b.namespace.split(".") : [];
      if (h = i = e = e || d, 3 !== e.nodeType && 8 !== e.nodeType && !ib.test(q + n.event.triggered) && (q.indexOf(".") > -1 && (r = q.split("."), q = r.shift(), r.sort()), l = q.indexOf(":") < 0 && "on" + q, b = b[n.expando] ? b : new n.Event(q, "object" == typeof b && b), b.isTrigger = f ? 2 : 3, b.namespace = r.join("."), b.rnamespace = b.namespace ? new RegExp("(^|\\.)" + r.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, b.result = void 0, b.target || (b.target = e), c = null == c ? [b] : n.makeArray(c, [b]), o = n.event.special[q] || {}, f || !o.trigger || o.trigger.apply(e, c) !== !1)) {
        if (!f && !o.noBubble && !n.isWindow(e)) {
          for (j = o.delegateType || q, ib.test(j + q) || (h = h.parentNode); h; h = h.parentNode) p.push(h), i = h;
          i === (e.ownerDocument || d) && p.push(i.defaultView || i.parentWindow || a)
        }
        g = 0;
        while ((h = p[g++]) && !b.isPropagationStopped()) b.type = g > 1 ? j : o.bindType || q, m = (N.get(h, "events") || {})[b.type] && N.get(h, "handle"), m && m.apply(h, c), m = l && h[l], m && m.apply && L(h) && (b.result = m.apply(h, c), b.result === !1 && b.preventDefault());
        return b.type = q, f || b.isDefaultPrevented() || o._default && o._default.apply(p.pop(), c) !== !1 || !L(e) || l && n.isFunction(e[q]) && !n.isWindow(e) && (i = e[l], i && (e[l] = null), n.event.triggered = q, e[q](), n.event.triggered = void 0, i && (e[l] = i)), b.result
      }
    },
    simulate: function(a, b, c) {
      var d = n.extend(new n.Event, c, {
        type: a,
        isSimulated: !0
      });
      n.event.trigger(d, null, b), d.isDefaultPrevented() && c.preventDefault()
    }
  }), n.fn.extend({
    trigger: function(a, b) {
      return this.each(function() {
        n.event.trigger(a, b, this)
      })
    },
    triggerHandler: function(a, b) {
      var c = this[0];
      return c ? n.event.trigger(a, b, c, !0) : void 0
    }
  }), n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(a, b) {
    n.fn[b] = function(a, c) {
      return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b)
    }
  }), n.fn.extend({
    hover: function(a, b) {
      return this.mouseenter(a).mouseleave(b || a)
    }
  }), l.focusin = "onfocusin" in a, l.focusin || n.each({
    focus: "focusin",
    blur: "focusout"
  }, function(a, b) {
    var c = function(a) {
      n.event.simulate(b, a.target, n.event.fix(a))
    };
    n.event.special[b] = {
      setup: function() {
        var d = this.ownerDocument || this,
          e = N.access(d, b);
        e || d.addEventListener(a, c, !0), N.access(d, b, (e || 0) + 1)
      },
      teardown: function() {
        var d = this.ownerDocument || this,
          e = N.access(d, b) - 1;
        e ? N.access(d, b, e) : (d.removeEventListener(a, c, !0), N.remove(d, b))
      }
    }
  });
  var jb = a.location,
    kb = n.now(),
    lb = /\?/;
  n.parseJSON = function(a) {
    return JSON.parse(a + "")
  }, n.parseXML = function(b) {
    var c;
    if (!b || "string" != typeof b) return null;
    try {
      c = (new a.DOMParser).parseFromString(b, "text/xml")
    } catch (d) {
      c = void 0
    }
    return c && !c.getElementsByTagName("parsererror").length || n.error("Invalid XML: " + b), c
  };
  var mb = /#.*$/,
    nb = /([?&])_=[^&]*/,
    ob = /^(.*?):[ \t]*([^\r\n]*)$/gm,
    pb = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
    qb = /^(?:GET|HEAD)$/,
    rb = /^\/\//,
    sb = {},
    tb = {},
    ub = "*/".concat("*"),
    vb = d.createElement("a");
  vb.href = jb.href;

  function wb(a) {
    return function(b, c) {
      "string" != typeof b && (c = b, b = "*");
      var d, e = 0,
        f = b.toLowerCase().match(G) || [];
      if (n.isFunction(c))
        while (d = f[e++]) "+" === d[0] ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c)
    }
  }

  function xb(a, b, c, d) {
    var e = {},
      f = a === tb;

    function g(h) {
      var i;
      return e[h] = !0, n.each(a[h] || [], function(a, h) {
        var j = h(b, c, d);
        return "string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1)
      }), i
    }
    return g(b.dataTypes[0]) || !e["*"] && g("*")
  }

  function yb(a, b) {
    var c, d, e = n.ajaxSettings.flatOptions || {};
    for (c in b) void 0 !== b[c] && ((e[c] ? a : d || (d = {}))[c] = b[c]);
    return d && n.extend(!0, a, d), a
  }

  function zb(a, b, c) {
    var d, e, f, g, h = a.contents,
      i = a.dataTypes;
    while ("*" === i[0]) i.shift(), void 0 === d && (d = a.mimeType || b.getResponseHeader("Content-Type"));
    if (d)
      for (e in h)
        if (h[e] && h[e].test(d)) {
          i.unshift(e);
          break
        }
    if (i[0] in c) f = i[0];
    else {
      for (e in c) {
        if (!i[0] || a.converters[e + " " + i[0]]) {
          f = e;
          break
        }
        g || (g = e)
      }
      f = f || g
    }
    return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0
  }

  function Ab(a, b, c, d) {
    var e, f, g, h, i, j = {},
      k = a.dataTypes.slice();
    if (k[1])
      for (g in a.converters) j[g.toLowerCase()] = a.converters[g];
    f = k.shift();
    while (f)
      if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift())
        if ("*" === f) f = i;
        else if ("*" !== i && i !== f) {
      if (g = j[i + " " + f] || j["* " + f], !g)
        for (e in j)
          if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) {
            g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));
            break
          }
      if (g !== !0)
        if (g && a["throws"]) b = g(b);
        else try {
          b = g(b)
        } catch (l) {
          return {
            state: "parsererror",
            error: g ? l : "No conversion from " + i + " to " + f
          }
        }
    }
    return {
      state: "success",
      data: b
    }
  }
  n.extend({
    active: 0,
    lastModified: {},
    etag: {},
    ajaxSettings: {
      url: jb.href,
      type: "GET",
      isLocal: pb.test(jb.protocol),
      global: !0,
      processData: !0,
      async: !0,
      contentType: "application/x-www-form-urlencoded; charset=UTF-8",
      accepts: {
        "*": ub,
        text: "text/plain",
        html: "text/html",
        xml: "application/xml, text/xml",
        json: "application/json, text/javascript"
      },
      contents: {
        xml: /\bxml\b/,
        html: /\bhtml/,
        json: /\bjson\b/
      },
      responseFields: {
        xml: "responseXML",
        text: "responseText",
        json: "responseJSON"
      },
      converters: {
        "* text": String,
        "text html": !0,
        "text json": n.parseJSON,
        "text xml": n.parseXML
      },
      flatOptions: {
        url: !0,
        context: !0
      }
    },
    ajaxSetup: function(a, b) {
      return b ? yb(yb(a, n.ajaxSettings), b) : yb(n.ajaxSettings, a)
    },
    ajaxPrefilter: wb(sb),
    ajaxTransport: wb(tb),
    ajax: function(b, c) {
      "object" == typeof b && (c = b, b = void 0), c = c || {};
      var e, f, g, h, i, j, k, l, m = n.ajaxSetup({}, c),
        o = m.context || m,
        p = m.context && (o.nodeType || o.jquery) ? n(o) : n.event,
        q = n.Deferred(),
        r = n.Callbacks("once memory"),
        s = m.statusCode || {},
        t = {},
        u = {},
        v = 0,
        w = "canceled",
        x = {
          readyState: 0,
          getResponseHeader: function(a) {
            var b;
            if (2 === v) {
              if (!h) {
                h = {};
                while (b = ob.exec(g)) h[b[1].toLowerCase()] = b[2]
              }
              b = h[a.toLowerCase()]
            }
            return null == b ? null : b
          },
          getAllResponseHeaders: function() {
            return 2 === v ? g : null
          },
          setRequestHeader: function(a, b) {
            var c = a.toLowerCase();
            return v || (a = u[c] = u[c] || a, t[a] = b), this
          },
          overrideMimeType: function(a) {
            return v || (m.mimeType = a), this
          },
          statusCode: function(a) {
            var b;
            if (a)
              if (2 > v)
                for (b in a) s[b] = [s[b], a[b]];
              else x.always(a[x.status]);
            return this
          },
          abort: function(a) {
            var b = a || w;
            return e && e.abort(b), z(0, b), this
          }
        };
      if (q.promise(x).complete = r.add, x.success = x.done, x.error = x.fail, m.url = ((b || m.url || jb.href) + "").replace(mb, "").replace(rb, jb.protocol + "//"), m.type = c.method || c.type || m.method || m.type, m.dataTypes = n.trim(m.dataType || "*").toLowerCase().match(G) || [""], null == m.crossDomain) {
        j = d.createElement("a");
        try {
          j.href = m.url, j.href = j.href, m.crossDomain = vb.protocol + "//" + vb.host != j.protocol + "//" + j.host
        } catch (y) {
          m.crossDomain = !0
        }
      }
      if (m.data && m.processData && "string" != typeof m.data && (m.data = n.param(m.data, m.traditional)), xb(sb, m, c, x), 2 === v) return x;
      k = n.event && m.global, k && 0 === n.active++ && n.event.trigger("ajaxStart"), m.type = m.type.toUpperCase(), m.hasContent = !qb.test(m.type), f = m.url, m.hasContent || (m.data && (f = m.url += (lb.test(f) ? "&" : "?") + m.data, delete m.data), m.cache === !1 && (m.url = nb.test(f) ? f.replace(nb, "$1_=" + kb++) : f + (lb.test(f) ? "&" : "?") + "_=" + kb++)), m.ifModified && (n.lastModified[f] && x.setRequestHeader("If-Modified-Since", n.lastModified[f]), n.etag[f] && x.setRequestHeader("If-None-Match", n.etag[f])), (m.data && m.hasContent && m.contentType !== !1 || c.contentType) && x.setRequestHeader("Content-Type", m.contentType), x.setRequestHeader("Accept", m.dataTypes[0] && m.accepts[m.dataTypes[0]] ? m.accepts[m.dataTypes[0]] + ("*" !== m.dataTypes[0] ? ", " + ub + "; q=0.01" : "") : m.accepts["*"]);
      for (l in m.headers) x.setRequestHeader(l, m.headers[l]);
      if (m.beforeSend && (m.beforeSend.call(o, x, m) === !1 || 2 === v)) return x.abort();
      w = "abort";
      for (l in {
          success: 1,
          error: 1,
          complete: 1
        }) x[l](m[l]);
      if (e = xb(tb, m, c, x)) {
        if (x.readyState = 1, k && p.trigger("ajaxSend", [x, m]), 2 === v) return x;
        m.async && m.timeout > 0 && (i = a.setTimeout(function() {
          x.abort("timeout")
        }, m.timeout));
        try {
          v = 1, e.send(t, z)
        } catch (y) {
          if (!(2 > v)) throw y;
          z(-1, y)
        }
      } else z(-1, "No Transport");

      function z(b, c, d, h) {
        var j, l, t, u, w, y = c;
        2 !== v && (v = 2, i && a.clearTimeout(i), e = void 0, g = h || "", x.readyState = b > 0 ? 4 : 0, j = b >= 200 && 300 > b || 304 === b, d && (u = zb(m, x, d)), u = Ab(m, u, x, j), j ? (m.ifModified && (w = x.getResponseHeader("Last-Modified"), w && (n.lastModified[f] = w), w = x.getResponseHeader("etag"), w && (n.etag[f] = w)), 204 === b || "HEAD" === m.type ? y = "nocontent" : 304 === b ? y = "notmodified" : (y = u.state, l = u.data, t = u.error, j = !t)) : (t = y, !b && y || (y = "error", 0 > b && (b = 0))), x.status = b, x.statusText = (c || y) + "", j ? q.resolveWith(o, [l, y, x]) : q.rejectWith(o, [x, y, t]), x.statusCode(s), s = void 0, k && p.trigger(j ? "ajaxSuccess" : "ajaxError", [x, m, j ? l : t]), r.fireWith(o, [x, y]), k && (p.trigger("ajaxComplete", [x, m]), --n.active || n.event.trigger("ajaxStop")))
      }
      return x
    },
    getJSON: function(a, b, c) {
      return n.get(a, b, c, "json")
    },
    getScript: function(a, b) {
      return n.get(a, void 0, b, "script")
    }
  }), n.each(["get", "post"], function(a, b) {
    n[b] = function(a, c, d, e) {
      return n.isFunction(c) && (e = e || d, d = c, c = void 0), n.ajax(n.extend({
        url: a,
        type: b,
        dataType: e,
        data: c,
        success: d
      }, n.isPlainObject(a) && a))
    }
  }), n._evalUrl = function(a) {
    return n.ajax({
      url: a,
      type: "GET",
      dataType: "script",
      async: !1,
      global: !1,
      "throws": !0
    })
  }, n.fn.extend({
    wrapAll: function(a) {
      var b;
      return n.isFunction(a) ? this.each(function(b) {
        n(this).wrapAll(a.call(this, b))
      }) : (this[0] && (b = n(a, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && b.insertBefore(this[0]), b.map(function() {
        var a = this;
        while (a.firstElementChild) a = a.firstElementChild;
        return a
      }).append(this)), this)
    },
    wrapInner: function(a) {
      return n.isFunction(a) ? this.each(function(b) {
        n(this).wrapInner(a.call(this, b))
      }) : this.each(function() {
        var b = n(this),
          c = b.contents();
        c.length ? c.wrapAll(a) : b.append(a)
      })
    },
    wrap: function(a) {
      var b = n.isFunction(a);
      return this.each(function(c) {
        n(this).wrapAll(b ? a.call(this, c) : a)
      })
    },
    unwrap: function() {
      return this.parent().each(function() {
        n.nodeName(this, "body") || n(this).replaceWith(this.childNodes)
      }).end()
    }
  }), n.expr.filters.hidden = function(a) {
    return !n.expr.filters.visible(a)
  }, n.expr.filters.visible = function(a) {
    return a.offsetWidth > 0 || a.offsetHeight > 0 || a.getClientRects().length > 0
  };
  var Bb = /%20/g,
    Cb = /\[\]$/,
    Db = /\r?\n/g,
    Eb = /^(?:submit|button|image|reset|file)$/i,
    Fb = /^(?:input|select|textarea|keygen)/i;

  function Gb(a, b, c, d) {
    var e;
    if (n.isArray(b)) n.each(b, function(b, e) {
      c || Cb.test(a) ? d(a, e) : Gb(a + "[" + ("object" == typeof e && null != e ? b : "") + "]", e, c, d)
    });
    else if (c || "object" !== n.type(b)) d(a, b);
    else
      for (e in b) Gb(a + "[" + e + "]", b[e], c, d)
  }
  n.param = function(a, b) {
    var c, d = [],
      e = function(a, b) {
        b = n.isFunction(b) ? b() : null == b ? "" : b, d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b)
      };
    if (void 0 === b && (b = n.ajaxSettings && n.ajaxSettings.traditional), n.isArray(a) || a.jquery && !n.isPlainObject(a)) n.each(a, function() {
      e(this.name, this.value)
    });
    else
      for (c in a) Gb(c, a[c], b, e);
    return d.join("&").replace(Bb, "+")
  }, n.fn.extend({
    serialize: function() {
      return n.param(this.serializeArray())
    },
    serializeArray: function() {
      return this.map(function() {
        var a = n.prop(this, "elements");
        return a ? n.makeArray(a) : this
      }).filter(function() {
        var a = this.type;
        return this.name && !n(this).is(":disabled") && Fb.test(this.nodeName) && !Eb.test(a) && (this.checked || !X.test(a))
      }).map(function(a, b) {
        var c = n(this).val();
        return null == c ? null : n.isArray(c) ? n.map(c, function(a) {
          return {
            name: b.name,
            value: a.replace(Db, "\r\n")
          }
        }) : {
          name: b.name,
          value: c.replace(Db, "\r\n")
        }
      }).get()
    }
  }), n.ajaxSettings.xhr = function() {
    try {
      return new a.XMLHttpRequest
    } catch (b) {}
  };
  var Hb = {
      0: 200,
      1223: 204
    },
    Ib = n.ajaxSettings.xhr();
  l.cors = !!Ib && "withCredentials" in Ib, l.ajax = Ib = !!Ib, n.ajaxTransport(function(b) {
    var c, d;
    return l.cors || Ib && !b.crossDomain ? {
      send: function(e, f) {
        var g, h = b.xhr();
        if (h.open(b.type, b.url, b.async, b.username, b.password), b.xhrFields)
          for (g in b.xhrFields) h[g] = b.xhrFields[g];
        b.mimeType && h.overrideMimeType && h.overrideMimeType(b.mimeType), b.crossDomain || e["X-Requested-With"] || (e["X-Requested-With"] = "XMLHttpRequest");
        for (g in e) h.setRequestHeader(g, e[g]);
        c = function(a) {
          return function() {
            c && (c = d = h.onload = h.onerror = h.onabort = h.onreadystatechange = null, "abort" === a ? h.abort() : "error" === a ? "number" != typeof h.status ? f(0, "error") : f(h.status, h.statusText) : f(Hb[h.status] || h.status, h.statusText, "text" !== (h.responseType || "text") || "string" != typeof h.responseText ? {
              binary: h.response
            } : {
              text: h.responseText
            }, h.getAllResponseHeaders()))
          }
        }, h.onload = c(), d = h.onerror = c("error"), void 0 !== h.onabort ? h.onabort = d : h.onreadystatechange = function() {
          4 === h.readyState && a.setTimeout(function() {
            c && d()
          })
        }, c = c("abort");
        try {
          h.send(b.hasContent && b.data || null)
        } catch (i) {
          if (c) throw i
        }
      },
      abort: function() {
        c && c()
      }
    } : void 0
  }), n.ajaxSetup({
    accepts: {
      script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
    },
    contents: {
      script: /\b(?:java|ecma)script\b/
    },
    converters: {
      "text script": function(a) {
        return n.globalEval(a), a
      }
    }
  }), n.ajaxPrefilter("script", function(a) {
    void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET")
  }), n.ajaxTransport("script", function(a) {
    if (a.crossDomain) {
      var b, c;
      return {
        send: function(e, f) {
          b = n("<script>").prop({
            charset: a.scriptCharset,
            src: a.url
          }).on("load error", c = function(a) {
            b.remove(), c = null, a && f("error" === a.type ? 404 : 200, a.type)
          }), d.head.appendChild(b[0])
        },
        abort: function() {
          c && c()
        }
      }
    }
  });
  var Jb = [],
    Kb = /(=)\?(?=&|$)|\?\?/;
  n.ajaxSetup({
    jsonp: "callback",
    jsonpCallback: function() {
      var a = Jb.pop() || n.expando + "_" + kb++;
      return this[a] = !0, a
    }
  }), n.ajaxPrefilter("json jsonp", function(b, c, d) {
    var e, f, g, h = b.jsonp !== !1 && (Kb.test(b.url) ? "url" : "string" == typeof b.data && 0 === (b.contentType || "").indexOf("application/x-www-form-urlencoded") && Kb.test(b.data) && "data");
    return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = n.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(Kb, "$1" + e) : b.jsonp !== !1 && (b.url += (lb.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), b.converters["script json"] = function() {
      return g || n.error(e + " was not called"), g[0]
    }, b.dataTypes[0] = "json", f = a[e], a[e] = function() {
      g = arguments
    }, d.always(function() {
      void 0 === f ? n(a).removeProp(e) : a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, Jb.push(e)), g && n.isFunction(f) && f(g[0]), g = f = void 0
    }), "script") : void 0
  }), n.parseHTML = function(a, b, c) {
    if (!a || "string" != typeof a) return null;
    "boolean" == typeof b && (c = b, b = !1), b = b || d;
    var e = x.exec(a),
      f = !c && [];
    return e ? [b.createElement(e[1])] : (e = ca([a], b, f), f && f.length && n(f).remove(), n.merge([], e.childNodes))
  };
  var Lb = n.fn.load;
  n.fn.load = function(a, b, c) {
    if ("string" != typeof a && Lb) return Lb.apply(this, arguments);
    var d, e, f, g = this,
      h = a.indexOf(" ");
    return h > -1 && (d = n.trim(a.slice(h)), a = a.slice(0, h)), n.isFunction(b) ? (c = b, b = void 0) : b && "object" == typeof b && (e = "POST"), g.length > 0 && n.ajax({
      url: a,
      type: e || "GET",
      dataType: "html",
      data: b
    }).done(function(a) {
      f = arguments, g.html(d ? n("<div>").append(n.parseHTML(a)).find(d) : a)
    }).always(c && function(a, b) {
      g.each(function() {
        c.apply(this, f || [a.responseText, b, a])
      })
    }), this
  }, n.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(a, b) {
    n.fn[b] = function(a) {
      return this.on(b, a)
    }
  }), n.expr.filters.animated = function(a) {
    return n.grep(n.timers, function(b) {
      return a === b.elem
    }).length
  };

  function Mb(a) {
    return n.isWindow(a) ? a : 9 === a.nodeType && a.defaultView
  }
  n.offset = {
    setOffset: function(a, b, c) {
      var d, e, f, g, h, i, j, k = n.css(a, "position"),
        l = n(a),
        m = {};
      "static" === k && (a.style.position = "relative"), h = l.offset(), f = n.css(a, "top"), i = n.css(a, "left"), j = ("absolute" === k || "fixed" === k) && (f + i).indexOf("auto") > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), n.isFunction(b) && (b = b.call(a, c, n.extend({}, h))), null != b.top && (m.top = b.top - h.top + g), null != b.left && (m.left = b.left - h.left + e), "using" in b ? b.using.call(a, m) : l.css(m)
    }
  }, n.fn.extend({
    offset: function(a) {
      if (arguments.length) return void 0 === a ? this : this.each(function(b) {
        n.offset.setOffset(this, a, b)
      });
      var b, c, d = this[0],
        e = {
          top: 0,
          left: 0
        },
        f = d && d.ownerDocument;
      if (f) return b = f.documentElement, n.contains(b, d) ? (e = d.getBoundingClientRect(), c = Mb(f), {
        top: e.top + c.pageYOffset - b.clientTop,
        left: e.left + c.pageXOffset - b.clientLeft
      }) : e
    },
    position: function() {
      if (this[0]) {
        var a, b, c = this[0],
          d = {
            top: 0,
            left: 0
          };
        return "fixed" === n.css(c, "position") ? b = c.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), n.nodeName(a[0], "html") || (d = a.offset()), d.top += n.css(a[0], "borderTopWidth", !0), d.left += n.css(a[0], "borderLeftWidth", !0)), {
          top: b.top - d.top - n.css(c, "marginTop", !0),
          left: b.left - d.left - n.css(c, "marginLeft", !0)
        }
      }
    },
    offsetParent: function() {
      return this.map(function() {
        var a = this.offsetParent;
        while (a && "static" === n.css(a, "position")) a = a.offsetParent;
        return a || Ea
      })
    }
  }), n.each({
    scrollLeft: "pageXOffset",
    scrollTop: "pageYOffset"
  }, function(a, b) {
    var c = "pageYOffset" === b;
    n.fn[a] = function(d) {
      return K(this, function(a, d, e) {
        var f = Mb(a);
        return void 0 === e ? f ? f[b] : a[d] : void(f ? f.scrollTo(c ? f.pageXOffset : e, c ? e : f.pageYOffset) : a[d] = e)
      }, a, d, arguments.length)
    }
  }), n.each(["top", "left"], function(a, b) {
    n.cssHooks[b] = Ga(l.pixelPosition, function(a, c) {
      return c ? (c = Fa(a, b), Ba.test(c) ? n(a).position()[b] + "px" : c) : void 0
    })
  }), n.each({
    Height: "height",
    Width: "width"
  }, function(a, b) {
    n.each({
      padding: "inner" + a,
      content: b,
      "": "outer" + a
    }, function(c, d) {
      n.fn[d] = function(d, e) {
        var f = arguments.length && (c || "boolean" != typeof d),
          g = c || (d === !0 || e === !0 ? "margin" : "border");
        return K(this, function(b, c, d) {
          var e;
          return n.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? n.css(b, c, g) : n.style(b, c, d, g)
        }, b, f ? d : void 0, f, null)
      }
    })
  }), n.fn.extend({
    bind: function(a, b, c) {
      return this.on(a, null, b, c)
    },
    unbind: function(a, b) {
      return this.off(a, null, b)
    },
    delegate: function(a, b, c, d) {
      return this.on(b, a, c, d)
    },
    undelegate: function(a, b, c) {
      return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c)
    },
    size: function() {
      return this.length
    }
  }), n.fn.andSelf = n.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function() {
    return n
  });
  var Nb = a.jQuery,
    Ob = a.$;
  return n.noConflict = function(b) {
    return a.$ === n && (a.$ = Ob), b && a.jQuery === n && (a.jQuery = Nb), n
  }, b || (a.jQuery = a.$ = n), n
});
/*! RESOURCE: /scripts/lib/jquery/jquery_no_conflict.js */
(function() {
  if (window.$j_glide) {
    jQuery.noConflict(true);
    window.jQuery = $j_glide;
  }
  window.$j = window.$j_glide = jQuery.noConflict();
})();;;
/*! RESOURCE: /scripts/reportlibs/json2.js */
if (typeof JSON !== 'object') {
  JSON = {};
}
(function() {
  'use strict';

  function f(n) {
    return n < 10 ? '0' + n : n;
  }
  if (typeof Date.prototype.toJSON !== 'function') {
    Date.prototype.toJSON = function(key) {
      return isFinite(this.valueOf()) ?
        this.getUTCFullYear() + '-' +
        f(this.getUTCMonth() + 1) + '-' +
        f(this.getUTCDate()) + 'T' +
        f(this.getUTCHours()) + ':' +
        f(this.getUTCMinutes()) + ':' +
        f(this.getUTCSeconds()) + 'Z' :
        null;
    };
    String.prototype.toJSON =
      Number.prototype.toJSON =
      Boolean.prototype.toJSON = function(key) {
        return this.valueOf();
      };
  }
  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    },
    rep;

  function quote(string) {
    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
      var c = meta[a];
      return typeof c === 'string' ?
        c :
        '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }

  function str(key, holder) {
    var i,
      k,
      v,
      length,
      mind = gap,
      partial,
      value = holder[key];
    if (value && typeof value === 'object' &&
      typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }
    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }
    switch (typeof value) {
      case 'string':
        return quote(value);
      case 'number':
        return isFinite(value) ? String(value) : 'null';
      case 'boolean':
      case 'null':
        return String(value);
      case 'object':
        if (!value) {
          return 'null';
        }
        gap += indent;
        partial = [];
        if (Object.prototype.toString.apply(value) === '[object Array]') {
          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }
          v = partial.length === 0 ?
            '[]' :
            gap ?
            '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
            '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }
        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === 'string') {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }
        v = partial.length === 0 ?
          '{}' :
          gap ?
          '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
          '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  }
  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function(value, replacer, space) {
      var i;
      gap = '';
      indent = '';
      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }
      } else if (typeof space === 'string') {
        indent = space;
      }
      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
        (typeof replacer !== 'object' ||
          typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      }
      return str('', {
        '': value
      });
    };
  }
  if (typeof JSON.parse !== 'function') {
    JSON.parse = function(text, reviver) {
      var j;

      function walk(holder, key) {
        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }
      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
        text = text.replace(cx, function(a) {
          return '\\u' +
            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }
      if (/^[\],:{}\s]*$/
        .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
          .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        j = eval('(' + text + ')');
        return typeof reviver === 'function' ?
          walk({
            '': j
          }, '') :
          j;
      }
      throw new SyntaxError('JSON.parse');
    };
  }
}());;
/*! RESOURCE: /scripts/reportlibs/moment.min.js */
! function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : e.moment = t()
}(this, function() {
  "use strict";

  function e() {
    return Qe.apply(null, arguments)
  }

  function t(e) {
    return e instanceof Array || "[object Array]" === Object.prototype.toString.call(e)
  }

  function n(e) {
    return null != e && "[object Object]" === Object.prototype.toString.call(e)
  }

  function s(e) {
    return void 0 === e
  }

  function i(e) {
    return "number" == typeof e || "[object Number]" === Object.prototype.toString.call(e)
  }

  function r(e) {
    return e instanceof Date || "[object Date]" === Object.prototype.toString.call(e)
  }

  function a(e, t) {
    var n, s = [];
    for (n = 0; n < e.length; ++n) s.push(t(e[n], n));
    return s
  }

  function o(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t)
  }

  function u(e, t) {
    for (var n in t) o(t, n) && (e[n] = t[n]);
    return o(t, "toString") && (e.toString = t.toString), o(t, "valueOf") && (e.valueOf = t.valueOf), e
  }

  function l(e, t, n, s) {
    return ge(e, t, n, s, !0).utc()
  }

  function d(e) {
    return null == e._pf && (e._pf = {
      empty: !1,
      unusedTokens: [],
      unusedInput: [],
      overflow: -2,
      charsLeftOver: 0,
      nullInput: !1,
      invalidMonth: null,
      invalidFormat: !1,
      userInvalidated: !1,
      iso: !1,
      parsedDateParts: [],
      meridiem: null,
      rfc2822: !1,
      weekdayMismatch: !1
    }), e._pf
  }

  function h(e) {
    if (null == e._isValid) {
      var t = d(e),
        n = Xe.call(t.parsedDateParts, function(e) {
          return null != e
        }),
        s = !isNaN(e._d.getTime()) && t.overflow < 0 && !t.empty && !t.invalidMonth && !t.invalidWeekday && !t.weekdayMismatch && !t.nullInput && !t.invalidFormat && !t.userInvalidated && (!t.meridiem || t.meridiem && n);
      if (e._strict && (s = s && 0 === t.charsLeftOver && 0 === t.unusedTokens.length && void 0 === t.bigHour), null != Object.isFrozen && Object.isFrozen(e)) return s;
      e._isValid = s
    }
    return e._isValid
  }

  function c(e) {
    var t = l(NaN);
    return null != e ? u(d(t), e) : d(t).userInvalidated = !0, t
  }

  function f(e, t) {
    var n, i, r;
    if (s(t._isAMomentObject) || (e._isAMomentObject = t._isAMomentObject), s(t._i) || (e._i = t._i), s(t._f) || (e._f = t._f), s(t._l) || (e._l = t._l), s(t._strict) || (e._strict = t._strict), s(t._tzm) || (e._tzm = t._tzm), s(t._isUTC) || (e._isUTC = t._isUTC), s(t._offset) || (e._offset = t._offset), s(t._pf) || (e._pf = d(t)), s(t._locale) || (e._locale = t._locale), Ke.length > 0)
      for (n = 0; n < Ke.length; n++) s(r = t[i = Ke[n]]) || (e[i] = r);
    return e
  }

  function m(t) {
    f(this, t), this._d = new Date(null != t._d ? t._d.getTime() : NaN), this.isValid() || (this._d = new Date(NaN)), !1 === et && (et = !0, e.updateOffset(this), et = !1)
  }

  function _(e) {
    return e instanceof m || null != e && null != e._isAMomentObject
  }

  function y(e) {
    return e < 0 ? Math.ceil(e) || 0 : Math.floor(e)
  }

  function g(e) {
    var t = +e,
      n = 0;
    return 0 !== t && isFinite(t) && (n = y(t)), n
  }

  function p(e, t, n) {
    var s, i = Math.min(e.length, t.length),
      r = Math.abs(e.length - t.length),
      a = 0;
    for (s = 0; s < i; s++)(n && e[s] !== t[s] || !n && g(e[s]) !== g(t[s])) && a++;
    return a + r
  }

  function w(t) {
    !1 === e.suppressDeprecationWarnings && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + t)
  }

  function v(t, n) {
    var s = !0;
    return u(function() {
      if (null != e.deprecationHandler && e.deprecationHandler(null, t), s) {
        for (var i, r = [], a = 0; a < arguments.length; a++) {
          if (i = "", "object" == typeof arguments[a]) {
            i += "\n[" + a + "] ";
            for (var o in arguments[0]) i += o + ": " + arguments[0][o] + ", ";
            i = i.slice(0, -2)
          } else i = arguments[a];
          r.push(i)
        }
        w(t + "\nArguments: " + Array.prototype.slice.call(r).join("") + "\n" + (new Error).stack), s = !1
      }
      return n.apply(this, arguments)
    }, n)
  }

  function M(t, n) {
    null != e.deprecationHandler && e.deprecationHandler(t, n), tt[t] || (w(n), tt[t] = !0)
  }

  function S(e) {
    return e instanceof Function || "[object Function]" === Object.prototype.toString.call(e)
  }

  function D(e, t) {
    var s, i = u({}, e);
    for (s in t) o(t, s) && (n(e[s]) && n(t[s]) ? (i[s] = {}, u(i[s], e[s]), u(i[s], t[s])) : null != t[s] ? i[s] = t[s] : delete i[s]);
    for (s in e) o(e, s) && !o(t, s) && n(e[s]) && (i[s] = u({}, i[s]));
    return i
  }

  function k(e) {
    null != e && this.set(e)
  }

  function Y(e, t) {
    var n = e.toLowerCase();
    st[n] = st[n + "s"] = st[t] = e
  }

  function O(e) {
    return "string" == typeof e ? st[e] || st[e.toLowerCase()] : void 0
  }

  function T(e) {
    var t, n, s = {};
    for (n in e) o(e, n) && (t = O(n)) && (s[t] = e[n]);
    return s
  }

  function x(e, t) {
    it[e] = t
  }

  function b(e, t, n) {
    var s = "" + Math.abs(e),
      i = t - s.length;
    return (e >= 0 ? n ? "+" : "" : "-") + Math.pow(10, Math.max(0, i)).toString().substr(1) + s
  }

  function P(e, t, n, s) {
    var i = s;
    "string" == typeof s && (i = function() {
      return this[s]()
    }), e && (ut[e] = i), t && (ut[t[0]] = function() {
      return b(i.apply(this, arguments), t[1], t[2])
    }), n && (ut[n] = function() {
      return this.localeData().ordinal(i.apply(this, arguments), e)
    })
  }

  function W(e) {
    return e.match(/\[[\s\S]/) ? e.replace(/^\[|\]$/g, "") : e.replace(/\\/g, "")
  }

  function H(e, t) {
    return e.isValid() ? (t = R(t, e.localeData()), ot[t] = ot[t] || function(e) {
      var t, n, s = e.match(rt);
      for (t = 0, n = s.length; t < n; t++) ut[s[t]] ? s[t] = ut[s[t]] : s[t] = W(s[t]);
      return function(t) {
        var i, r = "";
        for (i = 0; i < n; i++) r += S(s[i]) ? s[i].call(t, e) : s[i];
        return r
      }
    }(t), ot[t](e)) : e.localeData().invalidDate()
  }

  function R(e, t) {
    function n(e) {
      return t.longDateFormat(e) || e
    }
    var s = 5;
    for (at.lastIndex = 0; s >= 0 && at.test(e);) e = e.replace(at, n), at.lastIndex = 0, s -= 1;
    return e
  }

  function C(e, t, n) {
    Yt[e] = S(t) ? t : function(e, s) {
      return e && n ? n : t
    }
  }

  function F(e, t) {
    return o(Yt, e) ? Yt[e](t._strict, t._locale) : new RegExp(function(e) {
      return U(e.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(e, t, n, s, i) {
        return t || n || s || i
      }))
    }(e))
  }

  function U(e) {
    return e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  }

  function L(e, t) {
    var n, s = t;
    for ("string" == typeof e && (e = [e]), i(t) && (s = function(e, n) {
        n[t] = g(e)
      }), n = 0; n < e.length; n++) Ot[e[n]] = s
  }

  function N(e, t) {
    L(e, function(e, n, s, i) {
      s._w = s._w || {}, t(e, s._w, s, i)
    })
  }

  function G(e, t, n) {
    null != t && o(Ot, e) && Ot[e](t, n._a, n, e)
  }

  function V(e) {
    return E(e) ? 366 : 365
  }

  function E(e) {
    return e % 4 == 0 && e % 100 != 0 || e % 400 == 0
  }

  function I(t, n) {
    return function(s) {
      return null != s ? (j(this, t, s), e.updateOffset(this, n), this) : A(this, t)
    }
  }

  function A(e, t) {
    return e.isValid() ? e._d["get" + (e._isUTC ? "UTC" : "") + t]() : NaN
  }

  function j(e, t, n) {
    e.isValid() && !isNaN(n) && ("FullYear" === t && E(e.year()) && 1 === e.month() && 29 === e.date() ? e._d["set" + (e._isUTC ? "UTC" : "") + t](n, e.month(), Z(n, e.month())) : e._d["set" + (e._isUTC ? "UTC" : "") + t](n))
  }

  function Z(e, t) {
    if (isNaN(e) || isNaN(t)) return NaN;
    var n = function(e, t) {
      return (e % t + t) % t
    }(t, 12);
    return e += (t - n) / 12, 1 === n ? E(e) ? 29 : 28 : 31 - n % 7 % 2
  }

  function z(e, t) {
    var n;
    if (!e.isValid()) return e;
    if ("string" == typeof t)
      if (/^\d+$/.test(t)) t = g(t);
      else if (t = e.localeData().monthsParse(t), !i(t)) return e;
    return n = Math.min(e.date(), Z(e.year(), t)), e._d["set" + (e._isUTC ? "UTC" : "") + "Month"](t, n), e
  }

  function $(t) {
    return null != t ? (z(this, t), e.updateOffset(this, !0), this) : A(this, "Month")
  }

  function q() {
    function e(e, t) {
      return t.length - e.length
    }
    var t, n, s = [],
      i = [],
      r = [];
    for (t = 0; t < 12; t++) n = l([2e3, t]), s.push(this.monthsShort(n, "")), i.push(this.months(n, "")), r.push(this.months(n, "")), r.push(this.monthsShort(n, ""));
    for (s.sort(e), i.sort(e), r.sort(e), t = 0; t < 12; t++) s[t] = U(s[t]), i[t] = U(i[t]);
    for (t = 0; t < 24; t++) r[t] = U(r[t]);
    this._monthsRegex = new RegExp("^(" + r.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp("^(" + i.join("|") + ")", "i"), this._monthsShortStrictRegex = new RegExp("^(" + s.join("|") + ")", "i")
  }

  function J(e) {
    var t = new Date(Date.UTC.apply(null, arguments));
    return e < 100 && e >= 0 && isFinite(t.getUTCFullYear()) && t.setUTCFullYear(e), t
  }

  function B(e, t, n) {
    var s = 7 + t - n;
    return -((7 + J(e, 0, s).getUTCDay() - t) % 7) + s - 1
  }

  function Q(e, t, n, s, i) {
    var r, a, o = 1 + 7 * (t - 1) + (7 + n - s) % 7 + B(e, s, i);
    return o <= 0 ? a = V(r = e - 1) + o : o > V(e) ? (r = e + 1, a = o - V(e)) : (r = e, a = o), {
      year: r,
      dayOfYear: a
    }
  }

  function X(e, t, n) {
    var s, i, r = B(e.year(), t, n),
      a = Math.floor((e.dayOfYear() - r - 1) / 7) + 1;
    return a < 1 ? s = a + K(i = e.year() - 1, t, n) : a > K(e.year(), t, n) ? (s = a - K(e.year(), t, n), i = e.year() + 1) : (i = e.year(), s = a), {
      week: s,
      year: i
    }
  }

  function K(e, t, n) {
    var s = B(e, t, n),
      i = B(e + 1, t, n);
    return (V(e) - s + i) / 7
  }

  function ee() {
    function e(e, t) {
      return t.length - e.length
    }
    var t, n, s, i, r, a = [],
      o = [],
      u = [],
      d = [];
    for (t = 0; t < 7; t++) n = l([2e3, 1]).day(t), s = this.weekdaysMin(n, ""), i = this.weekdaysShort(n, ""), r = this.weekdays(n, ""), a.push(s), o.push(i), u.push(r), d.push(s), d.push(i), d.push(r);
    for (a.sort(e), o.sort(e), u.sort(e), d.sort(e), t = 0; t < 7; t++) o[t] = U(o[t]), u[t] = U(u[t]), d[t] = U(d[t]);
    this._weekdaysRegex = new RegExp("^(" + d.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp("^(" + u.join("|") + ")", "i"), this._weekdaysShortStrictRegex = new RegExp("^(" + o.join("|") + ")", "i"), this._weekdaysMinStrictRegex = new RegExp("^(" + a.join("|") + ")", "i")
  }

  function te() {
    return this.hours() % 12 || 12
  }

  function ne(e, t) {
    P(e, 0, 0, function() {
      return this.localeData().meridiem(this.hours(), this.minutes(), t)
    })
  }

  function se(e, t) {
    return t._meridiemParse
  }

  function ie(e) {
    return e ? e.toLowerCase().replace("_", "-") : e
  }

  function re(e) {
    var t = null;
    if (!Xt[e] && "undefined" != typeof module && module && module.exports) try {
      t = Jt._abbr;
      require("./locale/" + e), ae(t)
    } catch (e) {}
    return Xt[e]
  }

  function ae(e, t) {
    var n;
    return e && (n = s(t) ? ue(e) : oe(e, t)) && (Jt = n), Jt._abbr
  }

  function oe(e, t) {
    if (null !== t) {
      var n = Qt;
      if (t.abbr = e, null != Xt[e]) M("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."), n = Xt[e]._config;
      else if (null != t.parentLocale) {
        if (null == Xt[t.parentLocale]) return Kt[t.parentLocale] || (Kt[t.parentLocale] = []), Kt[t.parentLocale].push({
          name: e,
          config: t
        }), null;
        n = Xt[t.parentLocale]._config
      }
      return Xt[e] = new k(D(n, t)), Kt[e] && Kt[e].forEach(function(e) {
        oe(e.name, e.config)
      }), ae(e), Xt[e]
    }
    return delete Xt[e], null
  }

  function ue(e) {
    var n;
    if (e && e._locale && e._locale._abbr && (e = e._locale._abbr), !e) return Jt;
    if (!t(e)) {
      if (n = re(e)) return n;
      e = [e]
    }
    return function(e) {
      for (var t, n, s, i, r = 0; r < e.length;) {
        for (t = (i = ie(e[r]).split("-")).length, n = (n = ie(e[r + 1])) ? n.split("-") : null; t > 0;) {
          if (s = re(i.slice(0, t).join("-"))) return s;
          if (n && n.length >= t && p(i, n, !0) >= t - 1) break;
          t--
        }
        r++
      }
      return null
    }(e)
  }

  function le(e) {
    var t, n = e._a;
    return n && -2 === d(e).overflow && (t = n[xt] < 0 || n[xt] > 11 ? xt : n[bt] < 1 || n[bt] > Z(n[Tt], n[xt]) ? bt : n[Pt] < 0 || n[Pt] > 24 || 24 === n[Pt] && (0 !== n[Wt] || 0 !== n[Ht] || 0 !== n[Rt]) ? Pt : n[Wt] < 0 || n[Wt] > 59 ? Wt : n[Ht] < 0 || n[Ht] > 59 ? Ht : n[Rt] < 0 || n[Rt] > 999 ? Rt : -1, d(e)._overflowDayOfYear && (t < Tt || t > bt) && (t = bt), d(e)._overflowWeeks && -1 === t && (t = Ct), d(e)._overflowWeekday && -1 === t && (t = Ft), d(e).overflow = t), e
  }

  function de(e, t, n) {
    return null != e ? e : null != t ? t : n
  }

  function he(t) {
    var n, s, i, r, a, o = [];
    if (!t._d) {
      for (i = function(t) {
          var n = new Date(e.now());
          return t._useUTC ? [n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()] : [n.getFullYear(), n.getMonth(), n.getDate()]
        }(t), t._w && null == t._a[bt] && null == t._a[xt] && function(e) {
          var t, n, s, i, r, a, o, u;
          if (null != (t = e._w).GG || null != t.W || null != t.E) r = 1, a = 4, n = de(t.GG, e._a[Tt], X(pe(), 1, 4).year), s = de(t.W, 1), ((i = de(t.E, 1)) < 1 || i > 7) && (u = !0);
          else {
            r = e._locale._week.dow, a = e._locale._week.doy;
            var l = X(pe(), r, a);
            n = de(t.gg, e._a[Tt], l.year), s = de(t.w, l.week), null != t.d ? ((i = t.d) < 0 || i > 6) && (u = !0) : null != t.e ? (i = t.e + r, (t.e < 0 || t.e > 6) && (u = !0)) : i = r
          }
          s < 1 || s > K(n, r, a) ? d(e)._overflowWeeks = !0 : null != u ? d(e)._overflowWeekday = !0 : (o = Q(n, s, i, r, a), e._a[Tt] = o.year, e._dayOfYear = o.dayOfYear)
        }(t), null != t._dayOfYear && (a = de(t._a[Tt], i[Tt]), (t._dayOfYear > V(a) || 0 === t._dayOfYear) && (d(t)._overflowDayOfYear = !0), s = J(a, 0, t._dayOfYear), t._a[xt] = s.getUTCMonth(), t._a[bt] = s.getUTCDate()), n = 0; n < 3 && null == t._a[n]; ++n) t._a[n] = o[n] = i[n];
      for (; n < 7; n++) t._a[n] = o[n] = null == t._a[n] ? 2 === n ? 1 : 0 : t._a[n];
      24 === t._a[Pt] && 0 === t._a[Wt] && 0 === t._a[Ht] && 0 === t._a[Rt] && (t._nextDay = !0, t._a[Pt] = 0), t._d = (t._useUTC ? J : function(e, t, n, s, i, r, a) {
        var o = new Date(e, t, n, s, i, r, a);
        return e < 100 && e >= 0 && isFinite(o.getFullYear()) && o.setFullYear(e), o
      }).apply(null, o), r = t._useUTC ? t._d.getUTCDay() : t._d.getDay(), null != t._tzm && t._d.setUTCMinutes(t._d.getUTCMinutes() - t._tzm), t._nextDay && (t._a[Pt] = 24), t._w && void 0 !== t._w.d && t._w.d !== r && (d(t).weekdayMismatch = !0)
    }
  }

  function ce(e) {
    var t, n, s, i, r, a, o = e._i,
      u = en.exec(o) || tn.exec(o);
    if (u) {
      for (d(e).iso = !0, t = 0, n = sn.length; t < n; t++)
        if (sn[t][1].exec(u[1])) {
          i = sn[t][0], s = !1 !== sn[t][2];
          break
        }
      if (null == i) return void(e._isValid = !1);
      if (u[3]) {
        for (t = 0, n = rn.length; t < n; t++)
          if (rn[t][1].exec(u[3])) {
            r = (u[2] || " ") + rn[t][0];
            break
          }
        if (null == r) return void(e._isValid = !1)
      }
      if (!s && null != r) return void(e._isValid = !1);
      if (u[4]) {
        if (!nn.exec(u[4])) return void(e._isValid = !1);
        a = "Z"
      }
      e._f = i + (r || "") + (a || ""), _e(e)
    } else e._isValid = !1
  }

  function fe(e, t, n, s, i, r) {
    var a = [function(e) {
      var t = parseInt(e, 10); {
        if (t <= 49) return 2e3 + t;
        if (t <= 999) return 1900 + t
      }
      return t
    }(e), Vt.indexOf(t), parseInt(n, 10), parseInt(s, 10), parseInt(i, 10)];
    return r && a.push(parseInt(r, 10)), a
  }

  function me(e) {
    var t = on.exec(function(e) {
      return e.replace(/\([^)]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim()
    }(e._i));
    if (t) {
      var n = fe(t[4], t[3], t[2], t[5], t[6], t[7]);
      if (! function(e, t, n) {
          if (e && jt.indexOf(e) !== new Date(t[0], t[1], t[2]).getDay()) return d(n).weekdayMismatch = !0, n._isValid = !1, !1;
          return !0
        }(t[1], n, e)) return;
      e._a = n, e._tzm = function(e, t, n) {
        if (e) return un[e];
        if (t) return 0;
        var s = parseInt(n, 10),
          i = s % 100;
        return (s - i) / 100 * 60 + i
      }(t[8], t[9], t[10]), e._d = J.apply(null, e._a), e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), d(e).rfc2822 = !0
    } else e._isValid = !1
  }

  function _e(t) {
    if (t._f !== e.ISO_8601)
      if (t._f !== e.RFC_2822) {
        t._a = [], d(t).empty = !0;
        var n, s, i, r, a, o = "" + t._i,
          u = o.length,
          l = 0;
        for (i = R(t._f, t._locale).match(rt) || [], n = 0; n < i.length; n++) r = i[n], (s = (o.match(F(r, t)) || [])[0]) && ((a = o.substr(0, o.indexOf(s))).length > 0 && d(t).unusedInput.push(a), o = o.slice(o.indexOf(s) + s.length), l += s.length), ut[r] ? (s ? d(t).empty = !1 : d(t).unusedTokens.push(r), G(r, s, t)) : t._strict && !s && d(t).unusedTokens.push(r);
        d(t).charsLeftOver = u - l, o.length > 0 && d(t).unusedInput.push(o), t._a[Pt] <= 12 && !0 === d(t).bigHour && t._a[Pt] > 0 && (d(t).bigHour = void 0), d(t).parsedDateParts = t._a.slice(0), d(t).meridiem = t._meridiem, t._a[Pt] = function(e, t, n) {
          var s;
          if (null == n) return t;
          return null != e.meridiemHour ? e.meridiemHour(t, n) : null != e.isPM ? ((s = e.isPM(n)) && t < 12 && (t += 12), s || 12 !== t || (t = 0), t) : t
        }(t._locale, t._a[Pt], t._meridiem), he(t), le(t)
      } else me(t);
    else ce(t)
  }

  function ye(o) {
    var l = o._i,
      y = o._f;
    return o._locale = o._locale || ue(o._l), null === l || void 0 === y && "" === l ? c({
      nullInput: !0
    }) : ("string" == typeof l && (o._i = l = o._locale.preparse(l)), _(l) ? new m(le(l)) : (r(l) ? o._d = l : t(y) ? function(e) {
      var t, n, s, i, r;
      if (0 === e._f.length) return d(e).invalidFormat = !0, void(e._d = new Date(NaN));
      for (i = 0; i < e._f.length; i++) r = 0, t = f({}, e), null != e._useUTC && (t._useUTC = e._useUTC), t._f = e._f[i], _e(t), h(t) && (r += d(t).charsLeftOver, r += 10 * d(t).unusedTokens.length, d(t).score = r, (null == s || r < s) && (s = r, n = t));
      u(e, n || t)
    }(o) : y ? _e(o) : function(o) {
      var u = o._i;
      s(u) ? o._d = new Date(e.now()) : r(u) ? o._d = new Date(u.valueOf()) : "string" == typeof u ? function(t) {
        var n = an.exec(t._i);
        null === n ? (ce(t), !1 === t._isValid && (delete t._isValid, me(t), !1 === t._isValid && (delete t._isValid, e.createFromInputFallback(t)))) : t._d = new Date(+n[1])
      }(o) : t(u) ? (o._a = a(u.slice(0), function(e) {
        return parseInt(e, 10)
      }), he(o)) : n(u) ? function(e) {
        if (!e._d) {
          var t = T(e._i);
          e._a = a([t.year, t.month, t.day || t.date, t.hour, t.minute, t.second, t.millisecond], function(e) {
            return e && parseInt(e, 10)
          }), he(e)
        }
      }(o) : i(u) ? o._d = new Date(u) : e.createFromInputFallback(o)
    }(o), h(o) || (o._d = null), o))
  }

  function ge(e, s, i, r, a) {
    var o = {};
    return !0 !== i && !1 !== i || (r = i, i = void 0), (n(e) && function(e) {
        if (Object.getOwnPropertyNames) return 0 === Object.getOwnPropertyNames(e).length;
        var t;
        for (t in e)
          if (e.hasOwnProperty(t)) return !1;
        return !0
      }(e) || t(e) && 0 === e.length) && (e = void 0), o._isAMomentObject = !0, o._useUTC = o._isUTC = a, o._l = i, o._i = e, o._f = s, o._strict = r,
      function(e) {
        var t = new m(le(ye(e)));
        return t._nextDay && (t.add(1, "d"), t._nextDay = void 0), t
      }(o)
  }

  function pe(e, t, n, s) {
    return ge(e, t, n, s, !1)
  }

  function we(e, n) {
    var s, i;
    if (1 === n.length && t(n[0]) && (n = n[0]), !n.length) return pe();
    for (s = n[0], i = 1; i < n.length; ++i) n[i].isValid() && !n[i][e](s) || (s = n[i]);
    return s
  }

  function ve(e) {
    var t = T(e),
      n = t.year || 0,
      s = t.quarter || 0,
      i = t.month || 0,
      r = t.week || 0,
      a = t.day || 0,
      o = t.hour || 0,
      u = t.minute || 0,
      l = t.second || 0,
      d = t.millisecond || 0;
    this._isValid = function(e) {
      for (var t in e)
        if (-1 === Ut.call(hn, t) || null != e[t] && isNaN(e[t])) return !1;
      for (var n = !1, s = 0; s < hn.length; ++s)
        if (e[hn[s]]) {
          if (n) return !1;
          parseFloat(e[hn[s]]) !== g(e[hn[s]]) && (n = !0)
        }
      return !0
    }(t), this._milliseconds = +d + 1e3 * l + 6e4 * u + 1e3 * o * 60 * 60, this._days = +a + 7 * r, this._months = +i + 3 * s + 12 * n, this._data = {}, this._locale = ue(), this._bubble()
  }

  function Me(e) {
    return e instanceof ve
  }

  function Se(e) {
    return e < 0 ? -1 * Math.round(-1 * e) : Math.round(e)
  }

  function De(e, t) {
    P(e, 0, 0, function() {
      var e = this.utcOffset(),
        n = "+";
      return e < 0 && (e = -e, n = "-"), n + b(~~(e / 60), 2) + t + b(~~e % 60, 2)
    })
  }

  function ke(e, t) {
    var n = (t || "").match(e);
    if (null === n) return null;
    var s = ((n[n.length - 1] || []) + "").match(cn) || ["-", 0, 0],
      i = 60 * s[1] + g(s[2]);
    return 0 === i ? 0 : "+" === s[0] ? i : -i
  }

  function Ye(t, n) {
    var s, i;
    return n._isUTC ? (s = n.clone(), i = (_(t) || r(t) ? t.valueOf() : pe(t).valueOf()) - s.valueOf(), s._d.setTime(s._d.valueOf() + i), e.updateOffset(s, !1), s) : pe(t).local()
  }

  function Oe(e) {
    return 15 * -Math.round(e._d.getTimezoneOffset() / 15)
  }

  function Te() {
    return !!this.isValid() && (this._isUTC && 0 === this._offset)
  }

  function xe(e, t) {
    var n, s, r, a = e,
      u = null;
    return Me(e) ? a = {
      ms: e._milliseconds,
      d: e._days,
      M: e._months
    } : i(e) ? (a = {}, t ? a[t] = e : a.milliseconds = e) : (u = fn.exec(e)) ? (n = "-" === u[1] ? -1 : 1, a = {
      y: 0,
      d: g(u[bt]) * n,
      h: g(u[Pt]) * n,
      m: g(u[Wt]) * n,
      s: g(u[Ht]) * n,
      ms: g(Se(1e3 * u[Rt])) * n
    }) : (u = mn.exec(e)) ? (n = "-" === u[1] ? -1 : (u[1], 1), a = {
      y: be(u[2], n),
      M: be(u[3], n),
      w: be(u[4], n),
      d: be(u[5], n),
      h: be(u[6], n),
      m: be(u[7], n),
      s: be(u[8], n)
    }) : null == a ? a = {} : "object" == typeof a && ("from" in a || "to" in a) && (r = function(e, t) {
      var n;
      if (!e.isValid() || !t.isValid()) return {
        milliseconds: 0,
        months: 0
      };
      t = Ye(t, e), e.isBefore(t) ? n = Pe(e, t) : ((n = Pe(t, e)).milliseconds = -n.milliseconds, n.months = -n.months);
      return n
    }(pe(a.from), pe(a.to)), (a = {}).ms = r.milliseconds, a.M = r.months), s = new ve(a), Me(e) && o(e, "_locale") && (s._locale = e._locale), s
  }

  function be(e, t) {
    var n = e && parseFloat(e.replace(",", "."));
    return (isNaN(n) ? 0 : n) * t
  }

  function Pe(e, t) {
    var n = {
      milliseconds: 0,
      months: 0
    };
    return n.months = t.month() - e.month() + 12 * (t.year() - e.year()), e.clone().add(n.months, "M").isAfter(t) && --n.months, n.milliseconds = +t - +e.clone().add(n.months, "M"), n
  }

  function We(e, t) {
    return function(n, s) {
      var i, r;
      return null === s || isNaN(+s) || (M(t, "moment()." + t + "(period, number) is deprecated. Please use moment()." + t + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."), r = n, n = s, s = r), n = "string" == typeof n ? +n : n, i = xe(n, s), He(this, i, e), this
    }
  }

  function He(t, n, s, i) {
    var r = n._milliseconds,
      a = Se(n._days),
      o = Se(n._months);
    t.isValid() && (i = null == i || i, o && z(t, A(t, "Month") + o * s), a && j(t, "Date", A(t, "Date") + a * s), r && t._d.setTime(t._d.valueOf() + r * s), i && e.updateOffset(t, a || o))
  }

  function Re(e, t) {
    var n, s = 12 * (t.year() - e.year()) + (t.month() - e.month()),
      i = e.clone().add(s, "months");
    return n = t - i < 0 ? (t - i) / (i - e.clone().add(s - 1, "months")) : (t - i) / (e.clone().add(s + 1, "months") - i), -(s + n) || 0
  }

  function Ce(e) {
    var t;
    return void 0 === e ? this._locale._abbr : (null != (t = ue(e)) && (this._locale = t), this)
  }

  function Fe() {
    return this._locale
  }

  function Ue(e, t) {
    P(0, [e, e.length], 0, t)
  }

  function Le(e, t, n, s, i) {
    var r;
    return null == e ? X(this, s, i).year : (r = K(e, s, i), t > r && (t = r), function(e, t, n, s, i) {
      var r = Q(e, t, n, s, i),
        a = J(r.year, 0, r.dayOfYear);
      return this.year(a.getUTCFullYear()), this.month(a.getUTCMonth()), this.date(a.getUTCDate()), this
    }.call(this, e, t, n, s, i))
  }

  function Ne(e, t) {
    t[Rt] = g(1e3 * ("0." + e))
  }

  function Ge(e) {
    return e
  }

  function Ve(e, t, n, s) {
    var i = ue(),
      r = l().set(s, t);
    return i[n](r, e)
  }

  function Ee(e, t, n) {
    if (i(e) && (t = e, e = void 0), e = e || "", null != t) return Ve(e, t, n, "month");
    var s, r = [];
    for (s = 0; s < 12; s++) r[s] = Ve(e, s, n, "month");
    return r
  }

  function Ie(e, t, n, s) {
    "boolean" == typeof e ? (i(t) && (n = t, t = void 0), t = t || "") : (n = t = e, e = !1, i(t) && (n = t, t = void 0), t = t || "");
    var r = ue(),
      a = e ? r._week.dow : 0;
    if (null != n) return Ve(t, (n + a) % 7, s, "day");
    var o, u = [];
    for (o = 0; o < 7; o++) u[o] = Ve(t, (o + a) % 7, s, "day");
    return u
  }

  function Ae(e, t, n, s) {
    var i = xe(t, n);
    return e._milliseconds += s * i._milliseconds, e._days += s * i._days, e._months += s * i._months, e._bubble()
  }

  function je(e) {
    return e < 0 ? Math.floor(e) : Math.ceil(e)
  }

  function Ze(e) {
    return 4800 * e / 146097
  }

  function ze(e) {
    return 146097 * e / 4800
  }

  function $e(e) {
    return function() {
      return this.as(e)
    }
  }

  function qe(e) {
    return function() {
      return this.isValid() ? this._data[e] : NaN
    }
  }

  function Je(e) {
    return (e > 0) - (e < 0) || +e
  }

  function Be() {
    if (!this.isValid()) return this.localeData().invalidDate();
    var e, t, n = An(this._milliseconds) / 1e3,
      s = An(this._days),
      i = An(this._months);
    t = y((e = y(n / 60)) / 60), n %= 60, e %= 60;
    var r = y(i / 12),
      a = i %= 12,
      o = s,
      u = t,
      l = e,
      d = n ? n.toFixed(3).replace(/\.?0+$/, "") : "",
      h = this.asSeconds();
    if (!h) return "P0D";
    var c = h < 0 ? "-" : "",
      f = Je(this._months) !== Je(h) ? "-" : "",
      m = Je(this._days) !== Je(h) ? "-" : "",
      _ = Je(this._milliseconds) !== Je(h) ? "-" : "";
    return c + "P" + (r ? f + r + "Y" : "") + (a ? f + a + "M" : "") + (o ? m + o + "D" : "") + (u || l || d ? "T" : "") + (u ? _ + u + "H" : "") + (l ? _ + l + "M" : "") + (d ? _ + d + "S" : "")
  }
  var Qe, Xe;
  Xe = Array.prototype.some ? Array.prototype.some : function(e) {
    for (var t = Object(this), n = t.length >>> 0, s = 0; s < n; s++)
      if (s in t && e.call(this, t[s], s, t)) return !0;
    return !1
  };
  var Ke = e.momentProperties = [],
    et = !1,
    tt = {};
  e.suppressDeprecationWarnings = !1, e.deprecationHandler = null;
  var nt;
  nt = Object.keys ? Object.keys : function(e) {
    var t, n = [];
    for (t in e) o(e, t) && n.push(t);
    return n
  };
  var st = {},
    it = {},
    rt = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
    at = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
    ot = {},
    ut = {},
    lt = /\d/,
    dt = /\d\d/,
    ht = /\d{3}/,
    ct = /\d{4}/,
    ft = /[+-]?\d{6}/,
    mt = /\d\d?/,
    _t = /\d\d\d\d?/,
    yt = /\d\d\d\d\d\d?/,
    gt = /\d{1,3}/,
    pt = /\d{1,4}/,
    wt = /[+-]?\d{1,6}/,
    vt = /\d+/,
    Mt = /[+-]?\d+/,
    St = /Z|[+-]\d\d:?\d\d/gi,
    Dt = /Z|[+-]\d\d(?::?\d\d)?/gi,
    kt = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
    Yt = {},
    Ot = {},
    Tt = 0,
    xt = 1,
    bt = 2,
    Pt = 3,
    Wt = 4,
    Ht = 5,
    Rt = 6,
    Ct = 7,
    Ft = 8;
  P("Y", 0, 0, function() {
    var e = this.year();
    return e <= 9999 ? "" + e : "+" + e
  }), P(0, ["YY", 2], 0, function() {
    return this.year() % 100
  }), P(0, ["YYYY", 4], 0, "year"), P(0, ["YYYYY", 5], 0, "year"), P(0, ["YYYYYY", 6, !0], 0, "year"), Y("year", "y"), x("year", 1), C("Y", Mt), C("YY", mt, dt), C("YYYY", pt, ct), C("YYYYY", wt, ft), C("YYYYYY", wt, ft), L(["YYYYY", "YYYYYY"], Tt), L("YYYY", function(t, n) {
    n[Tt] = 2 === t.length ? e.parseTwoDigitYear(t) : g(t)
  }), L("YY", function(t, n) {
    n[Tt] = e.parseTwoDigitYear(t)
  }), L("Y", function(e, t) {
    t[Tt] = parseInt(e, 10)
  }), e.parseTwoDigitYear = function(e) {
    return g(e) + (g(e) > 68 ? 1900 : 2e3)
  };
  var Ut, Lt = I("FullYear", !0);
  Ut = Array.prototype.indexOf ? Array.prototype.indexOf : function(e) {
    var t;
    for (t = 0; t < this.length; ++t)
      if (this[t] === e) return t;
    return -1
  }, P("M", ["MM", 2], "Mo", function() {
    return this.month() + 1
  }), P("MMM", 0, 0, function(e) {
    return this.localeData().monthsShort(this, e)
  }), P("MMMM", 0, 0, function(e) {
    return this.localeData().months(this, e)
  }), Y("month", "M"), x("month", 8), C("M", mt), C("MM", mt, dt), C("MMM", function(e, t) {
    return t.monthsShortRegex(e)
  }), C("MMMM", function(e, t) {
    return t.monthsRegex(e)
  }), L(["M", "MM"], function(e, t) {
    t[xt] = g(e) - 1
  }), L(["MMM", "MMMM"], function(e, t, n, s) {
    var i = n._locale.monthsParse(e, s, n._strict);
    null != i ? t[xt] = i : d(n).invalidMonth = e
  });
  var Nt = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
    Gt = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    Vt = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    Et = kt,
    It = kt;
  P("w", ["ww", 2], "wo", "week"), P("W", ["WW", 2], "Wo", "isoWeek"), Y("week", "w"), Y("isoWeek", "W"), x("week", 5), x("isoWeek", 5), C("w", mt), C("ww", mt, dt), C("W", mt), C("WW", mt, dt), N(["w", "ww", "W", "WW"], function(e, t, n, s) {
    t[s.substr(0, 1)] = g(e)
  });
  P("d", 0, "do", "day"), P("dd", 0, 0, function(e) {
    return this.localeData().weekdaysMin(this, e)
  }), P("ddd", 0, 0, function(e) {
    return this.localeData().weekdaysShort(this, e)
  }), P("dddd", 0, 0, function(e) {
    return this.localeData().weekdays(this, e)
  }), P("e", 0, 0, "weekday"), P("E", 0, 0, "isoWeekday"), Y("day", "d"), Y("weekday", "e"), Y("isoWeekday", "E"), x("day", 11), x("weekday", 11), x("isoWeekday", 11), C("d", mt), C("e", mt), C("E", mt), C("dd", function(e, t) {
    return t.weekdaysMinRegex(e)
  }), C("ddd", function(e, t) {
    return t.weekdaysShortRegex(e)
  }), C("dddd", function(e, t) {
    return t.weekdaysRegex(e)
  }), N(["dd", "ddd", "dddd"], function(e, t, n, s) {
    var i = n._locale.weekdaysParse(e, s, n._strict);
    null != i ? t.d = i : d(n).invalidWeekday = e
  }), N(["d", "e", "E"], function(e, t, n, s) {
    t[s] = g(e)
  });
  var At = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    jt = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    Zt = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    zt = kt,
    $t = kt,
    qt = kt;
  P("H", ["HH", 2], 0, "hour"), P("h", ["hh", 2], 0, te), P("k", ["kk", 2], 0, function() {
    return this.hours() || 24
  }), P("hmm", 0, 0, function() {
    return "" + te.apply(this) + b(this.minutes(), 2)
  }), P("hmmss", 0, 0, function() {
    return "" + te.apply(this) + b(this.minutes(), 2) + b(this.seconds(), 2)
  }), P("Hmm", 0, 0, function() {
    return "" + this.hours() + b(this.minutes(), 2)
  }), P("Hmmss", 0, 0, function() {
    return "" + this.hours() + b(this.minutes(), 2) + b(this.seconds(), 2)
  }), ne("a", !0), ne("A", !1), Y("hour", "h"), x("hour", 13), C("a", se), C("A", se), C("H", mt), C("h", mt), C("k", mt), C("HH", mt, dt), C("hh", mt, dt), C("kk", mt, dt), C("hmm", _t), C("hmmss", yt), C("Hmm", _t), C("Hmmss", yt), L(["H", "HH"], Pt), L(["k", "kk"], function(e, t, n) {
    var s = g(e);
    t[Pt] = 24 === s ? 0 : s
  }), L(["a", "A"], function(e, t, n) {
    n._isPm = n._locale.isPM(e), n._meridiem = e
  }), L(["h", "hh"], function(e, t, n) {
    t[Pt] = g(e), d(n).bigHour = !0
  }), L("hmm", function(e, t, n) {
    var s = e.length - 2;
    t[Pt] = g(e.substr(0, s)), t[Wt] = g(e.substr(s)), d(n).bigHour = !0
  }), L("hmmss", function(e, t, n) {
    var s = e.length - 4,
      i = e.length - 2;
    t[Pt] = g(e.substr(0, s)), t[Wt] = g(e.substr(s, 2)), t[Ht] = g(e.substr(i)), d(n).bigHour = !0
  }), L("Hmm", function(e, t, n) {
    var s = e.length - 2;
    t[Pt] = g(e.substr(0, s)), t[Wt] = g(e.substr(s))
  }), L("Hmmss", function(e, t, n) {
    var s = e.length - 4,
      i = e.length - 2;
    t[Pt] = g(e.substr(0, s)), t[Wt] = g(e.substr(s, 2)), t[Ht] = g(e.substr(i))
  });
  var Jt, Bt = I("Hours", !0),
    Qt = {
      calendar: {
        sameDay: "[Today at] LT",
        nextDay: "[Tomorrow at] LT",
        nextWeek: "dddd [at] LT",
        lastDay: "[Yesterday at] LT",
        lastWeek: "[Last] dddd [at] LT",
        sameElse: "L"
      },
      longDateFormat: {
        LTS: "h:mm:ss A",
        LT: "h:mm A",
        L: "MM/DD/YYYY",
        LL: "MMMM D, YYYY",
        LLL: "MMMM D, YYYY h:mm A",
        LLLL: "dddd, MMMM D, YYYY h:mm A"
      },
      invalidDate: "Invalid date",
      ordinal: "%d",
      dayOfMonthOrdinalParse: /\d{1,2}/,
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "a few seconds",
        ss: "%d seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
      },
      months: Gt,
      monthsShort: Vt,
      week: {
        dow: 0,
        doy: 6
      },
      weekdays: At,
      weekdaysMin: Zt,
      weekdaysShort: jt,
      meridiemParse: /[ap]\.?m?\.?/i
    },
    Xt = {},
    Kt = {},
    en = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
    tn = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
    nn = /Z|[+-]\d\d(?::?\d\d)?/,
    sn = [
      ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
      ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
      ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
      ["GGGG-[W]WW", /\d{4}-W\d\d/, !1],
      ["YYYY-DDD", /\d{4}-\d{3}/],
      ["YYYY-MM", /\d{4}-\d\d/, !1],
      ["YYYYYYMMDD", /[+-]\d{10}/],
      ["YYYYMMDD", /\d{8}/],
      ["GGGG[W]WWE", /\d{4}W\d{3}/],
      ["GGGG[W]WW", /\d{4}W\d{2}/, !1],
      ["YYYYDDD", /\d{7}/]
    ],
    rn = [
      ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
      ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
      ["HH:mm:ss", /\d\d:\d\d:\d\d/],
      ["HH:mm", /\d\d:\d\d/],
      ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
      ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
      ["HHmmss", /\d\d\d\d\d\d/],
      ["HHmm", /\d\d\d\d/],
      ["HH", /\d\d/]
    ],
    an = /^\/?Date\((\-?\d+)/i,
    on = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
    un = {
      UT: 0,
      GMT: 0,
      EDT: -240,
      EST: -300,
      CDT: -300,
      CST: -360,
      MDT: -360,
      MST: -420,
      PDT: -420,
      PST: -480
    };
  e.createFromInputFallback = v("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function(e) {
    e._d = new Date(e._i + (e._useUTC ? " UTC" : ""))
  }), e.ISO_8601 = function() {}, e.RFC_2822 = function() {};
  var ln = v("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
      var e = pe.apply(null, arguments);
      return this.isValid() && e.isValid() ? e < this ? this : e : c()
    }),
    dn = v("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
      var e = pe.apply(null, arguments);
      return this.isValid() && e.isValid() ? e > this ? this : e : c()
    }),
    hn = ["year", "quarter", "month", "week", "day", "hour", "minute", "second", "millisecond"];
  De("Z", ":"), De("ZZ", ""), C("Z", Dt), C("ZZ", Dt), L(["Z", "ZZ"], function(e, t, n) {
    n._useUTC = !0, n._tzm = ke(Dt, e)
  });
  var cn = /([\+\-]|\d\d)/gi;
  e.updateOffset = function() {};
  var fn = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,
    mn = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
  xe.fn = ve.prototype, xe.invalid = function() {
    return xe(NaN)
  };
  var _n = We(1, "add"),
    yn = We(-1, "subtract");
  e.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ", e.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
  var gn = v("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function(e) {
    return void 0 === e ? this.localeData() : this.locale(e)
  });
  P(0, ["gg", 2], 0, function() {
    return this.weekYear() % 100
  }), P(0, ["GG", 2], 0, function() {
    return this.isoWeekYear() % 100
  }), Ue("gggg", "weekYear"), Ue("ggggg", "weekYear"), Ue("GGGG", "isoWeekYear"), Ue("GGGGG", "isoWeekYear"), Y("weekYear", "gg"), Y("isoWeekYear", "GG"), x("weekYear", 1), x("isoWeekYear", 1), C("G", Mt), C("g", Mt), C("GG", mt, dt), C("gg", mt, dt), C("GGGG", pt, ct), C("gggg", pt, ct), C("GGGGG", wt, ft), C("ggggg", wt, ft), N(["gggg", "ggggg", "GGGG", "GGGGG"], function(e, t, n, s) {
    t[s.substr(0, 2)] = g(e)
  }), N(["gg", "GG"], function(t, n, s, i) {
    n[i] = e.parseTwoDigitYear(t)
  }), P("Q", 0, "Qo", "quarter"), Y("quarter", "Q"), x("quarter", 7), C("Q", lt), L("Q", function(e, t) {
    t[xt] = 3 * (g(e) - 1)
  }), P("D", ["DD", 2], "Do", "date"), Y("date", "D"), x("date", 9), C("D", mt), C("DD", mt, dt), C("Do", function(e, t) {
    return e ? t._dayOfMonthOrdinalParse || t._ordinalParse : t._dayOfMonthOrdinalParseLenient
  }), L(["D", "DD"], bt), L("Do", function(e, t) {
    t[bt] = g(e.match(mt)[0])
  });
  var pn = I("Date", !0);
  P("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), Y("dayOfYear", "DDD"), x("dayOfYear", 4), C("DDD", gt), C("DDDD", ht), L(["DDD", "DDDD"], function(e, t, n) {
    n._dayOfYear = g(e)
  }), P("m", ["mm", 2], 0, "minute"), Y("minute", "m"), x("minute", 14), C("m", mt), C("mm", mt, dt), L(["m", "mm"], Wt);
  var wn = I("Minutes", !1);
  P("s", ["ss", 2], 0, "second"), Y("second", "s"), x("second", 15), C("s", mt), C("ss", mt, dt), L(["s", "ss"], Ht);
  var vn = I("Seconds", !1);
  P("S", 0, 0, function() {
    return ~~(this.millisecond() / 100)
  }), P(0, ["SS", 2], 0, function() {
    return ~~(this.millisecond() / 10)
  }), P(0, ["SSS", 3], 0, "millisecond"), P(0, ["SSSS", 4], 0, function() {
    return 10 * this.millisecond()
  }), P(0, ["SSSSS", 5], 0, function() {
    return 100 * this.millisecond()
  }), P(0, ["SSSSSS", 6], 0, function() {
    return 1e3 * this.millisecond()
  }), P(0, ["SSSSSSS", 7], 0, function() {
    return 1e4 * this.millisecond()
  }), P(0, ["SSSSSSSS", 8], 0, function() {
    return 1e5 * this.millisecond()
  }), P(0, ["SSSSSSSSS", 9], 0, function() {
    return 1e6 * this.millisecond()
  }), Y("millisecond", "ms"), x("millisecond", 16), C("S", gt, lt), C("SS", gt, dt), C("SSS", gt, ht);
  var Mn;
  for (Mn = "SSSS"; Mn.length <= 9; Mn += "S") C(Mn, vt);
  for (Mn = "S"; Mn.length <= 9; Mn += "S") L(Mn, Ne);
  var Sn = I("Milliseconds", !1);
  P("z", 0, 0, "zoneAbbr"), P("zz", 0, 0, "zoneName");
  var Dn = m.prototype;
  Dn.add = _n, Dn.calendar = function(t, n) {
    var s = t || pe(),
      i = Ye(s, this).startOf("day"),
      r = e.calendarFormat(this, i) || "sameElse",
      a = n && (S(n[r]) ? n[r].call(this, s) : n[r]);
    return this.format(a || this.localeData().calendar(r, this, pe(s)))
  }, Dn.clone = function() {
    return new m(this)
  }, Dn.diff = function(e, t, n) {
    var s, i, r;
    if (!this.isValid()) return NaN;
    if (!(s = Ye(e, this)).isValid()) return NaN;
    switch (i = 6e4 * (s.utcOffset() - this.utcOffset()), t = O(t)) {
      case "year":
        r = Re(this, s) / 12;
        break;
      case "month":
        r = Re(this, s);
        break;
      case "quarter":
        r = Re(this, s) / 3;
        break;
      case "second":
        r = (this - s) / 1e3;
        break;
      case "minute":
        r = (this - s) / 6e4;
        break;
      case "hour":
        r = (this - s) / 36e5;
        break;
      case "day":
        r = (this - s - i) / 864e5;
        break;
      case "week":
        r = (this - s - i) / 6048e5;
        break;
      default:
        r = this - s
    }
    return n ? r : y(r)
  }, Dn.endOf = function(e) {
    return void 0 === (e = O(e)) || "millisecond" === e ? this : ("date" === e && (e = "day"), this.startOf(e).add(1, "isoWeek" === e ? "week" : e).subtract(1, "ms"))
  }, Dn.format = function(t) {
    t || (t = this.isUtc() ? e.defaultFormatUtc : e.defaultFormat);
    var n = H(this, t);
    return this.localeData().postformat(n)
  }, Dn.from = function(e, t) {
    return this.isValid() && (_(e) && e.isValid() || pe(e).isValid()) ? xe({
      to: this,
      from: e
    }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate()
  }, Dn.fromNow = function(e) {
    return this.from(pe(), e)
  }, Dn.to = function(e, t) {
    return this.isValid() && (_(e) && e.isValid() || pe(e).isValid()) ? xe({
      from: this,
      to: e
    }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate()
  }, Dn.toNow = function(e) {
    return this.to(pe(), e)
  }, Dn.get = function(e) {
    return e = O(e), S(this[e]) ? this[e]() : this
  }, Dn.invalidAt = function() {
    return d(this).overflow
  }, Dn.isAfter = function(e, t) {
    var n = _(e) ? e : pe(e);
    return !(!this.isValid() || !n.isValid()) && ("millisecond" === (t = O(s(t) ? "millisecond" : t)) ? this.valueOf() > n.valueOf() : n.valueOf() < this.clone().startOf(t).valueOf())
  }, Dn.isBefore = function(e, t) {
    var n = _(e) ? e : pe(e);
    return !(!this.isValid() || !n.isValid()) && ("millisecond" === (t = O(s(t) ? "millisecond" : t)) ? this.valueOf() < n.valueOf() : this.clone().endOf(t).valueOf() < n.valueOf())
  }, Dn.isBetween = function(e, t, n, s) {
    return ("(" === (s = s || "()")[0] ? this.isAfter(e, n) : !this.isBefore(e, n)) && (")" === s[1] ? this.isBefore(t, n) : !this.isAfter(t, n))
  }, Dn.isSame = function(e, t) {
    var n, s = _(e) ? e : pe(e);
    return !(!this.isValid() || !s.isValid()) && ("millisecond" === (t = O(t || "millisecond")) ? this.valueOf() === s.valueOf() : (n = s.valueOf(), this.clone().startOf(t).valueOf() <= n && n <= this.clone().endOf(t).valueOf()))
  }, Dn.isSameOrAfter = function(e, t) {
    return this.isSame(e, t) || this.isAfter(e, t)
  }, Dn.isSameOrBefore = function(e, t) {
    return this.isSame(e, t) || this.isBefore(e, t)
  }, Dn.isValid = function() {
    return h(this)
  }, Dn.lang = gn, Dn.locale = Ce, Dn.localeData = Fe, Dn.max = dn, Dn.min = ln, Dn.parsingFlags = function() {
    return u({}, d(this))
  }, Dn.set = function(e, t) {
    if ("object" == typeof e)
      for (var n = function(e) {
          var t = [];
          for (var n in e) t.push({
            unit: n,
            priority: it[n]
          });
          return t.sort(function(e, t) {
            return e.priority - t.priority
          }), t
        }(e = T(e)), s = 0; s < n.length; s++) this[n[s].unit](e[n[s].unit]);
    else if (e = O(e), S(this[e])) return this[e](t);
    return this
  }, Dn.startOf = function(e) {
    switch (e = O(e)) {
      case "year":
        this.month(0);
      case "quarter":
      case "month":
        this.date(1);
      case "week":
      case "isoWeek":
      case "day":
      case "date":
        this.hours(0);
      case "hour":
        this.minutes(0);
      case "minute":
        this.seconds(0);
      case "second":
        this.milliseconds(0)
    }
    return "week" === e && this.weekday(0), "isoWeek" === e && this.isoWeekday(1), "quarter" === e && this.month(3 * Math.floor(this.month() / 3)), this
  }, Dn.subtract = yn, Dn.toArray = function() {
    return [this.year(), this.month(), this.date(), this.hour(), this.minute(), this.second(), this.millisecond()]
  }, Dn.toObject = function() {
    return {
      years: this.year(),
      months: this.month(),
      date: this.date(),
      hours: this.hours(),
      minutes: this.minutes(),
      seconds: this.seconds(),
      milliseconds: this.milliseconds()
    }
  }, Dn.toDate = function() {
    return new Date(this.valueOf())
  }, Dn.toISOString = function(e) {
    if (!this.isValid()) return null;
    var t = !0 !== e,
      n = t ? this.clone().utc() : this;
    return n.year() < 0 || n.year() > 9999 ? H(n, t ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ") : S(Date.prototype.toISOString) ? t ? this.toDate().toISOString() : new Date(this._d.valueOf()).toISOString().replace("Z", H(n, "Z")) : H(n, t ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ")
  }, Dn.inspect = function() {
    if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)";
    var e = "moment",
      t = "";
    this.isLocal() || (e = 0 === this.utcOffset() ? "moment.utc" : "moment.parseZone", t = "Z");
    var n = "[" + e + '("]',
      s = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY",
      i = t + '[")]';
    return this.format(n + s + "-MM-DD[T]HH:mm:ss.SSS" + i)
  }, Dn.toJSON = function() {
    return this.isValid() ? this.toISOString() : null
  }, Dn.toString = function() {
    return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")
  }, Dn.unix = function() {
    return Math.floor(this.valueOf() / 1e3)
  }, Dn.valueOf = function() {
    return this._d.valueOf() - 6e4 * (this._offset || 0)
  }, Dn.creationData = function() {
    return {
      input: this._i,
      format: this._f,
      locale: this._locale,
      isUTC: this._isUTC,
      strict: this._strict
    }
  }, Dn.year = Lt, Dn.isLeapYear = function() {
    return E(this.year())
  }, Dn.weekYear = function(e) {
    return Le.call(this, e, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy)
  }, Dn.isoWeekYear = function(e) {
    return Le.call(this, e, this.isoWeek(), this.isoWeekday(), 1, 4)
  }, Dn.quarter = Dn.quarters = function(e) {
    return null == e ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (e - 1) + this.month() % 3)
  }, Dn.month = $, Dn.daysInMonth = function() {
    return Z(this.year(), this.month())
  }, Dn.week = Dn.weeks = function(e) {
    var t = this.localeData().week(this);
    return null == e ? t : this.add(7 * (e - t), "d")
  }, Dn.isoWeek = Dn.isoWeeks = function(e) {
    var t = X(this, 1, 4).week;
    return null == e ? t : this.add(7 * (e - t), "d")
  }, Dn.weeksInYear = function() {
    var e = this.localeData()._week;
    return K(this.year(), e.dow, e.doy)
  }, Dn.isoWeeksInYear = function() {
    return K(this.year(), 1, 4)
  }, Dn.date = pn, Dn.day = Dn.days = function(e) {
    if (!this.isValid()) return null != e ? this : NaN;
    var t = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
    return null != e ? (e = function(e, t) {
      return "string" != typeof e ? e : isNaN(e) ? "number" == typeof(e = t.weekdaysParse(e)) ? e : null : parseInt(e, 10)
    }(e, this.localeData()), this.add(e - t, "d")) : t
  }, Dn.weekday = function(e) {
    if (!this.isValid()) return null != e ? this : NaN;
    var t = (this.day() + 7 - this.localeData()._week.dow) % 7;
    return null == e ? t : this.add(e - t, "d")
  }, Dn.isoWeekday = function(e) {
    if (!this.isValid()) return null != e ? this : NaN;
    if (null != e) {
      var t = function(e, t) {
        return "string" == typeof e ? t.weekdaysParse(e) % 7 || 7 : isNaN(e) ? null : e
      }(e, this.localeData());
      return this.day(this.day() % 7 ? t : t - 7)
    }
    return this.day() || 7
  }, Dn.dayOfYear = function(e) {
    var t = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;
    return null == e ? t : this.add(e - t, "d")
  }, Dn.hour = Dn.hours = Bt, Dn.minute = Dn.minutes = wn, Dn.second = Dn.seconds = vn, Dn.millisecond = Dn.milliseconds = Sn, Dn.utcOffset = function(t, n, s) {
    var i, r = this._offset || 0;
    if (!this.isValid()) return null != t ? this : NaN;
    if (null != t) {
      if ("string" == typeof t) {
        if (null === (t = ke(Dt, t))) return this
      } else Math.abs(t) < 16 && !s && (t *= 60);
      return !this._isUTC && n && (i = Oe(this)), this._offset = t, this._isUTC = !0, null != i && this.add(i, "m"), r !== t && (!n || this._changeInProgress ? He(this, xe(t - r, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, e.updateOffset(this, !0), this._changeInProgress = null)), this
    }
    return this._isUTC ? r : Oe(this)
  }, Dn.utc = function(e) {
    return this.utcOffset(0, e)
  }, Dn.local = function(e) {
    return this._isUTC && (this.utcOffset(0, e), this._isUTC = !1, e && this.subtract(Oe(this), "m")), this
  }, Dn.parseZone = function() {
    if (null != this._tzm) this.utcOffset(this._tzm, !1, !0);
    else if ("string" == typeof this._i) {
      var e = ke(St, this._i);
      null != e ? this.utcOffset(e) : this.utcOffset(0, !0)
    }
    return this
  }, Dn.hasAlignedHourOffset = function(e) {
    return !!this.isValid() && (e = e ? pe(e).utcOffset() : 0, (this.utcOffset() - e) % 60 == 0)
  }, Dn.isDST = function() {
    return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset()
  }, Dn.isLocal = function() {
    return !!this.isValid() && !this._isUTC
  }, Dn.isUtcOffset = function() {
    return !!this.isValid() && this._isUTC
  }, Dn.isUtc = Te, Dn.isUTC = Te, Dn.zoneAbbr = function() {
    return this._isUTC ? "UTC" : ""
  }, Dn.zoneName = function() {
    return this._isUTC ? "Coordinated Universal Time" : ""
  }, Dn.dates = v("dates accessor is deprecated. Use date instead.", pn), Dn.months = v("months accessor is deprecated. Use month instead", $), Dn.years = v("years accessor is deprecated. Use year instead", Lt), Dn.zone = v("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", function(e, t) {
    return null != e ? ("string" != typeof e && (e = -e), this.utcOffset(e, t), this) : -this.utcOffset()
  }), Dn.isDSTShifted = v("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", function() {
    if (!s(this._isDSTShifted)) return this._isDSTShifted;
    var e = {};
    if (f(e, this), (e = ye(e))._a) {
      var t = e._isUTC ? l(e._a) : pe(e._a);
      this._isDSTShifted = this.isValid() && p(e._a, t.toArray()) > 0
    } else this._isDSTShifted = !1;
    return this._isDSTShifted
  });
  var kn = k.prototype;
  kn.calendar = function(e, t, n) {
    var s = this._calendar[e] || this._calendar.sameElse;
    return S(s) ? s.call(t, n) : s
  }, kn.longDateFormat = function(e) {
    var t = this._longDateFormat[e],
      n = this._longDateFormat[e.toUpperCase()];
    return t || !n ? t : (this._longDateFormat[e] = n.replace(/MMMM|MM|DD|dddd/g, function(e) {
      return e.slice(1)
    }), this._longDateFormat[e])
  }, kn.invalidDate = function() {
    return this._invalidDate
  }, kn.ordinal = function(e) {
    return this._ordinal.replace("%d", e)
  }, kn.preparse = Ge, kn.postformat = Ge, kn.relativeTime = function(e, t, n, s) {
    var i = this._relativeTime[n];
    return S(i) ? i(e, t, n, s) : i.replace(/%d/i, e)
  }, kn.pastFuture = function(e, t) {
    var n = this._relativeTime[e > 0 ? "future" : "past"];
    return S(n) ? n(t) : n.replace(/%s/i, t)
  }, kn.set = function(e) {
    var t, n;
    for (n in e) S(t = e[n]) ? this[n] = t : this["_" + n] = t;
    this._config = e, this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source)
  }, kn.months = function(e, n) {
    return e ? t(this._months) ? this._months[e.month()] : this._months[(this._months.isFormat || Nt).test(n) ? "format" : "standalone"][e.month()] : t(this._months) ? this._months : this._months.standalone
  }, kn.monthsShort = function(e, n) {
    return e ? t(this._monthsShort) ? this._monthsShort[e.month()] : this._monthsShort[Nt.test(n) ? "format" : "standalone"][e.month()] : t(this._monthsShort) ? this._monthsShort : this._monthsShort.standalone
  }, kn.monthsParse = function(e, t, n) {
    var s, i, r;
    if (this._monthsParseExact) return function(e, t, n) {
      var s, i, r, a = e.toLocaleLowerCase();
      if (!this._monthsParse)
        for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], s = 0; s < 12; ++s) r = l([2e3, s]), this._shortMonthsParse[s] = this.monthsShort(r, "").toLocaleLowerCase(), this._longMonthsParse[s] = this.months(r, "").toLocaleLowerCase();
      return n ? "MMM" === t ? -1 !== (i = Ut.call(this._shortMonthsParse, a)) ? i : null : -1 !== (i = Ut.call(this._longMonthsParse, a)) ? i : null : "MMM" === t ? -1 !== (i = Ut.call(this._shortMonthsParse, a)) ? i : -1 !== (i = Ut.call(this._longMonthsParse, a)) ? i : null : -1 !== (i = Ut.call(this._longMonthsParse, a)) ? i : -1 !== (i = Ut.call(this._shortMonthsParse, a)) ? i : null
    }.call(this, e, t, n);
    for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), s = 0; s < 12; s++) {
      if (i = l([2e3, s]), n && !this._longMonthsParse[s] && (this._longMonthsParse[s] = new RegExp("^" + this.months(i, "").replace(".", "") + "$", "i"), this._shortMonthsParse[s] = new RegExp("^" + this.monthsShort(i, "").replace(".", "") + "$", "i")), n || this._monthsParse[s] || (r = "^" + this.months(i, "") + "|^" + this.monthsShort(i, ""), this._monthsParse[s] = new RegExp(r.replace(".", ""), "i")), n && "MMMM" === t && this._longMonthsParse[s].test(e)) return s;
      if (n && "MMM" === t && this._shortMonthsParse[s].test(e)) return s;
      if (!n && this._monthsParse[s].test(e)) return s
    }
  }, kn.monthsRegex = function(e) {
    return this._monthsParseExact ? (o(this, "_monthsRegex") || q.call(this), e ? this._monthsStrictRegex : this._monthsRegex) : (o(this, "_monthsRegex") || (this._monthsRegex = It), this._monthsStrictRegex && e ? this._monthsStrictRegex : this._monthsRegex)
  }, kn.monthsShortRegex = function(e) {
    return this._monthsParseExact ? (o(this, "_monthsRegex") || q.call(this), e ? this._monthsShortStrictRegex : this._monthsShortRegex) : (o(this, "_monthsShortRegex") || (this._monthsShortRegex = Et), this._monthsShortStrictRegex && e ? this._monthsShortStrictRegex : this._monthsShortRegex)
  }, kn.week = function(e) {
    return X(e, this._week.dow, this._week.doy).week
  }, kn.firstDayOfYear = function() {
    return this._week.doy
  }, kn.firstDayOfWeek = function() {
    return this._week.dow
  }, kn.weekdays = function(e, n) {
    return e ? t(this._weekdays) ? this._weekdays[e.day()] : this._weekdays[this._weekdays.isFormat.test(n) ? "format" : "standalone"][e.day()] : t(this._weekdays) ? this._weekdays : this._weekdays.standalone
  }, kn.weekdaysMin = function(e) {
    return e ? this._weekdaysMin[e.day()] : this._weekdaysMin
  }, kn.weekdaysShort = function(e) {
    return e ? this._weekdaysShort[e.day()] : this._weekdaysShort
  }, kn.weekdaysParse = function(e, t, n) {
    var s, i, r;
    if (this._weekdaysParseExact) return function(e, t, n) {
      var s, i, r, a = e.toLocaleLowerCase();
      if (!this._weekdaysParse)
        for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], s = 0; s < 7; ++s) r = l([2e3, 1]).day(s), this._minWeekdaysParse[s] = this.weekdaysMin(r, "").toLocaleLowerCase(), this._shortWeekdaysParse[s] = this.weekdaysShort(r, "").toLocaleLowerCase(), this._weekdaysParse[s] = this.weekdays(r, "").toLocaleLowerCase();
      return n ? "dddd" === t ? -1 !== (i = Ut.call(this._weekdaysParse, a)) ? i : null : "ddd" === t ? -1 !== (i = Ut.call(this._shortWeekdaysParse, a)) ? i : null : -1 !== (i = Ut.call(this._minWeekdaysParse, a)) ? i : null : "dddd" === t ? -1 !== (i = Ut.call(this._weekdaysParse, a)) ? i : -1 !== (i = Ut.call(this._shortWeekdaysParse, a)) ? i : -1 !== (i = Ut.call(this._minWeekdaysParse, a)) ? i : null : "ddd" === t ? -1 !== (i = Ut.call(this._shortWeekdaysParse, a)) ? i : -1 !== (i = Ut.call(this._weekdaysParse, a)) ? i : -1 !== (i = Ut.call(this._minWeekdaysParse, a)) ? i : null : -1 !== (i = Ut.call(this._minWeekdaysParse, a)) ? i : -1 !== (i = Ut.call(this._weekdaysParse, a)) ? i : -1 !== (i = Ut.call(this._shortWeekdaysParse, a)) ? i : null
    }.call(this, e, t, n);
    for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), s = 0; s < 7; s++) {
      if (i = l([2e3, 1]).day(s), n && !this._fullWeekdaysParse[s] && (this._fullWeekdaysParse[s] = new RegExp("^" + this.weekdays(i, "").replace(".", ".?") + "$", "i"), this._shortWeekdaysParse[s] = new RegExp("^" + this.weekdaysShort(i, "").replace(".", ".?") + "$", "i"), this._minWeekdaysParse[s] = new RegExp("^" + this.weekdaysMin(i, "").replace(".", ".?") + "$", "i")), this._weekdaysParse[s] || (r = "^" + this.weekdays(i, "") + "|^" + this.weekdaysShort(i, "") + "|^" + this.weekdaysMin(i, ""), this._weekdaysParse[s] = new RegExp(r.replace(".", ""), "i")), n && "dddd" === t && this._fullWeekdaysParse[s].test(e)) return s;
      if (n && "ddd" === t && this._shortWeekdaysParse[s].test(e)) return s;
      if (n && "dd" === t && this._minWeekdaysParse[s].test(e)) return s;
      if (!n && this._weekdaysParse[s].test(e)) return s
    }
  }, kn.weekdaysRegex = function(e) {
    return this._weekdaysParseExact ? (o(this, "_weekdaysRegex") || ee.call(this), e ? this._weekdaysStrictRegex : this._weekdaysRegex) : (o(this, "_weekdaysRegex") || (this._weekdaysRegex = zt), this._weekdaysStrictRegex && e ? this._weekdaysStrictRegex : this._weekdaysRegex)
  }, kn.weekdaysShortRegex = function(e) {
    return this._weekdaysParseExact ? (o(this, "_weekdaysRegex") || ee.call(this), e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (o(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = $t), this._weekdaysShortStrictRegex && e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex)
  }, kn.weekdaysMinRegex = function(e) {
    return this._weekdaysParseExact ? (o(this, "_weekdaysRegex") || ee.call(this), e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (o(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = qt), this._weekdaysMinStrictRegex && e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex)
  }, kn.isPM = function(e) {
    return "p" === (e + "").toLowerCase().charAt(0)
  }, kn.meridiem = function(e, t, n) {
    return e > 11 ? n ? "pm" : "PM" : n ? "am" : "AM"
  }, ae("en", {
    dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
    ordinal: function(e) {
      var t = e % 10;
      return e + (1 === g(e % 100 / 10) ? "th" : 1 === t ? "st" : 2 === t ? "nd" : 3 === t ? "rd" : "th")
    }
  }), e.lang = v("moment.lang is deprecated. Use moment.locale instead.", ae), e.langData = v("moment.langData is deprecated. Use moment.localeData instead.", ue);
  var Yn = Math.abs,
    On = $e("ms"),
    Tn = $e("s"),
    xn = $e("m"),
    bn = $e("h"),
    Pn = $e("d"),
    Wn = $e("w"),
    Hn = $e("M"),
    Rn = $e("y"),
    Cn = qe("milliseconds"),
    Fn = qe("seconds"),
    Un = qe("minutes"),
    Ln = qe("hours"),
    Nn = qe("days"),
    Gn = qe("months"),
    Vn = qe("years"),
    En = Math.round,
    In = {
      ss: 44,
      s: 45,
      m: 45,
      h: 22,
      d: 26,
      M: 11
    },
    An = Math.abs,
    jn = ve.prototype;
  return jn.isValid = function() {
      return this._isValid
    }, jn.abs = function() {
      var e = this._data;
      return this._milliseconds = Yn(this._milliseconds), this._days = Yn(this._days), this._months = Yn(this._months), e.milliseconds = Yn(e.milliseconds), e.seconds = Yn(e.seconds), e.minutes = Yn(e.minutes), e.hours = Yn(e.hours), e.months = Yn(e.months), e.years = Yn(e.years), this
    }, jn.add = function(e, t) {
      return Ae(this, e, t, 1)
    }, jn.subtract = function(e, t) {
      return Ae(this, e, t, -1)
    }, jn.as = function(e) {
      if (!this.isValid()) return NaN;
      var t, n, s = this._milliseconds;
      if ("month" === (e = O(e)) || "year" === e) return t = this._days + s / 864e5, n = this._months + Ze(t), "month" === e ? n : n / 12;
      switch (t = this._days + Math.round(ze(this._months)), e) {
        case "week":
          return t / 7 + s / 6048e5;
        case "day":
          return t + s / 864e5;
        case "hour":
          return 24 * t + s / 36e5;
        case "minute":
          return 1440 * t + s / 6e4;
        case "second":
          return 86400 * t + s / 1e3;
        case "millisecond":
          return Math.floor(864e5 * t) + s;
        default:
          throw new Error("Unknown unit " + e)
      }
    }, jn.asMilliseconds = On, jn.asSeconds = Tn, jn.asMinutes = xn, jn.asHours = bn, jn.asDays = Pn, jn.asWeeks = Wn, jn.asMonths = Hn, jn.asYears = Rn, jn.valueOf = function() {
      return this.isValid() ? this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * g(this._months / 12) : NaN
    }, jn._bubble = function() {
      var e, t, n, s, i, r = this._milliseconds,
        a = this._days,
        o = this._months,
        u = this._data;
      return r >= 0 && a >= 0 && o >= 0 || r <= 0 && a <= 0 && o <= 0 || (r += 864e5 * je(ze(o) + a), a = 0, o = 0), u.milliseconds = r % 1e3, e = y(r / 1e3), u.seconds = e % 60, t = y(e / 60), u.minutes = t % 60, n = y(t / 60), u.hours = n % 24, a += y(n / 24), i = y(Ze(a)), o += i, a -= je(ze(i)), s = y(o / 12), o %= 12, u.days = a, u.months = o, u.years = s, this
    }, jn.clone = function() {
      return xe(this)
    }, jn.get = function(e) {
      return e = O(e), this.isValid() ? this[e + "s"]() : NaN
    }, jn.milliseconds = Cn, jn.seconds = Fn, jn.minutes = Un, jn.hours = Ln, jn.days = Nn, jn.weeks = function() {
      return y(this.days() / 7)
    }, jn.months = Gn, jn.years = Vn, jn.humanize = function(e) {
      if (!this.isValid()) return this.localeData().invalidDate();
      var t = this.localeData(),
        n = function(e, t, n) {
          var s = xe(e).abs(),
            i = En(s.as("s")),
            r = En(s.as("m")),
            a = En(s.as("h")),
            o = En(s.as("d")),
            u = En(s.as("M")),
            l = En(s.as("y")),
            d = i <= In.ss && ["s", i] || i < In.s && ["ss", i] || r <= 1 && ["m"] || r < In.m && ["mm", r] || a <= 1 && ["h"] || a < In.h && ["hh", a] || o <= 1 && ["d"] || o < In.d && ["dd", o] || u <= 1 && ["M"] || u < In.M && ["MM", u] || l <= 1 && ["y"] || ["yy", l];
          return d[2] = t, d[3] = +e > 0, d[4] = n,
            function(e, t, n, s, i) {
              return i.relativeTime(t || 1, !!n, e, s)
            }.apply(null, d)
        }(this, !e, t);
      return e && (n = t.pastFuture(+this, n)), t.postformat(n)
    }, jn.toISOString = Be, jn.toString = Be, jn.toJSON = Be, jn.locale = Ce, jn.localeData = Fe, jn.toIsoString = v("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", Be), jn.lang = gn, P("X", 0, 0, "unix"), P("x", 0, 0, "valueOf"), C("x", Mt), C("X", /[+-]?\d+(\.\d{1,3})?/), L("X", function(e, t, n) {
      n._d = new Date(1e3 * parseFloat(e, 10))
    }), L("x", function(e, t, n) {
      n._d = new Date(g(e))
    }), e.version = "2.20.1",
    function(e) {
      Qe = e
    }(pe), e.fn = Dn, e.min = function() {
      return we("isBefore", [].slice.call(arguments, 0))
    }, e.max = function() {
      return we("isAfter", [].slice.call(arguments, 0))
    }, e.now = function() {
      return Date.now ? Date.now() : +new Date
    }, e.utc = l, e.unix = function(e) {
      return pe(1e3 * e)
    }, e.months = function(e, t) {
      return Ee(e, t, "months")
    }, e.isDate = r, e.locale = ae, e.invalid = c, e.duration = xe, e.isMoment = _, e.weekdays = function(e, t, n) {
      return Ie(e, t, n, "weekdays")
    }, e.parseZone = function() {
      return pe.apply(null, arguments).parseZone()
    }, e.localeData = ue, e.isDuration = Me, e.monthsShort = function(e, t) {
      return Ee(e, t, "monthsShort")
    }, e.weekdaysMin = function(e, t, n) {
      return Ie(e, t, n, "weekdaysMin")
    }, e.defineLocale = oe, e.updateLocale = function(e, t) {
      if (null != t) {
        var n, s, i = Qt;
        null != (s = re(e)) && (i = s._config), (n = new k(t = D(i, t))).parentLocale = Xt[e], Xt[e] = n, ae(e)
      } else null != Xt[e] && (null != Xt[e].parentLocale ? Xt[e] = Xt[e].parentLocale : null != Xt[e] && delete Xt[e]);
      return Xt[e]
    }, e.locales = function() {
      return nt(Xt)
    }, e.weekdaysShort = function(e, t, n) {
      return Ie(e, t, n, "weekdaysShort")
    }, e.normalizeUnits = O, e.relativeTimeRounding = function(e) {
      return void 0 === e ? En : "function" == typeof e && (En = e, !0)
    }, e.relativeTimeThreshold = function(e, t) {
      return void 0 !== In[e] && (void 0 === t ? In[e] : (In[e] = t, "s" === e && (In.ss = t - 1), !0))
    }, e.calendarFormat = function(e, t) {
      var n = e.diff(t, "days", !0);
      return n < -6 ? "sameElse" : n < -1 ? "lastWeek" : n < 0 ? "lastDay" : n < 1 ? "sameDay" : n < 2 ? "nextDay" : n < 7 ? "nextWeek" : "sameElse"
    }, e.prototype = Dn, e.HTML5_FMT = {
      DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
      DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
      DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
      DATE: "YYYY-MM-DD",
      TIME: "HH:mm",
      TIME_SECONDS: "HH:mm:ss",
      TIME_MS: "HH:mm:ss.SSS",
      WEEK: "YYYY-[W]WW",
      MONTH: "YYYY-MM"
    }, e
});
/*! RESOURCE: /scripts/reportlibs/fullcalendar.min.js */
/*!
 * FullCalendar v2.2.7
 * Docs & License: http://arshaw.com/fullcalendar/
 * (c) 2013 Adam Shaw
 * (c) 2015 Tanguy Pruvot
 * The minimized version which we use is based on this customized version
 */
! function(t) {
  "function" == typeof define && define.amd ? define(["jquery", "moment"], t) : t(jQuery, moment)
}(function(t, e) {
  function n(t) {
    i(St, t)
  }

  function i(e) {
    function n(n, s) {
      t.isPlainObject(s) && t.isPlainObject(e[n]) && !r(n) ? e[n] = i({}, e[n], s) : void 0 !== s && (e[n] = s)
    }
    for (var s = 1; s < arguments.length; s++) t.each(arguments[s], n);
    return e
  }

  function r(t) {
    return /(Time|Duration)$/.test(t)
  }

  function s(t) {
    var n = e.localeData || e.langData;
    return n.call(e, t) || n.call(e, "en")
  }

  function o(t, e) {
    e.left && t.css({
      "border-left-width": 1,
      "margin-left": e.left - 1
    }), e.right && t.css({
      "border-right-width": 1,
      "margin-right": e.right - 1
    })
  }

  function a(t) {
    t.css({
      "margin-left": "",
      "margin-right": "",
      "border-left-width": "",
      "border-right-width": ""
    })
  }

  function l() {
    t("body").addClass("fc-not-allowed")
  }

  function d() {
    t("body").removeClass("fc-not-allowed")
  }

  function u(e, n, i) {
    var r = Math.floor(n / e.length),
      s = Math.floor(n - r * (e.length - 1)),
      o = [],
      a = [],
      l = [],
      d = 0;
    c(e), e.each(function(n, i) {
      var u = n === e.length - 1 ? s : r,
        c = t(i).outerHeight(!0);
      u > c ? (o.push(i), a.push(c), l.push(t(i).height())) : d += c
    }), i && (n -= d, r = Math.floor(n / o.length), s = Math.floor(n - r * (o.length - 1))), t(o).each(function(e, n) {
      var i = e === o.length - 1 ? s : r,
        d = a[e],
        u = l[e],
        c = i - (d - u);
      i > d && t(n).height(c)
    })
  }

  function c(t) {
    t.height("")
  }

  function h(e) {
    var n = 0;
    return e.find("> *").each(function(e, i) {
      var r = t(i).outerWidth();
      r > n && (n = r)
    }), n++, e.width(n), n
  }

  function f(t, e) {
    return t.height(e).addClass("fc-scroller"), t[0].scrollHeight - 1 > t[0].clientHeight ? !0 : (g(t), !1)
  }

  function g(t) {
    t.height("").removeClass("fc-scroller")
  }

  function p(e) {
    var n = e.css("position"),
      i = e.parents().filter(function() {
        var e = t(this);
        return /(auto|scroll)/.test(e.css("overflow") + e.css("overflow-y") + e.css("overflow-x"))
      }).eq(0);
    return "fixed" !== n && i.length ? i : t(e[0].ownerDocument || document)
  }

  function m(t) {
    var e = t.offset().left,
      n = e + t.width(),
      i = t.children(),
      r = i.offset().left,
      s = r + i.outerWidth();
    return {
      left: r - e,
      right: n - s
    }
  }

  function v(t) {
    return 1 == t.which && !t.ctrlKey
  }

  function y(t, e) {
    var n, i, r, s, o = t.start,
      a = t.end,
      l = e.start,
      d = e.end;
    return a > l && d > o ? (o >= l ? (n = o.clone(), r = !0) : (n = l.clone(), r = !1), d >= a ? (i = a.clone(), s = !0) : (i = d.clone(), s = !1), {
      start: n,
      end: i,
      isStart: r,
      isEnd: s
    }) : void 0
  }

  function w(t, e) {
    if (t = t || {}, void 0 !== t[e]) return t[e];
    for (var n, i = e.split(/(?=[A-Z])/), r = i.length - 1; r >= 0; r--)
      if (n = t[i[r].toLowerCase()], void 0 !== n) return n;
    return t["default"]
  }

  function b(t, n) {
    return e.duration({
      days: t.clone().stripTime().diff(n.clone().stripTime(), "days"),
      ms: t.time() - n.time()
    })
  }

  function S(t, n) {
    return e.duration({
      days: t.clone().stripTime().diff(n.clone().stripTime(), "days")
    })
  }

  function E(t, e) {
    var n, i, r;
    for (n = 0; n < Nt.length && (i = Nt[n], r = C(i, t, e), !(r >= 1 && L(r))); n++);
    return i
  }

  function C(t, n, i) {
    return null != i ? i.diff(n, t, !0) : e.isDuration(n) ? n.as(t) : n.end.diff(n.start, t, !0)
  }

  function D(t) {
    return "[object Date]" === Object.prototype.toString.call(t) || t instanceof Date
  }

  function T(t) {
    return /^\d+\:\d+(?:\:\d+\.?(?:\d{3})?)?$/.test(t)
  }

  function k(t) {
    var e = function() {};
    return e.prototype = t, new e
  }

  function H(t, e) {
    for (var n in t) R(t, n) && (e[n] = t[n])
  }

  function x(t, e) {
    var n, i, r = ["constructor", "toString", "valueOf"];
    for (n = 0; n < r.length; n++) i = r[n], t[i] !== Object.prototype[i] && (e[i] = t[i])
  }

  function R(t, e) {
    return Vt.call(t, e)
  }

  function M(e) {
    return /undefined|null|boolean|number|string/.test(t.type(e))
  }

  function F(e, n, i) {
    if (t.isFunction(e) && (e = [e]), e) {
      var r, s;
      for (r = 0; r < e.length; r++) s = e[r].apply(n, i) || s;
      return s
    }
  }

  function G() {
    for (var t = 0; t < arguments.length; t++)
      if (void 0 !== arguments[t]) return arguments[t]
  }

  function N(t) {
    return (t + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#039;").replace(/"/g, "&quot;").replace(/\n/g, "<br />")
  }

  function V(t) {
    return t.replace(/&.*?;/g, "")
  }

  function Y(t) {
    return t.charAt(0).toUpperCase() + t.slice(1)
  }

  function z(t, e) {
    return t - e
  }

  function L(t) {
    return t % 1 === 0
  }

  function _(t, e) {
    var n, i, r, s, o = function() {
      var a = +new Date - s;
      e > a && a > 0 ? n = setTimeout(o, e - a) : (n = null, t.apply(r, i), n || (r = i = null))
    };
    return function() {
      r = this, i = arguments, s = +new Date, n || (n = setTimeout(o, e))
    }
  }

  function P(n, i, r) {
    var s, o, a, l, d = n[0],
      u = 1 == n.length && "string" == typeof d;
    return e.isMoment(d) ? (l = e.apply(null, n), O(d, l)) : D(d) || void 0 === d ? l = e.apply(null, n) : (s = !1, o = !1, u ? Yt.test(d) ? (d += "-01", n = [d], s = !0, o = !0) : (a = zt.exec(d)) && (s = !a[5], o = !0) : t.isArray(d) && (o = !0), l = i || s ? e.utc.apply(e, n) : e.apply(null, n), s ? (l._ambigTime = !0, l._ambigZone = !0) : r && (o ? l._ambigZone = !0 : u && l.zone(d))), l._fullCalendar = !0, l
  }

  function A(t, n) {
    var i, r, s = !1,
      o = !1,
      a = t.length,
      l = [];
    for (i = 0; a > i; i++) r = t[i], e.isMoment(r) || (r = Dt.moment.parseZone(r)), s = s || r._ambigTime, o = o || r._ambigZone, l.push(r);
    for (i = 0; a > i; i++) r = l[i], n || !s || r._ambigTime ? o && !r._ambigZone && (l[i] = r.clone().stripZone()) : l[i] = r.clone().stripTime();
    return l
  }

  function O(t, e) {
    t._ambigTime ? e._ambigTime = !0 : e._ambigTime && (e._ambigTime = !1), t._ambigZone ? e._ambigZone = !0 : e._ambigZone && (e._ambigZone = !1)
  }

  function B(t, e) {
    t.year(e[0] || 0).month(e[1] || 0).date(e[2] || 0).hours(e[3] || 0).minutes(e[4] || 0).seconds(e[5] || 0).milliseconds(e[6] || 0)
  }

  function W(t, e) {
    return _t.format.call(t, e)
  }

  function I(t, e) {
    return Z(t, q(e))
  }

  function Z(t, e) {
    var n, i = "";
    for (n = 0; n < e.length; n++) i += j(t, e[n]);
    return i
  }

  function j(t, e) {
    var n, i;
    return "string" == typeof e ? e : (n = e.token) ? Pt[n] ? Pt[n](t) : W(t, n) : e.maybe && (i = Z(t, e.maybe), i.match(/[1-9]/)) ? i : ""
  }

  function X(t, e, n, i, r) {
    var s;
    return t = Dt.moment.parseZone(t), e = Dt.moment.parseZone(e), s = (t.localeData || t.lang).call(t), n = s.longDateFormat(n) || n, i = i || " - ", U(t, e, q(n), i, r)
  }

  function U(t, e, n, i, r) {
    var s, o, a, l, d = "",
      u = "",
      c = "",
      h = "",
      f = "";
    for (o = 0; o < n.length && (s = $(t, e, n[o]), s !== !1); o++) d += s;
    for (a = n.length - 1; a > o && (s = $(t, e, n[a]), s !== !1); a--) u = s + u;
    for (l = o; a >= l; l++) c += j(t, n[l]), h += j(e, n[l]);
    return (c || h) && (f = r ? h + i + c : c + i + h), d + f + u
  }

  function $(t, e, n) {
    var i, r;
    return "string" == typeof n ? n : (i = n.token) && (r = At[i.charAt(0)], r && t.isSame(e, r)) ? W(t, i) : !1
  }

  function q(t) {
    return t in Ot ? Ot[t] : Ot[t] = K(t)
  }

  function K(t) {
    for (var e, n = [], i = /\[([^\]]*)\]|\(([^\)]*)\)|(LT|(\w)\4*o?)|([^\w\[\(]+)/g; e = i.exec(t);) e[1] ? n.push(e[1]) : e[2] ? n.push({
      maybe: K(e[2])
    }) : e[3] ? n.push({
      token: e[3]
    }) : e[5] && n.push(e[5]);
    return n
  }

  function Q() {}

  function J(t, e) {
    return t || e ? t && e ? t.grid === e.grid && t.row === e.row && t.col === e.col : !1 : !0
  }

  function tt(t) {
    var e = nt(t);
    return "background" === e || "inverse-background" === e
  }

  function et(t) {
    return "inverse-background" === nt(t)
  }

  function nt(t) {
    return G((t.source || {}).rendering, t.rendering)
  }

  function it(t) {
    var e, n, i = {};
    for (e = 0; e < t.length; e++) n = t[e], (i[n._id] || (i[n._id] = [])).push(n);
    return i
  }

  function rt(t, e) {
    return t.eventStartMS - e.eventStartMS
  }

  function st(t, e) {
    return t.eventStartMS - e.eventStartMS || e.eventDurationMS - t.eventDurationMS || e.event.allDay - t.event.allDay || (t.event.title || "").localeCompare(e.event.title)
  }

  function ot(n) {
    var i, r, s, o, a = Dt.dataAttrPrefix;
    return a && (a += "-"), i = n.data(a + "event") || null, i && (i = "object" == typeof i ? t.extend({}, i) : {}, r = i.start, null == r && (r = i.time), s = i.duration, o = i.stick, delete i.start, delete i.time, delete i.duration, delete i.stick), null == r && (r = n.data(a + "start")), null == r && (r = n.data(a + "time")), null == s && (s = n.data(a + "duration")), null == o && (o = n.data(a + "stick")), r = null != r ? e.duration(r) : null, s = null != s ? e.duration(s) : null, o = Boolean(o), {
      eventProps: i,
      startTime: r,
      duration: s,
      stick: o
    }
  }

  function at(t, e) {
    var n, i;
    for (n = 0; n < e.length; n++)
      if (i = e[n], i.leftCol <= t.rightCol && i.rightCol >= t.leftCol) return !0;
    return !1
  }

  function lt(t, e) {
    return t.leftCol - e.leftCol
  }

  function dt(t) {
    var e, n, i;
    if (t.sort(st), e = ut(t), ct(e), n = e[0]) {
      for (i = 0; i < n.length; i++) ht(n[i]);
      for (i = 0; i < n.length; i++) ft(n[i], 0, 0)
    }
  }

  function ut(t) {
    var e, n, i, r = [];
    for (e = 0; e < t.length; e++) {
      for (n = t[e], i = 0; i < r.length && gt(n, r[i]).length; i++);
      n.level = i, (r[i] || (r[i] = [])).push(n)
    }
    return r
  }

  function ct(t) {
    var e, n, i, r, s;
    for (e = 0; e < t.length; e++)
      for (n = t[e], i = 0; i < n.length; i++)
        for (r = n[i], r.forwardSegs = [], s = e + 1; s < t.length; s++) gt(r, t[s], r.forwardSegs)
  }

  function ht(t) {
    var e, n, i = t.forwardSegs,
      r = 0;
    if (void 0 === t.forwardPressure) {
      for (e = 0; e < i.length; e++) n = i[e], ht(n), r = Math.max(r, 1 + n.forwardPressure);
      t.forwardPressure = r
    }
  }

  function ft(t, e, n) {
    var i, r = t.forwardSegs;
    if (void 0 === t.forwardCoord)
      for (r.length ? (r.sort(mt), ft(r[0], e + 1, n), t.forwardCoord = r[0].backwardCoord) : t.forwardCoord = 1, t.backwardCoord = t.forwardCoord - (t.forwardCoord - n) / (e + 1), i = 0; i < r.length; i++) ft(r[i], 0, t.forwardCoord)
  }

  function gt(t, e, n) {
    n = n || [];
    for (var i = 0; i < e.length; i++) pt(t, e[i]) && n.push(e[i]);
    return n
  }

  function pt(t, e) {
    return t.bottom > e.top && t.top < e.bottom
  }

  function mt(t, e) {
    return e.forwardPressure - t.forwardPressure || (t.backwardCoord || 0) - (e.backwardCoord || 0) || st(t, e)
  }

  function vt(n, r) {
    function o(t) {
      return (t.locale || t.lang).call(t, Q.lang).humanize()
    }

    function a(t) {
      it ? u() && (v(), c(t)) : l()
    }

    function l() {
      rt = Q.theme ? "ui" : "fc", n.addClass("fc"), Q.isRTL ? n.addClass("fc-rtl") : n.addClass("fc-ltr"), Q.theme ? n.addClass("ui-widget") : n.addClass("fc-unthemed"), it = t("<div class='fc-view-container'/>").prependTo(n), et = new yt(q, Q), nt = et.render(), nt && n.prepend(nt), c(Q.defaultView), Q.handleWindowResize && (at = _(w, Q.windowResizeDelay), t(window).resize(at))
    }

    function d() {
      st && st.destroyView(), et.destroy(), it.remove(), n.removeClass("fc fc-ltr fc-rtl fc-unthemed ui-widget"), t(window).unbind("resize", at)
    }

    function u() {
      return n.is(":visible")
    }

    function c(e) {
      ft++, st && e && st.type !== e && (et.deactivateButton(st.type), I(), st.start && st.destroyView(), st.el.remove(), st = null), !st && e && (st = h(e), st.el = t("<div class='fc-view fc-" + e + "-view' />").appendTo(it), et.activateButton(e)), st && (lt = st.massageCurrentDate(lt), st.start && lt.isWithin(st.intervalStart, st.intervalEnd) || u() && (I(), st.start && st.destroyView(), st.setDate(lt), st.renderView(), Z(), R(), M(), D())), Z(), ft--
    }

    function h(t) {
      var e = f(t);
      return new e["class"](q, e.options, t)
    }

    function f(n) {
      function i(e) {
        "function" == typeof e ? s = e : "object" == typeof e && t.extend(r, e)
      }
      var r, s, a, l, d, u = Q.defaultButtonText || {},
        c = Q.buttonText || {},
        h = Q.views || {},
        f = n,
        g = [],
        p = !1;
      if (ht[n]) return ht[n];
      for (; f && !s;) r = {}, i(Tt[f]), i(h[f]), g.unshift(r), f = r.type;
      return g.unshift({}), r = t.extend.apply(t, g), s ? (a = r.duration || s.duration, a && (a = e.duration(a), l = E(a), p = 1 === a.as(l)), p && h[l] && (r = t.extend({}, h[l], r)), d = c[n] || (p ? c[l] : null) || u[n] || (p ? u[l] : null) || r.buttonText || s.buttonText || (a ? o(a) : null) || n, ht[n] = {
        "class": s,
        options: r,
        buttonText: d
      }) : void 0
    }

    function g(t) {
      return Boolean(f(t))
    }

    function p(t) {
      var e = f(t);
      return e ? e.buttonText : void 0
    }

    function m(t) {
      return u() ? (t && y(), ft++, st.updateSize(!0), ft--, !0) : void 0
    }

    function v() {
      u() && y()
    }

    function y() {
      ot = "number" == typeof Q.contentHeight ? Q.contentHeight : "number" == typeof Q.height ? Q.height - (nt ? nt.outerHeight(!0) : 0) : Math.round(it.width() / Math.max(Q.aspectRatio, .5))
    }

    function w(t) {
      !ft && t.target === window && st.start && m(!0) && st.trigger("windowResize", ct)
    }

    function b() {
      C(), T()
    }

    function S() {
      u() && (I(), st.destroyViewEvents(), st.renderViewEvents(gt), Z())
    }

    function C() {
      I(), st.destroyViewEvents(), Z()
    }

    function D() {
      !Q.lazyFetching || dt(st.start, st.end) ? T() : S()
    }

    function T() {
      ut(st.start, st.end)
    }

    function H(t) {
      gt = t, S()
    }

    function x() {
      S()
    }

    function R() {
      et.updateTitle(st.title)
    }

    function M() {
      var t = q.getNow();
      t.isWithin(st.intervalStart, st.intervalEnd) ? et.disableButton("today") : et.enableButton("today")
    }

    function F(t, e) {
      t = q.moment(t), e = e ? q.moment(e) : t.hasTime() ? t.clone().add(q.defaultTimedEventDuration) : t.clone().add(q.defaultAllDayEventDuration), st.select({
        start: t,
        end: e
      })
    }

    function G() {
      st && st.unselect()
    }

    function N() {
      lt = st.computePrevDate(lt), c()
    }

    function V() {
      lt = st.computeNextDate(lt), c()
    }

    function z() {
      lt.add(-1, "years"), c()
    }

    function L() {
      lt.add(1, "years"), c()
    }

    function P() {
      lt = q.getNow(), c()
    }

    function A(t) {
      lt = q.moment(t), c()
    }

    function O(t) {
      lt.add(e.duration(t)), c()
    }

    function B(t, e) {
      var n, i;
      e && g(e) || (e = e || "day", n = et.getViewsWithButtons().join(" "), i = n.match(new RegExp("\\w+" + Y(e))), i || (i = n.match(/\w+Day/)), e = i ? i[0] : "agendaDay"), lt = t, c(e)
    }

    function W() {
      return lt.clone()
    }

    function I() {
      it.css({
        width: "100%",
        height: it.height(),
        overflow: "hidden"
      })
    }

    function Z() {
      it.css({
        width: "",
        height: "",
        overflow: ""
      })
    }

    function j() {
      return q
    }

    function X() {
      return st
    }

    function U(t, e) {
      return void 0 === e ? Q[t] : void(("height" == t || "contentHeight" == t || "aspectRatio" == t) && (Q[t] = e, m(!0)))
    }

    function $(t, e) {
      return Q[t] ? Q[t].apply(e || ct, Array.prototype.slice.call(arguments, 2)) : void 0
    }
    var q = this;
    r = r || {};
    var K, Q = i({}, St, r);
    K = Q.lang in kt ? kt[Q.lang] : kt[St.lang], K && (Q = i({}, St, K, r)), Q.isRTL && (Q = i({}, St, Ct, K || {}, r)), q.options = Q, q.render = a, q.destroy = d, q.refetchEvents = b, q.reportEvents = H, q.reportEventChange = x, q.rerenderEvents = S, q.changeView = c, q.select = F, q.unselect = G, q.prev = N, q.next = V, q.prevYear = z, q.nextYear = L, q.today = P, q.gotoDate = A, q.incrementDate = O, q.zoomTo = B, q.getDate = W, q.getCalendar = j, q.getView = X, q.option = U, q.trigger = $, q.isValidViewType = g, q.getViewButtonText = p;
    var J = k(s(Q.lang));
    if (Q.monthNames && (J._months = Q.monthNames), Q.monthNamesShort && (J._monthsShort = Q.monthNamesShort), Q.dayNames && (J._weekdays = Q.dayNames), Q.dayNamesShort && (J._weekdaysShort = Q.dayNamesShort), null != Q.firstDay) {
      var tt = k(J._week);
      tt.dow = Q.firstDay, J._week = tt
    }
    q.defaultAllDayEventDuration = e.duration(Q.defaultAllDayEventDuration), q.defaultTimedEventDuration = e.duration(Q.defaultTimedEventDuration), q.moment = function() {
      var t;
      return "local" === Q.timezone ? (t = Dt.moment.apply(null, arguments), t.hasTime() && t.local()) : t = "UTC" === Q.timezone ? Dt.moment.utc.apply(null, arguments) : Dt.moment.parseZone.apply(null, arguments), "_locale" in t ? t._locale = J : t._lang = J, t
    }, q.getIsAmbigTimezone = function() {
      return "local" !== Q.timezone && "UTC" !== Q.timezone
    }, q.rezoneDate = function(t) {
      return q.moment(t.toArray())
    }, q.getNow = function() {
      var t = Q.now;
      return "function" == typeof t && (t = t()), q.moment(t)
    }, q.calculateWeekNumber = function(t) {
      var e = Q.weekNumberCalculation;
      return "function" == typeof e ? e(t) : "local" === e ? t.week() : "ISO" === e.toUpperCase() ? t.isoWeek() : void 0
    }, q.getEventEnd = function(t) {
      return t.end ? t.end.clone() : q.getDefaultEventEnd(t.allDay, t.start)
    }, q.getDefaultEventEnd = function(t, e) {
      var n = e.clone();
      return t ? n.stripTime().add(q.defaultAllDayEventDuration) : n.add(q.defaultTimedEventDuration), q.getIsAmbigTimezone() && n.stripZone(), n
    }, wt.call(q, Q);
    var et, nt, it, rt, st, ot, at, lt, dt = q.isFetchNeeded,
      ut = q.fetchEvents,
      ct = n[0],
      ht = {},
      ft = 0,
      gt = [];
    lt = null != Q.defaultDate ? q.moment(Q.defaultDate) : q.getNow(), q.getSuggestedViewHeight = function() {
      return void 0 === ot && v(), ot
    }, q.isHeightAuto = function() {
      return "auto" === Q.contentHeight || "auto" === Q.height
    }
  }

  function yt(e, n) {
    function i() {
      var e = n.header;
      return f = n.theme ? "ui" : "fc", e ? g = t("<div class='fc-toolbar'/>").append(s("left")).append(s("right")).append(s("center")).append('<div class="fc-clear"/>') : void 0
    }

    function r() {
      g.remove()
    }

    function s(i) {
      var r = t('<div class="fc-' + i + '"/>'),
        s = n.header[i];
      return s && t.each(s.split(" "), function(i) {
        var s, o = t(),
          a = !0;
        t.each(this.split(","), function(i, r) {
          var s, l, d, u, c, h, g, m, v;
          "title" == r ? (o = o.add(t("<h2>&nbsp;</h2>")), a = !1) : (e[r] ? s = function() {
            e[r]()
          } : e.isValidViewType(r) && (s = function() {
            e.changeView(r)
          }, p.push(r), c = e.getViewButtonText(r)), s && (l = w(n.themeButtonIcons, r), d = w(n.buttonIcons, r), u = w(n.defaultButtonText, r), h = w(n.buttonText, r), g = c || h ? N(c || h) : l && n.theme ? "<span class='ui-icon ui-icon-" + l + "'></span>" : d && !n.theme ? "<span class='fc-icon fc-icon-" + d + "'></span>" : N(u || r), m = ["fc-" + r + "-button", f + "-button", f + "-state-default"], v = t('<button type="button" class="' + m.join(" ") + '">' + g + "</button>").click(function() {
            v.hasClass(f + "-state-disabled") || (s(), (v.hasClass(f + "-state-active") || v.hasClass(f + "-state-disabled")) && v.removeClass(f + "-state-hover"))
          }).mousedown(function() {
            v.not("." + f + "-state-active").not("." + f + "-state-disabled").addClass(f + "-state-down")
          }).mouseup(function() {
            v.removeClass(f + "-state-down")
          }).hover(function() {
            v.not("." + f + "-state-active").not("." + f + "-state-disabled").addClass(f + "-state-hover")
          }, function() {
            v.removeClass(f + "-state-hover").removeClass(f + "-state-down")
          }), o = o.add(v)))
        }), a && o.first().addClass(f + "-corner-left").end().last().addClass(f + "-corner-right").end(), o.length > 1 ? (s = t("<div/>"), a && s.addClass("fc-button-group"), s.append(o), r.append(s)) : r.append(o)
      }), r
    }

    function o(t) {
      g.find("h2").text(t)
    }

    function a(t) {
      g.find(".fc-" + t + "-button").addClass(f + "-state-active")
    }

    function l(t) {
      g.find(".fc-" + t + "-button").removeClass(f + "-state-active")
    }

    function d(t) {
      g.find(".fc-" + t + "-button").attr("disabled", "disabled").addClass(f + "-state-disabled")
    }

    function u(t) {
      g.find(".fc-" + t + "-button").removeAttr("disabled").removeClass(f + "-state-disabled")
    }

    function c() {
      return p
    }
    var h = this;
    h.render = i, h.destroy = r, h.updateTitle = o, h.activateButton = a, h.deactivateButton = l, h.disableButton = d, h.enableButton = u, h.getViewsWithButtons = c;
    var f, g = t(),
      p = []
  }

  function wt(n) {
    function i(t, e) {
      return !B || t.clone().stripZone() < B.clone().stripZone() || e.clone().stripZone() > W.clone().stripZone()
    }

    function r(t, e) {
      B = t, W = e, Q = [];
      var n = ++$,
        i = U.length;
      q = i;
      for (var r = 0; i > r; r++) s(U[r], n)
    }

    function s(e, n) {
      o(e, function(i) {
        var r, s, o, a = t.isArray(e.events);
        if (n == $) {
          if (i)
            for (r = 0; r < i.length; r++) s = i[r], o = a ? s : E(s, e), o && Q.push.apply(Q, H(o));
          q--, q || j(Q)
        }
      })
    }

    function o(e, i) {
      var r, s, a = Dt.sourceFetchers;
      for (r = 0; r < a.length; r++) {
        if (s = a[r].call(O, e, B.clone(), W.clone(), n.timezone, i), s === !0) return;
        if ("object" == typeof s) return void o(s, i)
      }
      var l = e.events;
      if (l) t.isFunction(l) ? (y(), l.call(O, B.clone(), W.clone(), n.timezone, function(t) {
        i(t), w()
      })) : t.isArray(l) ? i(l) : i();
      else {
        var d = e.url;
        if (d) {
          var u, c = e.success,
            h = e.error,
            f = e.complete;
          u = t.isFunction(e.data) ? e.data() : e.data;
          var g = t.extend({}, u || {}),
            p = G(e.startParam, n.startParam),
            m = G(e.endParam, n.endParam),
            v = G(e.timezoneParam, n.timezoneParam);
          p && (g[p] = B.format()), m && (g[m] = W.format()), n.timezone && "local" != n.timezone && (g[v] = n.timezone), y(), t.ajax(t.extend({}, Qt, e, {
            data: g,
            success: function(e) {
              e = e || [];
              var n = F(c, this, arguments);
              t.isArray(n) && (e = n), i(e)
            },
            error: function() {
              F(h, this, arguments), i()
            },
            complete: function() {
              F(f, this, arguments), w()
            }
          }))
        } else i()
      }
    }

    function a(t) {
      var e = l(t);
      e && (U.push(e), q++, s(e, $))
    }

    function l(e) {
      var n, i, r = Dt.sourceNormalizers;
      if (t.isFunction(e) || t.isArray(e) ? n = {
          events: e
        } : "string" == typeof e ? n = {
          url: e
        } : "object" == typeof e && (n = t.extend({}, e)), n) {
        for (n.className ? "string" == typeof n.className && (n.className = n.className.split(/\s+/)) : n.className = [], t.isArray(n.events) && (n.origArray = n.events, n.events = t.map(n.events, function(t) {
            return E(t, n)
          })), i = 0; i < r.length; i++) r[i].call(O, n);
        return n
      }
    }

    function d(e) {
      U = t.grep(U, function(t) {
        return !u(t, e)
      }), Q = t.grep(Q, function(t) {
        return !u(t.source, e)
      }), j(Q)
    }

    function u(t, e) {
      return t && e && c(t) == c(e)
    }

    function c(t) {
      return ("object" == typeof t ? t.origArray || t.googleCalendarId || t.url || t.events : null) || t
    }

    function h(t) {
      t.start = O.moment(t.start), t.end ? t.end = O.moment(t.end) : t.end = null, x(t, f(t)), j(Q)
    }

    function f(e) {
      var n = {};
      return t.each(e, function(t, e) {
        g(t) && void 0 !== e && M(e) && (n[t] = e)
      }), n
    }

    function g(t) {
      return !/^_|^(id|allDay|start|end)$/.test(t)
    }

    function p(t, e) {
      var n, i, r, s = E(t);
      if (s) {
        for (n = H(s), i = 0; i < n.length; i++) r = n[i], r.source || (e && (X.events.push(r), r.source = X), Q.push(r));
        return j(Q), n
      }
      return []
    }

    function m(e) {
      var n, i;
      for (null == e ? e = function() {
          return !0
        } : t.isFunction(e) || (n = e + "", e = function(t) {
          return t._id == n
        }), Q = t.grep(Q, e, !0), i = 0; i < U.length; i++) t.isArray(U[i].events) && (U[i].events = t.grep(U[i].events, e, !0));
      j(Q)
    }

    function v(e) {
      return t.isFunction(e) ? t.grep(Q, e) : null != e ? (e += "", t.grep(Q, function(t) {
        return t._id == e
      })) : Q
    }

    function y() {
      K++ || I("loading", null, !0, Z())
    }

    function w() {
      --K || I("loading", null, !1, Z())
    }

    function E(i, r) {
      var s, o, a, l = {};
      if (n.eventDataTransform && (i = n.eventDataTransform(i)), r && r.eventDataTransform && (i = r.eventDataTransform(i)), t.extend(l, i), r && (l.source = r), l._id = i._id || (void 0 === i.id ? "_fc" + Jt++ : i.id + ""), i.className ? "string" == typeof i.className ? l.className = i.className.split(/\s+/) : l.className = i.className : l.className = [], s = i.start || i.date, o = i.end, T(s) && (s = e.duration(s)), T(o) && (o = e.duration(o)), i.dow || e.isDuration(s) || e.isDuration(o)) l.start = s ? e.duration(s) : null, l.end = o ? e.duration(o) : null, l._recurring = !0;
      else {
        if (s && (s = O.moment(s), !s.isValid())) return !1;
        o && (o = O.moment(o), o.isValid() || (o = null)), a = i.allDay, void 0 === a && (a = G(r ? r.allDayDefault : void 0, n.allDayDefault)), C(s, o, a, l)
      }
      return l
    }

    function C(t, e, n, i) {
      i.start = t, i.end = e, i.allDay = n, D(i), bt(i)
    }

    function D(t) {
      null == t.allDay && (t.allDay = !(t.start.hasTime() || t.end && t.end.hasTime())), t.allDay ? (t.start.stripTime(), t.end && t.end.stripTime()) : (t.start.hasTime() || (t.start = O.rezoneDate(t.start)), t.end && !t.end.hasTime() && (t.end = O.rezoneDate(t.end))), t.end && !t.end.isAfter(t.start) && (t.end = null), t.end || (n.forceEventDuration ? t.end = O.getDefaultEventEnd(t.allDay, t.start) : t.end = null)
    }

    function k(t) {
      var e;
      return t.end || (e = t.allDay, null == e && (e = !t.start.hasTime()), t = {
        start: t.start,
        end: O.getDefaultEventEnd(e, t.start)
      }), t
    }

    function H(e, n, i) {
      var r, s, o, a, l, d, u, c, h, f = [];
      if (n = n || B, i = i || W, e)
        if (e._recurring) {
          if (s = e.dow)
            for (r = {}, o = 0; o < s.length; o++) r[s[o]] = !0;
          for (a = n.clone().stripTime(); a.isBefore(i);)(!r || r[a.day()]) && (l = e.start, d = e.end, u = a.clone(), c = null, l && (u = u.time(l)), d && (c = a.clone().time(d)), h = t.extend({}, e), C(u, c, !l && !d, h), f.push(h)), a.add(1, "days")
        } else f.push(e);
      return f
    }

    function x(e, n) {
      var i, r, s, o, a = {};
      return n = n || {}, n.start || (n.start = e.start.clone()), void 0 === n.end && (n.end = e.end ? e.end.clone() : null), null == n.allDay && (n.allDay = e.allDay), D(n), i = null !== e._end && null === n.end, r = n.allDay ? S(n.start, e._start) : b(n.start, e._start), !i && n.end && (s = b(n.end, n.start).subtract(b(e._end || O.getDefaultEventEnd(e._allDay, e._start), e._start))), t.each(n, function(t, e) {
        g(t) && void 0 !== e && (a[t] = e)
      }), o = R(v(e._id), i, n.allDay, r, s, a), {
        dateDelta: r,
        durationDelta: s,
        undo: o
      }
    }

    function R(e, n, i, r, s, o) {
      var a = O.getIsAmbigTimezone(),
        l = [];
      return r && !r.valueOf() && (r = null), s && !s.valueOf() && (s = null), t.each(e, function(e, d) {
          var u, c;
          u = {
            start: d.start.clone(),
            end: d.end ? d.end.clone() : null,
            allDay: d.allDay
          }, t.each(o, function(t) {
            u[t] = d[t]
          }), c = {
            start: d._start,
            end: d._end,
            allDay: d._allDay
          }, n && (c.end = null), c.allDay = i, D(c), r && (c.start.add(r), c.end && c.end.add(r)), s && (c.end || (c.end = O.getDefaultEventEnd(c.allDay, c.start)), c.end.add(s)), a && !c.allDay && (r || s) && (c.start.stripZone(), c.end && c.end.stripZone()), t.extend(d, o, c), bt(d), l.push(function() {
            t.extend(d, u), bt(d)
          })
        }),
        function() {
          for (var t = 0; t < l.length; t++) l[t]()
        }
    }

    function N() {
      var e, i = n.businessHours,
        r = {
          className: "fc-nonbusiness",
          start: "09:00",
          end: "17:00",
          dow: [1, 2, 3, 4, 5],
          rendering: "inverse-background"
        },
        s = O.getView();
      return i && (e = "object" == typeof i ? t.extend({}, r, i) : r), e ? H(E(e), s.start, s.end) : []
    }

    function V(t, e) {
      var i = e.source || {},
        r = G(e.constraint, i.constraint, n.eventConstraint),
        s = G(e.overlap, i.overlap, n.eventOverlap);
      return t = k(t), L(t, r, s, e)
    }

    function Y(t) {
      return L(t, n.selectConstraint, n.selectOverlap)
    }

    function z(e, n) {
      var i, r;
      return n && (i = t.extend({}, n, e), r = H(E(i))[0]), r ? V(e, r) : (e = k(e), Y(e))
    }

    function L(t, e, n, i) {
      var r, s, o, a, l;
      if (t = {
          start: t.start.clone().stripZone(),
          end: t.end.clone().stripZone()
        }, null != e) {
        for (r = _(e), s = !1, o = 0; o < r.length; o++)
          if (P(r[o], t)) {
            s = !0;
            break
          }
        if (!s) return !1
      }
      for (o = 0; o < Q.length; o++)
        if (a = Q[o], (!i || i._id !== a._id) && A(a, t)) {
          if (n === !1) return !1;
          if ("function" == typeof n && !n(a, i)) return !1;
          if (i) {
            if (l = G(a.overlap, (a.source || {}).overlap), l === !1) return !1;
            if ("function" == typeof l && !l(i, a)) return !1
          }
        }
      return !0
    }

    function _(t) {
      return "businessHours" === t ? N() : "object" == typeof t ? H(E(t)) : v(t)
    }

    function P(t, e) {
      var n = t.start.clone().stripZone(),
        i = O.getEventEnd(t).stripZone();
      return e.start >= n && e.end <= i
    }

    function A(t, e) {
      var n = t.start.clone().stripZone(),
        i = O.getEventEnd(t).stripZone();
      return e.start < i && e.end > n
    }
    var O = this;
    O.isFetchNeeded = i, O.fetchEvents = r, O.addEventSource = a, O.removeEventSource = d, O.updateEvent = h, O.renderEvent = p, O.removeEvents = m, O.clientEvents = v, O.mutateEvent = x, O.normalizeEventDateProps = D, O.ensureVisibleEventRange = k;
    var B, W, I = O.trigger,
      Z = O.getView,
      j = O.reportEvents,
      X = {
        events: []
      },
      U = [X],
      $ = 0,
      q = 0,
      K = 0,
      Q = [];
    t.each((n.events ? [n.events] : []).concat(n.eventSources || []), function(t, e) {
      var n = l(e);
      n && U.push(n)
    }), O.getBusinessHoursEvents = N, O.isEventRangeAllowed = V, O.isSelectionRangeAllowed = Y, O.isExternalDropRangeAllowed = z
  }

  function bt(t) {
    t._allDay = t.allDay, t._start = t.start.clone(), t._end = t.end ? t.end.clone() : null
  }
  var St = {
      titleRangeSeparator: " — ",
      monthYearFormat: "MMMM YYYY",
      defaultTimedEventDuration: "02:00:00",
      defaultAllDayEventDuration: {
        days: 1
      },
      forceEventDuration: !1,
      nextDayThreshold: "09:00:00",
      defaultView: "month",
      aspectRatio: 1.35,
      header: {
        left: "title",
        center: "",
        right: "today prev,next"
      },
      weekends: !0,
      weekNumbers: !1,
      weekNumberTitle: "W",
      weekNumberCalculation: "local",
      lazyFetching: !0,
      startParam: "start",
      endParam: "end",
      timezoneParam: "timezone",
      timezone: !1,
      minDate: null,
      maxDate: null,
      firstDay: 0,
      yearTitleFormat: "YYYY",
      yearFormat: "YYYY",
      isRTL: !1,
      defaultButtonText: {
        prev: "prev",
        next: "next",
        prevYear: "prev year",
        nextYear: "next year",
        today: "today",
        year: "year",
        month: "month",
        week: "week",
        day: "day"
      },
      buttonIcons: {
        prev: "left-single-arrow",
        next: "right-single-arrow",
        prevYear: "left-double-arrow",
        nextYear: "right-double-arrow"
      },
      theme: !1,
      themeButtonIcons: {
        prev: "circle-triangle-w",
        next: "circle-triangle-e",
        prevYear: "seek-prev",
        nextYear: "seek-next"
      },
      dragOpacity: .75,
      dragRevertDuration: 500,
      dragScroll: !0,
      unselectAuto: !0,
      dropAccept: "*",
      eventLimit: !1,
      eventLimitText: "more",
      eventLimitClick: "popover",
      dayPopoverFormat: "LL",
      handleWindowResize: !0,
      windowResizeDelay: 200
    },
    Et = {
      dayPopoverFormat: "dddd, MMMM D"
    },
    Ct = {
      header: {
        left: "next,prev today",
        center: "",
        right: "title"
      },
      buttonIcons: {
        prev: "right-single-arrow",
        next: "left-single-arrow",
        prevYear: "right-double-arrow",
        nextYear: "left-double-arrow"
      },
      themeButtonIcons: {
        prev: "circle-triangle-e",
        next: "circle-triangle-w",
        nextYear: "seek-prev",
        prevYear: "seek-next"
      }
    },
    Dt = t.fullCalendar = {
      version: "2.2.7"
    },
    Tt = Dt.views = {};
  t.fn.fullCalendar = function(e) {
    var n = Array.prototype.slice.call(arguments, 1),
      i = this;
    return this.each(function(r, s) {
      var o, a = t(s),
        l = a.data("fullCalendar");
      "string" == typeof e ? l && t.isFunction(l[e]) && (o = l[e].apply(l, n), r || (i = o), "destroy" === e && a.removeData("fullCalendar")) : l || (l = new vt(a, e), a.data("fullCalendar", l), l.render())
    }), i
  };
  var kt = Dt.langs = {};
  Dt.datepickerLang = function(e, n, i) {
    var r = kt[e] || (kt[e] = {});
    r.isRTL = i.isRTL, r.weekNumberTitle = i.weekHeader, t.each(Ht, function(t, e) {
      r[t] = e(i)
    }), t.datepicker && (t.datepicker.regional[n] = t.datepicker.regional[e] = i, t.datepicker.regional.en = t.datepicker.regional[""], t.datepicker.setDefaults(i))
  }, Dt.lang = function(e, n) {
    var r, o;
    r = kt[e] || (kt[e] = {}), n && i(r, n), o = s(e), t.each(xt, function(t, e) {
      void 0 === r[t] && (r[t] = e(o, r))
    }), St.lang = e
  };
  var Ht = {
      defaultButtonText: function(t) {
        return {
          prev: V(t.prevText),
          next: V(t.nextText),
          today: V(t.currentText)
        }
      },
      monthYearFormat: function(t) {
        return t.showMonthAfterYear ? "YYYY[" + t.yearSuffix + "] MMMM" : "MMMM YYYY[" + t.yearSuffix + "]"
      }
    },
    xt = {
      dayOfMonthFormat: function(t, e) {
        var n = t.longDateFormat("l");
        return n = n.replace(/^Y+[^\w\s]*|[^\w\s]*Y+$/g, ""), e.isRTL ? n += " ddd" : n = "ddd " + n, n
      },
      smallTimeFormat: function(t) {
        return t.longDateFormat("LT").replace(":mm", "(:mm)").replace(/(\Wmm)$/, "($1)").replace(/\s*a$/i, "a")
      },
      extraSmallTimeFormat: function(t) {
        return t.longDateFormat("LT").replace(":mm", "(:mm)").replace(/(\Wmm)$/, "($1)").replace(/\s*a$/i, "t")
      },
      noMeridiemTimeFormat: function(t) {
        return t.longDateFormat("LT").replace(/\s*a$/i, "")
      }
    };
  Dt.lang("en", Et), Dt.intersectionToSeg = y, Dt.applyAll = F, Dt.debounce = _;
  var Rt, Mt, Ft, Gt = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    Nt = ["year", "month", "week", "day", "hour", "minute", "second", "millisecond"],
    Vt = {}.hasOwnProperty,
    Yt = /^\s*\d{4}-\d\d$/,
    zt = /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/,
    Lt = e.fn,
    _t = t.extend({}, Lt);
  Dt.moment = function() {
    return P(arguments)
  }, Dt.moment.utc = function() {
    var t = P(arguments, !0);
    return t.hasTime() && t.utc(), t
  }, Dt.moment.parseZone = function() {
    return P(arguments, !0, !0)
  }, Lt.clone = function() {
    var t = _t.clone.apply(this, arguments);
    return O(this, t), this._fullCalendar && (t._fullCalendar = !0), t
  }, Lt.time = function(t) {
    if (!this._fullCalendar) return _t.time.apply(this, arguments);
    if (null == t) return e.duration({
      hours: this.hours(),
      minutes: this.minutes(),
      seconds: this.seconds(),
      milliseconds: this.milliseconds()
    });
    this._ambigTime = !1, e.isDuration(t) || e.isMoment(t) || (t = e.duration(t));
    var n = 0;
    return e.isDuration(t) && (n = 24 * Math.floor(t.asDays())), this.hours(n + t.hours()).minutes(t.minutes()).seconds(t.seconds()).milliseconds(t.milliseconds())
  }, Lt.stripTime = function() {
    var t;
    return this._ambigTime || (t = this.toArray(), this.utc(), Mt(this, t.slice(0, 3)), this._ambigTime = !0, this._ambigZone = !0), this
  }, Lt.hasTime = function() {
    return !this._ambigTime
  }, Lt.stripZone = function() {
    var t, e;
    return this._ambigZone || (t = this.toArray(), e = this._ambigTime, this.utc(), Mt(this, t), this._ambigTime = e || !1, this._ambigZone = !0), this
  }, Lt.hasZone = function() {
    return !this._ambigZone
  }, Lt.local = function() {
    var t = this.toArray(),
      e = this._ambigZone;
    return _t.local.apply(this, arguments), this._ambigTime = !1, this._ambigZone = !1, e && Ft(this, t), this
  }, Lt.utc = function() {
    return _t.utc.apply(this, arguments), this._ambigTime = !1, this._ambigZone = !1, this
  }, t.each(["zone", "utcOffset"], function(t, e) {
    _t[e] && (Lt[e] = function(t) {
      return null != t && (this._ambigTime = !1, this._ambigZone = !1), _t[e].apply(this, arguments)
    })
  }), Lt.format = function() {
    return this._fullCalendar && arguments[0] ? I(this, arguments[0]) : this._ambigTime ? W(this, "YYYY-MM-DD") : this._ambigZone ? W(this, "YYYY-MM-DD[T]HH:mm:ss") : _t.format.apply(this, arguments)
  }, Lt.toISOString = function() {
    return this._ambigTime ? W(this, "YYYY-MM-DD") : this._ambigZone ? W(this, "YYYY-MM-DD[T]HH:mm:ss") : _t.toISOString.apply(this, arguments)
  }, Lt.isWithin = function(t, e) {
    var n = A([this, t, e]);
    return n[0] >= n[1] && n[0] < n[2]
  }, Lt.isSame = function(t, e) {
    var n;
    return this._fullCalendar ? e ? (n = A([this, t], !0), _t.isSame.call(n[0], n[1], e)) : (t = Dt.moment.parseZone(t), _t.isSame.call(this, t) && Boolean(this._ambigTime) === Boolean(t._ambigTime) && Boolean(this._ambigZone) === Boolean(t._ambigZone)) : _t.isSame.apply(this, arguments)
  }, t.each(["isBefore", "isAfter"], function(t, e) {
    Lt[e] = function(t, n) {
      var i;
      return this._fullCalendar ? (i = A([this, t]), _t[e].call(i[0], i[1], n)) : _t[e].apply(this, arguments)
    }
  }), Rt = "_d" in e() && "updateOffset" in e, Mt = Rt ? function(t, n) {
    t._d.setTime(Date.UTC.apply(Date, n)), e.updateOffset(t, !1)
  } : B, Ft = Rt ? function(t, n) {
    t._d.setTime(+new Date(n[0] || 0, n[1] || 0, n[2] || 0, n[3] || 0, n[4] || 0, n[5] || 0, n[6] || 0)), e.updateOffset(t, !1)
  } : B;
  var Pt = {
    t: function(t) {
      return W(t, "a").charAt(0)
    },
    T: function(t) {
      return W(t, "A").charAt(0)
    }
  };
  Dt.formatRange = X;
  var At = {
      Y: "year",
      M: "month",
      D: "day",
      d: "day",
      A: "second",
      a: "second",
      T: "second",
      t: "second",
      H: "second",
      h: "second",
      m: "second",
      s: "second"
    },
    Ot = {};
  Dt.Class = Q, Q.extend = function(t) {
    var e, n = this;
    return t = t || {}, R(t, "constructor") && (e = t.constructor), "function" != typeof e && (e = t.constructor = function() {
      n.apply(this, arguments)
    }), e.prototype = k(n.prototype), H(t, e.prototype), x(t, e.prototype), H(n, e), e
  }, Q.mixin = function(t) {
    H(t.prototype || t, this.prototype)
  };
  var Bt = Q.extend({
      isHidden: !0,
      options: null,
      el: null,
      documentMousedownProxy: null,
      margin: 10,
      constructor: function(t) {
        this.options = t || {}
      },
      show: function() {
        this.isHidden && (this.el || this.render(), this.el.show(), this.position(), this.isHidden = !1, this.trigger("show"))
      },
      hide: function() {
        this.isHidden || (this.el.hide(), this.isHidden = !0, this.trigger("hide"))
      },
      render: function() {
        var e = this,
          n = this.options;
        this.el = t('<div class="fc-popover"/>').addClass(n.className || "").css({
          top: 0,
          left: 0
        }).append(n.content).appendTo(n.parentEl), this.el.on("click", ".fc-close", function() {
          e.hide()
        }), n.autoHide && t(document).on("mousedown", this.documentMousedownProxy = t.proxy(this, "documentMousedown"))
      },
      documentMousedown: function(e) {
        this.el && !t(e.target).closest(this.el).length && this.hide()
      },
      destroy: function() {
        this.hide(), this.el && (this.el.remove(), this.el = null), t(document).off("mousedown", this.documentMousedownProxy)
      },
      position: function() {
        var e, n, i, r, s, o = this.options,
          a = this.el.offsetParent().offset(),
          l = this.el.outerWidth(),
          d = (this.el.outerHeight(), t(window)),
          u = p(this.el);
        r = o.top || 0, s = void 0 !== o.left ? o.left : void 0 !== o.right ? o.right - l : 0, u.is(window) || u.is(document) ? (u = d, e = 0, n = 0) : (i = u.offset(), e = i.top, n = i.left), e += d.scrollTop(), n += d.scrollLeft(), o.viewportConstrain !== !1 && (s = Math.min(s, n + u.outerWidth() - l - this.margin), s = Math.max(s, n + this.margin)), this.el.css({
          top: r - a.top,
          left: s - a.left
        })
      },
      trigger: function(t) {
        this.options[t] && this.options[t].apply(this, Array.prototype.slice.call(arguments, 1))
      }
    }),
    Wt = Q.extend({
      grid: null,
      rowCoords: null,
      colCoords: null,
      containerEl: null,
      minX: null,
      maxX: null,
      minY: null,
      maxY: null,
      constructor: function(t) {
        this.grid = t
      },
      build: function() {
        this.rowCoords = this.grid.computeRowCoords(), this.colCoords = this.grid.computeColCoords(), this.computeBounds()
      },
      clear: function() {
        this.rowCoords = null, this.colCoords = null
      },
      getCell: function(e, n) {
        var i, r, s = this.rowCoords,
          o = this.colCoords,
          a = null,
          l = null,
          d = null,
          u = this.inBounds(e, n);
        if (!u && "year" == this.grid.view.name) return t.each(this.grid.view.dayGrids, function(t, i) {
          var r = i.coordMap;
          return r.computeBounds(), r.inBounds(e, n) ? (r.build(), d = r.getCell(e, n), !1) : void 0
        }), d;
        for (i = 0; i < s.length; i++)
          if (r = s[i], n >= r.top && n < r.bottom) {
            a = i;
            break
          }
        for (i = 0; i < o.length; i++)
          if (r = o[i], e >= r.left && e < r.right) {
            l = i;
            break
          }
        return null !== a && null !== l ? (d = this.grid.getCell(a, l), d.grid = this.grid, d) : null
      },
      computeBounds: function() {
        var t;
        this.containerEl && (t = this.containerEl.offset(), this.minX = t.left, this.maxX = t.left + this.containerEl.outerWidth(), this.minY = t.top, this.maxY = t.top + this.containerEl.outerHeight())
      },
      inBounds: function(t, e) {
        return this.containerEl ? t >= this.minX && t < this.maxX && e >= this.minY && e < this.maxY : !0
      }
    }),
    It = Q.extend({
      coordMaps: null,
      constructor: function(t) {
        this.coordMaps = t
      },
      build: function() {
        var t, e = this.coordMaps;
        for (t = 0; t < e.length; t++) e[t].build()
      },
      getCell: function(t, e) {
        var n, i = this.coordMaps,
          r = null;
        for (n = 0; n < i.length && !r; n++) r = i[n].getCell(t, e);
        return r
      },
      clear: function() {
        var t, e = this.coordMaps;
        for (t = 0; t < e.length; t++) e[t].clear()
      }
    }),
    Zt = Q.extend({
      coordMap: null,
      options: null,
      isListening: !1,
      isDragging: !1,
      origCell: null,
      cell: null,
      mouseX0: null,
      mouseY0: null,
      mousemoveProxy: null,
      mouseupProxy: null,
      scrollEl: null,
      scrollBounds: null,
      scrollTopVel: null,
      scrollLeftVel: null,
      scrollIntervalId: null,
      scrollHandlerProxy: null,
      scrollSensitivity: 30,
      scrollSpeed: 200,
      scrollIntervalMs: 50,
      constructor: function(t, e) {
        this.coordMap = t, this.options = e || {}
      },
      mousedown: function(t) {
        v(t) && (t.preventDefault(), this.startListening(t), this.options.distance || this.startDrag(t))
      },
      startListening: function(e) {
        var n, i;
        this.isListening || (e && this.options.scroll && (n = p(t(e.target)), n.is(window) || n.is(document) || (this.scrollEl = n, this.scrollHandlerProxy = _(t.proxy(this, "scrollHandler"), 100), this.scrollEl.on("scroll", this.scrollHandlerProxy))), this.computeCoords(), e && (i = this.getCell(e), this.origCell = i, this.mouseX0 = e.pageX, this.mouseY0 = e.pageY), t(document).on("mousemove", this.mousemoveProxy = t.proxy(this, "mousemove")).on("mouseup", this.mouseupProxy = t.proxy(this, "mouseup")).on("selectstart", this.preventDefault), this.isListening = !0, this.trigger("listenStart", e))
      },
      computeCoords: function() {
        this.coordMap.build(), this.computeScrollBounds()
      },
      mousemove: function(t) {
        var e, n;
        this.isDragging || (e = this.options.distance || 1, n = Math.pow(t.pageX - this.mouseX0, 2) + Math.pow(t.pageY - this.mouseY0, 2), n >= e * e && this.startDrag(t)), this.isDragging && this.drag(t)
      },
      startDrag: function(t) {
        var e;
        this.isListening || this.startListening(), this.isDragging || (this.isDragging = !0, this.trigger("dragStart", t), e = this.getCell(t), e && this.cellOver(e))
      },
      drag: function(t) {
        var e;
        this.isDragging && (e = this.getCell(t), J(e, this.cell) || (this.cell && this.cellOut(), e && this.cellOver(e)), this.dragScroll(t))
      },
      cellOver: function(t) {
        this.cell = t, this.trigger("cellOver", t, J(t, this.origCell))
      },
      cellOut: function() {
        this.cell && (this.trigger("cellOut", this.cell), this.cell = null)
      },
      mouseup: function(t) {
        this.stopDrag(t), this.stopListening(t)
      },
      stopDrag: function(t) {
        this.isDragging && (this.stopScrolling(), this.trigger("dragStop", t), this.isDragging = !1)
      },
      stopListening: function(e) {
        this.isListening && (this.scrollEl && (this.scrollEl.off("scroll", this.scrollHandlerProxy), this.scrollHandlerProxy = null), t(document).off("mousemove", this.mousemoveProxy).off("mouseup", this.mouseupProxy).off("selectstart", this.preventDefault), this.mousemoveProxy = null, this.mouseupProxy = null, this.isListening = !1, this.trigger("listenStop", e), this.origCell = this.cell = null, this.coordMap.clear())
      },
      getCell: function(t) {
        return this.coordMap.getCell(t.pageX, t.pageY)
      },
      trigger: function(t) {
        this.options[t] && this.options[t].apply(this, Array.prototype.slice.call(arguments, 1))
      },
      preventDefault: function(t) {
        t.preventDefault()
      },
      computeScrollBounds: function() {
        var t, e = this.scrollEl;
        e && (t = e.offset(), this.scrollBounds = {
          top: t.top,
          left: t.left,
          bottom: t.top + e.outerHeight(),
          right: t.left + e.outerWidth()
        })
      },
      dragScroll: function(t) {
        var e, n, i, r, s = this.scrollSensitivity,
          o = this.scrollBounds,
          a = 0,
          l = 0;
        o && (e = (s - (t.pageY - o.top)) / s, n = (s - (o.bottom - t.pageY)) / s, i = (s - (t.pageX - o.left)) / s, r = (s - (o.right - t.pageX)) / s, e >= 0 && 1 >= e ? a = e * this.scrollSpeed * -1 : n >= 0 && 1 >= n && (a = n * this.scrollSpeed), i >= 0 && 1 >= i ? l = i * this.scrollSpeed * -1 : r >= 0 && 1 >= r && (l = r * this.scrollSpeed)), this.setScrollVel(a, l)
      },
      setScrollVel: function(e, n) {
        this.scrollTopVel = e, this.scrollLeftVel = n, this.constrainScrollVel(), !this.scrollTopVel && !this.scrollLeftVel || this.scrollIntervalId || (this.scrollIntervalId = setInterval(t.proxy(this, "scrollIntervalFunc"), this.scrollIntervalMs))
      },
      constrainScrollVel: function() {
        var t = this.scrollEl;
        this.scrollTopVel < 0 ? t.scrollTop() <= 0 && (this.scrollTopVel = 0) : this.scrollTopVel > 0 && t.scrollTop() + t[0].clientHeight >= t[0].scrollHeight && (this.scrollTopVel = 0), this.scrollLeftVel < 0 ? t.scrollLeft() <= 0 && (this.scrollLeftVel = 0) : this.scrollLeftVel > 0 && t.scrollLeft() + t[0].clientWidth >= t[0].scrollWidth && (this.scrollLeftVel = 0)
      },
      scrollIntervalFunc: function() {
        var t = this.scrollEl,
          e = this.scrollIntervalMs / 1e3;
        this.scrollTopVel && t.scrollTop(t.scrollTop() + this.scrollTopVel * e), this.scrollLeftVel && t.scrollLeft(t.scrollLeft() + this.scrollLeftVel * e), this.constrainScrollVel(), this.scrollTopVel || this.scrollLeftVel || this.stopScrolling()
      },
      stopScrolling: function() {
        this.scrollIntervalId && (clearInterval(this.scrollIntervalId), this.scrollIntervalId = null, this.computeCoords())
      },
      scrollHandler: function() {
        this.scrollIntervalId || this.computeCoords()
      }
    }),
    jt = Q.extend({
      options: null,
      sourceEl: null,
      el: null,
      parentEl: null,
      top0: null,
      left0: null,
      mouseY0: null,
      mouseX0: null,
      topDelta: null,
      leftDelta: null,
      mousemoveProxy: null,
      isFollowing: !1,
      isHidden: !1,
      isAnimating: !1,
      constructor: function(e, n) {
        this.options = n = n || {}, this.sourceEl = e, this.parentEl = n.parentEl ? t(n.parentEl) : e.parent()
      },
      start: function(e) {
        this.isFollowing || (this.isFollowing = !0, this.mouseY0 = e.pageY, this.mouseX0 = e.pageX, this.topDelta = 0, this.leftDelta = 0, this.isHidden || this.updatePosition(), t(document).on("mousemove", this.mousemoveProxy = t.proxy(this, "mousemove")))
      },
      stop: function(e, n) {
        function i() {
          this.isAnimating = !1, r.destroyEl(), this.top0 = this.left0 = null, n && n()
        }
        var r = this,
          s = this.options.revertDuration;
        this.isFollowing && !this.isAnimating && (this.isFollowing = !1, t(document).off("mousemove", this.mousemoveProxy), e && s && !this.isHidden ? (this.isAnimating = !0, this.el.animate({
          top: this.top0,
          left: this.left0
        }, {
          duration: s,
          complete: i
        })) : i())
      },
      getEl: function() {
        var t = this.el;
        return t || (this.sourceEl.width(), t = this.el = this.sourceEl.clone().css({
          position: "absolute",
          visibility: "",
          display: this.isHidden ? "none" : "",
          margin: 0,
          right: "auto",
          bottom: "auto",
          width: this.sourceEl.width(),
          height: this.sourceEl.height(),
          opacity: this.options.opacity || "",
          zIndex: this.options.zIndex
        }).appendTo(this.parentEl)), t
      },
      destroyEl: function() {
        this.el && (this.el.remove(), this.el = null)
      },
      updatePosition: function() {
        var t, e;
        this.getEl(), null === this.top0 && (this.sourceEl.width(), t = this.sourceEl.offset(), e = this.el.offsetParent().offset(), this.top0 = t.top - e.top, this.left0 = t.left - e.left), this.el.css({
          top: this.top0 + this.topDelta,
          left: this.left0 + this.leftDelta
        })
      },
      mousemove: function(t) {
        this.topDelta = t.pageY - this.mouseY0, this.leftDelta = t.pageX - this.mouseX0, this.isHidden || this.updatePosition()
      },
      hide: function() {
        this.isHidden || (this.isHidden = !0, this.el && this.el.hide())
      },
      show: function() {
        this.isHidden && (this.isHidden = !1, this.updatePosition(), this.getEl().show())
      }
    }),
    Xt = Q.extend({
      view: null,
      isRTL: null,
      cellHtml: "<td/>",
      constructor: function(t) {
        this.view = t, this.isRTL = t.opt("isRTL")
      },
      rowHtml: function(t, e) {
        var n, i, r = this.getHtmlRenderer("cell", t),
          s = "";
        for (e = e || 0, n = 0; n < this.colCnt; n++) i = this.getCell(e, n), s += r(i);
        return s = this.bookendCells(s, t, e), "<tr>" + s + "</tr>"
      },
      bookendCells: function(t, e, n) {
        var i = this.getHtmlRenderer("intro", e)(n || 0, this),
          r = this.getHtmlRenderer("outro", e)(n || 0, this),
          s = this.isRTL ? r : i,
          o = this.isRTL ? i : r;
        return "string" == typeof t ? s + t + o : t.prepend(s).append(o)
      },
      getHtmlRenderer: function(t, e) {
        var n, i, r, s, o = this.view;
        return n = t + "Html", e && (i = e + Y(t) + "Html"), i && (s = o[i]) ? r = o : i && (s = this[i]) ? r = this : (s = o[n]) ? r = o : (s = this[n]) && (r = this), "function" == typeof s ? function() {
          return s.apply(r, arguments) || ""
        } : function() {
          return s || ""
        }
      }
    }),
    Ut = Dt.Grid = Xt.extend({
      start: null,
      end: null,
      rowCnt: 0,
      colCnt: 0,
      rowData: null,
      colData: null,
      el: null,
      coordMap: null,
      elsByFill: null,
      documentDragStartProxy: null,
      colHeadFormat: null,
      eventTimeFormat: null,
      displayEventEnd: null,
      constructor: function() {
        Xt.apply(this, arguments), this.coordMap = new Wt(this), this.elsByFill = {}, this.documentDragStartProxy = t.proxy(this, "documentDragStart")
      },
      render: function() {
        this.bindHandlers()
      },
      destroy: function() {
        this.unbindHandlers()
      },
      computeColHeadFormat: function() {},
      computeEventTimeFormat: function() {
        return this.view.opt("smallTimeFormat")
      },
      computeDisplayEventEnd: function() {
        return !1
      },
      setRange: function(t) {
        var e = this.view;
        this.start = t.start.clone(), this.end = t.end.clone(), this.rowData = [], this.colData = [], this.updateCells(), this.colHeadFormat = e.opt("columnFormat") || this.computeColHeadFormat(), this.eventTimeFormat = e.opt("timeFormat") || this.computeEventTimeFormat(), this.displayEventEnd = e.opt("displayEventEnd"), null == this.displayEventEnd && (this.displayEventEnd = this.computeDisplayEventEnd())
      },
      updateCells: function() {},
      rangeToSegs: function(t) {},
      getCell: function(e, n) {
        var i;
        return null == n && ("number" == typeof e ? (n = e % this.colCnt, e = Math.floor(e / this.colCnt)) : (n = e.col, e = e.row)), i = {
          row: e,
          col: n
        }, t.extend(i, this.getRowData(e), this.getColData(n)), t.extend(i, this.computeCellRange(i)), i
      },
      computeCellRange: function(t) {},
      getRowData: function(t) {
        return this.rowData[t] || {}
      },
      getColData: function(t) {
        return this.colData[t] || {}
      },
      getRowEl: function(t) {},
      getColEl: function(t) {},
      getCellDayEl: function(t) {
        return this.getColEl(t.col) || this.getRowEl(t.row)
      },
      computeRowCoords: function() {
        var t, e, n, i = [];
        for (t = 0; t < this.rowCnt; t++) e = this.getRowEl(t), n = {
          top: e.offset().top
        }, t > 0 && (i[t - 1].bottom = n.top), i.push(n);
        return n.bottom = n.top + e.outerHeight(), i
      },
      computeColCoords: function() {
        var t, e, n, i = [];
        for (t = 0; t < this.colCnt; t++) e = this.getColEl(t), n = {
          left: e.offset().left
        }, t > 0 && (i[t - 1].right = n.left), i.push(n);
        return n.right = n.left + e.outerWidth(), i
      },
      bindHandlers: function() {
        var e = this;
        this.el.on("mousedown", function(n) {
          t(n.target).is(".fc-event-container *, .fc-more") || t(n.target).closest(".fc-popover").length || e.dayMousedown(n)
        }), this.bindSegHandlers(), t(document).on("dragstart", this.documentDragStartProxy)
      },
      unbindHandlers: function() {
        t(document).off("dragstart", this.documentDragStartProxy)
      },
      dayMousedown: function(t) {
        var e, n, i = this,
          r = this.view,
          s = r.opt("selectable"),
          o = new Zt(this.coordMap, {
            scroll: r.opt("dragScroll"),
            dragStart: function() {
              r.unselect()
            },
            cellOver: function(t, r) {
              var a = o.origCell;
              a && (e = r ? t : null, s && (n = i.computeSelection(a, t), n ? i.renderSelection(n) : l()))
            },
            cellOut: function(t) {
              e = null, n = null, i.destroySelection(), d()
            },
            listenStop: function(t) {
              e && r.trigger("dayClick", i.getCellDayEl(e), e.start, t), n && r.reportSelection(n, t), d()
            }
          });
        o.mousedown(t)
      },
      renderRangeHelper: function(t, e) {
        var n;
        n = e ? k(e.event) : {}, n.start = t.start.clone(), n.end = t.end ? t.end.clone() : null, n.allDay = null, this.view.calendar.normalizeEventDateProps(n), n.className = (n.className || []).concat("fc-helper"), e || (n.editable = !1), this.renderHelper(n, e)
      },
      renderHelper: function(t, e) {},
      destroyHelper: function() {},
      renderSelection: function(t) {
        "year" != this.view.name || t.rendered || (this.view.destroySelection(), t.rendered = !0, this.view.renderSelection(t, this)), this.renderHighlight(t)
      },
      destroySelection: function() {
        this.destroyHighlight()
      },
      computeSelection: function(t, e) {
        var n, i = [t.start, t.end, e.start, e.end];
        return i.sort(z), n = {
          start: i[0].clone(),
          end: i[3].clone()
        }, this.view.calendar.isSelectionRangeAllowed(n) ? n : null
      },
      renderHighlight: function(t) {
        this.renderFill("highlight", this.rangeToSegs(t))
      },
      destroyHighlight: function() {
        this.destroyFill("highlight")
      },
      highlightSegClasses: function() {
        return ["fc-highlight"]
      },
      renderFill: function(t, e) {},
      destroyFill: function(t) {
        var e = this.elsByFill[t];
        e && (e.remove(), delete this.elsByFill[t])
      },
      renderFillSegEls: function(e, n) {
        var i, r = this,
          s = this[e + "SegEl"],
          o = "",
          a = [];
        if (n.length) {
          for (i = 0; i < n.length; i++) o += this.fillSegHtml(e, n[i]);
          t(o).each(function(e, i) {
            var o = n[e],
              l = t(i);
            s && (l = s.call(r, o, l)), l && (l = t(l), l.is(r.fillSegTag) && (o.el = l, a.push(o)))
          })
        }
        return a
      },
      fillSegTag: "div",
      fillSegHtml: function(t, e) {
        var n = this[t + "SegClasses"],
          i = this[t + "SegStyles"],
          r = n ? n.call(this, e) : [],
          s = i ? i.call(this, e) : "";
        return "<" + this.fillSegTag + (r.length ? ' class="' + r.join(" ") + '"' : "") + (s ? ' style="' + s + '"' : "") + " />"
      },
      headHtml: function() {
        return '<div class="fc-row ' + this.view.widgetHeaderClass + '"><table><thead>' + this.rowHtml("head") + "</thead></table></div>"
      },
      headCellHtml: function(t) {
        var e = this.view,
          n = t.start;
        return '<th class="fc-day-header ' + e.widgetHeaderClass + " fc-" + Gt[n.day()] + '">' + N(n.format(this.colHeadFormat)) + "</th>"
      },
      bgCellHtml: function(t) {
        var e = this.view,
          n = t.start,
          i = this.getDayClasses(n);
        return i.unshift("fc-day", e.widgetContentClass), '<td class="' + i.join(" ") + '" data-date="' + n.format("YYYY-MM-DD") + '"></td>'
      },
      getDayClasses: function(t) {
        var e = this.view,
          n = e.calendar.getNow().stripTime(),
          i = ["fc-" + Gt[t.day()]];
        return "month" === e.name && t.month() != e.intervalStart.month() && i.push("fc-other-month"), t.isSame(n, "day") ? i.push("fc-today", e.highlightStateClass) : n > t ? i.push("fc-past") : i.push("fc-future"), i
      }
    });
  Ut.mixin({
    mousedOverSeg: null,
    isDraggingSeg: !1,
    isResizingSeg: !1,
    segs: null,
    renderEvents: function(t) {
      var e, n, i = this.eventsToSegs(t),
        r = [],
        s = [];
      for (e = 0; e < i.length; e++) n = i[e], tt(n.event) ? r.push(n) : s.push(n);
      r = this.renderBgSegs(r) || r, s = this.renderFgSegs(s) || s, this.segs = r.concat(s)
    },
    destroyEvents: function() {
      this.triggerSegMouseout(), this.destroyFgSegs(), this.destroyBgSegs(), this.segs = null
    },
    getEventSegs: function() {
      return this.segs || []
    },
    renderFgSegs: function(t) {},
    destroyFgSegs: function() {},
    renderFgSegEls: function(e, n) {
      var i, r = this.view,
        s = "",
        o = [];
      if (e.length) {
        for (i = 0; i < e.length; i++) s += this.fgSegHtml(e[i], n);
        t(s).each(function(n, i) {
          var s = e[n],
            a = r.resolveEventEl(s.event, t(i));
          a && (a.data("fc-seg", s), s.el = a, o.push(s))
        })
      }
      return o
    },
    fgSegHtml: function(t, e) {},
    renderBgSegs: function(t) {
      return this.renderFill("bgEvent", t)
    },
    destroyBgSegs: function() {
      this.destroyFill("bgEvent")
    },
    bgEventSegEl: function(t, e) {
      return this.view.resolveEventEl(t.event, e)
    },
    bgEventSegClasses: function(t) {
      var e = t.event,
        n = e.source || {};
      return ["fc-bgevent"].concat(e.className, n.className || [])
    },
    bgEventSegStyles: function(t) {
      var e = this.view,
        n = t.event,
        i = n.source || {},
        r = n.color,
        s = i.color,
        o = e.opt("eventColor"),
        a = n.backgroundColor || r || i.backgroundColor || s || e.opt("eventBackgroundColor") || o;
      return a ? "background-color:" + a : ""
    },
    businessHoursSegClasses: function(t) {
      return ["fc-nonbusiness", "fc-bgevent"]
    },
    bindSegHandlers: function() {
      var e = this,
        n = this.view;
      t.each({
        mouseenter: function(t, n) {
          e.triggerSegMouseover(t, n)
        },
        mouseleave: function(t, n) {
          e.triggerSegMouseout(t, n)
        },
        click: function(t, e) {
          return n.trigger("eventClick", this, t.event, e)
        },
        mousedown: function(i, r) {
          t(r.target).is(".fc-resizer") && n.isEventResizable(i.event) ? e.segResizeMousedown(i, r) : n.isEventDraggable(i.event) && e.segDragMousedown(i, r)
        }
      }, function(n, i) {
        e.el.on(n, ".fc-event-container > *", function(n) {
          var r = t(this).data("fc-seg");
          return !r || e.isDraggingSeg || e.isResizingSeg ? void 0 : i.call(this, r, n)
        })
      })
    },
    triggerSegMouseover: function(t, e) {
      this.mousedOverSeg || (this.mousedOverSeg = t, this.view.trigger("eventMouseover", t.el[0], t.event, e))
    },
    triggerSegMouseout: function(t, e) {
      e = e || {}, this.mousedOverSeg && (t = t || this.mousedOverSeg, this.mousedOverSeg = null, this.view.trigger("eventMouseout", t.el[0], t.event, e))
    },
    segDragMousedown: function(e, n) {
      var i, r = this,
        s = this.view,
        o = e.el,
        a = e.event;
      if ("year" == s.name) {
        var u = t(o).closest("td.fc-year-monthly-td"),
          c = u.closest("table").find(".fc-year-monthly-td"),
          h = c.index(u);
        s.dayGrid = s.dayGrids[h]
      }
      var f = new jt(e.el, {
          parentEl: s.el,
          opacity: s.opt("dragOpacity"),
          revertDuration: s.opt("dragRevertDuration"),
          zIndex: 2
        }),
        g = new Zt(s.coordMap, {
          distance: 5,
          scroll: s.opt("dragScroll"),
          listenStart: function(t) {
            f.hide(), f.start(t)
          },
          dragStart: function(t) {
            r.triggerSegMouseout(e, t), r.isDraggingSeg = !0, s.hideEvent(a), s.trigger("eventDragStart", o[0], a, t, {})
          },
          cellOver: function(t, n) {
            var o = e.cell || g.origCell;
            i = r.computeEventDrop(o, t, a), i ? (s.renderDrag(i, e) ? f.hide() : f.show(), n && (i = null)) : (f.show(), l())
          },
          cellOut: function() {
            i = null, s.destroyDrag(), f.show(), d()
          },
          dragStop: function(t) {
            f.stop(!i, function() {
              r.isDraggingSeg = !1, s.destroyDrag(), s.showEvent(a), s.trigger("eventDragStop", o[0], a, t, {}), i && s.reportEventDrop(a, i, o, t)
            }), d()
          },
          listenStop: function() {
            f.stop()
          }
        });
      g.mousedown(n)
    },
    computeEventDrop: function(t, e, n) {
      var i, r, s, o, a, l = t.start,
        d = e.start;
      return l.hasTime() === d.hasTime() ? (i = b(d, l), r = n.start.clone().add(i), s = null === n.end ? null : n.end.clone().add(i), o = n.allDay) : (r = d.clone(), s = null, o = !d.hasTime()), a = {
        start: r,
        end: s,
        allDay: o
      }, this.view.calendar.isEventRangeAllowed(a, n) ? a : null
    },
    documentDragStart: function(e, n) {
      var i, r, s = this.view;
      s.opt("droppable") && (i = t(e.target), r = s.opt("dropAccept"), (t.isFunction(r) ? r.call(i[0], i) : i.is(r)) && this.startExternalDrag(i, e, n))
    },
    startExternalDrag: function(e, n, i) {
      var r, s, o = this,
        a = ot(e);
      r = new Zt(this.coordMap, {
        cellOver: function(t) {
          s = o.computeExternalDrop(t, a), s ? o.renderDrag(s) : l()
        },
        cellOut: function() {
          s = null, o.destroyDrag(), d()
        }
      }), t(document).one("dragstop", function(t, n) {
        o.destroyDrag(), d(), s && o.view.reportExternalDrop(a, s, e, t, n)
      }), r.startDrag(n)
    },
    computeExternalDrop: function(t, e) {
      var n = {
        start: t.start.clone(),
        end: null
      };
      return e.startTime && !n.start.hasTime() && n.start.time(e.startTime), e.duration && (n.end = n.start.clone().add(e.duration)), this.view.calendar.isExternalDropRangeAllowed(n, e.eventProps) ? n : null
    },
    renderDrag: function(t, e) {},
    destroyDrag: function() {},
    segResizeMousedown: function(e, n) {
      function i() {
        o.destroyEventResize(), a.showEvent(h), d()
      }
      var r, s, o = this,
        a = this.view,
        u = a.calendar,
        c = e.el,
        h = e.event,
        f = h.start,
        g = u.getEventEnd(h);
      s = new Zt(this.coordMap, {
        distance: 5,
        scroll: a.opt("dragScroll"),
        dragStart: function(t) {
          o.triggerSegMouseout(e, t), o.isResizingSeg = !0, a.trigger("eventResizeStart", c[0], h, t, {})
        },
        cellOver: function(n) {
          r = n.end, r.isAfter(f) || (r = f.clone().add(b(n.end, n.start))), r.isSame(g) ? r = null : u.isEventRangeAllowed({
            start: f,
            end: r
          }, h) ? (o.renderEventResize({
            start: f,
            end: r
          }, e), "year" == a.name && t.each(a.dayGrids, function(t, n) {
            n !== o && (n.destroyEventResize(), n.renderEventResize({
              start: f,
              end: r
            }, e))
          }), a.hideEvent(h)) : (r = null, l())
        },
        cellOut: function() {
          r = null, i()
        },
        dragStop: function(t) {
          o.isResizingSeg = !1, i(), a.trigger("eventResizeStop", c[0], h, t, {}), r && a.reportEventResize(h, r, c, t)
        }
      }), s.mousedown(n)
    },
    renderEventResize: function(t, e) {},
    destroyEventResize: function() {},
    getEventTimeText: function(t, e) {
      return e = e || this.eventTimeFormat, t.end && this.displayEventEnd ? this.view.formatRange(t, e) : t.start.format(e)
    },
    getSegClasses: function(t, e, n) {
      var i = t.event,
        r = ["fc-event", t.isStart ? "fc-start" : "fc-not-start", t.isEnd ? "fc-end" : "fc-not-end"].concat(i.className, i.source ? i.source.className : []);
      return e && r.push("fc-draggable"), n && r.push("fc-resizable"), r
    },
    getEventSkinCss: function(t) {
      var e = this.view,
        n = t.source || {},
        i = t.color,
        r = n.color,
        s = e.opt("eventColor"),
        o = t.backgroundColor || i || n.backgroundColor || r || e.opt("eventBackgroundColor") || s,
        a = t.borderColor || i || n.borderColor || r || e.opt("eventBorderColor") || s,
        l = t.textColor || n.textColor || e.opt("eventTextColor"),
        d = [];
      return o && d.push("background-color:" + o), a && d.push("border-color:" + a), l && d.push("color:" + l), d.join(";")
    },
    eventsToSegs: function(t, e) {
      var n, i = this.eventsToRanges(t),
        r = [];
      for (n = 0; n < i.length; n++) r.push.apply(r, this.eventRangeToSegs(i[n], e));
      return r
    },
    eventsToRanges: function(e) {
      var n = this,
        i = it(e),
        r = [];
      return t.each(i, function(t, e) {
        e.length && r.push.apply(r, et(e[0]) ? n.eventsToInverseRanges(e) : n.eventsToNormalRanges(e))
      }), r
    },
    eventsToNormalRanges: function(t) {
      var e, n, i, r, s = this.view.calendar,
        o = [];
      for (e = 0; e < t.length; e++) n = t[e], i = n.start.clone().stripZone(), r = s.getEventEnd(n).stripZone(), o.push({
        event: n,
        start: i,
        end: r,
        eventStartMS: +i,
        eventDurationMS: r - i
      });
      return o
    },
    eventsToInverseRanges: function(t) {
      var e, n, i = this.view,
        r = i.start.clone().stripZone(),
        s = i.end.clone().stripZone(),
        o = this.eventsToNormalRanges(t),
        a = [],
        l = t[0],
        d = r;
      for (o.sort(rt), e = 0; e < o.length; e++) n = o[e], n.start > d && a.push({
        event: l,
        start: d,
        end: n.start
      }), d = n.end;
      return s > d && a.push({
        event: l,
        start: d,
        end: s
      }), a
    },
    eventRangeToSegs: function(t, e) {
      var n, i, r;
      for (n = e ? e(t) : this.rangeToSegs(t), i = 0; i < n.length; i++) r = n[i], r.event = t.event, r.eventStartMS = t.eventStartMS, r.eventDurationMS = t.eventDurationMS;
      return n
    }
  }), Dt.compareSegs = st, Dt.dataAttrPrefix = "";
  var $t = Ut.extend({
    numbersVisible: !1,
    bottomCoordPadding: 0,
    breakOnWeeks: null,
    cellDates: null,
    dayToCellOffsets: null,
    rowEls: null,
    dayEls: null,
    helperEls: null,
    render: function(t) {
      var e, n, i, r = this.view,
        s = this.rowCnt,
        o = this.colCnt,
        a = s * o,
        l = "";
      for (e = 0; s > e; e++) l += this.dayRowHtml(e, t);
      for (this.el.html(l), this.rowEls = this.el.find(".fc-row"), this.dayEls = this.el.find(".fc-day"), n = 0; a > n; n++) i = this.getCell(n), r.trigger("dayRender", null, i.start, this.dayEls.eq(n));
      Ut.prototype.render.call(this)
    },
    destroy: function() {
      this.destroySegPopover(), Ut.prototype.destroy.call(this)
    },
    dayRowHtml: function(t, e) {
      var n = this.view,
        i = ["fc-row", "fc-week", n.widgetContentClass];
      return e && i.push("fc-rigid"), '<div class="' + i.join(" ") + '"><div class="fc-bg"><table>' + this.rowHtml("day", t) + '</table></div><div class="fc-content-skeleton"><table>' + (this.numbersVisible ? "<thead>" + this.rowHtml("number", t) + "</thead>" : "") + "</table></div></div>"
    },
    dayCellHtml: function(t) {
      return this.bgCellHtml(t)
    },
    computeColHeadFormat: function() {
      return this.rowCnt > 1 ? "ddd" : this.colCnt > 1 ? this.view.opt("dayOfMonthFormat") : "dddd"
    },
    computeEventTimeFormat: function() {
      return this.view.opt("extraSmallTimeFormat")
    },
    computeDisplayEventEnd: function() {
      return 1 == this.colCnt
    },
    updateCells: function() {
      var t, e, n, i;
      if (this.updateCellDates(), t = this.cellDates, this.breakOnWeeks) {
        for (e = t[0].day(), i = 1; i < t.length && t[i].day() != e; i++);
        n = Math.ceil(t.length / i)
      } else n = 1, i = t.length;
      this.rowCnt = n, this.colCnt = i
    },
    updateCellDates: function() {
      for (var t = this.view, e = this.start.clone(), n = [], i = -1, r = []; e.isBefore(this.end);) t.isHiddenDay(e) ? r.push(i + .5) : (i++, r.push(i), n.push(e.clone())), e.add(1, "days");
      this.cellDates = n, this.dayToCellOffsets = r
    },
    computeCellRange: function(t) {
      var e = this.colCnt,
        n = t.row * e + (this.isRTL ? e - t.col - 1 : t.col),
        i = this.cellDates[n].clone(),
        r = i.clone().add(1, "day");
      return {
        start: i,
        end: r
      }
    },
    getRowEl: function(t) {
      return this.rowEls.eq(t)
    },
    getColEl: function(t) {
      return this.dayEls.eq(t)
    },
    getCellDayEl: function(t) {
      return this.dayEls.eq(t.row * this.colCnt + t.col)
    },
    computeRowCoords: function() {
      var t = Ut.prototype.computeRowCoords.call(this);
      return t[t.length - 1].bottom += this.bottomCoordPadding, t
    },
    rangeToSegs: function(t) {
      var e, n, i, r, s, o, a, l, d, u, c = this.isRTL,
        h = this.rowCnt,
        f = this.colCnt,
        g = [];
      for (t = this.view.computeDayRange(t), e = this.dateToCellOffset(t.start), n = this.dateToCellOffset(t.end.subtract(1, "days")), i = 0; h > i; i++) r = i * f, s = r + f - 1, l = Math.max(r, e), d = Math.min(s, n), l = Math.ceil(l), d = Math.floor(d), d >= l && (o = l === e, a = d === n, l -= r, d -= r, u = {
        row: i,
        isStart: o,
        isEnd: a
      }, c ? (u.leftCol = f - d - 1, u.rightCol = f - l - 1) : (u.leftCol = l, u.rightCol = d), g.push(u));
      return g
    },
    dateToCellOffset: function(t) {
      var e = this.dayToCellOffsets,
        n = t.diff(this.start, "days");
      return 0 > n ? e[0] - 1 : n >= e.length ? e[e.length - 1] + 1 : e[n]
    },
    renderDrag: function(t, e) {
      var n;
      return this.renderHighlight(this.view.calendar.ensureVisibleEventRange(t)), e && !e.el.closest(this.view.el).length ? (this.renderRangeHelper(t, e), n = this.view.opt("dragOpacity"), void 0 !== n && this.helperEls.css("opacity", n), !0) : void 0
    },
    destroyDrag: function() {
      this.destroyHighlight(), this.destroyHelper()
    },
    renderEventResize: function(t, e) {
      this.renderHighlight(t), this.renderRangeHelper(t, e)
    },
    destroyEventResize: function() {
      this.destroyHighlight(), this.destroyHelper()
    },
    renderHelper: function(e, n) {
      var i, r = [],
        s = this.eventsToSegs([e]);
      s = this.renderFgSegEls(s), i = this.renderSegRows(s), this.rowEls.each(function(e, s) {
        var o, a = t(s),
          l = t('<div class="fc-helper-skeleton"><table/></div>');
        o = n && n.row === e ? n.el.position().top : a.find(".fc-content-skeleton tbody").position().top, l.css("top", o).find("table").append(i[e].tbodyEl), a.append(l), r.push(l[0])
      }), this.helperEls = t(r)
    },
    destroyHelper: function() {
      this.helperEls && (this.helperEls.remove(), this.helperEls = null)
    },
    fillSegTag: "td",
    renderFill: function(e, n) {
      var i, r, s, o = [];
      for (n = this.renderFillSegEls(e, n), i = 0; i < n.length; i++) r = n[i], s = this.renderFillRow(e, r), this.rowEls.eq(r.row).append(s), o.push(s[0]);
      return this.elsByFill[e] = t(o), n
    },
    renderFillRow: function(e, n) {
      var i, r, s = this.colCnt,
        o = n.leftCol,
        a = n.rightCol + 1;
      return i = t('<div class="fc-' + e.toLowerCase() + '-skeleton"><table><tr/></table></div>'), r = i.find("tr"), o > 0 && r.append('<td colspan="' + o + '"/>'), r.append(n.el.attr("colspan", a - o)), s > a && r.append('<td colspan="' + (s - a) + '"/>'), this.bookendCells(r, e), i
    }
  });
  $t.mixin({
    rowStructs: null,
    destroyEvents: function() {
      this.destroySegPopover(), Ut.prototype.destroyEvents.apply(this, arguments)
    },
    getEventSegs: function() {
      return Ut.prototype.getEventSegs.call(this).concat(this.popoverSegs || [])
    },
    renderBgSegs: function(e) {
      var n = t.grep(e, function(t) {
        return t.event.allDay
      });
      return Ut.prototype.renderBgSegs.call(this, n)
    },
    renderFgSegs: function(e) {
      var n;
      return e = this.renderFgSegEls(e), n = this.rowStructs = this.renderSegRows(e), this.rowEls.each(function(e, i) {
        e < n.length && t(i).find(".fc-content-skeleton > table").append(n[e].tbodyEl)
      }), e
    },
    destroyFgSegs: function() {
      for (var t, e = this.rowStructs || []; t = e.pop();) t.tbodyEl.remove();
      this.rowStructs = null
    },
    renderSegRows: function(t) {
      var e, n, i = [];
      for (e = this.groupSegRows(t), n = 0; n < e.length; n++) i.push(this.renderSegRow(n, e[n]));
      return i
    },
    fgSegHtml: function(t, e) {
      var n, i = this.view,
        r = t.event,
        s = i.isEventDraggable(r),
        o = !e && r.allDay && t.isEnd && i.isEventResizable(r),
        a = this.getSegClasses(t, s, o),
        l = this.getEventSkinCss(r),
        d = "";
      return a.unshift("fc-day-grid-event"), !r.allDay && t.isStart && (d = '<span class="fc-time">' + N(this.getEventTimeText(r)) + "</span>"), n = '<span class="fc-title">' + (N(r.title || "") || "&nbsp;") + "</span>", '<a class="' + a.join(" ") + '"' + (r.url ? ' href="' + N(r.url) + '"' : "") + (l ? ' style="' + l + '"' : "") + '><div class="fc-content">' + (this.isRTL ? n + " " + d : d + " " + n) + "</div>" + (o ? '<div class="fc-resizer"/>' : "") + "</a>"
    },
    renderSegRow: function(e, n) {
      function i(e) {
        for (; e > o;) u = (v[r - 1] || [])[o], u ? u.attr("rowspan", parseInt(u.attr("rowspan") || 1, 10) + 1) : (u = t("<td/>"), a.append(u)), m[r][o] = u, v[r][o] = u, o++
      }
      var r, s, o, a, l, d, u, c = this.colCnt,
        h = this.buildSegLevels(n),
        f = Math.max(1, h.length),
        g = t("<tbody/>"),
        p = [],
        m = [],
        v = [];
      for (r = 0; f > r; r++) {
        if (s = h[r], o = 0, a = t("<tr/>"), p.push([]), m.push([]), v.push([]), s)
          for (l = 0; l < s.length; l++) {
            for (d = s[l], i(d.leftCol), u = t('<td class="fc-event-container"/>').append(d.el), d.leftCol != d.rightCol ? u.attr("colspan", d.rightCol - d.leftCol + 1) : v[r][o] = u; o <= d.rightCol;) m[r][o] = u, p[r][o] = d, o++;
            a.append(u)
          }
        i(c), this.bookendCells(a, "eventSkeleton"), g.append(a)
      }
      return {
        row: e,
        tbodyEl: g,
        cellMatrix: m,
        segMatrix: p,
        segLevels: h,
        segs: n
      }
    },
    buildSegLevels: function(t) {
      var e, n, i, r = [];
      for (t.sort(st), e = 0; e < t.length; e++) {
        for (n = t[e], i = 0; i < r.length && at(n, r[i]); i++);
        n.level = i, (r[i] || (r[i] = [])).push(n)
      }
      for (i = 0; i < r.length; i++) r[i].sort(lt);
      return r
    },
    groupSegRows: function(t) {
      var e, n = [];
      for (e = 0; e < this.rowCnt; e++) n.push([]);
      for (e = 0; e < t.length; e++) n[t[e].row].push(t[e]);
      return n
    }
  }), $t.mixin({
    segPopover: null,
    popoverSegs: null,
    destroySegPopover: function() {
      this.segPopover && this.segPopover.hide()
    },
    limitRows: function(t) {
      var e, n, i = this.rowStructs || [];
      for (e = 0; e < i.length; e++) this.unlimitRow(e), n = t ? "number" == typeof t ? t : this.computeRowLevelLimit(e) : !1, n !== !1 && this.limitRow(e, n)
    },
    computeRowLevelLimit: function(t) {
      var e, n, i = this.rowEls.eq(t),
        r = i.height(),
        s = this.rowStructs[t].tbodyEl.children();
      for (e = 0; e < s.length; e++)
        if (n = s.eq(e).removeClass("fc-limited"), n.position().top + n.outerHeight() > r) return e;
      return !1
    },
    limitRow: function(e, n) {
      function i(i) {
        for (; i > C;) r = b.getCell(e, C), u = b.getCellSegs(r, n), u.length && (f = o[n - 1][C], w = b.renderMoreLink(r, u), y = t("<div/>").append(w), f.append(y), E.push(y[0])), C++
      }
      var r, s, o, a, l, d, u, c, h, f, g, p, m, v, y, w, b = this,
        S = this.rowStructs[e],
        E = [],
        C = 0;
      if (n && n < S.segLevels.length) {
        for (s = S.segLevels[n - 1], o = S.cellMatrix, a = S.tbodyEl.children().slice(n).addClass("fc-limited").get(), l = 0; l < s.length; l++) {
          for (d = s[l], i(d.leftCol), h = [], c = 0; C <= d.rightCol;) r = this.getCell(e, C), u = this.getCellSegs(r, n), h.push(u), c += u.length, C++;
          if (c) {
            for (f = o[n - 1][d.leftCol], g = f.attr("rowspan") || 1, p = [], m = 0; m < h.length; m++) v = t('<td class="fc-more-cell"/>').attr("rowspan", g), u = h[m], r = this.getCell(e, d.leftCol + m), w = this.renderMoreLink(r, [d].concat(u)), y = t("<div/>").append(w), v.append(y), p.push(v[0]), E.push(v[0]);
            f.addClass("fc-limited").after(t(p)), a.push(f[0])
          }
        }
        i(this.colCnt), S.moreEls = t(E), S.limitedEls = t(a)
      }
    },
    unlimitRow: function(t) {
      var e = this.rowStructs[t];
      e.moreEls && (e.moreEls.remove(), e.moreEls = null), e.limitedEls && (e.limitedEls.removeClass("fc-limited"), e.limitedEls = null)
    },
    renderMoreLink: function(e, n) {
      var i = this,
        r = this.view;
      return t('<a class="fc-more"/>').text(this.getMoreLinkText(n.length)).on("click", function(s) {
        var o = r.opt("eventLimitClick"),
          a = e.start,
          l = t(this),
          d = i.getCellDayEl(e),
          u = i.getCellSegs(e),
          c = i.resliceDaySegs(u, a),
          h = i.resliceDaySegs(n, a);
        "function" == typeof o && (o = r.trigger("eventLimitClick", null, {
          date: a,
          dayEl: d,
          moreEl: l,
          segs: c,
          hiddenSegs: h
        }, s)), "popover" === o ? i.showSegPopover(e, l, c) : "string" == typeof o && r.calendar.zoomTo(a, o)
      })
    },
    showSegPopover: function(t, e, n) {
      var i, r, s = this,
        o = this.view,
        a = e.parent();
      i = 1 == this.rowCnt ? o.el : this.rowEls.eq(t.row), r = {
        className: "fc-more-popover",
        content: this.renderSegPopoverContent(t, n),
        parentEl: this.el,
        top: i.offset().top,
        autoHide: !0,
        viewportConstrain: o.opt("popoverViewportConstrain"),
        hide: function() {
          s.segPopover.destroy(), s.segPopover = null, s.popoverSegs = null
        }
      }, this.isRTL ? r.right = a.offset().left + a.outerWidth() + 1 : r.left = a.offset().left - 1, this.segPopover = new Bt(r), this.segPopover.show()
    },
    renderSegPopoverContent: function(e, n) {
      var i, r = this.view,
        s = r.opt("theme"),
        o = e.start.format(r.opt("dayPopoverFormat")),
        a = t('<div class="fc-header ' + r.widgetHeaderClass + '"><span class="fc-close ' + (s ? "ui-icon ui-icon-closethick" : "fc-icon fc-icon-x") + '"></span><span class="fc-title">' + N(o) + '</span><div class="fc-clear"/></div><div class="fc-body ' + r.widgetContentClass + '"><div class="fc-event-container"></div></div>'),
        l = a.find(".fc-event-container");
      for (n = this.renderFgSegEls(n, !0), this.popoverSegs = n, i = 0; i < n.length; i++) n[i].cell = e, l.append(n[i].el);
      return a
    },
    resliceDaySegs: function(e, n) {
      var i = t.map(e, function(t) {
          return t.event
        }),
        r = n.clone().stripTime(),
        s = r.clone().add(1, "days"),
        o = {
          start: r,
          end: s
        };
      return e = this.eventsToSegs(i, function(t) {
        var e = y(t, o);
        return e ? [e] : []
      }), e.sort(st), e
    },
    getMoreLinkText: function(t) {
      var e = this.view.opt("eventLimitText");
      return "function" == typeof e ? e(t) : "+" + t + " " + e
    },
    getCellSegs: function(t, e) {
      for (var n, i = this.rowStructs[t.row].segMatrix, r = e || 0, s = []; r < i.length;) n = i[r][t.col], n && s.push(n), r++;
      return s
    }
  });
  var qt = Ut.extend({
    slotDuration: null,
    snapDuration: null,
    minTime: null,
    maxTime: null,
    axisFormat: null,
    dayEls: null,
    slatEls: null,
    slatTops: null,
    helperEl: null,
    businessHourSegs: null,
    constructor: function() {
      Ut.apply(this, arguments), this.processOptions()
    },
    render: function() {
      this.el.html(this.renderHtml()), this.dayEls = this.el.find(".fc-day"), this.slatEls = this.el.find(".fc-slats tr"), this.computeSlatTops(), this.renderBusinessHours(), Ut.prototype.render.call(this)
    },
    renderBusinessHours: function() {
      var t = this.view.calendar.getBusinessHoursEvents();
      this.businessHourSegs = this.renderFill("businessHours", this.eventsToSegs(t), "bgevent")
    },
    renderHtml: function() {
      return '<div class="fc-bg"><table>' + this.rowHtml("slotBg") + '</table></div><div class="fc-slats"><table>' + this.slatRowHtml() + "</table></div>"
    },
    slotBgCellHtml: function(t) {
      return this.bgCellHtml(t)
    },
    slatRowHtml: function() {
      for (var t, n, i, r = this.view, s = this.isRTL, o = "", a = this.slotDuration.asMinutes() % 15 === 0, l = e.duration(+this.minTime); l < this.maxTime;) t = this.start.clone().time(l), n = t.minutes(), i = '<td class="fc-axis fc-time ' + r.widgetContentClass + '" ' + r.axisStyleAttr() + ">" + (a && n ? "" : "<span>" + N(t.format(this.axisFormat)) + "</span>") + "</td>", o += "<tr " + (n ? 'class="fc-minor"' : "") + ">" + (s ? "" : i) + '<td class="' + r.widgetContentClass + '"/>' + (s ? i : "") + "</tr>", l.add(this.slotDuration);
      return o
    },
    processOptions: function() {
      var t = this.view,
        n = t.opt("slotDuration"),
        i = t.opt("snapDuration");
      n = e.duration(n), i = i ? e.duration(i) : n, this.slotDuration = n, this.snapDuration = i, this.minTime = e.duration(t.opt("minTime")), this.maxTime = e.duration(t.opt("maxTime")), this.axisFormat = t.opt("axisFormat") || t.opt("smallTimeFormat")
    },
    computeColHeadFormat: function() {
      return this.colCnt > 1 ? this.view.opt("dayOfMonthFormat") : "dddd";
    },
    computeEventTimeFormat: function() {
      return this.view.opt("noMeridiemTimeFormat")
    },
    computeDisplayEventEnd: function() {
      return !0
    },
    updateCells: function() {
      var t, e = this.view,
        n = [];
      for (t = this.start.clone(); t.isBefore(this.end);) n.push({
        day: t.clone()
      }), t.add(1, "day"), t = e.skipHiddenDays(t);
      this.isRTL && n.reverse(), this.colData = n, this.colCnt = n.length, this.rowCnt = Math.ceil((this.maxTime - this.minTime) / this.snapDuration)
    },
    computeCellRange: function(t) {
      var e = this.computeSnapTime(t.row),
        n = this.view.calendar.rezoneDate(t.day).time(e),
        i = n.clone().add(this.snapDuration);
      return {
        start: n,
        end: i
      }
    },
    getColEl: function(t) {
      return this.dayEls.eq(t)
    },
    computeSnapTime: function(t) {
      return e.duration(this.minTime + this.snapDuration * t)
    },
    rangeToSegs: function(t) {
      var e, n, i, r, s = this.colCnt,
        o = [];
      for (t = {
          start: t.start.clone().stripZone(),
          end: t.end.clone().stripZone()
        }, n = 0; s > n; n++) i = this.colData[n].day, r = {
        start: i.clone().time(this.minTime),
        end: i.clone().time(this.maxTime)
      }, e = y(t, r), e && (e.col = n, o.push(e));
      return o
    },
    resize: function() {
      this.computeSlatTops(), this.updateSegVerticals()
    },
    computeRowCoords: function() {
      var t, e, n = this.el.offset().top,
        i = [];
      for (t = 0; t < this.rowCnt; t++) e = {
        top: n + this.computeTimeTop(this.computeSnapTime(t))
      }, t > 0 && (i[t - 1].bottom = e.top), i.push(e);
      return e.bottom = e.top + this.computeTimeTop(this.computeSnapTime(t)), i
    },
    computeDateTop: function(t, n) {
      return this.computeTimeTop(e.duration(t.clone().stripZone() - n.clone().stripTime()))
    },
    computeTimeTop: function(t) {
      var e, n, i, r, s = (t - this.minTime) / this.slotDuration;
      return s = Math.max(0, s), s = Math.min(this.slatEls.length, s), e = Math.floor(s), n = s - e, i = this.slatTops[e], n ? (r = this.slatTops[e + 1], i + (r - i) * n) : i
    },
    computeSlatTops: function() {
      var e, n = [];
      this.slatEls.each(function(i, r) {
        e = t(r).position().top, n.push(e)
      }), n.push(e + this.slatEls.last().outerHeight()), this.slatTops = n
    },
    renderDrag: function(t, e) {
      var n;
      return e ? (this.renderRangeHelper(t, e), n = this.view.opt("dragOpacity"), void 0 !== n && this.helperEl.css("opacity", n), !0) : void this.renderHighlight(this.view.calendar.ensureVisibleEventRange(t))
    },
    destroyDrag: function() {
      this.destroyHelper(), this.destroyHighlight()
    },
    renderEventResize: function(t, e) {
      this.renderRangeHelper(t, e)
    },
    destroyEventResize: function() {
      this.destroyHelper()
    },
    renderHelper: function(e, n) {
      var i, r, s, o, a = this.eventsToSegs([e]);
      for (a = this.renderFgSegEls(a), i = this.renderSegTable(a), r = 0; r < a.length; r++) s = a[r], n && n.col === s.col && (o = n.el, s.el.css({
        left: o.css("left"),
        right: o.css("right"),
        "margin-left": o.css("margin-left"),
        "margin-right": o.css("margin-right")
      }));
      this.helperEl = t('<div class="fc-helper-skeleton"/>').append(i).appendTo(this.el)
    },
    destroyHelper: function() {
      this.helperEl && (this.helperEl.remove(), this.helperEl = null)
    },
    renderSelection: function(t) {
      this.view.opt("selectHelper") ? this.renderRangeHelper(t) : this.renderHighlight(t)
    },
    destroySelection: function() {
      this.destroyHelper(), this.destroyHighlight()
    },
    renderFill: function(e, n, i) {
      var r, s, o, a, l, d, u, c, h, f;
      if (n.length) {
        for (n = this.renderFillSegEls(e, n), r = this.groupSegCols(n), i = i || e.toLowerCase(), s = t('<div class="fc-' + i + '-skeleton"><table><tr/></table></div>'), o = s.find("tr"), a = 0; a < r.length; a++)
          if (l = r[a], d = t("<td/>").appendTo(o), l.length)
            for (u = t('<div class="fc-' + i + '-container"/>').appendTo(d), c = this.colData[a].day, h = 0; h < l.length; h++) f = l[h], u.append(f.el.css({
              top: this.computeDateTop(f.start, c),
              bottom: -this.computeDateTop(f.end, c)
            }));
        this.bookendCells(o, e), this.el.append(s), this.elsByFill[e] = s
      }
      return n
    }
  });
  qt.mixin({
    eventSkeletonEl: null,
    renderFgSegs: function(e) {
      return e = this.renderFgSegEls(e), this.el.append(this.eventSkeletonEl = t('<div class="fc-content-skeleton"/>').append(this.renderSegTable(e))), e
    },
    destroyFgSegs: function(t) {
      this.eventSkeletonEl && (this.eventSkeletonEl.remove(), this.eventSkeletonEl = null)
    },
    renderSegTable: function(e) {
      var n, i, r, s, o, a, l = t("<table><tr/></table>"),
        d = l.find("tr");
      for (n = this.groupSegCols(e), this.computeSegVerticals(e), s = 0; s < n.length; s++) {
        for (o = n[s], dt(o), a = t('<div class="fc-event-container"/>'), i = 0; i < o.length; i++) r = o[i], r.el.css(this.generateSegPositionCss(r)), r.bottom - r.top < 30 && r.el.addClass("fc-short"), a.append(r.el);
        d.append(t("<td/>").append(a))
      }
      return this.bookendCells(d, "eventSkeleton"), l
    },
    updateSegVerticals: function() {
      var t, e = (this.segs || []).concat(this.businessHourSegs || []);
      for (this.computeSegVerticals(e), t = 0; t < e.length; t++) e[t].el.css(this.generateSegVerticalCss(e[t]))
    },
    computeSegVerticals: function(t) {
      var e, n;
      for (e = 0; e < t.length; e++) n = t[e], n.top = this.computeDateTop(n.start, n.start), n.bottom = this.computeDateTop(n.end, n.start)
    },
    fgSegHtml: function(t, e) {
      var n, i, r, s = this.view,
        o = t.event,
        a = s.isEventDraggable(o),
        l = !e && t.isEnd && s.isEventResizable(o),
        d = this.getSegClasses(t, a, l),
        u = this.getEventSkinCss(o);
      return d.unshift("fc-time-grid-event"), s.isMultiDayEvent(o) ? (t.isStart || t.isEnd) && (n = this.getEventTimeText(t), i = this.getEventTimeText(t, "LT"), r = this.getEventTimeText({
        start: t.start
      })) : (n = this.getEventTimeText(o), i = this.getEventTimeText(o, "LT"), r = this.getEventTimeText({
        start: o.start
      })), '<a class="' + d.join(" ") + '"' + (o.url ? ' href="' + N(o.url) + '"' : "") + (u ? ' style="' + u + '"' : "") + '><div class="fc-content">' + (n ? '<div class="fc-time" data-start="' + N(r) + '" data-full="' + N(i) + '"><span>' + N(n) + "</span></div>" : "") + (o.title ? '<div class="fc-title">' + N(o.title) + "</div>" : "") + '</div><div class="fc-bg"/>' + (l ? '<div class="fc-resizer"/>' : "") + "</a>"
    },
    generateSegPositionCss: function(t) {
      var e, n, i = this.view.opt("slotEventOverlap"),
        r = t.backwardCoord,
        s = t.forwardCoord,
        o = this.generateSegVerticalCss(t);
      return i && (s = Math.min(1, r + 2 * (s - r))), this.isRTL ? (e = 1 - s, n = r) : (e = r, n = 1 - s), o.zIndex = t.level + 1, o.left = 100 * e + "%", o.right = 100 * n + "%", i && t.forwardPressure && (o[this.isRTL ? "marginLeft" : "marginRight"] = 20), o
    },
    generateSegVerticalCss: function(t) {
      return {
        top: t.top,
        bottom: -t.bottom
      }
    },
    groupSegCols: function(t) {
      var e, n = [];
      for (e = 0; e < this.colCnt; e++) n.push([]);
      for (e = 0; e < t.length; e++) n[t[e].col].push(t[e]);
      return n
    }
  });
  var Kt = Dt.View = Q.extend({
    type: null,
    name: null,
    title: null,
    calendar: null,
    options: null,
    coordMap: null,
    el: null,
    start: null,
    end: null,
    intervalStart: null,
    intervalEnd: null,
    intervalDuration: null,
    intervalUnit: null,
    isSelected: !1,
    scrollerEl: null,
    scrollTop: null,
    widgetHeaderClass: null,
    widgetContentClass: null,
    highlightStateClass: null,
    nextDayThreshold: null,
    isHiddenDayHash: null,
    documentMousedownProxy: null,
    constructor: function(n, i, r) {
      this.calendar = n, this.options = i, this.type = this.name = r, this.nextDayThreshold = e.duration(this.opt("nextDayThreshold")), this.initTheming(), this.initHiddenDays(), this.documentMousedownProxy = t.proxy(this, "documentMousedown"), this.initialize()
    },
    initialize: function() {},
    opt: function(e) {
      var n;
      return n = this.options[e], void 0 !== n ? n : (n = this.calendar.options[e], t.isPlainObject(n) && !r(e) ? w(n, this.type) : n)
    },
    trigger: function(t, e) {
      var n = this.calendar;
      return n.trigger.apply(n, [t, e || this].concat(Array.prototype.slice.call(arguments, 2), [this]))
    },
    setDate: function(t) {
      this.setRange(this.computeRange(t))
    },
    setRange: function(e) {
      t.extend(this, e), this.updateTitle()
    },
    computeRange: function(t) {
      var n, i, r = e.duration(this.opt("duration") || this.constructor.duration || {
          days: 1
        }),
        s = E(r),
        o = t.clone().startOf(s),
        a = o.clone().add(r);
      return /year|month|week|day/.test(s) ? (o.stripTime(), a.stripTime()) : (o.hasTime() || (o = this.calendar.rezoneDate(o)), a.hasTime() || (a = this.calendar.rezoneDate(a))), n = o.clone(), n = this.skipHiddenDays(n), i = a.clone(), i = this.skipHiddenDays(i, -1, !0), {
        intervalDuration: r,
        intervalUnit: s,
        intervalStart: o,
        intervalEnd: a,
        start: n,
        end: i
      }
    },
    computePrevDate: function(t) {
      return this.massageCurrentDate(t.clone().startOf(this.intervalUnit).subtract(this.intervalDuration), -1)
    },
    computeNextDate: function(t) {
      return this.massageCurrentDate(t.clone().startOf(this.intervalUnit).add(this.intervalDuration))
    },
    massageCurrentDate: function(t, n) {
      return this.intervalDuration <= e.duration({
        days: 1
      }) && this.isHiddenDay(t) && (t = this.skipHiddenDays(t, n), t.startOf("day")), t
    },
    updateTitle: function() {
      this.title = this.computeTitle()
    },
    computeTitle: function() {
      return this.formatRange({
        start: this.intervalStart,
        end: this.intervalEnd
      }, this.opt("titleFormat") || this.computeTitleFormat(), this.opt("titleRangeSeparator"))
    },
    computeTitleFormat: function() {
      return "year" == this.intervalUnit ? "YYYY" : "month" == this.intervalUnit ? this.opt("monthYearFormat") : this.intervalDuration.as("days") > 1 ? "ll" : "LL"
    },
    formatRange: function(t, e, n) {
      var i = t.end;
      return i.hasTime() || (i = i.clone().subtract(1)), X(t.start, i, e, n, this.opt("isRTL"))
    },
    renderView: function() {
      this.render(), this.updateSize(), this.initializeScroll(), this.trigger("viewRender", this, this, this.el), t(document).on("mousedown", this.documentMousedownProxy)
    },
    render: function() {},
    destroyView: function() {
      this.unselect(), this.destroyViewEvents(), this.destroy(), this.trigger("viewDestroy", this, this, this.el), t(document).off("mousedown", this.documentMousedownProxy)
    },
    destroy: function() {
      this.el.empty()
    },
    initTheming: function() {
      var t = this.opt("theme") ? "ui" : "fc";
      this.widgetHeaderClass = t + "-widget-header", this.widgetContentClass = t + "-widget-content", this.highlightStateClass = t + "-state-highlight"
    },
    updateSize: function(t) {
      t && this.recordScroll(), this.updateHeight(), this.updateWidth()
    },
    updateWidth: function() {},
    updateHeight: function() {
      var t = this.calendar;
      this.setHeight(t.getSuggestedViewHeight(), t.isHeightAuto())
    },
    setHeight: function(t, e) {},
    computeScrollerHeight: function(t, e) {
      var n, i;
      return e = e || this.scrollerEl, n = this.el.add(e), n.css({
        position: "relative",
        left: -1
      }), i = this.el.outerHeight() - e.height(), n.css({
        position: "",
        left: ""
      }), t - i
    },
    initializeScroll: function() {},
    recordScroll: function() {
      this.scrollerEl && (this.scrollTop = this.scrollerEl.scrollTop())
    },
    restoreScroll: function() {
      null !== this.scrollTop && this.scrollerEl.scrollTop(this.scrollTop)
    },
    renderViewEvents: function(t) {
      this.renderEvents(t), this.eventSegEach(function(t) {
        this.trigger("eventAfterRender", t.event, t.event, t.el)
      }), this.trigger("eventAfterAllRender")
    },
    renderEvents: function() {},
    destroyViewEvents: function() {
      this.eventSegEach(function(t) {
        this.trigger("eventDestroy", t.event, t.event, t.el)
      }), this.destroyEvents()
    },
    destroyEvents: function() {},
    resolveEventEl: function(e, n) {
      var i = this.trigger("eventRender", e, e, n);
      return i === !1 ? n = null : i && i !== !0 && (n = t(i)), n
    },
    showEvent: function(t) {
      this.eventSegEach(function(t) {
        t.el.css("visibility", "")
      }, t)
    },
    hideEvent: function(t) {
      this.eventSegEach(function(t) {
        t.el.css("visibility", "hidden")
      }, t)
    },
    eventSegEach: function(t, e) {
      var n, i = this.getEventSegs();
      for (n = 0; n < i.length; n++) e && i[n].event._id !== e._id || t.call(this, i[n])
    },
    getEventSegs: function() {
      return []
    },
    isEventDraggable: function(t) {
      var e = t.source || {};
      return G(t.startEditable, e.startEditable, this.opt("eventStartEditable"), t.editable, e.editable, this.opt("editable"))
    },
    reportEventDrop: function(t, e, n, i) {
      var r = this.calendar,
        s = r.mutateEvent(t, e),
        o = function() {
          s.undo(), r.reportEventChange()
        };
      this.triggerEventDrop(t, s.dateDelta, o, n, i), r.reportEventChange()
    },
    triggerEventDrop: function(t, e, n, i, r) {
      this.trigger("eventDrop", i[0], t, e, n, r, {})
    },
    reportExternalDrop: function(e, n, i, r, s) {
      var o, a, l = e.eventProps;
      l && (o = t.extend({}, l, n), a = this.calendar.renderEvent(o, e.stick)[0]), this.triggerExternalDrop(a, n, i, r, s)
    },
    triggerExternalDrop: function(t, e, n, i, r) {
      this.trigger("drop", n[0], e.start, i, r), t && this.trigger("eventReceive", null, t)
    },
    renderDrag: function(t, e) {},
    destroyDrag: function() {},
    isEventResizable: function(t) {
      var e = t.source || {};
      return G(t.durationEditable, e.durationEditable, this.opt("eventDurationEditable"), t.editable, e.editable, this.opt("editable"))
    },
    reportEventResize: function(t, e, n, i) {
      var r = this.calendar,
        s = r.mutateEvent(t, {
          end: e
        }),
        o = function() {
          s.undo(), r.reportEventChange()
        };
      this.triggerEventResize(t, s.durationDelta, o, n, i), r.reportEventChange()
    },
    triggerEventResize: function(t, e, n, i, r) {
      this.trigger("eventResize", i[0], t, e, n, r, {})
    },
    select: function(t, e) {
      this.unselect(e), this.renderSelection(t), this.reportSelection(t, e)
    },
    renderSelection: function(t) {},
    reportSelection: function(t, e) {
      this.isSelected = !0, this.trigger("select", null, t.start, t.end, e)
    },
    unselect: function(t) {
      this.isSelected && (this.isSelected = !1, this.destroySelection(), this.trigger("unselect", null, t))
    },
    destroySelection: function() {},
    documentMousedown: function(e) {
      var n;
      this.isSelected && this.opt("unselectAuto") && v(e) && (n = this.opt("unselectCancel"), n && t(e.target).closest(n).length || this.unselect(e))
    },
    initHiddenDays: function() {
      var e, n = this.opt("hiddenDays") || [],
        i = [],
        r = 0;
      for (this.opt("weekends") === !1 && n.push(0, 6), e = 0; 7 > e; e++)(i[e] = -1 !== t.inArray(e, n)) || r++;
      if (!r) throw "invalid hiddenDays";
      this.isHiddenDayHash = i
    },
    isHiddenDay: function(t) {
      return e.isMoment(t) && (t = t.day()), this.isHiddenDayHash[t]
    },
    skipHiddenDays: function(t, e, n) {
      var i = t.clone();
      for (e = e || 1; this.isHiddenDayHash[(i.day() + (n ? e : 0) + 7) % 7];) i.add(e, "days");
      return i
    },
    computeDayRange: function(t) {
      var e, n = t.start.clone().stripTime(),
        i = t.end,
        r = null;
      return i && (r = i.clone().stripTime(), e = +i.time(), e && e >= this.nextDayThreshold && r.add(1, "days")), (!i || n >= r) && (r = n.clone().add(1, "days")), {
        start: n,
        end: r
      }
    },
    isMultiDayEvent: function(t) {
      var e = this.computeDayRange(t);
      return e.end.diff(e.start, "days") > 1
    }
  });
  Dt.sourceNormalizers = [], Dt.sourceFetchers = [];
  var Qt = {
      dataType: "json",
      cache: !1
    },
    Jt = 1,
    te = Tt.basic = Kt.extend({
      dayGrid: null,
      dayNumbersVisible: !1,
      weekNumbersVisible: !1,
      weekNumberWidth: null,
      headRowEl: null,
      initialize: function() {
        this.dayGrid = new $t(this), this.coordMap = this.dayGrid.coordMap
      },
      setRange: function(t) {
        Kt.prototype.setRange.call(this, t), this.dayGrid.breakOnWeeks = /year|month|week/.test(this.intervalUnit), this.dayGrid.setRange(t)
      },
      computeRange: function(t) {
        var e = Kt.prototype.computeRange.call(this, t);
        return /year|month/.test(e.intervalUnit) && (e.start.startOf("week"), e.start = this.skipHiddenDays(e.start), e.end.weekday() && (e.end.add(1, "week").startOf("week"), e.end = this.skipHiddenDays(e.end, -1, !0))), e
      },
      render: function() {
        this.dayNumbersVisible = this.dayGrid.rowCnt > 1, this.weekNumbersVisible = this.opt("weekNumbers"), this.dayGrid.numbersVisible = this.dayNumbersVisible || this.weekNumbersVisible, this.el.addClass("fc-basic-view").html(this.renderHtml()), this.headRowEl = this.el.find("thead .fc-row"), this.scrollerEl = this.el.find(".fc-day-grid-container"), this.dayGrid.coordMap.containerEl = this.scrollerEl, this.dayGrid.el = this.el.find(".fc-day-grid"), this.dayGrid.render(this.hasRigidRows())
      },
      destroy: function() {
        this.dayGrid.destroy(), Kt.prototype.destroy.call(this)
      },
      renderHtml: function() {
        return '<table><thead><tr><td class="' + this.widgetHeaderClass + '">' + this.dayGrid.headHtml() + '</td></tr></thead><tbody><tr><td class="' + this.widgetContentClass + '"><div class="fc-day-grid-container"><div class="fc-day-grid"/></div></td></tr></tbody></table>'
      },
      headIntroHtml: function() {
        return this.weekNumbersVisible ? '<th class="fc-week-number ' + this.widgetHeaderClass + '" ' + this.weekNumberStyleAttr() + "><span>" + N(this.opt("weekNumberTitle")) + "</span></th>" : void 0
      },
      numberIntroHtml: function(t) {
        return this.weekNumbersVisible ? '<td class="fc-week-number" ' + this.weekNumberStyleAttr() + "><span>" + this.calendar.calculateWeekNumber(this.dayGrid.getCell(t, 0).start) + "</span></td>" : void 0
      },
      dayIntroHtml: function() {
        return this.weekNumbersVisible ? '<td class="fc-week-number ' + this.widgetContentClass + '" ' + this.weekNumberStyleAttr() + "></td>" : void 0
      },
      introHtml: function() {
        return this.weekNumbersVisible ? '<td class="fc-week-number" ' + this.weekNumberStyleAttr() + "></td>" : void 0
      },
      numberCellHtml: function(t) {
        var e, n = t.start;
        return this.dayNumbersVisible ? (e = this.dayGrid.getDayClasses(n), e.unshift("fc-day-number"), '<td class="' + e.join(" ") + '" data-date="' + n.format() + '">' + n.date() + "</td>") : "<td/>"
      },
      weekNumberStyleAttr: function() {
        return null !== this.weekNumberWidth ? 'style="width:' + this.weekNumberWidth + 'px"' : ""
      },
      hasRigidRows: function() {
        var t = this.opt("eventLimit");
        return t && "number" != typeof t
      },
      updateWidth: function() {
        this.weekNumbersVisible && (this.weekNumberWidth = h(this.el.find(".fc-week-number")))
      },
      setHeight: function(t, e) {
        var n, i = this.opt("eventLimit");
        g(this.scrollerEl), a(this.headRowEl), this.dayGrid.destroySegPopover(), i && "number" == typeof i && this.dayGrid.limitRows(i), n = this.computeScrollerHeight(t), this.setGridHeight(n, e), i && "number" != typeof i && this.dayGrid.limitRows(i), !e && f(this.scrollerEl, n) && (o(this.headRowEl, m(this.scrollerEl)), n = this.computeScrollerHeight(t), this.scrollerEl.height(n), this.restoreScroll())
      },
      setGridHeight: function(t, e) {
        e ? c(this.dayGrid.rowEls) : u(this.dayGrid.rowEls, t, !0)
      },
      renderEvents: function(t) {
        this.dayGrid.renderEvents(t), this.updateHeight()
      },
      getEventSegs: function() {
        return this.dayGrid.getEventSegs()
      },
      destroyEvents: function() {
        this.recordScroll(), this.dayGrid.destroyEvents()
      },
      renderDrag: function(t, e) {
        return this.dayGrid.renderDrag(t, e)
      },
      destroyDrag: function() {
        this.dayGrid.destroyDrag()
      },
      renderSelection: function(t) {
        this.dayGrid.renderSelection(t)
      },
      destroySelection: function() {
        this.dayGrid.destroySelection()
      }
    });
  n({
    fixedWeekCount: !0
  });
  var ee = Tt.month = te.extend({
    computeRange: function(t) {
      var e, n = te.prototype.computeRange.call(this, t);
      return this.isFixedWeeks() && (e = Math.ceil(n.end.diff(n.start, "weeks", !0)), n.end.add(6 - e, "weeks")), n
    },
    setGridHeight: function(t, e) {
      e = e || "variable" === this.opt("weekMode"), e && (t *= this.rowCnt / 6), u(this.dayGrid.rowEls, t, !e)
    },
    isFixedWeeks: function() {
      var t = this.opt("weekMode");
      return t ? "fixed" === t : this.opt("fixedWeekCount")
    }
  });
  ee.duration = {
    months: 1
  }, Tt.basicWeek = {
    type: "basic",
    duration: {
      weeks: 1
    }
  }, Tt.basicDay = {
    type: "basic",
    duration: {
      days: 1
    }
  }, n({
    allDaySlot: !0,
    allDayText: "all-day",
    scrollTime: "06:00:00",
    slotDuration: "00:30:00",
    minTime: "00:00:00",
    maxTime: "24:00:00",
    slotEventOverlap: !0
  });
  var ne = 5;
  Tt.agenda = Kt.extend({
    timeGrid: null,
    dayGrid: null,
    axisWidth: null,
    noScrollRowEls: null,
    bottomRuleEl: null,
    bottomRuleHeight: null,
    initialize: function() {
      this.timeGrid = new qt(this), this.opt("allDaySlot") ? (this.dayGrid = new $t(this), this.coordMap = new It([this.dayGrid.coordMap, this.timeGrid.coordMap])) : this.coordMap = this.timeGrid.coordMap
    },
    setRange: function(t) {
      Kt.prototype.setRange.call(this, t), this.timeGrid.setRange(t), this.dayGrid && this.dayGrid.setRange(t)
    },
    render: function() {
      this.el.addClass("fc-agenda-view").html(this.renderHtml()), this.scrollerEl = this.el.find(".fc-time-grid-container"), this.timeGrid.coordMap.containerEl = this.scrollerEl, this.timeGrid.el = this.el.find(".fc-time-grid"), this.timeGrid.render(), this.bottomRuleEl = t('<hr class="' + this.widgetHeaderClass + '"/>').appendTo(this.timeGrid.el), this.dayGrid && (this.dayGrid.el = this.el.find(".fc-day-grid"), this.dayGrid.render(), this.dayGrid.bottomCoordPadding = this.dayGrid.el.next("hr").outerHeight()), this.noScrollRowEls = this.el.find(".fc-row:not(.fc-scroller *)")
    },
    destroy: function() {
      this.timeGrid.destroy(), this.dayGrid && this.dayGrid.destroy(), Kt.prototype.destroy.call(this)
    },
    renderHtml: function() {
      return '<table><thead><tr><td class="' + this.widgetHeaderClass + '">' + this.timeGrid.headHtml() + '</td></tr></thead><tbody><tr><td class="' + this.widgetContentClass + '">' + (this.dayGrid ? '<div class="fc-day-grid"/><hr class="' + this.widgetHeaderClass + '"/>' : "") + '<div class="fc-time-grid-container"><div class="fc-time-grid"/></div></td></tr></tbody></table>'
    },
    headIntroHtml: function() {
      var t, e, n, i;
      return this.opt("weekNumbers") ? (t = this.timeGrid.getCell(0).start, e = this.calendar.calculateWeekNumber(t), n = this.opt("weekNumberTitle"), i = this.opt("isRTL") ? e + n : n + e, '<th class="fc-axis fc-week-number ' + this.widgetHeaderClass + '" ' + this.axisStyleAttr() + "><span>" + N(i) + "</span></th>") : '<th class="fc-axis ' + this.widgetHeaderClass + '" ' + this.axisStyleAttr() + "></th>"
    },
    dayIntroHtml: function() {
      return '<td class="fc-axis ' + this.widgetContentClass + '" ' + this.axisStyleAttr() + "><span>" + (this.opt("allDayHtml") || N(this.opt("allDayText"))) + "</span></td>"
    },
    slotBgIntroHtml: function() {
      return '<td class="fc-axis ' + this.widgetContentClass + '" ' + this.axisStyleAttr() + "></td>"
    },
    introHtml: function() {
      return '<td class="fc-axis" ' + this.axisStyleAttr() + "></td>"
    },
    axisStyleAttr: function() {
      return null !== this.axisWidth ? 'style="width:' + this.axisWidth + 'px"' : ""
    },
    updateSize: function(t) {
      t && this.timeGrid.resize(), Kt.prototype.updateSize.call(this, t)
    },
    updateWidth: function() {
      this.axisWidth = h(this.el.find(".fc-axis"))
    },
    setHeight: function(t, e) {
      var n, i;
      null === this.bottomRuleHeight && (this.bottomRuleHeight = this.bottomRuleEl.outerHeight()), this.bottomRuleEl.hide(), this.scrollerEl.css("overflow", ""), g(this.scrollerEl), a(this.noScrollRowEls), this.dayGrid && (this.dayGrid.destroySegPopover(), n = this.opt("eventLimit"), n && "number" != typeof n && (n = ne), n && this.dayGrid.limitRows(n)), e || (i = this.computeScrollerHeight(t), f(this.scrollerEl, i) ? (o(this.noScrollRowEls, m(this.scrollerEl)), i = this.computeScrollerHeight(t), this.scrollerEl.height(i), this.restoreScroll()) : (this.scrollerEl.height(i).css("overflow", "hidden"), this.bottomRuleEl.show()))
    },
    initializeScroll: function() {
      function t() {
        n.scrollerEl.scrollTop(r)
      }
      var n = this,
        i = e.duration(this.opt("scrollTime")),
        r = this.timeGrid.computeTimeTop(i);
      r = Math.ceil(r), r && r++, t(), setTimeout(t, 0)
    },
    renderEvents: function(t) {
      var e, n, i = [],
        r = [],
        s = [];
      for (n = 0; n < t.length; n++) t[n].allDay ? i.push(t[n]) : r.push(t[n]);
      e = this.timeGrid.renderEvents(r), this.dayGrid && (s = this.dayGrid.renderEvents(i)), this.updateHeight()
    },
    getEventSegs: function() {
      return this.timeGrid.getEventSegs().concat(this.dayGrid ? this.dayGrid.getEventSegs() : [])
    },
    destroyEvents: function() {
      this.recordScroll(), this.timeGrid.destroyEvents(), this.dayGrid && this.dayGrid.destroyEvents()
    },
    renderDrag: function(t, e) {
      return t.start.hasTime() ? this.timeGrid.renderDrag(t, e) : this.dayGrid ? this.dayGrid.renderDrag(t, e) : void 0
    },
    destroyDrag: function() {
      this.timeGrid.destroyDrag(), this.dayGrid && this.dayGrid.destroyDrag()
    },
    renderSelection: function(t) {
      t.start.hasTime() || t.end.hasTime() ? this.timeGrid.renderSelection(t) : this.dayGrid && this.dayGrid.renderSelection(t)
    },
    destroySelection: function() {
      this.timeGrid.destroySelection(), this.dayGrid && this.dayGrid.destroySelection()
    }
  }), Tt.agendaWeek = {
    type: "agenda",
    duration: {
      weeks: 1
    }
  }, Tt.agendaDay = {
    type: "agenda",
    duration: {
      days: 1
    }
  }, n({
    yearColumns: 2,
    fixedWeekCount: 5
  }), Tt.year = Kt.extend({
    dayNumbersVisible: !0,
    weekNumbersVisible: !1,
    weekNumberWidth: null,
    table: null,
    body: null,
    bodyRows: null,
    subTables: null,
    bodyCells: null,
    daySegmentContainer: null,
    colCnt: null,
    rowCnt: null,
    dayGrids: [],
    rtl: null,
    dis: null,
    dit: null,
    firstDay: 0,
    firstMonth: null,
    lastMonth: null,
    yearColumns: 2,
    nbMonths: null,
    hiddenMonths: [],
    nwe: null,
    tm: null,
    colFormat: null,
    dayGrid: null,
    coordMap: null,
    otherMonthDays: [],
    rowsForMonth: [],
    initialize: function() {
      this.updateOptions(), this.dayGrid = new $t(this), this.dayGrids[0] = this.dayGrid, this.coordMap = this.dayGrid.coordMap
    },
    updateOptions: function() {
      this.rtl = this.opt("isRTL"), this.rtl ? (this.dis = -1, this.dit = this.colCnt - 1) : (this.dis = 1, this.dit = 0), this.firstDay = parseInt(this.opt("firstDay"), 10), this.firstMonth = parseInt(this.opt("firstMonth"), 10) || 0, this.lastMonth = this.opt("lastMonth") || this.firstMonth + 12, this.hiddenMonths = this.opt("hiddenMonths") || [], this.yearColumns = parseInt(this.opt("yearColumns"), 10) || 2, this.colFormat = this.opt("columnFormat"), this.weekNumbersVisible = this.opt("weekNumbers"), this.nwe = this.opt("weekends") ? 0 : 1, this.tm = this.opt("theme") ? "ui" : "fc", this.nbMonths = this.lastMonth - this.firstMonth, this.lastMonth = this.lastMonth % 12, this.lang = this.opt("lang")
    },
    computeTitle: function() {
      if (null !== this.opt("yearTitleFormat")) {
        var t = this.intervalStart.locale(this.lang).format(this.opt("yearTitleFormat")),
          e = this.intervalStart.clone().add(this.nbMonths - 1, "months");
        return e.year() != this.intervalStart.year() && (t += this.intervalEnd.format(" - YYYY")), t
      }
      return this.formatRange({
        start: this.intervalStart,
        end: this.intervalEnd
      }, this.opt("titleFormat") || this.computeTitleFormat(), this.opt("titleRangeSeparator"))
    },
    render: function(t) {
      var e = Math.floor(this.intervalStart.month() / this.nbMonths) * this.nbMonths;
      !e && this.firstMonth > 0 && !this.opt("lastMonth") && (e = (this.firstMonth + e) % 12), this.intervalStart = Dt.moment([this.intervalStart.year(), e, 1]), this.intervalEnd = this.intervalStart.clone().add(this.nbMonths, "months").add(-15, "minutes"), this.start = this.intervalStart.clone(), this.start = this.skipHiddenDays(this.start), this.start.startOf("week"), this.start = this.skipHiddenDays(this.start), this.end = this.intervalEnd.clone(), this.end = this.skipHiddenDays(this.end, -1, !0), this.end.add((7 - this.end.weekday()) % 7, "days"), this.end = this.skipHiddenDays(this.end, -1, !0);
      var n = parseInt(this.opt("yearColumns"), 10),
        i = this.opt("weekends") ? 7 : 5;
      this.renderYear(n, i, !0)
    },
    renderYear: function(t, e, n) {
      this.colCnt = e;
      var i = !this.table;
      i || (this.destroyEvents(), this.table.remove()), this.buildSkeleton(this.yearColumns, n), this.buildDayGrids(), this.updateCells()
    },
    setRange: function(t) {
      Kt.prototype.setRange.call(this, t)
    },
    computeRange: function(t) {
      this.constructor.duration = {
        months: this.nbMonths || 12
      };
      var e = Kt.prototype.computeRange.call(this, t);
      return /year|month/.test(e.intervalUnit) && (e.start.startOf("week"), e.start = this.skipHiddenDays(e.start), e.end.weekday() && (e.end.add(1, "week").startOf("week"), e.end = this.skipHiddenDays(e.end, -1, !0))), e
    },
    buildSkeleton: function(e, n) {
      var i, r, s, o, a = 0,
        l = 0,
        d = this.intervalStart.year(),
        u = this.tm + "-widget-header",
        c = this.opt("dayNamesShort"),
        h = this.opt("monthNames");
      for (this.rowCnt = 0, o = '<table class="fc-year-main-table fc-border-separate" style="width:100%;"><tr>', o += '<td class="fc-year-month-border fc-first"></td>', r = 0; r < this.nbMonths; r++) {
        var f = this.intervalStart.month() + r,
          g = -1 != t.inArray(f % 12, this.hiddenMonths),
          p = g ? "display:none;" : "",
          m = Dt.moment([d + f / 12, f % 12, 1]).locale(this.lang),
          v = h[r % 12],
          y = m.format("YYYYMM");
        if (s = m.year(), this.firstMonth + this.nbMonths > 12 && (v = v + " " + s), r % e === 0 && r > 0 && !g && (l++, o += '<td class="fc-year-month-border fc-last"></td></tr><tr><td class="fc-year-month-border fc-first"></td>'), e > r % e && r % e > 0 && !g && (o += '<td class="fc-year-month-separator"></td>'), o += '<td class="fc-year-monthly-td" style="' + p + '">', o += '<div class="fc-year-monthly-name' + (0 === l ? " fc-first" : "") + '"><a name="' + y + '" data-year="' + s + '" data-month="' + f + '" href="#">' + N(v) + "</a></div>", o += '<div class="fc-row ' + u + '">', o += '<table class="fc-year-month-header"><thead><tr class="fc-year-week-days">', 0 == this.opt("isRTL"))
          for (o += this.headIntroHtml(), i = this.firstDay; i < this.colCnt + this.firstDay; i++) o += '<th class="fc-day-header fc-year-weekly-head fc-' + Gt[i % 7] + " " + u + '">' + c[i % 7] + "</th>";
        else {
          for (i = this.colCnt + this.firstDay - 1; i > this.firstDay - 1; i--) o += '<th class="fc-day-header fc-year-weekly-head fc-' + Gt[i % 7] + " " + u + '">' + c[i % 7] + "</th>";
          o += this.headIntroHtml()
        }
        o += "</tr><tr></tr></thead></table>", o += "</div>", o += '<div class="fc-day-grid-container"><div class="fc-day-grid">', o += "</div></div>", o += '<div class="fc-year-monthly-footer"></div>', o += "</td>", g && a++
      }
      o += '<td class="fc-year-month-border fc-last"></td>', o += "</tr></table>", this.table = t(o).appendTo(this.el), this.bodyRows = this.table.find(".fc-day-grid .fc-week"), this.bodyCells = this.bodyRows.find("td.fc-day"), this.bodyFirstCells = this.bodyCells.filter(":first-child"), this.subTables = this.table.find("td.fc-year-monthly-td"), this.head = this.table.find("thead"), this.head.find("tr.fc-year-week-days th.fc-year-weekly-head:first").addClass("fc-first"), this.head.find("tr.fc-year-week-days th.fc-year-weekly-head:last").addClass("fc-last"), this.table.find(".fc-year-monthly-name a").click(this.calendar, function(e) {
        e.data.changeView("month"), e.data.gotoDate([t(this).attr("data-year"), t(this).attr("data-month"), 1])
      }), this.dayBind(this.bodyCells), this.daySegmentContainer = t('<div style="position:absolute;z-index:8;top:0;left:0;"/>').appendTo(this.table)
    },
    buildDayGrids: function() {
      for (var e = this, n = [], i = 0; i < this.nbMonths; i++) n.push(i + this.intervalStart.month());
      var r = e.intervalStart.clone();
      this.firstDay;
      e.dayGrids = [], t.each(n, function(t, n) {
        var i = new $t(e),
          s = e.tableByOffset(t),
          o = r.clone().add(t, "months");
        i.headRowEl = s.find(".fc-row:first"), i.scrollerEl = s.find(".fc-day-grid-container"), i.coordMap.containerEl = i.scrollerEl, i.el = s.find(".fc-day-grid"), i.offset = t, i.rowData = [], i.colData = [];
        var a = e.computeMonthRange(o);
        i.start = a.start, i.end = a.end, i.breakOnWeeks = !0, i.updateCells(), e.dayNumbersVisible = i.rowCnt > 1, i.numbersVisible = e.dayNumbersVisible || e.weekNumbersVisible, $t.prototype.render.call(i, e.hasRigidRows()), e.dayGrids.push(i)
      }), e.dayGrid = e.dayGrids[0], e.coordMap = e.dayGrid.coordMap
    },
    isFixedWeeks: function() {
      var t = this.opt("weekMode");
      return t ? "fixed" === t : this.opt("fixedWeekCount")
    },
    computeMonthRange: function(t) {
      var e = this.firstDay;
      this.constructor.duration = {
        months: 1
      };
      var n = Kt.prototype.computeRange.call(this, t);
      if (/year|month/.test(n.intervalUnit)) {
        n.start.startOf("week"), n.start = this.skipHiddenDays(n.start), n.start.day(e), n.end.day(e), n.start.date() > 1 && n.start.date() <= 7 && n.start.subtract(7, "days");
        var i = Math.ceil(n.end.diff(n.start, "weeks", !0));
        5 === this.isFixedWeeks() ? 4 == i && n.end.add(1, "weeks") : this.isFixedWeeks() && 6 >= i && n.end.add(6 - i, "weeks")
      }
      return n
    },
    destroy: function() {
      t.each(this.dayGrids, function(t, e) {
        e.destroy()
      }), Kt.prototype.destroy.call(this)
    },
    updateCells: function() {
      var n = this;
      this.subTables.find(".fc-week:first").addClass("fc-first"), this.subTables.find(".fc-week:last").addClass("fc-last"), this.subTables.find(".fc-bg").find("td.fc-day:last").addClass("fc-last"), this.subTables.each(function(i, r) {
        n.curYear || (n.curYear = n.intervalStart);
        var s = n.curYear.clone(),
          o = (i + n.intervalStart.month()) % 12;
        s = n.dayGrids[i].start;
        var a = 0;
        t(r).find(".fc-bg").find("td.fc-day:first").addClass("fc-first"), n.otherMonthDays[o] = [0, 0, 0, 0], t(r).find(".fc-content-skeleton tr").each(function(n, r) {
          t(r).find("td").not(".fc-week-number").each(function(n, r) {
            var s = t(r),
              o = e(s.attr("data-date"));
            o.month() != i ? (s.addClass("fc-other-month"), o.month() == i ? s.addClass("fc-prev-month") : s.addClass("fc-next-month")) : a = o
          })
        })
      }), n.bodyRows.filter(".fc-year-have-event").removeClass("fc-year-have-event")
    },
    headIntroHtml: function() {
      var t = null != this.opt("weekNumberTitle") ? this.opt("weekNumberTitle").substring(0, 1) : "";
      return this.weekNumbersVisible ? '<th class="fc-week-number-head ' + this.widgetHeaderClass + '"><span>' + N(t) + "</span></th>" : ""
    },
    numberIntroHtml: function(t, e) {
      if (this.weekNumbersVisible) {
        e = e || this.dayGrid;
        var n;
        return n = 0 == this.opt("isRTL") ? this.calendar.calculateWeekNumber(e.getCell(t, 0).start) : this.calendar.calculateWeekNumber(e.getCell(t, 6).start), '<td class="fc-week-number" ' + this.weekNumberStyleAttr("") + "><span>" + n + "</span></td>"
      }
      return ""
    },
    dayIntroHtml: function() {
      return this.weekNumbersVisible ? '<td class="fc-week-number ' + this.widgetContentClass + '" ' + this.weekNumberStyleAttr("") + "></td>" : ""
    },
    introHtml: function() {
      return this.weekNumbersVisible ? '<td class="fc-week-number" ' + this.weekNumberStyleAttr("") + "></td>" : ""
    },
    weekNumberStyleAttr: function() {
      var t = "";
      return null !== this.weekNumberWidth && (t = 'style="width:' + this.weekNumberWidth + 'px;"'), t
    },
    numberCellHtml: function(t) {
      if (!this.dayNumbersVisible) return "<td/>";
      var e = t.start,
        n = this.dayGrid.getDayClasses(e);
      return n.unshift("fc-day-number"), '<td class="' + n.join(" ") + '" data-date="' + e.format() + '">' + e.date() + "</td>"
    },
    hasRigidRows: function() {
      var t = this.opt("eventLimit");
      return t && "number" != typeof t
    },
    cellsForMonth: function(t) {
      return this.rowsForMonth[t] * (this.nwe ? 5 : 7)
    },
    addDays: function(t, e) {
      t.add(e, "days")
    },
    skipWeekend: function(t, e, n) {
      for (e = e || 1; !t.day() || n && 1 == t.day() || !n && 6 == t.day();) this.addDays(t, e);
      return t
    },
    daysInMonth: function(t, e) {
      return Dt.moment([t, e, 0]).date()
    },
    dateInMonth: function(t, e) {
      return t.month() == e % 12
    },
    rowToGridOffset: function(t) {
      for (var e = 0, n = this.firstMonth; n < this.lastMonth; n++)
        if (e += this.rowsForMonth[n], e > t) return n - this.firstMonth;
      return -1
    },
    rowToGridRow: function(t) {
      for (var e = 0, n = this.firstMonth; n < this.lastMonth; n++)
        if (e += this.rowsForMonth[n], e > t) return t - (e - this.rowsForMonth[n]);
      return -1
    },
    tableByOffset: function(e) {
      return t(this.subTables[e])
    },
    setGridHeight: function(e, n, i) {
      return "undefined" != typeof i ? void(n ? c(i.rowEls) : u(i.rowEls, e, !0)) : void t.each(this.dayGrids, function(t, i) {
        n ? c(i.rowEls) : u(i.rowEls, e, !0)
      })
    },
    computeScrollerHeight: function(t, e) {
      var n, i;
      e = e || this.scrollerEl;
      var r = e.closest(".fc-year-monthly-td");
      return n = r.add(e), n.css({
        position: "relative",
        left: -1
      }), i = r.outerHeight() - e.height(), n.css({
        position: "",
        left: ""
      }), t - i
    },
    setHeight: function(e, n) {
      var i, r = this,
        s = this.opt("eventLimit");
      t.each(this.dayGrids, function(t, l) {
        l.el.length > 0 && (g(l.scrollerEl), a(l.headRowEl), l.destroySegPopover(), s && "number" == typeof s && l.limitRows(s), i || (i = r.computeScrollerHeight(e, l.scrollerEl)), r.setGridHeight(i, n, l), s && "number" != typeof s && l.limitRows(s), !n && f(l.scrollerEl, i) && (o(l.headRowEl, m(l.scrollerEl)),
          i = r.computeScrollerHeight(e, l.scrollerEl), l.scrollerEl.height(i), r.restoreScroll()))
      })
    },
    updateWidth: function() {
      this.weekNumbersVisible && (this.weekNumberWidth = h(this.el.find(".fc-week-number")), this.weekNumberWidth && this.el.find(".fc-week-number-head").width(this.weekNumberWidth + 2))
    },
    updateHeight: function() {
      var t = this.calendar;
      if (this.yearColumns > 0) {
        var e = t.getSuggestedViewHeight() * (1.1 / (.01 + this.yearColumns));
        this.setHeight(e, t.isHeightAuto())
      }
    },
    dayBind: function(t) {
      t.click(this.dayClick)
    },
    dayClick: function(e) {
      if (!this.opt("selectable")) {
        var n = this.className.match(/fc\-day\-(\d+)\-(\d+)\-(\d+)/),
          i = new Date(n[1], n[2] - 1, n[3]);
        t.trigger("dayClick", this, Dt.moment(i), !0, e)
      }
    },
    renderEvents: function(e) {
      t.each(this.dayGrids, function(t, n) {
        n.renderEvents(e)
      }), this.updateHeight()
    },
    getEventSegs: function() {
      var e = [];
      return t.each(this.dayGrids, function(t, n) {
        for (var i = n.getEventSegs(), r = 0; r < i.length; r++) e.push(i[r])
      }), e
    },
    destroyEvents: function() {
      this.recordScroll(), t.each(this.dayGrids, function(t, e) {
        e.destroyEvents()
      })
    },
    renderDrag: function(e, n) {
      var i = !1;
      return t.each(this.dayGrids, function(t, i) {
        i.renderDrag(e, n)
      }), i
    },
    destroyDrag: function() {
      t.each(this.dayGrids, function(t, e) {
        e.destroyDrag()
      })
    },
    renderSelection: function(e, n) {
      t.each(this.dayGrids, function(t, i) {
        i !== n && (i.start <= e.end || i.end >= e.start) && i.renderSelection(e)
      })
    },
    destroySelection: function() {
      t.each(this.dayGrids, function(t, e) {
        e.destroySelection()
      })
    }
  })
});
/*! RESOURCE: /scripts/reportcommon/report_includes_hardcoded_defaults.js */
var chartHelpers = window.chartHelpers || {};
chartHelpers.i18n = chartHelpers.i18n || {};
chartHelpers.i18n.building = "Building chart, please wait...";
chartHelpers.i18n.total = "Total";
chartHelpers.i18n.maxCells = "The size of the pivot table is too big. Use filters to reduce it or switch to a modern browser.";
chartHelpers.i18n.chartGenerationError = "An error occurred while generating chart. Please try again later.";
chartHelpers.i18n.showAsHeatmap = "Show data as a heatmap visualization";
chartHelpers.i18n.showAsMarkers = "Show data using latitude and longitude";
chartHelpers.i18n.highlightBasedOn = "Highlight based on:";
chartHelpers.i18n.isRTL = false;
chartHelpers.i18n.weekNumberTitle = "Week";
chartHelpers.i18n.weekNumberTitleShort = "W";
chartHelpers.i18n.seeMoreEvents = "See {0} more events";
chartHelpers.i18n.viewEventsInList = "View {0} events in a list";
chartHelpers.i18n.viewAllEventsInList = "View all events in a list";
chartHelpers.i18n.viewAllRecords = "View all records";
chartHelpers.i18n.none = "None";
chartHelpers.i18n.plusMany = "+ many";
chartHelpers.i18n.plusMore = "+ {0} more";
chartHelpers.i18n.buttonText = {
  prevYear: "",
  nextYear: "",
  today: 'today',
  year: 'year',
  month: 'month',
  week: 'week',
  day: 'day'
};
chartHelpers.i18n.allDayHtml = "all-day";
chartHelpers.i18n.daysNames = ['Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];
chartHelpers.i18n.dayNamesShort = ['Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];
chartHelpers.i18n.monthNames = ['January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
chartHelpers.i18n.monthNamesShort = ['Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];
chartHelpers.i18n.none = '-- None --';
chartHelpers.i18n.groupBy = 'Group by';
chartHelpers.i18n.groupByTitle = 'Select a different group by field';
chartHelpers.i18n.stackBy = 'Stacked by';
chartHelpers.i18n.stackByTitle = 'Select a different stacked by field';
chartHelpers.i18n.saveAsJpg = 'Save as JPEG';
chartHelpers.i18n.saveAsPng = 'Save as PNG';
chartHelpers.device = {};
chartHelpers.device.type = "doctype";
chartHelpers.systemParams = {
  firstDay: 1,
  defaultDate: "2017-01-01",
  maxEventsDisplayedPerCell: 3,
  maxMoreEventsPerDay: 30,
  defaultEventDuration: "01:00:00",
  maxDaysBack: 30,
  enablePreviewOnHover: false,
  isCalendarV2Enabled: true,
  fixedHeaders: true,
  slotEventOverlap: false
};;
/*! RESOURCE: /scripts/reportcommon/chart-helpers.js */
var chartHelpers = window.chartHelpers || {};
chartHelpers.objectSize = function objectSize(obj) {
  var size = 0;
  var key;
  for (key in obj)
    if (obj.hasOwnProperty(key))
      size++;
  return size;
};
chartHelpers.compareByProperty = function compareByProperty(property, desc) {
  return function propertyCompare(a, b) {
    if (a[property] > b[property])
      return desc ? -1 : 1;
    if (a[property] < b[property])
      return desc ? 1 : -1;
    return 0;
  };
};
chartHelpers.evaluateColorRules = function evaluateColorRules(score, rules) {
  if (typeof score !== 'undefined' && score !== null && score !== '' && rules) {
    rules.sort(chartHelpers.compareByProperty('ruleOrder', true));
    var operate = {
      '<': function lessThan(x, y) {
        return x < y;
      },
      '<=': function lessThanEqual(x, y) {
        return x <= y;
      },
      '=': function Equal(x, y) {
        return x === y;
      },
      '>=': function greaterThanEqual(x, y) {
        return x >= y;
      },
      '>': function greaterThan(x, y) {
        return x > y;
      },
      between: function between(x, y, z) {
        return x > y && x < z;
      }
    };
    for (var i = 0; i < rules.length; i++)
      if (operate[rules[i].operator](score, rules[i].value1, rules[i].value2))
        return {
          color: rules[i].color,
          bgColor: rules[i].bgColor
        };
  }
  return '';
};
chartHelpers.hexEncode = function(utf8String) {
  var hex;
  var i;
  var result = '';
  for (i = 0; i < utf8String.length; i++) {
    hex = utf8String.charCodeAt(i).toString(16);
    result += '\\u' + ('000' + hex).slice(-4);
  }
  return result;
};;
/*! RESOURCE: /scripts/reportcommon/display_grid.js */
function checkAndEnableDisplayGrid(chartData, args) {
  args.otherDisplay = 'Other';
  args.otherDisplayMore = '(more...)';
  if ('report_properties' in chartData) {
    args.otherDisplay = chartData.report_properties.other_display;
    args.otherDisplayMore = chartData.report_properties.other_display_more;
  }
  var $gridTable = getGridTable(args);
  var hasData = (chartData.series[0].xvalues && chartData.series[0].xvalues.length) || args.chart_type === 'solid_gauge' || args.chart_type === 'angular_gauge';
  if ($gridTable.length && hasData) {
    $gridTable.attr({
      tabindex: '0',
      role: 'grid'
    });
    $gridTable.html('<thead>' +
      '<tr class="header display_grid_header" role="row">' +
      '</tr>' +
      '</thead>' +
      '<tbody class="display_grid_body"/>');
    enableDisplayGrid($gridTable, chartData, args);
  } else
    $gridTable.empty();
}

function enableDisplayGrid($gridTable, chartData, args) {
  if (args.chart_type === 'box' || args.chart_type === 'tbox')
    createBoxDisplayGrid($gridTable, chartData);
  else if (args.chart_type === 'control')
    showControlDisplayGrid($gridTable, chartData);
  else if (args.chart_type === 'solid_gauge' || args.chart_type === 'angular_gauge')
    createGaugeDisplayGrid($gridTable, chartData);
  else
    showDisplayGrid($gridTable, chartData, isTwoLevelDisplayGrid(args), args);
  if (args.display_grid)
    $gridTable.show();
  else
    $gridTable.hide();
  addAccessibility($gridTable, chartData, args);
}

function showDisplayGrid($gridTable, chartData, hasStacking, args) {
  var otherKey = 'zzyynomatchaabb';
  var $gridTableBody = getGridTableBody($gridTable);
  var yDispValsExist = false;
  if (chartData.series.length) {
    var seriesData = chartData.series[0];
    if ('ydisplayvalues' in seriesData && seriesData.ydisplayvalues !== '')
      yDispValsExist = true;
    var trClass = 'odd';
    var omitOther = false;
    if ('display_grid_xvalues' in seriesData)
      omitOther = true;
    if (seriesData.xvalues !== undefined && seriesData.xvalues.length) {
      createBasicDisplayGridHeader($gridTable, seriesData, chartData.report_properties.percents_from_count, hasStacking);
      var multipleOther = false;
      for (var j = 0; j < seriesData.xvalues.length; j++) {
        var value = seriesData.xvalues[j];
        if (value === otherKey && omitOther)
          if (j === seriesData.xvalues.length - 1)
            break;
        if (value === args.otherDisplay && j < seriesData.xvalues.length - 1)
          multipleOther = true;
        if (value === otherKey) {
          if (multipleOther)
            value = args.otherDisplay + ' ' + args.otherDisplayMore;
          else
            value = args.otherDisplay;
        }
        if (yDispValsExist)
          var yVal = seriesData.ydisplayvalues[j];
        else
          yVal = seriesData.yvalues[j];
        if (yVal) {
          var row = createRowForGrid(trClass, value, yVal, seriesData.percentages[j], hasStacking);
          if (trClass === 'odd')
            trClass = 'even';
          else
            trClass = 'odd';
          row.setAttribute('role', 'row');
          $gridTableBody.append(row);
        }
      }
      if ('display_grid_xvalues' in seriesData) {
        var additionalGridYDispValsExist = false;
        if ('display_grid_ydisplayvalues' in seriesData)
          additionalGridYDispValsExist = true;
        for (j = 0; j < seriesData.display_grid_xvalues.length; j++) {
          value = seriesData.display_grid_xvalues[j];
          yVal = null;
          if (additionalGridYDispValsExist)
            yVal = seriesData.display_grid_ydisplayvalues[j];
          else
            yVal = seriesData.display_grid_yvalues[j];
          if (yVal) {
            row = createRowForGrid(trClass, value, yVal, seriesData.display_grid_percents[j], hasStacking);
            if (trClass === 'odd')
              trClass = 'even';
            else
              trClass = 'odd';
            row.setAttribute('role', 'row');
            $gridTableBody.append(row);
          }
        }
      }
      if (hasStacking)
        createTwoLevelDisplayGridTable(chartData, args, $gridTableBody);
      displayGridTotal($gridTableBody, seriesData.display_grid_total, seriesData.total_label, hasStacking);
    }
  }
}

function addAccessibility($gridTable, chartData, args) {
  if (window.g_accessibility === 'true' || window.g_accessibility === true) {
    var $displayGridToggle = getGridExpandAnchor(args);
    var id = $gridTable.attr('id');
    if ($displayGridToggle.length)
      $displayGridToggle.remove();
    $displayGridToggle = jQuery('<a tabindex="0" id="expand.' + id + '" aria-expanded="false" role="button" class="grid-toggle" onclick="toggleDisplayGrid(\'' + id + '\', this)">' +
      '<img title="Click to expand chart data" src="images/section_hide.gifx" alt="Click to expand chart data" width="16px" />' +
      '</a>');
    $gridTable.before($displayGridToggle);
    if (args.display_grid) {
      $displayGridToggle.attr('aria-expanded', true);
      $displayGridToggle.children().attr('src', 'images/section_reveal.gifx');
    }
    $gridTable.prepend('<caption><b></b></caption>');
    $gridTable.find('caption b').text(chartData.series[0].display_grid_title);
  }
}

function createTwoLevelDisplayGridTable(chartData, args, $body) {
  var additionalGridValuesExist = false;
  var seriesData = chartData.series[0];
  var subSeriesData = chartData.series[0].sub_series;
  if (subSeriesData && subSeriesData[0]) {
    createSecondLevelHeader($body, seriesData, chartData.report_properties.percents_from_count);
    if ('display_grid_xvalues' in seriesData && 'dispGridSubSeries' in seriesData)
      additionalGridValuesExist = true;
    var isDuration = false;
    if (('yaxis_duration' in seriesData) && (seriesData.yaxis_duration))
      isDuration = true;
    createSecondLevelDisplayGrid(seriesData.xvalues, subSeriesData, isDuration, $body, args, additionalGridValuesExist);
    if (additionalGridValuesExist) {
      var dispGridSubSeries = chartData.series[0].dispGridSubSeries;
      createSecondLevelDisplayGrid(seriesData.display_grid_xvalues, dispGridSubSeries, isDuration, $body, args, additionalGridValuesExist);
    }
  }
}

function createSecondLevelDisplayGrid(xValues, subSeriesData, isDuration, $body, args, additionalGridValuesExist) {
  var otherKey = 'zzyynomatchaabb';
  var trClass = 'even';
  var multipleOther = false;
  for (var i = 0; i < subSeriesData.length; i++) {
    var firstLevelXVal = xValues[i];
    if (additionalGridValuesExist && firstLevelXVal === otherKey) {
      continue;
    }
    if (!additionalGridValuesExist) {
      if (firstLevelXVal === args.otherDisplay && i < xValues.length - 1)
        multipleOther = true;
      if (firstLevelXVal === otherKey) {
        if (multipleOther)
          firstLevelXVal = args.otherDisplay + ' ' + args.otherDisplayMore;
        else
          firstLevelXVal = args.otherDisplay;
      }
    }
    var curSubSeries = subSeriesData[i];
    if (curSubSeries) {
      var curSubSeriesHasYDispVals = false;
      if ('ydisplayvalues' in curSubSeries && curSubSeries.ydisplayvalues !== '')
        curSubSeriesHasYDispVals = true;
      for (var j = 0; j < curSubSeries.xvalues.length; j++) {
        var row = document.createElement('tr');
        row.className = trClass;
        var chartClass = 'chart';
        if (j === (curSubSeries.xvalues.length - 1))
          chartClass = 'chart-spacer';
        if (j === 0)
          row.appendChild(createDisplayGridHeaderCell('chart-spacer', firstLevelXVal, null, null, null, curSubSeries.xvalues.length));
        row.appendChild(createDisplayGridCell(chartClass, curSubSeries.xvalues[j]));
        if (curSubSeriesHasYDispVals)
          row.appendChild(createDisplayGridCell(chartClass, curSubSeries.ydisplayvalues[j], 'right'));
        else
          row.appendChild(createDisplayGridCell(chartClass, curSubSeries.yvalues[j], 'right'));
        row.appendChild(createDisplayGridCell(chartClass, curSubSeries.percentages[j] + '%', 'right'));
        if (trClass === 'odd')
          trClass = 'even';
        else
          trClass = 'odd';
        row.setAttribute('role', 'row');
        $body.append(row);
      }
    }
    trClass = 'even';
  }
}

function createBasicDisplayGridHeader($table, series, computePercent, hasStacking) {
  var $header = getGridTableHeader($table);
  var totals = '';
  var colSpan = 1;
  if (hasStacking) {
    totals = ' ' + series.totals_label;
    colSpan = 2;
  }
  $header.append(createDisplayGridHeaderCell('chart', series.group_by_label + totals, null, true, colSpan))
    .append(createDisplayGridHeaderCell('chart', series.yTitle + totals, 'right', true));
  var percentLabel = series.percentage_label + series.aggregate_label;
  if (computePercent || isPieType(series.series_plot_type))
    percentLabel = series.percentage_label + series.table_display_plural;
  $header.append(createDisplayGridHeaderCell('chart', percentLabel, 'right', true));
  series.completePercentLabel = percentLabel;
}

function createSecondLevelHeader($body, series) {
  var $secondHeader = jQuery('<tr class="header display_grid_header"/>');
  $body.append($secondHeader);
  $secondHeader.append(createDisplayGridHeaderCell('chart', series.group_by_label, null, true))
    .append(createDisplayGridHeaderCell('chart', series.second_group_by_label, null, true))
    .append(createDisplayGridHeaderCell('chart', series.yTitle, 'right', true))
    .append(createDisplayGridHeaderCell('chart', series.completePercentLabel, 'right', true));
}

function createBoxDisplayGrid($gridTable, chartData) {
  if (chartData.series.length > 0) {
    var $gridTableBody = getGridTableBody($gridTable);
    var seriesData = chartData.series[0];
    var trClass = 'odd';
    $header = getGridTableHeader($gridTable);
    $header.append(createDisplayGridHeaderCell('chart', seriesData.group_by_label, null, true))
      .append(createDisplayGridHeaderCell('chart', seriesData.mean_label, 'right', true))
      .append(createDisplayGridHeaderCell('chart', seriesData.minimum_label, 'right', true))
      .append(createDisplayGridHeaderCell('chart', seriesData.first_quartile_label, 'right', true))
      .append(createDisplayGridHeaderCell('chart', seriesData.median_label, 'right', true))
      .append(createDisplayGridHeaderCell('chart', seriesData.third_quartile_label, 'right', true))
      .append(createDisplayGridHeaderCell('chart', seriesData.maximum_label, 'right', true));
    for (var j = 0; j < seriesData.xvalues.length; j++) {
      var row = document.createElement('tr');
      row.className = trClass;
      var value = seriesData.xvalues[j];
      var style = 'chart';
      var groupByStyle = 'chart';
      row.appendChild(createDisplayGridHeaderCell(groupByStyle, value));
      row.appendChild(createDisplayGridCell(style, seriesData.ydisplayvalues[j], 'right'));
      var boxDisplayVals = seriesData.boxdisplayvalues[j];
      for (var k = 0; k < 5; k++)
        row.appendChild(createDisplayGridCell(style, boxDisplayVals[k], 'right'));
      if (trClass === 'odd')
        trClass = 'even';
      else
        trClass = 'odd';
      row.setAttribute('role', 'row');
      $gridTableBody.append(row);
    }
  }
}

function showControlDisplayGrid($gridTable, chartData) {
  var $gridTableBody = getGridTableBody($gridTable);
  var isDuration = false;
  if (chartData.series.length > 0) {
    var seriesData = chartData.series[0];
    if (('yaxis_duration' in seriesData) && (seriesData.yaxis_duration))
      isDuration = true;
    var $header = getGridTableHeader($gridTable);
    $header.append(createDisplayGridHeaderCell('chart', seriesData.group_by_label + ' ' + seriesData.per + ' ' + seriesData.trend, null, true))
      .append(createDisplayGridHeaderCell('chart', seriesData.aggregate_label + ' ' + seriesData.data_points_label, 'right', true))
      .append(createDisplayGridHeaderCell('chart', seriesData.aggregate_label + ' ' + seriesData.trend_line_label, 'right', true));
    var trClass = 'odd';
    for (var j = 0; j < seriesData.xvalues.length; j++) {
      row = document.createElement('tr');
      row.className = trClass;
      var style = 'chart';
      row.appendChild(createDisplayGridCell(style, seriesData.xvalues[j]));
      row.appendChild(createDisplayGridCell(style, seriesData.ydisplayvalues[j], 'right'));
      row.appendChild(createDisplayGridCell(style, isDuration === true ? seriesData.trenddisplayvalues[j] : seriesData.trendvalues[j], 'right'));
      row.setAttribute('role', 'row');
      $gridTableBody.append(row);
      if (trClass === 'odd')
        trClass = 'even';
      else
        trClass = 'odd';
    }
    var row = document.createElement('tr');
    row.className = 'header display_grid_header';
    row.appendChild(createDisplayGridHeaderCell(style, 'Control Values'));
    row.appendChild(createDisplayGridHeaderCell(style, seriesData.aggregate_label, 'right'));
    row.appendChild(createDisplayGridHeaderCell(style, ''));
    row.setAttribute('role', 'row');
    $gridTableBody.append(row);
    var standDev = seriesData.standard_deviation_label;
    row = document.createElement('tr');
    row.className = 'odd';
    row.appendChild(createDisplayGridCell(style, '-3 ' + standDev));
    row.appendChild(createDisplayGridCell(style, isDuration === true ? seriesData.controldisplayvalues[0] : seriesData.controlvalues[0], 'right'));
    row.appendChild(createDisplayGridCell(style, ''));
    row.setAttribute('role', 'row');
    $gridTableBody.append(row);
    row = document.createElement('tr');
    row.className = 'even';
    row.appendChild(createDisplayGridCell(style, '-2 ' + standDev));
    row.appendChild(createDisplayGridCell(style, isDuration == true ? seriesData.controldisplayvalues[1] : seriesData.controlvalues[1], 'right'));
    row.appendChild(createDisplayGridCell(style, ''));
    row.setAttribute('role', 'row');
    $gridTableBody.append(row);
    row = document.createElement('tr');
    row.className = 'odd';
    row.appendChild(createDisplayGridCell(style, seriesData.mean_label));
    row.appendChild(createDisplayGridCell(style, isDuration === true ? seriesData.controldisplayvalues[2] : seriesData.controlvalues[2], 'right'));
    row.appendChild(createDisplayGridCell(style, ''));
    row.setAttribute('role', 'row');
    $gridTableBody.append(row);
    row = document.createElement('tr');
    row.className = 'even';
    row.appendChild(createDisplayGridCell(style, '+2 ' + standDev));
    row.appendChild(createDisplayGridCell(style, isDuration === true ? seriesData.controldisplayvalues[3] : seriesData.controlvalues[3], 'right'));
    row.appendChild(createDisplayGridCell(style, ''));
    row.setAttribute('role', 'row');
    $gridTableBody.append(row);
    row = document.createElement('tr');
    row.className = 'odd';
    row.appendChild(createDisplayGridCell(style, '+3 ' + standDev));
    row.appendChild(createDisplayGridCell(style, isDuration === true ? seriesData.controldisplayvalues[4] : seriesData.controlvalues[4], 'right'));
    row.appendChild(createDisplayGridCell(style, ''));
    row.setAttribute('role', 'row');
    $gridTableBody.append(row);
  }
}

function createGaugeDisplayGrid($gridTable, chartData) {
  if (chartData.series.length) {
    var seriesData = chartData.series[0];
    var $gridTableBody = getGridTableBody($gridTable);
    var yDispValsExist;
    var $header = getGridTableHeader($gridTable);
    $header.append(createDisplayGridHeaderCell('chart', seriesData.yTitle, 'center', true));
    if ('ydisplayvalues' in seriesData && seriesData.ydisplayvalues !== '')
      yDispValsExist = true;
    var row = document.createElement('tr');
    row.className = 'odd';
    var style = 'chart';
    var value;
    if (yDispValsExist)
      value = seriesData.ydisplayvalues;
    else
      value = seriesData.yvalues;
    row.appendChild(createDisplayGridCell(style, value, 'center'));
    row.setAttribute('role', 'row');
    $gridTableBody.append(row);
  }
}

function displayGridTotal($body, total, totalLabel, hasStacking) {
  var $totalRow = jQuery('<tr class="display-grid-total-row" />');
  $totalRow.attr('role', 'row');
  $body.append($totalRow);
  var colSpan = 1;
  if (hasStacking)
    colSpan = 2;
  $totalRow.append(createDisplayGridHeaderCell('chart_total', totalLabel, null, null, colSpan))
    .append(createDisplayGridCell('chart_total', total, 'right'))
    .append(createDisplayGridCell('chart_total', '100%', 'right'));
}

function createRowForGrid(trClass, xVal, yVal, percent, hasStacking) {
  var row = document.createElement('tr');
  row.className = trClass;
  var style = 'chart';
  var groupByStyle = 'chart';
  var colSpan = 1;
  if (hasStacking) {
    xVal += ' Total';
    style = 'chart_subtotal';
    groupByStyle = 'chart_subtotal_text';
    colSpan = 2;
  }
  row.appendChild(createDisplayGridHeaderCell(groupByStyle, xVal, null, null, colSpan));
  row.appendChild(createDisplayGridCell(style, yVal, 'right'));
  if (percent && percent != '')
    row.appendChild(createDisplayGridCell(style, percent + '%', 'right'));
  else
    row.appendChild(createDisplayGridCell(style, 'N/A', 'right'));
  return row;
}

function createDisplayGridHeaderCell(cssClass, value, alignment, isHead, colSpan, rowSpan) {
  var gridCell = document.createElement('th');
  var role = 'rowheader';
  var scope = 'row';
  if (isHead) {
    role = 'columnheader';
    scope = 'col';
  }
  gridCell.setAttribute('role', role);
  gridCell.setAttribute('scope', scope);
  createDisplayGridCellCommon(gridCell, cssClass, value, alignment, colSpan, rowSpan);
  return gridCell;
}

function createDisplayGridCell(cssClass, value, alignment) {
  var gridCell = document.createElement('td');
  gridCell.setAttribute('role', 'gridcell');
  createDisplayGridCellCommon(gridCell, cssClass, value, alignment);
  return gridCell;
}

function createDisplayGridCellCommon(gridCell, cssClass, value, alignment, colSpan, rowSpan) {
  gridCell.className = cssClass;
  gridCell.style.textAlign = 'left';
  if (alignment)
    gridCell.style.textAlign = alignment;
  if (colSpan)
    gridCell.setAttribute('colspan', colSpan);
  if (rowSpan)
    gridCell.setAttribute('rowspan', rowSpan);
  gridCell.appendChild(document.createTextNode(value));
}

function isDisplayGridApplicable(chartType) {
  if (chartType === 'bar' || chartType === 'horizontal_bar' || isPieType(chartType) || chartType === 'line_bar' || chartType === 'line' || chartType === 'step_line' || chartType === 'area' || chartType === 'spline' || chartType === 'availability' || chartType === 'pareto' || chartType === 'trend' || chartType === 'map' || chartType === 'solid_gauge' ||
    chartType === 'angular_gauge')
    return true;
  return false;
}

function getGridTable(args) {
  return jQuery('#display-grid-table-' + args.report_uuid);
}

function getGridTableHeader($table) {
  return $table.find('.display_grid_header');
}

function getGridTableBody($table) {
  return $table.children('.display_grid_body');
}

function getGridExpandAnchor(args) {
  return jQuery('#expand\\.display_grid_table' + args.report_uuid);
}

function isTwoLevelDisplayGrid(args) {
  if ((args.stacked_field !== '' && isBarType(args.chart_type)))
    return true;
  if (args.group_by !== '' && (args.chart_type === 'trend' || args.chart_type === 'line' || args.chart_type === 'step_line' || args.chart_type === 'area' || args.chart_type === 'spline' || args.chart_type === 'line_bar'))
    return true;
  return false;
}

function toggleDisplayGrid(name, anchor) {
  var el = jQuery('#' + name);
  if (!el)
    return;
  var anchorEl = jQuery(anchor);
  if (anchorEl.attr('aria-expanded') === 'true') {
    el.hide();
    anchorEl.children().attr('src', 'images/section_hide.gifx');
    anchorEl.attr('aria-expanded', false);
  } else {
    el.show();
    anchorEl.children().attr('src', 'images/section_reveal.gifx');
    anchorEl.attr('aria-expanded', true);
  }
};
/*! RESOURCE: /scripts/reportcommon/additional_groupby.js */
function hasAdditionalGroupBy(type) {
  return !(type === 'hist' || type === 'pivot' || type === 'heatmap' || type === 'pivot_v2' || type === 'calendar' || type === 'control' || type === 'availability' || type === 'angular_gauge' || type === 'solid_gauge' || type === 'gauge' || type === 'single_score' || type === 'map');
}

function checkAndEnableInteractiveFilters(chartData, args) {
  var isMultiSeries = false;
  if ('report_properties' in chartData)
    isMultiSeries = chartData.series.length > 1;
  var $interactiveContainer = jQuery('#interactive-container-' + args.report_uuid);
  var msgIntoAdditionalGroupByPopup = document.getElementById('msg_additional_group_by');
  if (isMultiSeries) {
    if ($interactiveContainer.length)
      $interactiveContainer.hide();
    if (msgIntoAdditionalGroupByPopup)
      msgIntoAdditionalGroupByPopup.show();
  } else {
    if (msgIntoAdditionalGroupByPopup)
      msgIntoAdditionalGroupByPopup.hide();
    if ($interactiveContainer.length)
      constructInteractiveFilters(chartData.series[0].additional_groupby, args, $interactiveContainer);
  }
}

function constructInteractiveFilters(additionalGroupBy, args, $interactiveContainer) {
  var $stackBySelect;
  $interactiveContainer.append(
    '<div class="additional-groupby-label">' +
    '<label for="additional-groupby-' + args.report_uuid + '" id="additional-groupby-label" title="' + window.chartHelpers.i18n.groupByTitle + '">' +
    window.chartHelpers.i18n.groupBy +
    '</label>' +
    '</div>');
  var $groupByContainer = jQuery('<div class="additional-groupby-select"/>');
  $interactiveContainer.append($groupByContainer);
  var $groupBySelect = jQuery('<select id="additional-groupby-' + args.report_uuid + '" name="additional-groupby" class="interactive"/>');
  createAdditionalOptions($groupBySelect, additionalGroupBy.list, additionalGroupBy.original_group_by, additionalGroupBy.original_stack_by, args.group_by, hasNone(args.chart_type));
  if (isBarType(args.chart_type)) {
    var originalGroupBy = additionalGroupBy.original_group_by_can_be_stacked ? additionalGroupBy.original_group_by : null;
    $stackBySelect = jQuery('<select id="additional-stackby-' + args.report_uuid + '" name="additional-stackby" class="interactive"/>');
    createAdditionalOptions($stackBySelect, additionalGroupBy.stackby_list, additionalGroupBy.original_stack_by, originalGroupBy, args.stacked_field, true);
  }
  $groupBySelect.change(function groupBySelectChangeCallback() {
    applyExecutiveReport(args.report_id, $groupBySelect, $stackBySelect, JSON.parse(args.chart_params).interactive_filter);
  });
  $groupByContainer.append($groupBySelect);
  if ($stackBySelect) {
    $interactiveContainer.append(
      '<div class="additional-stackby-label">' +
      '<label for="additional-stackby-' + args.report_uuid + '" id="additional-stackby-label" title="' + window.chartHelpers.i18n.stackByTitle + '">' +
      window.chartHelpers.i18n.stackBy +
      '</label>' +
      '</div>');
    var $stackByContainer = jQuery('<div class="additional-groupby-select"/>');
    $interactiveContainer.append($stackByContainer);
    $stackBySelect.change(function stackBySelectChangeCallback() {
      applyExecutiveReport(args.report_id, $groupBySelect, $stackBySelect, JSON.parse(args.chart_params).interactive_filter);
    });
    $stackByContainer.append($stackBySelect);
  }
}

function createAdditionalOptions($select, choices, originalGrouping, otherGrouping, selectedValue, hasNoneOption) {
  var option;
  if (hasNoneOption) {
    option = new Option(window.chartHelpers.i18n.none, '');
    $select.append(jQuery(option));
  }
  if (originalGrouping) {
    option = new Option(originalGrouping.label, originalGrouping.value);
    $select.append(jQuery(option));
  }
  for (var i = 0; i < choices.length; ++i) {
    option = new Option(choices[i].label, choices[i].value);
    $select.append(jQuery(option));
  }
  if (otherGrouping && !$select.children('option[value=\'' + otherGrouping.value + '\']').length) {
    option = new Option(otherGrouping.label, otherGrouping.value);
    $select.append(jQuery(option));
  }
  if (selectedValue === 'variables')
    $select.val($select.children()[0].value);
  else
    $select.val(selectedValue);
}

function hasNone(type) {
  return type === 'list' || type === 'bubble' || type === 'trend' || type === 'line' || type === 'step_line' || type === 'line_bar' || type === 'area' || type === 'spline';
};
/*! RESOURCE: /scripts/reportcommon/buildhcoptions.js */
function hc_configureChartProportions(chartType, chartData, hcOptions, isGauge, isUI) {
  hc_configureLegendAlignment(chartType, chartData.report_properties, hcOptions, isGauge, isUI);
  if (hc_isSlowMetricChart(hcOptions, chartData.series[0])) {
    hcOptions.plotOptions.column = {};
    var closestPointRange = hc_differenceOfClosestStringDateTimesInSeries(chartData.series[0].xvalues);
    if (closestPointRange !== 0)
      hcOptions.plotOptions.column.pointRange = closestPointRange;
  }
}

function hc_configureLegendAlignment(chartType, reportProperties, hcOptions, isGauge, isUI) {
  var legendVerticalAlign = reportProperties.legend_vertical_alignment;
  var legendHorizontalAlign = reportProperties.legend_horizontal_alignment;
  var legendItemsLeftAlign = reportProperties.legend_items_left_align;
  var hasLegend = hcOptions.legend.enabled;
  var titleVerticalAlign = reportProperties.title_vertical_alignment;
  var showChartTitle = !reportProperties.custom_chart_title_position && (reportProperties.show_chart_title === 'always' || (!isGauge && reportProperties.show_chart_title === 'report'));
  var titleSize = Number(reportProperties.chart_title_size);
  var chartWidth = Number(hcOptions.chart.width);
  var chartHeight = Number(hcOptions.chart.height);
  if (hasLegend) {
    if (legendHorizontalAlign === "right") {
      if (legendVerticalAlign === "top") {
        hcOptions.legend.y = 25;
      } else if (legendVerticalAlign === "bottom") {
        hcOptions.legend.maxHeight = chartHeight - 70;
      } else if (legendVerticalAlign === "middle") {
        hcOptions.legend.maxHeight = chartHeight - 100;
      }
    } else if (legendHorizontalAlign === "center") {
      if (legendItemsLeftAlign || chartType === 'heatmap' || chartType === 'map')
        hcOptions.legend.width = chartWidth - 20;
      if (isUI)
        hcOptions.legend.maxHeight = chartHeight / 6;
      if (chartType === 'heatmap' || chartType === 'map') {
        hcOptions.legend.symbolWidth = hcOptions.legend.width - 10;
        hcOptions.legend.maxHeight = '';
      }
      if (legendVerticalAlign === "top") {
        hcOptions.legend.y = -2;
        if (showChartTitle && titleVerticalAlign === "top")
          hcOptions.legend.y = titleSize + 10;
      }
    }
    if (legendVerticalAlign === "bottom" && showChartTitle && titleVerticalAlign === "bottom") {
      hcOptions.legend.y = 0 - (titleSize + 10);
    }
  }
  if ((!hasLegend || (legendHorizontalAlign !== "center" || legendVerticalAlign !== "bottom")) &&
    showChartTitle && titleVerticalAlign === "bottom" && chartType !== "solid_gauge") {
    if (chartType === 'pie' || chartType === 'donut' || chartType === 'semi_donut' || chartType === "angular_gauge")
      hcOptions.chart.marginBottom = titleSize;
    else if (chartType === "funnel" || chartType === "pyramid")
      hcOptions.chart.marginBottom = titleSize + 40;
    else
      hcOptions.chart.marginBottom = titleSize + 75;
  }
}

function hc_setLegendLabelFormatter(hcOptions, isUI, isPercent) {
  var isCentered = (hcOptions.legend.align === 'center');
  if (isUI) {
    if (isCentered && isPercent) {
      hcOptions.legend.labelFormatter = hc_legendLabelPercentFormatter;
    } else if (!isCentered) {
      if (isPercent) {
        hcOptions.legend.labelFormatter = hc_legendLabelShortenedPercentFormatter;
      } else {
        hcOptions.legend.labelFormatter = hc_legendLabelShortenedFormatter;
      }
    }
  } else {
    if (isCentered) {
      if (isPercent) {
        hcOptions.legend.labelFormatter = 'hc_legendLabelPercentFormatter';
      }
    } else {
      if (isPercent) {
        hcOptions.legend.labelFormatter = 'hc_legendLabelShortenedPercentFormatter';
      } else {
        hcOptions.legend.labelFormatter = 'hc_legendLabelShortenedFormatter';
      }
    }
  }
}

function hc_generateChartOptions(chartType, chartData, aggType, stackedField, chartHeight, chartWidth, chartSize, isRtl) {
  var hcOptions = {};
  var chartProps = hc_initDefaultChartOptions(hcOptions, chartData, chartType, chartSize, false, false, '', aggType, stackedField, false, chartHeight, chartWidth, isRtl);
  hc_sanitizeXValues(chartData, chartProps);
  hc_setLegendLabelFormatter(hcOptions, false, false);
  if (chartType == 'bubble') {
    hcOptions.series = hc_createBubbleSeriesData(chartData, chartProps, true);
    hcOptions.xAxis = chartData.series[0].xAxis;
    hcOptions.yAxis = chartData.series[0].yAxis;
    hc_addBubbleChartOptions(hcOptions, true, chartData.series[0].legend.enabled);
  } else if (chartType == 'heatmap') {
    var curSeries = hc_createHeatmapSeriesData(chartData, chartProps, true);
    hcOptions.series.push(curSeries);
    hc_addHeatmapChartOptions(hcOptions, chartProps, true, chartData, curSeries);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, true);
    hc_addHeatmapAxisCategories(hcOptions, chartData);
  } else if (chartType == 'pie' || chartType == 'semi_donut' || chartType == 'donut') {
    hc_addPieChartOptions(hcOptions, chartProps, false, chartType == 'semi_donut');
    var curSeries = hc_createSingleSeriesData(hcOptions, chartData, chartProps, false);
    if (chartType == 'semi_donut' || chartType == 'donut') {
      curSeries.innerSize = (100 - chartProps.report_properties.donut_width_percent) + "%";
      if (chartProps.report_properties.show_chart_total)
        hc_addTotal(hcOptions, chartProps, curSeries, chartData);
    }
    hcOptions.series.push(curSeries);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'funnel') {
    hc_addFunnelChartOptions(hcOptions, chartProps, false, chartData);
    var curSeries = hc_createSingleSeriesData(hcOptions, chartData, chartProps, false);
    hcOptions.series.push(curSeries);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'pyramid') {
    hc_addPyramidChartOptions(hcOptions, chartProps, false, chartData);
    var curSeries = hc_createSingleSeriesData(hcOptions, chartData, chartProps, false);
    hcOptions.series.push(curSeries);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == "angular_gauge" || chartType == "solid_gauge") {
    hc_addGaugeChartOptions(hcOptions, chartProps, chartData, hc_getHighChartsType(chartType), false);
    var curSeries = hc_createSingleSeriesData(hcOptions, chartData, chartProps, false);
    hcOptions.series.push(curSeries);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'bar' || chartType == 'horizontal_bar') {
    if (stackedField == '')
      hc_addBarChartOptions(hcOptions, chartProps, chartData, hc_getHighChartsType(chartType), false);
    else
      hc_addStackedBarChartOptions(hcOptions, chartProps, chartData, hc_getHighChartsType(chartType), false);
    var series;
    series = hc_createMultipleSeriesData(hcOptions, chartData, chartProps, false);
    hcOptions.series = series;
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'hist') {
    hc_addHistogramOptions(hcOptions, chartProps, chartData, false);
    var curSeries = hc_createSingleSeriesData(hcOptions, chartData, chartProps, false);
    hcOptions.series.push(curSeries);
  } else if (chartType == 'pareto') {
    hc_addBarChartOptions(hcOptions, chartProps, chartData, 'column', false);
    var series0 = hc_createSingleSeriesData(hcOptions, chartData, chartProps, false);
    hcOptions.series.push(series0);
    var cumulative_series = hc_createParetoCumulSeries(hcOptions, chartProps, series0, false);
    hcOptions.series.push(cumulative_series);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'control') {
    hc_addControlChartOptions(hcOptions, chartProps, chartData, false);
    hcOptions.series = hc_createControlSeriesData(hcOptions, chartData, chartProps, false);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'box' || chartType == 'tbox') {
    hc_addBoxChartOptions(hcOptions, chartProps, chartData, false);
    var boxSeries = hc_createBoxPlotData(hcOptions, chartData, chartProps, false);
    hcOptions.series.push(boxSeries);
    var meanSeries = hc_createBoxMeanData(hcOptions, chartData, chartProps, false);
    hcOptions.series.push(meanSeries);
  } else if (chartType == 'trend') {
    var curSeries;
    if ('sub_series' in chartData.series[0]) {
      hc_addStackedBarChartOptions(hcOptions, chartProps, chartData, hc_getHighChartsType(chartType), false);
      hcOptions.series = hc_createMultipleSeriesData(hcOptions, chartData, chartProps, false);
    } else {
      hc_addBarChartOptions(hcOptions, chartProps, chartData, hc_getHighChartsType(chartType), false);
      curSeries = hc_createSingleSeriesData(hcOptions, chartData, chartProps, false);
      hcOptions.series.push(curSeries);
    }
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (isLineType(chartType) || chartType == 'availability') {
    if (chartType == 'availability')
      hc_addAvailChartOptions(hcOptions, chartProps, chartData, false);
    else
      hc_addLineChartOptions(hcOptions, chartProps, chartData, false, chartType);
    hcOptions.series = hc_createLineSeriesData(hcOptions, chartData, chartProps, false);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'map') {
    hc_addMapChartOptions(hcOptions, chartProps, false, chartData);
    var curSeries = hc_createMapSeriesData(hcOptions, chartData, chartProps, true);
    hcOptions.series = curSeries;
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, true);
    hc_updateDataLabelOptionsGeographical(hcOptions, chartData, chartType);
    hc_updateMapVisualizationOptions(hcOptions, chartData, chartProps);
  }
  hc_configureChartProportions(chartType, chartData, hcOptions, false, false);
  return hcOptions;
}

function hc_updateMapVisualizationOptions(hcOptions, chartData, chartProps) {
  var chartSerieProps;
  if (chartData.report_properties_series == undefined)
    chartSerieProps = chartProps;
  else
    chartSerieProps = chartData.report_properties_series[0];
  var mapVisualizationProperties = {}
  if ('report_drilldown' in chartSerieProps)
    mapVisualizationProperties.report_drilldown = chartSerieProps.report_drilldown;
  if ('report_id' in chartSerieProps)
    mapVisualizationProperties.report_id = chartSerieProps.report_id;
  if ('report_drilldown_zoom' in chartSerieProps)
    mapVisualizationProperties.report_drilldown_zoom = chartSerieProps.report_drilldown_zoom;
  if ('report_drilldown_map' in chartSerieProps)
    mapVisualizationProperties.report_drilldown_map = chartSerieProps.report_drilldown_map;
  if ('sysparm_full_query' in chartSerieProps)
    mapVisualizationProperties.full_query = chartSerieProps.sysparm_full_query;
  mapVisualizationProperties.show_data_label = chartSerieProps.show_chart_data_label;
  mapVisualizationProperties.show_geographical_label = chartSerieProps.show_geographical_label;
  hcOptions.mapVisualization = mapVisualizationProperties;
}

function isLineType(type) {
  return (type == 'line' || type == 'area' || type == 'spline' || type == 'line_bar' || type == 'step_line');
}

function hc_getHighChartsType(snType, lineType) {
  if (snType == 'bar' || snType == 'trend')
    return 'column';
  else if (snType == 'horizontal_bar')
    return 'bar';
  else if (snType == 'pie')
    return 'pie';
  else if (snType == 'semi_donut')
    return 'pie';
  else if (snType == 'donut')
    return 'pie';
  else if (snType == 'funnel')
    return 'funnel';
  else if (snType == 'pyramid')
    return 'funnel';
  else if (snType == 'box')
    return 'boxplot';
  else if (snType == 'spline')
    return 'spline';
  else if (snType == 'area')
    return 'area';
  else if (snType == 'line_bar')
    return 'column';
  else if (snType == 'line' || snType == 'step_line')
    return 'line';
  else if (snType == 'heatmap')
    return 'heatmap';
  else if (snType == 'angular_gauge')
    return 'gauge';
  else if (snType == 'solid_gauge')
    return 'solidgauge'
  else if (snType == 'bubble')
    return 'bubble'
  else if (snType == 'map')
    return 'map'
  else
    return '';
}

function hc_setupChartProperties(hcOptions, chartData, chartType, chartSize, isGauge, isPub, aggType, stackedField) {
  var chartProps = {};
  chartProps.defaultFontFamily = 'Arial';
  chartProps.fontSize = '10pt';
  chartProps.otherDisplay = 'Other';
  chartProps.otherDisplayMore = '(more...)';
  chartProps.report_properties = {};
  if ('report_properties' in chartData) {
    chartProps.report_properties = chartData.report_properties;
    if ('font_family' in chartProps.report_properties && chartProps.report_properties.font_family != '')
      chartProps.defaultFontFamily = chartProps.report_properties.font_family;
    if ('font_size' in chartProps.report_properties && chartProps.report_properties.font_size != '')
      chartProps.fontSize = chartProps.report_properties.font_size;
    chartProps.otherDisplay = chartProps.report_properties.other_display;
    chartProps.otherDisplayMore = chartProps.report_properties.other_display_more;
  }
  chartProps.isGauge = isGauge;
  chartProps.isPub = isPub;
  chartProps.origXValues = [];
  chartProps.xValues = [];
  chartProps.maxAllowedLabelLen = 20;
  chartProps.grayColor = '#666666';
  chartProps.blackColor = '#000';
  chartProps.aggType = aggType;
  chartProps.stackedField = stackedField;
  chartProps.otherKey = 'zzyynomatchaabb';
  chartProps.chartType = chartType;
  chartProps.chartSize = chartSize;
  chartProps.titleMargin = 50;
  return chartProps;
}

function hc_sanitizeXValues(chartData, chartProps) {
  if (!chartData.series || !chartData.series[0].xvalues)
    return;
  chartProps.origXValues = chartData.series[0].xvalues;
  if ('truncate_x_axis_labels' in chartProps.report_properties && chartProps.report_properties.truncate_x_axis_labels) {
    var removeLeading = false;
    if ('xaxis_labels_remove_leading' in chartProps.report_properties && chartProps.report_properties.xaxis_labels_remove_leading)
      removeLeading = true;
    for (var i = 0; i < chartProps.origXValues.length; i++) {
      if (chartProps.origXValues[i].length > chartProps.maxAllowedLabelLen) {
        if (removeLeading)
          chartProps.xValues.push('...' + chartProps.origXValues[i].substring(chartProps.origXValues[i].length - chartProps.maxAllowedLabelLen + 3));
        else
          chartProps.xValues.push(chartProps.origXValues[i].substring(0, chartProps.maxAllowedLabelLen - 3) + '...');
      } else
        chartProps.xValues.push(chartProps.origXValues[i]);
    }
  } else {
    for (var i = 0; i < chartProps.origXValues.length; i++)
      chartProps.xValues.push(chartProps.origXValues[i]);
  }
  var indx = hc_isPresentInArray(chartProps.origXValues, chartProps.otherKey);
  if (indx >= 0) {
    var indx2 = hc_isPresentInArray(chartProps.origXValues, chartProps.otherDisplay);
    if (indx2 >= 0)
      chartProps.xValues[indx] = chartProps.otherDisplay + ' ' + chartProps.otherDisplayMore;
    else
      chartProps.xValues[indx] = chartProps.otherDisplay;
  }
}

function hc_sanitizeCategoryValues(hcOptions, chartProps) {
  if (hcOptions.xAxis.categories)
    hcOptions.xAxis.categories = hc_sanitizeAxisCategoriesValues(hcOptions.xAxis.categories, chartProps);
  if (hcOptions.yAxis[0].categories)
    hcOptions.yAxis[0].categories = hc_sanitizeAxisCategoriesValues(hcOptions.yAxis[0].categories, chartProps);
}

function hc_sanitizeAxisCategoriesValues(categories, chartProps) {
  if (!categories)
    return;
  var newValues = [];
  var origValues = categories;
  if ('truncate_x_axis_labels' in chartProps.report_properties && chartProps.report_properties.truncate_x_axis_labels) {
    var removeLeading = false;
    if ('xaxis_labels_remove_leading' in chartProps.report_properties && chartProps.report_properties.xaxis_labels_remove_leading)
      removeLeading = true;
    for (var i = 0; i < origValues.length; i++) {
      if (origValues[i].length > chartProps.maxAllowedLabelLen) {
        if (removeLeading)
          newValues.push('...' + origValues[i].substring(origValues[i].length - chartProps.maxAllowedLabelLen + 3));
        else
          newValues.push(origValues[i].substring(0, chartProps.maxAllowedLabelLen - 3) + '...');
      } else
        newValues.push(origValues[i]);
    }
  } else {
    for (var i = 0; i < origValues.length; i++)
      newValues.push(origValues[i]);
  }
  var indx = hc_isPresentInArray(origValues, chartProps.otherKey);
  if (indx >= 0) {
    var indx2 = hc_isPresentInArray(origValues, chartProps.otherDisplay);
    if (indx2 >= 0)
      newValues[indx] = chartProps.otherDisplay + ' ' + chartProps.otherDisplayMore;
    else
      newValues[indx] = chartProps.otherDisplay;
  }
  return newValues;
}

function hc_initDefaultChartOptions(hcOptions, chartData, chartType, chartSize, isGauge, isPub, containerId, aggType, stackedField, isUI, chartHeight, chartWidth, isRtl) {
  hcOptions.chart = {};
  if (containerId != '') {
    hcOptions.chart.renderTo = containerId;
  }
  if (!isUI) {
    hcOptions.chart.height = chartHeight;
    hcOptions.chart.width = chartWidth;
  } else {
    var isCustomChartSize = chartData.report_properties && chartData.report_properties.custom_chart_size;
    hc_setHeightWidthChart(hcOptions, chartData, chartSize, isGauge, containerId, isCustomChartSize, chartHeight, chartWidth);
  }
  hcOptions.lang = hcOptions.lang || {};
  hcOptions.lang.noData = chartData.noDataToDisplayMsg;
  hc_setI18nTranslations(hcOptions, chartData.report_properties.translation);
  hcOptions.credits = {};
  hcOptions.credits.enabled = false;
  hcOptions.legend = {};
  var isMultiSeries = chartData.series.length > 1;
  if (!isMultiSeries && (chartType == 'bar' || chartType == 'horizontal_bar') && (stackedField === '') || chartType === 'angular_gauge' ||
    chartType === 'solid_gauge' || chartType === 'box' || chartType === 'tbox' || chartType === 'hist' || chartType === 'pareto')
    hcOptions.legend.enabled = false;
  else
    hcOptions.legend.enabled = chartData.report_properties.show_legend;
  hcOptions.legend.verticalAlign = chartData.report_properties.legend_vertical_alignment;
  hcOptions.legend.align = chartData.report_properties.legend_horizontal_alignment;
  if (hcOptions.legend.align === 'left' || hcOptions.legend.align === 'right') {
    hcOptions.legend.layout = 'vertical';
  }
  hcOptions.legend.itemStyle = {};
  hcOptions.legend.itemStyle.fontFamily = 'Arial';
  hcOptions.legend.backgroundColor = chartData.report_properties.legend_background_color_value;
  if (chartData.report_properties.show_legend_border === true) {
    hcOptions.legend.borderWidth = chartData.report_properties.legend_border_width;
    hcOptions.legend.borderRadius = chartData.report_properties.legend_border_radius;
    hcOptions.legend.borderColor = chartData.report_properties.legend_border_color_value;
  }
  hcOptions.tooltip = {};
  hcOptions.tooltip.style = {};
  hcOptions.tooltip.style.fontFamily = 'Arial';
  hcOptions.tooltip.style.fontSize = '10pt';
  if (isRtl) {
    hcOptions.tooltip.useHTML = true;
    hcOptions.legend.useHTML = true;
  }
  hcOptions.title = {};
  if (!chartData.report_properties.custom_chart_title_position) {
    if (chartData.report_properties.title_vertical_alignment !== 'top')
      hcOptions.title.verticalAlign = chartData.report_properties.title_vertical_alignment;
    if (hcOptions.title.verticalAlign === 'bottom')
      hcOptions.title.y = 0;
    hcOptions.title.align = chartData.report_properties.title_horizontal_alignment;
    if (hcOptions.title.align === 'right' && chartData.report_properties.title_vertical_alignment === 'top')
      hcOptions.title.x = -40;
  } else {
    hcOptions.title.x = chartData.report_properties.chart_title_x_position;
    hcOptions.title.y = chartData.report_properties.chart_title_y_position;
  }
  hcOptions.title.style = {};
  hcOptions.title.style.color = chartData.report_properties.chart_title_color_value;
  hcOptions.title.style.fontFamily = 'Arial';
  hcOptions.title.style.fontSize = chartData.report_properties.chart_title_size + 'px';
  if ('report_properties' in chartData) {
    if ('font_family' in chartData.report_properties && chartData.report_properties.font_family != '') {
      hcOptions.legend.itemStyle.fontFamily = chartData.report_properties.font_family;
      hcOptions.title.style.fontFamily = chartData.report_properties.font_family;
      hcOptions.tooltip.style.fontFamily = chartData.report_properties.font_family;
    }
    if ('font_size' in chartData.report_properties && chartData.report_properties.font_size != '') {
      hcOptions.tooltip.style.fontSize = chartData.report_properties.font_size;
    }
  }
  hcOptions.chart.backgroundColor = chartData.report_properties.chart_background_color_value;
  if (chartData.report_properties.show_chart_border === true) {
    hcOptions.chart.borderWidth = chartData.report_properties.chart_border_width;
    hcOptions.chart.borderRadius = chartData.report_properties.chart_border_radius;
    hcOptions.chart.borderColor = chartData.report_properties.chart_border_color_value;
  }
  hcOptions.chart.style = {};
  hcOptions.chart.style.margin = "0 auto";
  if (chartData.report_properties.show_chart_title === 'always' || (!isGauge && chartData.report_properties.show_chart_title === 'report')) {
    var title = chartData.title;
    if (chartData.report_properties.chart_title)
      title = chartData.report_properties.chart_title;
    if (isUI)
      title = title ? title.escapeHTML() : '';
    hcOptions.title.text = title;
  } else {
    hcOptions.title = {};
    hcOptions.title.text = '';
  }
  hcOptions.series = [];
  return hc_setupChartProperties(hcOptions, chartData, chartType, chartSize, isGauge, isPub, aggType, stackedField);
}

function hc_setHeightWidthChart(hcOptions, chartData, chartSize, isGauge, containerId, customChartSize, chartHeight, chartWidth) {
  var containerDimensions = {};
  var ie_dynamic_sizing;
  if (typeof chartData !== 'undefined' && chartData.report_properties)
    ie_dynamic_sizing = chartData.report_properties.ie_dynamic_sizing;
  if ((window.SNC && window.SNC.canvas) || !isGauge || !(window.isMSIE || window.isMSIE11) || ie_dynamic_sizing)
    containerDimensions = hc_getDimensions(containerId);
  if (containerDimensions.height && containerDimensions.height > 50)
    hcOptions.chart.height = containerDimensions.height;
  else if (chartHeight != undefined && chartHeight != '' && customChartSize)
    hcOptions.chart.height = chartHeight;
  else {
    hcOptions.chart.height = '375';
    if (chartSize == 'large')
      hcOptions.chart.height = '550';
    else if (chartSize == 'medium')
      hcOptions.chart.height = '450';
  }
  if (containerDimensions.width)
    hcOptions.chart.width = containerDimensions.width;
  else if (chartWidth != undefined && chartWidth != '' && customChartSize)
    hcOptions.chart.width = chartWidth;
  else {
    hcOptions.chart.width = '450';
    if (chartSize == 'large')
      hcOptions.chart.width = '750';
    else if (chartSize == 'medium')
      hcOptions.chart.width = '600';
  }
}

function hc_setI18nTranslations(hcOptions, i18n) {
  var lang = hcOptions.lang;
  lang.months = [i18n.month.january, i18n.month.february, i18n.month.march, i18n.month.april, i18n.month.may, i18n.month.june, i18n.month.july, i18n.month.august, i18n.month.september, i18n.month.october, i18n.month.november, i18n.month.december];
  lang.weekdays = [i18n.weekdays.sunday, i18n.weekdays.monday, i18n.weekdays.tuesday, i18n.weekdays.wednesday, i18n.weekdays.thursday, i18n.weekdays.friday, i18n.weekdays.saturday];
  lang.shortMonths = [i18n.month.shortName.january, i18n.month.shortName.february, i18n.month.shortName.march, i18n.month.shortName.april, i18n.month.shortName.may, i18n.month.shortName.june, i18n.month.shortName.july, i18n.month.shortName.august, i18n.month.shortName.september, i18n.month.shortName.october, i18n.month.shortName.november, i18n.month.shortName.december];
  lang.exportButtonTitle = i18n.exportButtonTitle;
  lang.printButtonTitle = i18n.printButtonTitle;
  lang.rangeSelectorFrom = i18n.rangeSelectorFrom;
  lang.rangeSelectorTo = i18n.rangeSelectorTo;
  lang.rangeSelectorZoom = i18n.rangeSelectorZoom;
  lang.downloadPNG = i18n.downloadPNG;
  lang.downloadJPEG = i18n.downloadJPEG;
  lang.downloadPDF = i18n.downloadPDF;
  lang.downloadSVG = i18n.downloadSVG;
  lang.printChart = i18n.printChart;
  lang.resetZoom = i18n.resetZoom;
  lang.resetZoomTitle = i18n.resetZoomTitle;
  lang.thousandsSep = i18n.thousandsSep;
  lang.decimalPoint = i18n.decimalPoint;
  lang.contextButtonTitle = i18n.contextButtonTitle;
  lang.days = i18n.days;
  lang.hours = i18n.hours;
  lang.minutes = i18n.minutes;
  lang.seconds = i18n.seconds;
}

function hc_getDimensions(containerId, isResize) {
  var containerHeight, containerWidth;
  var mustSubtractChildren = false;
  var isInCanvas = window.SNC && SNC.canvas && SNC.canvas.canvasUtils && SNC.canvas.isGridCanvasActive;
  var $container = jQuery("#" + containerId);
  var $parent = isInCanvas && containerId.indexOf("preview") == -1 ? $container.closest('.grid-widget-content') : $container.parent().parent();
  if ($parent.is("rendered_body"))
    $parent = $parent.parent();
  if (!isResize && $container.height() > 25)
    containerHeight = $container.height();
  else {
    containerHeight = $parent.height();
    mustSubtractChildren = true;
  }
  if (!isResize && $container.width() !== 0)
    containerWidth = $container.width();
  else {
    containerWidth = $parent.width();
  }
  if (mustSubtractChildren) {
    if (window.g_accessibility === "true" || window.g_accessibility === true)
      containerHeight -= 22;
    var children = $container.siblings();
    for (var i = 0; i < children.length; i++) {
      if (children[i].className.indexOf('gauge-size-handle') > -1 || children[i].className.indexOf('timingDiv') > -1)
        containerHeight -= children[i].offsetHeight;
    }
  }
  return {
    height: containerHeight,
    width: containerWidth
  };
}

function hc_saveChart(inputType, outputType, inputData) {
  var ONE_MB = 1048576;
  if (inputData.length > ONE_MB) {
    var errDlg = new GlideDialogWindow('glide_alert_standard');
    errDlg.setTitle(new GwtMessage().getMessage('Error'));
    errDlg.setPreference('warning', true);
    errDlg.setPreference('title', new GwtMessage().getMessage('Chart data too large to be saved'));
    errDlg.setPreference('invokePromptCallBack', function() {
      this.destroy();
    });
    errDlg.render();
    return;
  }
  var dialog = new GwtPollDialog(inputType, inputData, 0, '', outputType);
  dialog.execute();
}

function hc_addHeatmapChartOptions(hcOptions, chartProps, isUI, chartData, curSeries) {
  hcOptions.plotOptions = {};
  hcOptions.plotOptions.heatmap = {};
  hcOptions.plotOptions.heatmap.cursor = 'pointer';
  if (chartData.report_properties.use_color_heatmap === true) {
    hcOptions.colorAxis = {};
    hcOptions.colorAxis.min = chartData.series[0].min_value;
    hcOptions.colorAxis.max = chartData.series[0].max_value;
    hcOptions.colorAxis.minColor = chartData.report_properties.axis_min_color;
    hcOptions.colorAxis.maxColor = chartData.report_properties.axis_max_color;
  } else {
    hcOptions.legend.enabled = false;
  }
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatHeatmapTooltip;
    hcOptions.plotOptions.heatmap.point = {};
    hcOptions.plotOptions.heatmap.point.events = {};
    hcOptions.plotOptions.heatmap.point.events.click = hc_dataPointClicked;
  }
}

function hc_addMapChartOptions(hcOptions, chartProps, isUI, chartData) {
  hcOptions.mapNavigation = {};
  hcOptions.mapNavigation.enabled = true;
  hcOptions.mapNavigation.enableMouseWheelZoom = false;
  hcOptions.plotOptions = {};
  var useLatLon = chartData.report_properties_series[0].map_source.use_lat_lon;
  if (!useLatLon && chartData.report_properties.use_color_heatmap === true) {
    hcOptions.colorAxis = {};
    hcOptions.colorAxis.min = parseInt(chartData.series[0].ymin);
    hcOptions.colorAxis.max = parseInt(chartData.series[0].ymax);
    hcOptions.colorAxis.minColor = chartData.report_properties.axis_min_color;
    hcOptions.colorAxis.maxColor = chartData.report_properties.axis_max_color;
  } else
    hcOptions.legend.enabled = false;
  if (isUI) {
    hcOptions.title.align = chartData.report_properties.title_horizontal_alignment;
    if (hcOptions.title.align === 'right' && chartData.report_properties.title_vertical_alignment === 'top')
      hcOptions.title.x = -80;
    var hasLegend = hcOptions.legend.enabled;
    var legendHorizontalAlign = chartData.report_properties.legend_horizontal_alignment;
    if (hasLegend) {
      if (legendHorizontalAlign === "left") {
        if (!hcOptions.mapNavigation.buttonOptions)
          hcOptions.mapNavigation.buttonOptions = {};
        hcOptions.mapNavigation.buttonOptions.x = 70;
        hcOptions.mapNavigation.buttonOptions.y = -30;
      }
    }
    hcOptions.tooltip.formatter = hc_formatMapTooltip;
    hcOptions.plotOptions.series = {};
    hcOptions.plotOptions.series.point = {};
    hcOptions.plotOptions.series.point.events = {};
    hcOptions.plotOptions.series.point.events.click = hc_dataPointClicked;
    hcOptions.plotOptions.series.point.dataLabels = {};
    hcOptions.plotOptions.series.point.dataLabels.allowOverlap = true;
    hcOptions.plotOptions.series.animation = false;
  }
}

function drillDownButton(event, exactPoint) {
  if (this.series.length > 0 && this.series[0].data.length > 0) {
    var point = this.series[0].data[0];
    var reportDrilldown = point.report_drilldown;
    var element = event.srcElement;
    if (!element)
      element = event.target;
    var content = jQuery(element).closest(".report_content");
    if (reportDrilldown) {
      var mapParams = '&sysparm_report_map_exact_points=' + exactPoint;
      var actualMap = point.report_drilldown_map;
      if (actualMap)
        mapParams += "&sysparm_report_map_parent=" + actualMap;
      drillReport(content.parent(), reportDrilldown, '', mapParams);
    }
  }
  return;
}

function hc_addBubbleChartOptions(hcOptions, isUI, isLegendEnabled) {
  hcOptions.plotOptions = {};
  hcOptions.plotOptions.bubble = {};
  hcOptions.plotOptions.bubble.cursor = 'pointer';
  hcOptions.plotOptions.bubble.minSize = 8;
  hcOptions.plotOptions.bubble.maxSize = 70;
  if (isLegendEnabled == false)
    hcOptions.legend.enabled = false;
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatHeatmapTooltip;
    hcOptions.plotOptions.bubble.point = {};
    hcOptions.plotOptions.bubble.point.events = {};
    hcOptions.plotOptions.bubble.point.events.click = hc_dataPointClicked;
  }
}

function hc_addPieChartOptions(hcOptions, chartProps, isUI, isSemiDonut, isPublisher) {
  hcOptions.plotOptions = {};
  hcOptions.plotOptions.pie = {};
  if (isPublisher)
    hcOptions.plotOptions.pie.allowPointSelect = true,
    hcOptions.plotOptions.pie.cursor = 'pointer';
  hcOptions.plotOptions.pie.size = '90%';
  if (isSemiDonut) {
    hcOptions.plotOptions.pie.startAngle = '-90';
    hcOptions.plotOptions.pie.endAngle = '90';
    hcOptions.plotOptions.pie.center = ["50%", "75%"];
  }
  hcOptions.plotOptions.pie.showInLegend = true;
  hc_setLegendLabelFormatter(hcOptions, isUI, true);
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatPie;
    hcOptions.plotOptions.pie.point = {};
    hcOptions.plotOptions.pie.point.events = {};
    if (isPublisher) {
      hcOptions.plotOptions.pie.point.events.select = hc_dataPointSelected;
      hcOptions.plotOptions.pie.point.events.unselect = hc_dataPointUnselected;
      hcOptions.plotOptions.pie.point.events.legendItemClick = hc_dataPointLegendClick;
    } else
      hcOptions.plotOptions.pie.point.events.click = hc_dataPointClicked;
  }
}

function hc_addFunnelChartOptions(hcOptions, chartProps, isUI, chartData, isPublisher) {
  hcOptions.plotOptions = {};
  hcOptions.plotOptions.funnel = {};
  if (isPublisher)
    hcOptions.plotOptions.funnel.allowPointSelect = true
  hcOptions.plotOptions.funnel.cursor = 'pointer';
  hcOptions.plotOptions.funnel.size = '90%';
  hcOptions.plotOptions.funnel.showInLegend = true;
  hc_setLegendLabelFormatter(hcOptions, isUI, true);
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatPie;
    hcOptions.plotOptions.funnel.point = {};
    hcOptions.plotOptions.funnel.point.events = {};
    if (isPublisher) {
      hcOptions.plotOptions.funnel.point.events.select = hc_dataPointSelected;
      hcOptions.plotOptions.funnel.point.events.unselect = hc_dataPointUnselected;
      hcOptions.plotOptions.funnel.point.events.legendItemClick = hc_dataPointLegendClick;
    } else
      hcOptions.plotOptions.funnel.point.events.click = hc_dataPointClicked;
  }
  hcOptions.plotOptions.series = {};
  if (chartProps.report_properties.funnel_neck_percent)
    hcOptions.plotOptions.series.neckHeight = chartProps.report_properties.funnel_neck_percent + "%";
}

function hc_addPyramidChartOptions(hcOptions, chartProps, isUI, chartData, isPublisher) {
  hcOptions.plotOptions = {};
  hcOptions.plotOptions.funnel = {};
  if (isPublisher)
    hcOptions.plotOptions.funnel.allowPointSelect = true;
  hcOptions.plotOptions.funnel.cursor = 'pointer';
  hcOptions.plotOptions.funnel.size = '90%';
  hcOptions.plotOptions.funnel.showInLegend = true;
  hc_setLegendLabelFormatter(hcOptions, isUI, true);
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatPie;
    hcOptions.plotOptions.funnel.point = {};
    hcOptions.plotOptions.funnel.point.events = {};
    if (isPublisher) {
      hcOptions.plotOptions.funnel.point.events.select = hc_dataPointSelected;
      hcOptions.plotOptions.funnel.point.events.unselect = hc_dataPointUnselected;
      hcOptions.plotOptions.funnel.point.events.legendItemClick = hc_dataPointLegendClick;
    } else
      hcOptions.plotOptions.funnel.point.events.click = hc_dataPointClicked;
  }
  hcOptions.plotOptions.series = {};
  hcOptions.plotOptions.series.neckHeight = "0%";
  hcOptions.plotOptions.series.neckWidth = "0%";
  hcOptions.plotOptions.funnel.reversed = true;
}

function hc_addGaugeChartOptions(hcOptions, chartProps, chartData, chartType, isUI) {
  hcOptions.chart.type = chartType;
  hcOptions.pane = {};
  var yAxis = {};
  hcOptions.plotOptions = {};
  var value = parseFloat(chartData.series[0].yvalues[0]);
  var min = 0;
  var max = 0;
  if (!chartProps.report_properties.gauge_autoscale && chartProps.report_properties.from)
    min = parseInt(chartProps.report_properties.from);
  else if (value < 0)
    min = value * 1.5;
  if (!chartProps.report_properties.gauge_autoscale && chartProps.report_properties.to)
    max = parseInt(chartProps.report_properties.to);
  else if (value == 0)
    max = 10;
  else if (value > 0)
    max = value * 1.5;
  var lower = null;
  var upper = null;
  if (chartProps.report_properties.lower_limit || chartProps.report_properties.lower_limit === 0 || chartProps.report_properties.lower_limit === '0')
    lower = parseInt(chartProps.report_properties.lower_limit);
  if (chartProps.report_properties.upper_limit || chartProps.report_properties.upper_limit === 0 || chartProps.report_properties.upper_limit === '0')
    upper = parseInt(chartProps.report_properties.upper_limit);
  if (lower !== null && upper !== null) {
    if (lower < min && lower <= 0)
      min = lower * 1.5;
    if (upper > max && upper >= 0)
      max = upper * 1.5;
    var total = max - min;
    var middleColor = '#ffca1f';
    var topColor;
    var bottomColor;
    if (chartProps.report_properties.direction == 'maximize') {
      topColor = '#4bd762';
      bottomColor = '#ff402c';
    } else {
      topColor = '#ff402c';
      bottomColor = '#4bd762';
    }
    if (chartType == 'solidgauge') {
      yAxis.stops = [];
      if (chartProps.report_properties.direction == 'maximize') {
        yAxis.stops.push([(lower - min) / total, bottomColor]);
        yAxis.stops.push([(upper - min) / total, middleColor]);
        yAxis.stops.push([1, topColor]);
      } else {
        yAxis.stops.push([0, bottomColor]);
        yAxis.stops.push([(lower - min) / total, middleColor]);
        yAxis.stops.push([(upper - min) / total, topColor]);
      }
    } else {
      yAxis.plotBands = [];
      yAxis.plotBands.push({
        from: min,
        to: lower,
        color: bottomColor
      });
      yAxis.plotBands.push({
        from: lower,
        to: upper,
        color: middleColor
      });
      yAxis.plotBands.push({
        from: upper,
        to: max,
        color: topColor
      });
    }
  } else {
    if (chartType == 'solidgauge') {
      yAxis.stops = [];
      color = chartData.series[0].colors[0];
      yAxis.stops.push([0, color]);
      yAxis.stops.push([1, color]);
    }
  }
  yAxis.min = min;
  yAxis.max = max;
  if (chartType == "solidgauge") {
    hcOptions.pane.size = "100%";
    hcOptions.pane.center = ['50%', '50%'];
    hcOptions.pane.startAngle = -90;
    hcOptions.pane.endAngle = 90;
    hcOptions.pane.background = {};
    hcOptions.pane.background.innerRadius = "60%";
    hcOptions.pane.background.outerRadius = "100%";
    hcOptions.pane.background.shape = "arc";
    hcOptions.pane.background.backgroundColor = "#EEE";
    hcOptions.tooltip = {};
    hcOptions.tooltip.enabled = false;
    yAxis.tickWidth = 0;
    yAxis.lineWidth = 0;
    yAxis.minorTickInterval = null;
    yAxis.tickPositions = [min, max];
    yAxis.labels = {};
    yAxis.labels.y = 14;
    if (!hcOptions.plotOptions.solidgauge)
      hcOptions.plotOptions.solidgauge = {};
    hcOptions.plotOptions.solidgauge.point = {};
    hcOptions.plotOptions.solidgauge.point.events = {};
    hcOptions.plotOptions.solidgauge.point.events.click = hc_dataPointClicked;
  } else {
    hcOptions.chart.plotBackgroundColor = '#ffffff';
    hcOptions.chart.plotBackgroundImage = null;
    hcOptions.chart.plotBorderWidth = 0;
    hcOptions.chart.plotShadow = false;
    hcOptions.pane.startAngle = -150;
    hcOptions.pane.endAngle = 150;
    if (!hcOptions.plotOptions.gauge)
      hcOptions.plotOptions.gauge = {};
    hcOptions.plotOptions.gauge.point = {};
    hcOptions.plotOptions.gauge.point.events = {};
    hcOptions.plotOptions.gauge.point.events.click = hc_dataPointClicked;
    hcOptions.pane.background = [];
    hcOptions.pane.background.push({
      backgroundColor: '#ffffff',
      borderWidth: 0,
      outerRadius: '109%'
    });
    hcOptions.pane.background.push({
      backgroundColor: '#ffffff',
      borderWidth: 0,
      outerRadius: '107%'
    });
    hcOptions.pane.background.push({
      backgroundColor: '#ffffff'
    });
    hcOptions.pane.background.push({
      backgroundColor: '#ffffff',
      borderWidth: 0,
      outerRadius: '105%',
      innerRadius: '103%'
    });
    yAxis.minorTickWidth = 1;
    yAxis.minorTickLength = 10;
    yAxis.minorTickPosition = 'inside';
    yAxis.tickPixelInterval = 30;
    yAxis.tickWidth = 2;
    yAxis.tickPosition = 'inside';
    yAxis.tickLength = 10;
    yAxis.labels = {};
    yAxis.labels.step = 2;
    yAxis.labels.rotation = 'auto';
    if (lower !== null && upper !== null) {
      yAxis.minorTickColor = '#ffffff';
      yAxis.tickColor = '#ffffff';
    } else {
      yAxis.minorTickColor = '#828890';
      yAxis.tickColor = '#828890';
    }
  }
  hcOptions.yAxis = [];
  hcOptions.yAxis.push(yAxis);
}

function hc_addBarChartOptions(hcOptions, chartProps, chartData, barType, isUI) {
  hc_addCommonBarChartOptions(hcOptions, chartProps, chartData, barType, isUI);
  hcOptions.plotOptions.series.minPointLength = 2;
  if (chartData.series.length === 1)
    hc_addYAxisMax(chartProps, hcOptions, chartData, chartProps.chartType);
  if (isUI)
    hcOptions.tooltip.formatter = hc_formatToolTip;
}

function hc_updateDataLabelOptionsGeographical(hcOptions, chartData, chartType) {
  if ('map' === chartType) {
    if (hcOptions.series[0].dataLabels == null)
      hcOptions.series[0].dataLabels = {};
    hcOptions.series[0].dataLabels.enabled = true;
    hcOptions.series[0].dataLabels.color = '#000';
    hcOptions.series[0].dataLabels.show_geographical_label = chartData.report_properties_series[0].show_geographical_label;;
    hcOptions.series[0].dataLabels.show_data_label = chartData.report_properties_series[0].show_chart_data_label;
    hcOptions.series[0].dataLabels.formatter = hc_formatMapDataLabels;
  }
}

function hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, isUI) {
  var dataLabelColor = '#606060';
  if (chartData.report_properties_series != undefined && chartData.report_properties_series[0].show_chart_data_label === true) {
    if ('pie' === chartType) {
      if (hcOptions.plotOptions.pie == null)
        hcOptions.plotOptions.pie = {};
      hcOptions.plotOptions.pie.dataLabels = {};
      hcOptions.plotOptions.pie.dataLabels.enabled = true;
      hcOptions.plotOptions.pie.dataLabels.softConnector = false;
      hcOptions.plotOptions.pie.dataLabels.distance = 15;
      hcOptions.plotOptions.pie.dataLabels.style = {};
      hcOptions.plotOptions.pie.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.pie.dataLabels.style.fontSize = '10pt';
      hcOptions.plotOptions.pie.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.pie.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.pie.dataLabels.style.fontWeight = 'normal';
      if ('font_family' in chartProps.report_properties && chartProps.report_properties.font_family != '')
        hcOptions.plotOptions.pie.dataLabels.style.fontFamily = chartProps.report_properties.font_family;
      if ('font_size' in chartProps.report_properties && chartProps.report_properties.font_size != '')
        hcOptions.plotOptions.pie.dataLabels.style.fontSize = chartProps.report_properties.font_size;
      if (isUI)
        hcOptions.plotOptions.pie.dataLabels.formatter = hc_formatNameValueLabel;
      else
        hcOptions.plotOptions.pie.dataLabels.formatter = 'hc_formatNameValueLabel';
    } else if ('semi_donut' === chartType || 'donut' === chartType) {
      if (hcOptions.plotOptions.pie == null)
        hcOptions.plotOptions.pie = {};
      hcOptions.plotOptions.pie.dataLabels = {};
      hcOptions.plotOptions.pie.dataLabels.enabled = true;
      hcOptions.plotOptions.pie.dataLabels.softConnector = false;
      hcOptions.plotOptions.pie.dataLabels.distance = 15;
      hcOptions.plotOptions.pie.dataLabels.style = {};
      hcOptions.plotOptions.pie.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.pie.dataLabels.style.fontSize = '10pt';
      hcOptions.plotOptions.pie.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.pie.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.pie.dataLabels.style.fontWeight = 'normal';
      if ('font_family' in chartProps.report_properties && chartProps.report_properties.font_family != '')
        hcOptions.plotOptions.pie.dataLabels.style.fontFamily = chartProps.report_properties.font_family;
      if ('font_size' in chartProps.report_properties && chartProps.report_properties.font_size != '')
        hcOptions.plotOptions.pie.dataLabels.style.fontSize = chartProps.report_properties.font_size;
      if (isUI)
        hcOptions.plotOptions.pie.dataLabels.formatter = hc_formatNameValueLabel;
      else
        hcOptions.plotOptions.pie.dataLabels.formatter = 'hc_formatNameValueLabel';
    } else if ('funnel' === chartType || 'pyramid' === chartType) {
      hcOptions.plotOptions.funnel.dataLabels = {};
      hcOptions.plotOptions.funnel.dataLabels.enabled = true;
      hcOptions.plotOptions.funnel.dataLabels.softConnector = false;
      hcOptions.plotOptions.funnel.dataLabels.distance = 15;
      hcOptions.plotOptions.funnel.dataLabels.style = {};
      hcOptions.plotOptions.funnel.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.funnel.dataLabels.style.fontSize = '10pt';
      hcOptions.plotOptions.funnel.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.funnel.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.funnel.dataLabels.style.fontWeight = 'normal';
      if ('font_family' in chartProps.report_properties && chartProps.report_properties.font_family != '')
        hcOptions.plotOptions.funnel.dataLabels.style.fontFamily = chartProps.report_properties.font_family;
      if ('font_size' in chartProps.report_properties && chartProps.report_properties.font_size != '')
        hcOptions.plotOptions.funnel.dataLabels.style.fontSize = chartProps.report_properties.font_size;
      if (isUI)
        hcOptions.plotOptions.funnel.dataLabels.formatter = hc_formatNameValueLabel;
      else
        hcOptions.plotOptions.funnel.dataLabels.formatter = 'hc_formatNameValueLabel';
    } else if ('control' === chartType) {
      if (hcOptions.plotOptions == null)
        hcOptions.plotOptions = {};
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = true;
      hcOptions.plotOptions.series.dataLabels.softConnector = false;
      hcOptions.plotOptions.series.dataLabels.distance = 15;
      hcOptions.plotOptions.series.dataLabels.style = {};
      hcOptions.plotOptions.series.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.series.dataLabels.style.fontSize = '10pt';
      hcOptions.plotOptions.series.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.series.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.series.dataLabels.style.fontWeight = 'normal';
      if ('font_family' in chartProps.report_properties && chartProps.report_properties.font_family != '')
        hcOptions.plotOptions.series.dataLabels.style.fontFamily = chartProps.report_properties.font_family;
      if ('font_size' in chartProps.report_properties && chartProps.report_properties.font_size != '')
        hcOptions.plotOptions.series.dataLabels.style.fontSize = chartProps.report_properties.font_size;
      if (isUI)
        hcOptions.plotOptions.series.dataLabels.formatter = hc_formatValueLabel;
      else
        hcOptions.plotOptions.series.dataLabels.formatter = 'hc_formatValueLabel';
    } else if ('bar' === chartType || 'horizontal_bar' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = true;
      hcOptions.plotOptions.series.dataLabels.softConnector = false;
      hcOptions.plotOptions.series.dataLabels.distance = 15;
      hcOptions.plotOptions.series.dataLabels.style = {};
      hcOptions.plotOptions.series.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.series.dataLabels.style.fontSize = '10pt';
      hcOptions.plotOptions.series.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.series.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.series.dataLabels.style.fontWeight = 'normal';
      hc_setDataLabelPositionProperties(hcOptions, chartData);
      if ('font_family' in chartProps.report_properties && chartProps.report_properties.font_family != '')
        hcOptions.plotOptions.series.dataLabels.style.fontFamily = chartProps.report_properties.font_family;
      if ('font_size' in chartProps.report_properties && chartProps.report_properties.font_size != '')
        hcOptions.plotOptions.series.dataLabels.style.fontSize = chartProps.report_properties.font_size;
      if (isUI)
        hcOptions.plotOptions.series.dataLabels.formatter = hc_formatValueLabel;
      else
        hcOptions.plotOptions.series.dataLabels.formatter = 'hc_formatValueLabel';
    } else if ('pareto' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[1].dataLabels = {};
      hcOptions.series[0].dataLabels.enabled = true;
      hcOptions.series[0].dataLabels.softConnector = false;
      hcOptions.series[0].dataLabels.distance = 15;
      hcOptions.series[0].dataLabels.style = {};
      hcOptions.series[0].dataLabels.style.fontFamily = 'Arial';
      hcOptions.series[0].dataLabels.style.fontSize = '10pt';
      hcOptions.series[0].dataLabels.style.color = dataLabelColor;
      hcOptions.series[0].dataLabels.style.fill = dataLabelColor;
      hcOptions.series[0].dataLabels.style.fontWeight = 'normal';
      hc_setDataLabelPositionProperties(hcOptions, chartData);
      if ('font_family' in chartProps.report_properties && chartProps.report_properties.font_family != '')
        hcOptions.series[0].dataLabels.style.fontFamily = chartProps.report_properties.font_family;
      if ('font_size' in chartProps.report_properties && chartProps.report_properties.font_size != '')
        hcOptions.series[0].dataLabels.style.fontSize = chartProps.report_properties.font_size;
      if (isUI)
        hcOptions.series[0].dataLabels.formatter = hc_formatValueLabel;
      else
        hcOptions.series[0].dataLabels.formatter = 'hc_formatValueLabel';
    } else if ('trend' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      for (i = 0; i < hcOptions.series.length; i++) {
        hcOptions.series[i].dataLabels = {};
        hcOptions.series[i].dataLabels.enabled = true;
        hcOptions.series[i].dataLabels.softConnector = false;
        hcOptions.series[i].dataLabels.distance = 15;
        hcOptions.series[i].dataLabels.inside = false;
        hcOptions.series[i].dataLabels.style = {};
        hcOptions.series[i].dataLabels.style.fontFamily = 'Arial';
        hcOptions.series[i].dataLabels.style.fontSize = '10pt';
        hcOptions.series[i].dataLabels.style.color = dataLabelColor;
        hcOptions.series[i].dataLabels.style.fill = dataLabelColor;
        hcOptions.series[i].dataLabels.style.fontWeight = 'normal';
        if ('font_family' in chartProps.report_properties && chartProps.report_properties.font_family != '')
          hcOptions.series[i].dataLabels.style.fontFamily = chartProps.report_properties.font_family;
        if ('font_size' in chartProps.report_properties && chartProps.report_properties.font_size != '')
          hcOptions.series[i].dataLabels.style.fontSize = chartProps.report_properties.font_size;
        if (isUI)
          hcOptions.series[i].dataLabels.formatter = hc_formatValueLabel;
        else
          hcOptions.series[i].dataLabels.formatter = 'hc_formatValueLabel';
      }
      hc_setDataLabelPositionProperties(hcOptions, chartData);
    } else if ('gauge' === chartType) {
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.format = '<div style="text-align:center"><span style="font-family:Arial;font-size:25px;color:black">{point.displayvalue}</span><br/>';
      hcOptions.series[0].dataLabels.borderWidth = 0;
      hcOptions.series[0].dataLabels.enabled = true;
    } else if ('angular_gauge' === chartType) {
      if (hcOptions.plotOptions.gauge == null)
        hcOptions.plotOptions.gauge = {};
      if (hcOptions.plotOptions.gauge.dataLabels == null)
        hcOptions.plotOptions.gauge.dataLabels = {};
      hcOptions.plotOptions.gauge.dataLabels.enabled = true;
      hcOptions.plotOptions.gauge.dataLabels.useHTML = true;
      hcOptions.plotOptions.gauge.dataLabels.borderWidth = 0;
      hcOptions.plotOptions.gauge.dataLabels.format = '<div style="text-align:center"><span style="font-family:Arial;font-size:25px;color:black">{point.displayvalue}</span><br/>';
    } else if ('solid_gauge' === chartType) {
      if (hcOptions.plotOptions.solidgauge == null)
        hcOptions.plotOptions.solidgauge = {};
      if (hcOptions.plotOptions.solidgauge.dataLabels == null)
        hcOptions.plotOptions.solidgauge.dataLabels = {};
      hcOptions.plotOptions.solidgauge.dataLabels.enabled = true;
      hcOptions.plotOptions.solidgauge.dataLabels.y = -35;
      hcOptions.plotOptions.solidgauge.dataLabels.useHTML = true;
      hcOptions.plotOptions.solidgauge.dataLabels.borderWidth = 0;
      hcOptions.plotOptions.solidgauge.dataLabels.format = '<div style="text-align:center"><span style="font-family:Arial;font-size:25px;color:black">{point.displayvalue}</span><br/>';
    } else if (isLineType(chartType)) {
      hcOptions.series.forEach(function(series) {
        series.dataLabels = series.dataLabels || {};
        series.dataLabels.enabled = series.dataLabels.enabled || false;
        series.dataLabels.softConnector = false;
        series.dataLabels.distance = 15;
        series.dataLabels.style = {};
        series.dataLabels.style.fontFamily = 'Arial';
        series.dataLabels.style.fontSize = '10pt';
        series.dataLabels.style.color = dataLabelColor;
        series.dataLabels.style.fill = dataLabelColor;
        series.dataLabels.style.fontWeight = 'normal';
        if ('font_family' in chartProps.report_properties && chartProps.report_properties.font_family != '')
          series.dataLabels.style.fontFamily = chartProps.report_properties.font_family;
        if ('font_size' in chartProps.report_properties && chartProps.report_properties.font_size != '')
          series.dataLabels.style.fontSize = chartProps.report_properties.font_size;
        if (chartType == 'line_bar')
          hc_setDataLabelPositionProperties(hcOptions, chartData);
        if (isUI)
          series.dataLabels.formatter = hc_formatValueLabel;
        else
          series.dataLabels.formatter = 'hc_formatValueLabel';
      });
    } else if ('heatmap' === chartType) {
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.format = '{point.value_display}';
      hcOptions.series[0].dataLabels.enabled = true;
    } else if ('map' === chartType) {} else if ('bubble' == chartType) {
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.format = '{point.display_vlaue}';
      hcOptions.series[0].dataLabels.enabled = true;
      hcOptions.series[0].dataLabels.color = 'black';
      hcOptions.series[0].dataLabels.style = {};
      hcOptions.series[0].dataLabels.style.textShadow = 'none';
      hcOptions.series[0].dataLabels.style.HcTextStroke = null;
    }
  } else {
    if ('pie' === chartType) {
      if (hcOptions.plotOptions.pie == null)
        hcOptions.plotOptions.pie = {};
      hcOptions.plotOptions.pie.dataLabels = {};
      hcOptions.plotOptions.pie.dataLabels.enabled = false;
    } else if ('heatmap' === chartType) {
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.format = '{point.value}';
      hcOptions.series[0].dataLabels.enabled = false;
      hcOptions.series[0].dataLabels.color = 'black';
      hcOptions.series[0].dataLabels.style = {};
      hcOptions.series[0].dataLabels.style.textShadow = 'none';
      hcOptions.series[0].dataLabels.style.HcTextStroke = null;
    } else if ('semi_donut' === chartType || 'donut' === chartType) {
      if (hcOptions.plotOptions.pie == null)
        hcOptions.plotOptions.pie = {};
      hcOptions.plotOptions.pie.dataLabels = {};
      hcOptions.plotOptions.pie.dataLabels.enabled = false;
    } else if ('funnel' === chartType || 'pyramid' === chartType) {
      if (hcOptions.plotOptions.funnel == null)
        hcOptions.plotOptions.funnel = {};
      hcOptions.plotOptions.funnel.dataLabels = {};
      hcOptions.plotOptions.funnel.dataLabels.enabled = false;
    } else if ('control' === chartType) {
      if (hcOptions.plotOptions == null)
        hcOptions.plotOptions = {};
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = false;
    } else if ('bar' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = false;
    } else if ('pareto' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = false;
    } else if ('column' === chartType) {
      if (hcOptions.plotOptions.column == null)
        hcOptions.plotOptions.column = {};
      hcOptions.plotOptions.column.dataLabels = {};
      hcOptions.plotOptions.column.dataLabels.enabled = false;
    } else if ('gauge' === chartType) {
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.format = '<div style="text-align:center"><span style="font-family:Arial;font-size:25px;color:black">{point.displayvalue}</span><br/>';
      hcOptions.series[0].dataLabels.borderWidth = 0;
      hcOptions.series[0].dataLabels.enabled = true;
    } else if ('angular_gauge' === chartType) {
      if (hcOptions.plotOptions.gauge == null)
        hcOptions.plotOptions.gauge = {};
      if (hcOptions.plotOptions.gauge.dataLabels == null)
        hcOptions.plotOptions.gauge.dataLabels = {};
      hcOptions.plotOptions.gauge.dataLabels.enabled = true;
      hcOptions.plotOptions.gauge.dataLabels.useHTML = true;
      hcOptions.plotOptions.gauge.dataLabels.borderWidth = 0;
      hcOptions.plotOptions.gauge.dataLabels.format = '<div style="text-align:center"><span style="font-family:Arial;font-size:25px;color:black">{point.displayvalue}</span><br/>';
    } else if ('solid_gauge' === chartType) {
      if (hcOptions.plotOptions.solidgauge == null)
        hcOptions.plotOptions.solidgauge = {};
      if (hcOptions.plotOptions.solidgauge.dataLabels == null)
        hcOptions.plotOptions.solidgauge.dataLabels = {};
      hcOptions.plotOptions.solidgauge.dataLabels.enabled = true;
      hcOptions.plotOptions.solidgauge.dataLabels.y = -35;
      hcOptions.plotOptions.solidgauge.dataLabels.useHTML = true;
      hcOptions.plotOptions.solidgauge.dataLabels.borderWidth = 0;
      hcOptions.plotOptions.solidgauge.dataLabels.format = '<div style="text-align:center"><span style="font-family:Arial;font-size:25px;color:black">{point.displayvalue}</span><br/>';
    } else if (isLineType(chartType)) {
      if (hcOptions.series[0] == null)
        hcOptions.series[0] = {};
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.enabled = false;
    } else if ('map' === chartType) {
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.enabled = false;
    }
  }
  if (!isUI) {
    if (hcOptions.plotOptions == null)
      hcOptions.plotOptions = {};
    if (hcOptions.plotOptions.series == null)
      hcOptions.plotOptions.series = {};
  }
}

function hc_addStackedBarChartOptions(hcOptions, chartProps, chartData, barType, isUI, serieProps) {
  hc_addCommonBarChartOptions(hcOptions, chartProps, chartData, barType, isUI);
  if (chartData.series.length === 1 && chartProps.aggType === 'COUNT')
    hc_addYAxisMax(chartProps, hcOptions, chartData, chartProps.chartType);
  if (isUI) {
    hcOptions.tooltip.shared = false;
    hcOptions.tooltip.formatter = hc_formatStackedBarToolTip;
    if (hcOptions.chart.width)
      hcOptions.tooltip.style = {
        width: hcOptions.chart.width / 2
      };
    hcOptions.tooltip.followPointer = true;
    hcOptions.tooltip.positioner = function(labelWidth, labelHeight, point) {
      return tooltipPositioner(labelWidth, labelHeight, point, this.chart);
    }
  }
}

function tooltipPositioner(labelWidth, labelHeight, point, chart) {
  var tooltipX, tooltipY;
  if (point.plotX + labelWidth > chart.plotWidth) {
    tooltipX = point.plotX + chart.plotLeft - labelWidth - 20;
  } else {
    tooltipX = point.plotX + chart.plotLeft + 20;
  }
  tooltipY = point.plotY + chart.plotTop - 20;
  return {
    x: tooltipX,
    y: tooltipY
  };
}

function hc_addLineChartOptions(hcOptions, chartProps, chartData, isUI, chartType) {
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hc_addSlantLabelOptions(hcOptions, chartProps, true);
  hcOptions.plotOptions = {};
  for (i = 0; i < chartData.series.length; i++) {
    var seriesChartType = chartData.series[i].series_plot_type;
    if (seriesChartType === 'line' || seriesChartType === 'step_line') {
      hc_setZoomTypeForSlowMetric(chartData, hcOptions);
      hcOptions.chart.type = 'line';
    } else if (seriesChartType === 'area')
      hcOptions.chart.type = 'area';
    else if (seriesChartType === 'line_bar') {
      hcOptions.chart.type = 'column';
      hc_setZoomTypeForSlowMetric(chartData, hcOptions);
      hc_addSummaryDataToLegendForSlowMetric(chartData, hcOptions, isUI);
    } else if (seriesChartType === 'spline')
      hcOptions.chart.type = 'spline';
    if (isUI) {
      if (hcOptions.tooltip === undefined)
        hcOptions.tooltip = {};
      hcOptions.tooltip.shared = false;
      hcOptions.tooltip.formatter = hc_formatGeneralLineBarToolTip;
      hcOptions.plotOptions[hcOptions.chart.type] = {};
      hcOptions.plotOptions[hcOptions.chart.type].point = hcOptions.plotOptions[hcOptions.chart.type].point || {};
      hcOptions.plotOptions[hcOptions.chart.type].point.events = hcOptions.plotOptions[hcOptions.chart.type].events || {};
      hcOptions.plotOptions[hcOptions.chart.type].point.events.click = hc_dataPointClicked;
    }
  }
}

function hc_addAvailChartOptions(hcOptions, chartProps, chartData, isUI) {
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hc_addSlantLabelOptions(hcOptions, chartProps, true);
  if (hcOptions.tooltip == undefined)
    hcOptions.tooltip = {};
  if ('sub_series' in chartData.series[0]) {
    if (isUI)
      hcOptions.tooltip.formatter = hc_formatStackedBarToolTip;
  } else {
    hcOptions.legend.enabled = false;
    if (isUI)
      hcOptions.tooltip.formatter = hc_formatToolTip;
  }
  hcOptions.yAxis[0].min = 0;
  hcOptions.yAxis[0].max = 100;
  hcOptions.yAxis[0].tickInterval = 10;
}

function hc_addHistogramOptions(hcOptions, chartProps, chartData, isUI) {
  hc_addBarChartOptions(hcOptions, chartProps, chartData, 'column', isUI);
  hcOptions.plotOptions.column.pointPadding = 0;
  hcOptions.plotOptions.column.groupPadding = 0;
  hcOptions.plotOptions.column.borderWidth = 0.5;
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatHistToolTip;
    hcOptions.plotOptions.column.point = {};
    hcOptions.plotOptions.column.point.events = {};
    hcOptions.plotOptions.column.point.events.click = '';
  }
  hcOptions.legend.enabled = false;
}

function hc_addCommonBarChartOptions(hcOptions, chartProps, chartData, barType, isUI) {
  hcOptions.chart.type = barType;
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hcOptions.plotOptions = {};
  hcOptions.plotOptions.series = {};
  if (barType == 'column') {
    hc_addSlantLabelOptions(hcOptions, chartProps, true);
    hcOptions.plotOptions.column = {};
    hcOptions.plotOptions.column.groupPadding = 0;
    if ('bar_spacing' in chartProps.report_properties)
      hcOptions.plotOptions.column.pointPadding = chartProps.report_properties.bar_spacing;
    if (isUI) {
      hcOptions.plotOptions.column = hcOptions.plotOptions.column || {};
      hcOptions.plotOptions.column.point = hcOptions.plotOptions.column.point || {};
      hcOptions.plotOptions.column.point.events = hcOptions.plotOptions.column.point.events || {};
      hcOptions.plotOptions.column.point.events.click = hc_dataPointClicked;
    }
  } else if (barType == 'bar') {
    hc_addSlantLabelOptions(hcOptions, chartProps, false);
    hcOptions.xAxis.labels.y = 0;
    hcOptions.plotOptions.bar = {};
    hcOptions.plotOptions.bar.groupPadding = 0;
    if ('bar_spacing' in chartProps.report_properties)
      hcOptions.plotOptions.bar.pointPadding = chartProps.report_properties.bar_spacing;
    if (isUI) {
      hcOptions.plotOptions.bar.point = hcOptions.plotOptions.bar.point || {};
      hcOptions.plotOptions.bar.point.events = hcOptions.plotOptions.bar.point.events || {};
      hcOptions.plotOptions.bar.point.events.click = hc_dataPointClicked;
    }
  }
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatToolTip;
    hcOptions.plotOptions.column = hcOptions.plotOptions.column || {};
    hcOptions.plotOptions.column.point = hcOptions.plotOptions.column.point || {};
    hcOptions.plotOptions.column.point.events = hcOptions.plotOptions.column.point.events || {};
    hcOptions.plotOptions.column.point.events.click = hc_dataPointClicked;
  }
}

function hc_getXAxisLabelStyle(chartProps, isUI) {
  return hc_getAxisLabelStyle(chartProps.report_properties.x_axis_label_color_value, chartProps.report_properties.x_axis_label_size,
    chartProps.report_properties.x_axis_label_bold, chartProps.defaultFontFamily, isUI);
}

function hc_getYAxisLabelStyle(chartProps, isUI) {
  return hc_getAxisLabelStyle(chartProps.report_properties.y_axis_label_color_value, chartProps.report_properties.y_axis_label_size,
    chartProps.report_properties.y_axis_label_bold, chartProps.defaultFontFamily, isUI);
}

function hc_getAxisLabelStyle(axis_label_color_value, axis_label_size, axis_label_bold, fontFamily, isUI) {
  var style = {};
  style.fontFamily = fontFamily;
  style.color = axis_label_color_value;
  style.fontSize = axis_label_size + 'px';
  if (axis_label_bold)
    style.fontWeight = 'bold';
  if (isUI && window.isMSIE) {
    style.backgroundColor = '#fff';
  }
  return style;
}

function unescapeHtmlInput(input) {
  var el = document.createElement('div');
  el.innerHTML = input;
  return el.childNodes.length === 0 ? "" : el.childNodes[0].nodeValue;
}

function hc_axisTitleDisplayText(axisTitle, isUI) {
  if (isUI) {
    var axisLabel = document.createElement('tspan');
    axisLabel.textContent = unescapeHtmlInput(axisTitle);
    axisLabel.setAttribute('title', unescapeHtmlInput(axisTitle));
    return axisLabel.outerHTML;
  } else
    return '<tspan  title="' + axisTitle + '">' + axisTitle + '</tspan>';
}

function hc_buildAxisTitle(axisTitleText, axisTitleBold, axisTitleSize, axisTitleColor, fontFamily, width, isUI) {
  var title = {
    text: axisTitleText,
    useHTML: "true",
    style: {
      fontFamily: fontFamily,
      fontWeight: axisTitleBold ? "bold" : "normal",
      fontSize: axisTitleSize + "px",
      color: axisTitleColor,
      maxWidth: width ? (width - 80) + "px" : "300px",
      display: "inline-block",
      overflow: "hidden",
      textOverflow: "ellipsis",
      "-o-text-overflow": "ellipsis",
      "-ms-text-overflow": "ellipsis",
      "-moz-text-overflow": "ellipsis",
      "white-space": "nowrap",
      "word-wrap": "normal",
      "position": "relative"
    }
  }
  return title;
}

function hc_addHeatmapAxisCategories(hcOptions, chartData) {
  hcOptions.xAxis = {};
  hcOptions.xAxis.categories = fetchAxisCategory(chartData.series[0].xAxisCategories);
  hcOptions.xAxis.title = null;
  hcOptions.xAxis.labels = {};
  hcOptions.xAxis.labels.rotation = -45;
  var yAxis = {};
  yAxis.categories = fetchAxisCategory(chartData.series[0].yAxisCategories);
  yAxis.title = null;
  if (hcOptions.yAxis != undefined)
    yAxis.max = hcOptions.yAxis[0].categories.length - 1;
  hcOptions.yAxis = [];
  hcOptions.yAxis.push(yAxis);
}

function hc_addBubbleAxisCategories(hcOptions, chartData) {
  hcOptions.xAxis = {};
  hcOptions.xAxis.title = {};
  hcOptions.xAxis.title.text = chartData.series[0].xAxis;
  hcOptions.yAxis = {};
  hcOptions.yAxis.title = {};
  hcOptions.yAxis.title.text = chartData.series[0].yAxis;
}

function getCategoriesFromJSONArray(category) {
  return category.fieldValues[0].value;
}

function fetchAxisCategory(categories) {
  axisCategories = [];
  if (categories) {
    for (var i = 0; i < categories.length; i++) {
      axisCategories.push(categories[i].fieldValues[0].value)
    }
  }
  return axisCategories;
}

function hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI) {
  var label_style = hc_getXAxisLabelStyle(chartProps, isUI);
  hcOptions.xAxis = {};
  if (hc_isSlowMetricChart(hcOptions, chartData.series[0])) {
    hcOptions.xAxis.type = 'datetime';
  } else {
    hcOptions.xAxis.categories = [];
    hcOptions.xAxis.categories = chartProps.xValues;
  }
  hcOptions.xAxis.labels = {};
  hcOptions.xAxis.labels.style = label_style;
  hcOptions.xAxis.opposite = chartProps.report_properties.x_axis_opposite;
  hcOptions.xAxis.title = {};
  var xTitleText = chartProps.report_properties.x_axis_title;
  xTitleText = xTitleText === '' || xTitleText === undefined ? '' : xTitleText;
  hcOptions.xAxis.title = hc_buildAxisTitle(hc_axisTitleDisplayText(xTitleText, isUI), chartProps.report_properties.x_axis_title_bold,
    chartProps.report_properties.x_axis_title_size, chartProps.report_properties.x_axis_title_color_value,
    chartProps.defaultFontFamily, hcOptions.chart.width, isUI);
  if (chartProps.report_properties.x_axis_display_grid) {
    hcOptions.xAxis.gridLineWidth = chartProps.report_properties.x_axis_grid_width;
    hcOptions.xAxis.gridLineColor = chartProps.report_properties.x_axis_grid_color_value;
    if (chartProps.report_properties.x_axis_grid_dotted)
      hcOptions.xAxis.gridLineDashStyle = 'dot';
  } else {
    hcOptions.xAxis.gridLineWidth = 0;
  }
  var yAxis = {};
  yAxis.labels = {};
  yAxis.labels.style = hc_getYAxisLabelStyle(chartProps, isUI);
  if (chartProps.report_properties.y_axis_display_grid) {
    yAxis.gridLineWidth = chartProps.report_properties.y_axis_grid_width;
    yAxis.gridLineColor = chartProps.report_properties.y_axis_grid_color_value;
    if (chartProps.report_properties.y_axis_grid_dotted)
      yAxis.gridLineDashStyle = 'dot';
  } else {
    yAxis.gridLineWidth = 0;
  }
  yAxis.title = {};
  yAxis.title.margin = 20;
  yAxis.opposite = chartProps.report_properties.y_axis_opposite;
  yAxis.title.useHTML = true;
  yAxis.title.style = {};
  var yTitleText = chartProps.report_properties.y_axis_title;
  yTitleText = yTitleText === '' || yTitleText === undefined ? chartData.series[0].yTitle : yTitleText;
  yAxis.title = hc_buildAxisTitle(hc_axisTitleDisplayText(yTitleText, isUI), chartProps.report_properties.y_axis_title_bold,
    chartProps.report_properties.y_axis_title_size, chartProps.report_properties.y_axis_title_color_value,
    chartProps.defaultFontFamily, hcOptions.chart.height, isUI);
  if (isUI && window.isMSIE) {
    yAxis.title.style.backgroundColor = '#ffffff';
  }
  if (chartProps.aggType == 'COUNT')
    yAxis.allowDecimals = false;
  hcOptions.yAxis = [];
  hcOptions.yAxis.push(yAxis);
}

function hc_addSlantLabelOptions(hcOptions, chartProps, xaxis) {
  var minLabelsToSlant = 5;
  if ('slant_axis_labels' in chartProps.report_properties)
    minLabelsToSlant = chartProps.report_properties.slant_axis_labels;
  if (chartProps.xValues.length >= minLabelsToSlant) {
    hcOptions.xAxis.labels.rotation = -45;
    hcOptions.xAxis.labels.align = hcOptions.xAxis.opposite ? 'left' : 'right';
  }
  if (!xaxis) {
    hcOptions.yAxis[0].labels.rotation = -45;
    hcOptions.yAxis[0].labels.align = hcOptions.yAxis[0].opposite ? 'left' : 'right';
  }
}

function hc_addParetoChartOptions(hcOptions, chartProps, total, isUI) {
  var bar_yAxis = hcOptions.yAxis;
  bar_yAxis.lineWidth = 1;
  hcOptions.yAxis = bar_yAxis;
  var percent_axis = {};
  percent_axis.title = {};
  if (isUI)
    percent_axis.title.margin = 20;
  percent_axis.title.style = {};
  percent_axis.title.text = "Percent";
  percent_axis.title.style.color = chartProps.blackColor;
  percent_axis.title.style.fontFamily = chartProps.defaultFontFamily;
  percent_axis.title.style.fontSize = chartProps.fontSize;
  if (isUI && window.isMSIE) {
    percent_axis.title.style.backgroundColor = '#ffffff';
  }
  percent_axis.alignTicks = false;
  percent_axis.gridLineWidth = 0;
  percent_axis.lineColor = '#999';
  percent_axis.lineWidth = 1;
  percent_axis.tickColor = '#666';
  percent_axis.tickWidth = 1;
  percent_axis.tickLength = 3;
  percent_axis.tickInterval = parseFloat(total) / 10;
  percent_axis.endOnTick = false;
  percent_axis.opposite = true;
  percent_axis.linkedTo = 0;
  percent_axis.labels = {};
  if (isUI) {
    percent_axis.labels.formatter = function() {
      var pcnt = Highcharts.numberFormat((this.value / parseFloat(total) * 100), 0, '.');
      return pcnt + '%';
    }
  } else {
    percent_axis.labels.formatter = 'hc_formatParetoAxisLabels_' + total + '_';
  }
  percent_axis.labels.style = hc_getYAxisLabelStyle(chartProps, isUI);
  percent_axis.plotLines = [];
  var percent_plot = {};
  percent_plot.color = 'blue';
  percent_plot.width = 2;
  percent_plot.value = 0.80 * total;
  percent_axis.plotLines.push(percent_plot);
  hcOptions.yAxis.push(percent_axis);
  hcOptions.legend.enabled = false;
}

function hc_addControlChartOptions(hcOptions, chartProps, chartData, isUI) {
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hc_addSlantLabelOptions(hcOptions, chartProps, true);
  if (isUI) {
    hcOptions.plotOptions = {};
    hcOptions.plotOptions.line = {};
    hcOptions.plotOptions.line.point = {};
    hcOptions.plotOptions.line.point.events = {};
    hcOptions.plotOptions.line.point.events.click = hc_dataPointClicked;
    hcOptions.tooltip.formatter = hc_formatControlToolTip;
  }
}

function hc_addBoxChartOptions(hcOptions, chartProps, chartData, isUI) {
  hcOptions.chart.type = 'boxplot';
  hcOptions.legend.enabled = false;
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hc_addSlantLabelOptions(hcOptions, chartProps, true);
  if (isUI)
    hcOptions.tooltip.followPointer = true;
}

function hc_addYAxisMax(chartProps, hcOptions, chartData, chartType) {
  if (chartType == 'pareto')
    return;
  var seriesData = chartData.series[0];
  if (chartData.report_properties_series != undefined && chartData.report_properties_series[0].bar_unstack === true) {
    hcOptions.yAxis[0].startOnTick = true;
    hcOptions.yAxis[0].endOnTick = true;
  } else {
    if ((chartData.report_properties_series[0].y_axis_to === undefined ||
        chartData.report_properties_series[0].y_axis_to === '') &&
      seriesData.ymax !== undefined && seriesData.ymax !== '')
      hcOptions.yAxis[0].max = parseFloat(seriesData.ymax);
  }
}

function hc_addYAxisMaxSeries(seriesProps, hcOptions, seriesData, iSerie) {
  if (seriesData.series_plot_type == 'pareto')
    return;
  if (hcOptions.yAxis[iSerie] == undefined)
    return;
  if (seriesProps.bar_unstack != undefined && seriesProps.bar_unstack === true) {
    hcOptions.yAxis[iSerie].startOnTick = true;
    hcOptions.yAxis[iSerie].endOnTick = true;
  }
  if (seriesProps.y_axis_from !== undefined && seriesProps.y_axis_from !== '')
    hcOptions.yAxis[iSerie].min = seriesProps.y_axis_from;
  if (seriesProps.y_axis_to !== undefined && seriesProps.y_axis_to !== '')
    hcOptions.yAxis[iSerie].max = seriesProps.y_axis_to;
}

function hc_addYAxisIfNedded(hcOptions, chartProps, chartPropsSerie, seriesData, isUI, iSerie) {
  if (chartPropsSerie == null)
    return;
  if (chartPropsSerie.show_y_axis == true) {
    var yAxis = JSON.parse(JSON.stringify(hcOptions.yAxis[0]));
    yAxis.title = hc_buildAxisTitle(hc_axisTitleDisplayText(chartPropsSerie.y_axis_title, isUI), chartProps.report_properties.y_axis_title_bold,
      chartProps.report_properties.y_axis_title_size, chartProps.report_properties.y_axis_title_color_value,
      chartProps.defaultFontFamily, hcOptions.chart.height, isUI);
    yAxis.min = null;
    yAxis.max = null;
    yAxis.opposite = true;
    yAxis.showEmpty = true;
    var color = seriesData.colors != undefined ? seriesData.colors[0] : '';
    if (yAxis.labels == undefined)
      yAxis.labels = {};
    yAxis.labels.formatter = null;
    if (yAxis.title.style == undefined)
      yAxis.title.style = {};
    if (chartPropsSerie.y_axis_from != undefined && chartPropsSerie.y_axis_from != '')
      yAxis.min = chartPropsSerie.y_axis_from;
    if (chartPropsSerie.y_axis_to != undefined && chartPropsSerie.y_axis_to != '')
      yAxis.max = chartPropsSerie.y_axis_to;
    hcOptions.yAxis.push(yAxis);
    return hcOptions.yAxis.length - 1;
  } else
    return 0;
}

function hc_createMultipleSeriesData(hcOptions, chartData, chartProps, isUI) {
  var series = [];
  if (isUI && isAccessibilityPatternsEnabled())
    hc_enableAccessibility(hcOptions, chartData, chartProps.chartType);
  var showYAxis;
  var yAxisProps = {};
  for (var i = 0; i < chartData.series.length; i++) {
    var yAxisIndex = 0;
    var seriesData = chartData.series[i];
    var seriesName = seriesData.series_name;
    var chartPropsSerie;
    if (!chartData.report_properties_series)
      chartPropsSerie = chartProps;
    else
      chartPropsSerie = chartData.report_properties_series[i];
    if (i > 0)
      yAxisIndex = hc_addYAxisIfNedded(hcOptions, chartProps, chartPropsSerie, seriesData, isUI, i);
    yAxisProps[i] = yAxisIndex;
    if ('sub_series' in seriesData) {
      var stackedSeries = hc_createStackedSeriesData(hcOptions, seriesData, chartProps, isUI, chartPropsSerie, i, yAxisIndex, chartData.series.length > 1);
      for (j = 0; j < stackedSeries.length; j++) {
        stackedSeries[j]['zIndex'] = 999 - i;
        hc_addYAxisMaxSeries(chartPropsSerie, hcOptions, seriesData, stackedSeries[j]['yAxis']);
      }
      series.push.apply(series, stackedSeries);
    } else {
      if (('yaxis_duration' in seriesData) && seriesData.yaxis_duration && hc_hasAxes(chartProps.chartType)) {
        var iYAxis = i;
        if (hcOptions.yAxis[i] == undefined)
          iYAxis = 0;
        if (hcOptions.yAxis[iYAxis].labels != undefined) {
          if (isUI)
            hcOptions.yAxis[iYAxis].labels.formatter = hc_formatDurationLabel;
          else
            hcOptions.yAxis[iYAxis].labels.formatter = 'hc_formatDurationLabel';
        }
      }
      var serie = {};
      var yMin = 0;
      serie['name'] = seriesName;
      serie['type'] = hc_getHighChartsType(seriesData.series_plot_type, chartPropsSerie.bar_unstack);
      serie['data'] = [];
      serie['zIndex'] = 999 - i;
      serie['stack'] = seriesName;
      serie['yAxis'] = 0;
      if (chartPropsSerie.show_y_axis === true)
        serie['yAxis'] = yAxisIndex;
      hc_addYAxisMaxSeries(chartPropsSerie, hcOptions, seriesData, serie['yAxis']);
      hc_seriesStyle(serie['type'], chartPropsSerie, serie, seriesData, isUI, i, false);
      var firstColor;
      for (var j = 0; j < seriesData.xvalues.length; j++) {
        if (j == 0)
          firstColor = seriesData.colors[0];
        var dataPoint = hc_createSingleSeriesDataPt(chartProps, j, seriesData, isUI, chartPropsSerie, firstColor, hcOptions);
        serie.data.push(dataPoint);
        if (dataPoint['y'] && dataPoint['y'] < yMin)
          yMin = dataPoint['y'];
      }
      serie['color'] = firstColor;
      if (isLineType(seriesData.series_plot_type) && (chartPropsSerie.y_axis_from === undefined ||
          chartPropsSerie.y_axis_from === '') &&
        (!hcOptions.yAxis[yAxisProps[i]].min || yMin < hcOptions.yAxis[yAxisProps[i]].min)) {
        hcOptions.yAxis[yAxisProps[i]].min = yMin;
      }
      if ("step_line" == seriesData.series_plot_type)
        serie['step'] = "center";
      series.push(serie);
    }
  }
  return series;
}

function hc_createHeatmapSeriesData(chartData, chartProps, isUI) {
  var chartPropsSerie = chartData.report_properties_series[0];
  var seriesData = chartData.series[0];
  var series = {};
  series['name'] = seriesData.series_name;
  series['type'] = hc_getHighChartsType(seriesData.series_plot_type, chartData.report_properties.bar_unstack);
  series['data'] = [];
  for (var j = 0; j < seriesData.series.data.length; j++) {
    var dataPoint = hc_createHeatmapSeriesDataPt(chartProps, j, seriesData, chartPropsSerie, isUI);
    series.data.push(dataPoint);
  }
  series['borderWidth'] = 0.5;
  series['borderColor'] = chartData.report_properties.axis_max_color;
  return series;
}

function hc_createMapSeriesData(hcOptions, chartData, chartProps, isUI) {
  var series;
  var mapData = chartData.report_properties_series[0].map_source;
  var map = JSON.parse(mapData.map_json);
  var isGeographicalMap = mapData.is_geographical_map;
  if (isGeographicalMap) {
    var useLatLon = mapData.use_lat_lon;
    if (useLatLon)
      series = hc_createMapSeriesDataLatLon(chartData, chartProps, map, isUI);
    else
      series = hc_createMapSeriesDataHcKey(hcOptions, chartData, chartProps, map, isUI);
  } else {
    series = hc_createMapSeriesDataHcKeyNonGeographical(chartData, chartProps, map, isUI);
  }
  return series;
}

function hc_createMapSeriesDataLatLon(chartData, chartProps, map, isUI) {
  var series = [];
  var serie = {};
  serie['mapData'] = map;
  serie['name'] = 'Basemap';
  serie['borderColor'] = '#C2C2C2';
  serie['showInLegend'] = false;
  series.push(serie);
  serie = {};
  serie['name'] = 'Separators';
  serie['type'] = 'mapline';
  serie['data'] = Highcharts.geojson(map, 'mapline');
  serie['color'] = '#C2C2C2';
  serie['showInLegend'] = false;
  serie['enableMouseTracking'] = false;
  series.push(serie);
  var dataArray = [];
  var seriesData = chartData.series[0];
  var seriesName = seriesData.series_name;
  var chartPropsSerie;
  if (chartData.report_properties_series == undefined)
    chartPropsSerie = chartProps;
  else
    chartPropsSerie = chartData.report_properties_series[0];
  serie = {};
  serie['name'] = seriesName;
  serie['type'] = 'mappoint';
  for (var j = 0; j < seriesData.xvalues.length; j++) {
    var data = hc_createSingleSeriesDataLocationPt(chartProps, j, seriesData, isUI, chartPropsSerie);
    dataArray.push(data);
  }
  serie['data'] = dataArray;
  series.push(serie);
  return series;
}

function hc_createMapSeriesDataHcKey(hcOptions, chartData, chartProps, map, isUI) {
  var dataArray = [];
  var seriesData = chartData.series[0];
  var seriesName = seriesData.series_name;
  var series = [];
  var serie = {};
  serie['mapData'] = map;
  serie['name'] = seriesName;
  serie['showInLegend'] = false;
  var joinBy = chartData.report_properties_series[0].map_source.join_by_column;
  serie['joinBy'] = [joinBy, 'name'];
  var chartPropsSerie;
  if (chartData.report_properties_series == undefined)
    chartPropsSerie = chartProps;
  else
    chartPropsSerie = chartData.report_properties_series[0];
  for (var j = 0; j < seriesData.xvalues.length; j++) {
    var data = hc_createSingleSeriesDataLocationHcKeyPt(chartProps, j, seriesData, isUI, chartPropsSerie);
    if (data['name'] !== '')
      dataArray.push(data);
  }
  serie['data'] = dataArray;
  if (serie['data'].length == 0)
    hcOptions.legend.enabled = false;
  series.push(serie);
  return series;
}

function hc_createMapSeriesDataHcKeyNonGeographical(chartData, chartProps, map, isUI) {
  var series = [];
  var serie = {};
  serie['type'] = 'map';
  serie['showInLegend'] = false;
  var joinBy = chartData.report_properties_series[0].map_source.join_by_column;
  serie['joinBy'] = [joinBy, 'name'];
  serie['mapData'] = map;
  var chartPropsSerie;
  if (chartData.report_properties_series == undefined)
    chartPropsSerie = chartProps;
  else
    chartPropsSerie = chartData.report_properties_series[0];
  var dataArray = [];
  var seriesData = chartData.series[0];
  for (var j = 0; j < seriesData.xvalues.length; j++) {
    var data = hc_createSingleSeriesDataLocationHcKeyPt(chartProps, j, seriesData, isUI, chartPropsSerie);
    dataArray.push(data);
  }
  serie['data'] = dataArray;
  series.push(serie);
  return series;
}

function hc_createBubbleSeriesData(chartData, chartProps, isUI) {
  var chartPropsSerie = chartData.report_properties_series[0];
  var seriesData = chartData.series[0];
  var bubbleSeriesData = [];
  for (var i = 0; i < seriesData.series.length; i++) {
    var series = {};
    series['name'] = seriesData.series[i].name;
    series['type'] = hc_getHighChartsType(seriesData.series_plot_type, chartData.report_properties.bar_unstack);
    series['data'] = [];
    for (var j = 0; j < seriesData.series[i].data.length; j++) {
      var dataPoint = hc_createBubbleSeriesDataPt(chartProps, j, seriesData.series[i].data, chartPropsSerie, isUI, seriesData.table_name);
      series.data.push(dataPoint);
    }
    bubbleSeriesData.push(series);
  }
  return bubbleSeriesData;
}

function addCustomPatterns(hcOptions) {
  var patterns = [{
    'id': 'custom-pattern-0',
    'path': {
      d: 'M 5 5 L 10 10 M 0 10 L 10 0',
      stroke: Highcharts.getOptions().colors[0],
      strokeWidth: 2
    }
  }, {
    'id': 'custom-pattern-1',
    'path': {
      d: 'M 0 0 L 5 5',
      stroke: Highcharts.getOptions().colors[2],
      strokeWidth: 3
    }
  }, {
    'id': 'custom-pattern-2',
    'path': {
      d: 'M 5 5 L 10 0',
      stroke: Highcharts.getOptions().colors[3],
      strokeWidth: 3
    }
  }, {
    'id': 'custom-pattern-3',
    'path': {
      d: 'M 0 8 L 8 0',
      stroke: Highcharts.getOptions().colors[4],
      strokeWidth: 8
    }
  }, {
    'id': 'custom-pattern-4',
    'path': {
      d: 'M 0 0 L 10 10 M 0 10 L 10 0',
      stroke: Highcharts.getOptions().colors[5],
      strokeWidth: 2
    }
  }, {
    'id': 'custom-pattern-5',
    'path': {
      d: 'M 1 0 L 0 5 M 0 5 L 8 5',
      stroke: Highcharts.getOptions().colors[7],
      strokeWidth: 2
    }
  }, {
    'id': 'custom-pattern-6',
    'path': {
      d: 'M 0 0 L 10 10 M 0 10 L 10 0 M 0 5 L 10 5 M 5 0 L 5 10',
      stroke: Highcharts.getOptions().colors[6],
      strokeWidth: 2
    }
  }, {
    'id': 'custom-pattern-7',
    'path': {
      d: 'M 4 4 L 4 5 M 4 5 L 5 5 M 5 5 L 5 4 M 5 4 L 4 4',
      stroke: Highcharts.getOptions().colors[8],
      strokeWidth: 5
    }
  }, {
    'id': 'custom-pattern-8',
    'path': {
      d: 'M 10 5 L 7 2 M 1 3 L 2 4',
      stroke: Highcharts.getOptions().colors[9],
      strokeWidth: 20
    }
  }, {
    'id': 'custom-pattern-9',
    'path': {
      d: 'M 2 8 L 6 2 M 6 2 L 8 8 M 8 8 L 2 8',
      stroke: Highcharts.getOptions().colors[1],
      strokeWidth: 2
    }
  }];
  hcOptions.defs = hcOptions.defs || {};
  hcOptions.defs.patterns = patterns;
  return hcOptions;
}

function getDashStyles() {
  return [
    'Solid',
    'ShortDash',
    'ShortDot',
    'ShortDashDot',
    'ShortDashDotDot',
    'Dot',
    'Dash',
    'LongDash',
    'DashDot',
    'LongDashDot',
    'LongDashDotDot'
  ];
}

function hc_enableAccessibility(hcOptions, chartData, chartType) {
  addCustomPatterns(hcOptions);
  chartData.series.forEach(function a11ySeries(serie, i) {
    chartData.series[i].colors.forEach(function a11yColor(color, j) {
      if (isLineType(chartType) && chartType !== 'line_bar' && chartType !== 'area')
        chartData.series[i].colors[j] = '#000';
      else
        chartData.series[i].colors[j] = j > 9 ? 'url(#custom-pattern-' + (j % 10) + ')' : 'url(#highcharts-default-pattern-' + (j % 10) + ')';
    });
  });
}

function hc_createSingleSeriesData(hcOptions, chartData, chartProps, isUI) {
  var seriesData = chartData.series[0];
  if (isUI && isAccessibilityPatternsEnabled())
    hc_enableAccessibility(hcOptions, chartData, chartProps.chartType);
  var chartPropSerie = chartData.report_properties_series[0];
  var seriesName = seriesData.series_name;
  if (('yaxis_duration' in seriesData) && seriesData.yaxis_duration && hc_hasAxes(chartProps.chartType)) {
    if (isUI)
      hcOptions.yAxis[0].labels.formatter = hc_formatDurationLabel;
    else
      hcOptions.yAxis[0].labels.formatter = 'hc_formatDurationLabel';
  }
  var series = {};
  var yMin = 0;
  series['name'] = seriesName;
  series['type'] = hc_getHighChartsType(seriesData.series_plot_type, chartData.report_properties.bar_unstack);
  series['data'] = [];
  if (chartProps.chartType == 'angular_gauge' || chartProps.chartType == 'solid_gauge') {
    var point = {};
    point.y = parseFloat(seriesData.yvalues);
    point.y_tooltip = seriesData.ydisplayvalues;
    point.displayvalue = seriesData.ydisplayvalues;
    point.table = seriesData.table_name;
    point.click_url_info = chartPropSerie.filter;
    if ('list_ui_view_name' in chartPropSerie)
      point['list_ui_view_name'] = chartPropSerie.list_ui_view_name;
    if ('report_drilldown' in chartPropSerie)
      point['report_drilldown'] = chartPropSerie.report_drilldown;
    if ('drill_open_new_win' in chartProps.report_properties)
      point['drill_open_new_win'] = chartProps.report_properties.drill_open_new_win;
    series.data.push(point);
    return series;
  }
  if (isLineType(seriesData.series_plot_type))
    series['color'] = seriesData.colors[0];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPoint = hc_createSingleSeriesDataPt(chartProps, j, seriesData, isUI, chartPropSerie, undefined, hcOptions);
    series.data.push(dataPoint);
    if (dataPoint['y'] && dataPoint['y'] < yMin)
      yMin = dataPoint['y'];
  }
  if (isLineType(chartProps.chartType) && (chartProps.report_properties.y_axis_from === undefined ||
      chartProps.report_properties.y_axis_from === ''))
    hcOptions.yAxis[0].min = yMin;
  if (chartProps.chartType == 'donut' || chartProps.chartType == 'semi_donut') {
    series['total'] = seriesData.display_human_readable_total;
    series['total_value'] = seriesData.display_grid_total;
  }
  return series;
}

function hc_hasAxes(chartType) {
  return !(chartType === 'angular_gauge' || chartType === 'solid_gauge' || chartType === 'pie' ||
    chartType === 'solid_gauge' || chartType === 'funnel' || chartType === 'donut' ||
    chartType === 'semi_donut' || chartType === 'pyramid');
}

function hc_createStackedSeriesData(hcOptions, seriesData, chartProps, isUI, chartPropsSerie, serieIndex, yAxisIndex, isMultiseries) {
  if (('yaxis_duration' in seriesData) && seriesData.yaxis_duration && hc_hasAxes(chartProps.chartType) && (yAxisIndex == 0 || (yAxisIndex > 0 && chartPropsSerie.show_y_axis == true))) {
    if (hcOptions.yAxis[yAxisIndex] == undefined) {
      hcOptions.yAxis[yAxisIndex] = {};
      hcOptions.yAxis[yAxisIndex].labels = {};
    }
    if (isUI)
      hcOptions.yAxis[yAxisIndex].labels.formatter = hc_formatDurationLabel;
    else
      hcOptions.yAxis[yAxisIndex].labels.formatter = 'hc_formatDurationLabel';
  }
  var x2Vals = seriesData.x2values;
  var x2Colors = seriesData.colors;
  var subSeriesList = seriesData.sub_series;
  var subSeriesDataArray = [];
  for (var j = 0; j < seriesData.xvalues.length; j++)
    subSeriesDataArray.push(subSeriesList[j]);
  var series = [];
  var yMin = 0;
  var isSlowMetricTable = hc_isSlowMetricChart(hcOptions, seriesData);
  hcOptions.yAxis[yAxisIndex].reversedStacks = chartPropsSerie.bar_unstack || false;
  for (var i = 0; i < x2Vals.length; i++) {
    var subseries = {};
    subseries.name = x2Vals[i];
    if (chartProps.report_properties != undefined && isMultiseries)
      subseries.name = '[' + seriesData.series_name + '] ' + subseries.name;
    subseries.data = [];
    subseries['type'] = hc_getHighChartsType(seriesData.series_plot_type, chartPropsSerie.bar_unstack);
    subseries['legend_label_max_length'] = chartPropsSerie.legend_label_max_size;
    subseries['id'] = seriesData.series_name;
    subseries['stack'] = seriesData.series_name;
    subseries['yAxis'] = yAxisIndex;
    if (isUI && isAccessibilityPatternsEnabled())
      subseries['dashStyle'] = getDashStyles()[i % x2Vals.length];
    if (chartPropsSerie.show_y_axis === true)
      subseries['yAxis'] = yAxisIndex;
    hc_seriesStyle(subseries['type'], chartPropsSerie, subseries, seriesData, isUI, serieIndex, true);
    hc_addPropsForDataLabelsTruncation(subseries, chartPropsSerie);
    var dataExistsForX2Val = false;
    var categoryIndx;
    var max = Number.MIN_VALUE;
    var min = Number.MAX_VALUE;
    var total = 0;
    var count = 0;
    for (var j = 0; j < seriesData.xvalues.length; j++) {
      var subSeriesData = subSeriesDataArray[j];
      categoryIndx = j;
      var dataPoint = hc_initStackedSeriesDataPoint(i, j, x2Vals, x2Colors, chartProps, seriesData.table_name, seriesData.table_display_plural, isUI, chartPropsSerie, seriesData, categoryIndx);
      var dataFilled = false;
      if (subSeriesData && subSeriesData.xvalues) {
        for (var k = 0; k < subSeriesData.xvalues.length; k++) {
          if (x2Vals[i] == subSeriesData.xvalues[k]) {
            dataExistsForX2Val = true;
            dataFilled = true;
            hc_fillStackedSeriesDataPoint(dataPoint, k, subSeriesData, chartProps, isUI, chartPropsSerie, categoryIndx, isSlowMetricTable, chartProps.xValues[j]);
            break;
          }
        }
      }
      if (!isSlowMetricTable || dataFilled) {
        subseries.data.push(dataPoint);
        if (isSlowMetricTable && dataPoint['y']) {
          max = Math.max(max, dataPoint['y']);
          min = Math.min(min, dataPoint['y']);
          total += dataPoint['y'];
          count++;
        }
      }
      if (dataPoint['y'] && dataPoint['y'] < yMin)
        yMin = dataPoint['y'];
    }
    if (isSlowMetricTable) {
      subseries.max = max;
      subseries.min = min;
      subseries.total = total;
      subseries.average = total / count;
    }
    if (seriesData.series_plot_type === 'step_line')
      subseries.step = 'center';
    if (dataExistsForX2Val) {
      subseries.color = x2Colors[i];
      series.push(subseries);
    }
  }
  if (isLineType(seriesData.series_plot_type) && (chartPropsSerie.y_axis_from === undefined || chartPropsSerie.y_axis_from === ''))
    hcOptions.yAxis[yAxisIndex].min = yMin;
  if (isSlowMetricTable) {
    series.sort(function(x, y) {
      return x.total - y.total;
    });
  }
  return series;
}

function hc_seriesStyle(type, chartPropsSerie, serie, seriesData, isUI, i, stacked) {
  if ('column' === type || 'bar' === type) {
    if (chartPropsSerie.bar_unstack === true)
      serie.stacking = '';
    else
      serie.stacking = 'normal';
  }
  if ('line' === type || 'area' === type || 'spline' === type) {
    var showMarker = chartPropsSerie.show_marker;
    serie.marker = {};
    serie.marker.enabled = showMarker
  }
  serie.color = seriesData.colors[i];
  if ('column' === type || 'bar' === type || isLineType(type) || 'trend' === type) {
    var dataLabelColor = '#606060';
    if (chartPropsSerie.show_chart_data_label === true) {
      serie.dataLabels = {};
      serie.dataLabels.enabled = true;
      serie.dataLabels.softConnector = false;
      serie.dataLabels.distance = 15;
      serie.dataLabels.style = {};
      serie.dataLabels.style.fontFamily = 'Arial';
      serie.dataLabels.style.fontSize = '10pt';
      serie.dataLabels.style.color = dataLabelColor;
      serie.dataLabels.style.fill = dataLabelColor;
      serie.dataLabels.style.fontWeight = 'normal';
      serie.dataLabels.inside = false;
      if (serie.sub_series != undefined)
        serie.dataLabels.inside = true;
      if ('font_family' in chartPropsSerie && chartPropsSerie.font_family != '')
        serie.dataLabels.style.fontFamily = chartPropsSerie.font_family;
      if ('font_size' in chartPropsSerie && chartPropsSerie.font_size != '')
        serie.dataLabels.style.fontSize = chartPropsSerie.font_size;
      if (isUI)
        serie.dataLabels.formatter = hc_formatValueLabel;
      else
        serie.dataLabels.formatter = 'hc_formatValueLabel';
    } else {
      serie.dataLabels = {};
      serie.dataLabels.enabled = false;
    }
  }
  if (isUI) {
    if (isLineType(type) || 'column' === type || 'bar' === type || 'horizontal_bar' === type) {
      serie.tooltip = {};
      if (stacked)
        serie.tooltip.tooltipText = 'stacked';
      else
        serie.tooltip.tooltipText = 'non-stacked';
    }
  }
}

function hc_createParetoCumulSeries(hcOptions, chartProps, series0, isUI) {
  var total = 0;
  var cumulative_totals = [];
  var cumulative_percent = [];
  for (var i = 0; i < series0.data.length; i++) {
    total = parseFloat(total) + parseFloat(series0.data[i].y);
    cumulative_totals.push(total);
  }
  var cuml_percent = 0;
  for (var i = 0; i < series0.data.length; i++) {
    var percent = parseFloat(series0.data[i].y) / parseFloat(total) * 100;
    cuml_percent = parseFloat(cuml_percent) + parseFloat(percent);
    var s = cuml_percent.toString();
    var k = s.indexOf('.');
    if (k >= 0) {
      var sub = s.substring(0, k);
      var rem = s.substring(k + 1);
      if (rem.length > 2) {
        sub += '.';
        for (var j = 0; j < 2; j++)
          sub += rem[j];
      } else
        sub += '.' + rem;
      cumulative_percent.push(sub);
    } else
      cumulative_percent.push(s);
  }
  var cumulative_series = {};
  cumulative_series.type = 'line';
  cumulative_series.name = 'pareto_series';
  cumulative_series.data = [];
  for (var i = 0; i < cumulative_totals.length; i++) {
    var dataPoint = {};
    dataPoint['y'] = cumulative_totals[i];
    dataPoint['percent'] = cumulative_percent[i];
    cumulative_series.data.push(dataPoint);
  }
  hc_addParetoChartOptions(hcOptions, chartProps, total, isUI);
  return cumulative_series;
}

function hc_createSingleSeriesDataPt(chartProps, indx, seriesData, isUI, chartSerieProps, color, hcOptions) {
  var yVal;
  var dataPoint = {};
  dataPoint['legend_label_max_length'] = chartProps.report_properties.legend_label_max_size;
  dataPoint['name'] = seriesData.xvalues[indx];
  if (chartProps.origXValues[indx] == chartProps.otherKey)
    dataPoint['name'] = chartProps.xValues[indx];
  if (seriesData.yvalues[indx] !== undefined && seriesData.yvalues[indx])
    yVal = parseFloat(seriesData.yvalues[indx]);
  else
    yVal = null;
  var dataPointName = dataPoint['name'];
  if (dataPointName.length > chartProps.maxAllowedLabelLen) {
    dataPointName = dataPointName.substring(0, chartProps.maxAllowedLabelLen - 3) + '...';
  }
  if (hc_isSlowMetricChart(hcOptions, seriesData))
    dataPoint['x'] = hc_convertDateTimeFormatToUnixTime(seriesData.xvalues[indx]);
  else
    dataPoint['x'] = indx;
  dataPoint['y'] = yVal;
  if (!isLineType(seriesData.series_plot_type))
    dataPoint['color'] = seriesData.colors[indx];
  else
    dataPoint['color'] = color;
  dataPoint['y_tooltip'] = seriesData.ydisplayvalues[indx];
  dataPoint['valid'] = (seriesData.valids != undefined ? (seriesData.valids[indx] === "true") : true);
  if (isUI) {
    dataPoint['table'] = seriesData.table_name;
    dataPoint['table_display_plural'] = seriesData.table_display_plural;
    if (chartProps.origXValues[indx] == chartProps.otherKey)
      dataPoint['isOther'] = true;
    else
      dataPoint['isOther'] = false;
    if (chartProps.chartType == 'hist') {
      dataPoint['tt_label_min'] = chartProps.report_properties.hist_min;
      dataPoint['tt_label_max'] = chartProps.report_properties.hist_max;
      dataPoint['tt_label_cnt'] = chartProps.report_properties.hist_count;
    }
    if ('percents_from_count' in chartProps.report_properties && chartProps.report_properties.percents_from_count)
      dataPoint['percent_count'] = true;
    else
      dataPoint['percent_count'] = false;
    if ('percentages' in seriesData && seriesData.percentages[indx])
      dataPoint['percent'] = seriesData.percentages[indx];
    generateSeriesUrlInfo(dataPoint, indx, dataPoint['isOther'], seriesData, chartSerieProps, undefined, chartProps, seriesData['table_name']);
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] = chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] = chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] = chartProps.report_properties.translation.click_to_open;
    }
  } else if (chartProps.chartType == 'pie' || chartProps.chartType == 'semi_donut' || chartProps.chartType == 'donut' ||
    chartProps.chartType == 'funnel' || chartProps.chartType == 'pyramid') {
    if ('percentages' in seriesData)
      dataPoint['percent'] = seriesData.percentages[indx];
  }
  hc_addPropsForDataLabelsTruncation(dataPoint, chartProps.report_properties);
  return dataPoint;
}

function isVariablesGroupby(groupby) {
  return groupby && groupby.startsWith('variables.');
}

function removeNonConditionTerms(filter) {
  var ignoreExpressions = [/^\s*$/, /^ORDERBY/, /^ORDERBYDESC/, /^GROUPBY/, /^TRENDBY/];
  if (!filter)
    return "";
  var terms = filter.split('^');
  var validTerms = [];
  for (var i = 0; i < terms.length; i++) {
    if (isToBeIgnored(terms[i], ignoreExpressions))
      continue;
    validTerms.push(terms[i]);
  }
  var validFilter = validTerms.join('^');
  if (validFilter && validFilter.endsWith('^EQ'))
    validFilter = validFilter.substring(0, validFilter.length - 3);
  return validFilter;
}

function isToBeIgnored(value, ignoreExpressions) {
  for (i = 0; i < ignoreExpressions.length; i++) {
    if (ignoreExpressions[i].test(value))
      return true;
  }
  return false;
}

function combineQueries(filter, aggregateQuery) {
  if (!filter)
    return aggregateQuery;
  if (!aggregateQuery)
    return filter;
  var filterQueries = filter.split('^NQ');
  for (var i = 0; i < filterQueries.length; i++)
    filterQueries[i] += "^" + aggregateQuery;
  return filterQueries.join("^NQ");
}

function generateSeriesUrlInfo(dataPoint, indx, isOther, seriesData, chartSerieProps, aggregateQueryPerSeries, chartProps, tableName) {
  if (isOther) {
    dataPoint['click_url_info'] = generateOtherUrlInfo(indx, chartProps, tableName, chartSerieProps);
    return;
  }
  var categoryItemCondition = '';
  if (isVariablesGroupby(chartSerieProps.groupby) && chartSerieProps.sc_groupby_item_id)
    categoryItemCondition = "^cat_item=" + chartSerieProps.sc_groupby_item_id;
  if (!categoryItemCondition && chartSerieProps.stackby &&
    isVariablesGroupby(chartSerieProps.stackby) && chartSerieProps.sc_stackby_item_id) {
    categoryItemCondition = "^cat_item=" + chartSerieProps.sc_stackby_item_id;
  }
  var aggregateQuery = aggregateQueryPerSeries ? seriesData[indx].aggregate_query : seriesData.aggregate_query[indx];
  var filter = removeNonConditionTerms(chartSerieProps.filter);
  dataPoint['click_url_info'] = combineQueries(combineQueries(filter, categoryItemCondition), aggregateQuery);
  var publisherFilter = removeNonConditionTerms(chartProps.report_properties.publisher_filter);
  dataPoint['publisher_filter'] = combineQueries(combineQueries(publisherFilter, categoryItemCondition), aggregateQuery);
}

function generateOtherUrlInfo(indx, chartProps, tableName, chartSerieProps) {
  var urlObj = {};
  var urlString = 'report_viewer.do?';
  var pagenum = parseInt(chartProps.page_num) + 1;
  if (chartSerieProps.report_id) {
    urlObj = {
      "jvar_report_id": [chartSerieProps.report_id],
      "sysparm_other_series": [chartSerieProps.report_id],
      "sysparm_page_num": [pagenum],
    };
    if (chartProps.interactive_report)
      urlObj.sysparm_interactive_report = chartProps.interactive_report;
  } else {
    var reportProps = chartProps.report_properties;
    if (reportProps) {
      urlObj = {
        "sysparm_bar_unstack": [chartSerieProps.bar_unstack],
        "sysparm_show_chart_total": [reportProps.show_chart_total],
        "sysparm_show_other": [chartProps.show_other],
        "sysparm_lower_limit": [reportProps.lower_limit],
        "sysparm_title": [chartProps.title],
        "sysparm_table": [tableName],
        "sysparm_compute_percent": [reportProps.percents_from_count],
        "sysparm_custom_chart_size": [reportProps.custom_chart_size],
        "sysparm_color_palette": [chartSerieProps.color_palette],
        "sysparm_gauge_autoscale": [reportProps.gauge_autoscale],
        "sysparm_aggregate": [chartProps.aggType],
        "sysparm_show_marker": [chartSerieProps.show_marker],
        "sysparm_show_chart_data_label": [reportProps.show_chart_data_label],
        "sysparm_page_num": [pagenum],
        "sysparm_type": [chartProps.chartType],
        "sysparm_chart_size": [chartProps.chartSize],
        "sysparm_direction": [reportProps.direction],
        "sysparm_field": [chartSerieProps.groupby],
        "sysparm_set_color": [chartSerieProps.set_color],
        "sysparm_funnel_neck_percent": [reportProps.funnel_neck_percent],
        "sysparm_from": [reportProps.from],
        "sysparm_donut_width_percent": [reportProps.donut_width_percent],
        "sysparm_others": [chartProps.other_threshold],
        "sysparm_chart_color": [chartSerieProps.color],
        "sysparm_display_grid": [chartProps.display_grid],
        "sysparm_to": [reportProps.to],
        "sysparm_upper_limit": [reportProps.upper_limit],
        "sysparm_box_field": [chartProps.box_field],
        "sysparm_query": [chartProps.filter_with_orderby],
        "sysparm_sumfield": [chartProps.agg_field],
        "sysparm_stack_field": [chartProps.stack_field],
        "sysparm_trend_field": [chartProps.trend_field],
        "sysparm_trend_interval": [chartProps.trend_interval],
        "sysparm_chart_colors": [chartProps.colors]
      };
      if (reportProps.custom_chart_size) {
        urlObj.sysparm_custom_chart_height = chartProps.chart_height;
        urlObj.sysparm_custom_chart_width = chartProps.chart_width;
      }
    }
  }
  return urlString + jQuery.param(urlObj, true);
}

function hc_createSingleSeriesDataLocationPt(chartProps, indx, seriesData, isUI, chartSerieProps) {
  if (typeof seriesData.locations[indx] === 'undefined')
    return;
  var dataPoint = {};
  dataPoint['legend_label_max_length'] = chartProps.report_properties.legend_label_max_size;
  dataPoint['name'] = seriesData.locations[indx].city;
  dataPoint['street'] = seriesData.locations[indx].street;
  dataPoint['city'] = seriesData.locations[indx].city;
  dataPoint['state'] = seriesData.locations[indx].state;
  dataPoint['country'] = seriesData.locations[indx].country;
  dataPoint['lat'] = seriesData.locations[indx].latitude;
  dataPoint['lon'] = seriesData.locations[indx].longitude;
  dataPoint['valid'] = (seriesData.valids != undefined ? (seriesData.valids[indx] === "true") : true);
  dataPoint['y_tooltip'] = seriesData.ydisplayvalues[indx];
  if (isUI) {
    dataPoint['table'] = seriesData.table_name;
    dataPoint['table_display_plural'] = seriesData.table_display_plural;
    if (chartProps.origXValues[indx] == chartProps.otherKey)
      dataPoint['isOther'] = true;
    else
      dataPoint['isOther'] = false;
    if ('percents_from_count' in chartProps.report_properties && chartProps.report_properties.percents_from_count)
      dataPoint['percent_count'] = true;
    else
      dataPoint['percent_count'] = false;
    if ('percentages' in seriesData && seriesData.percentages[indx])
      dataPoint['percent'] = seriesData.percentages[indx];
    if ('click_url_info' in seriesData && seriesData.click_url_info[indx])
      dataPoint['click_url_info'] = seriesData.click_url_info[indx];
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
    if ('report_drilldown_zoom' in chartSerieProps)
      dataPoint['report_drilldown_zoom'] = chartSerieProps.report_drilldown_zoom;
    if ('report_drilldown_map' in chartSerieProps)
      dataPoint['report_drilldown_map'] = chartSerieProps.report_drilldown_map;
    dataPoint['isLatLon'] = true;
    dataPoint['show_data_label'] = chartSerieProps.show_chart_data_label;
    dataPoint['show_geographical_label'] = chartSerieProps.show_geographical_label;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] = chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] = chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] = chartProps.report_properties.translation.click_to_open;
    }
  }
  hc_addPropsForDataLabelsTruncation(dataPoint, chartProps.report_properties);
  return dataPoint;
}

function hc_createSingleSeriesDataLocationHcKeyPt(chartProps, indx, seriesData, isUI, chartSerieProps) {
  if (typeof seriesData.locations[indx] === 'undefined')
    return;
  var dataPoint = {};
  dataPoint['name'] = seriesData.locations[indx].name;
  dataPoint['y_tooltip'] = seriesData.ydisplayvalues[indx];
  dataPoint['value'] = seriesData.yvalues[indx];
  dataPoint['display_value'] = seriesData.ydisplayvalues[indx];
  if (isUI) {
    dataPoint['table'] = seriesData.table_name;
    dataPoint['table_display_plural'] = seriesData.table_display_plural;
    if (chartProps.origXValues[indx] == chartProps.otherKey)
      dataPoint['isOther'] = true;
    else
      dataPoint['isOther'] = false;
    if ('percents_from_count' in chartProps.report_properties && chartProps.report_properties.percents_from_count)
      dataPoint['percent_count'] = true;
    else
      dataPoint['percent_count'] = false;
    if ('percentages' in seriesData && seriesData.percentages[indx])
      dataPoint['percent'] = seriesData.percentages[indx];
    if ('click_url_info' in seriesData && seriesData.click_url_info[indx])
      dataPoint['click_url_info'] = seriesData.click_url_info[indx];
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
    if ('report_drilldown_zoom' in chartSerieProps)
      dataPoint['report_drilldown_zoom'] = chartSerieProps.report_drilldown_zoom;
    if ('report_drilldown_map' in chartSerieProps)
      dataPoint['report_drilldown_map'] = chartSerieProps.report_drilldown_map;
    dataPoint['isLatLon'] = false;
    dataPoint['show_data_label'] = chartSerieProps.show_chart_data_label;
    dataPoint['show_geographical_label'] = chartSerieProps.show_geographical_label;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] = chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] = chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] = chartProps.report_properties.translation.click_to_open;
    }
  }
  return dataPoint;
}

function hc_createHeatmapSeriesDataPt(chartProps, indx, seriesData, chartSerieProps, isUI) {
  var xIndex = 0,
    yIndex = 1,
    valueIndex = 2,
    displayValueIndex = 3,
    tooltipIndex = 4,
    clickUrlIndex = 5;
  var val;
  var dataPoint = {};
  dataPoint['legend_label_max_length'] = chartProps.report_properties.legend_label_max_size;
  dataPoint['name'] = chartProps.origXValues[indx];
  dataPoint['x'] = seriesData.series.data[indx][xIndex];
  dataPoint['y'] = seriesData.series.data[indx][yIndex];
  if (seriesData.series.data[indx][valueIndex] === null)
    val = 0;
  else
    val = parseFloat(seriesData.series.data[indx][valueIndex]);
  dataPoint['value'] = val;
  if (seriesData.series.data[indx][displayValueIndex])
    dataPoint['value_display'] = seriesData.series.data[indx][displayValueIndex];
  else
    dataPoint['value_display'] = '0';
  if (dataPoint['value_display'] === '0' && chartProps.report_properties.show_zero === false)
    dataPoint['value_display'] = '';
  if (isUI) {
    dataPoint['table'] = seriesData.table_name;
    dataPoint['isOther'] = false;
    dataPoint['percent_count'] = false;
    if (seriesData.series.data[indx][clickUrlIndex]) {
      dataPoint['click_url_info'] = generateHeatMapClickUrl(seriesData, indx, clickUrlIndex);
    }
    if (seriesData.series.data[indx][tooltipIndex])
      dataPoint['value_tooltip'] = seriesData.series.data[indx][tooltipIndex];
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] = chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] = chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] = chartProps.report_properties.translation.click_to_open;
    }
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
  }
  hc_addPropsForDataLabelsTruncation(dataPoint, chartProps.report_properties);
  return dataPoint;
}

function generateHeatMapClickUrl(seriesData, indx, clickUrlIndex) {
  var showOther = seriesData.sysparm_show_other;
  var xAxisCategoryCount = seriesData.xAxisCategories.length;
  var aggregateQuery = seriesData.series.data[indx][clickUrlIndex];
  var filter = removeNonConditionTerms(seriesData.filter);
  if (showOther && (indx + 1) % xAxisCategoryCount === 0 && seriesData.otherQuery) {
    aggregateQuery = aggregateQuery + "^" + seriesData.otherQuery;
  }
  return combineQueries(filter, aggregateQuery);
}

function hc_createBubbleSeriesDataPt(chartProps, indx, seriesData, chartSerieProps, isUI, table_name) {
  var dataPoint = {};
  dataPoint['name'] = chartProps.origXValues[indx];
  dataPoint['x'] = seriesData[indx]['x'];
  dataPoint['y'] = seriesData[indx]['y'];
  dataPoint['z'] = seriesData[indx]['z'];
  dataPoint['value_display'] = seriesData[indx]['value_display'];
  if (isUI) {
    dataPoint['table'] = table_name;
    generateSeriesUrlInfo(dataPoint, indx, false, seriesData, chartSerieProps, true, chartProps, dataPoint['table']);
    dataPoint['value_tooltip'] = seriesData[indx]['value_tooltip'];
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] = chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] = chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] = chartProps.report_properties.translation.click_to_open;
    }
  }
  return dataPoint;
}

function hc_initStackedSeriesDataPoint(indx, indx2, x2Vals, x2Colors, chartProps, tblName, tblDispPlural, isUI, serieProps, seriesData, categoryIndx) {
  var dataPoint = {};
  if (categoryIndx != undefined)
    dataPoint['x'] = categoryIndx;
  dataPoint['y'] = serieProps.use_null ? null : 0;
  dataPoint['name'] = x2Vals[indx];
  dataPoint['color'] = x2Colors[indx];
  dataPoint['table'] = tblName;
  dataPoint['table_display_plural'] = tblDispPlural;
  dataPoint['isOther'] = false;
  if (chartProps.origXValues[indx2] == chartProps.otherKey)
    dataPoint['isOther'] = true;
  dataPoint['valid'] = false;
  hc_addPropsForDataLabelsTruncation(dataPoint, serieProps);
  return dataPoint;
}

function hc_fillStackedSeriesDataPoint(dataPoint, indx, subSeriesData, chartProps, isUI, chartPropsSerie, categoryIndx, isSlowMetricTable, datetime) {
  dataPoint['valid'] = true;
  if ('percents_from_count' in chartPropsSerie && chartPropsSerie.percents_from_count)
    dataPoint['percent_count'] = true;
  else
    dataPoint['percent_count'] = false;
  if (categoryIndx != undefined)
    dataPoint['x'] = categoryIndx;
  dataPoint['y'] = subSeriesData.yvalues[indx] ? parseFloat(subSeriesData.yvalues[indx]) : null;
  dataPoint['y_tooltip'] = subSeriesData.ydisplayvalues[indx];
  dataPoint['percent'] = subSeriesData.percentages[indx];
  if (isUI) {
    if (dataPoint['isOther'] || (subSeriesData.aggregate_query && subSeriesData.aggregate_query[indx]))
      generateSeriesUrlInfo(dataPoint, indx, dataPoint['isOther'], subSeriesData, chartPropsSerie, undefined, chartProps, dataPoint['table']);
    dataPoint['list_ui_view_name'] = chartPropsSerie.list_ui_view_name;
    dataPoint['report_drilldown'] = chartPropsSerie.report_drilldown;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] = chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] = chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] = chartProps.report_properties.translation.click_to_open;
    }
  }
  if (isSlowMetricTable) {
    dataPoint['x'] = hc_convertDateTimeFormatToUnixTime(datetime);
  }
}

function hc_createLineSeriesData(hcOptions, chartData, chartProps, isUI) {
  return hc_createMultipleSeriesData(hcOptions, chartData, chartProps, isUI);
}

function hc_createControlSeriesData(hcOptions, chartData, chartProps, isUI) {
  var seriesData = chartData.series[0];
  var chartSerieProps = chartData.report_properties_series[0];
  var series = [];
  if (('yaxis_duration' in seriesData) && seriesData.yaxis_duration && hc_hasAxes(chartProps.chartType)) {
    if (isUI)
      hcOptions.yAxis[0].labels.formatter = hc_formatDurationLabel;
    else
      hcOptions.yAxis[0].labels.formatter = 'hc_formatDurationLabel';
  }
  var dataPtSeries = {};
  dataPtSeries.name = 'Data Points';
  dataPtSeries.color = 'black';
  dataPtSeries.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPoint = {};
    dataPoint['y'] = seriesData.yvalues[j] ? parseFloat(seriesData.yvalues[j]) : null;
    dataPoint['y_tooltip'] = seriesData.ydisplayvalues[j];
    dataPoint['table'] = seriesData.table_name;
    dataPoint['table_display_plural'] = seriesData.table_display_plural;
    if (isUI) {
      if ('aggregate_query' in seriesData)
        generateSeriesUrlInfo(dataPoint, j, false, seriesData, chartSerieProps, false, chartProps);
      if ('list_ui_view_name' in chartSerieProps)
        dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
      if ('report_drilldown' in chartSerieProps)
        dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
      dataPoint['drill_open_new_win'] = false;
      if ('drill_open_new_win' in chartProps.report_properties)
        dataPoint['drill_open_new_win'] = chartProps.report_properties.drill_open_new_win;
      if ('widget_navigation' in chartProps.report_properties) {
        dataPoint['widget_navigation'] = chartProps.report_properties.widget_navigation;
        dataPoint['widget_navigation_tooltip_text'] = chartProps.report_properties.translation.click_to_open;
      }
    }
    hc_addPropsForDataLabelsTruncation(dataPoint, chartProps.report_properties);
    dataPtSeries.data.push(dataPoint);
  }
  series.push(dataPtSeries);
  var trendLineSeries = {};
  trendLineSeries.name = 'Trend Line';
  if (isUI && isAccessibilityPatternsEnabled()) {
    trendLineSeries.dashStyle = 'LongDashDot'
    trendLineSeries.color = '#000';
  } else
    trendLineSeries.color = 'yellow';
  trendLineSeries.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPt = {};
    var y = parseFloat(seriesData.trendvalues[j]);
    dataPt.y = y;
    dataPt.y_tooltip = seriesData.trenddisplayvalues[j];
    hc_addPropsForDataLabelsTruncation(dataPt, chartProps.report_properties);
    trendLineSeries.data.push(dataPt);
  }
  series.push(trendLineSeries);
  var controlVals = seriesData.controlvalues;
  var displayVals = [];
  displayVals.push(seriesData.controldisplayvalues[0]);
  displayVals.push(seriesData.controldisplayvalues[1]);
  displayVals.push(seriesData.controldisplayvalues[2]);
  displayVals.push(seriesData.controldisplayvalues[3]);
  displayVals.push(seriesData.controldisplayvalues[4]);
  series.push(hc_createControlPlotLine('-3Z', 'red', parseFloat(controlVals[0]), displayVals[0], chartProps, isUI));
  series.push(hc_createControlPlotLine('-2Z', 'green', parseFloat(controlVals[1]), displayVals[1], chartProps, isUI));
  series.push(hc_createControlPlotLine('Mean', 'blue', parseFloat(controlVals[2]), displayVals[2], chartProps, isUI));
  series.push(hc_createControlPlotLine('+2Z', 'green', parseFloat(controlVals[3]), displayVals[3], chartProps, isUI));
  series.push(hc_createControlPlotLine('+3Z', 'red', parseFloat(controlVals[4]), displayVals[4], chartProps, isUI));
  return series;
}

function hc_createControlPlotLine(label, color, val, disp, chartProps, isUI) {
  var series = {};
  series.name = label;
  if (isUI && isAccessibilityPatternsEnabled()) {
    if (color === 'red')
      series.dashStyle = 'Dot';
    else if (color === 'green')
      series.dashStyle = 'ShortDash';
    else
      series.dashStyle = 'Dash';
    series.color = '#000';
  } else
    series.color = color;
  series.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPt = {};
    dataPt.y = val;
    dataPt.y_tooltip = disp;
    dataPt.marker = {};
    dataPt.marker.enabled = false;
    hc_addPropsForDataLabelsTruncation(dataPt, chartProps.report_properties);
    series.data.push(dataPt);
  }
  return series;
}

function hc_createBoxPlotData(hcOptions, chartData, chartProps, isUI) {
  var seriesData = chartData.series[0];
  var seriesName = seriesData.series_name + ':box';
  if (('yaxis_duration' in seriesData) && seriesData.yaxis_duration && hc_hasAxes(chartProps.chartType)) {
    if (isUI)
      hcOptions.yAxis[0].labels.formatter = hc_formatDurationLabel;
    else
      hcOptions.yAxis[0].labels.formatter = 'hc_formatDurationLabel';
  }
  var boxseries = {};
  boxseries.name = seriesName;
  if ('box_color' in chartProps.report_properties)
    boxseries.color = chartProps.report_properties.box_color;
  boxseries.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var boxValArray = [];
    var boxDisplayValArray = [];
    boxDisplayValArray = seriesData.boxdisplayvalues[j];
    if (isUI)
      boxValArray = seriesData.boxvalues[j].split(',');
    else
      boxValArray = hc_strToArray(seriesData.boxvalues[j], ',');
    var boxVals = {};
    boxVals.low = parseFloat(boxValArray[0]);
    boxVals.q1 = parseFloat(boxValArray[1]);
    boxVals.median = parseFloat(boxValArray[2]);
    boxVals.q3 = parseFloat(boxValArray[3]);
    boxVals.high = parseFloat(boxValArray[4]);
    boxVals.low_display = boxDisplayValArray[0];
    boxVals.q1_display = boxDisplayValArray[1];
    boxVals.median_display = boxDisplayValArray[2];
    boxVals.q3_display = boxDisplayValArray[3];
    boxVals.high_display = boxDisplayValArray[4];
    boxseries.data.push(boxVals);
  }
  if (isUI) {
    boxseries.tooltip = {};
    boxseries.tooltip.pointFormat = '<span style="color:{series.color};font-weight:bold">{series.name}</span><br/>' +
      chartProps.report_properties.box_max + ': {point.high_display}<br/>' +
      chartProps.report_properties.box_q3 + ': {point.q3_display}<br/>' +
      chartProps.report_properties.box_median + ': {point.median_display}<br/>' +
      chartProps.report_properties.box_q1 + ': {point.q1_display}<br/>' +
      chartProps.report_properties.box_min + ': {point.low_display}<br/>';
  }
  return boxseries;
}

function hc_createBoxMeanData(hcOptions, chartData, chartProps, isUI) {
  var seriesData = chartData.series[0];
  var seriesName = seriesData.series_name + ':mean';
  var meanseries = {};
  meanseries.name = seriesName;
  meanseries.type = 'scatter';
  if ('box_mean_color' in chartProps.report_properties)
    meanseries.color = chartProps.report_properties.box_mean_color;
  meanseries.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPoint = [];
    dataPoint.push(j);
    dataPoint.push(parseFloat(seriesData.yvalues[j]));
    meanseries.data.push(dataPoint);
  }
  if (isUI) {
    meanseries.tooltip = {};
    meanseries.tooltip.pointFormat = chartProps.report_properties.box_mean + ': {point.y}';
  }
  return meanseries;
}

function hc_isPresentInArray(arr, key) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === key)
      return i;
  }
  return -1;
}

function hc_strToArray(str, delim) {
  var arr = [];
  var indx = str.indexOf(delim);
  while (indx >= 0) {
    var elem = str.substring(0, indx);
    arr.push(elem);
    str = str.substring(indx + 1);
    indx = str.indexOf(delim);
  }
  str = str.trim();
  if (str.length > 0)
    arr.push(str);
  return arr;
}

function hc_dataPointSelected(event) {
  var gridWindow = getGridWindow(this.series.chart.userOptions.publisher_id, this.series.chart.userOptions.report_id);
  gridWindow.interactiveFilters = gridWindow.interactiveFilters || {};
  if (typeof this.publisher_filter === 'undefined' || event.accumulate === 'preventDataPointSelect')
    return;
  var queryCondition = this.publisher_filter.replace('^', '^EQ^');
  var uniqueId = getDashboardMessageHandlerId(this.series.chart.userOptions.publisher_id, this.series.chart.userOptions.report_id) + queryCondition;
  var filterMessage = hc_interactiveFilterMessage(uniqueId, this.table, queryCondition);
  filterMessage.sliced = true;
  if (gridWindow.queryCondition) {
    var oldUniqueId = getDashboardMessageHandlerId(this.series.chart.userOptions.publisher_id, this.series.chart.userOptions.report_id) + gridWindow.queryCondition;
    delete gridWindow.interactiveFilters[oldUniqueId];
  }
  gridWindow.queryCondition = queryCondition;
  gridWindow.interactiveFilters[uniqueId] = filterMessage;
  hc_dataPointPublishFilter(this.series.chart.userOptions.report_id, gridWindow.interactiveFilters, gridWindow._dashboardMessageHandler);
}

function hc_dataPointUnselected(event) {
  var gridWindow = getGridWindow(this.series.chart.userOptions.publisher_id, this.series.chart.userOptions.report_id);
  if (typeof this.publisher_filter === 'undefined' || (typeof event.accumulate === 'undefined' && event.type === 'unselect'))
    return;
  gridWindow.interactiveFilters = gridWindow.interactiveFilters || {};
  var queryCondition = this.publisher_filter.replace('^', '^EQ^');
  var uniqueId = getDashboardMessageHandlerId(this.series.chart.userOptions.publisher_id, this.series.chart.userOptions.report_id) + queryCondition;
  delete gridWindow.interactiveFilters[uniqueId];
  hc_dataPointPublishFilter(this.series.chart.userOptions.report_id, gridWindow.interactiveFilters, gridWindow._dashboardMessageHandler);
}

function hc_FilterPublisher(reportId, filter, dashboardMessageHandler) {
  var filterMessages = [];
  for (var key in filter) {
    filterMessages.push(filter[key]);
  }
  var handler = dashboardMessageHandler || new DashboardMessageHandler(reportId);
  var isInCanvas = window.SNC && SNC.canvas && SNC.canvas.interactiveFilters && SNC.canvas.isGridCanvasActive;
  if (filterMessages.length > 0) {
    handler.publishMessage(filterMessages);
    if (isInCanvas)
      SNC.canvas.interactiveFilters.addFilterToDefaultValues(reportId, filterMessages);
  } else {
    if (isInCanvas)
      SNC.canvas.interactiveFilters.removeFilterFromDefaultValues(reportId);
    handler.removeFilter();
  }
};

function hc_dataPointPublishFilter(reportId, filter, dashboardMessageHandler) {
  var currentFilterPublishedTime = Date.now();
  if (isRenderedInCanvas()) {
    SNC.canvas.chartsActingAsFilters = SNC.canvas.chartsActingAsFilters || {};
    SNC.canvas.chartsActingAsFilters.lastPublishTime = SNC.canvas.chartsActingAsFilters.currentPublishTime || currentFilterPublishedTime;
    SNC.canvas.chartsActingAsFilters.currentPublishTime = currentFilterPublishedTime;
    SNC.canvas.chartsActingAsFilters.previousId = SNC.canvas.chartsActingAsFilters.currentId || null;
    SNC.canvas.chartsActingAsFilters.currentId = reportId || null;
  }
  hc_FilterPublisher(reportId, filter, dashboardMessageHandler);
}

function hc_interactiveFilterMessage(uniqueId, table, filter) {
  var filter_message = {};
  filter_message.id = uniqueId;
  filter_message.table = table;
  filter_message.filter = filter;
  return filter_message;
}

function hc_dataPointLegendClick(event) {
  var gridWindow = getGridWindow(this.series.chart.userOptions.publisher_id, this.series.chart.userOptions.report_id);
  gridWindow.interactiveFilters = gridWindow.interactiveFilters || {};
  var uniqueId = getDashboardMessageHandlerId(this.series.chart.userOptions.publisher_id, this.series.chart.userOptions.report_id);
  var filtersFromLegend = {};
  if (gridWindow.filtersFromLegend)
    filtersFromLegend = gridWindow.filtersFromLegend;
  var selected = jQuery.grep(this.series.points, function(obj) {
    if (event.target == obj && obj.visible)
      filtersFromLegend[obj.publisher_filter] = obj.publisher_filter;
    return event.target == obj ? !obj.visible : obj.visible
  });
  if (selected.length == this.series.points.length) {
    delete gridWindow.interactiveFilters[uniqueId];
    delete gridWindow.filtersFromLegend;
  } else {
    var queryArr = jQuery.map(selected, function(val, index) {
      return val.publisher_filter;
    });
    var queryCondition = queryArr.join('^NQ');
    var filterMessage = hc_interactiveFilterMessage(uniqueId, this.table, queryCondition);
    gridWindow.interactiveFilters[uniqueId] = filterMessage;
    gridWindow.filtersFromLegend = filtersFromLegend;
  }
  hc_dataPointPublishFilter(this.series.chart.userOptions.report_id, gridWindow.interactiveFilters);
}

function getDashboardMessageHandlerId(publisherId, reportId) {
  var dashboardMesssageHandlerId = '';
  if (typeof glideGrid != "undefined") {
    var gridWindow = glideGrid.getWindowByGaugeId(publisherId);
    if (typeof gridWindow != 'undefined' && gridWindow != null && gridWindow)
      dashboardMesssageHandlerId = publisherId;
    else
      dashboardMesssageHandlerId = reportId;
  } else if (window.SNC && SNC.canvas && SNC.canvas.canvasUtils && SNC.canvas.isGridCanvasActive) {
    var gridWindow = SNC.canvas.canvasUtils.getGlideWindow(reportId);
    if (typeof gridWindow != 'undefined' && gridWindow != null && gridWindow)
      dashboardMesssageHandlerId = reportId;
    else
      dashboardMesssageHandlerId = publisherId;
  }
  return dashboardMesssageHandlerId;
}

function getGridWindow(publisherId, reportId) {
  var gridWindow;
  if (typeof glideGrid != "undefined") {
    gridWindow = glideGrid.getWindowByGaugeId(publisherId);
    if (typeof gridWindow === 'undefined' || gridWindow == null) {
      gridWindow = glideGrid.getWindowByGaugeId(reportId);
    }
  } else if (window.SNC && SNC.canvas && SNC.canvas.canvasUtils && SNC.canvas.isGridCanvasActive) {
    gridWindow = SNC.canvas.canvasUtils.getGlideWindow(reportId);
  } else {
    gridWindow = glideGrid.getWindowByGaugeId(reportId);
  }
  return gridWindow;
}

function hc_dataPointClicked(event) {
  var point = event.point || event.target;
  if (!point || point.valid === false || typeof point.click_url_info === "undefined")
    return;
  var openNewTab;
  if (event.ctrlKey || event.metaKey)
    openNewTab = true;
  if (point.widget_navigation && point.widget_navigation.length) {
    var widgetNav = point.widget_navigation[0];
    window.open(widgetNav.value, openNewTab ? '_blank' : '_self');
  } else if (point.isOther)
    openUrl(event, point.click_url_info);
  else {
    var element = event.srcElement || event.target;
    if (event.target && event.target.graphic)
      element = event.target.graphic.element;
    var hcKey = '';
    if (typeof point.isLatLon !== 'undefined' && !point.isLatLon)
      hcKey = point.properties['hc-key'];
    generateDataPointClickUrl(event, element, point.report_drilldown, point.table, point.click_url_info, point.list_ui_view_name, point.drill_open_new_win, point.isOther,
      (point.report_drilldown_zoom ? hcKey : null), point.report_drilldown_map, point.show_data_label, point.show_geographical_label);
  }
}

function hc_formatToolTip() {
  var tt = '';
  var parenthesisOpen = false;
  if (typeof this.point.valid == 'undefined' || this.point.valid === true) {
    if (this.series.name == 'pareto_series')
      tt = this.point.percent + '%';
    else {
      tt = this.x + ' = ' + this.point.y_tooltip + '<br/>(' + this.point.percent + '%';
      parenthesisOpen = true;
    }
    if (this.point.percent_count)
      tt += ' of ' + this.point.table_display_plural;
    if (parenthesisOpen)
      tt += ')';
    if (this.point.widget_navigation && this.point.widget_navigation.length && this.point.widget_navigation[0].value.length)
      tt += '<br/>' + this.point.widget_navigation_tooltip_text + ' ' + this.point.widget_navigation[0].label;
    return tt;
  }
  return false;
}

function hc_formatGeneralLineBarToolTip(event) {
  var typeTooltip = this.series.options.tooltip.tooltipText;
  if ('stacked' === typeTooltip) {
    if (this.point.valid) {
      var xValue = this.x;
      if (hc_isSlowMetricChart(this.series.chart.options))
        xValue = hc_formatDatetimeString(this.x);
      var tt = xValue + ', ' + this.point.name + ' = ' + this.point.y_tooltip + '<br/>(' + this.point.percent + '%';
      if (this.point.percent_count)
        tt += ' of ' + this.point.table_display_plural + ')';
      else
        tt += ')';
      if (this.point.widget_navigation && this.point.widget_navigation.length && this.point.widget_navigation[0].value.length)
        tt += '<br/>' + this.point.widget_navigation_tooltip_text + ' ' + this.point.widget_navigation[0].label;
      return tt;
    }
    return false;
  } else {
    var tt = '';
    var parenthesisOpen = false;
    if (typeof this.point.valid == 'undefined' || this.point.valid === true) {
      if (this.series.name == 'pareto_series')
        tt = this.point.percent + '%';
      else {
        var xValue = this.x;
        if (hc_isSlowMetricChart(this.series.chart.options))
          xValue = hc_formatDatetimeString(this.x);
        tt = xValue + ' = ' + this.point.y_tooltip + '<br/>(' + this.point.percent + '%';
        parenthesisOpen = true;
      }
      if (this.point.percent_count)
        tt += ' of ' + this.point.table_display_plural;
      if (parenthesisOpen)
        tt += ')';
      if (this.point.widget_navigation && this.point.widget_navigation.length && this.point.widget_navigation[0].value.length)
        tt += '<br/>' + this.point.widget_navigation_tooltip_text + ' ' + this.point.widget_navigation[0].label;
      return tt;
    }
    return false;
  }
}

function hc_formatPie() {
  var tt = this.key + ' = ' + this.point.y_tooltip + '<br/>(' + this.point.percent + '%)';
  if (this.point.widget_navigation && this.point.widget_navigation.length && this.point.widget_navigation[0].value.length)
    tt += '<br/>' + this.point.widget_navigation_tooltip_text + ' ' + this.point.widget_navigation[0].label;
  return tt;
}

function hc_formatHeatmapTooltip() {
  var tt = '<b>' + this.point.value_tooltip + '</b>';
  if (this.point.widget_navigation && this.point.widget_navigation.length && this.point.widget_navigation[0].value.length)
    tt += '<br/>' + this.point.widget_navigation_tooltip_text + ' ' + this.point.widget_navigation[0].label;
  return tt;
}

function hc_formatMapTooltip() {
  var tt = this.point.name + (this.point.y_tooltip != '' ? ':' + this.point.y_tooltip : '');
  if (this.point.widget_navigation && this.point.widget_navigation.length && this.point.widget_navigation[0].value.length)
    tt += '<br/>' + this.point.widget_navigation_tooltip_text + ' ' + this.point.widget_navigation[0].label;
  return tt;
}

function hc_formatMapDataLabels() {
  var showGeoLabel = this.point.series.chart.series[0].options.dataLabels.show_geographical_label;
  var showDataLabel = this.point.series.chart.series[0].options.dataLabels.show_data_label;
  var name = this.point.name;
  var value = this.point.y_tooltip;
  var out = '';
  if (showDataLabel && showGeoLabel)
    out = value !== undefined && value != '' ? name + ':' + value : name;
  else if (showDataLabel && !showGeoLabel)
    out = value;
  else if (!showDataLabel && showGeoLabel)
    out = name;
  return out;
}

function hc_formatStackedBarToolTip() {
  if (this.point.valid) {
    var tt = this.x + ', ' + this.point.name + ' = ' + this.point.y_tooltip + '<br/>(' + this.point.percent + '%';
    if (this.point.percent_count)
      tt += ' of ' + this.point.table_display_plural + ')';
    else
      tt += ')';
    if (this.point.widget_navigation && this.point.widget_navigation.length && this.point.widget_navigation[0].value.length)
      tt += '<br/>' + this.point.widget_navigation_tooltip_text + ' ' + this.point.widget_navigation[0].label;
    return tt;
  }
  return false;
}

function hc_formatHistToolTip() {
  var rangevals = this.x.split(':');
  var tt = this.point.tt_label_min + ' = ' + rangevals[0] + '<br/>' +
    this.point.tt_label_max + ' = ' + rangevals[1] + '<br/>' +
    this.point.tt_label_cnt + ' = ' + this.y;
  if (this.point.widget_navigation && this.point.widget_navigation.length && this.point.widget_navigation[0].value.length)
    tt += '<br/>' + this.point.widget_navigation_tooltip_text + ' ' + this.point.widget_navigation[0].label;
  return tt;
}

function hc_formatControlToolTip() {
  var tt = this.x + ' = ' + this.point.y_tooltip;
  if (this.point.widget_navigation && this.point.widget_navigation.length && this.point.widget_navigation[0].value.length)
    tt += '<br/>' + this.point.widget_navigation_tooltip_text + ' ' + this.point.widget_navigation[0].label;
  return tt;
}

function hc_addPropsForDataLabelsTruncation(dataPoint, reportProperties) {
  dataPoint.data_label_max_length = reportProperties.data_label_max_size;
  if ('truncate_data_labels' in reportProperties)
    dataPoint.truncate_data_labels = reportProperties.truncate_data_labels;
  if ('data_labels_remove_leading' in reportProperties)
    dataPoint.data_labels_remove_leading = reportProperties.data_labels_remove_leading;
}

function hc_addTotal(hcOptions, chartProps, series, chartData) {
  if (!series.data.length) {
    return;
  }
  hcOptions.subtitle = {};
  hcOptions.subtitle.verticalAlign = 'middle';
  hcOptions.subtitle.align = 'center';
  hcOptions.subtitle.style = {};
  hcOptions.subtitle.style.fontFamily = 'Arial';
  hcOptions.subtitle.style.color = '#000';
  hcOptions.subtitle.style['text-align'] = 'center';
  var titleVerticalAlign = chartData.report_properties.title_vertical_alignment;
  var titleSize = chartData.report_properties.chart_title_size;
  var fontHelper;
  if (hcOptions.chart.width < hcOptions.chart.height)
    fontHelper = hcOptions.chart.width;
  else
    fontHelper = hcOptions.chart.height;
  var fontSize = fontHelper / 15;
  var durationSubFontSize = parseInt(fontHelper / 20);
  hcOptions.subtitle.style.fontSize = parseInt(fontSize) + "pt";
  var yPos = 0;
  if ("yaxis_duration" in chartData.series[0] && chartData.series[0].yaxis_duration) {
    hcOptions.subtitle.useHTML = true;
    hcOptions.subtitle.style['line-height'] = parseInt(fontSize / 1.2) + "pt";
    var days = 'Days';
    var hours = 'Hours';
    var minutes = 'Minutes';
    var seconds = 'Seconds';
    var translation = chartData.report_properties.translation;
    if (translation != undefined) {
      days = translation.days;
      hours = translation.hours;
      minutes = translation.minutes;
      seconds = translation.seconds;
    }
    series.total = series.total.replace(days, days + "<br/><span style='font-size:" + durationSubFontSize + "pt;'>")
      .replace(" " + hours + " ", "h:").replace(" " + minutes + " ", "m:").replace(" " + seconds, "s") +
      "</span>";
    if (chartProps.chartType == 'donut') {
      if (hcOptions.title.text === '') {
        yPos = 0 - fontSize * (.5 + fontSize / 200);
      } else if (titleVerticalAlign === 'top') {
        yPos = titleSize / 2 - fontSize * (fontSize / 100);
      } else if (titleVerticalAlign === 'bottom') {
        yPos = 0 - (titleSize / 2 + fontSize * (fontSize / 100));
      }
    } else {
      if (hcOptions.title.text === '') {
        yPos = fontSize * 1.55;
      } else if (titleVerticalAlign === 'top') {
        yPos = titleSize / 3 + fontSize * 1.55;
      } else if (titleVerticalAlign === 'bottom') {
        yPos = (fontSize * 1.55 + 11) - (titleSize / 1.4);
      }
    }
  } else {
    series.total = "<span title=" + series.total_value + ">" + series.total + "</span>";
    if (chartProps.chartType == 'donut') {
      if (hcOptions.title.text === '') {
        yPos = 0 - fontSize * (.2 + fontSize / 200);
      } else if (titleVerticalAlign === 'top') {
        yPos = titleSize / 2 + fontSize * (.35 - fontSize / 100);
      } else if (titleVerticalAlign === 'bottom') {
        yPos = 0 - (titleSize / 2.5 + fontSize * (fontSize / 150));
      }
    } else {
      if (hcOptions.title.text === '') {
        yPos = fontSize * (2.3 + fontSize / 400);
      } else if (titleVerticalAlign === 'top') {
        yPos = titleSize / 4 + fontSize * 2.55;
      } else if (titleVerticalAlign === 'bottom') {
        yPos = fontSize * (2.8 - fontSize / 400) - titleSize / 1.4;
      }
    }
  }
  hcOptions.subtitle.useHTML = true;
  hcOptions.subtitle.text = series.total;
  hcOptions.subtitle.y = yPos;
  hcOptions.legend.enabled = false;
}

function clickOnABreadcrumb(reportId, containerId, jsonProperties) {
  var decodedJsonProperties = decodeURIComponent(jsonProperties);
  var jsonProperties = JSON.parse(decodedJsonProperties);
  var content = jQuery("#" + containerId);
  var mapParams = '';
  var map;
  var contParams = 0;
  for (var i = 0; i < jsonProperties.length; i++) {
    var jsonProp = jsonProperties[i];
    if (jsonProp.key === 'report_map')
      map = jsonProp.value;
  }
  mapParams += "&sysparm_report_map_parent=" + map;
  drillReport(content.parent().parent(), reportId, '', mapParams);
}

function hc_isSlowMetricChart(hcOptions, seriesData) {
  if (hcOptions && hcOptions.chart && hcOptions.chart.isChartingSlowMetricTable !== undefined)
    return hcOptions.chart.isChartingSlowMetricTable;
  if (seriesData && seriesData.table_name && seriesData.xvalues && seriesData.xvalues[0] &&
    seriesData.table_name.indexOf('v_rrd') === 0 &&
    /(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/.test(seriesData.xvalues[0])) {
    hcOptions.chart.isChartingSlowMetricTable = true;
    return true;
  } else
    hcOptions.chart.isChartingSlowMetricTable = false;
  return false;
}

function hc_convertDateTimeFormatToUnixTime(datetime) {
  var dateAndTimes = /(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/.exec(datetime);
  dateAndTimes.shift();
  for (var i = 0; i < dateAndTimes.length; i++) {
    dateAndTimes[i] = parseInt(dateAndTimes[i], 10);
  }
  return Date.UTC(dateAndTimes[0], dateAndTimes[1] - 1, dateAndTimes[2], dateAndTimes[3], dateAndTimes[4], dateAndTimes[5]);
}

function hc_setZoomTypeForSlowMetric(chartData, hcOptions) {
  if (hc_isSlowMetricChart(hcOptions, chartData.series[0])) {
    hcOptions.chart.zoomType = 'x';
  }
}

function hc_formatDatetimeString(x) {
  var xValue = (new Date(x)).toUTCString();
  xValue = xValue.substring(0, xValue.length - 4);
  return xValue
}

function hc_addSummaryDataToLegendForSlowMetric(chartData, hcOptions, isUI) {
  if (isUI && !(window.SNC && window.SNC.canvas && SNC.canvas.canvasUtils) && hc_isSlowMetricChart(hcOptions, chartData.series[0])) {
    hcOptions.legend.statsTable = {
      active: true,
      seriesLinkGenerator: function linkSeriesInLegendToPattern(serie) {
        try {
          var patternSysId = /pattern=(\w*)/.exec(serie.userOptions.data[0].click_url_info)[1];
          var patternType = serie.userOptions.data[0].table.split("_").pop();
          return "sys_" + patternType + "_pattern.do?sys_id=" + patternSysId;
        } catch (e) {
          return "";
        }
      }
    };
    if (chartData.title.indexOf("Time") >= 0)
      hcOptions.legend.statsTable.unit = 'ms';
    hcOptions.chart.height -= 120;
  }
}

function hc_differenceOfClosestStringDateTimesInSeries(xValues) {
  var previousValue = hc_convertDateTimeFormatToUnixTime(xValues[0]);
  var smallestDifference = Number.MAX_VALUE;
  var currentValue, currentDifference;
  for (var i = 1; i < xValues.length; i++) {
    currentValue = hc_convertDateTimeFormatToUnixTime(xValues[i]);
    currentDifference = currentValue - previousValue;
    if (currentDifference < smallestDifference)
      smallestDifference = currentDifference;
    previousValue = currentValue;
  }
  if (smallestDifference === Number.MAX_VALUE)
    return 0;
  return smallestDifference;
}

function hc_disableTurboThreshold(hcOptions) {
  var threshold = 0;
  if (typeof hcOptions !== 'undefined' && typeof hcOptions.series !== 'undefined') {
    for (var i = 0; i < hcOptions.series.length; i++)
      hcOptions.series[i].turboThreshold = threshold;
  }
}

function hc_setDataLabelPositionProperties(hcOptions, chartData) {
  var hcOptionSeriesCount = 0;
  var numberOfDatasets = chartData.series.length;
  for (var datasetIndex = 0; datasetIndex < numberOfDatasets; datasetIndex++) {
    var dataset = chartData.series[datasetIndex];
    var numberOfHcSeriesPerDataset = 1;
    if ('sub_series' in dataset)
      numberOfHcSeriesPerDataset = dataset.x2values.length;
    for (var j = 0; j < numberOfHcSeriesPerDataset; j++) {
      if (chartData.report_properties_series[datasetIndex].show_chart_data_label) {
        hcOptions.series[j + hcOptionSeriesCount].dataLabels.enabled = true;
        if (chartData.report_properties_series[datasetIndex].show_data_label_position_middle) {
          hcOptions.series[j + hcOptionSeriesCount].dataLabels.verticalAlign = 'middle';
          hcOptions.series[j + hcOptionSeriesCount].dataLabels.inside = true;
        } else
          hcOptions.series[j + hcOptionSeriesCount].dataLabels.inside = false;
        if (chartData.report_properties_series[datasetIndex].allow_data_label_overlap)
          hcOptions.series[j + hcOptionSeriesCount].dataLabels.allowOverlap = true;
        else
          hcOptions.series[j + hcOptionSeriesCount].dataLabels.allowOverlap = false;
      } else
        hcOptions.series[j + hcOptionSeriesCount].dataLabels.enabled = false;
    }
    hcOptionSeriesCount += numberOfHcSeriesPerDataset;
  }
}

function isAccessibilityPatternsEnabled() {
  return window.g_accessibility_visual_patterns === 'true' || window.g_accessibility_visual_patterns === true;
};
/*! RESOURCE: /scripts/reportcommon/customvisuals/multilevel-pivot.js */
var MultilevelPivot = function MultilevelPivot(reportUUID, runType, options, notSaveStatistics) {
  'use strict';
  var self = this;
  if (!options) {
    options = window.g_report_params[reportUUID];
    options.is_report_source_filter_already_combined = true;
  }
  options.not_save_statistics = notSaveStatistics;
  createReportTemplate(reportUUID, options);
  this.containerId = 'chart-container-' + reportUUID;
  this.showZero = options.show_zero;
  this.pivotExpanded = options.pivot_expanded !== 'false' && options.pivot_expanded !== false;
  this.displayRowLines = options.display_row_lines !== 'false' && options.display_row_lines !== false;
  this.displayColumnLines = options.display_column_lines !== 'false' && options.display_column_lines !== false;
  this.fixedHeaders = window.chartHelpers.systemParams.fixedHeaders;
  this.table = options.table;
  this.$table = jQuery('<table id="pivot_table" class="pivot-2-levels table" cellspacing="0" cellpadding="0" tabindex="0" role="grid" />');
  this.listUIViewName = '';
  this.isBuilder = jQuery('#reportform_control').length || (typeof gReport !== 'undefined' && gReport && gReport.isDesigner);
  this.isDesigner = (typeof gReport !== 'undefined' && gReport && gReport.isDesigner);
  this.isOldBuilder = jQuery('#reportform_control').length;
  this.isCanvas = window.SNC && SNC.canvas && SNC.canvas.canvasUtils && SNC.canvas.isGridCanvasActive;
  this.options = options;
  this.title = options.title;
  var leftMostRowSpan = [];
  var leftMostRowValue = [];
  var showMessage = function showMessage(msg, level) {
    if (level === 'FAILURE')
      jQuery('#' + self.containerId).html('<div class="pivot-error">ERROR: ' + msg + '</div>');
    else
      jQuery('#' + self.containerId).before('<div class="pivot-infomessage">' + msg + '</div>');
  };
  this.init = function init() {
    self.runPivot(options, runType);
    self.eventHandlers();
  };
  this.runPivot = function runPivot() {
    self.startTime = new Date().getTime();
    var processor = (runType === 'run') ? 'PivotRunProcessor' : 'PivotRunPublishedProcessor';
    jQuery.ajax({
      method: 'POST',
      url: '/xmlhttp.do',
      dataType: 'xml',
      headers: {
        'X-UserToken': window.g_ck
      },
      data: {
        sysparm_processor: processor,
        sysparm_scope: 'global',
        is_portal: options.is_portal,
        sysparm_timer: new Date().getTime(),
        sysparm_request_params: JSON.stringify(self.buildRequestParams(options))
      }
    }).done(function doneCb(xml) {
      self.processResponse(xml);
    }).fail(function failCb(jqXHR, textStatus, error) {
      console.log(textStatus, error);
    });
  };
  this.processResponse = function processResponse(response) {
    if (!response)
      showError(self.containerId, 'No response from the server');
    else {
      var resp = JSON.parse(jQuery(response).find('RESPONSE').text());
      if (resp.STATUS === 'SUCCESS')
        try {
          response = JSON.parse(resp.RESPONSE_DATA);
          if (response.widget_navigation && response.widget_navigation.length)
            this.widgetNav = response.widget_navigation[0];
          self.reportDrilldown = response.report_drilldown;
          self.renderTable(response);
          if (self.isBuilder && response.drill_message)
            showMessage(response.drill_message);
          if (response.message)
            showMessage(response.message, 'INFO');
          if (self.fixedHeaders)
            self.fixateHeader();
        } catch (err) {
          showMessage(chartHelpers.i18n.chartGenerationError, 'FAILURE');
          throw new Error(err);
        }
      else {
        jQuery('#' + self.containerId).empty();
        showMessage(resp.RESPONSE_DATA, resp.STATUS);
      }
    }
    var now = new Date().getTime();
    var elapsedTime = (now - self.startTime) / 1000;
    console.log('Time taken to render report: ' + elapsedTime);
    hideReportIsLoading(findGridWindowFromElementID(self.containerId));
  };
  this.reduceAxisCategories = function reduceAxisCategories(categories, sortKey) {
    var uniqueAxisCategories = {};
    for (var i = 0; i < categories.length; i++) {
      if (!uniqueAxisCategories.hasOwnProperty(categories[i][sortKey])) {
        var record = {};
        record.count = 1;
        record.value = categories[i].value;
        uniqueAxisCategories[categories[i][sortKey]] = record;
      } else
        uniqueAxisCategories[categories[i][sortKey]].count += 1;
    }
    return uniqueAxisCategories;
  }
  this.renderTable = function renderTable(response) {
    var aggregateFunction = response.aggregate.function;
    var titleProps;
    var showTitle = true;
    var config = self.options;
    var $container = jQuery('#' + self.containerId);
    var $table = self.$table;
    var $caption = jQuery('<caption class="sr-only"/>');
    var $row = jQuery('<tr role="row" />');
    var $yLabelsRow = jQuery('<tr class="y-labels-row header-row" role="row"/>');
    var yLastColSpan = 1;
    var xLastRowSpan = 1;
    var headerRows = [];
    var data = response.series.data;
    var xCategories = response.xAxisCategories;
    var yCategories = response.yAxisCategories;
    var xCategorySortKey = xCategories[0].fieldValues[0].hasOwnProperty("sys_id") ? "sys_id" : "value";
    var yCategorySortKey = yCategories[0].fieldValues[0].hasOwnProperty("sys_id") ? "sys_id" : "value";
    var subtotals = response.subtotals;
    self.listUIViewName = response.list_ui_view_name;
    self.drillOpenNewWin = response.drill_open_new_win;
    var xLevel = xCategories[0].fieldValues.length;
    var yLevel = yCategories[0].fieldValues.length;
    var yTopmostCategories = [];
    var xTopmostCategories = [];
    var nextBlocked = 0;
    $caption.text(config.chart_title || config.title);
    $table.append($caption);
    for (var i = 0; i < xLevel; i++)
      headerRows.push(jQuery('<tr class="header-row" role="row"/>'));
    for (i = 0; i < yCategories.length; i++)
      yTopmostCategories[i] = yCategories[i].fieldValues[0];
    for (i = 0; i < xCategories.length; i++)
      xTopmostCategories[i] = xCategories[i].fieldValues[0];
    var yTopmostUniqueCategories = this.reduceAxisCategories(yTopmostCategories, yCategorySortKey);
    var xTopmostUniqueCategories = this.reduceAxisCategories(xTopmostCategories, xCategorySortKey);
    if (yLevel === 1)
      yLastColSpan = 2;
    if (xLevel === 1)
      xLastRowSpan = 2;
    for (i = 0; i < yCategories.length; i++) {
      for (var j = 0; j <= xCategories.length; j++)
        if (j < xCategories.length) {
          var dataPoint = data[(xCategories.length * i) + j];
          var cellQueryParts = [];
          var dataPointValue = dataPoint[0];
          if (dataPointValue || (dataPointValue === 0 && (aggregateFunction === 'AVG' || aggregateFunction === 'SUM'))) {
            var xCategoryQuery = response.otherQuery && !xCategories[j].categoryQuery ? response.otherQuery : xCategories[j].categoryQuery;
            cellQueryParts = [xCategoryQuery, yCategories[i].categoryQuery, response.filter];
          }
          if (dataPointValue === null && self.showZero && dataPoint[1] === "0")
            dataPointValue = 0;
          var colorStyle = chartHelpers.evaluateColorRules(dataPointValue, response.rules);
          var $td = jQuery('<td/>');
          if (colorStyle && colorStyle.color)
            $td.css('color', colorStyle.color);
          if (colorStyle && colorStyle.bgColor)
            $td.css('background-color', colorStyle.bgColor);
          $td.appendTo($row).html(self.generateCell(dataPoint[1], cellQueryParts, dataPoint[2], aggregateFunction));
        } else {
          var yAggregateQueryParts = [yCategories[i].categoryQuery];
          if (!response.sysparm_show_other && response.otherQuery)
            yAggregateQueryParts.push(response.otherQuery);
          yAggregateQueryParts.push(response.filter);
          jQuery('<td class="aggregate-right"/>').appendTo($row).html(self.generateCell(yCategories[i].aggregatedValue, yAggregateQueryParts, yCategories[i].tooltipText));
        }
      for (var k = yLevel - 1; k >= 0; k--)
        if (k === 0)
          if (nextBlocked === 0) {
            if (subtotals) {
              $row.addClass('below-subtotals');
              leftMostRowSpan.push(yTopmostUniqueCategories[yCategories[i].fieldValues[k][yCategorySortKey]].count);
              leftMostRowValue.push(yTopmostUniqueCategories[yCategories[i].fieldValues[k][yCategorySortKey]].value);
            } else
              jQuery('<td/>', {
                class: 'y-axis-category-field-leftmost header-left',
                scope: 'row',
                role: 'rowheader',
                colspan: yLastColSpan,
                rowspan: yTopmostUniqueCategories[yCategories[i].fieldValues[k][yCategorySortKey]].count
              }).prependTo($row).text(yTopmostUniqueCategories[yCategories[i].fieldValues[k][yCategorySortKey]].value);
            nextBlocked = yTopmostUniqueCategories[yCategories[i].fieldValues[k][yCategorySortKey]].count - 1;
          } else
            nextBlocked--;
      else
      if (k === yLevel - 1)
        jQuery('<td/>', {
          scope: 'row',
          colspan: 2,
          role: 'rowheader',
          class: 'y-axis-category-field header-left'
        }).prependTo($row).text(yCategories[i].fieldValues[k].value);
      else
        jQuery('<td/>', {
          scope: 'row',
          class: 'y-axis-category-field header-left',
          role: 'rowheader'
        }).prependTo($row).text(yCategories[i].fieldValues[k].value);
      if (!self.pivotExpanded && subtotals)
        $row.css('display', 'none');
      $table.append($row.addClass('content-row'));
      $row = jQuery('<tr role="row"/>');
    }
    for (i = 0; i <= xCategories.length; i++)
      if (i < xCategories.length) {
        xCategoryQuery = response.otherQuery && !xCategories[i].categoryQuery ? response.otherQuery : xCategories[i].categoryQuery;
        var $content = self.generateCell(xCategories[i].aggregatedValue, [xCategoryQuery, response.filter], xCategories[i].tooltipText);
        $row.addClass('totals');
        jQuery('<td class="aggregate-bottom"/>').appendTo($row).html($content);
        for (j = 0; j < xLevel; j++)
          if (typeof xCategories[i].fieldValues[j] !== 'undefined')
            if (j === 0) {
              if (nextBlocked === 0) {
                jQuery('<th/>', {
                  rowspan: xLastRowSpan,
                  scope: 'col',
                  role: 'columnheader',
                  colspan: xTopmostUniqueCategories[xCategories[i].fieldValues[j][xCategorySortKey]].count
                }).appendTo(headerRows[j]).text(xCategories[i].fieldValues[j].value);
                nextBlocked = xTopmostUniqueCategories[xCategories[i].fieldValues[j][xCategorySortKey]].count - 1;
              } else
                nextBlocked--;
            } else if (j === xLevel - 2)
          jQuery('<th/>', {
            class: 'x-axis-category-field',
            scope: 'col',
            role: 'columnheader'
          }).appendTo(headerRows[j]).text(xCategories[i].fieldValues[j].value);
        else
          jQuery('<th/>', {
            rowspan: 2,
            class: 'x-axis-category-field',
            scope: 'col',
            role: 'columnheader'
          }).appendTo(headerRows[j]).text(xCategories[i].fieldValues[j].value);
        else
          headerRows[0].find('th:nth-child(' + chartHelpers.objectSize(xTopmostUniqueCategories) + ')').attr('rowspan', xLevel + 1);
      } else {
        var grantTotalQueryParts = !response.sysparm_show_other && response.otherQuery ? [response.otherQuery, response.filter] : [response.filter];
        $content = self.generateCell(response.aggregate.grandAggregate, grantTotalQueryParts, response.aggregate.tooltipText);
        jQuery('<td class="grand"/>').appendTo($row).html($content);
        $row.prepend('<td colspan="' + (yLevel + 1) + '" class="header-left">' + response.aggregate.functionLabel + '</td>');
        headerRows[0].append('<th class="aggregate-right" scope="col" role="columnheader" rowspan="' + (xLevel + 1) + '"> ' + response.aggregate.functionLabel + ' </th>');
      }
    for (i = 0; i < xLevel; i++) {
      for (k = yLevel - 1; k >= 0; k--)
        if (i === xLevel - 1) {
          jQuery('<th/>', {
            class: 'y-axis-category header-left'
          }).prependTo($yLabelsRow).text(yCategories[0].fieldValues[k].field);
          headerRows[i + 1] = $yLabelsRow;
        }
      jQuery('<th/>', {
        class: 'x-axis-category'
      }).prependTo(headerRows[i]).text(xCategories[0].fieldValues[i].field);
      if (i === 0) {
        var aggregateFieldDisplayValue = '';
        var pointerButton = '';
        if (response.aggregate.aggregateFieldDisplayValue)
          aggregateFieldDisplayValue = response.aggregate.aggregateFieldDisplayValue;
        if (subtotals)
          pointerButton = '<a href="#" class="collapse-all ' + (self.pivotExpanded ? 'expanded' : '') + '"/>';
        headerRows[0].prepend('<th class="top-left-hole" colspan="' + yLevel + '" rowspan="' + xLevel + '">' + pointerButton + aggregateFieldDisplayValue + '</th>');
      }
      if (i === xLevel - 1)
        $yLabelsRow.append('<th/>');
    }
    $table.append($row);
    for (j = xLevel; j >= 0; j--)
      $table.prepend(headerRows[j]);
    if (subtotals)
      self.generateSubtotals($table, subtotals, yLevel, xCategories, aggregateFunction);
    $container.empty().html('<div class="pivot-wrap"/>').find('.pivot-wrap').append($table);
    if (config.show_chart_title === 'never' || (!config.title && !config.chart_title) || (config.show_chart_title === 'report' && !self.isBuilder))
      showTitle = false;
    if (showTitle) {
      if (config.chart_title)
        config.title = config.chart_title;
      titleProps = {
        title: config.title,
        chart_title_size: config.chart_title_size,
        chart_title_x_position: config.chart_title_x_position,
        chart_title_y_position: config.chart_title_y_position,
        title_horizontal_alignment: config.title_horizontal_alignment,
        title_vertical_alignment: config.title_vertical_alignment
      };
      if (response.chart_title_color)
        titleProps.chart_title_color = response.chart_title_color;
      self.generateTitle(titleProps);
    }
    var isServicePortal = jQuery('html').attr('ng-app') === 'ng_spd' || (window.NOW && window.NOW.hasOwnProperty('sp'));
    var tip = $container.find('td a');
    if (tip.tooltip && !isServicePortal)
      tip.attr('data-placement', 'bottom').attr('data-container', 'body').tooltip().hideFix();
    if (!self.displayRowLines)
      jQuery('#pivot_table td').addClass('pivot-2-td-border-top-none');
    if (self.displayColumnLines)
      jQuery('#pivot_table td').addClass('pivot-2-td-border-left');
  };
  this.generateTitle = function generateTitle(titleProps) {
    var defaultFontSize = 14;
    var titleSelector = 'pivot_title';
    var $container = jQuery('#' + this.containerId).find('.pivot-wrap');
    var $titleEl = jQuery('<div class="' + titleSelector + '"/>').text(titleProps.title);
    if (titleProps.chart_title_color)
      $titleEl.css('color', titleProps.chart_title_color);
    if (titleProps.chart_title_size)
      $titleEl.css('font-size', titleProps.chart_title_size + 'px');
    if (titleProps.title_horizontal_alignment)
      $titleEl.css('text-align', titleProps.title_horizontal_alignment);
    if (!titleProps.custom_chart_title_position)
      switch (titleProps.title_vertical_alignment) {
        case 'top':
          $container.prepend($titleEl);
          break;
        case 'middle':
          $titleEl.css({
            position: 'absolute',
            width: '100%',
            top: '50%',
            'margin-top': -(titleProps.chart_title_size / 2) || -(defaultFontSize / 2)
          });
          $container.prepend($titleEl);
          break;
        case 'bottom':
          $container.append($titleEl);
          break;
      }
    else {
      $titleEl.css({
        position: 'absolute',
        top: titleProps.chart_title_y_position,
        left: titleProps.chart_title_x_position
      });
      $container.css({
        paddingTop: (titleProps.chart_title_size + 20) || (20 + defaultFontSize)
      });
      $container.prepend($titleEl);
    }
  };
  this.generateCell = function generateCell(displayValue, cellQueryParts, message, aggregateFunction) {
    var cellQuery = this.combineQueries(cellQueryParts);
    var encodedCellQuery = encodeURIComponent(cellQuery);
    var $content = jQuery('').html('&nbsp;');
    var hrefVal = '';
    if (displayValue)
      hrefVal = getListURL(self.table, cellQuery, self.listUiViewName);
    if (aggregateFunction) {
      if (displayValue && (displayValue !== '0' || (displayValue === '0' &&
          (self.showZero === 'true' || self.showZero === true || aggregateFunction === 'AVG' || aggregateFunction === 'SUM'))))
        if (cellQuery)
          $content = jQuery('<a/>', {
            href: hrefVal,
            rel: encodedCellQuery,
            class: 'datapoint',
            title: message
          }).text(displayValue);
        else
          $content = jQuery('<span title="' + message + '"/>').text(displayValue);
    } else
    if (displayValue)
      $content = jQuery('<a/>', {
        href: hrefVal,
        rel: encodedCellQuery,
        class: 'datapoint',
        title: message
      }).text(displayValue);
    return $content;
  };
  this.generateSubtotals = function generateSubtotals($table, subtotals, yLevel, xCategories, aggregateFunction) {
    $table.find('.below-subtotals').before('<tr role="row" class="subtotals ' + (self.pivotExpanded ? 'expanded' : '') + '"/>');
    $table.find('.subtotals').each(function eachCb(key) {
      var $currRow = jQuery(this);
      var totalCols = yLevel + xCategories.length + 1;
      var subtotalsData = subtotals.series.data;
      var subtotalsAgg = subtotals.yAxisCategories;
      for (var i = 0; i < totalCols; i++)
        if (i === 0) {
          var rowSpan;
          if (self.pivotExpanded) {
            rowSpan = leftMostRowSpan[key] + 1;
            $currRow.addClass('expanded');
          } else
            rowSpan = 1;
          $currRow.append('<td class="leftmost-cell" rowspan="' + rowSpan + '" scope="row" role="rowheader" data-mergerows="' + (leftMostRowSpan[key] + 1) + '"><a href="#" class="subcollapse"/>' + leftMostRowValue[key] + '</td>');
        } else if (i === 1)
        $currRow.append('<td class="subtotals-empty">' + chartHelpers.i18n.total + '</td> <td class="subtotals-empty"/>');
      else if (i > 1 && i < yLevel)
        $currRow.append('<td class="subtotals-empty"/>');
      else if (i === totalCols - 1)
        jQuery('<td class="aggregate-right"/>').appendTo($currRow).html(self.generateCell(subtotalsAgg[key].aggregatedValue, [subtotalsAgg[key].categoryQuery, subtotals.filter], subtotalsAgg[key].tooltipText));
      else {
        var currSubtotal = (xCategories.length * key) + (i - yLevel);
        var cellQueryParts = [];
        if (subtotalsData[currSubtotal][0] || (subtotalsData[currSubtotal][0] === 0 && (aggregateFunction === 'AVG' || aggregateFunction === 'SUM'))) {
          var xCategoryQuery = subtotals.otherQuery && !xCategories[i - yLevel].categoryQuery ? subtotals.otherQuery : xCategories[i - yLevel].categoryQuery;
          cellQueryParts = [xCategoryQuery, subtotalsAgg[key].categoryQuery, subtotals.filter];
        }
        jQuery('<td/>').appendTo($currRow).html(self.generateCell(subtotalsData[currSubtotal][1], cellQueryParts, subtotalsData[currSubtotal][2], aggregateFunction));
      }
    });
  };
  this.fixateHeader = function fixateHeader() {
    var $scrollContainer;
    var $table = self.$table;
    var tableOffset = $table.position().top;
    var offsetDiff = 0;
    var offsetFetched = false;
    var $fixedHeader = jQuery('<table class="fixed-header pivot-2-levels table"/>').insertBefore($table).html(self.getSizedHeaders(true));
    if (self.isDesigner) {
      $scrollContainer = jQuery('#main-content');
      tableOffset = $table.offset().top - $scrollContainer.offset().top;
      offsetDiff = tableOffset - $table.position().top;
    } else if (self.isOldBuilder)
      $scrollContainer = jQuery(document);
    else if (self.isCanvas)
      $scrollContainer = jQuery('#' + this.containerId).closest('.grid-widget-content');
    else
      $scrollContainer = jQuery('#' + this.containerId).closest('.widget_body');
    $scrollContainer.scroll(function scrollCb() {
      if (!offsetFetched && self.isOldBuilder) {
        tableOffset = $table.offset().top;
        offsetDiff = tableOffset - $table.position().top;
        offsetFetched = true;
      }
      var offset = jQuery(this).scrollTop() - offsetDiff;
      if (self.isDesigner)
        offset -= jQuery('#condition-builder-wrap form').height();
      if (offset >= tableOffset - offsetDiff)
        $fixedHeader.css({
          top: offset,
          display: 'table'
        });
      else if (offset < tableOffset - offsetDiff)
        $fixedHeader.hide();
    });
  };
  this.getSizedHeaders = function getSizedHeaders(createHeader) {
    var $headerRows = self.$table.find('.header-row');
    var $clonedHeaderRows = createHeader ? $headerRows.clone() : jQuery('#' + self.containerId).find('.fixed-header .header-row');
    $headerRows.each(function eachRowCb(i) {
      var $children = $headerRows.eq(i).children();
      var $clonedChildren = $clonedHeaderRows.eq(i).children();
      $children.each(function eachChildCb(j) {
        $clonedChildren.eq(j).css('min-width', $children.eq(j).outerWidth());
      });
    });
    return $clonedHeaderRows;
  };
  this.buildRequestParams = function buildRequestParams(params) {
    return {
      sysparm_table: params.table,
      sysparm_x_axis_category_fields: params.x_axis_category_fields != null ? params.x_axis_category_fields.trim().split(/[\s,]+/) : '',
      sysparm_y_axis_category_fields: params.y_axis_category_fields != null ? params.y_axis_category_fields.trim().split(/[\s,]+/) : '',
      sysparm_aggregate: params.aggregate,
      sysparm_show_other: params.show_other,
      sysparm_others: params.other_threshold,
      sysparm_chart_title_color: params.chart_title_color,
      sysparm_sumfield: params.agg_field,
      sysparm_query: params.filter,
      sysparm_report_id: params.report_id,
      sysparm_list_ui_view: params.list_ui_view,
      sysparm_interactive_report: params.interactive_report,
      sysparm_report_drilldown: params.report_drilldown,
      sysparm_homepage_sysid: params.homepage_sysid,
      sysparm_decimal_precision: params.decimal_precision,
      sysparm_report_source_id: params.report_source_id,
      sysparm_is_report_source_filter_already_combined: params.is_report_source_filter_already_combined,
      sysparm_is_published: params.is_published,
      sysparm_not_save_statistics: params.not_save_statistics,
      sysparm_set_redirect: params.set_redirect
    };
  };
  this.eventHandlers = function eventHandlers() {
    var $container = jQuery('#' + self.containerId);
    $container.on('click', '.subtotals .subcollapse', function subcollapseClickCb(ev) {
      ev.preventDefault();
      var $parentRow = jQuery(this).closest('.subtotals');
      var $parentCell = jQuery(this).closest('td');
      var $subRows = $parentRow.nextUntil('.subtotals,.totals');
      if ($parentCell.attr('rowspan') > 1) {
        $parentCell.attr('rowspan', 1);
        $parentRow.removeClass('expanded');
        $subRows.hide();
      } else {
        $parentCell.attr('rowspan', $parentCell.data('mergerows'));
        $parentRow.addClass('expanded');
        $subRows.show();
      }
      if (self.fixedHeaders)
        self.getSizedHeaders(false);
    });
    $container.on('click', '.collapse-all', function collapseCb(ev) {
      ev.preventDefault();
      var $contentRows = $container.find('.content-row');
      var $el = jQuery(this);
      if ($el.is('.expanded')) {
        $container.find('.subtotals.expanded').each(function eachCb() {
          jQuery(this).removeClass('expanded');
          jQuery(this).find('.leftmost-cell').attr('rowspan', 1);
        });
        $el.closest('.pivot-wrap').find('.collapse-all').removeClass('expanded');
        $contentRows.hide();
      } else {
        $container.find('.subtotals:not(.expanded)').each(function eachCb() {
          jQuery(this).addClass('expanded');
          var $cell = jQuery(this).find('.leftmost-cell');
          $cell.attr('rowspan', $cell.data('mergerows'));
        });
        $el.closest('.pivot-wrap').find('.collapse-all').addClass('expanded');
        $contentRows.show();
      }
      if (self.fixedHeaders)
        self.getSizedHeaders(false);
    });
    $container.on('click', '.datapoint', function dataPointClickCb(ev) {
      ev.preventDefault();
      var openNewTab;
      if (ev.ctrlKey || ev.metaKey)
        openNewTab = true;
      if (self.widgetNav)
        window.open(self.widgetNav.value, openNewTab ? '_blank' : '_self');
      else {
        generateDataPointClickUrl(ev, '#' + self.containerId, self.reportDrilldown, self.table, decodeURIComponent(jQuery(this).attr('rel')), self.listUIViewName, self.drillOpenNewWin);
      }
    });
  };
  this.combineQueries = function combineQueries(queryParts) {
    if (typeof queryParts === 'string')
      return queryParts;
    queryParts = queryParts.filter(function filterCb(el) {
      return el;
    });
    if (!queryParts.length)
      return '';
    return queryParts.reduce(function reduceCb(acc, curr) {
      var accParts = acc.split('^NQ');
      var currParts = curr.split('^NQ');
      var finalParts = [];
      for (var i = 0; i < accParts.length; i++)
        for (var j = 0; j < currParts.length; j++)
          finalParts[(i * currParts.length) + j] = accParts[i] + '^' + currParts[j];
      return finalParts.join('^NQ');
    });
  };
  this.init();
};;
/*! RESOURCE: /scripts/reportcommon/customvisuals/single-score.js */
function SingleScore(reportUUID, runType, config) {
  'use strict';
  var self = this;
  if (!config) {
    config = window.g_report_params[reportUUID];
    config.is_report_source_filter_already_combined = true;
  }
  createReportTemplate(reportUUID, config);
  this.containerId = 'chart-container-' + reportUUID;
  this.msgContainerId = 'msg-container-' + reportUUID;
  this.$container = jQuery('#' + this.containerId);
  this.$wrap = this.$container;
  this.config = config;
  this.title = config.title;
  this.is_portal = config.is_portal;
  this.isServicePortal = jQuery('html').attr('ng-app') === 'ng_spd' || (window.NOW && window.NOW.hasOwnProperty('sp'));
  this.reportId = config.report_id;
  this.table = config.table;
  this.condition = config.filter;
  this.minMargin = 5;
  this.maxFontSize = 200;
  this.minWrapHeight = 64;
  this.listUIViewName = '';
  this.relativeFontSize = 0.7;
  this.real_time = config.real_time;
  if (top.g_ambClient || (top.amb && top.amb.getClient()))
    this.amb = top.g_ambClient || top.amb.getClient();
  this._channelListener = null;
  this.$el = jQuery('<span/>');
  this.rootReportElementClass = '.sysparm_root_report_id';
  this.defaults = {
    value: '0',
    chart_background_color: '#fff',
    displayvalue: 'No value',
    color: '#000',
    displayValueChars: 0
  };
  this.isBuilder = (reportUUID === 'builder');
  (function fetchData() {
    self.unsubscribeListener(self);
    var processor = (runType === 'run') ? 'SingleScoreRunProcessor' : 'SingleScoreRunPublishedProcessor';
    jQuery.ajax({
      method: 'POST',
      url: '/xmlhttp.do',
      dataType: 'xml',
      headers: {
        'X-UserToken': window.g_ck
      },
      data: {
        sysparm_processor: processor,
        sysparm_scope: 'global',
        is_portal: self.is_portal,
        sysparm_timer: new Date().getTime(),
        sysparm_request_params: JSON.stringify(self.buildRequestParams(config))
      }
    }).done(function doneCb(xml) {
      self.render(xml);
    }).fail(function failCb(jqXHR, textStatus, error) {
      console.log(textStatus, error);
    });
    self.eventHandlers();
  }());
}
SingleScore.prototype.unsubscribeListener = function unsubscribeListener() {
  var self = this;
  if (top.SNC && top.SNC.channelListeners) {
    self._channelListener = top.SNC.channelListeners[self.reportId];
    if (self._channelListener) {
      self._channelListener.unsubscribe();
      delete top.SNC.channelListeners[self.reportId];
    }
  }
};
SingleScore.prototype.shouldShowTitle = function shouldShowTitle() {
  if (this.config.show_chart_title === 'never' || (!this.config.title && !this.config.chart_title) || (this.config.show_chart_title === 'report' && this.isBuilder === false))
    return false;
  return true;
};
SingleScore.prototype.render = function render(response) {
  var self = this;
  var config = self.config;
  var responseData;
  if (!response) {
    hideReportIsLoading(findGridWindowFromElementID(self.containerId));
    showError(self.containerId, 'No response from the server');
    return;
  }
  var resp = JSON.parse(jQuery(response).find('RESPONSE').text());
  if (resp.STATUS === 'SUCCESS') {
    try {
      var contentEl;
      var respData = JSON.parse(resp.RESPONSE_DATA);
      var hrefVal;
      var titleProps;
      if (self.isBuilder && respData.drill_message)
        showInfo(self.msgContainerId, respData.drill_message);
      this.reportDrilldown = respData.report_drilldown;
      if (respData.widget_navigation && respData.widget_navigation.length)
        this.widgetNav = respData.widget_navigation[0];
      self.listUIViewName = respData.list_ui_view_name;
      self.drillOpenNewWin = respData.drill_open_new_win;
      responseData = jQuery.extend({}, self.defaults, respData);
      var evaluatedColor = self.evaluateColor(responseData.value, responseData.rules, responseData.color);
      hrefVal = getListURL(self.table, responseData.filter);
      var encodedClickUrlInfo = encodeURIComponent(responseData.filter);
      contentEl = '<a id="' + self.reportId + '" style="color:' + evaluatedColor + '" href="' + hrefVal + '" rel="' + encodedClickUrlInfo + '">' + responseData.displayvalue + '</a>';
      self.$container.html('<div class="single-score" aria-live="polite"/>').find('.single-score').html(self.$el.html(contentEl));
      if (!window.isMSIE9) {
        jQuery(window).on('beforeunload', self.unsubscribeListener.bind(self));
        self.registerWatcher(responseData);
      }
      if (responseData.tooltip) {
        self.$el.attr('title', responseData.tooltip);
        if (!self.isServicePortal && self.$el.tooltip)
          self.$el.attr('data-container', 'body').attr('data-placement', 'bottom').tooltip().hideFix();
      }
      if (!(window.SNC && window.SNC.canvas && window.SNC.canvas.layoutJson && window.SNC.canvas.layoutJson.isConverting))
        self.updateSize();
      if (self.shouldShowTitle()) {
        if (config.chart_title)
          config.title = config.chart_title;
        titleProps = {
          title: config.title,
          chart_title_size: config.chart_title_size,
          chart_title_x_position: config.chart_title_x_position,
          chart_title_y_position: config.chart_title_y_position,
          title_horizontal_alignment: config.title_horizontal_alignment,
          title_vertical_alignment: config.title_vertical_alignment
        };
        if (responseData.chart_title_color)
          titleProps.chart_title_color = responseData.chart_title_color;
        self.generateTitle(titleProps);
        self.updateSize();
      }
    } catch (error) {
      console.log(error);
      showError(self.containerId, 'An error occured while generating chart.');
    }
  } else
    self.showMessage(resp.RESPONSE_DATA, resp.STATUS);
  hideReportIsLoading(findGridWindowFromElementID(self.containerId));
};
SingleScore.prototype.evaluateColor = function evaluateColor(score, rules, defaultColor) {
  if (rules) {
    var colorStyle = chartHelpers.evaluateColorRules(score, rules);
    if (colorStyle.color)
      return colorStyle.color;
  }
  return defaultColor;
};
SingleScore.prototype.base64Encode = function base64Encode(queryString) {
  try {
    return btoa(queryString);
  } catch (error) {
    if (window.DOMException && error instanceof window.DOMException && error.name === 'InvalidCharacterError')
      return btoa(chartHelpers.hexEncode(queryString));
    throw error;
  }
}
SingleScore.prototype.registerWatcher = function registerWatcher(singleScoreResponse) {
  var self = this;
  if (self.is_portal && top.SNC && top.SNC.channelListeners) {
    try {
      var base64EncodeQuery = self.base64Encode(self.condition);
      var channelId = '/rw/count/' + self.table + '/' + base64EncodeQuery.replace(/=/g, '-');
      self._channelListener = top.SNC.channelListeners[self.reportId];
      if (self._channelListener) {
        self._channelListener.unsubscribe();
        delete top.SNC.channelListeners[self.reportId];
      }
      if (self.real_time === 'true' && self.amb && self.amb.getChannel(channelId)) {
        self._channelListener = self.amb.getChannel(channelId);
        self._channelListener.subscribe(function subscribeCb(channelData) {
          self.updateScore(channelData, singleScoreResponse);
        });
        top.SNC.channelListeners[self.reportId] = self._channelListener;
      }
    } catch (error) {}
  }
};
SingleScore.prototype.updateSize = function updateSize() {
  var self = this;
  var wrapHeight;
  var wrapWidth;
  var $widgetBody;
  var fontSize = self.maxFontSize;
  var $widgetContent;
  var titleHeight = 0;
  var isCanvas = window.SNC && SNC.canvas && SNC.canvas.canvasUtils && SNC.canvas.isGridCanvasActive;
  self.$container.css({
    margin: '0'
  });
  if (!self.is_portal) {
    if (self.$wrap.closest('td').length)
      $widgetBody = self.$wrap.closest('td');
    else
      $widgetBody = jQuery('body');
    self.$container.css({
      padding: '10px 0'
    });
    wrapHeight = 100;
    wrapWidth = $widgetBody.width() || 100;
  } else if (isCanvas && self.containerId.indexOf('preview') === -1) {
    $widgetContent = self.$container.closest('.grid-widget-content');
    wrapHeight = $widgetContent.height();
    wrapWidth = $widgetContent.width() - (this.minMargin * 2);
    titleHeight = $widgetContent.find('.singlescore_title').height() || 0;
  } else if (isCanvas && self.containerId.indexOf('preview') >= -1) {
    $widgetContent = self.$container.closest('.widget-preview');
    wrapHeight = $widgetContent.height();
    wrapWidth = $widgetContent.width();
    titleHeight = $widgetContent.find('.singlescore_title').height() || 0;
  } else {
    $widgetBody = self.$wrap.closest('.widget_body');
    if (jQuery('.home_preview ' + self.$containerId).length) {
      self.$container = jQuery('.home_preview #' + self.containerId);
      self.$wrap = self.$container.closest('.single-score-wrap');
      $widgetBody = jQuery('.home_preview');
    }
    wrapHeight = $widgetBody.height();
    wrapWidth = $widgetBody.width() - (this.minMargin * 2);
    if (wrapWidth < 0)
      wrapWidth = 150;
    if (wrapHeight < self.minWrapHeight)
      wrapHeight = self.minWrapHeight;
  }
  wrapHeight -= titleHeight;
  self.$el.css({
    'font-size': fontSize
  });
  while (self.$container.find('span').width() > wrapWidth && fontSize > 15) {
    fontSize -= 5;
    self.$el.css('font-size', fontSize);
  }
  fontSize = self.checkHeight(fontSize, wrapHeight);
  self.$el.css('font-size', fontSize);
  if (!isCanvas) {
    self.$container.css('margin-top', self.getMinMargin(parseInt((wrapHeight - fontSize) / 2, 10) - this.minMargin));
    self.$container.css('margin-bottom', self.getMinMargin(parseInt((wrapHeight - fontSize) / 2, 10) - this.minMargin));
  } else {
    self.$container.css('margin-top', self.getMinMargin(parseInt((wrapHeight - fontSize) / 2, 10)));
    self.$container.css('margin-bottom', self.getMinMargin(parseInt((wrapHeight - fontSize) / 2, 10)));
  }
  self.$container.css({
    'margin-left': this.minMargin + 'px',
    'margin-right': this.minMargin + 'px',
  });
};
SingleScore.prototype.updateScore = function updateScore(channelData, singleScoreResponse) {
  var self = this;
  try {
    var $element = jQuery('#' + self.reportId);
    var $parent = $element.closest('span');
    var score = singleScoreResponse.value * 1;
    if (typeof channelData.data.count !== 'undefined' && typeof score === 'number') {
      score += (channelData.data.count * 1);
      if (score < 0)
        score = 0;
      var localizedScore = score.toLocaleString();
      if (window.isMSIE10)
        localizedScore = localizedScore.substring(0, localizedScore.indexOf('.'));
      if ($parent.attr('data-original-title'))
        $parent.attr('data-original-title', $parent.attr('data-original-title').replace(singleScoreResponse.displayvalue, localizedScore));
      $element.text(localizedScore);
      $element.css('color', self.evaluateColor(score, singleScoreResponse.rules, singleScoreResponse.color));
      if (singleScoreResponse.displayValueChars !== singleScoreResponse.displayvalue.length) {
        self.updateSize();
        singleScoreResponse.displayValueChars = singleScoreResponse.displayvalue.length;
      }
      singleScoreResponse.value = score;
      singleScoreResponse.displayvalue = localizedScore;
    }
  } catch (error) {
    console.log(error);
    showError(SingleScore.containerId, 'An error occured while generating chart.');
  }
};
SingleScore.prototype.generateTitle = function generateTitle(titleProps) {
  var defaultFontSize = 14;
  var $container = jQuery('#' + this.containerId).find('.single-score');
  var $titleEl = jQuery('<div class="singlescore_title"/>')
    .text(titleProps.title)
    .attr('title', titleProps.title);
  if ($titleEl.tooltip && !this.isServicePortal)
    $titleEl
    .attr('data-container', 'body')
    .attr('data-placement', 'top')
    .tooltip()
    .hideFix();
  if (titleProps.chart_title_color)
    $titleEl.css('color', titleProps.chart_title_color);
  if (titleProps.chart_title_size)
    $titleEl.css('font-size', titleProps.chart_title_size + 'px');
  if (titleProps.title_horizontal_alignment)
    $titleEl.css('text-align', titleProps.title_horizontal_alignment);
  if (!titleProps.custom_chart_title_position)
    switch (titleProps.title_vertical_alignment) {
      case 'top':
        $container.prepend($titleEl);
        break;
      case 'middle':
        $titleEl.css({
          position: 'absolute',
          width: '100%',
          top: '50%',
          'margin-top': -(titleProps.chart_title_size / 2) || -(defaultFontSize / 2)
        });
        $container.prepend($titleEl);
        break;
      case 'bottom':
        $container.append($titleEl);
        break;
    }
  else {
    $titleEl.css({
      position: 'absolute',
      top: titleProps.chart_title_y_position,
      left: titleProps.chart_title_x_position
    });
    $container.css({
      paddingTop: (titleProps.chart_title_size + 20) || (20 + defaultFontSize)
    });
    $container.prepend($titleEl);
  }
};
SingleScore.prototype.getMinMargin = function getMinMargin(val) {
  return (val < this.minMargin) ? this.minMargin : val;
};
SingleScore.prototype.checkHeight = function checkHeight(fontSize, height) {
  return ((fontSize + (2 * this.minMargin)) > height) ? parseInt(this.relativeFontSize * height, 10) : fontSize;
};
SingleScore.prototype.buildRequestParams = function buildRequestParams(params) {
  return {
    sysparm_table: params.table,
    sysparm_aggregate: params.aggregate,
    sysparm_sumfield: params.agg_field,
    sysparm_query: params.filter,
    sysparm_interactive_report: params.interactive_report,
    sysparm_report_drilldown: params.report_drilldown,
    sysparm_report_id: params.report_id,
    sysparm_score_color: params.score_color,
    sysparm_chart_title_color: params.chart_title_color,
    sysparm_homepage_sysid: params.homepage_sysid,
    sysparm_chart_background_color: params.chart_background_color,
    sysparm_list_ui_view: params.list_ui_view,
    sysparm_decimal_precision: params.decimal_precision,
    sysparm_report_source_id: params.report_source_id,
    sysparm_is_report_source_filter_already_combined: params.is_report_source_filter_already_combined,
    sysparm_show_zero: params.show_zero,
    sysparm_is_published: params.is_published,
    sysparm_set_redirect: params.set_redirect
  };
};
SingleScore.prototype.showMessage = function showMessage(msg, level) {
  var self = this;
  if (level === 'FAILURE')
    jQuery('#' + self.containerId).html('<div class="single-score-error">ERROR: ' + msg + '</div>');
  else
    jQuery('#' + self.containerId).html('<div>' + msg + '</div>');
};
SingleScore.prototype.resizeHandlers = function resizeHandlers(data) {
  if (data.action === 'resize')
    this.updateSize();
};
SingleScore.prototype.eventHandlers = function eventHandlers() {
  var self = this;
  this.$container.on('click', 'a', function clickCb(ev) {
    ev.preventDefault();
    var openNewTab;
    if (ev.ctrlKey || ev.metaKey)
      openNewTab = true;
    if (self.widgetNav)
      window.open(self.widgetNav.value, openNewTab ? '_blank' : '_self');
    else {
      var drillDownUrl = jQuery(this).attr('rel');
      drillDownUrl = decodeURIComponent(drillDownUrl);
      generateDataPointClickUrl(ev, '#' + self.containerId, self.reportDrilldown, self.table, drillDownUrl, self.listUIViewName, self.drillOpenNewWin);
    }
  });
  if (jQuery && window.SNC && window.SNC.canvas && SNC.canvas.canvasUtils && self.containerId.indexOf('preview') === -1) {
    var rootReportId = self.$container.closest('.grid-stack-item').find(self.rootReportElementClass).first().val();
    var uuid = self.$container.closest('.grid-stack-item').attr('data-uuid');
    if (uuid) {
      window.SNC.reportResizingFunctions = window.SNC.reportResizingFunctions || {};
      SNC.canvas.eventbus.subscribe(uuid, this.resizeHandlers.bind(this));
      SNC.reportResizingFunctions[uuid] = this.resizeHandlers;
    }
    window.SNC.reportResizingTimeouts = window.SNC.reportResizingTimeouts || {};
    window.addEventListener('resize', function resizeCb() {
      if (SNC.reportResizingTimeouts[rootReportId])
        clearTimeout(SNC.reportResizingTimeouts[rootReportId]);
      SNC.reportResizingTimeouts[rootReportId] = setTimeout(function resizingTimeoutCb() {
        self.updateSize();
      }, 250);
    }, false);
  }
};;
/*! RESOURCE: /scripts/reportcommon/customvisuals/calendar.js */
var Calendar = function Calendar(reportUUID, runType, reportParams) {
  'use strict';
  var Moment = moment;
  if (!reportParams) {
    reportParams = window.g_report_params[reportUUID];
    reportParams.is_report_source_filter_already_combined = true;
  }
  createReportTemplate(reportUUID, reportParams);
  this.combinedFilter = reportParams.filter;
  this.containerId = 'chart-container-' + reportUUID;
  this.startTime = new Date().getTime();
  var self = this;

  function showMessage(msg, level) {
    if (level === 'FAILURE')
      jQuery('#' + self.containerId).siblings('.report-message').addClass('pivot-error').text(msg);
    else
      jQuery('#' + self.containerId).siblings('.report-message').text(msg);
  }
  this.init = function init() {
    showReportIsLoading(findGridWindowFromElementID(self.containerId));
    self.runCalendar(reportParams, runType);
  };
  this.runCalendar = function runCalendar() {
    self.reportId = reportParams.report_id || 'calendar';
    window.calendarReport = window.calendarReport || {};
    window.calendarReport[self.reportId] = window.calendarReport[self.reportId] || {};
    reportParams.styleField = reportParams.styleField || window.calendarReport[self.reportId].highlight || reportParams.calstyle;
    var defaultDateOverride = null;
    if (reportParams.year || reportParams.month || reportParams.day)
      defaultDateOverride = moment({
        year: reportParams.year,
        month: reportParams.month,
        day: reportParams.day
      }).format('YYYY-MM-DD');
    if (reportParams.calview === 'week')
      reportParams.calview = 'agendaWeek';
    else if (reportParams.calview === 'day')
      reportParams.calview = 'agendaDay';
    var calWidth = jQuery('#' + self.containerId).width();
    var yearCols = 2;
    if (calWidth < 640)
      yearCols = 1;
    else if (calWidth > 1280)
      yearCols = 3;
    jQuery('#' + self.containerId).empty().fullCalendar('destroy');
    jQuery('#' + self.containerId).fullCalendar({
      theme: false,
      buttonText: chartHelpers.i18n.buttonText,
      dayNames: chartHelpers.i18n.daysNames,
      dayNamesShort: chartHelpers.i18n.dayNamesShort,
      monthNames: chartHelpers.i18n.monthNames,
      monthNamesShort: chartHelpers.i18n.monthNamesShort,
      allDayHtml: chartHelpers.i18n.allDayHtml,
      weekNumberTitle: chartHelpers.i18n.weekNumberTitleShort,
      weekNumberCalculation: window.chartHelpers.systemParams.firstDay === 0 ? 'local' : 'ISO',
      isRTL: chartHelpers.i18n.isRTL,
      buttonIcons: {
        prev: 'left-single-arrow',
        next: 'right-single-arrow',
        prevYear: 'left-double-arrow',
        nextYear: 'right-double-arrow'
      },
      fixedWeekCount: true,
      timeFormat: 'H:mm',
      slotLabelFormat: 'H:mm',
      axisFormat: 'H:mm',
      firstDay: window.chartHelpers.systemParams.firstDay,
      defaultDate: window.calendarReport[self.reportId].start || defaultDateOverride || window.chartHelpers.systemParams.defaultDate,
      defaultView: window.calendarReport[self.reportId].view || reportParams.calview || 'month',
      defaultTimedEventDuration: window.chartHelpers.systemParams.defaultEventDuration,
      yearColumns: yearCols,
      slotEventOverlap: window.chartHelpers.systemParams.slotEventOverlap ? true : false,
      lazyFetching: false,
      height: 'auto',
      contentHeight: 'auto',
      eventLimit: parseInt(window.chartHelpers.systemParams.maxEventsDisplayedPerCell, 10) + 1,
      nextDayThreshold: '00:00:00',
      eventLimitText: function eventLimitText(amountOfEvents) {
        if (amountOfEvents <= parseInt(window.chartHelpers.systemParams.maxMoreEventsPerDay, 10))
          return chartHelpers.i18n.plusMore.format(amountOfEvents);
        return chartHelpers.i18n.plusMany;
      },
      eventLimitClick: function eventLimitClick(cellInfo, jsEvent) {
        setTimeout(function timeoutCb() {
          jQuery('#' + self.containerId).find('.fc-close').attr('tabindex', 0);
        }, 500);
        if (cellInfo.date && cellInfo.hiddenSegs && cellInfo.hiddenSegs.length > parseInt(window.chartHelpers.systemParams.maxMoreEventsPerDay, 10)) {
          var selectedDate = moment(cellInfo.date).format('YYYY-MM-DD');
          self.drillViewToList({
            data: {
              startDate: selectedDate,
              endDate: selectedDate
            }
          });
          return false;
        }
        return 'popover';
      },
      views: {
        month: {
          weekNumbers: true
        },
        year: {
          weekNumbers: true
        }
      },
      header: {
        left: 'agendaDay,agendaWeek,month,year',
        center: 'title',
        right: 'today prevYear,prev,next,nextYear'
      },
      eventDataTransform: function(event) {
        var view = jQuery('#' + self.containerId).fullCalendar('getView');
        if (view.name === 'agendaDay') {
          if (event.start && event.end) {
            var viewStartMoment = new Moment(view.intervalStart.toISOString());
            var viewEndMoment = new Moment(view.intervalEnd.toISOString());
            if ((viewStartMoment.isSame(event.start) || viewStartMoment.isAfter(event.start)) &&
              (viewEndMoment.isBefore(event.end) || viewEndMoment.isSame(event.end)))
              event.allDay = true;
          }
        } else if (view.name === 'agendaWeek')
          if (event.start && event.end) {
            var eventStartMoment = new Moment(event.start);
            var eventEndMoment = new Moment(event.end);
            var hoursDiff = eventEndMoment.diff(eventStartMoment, 'hours');
            var startOfDayOfEventStartMoment = new Moment(event.start).startOf('day');
            if (hoursDiff >= 24 &&
              ((startOfDayOfEventStartMoment).isSame(eventStartMoment) ||
                eventEndMoment.diff(startOfDayOfEventStartMoment, 'day') >= 2))
              event.allDay = true;
          }
        return event;
      },
      eventMouseover: function eventMouseover(event, jsEvent, view) {
        if (window.chartHelpers.systemParams.enablePreviewOnHover && window.chartHelpers.systemParams.enablePreviewOnHover !== 'false')
          popRecordDiv(jsEvent, reportParams.table, event.id);
      },
      eventMouseout: function eventMouseout(event, jsEvent, view) {
        if (window.chartHelpers.systemParams.enablePreviewOnHover && window.chartHelpers.systemParams.enablePreviewOnHover !== 'false')
          lockPopup(jsEvent);
      },
      viewRender: function viewRender(view, element) {
        jQuery('#' + self.containerId).siblings('.report-message').text(chartHelpers.i18n.building);
      },
      eventAfterAllRender: function eventAfterAllRender(view) {
        var start = new Moment(view.intervalStart.toISOString());
        if (start.isValid())
          window.calendarReport[self.reportId] = {
            view: view.name,
            start: start.format('YYYY-MM-DD'),
            highlight: reportParams.styleField
          };
        var viewStart = new Moment(view.start.toISOString());
        if (viewStart.isValid()) {
          var dateAfterLastDateInView = new Moment(view.end.toISOString());
          var viewEnd = dateAfterLastDateInView.subtract(1, 'day');
          self.buildDrillViewToListLink(viewStart.format('YYYY-MM-DD'), viewEnd.format('YYYY-MM-DD'));
        }
        jQuery('#' + self.containerId).siblings('.report-message').empty();
        if (window.g_accessibility === 'true' || window.g_accessibility === true)
          self.enableAccessibility();
      },
      eventSources: [{
        allDayDefault: false,
        backgroundColor: 'white',
        borderColor: 'lightgrey',
        textColor: 'black',
        editable: false,
        events: function events(start, end, timezone, fullCalendarCallback) {
          var processor = runType === 'run' ? 'CalendarRunProcessor' : 'CalendarRunPublishedProcessor';
          jQuery.ajax({
            method: 'POST',
            url: '/xmlhttp.do',
            dataType: 'xml',
            headers: {
              'X-UserToken': window.g_ck
            },
            data: {
              sysparm_processor: processor,
              sysparm_scope: 'global',
              is_portal: reportParams.is_portal,
              start_date: start.format('YYYY-MM-DD').toString(),
              end_date: end.format('YYYY-MM-DD').toString(),
              style_field: reportParams.styleField,
              sysparm_timer: new Date().getTime(),
              sysparm_request_params: JSON.stringify(self.buildRequestParams(reportParams))
            }
          }).done(function doneCb(xml) {
            self.processResponse(xml, fullCalendarCallback);
          }).fail(function failCb(jqXHR, textStatus, error) {
            console.log(textStatus, error);
          });
        }
      }],
      dayClick: function dayClick(date, jsEvent, view) {
        jQuery('#' + self.containerId).fullCalendar('changeView', 'agendaDay');
        jQuery('#' + self.containerId).fullCalendar('gotoDate', date);
      }
    });
  };
  this.buildDrillViewToListLink = function buildDrillViewToListLink(startDateString, endDateString) {
    var $drillToListLink = jQuery('#' + self.containerId + ' #drillViewToList');
    if (!$drillToListLink.length) {
      $drillToListLink = jQuery('<a/>', {
        id: 'drillViewToList',
        class: 'all-records-link',
        target: '_blank'
      }).text(chartHelpers.i18n.viewAllRecords);
      jQuery('#' + self.containerId + ' .highlight-wrap').append($drillToListLink);
    }
    $drillToListLink.attr('href', self.buildDrillViewToListUrl(startDateString, endDateString));
  };
  this.buildDrillViewToListUrl = function buildDrillViewToListUrl(startDate, endDate) {
    var calField = reportParams.cal_field;
    var query = '';
    if (self.combinedFilter)
      query += self.combinedFilter + '^';
    var minutesToSubtract = moment.duration(window.chartHelpers.systemParams.defaultEventDuration, 'HH:mm:ss').asMinutes();
    query += calField + '>=javascript:gs.dateAdd(\'minute\', -' + minutesToSubtract + ', gs.dateGenerate(\'' + startDate + '\',\'start\'))^' + calField + '<=javascript:gs.dateGenerate(\'' + endDate + '\',\'end\')';
    var isStartField = calField.indexOf('_start', calField.length - '_start'.length) !== -1 || calField.indexOf('start_') === 0 || calField.indexOf('_start_') !== -1 || calField === 'start';
    if (isStartField) {
      var calEndField = calField.replace(/start/g, 'end');
      var hasEndField = true;
      if (typeof Table !== 'undefined') {
        var calendarTable = Table.get(reportParams.table);
        if (calendarTable)
          var element = calendarTable.getElement(calEndField);
        if (!element)
          hasEndField = false;
      }
      if (hasEndField) {
        var firstDateBeforeStart = new Moment(startDate).subtract(parseInt(window.chartHelpers.systemParams.maxDaysBack, 10), 'day').format('YYYY-MM-DD');
        query += '^NQ';
        if (self.combinedFilter)
          query += self.combinedFilter + '^';
        query += calField + '>=javascript:gs.dateGenerate(\'' + firstDateBeforeStart + '\',\'start\')^' +
          calField + '<=javascript:gs.dateGenerate(\'' + endDate + '\',\'end\')^' +
          calEndField + '>=javascript:gs.dateGenerate(\'' + startDate + '\',\'start\')^EQ';
      }
    }
    return reportParams.table + '_list.do?sysparm_query=' + encodeURIComponent(query);
  };
  this.drillViewToList = function drillViewToList(event) {
    var startDate = event.data.startDate;
    var endDate = event.data.endDate;
    var drillViewToListUrl = self.buildDrillViewToListUrl(startDate, endDate);
    window.open(drillViewToListUrl, '_blank');
  };
  this.processResponse = function processResponse(response, fullcalendarCallback) {
    if (!response)
      showError(self.containerId, 'No response from the server');
    else {
      var resp = JSON.parse(jQuery(response).find('RESPONSE').text());
      if (resp.STATUS === 'SUCCESS')
        try {
          var responseData = resp.RESPONSE_DATA;
          self.combinedFilter = responseData.filterQuery;
          self.populateStyleFields(responseData.styleFields);
          fullcalendarCallback(responseData.calendarEvents);
          if (responseData.message)
            showMessage(responseData.message, 'INFO');
        } catch (err) {
          showMessage(chartHelpers.i18n.chartGenerationError, 'FAILURE');
          console.log(err);
        }
      else {
        fullcalendarCallback([]);
        showMessage(resp.RESPONSE_DATA, resp.STATUS);
      }
    }
    hideReportIsLoading(findGridWindowFromElementID(self.containerId));
    var now = new Date().getTime();
    var elapsedTime = (now - self.startTime) / 1000;
    console.log('Time taken to render report: ' + elapsedTime);
  };
  this.populateStyleFields = function populateStyleFields(styleFields, args) {
    if (jQuery('#' + self.containerId + ' .highlight-dropdown').length)
      return;
    var $highlightWrap = jQuery('#' + self.containerId).append('<div class="highlight-wrap"/>');
    if (styleFields && styleFields.length) {
      var highlightOptions;
      var selectedOption = '';
      for (var i = 0; i < styleFields.length; i++) {
        if (i === 0)
          highlightOptions += '<option value="">' + chartHelpers.i18n.none + '</option>';
        if (reportParams.styleField)
          if (styleFields[i].name === reportParams.styleField)
            highlightOptions += '<option selected="selected" value="' + styleFields[i].name + '" >' + styleFields[i].label + '</option>';
          else
            highlightOptions += '<option value="' + styleFields[i].name + '" >' + styleFields[i].label + '</option>';
        else
          highlightOptions += '<option  value="' + styleFields[i].name + '" >' + styleFields[i].label + '</option>';
      }
      $highlightWrap.find('.highlight-wrap')
        .append(jQuery('<label for="highlight_field" />').text(chartHelpers.i18n.highlightBasedOn)).append(jQuery('<select id="highlight_field" class="highlight-dropdown form-control"/>')
          .html(highlightOptions));
      jQuery('#' + self.containerId + ' .highlight-dropdown').on('change', function changeCb() {
        reportParams.styleField = this.value;
        jQuery('#' + self.containerId).fullCalendar('refetchEvents');
      });
    }
  };
  this.enableAccessibility = function enableAccessibility() {
    jQuery('#' + self.containerId).find('table').attr('role', 'grid').find('tr')
      .attr('role', 'row')
      .find('.fc-more')
      .attr('tabindex', 0);
    jQuery('#' + self.containerId).find('thead th').attr({
      role: 'columnheader',
      scope: 'col'
    });
    jQuery('#' + self.containerId).find('tbody td').attr({
      role: 'gridcell'
    });
  };
  this.buildRequestParams = function buildRequestParams() {
    return {
      sysparm_cal_field: reportParams.cal_field,
      sysparm_table: reportParams.table,
      sysparm_report_id: reportParams.report_id,
      sysparm_report_source_id: reportParams.report_source_id,
      sysparm_is_report_source_filter_already_combined: reportParams.is_report_source_filter_already_combined,
      sysparm_query: reportParams.filter,
      sysparm_list_ui_view: reportParams.list_ui_view,
      sysparm_homepage_sysid: reportParams.homepage_sysid,
      sysparm_is_published: reportParams.is_published
    };
  };
  this.init();
};
String.prototype.format = function formatString() {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function replaceCb() {
    return args[arguments[1]];
  });
};;
/*! RESOURCE: /scripts/reportcommon/hcformatterfuncs.js */
function hc_legendLabelShortenedFormatter() {
  var legendLabelMaxLength = (this.userOptions !== undefined && this.userOptions.legend_label_max_length !== undefined) ? this.userOptions.legend_label_max_length : 30;
  return this.name.length > legendLabelMaxLength ? this.name.substring(0, legendLabelMaxLength) + '...' : this.name;
}

function hc_legendLabelPercentFormatter() {
  return this.name + ' = ' + this.y_tooltip + ' (' + this.percent + '%)';
}

function hc_legendLabelShortenedPercentFormatter() {
  var shortenedLabel = this.name.length > this.options.legend_label_max_length ? this.name.substring(0, this.options.legend_label_max_length) + '...' : this.name;
  return shortenedLabel + ' = ' + this.y_tooltip + ' (' + this.percent + '%)';
}

function hc_formatNameValueLabel() {
  var label = this.point.name + ' = ' + ((typeof this.point.y_tooltip !== 'undefined') ? this.point.y_tooltip : this.point.y);
  var labelMaxLength = (this.point.data_label_max_length !== undefined) ? this.point.data_label_max_length : 16;
  var truncateLabels = (this.point.truncate_data_labels !== undefined) ? this.point.truncate_data_labels : 'false';
  var removeLeading = (this.point.data_labels_remove_leading !== undefined) ? this.point.data_labels_remove_leading : 'false';
  if (truncateLabels === true && label.length > labelMaxLength)
    label = (removeLeading === true) ? label = '...' + label.substring(label.length - labelMaxLength) : label.substring(0, labelMaxLength) + '...';
  return label;
}

function hc_formatParetoAxisLabels() {
  var total = 1.0;
  var pcnt = Highcharts.numberFormat(((this.value / parseFloat(total)) * 100), 0, '.');
  return pcnt + '%';
}

function hc_formatValueLabel() {
  var label = ((typeof this.point.y_tooltip !== 'undefined') ? this.point.y_tooltip : this.point.y);
  var labelMaxLength = (this.point.data_label_max_length !== undefined) ? this.point.data_label_max_length : 16;
  var truncateLabels = (this.point.truncate_data_labels !== undefined) ? this.point.truncate_data_labels : 'false';
  var removeLeading = (this.point.data_labels_remove_leading !== undefined) ? this.point.data_labels_remove_leading : 'false';
  if (truncateLabels === true && label.length > labelMaxLength)
    label = (removeLeading === true) ? label = '...' + label.substring(label.length - labelMaxLength) : label.substring(0, labelMaxLength) + '...';
  if (label)
    return label;
  return undefined;
}

function hc_formatParetoLabelLine() {
  var label = this.point.percent + '%';
  var labelMaxLength = (this.point.data_label_max_length !== undefined) ? this.point.data_label_max_length : 16;
  var truncateLabels = (this.point.truncate_data_labels !== undefined) ? this.point.truncate_data_labels : 'false';
  var removeLeading = (this.point.data_labels_remove_leading !== undefined) ? this.point.data_labels_remove_leading : 'false';
  if (truncateLabels === true && label.length > labelMaxLength)
    label = (removeLeading === true) ? label = '...' + label.substring(label.length - labelMaxLength) : label.substring(0, labelMaxLength) + '...';
  return label;
}

function hc_formatDurationLabel() {
  var secs = this.value;
  var prepend = '';
  if (secs < 0)
    prepend = '-';
  if (secs < 0)
    secs *= -1;
  var days = Math.floor(secs / 86400);
  var hours = Math.floor((secs % 86400) / 3600);
  var mins = Math.floor(((secs % 86400) % 3600) / 60);
  secs = ((secs % 86400) % 3600) % 60;
  var i18n = this.chart.options.lang;
  if (days > 0)
    return prepend + days + ' ' + i18n.days.toLowerCase() + ' ' + hours + ' ' + i18n.hours.toLowerCase() + ' ' + mins + ' ' + i18n.minutes.toLowerCase() + ' ' + secs + ' ' + i18n.seconds.toLowerCase();
  if (hours > 0)
    return prepend + hours + ' ' + i18n.hours.toLowerCase() + ' ' + mins + ' ' + i18n.minutes.toLowerCase() + ' ' + secs + ' ' + i18n.seconds.toLowerCase();
  if (mins > 0)
    return prepend + mins + ' ' + i18n.minutes.toLowerCase() + ' ' + secs + ' ' + i18n.seconds.toLowerCase();
  return prepend + secs + ' ' + i18n.seconds.toLowerCase();
};
/*! RESOURCE: /scripts/interactive_reports.js */
function getListURL(table, urlInfo, viewName) {
  var url = {};
  url.endpoint = '/' + table + '_list.do';
  url.params = {};
  if (urlInfo)
    url.params.sysparm_query = urlInfo;
  if (viewName)
    url.params.sysparm_view = viewName;
  return generateWholeUrl(url);
}

function generateWholeUrl(url) {
  if (!jQuery.isEmptyObject(url.params))
    return url.endpoint + '?' + Object.keys(url.params).map(function mapFunction(key) {
      return key + '=' + encodeURIComponent(url.params[key]).replace(/%40/gi, '@').replace(/%3A/gi, ':');
    }).join('&');
  return url.endpoint;
}

function drillReport(targetSpan, reportDrillId, newQuery, extraParams) {
  var interactiveReport = {};
  var url = {};
  url.params = {};
  interactiveReport.additional_query = newQuery;
  url.endpoint = '/report_viewer.do';
  var $publicPage = jQuery('#public-page');
  if ($publicPage.length && $publicPage.val() === 'true')
    url.endpoint = '/report_viewer_published.do';
  url.params.jvar_report_id = reportDrillId;
  url.params.sysparm_interactive_report = JSON.stringify(interactiveReport);
  if (extraParams)
    url.endpoint = url.endpoint + '?' + extraParams;
  reportReplace(targetSpan, url, true);
}

function drillList(targetSpan, table, newQuery, listView) {
  var url = {};
  url.endpoint = '/report_viewer.do';
  url.params = {
    sysparm_type: 'list',
    sysparm_query: newQuery,
    sysparm_view: listView,
    sysparm_table: table
  };
  reportReplace(targetSpan, url);
}

function embedReportById(targetSpan, reportId) {
  embedReportByParams(targetSpan, {
    jvar_report_id: reportId
  });
}

function isServicePortal() {
  return jQuery('html').attr('ng-app') === 'ng_spd' || (window.NOW && window.NOW.hasOwnProperty('sp'));
}

function embedReportByParams(targetSpan, params) {
  var url = {};
  url.params = {};
  url.endpoint = '/report_viewer.do';
  if (!isServicePortal())
    url.params.sysparm_inline_embed = 'true';
  if (params)
    for (var key in params)
      if (typeof params[key] !== 'undefined')
        url.params[key] = params[key].toString() || '';
  reportReplace(targetSpan, url);
}

function reportReplace(targetSpan, url, stick) {
  if (!targetSpan)
    throw new Error('Report replace called, but the element to replace was not found!');
  CustomEvent.fireTop('request_start', document);
  url.params = url.params || {};
  url.params.sysparm_nostack = 'true';
  url.params['ni.nolog.x_referer'] = 'ignore';
  url.params.x_referer = buildReferringURL();
  var isPortal = targetSpan.find('.jvar_is_portal').first();
  var rootReportId;
  if (isPortal.length && isPortal.val() === 'true')
    url.params.jvar_is_portal = 'true';
  if (isServicePortal())
    url.params.jvar_is_portal = 'true';
  if (window.isEmbeddedReport === 'true')
    window.location.href = generateWholeUrl(url);
  else {
    if (window.SNC && window.SNC.canvas && SNC.canvas.canvasUtils && SNC.reportResizingFunctions) {
      rootReportId = targetSpan.find('.sysparm_root_report_id').first().val();
      var uuid = SNC.canvas.canvasUtils.getUuidFromSysId(rootReportId);
      if (uuid && SNC.reportResizingFunctions[uuid])
        SNC.canvas.eventbus.unsubscribe(uuid, SNC.reportResizingFunctions[uuid]);
    }
    url.params.sysparm_direct = 'true';
    if (window.isInlineEmbed) {
      rootReportId = targetSpan.find('.sysparm_root_report_id').first().val();
      url.params.sysparm_inline_embed = window.isInlineEmbed[rootReportId];
    }
    showReportIsLoading(findGridWindowFromElement(targetSpan), targetSpan, stick);
    url.params.sysparm_processor = '';
    url.params.sysparm_scope = 'global';
    url.params.jvar_report_id = url.params.jvar_report_id || '';
    url.params.sysparm_interactive_report = url.params.sysparm_interactive_report || '';
    jQuery.ajax({
      method: 'POST',
      url: url.endpoint,
      dataType: 'text',
      data: url.params
    }).done(function doneAjax(xml) {
      reportReplaceCallback(xml, targetSpan);
    }).fail(function failedAjax(jqXHR, textStatus, error) {
      console.log(textStatus, error);
    });
  }
}

function evaluateScriptTags(htmlNode) {
  var arr = htmlNode.getElementsByTagName('script');
  try {
    for (var n = 0; n < arr.length; n++) {
      if (arr[n].type !== 'application/xml' && arr[n].innerHTML)
        eval(arr[n].innerHTML);
    }
  } catch (error) {
    throw new Error(error);
  }
}

function reportReplaceCallback(html, targetSpan) {
  var scrollTop;
  if (window.isMSIE)
    scrollTop = document.body.scrollTop;
  var isList = html.indexOf('chart_type = "list"') > -1;
  if (isRenderedInCanvas()) {
    html += ' <div class="end-of-widget"></div>';
    updateWidgetCacheInCanvas(html, targetSpan);
  }
  if (isList && isServicePortal())
    html = '<div style="margin:20px 10px;">List chart is not supported in Service Portal widgets. Please use Simple List widget instead.</div>';
  if (targetSpan[0])
    targetSpan[0].innerHTML = html;
  var htmlNode = document.createElement('div');
  htmlNode.innerHTML = html;
  if (isList && !isServicePortal())
    html.evalScripts();
  else
    evaluateScriptTags(htmlNode);
  CustomEvent.fireTop('request_complete', document);
  CustomEvent.fire('partial.page.reload', targetSpan);
  if (window.isMSIE)
    document.body.scrollTop = scrollTop;
}

function generateDataPointClickUrl(event, element, reportDrilldown, table, clickUrlInfo, listUiViewName, drillOpenNewWin, isOther, mapKey, actualMap, showDataLabel, showGeographicalLabel) {
  var clickUrl;
  if (typeof jQuery !== 'undefined') {
    var content = jQuery(element).closest('.report_content');
    if (content.length && reportDrilldown) {
      var mapParams = '';
      if (mapKey)
        mapParams = 'sysparm_report_map_key=' + mapKey;
      if (actualMap)
        mapParams += '&sysparm_report_map_parent=' + actualMap;
      if (showDataLabel)
        mapParams += '&sysparm_show_chart_data_label=' + showDataLabel;
      if (showGeographicalLabel)
        mapParams += '&sysparm_show_geographical_label=' + showGeographicalLabel;
      drillReport(content.parent(), reportDrilldown, clickUrlInfo, mapParams);
      return;
    }
    clickUrl = getListURL(table, clickUrlInfo, listUiViewName);
  }
  clickUrl = getListURL(table, clickUrlInfo, listUiViewName);
  if (isServicePortal())
    clickUrl = addNavToUrl(clickUrl);
  openUrl(event, clickUrl, drillOpenNewWin, isOther);
}

function addNavToUrl(url) {
  return '/nav_to.do?uri=' + encodeURIComponent(url);
}

function openUrl(event, clickUrl, drillOpenNewWin, isOther) {
  if (('metaKey' in event && event.metaKey) || event.ctrlKey)
    window.open(clickUrl);
  else if (isServicePortal())
    top.location.href = clickUrl;
  else if (drillOpenNewWin && !isOther)
    window.open(clickUrl);
  else if (clickUrl)
    window.location.href = clickUrl;
}

function applyExecutiveReport(reportId, groupEl, stackEl, filter) {
  var $groupEl = jQuery(groupEl);
  var $stackEl = jQuery(stackEl);
  var target = $groupEl.closest('.report_content');
  if (target.length)
    target = target.parent();
  var interactiveReport = {};
  interactiveReport.groupby = $groupEl.val();
  if (filter)
    interactiveReport.additional_query = filter;
  if ($stackEl)
    interactiveReport.stackby = $stackEl.val();
  var gaugeId = $groupEl.closest('.sysparm_gauge_id');
  var gridWindow;
  if (typeof glideGrid !== 'undefined' && target && target.length)
    gridWindow = glideGrid.getWindow(target.closest('[dragpart]').first().attr('dragpart'));
  else if (gaugeId)
    gridWindow = _getGridWindow(gaugeId.value, reportId);
  if (gridWindow && gridWindow.getDashboardMessageHandler() !== undefined)
    interactiveReport.additional_filters = gridWindow.getDashboardMessageHandler().getCurrentFilters();
  interactiveReport = JSON.stringify(interactiveReport);
  var interactiveReportEl = jQuery('#sysparm_interactive_report')[0];
  if (((typeof runReport === 'function' && interactiveReportEl) || (typeof gReport !== 'undefined' && gReport.isDesigner)) && !filter) {
    if (typeof runReport === 'function') {
      interactiveReportEl.value = interactiveReport;
      runReport(false);
    } else
      NOW.Cus