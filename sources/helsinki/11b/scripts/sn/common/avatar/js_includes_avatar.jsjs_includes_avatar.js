/*! RESOURCE: /scripts/sn/common/avatar/js_includes_avatar.js */
/*! RESOURCE: /scripts/sn/common/presence/js_includes_presence.js */
/*! RESOURCE: /scripts/js_includes_ng_amb.js */
/*! RESOURCE: /scripts/js_includes_amb.js */
/*! RESOURCE: /scripts/thirdparty/cometd/jquery/jquery-1.11.0.min.js */
/*! jQuery v1.11.0 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
! function(a, b) {
  "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function(a) {
    if (!a.document) throw new Error("jQuery requires a window with a document");
    return b(a)
  } : b(a)
}("undefined" != typeof window ? window : this, function(a, b) {
  var c = [],
    d = c.slice,
    e = c.concat,
    f = c.push,
    g = c.indexOf,
    h = {},
    i = h.toString,
    j = h.hasOwnProperty,
    k = "".trim,
    l = {},
    m = "1.11.0",
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
      return d.call(this)
    },
    get: function(a) {
      return null != a ? 0 > a ? this[a + this.length] : this[a] : d.call(this)
    },
    pushStack: function(a) {
      var b = n.merge(this.constructor(), a);
      return b.prevObject = this, b.context = this.context, b
    },
    each: function(a, b) {
      return n.each(this, a, b)
    },
    map: function(a) {
      return this.pushStack(n.map(this, function(b, c) {
        return a.call(b, c, b)
      }))
    },
    slice: function() {
      return this.pushStack(d.apply(this, arguments))
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
      return this.prevObject || this.constructor(null)
    },
    push: f,
    sort: c.sort,
    splice: c.splice
  }, n.extend = n.fn.extend = function() {
    var a, b, c, d, e, f, g = arguments[0] || {},
      h = 1,
      i = arguments.length,
      j = !1;
    for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || n.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++)
      if (null != (e = arguments[h]))
        for (d in e) a = g[d], c = e[d], g !== c && (j && c && (n.isPlainObject(c) || (b = n.isArray(c))) ? (b ? (b = !1, f = a && n.isArray(a) ? a : []) : f = a && n.isPlainObject(a) ? a : {}, g[d] = n.extend(j, f, c)) : void 0 !== c && (g[d] = c));
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
    isArray: Array.isArray || function(a) {
      return "array" === n.type(a)
    },
    isWindow: function(a) {
      return null != a && a == a.window
    },
    isNumeric: function(a) {
      return a - parseFloat(a) >= 0
    },
    isEmptyObject: function(a) {
      var b;
      for (b in a) return !1;
      return !0
    },
    isPlainObject: function(a) {
      var b;
      if (!a || "object" !== n.type(a) || a.nodeType || n.isWindow(a)) return !1;
      try {
        if (a.constructor && !j.call(a, "constructor") && !j.call(a.constructor.prototype, "isPrototypeOf")) return !1
      } catch (c) {
        return !1
      }
      if (l.ownLast)
        for (b in a) return j.call(a, b);
      for (b in a);
      return void 0 === b || j.call(a, b)
    },
    type: function(a) {
      return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? h[i.call(a)] || "object" : typeof a
    },
    globalEval: function(b) {
      b && n.trim(b) && (a.execScript || function(b) {
        a.eval.call(a, b)
      })(b)
    },
    camelCase: function(a) {
      return a.replace(p, "ms-").replace(q, r)
    },
    nodeName: function(a, b) {
      return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase()
    },
    each: function(a, b, c) {
      var d, e = 0,
        f = a.length,
        g = s(a);
      if (c) {
        if (g) {
          for (; f > e; e++)
            if (d = b.apply(a[e], c), d === !1) break
        } else
          for (e in a)
            if (d = b.apply(a[e], c), d === !1) break
      } else if (g) {
        for (; f > e; e++)
          if (d = b.call(a[e], e, a[e]), d === !1) break
      } else
        for (e in a)
          if (d = b.call(a[e], e, a[e]), d === !1) break;
      return a
    },
    trim: k && !k.call("\ufeff\xa0") ? function(a) {
      return null == a ? "" : k.call(a)
    } : function(a) {
      return null == a ? "" : (a + "").replace(o, "")
    },
    makeArray: function(a, b) {
      var c = b || [];
      return null != a && (s(Object(a)) ? n.merge(c, "string" == typeof a ? [a] : a) : f.call(c, a)), c
    },
    inArray: function(a, b, c) {
      var d;
      if (b) {
        if (g) return g.call(b, a, c);
        for (d = b.length, c = c ? 0 > c ? Math.max(0, d + c) : c : 0; d > c; c++)
          if (c in b && b[c] === a) return c
      }
      return -1
    },
    merge: function(a, b) {
      var c = +b.length,
        d = 0,
        e = a.length;
      while (c > d) a[e++] = b[d++];
      if (c !== c)
        while (void 0 !== b[d]) a[e++] = b[d++];
      return a.length = e, a
    },
    grep: function(a, b, c) {
      for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++) d = !b(a[f], f), d !== h && e.push(a[f]);
      return e
    },
    map: function(a, b, c) {
      var d, f = 0,
        g = a.length,
        h = s(a),
        i = [];
      if (h)
        for (; g > f; f++) d = b(a[f], f, c), null != d && i.push(d);
      else
        for (f in a) d = b(a[f], f, c), null != d && i.push(d);
      return e.apply([], i)
    },
    guid: 1,
    proxy: function(a, b) {
      var c, e, f;
      return "string" == typeof b && (f = a[b], b = a, a = f), n.isFunction(a) ? (c = d.call(arguments, 2), e = function() {
        return a.apply(b || this, c.concat(d.call(arguments)))
      }, e.guid = a.guid = a.guid || n.guid++, e) : void 0
    },
    now: function() {
      return +new Date
    },
    support: l
  }), n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(a, b) {
    h["[object " + b + "]"] = b.toLowerCase()
  });

  function s(a) {
    var b = a.length,
      c = n.type(a);
    return "function" === c || n.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a
  }
  var t = function(a) {
    var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s = "sizzle" + -new Date,
      t = a.document,
      u = 0,
      v = 0,
      w = eb(),
      x = eb(),
      y = eb(),
      z = function(a, b) {
        return a === b && (j = !0), 0
      },
      A = "undefined",
      B = 1 << 31,
      C = {}.hasOwnProperty,
      D = [],
      E = D.pop,
      F = D.push,
      G = D.push,
      H = D.slice,
      I = D.indexOf || function(a) {
        for (var b = 0, c = this.length; c > b; b++)
          if (this[b] === a) return b;
        return -1
      },
      J = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
      K = "[\\x20\\t\\r\\n\\f]",
      L = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
      M = L.replace("w", "w#"),
      N = "\\[" + K + "*(" + L + ")" + K + "*(?:([*^$|!~]?=)" + K + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + M + ")|)|)" + K + "*\\]",
      O = ":(" + L + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + N.replace(3, 8) + ")*)|.*)\\)|)",
      P = new RegExp("^" + K + "+|((?:^|[^\\\\])(?:\\\\.)*)" + K + "+$", "g"),
      Q = new RegExp("^" + K + "*," + K + "*"),
      R = new RegExp("^" + K + "*([>+~]|" + K + ")" + K + "*"),
      S = new RegExp("=" + K + "*([^\\]'\"]*?)" + K + "*\\]", "g"),
      T = new RegExp(O),
      U = new RegExp("^" + M + "$"),
      V = {
        ID: new RegExp("^#(" + L + ")"),
        CLASS: new RegExp("^\\.(" + L + ")"),
        TAG: new RegExp("^(" + L.replace("w", "w*") + ")"),
        ATTR: new RegExp("^" + N),
        PSEUDO: new RegExp("^" + O),
        CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + K + "*(even|odd|(([+-]|)(\\d*)n|)" + K + "*(?:([+-]|)" + K + "*(\\d+)|))" + K + "*\\)|)", "i"),
        bool: new RegExp("^(?:" + J + ")$", "i"),
        needsContext: new RegExp("^" + K + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + K + "*((?:-\\d)?\\d*)" + K + "*\\)|)(?=[^-]|$)", "i")
      },
      W = /^(?:input|select|textarea|button)$/i,
      X = /^h\d$/i,
      Y = /^[^{]+\{\s*\[native \w/,
      Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
      $ = /[+~]/,
      _ = /'|\\/g,
      ab = new RegExp("\\\\([\\da-f]{1,6}" + K + "?|(" + K + ")|.)", "ig"),
      bb = function(a, b, c) {
        var d = "0x" + b - 65536;
        return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320)
      };
    try {
      G.apply(D = H.call(t.childNodes), t.childNodes), D[t.childNodes.length].nodeType
    } catch (cb) {
      G = {
        apply: D.length ? function(a, b) {
          F.apply(a, H.call(b))
        } : function(a, b) {
          var c = a.length,
            d = 0;
          while (a[c++] = b[d++]);
          a.length = c - 1
        }
      }
    }

    function db(a, b, d, e) {
      var f, g, h, i, j, m, p, q, u, v;
      if ((b ? b.ownerDocument || b : t) !== l && k(b), b = b || l, d = d || [], !a || "string" != typeof a) return d;
      if (1 !== (i = b.nodeType) && 9 !== i) return [];
      if (n && !e) {
        if (f = Z.exec(a))
          if (h = f[1]) {
            if (9 === i) {
              if (g = b.getElementById(h), !g || !g.parentNode) return d;
              if (g.id === h) return d.push(g), d
            } else if (b.ownerDocument && (g = b.ownerDocument.getElementById(h)) && r(b, g) && g.id === h) return d.push(g), d
          } else {
            if (f[2]) return G.apply(d, b.getElementsByTagName(a)), d;
            if ((h = f[3]) && c.getElementsByClassName && b.getElementsByClassName) return G.apply(d, b.getElementsByClassName(h)), d
          }
        if (c.qsa && (!o || !o.test(a))) {
          if (q = p = s, u = b, v = 9 === i && a, 1 === i && "object" !== b.nodeName.toLowerCase()) {
            m = ob(a), (p = b.getAttribute("id")) ? q = p.replace(_, "\\$&") : b.setAttribute("id", q), q = "[id='" + q + "'] ", j = m.length;
            while (j--) m[j] = q + pb(m[j]);
            u = $.test(a) && mb(b.parentNode) || b, v = m.join(",")
          }
          if (v) try {
            return G.apply(d, u.querySelectorAll(v)), d
          } catch (w) {} finally {
            p || b.removeAttribute("id")
          }
        }
      }
      return xb(a.replace(P, "$1"), b, d, e)
    }

    function eb() {
      var a = [];

      function b(c, e) {
        return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e
      }
      return b
    }

    function fb(a) {
      return a[s] = !0, a
    }

    function gb(a) {
      var b = l.createElement("div");
      try {
        return !!a(b)
      } catch (c) {
        return !1
      } finally {
        b.parentNode && b.parentNode.removeChild(b), b = null
      }
    }

    function hb(a, b) {
      var c = a.split("|"),
        e = a.length;
      while (e--) d.attrHandle[c[e]] = b
    }

    function ib(a, b) {
      var c = b && a,
        d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || B) - (~a.sourceIndex || B);
      if (d) return d;
      if (c)
        while (c = c.nextSibling)
          if (c === b) return -1;
      return a ? 1 : -1
    }

    function jb(a) {
      return function(b) {
        var c = b.nodeName.toLowerCase();
        return "input" === c && b.type === a
      }
    }

    function kb(a) {
      return function(b) {
        var c = b.nodeName.toLowerCase();
        return ("input" === c || "button" === c) && b.type === a
      }
    }

    function lb(a) {
      return fb(function(b) {
        return b = +b, fb(function(c, d) {
          var e, f = a([], c.length, b),
            g = f.length;
          while (g--) c[e = f[g]] && (c[e] = !(d[e] = c[e]))
        })
      })
    }

    function mb(a) {
      return a && typeof a.getElementsByTagName !== A && a
    }
    c = db.support = {}, f = db.isXML = function(a) {
      var b = a && (a.ownerDocument || a).documentElement;
      return b ? "HTML" !== b.nodeName : !1
    }, k = db.setDocument = function(a) {
      var b, e = a ? a.ownerDocument || a : t,
        g = e.defaultView;
      return e !== l && 9 === e.nodeType && e.documentElement ? (l = e, m = e.documentElement, n = !f(e), g && g !== g.top && (g.addEventListener ? g.addEventListener("unload", function() {
        k()
      }, !1) : g.attachEvent && g.attachEvent("onunload", function() {
        k()
      })), c.attributes = gb(function(a) {
        return a.className = "i", !a.getAttribute("className")
      }), c.getElementsByTagName = gb(function(a) {
        return a.appendChild(e.createComment("")), !a.getElementsByTagName("*").length
      }), c.getElementsByClassName = Y.test(e.getElementsByClassName) && gb(function(a) {
        return a.innerHTML = "<div class='a'></div><div class='a i'></div>", a.firstChild.className = "i", 2 === a.getElementsByClassName("i").length
      }), c.getById = gb(function(a) {
        return m.appendChild(a).id = s, !e.getElementsByName || !e.getElementsByName(s).length
      }), c.getById ? (d.find.ID = function(a, b) {
        if (typeof b.getElementById !== A && n) {
          var c = b.getElementById(a);
          return c && c.parentNode ? [c] : []
        }
      }, d.filter.ID = function(a) {
        var b = a.replace(ab, bb);
        return function(a) {
          return a.getAttribute("id") === b
        }
      }) : (delete d.find.ID, d.filter.ID = function(a) {
        var b = a.replace(ab, bb);
        return function(a) {
          var c = typeof a.getAttributeNode !== A && a.getAttributeNode("id");
          return c && c.value === b
        }
      }), d.find.TAG = c.getElementsByTagName ? function(a, b) {
        return typeof b.getElementsByTagName !== A ? b.getElementsByTagName(a) : void 0
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
        return typeof b.getElementsByClassName !== A && n ? b.getElementsByClassName(a) : void 0
      }, p = [], o = [], (c.qsa = Y.test(e.querySelectorAll)) && (gb(function(a) {
        a.innerHTML = "<select t=''><option selected=''></option></select>", a.querySelectorAll("[t^='']").length && o.push("[*^$]=" + K + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || o.push("\\[" + K + "*(?:value|" + J + ")"), a.querySelectorAll(":checked").length || o.push(":checked")
      }), gb(function(a) {
        var b = e.createElement("input");
        b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && o.push("name" + K + "*[*^$|!~]?="), a.querySelectorAll(":enabled").length || o.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), o.push(",.*:")
      })), (c.matchesSelector = Y.test(q = m.webkitMatchesSelector || m.mozMatchesSelector || m.oMatchesSelector || m.msMatchesSelector)) && gb(function(a) {
        c.disconnectedMatch = q.call(a, "div"), q.call(a, "[s!='']:x"), p.push("!=", O)
      }), o = o.length && new RegExp(o.join("|")), p = p.length && new RegExp(p.join("|")), b = Y.test(m.compareDocumentPosition), r = b || Y.test(m.contains) ? function(a, b) {
        var c = 9 === a.nodeType ? a.documentElement : a,
          d = b && b.parentNode;
        return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)))
      } : function(a, b) {
        if (b)
          while (b = b.parentNode)
            if (b === a) return !0;
        return !1
      }, z = b ? function(a, b) {
        if (a === b) return j = !0, 0;
        var d = !a.compareDocumentPosition - !b.compareDocumentPosition;
        return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === e || a.ownerDocument === t && r(t, a) ? -1 : b === e || b.ownerDocument === t && r(t, b) ? 1 : i ? I.call(i, a) - I.call(i, b) : 0 : 4 & d ? -1 : 1)
      } : function(a, b) {
        if (a === b) return j = !0, 0;
        var c, d = 0,
          f = a.parentNode,
          g = b.parentNode,
          h = [a],
          k = [b];
        if (!f || !g) return a === e ? -1 : b === e ? 1 : f ? -1 : g ? 1 : i ? I.call(i, a) - I.call(i, b) : 0;
        if (f === g) return ib(a, b);
        c = a;
        while (c = c.parentNode) h.unshift(c);
        c = b;
        while (c = c.parentNode) k.unshift(c);
        while (h[d] === k[d]) d++;
        return d ? ib(h[d], k[d]) : h[d] === t ? -1 : k[d] === t ? 1 : 0
      }, e) : l
    }, db.matches = function(a, b) {
      return db(a, null, null, b)
    }, db.matchesSelector = function(a, b) {
      if ((a.ownerDocument || a) !== l && k(a), b = b.replace(S, "='$1']"), !(!c.matchesSelector || !n || p && p.test(b) || o && o.test(b))) try {
        var d = q.call(a, b);
        if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d
      } catch (e) {}
      return db(b, l, null, [a]).length > 0
    }, db.contains = function(a, b) {
      return (a.ownerDocument || a) !== l && k(a), r(a, b)
    }, db.attr = function(a, b) {
      (a.ownerDocument || a) !== l && k(a);
      var e = d.attrHandle[b.toLowerCase()],
        f = e && C.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !n) : void 0;
      return void 0 !== f ? f : c.attributes || !n ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null
    }, db.error = function(a) {
      throw new Error("Syntax error, unrecognized expression: " + a)
    }, db.uniqueSort = function(a) {
      var b, d = [],
        e = 0,
        f = 0;
      if (j = !c.detectDuplicates, i = !c.sortStable && a.slice(0), a.sort(z), j) {
        while (b = a[f++]) b === a[f] && (e = d.push(f));
        while (e--) a.splice(d[e], 1)
      }
      return i = null, a
    }, e = db.getText = function(a) {
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
    }, d = db.selectors = {
      cacheLength: 50,
      createPseudo: fb,
      match: V,
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
          return a[1] = a[1].replace(ab, bb), a[3] = (a[4] || a[5] || "").replace(ab, bb), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4)
        },
        CHILD: function(a) {
          return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || db.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && db.error(a[0]), a
        },
        PSEUDO: function(a) {
          var b, c = !a[5] && a[2];
          return V.CHILD.test(a[0]) ? null : (a[3] && void 0 !== a[4] ? a[2] = a[4] : c && T.test(c) && (b = ob(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3))
        }
      },
      filter: {
        TAG: function(a) {
          var b = a.replace(ab, bb).toLowerCase();
          return "*" === a ? function() {
            return !0
          } : function(a) {
            return a.nodeName && a.nodeName.toLowerCase() === b
          }
        },
        CLASS: function(a) {
          var b = w[a + " "];
          return b || (b = new RegExp("(^|" + K + ")" + a + "(" + K + "|$)")) && w(a, function(a) {
            return b.test("string" == typeof a.className && a.className || typeof a.getAttribute !== A && a.getAttribute("class") || "")
          })
        },
        ATTR: function(a, b, c) {
          return function(d) {
            var e = db.attr(d, a);
            return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0
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
              t = !i && !h;
            if (q) {
              if (f) {
                while (p) {
                  l = b;
                  while (l = l[p])
                    if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) return !1;
                  o = p = "only" === a && !o && "nextSibling"
                }
                return !0
              }
              if (o = [g ? q.firstChild : q.lastChild], g && t) {
                k = q[s] || (q[s] = {}), j = k[a] || [], n = j[0] === u && j[1], m = j[0] === u && j[2], l = n && q.childNodes[n];
                while (l = ++n && l && l[p] || (m = n = 0) || o.pop())
                  if (1 === l.nodeType && ++m && l === b) {
                    k[a] = [u, n, m];
                    break
                  }
              } else if (t && (j = (b[s] || (b[s] = {}))[a]) && j[0] === u) m = j[1];
              else
                while (l = ++n && l && l[p] || (m = n = 0) || o.pop())
                  if ((h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) && ++m && (t && ((l[s] || (l[s] = {}))[a] = [u, m]), l === b)) break;
              return m -= e, m === d || m % d === 0 && m / d >= 0
            }
          }
        },
        PSEUDO: function(a, b) {
          var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || db.error("unsupported pseudo: " + a);
          return e[s] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? fb(function(a, c) {
            var d, f = e(a, b),
              g = f.length;
            while (g--) d = I.call(a, f[g]), a[d] = !(c[d] = f[g])
          }) : function(a) {
            return e(a, 0, c)
          }) : e
        }
      },
      pseudos: {
        not: fb(function(a) {
          var b = [],
            c = [],
            d = g(a.replace(P, "$1"));
          return d[s] ? fb(function(a, b, c, e) {
            var f, g = d(a, null, e, []),
              h = a.length;
            while (h--)(f = g[h]) && (a[h] = !(b[h] = f))
          }) : function(a, e, f) {
            return b[0] = a, d(b, null, f, c), !c.pop()
          }
        }),
        has: fb(function(a) {
          return function(b) {
            return db(a, b).length > 0
          }
        }),
        contains: fb(function(a) {
          return function(b) {
            return (b.textContent || b.innerText || e(b)).indexOf(a) > -1
          }
        }),
        lang: fb(function(a) {
          return U.test(a || "") || db.error("unsupported lang: " + a), a = a.replace(ab, bb).toLowerCase(),
            function(b) {
              var c;
              do
                if (c = n ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType);
              return !1
            }
        }),
        target: function(b) {
          var c = a.location && a.location.hash;
          return c && c.slice(1) === b.id
        },
        root: function(a) {
          return a === m
        },
        focus: function(a) {
          return a === l.activeElement && (!l.hasFocus || l.hasFocus()) && !!(a.type || a.href || ~a.tabIndex)
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
          return X.test(a.nodeName)
        },
        input: function(a) {
          return W.test(a.nodeName)
        },
        button: function(a) {
          var b = a.nodeName.toLowerCase();
          return "input" === b && "button" === a.type || "button" === b
        },
        text: function(a) {
          var b;
          return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase())
        },
        first: lb(function() {
          return [0]
        }),
        last: lb(function(a, b) {
          return [b - 1]
        }),
        eq: lb(function(a, b, c) {
          return [0 > c ? c + b : c]
        }),
        even: lb(function(a, b) {
          for (var c = 0; b > c; c += 2) a.push(c);
          return a
        }),
        odd: lb(function(a, b) {
          for (var c = 1; b > c; c += 2) a.push(c);
          return a
        }),
        lt: lb(function(a, b, c) {
          for (var d = 0 > c ? c + b : c; --d >= 0;) a.push(d);
          return a
        }),
        gt: lb(function(a, b, c) {
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
      }) d.pseudos[b] = jb(b);
    for (b in {
        submit: !0,
        reset: !0
      }) d.pseudos[b] = kb(b);

    function nb() {}
    nb.prototype = d.filters = d.pseudos, d.setFilters = new nb;

    function ob(a, b) {
      var c, e, f, g, h, i, j, k = x[a + " "];
      if (k) return b ? 0 : k.slice(0);
      h = a, i = [], j = d.preFilter;
      while (h) {
        (!c || (e = Q.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = R.exec(h)) && (c = e.shift(), f.push({
          value: c,
          type: e[0].replace(P, " ")
        }), h = h.slice(c.length));
        for (g in d.filter) !(e = V[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({
          value: c,
          type: g,
          matches: e
        }), h = h.slice(c.length));
        if (!c) break
      }
      return b ? h.length : h ? db.error(a) : x(a, i).slice(0)
    }

    function pb(a) {
      for (var b = 0, c = a.length, d = ""; c > b; b++) d += a[b].value;
      return d
    }

    function qb(a, b, c) {
      var d = b.dir,
        e = c && "parentNode" === d,
        f = v++;
      return b.first ? function(b, c, f) {
        while (b = b[d])
          if (1 === b.nodeType || e) return a(b, c, f)
      } : function(b, c, g) {
        var h, i, j = [u, f];
        if (g) {
          while (b = b[d])
            if ((1 === b.nodeType || e) && a(b, c, g)) return !0
        } else
          while (b = b[d])
            if (1 === b.nodeType || e) {
              if (i = b[s] || (b[s] = {}), (h = i[d]) && h[0] === u && h[1] === f) return j[2] = h[2];
              if (i[d] = j, j[2] = a(b, c, g)) return !0
            }
      }
    }

    function rb(a) {
      return a.length > 1 ? function(b, c, d) {
        var e = a.length;
        while (e--)
          if (!a[e](b, c, d)) return !1;
        return !0
      } : a[0]
    }

    function sb(a, b, c, d, e) {
      for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++)(f = a[h]) && (!c || c(f, d, e)) && (g.push(f), j && b.push(h));
      return g
    }

    function tb(a, b, c, d, e, f) {
      return d && !d[s] && (d = tb(d)), e && !e[s] && (e = tb(e, f)), fb(function(f, g, h, i) {
        var j, k, l, m = [],
          n = [],
          o = g.length,
          p = f || wb(b || "*", h.nodeType ? [h] : h, []),
          q = !a || !f && b ? p : sb(p, m, a, h, i),
          r = c ? e || (f ? a : o || d) ? [] : g : q;
        if (c && c(q, r, h, i), d) {
          j = sb(r, n), d(j, [], h, i), k = j.length;
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
            while (k--)(l = r[k]) && (j = e ? I.call(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l))
          }
        } else r = sb(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : G.apply(g, r)
      })
    }

    function ub(a) {
      for (var b, c, e, f = a.length, g = d.relative[a[0].type], i = g || d.relative[" "], j = g ? 1 : 0, k = qb(function(a) {
          return a === b
        }, i, !0), l = qb(function(a) {
          return I.call(b, a) > -1
        }, i, !0), m = [function(a, c, d) {
          return !g && (d || c !== h) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d))
        }]; f > j; j++)
        if (c = d.relative[a[j].type]) m = [qb(rb(m), c)];
        else {
          if (c = d.filter[a[j].type].apply(null, a[j].matches), c[s]) {
            for (e = ++j; f > e; e++)
              if (d.relative[a[e].type]) break;
            return tb(j > 1 && rb(m), j > 1 && pb(a.slice(0, j - 1).concat({
              value: " " === a[j - 2].type ? "*" : ""
            })).replace(P, "$1"), c, e > j && ub(a.slice(j, e)), f > e && ub(a = a.slice(e)), f > e && pb(a))
          }
          m.push(c)
        }
      return rb(m)
    }

    function vb(a, b) {
      var c = b.length > 0,
        e = a.length > 0,
        f = function(f, g, i, j, k) {
          var m, n, o, p = 0,
            q = "0",
            r = f && [],
            s = [],
            t = h,
            v = f || e && d.find.TAG("*", k),
            w = u += null == t ? 1 : Math.random() || .1,
            x = v.length;
          for (k && (h = g !== l && g); q !== x && null != (m = v[q]); q++) {
            if (e && m) {
              n = 0;
              while (o = a[n++])
                if (o(m, g, i)) {
                  j.push(m);
                  break
                }
              k && (u = w)
            }
            c && ((m = !o && m) && p--, f && r.push(m))
          }
          if (p += q, c && q !== p) {
            n = 0;
            while (o = b[n++]) o(r, s, g, i);
            if (f) {
              if (p > 0)
                while (q--) r[q] || s[q] || (s[q] = E.call(j));
              s = sb(s)
            }
            G.apply(j, s), k && !f && s.length > 0 && p + b.length > 1 && db.uniqueSort(j)
          }
          return k && (u = w, h = t), r
        };
      return c ? fb(f) : f
    }
    g = db.compile = function(a, b) {
      var c, d = [],
        e = [],
        f = y[a + " "];
      if (!f) {
        b || (b = ob(a)), c = b.length;
        while (c--) f = ub(b[c]), f[s] ? d.push(f) : e.push(f);
        f = y(a, vb(e, d))
      }
      return f
    };

    function wb(a, b, c) {
      for (var d = 0, e = b.length; e > d; d++) db(a, b[d], c);
      return c
    }

    function xb(a, b, e, f) {
      var h, i, j, k, l, m = ob(a);
      if (!f && 1 === m.length) {
        if (i = m[0] = m[0].slice(0), i.length > 2 && "ID" === (j = i[0]).type && c.getById && 9 === b.nodeType && n && d.relative[i[1].type]) {
          if (b = (d.find.ID(j.matches[0].replace(ab, bb), b) || [])[0], !b) return e;
          a = a.slice(i.shift().value.length)
        }
        h = V.needsContext.test(a) ? 0 : i.length;
        while (h--) {
          if (j = i[h], d.relative[k = j.type]) break;
          if ((l = d.find[k]) && (f = l(j.matches[0].replace(ab, bb), $.test(i[0].type) && mb(b.parentNode) || b))) {
            if (i.splice(h, 1), a = f.length && pb(i), !a) return G.apply(e, f), e;
            break
          }
        }
      }
      return g(a, m)(f, b, !n, e, $.test(a) && mb(b.parentNode) || b), e
    }
    return c.sortStable = s.split("").sort(z).join("") === s, c.detectDuplicates = !!j, k(), c.sortDetached = gb(function(a) {
      return 1 & a.compareDocumentPosition(l.createElement("div"))
    }), gb(function(a) {
      return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href")
    }) || hb("type|href|height|width", function(a, b, c) {
      return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2)
    }), c.attributes && gb(function(a) {
      return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value")
    }) || hb("value", function(a, b, c) {
      return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue
    }), gb(function(a) {
      return null == a.getAttribute("disabled")
    }) || hb(J, function(a, b, c) {
      var d;
      return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null
    }), db
  }(a);
  n.find = t, n.expr = t.selectors, n.expr[":"] = n.expr.pseudos, n.unique = t.uniqueSort, n.text = t.getText, n.isXMLDoc = t.isXML, n.contains = t.contains;
  var u = n.expr.match.needsContext,
    v = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    w = /^.[^:#\[\.,]*$/;

  function x(a, b, c) {
    if (n.isFunction(b)) return n.grep(a, function(a, d) {
      return !!b.call(a, d, a) !== c
    });
    if (b.nodeType) return n.grep(a, function(a) {
      return a === b !== c
    });
    if ("string" == typeof b) {
      if (w.test(b)) return n.filter(b, a, c);
      b = n.filter(b, a)
    }
    return n.grep(a, function(a) {
      return n.inArray(a, b) >= 0 !== c
    })
  }
  n.filter = function(a, b, c) {
    var d = b[0];
    return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? n.find.matchesSelector(d, a) ? [d] : [] : n.find.matches(a, n.grep(b, function(a) {
      return 1 === a.nodeType
    }))
  }, n.fn.extend({
    find: function(a) {
      var b, c = [],
        d = this,
        e = d.length;
      if ("string" != typeof a) return this.pushStack(n(a).filter(function() {
        for (b = 0; e > b; b++)
          if (n.contains(d[b], this)) return !0
      }));
      for (b = 0; e > b; b++) n.find(a, d[b], c);
      return c = this.pushStack(e > 1 ? n.unique(c) : c), c.selector = this.selector ? this.selector + " " + a : a, c
    },
    filter: function(a) {
      return this.pushStack(x(this, a || [], !1))
    },
    not: function(a) {
      return this.pushStack(x(this, a || [], !0))
    },
    is: function(a) {
      return !!x(this, "string" == typeof a && u.test(a) ? n(a) : a || [], !1).length
    }
  });
  var y, z = a.document,
    A = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
    B = n.fn.init = function(a, b) {
      var c, d;
      if (!a) return this;
      if ("string" == typeof a) {
        if (c = "<" === a.charAt(0) && ">" === a.charAt(a.length - 1) && a.length >= 3 ? [null, a, null] : A.exec(a), !c || !c[1] && b) return !b || b.jquery ? (b || y).find(a) : this.constructor(b).find(a);
        if (c[1]) {
          if (b = b instanceof n ? b[0] : b, n.merge(this, n.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : z, !0)), v.test(c[1]) && n.isPlainObject(b))
            for (c in b) n.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]);
          return this
        }
        if (d = z.getElementById(c[2]), d && d.parentNode) {
          if (d.id !== c[2]) return y.find(a);
          this.length = 1, this[0] = d
        }
        return this.context = z, this.selector = a, this
      }
      return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : n.isFunction(a) ? "undefined" != typeof y.ready ? y.ready(a) : a(n) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), n.makeArray(a, this))
    };
  B.prototype = n.fn, y = n(z);
  var C = /^(?:parents|prev(?:Until|All))/,
    D = {
      children: !0,
      contents: !0,
      next: !0,
      prev: !0
    };
  n.extend({
    dir: function(a, b, c) {
      var d = [],
        e = a[b];
      while (e && 9 !== e.nodeType && (void 0 === c || 1 !== e.nodeType || !n(e).is(c))) 1 === e.nodeType && d.push(e), e = e[b];
      return d
    },
    sibling: function(a, b) {
      for (var c = []; a; a = a.nextSibling) 1 === a.nodeType && a !== b && c.push(a);
      return c
    }
  }), n.fn.extend({
    has: function(a) {
      var b, c = n(a, this),
        d = c.length;
      return this.filter(function() {
        for (b = 0; d > b; b++)
          if (n.contains(this, c[b])) return !0
      })
    },
    closest: function(a, b) {
      for (var c, d = 0, e = this.length, f = [], g = u.test(a) || "string" != typeof a ? n(a, b || this.context) : 0; e > d; d++)
        for (c = this[d]; c && c !== b; c = c.parentNode)
          if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && n.find.matchesSelector(c, a))) {
            f.push(c);
            break
          }
      return this.pushStack(f.length > 1 ? n.unique(f) : f)
    },
    index: function(a) {
      return a ? "string" == typeof a ? n.inArray(this[0], n(a)) : n.inArray(a.jquery ? a[0] : a, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
    },
    add: function(a, b) {
      return this.pushStack(n.unique(n.merge(this.get(), n(a, b))))
    },
    addBack: function(a) {
      return this.add(null == a ? this.prevObject : this.prevObject.filter(a))
    }
  });

  function E(a, b) {
    do a = a[b]; while (a && 1 !== a.nodeType);
    return a
  }
  n.each({
    parent: function(a) {
      var b = a.parentNode;
      return b && 11 !== b.nodeType ? b : null
    },
    parents: function(a) {
      return n.dir(a, "parentNode")
    },
    parentsUntil: function(a, b, c) {
      return n.dir(a, "parentNode", c)
    },
    next: function(a) {
      return E(a, "nextSibling")
    },
    prev: function(a) {
      return E(a, "previousSibling")
    },
    nextAll: function(a) {
      return n.dir(a, "nextSibling")
    },
    prevAll: function(a) {
      return n.dir(a, "previousSibling")
    },
    nextUntil: function(a, b, c) {
      return n.dir(a, "nextSibling", c)
    },
    prevUntil: function(a, b, c) {
      return n.dir(a, "previousSibling", c)
    },
    siblings: function(a) {
      return n.sibling((a.parentNode || {}).firstChild, a)
    },
    children: function(a) {
      return n.sibling(a.firstChild)
    },
    contents: function(a) {
      return n.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : n.merge([], a.childNodes)
    }
  }, function(a, b) {
    n.fn[a] = function(c, d) {
      var e = n.map(this, b, c);
      return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = n.filter(d, e)), this.length > 1 && (D[a] || (e = n.unique(e)), C.test(a) && (e = e.reverse())), this.pushStack(e)
    }
  });
  var F = /\S+/g,
    G = {};

  function H(a) {
    var b = G[a] = {};
    return n.each(a.match(F) || [], function(a, c) {
      b[c] = !0
    }), b
  }
  n.Callbacks = function(a) {
    a = "string" == typeof a ? G[a] || H(a) : n.extend({}, a);
    var b, c, d, e, f, g, h = [],
      i = !a.once && [],
      j = function(l) {
        for (c = a.memory && l, d = !0, f = g || 0, g = 0, e = h.length, b = !0; h && e > f; f++)
          if (h[f].apply(l[0], l[1]) === !1 && a.stopOnFalse) {
            c = !1;
            break
          }
        b = !1, h && (i ? i.length && j(i.shift()) : c ? h = [] : k.disable())
      },
      k = {
        add: function() {
          if (h) {
            var d = h.length;
            ! function f(b) {
              n.each(b, function(b, c) {
                var d = n.type(c);
                "function" === d ? a.unique && k.has(c) || h.push(c) : c && c.length && "string" !== d && f(c)
              })
            }(arguments), b ? e = h.length : c && (g = d, j(c))
          }
          return this
        },
        remove: function() {
          return h && n.each(arguments, function(a, c) {
            var d;
            while ((d = n.inArray(c, h, d)) > -1) h.splice(d, 1), b && (e >= d && e--, f >= d && f--)
          }), this
        },
        has: function(a) {
          return a ? n.inArray(a, h) > -1 : !(!h || !h.length)
        },
        empty: function() {
          return h = [], e = 0, this
        },
        disable: function() {
          return h = i = c = void 0, this
        },
        disabled: function() {
          return !h
        },
        lock: function() {
          return i = void 0, c || k.disable(), this
        },
        locked: function() {
          return !i
        },
        fireWith: function(a, c) {
          return !h || d && !i || (c = c || [], c = [a, c.slice ? c.slice() : c], b ? i.push(c) : j(c)), this
        },
        fire: function() {
          return k.fireWith(this, arguments), this
        },
        fired: function() {
          return !!d
        }
      };
    return k
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
                  a && n.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [a] : arguments)
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
        c = d.call(arguments),
        e = c.length,
        f = 1 !== e || a && n.isFunction(a.promise) ? e : 0,
        g = 1 === f ? a : n.Deferred(),
        h = function(a, b, c) {
          return function(e) {
            b[a] = this, c[a] = arguments.length > 1 ? d.call(arguments) : e, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c)
          }
        },
        i, j, k;
      if (e > 1)
        for (i = new Array(e), j = new Array(e), k = new Array(e); e > b; b++) c[b] && n.isFunction(c[b].promise) ? c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)) : --f;
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
      if (a === !0 ? !--n.readyWait : !n.isReady) {
        if (!z.body) return setTimeout(n.ready);
        n.isReady = !0, a !== !0 && --n.readyWait > 0 || (I.resolveWith(z, [n]), n.fn.trigger && n(z).trigger("ready").off("ready"))
      }
    }
  });

  function J() {
    z.addEventListener ? (z.removeEventListener("DOMContentLoaded", K, !1), a.removeEventListener("load", K, !1)) : (z.detachEvent("onreadystatechange", K), a.detachEvent("onload", K))
  }

  function K() {
    (z.addEventListener || "load" === event.type || "complete" === z.readyState) && (J(), n.ready())
  }
  n.ready.promise = function(b) {
    if (!I)
      if (I = n.Deferred(), "complete" === z.readyState) setTimeout(n.ready);
      else if (z.addEventListener) z.addEventListener("DOMContentLoaded", K, !1), a.addEventListener("load", K, !1);
    else {
      z.attachEvent("onreadystatechange", K), a.attachEvent("onload", K);
      var c = !1;
      try {
        c = null == a.frameElement && z.documentElement
      } catch (d) {}
      c && c.doScroll && ! function e() {
        if (!n.isReady) {
          try {
            c.doScroll("left")
          } catch (a) {
            return setTimeout(e, 50)
          }
          J(), n.ready()
        }
      }()
    }
    return I.promise(b)
  };
  var L = "undefined",
    M;
  for (M in n(l)) break;
  l.ownLast = "0" !== M, l.inlineBlockNeedsLayout = !1, n(function() {
      var a, b, c = z.getElementsByTagName("body")[0];
      c && (a = z.createElement("div"), a.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", b = z.createElement("div"), c.appendChild(a).appendChild(b), typeof b.style.zoom !== L && (b.style.cssText = "border:0;margin:0;width:1px;padding:1px;display:inline;zoom:1", (l.inlineBlockNeedsLayout = 3 === b.offsetWidth) && (c.style.zoom = 1)), c.removeChild(a), a = b = null)
    }),
    function() {
      var a = z.createElement("div");
      if (null == l.deleteExpando) {
        l.deleteExpando = !0;
        try {
          delete a.test
        } catch (b) {
          l.deleteExpando = !1
        }
      }
      a = null
    }(), n.acceptData = function(a) {
      var b = n.noData[(a.nodeName + " ").toLowerCase()],
        c = +a.nodeType || 1;
      return 1 !== c && 9 !== c ? !1 : !b || b !== !0 && a.getAttribute("classid") === b
    };
  var N = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    O = /([A-Z])/g;

  function P(a, b, c) {
    if (void 0 === c && 1 === a.nodeType) {
      var d = "data-" + b.replace(O, "-$1").toLowerCase();
      if (c = a.getAttribute(d), "string" == typeof c) {
        try {
          c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : N.test(c) ? n.parseJSON(c) : c
        } catch (e) {}
        n.data(a, b, c)
      } else c = void 0
    }
    return c
  }

  function Q(a) {
    var b;
    for (b in a)
      if (("data" !== b || !n.isEmptyObject(a[b])) && "toJSON" !== b) return !1;
    return !0
  }

  function R(a, b, d, e) {
    if (n.acceptData(a)) {
      var f, g, h = n.expando,
        i = a.nodeType,
        j = i ? n.cache : a,
        k = i ? a[h] : a[h] && h;
      if (k && j[k] && (e || j[k].data) || void 0 !== d || "string" != typeof b) return k || (k = i ? a[h] = c.pop() || n.guid++ : h), j[k] || (j[k] = i ? {} : {
        toJSON: n.noop
      }), ("object" == typeof b || "function" == typeof b) && (e ? j[k] = n.extend(j[k], b) : j[k].data = n.extend(j[k].data, b)), g = j[k], e || (g.data || (g.data = {}), g = g.data), void 0 !== d && (g[n.camelCase(b)] = d), "string" == typeof b ? (f = g[b], null == f && (f = g[n.camelCase(b)])) : f = g, f
    }
  }

  function S(a, b, c) {
    if (n.acceptData(a)) {
      var d, e, f = a.nodeType,
        g = f ? n.cache : a,
        h = f ? a[n.expando] : n.expando;
      if (g[h]) {
        if (b && (d = c ? g[h] : g[h].data)) {
          n.isArray(b) ? b = b.concat(n.map(b, n.camelCase)) : b in d ? b = [b] : (b = n.camelCase(b), b = b in d ? [b] : b.split(" ")), e = b.length;
          while (e--) delete d[b[e]];
          if (c ? !Q(d) : !n.isEmptyObject(d)) return
        }(c || (delete g[h].data, Q(g[h]))) && (f ? n.cleanData([a], !0) : l.deleteExpando || g != g.window ? delete g[h] : g[h] = null)
      }
    }
  }
  n.extend({
    cache: {},
    noData: {
      "applet ": !0,
      "embed ": !0,
      "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
    },
    hasData: function(a) {
      return a = a.nodeType ? n.cache[a[n.expando]] : a[n.expando], !!a && !Q(a)
    },
    data: function(a, b, c) {
      return R(a, b, c)
    },
    removeData: function(a, b) {
      return S(a, b)
    },
    _data: function(a, b, c) {
      return R(a, b, c, !0)
    },
    _removeData: function(a, b) {
      return S(a, b, !0)
    }
  }), n.fn.extend({
    data: function(a, b) {
      var c, d, e, f = this[0],
        g = f && f.attributes;
      if (void 0 === a) {
        if (this.length && (e = n.data(f), 1 === f.nodeType && !n._data(f, "parsedAttrs"))) {
          c = g.length;
          while (c--) d = g[c].name, 0 === d.indexOf("data-") && (d = n.camelCase(d.slice(5)), P(f, d, e[d]));
          n._data(f, "parsedAttrs", !0)
        }
        return e
      }
      return "object" == typeof a ? this.each(function() {
        n.data(this, a)
      }) : arguments.length > 1 ? this.each(function() {
        n.data(this, a, b)
      }) : f ? P(f, a, n.data(f, a)) : void 0
    },
    removeData: function(a) {
      return this.each(function() {
        n.removeData(this, a)
      })
    }
  }), n.extend({
    queue: function(a, b, c) {
      var d;
      return a ? (b = (b || "fx") + "queue", d = n._data(a, b), c && (!d || n.isArray(c) ? d = n._data(a, b, n.makeArray(c)) : d.push(c)), d || []) : void 0
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
      return n._data(a, c) || n._data(a, c, {
        empty: n.Callbacks("once memory").add(function() {
          n._removeData(a, b + "queue"), n._removeData(a, c)
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
      while (g--) c = n._data(f[g], a + "queueHooks"), c && c.empty && (d++, c.empty.add(h));
      return h(), e.promise(b)
    }
  });
  var T = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
    U = ["Top", "Right", "Bottom", "Left"],
    V = function(a, b) {
      return a = b || a, "none" === n.css(a, "display") || !n.contains(a.ownerDocument, a)
    },
    W = n.access = function(a, b, c, d, e, f, g) {
      var h = 0,
        i = a.length,
        j = null == c;
      if ("object" === n.type(c)) {
        e = !0;
        for (h in c) n.access(a, b, h, c[h], !0, f, g)
      } else if (void 0 !== d && (e = !0, n.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function(a, b, c) {
          return j.call(n(a), c)
        })), b))
        for (; i > h; h++) b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c)));
      return e ? a : j ? b.call(a) : i ? b(a[0], c) : f
    },
    X = /^(?:checkbox|radio)$/i;
  ! function() {
    var a = z.createDocumentFragment(),
      b = z.createElement("div"),
      c = z.createElement("input");
    if (b.setAttribute("className", "t"), b.innerHTML = "  <link/><table></table><a href='/a'>a</a>", l.leadingWhitespace = 3 === b.firstChild.nodeType, l.tbody = !b.getElementsByTagName("tbody").length, l.htmlSerialize = !!b.getElementsByTagName("link").length, l.html5Clone = "<:nav></:nav>" !== z.createElement("nav").cloneNode(!0).outerHTML, c.type = "checkbox", c.checked = !0, a.appendChild(c), l.appendChecked = c.checked, b.innerHTML = "<textarea>x</textarea>", l.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue, a.appendChild(b), b.innerHTML = "<input type='radio' checked='checked' name='t'/>", l.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, l.noCloneEvent = !0, b.attachEvent && (b.attachEvent("onclick", function() {
        l.noCloneEvent = !1
      }), b.cloneNode(!0).click()), null == l.deleteExpando) {
      l.deleteExpando = !0;
      try {
        delete b.test
      } catch (d) {
        l.deleteExpando = !1
      }
    }
    a = b = c = null
  }(),
  function() {
    var b, c, d = z.createElement("div");
    for (b in {
        submit: !0,
        change: !0,
        focusin: !0
      }) c = "on" + b, (l[b + "Bubbles"] = c in a) || (d.setAttribute(c, "t"), l[b + "Bubbles"] = d.attributes[c].expando === !1);
    d = null
  }();
  var Y = /^(?:input|select|textarea)$/i,
    Z = /^key/,
    $ = /^(?:mouse|contextmenu)|click/,
    _ = /^(?:focusinfocus|focusoutblur)$/,
    ab = /^([^.]*)(?:\.(.+)|)$/;

  function bb() {
    return !0
  }

  function cb() {
    return !1
  }

  function db() {
    try {
      return z.activeElement
    } catch (a) {}
  }
  n.event = {
    global: {},
    add: function(a, b, c, d, e) {
      var f, g, h, i, j, k, l, m, o, p, q, r = n._data(a);
      if (r) {
        c.handler && (i = c, c = i.handler, e = i.selector), c.guid || (c.guid = n.guid++), (g = r.events) || (g = r.events = {}), (k = r.handle) || (k = r.handle = function(a) {
          return typeof n === L || a && n.event.triggered === a.type ? void 0 : n.event.dispatch.apply(k.elem, arguments)
        }, k.elem = a), b = (b || "").match(F) || [""], h = b.length;
        while (h--) f = ab.exec(b[h]) || [], o = q = f[1], p = (f[2] || "").split(".").sort(), o && (j = n.event.special[o] || {}, o = (e ? j.delegateType : j.bindType) || o, j = n.event.special[o] || {}, l = n.extend({
          type: o,
          origType: q,
          data: d,
          handler: c,
          guid: c.guid,
          selector: e,
          needsContext: e && n.expr.match.needsContext.test(e),
          namespace: p.join(".")
        }, i), (m = g[o]) || (m = g[o] = [], m.delegateCount = 0, j.setup && j.setup.call(a, d, p, k) !== !1 || (a.addEventListener ? a.addEventListener(o, k, !1) : a.attachEvent && a.attachEvent("on" + o, k))), j.add && (j.add.call(a, l), l.handler.guid || (l.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, l) : m.push(l), n.event.global[o] = !0);
        a = null
      }
    },
    remove: function(a, b, c, d, e) {
      var f, g, h, i, j, k, l, m, o, p, q, r = n.hasData(a) && n._data(a);
      if (r && (k = r.events)) {
        b = (b || "").match(F) || [""], j = b.length;
        while (j--)
          if (h = ab.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o) {
            l = n.event.special[o] || {}, o = (d ? l.delegateType : l.bindType) || o, m = k[o] || [], h = h[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), i = f = m.length;
            while (f--) g = m[f], !e && q !== g.origType || c && c.guid !== g.guid || h && !h.test(g.namespace) || d && d !== g.selector && ("**" !== d || !g.selector) || (m.splice(f, 1), g.selector && m.delegateCount--, l.remove && l.remove.call(a, g));
            i && !m.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || n.removeEvent(a, o, r.handle), delete k[o])
          } else
            for (o in k) n.event.remove(a, o + b[j], c, d, !0);
        n.isEmptyObject(k) && (delete r.handle, n._removeData(a, "events"))
      }
    },
    trigger: function(b, c, d, e) {
      var f, g, h, i, k, l, m, o = [d || z],
        p = j.call(b, "type") ? b.type : b,
        q = j.call(b, "namespace") ? b.namespace.split(".") : [];
      if (h = l = d = d || z, 3 !== d.nodeType && 8 !== d.nodeType && !_.test(p + n.event.triggered) && (p.indexOf(".") >= 0 && (q = p.split("."), p = q.shift(), q.sort()), g = p.indexOf(":") < 0 && "on" + p, b = b[n.expando] ? b : new n.Event(p, "object" == typeof b && b), b.isTrigger = e ? 2 : 3, b.namespace = q.join("."), b.namespace_re = b.namespace ? new RegExp("(^|\\.)" + q.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, b.result = void 0, b.target || (b.target = d), c = null == c ? [b] : n.makeArray(c, [b]), k = n.event.special[p] || {}, e || !k.trigger || k.trigger.apply(d, c) !== !1)) {
        if (!e && !k.noBubble && !n.isWindow(d)) {
          for (i = k.delegateType || p, _.test(i + p) || (h = h.parentNode); h; h = h.parentNode) o.push(h), l = h;
          l === (d.ownerDocument || z) && o.push(l.defaultView || l.parentWindow || a)
        }
        m = 0;
        while ((h = o[m++]) && !b.isPropagationStopped()) b.type = m > 1 ? i : k.bindType || p, f = (n._data(h, "events") || {})[b.type] && n._data(h, "handle"), f && f.apply(h, c), f = g && h[g], f && f.apply && n.acceptData(h) && (b.result = f.apply(h, c), b.result === !1 && b.preventDefault());
        if (b.type = p, !e && !b.isDefaultPrevented() && (!k._default || k._default.apply(o.pop(), c) === !1) && n.acceptData(d) && g && d[p] && !n.isWindow(d)) {
          l = d[g], l && (d[g] = null), n.event.triggered = p;
          try {
            d[p]()
          } catch (r) {}
          n.event.triggered = void 0, l && (d[g] = l)
        }
        return b.result
      }
    },
    dispatch: function(a) {
      a = n.event.fix(a);
      var b, c, e, f, g, h = [],
        i = d.call(arguments),
        j = (n._data(this, "events") || {})[a.type] || [],
        k = n.event.special[a.type] || {};
      if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) {
        h = n.event.handlers.call(this, a, j), b = 0;
        while ((f = h[b++]) && !a.isPropagationStopped()) {
          a.currentTarget = f.elem, g = 0;
          while ((e = f.handlers[g++]) && !a.isImmediatePropagationStopped())(!a.namespace_re || a.namespace_re.test(e.namespace)) && (a.handleObj = e, a.data = e.data, c = ((n.event.special[e.origType] || {}).handle || e.handler).apply(f.elem, i), void 0 !== c && (a.result = c) === !1 && (a.preventDefault(), a.stopPropagation()))
        }
        return k.postDispatch && k.postDispatch.call(this, a), a.result
      }
    },
    handlers: function(a, b) {
      var c, d, e, f, g = [],
        h = b.delegateCount,
        i = a.target;
      if (h && i.nodeType && (!a.button || "click" !== a.type))
        for (; i != this; i = i.parentNode || this)
          if (1 === i.nodeType && (i.disabled !== !0 || "click" !== a.type)) {
            for (e = [], f = 0; h > f; f++) d = b[f], c = d.selector + " ", void 0 === e[c] && (e[c] = d.needsContext ? n(c, this).index(i) >= 0 : n.find(c, this, null, [i]).length), e[c] && e.push(d);
            e.length && g.push({
              elem: i,
              handlers: e
            })
          }
      return h < b.length && g.push({
        elem: this,
        handlers: b.slice(h)
      }), g
    },
    fix: function(a) {
      if (a[n.expando]) return a;
      var b, c, d, e = a.type,
        f = a,
        g = this.fixHooks[e];
      g || (this.fixHooks[e] = g = $.test(e) ? this.mouseHooks : Z.test(e) ? this.keyHooks : {}), d = g.props ? this.props.concat(g.props) : this.props, a = new n.Event(f), b = d.length;
      while (b--) c = d[b], a[c] = f[c];
      return a.target || (a.target = f.srcElement || z), 3 === a.target.nodeType && (a.target = a.target.parentNode), a.metaKey = !!a.metaKey, g.filter ? g.filter(a, f) : a
    },
    props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
    fixHooks: {},
    keyHooks: {
      props: "char charCode key keyCode".split(" "),
      filter: function(a, b) {
        return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a
      }
    },
    mouseHooks: {
      props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
      filter: function(a, b) {
        var c, d, e, f = b.button,
          g = b.fromElement;
        return null == a.pageX && null != b.clientX && (d = a.target.ownerDocument || z, e = d.documentElement, c = d.body, a.pageX = b.clientX + (e && e.scrollLeft || c && c.scrollLeft || 0) - (e && e.clientLeft || c && c.clientLeft || 0), a.pageY = b.clientY + (e && e.scrollTop || c && c.scrollTop || 0) - (e && e.clientTop || c && c.clientTop || 0)), !a.relatedTarget && g && (a.relatedTarget = g === a.target ? b.toElement : g), a.which || void 0 === f || (a.which = 1 & f ? 1 : 2 & f ? 3 : 4 & f ? 2 : 0), a
      }
    },
    special: {
      load: {
        noBubble: !0
      },
      focus: {
        trigger: function() {
          if (this !== db() && this.focus) try {
            return this.focus(), !1
          } catch (a) {}
        },
        delegateType: "focusin"
      },
      blur: {
        trigger: function() {
          return this === db() && this.blur ? (this.blur(), !1) : void 0
        },
        delegateType: "focusout"
      },
      click: {
        trigger: function() {
          return n.nodeName(this, "input") && "checkbox" === this.type && this.click ? (this.click(), !1) : void 0
        },
        _default: function(a) {
          return n.nodeName(a.target, "a")
        }
      },
      beforeunload: {
        postDispatch: function(a) {
          void 0 !== a.result && (a.originalEvent.returnValue = a.result)
        }
      }
    },
    simulate: function(a, b, c, d) {
      var e = n.extend(new n.Event, c, {
        type: a,
        isSimulated: !0,
        originalEvent: {}
      });
      d ? n.event.trigger(e, null, b) : n.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault()
    }
  }, n.removeEvent = z.removeEventListener ? function(a, b, c) {
    a.removeEventListener && a.removeEventListener(b, c, !1)
  } : function(a, b, c) {
    var d = "on" + b;
    a.detachEvent && (typeof a[d] === L && (a[d] = null), a.detachEvent(d, c))
  }, n.Event = function(a, b) {
    return this instanceof n.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && (a.returnValue === !1 || a.getPreventDefault && a.getPreventDefault()) ? bb : cb) : this.type = a, b && n.extend(this, b), this.timeStamp = a && a.timeStamp || n.now(), void(this[n.expando] = !0)) : new n.Event(a, b)
  }, n.Event.prototype = {
    isDefaultPrevented: cb,
    isPropagationStopped: cb,
    isImmediatePropagationStopped: cb,
    preventDefault: function() {
      var a = this.originalEvent;
      this.isDefaultPrevented = bb, a && (a.preventDefault ? a.preventDefault() : a.returnValue = !1)
    },
    stopPropagation: function() {
      var a = this.originalEvent;
      this.isPropagationStopped = bb, a && (a.stopPropagation && a.stopPropagation(), a.cancelBubble = !0)
    },
    stopImmediatePropagation: function() {
      this.isImmediatePropagationStopped = bb, this.stopPropagation()
    }
  }, n.each({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  }, function(a, b) {
    n.event.special[a] = {
      delegateType: b,
      bindType: b,
      handle: function(a) {
        var c, d = this,
          e = a.relatedTarget,
          f = a.handleObj;
        return (!e || e !== d && !n.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c
      }
    }
  }), l.submitBubbles || (n.event.special.submit = {
    setup: function() {
      return n.nodeName(this, "form") ? !1 : void n.event.add(this, "click._submit keypress._submit", function(a) {
        var b = a.target,
          c = n.nodeName(b, "input") || n.nodeName(b, "button") ? b.form : void 0;
        c && !n._data(c, "submitBubbles") && (n.event.add(c, "submit._submit", function(a) {
          a._submit_bubble = !0
        }), n._data(c, "submitBubbles", !0))
      })
    },
    postDispatch: function(a) {
      a._submit_bubble && (delete a._submit_bubble, this.parentNode && !a.isTrigger && n.event.simulate("submit", this.parentNode, a, !0))
    },
    teardown: function() {
      return n.nodeName(this, "form") ? !1 : void n.event.remove(this, "._submit")
    }
  }), l.changeBubbles || (n.event.special.change = {
    setup: function() {
      return Y.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (n.event.add(this, "propertychange._change", function(a) {
        "checked" === a.originalEvent.propertyName && (this._just_changed = !0)
      }), n.event.add(this, "click._change", function(a) {
        this._just_changed && !a.isTrigger && (this._just_changed = !1), n.event.simulate("change", this, a, !0)
      })), !1) : void n.event.add(this, "beforeactivate._change", function(a) {
        var b = a.target;
        Y.test(b.nodeName) && !n._data(b, "changeBubbles") && (n.event.add(b, "change._change", function(a) {
          !this.parentNode || a.isSimulated || a.isTrigger || n.event.simulate("change", this.parentNode, a, !0)
        }), n._data(b, "changeBubbles", !0))
      })
    },
    handle: function(a) {
      var b = a.target;
      return this !== b || a.isSimulated || a.isTrigger || "radio" !== b.type && "checkbox" !== b.type ? a.handleObj.handler.apply(this, arguments) : void 0
    },
    teardown: function() {
      return n.event.remove(this, "._change"), !Y.test(this.nodeName)
    }
  }), l.focusinBubbles || n.each({
    focus: "focusin",
    blur: "focusout"
  }, function(a, b) {
    var c = function(a) {
      n.event.simulate(b, a.target, n.event.fix(a), !0)
    };
    n.event.special[b] = {
      setup: function() {
        var d = this.ownerDocument || this,
          e = n._data(d, b);
        e || d.addEventListener(a, c, !0), n._data(d, b, (e || 0) + 1)
      },
      teardown: function() {
        var d = this.ownerDocument || this,
          e = n._data(d, b) - 1;
        e ? n._data(d, b, e) : (d.removeEventListener(a, c, !0), n._removeData(d, b))
      }
    }
  }), n.fn.extend({
    on: function(a, b, c, d, e) {
      var f, g;
      if ("object" == typeof a) {
        "string" != typeof b && (c = c || b, b = void 0);
        for (f in a) this.on(f, b, c, a[f], e);
        return this
      }
      if (null == c && null == d ? (d = b, c = b = void 0) : null == d && ("string" == typeof b ? (d = c, c = void 0) : (d = c, c = b, b = void 0)), d === !1) d = cb;
      else if (!d) return this;
      return 1 === e && (g = d, d = function(a) {
        return n().off(a), g.apply(this, arguments)
      }, d.guid = g.guid || (g.guid = n.guid++)), this.each(function() {
        n.event.add(this, a, d, c, b)
      })
    },
    one: function(a, b, c, d) {
      return this.on(a, b, c, d, 1)
    },
    off: function(a, b, c) {
      var d, e;
      if (a && a.preventDefault && a.handleObj) return d = a.handleObj, n(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), this;
      if ("object" == typeof a) {
        for (e in a) this.off(e, b, a[e]);
        return this
      }
      return (b === !1 || "function" == typeof b) && (c = b, b = void 0), c === !1 && (c = cb), this.each(function() {
        n.event.remove(this, a, c, b)
      })
    },
    trigger: function(a, b) {
      return this.each(function() {
        n.event.trigger(a, b, this)
      })
    },
    triggerHandler: function(a, b) {
      var c = this[0];
      return c ? n.event.trigger(a, b, c, !0) : void 0
    }
  });

  function eb(a) {
    var b = fb.split("|"),
      c = a.createDocumentFragment();
    if (c.createElement)
      while (b.length) c.createElement(b.pop());
    return c
  }
  var fb = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
    gb = / jQuery\d+="(?:null|\d+)"/g,
    hb = new RegExp("<(?:" + fb + ")[\\s/>]", "i"),
    ib = /^\s+/,
    jb = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    kb = /<([\w:]+)/,
    lb = /<tbody/i,
    mb = /<|&#?\w+;/,
    nb = /<(?:script|style|link)/i,
    ob = /checked\s*(?:[^=]|=\s*.checked.)/i,
    pb = /^$|\/(?:java|ecma)script/i,
    qb = /^true\/(.*)/,
    rb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
    sb = {
      option: [1, "<select multiple='multiple'>", "</select>"],
      legend: [1, "<fieldset>", "</fieldset>"],
      area: [1, "<map>", "</map>"],
      param: [1, "<object>", "</object>"],
      thead: [1, "<table>", "</table>"],
      tr: [2, "<table><tbody>", "</tbody></table>"],
      col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
      td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
      _default: l.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
    },
    tb = eb(z),
    ub = tb.appendChild(z.createElement("div"));
  sb.optgroup = sb.option, sb.tbody = sb.tfoot = sb.colgroup = sb.caption = sb.thead, sb.th = sb.td;

  function vb(a, b) {
    var c, d, e = 0,
      f = typeof a.getElementsByTagName !== L ? a.getElementsByTagName(b || "*") : typeof a.querySelectorAll !== L ? a.querySelectorAll(b || "*") : void 0;
    if (!f)
      for (f = [], c = a.childNodes || a; null != (d = c[e]); e++) !b || n.nodeName(d, b) ? f.push(d) : n.merge(f, vb(d, b));
    return void 0 === b || b && n.nodeName(a, b) ? n.merge([a], f) : f
  }

  function wb(a) {
    X.test(a.type) && (a.defaultChecked = a.checked)
  }

  function xb(a, b) {
    return n.nodeName(a, "table") && n.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a
  }

  function yb(a) {
    return a.type = (null !== n.find.attr(a, "type")) + "/" + a.type, a
  }

  function zb(a) {
    var b = qb.exec(a.type);
    return b ? a.type = b[1] : a.removeAttribute("type"), a
  }

  function Ab(a, b) {
    for (var c, d = 0; null != (c = a[d]); d++) n._data(c, "globalEval", !b || n._data(b[d], "globalEval"))
  }

  function Bb(a, b) {
    if (1 === b.nodeType && n.hasData(a)) {
      var c, d, e, f = n._data(a),
        g = n._data(b, f),
        h = f.events;
      if (h) {
        delete g.handle, g.events = {};
        for (c in h)
          for (d = 0, e = h[c].length; e > d; d++) n.event.add(b, c, h[c][d])
      }
      g.data && (g.data = n.extend({}, g.data))
    }
  }

  function Cb(a, b) {
    var c, d, e;
    if (1 === b.nodeType) {
      if (c = b.nodeName.toLowerCase(), !l.noCloneEvent && b[n.expando]) {
        e = n._data(b);
        for (d in e.events) n.removeEvent(b, d, e.handle);
        b.removeAttribute(n.expando)
      }
      "script" === c && b.text !== a.text ? (yb(b).text = a.text, zb(b)) : "object" === c ? (b.parentNode && (b.outerHTML = a.outerHTML), l.html5Clone && a.innerHTML && !n.trim(b.innerHTML) && (b.innerHTML = a.innerHTML)) : "input" === c && X.test(a.type) ? (b.defaultChecked = b.checked = a.checked, b.value !== a.value && (b.value = a.value)) : "option" === c ? b.defaultSelected = b.selected = a.defaultSelected : ("input" === c || "textarea" === c) && (b.defaultValue = a.defaultValue)
    }
  }
  n.extend({
    clone: function(a, b, c) {
      var d, e, f, g, h, i = n.contains(a.ownerDocument, a);
      if (l.html5Clone || n.isXMLDoc(a) || !hb.test("<" + a.nodeName + ">") ? f = a.cloneNode(!0) : (ub.innerHTML = a.outerHTML, ub.removeChild(f = ub.firstChild)), !(l.noCloneEvent && l.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || n.isXMLDoc(a)))
        for (d = vb(f), h = vb(a), g = 0; null != (e = h[g]); ++g) d[g] && Cb(e, d[g]);
      if (b)
        if (c)
          for (h = h || vb(a), d = d || vb(f), g = 0; null != (e = h[g]); g++) Bb(e, d[g]);
        else Bb(a, f);
      return d = vb(f, "script"), d.length > 0 && Ab(d, !i && vb(a, "script")), d = h = e = null, f
    },
    buildFragment: function(a, b, c, d) {
      for (var e, f, g, h, i, j, k, m = a.length, o = eb(b), p = [], q = 0; m > q; q++)
        if (f = a[q], f || 0 === f)
          if ("object" === n.type(f)) n.merge(p, f.nodeType ? [f] : f);
          else if (mb.test(f)) {
        h = h || o.appendChild(b.createElement("div")), i = (kb.exec(f) || ["", ""])[1].toLowerCase(), k = sb[i] || sb._default, h.innerHTML = k[1] + f.replace(jb, "<$1></$2>") + k[2], e = k[0];
        while (e--) h = h.lastChild;
        if (!l.leadingWhitespace && ib.test(f) && p.push(b.createTextNode(ib.exec(f)[0])), !l.tbody) {
          f = "table" !== i || lb.test(f) ? "<table>" !== k[1] || lb.test(f) ? 0 : h : h.firstChild, e = f && f.childNodes.length;
          while (e--) n.nodeName(j = f.childNodes[e], "tbody") && !j.childNodes.length && f.removeChild(j)
        }
        n.merge(p, h.childNodes), h.textContent = "";
        while (h.firstChild) h.removeChild(h.firstChild);
        h = o.lastChild
      } else p.push(b.createTextNode(f));
      h && o.removeChild(h), l.appendChecked || n.grep(vb(p, "input"), wb), q = 0;
      while (f = p[q++])
        if ((!d || -1 === n.inArray(f, d)) && (g = n.contains(f.ownerDocument, f), h = vb(o.appendChild(f), "script"), g && Ab(h), c)) {
          e = 0;
          while (f = h[e++]) pb.test(f.type || "") && c.push(f)
        }
      return h = null, o
    },
    cleanData: function(a, b) {
      for (var d, e, f, g, h = 0, i = n.expando, j = n.cache, k = l.deleteExpando, m = n.event.special; null != (d = a[h]); h++)
        if ((b || n.acceptData(d)) && (f = d[i], g = f && j[f])) {
          if (g.events)
            for (e in g.events) m[e] ? n.event.remove(d, e) : n.removeEvent(d, e, g.handle);
          j[f] && (delete j[f], k ? delete d[i] : typeof d.removeAttribute !== L ? d.removeAttribute(i) : d[i] = null, c.push(f))
        }
    }
  }), n.fn.extend({
    text: function(a) {
      return W(this, function(a) {
        return void 0 === a ? n.text(this) : this.empty().append((this[0] && this[0].ownerDocument || z).createTextNode(a))
      }, null, a, arguments.length)
    },
    append: function() {
      return this.domManip(arguments, function(a) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var b = xb(this, a);
          b.appendChild(a)
        }
      })
    },
    prepend: function() {
      return this.domManip(arguments, function(a) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var b = xb(this, a);
          b.insertBefore(a, b.firstChild)
        }
      })
    },
    before: function() {
      return this.domManip(arguments, function(a) {
        this.parentNode && this.parentNode.insertBefore(a, this)
      })
    },
    after: function() {
      return this.domManip(arguments, function(a) {
        this.parentNode && this.parentNode.insertBefore(a, this.nextSibling)
      })
    },
    remove: function(a, b) {
      for (var c, d = a ? n.filter(a, this) : this, e = 0; null != (c = d[e]); e++) b || 1 !== c.nodeType || n.cleanData(vb(c)), c.parentNode && (b && n.contains(c.ownerDocument, c) && Ab(vb(c, "script")), c.parentNode.removeChild(c));
      return this
    },
    empty: function() {
      for (var a, b = 0; null != (a = this[b]); b++) {
        1 === a.nodeType && n.cleanData(vb(a, !1));
        while (a.firstChild) a.removeChild(a.firstChild);
        a.options && n.nodeName(a, "select") && (a.options.length = 0)
      }
      return this
    },
    clone: function(a, b) {
      return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function() {
        return n.clone(this, a, b)
      })
    },
    html: function(a) {
      return W(this, function(a) {
        var b = this[0] || {},
          c = 0,
          d = this.length;
        if (void 0 === a) return 1 === b.nodeType ? b.innerHTML.replace(gb, "") : void 0;
        if (!("string" != typeof a || nb.test(a) || !l.htmlSerialize && hb.test(a) || !l.leadingWhitespace && ib.test(a) || sb[(kb.exec(a) || ["", ""])[1].toLowerCase()])) {
          a = a.replace(jb, "<$1></$2>");
          try {
            for (; d > c; c++) b = this[c] || {}, 1 === b.nodeType && (n.cleanData(vb(b, !1)), b.innerHTML = a);
            b = 0
          } catch (e) {}
        }
        b && this.empty().append(a)
      }, null, a, arguments.length)
    },
    replaceWith: function() {
      var a = arguments[0];
      return this.domManip(arguments, function(b) {
        a = this.parentNode, n.cleanData(vb(this)), a && a.replaceChild(b, this)
      }), a && (a.length || a.nodeType) ? this : this.remove()
    },
    detach: function(a) {
      return this.remove(a, !0)
    },
    domManip: function(a, b) {
      a = e.apply([], a);
      var c, d, f, g, h, i, j = 0,
        k = this.length,
        m = this,
        o = k - 1,
        p = a[0],
        q = n.isFunction(p);
      if (q || k > 1 && "string" == typeof p && !l.checkClone && ob.test(p)) return this.each(function(c) {
        var d = m.eq(c);
        q && (a[0] = p.call(this, c, d.html())), d.domManip(a, b)
      });
      if (k && (i = n.buildFragment(a, this[0].ownerDocument, !1, this), c = i.firstChild, 1 === i.childNodes.length && (i = c), c)) {
        for (g = n.map(vb(i, "script"), yb), f = g.length; k > j; j++) d = i, j !== o && (d = n.clone(d, !0, !0), f && n.merge(g, vb(d, "script"))), b.call(this[j], d, j);
        if (f)
          for (h = g[g.length - 1].ownerDocument, n.map(g, zb), j = 0; f > j; j++) d = g[j], pb.test(d.type || "") && !n._data(d, "globalEval") && n.contains(h, d) && (d.src ? n._evalUrl && n._evalUrl(d.src) : n.globalEval((d.text || d.textContent || d.innerHTML || "").replace(rb, "")));
        i = c = null
      }
      return this
    }
  }), n.each({
    appendTo: "append",
    prependTo: "prepend",
    insertBefore: "before",
    insertAfter: "after",
    replaceAll: "replaceWith"
  }, function(a, b) {
    n.fn[a] = function(a) {
      for (var c, d = 0, e = [], g = n(a), h = g.length - 1; h >= d; d++) c = d === h ? this : this.clone(!0), n(g[d])[b](c), f.apply(e, c.get());
      return this.pushStack(e)
    }
  });
  var Db, Eb = {};

  function Fb(b, c) {
    var d = n(c.createElement(b)).appendTo(c.body),
      e = a.getDefaultComputedStyle ? a.getDefaultComputedStyle(d[0]).display : n.css(d[0], "display");
    return d.detach(), e
  }

  function Gb(a) {
    var b = z,
      c = Eb[a];
    return c || (c = Fb(a, b), "none" !== c && c || (Db = (Db || n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), b = (Db[0].contentWindow || Db[0].contentDocument).document, b.write(), b.close(), c = Fb(a, b), Db.detach()), Eb[a] = c), c
  }! function() {
    var a, b, c = z.createElement("div"),
      d = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;padding:0;margin:0;border:0";
    c.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", a = c.getElementsByTagName("a")[0], a.style.cssText = "float:left;opacity:.5", l.opacity = /^0.5/.test(a.style.opacity), l.cssFloat = !!a.style.cssFloat, c.style.backgroundClip = "content-box", c.cloneNode(!0).style.backgroundClip = "", l.clearCloneStyle = "content-box" === c.style.backgroundClip, a = c = null, l.shrinkWrapBlocks = function() {
      var a, c, e, f;
      if (null == b) {
        if (a = z.getElementsByTagName("body")[0], !a) return;
        f = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px", c = z.createElement("div"), e = z.createElement("div"), a.appendChild(c).appendChild(e), b = !1, typeof e.style.zoom !== L && (e.style.cssText = d + ";width:1px;padding:1px;zoom:1", e.innerHTML = "<div></div>", e.firstChild.style.width = "5px", b = 3 !== e.offsetWidth), a.removeChild(c), a = c = e = null
      }
      return b
    }
  }();
  var Hb = /^margin/,
    Ib = new RegExp("^(" + T + ")(?!px)[a-z%]+$", "i"),
    Jb, Kb, Lb = /^(top|right|bottom|left)$/;
  a.getComputedStyle ? (Jb = function(a) {
    return a.ownerDocument.defaultView.getComputedStyle(a, null)
  }, Kb = function(a, b, c) {
    var d, e, f, g, h = a.style;
    return c = c || Jb(a), g = c ? c.getPropertyValue(b) || c[b] : void 0, c && ("" !== g || n.contains(a.ownerDocument, a) || (g = n.style(a, b)), Ib.test(g) && Hb.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 === g ? g : g + ""
  }) : z.documentElement.currentStyle && (Jb = function(a) {
    return a.currentStyle
  }, Kb = function(a, b, c) {
    var d, e, f, g, h = a.style;
    return c = c || Jb(a), g = c ? c[b] : void 0, null == g && h && h[b] && (g = h[b]), Ib.test(g) && !Lb.test(b) && (d = h.left, e = a.runtimeStyle, f = e && e.left, f && (e.left = a.currentStyle.left), h.left = "fontSize" === b ? "1em" : g, g = h.pixelLeft + "px", h.left = d, f && (e.left = f)), void 0 === g ? g : g + "" || "auto"
  });

  function Mb(a, b) {
    return {
      get: function() {
        var c = a();
        if (null != c) return c ? void delete this.get : (this.get = b).apply(this, arguments)
      }
    }
  }! function() {
    var b, c, d, e, f, g, h = z.createElement("div"),
      i = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px",
      j = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;padding:0;margin:0;border:0";
    h.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", b = h.getElementsByTagName("a")[0], b.style.cssText = "float:left;opacity:.5", l.opacity = /^0.5/.test(b.style.opacity), l.cssFloat = !!b.style.cssFloat, h.style.backgroundClip = "content-box", h.cloneNode(!0).style.backgroundClip = "", l.clearCloneStyle = "content-box" === h.style.backgroundClip, b = h = null, n.extend(l, {
      reliableHiddenOffsets: function() {
        if (null != c) return c;
        var a, b, d, e = z.createElement("div"),
          f = z.getElementsByTagName("body")[0];
        if (f) return e.setAttribute("className", "t"), e.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", a = z.createElement("div"), a.style.cssText = i, f.appendChild(a).appendChild(e), e.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", b = e.getElementsByTagName("td"), b[0].style.cssText = "padding:0;margin:0;border:0;display:none", d = 0 === b[0].offsetHeight, b[0].style.display = "", b[1].style.display = "none", c = d && 0 === b[0].offsetHeight, f.removeChild(a), e = f = null, c
      },
      boxSizing: function() {
        return null == d && k(), d
      },
      boxSizingReliable: function() {
        return null == e && k(), e
      },
      pixelPosition: function() {
        return null == f && k(), f
      },
      reliableMarginRight: function() {
        var b, c, d, e;
        if (null == g && a.getComputedStyle) {
          if (b = z.getElementsByTagName("body")[0], !b) return;
          c = z.createElement("div"), d = z.createElement("div"), c.style.cssText = i, b.appendChild(c).appendChild(d), e = d.appendChild(z.createElement("div")), e.style.cssText = d.style.cssText = j, e.style.marginRight = e.style.width = "0", d.style.width = "1px", g = !parseFloat((a.getComputedStyle(e, null) || {}).marginRight), b.removeChild(c)
        }
        return g
      }
    });

    function k() {
      var b, c, h = z.getElementsByTagName("body")[0];
      h && (b = z.createElement("div"), c = z.createElement("div"), b.style.cssText = i, h.appendChild(b).appendChild(c), c.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;display:block;padding:1px;border:1px;width:4px;margin-top:1%;top:1%", n.swap(h, null != h.style.zoom ? {
        zoom: 1
      } : {}, function() {
        d = 4 === c.offsetWidth
      }), e = !0, f = !1, g = !0, a.getComputedStyle && (f = "1%" !== (a.getComputedStyle(c, null) || {}).top, e = "4px" === (a.getComputedStyle(c, null) || {
        width: "4px"
      }).width), h.removeChild(b), c = h = null)
    }
  }(), n.swap = function(a, b, c, d) {
    var e, f, g = {};
    for (f in b) g[f] = a.style[f], a.style[f] = b[f];
    e = c.apply(a, d || []);
    for (f in b) a.style[f] = g[f];
    return e
  };
  var Nb = /alpha\([^)]*\)/i,
    Ob = /opacity\s*=\s*([^)]*)/,
    Pb = /^(none|table(?!-c[ea]).+)/,
    Qb = new RegExp("^(" + T + ")(.*)$", "i"),
    Rb = new RegExp("^([+-])=(" + T + ")", "i"),
    Sb = {
      position: "absolute",
      visibility: "hidden",
      display: "block"
    },
    Tb = {
      letterSpacing: 0,
      fontWeight: 400
    },
    Ub = ["Webkit", "O", "Moz", "ms"];

  function Vb(a, b) {
    if (b in a) return b;
    var c = b.charAt(0).toUpperCase() + b.slice(1),
      d = b,
      e = Ub.length;
    while (e--)
      if (b = Ub[e] + c, b in a) return b;
    return d
  }

  function Wb(a, b) {
    for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++) d = a[g], d.style && (f[g] = n._data(d, "olddisplay"), c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && V(d) && (f[g] = n._data(d, "olddisplay", Gb(d.nodeName)))) : f[g] || (e = V(d), (c && "none" !== c || !e) && n._data(d, "olddisplay", e ? c : n.css(d, "display"))));
    for (g = 0; h > g; g++) d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none"));
    return a
  }

  function Xb(a, b, c) {
    var d = Qb.exec(b);
    return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b
  }

  function Yb(a, b, c, d, e) {
    for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2) "margin" === c && (g += n.css(a, c + U[f], !0, e)), d ? ("content" === c && (g -= n.css(a, "padding" + U[f], !0, e)), "margin" !== c && (g -= n.css(a, "border" + U[f] + "Width", !0, e))) : (g += n.css(a, "padding" + U[f], !0, e), "padding" !== c && (g += n.css(a, "border" + U[f] + "Width", !0, e)));
    return g
  }

  function Zb(a, b, c) {
    var d = !0,
      e = "width" === b ? a.offsetWidth : a.offsetHeight,
      f = Jb(a),
      g = l.boxSizing() && "border-box" === n.css(a, "boxSizing", !1, f);
    if (0 >= e || null == e) {
      if (e = Kb(a, b, f), (0 > e || null == e) && (e = a.style[b]), Ib.test(e)) return e;
      d = g && (l.boxSizingReliable() || e === a.style[b]), e = parseFloat(e) || 0
    }
    return e + Yb(a, b, c || (g ? "border" : "content"), d, f) + "px"
  }
  n.extend({
    cssHooks: {
      opacity: {
        get: function(a, b) {
          if (b) {
            var c = Kb(a, "opacity");
            return "" === c ? "1" : c
          }
        }
      }
    },
    cssNumber: {
      columnCount: !0,
      fillOpacity: !0,
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
      "float": l.cssFloat ? "cssFloat" : "styleFloat"
    },
    style: function(a, b, c, d) {
      if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
        var e, f, g, h = n.camelCase(b),
          i = a.style;
        if (b = n.cssProps[h] || (n.cssProps[h] = Vb(i, h)), g = n.cssHooks[b] || n.cssHooks[h], void 0 === c) return g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b];
        if (f = typeof c, "string" === f && (e = Rb.exec(c)) && (c = (e[1] + 1) * e[2] + parseFloat(n.css(a, b)), f = "number"), null != c && c === c && ("number" !== f || n.cssNumber[h] || (c += "px"), l.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), !(g && "set" in g && void 0 === (c = g.set(a, c, d))))) try {
          i[b] = "", i[b] = c
        } catch (j) {}
      }
    },
    css: function(a, b, c, d) {
      var e, f, g, h = n.camelCase(b);
      return b = n.cssProps[h] || (n.cssProps[h] = Vb(a.style, h)), g = n.cssHooks[b] || n.cssHooks[h], g && "get" in g && (f = g.get(a, !0, c)), void 0 === f && (f = Kb(a, b, d)), "normal" === f && b in Tb && (f = Tb[b]), "" === c || c ? (e = parseFloat(f), c === !0 || n.isNumeric(e) ? e || 0 : f) : f
    }
  }), n.each(["height", "width"], function(a, b) {
    n.cssHooks[b] = {
      get: function(a, c, d) {
        return c ? 0 === a.offsetWidth && Pb.test(n.css(a, "display")) ? n.swap(a, Sb, function() {
          return Zb(a, b, d)
        }) : Zb(a, b, d) : void 0
      },
      set: function(a, c, d) {
        var e = d && Jb(a);
        return Xb(a, c, d ? Yb(a, b, d, l.boxSizing() && "border-box" === n.css(a, "boxSizing", !1, e), e) : 0)
      }
    }
  }), l.opacity || (n.cssHooks.opacity = {
    get: function(a, b) {
      return Ob.test((b && a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : b ? "1" : ""
    },
    set: function(a, b) {
      var c = a.style,
        d = a.currentStyle,
        e = n.isNumeric(b) ? "alpha(opacity=" + 100 * b + ")" : "",
        f = d && d.filter || c.filter || "";
      c.zoom = 1, (b >= 1 || "" === b) && "" === n.trim(f.replace(Nb, "")) && c.removeAttribute && (c.removeAttribute("filter"), "" === b || d && !d.filter) || (c.filter = Nb.test(f) ? f.replace(Nb, e) : f + " " + e)
    }
  }), n.cssHooks.marginRight = Mb(l.reliableMarginRight, function(a, b) {
    return b ? n.swap(a, {
      display: "inline-block"
    }, Kb, [a, "marginRight"]) : void 0
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
    }, Hb.test(a) || (n.cssHooks[a + b].set = Xb)
  }), n.fn.extend({
    css: function(a, b) {
      return W(this, function(a, b, c) {
        var d, e, f = {},
          g = 0;
        if (n.isArray(b)) {
          for (d = Jb(a), e = b.length; e > g; g++) f[b[g]] = n.css(a, b[g], !1, d);
          return f
        }
        return void 0 !== c ? n.style(a, b, c) : n.css(a, b)
      }, a, b, arguments.length > 1)
    },
    show: function() {
      return Wb(this, !0)
    },
    hide: function() {
      return Wb(this)
    },
    toggle: function(a) {
      return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function() {
        V(this) ? n(this).show() : n(this).hide()
      })
    }
  });

  function $b(a, b, c, d, e) {
    return new $b.prototype.init(a, b, c, d, e)
  }
  n.Tween = $b, $b.prototype = {
    constructor: $b,
    init: function(a, b, c, d, e, f) {
      this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (n.cssNumber[c] ? "" : "px")
    },
    cur: function() {
      var a = $b.propHooks[this.prop];
      return a && a.get ? a.get(this) : $b.propHooks._default.get(this)
    },
    run: function(a) {
      var b, c = $b.propHooks[this.prop];
      return this.pos = b = this.options.duration ? n.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : $b.propHooks._default.set(this), this
    }
  }, $b.prototype.init.prototype = $b.prototype, $b.propHooks = {
    _default: {
      get: function(a) {
        var b;
        return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = n.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0) : a.elem[a.prop]
      },
      set: function(a) {
        n.fx.step[a.prop] ? n.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[n.cssProps[a.prop]] || n.cssHooks[a.prop]) ? n.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now
      }
    }
  }, $b.propHooks.scrollTop = $b.propHooks.scrollLeft = {
    set: function(a) {
      a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now)
    }
  }, n.easing = {
    linear: function(a) {
      return a
    },
    swing: function(a) {
      return .5 - Math.cos(a * Math.PI) / 2
    }
  }, n.fx = $b.prototype.init, n.fx.step = {};
  var _b, ac, bc = /^(?:toggle|show|hide)$/,
    cc = new RegExp("^(?:([+-])=|)(" + T + ")([a-z%]*)$", "i"),
    dc = /queueHooks$/,
    ec = [jc],
    fc = {
      "*": [function(a, b) {
        var c = this.createTween(a, b),
          d = c.cur(),
          e = cc.exec(b),
          f = e && e[3] || (n.cssNumber[a] ? "" : "px"),
          g = (n.cssNumber[a] || "px" !== f && +d) && cc.exec(n.css(c.elem, a)),
          h = 1,
          i = 20;
        if (g && g[3] !== f) {
          f = f || g[3], e = e || [], g = +d || 1;
          do h = h || ".5", g /= h, n.style(c.elem, a, g + f); while (h !== (h = c.cur() / d) && 1 !== h && --i)
        }
        return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), c
      }]
    };

  function gc() {
    return setTimeout(function() {
      _b = void 0
    }), _b = n.now()
  }

  function hc(a, b) {
    var c, d = {
        height: a
      },
      e = 0;
    for (b = b ? 1 : 0; 4 > e; e += 2 - b) c = U[e], d["margin" + c] = d["padding" + c] = a;
    return b && (d.opacity = d.width = a), d
  }

  function ic(a, b, c) {
    for (var d, e = (fc[b] || []).concat(fc["*"]), f = 0, g = e.length; g > f; f++)
      if (d = e[f].call(c, b, a)) return d
  }

  function jc(a, b, c) {
    var d, e, f, g, h, i, j, k, m = this,
      o = {},
      p = a.style,
      q = a.nodeType && V(a),
      r = n._data(a, "fxshow");
    c.queue || (h = n._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function() {
      h.unqueued || i()
    }), h.unqueued++, m.always(function() {
      m.always(function() {
        h.unqueued--, n.queue(a, "fx").length || h.empty.fire()
      })
    })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [p.overflow, p.overflowX, p.overflowY], j = n.css(a, "display"), k = Gb(a.nodeName), "none" === j && (j = k), "inline" === j && "none" === n.css(a, "float") && (l.inlineBlockNeedsLayout && "inline" !== k ? p.zoom = 1 : p.display = "inline-block")), c.overflow && (p.overflow = "hidden", l.shrinkWrapBlocks() || m.always(function() {
      p.overflow = c.overflow[0], p.overflowX = c.overflow[1], p.overflowY = c.overflow[2]
    }));
    for (d in b)
      if (e = b[d], bc.exec(e)) {
        if (delete b[d], f = f || "toggle" === e, e === (q ? "hide" : "show")) {
          if ("show" !== e || !r || void 0 === r[d]) continue;
          q = !0
        }
        o[d] = r && r[d] || n.style(a, d)
      }
    if (!n.isEmptyObject(o)) {
      r ? "hidden" in r && (q = r.hidden) : r = n._data(a, "fxshow", {}), f && (r.hidden = !q), q ? n(a).show() : m.done(function() {
        n(a).hide()
      }), m.done(function() {
        var b;
        n._removeData(a, "fxshow");
        for (b in o) n.style(a, b, o[b])
      });
      for (d in o) g = ic(q ? r[d] : 0, d, m), d in r || (r[d] = g.start, q && (g.end = g.start, g.start = "width" === d || "height" === d ? 1 : 0))
    }
  }

  function kc(a, b) {
    var c, d, e, f, g;
    for (c in a)
      if (d = n.camelCase(c), e = b[d], f = a[c], n.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = n.cssHooks[d], g && "expand" in g) {
        f = g.expand(f), delete a[d];
        for (c in f) c in a || (a[c] = f[c], b[c] = e)
      } else b[d] = e
  }

  function lc(a, b, c) {
    var d, e, f = 0,
      g = ec.length,
      h = n.Deferred().always(function() {
        delete i.elem
      }),
      i = function() {
        if (e) return !1;
        for (var b = _b || gc(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++) j.tweens[g].run(f);
        return h.notifyWith(a, [j, f, c]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1)
      },
      j = h.promise({
        elem: a,
        props: n.extend({}, b),
        opts: n.extend(!0, {
          specialEasing: {}
        }, c),
        originalProperties: b,
        originalOptions: c,
        startTime: _b || gc(),
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
          return b ? h.resolveWith(a, [j, b]) : h.rejectWith(a, [j, b]), this
        }
      }),
      k = j.props;
    for (kc(k, j.opts.specialEasing); g > f; f++)
      if (d = ec[f].call(j, a, k, j.opts)) return d;
    return n.map(k, ic, j), n.isFunction(j.opts.start) && j.opts.start.call(a, j), n.fx.timer(n.extend(i, {
      elem: a,
      anim: j,
      queue: j.opts.queue
    })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always)
  }
  n.Animation = n.extend(lc, {
      tweener: function(a, b) {
        n.isFunction(a) ? (b = a, a = ["*"]) : a = a.split(" ");
        for (var c, d = 0, e = a.length; e > d; d++) c = a[d], fc[c] = fc[c] || [], fc[c].unshift(b)
      },
      prefilter: function(a, b) {
        b ? ec.unshift(a) : ec.push(a)
      }
    }), n.speed = function(a, b, c) {
      var d = a && "object" == typeof a ? n.extend({}, a) : {
        complete: c || !c && b || n.isFunction(a) && a,
        duration: a,
        easing: c && b || b && !n.isFunction(b) && b
      };
      return d.duration = n.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in n.fx.speeds ? n.fx.speeds[d.duration] : n.fx.speeds._default, (null == d.queue || d.queue === !0) && (d.queue = "fx"), d.old = d.complete, d.complete = function() {
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
            var b = lc(this, n.extend({}, a), f);
            (e || n._data(this, "finish")) && b.stop(!0)
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
            g = n._data(this);
          if (e) g[e] && g[e].stop && d(g[e]);
          else
            for (e in g) g[e] && g[e].stop && dc.test(e) && d(g[e]);
          for (e = f.length; e--;) f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1));
          (b || !c) && n.dequeue(this, a)
        })
      },
      finish: function(a) {
        return a !== !1 && (a = a || "fx"), this.each(function() {
          var b, c = n._data(this),
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
        return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(hc(b, !0), a, d, e)
      }
    }), n.each({
      slideDown: hc("show"),
      slideUp: hc("hide"),
      slideToggle: hc("toggle"),
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
      var a, b = n.timers,
        c = 0;
      for (_b = n.now(); c < b.length; c++) a = b[c], a() || b[c] !== a || b.splice(c--, 1);
      b.length || n.fx.stop(), _b = void 0
    }, n.fx.timer = function(a) {
      n.timers.push(a), a() ? n.fx.start() : n.timers.pop()
    }, n.fx.interval = 13, n.fx.start = function() {
      ac || (ac = setInterval(n.fx.tick, n.fx.interval))
    }, n.fx.stop = function() {
      clearInterval(ac), ac = null
    }, n.fx.speeds = {
      slow: 600,
      fast: 200,
      _default: 400
    }, n.fn.delay = function(a, b) {
      return a = n.fx ? n.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function(b, c) {
        var d = setTimeout(b, a);
        c.stop = function() {
          clearTimeout(d)
        }
      })
    },
    function() {
      var a, b, c, d, e = z.createElement("div");
      e.setAttribute("className", "t"), e.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", a = e.getElementsByTagName("a")[0], c = z.createElement("select"), d = c.appendChild(z.createElement("option")), b = e.getElementsByTagName("input")[0], a.style.cssText = "top:1px", l.getSetAttribute = "t" !== e.className, l.style = /top/.test(a.getAttribute("style")), l.hrefNormalized = "/a" === a.getAttribute("href"), l.checkOn = !!b.value, l.optSelected = d.selected, l.enctype = !!z.createElement("form").enctype, c.disabled = !0, l.optDisabled = !d.disabled, b = z.createElement("input"), b.setAttribute("value", ""), l.input = "" === b.getAttribute("value"), b.value = "t", b.setAttribute("type", "radio"), l.radioValue = "t" === b.value, a = b = c = d = e = null
    }();
  var mc = /\r/g;
  n.fn.extend({
    val: function(a) {
      var b, c, d, e = this[0]; {
        if (arguments.length) return d = n.isFunction(a), this.each(function(c) {
          var e;
          1 === this.nodeType && (e = d ? a.call(this, c, n(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : n.isArray(e) && (e = n.map(e, function(a) {
            return null == a ? "" : a + ""
          })), b = n.valHooks[this.type] || n.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e))
        });
        if (e) return b = n.valHooks[e.type] || n.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, "string" == typeof c ? c.replace(mc, "") : null == c ? "" : c)
      }
    }
  }), n.extend({
    valHooks: {
      option: {
        get: function(a) {
          var b = n.find.attr(a, "value");
          return null != b ? b : n.text(a)
        }
      },
      select: {
        get: function(a) {
          for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++)
            if (c = d[i], !(!c.selected && i !== e || (l.optDisabled ? c.disabled : null !== c.getAttribute("disabled")) || c.parentNode.disabled && n.nodeName(c.parentNode, "optgroup"))) {
              if (b = n(c).val(), f) return b;
              g.push(b)
            }
          return g
        },
        set: function(a, b) {
          var c, d, e = a.options,
            f = n.makeArray(b),
            g = e.length;
          while (g--)
            if (d = e[g], n.inArray(n.valHooks.option.get(d), f) >= 0) try {
              d.selected = c = !0
            } catch (h) {
              d.scrollHeight
            } else d.selected = !1;
          return c || (a.selectedIndex = -1), e
        }
      }
    }
  }), n.each(["radio", "checkbox"], function() {
    n.valHooks[this] = {
      set: function(a, b) {
        return n.isArray(b) ? a.checked = n.inArray(n(a).val(), b) >= 0 : void 0
      }
    }, l.checkOn || (n.valHooks[this].get = function(a) {
      return null === a.getAttribute("value") ? "on" : a.value
    })
  });
  var nc, oc, pc = n.expr.attrHandle,
    qc = /^(?:checked|selected)$/i,
    rc = l.getSetAttribute,
    sc = l.input;
  n.fn.extend({
    attr: function(a, b) {
      return W(this, n.attr, a, b, arguments.length > 1)
    },
    removeAttr: function(a) {
      return this.each(function() {
        n.removeAttr(this, a)
      })
    }
  }), n.extend({
    attr: function(a, b, c) {
      var d, e, f = a.nodeType;
      if (a && 3 !== f && 8 !== f && 2 !== f) return typeof a.getAttribute === L ? n.prop(a, b, c) : (1 === f && n.isXMLDoc(a) || (b = b.toLowerCase(), d = n.attrHooks[b] || (n.expr.match.bool.test(b) ? oc : nc)), void 0 === c ? d && "get" in d && null !== (e = d.get(a, b)) ? e : (e = n.find.attr(a, b), null == e ? void 0 : e) : null !== c ? d && "set" in d && void 0 !== (e = d.set(a, c, b)) ? e : (a.setAttribute(b, c + ""), c) : void n.removeAttr(a, b))
    },
    removeAttr: function(a, b) {
      var c, d, e = 0,
        f = b && b.match(F);
      if (f && 1 === a.nodeType)
        while (c = f[e++]) d = n.propFix[c] || c, n.expr.match.bool.test(c) ? sc && rc || !qc.test(c) ? a[d] = !1 : a[n.camelCase("default-" + c)] = a[d] = !1 : n.attr(a, c, ""), a.removeAttribute(rc ? c : d)
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
    }
  }), oc = {
    set: function(a, b, c) {
      return b === !1 ? n.removeAttr(a, c) : sc && rc || !qc.test(c) ? a.setAttribute(!rc && n.propFix[c] || c, c) : a[n.camelCase("default-" + c)] = a[c] = !0, c
    }
  }, n.each(n.expr.match.bool.source.match(/\w+/g), function(a, b) {
    var c = pc[b] || n.find.attr;
    pc[b] = sc && rc || !qc.test(b) ? function(a, b, d) {
      var e, f;
      return d || (f = pc[b], pc[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, pc[b] = f), e
    } : function(a, b, c) {
      return c ? void 0 : a[n.camelCase("default-" + b)] ? b.toLowerCase() : null
    }
  }), sc && rc || (n.attrHooks.value = {
    set: function(a, b, c) {
      return n.nodeName(a, "input") ? void(a.defaultValue = b) : nc && nc.set(a, b, c)
    }
  }), rc || (nc = {
    set: function(a, b, c) {
      var d = a.getAttributeNode(c);
      return d || a.setAttributeNode(d = a.ownerDocument.createAttribute(c)), d.value = b += "", "value" === c || b === a.getAttribute(c) ? b : void 0
    }
  }, pc.id = pc.name = pc.coords = function(a, b, c) {
    var d;
    return c ? void 0 : (d = a.getAttributeNode(b)) && "" !== d.value ? d.value : null
  }, n.valHooks.button = {
    get: function(a, b) {
      var c = a.getAttributeNode(b);
      return c && c.specified ? c.value : void 0
    },
    set: nc.set
  }, n.attrHooks.contenteditable = {
    set: function(a, b, c) {
      nc.set(a, "" === b ? !1 : b, c)
    }
  }, n.each(["width", "height"], function(a, b) {
    n.attrHooks[b] = {
      set: function(a, c) {
        return "" === c ? (a.setAttribute(b, "auto"), c) : void 0
      }
    }
  })), l.style || (n.attrHooks.style = {
    get: function(a) {
      return a.style.cssText || void 0
    },
    set: function(a, b) {
      return a.style.cssText = b + ""
    }
  });
  var tc = /^(?:input|select|textarea|button|object)$/i,
    uc = /^(?:a|area)$/i;
  n.fn.extend({
    prop: function(a, b) {
      return W(this, n.prop, a, b, arguments.length > 1)
    },
    removeProp: function(a) {
      return a = n.propFix[a] || a, this.each(function() {
        try {
          this[a] = void 0, delete this[a]
        } catch (b) {}
      })
    }
  }), n.extend({
    propFix: {
      "for": "htmlFor",
      "class": "className"
    },
    prop: function(a, b, c) {
      var d, e, f, g = a.nodeType;
      if (a && 3 !== g && 8 !== g && 2 !== g) return f = 1 !== g || !n.isXMLDoc(a), f && (b = n.propFix[b] || b, e = n.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b]
    },
    propHooks: {
      tabIndex: {
        get: function(a) {
          var b = n.find.attr(a, "tabindex");
          return b ? parseInt(b, 10) : tc.test(a.nodeName) || uc.test(a.nodeName) && a.href ? 0 : -1
        }
      }
    }
  }), l.hrefNormalized || n.each(["href", "src"], function(a, b) {
    n.propHooks[b] = {
      get: function(a) {
        return a.getAttribute(b, 4)
      }
    }
  }), l.optSelected || (n.propHooks.selected = {
    get: function(a) {
      var b = a.parentNode;
      return b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex), null
    }
  }), n.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
    n.propFix[this.toLowerCase()] = this
  }), l.enctype || (n.propFix.enctype = "encoding");
  var vc = /[\t\r\n\f]/g;
  n.fn.extend({
    addClass: function(a) {
      var b, c, d, e, f, g, h = 0,
        i = this.length,
        j = "string" == typeof a && a;
      if (n.isFunction(a)) return this.each(function(b) {
        n(this).addClass(a.call(this, b, this.className))
      });
      if (j)
        for (b = (a || "").match(F) || []; i > h; h++)
          if (c = this[h], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(vc, " ") : " ")) {
            f = 0;
            while (e = b[f++]) d.indexOf(" " + e + " ") < 0 && (d += e + " ");
            g = n.trim(d), c.className !== g && (c.className = g)
          }
      return this
    },
    removeClass: function(a) {
      var b, c, d, e, f, g, h = 0,
        i = this.length,
        j = 0 === arguments.length || "string" == typeof a && a;
      if (n.isFunction(a)) return this.each(function(b) {
        n(this).removeClass(a.call(this, b, this.className))
      });
      if (j)
        for (b = (a || "").match(F) || []; i > h; h++)
          if (c = this[h], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(vc, " ") : "")) {
            f = 0;
            while (e = b[f++])
              while (d.indexOf(" " + e + " ") >= 0) d = d.replace(" " + e + " ", " ");
            g = a ? n.trim(d) : "", c.className !== g && (c.className = g)
          }
      return this
    },
    toggleClass: function(a, b) {
      var c = typeof a;
      return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(n.isFunction(a) ? function(c) {
        n(this).toggleClass(a.call(this, c, this.className, b), b)
      } : function() {
        if ("string" === c) {
          var b, d = 0,
            e = n(this),
            f = a.match(F) || [];
          while (b = f[d++]) e.hasClass(b) ? e.removeClass(b) : e.addClass(b)
        } else(c === L || "boolean" === c) && (this.className && n._data(this, "__className__", this.className), this.className = this.className || a === !1 ? "" : n._data(this, "__className__") || "")
      })
    },
    hasClass: function(a) {
      for (var b = " " + a + " ", c = 0, d = this.length; d > c; c++)
        if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(vc, " ").indexOf(b) >= 0) return !0;
      return !1
    }
  }), n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(a, b) {
    n.fn[b] = function(a, c) {
      return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b)
    }
  }), n.fn.extend({
    hover: function(a, b) {
      return this.mouseenter(a).mouseleave(b || a)
    },
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
    }
  });
  var wc = n.now(),
    xc = /\?/,
    yc = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;
  n.parseJSON = function(b) {
    if (a.JSON && a.JSON.parse) return a.JSON.parse(b + "");
    var c, d = null,
      e = n.trim(b + "");
    return e && !n.trim(e.replace(yc, function(a, b, e, f) {
      return c && b && (d = 0), 0 === d ? a : (c = e || b, d += !f - !e, "")
    })) ? Function("return " + e)() : n.error("Invalid JSON: " + b)
  }, n.parseXML = function(b) {
    var c, d;
    if (!b || "string" != typeof b) return null;
    try {
      a.DOMParser ? (d = new DOMParser, c = d.parseFromString(b, "text/xml")) : (c = new ActiveXObject("Microsoft.XMLDOM"), c.async = "false", c.loadXML(b))
    } catch (e) {
      c = void 0
    }
    return c && c.documentElement && !c.getElementsByTagName("parsererror").length || n.error("Invalid XML: " + b), c
  };
  var zc, Ac, Bc = /#.*$/,
    Cc = /([?&])_=[^&]*/,
    Dc = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
    Ec = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
    Fc = /^(?:GET|HEAD)$/,
    Gc = /^\/\//,
    Hc = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
    Ic = {},
    Jc = {},
    Kc = "*/".concat("*");
  try {
    Ac = location.href
  } catch (Lc) {
    Ac = z.createElement("a"), Ac.href = "", Ac = Ac.href
  }
  zc = Hc.exec(Ac.toLowerCase()) || [];

  function Mc(a) {
    return function(b, c) {
      "string" != typeof b && (c = b, b = "*");
      var d, e = 0,
        f = b.toLowerCase().match(F) || [];
      if (n.isFunction(c))
        while (d = f[e++]) "+" === d.charAt(0) ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c)
    }
  }

  function Nc(a, b, c, d) {
    var e = {},
      f = a === Jc;

    function g(h) {
      var i;
      return e[h] = !0, n.each(a[h] || [], function(a, h) {
        var j = h(b, c, d);
        return "string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1)
      }), i
    }
    return g(b.dataTypes[0]) || !e["*"] && g("*")
  }

  function Oc(a, b) {
    var c, d, e = n.ajaxSettings.flatOptions || {};
    for (d in b) void 0 !== b[d] && ((e[d] ? a : c || (c = {}))[d] = b[d]);
    return c && n.extend(!0, a, c), a
  }

  function Pc(a, b, c) {
    var d, e, f, g, h = a.contents,
      i = a.dataTypes;
    while ("*" === i[0]) i.shift(), void 0 === e && (e = a.mimeType || b.getResponseHeader("Content-Type"));
    if (e)
      for (g in h)
        if (h[g] && h[g].test(e)) {
          i.unshift(g);
          break
        }
    if (i[0] in c) f = i[0];
    else {
      for (g in c) {
        if (!i[0] || a.converters[g + " " + i[0]]) {
          f = g;
          break
        }
        d || (d = g)
      }
      f = f || d
    }
    return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0
  }

  function Qc(a, b, c, d) {
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
      url: Ac,
      type: "GET",
      isLocal: Ec.test(zc[1]),
      global: !0,
      processData: !0,
      async: !0,
      contentType: "application/x-www-form-urlencoded; charset=UTF-8",
      accepts: {
        "*": Kc,
        text: "text/plain",
        html: "text/html",
        xml: "application/xml, text/xml",
        json: "application/json, text/javascript"
      },
      contents: {
        xml: /xml/,
        html: /html/,
        json: /json/
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
      return b ? Oc(Oc(a, n.ajaxSettings), b) : Oc(n.ajaxSettings, a)
    },
    ajaxPrefilter: Mc(Ic),
    ajaxTransport: Mc(Jc),
    ajax: function(a, b) {
      "object" == typeof a && (b = a, a = void 0), b = b || {};
      var c, d, e, f, g, h, i, j, k = n.ajaxSetup({}, b),
        l = k.context || k,
        m = k.context && (l.nodeType || l.jquery) ? n(l) : n.event,
        o = n.Deferred(),
        p = n.Callbacks("once memory"),
        q = k.statusCode || {},
        r = {},
        s = {},
        t = 0,
        u = "canceled",
        v = {
          readyState: 0,
          getResponseHeader: function(a) {
            var b;
            if (2 === t) {
              if (!j) {
                j = {};
                while (b = Dc.exec(f)) j[b[1].toLowerCase()] = b[2]
              }
              b = j[a.toLowerCase()]
            }
            return null == b ? null : b
          },
          getAllResponseHeaders: function() {
            return 2 === t ? f : null
          },
          setRequestHeader: function(a, b) {
            var c = a.toLowerCase();
            return t || (a = s[c] = s[c] || a, r[a] = b), this
          },
          overrideMimeType: function(a) {
            return t || (k.mimeType = a), this
          },
          statusCode: function(a) {
            var b;
            if (a)
              if (2 > t)
                for (b in a) q[b] = [q[b], a[b]];
              else v.always(a[v.status]);
            return this
          },
          abort: function(a) {
            var b = a || u;
            return i && i.abort(b), x(0, b), this
          }
        };
      if (o.promise(v).complete = p.add, v.success = v.done, v.error = v.fail, k.url = ((a || k.url || Ac) + "").replace(Bc, "").replace(Gc, zc[1] + "//"), k.type = b.method || b.type || k.method || k.type, k.dataTypes = n.trim(k.dataType || "*").toLowerCase().match(F) || [""], null == k.crossDomain && (c = Hc.exec(k.url.toLowerCase()), k.crossDomain = !(!c || c[1] === zc[1] && c[2] === zc[2] && (c[3] || ("http:" === c[1] ? "80" : "443")) === (zc[3] || ("http:" === zc[1] ? "80" : "443")))), k.data && k.processData && "string" != typeof k.data && (k.data = n.param(k.data, k.traditional)), Nc(Ic, k, b, v), 2 === t) return v;
      h = k.global, h && 0 === n.active++ && n.event.trigger("ajaxStart"), k.type = k.type.toUpperCase(), k.hasContent = !Fc.test(k.type), e = k.url, k.hasContent || (k.data && (e = k.url += (xc.test(e) ? "&" : "?") + k.data, delete k.data), k.cache === !1 && (k.url = Cc.test(e) ? e.replace(Cc, "$1_=" + wc++) : e + (xc.test(e) ? "&" : "?") + "_=" + wc++)), k.ifModified && (n.lastModified[e] && v.setRequestHeader("If-Modified-Since", n.lastModified[e]), n.etag[e] && v.setRequestHeader("If-None-Match", n.etag[e])), (k.data && k.hasContent && k.contentType !== !1 || b.contentType) && v.setRequestHeader("Content-Type", k.contentType), v.setRequestHeader("Accept", k.dataTypes[0] && k.accepts[k.dataTypes[0]] ? k.accepts[k.dataTypes[0]] + ("*" !== k.dataTypes[0] ? ", " + Kc + "; q=0.01" : "") : k.accepts["*"]);
      for (d in k.headers) v.setRequestHeader(d, k.headers[d]);
      if (k.beforeSend && (k.beforeSend.call(l, v, k) === !1 || 2 === t)) return v.abort();
      u = "abort";
      for (d in {
          success: 1,
          error: 1,
          complete: 1
        }) v[d](k[d]);
      if (i = Nc(Jc, k, b, v)) {
        v.readyState = 1, h && m.trigger("ajaxSend", [v, k]), k.async && k.timeout > 0 && (g = setTimeout(function() {
          v.abort("timeout")
        }, k.timeout));
        try {
          t = 1, i.send(r, x)
        } catch (w) {
          if (!(2 > t)) throw w;
          x(-1, w)
        }
      } else x(-1, "No Transport");

      function x(a, b, c, d) {
        var j, r, s, u, w, x = b;
        2 !== t && (t = 2, g && clearTimeout(g), i = void 0, f = d || "", v.readyState = a > 0 ? 4 : 0, j = a >= 200 && 300 > a || 304 === a, c && (u = Pc(k, v, c)), u = Qc(k, u, v, j), j ? (k.ifModified && (w = v.getResponseHeader("Last-Modified"), w && (n.lastModified[e] = w), w = v.getResponseHeader("etag"), w && (n.etag[e] = w)), 204 === a || "HEAD" === k.type ? x = "nocontent" : 304 === a ? x = "notmodified" : (x = u.state, r = u.data, s = u.error, j = !s)) : (s = x, (a || !x) && (x = "error", 0 > a && (a = 0))), v.status = a, v.statusText = (b || x) + "", j ? o.resolveWith(l, [r, x, v]) : o.rejectWith(l, [v, x, s]), v.statusCode(q), q = void 0, h && m.trigger(j ? "ajaxSuccess" : "ajaxError", [v, k, j ? r : s]), p.fireWith(l, [v, x]), h && (m.trigger("ajaxComplete", [v, k]), --n.active || n.event.trigger("ajaxStop")))
      }
      return v
    },
    getJSON: function(a, b, c) {
      return n.get(a, b, c, "json")
    },
    getScript: function(a, b) {
      return n.get(a, void 0, b, "script")
    }
  }), n.each(["get", "post"], function(a, b) {
    n[b] = function(a, c, d, e) {
      return n.isFunction(c) && (e = e || d, d = c, c = void 0), n.ajax({
        url: a,
        type: b,
        dataType: e,
        data: c,
        success: d
      })
    }
  }), n.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(a, b) {
    n.fn[b] = function(a) {
      return this.on(b, a)
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
      if (n.isFunction(a)) return this.each(function(b) {
        n(this).wrapAll(a.call(this, b))
      });
      if (this[0]) {
        var b = n(a, this[0].ownerDocument).eq(0).clone(!0);
        this[0].parentNode && b.insertBefore(this[0]), b.map(function() {
          var a = this;
          while (a.firstChild && 1 === a.firstChild.nodeType) a = a.firstChild;
          return a
        }).append(this)
      }
      return this
    },
    wrapInner: function(a) {
      return this.each(n.isFunction(a) ? function(b) {
        n(this).wrapInner(a.call(this, b))
      } : function() {
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
    return a.offsetWidth <= 0 && a.offsetHeight <= 0 || !l.reliableHiddenOffsets() && "none" === (a.style && a.style.display || n.css(a, "display"))
  }, n.expr.filters.visible = function(a) {
    return !n.expr.filters.hidden(a)
  };
  var Rc = /%20/g,
    Sc = /\[\]$/,
    Tc = /\r?\n/g,
    Uc = /^(?:submit|button|image|reset|file)$/i,
    Vc = /^(?:input|select|textarea|keygen)/i;

  function Wc(a, b, c, d) {
    var e;
    if (n.isArray(b)) n.each(b, function(b, e) {
      c || Sc.test(a) ? d(a, e) : Wc(a + "[" + ("object" == typeof e ? b : "") + "]", e, c, d)
    });
    else if (c || "object" !== n.type(b)) d(a, b);
    else
      for (e in b) Wc(a + "[" + e + "]", b[e], c, d)
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
      for (c in a) Wc(c, a[c], b, e);
    return d.join("&").replace(Rc, "+")
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
        return this.name && !n(this).is(":disabled") && Vc.test(this.nodeName) && !Uc.test(a) && (this.checked || !X.test(a))
      }).map(function(a, b) {
        var c = n(this).val();
        return null == c ? null : n.isArray(c) ? n.map(c, function(a) {
          return {
            name: b.name,
            value: a.replace(Tc, "\r\n")
          }
        }) : {
          name: b.name,
          value: c.replace(Tc, "\r\n")
        }
      }).get()
    }
  }), n.ajaxSettings.xhr = void 0 !== a.ActiveXObject ? function() {
    return !this.isLocal && /^(get|post|head|put|delete|options)$/i.test(this.type) && $c() || _c()
  } : $c;
  var Xc = 0,
    Yc = {},
    Zc = n.ajaxSettings.xhr();
  a.ActiveXObject && n(a).on("unload", function() {
    for (var a in Yc) Yc[a](void 0, !0)
  }), l.cors = !!Zc && "withCredentials" in Zc, Zc = l.ajax = !!Zc, Zc && n.ajaxTransport(function(a) {
    if (!a.crossDomain || l.cors) {
      var b;
      return {
        send: function(c, d) {
          var e, f = a.xhr(),
            g = ++Xc;
          if (f.open(a.type, a.url, a.async, a.username, a.password), a.xhrFields)
            for (e in a.xhrFields) f[e] = a.xhrFields[e];
          a.mimeType && f.overrideMimeType && f.overrideMimeType(a.mimeType), a.crossDomain || c["X-Requested-With"] || (c["X-Requested-With"] = "XMLHttpRequest");
          for (e in c) void 0 !== c[e] && f.setRequestHeader(e, c[e] + "");
          f.send(a.hasContent && a.data || null), b = function(c, e) {
            var h, i, j;
            if (b && (e || 4 === f.readyState))
              if (delete Yc[g], b = void 0, f.onreadystatechange = n.noop, e) 4 !== f.readyState && f.abort();
              else {
                j = {}, h = f.status, "string" == typeof f.responseText && (j.text = f.responseText);
                try {
                  i = f.statusText
                } catch (k) {
                  i = ""
                }
                h || !a.isLocal || a.crossDomain ? 1223 === h && (h = 204) : h = j.text ? 200 : 404
              }
            j && d(h, i, j, f.getAllResponseHeaders())
          }, a.async ? 4 === f.readyState ? setTimeout(b) : f.onreadystatechange = Yc[g] = b : b()
        },
        abort: function() {
          b && b(void 0, !0)
        }
      }
    }
  });

  function $c() {
    try {
      return new a.XMLHttpRequest
    } catch (b) {}
  }

  function _c() {
    try {
      return new a.ActiveXObject("Microsoft.XMLHTTP")
    } catch (b) {}
  }
  n.ajaxSetup({
    accepts: {
      script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
    },
    contents: {
      script: /(?:java|ecma)script/
    },
    converters: {
      "text script": function(a) {
        return n.globalEval(a), a
      }
    }
  }), n.ajaxPrefilter("script", function(a) {
    void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET", a.global = !1)
  }), n.ajaxTransport("script", function(a) {
    if (a.crossDomain) {
      var b, c = z.head || n("head")[0] || z.documentElement;
      return {
        send: function(d, e) {
          b = z.createElement("script"), b.async = !0, a.scriptCharset && (b.charset = a.scriptCharset), b.src = a.url, b.onload = b.onreadystatechange = function(a, c) {
            (c || !b.readyState || /loaded|complete/.test(b.readyState)) && (b.onload = b.onreadystatechange = null, b.parentNode && b.parentNode.removeChild(b), b = null, c || e(200, "success"))
          }, c.insertBefore(b, c.firstChild)
        },
        abort: function() {
          b && b.onload(void 0, !0)
        }
      }
    }
  });
  var ad = [],
    bd = /(=)\?(?=&|$)|\?\?/;
  n.ajaxSetup({
    jsonp: "callback",
    jsonpCallback: function() {
      var a = ad.pop() || n.expando + "_" + wc++;
      return this[a] = !0, a
    }
  }), n.ajaxPrefilter("json jsonp", function(b, c, d) {
    var e, f, g, h = b.jsonp !== !1 && (bd.test(b.url) ? "url" : "string" == typeof b.data && !(b.contentType || "").indexOf("application/x-www-form-urlencoded") && bd.test(b.data) && "data");
    return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = n.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(bd, "$1" + e) : b.jsonp !== !1 && (b.url += (xc.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), b.converters["script json"] = function() {
      return g || n.error(e + " was not called"), g[0]
    }, b.dataTypes[0] = "json", f = a[e], a[e] = function() {
      g = arguments
    }, d.always(function() {
      a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, ad.push(e)), g && n.isFunction(f) && f(g[0]), g = f = void 0
    }), "script") : void 0
  }), n.parseHTML = function(a, b, c) {
    if (!a || "string" != typeof a) return null;
    "boolean" == typeof b && (c = b, b = !1), b = b || z;
    var d = v.exec(a),
      e = !c && [];
    return d ? [b.createElement(d[1])] : (d = n.buildFragment([a], b, e), e && e.length && n(e).remove(), n.merge([], d.childNodes))
  };
  var cd = n.fn.load;
  n.fn.load = function(a, b, c) {
    if ("string" != typeof a && cd) return cd.apply(this, arguments);
    var d, e, f, g = this,
      h = a.indexOf(" ");
    return h >= 0 && (d = a.slice(h, a.length), a = a.slice(0, h)), n.isFunction(b) ? (c = b, b = void 0) : b && "object" == typeof b && (f = "POST"), g.length > 0 && n.ajax({
      url: a,
      type: f,
      dataType: "html",
      data: b
    }).done(function(a) {
      e = arguments, g.html(d ? n("<div>").append(n.parseHTML(a)).find(d) : a)
    }).complete(c && function(a, b) {
      g.each(c, e || [a.responseText, b, a])
    }), this
  }, n.expr.filters.animated = function(a) {
    return n.grep(n.timers, function(b) {
      return a === b.elem
    }).length
  };
  var dd = a.document.documentElement;

  function ed(a) {
    return n.isWindow(a) ? a : 9 === a.nodeType ? a.defaultView || a.parentWindow : !1
  }
  n.offset = {
    setOffset: function(a, b, c) {
      var d, e, f, g, h, i, j, k = n.css(a, "position"),
        l = n(a),
        m = {};
      "static" === k && (a.style.position = "relative"), h = l.offset(), f = n.css(a, "top"), i = n.css(a, "left"), j = ("absolute" === k || "fixed" === k) && n.inArray("auto", [f, i]) > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), n.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (m.top = b.top - h.top + g), null != b.left && (m.left = b.left - h.left + e), "using" in b ? b.using.call(a, m) : l.css(m)
    }
  }, n.fn.extend({
    offset: function(a) {
      if (arguments.length) return void 0 === a ? this : this.each(function(b) {
        n.offset.setOffset(this, a, b)
      });
      var b, c, d = {
          top: 0,
          left: 0
        },
        e = this[0],
        f = e && e.ownerDocument;
      if (f) return b = f.documentElement, n.contains(b, e) ? (typeof e.getBoundingClientRect !== L && (d = e.getBoundingClientRect()), c = ed(f), {
        top: d.top + (c.pageYOffset || b.scrollTop) - (b.clientTop || 0),
        left: d.left + (c.pageXOffset || b.scrollLeft) - (b.clientLeft || 0)
      }) : d
    },
    position: function() {
      if (this[0]) {
        var a, b, c = {
            top: 0,
            left: 0
          },
          d = this[0];
        return "fixed" === n.css(d, "position") ? b = d.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), n.nodeName(a[0], "html") || (c = a.offset()), c.top += n.css(a[0], "borderTopWidth", !0), c.left += n.css(a[0], "borderLeftWidth", !0)), {
          top: b.top - c.top - n.css(d, "marginTop", !0),
          left: b.left - c.left - n.css(d, "marginLeft", !0)
        }
      }
    },
    offsetParent: function() {
      return this.map(function() {
        var a = this.offsetParent || dd;
        while (a && !n.nodeName(a, "html") && "static" === n.css(a, "position")) a = a.offsetParent;
        return a || dd
      })
    }
  }), n.each({
    scrollLeft: "pageXOffset",
    scrollTop: "pageYOffset"
  }, function(a, b) {
    var c = /Y/.test(b);
    n.fn[a] = function(d) {
      return W(this, function(a, d, e) {
        var f = ed(a);
        return void 0 === e ? f ? b in f ? f[b] : f.document.documentElement[d] : a[d] : void(f ? f.scrollTo(c ? n(f).scrollLeft() : e, c ? e : n(f).scrollTop()) : a[d] = e)
      }, a, d, arguments.length, null)
    }
  }), n.each(["top", "left"], function(a, b) {
    n.cssHooks[b] = Mb(l.pixelPosition, function(a, c) {
      return c ? (c = Kb(a, b), Ib.test(c) ? n(a).position()[b] + "px" : c) : void 0
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
        return W(this, function(b, c, d) {
          var e;
          return n.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? n.css(b, c, g) : n.style(b, c, d, g)
        }, b, f ? d : void 0, f, null)
      }
    })
  }), n.fn.size = function() {
    return this.length
  }, n.fn.andSelf = n.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function() {
    return n
  });
  var fd = a.jQuery,
    gd = a.$;
  return n.noConflict = function(b) {
    return a.$ === n && (a.$ = gd), b && a.jQuery === n && (a.jQuery = fd), n
  }, typeof b === L && (a.jQuery = a.$ = n), n
});
/*! RESOURCE: /scripts/thirdparty/cometd/jquery/jquery-1.11.0_no_conflict.js */
(function() {
  window.jQuery1110 = jQuery.noConflict(true);
})();;
/*! RESOURCE: /scripts/thirdparty/cometd/org/cometd.js */
this.org = this.org || {};
org.cometd = {};
org.cometd.JSON = {};
org.cometd.JSON.toJSON = org.cometd.JSON.fromJSON = function(object) {
  throw 'Abstract';
};
org.cometd.Utils = {};
org.cometd.Utils.isString = function(value) {
  if (value === undefined || value === null) {
    return false;
  }
  return typeof value === 'string' || value instanceof String;
};
org.cometd.Utils.isArray = function(value) {
  if (value === undefined || value === null) {
    return false;
  }
  return value instanceof Array;
};
org.cometd.Utils.inArray = function(element, array) {
  for (var i = 0; i < array.length; ++i) {
    if (element === array[i]) {
      return i;
    }
  }
  return -1;
};
org.cometd.Utils.setTimeout = function(cometd, funktion, delay) {
  return window.setTimeout(function() {
    try {
      funktion();
    } catch (x) {
      cometd._debug('Exception invoking timed function', funktion, x);
    }
  }, delay);
};
org.cometd.Utils.clearTimeout = function(timeoutHandle) {
  window.clearTimeout(timeoutHandle);
};
org.cometd.TransportRegistry = function() {
  var _types = [];
  var _transports = {};
  this.getTransportTypes = function() {
    return _types.slice(0);
  };
  this.findTransportTypes = function(version, crossDomain, url) {
    var result = [];
    for (var i = 0; i < _types.length; ++i) {
      var type = _types[i];
      if (_transports[type].accept(version, crossDomain, url) === true) {
        result.push(type);
      }
    }
    return result;
  };
  this.negotiateTransport = function(types, version, crossDomain, url) {
    for (var i = 0; i < _types.length; ++i) {
      var type = _types[i];
      for (var j = 0; j < types.length; ++j) {
        if (type === types[j]) {
          var transport = _transports[type];
          if (transport.accept(version, crossDomain, url) === true) {
            return transport;
          }
        }
      }
    }
    return null;
  };
  this.add = function(type, transport, index) {
    var existing = false;
    for (var i = 0; i < _types.length; ++i) {
      if (_types[i] === type) {
        existing = true;
        break;
      }
    }
    if (!existing) {
      if (typeof index !== 'number') {
        _types.push(type);
      } else {
        _types.splice(index, 0, type);
      }
      _transports[type] = transport;
    }
    return !existing;
  };
  this.find = function(type) {
    for (var i = 0; i < _types.length; ++i) {
      if (_types[i] === type) {
        return _transports[type];
      }
    }
    return null;
  };
  this.remove = function(type) {
    for (var i = 0; i < _types.length; ++i) {
      if (_types[i] === type) {
        _types.splice(i, 1);
        var transport = _transports[type];
        delete _transports[type];
        return transport;
      }
    }
    return null;
  };
  this.clear = function() {
    _types = [];
    _transports = {};
  };
  this.reset = function() {
    for (var i = 0; i < _types.length; ++i) {
      _transports[_types[i]].reset();
    }
  };
};
org.cometd.Transport = function() {
  var _type;
  var _cometd;
  this.registered = function(type, cometd) {
    _type = type;
    _cometd = cometd;
  };
  this.unregistered = function() {
    _type = null;
    _cometd = null;
  };
  this._debug = function() {
    _cometd._debug.apply(_cometd, arguments);
  };
  this._mixin = function() {
    return _cometd._mixin.apply(_cometd, arguments);
  };
  this.getConfiguration = function() {
    return _cometd.getConfiguration();
  };
  this.getAdvice = function() {
    return _cometd.getAdvice();
  };
  this.setTimeout = function(funktion, delay) {
    return org.cometd.Utils.setTimeout(_cometd, funktion, delay);
  };
  this.clearTimeout = function(handle) {
    org.cometd.Utils.clearTimeout(handle);
  };
  this.convertToMessages = function(response) {
    if (org.cometd.Utils.isString(response)) {
      try {
        return org.cometd.JSON.fromJSON(response);
      } catch (x) {
        this._debug('Could not convert to JSON the following string', '"' + response + '"');
        throw x;
      }
    }
    if (org.cometd.Utils.isArray(response)) {
      return response;
    }
    if (response === undefined || response === null) {
      return [];
    }
    if (response instanceof Object) {
      return [response];
    }
    throw 'Conversion Error ' + response + ', typeof ' + (typeof response);
  };
  this.accept = function(version, crossDomain, url) {
    throw 'Abstract';
  };
  this.getType = function() {
    return _type;
  };
  this.send = function(envelope, metaConnect) {
    throw 'Abstract';
  };
  this.reset = function() {
    this._debug('Transport', _type, 'reset');
  };
  this.abort = function() {
    this._debug('Transport', _type, 'aborted');
  };
  this.toString = function() {
    return this.getType();
  };
};
org.cometd.Transport.derive = function(baseObject) {
  function F() {}
  F.prototype = baseObject;
  return new F();
};
org.cometd.RequestTransport = function() {
  var _super = new org.cometd.Transport();
  var _self = org.cometd.Transport.derive(_super);
  var _requestIds = 0;
  var _metaConnectRequest = null;
  var _requests = [];
  var _envelopes = [];

  function _coalesceEnvelopes(envelope) {
    while (_envelopes.length > 0) {
      var envelopeAndRequest = _envelopes[0];
      var newEnvelope = envelopeAndRequest[0];
      var newRequest = envelopeAndRequest[1];
      if (newEnvelope.url === envelope.url &&
        newEnvelope.sync === envelope.sync) {
        _envelopes.shift();
        envelope.messages = envelope.messages.concat(newEnvelope.messages);
        this._debug('Coalesced', newEnvelope.messages.length, 'messages from request', newRequest.id);
        continue;
      }
      break;
    }
  }

  function _transportSend(envelope, request) {
    this.transportSend(envelope, request);
    request.expired = false;
    if (!envelope.sync) {
      var maxDelay = this.getConfiguration().maxNetworkDelay;
      var delay = maxDelay;
      if (request.metaConnect === true) {
        delay += this.getAdvice().timeout;
      }
      this._debug('Transport', this.getType(), 'waiting at most', delay, 'ms for the response, maxNetworkDelay', maxDelay);
      var self = this;
      request.timeout = this.setTimeout(function() {
        request.expired = true;
        var errorMessage = 'Request ' + request.id + ' of transport ' + self.getType() + ' exceeded ' + delay + ' ms max network delay';
        var failure = {
          reason: errorMessage
        };
        var xhr = request.xhr;
        failure.httpCode = self.xhrStatus(xhr);
        self.abortXHR(xhr);
        self._debug(errorMessage);
        self.complete(request, false, request.metaConnect);
        envelope.onFailure(xhr, envelope.messages, failure);
      }, delay);
    }
  }

  function _queueSend(envelope) {
    var requestId = ++_requestIds;
    var request = {
      id: requestId,
      metaConnect: false
    };
    if (_requests.length < this.getConfiguration().maxConnections - 1) {
      _requests.push(request);
      _transportSend.call(this, envelope, request);
    } else {
      this._debug('Transport', this.getType(), 'queueing request', requestId, 'envelope', envelope);
      _envelopes.push([envelope, request]);
    }
  }

  function _metaConnectComplete(request) {
    var requestId = request.id;
    this._debug('Transport', this.getType(), 'metaConnect complete, request', requestId);
    if (_metaConnectRequest !== null && _metaConnectRequest.id !== requestId) {
      throw 'Longpoll request mismatch, completing request ' + requestId;
    }
    _metaConnectRequest = null;
  }

  function _complete(request, success) {
    var index = org.cometd.Utils.inArray(request, _requests);
    if (index >= 0) {
      _requests.splice(index, 1);
    }
    if (_envelopes.length > 0) {
      var envelopeAndRequest = _envelopes.shift();
      var nextEnvelope = envelopeAndRequest[0];
      var nextRequest = envelopeAndRequest[1];
      this._debug('Transport dequeued request', nextRequest.id);
      if (success) {
        if (this.getConfiguration().autoBatch) {
          _coalesceEnvelopes.call(this, nextEnvelope);
        }
        _queueSend.call(this, nextEnvelope);
        this._debug('Transport completed request', request.id, nextEnvelope);
      } else {
        var self = this;
        this.setTimeout(function() {
          self.complete(nextRequest, false, nextRequest.metaConnect);
          var failure = {
            reason: 'Previous request failed'
          };
          var xhr = nextRequest.xhr;
          failure.httpCode = self.xhrStatus(xhr);
          nextEnvelope.onFailure(xhr, nextEnvelope.messages, failure);
        }, 0);
      }
    }
  }
  _self.complete = function(request, success, metaConnect) {
    if (metaConnect) {
      _metaConnectComplete.call(this, request);
    } else {
      _complete.call(this, request, success);
    }
  };
  _self.transportSend = function(envelope, request) {
    throw 'Abstract';
  };
  _self.transportSuccess = function(envelope, request, responses) {
    if (!request.expired) {
      this.clearTimeout(request.timeout);
      this.complete(request, true, request.metaConnect);
      if (responses && responses.length > 0) {
        envelope.onSuccess(responses);
      } else {
        envelope.onFailure(request.xhr, envelope.messages, {
          httpCode: 204
        });
      }
    }
  };
  _self.transportFailure = function(envelope, request, failure) {
    if (!request.expired) {
      this.clearTimeout(request.timeout);
      this.complete(request, false, request.metaConnect);
      envelope.onFailure(request.xhr, envelope.messages, failure);
    }
  };

  function _metaConnectSend(envelope) {
    if (_metaConnectRequest !== null) {
      throw 'Concurrent metaConnect requests not allowed, request id=' + _metaConnectRequest.id + ' not yet completed';
    }
    var requestId = ++_requestIds;
    this._debug('Transport', this.getType(), 'metaConnect send, request', requestId, 'envelope', envelope);
    var request = {
      id: requestId,
      metaConnect: true
    };
    _transportSend.call(this, envelope, request);
    _metaConnectRequest = request;
  }
  _self.send = function(envelope, metaConnect) {
    if (metaConnect) {
      _metaConnectSend.call(this, envelope);
    } else {
      _queueSend.call(this, envelope);
    }
  };
  _self.abort = function() {
    _super.abort();
    for (var i = 0; i < _requests.length; ++i) {
      var request = _requests[i];
      this._debug('Aborting request', request);
      this.abortXHR(request.xhr);
    }
    if (_metaConnectRequest) {
      this._debug('Aborting metaConnect request', _metaConnectRequest);
      this.abortXHR(_metaConnectRequest.xhr);
    }
    this.reset();
  };
  _self.reset = function() {
    _super.reset();
    _metaConnectRequest = null;
    _requests = [];
    _envelopes = [];
  };
  _self.abortXHR = function(xhr) {
    if (xhr) {
      try {
        xhr.abort();
      } catch (x) {
        this._debug(x);
      }
    }
  };
  _self.xhrStatus = function(xhr) {
    if (xhr) {
      try {
        return xhr.status;
      } catch (x) {
        this._debug(x);
      }
    }
    return -1;
  };
  return _self;
};
org.cometd.LongPollingTransport = function() {
  var _super = new org.cometd.RequestTransport();
  var _self = org.cometd.Transport.derive(_super);
  var _supportsCrossDomain = true;
  _self.accept = function(version, crossDomain, url) {
    return _supportsCrossDomain || !crossDomain;
  };
  _self.xhrSend = function(packet) {
    throw 'Abstract';
  };
  _self.transportSend = function(envelope, request) {
    this._debug('Transport', this.getType(), 'sending request', request.id, 'envelope', envelope);
    var self = this;
    try {
      var sameStack = true;
      request.xhr = this.xhrSend({
        transport: this,
        url: envelope.url,
        sync: envelope.sync,
        headers: this.getConfiguration().requestHeaders,
        body: org.cometd.JSON.toJSON(envelope.messages),
        onSuccess: function(response) {
          self._debug('Transport', self.getType(), 'received response', response);
          var success = false;
          try {
            var received = self.convertToMessages(response);
            if (received.length === 0) {
              _supportsCrossDomain = false;
              self.transportFailure(envelope, request, {
                httpCode: 204
              });
            } else {
              success = true;
              self.transportSuccess(envelope, request, received);
            }
          } catch (x) {
            self._debug(x);
            if (!success) {
              _supportsCrossDomain = false;
              var failure = {
                exception: x
              };
              failure.httpCode = self.xhrStatus(request.xhr);
              self.transportFailure(envelope, request, failure);
            }
          }
        },
        onError: function(reason, exception) {
          _supportsCrossDomain = false;
          var failure = {
            reason: reason,
            exception: exception
          };
          failure.httpCode = self.xhrStatus(request.xhr);
          if (sameStack) {
            self.setTimeout(function() {
              self.transportFailure(envelope, request, failure);
            }, 0);
          } else {
            self.transportFailure(envelope, request, failure);
          }
        }
      });
      sameStack = false;
    } catch (x) {
      _supportsCrossDomain = false;
      this.setTimeout(function() {
        self.transportFailure(envelope, request, {
          exception: x
        });
      }, 0);
    }
  };
  _self.reset = function() {
    _super.reset();
    _supportsCrossDomain = true;
  };
  return _self;
};
org.cometd.CallbackPollingTransport = function() {
  var _super = new org.cometd.RequestTransport();
  var _self = org.cometd.Transport.derive(_super);
  var _maxLength = 2000;
  _self.accept = function(version, crossDomain, url) {
    return true;
  };
  _self.jsonpSend = function(packet) {
    throw 'Abstract';
  };
  _self.transportSend = function(envelope, request) {
    var self = this;
    var start = 0;
    var length = envelope.messages.length;
    var lengths = [];
    while (length > 0) {
      var json = org.cometd.JSON.toJSON(envelope.messages.slice(start, start + length));
      var urlLength = envelope.url.length + encodeURI(json).length;
      if (urlLength > _maxLength) {
        if (length === 1) {
          this.setTimeout(function() {
            self.transportFailure(envelope, request, {
              reason: 'Bayeux message too big, max is ' + _maxLength
            });
          }, 0);
          return;
        }
        --length;
        continue;
      }
      lengths.push(length);
      start += length;
      length = envelope.messages.length - start;
    }
    var envelopeToSend = envelope;
    if (lengths.length > 1) {
      var begin = 0;
      var end = lengths[0];
      this._debug('Transport', this.getType(), 'split', envelope.messages.length, 'messages into', lengths.join(' + '));
      envelopeToSend = this._mixin(false, {}, envelope);
      envelopeToSend.messages = envelope.messages.slice(begin, end);
      envelopeToSend.onSuccess = envelope.onSuccess;
      envelopeToSend.onFailure = envelope.onFailure;
      for (var i = 1; i < lengths.length; ++i) {
        var nextEnvelope = this._mixin(false, {}, envelope);
        begin = end;
        end += lengths[i];
        nextEnvelope.messages = envelope.messages.slice(begin, end);
        nextEnvelope.onSuccess = envelope.onSuccess;
        nextEnvelope.onFailure = envelope.onFailure;
        this.send(nextEnvelope, request.metaConnect);
      }
    }
    this._debug('Transport', this.getType(), 'sending request', request.id, 'envelope', envelopeToSend);
    try {
      var sameStack = true;
      this.jsonpSend({
        transport: this,
        url: envelopeToSend.url,
        sync: envelopeToSend.sync,
        headers: this.getConfiguration().requestHeaders,
        body: org.cometd.JSON.toJSON(envelopeToSend.messages),
        onSuccess: function(responses) {
          var success = false;
          try {
            var received = self.convertToMessages(responses);
            if (received.length === 0) {
              self.transportFailure(envelopeToSend, request, {
                httpCode: 204
              });
            } else {
              success = true;
              self.transportSuccess(envelopeToSend, request, received);
            }
          } catch (x) {
            self._debug(x);
            if (!success) {
              self.transportFailure(envelopeToSend, request, {
                exception: x
              });
            }
          }
        },
        onError: function(reason, exception) {
          var failure = {
            reason: reason,
            exception: exception
          };
          if (sameStack) {
            self.setTimeout(function() {
              self.transportFailure(envelopeToSend, request, failure);
            }, 0);
          } else {
            self.transportFailure(envelopeToSend, request, failure);
          }
        }
      });
      sameStack = false;
    } catch (xx) {
      this.setTimeout(function() {
        self.transportFailure(envelopeToSend, request, {
          exception: xx
        });
      }, 0);
    }
  };
  return _self;
};
org.cometd.WebSocketTransport = function() {
  var _super = new org.cometd.Transport();
  var _self = org.cometd.Transport.derive(_super);
  var _cometd;
  var _webSocketSupported = true;
  var _webSocketConnected = false;
  var _stickyReconnect = true;
  var _envelopes = {};
  var _timeouts = {};
  var _connecting = false;
  var _webSocket = null;
  var _connected = false;
  var _successCallback = null;
  _self.reset = function() {
    _super.reset();
    _webSocketSupported = true;
    _webSocketConnected = false;
    _stickyReconnect = true;
    _envelopes = {};
    _timeouts = {};
    _connecting = false;
    _webSocket = null;
    _connected = false;
    _successCallback = null;
  };

  function _websocketConnect() {
    if (_connecting) {
      return;
    }
    _connecting = true;
    var url = _cometd.getURL().replace(/^http/, 'ws');
    this._debug('Transport', this.getType(), 'connecting to URL', url);
    try {
      var protocol = _cometd.getConfiguration().protocol;
      var webSocket = protocol ? new org.cometd.WebSocket(url, protocol) : new org.cometd.WebSocket(url);
    } catch (x) {
      _webSocketSupported = false;
      this._debug('Exception while creating WebSocket object', x);
      throw x;
    }
    _stickyReconnect = _cometd.getConfiguration().stickyReconnect !== false;
    var self = this;
    var connectTimer = null;
    var connectTimeout = _cometd.getConfiguration().connectTimeout;
    if (connectTimeout > 0) {
      connectTimer = this.setTimeout(function() {
        connectTimer = null;
        self._debug('Transport', self.getType(), 'timed out while connecting to URL', url, ':', connectTimeout, 'ms');
        var event = {
          code: 1000,
          reason: 'Connect Timeout'
        };
        self.webSocketClose(webSocket, event.code, event.reason);
        self.onClose(webSocket, event);
      }, connectTimeout);
    }
    var onopen = function() {
      self._debug('WebSocket opened', webSocket);
      _connecting = false;
      if (connectTimer) {
        self.clearTimeout(connectTimer);
        connectTimer = null;
      }
      if (_webSocket) {
        _cometd._warn('Closing Extra WebSocket Connections', webSocket, _webSocket);
        self.webSocketClose(webSocket, 1000, 'Extra Connection');
      } else {
        self.onOpen(webSocket);
      }
    };
    var onclose = function(event) {
      event = event || {
        code: 1000
      };
      self._debug('WebSocket closing', webSocket, event);
      _connecting = false;
      if (connectTimer) {
        self.clearTimeout(connectTimer);
        connectTimer = null;
      }
      if (_webSocket !== null && webSocket !== _webSocket) {
        self._debug('Closed Extra WebSocket Connection', webSocket);
      } else {
        self.onClose(webSocket, event);
      }
    };
    var onmessage = function(message) {
      self._debug('WebSocket message', message, webSocket);
      if (webSocket !== _webSocket) {
        _cometd._warn('Extra WebSocket Connections', webSocket, _webSocket);
      }
      self.onMessage(webSocket, message);
    };
    webSocket.onopen = onopen;
    webSocket.onclose = onclose;
    webSocket.onerror = function() {
      onclose({
        code: 1002,
        reason: 'Error'
      });
    };
    webSocket.onmessage = onmessage;
    this._debug('Transport', this.getType(), 'configured callbacks on', webSocket);
  }

  function _webSocketSend(webSocket, envelope, metaConnect) {
    var json = org.cometd.JSON.toJSON(envelope.messages);
    webSocket.send(json);
    this._debug('Transport', this.getType(), 'sent', envelope, 'metaConnect =', metaConnect);
    var maxDelay = this.getConfiguration().maxNetworkDelay;
    var delay = maxDelay;
    if (metaConnect) {
      delay += this.getAdvice().timeout;
      _connected = true;
    }
    var self = this;
    var messageIds = [];
    for (var i = 0; i < envelope.messages.length; ++i) {
      (function() {
        var message = envelope.messages[i];
        if (message.id) {
          messageIds.push(message.id);
          _timeouts[message.id] = this.setTimeout(function() {
            self._debug('Transport', self.getType(), 'timing out message', message.id, 'after', delay, 'on', webSocket);
            var event = {
              code: 1000,
              reason: 'Message Timeout'
            };
            self.webSocketClose(webSocket, event.code, event.reason);
            self.onClose(webSocket, event);
          }, delay);
        }
      })();
    }
    this._debug('Transport', this.getType(), 'waiting at most', delay, 'ms for messages', messageIds, 'maxNetworkDelay', maxDelay, ', timeouts:', _timeouts);
  }

  function _send(webSocket, envelope, metaConnect) {
    try {
      if (webSocket === null) {
        _websocketConnect.call(this);
      } else {
        _webSocketSend.call(this, webSocket, envelope, metaConnect);
      }
    } catch (x) {
      this.setTimeout(function() {
        envelope.onFailure(webSocket, envelope.messages, {
          exception: x
        });
      }, 0);
    }
  }
  _self.onOpen = function(webSocket) {
    this._debug('Transport', this.getType(), 'opened', webSocket);
    _webSocket = webSocket;
    _webSocketConnected = true;
    this._debug('Sending pending messages', _envelopes);
    for (var key in _envelopes) {
      var element = _envelopes[key];
      var envelope = element[0];
      var metaConnect = element[1];
      _successCallback = envelope.onSuccess;
      _webSocketSend.call(this, webSocket, envelope, metaConnect);
    }
  };
  _self.onMessage = function(webSocket, wsMessage) {
    this._debug('Transport', this.getType(), 'received websocket message', wsMessage, webSocket);
    var close = false;
    var messages = this.convertToMessages(wsMessage.data);
    var messageIds = [];
    for (var i = 0; i < messages.length; ++i) {
      var message = messages[i];
      if (/^\/meta\//.test(message.channel) || message.successful !== undefined) {
        if (message.id) {
          messageIds.push(message.id);
          var timeout = _timeouts[message.id];
          if (timeout) {
            this.clearTimeout(timeout);
            delete _timeouts[message.id];
            this._debug('Transport', this.getType(), 'removed timeout for message', message.id, ', timeouts', _timeouts);
          }
        }
      }
      if ('/meta/connect' === message.channel) {
        _connected = false;
      }
      if ('/meta/disconnect' === message.channel && !_connected) {
        close = true;
      }
    }
    var removed = false;
    for (var j = 0; j < messageIds.length; ++j) {
      var id = messageIds[j];
      for (var key in _envelopes) {
        var ids = key.split(',');
        var index = org.cometd.Utils.inArray(id, ids);
        if (index >= 0) {
          removed = true;
          ids.splice(index, 1);
          var envelope = _envelopes[key][0];
          var metaConnect = _envelopes[key][1];
          delete _envelopes[key];
          if (ids.length > 0) {
            _envelopes[ids.join(',')] = [envelope, metaConnect];
          }
          break;
        }
      }
    }
    if (removed) {
      this._debug('Transport', this.getType(), 'removed envelope, envelopes', _envelopes);
    }
    _successCallback.call(this, messages);
    if (close) {
      this.webSocketClose(webSocket, 1000, 'Disconnect');
    }
  };
  _self.onClose = function(webSocket, event) {
    this._debug('Transport', this.getType(), 'closed', webSocket, event);
    _webSocketSupported = _stickyReconnect && _webSocketConnected;
    for (var id in _timeouts) {
      this.clearTimeout(_timeouts[id]);
    }
    _timeouts = {};
    for (var key in _envelopes) {
      var envelope = _envelopes[key][0];
      var metaConnect = _envelopes[key][1];
      if (metaConnect) {
        _connected = false;
      }
      envelope.onFailure(webSocket, envelope.messages, {
        websocketCode: event.code,
        reason: event.reason
      });
    }
    _envelopes = {};
    _webSocket = null;
  };
  _self.registered = function(type, cometd) {
    _super.registered(type, cometd);
    _cometd = cometd;
  };
  _self.accept = function(version, crossDomain, url) {
    return _webSocketSupported && !!org.cometd.WebSocket && _cometd.websocketEnabled !== false;
  };
  _self.send = function(envelope, metaConnect) {
    this._debug('Transport', this.getType(), 'sending', envelope, 'metaConnect =', metaConnect);
    var messageIds = [];
    for (var i = 0; i < envelope.messages.length; ++i) {
      var message = envelope.messages[i];
      if (message.id) {
        messageIds.push(message.id);
      }
    }
    _envelopes[messageIds.join(',')] = [envelope, metaConnect];
    this._debug('Transport', this.getType(), 'stored envelope, envelopes', _envelopes);
    _send.call(this, _webSocket, envelope, metaConnect);
  };
  _self.webSocketClose = function(webSocket, code, reason) {
    try {
      webSocket.close(code, reason);
    } catch (x) {
      this._debug(x);
    }
  };
  _self.abort = function() {
    _super.abort();
    if (_webSocket) {
      var event = {
        code: 1001,
        reason: 'Abort'
      };
      this.webSocketClose(_webSocket, event.code, event.reason);
      this.onClose(_webSocket, event);
    }
    this.reset();
  };
  return _self;
};
org.cometd.Cometd = function(name) {
  var _cometd = this;
  var _name = name || 'default';
  var _crossDomain = false;
  var _transports = new org.cometd.TransportRegistry();
  var _transport;
  var _status = 'disconnected';
  var _messageId = 0;
  var _clientId = null;
  var _batch = 0;
  var _messageQueue = [];
  var _internalBatch = false;
  var _listeners = {};
  var _backoff = 0;
  var _scheduledSend = null;
  var _extensions = [];
  var _advice = {};
  var _handshakeProps;
  var _handshakeCallback;
  var _callbacks = {};
  var _reestablish = false;
  var _connected = false;
  var _config = {
    protocol: null,
    stickyReconnect: true,
    connectTimeout: 0,
    maxConnections: 2,
    backoffIncrement: 1000,
    maxBackoff: 60000,
    logLevel: 'info',
    reverseIncomingExtensions: true,
    maxNetworkDelay: 10000,
    requestHeaders: {},
    appendMessageTypeToURL: true,
    autoBatch: false,
    advice: {
      timeout: 60000,
      interval: 0,
      reconnect: 'retry'
    }
  };

  function _fieldValue(object, name) {
    try {
      return object[name];
    } catch (x) {
      return undefined;
    }
  }
  this._mixin = function(deep, target, objects) {
    var result = target || {};
    for (var i = 2; i < arguments.length; ++i) {
      var object = arguments[i];
      if (object === undefined || object === null) {
        continue;
      }
      for (var propName in object) {
        var prop = _fieldValue(object, propName);
        var targ = _fieldValue(result, propName);
        if (prop === target) {
          continue;
        }
        if (prop === undefined) {
          continue;
        }
        if (deep && typeof prop === 'object' && prop !== null) {
          if (prop instanceof Array) {
            result[propName] = this._mixin(deep, targ instanceof Array ? targ : [], prop);
          } else {
            var source = typeof targ === 'object' && !(targ instanceof Array) ? targ : {};
            result[propName] = this._mixin(deep, source, prop);
          }
        } else {
          result[propName] = prop;
        }
      }
    }
    return result;
  };

  function _isString(value) {
    return org.cometd.Utils.isString(value);
  }

  function _isFunction(value) {
    if (value === undefined || value === null) {
      return false;
    }
    return typeof value === 'function';
  }

  function _log(level, args) {
    if (window.console) {
      var logger = window.console[level];
      if (_isFunction(logger)) {
        logger.apply(window.console, args);
      }
    }
  }
  this._warn = function() {
    _log('warn', arguments);
  };
  this._info = function() {
    if (_config.logLevel !== 'warn') {
      _log('info', arguments);
    }
  };
  this._debug = function() {
    if (_config.logLevel === 'debug') {
      _log('debug', arguments);
    }
  };
  this._isCrossDomain = function(hostAndPort) {
    return hostAndPort && hostAndPort !== window.location.host;
  };

  function _configure(configuration) {
    _cometd._debug('Configuring cometd object with', configuration);
    if (_isString(configuration)) {
      configuration = {
        url: configuration
      };
    }
    if (!configuration) {
      configuration = {};
    }
    _config = _cometd._mixin(false, _config, configuration);
    var url = _cometd.getURL();
    if (!url) {
      throw 'Missing required configuration parameter \'url\' specifying the Bayeux server URL';
    }
    var urlParts = /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(url);
    var hostAndPort = urlParts[2];
    var uri = urlParts[8];
    var afterURI = urlParts[9];
    _crossDomain = _cometd._isCrossDomain(hostAndPort);
    if (_config.appendMessageTypeToURL) {
      if (afterURI !== undefined && afterURI.length > 0) {
        _cometd._info('Appending message type to URI ' + uri + afterURI + ' is not supported, disabling \'appendMessageTypeToURL\' configuration');
        _config.appendMessageTypeToURL = false;
      } else {
        var uriSegments = uri.split('/');
        var lastSegmentIndex = uriSegments.length - 1;
        if (uri.match(/\/$/)) {
          lastSegmentIndex -= 1;
        }
        if (uriSegments[lastSegmentIndex].indexOf('.') >= 0) {
          _cometd._info('Appending message type to URI ' + uri + ' is not supported, disabling \'appendMessageTypeToURL\' configuration');
          _config.appendMessageTypeToURL = false;
        }
      }
    }
  }

  function _removeListener(subscription) {
    if (subscription) {
      var subscriptions = _listeners[subscription.channel];
      if (subscriptions && subscriptions[subscription.id]) {
        delete subscriptions[subscription.id];
        _cometd._debug('Removed', subscription.listener ? 'listener' : 'subscription', subscription);
      }
    }
  }

  function _removeSubscription(subscription) {
    if (subscription && !subscription.listener) {
      _removeListener(subscription);
    }
  }

  function _clearSubscriptions() {
    for (var channel in _listeners) {
      var subscriptions = _listeners[channel];
      if (subscriptions) {
        for (var i = 0; i < subscriptions.length; ++i) {
          _removeSubscription(subscriptions[i]);
        }
      }
    }
  }

  function _setStatus(newStatus) {
    if (_status !== newStatus) {
      _cometd._debug('Status', _status, '->', newStatus);
      _status = newStatus;
    }
  }

  function _isDisconnected() {
    return _status === 'disconnecting' || _status === 'disconnected';
  }

  function _nextMessageId() {
    return ++_messageId;
  }

  function _applyExtension(scope, callback, name, message, outgoing) {
    try {
      return callback.call(scope, message);
    } catch (x) {
      _cometd._debug('Exception during execution of extension', name, x);
      var exceptionCallback = _cometd.onExtensionException;
      if (_isFunction(exceptionCallback)) {
        _cometd._debug('Invoking extension exception callback', name, x);
        try {
          exceptionCallback.call(_cometd, x, name, outgoing, message);
        } catch (xx) {
          _cometd._info('Exception during execution of exception callback in extension', name, xx);
        }
      }
      return message;
    }
  }

  function _applyIncomingExtensions(message) {
    for (var i = 0; i < _extensions.length; ++i) {
      if (message === undefined || message === null) {
        break;
      }
      var index = _config.reverseIncomingExtensions ? _extensions.length - 1 - i : i;
      var extension = _extensions[index];
      var callback = extension.extension.incoming;
      if (_isFunction(callback)) {
        var result = _applyExtension(extension.extension, callback, extension.name, message, false);
        message = result === undefined ? message : result;
      }
    }
    return message;
  }

  function _applyOutgoingExtensions(message) {
    for (var i = 0; i < _extensions.length; ++i) {
      if (message === undefined || message === null) {
        break;
      }
      var extension = _extensions[i];
      var callback = extension.extension.outgoing;
      if (_isFunction(callback)) {
        var result = _applyExtension(extension.extension, callback, extension.name, message, true);
        message = result === undefined ? message : result;
      }
    }
    return message;
  }

  function _notify(channel, message) {
    var subscriptions = _listeners[channel];
    if (subscriptions && subscriptions.length > 0) {
      for (var i = 0; i < subscriptions.length; ++i) {
        var subscription = subscriptions[i];
        if (subscription) {
          try {
            subscription.callback.call(subscription.scope, message);
          } catch (x) {
            _cometd._debug('Exception during notification', subscription, message, x);
            var listenerCallback = _cometd.onListenerException;
            if (_isFunction(listenerCallback)) {
              _cometd._debug('Invoking listener exception callback', subscription, x);
              try {
                listenerCallback.call(_cometd, x, subscription, subscription.listener, message);
              } catch (xx) {
                _cometd._info('Exception during execution of listener callback', subscription, xx);
              }
            }
          }
        }
      }
    }
  }

  function _notifyListeners(channel, message) {
    _notify(channel, message);
    var channelParts = channel.split('/');
    var last = channelParts.length - 1;
    for (var i = last; i > 0; --i) {
      var channelPart = channelParts.slice(0, i).join('/') + '/*';
      if (i === last) {
        _notify(channelPart, message);
      }
      channelPart += '*';
      _notify(channelPart, message);
    }
  }

  function _cancelDelayedSend() {
    if (_scheduledSend !== null) {
      org.cometd.Utils.clearTimeout(_scheduledSend);
    }
    _scheduledSend = null;
  }

  function _delayedSend(operation) {
    _cancelDelayedSend();
    var delay = _advice.interval + _backoff;
    _cometd._debug('Function scheduled in', delay, 'ms, interval =', _advice.interval, 'backoff =', _backoff, operation);
    _scheduledSend = org.cometd.Utils.setTimeout(_cometd, operation, delay);
  }
  var _handleMessages;
  var _handleFailure;

  function _send(sync, messages, longpoll, extraPath) {
    for (var i = 0; i < messages.length; ++i) {
      var message = messages[i];
      var messageId = '' + _nextMessageId();
      message.id = messageId;
      if (_clientId) {
        message.clientId = _clientId;
      }
      var callback = undefined;
      if (_isFunction(message._callback)) {
        callback = message._callback;
        delete message._callback;
      }
      message = _applyOutgoingExtensions(message);
      if (message !== undefined && message !== null) {
        message.id = messageId;
        messages[i] = message;
        if (callback) {
          _callbacks[messageId] = callback;
        }
      } else {
        messages.splice(i--, 1);
      }
    }
    if (messages.length === 0) {
      return;
    }
    var url = _cometd.getURL();
    if (_config.appendMessageTypeToURL) {
      if (!url.match(/\/$/)) {
        url = url + '/';
      }
      if (extraPath) {
        url = url + extraPath;
      }
    }
    var envelope = {
      url: url,
      sync: sync,
      messages: messages,
      onSuccess: function(rcvdMessages) {
        try {
          _handleMessages.call(_cometd, rcvdMessages);
        } catch (x) {
          _cometd._debug('Exception during handling of messages', x);
        }
      },
      onFailure: function(conduit, messages, failure) {
        try {
          failure.connectionType = _cometd.getTransport().getType();
          _handleFailure.call(_cometd, conduit, messages, failure);
        } catch (x) {
          _cometd._debug('Exception during handling of failure', x);
        }
      }
    };
    _cometd._debug('Send', envelope);
    _transport.send(envelope, longpoll);
  }

  function _queueSend(message) {
    if (_batch > 0 || _internalBatch === true) {
      _messageQueue.push(message);
    } else {
      _send(false, [message], false);
    }
  }
  this.send = _queueSend;

  function _resetBackoff() {
    _backoff = 0;
  }

  function _increaseBackoff() {
    if (_backoff < _config.maxBackoff) {
      _backoff += _config.backoffIncrement;
    }
  }

  function _startBatch() {
    ++_batch;
  }

  function _flushBatch() {
    var messages = _messageQueue;
    _messageQueue = [];
    if (messages.length > 0) {
      _send(false, messages, false);
    }
  }

  function _endBatch() {
    --_batch;
    if (_batch < 0) {
      throw 'Calls to startBatch() and endBatch() are not paired';
    }
    if (_batch === 0 && !_isDisconnected() && !_internalBatch) {
      _flushBatch();
    }
  }

  function _connect() {
    if (!_isDisconnected()) {
      var message = {
        channel: '/meta/connect',
        connectionType: _transport.getType()
      };
      if (!_connected) {
        message.advice = {
          timeout: 0
        };
      }
      _setStatus('connecting');
      _cometd._debug('Connect sent', message);
      _send(false, [message], true, 'connect');
      _setStatus('connected');
    }
  }

  function _delayedConnect() {
    _setStatus('connecting');
    _delayedSend(function() {
      _connect();
    });
  }

  function _updateAdvice(newAdvice) {
    if (newAdvice) {
      _advice = _cometd._mixin(false, {}, _config.advice, newAdvice);
      _cometd._debug('New advice', _advice);
    }
  }

  function _disconnect(abort) {
    _cancelDelayedSend();
    if (abort) {
      _transport.abort();
    }
    _clientId = null;
    _setStatus('disconnected');
    _batch = 0;
    _resetBackoff();
    _transport = null;
    if (_messageQueue.length > 0) {
      _handleFailure.call(_cometd, undefined, _messageQueue, {
        reason: 'Disconnected'
      });
      _messageQueue = [];
    }
  }

  function _notifyTransportFailure(oldTransport, newTransport, failure) {
    var callback = _cometd.onTransportFailure;
    if (_isFunction(callback)) {
      _cometd._debug('Invoking transport failure callback', oldTransport, newTransport, failure);
      try {
        callback.call(_cometd, oldTransport, newTransport, failure);
      } catch (x) {
        _cometd._info('Exception during execution of transport failure callback', x);
      }
    }
  }

  function _handshake(handshakeProps, handshakeCallback) {
    if (_isFunction(handshakeProps)) {
      handshakeCallback = handshakeProps;
      handshakeProps = undefined;
    }
    _clientId = null;
    _clearSubscriptions();
    if (_isDisconnected()) {
      _transports.reset();
      _updateAdvice(_config.advice);
    } else {
      _updateAdvice(_cometd._mixin(false, _advice, {
        reconnect: 'retry'
      }));
    }
    _batch = 0;
    _internalBatch = true;
    _handshakeProps = handshakeProps;
    _handshakeCallback = handshakeCallback;
    var version = '1.0';
    var url = _cometd.getURL();
    var transportTypes = _transports.findTransportTypes(version, _crossDomain, url);
    var bayeuxMessage = {
      version: version,
      minimumVersion: version,
      channel: '/meta/handshake',
      supportedConnectionTypes: transportTypes,
      _callback: handshakeCallback,
      advice: {
        timeout: _advice.timeout,
        interval: _advice.interval
      }
    };
    var message = _cometd._mixin(false, {}, _handshakeProps, bayeuxMessage);
    if (!_transport) {
      _transport = _transports.negotiateTransport(transportTypes, version, _crossDomain, url);
      if (!_transport) {
        var failure = 'Could not find initial transport among: ' + _transports.getTransportTypes();
        _cometd._warn(failure);
        throw failure;
      }
    }
    _cometd._debug('Initial transport is', _transport.getType());
    _setStatus('handshaking');
    _cometd._debug('Handshake sent', message);
    _send(false, [message], false, 'handshake');
  }

  function _delayedHandshake() {
    _setStatus('handshaking');
    _internalBatch = true;
    _delayedSend(function() {
      _handshake(_handshakeProps, _handshakeCallback);
    });
  }

  function _handleCallback(message) {
    var callback = _callbacks[message.id];
    if (_isFunction(callback)) {
      delete _callbacks[message.id];
      callback.call(_cometd, message);
    }
  }

  function _failHandshake(message) {
    _handleCallback(message);
    _notifyListeners('/meta/handshake', message);
    _notifyListeners('/meta/unsuccessful', message);
    var retry = !_isDisconnected() && _advice.reconnect !== 'none';
    if (retry) {
      _increaseBackoff();
      _delayedHandshake();
    } else {
      _disconnect(false);
    }
  }

  function _handshakeResponse(message) {
    if (message.successful) {
      _clientId = message.clientId;
      var url = _cometd.getURL();
      var newTransport = _transports.negotiateTransport(message.supportedConnectionTypes, message.version, _crossDomain, url);
      if (newTransport === null) {
        var failure = 'Could not negotiate transport with server; client=[' +
          _transports.findTransportTypes(message.version, _crossDomain, url) +
          '], server=[' + message.supportedConnectionTypes + ']';
        var oldTransport = _cometd.getTransport();
        _notifyTransportFailure(oldTransport.getType(), null, {
          reason: failure,
          connectionType: oldTransport.getType(),
          transport: oldTransport
        });
        _cometd._warn(failure);
        _transport.reset();
        _failHandshake(message);
        return;
      } else if (_transport !== newTransport) {
        _cometd._debug('Transport', _transport.getType(), '->', newTransport.getType());
        _transport = newTransport;
      }
      _internalBatch = false;
      _flushBatch();
      message.reestablish = _reestablish;
      _reestablish = true;
      _handleCallback(message);
      _notifyListeners('/meta/handshake', message);
      var action = _isDisconnected() ? 'none' : _advice.reconnect;
      switch (action) {
        case 'retry':
          _resetBackoff();
          _delayedConnect();
          break;
        case 'none':
          _disconnect(false);
          break;
        default:
          throw 'Unrecognized advice action ' + action;
      }
    } else {
      _failHandshake(message);
    }
  }

  function _handshakeFailure(message) {
    var version = '1.0';
    var url = _cometd.getURL();
    var oldTransport = _cometd.getTransport();
    var transportTypes = _transports.findTransportTypes(version, _crossDomain, url);
    var newTransport = _transports.negotiateTransport(transportTypes, version, _crossDomain, url);
    if (!newTransport) {
      _notifyTransportFailure(oldTransport.getType(), null, message.failure);
      _cometd._warn('Could not negotiate transport; client=[' + transportTypes + ']');
      _transport.reset();
      _failHandshake(message);
    } else {
      _cometd._debug('Transport', oldTransport.getType(), '->', newTransport.getType());
      _notifyTransportFailure(oldTransport.getType(), newTransport.getType(), message.failure);
      _failHandshake(message);
      _transport = newTransport;
    }
  }

  function _failConnect(message) {
    _notifyListeners('/meta/connect', message);
    _notifyListeners('/meta/unsuccessful', message);
    var action = _isDisconnected() ? 'none' : _advice.reconnect;
    switch (action) {
      case 'retry':
        _delayedConnect();
        _increaseBackoff();
        break;
      case 'handshake':
        _transports.reset();
        _resetBackoff();
        _delayedHandshake();
        break;
      case 'none':
        _disconnect(false);
        break;
      default:
        throw 'Unrecognized advice action' + action;
    }
  }

  function _connectResponse(message) {
    _connected = message.successful;
    if (_connected) {
      _notifyListeners('/meta/connect', message);
      var action = _isDisconnected() ? 'none' : _advice.reconnect;
      switch (action) {
        case 'retry':
          _resetBackoff();
          _delayedConnect();
          break;
        case 'none':
          _disconnect(false);
          break;
        default:
          throw 'Unrecognized advice action ' + action;
      }
    } else {
      _failConnect(message);
    }
  }

  function _connectFailure(message) {
    _connected = false;
    _failConnect(message);
  }

  function _failDisconnect(message) {
    _disconnect(true);
    _handleCallback(message);
    _notifyListeners('/meta/disconnect', message);
    _notifyListeners('/meta/unsuccessful', message);
  }

  function _disconnectResponse(message) {
    if (message.successful) {
      _disconnect(false);
      _handleCallback(message);
      _notifyListeners('/meta/disconnect', message);
    } else {
      _failDisconnect(message);
    }
  }

  function _disconnectFailure(message) {
    _failDisconnect(message);
  }

  function _failSubscribe(message) {
    var subscriptions = _listeners[message.subscription];
    if (subscriptions) {
      for (var i = subscriptions.length - 1; i >= 0; --i) {
        var subscription = subscriptions[i];
        if (subscription && !subscription.listener) {
          delete subscriptions[i];
          _cometd._debug('Removed failed subscription', subscription);
          break;
        }
      }
    }
    _handleCallback(message);
    _notifyListeners('/meta/subscribe', message);
    _notifyListeners('/meta/unsuccessful', message);
  }

  function _subscribeResponse(message) {
    if (message.successful) {
      _handleCallback(message);
      _notifyListeners('/meta/subscribe', message);
    } else {
      _failSubscribe(message);
    }
  }

  function _subscribeFailure(message) {
    _failSubscribe(message);
  }

  function _failUnsubscribe(message) {
    _handleCallback(message);
    _notifyListeners('/meta/unsubscribe', message);
    _notifyListeners('/meta/unsuccessful', message);
  }

  function _unsubscribeResponse(message) {
    if (message.successful) {
      _handleCallback(message);
      _notifyListeners('/meta/unsubscribe', message);
    } else {
      _failUnsubscribe(message);
    }
  }

  function _unsubscribeFailure(message) {
    _failUnsubscribe(message);
  }

  function _failMessage(message) {
    _handleCallback(message);
    _notifyListeners('/meta/publish', message);
    _notifyListeners('/meta/unsuccessful', message);
  }

  function _messageResponse(message) {
    if (message.successful === undefined) {
      if (message.data !== undefined) {
        _notifyListeners(message.channel, message);
      } else {
        _cometd._warn('Unknown Bayeux Message', message);
      }
    } else {
      if (message.successful) {
        _handleCallback(message);
        _notifyListeners('/meta/publish', message);
      } else {
        _failMessage(message);
      }
    }
  }

  function _messageFailure(failure) {
    _failMessage(failure);
  }

  function _receive(message) {
    message = _applyIncomingExtensions(message);
    if (message === undefined || message === null) {
      return;
    }
    _updateAdvice(message.advice);
    var channel = message.channel;
    switch (channel) {
      case '/meta/handshake':
        _handshakeResponse(message);
        break;
      case '/meta/connect':
        _connectResponse(message);
        break;
      case '/meta/disconnect':
        _disconnectResponse(message);
        break;
      case '/meta/subscribe':
        _subscribeResponse(message);
        break;
      case '/meta/unsubscribe':
        _unsubscribeResponse(message);
        break;
      default:
        _messageResponse(message);
        break;
    }
  }
  this.receive = _receive;
  _handleMessages = function(rcvdMessages) {
    _cometd._debug('Received', rcvdMessages);
    for (var i = 0; i < rcvdMessages.length; ++i) {
      var message = rcvdMessages[i];
      _receive(message);
    }
  };
  _handleFailure = function(conduit, messages, failure) {
    _cometd._debug('handleFailure', conduit, messages, failure);
    failure.transport = conduit;
    for (var i = 0; i < messages.length; ++i) {
      var message = messages[i];
      var failureMessage = {
        id: message.id,
        successful: false,
        channel: message.channel,
        failure: failure
      };
      failure.message = message;
      switch (message.channel) {
        case '/meta/handshake':
          _handshakeFailure(failureMessage);
          break;
        case '/meta/connect':
          _connectFailure(failureMessage);
          break;
        case '/meta/disconnect':
          _disconnectFailure(failureMessage);
          break;
        case '/meta/subscribe':
          failureMessage.subscription = message.subscription;
          _subscribeFailure(failureMessage);
          break;
        case '/meta/unsubscribe':
          failureMessage.subscription = message.subscription;
          _unsubscribeFailure(failureMessage);
          break;
        default:
          _messageFailure(failureMessage);
          break;
      }
    }
  };

  function _hasSubscriptions(channel) {
    var subscriptions = _listeners[channel];
    if (subscriptions) {
      for (var i = 0; i < subscriptions.length; ++i) {
        if (subscriptions[i]) {
          return true;
        }
      }
    }
    return false;
  }

  function _resolveScopedCallback(scope, callback) {
    var delegate = {
      scope: scope,
      method: callback
    };
    if (_isFunction(scope)) {
      delegate.scope = undefined;
      delegate.method = scope;
    } else {
      if (_isString(callback)) {
        if (!scope) {
          throw 'Invalid scope ' + scope;
        }
        delegate.method = scope[callback];
        if (!_isFunction(delegate.method)) {
          throw 'Invalid callback ' + callback + ' for scope ' + scope;
        }
      } else if (!_isFunction(callback)) {
        throw 'Invalid callback ' + callback;
      }
    }
    return delegate;
  }

  function _addListener(channel, scope, callback, isListener) {
    var delegate = _resolveScopedCallback(scope, callback);
    _cometd._debug('Adding', isListener ? 'listener' : 'subscription', 'on', channel, 'with scope', delegate.scope, 'and callback', delegate.method);
    var subscription = {
      channel: channel,
      scope: delegate.scope,
      callback: delegate.method,
      listener: isListener
    };
    var subscriptions = _listeners[channel];
    if (!subscriptions) {
      subscriptions = [];
      _listeners[channel] = subscriptions;
    }
    subscription.id = subscriptions.push(subscription) - 1;
    _cometd._debug('Added', isListener ? 'listener' : 'subscription', subscription);
    subscription[0] = channel;
    subscription[1] = subscription.id;
    return subscription;
  }
  this.registerTransport = function(type, transport, index) {
    var result = _transports.add(type, transport, index);
    if (result) {
      this._debug('Registered transport', type);
      if (_isFunction(transport.registered)) {
        transport.registered(type, this);
      }
    }
    return result;
  };
  this.getTransportTypes = function() {
    return _transports.getTransportTypes();
  };
  this.unregisterTransport = function(type) {
    var transport = _transports.remove(type);
    if (transport !== null) {
      this._debug('Unregistered transport', type);
      if (_isFunction(transport.unregistered)) {
        transport.unregistered();
      }
    }
    return transport;
  };
  this.unregisterTransports = function() {
    _transports.clear();
  };
  this.findTransport = function(name) {
    return _transports.find(name);
  };
  this.configure = function(configuration) {
    _configure.call(this, configuration);
  };
  this.init = function(configuration, handshakeProps) {
    this.configure(configuration);
    this.handshake(handshakeProps);
  };
  this.handshake = function(handshakeProps, handshakeCallback) {
    _setStatus('disconnected');
    _reestablish = false;
    _handshake(handshakeProps, handshakeCallback);
  };
  this.disconnect = function(sync, disconnectProps, disconnectCallback) {
    if (_isDisconnected()) {
      return;
    }
    if (typeof sync !== 'boolean') {
      disconnectCallback = disconnectProps;
      disconnectProps = sync;
      sync = false;
    }
    if (_isFunction(disconnectProps)) {
      disconnectCallback = disconnectProps;
      disconnectProps = undefined;
    }
    var bayeuxMessage = {
      channel: '/meta/disconnect',
      _callback: disconnectCallback
    };
    var message = this._mixin(false, {}, disconnectProps, bayeuxMessage);
    _setStatus('disconnecting');
    _send(sync === true, [message], false, 'disconnect');
  };
  this.startBatch = function() {
    _startBatch();
  };
  this.endBatch = function() {
    _endBatch();
  };
  this.batch = function(scope, callback) {
    var delegate = _resolveScopedCallback(scope, callback);
    this.startBatch();
    try {
      delegate.method.call(delegate.scope);
      this.endBatch();
    } catch (x) {
      this._info('Exception during execution of batch', x);
      this.endBatch();
      throw x;
    }
  };
  this.addListener = function(channel, scope, callback) {
    if (arguments.length < 2) {
      throw 'Illegal arguments number: required 2, got ' + arguments.length;
    }
    if (!_isString(channel)) {
      throw 'Illegal argument type: channel must be a string';
    }
    return _addListener(channel, scope, callback, true);
  };
  this.removeListener = function(subscription) {
    if (!subscription || !subscription.channel || !("id" in subscription)) {
      throw 'Invalid argument: expected subscription, not ' + subscription;
    }
    _removeListener(subscription);
  };
  this.clearListeners = function() {
    _listeners = {};
  };
  this.subscribe = function(channel, scope, callback, subscribeProps, subscribeCallback) {
    if (arguments.length < 2) {
      throw 'Illegal arguments number: required 2, got ' + arguments.length;
    }
    if (!_isString(channel)) {
      throw 'Illegal argument type: channel must be a string';
    }
    if (_isDisconnected()) {
      throw 'Illegal state: already disconnected';
    }
    if (_isFunction(scope)) {
      subscribeCallback = subscribeProps;
      subscribeProps = callback;
      callback = scope;
      scope = undefined;
    }
    if (_isFunction(subscribeProps)) {
      subscribeCallback = subscribeProps;
      subscribeProps = undefined;
    }
    var send = !_hasSubscriptions(channel);
    var subscription = _addListener(channel, scope, callback, false);
    if (send) {
      var bayeuxMessage = {
        channel: '/meta/subscribe',
        subscription: channel,
        _callback: subscribeCallback
      };
      var message = this._mixin(false, {}, subscribeProps, bayeuxMessage);
      _queueSend(message);
    }
    return subscription;
  };
  this.unsubscribe = function(subscription, unsubscribeProps, unsubscribeCallback) {
    if (arguments.length < 1) {
      throw 'Illegal arguments number: required 1, got ' + arguments.length;
    }
    if (_isDisconnected()) {
      throw 'Illegal state: already disconnected';
    }
    if (_isFunction(unsubscribeProps)) {
      unsubscribeCallback = unsubscribeProps;
      unsubscribeProps = undefined;
    }
    this.removeListener(subscription);
    var channel = subscription.channel;
    if (!_hasSubscriptions(channel)) {
      var bayeuxMessage = {
        channel: '/meta/unsubscribe',
        subscription: channel,
        _callback: unsubscribeCallback
      };
      var message = this._mixin(false, {}, unsubscribeProps, bayeuxMessage);
      _queueSend(message);
    }
  };
  this.resubscribe = function(subscription, subscribeProps) {
    _removeSubscription(subscription);
    if (subscription) {
      return this.subscribe(subscription.channel, subscription.scope, subscription.callback, subscribeProps);
    }
    return undefined;
  };
  this.clearSubscriptions = function() {
    _clearSubscriptions();
  };
  this.publish = function(channel, content, publishProps, publishCallback) {
    if (arguments.length < 1) {
      throw 'Illegal arguments number: required 1, got ' + arguments.length;
    }
    if (!_isString(channel)) {
      throw 'Illegal argument type: channel must be a string';
    }
    if (/^\/meta\//.test(channel)) {
      throw 'Illegal argument: cannot publish to meta channels';
    }
    if (_isDisconnected()) {
      throw 'Illegal state: already disconnected';
    }
    if (_isFunction(content)) {
      publishCallback = content;
      content = publishProps = {};
    } else if (_isFunction(publishProps)) {
      publishCallback = publishProps;
      publishProps = {};
    }
    var bayeuxMessage = {
      channel: channel,
      data: content,
      _callback: publishCallback
    };
    var message = this._mixin(false, {}, publishProps, bayeuxMessage);
    _queueSend(message);
  };
  this.getStatus = function() {
    return _status;
  };
  this.isDisconnected = _isDisconnected;
  this.setBackoffIncrement = function(period) {
    _config.backoffIncrement = period;
  };
  this.getBackoffIncrement = function() {
    return _config.backoffIncrement;
  };
  this.getBackoffPeriod = function() {
    return _backoff;
  };
  this.setLogLevel = function(level) {
    _config.logLevel = level;
  };
  this.registerExtension = function(name, extension) {
    if (arguments.length < 2) {
      throw 'Illegal arguments number: required 2, got ' + arguments.length;
    }
    if (!_isString(name)) {
      throw 'Illegal argument type: extension name must be a string';
    }
    var existing = false;
    for (var i = 0; i < _extensions.length; ++i) {
      var existingExtension = _extensions[i];
      if (existingExtension.name === name) {
        existing = true;
        break;
      }
    }
    if (!existing) {
      _extensions.push({
        name: name,
        extension: extension
      });
      this._debug('Registered extension', name);
      if (_isFunction(extension.registered)) {
        extension.registered(name, this);
      }
      return true;
    } else {
      this._info('Could not register extension with name', name, 'since another extension with the same name already exists');
      return false;
    }
  };
  this.unregisterExtension = function(name) {
    if (!_isString(name)) {
      throw 'Illegal argument type: extension name must be a string';
    }
    var unregistered = false;
    for (var i = 0; i < _extensions.length; ++i) {
      var extension = _extensions[i];
      if (extension.name === name) {
        _extensions.splice(i, 1);
        unregistered = true;
        this._debug('Unregistered extension', name);
        var ext = extension.extension;
        if (_isFunction(ext.unregistered)) {
          ext.unregistered();
        }
        break;
      }
    }
    return unregistered;
  };
  this.getExtension = function(name) {
    for (var i = 0; i < _extensions.length; ++i) {
      var extension = _extensions[i];
      if (extension.name === name) {
        return extension.extension;
      }
    }
    return null;
  };
  this.getName = function() {
    return _name;
  };
  this.getClientId = function() {
    return _clientId;
  };
  this.getURL = function() {
    if (_transport && typeof _config.urls === 'object') {
      var url = _config.urls[_transport.getType()];
      if (url) {
        return url;
      }
    }
    return _config.url;
  };
  this.getTransport = function() {
    return _transport;
  };
  this.getConfiguration = function() {
    return this._mixin(true, {}, _config);
  };
  this.getAdvice = function() {
    return this._mixin(true, {}, _advice);
  };
  org.cometd.WebSocket = window.WebSocket;
  if (!org.cometd.WebSocket) {
    org.cometd.WebSocket = window.MozWebSocket;
  }
};
if (typeof define === 'function' && define.amd) {
  define(function() {
    return org.cometd;
  });
};
/*! RESOURCE: /scripts/thirdparty/cometd/jquery/jquery.cometd.js */
(function() {
  function bind($, org_cometd) {
    org_cometd.JSON.toJSON = (window.JSON && JSON.stringify) || (window.jaredJSON && window.jaredJSON.stringify);
    org_cometd.JSON.fromJSON = (window.JSON && JSON.parse) || (window.jaredJSON && window.jaredJSON.parse);

    function _setHeaders(xhr, headers) {
      if (headers) {
        for (var headerName in headers) {
          if (headerName.toLowerCase() === 'content-type') {
            continue;
          }
          xhr.setRequestHeader(headerName, headers[headerName]);
        }
      }
    }

    function LongPollingTransport() {
      var _super = new org_cometd.LongPollingTransport();
      var that = org_cometd.Transport.derive(_super);
      that.xhrSend = function(packet) {
        return $.ajax({
          url: packet.url,
          async: packet.sync !== true,
          type: 'POST',
          contentType: 'application/json;charset=UTF-8',
          data: packet.body,
          xhrFields: {
            withCredentials: true
          },
          beforeSend: function(xhr) {
            _setHeaders(xhr, packet.headers);
            return true;
          },
          success: packet.onSuccess,
          error: function(xhr, reason, exception) {
            packet.onError(reason, exception);
          }
        });
      };
      return that;
    }

    function CallbackPollingTransport() {
      var _super = new org_cometd.CallbackPollingTransport();
      var that = org_cometd.Transport.derive(_super);
      that.jsonpSend = function(packet) {
        $.ajax({
          url: packet.url,
          async: packet.sync !== true,
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'jsonp',
          data: {
            message: packet.body
          },
          beforeSend: function(xhr) {
            _setHeaders(xhr, packet.headers);
            return true;
          },
          success: packet.onSuccess,
          error: function(xhr, reason, exception) {
            packet.onError(reason, exception);
          }
        });
      };
      return that;
    }
    $.Cometd = function(name) {
      var cometd = new org_cometd.Cometd(name);
      if (org_cometd.WebSocket) {
        cometd.registerTransport('websocket', new org_cometd.WebSocketTransport());
      }
      cometd.registerTransport('long-polling', new LongPollingTransport());
      cometd.registerTransport('callback-polling', new CallbackPollingTransport());
      return cometd;
    };
    $.cometd = new $.Cometd();
    return $.cometd;
  }
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'org/cometd'], bind);
  } else {
    bind(window.jQuery1110 || window.Zepto, org.cometd);
  }
})();;
/*! RESOURCE: /scripts/amb_properties.js */
var amb = amb || {
  properties: {
    servletURI: 'amb/',
    logLevel: 'info',
    loginWindow: 'true'
  }
};;
/*! RESOURCE: /scripts/amb.Logger.js */
amb['Logger'] = function(callerType) {
  var _debugEnabled = amb['properties']['logLevel'] == 'debug';

  function print(message) {
    console.log(callerType + ' ' + message);
  }
  return {
    debug: function(message) {
      if (_debugEnabled)
        print('[DEBUG] ' + message);
    },
    addInfoMessage: function(message) {
      print('[INFO] ' + message);
    },
    addErrorMessage: function(message) {
      print('[ERROR] ' + message);
    }
  }
};;
/*! RESOURCE: /scripts/amb.EventManager.js */
amb.EventManager = function EventManager(events) {
  var _subscriptions = [];
  var _idCounter = 0;

  function _getSubscriptions(event) {
    var subscriptions = [];
    for (var i = 0; i < _subscriptions.length; i++) {
      if (_subscriptions[i].event == event)
        subscriptions.push(_subscriptions[i]);
    }
    return subscriptions;
  }
  return {
    subscribe: function(event, callback) {
      var id = _idCounter++;
      _subscriptions.push({
        event: event,
        callback: callback,
        id: id
      });
      return id;
    },
    unsubscribe: function(id) {
      for (var i = 0; i < _subscriptions.length; i++)
        if (id == _subscriptions[i].id)
          _subscriptions.splice(i, 1);
    },
    publish: function(event, args) {
      var subscriptions = _getSubscriptions(event);
      for (var i = 0; i < subscriptions.length; i++)
        subscriptions[i].callback.apply(null, args);
    },
    getEvents: function() {
      return events;
    }
  }
};;
/*! RESOURCE: /scripts/amb.ServerConnection.js */
amb.ServerConnection = function ServerConnection(cometd) {
  var connected = false;
  var disconnecting = false;
  var eventManager = new amb.EventManager({
    CONNECTION_INITIALIZED: 'connection.initialized',
    CONNECTION_OPENED: 'connection.opened',
    CONNECTION_CLOSED: 'connection.closed',
    CONNECTION_BROKEN: 'connection.broken',
    SESSION_LOGGED_IN: 'session.logged.in',
    SESSION_LOGGED_OUT: 'session.logged.out'
  });
  var state = "closed";
  var LOGGER = new amb.Logger('amb.ServerConnection');
  _initializeMetaChannelListeners();
  var loggedIn = true;
  var loginWindow = null;
  var loginWindowEnabled = amb.properties['loginWindow'] === 'true';
  var lastError = null;
  var errorMessages = {
    'UNKNOWN_CLIENT': '402::Unknown client'
  };
  var loginWindowOverride = false;
  var ambServerConnection = {};
  ambServerConnection.connect = function() {
    if (connected) {
      console.log(">>> connection exists, request satisfied");
      return;
    }
    LOGGER.debug('Connecting to glide amb server -> ' + amb['properties']['servletURI']);
    LOGGER.debug('Connecting to glide amb server -> ' + amb['properties']['servletURI']);
    cometd.configure({
      url: _getRelativePath(amb['properties']['servletURI']),
      logLevel: amb['properties']['logLevel']
    });
    cometd.handshake();
  };
  ambServerConnection.reload = function() {
    cometd.reload();
  };
  ambServerConnection.abort = function() {
    cometd.getTransport().abort();
  };
  ambServerConnection.disconnect = function() {
    LOGGER.debug('Disconnecting from glide amb server..');
    disconnecting = true;
    cometd.disconnect();
  };

  function _initializeMetaChannelListeners() {
    cometd.addListener('/meta/handshake', this, _metaHandshake);
    cometd.addListener('/meta/connect', this, _metaConnect);
  }

  function _metaHandshake(message) {
    setTimeout(function() {
      if (message['successful'])
        _connectionInitialized();
    }, 0);
  }

  function _metaConnect(message) {
    if (disconnecting) {
      setTimeout(function() {
        connected = false;
        _connectionClosed();
      }, 0);
      return;
    }
    var error = message['error'];
    if (error)
      lastError = error;
    _sessionStatus(message);
    var wasConnected = connected;
    connected = (message['successful'] === true);
    if (!wasConnected && connected)
      _connectionOpened();
    else if (wasConnected && !connected)
      _connectionBroken();
  }

  function _connectionInitialized() {
    LOGGER.debug('Connection initialized');
    state = "initialized";
    eventManager.publish(eventManager.getEvents().CONNECTION_INITIALIZED);
  }

  function _connectionOpened() {
    LOGGER.debug('Connection opened');
    state = "opened";
    eventManager.publish(eventManager.getEvents().CONNECTION_OPENED);
  }

  function _connectionClosed() {
    LOGGER.debug('Connection closed');
    state = "closed";
    eventManager.publish(eventManager.getEvents().CONNECTION_CLOSED);
  }

  function _connectionBroken() {
    LOGGER.addErrorMessage('Connection broken');
    state = "broken";
    eventManager.publish(eventManager.getEvents().CONNECTION_BROKEN);
  }

  function _sessionStatus(message) {
    var ext = message['ext'];
    if (ext) {
      var sessionStatus = ext['glide.session.status'];
      loginWindowOverride = ext['glide.amb.login.window.override'] === true;
      LOGGER.debug('session.status - ' + sessionStatus);
      switch (sessionStatus) {
        case 'session.logged.out':
          if (loggedIn)
            _logout();
          break;
        case 'session.logged.in':
          if (!loggedIn)
            _login();
          break;
        default:
          LOGGER.debug("unknown session status - " + sessionStatus);
          break;
      }
    }
  }

  function _login() {
    loggedIn = true;
    LOGGER.debug("LOGGED_IN event fire!");
    eventManager.publish(eventManager.getEvents().SESSION_LOGGED_IN);
    ambServerConnection.loginHide();
  }

  function _logout() {
    loggedIn = false;
    LOGGER.debug("LOGGED_OUT event fire!");
    eventManager.publish(eventManager.getEvents().SESSION_LOGGED_OUT);
    ambServerConnection.loginShow();
  }
  var modalContent = '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>';
  var modalTemplate = '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
    '  <div class="modal-dialog small-modal" style="width:450px">' +
    '     <div class="modal-content">' +
    '        <header class="modal-header">' +
    '           <h4 id="small_modal1_title" class="modal-title">Login</h4>' +
    '        </header>' +
    '        <div class="modal-body">' +
    '        </div>' +
    '     </div>' +
    '  </div>' +
    '</div>';

  function _loginShow() {
    if (!loginWindowEnabled || loginWindowOverride)
      return;
    var dialog = new GlideModal('amb_disconnect_modal');
    if (dialog['renderWithContent']) {
      dialog.template = modalTemplate;
      dialog.renderWithContent(modalContent);
    } else {
      dialog.setBody(modalContent);
      dialog.render();
    }
    loginWindow = dialog;
  }

  function _loginHide() {
    if (!loginWindow)
      return;
    loginWindow.destroy();
    loginWindow = null;
  }

  function loginComplete() {
    _login();
  }

  function _getRelativePath(uri) {
    var relativePath = "";
    for (var i = 0; i < window.location.pathname.match(/\//g).length - 1; i++) {
      relativePath = "../" + relativePath;
    }
    return relativePath + uri;
  }
  ambServerConnection.loginShow = function() {
    _loginShow();
  };
  ambServerConnection.loginHide = function() {
    _loginHide();
  };
  ambServerConnection.getEvents = function() {
    return eventManager.getEvents();
  };
  ambServerConnection.getConnectionState = function() {
    return state;
  };
  ambServerConnection.getLastError = function() {
    return lastError;
  };
  ambServerConnection.setLastError = function(error) {
    lastError = error;
  };
  ambServerConnection.getErrorMessages = function() {
    return errorMessages;
  };
  ambServerConnection.isLoggedIn = function() {
    return loggedIn;
  };
  ambServerConnection.loginShow = function() {
    _loginShow();
  };
  ambServerConnection.loginHide = function() {
    _loginHide();
  };
  ambServerConnection.loginComplete = function() {
    _login();
  };
  ambServerConnection.getEvents = function() {
    return eventManager.getEvents();
  };
  ambServerConnection.subscribeToEvent = function(event, callback) {
    if (eventManager.getEvents().CONNECTION_OPENED == event && connected)
      callback();
    return eventManager.subscribe(event, callback);
  };
  ambServerConnection.unsubscribeFromEvent = function(id) {
    eventManager.unsubscribe(id);
  };
  ambServerConnection.getConnectionState = function() {
    return state;
  };
  ambServerConnection.isLoggedIn = function() {
    return loggedIn;
  };
  ambServerConnection.loginShow = function() {
    _loginShow();
  };
  ambServerConnection.loginHide = function() {
    _loginHide();
  };
  ambServerConnection.loginComplete = function() {
    _login();
  };
  ambServerConnection.isLoginWindowEnabled = function() {
    return loginWindowEnabled;
  };
  ambServerConnection.isLoginWindowOverride = function() {
    return loginWindowOverride;
  }
  return ambServerConnection;
};;
/*! RESOURCE: /scripts/amb.ChannelRedirect.js */
amb.ChannelRedirect = function ChannelRedirect(cometd, serverConnection,
  channelProvider) {
  var initialized = false;
  var _cometd = cometd;
  var eventManager = new amb.EventManager({
    CHANNEL_REDIRECT: 'channel.redirect'
  });
  var LOGGER = new amb.Logger('amb.ChannelRedirect');

  function _onAdvice(advice) {
    LOGGER.debug('_onAdvice:' + advice.data.clientId);
    var fromChannel = channelProvider(advice.data.fromChannel);
    var toChannel = channelProvider(advice.data.toChannel);
    eventManager.publish(eventManager.getEvents().CHANNEL_REDIRECT, [fromChannel, toChannel]);
    LOGGER.debug(
      'published channel switch event, fromChannel:' + fromChannel.getName() +
      ', toChannel:' + toChannel.getName());
  }
  return {
    subscribeToEvent: function(event, callback) {
      return eventManager.subscribe(event, callback);
    },
    unsubscribeToEvent: function(id) {
      eventManager.unsubscribe(id);
    },
    getEvents: function() {
      return eventManager.getEvents();
    },
    initialize: function() {
      if (!initialized) {
        var channelName = '/sn/meta/channel_redirect/' + _cometd.getClientId();
        var metaChannel = channelProvider(channelName);
        metaChannel.newListener(serverConnection, null).subscribe(_onAdvice);
        LOGGER.debug("ChannelRedirect initialized: " + channelName);
        initialized = true;
      }
    }
  }
};;
/*! RESOURCE: /scripts/amb.ChannelListener.js */
amb.ChannelListener = function ChannelListener(channel, serverConnection,
  channelRedirect) {
  var id;
  var subscriberCallback;
  var LOGGER = new amb.Logger('amb.ChannelListener');
  var channelRedirectId = null;
  var connectOpenedEventId;
  var currentChannel = channel;
  return {
    getCallback: function() {
      return subscriberCallback;
    },
    getID: function() {
      return id;
    },
    subscribe: function(callback) {
      subscriberCallback = callback;
      if (channelRedirect)
        channelRedirectId = channelRedirect.subscribeToEvent(
          channelRedirect.getEvents().CHANNEL_REDIRECT, this._switchToChannel.bind(this));
      connectOpenedEventId = serverConnection.subscribeToEvent(serverConnection.getEvents().CONNECTION_OPENED,
        this._subscribeWhenReady.bind(this));
      LOGGER.debug("Subscribed from channel: " + currentChannel.getName());
      return this;
    },
    resubscribe: function() {
      return this.subscribe(subscriberCallback);
    },
    _switchToChannel: function(fromChannel, toChannel) {
      if (!fromChannel || !toChannel)
        return;
      if (fromChannel.getName() != currentChannel.getName())
        return;
      this.unsubscribe();
      currentChannel = toChannel;
      this.subscribe(subscriberCallback);
    },
    _subscribeWhenReady: function() {
      LOGGER.debug("Subscribing to '" + currentChannel.getName() + "'...");
      id = currentChannel.subscribe(this);
    },
    unsubscribe: function() {
      channelRedirect.unsubscribeToEvent(channelRedirectId);
      currentChannel.unsubscribe(this);
      serverConnection.unsubscribeFromEvent(connectOpenedEventId);
      LOGGER.debug("Unsubscribed from channel: " + currentChannel.getName());
      return this;
    },
    publish: function(message) {
      currentChannel.publish(message);
    },
    getName: function() {
      return currentChannel.getName();
    }
  }
};;
/*! RESOURCE: /scripts/amb.Channel.js */
amb.Channel = function Channel(cometd, channelName, initialized) {
  var subscription = null;
  var listeners = [];
  var LOGGER = new amb.Logger('amb.Channel');
  var idCounter = 0;
  var _initialized = initialized;

  function _disconnected() {
    var status = cometd.getStatus();
    return status === 'disconnecting' || status === 'disconnected';
  }
  return {
    newListener: function(serverConnection,
      channelRedirect) {
      return new amb.ChannelListener(this, serverConnection, channelRedirect);
    },
    subscribe: function(listener) {
      if (!listener.getCallback()) {
        LOGGER.addErrorMessage('Cannot subscribe to channel: ' + channelName +
          ', callback not provided');
        return;
      }
      if (!subscription && _initialized) {
        subscription = cometd.subscribe(channelName, this._handleResponse.bind(this));
        LOGGER.debug('Successfully subscribed to channel: ' + channelName);
      }
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] === listener) {
          LOGGER.debug('Channel listener already in the list');
          return listener.getID();
        }
      }
      var id = idCounter++;
      listeners.push(listener);
      return id;
    },
    subscribeOnInitCompletion: function(redirect) {
      _initialized = true;
      subscription = null;
      for (var i = 0; i < listeners.length; i++) {
        listeners[i].subscribe();
        LOGGER.debug('Successfully subscribed to channel: ' + channelName);
      }
    },
    resubscribe: function() {
      subscription = null;
      for (var i = 0; i < listeners.length; i++)
        listeners[i].resubscribe();
    },
    _handleResponse: function(message) {
      for (var i = 0; i < listeners.length; i++)
        listeners[i].getCallback()(message);
    },
    unsubscribe: function(listener) {
      if (!listener) {
        LOGGER.addErrorMessage('Cannot unsubscribe from channel: ' + channelName +
          ', listener argument does not exist');
        return;
      }
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i].getID() == listener.getID())
          listeners.splice(i, 1);
      }
      if (listeners.length < 1 && subscription && !_disconnected()) {
        cometd.unsubscribe(subscription);
        subscription = null;
      }
      LOGGER.debug('Successfully unsubscribed from channel: ' + channelName);
    },
    publish: function(message) {
      cometd.publish(channelName, message);
    },
    getName: function() {
      return channelName;
    }
  }
};;
/*! RESOURCE: /scripts/amb.MessageClient.js */
(function($) {
  amb.MessageClient = function MessageClient() {
    var cometd = new $.Cometd();
    cometd.unregisterTransport('websocket');
    cometd.unregisterTransport('callback-polling');
    var serverConnection = new amb.ServerConnection(cometd);
    var channels = {};
    var LOGGER = new amb.Logger('amb.MessageClient');
    var channelRedirect = null;
    var connected = false;
    var initialized = false;
    var uninitializedChannels = [];
    serverConnection.subscribeToEvent(serverConnection.getEvents().CONNECTION_BROKEN, _connectionBroken);
    serverConnection.subscribeToEvent(serverConnection.getEvents().CONNECTION_OPENED, _connectionOpened);
    serverConnection.subscribeToEvent(serverConnection.getEvents().CONNECTION_INITIALIZED, _connectionInitialized);
    var _connectionBrokenEvent = false;

    function _connectionBroken() {
      LOGGER.debug("connection broken!");
      _connectionBrokenEvent = true;
    }

    function _connectionInitialized() {
      initialized = true;
      _initChannelRedirect();
      channelRedirect.initialize();
      LOGGER.debug("Connection initialized. Initializing " + uninitializedChannels.length + " channels.");
      for (var i = 0; i < uninitializedChannels.length; i++) {
        uninitializedChannels[i].subscribeOnInitCompletion();
      }
      uninitializedChannels = [];
    }

    function _connectionOpened() {
      if (_connectionBrokenEvent) {
        LOGGER.debug("connection opened!");
        _connectionBrokenEvent = false;
        var sc = serverConnection;
        if (sc.getLastError() !== sc.getErrorMessages().UNKNOWN_CLIENT)
          return;
        sc.setLastError(null);
        LOGGER.debug("channel resubscribe!");
        $.ajax({
          url: "/amb_session_setup.do",
          method: "GET",
          contentType: "application/json;charset=UTF-8",
          data: "",
          dataType: "HTML",
          headers: {
            'X-UserToken': window.g_ck
          }
        }).done(function() {
          for (var name in channels) {
            var channel = channels[name];
            channel.resubscribe();
          }
        });
      }
    }

    function _initChannelRedirect() {
      if (channelRedirect)
        return;
      channelRedirect = new amb.ChannelRedirect(cometd, serverConnection, _getChannel);
    }

    function _getChannel(channelName) {
      if (channelName in channels)
        return channels[channelName];
      var channel = new amb.Channel(cometd, channelName, initialized);
      channels[channelName] = channel;
      if (!initialized)
        uninitializedChannels.push(channel);
      return channel;
    }
    return {
      getServerConnection: function() {
        return serverConnection;
      },
      isLoggedIn: function() {
        return serverConnection.isLoggedIn();
      },
      loginComplete: function() {
        serverConnection.loginComplete();
      },
      connect: function() {
        if (connected) {
          LOGGER.addInfoMessage(">>> connection exists, request satisfied");
          return;
        }
        connected = true;
        serverConnection.connect();
      },
      reload: function() {
        connected = false;
        serverConnection.reload();
      },
      abort: function() {
        connected = false;
        serverConnection.abort();
      },
      disconnect: function() {
        connected = false;
        serverConnection.disconnect();
      },
      getConnectionEvents: function() {
        return serverConnection.getEvents();
      },
      subscribeToEvent: function(event, callback) {
        return serverConnection.subscribeToEvent(event, callback);
      },
      unsubscribeFromEvent: function(id) {
        serverConnection.unsubscribeFromEvent(id);
      },
      getConnectionState: function() {
        return serverConnection.getConnectionState();
      },
      getClientId: function() {
        return cometd.getClientId();
      },
      getChannel: function(channelName) {
        _initChannelRedirect();
        var channel = _getChannel(channelName);
        return channel.newListener(serverConnection, channelRedirect);
      },
      registerExtension: function(extensionName, extension) {
        cometd.registerExtension(extensionName, extension);
      },
      unregisterExtension: function(extensionName) {
        cometd.unregisterExtension(extensionName);
      },
      batch: function(block) {
        cometd.batch(block);
      }
    }
  };
})(jQuery1110);;
/*! RESOURCE: /scripts/amb.MessageClientBuilder.js */
(function($) {
  amb.getClient = function() {
    return getClient();
  }

  function getClient() {
    var _window = window.self;
    try {
      if (!(window.MSInputMethodContext && document.documentMode)) {
        while (_window != _window.parent) {
          if (_window.g_ambClient)
            break;
          _window = _window.parent;
        }
      }
      if (_window.g_ambClient)
        return _window.g_ambClient;
    } catch (e) {
      console.log("AMB getClient() tried to access parent from an iFrame. Caught error: " + e);
    }
    var client = buildClient();
    setClient(client);
    return client;
  }

  function setClient(client) {
    var _window = window.self;
    _window.g_ambClient = client;
    $(_window).unload(function() {
      _window.g_ambClient.disconnect();
    });
    _window.g_ambClient.connect();
  }

  function buildClient() {
    return (function() {
      var ambClient = new amb.MessageClient();
      return {
        getServerConnection: function() {
          return ambClient.getServerConnection();
        },
        connect: function() {
          ambClient.connect();
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
        getState: function() {
          return ambClient.getConnectionState();
        },
        getClientId: function() {
          return ambClient.getClientId();
        },
        getChannel: function(channelName) {
          var channel = ambClient.getChannel(channelName);
          var originalSubscribe = channel.subscribe;
          var originalUnsubscribe = channel.unsubscribe;
          channel.subscribe = function(listener) {
            originalSubscribe.call(channel, listener);
            $(window).unload(function(event) {
              originalUnsubscribe.call(channel);
            });
            return channel;
          };
          return channel;
        },
        getChannel0: function(channelName) {
          return ambClient.getChannel(channelName);
        },
        registerExtension: function(extensionName, extension) {
          ambClient.registerExtension(extensionName, extension);
        },
        unregisterExtension: function(extensionName) {
          ambClient.unregisterExtension(extensionName);
        },
        batch: function(block) {
          ambClient.batch(block);
        },
        subscribeToEvent: function(event, callback) {
          return ambClient.subscribeToEvent(event, callback);
        },
        unsubscribeFromEvent: function(id) {
          ambClient.unsubscribeFromEvent(id);
        },
        isLoggedIn: function() {
          return ambClient.isLoggedIn();
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
    })();
  }
})(jQuery1110);;
/*! RESOURCE: /scripts/amb_initialize.js */
if (typeof g_amb_on_login === 'undefined') {
  amb.getClient();
};;
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
  if (_window.g_ambClient) {
    ambClient = _window.g_ambClient;
    sameScope = true;
  }
  if (!ambClient)
    ambClient = amb.getClient();
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
    if (!presenceArray || !presenceArray.forEach) {
      $log.log("factory.snPresence >>> server error @ " + new Date());
      return;
    }
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
  var interval = 20 * 1000;
  var sessions = {};
  var timer;
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
    timer = $timeout(managePresence, interval);
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
    if (timer)
      $timeout.cancel(timer);
    if (!statChannel)
      return;
    publish("exited");
    statChannel.unsubscribe();
    statChannel = table = sys_id = null;
  }

  function setStatus(status) {
    if (status == $rootScope.status)
      return;
    $rootScope.status = status;
    publish($rootScope.status);
  }

  function publish(status) {
    if (!statChannel)
      return;
    if (amb.getState() !== "opened")
      return;
    statChannel.publish({
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
    });
  }

  function onStatus(message) {
    var d = message.data;
    if (d.session_id == NOW.session_id)
      return;
    var s = sessions[d.session_id];
    if (s)
      angular.extend(s, d);
    else
      s = sessions[d.session_id] = d;
    s.lastUpdated = new Date();
    broadcastSessions();
    if (s.status == 'entered')
      publish($rootScope.status);
  }

  function managePresence() {
    var now = new Date().getTime();
    var deleted = false;
    Object.keys(sessions).forEach(function(id) {
      var s = sessions[id];
      if (!s.lastUpdated)
        return;
      var last = s.lastUpdated.getTime();
      var t = now - last;
      s.lastSeen = t / 1000;
      if (s.status === 'exited') {
        deleted = true;
        delete sessions[id];
      }
      if (t > interval * 2)
        s.status = 'probably left';
      if (t > interval * 4) {
        deleted = true;
        delete sessions[id];
      }
    });
    if (Object.keys(sessions).length !== 0)
      publish($rootScope.status);
    timer = $timeout(managePresence, interval);
    if (deleted)
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
      snPresence: '=',
      user: '='
    },
    link: function(scope, element) {
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
});;;
/*! RESOURCE: /scripts/sn/common/user_profile/js_includes_user_profile.js */
/*! RESOURCE: /scripts/sn/common/user_profile/_module.js */
angular.module("sn.common.user_profile", []);;
/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister) {
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
      if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID))
        $scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
      $scope.$emit("sn-user-profile.ready");
      $scope.openDirectMessageConversation = function(evt) {
        if (evt.keyCode === 9)
          return;
        snConnectService.openWithProfile($scope.profile);
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
      conversation: '@',
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
      userId: '=',
      avatarUrl: '=',
      initials: '=',
      enablePresence: '@'
    },
    controller: function($scope) {
      $scope.enablePresence = $scope.enablePresence === 'true';
      $scope.getBackgroundStyle = function() {
        if ($scope.avatarUrl && $scope.avatarUrl !== '')
          return {
            'background-image': 'url(' + $scope.avatarUrl + ')'
          };
        return '';
      };
    }
  }
});;;