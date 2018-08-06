/*! RESOURCE: /scripts/doctype/js_includes_navigator_doctype.js */
/*! RESOURCE: /scripts/lib/prototype.min.js */
var Prototype = {
  Version: "1.7.3",
  Browser: (function() {
    var b = navigator.userAgent;
    var a = Object.prototype.toString.call(window.opera) == "[object Opera]";
    return {
      IE: !!window.attachEvent && !a,
      Opera: a,
      WebKit: b.indexOf("AppleWebKit/") > -1,
      Gecko: b.indexOf("Gecko") > -1 && b.indexOf("KHTML") === -1,
      MobileSafari: /Apple.*Mobile/.test(b)
    }
  })(),
  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: (function() {
      var a = window.Element || window.HTMLElement;
      return !!(a && a.prototype)
    })(),
    SpecificElementExtensions: (function() {
      if (typeof window.HTMLDivElement !== "undefined") {
        return true
      }
      var c = document.createElement("div"),
        b = document.createElement("form"),
        a = false;
      if (c.__proto__ && (c.__proto__ !== b.__proto__)) {
        a = true
      }
      c = b = null;
      return a
    })()
  },
  ScriptFragment: "<script[^>]*>([\\S\\s]*?)<\/script\\s*>",
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,
  emptyFunction: function() {},
  K: function(a) {
    return a
  }
};
if (Prototype.Browser.MobileSafari) {
  Prototype.BrowserFeatures.SpecificElementExtensions = false
}
var Class = (function() {
  var d = (function() {
    for (var e in {
        toString: 1
      }) {
      if (e === "toString") {
        return false
      }
    }
    return true
  })();

  function a() {}

  function b() {
    var h = null,
      g = $A(arguments);
    if (Object.isFunction(g[0])) {
      h = g.shift()
    }

    function e() {
      this.initialize.apply(this, arguments)
    }
    Object.extend(e, Class.Methods);
    e.superclass = h;
    e.subclasses = [];
    if (h) {
      a.prototype = h.prototype;
      e.prototype = new a;
      h.subclasses.push(e)
    }
    for (var f = 0, j = g.length; f < j; f++) {
      e.addMethods(g[f])
    }
    if (!e.prototype.initialize) {
      e.prototype.initialize = Prototype.emptyFunction
    }
    e.prototype.constructor = e;
    return e
  }

  function c(l) {
    var g = this.superclass && this.superclass.prototype,
      f = Object.keys(l);
    if (d) {
      if (l.toString != Object.prototype.toString) {
        f.push("toString")
      }
      if (l.valueOf != Object.prototype.valueOf) {
        f.push("valueOf")
      }
    }
    for (var e = 0, h = f.length; e < h; e++) {
      var k = f[e],
        j = l[k];
      if (g && Object.isFunction(j) && j.argumentNames()[0] == "$super") {
        var m = j;
        j = (function(i) {
          return function() {
            return g[i].apply(this, arguments)
          }
        })(k).wrap(m);
        j.valueOf = (function(i) {
          return function() {
            return i.valueOf.call(i)
          }
        })(m);
        j.toString = (function(i) {
          return function() {
            return i.toString.call(i)
          }
        })(m)
      }
      this.prototype[k] = j
    }
    return this
  }
  return {
    create: b,
    Methods: {
      addMethods: c
    }
  }
})();
(function() {
  var y = Object.prototype.toString,
    k = Object.prototype.hasOwnProperty,
    z = "Null",
    B = "Undefined",
    K = "Boolean",
    w = "Number",
    v = "String",
    I = "Object",
    i = "[object Function]",
    d = "[object Boolean]",
    j = "[object Number]",
    f = "[object String]",
    b = "[object Array]",
    H = "[object Date]",
    e = window.JSON && typeof JSON.stringify === "function" && JSON.stringify(0) === "0" && typeof JSON.stringify(Prototype.K) === "undefined";
  var q = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"];
  var a = (function() {
    for (var L in {
        toString: 1
      }) {
      if (L === "toString") {
        return false
      }
    }
    return true
  })();

  function D(M) {
    switch (M) {
      case null:
        return z;
      case (void 0):
        return B
    }
    var L = typeof M;
    switch (L) {
      case "boolean":
        return K;
      case "number":
        return w;
      case "string":
        return v
    }
    return I
  }

  function h(L, N) {
    for (var M in N) {
      L[M] = N[M]
    }
    return L
  }

  function l(L) {
    try {
      if (o(L)) {
        return "undefined"
      }
      if (L === null) {
        return "null"
      }
      return L.inspect ? L.inspect() : String(L)
    } catch (M) {
      if (M instanceof RangeError) {
        return "..."
      }
      throw M
    }
  }

  function A(L) {
    return m("", {
      "": L
    }, [])
  }

  function m(U, R, S) {
    var T = R[U];
    if (D(T) === I && typeof T.toJSON === "function") {
      T = T.toJSON(U)
    }
    var N = y.call(T);
    switch (N) {
      case j:
      case d:
      case f:
        T = T.valueOf()
    }
    switch (T) {
      case null:
        return "null";
      case true:
        return "true";
      case false:
        return "false"
    }
    var Q = typeof T;
    switch (Q) {
      case "string":
        return T.inspect(true);
      case "number":
        return isFinite(T) ? String(T) : "null";
      case "object":
        for (var M = 0, L = S.length; M < L; M++) {
          if (S[M] === T) {
            throw new TypeError("Cyclic reference to '" + T + "' in object")
          }
        }
        S.push(T);
        var P = [];
        if (N === b) {
          for (var M = 0, L = T.length; M < L; M++) {
            var O = m(M, T, S);
            P.push(typeof O === "undefined" ? "null" : O)
          }
          P = "[" + P.join(",") + "]"
        } else {
          var V = Object.keys(T);
          for (var M = 0, L = V.length; M < L; M++) {
            var U = V[M],
              O = m(U, T, S);
            if (typeof O !== "undefined") {
              P.push(U.inspect(true) + ":" + O)
            }
          }
          P = "{" + P.join(",") + "}"
        }
        S.pop();
        return P
    }
  }

  function J(L) {
    return JSON.stringify(L)
  }

  function C(L) {
    return $H(L).toQueryString()
  }

  function p(L) {
    return L && L.toHTML ? L.toHTML() : String.interpret(L)
  }

  function x(L) {
    if (D(L) !== I) {
      throw new TypeError()
    }
    var N = [];
    for (var O in L) {
      if (k.call(L, O)) {
        N.push(O)
      }
    }
    if (a) {
      for (var M = 0; O = q[M]; M++) {
        if (k.call(L, O)) {
          N.push(O)
        }
      }
    }
    return N
  }

  function G(L) {
    var M = [];
    for (var N in L) {
      M.push(L[N])
    }
    return M
  }

  function s(L) {
    return h({}, L)
  }

  function E(L) {
    return !!(L && L.nodeType == 1)
  }

  function u(L) {
    return y.call(L) === b
  }
  var c = (typeof Array.isArray == "function") && Array.isArray([]) && !Array.isArray({});
  if (c) {
    u = Array.isArray
  }

  function r(L) {
    return L instanceof Hash
  }

  function n(L) {
    return y.call(L) === i
  }

  function g(L) {
    return y.call(L) === f
  }

  function F(L) {
    return y.call(L) === j
  }

  function t(L) {
    return y.call(L) === H
  }

  function o(L) {
    return typeof L === "undefined"
  }
  h(Object, {
    extend: h,
    inspect: l,
    toJSON: e ? J : A,
    toQueryString: C,
    toHTML: p,
    keys: Object.keys || x,
    values: G,
    clone: s,
    isElement: E,
    isArray: u,
    isHash: r,
    isFunction: n,
    isString: g,
    isNumber: F,
    isDate: t,
    isUndefined: o
  })
})();
Object.extend(Function.prototype, (function() {
  var l = Array.prototype.slice;

  function d(p, m) {
    var o = p.length,
      n = m.length;
    while (n--) {
      p[o + n] = m[n]
    }
    return p
  }

  function j(n, m) {
    n = l.call(n, 0);
    return d(n, m)
  }

  function g() {
    var m = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, "").replace(/\s+/g, "").split(",");
    return m.length == 1 && !m[0] ? [] : m
  }

  function h(o) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) {
      return this
    }
    if (!Object.isFunction(this)) {
      throw new TypeError("The object is not callable.")
    }
    var q = function() {};
    var m = this,
      n = l.call(arguments, 1);
    var p = function() {
      var r = j(n, arguments);
      var s = this instanceof p ? this : o;
      return m.apply(s, r)
    };
    q.prototype = this.prototype;
    p.prototype = new q();
    return p
  }

  function f(o) {
    var m = this,
      n = l.call(arguments, 1);
    return function(q) {
      var p = d([q || window.event], n);
      return m.apply(o, p)
    }
  }

  function k() {
    if (!arguments.length) {
      return this
    }
    var m = this,
      n = l.call(arguments, 0);
    return function() {
      var o = j(n, arguments);
      return m.apply(this, o)
    }
  }

  function e(o) {
    var m = this,
      n = l.call(arguments, 1);
    o = o * 1000;
    return window.setTimeout(function() {
      return m.apply(m, n)
    }, o)
  }

  function a() {
    var m = d([0.01], arguments);
    return this.delay.apply(this, m)
  }

  function c(n) {
    var m = this;
    return function() {
      var o = d([m.bind(this)], arguments);
      return n.apply(this, o)
    }
  }

  function b() {
    if (this._methodized) {
      return this._methodized
    }
    var m = this;
    return this._methodized = function() {
      var n = d([this], arguments);
      return m.apply(null, n)
    }
  }
  var i = {
    argumentNames: g,
    bindAsEventListener: f,
    curry: k,
    delay: e,
    defer: a,
    wrap: c,
    methodize: b
  };
  if (!Function.prototype.bind) {
    i.bind = h
  }
  return i
})());
(function(c) {
  function b() {
    return this.getUTCFullYear() + "-" + (this.getUTCMonth() + 1).toPaddedString(2) + "-" + this.getUTCDate().toPaddedString(2) + "T" + this.getUTCHours().toPaddedString(2) + ":" + this.getUTCMinutes().toPaddedString(2) + ":" + this.getUTCSeconds().toPaddedString(2) + "Z"
  }

  function a() {
    return this.toISOString()
  }
  if (!c.toISOString) {
    c.toISOString = b
  }
  if (!c.toJSON) {
    c.toJSON = a
  }
})(Date.prototype);
RegExp.prototype.match = RegExp.prototype.test;
RegExp.escape = function(a) {
  return String(a).replace(/([.*+?^=!:()|[\]\/\\])/g, "\\$1")
};
var PeriodicalExecuter = Class.create({
  initialize: function(b, a) {
    this.callback = b;
    this.frequency = a;
    this.currentlyExecuting = false;
    this.registerCallback()
  },
  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000)
  },
  execute: function() {
    this.callback(this)
  },
  stop: function() {
    if (!this.timer) {
      return
    }
    clearInterval(this.timer);
    this.timer = null
  },
  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false
      } catch (a) {
        this.currentlyExecuting = false;
        throw a
      }
    }
  }
});
Object.extend(String, {
  interpret: function(a) {
    return a == null ? "" : String(a)
  },
  specialChar: {
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",
    "\\": "\\\\"
  }
});
Object.extend(String.prototype, (function() {
  var NATIVE_JSON_PARSE_SUPPORT = window.JSON && typeof JSON.parse === "function" && JSON.parse('{"test": true}').test;

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) {
      return replacement
    }
    var template = new Template(replacement);
    return function(match) {
      return template.evaluate(match)
    }
  }

  function isNonEmptyRegExp(regexp) {
    return regexp.source && regexp.source !== "(?:)"
  }

  function gsub(pattern, replacement) {
    var result = "",
      source = this,
      match;
    replacement = prepareReplacement(replacement);
    if (Object.isString(pattern)) {
      pattern = RegExp.escape(pattern)
    }
    if (!(pattern.length || isNonEmptyRegExp(pattern))) {
      replacement = replacement("");
      return replacement + source.split("").join(replacement) + replacement
    }
    while (source.length > 0) {
      match = source.match(pattern);
      if (match && match[0].length > 0) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source = source.slice(match.index + match[0].length)
      } else {
        result += source, source = ""
      }
    }
    return result
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;
    return this.gsub(pattern, function(match) {
      if (--count < 0) {
        return match[0]
      }
      return replacement(match)
    })
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this)
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? "..." : truncation;
    return this.length > length ? this.slice(0, length - truncation.length) + truncation : String(this)
  }

  function strip() {
    return this.replace(/^\s+/, "").replace(/\s+$/, "")
  }

  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?(\/)?>|<\/\w+>/gi, "")
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, "img"), "")
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, "img"),
      matchOne = new RegExp(Prototype.ScriptFragment, "im");
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ["", ""])[1]
    })
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) {
      return eval(script)
    })
  }

  function escapeHTML() {
    return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
  }

  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) {
      return {}
    }
    return match[1].split(separator || "&").inject({}, function(hash, pair) {
      if ((pair = pair.split("="))[0]) {
        var key = decodeURIComponent(pair.shift()),
          value = pair.length > 1 ? pair.join("=") : pair[0];
        if (value != undefined) {
          value = value.gsub("+", " ");
          value = decodeURIComponent(value)
        }
        if (key in hash) {
          if (!Object.isArray(hash[key])) {
            hash[key] = [hash[key]]
          }
          hash[key].push(value)
        } else {
          hash[key] = value
        }
      }
      return hash
    })
  }

  function toArray() {
    return this.split("")
  }

  function succ() {
    return this.slice(0, this.length - 1) + String.fromCharCode(this.charCodeAt(this.length - 1) + 1)
  }

  function times(count) {
    return count < 1 ? "" : new Array(count + 1).join(this)
  }

  function camelize() {
    return this.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : ""
    })
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase()
  }

  function underscore() {
    return this.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/-/g, "_").toLowerCase()
  }

  function dasherize() {
    return this.replace(/_/g, "-")
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character]
      }
      return "\\u00" + character.charCodeAt().toPaddedString(2, 16)
    });
    if (useDoubleQuotes) {
      return '"' + escapedString.replace(/"/g, '\\"') + '"'
    }
    return "'" + escapedString.replace(/'/g, "\\'") + "'"
  }

  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, "$1")
  }

  function isJSON() {
    var str = this;
    if (str.blank()) {
      return false
    }
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@");
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]");
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, "");
    return (/^[\],:{}\s]*$/).test(str)
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON(),
      cx = /[\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff\u0000]/g;
    if (cx.test(json)) {
      json = json.replace(cx, function(a) {
        return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
      })
    }
    try {
      if (!sanitize || json.isJSON()) {
        return eval("(" + json + ")")
      }
    } catch (e) {}
    throw new SyntaxError("Badly formed JSON string: " + this.inspect())
  }

  function parseJSON() {
    var json = this.unfilterJSON();
    return JSON.parse(json)
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1
  }

  function startsWith(pattern, position) {
    position = Object.isNumber(position) ? position : 0;
    return this.lastIndexOf(pattern, position) === position
  }

  function endsWith(pattern, position) {
    pattern = String(pattern);
    position = Object.isNumber(position) ? position : this.length;
    if (position < 0) {
      position = 0
    }
    if (position > this.length) {
      position = this.length
    }
    var d = position - pattern.length;
    return d >= 0 && this.indexOf(pattern, d) === d
  }

  function empty() {
    return this == ""
  }

  function blank() {
    return /^\s*$/.test(this)
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object)
  }
  return {
    gsub: gsub,
    sub: sub,
    scan: scan,
    truncate: truncate,
    strip: String.prototype.trim || strip,
    stripTags: stripTags,
    stripScripts: stripScripts,
    extractScripts: extractScripts,
    evalScripts: evalScripts,
    escapeHTML: escapeHTML,
    unescapeHTML: unescapeHTML,
    toQueryParams: toQueryParams,
    parseQuery: toQueryParams,
    toArray: toArray,
    succ: succ,
    times: times,
    camelize: camelize,
    capitalize: capitalize,
    underscore: underscore,
    dasherize: dasherize,
    inspect: inspect,
    unfilterJSON: unfilterJSON,
    isJSON: isJSON,
    evalJSON: NATIVE_JSON_PARSE_SUPPORT ? parseJSON : evalJSON,
    include: include,
    startsWith: String.prototype.startsWith || startsWith,
    endsWith: String.prototype.endsWith || endsWith,
    empty: empty,
    blank: blank,
    interpolate: interpolate
  }
})());
var Template = Class.create({
  initialize: function(a, b) {
    this.template = a.toString();
    this.pattern = b || Template.Pattern
  },
  evaluate: function(a) {
    if (a && Object.isFunction(a.toTemplateReplacements)) {
      a = a.toTemplateReplacements()
    }
    return this.template.gsub(this.pattern, function(d) {
      if (a == null) {
        return (d[1] + "")
      }
      var f = d[1] || "";
      if (f == "\\") {
        return d[2]
      }
      var b = a,
        g = d[3],
        e = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      d = e.exec(g);
      if (d == null) {
        return f
      }
      while (d != null) {
        var c = d[1].startsWith("[") ? d[2].replace(/\\\\]/g, "]") : d[1];
        b = b[c];
        if (null == b || "" == d[3]) {
          break
        }
        g = g.substring("[" == d[3] ? d[1].length : d[0].length);
        d = e.exec(g)
      }
      return f + String.interpret(b)
    })
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
var $break = {};
var Enumerable = (function() {
  function c(x, w) {
    try {
      this._each(x, w)
    } catch (y) {
      if (y != $break) {
        throw y
      }
    }
    return this
  }

  function r(z, y, x) {
    var w = -z,
      A = [],
      B = this.toArray();
    if (z < 1) {
      return B
    }
    while ((w += z) < B.length) {
      A.push(B.slice(w, w + z))
    }
    return A.collect(y, x)
  }

  function b(y, x) {
    y = y || Prototype.K;
    var w = true;
    this.each(function(A, z) {
      w = w && !!y.call(x, A, z, this);
      if (!w) {
        throw $break
      }
    }, this);
    return w
  }

  function i(y, x) {
    y = y || Prototype.K;
    var w = false;
    this.each(function(A, z) {
      if (w = !!y.call(x, A, z, this)) {
        throw $break
      }
    }, this);
    return w
  }

  function j(y, x) {
    y = y || Prototype.K;
    var w = [];
    this.each(function(A, z) {
      w.push(y.call(x, A, z, this))
    }, this);
    return w
  }

  function t(y, x) {
    var w;
    this.each(function(A, z) {
      if (y.call(x, A, z, this)) {
        w = A;
        throw $break
      }
    }, this);
    return w
  }

  function h(y, x) {
    var w = [];
    this.each(function(A, z) {
      if (y.call(x, A, z, this)) {
        w.push(A)
      }
    }, this);
    return w
  }

  function g(z, y, x) {
    y = y || Prototype.K;
    var w = [];
    if (Object.isString(z)) {
      z = new RegExp(RegExp.escape(z))
    }
    this.each(function(B, A) {
      if (z.match(B)) {
        w.push(y.call(x, B, A, this))
      }
    }, this);
    return w
  }

  function a(w) {
    if (Object.isFunction(this.indexOf) && this.indexOf(w) != -1) {
      return true
    }
    var x = false;
    this.each(function(y) {
      if (y == w) {
        x = true;
        throw $break
      }
    });
    return x
  }

  function q(x, w) {
    w = Object.isUndefined(w) ? null : w;
    return this.eachSlice(x, function(y) {
      while (y.length < x) {
        y.push(w)
      }
      return y
    })
  }

  function l(w, y, x) {
    this.each(function(A, z) {
      w = y.call(x, w, A, z, this)
    }, this);
    return w
  }

  function v(x) {
    var w = $A(arguments).slice(1);
    return this.map(function(y) {
      return y[x].apply(y, w)
    })
  }

  function p(y, x) {
    y = y || Prototype.K;
    var w;
    this.each(function(A, z) {
      A = y.call(x, A, z, this);
      if (w == null || A >= w) {
        w = A
      }
    }, this);
    return w
  }

  function n(y, x) {
    y = y || Prototype.K;
    var w;
    this.each(function(A, z) {
      A = y.call(x, A, z, this);
      if (w == null || A < w) {
        w = A
      }
    }, this);
    return w
  }

  function e(z, x) {
    z = z || Prototype.K;
    var y = [],
      w = [];
    this.each(function(B, A) {
      (z.call(x, B, A, this) ? y : w).push(B)
    }, this);
    return [y, w]
  }

  function f(x) {
    var w = [];
    this.each(function(y) {
      w.push(y[x])
    });
    return w
  }

  function d(y, x) {
    var w = [];
    this.each(function(A, z) {
      if (!y.call(x, A, z, this)) {
        w.push(A)
      }
    }, this);
    return w
  }

  function m(x, w) {
    return this.map(function(z, y) {
      return {
        value: z,
        criteria: x.call(w, z, y, this)
      }
    }, this).sort(function(B, A) {
      var z = B.criteria,
        y = A.criteria;
      return z < y ? -1 : z > y ? 1 : 0
    }).pluck("value")
  }

  function o() {
    return this.map()
  }

  function s() {
    var x = Prototype.K,
      w = $A(arguments);
    if (Object.isFunction(w.last())) {
      x = w.pop()
    }
    var y = [this].concat(w).map($A);
    return this.map(function(A, z) {
      return x(y.pluck(z))
    })
  }

  function k() {
    return this.toArray().length
  }

  function u() {
    return "#<Enumerable:" + this.toArray().inspect() + ">"
  }
  return {
    each: c,
    eachSlice: r,
    all: b,
    every: b,
    any: i,
    some: i,
    collect: j,
    map: j,
    detect: t,
    findAll: h,
    select: h,
    filter: h,
    grep: g,
    include: a,
    member: a,
    inGroupsOf: q,
    inject: l,
    invoke: v,
    max: p,
    min: n,
    partition: e,
    pluck: f,
    reject: d,
    sortBy: m,
    toArray: o,
    entries: o,
    zip: s,
    size: k,
    inspect: u,
    find: t
  }
})();

function $A(c) {
  if (!c) {
    return []
  }
  if ("toArray" in Object(c)) {
    return c.toArray()
  }
  var b = c.length || 0,
    a = new Array(b);
  while (b--) {
    a[b] = c[b]
  }
  return a
}

function $w(a) {
  if (!Object.isString(a)) {
    return []
  }
  a = a.strip();
  return a ? a.split(/\s+/) : []
}
Array.from = $A;
(function() {
  var v = Array.prototype,
    o = v.slice,
    q = v.forEach;

  function b(B, A) {
    for (var z = 0, C = this.length >>> 0; z < C; z++) {
      if (z in this) {
        B.call(A, this[z], z, this)
      }
    }
  }
  if (!q) {
    q = b
  }

  function n() {
    this.length = 0;
    return this
  }

  function d() {
    return this[0]
  }

  function g() {
    return this[this.length - 1]
  }

  function k() {
    return this.select(function(z) {
      return z != null
    })
  }

  function y() {
    return this.inject([], function(A, z) {
      if (Object.isArray(z)) {
        return A.concat(z.flatten())
      }
      A.push(z);
      return A
    })
  }

  function j() {
    var z = o.call(arguments, 0);
    return this.select(function(A) {
      return !z.include(A)
    })
  }

  function f(z) {
    return (z === false ? this.toArray() : this)._reverse()
  }

  function m(z) {
    return this.inject([], function(C, B, A) {
      if (0 == A || (z ? C.last() != B : !C.include(B))) {
        C.push(B)
      }
      return C
    })
  }

  function r(z) {
    return this.uniq().findAll(function(A) {
      return z.indexOf(A) !== -1
    })
  }

  function t() {
    return o.call(this, 0)
  }

  function l() {
    return this.length
  }

  function w() {
    return "[" + this.map(Object.inspect).join(", ") + "]"
  }

  function a(C, A) {
    if (this == null) {
      throw new TypeError()
    }
    var D = Object(this),
      B = D.length >>> 0;
    if (B === 0) {
      return -1
    }
    A = Number(A);
    if (isNaN(A)) {
      A = 0
    } else {
      if (A !== 0 && isFinite(A)) {
        A = (A > 0 ? 1 : -1) * Math.floor(Math.abs(A))
      }
    }
    if (A > B) {
      return -1
    }
    var z = A >= 0 ? A : Math.max(B - Math.abs(A), 0);
    for (; z < B; z++) {
      if (z in D && D[z] === C) {
        return z
      }
    }
    return -1
  }

  function p(C, A) {
    if (this == null) {
      throw new TypeError()
    }
    var D = Object(this),
      B = D.length >>> 0;
    if (B === 0) {
      return -1
    }
    if (!Object.isUndefined(A)) {
      A = Number(A);
      if (isNaN(A)) {
        A = 0
      } else {
        if (A !== 0 && isFinite(A)) {
          A = (A > 0 ? 1 : -1) * Math.floor(Math.abs(A))
        }
      }
    } else {
      A = B
    }
    var z = A >= 0 ? Math.min(A, B - 1) : B - Math.abs(A);
    for (; z >= 0; z--) {
      if (z in D && D[z] === C) {
        return z
      }
    }
    return -1
  }

  function c(G) {
    var E = [],
      F = o.call(arguments, 0),
      H, A = 0;
    F.unshift(this);
    for (var D = 0, z = F.length; D < z; D++) {
      H = F[D];
      if (Object.isArray(H) && !("callee" in H)) {
        for (var C = 0, B = H.length; C < B; C++) {
          if (C in H) {
            E[A] = H[C]
          }
          A++
        }
      } else {
        E[A++] = H
      }
    }
    E.length = A;
    return E
  }

  function s(z) {
    return function() {
      if (arguments.length === 0) {
        return z.call(this, Prototype.K)
      } else {
        if (arguments[0] === undefined) {
          var A = o.call(arguments, 1);
          A.unshift(Prototype.K);
          return z.apply(this, A)
        } else {
          return z.apply(this, arguments)
        }
      }
    }
  }

  function u(D) {
    if (this == null) {
      throw new TypeError()
    }
    D = D || Prototype.K;
    var z = Object(this);
    var C = [],
      B = arguments[1],
      F = 0;
    for (var A = 0, E = z.length >>> 0; A < E; A++) {
      if (A in z) {
        C[F] = D.call(B, z[A], A, z)
      }
      F++
    }
    C.length = F;
    return C
  }
  if (v.map) {
    u = s(Array.prototype.map)
  }

  function h(D) {
    if (this == null || !Object.isFunction(D)) {
      throw new TypeError()
    }
    var z = Object(this);
    var C = [],
      B = arguments[1],
      F;
    for (var A = 0, E = z.length >>> 0; A < E; A++) {
      if (A in z) {
        F = z[A];
        if (D.call(B, F, A, z)) {
          C.push(F)
        }
      }
    }
    return C
  }
  if (v.filter) {
    h = Array.prototype.filter
  }

  function i(C) {
    if (this == null) {
      throw new TypeError()
    }
    C = C || Prototype.K;
    var B = arguments[1];
    var z = Object(this);
    for (var A = 0, D = z.length >>> 0; A < D; A++) {
      if (A in z && C.call(B, z[A], A, z)) {
        return true
      }
    }
    return false
  }
  if (v.some) {
    i = s(Array.prototype.some)
  }

  function x(C) {
    if (this == null) {
      throw new TypeError()
    }
    C = C || Prototype.K;
    var B = arguments[1];
    var z = Object(this);
    for (var A = 0, D = z.length >>> 0; A < D; A++) {
      if (A in z && !C.call(B, z[A], A, z)) {
        return false
      }
    }
    return true
  }
  if (v.every) {
    x = s(Array.prototype.every)
  }
  Object.extend(v, Enumerable);
  if (v.entries === Enumerable.entries) {
    delete v.entries
  }
  if (!v._reverse) {
    v._reverse = v.reverse
  }
  Object.extend(v, {
    _each: q,
    map: u,
    collect: u,
    select: h,
    filter: h,
    findAll: h,
    some: i,
    any: i,
    every: x,
    all: x,
    clear: n,
    first: d,
    last: g,
    compact: k,
    flatten: y,
    without: j,
    reverse: f,
    uniq: m,
    intersect: r,
    clone: t,
    toArray: t,
    size: l,
    inspect: w
  });
  var e = (function() {
    return [].concat(arguments)[0][0] !== 1
  })(1, 2);
  if (e) {
    v.concat = c
  }
  if (!v.indexOf) {
    v.indexOf = a
  }
  if (!v.lastIndexOf) {
    v.lastIndexOf = p
  }
})();

function $H(a) {
  return new Hash(a)
}
var Hash = Class.create(Enumerable, (function() {
  function e(p) {
    this._object = Object.isHash(p) ? p.toObject() : Object.clone(p)
  }

  function f(s, r) {
    var q = 0;
    for (var p in this._object) {
      var t = this._object[p],
        u = [p, t];
      u.key = p;
      u.value = t;
      s.call(r, u, q);
      q++
    }
  }

  function j(p, q) {
    return this._object[p] = q
  }

  function c(p) {
    if (this._object[p] !== Object.prototype[p]) {
      return this._object[p]
    }
  }

  function m(p) {
    var q = this._object[p];
    delete this._object[p];
    return q
  }

  function o() {
    return Object.clone(this._object)
  }

  function n() {
    return this.pluck("key")
  }

  function l() {
    return this.pluck("value")
  }

  function g(q) {
    var p = this.detect(function(r) {
      return r.value === q
    });
    return p && p.key
  }

  function i(p) {
    return this.clone().update(p)
  }

  function d(p) {
    return new Hash(p).inject(this, function(q, r) {
      q.set(r.key, r.value);
      return q
    })
  }

  function b(p, q) {
    if (Object.isUndefined(q)) {
      return p
    }
    q = String.interpret(q);
    q = q.gsub(/(\r)?\n/, "\r\n");
    q = encodeURIComponent(q);
    q = q.gsub(/%20/, "+");
    return p + "=" + q
  }

  function a() {
    return this.inject([], function(t, w) {
      var s = encodeURIComponent(w.key),
        q = w.value;
      if (q && typeof q == "object") {
        if (Object.isArray(q)) {
          var v = [];
          for (var r = 0, p = q.length, u; r < p; r++) {
            u = q[r];
            v.push(b(s, u))
          }
          return t.concat(v)
        }
      } else {
        t.push(b(s, q))
      }
      return t
    }).join("&")
  }

  function k() {
    return "#<Hash:{" + this.map(function(p) {
      return p.map(Object.inspect).join(": ")
    }).join(", ") + "}>"
  }

  function h() {
    return new Hash(this)
  }
  return {
    initialize: e,
    _each: f,
    set: j,
    get: c,
    unset: m,
    toObject: o,
    toTemplateReplacements: o,
    keys: n,
    values: l,
    index: g,
    merge: i,
    update: d,
    toQueryString: a,
    inspect: k,
    toJSON: o,
    clone: h
  }
})());
Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function d() {
    return this.toPaddedString(2, 16)
  }

  function b() {
    return this + 1
  }

  function h(j, i) {
    $R(0, this, true).each(j, i);
    return this
  }

  function g(k, j) {
    var i = this.toString(j || 10);
    return "0".times(k - i.length) + i
  }

  function a() {
    return Math.abs(this)
  }

  function c() {
    return Math.round(this)
  }

  function e() {
    return Math.ceil(this)
  }

  function f() {
    return Math.floor(this)
  }
  return {
    toColorPart: d,
    succ: b,
    times: h,
    toPaddedString: g,
    abs: a,
    round: c,
    ceil: e,
    floor: f
  }
})());

function $R(c, a, b) {
  return new ObjectRange(c, a, b)
}
var ObjectRange = Class.create(Enumerable, (function() {
  function b(f, d, e) {
    this.start = f;
    this.end = d;
    this.exclusive = e
  }

  function c(f, e) {
    var g = this.start,
      d;
    for (d = 0; this.include(g); d++) {
      f.call(e, g, d);
      g = g.succ()
    }
  }

  function a(d) {
    if (d < this.start) {
      return false
    }
    if (this.exclusive) {
      return d < this.end
    }
    return d <= this.end
  }
  return {
    initialize: b,
    _each: c,
    include: a
  }
})());
var Abstract = {};
var Try = {
  these: function() {
    var c;
    for (var b = 0, d = arguments.length; b < d; b++) {
      var a = arguments[b];
      try {
        c = a();
        break
      } catch (f) {}
    }
    return c
  }
};
var Ajax = {
  getTransport: function() {
    return Try.these(function() {
      return new XMLHttpRequest()
    }, function() {
      return new ActiveXObject("Msxml2.XMLHTTP")
    }, function() {
      return new ActiveXObject("Microsoft.XMLHTTP")
    }) || false
  },
  activeRequestCount: 0
};
Ajax.Responders = {
  responders: [],
  _each: function(b, a) {
    this.responders._each(b, a)
  },
  register: function(a) {
    if (!this.include(a)) {
      this.responders.push(a)
    }
  },
  unregister: function(a) {
    this.responders = this.responders.without(a)
  },
  dispatch: function(d, b, c, a) {
    this.each(function(f) {
      if (Object.isFunction(f[d])) {
        try {
          f[d].apply(f, [b, c, a])
        } catch (g) {}
      }
    })
  }
};
Object.extend(Ajax.Responders, Enumerable);
Ajax.Responders.register({
  onCreate: function() {
    Ajax.activeRequestCount++
  },
  onComplete: function() {
    Ajax.activeRequestCount--
  }
});
Ajax.Base = Class.create({
  initialize: function(a) {
    this.options = {
      method: "post",
      asynchronous: true,
      contentType: "application/x-www-form-urlencoded",
      encoding: "UTF-8",
      parameters: "",
      evalJSON: true,
      evalJS: true
    };
    Object.extend(this.options, a || {});
    this.options.method = this.options.method.toLowerCase();
    if (Object.isHash(this.options.parameters)) {
      this.options.parameters = this.options.parameters.toObject()
    }
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,
  initialize: function($super, b, a) {
    $super(a);
    this.transport = Ajax.getTransport();
    this.request(b)
  },
  request: function(b) {
    this.url = b;
    this.method = this.options.method;
    var d = Object.isString(this.options.parameters) ? this.options.parameters : Object.toQueryString(this.options.parameters);
    if (!["get", "post"].include(this.method)) {
      d += (d ? "&" : "") + "_method=" + this.method;
      this.method = "post"
    }
    if (d && this.method === "get") {
      this.url += (this.url.include("?") ? "&" : "?") + d
    }
    this.parameters = d.toQueryParams();
    try {
      var a = new Ajax.Response(this);
      if (this.options.onCreate) {
        this.options.onCreate(a)
      }
      Ajax.Responders.dispatch("onCreate", this, a);
      this.transport.open(this.method.toUpperCase(), this.url, this.options.asynchronous);
      if (this.options.asynchronous) {
        this.respondToReadyState.bind(this).defer(1)
      }
      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();
      this.body = this.method == "post" ? (this.options.postBody || d) : null;
      this.transport.send(this.body);
      if (!this.options.asynchronous && this.transport.overrideMimeType) {
        this.onStateChange()
      }
    } catch (c) {
      this.dispatchException(c)
    }
  },
  onStateChange: function() {
    var a = this.transport.readyState;
    if (a > 1 && !((a == 4) && this._complete)) {
      this.respondToReadyState(this.transport.readyState)
    }
  },
  setRequestHeaders: function() {
    var e = {
      "X-Requested-With": "XMLHttpRequest",
      "X-Prototype-Version": Prototype.Version,
      Accept: "text/javascript, text/html, application/xml, text/xml, */*"
    };
    if (this.method == "post") {
      e["Content-type"] = this.options.contentType + (this.options.encoding ? "; charset=" + this.options.encoding : "");
      if (this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0, 2005])[1] < 2005) {
        e.Connection = "close"
      }
    }
    if (typeof this.options.requestHeaders == "object") {
      var c = this.options.requestHeaders;
      if (Object.isFunction(c.push)) {
        for (var b = 0, d = c.length; b < d; b += 2) {
          e[c[b]] = c[b + 1]
        }
      } else {
        $H(c).each(function(f) {
          e[f.key] = f.value
        })
      }
    }
    for (var a in e) {
      if (e[a] != null) {
        this.transport.setRequestHeader(a, e[a])
      }
    }
  },
  success: function() {
    var a = this.getStatus();
    return !a || (a >= 200 && a < 300) || a == 304
  },
  getStatus: function() {
    try {
      if (this.transport.status === 1223) {
        return 204
      }
      return this.transport.status || 0
    } catch (a) {
      return 0
    }
  },
  respondToReadyState: function(a) {
    var c = Ajax.Request.Events[a],
      b = new Ajax.Response(this);
    if (c == "Complete") {
      try {
        this._complete = true;
        (this.options["on" + b.status] || this.options["on" + (this.success() ? "Success" : "Failure")] || Prototype.emptyFunction)(b, b.headerJSON)
      } catch (d) {
        this.dispatchException(d)
      }
      var f = b.getHeader("Content-type");
      if (this.options.evalJS == "force" || (this.options.evalJS && this.isSameOrigin() && f && f.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i))) {
        this.evalResponse()
      }
    }
    try {
      (this.options["on" + c] || Prototype.emptyFunction)(b, b.headerJSON);
      Ajax.Responders.dispatch("on" + c, this, b, b.headerJSON)
    } catch (d) {
      this.dispatchException(d)
    }
    if (c == "Complete") {
      this.transport.onreadystatechange = Prototype.emptyFunction
    }
  },
  isSameOrigin: function() {
    var a = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !a || (a[0] == "#{protocol}//#{domain}#{port}".interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ":" + location.port : ""
    }))
  },
  getHeader: function(a) {
    try {
      return this.transport.getResponseHeader(a) || null
    } catch (b) {
      return null
    }
  },
  evalResponse: function() {
    try {
      return eval((this.transport.responseText || "").unfilterJSON())
    } catch (e) {
      this.dispatchException(e)
    }
  },
  dispatchException: function(a) {
    (this.options.onException || Prototype.emptyFunction)(this, a);
    Ajax.Responders.dispatch("onException", this, a)
  }
});
Ajax.Request.Events = ["Uninitialized", "Loading", "Loaded", "Interactive", "Complete"];
Ajax.Response = Class.create({
  initialize: function(c) {
    this.request = c;
    var d = this.transport = c.transport,
      a = this.readyState = d.readyState;
    if ((a > 2 && !Prototype.Browser.IE) || a == 4) {
      this.status = this.getStatus();
      this.statusText = this.getStatusText();
      this.responseText = String.interpret(d.responseText);
      this.headerJSON = this._getHeaderJSON()
    }
    if (a == 4) {
      var b = d.responseXML;
      this.responseXML = Object.isUndefined(b) ? null : b;
      this.responseJSON = this._getResponseJSON()
    }
  },
  status: 0,
  statusText: "",
  getStatus: Ajax.Request.prototype.getStatus,
  getStatusText: function() {
    try {
      return this.transport.statusText || ""
    } catch (a) {
      return ""
    }
  },
  getHeader: Ajax.Request.prototype.getHeader,
  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders()
    } catch (a) {
      return null
    }
  },
  getResponseHeader: function(a) {
    return this.transport.getResponseHeader(a)
  },
  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders()
  },
  _getHeaderJSON: function() {
    var a = this.getHeader("X-JSON");
    if (!a) {
      return null
    }
    try {
      a = decodeURIComponent(escape(a))
    } catch (b) {}
    try {
      return a.evalJSON(this.request.options.sanitizeJSON || !this.request.isSameOrigin())
    } catch (b) {
      this.request.dispatchException(b)
    }
  },
  _getResponseJSON: function() {
    var a = this.request.options;
    if (!a.evalJSON || (a.evalJSON != "force" && !(this.getHeader("Content-type") || "").include("application/json")) || this.responseText.blank()) {
      return null
    }
    try {
      return this.responseText.evalJSON(a.sanitizeJSON || !this.request.isSameOrigin())
    } catch (b) {
      this.request.dispatchException(b)
    }
  }
});
Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, a, c, b) {
    this.container = {
      success: (a.success || a),
      failure: (a.failure || (a.success ? null : a))
    };
    b = Object.clone(b);
    var d = b.onComplete;
    b.onComplete = (function(e, f) {
      this.updateContent(e.responseText);
      if (Object.isFunction(d)) {
        d(e, f)
      }
    }).bind(this);
    $super(c, b)
  },
  updateContent: function(d) {
    var c = this.container[this.success() ? "success" : "failure"],
      a = this.options;
    if (!a.evalScripts) {
      d = d.stripScripts()
    }
    if (c = $(c)) {
      if (a.insertion) {
        if (Object.isString(a.insertion)) {
          var b = {};
          b[a.insertion] = d;
          c.insert(b)
        } else {
          a.insertion(c, d)
        }
      } else {
        c.update(d)
      }
    }
  }
});
Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, a, c, b) {
    $super(b);
    this.onComplete = this.options.onComplete;
    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);
    this.updater = {};
    this.container = a;
    this.url = c;
    this.start()
  },
  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent()
  },
  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments)
  },
  updateComplete: function(a) {
    if (this.options.decay) {
      this.decay = (a.responseText == this.lastText ? this.decay * this.options.decay : 1);
      this.lastText = a.responseText
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency)
  },
  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options)
  }
});
(function(a8) {
  var aE;
  var a1 = Array.prototype.slice;
  var av = document.createElement("div");

  function aZ(bp) {
    if (arguments.length > 1) {
      for (var F = 0, br = [], bq = arguments.length; F < bq; F++) {
        br.push(aZ(arguments[F]))
      }
      return br
    }
    if (Object.isString(bp)) {
      bp = document.getElementById(bp)
    }
    return aF.extend(bp)
  }
  a8.$ = aZ;
  if (!a8.Node) {
    a8.Node = {}
  }
  if (!a8.Node.ELEMENT_NODE) {
    Object.extend(a8.Node, {
      ELEMENT_NODE: 1,
      ATTRIBUTE_NODE: 2,
      TEXT_NODE: 3,
      CDATA_SECTION_NODE: 4,
      ENTITY_REFERENCE_NODE: 5,
      ENTITY_NODE: 6,
      PROCESSING_INSTRUCTION_NODE: 7,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
      DOCUMENT_TYPE_NODE: 10,
      DOCUMENT_FRAGMENT_NODE: 11,
      NOTATION_NODE: 12
    })
  }
  var r = {};

  function aQ(F, i) {
    if (F === "select") {
      return false
    }
    if ("type" in i) {
      return false
    }
    return true
  }
  var d = (function() {
    try {
      var i = document.createElement('<input name="x">');
      return i.tagName.toLowerCase() === "input" && i.name === "x"
    } catch (F) {
      return false
    }
  })();
  var aI = a8.Element;

  function aF(F, i) {
    i = i || {};
    F = F.toLowerCase();
    if (d && i.name) {
      F = "<" + F + ' name="' + i.name + '">';
      delete i.name;
      return aF.writeAttribute(document.createElement(F), i)
    }
    if (!r[F]) {
      r[F] = aF.extend(document.createElement(F))
    }
    var bp = aQ(F, i) ? r[F].cloneNode(false) : document.createElement(F);
    return aF.writeAttribute(bp, i)
  }
  a8.Element = aF;
  Object.extend(a8.Element, aI || {});
  if (aI) {
    a8.Element.prototype = aI.prototype
  }
  aF.Methods = {
    ByTag: {},
    Simulated: {}
  };
  var a3 = {};
  var H = {
    id: "id",
    className: "class"
  };

  function ba(F) {
    F = aZ(F);
    var i = "<" + F.tagName.toLowerCase();
    var bp, br;
    for (var bq in H) {
      bp = H[bq];
      br = (F[bq] || "").toString();
      if (br) {
        i += " " + bp + "=" + br.inspect(true)
      }
    }
    return i + ">"
  }
  a3.inspect = ba;

  function v(i) {
    return aZ(i).getStyle("display") !== "none"
  }

  function ax(F, i) {
    F = aZ(F);
    if (typeof i !== "boolean") {
      i = !aF.visible(F)
    }
    aF[i ? "show" : "hide"](F);
    return F
  }

  function aH(i) {
    i = aZ(i);
    i.style.display = "none";
    return i
  }

  function j(i) {
    i = aZ(i);
    i.style.display = "";
    return i
  }
  Object.extend(a3, {
    visible: v,
    toggle: ax,
    hide: aH,
    show: j
  });

  function ad(i) {
    i = aZ(i);
    i.parentNode.removeChild(i);
    return i
  }
  var aT = (function() {
    var i = document.createElement("select"),
      F = true;
    i.innerHTML = '<option value="test">test</option>';
    if (i.options && i.options[0]) {
      F = i.options[0].nodeName.toUpperCase() !== "OPTION"
    }
    i = null;
    return F
  })();
  var I = (function() {
    try {
      var i = document.createElement("table");
      if (i && i.tBodies) {
        i.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
        var bp = typeof i.tBodies[0] == "undefined";
        i = null;
        return bp
      }
    } catch (F) {
      return true
    }
  })();
  var a2 = (function() {
    try {
      var i = document.createElement("div");
      i.innerHTML = "<link />";
      var bp = (i.childNodes.length === 0);
      i = null;
      return bp
    } catch (F) {
      return true
    }
  })();
  var x = aT || I || a2;
  var aq = (function() {
    var i = document.createElement("script"),
      bp = false;
    try {
      i.appendChild(document.createTextNode(""));
      bp = !i.firstChild || i.firstChild && i.firstChild.nodeType !== 3
    } catch (F) {
      bp = true
    }
    i = null;
    return bp
  })();

  function O(br, bt) {
    br = aZ(br);
    var bu = br.getElementsByTagName("*"),
      bq = bu.length;
    while (bq--) {
      Z(bu[bq])
    }
    if (bt && bt.toElement) {
      bt = bt.toElement()
    }
    if (Object.isElement(bt)) {
      return br.update().insert(bt)
    }
    bt = Object.toHTML(bt);
    var bp = br.tagName.toUpperCase();
    if (bp === "SCRIPT" && aq) {
      br.text = bt;
      return br
    }
    if (x) {
      if (bp in L.tags) {
        while (br.firstChild) {
          br.removeChild(br.firstChild)
        }
        var F = t(bp, bt.stripScripts());
        for (var bq = 0, bs; bs = F[bq]; bq++) {
          br.appendChild(bs)
        }
      } else {
        if (a2 && Object.isString(bt) && bt.indexOf("<link") > -1) {
          while (br.firstChild) {
            br.removeChild(br.firstChild)
          }
          var F = t(bp, bt.stripScripts(), true);
          for (var bq = 0, bs; bs = F[bq]; bq++) {
            br.appendChild(bs)
          }
        } else {
          br.innerHTML = bt.stripScripts()
        }
      }
    } else {
      br.innerHTML = bt.stripScripts()
    }
    bt.evalScripts.bind(bt).defer();
    return br
  }

  function ah(F, bp) {
    F = aZ(F);
    if (bp && bp.toElement) {
      bp = bp.toElement()
    } else {
      if (!Object.isElement(bp)) {
        bp = Object.toHTML(bp);
        var i = F.ownerDocument.createRange();
        i.selectNode(F);
        bp.evalScripts.bind(bp).defer();
        bp = i.createContextualFragment(bp.stripScripts())
      }
    }
    F.parentNode.replaceChild(bp, F);
    return F
  }
  var L = {
    before: function(i, F) {
      i.parentNode.insertBefore(F, i)
    },
    top: function(i, F) {
      i.insertBefore(F, i.firstChild)
    },
    bottom: function(i, F) {
      i.appendChild(F)
    },
    after: function(i, F) {
      i.parentNode.insertBefore(F, i.nextSibling)
    },
    tags: {
      TABLE: ["<table>", "</table>", 1],
      TBODY: ["<table><tbody>", "</tbody></table>", 2],
      TR: ["<table><tbody><tr>", "</tr></tbody></table>", 3],
      TD: ["<table><tbody><tr><td>", "</td></tr></tbody></table>", 4],
      SELECT: ["<select>", "</select>", 1]
    }
  };
  var aJ = L.tags;
  Object.extend(aJ, {
    THEAD: aJ.TBODY,
    TFOOT: aJ.TBODY,
    TH: aJ.TD
  });

  function ao(bp, bs) {
    bp = aZ(bp);
    if (bs && bs.toElement) {
      bs = bs.toElement()
    }
    if (Object.isElement(bs)) {
      bp.parentNode.replaceChild(bs, bp);
      return bp
    }
    bs = Object.toHTML(bs);
    var br = bp.parentNode,
      F = br.tagName.toUpperCase();
    if (F in L.tags) {
      var bt = aF.next(bp);
      var i = t(F, bs.stripScripts());
      br.removeChild(bp);
      var bq;
      if (bt) {
        bq = function(bu) {
          br.insertBefore(bu, bt)
        }
      } else {
        bq = function(bu) {
          br.appendChild(bu)
        }
      }
      i.each(bq)
    } else {
      bp.outerHTML = bs.stripScripts()
    }
    bs.evalScripts.bind(bs).defer();
    return bp
  }
  if ("outerHTML" in document.documentElement) {
    ah = ao
  }

  function a7(i) {
    if (Object.isUndefined(i) || i === null) {
      return false
    }
    if (Object.isString(i) || Object.isNumber(i)) {
      return true
    }
    if (Object.isElement(i)) {
      return true
    }
    if (i.toElement || i.toHTML) {
      return true
    }
    return false
  }

  function bn(br, bt, F) {
    F = F.toLowerCase();
    var bv = L[F];
    if (bt && bt.toElement) {
      bt = bt.toElement()
    }
    if (Object.isElement(bt)) {
      bv(br, bt);
      return br
    }
    bt = Object.toHTML(bt);
    var bq = ((F === "before" || F === "after") ? br.parentNode : br).tagName.toUpperCase();
    var bu = t(bq, bt.stripScripts());
    if (F === "top" || F === "after") {
      bu.reverse()
    }
    for (var bp = 0, bs; bs = bu[bp]; bp++) {
      bv(br, bs)
    }
    bt.evalScripts.bind(bt).defer()
  }

  function Q(F, bp) {
    F = aZ(F);
    if (a7(bp)) {
      bp = {
        bottom: bp
      }
    }
    for (var i in bp) {
      bn(F, bp[i], i)
    }
    return F
  }

  function u(F, bp, i) {
    F = aZ(F);
    if (Object.isElement(bp)) {
      aZ(bp).writeAttribute(i || {})
    } else {
      if (Object.isString(bp)) {
        bp = new aF(bp, i)
      } else {
        bp = new aF("div", bp)
      }
    }
    if (F.parentNode) {
      F.parentNode.replaceChild(bp, F)
    }
    bp.appendChild(F);
    return bp
  }

  function w(F) {
    F = aZ(F);
    var bp = F.firstChild;
    while (bp) {
      var i = bp.nextSibling;
      if (bp.nodeType === Node.TEXT_NODE && !/\S/.test(bp.nodeValue)) {
        F.removeChild(bp)
      }
      bp = i
    }
    return F
  }

  function a4(i) {
    return aZ(i).innerHTML.blank()
  }

  function t(bs, br, bt) {
    var bq = L.tags[bs],
      bu = av;
    var F = !!bq;
    if (!F && bt) {
      F = true;
      bq = ["", "", 0]
    }
    if (F) {
      bu.innerHTML = "&#160;" + bq[0] + br + bq[1];
      bu.removeChild(bu.firstChild);
      for (var bp = bq[2]; bp--;) {
        bu = bu.firstChild
      }
    } else {
      bu.innerHTML = br
    }
    return $A(bu.childNodes)
  }

  function E(bq, F) {
    if (!(bq = aZ(bq))) {
      return
    }
    var bs = bq.cloneNode(F);
    if (!aY) {
      bs._prototypeUID = aE;
      if (F) {
        var br = aF.select(bs, "*"),
          bp = br.length;
        while (bp--) {
          br[bp]._prototypeUID = aE
        }
      }
    }
    return aF.extend(bs)
  }

  function Z(F) {
    var i = M(F);
    if (i) {
      aF.stopObserving(F);
      if (!aY) {
        F._prototypeUID = aE
      }
      delete aF.Storage[i]
    }
  }

  function bl(bp) {
    var F = bp.length;
    while (F--) {
      Z(bp[F])
    }
  }

  function at(br) {
    var bq = br.length,
      bp, F;
    while (bq--) {
      bp = br[bq];
      F = M(bp);
      delete aF.Storage[F];
      delete Event.cache[F]
    }
  }
  if (aY) {
    bl = at
  }

  function m(bp) {
    if (!(bp = aZ(bp))) {
      return
    }
    Z(bp);
    var bq = bp.getElementsByTagName("*"),
      F = bq.length;
    while (F--) {
      Z(bq[F])
    }
    return null
  }
  Object.extend(a3, {
    remove: ad,
    update: O,
    replace: ah,
    insert: Q,
    wrap: u,
    cleanWhitespace: w,
    empty: a4,
    clone: E,
    purge: m
  });

  function am(i, bp, bq) {
    i = aZ(i);
    bq = bq || -1;
    var F = [];
    while (i = i[bp]) {
      if (i.nodeType === Node.ELEMENT_NODE) {
        F.push(aF.extend(i))
      }
      if (F.length === bq) {
        break
      }
    }
    return F
  }

  function aL(i) {
    return am(i, "parentNode")
  }

  function bm(i) {
    return aF.select(i, "*")
  }

  function X(i) {
    i = aZ(i).firstChild;
    while (i && i.nodeType !== Node.ELEMENT_NODE) {
      i = i.nextSibling
    }
    return aZ(i)
  }

  function bi(F) {
    var i = [],
      bp = aZ(F).firstChild;
    while (bp) {
      if (bp.nodeType === Node.ELEMENT_NODE) {
        i.push(aF.extend(bp))
      }
      bp = bp.nextSibling
    }
    return i
  }

  function p(i) {
    return am(i, "previousSibling")
  }

  function bh(i) {
    return am(i, "nextSibling")
  }

  function aV(i) {
    i = aZ(i);
    var bp = p(i),
      F = bh(i);
    return bp.reverse().concat(F)
  }

  function aR(F, i) {
    F = aZ(F);
    if (Object.isString(i)) {
      return Prototype.Selector.match(F, i)
    }
    return i.match(F)
  }

  function aW(F, bp, bq, i) {
    F = aZ(F), bq = bq || 0, i = i || 0;
    if (Object.isNumber(bq)) {
      i = bq, bq = null
    }
    while (F = F[bp]) {
      if (F.nodeType !== 1) {
        continue
      }
      if (bq && !Prototype.Selector.match(F, bq)) {
        continue
      }
      if (--i >= 0) {
        continue
      }
      return aF.extend(F)
    }
  }

  function aa(F, bp, i) {
    F = aZ(F);
    if (arguments.length === 1) {
      return aZ(F.parentNode)
    }
    return aW(F, "parentNode", bp, i)
  }

  function y(F, bq, i) {
    if (arguments.length === 1) {
      return X(F)
    }
    F = aZ(F), bq = bq || 0, i = i || 0;
    if (Object.isNumber(bq)) {
      i = bq, bq = "*"
    }
    var bp = Prototype.Selector.select(bq, F)[i];
    return aF.extend(bp)
  }

  function h(F, bp, i) {
    return aW(F, "previousSibling", bp, i)
  }

  function aB(F, bp, i) {
    return aW(F, "nextSibling", bp, i)
  }

  function bb(i) {
    i = aZ(i);
    var F = a1.call(arguments, 1).join(", ");
    return Prototype.Selector.select(F, i)
  }

  function aD(bq) {
    bq = aZ(bq);
    var bs = a1.call(arguments, 1).join(", ");
    var bt = aF.siblings(bq),
      bp = [];
    for (var F = 0, br; br = bt[F]; F++) {
      if (Prototype.Selector.match(br, bs)) {
        bp.push(br)
      }
    }
    return bp
  }

  function D(F, i) {
    F = aZ(F), i = aZ(i);
    if (!F || !i) {
      return false
    }
    while (F = F.parentNode) {
      if (F === i) {
        return true
      }
    }
    return false
  }

  function B(F, i) {
    F = aZ(F), i = aZ(i);
    if (!F || !i) {
      return false
    }
    if (!i.contains) {
      return D(F, i)
    }
    return i.contains(F) && i !== F
  }

  function J(F, i) {
    F = aZ(F), i = aZ(i);
    if (!F || !i) {
      return false
    }
    return (F.compareDocumentPosition(i) & 8) === 8
  }
  var aM;
  if (av.compareDocumentPosition) {
    aM = J
  } else {
    if (av.contains) {
      aM = B
    } else {
      aM = D
    }
  }
  Object.extend(a3, {
    recursivelyCollect: am,
    ancestors: aL,
    descendants: bm,
    firstDescendant: X,
    immediateDescendants: bi,
    previousSiblings: p,
    nextSiblings: bh,
    siblings: aV,
    match: aR,
    up: aa,
    down: y,
    previous: h,
    next: aB,
    select: bb,
    adjacent: aD,
    descendantOf: aM,
    getElementsBySelector: bb,
    childElements: bi
  });
  var T = 1;

  function aU(i) {
    i = aZ(i);
    var F = aF.readAttribute(i, "id");
    if (F) {
      return F
    }
    do {
      F = "anonymous_element_" + T++
    } while (aZ(F));
    aF.writeAttribute(i, "id", F);
    return F
  }

  function a9(F, i) {
    return aZ(F).getAttribute(i)
  }

  function K(F, i) {
    F = aZ(F);
    var bp = aG.read;
    if (bp.values[i]) {
      return bp.values[i](F, i)
    }
    if (bp.names[i]) {
      i = bp.names[i]
    }
    if (i.include(":")) {
      if (!F.attributes || !F.attributes[i]) {
        return null
      }
      return F.attributes[i].value
    }
    return F.getAttribute(i)
  }

  function e(F, i) {
    if (i === "title") {
      return F.title
    }
    return F.getAttribute(i)
  }
  var U = (function() {
    av.setAttribute("onclick", []);
    var i = av.getAttribute("onclick");
    var F = Object.isArray(i);
    av.removeAttribute("onclick");
    return F
  })();
  if (U) {
    a9 = K
  } else {
    if (Prototype.Browser.Opera) {
      a9 = e
    }
  }

  function a0(bq, bp, bs) {
    bq = aZ(bq);
    var F = {},
      br = aG.write;
    if (typeof bp === "object") {
      F = bp
    } else {
      F[bp] = Object.isUndefined(bs) ? true : bs
    }
    for (var i in F) {
      bp = br.names[i] || i;
      bs = F[i];
      if (br.values[i]) {
        bs = br.values[i](bq, bs);
        if (Object.isUndefined(bs)) {
          continue
        }
      }
      if (bs === false || bs === null) {
        bq.removeAttribute(bp)
      } else {
        if (bs === true) {
          bq.setAttribute(bp, bp)
        } else {
          bq.setAttribute(bp, bs)
        }
      }
    }
    return bq
  }
  var a = (function() {
    if (!d) {
      return false
    }
    var F = document.createElement('<input type="checkbox">');
    F.checked = true;
    var i = F.getAttributeNode("checked");
    return !i || !i.specified
  })();

  function Y(i, bp) {
    bp = aG.has[bp] || bp;
    var F = aZ(i).getAttributeNode(bp);
    return !!(F && F.specified)
  }

  function bg(i, F) {
    if (F === "checked") {
      return i.checked
    }
    return Y(i, F)
  }
  a8.Element.Methods.Simulated.hasAttribute = a ? bg : Y;

  function k(i) {
    return new aF.ClassNames(i)
  }
  var V = {};

  function f(F) {
    if (V[F]) {
      return V[F]
    }
    var i = new RegExp("(^|\\s+)" + F + "(\\s+|$)");
    V[F] = i;
    return i
  }

  function al(i, F) {
    if (!(i = aZ(i))) {
      return
    }
    var bp = i.className;
    if (bp.length === 0) {
      return false
    }
    if (bp === F) {
      return true
    }
    return f(F).test(bp)
  }

  function o(i, F) {
    if (!(i = aZ(i))) {
      return
    }
    if (!al(i, F)) {
      i.className += (i.className ? " " : "") + F
    }
    return i
  }

  function au(i, F) {
    if (!(i = aZ(i))) {
      return
    }
    i.className = i.className.replace(f(F), " ").strip();
    return i
  }

  function ae(F, bp, i) {
    if (!(F = aZ(F))) {
      return
    }
    if (Object.isUndefined(i)) {
      i = !al(F, bp)
    }
    var bq = aF[i ? "addClassName" : "removeClassName"];
    return bq(F, bp)
  }
  var aG = {};
  var aP = "className",
    ar = "for";
  av.setAttribute(aP, "x");
  if (av.className !== "x") {
    av.setAttribute("class", "x");
    if (av.className === "x") {
      aP = "class"
    }
  }
  var aK = document.createElement("label");
  aK.setAttribute(ar, "x");
  if (aK.htmlFor !== "x") {
    aK.setAttribute("htmlFor", "x");
    if (aK.htmlFor === "x") {
      ar = "htmlFor"
    }
  }
  aK = null;

  function ac(i, F) {
    return i.getAttribute(F)
  }

  function g(i, F) {
    return i.getAttribute(F, 2)
  }

  function A(i, bp) {
    var F = i.getAttributeNode(bp);
    return F ? F.value : ""
  }

  function bj(i, F) {
    return aZ(i).hasAttribute(F) ? F : null
  }
  av.onclick = Prototype.emptyFunction;
  var P = av.getAttribute("onclick");
  var aw;
  if (String(P).indexOf("{") > -1) {
    aw = function(i, F) {
      var bp = i.getAttribute(F);
      if (!bp) {
        return null
      }
      bp = bp.toString();
      bp = bp.split("{")[1];
      bp = bp.split("}")[0];
      return bp.strip()
    }
  } else {
    if (P === "") {
      aw = function(i, F) {
        var bp = i.getAttribute(F);
        if (!bp) {
          return null
        }
        return bp.strip()
      }
    }
  }
  aG.read = {
    names: {
      "class": aP,
      className: aP,
      "for": ar,
      htmlFor: ar
    },
    values: {
      style: function(i) {
        return i.style.cssText.toLowerCase()
      },
      title: function(i) {
        return i.title
      }
    }
  };
  aG.write = {
    names: {
      className: "class",
      htmlFor: "for",
      cellpadding: "cellPadding",
      cellspacing: "cellSpacing"
    },
    values: {
      checked: function(i, F) {
        F = !!F;
        i.checked = F;
        return F ? "checked" : null
      },
      style: function(i, F) {
        i.style.cssText = F ? F : ""
      }
    }
  };
  aG.has = {
    names: {}
  };
  Object.extend(aG.write.names, aG.read.names);
  var a6 = $w("colSpan rowSpan vAlign dateTime accessKey tabIndex encType maxLength readOnly longDesc frameBorder");
  for (var af = 0, ag; ag = a6[af]; af++) {
    aG.write.names[ag.toLowerCase()] = ag;
    aG.has.names[ag.toLowerCase()] = ag
  }
  Object.extend(aG.read.values, {
    href: g,
    src: g,
    type: ac,
    action: A,
    disabled: bj,
    checked: bj,
    readonly: bj,
    multiple: bj,
    onload: aw,
    onunload: aw,
    onclick: aw,
    ondblclick: aw,
    onmousedown: aw,
    onmouseup: aw,
    onmouseover: aw,
    onmousemove: aw,
    onmouseout: aw,
    onfocus: aw,
    onblur: aw,
    onkeypress: aw,
    onkeydown: aw,
    onkeyup: aw,
    onsubmit: aw,
    onreset: aw,
    onselect: aw,
    onchange: aw
  });
  Object.extend(a3, {
    identify: aU,
    readAttribute: a9,
    writeAttribute: a0,
    classNames: k,
    hasClassName: al,
    addClassName: o,
    removeClassName: au,
    toggleClassName: ae
  });

  function W(i) {
    if (i === "float" || i === "styleFloat") {
      return "cssFloat"
    }
    return i.camelize()
  }

  function bo(i) {
    if (i === "float" || i === "cssFloat") {
      return "styleFloat"
    }
    return i.camelize()
  }

  function C(bp, bq) {
    bp = aZ(bp);
    var bt = bp.style,
      F;
    if (Object.isString(bq)) {
      bt.cssText += ";" + bq;
      if (bq.include("opacity")) {
        var i = bq.match(/opacity:\s*(\d?\.?\d*)/)[1];
        aF.setOpacity(bp, i)
      }
      return bp
    }
    for (var bs in bq) {
      if (bs === "opacity") {
        aF.setOpacity(bp, bq[bs])
      } else {
        var br = bq[bs];
        if (bs === "float" || bs === "cssFloat") {
          bs = Object.isUndefined(bt.styleFloat) ? "cssFloat" : "styleFloat"
        }
        bt[bs] = br
      }
    }
    return bp
  }

  function aO(F, bp) {
    F = aZ(F);
    bp = W(bp);
    var bq = F.style[bp];
    if (!bq || bq === "auto") {
      var i = document.defaultView.getComputedStyle(F, null);
      bq = i ? i[bp] : null
    }
    if (bp === "opacity") {
      return bq ? parseFloat(bq) : 1
    }
    return bq === "auto" ? null : bq
  }

  function s(i, F) {
    switch (F) {
      case "height":
      case "width":
        if (!aF.visible(i)) {
          return null
        }
        var bp = parseInt(aO(i, F), 10);
        if (bp !== i["offset" + F.capitalize()]) {
          return bp + "px"
        }
        return aF.measure(i, F);
      default:
        return aO(i, F)
    }
  }

  function aj(i, F) {
    i = aZ(i);
    F = bo(F);
    var bp = i.style[F];
    if (!bp && i.currentStyle) {
      bp = i.currentStyle[F]
    }
    if (F === "opacity") {
      if (!N) {
        return be(i)
      } else {
        return bp ? parseFloat(bp) : 1
      }
    }
    if (bp === "auto") {
      if ((F === "width" || F === "height") && aF.visible(i)) {
        return aF.measure(i, F) + "px"
      }
      return null
    }
    return bp
  }

  function aA(i) {
    return (i || "").replace(/alpha\([^\)]*\)/gi, "")
  }

  function ab(i) {
    if (!i.currentStyle || !i.currentStyle.hasLayout) {
      i.style.zoom = 1
    }
    return i
  }
  var N = (function() {
    av.style.cssText = "opacity:.55";
    return /^0.55/.test(av.style.opacity)
  })();

  function z(i, F) {
    i = aZ(i);
    if (F == 1 || F === "") {
      F = ""
    } else {
      if (F < 0.00001) {
        F = 0
      }
    }
    i.style.opacity = F;
    return i
  }

  function bf(i, bq) {
    if (N) {
      return z(i, bq)
    }
    i = ab(aZ(i));
    var bp = aF.getStyle(i, "filter"),
      F = i.style;
    if (bq == 1 || bq === "") {
      bp = aA(bp);
      if (bp) {
        F.filter = bp
      } else {
        F.removeAttribute("filter")
      }
      return i
    }
    if (bq < 0.00001) {
      bq = 0
    }
    F.filter = aA(bp) + " alpha(opacity=" + (bq * 100) + ")";
    return i
  }

  function bd(i) {
    return aF.getStyle(i, "opacity")
  }

  function be(F) {
    if (N) {
      return bd(F)
    }
    var bp = aF.getStyle(F, "filter");
    if (bp.length === 0) {
      return 1
    }
    var i = (bp || "").match(/alpha\(opacity=(.*)\)/i);
    if (i && i[1]) {
      return parseFloat(i[1]) / 100
    }
    return 1
  }
  Object.extend(a3, {
    setStyle: C,
    getStyle: aO,
    setOpacity: z,
    getOpacity: bd
  });
  if ("styleFloat" in av.style) {
    a3.getStyle = aj;
    a3.setOpacity = bf;
    a3.getOpacity = be
  }
  var l = 0;
  a8.Element.Storage = {
    UID: 1
  };

  function M(i) {
    if (i === window) {
      return 0
    }
    if (typeof i._prototypeUID === "undefined") {
      i._prototypeUID = aF.Storage.UID++
    }
    return i._prototypeUID
  }

  function c(i) {
    if (i === window) {
      return 0
    }
    if (i == document) {
      return 1
    }
    return i.uniqueID
  }
  var aY = ("uniqueID" in av);
  if (aY) {
    M = c
  }

  function b(F) {
    if (!(F = aZ(F))) {
      return
    }
    var i = M(F);
    if (!aF.Storage[i]) {
      aF.Storage[i] = $H()
    }
    return aF.Storage[i]
  }

  function a5(F, i, bp) {
    if (!(F = aZ(F))) {
      return
    }
    var bq = b(F);
    if (arguments.length === 2) {
      bq.update(i)
    } else {
      bq.set(i, bp)
    }
    return F
  }

  function aN(bp, F, i) {
    if (!(bp = aZ(bp))) {
      return
    }
    var br = b(bp),
      bq = br.get(F);
    if (Object.isUndefined(bq)) {
      br.set(F, i);
      bq = i
    }
    return bq
  }
  Object.extend(a3, {
    getStorage: b,
    store: a5,
    retrieve: aN
  });
  var an = {},
    aX = aF.Methods.ByTag,
    aC = Prototype.BrowserFeatures;
  if (!aC.ElementExtensions && ("__proto__" in av)) {
    a8.HTMLElement = {};
    a8.HTMLElement.prototype = av.__proto__;
    aC.ElementExtensions = true
  }

  function bc(i) {
    if (typeof window.Element === "undefined") {
      return false
    }
    if (!d) {
      return false
    }
    var bp = window.Element.prototype;
    if (bp) {
      var br = "_" + (Math.random() + "").slice(2),
        F = document.createElement(i);
      bp[br] = "x";
      var bq = (F[br] !== "x");
      delete bp[br];
      F = null;
      return bq
    }
    return false
  }
  var ap = bc("object");

  function ak(F, i) {
    for (var bq in i) {
      var bp = i[bq];
      if (Object.isFunction(bp) && !(bq in F)) {
        F[bq] = bp.methodize()
      }
    }
  }
  var bk = {};

  function ay(F) {
    var i = M(F);
    return (i in bk)
  }

  function az(bp) {
    if (!bp || ay(bp)) {
      return bp
    }
    if (bp.nodeType !== Node.ELEMENT_NODE || bp == window) {
      return bp
    }
    var i = Object.clone(an),
      F = bp.tagName.toUpperCase();
    if (aX[F]) {
      Object.extend(i, aX[F])
    }
    ak(bp, i);
    bk[M(bp)] = true;
    return bp
  }

  function aS(F) {
    if (!F || ay(F)) {
      return F
    }
    var i = F.tagName;
    if (i && (/^(?:object|applet|embed)$/i.test(i))) {
      ak(F, aF.Methods);
      ak(F, aF.Methods.Simulated);
      ak(F, aF.Methods.ByTag[i.toUpperCase()])
    }
    return F
  }
  if (aC.SpecificElementExtensions) {
    az = ap ? aS : Prototype.K
  }

  function S(F, i) {
    F = F.toUpperCase();
    if (!aX[F]) {
      aX[F] = {}
    }
    Object.extend(aX[F], i)
  }

  function q(F, bp, i) {
    if (Object.isUndefined(i)) {
      i = false
    }
    for (var br in bp) {
      var bq = bp[br];
      if (!Object.isFunction(bq)) {
        continue
      }
      if (!i || !(br in F)) {
        F[br] = bq.methodize()
      }
    }
  }

  function ai(bq) {
    var i;
    var bp = {
      OPTGROUP: "OptGroup",
      TEXTAREA: "TextArea",
      P: "Paragraph",
      FIELDSET: "FieldSet",
      UL: "UList",
      OL: "OList",
      DL: "DList",
      DIR: "Directory",
      H1: "Heading",
      H2: "Heading",
      H3: "Heading",
      H4: "Heading",
      H5: "Heading",
      H6: "Heading",
      Q: "Quote",
      INS: "Mod",
      DEL: "Mod",
      A: "Anchor",
      IMG: "Image",
      CAPTION: "TableCaption",
      COL: "TableCol",
      COLGROUP: "TableCol",
      THEAD: "TableSection",
      TFOOT: "TableSection",
      TBODY: "TableSection",
      TR: "TableRow",
      TH: "TableCell",
      TD: "TableCell",
      FRAMESET: "FrameSet",
      IFRAME: "IFrame"
    };
    if (bp[bq]) {
      i = "HTML" + bp[bq] + "Element"
    }
    if (window[i]) {
      return window[i]
    }
    i = "HTML" + bq + "Element";
    if (window[i]) {
      return window[i]
    }
    i = "HTML" + bq.capitalize() + "Element";
    if (window[i]) {
      return window[i]
    }
    var F = document.createElement(bq),
      br = F.__proto__ || F.constructor.prototype;
    F = null;
    return br
  }

  function R(br) {
    if (arguments.length === 0) {
      G()
    }
    if (arguments.length === 2) {
      var bt = br;
      br = arguments[1]
    }
    if (!bt) {
      Object.extend(aF.Methods, br || {})
    } else {
      if (Object.isArray(bt)) {
        for (var bs = 0, bq; bq = bt[bs]; bs++) {
          S(bq, br)
        }
      } else {
        S(bt, br)
      }
    }
    var bp = window.HTMLElement ? HTMLElement.prototype : aF.prototype;
    if (aC.ElementExtensions) {
      q(bp, aF.Methods);
      q(bp, aF.Methods.Simulated, true)
    }
    if (aC.SpecificElementExtensions) {
      for (var bq in aF.Methods.ByTag) {
        var F = ai(bq);
        if (Object.isUndefined(F)) {
          continue
        }
        q(F.prototype, aX[bq])
      }
    }
    Object.extend(aF, aF.Methods);
    Object.extend(aF, aF.Methods.Simulated);
    delete aF.ByTag;
    delete aF.Simulated;
    aF.extend.refresh();
    r = {}
  }
  Object.extend(a8.Element, {
    extend: az,
    addMethods: R
  });
  if (az === Prototype.K) {
    a8.Element.extend.refresh = Prototype.emptyFunction
  } else {
    a8.Element.extend.refresh = function() {
      if (Prototype.BrowserFeatures.ElementExtensions) {
        return
      }
      Object.extend(an, aF.Methods);
      Object.extend(an, aF.Methods.Simulated);
      bk = {}
    }
  }

  function G() {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(aF.Methods.ByTag, {
      FORM: Object.clone(Form.Methods),
      INPUT: Object.clone(Form.Element.Methods),
      SELECT: Object.clone(Form.Element.Methods),
      TEXTAREA: Object.clone(Form.Element.Methods),
      BUTTON: Object.clone(Form.Element.Methods)
    })
  }
  aF.addMethods(a3);

  function n() {
    av = null;
    r = null
  }
  if (window.attachEvent) {
    window.attachEvent("onunload", n)
  }
})(this);
(function() {
  function k(G) {
    var F = G.match(/^(\d+)%?$/i);
    if (!F) {
      return null
    }
    return (Number(F[1]) / 100)
  }

  function y(G, H) {
    G = $(G);
    var I = G.style[H];
    if (!I || I === "auto") {
      var F = document.defaultView.getComputedStyle(G, null);
      I = F ? F[H] : null
    }
    if (H === "opacity") {
      return I ? parseFloat(I) : 1
    }
    return I === "auto" ? null : I
  }

  function B(F, G) {
    var H = F.style[G];
    if (!H && F.currentStyle) {
      H = F.currentStyle[G]
    }
    return H
  }

  function r(H, G) {
    var J = H.offsetWidth;
    var L = u(H, "borderLeftWidth", G) || 0;
    var F = u(H, "borderRightWidth", G) || 0;
    var I = u(H, "paddingLeft", G) || 0;
    var K = u(H, "paddingRight", G) || 0;
    return J - L - F - I - K
  }
  if (!Object.isUndefined(document.documentElement.currentStyle) && !Prototype.Browser.Opera) {
    y = B
  }

  function u(P, Q, G) {
    var J = null;
    if (Object.isElement(P)) {
      J = P;
      P = y(J, Q)
    }
    if (P === null || Object.isUndefined(P)) {
      return null
    }
    if ((/^(?:-)?\d+(\.\d+)?(px)?$/i).test(P)) {
      return window.parseFloat(P)
    }
    var K = P.include("%"),
      H = (G === document.viewport);
    if (/\d/.test(P) && J && J.runtimeStyle && !(K && H)) {
      var F = J.style.left,
        O = J.runtimeStyle.left;
      J.runtimeStyle.left = J.currentStyle.left;
      J.style.left = P || 0;
      P = J.style.pixelLeft;
      J.style.left = F;
      J.runtimeStyle.left = O;
      return P
    }
    if (J && K) {
      G = G || J.parentNode;
      var I = k(P),
        L = null;
      var N = Q.include("left") || Q.include("right") || Q.include("width");
      var M = Q.include("top") || Q.include("bottom") || Q.include("height");
      if (G === document.viewport) {
        if (N) {
          L = document.viewport.getWidth()
        } else {
          if (M) {
            L = document.viewport.getHeight()
          }
        }
      } else {
        if (N) {
          L = $(G).measure("width")
        } else {
          if (M) {
            L = $(G).measure("height")
          }
        }
      }
      return (L === null) ? 0 : L * I
    }
    return 0
  }

  function j(F) {
    if (Object.isString(F) && F.endsWith("px")) {
      return F
    }
    return F + "px"
  }

  function m(F) {
    while (F && F.parentNode) {
      var G = F.getStyle("display");
      if (G === "none") {
        return false
      }
      F = $(F.parentNode)
    }
    return true
  }
  var g = Prototype.K;
  if ("currentStyle" in document.documentElement) {
    g = function(F) {
      if (!F.currentStyle.hasLayout) {
        F.style.zoom = 1
      }
      return F
    }
  }

  function i(F) {
    if (F.include("border")) {
      F = F + "-width"
    }
    return F.camelize()
  }
  Element.Layout = Class.create(Hash, {
    initialize: function($super, G, F) {
      $super();
      this.element = $(G);
      Element.Layout.PROPERTIES.each(function(H) {
        this._set(H, null)
      }, this);
      if (F) {
        this._preComputing = true;
        this._begin();
        Element.Layout.PROPERTIES.each(this._compute, this);
        this._end();
        this._preComputing = false
      }
    },
    _set: function(G, F) {
      return Hash.prototype.set.call(this, G, F)
    },
    set: function(G, F) {
      throw "Properties of Element.Layout are read-only."
    },
    get: function($super, G) {
      var F = $super(G);
      return F === null ? this._compute(G) : F
    },
    _begin: function() {
      if (this._isPrepared()) {
        return
      }
      var J = this.element;
      if (m(J)) {
        this._setPrepared(true);
        return
      }
      var L = {
        position: J.style.position || "",
        width: J.style.width || "",
        visibility: J.style.visibility || "",
        display: J.style.display || ""
      };
      J.store("prototype_original_styles", L);
      var M = y(J, "position"),
        F = J.offsetWidth;
      if (F === 0 || F === null) {
        J.style.display = "block";
        F = J.offsetWidth
      }
      var G = (M === "fixed") ? document.viewport : J.parentNode;
      var N = {
        visibility: "hidden",
        display: "block"
      };
      if (M !== "fixed") {
        N.position = "absolute"
      }
      J.setStyle(N);
      var H = J.offsetWidth,
        I;
      if (F && (H === F)) {
        I = r(J, G)
      } else {
        if (M === "absolute" || M === "fixed") {
          I = r(J, G)
        } else {
          var O = J.parentNode,
            K = $(O).getLayout();
          I = K.get("width") - this.get("margin-left") - this.get("border-left") - this.get("padding-left") - this.get("padding-right") - this.get("border-right") - this.get("margin-right")
        }
      }
      J.setStyle({
        width: I + "px"
      });
      this._setPrepared(true)
    },
    _end: function() {
      var G = this.element;
      var F = G.retrieve("prototype_original_styles");
      G.store("prototype_original_styles", null);
      G.setStyle(F);
      this._setPrepared(false)
    },
    _compute: function(G) {
      var F = Element.Layout.COMPUTATIONS;
      if (!(G in F)) {
        throw "Property not found."
      }
      return this._set(G, F[G].call(this, this.element))
    },
    _isPrepared: function() {
      return this.element.retrieve("prototype_element_layout_prepared", false)
    },
    _setPrepared: function(F) {
      return this.element.store("prototype_element_layout_prepared", F)
    },
    toObject: function() {
      var F = $A(arguments);
      var G = (F.length === 0) ? Element.Layout.PROPERTIES : F.join(" ").split(" ");
      var H = {};
      G.each(function(I) {
        if (!Element.Layout.PROPERTIES.include(I)) {
          return
        }
        var J = this.get(I);
        if (J != null) {
          H[I] = J
        }
      }, this);
      return H
    },
    toHash: function() {
      var F = this.toObject.apply(this, arguments);
      return new Hash(F)
    },
    toCSS: function() {
      var F = $A(arguments);
      var H = (F.length === 0) ? Element.Layout.PROPERTIES : F.join(" ").split(" ");
      var G = {};
      H.each(function(I) {
        if (!Element.Layout.PROPERTIES.include(I)) {
          return
        }
        if (Element.Layout.COMPOSITE_PROPERTIES.include(I)) {
          return
        }
        var J = this.get(I);
        if (J != null) {
          G[i(I)] = J + "px"
        }
      }, this);
      return G
    },
    inspect: function() {
      return "#<Element.Layout>"
    }
  });
  Object.extend(Element.Layout, {
    PROPERTIES: $w("height width top left right bottom border-left border-right border-top border-bottom padding-left padding-right padding-top padding-bottom margin-top margin-bottom margin-left margin-right padding-box-width padding-box-height border-box-width border-box-height margin-box-width margin-box-height"),
    COMPOSITE_PROPERTIES: $w("padding-box-width padding-box-height margin-box-width margin-box-height border-box-width border-box-height"),
    COMPUTATIONS: {
      height: function(H) {
        if (!this._preComputing) {
          this._begin()
        }
        var F = this.get("border-box-height");
        if (F <= 0) {
          if (!this._preComputing) {
            this._end()
          }
          return 0
        }
        var I = this.get("border-top"),
          G = this.get("border-bottom");
        var K = this.get("padding-top"),
          J = this.get("padding-bottom");
        if (!this._preComputing) {
          this._end()
        }
        return F - I - G - K - J
      },
      width: function(H) {
        if (!this._preComputing) {
          this._begin()
        }
        var G = this.get("border-box-width");
        if (G <= 0) {
          if (!this._preComputing) {
            this._end()
          }
          return 0
        }
        var K = this.get("border-left"),
          F = this.get("border-right");
        var I = this.get("padding-left"),
          J = this.get("padding-right");
        if (!this._preComputing) {
          this._end()
        }
        return G - K - F - I - J
      },
      "padding-box-height": function(G) {
        var F = this.get("height"),
          I = this.get("padding-top"),
          H = this.get("padding-bottom");
        return F + I + H
      },
      "padding-box-width": function(F) {
        var G = this.get("width"),
          H = this.get("padding-left"),
          I = this.get("padding-right");
        return G + H + I
      },
      "border-box-height": function(G) {
        if (!this._preComputing) {
          this._begin()
        }
        var F = G.offsetHeight;
        if (!this._preComputing) {
          this._end()
        }
        return F
      },
      "border-box-width": function(F) {
        if (!this._preComputing) {
          this._begin()
        }
        var G = F.offsetWidth;
        if (!this._preComputing) {
          this._end()
        }
        return G
      },
      "margin-box-height": function(G) {
        var F = this.get("border-box-height"),
          H = this.get("margin-top"),
          I = this.get("margin-bottom");
        if (F <= 0) {
          return 0
        }
        return F + H + I
      },
      "margin-box-width": function(H) {
        var G = this.get("border-box-width"),
          I = this.get("margin-left"),
          F = this.get("margin-right");
        if (G <= 0) {
          return 0
        }
        return G + I + F
      },
      top: function(F) {
        var G = F.positionedOffset();
        return G.top
      },
      bottom: function(F) {
        var I = F.positionedOffset(),
          G = F.getOffsetParent(),
          H = G.measure("height");
        var J = this.get("border-box-height");
        return H - J - I.top
      },
      left: function(F) {
        var G = F.positionedOffset();
        return G.left
      },
      right: function(H) {
        var J = H.positionedOffset(),
          I = H.getOffsetParent(),
          F = I.measure("width");
        var G = this.get("border-box-width");
        return F - G - J.left
      },
      "padding-top": function(F) {
        return u(F, "paddingTop")
      },
      "padding-bottom": function(F) {
        return u(F, "paddingBottom")
      },
      "padding-left": function(F) {
        return u(F, "paddingLeft")
      },
      "padding-right": function(F) {
        return u(F, "paddingRight")
      },
      "border-top": function(F) {
        return u(F, "borderTopWidth")
      },
      "border-bottom": function(F) {
        return u(F, "borderBottomWidth")
      },
      "border-left": function(F) {
        return u(F, "borderLeftWidth")
      },
      "border-right": function(F) {
        return u(F, "borderRightWidth")
      },
      "margin-top": function(F) {
        return u(F, "marginTop")
      },
      "margin-bottom": function(F) {
        return u(F, "marginBottom")
      },
      "margin-left": function(F) {
        return u(F, "marginLeft")
      },
      "margin-right": function(F) {
        return u(F, "marginRight")
      }
    }
  });
  if ("getBoundingClientRect" in document.documentElement) {
    Object.extend(Element.Layout.COMPUTATIONS, {
      right: function(G) {
        var H = g(G.getOffsetParent());
        var I = G.getBoundingClientRect(),
          F = H.getBoundingClientRect();
        return (F.right - I.right).round()
      },
      bottom: function(G) {
        var H = g(G.getOffsetParent());
        var I = G.getBoundingClientRect(),
          F = H.getBoundingClientRect();
        return (F.bottom - I.bottom).round()
      }
    })
  }
  Element.Offset = Class.create({
    initialize: function(G, F) {
      this.left = G.round();
      this.top = F.round();
      this[0] = this.left;
      this[1] = this.top
    },
    relativeTo: function(F) {
      return new Element.Offset(this.left - F.left, this.top - F.top)
    },
    inspect: function() {
      return "#<Element.Offset left: #{left} top: #{top}>".interpolate(this)
    },
    toString: function() {
      return "[#{left}, #{top}]".interpolate(this)
    },
    toArray: function() {
      return [this.left, this.top]
    }
  });

  function z(G, F) {
    return new Element.Layout(G, F)
  }

  function d(F, G) {
    return $(F).getLayout().get(G)
  }

  function q(F) {
    return Element.getDimensions(F).height
  }

  function c(F) {
    return Element.getDimensions(F).width
  }

  function s(G) {
    G = $(G);
    var K = Element.getStyle(G, "display");
    if (K && K !== "none") {
      return {
        width: G.offsetWidth,
        height: G.offsetHeight
      }
    }
    var H = G.style;
    var F = {
      visibility: H.visibility,
      position: H.position,
      display: H.display
    };
    var J = {
      visibility: "hidden",
      display: "block"
    };
    if (F.position !== "fixed") {
      J.position = "absolute"
    }
    Element.setStyle(G, J);
    var I = {
      width: G.offsetWidth,
      height: G.offsetHeight
    };
    Element.setStyle(G, F);
    return I
  }

  function p(F) {
    F = $(F);

    function H(I) {
      return n(I) ? $(document.body) : $(I)
    }
    if (h(F) || f(F) || o(F) || n(F)) {
      return $(document.body)
    }
    var G = (Element.getStyle(F, "display") === "inline");
    if (!G && F.offsetParent) {
      return H(F.offsetParent)
    }
    while ((F = F.parentNode) && F !== document.body) {
      if (Element.getStyle(F, "position") !== "static") {
        return H(F)
      }
    }
    return $(document.body)
  }

  function C(G) {
    G = $(G);
    var F = 0,
      H = 0;
    if (G.parentNode) {
      do {
        F += G.offsetTop || 0;
        H += G.offsetLeft || 0;
        G = G.offsetParent
      } while (G)
    }
    return new Element.Offset(H, F)
  }

  function w(G) {
    G = $(G);
    var H = G.getLayout();
    var F = 0,
      J = 0;
    do {
      F += G.offsetTop || 0;
      J += G.offsetLeft || 0;
      G = G.offsetParent;
      if (G) {
        if (o(G)) {
          break
        }
        var I = Element.getStyle(G, "position");
        if (I !== "static") {
          break
        }
      }
    } while (G);
    J -= H.get("margin-left");
    F -= H.get("margin-top");
    return new Element.Offset(J, F)
  }

  function b(G) {
    var F = 0,
      H = 0;
    do {
      if (G === document.body) {
        var I = document.documentElement || document.body.parentNode || document.body;
        F += !Object.isUndefined(window.pageYOffset) ? window.pageYOffset : I.scrollTop || 0;
        H += !Object.isUndefined(window.pageXOffset) ? window.pageXOffset : I.scrollLeft || 0;
        break
      } else {
        F += G.scrollTop || 0;
        H += G.scrollLeft || 0;
        G = G.parentNode
      }
    } while (G);
    return new Element.Offset(H, F)
  }

  function A(J) {
    var F = 0,
      I = 0,
      H = document.body;
    J = $(J);
    var G = J;
    do {
      F += G.offsetTop || 0;
      I += G.offsetLeft || 0;
      if (G.offsetParent == H && Element.getStyle(G, "position") == "absolute") {
        break
      }
    } while (G = G.offsetParent);
    G = J;
    do {
      if (G != H) {
        F -= G.scrollTop || 0;
        I -= G.scrollLeft || 0
      }
    } while (G = G.parentNode);
    return new Element.Offset(I, F)
  }

  function x(F) {
    F = $(F);
    if (Element.getStyle(F, "position") === "absolute") {
      return F
    }
    var J = p(F);
    var I = F.viewportOffset(),
      G = J.viewportOffset();
    var K = I.relativeTo(G);
    var H = F.getLayout();
    F.store("prototype_absolutize_original_styles", {
      position: F.getStyle("position"),
      left: F.getStyle("left"),
      top: F.getStyle("top"),
      width: F.getStyle("width"),
      height: F.getStyle("height")
    });
    F.setStyle({
      position: "absolute",
      top: K.top + "px",
      left: K.left + "px",
      width: H.get("width") + "px",
      height: H.get("height") + "px"
    });
    return F
  }

  function l(G) {
    G = $(G);
    if (Element.getStyle(G, "position") === "relative") {
      return G
    }
    var F = G.retrieve("prototype_absolutize_original_styles");
    if (F) {
      G.setStyle(F)
    }
    return G
  }

  function a(F) {
    F = $(F);
    var G = Element.cumulativeOffset(F);
    window.scrollTo(G.left, G.top);
    return F
  }

  function v(G) {
    G = $(G);
    var F = Element.getStyle(G, "position"),
      H = {};
    if (F === "static" || !F) {
      H.position = "relative";
      if (Prototype.Browser.Opera) {
        H.top = 0;
        H.left = 0
      }
      Element.setStyle(G, H);
      Element.store(G, "prototype_made_positioned", true)
    }
    return G
  }

  function t(F) {
    F = $(F);
    var H = Element.getStorage(F),
      G = H.get("prototype_made_positioned");
    if (G) {
      H.unset("prototype_made_positioned");
      Element.setStyle(F, {
        position: "",
        top: "",
        bottom: "",
        left: "",
        right: ""
      })
    }
    return F
  }

  function e(G) {
    G = $(G);
    var I = Element.getStorage(G),
      F = I.get("prototype_made_clipping");
    if (Object.isUndefined(F)) {
      var H = Element.getStyle(G, "overflow");
      I.set("prototype_made_clipping", H);
      if (H !== "hidden") {
        G.style.overflow = "hidden"
      }
    }
    return G
  }

  function D(F) {
    F = $(F);
    var H = Element.getStorage(F),
      G = H.get("prototype_made_clipping");
    if (!Object.isUndefined(G)) {
      H.unset("prototype_made_clipping");
      F.style.overflow = G || ""
    }
    return F
  }

  function E(I, F, Q) {
    Q = Object.extend({
      setLeft: true,
      setTop: true,
      setWidth: true,
      setHeight: true,
      offsetTop: 0,
      offsetLeft: 0
    }, Q || {});
    var H = document.documentElement;
    F = $(F);
    I = $(I);
    var G, O, K, P = {};
    if (Q.setLeft || Q.setTop) {
      G = Element.viewportOffset(F);
      O = [0, 0];
      if (Element.getStyle(I, "position") === "absolute") {
        var N = Element.getOffsetParent(I);
        if (N !== document.body) {
          O = Element.viewportOffset(N)
        }
      }
    }

    function L() {
      var R = 0,
        S = 0;
      if (Object.isNumber(window.pageXOffset)) {
        R = window.pageXOffset;
        S = window.pageYOffset
      } else {
        if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
          R = document.body.scrollLeft;
          S = document.body.scrollTop
        } else {
          if (H && (H.scrollLeft || H.scrollTop)) {
            R = H.scrollLeft;
            S = H.scrollTop
          }
        }
      }
      return {
        x: R,
        y: S
      }
    }
    var J = L();
    if (Q.setWidth || Q.setHeight) {
      K = Element.getLayout(F)
    }
    if (Q.setLeft) {
      P.left = (G[0] + J.x - O[0] + Q.offsetLeft) + "px"
    }
    if (Q.setTop) {
      P.top = (G[1] + J.y - O[1] + Q.offsetTop) + "px"
    }
    var M = I.getLayout();
    if (Q.setWidth) {
      P.width = K.get("width") + "px"
    }
    if (Q.setHeight) {
      P.height = K.get("height") + "px"
    }
    return Element.setStyle(I, P)
  }
  if (Prototype.Browser.IE) {
    p = p.wrap(function(H, G) {
      G = $(G);
      if (h(G) || f(G) || o(G) || n(G)) {
        return $(document.body)
      }
      var F = G.getStyle("position");
      if (F !== "static") {
        return H(G)
      }
      G.setStyle({
        position: "relative"
      });
      var I = H(G);
      G.setStyle({
        position: F
      });
      return I
    });
    w = w.wrap(function(I, G) {
      G = $(G);
      if (!G.parentNode) {
        return new Element.Offset(0, 0)
      }
      var F = G.getStyle("position");
      if (F !== "static") {
        return I(G)
      }
      var H = G.getOffsetParent();
      if (H && H.getStyle("position") === "fixed") {
        g(H)
      }
      G.setStyle({
        position: "relative"
      });
      var J = I(G);
      G.setStyle({
        position: F
      });
      return J
    })
  } else {
    if (Prototype.Browser.Webkit) {
      C = function(G) {
        G = $(G);
        var F = 0,
          H = 0;
        do {
          F += G.offsetTop || 0;
          H += G.offsetLeft || 0;
          if (G.offsetParent == document.body) {
            if (Element.getStyle(G, "position") == "absolute") {
              break
            }
          }
          G = G.offsetParent
        } while (G);
        return new Element.Offset(H, F)
      }
    }
  }
  Element.addMethods({
    getLayout: z,
    measure: d,
    getWidth: c,
    getHeight: q,
    getDimensions: s,
    getOffsetParent: p,
    cumulativeOffset: C,
    positionedOffset: w,
    cumulativeScrollOffset: b,
    viewportOffset: A,
    absolutize: x,
    relativize: l,
    scrollTo: a,
    makePositioned: v,
    undoPositioned: t,
    makeClipping: e,
    undoClipping: D,
    clonePosition: E
  });

  function o(F) {
    return F.nodeName.toUpperCase() === "BODY"
  }

  function n(F) {
    return F.nodeName.toUpperCase() === "HTML"
  }

  function h(F) {
    return F.nodeType === Node.DOCUMENT_NODE
  }

  function f(F) {
    return F !== document.body && !Element.descendantOf(F, document.body)
  }
  if ("getBoundingClientRect" in document.documentElement) {
    Element.addMethods({
      viewportOffset: function(F) {
        F = $(F);
        if (f(F)) {
          return new Element.Offset(0, 0)
        }
        var G = F.getBoundingClientRect(),
          H = document.documentElement;
        return new Element.Offset(G.left - H.clientLeft, G.top - H.clientTop)
      }
    })
  }
})();
(function() {
  var c = Prototype.Browser.Opera && (window.parseFloat(window.opera.version()) < 9.5);
  var f = null;

  function b() {
    if (f) {
      return f
    }
    f = c ? document.body : document.documentElement;
    return f
  }

  function d() {
    return {
      width: this.getWidth(),
      height: this.getHeight()
    }
  }

  function a() {
    return b().clientWidth
  }

  function g() {
    return b().clientHeight
  }

  function e() {
    var h = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
    var i = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    return new Element.Offset(h, i)
  }
  document.viewport = {
    getDimensions: d,
    getWidth: a,
    getHeight: g,
    getScrollOffsets: e
  }
})();
window.$$ = function() {
  var a = $A(arguments).join(", ");
  return Prototype.Selector.select(a, document)
};
Prototype.Selector = (function() {
  function a() {
    throw new Error('Method "Prototype.Selector.select" must be defined.')
  }

  function c() {
    throw new Error('Method "Prototype.Selector.match" must be defined.')
  }

  function d(l, m, h) {
    h = h || 0;
    var g = Prototype.Selector.match,
      k = l.length,
      f = 0,
      j;
    for (j = 0; j < k; j++) {
      if (g(l[j], m) && h == f++) {
        return Element.extend(l[j])
      }
    }
  }

  function e(h) {
    for (var f = 0, g = h.length; f < g; f++) {
      Element.extend(h[f])
    }
    return h
  }
  var b = Prototype.K;
  return {
    select: a,
    match: c,
    find: d,
    extendElements: (Element.extend === b) ? b : e,
    extendElement: Element.extend
  }
})();
Prototype._original_property = window.Sizzle;
(function() {
  function a(b) {
    Prototype._actual_sizzle = b()
  }
  a.amd = true;
  if (typeof define !== "undefined" && define.amd) {
    Prototype._original_define = define;
    Prototype._actual_sizzle = null;
    window.define = a
  }
})();
/*!
 * Sizzle CSS Selector Engine v1.10.18
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-02-05
 */
(function(av) {
  var D, ay, t, M, P, ab, ax, aC, N, ac, ae, H, u, an, ai, aw, k, K, ap = "sizzle" + -(new Date()),
    O = av.document,
    az = 0,
    aj = 0,
    d = F(),
    ao = F(),
    L = F(),
    J = function(i, e) {
      if (i === e) {
        ac = true
      }
      return 0
    },
    au = typeof undefined,
    V = 1 << 31,
    T = ({}).hasOwnProperty,
    ar = [],
    at = ar.pop,
    R = ar.push,
    b = ar.push,
    s = ar.slice,
    j = ar.indexOf || function(aE) {
      var aD = 0,
        e = this.length;
      for (; aD < e; aD++) {
        if (this[aD] === aE) {
          return aD
        }
      }
      return -1
    },
    c = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
    v = "[\\x20\\t\\r\\n\\f]",
    a = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
    Q = a.replace("w", "w#"),
    al = "\\[" + v + "*(" + a + ")" + v + "*(?:([*^$|!~]?=)" + v + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + Q + ")|)|)" + v + "*\\]",
    q = ":(" + a + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + al.replace(3, 8) + ")*)|.*)\\)|)",
    x = new RegExp("^" + v + "+|((?:^|[^\\\\])(?:\\\\.)*)" + v + "+$", "g"),
    A = new RegExp("^" + v + "*," + v + "*"),
    G = new RegExp("^" + v + "*([>+~]|" + v + ")" + v + "*"),
    z = new RegExp("=" + v + "*([^\\]'\"]*?)" + v + "*\\]", "g"),
    X = new RegExp(q),
    Z = new RegExp("^" + Q + "$"),
    ah = {
      ID: new RegExp("^#(" + a + ")"),
      CLASS: new RegExp("^\\.(" + a + ")"),
      TAG: new RegExp("^(" + a.replace("w", "w*") + ")"),
      ATTR: new RegExp("^" + al),
      PSEUDO: new RegExp("^" + q),
      CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + v + "*(even|odd|(([+-]|)(\\d*)n|)" + v + "*(?:([+-]|)" + v + "*(\\d+)|))" + v + "*\\)|)", "i"),
      bool: new RegExp("^(?:" + c + ")$", "i"),
      needsContext: new RegExp("^" + v + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + v + "*((?:-\\d)?\\d*)" + v + "*\\)|)(?=[^-]|$)", "i")
    },
    h = /^(?:input|select|textarea|button)$/i,
    r = /^h\d$/i,
    U = /^[^{]+\{\s*\[native \w/,
    W = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
    ag = /[+~]/,
    S = /'|\\/g,
    y = new RegExp("\\\\([\\da-f]{1,6}" + v + "?|(" + v + ")|.)", "ig"),
    ak = function(e, aE, i) {
      var aD = "0x" + aE - 65536;
      return aD !== aD || i ? aE : aD < 0 ? String.fromCharCode(aD + 65536) : String.fromCharCode(aD >> 10 | 55296, aD & 1023 | 56320)
    };
  try {
    b.apply((ar = s.call(O.childNodes)), O.childNodes);
    ar[O.childNodes.length].nodeType
  } catch (I) {
    b = {
      apply: ar.length ? function(i, e) {
        R.apply(i, s.call(e))
      } : function(aF, aE) {
        var e = aF.length,
          aD = 0;
        while ((aF[e++] = aE[aD++])) {}
        aF.length = e - 1
      }
    }
  }

  function B(aK, aD, aO, aQ) {
    var aP, aH, aI, aM, aN, aG, aF, e, aE, aL;
    if ((aD ? aD.ownerDocument || aD : O) !== H) {
      ae(aD)
    }
    aD = aD || H;
    aO = aO || [];
    if (!aK || typeof aK !== "string") {
      return aO
    }
    if ((aM = aD.nodeType) !== 1 && aM !== 9) {
      return []
    }
    if (an && !aQ) {
      if ((aP = W.exec(aK))) {
        if ((aI = aP[1])) {
          if (aM === 9) {
            aH = aD.getElementById(aI);
            if (aH && aH.parentNode) {
              if (aH.id === aI) {
                aO.push(aH);
                return aO
              }
            } else {
              return aO
            }
          } else {
            if (aD.ownerDocument && (aH = aD.ownerDocument.getElementById(aI)) && K(aD, aH) && aH.id === aI) {
              aO.push(aH);
              return aO
            }
          }
        } else {
          if (aP[2]) {
            b.apply(aO, aD.getElementsByTagName(aK));
            return aO
          } else {
            if ((aI = aP[3]) && ay.getElementsByClassName && aD.getElementsByClassName) {
              b.apply(aO, aD.getElementsByClassName(aI));
              return aO
            }
          }
        }
      }
      if (ay.qsa && (!ai || !ai.test(aK))) {
        e = aF = ap;
        aE = aD;
        aL = aM === 9 && aK;
        if (aM === 1 && aD.nodeName.toLowerCase() !== "object") {
          aG = n(aK);
          if ((aF = aD.getAttribute("id"))) {
            e = aF.replace(S, "\\$&")
          } else {
            aD.setAttribute("id", e)
          }
          e = "[id='" + e + "'] ";
          aN = aG.length;
          while (aN--) {
            aG[aN] = e + o(aG[aN])
          }
          aE = ag.test(aK) && Y(aD.parentNode) || aD;
          aL = aG.join(",")
        }
        if (aL) {
          try {
            b.apply(aO, aE.querySelectorAll(aL));
            return aO
          } catch (aJ) {} finally {
            if (!aF) {
              aD.removeAttribute("id")
            }
          }
        }
      }
    }
    return ax(aK.replace(x, "$1"), aD, aO, aQ)
  }

  function F() {
    var i = [];

    function e(aD, aE) {
      if (i.push(aD + " ") > t.cacheLength) {
        delete e[i.shift()]
      }
      return (e[aD + " "] = aE)
    }
    return e
  }

  function p(e) {
    e[ap] = true;
    return e
  }

  function l(i) {
    var aE = H.createElement("div");
    try {
      return !!i(aE)
    } catch (aD) {
      return false
    } finally {
      if (aE.parentNode) {
        aE.parentNode.removeChild(aE)
      }
      aE = null
    }
  }

  function aA(aD, aF) {
    var e = aD.split("|"),
      aE = aD.length;
    while (aE--) {
      t.attrHandle[e[aE]] = aF
    }
  }

  function f(i, e) {
    var aE = e && i,
      aD = aE && i.nodeType === 1 && e.nodeType === 1 && (~e.sourceIndex || V) - (~i.sourceIndex || V);
    if (aD) {
      return aD
    }
    if (aE) {
      while ((aE = aE.nextSibling)) {
        if (aE === e) {
          return -1
        }
      }
    }
    return i ? 1 : -1
  }

  function C(e) {
    return function(aD) {
      var i = aD.nodeName.toLowerCase();
      return i === "input" && aD.type === e
    }
  }

  function g(e) {
    return function(aD) {
      var i = aD.nodeName.toLowerCase();
      return (i === "input" || i === "button") && aD.type === e
    }
  }

  function am(e) {
    return p(function(i) {
      i = +i;
      return p(function(aD, aH) {
        var aF, aE = e([], aD.length, i),
          aG = aE.length;
        while (aG--) {
          if (aD[(aF = aE[aG])]) {
            aD[aF] = !(aH[aF] = aD[aF])
          }
        }
      })
    })
  }

  function Y(e) {
    return e && typeof e.getElementsByTagName !== au && e
  }
  ay = B.support = {};
  P = B.isXML = function(e) {
    var i = e && (e.ownerDocument || e).documentElement;
    return i ? i.nodeName !== "HTML" : false
  };
  ae = B.setDocument = function(aD) {
    var e, aE = aD ? aD.ownerDocument || aD : O,
      i = aE.defaultView;
    if (aE === H || aE.nodeType !== 9 || !aE.documentElement) {
      return H
    }
    H = aE;
    u = aE.documentElement;
    an = !P(aE);
    if (i && i !== i.top) {
      if (i.addEventListener) {
        i.addEventListener("unload", function() {
          ae()
        }, false)
      } else {
        if (i.attachEvent) {
          i.attachEvent("onunload", function() {
            ae()
          })
        }
      }
    }
    ay.attributes = l(function(aF) {
      aF.className = "i";
      return !aF.getAttribute("className")
    });
    ay.getElementsByTagName = l(function(aF) {
      aF.appendChild(aE.createComment(""));
      return !aF.getElementsByTagName("*").length
    });
    ay.getElementsByClassName = U.test(aE.getElementsByClassName) && l(function(aF) {
      aF.innerHTML = "<div class='a'></div><div class='a i'></div>";
      aF.firstChild.className = "i";
      return aF.getElementsByClassName("i").length === 2
    });
    ay.getById = l(function(aF) {
      u.appendChild(aF).id = ap;
      return !aE.getElementsByName || !aE.getElementsByName(ap).length
    });
    if (ay.getById) {
      t.find.ID = function(aH, aG) {
        if (typeof aG.getElementById !== au && an) {
          var aF = aG.getElementById(aH);
          return aF && aF.parentNode ? [aF] : []
        }
      };
      t.filter.ID = function(aG) {
        var aF = aG.replace(y, ak);
        return function(aH) {
          return aH.getAttribute("id") === aF
        }
      }
    } else {
      delete t.find.ID;
      t.filter.ID = function(aG) {
        var aF = aG.replace(y, ak);
        return function(aI) {
          var aH = typeof aI.getAttributeNode !== au && aI.getAttributeNode("id");
          return aH && aH.value === aF
        }
      }
    }
    t.find.TAG = ay.getElementsByTagName ? function(aF, aG) {
      if (typeof aG.getElementsByTagName !== au) {
        return aG.getElementsByTagName(aF)
      }
    } : function(aF, aJ) {
      var aK, aI = [],
        aH = 0,
        aG = aJ.getElementsByTagName(aF);
      if (aF === "*") {
        while ((aK = aG[aH++])) {
          if (aK.nodeType === 1) {
            aI.push(aK)
          }
        }
        return aI
      }
      return aG
    };
    t.find.CLASS = ay.getElementsByClassName && function(aG, aF) {
      if (typeof aF.getElementsByClassName !== au && an) {
        return aF.getElementsByClassName(aG)
      }
    };
    aw = [];
    ai = [];
    if ((ay.qsa = U.test(aE.querySelectorAll))) {
      l(function(aF) {
        aF.innerHTML = "<select t=''><option selected=''></option></select>";
        if (aF.querySelectorAll("[t^='']").length) {
          ai.push("[*^$]=" + v + "*(?:''|\"\")")
        }
        if (!aF.querySelectorAll("[selected]").length) {
          ai.push("\\[" + v + "*(?:value|" + c + ")")
        }
        if (!aF.querySelectorAll(":checked").length) {
          ai.push(":checked")
        }
      });
      l(function(aG) {
        var aF = aE.createElement("input");
        aF.setAttribute("type", "hidden");
        aG.appendChild(aF).setAttribute("name", "D");
        if (aG.querySelectorAll("[name=d]").length) {
          ai.push("name" + v + "*[*^$|!~]?=")
        }
        if (!aG.querySelectorAll(":enabled").length) {
          ai.push(":enabled", ":disabled")
        }
        aG.querySelectorAll("*,:x");
        ai.push(",.*:")
      })
    }
    if ((ay.matchesSelector = U.test((k = u.webkitMatchesSelector || u.mozMatchesSelector || u.oMatchesSelector || u.msMatchesSelector)))) {
      l(function(aF) {
        ay.disconnectedMatch = k.call(aF, "div");
        k.call(aF, "[s!='']:x");
        aw.push("!=", q)
      })
    }
    ai = ai.length && new RegExp(ai.join("|"));
    aw = aw.length && new RegExp(aw.join("|"));
    e = U.test(u.compareDocumentPosition);
    K = e || U.test(u.contains) ? function(aG, aF) {
      var aI = aG.nodeType === 9 ? aG.documentElement : aG,
        aH = aF && aF.parentNode;
      return aG === aH || !!(aH && aH.nodeType === 1 && (aI.contains ? aI.contains(aH) : aG.compareDocumentPosition && aG.compareDocumentPosition(aH) & 16))
    } : function(aG, aF) {
      if (aF) {
        while ((aF = aF.parentNode)) {
          if (aF === aG) {
            return true
          }
        }
      }
      return false
    };
    J = e ? function(aG, aF) {
      if (aG === aF) {
        ac = true;
        return 0
      }
      var aH = !aG.compareDocumentPosition - !aF.compareDocumentPosition;
      if (aH) {
        return aH
      }
      aH = (aG.ownerDocument || aG) === (aF.ownerDocument || aF) ? aG.compareDocumentPosition(aF) : 1;
      if (aH & 1 || (!ay.sortDetached && aF.compareDocumentPosition(aG) === aH)) {
        if (aG === aE || aG.ownerDocument === O && K(O, aG)) {
          return -1
        }
        if (aF === aE || aF.ownerDocument === O && K(O, aF)) {
          return 1
        }
        return N ? (j.call(N, aG) - j.call(N, aF)) : 0
      }
      return aH & 4 ? -1 : 1
    } : function(aG, aF) {
      if (aG === aF) {
        ac = true;
        return 0
      }
      var aM, aJ = 0,
        aL = aG.parentNode,
        aI = aF.parentNode,
        aH = [aG],
        aK = [aF];
      if (!aL || !aI) {
        return aG === aE ? -1 : aF === aE ? 1 : aL ? -1 : aI ? 1 : N ? (j.call(N, aG) - j.call(N, aF)) : 0
      } else {
        if (aL === aI) {
          return f(aG, aF)
        }
      }
      aM = aG;
      while ((aM = aM.parentNode)) {
        aH.unshift(aM)
      }
      aM = aF;
      while ((aM = aM.parentNode)) {
        aK.unshift(aM)
      }
      while (aH[aJ] === aK[aJ]) {
        aJ++
      }
      return aJ ? f(aH[aJ], aK[aJ]) : aH[aJ] === O ? -1 : aK[aJ] === O ? 1 : 0
    };
    return aE
  };
  B.matches = function(i, e) {
    return B(i, null, null, e)
  };
  B.matchesSelector = function(aD, aF) {
    if ((aD.ownerDocument || aD) !== H) {
      ae(aD)
    }
    aF = aF.replace(z, "='$1']");
    if (ay.matchesSelector && an && (!aw || !aw.test(aF)) && (!ai || !ai.test(aF))) {
      try {
        var i = k.call(aD, aF);
        if (i || ay.disconnectedMatch || aD.document && aD.document.nodeType !== 11) {
          return i
        }
      } catch (aE) {}
    }
    return B(aF, H, null, [aD]).length > 0
  };
  B.contains = function(e, i) {
    if ((e.ownerDocument || e) !== H) {
      ae(e)
    }
    return K(e, i)
  };
  B.attr = function(aD, e) {
    if ((aD.ownerDocument || aD) !== H) {
      ae(aD)
    }
    var i = t.attrHandle[e.toLowerCase()],
      aE = i && T.call(t.attrHandle, e.toLowerCase()) ? i(aD, e, !an) : undefined;
    return aE !== undefined ? aE : ay.attributes || !an ? aD.getAttribute(e) : (aE = aD.getAttributeNode(e)) && aE.specified ? aE.value : null
  };
  B.error = function(e) {
    throw new Error("Syntax error, unrecognized expression: " + e)
  };
  B.uniqueSort = function(aE) {
    var aF, aG = [],
      e = 0,
      aD = 0;
    ac = !ay.detectDuplicates;
    N = !ay.sortStable && aE.slice(0);
    aE.sort(J);
    if (ac) {
      while ((aF = aE[aD++])) {
        if (aF === aE[aD]) {
          e = aG.push(aD)
        }
      }
      while (e--) {
        aE.splice(aG[e], 1)
      }
    }
    N = null;
    return aE
  };
  M = B.getText = function(aG) {
    var aF, aD = "",
      aE = 0,
      e = aG.nodeType;
    if (!e) {
      while ((aF = aG[aE++])) {
        aD += M(aF)
      }
    } else {
      if (e === 1 || e === 9 || e === 11) {
        if (typeof aG.textContent === "string") {
          return aG.textContent
        } else {
          for (aG = aG.firstChild; aG; aG = aG.nextSibling) {
            aD += M(aG)
          }
        }
      } else {
        if (e === 3 || e === 4) {
          return aG.nodeValue
        }
      }
    }
    return aD
  };
  t = B.selectors = {
    cacheLength: 50,
    createPseudo: p,
    match: ah,
    attrHandle: {},
    find: {},
    relative: {
      ">": {
        dir: "parentNode",
        first: true
      },
      " ": {
        dir: "parentNode"
      },
      "+": {
        dir: "previousSibling",
        first: true
      },
      "~": {
        dir: "previousSibling"
      }
    },
    preFilter: {
      ATTR: function(e) {
        e[1] = e[1].replace(y, ak);
        e[3] = (e[4] || e[5] || "").replace(y, ak);
        if (e[2] === "~=") {
          e[3] = " " + e[3] + " "
        }
        return e.slice(0, 4)
      },
      CHILD: function(e) {
        e[1] = e[1].toLowerCase();
        if (e[1].slice(0, 3) === "nth") {
          if (!e[3]) {
            B.error(e[0])
          }
          e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * (e[3] === "even" || e[3] === "odd"));
          e[5] = +((e[7] + e[8]) || e[3] === "odd")
        } else {
          if (e[3]) {
            B.error(e[0])
          }
        }
        return e
      },
      PSEUDO: function(i) {
        var e, aD = !i[5] && i[2];
        if (ah.CHILD.test(i[0])) {
          return null
        }
        if (i[3] && i[4] !== undefined) {
          i[2] = i[4]
        } else {
          if (aD && X.test(aD) && (e = n(aD, true)) && (e = aD.indexOf(")", aD.length - e) - aD.length)) {
            i[0] = i[0].slice(0, e);
            i[2] = aD.slice(0, e)
          }
        }
        return i.slice(0, 3)
      }
    },
    filter: {
      TAG: function(i) {
        var e = i.replace(y, ak).toLowerCase();
        return i === "*" ? function() {
          return true
        } : function(aD) {
          return aD.nodeName && aD.nodeName.toLowerCase() === e
        }
      },
      CLASS: function(e) {
        var i = d[e + " "];
        return i || (i = new RegExp("(^|" + v + ")" + e + "(" + v + "|$)")) && d(e, function(aD) {
          return i.test(typeof aD.className === "string" && aD.className || typeof aD.getAttribute !== au && aD.getAttribute("class") || "")
        })
      },
      ATTR: function(aD, i, e) {
        return function(aF) {
          var aE = B.attr(aF, aD);
          if (aE == null) {
            return i === "!="
          }
          if (!i) {
            return true
          }
          aE += "";
          return i === "=" ? aE === e : i === "!=" ? aE !== e : i === "^=" ? e && aE.indexOf(e) === 0 : i === "*=" ? e && aE.indexOf(e) > -1 : i === "$=" ? e && aE.slice(-e.length) === e : i === "~=" ? (" " + aE + " ").indexOf(e) > -1 : i === "|=" ? aE === e || aE.slice(0, e.length + 1) === e + "-" : false
        }
      },
      CHILD: function(i, aF, aE, aG, aD) {
        var aI = i.slice(0, 3) !== "nth",
          e = i.slice(-4) !== "last",
          aH = aF === "of-type";
        return aG === 1 && aD === 0 ? function(aJ) {
          return !!aJ.parentNode
        } : function(aP, aN, aS) {
          var aJ, aV, aQ, aU, aR, aM, aO = aI !== e ? "nextSibling" : "previousSibling",
            aT = aP.parentNode,
            aL = aH && aP.nodeName.toLowerCase(),
            aK = !aS && !aH;
          if (aT) {
            if (aI) {
              while (aO) {
                aQ = aP;
                while ((aQ = aQ[aO])) {
                  if (aH ? aQ.nodeName.toLowerCase() === aL : aQ.nodeType === 1) {
                    return false
                  }
                }
                aM = aO = i === "only" && !aM && "nextSibling"
              }
              return true
            }
            aM = [e ? aT.firstChild : aT.lastChild];
            if (e && aK) {
              aV = aT[ap] || (aT[ap] = {});
              aJ = aV[i] || [];
              aR = aJ[0] === az && aJ[1];
              aU = aJ[0] === az && aJ[2];
              aQ = aR && aT.childNodes[aR];
              while ((aQ = ++aR && aQ && aQ[aO] || (aU = aR = 0) || aM.pop())) {
                if (aQ.nodeType === 1 && ++aU && aQ === aP) {
                  aV[i] = [az, aR, aU];
                  break
                }
              }
            } else {
              if (aK && (aJ = (aP[ap] || (aP[ap] = {}))[i]) && aJ[0] === az) {
                aU = aJ[1]
              } else {
                while ((aQ = ++aR && aQ && aQ[aO] || (aU = aR = 0) || aM.pop())) {
                  if ((aH ? aQ.nodeName.toLowerCase() === aL : aQ.nodeType === 1) && ++aU) {
                    if (aK) {
                      (aQ[ap] || (aQ[ap] = {}))[i] = [az, aU]
                    }
                    if (aQ === aP) {
                      break
                    }
                  }
                }
              }
            }
            aU -= aD;
            return aU === aG || (aU % aG === 0 && aU / aG >= 0)
          }
        }
      },
      PSEUDO: function(aE, aD) {
        var e, i = t.pseudos[aE] || t.setFilters[aE.toLowerCase()] || B.error("unsupported pseudo: " + aE);
        if (i[ap]) {
          return i(aD)
        }
        if (i.length > 1) {
          e = [aE, aE, "", aD];
          return t.setFilters.hasOwnProperty(aE.toLowerCase()) ? p(function(aH, aJ) {
            var aG, aF = i(aH, aD),
              aI = aF.length;
            while (aI--) {
              aG = j.call(aH, aF[aI]);
              aH[aG] = !(aJ[aG] = aF[aI])
            }
          }) : function(aF) {
            return i(aF, 0, e)
          }
        }
        return i
      }
    },
    pseudos: {
      not: p(function(e) {
        var i = [],
          aD = [],
          aE = ab(e.replace(x, "$1"));
        return aE[ap] ? p(function(aG, aL, aJ, aH) {
          var aK, aF = aE(aG, null, aH, []),
            aI = aG.length;
          while (aI--) {
            if ((aK = aF[aI])) {
              aG[aI] = !(aL[aI] = aK)
            }
          }
        }) : function(aH, aG, aF) {
          i[0] = aH;
          aE(i, null, aF, aD);
          return !aD.pop()
        }
      }),
      has: p(function(e) {
        return function(i) {
          return B(e, i).length > 0
        }
      }),
      contains: p(function(e) {
        return function(i) {
          return (i.textContent || i.innerText || M(i)).indexOf(e) > -1
        }
      }),
      lang: p(function(e) {
        if (!Z.test(e || "")) {
          B.error("unsupported lang: " + e)
        }
        e = e.replace(y, ak).toLowerCase();
        return function(aD) {
          var i;
          do {
            if ((i = an ? aD.lang : aD.getAttribute("xml:lang") || aD.getAttribute("lang"))) {
              i = i.toLowerCase();
              return i === e || i.indexOf(e + "-") === 0
            }
          } while ((aD = aD.parentNode) && aD.nodeType === 1);
          return false
        }
      }),
      target: function(e) {
        var i = av.location && av.location.hash;
        return i && i.slice(1) === e.id
      },
      root: function(e) {
        return e === u
      },
      focus: function(e) {
        return e === H.activeElement && (!H.hasFocus || H.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
      },
      enabled: function(e) {
        return e.disabled === false
      },
      disabled: function(e) {
        return e.disabled === true
      },
      checked: function(e) {
        var i = e.nodeName.toLowerCase();
        return (i === "input" && !!e.checked) || (i === "option" && !!e.selected)
      },
      selected: function(e) {
        if (e.parentNode) {
          e.parentNode.selectedIndex
        }
        return e.selected === true
      },
      empty: function(e) {
        for (e = e.firstChild; e; e = e.nextSibling) {
          if (e.nodeType < 6) {
            return false
          }
        }
        return true
      },
      parent: function(e) {
        return !t.pseudos.empty(e)
      },
      header: function(e) {
        return r.test(e.nodeName)
      },
      input: function(e) {
        return h.test(e.nodeName)
      },
      button: function(i) {
        var e = i.nodeName.toLowerCase();
        return e === "input" && i.type === "button" || e === "button"
      },
      text: function(i) {
        var e;
        return i.nodeName.toLowerCase() === "input" && i.type === "text" && ((e = i.getAttribute("type")) == null || e.toLowerCase() === "text")
      },
      first: am(function() {
        return [0]
      }),
      last: am(function(e, i) {
        return [i - 1]
      }),
      eq: am(function(e, aD, i) {
        return [i < 0 ? i + aD : i]
      }),
      even: am(function(e, aE) {
        var aD = 0;
        for (; aD < aE; aD += 2) {
          e.push(aD)
        }
        return e
      }),
      odd: am(function(e, aE) {
        var aD = 1;
        for (; aD < aE; aD += 2) {
          e.push(aD)
        }
        return e
      }),
      lt: am(function(e, aF, aE) {
        var aD = aE < 0 ? aE + aF : aE;
        for (; --aD >= 0;) {
          e.push(aD)
        }
        return e
      }),
      gt: am(function(e, aF, aE) {
        var aD = aE < 0 ? aE + aF : aE;
        for (; ++aD < aF;) {
          e.push(aD)
        }
        return e
      })
    }
  };
  t.pseudos.nth = t.pseudos.eq;
  for (D in {
      radio: true,
      checkbox: true,
      file: true,
      password: true,
      image: true
    }) {
    t.pseudos[D] = C(D)
  }
  for (D in {
      submit: true,
      reset: true
    }) {
    t.pseudos[D] = g(D)
  }

  function aa() {}
  aa.prototype = t.filters = t.pseudos;
  t.setFilters = new aa();

  function n(aF, aK) {
    var i, aG, aI, aJ, aH, aD, e, aE = ao[aF + " "];
    if (aE) {
      return aK ? 0 : aE.slice(0)
    }
    aH = aF;
    aD = [];
    e = t.preFilter;
    while (aH) {
      if (!i || (aG = A.exec(aH))) {
        if (aG) {
          aH = aH.slice(aG[0].length) || aH
        }
        aD.push((aI = []))
      }
      i = false;
      if ((aG = G.exec(aH))) {
        i = aG.shift();
        aI.push({
          value: i,
          type: aG[0].replace(x, " ")
        });
        aH = aH.slice(i.length)
      }
      for (aJ in t.filter) {
        if ((aG = ah[aJ].exec(aH)) && (!e[aJ] || (aG = e[aJ](aG)))) {
          i = aG.shift();
          aI.push({
            value: i,
            type: aJ,
            matches: aG
          });
          aH = aH.slice(i.length)
        }
      }
      if (!i) {
        break
      }
    }
    return aK ? aH.length : aH ? B.error(aF) : ao(aF, aD).slice(0)
  }

  function o(aF) {
    var aE = 0,
      aD = aF.length,
      e = "";
    for (; aE < aD; aE++) {
      e += aF[aE].value
    }
    return e
  }

  function w(aF, aD, aE) {
    var e = aD.dir,
      aG = aE && e === "parentNode",
      i = aj++;
    return aD.first ? function(aJ, aI, aH) {
      while ((aJ = aJ[e])) {
        if (aJ.nodeType === 1 || aG) {
          return aF(aJ, aI, aH)
        }
      }
    } : function(aL, aJ, aI) {
      var aM, aK, aH = [az, i];
      if (aI) {
        while ((aL = aL[e])) {
          if (aL.nodeType === 1 || aG) {
            if (aF(aL, aJ, aI)) {
              return true
            }
          }
        }
      } else {
        while ((aL = aL[e])) {
          if (aL.nodeType === 1 || aG) {
            aK = aL[ap] || (aL[ap] = {});
            if ((aM = aK[e]) && aM[0] === az && aM[1] === i) {
              return (aH[2] = aM[2])
            } else {
              aK[e] = aH;
              if ((aH[2] = aF(aL, aJ, aI))) {
                return true
              }
            }
          }
        }
      }
    }
  }

  function aB(e) {
    return e.length > 1 ? function(aG, aF, aD) {
      var aE = e.length;
      while (aE--) {
        if (!e[aE](aG, aF, aD)) {
          return false
        }
      }
      return true
    } : e[0]
  }

  function E(aD, aG, aF) {
    var aE = 0,
      e = aG.length;
    for (; aE < e; aE++) {
      B(aD, aG[aE], aF)
    }
    return aF
  }

  function af(e, aD, aE, aF, aI) {
    var aG, aL = [],
      aH = 0,
      aJ = e.length,
      aK = aD != null;
    for (; aH < aJ; aH++) {
      if ((aG = e[aH])) {
        if (!aE || aE(aG, aF, aI)) {
          aL.push(aG);
          if (aK) {
            aD.push(aH)
          }
        }
      }
    }
    return aL
  }

  function m(aD, i, aF, aE, aG, e) {
    if (aE && !aE[ap]) {
      aE = m(aE)
    }
    if (aG && !aG[ap]) {
      aG = m(aG, e)
    }
    return p(function(aR, aO, aJ, aQ) {
      var aT, aP, aL, aK = [],
        aS = [],
        aI = aO.length,
        aH = aR || E(i || "*", aJ.nodeType ? [aJ] : aJ, []),
        aM = aD && (aR || !i) ? af(aH, aK, aD, aJ, aQ) : aH,
        aN = aF ? aG || (aR ? aD : aI || aE) ? [] : aO : aM;
      if (aF) {
        aF(aM, aN, aJ, aQ)
      }
      if (aE) {
        aT = af(aN, aS);
        aE(aT, [], aJ, aQ);
        aP = aT.length;
        while (aP--) {
          if ((aL = aT[aP])) {
            aN[aS[aP]] = !(aM[aS[aP]] = aL)
          }
        }
      }
      if (aR) {
        if (aG || aD) {
          if (aG) {
            aT = [];
            aP = aN.length;
            while (aP--) {
              if ((aL = aN[aP])) {
                aT.push((aM[aP] = aL))
              }
            }
            aG(null, (aN = []), aT, aQ)
          }
          aP = aN.length;
          while (aP--) {
            if ((aL = aN[aP]) && (aT = aG ? j.call(aR, aL) : aK[aP]) > -1) {
              aR[aT] = !(aO[aT] = aL)
            }
          }
        }
      } else {
        aN = af(aN === aO ? aN.splice(aI, aN.length) : aN);
        if (aG) {
          aG(null, aO, aN, aQ)
        } else {
          b.apply(aO, aN)
        }
      }
    })
  }

  function aq(aI) {
    var aD, aG, aE, aH = aI.length,
      aL = t.relative[aI[0].type],
      aM = aL || t.relative[" "],
      aF = aL ? 1 : 0,
      aJ = w(function(i) {
        return i === aD
      }, aM, true),
      aK = w(function(i) {
        return j.call(aD, i) > -1
      }, aM, true),
      e = [function(aO, aN, i) {
        return (!aL && (i || aN !== aC)) || ((aD = aN).nodeType ? aJ(aO, aN, i) : aK(aO, aN, i))
      }];
    for (; aF < aH; aF++) {
      if ((aG = t.relative[aI[aF].type])) {
        e = [w(aB(e), aG)]
      } else {
        aG = t.filter[aI[aF].type].apply(null, aI[aF].matches);
        if (aG[ap]) {
          aE = ++aF;
          for (; aE < aH; aE++) {
            if (t.relative[aI[aE].type]) {
              break
            }
          }
          return m(aF > 1 && aB(e), aF > 1 && o(aI.slice(0, aF - 1).concat({
            value: aI[aF - 2].type === " " ? "*" : ""
          })).replace(x, "$1"), aG, aF < aE && aq(aI.slice(aF, aE)), aE < aH && aq((aI = aI.slice(aE))), aE < aH && o(aI))
        }
        e.push(aG)
      }
    }
    return aB(e)
  }

  function ad(aE, aD) {
    var e = aD.length > 0,
      aF = aE.length > 0,
      i = function(aP, aJ, aO, aN, aS) {
        var aK, aL, aQ, aU = 0,
          aM = "0",
          aG = aP && [],
          aV = [],
          aT = aC,
          aI = aP || aF && t.find.TAG("*", aS),
          aH = (az += aT == null ? 1 : Math.random() || 0.1),
          aR = aI.length;
        if (aS) {
          aC = aJ !== H && aJ
        }
        for (; aM !== aR && (aK = aI[aM]) != null; aM++) {
          if (aF && aK) {
            aL = 0;
            while ((aQ = aE[aL++])) {
              if (aQ(aK, aJ, aO)) {
                aN.push(aK);
                break
              }
            }
            if (aS) {
              az = aH
            }
          }
          if (e) {
            if ((aK = !aQ && aK)) {
              aU--
            }
            if (aP) {
              aG.push(aK)
            }
          }
        }
        aU += aM;
        if (e && aM !== aU) {
          aL = 0;
          while ((aQ = aD[aL++])) {
            aQ(aG, aV, aJ, aO)
          }
          if (aP) {
            if (aU > 0) {
              while (aM--) {
                if (!(aG[aM] || aV[aM])) {
                  aV[aM] = at.call(aN)
                }
              }
            }
            aV = af(aV)
          }
          b.apply(aN, aV);
          if (aS && !aP && aV.length > 0 && (aU + aD.length) > 1) {
            B.uniqueSort(aN)
          }
        }
        if (aS) {
          az = aH;
          aC = aT
        }
        return aG
      };
    return e ? p(i) : i
  }
  ab = B.compile = function(e, aE) {
    var aF, aD = [],
      aH = [],
      aG = L[e + " "];
    if (!aG) {
      if (!aE) {
        aE = n(e)
      }
      aF = aE.length;
      while (aF--) {
        aG = aq(aE[aF]);
        if (aG[ap]) {
          aD.push(aG)
        } else {
          aH.push(aG)
        }
      }
      aG = L(e, ad(aH, aD));
      aG.selector = e
    }
    return aG
  };
  ax = B.select = function(aE, e, aF, aI) {
    var aG, aL, aD, aM, aJ, aK = typeof aE === "function" && aE,
      aH = !aI && n((aE = aK.selector || aE));
    aF = aF || [];
    if (aH.length === 1) {
      aL = aH[0] = aH[0].slice(0);
      if (aL.length > 2 && (aD = aL[0]).type === "ID" && ay.getById && e.nodeType === 9 && an && t.relative[aL[1].type]) {
        e = (t.find.ID(aD.matches[0].replace(y, ak), e) || [])[0];
        if (!e) {
          return aF
        } else {
          if (aK) {
            e = e.parentNode
          }
        }
        aE = aE.slice(aL.shift().value.length)
      }
      aG = ah.needsContext.test(aE) ? 0 : aL.length;
      while (aG--) {
        aD = aL[aG];
        if (t.relative[(aM = aD.type)]) {
          break
        }
        if ((aJ = t.find[aM])) {
          if ((aI = aJ(aD.matches[0].replace(y, ak), ag.test(aL[0].type) && Y(e.parentNode) || e))) {
            aL.splice(aG, 1);
            aE = aI.length && o(aL);
            if (!aE) {
              b.apply(aF, aI);
              return aF
            }
            break
          }
        }
      }
    }(aK || ab(aE, aH))(aI, e, !an, aF, ag.test(aE) && Y(e.parentNode) || e);
    return aF
  };
  ay.sortStable = ap.split("").sort(J).join("") === ap;
  ay.detectDuplicates = !!ac;
  ae();
  ay.sortDetached = l(function(e) {
    return e.compareDocumentPosition(H.createElement("div")) & 1
  });
  if (!l(function(e) {
      e.innerHTML = "<a href='#'></a>";
      return e.firstChild.getAttribute("href") === "#"
    })) {
    aA("type|href|height|width", function(i, e, aD) {
      if (!aD) {
        return i.getAttribute(e, e.toLowerCase() === "type" ? 1 : 2)
      }
    })
  }
  if (!ay.attributes || !l(function(e) {
      e.innerHTML = "<input/>";
      e.firstChild.setAttribute("value", "");
      return e.firstChild.getAttribute("value") === ""
    })) {
    aA("value", function(i, e, aD) {
      if (!aD && i.nodeName.toLowerCase() === "input") {
        return i.defaultValue
      }
    })
  }
  if (!l(function(e) {
      return e.getAttribute("disabled") == null
    })) {
    aA(c, function(i, e, aE) {
      var aD;
      if (!aE) {
        return i[e] === true ? e.toLowerCase() : (aD = i.getAttributeNode(e)) && aD.specified ? aD.value : null
      }
    })
  }
  if (typeof define === "function" && define.amd) {
    define(function() {
      return B
    })
  } else {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = B
    } else {
      av.Sizzle = B
    }
  }
})(window);
(function() {
  if (typeof Sizzle !== "undefined") {
    return
  }
  if (typeof define !== "undefined" && define.amd) {
    window.Sizzle = Prototype._actual_sizzle;
    window.define = Prototype._original_define;
    delete Prototype._actual_sizzle;
    delete Prototype._original_define
  } else {
    if (typeof module !== "undefined" && module.exports) {
      window.Sizzle = module.exports;
      module.exports = {}
    }
  }
})();
(function(c) {
  var d = Prototype.Selector.extendElements;

  function a(e, f) {
    return d(c(e, f || document))
  }

  function b(f, e) {
    return c.matches(e, [f]).length == 1
  }
  Prototype.Selector.engine = c;
  Prototype.Selector.select = a;
  Prototype.Selector.match = b
})(Sizzle);
window.Sizzle = Prototype._original_property;
delete Prototype._original_property;
var Form = {
  reset: function(a) {
    a = $(a);
    a.reset();
    return a
  },
  serializeElements: function(h, d) {
    if (typeof d != "object") {
      d = {
        hash: !!d
      }
    } else {
      if (Object.isUndefined(d.hash)) {
        d.hash = true
      }
    }
    var e, g, a = false,
      f = d.submit,
      b, c;
    if (d.hash) {
      c = {};
      b = function(i, j, k) {
        if (j in i) {
          if (!Object.isArray(i[j])) {
            i[j] = [i[j]]
          }
          i[j] = i[j].concat(k)
        } else {
          i[j] = k
        }
        return i
      }
    } else {
      c = "";
      b = function(i, k, j) {
        if (!Object.isArray(j)) {
          j = [j]
        }
        if (!j.length) {
          return i
        }
        var l = encodeURIComponent(k).gsub(/%20/, "+");
        return i + (i ? "&" : "") + j.map(function(m) {
          m = m.gsub(/(\r)?\n/, "\r\n");
          m = encodeURIComponent(m);
          m = m.gsub(/%20/, "+");
          return l + "=" + m
        }).join("&")
      }
    }
    return h.inject(c, function(i, j) {
      if (!j.disabled && j.name) {
        e = j.name;
        g = $(j).getValue();
        if (g != null && j.type != "file" && (j.type != "submit" || (!a && f !== false && (!f || e == f) && (a = true)))) {
          i = b(i, e, g)
        }
      }
      return i
    })
  }
};
Form.Methods = {
  serialize: function(b, a) {
    return Form.serializeElements(Form.getElements(b), a)
  },
  getElements: function(e) {
    var f = $(e).getElementsByTagName("*");
    var d, c = [],
      b = Form.Element.Serializers;
    for (var a = 0; d = f[a]; a++) {
      if (b[d.tagName.toLowerCase()]) {
        c.push(Element.extend(d))
      }
    }
    return c
  },
  getInputs: function(g, c, d) {
    g = $(g);
    var a = g.getElementsByTagName("input");
    if (!c && !d) {
      return $A(a).map(Element.extend)
    }
    for (var e = 0, h = [], f = a.length; e < f; e++) {
      var b = a[e];
      if ((c && b.type != c) || (d && b.name != d)) {
        continue
      }
      h.push(Element.extend(b))
    }
    return h
  },
  disable: function(a) {
    a = $(a);
    Form.getElements(a).invoke("disable");
    return a
  },
  enable: function(a) {
    a = $(a);
    Form.getElements(a).invoke("enable");
    return a
  },
  findFirstElement: function(b) {
    var c = $(b).getElements().findAll(function(d) {
      return "hidden" != d.type && !d.disabled
    });
    var a = c.findAll(function(d) {
      return d.hasAttribute("tabIndex") && d.tabIndex >= 0
    }).sortBy(function(d) {
      return d.tabIndex
    }).first();
    return a ? a : c.find(function(d) {
      return /^(?:input|select|textarea)$/i.test(d.tagName)
    })
  },
  focusFirstElement: function(b) {
    b = $(b);
    var a = b.findFirstElement();
    if (a) {
      a.activate()
    }
    return b
  },
  request: function(b, a) {
    b = $(b), a = Object.clone(a || {});
    var d = a.parameters,
      c = b.readAttribute("action") || "";
    if (c.blank()) {
      c = window.location.href
    }
    a.parameters = b.serialize(true);
    if (d) {
      if (Object.isString(d)) {
        d = d.toQueryParams()
      }
      Object.extend(a.parameters, d)
    }
    if (b.hasAttribute("method") && !a.method) {
      a.method = b.method
    }
    return new Ajax.Request(c, a)
  }
};
Form.Element = {
  focus: function(a) {
    $(a).focus();
    return a
  },
  select: function(a) {
    $(a).select();
    return a
  }
};
Form.Element.Methods = {
  serialize: function(a) {
    a = $(a);
    if (!a.disabled && a.name) {
      var b = a.getValue();
      if (b != undefined) {
        var c = {};
        c[a.name] = b;
        return Object.toQueryString(c)
      }
    }
    return ""
  },
  getValue: function(a) {
    a = $(a);
    var b = a.tagName.toLowerCase();
    return Form.Element.Serializers[b](a)
  },
  setValue: function(a, b) {
    a = $(a);
    var c = a.tagName.toLowerCase();
    Form.Element.Serializers[c](a, b);
    return a
  },
  clear: function(a) {
    $(a).value = "";
    return a
  },
  present: function(a) {
    return $(a).value != ""
  },
  activate: function(a) {
    a = $(a);
    try {
      a.focus();
      if (a.select && (a.tagName.toLowerCase() != "input" || !(/^(?:button|reset|submit)$/i.test(a.type)))) {
        a.select()
      }
    } catch (b) {}
    return a
  },
  disable: function(a) {
    a = $(a);
    a.disabled = true;
    return a
  },
  enable: function(a) {
    a = $(a);
    a.disabled = false;
    return a
  }
};
var Field = Form.Element;
var $F = Form.Element.Methods.getValue;
Form.Element.Serializers = (function() {
  function b(h, i) {
    switch (h.type.toLowerCase()) {
      case "checkbox":
      case "radio":
        return f(h, i);
      default:
        return e(h, i)
    }
  }

  function f(h, i) {
    if (Object.isUndefined(i)) {
      return h.checked ? h.value : null
    } else {
      h.checked = !!i
    }
  }

  function e(h, i) {
    if (Object.isUndefined(i)) {
      return h.value
    } else {
      h.value = i
    }
  }

  function a(k, n) {
    if (Object.isUndefined(n)) {
      return (k.type === "select-one" ? c : d)(k)
    }
    var j, l, o = !Object.isArray(n);
    for (var h = 0, m = k.length; h < m; h++) {
      j = k.options[h];
      l = this.optionValue(j);
      if (o) {
        if (l == n) {
          j.selected = true;
          return
        }
      } else {
        j.selected = n.include(l)
      }
    }
  }

  function c(i) {
    var h = i.selectedIndex;
    return h >= 0 ? g(i.options[h]) : null
  }

  function d(l) {
    var h, m = l.length;
    if (!m) {
      return null
    }
    for (var k = 0, h = []; k < m; k++) {
      var j = l.options[k];
      if (j.selected) {
        h.push(g(j))
      }
    }
    return h
  }

  function g(h) {
    return Element.hasAttribute(h, "value") ? h.value : h.text
  }
  return {
    input: b,
    inputSelector: f,
    textarea: e,
    select: a,
    selectOne: c,
    selectMany: d,
    optionValue: g,
    button: e
  }
})();
Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, a, b, c) {
    $super(c, b);
    this.element = $(a);
    this.lastValue = this.getValue()
  },
  execute: function() {
    var a = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(a) ? this.lastValue != a : String(this.lastValue) != String(a)) {
      this.callback(this.element, a);
      this.lastValue = a
    }
  }
});
Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element)
  }
});
Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element)
  }
});
Abstract.EventObserver = Class.create({
  initialize: function(a, b) {
    this.element = $(a);
    this.callback = b;
    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == "form") {
      this.registerFormCallbacks()
    } else {
      this.registerCallback(this.element)
    }
  },
  onElementEvent: function() {
    var a = this.getValue();
    if (this.lastValue != a) {
      this.callback(this.element, a);
      this.lastValue = a
    }
  },
  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this)
  },
  registerCallback: function(a) {
    if (a.type) {
      switch (a.type.toLowerCase()) {
        case "checkbox":
        case "radio":
          Event.observe(a, "click", this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(a, "change", this.onElementEvent.bind(this));
          break
      }
    }
  }
});
Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element)
  }
});
Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element)
  }
});
(function(D) {
  var u = document.createElement("div");
  var d = document.documentElement;
  var k = "onmouseenter" in d && "onmouseleave" in d;
  var L = {
    KEY_BACKSPACE: 8,
    KEY_TAB: 9,
    KEY_RETURN: 13,
    KEY_ESC: 27,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_DELETE: 46,
    KEY_HOME: 36,
    KEY_END: 35,
    KEY_PAGEUP: 33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT: 45
  };
  var A = function(X) {
    return false
  };
  if (window.attachEvent) {
    if (window.addEventListener) {
      A = function(X) {
        return !(X instanceof window.Event)
      }
    } else {
      A = function(X) {
        return true
      }
    }
  }
  var O;

  function M(Y, X) {
    return Y.which ? (Y.which === X + 1) : (Y.button === X)
  }
  var W = {
    0: 1,
    1: 4,
    2: 2
  };

  function S(Y, X) {
    return Y.button === W[X]
  }

  function P(Y, X) {
    switch (X) {
      case 0:
        return Y.which == 1 && !Y.metaKey;
      case 1:
        return Y.which == 2 || (Y.which == 1 && Y.metaKey);
      case 2:
        return Y.which == 3;
      default:
        return false
    }
  }
  if (window.attachEvent) {
    if (!window.addEventListener) {
      O = S
    } else {
      O = function(Y, X) {
        return A(Y) ? S(Y, X) : M(Y, X)
      }
    }
  } else {
    if (Prototype.Browser.WebKit) {
      O = P
    } else {
      O = M
    }
  }

  function B(X) {
    return O(X, 0)
  }

  function i(X) {
    return O(X, 1)
  }

  function e(X) {
    return O(X, 2)
  }

  function o(X) {
    return Element.extend(K(X))
  }

  function K(Z) {
    Z = L.extend(Z);
    var Y = Z.target,
      X = Z.type,
      aa = Z.currentTarget;
    if (aa && aa.tagName) {
      if (X === "load" || X === "error" || (X === "click" && aa.tagName.toLowerCase() === "input" && aa.type === "radio")) {
        Y = aa
      }
    }
    return Y.nodeType == Node.TEXT_NODE ? Y.parentNode : Y
  }

  function j(Z, aa) {
    var Y = K(Z),
      X = Prototype.Selector;
    if (!aa) {
      return Element.extend(Y)
    }
    while (Y) {
      if (Object.isElement(Y) && X.match(Y, aa)) {
        return Element.extend(Y)
      }
      Y = Y.parentNode
    }
  }

  function t(X) {
    return {
      x: U(X),
      y: T(X)
    }
  }

  function U(Z) {
    var Y = document.documentElement,
      X = document.body || {
        scrollLeft: 0
      };
    return Z.pageX || (Z.clientX + (Y.scrollLeft || X.scrollLeft) - (Y.clientLeft || 0))
  }

  function T(Z) {
    var Y = document.documentElement,
      X = document.body || {
        scrollTop: 0
      };
    return Z.pageY || (Z.clientY + (Y.scrollTop || X.scrollTop) - (Y.clientTop || 0))
  }

  function r(X) {
    L.extend(X);
    X.preventDefault();
    X.stopPropagation();
    X.stopped = true
  }
  L.Methods = {
    isLeftClick: B,
    isMiddleClick: i,
    isRightClick: e,
    element: o,
    findElement: j,
    pointer: t,
    pointerX: U,
    pointerY: T,
    stop: r
  };
  var H = Object.keys(L.Methods).inject({}, function(X, Y) {
    X[Y] = L.Methods[Y].methodize();
    return X
  });
  if (window.attachEvent) {
    function V(Y) {
      var X;
      switch (Y.type) {
        case "mouseover":
        case "mouseenter":
          X = Y.fromElement;
          break;
        case "mouseout":
        case "mouseleave":
          X = Y.toElement;
          break;
        default:
          return null
      }
      return Element.extend(X)
    }
    var Q = {
      stopPropagation: function() {
        this.cancelBubble = true
      },
      preventDefault: function() {
        this.returnValue = false
      },
      inspect: function() {
        return "[object Event]"
      }
    };
    L.extend = function(Y, X) {
      if (!Y) {
        return false
      }
      if (!A(Y)) {
        return Y
      }
      if (Y._extendedByPrototype) {
        return Y
      }
      Y._extendedByPrototype = Prototype.emptyFunction;
      var Z = L.pointer(Y);
      Object.extend(Y, {
        target: Y.srcElement || X,
        relatedTarget: V(Y),
        pageX: Z.x,
        pageY: Z.y
      });
      Object.extend(Y, H);
      Object.extend(Y, Q);
      return Y
    }
  } else {
    L.extend = Prototype.K
  }
  if (window.addEventListener) {
    L.prototype = window.Event.prototype || document.createEvent("HTMLEvents").__proto__;
    Object.extend(L.prototype, H)
  }
  var v = {
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  };

  function f(X) {
    return v[X] || X
  }
  if (k) {
    f = Prototype.K
  }

  function R(X) {
    if (X === window) {
      return 0
    }
    if (typeof X._prototypeUID === "undefined") {
      X._prototypeUID = Element.Storage.UID++
    }
    return X._prototypeUID
  }

  function I(X) {
    if (X === window) {
      return 0
    }
    if (X == document) {
      return 1
    }
    return X.uniqueID
  }
  if ("uniqueID" in u) {
    R = I
  }

  function x(X) {
    return X.include(":")
  }
  L._isCustomEvent = x;

  function z(Z, Y) {
    var X = D.Event.cache;
    if (Object.isUndefined(Y)) {
      Y = R(Z)
    }
    if (!X[Y]) {
      X[Y] = {
        element: Z
      }
    }
    return X[Y]
  }

  function E(Y, X) {
    if (Object.isUndefined(X)) {
      X = R(Y)
    }
    delete D.Event.cache[X]
  }

  function h(Z, ac, af) {
    var X = z(Z);
    if (!X[ac]) {
      X[ac] = []
    }
    var ab = X[ac];
    var aa = ab.length;
    while (aa--) {
      if (ab[aa].handler === af) {
        return null
      }
    }
    var ad = R(Z);
    var Y = D.Event._createResponder(ad, ac, af);
    var ae = {
      responder: Y,
      handler: af
    };
    ab.push(ae);
    return ae
  }

  function s(ac, Z, ad) {
    var Y = z(ac);
    var X = Y[Z] || [];
    var ab = X.length,
      ae;
    while (ab--) {
      if (X[ab].handler === ad) {
        ae = X[ab];
        break
      }
    }
    if (ae) {
      var aa = X.indexOf(ae);
      X.splice(aa, 1)
    }
    if (X.length === 0) {
      delete Y[Z];
      if (Object.keys(Y).length === 1 && ("element" in Y)) {
        E(ac)
      }
    }
    return ae
  }

  function c(Z, Y, aa) {
    Z = $(Z);
    var ab = h(Z, Y, aa);
    if (ab === null) {
      return Z
    }
    var X = ab.responder;
    if (x(Y)) {
      p(Z, Y, X)
    } else {
      m(Z, Y, X)
    }
    return Z
  }

  function m(aa, Z, Y) {
    var X = f(Z);
    if (aa.addEventListener) {
      aa.addEventListener(X, Y, false)
    } else {
      aa.attachEvent("on" + X, Y)
    }
  }

  function p(Z, Y, X) {
    if (Z.addEventListener) {
      Z.addEventListener("dataavailable", X, false)
    } else {
      Z.attachEvent("ondataavailable", X);
      Z.attachEvent("onlosecapture", X)
    }
  }

  function J(Y, X, Z) {
    Y = $(Y);
    var ab = !Object.isUndefined(Z),
      ac = !Object.isUndefined(X);
    if (!ac && !ab) {
      y(Y);
      return Y
    }
    if (!ab) {
      G(Y, X);
      return Y
    }
    var aa = s(Y, X, Z);
    if (!aa) {
      return Y
    }
    a(Y, X, aa.responder);
    return Y
  }

  function C(aa, Z, Y) {
    var X = f(Z);
    if (aa.removeEventListener) {
      aa.removeEventListener(X, Y, false)
    } else {
      aa.detachEvent("on" + X, Y)
    }
  }

  function b(Z, Y, X) {
    if (Z.removeEventListener) {
      Z.removeEventListener("dataavailable", X, false)
    } else {
      Z.detachEvent("ondataavailable", X);
      Z.detachEvent("onlosecapture", X)
    }
  }

  function y(ac) {
    var ab = R(ac),
      Z = D.Event.cache[ab];
    if (!Z) {
      return
    }
    E(ac, ab);
    var X, aa;
    for (var Y in Z) {
      if (Y === "element") {
        continue
      }
      X = Z[Y];
      aa = X.length;
      while (aa--) {
        a(ac, Y, X[aa].responder)
      }
    }
  }

  function G(ac, Z) {
    var Y = z(ac);
    var X = Y[Z];
    if (X) {
      delete Y[Z]
    }
    X = X || [];
    var ab = X.length;
    while (ab--) {
      a(ac, Z, X[ab].responder)
    }
    for (var aa in Y) {
      if (aa === "element") {
        continue
      }
      return
    }
    E(ac)
  }

  function a(Y, X, Z) {
    if (x(X)) {
      b(Y, X, Z)
    } else {
      C(Y, X, Z)
    }
  }

  function g(X) {
    if (X !== document) {
      return X
    }
    if (document.createEvent && !X.dispatchEvent) {
      return document.documentElement
    }
    return X
  }

  function w(aa, Z, Y, X) {
    aa = g($(aa));
    if (Object.isUndefined(X)) {
      X = true
    }
    Y = Y || {};
    var ab = N(aa, Z, Y, X);
    return L.extend(ab)
  }

  function l(aa, Z, Y, X) {
    var ab = document.createEvent("HTMLEvents");
    ab.initEvent("dataavailable", X, true);
    ab.eventName = Z;
    ab.memo = Y;
    aa.dispatchEvent(ab);
    return ab
  }

  function n(aa, Z, Y, X) {
    var ab = document.createEventObject();
    ab.eventType = X ? "ondataavailable" : "onlosecapture";
    ab.eventName = Z;
    ab.memo = Y;
    aa.fireEvent(ab.eventType, ab);
    return ab
  }
  var N = document.createEvent ? l : n;
  L.Handler = Class.create({
    initialize: function(Z, Y, X, aa) {
      this.element = $(Z);
      this.eventName = Y;
      this.selector = X;
      this.callback = aa;
      this.handler = this.handleEvent.bind(this)
    },
    start: function() {
      L.observe(this.element, this.eventName, this.handler);
      return this
    },
    stop: function() {
      L.stopObserving(this.element, this.eventName, this.handler);
      return this
    },
    handleEvent: function(Y) {
      var X = L.findElement(Y, this.selector);
      if (X) {
        this.callback.call(this.element, Y, X)
      }
    }
  });

  function F(Z, Y, X, aa) {
    Z = $(Z);
    if (Object.isFunction(X) && Object.isUndefined(aa)) {
      aa = X, X = null
    }
    return new L.Handler(Z, Y, X, aa).start()
  }
  Object.extend(L, L.Methods);
  Object.extend(L, {
    fire: w,
    observe: c,
    stopObserving: J,
    on: F
  });
  Element.addMethods({
    fire: w,
    observe: c,
    stopObserving: J,
    on: F
  });
  Object.extend(document, {
    fire: w.methodize(),
    observe: c.methodize(),
    stopObserving: J.methodize(),
    on: F.methodize(),
    loaded: false
  });
  if (D.Event) {
    Object.extend(window.Event, L)
  } else {
    D.Event = L
  }
  D.Event.cache = {};

  function q() {
    D.Event.cache = null
  }
  if (window.attachEvent) {
    window.attachEvent("onunload", q)
  }
  u = null;
  d = null
})(this);
(function(c) {
  var g = document.documentElement;
  var b = "onmouseenter" in g && "onmouseleave" in g;

  function f(h) {
    return !b && (h === "mouseenter" || h === "mouseleave")
  }

  function d(i, h, j) {
    if (Event._isCustomEvent(h)) {
      return e(i, h, j)
    }
    if (f(h)) {
      return a(i, h, j)
    }
    return function(l) {
      if (!Event.cache) {
        return
      }
      var k = Event.cache[i].element;
      Event.extend(l, k);
      j.call(k, l)
    }
  }

  function e(i, h, j) {
    return function(m) {
      var k = Event.cache[i];
      var l = k && k.element;
      if (Object.isUndefined(m.eventName)) {
        return false
      }
      if (m.eventName !== h) {
        return false
      }
      Event.extend(m, l);
      j.call(l, m)
    }
  }

  function a(i, h, j) {
    return function(m) {
      var k = Event.cache[i].element;
      Event.extend(m, k);
      var l = m.relatedTarget;
      while (l && l !== k) {
        try {
          l = l.parentNode
        } catch (n) {
          l = k
        }
      }
      if (l === k) {
        return
      }
      j.call(k, m)
    }
  }
  c.Event._createResponder = d;
  g = null
})(this);
(function(a) {
  var e;

  function b() {
    if (document.loaded) {
      return
    }
    if (e) {
      window.clearTimeout(e)
    }
    document.loaded = true;
    document.fire("dom:loaded")
  }

  function d() {
    if (document.readyState === "complete") {
      document.detachEvent("onreadystatechange", d);
      b()
    }
  }

  function c() {
    try {
      document.documentElement.doScroll("left")
    } catch (f) {
      e = c.defer();
      return
    }
    b()
  }
  if (document.readyState === "complete") {
    b();
    return
  }
  if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", b, false)
  } else {
    document.attachEvent("onreadystatechange", d);
    if (window == top) {
      e = c.defer()
    }
  }
  Event.observe(window, "load", b)
})(this);
Element.addMethods();
Hash.toQueryString = Object.toQueryString;
var Toggle = {
  display: Element.toggle
};
Element.addMethods({
  childOf: Element.Methods.descendantOf
});
var Insertion = {
  Before: function(a, b) {
    return Element.insert(a, {
      before: b
    })
  },
  Top: function(a, b) {
    return Element.insert(a, {
      top: b
    })
  },
  Bottom: function(a, b) {
    return Element.insert(a, {
      bottom: b
    })
  },
  After: function(a, b) {
    return Element.insert(a, {
      after: b
    })
  }
};
var $continue = new Error('"throw $continue" is deprecated, use "return" instead');
var Position = {
  includeScrollOffsets: false,
  prepare: function() {
    this.deltaX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    this.deltaY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  },
  within: function(b, a, c) {
    if (this.includeScrollOffsets) {
      return this.withinIncludingScrolloffsets(b, a, c)
    }
    this.xcomp = a;
    this.ycomp = c;
    this.offset = Element.cumulativeOffset(b);
    return (c >= this.offset[1] && c < this.offset[1] + b.offsetHeight && a >= this.offset[0] && a < this.offset[0] + b.offsetWidth)
  },
  withinIncludingScrolloffsets: function(b, a, d) {
    var c = Element.cumulativeScrollOffset(b);
    this.xcomp = a + c[0] - this.deltaX;
    this.ycomp = d + c[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(b);
    return (this.ycomp >= this.offset[1] && this.ycomp < this.offset[1] + b.offsetHeight && this.xcomp >= this.offset[0] && this.xcomp < this.offset[0] + b.offsetWidth)
  },
  overlap: function(b, a) {
    if (!b) {
      return 0
    }
    if (b == "vertical") {
      return ((this.offset[1] + a.offsetHeight) - this.ycomp) / a.offsetHeight
    }
    if (b == "horizontal") {
      return ((this.offset[0] + a.offsetWidth) - this.xcomp) / a.offsetWidth
    }
  },
  cumulativeOffset: Element.Methods.cumulativeOffset,
  positionedOffset: Element.Methods.positionedOffset,
  absolutize: function(a) {
    Position.prepare();
    return Element.absolutize(a)
  },
  relativize: function(a) {
    Position.prepare();
    return Element.relativize(a)
  },
  realOffset: Element.Methods.cumulativeScrollOffset,
  offsetParent: Element.Methods.getOffsetParent,
  page: Element.Methods.viewportOffset,
  clone: function(b, c, a) {
    a = a || {};
    return Element.clonePosition(c, b, a)
  }
};
if (!document.getElementsByClassName) {
  document.getElementsByClassName = function(b) {
    function a(c) {
      return c.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + c + " ')]"
    }
    b.getElementsByClassName = Prototype.BrowserFeatures.XPath ? function(c, e) {
      e = e.toString().strip();
      var d = /\s/.test(e) ? $w(e).map(a).join("") : a(e);
      return d ? document._getElementsByXPath(".//*" + d, c) : []
    } : function(e, f) {
      f = f.toString().strip();
      var g = [],
        h = (/\s/.test(f) ? $w(f) : null);
      if (!h && !f) {
        return g
      }
      var c = $(e).getElementsByTagName("*");
      f = " " + f + " ";
      for (var d = 0, k, j; k = c[d]; d++) {
        if (k.className && (j = " " + k.className + " ") && (j.include(f) || (h && h.all(function(i) {
            return !i.toString().blank() && j.include(" " + i + " ")
          })))) {
          g.push(Element.extend(k))
        }
      }
      return g
    };
    return function(d, c) {
      return $(c || document.body).getElementsByClassName(d)
    }
  }(Element.Methods)
}
Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(a) {
    this.element = $(a)
  },
  _each: function(b, a) {
    this.element.className.split(/\s+/).select(function(c) {
      return c.length > 0
    })._each(b, a)
  },
  set: function(a) {
    this.element.className = a
  },
  add: function(a) {
    if (this.include(a)) {
      return
    }
    this.set($A(this).concat(a).join(" "))
  },
  remove: function(a) {
    if (!this.include(a)) {
      return
    }
    this.set($A(this).without(a).join(" "))
  },
  toString: function() {
    return $A(this).join(" ")
  }
};
Object.extend(Element.ClassNames.prototype, Enumerable);
(function() {
  window.Selector = Class.create({
    initialize: function(a) {
      this.expression = a.strip()
    },
    findElements: function(a) {
      return Prototype.Selector.select(this.expression, a)
    },
    match: function(a) {
      return Prototype.Selector.match(a, this.expression)
    },
    toString: function() {
      return this.expression
    },
    inspect: function() {
      return "#<Selector: " + this.expression + ">"
    }
  });
  Object.extend(Selector, {
    matchElements: function(f, g) {
      var a = Prototype.Selector.match,
        d = [];
      for (var c = 0, e = f.length; c < e; c++) {
        var b = f[c];
        if (a(b, g)) {
          d.push(Element.extend(b))
        }
      }
      return d
    },
    findElement: function(f, g, b) {
      b = b || 0;
      var a = 0,
        d;
      for (var c = 0, e = f.length; c < e; c++) {
        d = f[c];
        if (Prototype.Selector.match(d, g) && b === a++) {
          return Element.extend(d)
        }
      }
    },
    findChildElements: function(b, c) {
      var a = c.toArray().join(", ");
      return Prototype.Selector.select(a, b || document)
    }
  })
})();
/*! RESOURCE: /scripts/doctype/functions_bootstrap14.js */
var userAgentLowerCase = navigator.userAgent.toLowerCase();
var isMSIE = userAgentLowerCase.indexOf("msie") >= 0;
var ie5 = false;
var isMSIE6 = false
var isMSIE7 = false;
var isMSIE8 = false;
var isMSIE9 = userAgentLowerCase.indexOf("msie 9") >= 0;
var isMSIE10 = userAgentLowerCase.indexOf("msie 10") >= 0;
var isMSIE11 = userAgentLowerCase.indexOf("rv:11.0") > 0;
var isChrome = userAgentLowerCase.indexOf("chrome") >= 0;
var isFirefox = userAgentLowerCase.indexOf("firefox") >= 0;
var isSafari = !isChrome && (userAgentLowerCase.indexOf("safari") >= 0);
var isSafari5 = false;
if (isSafari) {
  try {
    var reSafariVersion = new RegExp("version/([\\d\\.]{3,5}) safari/");
    var results = reSafariVersion.exec(userAgentLowerCase);
    if (results.length > 0) {
      var reMajor = new RegExp("([\\d]).");
      var results = reMajor.exec(results[1]);
      if (results.length > 0) {
        var mv = parseInt(results[1]);
        isSafari5 = mv < 6;
      }
    }
  } catch (e) {}
}
var isMacintosh = userAgentLowerCase.indexOf("macintosh") >= 0;
var isWebKit = navigator.userAgent.indexOf("WebKit") >= 0;
var isTouchDevice = navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1;
var GJSV = 1.0;
(function() {
  var defined = {};
  var waiting = {};

  function listen(id, then) {
    if (typeof id !== 'string')
      listenMany(id, then);
    if (defined[id]) {
      return then(defined[id]);
    }
    if (!waiting[id]) {
      waiting[id] = [];
    }
    waiting[id].push(then);
  }

  function emit(id, data) {
    defined[id] = data;
    var listeners = waiting[id];
    if (!listeners) {
      return;
    }
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i](data);
    }
    waiting[id] = [];
  }

  function listenMany(dependencies, then) {
    if (typeof dependencies.length === 'undefined') {
      return;
    }
    var unDef = {
      isUndefined: true
    };
    var resolved = [];

    function resolve(dep, i) {
      resolved[i] = dep;
      for (var i = 0, l = resolved.length; i < l; i++) {
        if (resolved[i] === unDef)
          return;
      }
      then.apply(undefined, resolved);
    };
    dependencies.forEach(function(depId, idx) {
      resolved[idx] = unDef;
      listen(depId, function(dep) {
        resolve(dep, idx);
      });
    });
  }
  window.CachedEvent = {
    after: listen,
    emit: emit
  };
})();
var g_afterPageLoadedFunctions = [];
window.g_render_functions = window.g_render_functions || [];
window.g_load_functions = window.g_load_functions || [];
window.g_late_load_functions = window.g_late_load_functions || [];

function runBeforeRender() {
  _runInlineScripts();
  jslog("runBeforeRender");
  for (var i = 0; i != g_render_functions.length; i++) {
    var f = g_render_functions[i];
    f.call();
  }
}

function _runInlineScripts() {
  var inlineScripts = $j('script[type="application/javascript-deferred"]');
  jslog("running inline scripts, count: " + inlineScripts.length);
  inlineScripts.each(function(index, item) {
    var script = $j(item).text();
    try {
      $j.globalEval(script);
    } catch (e) {
      jslog("error in script " + script);
    }
  });
}
window.g_hasRunAfterAllLoaded = false;

function runAfterAllLoaded() {
  if (g_hasRunAfterAllLoaded) {
    jslog("Redundant call to runAfterAllLoaded");
    return;
  }
  g_hasRunAfterAllLoaded = true;
  var sw = new StopWatch();
  jslog("runAfterAllLoaded, functions: " + g_load_functions.length);
  for (var i = 0; i != g_load_functions.length; i++) {
    var f = g_load_functions[i];
    var t = new Date().getTime();
    f.call();
    t = new Date().getTime() - t;
    if (t > 5000)
      jslog("Time: " + t + " for: [" + i + "] " + f);
  }
  jslog("late load functions: " + g_late_load_functions.length);
  for (var i = 0; i != g_late_load_functions.length; i++) {
    var f = g_late_load_functions[i];
    f.call();
  }
  window.self.loaded = true;
  sw.jslog("runAfterAllLoaded finished");
}

function addLoadEvent(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_load_functions.push(func);
}

function addLateLoadEvent(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_late_load_functions.push(func);
}

function pageLoaded() {
  CustomEvent.observe("body_clicked", contextMenuHide);
  setMandatoryExplained.defer();
}

function addRenderEvent(func) {
  if (isRenderEventRegistered(func))
    return;
  addRenderEventToArray(func);
}

function addRenderEventToArray(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_render_functions.push(func);
}

function isRenderEventRegistered(func) {
  var s = func.toString();
  for (var i = 0; i < g_render_functions.length; i++)
    if (g_render_functions[i].toString() == s)
      return true;
  return false;
}

function addRenderEventLogged(func, name, funcname) {
  addRenderEventToArray(function() {
    CustomEvent.fire('glide_optics_inspect_put_cs_context', funcname, 'load');
    var sw = new StopWatch();
    var __rtmr = new Date();
    try {
      func();
    } catch (e) {
      jslog('***************************************************');
      jslog('A script has encountered an error in render events');
      jslog(e);
      jslog('Script ends. Continuing happily');
      jslog('***************************************************');
    }
    CustomEvent.fire('page_timing', {
      name: 'CSOL',
      child: {
        description: name.substr(7),
        sys_id: g_event_handler_ids[funcname],
        source_table: 'sys_script_client'
      },
      startTime: __rtmr,
      win: window
    });
    sw.jslog(name);
    CustomEvent.fire('glide_optics_inspect_pop_cs_context', funcname, 'load');
  });
}

function addTopRenderEvent(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_render_functions.unshift(func);
}

function addAfterPageLoadedEvent(func) {
  if (window.self.loaded) {
    setTimeout(func, 0);
    return;
  }
  g_afterPageLoadedFunctions.push(func);
}

function runAfterPageLoadedEvents() {
  jslog("after page loaded starting");
  var sw = new StopWatch();
  for (var i = 0; i != g_afterPageLoadedFunctions.length; i++) {
    var f = g_afterPageLoadedFunctions[i];
    f.call();
  }
  sw.jslog("after page loaded complete, functions called: " + g_afterPageLoadedFunctions.length);
  g_afterPageLoadedFunctions = [];
}
addLateLoadEvent(function() {
  setTimeout(runAfterPageLoadedEvents, 30);
});

function addUnloadEvent(func) {
  Event.observe(window, 'unload', func, false);
}

function addTinymceLoadEvent(id, func) {
  CachedEvent.after('tinyeditor_init.' + id, func);
}

function fireTinymceLoadEvent(id, ed) {
  CachedEvent.emit('tinyeditor_init.' + id, ed);
}

function gel(id) {
  if (typeof id != 'string')
    return id;
  return document.getElementById(id);
}

function cel(name, parent) {
  var e = document.createElement(name);
  if (arguments.length > 1)
    parent.appendChild(e);
  return e;
}

function rel(id) {
  var e = gel(id);
  if (e)
    e.parentNode.removeChild(e);
}

function addChild(element) {
  getFormContentParent().appendChild(element);
}

function inner(id, data) {
  var el = gel(id);
  if (el != null)
    el.innerHTML = data;
}

function clearNodes(t) {
  if (!t)
    return;
  while (t.hasChildNodes())
    t.removeChild(t.childNodes[0]);
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

function inFrame() {
  return getTopWindow() != window.self;
}

function getMainWindow() {
  var topWindow = getTopWindow();
  return topWindow['gsft_main'];
}

function getMainFormWindow() {
  var topWindow = getTopWindow();
  return topWindow['gsft_main_form'];
}

function getNavWindow() {
  var topWindow = getTopWindow();
  return topWindow['gsft_nav'];
}

function reloadWindow(win) {
  var href = win.location.href;
  var len = href.length;
  if (win.frames['iframe_live_feed'] && href.endsWith('#') && len > 2)
    href = href.substring(0, len - 2)
  href = addDomainParameters(href);
  win.location.href = href;
}

function addDomainParameters(href) {
  var url = new GlideURL(href);
  if (url.getParam('sysparm_domain') == 'picker') {
    url.deleteParam('sysparm_domain');
  } else {
    var domainElement = gel('sysparm_domain');
    if (domainElement) {
      if (domainElement.value != 'picker') {
        url.addParam('sysparm_domain', domainElement.value);
        var domainScope = gel('sysparm_domain_scope');
        if (domainScope) {
          url.addParam('sysparm_domain_scope', domainScope.value);
        }
      }
    }
  }
  url.addParam('sysparm_nostack', 'true');
  url.setEncode(false);
  return url.getURL();
}

function addOnSubmitEvent(form, func, funcname) {
  if (!form)
    return;
  var oldonsubmit = form.onsubmit;
  if (typeof form.onsubmit != 'function')
    form.onsubmit = func;
  else {
    form.onsubmit = function() {
      var formFuncCalled = false;
      try {
        if (oldonsubmit() == false)
          return false;
        CustomEvent.fire('glide_optics_inspect_put_cs_context', funcname, 'submit');
        formFuncCalled = true;
        var returnvalue = func();
        formFuncCalled = false;
        CustomEvent.fire('glide_optics_inspect_pop_cs_context', funcname, 'submit');
        if (returnvalue == false)
          return false;
        return true;
      } catch (ex) {
        if (formFuncCalled)
          CustomEvent.fire('glide_optics_inspect_pop_cs_context', funcname, 'load');
        formFuncError("onSubmit", func, ex);
        return false;
      }
    }
  }
  form = null;
}

function formFuncError(type, func, ex) {
  var funcStr = func.toString();
  funcStr = funcStr.replace(/onSubmit[a-fA-F0-9]{32}\(/, "onSubmit(");
  var msg;
  if (g_user.hasRole("client_script_admin"))
    msg = type + " script error: " + ex.toString() + ":<br/>" + funcStr.replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
  else
    msg = "Submit canceled due to a script error - please contact your System Administrator";
  g_form.addErrorMessage(msg);
  CustomEvent.fire('glideform:script_error', type + " script error: " + ex.toString() + "\n" + funcStr);
}

function hide(element) {
  var e = typeof element === "string" ? gel(element) : element;
  if (!e)
    return;
  e.style.display = 'none';
  _frameChanged();
}

function show(element) {
  var e = typeof element === "string" ? gel(element) : element;
  if (!e)
    return;
  if (e.tagName == "TR")
    e.style.display = 'table-row';
  else
    e.style.display = 'block';
  _frameChanged();
}

function hideObject(o, visibilityOnly) {
  if (!o)
    return;
  o.style.visibility = "hidden";
  if (!visibilityOnly)
    o.style.display = "none";
  _frameChanged();
}

function showObject(o, visibilityOnly) {
  if (!o)
    return;
  o.style.visibility = "visible";
  if (!visibilityOnly)
    o.style.display = "block";
  _frameChanged();
}

function showObjectInline(o) {
  if (!o)
    return;
  o.style.visibility = "visible";
  o.style.display = "inline";
  _frameChanged();
}

function showObjectInlineBlock(o) {
  if (!o)
    return;
  o.style.visibility = "visible";
  o.style.display = "inline-block";
  _frameChanged();
}

function focusFirstElement(form) {
  try {
    var e = findFirstEditableElement(form);
    if (e) {
      Field.activate(e);
      triggerEvent(e, 'focus', true);
    }
  } catch (ex) {}
}

function findFirstEditableElement(form) {
  var tags = ['input', 'select', 'textarea'];
  var elements = form.getElementsByTagName('*');
  for (var i = 0, n = elements.length; i < n; i++) {
    var element = elements[i];
    if (element.type == 'hidden')
      continue;
    var tagName = element.tagName.toLowerCase();
    if (!tags.include(tagName))
      continue;
    element = $(element);
    var formGroup = element.up('.form-group');
    if (!element.disabled &&
      (window.g_accessibility ? true : !element.readOnly) &&
      element.style.visibility != 'hidden' &&
      element.style.display != 'none' &&
      element.offsetParent != null &&
      formGroup &&
      formGroup.style.display != 'none')
      return element;
  }
  return null;
}

function triggerEvent(element, eventType, canBubble, memo) {
  canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
  if (element && element.disabled && eventType == "change" && element.onchange) {
    element.onchange.call(element);
    return;
  }
  if (element.fireEvent) {
    element.fireEvent('on' + eventType);
  } else {
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent(eventType, canBubble, true);
    evt.memo = memo;
    element.dispatchEvent(evt, true);
  }
}
var g_form_dirty_message;

function onWindowClose() {
  if (typeof g_form == 'undefined')
    return;
  if (!g_form.submitted && g_form.modified) {
    g_submitted = false;
    setTimeout(function() {
      CustomEvent.fireTop('glide:nav_form_dirty_cancel_stay', window);
    }, 750);
    return g_form_dirty_message;
  }
  g_form.submitted = false;
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
    } else if (parent.parent && parent.parent.jslog && jslog != parent.parent.jslog) {
      parent.parent.jslog(msg, src, dateTime);
    } else {
      if (window.console && window.console.log)
        console.log(msg);
    }
  } catch (e) {}
}

function getXMLIsland(name) {
  var xml = gel(name);
  if (xml == null)
    return null;
  xml = "<xml>" + xml.innerHTML + "</xml>";
  xml = loadXML(xml);
  return xml;
}

function lock(me, ref, edit_id, nonedit_id, current_value_id, update_id) {
  if (me)
    me.style.display = "none";
  var unlock = gel(ref + '_unlock');
  unlock.style.display = "";
  var edit_span = gel(edit_id);
  edit_span.style.display = "none";
  var nonedit_span = gel(nonedit_id);
  nonedit_span.style.display = "inline-block";
  var current_value = gel(current_value_id);
  var the_value = "";
  if (current_value.options) {
    for (var i = 0; i < current_value.options.length; i++) {
      if (i > 0)
        the_value += g_glide_list_separator;
      the_value += current_value.options[i].text;
    }
  } else
    the_value = current_value.value;
  var update_element = gel(update_id);
  if (update_element.href)
    update_element.href = the_value;
  update_element.innerHTML = htmlEscape(the_value);
  unlock.focus();
}

function unlock(me, ref, edit_id, nonedit_id) {
  if (me)
    me.style.display = "none";
  var unlock = gel(ref + '_lock');
  if (unlock)
    showObjectInlineBlock(unlock);
  var edit_span = gel(edit_id);
  edit_span.style.display = "";
  var nonedit_span = gel(nonedit_id);
  nonedit_span.style.display = "none";
  var list_foc = gel("sys_display." + ref);
  if (list_foc) {
    try {
      list_foc.focus();
    } catch (e) {}
  }
}

function setMandatoryExplained(enforce) {
  var showexp = gel('mandatory_explained');
  if (!showexp)
    return;
  if (enforce || foundAMandatoryField())
    showexp.style.display = "inline";
  else
    showexp.style.display = "none";
}

function foundAMandatoryField() {
  var spanTags = document.getElementsByTagName('span');
  if (!spanTags)
    return false;
  for (var c = 0, n = spanTags.length; c != n; ++c) {
    var spanTag = spanTags[c];
    var id = spanTag.id;
    if (!id)
      continue;
    if (id.indexOf('status.') == 0) {
      var mandatory = spanTag.getAttribute("mandatory") + "";
      if (mandatory == 'true')
        return true;
    }
  }
  return false;
}
var _frameChangedTimer = null;

function _frameChanged() {
  if (_frameChangedTimer)
    clearTimeout(_frameChangedTimer);
  _frameChangedTimer = setTimeout(function() {
    _frameChangedTimer = null;
    CustomEvent.fire('frame.resized');
    CustomEvent.fire('refresh.event');
  }, 300);
}

function getFormContentParent() {
  var glideOverlay = $(document.body).select("div.glide_overlay");
  var exposeMask = $('glide_expose_mask');
  if (glideOverlay.length > 0 && exposeMask && exposeMask.visible())
    return glideOverlay[0];
  if (typeof g_section_contents == 'undefined' || !g_section_contents)
    g_section_contents = $(document.body).select(".section_header_content_no_scroll");
  if (g_section_contents.length > 0)
    return g_section_contents[0];
  return document.body;
}

function addClassName(element, name) {
  if (!element)
    return;
  $(element).addClassName(name);
}

function removeClassName(element, name) {
  if (!element)
    return;
  $(element).removeClassName(name);
}

function hasClassName(element, name) {
  if (!element)
    return;
  if (!element.hasClassName)
    return;
  return $(element).hasClassName(name);
}

function getIFrameDocument(iframe) {
  return iframe.contentWindow ? iframe.contentWindow.document : (iframe.contentDocument || null);
}

function writeTitle(element, title) {
  element.title = title;
  if (element.alt)
    element.alt = title;
  if (element.getAttribute('disabled') == 'disabled')
    element.style.pointerEvents = 'auto';
}

function contextMenuHide(e) {
  if (typeof contextHide === 'undefined')
    return;
  if (!isMSIE && e) {
    if (isTouchDevice && !isTouchRightClick(e)) {
      if (e.type == 'touchend' && $(e.target).up('.context_menu'))
        return;
      contextHide();
    } else if (isLeftClick(e)) {
      contextHide();
    }
  } else
    contextHide();
}

function trim(s) {
  return s.replace(/^\s+|\s+$/g, '');
}

function htmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g,
    "&quot;").replace(/</g, "&#60;").replace(/>/g, "&#62;");
}

function htmlEscapeQuote(s) {
  return s.replace(/'/g, "&#39;");
}

function htmlEscapeDoubleQuote(s) {
  return s.replace(/"/g, "&quot;");
}

function loadXML(r) {
  var xml = r.responseXML;
  if (typeof xml != 'undefined')
    return xml;
  var dom = null;
  try {
    dom = new DOMParser().parseFromString(r, 'text/xml');
  } catch (e) {}
  return dom;
}
if (!window.GwtDateTimePicker) {
  window.GwtDateTimePicker = function(name, format, showTime) {
    ScriptLoader.getScripts('scripts/classes/GwtDateTimePicker.js', function() {
      new GwtDateTimePicker(name, format, showTime);
    });
  }
};
/*! RESOURCE: /scripts/doctype/functions.js */
function isDoctype() {
  return true;
}

function gsftSubmitBack() {
  var backButton = document.getElementById('sysverb_back');
  checkDirtyForm(function save() {
    if (isDirtyFormAutosave())
      gsftSubmit(backButton);
    else
      gsftSubmit(null, $j(backButton).closest('form')[0], 'sysverb_check_save');
  }, function discard() {
    gsftSubmit(backButton);
  });
}

function gsftSubmit(control, form, action_name) {
  var f;
  if (typeof form == "undefined") {
    f = findParentByTag(control, 'form');
    if (typeof form == "undefined") {
      var sectionFormId = $("section_form_id");
      if (sectionFormId)
        f = $(sectionFormId.value);
    }
  } else
    f = form;
  if (g_submitted)
    return false;
  if (typeof action_name == "undefined" && control)
    action_name = control.id;
  if (action_name == 'sysverb_delete') {
    if (!confirm(getMessage("Delete this record") + "?")) {
      g_submitted = false;
      return false;
    }
  }
  f.sys_action.value = action_name;
  if (typeof f.onsubmit == "function" && action_name != 'sysverb_back') {
    var rc = f.onsubmit();
    if (rc === false) {
      g_submitted = g_form.submitted = false;
      return false;
    }
  }
  if (control && control.getAttribute('gsft_id')) {
    action_name = control.getAttribute('gsft_id');
    f.sys_action.value = action_name;
  }
  if (action_name == 'sysverb_back')
    g_submitted = false;
  else
    g_submitted = true;
  if (typeof g_form != 'undefined' && g_form && g_submitted)
    g_form.enableUIPolicyFields();
  CustomEvent.fire("glide:form_submitted");
  try {
    GlideAjax.disableSessionMessages();
    f.submit();
  } catch (ex) {
    GlideAjax.enableSessionMessages();
    if (ex.message.indexOf('Unspecified') == -1)
      throw ex;
  }
  return false;
}

function setCheckBox(box) {
  var name = box.name;
  var id = name.substring(3);
  var frm = box.form;
  if (frm)
    frm[id].value = box.checked;
  else {
    var widget = $(id);
    if (widget)
      widget.value = box.checked;
  }
  if (box['onchange'])
    box.onchange();
}

function populateParmQuery(form, prefix, defaultNULL, action) {
  var keys = ['No records selected', 'Delete the selected item?', 'Delete these', 'items?'];
  var msgs = getMessages(keys);
  var keyset = getChecked(form);
  if (!action)
    action = form.sys_action.value;
  if (action.indexOf("sysverb") != 0) {
    if (keyset == '') {
      if (!alert(msgs["No records selected"]))
        return false;
    } else {
      if (action == "delete_checked") {
        var items = keyset.split(",");
        if (items.length == 1) {
          if (!confirm(msgs["Delete the selected item?"]))
            return false;
        } else if (items.length > 0) {
          if (!confirm(msgs["Delete these"] + " " + items.length + " " + msgs["items?"]))
            return false;
        }
      }
    }
  } else if (form.sys_action.value == "sysverb_new") {
    addInput(form, 'HIDDEN', 'sys_id', '-1');
  }
  if (keyset == '' && defaultNULL)
    keyset = defaultNULL;
  if (prefix)
    keyset = prefix + keyset;
  addInput(form, 'HIDDEN', 'sysparm_checked_items', keyset);
  return true;
}

function getChecked(form) {
  var keyset = '';
  var lookup = form;
  for (i = 0; i < lookup.elements.length; i++) {
    if (lookup.elements[i].type != "checkbox")
      continue;
    var v = lookup.elements[i];
    if (v.checked) {
      var id = v.id.substring(3);
      var skip = v.name.substring(0, 4);
      if (skip == "SKIP")
        continue;
      if (id == "all")
        continue;
      if (keyset == '')
        keyset = id;
      else
        keyset = keyset + ',' + id;
    }
  }
  return keyset;
}

function iterateList(e, row, value, update) {
  update = (typeof update === 'undefined') ? true : update;
  if (update)
    g_form.setMandatoryOnlyIfModified(true);
  var form = g_form.getFormElement();
  form.sys_action.value = value;
  var query = e.getAttribute("query");
  addInput(form, 'HIDDEN', 'sys_record_row', row);
  addInput(form, 'HIDDEN', 'sys_record_list', query);
  if (update && typeof form.onsubmit == "function") {
    var rc = form.onsubmit();
    if (!rc) {
      g_submitted = false;
      return false;
    }
  }
  try {
    form.submit();
  } catch (ex) {
    if (ex.message.indexOf('Unspecified') == -1)
      throw ex;
  }
  return false;
}

function refreshNav() {
  CustomEvent.fireTop('navigator.refresh');
}

function checkSave(tableName, urlBase, idField, refKey, viewOverride) {
  var sysid = document.getElementsByName(idField)[0].value;
  checkSaveID(tableName, urlBase, sysid, refKey, viewOverride);
}

function checkSaveID(tableName, urlBase, sysid, refKey, viewOverride) {
  sysid = trim(sysid);
  var url = urlBase + "?sys_id=" + sysid;
  if (refKey)
    url += "&sysparm_refkey=" + refKey;
  if (viewOverride) {
    url += "&sysparm_view=" + viewOverride;
  } else {
    var view = $('sysparm_view');
    if (view != null) {
      view = view.value;
      if (view != '')
        url += "&sysparm_view=" + view;
    }
  }
  var nameOfStack = $('sysparm_nameofstack');
  if (nameOfStack != null) {
    nameOfStack = nameOfStack.value;
    if (nameOfStack != '')
      url += "&sysparm_nameofstack=" + nameOfStack;
  }
  if (typeof GlideTransactionScope != 'undefined') {
    GlideTransactionScope.appendTransactionScope(function(name, value) {
      url += "&" + name + "=" + value;
    });
  }
  return checkSaveURL(tableName, url);
}

function isDirtyFormAutosave() {
  return !window.g_form_dirty_support || window.g_form_dirty_autosave || !window.g_form || !g_form.modified;
}

function checkDirtyForm(successCallback, discardCallback) {
  if (isDirtyFormAutosave()) {
    successCallback();
    return;
  }
  var gm = new GlideModal('dirty_form_modal_confirmation');
  gm.setSize(200);
  gm.setTitle(getMessage('Save changes'));
  var content = $j(new XMLTemplate('dirty_form_modal').evaluate({
    displayValue: g_form.getDisplayValue()
  }));
  content.on('click', 'button', function(evt) {
    var button = evt.target;
    if (button.getAttribute('data-action') == 'discard') {
      g_form.modified = false;
      discardCallback();
    } else if (button.getAttribute('data-action') == 'save') {
      successCallback();
    }
  });
  gm.renderWithContent(content);
}

function checkSaveURL(tableName, url) {
  checkDirtyForm(function save() {
    saveAndRedirect(tableName, url);
  }, function discard() {
    g_navigation.open(url);
  });
}

function saveAndRedirect(tableName, url) {
  if (g_submitted)
    return false;
  var f = document.getElementById(tableName + ".do");
  if (g_form.getTableName() == tableName) {
    var fs = document.forms;
    for (var z = 0; z < fs.length; z++) {
      if (typeof fs[z].sys_uniqueValue != 'undefined') {
        f = fs[z];
        break;
      }
    }
  }
  if (!g_form.isNewRecord())
    g_form.setMandatoryOnlyIfModified(true);
  f.sys_action.value = 'sysverb_check_save';
  addInput(f, 'HIDDEN', 'sysparm_goto_url', url);
  if (typeof f.onsubmit == "function") {
    var rc = f.onsubmit();
    if (!rc) {
      g_submitted = false;
      return false;
    }
  }
  g_submitted = true;
  if (typeof g_form != 'undefined' && g_form)
    g_form.enableUIPolicyFields();
  f.submit();
  return false;
}

function submitTextSearch(event, tableName) {
  if (event != true && event.keyCode != 13)
    return;
  var form = getControlForm(tableName);
  addHidden(form, 'sysverb_textsearch', form['sys_searchtext'].value);
  addHidden(form, 'sysparm_query', '');
  addHidden(form, 'sysparm_referring_url', '');
  form.submit();
}

function getControlForm(name) {
  var form = document.forms[name + '_control'];
  if (isSafari || isChrome) {
    if (form) {
      var collectionType = form.toString();
      if (collectionType != "[object HTMLFormElement]")
        form = form[0];
    }
  }
  return form;
}

function getFormForList(listId) {
  return $(listId + "_control");
}

function getFormForElement(element) {
  var f = element.form;
  if (f)
    return f;
  return findParentByTag(element, "form");
}

function hideReveal(sectionName, imagePrefix, snap) {
  var el = $(sectionName);
  if (!el)
    return;
  var $s = $j('#section-' + sectionName);
  if ($s.length == 0)
    return _hideRevealDirect(sectionName, imagePrefix, snap);
  var $b = $j(".section-content", $s);
  if ($s.hasClass("state-closed"))
    $b.show("medium");
  else
    $b.hide("medium");
  $s.toggleClass('state-closed');
  setPreference("collapse.section." + sectionName, $s.hasClass('state-closed') ? "true" : "false");
}

function _hideRevealDirect(sectionName, imagePrefix, snap) {
  var el = $(sectionName);
  if (!el)
    return;
  var img = $("img." + sectionName);
  var imageName = "section";
  if (imagePrefix)
    imageName = imagePrefix;
  if (el.style.display == "block") {
    hide(el);
    if (img) {
      img.src = "images/" + imageName + "_hide.gifx";
      img.alt = getMessage("Display / Hide");
    }
  } else {
    show(el);
    if (img) {
      img.src = "images/" + imageName + "_reveal.gifx";
      img.alt = getMessage("Display / Hide");
    }
  }
}

function hideRevealWithTitle(name, hideMsg, showMsg) {
  var el = $(name);
  if (!el)
    return;
  var img = $("img." + name);
  if (el.style.display == "block") {
    el.style.display = "none";
    img.src = "images/section_hide.gifx"
    img.title = showMsg;
    img.alt = showMsg;
  } else {
    el.style.display = "block";
    img.src = "images/section_reveal.gifx"
    img.title = hideMsg;
    img.alt = hideMsg;
  }
}

function forceHideWithTitle(name, msg) {
  var el = $(name);
  if (!el)
    return;
  var img = $("img." + name);
  el.style.display = "none";
  img.src = "images/section_hide.gifx"
  img.title = msg;
  img.alt = msg;
}

function forceHide(sectionName) {
  var el = $(sectionName);
  if (!el)
    return;
  var img = $("img." + sectionName);
  el.style.display = "none";
  img.src = "images/section_hide.gifx";
  img.alt = getMessage("Collapse");
}

function forceReveal(sectionName, sectionNameStarts, tagName) {
  var els = $$(tagName);
  if (els) {
    for (var c = 0; c < els.length; ++c) {
      if (els[c].id.indexOf(sectionNameStarts) == 0) {
        forceHide(els[c].id);
      }
    }
  }
  var el = $(sectionName);
  if (!el)
    return;
  var img = $("img." + sectionName);
  el.style.display = "block";
  img.src = "images/section_reveal.gif";
  img.alt = getMessage("Expand");
  window.location = '#' + sectionName;
}

function insertAtCursor(textField, value) {
  if (document.selection) {
    textField.focus();
    sel = document.selection.createRange();
    sel.text = value;
  } else if (textField.selectionStart || textField.selectionStart == 0) {
    var startPos = textField.selectionStart;
    var endPos = textField.selectionEnd;
    textField.value = textField.value.substring(0, startPos) + value +
      textField.value.substring(endPos, textField.value.length);
  } else {
    textField.value += value;
  }
}

function insertScriptVar(textBoxName, selectBoxName) {
  var textBox = $(textBoxName);
  var select = $(selectBoxName);
  var options = select.options;
  for (var i = 0; i != select.length; i++) {
    var option = options[i];
    if (!option.selected)
      continue;
    var label = option.text;
    var v = option.value.split('.');
    v = 'current.' + v[1];
    insertAtCursor(textBox, v);
  }
}

function fieldTyped(me) {
  formChangeKeepAlive();
}

function setPreference(name, value, func) {
  var u = getActiveUser();
  if (u)
    u.setPreference(name, value);
  var url = new GlideAjax("UserPreference");
  url.addParam("sysparm_type", "set");
  url.addParam("sysparm_name", name);
  url.addParam("sysparm_value", value);
  url.getXML(func);
}

function deletePreference(name) {
  var u = getActiveUser();
  if (u)
    u.deletePreference(name);
  var url = new GlideAjax("UserPreference");
  url.addParam("sysparm_type", "delete");
  url.addParam("sysparm_name", name);
  url.getXML(doNothing);
}

function getPreference(name) {
  var u = getActiveUser();
  if (u) {
    var opinion = u.getPreference(name);
    if (typeof opinion != 'undefined')
      return opinion;
  }
  var url = new GlideAjax("UserPreference");
  url.addParam("sysparm_type", "get");
  url.addParam("sysparm_name", name);
  var xml = url.getXMLWait();
  if (!xml)
    return '';
  var items = xml.getElementsByTagName("item");
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var value = item.getAttribute("value");
    if (u)
      u.setPreference(name, value);
    return value;
  }
  return '';
}

function getActiveUser() {
  return getTopWindow().g_active_user || window.g_user;
}

function labelClicked(label, elementType) {
  var hFor = label.htmlFor;
  if (hFor) {
    var elpaco = $("sys_display." + hFor);
    if (!elpaco || elpaco.type == "hidden")
      elpaco = $(hFor);
    if (elpaco && elpaco.type != "hidden" && elpaco.style.visibility != "hidden") {
      if (elpaco.disabled != true) {
        if (elementType == "html" || elementType == "translated_html") {
          var handler = g_form.elementHandlers[hFor];
          if (handler && handler.focusEditor) {
            handler.focusEditor();
          }
        } else {
          elpaco.focus();
        }
      }
    }
  }
  return false;
}

function insertFieldName(textBoxName, label) {
  var textBox = $(textBoxName);
  var index = label.indexOf(":");
  if (index > -1)
    insertAtCursor(textBox, "\n" + label);
  else
    insertAtCursor(textBox, label);
  var form = textBox.up('form');
  if (form) {
    var onChangeData = {
      id: textBox.id,
      value: textBox.value,
      modified: true
    };
    form.fire('glideform:onchange', onChangeData);
  }
}

function replaceRegEx(text, doc, tableName) {
  var s = "";
  var re = new RegExp("%\\{\\w+[\\}]");
  var m = re.exec(text);
  if (m != null) {
    for (i = 0; i < m.length; i++) {
      s = s + m[i];
    }
  }
  if (tableName.indexOf('.') > 0)
    tableName = tableName.split('.')[0];
  if (s.length > 0) {
    var field = s.substring(2, s.length - 1);
    var obj = doc.getElementById("sys_display." + tableName + "." + field);
    var val = "?";
    if (obj != null)
      val = obj.value;
    if (val.length == 0) {
      var labelText = "?";
      var labels = doc.getElementsByTagName("label");
      for (i = 0; i < labels.length; i++) {
        if (labels[i].htmlFor == tableName + "." + field) {
          labelText = labels[i].innerHTML;
          break;
        }
      }
      if (labelText.indexOf(':') > 0)
        labelText = labelText.split(':')[0];
      val = labelText;
    }
    re = new RegExp("%\\{" + field + "[\\}]", "g");
    var result = text.replace(re, val);
    if (result.indexOf("%{") > 0)
      result = replaceRegEx(result, doc, tableName);
    return result;
  }
  return text;
}

function toggleInline(name) {
  _toggleDisplay(name, 'inline');
}

function _toggleDisplay(name, displayType) {
  var e = $(name);
  if (e.style.display == 'none') {
    e.style.display = displayType;
    setPreference(name, displayType, null);
  } else {
    e.style.display = 'none';
    setPreference(name, 'none', null);
  }
}

function textareaResizer(id, change) {
  objectResizer(id, change, 'rows');
}

function textareaSizer(id, rows) {
  var element = $(id);
  if (element)
    setAttributeValue(element, 'rows', rows);
}

function selectResizer(id, change) {
  objectResizer(id, change, 'size');
}

function objectResizer(id, change, attrName) {
  var element = $(id);
  if (!element)
    return;
  var value = parseInt(element.style.height, 10)
  value += change;
  if (value < 1)
    value = 1;
  if (element.tagName == 'INPUT') {
    element = $("div." + id);
    if (element) {
      if (change > 0) {
        element.show();
      } else {
        element.hide();
        value = 1;
      }
    }
  } else {
    var oldRows = element.rows;
    element.style.height = value + 'px';
    handleMaxMinHeights(element, value);
    resizeTextAreaIframe(true, id, value);
  }
  setPreference('rows.' + id, value);
  _frameChanged();
}

function handleMaxMinHeights(element, height) {
  if (!element || !height)
    return;
  var $element = $(element),
    maxHeight = parseInt($element.getStyle('maxHeight'), 10),
    minHeight = parseInt($element.getStyle('minHeight'), 10),
    id = getAttributeValue($element, 'id');
  if (height >= maxHeight) {
    $('sizer_plus_' + id).addClassName('disabled');
    $element.setStyle({
      overflowY: 'auto'
    });
    return;
  }
  if (height <= minHeight) {
    $('sizer_minus_' + id).addClassName('disabled');
    return;
  }
  $('sizer_plus_' + id).removeClassName('disabled');
  $('sizer_minus_' + id).removeClassName('disabled');
}

function resizeTextAreaIframe() {
  var args = Array.prototype.slice.call(arguments, 0),
    tf = $("textarea_iframe." + id),
    doctype = args[0],
    id = args[1],
    height,
    oldRows,
    rows;
  if (doctype) {
    height = args[2];
  } else {
    rows = args[2];
    oldRows = args[3];
  }
  if (!tf) {
    tf = $(id + '_ifr');
    if (!tf)
      tf = $('textarea_iframe.' + id);
    if (tf) {
      var tbl = $(id + '_tbl');
      var readOnlyDiv = $(id + '_readOnlyDiv');
      if (doctype) {
        tf.style.height = (height + 60) + "px";
        if (tbl) {
          tbl.style.height = (height + 60) + "px";
        }
        if (readOnlyDiv) {
          readOnlyDiv.style.height = (height + 60) + "px";
        }
      } else {
        var elHeight = parseInt(tf.clientHeight);
        if (elHeight == 0 && readOnlyDiv)
          elHeight = parseInt(readOnlyDiv.style.height);
        var pixelsPerRow = 12;
        var newHeight = elHeight + (rows - oldRows) * pixelsPerRow;
        tf.style.height = newHeight + "px";
        if (tbl) {
          tbl.style.height = (parseInt(tbl.style.height) + (newHeight - elHeight)) + "px";
        }
        if (readOnlyDiv) {
          readOnlyDiv.style.height = newHeight + "px";
        }
      }
    }
  }
  if (!tf)
    return;
  if (!tf.parentNode)
    return;
  if (!tf.parentNode.nextSibling)
    return;
  var nid = tf.parentNode.nextSibling.id;
  if (nid != id)
    return;
  var elHeight = tf.clientHeight;
  var pixelsPerRow = Math.round(elHeight / oldRows);
  tf.style.height = rows * pixelsPerRow + "px";
}

function toggleQuestionRows(thisclass, display, fl) {
  forcelabels = false;
  if (fl == true)
    forcelabels = true;
  var rows = $(document.body).select('.' + thisclass);
  for (i = 0; i < rows.length; i++) {
    var element = rows[i];
    var id = element.id;
    if ('CATEGORY_LABEL' != id || forcelabels)
      element.style.display = display;
  }
  var openStyle = 'none';
  var closedStyle = 'none';
  if ('none' == display)
    openStyle = '';
  else
    closedStyle = '';
  var s = $(thisclass + 'CLOSED');
  s.style.display = closedStyle;
  s = $(thisclass + 'OPEN');
  s.style.display = openStyle;
}

function toggleWorkflow(id, expandPref) {
  var map = getMessages(['Expand', 'Collapse']);
  var table = $("workflow." + id);
  var spans = table.getElementsByTagName("span");
  for (var i = 0; i != spans.length; i++) {
    var span = spans[i];
    if (!span.getAttribute("stage"))
      continue;
    var spanImage = $(span.id + '.image');
    var spanText = $(span.id + '.text');
    if (span.getAttribute("selected") == 'true')
      spanText.style.color = "#2050d0";
    var filterImg = $('filterimg.' + id);
    if (expandPref == "false") {
      span.style.display = "";
      spanText.style.display = "none";
      filterImg.src = "images/filter_hide16.gifx";
      filterImg.title = map["Expand"];
      filterImg.alt = map["Expand"];
      span.setAttribute("aria-expanded", "false");
    } else {
      span.style.display = "block";
      spanText.style.display = "";
      span.setAttribute("aria-expanded", "true");
      filterImg.src = "images/filter_reveal16.gifx";
      filterImg.title = map["Collapse"];
      filterImg.alt = map["Collapse"];
    }
  }
  _frameChanged();
}

function toggleItemsEventHandler(event, id) {
  var e = event || window.event;
  var code = e.which || e.keyCode;
  if (code === 32 || code === 13) {
    e.preventDefault();
    toggleItems(id);
  }
}

function togglePreference(id) {
  toggleItems(id);
}

function toggleItems(id, force) {
  var tables = $$("table");
  for (var i = 0; i < tables.length; i++) {
    var tableId = tables[i].id;
    if (tableId.indexOf("workflow.") == -1)
      continue;
    var idParts = tables[i].id.split(".");
    if (id && tableId != "workflow." + id)
      continue;
    var pref = getPref(idParts[1]);
    if (force != pref)
      toggleWorkflow(idParts[1], pref);
    if (id)
      break;
  }
}

function getPref(id) {
  var filterImgSrc = $('filterimg.' + id).src
  if (filterImgSrc.indexOf('filter_hide') != -1)
    return "true";
  return "false";
}
document.addEventListener('keyup', checkForClientKeystroke);

function checkForClientKeystroke(evt) {
  if (evt.keyCode == 27 && window.g_popup_manager) {
    g_popup_manager.destroypopDiv();
    return;
  }
  if (evt.shiftKey && evt.ctrlKey && evt.keyCode == 74) {
    var gWindow = new GlideDialogWindow("client_js");
    gWindow.setTitle("JavaScript Executor");
    gWindow.setPreference('table', 'javascript_executor');
    gWindow.render();
    Event.stop(evt);
    return;
  }
  try {
    if (typeof parent.navVisible == "function") {
      if (evt.ctrlKey && evt.keyCode == 190 && !evt.shiftKey && !evt.altKey) {
        Event.stop(evt);
        if (parent.navVisible()) {
          parent.hideNav();
          parent.hide("banner_top_left");
          parent.hide("banner_top_right");
        } else {
          parent.showNav();
          parent.show("banner_top_left");
          parent.show("banner_top_right");
        }
      }
    }
  } catch (e) {}
}

function toggleHelp(name) {
  var wrapper = $('help_' + name + '_wrapper');
  var image = $('img.help_' + name + '_wrapper');
  if (wrapper.style.display == "block") {
    wrapper.style.display = "none";
    image.src = "images/filter_hide16.gifx";
  } else {
    wrapper.style.display = "block";
    image.src = "images/filter_reveal16.gifx";
  }
  image.alt = getMessage("Display / Hide");
  _frameChanged();
}

function validateHex(field) {
  var num = field.value;
  var valid = isHex(num);
  if (!valid) {
    var sName = '';
    if (field.name != null)
      sName = ' of ' + field.name + ' ';
    alert("The entered value " + sName + "is not hex.  Please correct.");
  }
}

function isHex(num) {
  var str = num.replace(new RegExp('[0-9a-fA-F]', 'g'), '');
  if (str.length > 0)
    return false;
  return true;
}

function setLightWeightLink(name) {
  var v = $(name);
  if (!v)
    return;
  var link = $(name + "LINK");
  var replace = $(name + "LINKreplace")
  if (!link && !replace)
    return;
  var vis = "hidden";
  if (v.value != '')
    vis = "";
  setLightWeightLinkDisplay(link, vis);
  setLightWeightLinkDisplay(replace, vis);
}

function setLightWeightLinkDisplay(el, vis) {
  if (!el)
    return;
  el.style.visibility = vis;
  el.style.display = vis == 'hidden' ? 'none' : '';
}

function toggleDebug(id) {
  id = id.split('.')[1];
  for (var i = 0; i < 1000; i++) {
    var widgetName = 'debug.' + id + '.' + i;
    var w = $(widgetName);
    if (!w)
      return;
    w.toggle();
  }
}

function enterSubmitsForm(e, enter_submits_form) {
  if (e.keyCode != 13)
    return true;
  if (e.ctrlKey == true)
    return false;
  var source = Event.element(e);
  if (source.getAttribute("data-type") && e.keyCode == 13 && source.getAttribute("data-type") == 'ac_reference_input')
    return false;
  if (source && source.type == "textarea")
    return true;
  if (source && source.type == "submit") {
    if (source.disabled == false && source.onclick) {
      source.onclick();
      return false;
    }
  }
  if (enter_submits_form == 'false')
    return false;
  var headerElements = $(document.body).select(".header");
  var eSize = headerElements.length;
  for (var i = 0; i < eSize; i++) {
    var element = headerElements[i];
    if (element.type == "submit") {
      if (element.disabled == false) {
        source.blur();
        setTimeout(function() {
          element.onclick();
        }, 0);
        return false;
      }
    }
  }
  return false;
}

function gsftPrompt(title, question, onPromptComplete, onPromptCancel) {
  var dialog = new GlideDialogWindow('glide_prompt', false);
  dialog.setTitle(title);
  dialog.setPreference('title', question);
  dialog.setPreference('onPromptComplete', onPromptComplete);
  dialog.setPreference('onPromptCancel', onPromptCancel);
  dialog.render();
}

function gsftConfirm(title, question, onPromptSave, onPromptCancel, onPromptDiscard) {
  var width, dialogClass = GlideDialogWindow;
  if (window.GlideModal) {
    dialogClass = GlideModal;
    width = 400;
  }
  var dialog = new dialogClass('glide_confirm', false, width);
  dialog.setTitle(title);
  dialog.setPreference('title', question);
  dialog.setPreference('onPromptSave', onPromptSave);
  dialog.setPreference('onPromptCancel', onPromptCancel);
  dialog.setPreference('onPromptDiscard', onPromptDiscard);
  dialog.render();
}

function tsIndexCreatorPopup(tableName) {
  var gDialog = new GlideDialogWindow("dialog_text_index_creator");
  gDialog.setSize(400, 250);
  gDialog.setPreference("table_name", tableName);
  if (tableName != "")
    gDialog.setTitle('Generate Text Index');
  else
    gDialog.setTitle('Regenerate All Text Indexes');
  gDialog.render();
}

function isTextDirectionRTL() {
  return g_text_direction == 'rtl' ? true : false;
}

function simpleRemoveOption(sourceSelect) {
  var sourceOptions = sourceSelect.options;
  var selectedIds = [];
  var index = 0;
  for (var i = 0; i < sourceSelect.length; i++) {
    option = sourceOptions[i];
    if (option.selected) {
      selectedIds[index] = i;
      index++;
    }
  }
  for (var i = selectedIds.length - 1; i > -1; i--)
    sourceSelect.remove(selectedIds[i]);
  sourceSelect.disabled = true;
  sourceSelect.disabled = false;
}

function saveAllSelected(fromSelectArray, toArray, delim, escape, emptyLabel, doEscape) {
  var translatedEmptyLabel = getMessage(emptyLabel);
  for (var i = 0; i < fromSelectArray.length; i++) {
    if (typeof fromSelectArray[i] == 'undefined') {
      toArray[i].value = '';
      continue;
    }
    var toValue = "";
    for (var j = 0; j < fromSelectArray[i].length; j++) {
      if (!(fromSelectArray[i].length == 1 && fromSelectArray[i].options[0].value == translatedEmptyLabel)) {
        var val = fromSelectArray[i].options[j].value;
        if (doEscape)
          val = encodeURIComponent(val);
        toValue += val.replace(new RegExp(delim, "g"), escape + delim);
      }
      if (j + 1 < fromSelectArray[i].length)
        toValue += delim;
    }
    toArray[i].value = toValue;
  }
}

function sortSelect(obj) {
  var maxSort = obj.getAttribute("max_sort");
  if (!maxSort || maxSort == 0)
    maxSort = 500;
  if (obj.length > maxSort && isMSIE && !isMSIE9) {
    return;
  }
  if (!sortSupported(obj)) {
    return;
  }
  if (!hasOptions(obj)) {
    return;
  }
  var o = [];
  var o2 = [];
  var o3 = [];
  for (var i = 0; i < obj.options.length; i++) {
    var newOption = new Option(obj.options[i].text, obj.options[i].value, obj.options[i].defaultSelected, obj.options[i].selected);
    copyAttributes(obj.options[i], newOption);
    if (newOption.value.indexOf('split') > 0)
      o2[o2.length] = newOption;
    else if (newOption.value && newOption.value.substr(0, 2) !== "u_" && (newOption.value.indexOf('formatter') > 0 || newOption.value.indexOf('component') > 0 ||
        newOption.value.indexOf('annotation') > 0 || newOption.value.indexOf('chart') > 0))
      o3[o3.length] = newOption;
    else
      o[o.length] = newOption;
  }
  if (o.length == 0)
    return;
  o = o.sort(
    function(a, b) {
      if ((a.text.toLowerCase() + "") < (b.text.toLowerCase() + "")) {
        return -1;
      }
      if ((a.text.toLowerCase() + "") > (b.text.toLowerCase() + "")) {
        return 1;
      }
      return 0;
    }
  );
  o3 = o3.sort(
    function(a, b) {
      if ((a.text.toLowerCase() + "") < (b.text.toLowerCase() + "")) {
        return -1;
      }
      if ((a.text.toLowerCase() + "") > (b.text.toLowerCase() + "")) {
        return 1;
      }
      return 0;
    }
  );
  for (var i = 0; i < o.length; i++) {
    var newOption = new Option(o[i].text, o[i].value, o[i].defaultSelected, o[i].selected);
    copyAttributes(o[i], newOption);
    obj.options[i] = newOption;
  }
  var counter = 0;
  for (var i = o.length; i < (o.length + o2.length); i++) {
    var newOption = new Option(o2[counter].text, o2[counter].value, o2[counter].defaultSelected, o2[counter].selected);
    copyAttributes(o2[counter], newOption);
    obj.options[i] = newOption;
    counter++;
  }
  var counter = 0;
  for (var i = (o.length + o2.length); i < (o.length + o2.length + o3.length); i++) {
    var newOption = new Option(o3[counter].text, o3[counter].value, o3[counter].defaultSelected, o3[counter].selected);
    copyAttributes(o3[counter], newOption);
    obj.options[i] = newOption;
    counter++;
  }
}

function copyAttributes(from, to) {
  var attributes = from.attributes;
  for (var n = 0; n < attributes.length; n++) {
    var attr = attributes[n];
    var aname = attr.nodeName;
    var avalue = attr.nodeValue;
    to.setAttribute(aname, avalue);
  }
  if (from.style.cssText)
    to.style.cssText = from.style.cssText;
}

function hasOptions(obj) {
  if (obj != null && obj.options != null)
    return true;
  return false;
}

function sortSupported(obj) {
  if (obj == null)
    return false;
  var noSort = obj.no_sort || obj.getAttribute('no_sort');
  if (noSort) {
    return false;
  }
  return true;
};
/*! RESOURCE: /scripts/doctype/utils14.js */
function doNothing() {}

function valueExistsInArray(val, array) {
  for (var i = 0; i < array.length; i++) {
    if (val == array[i])
      return true;
  }
  return false;
}

function doubleDigitFormat(num) {
  return padLeft(num, 2, "0");
}

function tripleDigitFormat(num) {
  return padLeft(num, 3, "0");
}

function sGetHours(totalSecs) {
  return parseInt(totalSecs / (60 * 60), 10);
}

function sGetMinutes(totalSecs) {
  totalSecs -= (60 * 60) * sGetHours(totalSecs);
  return parseInt(totalSecs / 60, 10);
}

function sGetSeconds(totalSecs) {
  totalSecs -= (60 * 60) * sGetHours(totalSecs);
  totalSecs -= (60) * sGetMinutes(totalSecs);
  return parseInt(totalSecs, 10);
}

function isNumber(test) {
  if (!test)
    return false;
  test = new String(test);
  var _numer = test.search("[^0-9]");
  return _numer == -1;
}

function isAlphaNum(thchar) {
  return isAlpha(thchar) || isDigit(thchar);
}

function isAlpha(thchar) {
  return (thchar >= 'a' && thchar <= 'z\uffff') ||
    (thchar >= 'A' && thchar <= 'Z\uffff') || thchar == '_';
}

function isDigit(thchar) {
  return (thchar >= '0' && thchar <= '9');
}

function containsOnlyChars(validChars, sText) {
  if (!sText)
    return true;
  for (var i = 0; i < sText.length; i++) {
    var c = sText.charAt(i);
    if (validChars.indexOf(c) == -1)
      return false;
  }
  return true;
}

function getAttributeValue(element, attrName) {
  return element.getAttribute(attrName);
}

function setAttributeValue(element, attrName, value) {
  element.setAttribute(attrName, value);
}

function toggleDivDisplayAndReturn(divName) {
  if (!divName)
    return;
  var div = $(divName);
  if (!div)
    return;
  if (div.style.display == "none")
    showObject(div);
  else
    hideObject(div);
  return div;
}

function toggleDivDisplay(divName) {
  toggleDivDisplayAndReturn(divName);
}

function findParentByTag(element, tag) {
  var ret;
  while (element && element.parentNode && element.parentNode.tagName) {
    element = element.parentNode;
    if (element.tagName.toLowerCase() == tag.toLowerCase())
      return element;
  }
  return ret;
}

function replaceAll(str, from, to) {
  var idx = str.indexOf(from);
  while (idx > -1) {
    str = str.replace(from, to);
    idx = str.indexOf(from);
  }
  return str;
}

function useAnimation() {
  if (isTouchDevice)
    return false;
  return true;
}

function expandEffect(el, duration, steps, stepCallback, completionCallback) {
  if (!useAnimation()) {
    showObject(el);
    if (completionCallback)
      completionCallback(el);
    return;
  }
  var h;
  if (el.originalHeight)
    h = el.originalHeight;
  else {
    h = getHeight(el);
    if (h == 0) {
      showObject(el);
      return;
    }
    el.originalHeight = h;
  }
  if (!duration)
    duration = 70;
  if (!steps)
    steps = 14;
  el.style.overflow = "hidden";
  el.style.height = "1px";
  el.style.display = "block";
  el.style.visibility = "visible";
  expandAnimationEffect(el, h, duration, steps, stepCallback,
    completionCallback);
  return h;
}

function expandAnimationEffect(el, height, duration, steps, stepCallback,
  completionCallback) {
  new Rico.Effect.Size(el.id, null, height, duration, steps, {
    step: function() {
      if (stepCallback)
        stepCallback(el);
    },
    complete: function() {
      _expandComplete(el, completionCallback);
    }
  });
}

function _expandComplete(el, completionCallback) {
  el.style.overflow = "";
  el.style.height = "auto";
  if (completionCallback)
    completionCallback(el);
  _frameChanged();
}

function collapseEffect(el, duration, steps) {
  if (!useAnimation()) {
    hideObject(el);
    return;
  }
  var h;
  if (el.originalHeight)
    h = el.originalHeight;
  else {
    h = el.offsetHeight;
    el.originalHeight = h;
  }
  if (!duration)
    duration = 70;
  if (!steps)
    steps = 14;
  if (!h)
    h = el.offsetHeight;
  el.style.overflow = "hidden";
  collapseAnimationEffect(el, h, duration, steps);
}

function collapseAnimationEffect(el, height, duration, steps) {
  new Rico.Effect.Size(el.id, null, 1, duration, steps, {
    complete: function() {
      _collapseComplete(el, height);
    }
  });
}

function _collapseComplete(el, height) {
  el.style.display = "none";
  el.style.overflow = "";
  el.style.height = height;
  _frameChanged();
}

function getHeight(el) {
  var item;
  try {
    item = el.cloneNode(true);
  } catch (e) {
    jslog("getHeight blew up... we caught the error and returned 0")
    return 0;
  }
  var height = 0;
  item.style.visibility = "hidden";
  item.style.display = "block";
  item.style.position = "absolute";
  item.style.top = 0;
  item.style.left = 0;
  document.body.appendChild(item);
  height = item.offsetHeight;
  document.body.removeChild(item);
  return height;
}

function getWidth(el) {
  var item = el.cloneNode(true);
  var width = 0;
  item.style.visibility = "hidden";
  item.style.display = "block";
  item.style.position = "absolute";
  item.style.top = 0;
  item.style.left = 0;
  document.body.appendChild(item);
  width = item.offsetWidth;
  document.body.removeChild(item);
  return width;
}

function grabOffsetLeft(item) {
  return getOffset(item, "offsetLeft")
}

function grabOffsetTop(item) {
  return getOffset(item, "offsetTop")
}

function getOffset(item, attr) {
  var parentElement = getFormContentParent();
  var wb = 0;
  while (item) {
    wb += item[attr];
    item = item.offsetParent;
    if (item == parentElement)
      break;
  }
  return wb;
}

function grabScrollLeft(item) {
  return getScrollOffset(item, "scrollLeft")
}

function grabScrollTop(item) {
  return getScrollOffset(item, "scrollTop")
}

function getScrollOffset(item, attr) {
  var parentElement = getFormContentParent();
  var wb = 0;
  while (item && item.tagName && item != parentElement) {
    wb += item[attr];
    if (isMSIE)
      item = item.offsetParent;
    else
      item = item.parentNode;
  }
  return wb;
}

function getValue(evt) {
  var elem = evt.target;
  if (!elem)
    return null;
  try {
    return elem.options[elem.selectedIndex].value;
  } catch (e) {
    var msg = (typeof e == "string") ? e : ((e.message) ? e.message :
      "Unknown Error");
    alert("Unable to get data:\n" + msg);
  }
  return null;
}

function getEvent(event) {
  return event;
}

function getEventCoords(e) {
  var fudge = getFormContentParent();
  var answer = Event.pointer(e);
  answer = new Point(answer.x, answer.y);
  if (fudge == document.body)
    return answer;
  answer.x += fudge.scrollLeft;
  answer.y += fudge.scrollTop;
  var fudgeTop = fudge.getStyle('top');
  var fudgePos = fudge.getStyle('position');
  if (fudgePos == 'absolute' && fudgeTop && fudgeTop.indexOf('px'))
    answer.y -= parseInt(fudgeTop.replace('px', ''));
  return answer;
}

function getRelativeTop() {
  var port = document.viewport;
  var topLeft = new Point(port.getScrollOffsets().left, port
    .getScrollOffsets().top)
  var fudge = getFormContentParent();
  if (fudge != document.body) {
    topLeft.x += fudge.scrollLeft;
    topLeft.y += fudge.scrollTop;
  }
  return topLeft;
}

function getRealEvent(e) {
  if (isTouchDevice && isTouchEvent(e)) {
    e = e.changedTouches[0];
  }
  return e;
}

function isTouchEvent(e) {
  if (typeof e == 'undefined' || typeof e.changedTouches == 'undefined')
    return false;
  return true;
}

function isTouchRightClick(e) {
  if (!isTouchEvent(e))
    return false;
  var hasTwoFingers = e.changedTouches.length > 1;
  return hasTwoFingers;
}

function getTextValue(node) {
  if (node.textContent)
    return node.textContent;
  var firstNode = node.childNodes[0];
  if (!firstNode)
    return null;
  if (firstNode.data)
    return firstNode.data;
  return firstNode.nodeValue;
}

function getScrollX() {
  return window.pageXOffset;
}

function getScrollY() {
  return window.pageYOffset;
}

function getSrcElement(evt) {
  return evt.target;
}

function addForm() {
  var form = cel('form');
  document.body.appendChild(form);
  if (window.g_ck)
    addHidden(form, "sysparm_ck", g_ck);
  return form;
}

function addHidden(form, name, value) {
  addInput(form, 'HIDDEN', name, value);
}

function addInput(form, type, name, value) {
  var inputs = Form.getInputs(form, '', name);
  if (inputs.length > 0) {
    inputs[0].value = value;
    return;
  }
  var opt = document.createElement('input');
  opt.type = type;
  opt.name = name;
  opt.id = name;
  opt.value = value;
  form.appendChild(opt);
}

function getHiddenInputValuesMap(parent) {
  var valuesMap = {}
  var inputs = parent.getElementsByTagName('input');
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    if (input.type.toLowerCase() != "hidden")
      continue;
    valuesMap[input.id] = input.value;
  }
  return valuesMap;
}

function appendSelectOption(select, value, label, index) {
  var opt = document.createElement("option");
  opt.value = value;
  opt.appendChild(label);
  if (index >= 0 && index != select.length)
    select.insertBefore(opt, select.children[index]);
  else
    select.appendChild(opt);
  return opt;
}

function copySelectOptionToIndex(select, opt, index) {
  var label = opt.text;
  opt.innerHTML = "";
  opt.appendChild(document.createTextNode(label));
  if (index >= 0 && index != select.length)
    select.insertBefore(opt, select.children[index]);
  else
    select.appendChild(opt);
  return opt;
}

function selectMenuItem(id, selectName) {
  var selectMenu = document.getElementById(selectName);
  if (!selectMenu)
    return -1;
  var options = selectMenu.options;
  var selectItem = selectMenu.selectedIndex;
  if (id) {
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      if (option.value == id) {
        selectItem = i;
        break;
      }
    }
  }
  if (selectItem > 0) {
    selectMenu.selectedIndex = selectItem;
    if (selectMenu["onchange"]) {
      selectMenu.onchange();
    }
  }
  return selectItem;
}

function menuIsEmpty(selectName) {
  var selectMenu = document.getElementById(selectName);
  if (!selectMenu || selectMenu.selectedIndex <= 0)
    return true;
  return false;
}

function getBounds(obj, addScroll) {
  var x = grabOffsetLeft(obj);
  var y = grabOffsetTop(obj);
  if (addScroll) {
    x += getScrollX();
    y += getScrollY();
  }
  this.absoluteRect = {
    top: y,
    left: x,
    bottom: y + obj.offsetHeight,
    right: x + obj.offsetWidth,
    height: obj.offsetHeight,
    width: obj.offsetWidth,
    middleX: x + (obj.offsetWidth / 2),
    middleY: y + (obj.offsetHeight / 2),
    cbottom: y + obj.clientHeight,
    cright: x + obj.clientWidth
  };
  return this.absoluteRect;
}

function guid(l) {
  var l = l || 32,
    strResult = '';
  while (strResult.length < l)
    strResult += (((1 + Math.random() + new Date().getTime()) * 0x10000) | 0)
    .toString(16).substring(1);
  return strResult.substr(0, l);
}

function stopSelection(e) {
  e.onselectstart = function() {
    return false;
  };
  e.style.MozUserSelect = "none";
}

function restoreSelection(e) {
  e.onselectstart = null;
  e.style.MozUserSelect = "";
}

function getAttributeValue(element, name) {
  if (!element.attributes)
    return null;
  var v = element.attributes.getNamedItem(name);
  if (v == null)
    return null;
  return v.nodeValue;
}

function createImage(src, title, object, onClick) {
  var img = cel('input');
  img.type = 'image';
  img.src = src;
  img.title = title;
  img.alt = title;
  if (arguments.length == 4)
    img.onclick = onClick.bindAsEventListener(object);
  return img;
}

function createIcon(cls, title, object, onClick) {
  var icn = cel('a');
  icn.addClassName(cls);
  icn.setAttribute('title', title);
  icn.setAttribute('aria-label', title);
  if (arguments.length == 4)
    icn.onclick = onClick.bindAsEventListener(object);
  return icn;
}

function getXMLString(node) {
  var xml = "???";
  if (node.xml) {
    xml = node.xml;
  } else if (window.XMLSerializer) {
    xml = (new XMLSerializer()).serializeToString(node);
  }
  return xml;
}

function isLeftClick(e) {
  return e.button == 0;
}

function formatMessage() {
  if (arguments.length == 1)
    return arguments[0];
  var str = arguments[0];
  var args = arguments;
  if (arguments.length == 2 && typeof arguments[1] == 'object' &&
    arguments[1] instanceof Array) {
    args = [''].concat(arguments[1]);
  }
  var i = 0;
  while (++i < args.length) {
    str = str.replace(new RegExp('\\{' + (i - 1) + '\\}', 'g'), args[i]);
  }
  return str;
}

function getFormattedDateAndTime(date) {
  return getFormattedDate(date) + " " + getFormattedTime(date);
}

function getFormattedDate(date) {
  var d = (date ? date : new Date());
  var curr_mon = d.getMonth() + 1;
  var curr_day = d.getDate();
  var curr_year = d.getYear() - 100;
  return doubleDigitFormat(curr_mon) + "/" + doubleDigitFormat(curr_day) +
    "/" + doubleDigitFormat(curr_year)
}

function getFormattedTime(date) {
  var d = (date ? date : new Date());
  var curr_hour = d.getHours();
  var curr_min = d.getMinutes();
  var curr_sec = d.getSeconds();
  var curr_msec = d.getMilliseconds();
  return doubleDigitFormat(curr_hour) + ":" + doubleDigitFormat(curr_min) +
    ":" + doubleDigitFormat(curr_sec) + " (" +
    tripleDigitFormat(curr_msec) + ")"
}

function showGoToLine(textAreaID) {
  var e = gel("go_to_" + textAreaID)
  if (e) {
    showObjectInline(e);
    gel("go_to_input_" + textAreaID).focus();
  }
}

function gotoLineKeyPress(evt, textAreaObject, input) {
  if (evt.keyCode == 13) {
    Event.stop(evt);
    gotoLinePopup(textAreaObject, input.value);
    input.value = "";
    hideObject(input.parentNode);
  }
}

function gotoLinePopup(textAreaObject, lineText) {
  if (lineText) {
    lineText = trim(lineText);
    if (lineText) {
      var line = parseInt(lineText, 10);
      g_form._setCaretPositionLineColumn(textAreaObject, line, 1);
    }
  }
}

function getBrowserWindowHeight() {
  return window.innerHeight;
}

function getBrowserWindowWidth() {
  return window.innerWidth;
}
var WindowSize = function() {
  return {
    width: getBrowserWindowWidth(),
    height: getBrowserWindowHeight()
  }
}

function getScrollBarWidthPx() {
  var inner = cel("p");
  inner.style.width = "100%";
  inner.style.height = "200px";
  var outer = cel("div");
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild(inner);
  document.body.appendChild(outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = "scroll";
  var w2 = inner.offsetWidth;
  if (w1 == w2)
    w2 = outer.clientWidth;
  document.body.removeChild(outer);
  return (w1 - w2);
}

function showOpticsDebugger() {
  var mainWindow = getMainWindow();
  if (mainWindow)
    mainWindow.CustomEvent.fire('glide_optics_inspect_window_open');
}

function opticsLog(tablename, fieldname, message, oldvalue, newvalue) {
  if (tablename === "ni") {
    tablename = g_form.getUniqueValue();
    fieldname = g_form.resolveNameMap(fieldname) || fieldname;
  }
  var info = {};
  info.table = tablename;
  info.field = fieldname;
  info.message = message;
  info.message_type = "static";
  if (oldvalue && newvalue) {
    info.oldvalue = oldvalue;
    info.newvalue = newvalue;
    info.message_type = "change";
  }
  info.type = 'log';
  info.startTime = new Date();
  if (g_form._pushAction)
    g_form._pushAction(info);
  CustomEvent.fire('glide_optics_inspect_log_message', info);
};
/*! RESOURCE: /scripts/formatting.js */
function formatPhone(field) {
  field.value = trim(field.value);
  var ov = field.value;
  var v = "";
  var x = -1;
  if (0 < ov.length && '+' != ov.charAt(0)) {
    var n = 0;
    if ('1' == ov.charAt(0))
      ov = ov.substring(1, ov.length);
    for (var i = 0; i < ov.length; i++) {
      var ch = ov.charAt(i);
      if (ch >= '0' && ch <= '9') {
        if (n == 0)
          v += "(";
        else if (n == 3)
          v += ") ";
        else if (n == 6)
          v += "-";
        v += ch;
        n++;
      }
      if (!(ch >= '0' && ch <= '9') && ch != ' ' && ch != '-' && ch != '.' && ch != '(' && ch != ')') {
        x = i;
        break;
      }
    }
    if (x >= 0)
      v += " " + ov.substring(x, ov.length);
    if (n == 10 && v.length <= 40)
      field.value = v;
  }
  return true;
}

function formatClean(num) {
  var sVal = '';
  var nVal = num.length;
  var sChar = '';
  var nChar = '';
  try {
    for (var i = 0; i < nVal; i++) {
      sChar = num.charAt(i);
      nChar = sChar.charCodeAt(0);
      if (sChar == '-' || sChar == getDecimalSeparator() || ((nChar >= 48) && (nChar <= 57)))
        sVal += num.charAt(i);
    }
  } catch (exception) {
    alertError("formatClean", exception);
  }
  return sVal;
}

function formatCurrency(num) {
  var sVal = '';
  var minus = '';
  if (num.lastIndexOf("-") == 0)
    minus = '-';
  if (num.lastIndexOf(".") < 0)
    num = num + '00';
  num = formatClean(num);
  sVal = minus + formatDollar(num, getGroupingSeparator()) + getDecimalSeparator() + formatCents(num);
  return sVal;
}

function formatNumber(num) {
  if (num.length == 0)
    return num;
  num = num + "";
  var sVal = '';
  var minus = '';
  var samount = '';
  try {
    if (num.lastIndexOf("-") == 0)
      minus = '-';
    num = formatClean(num);
    if (num.indexOf("-") == 0)
      num = num.substring(1);
    num = "0" + num;
    var fraction = parseFraction(num + "");
    num = parseInt(num, 10);
    samount = num + "";
    for (var i = 0; i < Math.floor((samount.length - (1 + i)) / 3); i++)
      samount = samount.substring(0, samount.length - (4 * i + 3)) + getGroupingSeparator() + samount.substring(samount.length - (4 * i + 3));
    if (fraction.length > 0) {
      fraction = getDecimalSeparator() + fraction;
      samount += fraction;
    }
  } catch (exception) {
    alertError("Format Number", exception);
  }
  return minus + samount;
}

function parseFraction(num) {
  var index = num.indexOf(getDecimalSeparator());
  if (index == -1)
    return "";
  return num.substring(index + 1);
}

function formatCents(amount) {
  var cents = '';
  try {
    amount = parseInt(amount, 10);
    var samount = amount + "";
    if (samount.length == 0)
      return '00';
    if (samount.length == 1)
      return '0' + samount;
    if (samount.length == 2)
      return samount;
    cents = samount.substring(samount.length - 2, samount.length);
  } catch (exception) {
    alertError("Format Cents", e);
  }
  return cents;
}

function formatDollar(amount) {
  var samount = "";
  try {
    amount = parseInt(amount, 10);
    samount = amount + "";
    if (samount.length < 3)
      return 0;
    samount = samount.substring(0, samount.length - 2);
    for (var i = 0; i < Math.floor((samount.length - (1 + i)) / 3); i++)
      samount = samount.substring(0, samount.length - (4 * i + 3)) + getGroupingSeparator() + samount.substring(samount.length - (4 * i + 3));
  } catch (exception) {
    alertError("Format Dollar", e);
  }
  return samount;
}

function padLeft(value, width, fill) {
  value = value + '';
  while (value.length < width)
    value = fill + value;
  return value;
}

function getDecimalSeparator() {
  if (g_user_decimal_separator)
    return g_user_decimal_separator;
  return ".";
}

function getGroupingSeparator() {
  if (g_user_grouping_separator)
    return g_user_grouping_separator;
  return ",";
}

function alertError(MethodName, e) {
  if (e.description == null)
    alert(MethodName + " Exception: " + e.message);
  else
    alert(MethodName + " Exception: " + e.description);
};
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
/*! RESOURCE: /scripts/classes/GwtMessage.js */
var GwtMessage = Class.create({
  DEFAULT_LANGUAGE: "en",
  PREFETCH_ENTRY_KEY: "PREFETCH_ENTRY_KEY",
  initialize: function() {},
  set: function(n, v) {
    if (!v)
      GwtMessage._messages[n] = true;
    else
      GwtMessage._messages[n] = v;
  },
  format: function(msg) {
    if (!msg)
      return "";
    var str = msg;
    for (var i = 1; i < arguments.length; i++) {
      var paramIndex = i - 1;
      var rx = new RegExp("\{[" + paramIndex + "]\}", "g");
      str = str.replace(rx, arguments[i]);
    }
    return str;
  },
  getMessage: function(strVal) {
    var valList = [];
    valList.push(strVal);
    var messages = this.getMessages(valList);
    var msg = messages[strVal];
    if (arguments.length > 1) {
      var realArray = [].slice.call(arguments, 0);
      realArray[0] = msg;
      msg = this.format.apply(this, realArray);
    }
    return msg;
  },
  getMessages: function(resolveList) {
    var pageMsgs = {};
    var dataRequiringAjaxCall = [];
    var results = {};
    for (var i = 0; i < resolveList.length; i++) {
      var v = GwtMessage._messages[resolveList[i]];
      if (v === true)
        pageMsgs[resolveList[i]] = resolveList[i];
      else if (v)
        pageMsgs[resolveList[i]] = v;
      else
        dataRequiringAjaxCall.push(resolveList[i]);
    }
    if (dataRequiringAjaxCall.length > 0) {
      this._loadNewMessages(dataRequiringAjaxCall);
      results = this._buildListFromCache(dataRequiringAjaxCall);
    }
    for (var key in pageMsgs)
      results[key] = pageMsgs[key];
    return results;
  },
  _loadNewMessages: function(resolveList) {
    var cachedMessages = this._findCachedKeys(resolveList);
    var keysToResolve = this._removeCachedEntries(resolveList, cachedMessages);
    if (keysToResolve.length == 0)
      return;
    var ajax = new GlideAjax("SysMessageAjax");
    ajax.addParam("sysparm_keys", keysToResolve.length);
    ajax.addParam("sysparm_prefetch", this._shouldPrefetch() ? "true" : "false");
    for (var i = 0; i < keysToResolve.length; i++) {
      var keyVal = "key" + i;
      ajax.addParam(keyVal, keysToResolve[i]);
    }
    var rxml = ajax.getXMLWait();
    this._processResponse(rxml);
  },
  _removeCachedEntries: function(resolveList) {
    var messagesToResolve = new Array();
    for (var i = 0; i < resolveList.length; i++) {
      var key = resolveList[i];
      if (this._getCache() && this._getCache().get(key))
        continue;
      messagesToResolve.push(key);
    }
    return messagesToResolve;
  },
  _processResponse: function(rxml) {
    this._processItems(rxml, "preitem");
    this._processItems(rxml, "item");
  },
  _shouldPrefetch: function() {
    if (this._getCache()) {
      var pf = this._getCache().get(this._PREFETCH_ENTRY_KEY);
      var now = new Date().getTime();
      if (typeof pf == 'undefined' || (pf + 60000) < now) {
        this._getCache().put(this._PREFETCH_ENTRY_KEY, now);
        return true;
      }
    }
    return false;
  },
  _processItems: function(xml, name) {
    var items = xml.getElementsByTagName(name);
    for (var i = 0; i < items.length; i++) {
      var key = items[i].getAttribute("key");
      var value = items[i].getAttribute("value");
      this.setMessage(key, value);
    }
  },
  setMessage: function(key, msg) {
    if (this._getCache()) {
      this._getCache().put(key, msg);
    }
  },
  isDefaultLanguage: function() {
    return this.getLanguage() == this.getDefaultLanguage();
  },
  getLanguage: function() {
    return g_lang;
  },
  getDefaultLanguage: function() {
    return this.DEFAULT_LANGUAGE;
  },
  _findCachedKeys: function(resolveList) {
    var answer = new Array();
    var cache = this._getCache();
    if (cache) {
      for (var i = 0; i < resolveList.length; i++) {
        var key = resolveList[i];
        var value = cache.get(key);
        if (value)
          answer.push(key);
      }
    }
    return answer;
  },
  _buildListFromCache: function(resolveList) {
    var answer = {};
    var cache = this._getCache();
    if (cache) {
      for (var i = 0; i < resolveList.length; i++) {
        var key = resolveList[i];
        var value = cache.get(key);
        answer[key] = value;
      }
    }
    return answer;
  },
  _getCache: function() {
    try {
      if (getTopWindow().g_cache_message)
        return getTopWindow().g_cache_message;
    } catch (e) {}
    if (typeof(g_cache_message) != "undefined")
      return g_cache_message;
    if (typeof GlideClientCache !== 'undefined') {
      g_cache_message = new GlideClientCache(500);
      return g_cache_message;
    }
    return false;
  },
  fetch: function(resolveList, callback) {
    var cachedMessages = this._findCachedKeys(resolveList);
    var keysToResolve = this._removeCachedEntries(resolveList, cachedMessages);
    if (keysToResolve.length == 0) {
      var answer = this.getMessages(resolveList);
      callback(answer);
      return;
    }
    var ajax = new GlideAjax("SysMessageAjax");
    ajax.addParam("sysparm_keys", keysToResolve.length);
    ajax.addParam("sysparm_prefetch", this._shouldPrefetch() ? "true" : "false");
    for (var i = 0; i < keysToResolve.length; i++) {
      var keyVal = "key" + i;
      ajax.addParam(keyVal, keysToResolve[i]);
    }
    ajax.getXML(this.fetched.bind(this), null, {
      fn: callback,
      list: resolveList
    });
  },
  fetched: function(response, parms) {
    this._processResponse(response.responseXML);
    var answer = this.getMessages(parms.list);
    parms.fn(answer);
  }
});
GwtMessage._messages = {};

function getMessage(msg) {
  if (typeof msg == "object")
    return new GwtMessage().getMessages(msg);
  return new GwtMessage().getMessage(msg);
}

function getMessages(msgs) {
  return new GwtMessage().getMessages(msgs);
};
/*! RESOURCE: /scripts/classes/GwtContextMenu.js */
var gActiveContext;
var contextMenus = new Object();
var shortcuts = new Object();
var GwtContextMenu = Class.create({
  SUBMENU_INDICATOR: "<img src='images/context_arrow.gifx' class='context_item_menu_img' alt='Add' />",
  initialize: function(id, useBodyAsParent) {
    this.timeout = null;
    this.properties = new Object();
    this.setID(id);
    this.getMenu();
    this.onshow = null;
    this.onhide = null;
    this.beforehide = null;
    this.docRoot = this._getDocRoot();
    this.hasItems = false;
    this.hideOnlySelf = false;
    this.trackSelected = false;
    if (typeof useBodyAsParent == "undefined")
      useBodyAsParent = false;
    this._getParentElement(useBodyAsParent);
  },
  isEmpty: function() {
    return !this.hasItems;
  },
  _getParentElement: function(useBodyAsParent) {
    if (useBodyAsParent) {
      this.parentElement = document.body;
      return;
    }
    this.parentElement = getFormContentParent();
  },
  _getDocRoot: function() {
    var docRoot = window.location.protocol + "//" + window.location.host;
    if (window.location.pathname.indexOf("/") > -1) {
      var fp = window.location.pathname;
      fp = fp.substring(0, fp.lastIndexOf("/"));
      if (fp.substring(0, 1).indexOf("/") != -1)
        docRoot = docRoot + fp;
      else
        docRoot = docRoot + "/" + fp;
    }
    docRoot += "/";
    return docRoot;
  },
  add: function(label, id, keys) {
    this.hasItems = true;
    var m = this.getMenu();
    var d = document.createElement("div");
    d.setAttribute("item_id", id);
    d.className = "context_item";
    d.isMenuItem = true;
    var l = !keys ? label : (label + ' (' + keys + ')');
    d.innerHTML = l;
    if (keys)
      d.setAttribute("data-label", label);
    m.appendChild(d);
    return d;
  },
  addHref: function(label, href, img, title, id, keys) {
    keys = this.addKeyShortcut(keys, href);
    var d = this.add(label, id, keys);
    d.setAttribute("href", href);
    if (title && title != null)
      d.setAttribute("title", title);
    this.setImage(d, img);
    return d;
  },
  addFunc: function(label, func, id) {
    var d = this.add(label, id);
    d.setAttribute("func_set", "true");
    d.func = func;
    return d;
  },
  addURL: function(label, url, target, id) {
    var d = this.add(label, id);
    url = this._updateURL(d, label, url);
    d.setAttribute("url", url);
    if (target)
      d.setAttribute("target", target);
    return d;
  },
  addHrefNoSort: function(label, href, id) {
    var item = this.addHref(label, href, null, null, id);
    item.setAttribute("not_sortable", "true");
    return item;
  },
  addHrefNoFilter: function(label, href, id) {
    var item = this.addHref(label, href, null, null, id);
    item.setAttribute("not_filterable", "true");
    return item;
  },
  addMenu: function(label, menu, id) {
    var item = this.add(label + this.SUBMENU_INDICATOR, id);
    item.setAttribute("label", "true");
    menu.setParent(this);
    item.subMenu = menu;
    return item;
  },
  addAction: function(label, action, id) {
    return this.addHref(label, "contextAction('" + this.getTableName() + "', '" + action + "')", null, null, id);
  },
  addConfirmedAction: function(label, action, id) {
    return this.addHref(label, "contextConfirm('" + this.getTableName() + "', '" + action + "')", null, null, id);
  },
  addLine: function() {
    this.hasItems = true;
    var m = this.getMenu();
    var d = document.createElement("div");
    d.className = "context_item_hr";
    d.isMenuItem = true;
    d.disabled = "disabled";
    m.appendChild(d);
    return d;
  },
  addLabel: function(label, id) {
    var m = this.getMenu();
    var d = document.createElement("div");
    d.setAttribute("item_id", id);
    d.className = "context_item";
    d.isMenuItem = true;
    d.innerHTML = label;
    d.disabled = "disabled";
    m.appendChild(d);
    return d;
  },
  addKeyShortcut: function(keys, href) {
    var topWindow = getTopWindow();
    var keyboardEnabled = topWindow.com && topWindow.com.glide && topWindow.com.glide.ui && topWindow.com.glide.ui.keyboard;
    if (!keyboardEnabled)
      return null;
    if (!keys)
      return keys;
    if (shortcuts[keys])
      return keys;
    shortcuts[keys] = {};
    var callback = function(e) {
      var start = e.data.href.indexOf('javascript:') == 0 ? 11 : 0;
      var startParen = e.data.href.indexOf('(');
      var functionName = startParen > start ? e.data.href.substring(start, startParen) : {};
      var func = eval(functionName);
      if (typeof func == 'function')
        eval(e.data.href);
      else
        document.location.href = e.data.href;
    };
    addLoadEvent(function() {
      var keyboard = getTopWindow().com.glide.ui.keyboard;
      var isMainFrame = window.frameElement.id == keyboard.mainFrame;
      var isFormFrame = window.frameElement.id == keyboard.formFrame;
      if (isMainFrame)
        shortcuts[keys] = keyboard.bind(keys, callback, {
          href: href
        }).global(keyboard.formFrame);
      else if (isFormFrame)
        shortcuts[keys] = keyboard.bind(keys, callback, {
          href: href
        }).formFrame();
      else
        shortcuts[keys] = null;
    });
    return keys;
  },
  getItem: function(itemId) {
    var items = this.getMenu().getElementsByTagName("div");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.getAttribute("item_id") == itemId)
        return item;
    }
    return null;
  },
  setImage: function(item, img) {
    if (item && img) {
      item.style.backgroundImage = "url(" + this.docRoot + img + ")";
      item.style.backgroundRepeat = "no-repeat";
    }
  },
  setChecked: function(item) {
    if (item)
      this.setImage(item, "images/checked.pngx");
  },
  clearImage: function(item) {
    if (item) {
      item.style.backgroundImage = "";
      item.style.backgroundRepeat = "";
    }
  },
  setDisabled: function(item) {
    if (!item)
      return;
    this._dullItem(item);
  },
  setEnabled: function(item) {
    if (!item)
      return;
    this._undullItem(item);
  },
  setHidden: function(item) {
    if (!item)
      return;
    this._hideItem(item);
  },
  setVisible: function(item) {
    if (!item)
      return;
    this._showItem(item);
  },
  setLabel: function(item, label) {
    if (item)
      item.innerHTML = label;
  },
  setHideOnlySelf: function(hideSelf) {
    this.hideOnlySelf = hideSelf;
  },
  clearSelected: function() {
    var items = this.getMenu().getElementsByTagName("div");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.isMenuItem)
        this.clearImage(item);
    }
  },
  clear: function() {
    var m = this.getMenu();
    clearNodes(m);
    this._setMinWidth();
    this.hasItems = false;
  },
  destroy: function() {
    this.parentElement = null;
    this.menu.context = null;
    this.menu.onmouseover = null;
    this.menu.onmouseout = null;
    this.menu.onclick = null;
    if (isMSIE)
      this.menu.outerHTML = null;
    this.parentMenu = null;
    this.onshow = null;
    this.onhide = null;
    this.properties = null;
    this.timeout = null;
    this.menu = null;
    this.shim = null;
  },
  display: function(e) {
    if (!this.getParent())
      CustomEvent.fireAll('body_clicked', null);
    menuSort = true;
    this._dullMenu();
    this._toggleMenuItems("not_sortable", this.getProperty('sortable'));
    this._toggleMenuItems("not_filterable", this.getProperty('filterable'));
    this.setFiringObject(this._getElement(e));
    e = this._getRealEvent(e);
    var menu = this.getMenu();
    if (this._isEmpty(menu))
      return;
    menu.style.left = "0";
    menu.style.top = "0";
    this.parentElement.appendChild(menu);
    if (this.getProperty("top") > 0 && ((this.getProperty("left") > 0) || (this.getProperty("right") > 0))) {
      menu.style.visibility = 'hidden';
      menu.style.display = 'block';
      this.moveMenuToXY(e, this.getProperty("left"), this.getProperty("top"), this.getProperty("right"));
    } else if (this.getParent()) {
      var x = this._getElement(e);
      menu.style.visibility = 'hidden';
      menu.style.display = 'block';
      this.moveMenuToParent(e, x);
    } else {
      var x = this._getElement(e);
      menu.style.visibility = 'hidden';
      menu.style.display = 'block';
      this.moveMenuToCursor(e);
    }
    gActiveContext = this;
    showObject(menu);
    this._showShim(menu);
    if (ie5) {
      for (var i = 0; i < menu.childNodes.length; i++) {
        var item = menu.childNodes[i];
        addClassName(item, "fix-for-ie");
        removeClassName(item, "fix-for-ie");
      }
    }
  },
  hide: function() {
    gActiveContext = "";
    this._hideShim();
    hideObject(this.getMenu());
    if (this.getMenu().parentNode)
      this.getMenu().parentNode.removeChild(this.getMenu());
    if (this.onhide)
      this.onhide();
    CustomEvent.fire('refresh.event');
  },
  hideAll: function() {
    var m = this;
    while (m) {
      m.hide();
      m = m.getParent();
    }
  },
  execute: function(e) {
    var x = this._getElement(e);
    if (x.isMenuItem && !x.disabled) {
      if (x.getAttribute("label") == "true") {
        this._getRealEvent(e).cancelBubble = true;
        return;
      }
      if (x.getAttribute("target")) {
        window.open(x.getAttribute("url"), x.getAttribute("target"));
      } else if (x.getAttribute("href")) {
        var expression = x.getAttribute("href");
        gActiveContext = this;
        eval(expression);
      } else if (x.getAttribute("func_set") == "true") {
        x.func();
      } else {
        window.location = x.getAttribute("url");
      }
      if (this.trackSelected) {
        this.clearSelected();
        this.setChecked(x);
      }
    }
    if (x.subMenu)
      x.subMenu.hideAll();
    else
      this.hideAll();
    return false;
  },
  menuLowLight: function(e) {
    var x = this._getElement(e);
    this._handleTimeout(false, x);
    if (!x.isMenuItem)
      return;
    if (!x.subMenu || x.subMenu.getMenu().style.display == 'none')
      this._disableItem(x);
    window.status = '';
    CustomEvent.fire('refresh.event');
  },
  menuHighLight: function(e) {
    var x = this._getElement(e);
    this._handleTimeout(true, x);
    if (!x.isMenuItem)
      return;
    this._hideAllSubs(x.parentNode);
    this._enableItem(x);
    if (x.subMenu) {
      x.subMenu.setParent(this);
      x.subMenu.display(e);
    }
  },
  moveMenuToXY: function(e, left, top, right) {
    var menu = this.getMenu();
    if (right)
      left = right - menu.offsetWidth;
    var offsetTop = ie5 ? this.parentElement.scrollTop + top : window.pageYOffset + top;
    var offsetLeft = ie5 ? this.parentElement.scrollLeft + left : window.pageXOffset + left;
    this.moveMenu(top, left, 0, 0, offsetTop, offsetLeft);
  },
  moveMenuToCursor: function(e) {
    var offsetTop = 0;
    var offsetLeft = 0;
    if (isTouchDevice) {
      offsetTop = e.pageY;
      offsetLeft = e.pageX;
    } else {
      var offsets = this._getScrollOffsets(this.parentElement);
      offsetTop = offsets.top + e.clientY;
      offsetLeft = offsets.left + e.clientX;
    }
    this.moveMenu(e.clientY, e.clientX, 0, 0, offsetTop, offsetLeft);
  },
  moveMenuToParent: function(e, firingObject) {
    var parent = this.getParent().getMenu();
    var offsetTop = grabOffsetTop(firingObject) - parent.scrollTop;
    var offsetLeft = grabOffsetLeft(parent);
    this.moveMenu(offsetTop, offsetLeft, firingObject.offsetHeight, parent.offsetWidth, offsetTop, offsetLeft);
  },
  moveMenu: function(top, left, height, width, offsetTop, offsetLeft) {
    var menu = this.getMenu();
    menu.style.overflowY = "visible";
    menu.setAttribute('gsft_has_scroll', false);
    if (menu.getAttribute('gsft_width'))
      menu.style.width = menu.getAttribute('gsft_width') + "px";
    if (menu.getAttribute('gsft_height'))
      menu.style.height = menu.getAttribute('gsft_height') + "px";
    var leftPos;
    var viewport = new WindowSize();
    if ((left + width + menu.offsetWidth) > viewport.width)
      leftPos = offsetLeft - menu.offsetWidth;
    else
      leftPos = offsetLeft + width;
    var scrollOffsets = this._getScrollOffsets(this.parentElement);
    var scrollTop = scrollOffsets.top;
    var scrollLeft = scrollOffsets.left;
    if (leftPos < scrollLeft)
      leftPos = scrollLeft;
    menu.style.left = leftPos + "px";
    var direction = 'down';
    var clip = 0;
    if ((top + menu.offsetHeight) > viewport.height) {
      var bottomClip = menu.offsetHeight - (viewport.height - top);
      var topClip = menu.offsetHeight - top + height;
      if (topClip < bottomClip) {
        direction = 'up';
        clip = topClip;
      } else
        clip = bottomClip;
    }
    var topPos;
    if (direction == 'up')
      topPos = offsetTop + height - menu.offsetHeight;
    else
      topPos = offsetTop;
    if (topPos < scrollTop) {
      topPos = scrollTop;
    }
    if ((topPos - scrollTop + menu.offsetHeight) > viewport.height)
      clip = (topPos - scrollTop + menu.offsetHeight) - viewport.height;
    menu.style.top = topPos + "px";
    if (clip > 0) {
      if (!menu.getAttribute('gsft_width')) {
        menu.setAttribute('gsft_width', menu.offsetWidth);
        menu.setAttribute('gsft_height', menu.offsetHeight);
      }
      menu.setAttribute('gsft_has_scroll', true);
      menu.style.overflowY = "auto";
      var w = menu.offsetWidth + 18;
      menu.style.width = w + "px";
      var h = menu.offsetHeight - clip - 4;
      menu.style.height = h + "px";
    }
  },
  _getScrollOffsets: function(e) {
    var offsets = {};
    if (e.nodeName.toUpperCase() == "BODY") {
      offsets.top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      offsets.left = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
    } else {
      offsets.top = e.scrollTop;
      offsets.left = e.scrollLeft;
    }
    return offsets;
  },
  getFiringObject: function() {
    return this.eventObject;
  },
  getID: function() {
    return this.id;
  },
  getMenu: function() {
    if (!this.menu) {
      this.menu = contextMenus[this.getID()];
      if (!this.menu) {
        this._createMenu();
      }
      this._setMenuAttrs();
      this._setMinWidth();
    }
    return this.menu;
  },
  getParent: function() {
    return this.parentMenu;
  },
  getProperty: function(c) {
    if (this.properties)
      return this.properties[c];
    else
      return "";
  },
  getTableName: function() {
    return this.tableName;
  },
  setFiringObject: function(e) {
    this.eventObject = e;
  },
  setID: function(id) {
    this.id = id;
  },
  setOnShow: function(onshow) {
    this.onshow = onshow;
  },
  setOnHide: function(oh) {
    this.onhide = oh;
  },
  setBeforeHide: function(beforeHide) {
    this.beforehide = beforeHide;
  },
  setParent: function(m) {
    this.parentMenu = m;
  },
  setProperty: function(c, v) {
    this.properties[c] = v;
  },
  setTableName: function(name) {
    this.tableName = name;
  },
  setTimeout: function(t) {
    this.timeout = t;
  },
  setTrackSelected: function(flag) {
    this.trackSelected = flag;
  },
  _createMenu: function() {
    this.menu = document.createElement("div");
    this.menu.name = this.menu.id = this.getID();
    contextMenus[this.getID()] = this.menu;
  },
  _disableItem: function(item) {
    if (item && !item.disabled) {
      removeClassName(item, "context_menu_hover");
    }
  },
  _dullMenu: function() {
    var items = this.getMenu().childNodes;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      this._disableItem(item);
    }
  },
  _enableItem: function(item) {
    if (item && !item.disabled) {
      addClassName(item, "context_menu_hover");
    }
  },
  _getElement: function(e) {
    e = this._getRealEvent(e);
    var x = ie5 ? e.srcElement : e.target;
    try {
      if (!x.isMenuItem && x.parentNode.isMenuItem)
        x = x.parentNode;
    } catch (err) {}
    return x;
  },
  _getRealEvent: function(e) {
    if (typeof e == 'undefined') e = window.event;
    return e;
  },
  _handleTimeout: function(lght, firingObject) {
    if (this.getProperty("timeout") > 0) {
      if (lght) {
        clearTimeout(this.timeout);
      } else {
        if (!firingObject.subMenu || firingObject.subMenu != gActiveContext)
          this.timeout = setTimeout('contextHide()', this.getProperty("timeout"));
      }
    }
  },
  _hideAllSubs: function(el) {
    var list = el.getElementsByTagName("div");
    for (var i = 0; i < list.length; i++) {
      var element = list[i];
      if (element.subMenu) {
        var subMenu = element.subMenu.getMenu();
        this._hideAllSubs(element.subMenu.getMenu());
        element.subMenu._hideShim();
        hideObject(subMenu);
        this._disableItem(element);
      }
    }
  },
  _setMenuAttrs: function() {
    this.menu.context = this;
    this.menu.className = "context_menu";
    this.menu.style.display = "none";
    this.menu.style.zIndex = (this.getParent() ? GwtContextMenu.zIndex + 1 : GwtContextMenu.zIndex);
    this.menu.onmouseover = this.menuHighLight.bind(this);
    this.menu.onmouseout = this.menuLowLight.bind(this);
    if ("ontouchstart" in window && (typeof FastButton != 'undefined'))
      new FastButton(this.menu, this.execute.bind(this));
    else
      this.menu.onclick = this.execute.bind(this);
  },
  _setMinWidth: function() {
    var widther = document.createElement("div");
    widther.style.width = "120px";
    widther.style.height = "1px";
    widther.style.overflow = "hidden";
    this.menu.appendChild(widther);
  },
  _showShim: function(menu) {
    if (this._hasTabs() && !ie5)
      return;
    var shim = this._getShim();
    if (!shim) {
      shim = cel("iframe");
      shim.id = this.getID() + "_shim";
      shim.className = "popup";
      shim.style.width = "1px";
      shim.style.height = "1px";
      shim.scrolling = "no";
      shim.src = "javascript:false;";
      this.parentElement.appendChild(shim);
      this.shim = shim;
    }
    shim.style.zIndex = this.getMenu().style.zIndex - 1;
    shim.style.left = grabOffsetLeft(this.getMenu()) + "px";
    shim.style.top = grabOffsetTop(this.getMenu()) + "px";
    var zWidth = this.getMenu().offsetWidth;
    var zHeight = this.getMenu().offsetHeight;
    if (!ie5) {
      zWidth -= 4;
      zHeight -= 4;
    }
    if (menu.getAttribute('gsft_has_scroll'))
      zWidth -= 18;
    shim.style.width = zWidth + "px";
    shim.style.height = zHeight + "px";
    showObject(shim);
  },
  _hideShim: function() {
    var shim = this._getShim();
    if (shim)
      hideObject(shim);
  },
  _getShim: function() {
    if (this.shim)
      return this.shim;
    var shimName = this.getID() + "_shim";
    return gel(shimName);
  },
  _hasTabs: function() {
    if (gel('TabSystem1'))
      return true;
    return false;
  },
  _toggleMenuItems: function(attr, enabled) {
    var items = this.getMenu().childNodes;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.getAttribute(attr) == "true") {
        if (enabled) {
          this._undullItem(item);
        } else {
          this._dullItem(item);
        }
      }
    }
  },
  _dullItem: function(item) {
    item.disabled = "disabled";
    item.style.color = "#cccccc";
    removeClassName(item, "context_menu_hover");
  },
  _undullItem: function(item) {
    item.disabled = "";
    item.style.color = "";
  },
  _hideItem: function(item) {
    item.style.display = 'none';
  },
  _showItem: function(item) {
    item.style.display = '';
  },
  _isEmpty: function(menu) {
    if (!menu)
      return true;
    if (!menu.firstChild)
      return true;
    return false;
  },
  _updateURL: function(d, label, url) {
    if (typeof GlideTransactionScope != 'undefined') {
      GlideTransactionScope.appendTransactionScope(function(name, value) {
        url += "&" + name + "=" + value;
      });
      return url;
    }
    if (typeof g_form != 'undefined') {
      this.dmap = this.dmap || {};
      this.dmap[label] = d;
      $(g_form.getFormElement()).observe('glidescope:initialized', function(e) {
        e.memo.gts.appendTransactionScope(function(name, value) {
          var _d = this.dmap[label];
          var _url = _d.getAttribute("url");
          _url += "&" + name + "=" + value;
          _d.setAttribute("url", _url);
        }.bind(this));
      }.bind(this));
    }
    return url;
  },
  z: function() {}
});
GwtContextMenu.zIndex = 1100;

function displayContextMenu(e, name, filterable) {
  if (!getMenuByName(name))
    return;
  var contextMenu = getMenuByName(name).context;
  contextMenu.setProperty('sortable', true);
  contextMenu.setProperty('filterable', filterable);
  contextMenu.display(e);
}

function contextShow(e, tableName, timeoutValue, ttop, lleft, rright) {
  var frameWindow = null;
  try {
    frameWindow = window.frameElement;
    if (frameWindow && frameWindow.id == "dialog_frame" && frameWindow.noContext == true)
      return true;
  } catch (err) {}
  if (shouldSkipContextMenu(e))
    return true;
  e = getRealEvent(e);
  menuTable = tableName;
  var name = tableName;
  if (name && name.substring(0, 8) != "context_")
    name = "context_" + name;
  if (document.readyState && document.readyState != "complete" && document.readyState != "interactive" && typeof window.g_hasCompleted == "undefined") {
    jslog("Ignored context menu show for " + name + " because document was not ready");
    return false;
  }
  window.g_hasCompleted = true;
  if (getMenuByName(name)) {
    var contextMenu = getMenuByName(name).context;
    contextMenu.setProperty('timeout', timeoutValue);
    contextMenu.setProperty('top', ttop);
    contextMenu.setProperty('left', lleft);
    contextMenu.setProperty('right', rright);
    contextMenu.display(e);
    if (contextMenu.onshow)
      contextMenu.onshow();
  }
  return false;
}

function contextQuestionLabel(e, sys_id, type) {
  if (shouldSkipContextMenu(e))
    return true;
  e = getRealEvent(e);
  var name = "context_question_label";
  menuTable = "not_important";
  menuField = "not_important";
  rowSysId = sys_id;
  addQuestionActionItems(rowSysId, type);
  if (getMenuByName(name)) {
    var contextMenu = getMenuByName(name).context;
    contextMenu.setProperty('sysparm_sys_id', sys_id);
    contextMenu.display(e);
  }
  return false;
}

function addQuestionActionItems(id, type) {
  var jr = new GlideAjax("AJAXJellyRunner", "AJAXJellyRunner.do");
  jr.addParam('template', 'variable_context.xml');
  jr.addParam('sysparm_catalog_id', g_form.getUniqueValue());
  jr.addParam('sysparm_variable_id', id);
  jr.addParam('sysparm_variable_type', type);
  jr.addParam('sysparm_contextual_security', g_form.hasAttribute('contextual_security'));
  jr.setWantRequestObject(true);
  var response = jr.getXMLWait();
  if (!response)
    return;
  var html = response.responseText;
  html.evalScripts(true);
  return gcm;
}

function shouldSkipContextMenu(e) {
  if (e.ctrlKey && trustCtrlKeyResponse())
    return true;
  return false;
}

function trustCtrlKeyResponse() {
  return isMacintosh || !isSafari;
}

function contextTimeout(e, tableName, waitCount) {
  var name = "context_" + tableName;
  if (!getMenuByName(name))
    return;
  var contextMenu = getMenuByName(name).context;
  if (typeof waitCount == "undefined")
    waitCount = 500;
  contextMenu.setProperty("timeout", waitCount);
  var hideParam;
  if (contextMenu.hideOnlySelf == true)
    hideParam = '"' + name + '"';
  contextMenu.setTimeout(setTimeout('contextHide(' + hideParam + ')', waitCount));
}

function getMenuByName(name) {
  return contextMenus[name];
}

function getRowID(e) {
  var id = null;
  var cell = e.srcElement;
  if (cell == null)
    cell = e.target;
  var row = cell.parentNode;
  var id = row.id;
  if (id == null || id.length == 0)
    id = row.parentNode.id;
  return id;
}

function contextHide(name) {
  if (!gActiveContext)
    return;
  if (typeof name != "undefined" && gActiveContext.getID() != name)
    return;
  if (gActiveContext.beforehide) {
    if (gActiveContext.beforehide() == false)
      return;
  }
  gActiveContext.hideAll();
}

function elementAction(e, event, gcm) {
  var type = e.getAttribute("type");
  var choice = e.getAttribute("choice");
  var id = e.id;
  var fName = id.substring(id.indexOf('.') + 1);
  var tableName = fName.substring(0, fName.indexOf('.'));
  var haveAccess = $("personalizer_" + tableName);
  if (typeof(g_user) != 'undefined') {
    var count = 1;
    if (!gcm)
      gcm = addActionItems(fName, tableName, type, choice);
    if (gcm)
      return contextShow(event, gcm.getID(), -1, 0, 0);
  }
  return true;
}

function addActionItems(id, table, type, choice) {
  var jr = new GlideAjax("AJAXJellyRunner", "AJAXJellyRunner.do");
  jr.addParam('template', 'element_context.xml');
  jr.addParam('sysparm_id', id);
  jr.addParam('sysparm_table', table);
  jr.addParam('sysparm_type', type);
  jr.addParam('sysparm_choice', choice);
  jr.addParam('sysparm_contextual_security', g_form.hasAttribute('contextual_security'));
  jr.setWantRequestObject(true);
  var response = jr.getXMLWait();
  if (!response)
    return;
  var html = response.responseText;
  html.evalScripts(true);
  return gcm;
}
Event.observe(window, 'unload', clearMenus, false);

function clearMenus() {
  for (av in contextMenus) {
    if (contextMenus[av]) {
      var c = contextMenus[av].context;
      if (c) {
        c.destroy();
      }
      contextMenus[av] = null;
    }
  }
  for (var keys in shortcuts) {
    if (shortcuts[keys])
      shortcuts[keys].clear();
  }
  shortcuts = null;
};
/*! RESOURCE: /scripts/accessibility_tabindex.js */
addLoadEvent(function() {
  $(document).on('keydown', '*[tabindex], .glide_ref_item_link', function(event) {
    if (event.keyCode != Event.KEY_RETURN)
      return;
    var element = event.element();
    if (!element.hasAttribute('tabindex'))
      return;
    if (element.click)
      element.click();
    event.stop();
  });
  if (typeof jQuery != 'undefined') {
    jQuery('[click-on-enter]').on('keydown', function(event) {
      var keyCode = event.keyCode || event.which;
      if (keyCode != 13)
        return;
      var $this = jQuery(this);
      setTimeout(function() {
        $this.trigger('click');
      }, 200);
    });
  }
});;
/*! RESOURCE: /scripts/classes/event/GwtObservable.js */
var GwtObservable = Class.create({
  initialize: function() {
    this.events = {};
  },
  on: function(name, func) {
    if (!func || typeof func != 'function')
      return;
    this.events = this.events || {};
    if (!this.events[name])
      this.events[name] = [];
    this.events[name].push(func);
  },
  forward: function(name, element, func) {
    GwtObservable.prototype.on.call(this, name, func);
    Event.observe(element, name, function(e) {
      this.fireEvent(e.type, this, e);
    }.bind(this));
  },
  un: function(name, func) {
    if (!this.events[name])
      return;
    var i = this.events[name].indexOf(func);
    if (i !== -1)
      this.events[name].splice(i, 1);
  },
  unAll: function(name) {
    if (this.events[name])
      delete this.events[name];
  },
  isFiring: function() {
    return this._isFiring;
  },
  fireEvent: function() {
    if (this.suppressEvents === true)
      return true;
    this.events = this.events || {};
    var args = $A(arguments);
    var name = args.shift();
    var eventList = this.events[name];
    if (!eventList)
      return true;
    var event = eventList.slice();
    this._isFiring = true;
    for (var i = 0, l = event.length; i < l; i++) {
      var ev = event[i];
      if (ev == null)
        continue;
      if (ev.apply(this, args) === false) {
        this._isFiring = false;
        return false;
      }
    }
    this._isFiring = false;
    return true;
  },
  toString: function() {
    return 'GwtObservable';
  }
});;
/*! RESOURCE: /scripts/classes/event/CustomEventManager.js */
var CustomEventManager = Class.create(GwtObservable, {
  trace: false,
  initialize: function($super) {
    $super();
  },
  observe: function(eventName, fn) {
    if (this.trace)
      jslog("$CustomEventManager observing: " + eventName);
    this.on(eventName, fn);
  },
  fire: function(eventName, args) {
    if (this.trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    return this.fireEvent.apply(this, arguments);
  },
  fireTop: function(eventName, args) {
    if (this.trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    this.fireEvent.apply(this, arguments);
    var t = getTopWindow();
    if (t != null && window != t)
      t.CustomEvent.fireEvent(eventName, args);
  },
  fireAll: function(eventName, args) {
    if (this.trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    var t = getTopWindow();
    if (t == null) {
      this.fireEvent.apply(this, arguments);
      return;
    }
    t.CustomEvent.fireEvent(eventName, args);
    for (var i = 0; i < t.length; i++) {
      try {
        if (!t[i])
          continue;
        if (t[i].CustomEvent && typeof t[i].CustomEvent.fireEvent == "function")
          t[i].CustomEvent.fireEvent(eventName, args);
      } catch (e) {}
    }
  },
  toString: function() {
    return 'CustomEventManager';
  }
});
window.NOW = window.NOW || {};
window.NOW.CustomEvent = new CustomEventManager();
if (typeof CustomEvent !== "undefined") {
  CustomEvent.observe = NOW.CustomEvent.observe.bind(NOW.CustomEvent);
  CustomEvent.fire = NOW.CustomEvent.fire.bind(NOW.CustomEvent);
  CustomEvent.fireTop = NOW.CustomEvent.fireTop.bind(NOW.CustomEvent);
  CustomEvent.fireAll = NOW.CustomEvent.fireAll.bind(NOW.CustomEvent);
  CustomEvent.on = NOW.CustomEvent.on.bind(NOW.CustomEvent);
  CustomEvent.un = NOW.CustomEvent.un.bind(NOW.CustomEvent);
  CustomEvent.unAll = NOW.CustomEvent.unAll.bind(NOW.CustomEvent);
  CustomEvent.forward = NOW.CustomEvent.forward.bind(NOW.CustomEvent);
  CustomEvent.isFiring = NOW.CustomEvent.isFiring.bind(NOW.CustomEvent);
  CustomEvent.fireEvent = NOW.CustomEvent.fireEvent.bind(NOW.CustomEvent);
} else {
  window.CustomEvent = NOW.CustomEvent;
};
/*! RESOURCE: /scripts/classes/GlideClientCache.js */
var GlideClientCacheEntry = Class.create({
  initialize: function(value) {
    this.value = value;
    this.bump();
  },
  bump: function() {
    this.stamp = new Date().getTime();
  }
});
var GlideClientCache = Class.create({
  _DEFAULT_SIZE: 50,
  initialize: function(maxEntries) {
    if (maxEntries)
      this.maxEntries = maxEntries;
    else
      this.maxEntries = this._DEFAULT_SIZE;
    this._init('default');
  },
  _init: function(stamp) {
    this._cache = new Object();
    this._stamp = stamp;
  },
  put: function(key, value) {
    var entry = new GlideClientCacheEntry(value);
    this._cache[key] = entry;
    this._removeEldest();
  },
  get: function(key) {
    var entry = this._cache[key];
    if (!entry)
      return null;
    entry.bump();
    return entry.value;
  },
  stamp: function(stamp) {
    if (stamp == this._stamp)
      return;
    this._init(stamp);
  },
  ensureMaxEntries: function(max) {
    jslog("Cache resize to " + max);
    if (this.maxEntries < max)
      this.maxEntries = max;
  },
  _removeEldest: function() {
    var count = 0;
    var eldest = null;
    var eldestKey = null;
    for (key in this._cache) {
      count++;
      var current = this._cache[key];
      if (eldest == null || eldest.stamp > current.stamp) {
        eldestKey = key;
        eldest = current;
      }
    }
    if (count <= this.maxEntries)
      return;
    if (eldest != null)
      delete this._cache[key];
  }
});;
/*! RESOURCE: /scripts/classes/ajax/GlideURL.js */
var GlideURL = Class.create({
  initialize: function(contextPath) {
    this.contextPath = '';
    this.params = new Object();
    this.encodedString = '';
    this.encode = true;
    this.setFromString(contextPath ? contextPath : '');
    if (typeof GlideTransactionScope != 'undefined')
      GlideTransactionScope.appendTransactionScope(this.addParam.bind(this));
  },
  setFromCurrent: function() {
    this.setFromString(window.location.href);
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
  getContexPath: function() {
    return this.contextPath;
  },
  getContextPath: function() {
    return this.contextPath;
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
    qs = this._getParamsForURL(this.params);
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
      url += '&' + n + '=' + (this.encode ? this._encodeUriQuery(p + '') : p);
    }
    return url;
  },
  _encodeUriQuery: function(val) {
    return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':');
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
});
GlideURL.refresh = function() {
  window.location.replace(window.location.href);
};;
/*! RESOURCE: /scripts/ga_batch/js_includes_batchedga.js */
/*! RESOURCE: /scripts/ga_batch/batchedGlideAjax.js */
window.NOW.batchedGlideAjax = function batchedGlideAjax(toProcess) {
  var batchGA = new GlideAjax("AJAXXMLHttpAggregator");
  batchGA.disableRunInBatch();

  function batchErrorHandler(onCompletionFn) {
    return function(error) {
      console.log("BatchedGlideAjax: Got error", error);
      toProcess.forEach(function(ga) {
        handleChildResponseError({
          status: 500,
          glideAjax: ga,
          error: "Batch failed"
        });
      });
      if (onCompletionFn)
        onCompletionFn([]);
    }
  }

  function batchResponseHandler(onCompletionFn) {
    return function(response) {
      console.log("BatchedGlideAjax: Got response", response);
      if (!response || !response.responseXML) {
        batchErrorHandler(onCompletionFn)(response);
        return;
      }
      var doc = response.responseXML.documentElement;
      if (!doc || !doc.childNodes) {
        batchErrorHandler(onCompletionFn)(response);
        return;
      }
      var unprocessedGas = processIndividualResponses(Array.prototype.slice.apply(doc.childNodes));
      if (onCompletionFn)
        onCompletionFn(unprocessedGas);
    }
  }

  function processIndividualResponses(nodes) {
    var processedIndicies = [];
    nodes.forEach(function(node) {
      var response = responseNode(node);
      try {
        if (response.succeeded)
          handleChildResponseSuccess(response);
        else
          handleChildResponseError(response);
      } catch (e) {
        console.warn("BatchedGlideAjax: Error processing child response", response, ":", e);
      } finally {
        processedIndicies.push(response.queueIndex);
      }
    });
    return toProcess.filter(function(ga, idx) {
      return processedIndicies.indexOf(idx) < 0;
    });
  }

  function responseNode(node) {
    var processorIdx = ~~node.getAttribute("sysparm_processor_index");
    if (processorIdx < 0 || processorIdx >= toProcess.length) {
      console.error("BatchedGlideAjax: Processor index " + processorIdx + " out of bounds for batch queue", toProcess);
      return null;
    }
    var ga = toProcess[processorIdx];
    var status = ~~node.getAttribute("status");
    var error = node.getAttribute("error");
    var answer = node.getAttribute("answer");
    var responseDocument = null;
    return {
      queueIndex: processorIdx,
      status: status,
      error: error,
      answer: answer,
      glideAjax: ga,
      succeeded: status >= 200 && status < 300,
      get responseDocument() {
        if (responseDocument == null) {
          responseDocument = document.implementation.createDocument("", "", null);
          var clonedNode = responseDocument.importNode(node, true);
          responseDocument.appendChild(clonedNode);
        }
        return responseDocument;
      }
    };
  }

  function handleChildResponseError(response) {
    var errorObject = {
      status: response.status,
      statusText: response.error,
      error: response.error,
      description: response.error,
      responseText: response.error
    };
    var ga = response.glideAjax;
    if (ga.errorCallbackFunction)
      setTimeout(function() {
        ga.errorCallbackFunction(errorObject, ga.callbackArgs)
      }, 0);
  }

  function handleChildResponseSuccess(response) {
    var ga = response.glideAjax;
    if (!ga.callbackFunction)
      return;
    if (ga.wantAnswer) {
      var answer = response.answer;
      setTimeout(function() {
        ga.callbackFunction(answer, ga.callbackArgs);
      }, 0);
    } else {
      var requestObject = {
        responseXML: response.responseDocument,
        status: status
      };
      setTimeout(function() {
        ga.callbackFunction(requestObject, ga.callbackArgs)
      }, 0);
    }
  }

  function addParamsToBatch(params, index) {
    var param;
    if (!params)
      return;
    for (param in params) {
      if (!params.hasOwnProperty(param))
        continue;
      batchGA.addParam(index + '.' + param, params[param]);
    }
  }

  function decodeFormURI(value) {
    value = value ? value.replace(/\+/g, '%20') : value;
    return decodeURIComponent(value);
  }

  function addCustomQueryStringToBatch(qs, index) {
    if (!qs)
      return;
    if (qs.startsWith('?'))
      qs = qs.substring(1);
    var params = qs.split('&');
    params.forEach(function(param) {
      var nameValuePair = param.split('=');
      var name = decodeFormURI(nameValuePair[0]);
      var value = decodeFormURI(nameValuePair[1]);
      batchGA.addParam(index + '.' + name, value);
    });
  }
  return {
    execute: function(unprocessedCallback) {
      toProcess.forEach(function(ga, idx) {
        addParamsToBatch(ga.params, idx);
        addParamsToBatch(ga.additionalProcessorParams, idx);
        addCustomQueryStringToBatch(ga.postString, idx);
      });
      batchGA.addParam("sysparm_aggregation_size", toProcess.length);
      batchGA.setErrorCallback(batchErrorHandler(unprocessedCallback));
      batchGA.getXML(batchResponseHandler(unprocessedCallback));
    }
  }
};;
/*! RESOURCE: /scripts/ga_batch/glideAjaxBatchQueue.js */
window.NOW.GlideAjaxBatchRequestQueue = (function() {
  var queue = [];
  var startProcessingTimeout;
  var MAX_TIME_IN_QUEUE = window.NOW.batch_glide_ajax_requests_max_time_in_queue || 50;
  if (MAX_TIME_IN_QUEUE < 0)
    MAX_TIME_IN_QUEUE = 50;

  function processQueue() {
    clearProcessingTimeout();
    var toProcess = queue.slice(0);
    if (toProcess.length == 0)
      return;
    var batchGa = window.NOW.batchedGlideAjax(toProcess);
    batchGa.execute(function requeueUnprocessed(unprocessedGas) {
      queue = unprocessedGas.concat(queue);
      processQueue();
    });
    queue.length = 0;
  }

  function clearProcessingTimeout() {
    if (startProcessingTimeout) {
      clearTimeout(startProcessingTimeout);
      startProcessingTimeout = undefined;
    }
  }
  return {
    enqueue: function(glideAjax) {
      queue.push(glideAjax);
      if (!startProcessingTimeout)
        startProcessingTimeout = setTimeout(processQueue, MAX_TIME_IN_QUEUE);
    },
    processQueue: processQueue
  }
})();;;
/*! RESOURCE: /scripts/classes/ajax/GlideAjax.js */
var GlideAjax = Class.create(GlideURL, {
  URL: "xmlhttp.do",
  initialize: function initialize($super, processor, url) {
    var u = this.URL;
    if (url)
      u = url;
    $super(u);
    this.setProcessor(processor);
    this.callbackFunction;
    this.callbackArgs;
    this.additionalProcessorParams;
    this.errorCallbackFunction;
    this.wantRequestObject = false;
    this.setScope("global");
    this.setWantSessionMessages(true);
    if (typeof GlideTransactionScope != 'undefined')
      GlideTransactionScope.appendTransactionScope(this.addParam.bind(this), true);
    this.runRequestInBatch = window.NOW.batch_glide_ajax_requests;
  },
  disableRunInBatch: function() {
    this.runRequestInBatch = false;
  },
  getProcessor: function() {
    return this.processor;
  },
  getAnswer: function() {
    if (!(this.requestObject && this.requestObject.responseXML))
      return null;
    return this.requestObject.responseXML.documentElement.getAttribute("answer");
  },
  setProcessor: function(p) {
    this.processor = p;
    this.addParam("sysparm_processor", p);
  },
  setQueryString: function(qs) {
    this.queryString = qs;
  },
  preventLoadingIcon: function() {
    this._preventLoadingIcon = true;
  },
  preventCancelNotification: function() {
    this._suppressCancelNotification = true;
  },
  getXMLWait: function(additionalParams) {
    this.addParam("sysparm_synch", "true");
    this.additionalProcessorParams = additionalParams;
    this.async = false;
    var sw = new StopWatch();
    this._makeRequest();
    var m = "*** WARNING *** GlideAjax.getXMLWait - synchronous function - processor: " + this.processor
    sw.jslog(m);
    if (window.console && window.console.log)
      console.log("%c " + m, 'background: darkred; color: white;');
    if (this.requestObject.status != 200)
      this._handleError();
    return this._responseReceived();
  },
  getXML: function(callback, additionalParams, responseParams) {
    this.wantAnswer = false;
    this._getXML0(callback, additionalParams, responseParams);
  },
  getXMLAnswer: function(callback, additionalParams, responseParams) {
    this.wantAnswer = true;
    this._getXML0(callback, additionalParams, responseParams);
  },
  _getXML0: function(callback, additionalParams, responseParams) {
    this.callbackFunction = callback;
    this.callbackArgs = responseParams;
    this.additionalProcessorParams = additionalParams;
    this.async = true;
    setTimeout(function() {
      this._makeRequest();
    }.bind(this), 0);
  },
  _makeRequest: function() {
    this.requestObject = this._getRequestObject();
    if (this.requestObject == null)
      return null;
    if (!GlideAjax.want_session_messages)
      this.setWantSessionMessages(false);
    var refUrl = this._buildReferringURL();
    if (refUrl != "") {
      this.addParam('ni.nolog.x_referer', 'ignore');
      this.addParam('x_referer', refUrl);
    }
    if (typeof g_autoRequest != 'undefined' && 'true' == g_autoRequest)
      this.addParam('sysparm_auto_request', g_autoRequest);
    this.postString = this.getQueryString(this.additionalProcessorParams);
    if (this.queryString) {
      if (this.postString)
        this.postString += "&";
      this.postString += this.queryString;
    }
    if (this._isEligibleForBatching())
      this._enqueueBatchRequest();
    else
      this._sendRequest();
    return this.requestObject;
  },
  _isEligibleForBatching: function() {
    return this.async &&
      this.runRequestInBatch &&
      window.NOW.batch_glide_ajax_requests &&
      this.contextPath === this.URL;
  },
  _enqueueBatchRequest: function() {
    if (window.NOW && window.NOW.GlideAjaxBatchRequestQueue)
      window.NOW.GlideAjaxBatchRequestQueue.enqueue(this);
    else {
      console.warn("GlideAjaxBatchRequestQueue not available, falling back to immediate dispatch");
      console.debug("Add scripts/ga_batch/js_includes_batchga.js to your page to enable batching");
      this._sendRequest();
    }
  },
  _sendRequest: function() {
    this._showLoading();
    if (this.async)
      this.requestObject.onreadystatechange = this._processReqChange.bind(this);
    CustomEvent.fireTop("request_start", document);
    this.requestObject.open("POST", this.contextPath, this.async);
    this.requestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    if (typeof g_ck != 'undefined' && g_ck != "")
      this.requestObject.setRequestHeader('X-UserToken', g_ck);
    try {
      this.requestObject.send(this.postString);
    } catch (e) {}
    if (!this.async || (this.callbackFunction == null))
      this._hideLoading();
  },
  _processReqChange: function() {
    if (this.requestObject.readyState != 4)
      return;
    this.requestObject.onreadystatechange = function() {};
    this._hideLoading();
    if (!this._errorCheck()) {
      this._responseReceived();
      return;
    }
    try {
      this._handleError();
    } catch (e) {
      jslog("GlideAjax error: " + e);
    }
  },
  _errorCheck: function() {
    this._cancelErrorXML = this._getCancelError();
    return this._getResponseCode() != 200 || this._wasCanceled();
  },
  _handle401Error: function() {
    if (getTopWindow().loggingOut)
      return false;
    var sessionLoggedIn = this.requestObject.getResponseHeader("X-SessionLoggedIn");
    if ("true" != sessionLoggedIn) {
      if (window.confirm(new GwtMessage().getMessage("ajax_session_timeout_goto_login_confirm"))) {
        getTopWindow().location.href = "/navpage.do";
        return true;
      }
    } else {
      var allowResubmit = this.requestObject.getResponseHeader("X-UserToken-AllowResubmit");
      if ("true" == allowResubmit) {
        var autoResubmit = this.requestObject.getResponseHeader("X-AutoResubmit");
        if ("true" == autoResubmit) {
          this._sendRequest();
          return true;
        }
        if (window.confirm(new GwtMessage().getMessage("ajax_session_timeout_resubmit_request_confirm"))) {
          this._sendRequest();
          return true;
        }
      } else {
        if ("true" == sessionLoggedIn)
          return false;
        var msg = new GwtMessage().getMessage("ajax_session_timeout_refresh_screen");
        if (!msg)
          msg = "Your session has expired. Click OK to continue.";
        if (window.confirm(msg)) {
          getTopWindow().location.href = "/navpage.do";
          return true;
        }
      }
    }
    return false;
  },
  _handleError: function() {
    var responseCode = this._getResponseCode();
    if (responseCode == 401) {
      var requestedToken = this.requestObject.getResponseHeader("X-UserToken-Request");
      var respondedToken = this.requestObject.getResponseHeader("X-UserToken-Response");
      if (requestedToken && respondedToken && requestedToken != respondedToken)
        CustomEvent.fireAll("ck_updated", respondedToken);
      var handleTimeOut = this.requestObject.getResponseHeader("X-HandleTimeOut");
      if ("true" == handleTimeOut)
        if (this._handle401Error())
          return;
    } else if (responseCode == 404 && this._outOfScope()) {
      var err_options = {
        text: "Access to Script Include " + this.processor + " blocked from scope: " + (this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global"),
        type: "system",
        attributes: {
          type: "error"
        }
      };
      if (typeof GlideUI != 'undefined')
        GlideUI.get().fire(new GlideUINotification(err_options));
    } else if (this._wasCanceled() && this.callbackFunction && !this._getSuppressCancelNotification()) {
      var err_options = {
        text: this._getCancelErrorText(),
        type: "system",
        attributes: {
          type: "error"
        }
      };
      if (typeof GlideUI != 'undefined')
        GlideUI.get().fire(new GlideUINotification(err_options));
    }
    if (this.errorCallbackFunction)
      this.errorCallbackFunction(this.requestObject, this.callbackArgs);
  },
  _getRequestObject: function() {
    var req = null;
    if (window.XMLHttpRequest)
      req = new XMLHttpRequest();
    else if (window.ActiveXObject)
      req = new ActiveXObject("Microsoft.XMLHTTP");
    return req;
  },
  _getResponseCode: function() {
    return this.requestObject.status;
  },
  _wasCanceled: function() {
    if (!this._cancelErrorXML)
      return false;
    var answer = this._cancelErrorXML.getAttribute('transaction_canceled');
    return answer == 'true';
  },
  _getSuppressCancelNotification: function() {
    if (this._suppressCancelNotification)
      return true;
    if (this._cancelErrorXML) {
      var suppress = this._cancelErrorXML.getAttribute("suppress_notification");
      if (suppress && suppress == 'true')
        return true;
    }
    return false;
  },
  _getCancelErrorText: function() {
    if (this._cancelErrorXML) {
      var cancelMessage = this._cancelErrorXML.getAttribute('cancel_message');
      if (cancelMessage)
        return cancelMessage;
    }
    return "Information could not be downloaded from the server because the transaction was canceled.";
  },
  _getCancelError: function() {
    var xml = this.requestObject.responseXML;
    if (!xml) {
      var responseText = this.requestObject.responseText;
      var errorPattern = /<xml?[^>]*id="transaction_canceled_island"?[^>]*>/;
      var matches = responseText.match(errorPattern);
      if (!matches)
        return false;
      xml = loadXML(matches[0]);
    }
    return xml.documentElement;
  },
  _outOfScope: function() {
    var callerScope = this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global";
    var isAppScope = callerScope != "global";
    return isAppScope && this.requestObject.responseXML.documentElement.getAttribute("error").indexOf("HTTP Processor class not found") == 0;
  },
  _responseReceived: function() {
    lastActivity = new Date();
    CustomEvent.fireTop("request_complete", document);
    this._fireUINotifications();
    this._showSessionNotifications();
    if (this.callbackFunction) {
      if (this.wantAnswer)
        this.callbackFunction(this.getAnswer(), this.callbackArgs);
      else
        this.callbackFunction(this.requestObject, this.callbackArgs);
    }
    if (this.wantRequestObject)
      return this.requestObject;
    return this.requestObject ? this.requestObject.responseXML : null;
  },
  _showLoading: function() {
    if (!this._preventLoadingIcon)
      CustomEvent.fireAll("ajax.loading.start", this);
  },
  _hideLoading: function() {
    if (!this._preventLoadingIcon && window.CustomEvent)
      CustomEvent.fireAll("ajax.loading.end", this);
  },
  _buildReferringURL: function() {
    var path = location.pathname;
    var args = location.search;
    if (path.substring(path.length - 1) == '/') {
      if (args)
        return args;
      return "";
    }
    return path.substring(path.lastIndexOf('/') + 1) + args;
  },
  _fireUINotifications: function() {
    if (!this.requestObject || !this.requestObject.responseXML)
      return;
    var notifications = this.requestObject.responseXML.getElementsByTagName('ui_notifications');
    if (!notifications || notifications.length == 0)
      return;
    var spans = notifications[0].childNodes;
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];
      if (typeof GlideUI != 'undefined')
        GlideUI.get().fire(new GlideUINotification({
          xml: span
        }));
    }
    $(document).fire('glide-notification:clear', {
      spans: spans
    });
  },
  _showSessionNotifications: function() {
    if (!this.requestObject || !this.requestObject.responseXML)
      return;
    var notifications = this.requestObject.responseXML.getElementsByTagName('session_notifications');
    if (!notifications || notifications.length == 0)
      return;
    var spans = notifications[0].childNodes;
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];
      var type = span.getAttribute("data-type");
      if (typeof GlideUI != 'undefined') {
        if (type !== 'nav')
          GlideUI.get().addOutputMessage({
            msg: span.getAttribute("data-text"),
            type: type
          });
      }
    }
  },
  setScope: function(scope) {
    if (scope) {
      this.addParam('sysparm_scope', scope);
    }
    return this;
  },
  setErrorCallback: function(callback) {
    this.errorCallbackFunction = callback;
  },
  setWantRequestObject: function(want) {
    this.wantRequestObject = want;
  },
  setWantSessionMessages: function(want) {
    this.addParam('sysparm_want_session_messages', want);
  },
  toString: function() {
    return "GlideAjax";
  }
});
GlideAjax.disableSessionMessages = function() {
  GlideAjax.want_session_messages = false;
};
GlideAjax.enableSessionMessages = function() {
  GlideAjax.want_session_messages = true;
};
GlideAjax.enableSessionMessages();;
/*! RESOURCE: /scripts/doctype/GwtNavFilterDoctype.js */
var GwtNavFilter = {
  cachedElements: {},
  clearText: function() {
    this.text = '';
  },
  filter: function(text, favoritesOnly) {
    if (!text && favoritesOnly) {
      this._clearFilter();
      CustomEvent.fire('favorites.show');
      return;
    }
    this.favoritesOnly = favoritesOnly;
    this.timers = {};
    this.m = text;
    var sw = new StopWatch();
    if (!this.text)
      this._saveUserPreferences();
    this.text = this._cleanupText(text);
    if (!this.text)
      this._clearFilter();
    else
      this._filter();
    this.timers['total'] = sw.getTime();
  },
  _cleanupText: function(text) {
    var answer = text.toLowerCase();
    if (answer == "**")
      return "";
    if (answer.indexOf("*") == 0)
      answer = answer.substring(1);
    return answer;
  },
  _clearFilter: function() {
    this._showAppsCollapsed();
    this._restoreUserPreferences();
  },
  _filter: function() {
    this.displayed = {};
    var sw = new StopWatch();
    this._matchApps();
    this.timers['matchApps'] = sw.getTime();
    sw = new StopWatch();
    this._matchModules();
    this.timers['matchModules'] = sw.getTime();
  },
  _matchApps: function() {
    var apps = this._getApps();
    for (var id in apps) {
      if (this._textMatch(apps[id]) && !this.favoritesOnly)
        this._showAppAndModules(id);
      else
        this._hideAppAndModules(id);
    }
  },
  _matchModules: function() {
    var modules = this._getModules();
    var category = '';
    var categoryparent = '';
    this.timers['module count'] = modules.length;
    for (var i = 0, n = modules.length; i < n; i++) {
      var module = modules[i];
      var id = module.getAttribute('moduleid');
      if (this.displayed[id])
        continue;
      if (this.favoritesOnly) {
        if ($j(module).find(".icon-star").length == 0)
          continue;
      }
      var label = module.getAttribute('modulename');
      var type = module.getAttribute('moduletype');
      var parent = module.getAttribute('moduleparent');
      if (categoryparent != parent) {
        category = '';
        categoryparent = parent;
      }
      if (type == 'SEPARATOR') {
        var categoryElem = this._findByClass(module.childNodes, 'nav_menu_header');
        if (categoryElem) {
          category = this._getInnerText(categoryElem);
          if (this.favoritesOnly)
            module.style.display = '';
        }
      } else if (this._textMatch(label) || this._textMatch(category)) {
        this._showModule(module);
      }
    }
  },
  _findByClass: function(nodes, classname) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes.item(i);
      if (node.className.indexOf(classname) != -1)
        return node;
    }
    return null;
  },
  _textMatch: function(label) {
    return label && label.toLowerCase().indexOf(this.text) > -1;
  },
  _getApps: function() {
    if (this.appList)
      return this.appList;
    var sw = new StopWatch();
    this.appList = new Object();
    var apps = document.getElementsByTagName("label");
    for (var i = 0, n = apps.length; i != n; i++) {
      var app = apps[i];
      var appid = app.getAttribute('for');
      if (!appid)
        continue;
      if (app.id == "div.perspectives")
        continue;
      var t = this._getInnerText(app);
      this.appList[appid] = t;
    }
    this.timers["getApps"] = sw.getTime();
    return this.appList;
  },
  _getModules: function() {
    if (!this.modList) {
      var sw = new StopWatch();
      this.modList = [];
      var rows = document.getElementsByTagName("li");
      for (var i = 0, n = rows.length; i != n; i++) {
        var row = rows[i];
        var parent = row.getAttribute('moduleparent');
        if (!parent || (parent == 'perspectives'))
          continue;
        this.modList.push(row);
      }
      this.timers['getModules'] = sw.getTime();
    }
    return this.modList;
  },
  _showAppsCollapsed: function() {
    var apps = this._getApps();
    for (var id in apps) {
      var appDiv = this._getCachedElement('div.' + id);
      if (!appDiv)
        continue;
      showObject(appDiv);
    }
    var rows = document.getElementsByTagName("li");
    for (var i = 0; i < rows.length; i++) {
      var module = rows[i];
      module.style.display = '';
      if (module.getAttribute('moduletype') == 'SEPARATOR') {
        var id = module.getAttribute('moduleid');
        var tr = this._getCachedElement("children." + id);
        if (tr)
          tr.style.display = '';
        var span = this._getCachedElement(id);
        if (span) {
          span.style.height = 'auto';
          showObject(span);
          var img = this._getCachedElement('img.' + id);
          if (!img)
            continue;
          img.src = "images/arrow_reveal.gifx";
        }
      }
    }
  },
  _showModulesForApp: function(span, displayed) {
    var trs = span.getElementsByTagName("li");
    for (var i = 0, n = trs.length; i != n; i++) {
      trs[i].style.display = '';
      var id = trs[i].getAttribute('moduleid');
      if (displayed && id)
        this.displayed[id] = 1;
    }
  },
  _saveUserPreferences: function() {
    var sw = new StopWatch();
    this.expandedSeparators = {};
    var apps = this._getApps();
    this.expandedApps = {};
    for (var id in apps) {
      var span = this._getCachedElement('app_' + id);
      if ($j(span).height())
        this.expandedApps[id] = 1;
    }
    var modules = this._getModules();
    for (var i = 0, n = modules.length; i < n; i++) {
      var module = modules[i];
      var type = module.getAttribute('moduletype');
      if (type != 'SEPARATOR')
        continue;
      var id = module.getAttribute('moduleid');
      var tr = module.getElementsByTagName('ul')[0];
      if (!tr)
        continue;
      if ($j(tr).css('display') != 'none')
        this.expandedSeparators[id] = 1;
    }
    this.timers["saveUserPreferences"] = sw.getTime();
  },
  _getCachedElement: function(id) {
    var element = this.cachedElements[id];
    if (element)
      return element;
    element = gel(id);
    this.cachedElements[id] = element;
    return element;
  },
  _restoreUserPreferences: function() {
    var apps = this._getApps();
    for (var id in apps) {
      var div = this._getCachedElement('div.' + id);
      var input = this._getCachedElement(id);
      if (this.expandedApps[id]) {
        input.checked = true
      } else {
        input.checked = false;
      }
      $j(input).trigger('change');
    }
    var colImg = isTextDirectionRTL() ? "images/arrow_rtl_hide.gifx" : "images/arrow_hide.gifx";
    var expImg = "images/arrow_reveal.gifx";
    var modules = this._getModules();
    for (var i = 0, n = modules.length; i < n; i++) {
      var module = modules[i];
      var id = module.getAttribute('moduleid');
      var type = module.getAttribute('moduletype');
      if (type != 'SEPARATOR')
        continue;
      var tr = this._getCachedElement("children." + id);
      var span = this._getCachedElement(id);
      var img = this._getCachedElement('img.' + id);
      if (this.expandedSeparators[id]) {
        if (tr)
          tr.style.display = '';
        if (span) {
          showObject(span);
          span.style.height = 'auto';
        }
        if (img)
          img.src = expImg;
      } else {
        if (tr)
          tr.style.display = '';
        if (span) {
          hideObject(span);
          span.style.height = 'auto';
        }
        if (img)
          img.src = colImg;
      }
    }
  },
  _showAppAndModules: function(id) {
    this._showApp(id);
    var span = this._getCachedElement('app_' + id);
    this._showModulesForApp(span, true);
  },
  _showApp: function(id) {
    if (this.displayed[id])
      return;
    var app = this._getCachedElement('div.' + id);
    if (!app)
      return;
    app.style.display = '';
    this.displayed[id] = 1;
    var checkbox = app.nextSibling;
    checkbox.checked = true;
    $j(checkbox).trigger('change');
  },
  _hideAppAndModules: function(id) {
    var e = this._getCachedElement('div.' + id);
    if (!e)
      return;
    e.style.display = "none";
    e = this._getCachedElement(id);
    e.checked = false;
    $j(e).trigger('change');
    var app = this._getCachedElement('app_' + id);
    $j(app).find('li').each(function(index, elem) {
      elem.style.display = 'none';
    });
  },
  _showModule: function(module) {
    var id = module.getAttribute('moduleid');
    if (id) {
      if (this.displayed[id])
        return;
      this.displayed[id] = 1;
    }
    module.style.display = '';
    if (module.getAttribute('moduletype') == 'SEPARATOR') {
      var tr = this._getCachedElement("children." + id);
      if (tr)
        tr.style.display = '';
      var span = this._getCachedElement('app_' + id);
      showObject(span);
      span.style.height = 'auto';
      span.setAttribute('data-open', 'true');
      var img = this._getCachedElement('img_' + id);
      if (img)
        img.src = img.getAttribute('data-expanded');
    }
    var container = module.getAttribute('modulecontainer');
    if (container) {
      var row = this._getCachedElement('module.' + container);
      this._showModule(row);
      return;
    }
    var app = module.getAttribute('moduleparent');
    if (app)
      this._showApp(app);
  },
  _getInnerText: function(node) {
    return node.textContent || node.innerText;
  },
  type: 'GwtNavFilter'
};
/*! RESOURCE: /scripts/doctype/navigator.js */
$j(function($) {
  'use strict';
  $(document).on("click", "LABEL.nav_menu", function() {
    var id = $(this).attr('for');
    var input = $('#' + id);
    id = "menu." + id + ".expanded";
    setTimeout(function() {
      if (input.prop('checked'))
        setPreference(id, "true");
      else
        deletePreference(id);
    }, 0);
  });
  $('input[type=checkbox]').each(function() {
    var self = $(this);
    var appContainer = $('#app_' + this.id);
    if (self.prop('checked'))
      appContainer.addClass('opened');
    self.change(function() {
      var el = $(this);
      if (el.prop('checked')) {
        appContainer.addClass('opened');
      } else
        appContainer.removeClass('opened');
    });
  });
  var previousTerm = '';
  var highlighted_mod;
  var f = $("#filter");
  f.on("keyup", function(evt) {
    navFilterKeyUp(this.value, '', evt)
  });
  f.on("focus", function(evt) {
    navFilterFocus(this, '', evt)
  });
  f.on("blur", function(evt) {
    navFilterBlur(this, '', evt)
  });
  $("#nav_filter_controls").on("click", function(evt) {
    resetNavFilter();
    navFilterKeyUp('', '');
  });

  function navFilterBlur(input, msg) {
    unhighlightModule();
    var val = input.value;
    if (!val)
      previousTerm = '';
  }

  function navFilterFocus(input, msg) {
    var val = input.value;
    if (!val || (val === msg)) {
      input.value = '';
      previousTerm = '';
    } else
      previousTerm = val;
    setTimeout(function() {
      input.select();
    }, 10);
  }

  function navFilterKeyUp(val, msg, evt) {
    if (val === msg)
      val = '';
    var s = $("#nav_filter_controls")[0];
    if (!val || val === '')
      s.style.visibility = "hidden";
    else
      s.style.visibility = "visible";
    if (evt && val !== '') {
      if (evt.keyCode === 40) {
        if (!highlighted_mod)
          focusFirstVisibleModule();
        else
          focusNextVisibleModule(highlighted_mod);
        return;
      }
      if (evt.keyCode === 38) {
        if (highlighted_mod)
          focusPreviousVisibleModule(highlighted_mod);
        return;
      }
      if (evt.keyCode === 13) {
        if (highlighted_mod)
          runModule(highlighted_mod, evt.shiftKey);
        return;
      }
      if (evt.keyCode === 27) {
        if (val === previousTerm)
          previousTerm = '';
        restoreFilterText(msg);
        return;
      }
    }
    unhighlightModule();
    var win = getTopWindow();
    try {
      if (typeof win.navFilterExtension === "function" && win.navFilterExtension(val, msg))
        return;
    } catch (e) {
      jslog("Error in UI Script navFilterExtension - " + e);
    }
    win = win.$('gsft_main');
    if (!win)
      win = {};
    if (val.endsWith('.form')) {
      restoreFilterText(msg);
      val = val.toLowerCase().replace(/ /g, '');
      win.src = getCancelableLink(val.replace('.form', '.do?sys_id=-1'));
    } else if (val.endsWith('.list')) {
      restoreFilterText(msg);
      val = val.toLowerCase().replace(/ /g, '');
      win.src = getCancelableLink(val.replace('.list', '_list.do'));
    } else if (val.endsWith('.FORM')) {
      val = val.replace(/ /g, '');
      restoreFilterText(msg);
      var url = new GlideURL(val.toLowerCase().replace('.form', '.do?sys_id=-1'));
      window.open(url.getURL());
    } else if (val.endsWith('.LIST')) {
      val = val.replace(/ /g, '');
      restoreFilterText(msg);
      var url = new GlideURL(val.toLowerCase().replace('.list', '_list.do'));
      window.open(url.getURL());
    } else if (val.endsWith('_list.do')) {
      restoreFilterText(msg);
      val = val.toLowerCase().replace(/ /g, '');
      win.src = val;
    } else if (val.endsWith('.do')) {
      restoreFilterText(msg);
      val = val.toLowerCase().replace(/ /g, '');
      win.src = val + "?sys_id=-1";
    } else {
      GwtNavFilter.filter(val, jQuery('#navigator_favorite_switcher').hasClass('icon-star'));
      if (val === '')
        unhighlightModule();
      else
        focusFirstVisibleModule();
    }
  }
  CustomEvent.observe("favorites.toggle", function() {
    if (f.val())
      navFilterKeyUp(f.val());
  });

  function unhighlightModule() {
    if (highlighted_mod) {
      gel(highlighted_mod).style.backgroundColor = "";
      highlighted_mod = undefined;
    }
  }

  function focusFirstVisibleModule() {
    var mods = document.getElementsByTagName("li");
    for (var i = 0; i < mods.length; i++) {
      var mod = mods[i];
      if (mod.getAttribute("name") !== "nav.module" || mod.getAttribute("moduletype") === "MENU_LIST" || mod.getAttribute("moduletype") === "SEPARATOR")
        continue;
      if (mod.style.display !== "none") {
        highlightMod(mod);
        highlighted_mod = mod.id;
        break;
      }
    }
  }

  function focusNextVisibleModule(hl) {
    var mods = document.getElementsByTagName("li");
    var found = false;
    for (var i = 0; i < mods.length; i++) {
      var mod = mods[i];
      if (!found && mod.id === hl) {
        found = true;
        continue;
      }
      if (!found)
        continue;
      if (mod.getAttribute("name") !== "nav.module" || mod.getAttribute("moduletype") === "MENU_LIST" || mod.getAttribute("moduletype") === "SEPARATOR")
        continue;
      if (mod.style.display !== "none") {
        if (hl !== "")
          gel(hl).style.backgroundColor = "";
        highlightMod(mod);
        highlighted_mod = mod.id;
        break;
      }
    }
  }

  function focusPreviousVisibleModule(hl) {
    var mods = document.getElementsByTagName("li");
    var foundhighlighted = false;
    var foundcandidate = false;
    var candidate;
    for (var i = 0; i < mods.length; i++) {
      var mod = mods[i];
      if (!foundhighlighted && mod.id !== hl &&
        mod.getAttribute("name") === "nav.module" &&
        mod.getAttribute("moduletype") !== "MENU_LIST" &&
        mod.getAttribute("moduletype") !== "SEPARATOR" &&
        mod.style.display !== "none") {
        candidate = mod;
        foundcandidate = true;
      }
      if (!foundhighlighted && mod.id === hl) {
        foundhighlighted = true;
        if (foundcandidate) {
          highlightMod(candidate);
          highlighted_mod = candidate.id;
        } else
          highlighted_mod = undefined;
        gel(hl).style.backgroundColor = "";
        break;
      }
    }
  }

  function highlightMod(mod) {
    var td = mod.firstChild;
    if (typeof g_mod_highlight_color !== "undefined")
      mod.style.backgroundColor = g_mod_highlight_color;
    else
      mod.style.backgroundColor = "#eee";
  }

  function runModule(hl, newWindow) {
    var $mod = $(gel(hl));
    var a = $mod.find('A')[0];
    var target = a.getAttribute("target");
    var cancelable = a.getAttribute("data-cancelable");
    var href = a.getAttribute('href');
    if (newWindow)
      target = "_blank";
    if (cancelable === 'true')
      href = getCancelableLink(href);
    if (target === "" || target === "gsft_main") {
      var mod = $mod[0];
      mod.style.backgroundColor = "";
      highlighted_mod = undefined;
      var win = getTopWindow();
      win = win.$('gsft_main');
      if (!win)
        win = {};
      win.src = href;
    } else
      window.open(href);
  }

  function getCancelableLink(link) {
    if (g_cancelPreviousTransaction) {
      var nextChar = link.indexOf('?') > -1 ? '&' : '?';
      link += nextChar + "sysparm_cancelable=true";
    }
    return link;
  }

  function restoreFilterText(msg) {
    var f = gel('filter');
    if (previousTerm !== "") {
      f.value = previousTerm;
      navFilterKeyUp(previousTerm, msg);
    } else {
      previousTerm = '';
      f.value = '';
      navFilterKeyUp('', msg);
    }
  }

  function resetNavFilter() {
    var e = gel('filter');
    e.value = e.defaultValue;
    var s = gel('nav_filter_controls');
    s.style.visibility = "hidden";
    previousTerm = "";
  }
});
$j(function($) {
  "use strict";
  $(window).bind('collapse_all', function() {
    switchCheckedState(false);
    setUserPrefAllCollapsed();
  });
  $(window).bind('expand_all', function() {
    switchCheckedState(true);
    setUserPrefAllExpanded();
  });
  $(window).bind('toggle_auto_favorite', function() {
    toggleAutoFavorite();
  });

  function switchCheckedState(checked) {
    var t = $(".nav-wrapper input[type=checkbox]:not(#perspectives)").each(function() {
      $(this).prop('checked', checked);
      $(this).trigger('change');
    });
  }

  function setUserPrefAllExpanded() {
    var menuItems = getAllMenuItems();
    if (menuItems.length)
      batchSetPreference(menuItems.join('=true;') + '=true');
  }

  function setUserPrefAllCollapsed() {
    var menuItems = getAllMenuItems();
    if (menuItems.length)
      batchDeletePreference(menuItems.join(';'));
  }

  function getAllMenuItems() {
    return $.map($('label.nav_menu').not('#div\\.perspectives'), function(elem) {
      return 'menu.' + $(elem).attr('for') + '.expanded';
    });
  }

  function toggleAutoFavorite() {
    window.autoSaveFavoritePreference = !window.autoSaveFavoritePreference;
    setPreference('glide.ui.nav.auto_favorite', window.autoSaveFavoritePreference.toString());
  }
  document.on('click', 'img.section_toggle, span.section_toggle', function(evt, element) {
    var id = element.getAttribute("data-id");
    var e = $('#app_' + id);
    var ex = e[0].getAttribute('data-open');
    ex = ex === 'true';
    ex = !ex;
    e[0].setAttribute('data-open', ex);
    e.css({
      visibility: '',
      display: '',
      height: ''
    });
    var img = $j("#img_" + id);
    if (ex)
      img.addClass(img.attr('data-expanded')).removeClass(img.attr('data-collapsed'));
    else
      img.addClass(img.attr('data-collapsed')).removeClass(img.attr('data-expanded'));
    setPreference("collapse.section." + id, (!ex).toString());
  });
  CustomEvent.fire('nav.loaded');
  if (g_cancelPreviousTransaction) {
    document.on('click', '.menu[data-cancelable="true"]', function(evt, element) {
      if (!evt.isLeftClick())
        return;
      setTimeout(function(origValue) {
        this.setAttribute('href', origValue);
      }.bind(element, element.getAttribute('href')), 10);
      var nextChar = element.href.indexOf('?') > -1 ? '&' : '?';
      element.href += nextChar + "sysparm_cancelable=true";
    });
  }
  if (window.g_accessibility) {
    $('input[type=checkbox]').each(function(index, el) {
      $(el).focus(function() {
        var id = $(this).attr('id');
        $(document.getElementById('div.' + id)).addClass('focus');
      }).blur(function() {
        var id = $(this).attr('id');
        $(document.getElementById('div.' + id)).removeClass('focus');
      }).keypress(function(e) {
        if (e.which !== 13)
          return;
        var prop = $(this).prop('checked');
        $(this).prop('checked', !prop);
        $(this).trigger('change');
      });
    });
  }
  if (typeof g_ck !== 'undefined')
    CustomEvent.observe("ck_updated", function(ck) {
      g_ck = ck;
    });
  runAfterAllLoaded();

  function batchSetPreference(valueStr, func) {
    var u = getActiveUser();
    if (u) {
      var values = valueStr.split(';');
      var value = [];
      for (var i = 0; i < values.length; i++) {
        value = values[i].split('=');
        u.setPreference(value[0], value[1]);
      }
    }
    var url = new GlideAjax('UserPreference');
    url.addParam('sysparm_type', 'batch_set');
    url.addParam('sysparm_value', valueStr);
    url.getXML(func);
  }

  function batchDeletePreference(nameStr) {
    var u = getActiveUser();
    if (u) {
      var names = nameStr.split(';');
      for (var i = 0; i < names.length; i++) {
        u.deletePreference(names[i]);
      }
    }
    var url = new GlideAjax('UserPreference');
    url.addParam('sysparm_type', 'batch_delete');
    url.addParam('sysparm_value', nameStr);
    url.getXML();
  }
});;
/*! RESOURCE: /scripts/doctype/navigator_favorites.js */
$j(function($) {
  'use strict';
  var favoritesPreference = window.favoritesPreference;
  var inFavoritesMode = false;
  $(".nav-app.submenu").each(function() {
    if ($(this).attr('id') != "app_perspectives") {
      $(this).attr("hasFavorites", "false");
    }
  });
  for (var i = 0; i < favoritesPreference.length; i++) {
    var $module = $(document.getElementById('module.' + favoritesPreference[i]));
    $module.parents('.nav-app.submenu').attr('hasFavorites', 'true');
    $module.children(".navigator-favorite-star").removeClass("icon-star-empty").addClass("icon-star").attr('aria-pressed', 'true');
  }
  $(document).on("click", ".navigator-favorite-star", function() {
    toggleFavorite($(this));
    if (inFavoritesMode) {
      $(this).parent().hide();
    }
  });
  $(document).on("click", ".navigator .nav_menu_header", function() {
    var $fav = $(this).prev('.navigator-favorite-star');
    if ($fav.hasClass("icon-star") || !window.autoSaveFavoritePreference)
      return;
    toggleFavorite($fav);
  });
  $("#navigator_favorite_switcher").click(function() {
    inFavoritesMode = !inFavoritesMode;
    if (inFavoritesMode) {
      favoritesMode(true);
      $(this).removeClass("icon-star-empty").addClass("icon-star").attr('aria-pressed', 'true');
    } else {
      favoritesMode(false);
      $(this).removeClass("icon-star").addClass("icon-star-empty").attr('aria-pressed', 'false');
    }
    CustomEvent.fire("favorites.toggle");
  });
  CustomEvent.observe("favorites.show", function() {
    favoritesMode(true);
  });

  function favoritesMode(active) {
    if (active) {
      $("body.navigator").attr("favorites_mode", true);
      $(".app_module[modulename='separator']").hide();
    } else {
      $("body.navigator").attr("favorites_mode", false);
      $(".app_module[modulename='separator']").show();
      $(".app_module").show();
    }
    var group = $(".nav-app[hasFavorites]");
    $.each(group, function() {
      var $app = $(this);
      if ($app.attr("hasFavorites") === "true") {
        if (active) {
          $app.children().each(function() {
            var $module = $(this);
            if ($module.attr('moduletype') == 'SEPARATOR') {
              $module.show();
              $module.children('.section_toggle, hr').hide();
              $module.children('ul.separator-children').attr('data-open', 'true');
            }
            $(".icon-star-empty", $module).parent().hide();
          });
          $app.addClass("opened");
        } else {
          $app.children().each(function() {
            var $module = $(this);
            $(".icon-star-empty", $module).parent().show();
            $module.children(".section_toggle, hr").show();
          });
        }
        return true;
      }
      var id = $app.attr('id');
      var appId = id.substring(id.indexOf("_", 0) + 1, id.length);
      var selector = '#app_' + appId + ', #' + appId + ', #div\\.' + appId;
      $(selector)[(active ? 'hide' : 'show')]();
    });
  }

  function toggleFavorite($element) {
    var $fav = $element;
    var $app = $fav.parents(".submenu");
    var module = $element.parent().attr("moduleid");
    var index = favoritesPreference.indexOf(module);
    if ($fav.hasClass('icon-star-empty')) {
      $fav.removeClass('icon-star-empty').addClass('icon-star').attr('aria-pressed', 'true');
      $app.attr("hasFavorites", "true");
      if (index == -1)
        favoritesPreference.push(module);
    } else {
      $fav.removeClass('icon-star').addClass('icon-star-empty').attr('aria-pressed', 'false');
      $app.attr("hasFavorites", "false");
      $app.children().each(function() {
        if ($(".navigator-favorite-star", this).hasClass("icon-star")) {
          $app.attr("hasFavorites", "true");
          return false;
        }
      });
      if (index != -1)
        favoritesPreference.splice(index, 1);
    }
    setPreference("ng.navigator_favorites", JSON.stringify(favoritesPreference));
  }
});;
/*! RESOURCE: /scripts/doctype/navigator_menu.js */
$j(function($) {
  $('#perspective_switcher').click(function(e) {
    if (gActiveContext) {
      contextHide();
      return;
    }
    var saveFavoriteLabel = function() {
      var label = getMessage('Automatically Add Favorites');
      if (window.autoSaveFavoritePreference)
        label += ' <span class="icon-check" style="padding-left: 10px;"></span>';
      return label;
    }();
    var gcm = new GwtContextMenu("context_perspectives_menu");
    gcm.clear();
    $('a[parent_id=perspectives]').each(function(index, item) {
      var name = item.innerHTML;
      if (item.href.split("=")[1] == "All")
        gcm.addHref(name, "window.location = '" + item.href + "'");
      else
        gcm.addHref(name, "window.location = '" + item.href + "'");
    });
    gcm.addLine();
    gcm.addHref(saveFavoriteLabel, '$j(window).trigger("toggle_auto_favorite")');
    gcm.addHref(getMessage('Refresh Navigator Title'), 'window.location = "navigator_change.do"');
    gcm.addHref(getMessage('Collapse all applications'), '$j(window).trigger("collapse_all")');
    gcm.addHref(getMessage('Expand all applications'), '$j(window).trigger("expand_all")');
    contextShow(e, gcm.getID(), -1, 0, 0);
    e.stopPropagation();
  })
  $('body').click(function(evt) {
    CustomEvent.fireAll('body_clicked', evt);
  })
  CustomEvent.observe("body_clicked", contextMenuHide);
});
/*! RESOURCE: /scripts/doctype/html_class_setter.js */
(function() {
  if (window.NOW.htmlClassSetterInitialized)
    return;
  window.NOW.htmlClassSetterInitialized = true;
  var df = window.NOW.dateFormat;
  var shortDateFormat = window.NOW.shortDateFormat;
  var $h = $j('HTML');
  $j(function() {
    if (!df)
      return;
    CustomEvent.observe('timeago_set', function(timeAgo) {
      df.timeAgo = timeAgo;
      df.dateBoth = false;
      setDateClass();
    });
    CustomEvent.observe('shortdates_set', function(trueFalse) {
      shortDateFormat = trueFalse;
      setDateClass();
    });
    CustomEvent.observe('date_both', function(trueFalse) {
      df.dateBoth = trueFalse;
      df.timeAgo = false;
      setDateClass();
    })
  });

  function setDateClass() {
    $h.removeClass('date-timeago');
    $h.removeClass('date-calendar');
    $h.removeClass('date-calendar-short');
    $h.removeClass('date-both');
    if (df.dateBoth) {
      $h.addClass('date-both');
      if (shortDateFormat)
        $h.addClass('date-calendar-short');
      else
        $h.addClass('date-calendar');
    } else if (df.timeAgo)
      $h.addClass('date-timeago');
    else {
      if (shortDateFormat)
        $h.addClass('date-calendar-short');
      else
        $h.addClass('date-calendar');
    }
  }
  setDateClass();
  var toggleTemplate = function(trueFalse) {
    var bool = (typeof trueFalse !== "undefined") ? trueFalse : !window.NOW.templateToggle;
    window.NOW.templateToggle = bool;
    setPreference('glide.ui.templateToggle', bool);
    setTemplateToggle();
    if (CustomEvent.events.templateToggle.length > 1)
      CustomEvent.un('templateToggle', toggleTemplate);
  };
  CustomEvent.observe('templateToggle', toggleTemplate);
  CustomEvent.observe('compact', function(trueFalse) {
    window.NOW.compact = trueFalse;
    setCompact();
  });
  CustomEvent.observe('cc_listv3_tablerow_striped', function(bool) {
    if (bool) {
      $j('.table-container table.list-grid').addClass('table-striped');
    } else {
      $j('.table-container table.list-grid').removeClass('table-striped');
    }
  });

  function setTemplateToggle() {
    if (window.NOW.templateToggle)
      $h.addClass('templates');
    else
      $h.removeClass('templates');
  }
  setTemplateToggle();

  function setCompact() {
    try {
      var modalDiv = window.top.document.getElementById("settings_modal");
    } catch (e) {}
    if (modalDiv)
      modalDiv = modalDiv.childNodes[0];
    var $pH;
    if (parent.$j)
      $pH = parent.$j('HTML');
    if (window.NOW.compact) {
      $h.addClass('compact');
      if ($pH)
        $pH.addClass('compact');
      if (modalDiv && modalDiv.className.indexOf(' compact') == -1)
        modalDiv.className += ' compact';
    } else {
      $h.removeClass('compact');
      if ($pH)
        $pH.removeClass('compact');
      if (modalDiv && modalDiv.className.indexOf(' compact') > -1)
        modalDiv.className = modalDiv.className.replace(" compact", "");
    }
  }
  setCompact();
  CustomEvent.observe('tabbed', function(trueFalse) {
    window.NOW.tabbed = trueFalse;
    setTabbed();
  });

  function setTabbed() {
    if (window.NOW.tabbed)
      $h.addClass('tabbed');
    else
      $h.removeClass('tabbed');
  }
  setTabbed();

  function setListTableWrap() {
    if (window.NOW.listTableWrap)
      $j('HTML').removeClass('list-nowrap-whitespace');
    else
      $j('HTML').addClass('list-nowrap-whitespace');
  }
  setListTableWrap();
  CustomEvent.observe('table_wrap', function(trueFalse) {
    window.NOW.listTableWrap = trueFalse;
    setListTableWrap();
    CustomEvent.fire('calculate_fixed_headers');
  });
})();

function printList(maxRows) {
  var mainWin = getMainWindow();
  if (mainWin && mainWin.CustomEvent && mainWin.CustomEvent.fire && mainWin.CustomEvent.fire("print", maxRows) === false)
    return false;
  var veryLargeNumber = "999999999";
  var print = true;
  var features = "resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=yes,location=no";
  if (isChrome && isMacintosh)
    features = "";
  var href = "";
  var frame = top.gsft_main;
  if (!frame)
    frame = top;
  if (frame.document.getElementById("printURL") != null) {
    href = frame.document.getElementById("printURL").value;
    href = printListURLDecode(href);
  }
  if (!href) {
    if (frame.document.getElementById("sysparm_total_rows") != null) {
      var mRows = parseInt(maxRows);
      if (mRows < 1)
        mRows = 5000;
      var totalrows = frame.document.getElementById("sysparm_total_rows").value;
      if (parseInt(totalrows) > parseInt(mRows))
        print = confirm(getMessage("Printing large lists may affect system performance. Continue?"));
    }
    var formTest;
    var f = 0;
    var form = frame.document.forms['sys_personalize'];
    if (form && form.sysparm_referring_url) {
      href = form.sysparm_referring_url.value;
      if (href.indexOf("?sys_id=-1") != -1 && !href.startsWith('sys_report_template')) {
        alert(getMessage("Please save the current form before printing."));
        return false;
      }
      if (isMSIE) {
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

  function printListURLDecode(href) {
    href = href.replace(/@99@/g, "&");
    href = href.replace(/@88@/g, "@99@");
    href = href.replace(/@77@/g, "@88@");
    href = href.replace(/@66@/g, "@77@");
    return href;
  }
}

function clearCacheSniperly() {
  var aj = new GlideAjax("GlideSystemAjax");
  aj.addParam("sysparm_name", "cacheFlush");
  aj.getXML(clearCacheDone);
}

function clearCacheDone() {
  window.status = "Cache flushed";
};
/*! RESOURCE: /scripts/classes/util/StopWatch.js */
var StopWatch = Class.create({
  MILLIS_IN_SECOND: 1000,
  MILLIS_IN_MINUTE: 60 * 1000,
  MILLIS_IN_HOUR: 60 * 60 * 1000,
  initialize: function(started) {
    this.started = started || new Date();
  },
  getTime: function() {
    var now = new Date();
    return now.getTime() - this.started.getTime();
  },
  restart: function() {
    this.initialize();
  },
  jslog: function(msg, src, date) {
    if (window.jslog) {
      jslog('[' + this.toString() + '] ' + msg, src, date);
      return;
    }
    if (window.console && window.console.log)
      console.log('[' + this.toString() + '] ' + msg);
  },
  toString: function() {
    return this.formatISO(this.getTime());
  },
  formatISO: function(millis) {
    var hours = 0,
      minutes = 0,
      seconds = 0,
      milliseconds = 0;
    if (millis >= this.MILLIS_IN_HOUR) {
      hours = parseInt(millis / this.MILLIS_IN_HOUR);
      millis = millis - (hours * this.MILLIS_IN_HOUR);
    }
    if (millis >= this.MILLIS_IN_MINUTE) {
      minutes = parseInt(millis / this.MILLIS_IN_MINUTE);
      millis = millis - (minutes * this.MILLIS_IN_MINUTE);
    }
    if (millis >= this.MILLIS_IN_SECOND) {
      seconds = parseInt(millis / this.MILLIS_IN_SECOND);
      millis = millis - (seconds * this.MILLIS_IN_SECOND);
    }
    milliseconds = parseInt(millis);
    return doubleDigitFormat(hours) + ":" + doubleDigitFormat(minutes) + ":" + doubleDigitFormat(seconds) +
      "." + tripleDigitFormat(milliseconds);
  },
  type: "StopWatch"
});;;