/*! RESOURCE: /scripts/libs/sp_codemirror_includes.js */
/*! RESOURCE: /scripts/snc-code-editor/codemirror-bundle.min.js */
! function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : e.CodeMirror = t()
}(this, function() {
  "use strict";

  function e(e) {
    return new RegExp("(^|\\s)" + e + "(?:$|\\s)\\s*")
  }

  function t(e) {
    for (var t = e.childNodes.length; t > 0; --t) e.removeChild(e.firstChild);
    return e
  }

  function n(e, n) {
    return t(e).appendChild(n)
  }

  function r(e, t, n, r) {
    var i = document.createElement(e);
    if (n && (i.className = n), r && (i.style.cssText = r), "string" == typeof t) i.appendChild(document.createTextNode(t));
    else if (t)
      for (var o = 0; o < t.length; ++o) i.appendChild(t[o]);
    return i
  }

  function i(e, t, n, i) {
    var o = r(e, t, n, i);
    return o.setAttribute("role", "presentation"), o
  }

  function o(e, t) {
    if (3 == t.nodeType && (t = t.parentNode), e.contains) return e.contains(t);
    do
      if (11 == t.nodeType && (t = t.host), t == e) return !0; while (t = t.parentNode)
  }

  function l() {
    var e;
    try {
      e = document.activeElement
    } catch (t) {
      e = document.body || null
    }
    for (; e && e.shadowRoot && e.shadowRoot.activeElement;) e = e.shadowRoot.activeElement;
    return e
  }

  function a(t, n) {
    var r = t.className;
    e(n).test(r) || (t.className += (r ? " " : "") + n)
  }

  function s(t, n) {
    for (var r = t.split(" "), i = 0; i < r.length; i++) r[i] && !e(r[i]).test(n) && (n += " " + r[i]);
    return n
  }

  function c(e) {
    var t = Array.prototype.slice.call(arguments, 1);
    return function() {
      return e.apply(null, t)
    }
  }

  function u(e, t, n) {
    t || (t = {});
    for (var r in e) !e.hasOwnProperty(r) || n === !1 && t.hasOwnProperty(r) || (t[r] = e[r]);
    return t
  }

  function f(e, t, n, r, i) {
    null == t && (t = e.search(/[^\s\u00a0]/), t == -1 && (t = e.length));
    for (var o = r || 0, l = i || 0;;) {
      var a = e.indexOf("\t", o);
      if (a < 0 || a >= t) return l + (t - o);
      l += a - o, l += n - l % n, o = a + 1
    }
  }

  function d(e, t) {
    for (var n = 0; n < e.length; ++n)
      if (e[n] == t) return n;
    return -1
  }

  function h(e, t, n) {
    for (var r = 0, i = 0;;) {
      var o = e.indexOf("\t", r);
      o == -1 && (o = e.length);
      var l = o - r;
      if (o == e.length || i + l >= t) return r + Math.min(l, t - i);
      if (i += o - r, i += n - i % n, r = o + 1, i >= t) return r
    }
  }

  function p(e) {
    for (; Yl.length <= e;) Yl.push(g(Yl) + " ");
    return Yl[e]
  }

  function g(e) {
    return e[e.length - 1]
  }

  function m(e, t) {
    for (var n = [], r = 0; r < e.length; r++) n[r] = t(e[r], r);
    return n
  }

  function v(e, t, n) {
    for (var r = 0, i = n(t); r < e.length && n(e[r]) <= i;) r++;
    e.splice(r, 0, t)
  }

  function y() {}

  function b(e, t) {
    var n;
    return Object.create ? n = Object.create(e) : (y.prototype = e, n = new y), t && u(t, n), n
  }

  function x(e) {
    return /\w/.test(e) || e > "" && (e.toUpperCase() != e.toLowerCase() || Zl.test(e))
  }

  function w(e, t) {
    return t ? !!(t.source.indexOf("\\w") > -1 && x(e)) || t.test(e) : x(e)
  }

  function C(e) {
    for (var t in e)
      if (e.hasOwnProperty(t) && e[t]) return !1;
    return !0
  }

  function k(e) {
    return e.charCodeAt(0) >= 768 && Ql.test(e)
  }

  function S(e, t, n) {
    for (;
      (n < 0 ? t > 0 : t < e.length) && k(e.charAt(t));) t += n;
    return t
  }

  function L(e, t, n) {
    for (var r = t > n ? -1 : 1;;) {
      if (t == n) return t;
      var i = (t + n) / 2,
        o = r < 0 ? Math.ceil(i) : Math.floor(i);
      if (o == t) return e(o) ? t : n;
      e(o) ? n = o : t = o + r
    }
  }

  function T(e, t, n) {
    var o = this;
    this.input = n, o.scrollbarFiller = r("div", null, "CodeMirror-scrollbar-filler"), o.scrollbarFiller.setAttribute("cm-not-content", "true"), o.gutterFiller = r("div", null, "CodeMirror-gutter-filler"), o.gutterFiller.setAttribute("cm-not-content", "true"), o.lineDiv = i("div", null, "CodeMirror-code"), o.selectionDiv = r("div", null, null, "position: relative; z-index: 1"), o.cursorDiv = r("div", null, "CodeMirror-cursors"), o.measure = r("div", null, "CodeMirror-measure"), o.lineMeasure = r("div", null, "CodeMirror-measure"), o.lineSpace = i("div", [o.measure, o.lineMeasure, o.selectionDiv, o.cursorDiv, o.lineDiv], null, "position: relative; outline: none");
    var l = i("div", [o.lineSpace], "CodeMirror-lines");
    o.mover = r("div", [l], null, "position: relative"), o.sizer = r("div", [o.mover], "CodeMirror-sizer"), o.sizerWidth = null, o.heightForcer = r("div", null, null, "position: absolute; height: " + Kl + "px; width: 1px;"), o.gutters = r("div", null, "CodeMirror-gutters"), o.lineGutter = null, o.scroller = r("div", [o.sizer, o.heightForcer, o.gutters], "CodeMirror-scroll"), o.scroller.setAttribute("tabIndex", "-1"), o.wrapper = r("div", [o.scrollbarFiller, o.gutterFiller, o.scroller], "CodeMirror"), wl && Cl < 8 && (o.gutters.style.zIndex = -1, o.scroller.style.paddingRight = 0), kl || vl && Dl || (o.scroller.draggable = !0), e && (e.appendChild ? e.appendChild(o.wrapper) : e(o.wrapper)), o.viewFrom = o.viewTo = t.first, o.reportedViewFrom = o.reportedViewTo = t.first, o.view = [], o.renderedView = null, o.externalMeasured = null, o.viewOffset = 0, o.lastWrapHeight = o.lastWrapWidth = 0, o.updateLineNumbers = null, o.nativeBarWidth = o.barHeight = o.barWidth = 0, o.scrollbarsClipped = !1, o.lineNumWidth = o.lineNumInnerWidth = o.lineNumChars = null, o.alignWidgets = !1, o.cachedCharWidth = o.cachedTextHeight = o.cachedPaddingH = null, o.maxLine = null, o.maxLineLength = 0, o.maxLineChanged = !1, o.wheelDX = o.wheelDY = o.wheelStartX = o.wheelStartY = null, o.shift = !1, o.selForContextMenu = null, o.activeTouch = null, n.init(o)
  }

  function M(e, t) {
    if (t -= e.first, t < 0 || t >= e.size) throw new Error("There is no line " + (t + e.first) + " in the document.");
    for (var n = e; !n.lines;)
      for (var r = 0;; ++r) {
        var i = n.children[r],
          o = i.chunkSize();
        if (t < o) {
          n = i;
          break
        }
        t -= o
      }
    return n.lines[t]
  }

  function O(e, t, n) {
    var r = [],
      i = t.line;
    return e.iter(t.line, n.line + 1, function(e) {
      var o = e.text;
      i == n.line && (o = o.slice(0, n.ch)), i == t.line && (o = o.slice(t.ch)), r.push(o), ++i
    }), r
  }

  function N(e, t, n) {
    var r = [];
    return e.iter(t, n, function(e) {
      r.push(e.text)
    }), r
  }

  function A(e, t) {
    var n = t - e.height;
    if (n)
      for (var r = e; r; r = r.parent) r.height += n
  }

  function P(e) {
    if (null == e.parent) return null;
    for (var t = e.parent, n = d(t.lines, e), r = t.parent; r; t = r, r = r.parent)
      for (var i = 0; r.children[i] != t; ++i) n += r.children[i].chunkSize();
    return n + t.first
  }

  function D(e, t) {
    var n = e.first;
    e: do {
      for (var r = 0; r < e.children.length; ++r) {
        var i = e.children[r],
          o = i.height;
        if (t < o) {
          e = i;
          continue e
        }
        t -= o, n += i.chunkSize()
      }
      return n
    } while (!e.lines);
    for (var l = 0; l < e.lines.length; ++l) {
      var a = e.lines[l],
        s = a.height;
      if (t < s) break;
      t -= s
    }
    return n + l
  }

  function H(e, t) {
    return t >= e.first && t < e.first + e.size
  }

  function F(e, t) {
    return String(e.lineNumberFormatter(t + e.firstLineNumber))
  }

  function W(e, t, n) {
    return void 0 === n && (n = null), this instanceof W ? (this.line = e, this.ch = t, void(this.sticky = n)) : new W(e, t, n)
  }

  function E(e, t) {
    return e.line - t.line || e.ch - t.ch
  }

  function I(e, t) {
    return e.sticky == t.sticky && 0 == E(e, t)
  }

  function R(e) {
    return W(e.line, e.ch)
  }

  function z(e, t) {
    return E(e, t) < 0 ? t : e
  }

  function B(e, t) {
    return E(e, t) < 0 ? e : t
  }

  function j(e, t) {
    return Math.max(e.first, Math.min(t, e.first + e.size - 1))
  }

  function q(e, t) {
    if (t.line < e.first) return W(e.first, 0);
    var n = e.first + e.size - 1;
    return t.line > n ? W(n, M(e, n).text.length) : G(t, M(e, t.line).text.length)
  }

  function G(e, t) {
    var n = e.ch;
    return null == n || n > t ? W(e.line, t) : n < 0 ? W(e.line, 0) : e
  }

  function U(e, t) {
    for (var n = [], r = 0; r < t.length; r++) n[r] = q(e, t[r]);
    return n
  }

  function K() {
    Jl = !0
  }

  function V() {
    ea = !0
  }

  function _(e, t, n) {
    this.marker = e, this.from = t, this.to = n
  }

  function $(e, t) {
    if (e)
      for (var n = 0; n < e.length; ++n) {
        var r = e[n];
        if (r.marker == t) return r
      }
  }

  function X(e, t) {
    for (var n, r = 0; r < e.length; ++r) e[r] != t && (n || (n = [])).push(e[r]);
    return n
  }

  function Y(e, t) {
    e.markedSpans = e.markedSpans ? e.markedSpans.concat([t]) : [t], t.marker.attachLine(e)
  }

  function Z(e, t, n) {
    var r;
    if (e)
      for (var i = 0; i < e.length; ++i) {
        var o = e[i],
          l = o.marker,
          a = null == o.from || (l.inclusiveLeft ? o.from <= t : o.from < t);
        if (a || o.from == t && "bookmark" == l.type && (!n || !o.marker.insertLeft)) {
          var s = null == o.to || (l.inclusiveRight ? o.to >= t : o.to > t);
          (r || (r = [])).push(new _(l, o.from, s ? null : o.to))
        }
      }
    return r
  }

  function Q(e, t, n) {
    var r;
    if (e)
      for (var i = 0; i < e.length; ++i) {
        var o = e[i],
          l = o.marker,
          a = null == o.to || (l.inclusiveRight ? o.to >= t : o.to > t);
        if (a || o.from == t && "bookmark" == l.type && (!n || o.marker.insertLeft)) {
          var s = null == o.from || (l.inclusiveLeft ? o.from <= t : o.from < t);
          (r || (r = [])).push(new _(l, s ? null : o.from - t, null == o.to ? null : o.to - t))
        }
      }
    return r
  }

  function J(e, t) {
    if (t.full) return null;
    var n = H(e, t.from.line) && M(e, t.from.line).markedSpans,
      r = H(e, t.to.line) && M(e, t.to.line).markedSpans;
    if (!n && !r) return null;
    var i = t.from.ch,
      o = t.to.ch,
      l = 0 == E(t.from, t.to),
      a = Z(n, i, l),
      s = Q(r, o, l),
      c = 1 == t.text.length,
      u = g(t.text).length + (c ? i : 0);
    if (a)
      for (var f = 0; f < a.length; ++f) {
        var d = a[f];
        if (null == d.to) {
          var h = $(s, d.marker);
          h ? c && (d.to = null == h.to ? null : h.to + u) : d.to = i
        }
      }
    if (s)
      for (var p = 0; p < s.length; ++p) {
        var m = s[p];
        if (null != m.to && (m.to += u), null == m.from) {
          var v = $(a, m.marker);
          v || (m.from = u, c && (a || (a = [])).push(m))
        } else m.from += u, c && (a || (a = [])).push(m)
      }
    a && (a = ee(a)), s && s != a && (s = ee(s));
    var y = [a];
    if (!c) {
      var b, x = t.text.length - 2;
      if (x > 0 && a)
        for (var w = 0; w < a.length; ++w) null == a[w].to && (b || (b = [])).push(new _(a[w].marker, null, null));
      for (var C = 0; C < x; ++C) y.push(b);
      y.push(s)
    }
    return y
  }

  function ee(e) {
    for (var t = 0; t < e.length; ++t) {
      var n = e[t];
      null != n.from && n.from == n.to && n.marker.clearWhenEmpty !== !1 && e.splice(t--, 1)
    }
    return e.length ? e : null
  }

  function te(e, t, n) {
    var r = null;
    if (e.iter(t.line, n.line + 1, function(e) {
        if (e.markedSpans)
          for (var t = 0; t < e.markedSpans.length; ++t) {
            var n = e.markedSpans[t].marker;
            !n.readOnly || r && d(r, n) != -1 || (r || (r = [])).push(n)
          }
      }), !r) return null;
    for (var i = [{
        from: t,
        to: n
      }], o = 0; o < r.length; ++o)
      for (var l = r[o], a = l.find(0), s = 0; s < i.length; ++s) {
        var c = i[s];
        if (!(E(c.to, a.from) < 0 || E(c.from, a.to) > 0)) {
          var u = [s, 1],
            f = E(c.from, a.from),
            h = E(c.to, a.to);
          (f < 0 || !l.inclusiveLeft && !f) && u.push({
            from: c.from,
            to: a.from
          }), (h > 0 || !l.inclusiveRight && !h) && u.push({
            from: a.to,
            to: c.to
          }), i.splice.apply(i, u), s += u.length - 3
        }
      }
    return i
  }

  function ne(e) {
    var t = e.markedSpans;
    if (t) {
      for (var n = 0; n < t.length; ++n) t[n].marker.detachLine(e);
      e.markedSpans = null
    }
  }

  function re(e, t) {
    if (t) {
      for (var n = 0; n < t.length; ++n) t[n].marker.attachLine(e);
      e.markedSpans = t
    }
  }

  function ie(e) {
    return e.inclusiveLeft ? -1 : 0
  }

  function oe(e) {
    return e.inclusiveRight ? 1 : 0
  }

  function le(e, t) {
    var n = e.lines.length - t.lines.length;
    if (0 != n) return n;
    var r = e.find(),
      i = t.find(),
      o = E(r.from, i.from) || ie(e) - ie(t);
    if (o) return -o;
    var l = E(r.to, i.to) || oe(e) - oe(t);
    return l ? l : t.id - e.id
  }

  function ae(e, t) {
    var n, r = ea && e.markedSpans;
    if (r)
      for (var i = void 0, o = 0; o < r.length; ++o) i = r[o], i.marker.collapsed && null == (t ? i.from : i.to) && (!n || le(n, i.marker) < 0) && (n = i.marker);
    return n
  }

  function se(e) {
    return ae(e, !0)
  }

  function ce(e) {
    return ae(e, !1)
  }

  function ue(e, t) {
    var n, r = ea && e.markedSpans;
    if (r)
      for (var i = 0; i < r.length; ++i) {
        var o = r[i];
        o.marker.collapsed && (null == o.from || o.from < t) && (null == o.to || o.to > t) && (!n || le(n, o.marker) < 0) && (n = o.marker)
      }
    return n
  }

  function fe(e, t, n, r, i) {
    var o = M(e, t),
      l = ea && o.markedSpans;
    if (l)
      for (var a = 0; a < l.length; ++a) {
        var s = l[a];
        if (s.marker.collapsed) {
          var c = s.marker.find(0),
            u = E(c.from, n) || ie(s.marker) - ie(i),
            f = E(c.to, r) || oe(s.marker) - oe(i);
          if (!(u >= 0 && f <= 0 || u <= 0 && f >= 0) && (u <= 0 && (s.marker.inclusiveRight && i.inclusiveLeft ? E(c.to, n) >= 0 : E(c.to, n) > 0) || u >= 0 && (s.marker.inclusiveRight && i.inclusiveLeft ? E(c.from, r) <= 0 : E(c.from, r) < 0))) return !0
        }
      }
  }

  function de(e) {
    for (var t; t = se(e);) e = t.find(-1, !0).line;
    return e
  }

  function he(e) {
    for (var t; t = ce(e);) e = t.find(1, !0).line;
    return e
  }

  function pe(e) {
    for (var t, n; t = ce(e);) e = t.find(1, !0).line, (n || (n = [])).push(e);
    return n
  }

  function ge(e, t) {
    var n = M(e, t),
      r = de(n);
    return n == r ? t : P(r)
  }

  function me(e, t) {
    if (t > e.lastLine()) return t;
    var n, r = M(e, t);
    if (!ve(e, r)) return t;
    for (; n = ce(r);) r = n.find(1, !0).line;
    return P(r) + 1
  }

  function ve(e, t) {
    var n = ea && t.markedSpans;
    if (n)
      for (var r = void 0, i = 0; i < n.length; ++i)
        if (r = n[i], r.marker.collapsed) {
          if (null == r.from) return !0;
          if (!r.marker.widgetNode && 0 == r.from && r.marker.inclusiveLeft && ye(e, t, r)) return !0
        }
  }

  function ye(e, t, n) {
    if (null == n.to) {
      var r = n.marker.find(1, !0);
      return ye(e, r.line, $(r.line.markedSpans, n.marker))
    }
    if (n.marker.inclusiveRight && n.to == t.text.length) return !0;
    for (var i = void 0, o = 0; o < t.markedSpans.length; ++o)
      if (i = t.markedSpans[o], i.marker.collapsed && !i.marker.widgetNode && i.from == n.to && (null == i.to || i.to != n.from) && (i.marker.inclusiveLeft || n.marker.inclusiveRight) && ye(e, t, i)) return !0
  }

  function be(e) {
    e = de(e);
    for (var t = 0, n = e.parent, r = 0; r < n.lines.length; ++r) {
      var i = n.lines[r];
      if (i == e) break;
      t += i.height
    }
    for (var o = n.parent; o; n = o, o = n.parent)
      for (var l = 0; l < o.children.length; ++l) {
        var a = o.children[l];
        if (a == n) break;
        t += a.height
      }
    return t
  }

  function xe(e) {
    if (0 == e.height) return 0;
    for (var t, n = e.text.length, r = e; t = se(r);) {
      var i = t.find(0, !0);
      r = i.from.line, n += i.from.ch - i.to.ch
    }
    for (r = e; t = ce(r);) {
      var o = t.find(0, !0);
      n -= r.text.length - o.from.ch, r = o.to.line, n += r.text.length - o.to.ch
    }
    return n
  }

  function we(e) {
    var t = e.display,
      n = e.doc;
    t.maxLine = M(n, n.first), t.maxLineLength = xe(t.maxLine), t.maxLineChanged = !0, n.iter(function(e) {
      var n = xe(e);
      n > t.maxLineLength && (t.maxLineLength = n, t.maxLine = e)
    })
  }

  function Ce(e, t, n, r) {
    if (!e) return r(t, n, "ltr", 0);
    for (var i = !1, o = 0; o < e.length; ++o) {
      var l = e[o];
      (l.from < n && l.to > t || t == n && l.to == t) && (r(Math.max(l.from, t), Math.min(l.to, n), 1 == l.level ? "rtl" : "ltr", o), i = !0)
    }
    i || r(t, n, "ltr")
  }

  function ke(e, t, n) {
    var r;
    ta = null;
    for (var i = 0; i < e.length; ++i) {
      var o = e[i];
      if (o.from < t && o.to > t) return i;
      o.to == t && (o.from != o.to && "before" == n ? r = i : ta = i), o.from == t && (o.from != o.to && "before" != n ? r = i : ta = i)
    }
    return null != r ? r : ta
  }

  function Se(e, t) {
    var n = e.order;
    return null == n && (n = e.order = na(e.text, t)), n
  }

  function Le(e, t) {
    return e._handlers && e._handlers[t] || ra
  }

  function Te(e, t, n) {
    if (e.removeEventListener) e.removeEventListener(t, n, !1);
    else if (e.detachEvent) e.detachEvent("on" + t, n);
    else {
      var r = e._handlers,
        i = r && r[t];
      if (i) {
        var o = d(i, n);
        o > -1 && (r[t] = i.slice(0, o).concat(i.slice(o + 1)))
      }
    }
  }

  function Me(e, t) {
    var n = Le(e, t);
    if (n.length)
      for (var r = Array.prototype.slice.call(arguments, 2), i = 0; i < n.length; ++i) n[i].apply(null, r)
  }

  function Oe(e, t, n) {
    return "string" == typeof t && (t = {
      type: t,
      preventDefault: function() {
        this.defaultPrevented = !0
      }
    }), Me(e, n || t.type, e, t), Fe(t) || t.codemirrorIgnore
  }

  function Ne(e) {
    var t = e._handlers && e._handlers.cursorActivity;
    if (t)
      for (var n = e.curOp.cursorActivityHandlers || (e.curOp.cursorActivityHandlers = []), r = 0; r < t.length; ++r) d(n, t[r]) == -1 && n.push(t[r])
  }

  function Ae(e, t) {
    return Le(e, t).length > 0
  }

  function Pe(e) {
    e.prototype.on = function(e, t) {
      ia(this, e, t)
    }, e.prototype.off = function(e, t) {
      Te(this, e, t)
    }
  }

  function De(e) {
    e.preventDefault ? e.preventDefault() : e.returnValue = !1
  }

  function He(e) {
    e.stopPropagation ? e.stopPropagation() : e.cancelBubble = !0
  }

  function Fe(e) {
    return null != e.defaultPrevented ? e.defaultPrevented : 0 == e.returnValue
  }

  function We(e) {
    De(e), He(e)
  }

  function Ee(e) {
    return e.target || e.srcElement
  }

  function Ie(e) {
    var t = e.which;
    return null == t && (1 & e.button ? t = 1 : 2 & e.button ? t = 3 : 4 & e.button && (t = 2)), Hl && e.ctrlKey && 1 == t && (t = 3), t
  }

  function Re(e) {
    if (null == Gl) {
      var t = r("span", "​");
      n(e, r("span", [t, document.createTextNode("x")])), 0 != e.firstChild.offsetHeight && (Gl = t.offsetWidth <= 1 && t.offsetHeight > 2 && !(wl && Cl < 8))
    }
    var i = Gl ? r("span", "​") : r("span", " ", null, "display: inline-block; width: 1px; margin-right: -1px");
    return i.setAttribute("cm-text", ""), i
  }

  function ze(e) {
    if (null != Ul) return Ul;
    var r = n(e, document.createTextNode("AخA")),
      i = Il(r, 0, 1).getBoundingClientRect(),
      o = Il(r, 1, 2).getBoundingClientRect();
    return t(e), !(!i || i.left == i.right) && (Ul = o.right - i.right < 3)
  }

  function Be(e) {
    if (null != ca) return ca;
    var t = n(e, r("span", "x")),
      i = t.getBoundingClientRect(),
      o = Il(t, 0, 1).getBoundingClientRect();
    return ca = Math.abs(i.left - o.left) > 1
  }

  function je(e, t) {
    arguments.length > 2 && (t.dependencies = Array.prototype.slice.call(arguments, 2)), ua[e] = t
  }

  function qe(e, t) {
    fa[e] = t
  }

  function Ge(e) {
    if ("string" == typeof e && fa.hasOwnProperty(e)) e = fa[e];
    else if (e && "string" == typeof e.name && fa.hasOwnProperty(e.name)) {
      var t = fa[e.name];
      "string" == typeof t && (t = {
        name: t
      }), e = b(t, e), e.name = t.name
    } else {
      if ("string" == typeof e && /^[\w\-]+\/[\w\-]+\+xml$/.test(e)) return Ge("application/xml");
      if ("string" == typeof e && /^[\w\-]+\/[\w\-]+\+json$/.test(e)) return Ge("application/json")
    }
    return "string" == typeof e ? {
      name: e
    } : e || {
      name: "null"
    }
  }

  function Ue(e, t) {
    t = Ge(t);
    var n = ua[t.name];
    if (!n) return Ue(e, "text/plain");
    var r = n(e, t);
    if (da.hasOwnProperty(t.name)) {
      var i = da[t.name];
      for (var o in i) i.hasOwnProperty(o) && (r.hasOwnProperty(o) && (r["_" + o] = r[o]), r[o] = i[o])
    }
    if (r.name = t.name, t.helperType && (r.helperType = t.helperType), t.modeProps)
      for (var l in t.modeProps) r[l] = t.modeProps[l];
    return r
  }

  function Ke(e, t) {
    var n = da.hasOwnProperty(e) ? da[e] : da[e] = {};
    u(t, n)
  }

  function Ve(e, t) {
    if (t === !0) return t;
    if (e.copyState) return e.copyState(t);
    var n = {};
    for (var r in t) {
      var i = t[r];
      i instanceof Array && (i = i.concat([])), n[r] = i
    }
    return n
  }

  function _e(e, t) {
    for (var n; e.innerMode && (n = e.innerMode(t), n && n.mode != e);) t = n.state, e = n.mode;
    return n || {
      mode: e,
      state: t
    }
  }

  function $e(e, t, n) {
    return !e.startState || e.startState(t, n)
  }

  function Xe(e, t, n, r) {
    var i = [e.state.modeGen],
      o = {};
    rt(e, t.text, e.doc.mode, n, function(e, t) {
      return i.push(e, t)
    }, o, r);
    for (var l = n.state, a = function(r) {
        n.baseTokens = i;
        var a = e.state.overlays[r],
          s = 1,
          c = 0;
        n.state = !0, rt(e, t.text, a.mode, n, function(e, t) {
          for (var n = s; c < e;) {
            var r = i[s];
            r > e && i.splice(s, 1, e, i[s + 1], r), s += 2, c = Math.min(e, r)
          }
          if (t)
            if (a.opaque) i.splice(n, s - n, e, "overlay " + t), s = n + 2;
            else
              for (; n < s; n += 2) {
                var o = i[n + 1];
                i[n + 1] = (o ? o + " " : "") + "overlay " + t
              }
        }, o), n.state = l, n.baseTokens = null, n.baseTokenPos = 1
      }, s = 0; s < e.state.overlays.length; ++s) a(s);
    return {
      styles: i,
      classes: o.bgClass || o.textClass ? o : null
    }
  }

  function Ye(e, t, n) {
    if (!t.styles || t.styles[0] != e.state.modeGen) {
      var r = Ze(e, P(t)),
        i = t.text.length > e.options.maxHighlightLength && Ve(e.doc.mode, r.state),
        o = Xe(e, t, r);
      i && (r.state = i), t.stateAfter = r.save(!i), t.styles = o.styles, o.classes ? t.styleClasses = o.classes : t.styleClasses && (t.styleClasses = null), n === e.doc.highlightFrontier && (e.doc.modeFrontier = Math.max(e.doc.modeFrontier, ++e.doc.highlightFrontier))
    }
    return t.styles
  }

  function Ze(e, t, n) {
    var r = e.doc,
      i = e.display;
    if (!r.mode.startState) return new ga(r, (!0), t);
    var o = it(e, t, n),
      l = o > r.first && M(r, o - 1).stateAfter,
      a = l ? ga.fromSaved(r, l, o) : new ga(r, $e(r.mode), o);
    return r.iter(o, t, function(n) {
      Qe(e, n.text, a);
      var r = a.line;
      n.stateAfter = r == t - 1 || r % 5 == 0 || r >= i.viewFrom && r < i.viewTo ? a.save() : null, a.nextLine()
    }), n && (r.modeFrontier = a.line), a
  }

  function Qe(e, t, n, r) {
    var i = e.doc.mode,
      o = new ha(t, e.options.tabSize, n);
    for (o.start = o.pos = r || 0, "" == t && Je(i, n.state); !o.eol();) et(i, o, n.state), o.start = o.pos
  }

  function Je(e, t) {
    if (e.blankLine) return e.blankLine(t);
    if (e.innerMode) {
      var n = _e(e, t);
      return n.mode.blankLine ? n.mode.blankLine(n.state) : void 0
    }
  }

  function et(e, t, n, r) {
    for (var i = 0; i < 10; i++) {
      r && (r[0] = _e(e, n).mode);
      var o = e.token(t, n);
      if (t.pos > t.start) return o
    }
    throw new Error("Mode " + e.name + " failed to advance stream.")
  }

  function tt(e, t, n, r) {
    var i, o = e.doc,
      l = o.mode;
    t = q(o, t);
    var a, s = M(o, t.line),
      c = Ze(e, t.line, n),
      u = new ha(s.text, e.options.tabSize, c);
    for (r && (a = []);
      (r || u.pos < t.ch) && !u.eol();) u.start = u.pos, i = et(l, u, c.state), r && a.push(new ma(u, i, Ve(o.mode, c.state)));
    return r ? a : new ma(u, i, c.state)
  }

  function nt(e, t) {
    if (e)
      for (;;) {
        var n = e.match(/(?:^|\s+)line-(background-)?(\S+)/);
        if (!n) break;
        e = e.slice(0, n.index) + e.slice(n.index + n[0].length);
        var r = n[1] ? "bgClass" : "textClass";
        null == t[r] ? t[r] = n[2] : new RegExp("(?:^|s)" + n[2] + "(?:$|s)").test(t[r]) || (t[r] += " " + n[2])
      }
    return e
  }

  function rt(e, t, n, r, i, o, l) {
    var a = n.flattenSpans;
    null == a && (a = e.options.flattenSpans);
    var s, c = 0,
      u = null,
      f = new ha(t, e.options.tabSize, r),
      d = e.options.addModeClass && [null];
    for ("" == t && nt(Je(n, r.state), o); !f.eol();) {
      if (f.pos > e.options.maxHighlightLength ? (a = !1, l && Qe(e, t, r, f.pos), f.pos = t.length, s = null) : s = nt(et(n, f, r.state, d), o), d) {
        var h = d[0].name;
        h && (s = "m-" + (s ? h + " " + s : h))
      }
      if (!a || u != s) {
        for (; c < f.start;) c = Math.min(f.start, c + 5e3), i(c, u);
        u = s
      }
      f.start = f.pos
    }
    for (; c < f.pos;) {
      var p = Math.min(f.pos, c + 5e3);
      i(p, u), c = p
    }
  }

  function it(e, t, n) {
    for (var r, i, o = e.doc, l = n ? -1 : t - (e.doc.mode.innerMode ? 1e3 : 100), a = t; a > l; --a) {
      if (a <= o.first) return o.first;
      var s = M(o, a - 1),
        c = s.stateAfter;
      if (c && (!n || a + (c instanceof pa ? c.lookAhead : 0) <= o.modeFrontier)) return a;
      var u = f(s.text, null, e.options.tabSize);
      (null == i || r > u) && (i = a - 1, r = u)
    }
    return i
  }

  function ot(e, t) {
    if (e.modeFrontier = Math.min(e.modeFrontier, t), !(e.highlightFrontier < t - 10)) {
      for (var n = e.first, r = t - 1; r > n; r--) {
        var i = M(e, r).stateAfter;
        if (i && (!(i instanceof pa) || r + i.lookAhead < t)) {
          n = r + 1;
          break
        }
      }
      e.highlightFrontier = Math.min(e.highlightFrontier, n)
    }
  }

  function lt(e, t, n, r) {
    e.text = t, e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null), null != e.order && (e.order = null), ne(e), re(e, n);
    var i = r ? r(e) : 1;
    i != e.height && A(e, i)
  }

  function at(e) {
    e.parent = null, ne(e)
  }

  function st(e, t) {
    if (!e || /^\s*$/.test(e)) return null;
    var n = t.addModeClass ? xa : ba;
    return n[e] || (n[e] = e.replace(/\S+/g, "cm-$&"))
  }

  function ct(e, t) {
    var n = i("span", null, null, kl ? "padding-right: .1px" : null),
      r = {
        pre: i("pre", [n], "CodeMirror-line"),
        content: n,
        col: 0,
        pos: 0,
        cm: e,
        trailingSpace: !1,
        splitSpaces: (wl || kl) && e.getOption("lineWrapping")
      };
    t.measure = {};
    for (var o = 0; o <= (t.rest ? t.rest.length : 0); o++) {
      var l = o ? t.rest[o - 1] : t.line,
        a = void 0;
      r.pos = 0, r.addToken = ft, ze(e.display.measure) && (a = Se(l, e.doc.direction)) && (r.addToken = ht(r.addToken, a)), r.map = [];
      var c = t != e.display.externalMeasured && P(l);
      gt(l, r, Ye(e, l, c)), l.styleClasses && (l.styleClasses.bgClass && (r.bgClass = s(l.styleClasses.bgClass, r.bgClass || "")), l.styleClasses.textClass && (r.textClass = s(l.styleClasses.textClass, r.textClass || ""))), 0 == r.map.length && r.map.push(0, 0, r.content.appendChild(Re(e.display.measure))), 0 == o ? (t.measure.map = r.map, t.measure.cache = {}) : ((t.measure.maps || (t.measure.maps = [])).push(r.map), (t.measure.caches || (t.measure.caches = [])).push({}))
    }
    if (kl) {
      var u = r.content.lastChild;
      (/\bcm-tab\b/.test(u.className) || u.querySelector && u.querySelector(".cm-tab")) && (r.content.className = "cm-tab-wrap-hack")
    }
    return Me(e, "renderLine", e, t.line, r.pre), r.pre.className && (r.textClass = s(r.pre.className, r.textClass || "")), r
  }

  function ut(e) {
    var t = r("span", "•", "cm-invalidchar");
    return t.title = "\\u" + e.charCodeAt(0).toString(16), t.setAttribute("aria-label", t.title), t
  }

  function ft(e, t, n, i, o, l, a) {
    if (t) {
      var s, c = e.splitSpaces ? dt(t, e.trailingSpace) : t,
        u = e.cm.state.specialChars,
        f = !1;
      if (u.test(t)) {
        s = document.createDocumentFragment();
        for (var d = 0;;) {
          u.lastIndex = d;
          var h = u.exec(t),
            g = h ? h.index - d : t.length - d;
          if (g) {
            var m = document.createTextNode(c.slice(d, d + g));
            wl && Cl < 9 ? s.appendChild(r("span", [m])) : s.appendChild(m), e.map.push(e.pos, e.pos + g, m), e.col += g, e.pos += g
          }
          if (!h) break;
          d += g + 1;
          var v = void 0;
          if ("\t" == h[0]) {
            var y = e.cm.options.tabSize,
              b = y - e.col % y;
            v = s.appendChild(r("span", p(b), "cm-tab")), v.setAttribute("role", "presentation"), v.setAttribute("cm-text", "\t"), e.col += b
          } else "\r" == h[0] || "\n" == h[0] ? (v = s.appendChild(r("span", "\r" == h[0] ? "␍" : "␤", "cm-invalidchar")), v.setAttribute("cm-text", h[0]), e.col += 1) : (v = e.cm.options.specialCharPlaceholder(h[0]), v.setAttribute("cm-text", h[0]), wl && Cl < 9 ? s.appendChild(r("span", [v])) : s.appendChild(v), e.col += 1);
          e.map.push(e.pos, e.pos + 1, v), e.pos++
        }
      } else e.col += t.length, s = document.createTextNode(c), e.map.push(e.pos, e.pos + t.length, s), wl && Cl < 9 && (f = !0), e.pos += t.length;
      if (e.trailingSpace = 32 == c.charCodeAt(t.length - 1), n || i || o || f || a) {
        var x = n || "";
        i && (x += i), o && (x += o);
        var w = r("span", [s], x, a);
        return l && (w.title = l), e.content.appendChild(w)
      }
      e.content.appendChild(s)
    }
  }

  function dt(e, t) {
    if (e.length > 1 && !/  /.test(e)) return e;
    for (var n = t, r = "", i = 0; i < e.length; i++) {
      var o = e.charAt(i);
      " " != o || !n || i != e.length - 1 && 32 != e.charCodeAt(i + 1) || (o = " "), r += o, n = " " == o
    }
    return r
  }

  function ht(e, t) {
    return function(n, r, i, o, l, a, s) {
      i = i ? i + " cm-force-border" : "cm-force-border";
      for (var c = n.pos, u = c + r.length;;) {
        for (var f = void 0, d = 0; d < t.length && (f = t[d], !(f.to > c && f.from <= c)); d++);
        if (f.to >= u) return e(n, r, i, o, l, a, s);
        e(n, r.slice(0, f.to - c), i, o, null, a, s), o = null, r = r.slice(f.to - c), c = f.to
      }
    }
  }

  function pt(e, t, n, r) {
    var i = !r && n.widgetNode;
    i && e.map.push(e.pos, e.pos + t, i), !r && e.cm.display.input.needsContentAttribute && (i || (i = e.content.appendChild(document.createElement("span"))), i.setAttribute("cm-marker", n.id)), i && (e.cm.display.input.setUneditable(i), e.content.appendChild(i)), e.pos += t, e.trailingSpace = !1
  }

  function gt(e, t, n) {
    var r = e.markedSpans,
      i = e.text,
      o = 0;
    if (r)
      for (var l, a, s, c, u, f, d, h = i.length, p = 0, g = 1, m = "", v = 0;;) {
        if (v == p) {
          s = c = u = f = a = "", d = null, v = 1 / 0;
          for (var y = [], b = void 0, x = 0; x < r.length; ++x) {
            var w = r[x],
              C = w.marker;
            "bookmark" == C.type && w.from == p && C.widgetNode ? y.push(C) : w.from <= p && (null == w.to || w.to > p || C.collapsed && w.to == p && w.from == p) ? (null != w.to && w.to != p && v > w.to && (v = w.to, c = ""), C.className && (s += " " + C.className), C.css && (a = (a ? a + ";" : "") + C.css), C.startStyle && w.from == p && (u += " " + C.startStyle), C.endStyle && w.to == v && (b || (b = [])).push(C.endStyle, w.to), C.title && !f && (f = C.title), C.collapsed && (!d || le(d.marker, C) < 0) && (d = w)) : w.from > p && v > w.from && (v = w.from)
          }
          if (b)
            for (var k = 0; k < b.length; k += 2) b[k + 1] == v && (c += " " + b[k]);
          if (!d || d.from == p)
            for (var S = 0; S < y.length; ++S) pt(t, 0, y[S]);
          if (d && (d.from || 0) == p) {
            if (pt(t, (null == d.to ? h + 1 : d.to) - p, d.marker, null == d.from), null == d.to) return;
            d.to == p && (d = !1)
          }
        }
        if (p >= h) break;
        for (var L = Math.min(h, v);;) {
          if (m) {
            var T = p + m.length;
            if (!d) {
              var M = T > L ? m.slice(0, L - p) : m;
              t.addToken(t, M, l ? l + s : s, u, p + M.length == v ? c : "", f, a)
            }
            if (T >= L) {
              m = m.slice(L - p), p = L;
              break
            }
            p = T, u = ""
          }
          m = i.slice(o, o = n[g++]), l = st(n[g++], t.cm.options)
        }
      } else
        for (var O = 1; O < n.length; O += 2) t.addToken(t, i.slice(o, o = n[O]), st(n[O + 1], t.cm.options))
  }

  function mt(e, t, n) {
    this.line = t, this.rest = pe(t), this.size = this.rest ? P(g(this.rest)) - n + 1 : 1, this.node = this.text = null, this.hidden = ve(e, t)
  }

  function vt(e, t, n) {
    for (var r, i = [], o = t; o < n; o = r) {
      var l = new mt(e.doc, M(e.doc, o), o);
      r = o + l.size, i.push(l)
    }
    return i
  }

  function yt(e) {
    wa ? wa.ops.push(e) : e.ownsGroup = wa = {
      ops: [e],
      delayedCallbacks: []
    }
  }

  function bt(e) {
    var t = e.delayedCallbacks,
      n = 0;
    do {
      for (; n < t.length; n++) t[n].call(null);
      for (var r = 0; r < e.ops.length; r++) {
        var i = e.ops[r];
        if (i.cursorActivityHandlers)
          for (; i.cursorActivityCalled < i.cursorActivityHandlers.length;) i.cursorActivityHandlers[i.cursorActivityCalled++].call(null, i.cm)
      }
    } while (n < t.length)
  }

  function xt(e, t) {
    var n = e.ownsGroup;
    if (n) try {
      bt(n)
    } finally {
      wa = null, t(n)
    }
  }

  function wt(e, t) {
    var n = Le(e, t);
    if (n.length) {
      var r, i = Array.prototype.slice.call(arguments, 2);
      wa ? r = wa.delayedCallbacks : Ca ? r = Ca : (r = Ca = [], setTimeout(Ct, 0));
      for (var o = function(e) {
          r.push(function() {
            return n[e].apply(null, i)
          })
        }, l = 0; l < n.length; ++l) o(l)
    }
  }

  function Ct() {
    var e = Ca;
    Ca = null;
    for (var t = 0; t < e.length; ++t) e[t]()
  }

  function kt(e, t, n, r) {
    for (var i = 0; i < t.changes.length; i++) {
      var o = t.changes[i];
      "text" == o ? Mt(e, t) : "gutter" == o ? Nt(e, t, n, r) : "class" == o ? Ot(e, t) : "widget" == o && At(e, t, r)
    }
    t.changes = null
  }

  function St(e) {
    return e.node == e.text && (e.node = r("div", null, null, "position: relative"), e.text.parentNode && e.text.parentNode.replaceChild(e.node, e.text), e.node.appendChild(e.text), wl && Cl < 8 && (e.node.style.zIndex = 2)), e.node
  }

  function Lt(e, t) {
    var n = t.bgClass ? t.bgClass + " " + (t.line.bgClass || "") : t.line.bgClass;
    if (n && (n += " CodeMirror-linebackground"), t.background) n ? t.background.className = n : (t.background.parentNode.removeChild(t.background), t.background = null);
    else if (n) {
      var i = St(t);
      t.background = i.insertBefore(r("div", null, n), i.firstChild), e.display.input.setUneditable(t.background)
    }
  }

  function Tt(e, t) {
    var n = e.display.externalMeasured;
    return n && n.line == t.line ? (e.display.externalMeasured = null, t.measure = n.measure, n.built) : ct(e, t)
  }

  function Mt(e, t) {
    var n = t.text.className,
      r = Tt(e, t);
    t.text == t.node && (t.node = r.pre), t.text.parentNode.replaceChild(r.pre, t.text), t.text = r.pre, r.bgClass != t.bgClass || r.textClass != t.textClass ? (t.bgClass = r.bgClass, t.textClass = r.textClass, Ot(e, t)) : n && (t.text.className = n)
  }

  function Ot(e, t) {
    Lt(e, t), t.line.wrapClass ? St(t).className = t.line.wrapClass : t.node != t.text && (t.node.className = "");
    var n = t.textClass ? t.textClass + " " + (t.line.textClass || "") : t.line.textClass;
    t.text.className = n || ""
  }

  function Nt(e, t, n, i) {
    if (t.gutter && (t.node.removeChild(t.gutter), t.gutter = null), t.gutterBackground && (t.node.removeChild(t.gutterBackground), t.gutterBackground = null), t.line.gutterClass) {
      var o = St(t);
      t.gutterBackground = r("div", null, "CodeMirror-gutter-background " + t.line.gutterClass, "left: " + (e.options.fixedGutter ? i.fixedPos : -i.gutterTotalWidth) + "px; width: " + i.gutterTotalWidth + "px"), e.display.input.setUneditable(t.gutterBackground), o.insertBefore(t.gutterBackground, t.text)
    }
    var l = t.line.gutterMarkers;
    if (e.options.lineNumbers || l) {
      var a = St(t),
        s = t.gutter = r("div", null, "CodeMirror-gutter-wrapper", "left: " + (e.options.fixedGutter ? i.fixedPos : -i.gutterTotalWidth) + "px");
      if (e.display.input.setUneditable(s), a.insertBefore(s, t.text), t.line.gutterClass && (s.className += " " + t.line.gutterClass), !e.options.lineNumbers || l && l["CodeMirror-linenumbers"] || (t.lineNumber = s.appendChild(r("div", F(e.options, n), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + i.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + e.display.lineNumInnerWidth + "px"))), l)
        for (var c = 0; c < e.options.gutters.length; ++c) {
          var u = e.options.gutters[c],
            f = l.hasOwnProperty(u) && l[u];
          f && s.appendChild(r("div", [f], "CodeMirror-gutter-elt", "left: " + i.gutterLeft[u] + "px; width: " + i.gutterWidth[u] + "px"))
        }
    }
  }

  function At(e, t, n) {
    t.alignable && (t.alignable = null);
    for (var r = t.node.firstChild, i = void 0; r; r = i) i = r.nextSibling, "CodeMirror-linewidget" == r.className && t.node.removeChild(r);
    Dt(e, t, n)
  }

  function Pt(e, t, n, r) {
    var i = Tt(e, t);
    return t.text = t.node = i.pre, i.bgClass && (t.bgClass = i.bgClass), i.textClass && (t.textClass = i.textClass), Ot(e, t), Nt(e, t, n, r), Dt(e, t, r), t.node
  }

  function Dt(e, t, n) {
    if (Ht(e, t.line, t, n, !0), t.rest)
      for (var r = 0; r < t.rest.length; r++) Ht(e, t.rest[r], t, n, !1)
  }

  function Ht(e, t, n, i, o) {
    if (t.widgets)
      for (var l = St(n), a = 0, s = t.widgets; a < s.length; ++a) {
        var c = s[a],
          u = r("div", [c.node], "CodeMirror-linewidget");
        c.handleMouseEvents || u.setAttribute("cm-ignore-events", "true"), Ft(c, u, n, i), e.display.input.setUneditable(u), o && c.above ? l.insertBefore(u, n.gutter || n.text) : l.appendChild(u), wt(c, "redraw")
      }
  }

  function Ft(e, t, n, r) {
    if (e.noHScroll) {
      (n.alignable || (n.alignable = [])).push(t);
      var i = r.wrapperWidth;
      t.style.left = r.fixedPos + "px", e.coverGutter || (i -= r.gutterTotalWidth, t.style.paddingLeft = r.gutterTotalWidth + "px"), t.style.width = i + "px"
    }
    e.coverGutter && (t.style.zIndex = 5, t.style.position = "relative", e.noHScroll || (t.style.marginLeft = -r.gutterTotalWidth + "px"))
  }

  function Wt(e) {
    if (null != e.height) return e.height;
    var t = e.doc.cm;
    if (!t) return 0;
    if (!o(document.body, e.node)) {
      var i = "position: relative;";
      e.coverGutter && (i += "margin-left: -" + t.display.gutters.offsetWidth + "px;"), e.noHScroll && (i += "width: " + t.display.wrapper.clientWidth + "px;"), n(t.display.measure, r("div", [e.node], null, i))
    }
    return e.height = e.node.parentNode.offsetHeight
  }

  function Et(e, t) {
    for (var n = Ee(t); n != e.wrapper; n = n.parentNode)
      if (!n || 1 == n.nodeType && "true" == n.getAttribute("cm-ignore-events") || n.parentNode == e.sizer && n != e.mover) return !0
  }

  function It(e) {
    return e.lineSpace.offsetTop
  }

  function Rt(e) {
    return e.mover.offsetHeight - e.lineSpace.offsetHeight
  }

  function zt(e) {
    if (e.cachedPaddingH) return e.cachedPaddingH;
    var t = n(e.measure, r("pre", "x")),
      i = window.getComputedStyle ? window.getComputedStyle(t) : t.currentStyle,
      o = {
        left: parseInt(i.paddingLeft),
        right: parseInt(i.paddingRight)
      };
    return isNaN(o.left) || isNaN(o.right) || (e.cachedPaddingH = o), o
  }

  function Bt(e) {
    return Kl - e.display.nativeBarWidth
  }

  function jt(e) {
    return e.display.scroller.clientWidth - Bt(e) - e.display.barWidth
  }

  function qt(e) {
    return e.display.scroller.clientHeight - Bt(e) - e.display.barHeight
  }

  function Gt(e, t, n) {
    var r = e.options.lineWrapping,
      i = r && jt(e);
    if (!t.measure.heights || r && t.measure.width != i) {
      var o = t.measure.heights = [];
      if (r) {
        t.measure.width = i;
        for (var l = t.text.firstChild.getClientRects(), a = 0; a < l.length - 1; a++) {
          var s = l[a],
            c = l[a + 1];
          Math.abs(s.bottom - c.bottom) > 2 && o.push((s.bottom + c.top) / 2 - n.top)
        }
      }
      o.push(n.bottom - n.top)
    }
  }

  function Ut(e, t, n) {
    if (e.line == t) return {
      map: e.measure.map,
      cache: e.measure.cache
    };
    for (var r = 0; r < e.rest.length; r++)
      if (e.rest[r] == t) return {
        map: e.measure.maps[r],
        cache: e.measure.caches[r]
      };
    for (var i = 0; i < e.rest.length; i++)
      if (P(e.rest[i]) > n) return {
        map: e.measure.maps[i],
        cache: e.measure.caches[i],
        before: !0
      }
  }

  function Kt(e, t) {
    t = de(t);
    var r = P(t),
      i = e.display.externalMeasured = new mt(e.doc, t, r);
    i.lineN = r;
    var o = i.built = ct(e, i);
    return i.text = o.pre, n(e.display.lineMeasure, o.pre), i
  }

  function Vt(e, t, n, r) {
    return Xt(e, $t(e, t), n, r)
  }

  function _t(e, t) {
    if (t >= e.display.viewFrom && t < e.display.viewTo) return e.display.view[Mn(e, t)];
    var n = e.display.externalMeasured;
    return n && t >= n.lineN && t < n.lineN + n.size ? n : void 0
  }

  function $t(e, t) {
    var n = P(t),
      r = _t(e, n);
    r && !r.text ? r = null : r && r.changes && (kt(e, r, n, Cn(e)), e.curOp.forceUpdate = !0), r || (r = Kt(e, t));
    var i = Ut(r, t, n);
    return {
      line: t,
      view: r,
      rect: null,
      map: i.map,
      cache: i.cache,
      before: i.before,
      hasHeights: !1
    }
  }

  function Xt(e, t, n, r, i) {
    t.before && (n = -1);
    var o, l = n + (r || "");
    return t.cache.hasOwnProperty(l) ? o = t.cache[l] : (t.rect || (t.rect = t.view.text.getBoundingClientRect()), t.hasHeights || (Gt(e, t.view, t.rect), t.hasHeights = !0), o = Qt(e, t, n, r), o.bogus || (t.cache[l] = o)), {
      left: o.left,
      right: o.right,
      top: i ? o.rtop : o.top,
      bottom: i ? o.rbottom : o.bottom
    }
  }

  function Yt(e, t, n) {
    for (var r, i, o, l, a, s, c = 0; c < e.length; c += 3)
      if (a = e[c], s = e[c + 1], t < a ? (i = 0, o = 1, l = "left") : t < s ? (i = t - a, o = i + 1) : (c == e.length - 3 || t == s && e[c + 3] > t) && (o = s - a, i = o - 1, t >= s && (l = "right")), null != i) {
        if (r = e[c + 2], a == s && n == (r.insertLeft ? "left" : "right") && (l = n), "left" == n && 0 == i)
          for (; c && e[c - 2] == e[c - 3] && e[c - 1].insertLeft;) r = e[(c -= 3) + 2], l = "left";
        if ("right" == n && i == s - a)
          for (; c < e.length - 3 && e[c + 3] == e[c + 4] && !e[c + 5].insertLeft;) r = e[(c += 3) + 2], l = "right";
        break
      } return {
      node: r,
      start: i,
      end: o,
      collapse: l,
      coverStart: a,
      coverEnd: s
    }
  }

  function Zt(e, t) {
    var n = ka;
    if ("left" == t)
      for (var r = 0; r < e.length && (n = e[r]).left == n.right; r++);
    else
      for (var i = e.length - 1; i >= 0 && (n = e[i]).left == n.right; i--);
    return n
  }

  function Qt(e, t, n, r) {
    var i, o = Yt(t.map, n, r),
      l = o.node,
      a = o.start,
      s = o.end,
      c = o.collapse;
    if (3 == l.nodeType) {
      for (var u = 0; u < 4; u++) {
        for (; a && k(t.line.text.charAt(o.coverStart + a));) --a;
        for (; o.coverStart + s < o.coverEnd && k(t.line.text.charAt(o.coverStart + s));) ++s;
        if (i = wl && Cl < 9 && 0 == a && s == o.coverEnd - o.coverStart ? l.parentNode.getBoundingClientRect() : Zt(Il(l, a, s).getClientRects(), r), i.left || i.right || 0 == a) break;
        s = a, a -= 1, c = "right"
      }
      wl && Cl < 11 && (i = Jt(e.display.measure, i))
    } else {
      a > 0 && (c = r = "right");
      var f;
      i = e.options.lineWrapping && (f = l.getClientRects()).length > 1 ? f["right" == r ? f.length - 1 : 0] : l.getBoundingClientRect()
    }
    if (wl && Cl < 9 && !a && (!i || !i.left && !i.right)) {
      var d = l.parentNode.getClientRects()[0];
      i = d ? {
        left: d.left,
        right: d.left + wn(e.display),
        top: d.top,
        bottom: d.bottom
      } : ka
    }
    for (var h = i.top - t.rect.top, p = i.bottom - t.rect.top, g = (h + p) / 2, m = t.view.measure.heights, v = 0; v < m.length - 1 && !(g < m[v]); v++);
    var y = v ? m[v - 1] : 0,
      b = m[v],
      x = {
        left: ("right" == c ? i.right : i.left) - t.rect.left,
        right: ("left" == c ? i.left : i.right) - t.rect.left,
        top: y,
        bottom: b
      };
    return i.left || i.right || (x.bogus = !0), e.options.singleCursorHeightPerLine || (x.rtop = h, x.rbottom = p), x
  }

  function Jt(e, t) {
    if (!window.screen || null == screen.logicalXDPI || screen.logicalXDPI == screen.deviceXDPI || !Be(e)) return t;
    var n = screen.logicalXDPI / screen.deviceXDPI,
      r = screen.logicalYDPI / screen.deviceYDPI;
    return {
      left: t.left * n,
      right: t.right * n,
      top: t.top * r,
      bottom: t.bottom * r
    }
  }

  function en(e) {
    if (e.measure && (e.measure.cache = {}, e.measure.heights = null, e.rest))
      for (var t = 0; t < e.rest.length; t++) e.measure.caches[t] = {}
  }

  function tn(e) {
    e.display.externalMeasure = null, t(e.display.lineMeasure);
    for (var n = 0; n < e.display.view.length; n++) en(e.display.view[n])
  }

  function nn(e) {
    tn(e), e.display.cachedCharWidth = e.display.cachedTextHeight = e.display.cachedPaddingH = null, e.options.lineWrapping || (e.display.maxLineChanged = !0), e.display.lineNumChars = null
  }

  function rn() {
    return Ll && Pl ? -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft)) : window.pageXOffset || (document.documentElement || document.body).scrollLeft
  }

  function on() {
    return Ll && Pl ? -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop)) : window.pageYOffset || (document.documentElement || document.body).scrollTop
  }

  function ln(e) {
    var t = 0;
    if (e.widgets)
      for (var n = 0; n < e.widgets.length; ++n) e.widgets[n].above && (t += Wt(e.widgets[n]));
    return t
  }

  function an(e, t, n, r, i) {
    if (!i) {
      var o = ln(t);
      n.top += o, n.bottom += o
    }
    if ("line" == r) return n;
    r || (r = "local");
    var l = be(t);
    if ("local" == r ? l += It(e.display) : l -= e.display.viewOffset, "page" == r || "window" == r) {
      var a = e.display.lineSpace.getBoundingClientRect();
      l += a.top + ("window" == r ? 0 : on());
      var s = a.left + ("window" == r ? 0 : rn());
      n.left += s, n.right += s
    }
    return n.top += l, n.bottom += l, n
  }

  function sn(e, t, n) {
    if ("div" == n) return t;
    var r = t.left,
      i = t.top;
    if ("page" == n) r -= rn(), i -= on();
    else if ("local" == n || !n) {
      var o = e.display.sizer.getBoundingClientRect();
      r += o.left, i += o.top
    }
    var l = e.display.lineSpace.getBoundingClientRect();
    return {
      left: r - l.left,
      top: i - l.top
    }
  }

  function cn(e, t, n, r, i) {
    return r || (r = M(e.doc, t.line)), an(e, r, Vt(e, r, t.ch, i), n)
  }

  function un(e, t, n, r, i, o) {
    function l(t, l) {
      var a = Xt(e, i, t, l ? "right" : "left", o);
      return l ? a.left = a.right : a.right = a.left, an(e, r, a, n)
    }

    function a(e, t, n) {
      var r = s[t],
        i = 1 == r.level;
      return l(n ? e - 1 : e, i != n)
    }
    r = r || M(e.doc, t.line), i || (i = $t(e, r));
    var s = Se(r, e.doc.direction),
      c = t.ch,
      u = t.sticky;
    if (c >= r.text.length ? (c = r.text.length, u = "before") : c <= 0 && (c = 0, u = "after"), !s) return l("before" == u ? c - 1 : c, "before" == u);
    var f = ke(s, c, u),
      d = ta,
      h = a(c, f, "before" == u);
    return null != d && (h.other = a(c, d, "before" != u)), h
  }

  function fn(e, t) {
    var n = 0;
    t = q(e.doc, t), e.options.lineWrapping || (n = wn(e.display) * t.ch);
    var r = M(e.doc, t.line),
      i = be(r) + It(e.display);
    return {
      left: n,
      right: n,
      top: i,
      bottom: i + r.height
    }
  }

  function dn(e, t, n, r, i) {
    var o = W(e, t, n);
    return o.xRel = i, r && (o.outside = !0), o
  }

  function hn(e, t, n) {
    var r = e.doc;
    if (n += e.display.viewOffset, n < 0) return dn(r.first, 0, null, !0, -1);
    var i = D(r, n),
      o = r.first + r.size - 1;
    if (i > o) return dn(r.first + r.size - 1, M(r, o).text.length, null, !0, 1);
    t < 0 && (t = 0);
    for (var l = M(r, i);;) {
      var a = vn(e, l, i, t, n),
        s = ue(l, a.ch + (a.xRel > 0 ? 1 : 0));
      if (!s) return a;
      var c = s.find(1);
      if (c.line == i) return c;
      l = M(r, i = c.line)
    }
  }

  function pn(e, t, n, r) {
    r -= ln(t);
    var i = t.text.length,
      o = L(function(t) {
        return Xt(e, n, t - 1).bottom <= r
      }, i, 0);
    return i = L(function(t) {
      return Xt(e, n, t).top > r
    }, o, i), {
      begin: o,
      end: i
    }
  }

  function gn(e, t, n, r) {
    n || (n = $t(e, t));
    var i = an(e, t, Xt(e, n, r), "line").top;
    return pn(e, t, n, i)
  }

  function mn(e, t, n, r) {
    return !(e.bottom <= n) && (e.top > n || (r ? e.left : e.right) > t)
  }

  function vn(e, t, n, r, i) {
    i -= be(t);
    var o = $t(e, t),
      l = ln(t),
      a = 0,
      s = t.text.length,
      c = !0,
      u = Se(t, e.doc.direction);
    if (u) {
      var f = (e.options.lineWrapping ? bn : yn)(e, t, n, o, u, r, i);
      c = 1 != f.level, a = c ? f.from : f.to - 1, s = c ? f.to : f.from - 1
    }
    var d, h, p = null,
      g = null,
      m = L(function(t) {
        var n = Xt(e, o, t);
        return n.top += l, n.bottom += l, !!mn(n, r, i, !1) && (n.top <= i && n.left <= r && (p = t, g = n), !0)
      }, a, s),
      v = !1;
    if (g) {
      var y = r - g.left < g.right - r,
        b = y == c;
      m = p + (b ? 0 : 1), h = b ? "after" : "before", d = y ? g.left : g.right
    } else {
      c || m != s && m != a || m++, h = 0 == m ? "after" : m == t.text.length ? "before" : Xt(e, o, m - (c ? 1 : 0)).bottom + l <= i == c ? "after" : "before";
      var x = un(e, W(n, m, h), "line", t, o);
      d = x.left, v = i < x.top || i >= x.bottom
    }
    return m = S(t.text, m, 1), dn(n, m, h, v, r - d)
  }

  function yn(e, t, n, r, i, o, l) {
    var a = L(function(a) {
        var s = i[a],
          c = 1 != s.level;
        return mn(un(e, W(n, c ? s.to : s.from, c ? "before" : "after"), "line", t, r), o, l, !0)
      }, 0, i.length - 1),
      s = i[a];
    if (a > 0) {
      var c = 1 != s.level,
        u = un(e, W(n, c ? s.from : s.to, c ? "after" : "before"), "line", t, r);
      mn(u, o, l, !0) && u.top > l && (s = i[a - 1])
    }
    return s
  }

  function bn(e, t, n, r, i, o, l) {
    var a = pn(e, t, r, l),
      s = a.begin,
      c = a.end;
    /\s/.test(t.text.charAt(c - 1)) && c--;
    for (var u = null, f = null, d = 0; d < i.length; d++) {
      var h = i[d];
      if (!(h.from >= c || h.to <= s)) {
        var p = 1 != h.level,
          g = Xt(e, r, p ? Math.min(c, h.to) - 1 : Math.max(s, h.from)).right,
          m = g < o ? o - g + 1e9 : g - o;
        (!u || f > m) && (u = h, f = m)
      }
    }
    return u || (u = i[i.length - 1]), u.from < s && (u = {
      from: s,
      to: u.to,
      level: u.level
    }), u.to > c && (u = {
      from: u.from,
      to: c,
      level: u.level
    }), u
  }

  function xn(e) {
    if (null != e.cachedTextHeight) return e.cachedTextHeight;
    if (null == ya) {
      ya = r("pre");
      for (var i = 0; i < 49; ++i) ya.appendChild(document.createTextNode("x")), ya.appendChild(r("br"));
      ya.appendChild(document.createTextNode("x"))
    }
    n(e.measure, ya);
    var o = ya.offsetHeight / 50;
    return o > 3 && (e.cachedTextHeight = o), t(e.measure), o || 1
  }

  function wn(e) {
    if (null != e.cachedCharWidth) return e.cachedCharWidth;
    var t = r("span", "xxxxxxxxxx"),
      i = r("pre", [t]);
    n(e.measure, i);
    var o = t.getBoundingClientRect(),
      l = (o.right - o.left) / 10;
    return l > 2 && (e.cachedCharWidth = l), l || 10
  }

  function Cn(e) {
    for (var t = e.display, n = {}, r = {}, i = t.gutters.clientLeft, o = t.gutters.firstChild, l = 0; o; o = o.nextSibling, ++l) n[e.options.gutters[l]] = o.offsetLeft + o.clientLeft + i, r[e.options.gutters[l]] = o.clientWidth;
    return {
      fixedPos: kn(t),
      gutterTotalWidth: t.gutters.offsetWidth,
      gutterLeft: n,
      gutterWidth: r,
      wrapperWidth: t.wrapper.clientWidth
    }
  }

  function kn(e) {
    return e.scroller.getBoundingClientRect().left - e.sizer.getBoundingClientRect().left
  }

  function Sn(e) {
    var t = xn(e.display),
      n = e.options.lineWrapping,
      r = n && Math.max(5, e.display.scroller.clientWidth / wn(e.display) - 3);
    return function(i) {
      if (ve(e.doc, i)) return 0;
      var o = 0;
      if (i.widgets)
        for (var l = 0; l < i.widgets.length; l++) i.widgets[l].height && (o += i.widgets[l].height);
      return n ? o + (Math.ceil(i.text.length / r) || 1) * t : o + t
    }
  }

  function Ln(e) {
    var t = e.doc,
      n = Sn(e);
    t.iter(function(e) {
      var t = n(e);
      t != e.height && A(e, t)
    })
  }

  function Tn(e, t, n, r) {
    var i = e.display;
    if (!n && "true" == Ee(t).getAttribute("cm-not-content")) return null;
    var o, l, a = i.lineSpace.getBoundingClientRect();
    try {
      o = t.clientX - a.left, l = t.clientY - a.top
    } catch (t) {
      return null
    }
    var s, c = hn(e, o, l);
    if (r && 1 == c.xRel && (s = M(e.doc, c.line).text).length == c.ch) {
      var u = f(s, s.length, e.options.tabSize) - s.length;
      c = W(c.line, Math.max(0, Math.round((o - zt(e.display).left) / wn(e.display)) - u))
    }
    return c
  }

  function Mn(e, t) {
    if (t >= e.display.viewTo) return null;
    if (t -= e.display.viewFrom, t < 0) return null;
    for (var n = e.display.view, r = 0; r < n.length; r++)
      if (t -= n[r].size, t < 0) return r
  }

  function On(e) {
    e.display.input.showSelection(e.display.input.prepareSelection())
  }

  function Nn(e, t) {
    void 0 === t && (t = !0);
    for (var n = e.doc, r = {}, i = r.cursors = document.createDocumentFragment(), o = r.selection = document.createDocumentFragment(), l = 0; l < n.sel.ranges.length; l++)
      if (t || l != n.sel.primIndex) {
        var a = n.sel.ranges[l];
        if (!(a.from().line >= e.display.viewTo || a.to().line < e.display.viewFrom)) {
          var s = a.empty();
          (s || e.options.showCursorWhenSelecting) && An(e, a.head, i), s || Dn(e, a, o)
        }
      } return r
  }

  function An(e, t, n) {
    var i = un(e, t, "div", null, null, !e.options.singleCursorHeightPerLine),
      o = n.appendChild(r("div", " ", "CodeMirror-cursor"));
    if (o.style.left = i.left + "px", o.style.top = i.top + "px", o.style.height = Math.max(0, i.bottom - i.top) * e.options.cursorHeight + "px", i.other) {
      var l = n.appendChild(r("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor"));
      l.style.display = "", l.style.left = i.other.left + "px", l.style.top = i.other.top + "px", l.style.height = .85 * (i.other.bottom - i.other.top) + "px"
    }
  }

  function Pn(e, t) {
    return e.top - t.top || e.left - t.left
  }

  function Dn(e, t, n) {
    function i(e, t, n, i) {
      t < 0 && (t = 0), t = Math.round(t), i = Math.round(i), s.appendChild(r("div", null, "CodeMirror-selected", "position: absolute; left: " + e + "px;\n                             top: " + t + "px; width: " + (null == n ? f - e : n) + "px;\n                             height: " + (i - t) + "px"))
    }

    function o(t, n, r) {
      function o(n, r) {
        return cn(e, W(t, n), "div", h, r)
      }

      function l(t, n, r) {
        var i = gn(e, h, null, t),
          l = "ltr" == n == ("after" == r) ? "left" : "right",
          a = "after" == r ? i.begin : i.end - (/\s/.test(h.text.charAt(i.end - 1)) ? 2 : 1);
        return o(a, l)[l]
      }
      var s, c, h = M(a, t),
        p = h.text.length,
        g = Se(h, a.direction);
      return Ce(g, n || 0, null == r ? p : r, function(e, t, a, h) {
        var m = "ltr" == a,
          v = o(e, m ? "left" : "right"),
          y = o(t - 1, m ? "right" : "left"),
          b = null == n && 0 == e,
          x = null == r && t == p,
          w = 0 == h,
          C = !g || h == g.length - 1;
        if (y.top - v.top <= 3) {
          var k = (d ? b : x) && w,
            S = (d ? x : b) && C,
            L = k ? u : (m ? v : y).left,
            T = S ? f : (m ? y : v).right;
          i(L, v.top, T - L, v.bottom)
        } else {
          var M, O, N, A;
          m ? (M = d && b && w ? u : v.left, O = d ? f : l(e, a, "before"), N = d ? u : l(t, a, "after"), A = d && x && C ? f : y.right) : (M = d ? l(e, a, "before") : u, O = !d && b && w ? f : v.right, N = !d && x && C ? u : y.left, A = d ? l(t, a, "after") : f), i(M, v.top, O - M, v.bottom), v.bottom < y.top && i(u, v.bottom, null, y.top), i(N, y.top, A - N, y.bottom)
        }(!s || Pn(v, s) < 0) && (s = v), Pn(y, s) < 0 && (s = y), (!c || Pn(v, c) < 0) && (c = v), Pn(y, c) < 0 && (c = y)
      }), {
        start: s,
        end: c
      }
    }
    var l = e.display,
      a = e.doc,
      s = document.createDocumentFragment(),
      c = zt(e.display),
      u = c.left,
      f = Math.max(l.sizerWidth, jt(e) - l.sizer.offsetLeft) - c.right,
      d = "ltr" == a.direction,
      h = t.from(),
      p = t.to();
    if (h.line == p.line) o(h.line, h.ch, p.ch);
    else {
      var g = M(a, h.line),
        m = M(a, p.line),
        v = de(g) == de(m),
        y = o(h.line, h.ch, v ? g.text.length + 1 : null).end,
        b = o(p.line, v ? 0 : null, p.ch).start;
      v && (y.top < b.top - 2 ? (i(y.right, y.top, null, y.bottom), i(u, b.top, b.left, b.bottom)) : i(y.right, y.top, b.left - y.right, y.bottom)), y.bottom < b.top && i(u, y.bottom, null, b.top)
    }
    n.appendChild(s)
  }

  function Hn(e) {
    if (e.state.focused) {
      var t = e.display;
      clearInterval(t.blinker);
      var n = !0;
      t.cursorDiv.style.visibility = "", e.options.cursorBlinkRate > 0 ? t.blinker = setInterval(function() {
        return t.cursorDiv.style.visibility = (n = !n) ? "" : "hidden"
      }, e.options.cursorBlinkRate) : e.options.cursorBlinkRate < 0 && (t.cursorDiv.style.visibility = "hidden")
    }
  }

  function Fn(e) {
    e.state.focused || (e.display.input.focus(), En(e))
  }

  function Wn(e) {
    e.state.delayingBlurEvent = !0, setTimeout(function() {
      e.state.delayingBlurEvent && (e.state.delayingBlurEvent = !1, In(e))
    }, 100)
  }

  function En(e, t) {
    e.state.delayingBlurEvent && (e.state.delayingBlurEvent = !1), "nocursor" != e.options.readOnly && (e.state.focused || (Me(e, "focus", e, t), e.state.focused = !0, a(e.display.wrapper, "CodeMirror-focused"), e.curOp || e.display.selForContextMenu == e.doc.sel || (e.display.input.reset(), kl && setTimeout(function() {
      return e.display.input.reset(!0)
    }, 20)), e.display.input.receivedFocus()), Hn(e))
  }

  function In(e, t) {
    e.state.delayingBlurEvent || (e.state.focused && (Me(e, "blur", e, t), e.state.focused = !1, Bl(e.display.wrapper, "CodeMirror-focused")), clearInterval(e.display.blinker), setTimeout(function() {
      e.state.focused || (e.display.shift = !1)
    }, 150))
  }

  function Rn(e) {
    for (var t = e.display, n = t.lineDiv.offsetTop, r = 0; r < t.view.length; r++) {
      var i = t.view[r],
        o = void 0;
      if (!i.hidden) {
        if (wl && Cl < 8) {
          var l = i.node.offsetTop + i.node.offsetHeight;
          o = l - n, n = l
        } else {
          var a = i.node.getBoundingClientRect();
          o = a.bottom - a.top
        }
        var s = i.line.height - o;
        if (o < 2 && (o = xn(t)), (s > .005 || s < -.005) && (A(i.line, o), zn(i.line), i.rest))
          for (var c = 0; c < i.rest.length; c++) zn(i.rest[c])
      }
    }
  }

  function zn(e) {
    if (e.widgets)
      for (var t = 0; t < e.widgets.length; ++t) {
        var n = e.widgets[t],
          r = n.node.parentNode;
        r && (n.height = r.offsetHeight)
      }
  }

  function Bn(e, t, n) {
    var r = n && null != n.top ? Math.max(0, n.top) : e.scroller.scrollTop;
    r = Math.floor(r - It(e));
    var i = n && null != n.bottom ? n.bottom : r + e.wrapper.clientHeight,
      o = D(t, r),
      l = D(t, i);
    if (n && n.ensure) {
      var a = n.ensure.from.line,
        s = n.ensure.to.line;
      a < o ? (o = a, l = D(t, be(M(t, a)) + e.wrapper.clientHeight)) : Math.min(s, t.lastLine()) >= l && (o = D(t, be(M(t, s)) - e.wrapper.clientHeight), l = s)
    }
    return {
      from: o,
      to: Math.max(l, o + 1)
    }
  }

  function jn(e) {
    var t = e.display,
      n = t.view;
    if (t.alignWidgets || t.gutters.firstChild && e.options.fixedGutter) {
      for (var r = kn(t) - t.scroller.scrollLeft + e.doc.scrollLeft, i = t.gutters.offsetWidth, o = r + "px", l = 0; l < n.length; l++)
        if (!n[l].hidden) {
          e.options.fixedGutter && (n[l].gutter && (n[l].gutter.style.left = o), n[l].gutterBackground && (n[l].gutterBackground.style.left = o));
          var a = n[l].alignable;
          if (a)
            for (var s = 0; s < a.length; s++) a[s].style.left = o
        } e.options.fixedGutter && (t.gutters.style.left = r + i + "px")
    }
  }

  function qn(e) {
    if (!e.options.lineNumbers) return !1;
    var t = e.doc,
      n = F(e.options, t.first + t.size - 1),
      i = e.display;
    if (n.length != i.lineNumChars) {
      var o = i.measure.appendChild(r("div", [r("div", n)], "CodeMirror-linenumber CodeMirror-gutter-elt")),
        l = o.firstChild.offsetWidth,
        a = o.offsetWidth - l;
      return i.lineGutter.style.width = "", i.lineNumInnerWidth = Math.max(l, i.lineGutter.offsetWidth - a) + 1, i.lineNumWidth = i.lineNumInnerWidth + a, i.lineNumChars = i.lineNumInnerWidth ? n.length : -1, i.lineGutter.style.width = i.lineNumWidth + "px", Hr(e), !0
    }
    return !1
  }

  function Gn(e, t) {
    if (!Oe(e, "scrollCursorIntoView")) {
      var n = e.display,
        i = n.sizer.getBoundingClientRect(),
        o = null;
      if (t.top + i.top < 0 ? o = !0 : t.bottom + i.top > (window.innerHeight || document.documentElement.clientHeight) && (o = !1), null != o && !Nl) {
        var l = r("div", "​", null, "position: absolute;\n                         top: " + (t.top - n.viewOffset - It(e.display)) + "px;\n                         height: " + (t.bottom - t.top + Bt(e) + n.barHeight) + "px;\n                         left: " + t.left + "px; width: " + Math.max(2, t.right - t.left) + "px;");
        e.display.lineSpace.appendChild(l), l.scrollIntoView(o), e.display.lineSpace.removeChild(l)
      }
    }
  }

  function Un(e, t, n, r) {
    null == r && (r = 0);
    var i;
    e.options.lineWrapping || t != n || (t = t.ch ? W(t.line, "before" == t.sticky ? t.ch - 1 : t.ch, "after") : t, n = "before" == t.sticky ? W(t.line, t.ch + 1, "before") : t);
    for (var o = 0; o < 5; o++) {
      var l = !1,
        a = un(e, t),
        s = n && n != t ? un(e, n) : a;
      i = {
        left: Math.min(a.left, s.left),
        top: Math.min(a.top, s.top) - r,
        right: Math.max(a.left, s.left),
        bottom: Math.max(a.bottom, s.bottom) + r
      };
      var c = Vn(e, i),
        u = e.doc.scrollTop,
        f = e.doc.scrollLeft;
      if (null != c.scrollTop && (Jn(e, c.scrollTop), Math.abs(e.doc.scrollTop - u) > 1 && (l = !0)), null != c.scrollLeft && (tr(e, c.scrollLeft), Math.abs(e.doc.scrollLeft - f) > 1 && (l = !0)), !l) break
    }
    return i
  }

  function Kn(e, t) {
    var n = Vn(e, t);
    null != n.scrollTop && Jn(e, n.scrollTop), null != n.scrollLeft && tr(e, n.scrollLeft)
  }

  function Vn(e, t) {
    var n = e.display,
      r = xn(e.display);
    t.top < 0 && (t.top = 0);
    var i = e.curOp && null != e.curOp.scrollTop ? e.curOp.scrollTop : n.scroller.scrollTop,
      o = qt(e),
      l = {};
    t.bottom - t.top > o && (t.bottom = t.top + o);
    var a = e.doc.height + Rt(n),
      s = t.top < r,
      c = t.bottom > a - r;
    if (t.top < i) l.scrollTop = s ? 0 : t.top;
    else if (t.bottom > i + o) {
      var u = Math.min(t.top, (c ? a : t.bottom) - o);
      u != i && (l.scrollTop = u)
    }
    var f = e.curOp && null != e.curOp.scrollLeft ? e.curOp.scrollLeft : n.scroller.scrollLeft,
      d = jt(e) - (e.options.fixedGutter ? n.gutters.offsetWidth : 0),
      h = t.right - t.left > d;
    return h && (t.right = t.left + d), t.left < 10 ? l.scrollLeft = 0 : t.left < f ? l.scrollLeft = Math.max(0, t.left - (h ? 0 : 10)) : t.right > d + f - 3 && (l.scrollLeft = t.right + (h ? 0 : 10) - d), l
  }

  function _n(e, t) {
    null != t && (Zn(e), e.curOp.scrollTop = (null == e.curOp.scrollTop ? e.doc.scrollTop : e.curOp.scrollTop) + t)
  }

  function $n(e) {
    Zn(e);
    var t = e.getCursor();
    e.curOp.scrollToPos = {
      from: t,
      to: t,
      margin: e.options.cursorScrollMargin
    }
  }

  function Xn(e, t, n) {
    null == t && null == n || Zn(e), null != t && (e.curOp.scrollLeft = t), null != n && (e.curOp.scrollTop = n)
  }

  function Yn(e, t) {
    Zn(e), e.curOp.scrollToPos = t
  }

  function Zn(e) {
    var t = e.curOp.scrollToPos;
    if (t) {
      e.curOp.scrollToPos = null;
      var n = fn(e, t.from),
        r = fn(e, t.to);
      Qn(e, n, r, t.margin)
    }
  }

  function Qn(e, t, n, r) {
    var i = Vn(e, {
      left: Math.min(t.left, n.left),
      top: Math.min(t.top, n.top) - r,
      right: Math.max(t.right, n.right),
      bottom: Math.max(t.bottom, n.bottom) + r
    });
    Xn(e, i.scrollLeft, i.scrollTop)
  }

  function Jn(e, t) {
    Math.abs(e.doc.scrollTop - t) < 2 || (vl || Pr(e, {
      top: t
    }), er(e, t, !0), vl && Pr(e), Sr(e, 100))
  }

  function er(e, t, n) {
    t = Math.min(e.display.scroller.scrollHeight - e.display.scroller.clientHeight, t), (e.display.scroller.scrollTop != t || n) && (e.doc.scrollTop = t, e.display.scrollbars.setScrollTop(t), e.display.scroller.scrollTop != t && (e.display.scroller.scrollTop = t))
  }

  function tr(e, t, n, r) {
    t = Math.min(t, e.display.scroller.scrollWidth - e.display.scroller.clientWidth), (n ? t == e.doc.scrollLeft : Math.abs(e.doc.scrollLeft - t) < 2) && !r || (e.doc.scrollLeft = t, jn(e), e.display.scroller.scrollLeft != t && (e.display.scroller.scrollLeft = t), e.display.scrollbars.setScrollLeft(t))
  }

  function nr(e) {
    var t = e.display,
      n = t.gutters.offsetWidth,
      r = Math.round(e.doc.height + Rt(e.display));
    return {
      clientHeight: t.scroller.clientHeight,
      viewHeight: t.wrapper.clientHeight,
      scrollWidth: t.scroller.scrollWidth,
      clientWidth: t.scroller.clientWidth,
      viewWidth: t.wrapper.clientWidth,
      barLeft: e.options.fixedGutter ? n : 0,
      docHeight: r,
      scrollHeight: r + Bt(e) + t.barHeight,
      nativeBarWidth: t.nativeBarWidth,
      gutterWidth: n
    }
  }

  function rr(e, t) {
    t || (t = nr(e));
    var n = e.display.barWidth,
      r = e.display.barHeight;
    ir(e, t);
    for (var i = 0; i < 4 && n != e.display.barWidth || r != e.display.barHeight; i++) n != e.display.barWidth && e.options.lineWrapping && Rn(e), ir(e, nr(e)), n = e.display.barWidth, r = e.display.barHeight
  }

  function ir(e, t) {
    var n = e.display,
      r = n.scrollbars.update(t);
    n.sizer.style.paddingRight = (n.barWidth = r.right) + "px", n.sizer.style.paddingBottom = (n.barHeight = r.bottom) + "px", n.heightForcer.style.borderBottom = r.bottom + "px solid transparent", r.right && r.bottom ? (n.scrollbarFiller.style.display = "block", n.scrollbarFiller.style.height = r.bottom + "px", n.scrollbarFiller.style.width = r.right + "px") : n.scrollbarFiller.style.display = "", r.bottom && e.options.coverGutterNextToScrollbar && e.options.fixedGutter ? (n.gutterFiller.style.display = "block", n.gutterFiller.style.height = r.bottom + "px", n.gutterFiller.style.width = t.gutterWidth + "px") : n.gutterFiller.style.display = ""
  }

  function or(e) {
    e.display.scrollbars && (e.display.scrollbars.clear(), e.display.scrollbars.addClass && Bl(e.display.wrapper, e.display.scrollbars.addClass)), e.display.scrollbars = new Ta[e.options.scrollbarStyle](function(t) {
      e.display.wrapper.insertBefore(t, e.display.scrollbarFiller), ia(t, "mousedown", function() {
        e.state.focused && setTimeout(function() {
          return e.display.input.focus()
        }, 0)
      }), t.setAttribute("cm-not-content", "true")
    }, function(t, n) {
      "horizontal" == n ? tr(e, t) : Jn(e, t)
    }, e), e.display.scrollbars.addClass && a(e.display.wrapper, e.display.scrollbars.addClass)
  }

  function lr(e) {
    e.curOp = {
      cm: e,
      viewChanged: !1,
      startHeight: e.doc.height,
      forceUpdate: !1,
      updateInput: null,
      typing: !1,
      changeObjs: null,
      cursorActivityHandlers: null,
      cursorActivityCalled: 0,
      selectionChanged: !1,
      updateMaxLine: !1,
      scrollLeft: null,
      scrollTop: null,
      scrollToPos: null,
      focus: !1,
      id: ++Ma
    }, yt(e.curOp)
  }

  function ar(e) {
    var t = e.curOp;
    xt(t, function(e) {
      for (var t = 0; t < e.ops.length; t++) e.ops[t].cm.curOp = null;
      sr(e)
    })
  }

  function sr(e) {
    for (var t = e.ops, n = 0; n < t.length; n++) cr(t[n]);
    for (var r = 0; r < t.length; r++) ur(t[r]);
    for (var i = 0; i < t.length; i++) fr(t[i]);
    for (var o = 0; o < t.length; o++) dr(t[o]);
    for (var l = 0; l < t.length; l++) hr(t[l])
  }

  function cr(e) {
    var t = e.cm,
      n = t.display;
    Tr(t), e.updateMaxLine && we(t), e.mustUpdate = e.viewChanged || e.forceUpdate || null != e.scrollTop || e.scrollToPos && (e.scrollToPos.from.line < n.viewFrom || e.scrollToPos.to.line >= n.viewTo) || n.maxLineChanged && t.options.lineWrapping, e.update = e.mustUpdate && new Oa(t, e.mustUpdate && {
      top: e.scrollTop,
      ensure: e.scrollToPos
    }, e.forceUpdate)
  }

  function ur(e) {
    e.updatedDisplay = e.mustUpdate && Nr(e.cm, e.update)
  }

  function fr(e) {
    var t = e.cm,
      n = t.display;
    e.updatedDisplay && Rn(t), e.barMeasure = nr(t), n.maxLineChanged && !t.options.lineWrapping && (e.adjustWidthTo = Vt(t, n.maxLine, n.maxLine.text.length).left + 3, t.display.sizerWidth = e.adjustWidthTo, e.barMeasure.scrollWidth = Math.max(n.scroller.clientWidth, n.sizer.offsetLeft + e.adjustWidthTo + Bt(t) + t.display.barWidth), e.maxScrollLeft = Math.max(0, n.sizer.offsetLeft + e.adjustWidthTo - jt(t))), (e.updatedDisplay || e.selectionChanged) && (e.preparedSelection = n.input.prepareSelection())
  }

  function dr(e) {
    var t = e.cm;
    null != e.adjustWidthTo && (t.display.sizer.style.minWidth = e.adjustWidthTo + "px", e.maxScrollLeft < t.doc.scrollLeft && tr(t, Math.min(t.display.scroller.scrollLeft, e.maxScrollLeft), !0), t.display.maxLineChanged = !1);
    var n = e.focus && e.focus == l();
    e.preparedSelection && t.display.input.showSelection(e.preparedSelection, n), (e.updatedDisplay || e.startHeight != t.doc.height) && rr(t, e.barMeasure), e.updatedDisplay && Fr(t, e.barMeasure), e.selectionChanged && Hn(t), t.state.focused && e.updateInput && t.display.input.reset(e.typing), n && Fn(e.cm)
  }

  function hr(e) {
    var t = e.cm,
      n = t.display,
      r = t.doc;
    if (e.updatedDisplay && Ar(t, e.update), null == n.wheelStartX || null == e.scrollTop && null == e.scrollLeft && !e.scrollToPos || (n.wheelStartX = n.wheelStartY = null), null != e.scrollTop && er(t, e.scrollTop, e.forceScroll), null != e.scrollLeft && tr(t, e.scrollLeft, !0, !0), e.scrollToPos) {
      var i = Un(t, q(r, e.scrollToPos.from), q(r, e.scrollToPos.to), e.scrollToPos.margin);
      Gn(t, i)
    }
    var o = e.maybeHiddenMarkers,
      l = e.maybeUnhiddenMarkers;
    if (o)
      for (var a = 0; a < o.length; ++a) o[a].lines.length || Me(o[a], "hide");
    if (l)
      for (var s = 0; s < l.length; ++s) l[s].lines.length && Me(l[s], "unhide");
    n.wrapper.offsetHeight && (r.scrollTop = t.display.scroller.scrollTop), e.changeObjs && Me(t, "changes", t, e.changeObjs), e.update && e.update.finish()
  }

  function pr(e, t) {
    if (e.curOp) return t();
    lr(e);
    try {
      return t()
    } finally {
      ar(e)
    }
  }

  function gr(e, t) {
    return function() {
      if (e.curOp) return t.apply(e, arguments);
      lr(e);
      try {
        return t.apply(e, arguments)
      } finally {
        ar(e)
      }
    }
  }

  function mr(e) {
    return function() {
      if (this.curOp) return e.apply(this, arguments);
      lr(this);
      try {
        return e.apply(this, arguments)
      } finally {
        ar(this)
      }
    }
  }

  function vr(e) {
    return function() {
      var t = this.cm;
      if (!t || t.curOp) return e.apply(this, arguments);
      lr(t);
      try {
        return e.apply(this, arguments)
      } finally {
        ar(t)
      }
    }
  }

  function yr(e, t, n, r) {
    null == t && (t = e.doc.first), null == n && (n = e.doc.first + e.doc.size), r || (r = 0);
    var i = e.display;
    if (r && n < i.viewTo && (null == i.updateLineNumbers || i.updateLineNumbers > t) && (i.updateLineNumbers = t), e.curOp.viewChanged = !0, t >= i.viewTo) ea && ge(e.doc, t) < i.viewTo && xr(e);
    else if (n <= i.viewFrom) ea && me(e.doc, n + r) > i.viewFrom ? xr(e) : (i.viewFrom += r, i.viewTo += r);
    else if (t <= i.viewFrom && n >= i.viewTo) xr(e);
    else if (t <= i.viewFrom) {
      var o = wr(e, n, n + r, 1);
      o ? (i.view = i.view.slice(o.index), i.viewFrom = o.lineN, i.viewTo += r) : xr(e)
    } else if (n >= i.viewTo) {
      var l = wr(e, t, t, -1);
      l ? (i.view = i.view.slice(0, l.index), i.viewTo = l.lineN) : xr(e)
    } else {
      var a = wr(e, t, t, -1),
        s = wr(e, n, n + r, 1);
      a && s ? (i.view = i.view.slice(0, a.index).concat(vt(e, a.lineN, s.lineN)).concat(i.view.slice(s.index)), i.viewTo += r) : xr(e)
    }
    var c = i.externalMeasured;
    c && (n < c.lineN ? c.lineN += r : t < c.lineN + c.size && (i.externalMeasured = null))
  }

  function br(e, t, n) {
    e.curOp.viewChanged = !0;
    var r = e.display,
      i = e.display.externalMeasured;
    if (i && t >= i.lineN && t < i.lineN + i.size && (r.externalMeasured = null), !(t < r.viewFrom || t >= r.viewTo)) {
      var o = r.view[Mn(e, t)];
      if (null != o.node) {
        var l = o.changes || (o.changes = []);
        d(l, n) == -1 && l.push(n)
      }
    }
  }

  function xr(e) {
    e.display.viewFrom = e.display.viewTo = e.doc.first, e.display.view = [], e.display.viewOffset = 0
  }

  function wr(e, t, n, r) {
    var i, o = Mn(e, t),
      l = e.display.view;
    if (!ea || n == e.doc.first + e.doc.size) return {
      index: o,
      lineN: n
    };
    for (var a = e.display.viewFrom, s = 0; s < o; s++) a += l[s].size;
    if (a != t) {
      if (r > 0) {
        if (o == l.length - 1) return null;
        i = a + l[o].size - t, o++
      } else i = a - t;
      t += i, n += i
    }
    for (; ge(e.doc, n) != n;) {
      if (o == (r < 0 ? 0 : l.length - 1)) return null;
      n += r * l[o - (r < 0 ? 1 : 0)].size, o += r
    }
    return {
      index: o,
      lineN: n
    }
  }

  function Cr(e, t, n) {
    var r = e.display,
      i = r.view;
    0 == i.length || t >= r.viewTo || n <= r.viewFrom ? (r.view = vt(e, t, n), r.viewFrom = t) : (r.viewFrom > t ? r.view = vt(e, t, r.viewFrom).concat(r.view) : r.viewFrom < t && (r.view = r.view.slice(Mn(e, t))), r.viewFrom = t, r.viewTo < n ? r.view = r.view.concat(vt(e, r.viewTo, n)) : r.viewTo > n && (r.view = r.view.slice(0, Mn(e, n)))), r.viewTo = n
  }

  function kr(e) {
    for (var t = e.display.view, n = 0, r = 0; r < t.length; r++) {
      var i = t[r];
      i.hidden || i.node && !i.changes || ++n
    }
    return n
  }

  function Sr(e, t) {
    e.doc.highlightFrontier < e.display.viewTo && e.state.highlight.set(t, c(Lr, e))
  }

  function Lr(e) {
    var t = e.doc;
    if (!(t.highlightFrontier >= e.display.viewTo)) {
      var n = +new Date + e.options.workTime,
        r = Ze(e, t.highlightFrontier),
        i = [];
      t.iter(r.line, Math.min(t.first + t.size, e.display.viewTo + 500), function(o) {
        if (r.line >= e.display.viewFrom) {
          var l = o.styles,
            a = o.text.length > e.options.maxHighlightLength ? Ve(t.mode, r.state) : null,
            s = Xe(e, o, r, !0);
          a && (r.state = a), o.styles = s.styles;
          var c = o.styleClasses,
            u = s.classes;
          u ? o.styleClasses = u : c && (o.styleClasses = null);
          for (var f = !l || l.length != o.styles.length || c != u && (!c || !u || c.bgClass != u.bgClass || c.textClass != u.textClass), d = 0; !f && d < l.length; ++d) f = l[d] != o.styles[d];
          f && i.push(r.line), o.stateAfter = r.save(), r.nextLine()
        } else o.text.length <= e.options.maxHighlightLength && Qe(e, o.text, r), o.stateAfter = r.line % 5 == 0 ? r.save() : null, r.nextLine();
        if (+new Date > n) return Sr(e, e.options.workDelay), !0
      }), t.highlightFrontier = r.line, t.modeFrontier = Math.max(t.modeFrontier, r.line), i.length && pr(e, function() {
        for (var t = 0; t < i.length; t++) br(e, i[t], "text")
      })
    }
  }

  function Tr(e) {
    var t = e.display;
    !t.scrollbarsClipped && t.scroller.offsetWidth && (t.nativeBarWidth = t.scroller.offsetWidth - t.scroller.clientWidth, t.heightForcer.style.height = Bt(e) + "px", t.sizer.style.marginBottom = -t.nativeBarWidth + "px", t.sizer.style.borderRightWidth = Bt(e) + "px", t.scrollbarsClipped = !0)
  }

  function Mr(e) {
    if (e.hasFocus()) return null;
    var t = l();
    if (!t || !o(e.display.lineDiv, t)) return null;
    var n = {
      activeElt: t
    };
    if (window.getSelection) {
      var r = window.getSelection();
      r.anchorNode && r.extend && o(e.display.lineDiv, r.anchorNode) && (n.anchorNode = r.anchorNode, n.anchorOffset = r.anchorOffset, n.focusNode = r.focusNode, n.focusOffset = r.focusOffset)
    }
    return n
  }

  function Or(e) {
    if (e && e.activeElt && e.activeElt != l() && (e.activeElt.focus(), e.anchorNode && o(document.body, e.anchorNode) && o(document.body, e.focusNode))) {
      var t = window.getSelection(),
        n = document.createRange();
      n.setEnd(e.anchorNode, e.anchorOffset), n.collapse(!1), t.removeAllRanges(), t.addRange(n), t.extend(e.focusNode, e.focusOffset)
    }
  }

  function Nr(e, n) {
    var r = e.display,
      i = e.doc;
    if (n.editorIsHidden) return xr(e), !1;
    if (!n.force && n.visible.from >= r.viewFrom && n.visible.to <= r.viewTo && (null == r.updateLineNumbers || r.updateLineNumbers >= r.viewTo) && r.renderedView == r.view && 0 == kr(e)) return !1;
    qn(e) && (xr(e), n.dims = Cn(e));
    var o = i.first + i.size,
      l = Math.max(n.visible.from - e.options.viewportMargin, i.first),
      a = Math.min(o, n.visible.to + e.options.viewportMargin);
    r.viewFrom < l && l - r.viewFrom < 20 && (l = Math.max(i.first, r.viewFrom)), r.viewTo > a && r.viewTo - a < 20 && (a = Math.min(o, r.viewTo)), ea && (l = ge(e.doc, l), a = me(e.doc, a));
    var s = l != r.viewFrom || a != r.viewTo || r.lastWrapHeight != n.wrapperHeight || r.lastWrapWidth != n.wrapperWidth;
    Cr(e, l, a), r.viewOffset = be(M(e.doc, r.viewFrom)), e.display.mover.style.top = r.viewOffset + "px";
    var c = kr(e);
    if (!s && 0 == c && !n.force && r.renderedView == r.view && (null == r.updateLineNumbers || r.updateLineNumbers >= r.viewTo)) return !1;
    var u = Mr(e);
    return c > 4 && (r.lineDiv.style.display = "none"), Dr(e, r.updateLineNumbers, n.dims), c > 4 && (r.lineDiv.style.display = ""), r.renderedView = r.view, Or(u), t(r.cursorDiv), t(r.selectionDiv), r.gutters.style.height = r.sizer.style.minHeight = 0, s && (r.lastWrapHeight = n.wrapperHeight, r.lastWrapWidth = n.wrapperWidth, Sr(e, 400)), r.updateLineNumbers = null, !0
  }

  function Ar(e, t) {
    for (var n = t.viewport, r = !0;
      (r && e.options.lineWrapping && t.oldDisplayWidth != jt(e) || (n && null != n.top && (n = {
        top: Math.min(e.doc.height + Rt(e.display) - qt(e), n.top)
      }), t.visible = Bn(e.display, e.doc, n), !(t.visible.from >= e.display.viewFrom && t.visible.to <= e.display.viewTo))) && Nr(e, t); r = !1) {
      Rn(e);
      var i = nr(e);
      On(e), rr(e, i), Fr(e, i), t.force = !1
    }
    t.signal(e, "update", e), e.display.viewFrom == e.display.reportedViewFrom && e.display.viewTo == e.display.reportedViewTo || (t.signal(e, "viewportChange", e, e.display.viewFrom, e.display.viewTo), e.display.reportedViewFrom = e.display.viewFrom, e.display.reportedViewTo = e.display.viewTo)
  }

  function Pr(e, t) {
    var n = new Oa(e, t);
    if (Nr(e, n)) {
      Rn(e), Ar(e, n);
      var r = nr(e);
      On(e), rr(e, r), Fr(e, r), n.finish()
    }
  }

  function Dr(e, n, r) {
    function i(t) {
      var n = t.nextSibling;
      return kl && Hl && e.display.currentWheelTarget == t ? t.style.display = "none" : t.parentNode.removeChild(t), n
    }
    for (var o = e.display, l = e.options.lineNumbers, a = o.lineDiv, s = a.firstChild, c = o.view, u = o.viewFrom, f = 0; f < c.length; f++) {
      var h = c[f];
      if (h.hidden);
      else if (h.node && h.node.parentNode == a) {
        for (; s != h.node;) s = i(s);
        var p = l && null != n && n <= u && h.lineNumber;
        h.changes && (d(h.changes, "gutter") > -1 && (p = !1), kt(e, h, u, r)), p && (t(h.lineNumber), h.lineNumber.appendChild(document.createTextNode(F(e.options, u)))), s = h.node.nextSibling
      } else {
        var g = Pt(e, h, u, r);
        a.insertBefore(g, s)
      }
      u += h.size
    }
    for (; s;) s = i(s)
  }

  function Hr(e) {
    var t = e.display.gutters.offsetWidth;
    e.display.sizer.style.marginLeft = t + "px"
  }

  function Fr(e, t) {
    e.display.sizer.style.minHeight = t.docHeight + "px", e.display.heightForcer.style.top = t.docHeight + "px", e.display.gutters.style.height = t.docHeight + e.display.barHeight + Bt(e) + "px"
  }

  function Wr(e) {
    var n = e.display.gutters,
      i = e.options.gutters;
    t(n);
    for (var o = 0; o < i.length; ++o) {
      var l = i[o],
        a = n.appendChild(r("div", null, "CodeMirror-gutter " + l));
      "CodeMirror-linenumbers" == l && (e.display.lineGutter = a, a.style.width = (e.display.lineNumWidth || 1) + "px")
    }
    n.style.display = o ? "" : "none", Hr(e)
  }

  function Er(e) {
    var t = d(e.gutters, "CodeMirror-linenumbers");
    t == -1 && e.lineNumbers ? e.gutters = e.gutters.concat(["CodeMirror-linenumbers"]) : t > -1 && !e.lineNumbers && (e.gutters = e.gutters.slice(0), e.gutters.splice(t, 1))
  }

  function Ir(e) {
    var t = e.wheelDeltaX,
      n = e.wheelDeltaY;
    return null == t && e.detail && e.axis == e.HORIZONTAL_AXIS && (t = e.detail), null == n && e.detail && e.axis == e.VERTICAL_AXIS ? n = e.detail : null == n && (n = e.wheelDelta), {
      x: t,
      y: n
    }
  }

  function Rr(e) {
    var t = Ir(e);
    return t.x *= Aa, t.y *= Aa, t
  }

  function zr(e, t) {
    var n = Ir(t),
      r = n.x,
      i = n.y,
      o = e.display,
      l = o.scroller,
      a = l.scrollWidth > l.clientWidth,
      s = l.scrollHeight > l.clientHeight;
    if (r && a || i && s) {
      if (i && Hl && kl) e: for (var c = t.target, u = o.view; c != l; c = c.parentNode)
        for (var f = 0; f < u.length; f++)
          if (u[f].node == c) {
            e.display.currentWheelTarget = c;
            break e
          } if (r && !vl && !Tl && null != Aa) return i && s && Jn(e, Math.max(0, l.scrollTop + i * Aa)), tr(e, Math.max(0, l.scrollLeft + r * Aa)), (!i || i && s) && De(t), void(o.wheelStartX = null);
      if (i && null != Aa) {
        var d = i * Aa,
          h = e.doc.scrollTop,
          p = h + o.wrapper.clientHeight;
        d < 0 ? h = Math.max(0, h + d - 50) : p = Math.min(e.doc.height, p + d + 50), Pr(e, {
          top: h,
          bottom: p
        })
      }
      Na < 20 && (null == o.wheelStartX ? (o.wheelStartX = l.scrollLeft, o.wheelStartY = l.scrollTop, o.wheelDX = r, o.wheelDY = i, setTimeout(function() {
        if (null != o.wheelStartX) {
          var e = l.scrollLeft - o.wheelStartX,
            t = l.scrollTop - o.wheelStartY,
            n = t && o.wheelDY && t / o.wheelDY || e && o.wheelDX && e / o.wheelDX;
          o.wheelStartX = o.wheelStartY = null, n && (Aa = (Aa * Na + n) / (Na + 1), ++Na)
        }
      }, 200)) : (o.wheelDX += r, o.wheelDY += i))
    }
  }

  function Br(e, t) {
    var n = e[t];
    e.sort(function(e, t) {
      return E(e.from(), t.from())
    }), t = d(e, n);
    for (var r = 1; r < e.length; r++) {
      var i = e[r],
        o = e[r - 1];
      if (E(o.to(), i.from()) >= 0) {
        var l = B(o.from(), i.from()),
          a = z(o.to(), i.to()),
          s = o.empty() ? i.from() == i.head : o.from() == o.head;
        r <= t && --t, e.splice(--r, 2, new Da(s ? a : l, s ? l : a))
      }
    }
    return new Pa(e, t)
  }

  function jr(e, t) {
    return new Pa([new Da(e, t || e)], 0)
  }

  function qr(e) {
    return e.text ? W(e.from.line + e.text.length - 1, g(e.text).length + (1 == e.text.length ? e.from.ch : 0)) : e.to
  }

  function Gr(e, t) {
    if (E(e, t.from) < 0) return e;
    if (E(e, t.to) <= 0) return qr(t);
    var n = e.line + t.text.length - (t.to.line - t.from.line) - 1,
      r = e.ch;
    return e.line == t.to.line && (r += qr(t).ch - t.to.ch), W(n, r)
  }

  function Ur(e, t) {
    for (var n = [], r = 0; r < e.sel.ranges.length; r++) {
      var i = e.sel.ranges[r];
      n.push(new Da(Gr(i.anchor, t), Gr(i.head, t)))
    }
    return Br(n, e.sel.primIndex)
  }

  function Kr(e, t, n) {
    return e.line == t.line ? W(n.line, e.ch - t.ch + n.ch) : W(n.line + (e.line - t.line), e.ch)
  }

  function Vr(e, t, n) {
    for (var r = [], i = W(e.first, 0), o = i, l = 0; l < t.length; l++) {
      var a = t[l],
        s = Kr(a.from, i, o),
        c = Kr(qr(a), i, o);
      if (i = a.to, o = c, "around" == n) {
        var u = e.sel.ranges[l],
          f = E(u.head, u.anchor) < 0;
        r[l] = new Da(f ? c : s, f ? s : c)
      } else r[l] = new Da(s, s)
    }
    return new Pa(r, e.sel.primIndex);
  }

  function _r(e) {
    e.doc.mode = Ue(e.options, e.doc.modeOption), $r(e)
  }

  function $r(e) {
    e.doc.iter(function(e) {
      e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null)
    }), e.doc.modeFrontier = e.doc.highlightFrontier = e.doc.first, Sr(e, 100), e.state.modeGen++, e.curOp && yr(e)
  }

  function Xr(e, t) {
    return 0 == t.from.ch && 0 == t.to.ch && "" == g(t.text) && (!e.cm || e.cm.options.wholeLineUpdateBefore)
  }

  function Yr(e, t, n, r) {
    function i(e) {
      return n ? n[e] : null
    }

    function o(e, n, i) {
      lt(e, n, i, r), wt(e, "change", e, t)
    }

    function l(e, t) {
      for (var n = [], o = e; o < t; ++o) n.push(new va(c[o], i(o), r));
      return n
    }
    var a = t.from,
      s = t.to,
      c = t.text,
      u = M(e, a.line),
      f = M(e, s.line),
      d = g(c),
      h = i(c.length - 1),
      p = s.line - a.line;
    if (t.full) e.insert(0, l(0, c.length)), e.remove(c.length, e.size - c.length);
    else if (Xr(e, t)) {
      var m = l(0, c.length - 1);
      o(f, f.text, h), p && e.remove(a.line, p), m.length && e.insert(a.line, m)
    } else if (u == f)
      if (1 == c.length) o(u, u.text.slice(0, a.ch) + d + u.text.slice(s.ch), h);
      else {
        var v = l(1, c.length - 1);
        v.push(new va(d + u.text.slice(s.ch), h, r)), o(u, u.text.slice(0, a.ch) + c[0], i(0)), e.insert(a.line + 1, v)
      }
    else if (1 == c.length) o(u, u.text.slice(0, a.ch) + c[0] + f.text.slice(s.ch), i(0)), e.remove(a.line + 1, p);
    else {
      o(u, u.text.slice(0, a.ch) + c[0], i(0)), o(f, d + f.text.slice(s.ch), h);
      var y = l(1, c.length - 1);
      p > 1 && e.remove(a.line + 1, p - 1), e.insert(a.line + 1, y)
    }
    wt(e, "change", e, t)
  }

  function Zr(e, t, n) {
    function r(e, i, o) {
      if (e.linked)
        for (var l = 0; l < e.linked.length; ++l) {
          var a = e.linked[l];
          if (a.doc != i) {
            var s = o && a.sharedHist;
            n && !s || (t(a.doc, s), r(a.doc, e, s))
          }
        }
    }
    r(e, null, !0)
  }

  function Qr(e, t) {
    if (t.cm) throw new Error("This document is already in use.");
    e.doc = t, t.cm = e, Ln(e), _r(e), Jr(e), e.options.lineWrapping || we(e), e.options.mode = t.modeOption, yr(e)
  }

  function Jr(e) {
    ("rtl" == e.doc.direction ? a : Bl)(e.display.lineDiv, "CodeMirror-rtl")
  }

  function ei(e) {
    pr(e, function() {
      Jr(e), yr(e)
    })
  }

  function ti(e) {
    this.done = [], this.undone = [], this.undoDepth = 1 / 0, this.lastModTime = this.lastSelTime = 0, this.lastOp = this.lastSelOp = null, this.lastOrigin = this.lastSelOrigin = null, this.generation = this.maxGeneration = e || 1
  }

  function ni(e, t) {
    var n = {
      from: R(t.from),
      to: qr(t),
      text: O(e, t.from, t.to)
    };
    return ci(e, n, t.from.line, t.to.line + 1), Zr(e, function(e) {
      return ci(e, n, t.from.line, t.to.line + 1)
    }, !0), n
  }

  function ri(e) {
    for (; e.length;) {
      var t = g(e);
      if (!t.ranges) break;
      e.pop()
    }
  }

  function ii(e, t) {
    return t ? (ri(e.done), g(e.done)) : e.done.length && !g(e.done).ranges ? g(e.done) : e.done.length > 1 && !e.done[e.done.length - 2].ranges ? (e.done.pop(), g(e.done)) : void 0
  }

  function oi(e, t, n, r) {
    var i = e.history;
    i.undone.length = 0;
    var o, l, a = +new Date;
    if ((i.lastOp == r || i.lastOrigin == t.origin && t.origin && ("+" == t.origin.charAt(0) && i.lastModTime > a - (e.cm ? e.cm.options.historyEventDelay : 500) || "*" == t.origin.charAt(0))) && (o = ii(i, i.lastOp == r))) l = g(o.changes), 0 == E(t.from, t.to) && 0 == E(t.from, l.to) ? l.to = qr(t) : o.changes.push(ni(e, t));
    else {
      var s = g(i.done);
      for (s && s.ranges || si(e.sel, i.done), o = {
          changes: [ni(e, t)],
          generation: i.generation
        }, i.done.push(o); i.done.length > i.undoDepth;) i.done.shift(), i.done[0].ranges || i.done.shift()
    }
    i.done.push(n), i.generation = ++i.maxGeneration, i.lastModTime = i.lastSelTime = a, i.lastOp = i.lastSelOp = r, i.lastOrigin = i.lastSelOrigin = t.origin, l || Me(e, "historyAdded")
  }

  function li(e, t, n, r) {
    var i = t.charAt(0);
    return "*" == i || "+" == i && n.ranges.length == r.ranges.length && n.somethingSelected() == r.somethingSelected() && new Date - e.history.lastSelTime <= (e.cm ? e.cm.options.historyEventDelay : 500)
  }

  function ai(e, t, n, r) {
    var i = e.history,
      o = r && r.origin;
    n == i.lastSelOp || o && i.lastSelOrigin == o && (i.lastModTime == i.lastSelTime && i.lastOrigin == o || li(e, o, g(i.done), t)) ? i.done[i.done.length - 1] = t : si(t, i.done), i.lastSelTime = +new Date, i.lastSelOrigin = o, i.lastSelOp = n, r && r.clearRedo !== !1 && ri(i.undone)
  }

  function si(e, t) {
    var n = g(t);
    n && n.ranges && n.equals(e) || t.push(e)
  }

  function ci(e, t, n, r) {
    var i = t["spans_" + e.id],
      o = 0;
    e.iter(Math.max(e.first, n), Math.min(e.first + e.size, r), function(n) {
      n.markedSpans && ((i || (i = t["spans_" + e.id] = {}))[o] = n.markedSpans), ++o
    })
  }

  function ui(e) {
    if (!e) return null;
    for (var t, n = 0; n < e.length; ++n) e[n].marker.explicitlyCleared ? t || (t = e.slice(0, n)) : t && t.push(e[n]);
    return t ? t.length ? t : null : e
  }

  function fi(e, t) {
    var n = t["spans_" + e.id];
    if (!n) return null;
    for (var r = [], i = 0; i < t.text.length; ++i) r.push(ui(n[i]));
    return r
  }

  function di(e, t) {
    var n = fi(e, t),
      r = J(e, t);
    if (!n) return r;
    if (!r) return n;
    for (var i = 0; i < n.length; ++i) {
      var o = n[i],
        l = r[i];
      if (o && l) e: for (var a = 0; a < l.length; ++a) {
        for (var s = l[a], c = 0; c < o.length; ++c)
          if (o[c].marker == s.marker) continue e;
        o.push(s)
      } else l && (n[i] = l)
    }
    return n
  }

  function hi(e, t, n) {
    for (var r = [], i = 0; i < e.length; ++i) {
      var o = e[i];
      if (o.ranges) r.push(n ? Pa.prototype.deepCopy.call(o) : o);
      else {
        var l = o.changes,
          a = [];
        r.push({
          changes: a
        });
        for (var s = 0; s < l.length; ++s) {
          var c = l[s],
            u = void 0;
          if (a.push({
              from: c.from,
              to: c.to,
              text: c.text
            }), t)
            for (var f in c)(u = f.match(/^spans_(\d+)$/)) && d(t, Number(u[1])) > -1 && (g(a)[f] = c[f], delete c[f])
        }
      }
    }
    return r
  }

  function pi(e, t, n, r) {
    if (r) {
      var i = e.anchor;
      if (n) {
        var o = E(t, i) < 0;
        o != E(n, i) < 0 ? (i = t, t = n) : o != E(t, n) < 0 && (t = n)
      }
      return new Da(i, t)
    }
    return new Da(n || t, t)
  }

  function gi(e, t, n, r, i) {
    null == i && (i = e.cm && (e.cm.display.shift || e.extend)), wi(e, new Pa([pi(e.sel.primary(), t, n, i)], 0), r)
  }

  function mi(e, t, n) {
    for (var r = [], i = e.cm && (e.cm.display.shift || e.extend), o = 0; o < e.sel.ranges.length; o++) r[o] = pi(e.sel.ranges[o], t[o], null, i);
    var l = Br(r, e.sel.primIndex);
    wi(e, l, n)
  }

  function vi(e, t, n, r) {
    var i = e.sel.ranges.slice(0);
    i[t] = n, wi(e, Br(i, e.sel.primIndex), r)
  }

  function yi(e, t, n, r) {
    wi(e, jr(t, n), r)
  }

  function bi(e, t, n) {
    var r = {
      ranges: t.ranges,
      update: function(t) {
        var n = this;
        this.ranges = [];
        for (var r = 0; r < t.length; r++) n.ranges[r] = new Da(q(e, t[r].anchor), q(e, t[r].head))
      },
      origin: n && n.origin
    };
    return Me(e, "beforeSelectionChange", e, r), e.cm && Me(e.cm, "beforeSelectionChange", e.cm, r), r.ranges != t.ranges ? Br(r.ranges, r.ranges.length - 1) : t
  }

  function xi(e, t, n) {
    var r = e.history.done,
      i = g(r);
    i && i.ranges ? (r[r.length - 1] = t, Ci(e, t, n)) : wi(e, t, n)
  }

  function wi(e, t, n) {
    Ci(e, t, n), ai(e, e.sel, e.cm ? e.cm.curOp.id : NaN, n)
  }

  function Ci(e, t, n) {
    (Ae(e, "beforeSelectionChange") || e.cm && Ae(e.cm, "beforeSelectionChange")) && (t = bi(e, t, n));
    var r = n && n.bias || (E(t.primary().head, e.sel.primary().head) < 0 ? -1 : 1);
    ki(e, Li(e, t, r, !0)), n && n.scroll === !1 || !e.cm || $n(e.cm)
  }

  function ki(e, t) {
    t.equals(e.sel) || (e.sel = t, e.cm && (e.cm.curOp.updateInput = e.cm.curOp.selectionChanged = !0, Ne(e.cm)), wt(e, "cursorActivity", e))
  }

  function Si(e) {
    ki(e, Li(e, e.sel, null, !1))
  }

  function Li(e, t, n, r) {
    for (var i, o = 0; o < t.ranges.length; o++) {
      var l = t.ranges[o],
        a = t.ranges.length == e.sel.ranges.length && e.sel.ranges[o],
        s = Mi(e, l.anchor, a && a.anchor, n, r),
        c = Mi(e, l.head, a && a.head, n, r);
      (i || s != l.anchor || c != l.head) && (i || (i = t.ranges.slice(0, o)), i[o] = new Da(s, c))
    }
    return i ? Br(i, t.primIndex) : t
  }

  function Ti(e, t, n, r, i) {
    var o = M(e, t.line);
    if (o.markedSpans)
      for (var l = 0; l < o.markedSpans.length; ++l) {
        var a = o.markedSpans[l],
          s = a.marker;
        if ((null == a.from || (s.inclusiveLeft ? a.from <= t.ch : a.from < t.ch)) && (null == a.to || (s.inclusiveRight ? a.to >= t.ch : a.to > t.ch))) {
          if (i && (Me(s, "beforeCursorEnter"), s.explicitlyCleared)) {
            if (o.markedSpans) {
              --l;
              continue
            }
            break
          }
          if (!s.atomic) continue;
          if (n) {
            var c = s.find(r < 0 ? 1 : -1),
              u = void 0;
            if ((r < 0 ? s.inclusiveRight : s.inclusiveLeft) && (c = Oi(e, c, -r, c && c.line == t.line ? o : null)), c && c.line == t.line && (u = E(c, n)) && (r < 0 ? u < 0 : u > 0)) return Ti(e, c, t, r, i)
          }
          var f = s.find(r < 0 ? -1 : 1);
          return (r < 0 ? s.inclusiveLeft : s.inclusiveRight) && (f = Oi(e, f, r, f.line == t.line ? o : null)), f ? Ti(e, f, t, r, i) : null
        }
      }
    return t
  }

  function Mi(e, t, n, r, i) {
    var o = r || 1,
      l = Ti(e, t, n, o, i) || !i && Ti(e, t, n, o, !0) || Ti(e, t, n, -o, i) || !i && Ti(e, t, n, -o, !0);
    return l ? l : (e.cantEdit = !0, W(e.first, 0))
  }

  function Oi(e, t, n, r) {
    return n < 0 && 0 == t.ch ? t.line > e.first ? q(e, W(t.line - 1)) : null : n > 0 && t.ch == (r || M(e, t.line)).text.length ? t.line < e.first + e.size - 1 ? W(t.line + 1, 0) : null : new W(t.line, t.ch + n)
  }

  function Ni(e) {
    e.setSelection(W(e.firstLine(), 0), W(e.lastLine()), _l)
  }

  function Ai(e, t, n) {
    var r = {
      canceled: !1,
      from: t.from,
      to: t.to,
      text: t.text,
      origin: t.origin,
      cancel: function() {
        return r.canceled = !0
      }
    };
    return n && (r.update = function(t, n, i, o) {
      t && (r.from = q(e, t)), n && (r.to = q(e, n)), i && (r.text = i), void 0 !== o && (r.origin = o)
    }), Me(e, "beforeChange", e, r), e.cm && Me(e.cm, "beforeChange", e.cm, r), r.canceled ? null : {
      from: r.from,
      to: r.to,
      text: r.text,
      origin: r.origin
    }
  }

  function Pi(e, t, n) {
    if (e.cm) {
      if (!e.cm.curOp) return gr(e.cm, Pi)(e, t, n);
      if (e.cm.state.suppressEdits) return
    }
    if (!(Ae(e, "beforeChange") || e.cm && Ae(e.cm, "beforeChange")) || (t = Ai(e, t, !0))) {
      var r = Jl && !n && te(e, t.from, t.to);
      if (r)
        for (var i = r.length - 1; i >= 0; --i) Di(e, {
          from: r[i].from,
          to: r[i].to,
          text: i ? [""] : t.text,
          origin: t.origin
        });
      else Di(e, t)
    }
  }

  function Di(e, t) {
    if (1 != t.text.length || "" != t.text[0] || 0 != E(t.from, t.to)) {
      var n = Ur(e, t);
      oi(e, t, n, e.cm ? e.cm.curOp.id : NaN), Wi(e, t, n, J(e, t));
      var r = [];
      Zr(e, function(e, n) {
        n || d(r, e.history) != -1 || (Bi(e.history, t), r.push(e.history)), Wi(e, t, null, J(e, t))
      })
    }
  }

  function Hi(e, t, n) {
    var r = e.cm && e.cm.state.suppressEdits;
    if (!r || n) {
      for (var i, o = e.history, l = e.sel, a = "undo" == t ? o.done : o.undone, s = "undo" == t ? o.undone : o.done, c = 0; c < a.length && (i = a[c], n ? !i.ranges || i.equals(e.sel) : i.ranges); c++);
      if (c != a.length) {
        for (o.lastOrigin = o.lastSelOrigin = null;;) {
          if (i = a.pop(), !i.ranges) {
            if (r) return void a.push(i);
            break
          }
          if (si(i, s), n && !i.equals(e.sel)) return void wi(e, i, {
            clearRedo: !1
          });
          l = i
        }
        var u = [];
        si(l, s), s.push({
          changes: u,
          generation: o.generation
        }), o.generation = i.generation || ++o.maxGeneration;
        for (var f = Ae(e, "beforeChange") || e.cm && Ae(e.cm, "beforeChange"), h = function(n) {
            var r = i.changes[n];
            if (r.origin = t, f && !Ai(e, r, !1)) return a.length = 0, {};
            u.push(ni(e, r));
            var o = n ? Ur(e, r) : g(a);
            Wi(e, r, o, di(e, r)), !n && e.cm && e.cm.scrollIntoView({
              from: r.from,
              to: qr(r)
            });
            var l = [];
            Zr(e, function(e, t) {
              t || d(l, e.history) != -1 || (Bi(e.history, r), l.push(e.history)), Wi(e, r, null, di(e, r))
            })
          }, p = i.changes.length - 1; p >= 0; --p) {
          var m = h(p);
          if (m) return m.v
        }
      }
    }
  }

  function Fi(e, t) {
    if (0 != t && (e.first += t, e.sel = new Pa(m(e.sel.ranges, function(e) {
        return new Da(W(e.anchor.line + t, e.anchor.ch), W(e.head.line + t, e.head.ch))
      }), e.sel.primIndex), e.cm)) {
      yr(e.cm, e.first, e.first - t, t);
      for (var n = e.cm.display, r = n.viewFrom; r < n.viewTo; r++) br(e.cm, r, "gutter")
    }
  }

  function Wi(e, t, n, r) {
    if (e.cm && !e.cm.curOp) return gr(e.cm, Wi)(e, t, n, r);
    if (t.to.line < e.first) return void Fi(e, t.text.length - 1 - (t.to.line - t.from.line));
    if (!(t.from.line > e.lastLine())) {
      if (t.from.line < e.first) {
        var i = t.text.length - 1 - (e.first - t.from.line);
        Fi(e, i), t = {
          from: W(e.first, 0),
          to: W(t.to.line + i, t.to.ch),
          text: [g(t.text)],
          origin: t.origin
        }
      }
      var o = e.lastLine();
      t.to.line > o && (t = {
        from: t.from,
        to: W(o, M(e, o).text.length),
        text: [t.text[0]],
        origin: t.origin
      }), t.removed = O(e, t.from, t.to), n || (n = Ur(e, t)), e.cm ? Ei(e.cm, t, r) : Yr(e, t, r), Ci(e, n, _l)
    }
  }

  function Ei(e, t, n) {
    var r = e.doc,
      i = e.display,
      o = t.from,
      l = t.to,
      a = !1,
      s = o.line;
    e.options.lineWrapping || (s = P(de(M(r, o.line))), r.iter(s, l.line + 1, function(e) {
      if (e == i.maxLine) return a = !0, !0
    })), r.sel.contains(t.from, t.to) > -1 && Ne(e), Yr(r, t, n, Sn(e)), e.options.lineWrapping || (r.iter(s, o.line + t.text.length, function(e) {
      var t = xe(e);
      t > i.maxLineLength && (i.maxLine = e, i.maxLineLength = t, i.maxLineChanged = !0, a = !1)
    }), a && (e.curOp.updateMaxLine = !0)), ot(r, o.line), Sr(e, 400);
    var c = t.text.length - (l.line - o.line) - 1;
    t.full ? yr(e) : o.line != l.line || 1 != t.text.length || Xr(e.doc, t) ? yr(e, o.line, l.line + 1, c) : br(e, o.line, "text");
    var u = Ae(e, "changes"),
      f = Ae(e, "change");
    if (f || u) {
      var d = {
        from: o,
        to: l,
        text: t.text,
        removed: t.removed,
        origin: t.origin
      };
      f && wt(e, "change", e, d), u && (e.curOp.changeObjs || (e.curOp.changeObjs = [])).push(d)
    }
    e.display.selForContextMenu = null
  }

  function Ii(e, t, n, r, i) {
    if (r || (r = n), E(r, n) < 0) {
      var o;
      o = [r, n], n = o[0], r = o[1]
    }
    "string" == typeof t && (t = e.splitLines(t)), Pi(e, {
      from: n,
      to: r,
      text: t,
      origin: i
    })
  }

  function Ri(e, t, n, r) {
    n < e.line ? e.line += r : t < e.line && (e.line = t, e.ch = 0)
  }

  function zi(e, t, n, r) {
    for (var i = 0; i < e.length; ++i) {
      var o = e[i],
        l = !0;
      if (o.ranges) {
        o.copied || (o = e[i] = o.deepCopy(), o.copied = !0);
        for (var a = 0; a < o.ranges.length; a++) Ri(o.ranges[a].anchor, t, n, r), Ri(o.ranges[a].head, t, n, r)
      } else {
        for (var s = 0; s < o.changes.length; ++s) {
          var c = o.changes[s];
          if (n < c.from.line) c.from = W(c.from.line + r, c.from.ch), c.to = W(c.to.line + r, c.to.ch);
          else if (t <= c.to.line) {
            l = !1;
            break
          }
        }
        l || (e.splice(0, i + 1), i = 0)
      }
    }
  }

  function Bi(e, t) {
    var n = t.from.line,
      r = t.to.line,
      i = t.text.length - (r - n) - 1;
    zi(e.done, n, r, i), zi(e.undone, n, r, i)
  }

  function ji(e, t, n, r) {
    var i = t,
      o = t;
    return "number" == typeof t ? o = M(e, j(e, t)) : i = P(t), null == i ? null : (r(o, i) && e.cm && br(e.cm, i, n), o)
  }

  function qi(e) {
    var t = this;
    this.lines = e, this.parent = null;
    for (var n = 0, r = 0; r < e.length; ++r) e[r].parent = t, n += e[r].height;
    this.height = n
  }

  function Gi(e) {
    var t = this;
    this.children = e;
    for (var n = 0, r = 0, i = 0; i < e.length; ++i) {
      var o = e[i];
      n += o.chunkSize(), r += o.height, o.parent = t
    }
    this.size = n, this.height = r, this.parent = null
  }

  function Ui(e, t, n) {
    be(t) < (e.curOp && e.curOp.scrollTop || e.doc.scrollTop) && _n(e, n)
  }

  function Ki(e, t, n, r) {
    var i = new Ha(e, n, r),
      o = e.cm;
    return o && i.noHScroll && (o.display.alignWidgets = !0), ji(e, t, "widget", function(t) {
      var n = t.widgets || (t.widgets = []);
      if (null == i.insertAt ? n.push(i) : n.splice(Math.min(n.length - 1, Math.max(0, i.insertAt)), 0, i), i.line = t, o && !ve(e, t)) {
        var r = be(t) < e.scrollTop;
        A(t, t.height + Wt(i)), r && _n(o, i.height), o.curOp.forceUpdate = !0
      }
      return !0
    }), o && wt(o, "lineWidgetAdded", o, i, "number" == typeof t ? t : P(t)), i
  }

  function Vi(e, t, n, r, o) {
    if (r && r.shared) return _i(e, t, n, r, o);
    if (e.cm && !e.cm.curOp) return gr(e.cm, Vi)(e, t, n, r, o);
    var l = new Wa(e, o),
      a = E(t, n);
    if (r && u(r, l, !1), a > 0 || 0 == a && l.clearWhenEmpty !== !1) return l;
    if (l.replacedWith && (l.collapsed = !0, l.widgetNode = i("span", [l.replacedWith], "CodeMirror-widget"), r.handleMouseEvents || l.widgetNode.setAttribute("cm-ignore-events", "true"), r.insertLeft && (l.widgetNode.insertLeft = !0)), l.collapsed) {
      if (fe(e, t.line, t, n, l) || t.line != n.line && fe(e, n.line, t, n, l)) throw new Error("Inserting collapsed marker partially overlapping an existing one");
      V()
    }
    l.addToHistory && oi(e, {
      from: t,
      to: n,
      origin: "markText"
    }, e.sel, NaN);
    var s, c = t.line,
      f = e.cm;
    if (e.iter(c, n.line + 1, function(e) {
        f && l.collapsed && !f.options.lineWrapping && de(e) == f.display.maxLine && (s = !0), l.collapsed && c != t.line && A(e, 0), Y(e, new _(l, c == t.line ? t.ch : null, c == n.line ? n.ch : null)), ++c
      }), l.collapsed && e.iter(t.line, n.line + 1, function(t) {
        ve(e, t) && A(t, 0)
      }), l.clearOnEnter && ia(l, "beforeCursorEnter", function() {
        return l.clear()
      }), l.readOnly && (K(), (e.history.done.length || e.history.undone.length) && e.clearHistory()), l.collapsed && (l.id = ++Fa, l.atomic = !0), f) {
      if (s && (f.curOp.updateMaxLine = !0), l.collapsed) yr(f, t.line, n.line + 1);
      else if (l.className || l.title || l.startStyle || l.endStyle || l.css)
        for (var d = t.line; d <= n.line; d++) br(f, d, "text");
      l.atomic && Si(f.doc), wt(f, "markerAdded", f, l)
    }
    return l
  }

  function _i(e, t, n, r, i) {
    r = u(r), r.shared = !1;
    var o = [Vi(e, t, n, r, i)],
      l = o[0],
      a = r.widgetNode;
    return Zr(e, function(e) {
      a && (r.widgetNode = a.cloneNode(!0)), o.push(Vi(e, q(e, t), q(e, n), r, i));
      for (var s = 0; s < e.linked.length; ++s)
        if (e.linked[s].isParent) return;
      l = g(o)
    }), new Ea(o, l)
  }

  function $i(e) {
    return e.findMarks(W(e.first, 0), e.clipPos(W(e.lastLine())), function(e) {
      return e.parent
    })
  }

  function Xi(e, t) {
    for (var n = 0; n < t.length; n++) {
      var r = t[n],
        i = r.find(),
        o = e.clipPos(i.from),
        l = e.clipPos(i.to);
      if (E(o, l)) {
        var a = Vi(e, o, l, r.primary, r.primary.type);
        r.markers.push(a), a.parent = r
      }
    }
  }

  function Yi(e) {
    for (var t = function(t) {
        var n = e[t],
          r = [n.primary.doc];
        Zr(n.primary.doc, function(e) {
          return r.push(e)
        });
        for (var i = 0; i < n.markers.length; i++) {
          var o = n.markers[i];
          d(r, o.doc) == -1 && (o.parent = null, n.markers.splice(i--, 1))
        }
      }, n = 0; n < e.length; n++) t(n)
  }

  function Zi(e) {
    var t = this;
    if (eo(t), !Oe(t, e) && !Et(t.display, e)) {
      De(e), wl && (za = +new Date);
      var n = Tn(t, e, !0),
        r = e.dataTransfer.files;
      if (n && !t.isReadOnly())
        if (r && r.length && window.FileReader && window.File)
          for (var i = r.length, o = Array(i), l = 0, a = function(e, r) {
              if (!t.options.allowDropFileTypes || d(t.options.allowDropFileTypes, e.type) != -1) {
                var a = new FileReader;
                a.onload = gr(t, function() {
                  var e = a.result;
                  if (/[\x00-\x08\x0e-\x1f]{2}/.test(e) && (e = ""), o[r] = e, ++l == i) {
                    n = q(t.doc, n);
                    var s = {
                      from: n,
                      to: n,
                      text: t.doc.splitLines(o.join(t.doc.lineSeparator())),
                      origin: "paste"
                    };
                    Pi(t.doc, s), xi(t.doc, jr(n, qr(s)))
                  }
                }), a.readAsText(e)
              }
            }, s = 0; s < i; ++s) a(r[s], s);
        else {
          if (t.state.draggingText && t.doc.sel.contains(n) > -1) return t.state.draggingText(e), void setTimeout(function() {
            return t.display.input.focus()
          }, 20);
          try {
            var c = e.dataTransfer.getData("Text");
            if (c) {
              var u;
              if (t.state.draggingText && !t.state.draggingText.copy && (u = t.listSelections()), Ci(t.doc, jr(n, n)), u)
                for (var f = 0; f < u.length; ++f) Ii(t.doc, "", u[f].anchor, u[f].head, "drag");
              t.replaceSelection(c, "around", "paste"), t.display.input.focus()
            }
          } catch (e) {}
        }
    }
  }

  function Qi(e, t) {
    if (wl && (!e.state.draggingText || +new Date - za < 100)) return void We(t);
    if (!Oe(e, t) && !Et(e.display, t) && (t.dataTransfer.setData("Text", e.getSelection()), t.dataTransfer.effectAllowed = "copyMove", t.dataTransfer.setDragImage && !Ml)) {
      var n = r("img", null, null, "position: fixed; left: 0; top: 0;");
      n.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", Tl && (n.width = n.height = 1, e.display.wrapper.appendChild(n), n._top = n.offsetTop), t.dataTransfer.setDragImage(n, 0, 0), Tl && n.parentNode.removeChild(n)
    }
  }

  function Ji(e, t) {
    var i = Tn(e, t);
    if (i) {
      var o = document.createDocumentFragment();
      An(e, i, o), e.display.dragCursor || (e.display.dragCursor = r("div", null, "CodeMirror-cursors CodeMirror-dragcursors"), e.display.lineSpace.insertBefore(e.display.dragCursor, e.display.cursorDiv)), n(e.display.dragCursor, o)
    }
  }

  function eo(e) {
    e.display.dragCursor && (e.display.lineSpace.removeChild(e.display.dragCursor), e.display.dragCursor = null)
  }

  function to(e) {
    if (document.getElementsByClassName)
      for (var t = document.getElementsByClassName("CodeMirror"), n = 0; n < t.length; n++) {
        var r = t[n].CodeMirror;
        r && e(r)
      }
  }

  function no() {
    Ba || (ro(), Ba = !0)
  }

  function ro() {
    var e;
    ia(window, "resize", function() {
      null == e && (e = setTimeout(function() {
        e = null, to(io)
      }, 100))
    }), ia(window, "blur", function() {
      return to(In)
    })
  }

  function io(e) {
    var t = e.display;
    t.lastWrapHeight == t.wrapper.clientHeight && t.lastWrapWidth == t.wrapper.clientWidth || (t.cachedCharWidth = t.cachedTextHeight = t.cachedPaddingH = null, t.scrollbarsClipped = !1, e.setSize())
  }

  function oo(e) {
    var t = e.split(/-(?!$)/);
    e = t[t.length - 1];
    for (var n, r, i, o, l = 0; l < t.length - 1; l++) {
      var a = t[l];
      if (/^(cmd|meta|m)$/i.test(a)) o = !0;
      else if (/^a(lt)?$/i.test(a)) n = !0;
      else if (/^(c|ctrl|control)$/i.test(a)) r = !0;
      else {
        if (!/^s(hift)?$/i.test(a)) throw new Error("Unrecognized modifier name: " + a);
        i = !0
      }
    }
    return n && (e = "Alt-" + e), r && (e = "Ctrl-" + e), o && (e = "Cmd-" + e), i && (e = "Shift-" + e), e
  }

  function lo(e) {
    var t = {};
    for (var n in e)
      if (e.hasOwnProperty(n)) {
        var r = e[n];
        if (/^(name|fallthrough|(de|at)tach)$/.test(n)) continue;
        if ("..." == r) {
          delete e[n];
          continue
        }
        for (var i = m(n.split(" "), oo), o = 0; o < i.length; o++) {
          var l = void 0,
            a = void 0;
          o == i.length - 1 ? (a = i.join(" "), l = r) : (a = i.slice(0, o + 1).join(" "), l = "...");
          var s = t[a];
          if (s) {
            if (s != l) throw new Error("Inconsistent bindings for " + a)
          } else t[a] = l
        }
        delete e[n]
      } for (var c in t) e[c] = t[c];
    return e
  }

  function ao(e, t, n, r) {
    t = fo(t);
    var i = t.call ? t.call(e, r) : t[e];
    if (i === !1) return "nothing";
    if ("..." === i) return "multi";
    if (null != i && n(i)) return "handled";
    if (t.fallthrough) {
      if ("[object Array]" != Object.prototype.toString.call(t.fallthrough)) return ao(e, t.fallthrough, n, r);
      for (var o = 0; o < t.fallthrough.length; o++) {
        var l = ao(e, t.fallthrough[o], n, r);
        if (l) return l
      }
    }
  }

  function so(e) {
    var t = "string" == typeof e ? e : ja[e.keyCode];
    return "Ctrl" == t || "Alt" == t || "Shift" == t || "Mod" == t
  }

  function co(e, t, n) {
    var r = e;
    return t.altKey && "Alt" != r && (e = "Alt-" + e), (Rl ? t.metaKey : t.ctrlKey) && "Ctrl" != r && (e = "Ctrl-" + e), (Rl ? t.ctrlKey : t.metaKey) && "Cmd" != r && (e = "Cmd-" + e), !n && t.shiftKey && "Shift" != r && (e = "Shift-" + e), e
  }

  function uo(e, t) {
    if (Tl && 34 == e.keyCode && e["char"]) return !1;
    var n = ja[e.keyCode];
    return null != n && !e.altGraphKey && (3 == e.keyCode && e.code && (n = e.code), co(n, e, t))
  }

  function fo(e) {
    return "string" == typeof e ? Ka[e] : e
  }

  function ho(e, t) {
    for (var n = e.doc.sel.ranges, r = [], i = 0; i < n.length; i++) {
      for (var o = t(n[i]); r.length && E(o.from, g(r).to) <= 0;) {
        var l = r.pop();
        if (E(l.from, o.from) < 0) {
          o.from = l.from;
          break
        }
      }
      r.push(o)
    }
    pr(e, function() {
      for (var t = r.length - 1; t >= 0; t--) Ii(e.doc, "", r[t].from, r[t].to, "+delete");
      $n(e)
    })
  }

  function po(e, t, n) {
    var r = S(e.text, t + n, n);
    return r < 0 || r > e.text.length ? null : r
  }

  function go(e, t, n) {
    var r = po(e, t.ch, n);
    return null == r ? null : new W(t.line, r, n < 0 ? "after" : "before")
  }

  function mo(e, t, n, r, i) {
    if (e) {
      var o = Se(n, t.doc.direction);
      if (o) {
        var l, a = i < 0 ? g(o) : o[0],
          s = i < 0 == (1 == a.level),
          c = s ? "after" : "before";
        if (a.level > 0 || "rtl" == t.doc.direction) {
          var u = $t(t, n);
          l = i < 0 ? n.text.length - 1 : 0;
          var f = Xt(t, u, l).top;
          l = L(function(e) {
            return Xt(t, u, e).top == f
          }, i < 0 == (1 == a.level) ? a.from : a.to - 1, l), "before" == c && (l = po(n, l, 1))
        } else l = i < 0 ? a.to : a.from;
        return new W(r, l, c)
      }
    }
    return new W(r, i < 0 ? n.text.length : 0, i < 0 ? "before" : "after")
  }

  function vo(e, t, n, r) {
    var i = Se(t, e.doc.direction);
    if (!i) return go(t, n, r);
    n.ch >= t.text.length ? (n.ch = t.text.length, n.sticky = "before") : n.ch <= 0 && (n.ch = 0, n.sticky = "after");
    var o = ke(i, n.ch, n.sticky),
      l = i[o];
    if ("ltr" == e.doc.direction && l.level % 2 == 0 && (r > 0 ? l.to > n.ch : l.from < n.ch)) return go(t, n, r);
    var a, s = function(e, n) {
        return po(t, e instanceof W ? e.ch : e, n)
      },
      c = function(n) {
        return e.options.lineWrapping ? (a = a || $t(e, t), gn(e, t, a, n)) : {
          begin: 0,
          end: t.text.length
        }
      },
      u = c("before" == n.sticky ? s(n, -1) : n.ch);
    if ("rtl" == e.doc.direction || 1 == l.level) {
      var f = 1 == l.level == r < 0,
        d = s(n, f ? 1 : -1);
      if (null != d && (f ? d <= l.to && d <= u.end : d >= l.from && d >= u.begin)) {
        var h = f ? "before" : "after";
        return new W(n.line, d, h)
      }
    }
    var p = function(e, t, r) {
        for (var o = function(e, t) {
            return t ? new W(n.line, s(e, 1), "before") : new W(n.line, e, "after")
          }; e >= 0 && e < i.length; e += t) {
          var l = i[e],
            a = t > 0 == (1 != l.level),
            c = a ? r.begin : s(r.end, -1);
          if (l.from <= c && c < l.to) return o(c, a);
          if (c = a ? l.from : s(l.to, -1), r.begin <= c && c < r.end) return o(c, a)
        }
      },
      g = p(o + r, r, u);
    if (g) return g;
    var m = r > 0 ? u.end : s(u.begin, -1);
    return null == m || r > 0 && m == t.text.length || !(g = p(r > 0 ? 0 : i.length - 1, r, c(m))) ? null : g
  }

  function yo(e, t) {
    var n = M(e.doc, t),
      r = de(n);
    return r != n && (t = P(r)), mo(!0, e, r, t, 1)
  }

  function bo(e, t) {
    var n = M(e.doc, t),
      r = he(n);
    return r != n && (t = P(r)), mo(!0, e, n, t, -1)
  }

  function xo(e, t) {
    var n = yo(e, t.line),
      r = M(e.doc, n.line),
      i = Se(r, e.doc.direction);
    if (!i || 0 == i[0].level) {
      var o = Math.max(0, r.text.search(/\S/)),
        l = t.line == n.line && t.ch <= o && t.ch;
      return W(n.line, l ? 0 : o, n.sticky)
    }
    return n
  }

  function wo(e, t, n) {
    if ("string" == typeof t && (t = Va[t], !t)) return !1;
    e.display.input.ensurePolled();
    var r = e.display.shift,
      i = !1;
    try {
      e.isReadOnly() && (e.state.suppressEdits = !0), n && (e.display.shift = !1), i = t(e) != Vl
    } finally {
      e.display.shift = r, e.state.suppressEdits = !1
    }
    return i
  }

  function Co(e, t, n) {
    for (var r = 0; r < e.state.keyMaps.length; r++) {
      var i = ao(t, e.state.keyMaps[r], n, e);
      if (i) return i
    }
    return e.options.extraKeys && ao(t, e.options.extraKeys, n, e) || ao(t, e.options.keyMap, n, e)
  }

  function ko(e, t, n, r) {
    var i = e.state.keySeq;
    if (i) {
      if (so(t)) return "handled";
      if (/\'$/.test(t) ? e.state.keySeq = null : _a.set(50, function() {
          e.state.keySeq == i && (e.state.keySeq = null, e.display.input.reset())
        }), So(e, i + " " + t, n, r)) return !0
    }
    return So(e, t, n, r)
  }

  function So(e, t, n, r) {
    var i = Co(e, t, r);
    return "multi" == i && (e.state.keySeq = t), "handled" == i && wt(e, "keyHandled", e, t, n), "handled" != i && "multi" != i || (De(n), Hn(e)), !!i
  }

  function Lo(e, t) {
    var n = uo(t, !0);
    return !!n && (t.shiftKey && !e.state.keySeq ? ko(e, "Shift-" + n, t, function(t) {
      return wo(e, t, !0)
    }) || ko(e, n, t, function(t) {
      if ("string" == typeof t ? /^go[A-Z]/.test(t) : t.motion) return wo(e, t)
    }) : ko(e, n, t, function(t) {
      return wo(e, t)
    }))
  }

  function To(e, t, n) {
    return ko(e, "'" + n + "'", t, function(t) {
      return wo(e, t, !0)
    })
  }

  function Mo(e) {
    var t = this;
    if (t.curOp.focus = l(), !Oe(t, e)) {
      wl && Cl < 11 && 27 == e.keyCode && (e.returnValue = !1);
      var n = e.keyCode;
      t.display.shift = 16 == n || e.shiftKey;
      var r = Lo(t, e);
      Tl && ($a = r ? n : null, !r && 88 == n && !sa && (Hl ? e.metaKey : e.ctrlKey) && t.replaceSelection("", null, "cut")), 18 != n || /\bCodeMirror-crosshair\b/.test(t.display.lineDiv.className) || Oo(t)
    }
  }

  function Oo(e) {
    function t(e) {
      18 != e.keyCode && e.altKey || (Bl(n, "CodeMirror-crosshair"), Te(document, "keyup", t), Te(document, "mouseover", t))
    }
    var n = e.display.lineDiv;
    a(n, "CodeMirror-crosshair"), ia(document, "keyup", t), ia(document, "mouseover", t)
  }

  function No(e) {
    16 == e.keyCode && (this.doc.sel.shift = !1), Oe(this, e)
  }

  function Ao(e) {
    var t = this;
    if (!(Et(t.display, e) || Oe(t, e) || e.ctrlKey && !e.altKey || Hl && e.metaKey)) {
      var n = e.keyCode,
        r = e.charCode;
      if (Tl && n == $a) return $a = null, void De(e);
      if (!Tl || e.which && !(e.which < 10) || !Lo(t, e)) {
        var i = String.fromCharCode(null == r ? n : r);
        "\b" != i && (To(t, e, i) || t.display.input.onKeyPress(e))
      }
    }
  }

  function Po(e, t) {
    var n = +new Date;
    return Qa && Qa.compare(n, e, t) ? (Za = Qa = null, "triple") : Za && Za.compare(n, e, t) ? (Qa = new Ya(n, e, t), Za = null, "double") : (Za = new Ya(n, e, t), Qa = null, "single")
  }

  function Do(e) {
    var t = this,
      n = t.display;
    if (!(Oe(t, e) || n.activeTouch && n.input.supportsTouch())) {
      if (n.input.ensurePolled(), n.shift = e.shiftKey, Et(n, e)) return void(kl || (n.scroller.draggable = !1, setTimeout(function() {
        return n.scroller.draggable = !0
      }, 100)));
      if (!jo(t, e)) {
        var r = Tn(t, e),
          i = Ie(e),
          o = r ? Po(r, i) : "single";
        window.focus(), 1 == i && t.state.selectingText && t.state.selectingText(e), r && Ho(t, i, r, o, e) || (1 == i ? r ? Wo(t, r, o, e) : Ee(e) == n.scroller && De(e) : 2 == i ? (r && gi(t.doc, r), setTimeout(function() {
          return n.input.focus()
        }, 20)) : 3 == i && (zl ? qo(t, e) : Wn(t)))
      }
    }
  }

  function Ho(e, t, n, r, i) {
    var o = "Click";
    return "double" == r ? o = "Double" + o : "triple" == r && (o = "Triple" + o), o = (1 == t ? "Left" : 2 == t ? "Middle" : "Right") + o, ko(e, co(o, i), i, function(t) {
      if ("string" == typeof t && (t = Va[t]), !t) return !1;
      var r = !1;
      try {
        e.isReadOnly() && (e.state.suppressEdits = !0), r = t(e, n) != Vl
      } finally {
        e.state.suppressEdits = !1
      }
      return r
    })
  }

  function Fo(e, t, n) {
    var r = e.getOption("configureMouse"),
      i = r ? r(e, t, n) : {};
    if (null == i.unit) {
      var o = Fl ? n.shiftKey && n.metaKey : n.altKey;
      i.unit = o ? "rectangle" : "single" == t ? "char" : "double" == t ? "word" : "line"
    }
    return (null == i.extend || e.doc.extend) && (i.extend = e.doc.extend || n.shiftKey), null == i.addNew && (i.addNew = Hl ? n.metaKey : n.ctrlKey), null == i.moveOnDrag && (i.moveOnDrag = !(Hl ? n.altKey : n.ctrlKey)), i
  }

  function Wo(e, t, n, r) {
    wl ? setTimeout(c(Fn, e), 0) : e.curOp.focus = l();
    var i, o = Fo(e, n, r),
      a = e.doc.sel;
    e.options.dragDrop && oa && !e.isReadOnly() && "single" == n && (i = a.contains(t)) > -1 && (E((i = a.ranges[i]).from(), t) < 0 || t.xRel > 0) && (E(i.to(), t) > 0 || t.xRel < 0) ? Eo(e, r, t, o) : Ro(e, r, t, o)
  }

  function Eo(e, t, n, r) {
    var i = e.display,
      o = !1,
      l = gr(e, function(t) {
        kl && (i.scroller.draggable = !1), e.state.draggingText = !1, Te(i.wrapper.ownerDocument, "mouseup", l), Te(i.wrapper.ownerDocument, "mousemove", a), Te(i.scroller, "dragstart", s), Te(i.scroller, "drop", l), o || (De(t), r.addNew || gi(e.doc, n, null, null, r.extend), kl || wl && 9 == Cl ? setTimeout(function() {
          i.wrapper.ownerDocument.body.focus(), i.input.focus()
        }, 20) : i.input.focus())
      }),
      a = function(e) {
        o = o || Math.abs(t.clientX - e.clientX) + Math.abs(t.clientY - e.clientY) >= 10
      },
      s = function() {
        return o = !0
      };
    kl && (i.scroller.draggable = !0), e.state.draggingText = l, l.copy = !r.moveOnDrag, i.scroller.dragDrop && i.scroller.dragDrop(), ia(i.wrapper.ownerDocument, "mouseup", l), ia(i.wrapper.ownerDocument, "mousemove", a), ia(i.scroller, "dragstart", s), ia(i.scroller, "drop", l), Wn(e), setTimeout(function() {
      return i.input.focus()
    }, 20)
  }

  function Io(e, t, n) {
    if ("char" == n) return new Da(t, t);
    if ("word" == n) return e.findWordAt(t);
    if ("line" == n) return new Da(W(t.line, 0), q(e.doc, W(t.line + 1, 0)));
    var r = n(e, t);
    return new Da(r.from, r.to)
  }

  function Ro(e, t, n, r) {
    function i(t) {
      if (0 != E(v, t))
        if (v = t, "rectangle" == r.unit) {
          for (var i = [], o = e.options.tabSize, l = f(M(c, n.line).text, n.ch, o), a = f(M(c, t.line).text, t.ch, o), s = Math.min(l, a), g = Math.max(l, a), m = Math.min(n.line, t.line), y = Math.min(e.lastLine(), Math.max(n.line, t.line)); m <= y; m++) {
            var b = M(c, m).text,
              x = h(b, s, o);
            s == g ? i.push(new Da(W(m, x), W(m, x))) : b.length > x && i.push(new Da(W(m, x), W(m, h(b, g, o))))
          }
          i.length || i.push(new Da(n, n)), wi(c, Br(p.ranges.slice(0, d).concat(i), d), {
            origin: "*mouse",
            scroll: !1
          }), e.scrollIntoView(t)
        } else {
          var w, C = u,
            k = Io(e, t, r.unit),
            S = C.anchor;
          E(k.anchor, S) > 0 ? (w = k.head, S = B(C.from(), k.anchor)) : (w = k.anchor, S = z(C.to(), k.head));
          var L = p.ranges.slice(0);
          L[d] = zo(e, new Da(q(c, S), w)), wi(c, Br(L, d), $l)
        }
    }

    function o(t) {
      var n = ++b,
        a = Tn(e, t, !0, "rectangle" == r.unit);
      if (a)
        if (0 != E(a, v)) {
          e.curOp.focus = l(), i(a);
          var u = Bn(s, c);
          (a.line >= u.to || a.line < u.from) && setTimeout(gr(e, function() {
            b == n && o(t)
          }), 150)
        } else {
          var f = t.clientY < y.top ? -20 : t.clientY > y.bottom ? 20 : 0;
          f && setTimeout(gr(e, function() {
            b == n && (s.scroller.scrollTop += f, o(t))
          }), 50)
        }
    }

    function a(t) {
      e.state.selectingText = !1, b = 1 / 0, De(t), s.input.focus(), Te(s.wrapper.ownerDocument, "mousemove", x), Te(s.wrapper.ownerDocument, "mouseup", w), c.history.lastSelOrigin = null
    }
    var s = e.display,
      c = e.doc;
    De(t);
    var u, d, p = c.sel,
      g = p.ranges;
    if (r.addNew && !r.extend ? (d = c.sel.contains(n), u = d > -1 ? g[d] : new Da(n, n)) : (u = c.sel.primary(), d = c.sel.primIndex), "rectangle" == r.unit) r.addNew || (u = new Da(n, n)), n = Tn(e, t, !0, !0), d = -1;
    else {
      var m = Io(e, n, r.unit);
      u = r.extend ? pi(u, m.anchor, m.head, r.extend) : m
    }
    r.addNew ? d == -1 ? (d = g.length, wi(c, Br(g.concat([u]), d), {
      scroll: !1,
      origin: "*mouse"
    })) : g.length > 1 && g[d].empty() && "char" == r.unit && !r.extend ? (wi(c, Br(g.slice(0, d).concat(g.slice(d + 1)), 0), {
      scroll: !1,
      origin: "*mouse"
    }), p = c.sel) : vi(c, d, u, $l) : (d = 0, wi(c, new Pa([u], 0), $l), p = c.sel);
    var v = n,
      y = s.wrapper.getBoundingClientRect(),
      b = 0,
      x = gr(e, function(e) {
        0 !== e.buttons && Ie(e) ? o(e) : a(e)
      }),
      w = gr(e, a);
    e.state.selectingText = w, ia(s.wrapper.ownerDocument, "mousemove", x), ia(s.wrapper.ownerDocument, "mouseup", w)
  }

  function zo(e, t) {
    var n = t.anchor,
      r = t.head,
      i = M(e.doc, n.line);
    if (0 == E(n, r) && n.sticky == r.sticky) return t;
    var o = Se(i);
    if (!o) return t;
    var l = ke(o, n.ch, n.sticky),
      a = o[l];
    if (a.from != n.ch && a.to != n.ch) return t;
    var s = l + (a.from == n.ch == (1 != a.level) ? 0 : 1);
    if (0 == s || s == o.length) return t;
    var c;
    if (r.line != n.line) c = (r.line - n.line) * ("ltr" == e.doc.direction ? 1 : -1) > 0;
    else {
      var u = ke(o, r.ch, r.sticky),
        f = u - l || (r.ch - n.ch) * (1 == a.level ? -1 : 1);
      c = u == s - 1 || u == s ? f < 0 : f > 0
    }
    var d = o[s + (c ? -1 : 0)],
      h = c == (1 == d.level),
      p = h ? d.from : d.to,
      g = h ? "after" : "before";
    return n.ch == p && n.sticky == g ? t : new Da(new W(n.line, p, g), r)
  }

  function Bo(e, t, n, r) {
    var i, o;
    if (t.touches) i = t.touches[0].clientX, o = t.touches[0].clientY;
    else try {
      i = t.clientX, o = t.clientY
    } catch (t) {
      return !1
    }
    if (i >= Math.floor(e.display.gutters.getBoundingClientRect().right)) return !1;
    r && De(t);
    var l = e.display,
      a = l.lineDiv.getBoundingClientRect();
    if (o > a.bottom || !Ae(e, n)) return Fe(t);
    o -= a.top - l.viewOffset;
    for (var s = 0; s < e.options.gutters.length; ++s) {
      var c = l.gutters.childNodes[s];
      if (c && c.getBoundingClientRect().right >= i) {
        var u = D(e.doc, o),
          f = e.options.gutters[s];
        return Me(e, n, e, u, f, t), Fe(t)
      }
    }
  }

  function jo(e, t) {
    return Bo(e, t, "gutterClick", !0)
  }

  function qo(e, t) {
    Et(e.display, t) || Go(e, t) || Oe(e, t, "contextmenu") || e.display.input.onContextMenu(t)
  }

  function Go(e, t) {
    return !!Ae(e, "gutterContextMenu") && Bo(e, t, "gutterContextMenu", !1)
  }

  function Uo(e) {
    e.display.wrapper.className = e.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + e.options.theme.replace(/(^|\s)\s*/g, " cm-s-"), nn(e)
  }

  function Ko(e) {
    function t(t, r, i, o) {
      e.defaults[t] = r, i && (n[t] = o ? function(e, t, n) {
        n != Ja && i(e, t, n)
      } : i)
    }
    var n = e.optionHandlers;
    e.defineOption = t, e.Init = Ja, t("value", "", function(e, t) {
      return e.setValue(t)
    }, !0), t("mode", null, function(e, t) {
      e.doc.modeOption = t, _r(e)
    }, !0), t("indentUnit", 2, _r, !0), t("indentWithTabs", !1), t("smartIndent", !0), t("tabSize", 4, function(e) {
      $r(e), nn(e), yr(e)
    }, !0), t("lineSeparator", null, function(e, t) {
      if (e.doc.lineSep = t, t) {
        var n = [],
          r = e.doc.first;
        e.doc.iter(function(e) {
          for (var i = 0;;) {
            var o = e.text.indexOf(t, i);
            if (o == -1) break;
            i = o + t.length, n.push(W(r, o))
          }
          r++
        });
        for (var i = n.length - 1; i >= 0; i--) Ii(e.doc, t, n[i], W(n[i].line, n[i].ch + t.length))
      }
    }), t("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g, function(e, t, n) {
      e.state.specialChars = new RegExp(t.source + (t.test("\t") ? "" : "|\t"), "g"), n != Ja && e.refresh()
    }), t("specialCharPlaceholder", ut, function(e) {
      return e.refresh()
    }, !0), t("electricChars", !0), t("inputStyle", Dl ? "contenteditable" : "textarea", function() {
      throw new Error("inputStyle can not (yet) be changed in a running editor")
    }, !0), t("spellcheck", !1, function(e, t) {
      return e.getInputField().spellcheck = t
    }, !0), t("rtlMoveVisually", !Wl), t("wholeLineUpdateBefore", !0), t("theme", "default", function(e) {
      Uo(e), Vo(e)
    }, !0), t("keyMap", "default", function(e, t, n) {
      var r = fo(t),
        i = n != Ja && fo(n);
      i && i.detach && i.detach(e, r), r.attach && r.attach(e, i || null)
    }), t("extraKeys", null), t("configureMouse", null), t("lineWrapping", !1, $o, !0), t("gutters", [], function(e) {
      Er(e.options), Vo(e)
    }, !0), t("fixedGutter", !0, function(e, t) {
      e.display.gutters.style.left = t ? kn(e.display) + "px" : "0", e.refresh()
    }, !0), t("coverGutterNextToScrollbar", !1, function(e) {
      return rr(e)
    }, !0), t("scrollbarStyle", "native", function(e) {
      or(e), rr(e), e.display.scrollbars.setScrollTop(e.doc.scrollTop), e.display.scrollbars.setScrollLeft(e.doc.scrollLeft)
    }, !0), t("lineNumbers", !1, function(e) {
      Er(e.options), Vo(e)
    }, !0), t("firstLineNumber", 1, Vo, !0), t("lineNumberFormatter", function(e) {
      return e
    }, Vo, !0), t("showCursorWhenSelecting", !1, On, !0), t("resetSelectionOnContextMenu", !0), t("lineWiseCopyCut", !0), t("pasteLinesPerSelection", !0), t("readOnly", !1, function(e, t) {
      "nocursor" == t && (In(e), e.display.input.blur()), e.display.input.readOnlyChanged(t)
    }), t("disableInput", !1, function(e, t) {
      t || e.display.input.reset();
    }, !0), t("dragDrop", !0, _o), t("allowDropFileTypes", null), t("cursorBlinkRate", 530), t("cursorScrollMargin", 0), t("cursorHeight", 1, On, !0), t("singleCursorHeightPerLine", !0, On, !0), t("workTime", 100), t("workDelay", 100), t("flattenSpans", !0, $r, !0), t("addModeClass", !1, $r, !0), t("pollInterval", 100), t("undoDepth", 200, function(e, t) {
      return e.doc.history.undoDepth = t
    }), t("historyEventDelay", 1250), t("viewportMargin", 10, function(e) {
      return e.refresh()
    }, !0), t("maxHighlightLength", 1e4, $r, !0), t("moveInputWithCursor", !0, function(e, t) {
      t || e.display.input.resetPosition()
    }), t("tabindex", null, function(e, t) {
      return e.display.input.getField().tabIndex = t || ""
    }), t("autofocus", null), t("direction", "ltr", function(e, t) {
      return e.doc.setDirection(t)
    }, !0)
  }

  function Vo(e) {
    Wr(e), yr(e), jn(e)
  }

  function _o(e, t, n) {
    var r = n && n != Ja;
    if (!t != !r) {
      var i = e.display.dragFunctions,
        o = t ? ia : Te;
      o(e.display.scroller, "dragstart", i.start), o(e.display.scroller, "dragenter", i.enter), o(e.display.scroller, "dragover", i.over), o(e.display.scroller, "dragleave", i.leave), o(e.display.scroller, "drop", i.drop)
    }
  }

  function $o(e) {
    e.options.lineWrapping ? (a(e.display.wrapper, "CodeMirror-wrap"), e.display.sizer.style.minWidth = "", e.display.sizerWidth = null) : (Bl(e.display.wrapper, "CodeMirror-wrap"), we(e)), Ln(e), yr(e), nn(e), setTimeout(function() {
      return rr(e)
    }, 100)
  }

  function Xo(e, t) {
    var n = this;
    if (!(this instanceof Xo)) return new Xo(e, t);
    this.options = t = t ? u(t) : {}, u(es, t, !1), Er(t);
    var r = t.value;
    "string" == typeof r && (r = new Ra(r, t.mode, null, t.lineSeparator, t.direction)), this.doc = r;
    var i = new Xo.inputStyles[t.inputStyle](this),
      o = this.display = new T(e, r, i);
    o.wrapper.CodeMirror = this, Wr(this), Uo(this), t.lineWrapping && (this.display.wrapper.className += " CodeMirror-wrap"), or(this), this.state = {
      keyMaps: [],
      overlays: [],
      modeGen: 0,
      overwrite: !1,
      delayingBlurEvent: !1,
      focused: !1,
      suppressEdits: !1,
      pasteIncoming: !1,
      cutIncoming: !1,
      selectingText: !1,
      draggingText: !1,
      highlight: new ql,
      keySeq: null,
      specialChars: null
    }, t.autofocus && !Dl && o.input.focus(), wl && Cl < 11 && setTimeout(function() {
      return n.display.input.reset(!0)
    }, 20), Yo(this), no(), lr(this), this.curOp.forceUpdate = !0, Qr(this, r), t.autofocus && !Dl || this.hasFocus() ? setTimeout(c(En, this), 20) : In(this);
    for (var l in ts) ts.hasOwnProperty(l) && ts[l](n, t[l], Ja);
    qn(this), t.finishInit && t.finishInit(this);
    for (var a = 0; a < ns.length; ++a) ns[a](n);
    ar(this), kl && t.lineWrapping && "optimizelegibility" == getComputedStyle(o.lineDiv).textRendering && (o.lineDiv.style.textRendering = "auto")
  }

  function Yo(e) {
    function t() {
      i.activeTouch && (o = setTimeout(function() {
        return i.activeTouch = null
      }, 1e3), l = i.activeTouch, l.end = +new Date)
    }

    function n(e) {
      if (1 != e.touches.length) return !1;
      var t = e.touches[0];
      return t.radiusX <= 1 && t.radiusY <= 1
    }

    function r(e, t) {
      if (null == t.left) return !0;
      var n = t.left - e.left,
        r = t.top - e.top;
      return n * n + r * r > 400
    }
    var i = e.display;
    ia(i.scroller, "mousedown", gr(e, Do)), wl && Cl < 11 ? ia(i.scroller, "dblclick", gr(e, function(t) {
      if (!Oe(e, t)) {
        var n = Tn(e, t);
        if (n && !jo(e, t) && !Et(e.display, t)) {
          De(t);
          var r = e.findWordAt(n);
          gi(e.doc, r.anchor, r.head)
        }
      }
    })) : ia(i.scroller, "dblclick", function(t) {
      return Oe(e, t) || De(t)
    }), zl || ia(i.scroller, "contextmenu", function(t) {
      return qo(e, t)
    });
    var o, l = {
      end: 0
    };
    ia(i.scroller, "touchstart", function(t) {
      if (!Oe(e, t) && !n(t) && !jo(e, t)) {
        i.input.ensurePolled(), clearTimeout(o);
        var r = +new Date;
        i.activeTouch = {
          start: r,
          moved: !1,
          prev: r - l.end <= 300 ? l : null
        }, 1 == t.touches.length && (i.activeTouch.left = t.touches[0].pageX, i.activeTouch.top = t.touches[0].pageY)
      }
    }), ia(i.scroller, "touchmove", function() {
      i.activeTouch && (i.activeTouch.moved = !0)
    }), ia(i.scroller, "touchend", function(n) {
      var o = i.activeTouch;
      if (o && !Et(i, n) && null != o.left && !o.moved && new Date - o.start < 300) {
        var l, a = e.coordsChar(i.activeTouch, "page");
        l = !o.prev || r(o, o.prev) ? new Da(a, a) : !o.prev.prev || r(o, o.prev.prev) ? e.findWordAt(a) : new Da(W(a.line, 0), q(e.doc, W(a.line + 1, 0))), e.setSelection(l.anchor, l.head), e.focus(), De(n)
      }
      t()
    }), ia(i.scroller, "touchcancel", t), ia(i.scroller, "scroll", function() {
      i.scroller.clientHeight && (Jn(e, i.scroller.scrollTop), tr(e, i.scroller.scrollLeft, !0), Me(e, "scroll", e))
    }), ia(i.scroller, "mousewheel", function(t) {
      return zr(e, t)
    }), ia(i.scroller, "DOMMouseScroll", function(t) {
      return zr(e, t)
    }), ia(i.wrapper, "scroll", function() {
      return i.wrapper.scrollTop = i.wrapper.scrollLeft = 0
    }), i.dragFunctions = {
      enter: function(t) {
        Oe(e, t) || We(t)
      },
      over: function(t) {
        Oe(e, t) || (Ji(e, t), We(t))
      },
      start: function(t) {
        return Qi(e, t)
      },
      drop: gr(e, Zi),
      leave: function(t) {
        Oe(e, t) || eo(e)
      }
    };
    var a = i.input.getField();
    ia(a, "keyup", function(t) {
      return No.call(e, t)
    }), ia(a, "keydown", gr(e, Mo)), ia(a, "keypress", gr(e, Ao)), ia(a, "focus", function(t) {
      return En(e, t)
    }), ia(a, "blur", function(t) {
      return In(e, t)
    })
  }

  function Zo(e, t, n, r) {
    var i, o = e.doc;
    null == n && (n = "add"), "smart" == n && (o.mode.indent ? i = Ze(e, t).state : n = "prev");
    var l = e.options.tabSize,
      a = M(o, t),
      s = f(a.text, null, l);
    a.stateAfter && (a.stateAfter = null);
    var c, u = a.text.match(/^\s*/)[0];
    if (r || /\S/.test(a.text)) {
      if ("smart" == n && (c = o.mode.indent(i, a.text.slice(u.length), a.text), c == Vl || c > 150)) {
        if (!r) return;
        n = "prev"
      }
    } else c = 0, n = "not";
    "prev" == n ? c = t > o.first ? f(M(o, t - 1).text, null, l) : 0 : "add" == n ? c = s + e.options.indentUnit : "subtract" == n ? c = s - e.options.indentUnit : "number" == typeof n && (c = s + n), c = Math.max(0, c);
    var d = "",
      h = 0;
    if (e.options.indentWithTabs)
      for (var g = Math.floor(c / l); g; --g) h += l, d += "\t";
    if (h < c && (d += p(c - h)), d != u) return Ii(o, d, W(t, 0), W(t, u.length), "+input"), a.stateAfter = null, !0;
    for (var m = 0; m < o.sel.ranges.length; m++) {
      var v = o.sel.ranges[m];
      if (v.head.line == t && v.head.ch < u.length) {
        var y = W(t, u.length);
        vi(o, m, new Da(y, y));
        break
      }
    }
  }

  function Qo(e) {
    rs = e
  }

  function Jo(e, t, n, r, i) {
    var o = e.doc;
    e.display.shift = !1, r || (r = o.sel);
    var l = e.state.pasteIncoming || "paste" == i,
      a = la(t),
      s = null;
    if (l && r.ranges.length > 1)
      if (rs && rs.text.join("\n") == t) {
        if (r.ranges.length % rs.text.length == 0) {
          s = [];
          for (var c = 0; c < rs.text.length; c++) s.push(o.splitLines(rs.text[c]))
        }
      } else a.length == r.ranges.length && e.options.pasteLinesPerSelection && (s = m(a, function(e) {
        return [e]
      }));
    for (var u, f = r.ranges.length - 1; f >= 0; f--) {
      var d = r.ranges[f],
        h = d.from(),
        p = d.to();
      d.empty() && (n && n > 0 ? h = W(h.line, h.ch - n) : e.state.overwrite && !l ? p = W(p.line, Math.min(M(o, p.line).text.length, p.ch + g(a).length)) : rs && rs.lineWise && rs.text.join("\n") == t && (h = p = W(h.line, 0))), u = e.curOp.updateInput;
      var v = {
        from: h,
        to: p,
        text: s ? s[f % s.length] : a,
        origin: i || (l ? "paste" : e.state.cutIncoming ? "cut" : "+input")
      };
      Pi(e.doc, v), wt(e, "inputRead", e, v)
    }
    t && !l && tl(e, t), $n(e), e.curOp.updateInput = u, e.curOp.typing = !0, e.state.pasteIncoming = e.state.cutIncoming = !1
  }

  function el(e, t) {
    var n = e.clipboardData && e.clipboardData.getData("Text");
    if (n) return e.preventDefault(), t.isReadOnly() || t.options.disableInput || pr(t, function() {
      return Jo(t, n, 0, null, "paste")
    }), !0
  }

  function tl(e, t) {
    if (e.options.electricChars && e.options.smartIndent)
      for (var n = e.doc.sel, r = n.ranges.length - 1; r >= 0; r--) {
        var i = n.ranges[r];
        if (!(i.head.ch > 100 || r && n.ranges[r - 1].head.line == i.head.line)) {
          var o = e.getModeAt(i.head),
            l = !1;
          if (o.electricChars) {
            for (var a = 0; a < o.electricChars.length; a++)
              if (t.indexOf(o.electricChars.charAt(a)) > -1) {
                l = Zo(e, i.head.line, "smart");
                break
              }
          } else o.electricInput && o.electricInput.test(M(e.doc, i.head.line).text.slice(0, i.head.ch)) && (l = Zo(e, i.head.line, "smart"));
          l && wt(e, "electricInput", e, i.head.line)
        }
      }
  }

  function nl(e) {
    for (var t = [], n = [], r = 0; r < e.doc.sel.ranges.length; r++) {
      var i = e.doc.sel.ranges[r].head.line,
        o = {
          anchor: W(i, 0),
          head: W(i + 1, 0)
        };
      n.push(o), t.push(e.getRange(o.anchor, o.head))
    }
    return {
      text: t,
      ranges: n
    }
  }

  function rl(e, t) {
    e.setAttribute("autocorrect", "off"), e.setAttribute("autocapitalize", "off"), e.setAttribute("spellcheck", !!t)
  }

  function il() {
    var e = r("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none"),
      t = r("div", [e], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    return kl ? e.style.width = "1000px" : e.setAttribute("wrap", "off"), Al && (e.style.border = "1px solid black"), rl(e), t
  }

  function ol(e, t, n, r, i) {
    function o() {
      var r = t.line + n;
      return !(r < e.first || r >= e.first + e.size) && (t = new W(r, t.ch, t.sticky), c = M(e, r))
    }

    function l(r) {
      var l;
      if (l = i ? vo(e.cm, c, t, n) : go(c, t, n), null == l) {
        if (r || !o()) return !1;
        t = mo(i, e.cm, c, t.line, n)
      } else t = l;
      return !0
    }
    var a = t,
      s = n,
      c = M(e, t.line);
    if ("char" == r) l();
    else if ("column" == r) l(!0);
    else if ("word" == r || "group" == r)
      for (var u = null, f = "group" == r, d = e.cm && e.cm.getHelper(t, "wordChars"), h = !0; !(n < 0) || l(!h); h = !1) {
        var p = c.text.charAt(t.ch) || "\n",
          g = w(p, d) ? "w" : f && "\n" == p ? "n" : !f || /\s/.test(p) ? null : "p";
        if (!f || h || g || (g = "s"), u && u != g) {
          n < 0 && (n = 1, l(), t.sticky = "after");
          break
        }
        if (g && (u = g), n > 0 && !l(!h)) break
      }
    var m = Mi(e, t, a, s, !0);
    return I(a, m) && (m.hitSide = !0), m
  }

  function ll(e, t, n, r) {
    var i, o = e.doc,
      l = t.left;
    if ("page" == r) {
      var a = Math.min(e.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight),
        s = Math.max(a - .5 * xn(e.display), 3);
      i = (n > 0 ? t.bottom : t.top) + n * s
    } else "line" == r && (i = n > 0 ? t.bottom + 3 : t.top - 3);
    for (var c; c = hn(e, l, i), c.outside;) {
      if (n < 0 ? i <= 0 : i >= o.height) {
        c.hitSide = !0;
        break
      }
      i += 5 * n
    }
    return c
  }

  function al(e, t) {
    var n = _t(e, t.line);
    if (!n || n.hidden) return null;
    var r = M(e.doc, t.line),
      i = Ut(n, r, t.line),
      o = Se(r, e.doc.direction),
      l = "left";
    if (o) {
      var a = ke(o, t.ch);
      l = a % 2 ? "right" : "left"
    }
    var s = Yt(i.map, t.ch, l);
    return s.offset = "right" == s.collapse ? s.end : s.start, s
  }

  function sl(e) {
    for (var t = e; t; t = t.parentNode)
      if (/CodeMirror-gutter-wrapper/.test(t.className)) return !0;
    return !1
  }

  function cl(e, t) {
    return t && (e.bad = !0), e
  }

  function ul(e, t, n, r, i) {
    function o(e) {
      return function(t) {
        return t.id == e
      }
    }

    function l() {
      u && (c += f, d && (c += f), u = d = !1)
    }

    function a(e) {
      e && (l(), c += e)
    }

    function s(t) {
      if (1 == t.nodeType) {
        var n = t.getAttribute("cm-text");
        if (n) return void a(n);
        var c, h = t.getAttribute("cm-marker");
        if (h) {
          var p = e.findMarks(W(r, 0), W(i + 1, 0), o(+h));
          return void(p.length && (c = p[0].find(0)) && a(O(e.doc, c.from, c.to).join(f)))
        }
        if ("false" == t.getAttribute("contenteditable")) return;
        var g = /^(pre|div|p|li|table|br)$/i.test(t.nodeName);
        if (!/^br$/i.test(t.nodeName) && 0 == t.textContent.length) return;
        g && l();
        for (var m = 0; m < t.childNodes.length; m++) s(t.childNodes[m]);
        /^(pre|p)$/i.test(t.nodeName) && (d = !0), g && (u = !0)
      } else 3 == t.nodeType && a(t.nodeValue.replace(/\u200b/g, "").replace(/\u00a0/g, " "))
    }
    for (var c = "", u = !1, f = e.doc.lineSeparator(), d = !1; s(t), t != n;) t = t.nextSibling, d = !1;
    return c
  }

  function fl(e, t, n) {
    var r;
    if (t == e.display.lineDiv) {
      if (r = e.display.lineDiv.childNodes[n], !r) return cl(e.clipPos(W(e.display.viewTo - 1)), !0);
      t = null, n = 0
    } else
      for (r = t;; r = r.parentNode) {
        if (!r || r == e.display.lineDiv) return null;
        if (r.parentNode && r.parentNode == e.display.lineDiv) break
      }
    for (var i = 0; i < e.display.view.length; i++) {
      var o = e.display.view[i];
      if (o.node == r) return dl(o, t, n)
    }
  }

  function dl(e, t, n) {
    function r(t, n, r) {
      for (var i = -1; i < (f ? f.length : 0); i++)
        for (var o = i < 0 ? u.map : f[i], l = 0; l < o.length; l += 3) {
          var a = o[l + 2];
          if (a == t || a == n) {
            var s = P(i < 0 ? e.line : e.rest[i]),
              c = o[l] + r;
            return (r < 0 || a != t) && (c = o[l + (r ? 1 : 0)]), W(s, c)
          }
        }
    }
    var i = e.text.firstChild,
      l = !1;
    if (!t || !o(i, t)) return cl(W(P(e.line), 0), !0);
    if (t == i && (l = !0, t = i.childNodes[n], n = 0, !t)) {
      var a = e.rest ? g(e.rest) : e.line;
      return cl(W(P(a), a.text.length), l)
    }
    var s = 3 == t.nodeType ? t : null,
      c = t;
    for (s || 1 != t.childNodes.length || 3 != t.firstChild.nodeType || (s = t.firstChild, n && (n = s.nodeValue.length)); c.parentNode != i;) c = c.parentNode;
    var u = e.measure,
      f = u.maps,
      d = r(s, c, n);
    if (d) return cl(d, l);
    for (var h = c.nextSibling, p = s ? s.nodeValue.length - n : 0; h; h = h.nextSibling) {
      if (d = r(h, h.firstChild, 0)) return cl(W(d.line, d.ch - p), l);
      p += h.textContent.length
    }
    for (var m = c.previousSibling, v = n; m; m = m.previousSibling) {
      if (d = r(m, m.firstChild, -1)) return cl(W(d.line, d.ch + v), l);
      v += m.textContent.length
    }
  }

  function hl(e, t) {
    function n() {
      e.value = c.getValue()
    }
    if (t = t ? u(t) : {}, t.value = e.value, !t.tabindex && e.tabIndex && (t.tabindex = e.tabIndex), !t.placeholder && e.placeholder && (t.placeholder = e.placeholder), null == t.autofocus) {
      var r = l();
      t.autofocus = r == e || null != e.getAttribute("autofocus") && r == document.body
    }
    var i;
    if (e.form && (ia(e.form, "submit", n), !t.leaveSubmitMethodAlone)) {
      var o = e.form;
      i = o.submit;
      try {
        var a = o.submit = function() {
          n(), o.submit = i, o.submit(), o.submit = a
        }
      } catch (s) {}
    }
    t.finishInit = function(t) {
      t.save = n, t.getTextArea = function() {
        return e
      }, t.toTextArea = function() {
        t.toTextArea = isNaN, n(), e.parentNode.removeChild(t.getWrapperElement()), e.style.display = "", e.form && (Te(e.form, "submit", n), "function" == typeof e.form.submit && (e.form.submit = i))
      }
    }, e.style.display = "none";
    var c = Xo(function(t) {
      return e.parentNode.insertBefore(t, e.nextSibling)
    }, t);
    return c
  }

  function pl(e) {
    e.off = Te, e.on = ia, e.wheelEventPixels = Rr, e.Doc = Ra, e.splitLines = la, e.countColumn = f, e.findColumn = h, e.isWordChar = x, e.Pass = Vl, e.signal = Me, e.Line = va, e.changeEnd = qr, e.scrollbarModel = Ta, e.Pos = W, e.cmpPos = E, e.modes = ua, e.mimeModes = fa, e.resolveMode = Ge, e.getMode = Ue, e.modeExtensions = da, e.extendMode = Ke, e.copyState = Ve, e.startState = $e, e.innerMode = _e, e.commands = Va, e.keyMap = Ka, e.keyName = uo, e.isModifierKey = so, e.lookupKey = ao, e.normalizeKeyMap = lo, e.StringStream = ha, e.SharedTextMarker = Ea, e.TextMarker = Wa, e.LineWidget = Ha, e.e_preventDefault = De, e.e_stopPropagation = He, e.e_stop = We, e.addClass = a, e.contains = o, e.rmClass = Bl, e.keyNames = ja
  }
  var gl = navigator.userAgent,
    ml = navigator.platform,
    vl = /gecko\/\d/i.test(gl),
    yl = /MSIE \d/.test(gl),
    bl = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(gl),
    xl = /Edge\/(\d+)/.exec(gl),
    wl = yl || bl || xl,
    Cl = wl && (yl ? document.documentMode || 6 : +(xl || bl)[1]),
    kl = !xl && /WebKit\//.test(gl),
    Sl = kl && /Qt\/\d+\.\d+/.test(gl),
    Ll = !xl && /Chrome\//.test(gl),
    Tl = /Opera\//.test(gl),
    Ml = /Apple Computer/.test(navigator.vendor),
    Ol = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(gl),
    Nl = /PhantomJS/.test(gl),
    Al = !xl && /AppleWebKit/.test(gl) && /Mobile\/\w+/.test(gl),
    Pl = /Android/.test(gl),
    Dl = Al || Pl || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(gl),
    Hl = Al || /Mac/.test(ml),
    Fl = /\bCrOS\b/.test(gl),
    Wl = /win/i.test(ml),
    El = Tl && gl.match(/Version\/(\d*\.\d*)/);
  El && (El = Number(El[1])), El && El >= 15 && (Tl = !1, kl = !0);
  var Il, Rl = Hl && (Sl || Tl && (null == El || El < 12.11)),
    zl = vl || wl && Cl >= 9,
    Bl = function(t, n) {
      var r = t.className,
        i = e(n).exec(r);
      if (i) {
        var o = r.slice(i.index + i[0].length);
        t.className = r.slice(0, i.index) + (o ? i[1] + o : "")
      }
    };
  Il = document.createRange ? function(e, t, n, r) {
    var i = document.createRange();
    return i.setEnd(r || e, n), i.setStart(e, t), i
  } : function(e, t, n) {
    var r = document.body.createTextRange();
    try {
      r.moveToElementText(e.parentNode)
    } catch (i) {
      return r
    }
    return r.collapse(!0), r.moveEnd("character", n), r.moveStart("character", t), r
  };
  var jl = function(e) {
    e.select()
  };
  Al ? jl = function(e) {
    e.selectionStart = 0, e.selectionEnd = e.value.length
  } : wl && (jl = function(e) {
    try {
      e.select()
    } catch (t) {}
  });
  var ql = function() {
    this.id = null
  };
  ql.prototype.set = function(e, t) {
    clearTimeout(this.id), this.id = setTimeout(t, e)
  };
  var Gl, Ul, Kl = 30,
    Vl = {
      toString: function() {
        return "CodeMirror.Pass"
      }
    },
    _l = {
      scroll: !1
    },
    $l = {
      origin: "*mouse"
    },
    Xl = {
      origin: "+move"
    },
    Yl = [""],
    Zl = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/,
    Ql = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/,
    Jl = !1,
    ea = !1,
    ta = null,
    na = function() {
      function e(e) {
        return e <= 247 ? n.charAt(e) : 1424 <= e && e <= 1524 ? "R" : 1536 <= e && e <= 1785 ? r.charAt(e - 1536) : 1774 <= e && e <= 2220 ? "r" : 8192 <= e && e <= 8203 ? "w" : 8204 == e ? "b" : "L"
      }

      function t(e, t, n) {
        this.level = e, this.from = t, this.to = n
      }
      var n = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN",
        r = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111",
        i = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/,
        o = /[stwN]/,
        l = /[LRr]/,
        a = /[Lb1n]/,
        s = /[1n]/;
      return function(n, r) {
        var c = "ltr" == r ? "L" : "R";
        if (0 == n.length || "ltr" == r && !i.test(n)) return !1;
        for (var u = n.length, f = [], d = 0; d < u; ++d) f.push(e(n.charCodeAt(d)));
        for (var h = 0, p = c; h < u; ++h) {
          var m = f[h];
          "m" == m ? f[h] = p : p = m
        }
        for (var v = 0, y = c; v < u; ++v) {
          var b = f[v];
          "1" == b && "r" == y ? f[v] = "n" : l.test(b) && (y = b, "r" == b && (f[v] = "R"))
        }
        for (var x = 1, w = f[0]; x < u - 1; ++x) {
          var C = f[x];
          "+" == C && "1" == w && "1" == f[x + 1] ? f[x] = "1" : "," != C || w != f[x + 1] || "1" != w && "n" != w || (f[x] = w), w = C
        }
        for (var k = 0; k < u; ++k) {
          var S = f[k];
          if ("," == S) f[k] = "N";
          else if ("%" == S) {
            var L = void 0;
            for (L = k + 1; L < u && "%" == f[L]; ++L);
            for (var T = k && "!" == f[k - 1] || L < u && "1" == f[L] ? "1" : "N", M = k; M < L; ++M) f[M] = T;
            k = L - 1
          }
        }
        for (var O = 0, N = c; O < u; ++O) {
          var A = f[O];
          "L" == N && "1" == A ? f[O] = "L" : l.test(A) && (N = A)
        }
        for (var P = 0; P < u; ++P)
          if (o.test(f[P])) {
            var D = void 0;
            for (D = P + 1; D < u && o.test(f[D]); ++D);
            for (var H = "L" == (P ? f[P - 1] : c), F = "L" == (D < u ? f[D] : c), W = H == F ? H ? "L" : "R" : c, E = P; E < D; ++E) f[E] = W;
            P = D - 1
          } for (var I, R = [], z = 0; z < u;)
          if (a.test(f[z])) {
            var B = z;
            for (++z; z < u && a.test(f[z]); ++z);
            R.push(new t(0, B, z))
          } else {
            var j = z,
              q = R.length;
            for (++z; z < u && "L" != f[z]; ++z);
            for (var G = j; G < z;)
              if (s.test(f[G])) {
                j < G && R.splice(q, 0, new t(1, j, G));
                var U = G;
                for (++G; G < z && s.test(f[G]); ++G);
                R.splice(q, 0, new t(2, U, G)), j = G
              } else ++G;
            j < z && R.splice(q, 0, new t(1, j, z))
          } return "ltr" == r && (1 == R[0].level && (I = n.match(/^\s+/)) && (R[0].from = I[0].length, R.unshift(new t(0, 0, I[0].length))), 1 == g(R).level && (I = n.match(/\s+$/)) && (g(R).to -= I[0].length, R.push(new t(0, u - I[0].length, u)))), "rtl" == r ? R.reverse() : R
      }
    }(),
    ra = [],
    ia = function(e, t, n) {
      if (e.addEventListener) e.addEventListener(t, n, !1);
      else if (e.attachEvent) e.attachEvent("on" + t, n);
      else {
        var r = e._handlers || (e._handlers = {});
        r[t] = (r[t] || ra).concat(n)
      }
    },
    oa = function() {
      if (wl && Cl < 9) return !1;
      var e = r("div");
      return "draggable" in e || "dragDrop" in e
    }(),
    la = 3 != "\n\nb".split(/\n/).length ? function(e) {
      for (var t = 0, n = [], r = e.length; t <= r;) {
        var i = e.indexOf("\n", t);
        i == -1 && (i = e.length);
        var o = e.slice(t, "\r" == e.charAt(i - 1) ? i - 1 : i),
          l = o.indexOf("\r");
        l != -1 ? (n.push(o.slice(0, l)), t += l + 1) : (n.push(o), t = i + 1)
      }
      return n
    } : function(e) {
      return e.split(/\r\n?|\n/)
    },
    aa = window.getSelection ? function(e) {
      try {
        return e.selectionStart != e.selectionEnd
      } catch (t) {
        return !1
      }
    } : function(e) {
      var t;
      try {
        t = e.ownerDocument.selection.createRange()
      } catch (n) {}
      return !(!t || t.parentElement() != e) && 0 != t.compareEndPoints("StartToEnd", t)
    },
    sa = function() {
      var e = r("div");
      return "oncopy" in e || (e.setAttribute("oncopy", "return;"), "function" == typeof e.oncopy)
    }(),
    ca = null,
    ua = {},
    fa = {},
    da = {},
    ha = function(e, t, n) {
      this.pos = this.start = 0, this.string = e, this.tabSize = t || 8, this.lastColumnPos = this.lastColumnValue = 0, this.lineStart = 0, this.lineOracle = n
    };
  ha.prototype.eol = function() {
    return this.pos >= this.string.length
  }, ha.prototype.sol = function() {
    return this.pos == this.lineStart
  }, ha.prototype.peek = function() {
    return this.string.charAt(this.pos) || void 0
  }, ha.prototype.next = function() {
    if (this.pos < this.string.length) return this.string.charAt(this.pos++)
  }, ha.prototype.eat = function(e) {
    var t, n = this.string.charAt(this.pos);
    if (t = "string" == typeof e ? n == e : n && (e.test ? e.test(n) : e(n))) return ++this.pos, n
  }, ha.prototype.eatWhile = function(e) {
    for (var t = this.pos; this.eat(e););
    return this.pos > t
  }, ha.prototype.eatSpace = function() {
    for (var e = this, t = this.pos;
      /[\s\u00a0]/.test(this.string.charAt(this.pos));) ++e.pos;
    return this.pos > t
  }, ha.prototype.skipToEnd = function() {
    this.pos = this.string.length
  }, ha.prototype.skipTo = function(e) {
    var t = this.string.indexOf(e, this.pos);
    if (t > -1) return this.pos = t, !0
  }, ha.prototype.backUp = function(e) {
    this.pos -= e
  }, ha.prototype.column = function() {
    return this.lastColumnPos < this.start && (this.lastColumnValue = f(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue - (this.lineStart ? f(this.string, this.lineStart, this.tabSize) : 0)
  }, ha.prototype.indentation = function() {
    return f(this.string, null, this.tabSize) - (this.lineStart ? f(this.string, this.lineStart, this.tabSize) : 0)
  }, ha.prototype.match = function(e, t, n) {
    if ("string" != typeof e) {
      var r = this.string.slice(this.pos).match(e);
      return r && r.index > 0 ? null : (r && t !== !1 && (this.pos += r[0].length), r)
    }
    var i = function(e) {
        return n ? e.toLowerCase() : e
      },
      o = this.string.substr(this.pos, e.length);
    if (i(o) == i(e)) return t !== !1 && (this.pos += e.length), !0
  }, ha.prototype.current = function() {
    return this.string.slice(this.start, this.pos)
  }, ha.prototype.hideFirstChars = function(e, t) {
    this.lineStart += e;
    try {
      return t()
    } finally {
      this.lineStart -= e
    }
  }, ha.prototype.lookAhead = function(e) {
    var t = this.lineOracle;
    return t && t.lookAhead(e)
  }, ha.prototype.baseToken = function() {
    var e = this.lineOracle;
    return e && e.baseToken(this.pos)
  };
  var pa = function(e, t) {
      this.state = e, this.lookAhead = t
    },
    ga = function(e, t, n, r) {
      this.state = t, this.doc = e, this.line = n, this.maxLookAhead = r || 0, this.baseTokens = null, this.baseTokenPos = 1
    };
  ga.prototype.lookAhead = function(e) {
    var t = this.doc.getLine(this.line + e);
    return null != t && e > this.maxLookAhead && (this.maxLookAhead = e), t
  }, ga.prototype.baseToken = function(e) {
    var t = this;
    if (!this.baseTokens) return null;
    for (; this.baseTokens[this.baseTokenPos] <= e;) t.baseTokenPos += 2;
    var n = this.baseTokens[this.baseTokenPos + 1];
    return {
      type: n && n.replace(/( |^)overlay .*/, ""),
      size: this.baseTokens[this.baseTokenPos] - e
    }
  }, ga.prototype.nextLine = function() {
    this.line++, this.maxLookAhead > 0 && this.maxLookAhead--
  }, ga.fromSaved = function(e, t, n) {
    return t instanceof pa ? new ga(e, Ve(e.mode, t.state), n, t.lookAhead) : new ga(e, Ve(e.mode, t), n)
  }, ga.prototype.save = function(e) {
    var t = e !== !1 ? Ve(this.doc.mode, this.state) : this.state;
    return this.maxLookAhead > 0 ? new pa(t, this.maxLookAhead) : t
  };
  var ma = function(e, t, n) {
      this.start = e.start, this.end = e.pos, this.string = e.current(), this.type = t || null, this.state = n
    },
    va = function(e, t, n) {
      this.text = e, re(this, t), this.height = n ? n(this) : 1
    };
  va.prototype.lineNo = function() {
    return P(this)
  }, Pe(va);
  var ya, ba = {},
    xa = {},
    wa = null,
    Ca = null,
    ka = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    Sa = function(e, t, n) {
      this.cm = n;
      var i = this.vert = r("div", [r("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar"),
        o = this.horiz = r("div", [r("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
      i.tabIndex = o.tabIndex = -1, e(i), e(o), ia(i, "scroll", function() {
        i.clientHeight && t(i.scrollTop, "vertical")
      }), ia(o, "scroll", function() {
        o.clientWidth && t(o.scrollLeft, "horizontal")
      }), this.checkedZeroWidth = !1, wl && Cl < 8 && (this.horiz.style.minHeight = this.vert.style.minWidth = "18px")
    };
  Sa.prototype.update = function(e) {
    var t = e.scrollWidth > e.clientWidth + 1,
      n = e.scrollHeight > e.clientHeight + 1,
      r = e.nativeBarWidth;
    if (n) {
      this.vert.style.display = "block", this.vert.style.bottom = t ? r + "px" : "0";
      var i = e.viewHeight - (t ? r : 0);
      this.vert.firstChild.style.height = Math.max(0, e.scrollHeight - e.clientHeight + i) + "px"
    } else this.vert.style.display = "", this.vert.firstChild.style.height = "0";
    if (t) {
      this.horiz.style.display = "block", this.horiz.style.right = n ? r + "px" : "0", this.horiz.style.left = e.barLeft + "px";
      var o = e.viewWidth - e.barLeft - (n ? r : 0);
      this.horiz.firstChild.style.width = Math.max(0, e.scrollWidth - e.clientWidth + o) + "px"
    } else this.horiz.style.display = "", this.horiz.firstChild.style.width = "0";
    return !this.checkedZeroWidth && e.clientHeight > 0 && (0 == r && this.zeroWidthHack(), this.checkedZeroWidth = !0), {
      right: n ? r : 0,
      bottom: t ? r : 0
    }
  }, Sa.prototype.setScrollLeft = function(e) {
    this.horiz.scrollLeft != e && (this.horiz.scrollLeft = e), this.disableHoriz && this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz")
  }, Sa.prototype.setScrollTop = function(e) {
    this.vert.scrollTop != e && (this.vert.scrollTop = e), this.disableVert && this.enableZeroWidthBar(this.vert, this.disableVert, "vert")
  }, Sa.prototype.zeroWidthHack = function() {
    var e = Hl && !Ol ? "12px" : "18px";
    this.horiz.style.height = this.vert.style.width = e, this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none", this.disableHoriz = new ql, this.disableVert = new ql
  }, Sa.prototype.enableZeroWidthBar = function(e, t, n) {
    function r() {
      var i = e.getBoundingClientRect(),
        o = "vert" == n ? document.elementFromPoint(i.right - 1, (i.top + i.bottom) / 2) : document.elementFromPoint((i.right + i.left) / 2, i.bottom - 1);
      o != e ? e.style.pointerEvents = "none" : t.set(1e3, r)
    }
    e.style.pointerEvents = "auto", t.set(1e3, r)
  }, Sa.prototype.clear = function() {
    var e = this.horiz.parentNode;
    e.removeChild(this.horiz), e.removeChild(this.vert)
  };
  var La = function() {};
  La.prototype.update = function() {
    return {
      bottom: 0,
      right: 0
    }
  }, La.prototype.setScrollLeft = function() {}, La.prototype.setScrollTop = function() {}, La.prototype.clear = function() {};
  var Ta = {
      "native": Sa,
      "null": La
    },
    Ma = 0,
    Oa = function(e, t, n) {
      var r = e.display;
      this.viewport = t, this.visible = Bn(r, e.doc, t), this.editorIsHidden = !r.wrapper.offsetWidth, this.wrapperHeight = r.wrapper.clientHeight, this.wrapperWidth = r.wrapper.clientWidth, this.oldDisplayWidth = jt(e), this.force = n, this.dims = Cn(e), this.events = []
    };
  Oa.prototype.signal = function(e, t) {
    Ae(e, t) && this.events.push(arguments)
  }, Oa.prototype.finish = function() {
    for (var e = this, t = 0; t < this.events.length; t++) Me.apply(null, e.events[t])
  };
  var Na = 0,
    Aa = null;
  wl ? Aa = -.53 : vl ? Aa = 15 : Ll ? Aa = -.7 : Ml && (Aa = -1 / 3);
  var Pa = function(e, t) {
    this.ranges = e, this.primIndex = t
  };
  Pa.prototype.primary = function() {
    return this.ranges[this.primIndex]
  }, Pa.prototype.equals = function(e) {
    var t = this;
    if (e == this) return !0;
    if (e.primIndex != this.primIndex || e.ranges.length != this.ranges.length) return !1;
    for (var n = 0; n < this.ranges.length; n++) {
      var r = t.ranges[n],
        i = e.ranges[n];
      if (!I(r.anchor, i.anchor) || !I(r.head, i.head)) return !1
    }
    return !0
  }, Pa.prototype.deepCopy = function() {
    for (var e = this, t = [], n = 0; n < this.ranges.length; n++) t[n] = new Da(R(e.ranges[n].anchor), R(e.ranges[n].head));
    return new Pa(t, this.primIndex)
  }, Pa.prototype.somethingSelected = function() {
    for (var e = this, t = 0; t < this.ranges.length; t++)
      if (!e.ranges[t].empty()) return !0;
    return !1
  }, Pa.prototype.contains = function(e, t) {
    var n = this;
    t || (t = e);
    for (var r = 0; r < this.ranges.length; r++) {
      var i = n.ranges[r];
      if (E(t, i.from()) >= 0 && E(e, i.to()) <= 0) return r
    }
    return -1
  };
  var Da = function(e, t) {
    this.anchor = e, this.head = t
  };
  Da.prototype.from = function() {
    return B(this.anchor, this.head)
  }, Da.prototype.to = function() {
    return z(this.anchor, this.head)
  }, Da.prototype.empty = function() {
    return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch
  }, qi.prototype = {
    chunkSize: function() {
      return this.lines.length
    },
    removeInner: function(e, t) {
      for (var n = this, r = e, i = e + t; r < i; ++r) {
        var o = n.lines[r];
        n.height -= o.height, at(o), wt(o, "delete")
      }
      this.lines.splice(e, t)
    },
    collapse: function(e) {
      e.push.apply(e, this.lines)
    },
    insertInner: function(e, t, n) {
      var r = this;
      this.height += n, this.lines = this.lines.slice(0, e).concat(t).concat(this.lines.slice(e));
      for (var i = 0; i < t.length; ++i) t[i].parent = r
    },
    iterN: function(e, t, n) {
      for (var r = this, i = e + t; e < i; ++e)
        if (n(r.lines[e])) return !0
    }
  }, Gi.prototype = {
    chunkSize: function() {
      return this.size
    },
    removeInner: function(e, t) {
      var n = this;
      this.size -= t;
      for (var r = 0; r < this.children.length; ++r) {
        var i = n.children[r],
          o = i.chunkSize();
        if (e < o) {
          var l = Math.min(t, o - e),
            a = i.height;
          if (i.removeInner(e, l), n.height -= a - i.height, o == l && (n.children.splice(r--, 1), i.parent = null), 0 == (t -= l)) break;
          e = 0
        } else e -= o
      }
      if (this.size - t < 25 && (this.children.length > 1 || !(this.children[0] instanceof qi))) {
        var s = [];
        this.collapse(s), this.children = [new qi(s)], this.children[0].parent = this
      }
    },
    collapse: function(e) {
      for (var t = this, n = 0; n < this.children.length; ++n) t.children[n].collapse(e)
    },
    insertInner: function(e, t, n) {
      var r = this;
      this.size += t.length, this.height += n;
      for (var i = 0; i < this.children.length; ++i) {
        var o = r.children[i],
          l = o.chunkSize();
        if (e <= l) {
          if (o.insertInner(e, t, n), o.lines && o.lines.length > 50) {
            for (var a = o.lines.length % 25 + 25, s = a; s < o.lines.length;) {
              var c = new qi(o.lines.slice(s, s += 25));
              o.height -= c.height, r.children.splice(++i, 0, c), c.parent = r
            }
            o.lines = o.lines.slice(0, a), r.maybeSpill()
          }
          break
        }
        e -= l
      }
    },
    maybeSpill: function() {
      if (!(this.children.length <= 10)) {
        var e = this;
        do {
          var t = e.children.splice(e.children.length - 5, 5),
            n = new Gi(t);
          if (e.parent) {
            e.size -= n.size, e.height -= n.height;
            var r = d(e.parent.children, e);
            e.parent.children.splice(r + 1, 0, n)
          } else {
            var i = new Gi(e.children);
            i.parent = e, e.children = [i, n], e = i
          }
          n.parent = e.parent
        } while (e.children.length > 10);
        e.parent.maybeSpill()
      }
    },
    iterN: function(e, t, n) {
      for (var r = this, i = 0; i < this.children.length; ++i) {
        var o = r.children[i],
          l = o.chunkSize();
        if (e < l) {
          var a = Math.min(t, l - e);
          if (o.iterN(e, a, n)) return !0;
          if (0 == (t -= a)) break;
          e = 0
        } else e -= l
      }
    }
  };
  var Ha = function(e, t, n) {
    var r = this;
    if (n)
      for (var i in n) n.hasOwnProperty(i) && (r[i] = n[i]);
    this.doc = e, this.node = t
  };
  Ha.prototype.clear = function() {
    var e = this,
      t = this.doc.cm,
      n = this.line.widgets,
      r = this.line,
      i = P(r);
    if (null != i && n) {
      for (var o = 0; o < n.length; ++o) n[o] == e && n.splice(o--, 1);
      n.length || (r.widgets = null);
      var l = Wt(this);
      A(r, Math.max(0, r.height - l)), t && (pr(t, function() {
        Ui(t, r, -l), br(t, i, "widget")
      }), wt(t, "lineWidgetCleared", t, this, i))
    }
  }, Ha.prototype.changed = function() {
    var e = this,
      t = this.height,
      n = this.doc.cm,
      r = this.line;
    this.height = null;
    var i = Wt(this) - t;
    i && (A(r, r.height + i), n && pr(n, function() {
      n.curOp.forceUpdate = !0, Ui(n, r, i), wt(n, "lineWidgetChanged", n, e, P(r))
    }))
  }, Pe(Ha);
  var Fa = 0,
    Wa = function(e, t) {
      this.lines = [], this.type = t, this.doc = e, this.id = ++Fa
    };
  Wa.prototype.clear = function() {
    var e = this;
    if (!this.explicitlyCleared) {
      var t = this.doc.cm,
        n = t && !t.curOp;
      if (n && lr(t), Ae(this, "clear")) {
        var r = this.find();
        r && wt(this, "clear", r.from, r.to)
      }
      for (var i = null, o = null, l = 0; l < this.lines.length; ++l) {
        var a = e.lines[l],
          s = $(a.markedSpans, e);
        t && !e.collapsed ? br(t, P(a), "text") : t && (null != s.to && (o = P(a)), null != s.from && (i = P(a))), a.markedSpans = X(a.markedSpans, s), null == s.from && e.collapsed && !ve(e.doc, a) && t && A(a, xn(t.display))
      }
      if (t && this.collapsed && !t.options.lineWrapping)
        for (var c = 0; c < this.lines.length; ++c) {
          var u = de(e.lines[c]),
            f = xe(u);
          f > t.display.maxLineLength && (t.display.maxLine = u, t.display.maxLineLength = f, t.display.maxLineChanged = !0)
        }
      null != i && t && this.collapsed && yr(t, i, o + 1), this.lines.length = 0, this.explicitlyCleared = !0, this.atomic && this.doc.cantEdit && (this.doc.cantEdit = !1, t && Si(t.doc)), t && wt(t, "markerCleared", t, this, i, o), n && ar(t), this.parent && this.parent.clear()
    }
  }, Wa.prototype.find = function(e, t) {
    var n = this;
    null == e && "bookmark" == this.type && (e = 1);
    for (var r, i, o = 0; o < this.lines.length; ++o) {
      var l = n.lines[o],
        a = $(l.markedSpans, n);
      if (null != a.from && (r = W(t ? l : P(l), a.from), e == -1)) return r;
      if (null != a.to && (i = W(t ? l : P(l), a.to), 1 == e)) return i
    }
    return r && {
      from: r,
      to: i
    }
  }, Wa.prototype.changed = function() {
    var e = this,
      t = this.find(-1, !0),
      n = this,
      r = this.doc.cm;
    t && r && pr(r, function() {
      var i = t.line,
        o = P(t.line),
        l = _t(r, o);
      if (l && (en(l), r.curOp.selectionChanged = r.curOp.forceUpdate = !0), r.curOp.updateMaxLine = !0, !ve(n.doc, i) && null != n.height) {
        var a = n.height;
        n.height = null;
        var s = Wt(n) - a;
        s && A(i, i.height + s)
      }
      wt(r, "markerChanged", r, e)
    })
  }, Wa.prototype.attachLine = function(e) {
    if (!this.lines.length && this.doc.cm) {
      var t = this.doc.cm.curOp;
      t.maybeHiddenMarkers && d(t.maybeHiddenMarkers, this) != -1 || (t.maybeUnhiddenMarkers || (t.maybeUnhiddenMarkers = [])).push(this)
    }
    this.lines.push(e)
  }, Wa.prototype.detachLine = function(e) {
    if (this.lines.splice(d(this.lines, e), 1), !this.lines.length && this.doc.cm) {
      var t = this.doc.cm.curOp;
      (t.maybeHiddenMarkers || (t.maybeHiddenMarkers = [])).push(this)
    }
  }, Pe(Wa);
  var Ea = function(e, t) {
    var n = this;
    this.markers = e, this.primary = t;
    for (var r = 0; r < e.length; ++r) e[r].parent = n;
  };
  Ea.prototype.clear = function() {
    var e = this;
    if (!this.explicitlyCleared) {
      this.explicitlyCleared = !0;
      for (var t = 0; t < this.markers.length; ++t) e.markers[t].clear();
      wt(this, "clear")
    }
  }, Ea.prototype.find = function(e, t) {
    return this.primary.find(e, t)
  }, Pe(Ea);
  var Ia = 0,
    Ra = function(e, t, n, r, i) {
      if (!(this instanceof Ra)) return new Ra(e, t, n, r, i);
      null == n && (n = 0), Gi.call(this, [new qi([new va("", null)])]), this.first = n, this.scrollTop = this.scrollLeft = 0, this.cantEdit = !1, this.cleanGeneration = 1, this.modeFrontier = this.highlightFrontier = n;
      var o = W(n, 0);
      this.sel = jr(o), this.history = new ti(null), this.id = ++Ia, this.modeOption = t, this.lineSep = r, this.direction = "rtl" == i ? "rtl" : "ltr", this.extend = !1, "string" == typeof e && (e = this.splitLines(e)), Yr(this, {
        from: o,
        to: o,
        text: e
      }), wi(this, jr(o), _l)
    };
  Ra.prototype = b(Gi.prototype, {
    constructor: Ra,
    iter: function(e, t, n) {
      n ? this.iterN(e - this.first, t - e, n) : this.iterN(this.first, this.first + this.size, e)
    },
    insert: function(e, t) {
      for (var n = 0, r = 0; r < t.length; ++r) n += t[r].height;
      this.insertInner(e - this.first, t, n)
    },
    remove: function(e, t) {
      this.removeInner(e - this.first, t)
    },
    getValue: function(e) {
      var t = N(this, this.first, this.first + this.size);
      return e === !1 ? t : t.join(e || this.lineSeparator())
    },
    setValue: vr(function(e) {
      var t = W(this.first, 0),
        n = this.first + this.size - 1;
      Pi(this, {
        from: t,
        to: W(n, M(this, n).text.length),
        text: this.splitLines(e),
        origin: "setValue",
        full: !0
      }, !0), this.cm && Xn(this.cm, 0, 0), wi(this, jr(t), _l)
    }),
    replaceRange: function(e, t, n, r) {
      t = q(this, t), n = n ? q(this, n) : t, Ii(this, e, t, n, r)
    },
    getRange: function(e, t, n) {
      var r = O(this, q(this, e), q(this, t));
      return n === !1 ? r : r.join(n || this.lineSeparator())
    },
    getLine: function(e) {
      var t = this.getLineHandle(e);
      return t && t.text
    },
    getLineHandle: function(e) {
      if (H(this, e)) return M(this, e)
    },
    getLineNumber: function(e) {
      return P(e)
    },
    getLineHandleVisualStart: function(e) {
      return "number" == typeof e && (e = M(this, e)), de(e)
    },
    lineCount: function() {
      return this.size
    },
    firstLine: function() {
      return this.first
    },
    lastLine: function() {
      return this.first + this.size - 1
    },
    clipPos: function(e) {
      return q(this, e)
    },
    getCursor: function(e) {
      var t, n = this.sel.primary();
      return t = null == e || "head" == e ? n.head : "anchor" == e ? n.anchor : "end" == e || "to" == e || e === !1 ? n.to() : n.from()
    },
    listSelections: function() {
      return this.sel.ranges
    },
    somethingSelected: function() {
      return this.sel.somethingSelected()
    },
    setCursor: vr(function(e, t, n) {
      yi(this, q(this, "number" == typeof e ? W(e, t || 0) : e), null, n)
    }),
    setSelection: vr(function(e, t, n) {
      yi(this, q(this, e), q(this, t || e), n)
    }),
    extendSelection: vr(function(e, t, n) {
      gi(this, q(this, e), t && q(this, t), n)
    }),
    extendSelections: vr(function(e, t) {
      mi(this, U(this, e), t)
    }),
    extendSelectionsBy: vr(function(e, t) {
      var n = m(this.sel.ranges, e);
      mi(this, U(this, n), t)
    }),
    setSelections: vr(function(e, t, n) {
      var r = this;
      if (e.length) {
        for (var i = [], o = 0; o < e.length; o++) i[o] = new Da(q(r, e[o].anchor), q(r, e[o].head));
        null == t && (t = Math.min(e.length - 1, this.sel.primIndex)), wi(this, Br(i, t), n)
      }
    }),
    addSelection: vr(function(e, t, n) {
      var r = this.sel.ranges.slice(0);
      r.push(new Da(q(this, e), q(this, t || e))), wi(this, Br(r, r.length - 1), n)
    }),
    getSelection: function(e) {
      for (var t, n = this, r = this.sel.ranges, i = 0; i < r.length; i++) {
        var o = O(n, r[i].from(), r[i].to());
        t = t ? t.concat(o) : o
      }
      return e === !1 ? t : t.join(e || this.lineSeparator())
    },
    getSelections: function(e) {
      for (var t = this, n = [], r = this.sel.ranges, i = 0; i < r.length; i++) {
        var o = O(t, r[i].from(), r[i].to());
        e !== !1 && (o = o.join(e || t.lineSeparator())), n[i] = o
      }
      return n
    },
    replaceSelection: function(e, t, n) {
      for (var r = [], i = 0; i < this.sel.ranges.length; i++) r[i] = e;
      this.replaceSelections(r, t, n || "+input")
    },
    replaceSelections: vr(function(e, t, n) {
      for (var r = this, i = [], o = this.sel, l = 0; l < o.ranges.length; l++) {
        var a = o.ranges[l];
        i[l] = {
          from: a.from(),
          to: a.to(),
          text: r.splitLines(e[l]),
          origin: n
        }
      }
      for (var s = t && "end" != t && Vr(this, i, t), c = i.length - 1; c >= 0; c--) Pi(r, i[c]);
      s ? xi(this, s) : this.cm && $n(this.cm)
    }),
    undo: vr(function() {
      Hi(this, "undo")
    }),
    redo: vr(function() {
      Hi(this, "redo")
    }),
    undoSelection: vr(function() {
      Hi(this, "undo", !0)
    }),
    redoSelection: vr(function() {
      Hi(this, "redo", !0)
    }),
    setExtending: function(e) {
      this.extend = e
    },
    getExtending: function() {
      return this.extend
    },
    historySize: function() {
      for (var e = this.history, t = 0, n = 0, r = 0; r < e.done.length; r++) e.done[r].ranges || ++t;
      for (var i = 0; i < e.undone.length; i++) e.undone[i].ranges || ++n;
      return {
        undo: t,
        redo: n
      }
    },
    clearHistory: function() {
      this.history = new ti(this.history.maxGeneration)
    },
    markClean: function() {
      this.cleanGeneration = this.changeGeneration(!0)
    },
    changeGeneration: function(e) {
      return e && (this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null), this.history.generation
    },
    isClean: function(e) {
      return this.history.generation == (e || this.cleanGeneration)
    },
    getHistory: function() {
      return {
        done: hi(this.history.done),
        undone: hi(this.history.undone)
      }
    },
    setHistory: function(e) {
      var t = this.history = new ti(this.history.maxGeneration);
      t.done = hi(e.done.slice(0), null, !0), t.undone = hi(e.undone.slice(0), null, !0)
    },
    setGutterMarker: vr(function(e, t, n) {
      return ji(this, e, "gutter", function(e) {
        var r = e.gutterMarkers || (e.gutterMarkers = {});
        return r[t] = n, !n && C(r) && (e.gutterMarkers = null), !0
      })
    }),
    clearGutter: vr(function(e) {
      var t = this;
      this.iter(function(n) {
        n.gutterMarkers && n.gutterMarkers[e] && ji(t, n, "gutter", function() {
          return n.gutterMarkers[e] = null, C(n.gutterMarkers) && (n.gutterMarkers = null), !0
        })
      })
    }),
    lineInfo: function(e) {
      var t;
      if ("number" == typeof e) {
        if (!H(this, e)) return null;
        if (t = e, e = M(this, e), !e) return null
      } else if (t = P(e), null == t) return null;
      return {
        line: t,
        handle: e,
        text: e.text,
        gutterMarkers: e.gutterMarkers,
        textClass: e.textClass,
        bgClass: e.bgClass,
        wrapClass: e.wrapClass,
        widgets: e.widgets
      }
    },
    addLineClass: vr(function(t, n, r) {
      return ji(this, t, "gutter" == n ? "gutter" : "class", function(t) {
        var i = "text" == n ? "textClass" : "background" == n ? "bgClass" : "gutter" == n ? "gutterClass" : "wrapClass";
        if (t[i]) {
          if (e(r).test(t[i])) return !1;
          t[i] += " " + r
        } else t[i] = r;
        return !0
      })
    }),
    removeLineClass: vr(function(t, n, r) {
      return ji(this, t, "gutter" == n ? "gutter" : "class", function(t) {
        var i = "text" == n ? "textClass" : "background" == n ? "bgClass" : "gutter" == n ? "gutterClass" : "wrapClass",
          o = t[i];
        if (!o) return !1;
        if (null == r) t[i] = null;
        else {
          var l = o.match(e(r));
          if (!l) return !1;
          var a = l.index + l[0].length;
          t[i] = o.slice(0, l.index) + (l.index && a != o.length ? " " : "") + o.slice(a) || null
        }
        return !0
      })
    }),
    addLineWidget: vr(function(e, t, n) {
      return Ki(this, e, t, n)
    }),
    removeLineWidget: function(e) {
      e.clear()
    },
    markText: function(e, t, n) {
      return Vi(this, q(this, e), q(this, t), n, n && n.type || "range")
    },
    setBookmark: function(e, t) {
      var n = {
        replacedWith: t && (null == t.nodeType ? t.widget : t),
        insertLeft: t && t.insertLeft,
        clearWhenEmpty: !1,
        shared: t && t.shared,
        handleMouseEvents: t && t.handleMouseEvents
      };
      return e = q(this, e), Vi(this, e, e, n, "bookmark")
    },
    findMarksAt: function(e) {
      e = q(this, e);
      var t = [],
        n = M(this, e.line).markedSpans;
      if (n)
        for (var r = 0; r < n.length; ++r) {
          var i = n[r];
          (null == i.from || i.from <= e.ch) && (null == i.to || i.to >= e.ch) && t.push(i.marker.parent || i.marker)
        }
      return t
    },
    findMarks: function(e, t, n) {
      e = q(this, e), t = q(this, t);
      var r = [],
        i = e.line;
      return this.iter(e.line, t.line + 1, function(o) {
        var l = o.markedSpans;
        if (l)
          for (var a = 0; a < l.length; a++) {
            var s = l[a];
            null != s.to && i == e.line && e.ch >= s.to || null == s.from && i != e.line || null != s.from && i == t.line && s.from >= t.ch || n && !n(s.marker) || r.push(s.marker.parent || s.marker)
          }++i
      }), r
    },
    getAllMarks: function() {
      var e = [];
      return this.iter(function(t) {
        var n = t.markedSpans;
        if (n)
          for (var r = 0; r < n.length; ++r) null != n[r].from && e.push(n[r].marker)
      }), e
    },
    posFromIndex: function(e) {
      var t, n = this.first,
        r = this.lineSeparator().length;
      return this.iter(function(i) {
        var o = i.text.length + r;
        return o > e ? (t = e, !0) : (e -= o, void++n)
      }), q(this, W(n, t))
    },
    indexFromPos: function(e) {
      e = q(this, e);
      var t = e.ch;
      if (e.line < this.first || e.ch < 0) return 0;
      var n = this.lineSeparator().length;
      return this.iter(this.first, e.line, function(e) {
        t += e.text.length + n
      }), t
    },
    copy: function(e) {
      var t = new Ra(N(this, this.first, this.first + this.size), this.modeOption, this.first, this.lineSep, this.direction);
      return t.scrollTop = this.scrollTop, t.scrollLeft = this.scrollLeft, t.sel = this.sel, t.extend = !1, e && (t.history.undoDepth = this.history.undoDepth, t.setHistory(this.getHistory())), t
    },
    linkedDoc: function(e) {
      e || (e = {});
      var t = this.first,
        n = this.first + this.size;
      null != e.from && e.from > t && (t = e.from), null != e.to && e.to < n && (n = e.to);
      var r = new Ra(N(this, t, n), e.mode || this.modeOption, t, this.lineSep, this.direction);
      return e.sharedHist && (r.history = this.history), (this.linked || (this.linked = [])).push({
        doc: r,
        sharedHist: e.sharedHist
      }), r.linked = [{
        doc: this,
        isParent: !0,
        sharedHist: e.sharedHist
      }], Xi(r, $i(this)), r
    },
    unlinkDoc: function(e) {
      var t = this;
      if (e instanceof Xo && (e = e.doc), this.linked)
        for (var n = 0; n < this.linked.length; ++n) {
          var r = t.linked[n];
          if (r.doc == e) {
            t.linked.splice(n, 1), e.unlinkDoc(t), Yi($i(t));
            break
          }
        }
      if (e.history == this.history) {
        var i = [e.id];
        Zr(e, function(e) {
          return i.push(e.id)
        }, !0), e.history = new ti(null), e.history.done = hi(this.history.done, i), e.history.undone = hi(this.history.undone, i)
      }
    },
    iterLinkedDocs: function(e) {
      Zr(this, e)
    },
    getMode: function() {
      return this.mode
    },
    getEditor: function() {
      return this.cm
    },
    splitLines: function(e) {
      return this.lineSep ? e.split(this.lineSep) : la(e)
    },
    lineSeparator: function() {
      return this.lineSep || "\n"
    },
    setDirection: vr(function(e) {
      "rtl" != e && (e = "ltr"), e != this.direction && (this.direction = e, this.iter(function(e) {
        return e.order = null
      }), this.cm && ei(this.cm))
    })
  }), Ra.prototype.eachLine = Ra.prototype.iter;
  for (var za = 0, Ba = !1, ja = {
      3: "Pause",
      8: "Backspace",
      9: "Tab",
      13: "Enter",
      16: "Shift",
      17: "Ctrl",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Esc",
      32: "Space",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "Left",
      38: "Up",
      39: "Right",
      40: "Down",
      44: "PrintScrn",
      45: "Insert",
      46: "Delete",
      59: ";",
      61: "=",
      91: "Mod",
      92: "Mod",
      93: "Mod",
      106: "*",
      107: "=",
      109: "-",
      110: ".",
      111: "/",
      127: "Delete",
      145: "ScrollLock",
      173: "-",
      186: ";",
      187: "=",
      188: ",",
      189: "-",
      190: ".",
      191: "/",
      192: "`",
      219: "[",
      220: "\\",
      221: "]",
      222: "'",
      63232: "Up",
      63233: "Down",
      63234: "Left",
      63235: "Right",
      63272: "Delete",
      63273: "Home",
      63275: "End",
      63276: "PageUp",
      63277: "PageDown",
      63302: "Insert"
    }, qa = 0; qa < 10; qa++) ja[qa + 48] = ja[qa + 96] = String(qa);
  for (var Ga = 65; Ga <= 90; Ga++) ja[Ga] = String.fromCharCode(Ga);
  for (var Ua = 1; Ua <= 12; Ua++) ja[Ua + 111] = ja[Ua + 63235] = "F" + Ua;
  var Ka = {};
  Ka.basic = {
    Left: "goCharLeft",
    Right: "goCharRight",
    Up: "goLineUp",
    Down: "goLineDown",
    End: "goLineEnd",
    Home: "goLineStartSmart",
    PageUp: "goPageUp",
    PageDown: "goPageDown",
    Delete: "delCharAfter",
    Backspace: "delCharBefore",
    "Shift-Backspace": "delCharBefore",
    Tab: "defaultTab",
    "Shift-Tab": "indentAuto",
    Enter: "newlineAndIndent",
    Insert: "toggleOverwrite",
    Esc: "singleSelection"
  }, Ka.pcDefault = {
    "Ctrl-A": "selectAll",
    "Ctrl-D": "deleteLine",
    "Ctrl-Z": "undo",
    "Shift-Ctrl-Z": "redo",
    "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart",
    "Ctrl-End": "goDocEnd",
    "Ctrl-Up": "goLineUp",
    "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft",
    "Ctrl-Right": "goGroupRight",
    "Alt-Left": "goLineStart",
    "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore",
    "Ctrl-Delete": "delGroupAfter",
    "Ctrl-S": "save",
    "Ctrl-F": "find",
    "Ctrl-G": "findNext",
    "Shift-Ctrl-G": "findPrev",
    "Shift-Ctrl-F": "replace",
    "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess",
    "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection",
    "Shift-Ctrl-U": "redoSelection",
    "Alt-U": "redoSelection",
    fallthrough: "basic"
  }, Ka.emacsy = {
    "Ctrl-F": "goCharRight",
    "Ctrl-B": "goCharLeft",
    "Ctrl-P": "goLineUp",
    "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight",
    "Alt-B": "goWordLeft",
    "Ctrl-A": "goLineStart",
    "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown",
    "Shift-Ctrl-V": "goPageUp",
    "Ctrl-D": "delCharAfter",
    "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter",
    "Alt-Backspace": "delWordBefore",
    "Ctrl-K": "killLine",
    "Ctrl-T": "transposeChars",
    "Ctrl-O": "openLine"
  }, Ka.macDefault = {
    "Cmd-A": "selectAll",
    "Cmd-D": "deleteLine",
    "Cmd-Z": "undo",
    "Shift-Cmd-Z": "redo",
    "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart",
    "Cmd-Up": "goDocStart",
    "Cmd-End": "goDocEnd",
    "Cmd-Down": "goDocEnd",
    "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight",
    "Cmd-Left": "goLineLeft",
    "Cmd-Right": "goLineRight",
    "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter",
    "Alt-Delete": "delGroupAfter",
    "Cmd-S": "save",
    "Cmd-F": "find",
    "Cmd-G": "findNext",
    "Shift-Cmd-G": "findPrev",
    "Cmd-Alt-F": "replace",
    "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess",
    "Cmd-]": "indentMore",
    "Cmd-Backspace": "delWrappedLineLeft",
    "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection",
    "Shift-Cmd-U": "redoSelection",
    "Ctrl-Up": "goDocStart",
    "Ctrl-Down": "goDocEnd",
    fallthrough: ["basic", "emacsy"]
  }, Ka["default"] = Hl ? Ka.macDefault : Ka.pcDefault;
  var Va = {
      selectAll: Ni,
      singleSelection: function(e) {
        return e.setSelection(e.getCursor("anchor"), e.getCursor("head"), _l)
      },
      killLine: function(e) {
        return ho(e, function(t) {
          if (t.empty()) {
            var n = M(e.doc, t.head.line).text.length;
            return t.head.ch == n && t.head.line < e.lastLine() ? {
              from: t.head,
              to: W(t.head.line + 1, 0)
            } : {
              from: t.head,
              to: W(t.head.line, n)
            }
          }
          return {
            from: t.from(),
            to: t.to()
          }
        })
      },
      deleteLine: function(e) {
        return ho(e, function(t) {
          return {
            from: W(t.from().line, 0),
            to: q(e.doc, W(t.to().line + 1, 0))
          }
        })
      },
      delLineLeft: function(e) {
        return ho(e, function(e) {
          return {
            from: W(e.from().line, 0),
            to: e.from()
          }
        })
      },
      delWrappedLineLeft: function(e) {
        return ho(e, function(t) {
          var n = e.charCoords(t.head, "div").top + 5,
            r = e.coordsChar({
              left: 0,
              top: n
            }, "div");
          return {
            from: r,
            to: t.from()
          }
        })
      },
      delWrappedLineRight: function(e) {
        return ho(e, function(t) {
          var n = e.charCoords(t.head, "div").top + 5,
            r = e.coordsChar({
              left: e.display.lineDiv.offsetWidth + 100,
              top: n
            }, "div");
          return {
            from: t.from(),
            to: r
          }
        })
      },
      undo: function(e) {
        return e.undo()
      },
      redo: function(e) {
        return e.redo()
      },
      undoSelection: function(e) {
        return e.undoSelection()
      },
      redoSelection: function(e) {
        return e.redoSelection()
      },
      goDocStart: function(e) {
        return e.extendSelection(W(e.firstLine(), 0))
      },
      goDocEnd: function(e) {
        return e.extendSelection(W(e.lastLine()))
      },
      goLineStart: function(e) {
        return e.extendSelectionsBy(function(t) {
          return yo(e, t.head.line)
        }, {
          origin: "+move",
          bias: 1
        })
      },
      goLineStartSmart: function(e) {
        return e.extendSelectionsBy(function(t) {
          return xo(e, t.head)
        }, {
          origin: "+move",
          bias: 1
        })
      },
      goLineEnd: function(e) {
        return e.extendSelectionsBy(function(t) {
          return bo(e, t.head.line)
        }, {
          origin: "+move",
          bias: -1
        })
      },
      goLineRight: function(e) {
        return e.extendSelectionsBy(function(t) {
          var n = e.cursorCoords(t.head, "div").top + 5;
          return e.coordsChar({
            left: e.display.lineDiv.offsetWidth + 100,
            top: n
          }, "div")
        }, Xl)
      },
      goLineLeft: function(e) {
        return e.extendSelectionsBy(function(t) {
          var n = e.cursorCoords(t.head, "div").top + 5;
          return e.coordsChar({
            left: 0,
            top: n
          }, "div")
        }, Xl)
      },
      goLineLeftSmart: function(e) {
        return e.extendSelectionsBy(function(t) {
          var n = e.cursorCoords(t.head, "div").top + 5,
            r = e.coordsChar({
              left: 0,
              top: n
            }, "div");
          return r.ch < e.getLine(r.line).search(/\S/) ? xo(e, t.head) : r
        }, Xl)
      },
      goLineUp: function(e) {
        return e.moveV(-1, "line")
      },
      goLineDown: function(e) {
        return e.moveV(1, "line")
      },
      goPageUp: function(e) {
        return e.moveV(-1, "page")
      },
      goPageDown: function(e) {
        return e.moveV(1, "page")
      },
      goCharLeft: function(e) {
        return e.moveH(-1, "char")
      },
      goCharRight: function(e) {
        return e.moveH(1, "char")
      },
      goColumnLeft: function(e) {
        return e.moveH(-1, "column")
      },
      goColumnRight: function(e) {
        return e.moveH(1, "column")
      },
      goWordLeft: function(e) {
        return e.moveH(-1, "word")
      },
      goGroupRight: function(e) {
        return e.moveH(1, "group")
      },
      goGroupLeft: function(e) {
        return e.moveH(-1, "group")
      },
      goWordRight: function(e) {
        return e.moveH(1, "word")
      },
      delCharBefore: function(e) {
        return e.deleteH(-1, "char")
      },
      delCharAfter: function(e) {
        return e.deleteH(1, "char")
      },
      delWordBefore: function(e) {
        return e.deleteH(-1, "word")
      },
      delWordAfter: function(e) {
        return e.deleteH(1, "word")
      },
      delGroupBefore: function(e) {
        return e.deleteH(-1, "group")
      },
      delGroupAfter: function(e) {
        return e.deleteH(1, "group")
      },
      indentAuto: function(e) {
        return e.indentSelection("smart")
      },
      indentMore: function(e) {
        return e.indentSelection("add")
      },
      indentLess: function(e) {
        return e.indentSelection("subtract")
      },
      insertTab: function(e) {
        return e.replaceSelection("\t")
      },
      insertSoftTab: function(e) {
        for (var t = [], n = e.listSelections(), r = e.options.tabSize, i = 0; i < n.length; i++) {
          var o = n[i].from(),
            l = f(e.getLine(o.line), o.ch, r);
          t.push(p(r - l % r))
        }
        e.replaceSelections(t)
      },
      defaultTab: function(e) {
        e.somethingSelected() ? e.indentSelection("add") : e.execCommand("insertTab")
      },
      transposeChars: function(e) {
        return pr(e, function() {
          for (var t = e.listSelections(), n = [], r = 0; r < t.length; r++)
            if (t[r].empty()) {
              var i = t[r].head,
                o = M(e.doc, i.line).text;
              if (o)
                if (i.ch == o.length && (i = new W(i.line, i.ch - 1)), i.ch > 0) i = new W(i.line, i.ch + 1), e.replaceRange(o.charAt(i.ch - 1) + o.charAt(i.ch - 2), W(i.line, i.ch - 2), i, "+transpose");
                else if (i.line > e.doc.first) {
                var l = M(e.doc, i.line - 1).text;
                l && (i = new W(i.line, 1), e.replaceRange(o.charAt(0) + e.doc.lineSeparator() + l.charAt(l.length - 1), W(i.line - 1, l.length - 1), i, "+transpose"))
              }
              n.push(new Da(i, i))
            } e.setSelections(n)
        })
      },
      newlineAndIndent: function(e) {
        return pr(e, function() {
          for (var t = e.listSelections(), n = t.length - 1; n >= 0; n--) e.replaceRange(e.doc.lineSeparator(), t[n].anchor, t[n].head, "+input");
          t = e.listSelections();
          for (var r = 0; r < t.length; r++) e.indentLine(t[r].from().line, null, !0);
          $n(e)
        })
      },
      openLine: function(e) {
        return e.replaceSelection("\n", "start")
      },
      toggleOverwrite: function(e) {
        return e.toggleOverwrite()
      }
    },
    _a = new ql,
    $a = null,
    Xa = 400,
    Ya = function(e, t, n) {
      this.time = e, this.pos = t, this.button = n
    };
  Ya.prototype.compare = function(e, t, n) {
    return this.time + Xa > e && 0 == E(t, this.pos) && n == this.button
  };
  var Za, Qa, Ja = {
      toString: function() {
        return "CodeMirror.Init"
      }
    },
    es = {},
    ts = {};
  Xo.defaults = es, Xo.optionHandlers = ts;
  var ns = [];
  Xo.defineInitHook = function(e) {
    return ns.push(e)
  };
  var rs = null,
    is = function(e) {
      var t = e.optionHandlers,
        n = e.helpers = {};
      e.prototype = {
        constructor: e,
        focus: function() {
          window.focus(), this.display.input.focus()
        },
        setOption: function(e, n) {
          var r = this.options,
            i = r[e];
          r[e] == n && "mode" != e || (r[e] = n, t.hasOwnProperty(e) && gr(this, t[e])(this, n, i), Me(this, "optionChange", this, e))
        },
        getOption: function(e) {
          return this.options[e]
        },
        getDoc: function() {
          return this.doc
        },
        addKeyMap: function(e, t) {
          this.state.keyMaps[t ? "push" : "unshift"](fo(e))
        },
        removeKeyMap: function(e) {
          for (var t = this.state.keyMaps, n = 0; n < t.length; ++n)
            if (t[n] == e || t[n].name == e) return t.splice(n, 1), !0
        },
        addOverlay: mr(function(t, n) {
          var r = t.token ? t : e.getMode(this.options, t);
          if (r.startState) throw new Error("Overlays may not be stateful.");
          v(this.state.overlays, {
            mode: r,
            modeSpec: t,
            opaque: n && n.opaque,
            priority: n && n.priority || 0
          }, function(e) {
            return e.priority
          }), this.state.modeGen++, yr(this)
        }),
        removeOverlay: mr(function(e) {
          for (var t = this, n = this.state.overlays, r = 0; r < n.length; ++r) {
            var i = n[r].modeSpec;
            if (i == e || "string" == typeof e && i.name == e) return n.splice(r, 1), t.state.modeGen++, void yr(t)
          }
        }),
        indentLine: mr(function(e, t, n) {
          "string" != typeof t && "number" != typeof t && (t = null == t ? this.options.smartIndent ? "smart" : "prev" : t ? "add" : "subtract"), H(this.doc, e) && Zo(this, e, t, n)
        }),
        indentSelection: mr(function(e) {
          for (var t = this, n = this.doc.sel.ranges, r = -1, i = 0; i < n.length; i++) {
            var o = n[i];
            if (o.empty()) o.head.line > r && (Zo(t, o.head.line, e, !0), r = o.head.line, i == t.doc.sel.primIndex && $n(t));
            else {
              var l = o.from(),
                a = o.to(),
                s = Math.max(r, l.line);
              r = Math.min(t.lastLine(), a.line - (a.ch ? 0 : 1)) + 1;
              for (var c = s; c < r; ++c) Zo(t, c, e);
              var u = t.doc.sel.ranges;
              0 == l.ch && n.length == u.length && u[i].from().ch > 0 && vi(t.doc, i, new Da(l, u[i].to()), _l)
            }
          }
        }),
        getTokenAt: function(e, t) {
          return tt(this, e, t)
        },
        getLineTokens: function(e, t) {
          return tt(this, W(e), t, !0)
        },
        getTokenTypeAt: function(e) {
          e = q(this.doc, e);
          var t, n = Ye(this, M(this.doc, e.line)),
            r = 0,
            i = (n.length - 1) / 2,
            o = e.ch;
          if (0 == o) t = n[2];
          else
            for (;;) {
              var l = r + i >> 1;
              if ((l ? n[2 * l - 1] : 0) >= o) i = l;
              else {
                if (!(n[2 * l + 1] < o)) {
                  t = n[2 * l + 2];
                  break
                }
                r = l + 1
              }
            }
          var a = t ? t.indexOf("overlay ") : -1;
          return a < 0 ? t : 0 == a ? null : t.slice(0, a - 1)
        },
        getModeAt: function(t) {
          var n = this.doc.mode;
          return n.innerMode ? e.innerMode(n, this.getTokenAt(t).state).mode : n
        },
        getHelper: function(e, t) {
          return this.getHelpers(e, t)[0]
        },
        getHelpers: function(e, t) {
          var r = this,
            i = [];
          if (!n.hasOwnProperty(t)) return i;
          var o = n[t],
            l = this.getModeAt(e);
          if ("string" == typeof l[t]) o[l[t]] && i.push(o[l[t]]);
          else if (l[t])
            for (var a = 0; a < l[t].length; a++) {
              var s = o[l[t][a]];
              s && i.push(s)
            } else l.helperType && o[l.helperType] ? i.push(o[l.helperType]) : o[l.name] && i.push(o[l.name]);
          for (var c = 0; c < o._global.length; c++) {
            var u = o._global[c];
            u.pred(l, r) && d(i, u.val) == -1 && i.push(u.val)
          }
          return i
        },
        getStateAfter: function(e, t) {
          var n = this.doc;
          return e = j(n, null == e ? n.first + n.size - 1 : e), Ze(this, e + 1, t).state
        },
        cursorCoords: function(e, t) {
          var n, r = this.doc.sel.primary();
          return n = null == e ? r.head : "object" == typeof e ? q(this.doc, e) : e ? r.from() : r.to(), un(this, n, t || "page")
        },
        charCoords: function(e, t) {
          return cn(this, q(this.doc, e), t || "page")
        },
        coordsChar: function(e, t) {
          return e = sn(this, e, t || "page"), hn(this, e.left, e.top)
        },
        lineAtHeight: function(e, t) {
          return e = sn(this, {
            top: e,
            left: 0
          }, t || "page").top, D(this.doc, e + this.display.viewOffset)
        },
        heightAtLine: function(e, t, n) {
          var r, i = !1;
          if ("number" == typeof e) {
            var o = this.doc.first + this.doc.size - 1;
            e < this.doc.first ? e = this.doc.first : e > o && (e = o, i = !0), r = M(this.doc, e)
          } else r = e;
          return an(this, r, {
            top: 0,
            left: 0
          }, t || "page", n || i).top + (i ? this.doc.height - be(r) : 0)
        },
        defaultTextHeight: function() {
          return xn(this.display)
        },
        defaultCharWidth: function() {
          return wn(this.display)
        },
        getViewport: function() {
          return {
            from: this.display.viewFrom,
            to: this.display.viewTo
          }
        },
        addWidget: function(e, t, n, r, i) {
          var o = this.display;
          e = un(this, q(this.doc, e));
          var l = e.bottom,
            a = e.left;
          if (t.style.position = "absolute", t.setAttribute("cm-ignore-events", "true"), this.display.input.setUneditable(t), o.sizer.appendChild(t), "over" == r) l = e.top;
          else if ("above" == r || "near" == r) {
            var s = Math.max(o.wrapper.clientHeight, this.doc.height),
              c = Math.max(o.sizer.clientWidth, o.lineSpace.clientWidth);
            ("above" == r || e.bottom + t.offsetHeight > s) && e.top > t.offsetHeight ? l = e.top - t.offsetHeight : e.bottom + t.offsetHeight <= s && (l = e.bottom), a + t.offsetWidth > c && (a = c - t.offsetWidth)
          }
          t.style.top = l + "px", t.style.left = t.style.right = "", "right" == i ? (a = o.sizer.clientWidth - t.offsetWidth, t.style.right = "0px") : ("left" == i ? a = 0 : "middle" == i && (a = (o.sizer.clientWidth - t.offsetWidth) / 2), t.style.left = a + "px"), n && Kn(this, {
            left: a,
            top: l,
            right: a + t.offsetWidth,
            bottom: l + t.offsetHeight
          })
        },
        triggerOnKeyDown: mr(Mo),
        triggerOnKeyPress: mr(Ao),
        triggerOnKeyUp: No,
        triggerOnMouseDown: mr(Do),
        execCommand: function(e) {
          if (Va.hasOwnProperty(e)) return Va[e].call(null, this)
        },
        triggerElectric: mr(function(e) {
          tl(this, e)
        }),
        findPosH: function(e, t, n, r) {
          var i = this,
            o = 1;
          t < 0 && (o = -1, t = -t);
          for (var l = q(this.doc, e), a = 0; a < t && (l = ol(i.doc, l, o, n, r), !l.hitSide); ++a);
          return l
        },
        moveH: mr(function(e, t) {
          var n = this;
          this.extendSelectionsBy(function(r) {
            return n.display.shift || n.doc.extend || r.empty() ? ol(n.doc, r.head, e, t, n.options.rtlMoveVisually) : e < 0 ? r.from() : r.to()
          }, Xl)
        }),
        deleteH: mr(function(e, t) {
          var n = this.doc.sel,
            r = this.doc;
          n.somethingSelected() ? r.replaceSelection("", null, "+delete") : ho(this, function(n) {
            var i = ol(r, n.head, e, t, !1);
            return e < 0 ? {
              from: i,
              to: n.head
            } : {
              from: n.head,
              to: i
            }
          })
        }),
        findPosV: function(e, t, n, r) {
          var i = this,
            o = 1,
            l = r;
          t < 0 && (o = -1, t = -t);
          for (var a = q(this.doc, e), s = 0; s < t; ++s) {
            var c = un(i, a, "div");
            if (null == l ? l = c.left : c.left = l, a = ll(i, c, o, n), a.hitSide) break
          }
          return a
        },
        moveV: mr(function(e, t) {
          var n = this,
            r = this.doc,
            i = [],
            o = !this.display.shift && !r.extend && r.sel.somethingSelected();
          if (r.extendSelectionsBy(function(l) {
              if (o) return e < 0 ? l.from() : l.to();
              var a = un(n, l.head, "div");
              null != l.goalColumn && (a.left = l.goalColumn), i.push(a.left);
              var s = ll(n, a, e, t);
              return "page" == t && l == r.sel.primary() && _n(n, cn(n, s, "div").top - a.top), s
            }, Xl), i.length)
            for (var l = 0; l < r.sel.ranges.length; l++) r.sel.ranges[l].goalColumn = i[l]
        }),
        findWordAt: function(e) {
          var t = this.doc,
            n = M(t, e.line).text,
            r = e.ch,
            i = e.ch;
          if (n) {
            var o = this.getHelper(e, "wordChars");
            "before" != e.sticky && i != n.length || !r ? ++i : --r;
            for (var l = n.charAt(r), a = w(l, o) ? function(e) {
                return w(e, o)
              } : /\s/.test(l) ? function(e) {
                return /\s/.test(e)
              } : function(e) {
                return !/\s/.test(e) && !w(e)
              }; r > 0 && a(n.charAt(r - 1));) --r;
            for (; i < n.length && a(n.charAt(i));) ++i
          }
          return new Da(W(e.line, r), W(e.line, i))
        },
        toggleOverwrite: function(e) {
          null != e && e == this.state.overwrite || ((this.state.overwrite = !this.state.overwrite) ? a(this.display.cursorDiv, "CodeMirror-overwrite") : Bl(this.display.cursorDiv, "CodeMirror-overwrite"), Me(this, "overwriteToggle", this, this.state.overwrite))
        },
        hasFocus: function() {
          return this.display.input.getField() == l()
        },
        isReadOnly: function() {
          return !(!this.options.readOnly && !this.doc.cantEdit)
        },
        scrollTo: mr(function(e, t) {
          Xn(this, e, t)
        }),
        getScrollInfo: function() {
          var e = this.display.scroller;
          return {
            left: e.scrollLeft,
            top: e.scrollTop,
            height: e.scrollHeight - Bt(this) - this.display.barHeight,
            width: e.scrollWidth - Bt(this) - this.display.barWidth,
            clientHeight: qt(this),
            clientWidth: jt(this)
          }
        },
        scrollIntoView: mr(function(e, t) {
          null == e ? (e = {
            from: this.doc.sel.primary().head,
            to: null
          }, null == t && (t = this.options.cursorScrollMargin)) : "number" == typeof e ? e = {
            from: W(e, 0),
            to: null
          } : null == e.from && (e = {
            from: e,
            to: null
          }), e.to || (e.to = e.from), e.margin = t || 0, null != e.from.line ? Yn(this, e) : Qn(this, e.from, e.to, e.margin)
        }),
        setSize: mr(function(e, t) {
          var n = this,
            r = function(e) {
              return "number" == typeof e || /^\d+$/.test(String(e)) ? e + "px" : e
            };
          null != e && (this.display.wrapper.style.width = r(e)), null != t && (this.display.wrapper.style.height = r(t)), this.options.lineWrapping && tn(this);
          var i = this.display.viewFrom;
          this.doc.iter(i, this.display.viewTo, function(e) {
            if (e.widgets)
              for (var t = 0; t < e.widgets.length; t++)
                if (e.widgets[t].noHScroll) {
                  br(n, i, "widget");
                  break
                }++ i
          }), this.curOp.forceUpdate = !0, Me(this, "refresh", this)
        }),
        operation: function(e) {
          return pr(this, e)
        },
        startOperation: function() {
          return lr(this)
        },
        endOperation: function() {
          return ar(this)
        },
        refresh: mr(function() {
          var e = this.display.cachedTextHeight;
          yr(this), this.curOp.forceUpdate = !0, nn(this), Xn(this, this.doc.scrollLeft, this.doc.scrollTop), Hr(this), (null == e || Math.abs(e - xn(this.display)) > .5) && Ln(this), Me(this, "refresh", this)
        }),
        swapDoc: mr(function(e) {
          var t = this.doc;
          return t.cm = null, Qr(this, e), nn(this), this.display.input.reset(), Xn(this, e.scrollLeft, e.scrollTop), this.curOp.forceScroll = !0, wt(this, "swapDoc", this, t), t
        }),
        getInputField: function() {
          return this.display.input.getField()
        },
        getWrapperElement: function() {
          return this.display.wrapper
        },
        getScrollerElement: function() {
          return this.display.scroller
        },
        getGutterElement: function() {
          return this.display.gutters
        }
      }, Pe(e), e.registerHelper = function(t, r, i) {
        n.hasOwnProperty(t) || (n[t] = e[t] = {
          _global: []
        }), n[t][r] = i
      }, e.registerGlobalHelper = function(t, r, i, o) {
        e.registerHelper(t, r, o), n[t]._global.push({
          pred: i,
          val: o
        })
      }
    },
    os = function(e) {
      this.cm = e, this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null, this.polling = new ql, this.composing = null, this.gracePeriod = !1, this.readDOMTimeout = null
    };
  os.prototype.init = function(e) {
    function t(e) {
      if (!Oe(i, e)) {
        if (i.somethingSelected()) Qo({
          lineWise: !1,
          text: i.getSelections()
        }), "cut" == e.type && i.replaceSelection("", null, "cut");
        else {
          if (!i.options.lineWiseCopyCut) return;
          var t = nl(i);
          Qo({
            lineWise: !0,
            text: t.text
          }), "cut" == e.type && i.operation(function() {
            i.setSelections(t.ranges, 0, _l), i.replaceSelection("", null, "cut")
          })
        }
        if (e.clipboardData) {
          e.clipboardData.clearData();
          var n = rs.text.join("\n");
          if (e.clipboardData.setData("Text", n), e.clipboardData.getData("Text") == n) return void e.preventDefault()
        }
        var l = il(),
          a = l.firstChild;
        i.display.lineSpace.insertBefore(l, i.display.lineSpace.firstChild), a.value = rs.text.join("\n");
        var s = document.activeElement;
        jl(a), setTimeout(function() {
          i.display.lineSpace.removeChild(l), s.focus(), s == o && r.showPrimarySelection()
        }, 50)
      }
    }
    var n = this,
      r = this,
      i = r.cm,
      o = r.div = e.lineDiv;
    rl(o, i.options.spellcheck), ia(o, "paste", function(e) {
      Oe(i, e) || el(e, i) || Cl <= 11 && setTimeout(gr(i, function() {
        return n.updateFromDOM()
      }), 20)
    }), ia(o, "compositionstart", function(e) {
      n.composing = {
        data: e.data,
        done: !1
      }
    }), ia(o, "compositionupdate", function(e) {
      n.composing || (n.composing = {
        data: e.data,
        done: !1
      })
    }), ia(o, "compositionend", function(e) {
      n.composing && (e.data != n.composing.data && n.readFromDOMSoon(), n.composing.done = !0)
    }), ia(o, "touchstart", function() {
      return r.forceCompositionEnd()
    }), ia(o, "input", function() {
      n.composing || n.readFromDOMSoon()
    }), ia(o, "copy", t), ia(o, "cut", t)
  }, os.prototype.prepareSelection = function() {
    var e = Nn(this.cm, !1);
    return e.focus = this.cm.state.focused, e
  }, os.prototype.showSelection = function(e, t) {
    e && this.cm.display.view.length && ((e.focus || t) && this.showPrimarySelection(), this.showMultipleSelections(e))
  }, os.prototype.getSelection = function() {
    return this.cm.display.wrapper.ownerDocument.getSelection()
  }, os.prototype.showPrimarySelection = function() {
    var e = this.getSelection(),
      t = this.cm,
      n = t.doc.sel.primary(),
      r = n.from(),
      i = n.to();
    if (t.display.viewTo == t.display.viewFrom || r.line >= t.display.viewTo || i.line < t.display.viewFrom) return void e.removeAllRanges();
    var o = fl(t, e.anchorNode, e.anchorOffset),
      l = fl(t, e.focusNode, e.focusOffset);
    if (!o || o.bad || !l || l.bad || 0 != E(B(o, l), r) || 0 != E(z(o, l), i)) {
      var a = t.display.view,
        s = r.line >= t.display.viewFrom && al(t, r) || {
          node: a[0].measure.map[2],
          offset: 0
        },
        c = i.line < t.display.viewTo && al(t, i);
      if (!c) {
        var u = a[a.length - 1].measure,
          f = u.maps ? u.maps[u.maps.length - 1] : u.map;
        c = {
          node: f[f.length - 1],
          offset: f[f.length - 2] - f[f.length - 3]
        }
      }
      if (!s || !c) return void e.removeAllRanges();
      var d, h = e.rangeCount && e.getRangeAt(0);
      try {
        d = Il(s.node, s.offset, c.offset, c.node)
      } catch (p) {}
      d && (!vl && t.state.focused ? (e.collapse(s.node, s.offset), d.collapsed || (e.removeAllRanges(), e.addRange(d))) : (e.removeAllRanges(), e.addRange(d)), h && null == e.anchorNode ? e.addRange(h) : vl && this.startGracePeriod()), this.rememberSelection()
    }
  }, os.prototype.startGracePeriod = function() {
    var e = this;
    clearTimeout(this.gracePeriod), this.gracePeriod = setTimeout(function() {
      e.gracePeriod = !1, e.selectionChanged() && e.cm.operation(function() {
        return e.cm.curOp.selectionChanged = !0
      })
    }, 20)
  }, os.prototype.showMultipleSelections = function(e) {
    n(this.cm.display.cursorDiv, e.cursors), n(this.cm.display.selectionDiv, e.selection)
  }, os.prototype.rememberSelection = function() {
    var e = this.getSelection();
    this.lastAnchorNode = e.anchorNode, this.lastAnchorOffset = e.anchorOffset, this.lastFocusNode = e.focusNode, this.lastFocusOffset = e.focusOffset
  }, os.prototype.selectionInEditor = function() {
    var e = this.getSelection();
    if (!e.rangeCount) return !1;
    var t = e.getRangeAt(0).commonAncestorContainer;
    return o(this.div, t)
  }, os.prototype.focus = function() {
    "nocursor" != this.cm.options.readOnly && (this.selectionInEditor() || this.showSelection(this.prepareSelection(), !0), this.div.focus())
  }, os.prototype.blur = function() {
    this.div.blur()
  }, os.prototype.getField = function() {
    return this.div
  }, os.prototype.supportsTouch = function() {
    return !0
  }, os.prototype.receivedFocus = function() {
    function e() {
      t.cm.state.focused && (t.pollSelection(), t.polling.set(t.cm.options.pollInterval, e))
    }
    var t = this;
    this.selectionInEditor() ? this.pollSelection() : pr(this.cm, function() {
      return t.cm.curOp.selectionChanged = !0
    }), this.polling.set(this.cm.options.pollInterval, e)
  }, os.prototype.selectionChanged = function() {
    var e = this.getSelection();
    return e.anchorNode != this.lastAnchorNode || e.anchorOffset != this.lastAnchorOffset || e.focusNode != this.lastFocusNode || e.focusOffset != this.lastFocusOffset
  }, os.prototype.pollSelection = function() {
    if (null == this.readDOMTimeout && !this.gracePeriod && this.selectionChanged()) {
      var e = this.getSelection(),
        t = this.cm;
      if (Pl && Ll && this.cm.options.gutters.length && sl(e.anchorNode)) return this.cm.triggerOnKeyDown({
        type: "keydown",
        keyCode: 8,
        preventDefault: Math.abs
      }), this.blur(), void this.focus();
      if (!this.composing) {
        this.rememberSelection();
        var n = fl(t, e.anchorNode, e.anchorOffset),
          r = fl(t, e.focusNode, e.focusOffset);
        n && r && pr(t, function() {
          wi(t.doc, jr(n, r), _l), (n.bad || r.bad) && (t.curOp.selectionChanged = !0)
        })
      }
    }
  }, os.prototype.pollContent = function() {
    null != this.readDOMTimeout && (clearTimeout(this.readDOMTimeout), this.readDOMTimeout = null);
    var e = this.cm,
      t = e.display,
      n = e.doc.sel.primary(),
      r = n.from(),
      i = n.to();
    if (0 == r.ch && r.line > e.firstLine() && (r = W(r.line - 1, M(e.doc, r.line - 1).length)), i.ch == M(e.doc, i.line).text.length && i.line < e.lastLine() && (i = W(i.line + 1, 0)), r.line < t.viewFrom || i.line > t.viewTo - 1) return !1;
    var o, l, a;
    r.line == t.viewFrom || 0 == (o = Mn(e, r.line)) ? (l = P(t.view[0].line), a = t.view[0].node) : (l = P(t.view[o].line), a = t.view[o - 1].node.nextSibling);
    var s, c, u = Mn(e, i.line);
    if (u == t.view.length - 1 ? (s = t.viewTo - 1, c = t.lineDiv.lastChild) : (s = P(t.view[u + 1].line) - 1, c = t.view[u + 1].node.previousSibling), !a) return !1;
    for (var f = e.doc.splitLines(ul(e, a, c, l, s)), d = O(e.doc, W(l, 0), W(s, M(e.doc, s).text.length)); f.length > 1 && d.length > 1;)
      if (g(f) == g(d)) f.pop(), d.pop(), s--;
      else {
        if (f[0] != d[0]) break;
        f.shift(), d.shift(), l++
      } for (var h = 0, p = 0, m = f[0], v = d[0], y = Math.min(m.length, v.length); h < y && m.charCodeAt(h) == v.charCodeAt(h);) ++h;
    for (var b = g(f), x = g(d), w = Math.min(b.length - (1 == f.length ? h : 0), x.length - (1 == d.length ? h : 0)); p < w && b.charCodeAt(b.length - p - 1) == x.charCodeAt(x.length - p - 1);) ++p;
    if (1 == f.length && 1 == d.length && l == r.line)
      for (; h && h > r.ch && b.charCodeAt(b.length - p - 1) == x.charCodeAt(x.length - p - 1);) h--, p++;
    f[f.length - 1] = b.slice(0, b.length - p).replace(/^\u200b+/, ""),
      f[0] = f[0].slice(h).replace(/\u200b+$/, "");
    var C = W(l, h),
      k = W(s, d.length ? g(d).length - p : 0);
    return f.length > 1 || f[0] || E(C, k) ? (Ii(e.doc, f, C, k, "+input"), !0) : void 0
  }, os.prototype.ensurePolled = function() {
    this.forceCompositionEnd()
  }, os.prototype.reset = function() {
    this.forceCompositionEnd()
  }, os.prototype.forceCompositionEnd = function() {
    this.composing && (clearTimeout(this.readDOMTimeout), this.composing = null, this.updateFromDOM(), this.div.blur(), this.div.focus())
  }, os.prototype.readFromDOMSoon = function() {
    var e = this;
    null == this.readDOMTimeout && (this.readDOMTimeout = setTimeout(function() {
      if (e.readDOMTimeout = null, e.composing) {
        if (!e.composing.done) return;
        e.composing = null
      }
      e.updateFromDOM()
    }, 80))
  }, os.prototype.updateFromDOM = function() {
    var e = this;
    !this.cm.isReadOnly() && this.pollContent() || pr(this.cm, function() {
      return yr(e.cm)
    })
  }, os.prototype.setUneditable = function(e) {
    e.contentEditable = "false"
  }, os.prototype.onKeyPress = function(e) {
    0 == e.charCode || this.composing || (e.preventDefault(), this.cm.isReadOnly() || gr(this.cm, Jo)(this.cm, String.fromCharCode(null == e.charCode ? e.keyCode : e.charCode), 0))
  }, os.prototype.readOnlyChanged = function(e) {
    this.div.contentEditable = String("nocursor" != e)
  }, os.prototype.onContextMenu = function() {}, os.prototype.resetPosition = function() {}, os.prototype.needsContentAttribute = !0;
  var ls = function(e) {
    this.cm = e, this.prevInput = "", this.pollingFast = !1, this.polling = new ql, this.hasSelection = !1, this.composing = null
  };
  ls.prototype.init = function(e) {
    function t(e) {
      if (!Oe(i, e)) {
        if (i.somethingSelected()) Qo({
          lineWise: !1,
          text: i.getSelections()
        });
        else {
          if (!i.options.lineWiseCopyCut) return;
          var t = nl(i);
          Qo({
            lineWise: !0,
            text: t.text
          }), "cut" == e.type ? i.setSelections(t.ranges, null, _l) : (r.prevInput = "", o.value = t.text.join("\n"), jl(o))
        }
        "cut" == e.type && (i.state.cutIncoming = !0)
      }
    }
    var n = this,
      r = this,
      i = this.cm;
    this.createField(e);
    var o = this.textarea;
    e.wrapper.insertBefore(this.wrapper, e.wrapper.firstChild), Al && (o.style.width = "0px"), ia(o, "input", function() {
      wl && Cl >= 9 && n.hasSelection && (n.hasSelection = null), r.poll()
    }), ia(o, "paste", function(e) {
      Oe(i, e) || el(e, i) || (i.state.pasteIncoming = !0, r.fastPoll())
    }), ia(o, "cut", t), ia(o, "copy", t), ia(e.scroller, "paste", function(t) {
      Et(e, t) || Oe(i, t) || (i.state.pasteIncoming = !0, r.focus())
    }), ia(e.lineSpace, "selectstart", function(t) {
      Et(e, t) || De(t)
    }), ia(o, "compositionstart", function() {
      var e = i.getCursor("from");
      r.composing && r.composing.range.clear(), r.composing = {
        start: e,
        range: i.markText(e, i.getCursor("to"), {
          className: "CodeMirror-composing"
        })
      }
    }), ia(o, "compositionend", function() {
      r.composing && (r.poll(), r.composing.range.clear(), r.composing = null)
    })
  }, ls.prototype.createField = function(e) {
    this.wrapper = il(), this.textarea = this.wrapper.firstChild
  }, ls.prototype.prepareSelection = function() {
    var e = this.cm,
      t = e.display,
      n = e.doc,
      r = Nn(e);
    if (e.options.moveInputWithCursor) {
      var i = un(e, n.sel.primary().head, "div"),
        o = t.wrapper.getBoundingClientRect(),
        l = t.lineDiv.getBoundingClientRect();
      r.teTop = Math.max(0, Math.min(t.wrapper.clientHeight - 10, i.top + l.top - o.top)), r.teLeft = Math.max(0, Math.min(t.wrapper.clientWidth - 10, i.left + l.left - o.left))
    }
    return r
  }, ls.prototype.showSelection = function(e) {
    var t = this.cm,
      r = t.display;
    n(r.cursorDiv, e.cursors), n(r.selectionDiv, e.selection), null != e.teTop && (this.wrapper.style.top = e.teTop + "px", this.wrapper.style.left = e.teLeft + "px")
  }, ls.prototype.reset = function(e) {
    if (!this.contextMenuPending && !this.composing) {
      var t = this.cm;
      if (t.somethingSelected()) {
        this.prevInput = "";
        var n = t.getSelection();
        this.textarea.value = n, t.state.focused && jl(this.textarea), wl && Cl >= 9 && (this.hasSelection = n)
      } else e || (this.prevInput = this.textarea.value = "", wl && Cl >= 9 && (this.hasSelection = null))
    }
  }, ls.prototype.getField = function() {
    return this.textarea
  }, ls.prototype.supportsTouch = function() {
    return !1
  }, ls.prototype.focus = function() {
    if ("nocursor" != this.cm.options.readOnly && (!Dl || l() != this.textarea)) try {
      this.textarea.focus()
    } catch (e) {}
  }, ls.prototype.blur = function() {
    this.textarea.blur()
  }, ls.prototype.resetPosition = function() {
    this.wrapper.style.top = this.wrapper.style.left = 0
  }, ls.prototype.receivedFocus = function() {
    this.slowPoll()
  }, ls.prototype.slowPoll = function() {
    var e = this;
    this.pollingFast || this.polling.set(this.cm.options.pollInterval, function() {
      e.poll(), e.cm.state.focused && e.slowPoll()
    })
  }, ls.prototype.fastPoll = function() {
    function e() {
      var r = n.poll();
      r || t ? (n.pollingFast = !1, n.slowPoll()) : (t = !0, n.polling.set(60, e))
    }
    var t = !1,
      n = this;
    n.pollingFast = !0, n.polling.set(20, e)
  }, ls.prototype.poll = function() {
    var e = this,
      t = this.cm,
      n = this.textarea,
      r = this.prevInput;
    if (this.contextMenuPending || !t.state.focused || aa(n) && !r && !this.composing || t.isReadOnly() || t.options.disableInput || t.state.keySeq) return !1;
    var i = n.value;
    if (i == r && !t.somethingSelected()) return !1;
    if (wl && Cl >= 9 && this.hasSelection === i || Hl && /[\uf700-\uf7ff]/.test(i)) return t.display.input.reset(), !1;
    if (t.doc.sel == t.display.selForContextMenu) {
      var o = i.charCodeAt(0);
      if (8203 != o || r || (r = "​"), 8666 == o) return this.reset(), this.cm.execCommand("undo")
    }
    for (var l = 0, a = Math.min(r.length, i.length); l < a && r.charCodeAt(l) == i.charCodeAt(l);) ++l;
    return pr(t, function() {
      Jo(t, i.slice(l), r.length - l, null, e.composing ? "*compose" : null), i.length > 1e3 || i.indexOf("\n") > -1 ? n.value = e.prevInput = "" : e.prevInput = i, e.composing && (e.composing.range.clear(), e.composing.range = t.markText(e.composing.start, t.getCursor("to"), {
        className: "CodeMirror-composing"
      }))
    }), !0
  }, ls.prototype.ensurePolled = function() {
    this.pollingFast && this.poll() && (this.pollingFast = !1)
  }, ls.prototype.onKeyPress = function() {
    wl && Cl >= 9 && (this.hasSelection = null), this.fastPoll()
  }, ls.prototype.onContextMenu = function(e) {
    function t() {
      if (null != l.selectionStart) {
        var e = i.somethingSelected(),
          t = "​" + (e ? l.value : "");
        l.value = "⇚", l.value = t, r.prevInput = e ? "" : "​", l.selectionStart = 1, l.selectionEnd = t.length, o.selForContextMenu = i.doc.sel
      }
    }

    function n() {
      if (r.contextMenuPending = !1, r.wrapper.style.cssText = f, l.style.cssText = u, wl && Cl < 9 && o.scrollbars.setScrollTop(o.scroller.scrollTop = s), null != l.selectionStart) {
        (!wl || wl && Cl < 9) && t();
        var e = 0,
          n = function() {
            o.selForContextMenu == i.doc.sel && 0 == l.selectionStart && l.selectionEnd > 0 && "​" == r.prevInput ? gr(i, Ni)(i) : e++ < 10 ? o.detectingSelectAll = setTimeout(n, 500) : (o.selForContextMenu = null, o.input.reset())
          };
        o.detectingSelectAll = setTimeout(n, 200)
      }
    }
    var r = this,
      i = r.cm,
      o = i.display,
      l = r.textarea,
      a = Tn(i, e),
      s = o.scroller.scrollTop;
    if (a && !Tl) {
      var c = i.options.resetSelectionOnContextMenu;
      c && i.doc.sel.contains(a) == -1 && gr(i, wi)(i.doc, jr(a), _l);
      var u = l.style.cssText,
        f = r.wrapper.style.cssText;
      r.wrapper.style.cssText = "position: absolute";
      var d = r.wrapper.getBoundingClientRect();
      l.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - d.top - 5) + "px; left: " + (e.clientX - d.left - 5) + "px;\n      z-index: 1000; background: " + (wl ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
      var h;
      if (kl && (h = window.scrollY), o.input.focus(), kl && window.scrollTo(null, h), o.input.reset(), i.somethingSelected() || (l.value = r.prevInput = " "), r.contextMenuPending = !0, o.selForContextMenu = i.doc.sel, clearTimeout(o.detectingSelectAll), wl && Cl >= 9 && t(), zl) {
        We(e);
        var p = function() {
          Te(window, "mouseup", p), setTimeout(n, 20)
        };
        ia(window, "mouseup", p)
      } else setTimeout(n, 50)
    }
  }, ls.prototype.readOnlyChanged = function(e) {
    e || this.reset(), this.textarea.disabled = "nocursor" == e
  }, ls.prototype.setUneditable = function() {}, ls.prototype.needsContentAttribute = !1, Ko(Xo), is(Xo);
  var as = "iter insert remove copy getEditor constructor".split(" ");
  for (var ss in Ra.prototype) Ra.prototype.hasOwnProperty(ss) && d(as, ss) < 0 && (Xo.prototype[ss] = function(e) {
    return function() {
      return e.apply(this.doc, arguments)
    }
  }(Ra.prototype[ss]));
  return Pe(Ra), Xo.inputStyles = {
    textarea: ls,
    contenteditable: os
  }, Xo.defineMode = function(e) {
    Xo.defaults.mode || "null" == e || (Xo.defaults.mode = e), je.apply(this, arguments)
  }, Xo.defineMIME = qe, Xo.defineMode("null", function() {
    return {
      token: function(e) {
        return e.skipToEnd()
      }
    }
  }), Xo.defineMIME("text/plain", "null"), Xo.defineExtension = function(e, t) {
    Xo.prototype[e] = t
  }, Xo.defineDocExtension = function(e, t) {
    Ra.prototype[e] = t
  }, Xo.fromTextArea = hl, pl(Xo), Xo.version = "5.38.0", Xo
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  var t = {
      autoSelfClosers: {
        area: !0,
        base: !0,
        br: !0,
        col: !0,
        command: !0,
        embed: !0,
        frame: !0,
        hr: !0,
        img: !0,
        input: !0,
        keygen: !0,
        link: !0,
        meta: !0,
        param: !0,
        source: !0,
        track: !0,
        wbr: !0,
        menuitem: !0
      },
      implicitlyClosed: {
        dd: !0,
        li: !0,
        optgroup: !0,
        option: !0,
        p: !0,
        rp: !0,
        rt: !0,
        tbody: !0,
        td: !0,
        tfoot: !0,
        th: !0,
        tr: !0
      },
      contextGrabbers: {
        dd: {
          dd: !0,
          dt: !0
        },
        dt: {
          dd: !0,
          dt: !0
        },
        li: {
          li: !0
        },
        option: {
          option: !0,
          optgroup: !0
        },
        optgroup: {
          optgroup: !0
        },
        p: {
          address: !0,
          article: !0,
          aside: !0,
          blockquote: !0,
          dir: !0,
          div: !0,
          dl: !0,
          fieldset: !0,
          footer: !0,
          form: !0,
          h1: !0,
          h2: !0,
          h3: !0,
          h4: !0,
          h5: !0,
          h6: !0,
          header: !0,
          hgroup: !0,
          hr: !0,
          menu: !0,
          nav: !0,
          ol: !0,
          p: !0,
          pre: !0,
          section: !0,
          table: !0,
          ul: !0
        },
        rp: {
          rp: !0,
          rt: !0
        },
        rt: {
          rp: !0,
          rt: !0
        },
        tbody: {
          tbody: !0,
          tfoot: !0
        },
        td: {
          td: !0,
          th: !0
        },
        tfoot: {
          tbody: !0
        },
        th: {
          td: !0,
          th: !0
        },
        thead: {
          tbody: !0,
          tfoot: !0
        },
        tr: {
          tr: !0
        }
      },
      doNotIndent: {
        pre: !0
      },
      allowUnquoted: !0,
      allowMissing: !0,
      caseFold: !0
    },
    n = {
      autoSelfClosers: {},
      implicitlyClosed: {},
      contextGrabbers: {},
      doNotIndent: {},
      allowUnquoted: !1,
      allowMissing: !1,
      allowMissingTagName: !1,
      caseFold: !1
    };
  e.defineMode("xml", function(r, i) {
    function o(e, t) {
      function n(n) {
        return t.tokenize = n, n(e, t)
      }
      var r = e.next();
      if ("<" == r) return e.eat("!") ? e.eat("[") ? e.match("CDATA[") ? n(s("atom", "]]>")) : null : e.match("--") ? n(s("comment", "-->")) : e.match("DOCTYPE", !0, !0) ? (e.eatWhile(/[\w\._\-]/), n(c(1))) : null : e.eat("?") ? (e.eatWhile(/[\w\._\-]/), t.tokenize = s("meta", "?>"), "meta") : (T = e.eat("/") ? "closeTag" : "openTag", t.tokenize = l, "tag bracket");
      if ("&" == r) {
        var i;
        return i = e.eat("#") ? e.eat("x") ? e.eatWhile(/[a-fA-F\d]/) && e.eat(";") : e.eatWhile(/[\d]/) && e.eat(";") : e.eatWhile(/[\w\.\-:]/) && e.eat(";"), i ? "atom" : "error"
      }
      return e.eatWhile(/[^&<]/), null
    }

    function l(e, t) {
      var n = e.next();
      if (">" == n || "/" == n && e.eat(">")) return t.tokenize = o, T = ">" == n ? "endTag" : "selfcloseTag", "tag bracket";
      if ("=" == n) return T = "equals", null;
      if ("<" == n) {
        t.tokenize = o, t.state = h, t.tagName = t.tagStart = null;
        var r = t.tokenize(e, t);
        return r ? r + " tag error" : "tag error"
      }
      return /[\'\"]/.test(n) ? (t.tokenize = a(n), t.stringStartCol = e.column(), t.tokenize(e, t)) : (e.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/), "word")
    }

    function a(e) {
      var t = function(t, n) {
        for (; !t.eol();)
          if (t.next() == e) {
            n.tokenize = l;
            break
          } return "string"
      };
      return t.isInAttribute = !0, t
    }

    function s(e, t) {
      return function(n, r) {
        for (; !n.eol();) {
          if (n.match(t)) {
            r.tokenize = o;
            break
          }
          n.next()
        }
        return e
      }
    }

    function c(e) {
      return function(t, n) {
        for (var r; null != (r = t.next());) {
          if ("<" == r) return n.tokenize = c(e + 1), n.tokenize(t, n);
          if (">" == r) {
            if (1 == e) {
              n.tokenize = o;
              break
            }
            return n.tokenize = c(e - 1), n.tokenize(t, n)
          }
        }
        return "meta"
      }
    }

    function u(e, t, n) {
      this.prev = e.context, this.tagName = t, this.indent = e.indented, this.startOfLine = n, (k.doNotIndent.hasOwnProperty(t) || e.context && e.context.noIndent) && (this.noIndent = !0)
    }

    function f(e) {
      e.context && (e.context = e.context.prev)
    }

    function d(e, t) {
      for (var n;;) {
        if (!e.context) return;
        if (n = e.context.tagName, !k.contextGrabbers.hasOwnProperty(n) || !k.contextGrabbers[n].hasOwnProperty(t)) return;
        f(e)
      }
    }

    function h(e, t, n) {
      return "openTag" == e ? (n.tagStart = t.column(), p) : "closeTag" == e ? g : h
    }

    function p(e, t, n) {
      return "word" == e ? (n.tagName = t.current(), M = "tag", y) : k.allowMissingTagName && "endTag" == e ? (M = "tag bracket", y(e, t, n)) : (M = "error", p)
    }

    function g(e, t, n) {
      if ("word" == e) {
        var r = t.current();
        return n.context && n.context.tagName != r && k.implicitlyClosed.hasOwnProperty(n.context.tagName) && f(n), n.context && n.context.tagName == r || k.matchClosing === !1 ? (M = "tag", m) : (M = "tag error", v)
      }
      return k.allowMissingTagName && "endTag" == e ? (M = "tag bracket", m(e, t, n)) : (M = "error", v)
    }

    function m(e, t, n) {
      return "endTag" != e ? (M = "error", m) : (f(n), h)
    }

    function v(e, t, n) {
      return M = "error", m(e, t, n)
    }

    function y(e, t, n) {
      if ("word" == e) return M = "attribute", b;
      if ("endTag" == e || "selfcloseTag" == e) {
        var r = n.tagName,
          i = n.tagStart;
        return n.tagName = n.tagStart = null, "selfcloseTag" == e || k.autoSelfClosers.hasOwnProperty(r) ? d(n, r) : (d(n, r), n.context = new u(n, r, i == n.indented)), h
      }
      return M = "error", y
    }

    function b(e, t, n) {
      return "equals" == e ? x : (k.allowMissing || (M = "error"), y(e, t, n))
    }

    function x(e, t, n) {
      return "string" == e ? w : "word" == e && k.allowUnquoted ? (M = "string", y) : (M = "error", y(e, t, n))
    }

    function w(e, t, n) {
      return "string" == e ? w : y(e, t, n)
    }
    var C = r.indentUnit,
      k = {},
      S = i.htmlMode ? t : n;
    for (var L in S) k[L] = S[L];
    for (var L in i) k[L] = i[L];
    var T, M;
    return o.isInText = !0, {
      startState: function(e) {
        var t = {
          tokenize: o,
          state: h,
          indented: e || 0,
          tagName: null,
          tagStart: null,
          context: null
        };
        return null != e && (t.baseIndent = e), t
      },
      token: function(e, t) {
        if (!t.tagName && e.sol() && (t.indented = e.indentation()), e.eatSpace()) return null;
        T = null;
        var n = t.tokenize(e, t);
        return (n || T) && "comment" != n && (M = null, t.state = t.state(T || n, e, t), M && (n = "error" == M ? n + " error" : M)), n
      },
      indent: function(t, n, r) {
        var i = t.context;
        if (t.tokenize.isInAttribute) return t.tagStart == t.indented ? t.stringStartCol + 1 : t.indented + C;
        if (i && i.noIndent) return e.Pass;
        if (t.tokenize != l && t.tokenize != o) return r ? r.match(/^(\s*)/)[0].length : 0;
        if (t.tagName) return k.multilineTagIndentPastTag !== !1 ? t.tagStart + t.tagName.length + 2 : t.tagStart + C * (k.multilineTagIndentFactor || 1);
        if (k.alignCDATA && /<!\[CDATA\[/.test(n)) return 0;
        var a = n && /^<(\/)?([\w_:\.-]*)/.exec(n);
        if (a && a[1])
          for (; i;) {
            if (i.tagName == a[2]) {
              i = i.prev;
              break
            }
            if (!k.implicitlyClosed.hasOwnProperty(i.tagName)) break;
            i = i.prev
          } else if (a)
            for (; i;) {
              var s = k.contextGrabbers[i.tagName];
              if (!s || !s.hasOwnProperty(a[2])) break;
              i = i.prev
            }
        for (; i && i.prev && !i.startOfLine;) i = i.prev;
        return i ? i.indent + C : t.baseIndent || 0
      },
      electricInput: /<\/[\s\w:]+>$/,
      blockCommentStart: "<!--",
      blockCommentEnd: "-->",
      configuration: k.htmlMode ? "html" : "xml",
      helperType: k.htmlMode ? "html" : "xml",
      skipAttribute: function(e) {
        e.state == x && (e.state = y)
      }
    }
  }), e.defineMIME("text/xml", "xml"), e.defineMIME("application/xml", "xml"), e.mimeModes.hasOwnProperty("text/html") || e.defineMIME("text/html", {
    name: "xml",
    htmlMode: !0
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("../xml/xml"), require("../javascript/javascript"), require("../css/css")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../xml/xml", "../javascript/javascript", "../css/css"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t, n) {
    var r = e.current(),
      i = r.search(t);
    return i > -1 ? e.backUp(r.length - i) : r.match(/<\/?$/) && (e.backUp(r.length), e.match(t, !1) || e.match(r)), n
  }

  function n(e) {
    var t = s[e];
    return t ? t : s[e] = new RegExp("\\s+" + e + "\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*")
  }

  function r(e, t) {
    var r = e.match(n(t));
    return r ? /^\s*(.*?)\s*$/.exec(r[2])[1] : ""
  }

  function i(e, t) {
    return new RegExp((t ? "^" : "") + "</s*" + e + "s*>", "i")
  }

  function o(e, t) {
    for (var n in e)
      for (var r = t[n] || (t[n] = []), i = e[n], o = i.length - 1; o >= 0; o--) r.unshift(i[o])
  }

  function l(e, t) {
    for (var n = 0; n < e.length; n++) {
      var i = e[n];
      if (!i[0] || i[1].test(r(t, i[0]))) return i[2]
    }
  }
  var a = {
      script: [
        ["lang", /(javascript|babel)/i, "javascript"],
        ["type", /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i, "javascript"],
        ["type", /./, "text/plain"],
        [null, null, "javascript"]
      ],
      style: [
        ["lang", /^css$/i, "css"],
        ["type", /^(text\/)?(x-)?(stylesheet|css)$/i, "css"],
        ["type", /./, "text/plain"],
        [null, null, "css"]
      ]
    },
    s = {};
  e.defineMode("htmlmixed", function(n, r) {
    function s(r, o) {
      var a, f = c.token(r, o.htmlState),
        d = /\btag\b/.test(f);
      if (d && !/[<>\s\/]/.test(r.current()) && (a = o.htmlState.tagName && o.htmlState.tagName.toLowerCase()) && u.hasOwnProperty(a)) o.inTag = a + " ";
      else if (o.inTag && d && />$/.test(r.current())) {
        var h = /^([\S]+) (.*)/.exec(o.inTag);
        o.inTag = null;
        var p = ">" == r.current() && l(u[h[1]], h[2]),
          g = e.getMode(n, p),
          m = i(h[1], !0),
          v = i(h[1], !1);
        o.token = function(e, n) {
          return e.match(m, !1) ? (n.token = s, n.localState = n.localMode = null, null) : t(e, v, n.localMode.token(e, n.localState))
        }, o.localMode = g, o.localState = e.startState(g, c.indent(o.htmlState, ""))
      } else o.inTag && (o.inTag += r.current(), r.eol() && (o.inTag += " "));
      return f
    }
    var c = e.getMode(n, {
        name: "xml",
        htmlMode: !0,
        multilineTagIndentFactor: r.multilineTagIndentFactor,
        multilineTagIndentPastTag: r.multilineTagIndentPastTag
      }),
      u = {},
      f = r && r.tags,
      d = r && r.scriptTypes;
    if (o(a, u), f && o(f, u), d)
      for (var h = d.length - 1; h >= 0; h--) u.script.unshift(["type", d[h].matches, d[h].mode]);
    return {
      startState: function() {
        var t = e.startState(c);
        return {
          token: s,
          inTag: null,
          localMode: null,
          localState: null,
          htmlState: t
        }
      },
      copyState: function(t) {
        var n;
        return t.localState && (n = e.copyState(t.localMode, t.localState)), {
          token: t.token,
          inTag: t.inTag,
          localMode: t.localMode,
          localState: n,
          htmlState: e.copyState(c, t.htmlState)
        }
      },
      token: function(e, t) {
        return t.token(e, t)
      },
      indent: function(t, n, r) {
        return !t.localMode || /^\s*<\//.test(n) ? c.indent(t.htmlState, n) : t.localMode.indent ? t.localMode.indent(t.localState, n, r) : e.Pass
      },
      innerMode: function(e) {
        return {
          state: e.localState || e.htmlState,
          mode: e.localMode || c
        }
      }
    }
  }, "xml", "javascript", "css"), e.defineMIME("text/html", "htmlmixed")
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t) {
    if (!window.JSHINT) return window.console && window.console.error("Error: window.JSHINT not defined, CodeMirror JavaScript linting cannot run."), [];
    t.indent || (t.indent = 1), JSHINT(e, t, t.globals);
    var r = JSHINT.data().errors,
      i = [];
    return r && n(r, i), i
  }

  function n(t, n) {
    for (var r = 0; r < t.length; r++) {
      var i = t[r];
      if (i) {
        if (i.line <= 0) {
          window.console && window.console.warn("Cannot display JSHint error (invalid line " + i.line + ")", i);
          continue
        }
        var o = i.character - 1,
          l = o + 1;
        if (i.evidence) {
          var a = i.evidence.substring(o).search(/.\b/);
          a > -1 && (l += a)
        }
        var s = {
          message: i.reason,
          severity: i.code && i.code.startsWith("W") ? "warning" : "error",
          from: e.Pos(i.line - 1, o),
          to: e.Pos(i.line - 1, l)
        };
        n.push(s)
      }
    }
  }
  e.registerHelper("lint", "javascript", t)
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(t, n) {
    function r(t) {
      return i.parentNode ? (i.style.top = Math.max(0, t.clientY - i.offsetHeight - 5) + "px", void(i.style.left = t.clientX + 5 + "px")) : e.off(document, "mousemove", r)
    }
    var i = document.createElement("div");
    return i.className = "CodeMirror-lint-tooltip", i.appendChild(n.cloneNode(!0)), document.body.appendChild(i), e.on(document, "mousemove", r), r(t), null != i.style.opacity && (i.style.opacity = 1), i
  }

  function n(e) {
    e.parentNode && e.parentNode.removeChild(e)
  }

  function r(e) {
    e.parentNode && (null == e.style.opacity && n(e), e.style.opacity = 0, setTimeout(function() {
      n(e)
    }, 600))
  }

  function i(n, i, o) {
    function l() {
      e.off(o, "mouseout", l), a && (r(a), a = null)
    }
    var a = t(n, i),
      s = setInterval(function() {
        if (a)
          for (var e = o;; e = e.parentNode) {
            if (e && 11 == e.nodeType && (e = e.host), e == document.body) return;
            if (!e) {
              l();
              break
            }
          }
        if (!a) return clearInterval(s)
      }, 400);
    e.on(o, "mouseout", l)
  }

  function o(e, t, n) {
    this.marked = [], this.options = t, this.timeout = null, this.hasGutter = n, this.onMouseOver = function(t) {
      v(e, t)
    }, this.waitingFor = 0
  }

  function l(e, t) {
    return t instanceof Function ? {
      getAnnotations: t
    } : (t && t !== !0 || (t = {}), t)
  }

  function a(e) {
    var t = e.state.lint;
    t.hasGutter && e.clearGutter(y);
    for (var n = 0; n < t.marked.length; ++n) t.marked[n].clear();
    t.marked.length = 0
  }

  function s(t, n, r, o) {
    var l = document.createElement("div"),
      a = l;
    return l.className = "CodeMirror-lint-marker-" + n, r && (a = l.appendChild(document.createElement("div")), a.className = "CodeMirror-lint-marker-multiple"), 0 != o && e.on(a, "mouseover", function(e) {
      i(e, t, a)
    }), l
  }

  function c(e, t) {
    return "error" == e ? e : t
  }

  function u(e) {
    for (var t = [], n = 0; n < e.length; ++n) {
      var r = e[n],
        i = r.from.line;
      (t[i] || (t[i] = [])).push(r)
    }
    return t
  }

  function f(e) {
    var t = e.severity;
    t || (t = "error");
    var n = document.createElement("div");
    return n.className = "CodeMirror-lint-message-" + t, "undefined" != typeof e.messageHTML ? n.innerHTML = e.messageHTML : n.appendChild(document.createTextNode(e.message)), n
  }

  function d(t, n, r) {
    function i() {
      l = -1, t.off("change", i)
    }
    var o = t.state.lint,
      l = ++o.waitingFor;
    t.on("change", i), n(t.getValue(), function(n, r) {
      t.off("change", i), o.waitingFor == l && (r && n instanceof e && (n = r), t.operation(function() {
        p(t, n)
      }))
    }, r, t)
  }

  function h(t) {
    var n = t.state.lint,
      r = n.options,
      i = r.options || r,
      o = r.getAnnotations || t.getHelper(e.Pos(0, 0), "lint");
    if (o)
      if (r.async || o.async) d(t, o, i);
      else {
        var l = o(t.getValue(), i, t);
        if (!l) return;
        l.then ? l.then(function(e) {
          t.operation(function() {
            p(t, e)
          })
        }) : t.operation(function() {
          p(t, l)
        })
      }
  }

  function p(e, t) {
    a(e);
    for (var n = e.state.lint, r = n.options, i = u(t), o = 0; o < i.length; ++o) {
      var l = i[o];
      if (l) {
        for (var d = null, h = n.hasGutter && document.createDocumentFragment(), p = 0; p < l.length; ++p) {
          var g = l[p],
            m = g.severity;
          m || (m = "error"), d = c(d, m), r.formatAnnotation && (g = r.formatAnnotation(g)), n.hasGutter && h.appendChild(f(g)), g.to && n.marked.push(e.markText(g.from, g.to, {
            className: "CodeMirror-lint-mark-" + m,
            __annotation: g
          }))
        }
        n.hasGutter && e.setGutterMarker(o, y, s(h, d, l.length > 1, n.options.tooltips))
      }
    }
    r.onUpdateLinting && r.onUpdateLinting(t, i, e)
  }

  function g(e) {
    var t = e.state.lint;
    t && (clearTimeout(t.timeout), t.timeout = setTimeout(function() {
      h(e)
    }, t.options.delay || 500))
  }

  function m(e, t) {
    for (var n = t.target || t.srcElement, r = document.createDocumentFragment(), o = 0; o < e.length; o++) {
      var l = e[o];
      r.appendChild(f(l))
    }
    i(t, r, n)
  }

  function v(e, t) {
    var n = t.target || t.srcElement;
    if (/\bCodeMirror-lint-mark-/.test(n.className)) {
      for (var r = n.getBoundingClientRect(), i = (r.left + r.right) / 2, o = (r.top + r.bottom) / 2, l = e.findMarksAt(e.coordsChar({
          left: i,
          top: o
        }, "client")), a = [], s = 0; s < l.length; ++s) {
        var c = l[s].__annotation;
        c && a.push(c)
      }
      a.length && m(a, t)
    }
  }
  var y = "CodeMirror-lint-markers";
  e.defineOption("lint", !1, function(t, n, r) {
    if (r && r != e.Init && (a(t), t.state.lint.options.lintOnChange !== !1 && t.off("change", g), e.off(t.getWrapperElement(), "mouseover", t.state.lint.onMouseOver), clearTimeout(t.state.lint.timeout), delete t.state.lint), n) {
      for (var i = t.getOption("gutters"), s = !1, c = 0; c < i.length; ++c) i[c] == y && (s = !0);
      var u = t.state.lint = new o(t, l(t, n), s);
      u.options.lintOnChange !== !1 && t.on("change", g), 0 != u.options.tooltips && "gutter" != u.options.tooltips && e.on(t.getWrapperElement(), "mouseover", u.onMouseOver), h(t)
    }
  }), e.defineExtension("performLint", function() {
    this.state.lint && h(this)
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  function t(e, t) {
    for (var n = 0, r = e.length; n < r; ++n) t(e[n])
  }

  function n(e, t) {
    if (!Array.prototype.indexOf) {
      for (var n = e.length; n--;)
        if (e[n] === t) return !0;
      return !1
    }
    return e.indexOf(t) != -1
  }

  function r(t, n, r, i) {
    var o = t.getCursor(),
      l = r(t, o);
    if (!/\b(?:string|comment)\b/.test(l.type)) {
      var a = e.innerMode(t.getMode(), l.state);
      if ("json" !== a.mode.helperType) {
        l.state = a.state, /^[\w$_]*$/.test(l.string) ? l.end > o.ch && (l.end = o.ch, l.string = l.string.slice(0, o.ch - l.start)) : l = {
          start: o.ch,
          end: o.ch,
          string: "",
          state: l.state,
          type: "." == l.string ? "property" : null
        };
        for (var u = l;
          "property" == u.type;) {
          if (u = r(t, c(o.line, u.start)), "." != u.string) return;
          if (u = r(t, c(o.line, u.start)), !f) var f = [];
          f.push(u)
        }
        return {
          list: s(l, f, n, i),
          from: c(o.line, l.start),
          to: c(o.line, l.end)
        }
      }
    }
  }

  function i(e, t) {
    return r(e, h, function(e, t) {
      return e.getTokenAt(t)
    }, t)
  }

  function o(e, t) {
    var n = e.getTokenAt(t);
    return t.ch == n.start + 1 && "." == n.string.charAt(0) ? (n.end = n.start, n.string = ".", n.type = "property") : /^\.[\w$_]*$/.test(n.string) && (n.type = "property", n.start++, n.string = n.string.replace(/\./, "")), n
  }

  function l(e, t) {
    return r(e, p, o, t)
  }

  function a(e, t) {
    if (Object.getOwnPropertyNames && Object.getPrototypeOf)
      for (var n = e; n; n = Object.getPrototypeOf(n)) Object.getOwnPropertyNames(n).forEach(t);
    else
      for (var r in e) t(r)
  }

  function s(e, r, i, o) {
    function l(e) {
      0 != e.lastIndexOf(h, 0) || n(c, e) || c.push(e)
    }

    function s(e) {
      "string" == typeof e ? t(u, l) : e instanceof Array ? t(f, l) : e instanceof Function && t(d, l), a(e, l)
    }
    var c = [],
      h = e.string,
      p = o && o.globalScope || window;
    if (r && r.length) {
      var g, m = r.pop();
      for (m.type && 0 === m.type.indexOf("variable") ? (o && o.additionalContext && (g = o.additionalContext[m.string]), o && o.useGlobalScope === !1 || (g = g || p[m.string])) : "string" == m.type ? g = "" : "atom" == m.type ? g = 1 : "function" == m.type && (null == p.jQuery || "$" != m.string && "jQuery" != m.string || "function" != typeof p.jQuery ? null != p._ && "_" == m.string && "function" == typeof p._ && (g = p._()) : g = p.jQuery()); null != g && r.length;) g = g[r.pop().string];
      null != g && s(g)
    } else {
      for (var v = e.state.localVars; v; v = v.next) l(v.name);
      for (var v = e.state.globalVars; v; v = v.next) l(v.name);
      o && o.useGlobalScope === !1 || s(p), t(i, l)
    }
    return c
  }
  var c = e.Pos;
  e.registerHelper("hint", "javascript", i), e.registerHelper("hint", "coffeescript", l);
  var u = "charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight toUpperCase toLowerCase split concat match replace search".split(" "),
    f = "length concat join splice push pop shift unshift slice reverse sort indexOf lastIndexOf every some filter forEach map reduce reduceRight ".split(" "),
    d = "prototype apply call bind".split(" "),
    h = "break case catch class const continue debugger default delete do else export extends false finally for function if in import instanceof new null return super switch this throw true try typeof var void while with yield".split(" "),
    p = "and break catch class continue delete do else extends false finally for if in instanceof isnt new no not null of off on or return switch then throw true try typeof until void while with yes".split(" ")
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  function t(t, n, r) {
    var i, o = t.getWrapperElement();
    return i = o.appendChild(document.createElement("div")), r ? i.className = "CodeMirror-dialog CodeMirror-dialog-bottom" : i.className = "CodeMirror-dialog CodeMirror-dialog-top", "string" == typeof n ? i.innerHTML = n : i.appendChild(n), e.addClass(o, "dialog-opened"), i
  }

  function n(e, t) {
    e.state.currentNotificationClose && e.state.currentNotificationClose(), e.state.currentNotificationClose = t
  }
  e.defineExtension("openDialog", function(r, i, o) {
    function l(t) {
      if ("string" == typeof t) f.value = t;
      else {
        if (c) return;
        c = !0, e.rmClass(s.parentNode, "dialog-opened"), s.parentNode.removeChild(s), u.focus(), o.onClose && o.onClose(s)
      }
    }
    o || (o = {}), n(this, null);
    var a, s = t(this, r, o.bottom),
      c = !1,
      u = this,
      f = s.getElementsByTagName("input")[0];
    return f ? (f.focus(), o.value && (f.value = o.value, o.selectValueOnOpen !== !1 && f.select()), o.onInput && e.on(f, "input", function(e) {
      o.onInput(e, f.value, l)
    }), o.onKeyUp && e.on(f, "keyup", function(e) {
      o.onKeyUp(e, f.value, l)
    }), e.on(f, "keydown", function(t) {
      o && o.onKeyDown && o.onKeyDown(t, f.value, l) || ((27 == t.keyCode || o.closeOnEnter !== !1 && 13 == t.keyCode) && (f.blur(), e.e_stop(t), l()), 13 == t.keyCode && i(f.value, t))
    }), o.closeOnBlur !== !1 && e.on(f, "blur", l)) : (a = s.getElementsByTagName("button")[0]) && (e.on(a, "click", function() {
      l(), u.focus()
    }), o.closeOnBlur !== !1 && e.on(a, "blur", l), a.focus()), l
  }), e.defineExtension("openConfirm", function(r, i, o) {
    function l() {
      c || (c = !0, e.rmClass(a.parentNode, "dialog-opened"), a.parentNode.removeChild(a), u.focus())
    }
    n(this, null);
    var a = t(this, r, o && o.bottom),
      s = a.getElementsByTagName("button"),
      c = !1,
      u = this,
      f = 1;
    s[0].focus();
    for (var d = 0; d < s.length; ++d) {
      var h = s[d];
      ! function(t) {
        e.on(h, "click", function(n) {
          e.e_preventDefault(n), l(), t && t(u)
        })
      }(i[d]), e.on(h, "blur", function() {
        --f, setTimeout(function() {
          f <= 0 && l()
        }, 200)
      }), e.on(h, "focus", function() {
        ++f
      })
    }
  }), e.defineExtension("openNotification", function(r, i) {
    function o() {
      s || (s = !0, clearTimeout(l), e.rmClass(a.parentNode, "dialog-opened"), a.parentNode.removeChild(a))
    }
    n(this, o);
    var l, a = t(this, r, i && i.bottom),
      s = !1,
      c = i && "undefined" != typeof i.duration ? i.duration : 5e3;
    return e.on(a, "click", function(t) {
      e.e_preventDefault(t), o()
    }), c && (l = setTimeout(o, c)), o
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(t, i, o, l) {
    function a(e) {
      var n = s(t, i);
      if (!n || n.to.line - n.from.line < c) return null;
      for (var r = t.findMarksAt(n.from), o = 0; o < r.length; ++o)
        if (r[o].__isFold && "fold" !== l) {
          if (!e) return null;
          n.cleared = !0, r[o].clear()
        } return n
    }
    if (o && o.call) {
      var s = o;
      o = null
    } else var s = r(t, o, "rangeFinder");
    "number" == typeof i && (i = e.Pos(i, 0));
    var c = r(t, o, "minFoldSize"),
      u = a(!0);
    if (r(t, o, "scanUp"))
      for (; !u && i.line > t.firstLine();) i = e.Pos(i.line - 1, 0), u = a(!1);
    if (u && !u.cleared && "unfold" !== l) {
      var f = n(t, o);
      e.on(f, "mousedown", function(t) {
        d.clear(), e.e_preventDefault(t)
      });
      var d = t.markText(u.from, u.to, {
        replacedWith: f,
        clearOnEnter: r(t, o, "clearOnEnter"),
        __isFold: !0
      });
      d.on("clear", function(n, r) {
        e.signal(t, "unfold", t, n, r)
      }), e.signal(t, "fold", t, u.from, u.to)
    }
  }

  function n(e, t) {
    var n = r(e, t, "widget");
    if ("string" == typeof n) {
      var i = document.createTextNode(n);
      n = document.createElement("span"), n.appendChild(i), n.className = "CodeMirror-foldmarker"
    } else n && (n = n.cloneNode(!0));
    return n
  }

  function r(e, t, n) {
    if (t && void 0 !== t[n]) return t[n];
    var r = e.options.foldOptions;
    return r && void 0 !== r[n] ? r[n] : i[n]
  }
  e.newFoldFunction = function(e, n) {
    return function(r, i) {
      t(r, i, {
        rangeFinder: e,
        widget: n
      })
    }
  }, e.defineExtension("foldCode", function(e, n, r) {
    t(this, e, n, r)
  }), e.defineExtension("isFolded", function(e) {
    for (var t = this.findMarksAt(e), n = 0; n < t.length; ++n)
      if (t[n].__isFold) return !0
  }), e.commands.toggleFold = function(e) {
    e.foldCode(e.getCursor())
  }, e.commands.fold = function(e) {
    e.foldCode(e.getCursor(), null, "fold")
  }, e.commands.unfold = function(e) {
    e.foldCode(e.getCursor(), null, "unfold")
  }, e.commands.foldAll = function(t) {
    t.operation(function() {
      for (var n = t.firstLine(), r = t.lastLine(); n <= r; n++) t.foldCode(e.Pos(n, 0), null, "fold")
    })
  }, e.commands.unfoldAll = function(t) {
    t.operation(function() {
      for (var n = t.firstLine(), r = t.lastLine(); n <= r; n++) t.foldCode(e.Pos(n, 0), null, "unfold")
    })
  }, e.registerHelper("fold", "combine", function() {
    var e = Array.prototype.slice.call(arguments, 0);
    return function(t, n) {
      for (var r = 0; r < e.length; ++r) {
        var i = e[r](t, n);
        if (i) return i
      }
    }
  }), e.registerHelper("fold", "auto", function(e, t) {
    for (var n = e.getHelpers(t, "fold"), r = 0; r < n.length; r++) {
      var i = n[r](e, t);
      if (i) return i
    }
  });
  var i = {
    rangeFinder: e.fold.auto,
    widget: "↔",
    minFoldSize: 0,
    scanUp: !1,
    clearOnEnter: !0
  };
  e.defineOption("foldOptions", null), e.defineExtension("foldOption", function(e, t) {
    return r(this, e, t)
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.registerHelper("fold", "brace", function(t, n) {
    function r(r) {
      for (var a = n.ch, s = 0;;) {
        var c = a <= 0 ? -1 : l.lastIndexOf(r, a - 1);
        if (c != -1) {
          if (1 == s && c < n.ch) break;
          if (i = t.getTokenTypeAt(e.Pos(o, c + 1)), !/^(comment|string)/.test(i)) return c + 1;
          a = c - 1
        } else {
          if (1 == s) break;
          s = 1, a = l.length
        }
      }
    }
    var i, o = n.line,
      l = t.getLine(o),
      a = "{",
      s = "}",
      c = r("{");
    if (null == c && (a = "[", s = "]", c = r("[")), null != c) {
      var u, f, d = 1,
        h = t.lastLine();
      e: for (var p = o; p <= h; ++p)
        for (var g = t.getLine(p), m = p == o ? c : 0;;) {
          var v = g.indexOf(a, m),
            y = g.indexOf(s, m);
          if (v < 0 && (v = g.length), y < 0 && (y = g.length), m = Math.min(v, y), m == g.length) break;
          if (t.getTokenTypeAt(e.Pos(p, m + 1)) == i)
            if (m == v) ++d;
            else if (!--d) {
            u = p, f = m;
            break e
          }++m
        }
      if (null != u && (o != u || f != c)) return {
        from: e.Pos(o, c),
        to: e.Pos(u, f)
      }
    }
  }), e.registerHelper("fold", "import", function(t, n) {
    function r(n) {
      if (n < t.firstLine() || n > t.lastLine()) return null;
      var r = t.getTokenAt(e.Pos(n, 1));
      if (/\S/.test(r.string) || (r = t.getTokenAt(e.Pos(n, r.end + 1))), "keyword" != r.type || "import" != r.string) return null;
      for (var i = n, o = Math.min(t.lastLine(), n + 10); i <= o; ++i) {
        var l = t.getLine(i),
          a = l.indexOf(";");
        if (a != -1) return {
          startCh: r.end,
          end: e.Pos(i, a)
        }
      }
    }
    var i, o = n.line,
      l = r(o);
    if (!l || r(o - 1) || (i = r(o - 2)) && i.end.line == o - 1) return null;
    for (var a = l.end;;) {
      var s = r(a.line + 1);
      if (null == s) break;
      a = s.end
    }
    return {
      from: t.clipPos(e.Pos(o, l.startCh + 1)),
      to: a
    }
  }), e.registerHelper("fold", "include", function(t, n) {
    function r(n) {
      if (n < t.firstLine() || n > t.lastLine()) return null;
      var r = t.getTokenAt(e.Pos(n, 1));
      return /\S/.test(r.string) || (r = t.getTokenAt(e.Pos(n, r.end + 1))), "meta" == r.type && "#include" == r.string.slice(0, 8) ? r.start + 8 : void 0
    }
    var i = n.line,
      o = r(i);
    if (null == o || null != r(i - 1)) return null;
    for (var l = i;;) {
      var a = r(l + 1);
      if (null == a) break;
      ++l
    }
    return {
      from: e.Pos(i, o + 1),
      to: t.clipPos(e.Pos(l))
    }
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("./foldcode")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./foldcode"], e) : e(CodeMirror);
}(function(e) {
  "use strict";

  function t(e) {
    this.options = e, this.from = this.to = 0
  }

  function n(e) {
    return e === !0 && (e = {}), null == e.gutter && (e.gutter = "CodeMirror-foldgutter"), null == e.indicatorOpen && (e.indicatorOpen = "CodeMirror-foldgutter-open"), null == e.indicatorFolded && (e.indicatorFolded = "CodeMirror-foldgutter-folded"), e
  }

  function r(e, t) {
    for (var n = e.findMarks(f(t, 0), f(t + 1, 0)), r = 0; r < n.length; ++r)
      if (n[r].__isFold && n[r].find().from.line == t) return n[r]
  }

  function i(e) {
    if ("string" == typeof e) {
      var t = document.createElement("div");
      return t.className = e + " CodeMirror-guttermarker-subtle", t
    }
    return e.cloneNode(!0)
  }

  function o(e, t, n) {
    var o = e.state.foldGutter.options,
      l = t,
      a = e.foldOption(o, "minFoldSize"),
      s = e.foldOption(o, "rangeFinder");
    e.eachLine(t, n, function(t) {
      var n = null;
      if (r(e, l)) n = i(o.indicatorFolded);
      else {
        var c = f(l, 0),
          u = s && s(e, c);
        u && u.to.line - u.from.line >= a && (n = i(o.indicatorOpen))
      }
      e.setGutterMarker(t, o.gutter, n), ++l
    })
  }

  function l(e) {
    var t = e.getViewport(),
      n = e.state.foldGutter;
    n && (e.operation(function() {
      o(e, t.from, t.to)
    }), n.from = t.from, n.to = t.to)
  }

  function a(e, t, n) {
    var i = e.state.foldGutter;
    if (i) {
      var o = i.options;
      if (n == o.gutter) {
        var l = r(e, t);
        l ? l.clear() : e.foldCode(f(t, 0), o.rangeFinder)
      }
    }
  }

  function s(e) {
    var t = e.state.foldGutter;
    if (t) {
      var n = t.options;
      t.from = t.to = 0, clearTimeout(t.changeUpdate), t.changeUpdate = setTimeout(function() {
        l(e)
      }, n.foldOnChangeTimeSpan || 600)
    }
  }

  function c(e) {
    var t = e.state.foldGutter;
    if (t) {
      var n = t.options;
      clearTimeout(t.changeUpdate), t.changeUpdate = setTimeout(function() {
        var n = e.getViewport();
        t.from == t.to || n.from - t.to > 20 || t.from - n.to > 20 ? l(e) : e.operation(function() {
          n.from < t.from && (o(e, n.from, t.from), t.from = n.from), n.to > t.to && (o(e, t.to, n.to), t.to = n.to)
        })
      }, n.updateViewportTimeSpan || 400)
    }
  }

  function u(e, t) {
    var n = e.state.foldGutter;
    if (n) {
      var r = t.line;
      r >= n.from && r < n.to && o(e, r, r + 1)
    }
  }
  e.defineOption("foldGutter", !1, function(r, i, o) {
    o && o != e.Init && (r.clearGutter(r.state.foldGutter.options.gutter), r.state.foldGutter = null, r.off("gutterClick", a), r.off("change", s), r.off("viewportChange", c), r.off("fold", u), r.off("unfold", u), r.off("swapDoc", s)), i && (r.state.foldGutter = new t(n(i)), l(r), r.on("gutterClick", a), r.on("change", s), r.on("viewportChange", c), r.on("fold", u), r.on("unfold", u), r.on("swapDoc", s))
  });
  var f = e.Pos
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.registerHelper("fold", "markdown", function(t, n) {
    function r(n) {
      var r = t.getTokenTypeAt(e.Pos(n, 0));
      return r && /\bheader\b/.test(r)
    }

    function i(e, t, n) {
      var i = t && t.match(/^#+/);
      return i && r(e) ? i[0].length : (i = n && n.match(/^[=\-]+\s*$/), i && r(e + 1) ? "=" == n[0] ? 1 : 2 : o)
    }
    var o = 100,
      l = t.getLine(n.line),
      a = t.getLine(n.line + 1),
      s = i(n.line, l, a);
    if (s !== o) {
      for (var c = t.lastLine(), u = n.line, f = t.getLine(u + 2); u < c && !(i(u + 1, a, f) <= s);) ++u, a = f, f = t.getLine(u + 2);
      return {
        from: e.Pos(n.line, l.length),
        to: e.Pos(u, t.getLine(u).length)
      }
    }
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t) {
    return e.line - t.line || e.ch - t.ch
  }

  function n(e, t, n, r) {
    this.line = t, this.ch = n, this.cm = e, this.text = e.getLine(t), this.min = r ? Math.max(r.from, e.firstLine()) : e.firstLine(), this.max = r ? Math.min(r.to - 1, e.lastLine()) : e.lastLine()
  }

  function r(e, t) {
    var n = e.cm.getTokenTypeAt(d(e.line, t));
    return n && /\btag\b/.test(n)
  }

  function i(e) {
    if (!(e.line >= e.max)) return e.ch = 0, e.text = e.cm.getLine(++e.line), !0
  }

  function o(e) {
    if (!(e.line <= e.min)) return e.text = e.cm.getLine(--e.line), e.ch = e.text.length, !0
  }

  function l(e) {
    for (;;) {
      var t = e.text.indexOf(">", e.ch);
      if (t == -1) {
        if (i(e)) continue;
        return
      } {
        if (r(e, t + 1)) {
          var n = e.text.lastIndexOf("/", t),
            o = n > -1 && !/\S/.test(e.text.slice(n + 1, t));
          return e.ch = t + 1, o ? "selfClose" : "regular"
        }
        e.ch = t + 1
      }
    }
  }

  function a(e) {
    for (;;) {
      var t = e.ch ? e.text.lastIndexOf("<", e.ch - 1) : -1;
      if (t == -1) {
        if (o(e)) continue;
        return
      }
      if (r(e, t + 1)) {
        g.lastIndex = t, e.ch = t;
        var n = g.exec(e.text);
        if (n && n.index == t) return n
      } else e.ch = t
    }
  }

  function s(e) {
    for (;;) {
      g.lastIndex = e.ch;
      var t = g.exec(e.text);
      if (!t) {
        if (i(e)) continue;
        return
      } {
        if (r(e, t.index + 1)) return e.ch = t.index + t[0].length, t;
        e.ch = t.index + 1
      }
    }
  }

  function c(e) {
    for (;;) {
      var t = e.ch ? e.text.lastIndexOf(">", e.ch - 1) : -1;
      if (t == -1) {
        if (o(e)) continue;
        return
      } {
        if (r(e, t + 1)) {
          var n = e.text.lastIndexOf("/", t),
            i = n > -1 && !/\S/.test(e.text.slice(n + 1, t));
          return e.ch = t + 1, i ? "selfClose" : "regular"
        }
        e.ch = t
      }
    }
  }

  function u(e, t) {
    for (var n = [];;) {
      var r, i = s(e),
        o = e.line,
        a = e.ch - (i ? i[0].length : 0);
      if (!i || !(r = l(e))) return;
      if ("selfClose" != r)
        if (i[1]) {
          for (var c = n.length - 1; c >= 0; --c)
            if (n[c] == i[2]) {
              n.length = c;
              break
            } if (c < 0 && (!t || t == i[2])) return {
            tag: i[2],
            from: d(o, a),
            to: d(e.line, e.ch)
          }
        } else n.push(i[2])
    }
  }

  function f(e, t) {
    for (var n = [];;) {
      var r = c(e);
      if (!r) return;
      if ("selfClose" != r) {
        var i = e.line,
          o = e.ch,
          l = a(e);
        if (!l) return;
        if (l[1]) n.push(l[2]);
        else {
          for (var s = n.length - 1; s >= 0; --s)
            if (n[s] == l[2]) {
              n.length = s;
              break
            } if (s < 0 && (!t || t == l[2])) return {
            tag: l[2],
            from: d(e.line, e.ch),
            to: d(i, o)
          }
        }
      } else a(e)
    }
  }
  var d = e.Pos,
    h = "A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD",
    p = h + "-:.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040",
    g = new RegExp("<(/?)([" + h + "][" + p + "]*)", "g");
  e.registerHelper("fold", "xml", function(e, r) {
    for (var i = new n(e, r.line, 0);;) {
      var o = s(i);
      if (!o || i.line != r.line) return;
      var a = l(i);
      if (!a) return;
      if (!o[1] && "selfClose" != a) {
        var c = d(i.line, i.ch),
          f = u(i, o[2]);
        return f && t(f.from, c) > 0 ? {
          from: c,
          to: f.from
        } : null
      }
    }
  }), e.findMatchingTag = function(e, r, i) {
    var o = new n(e, r.line, r.ch, i);
    if (o.text.indexOf(">") != -1 || o.text.indexOf("<") != -1) {
      var s = l(o),
        c = s && d(o.line, o.ch),
        h = s && a(o);
      if (s && h && !(t(o, r) > 0)) {
        var p = {
          from: d(o.line, o.ch),
          to: c,
          tag: h[2]
        };
        return "selfClose" == s ? {
          open: p,
          close: null,
          at: "open"
        } : h[1] ? {
          open: f(o, h[2]),
          close: p,
          at: "close"
        } : (o = new n(e, c.line, c.ch, i), {
          open: p,
          close: u(o, h[2]),
          at: "open"
        })
      }
    }
  }, e.findEnclosingTag = function(e, t, r, i) {
    for (var o = new n(e, t.line, t.ch, r);;) {
      var l = f(o, i);
      if (!l) break;
      var a = new n(e, t.line, t.ch, r),
        s = u(a, l.tag);
      if (s) return {
        open: l,
        close: s
      }
    }
  }, e.scanForClosingTag = function(e, t, r, i) {
    var o = new n(e, t.line, t.ch, i ? {
      from: 0,
      to: i
    } : null);
    return u(o, r)
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(t, n) {
    var r = t.getLine(n),
      i = r.search(/\S/);
    return i == -1 || /\bcomment\b/.test(t.getTokenTypeAt(e.Pos(n, i + 1))) ? -1 : e.countColumn(r, null, t.getOption("tabSize"))
  }
  e.registerHelper("fold", "indent", function(n, r) {
    var i = t(n, r.line);
    if (!(i < 0)) {
      for (var o = null, l = r.line + 1, a = n.lastLine(); l <= a; ++l) {
        var s = t(n, l);
        if (s == -1);
        else {
          if (!(s > i)) break;
          o = l
        }
      }
      return o ? {
        from: e.Pos(r.line, n.getLine(r.line).length),
        to: e.Pos(o, n.getLine(o).length)
      } : void 0
    }
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.registerGlobalHelper("fold", "comment", function(e) {
    return e.blockCommentStart && e.blockCommentEnd
  }, function(t, n) {
    var r = t.getModeAt(n),
      i = r.blockCommentStart,
      o = r.blockCommentEnd;
    if (i && o) {
      for (var l, a = n.line, s = t.getLine(a), c = n.ch, u = 0;;) {
        var f = c <= 0 ? -1 : s.lastIndexOf(i, c - 1);
        if (f != -1) {
          if (1 == u && f < n.ch) return;
          if (/comment/.test(t.getTokenTypeAt(e.Pos(a, f + 1))) && (0 == f || s.slice(f - o.length, f) == o || !/comment/.test(t.getTokenTypeAt(e.Pos(a, f))))) {
            l = f + i.length;
            break
          }
          c = f - 1
        } else {
          if (1 == u) return;
          u = 1, c = s.length
        }
      }
      var d, h, p = 1,
        g = t.lastLine();
      e: for (var m = a; m <= g; ++m)
        for (var v = t.getLine(m), y = m == a ? l : 0;;) {
          var b = v.indexOf(i, y),
            x = v.indexOf(o, y);
          if (b < 0 && (b = v.length), x < 0 && (x = v.length), y = Math.min(b, x), y == v.length) break;
          if (y == b) ++p;
          else if (!--p) {
            d = m, h = y;
            break e
          }++y
        }
      if (null != d && (a != d || h != l)) return {
        from: e.Pos(a, l),
        to: e.Pos(d, h)
      }
    }
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    var t = e.getWrapperElement();
    e.state.fullScreenRestore = {
      scrollTop: window.pageYOffset,
      scrollLeft: window.pageXOffset,
      width: t.style.width,
      height: t.style.height
    }, t.style.width = "", t.style.height = "auto", t.className += " CodeMirror-fullscreen", document.documentElement.style.overflow = "hidden", e.refresh()
  }

  function n(e) {
    var t = e.getWrapperElement();
    t.className = t.className.replace(/\s*CodeMirror-fullscreen\b/, ""), document.documentElement.style.overflow = "";
    var n = e.state.fullScreenRestore;
    t.style.width = n.width, t.style.height = n.height, window.scrollTo(n.scrollLeft, n.scrollTop), e.refresh()
  }
  e.defineOption("fullScreen", !1, function(r, i, o) {
    o == e.Init && (o = !1), !o != !i && (i ? t(r) : n(r))
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    for (var t = 0; t < e.state.activeLines.length; t++) e.removeLineClass(e.state.activeLines[t], "wrap", o), e.removeLineClass(e.state.activeLines[t], "background", l), e.removeLineClass(e.state.activeLines[t], "gutter", a)
  }

  function n(e, t) {
    if (e.length != t.length) return !1;
    for (var n = 0; n < e.length; n++)
      if (e[n] != t[n]) return !1;
    return !0
  }

  function r(e, r) {
    for (var i = [], s = 0; s < r.length; s++) {
      var c = r[s],
        u = e.getOption("styleActiveLine");
      if ("object" == typeof u && u.nonEmpty ? c.anchor.line == c.head.line : c.empty()) {
        var f = e.getLineHandleVisualStart(c.head.line);
        i[i.length - 1] != f && i.push(f)
      }
    }
    n(e.state.activeLines, i) || e.operation(function() {
      t(e);
      for (var n = 0; n < i.length; n++) e.addLineClass(i[n], "wrap", o), e.addLineClass(i[n], "background", l), e.addLineClass(i[n], "gutter", a);
      e.state.activeLines = i
    })
  }

  function i(e, t) {
    r(e, t.ranges)
  }
  var o = "CodeMirror-activeline",
    l = "CodeMirror-activeline-background",
    a = "CodeMirror-activeline-gutter";
  e.defineOption("styleActiveLine", !1, function(n, o, l) {
    var a = l != e.Init && l;
    o != a && (a && (n.off("beforeSelectionChange", i), t(n), delete n.state.activeLines), o && (n.state.activeLines = [], r(n, n.listSelections()), n.on("beforeSelectionChange", i)))
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.overlayMode = function(t, n, r) {
    return {
      startState: function() {
        return {
          base: e.startState(t),
          overlay: e.startState(n),
          basePos: 0,
          baseCur: null,
          overlayPos: 0,
          overlayCur: null,
          streamSeen: null
        }
      },
      copyState: function(r) {
        return {
          base: e.copyState(t, r.base),
          overlay: e.copyState(n, r.overlay),
          basePos: r.basePos,
          baseCur: null,
          overlayPos: r.overlayPos,
          overlayCur: null
        }
      },
      token: function(e, i) {
        return (e != i.streamSeen || Math.min(i.basePos, i.overlayPos) < e.start) && (i.streamSeen = e, i.basePos = i.overlayPos = e.start), e.start == i.basePos && (i.baseCur = t.token(e, i.base), i.basePos = e.pos), e.start == i.overlayPos && (e.pos = e.start, i.overlayCur = n.token(e, i.overlay), i.overlayPos = e.pos), e.pos = Math.min(i.basePos, i.overlayPos), null == i.overlayCur ? i.baseCur : null != i.baseCur && i.overlay.combineTokens || r && null == i.overlay.combineTokens ? i.baseCur + " " + i.overlayCur : i.overlayCur
      },
      indent: t.indent && function(e, n) {
        return t.indent(e.base, n)
      },
      electricChars: t.electricChars,
      innerMode: function(e) {
        return {
          state: e.base,
          mode: t
        }
      },
      blankLine: function(e) {
        var i, o;
        return t.blankLine && (i = t.blankLine(e.base)), n.blankLine && (o = n.blankLine(e.overlay)), null == o ? i : r && null != i ? i + " " + o : o
      }
    }
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";
  e.runMode = function(t, n, r, i) {
    var o = e.getMode(e.defaults, n),
      l = /MSIE \d/.test(navigator.userAgent),
      a = l && (null == document.documentMode || document.documentMode < 9);
    if (r.appendChild) {
      var s = i && i.tabSize || e.defaults.tabSize,
        c = r,
        u = 0;
      c.innerHTML = "", r = function(e, t) {
        if ("\n" == e) return c.appendChild(document.createTextNode(a ? "\r" : e)), void(u = 0);
        for (var n = "", r = 0;;) {
          var i = e.indexOf("\t", r);
          if (i == -1) {
            n += e.slice(r), u += e.length - r;
            break
          }
          u += i - r, n += e.slice(r, i);
          var o = s - u % s;
          u += o;
          for (var l = 0; l < o; ++l) n += " ";
          r = i + 1
        }
        if (t) {
          var f = c.appendChild(document.createElement("span"));
          f.className = "cm-" + t.replace(/ +/g, " cm-"), f.appendChild(document.createTextNode(n))
        } else c.appendChild(document.createTextNode(n))
      }
    }
    for (var f = e.splitLines(t), d = i && i.state || e.startState(o), h = 0, p = f.length; h < p; ++h) {
      h && r("\n");
      var g = new e.StringStream(f[h]);
      for (!g.string && o.blankLine && o.blankLine(d); !g.eol();) {
        var m = o.token(g, d);
        r(g.current(), m, h, g.start, d), g.start = g.pos
      }
    }
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("./searchcursor"), require("../dialog/dialog")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./searchcursor", "../dialog/dialog"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t) {
    return "string" == typeof e ? e = new RegExp(e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), t ? "gi" : "g") : e.global || (e = new RegExp(e.source, e.ignoreCase ? "gi" : "g")), {
      token: function(t) {
        e.lastIndex = t.pos;
        var n = e.exec(t.string);
        return n && n.index == t.pos ? (t.pos += n[0].length || 1, "searching") : void(n ? t.pos = n.index : t.skipToEnd())
      }
    }
  }

  function n() {
    this.posFrom = this.posTo = this.lastQuery = this.query = null, this.overlay = null
  }

  function r(e) {
    return e.state.search || (e.state.search = new n)
  }

  function i(e) {
    return "string" == typeof e && e == e.toLowerCase()
  }

  function o(e, t, n) {
    return e.getSearchCursor(t, n, {
      caseFold: i(t),
      multiline: !0
    })
  }

  function l(e, t, n, r, i) {
    e.openDialog(t, r, {
      value: n,
      selectValueOnOpen: !0,
      closeOnEnter: !1,
      onClose: function() {
        p(e)
      },
      onKeyDown: i
    })
  }

  function a(e, t, n, r, i) {
    e.openDialog ? e.openDialog(t, i, {
      value: r,
      selectValueOnOpen: !0
    }) : i(prompt(n, r))
  }

  function s(e, t, n, r) {
    e.openConfirm ? e.openConfirm(t, r) : confirm(n) && r[0]()
  }

  function c(e) {
    return e.replace(/\\(.)/g, function(e, t) {
      return "n" == t ? "\n" : "r" == t ? "\r" : t
    })
  }

  function u(e) {
    var t = e.match(/^\/(.*)\/([a-z]*)$/);
    if (t) try {
      e = new RegExp(t[1], t[2].indexOf("i") == -1 ? "" : "i")
    } catch (n) {} else e = c(e);
    return ("string" == typeof e ? "" == e : e.test("")) && (e = /x^/), e
  }

  function f(e, n, r) {
    n.queryText = r, n.query = u(r), e.removeOverlay(n.overlay, i(n.query)), n.overlay = t(n.query, i(n.query)), e.addOverlay(n.overlay), e.showMatchesOnScrollbar && (n.annotate && (n.annotate.clear(), n.annotate = null), n.annotate = e.showMatchesOnScrollbar(n.query, i(n.query)))
  }

  function d(t, n, i, o) {
    var s = r(t);
    if (s.query) return h(t, n);
    var c = t.getSelection() || s.lastQuery;
    if (c instanceof RegExp && "x^" == c.source && (c = null), i && t.openDialog) {
      var u = null,
        d = function(n, r) {
          e.e_stop(r), n && (n != s.queryText && (f(t, s, n), s.posFrom = s.posTo = t.getCursor()), u && (u.style.opacity = 1), h(t, r.shiftKey, function(e, n) {
            var r;
            n.line < 3 && document.querySelector && (r = t.display.wrapper.querySelector(".CodeMirror-dialog")) && r.getBoundingClientRect().bottom - 4 > t.cursorCoords(n, "window").top && ((u = r).style.opacity = .4)
          }))
        };
      l(t, v, c, d, function(n, i) {
        var o = e.keyName(n),
          l = t.getOption("extraKeys"),
          a = l && l[o] || e.keyMap[t.getOption("keyMap")][o];
        "findNext" == a || "findPrev" == a || "findPersistentNext" == a || "findPersistentPrev" == a ? (e.e_stop(n), f(t, r(t), i), t.execCommand(a)) : "find" != a && "findPersistent" != a || (e.e_stop(n), d(i, n))
      }), o && c && (f(t, s, c), h(t, n))
    } else a(t, v, "Search for:", c, function(e) {
      e && !s.query && t.operation(function() {
        f(t, s, e), s.posFrom = s.posTo = t.getCursor(), h(t, n)
      })
    })
  }

  function h(t, n, i) {
    t.operation(function() {
      var l = r(t),
        a = o(t, l.query, n ? l.posFrom : l.posTo);
      (a.find(n) || (a = o(t, l.query, n ? e.Pos(t.lastLine()) : e.Pos(t.firstLine(), 0)), a.find(n))) && (t.setSelection(a.from(), a.to()), t.scrollIntoView({
        from: a.from(),
        to: a.to()
      }, 20), l.posFrom = a.from(), l.posTo = a.to(), i && i(a.from(), a.to()))
    })
  }

  function p(e) {
    e.operation(function() {
      var t = r(e);
      t.lastQuery = t.query, t.query && (t.query = t.queryText = null, e.removeOverlay(t.overlay), t.annotate && (t.annotate.clear(), t.annotate = null))
    })
  }

  function g(e, t, n) {
    e.operation(function() {
      for (var r = o(e, t); r.findNext();)
        if ("string" != typeof t) {
          var i = e.getRange(r.from(), r.to()).match(t);
          r.replace(n.replace(/\$(\d)/g, function(e, t) {
            return i[t]
          }))
        } else r.replace(n)
    })
  }

  function m(e, t) {
    if (!e.getOption("readOnly")) {
      var n = e.getSelection() || r(e).lastQuery,
        i = '<span class="CodeMirror-search-label">' + (t ? "Replace all:" : "Replace:") + "</span>";
      a(e, i + y, i, n, function(n) {
        n && (n = u(n), a(e, b, "Replace with:", "", function(r) {
          if (r = c(r), t) g(e, n, r);
          else {
            p(e);
            var i = o(e, n, e.getCursor("from")),
              l = function() {
                var t, c = i.from();
                !(t = i.findNext()) && (i = o(e, n), !(t = i.findNext()) || c && i.from().line == c.line && i.from().ch == c.ch) || (e.setSelection(i.from(), i.to()), e.scrollIntoView({
                  from: i.from(),
                  to: i.to()
                }), s(e, x, "Replace?", [function() {
                  a(t)
                }, l, function() {
                  g(e, n, r)
                }]))
              },
              a = function(e) {
                i.replace("string" == typeof n ? r : r.replace(/\$(\d)/g, function(t, n) {
                  return e[n]
                })), l()
              };
            l()
          }
        }))
      })
    }
  }
  var v = '<span class="CodeMirror-search-label">Search:</span> <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint">(Use /re/ syntax for regexp search)</span>',
    y = ' <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint">(Use /re/ syntax for regexp search)</span>',
    b = '<span class="CodeMirror-search-label">With:</span> <input type="text" style="width: 10em" class="CodeMirror-search-field"/>',
    x = '<span class="CodeMirror-search-label">Replace?</span> <button>Yes</button> <button>No</button> <button>All</button> <button>Stop</button>';
  e.commands.find = function(e) {
    p(e), d(e)
  }, e.commands.findPersistent = function(e) {
    p(e), d(e, !1, !0)
  }, e.commands.findPersistentNext = function(e) {
    d(e, !1, !0, !0)
  }, e.commands.findPersistentPrev = function(e) {
    d(e, !0, !0, !0)
  }, e.commands.findNext = d, e.commands.findPrev = function(e) {
    d(e, !0)
  }, e.commands.clearSearch = p, e.commands.replace = m, e.commands.replaceAll = function(e) {
    m(e, !0)
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    var t = e.flags;
    return null != t ? t : (e.ignoreCase ? "i" : "") + (e.global ? "g" : "") + (e.multiline ? "m" : "")
  }

  function n(e, n) {
    for (var r = t(e), i = r, o = 0; o < n.length; o++) i.indexOf(n.charAt(o)) == -1 && (i += n.charAt(o));
    return r == i ? e : new RegExp(e.source, i)
  }

  function r(e) {
    return /\\s|\\n|\n|\\W|\\D|\[\^/.test(e.source)
  }

  function i(e, t, r) {
    t = n(t, "g");
    for (var i = r.line, o = r.ch, l = e.lastLine(); i <= l; i++, o = 0) {
      t.lastIndex = o;
      var a = e.getLine(i),
        s = t.exec(a);
      if (s) return {
        from: g(i, s.index),
        to: g(i, s.index + s[0].length),
        match: s
      }
    }
  }

  function o(e, t, o) {
    if (!r(t)) return i(e, t, o);
    t = n(t, "gm");
    for (var l, a = 1, s = o.line, c = e.lastLine(); s <= c;) {
      for (var u = 0; u < a && !(s > c); u++) {
        var f = e.getLine(s++);
        l = null == l ? f : l + "\n" + f
      }
      a = 2 * a, t.lastIndex = o.ch;
      var d = t.exec(l);
      if (d) {
        var h = l.slice(0, d.index).split("\n"),
          p = d[0].split("\n"),
          m = o.line + h.length - 1,
          v = h[h.length - 1].length;
        return {
          from: g(m, v),
          to: g(m + p.length - 1, 1 == p.length ? v + p[0].length : p[p.length - 1].length),
          match: d
        }
      }
    }
  }

  function l(e, t) {
    for (var n, r = 0;;) {
      t.lastIndex = r;
      var i = t.exec(e);
      if (!i) return n;
      if (n = i, r = n.index + (n[0].length || 1), r == e.length) return n
    }
  }

  function a(e, t, r) {
    t = n(t, "g");
    for (var i = r.line, o = r.ch, a = e.firstLine(); i >= a; i--, o = -1) {
      var s = e.getLine(i);
      o > -1 && (s = s.slice(0, o));
      var c = l(s, t);
      if (c) return {
        from: g(i, c.index),
        to: g(i, c.index + c[0].length),
        match: c
      }
    }
  }

  function s(e, t, r) {
    t = n(t, "gm");
    for (var i, o = 1, a = r.line, s = e.firstLine(); a >= s;) {
      for (var c = 0; c < o; c++) {
        var u = e.getLine(a--);
        i = null == i ? u.slice(0, r.ch) : u + "\n" + i
      }
      o *= 2;
      var f = l(i, t);
      if (f) {
        var d = i.slice(0, f.index).split("\n"),
          h = f[0].split("\n"),
          p = a + d.length,
          m = d[d.length - 1].length;
        return {
          from: g(p, m),
          to: g(p + h.length - 1, 1 == h.length ? m + h[0].length : h[h.length - 1].length),
          match: f
        }
      }
    }
  }

  function c(e, t, n, r) {
    if (e.length == t.length) return n;
    for (var i = 0, o = n + Math.max(0, e.length - t.length);;) {
      if (i == o) return i;
      var l = i + o >> 1,
        a = r(e.slice(0, l)).length;
      if (a == n) return l;
      a > n ? o = l : i = l + 1
    }
  }

  function u(e, t, n, r) {
    if (!t.length) return null;
    var i = r ? h : p,
      o = i(t).split(/\r|\n\r?/);
    e: for (var l = n.line, a = n.ch, s = e.lastLine() + 1 - o.length; l <= s; l++, a = 0) {
      var u = e.getLine(l).slice(a),
        f = i(u);
      if (1 == o.length) {
        var d = f.indexOf(o[0]);
        if (d == -1) continue e;
        var n = c(u, f, d, i) + a;
        return {
          from: g(l, c(u, f, d, i) + a),
          to: g(l, c(u, f, d + o[0].length, i) + a)
        }
      }
      var m = f.length - o[0].length;
      if (f.slice(m) == o[0]) {
        for (var v = 1; v < o.length - 1; v++)
          if (i(e.getLine(l + v)) != o[v]) continue e;
        var y = e.getLine(l + o.length - 1),
          b = i(y),
          x = o[o.length - 1];
        if (b.slice(0, x.length) == x) return {
          from: g(l, c(u, f, m, i) + a),
          to: g(l + o.length - 1, c(y, b, x.length, i))
        }
      }
    }
  }

  function f(e, t, n, r) {
    if (!t.length) return null;
    var i = r ? h : p,
      o = i(t).split(/\r|\n\r?/);
    e: for (var l = n.line, a = n.ch, s = e.firstLine() - 1 + o.length; l >= s; l--, a = -1) {
      var u = e.getLine(l);
      a > -1 && (u = u.slice(0, a));
      var f = i(u);
      if (1 == o.length) {
        var d = f.lastIndexOf(o[0]);
        if (d == -1) continue e;
        return {
          from: g(l, c(u, f, d, i)),
          to: g(l, c(u, f, d + o[0].length, i))
        }
      }
      var m = o[o.length - 1];
      if (f.slice(0, m.length) == m) {
        for (var v = 1, n = l - o.length + 1; v < o.length - 1; v++)
          if (i(e.getLine(n + v)) != o[v]) continue e;
        var y = e.getLine(l + 1 - o.length),
          b = i(y);
        if (b.slice(b.length - o[0].length) == o[0]) return {
          from: g(l + 1 - o.length, c(y, b, y.length - o[0].length, i)),
          to: g(l, c(u, f, m.length, i))
        }
      }
    }
  }

  function d(e, t, r, l) {
    this.atOccurrence = !1, this.doc = e, r = r ? e.clipPos(r) : g(0, 0), this.pos = {
      from: r,
      to: r
    };
    var c;
    "object" == typeof l ? c = l.caseFold : (c = l, l = null), "string" == typeof t ? (null == c && (c = !1), this.matches = function(n, r) {
      return (n ? f : u)(e, t, r, c)
    }) : (t = n(t, "gm"), l && l.multiline === !1 ? this.matches = function(n, r) {
      return (n ? a : i)(e, t, r)
    } : this.matches = function(n, r) {
      return (n ? s : o)(e, t, r)
    })
  }
  var h, p, g = e.Pos;
  String.prototype.normalize ? (h = function(e) {
    return e.normalize("NFD").toLowerCase()
  }, p = function(e) {
    return e.normalize("NFD")
  }) : (h = function(e) {
    return e.toLowerCase()
  }, p = function(e) {
    return e
  }), d.prototype = {
    findNext: function() {
      return this.find(!1)
    },
    findPrevious: function() {
      return this.find(!0)
    },
    find: function(t) {
      for (var n = this.matches(t, this.doc.clipPos(t ? this.pos.from : this.pos.to)); n && 0 == e.cmpPos(n.from, n.to);) t ? n.from.ch ? n.from = g(n.from.line, n.from.ch - 1) : n = n.from.line == this.doc.firstLine() ? null : this.matches(t, this.doc.clipPos(g(n.from.line - 1))) : n.to.ch < this.doc.getLine(n.to.line).length ? n.to = g(n.to.line, n.to.ch + 1) : n = n.to.line == this.doc.lastLine() ? null : this.matches(t, g(n.to.line + 1, 0));
      if (n) return this.pos = n, this.atOccurrence = !0, this.pos.match || !0;
      var r = g(t ? this.doc.firstLine() : this.doc.lastLine() + 1, 0);
      return this.pos = {
        from: r,
        to: r
      }, this.atOccurrence = !1
    },
    from: function() {
      if (this.atOccurrence) return this.pos.from
    },
    to: function() {
      if (this.atOccurrence) return this.pos.to
    },
    replace: function(t, n) {
      if (this.atOccurrence) {
        var r = e.splitLines(t);
        this.doc.replaceRange(r, this.pos.from, this.pos.to, n), this.pos.to = g(this.pos.from.line + r.length - 1, r[r.length - 1].length + (1 == r.length ? this.pos.from.ch : 0))
      }
    }
  }, e.defineExtension("getSearchCursor", function(e, t, n) {
    return new d(this.doc, e, t, n)
  }), e.defineDocExtension("getSearchCursor", function(e, t, n) {
    return new d(this, e, t, n)
  }), e.defineExtension("selectMatches", function(t, n) {
    for (var r = [], i = this.getSearchCursor(t, this.getCursor("from"), n); i.findNext() && !(e.cmpPos(i.to(), this.getCursor("to")) > 0);) r.push({
      anchor: i.from(),
      head: i.to()
    });
    r.length && this.setSelections(r, 0)
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("../fold/xml-fold")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../fold/xml-fold"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    e.state.tagHit && e.state.tagHit.clear(), e.state.tagOther && e.state.tagOther.clear(), e.state.tagHit = e.state.tagOther = null
  }

  function n(n) {
    n.state.failedTagMatch = !1, n.operation(function() {
      if (t(n), !n.somethingSelected()) {
        var r = n.getCursor(),
          i = n.getViewport();
        i.from = Math.min(i.from, r.line), i.to = Math.max(r.line + 1, i.to);
        var o = e.findMatchingTag(n, r, i);
        if (o) {
          if (n.state.matchBothTags) {
            var l = "open" == o.at ? o.open : o.close;
            l && (n.state.tagHit = n.markText(l.from, l.to, {
              className: "CodeMirror-matchingtag"
            }))
          }
          var a = "close" == o.at ? o.open : o.close;
          a ? n.state.tagOther = n.markText(a.from, a.to, {
            className: "CodeMirror-matchingtag"
          }) : n.state.failedTagMatch = !0
        }
      }
    })
  }

  function r(e) {
    e.state.failedTagMatch && n(e)
  }
  e.defineOption("matchTags", !1, function(i, o, l) {
    l && l != e.Init && (i.off("cursorActivity", n), i.off("viewportChange", r), t(i)), o && (i.state.matchBothTags = "object" == typeof o && o.bothTags, i.on("cursorActivity", n), i.on("viewportChange", r), n(i))
  }), e.commands.toMatchingTag = function(t) {
    var n = e.findMatchingTag(t, t.getCursor());
    if (n) {
      var r = "close" == n.at ? n.open : n.close;
      r && t.extendSelection(r.to, r.from)
    }
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  function t(e, t, r) {
    var i = e.getLineHandle(t.line),
      o = t.ch - 1,
      s = r && r.afterCursor;
    null == s && (s = /(^| )cm-fat-cursor($| )/.test(e.getWrapperElement().className));
    var c = !s && o >= 0 && a[i.text.charAt(o)] || a[i.text.charAt(++o)];
    if (!c) return null;
    var u = ">" == c.charAt(1) ? 1 : -1;
    if (r && r.strict && u > 0 != (o == t.ch)) return null;
    var f = e.getTokenTypeAt(l(t.line, o + 1)),
      d = n(e, l(t.line, o + (u > 0 ? 1 : 0)), u, f || null, r);
    return null == d ? null : {
      from: l(t.line, o),
      to: d && d.pos,
      match: d && d.ch == c.charAt(0),
      forward: u > 0
    }
  }

  function n(e, t, n, r, i) {
    for (var o = i && i.maxScanLineLength || 1e4, s = i && i.maxScanLines || 1e3, c = [], u = i && i.bracketRegex ? i.bracketRegex : /[(){}[\]]/, f = n > 0 ? Math.min(t.line + s, e.lastLine() + 1) : Math.max(e.firstLine() - 1, t.line - s), d = t.line; d != f; d += n) {
      var h = e.getLine(d);
      if (h) {
        var p = n > 0 ? 0 : h.length - 1,
          g = n > 0 ? h.length : -1;
        if (!(h.length > o))
          for (d == t.line && (p = t.ch - (n < 0 ? 1 : 0)); p != g; p += n) {
            var m = h.charAt(p);
            if (u.test(m) && (void 0 === r || e.getTokenTypeAt(l(d, p + 1)) == r)) {
              var v = a[m];
              if (">" == v.charAt(1) == n > 0) c.push(m);
              else {
                if (!c.length) return {
                  pos: l(d, p),
                  ch: m
                };
                c.pop()
              }
            }
          }
      }
    }
    return d - n != (n > 0 ? e.lastLine() : e.firstLine()) && null
  }

  function r(e, n, r) {
    for (var i = e.state.matchBrackets.maxHighlightLineLength || 1e3, a = [], s = e.listSelections(), c = 0; c < s.length; c++) {
      var u = s[c].empty() && t(e, s[c].head, r);
      if (u && e.getLine(u.from.line).length <= i) {
        var f = u.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
        a.push(e.markText(u.from, l(u.from.line, u.from.ch + 1), {
          className: f
        })), u.to && e.getLine(u.to.line).length <= i && a.push(e.markText(u.to, l(u.to.line, u.to.ch + 1), {
          className: f
        }))
      }
    }
    if (a.length) {
      o && e.state.focused && e.focus();
      var d = function() {
        e.operation(function() {
          for (var e = 0; e < a.length; e++) a[e].clear()
        })
      };
      if (!n) return d;
      setTimeout(d, 800)
    }
  }

  function i(e) {
    e.operation(function() {
      e.state.matchBrackets.currentlyHighlighted && (e.state.matchBrackets.currentlyHighlighted(), e.state.matchBrackets.currentlyHighlighted = null), e.state.matchBrackets.currentlyHighlighted = r(e, !1, e.state.matchBrackets)
    })
  }
  var o = /MSIE \d/.test(navigator.userAgent) && (null == document.documentMode || document.documentMode < 8),
    l = e.Pos,
    a = {
      "(": ")>",
      ")": "(<",
      "[": "]>",
      "]": "[<",
      "{": "}>",
      "}": "{<"
    };
  e.defineOption("matchBrackets", !1, function(t, n, r) {
    r && r != e.Init && (t.off("cursorActivity", i), t.state.matchBrackets && t.state.matchBrackets.currentlyHighlighted && (t.state.matchBrackets.currentlyHighlighted(), t.state.matchBrackets.currentlyHighlighted = null)), n && (t.state.matchBrackets = "object" == typeof n ? n : {}, t.on("cursorActivity", i))
  }), e.defineExtension("matchBrackets", function() {
    r(this, !0)
  }), e.defineExtension("findMatchingBracket", function(e, n, r) {
    return (r || "boolean" == typeof n) && (r ? (r.strict = n, n = r) : n = n ? {
      strict: !0
    } : null), t(this, e, n)
  }), e.defineExtension("scanForBracket", function(e, t, r, i) {
    return n(this, e, t, r, i)
  })
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  function t(e, t) {
    return "pairs" == t && "string" == typeof e ? e : "object" == typeof e && null != e[t] ? e[t] : d[t]
  }

  function n(e) {
    for (var t = 0; t < e.length; t++) {
      var n = e.charAt(t),
        i = "'" + n + "'";
      p[i] || (p[i] = r(n))
    }
  }

  function r(e) {
    return function(t) {
      return s(t, e)
    }
  }

  function i(e) {
    var t = e.state.closeBrackets;
    if (!t || t.override) return t;
    var n = e.getModeAt(e.getCursor());
    return n.closeBrackets || t
  }

  function o(n) {
    var r = i(n);
    if (!r || n.getOption("disableInput")) return e.Pass;
    for (var o = t(r, "pairs"), l = n.listSelections(), a = 0; a < l.length; a++) {
      if (!l[a].empty()) return e.Pass;
      var s = u(n, l[a].head);
      if (!s || o.indexOf(s) % 2 != 0) return e.Pass
    }
    for (var a = l.length - 1; a >= 0; a--) {
      var c = l[a].head;
      n.replaceRange("", h(c.line, c.ch - 1), h(c.line, c.ch + 1), "+delete")
    }
  }

  function l(n) {
    var r = i(n),
      o = r && t(r, "explode");
    if (!o || n.getOption("disableInput")) return e.Pass;
    for (var l = n.listSelections(), a = 0; a < l.length; a++) {
      if (!l[a].empty()) return e.Pass;
      var s = u(n, l[a].head);
      if (!s || o.indexOf(s) % 2 != 0) return e.Pass
    }
    n.operation(function() {
      var e = n.lineSeparator() || "\n";
      n.replaceSelection(e + e, null), n.execCommand("goCharLeft"), l = n.listSelections();
      for (var t = 0; t < l.length; t++) {
        var r = l[t].head.line;
        n.indentLine(r, null, !0), n.indentLine(r + 1, null, !0)
      }
    })
  }

  function a(t) {
    var n = e.cmpPos(t.anchor, t.head) > 0;
    return {
      anchor: new h(t.anchor.line, t.anchor.ch + (n ? -1 : 1)),
      head: new h(t.head.line, t.head.ch + (n ? 1 : -1))
    }
  }

  function s(n, r) {
    var o = i(n);
    if (!o || n.getOption("disableInput")) return e.Pass;
    var l = t(o, "pairs"),
      s = l.indexOf(r);
    if (s == -1) return e.Pass;
    for (var u, d = t(o, "triples"), p = l.charAt(s + 1) == r, g = n.listSelections(), m = s % 2 == 0, v = 0; v < g.length; v++) {
      var y, b = g[v],
        x = b.head,
        w = n.getRange(x, h(x.line, x.ch + 1));
      if (m && !b.empty()) y = "surround";
      else if (!p && m || w != r)
        if (p && x.ch > 1 && d.indexOf(r) >= 0 && n.getRange(h(x.line, x.ch - 2), x) == r + r) {
          if (x.ch > 2 && /\bstring/.test(n.getTokenTypeAt(h(x.line, x.ch - 2)))) return e.Pass;
          y = "addFour"
        } else if (p) {
        var C = 0 == x.ch ? " " : n.getRange(h(x.line, x.ch - 1), x);
        if (e.isWordChar(w) || C == r || e.isWordChar(C)) return e.Pass;
        y = "both"
      } else {
        if (!m || n.getLine(x.line).length != x.ch && !c(w, l) && !/\s/.test(w)) return e.Pass;
        y = "both"
      } else y = p && f(n, x) ? "both" : d.indexOf(r) >= 0 && n.getRange(x, h(x.line, x.ch + 3)) == r + r + r ? "skipThree" : "skip";
      if (u) {
        if (u != y) return e.Pass
      } else u = y
    }
    var k = s % 2 ? l.charAt(s - 1) : r,
      S = s % 2 ? r : l.charAt(s + 1);
    n.operation(function() {
      if ("skip" == u) n.execCommand("goCharRight");
      else if ("skipThree" == u)
        for (var e = 0; e < 3; e++) n.execCommand("goCharRight");
      else if ("surround" == u) {
        for (var t = n.getSelections(), e = 0; e < t.length; e++) t[e] = k + t[e] + S;
        n.replaceSelections(t, "around"), t = n.listSelections().slice();
        for (var e = 0; e < t.length; e++) t[e] = a(t[e]);
        n.setSelections(t)
      } else "both" == u ? (n.replaceSelection(k + S, null), n.triggerElectric(k + S), n.execCommand("goCharLeft")) : "addFour" == u && (n.replaceSelection(k + k + k + k, "before"), n.execCommand("goCharRight"))
    })
  }

  function c(e, t) {
    var n = t.lastIndexOf(e);
    return n > -1 && n % 2 == 1
  }

  function u(e, t) {
    var n = e.getRange(h(t.line, t.ch - 1), h(t.line, t.ch + 1));
    return 2 == n.length ? n : null
  }

  function f(e, t) {
    var n = e.getTokenAt(h(t.line, t.ch + 1));
    return /\bstring/.test(n.type) && n.start == t.ch && (0 == t.ch || !/\bstring/.test(e.getTokenTypeAt(t)))
  }
  var d = {
      pairs: "()[]{}''\"\"",
      triples: "",
      explode: "[]{}"
    },
    h = e.Pos;
  e.defineOption("autoCloseBrackets", !1, function(r, i, o) {
    o && o != e.Init && (r.removeKeyMap(p), r.state.closeBrackets = null), i && (n(t(i, "pairs")), r.state.closeBrackets = i, r.addKeyMap(p))
  });
  var p = {
    Backspace: o,
    Enter: l
  };
  n(d.pairs + "`")
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("../fold/xml-fold")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../fold/xml-fold"], e) : e(CodeMirror)
}(function(e) {
  function t(t) {
    if (t.getOption("disableInput")) return e.Pass;
    for (var n = t.listSelections(), r = [], s = t.getOption("autoCloseTags"), c = 0; c < n.length; c++) {
      if (!n[c].empty()) return e.Pass;
      var u = n[c].head,
        f = t.getTokenAt(u),
        d = e.innerMode(t.getMode(), f.state),
        h = d.state;
      if ("xml" != d.mode.name || !h.tagName) return e.Pass;
      var p = "html" == d.mode.configuration,
        g = "object" == typeof s && s.dontCloseTags || p && l,
        m = "object" == typeof s && s.indentTags || p && a,
        v = h.tagName;
      f.end > u.ch && (v = v.slice(0, v.length - f.end + u.ch));
      var y = v.toLowerCase();
      if (!v || "string" == f.type && (f.end != u.ch || !/[\"\']/.test(f.string.charAt(f.string.length - 1)) || 1 == f.string.length) || "tag" == f.type && "closeTag" == h.type || f.string.indexOf("/") == f.string.length - 1 || g && i(g, y) > -1 || o(t, v, u, h, !0)) return e.Pass;
      var b = m && i(m, y) > -1;
      r[c] = {
        indent: b,
        text: ">" + (b ? "\n\n" : "") + "</" + v + ">",
        newPos: b ? e.Pos(u.line + 1, 0) : e.Pos(u.line, u.ch + 1)
      }
    }
    for (var x = "object" == typeof s && s.dontIndentOnAutoClose, c = n.length - 1; c >= 0; c--) {
      var w = r[c];
      t.replaceRange(w.text, n[c].head, n[c].anchor, "+insert");
      var C = t.listSelections().slice(0);
      C[c] = {
        head: w.newPos,
        anchor: w.newPos
      }, t.setSelections(C), !x && w.indent && (t.indentLine(w.newPos.line, null, !0),
        t.indentLine(w.newPos.line + 1, null, !0))
    }
  }

  function n(t, n) {
    for (var r = t.listSelections(), i = [], l = n ? "/" : "</", a = t.getOption("autoCloseTags"), s = "object" == typeof a && a.dontIndentOnSlash, c = 0; c < r.length; c++) {
      if (!r[c].empty()) return e.Pass;
      var u = r[c].head,
        f = t.getTokenAt(u),
        d = e.innerMode(t.getMode(), f.state),
        h = d.state;
      if (n && ("string" == f.type || "<" != f.string.charAt(0) || f.start != u.ch - 1)) return e.Pass;
      var p;
      if ("xml" != d.mode.name)
        if ("htmlmixed" == t.getMode().name && "javascript" == d.mode.name) p = l + "script";
        else {
          if ("htmlmixed" != t.getMode().name || "css" != d.mode.name) return e.Pass;
          p = l + "style"
        }
      else {
        if (!h.context || !h.context.tagName || o(t, h.context.tagName, u, h)) return e.Pass;
        p = l + h.context.tagName
      }
      ">" != t.getLine(u.line).charAt(f.end) && (p += ">"), i[c] = p
    }
    if (t.replaceSelections(i), r = t.listSelections(), !s)
      for (var c = 0; c < r.length; c++)(c == r.length - 1 || r[c].head.line < r[c + 1].head.line) && t.indentLine(r[c].head.line)
  }

  function r(t) {
    return t.getOption("disableInput") ? e.Pass : n(t, !0)
  }

  function i(e, t) {
    if (e.indexOf) return e.indexOf(t);
    for (var n = 0, r = e.length; n < r; ++n)
      if (e[n] == t) return n;
    return -1
  }

  function o(t, n, r, i, o) {
    if (!e.scanForClosingTag) return !1;
    var l = Math.min(t.lastLine() + 1, r.line + 500),
      a = e.scanForClosingTag(t, r, null, l);
    if (!a || a.tag != n) return !1;
    for (var s = i.context, c = o ? 1 : 0; s && s.tagName == n; s = s.prev) ++c;
    r = a.to;
    for (var u = 1; u < c; u++) {
      var f = e.scanForClosingTag(t, r, null, l);
      if (!f || f.tag != n) return !1;
      r = f.to
    }
    return !0
  }
  e.defineOption("autoCloseTags", !1, function(n, i, o) {
    if (o != e.Init && o && n.removeKeyMap("autoCloseTags"), i) {
      var l = {
        name: "autoCloseTags"
      };
      ("object" != typeof i || i.whenClosing) && (l["'/'"] = function(e) {
        return r(e)
      }), ("object" != typeof i || i.whenOpening) && (l["'>'"] = function(e) {
        return t(e)
      }), n.addKeyMap(l)
    }
  });
  var l = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"],
    a = ["applet", "blockquote", "body", "button", "div", "dl", "fieldset", "form", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "html", "iframe", "layer", "legend", "object", "ol", "p", "select", "table", "ul"];
  e.commands.closeTag = function(e) {
    return n(e)
  }
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror"), require("./xml-hint")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./xml-hint"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    for (var t in f) f.hasOwnProperty(t) && (e.attrs[t] = f[t])
  }

  function n(t, n) {
    var r = {
      schemaInfo: u
    };
    if (n)
      for (var i in n) r[i] = n[i];
    return e.hint.xml(t, r)
  }
  var r = "ab aa af ak sq am ar an hy as av ae ay az bm ba eu be bn bh bi bs br bg my ca ch ce ny zh cv kw co cr hr cs da dv nl dz en eo et ee fo fj fi fr ff gl ka de el gn gu ht ha he hz hi ho hu ia id ie ga ig ik io is it iu ja jv kl kn kr ks kk km ki rw ky kv kg ko ku kj la lb lg li ln lo lt lu lv gv mk mg ms ml mt mi mr mh mn na nv nb nd ne ng nn no ii nr oc oj cu om or os pa pi fa pl ps pt qu rm rn ro ru sa sc sd se sm sg sr gd sn si sk sl so st es su sw ss sv ta te tg th ti bo tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa cy wo fy xh yi yo za zu".split(" "),
    i = ["_blank", "_self", "_top", "_parent"],
    o = ["ascii", "utf-8", "utf-16", "latin1", "latin1"],
    l = ["get", "post", "put", "delete"],
    a = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"],
    s = ["all", "screen", "print", "embossed", "braille", "handheld", "print", "projection", "screen", "tty", "tv", "speech", "3d-glasses", "resolution [>][<][=] [X]", "device-aspect-ratio: X/Y", "orientation:portrait", "orientation:landscape", "device-height: [X]", "device-width: [X]"],
    c = {
      attrs: {}
    },
    u = {
      a: {
        attrs: {
          href: null,
          ping: null,
          type: null,
          media: s,
          target: i,
          hreflang: r
        }
      },
      abbr: c,
      acronym: c,
      address: c,
      applet: c,
      area: {
        attrs: {
          alt: null,
          coords: null,
          href: null,
          target: null,
          ping: null,
          media: s,
          hreflang: r,
          type: null,
          shape: ["default", "rect", "circle", "poly"]
        }
      },
      article: c,
      aside: c,
      audio: {
        attrs: {
          src: null,
          mediagroup: null,
          crossorigin: ["anonymous", "use-credentials"],
          preload: ["none", "metadata", "auto"],
          autoplay: ["", "autoplay"],
          loop: ["", "loop"],
          controls: ["", "controls"]
        }
      },
      b: c,
      base: {
        attrs: {
          href: null,
          target: i
        }
      },
      basefont: c,
      bdi: c,
      bdo: c,
      big: c,
      blockquote: {
        attrs: {
          cite: null
        }
      },
      body: c,
      br: c,
      button: {
        attrs: {
          form: null,
          formaction: null,
          name: null,
          value: null,
          autofocus: ["", "autofocus"],
          disabled: ["", "autofocus"],
          formenctype: a,
          formmethod: l,
          formnovalidate: ["", "novalidate"],
          formtarget: i,
          type: ["submit", "reset", "button"]
        }
      },
      canvas: {
        attrs: {
          width: null,
          height: null
        }
      },
      caption: c,
      center: c,
      cite: c,
      code: c,
      col: {
        attrs: {
          span: null
        }
      },
      colgroup: {
        attrs: {
          span: null
        }
      },
      command: {
        attrs: {
          type: ["command", "checkbox", "radio"],
          label: null,
          icon: null,
          radiogroup: null,
          command: null,
          title: null,
          disabled: ["", "disabled"],
          checked: ["", "checked"]
        }
      },
      data: {
        attrs: {
          value: null
        }
      },
      datagrid: {
        attrs: {
          disabled: ["", "disabled"],
          multiple: ["", "multiple"]
        }
      },
      datalist: {
        attrs: {
          data: null
        }
      },
      dd: c,
      del: {
        attrs: {
          cite: null,
          datetime: null
        }
      },
      details: {
        attrs: {
          open: ["", "open"]
        }
      },
      dfn: c,
      dir: c,
      div: c,
      dl: c,
      dt: c,
      em: c,
      embed: {
        attrs: {
          src: null,
          type: null,
          width: null,
          height: null
        }
      },
      eventsource: {
        attrs: {
          src: null
        }
      },
      fieldset: {
        attrs: {
          disabled: ["", "disabled"],
          form: null,
          name: null
        }
      },
      figcaption: c,
      figure: c,
      font: c,
      footer: c,
      form: {
        attrs: {
          action: null,
          name: null,
          "accept-charset": o,
          autocomplete: ["on", "off"],
          enctype: a,
          method: l,
          novalidate: ["", "novalidate"],
          target: i
        }
      },
      frame: c,
      frameset: c,
      h1: c,
      h2: c,
      h3: c,
      h4: c,
      h5: c,
      h6: c,
      head: {
        attrs: {},
        children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
      },
      header: c,
      hgroup: c,
      hr: c,
      html: {
        attrs: {
          manifest: null
        },
        children: ["head", "body"]
      },
      i: c,
      iframe: {
        attrs: {
          src: null,
          srcdoc: null,
          name: null,
          width: null,
          height: null,
          sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
          seamless: ["", "seamless"]
        }
      },
      img: {
        attrs: {
          alt: null,
          src: null,
          ismap: null,
          usemap: null,
          width: null,
          height: null,
          crossorigin: ["anonymous", "use-credentials"]
        }
      },
      input: {
        attrs: {
          alt: null,
          dirname: null,
          form: null,
          formaction: null,
          height: null,
          list: null,
          max: null,
          maxlength: null,
          min: null,
          name: null,
          pattern: null,
          placeholder: null,
          size: null,
          src: null,
          step: null,
          value: null,
          width: null,
          accept: ["audio/*", "video/*", "image/*"],
          autocomplete: ["on", "off"],
          autofocus: ["", "autofocus"],
          checked: ["", "checked"],
          disabled: ["", "disabled"],
          formenctype: a,
          formmethod: l,
          formnovalidate: ["", "novalidate"],
          formtarget: i,
          multiple: ["", "multiple"],
          readonly: ["", "readonly"],
          required: ["", "required"],
          type: ["hidden", "text", "search", "tel", "url", "email", "password", "datetime", "date", "month", "week", "time", "datetime-local", "number", "range", "color", "checkbox", "radio", "file", "submit", "image", "reset", "button"]
        }
      },
      ins: {
        attrs: {
          cite: null,
          datetime: null
        }
      },
      kbd: c,
      keygen: {
        attrs: {
          challenge: null,
          form: null,
          name: null,
          autofocus: ["", "autofocus"],
          disabled: ["", "disabled"],
          keytype: ["RSA"]
        }
      },
      label: {
        attrs: {
          "for": null,
          form: null
        }
      },
      legend: c,
      li: {
        attrs: {
          value: null
        }
      },
      link: {
        attrs: {
          href: null,
          type: null,
          hreflang: r,
          media: s,
          sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
        }
      },
      map: {
        attrs: {
          name: null
        }
      },
      mark: c,
      menu: {
        attrs: {
          label: null,
          type: ["list", "context", "toolbar"]
        }
      },
      meta: {
        attrs: {
          content: null,
          charset: o,
          name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
          "http-equiv": ["content-language", "content-type", "default-style", "refresh"]
        }
      },
      meter: {
        attrs: {
          value: null,
          min: null,
          low: null,
          high: null,
          max: null,
          optimum: null
        }
      },
      nav: c,
      noframes: c,
      noscript: c,
      object: {
        attrs: {
          data: null,
          type: null,
          name: null,
          usemap: null,
          form: null,
          width: null,
          height: null,
          typemustmatch: ["", "typemustmatch"]
        }
      },
      ol: {
        attrs: {
          reversed: ["", "reversed"],
          start: null,
          type: ["1", "a", "A", "i", "I"]
        }
      },
      optgroup: {
        attrs: {
          disabled: ["", "disabled"],
          label: null
        }
      },
      option: {
        attrs: {
          disabled: ["", "disabled"],
          label: null,
          selected: ["", "selected"],
          value: null
        }
      },
      output: {
        attrs: {
          "for": null,
          form: null,
          name: null
        }
      },
      p: c,
      param: {
        attrs: {
          name: null,
          value: null
        }
      },
      pre: c,
      progress: {
        attrs: {
          value: null,
          max: null
        }
      },
      q: {
        attrs: {
          cite: null
        }
      },
      rp: c,
      rt: c,
      ruby: c,
      s: c,
      samp: c,
      script: {
        attrs: {
          type: ["text/javascript"],
          src: null,
          async: ["", "async"],
          defer: ["", "defer"],
          charset: o
        }
      },
      section: c,
      select: {
        attrs: {
          form: null,
          name: null,
          size: null,
          autofocus: ["", "autofocus"],
          disabled: ["", "disabled"],
          multiple: ["", "multiple"]
        }
      },
      small: c,
      source: {
        attrs: {
          src: null,
          type: null,
          media: null
        }
      },
      span: c,
      strike: c,
      strong: c,
      style: {
        attrs: {
          type: ["text/css"],
          media: s,
          scoped: null
        }
      },
      sub: c,
      summary: c,
      sup: c,
      table: c,
      tbody: c,
      td: {
        attrs: {
          colspan: null,
          rowspan: null,
          headers: null
        }
      },
      textarea: {
        attrs: {
          dirname: null,
          form: null,
          maxlength: null,
          name: null,
          placeholder: null,
          rows: null,
          cols: null,
          autofocus: ["", "autofocus"],
          disabled: ["", "disabled"],
          readonly: ["", "readonly"],
          required: ["", "required"],
          wrap: ["soft", "hard"]
        }
      },
      tfoot: c,
      th: {
        attrs: {
          colspan: null,
          rowspan: null,
          headers: null,
          scope: ["row", "col", "rowgroup", "colgroup"]
        }
      },
      thead: c,
      time: {
        attrs: {
          datetime: null
        }
      },
      title: c,
      tr: c,
      track: {
        attrs: {
          src: null,
          label: null,
          "default": null,
          kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
          srclang: r
        }
      },
      tt: c,
      u: c,
      ul: c,
      "var": c,
      video: {
        attrs: {
          src: null,
          poster: null,
          width: null,
          height: null,
          crossorigin: ["anonymous", "use-credentials"],
          preload: ["auto", "metadata", "none"],
          autoplay: ["", "autoplay"],
          mediagroup: ["movie"],
          muted: ["", "muted"],
          controls: ["", "controls"]
        }
      },
      wbr: c
    },
    f = {
      accesskey: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      "class": null,
      contenteditable: ["true", "false"],
      contextmenu: null,
      dir: ["ltr", "rtl", "auto"],
      draggable: ["true", "false", "auto"],
      dropzone: ["copy", "move", "link", "string:", "file:"],
      hidden: ["hidden"],
      id: null,
      inert: ["inert"],
      itemid: null,
      itemprop: null,
      itemref: null,
      itemscope: ["itemscope"],
      itemtype: null,
      lang: ["en", "es"],
      spellcheck: ["true", "false"],
      style: null,
      tabindex: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      title: null,
      translate: ["yes", "no"],
      onclick: null,
      rel: ["stylesheet", "alternate", "author", "bookmark", "help", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"]
    };
  t(c);
  for (var d in u) u.hasOwnProperty(d) && u[d] != c && t(u[d]);
  e.htmlSchema = u, e.registerHelper("hint", "html", n)
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(t, r) {
    var i = r && r.schemaInfo,
      o = r && r.quoteChar || '"';
    if (i) {
      var l = t.getCursor(),
        a = t.getTokenAt(l);
      a.end > l.ch && (a.end = l.ch, a.string = a.string.slice(0, l.ch - a.start));
      var s = e.innerMode(t.getMode(), a.state);
      if ("xml" == s.mode.name) {
        var c, u, f = [],
          d = !1,
          h = /\btag\b/.test(a.type) && !/>$/.test(a.string),
          p = h && /^\w/.test(a.string);
        if (p) {
          var g = t.getLine(l.line).slice(Math.max(0, a.start - 2), a.start),
            m = /<\/$/.test(g) ? "close" : /<$/.test(g) ? "open" : null;
          m && (u = a.start - ("close" == m ? 2 : 1))
        } else h && "<" == a.string ? m = "open" : h && "</" == a.string && (m = "close");
        if (!h && !s.state.tagName || m) {
          p && (c = a.string), d = m;
          var v = s.state.context,
            y = v && i[v.tagName],
            b = v ? y && y.children : i["!top"];
          if (b && "close" != m)
            for (var x = 0; x < b.length; ++x) c && 0 != b[x].lastIndexOf(c, 0) || f.push("<" + b[x]);
          else if ("close" != m)
            for (var w in i) !i.hasOwnProperty(w) || "!top" == w || "!attrs" == w || c && 0 != w.lastIndexOf(c, 0) || f.push("<" + w);
          v && (!c || "close" == m && 0 == v.tagName.lastIndexOf(c, 0)) && f.push("</" + v.tagName + ">")
        } else {
          var y = i[s.state.tagName],
            C = y && y.attrs,
            k = i["!attrs"];
          if (!C && !k) return;
          if (C) {
            if (k) {
              var S = {};
              for (var L in k) k.hasOwnProperty(L) && (S[L] = k[L]);
              for (var L in C) C.hasOwnProperty(L) && (S[L] = C[L]);
              C = S
            }
          } else C = k;
          if ("string" == a.type || "=" == a.string) {
            var T, g = t.getRange(n(l.line, Math.max(0, l.ch - 60)), n(l.line, "string" == a.type ? a.start : a.end)),
              M = g.match(/([^\s\u00a0=<>\"\']+)=$/);
            if (!M || !C.hasOwnProperty(M[1]) || !(T = C[M[1]])) return;
            if ("function" == typeof T && (T = T.call(this, t)), "string" == a.type) {
              c = a.string;
              var O = 0;
              /['"]/.test(a.string.charAt(0)) && (o = a.string.charAt(0), c = a.string.slice(1), O++);
              var N = a.string.length;
              /['"]/.test(a.string.charAt(N - 1)) && (o = a.string.charAt(N - 1), c = a.string.substr(O, N - 2)), d = !0
            }
            for (var x = 0; x < T.length; ++x) c && 0 != T[x].lastIndexOf(c, 0) || f.push(o + T[x] + o)
          } else {
            "attribute" == a.type && (c = a.string, d = !0);
            for (var A in C) !C.hasOwnProperty(A) || c && 0 != A.lastIndexOf(c, 0) || f.push(A)
          }
        }
        return {
          list: f,
          from: d ? n(l.line, null == u ? a.start : u) : l,
          to: d ? n(l.line, a.end) : l
        }
      }
    }
  }
  var n = e.Pos;
  e.registerHelper("hint", "xml", t)
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t, n) {
    var r = e.docs[t];
    r ? n(P(e, r)) : e.options.getFile ? e.options.getFile(t, n) : n(null)
  }

  function n(e, t, n) {
    for (var r in e.docs) {
      var i = e.docs[r];
      if (i.doc == t) return i
    }
    if (!n)
      for (var o = 0;; ++o)
        if (r = "[doc" + (o || "") + "]", !e.docs[r]) {
          n = r;
          break
        } return e.addDoc(n, t)
  }

  function r(t, r) {
    return "string" == typeof r ? t.docs[r] : (r instanceof e && (r = r.getDoc()), r instanceof e.Doc ? n(t, r) : void 0)
  }

  function i(e, t, r) {
    var i = n(e, t),
      l = e.cachedArgHints;
    l && l.doc == t && I(l.start, r.to) >= 0 && (e.cachedArgHints = null);
    var a = i.changed;
    null == a && (i.changed = a = {
      from: r.from.line,
      to: r.from.line
    });
    var s = r.from.line + (r.text.length - 1);
    r.from.line < a.to && (a.to = a.to - (r.to.line - s)), s >= a.to && (a.to = s + 1), a.from > r.from.line && (a.from = r.from.line), t.lineCount() > W && r.to - a.from > 100 && setTimeout(function() {
      i.changed && i.changed.to - i.changed.from > 100 && o(e, i)
    }, 200)
  }

  function o(e, t) {
    e.server.request({
      files: [{
        type: "full",
        name: t.name,
        text: P(e, t)
      }]
    }, function(e) {
      e ? window.console.error(e) : t.changed = null
    })
  }

  function l(t, n, r) {
    t.request(n, {
      type: "completions",
      types: !0,
      docs: !0,
      urls: !0
    }, function(i, o) {
      if (i) return N(t, n, i);
      var l = [],
        s = "",
        c = o.start,
        u = o.end;
      '["' == n.getRange(H(c.line, c.ch - 2), c) && '"]' != n.getRange(u, H(u.line, u.ch + 2)) && (s = '"]');
      for (var f = 0; f < o.completions.length; ++f) {
        var d = o.completions[f],
          h = a(d.type);
        o.guess && (h += " " + F + "guess"), l.push({
          text: d.name + s,
          displayText: d.displayName || d.name,
          className: h,
          data: d
        })
      }
      var p = {
          from: c,
          to: u,
          list: l
        },
        g = null;
      e.on(p, "close", function() {
        M(g)
      }), e.on(p, "update", function() {
        M(g)
      }), e.on(p, "select", function(e, n) {
        M(g);
        var r = t.options.completionTip ? t.options.completionTip(e.data) : e.data.doc;
        r && (g = T(n.parentNode.getBoundingClientRect().right + window.pageXOffset, n.getBoundingClientRect().top + window.pageYOffset, r), g.className += " " + F + "hint-doc")
      }), r(p)
    })
  }

  function a(e) {
    var t;
    return t = "?" == e ? "unknown" : "number" == e || "string" == e || "bool" == e ? e : /^fn\(/.test(e) ? "fn" : /^\[/.test(e) ? "array" : "object", F + "completion " + F + "completion-" + t
  }

  function s(e, t, n, r, i) {
    e.request(t, r, function(n, r) {
      if (n) return N(e, t, n);
      if (e.options.typeTip) var o = e.options.typeTip(r);
      else {
        var o = C("span", null, C("strong", null, r.type || "not found"));
        if (r.doc && o.appendChild(document.createTextNode(" — " + r.doc)), r.url) {
          o.appendChild(document.createTextNode(" "));
          var l = o.appendChild(C("a", null, "[docs]"));
          l.href = r.url, l.target = "_blank"
        }
      }
      S(t, o, e), i && i()
    }, n)
  }

  function c(t, n) {
    if (A(t), !n.somethingSelected()) {
      var r = n.getTokenAt(n.getCursor()).state,
        i = e.innerMode(n.getMode(), r);
      if ("javascript" == i.mode.name) {
        var o = i.state.lexical;
        if ("call" == o.info) {
          for (var l, a = o.pos || 0, s = n.getOption("tabSize"), c = n.getCursor().line, d = Math.max(0, c - 9), h = !1; c >= d; --c) {
            for (var p = n.getLine(c), g = 0, m = 0;;) {
              var v = p.indexOf("\t", m);
              if (v == -1) break;
              g += s - (v + g) % s - 1, m = v + 1
            }
            if (l = o.column - g, "(" == p.charAt(l)) {
              h = !0;
              break
            }
          }
          if (h) {
            var y = H(c, l),
              b = t.cachedArgHints;
            return b && b.doc == n.getDoc() && 0 == I(y, b.start) ? u(t, n, a) : void t.request(n, {
              type: "type",
              preferFunction: !0,
              end: y
            }, function(e, r) {
              !e && r.type && /^fn\(/.test(r.type) && (t.cachedArgHints = {
                start: y,
                type: f(r.type),
                name: r.exprName || r.name || "fn",
                guess: r.guess,
                doc: n.getDoc()
              }, u(t, n, a))
            })
          }
        }
      }
    }
  }

  function u(e, t, n) {
    A(e);
    for (var r = e.cachedArgHints, i = r.type, o = C("span", r.guess ? F + "fhint-guess" : null, C("span", F + "fname", r.name), "("), l = 0; l < i.args.length; ++l) {
      l && o.appendChild(document.createTextNode(", "));
      var a = i.args[l];
      o.appendChild(C("span", F + "farg" + (l == n ? " " + F + "farg-current" : ""), a.name || "?")), "?" != a.type && (o.appendChild(document.createTextNode(": ")), o.appendChild(C("span", F + "type", a.type)))
    }
    o.appendChild(document.createTextNode(i.rettype ? ") -> " : ")")), i.rettype && o.appendChild(C("span", F + "type", i.rettype));
    var s = t.cursorCoords(null, "page"),
      c = e.activeArgHints = T(s.right + 1, s.bottom, o);
    setTimeout(function() {
      c.clear = L(t, function() {
        e.activeArgHints == c && A(e)
      })
    }, 20)
  }

  function f(e) {
    function t(t) {
      for (var n = 0, i = r;;) {
        var o = e.charAt(r);
        if (t.test(o) && !n) return e.slice(i, r);
        /[{\[\(]/.test(o) ? ++n : /[}\]\)]/.test(o) && --n, ++r
      }
    }
    var n = [],
      r = 3;
    if (")" != e.charAt(r))
      for (;;) {
        var i = e.slice(r).match(/^([^, \(\[\{]+): /);
        if (i && (r += i[0].length, i = i[1]), n.push({
            name: i,
            type: t(/[\),]/)
          }), ")" == e.charAt(r)) break;
        r += 2
      }
    var o = e.slice(r).match(/^\) -> (.*)$/);
    return {
      args: n,
      rettype: o && o[1]
    }
  }

  function d(e, t) {
    function r(r) {
      var i = {
          type: "definition",
          variable: r || null
        },
        o = n(e, t.getDoc());
      e.server.request(x(e, o, i), function(n, r) {
        if (n) return N(e, t, n);
        if (!r.file && r.url) return void window.open(r.url);
        if (r.file) {
          var i, l = e.docs[r.file];
          if (l && (i = g(l.doc, r))) return e.jumpStack.push({
            file: o.name,
            start: t.getCursor("from"),
            end: t.getCursor("to")
          }), void p(e, o, l, i.start, i.end)
        }
        N(e, t, "Could not find a definition.")
      })
    }
    m(t) ? r() : k(t, "Jump to variable", function(e) {
      e && r(e)
    })
  }

  function h(e, t) {
    var r = e.jumpStack.pop(),
      i = r && e.docs[r.file];
    i && p(e, n(e, t.getDoc()), i, r.start, r.end)
  }

  function p(e, t, n, r, i) {
    n.doc.setSelection(r, i), t != n && e.options.switchToDoc && (A(e), e.options.switchToDoc(n.name, n.doc))
  }

  function g(e, t) {
    for (var n = t.context.slice(0, t.contextOffset).split("\n"), r = t.start.line - (n.length - 1), i = H(r, (1 == n.length ? t.start.ch : e.getLine(r).length) - n[0].length), o = e.getLine(r).slice(i.ch), l = r + 1; l < e.lineCount() && o.length < t.context.length; ++l) o += "\n" + e.getLine(l);
    if (o.slice(0, t.context.length) == t.context) return t;
    for (var a, s = e.getSearchCursor(t.context, 0, !1), c = 1 / 0; s.findNext();) {
      var u = s.from(),
        f = 1e4 * Math.abs(u.line - i.line);
      f || (f = Math.abs(u.ch - i.ch)), f < c && (a = u, c = f)
    }
    if (!a) return null;
    if (1 == n.length ? a.ch += n[0].length : a = H(a.line + (n.length - 1), n[n.length - 1].length), t.start.line == t.end.line) var d = H(a.line, a.ch + (t.end.ch - t.start.ch));
    else var d = H(a.line + (t.end.line - t.start.line), t.end.ch);
    return {
      start: a,
      end: d
    }
  }

  function m(e) {
    var t = e.getCursor("end"),
      n = e.getTokenAt(t);
    return !(n.start < t.ch && "comment" == n.type) && /[\w)\]]/.test(e.getLine(t.line).slice(Math.max(t.ch - 1, 0), t.ch + 1))
  }

  function v(e, t) {
    var n = t.getTokenAt(t.getCursor());
    return /\w/.test(n.string) ? void k(t, "New name for " + n.string, function(n) {
      e.request(t, {
        type: "rename",
        newName: n,
        fullDocs: !0
      }, function(n, r) {
        return n ? N(e, t, n) : void b(e, r.changes)
      })
    }) : N(e, t, "Not at a variable")
  }

  function y(e, t) {
    var r = n(e, t.doc).name;
    e.request(t, {
      type: "refs"
    }, function(n, i) {
      if (n) return N(e, t, n);
      for (var o = [], l = 0, a = t.getCursor(), s = 0; s < i.refs.length; s++) {
        var c = i.refs[s];
        c.file == r && (o.push({
          anchor: c.start,
          head: c.end
        }), I(a, c.start) >= 0 && I(a, c.end) <= 0 && (l = o.length - 1))
      }
      t.setSelections(o, l)
    })
  }

  function b(e, t) {
    for (var n = Object.create(null), r = 0; r < t.length; ++r) {
      var i = t[r];
      (n[i.file] || (n[i.file] = [])).push(i)
    }
    for (var o in n) {
      var l = e.docs[o],
        a = n[o];
      if (l) {
        a.sort(function(e, t) {
          return I(t.start, e.start)
        });
        for (var s = "*rename" + ++E, r = 0; r < a.length; ++r) {
          var i = a[r];
          l.doc.replaceRange(i.text, i.start, i.end, s)
        }
      }
    }
  }

  function x(e, t, n, r) {
    var i = [],
      o = 0,
      l = !n.fullDocs;
    l || delete n.fullDocs, "string" == typeof n && (n = {
      type: n
    }), n.lineCharPositions = !0, null == n.end && (n.end = r || t.doc.getCursor("end"), t.doc.somethingSelected() && (n.start = t.doc.getCursor("start")));
    var a = n.start || n.end;
    if (t.changed)
      if (t.doc.lineCount() > W && l !== !1 && t.changed.to - t.changed.from < 100 && t.changed.from <= a.line && t.changed.to > n.end.line) {
        i.push(w(t, a, n.end)), n.file = "#0";
        var o = i[0].offsetLines;
        null != n.start && (n.start = H(n.start.line - -o, n.start.ch)), n.end = H(n.end.line - o, n.end.ch)
      } else i.push({
        type: "full",
        name: t.name,
        text: P(e, t)
      }), n.file = t.name, t.changed = null;
    else n.file = t.name;
    for (var s in e.docs) {
      var c = e.docs[s];
      c.changed && c != t && (i.push({
        type: "full",
        name: c.name,
        text: P(e, c)
      }), c.changed = null)
    }
    return {
      query: n,
      files: i
    }
  }

  function w(t, n, r) {
    for (var i, o = t.doc, l = null, a = null, s = 4, c = n.line - 1, u = Math.max(0, c - 50); c >= u; --c) {
      var f = o.getLine(c),
        d = f.search(/\bfunction\b/);
      if (!(d < 0)) {
        var h = e.countColumn(f, null, s);
        null != l && l <= h || (l = h, a = c)
      }
    }
    null == a && (a = u);
    var p = Math.min(o.lastLine(), r.line + 20);
    if (null == l || l == e.countColumn(o.getLine(n.line), null, s)) i = p;
    else
      for (i = r.line + 1; i < p; ++i) {
        var h = e.countColumn(o.getLine(i), null, s);
        if (h <= l) break
      }
    var g = H(a, 0);
    return {
      type: "part",
      name: t.name,
      offsetLines: g.line,
      text: o.getRange(g, H(i, r.line == i ? null : 0))
    }
  }

  function C(e, t) {
    var n = document.createElement(e);
    t && (n.className = t);
    for (var r = 2; r < arguments.length; ++r) {
      var i = arguments[r];
      "string" == typeof i && (i = document.createTextNode(i)), n.appendChild(i)
    }
    return n
  }

  function k(e, t, n) {
    e.openDialog ? e.openDialog(t + ": <input type=text>", n) : n(prompt(t, ""))
  }

  function S(t, n, r) {
    function i() {
      c = !0, s || o()
    }

    function o() {
      t.state.ternTooltip = null, a.parentNode && O(a), u()
    }
    t.state.ternTooltip && M(t.state.ternTooltip);
    var l = t.cursorCoords(),
      a = t.state.ternTooltip = T(l.right + 1, l.bottom, n),
      s = !1,
      c = !1;
    e.on(a, "mousemove", function() {
      s = !0
    }), e.on(a, "mouseout", function(t) {
      var n = t.relatedTarget || t.toElement;
      n && e.contains(a, n) || (c ? o() : s = !1)
    }), setTimeout(i, r.options.hintDelay ? r.options.hintDelay : 1700);
    var u = L(t, o)
  }

  function L(e, t) {
    return e.on("cursorActivity", t), e.on("blur", t), e.on("scroll", t), e.on("setDoc", t),
      function() {
        e.off("cursorActivity", t), e.off("blur", t), e.off("scroll", t), e.off("setDoc", t)
      }
  }

  function T(e, t, n) {
    var r = C("div", F + "tooltip", n);
    return r.style.left = e + "px", r.style.top = t + "px", document.body.appendChild(r), r
  }

  function M(e) {
    var t = e && e.parentNode;
    t && t.removeChild(e)
  }

  function O(e) {
    e.style.opacity = "0", setTimeout(function() {
      M(e)
    }, 1100)
  }

  function N(e, t, n) {
    e.options.showError ? e.options.showError(t, n) : S(t, String(n), e)
  }

  function A(e) {
    e.activeArgHints && (e.activeArgHints.clear && e.activeArgHints.clear(), M(e.activeArgHints), e.activeArgHints = null)
  }

  function P(e, t) {
    var n = t.doc.getValue();
    return e.options.fileFilter && (n = e.options.fileFilter(n, t.name, t.doc)), n
  }

  function D(e) {
    function n(e, t) {
      t && (e.id = ++i, o[i] = t), r.postMessage(e)
    }
    var r = e.worker = new Worker(e.options.workerScript);
    r.postMessage({
      type: "init",
      defs: e.options.defs,
      plugins: e.options.plugins,
      scripts: e.options.workerDeps
    });
    var i = 0,
      o = {};
    r.onmessage = function(r) {
      var i = r.data;
      "getFile" == i.type ? t(e, i.name, function(e, t) {
        n({
          type: "getFile",
          err: String(e),
          text: t,
          id: i.id
        })
      }) : "debug" == i.type ? window.console.log(i.message) : i.id && o[i.id] && (o[i.id](i.err, i.body), delete o[i.id])
    }, r.onerror = function(e) {
      for (var t in o) o[t](e);
      o = {}
    }, this.addFile = function(e, t) {
      n({
        type: "add",
        name: e,
        text: t
      })
    }, this.delFile = function(e) {
      n({
        type: "del",
        name: e
      })
    }, this.request = function(e, t) {
      n({
        type: "req",
        body: e
      }, t)
    }
  }
  e.TernServer = function(e) {
    var n = this;
    this.options = e || {};
    var r = this.options.plugins || (this.options.plugins = {});
    r.doc_comment || (r.doc_comment = !0), this.docs = Object.create(null), this.options.useWorker ? this.server = new D(this) : this.server = new tern.Server({
      getFile: function(e, r) {
        return t(n, e, r)
      },
      async: !0,
      defs: this.options.defs || [],
      plugins: r
    }), this.trackChange = function(e, t) {
      i(n, e, t)
    }, this.cachedArgHints = null, this.activeArgHints = null, this.jumpStack = [], this.getHint = function(e, t) {
      return l(n, e, t)
    }, this.getHint.async = !0
  }, e.TernServer.prototype = {
    addDoc: function(t, n) {
      var r = {
        doc: n,
        name: t,
        changed: null
      };
      return this.server.addFile(t, P(this, r)), e.on(n, "change", this.trackChange), this.docs[t] = r
    },
    delDoc: function(t) {
      var n = r(this, t);
      n && (e.off(n.doc, "change", this.trackChange), delete this.docs[n.name], this.server.delFile(n.name))
    },
    hideDoc: function(e) {
      A(this);
      var t = r(this, e);
      t && t.changed && o(this, t)
    },
    complete: function(e) {
      e.showHint({
        hint: this.getHint
      })
    },
    showType: function(e, t, n) {
      s(this, e, t, "type", n)
    },
    showDocs: function(e, t, n) {
      s(this, e, t, "documentation", n)
    },
    updateArgHints: function(e) {
      c(this, e)
    },
    jumpToDef: function(e) {
      d(this, e)
    },
    jumpBack: function(e) {
      h(this, e)
    },
    rename: function(e) {
      v(this, e)
    },
    selectName: function(e) {
      y(this, e)
    },
    request: function(e, t, r, i) {
      var o = this,
        l = n(this, e.getDoc()),
        a = x(this, l, t, i),
        s = a.query && this.options.queryOptions && this.options.queryOptions[a.query.type];
      if (s)
        for (var c in s) a.query[c] = s[c];
      this.server.request(a, function(e, n) {
        !e && o.options.responseFilter && (n = o.options.responseFilter(l, t, a, e, n)), r(e, n)
      })
    },
    destroy: function() {
      A(this), this.worker && (this.worker.terminate(), this.worker = null)
    }
  };
  var H = e.Pos,
    F = "CodeMirror-Tern-",
    W = 250,
    E = 0,
    I = e.cmpPos
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e, t) {
    this.cm = e, this.options = t, this.widget = null, this.debounce = 0, this.tick = 0, this.startPos = this.cm.getCursor("start"), this.startLen = this.cm.getLine(this.startPos.line).length - this.cm.getSelection().length;
    var n = this;
    e.on("cursorActivity", this.activityFunc = function() {
      n.cursorActivity()
    })
  }

  function n(e, t, n) {
    var r = e.options.hintOptions,
      i = {};
    for (var o in p) i[o] = p[o];
    if (r)
      for (var o in r) void 0 !== r[o] && (i[o] = r[o]);
    if (n)
      for (var o in n) void 0 !== n[o] && (i[o] = n[o]);
    return i.hint.resolve && (i.hint = i.hint.resolve(e, t)), i
  }

  function r(e) {
    return "string" == typeof e ? e : e.text
  }

  function i(e, t) {
    function n(e, n) {
      var i;
      i = "string" != typeof n ? function(e) {
        return n(e, t)
      } : r.hasOwnProperty(n) ? r[n] : n, o[e] = i
    }
    var r = {
        Up: function() {
          t.moveFocus(-1)
        },
        Down: function() {
          t.moveFocus(1)
        },
        PageUp: function() {
          t.moveFocus(-t.menuSize() + 1, !0)
        },
        PageDown: function() {
          t.moveFocus(t.menuSize() - 1, !0)
        },
        Home: function() {
          t.setFocus(0)
        },
        End: function() {
          t.setFocus(t.length - 1)
        },
        Enter: t.pick,
        Tab: t.pick,
        Esc: t.close
      },
      i = e.options.customKeys,
      o = i ? {} : r;
    if (i)
      for (var l in i) i.hasOwnProperty(l) && n(l, i[l]);
    var a = e.options.extraKeys;
    if (a)
      for (var l in a) a.hasOwnProperty(l) && n(l, a[l]);
    return o
  }

  function o(e, t) {
    for (; t && t != e;) {
      if ("LI" === t.nodeName.toUpperCase() && t.parentNode == e) return t;
      t = t.parentNode
    }
  }

  function l(t, n) {
    this.completion = t, this.data = n, this.picked = !1;
    var l = this,
      a = t.cm,
      s = this.hints = document.createElement("ul");
    s.className = "CodeMirror-hints", this.selectedHint = n.selectedHint || 0;
    for (var c = n.list, d = 0; d < c.length; ++d) {
      var h = s.appendChild(document.createElement("li")),
        p = c[d],
        g = u + (d != this.selectedHint ? "" : " " + f);
      null != p.className && (g = p.className + " " + g), h.className = g, p.render ? p.render(h, n, p) : h.appendChild(document.createTextNode(p.displayText || r(p))), h.hintId = d
    }
    var m = a.cursorCoords(t.options.alignWithWord ? n.from : null),
      v = m.left,
      y = m.bottom,
      b = !0;
    s.style.left = v + "px", s.style.top = y + "px";
    var x = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
      w = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
    (t.options.container || document.body).appendChild(s);
    var C = s.getBoundingClientRect(),
      k = C.bottom - w,
      S = s.scrollHeight > s.clientHeight + 1,
      L = a.getScrollInfo();
    if (k > 0) {
      var T = C.bottom - C.top,
        M = m.top - (m.bottom - C.top);
      if (M - T > 0) s.style.top = (y = m.top - T) + "px", b = !1;
      else if (T > w) {
        s.style.height = w - 5 + "px", s.style.top = (y = m.bottom - C.top) + "px";
        var O = a.getCursor();
        n.from.ch != O.ch && (m = a.cursorCoords(O), s.style.left = (v = m.left) + "px", C = s.getBoundingClientRect())
      }
    }
    var N = C.right - x;
    if (N > 0 && (C.right - C.left > x && (s.style.width = x - 5 + "px", N -= C.right - C.left - x), s.style.left = (v = m.left - N) + "px"), S)
      for (var A = s.firstChild; A; A = A.nextSibling) A.style.paddingRight = a.display.nativeBarWidth + "px";
    if (a.addKeyMap(this.keyMap = i(t, {
        moveFocus: function(e, t) {
          l.changeActive(l.selectedHint + e, t)
        },
        setFocus: function(e) {
          l.changeActive(e)
        },
        menuSize: function() {
          return l.screenAmount()
        },
        length: c.length,
        close: function() {
          t.close()
        },
        pick: function() {
          l.pick()
        },
        data: n
      })), t.options.closeOnUnfocus) {
      var P;
      a.on("blur", this.onBlur = function() {
        P = setTimeout(function() {
          t.close()
        }, 100)
      }), a.on("focus", this.onFocus = function() {
        clearTimeout(P)
      })
    }
    return a.on("scroll", this.onScroll = function() {
      var e = a.getScrollInfo(),
        n = a.getWrapperElement().getBoundingClientRect(),
        r = y + L.top - e.top,
        i = r - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
      return b || (i += s.offsetHeight), i <= n.top || i >= n.bottom ? t.close() : (s.style.top = r + "px", void(s.style.left = v + L.left - e.left + "px"))
    }), e.on(s, "dblclick", function(e) {
      var t = o(s, e.target || e.srcElement);
      t && null != t.hintId && (l.changeActive(t.hintId), l.pick())
    }), e.on(s, "click", function(e) {
      var n = o(s, e.target || e.srcElement);
      n && null != n.hintId && (l.changeActive(n.hintId), t.options.completeOnSingleClick && l.pick())
    }), e.on(s, "mousedown", function() {
      setTimeout(function() {
        a.focus()
      }, 20)
    }), e.signal(n, "select", c[this.selectedHint], s.childNodes[this.selectedHint]), !0
  }

  function a(e, t) {
    if (!e.somethingSelected()) return t;
    for (var n = [], r = 0; r < t.length; r++) t[r].supportsSelection && n.push(t[r]);
    return n
  }

  function s(e, t, n, r) {
    if (e.async) e(t, r, n);
    else {
      var i = e(t, n);
      i && i.then ? i.then(r) : r(i)
    }
  }

  function c(t, n) {
    var r, i = t.getHelpers(n, "hint");
    if (i.length) {
      var o = function(e, t, n) {
        function r(i) {
          return i == o.length ? t(null) : void s(o[i], e, n, function(e) {
            e && e.list.length > 0 ? t(e) : r(i + 1)
          })
        }
        var o = a(e, i);
        r(0)
      };
      return o.async = !0, o.supportsSelection = !0, o
    }
    return (r = t.getHelper(t.getCursor(), "hintWords")) ? function(t) {
      return e.hint.fromList(t, {
        words: r
      })
    } : e.hint.anyword ? function(t, n) {
      return e.hint.anyword(t, n)
    } : function() {}
  }
  var u = "CodeMirror-hint",
    f = "CodeMirror-hint-active";
  e.showHint = function(e, t, n) {
    if (!t) return e.showHint(n);
    n && n.async && (t.async = !0);
    var r = {
      hint: t
    };
    if (n)
      for (var i in n) r[i] = n[i];
    return e.showHint(r)
  }, e.defineExtension("showHint", function(r) {
    r = n(this, this.getCursor("start"), r);
    var i = this.listSelections();
    if (!(i.length > 1)) {
      if (this.somethingSelected()) {
        if (!r.hint.supportsSelection) return;
        for (var o = 0; o < i.length; o++)
          if (i[o].head.line != i[o].anchor.line) return
      }
      this.state.completionActive && this.state.completionActive.close();
      var l = this.state.completionActive = new t(this, r);
      l.options.hint && (e.signal(this, "startCompletion", this), l.update(!0))
    }
  });
  var d = window.requestAnimationFrame || function(e) {
      return setTimeout(e, 1e3 / 60)
    },
    h = window.cancelAnimationFrame || clearTimeout;
  t.prototype = {
    close: function() {
      this.active() && (this.cm.state.completionActive = null, this.tick = null, this.cm.off("cursorActivity", this.activityFunc), this.widget && this.data && e.signal(this.data, "close"), this.widget && this.widget.close(), e.signal(this.cm, "endCompletion", this.cm))
    },
    active: function() {
      return this.cm.state.completionActive == this
    },
    pick: function(t, n) {
      var i = t.list[n];
      i.hint ? i.hint(this.cm, t, i) : this.cm.replaceRange(r(i), i.from || t.from, i.to || t.to, "complete"), e.signal(t, "pick", i), this.close()
    },
    cursorActivity: function() {
      this.debounce && (h(this.debounce), this.debounce = 0);
      var e = this.cm.getCursor(),
        t = this.cm.getLine(e.line);
      if (e.line != this.startPos.line || t.length - e.ch != this.startLen - this.startPos.ch || e.ch < this.startPos.ch || this.cm.somethingSelected() || e.ch && this.options.closeCharacters.test(t.charAt(e.ch - 1))) this.close();
      else {
        var n = this;
        this.debounce = d(function() {
          n.update()
        }), this.widget && this.widget.disable()
      }
    },
    update: function(e) {
      if (null != this.tick) {
        var t = this,
          n = ++this.tick;
        s(this.options.hint, this.cm, this.options, function(r) {
          t.tick == n && t.finishUpdate(r, e)
        })
      }
    },
    finishUpdate: function(t, n) {
      this.data && e.signal(this.data, "update");
      var r = this.widget && this.widget.picked || n && this.options.completeSingle;
      this.widget && this.widget.close(), this.data = t, t && t.list.length && (r && 1 == t.list.length ? this.pick(t, 0) : (this.widget = new l(this, t), e.signal(t, "shown")))
    }
  }, l.prototype = {
    close: function() {
      if (this.completion.widget == this) {
        this.completion.widget = null, this.hints.parentNode.removeChild(this.hints), this.completion.cm.removeKeyMap(this.keyMap);
        var e = this.completion.cm;
        this.completion.options.closeOnUnfocus && (e.off("blur", this.onBlur), e.off("focus", this.onFocus)), e.off("scroll", this.onScroll)
      }
    },
    disable: function() {
      this.completion.cm.removeKeyMap(this.keyMap);
      var e = this;
      this.keyMap = {
        Enter: function() {
          e.picked = !0
        }
      }, this.completion.cm.addKeyMap(this.keyMap)
    },
    pick: function() {
      this.completion.pick(this.data, this.selectedHint)
    },
    changeActive: function(t, n) {
      if (t >= this.data.list.length ? t = n ? this.data.list.length - 1 : 0 : t < 0 && (t = n ? 0 : this.data.list.length - 1), this.selectedHint != t) {
        var r = this.hints.childNodes[this.selectedHint];
        r && (r.className = r.className.replace(" " + f, "")), r = this.hints.childNodes[this.selectedHint = t], r.className += " " + f, r.offsetTop < this.hints.scrollTop ? this.hints.scrollTop = r.offsetTop - 3 : r.offsetTop + r.offsetHeight > this.hints.scrollTop + this.hints.clientHeight && (this.hints.scrollTop = r.offsetTop + r.offsetHeight - this.hints.clientHeight + 3), e.signal(this.data, "select", this.data.list[this.selectedHint], r)
      }
    },
    screenAmount: function() {
      return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1
    }
  }, e.registerHelper("hint", "auto", {
    resolve: c
  }), e.registerHelper("hint", "fromList", function(t, n) {
    var r, i = t.getCursor(),
      o = t.getTokenAt(i),
      l = e.Pos(i.line, o.start),
      a = i;
    o.start < i.ch && /\w/.test(o.string.charAt(i.ch - o.start - 1)) ? r = o.string.substr(0, i.ch - o.start) : (r = "", l = i);
    for (var s = [], c = 0; c < n.words.length; c++) {
      var u = n.words[c];
      u.slice(0, r.length) == r && s.push(u)
    }
    if (s.length) return {
      list: s,
      from: l,
      to: a
    }
  }), e.commands.autocomplete = e.showHint;
  var p = {
    hint: e.hint.auto,
    completeSingle: !0,
    alignWithWord: !0,
    closeCharacters: /[\s()\[\]{};:>,]/,
    closeOnUnfocus: !0,
    completeOnSingleClick: !0,
    container: null,
    customKeys: null,
    extraKeys: null
  };
  e.defineOption("hintOptions", null)
}),
function(e) {
  "object" == typeof exports && "object" == typeof module ? e(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], e) : e(CodeMirror)
}(function(e) {
  "use strict";

  function t(e) {
    var t = e.search(o);
    return t == -1 ? 0 : t
  }

  function n(e, t, n) {
    return /\bstring\b/.test(e.getTokenTypeAt(l(t.line, 0))) && !/^[\'\"\`]/.test(n)
  }

  function r(e, t) {
    var n = e.getMode();
    return n.useInnerComments !== !1 && n.innerMode ? e.getModeAt(t) : n
  }
  var i = {},
    o = /[^\s\u00a0]/,
    l = e.Pos;
  e.commands.toggleComment = function(e) {
    e.toggleComment()
  }, e.defineExtension("toggleComment", function(e) {
    e || (e = i);
    for (var t = this, n = 1 / 0, r = this.listSelections(), o = null, a = r.length - 1; a >= 0; a--) {
      var s = r[a].from(),
        c = r[a].to();
      s.line >= n || (c.line >= n && (c = l(n, 0)), n = s.line, null == o ? t.uncomment(s, c, e) ? o = "un" : (t.lineComment(s, c, e), o = "line") : "un" == o ? t.uncomment(s, c, e) : t.lineComment(s, c, e))
    }
  }), e.defineExtension("lineComment", function(e, a, s) {
    s || (s = i);
    var c = this,
      u = r(c, e),
      f = c.getLine(e.line);
    if (null != f && !n(c, e, f)) {
      var d = s.lineComment || u.lineComment;
      if (!d) return void((s.blockCommentStart || u.blockCommentStart) && (s.fullLines = !0, c.blockComment(e, a, s)));
      var h = Math.min(0 != a.ch || a.line == e.line ? a.line + 1 : a.line, c.lastLine() + 1),
        p = null == s.padding ? " " : s.padding,
        g = s.commentBlankLines || e.line == a.line;
      c.operation(function() {
        if (s.indent) {
          for (var n = null, r = e.line; r < h; ++r) {
            var i = c.getLine(r),
              a = i.slice(0, t(i));
            (null == n || n.length > a.length) && (n = a)
          }
          for (var r = e.line; r < h; ++r) {
            var i = c.getLine(r),
              u = n.length;
            (g || o.test(i)) && (i.slice(0, u) != n && (u = t(i)), c.replaceRange(n + d + p, l(r, 0), l(r, u)))
          }
        } else
          for (var r = e.line; r < h; ++r)(g || o.test(c.getLine(r))) && c.replaceRange(d + p, l(r, 0))
      })
    }
  }), e.defineExtension("blockComment", function(e, t, n) {
    n || (n = i);
    var a = this,
      s = r(a, e),
      c = n.blockCommentStart || s.blockCommentStart,
      u = n.blockCommentEnd || s.blockCommentEnd;
    if (!c || !u) return void((n.lineComment || s.lineComment) && 0 != n.fullLines && a.lineComment(e, t, n));
    if (!/\bcomment\b/.test(a.getTokenTypeAt(l(e.line, 0)))) {
      var f = Math.min(t.line, a.lastLine());
      f != e.line && 0 == t.ch && o.test(a.getLine(f)) && --f;
      var d = null == n.padding ? " " : n.padding;
      e.line > f || a.operation(function() {
        if (0 != n.fullLines) {
          var r = o.test(a.getLine(f));
          a.replaceRange(d + u, l(f)), a.replaceRange(c + d, l(e.line, 0));
          var i = n.blockCommentLead || s.blockCommentLead;
          if (null != i)
            for (var h = e.line + 1; h <= f; ++h)(h != f || r) && a.replaceRange(i + d, l(h, 0))
        } else a.replaceRange(u, t), a.replaceRange(c, e)
      })
    }
  }), e.defineExtension("uncomment", function(e, t, n) {
    n || (n = i);
    var a, s = this,
      c = r(s, e),
      u = Math.min(0 != t.ch || t.line == e.line ? t.line : t.line - 1, s.lastLine()),
      f = Math.min(e.line, u),
      d = n.lineComment || c.lineComment,
      h = [],
      p = null == n.padding ? " " : n.padding;
    e: if (d) {
      for (var g = f; g <= u; ++g) {
        var m = s.getLine(g),
          v = m.indexOf(d);
        if (v > -1 && !/comment/.test(s.getTokenTypeAt(l(g, v + 1))) && (v = -1), v == -1 && o.test(m)) break e;
        if (v > -1 && o.test(m.slice(0, v))) break e;
        h.push(m)
      }
      if (s.operation(function() {
          for (var e = f; e <= u; ++e) {
            var t = h[e - f],
              n = t.indexOf(d),
              r = n + d.length;
            n < 0 || (t.slice(r, r + p.length) == p && (r += p.length), a = !0, s.replaceRange("", l(e, n), l(e, r)))
          }
        }), a) return !0
    }
    var y = n.blockCommentStart || c.blockCommentStart,
      b = n.blockCommentEnd || c.blockCommentEnd;
    if (!y || !b) return !1;
    var x = n.blockCommentLead || c.blockCommentLead,
      w = s.getLine(f),
      C = w.indexOf(y);
    if (C == -1) return !1;
    var k = u == f ? w : s.getLine(u),
      S = k.indexOf(b, u == f ? C + y.length : 0),
      L = l(f, C + 1),
      T = l(u, S + 1);
    if (S == -1 || !/comment/.test(s.getTokenTypeAt(L)) || !/comment/.test(s.getTokenTypeAt(T)) || s.getRange(L, T, "\n").indexOf(b) > -1) return !1;
    var M = w.lastIndexOf(y, e.ch),
      O = M == -1 ? -1 : w.slice(0, e.ch).indexOf(b, M + y.length);
    if (M != -1 && O != -1 && O + b.length != e.ch) return !1;
    O = k.indexOf(b, t.ch);
    var N = k.slice(t.ch).lastIndexOf(y, O - t.ch);
    return M = O == -1 || N == -1 ? -1 : t.ch + N, (O == -1 || M == -1 || M == t.ch) && (s.operation(function() {
      s.replaceRange("", l(u, S - (p && k.slice(S - p.length, S) == p ? p.length : 0)), l(u, S + b.length));
      var e = C + y.length;
      if (p && w.slice(e, e + p.length) == p && (e += p.length), s.replaceRange("", l(f, C), l(f, e)), x)
        for (var t = f + 1; t <= u; ++t) {
          var n = s.getLine(t),
            r = n.indexOf(x);
          if (r != -1 && !o.test(n.slice(0, r))) {
            var i = r + x.length;
            p && n.slice(i, i + p.length) == p && (i += p.length), s.replaceRange("", l(t, r), l(t, i))
          }
        }
    }), !0)
  })
});
/*! RESOURCE: /scripts/snc-code-editor/codemirror/mode/css/css.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  CodeMirror.defineMode("css", function(config, parserConfig) {
    var inline = parserConfig.inline
    if (!parserConfig.propertyKeywords) parserConfig = CodeMirror.resolveMode("text/css");
    var indentUnit = config.indentUnit,
      tokenHooks = parserConfig.tokenHooks,
      documentTypes = parserConfig.documentTypes || {},
      mediaTypes = parserConfig.mediaTypes || {},
      mediaFeatures = parserConfig.mediaFeatures || {},
      mediaValueKeywords = parserConfig.mediaValueKeywords || {},
      propertyKeywords = parserConfig.propertyKeywords || {},
      nonStandardPropertyKeywords = parserConfig.nonStandardPropertyKeywords || {},
      fontProperties = parserConfig.fontProperties || {},
      counterDescriptors = parserConfig.counterDescriptors || {},
      colorKeywords = parserConfig.colorKeywords || {},
      valueKeywords = parserConfig.valueKeywords || {},
      allowNested = parserConfig.allowNested,
      lineComment = parserConfig.lineComment,
      supportsAtComponent = parserConfig.supportsAtComponent === true;
    var type, override;

    function ret(style, tp) {
      type = tp;
      return style;
    }

    function tokenBase(stream, state) {
      var ch = stream.next();
      if (tokenHooks[ch]) {
        var result = tokenHooks[ch](stream, state);
        if (result !== false) return result;
      }
      if (ch == "@") {
        stream.eatWhile(/[\w\\\-]/);
        return ret("def", stream.current());
      } else if (ch == "=" || (ch == "~" || ch == "|") && stream.eat("=")) {
        return ret(null, "compare");
      } else if (ch == "\"" || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      } else if (ch == "#") {
        stream.eatWhile(/[\w\\\-]/);
        return ret("atom", "hash");
      } else if (ch == "!") {
        stream.match(/^\s*\w*/);
        return ret("keyword", "important");
      } else if (/\d/.test(ch) || ch == "." && stream.eat(/\d/)) {
        stream.eatWhile(/[\w.%]/);
        return ret("number", "unit");
      } else if (ch === "-") {
        if (/[\d.]/.test(stream.peek())) {
          stream.eatWhile(/[\w.%]/);
          return ret("number", "unit");
        } else if (stream.match(/^-[\w\\\-]+/)) {
          stream.eatWhile(/[\w\\\-]/);
          if (stream.match(/^\s*:/, false))
            return ret("variable-2", "variable-definition");
          return ret("variable-2", "variable");
        } else if (stream.match(/^\w+-/)) {
          return ret("meta", "meta");
        }
      } else if (/[,+>*\/]/.test(ch)) {
        return ret(null, "select-op");
      } else if (ch == "." && stream.match(/^-?[_a-z][_a-z0-9-]*/i)) {
        return ret("qualifier", "qualifier");
      } else if (/[:;{}\[\]\(\)]/.test(ch)) {
        return ret(null, ch);
      } else if (((ch == "u" || ch == "U") && stream.match(/rl(-prefix)?\(/i)) ||
        ((ch == "d" || ch == "D") && stream.match("omain(", true, true)) ||
        ((ch == "r" || ch == "R") && stream.match("egexp(", true, true))) {
        stream.backUp(1);
        state.tokenize = tokenParenthesized;
        return ret("property", "word");
      } else if (/[\w\\\-]/.test(ch)) {
        stream.eatWhile(/[\w\\\-]/);
        return ret("property", "word");
      } else {
        return ret(null, null);
      }
    }

    function tokenString(quote) {
      return function(stream, state) {
        var escaped = false,
          ch;
        while ((ch = stream.next()) != null) {
          if (ch == quote && !escaped) {
            if (quote == ")") stream.backUp(1);
            break;
          }
          escaped = !escaped && ch == "\\";
        }
        if (ch == quote || !escaped && quote != ")") state.tokenize = null;
        return ret("string", "string");
      };
    }

    function tokenParenthesized(stream, state) {
      stream.next();
      if (!stream.match(/\s*[\"\')]/, false))
        state.tokenize = tokenString(")");
      else
        state.tokenize = null;
      return ret(null, "(");
    }

    function Context(type, indent, prev) {
      this.type = type;
      this.indent = indent;
      this.prev = prev;
    }

    function pushContext(state, stream, type, indent) {
      state.context = new Context(type, stream.indentation() + (indent === false ? 0 : indentUnit), state.context);
      return type;
    }

    function popContext(state) {
      if (state.context.prev)
        state.context = state.context.prev;
      return state.context.type;
    }

    function pass(type, stream, state) {
      return states[state.context.type](type, stream, state);
    }

    function popAndPass(type, stream, state, n) {
      for (var i = n || 1; i > 0; i--)
        state.context = state.context.prev;
      return pass(type, stream, state);
    }

    function wordAsValue(stream) {
      var word = stream.current().toLowerCase();
      if (valueKeywords.hasOwnProperty(word))
        override = "atom";
      else if (colorKeywords.hasOwnProperty(word))
        override = "keyword";
      else
        override = "variable";
    }
    var states = {};
    states.top = function(type, stream, state) {
      if (type == "{") {
        return pushContext(state, stream, "block");
      } else if (type == "}" && state.context.prev) {
        return popContext(state);
      } else if (supportsAtComponent && /@component/i.test(type)) {
        return pushContext(state, stream, "atComponentBlock");
      } else if (/^@(-moz-)?document$/i.test(type)) {
        return pushContext(state, stream, "documentTypes");
      } else if (/^@(media|supports|(-moz-)?document|import)$/i.test(type)) {
        return pushContext(state, stream, "atBlock");
      } else if (/^@(font-face|counter-style)/i.test(type)) {
        state.stateArg = type;
        return "restricted_atBlock_before";
      } else if (/^@(-(moz|ms|o|webkit)-)?keyframes$/i.test(type)) {
        return "keyframes";
      } else if (type && type.charAt(0) == "@") {
        return pushContext(state, stream, "at");
      } else if (type == "hash") {
        override = "builtin";
      } else if (type == "word") {
        override = "tag";
      } else if (type == "variable-definition") {
        return "maybeprop";
      } else if (type == "interpolation") {
        return pushContext(state, stream, "interpolation");
      } else if (type == ":") {
        return "pseudo";
      } else if (allowNested && type == "(") {
        return pushContext(state, stream, "parens");
      }
      return state.context.type;
    };
    states.block = function(type, stream, state) {
      if (type == "word") {
        var word = stream.current().toLowerCase();
        if (propertyKeywords.hasOwnProperty(word)) {
          override = "property";
          return "maybeprop";
        } else if (nonStandardPropertyKeywords.hasOwnProperty(word)) {
          override = "string-2";
          return "maybeprop";
        } else if (allowNested) {
          override = stream.match(/^\s*:(?:\s|$)/, false) ? "property" : "tag";
          return "block";
        } else {
          override += " error";
          return "maybeprop";
        }
      } else if (type == "meta") {
        return "block";
      } else if (!allowNested && (type == "hash" || type == "qualifier")) {
        override = "error";
        return "block";
      } else {
        return states.top(type, stream, state);
      }
    };
    states.maybeprop = function(type, stream, state) {
      if (type == ":") return pushContext(state, stream, "prop");
      return pass(type, stream, state);
    };
    states.prop = function(type, stream, state) {
      if (type == ";") return popContext(state);
      if (type == "{" && allowNested) return pushContext(state, stream, "propBlock");
      if (type == "}" || type == "{") return popAndPass(type, stream, state);
      if (type == "(") return pushContext(state, stream, "parens");
      if (type == "hash" && !/^#([0-9a-fA-f]{3,4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(stream.current())) {
        override += " error";
      } else if (type == "word") {
        wordAsValue(stream);
      } else if (type == "interpolation") {
        return pushContext(state, stream, "interpolation");
      }
      return "prop";
    };
    states.propBlock = function(type, _stream, state) {
      if (type == "}") return popContext(state);
      if (type == "word") {
        override = "property";
        return "maybeprop";
      }
      return state.context.type;
    };
    states.parens = function(type, stream, state) {
      if (type == "{" || type == "}") return popAndPass(type, stream, state);
      if (type == ")") return popContext(state);
      if (type == "(") return pushContext(state, stream, "parens");
      if (type == "interpolation") return pushContext(state, stream, "interpolation");
      if (type == "word") wordAsValue(stream);
      return "parens";
    };
    states.pseudo = function(type, stream, state) {
      if (type == "meta") return "pseudo";
      if (type == "word") {
        override = "variable-3";
        return state.context.type;
      }
      return pass(type, stream, state);
    };
    states.documentTypes = function(type, stream, state) {
      if (type == "word" && documentTypes.hasOwnProperty(stream.current())) {
        override = "tag";
        return state.context.type;
      } else {
        return states.atBlock(type, stream, state);
      }
    };
    states.atBlock = function(type, stream, state) {
      if (type == "(") return pushContext(state, stream, "atBlock_parens");
      if (type == "}" || type == ";") return popAndPass(type, stream, state);
      if (type == "{") return popContext(state) && pushContext(state, stream, allowNested ? "block" : "top");
      if (type == "interpolation") return pushContext(state, stream, "interpolation");
      if (type == "word") {
        var word = stream.current().toLowerCase();
        if (word == "only" || word == "not" || word == "and" || word == "or")
          override = "keyword";
        else if (mediaTypes.hasOwnProperty(word))
          override = "attribute";
        else if (mediaFeatures.hasOwnProperty(word))
          override = "property";
        else if (mediaValueKeywords.hasOwnProperty(word))
          override = "keyword";
        else if (propertyKeywords.hasOwnProperty(word))
          override = "property";
        else if (nonStandardPropertyKeywords.hasOwnProperty(word))
          override = "string-2";
        else if (valueKeywords.hasOwnProperty(word))
          override = "atom";
        else if (colorKeywords.hasOwnProperty(word))
          override = "keyword";
        else
          override = "error";
      }
      return state.context.type;
    };
    states.atComponentBlock = function(type, stream, state) {
      if (type == "}")
        return popAndPass(type, stream, state);
      if (type == "{")
        return popContext(state) && pushContext(state, stream, allowNested ? "block" : "top", false);
      if (type == "word")
        override = "error";
      return state.context.type;
    };
    states.atBlock_parens = function(type, stream, state) {
      if (type == ")") return popContext(state);
      if (type == "{" || type == "}") return popAndPass(type, stream, state, 2);
      return states.atBlock(type, stream, state);
    };
    states.restricted_atBlock_before = function(type, stream, state) {
      if (type == "{")
        return pushContext(state, stream, "restricted_atBlock");
      if (type == "word" && state.stateArg == "@counter-style") {
        override = "variable";
        return "restricted_atBlock_before";
      }
      return pass(type, stream, state);
    };
    states.restricted_atBlock = function(type, stream, state) {
      if (type == "}") {
        state.stateArg = null;
        return popContext(state);
      }
      if (type == "word") {
        if ((state.stateArg == "@font-face" && !fontProperties.hasOwnProperty(stream.current().toLowerCase())) ||
          (state.stateArg == "@counter-style" && !counterDescriptors.hasOwnProperty(stream.current().toLowerCase())))
          override = "error";
        else
          override = "property";
        return "maybeprop";
      }
      return "restricted_atBlock";
    };
    states.keyframes = function(type, stream, state) {
      if (type == "word") {
        override = "variable";
        return "keyframes";
      }
      if (type == "{") return pushContext(state, stream, "top");
      return pass(type, stream, state);
    };
    states.at = function(type, stream, state) {
      if (type == ";") return popContext(state);
      if (type == "{" || type == "}") return popAndPass(type, stream, state);
      if (type == "word") override = "tag";
      else if (type == "hash") override = "builtin";
      return "at";
    };
    states.interpolation = function(type, stream, state) {
      if (type == "}") return popContext(state);
      if (type == "{" || type == ";") return popAndPass(type, stream, state);
      if (type == "word") override = "variable";
      else if (type != "variable" && type != "(" && type != ")") override = "error";
      return "interpolation";
    };
    return {
      startState: function(base) {
        return {
          tokenize: null,
          state: inline ? "block" : "top",
          stateArg: null,
          context: new Context(inline ? "block" : "top", base || 0, null)
        };
      },
      token: function(stream, state) {
        if (!state.tokenize && stream.eatSpace()) return null;
        var style = (state.tokenize || tokenBase)(stream, state);
        if (style && typeof style == "object") {
          type = style[1];
          style = style[0];
        }
        override = style;
        if (type != "comment")
          state.state = states[state.state](type, stream, state);
        return override;
      },
      indent: function(state, textAfter) {
        var cx = state.context,
          ch = textAfter && textAfter.charAt(0);
        var indent = cx.indent;
        if (cx.type == "prop" && (ch == "}" || ch == ")")) cx = cx.prev;
        if (cx.prev) {
          if (ch == "}" && (cx.type == "block" || cx.type == "top" ||
              cx.type == "interpolation" || cx.type == "restricted_atBlock")) {
            cx = cx.prev;
            indent = cx.indent;
          } else if (ch == ")" && (cx.type == "parens" || cx.type == "atBlock_parens") ||
            ch == "{" && (cx.type == "at" || cx.type == "atBlock")) {
            indent = Math.max(0, cx.indent - indentUnit);
          }
        }
        return indent;
      },
      electricChars: "}",
      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      blockCommentContinue: " * ",
      lineComment: lineComment,
      fold: "brace"
    };
  });

  function keySet(array) {
    var keys = {};
    for (var i = 0; i < array.length; ++i) {
      keys[array[i].toLowerCase()] = true;
    }
    return keys;
  }
  var documentTypes_ = [
      "domain", "regexp", "url", "url-prefix"
    ],
    documentTypes = keySet(documentTypes_);
  var mediaTypes_ = [
      "all", "aural", "braille", "handheld", "print", "projection", "screen",
      "tty", "tv", "embossed"
    ],
    mediaTypes = keySet(mediaTypes_);
  var mediaFeatures_ = [
      "width", "min-width", "max-width", "height", "min-height", "max-height",
      "device-width", "min-device-width", "max-device-width", "device-height",
      "min-device-height", "max-device-height", "aspect-ratio",
      "min-aspect-ratio", "max-aspect-ratio", "device-aspect-ratio",
      "min-device-aspect-ratio", "max-device-aspect-ratio", "color", "min-color",
      "max-color", "color-index", "min-color-index", "max-color-index",
      "monochrome", "min-monochrome", "max-monochrome", "resolution",
      "min-resolution", "max-resolution", "scan", "grid", "orientation",
      "device-pixel-ratio", "min-device-pixel-ratio", "max-device-pixel-ratio",
      "pointer", "any-pointer", "hover", "any-hover"
    ],
    mediaFeatures = keySet(mediaFeatures_);
  var mediaValueKeywords_ = [
      "landscape", "portrait", "none", "coarse", "fine", "on-demand", "hover",
      "interlace", "progressive"
    ],
    mediaValueKeywords = keySet(mediaValueKeywords_);
  var propertyKeywords_ = [
      "align-content", "align-items", "align-self", "alignment-adjust",
      "alignment-baseline", "anchor-point", "animation", "animation-delay",
      "animation-direction", "animation-duration", "animation-fill-mode",
      "animation-iteration-count", "animation-name", "animation-play-state",
      "animation-timing-function", "appearance", "azimuth", "backface-visibility",
      "background", "background-attachment", "background-blend-mode", "background-clip",
      "background-color", "background-image", "background-origin", "background-position",
      "background-repeat", "background-size", "baseline-shift", "binding",
      "bleed", "bookmark-label", "bookmark-level", "bookmark-state",
      "bookmark-target", "border", "border-bottom", "border-bottom-color",
      "border-bottom-left-radius", "border-bottom-right-radius",
      "border-bottom-style", "border-bottom-width", "border-collapse",
      "border-color", "border-image", "border-image-outset",
      "border-image-repeat", "border-image-slice", "border-image-source",
      "border-image-width", "border-left", "border-left-color",
      "border-left-style", "border-left-width", "border-radius", "border-right",
      "border-right-color", "border-right-style", "border-right-width",
      "border-spacing", "border-style", "border-top", "border-top-color",
      "border-top-left-radius", "border-top-right-radius", "border-top-style",
      "border-top-width", "border-width", "bottom", "box-decoration-break",
      "box-shadow", "box-sizing", "break-after", "break-before", "break-inside",
      "caption-side", "caret-color", "clear", "clip", "color", "color-profile", "column-count",
      "column-fill", "column-gap", "column-rule", "column-rule-color",
      "column-rule-style", "column-rule-width", "column-span", "column-width",
      "columns", "content", "counter-increment", "counter-reset", "crop", "cue",
      "cue-after", "cue-before", "cursor", "direction", "display",
      "dominant-baseline", "drop-initial-after-adjust",
      "drop-initial-after-align", "drop-initial-before-adjust",
      "drop-initial-before-align", "drop-initial-size", "drop-initial-value",
      "elevation", "empty-cells", "fit", "fit-position", "flex", "flex-basis",
      "flex-direction", "flex-flow", "flex-grow", "flex-shrink", "flex-wrap",
      "float", "float-offset", "flow-from", "flow-into", "font", "font-feature-settings",
      "font-family", "font-kerning", "font-language-override", "font-size", "font-size-adjust",
      "font-stretch", "font-style", "font-synthesis", "font-variant",
      "font-variant-alternates", "font-variant-caps", "font-variant-east-asian",
      "font-variant-ligatures", "font-variant-numeric", "font-variant-position",
      "font-weight", "grid", "grid-area", "grid-auto-columns", "grid-auto-flow",
      "grid-auto-rows", "grid-column", "grid-column-end", "grid-column-gap",
      "grid-column-start", "grid-gap", "grid-row", "grid-row-end", "grid-row-gap",
      "grid-row-start", "grid-template", "grid-template-areas", "grid-template-columns",
      "grid-template-rows", "hanging-punctuation", "height", "hyphens",
      "icon", "image-orientation", "image-rendering", "image-resolution",
      "inline-box-align", "justify-content", "justify-items", "justify-self", "left", "letter-spacing",
      "line-break", "line-height", "line-stacking", "line-stacking-ruby",
      "line-stacking-shift", "line-stacking-strategy", "list-style",
      "list-style-image", "list-style-position", "list-style-type", "margin",
      "margin-bottom", "margin-left", "margin-right", "margin-top",
      "marks", "marquee-direction", "marquee-loop",
      "marquee-play-count", "marquee-speed", "marquee-style", "max-height",
      "max-width", "min-height", "min-width", "move-to", "nav-down", "nav-index",
      "nav-left", "nav-right", "nav-up", "object-fit", "object-position",
      "opacity", "order", "orphans", "outline",
      "outline-color", "outline-offset", "outline-style", "outline-width",
      "overflow", "overflow-style", "overflow-wrap", "overflow-x", "overflow-y",
      "padding", "padding-bottom", "padding-left", "padding-right", "padding-top",
      "page", "page-break-after", "page-break-before", "page-break-inside",
      "page-policy", "pause", "pause-after", "pause-before", "perspective",
      "perspective-origin", "pitch", "pitch-range", "place-content", "place-items", "place-self", "play-during", "position",
      "presentation-level", "punctuation-trim", "quotes", "region-break-after",
      "region-break-before", "region-break-inside", "region-fragment",
      "rendering-intent", "resize", "rest", "rest-after", "rest-before", "richness",
      "right", "rotation", "rotation-point", "ruby-align", "ruby-overhang",
      "ruby-position", "ruby-span", "shape-image-threshold", "shape-inside", "shape-margin",
      "shape-outside", "size", "speak", "speak-as", "speak-header",
      "speak-numeral", "speak-punctuation", "speech-rate", "stress", "string-set",
      "tab-size", "table-layout", "target", "target-name", "target-new",
      "target-position", "text-align", "text-align-last", "text-decoration",
      "text-decoration-color", "text-decoration-line", "text-decoration-skip",
      "text-decoration-style", "text-emphasis", "text-emphasis-color",
      "text-emphasis-position", "text-emphasis-style", "text-height",
      "text-indent", "text-justify", "text-outline", "text-overflow", "text-shadow",
      "text-size-adjust", "text-space-collapse", "text-transform", "text-underline-position",
      "text-wrap", "top", "transform", "transform-origin", "transform-style",
      "transition", "transition-delay", "transition-duration",
      "transition-property", "transition-timing-function", "unicode-bidi",
      "user-select", "vertical-align", "visibility", "voice-balance", "voice-duration",
      "voice-family", "voice-pitch", "voice-range", "voice-rate", "voice-stress",
      "voice-volume", "volume", "white-space", "widows", "width", "will-change", "word-break",
      "word-spacing", "word-wrap", "z-index",
      "clip-path", "clip-rule", "mask", "enable-background", "filter", "flood-color",
      "flood-opacity", "lighting-color", "stop-color", "stop-opacity", "pointer-events",
      "color-interpolation", "color-interpolation-filters",
      "color-rendering", "fill", "fill-opacity", "fill-rule", "image-rendering",
      "marker", "marker-end", "marker-mid", "marker-start", "shape-rendering", "stroke",
      "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin",
      "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-rendering",
      "baseline-shift", "dominant-baseline", "glyph-orientation-horizontal",
      "glyph-orientation-vertical", "text-anchor", "writing-mode"
    ],
    propertyKeywords = keySet(propertyKeywords_);
  var nonStandardPropertyKeywords_ = [
      "scrollbar-arrow-color", "scrollbar-base-color", "scrollbar-dark-shadow-color",
      "scrollbar-face-color", "scrollbar-highlight-color", "scrollbar-shadow-color",
      "scrollbar-3d-light-color", "scrollbar-track-color", "shape-inside",
      "searchfield-cancel-button", "searchfield-decoration", "searchfield-results-button",
      "searchfield-results-decoration", "zoom"
    ],
    nonStandardPropertyKeywords = keySet(nonStandardPropertyKeywords_);
  var fontProperties_ = [
      "font-family", "src", "unicode-range", "font-variant", "font-feature-settings",
      "font-stretch", "font-weight", "font-style"
    ],
    fontProperties = keySet(fontProperties_);
  var counterDescriptors_ = [
      "additive-symbols", "fallback", "negative", "pad", "prefix", "range",
      "speak-as", "suffix", "symbols", "system"
    ],
    counterDescriptors = keySet(counterDescriptors_);
  var colorKeywords_ = [
      "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige",
      "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown",
      "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue",
      "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod",
      "darkgray", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen",
      "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
      "darkslateblue", "darkslategray", "darkturquoise", "darkviolet",
      "deeppink", "deepskyblue", "dimgray", "dodgerblue", "firebrick",
      "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite",
      "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew",
      "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
      "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral",
      "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink",
      "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray",
      "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta",
      "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
      "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise",
      "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin",
      "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered",
      "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
      "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
      "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown",
      "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue",
      "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan",
      "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white",
      "whitesmoke", "yellow", "yellowgreen"
    ],
    colorKeywords = keySet(colorKeywords_);
  var valueKeywords_ = [
      "above", "absolute", "activeborder", "additive", "activecaption", "afar",
      "after-white-space", "ahead", "alias", "all", "all-scroll", "alphabetic", "alternate",
      "always", "amharic", "amharic-abegede", "antialiased", "appworkspace",
      "arabic-indic", "armenian", "asterisks", "attr", "auto", "auto-flow", "avoid", "avoid-column", "avoid-page",
      "avoid-region", "background", "backwards", "baseline", "below", "bidi-override", "binary",
      "bengali", "blink", "block", "block-axis", "bold", "bolder", "border", "border-box",
      "both", "bottom", "break", "break-all", "break-word", "bullets", "button", "button-bevel",
      "buttonface", "buttonhighlight", "buttonshadow", "buttontext", "calc", "cambodian",
      "capitalize", "caps-lock-indicator", "caption", "captiontext", "caret",
      "cell", "center", "checkbox", "circle", "cjk-decimal", "cjk-earthly-branch",
      "cjk-heavenly-stem", "cjk-ideographic", "clear", "clip", "close-quote",
      "col-resize", "collapse", "color", "color-burn", "color-dodge", "column", "column-reverse",
      "compact", "condensed", "contain", "content", "contents",
      "content-box", "context-menu", "continuous", "copy", "counter", "counters", "cover", "crop",
      "cross", "crosshair", "currentcolor", "cursive", "cyclic", "darken", "dashed", "decimal",
      "decimal-leading-zero", "default", "default-button", "dense", "destination-atop",
      "destination-in", "destination-out", "destination-over", "devanagari", "difference",
      "disc", "discard", "disclosure-closed", "disclosure-open", "document",
      "dot-dash", "dot-dot-dash",
      "dotted", "double", "down", "e-resize", "ease", "ease-in", "ease-in-out", "ease-out",
      "element", "ellipse", "ellipsis", "embed", "end", "ethiopic", "ethiopic-abegede",
      "ethiopic-abegede-am-et", "ethiopic-abegede-gez", "ethiopic-abegede-ti-er",
      "ethiopic-abegede-ti-et", "ethiopic-halehame-aa-er",
      "ethiopic-halehame-aa-et", "ethiopic-halehame-am-et",
      "ethiopic-halehame-gez", "ethiopic-halehame-om-et",
      "ethiopic-halehame-sid-et", "ethiopic-halehame-so-et",
      "ethiopic-halehame-ti-er", "ethiopic-halehame-ti-et", "ethiopic-halehame-tig",
      "ethiopic-numeric", "ew-resize", "exclusion", "expanded", "extends", "extra-condensed",
      "extra-expanded", "fantasy", "fast", "fill", "fixed", "flat", "flex", "flex-end", "flex-start", "footnotes",
      "forwards", "from", "geometricPrecision", "georgian", "graytext", "grid", "groove",
      "gujarati", "gurmukhi", "hand", "hangul", "hangul-consonant", "hard-light", "hebrew",
      "help", "hidden", "hide", "higher", "highlight", "highlighttext",
      "hiragana", "hiragana-iroha", "horizontal", "hsl", "hsla", "hue", "icon", "ignore",
      "inactiveborder", "inactivecaption", "inactivecaptiontext", "infinite",
      "infobackground", "infotext", "inherit", "initial", "inline", "inline-axis",
      "inline-block", "inline-flex", "inline-grid", "inline-table", "inset", "inside", "intrinsic", "invert",
      "italic", "japanese-formal", "japanese-informal", "justify", "kannada",
      "katakana", "katakana-iroha", "keep-all", "khmer",
      "korean-hangul-formal", "korean-hanja-formal", "korean-hanja-informal",
      "landscape", "lao", "large", "larger", "left", "level", "lighter", "lighten",
      "line-through", "linear", "linear-gradient", "lines", "list-item", "listbox", "listitem",
      "local", "logical", "loud", "lower", "lower-alpha", "lower-armenian",
      "lower-greek", "lower-hexadecimal", "lower-latin", "lower-norwegian",
      "lower-roman", "lowercase", "ltr", "luminosity", "malayalam", "match", "matrix", "matrix3d",
      "media-controls-background", "media-current-time-display",
      "media-fullscreen-button", "media-mute-button", "media-play-button",
      "media-return-to-realtime-button", "media-rewind-button",
      "media-seek-back-button", "media-seek-forward-button", "media-slider",
      "media-sliderthumb", "media-time-remaining-display", "media-volume-slider",
      "media-volume-slider-container", "media-volume-sliderthumb", "medium",
      "menu", "menulist", "menulist-button", "menulist-text",
      "menulist-textfield", "menutext", "message-box", "middle", "min-intrinsic",
      "mix", "mongolian", "monospace", "move", "multiple", "multiply", "myanmar", "n-resize",
      "narrower", "ne-resize", "nesw-resize", "no-close-quote", "no-drop",
      "no-open-quote", "no-repeat", "none", "normal", "not-allowed", "nowrap",
      "ns-resize", "numbers", "numeric", "nw-resize", "nwse-resize", "oblique", "octal", "opacity", "open-quote",
      "optimizeLegibility", "optimizeSpeed", "oriya", "oromo", "outset",
      "outside", "outside-shape", "overlay", "overline", "padding", "padding-box",
      "painted", "page", "paused", "persian", "perspective", "plus-darker", "plus-lighter",
      "pointer", "polygon", "portrait", "pre", "pre-line", "pre-wrap", "preserve-3d",
      "progress", "push-button", "radial-gradient", "radio", "read-only",
      "read-write", "read-write-plaintext-only", "rectangle", "region",
      "relative", "repeat", "repeating-linear-gradient",
      "repeating-radial-gradient", "repeat-x", "repeat-y", "reset", "reverse",
      "rgb", "rgba", "ridge", "right", "rotate", "rotate3d", "rotateX", "rotateY",
      "rotateZ", "round", "row", "row-resize", "row-reverse", "rtl", "run-in", "running",
      "s-resize", "sans-serif", "saturation", "scale", "scale3d", "scaleX", "scaleY", "scaleZ", "screen",
      "scroll", "scrollbar", "scroll-position", "se-resize", "searchfield",
      "searchfield-cancel-button", "searchfield-decoration",
      "searchfield-results-button", "searchfield-results-decoration", "self-start", "self-end",
      "semi-condensed", "semi-expanded", "separate", "serif", "show", "sidama",
      "simp-chinese-formal", "simp-chinese-informal", "single",
      "skew", "skewX", "skewY", "skip-white-space", "slide", "slider-horizontal",
      "slider-vertical", "sliderthumb-horizontal", "sliderthumb-vertical", "slow",
      "small", "small-caps", "small-caption", "smaller", "soft-light", "solid", "somali",
      "source-atop", "source-in", "source-out", "source-over", "space", "space-around", "space-between", "space-evenly", "spell-out", "square",
      "square-button", "start", "static", "status-bar", "stretch", "stroke", "sub",
      "subpixel-antialiased", "super", "sw-resize", "symbolic", "symbols", "system-ui", "table",
      "table-caption", "table-cell", "table-column", "table-column-group",
      "table-footer-group", "table-header-group", "table-row", "table-row-group",
      "tamil",
      "telugu", "text", "text-bottom", "text-top", "textarea", "textfield", "thai",
      "thick", "thin", "threeddarkshadow", "threedface", "threedhighlight",
      "threedlightshadow", "threedshadow", "tibetan", "tigre", "tigrinya-er",
      "tigrinya-er-abegede", "tigrinya-et", "tigrinya-et-abegede", "to", "top",
      "trad-chinese-formal", "trad-chinese-informal", "transform",
      "translate", "translate3d", "translateX", "translateY", "translateZ",
      "transparent", "ultra-condensed", "ultra-expanded", "underline", "unset", "up",
      "upper-alpha", "upper-armenian", "upper-greek", "upper-hexadecimal",
      "upper-latin", "upper-norwegian", "upper-roman", "uppercase", "urdu", "url",
      "var", "vertical", "vertical-text", "visible", "visibleFill", "visiblePainted",
      "visibleStroke", "visual", "w-resize", "wait", "wave", "wider",
      "window", "windowframe", "windowtext", "words", "wrap", "wrap-reverse", "x-large", "x-small", "xor",
      "xx-large", "xx-small"
    ],
    valueKeywords = keySet(valueKeywords_);
  var allWords = documentTypes_.concat(mediaTypes_).concat(mediaFeatures_).concat(mediaValueKeywords_)
    .concat(propertyKeywords_).concat(nonStandardPropertyKeywords_).concat(colorKeywords_)
    .concat(valueKeywords_);
  CodeMirror.registerHelper("hintWords", "css", allWords);

  function tokenCComment(stream, state) {
    var maybeEnd = false,
      ch;
    while ((ch = stream.next()) != null) {
      if (maybeEnd && ch == "/") {
        state.tokenize = null;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ["comment", "comment"];
  }
  CodeMirror.defineMIME("text/css", {
    documentTypes: documentTypes,
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    fontProperties: fontProperties,
    counterDescriptors: counterDescriptors,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    tokenHooks: {
      "/": function(stream, state) {
        if (!stream.eat("*")) return false;
        state.tokenize = tokenCComment;
        return tokenCComment(stream, state);
      }
    },
    name: "css"
  });
  CodeMirror.defineMIME("text/x-scss", {
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    fontProperties: fontProperties,
    allowNested: true,
    lineComment: "//",
    tokenHooks: {
      "/": function(stream, state) {
        if (stream.eat("/")) {
          stream.skipToEnd();
          return ["comment", "comment"];
        } else if (stream.eat("*")) {
          state.tokenize = tokenCComment;
          return tokenCComment(stream, state);
        } else {
          return ["operator", "operator"];
        }
      },
      ":": function(stream) {
        if (stream.match(/\s*\{/, false))
          return [null, null]
        return false;
      },
      "$": function(stream) {
        stream.match(/^[\w-]+/);
        if (stream.match(/^\s*:/, false))
          return ["variable-2", "variable-definition"];
        return ["variable-2", "variable"];
      },
      "#": function(stream) {
        if (!stream.eat("{")) return false;
        return [null, "interpolation"];
      }
    },
    name: "css",
    helperType: "scss"
  });
  CodeMirror.defineMIME("text/x-less", {
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    fontProperties: fontProperties,
    allowNested: true,
    lineComment: "//",
    tokenHooks: {
      "/": function(stream, state) {
        if (stream.eat("/")) {
          stream.skipToEnd();
          return ["comment", "comment"];
        } else if (stream.eat("*")) {
          state.tokenize = tokenCComment;
          return tokenCComment(stream, state);
        } else {
          return ["operator", "operator"];
        }
      },
      "@": function(stream) {
        if (stream.eat("{")) return [null, "interpolation"];
        if (stream.match(/^(charset|document|font-face|import|(-(moz|ms|o|webkit)-)?keyframes|media|namespace|page|supports)\b/i, false)) return false;
        stream.eatWhile(/[\w\\\-]/);
        if (stream.match(/^\s*:/, false))
          return ["variable-2", "variable-definition"];
        return ["variable-2", "variable"];
      },
      "&": function() {
        return ["atom", "atom"];
      }
    },
    name: "css",
    helperType: "less"
  });
  CodeMirror.defineMIME("text/x-gss", {
    documentTypes: documentTypes,
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    fontProperties: fontProperties,
    counterDescriptors: counterDescriptors,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    supportsAtComponent: true,
    tokenHooks: {
      "/": function(stream, state) {
        if (!stream.eat("*")) return false;
        state.tokenize = tokenCComment;
        return tokenCComment(stream, state);
      }
    },
    name: "css",
    helperType: "gss"
  });
});;
/*! RESOURCE: /scripts/snc-code-editor/codemirror/mode/xml/xml.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  var htmlConfig = {
    autoSelfClosers: {
      'area': true,
      'base': true,
      'br': true,
      'col': true,
      'command': true,
      'embed': true,
      'frame': true,
      'hr': true,
      'img': true,
      'input': true,
      'keygen': true,
      'link': true,
      'meta': true,
      'param': true,
      'source': true,
      'track': true,
      'wbr': true,
      'menuitem': true
    },
    implicitlyClosed: {
      'dd': true,
      'li': true,
      'optgroup': true,
      'option': true,
      'p': true,
      'rp': true,
      'rt': true,
      'tbody': true,
      'td': true,
      'tfoot': true,
      'th': true,
      'tr': true
    },
    contextGrabbers: {
      'dd': {
        'dd': true,
        'dt': true
      },
      'dt': {
        'dd': true,
        'dt': true
      },
      'li': {
        'li': true
      },
      'option': {
        'option': true,
        'optgroup': true
      },
      'optgroup': {
        'optgroup': true
      },
      'p': {
        'address': true,
        'article': true,
        'aside': true,
        'blockquote': true,
        'dir': true,
        'div': true,
        'dl': true,
        'fieldset': true,
        'footer': true,
        'form': true,
        'h1': true,
        'h2': true,
        'h3': true,
        'h4': true,
        'h5': true,
        'h6': true,
        'header': true,
        'hgroup': true,
        'hr': true,
        'menu': true,
        'nav': true,
        'ol': true,
        'p': true,
        'pre': true,
        'section': true,
        'table': true,
        'ul': true
      },
      'rp': {
        'rp': true,
        'rt': true
      },
      'rt': {
        'rp': true,
        'rt': true
      },
      'tbody': {
        'tbody': true,
        'tfoot': true
      },
      'td': {
        'td': true,
        'th': true
      },
      'tfoot': {
        'tbody': true
      },
      'th': {
        'td': true,
        'th': true
      },
      'thead': {
        'tbody': true,
        'tfoot': true
      },
      'tr': {
        'tr': true
      }
    },
    doNotIndent: {
      "pre": true
    },
    allowUnquoted: true,
    allowMissing: true,
    caseFold: true
  }
  var xmlConfig = {
    autoSelfClosers: {},
    implicitlyClosed: {},
    contextGrabbers: {},
    doNotIndent: {},
    allowUnquoted: false,
    allowMissing: false,
    allowMissingTagName: false,
    caseFold: false
  }
  CodeMirror.defineMode("xml", function(editorConf, config_) {
    var indentUnit = editorConf.indentUnit
    var config = {}
    var defaults = config_.htmlMode ? htmlConfig : xmlConfig
    for (var prop in defaults) config[prop] = defaults[prop]
    for (var prop in config_) config[prop] = config_[prop]
    var type, setStyle;

    function inText(stream, state) {
      function chain(parser) {
        state.tokenize = parser;
        return parser(stream, state);
      }
      var ch = stream.next();
      if (ch == "<") {
        if (stream.eat("!")) {
          if (stream.eat("[")) {
            if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
            else return null;
          } else if (stream.match("--")) {
            return chain(inBlock("comment", "-->"));
          } else if (stream.match("DOCTYPE", true, true)) {
            stream.eatWhile(/[\w\._\-]/);
            return chain(doctype(1));
          } else {
            return null;
          }
        } else if (stream.eat("?")) {
          stream.eatWhile(/[\w\._\-]/);
          state.tokenize = inBlock("meta", "?>");
          return "meta";
        } else {
          type = stream.eat("/") ? "closeTag" : "openTag";
          state.tokenize = inTag;
          return "tag bracket";
        }
      } else if (ch == "&") {
        var ok;
        if (stream.eat("#")) {
          if (stream.eat("x")) {
            ok = stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";");
          } else {
            ok = stream.eatWhile(/[\d]/) && stream.eat(";");
          }
        } else {
          ok = stream.eatWhile(/[\w\.\-:]/) && stream.eat(";");
        }
        return ok ? "atom" : "error";
      } else {
        stream.eatWhile(/[^&<]/);
        return null;
      }
    }
    inText.isInText = true;

    function inTag(stream, state) {
      var ch = stream.next();
      if (ch == ">" || (ch == "/" && stream.eat(">"))) {
        state.tokenize = inText;
        type = ch == ">" ? "endTag" : "selfcloseTag";
        return "tag bracket";
      } else if (ch == "=") {
        type = "equals";
        return null;
      } else if (ch == "<") {
        state.tokenize = inText;
        state.state = baseState;
        state.tagName = state.tagStart = null;
        var next = state.tokenize(stream, state);
        return next ? next + " tag error" : "tag error";
      } else if (/[\'\"]/.test(ch)) {
        state.tokenize = inAttribute(ch);
        state.stringStartCol = stream.column();
        return state.tokenize(stream, state);
      } else {
        stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/);
        return "word";
      }
    }

    function inAttribute(quote) {
      var closure = function(stream, state) {
        while (!stream.eol()) {
          if (stream.next() == quote) {
            state.tokenize = inTag;
            break;
          }
        }
        return "string";
      };
      closure.isInAttribute = true;
      return closure;
    }

    function inBlock(style, terminator) {
      return function(stream, state) {
        while (!stream.eol()) {
          if (stream.match(terminator)) {
            state.tokenize = inText;
            break;
          }
          stream.next();
        }
        return style;
      };
    }

    function doctype(depth) {
      return function(stream, state) {
        var ch;
        while ((ch = stream.next()) != null) {
          if (ch == "<") {
            state.tokenize = doctype(depth + 1);
            return state.tokenize(stream, state);
          } else if (ch == ">") {
            if (depth == 1) {
              state.tokenize = inText;
              break;
            } else {
              state.tokenize = doctype(depth - 1);
              return state.tokenize(stream, state);
            }
          }
        }
        return "meta";
      };
    }

    function Context(state, tagName, startOfLine) {
      this.prev = state.context;
      this.tagName = tagName;
      this.indent = state.indented;
      this.startOfLine = startOfLine;
      if (config.doNotIndent.hasOwnProperty(tagName) || (state.context && state.context.noIndent))
        this.noIndent = true;
    }

    function popContext(state) {
      if (state.context) state.context = state.context.prev;
    }

    function maybePopContext(state, nextTagName) {
      var parentTagName;
      while (true) {
        if (!state.context) {
          return;
        }
        parentTagName = state.context.tagName;
        if (!config.contextGrabbers.hasOwnProperty(parentTagName) ||
          !config.contextGrabbers[parentTagName].hasOwnProperty(nextTagName)) {
          return;
        }
        popContext(state);
      }
    }

    function baseState(type, stream, state) {
      if (type == "openTag") {
        state.tagStart = stream.column();
        return tagNameState;
      } else if (type == "closeTag") {
        return closeTagNameState;
      } else {
        return baseState;
      }
    }

    function tagNameState(type, stream, state) {
      if (type == "word") {
        state.tagName = stream.current();
        setStyle = "tag";
        return attrState;
      } else if (config.allowMissingTagName && type == "endTag") {
        setStyle = "tag bracket";
        return attrState(type, stream, state);
      } else {
        setStyle = "error";
        return tagNameState;
      }
    }

    function closeTagNameState(type, stream, state) {
      if (type == "word") {
        var tagName = stream.current();
        if (state.context && state.context.tagName != tagName &&
          config.implicitlyClosed.hasOwnProperty(state.context.tagName))
          popContext(state);
        if ((state.context && state.context.tagName == tagName) || config.matchClosing === false) {
          setStyle = "tag";
          return closeState;
        } else {
          setStyle = "tag error";
          return closeStateErr;
        }
      } else if (config.allowMissingTagName && type == "endTag") {
        setStyle = "tag bracket";
        return closeState(type, stream, state);
      } else {
        setStyle = "error";
        return closeStateErr;
      }
    }

    function closeState(type, _stream, state) {
      if (type != "endTag") {
        setStyle = "error";
        return closeState;
      }
      popContext(state);
      return baseState;
    }

    function closeStateErr(type, stream, state) {
      setStyle = "error";
      return closeState(type, stream, state);
    }

    function attrState(type, _stream, state) {
      if (type == "word") {
        setStyle = "attribute";
        return attrEqState;
      } else if (type == "endTag" || type == "selfcloseTag") {
        var tagName = state.tagName,
          tagStart = state.tagStart;
        state.tagName = state.tagStart = null;
        if (type == "selfcloseTag" ||
          config.autoSelfClosers.hasOwnProperty(tagName)) {
          maybePopContext(state, tagName);
        } else {
          maybePopContext(state, tagName);
          state.context = new Context(state, tagName, tagStart == state.indented);
        }
        return baseState;
      }
      setStyle = "error";
      return attrState;
    }

    function attrEqState(type, stream, state) {
      if (type == "equals") return attrValueState;
      if (!config.allowMissing) setStyle = "error";
      return attrState(type, stream, state);
    }

    function attrValueState(type, stream, state) {
      if (type == "string") return attrContinuedState;
      if (type == "word" && config.allowUnquoted) {
        setStyle = "string";
        return attrState;
      }
      setStyle = "error";
      return attrState(type, stream, state);
    }

    function attrContinuedState(type, stream, state) {
      if (type == "string") return attrContinuedState;
      return attrState(type, stream, state);
    }
    return {
      startState: function(baseIndent) {
        var state = {
          tokenize: inText,
          state: baseState,
          indented: baseIndent || 0,
          tagName: null,
          tagStart: null,
          context: null
        }
        if (baseIndent != null) state.baseIndent = baseIndent
        return state
      },
      token: function(stream, state) {
        if (!state.tagName && stream.sol())
          state.indented = stream.indentation();
        if (stream.eatSpace()) return null;
        type = null;
        var style = state.tokenize(stream, state);
        if ((style || type) && style != "comment") {
          setStyle = null;
          state.state = state.state(type || style, stream, state);
          if (setStyle)
            style = setStyle == "error" ? style + " error" : setStyle;
        }
        return style;
      },
      indent: function(state, textAfter, fullLine) {
        var context = state.context;
        if (state.tokenize.isInAttribute) {
          if (state.tagStart == state.indented)
            return state.stringStartCol + 1;
          else
            return state.indented + indentUnit;
        }
        if (context && context.noIndent) return CodeMirror.Pass;
        if (state.tokenize != inTag && state.tokenize != inText)
          return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
        if (state.tagName) {
          if (config.multilineTagIndentPastTag !== false)
            return state.tagStart + state.tagName.length + 2;
          else
            return state.tagStart + indentUnit * (config.multilineTagIndentFactor || 1);
        }
        if (config.alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
        var tagAfter = textAfter && /^<(\/)?([\w_:\.-]*)/.exec(textAfter);
        if (tagAfter && tagAfter[1]) {
          while (context) {
            if (context.tagName == tagAfter[2]) {
              context = context.prev;
              break;
            } else if (config.implicitlyClosed.hasOwnProperty(context.tagName)) {
              context = context.prev;
            } else {
              break;
            }
          }
        } else if (tagAfter) {
          while (context) {
            var grabbers = config.contextGrabbers[context.tagName];
            if (grabbers && grabbers.hasOwnProperty(tagAfter[2]))
              context = context.prev;
            else
              break;
          }
        }
        while (context && context.prev && !context.startOfLine)
          context = context.prev;
        if (context) return context.indent + indentUnit;
        else return state.baseIndent || 0;
      },
      electricInput: /<\/[\s\w:]+>$/,
      blockCommentStart: "<!--",
      blockCommentEnd: "-->",
      configuration: config.htmlMode ? "html" : "xml",
      helperType: config.htmlMode ? "html" : "xml",
      skipAttribute: function(state) {
        if (state.state == attrValueState)
          state.state = attrState
      }
    };
  });
  CodeMirror.defineMIME("text/xml", "xml");
  CodeMirror.defineMIME("application/xml", "xml");
  if (!CodeMirror.mimeModes.hasOwnProperty("text/html"))
    CodeMirror.defineMIME("text/html", {
      name: "xml",
      htmlMode: true
    });
});;
/*! RESOURCE: /scripts/snc-code-editor/codemirror/mode/htmlmixed/htmlmixed.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"), require("../xml/xml"), require("../javascript/javascript"), require("../css/css"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror", "../xml/xml", "../javascript/javascript", "../css/css"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  var defaultTags = {
    script: [
      ["lang", /(javascript|babel)/i, "javascript"],
      ["type", /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i, "javascript"],
      ["type", /./, "text/plain"],
      [null, null, "javascript"]
    ],
    style: [
      ["lang", /^css$/i, "css"],
      ["type", /^(text\/)?(x-)?(stylesheet|css)$/i, "css"],
      ["type", /./, "text/plain"],
      [null, null, "css"]
    ]
  };

  function maybeBackup(stream, pat, style) {
    var cur = stream.current(),
      close = cur.search(pat);
    if (close > -1) {
      stream.backUp(cur.length - close);
    } else if (cur.match(/<\/?$/)) {
      stream.backUp(cur.length);
      if (!stream.match(pat, false)) stream.match(cur);
    }
    return style;
  }
  var attrRegexpCache = {};

  function getAttrRegexp(attr) {
    var regexp = attrRegexpCache[attr];
    if (regexp) return regexp;
    return attrRegexpCache[attr] = new RegExp("\\s+" + attr + "\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*");
  }

  function getAttrValue(text, attr) {
    var match = text.match(getAttrRegexp(attr))
    return match ? /^\s*(.*?)\s*$/.exec(match[2])[1] : ""
  }

  function getTagRegexp(tagName, anchored) {
    return new RegExp((anchored ? "^" : "") + "<\/\s*" + tagName + "\s*>", "i");
  }

  function addTags(from, to) {
    for (var tag in from) {
      var dest = to[tag] || (to[tag] = []);
      var source = from[tag];
      for (var i = source.length - 1; i >= 0; i--)
        dest.unshift(source[i])
    }
  }

  function findMatchingMode(tagInfo, tagText) {
    for (var i = 0; i < tagInfo.length; i++) {
      var spec = tagInfo[i];
      if (!spec[0] || spec[1].test(getAttrValue(tagText, spec[0]))) return spec[2];
    }
  }
  CodeMirror.defineMode("htmlmixed", function(config, parserConfig) {
    var htmlMode = CodeMirror.getMode(config, {
      name: "xml",
      htmlMode: true,
      multilineTagIndentFactor: parserConfig.multilineTagIndentFactor,
      multilineTagIndentPastTag: parserConfig.multilineTagIndentPastTag
    });
    var tags = {};
    var configTags = parserConfig && parserConfig.tags,
      configScript = parserConfig && parserConfig.scriptTypes;
    addTags(defaultTags, tags);
    if (configTags) addTags(configTags, tags);
    if (configScript)
      for (var i = configScript.length - 1; i >= 0; i--)
        tags.script.unshift(["type", configScript[i].matches, configScript[i].mode])

    function html(stream, state) {
      var style = htmlMode.token(stream, state.htmlState),
        tag = /\btag\b/.test(style),
        tagName
      if (tag && !/[<>\s\/]/.test(stream.current()) &&
        (tagName = state.htmlState.tagName && state.htmlState.tagName.toLowerCase()) &&
        tags.hasOwnProperty(tagName)) {
        state.inTag = tagName + " "
      } else if (state.inTag && tag && />$/.test(stream.current())) {
        var inTag = /^([\S]+) (.*)/.exec(state.inTag)
        state.inTag = null
        var modeSpec = stream.current() == ">" && findMatchingMode(tags[inTag[1]], inTag[2])
        var mode = CodeMirror.getMode(config, modeSpec)
        var endTagA = getTagRegexp(inTag[1], true),
          endTag = getTagRegexp(inTag[1], false);
        state.token = function(stream, state) {
          if (stream.match(endTagA, false)) {
            state.token = html;
            state.localState = state.localMode = null;
            return null;
          }
          return maybeBackup(stream, endTag, state.localMode.token(stream, state.localState));
        };
        state.localMode = mode;
        state.localState = CodeMirror.startState(mode, htmlMode.indent(state.htmlState, ""));
      } else if (state.inTag) {
        state.inTag += stream.current()
        if (stream.eol()) state.inTag += " "
      }
      return style;
    };
    return {
      startState: function() {
        var state = CodeMirror.startState(htmlMode);
        return {
          token: html,
          inTag: null,
          localMode: null,
          localState: null,
          htmlState: state
        };
      },
      copyState: function(state) {
        var local;
        if (state.localState) {
          local = CodeMirror.copyState(state.localMode, state.localState);
        }
        return {
          token: state.token,
          inTag: state.inTag,
          localMode: state.localMode,
          localState: local,
          htmlState: CodeMirror.copyState(htmlMode, state.htmlState)
        };
      },
      token: function(stream, state) {
        return state.token(stream, state);
      },
      indent: function(state, textAfter, line) {
        if (!state.localMode || /^\s*<\//.test(textAfter))
          return htmlMode.indent(state.htmlState, textAfter);
        else if (state.localMode.indent)
          return state.localMode.indent(state.localState, textAfter, line);
        else
          return CodeMirror.Pass;
      },
      innerMode: function(state) {
        return {
          state: state.localState || state.htmlState,
          mode: state.localMode || htmlMode
        };
      }
    };
  }, "xml", "javascript", "css");
  CodeMirror.defineMIME("text/html", "htmlmixed");
});;
/*! RESOURCE: /scripts/snc-code-editor/codemirror/mode/javascript/javascript.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  CodeMirror.defineMode("javascript", function(config, parserConfig) {
    var indentUnit = config.indentUnit;
    var statementIndent = parserConfig.statementIndent;
    var jsonldMode = parserConfig.jsonld;
    var jsonMode = parserConfig.json || jsonldMode;
    var isTS = parserConfig.typescript;
    var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/;
    var keywords = function() {
      function kw(type) {
        return {
          type: type,
          style: "keyword"
        };
      }
      var A = kw("keyword a"),
        B = kw("keyword b"),
        C = kw("keyword c"),
        D = kw("keyword d");
      var operator = kw("operator"),
        atom = {
          type: "atom",
          style: "atom"
        };
      return {
        "if": kw("if"),
        "while": A,
        "with": A,
        "else": B,
        "do": B,
        "try": B,
        "finally": B,
        "return": D,
        "break": D,
        "continue": D,
        "new": kw("new"),
        "delete": C,
        "void": C,
        "throw": C,
        "debugger": kw("debugger"),
        "var": kw("var"),
        "const": kw("var"),
        "let": kw("var"),
        "function": kw("function"),
        "catch": kw("catch"),
        "for": kw("for"),
        "switch": kw("switch"),
        "case": kw("case"),
        "default": kw("default"),
        "in": operator,
        "typeof": operator,
        "instanceof": operator,
        "true": atom,
        "false": atom,
        "null": atom,
        "undefined": atom,
        "NaN": atom,
        "Infinity": atom,
        "this": kw("this"),
        "class": kw("class"),
        "super": kw("atom"),
        "yield": C,
        "export": kw("export"),
        "import": kw("import"),
        "extends": C,
        "await": C
      };
    }();
    var isOperatorChar = /[+\-*&%=<>!?|~^@]/;
    var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;

    function readRegexp(stream) {
      var escaped = false,
        next, inSet = false;
      while ((next = stream.next()) != null) {
        if (!escaped) {
          if (next == "/" && !inSet) return;
          if (next == "[") inSet = true;
          else if (inSet && next == "]") inSet = false;
        }
        escaped = !escaped && next == "\\";
      }
    }
    var type, content;

    function ret(tp, style, cont) {
      type = tp;
      content = cont;
      return style;
    }

    function tokenBase(stream, state) {
      var ch = stream.next();
      if (ch == '"' || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      } else if (ch == "." && stream.match(/^\d+(?:[eE][+\-]?\d+)?/)) {
        return ret("number", "number");
      } else if (ch == "." && stream.match("..")) {
        return ret("spread", "meta");
      } else if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
        return ret(ch);
      } else if (ch == "=" && stream.eat(">")) {
        return ret("=>", "operator");
      } else if (ch == "0" && stream.match(/^(?:x[\da-f]+|o[0-7]+|b[01]+)n?/i)) {
        return ret("number", "number");
      } else if (/\d/.test(ch)) {
        stream.match(/^\d*(?:n|(?:\.\d*)?(?:[eE][+\-]?\d+)?)?/);
        return ret("number", "number");
      } else if (ch == "/") {
        if (stream.eat("*")) {
          state.tokenize = tokenComment;
          return tokenComment(stream, state);
        } else if (stream.eat("/")) {
          stream.skipToEnd();
          return ret("comment", "comment");
        } else if (expressionAllowed(stream, state, 1)) {
          readRegexp(stream);
          stream.match(/^\b(([gimyus])(?![gimyus]*\2))+\b/);
          return ret("regexp", "string-2");
        } else {
          stream.eat("=");
          return ret("operator", "operator", stream.current());
        }
      } else if (ch == "`") {
        state.tokenize = tokenQuasi;
        return tokenQuasi(stream, state);
      } else if (ch == "#") {
        stream.skipToEnd();
        return ret("error", "error");
      } else if (isOperatorChar.test(ch)) {
        if (ch != ">" || !state.lexical || state.lexical.type != ">") {
          if (stream.eat("=")) {
            if (ch == "!" || ch == "=") stream.eat("=")
          } else if (/[<>*+\-]/.test(ch)) {
            stream.eat(ch)
            if (ch == ">") stream.eat(ch)
          }
        }
        return ret("operator", "operator", stream.current());
      } else if (wordRE.test(ch)) {
        stream.eatWhile(wordRE);
        var word = stream.current()
        if (state.lastType != ".") {
          if (keywords.propertyIsEnumerable(word)) {
            var kw = keywords[word]
            return ret(kw.type, kw.style, word)
          }
          if (word == "async" && stream.match(/^(\s|\/\*.*?\*\/)*[\[\(\w]/, false))
            return ret("async", "keyword", word)
        }
        return ret("variable", "variable", word)
      }
    }

    function tokenString(quote) {
      return function(stream, state) {
        var escaped = false,
          next;
        if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)) {
          state.tokenize = tokenBase;
          return ret("jsonld-keyword", "meta");
        }
        while ((next = stream.next()) != null) {
          if (next == quote && !escaped) break;
          escaped = !escaped && next == "\\";
        }
        if (!escaped) state.tokenize = tokenBase;
        return ret("string", "string");
      };
    }

    function tokenComment(stream, state) {
      var maybeEnd = false,
        ch;
      while (ch = stream.next()) {
        if (ch == "/" && maybeEnd) {
          state.tokenize = tokenBase;
          break;
        }
        maybeEnd = (ch == "*");
      }
      return ret("comment", "comment");
    }

    function tokenQuasi(stream, state) {
      var escaped = false,
        next;
      while ((next = stream.next()) != null) {
        if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
          state.tokenize = tokenBase;
          break;
        }
        escaped = !escaped && next == "\\";
      }
      return ret("quasi", "string-2", stream.current());
    }
    var brackets = "([{}])";

    function findFatArrow(stream, state) {
      if (state.fatArrowAt) state.fatArrowAt = null;
      var arrow = stream.string.indexOf("=>", stream.start);
      if (arrow < 0) return;
      if (isTS) {
        var m = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(stream.string.slice(stream.start, arrow))
        if (m) arrow = m.index
      }
      var depth = 0,
        sawSomething = false;
      for (var pos = arrow - 1; pos >= 0; --pos) {
        var ch = stream.string.charAt(pos);
        var bracket = brackets.indexOf(ch);
        if (bracket >= 0 && bracket < 3) {
          if (!depth) {
            ++pos;
            break;
          }
          if (--depth == 0) {
            if (ch == "(") sawSomething = true;
            break;
          }
        } else if (bracket >= 3 && bracket < 6) {
          ++depth;
        } else if (wordRE.test(ch)) {
          sawSomething = true;
        } else if (/["'\/]/.test(ch)) {
          return;
        } else if (sawSomething && !depth) {
          ++pos;
          break;
        }
      }
      if (sawSomething && !depth) state.fatArrowAt = pos;
    }
    var atomicTypes = {
      "atom": true,
      "number": true,
      "variable": true,
      "string": true,
      "regexp": true,
      "this": true,
      "jsonld-keyword": true
    };

    function JSLexical(indented, column, type, align, prev, info) {
      this.indented = indented;
      this.column = column;
      this.type = type;
      this.prev = prev;
      this.info = info;
      if (align != null) this.align = align;
    }

    function inScope(state, varname) {
      for (var v = state.localVars; v; v = v.next)
        if (v.name == varname) return true;
      for (var cx = state.context; cx; cx = cx.prev) {
        for (var v = cx.vars; v; v = v.next)
          if (v.name == varname) return true;
      }
    }

    function parseJS(state, style, type, content, stream) {
      var cc = state.cc;
      cx.state = state;
      cx.stream = stream;
      cx.marked = null, cx.cc = cc;
      cx.style = style;
      if (!state.lexical.hasOwnProperty("align"))
        state.lexical.align = true;
      while (true) {
        var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
        if (combinator(type, content)) {
          while (cc.length && cc[cc.length - 1].lex)
            cc.pop()();
          if (cx.marked) return cx.marked;
          if (type == "variable" && inScope(state, content)) return "variable-2";
          return style;
        }
      }
    }
    var cx = {
      state: null,
      column: null,
      marked: null,
      cc: null
    };

    function pass() {
      for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
    }

    function cont() {
      pass.apply(null, arguments);
      return true;
    }

    function inList(name, list) {
      for (var v = list; v; v = v.next)
        if (v.name == name) return true
      return false;
    }

    function register(varname) {
      var state = cx.state;
      cx.marked = "def";
      if (state.context) {
        if (state.lexical.info == "var" && state.context && state.context.block) {
          var newContext = registerVarScoped(varname, state.context)
          if (newContext != null) {
            state.context = newContext
            return
          }
        } else if (!inList(varname, state.localVars)) {
          state.localVars = new Var(varname, state.localVars)
          return
        }
      }
      if (parserConfig.globalVars && !inList(varname, state.globalVars))
        state.globalVars = new Var(varname, state.globalVars)
    }

    function registerVarScoped(varname, context) {
      if (!context) {
        return null
      } else if (context.block) {
        var inner = registerVarScoped(varname, context.prev)
        if (!inner) return null
        if (inner == context.prev) return context
        return new Context(inner, context.vars, true)
      } else if (inList(varname, context.vars)) {
        return context
      } else {
        return new Context(context.prev, new Var(varname, context.vars), false)
      }
    }

    function isModifier(name) {
      return name == "public" || name == "private" || name == "protected" || name == "abstract" || name == "readonly"
    }

    function Context(prev, vars, block) {
      this.prev = prev;
      this.vars = vars;
      this.block = block
    }

    function Var(name, next) {
      this.name = name;
      this.next = next
    }
    var defaultVars = new Var("this", new Var("arguments", null))

    function pushcontext() {
      cx.state.context = new Context(cx.state.context, cx.state.localVars, false)
      cx.state.localVars = defaultVars
    }

    function pushblockcontext() {
      cx.state.context = new Context(cx.state.context, cx.state.localVars, true)
      cx.state.localVars = null
    }

    function popcontext() {
      cx.state.localVars = cx.state.context.vars
      cx.state.context = cx.state.context.prev
    }
    popcontext.lex = true

    function pushlex(type, info) {
      var result = function() {
        var state = cx.state,
          indent = state.indented;
        if (state.lexical.type == "stat") indent = state.lexical.indented;
        else
          for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev)
            indent = outer.indented;
        state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
      };
      result.lex = true;
      return result;
    }

    function poplex() {
      var state = cx.state;
      if (state.lexical.prev) {
        if (state.lexical.type == ")")
          state.indented = state.lexical.indented;
        state.lexical = state.lexical.prev;
      }
    }
    poplex.lex = true;

    function expect(wanted) {
      function exp(type) {
        if (type == wanted) return cont();
        else if (wanted == ";") return pass();
        else return cont(exp);
      };
      return exp;
    }

    function statement(type, value) {
      if (type == "var") return cont(pushlex("vardef", value), vardef, expect(";"), poplex);
      if (type == "keyword a") return cont(pushlex("form"), parenExpr, statement, poplex);
      if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
      if (type == "keyword d") return cx.stream.match(/^\s*$/, false) ? cont() : cont(pushlex("stat"), maybeexpression, expect(";"), poplex);
      if (type == "debugger") return cont(expect(";"));
      if (type == "{") return cont(pushlex("}"), pushblockcontext, block, poplex, popcontext);
      if (type == ";") return cont();
      if (type == "if") {
        if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex)
          cx.state.cc.pop()();
        return cont(pushlex("form"), parenExpr, statement, poplex, maybeelse);
      }
      if (type == "function") return cont(functiondef);
      if (type == "for") return cont(pushlex("form"), forspec, statement, poplex);
      if (type == "class" || (isTS && value == "interface")) {
        cx.marked = "keyword";
        return cont(pushlex("form"), className, poplex);
      }
      if (type == "variable") {
        if (isTS && value == "declare") {
          cx.marked = "keyword"
          return cont(statement)
        } else if (isTS && (value == "module" || value == "enum" || value == "type") && cx.stream.match(/^\s*\w/, false)) {
          cx.marked = "keyword"
          if (value == "enum") return cont(enumdef);
          else if (value == "type") return cont(typeexpr, expect("operator"), typeexpr, expect(";"));
          else return cont(pushlex("form"), pattern, expect("{"), pushlex("}"), block, poplex, poplex)
        } else if (isTS && value == "namespace") {
          cx.marked = "keyword"
          return cont(pushlex("form"), expression, block, poplex)
        } else if (isTS && value == "abstract") {
          cx.marked = "keyword"
          return cont(statement)
        } else {
          return cont(pushlex("stat"), maybelabel);
        }
      }
      if (type == "switch") return cont(pushlex("form"), parenExpr, expect("{"), pushlex("}", "switch"), pushblockcontext,
        block, poplex, poplex, popcontext);
      if (type == "case") return cont(expression, expect(":"));
      if (type == "default") return cont(expect(":"));
      if (type == "catch") return cont(pushlex("form"), pushcontext, maybeCatchBinding, statement, poplex, popcontext);
      if (type == "export") return cont(pushlex("stat"), afterExport, poplex);
      if (type == "import") return cont(pushlex("stat"), afterImport, poplex);
      if (type == "async") return cont(statement)
      if (value == "@") return cont(expression, statement)
      return pass(pushlex("stat"), expression, expect(";"), poplex);
    }

    function maybeCatchBinding(type) {
      if (type == "(") return cont(funarg, expect(")"))
    }

    function expression(type, value) {
      return expressionInner(type, value, false);
    }

    function expressionNoComma(type, value) {
      return expressionInner(type, value, true);
    }

    function parenExpr(type) {
      if (type != "(") return pass()
      return cont(pushlex(")"), expression, expect(")"), poplex)
    }

    function expressionInner(type, value, noComma) {
      if (cx.state.fatArrowAt == cx.stream.start) {
        var body = noComma ? arrowBodyNoComma : arrowBody;
        if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, expect("=>"), body, popcontext);
        else if (type == "variable") return pass(pushcontext, pattern, expect("=>"), body, popcontext);
      }
      var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
      if (atomicTypes.hasOwnProperty(type)) return cont(maybeop);
      if (type == "function") return cont(functiondef, maybeop);
      if (type == "class" || (isTS && value == "interface")) {
        cx.marked = "keyword";
        return cont(pushlex("form"), classExpression, poplex);
      }
      if (type == "keyword c" || type == "async") return cont(noComma ? expressionNoComma : expression);
      if (type == "(") return cont(pushlex(")"), maybeexpression, expect(")"), poplex, maybeop);
      if (type == "operator" || type == "spread") return cont(noComma ? expressionNoComma : expression);
      if (type == "[") return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
      if (type == "{") return contCommasep(objprop, "}", null, maybeop);
      if (type == "quasi") return pass(quasi, maybeop);
      if (type == "new") return cont(maybeTarget(noComma));
      if (type == "import") return cont(expression);
      return cont();
    }

    function maybeexpression(type) {
      if (type.match(/[;\}\)\],]/)) return pass();
      return pass(expression);
    }

    function maybeoperatorComma(type, value) {
      if (type == ",") return cont(expression);
      return maybeoperatorNoComma(type, value, false);
    }

    function maybeoperatorNoComma(type, value, noComma) {
      var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
      var expr = noComma == false ? expression : expressionNoComma;
      if (type == "=>") return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);
      if (type == "operator") {
        if (/\+\+|--/.test(value) || isTS && value == "!") return cont(me);
        if (isTS && value == "<" && cx.stream.match(/^([^>]|<.*?>)*>\s*\(/, false))
          return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, me);
        if (value == "?") return cont(expression, expect(":"), expr);
        return cont(expr);
      }
      if (type == "quasi") {
        return pass(quasi, me);
      }
      if (type == ";") return;
      if (type == "(") return contCommasep(expressionNoComma, ")", "call", me);
      if (type == ".") return cont(property, me);
      if (type == "[") return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
      if (isTS && value == "as") {
        cx.marked = "keyword";
        return cont(typeexpr, me)
      }
      if (type == "regexp") {
        cx.state.lastType = cx.marked = "operator"
        cx.stream.backUp(cx.stream.pos - cx.stream.start - 1)
        return cont(expr)
      }
    }

    function quasi(type, value) {
      if (type != "quasi") return pass();
      if (value.slice(value.length - 2) != "${") return cont(quasi);
      return cont(expression, continueQuasi);
    }

    function continueQuasi(type) {
      if (type == "}") {
        cx.marked = "string-2";
        cx.state.tokenize = tokenQuasi;
        return cont(quasi);
      }
    }

    function arrowBody(type) {
      findFatArrow(cx.stream, cx.state);
      return pass(type == "{" ? statement : expression);
    }

    function arrowBodyNoComma(type) {
      findFatArrow(cx.stream, cx.state);
      return pass(type == "{" ? statement : expressionNoComma);
    }

    function maybeTarget(noComma) {
      return function(type) {
        if (type == ".") return cont(noComma ? targetNoComma : target);
        else if (type == "variable" && isTS) return cont(maybeTypeArgs, noComma ? maybeoperatorNoComma : maybeoperatorComma)
        else return pass(noComma ? expressionNoComma : expression);
      };
    }

    function target(_, value) {
      if (value == "target") {
        cx.marked = "keyword";
        return cont(maybeoperatorComma);
      }
    }

    function targetNoComma(_, value) {
      if (value == "target") {
        cx.marked = "keyword";
        return cont(maybeoperatorNoComma);
      }
    }

    function maybelabel(type) {
      if (type == ":") return cont(poplex, statement);
      return pass(maybeoperatorComma, expect(";"), poplex);
    }

    function property(type) {
      if (type == "variable") {
        cx.marked = "property";
        return cont();
      }
    }

    function objprop(type, value) {
      if (type == "async") {
        cx.marked = "property";
        return cont(objprop);
      } else if (type == "variable" || cx.style == "keyword") {
        cx.marked = "property";
        if (value == "get" || value == "set") return cont(getterSetter);
        var m
        if (isTS && cx.state.fatArrowAt == cx.stream.start && (m = cx.stream.match(/^\s*:\s*/, false)))
          cx.state.fatArrowAt = cx.stream.pos + m[0].length
        return cont(afterprop);
      } else if (type == "number" || type == "string") {
        cx.marked = jsonldMode ? "property" : (cx.style + " property");
        return cont(afterprop);
      } else if (type == "jsonld-keyword") {
        return cont(afterprop);
      } else if (isTS && isModifier(value)) {
        cx.marked = "keyword"
        return cont(objprop)
      } else if (type == "[") {
        return cont(expression, maybetype, expect("]"), afterprop);
      } else if (type == "spread") {
        return cont(expressionNoComma, afterprop);
      } else if (value == "*") {
        cx.marked = "keyword";
        return cont(objprop);
      } else if (type == ":") {
        return pass(afterprop)
      }
    }

    function getterSetter(type) {
      if (type != "variable") return pass(afterprop);
      cx.marked = "property";
      return cont(functiondef);
    }

    function afterprop(type) {
      if (type == ":") return cont(expressionNoComma);
      if (type == "(") return pass(functiondef);
    }

    function commasep(what, end, sep) {
      function proceed(type, value) {
        if (sep ? sep.indexOf(type) > -1 : type == ",") {
          var lex = cx.state.lexical;
          if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
          return cont(function(type, value) {
            if (type == end || value == end) return pass()
            return pass(what)
          }, proceed);
        }
        if (type == end || value == end) return cont();
        return cont(expect(end));
      }
      return function(type, value) {
        if (type == end || value == end) return cont();
        return pass(what, proceed);
      };
    }

    function contCommasep(what, end, info) {
      for (var i = 3; i < arguments.length; i++)
        cx.cc.push(arguments[i]);
      return cont(pushlex(end, info), commasep(what, end), poplex);
    }

    function block(type) {
      if (type == "}") return cont();
      return pass(statement, block);
    }

    function maybetype(type, value) {
      if (isTS) {
        if (type == ":") return cont(typeexpr);
        if (value == "?") return cont(maybetype);
      }
    }

    function mayberettype(type) {
      if (isTS && type == ":") {
        if (cx.stream.match(/^\s*\w+\s+is\b/, false)) return cont(expression, isKW, typeexpr)
        else return cont(typeexpr)
      }
    }

    function isKW(_, value) {
      if (value == "is") {
        cx.marked = "keyword"
        return cont()
      }
    }

    function typeexpr(type, value) {
      if (value == "keyof" || value == "typeof") {
        cx.marked = "keyword"
        return cont(value == "keyof" ? typeexpr : expressionNoComma)
      }
      if (type == "variable" || value == "void") {
        cx.marked = "type"
        return cont(afterType)
      }
      if (type == "string" || type == "number" || type == "atom") return cont(afterType);
      if (type == "[") return cont(pushlex("]"), commasep(typeexpr, "]", ","), poplex, afterType)
      if (type == "{") return cont(pushlex("}"), commasep(typeprop, "}", ",;"), poplex, afterType)
      if (type == "(") return cont(commasep(typearg, ")"), maybeReturnType)
      if (type == "<") return cont(commasep(typeexpr, ">"), typeexpr)
    }

    function maybeReturnType(type) {
      if (type == "=>") return cont(typeexpr)
    }

    function typeprop(type, value) {
      if (type == "variable" || cx.style == "keyword") {
        cx.marked = "property"
        return cont(typeprop)
      } else if (value == "?") {
        return cont(typeprop)
      } else if (type == ":") {
        return cont(typeexpr)
      } else if (type == "[") {
        return cont(expression, maybetype, expect("]"), typeprop)
      }
    }

    function typearg(type, value) {
      if (type == "variable" && cx.stream.match(/^\s*[?:]/, false) || value == "?") return cont(typearg)
      if (type == ":") return cont(typeexpr)
      return pass(typeexpr)
    }

    function afterType(type, value) {
      if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
      if (value == "|" || type == "." || value == "&") return cont(typeexpr)
      if (type == "[") return cont(expect("]"), afterType)
      if (value == "extends" || value == "implements") {
        cx.marked = "keyword";
        return cont(typeexpr)
      }
    }

    function maybeTypeArgs(_, value) {
      if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
    }

    function typeparam() {
      return pass(typeexpr, maybeTypeDefault)
    }

    function maybeTypeDefault(_, value) {
      if (value == "=") return cont(typeexpr)
    }

    function vardef(_, value) {
      if (value == "enum") {
        cx.marked = "keyword";
        return cont(enumdef)
      }
      return pass(pattern, maybetype, maybeAssign, vardefCont);
    }

    function pattern(type, value) {
      if (isTS && isModifier(value)) {
        cx.marked = "keyword";
        return cont(pattern)
      }
      if (type == "variable") {
        register(value);
        return cont();
      }
      if (type == "spread") return cont(pattern);
      if (type == "[") return contCommasep(pattern, "]");
      if (type == "{") return contCommasep(proppattern, "}");
    }

    function proppattern(type, value) {
      if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
        register(value);
        return cont(maybeAssign);
      }
      if (type == "variable") cx.marked = "property";
      if (type == "spread") return cont(pattern);
      if (type == "}") return pass();
      return cont(expect(":"), pattern, maybeAssign);
    }

    function maybeAssign(_type, value) {
      if (value == "=") return cont(expressionNoComma);
    }

    function vardefCont(type) {
      if (type == ",") return cont(vardef);
    }

    function maybeelse(type, value) {
      if (type == "keyword b" && value == "else") return cont(pushlex("form", "else"), statement, poplex);
    }

    function forspec(type, value) {
      if (value == "await") return cont(forspec);
      if (type == "(") return cont(pushlex(")"), forspec1, expect(")"), poplex);
    }

    function forspec1(type) {
      if (type == "var") return cont(vardef, expect(";"), forspec2);
      if (type == ";") return cont(forspec2);
      if (type == "variable") return cont(formaybeinof);
      return pass(expression, expect(";"), forspec2);
    }

    function formaybeinof(_type, value) {
      if (value == "in" || value == "of") {
        cx.marked = "keyword";
        return cont(expression);
      }
      return cont(maybeoperatorComma, forspec2);
    }

    function forspec2(type, value) {
      if (type == ";") return cont(forspec3);
      if (value == "in" || value == "of") {
        cx.marked = "keyword";
        return cont(expression);
      }
      return pass(expression, expect(";"), forspec3);
    }

    function forspec3(type) {
      if (type != ")") cont(expression);
    }

    function functiondef(type, value) {
      if (value == "*") {
        cx.marked = "keyword";
        return cont(functiondef);
      }
      if (type == "variable") {
        register(value);
        return cont(functiondef);
      }
      if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, statement, popcontext);
      if (isTS && value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondef)
    }

    function funarg(type, value) {
      if (value == "@") cont(expression, funarg)
      if (type == "spread") return cont(funarg);
      if (isTS && isModifier(value)) {
        cx.marked = "keyword";
        return cont(funarg);
      }
      return pass(pattern, maybetype, maybeAssign);
    }

    function classExpression(type, value) {
      if (type == "variable") return className(type, value);
      return classNameAfter(type, value);
    }

    function className(type, value) {
      if (type == "variable") {
        register(value);
        return cont(classNameAfter);
      }
    }

    function classNameAfter(type, value) {
      if (value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, classNameAfter)
      if (value == "extends" || value == "implements" || (isTS && type == ",")) {
        if (value == "implements") cx.marked = "keyword";
        return cont(isTS ? typeexpr : expression, classNameAfter);
      }
      if (type == "{") return cont(pushlex("}"), classBody, poplex);
    }

    function classBody(type, value) {
      if (type == "async" ||
        (type == "variable" &&
          (value == "static" || value == "get" || value == "set" || (isTS && isModifier(value))) &&
          cx.stream.match(/^\s+[\w$\xa1-\uffff]/, false))) {
        cx.marked = "keyword";
        return cont(classBody);
      }
      if (type == "variable" || cx.style == "keyword") {
        cx.marked = "property";
        return cont(isTS ? classfield : functiondef, classBody);
      }
      if (type == "[")
        return cont(expression, maybetype, expect("]"), isTS ? classfield : functiondef, classBody)
      if (value == "*") {
        cx.marked = "keyword";
        return cont(classBody);
      }
      if (type == ";") return cont(classBody);
      if (type == "}") return cont();
      if (value == "@") return cont(expression, classBody)
    }

    function classfield(type, value) {
      if (value == "?") return cont(classfield)
      if (type == ":") return cont(typeexpr, maybeAssign)
      if (value == "=") return cont(expressionNoComma)
      return pass(functiondef)
    }

    function afterExport(type, value) {
      if (value == "*") {
        cx.marked = "keyword";
        return cont(maybeFrom, expect(";"));
      }
      if (value == "default") {
        cx.marked = "keyword";
        return cont(expression, expect(";"));
      }
      if (type == "{") return cont(commasep(exportField, "}"), maybeFrom, expect(";"));
      return pass(statement);
    }

    function exportField(type, value) {
      if (value == "as") {
        cx.marked = "keyword";
        return cont(expect("variable"));
      }
      if (type == "variable") return pass(expressionNoComma, exportField);
    }

    function afterImport(type) {
      if (type == "string") return cont();
      if (type == "(") return pass(expression);
      return pass(importSpec, maybeMoreImports, maybeFrom);
    }

    function importSpec(type, value) {
      if (type == "{") return contCommasep(importSpec, "}");
      if (type == "variable") register(value);
      if (value == "*") cx.marked = "keyword";
      return cont(maybeAs);
    }

    function maybeMoreImports(type) {
      if (type == ",") return cont(importSpec, maybeMoreImports)
    }

    function maybeAs(_type, value) {
      if (value == "as") {
        cx.marked = "keyword";
        return cont(importSpec);
      }
    }

    function maybeFrom(_type, value) {
      if (value == "from") {
        cx.marked = "keyword";
        return cont(expression);
      }
    }

    function arrayLiteral(type) {
      if (type == "]") return cont();
      return pass(commasep(expressionNoComma, "]"));
    }

    function enumdef() {
      return pass(pushlex("form"), pattern, expect("{"), pushlex("}"), commasep(enummember, "}"), poplex, poplex)
    }

    function enummember() {
      return pass(pattern, maybeAssign);
    }

    function isContinuedStatement(state, textAfter) {
      return state.lastType == "operator" || state.lastType == "," ||
        isOperatorChar.test(textAfter.charAt(0)) ||
        /[,.]/.test(textAfter.charAt(0));
    }

    function expressionAllowed(stream, state, backUp) {
      return state.tokenize == tokenBase &&
        /^(?:operator|sof|keyword [bcd]|case|new|export|default|spread|[\[{}\(,;:]|=>)$/.test(state.lastType) ||
        (state.lastType == "quasi" && /\{\s*$/.test(stream.string.slice(0, stream.pos - (backUp || 0))))
    }
    return {
      startState: function(basecolumn) {
        var state = {
          tokenize: tokenBase,
          lastType: "sof",
          cc: [],
          lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
          localVars: parserConfig.localVars,
          context: parserConfig.localVars && new Context(null, null, false),
          indented: basecolumn || 0
        };
        if (parserConfig.globalVars && typeof parserConfig.globalVars == "object")
          state.globalVars = parserConfig.globalVars;
        return state;
      },
      token: function(stream, state) {
        if (stream.sol()) {
          if (!state.lexical.hasOwnProperty("align"))
            state.lexical.align = false;
          state.indented = stream.indentation();
          findFatArrow(stream, state);
        }
        if (state.tokenize != tokenComment && stream.eatSpace()) return null;
        var style = state.tokenize(stream, state);
        if (type == "comment") return style;
        state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
        return parseJS(state, style, type, content, stream);
      },
      indent: function(state, textAfter) {
        if (state.tokenize == tokenComment) return CodeMirror.Pass;
        if (state.tokenize != tokenBase) return 0;
        var firstChar = textAfter && textAfter.charAt(0),
          lexical = state.lexical,
          top
        if (!/^\s*else\b/.test(textAfter))
          for (var i = state.cc.length - 1; i >= 0; --i) {
            var c = state.cc[i];
            if (c == poplex) lexical = lexical.prev;
            else if (c != maybeelse) break;
          }
        while ((lexical.type == "stat" || lexical.type == "form") &&
          (firstChar == "}" || ((top = state.cc[state.cc.length - 1]) &&
            (top == maybeoperatorComma || top == maybeoperatorNoComma) &&
            !/^[,\.=+\-*:?[\(]/.test(textAfter))))
          lexical = lexical.prev;
        if (statementIndent && lexical.type == ")" && lexical.prev.type == "stat")
          lexical = lexical.prev;
        var type = lexical.type,
          closing = firstChar == type;
        if (type == "vardef") return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? lexical.info.length + 1 : 0);
        else if (type == "form" && firstChar == "{") return lexical.indented;
        else if (type == "form") return lexical.indented + indentUnit;
        else if (type == "stat")
          return lexical.indented + (isContinuedStatement(state, textAfter) ? statementIndent || indentUnit : 0);
        else if (lexical.info == "switch" && !closing && parserConfig.doubleIndentSwitch != false)
          return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
        else if (lexical.align) return lexical.column + (closing ? 0 : 1);
        else return lexical.indented + (closing ? 0 : indentUnit);
      },
      electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
      blockCommentStart: jsonMode ? null : "/*",
      blockCommentEnd: jsonMode ? null : "*/",
      blockCommentContinue: jsonMode ? null : " * ",
      lineComment: jsonMode ? null : "//",
      fold: "brace",
      closeBrackets: "()[]{}''\"\"``",
      helperType: jsonMode ? "json" : "javascript",
      jsonldMode: jsonldMode,
      jsonMode: jsonMode,
      expressionAllowed: expressionAllowed,
      skipExpression: function(state) {
        var top = state.cc[state.cc.length - 1]
        if (top == expression || top == expressionNoComma) state.cc.pop()
      }
    };
  });
  CodeMirror.registerHelper("wordChars", "javascript", /[\w$]/);
  CodeMirror.defineMIME("text/javascript", "javascript");
  CodeMirror.defineMIME("text/ecmascript", "javascript");
  CodeMirror.defineMIME("application/javascript", "javascript");
  CodeMirror.defineMIME("application/x-javascript", "javascript");
  CodeMirror.defineMIME("application/ecmascript", "javascript");
  CodeMirror.defineMIME("application/json", {
    name: "javascript",
    json: true
  });
  CodeMirror.defineMIME("application/x-json", {
    name: "javascript",
    json: true
  });
  CodeMirror.defineMIME("application/ld+json", {
    name: "javascript",
    jsonld: true
  });
  CodeMirror.defineMIME("text/typescript", {
    name: "javascript",
    typescript: true
  });
  CodeMirror.defineMIME("application/typescript", {
    name: "javascript",
    typescript: true
  });
});;
/*! RESOURCE: /scripts/snc-code-editor/codemirror/mode/properties/properties.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  CodeMirror.defineMode("properties", function() {
    return {
      token: function(stream, state) {
        var sol = stream.sol() || state.afterSection;
        var eol = stream.eol();
        state.afterSection = false;
        if (sol) {
          if (state.nextMultiline) {
            state.inMultiline = true;
            state.nextMultiline = false;
          } else {
            state.position = "def";
          }
        }
        if (eol && !state.nextMultiline) {
          state.inMultiline = false;
          state.position = "def";
        }
        if (sol) {
          while (stream.eatSpace()) {}
        }
        var ch = stream.next();
        if (sol && (ch === "#" || ch === "!" || ch === ";")) {
          state.position = "comment";
          stream.skipToEnd();
          return "comment";
        } else if (sol && ch === "[") {
          state.afterSection = true;
          stream.skipTo("]");
          stream.eat("]");
          return "header";
        } else if (ch === "=" || ch === ":") {
          state.position = "quote";
          return null;
        } else if (ch === "\\" && state.position === "quote") {
          if (stream.eol()) {
            state.nextMultiline = true;
          }
        }
        return state.position;
      },
      startState: function() {
        return {
          position: "def",
          nextMultiline: false,
          inMultiline: false,
          afterSection: false
        };
      }
    };
  });
  CodeMirror.defineMIME("text/x-properties", "properties");
  CodeMirror.defineMIME("text/x-ini", "properties");
});;
/*! RESOURCE: /scripts/codemirror_tern/js_includes_codemirror.js */
/*! RESOURCE: /scripts/codemirror_tern/acorn.js */
(function(f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f()
  } else if (typeof define === "function" && define.amd) {
    define([], f)
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window
    } else if (typeof global !== "undefined") {
      g = global
    } else if (typeof self !== "undefined") {
      g = self
    } else {
      g = this
    }
    g.acorn = f()
  }
})(function() {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f
        }
        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e)
        }, l, l.exports, e, t, n, r)
      }
      return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
  })({
    1: [function(_dereq_, module, exports) {
      "use strict";
      exports.parse = parse;
      exports.parseExpressionAt = parseExpressionAt;
      exports.tokenizer = tokenizer;
      exports.__esModule = true;
      var _state = _dereq_("./state");
      var Parser = _state.Parser;
      var _options = _dereq_("./options");
      var getOptions = _options.getOptions;
      _dereq_("./parseutil");
      _dereq_("./statement");
      _dereq_("./lval");
      _dereq_("./expression");
      exports.Parser = _state.Parser;
      exports.plugins = _state.plugins;
      exports.defaultOptions = _options.defaultOptions;
      var _location = _dereq_("./location");
      exports.SourceLocation = _location.SourceLocation;
      exports.getLineInfo = _location.getLineInfo;
      exports.Node = _dereq_("./node").Node;
      var _tokentype = _dereq_("./tokentype");
      exports.TokenType = _tokentype.TokenType;
      exports.tokTypes = _tokentype.types;
      var _tokencontext = _dereq_("./tokencontext");
      exports.TokContext = _tokencontext.TokContext;
      exports.tokContexts = _tokencontext.types;
      var _identifier = _dereq_("./identifier");
      exports.isIdentifierChar = _identifier.isIdentifierChar;
      exports.isIdentifierStart = _identifier.isIdentifierStart;
      exports.Token = _dereq_("./tokenize").Token;
      var _whitespace = _dereq_("./whitespace");
      exports.isNewLine = _whitespace.isNewLine;
      exports.lineBreak = _whitespace.lineBreak;
      exports.lineBreakG = _whitespace.lineBreakG;
      var version = "1.1.0";
      exports.version = version;

      function parse(input, options) {
        var p = parser(options, input);
        var startPos = p.pos,
          startLoc = p.options.locations && p.curPosition();
        p.nextToken();
        return p.parseTopLevel(p.options.program || p.startNodeAt(startPos, startLoc));
      }

      function parseExpressionAt(input, pos, options) {
        var p = parser(options, input, pos);
        p.nextToken();
        return p.parseExpression();
      }

      function tokenizer(input, options) {
        return parser(options, input);
      }

      function parser(options, input) {
        return new Parser(getOptions(options), String(input));
      }
    }, {
      "./expression": 2,
      "./identifier": 3,
      "./location": 4,
      "./lval": 5,
      "./node": 6,
      "./options": 7,
      "./parseutil": 8,
      "./state": 9,
      "./statement": 10,
      "./tokencontext": 11,
      "./tokenize": 12,
      "./tokentype": 13,
      "./whitespace": 15
    }],
    2: [function(_dereq_, module, exports) {
      "use strict";
      var tt = _dereq_("./tokentype").types;
      var Parser = _dereq_("./state").Parser;
      var reservedWords = _dereq_("./identifier").reservedWords;
      var has = _dereq_("./util").has;
      var pp = Parser.prototype;
      pp.checkPropClash = function(prop, propHash) {
        if (this.options.ecmaVersion >= 6) return;
        var key = prop.key,
          name = undefined;
        switch (key.type) {
          case "Identifier":
            name = key.name;
            break;
          case "Literal":
            name = String(key.value);
            break;
          default:
            return;
        }
        var kind = prop.kind || "init",
          other = undefined;
        if (has(propHash, name)) {
          other = propHash[name];
          var isGetSet = kind !== "init";
          if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init)) this.raise(key.start, "Redefinition of property");
        } else {
          other = propHash[name] = {
            init: false,
            get: false,
            set: false
          };
        }
        other[kind] = true;
      };
      pp.parseExpression = function(noIn, refShorthandDefaultPos) {
        var startPos = this.start,
          startLoc = this.startLoc;
        var expr = this.parseMaybeAssign(noIn, refShorthandDefaultPos);
        if (this.type === tt.comma) {
          var node = this.startNodeAt(startPos, startLoc);
          node.expressions = [expr];
          while (this.eat(tt.comma)) node.expressions.push(this.parseMaybeAssign(noIn, refShorthandDefaultPos));
          return this.finishNode(node, "SequenceExpression");
        }
        return expr;
      };
      pp.parseMaybeAssign = function(noIn, refShorthandDefaultPos, afterLeftParse) {
        if (this.type == tt._yield && this.inGenerator) return this.parseYield();
        var failOnShorthandAssign = undefined;
        if (!refShorthandDefaultPos) {
          refShorthandDefaultPos = {
            start: 0
          };
          failOnShorthandAssign = true;
        } else {
          failOnShorthandAssign = false;
        }
        var startPos = this.start,
          startLoc = this.startLoc;
        if (this.type == tt.parenL || this.type == tt.name) this.potentialArrowAt = this.start;
        var left = this.parseMaybeConditional(noIn, refShorthandDefaultPos);
        if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);
        if (this.type.isAssign) {
          var node = this.startNodeAt(startPos, startLoc);
          node.operator = this.value;
          node.left = this.type === tt.eq ? this.toAssignable(left) : left;
          refShorthandDefaultPos.start = 0;
          this.checkLVal(left);
          this.next();
          node.right = this.parseMaybeAssign(noIn);
          return this.finishNode(node, "AssignmentExpression");
        } else if (failOnShorthandAssign && refShorthandDefaultPos.start) {
          this.unexpected(refShorthandDefaultPos.start);
        }
        return left;
      };
      pp.parseMaybeConditional = function(noIn, refShorthandDefaultPos) {
        var startPos = this.start,
          startLoc = this.startLoc;
        var expr = this.parseExprOps(noIn, refShorthandDefaultPos);
        if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
        if (this.eat(tt.question)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.test = expr;
          node.consequent = this.parseMaybeAssign();
          this.expect(tt.colon);
          node.alternate = this.parseMaybeAssign(noIn);
          return this.finishNode(node, "ConditionalExpression");
        }
        return expr;
      };
      pp.parseExprOps = function(noIn, refShorthandDefaultPos) {
        var startPos = this.start,
          startLoc = this.startLoc;
        var expr = this.parseMaybeUnary(refShorthandDefaultPos);
        if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
        return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
      };
      pp.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
        var prec = this.type.binop;
        if (prec != null && (!noIn || this.type !== tt._in)) {
          if (prec > minPrec) {
            var node = this.startNodeAt(leftStartPos, leftStartLoc);
            node.left = left;
            node.operator = this.value;
            var op = this.type;
            this.next();
            var startPos = this.start,
              startLoc = this.startLoc;
            node.right = this.parseExprOp(this.parseMaybeUnary(), startPos, startLoc, prec, noIn);
            this.finishNode(node, op === tt.logicalOR || op === tt.logicalAND ? "LogicalExpression" : "BinaryExpression");
            return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
          }
        }
        return left;
      };
      pp.parseMaybeUnary = function(refShorthandDefaultPos) {
        if (this.type.prefix) {
          var node = this.startNode(),
            update = this.type === tt.incDec;
          node.operator = this.value;
          node.prefix = true;
          this.next();
          node.argument = this.parseMaybeUnary();
          if (refShorthandDefaultPos && refShorthandDefaultPos.start) this.unexpected(refShorthandDefaultPos.start);
          if (update) this.checkLVal(node.argument);
          else if (this.strict && node.operator === "delete" && node.argument.type === "Identifier") this.raise(node.start, "Deleting local variable in strict mode");
          return this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
        }
        var startPos = this.start,
          startLoc = this.startLoc;
        var expr = this.parseExprSubscripts(refShorthandDefaultPos);
        if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
        while (this.type.postfix && !this.canInsertSemicolon()) {
          var node = this.startNodeAt(startPos, startLoc);
          node.operator = this.value;
          node.prefix = false;
          node.argument = expr;
          this.checkLVal(expr);
          this.next();
          expr = this.finishNode(node, "UpdateExpression");
        }
        return expr;
      };
      pp.parseExprSubscripts = function(refShorthandDefaultPos) {
        var startPos = this.start,
          startLoc = this.startLoc;
        var expr = this.parseExprAtom(refShorthandDefaultPos);
        if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
        return this.parseSubscripts(expr, startPos, startLoc);
      };
      pp.parseSubscripts = function(base, startPos, startLoc, noCalls) {
        for (;;) {
          if (this.eat(tt.dot)) {
            var node = this.startNodeAt(startPos, startLoc);
            node.object = base;
            node.property = this.parseIdent(true);
            node.computed = false;
            base = this.finishNode(node, "MemberExpression");
          } else if (this.eat(tt.bracketL)) {
            var node = this.startNodeAt(startPos, startLoc);
            node.object = base;
            node.property = this.parseExpression();
            node.computed = true;
            this.expect(tt.bracketR);
            base = this.finishNode(node, "MemberExpression");
          } else if (!noCalls && this.eat(tt.parenL)) {
            var node = this.startNodeAt(startPos, startLoc);
            node.callee = base;
            node.arguments = this.parseExprList(tt.parenR, false);
            base = this.finishNode(node, "CallExpression");
          } else if (this.type === tt.backQuote) {
            var node = this.startNodeAt(startPos, startLoc);
            node.tag = base;
            node.quasi = this.parseTemplate();
            base = this.finishNode(node, "TaggedTemplateExpression");
          } else {
            return base;
          }
        }
      };
      pp.parseExprAtom = function(refShorthandDefaultPos) {
        var node = undefined,
          canBeArrow = this.potentialArrowAt == this.start;
        switch (this.type) {
          case tt._this:
          case tt._super:
            var type = this.type === tt._this ? "ThisExpression" : "Super";
            node = this.startNode();
            this.next();
            return this.finishNode(node, type);
          case tt._yield:
            if (this.inGenerator) this.unexpected();
          case tt.name:
            var startPos = this.start,
              startLoc = this.startLoc;
            var id = this.parseIdent(this.type !== tt.name);
            if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id]);
            return id;
          case tt.regexp:
            var value = this.value;
            node = this.parseLiteral(value.value);
            node.regex = {
              pattern: value.pattern,
              flags: value.flags
            };
            return node;
          case tt.num:
          case tt.string:
            return this.parseLiteral(this.value);
          case tt._null:
          case tt._true:
          case tt._false:
            node = this.startNode();
            node.value = this.type === tt._null ? null : this.type === tt._true;
            node.raw = this.type.keyword;
            this.next();
            return this.finishNode(node, "Literal");
          case tt.parenL:
            return this.parseParenAndDistinguishExpression(canBeArrow);
          case tt.bracketL:
            node = this.startNode();
            this.next();
            if (this.options.ecmaVersion >= 7 && this.type === tt._for) {
              return this.parseComprehension(node, false);
            }
            node.elements = this.parseExprList(tt.bracketR, true, true, refShorthandDefaultPos);
            return this.finishNode(node, "ArrayExpression");
          case tt.braceL:
            return this.parseObj(false, refShorthandDefaultPos);
          case tt._function:
            node = this.startNode();
            this.next();
            return this.parseFunction(node, false);
          case tt._class:
            return this.parseClass(this.startNode(), false);
          case tt._new:
            return this.parseNew();
          case tt.backQuote:
            return this.parseTemplate();
          default:
            this.unexpected();
        }
      };
      pp.parseLiteral = function(value) {
        var node = this.startNode();
        node.value = value;
        node.raw = this.input.slice(this.start, this.end);
        this.next();
        return this.finishNode(node, "Literal");
      };
      pp.parseParenExpression = function() {
        this.expect(tt.parenL);
        var val = this.parseExpression();
        this.expect(tt.parenR);
        return val;
      };
      pp.parseParenAndDistinguishExpression = function(canBeArrow) {
        var startPos = this.start,
          startLoc = this.startLoc,
          val = undefined;
        if (this.options.ecmaVersion >= 6) {
          this.next();
          if (this.options.ecmaVersion >= 7 && this.type === tt._for) {
            return this.parseComprehension(this.startNodeAt(startPos, startLoc), true);
          }
          var innerStartPos = this.start,
            innerStartLoc = this.startLoc;
          var exprList = [],
            first = true;
          var refShorthandDefaultPos = {
              start: 0
            },
            spreadStart = undefined,
            innerParenStart = undefined;
          while (this.type !== tt.parenR) {
            first ? first = false : this.expect(tt.comma);
            if (this.type === tt.ellipsis) {
              spreadStart = this.start;
              exprList.push(this.parseParenItem(this.parseRest()));
              break;
            } else {
              if (this.type === tt.parenL && !innerParenStart) {
                innerParenStart = this.start;
              }
              exprList.push(this.parseMaybeAssign(false, refShorthandDefaultPos, this.parseParenItem));
            }
          }
          var innerEndPos = this.start,
            innerEndLoc = this.startLoc;
          this.expect(tt.parenR);
          if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
            if (innerParenStart) this.unexpected(innerParenStart);
            return this.parseParenArrowList(startPos, startLoc, exprList);
          }
          if (!exprList.length) this.unexpected(this.lastTokStart);
          if (spreadStart) this.unexpected(spreadStart);
          if (refShorthandDefaultPos.start) this.unexpected(refShorthandDefaultPos.start);
          if (exprList.length > 1) {
            val = this.startNodeAt(innerStartPos, innerStartLoc);
            val.expressions = exprList;
            this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
          } else {
            val = exprList[0];
          }
        } else {
          val = this.parseParenExpression();
        }
        if (this.options.preserveParens) {
          var par = this.startNodeAt(startPos, startLoc);
          par.expression = val;
          return this.finishNode(par, "ParenthesizedExpression");
        } else {
          return val;
        }
      };
      pp.parseParenItem = function(item) {
        return item;
      };
      pp.parseParenArrowList = function(startPos, startLoc, exprList) {
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
      };
      var empty = [];
      pp.parseNew = function() {
        var node = this.startNode();
        var meta = this.parseIdent(true);
        if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
          node.meta = meta;
          node.property = this.parseIdent(true);
          if (node.property.name !== "target") this.raise(node.property.start, "The only valid meta property for new is new.target");
          return this.finishNode(node, "MetaProperty");
        }
        var startPos = this.start,
          startLoc = this.startLoc;
        node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
        if (this.eat(tt.parenL)) node.arguments = this.parseExprList(tt.parenR, false);
        else node.arguments = empty;
        return this.finishNode(node, "NewExpression");
      };
      pp.parseTemplateElement = function() {
        var elem = this.startNode();
        elem.value = {
          raw: this.input.slice(this.start, this.end),
          cooked: this.value
        };
        this.next();
        elem.tail = this.type === tt.backQuote;
        return this.finishNode(elem, "TemplateElement");
      };
      pp.parseTemplate = function() {
        var node = this.startNode();
        this.next();
        node.expressions = [];
        var curElt = this.parseTemplateElement();
        node.quasis = [curElt];
        while (!curElt.tail) {
          this.expect(tt.dollarBraceL);
          node.expressions.push(this.parseExpression());
          this.expect(tt.braceR);
          node.quasis.push(curElt = this.parseTemplateElement());
        }
        this.next();
        return this.finishNode(node, "TemplateLiteral");
      };
      pp.parseObj = function(isPattern, refShorthandDefaultPos) {
        var node = this.startNode(),
          first = true,
          propHash = {};
        node.properties = [];
        this.next();
        while (!this.eat(tt.braceR)) {
          if (!first) {
            this.expect(tt.comma);
            if (this.afterTrailingComma(tt.braceR)) break;
          } else first = false;
          var prop = this.startNode(),
            isGenerator = undefined,
            startPos = undefined,
            startLoc = undefined;
          if (this.options.ecmaVersion >= 6) {
            prop.method = false;
            prop.shorthand = false;
            if (isPattern || refShorthandDefaultPos) {
              startPos = this.start;
              startLoc = this.startLoc;
            }
            if (!isPattern) isGenerator = this.eat(tt.star);
          }
          this.parsePropertyName(prop);
          this.parsePropertyValue(prop, isPattern, isGenerator, startPos, startLoc, refShorthandDefaultPos);
          this.checkPropClash(prop, propHash);
          node.properties.push(this.finishNode(prop, "Property"));
        }
        return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
      };
      pp.parsePropertyValue = function(prop, isPattern, isGenerator, startPos, startLoc, refShorthandDefaultPos) {
        if (this.eat(tt.colon)) {
          prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refShorthandDefaultPos);
          prop.kind = "init";
        } else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
          if (isPattern) this.unexpected();
          prop.kind = "init";
          prop.method = true;
          prop.value = this.parseMethod(isGenerator);
        } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type != tt.comma && this.type != tt.braceR)) {
          if (isGenerator || isPattern) this.unexpected();
          prop.kind = prop.key.name;
          this.parsePropertyName(prop);
          prop.value = this.parseMethod(false);
        } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
          prop.kind = "init";
          if (isPattern) {
            if (this.isKeyword(prop.key.name) || this.strict && (reservedWords.strictBind(prop.key.name) || reservedWords.strict(prop.key.name)) || !this.options.allowReserved && this.isReservedWord(prop.key.name)) this.raise(prop.key.start, "Binding " + prop.key.name);
            prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
          } else if (this.type === tt.eq && refShorthandDefaultPos) {
            if (!refShorthandDefaultPos.start) refShorthandDefaultPos.start = this.start;
            prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
          } else {
            prop.value = prop.key;
          }
          prop.shorthand = true;
        } else this.unexpected();
      };
      pp.parsePropertyName = function(prop) {
        if (this.options.ecmaVersion >= 6) {
          if (this.eat(tt.bracketL)) {
            prop.computed = true;
            prop.key = this.parseMaybeAssign();
            this.expect(tt.bracketR);
            return;
          } else {
            prop.computed = false;
          }
        }
        prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(true);
      };
      pp.initFunction = function(node) {
        node.id = null;
        if (this.options.ecmaVersion >= 6) {
          node.generator = false;
          node.expression = false;
        }
      };
      pp.parseMethod = function(isGenerator) {
        var node = this.startNode();
        this.initFunction(node);
        this.expect(tt.parenL);
        node.params = this.parseBindingList(tt.parenR, false, false);
        var allowExpressionBody = undefined;
        if (this.options.ecmaVersion >= 6) {
          node.generator = isGenerator;
          allowExpressionBody = true;
        } else {
          allowExpressionBody = false;
        }
        this.parseFunctionBody(node, allowExpressionBody);
        return this.finishNode(node, "FunctionExpression");
      };
      pp.parseArrowExpression = function(node, params) {
        this.initFunction(node);
        node.params = this.toAssignableList(params, true);
        this.parseFunctionBody(node, true);
        return this.finishNode(node, "ArrowFunctionExpression");
      };
      pp.parseFunctionBody = function(node, allowExpression) {
        var isExpression = allowExpression && this.type !== tt.braceL;
        if (isExpression) {
          node.body = this.parseMaybeAssign();
          node.expression = true;
        } else {
          var oldInFunc = this.inFunction,
            oldInGen = this.inGenerator,
            oldLabels = this.labels;
          this.inFunction = true;
          this.inGenerator = node.generator;
          this.labels = [];
          node.body = this.parseBlock(true);
          node.expression = false;
          this.inFunction = oldInFunc;
          this.inGenerator = oldInGen;
          this.labels = oldLabels;
        }
        if (this.strict || !isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) {
          var nameHash = {},
            oldStrict = this.strict;
          this.strict = true;
          if (node.id) this.checkLVal(node.id, true);
          for (var i = 0; i < node.params.length; i++) {
            this.checkLVal(node.params[i], true, nameHash);
          }
          this.strict = oldStrict;
        }
      };
      pp.parseExprList = function(close, allowTrailingComma, allowEmpty, refShorthandDefaultPos) {
        var elts = [],
          first = true;
        while (!this.eat(close)) {
          if (!first) {
            this.expect(tt.comma);
            if (allowTrailingComma && this.afterTrailingComma(close)) break;
          } else first = false;
          if (allowEmpty && this.type === tt.comma) {
            elts.push(null);
          } else {
            if (this.type === tt.ellipsis) elts.push(this.parseSpread(refShorthandDefaultPos));
            else elts.push(this.parseMaybeAssign(false, refShorthandDefaultPos));
          }
        }
        return elts;
      };
      pp.parseIdent = function(liberal) {
        var node = this.startNode();
        if (liberal && this.options.allowReserved == "never") liberal = false;
        if (this.type === tt.name) {
          if (!liberal && (!this.options.allowReserved && this.isReservedWord(this.value) || this.strict && reservedWords.strict(this.value) && (this.options.ecmaVersion >= 6 || this.input.slice(this.start, this.end).indexOf("\\") == -1))) this.raise(this.start, "The keyword '" + this.value + "' is reserved");
          node.name = this.value;
        } else if (liberal && this.type.keyword) {
          node.name = this.type.keyword;
        } else {
          this.unexpected();
        }
        this.next();
        return this.finishNode(node, "Identifier");
      };
      pp.parseYield = function() {
        var node = this.startNode();
        this.next();
        if (this.type == tt.semi || this.canInsertSemicolon() || this.type != tt.star && !this.type.startsExpr) {
          node.delegate = false;
          node.argument = null;
        } else {
          node.delegate = this.eat(tt.star);
          node.argument = this.parseMaybeAssign();
        }
        return this.finishNode(node, "YieldExpression");
      };
      pp.parseComprehension = function(node, isGenerator) {
        node.blocks = [];
        while (this.type === tt._for) {
          var block = this.startNode();
          this.next();
          this.expect(tt.parenL);
          block.left = this.parseBindingAtom();
          this.checkLVal(block.left, true);
          this.expectContextual("of");
          block.right = this.parseExpression();
          this.expect(tt.parenR);
          node.blocks.push(this.finishNode(block, "ComprehensionBlock"));
        }
        node.filter = this.eat(tt._if) ? this.parseParenExpression() : null;
        node.body = this.parseExpression();
        this.expect(isGenerator ? tt.parenR : tt.bracketR);
        node.generator = isGenerator;
        return this.finishNode(node, "ComprehensionExpression");
      };
    }, {
      "./identifier": 3,
      "./state": 9,
      "./tokentype": 13,
      "./util": 14
    }],
    3: [function(_dereq_, module, exports) {
      "use strict";
      exports.isIdentifierStart = isIdentifierStart;
      exports.isIdentifierChar = isIdentifierChar;
      exports.__esModule = true;

      function makePredicate(words) {
        words = words.split(" ");
        var f = "",
          cats = [];
        out: for (var i = 0; i < words.length; ++i) {
          for (var j = 0; j < cats.length; ++j) {
            if (cats[j][0].length == words[i].length) {
              cats[j].push(words[i]);
              continue out;
            }
          }
          cats.push([words[i]]);
        }

        function compareTo(arr) {
          if (arr.length == 1) {
            return f += "return str === " + JSON.stringify(arr[0]) + ";";
          }
          f += "switch(str){";
          for (var i = 0; i < arr.length; ++i) {
            f += "case " + JSON.stringify(arr[i]) + ":";
          }
          f += "return true}return false;";
        }
        if (cats.length > 3) {
          cats.sort(function(a, b) {
            return b.length - a.length;
          });
          f += "switch(str.length){";
          for (var i = 0; i < cats.length; ++i) {
            var cat = cats[i];
            f += "case " + cat[0].length + ":";
            compareTo(cat);
          }
          f += "}";
        } else {
          compareTo(words);
        }
        return new Function("str", f);
      }
      var reservedWords = {
        3: makePredicate("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile"),
        5: makePredicate("class enum extends super const export import"),
        6: makePredicate("enum await"),
        strict: makePredicate("implements interface let package private protected public static yield"),
        strictBind: makePredicate("eval arguments")
      };
      exports.reservedWords = reservedWords;
      var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
      var keywords = {
        5: makePredicate(ecma5AndLessKeywords),
        6: makePredicate(ecma5AndLessKeywords + " let const class extends export import yield super")
      };
      exports.keywords = keywords;
      var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢲऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞭꞰꞱꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭟꭤꭥꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
      var nonASCIIidentifierChars = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣤ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏ᦰ-ᧀᧈᧉ᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︭︳︴﹍-﹏０-９＿";
      var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
      var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
      nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;
      var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 99, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 98, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 955, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 38, 17, 2, 24, 133, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 32, 4, 287, 47, 21, 1, 2, 0, 185, 46, 82, 47, 21, 0, 60, 42, 502, 63, 32, 0, 449, 56, 1288, 920, 104, 110, 2962, 1070, 13266, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 16481, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 1340, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 16355, 541];
      var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 16, 9, 83, 11, 168, 11, 6, 9, 8, 2, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 316, 19, 13, 9, 214, 6, 3, 8, 112, 16, 16, 9, 82, 12, 9, 9, 535, 9, 20855, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 4305, 6, 792618, 239];

      function isInAstralSet(code, set) {
        var pos = 65536;
        for (var i = 0; i < set.length; i += 2) {
          pos += set[i];
          if (pos > code) {
            return false;
          }
          pos += set[i + 1];
          if (pos >= code) {
            return true;
          }
        }
      }

      function isIdentifierStart(code, astral) {
        if (code < 65) {
          return code === 36;
        }
        if (code < 91) {
          return true;
        }
        if (code < 97) {
          return code === 95;
        }
        if (code < 123) {
          return true;
        }
        if (code <= 65535) {
          return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
        }
        if (astral === false) {
          return false;
        }
        return isInAstralSet(code, astralIdentifierStartCodes);
      }

      function isIdentifierChar(code, astral) {
        if (code < 48) {
          return code === 36;
        }
        if (code < 58) {
          return true;
        }
        if (code < 65) {
          return false;
        }
        if (code < 91) {
          return true;
        }
        if (code < 97) {
          return code === 95;
        }
        if (code < 123) {
          return true;
        }
        if (code <= 65535) {
          return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
        }
        if (astral === false) {
          return false;
        }
        return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
      }
    }, {}],
    4: [function(_dereq_, module, exports) {
      "use strict";
      var _classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      };
      exports.getLineInfo = getLineInfo;
      exports.__esModule = true;
      var Parser = _dereq_("./state").Parser;
      var lineBreakG = _dereq_("./whitespace").lineBreakG;
      var Position = exports.Position = (function() {
        function Position(line, col) {
          _classCallCheck(this, Position);
          this.line = line;
          this.column = col;
        }
        Position.prototype.offset = function offset(n) {
          return new Position(this.line, this.column + n);
        };
        return Position;
      })();
      var SourceLocation = exports.SourceLocation = function SourceLocation(p, start, end) {
        _classCallCheck(this, SourceLocation);
        this.start = start;
        this.end = end;
        if (p.sourceFile !== null) this.source = p.sourceFile;
      };

      function getLineInfo(input, offset) {
        for (var line = 1, cur = 0;;) {
          lineBreakG.lastIndex = cur;
          var match = lineBreakG.exec(input);
          if (match && match.index < offset) {
            ++line;
            cur = match.index + match[0].length;
          } else {
            return new Position(line, offset - cur);
          }
        }
      }
      var pp = Parser.prototype;
      pp.raise = function(pos, message) {
        var loc = getLineInfo(this.input, pos);
        message += " (" + loc.line + ":" + loc.column + ")";
        var err = new SyntaxError(message);
        err.pos = pos;
        err.loc = loc;
        err.raisedAt = this.pos;
        throw err;
      };
      pp.curPosition = function() {
        return new Position(this.curLine, this.pos - this.lineStart);
      };
    }, {
      "./state": 9,
      "./whitespace": 15
    }],
    5: [function(_dereq_, module, exports) {
      "use strict";
      var tt = _dereq_("./tokentype").types;
      var Parser = _dereq_("./state").Parser;
      var reservedWords = _dereq_("./identifier").reservedWords;
      var has = _dereq_("./util").has;
      var pp = Parser.prototype;
      pp.toAssignable = function(node, isBinding) {
        if (this.options.ecmaVersion >= 6 && node) {
          switch (node.type) {
            case "Identifier":
            case "ObjectPattern":
            case "ArrayPattern":
            case "AssignmentPattern":
              break;
            case "ObjectExpression":
              node.type = "ObjectPattern";
              for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                if (prop.kind !== "init") this.raise(prop.key.start, "Object pattern can't contain getter or setter");
                this.toAssignable(prop.value, isBinding);
              }
              break;
            case "ArrayExpression":
              node.type = "ArrayPattern";
              this.toAssignableList(node.elements, isBinding);
              break;
            case "AssignmentExpression":
              if (node.operator === "=") {
                node.type = "AssignmentPattern";
              } else {
                this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
              }
              break;
            case "ParenthesizedExpression":
              node.expression = this.toAssignable(node.expression, isBinding);
              break;
            case "MemberExpression":
              if (!isBinding) break;
            default:
              this.raise(node.start, "Assigning to rvalue");
          }
        }
        return node;
      };
      pp.toAssignableList = function(exprList, isBinding) {
        var end = exprList.length;
        if (end) {
          var last = exprList[end - 1];
          if (last && last.type == "RestElement") {
            --end;
          } else if (last && last.type == "SpreadElement") {
            last.type = "RestElement";
            var arg = last.argument;
            this.toAssignable(arg, isBinding);
            if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern") this.unexpected(arg.start);
            --end;
          }
        }
        for (var i = 0; i < end; i++) {
          var elt = exprList[i];
          if (elt) this.toAssignable(elt, isBinding);
        }
        return exprList;
      };
      pp.parseSpread = function(refShorthandDefaultPos) {
        var node = this.startNode();
        this.next();
        node.argument = this.parseMaybeAssign(refShorthandDefaultPos);
        return this.finishNode(node, "SpreadElement");
      };
      pp.parseRest = function() {
        var node = this.startNode();
        this.next();
        node.argument = this.type === tt.name || this.type === tt.bracketL ? this.parseBindingAtom() : this.unexpected();
        return this.finishNode(node, "RestElement");
      };
      pp.parseBindingAtom = function() {
        if (this.options.ecmaVersion < 6) return this.parseIdent();
        switch (this.type) {
          case tt.name:
            return this.parseIdent();
          case tt.bracketL:
            var node = this.startNode();
            this.next();
            node.elements = this.parseBindingList(tt.bracketR, true, true);
            return this.finishNode(node, "ArrayPattern");
          case tt.braceL:
            return this.parseObj(true);
          default:
            this.unexpected();
        }
      };
      pp.parseBindingList = function(close, allowEmpty, allowTrailingComma) {
        var elts = [],
          first = true;
        while (!this.eat(close)) {
          if (first) first = false;
          else this.expect(tt.comma);
          if (allowEmpty && this.type === tt.comma) {
            elts.push(null);
          } else if (allowTrailingComma && this.afterTrailingComma(close)) {
            break;
          } else if (this.type === tt.ellipsis) {
            var rest = this.parseRest();
            this.parseBindingListItem(rest);
            elts.push(rest);
            this.expect(close);
            break;
          } else {
            var elem = this.parseMaybeDefault(this.start, this.startLoc);
            this.parseBindingListItem(elem);
            elts.push(elem);
          }
        }
        return elts;
      };
      pp.parseBindingListItem = function(param) {
        return param;
      };
      pp.parseMaybeDefault = function(startPos, startLoc, left) {
        left = left || this.parseBindingAtom();
        if (!this.eat(tt.eq)) return left;
        var node = this.startNodeAt(startPos, startLoc);
        node.operator = "=";
        node.left = left;
        node.right = this.parseMaybeAssign();
        return this.finishNode(node, "AssignmentPattern");
      };
      pp.checkLVal = function(expr, isBinding, checkClashes) {
        switch (expr.type) {
          case "Identifier":
            if (this.strict && (reservedWords.strictBind(expr.name) || reservedWords.strict(expr.name))) this.raise(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
            if (checkClashes) {
              if (has(checkClashes, expr.name)) this.raise(expr.start, "Argument name clash in strict mode");
              checkClashes[expr.name] = true;
            }
            break;
          case "MemberExpression":
            if (isBinding) this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
            break;
          case "ObjectPattern":
            for (var i = 0; i < expr.properties.length; i++) {
              this.checkLVal(expr.properties[i].value, isBinding, checkClashes);
            }
            break;
          case "ArrayPattern":
            for (var i = 0; i < expr.elements.length; i++) {
              var elem = expr.elements[i];
              if (elem) this.checkLVal(elem, isBinding, checkClashes);
            }
            break;
          case "AssignmentPattern":
            this.checkLVal(expr.left, isBinding, checkClashes);
            break;
          case "RestElement":
            this.checkLVal(expr.argument, isBinding, checkClashes);
            break;
          case "ParenthesizedExpression":
            this.checkLVal(expr.expression, isBinding, checkClashes);
            break;
          default:
            this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue");
        }
      };
    }, {
      "./identifier": 3,
      "./state": 9,
      "./tokentype": 13,
      "./util": 14
    }],
    6: [function(_dereq_, module, exports) {
      "use strict";
      var _classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      };
      exports.__esModule = true;
      var Parser = _dereq_("./state").Parser;
      var SourceLocation = _dereq_("./location").SourceLocation;
      var pp = Parser.prototype;
      var Node = exports.Node = function Node() {
        _classCallCheck(this, Node);
      };
      pp.startNode = function() {
        var node = new Node();
        node.start = this.start;
        if (this.options.locations) node.loc = new SourceLocation(this, this.startLoc);
        if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
        if (this.options.ranges) node.range = [this.start, 0];
        return node;
      };
      pp.startNodeAt = function(pos, loc) {
        var node = new Node();
        node.start = pos;
        if (this.options.locations) node.loc = new SourceLocation(this, loc);
        if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
        if (this.options.ranges) node.range = [pos, 0];
        return node;
      };
      pp.finishNode = function(node, type) {
        node.type = type;
        node.end = this.lastTokEnd;
        if (this.options.locations) node.loc.end = this.lastTokEndLoc;
        if (this.options.ranges) node.range[1] = this.lastTokEnd;
        return node;
      };
      pp.finishNodeAt = function(node, type, pos, loc) {
        node.type = type;
        node.end = pos;
        if (this.options.locations) node.loc.end = loc;
        if (this.options.ranges) node.range[1] = pos;
        return node;
      };
    }, {
      "./location": 4,
      "./state": 9
    }],
    7: [function(_dereq_, module, exports) {
      "use strict";
      exports.getOptions = getOptions;
      exports.__esModule = true;
      var _util = _dereq_("./util");
      var has = _util.has;
      var isArray = _util.isArray;
      var SourceLocation = _dereq_("./location").SourceLocation;
      var defaultOptions = {
        ecmaVersion: 5,
        sourceType: "script",
        onInsertedSemicolon: null,
        onTrailingComma: null,
        allowReserved: true,
        allowReturnOutsideFunction: false,
        allowImportExportEverywhere: false,
        allowHashBang: false,
        locations: false,
        onToken: null,
        onComment: null,
        ranges: false,
        program: null,
        sourceFile: null,
        directSourceFile: null,
        preserveParens: false,
        plugins: {}
      };
      exports.defaultOptions = defaultOptions;

      function getOptions(opts) {
        var options = {};
        for (var opt in defaultOptions) {
          options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
        }
        if (isArray(options.onToken)) {
          (function() {
            var tokens = options.onToken;
            options.onToken = function(token) {
              return tokens.push(token);
            };
          })();
        }
        if (isArray(options.onComment)) options.onComment = pushComment(options, options.onComment);
        return options;
      }

      function pushComment(options, array) {
        return function(block, text, start, end, startLoc, endLoc) {
          var comment = {
            type: block ? "Block" : "Line",
            value: text,
            start: start,
            end: end
          };
          if (options.locations) comment.loc = new SourceLocation(this, startLoc, endLoc);
          if (options.ranges) comment.range = [start, end];
          array.push(comment);
        };
      }
    }, {
      "./location": 4,
      "./util": 14
    }],
    8: [function(_dereq_, module, exports) {
      "use strict";
      var tt = _dereq_("./tokentype").types;
      var Parser = _dereq_("./state").Parser;
      var lineBreak = _dereq_("./whitespace").lineBreak;
      var pp = Parser.prototype;
      pp.isUseStrict = function(stmt) {
        return this.options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" && stmt.expression.type === "Literal" && stmt.expression.value === "use strict";
      };
      pp.eat = function(type) {
        if (this.type === type) {
          this.next();
          return true;
        } else {
          return false;
        }
      };
      pp.isContextual = function(name) {
        return this.type === tt.name && this.value === name;
      };
      pp.eatContextual = function(name) {
        return this.value === name && this.eat(tt.name);
      };
      pp.expectContextual = function(name) {
        if (!this.eatContextual(name)) this.unexpected();
      };
      pp.canInsertSemicolon = function() {
        return this.type === tt.eof || this.type === tt.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
      };
      pp.insertSemicolon = function() {
        if (this.canInsertSemicolon()) {
          if (this.options.onInsertedSemicolon) this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
          return true;
        }
      };
      pp.semicolon = function() {
        if (!this.eat(tt.semi) && !this.insertSemicolon()) this.unexpected();
      };
      pp.afterTrailingComma = function(tokType) {
        if (this.type == tokType) {
          if (this.options.onTrailingComma) this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
          this.next();
          return true;
        }
      };
      pp.expect = function(type) {
        this.eat(type) || this.unexpected();
      };
      pp.unexpected = function(pos) {
        this.raise(pos != null ? pos : this.start, "Unexpected token");
      };
    }, {
      "./state": 9,
      "./tokentype": 13,
      "./whitespace": 15
    }],
    9: [function(_dereq_, module, exports) {
      "use strict";
      exports.Parser = Parser;
      exports.__esModule = true;
      var _identifier = _dereq_("./identifier");
      var reservedWords = _identifier.reservedWords;
      var keywords = _identifier.keywords;
      var _tokentype = _dereq_("./tokentype");
      var tt = _tokentype.types;
      var lineBreak = _tokentype.lineBreak;

      function Parser(options, input, startPos) {
        this.options = options;
        this.loadPlugins(this.options.plugins);
        this.sourceFile = this.options.sourceFile || null;
        this.isKeyword = keywords[this.options.ecmaVersion >= 6 ? 6 : 5];
        this.isReservedWord = reservedWords[this.options.ecmaVersion];
        this.input = input;
        if (startPos) {
          this.pos = startPos;
          this.lineStart = Math.max(0, this.input.lastIndexOf("\n", startPos));
          this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
        } else {
          this.pos = this.lineStart = 0;
          this.curLine = 1;
        }
        this.type = tt.eof;
        this.value = null;
        this.start = this.end = this.pos;
        this.startLoc = this.endLoc = null;
        this.lastTokEndLoc = this.lastTokStartLoc = null;
        this.lastTokStart = this.lastTokEnd = this.pos;
        this.context = this.initialContext();
        this.exprAllowed = true;
        this.strict = this.inModule = this.options.sourceType === "module";
        this.potentialArrowAt = -1;
        this.inFunction = this.inGenerator = false;
        this.labels = [];
        if (this.pos === 0 && this.options.allowHashBang && this.input.slice(0, 2) === "#!") this.skipLineComment(2);
      }
      Parser.prototype.extend = function(name, f) {
        this[name] = f(this[name]);
      };
      var plugins = {};
      exports.plugins = plugins;
      Parser.prototype.loadPlugins = function(plugins) {
        for (var _name in plugins) {
          var plugin = exports.plugins[_name];
          if (!plugin) throw new Error("Plugin '" + _name + "' not found");
          plugin(this, plugins[_name]);
        }
      };
    }, {
      "./identifier": 3,
      "./tokentype": 13
    }],
    10: [function(_dereq_, module, exports) {
      "use strict";
      var tt = _dereq_("./tokentype").types;
      var Parser = _dereq_("./state").Parser;
      var lineBreak = _dereq_("./whitespace").lineBreak;
      var pp = Parser.prototype;
      pp.parseTopLevel = function(node) {
        var first = true;
        if (!node.body) node.body = [];
        while (this.type !== tt.eof) {
          var stmt = this.parseStatement(true, true);
          node.body.push(stmt);
          if (first && this.isUseStrict(stmt)) this.setStrict(true);
          first = false;
        }
        this.next();
        if (this.options.ecmaVersion >= 6) {
          node.sourceType = this.options.sourceType;
        }
        return this.finishNode(node, "Program");
      };
      var loopLabel = {
          kind: "loop"
        },
        switchLabel = {
          kind: "switch"
        };
      pp.parseStatement = function(declaration, topLevel) {
        var starttype = this.type,
          node = this.startNode();
        switch (starttype) {
          case tt._break:
          case tt._continue:
            return this.parseBreakContinueStatement(node, starttype.keyword);
          case tt._debugger:
            return this.parseDebuggerStatement(node);
          case tt._do:
            return this.parseDoStatement(node);
          case tt._for:
            return this.parseForStatement(node);
          case tt._function:
            if (!declaration && this.options.ecmaVersion >= 6) this.unexpected();
            return this.parseFunctionStatement(node);
          case tt._class:
            if (!declaration) this.unexpected();
            return this.parseClass(node, true);
          case tt._if:
            return this.parseIfStatement(node);
          case tt._return:
            return this.parseReturnStatement(node);
          case tt._switch:
            return this.parseSwitchStatement(node);
          case tt._throw:
            return this.parseThrowStatement(node);
          case tt._try:
            return this.parseTryStatement(node);
          case tt._let:
          case tt._const:
            if (!declaration) this.unexpected();
          case tt._var:
            return this.parseVarStatement(node, starttype);
          case tt._while:
            return this.parseWhileStatement(node);
          case tt._with:
            return this.parseWithStatement(node);
          case tt.braceL:
            return this.parseBlock();
          case tt.semi:
            return this.parseEmptyStatement(node);
          case tt._export:
          case tt._import:
            if (!this.options.allowImportExportEverywhere) {
              if (!topLevel) this.raise(this.start, "'import' and 'export' may only appear at the top level");
              if (!this.inModule) this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
            }
            return starttype === tt._import ? this.parseImport(node) : this.parseExport(node);
          default:
            var maybeName = this.value,
              expr = this.parseExpression();
            if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon)) return this.parseLabeledStatement(node, maybeName, expr);
            else return this.parseExpressionStatement(node, expr);
        }
      };
      pp.parseBreakContinueStatement = function(node, keyword) {
        var isBreak = keyword == "break";
        this.next();
        if (this.eat(tt.semi) || this.insertSemicolon()) node.label = null;
        else if (this.type !== tt.name) this.unexpected();
        else {
          node.label = this.parseIdent();
          this.semicolon();
        }
        for (var i = 0; i < this.labels.length; ++i) {
          var lab = this.labels[i];
          if (node.label == null || lab.name === node.label.name) {
            if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
            if (node.label && isBreak) break;
          }
        }
        if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword);
        return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
      };
      pp.parseDebuggerStatement = function(node) {
        this.next();
        this.semicolon();
        return this.finishNode(node, "DebuggerStatement");
      };
      pp.parseDoStatement = function(node) {
        this.next();
        this.labels.push(loopLabel);
        node.body = this.parseStatement(false);
        this.labels.pop();
        this.expect(tt._while);
        node.test = this.parseParenExpression();
        if (this.options.ecmaVersion >= 6) this.eat(tt.semi);
        else this.semicolon();
        return this.finishNode(node, "DoWhileStatement");
      };
      pp.parseForStatement = function(node) {
        this.next();
        this.labels.push(loopLabel);
        this.expect(tt.parenL);
        if (this.type === tt.semi) return this.parseFor(node, null);
        if (this.type === tt._var || this.type === tt._let || this.type === tt._const) {
          var _init = this.startNode(),
            varKind = this.type;
          this.next();
          this.parseVar(_init, true, varKind);
          this.finishNode(_init, "VariableDeclaration");
          if ((this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && _init.declarations.length === 1 && !(varKind !== tt._var && _init.declarations[0].init)) return this.parseForIn(node, _init);
          return this.parseFor(node, _init);
        }
        var refShorthandDefaultPos = {
          start: 0
        };
        var init = this.parseExpression(true, refShorthandDefaultPos);
        if (this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) {
          this.toAssignable(init);
          this.checkLVal(init);
          return this.parseForIn(node, init);
        } else if (refShorthandDefaultPos.start) {
          this.unexpected(refShorthandDefaultPos.start);
        }
        return this.parseFor(node, init);
      };
      pp.parseFunctionStatement = function(node) {
        this.next();
        return this.parseFunction(node, true);
      };
      pp.parseIfStatement = function(node) {
        this.next();
        node.test = this.parseParenExpression();
        node.consequent = this.parseStatement(false);
        node.alternate = this.eat(tt._else) ? this.parseStatement(false) : null;
        return this.finishNode(node, "IfStatement");
      };
      pp.parseReturnStatement = function(node) {
        if (!this.inFunction && !this.options.allowReturnOutsideFunction) this.raise(this.start, "'return' outside of function");
        this.next();
        if (this.eat(tt.semi) || this.insertSemicolon()) node.argument = null;
        else {
          node.argument = this.parseExpression();
          this.semicolon();
        }
        return this.finishNode(node, "ReturnStatement");
      };
      pp.parseSwitchStatement = function(node) {
        this.next();
        node.discriminant = this.parseParenExpression();
        node.cases = [];
        this.expect(tt.braceL);
        this.labels.push(switchLabel);
        for (var cur, sawDefault; this.type != tt.braceR;) {
          if (this.type === tt._case || this.type === tt._default) {
            var isCase = this.type === tt._case;
            if (cur) this.finishNode(cur, "SwitchCase");
            node.cases.push(cur = this.startNode());
            cur.consequent = [];
            this.next();
            if (isCase) {
              cur.test = this.parseExpression();
            } else {
              if (sawDefault) this.raise(this.lastTokStart, "Multiple default clauses");
              sawDefault = true;
              cur.test = null;
            }
            this.expect(tt.colon);
          } else {
            if (!cur) this.unexpected();
            cur.consequent.push(this.parseStatement(true));
          }
        }
        if (cur) this.finishNode(cur, "SwitchCase");
        this.next();
        this.labels.pop();
        return this.finishNode(node, "SwitchStatement");
      };
      pp.parseThrowStatement = function(node) {
        this.next();
        if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) this.raise(this.lastTokEnd, "Illegal newline after throw");
        node.argument = this.parseExpression();
        this.semicolon();
        return this.finishNode(node, "ThrowStatement");
      };
      var empty = [];
      pp.parseTryStatement = function(node) {
        this.next();
        node.block = this.parseBlock();
        node.handler = null;
        if (this.type === tt._catch) {
          var clause = this.startNode();
          this.next();
          this.expect(tt.parenL);
          clause.param = this.parseBindingAtom();
          this.checkLVal(clause.param, true);
          this.expect(tt.parenR);
          clause.guard = null;
          clause.body = this.parseBlock();
          node.handler = this.finishNode(clause, "CatchClause");
        }
        node.guardedHandlers = empty;
        node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null;
        if (!node.handler && !node.finalizer) this.raise(node.start, "Missing catch or finally clause");
        return this.finishNode(node, "TryStatement");
      };
      pp.parseVarStatement = function(node, kind) {
        this.next();
        this.parseVar(node, false, kind);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration");
      };
      pp.parseWhileStatement = function(node) {
        this.next();
        node.test = this.parseParenExpression();
        this.labels.push(loopLabel);
        node.body = this.parseStatement(false);
        this.labels.pop();
        return this.finishNode(node, "WhileStatement");
      };
      pp.parseWithStatement = function(node) {
        if (this.strict) this.raise(this.start, "'with' in strict mode");
        this.next();
        node.object = this.parseParenExpression();
        node.body = this.parseStatement(false);
        return this.finishNode(node, "WithStatement");
      };
      pp.parseEmptyStatement = function(node) {
        this.next();
        return this.finishNode(node, "EmptyStatement");
      };
      pp.parseLabeledStatement = function(node, maybeName, expr) {
        for (var i = 0; i < this.labels.length; ++i) {
          if (this.labels[i].name === maybeName) this.raise(expr.start, "Label '" + maybeName + "' is already declared");
        }
        var kind = this.type.isLoop ? "loop" : this.type === tt._switch ? "switch" : null;
        this.labels.push({
          name: maybeName,
          kind: kind
        });
        node.body = this.parseStatement(true);
        this.labels.pop();
        node.label = expr;
        return this.finishNode(node, "LabeledStatement");
      };
      pp.parseExpressionStatement = function(node, expr) {
        node.expression = expr;
        this.semicolon();
        return this.finishNode(node, "ExpressionStatement");
      };
      pp.parseBlock = function(allowStrict) {
        var node = this.startNode(),
          first = true,
          oldStrict = undefined;
        node.body = [];
        this.expect(tt.braceL);
        while (!this.eat(tt.braceR)) {
          var stmt = this.parseStatement(true);
          node.body.push(stmt);
          if (first && allowStrict && this.isUseStrict(stmt)) {
            oldStrict = this.strict;
            this.setStrict(this.strict = true);
          }
          first = false;
        }
        if (oldStrict === false) this.setStrict(false);
        return this.finishNode(node, "BlockStatement");
      };
      pp.parseFor = function(node, init) {
        node.init = init;
        this.expect(tt.semi);
        node.test = this.type === tt.semi ? null : this.parseExpression();
        this.expect(tt.semi);
        node.update = this.type === tt.parenR ? null : this.parseExpression();
        this.expect(tt.parenR);
        node.body = this.parseStatement(false);
        this.labels.pop();
        return this.finishNode(node, "ForStatement");
      };
      pp.parseForIn = function(node, init) {
        var type = this.type === tt._in ? "ForInStatement" : "ForOfStatement";
        this.next();
        node.left = init;
        node.right = this.parseExpression();
        this.expect(tt.parenR);
        node.body = this.parseStatement(false);
        this.labels.pop();
        return this.finishNode(node, type);
      };
      pp.parseVar = function(node, isFor, kind) {
        node.declarations = [];
        node.kind = kind.keyword;
        for (;;) {
          var decl = this.startNode();
          this.parseVarId(decl);
          if (this.eat(tt.eq)) {
            decl.init = this.parseMaybeAssign(isFor);
          } else if (kind === tt._const && !(this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
            this.unexpected();
          } else if (decl.id.type != "Identifier" && !(isFor && (this.type === tt._in || this.isContextual("of")))) {
            this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
          } else {
            decl.init = null;
          }
          node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
          if (!this.eat(tt.comma)) break;
        }
        return node;
      };
      pp.parseVarId = function(decl) {
        decl.id = this.parseBindingAtom();
        this.checkLVal(decl.id, true);
      };
      pp.parseFunction = function(node, isStatement, allowExpressionBody) {
        this.initFunction(node);
        if (this.options.ecmaVersion >= 6) node.generator = this.eat(tt.star);
        if (isStatement || this.type === tt.name) node.id = this.parseIdent();
        this.parseFunctionParams(node);
        this.parseFunctionBody(node, allowExpressionBody);
        return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
      };
      pp.parseFunctionParams = function(node) {
        this.expect(tt.parenL);
        node.params = this.parseBindingList(tt.parenR, false, false);
      };
      pp.parseClass = function(node, isStatement) {
        this.next();
        this.parseClassId(node, isStatement);
        this.parseClassSuper(node);
        var classBody = this.startNode();
        classBody.body = [];
        this.expect(tt.braceL);
        while (!this.eat(tt.braceR)) {
          if (this.eat(tt.semi)) continue;
          var method = this.startNode();
          var isGenerator = this.eat(tt.star);
          this.parsePropertyName(method);
          if (this.type !== tt.parenL && !method.computed && method.key.type === "Identifier" && method.key.name === "static") {
            if (isGenerator) this.unexpected();
            method["static"] = true;
            isGenerator = this.eat(tt.star);
            this.parsePropertyName(method);
          } else {
            method["static"] = false;
          }
          method.kind = "method";
          if (!method.computed && !isGenerator) {
            if (method.key.type === "Identifier") {
              if (this.type !== tt.parenL && (method.key.name === "get" || method.key.name === "set")) {
                method.kind = method.key.name;
                this.parsePropertyName(method);
              } else if (!method["static"] && method.key.name === "constructor") {
                method.kind = "constructor";
              }
            } else if (!method["static"] && method.key.type === "Literal" && method.key.value === "constructor") {
              method.kind = "constructor";
            }
          }
          this.parseClassMethod(classBody, method, isGenerator);
        }
        node.body = this.finishNode(classBody, "ClassBody");
        return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
      };
      pp.parseClassMethod = function(classBody, method, isGenerator) {
        method.value = this.parseMethod(isGenerator);
        classBody.body.push(this.finishNode(method, "MethodDefinition"));
      };
      pp.parseClassId = function(node, isStatement) {
        node.id = this.type === tt.name ? this.parseIdent() : isStatement ? this.unexpected() : null;
      };
      pp.parseClassSuper = function(node) {
        node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts() : null;
      };
      pp.parseExport = function(node) {
        this.next();
        if (this.eat(tt.star)) {
          this.expectContextual("from");
          node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
          this.semicolon();
          return this.finishNode(node, "ExportAllDeclaration");
        }
        if (this.eat(tt._default)) {
          var expr = this.parseMaybeAssign();
          var needsSemi = true;
          if (expr.type == "FunctionExpression" || expr.type == "ClassExpression") {
            needsSemi = false;
            if (expr.id) {
              expr.type = expr.type == "FunctionExpression" ? "FunctionDeclaration" : "ClassDeclaration";
            }
          }
          node.declaration = expr;
          if (needsSemi) this.semicolon();
          return this.finishNode(node, "ExportDefaultDeclaration");
        }
        if (this.shouldParseExportStatement()) {
          node.declaration = this.parseStatement(true);
          node.specifiers = [];
          node.source = null;
        } else {
          node.declaration = null;
          node.specifiers = this.parseExportSpecifiers();
          if (this.eatContextual("from")) {
            node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
          } else {
            node.source = null;
          }
          this.semicolon();
        }
        return this.finishNode(node, "ExportNamedDeclaration");
      };
      pp.shouldParseExportStatement = function() {
        return this.type.keyword;
      };
      pp.parseExportSpecifiers = function() {
        var nodes = [],
          first = true;
        this.expect(tt.braceL);
        while (!this.eat(tt.braceR)) {
          if (!first) {
            this.expect(tt.comma);
            if (this.afterTrailingComma(tt.braceR)) break;
          } else first = false;
          var node = this.startNode();
          node.local = this.parseIdent(this.type === tt._default);
          node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
          nodes.push(this.finishNode(node, "ExportSpecifier"));
        }
        return nodes;
      };
      pp.parseImport = function(node) {
        this.next();
        if (this.type === tt.string) {
          node.specifiers = empty;
          node.source = this.parseExprAtom();
          node.kind = "";
        } else {
          node.specifiers = this.parseImportSpecifiers();
          this.expectContextual("from");
          node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
        }
        this.semicolon();
        return this.finishNode(node, "ImportDeclaration");
      };
      pp.parseImportSpecifiers = function() {
        var nodes = [],
          first = true;
        if (this.type === tt.name) {
          var node = this.startNode();
          node.local = this.parseIdent();
          this.checkLVal(node.local, true);
          nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
          if (!this.eat(tt.comma)) return nodes;
        }
        if (this.type === tt.star) {
          var node = this.startNode();
          this.next();
          this.expectContextual("as");
          node.local = this.parseIdent();
          this.checkLVal(node.local, true);
          nodes.push(this.finishNode(node, "ImportNamespaceSpecifier"));
          return nodes;
        }
        this.expect(tt.braceL);
        while (!this.eat(tt.braceR)) {
          if (!first) {
            this.expect(tt.comma);
            if (this.afterTrailingComma(tt.braceR)) break;
          } else first = false;
          var node = this.startNode();
          node.imported = this.parseIdent(true);
          node.local = this.eatContextual("as") ? this.parseIdent() : node.imported;
          this.checkLVal(node.local, true);
          nodes.push(this.finishNode(node, "ImportSpecifier"));
        }
        return nodes;
      };
    }, {
      "./state": 9,
      "./tokentype": 13,
      "./whitespace": 15
    }],
    11: [function(_dereq_, module, exports) {
      "use strict";
      var _classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      };
      exports.__esModule = true;
      var Parser = _dereq_("./state").Parser;
      var tt = _dereq_("./tokentype").types;
      var lineBreak = _dereq_("./whitespace").lineBreak;
      var TokContext = exports.TokContext = function TokContext(token, isExpr, preserveSpace, override) {
        _classCallCheck(this, TokContext);
        this.token = token;
        this.isExpr = isExpr;
        this.preserveSpace = preserveSpace;
        this.override = override;
      };
      var types = {
        b_stat: new TokContext("{", false),
        b_expr: new TokContext("{", true),
        b_tmpl: new TokContext("${", true),
        p_stat: new TokContext("(", false),
        p_expr: new TokContext("(", true),
        q_tmpl: new TokContext("`", true, true, function(p) {
          return p.readTmplToken();
        }),
        f_expr: new TokContext("function", true)
      };
      exports.types = types;
      var pp = Parser.prototype;
      pp.initialContext = function() {
        return [types.b_stat];
      };
      pp.braceIsBlock = function(prevType) {
        var parent = undefined;
        if (prevType === tt.colon && (parent = this.curContext()).token == "{") return !parent.isExpr;
        if (prevType === tt._return) return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
        if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof) return true;
        if (prevType == tt.braceL) return this.curContext() === types.b_stat;
        return !this.exprAllowed;
      };
      pp.updateContext = function(prevType) {
        var update = undefined,
          type = this.type;
        if (type.keyword && prevType == tt.dot) this.exprAllowed = false;
        else if (update = type.updateContext) update.call(this, prevType);
        else this.exprAllowed = type.beforeExpr;
      };
      tt.parenR.updateContext = tt.braceR.updateContext = function() {
        if (this.context.length == 1) {
          this.exprAllowed = true;
          return;
        }
        var out = this.context.pop();
        if (out === types.b_stat && this.curContext() === types.f_expr) {
          this.context.pop();
          this.exprAllowed = false;
        } else if (out === types.b_tmpl) {
          this.exprAllowed = true;
        } else {
          this.exprAllowed = !out.isExpr;
        }
      };
      tt.braceL.updateContext = function(prevType) {
        this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
        this.exprAllowed = true;
      };
      tt.dollarBraceL.updateContext = function() {
        this.context.push(types.b_tmpl);
        this.exprAllowed = true;
      };
      tt.parenL.updateContext = function(prevType) {
        var statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while;
        this.context.push(statementParens ? types.p_stat : types.p_expr);
        this.exprAllowed = true;
      };
      tt.incDec.updateContext = function() {};
      tt._function.updateContext = function() {
        if (this.curContext() !== types.b_stat) this.context.push(types.f_expr);
        this.exprAllowed = false;
      };
      tt.backQuote.updateContext = function() {
        if (this.curContext() === types.q_tmpl) this.context.pop();
        else this.context.push(types.q_tmpl);
        this.exprAllowed = false;
      };
    }, {
      "./state": 9,
      "./tokentype": 13,
      "./whitespace": 15
    }],
    12: [function(_dereq_, module, exports) {
      "use strict";
      var _classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      };
      exports.__esModule = true;
      var _identifier = _dereq_("./identifier");
      var isIdentifierStart = _identifier.isIdentifierStart;
      var isIdentifierChar = _identifier.isIdentifierChar;
      var _tokentype = _dereq_("./tokentype");
      var tt = _tokentype.types;
      var keywordTypes = _tokentype.keywords;
      var Parser = _dereq_("./state").Parser;
      var SourceLocation = _dereq_("./location").SourceLocation;
      var _whitespace = _dereq_("./whitespace");
      var lineBreak = _whitespace.lineBreak;
      var lineBreakG = _whitespace.lineBreakG;
      var isNewLine = _whitespace.isNewLine;
      var nonASCIIwhitespace = _whitespace.nonASCIIwhitespace;
      var Token = exports.Token = function Token(p) {
        _classCallCheck(this, Token);
        this.type = p.type;
        this.value = p.value;
        this.start = p.start;
        this.end = p.end;
        if (p.options.locations) this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
        if (p.options.ranges) this.range = [p.start, p.end];
      };
      var pp = Parser.prototype;
      pp.next = function() {
        if (this.options.onToken) this.options.onToken(new Token(this));
        this.lastTokEnd = this.end;
        this.lastTokStart = this.start;
        this.lastTokEndLoc = this.endLoc;
        this.lastTokStartLoc = this.startLoc;
        this.nextToken();
      };
      pp.getToken = function() {
        this.next();
        return new Token(this);
      };
      if (typeof Symbol !== "undefined") pp[Symbol.iterator] = function() {
        var self = this;
        return {
          next: function next() {
            var token = self.getToken();
            return {
              done: token.type === tt.eof,
              value: token
            };
          }
        };
      };
      pp.setStrict = function(strict) {
        this.strict = strict;
        if (this.type !== tt.num && this.type !== tt.string) return;
        this.pos = this.start;
        if (this.options.locations) {
          while (this.pos < this.lineStart) {
            this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1;
            --this.curLine;
          }
        }
        this.nextToken();
      };
      pp.curContext = function() {
        return this.context[this.context.length - 1];
      };
      pp.nextToken = function() {
        var curContext = this.curContext();
        if (!curContext || !curContext.preserveSpace) this.skipSpace();
        this.start = this.pos;
        if (this.options.locations) this.startLoc = this.curPosition();
        if (this.pos >= this.input.length) return this.finishToken(tt.eof);
        if (curContext.override) return curContext.override(this);
        else this.readToken(this.fullCharCodeAtPos());
      };
      pp.readToken = function(code) {
        if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) return this.readWord();
        return this.getTokenFromCode(code);
      };
      pp.fullCharCodeAtPos = function() {
        var code = this.input.charCodeAt(this.pos);
        if (code <= 55295 || code >= 57344) return code;
        var next = this.input.charCodeAt(this.pos + 1);
        return (code << 10) + next - 56613888;
      };
      pp.skipBlockComment = function() {
        var startLoc = this.options.onComment && this.options.locations && this.curPosition();
        var start = this.pos,
          end = this.input.indexOf("*/", this.pos += 2);
        if (end === -1) this.raise(this.pos - 2, "Unterminated comment");
        this.pos = end + 2;
        if (this.options.locations) {
          lineBreakG.lastIndex = start;
          var match = undefined;
          while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
            ++this.curLine;
            this.lineStart = match.index + match[0].length;
          }
        }
        if (this.options.onComment) this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.options.locations && this.curPosition());
      };
      pp.skipLineComment = function(startSkip) {
        var start = this.pos;
        var startLoc = this.options.onComment && this.options.locations && this.curPosition();
        var ch = this.input.charCodeAt(this.pos += startSkip);
        while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
          ++this.pos;
          ch = this.input.charCodeAt(this.pos);
        }
        if (this.options.onComment) this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.options.locations && this.curPosition());
      };
      pp.skipSpace = function() {
        while (this.pos < this.input.length) {
          var ch = this.input.charCodeAt(this.pos);
          if (ch === 32) {
            ++this.pos;
          } else if (ch === 13) {
            ++this.pos;
            var next = this.input.charCodeAt(this.pos);
            if (next === 10) {
              ++this.pos;
            }
            if (this.options.locations) {
              ++this.curLine;
              this.lineStart = this.pos;
            }
          } else if (ch === 10 || ch === 8232 || ch === 8233) {
            ++this.pos;
            if (this.options.locations) {
              ++this.curLine;
              this.lineStart = this.pos;
            }
          } else if (ch > 8 && ch < 14) {
            ++this.pos;
          } else if (ch === 47) {
            var next = this.input.charCodeAt(this.pos + 1);
            if (next === 42) {
              this.skipBlockComment();
            } else if (next === 47) {
              this.skipLineComment(2);
            } else break;
          } else if (ch === 160) {
            ++this.pos;
          } else if (ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
            ++this.pos;
          } else {
            break;
          }
        }
      };
      pp.finishToken = function(type, val) {
        this.end = this.pos;
        if (this.options.locations) this.endLoc = this.curPosition();
        var prevType = this.type;
        this.type = type;
        this.value = val;
        this.updateContext(prevType);
      };
      pp.readToken_dot = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next >= 48 && next <= 57) return this.readNumber(true);
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
          this.pos += 3;
          return this.finishToken(tt.ellipsis);
        } else {
          ++this.pos;
          return this.finishToken(tt.dot);
        }
      };
      pp.readToken_slash = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (this.exprAllowed) {
          ++this.pos;
          return this.readRegexp();
        }
        if (next === 61) return this.finishOp(tt.assign, 2);
        return this.finishOp(tt.slash, 1);
      };
      pp.readToken_mult_modulo = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 61) return this.finishOp(tt.assign, 2);
        return this.finishOp(code === 42 ? tt.star : tt.modulo, 1);
      };
      pp.readToken_pipe_amp = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === code) return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2);
        if (next === 61) return this.finishOp(tt.assign, 2);
        return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1);
      };
      pp.readToken_caret = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 61) return this.finishOp(tt.assign, 2);
        return this.finishOp(tt.bitwiseXOR, 1);
      };
      pp.readToken_plus_min = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === code) {
          if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 && lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
            this.skipLineComment(3);
            this.skipSpace();
            return this.nextToken();
          }
          return this.finishOp(tt.incDec, 2);
        }
        if (next === 61) return this.finishOp(tt.assign, 2);
        return this.finishOp(tt.plusMin, 1);
      };
      pp.readToken_lt_gt = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        var size = 1;
        if (next === code) {
          size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
          if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(tt.assign, size + 1);
          return this.finishOp(tt.bitShift, size);
        }
        if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 && this.input.charCodeAt(this.pos + 3) == 45) {
          if (this.inModule) this.unexpected();
          this.skipLineComment(4);
          this.skipSpace();
          return this.nextToken();
        }
        if (next === 61) size = this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2;
        return this.finishOp(tt.relational, size);
      };
      pp.readToken_eq_excl = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 61) return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
        if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
          this.pos += 2;
          return this.finishToken(tt.arrow);
        }
        return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1);
      };
      pp.getTokenFromCode = function(code) {
        switch (code) {
          case 46:
            return this.readToken_dot();
          case 40:
            ++this.pos;
            return this.finishToken(tt.parenL);
          case 41:
            ++this.pos;
            return this.finishToken(tt.parenR);
          case 59:
            ++this.pos;
            return this.finishToken(tt.semi);
          case 44:
            ++this.pos;
            return this.finishToken(tt.comma);
          case 91:
            ++this.pos;
            return this.finishToken(tt.bracketL);
          case 93:
            ++this.pos;
            return this.finishToken(tt.bracketR);
          case 123:
            ++this.pos;
            return this.finishToken(tt.braceL);
          case 125:
            ++this.pos;
            return this.finishToken(tt.braceR);
          case 58:
            ++this.pos;
            return this.finishToken(tt.colon);
          case 63:
            ++this.pos;
            return this.finishToken(tt.question);
          case 96:
            if (this.options.ecmaVersion < 6) break;
            ++this.pos;
            return this.finishToken(tt.backQuote);
          case 48:
            var next = this.input.charCodeAt(this.pos + 1);
            if (next === 120 || next === 88) return this.readRadixNumber(16);
            if (this.options.ecmaVersion >= 6) {
              if (next === 111 || next === 79) return this.readRadixNumber(8);
              if (next === 98 || next === 66) return this.readRadixNumber(2);
            }
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
              return this.readNumber(false);
            case 34:
            case 39:
              return this.readString(code);
            case 47:
              return this.readToken_slash();
            case 37:
            case 42:
              return this.readToken_mult_modulo(code);
            case 124:
            case 38:
              return this.readToken_pipe_amp(code);
            case 94:
              return this.readToken_caret();
            case 43:
            case 45:
              return this.readToken_plus_min(code);
            case 60:
            case 62:
              return this.readToken_lt_gt(code);
            case 61:
            case 33:
              return this.readToken_eq_excl(code);
            case 126:
              return this.finishOp(tt.prefix, 1);
        }
        this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
      };
      pp.finishOp = function(type, size) {
        var str = this.input.slice(this.pos, this.pos + size);
        this.pos += size;
        return this.finishToken(type, str);
      };
      var regexpUnicodeSupport = false;
      try {
        new RegExp("￿", "u");
        regexpUnicodeSupport = true;
      } catch (e) {}
      pp.readRegexp = function() {
        var escaped = undefined,
          inClass = undefined,
          start = this.pos;
        for (;;) {
          if (this.pos >= this.input.length) this.raise(start, "Unterminated regular expression");
          var ch = this.input.charAt(this.pos);
          if (lineBreak.test(ch)) this.raise(start, "Unterminated regular expression");
          if (!escaped) {
            if (ch === "[") inClass = true;
            else if (ch === "]" && inClass) inClass = false;
            else if (ch === "/" && !inClass) break;
            escaped = ch === "\\";
          } else escaped = false;
          ++this.pos;
        }
        var content = this.input.slice(start, this.pos);
        ++this.pos;
        var mods = this.readWord1();
        var tmp = content;
        if (mods) {
          var validFlags = /^[gmsiy]*$/;
          if (this.options.ecmaVersion >= 6) validFlags = /^[gmsiyu]*$/;
          if (!validFlags.test(mods)) this.raise(start, "Invalid regular expression flag");
          if (mods.indexOf("u") >= 0 && !regexpUnicodeSupport) {
            tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|\\u\{([0-9a-fA-F]+)\}|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
          }
        }
        try {
          new RegExp(tmp);
        } catch (e) {
          if (e instanceof SyntaxError) this.raise(start, "Error parsing regular expression: " + e.message);
          this.raise(e);
        }
        var value = undefined;
        try {
          value = new RegExp(content, mods);
        } catch (err) {
          value = null;
        }
        return this.finishToken(tt.regexp, {
          pattern: content,
          flags: mods,
          value: value
        });
      };
      pp.readInt = function(radix, len) {
        var start = this.pos,
          total = 0;
        for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
          var code = this.input.charCodeAt(this.pos),
            val = undefined;
          if (code >= 97) val = code - 97 + 10;
          else if (code >= 65) val = code - 65 + 10;
          else if (code >= 48 && code <= 57) val = code - 48;
          else val = Infinity;
          if (val >= radix) break;
          ++this.pos;
          total = total * radix + val;
        }
        if (this.pos === start || len != null && this.pos - start !== len) return null;
        return total;
      };
      pp.readRadixNumber = function(radix) {
        this.pos += 2;
        var val = this.readInt(radix);
        if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix);
        if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
        return this.finishToken(tt.num, val);
      };
      pp.readNumber = function(startsWithDot) {
        var start = this.pos,
          isFloat = false,
          octal = this.input.charCodeAt(this.pos) === 48;
        if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number");
        if (this.input.charCodeAt(this.pos) === 46) {
          ++this.pos;
          this.readInt(10);
          isFloat = true;
        }
        var next = this.input.charCodeAt(this.pos);
        if (next === 69 || next === 101) {
          next = this.input.charCodeAt(++this.pos);
          if (next === 43 || next === 45) ++this.pos;
          if (this.readInt(10) === null) this.raise(start, "Invalid number");
          isFloat = true;
        }
        if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
        var str = this.input.slice(start, this.pos),
          val = undefined;
        if (isFloat) val = parseFloat(str);
        else if (!octal || str.length === 1) val = parseInt(str, 10);
        else if (/[89]/.test(str) || this.strict) this.raise(start, "Invalid number");
        else val = parseInt(str, 8);
        return this.finishToken(tt.num, val);
      };
      pp.readCodePoint = function() {
        var ch = this.input.charCodeAt(this.pos),
          code = undefined;
        if (ch === 123) {
          if (this.options.ecmaVersion < 6) this.unexpected();
          ++this.pos;
          code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
          ++this.pos;
          if (code > 1114111) this.unexpected();
        } else {
          code = this.readHexChar(4);
        }
        return code;
      };

      function codePointToString(code) {
        if (code <= 65535) {
          return String.fromCharCode(code);
        }
        return String.fromCharCode((code - 65536 >> 10) + 55296, (code - 65536 & 1023) + 56320);
      }
      pp.readString = function(quote) {
        var out = "",
          chunkStart = ++this.pos;
        for (;;) {
          if (this.pos >= this.input.length) this.raise(this.start, "Unterminated string constant");
          var ch = this.input.charCodeAt(this.pos);
          if (ch === quote) break;
          if (ch === 92) {
            out += this.input.slice(chunkStart, this.pos);
            out += this.readEscapedChar();
            chunkStart = this.pos;
          } else {
            if (isNewLine(ch)) this.raise(this.start, "Unterminated string constant");
            ++this.pos;
          }
        }
        out += this.input.slice(chunkStart, this.pos++);
        return this.finishToken(tt.string, out);
      };
      pp.readTmplToken = function() {
        var out = "",
          chunkStart = this.pos;
        for (;;) {
          if (this.pos >= this.input.length) this.raise(this.start, "Unterminated template");
          var ch = this.input.charCodeAt(this.pos);
          if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
            if (this.pos === this.start && this.type === tt.template) {
              if (ch === 36) {
                this.pos += 2;
                return this.finishToken(tt.dollarBraceL);
              } else {
                ++this.pos;
                return this.finishToken(tt.backQuote);
              }
            }
            out += this.input.slice(chunkStart, this.pos);
            return this.finishToken(tt.template, out);
          }
          if (ch === 92) {
            out += this.input.slice(chunkStart, this.pos);
            out += this.readEscapedChar();
            chunkStart = this.pos;
          } else if (isNewLine(ch)) {
            out += this.input.slice(chunkStart, this.pos);
            ++this.pos;
            if (ch === 13 && this.input.charCodeAt(this.pos) === 10) {
              ++this.pos;
              out += "\n";
            } else {
              out += String.fromCharCode(ch);
            }
            if (this.options.locations) {
              ++this.curLine;
              this.lineStart = this.pos;
            }
            chunkStart = this.pos;
          } else {
            ++this.pos;
          }
        }
      };
      pp.readEscapedChar = function() {
        var ch = this.input.charCodeAt(++this.pos);
        var octal = /^[0-7]+/.exec(this.input.slice(this.pos, this.pos + 3));
        if (octal) octal = octal[0];
        while (octal && parseInt(octal, 8) > 255) octal = octal.slice(0, -1);
        if (octal === "0") octal = null;
        ++this.pos;
        if (octal) {
          if (this.strict) this.raise(this.pos - 2, "Octal literal in strict mode");
          this.pos += octal.length - 1;
          return String.fromCharCode(parseInt(octal, 8));
        } else {
          switch (ch) {
            case 110:
              return "\n";
            case 114:
              return "\r";
            case 120:
              return String.fromCharCode(this.readHexChar(2));
            case 117:
              return codePointToString(this.readCodePoint());
            case 116:
              return "\t";
            case 98:
              return "\b";
            case 118:
              return "\u000b";
            case 102:
              return "\f";
            case 48:
              return "\u0000";
            case 13:
              if (this.input.charCodeAt(this.pos) === 10) ++this.pos;
            case 10:
              if (this.options.locations) {
                this.lineStart = this.pos;
                ++this.curLine;
              }
              return "";
            default:
              return String.fromCharCode(ch);
          }
        }
      };
      pp.readHexChar = function(len) {
        var n = this.readInt(16, len);
        if (n === null) this.raise(this.start, "Bad character escape sequence");
        return n;
      };
      var containsEsc;
      pp.readWord1 = function() {
        containsEsc = false;
        var word = "",
          first = true,
          chunkStart = this.pos;
        var astral = this.options.ecmaVersion >= 6;
        while (this.pos < this.input.length) {
          var ch = this.fullCharCodeAtPos();
          if (isIdentifierChar(ch, astral)) {
            this.pos += ch <= 65535 ? 1 : 2;
          } else if (ch === 92) {
            containsEsc = true;
            word += this.input.slice(chunkStart, this.pos);
            var escStart = this.pos;
            if (this.input.charCodeAt(++this.pos) != 117)
              this.raise(this.pos, "Expecting Unicode escape sequence \\uXXXX");
            ++this.pos;
            var esc = this.readCodePoint();
            if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) this.raise(escStart, "Invalid Unicode escape");
            word += codePointToString(esc);
            chunkStart = this.pos;
          } else {
            break;
          }
          first = false;
        }
        return word + this.input.slice(chunkStart, this.pos);
      };
      pp.readWord = function() {
        var word = this.readWord1();
        var type = tt.name;
        if ((this.options.ecmaVersion >= 6 || !containsEsc) && this.isKeyword(word)) type = keywordTypes[word];
        return this.finishToken(type, word);
      };
    }, {
      "./identifier": 3,
      "./location": 4,
      "./state": 9,
      "./tokentype": 13,
      "./whitespace": 15
    }],
    13: [function(_dereq_, module, exports) {
      "use strict";
      var _classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      };
      exports.__esModule = true;
      var TokenType = exports.TokenType = function TokenType(label) {
        var conf = arguments[1] === undefined ? {} : arguments[1];
        _classCallCheck(this, TokenType);
        this.label = label;
        this.keyword = conf.keyword;
        this.beforeExpr = !!conf.beforeExpr;
        this.startsExpr = !!conf.startsExpr;
        this.isLoop = !!conf.isLoop;
        this.isAssign = !!conf.isAssign;
        this.prefix = !!conf.prefix;
        this.postfix = !!conf.postfix;
        this.binop = conf.binop || null;
        this.updateContext = null;
      };

      function binop(name, prec) {
        return new TokenType(name, {
          beforeExpr: true,
          binop: prec
        });
      }
      var beforeExpr = {
          beforeExpr: true
        },
        startsExpr = {
          startsExpr: true
        };
      var types = {
        num: new TokenType("num", startsExpr),
        regexp: new TokenType("regexp", startsExpr),
        string: new TokenType("string", startsExpr),
        name: new TokenType("name", startsExpr),
        eof: new TokenType("eof"),
        bracketL: new TokenType("[", {
          beforeExpr: true,
          startsExpr: true
        }),
        bracketR: new TokenType("]"),
        braceL: new TokenType("{", {
          beforeExpr: true,
          startsExpr: true
        }),
        braceR: new TokenType("}"),
        parenL: new TokenType("(", {
          beforeExpr: true,
          startsExpr: true
        }),
        parenR: new TokenType(")"),
        comma: new TokenType(",", beforeExpr),
        semi: new TokenType(";", beforeExpr),
        colon: new TokenType(":", beforeExpr),
        dot: new TokenType("."),
        question: new TokenType("?", beforeExpr),
        arrow: new TokenType("=>", beforeExpr),
        template: new TokenType("template"),
        ellipsis: new TokenType("...", beforeExpr),
        backQuote: new TokenType("`", startsExpr),
        dollarBraceL: new TokenType("$\{", {
          beforeExpr: true,
          startsExpr: true
        }),
        eq: new TokenType("=", {
          beforeExpr: true,
          isAssign: true
        }),
        assign: new TokenType("_=", {
          beforeExpr: true,
          isAssign: true
        }),
        incDec: new TokenType("++/--", {
          prefix: true,
          postfix: true,
          startsExpr: true
        }),
        prefix: new TokenType("prefix", {
          beforeExpr: true,
          prefix: true,
          startsExpr: true
        }),
        logicalOR: binop("||", 1),
        logicalAND: binop("&&", 2),
        bitwiseOR: binop("|", 3),
        bitwiseXOR: binop("^", 4),
        bitwiseAND: binop("&", 5),
        equality: binop("==/!=", 6),
        relational: binop("</>", 7),
        bitShift: binop("<</>>", 8),
        plusMin: new TokenType("+/-", {
          beforeExpr: true,
          binop: 9,
          prefix: true,
          startsExpr: true
        }),
        modulo: binop("%", 10),
        star: binop("*", 10),
        slash: binop("/", 10)
      };
      exports.types = types;
      var keywords = {};
      exports.keywords = keywords;

      function kw(name) {
        var options = arguments[1] === undefined ? {} : arguments[1];
        options.keyword = name;
        keywords[name] = types["_" + name] = new TokenType(name, options);
      }
      kw("break");
      kw("case", beforeExpr);
      kw("catch");
      kw("continue");
      kw("debugger");
      kw("default");
      kw("do", {
        isLoop: true
      });
      kw("else", beforeExpr);
      kw("finally");
      kw("for", {
        isLoop: true
      });
      kw("function", startsExpr);
      kw("if");
      kw("return", beforeExpr);
      kw("switch");
      kw("throw", beforeExpr);
      kw("try");
      kw("var");
      kw("let");
      kw("const");
      kw("while", {
        isLoop: true
      });
      kw("with");
      kw("new", {
        beforeExpr: true,
        startsExpr: true
      });
      kw("this", startsExpr);
      kw("super", startsExpr);
      kw("class");
      kw("extends", beforeExpr);
      kw("export");
      kw("import");
      kw("yield", {
        beforeExpr: true,
        startsExpr: true
      });
      kw("null", startsExpr);
      kw("true", startsExpr);
      kw("false", startsExpr);
      kw("in", {
        beforeExpr: true,
        binop: 7
      });
      kw("instanceof", {
        beforeExpr: true,
        binop: 7
      });
      kw("typeof", {
        beforeExpr: true,
        prefix: true,
        startsExpr: true
      });
      kw("void", {
        beforeExpr: true,
        prefix: true,
        startsExpr: true
      });
      kw("delete", {
        beforeExpr: true,
        prefix: true,
        startsExpr: true
      });
    }, {}],
    14: [function(_dereq_, module, exports) {
      "use strict";
      exports.isArray = isArray;
      exports.has = has;
      exports.__esModule = true;

      function isArray(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
      }

      function has(obj, propName) {
        return Object.prototype.hasOwnProperty.call(obj, propName);
      }
    }, {}],
    15: [function(_dereq_, module, exports) {
      "use strict";
      exports.isNewLine = isNewLine;
      exports.__esModule = true;
      var lineBreak = /\r\n?|\n|\u2028|\u2029/;
      exports.lineBreak = lineBreak;
      var lineBreakG = new RegExp(lineBreak.source, "g");
      exports.lineBreakG = lineBreakG;

      function isNewLine(code) {
        return code === 10 || code === 13 || code === 8232 || code == 8233;
      }
      var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
      exports.nonASCIIwhitespace = nonASCIIwhitespace;
    }, {}]
  }, {}, [1])(1)
});;
/*! RESOURCE: /scripts/lib/acorn/dist/acorn_loose.js */
(function(f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f()
  } else if (typeof define === "function" && define.amd) {
    define([], f)
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window
    } else if (typeof global !== "undefined") {
      g = global
    } else if (typeof self !== "undefined") {
      g = self
    } else {
      g = this
    }(g.acorn || (g.acorn = {})).loose = f()
  }
})(function() {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f
        }
        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e)
        }, l, l.exports, e, t, n, r)
      }
      return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
  })({
    1: [function(_dereq_, module, exports) {
      "use strict";
      var _interopRequireWildcard = function(obj) {
        return obj && obj.__esModule ? obj : {
          "default": obj
        };
      };
      exports.parse_dammit = parse_dammit;
      exports.__esModule = true;
      var acorn = _interopRequireWildcard(_dereq_(".."));
      var _state = _dereq_("./state");
      var LooseParser = _state.LooseParser;
      _dereq_("./tokenize");
      _dereq_("./parseutil");
      _dereq_("./statement");
      _dereq_("./expression");
      exports.LooseParser = _state.LooseParser;
      acorn.defaultOptions.tabSize = 4;

      function parse_dammit(input, options) {
        var p = new LooseParser(input, options);
        p.next();
        return p.parseTopLevel();
      }
      acorn.parse_dammit = parse_dammit;
      acorn.LooseParser = LooseParser;
    }, {
      "..": 2,
      "./expression": 3,
      "./parseutil": 4,
      "./state": 5,
      "./statement": 6,
      "./tokenize": 7
    }],
    2: [function(_dereq_, module, exports) {
      "use strict";
      module.exports = typeof acorn != "undefined" ? acorn : _dereq_("./acorn");
    }, {}],
    3: [function(_dereq_, module, exports) {
      "use strict";
      var LooseParser = _dereq_("./state").LooseParser;
      var isDummy = _dereq_("./parseutil").isDummy;
      var tt = _dereq_("..").tokTypes;
      var lp = LooseParser.prototype;
      lp.checkLVal = function(expr, binding) {
        if (!expr) return expr;
        switch (expr.type) {
          case "Identifier":
            return expr;
          case "MemberExpression":
            return binding ? this.dummyIdent() : expr;
          case "ParenthesizedExpression":
            expr.expression = this.checkLVal(expr.expression, binding);
            return expr;
          case "ObjectPattern":
          case "ArrayPattern":
          case "RestElement":
          case "AssignmentPattern":
            if (this.options.ecmaVersion >= 6) return expr;
          default:
            return this.dummyIdent();
        }
      };
      lp.parseExpression = function(noIn) {
        var start = this.storeCurrentPos();
        var expr = this.parseMaybeAssign(noIn);
        if (this.tok.type === tt.comma) {
          var node = this.startNodeAt(start);
          node.expressions = [expr];
          while (this.eat(tt.comma)) node.expressions.push(this.parseMaybeAssign(noIn));
          return this.finishNode(node, "SequenceExpression");
        }
        return expr;
      };
      lp.parseParenExpression = function() {
        this.pushCx();
        this.expect(tt.parenL);
        var val = this.parseExpression();
        this.popCx();
        this.expect(tt.parenR);
        return val;
      };
      lp.parseMaybeAssign = function(noIn) {
        var start = this.storeCurrentPos();
        var left = this.parseMaybeConditional(noIn);
        if (this.tok.type.isAssign) {
          var node = this.startNodeAt(start);
          node.operator = this.tok.value;
          node.left = this.tok.type === tt.eq ? this.toAssignable(left) : this.checkLVal(left);
          this.next();
          node.right = this.parseMaybeAssign(noIn);
          return this.finishNode(node, "AssignmentExpression");
        }
        return left;
      };
      lp.parseMaybeConditional = function(noIn) {
        var start = this.storeCurrentPos();
        var expr = this.parseExprOps(noIn);
        if (this.eat(tt.question)) {
          var node = this.startNodeAt(start);
          node.test = expr;
          node.consequent = this.parseMaybeAssign();
          node.alternate = this.expect(tt.colon) ? this.parseMaybeAssign(noIn) : this.dummyIdent();
          return this.finishNode(node, "ConditionalExpression");
        }
        return expr;
      };
      lp.parseExprOps = function(noIn) {
        var start = this.storeCurrentPos();
        var indent = this.curIndent,
          line = this.curLineStart;
        return this.parseExprOp(this.parseMaybeUnary(noIn), start, -1, noIn, indent, line);
      };
      lp.parseExprOp = function(left, start, minPrec, noIn, indent, line) {
        if (this.curLineStart != line && this.curIndent < indent && this.tokenStartsLine()) return left;
        var prec = this.tok.type.binop;
        if (prec != null && (!noIn || this.tok.type !== tt._in)) {
          if (prec > minPrec) {
            var node = this.startNodeAt(start);
            node.left = left;
            node.operator = this.tok.value;
            this.next();
            if (this.curLineStart != line && this.curIndent < indent && this.tokenStartsLine()) {
              node.right = this.dummyIdent();
            } else {
              var rightStart = this.storeCurrentPos();
              node.right = this.parseExprOp(this.parseMaybeUnary(noIn), rightStart, prec, noIn, indent, line);
            }
            this.finishNode(node, /&&|\|\|/.test(node.operator) ? "LogicalExpression" : "BinaryExpression");
            return this.parseExprOp(node, start, minPrec, noIn, indent, line);
          }
        }
        return left;
      };
      lp.parseMaybeUnary = function(noIn) {
        if (this.tok.type.prefix) {
          var node = this.startNode(),
            update = this.tok.type === tt.incDec;
          node.operator = this.tok.value;
          node.prefix = true;
          this.next();
          node.argument = this.parseMaybeUnary(noIn);
          if (update) node.argument = this.checkLVal(node.argument);
          return this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
        } else if (this.tok.type === tt.ellipsis) {
          var node = this.startNode();
          this.next();
          node.argument = this.parseMaybeUnary(noIn);
          return this.finishNode(node, "SpreadElement");
        }
        var start = this.storeCurrentPos();
        var expr = this.parseExprSubscripts();
        while (this.tok.type.postfix && !this.canInsertSemicolon()) {
          var node = this.startNodeAt(start);
          node.operator = this.tok.value;
          node.prefix = false;
          node.argument = this.checkLVal(expr);
          this.next();
          expr = this.finishNode(node, "UpdateExpression");
        }
        return expr;
      };
      lp.parseExprSubscripts = function() {
        var start = this.storeCurrentPos();
        return this.parseSubscripts(this.parseExprAtom(), start, false, this.curIndent, this.curLineStart);
      };
      lp.parseSubscripts = function(base, start, noCalls, startIndent, line) {
        for (;;) {
          if (this.curLineStart != line && this.curIndent <= startIndent && this.tokenStartsLine()) {
            if (this.tok.type == tt.dot && this.curIndent == startIndent) --startIndent;
            else return base;
          }
          if (this.eat(tt.dot)) {
            var node = this.startNodeAt(start);
            node.object = base;
            if (this.curLineStart != line && this.curIndent <= startIndent && this.tokenStartsLine()) node.property = this.dummyIdent();
            else node.property = this.parsePropertyAccessor() || this.dummyIdent();
            node.computed = false;
            base = this.finishNode(node, "MemberExpression");
          } else if (this.tok.type == tt.bracketL) {
            this.pushCx();
            this.next();
            var node = this.startNodeAt(start);
            node.object = base;
            node.property = this.parseExpression();
            node.computed = true;
            this.popCx();
            this.expect(tt.bracketR);
            base = this.finishNode(node, "MemberExpression");
          } else if (!noCalls && this.tok.type == tt.parenL) {
            var node = this.startNodeAt(start);
            node.callee = base;
            node.arguments = this.parseExprList(tt.parenR);
            base = this.finishNode(node, "CallExpression");
          } else if (this.tok.type == tt.backQuote) {
            var node = this.startNodeAt(start);
            node.tag = base;
            node.quasi = this.parseTemplate();
            base = this.finishNode(node, "TaggedTemplateExpression");
          } else {
            return base;
          }
        }
      };
      lp.parseExprAtom = function() {
        var node = undefined;
        switch (this.tok.type) {
          case tt._this:
          case tt._super:
            var type = this.tok.type === tt._this ? "ThisExpression" : "Super";
            node = this.startNode();
            this.next();
            return this.finishNode(node, type);
          case tt.name:
            var start = this.storeCurrentPos();
            var id = this.parseIdent();
            return this.eat(tt.arrow) ? this.parseArrowExpression(this.startNodeAt(start), [id]) : id;
          case tt.regexp:
            node = this.startNode();
            var val = this.tok.value;
            node.regex = {
              pattern: val.pattern,
              flags: val.flags
            };
            node.value = val.value;
            node.raw = this.input.slice(this.tok.start, this.tok.end);
            this.next();
            return this.finishNode(node, "Literal");
          case tt.num:
          case tt.string:
            node = this.startNode();
            node.value = this.tok.value;
            node.raw = this.input.slice(this.tok.start, this.tok.end);
            this.next();
            return this.finishNode(node, "Literal");
          case tt._null:
          case tt._true:
          case tt._false:
            node = this.startNode();
            node.value = this.tok.type === tt._null ? null : this.tok.type === tt._true;
            node.raw = this.tok.type.keyword;
            this.next();
            return this.finishNode(node, "Literal");
          case tt.parenL:
            var parenStart = this.storeCurrentPos();
            this.next();
            var inner = this.parseExpression();
            this.expect(tt.parenR);
            if (this.eat(tt.arrow)) {
              return this.parseArrowExpression(this.startNodeAt(parenStart), inner.expressions || (isDummy(inner) ? [] : [inner]));
            }
            if (this.options.preserveParens) {
              var par = this.startNodeAt(parenStart);
              par.expression = inner;
              inner = this.finishNode(par, "ParenthesizedExpression");
            }
            return inner;
          case tt.bracketL:
            node = this.startNode();
            node.elements = this.parseExprList(tt.bracketR, true);
            return this.finishNode(node, "ArrayExpression");
          case tt.braceL:
            return this.parseObj();
          case tt._class:
            return this.parseClass();
          case tt._function:
            node = this.startNode();
            this.next();
            return this.parseFunction(node, false);
          case tt._new:
            return this.parseNew();
          case tt._yield:
            node = this.startNode();
            this.next();
            if (this.semicolon() || this.canInsertSemicolon() || this.tok.type != tt.star && !this.tok.type.startsExpr) {
              node.delegate = false;
              node.argument = null;
            } else {
              node.delegate = this.eat(tt.star);
              node.argument = this.parseMaybeAssign();
            }
            return this.finishNode(node, "YieldExpression");
          case tt.backQuote:
            return this.parseTemplate();
          default:
            return this.dummyIdent();
        }
      };
      lp.parseNew = function() {
        var node = this.startNode(),
          startIndent = this.curIndent,
          line = this.curLineStart;
        var meta = this.parseIdent(true);
        if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
          node.meta = meta;
          node.property = this.parseIdent(true);
          return this.finishNode(node, "MetaProperty");
        }
        var start = this.storeCurrentPos();
        node.callee = this.parseSubscripts(this.parseExprAtom(), start, true, startIndent, line);
        if (this.tok.type == tt.parenL) {
          node.arguments = this.parseExprList(tt.parenR);
        } else {
          node.arguments = [];
        }
        return this.finishNode(node, "NewExpression");
      };
      lp.parseTemplateElement = function() {
        var elem = this.startNode();
        elem.value = {
          raw: this.input.slice(this.tok.start, this.tok.end),
          cooked: this.tok.value
        };
        this.next();
        elem.tail = this.tok.type === tt.backQuote;
        return this.finishNode(elem, "TemplateElement");
      };
      lp.parseTemplate = function() {
        var node = this.startNode();
        this.next();
        node.expressions = [];
        var curElt = this.parseTemplateElement();
        node.quasis = [curElt];
        while (!curElt.tail) {
          this.next();
          node.expressions.push(this.parseExpression());
          if (this.expect(tt.braceR)) {
            curElt = this.parseTemplateElement();
          } else {
            curElt = this.startNode();
            curElt.value = {
              cooked: "",
              raw: ""
            };
            curElt.tail = true;
          }
          node.quasis.push(curElt);
        }
        this.expect(tt.backQuote);
        return this.finishNode(node, "TemplateLiteral");
      };
      lp.parseObj = function() {
        var node = this.startNode();
        node.properties = [];
        this.pushCx();
        var indent = this.curIndent + 1,
          line = this.curLineStart;
        this.eat(tt.braceL);
        if (this.curIndent + 1 < indent) {
          indent = this.curIndent;
          line = this.curLineStart;
        }
        while (!this.closes(tt.braceR, indent, line)) {
          var prop = this.startNode(),
            isGenerator = undefined,
            start = undefined;
          if (this.options.ecmaVersion >= 6) {
            start = this.storeCurrentPos();
            prop.method = false;
            prop.shorthand = false;
            isGenerator = this.eat(tt.star);
          }
          this.parsePropertyName(prop);
          if (isDummy(prop.key)) {
            if (isDummy(this.parseMaybeAssign())) this.next();
            this.eat(tt.comma);
            continue;
          }
          if (this.eat(tt.colon)) {
            prop.kind = "init";
            prop.value = this.parseMaybeAssign();
          } else if (this.options.ecmaVersion >= 6 && (this.tok.type === tt.parenL || this.tok.type === tt.braceL)) {
            prop.kind = "init";
            prop.method = true;
            prop.value = this.parseMethod(isGenerator);
          } else if (this.options.ecmaVersion >= 5 && prop.key.type === "Identifier" && !prop.computed && (prop.key.name === "get" || prop.key.name === "set") && (this.tok.type != tt.comma && this.tok.type != tt.braceR)) {
            prop.kind = prop.key.name;
            this.parsePropertyName(prop);
            prop.value = this.parseMethod(false);
          } else {
            prop.kind = "init";
            if (this.options.ecmaVersion >= 6) {
              if (this.eat(tt.eq)) {
                var assign = this.startNodeAt(start);
                assign.operator = "=";
                assign.left = prop.key;
                assign.right = this.parseMaybeAssign();
                prop.value = this.finishNode(assign, "AssignmentExpression");
              } else {
                prop.value = prop.key;
              }
            } else {
              prop.value = this.dummyIdent();
            }
            prop.shorthand = true;
          }
          node.properties.push(this.finishNode(prop, "Property"));
          this.eat(tt.comma);
        }
        this.popCx();
        if (!this.eat(tt.braceR)) {
          this.last.end = this.tok.start;
          if (this.options.locations) this.last.loc.end = this.tok.loc.start;
        }
        return this.finishNode(node, "ObjectExpression");
      };
      lp.parsePropertyName = function(prop) {
        if (this.options.ecmaVersion >= 6) {
          if (this.eat(tt.bracketL)) {
            prop.computed = true;
            prop.key = this.parseExpression();
            this.expect(tt.bracketR);
            return;
          } else {
            prop.computed = false;
          }
        }
        var key = this.tok.type === tt.num || this.tok.type === tt.string ? this.parseExprAtom() : this.parseIdent();
        prop.key = key || this.dummyIdent();
      };
      lp.parsePropertyAccessor = function() {
        if (this.tok.type === tt.name || this.tok.type.keyword) return this.parseIdent();
      };
      lp.parseIdent = function() {
        var name = this.tok.type === tt.name ? this.tok.value : this.tok.type.keyword;
        if (!name) return this.dummyIdent();
        var node = this.startNode();
        this.next();
        node.name = name;
        return this.finishNode(node, "Identifier");
      };
      lp.initFunction = function(node) {
        node.id = null;
        node.params = [];
        if (this.options.ecmaVersion >= 6) {
          node.generator = false;
          node.expression = false;
        }
      };
      lp.toAssignable = function(node, binding) {
        if (this.options.ecmaVersion >= 6 && node) {
          switch (node.type) {
            case "ObjectExpression":
              node.type = "ObjectPattern";
              var props = node.properties;
              for (var i = 0; i < props.length; i++) {
                this.toAssignable(props[i].value, binding);
              }
              break;
            case "ArrayExpression":
              node.type = "ArrayPattern";
              this.toAssignableList(node.elements, binding);
              break;
            case "SpreadElement":
              node.type = "RestElement";
              node.argument = this.toAssignable(node.argument, binding);
              break;
            case "AssignmentExpression":
              node.type = "AssignmentPattern";
              break;
          }
        }
        return this.checkLVal(node, binding);
      };
      lp.toAssignableList = function(exprList, binding) {
        for (var i = 0; i < exprList.length; i++) {
          exprList[i] = this.toAssignable(exprList[i], binding);
        }
        return exprList;
      };
      lp.parseFunctionParams = function(params) {
        params = this.parseExprList(tt.parenR);
        return this.toAssignableList(params, true);
      };
      lp.parseMethod = function(isGenerator) {
        var node = this.startNode();
        this.initFunction(node);
        node.params = this.parseFunctionParams();
        node.generator = isGenerator || false;
        node.expression = this.options.ecmaVersion >= 6 && this.tok.type !== tt.braceL;
        node.body = node.expression ? this.parseMaybeAssign() : this.parseBlock();
        return this.finishNode(node, "FunctionExpression");
      };
      lp.parseArrowExpression = function(node, params) {
        this.initFunction(node);
        node.params = this.toAssignableList(params, true);
        node.expression = this.tok.type !== tt.braceL;
        node.body = node.expression ? this.parseMaybeAssign() : this.parseBlock();
        return this.finishNode(node, "ArrowFunctionExpression");
      };
      lp.parseExprList = function(close, allowEmpty) {
        this.pushCx();
        var indent = this.curIndent,
          line = this.curLineStart,
          elts = [];
        this.next();
        while (!this.closes(close, indent + 1, line)) {
          if (this.eat(tt.comma)) {
            elts.push(allowEmpty ? null : this.dummyIdent());
            continue;
          }
          var elt = this.parseMaybeAssign();
          if (isDummy(elt)) {
            if (this.closes(close, indent, line)) break;
            this.next();
          } else {
            elts.push(elt);
          }
          this.eat(tt.comma);
        }
        this.popCx();
        if (!this.eat(close)) {
          this.last.end = this.tok.start;
          if (this.options.locations) this.last.loc.end = this.tok.loc.start;
        }
        return elts;
      };
    }, {
      "..": 2,
      "./parseutil": 4,
      "./state": 5
    }],
    4: [function(_dereq_, module, exports) {
      "use strict";
      exports.isDummy = isDummy;
      exports.__esModule = true;
      var LooseParser = _dereq_("./state").LooseParser;
      var _ = _dereq_("..");
      var Node = _.Node;
      var SourceLocation = _.SourceLocation;
      var lineBreak = _.lineBreak;
      var isNewLine = _.isNewLine;
      var tt = _.tokTypes;
      var lp = LooseParser.prototype;
      lp.startNode = function() {
        var node = new Node();
        node.start = this.tok.start;
        if (this.options.locations) node.loc = new SourceLocation(this.toks, this.tok.loc.start);
        if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
        if (this.options.ranges) node.range = [this.tok.start, 0];
        return node;
      };
      lp.storeCurrentPos = function() {
        return this.options.locations ? [this.tok.start, this.tok.loc.start] : this.tok.start;
      };
      lp.startNodeAt = function(pos) {
        var node = new Node();
        if (this.options.locations) {
          node.start = pos[0];
          node.loc = new SourceLocation(this.toks, pos[1]);
          pos = pos[0];
        } else {
          node.start = pos;
        }
        if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
        if (this.options.ranges) node.range = [pos, 0];
        return node;
      };
      lp.finishNode = function(node, type) {
        node.type = type;
        node.end = this.last.end;
        if (this.options.locations) node.loc.end = this.last.loc.end;
        if (this.options.ranges) node.range[1] = this.last.end;
        return node;
      };
      lp.dummyIdent = function() {
        var dummy = this.startNode();
        dummy.name = "✖";
        return this.finishNode(dummy, "Identifier");
      };

      function isDummy(node) {
        return node.name == "✖";
      }
      lp.eat = function(type) {
        if (this.tok.type === type) {
          this.next();
          return true;
        } else {
          return false;
        }
      };
      lp.isContextual = function(name) {
        return this.tok.type === tt.name && this.tok.value === name;
      };
      lp.eatContextual = function(name) {
        return this.tok.value === name && this.eat(tt.name);
      };
      lp.canInsertSemicolon = function() {
        return this.tok.type === tt.eof || this.tok.type === tt.braceR || lineBreak.test(this.input.slice(this.last.end, this.tok.start));
      };
      lp.semicolon = function() {
        return this.eat(tt.semi);
      };
      lp.expect = function(type) {
        if (this.eat(type)) return true;
        for (var i = 1; i <= 2; i++) {
          if (this.lookAhead(i).type == type) {
            for (var j = 0; j < i; j++) {
              this.next();
            }
            return true;
          }
        }
      };
      lp.pushCx = function() {
        this.context.push(this.curIndent);
      };
      lp.popCx = function() {
        this.curIndent = this.context.pop();
      };
      lp.lineEnd = function(pos) {
        while (pos < this.input.length && !isNewLine(this.input.charCodeAt(pos))) ++pos;
        return pos;
      };
      lp.indentationAfter = function(pos) {
        for (var count = 0;; ++pos) {
          var ch = this.input.charCodeAt(pos);
          if (ch === 32) ++count;
          else if (ch === 9) count += this.options.tabSize;
          else return count;
        }
      };
      lp.closes = function(closeTok, indent, line, blockHeuristic) {
        if (this.tok.type === closeTok || this.tok.type === tt.eof) return true;
        return line != this.curLineStart && this.curIndent < indent && this.tokenStartsLine() && (!blockHeuristic || this.nextLineStart >= this.input.length || this.indentationAfter(this.nextLineStart) < indent);
      };
      lp.tokenStartsLine = function() {
        for (var p = this.tok.start - 1; p >= this.curLineStart; --p) {
          var ch = this.input.charCodeAt(p);
          if (ch !== 9 && ch !== 32) return false;
        }
        return true;
      };
    }, {
      "..": 2,
      "./state": 5
    }],
    5: [function(_dereq_, module, exports) {
      "use strict";
      exports.LooseParser = LooseParser;
      exports.__esModule = true;
      var _ = _dereq_("..");
      var tokenizer = _.tokenizer;
      var SourceLocation = _.SourceLocation;
      var tt = _.tokTypes;

      function LooseParser(input, options) {
        this.toks = tokenizer(input, options);
        this.options = this.toks.options;
        this.input = this.toks.input;
        this.tok = this.last = {
          type: tt.eof,
          start: 0,
          end: 0
        };
        if (this.options.locations) {
          var here = this.toks.curPosition();
          this.tok.loc = new SourceLocation(this.toks, here, here);
        }
        this.ahead = [];
        this.context = [];
        this.curIndent = 0;
        this.curLineStart = 0;
        this.nextLineStart = this.lineEnd(this.curLineStart) + 1;
      }
    }, {
      "..": 2
    }],
    6: [function(_dereq_, module, exports) {
      "use strict";
      var LooseParser = _dereq_("./state").LooseParser;
      var isDummy = _dereq_("./parseutil").isDummy;
      var _ = _dereq_("..");
      var getLineInfo = _.getLineInfo;
      var tt = _.tokTypes;
      var lp = LooseParser.prototype;
      lp.parseTopLevel = function() {
        var node = this.startNodeAt(this.options.locations ? [0, getLineInfo(this.input, 0)] : 0);
        node.body = [];
        while (this.tok.type !== tt.eof) node.body.push(this.parseStatement());
        this.last = this.tok;
        if (this.options.ecmaVersion >= 6) {
          node.sourceType = this.options.sourceType;
        }
        return this.finishNode(node, "Program");
      };
      lp.parseStatement = function() {
        var starttype = this.tok.type,
          node = this.startNode();
        switch (starttype) {
          case tt._break:
          case tt._continue:
            this.next();
            var isBreak = starttype === tt._break;
            if (this.semicolon() || this.canInsertSemicolon()) {
              node.label = null;
            } else {
              node.label = this.tok.type === tt.name ? this.parseIdent() : null;
              this.semicolon();
            }
            return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
          case tt._debugger:
            this.next();
            this.semicolon();
            return this.finishNode(node, "DebuggerStatement");
          case tt._do:
            this.next();
            node.body = this.parseStatement();
            node.test = this.eat(tt._while) ? this.parseParenExpression() : this.dummyIdent();
            this.semicolon();
            return this.finishNode(node, "DoWhileStatement");
          case tt._for:
            this.next();
            this.pushCx();
            this.expect(tt.parenL);
            if (this.tok.type === tt.semi) return this.parseFor(node, null);
            if (this.tok.type === tt._var || this.tok.type === tt._let || this.tok.type === tt._const) {
              var _init = this.parseVar(true);
              if (_init.declarations.length === 1 && (this.tok.type === tt._in || this.isContextual("of"))) {
                return this.parseForIn(node, _init);
              }
              return this.parseFor(node, _init);
            }
            var init = this.parseExpression(true);
            if (this.tok.type === tt._in || this.isContextual("of")) return this.parseForIn(node, this.toAssignable(init));
            return this.parseFor(node, init);
          case tt._function:
            this.next();
            return this.parseFunction(node, true);
          case tt._if:
            this.next();
            node.test = this.parseParenExpression();
            node.consequent = this.parseStatement();
            node.alternate = this.eat(tt._else) ? this.parseStatement() : null;
            return this.finishNode(node, "IfStatement");
          case tt._return:
            this.next();
            if (this.eat(tt.semi) || this.canInsertSemicolon()) node.argument = null;
            else {
              node.argument = this.parseExpression();
              this.semicolon();
            }
            return this.finishNode(node, "ReturnStatement");
          case tt._switch:
            var blockIndent = this.curIndent,
              line = this.curLineStart;
            this.next();
            node.discriminant = this.parseParenExpression();
            node.cases = [];
            this.pushCx();
            this.expect(tt.braceL);
            var cur = undefined;
            while (!this.closes(tt.braceR, blockIndent, line, true)) {
              if (this.tok.type === tt._case || this.tok.type === tt._default) {
                var isCase = this.tok.type === tt._case;
                if (cur) this.finishNode(cur, "SwitchCase");
                node.cases.push(cur = this.startNode());
                cur.consequent = [];
                this.next();
                if (isCase) cur.test = this.parseExpression();
                else cur.test = null;
                this.expect(tt.colon);
              } else {
                if (!cur) {
                  node.cases.push(cur = this.startNode());
                  cur.consequent = [];
                  cur.test = null;
                }
                cur.consequent.push(this.parseStatement());
              }
            }
            if (cur) this.finishNode(cur, "SwitchCase");
            this.popCx();
            this.eat(tt.braceR);
            return this.finishNode(node, "SwitchStatement");
          case tt._throw:
            this.next();
            node.argument = this.parseExpression();
            this.semicolon();
            return this.finishNode(node, "ThrowStatement");
          case tt._try:
            this.next();
            node.block = this.parseBlock();
            node.handler = null;
            if (this.tok.type === tt._catch) {
              var clause = this.startNode();
              this.next();
              this.expect(tt.parenL);
              clause.param = this.toAssignable(this.parseExprAtom(), true);
              this.expect(tt.parenR);
              clause.guard = null;
              clause.body = this.parseBlock();
              node.handler = this.finishNode(clause, "CatchClause");
            }
            node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null;
            if (!node.handler && !node.finalizer) return node.block;
            return this.finishNode(node, "TryStatement");
          case tt._var:
          case tt._let:
          case tt._const:
            return this.parseVar();
          case tt._while:
            this.next();
            node.test = this.parseParenExpression();
            node.body = this.parseStatement();
            return this.finishNode(node, "WhileStatement");
          case tt._with:
            this.next();
            node.object = this.parseParenExpression();
            node.body = this.parseStatement();
            return this.finishNode(node, "WithStatement");
          case tt.braceL:
            return this.parseBlock();
          case tt.semi:
            this.next();
            return this.finishNode(node, "EmptyStatement");
          case tt._class:
            return this.parseClass(true);
          case tt._import:
            return this.parseImport();
          case tt._export:
            return this.parseExport();
          default:
            var expr = this.parseExpression();
            if (isDummy(expr)) {
              this.next();
              if (this.tok.type === tt.eof) return this.finishNode(node, "EmptyStatement");
              return this.parseStatement();
            } else if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon)) {
              node.body = this.parseStatement();
              node.label = expr;
              return this.finishNode(node, "LabeledStatement");
            } else {
              node.expression = expr;
              this.semicolon();
              return this.finishNode(node, "ExpressionStatement");
            }
        }
      };
      lp.parseBlock = function() {
        var node = this.startNode();
        this.pushCx();
        this.expect(tt.braceL);
        var blockIndent = this.curIndent,
          line = this.curLineStart;
        node.body = [];
        while (!this.closes(tt.braceR, blockIndent, line, true)) node.body.push(this.parseStatement());
        this.popCx();
        this.eat(tt.braceR);
        return this.finishNode(node, "BlockStatement");
      };
      lp.parseFor = function(node, init) {
        node.init = init;
        node.test = node.update = null;
        if (this.eat(tt.semi) && this.tok.type !== tt.semi) node.test = this.parseExpression();
        if (this.eat(tt.semi) && this.tok.type !== tt.parenR) node.update = this.parseExpression();
        this.popCx();
        this.expect(tt.parenR);
        node.body = this.parseStatement();
        return this.finishNode(node, "ForStatement");
      };
      lp.parseForIn = function(node, init) {
        var type = this.tok.type === tt._in ? "ForInStatement" : "ForOfStatement";
        this.next();
        node.left = init;
        node.right = this.parseExpression();
        this.popCx();
        this.expect(tt.parenR);
        node.body = this.parseStatement();
        return this.finishNode(node, type);
      };
      lp.parseVar = function(noIn) {
        var node = this.startNode();
        node.kind = this.tok.type.keyword;
        this.next();
        node.declarations = [];
        do {
          var decl = this.startNode();
          decl.id = this.options.ecmaVersion >= 6 ? this.toAssignable(this.parseExprAtom(), true) : this.parseIdent();
          decl.init = this.eat(tt.eq) ? this.parseMaybeAssign(noIn) : null;
          node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
        } while (this.eat(tt.comma));
        if (!node.declarations.length) {
          var decl = this.startNode();
          decl.id = this.dummyIdent();
          node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
        }
        if (!noIn) this.semicolon();
        return this.finishNode(node, "VariableDeclaration");
      };
      lp.parseClass = function(isStatement) {
        var node = this.startNode();
        this.next();
        if (this.tok.type === tt.name) node.id = this.parseIdent();
        else if (isStatement) node.id = this.dummyIdent();
        else node.id = null;
        node.superClass = this.eat(tt._extends) ? this.parseExpression() : null;
        node.body = this.startNode();
        node.body.body = [];
        this.pushCx();
        var indent = this.curIndent + 1,
          line = this.curLineStart;
        this.eat(tt.braceL);
        if (this.curIndent + 1 < indent) {
          indent = this.curIndent;
          line = this.curLineStart;
        }
        while (!this.closes(tt.braceR, indent, line)) {
          if (this.semicolon()) continue;
          var method = this.startNode(),
            isGenerator = undefined;
          if (this.options.ecmaVersion >= 6) {
            method["static"] = false;
            isGenerator = this.eat(tt.star);
          }
          this.parsePropertyName(method);
          if (isDummy(method.key)) {
            if (isDummy(this.parseMaybeAssign())) this.next();
            this.eat(tt.comma);
            continue;
          }
          if (method.key.type === "Identifier" && !method.computed && method.key.name === "static" && (this.tok.type != tt.parenL && this.tok.type != tt.braceL)) {
            method["static"] = true;
            isGenerator = this.eat(tt.star);
            this.parsePropertyName(method);
          } else {
            method["static"] = false;
          }
          if (this.options.ecmaVersion >= 5 && method.key.type === "Identifier" && !method.computed && (method.key.name === "get" || method.key.name === "set") && this.tok.type !== tt.parenL && this.tok.type !== tt.braceL) {
            method.kind = method.key.name;
            this.parsePropertyName(method);
            method.value = this.parseMethod(false);
          } else {
            if (!method.computed && !method["static"] && !isGenerator && (method.key.type === "Identifier" && method.key.name === "constructor" || method.key.type === "Literal" && method.key.value === "constructor")) {
              method.kind = "constructor";
            } else {
              method.kind = "method";
            }
            method.value = this.parseMethod(isGenerator);
          }
          node.body.body.push(this.finishNode(method, "MethodDefinition"));
        }
        this.popCx();
        if (!this.eat(tt.braceR)) {
          this.last.end = this.tok.start;
          if (this.options.locations) this.last.loc.end = this.tok.loc.start;
        }
        this.semicolon();
        this.finishNode(node.body, "ClassBody");
        return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
      };
      lp.parseFunction = function(node, isStatement) {
        this.initFunction(node);
        if (this.options.ecmaVersion >= 6) {
          node.generator = this.eat(tt.star);
        }
        if (this.tok.type === tt.name) node.id = this.parseIdent();
        else if (isStatement) node.id = this.dummyIdent();
        node.params = this.parseFunctionParams();
        node.body = this.parseBlock();
        return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
      };
      lp.parseExport = function() {
        var node = this.startNode();
        this.next();
        if (this.eat(tt.star)) {
          node.source = this.eatContextual("from") ? this.parseExprAtom() : null;
          return this.finishNode(node, "ExportAllDeclaration");
        }
        if (this.eat(tt._default)) {
          var expr = this.parseMaybeAssign();
          if (expr.id) {
            switch (expr.type) {
              case "FunctionExpression":
                expr.type = "FunctionDeclaration";
                break;
              case "ClassExpression":
                expr.type = "ClassDeclaration";
                break;
            }
          }
          node.declaration = expr;
          this.semicolon();
          return this.finishNode(node, "ExportDefaultDeclaration");
        }
        if (this.tok.type.keyword) {
          node.declaration = this.parseStatement();
          node.specifiers = [];
          node.source = null;
        } else {
          node.declaration = null;
          node.specifiers = this.parseExportSpecifierList();
          node.source = this.eatContextual("from") ? this.parseExprAtom() : null;
          this.semicolon();
        }
        return this.finishNode(node, "ExportNamedDeclaration");
      };
      lp.parseImport = function() {
        var node = this.startNode();
        this.next();
        if (this.tok.type === tt.string) {
          node.specifiers = [];
          node.source = this.parseExprAtom();
          node.kind = "";
        } else {
          var elt = undefined;
          if (this.tok.type === tt.name && this.tok.value !== "from") {
            elt = this.startNode();
            elt.local = this.parseIdent();
            this.finishNode(elt, "ImportDefaultSpecifier");
            this.eat(tt.comma);
          }
          node.specifiers = this.parseImportSpecifierList();
          node.source = this.eatContextual("from") ? this.parseExprAtom() : null;
          if (elt) node.specifiers.unshift(elt);
        }
        this.semicolon();
        return this.finishNode(node, "ImportDeclaration");
      };
      lp.parseImportSpecifierList = function() {
        var elts = [];
        if (this.tok.type === tt.star) {
          var elt = this.startNode();
          this.next();
          if (this.eatContextual("as")) elt.local = this.parseIdent();
          elts.push(this.finishNode(elt, "ImportNamespaceSpecifier"));
        } else {
          var indent = this.curIndent,
            line = this.curLineStart,
            continuedLine = this.nextLineStart;
          this.pushCx();
          this.eat(tt.braceL);
          if (this.curLineStart > continuedLine) continuedLine = this.curLineStart;
          while (!this.closes(tt.braceR, indent + (this.curLineStart <= continuedLine ? 1 : 0), line)) {
            var elt = this.startNode();
            if (this.eat(tt.star)) {
              if (this.eatContextual("as")) elt.local = this.parseIdent();
              this.finishNode(elt, "ImportNamespaceSpecifier");
            } else {
              if (this.isContextual("from")) break;
              elt.imported = this.parseIdent();
              elt.local = this.eatContextual("as") ? this.parseIdent() : elt.imported;
              this.finishNode(elt, "ImportSpecifier");
            }
            elts.push(elt);
            this.eat(tt.comma);
          }
          this.eat(tt.braceR);
          this.popCx();
        }
        return elts;
      };
      lp.parseExportSpecifierList = function() {
        var elts = [];
        var indent = this.curIndent,
          line = this.curLineStart,
          continuedLine = this.nextLineStart;
        this.pushCx();
        this.eat(tt.braceL);
        if (this.curLineStart > continuedLine) continuedLine = this.curLineStart;
        while (!this.closes(tt.braceR, indent + (this.curLineStart <= continuedLine ? 1 : 0), line)) {
          if (this.isContextual("from")) break;
          var elt = this.startNode();
          elt.local = this.parseIdent();
          elt.exported = this.eatContextual("as") ? this.parseIdent() : elt.local;
          this.finishNode(elt, "ExportSpecifier");
          elts.push(elt);
          this.eat(tt.comma);
        }
        this.eat(tt.braceR);
        this.popCx();
        return elts;
      };
    }, {
      "..": 2,
      "./parseutil": 4,
      "./state": 5
    }],
    7: [function(_dereq_, module, exports) {
      "use strict";
      var _ = _dereq_("..");
      var tt = _.tokTypes;
      var Token = _.Token;
      var isNewLine = _.isNewLine;
      var SourceLocation = _.SourceLocation;
      var getLineInfo = _.getLineInfo;
      var lineBreakG = _.lineBreakG;
      var LooseParser = _dereq_("./state").LooseParser;
      var lp = LooseParser.prototype;

      function isSpace(ch) {
        return ch < 14 && ch > 8 || ch === 32 || ch === 160 || isNewLine(ch);
      }
      lp.next = function() {
        this.last = this.tok;
        if (this.ahead.length) this.tok = this.ahead.shift();
        else this.tok = this.readToken();
        if (this.tok.start >= this.nextLineStart) {
          while (this.tok.start >= this.nextLineStart) {
            this.curLineStart = this.nextLineStart;
            this.nextLineStart = this.lineEnd(this.curLineStart) + 1;
          }
          this.curIndent = this.indentationAfter(this.curLineStart);
        }
      };
      lp.readToken = function() {
        for (;;) {
          try {
            this.toks.next();
            if (this.toks.type === tt.dot && this.input.substr(this.toks.end, 1) === "." && this.options.ecmaVersion >= 6) {
              this.toks.end++;
              this.toks.type = tt.ellipsis;
            }
            return new Token(this.toks);
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
            var msg = e.message,
              pos = e.raisedAt,
              replace = true;
            if (/unterminated/i.test(msg)) {
              pos = this.lineEnd(e.pos + 1);
              if (/string/.test(msg)) {
                replace = {
                  start: e.pos,
                  end: pos,
                  type: tt.string,
                  value: this.input.slice(e.pos + 1, pos)
                };
              } else if (/regular expr/i.test(msg)) {
                var re = this.input.slice(e.pos, pos);
                try {
                  re = new RegExp(re);
                } catch (e) {}
                replace = {
                  start: e.pos,
                  end: pos,
                  type: tt.regexp,
                  value: re
                };
              } else if (/template/.test(msg)) {
                replace = {
                  start: e.pos,
                  end: pos,
                  type: tt.template,
                  value: this.input.slice(e.pos, pos)
                };
              } else {
                replace = false;
              }
            } else if (/invalid (unicode|regexp|number)|expecting unicode|octal literal|is reserved|directly after number|expected number in radix/i.test(msg)) {
              while (pos < this.input.length && !isSpace(this.input.charCodeAt(pos))) ++pos;
            } else if (/character escape|expected hexadecimal/i.test(msg)) {
              while (pos < this.input.length) {
                var ch = this.input.charCodeAt(pos++);
                if (ch === 34 || ch === 39 || isNewLine(ch)) break;
              }
            } else if (/unexpected character/i.test(msg)) {
              pos++;
              replace = false;
            } else if (/regular expression/i.test(msg)) {
              replace = true;
            } else {
              throw e;
            }
            this.resetTo(pos);
            if (replace === true) replace = {
              start: pos,
              end: pos,
              type: tt.name,
              value: "✖"
            };
            if (replace) {
              if (this.options.locations) replace.loc = new SourceLocation(this.toks, getLineInfo(this.input, replace.start), getLineInfo(this.input, replace.end));
              return replace;
            }
          }
        }
      };
      lp.resetTo = function(pos) {
        this.toks.pos = pos;
        var ch = this.input.charAt(pos - 1);
        this.toks.exprAllowed = !ch || /[\[\{\(,;:?\/*=+\-~!|&%^<>]/.test(ch) || /[enwfd]/.test(ch) && /\b(keywords|case|else|return|throw|new|in|(instance|type)of|delete|void)$/.test(this.input.slice(pos - 10, pos));
        if (this.options.locations) {
          this.toks.curLine = 1;
          this.toks.lineStart = lineBreakG.lastIndex = 0;
          var match = undefined;
          while ((match = lineBreakG.exec(this.input)) && match.index < pos) {
            ++this.toks.curLine;
            this.toks.lineStart = match.index + match[0].length;
          }
        }
      };
      lp.lookAhead = function(n) {
        while (n > this.ahead.length) this.ahead.push(this.readToken());
        return this.ahead[n - 1];
      };
    }, {
      "..": 2,
      "./state": 5
    }]
  }, {}, [1])(1)
});;
/*! RESOURCE: /scripts/lib/acorn/dist/walk.js */
(function(f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f()
  } else if (typeof define === "function" && define.amd) {
    define([], f)
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window
    } else if (typeof global !== "undefined") {
      g = global
    } else if (typeof self !== "undefined") {
      g = self
    } else {
      g = this
    }(g.acorn || (g.acorn = {})).walk = f()
  }
})(function() {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f
        }
        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e)
        }, l, l.exports, e, t, n, r)
      }
      return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
  })({
    1: [function(_dereq_, module, exports) {
      "use strict";
      var _classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      };
      exports.simple = simple;
      exports.ancestor = ancestor;
      exports.recursive = recursive;
      exports.findNodeAt = findNodeAt;
      exports.findNodeAround = findNodeAround;
      exports.findNodeAfter = findNodeAfter;
      exports.findNodeBefore = findNodeBefore;
      exports.make = make;
      exports.__esModule = true;

      function simple(node, visitors, base, state, override) {
        if (!base) base = exports.base;
        (function c(node, st, override) {
          var type = override || node.type,
            found = visitors[type];
          base[type](node, st, c);
          if (found) found(node, st);
        })(node, state, override);
      }

      function ancestor(node, visitors, base, state) {
        if (!base) base = exports.base;
        if (!state) state = [];
        (function c(node, st, override) {
          var type = override || node.type,
            found = visitors[type];
          if (node != st[st.length - 1]) {
            st = st.slice();
            st.push(node);
          }
          base[type](node, st, c);
          if (found) found(node, st);
        })(node, state);
      }

      function recursive(node, state, funcs, base, override) {
        var visitor = funcs ? exports.make(funcs, base) : base;
        (function c(node, st, override) {
          visitor[override || node.type](node, st, c);
        })(node, state, override);
      }

      function makeTest(test) {
        if (typeof test == "string") {
          return function(type) {
            return type == test;
          };
        } else if (!test) {
          return function() {
            return true;
          };
        } else {
          return test;
        }
      }
      var Found = function Found(node, state) {
        _classCallCheck(this, Found);
        this.node = node;
        this.state = state;
      };

      function findNodeAt(node, start, end, test, base, state) {
        test = makeTest(test);
        if (!base) base = exports.base;
        try {
          ;
          (function c(node, st, override) {
            var type = override || node.type;
            if ((start == null || node.start <= start) && (end == null || node.end >= end)) base[type](node, st, c);
            if (test(type, node) && (start == null || node.start == start) && (end == null || node.end == end)) throw new Found(node, st);
          })(node, state);
        } catch (e) {
          if (e instanceof Found) {
            return e;
          }
          throw e;
        }
      }

      function findNodeAround(node, pos, test, base, state) {
        test = makeTest(test);
        if (!base) base = exports.base;
        try {
          ;
          (function c(node, st, override) {
            var type = override || node.type;
            if (node.start > pos || node.end < pos) {
              return;
            }
            base[type](node, st, c);
            if (test(type, node)) throw new Found(node, st);
          })(node, state);
        } catch (e) {
          if (e instanceof Found) {
            return e;
          }
          throw e;
        }
      }

      function findNodeAfter(node, pos, test, base, state) {
        test = makeTest(test);
        if (!base) base = exports.base;
        try {
          ;
          (function c(node, st, override) {
            if (node.end < pos) {
              return;
            }
            var type = override || node.type;
            if (node.start >= pos && test(type, node)) throw new Found(node, st);
            base[type](node, st, c);
          })(node, state);
        } catch (e) {
          if (e instanceof Found) {
            return e;
          }
          throw e;
        }
      }

      function findNodeBefore(node, pos, test, base, state) {
        test = makeTest(test);
        if (!base) base = exports.base;
        var max = undefined;
        (function c(node, st, override) {
          if (node.start > pos) {
            return;
          }
          var type = override || node.type;
          if (node.end <= pos && (!max || max.node.end < node.end) && test(type, node)) max = new Found(node, st);
          base[type](node, st, c);
        })(node, state);
        return max;
      }

      function make(funcs, base) {
        if (!base) base = exports.base;
        var visitor = {};
        for (var type in base) visitor[type] = base[type];
        for (var type in funcs) visitor[type] = funcs[type];
        return visitor;
      }

      function skipThrough(node, st, c) {
        c(node, st);
      }

      function ignore(_node, _st, _c) {}
      var base = {};
      exports.base = base;
      base.Program = base.BlockStatement = function(node, st, c) {
        for (var i = 0; i < node.body.length; ++i) {
          c(node.body[i], st, "Statement");
        }
      };
      base.Statement = skipThrough;
      base.EmptyStatement = ignore;
      base.ExpressionStatement = base.ParenthesizedExpression = function(node, st, c) {
        return c(node.expression, st, "Expression");
      };
      base.IfStatement = function(node, st, c) {
        c(node.test, st, "Expression");
        c(node.consequent, st, "Statement");
        if (node.alternate) c(node.alternate, st, "Statement");
      };
      base.LabeledStatement = function(node, st, c) {
        return c(node.body, st, "Statement");
      };
      base.BreakStatement = base.ContinueStatement = ignore;
      base.WithStatement = function(node, st, c) {
        c(node.object, st, "Expression");
        c(node.body, st, "Statement");
      };
      base.SwitchStatement = function(node, st, c) {
        c(node.discriminant, st, "Expression");
        for (var i = 0; i < node.cases.length; ++i) {
          var cs = node.cases[i];
          if (cs.test) c(cs.test, st, "Expression");
          for (var j = 0; j < cs.consequent.length; ++j) {
            c(cs.consequent[j], st, "Statement");
          }
        }
      };
      base.ReturnStatement = base.YieldExpression = function(node, st, c) {
        if (node.argument) c(node.argument, st, "Expression");
      };
      base.ThrowStatement = base.SpreadElement = function(node, st, c) {
        return c(node.argument, st, "Expression");
      };
      base.TryStatement = function(node, st, c) {
        c(node.block, st, "Statement");
        if (node.handler) {
          c(node.handler.param, st, "Pattern");
          c(node.handler.body, st, "ScopeBody");
        }
        if (node.finalizer) c(node.finalizer, st, "Statement");
      };
      base.WhileStatement = base.DoWhileStatement = function(node, st, c) {
        c(node.test, st, "Expression");
        c(node.body, st, "Statement");
      };
      base.ForStatement = function(node, st, c) {
        if (node.init) c(node.init, st, "ForInit");
        if (node.test) c(node.test, st, "Expression");
        if (node.update) c(node.update, st, "Expression");
        c(node.body, st, "Statement");
      };
      base.ForInStatement = base.ForOfStatement = function(node, st, c) {
        c(node.left, st, "ForInit");
        c(node.right, st, "Expression");
        c(node.body, st, "Statement");
      };
      base.ForInit = function(node, st, c) {
        if (node.type == "VariableDeclaration") c(node, st);
        else c(node, st, "Expression");
      };
      base.DebuggerStatement = ignore;
      base.FunctionDeclaration = function(node, st, c) {
        return c(node, st, "Function");
      };
      base.VariableDeclaration = function(node, st, c) {
        for (var i = 0; i < node.declarations.length; ++i) {
          var decl = node.declarations[i];
          c(decl.id, st, "Pattern");
          if (decl.init) c(decl.init, st, "Expression");
        }
      };
      base.Function = function(node, st, c) {
        for (var i = 0; i < node.params.length; i++) {
          c(node.params[i], st, "Pattern");
        }
        c(node.body, st, "ScopeBody");
      };
      base.ScopeBody = function(node, st, c) {
        return c(node, st, "Statement");
      };
      base.Pattern = function(node, st, c) {
        if (node.type == "Identifier") c(node, st, "VariablePattern");
        else if (node.type == "MemberExpression") c(node, st, "MemberPattern");
        else c(node, st);
      };
      base.VariablePattern = ignore;
      base.MemberPattern = skipThrough;
      base.RestElement = function(node, st, c) {
        return c(node.argument, st, "Pattern");
      };
      base.ArrayPattern = function(node, st, c) {
        for (var i = 0; i < node.elements.length; ++i) {
          var elt = node.elements[i];
          if (elt) c(elt, st, "Pattern");
        }
      };
      base.ObjectPattern = function(node, st, c) {
        for (var i = 0; i < node.properties.length; ++i) {
          c(node.properties[i].value, st, "Pattern");
        }
      };
      base.Expression = skipThrough;
      base.ThisExpression = base.Super = base.MetaProperty = ignore;
      base.ArrayExpression = function(node, st, c) {
        for (var i = 0; i < node.elements.length; ++i) {
          var elt = node.elements[i];
          if (elt) c(elt, st, "Expression");
        }
      };
      base.ObjectExpression = function(node, st, c) {
        for (var i = 0; i < node.properties.length; ++i) {
          c(node.properties[i], st);
        }
      };
      base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
      base.SequenceExpression = base.TemplateLiteral = function(node, st, c) {
        for (var i = 0; i < node.expressions.length; ++i) {
          c(node.expressions[i], st, "Expression");
        }
      };
      base.UnaryExpression = base.UpdateExpression = function(node, st, c) {
        c(node.argument, st, "Expression");
      };
      base.BinaryExpression = base.LogicalExpression = function(node, st, c) {
        c(node.left, st, "Expression");
        c(node.right, st, "Expression");
      };
      base.AssignmentExpression = base.AssignmentPattern = function(node, st, c) {
        c(node.left, st, "Pattern");
        c(node.right, st, "Expression");
      };
      base.ConditionalExpression = function(node, st, c) {
        c(node.test, st, "Expression");
        c(node.consequent, st, "Expression");
        c(node.alternate, st, "Expression");
      };
      base.NewExpression = base.CallExpression = function(node, st, c) {
        c(node.callee, st, "Expression");
        if (node.arguments)
          for (var i = 0; i < node.arguments.length; ++i) {
            c(node.arguments[i], st, "Expression");
          }
      };
      base.MemberExpression = function(node, st, c) {
        c(node.object, st, "Expression");
        if (node.computed) c(node.property, st, "Expression");
      };
      base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function(node, st, c) {
        if (node.declaration) c(node.declaration, st);
      };
      base.ImportDeclaration = function(node, st, c) {
        for (var i = 0; i < node.specifiers.length; i++) {
          c(node.specifiers[i], st);
        }
      };
      base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.Literal = ignore;
      base.TaggedTemplateExpression = function(node, st, c) {
        c(node.tag, st, "Expression");
        c(node.quasi, st);
      };
      base.ClassDeclaration = base.ClassExpression = function(node, st, c) {
        return c(node, st, "Class");
      };
      base.Class = function(node, st, c) {
        c(node.id, st, "Pattern");
        if (node.superClass) c(node.superClass, st, "Expression");
        for (var i = 0; i < node.body.body.length; i++) {
          c(node.body.body[i], st);
        }
      };
      base.MethodDefinition = base.Property = function(node, st, c) {
        if (node.computed) c(node.key, st, "Expression");
        c(node.value, st, "Expression");
      };
      base.ComprehensionExpression = function(node, st, c) {
        for (var i = 0; i < node.blocks.length; i++) {
          c(node.blocks[i].right, st, "Expression");
        }
        c(node.body, st, "Expression");
      };
    }, {}]
  }, {}, [1])(1)
});;
/*! RESOURCE: /scripts/codemirror_tern/signal.js */
(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object")
    return mod(exports);
  if (typeof define == "function" && define.amd)
    return define(["exports"], mod);
  mod((root.tern || (root.tern = {})).signal = {});
})(this, function(exports) {
  function on(type, f) {
    var handlers = this._handlers || (this._handlers = Object.create(null));
    (handlers[type] || (handlers[type] = [])).push(f);
  }

  function off(type, f) {
    var arr = this._handlers && this._handlers[type];
    if (arr)
      for (var i = 0; i < arr.length; ++i)
        if (arr[i] == f) {
          arr.splice(i, 1);
          break;
        }
  }
  var noHandlers = []

  function getHandlers(emitter, type) {
    var arr = emitter._handlers && emitter._handlers[type];
    return arr && arr.length ? arr.slice() : noHandlers
  }

  function signal(type, a1, a2, a3, a4) {
    var arr = getHandlers(this, type)
    for (var i = 0; i < arr.length; ++i) arr[i].call(this, a1, a2, a3, a4)
  }

  function signalReturnFirst(type, a1, a2, a3, a4) {
    var arr = getHandlers(this, type)
    for (var i = 0; i < arr.length; ++i) {
      var result = arr[i].call(this, a1, a2, a3, a4)
      if (result) return result
    }
  }

  function hasHandler(type) {
    var arr = this._handlers && this._handlers[type]
    return arr && arr.length > 0 && arr
  }
  exports.mixin = function(obj) {
    obj.on = on;
    obj.off = off;
    obj.signal = signal;
    obj.signalReturnFirst = signalReturnFirst;
    obj.hasHandler = hasHandler;
    return obj;
  };
});;
/*! RESOURCE: /scripts/codemirror_tern/tern.js */
(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object")
    return mod(exports, require("./infer"), require("./signal"),
      require("acorn"), require("acorn/dist/walk"));
  if (typeof define == "function" && define.amd)
    return define(["exports", "./infer", "./signal", "acorn/dist/acorn", "acorn/dist/walk"], mod);
  mod(root.tern || (root.tern = {}), tern, tern.signal, acorn, acorn.walk);
})(this, function(exports, infer, signal, acorn, walk) {
  "use strict";
  var plugins = Object.create(null);
  exports.registerPlugin = function(name, init) {
    plugins[name] = init;
  };
  var defaultOptions = exports.defaultOptions = {
    debug: false,
    async: false,
    getFile: function(_f, c) {
      if (this.async) c(null, null);
    },
    normalizeFilename: function(name) {
      return name
    },
    defs: [],
    plugins: {},
    fetchTimeout: 1000,
    dependencyBudget: 20000,
    reuseInstances: true,
    stripCRs: false,
    ecmaVersion: 6,
    projectDir: "/",
    parent: null
  };
  var queryTypes = {
    completions: {
      takesFile: true,
      run: findCompletions
    },
    properties: {
      run: findProperties
    },
    type: {
      takesFile: true,
      run: findTypeAt
    },
    documentation: {
      takesFile: true,
      run: findDocs
    },
    definition: {
      takesFile: true,
      run: findDef
    },
    refs: {
      takesFile: true,
      fullFile: true,
      run: findRefs
    },
    rename: {
      takesFile: true,
      fullFile: true,
      run: buildRename
    },
    files: {
      run: listFiles
    }
  };
  exports.defineQueryType = function(name, desc) {
    queryTypes[name] = desc;
  };

  function File(name, parent) {
    this.name = name;
    this.parent = parent;
    this.scope = this.text = this.ast = this.lineOffsets = null;
  }
  File.prototype.asLineChar = function(pos) {
    return asLineChar(this, pos);
  };

  function parseFile(srv, file) {
    var options = {
      directSourceFile: file,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
      ecmaVersion: srv.options.ecmaVersion
    }
    var text = srv.signalReturnFirst("preParse", file.text, options) || file.text
    var ast = infer.parse(text, options)
    srv.signal("postParse", ast, text)
    return ast
  }

  function updateText(file, text, srv) {
    file.text = srv.options.stripCRs ? text.replace(/\r\n/g, "\n") : text;
    infer.withContext(srv.cx, function() {
      file.ast = parseFile(srv, file)
    });
    file.lineOffsets = null;
  }
  var Server = exports.Server = function(options) {
    this.cx = null;
    this.options = options || {};
    for (var o in defaultOptions)
      if (!options.hasOwnProperty(o))
        options[o] = defaultOptions[o];
    this.projectDir = options.projectDir.replace(/\\/g, "/")
    if (!/\/$/.test(this.projectDir)) this.projectDir += "/"
    this.parent = options.parent;
    this.handlers = Object.create(null);
    this.files = [];
    this.fileMap = Object.create(null);
    this.needsPurge = [];
    this.budgets = Object.create(null);
    this.uses = 0;
    this.pending = 0;
    this.asyncError = null;
    this.mod = {}
    this.defs = options.defs.slice(0)
    this.plugins = Object.create(null)
    for (var plugin in options.plugins)
      if (options.plugins.hasOwnProperty(plugin))
        this.loadPlugin(plugin, options.plugins[plugin])
    this.reset();
  };
  Server.prototype = signal.mixin({
    addFile: function(name, text, parent) {
      if (parent && !(parent in this.fileMap)) parent = null;
      if (!(name in this.fileMap))
        name = this.normalizeFilename(name)
      ensureFile(this, name, parent, text);
    },
    delFile: function(name) {
      var file = this.findFile(name);
      if (file) {
        this.needsPurge.push(file.name);
        this.files.splice(this.files.indexOf(file), 1);
        delete this.fileMap[name];
      }
    },
    reset: function() {
      this.signal("reset");
      this.cx = new infer.Context(this.defs, this);
      this.uses = 0;
      this.budgets = Object.create(null);
      for (var i = 0; i < this.files.length; ++i) {
        var file = this.files[i];
        file.scope = null;
      }
      this.signal("postReset");
    },
    request: function(doc, c) {
      var inv = invalidDoc(doc);
      if (inv) return c(inv);
      var self = this;
      doRequest(this, doc, function(err, data) {
        c(err, data);
        if (self.uses > 40) {
          self.reset();
          analyzeAll(self, null, function() {});
        }
      });
    },
    findFile: function(name) {
      return this.fileMap[name];
    },
    flush: function(c) {
      var cx = this.cx;
      analyzeAll(this, null, function(err) {
        if (err) return c(err);
        infer.withContext(cx, c);
      });
    },
    startAsyncAction: function() {
      ++this.pending;
    },
    finishAsyncAction: function(err) {
      if (err) this.asyncError = err;
      if (--this.pending === 0) this.signal("everythingFetched");
    },
    addDefs: function(defs, toFront) {
      if (toFront) this.defs.unshift(defs)
      else this.defs.push(defs)
      if (this.cx) this.reset()
    },
    deleteDefs: function(name) {
      for (var i = 0; i < this.defs.length; i++)
        if (this.defs[i]["!name"] == name) {
          this.defs.splice(i, 1);
          if (this.cx) this.reset();
          return;
        }
    },
    loadPlugin: function(name, options) {
      if (arguments.length == 1) options = this.options.plugins[name] || true
      if (name in this.plugins || !(name in plugins) || !options) return
      this.plugins[name] = true
      var init = plugins[name](this, options)
      if (!init) return
      if (init.defs) this.addDefs(init.defs, init.loadFirst)
      if (init.passes)
        for (var type in init.passes)
          if (init.passes.hasOwnProperty(type))
            this.on(type, init.passes[type])
    },
    normalizeFilename: function(name) {
      var norm = this.options.normalizeFilename(name).replace(/\\/g, "/")
      if (norm.indexOf(this.projectDir) == 0) norm = norm.slice(this.projectDir.length)
      return norm
    }
  });

  function doRequest(srv, doc, c) {
    if (doc.query && !queryTypes.hasOwnProperty(doc.query.type))
      return c("No query type '" + doc.query.type + "' defined");
    var query = doc.query;
    if (!query) c(null, {});
    var files = doc.files || [];
    if (files.length) ++srv.uses;
    for (var i = 0; i < files.length; ++i) {
      var file = files[i];
      if (file.type == "delete")
        srv.delFile(file.name);
      else
        ensureFile(srv, file.name, null, file.type == "full" ? file.text : null);
    }
    var timeBudget = typeof doc.timeout == "number" ? [doc.timeout] : null;
    if (!query) {
      analyzeAll(srv, timeBudget, function() {});
      return;
    }
    var queryType = queryTypes[query.type];
    if (queryType.takesFile) {
      if (typeof query.file != "string") return c(".query.file must be a string");
      if (!/^#/.test(query.file)) ensureFile(srv, query.file, null);
    }
    analyzeAll(srv, timeBudget, function(err) {
      if (err) return c(err);
      var file = queryType.takesFile && resolveFile(srv, files, query.file);
      if (queryType.fullFile && file.type == "part")
        return c("Can't run a " + query.type + " query on a file fragment");

      function run() {
        var result;
        try {
          result = queryType.run(srv, query, file);
        } catch (e) {
          if (srv.options.debug && e.name != "TernError") console.error(e.stack);
          return c(e);
        }
        c(null, result);
      }
      infer.resetGuessing()
      infer.withContext(srv.cx, timeBudget ? function() {
        infer.withTimeout(timeBudget[0], run);
      } : run);
    });
  }

  function analyzeFile(srv, file) {
    infer.withContext(srv.cx, function() {
      file.scope = srv.cx.topScope;
      srv.signal("beforeLoad", file);
      infer.analyze(file.ast, file.name, file.scope);
      srv.signal("afterLoad", file);
    });
    return file;
  }

  function ensureFile(srv, name, parent, text) {
    var known = srv.findFile(name);
    if (known) {
      if (text != null) {
        if (known.scope) {
          srv.needsPurge.push(name);
          known.scope = null;
        }
        updateText(known, text, srv);
      }
      if (parentDepth(srv, known.parent) > parentDepth(srv, parent)) {
        known.parent = parent;
        if (known.excluded) known.excluded = null;
      }
      return;
    }
    var file = new File(name, parent);
    srv.files.push(file);
    srv.fileMap[name] = file;
    if (text != null) {
      updateText(file, text, srv);
    } else if (srv.options.async) {
      srv.startAsyncAction();
      srv.options.getFile(name, function(err, text) {
        updateText(file, text || "", srv);
        srv.finishAsyncAction(err);
      });
    } else {
      updateText(file, srv.options.getFile(name) || "", srv);
    }
  }

  function fetchAll(srv, c) {
    var done = true,
      returned = false;
    srv.files.forEach(function(file) {
      if (file.text != null) return;
      if (srv.options.async) {
        done = false;
        srv.options.getFile(file.name, function(err, text) {
          if (err && !returned) {
            returned = true;
            return c(err);
          }
          updateText(file, text || "", srv);
          fetchAll(srv, c);
        });
      } else {
        try {
          updateText(file, srv.options.getFile(file.name) || "", srv);
        } catch (e) {
          return c(e);
        }
      }
    });
    if (done) c();
  }

  function waitOnFetch(srv, timeBudget, c) {
    var done = function() {
      srv.off("everythingFetched", done);
      clearTimeout(timeout);
      analyzeAll(srv, timeBudget, c);
    };
    srv.on("everythingFetched", done);
    var timeout = setTimeout(done, srv.options.fetchTimeout);
  }

  function analyzeAll(srv, timeBudget, c) {
    if (srv.pending) return waitOnFetch(srv, timeBudget, c);
    var e = srv.fetchError;
    if (e) {
      srv.fetchError = null;
      return c(e);
    }
    if (srv.needsPurge.length > 0) infer.withContext(srv.cx, function() {
      infer.purge(srv.needsPurge);
      srv.needsPurge.length = 0;
    });
    var done = true;
    for (var i = 0; i < srv.files.length;) {
      var toAnalyze = [];
      for (; i < srv.files.length; ++i) {
        var file = srv.files[i];
        if (file.text == null) done = false;
        else if (file.scope == null && !file.excluded) toAnalyze.push(file);
      }
      toAnalyze.sort(function(a, b) {
        return parentDepth(srv, a.parent) - parentDepth(srv, b.parent);
      });
      for (var j = 0; j < toAnalyze.length; j++) {
        var file = toAnalyze[j];
        if (file.parent && !chargeOnBudget(srv, file)) {
          file.excluded = true;
        } else if (timeBudget) {
          var startTime = +new Date;
          infer.withTimeout(timeBudget[0], function() {
            analyzeFile(srv, file);
          });
          timeBudget[0] -= +new Date - startTime;
        } else {
          analyzeFile(srv, file);
        }
      }
    }
    if (done) c();
    else waitOnFetch(srv, timeBudget, c);
  }

  function firstLine(str) {
    var end = str.indexOf("\n");
    if (end < 0) return str;
    return str.slice(0, end);
  }

  function findMatchingPosition(line, file, near) {
    var pos = Math.max(0, near - 500),
      closest = null;
    if (!/^\s*$/.test(line))
      for (;;) {
        var found = file.indexOf(line, pos);
        if (found < 0 || found > near + 500) break;
        if (closest == null || Math.abs(closest - near) > Math.abs(found - near))
          closest = found;
        pos = found + line.length;
      }
    return closest;
  }

  function scopeDepth(s) {
    for (var i = 0; s; ++i, s = s.prev) {}
    return i;
  }

  function ternError(msg) {
    var err = new Error(msg);
    err.name = "TernError";
    return err;
  }

  function resolveFile(srv, localFiles, name) {
    var isRef = name.match(/^#(\d+)$/);
    if (!isRef) return srv.findFile(name);
    var file = localFiles[isRef[1]];
    if (!file || file.type == "delete") throw ternError("Reference to unknown file " + name);
    if (file.type == "full") return srv.findFile(file.name);
    var realFile = file.backing = srv.findFile(file.name);
    var offset = file.offset;
    if (file.offsetLines) offset = {
      line: file.offsetLines,
      ch: 0
    };
    file.offset = offset = resolvePos(realFile, file.offsetLines == null ? file.offset : {
      line: file.offsetLines,
      ch: 0
    }, true);
    var line = firstLine(file.text);
    var foundPos = findMatchingPosition(line, realFile.text, offset);
    var pos = foundPos == null ? Math.max(0, realFile.text.lastIndexOf("\n", offset)) : foundPos;
    var inObject, atFunction;
    infer.withContext(srv.cx, function() {
      infer.purge(file.name, pos, pos + file.text.length);
      var text = file.text,
        m;
      if (m = text.match(/(?:"([^"]*)"|([\w$]+))\s*:\s*function\b/)) {
        var objNode = walk.findNodeAround(file.backing.ast, pos, "ObjectExpression");
        if (objNode && objNode.node.objType)
          inObject = {
            type: objNode.node.objType,
            prop: m[2] || m[1]
          };
      }
      if (foundPos && (m = line.match(/^(.*?)\bfunction\b/))) {
        var cut = m[1].length,
          white = "";
        for (var i = 0; i < cut; ++i) white += " ";
        file.text = white + text.slice(cut);
        atFunction = true;
      }
      var scopeStart = infer.scopeAt(realFile.ast, pos, realFile.scope);
      var scopeEnd = infer.scopeAt(realFile.ast, pos + text.length, realFile.scope);
      var scope = file.scope = scopeDepth(scopeStart) < scopeDepth(scopeEnd) ? scopeEnd : scopeStart;
      file.ast = parseFile(srv, file)
      infer.analyze(file.ast, file.name, scope);
      tieTogether: if (inObject || atFunction) {
        var newInner = infer.scopeAt(file.ast, line.length, scopeStart);
        if (!newInner.fnType) break tieTogether;
        if (inObject) {
          var prop = inObject.type.getProp(inObject.prop);
          prop.addType(newInner.fnType);
        } else if (atFunction) {
          var inner = infer.scopeAt(realFile.ast, pos + line.length, realFile.scope);
          if (inner == scopeStart || !inner.fnType) break tieTogether;
          var fOld = inner.fnType,
            fNew = newInner.fnType;
          if (!fNew || (fNew.name != fOld.name && fOld.name)) break tieTogether;
          for (var i = 0, e = Math.min(fOld.args.length, fNew.args.length); i < e; ++i)
            fOld.args[i].propagate(fNew.args[i]);
          fOld.self.propagate(fNew.self);
          fNew.retval.propagate(fOld.retval);
        }
      }
    });
    return file;
  }

  function astSize(node) {
    var size = 0;
    walk.simple(node, {
      Expression: function() {
        ++size;
      }
    });
    return size;
  }

  function parentDepth(srv, parent) {
    var depth = 0;
    while (parent) {
      parent = srv.findFile(parent).parent;
      ++depth;
    }
    return depth;
  }

  function budgetName(srv, file) {
    for (;;) {
      var parent = srv.findFile(file.parent);
      if (!parent.parent) break;
      file = parent;
    }
    return file.name;
  }

  function chargeOnBudget(srv, file) {
    var bName = budgetName(srv, file);
    var size = astSize(file.ast);
    var known = srv.budgets[bName];
    if (known == null)
      known = srv.budgets[bName] = srv.options.dependencyBudget;
    if (known < size) return false;
    srv.budgets[bName] = known - size;
    return true;
  }

  function isPosition(val) {
    return typeof val == "number" || typeof val == "object" &&
      typeof val.line == "number" && typeof val.ch == "number";
  }

  function invalidDoc(doc) {
    if (doc.query) {
      if (typeof doc.query.type != "string") return ".query.type must be a string";
      if (doc.query.start && !isPosition(doc.query.start)) return ".query.start must be a position";
      if (doc.query.end && !isPosition(doc.query.end)) return ".query.end must be a position";
    }
    if (doc.files) {
      if (!Array.isArray(doc.files)) return "Files property must be an array";
      for (var i = 0; i < doc.files.length; ++i) {
        var file = doc.files[i];
        if (typeof file != "object") return ".files[n] must be objects";
        else if (typeof file.name != "string") return ".files[n].name must be a string";
        else if (file.type == "delete") continue;
        else if (typeof file.text != "string") return ".files[n].text must be a string";
        else if (file.type == "part") {
          if (!isPosition(file.offset) && typeof file.offsetLines != "number")
            return ".files[n].offset must be a position";
        } else if (file.type != "full") return ".files[n].type must be \"full\" or \"part\"";
      }
    }
  }
  var offsetSkipLines = 25;

  function findLineStart(file, line) {
    var text = file.text,
      offsets = file.lineOffsets || (file.lineOffsets = [0]);
    var pos = 0,
      curLine = 0;
    var storePos = Math.min(Math.floor(line / offsetSkipLines), offsets.length - 1);
    var pos = offsets[storePos],
      curLine = storePos * offsetSkipLines;
    while (curLine < line) {
      ++curLine;
      pos = text.indexOf("\n", pos) + 1;
      if (pos === 0) return null;
      if (curLine % offsetSkipLines === 0) offsets.push(pos);
    }
    return pos;
  }
  var resolvePos = exports.resolvePos = function(file, pos, tolerant) {
    if (typeof pos != "number") {
      var lineStart = findLineStart(file, pos.line);
      if (lineStart == null) {
        if (tolerant) pos = file.text.length;
        else throw ternError("File doesn't contain a line " + pos.line);
      } else {
        pos = lineStart + pos.ch;
      }
    }
    if (pos > file.text.length) {
      if (tolerant) pos = file.text.length;
      else throw ternError("Position " + pos + " is outside of file.");
    }
    return pos;
  };

  function asLineChar(file, pos) {
    if (!file) return {
      line: 0,
      ch: 0
    };
    var offsets = file.lineOffsets || (file.lineOffsets = [0]);
    var text = file.text,
      line, lineStart;
    for (var i = offsets.length - 1; i >= 0; --i)
      if (offsets[i] <= pos) {
        line = i * offsetSkipLines;
        lineStart = offsets[i];
      }
    for (;;) {
      var eol = text.indexOf("\n", lineStart);
      if (eol >= pos || eol < 0) break;
      lineStart = eol + 1;
      ++line;
    }
    return {
      line: line,
      ch: pos - lineStart
    };
  }
  var outputPos = exports.outputPos = function(query, file, pos) {
    if (query.lineCharPositions) {
      var out = asLineChar(file, pos);
      if (file.type == "part")
        out.line += file.offsetLines != null ? file.offsetLines : asLineChar(file.backing, file.offset).line;
      return out;
    } else {
      return pos + (file.type == "part" ? file.offset : 0);
    }
  };

  function clean(obj) {
    for (var prop in obj)
      if (obj[prop] == null) delete obj[prop];
    return obj;
  }

  function maybeSet(obj, prop, val) {
    if (val != null) obj[prop] = val;
  }

  function compareCompletions(a, b) {
    if (typeof a != "string") {
      a = a.name;
      b = b.name;
    }
    var aUp = /^[A-Z]/.test(a),
      bUp = /^[A-Z]/.test(b);
    if (aUp == bUp) return a < b ? -1 : a == b ? 0 : 1;
    else return aUp ? 1 : -1;
  }

  function isStringAround(node, start, end) {
    return node.type == "Literal" && typeof node.value == "string" &&
      node.start == start - 1 && node.end <= end + 1;
  }

  function pointInProp(objNode, point) {
    for (var i = 0; i < objNode.properties.length; i++) {
      var curProp = objNode.properties[i];
      if (curProp.key.start <= point && curProp.key.end >= point)
        return curProp;
    }
  }
  var jsKeywords = ("break do instanceof typeof case else new var " +
    "catch finally return void continue for switch while debugger " +
    "function this with default if throw delete in try").split(" ");
  var addCompletion = exports.addCompletion = function(query, completions, name, aval, depth) {
    var typeInfo = query.types || query.docs || query.urls || query.origins;
    var wrapAsObjs = typeInfo || query.depths;
    for (var i = 0; i < completions.length; ++i) {
      var c = completions[i];
      if ((wrapAsObjs ? c.name : c) == name) return;
    }
    var rec = wrapAsObjs ? {
      name: name
    } : name;
    completions.push(rec);
    if (aval && typeInfo) {
      infer.resetGuessing();
      var type = aval.getType();
      rec.guess = infer.didGuess();
      if (query.types)
        rec.type = infer.toString(aval);
      if (query.docs)
        maybeSet(rec, "doc", parseDoc(query, aval.doc || type && type.doc));
      if (query.urls)
        maybeSet(rec, "url", aval.url || type && type.url);
      if (query.origins)
        maybeSet(rec, "origin", aval.origin || type && type.origin);
    }
    if (query.depths) rec.depth = depth || 0;
    return rec;
  };

  function findCompletions(srv, query, file) {
    if (query.end == null) throw ternError("missing .query.end field");
    var fromPlugin = srv.signalReturnFirst("completion", file, query)
    if (fromPlugin) return fromPlugin
    var wordStart = resolvePos(file, query.end),
      wordEnd = wordStart,
      text = file.text;
    while (wordStart && acorn.isIdentifierChar(text.charCodeAt(wordStart - 1))) --wordStart;
    if (query.expandWordForward !== false)
      while (wordEnd < text.length && acorn.isIdentifierChar(text.charCodeAt(wordEnd))) ++wordEnd;
    var word = text.slice(wordStart, wordEnd),
      completions = [],
      ignoreObj;
    if (query.caseInsensitive) word = word.toLowerCase();

    function gather(prop, obj, depth, addInfo) {
      if ((objLit || query.omitObjectPrototype !== false) && obj == srv.cx.protos.Object && !word) return;
      if (query.filter !== false && word &&
        (query.caseInsensitive ? prop.toLowerCase() : prop).indexOf(word) !== 0) return;
      if (ignoreObj && ignoreObj.props[prop]) return;
      var result = addCompletion(query, completions, prop, obj && obj.props[prop], depth);
      if (addInfo && result && typeof result != "string") addInfo(result);
    }
    var hookname, prop, objType, isKey;
    var exprAt = infer.findExpressionAround(file.ast, null, wordStart, file.scope);
    var memberExpr, objLit;
    if (exprAt) {
      var exprNode = exprAt.node;
      if (exprNode.type == "MemberExpression" && exprNode.object.end < wordStart) {
        memberExpr = exprAt;
      } else if (isStringAround(exprNode, wordStart, wordEnd)) {
        var parent = infer.parentNode(exprNode, file.ast);
        if (parent.type == "MemberExpression" && parent.property == exprNode)
          memberExpr = {
            node: parent,
            state: exprAt.state
          };
      } else if (exprNode.type == "ObjectExpression") {
        var objProp = pointInProp(exprNode, wordEnd);
        if (objProp) {
          objLit = exprAt;
          prop = isKey = objProp.key.name;
        } else if (!word && !/:\s*$/.test(file.text.slice(0, wordStart))) {
          objLit = exprAt;
          prop = isKey = true;
        }
      }
    }
    if (objLit) {
      objType = infer.typeFromContext(file.ast, objLit);
      ignoreObj = objLit.node.objType;
    } else if (memberExpr) {
      prop = memberExpr.node.property;
      prop = prop.type == "Literal" ? prop.value.slice(1) : prop.name;
      memberExpr.node = memberExpr.node.object;
      objType = infer.expressionType(memberExpr);
    } else if (text.charAt(wordStart - 1) == ".") {
      var pathStart = wordStart - 1;
      while (pathStart && (text.charAt(pathStart - 1) == "." || acorn.isIdentifierChar(text.charCodeAt(pathStart - 1)))) pathStart--;
      var path = text.slice(pathStart, wordStart - 1);
      if (path) {
        objType = infer.def.parsePath(path, file.scope).getObjType();
        prop = word;
      }
    }
    if (prop != null) {
      srv.cx.completingProperty = prop;
      if (objType) infer.forAllPropertiesOf(objType, gather);
      if (!completions.length && query.guess !== false && objType && objType.guessProperties)
        objType.guessProperties(function(p, o, d) {
          if (p != prop && p != "✖") gather(p, o, d);
        });
      if (!completions.length && word.length >= 2 && query.guess !== false)
        for (var prop in srv.cx.props) gather(prop, srv.cx.props[prop][0], 0);
      hookname = "memberCompletion";
    } else {
      infer.forAllLocalsAt(file.ast, wordStart, file.scope, gather);
      if (query.includeKeywords) jsKeywords.forEach(function(kw) {
        gather(kw, null, 0, function(rec) {
          rec.isKeyword = true;
        });
      });
      hookname = "variableCompletion";
    }
    srv.signal(hookname, file, wordStart, wordEnd, gather)
    if (query.sort !== false) completions.sort(compareCompletions);
    srv.cx.completingProperty = null;
    return {
      start: outputPos(query, file, wordStart),
      end: outputPos(query, file, wordEnd),
      isProperty: !!prop,
      isObjectKey: !!isKey,
      completions: completions
    };
  }

  function findProperties(srv, query) {
    var prefix = query.prefix,
      found = [];
    for (var prop in srv.cx.props)
      if (prop != "<i>" && (!prefix || prop.indexOf(prefix) === 0)) found.push(prop);
    if (query.sort !== false) found.sort(compareCompletions);
    return {
      completions: found
    };
  }
  var findExpr = exports.findQueryExpr = function(file, query, wide) {
    if (query.end == null) throw ternError("missing .query.end field");
    if (query.variable) {
      var scope = infer.scopeAt(file.ast, resolvePos(file, query.end), file.scope);
      return {
        node: {
          type: "Identifier",
          name: query.variable,
          start: query.end,
          end: query.end + 1
        },
        state: scope
      };
    } else {
      var start = query.start && resolvePos(file, query.start),
        end = resolvePos(file, query.end);
      var expr = infer.findExpressionAt(file.ast, start, end, file.scope);
      if (expr) return expr;
      expr = infer.findExpressionAround(file.ast, start, end, file.scope);
      if (expr && (expr.node.type == "ObjectExpression" || wide ||
          (start == null ? end : start) - expr.node.start < 20 || expr.node.end - end < 20))
        return expr;
      return null;
    }
  };

  function findExprOrThrow(file, query, wide) {
    var expr = findExpr(file, query, wide);
    if (expr) return expr;
    throw ternError("No expression at the given position.");
  }

  function ensureObj(tp) {
    if (!tp || !(tp = tp.getType()) || !(tp instanceof infer.Obj)) return null;
    return tp;
  }

  function findExprType(srv, query, file, expr) {
    var type;
    if (expr) {
      infer.resetGuessing();
      type = infer.expressionType(expr);
    }
    var typeHandlers = srv.hasHandler("typeAt")
    if (typeHandlers) {
      var pos = resolvePos(file, query.end)
      for (var i = 0; i < typeHandlers.length; i++)
        type = typeHandlers[i](file, pos, expr, type)
    }
    if (!type) throw ternError("No type found at the given position.");
    var objProp;
    if (expr.node.type == "ObjectExpression" && query.end != null &&
      (objProp = pointInProp(expr.node, resolvePos(file, query.end)))) {
      var name = objProp.key.name;
      var fromCx = ensureObj(infer.typeFromContext(file.ast, expr));
      if (fromCx && fromCx.hasProp(name)) {
        type = fromCx.hasProp(name);
      } else {
        var fromLocal = ensureObj(type);
        if (fromLocal && fromLocal.hasProp(name))
          type = fromLocal.hasProp(name);
      }
    }
    return type;
  };

  function findTypeAt(srv, query, file) {
    var expr = findExpr(file, query),
      exprName;
    var type = findExprType(srv, query, file, expr),
      exprType = type;
    if (query.preferFunction)
      type = type.getFunctionType() || type.getType();
    else
      type = type.getType();
    if (expr) {
      if (expr.node.type == "Identifier")
        exprName = expr.node.name;
      else if (expr.node.type == "MemberExpression" && !expr.node.computed)
        exprName = expr.node.property.name;
    }
    if (query.depth != null && typeof query.depth != "number")
      throw ternError(".query.depth must be a number");
    var result = {
      guess: infer.didGuess(),
      type: infer.toString(exprType, query.depth),
      name: type && type.name,
      exprName: exprName,
      doc: exprType.doc,
      url: exprType.url
    };
    if (type) storeTypeDocs(query, type, result);
    return clean(result);
  }

  function parseDoc(query, doc) {
    if (!doc) return null;
    if (query.docFormat == "full") return doc;
    var parabreak = /.\n[\s@\n]/.exec(doc);
    if (parabreak) doc = doc.slice(0, parabreak.index + 1);
    doc = doc.replace(/\n\s*/g, " ");
    if (doc.length < 100) return doc;
    var sentenceEnd = /[\.!?] [A-Z]/g;
    sentenceEnd.lastIndex = 80;
    var found = sentenceEnd.exec(doc);
    if (found) doc = doc.slice(0, found.index + 1);
    return doc;
  }

  function findDocs(srv, query, file) {
    var expr = findExpr(file, query);
    var type = findExprType(srv, query, file, expr);
    var result = {
      url: type.url,
      doc: parseDoc(query, type.doc),
      type: infer.toString(type)
    };
    var inner = type.getType();
    if (inner) storeTypeDocs(query, inner, result);
    return clean(result);
  }

  function storeTypeDocs(query, type, out) {
    if (!out.url) out.url = type.url;
    if (!out.doc) out.doc = parseDoc(query, type.doc);
    if (!out.origin) out.origin = type.origin;
    var ctor, boring = infer.cx().protos;
    if (!out.url && !out.doc && type.proto && (ctor = type.proto.hasCtor) &&
      type.proto != boring.Object && type.proto != boring.Function && type.proto != boring.Array) {
      out.url = ctor.url;
      out.doc = parseDoc(query, ctor.doc);
    }
  }
  var getSpan = exports.getSpan = function(obj) {
    if (!obj.origin) return;
    if (obj.originNode) {
      var node = obj.originNode;
      if (/^Function/.test(node.type) && node.id) node = node.id;
      return {
        origin: obj.origin,
        node: node
      };
    }
    if (obj.span) return {
      origin: obj.origin,
      span: obj.span
    };
  };
  var storeSpan = exports.storeSpan = function(srv, query, span, target) {
    target.origin = span.origin;
    if (span.span) {
      var m = /^(\d+)\[(\d+):(\d+)\]-(\d+)\[(\d+):(\d+)\]$/.exec(span.span);
      target.start = query.lineCharPositions ? {
        line: Number(m[2]),
        ch: Number(m[3])
      } : Number(m[1]);
      target.end = query.lineCharPositions ? {
        line: Number(m[5]),
        ch: Number(m[6])
      } : Number(m[4]);
    } else {
      var file = srv.findFile(span.origin);
      target.start = outputPos(query, file, span.node.start);
      target.end = outputPos(query, file, span.node.end);
    }
  };

  function findDef(srv, query, file) {
    var expr = findExpr(file, query);
    var type = findExprType(srv, query, file, expr);
    if (infer.didGuess()) return {};
    var span = getSpan(type);
    var result = {
      url: type.url,
      doc: parseDoc(query, type.doc),
      origin: type.origin
    };
    if (type.types)
      for (var i = type.types.length - 1; i >= 0; --i) {
        var tp = type.types[i];
        storeTypeDocs(query, tp, result);
        if (!span) span = getSpan(tp);
      }
    if (span && span.node) {
      var spanFile = span.node.sourceFile || srv.findFile(span.origin);
      var start = outputPos(query, spanFile, span.node.start),
        end = outputPos(query, spanFile, span.node.end);
      result.start = start;
      result.end = end;
      result.file = span.origin;
      var cxStart = Math.max(0, span.node.start - 50);
      result.contextOffset = span.node.start - cxStart;
      result.context = spanFile.text.slice(cxStart, cxStart + 50);
    } else if (span) {
      result.file = span.origin;
      storeSpan(srv, query, span, result);
    }
    return clean(result);
  }

  function findRefsToVariable(srv, query, file, expr, checkShadowing) {
    var name = expr.node.name;
    for (var scope = expr.state; scope && !(name in scope.props); scope = scope.prev) {}
    if (!scope) throw ternError("Could not find a definition for " + name);
    var type, refs = [];

    function storeRef(file) {
      return function(node, scopeHere) {
        if (checkShadowing)
          for (var s = scopeHere; s != scope; s = s.prev) {
            var exists = s.hasProp(checkShadowing);
            if (exists)
              throw ternError("Renaming `" + name + "` to `" + checkShadowing + "` would make a variable at line " +
                (asLineChar(file, node.start).line + 1) + " point to the definition at line " +
                (asLineChar(file, exists.name.start).line + 1));
          }
        refs.push({
          file: file.name,
          start: outputPos(query, file, node.start),
          end: outputPos(query, file, node.end)
        });
      };
    }
    if (scope.originNode) {
      type = "local";
      if (checkShadowing) {
        for (var prev = scope.prev; prev; prev = prev.prev)
          if (checkShadowing in prev.props) break;
        if (prev) infer.findRefs(scope.originNode, scope, checkShadowing, prev, function(node) {
          throw ternError("Renaming `" + name + "` to `" + checkShadowing + "` would shadow the definition used at line " +
            (asLineChar(file, node.start).line + 1));
        });
      }
      infer.findRefs(scope.originNode, scope, name, scope, storeRef(file));
    } else {
      type = "global";
      for (var i = 0; i < srv.files.length; ++i) {
        var cur = srv.files[i];
        infer.findRefs(cur.ast, cur.scope, name, scope, storeRef(cur));
      }
    }
    return {
      refs: refs,
      type: type,
      name: name
    };
  }

  function findRefsToProperty(srv, query, expr, prop) {
    var objType = infer.expressionType(expr).getObjType();
    if (!objType) throw ternError("Couldn't determine type of base object.");
    var refs = [];

    function storeRef(file) {
      return function(node) {
        refs.push({
          file: file.name,
          start: outputPos(query, file, node.start),
          end: outputPos(query, file, node.end)
        });
      };
    }
    for (var i = 0; i < srv.files.length; ++i) {
      var cur = srv.files[i];
      infer.findPropRefs(cur.ast, cur.scope, objType, prop.name, storeRef(cur));
    }
    return {
      refs: refs,
      name: prop.name
    };
  }

  function findRefs(srv, query, file) {
    var expr = findExprOrThrow(file, query, true);
    if (expr && expr.node.type == "Identifier") {
      return findRefsToVariable(srv, query, file, expr);
    } else if (expr && expr.node.type == "MemberExpression" && !expr.node.computed) {
      var p = expr.node.property;
      expr.node = expr.node.object;
      return findRefsToProperty(srv, query, expr, p);
    } else if (expr && expr.node.type == "ObjectExpression") {
      var pos = resolvePos(file, query.end);
      for (var i = 0; i < expr.node.properties.length; ++i) {
        var k = expr.node.properties[i].key;
        if (k.start <= pos && k.end >= pos)
          return findRefsToProperty(srv, query, expr, k);
      }
    }
    throw ternError("Not at a variable or property name.");
  }

  function buildRename(srv, query, file) {
    if (typeof query.newName != "string") throw ternError(".query.newName should be a string");
    var expr = findExprOrThrow(file, query);
    if (!expr || expr.node.type != "Identifier") throw ternError("Not at a variable.");
    var data = findRefsToVariable(srv, query, file, expr, query.newName),
      refs = data.refs;
    delete data.refs;
    data.files = srv.files.map(function(f) {
      return f.name;
    });
    var changes = data.changes = [];
    for (var i = 0; i < refs.length; ++i) {
      var use = refs[i];
      use.text = query.newName;
      changes.push(use);
    }
    return data;
  }

  function listFiles(srv) {
    return {
      files: srv.files.map(function(f) {
        return f.name;
      })
    };
  }
  exports.version = "0.16.1";
});;
/*! RESOURCE: /scripts/codemirror_tern/def.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    return exports.init = mod;
  if (typeof define == "function" && define.amd)
    return define({
      init: mod
    });
  tern.def = {
    init: mod
  };
})(function(exports, infer) {
  "use strict";

  function hop(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  var TypeParser = exports.TypeParser = function(spec, start, base, forceNew) {
    this.pos = start || 0;
    this.spec = spec;
    this.base = base;
    this.forceNew = forceNew;
  };

  function unwrapType(type, self, args) {
    return type.call ? type(self, args) : type;
  }

  function extractProp(type, prop) {
    if (prop == "!ret") {
      if (type.retval) return type.retval;
      var rv = new infer.AVal;
      type.propagate(new infer.IsCallee(infer.ANull, [], null, rv));
      return rv;
    } else {
      return type.getProp(prop);
    }
  }

  function computedFunc(name, args, retType, generator) {
    return function(self, cArgs) {
      var realArgs = [];
      for (var i = 0; i < args.length; i++) realArgs.push(unwrapType(args[i], self, cArgs));
      return new infer.Fn(name, infer.ANull, realArgs, unwrapType(retType, self, cArgs), generator);
    };
  }

  function computedUnion(types) {
    return function(self, args) {
      var union = new infer.AVal;
      for (var i = 0; i < types.length; i++) unwrapType(types[i], self, args).propagate(union);
      union.maxWeight = 1e5;
      return union;
    };
  }

  function computedArray(inner) {
    return function(self, args) {
      return new infer.Arr(inner(self, args));
    };
  }

  function computedTuple(types) {
    return function(self, args) {
      return new infer.Arr(types.map(function(tp) {
        return unwrapType(tp, self, args)
      }))
    }
  }
  TypeParser.prototype = {
    eat: function(str) {
      if (str.length == 1 ? this.spec.charAt(this.pos) == str : this.spec.indexOf(str, this.pos) == this.pos) {
        this.pos += str.length;
        return true;
      }
    },
    word: function(re) {
      var word = "",
        ch, re = re || /[\w$]/;
      while ((ch = this.spec.charAt(this.pos)) && re.test(ch)) {
        word += ch;
        ++this.pos;
      }
      return word;
    },
    error: function() {
      throw new Error("Unrecognized type spec: " + this.spec + " (at " + this.pos + ")");
    },
    parseFnType: function(comp, name, top, generator) {
      var args = [],
        names = [],
        computed = false;
      if (!this.eat(")"))
        for (var i = 0;; ++i) {
          var colon = this.spec.indexOf(": ", this.pos),
            argname;
          if (colon != -1) {
            argname = this.spec.slice(this.pos, colon);
            if (/^[$\w?]+$/.test(argname))
              this.pos = colon + 2;
            else
              argname = null;
          }
          names.push(argname);
          var argType = this.parseType(comp);
          if (argType.call) computed = true;
          args.push(argType);
          if (!this.eat(", ")) {
            this.eat(")") || this.error();
            break;
          }
        }
      var retType, computeRet, computeRetStart, fn;
      if (this.eat(" -> ")) {
        var retStart = this.pos;
        retType = this.parseType(true);
        if (retType.call && !computed) {
          computeRet = retType;
          retType = infer.ANull;
          computeRetStart = retStart;
        }
      } else {
        retType = infer.ANull;
      }
      if (computed) return computedFunc(name, args, retType, generator);
      if (top && (fn = this.base))
        infer.Fn.call(this.base, name, infer.ANull, args, names, retType, generator);
      else
        fn = new infer.Fn(name, infer.ANull, args, names, retType, generator);
      if (computeRet) fn.computeRet = computeRet;
      if (computeRetStart != null) fn.computeRetSource = this.spec.slice(computeRetStart, this.pos);
      return fn;
    },
    parseType: function(comp, name, top) {
      var main = this.parseTypeMaybeProp(comp, name, top);
      if (!this.eat("|")) return main;
      var types = [main],
        computed = main.call;
      for (;;) {
        var next = this.parseTypeMaybeProp(comp, name, top);
        types.push(next);
        if (next.call) computed = true;
        if (!this.eat("|")) break;
      }
      if (computed) return computedUnion(types);
      var union = new infer.AVal;
      for (var i = 0; i < types.length; i++) types[i].propagate(union);
      union.maxWeight = 1e5;
      return union;
    },
    parseTypeMaybeProp: function(comp, name, top) {
      var result = this.parseTypeInner(comp, name, top);
      while (comp && this.eat(".")) result = this.extendWithProp(result);
      return result;
    },
    extendWithProp: function(base) {
      var propName = this.word(/[\w<>$!:]/) || this.error();
      if (base.apply) return function(self, args) {
        return extractProp(base(self, args), propName);
      };
      return extractProp(base, propName);
    },
    parseTypeInner: function(comp, name, top) {
      var gen
      if (this.eat("fn(") || (gen = this.eat("fn*("))) {
        return this.parseFnType(comp, name, top, gen);
      } else if (this.eat("[")) {
        var inner = this.parseType(comp),
          types, computed = inner.call
        while (this.eat(", ")) {
          if (!types) types = [inner]
          var next = this.parseType(comp)
          types.push(next)
          computed = computed || next.call
        }
        this.eat("]") || this.error()
        if (computed) return types ? computedTuple(types) : computedArray(inner)
        if (top && this.base) {
          infer.Arr.call(this.base, types || inner)
          return this.base
        }
        return new infer.Arr(types || inner)
      } else if (this.eat("+")) {
        var path = this.word(/[\w$<>\.:!]/)
        var base = infer.cx().localDefs[path + ".prototype"]
        if (!base) {
          var base = parsePath(path);
          if (!(base instanceof infer.Obj)) return base;
          var proto = descendProps(base, ["prototype"])
          if (proto && (proto = proto.getObjType()))
            base = proto
        }
        if (comp && this.eat("[")) return this.parsePoly(base);
        if (top && this.forceNew) return new infer.Obj(base);
        return infer.getInstance(base);
      } else if (this.eat(":")) {
        var name = this.word(/[\w$\.]/)
        return infer.getSymbol(name)
      } else if (comp && this.eat("!")) {
        var arg = this.word(/\d/);
        if (arg) {
          arg = Number(arg);
          return function(_self, args) {
            return args[arg] || infer.ANull;
          };
        } else if (this.eat("this")) {
          return function(self) {
            return self;
          };
        } else if (this.eat("custom:")) {
          var fname = this.word(/[\w$]/);
          return customFunctions[fname] || function() {
            return infer.ANull;
          };
        } else {
          return this.fromWord("!" + this.word(/[\w$<>\.!:]/));
        }
      } else if (this.eat("?")) {
        return infer.ANull;
      } else {
        return this.fromWord(this.word(/[\w$<>\.!:`]/));
      }
    },
    fromWord: function(spec) {
      var cx = infer.cx();
      switch (spec) {
        case "number":
          return cx.num;
        case "string":
          return cx.str;
        case "bool":
          return cx.bool;
        case "<top>":
          return cx.topScope;
      }
      if (cx.localDefs && spec in cx.localDefs) return cx.localDefs[spec];
      return parsePath(spec);
    },
    parsePoly: function(base) {
      var propName = "<i>",
        match;
      if (match = this.spec.slice(this.pos).match(/^\s*([\w$:]+)\s*=\s*/)) {
        propName = match[1];
        this.pos += match[0].length;
      }
      var value = this.parseType(true);
      if (!this.eat("]")) this.error();
      if (value.call) return function(self, args) {
        var instance = new infer.Obj(base);
        value(self, args).propagate(instance.defProp(propName));
        return instance;
      };
      var instance = new infer.Obj(base);
      value.propagate(instance.defProp(propName));
      return instance;
    }
  };

  function parseType(spec, name, base, forceNew) {
    var type = new TypeParser(spec, null, base, forceNew).parseType(false, name, true);
    if (/^fn\(/.test(spec))
      for (var i = 0; i < type.args.length; ++i)(function(i) {
        var arg = type.args[i];
        if (arg instanceof infer.Fn && arg.args && arg.args.length) addEffect(type, function(_self, fArgs) {
          var fArg = fArgs[i];
          if (fArg) fArg.propagate(new infer.IsCallee(infer.cx().topScope, arg.args, null, infer.ANull));
        });
      })(i);
    return type;
  }

  function addEffect(fn, handler, replaceRet) {
    var oldCmp = fn.computeRet,
      rv = fn.retval;
    fn.computeRet = function(self, args, argNodes) {
      var handled = handler(self, args, argNodes);
      var old = oldCmp ? oldCmp(self, args, argNodes) : rv;
      return replaceRet ? handled : old;
    };
  }
  var parseEffect = exports.parseEffect = function(effect, fn) {
    var m;
    if (effect.indexOf("propagate ") == 0) {
      var p = new TypeParser(effect, 10);
      var origin = p.parseType(true);
      if (!p.eat(" ")) p.error();
      var target = p.parseType(true);
      addEffect(fn, function(self, args) {
        unwrapType(origin, self, args).propagate(unwrapType(target, self, args));
      });
    } else if (effect.indexOf("call ") == 0) {
      var andRet = effect.indexOf("and return ", 5) == 5;
      var p = new TypeParser(effect, andRet ? 16 : 5);
      var getCallee = p.parseType(true),
        getSelf = null,
        getArgs = [];
      if (p.eat(" this=")) getSelf = p.parseType(true);
      while (p.eat(" ")) getArgs.push(p.parseType(true));
      addEffect(fn, function(self, args) {
        var callee = unwrapType(getCallee, self, args);
        var slf = getSelf ? unwrapType(getSelf, self, args) : infer.ANull,
          as = [];
        for (var i = 0; i < getArgs.length; ++i) as.push(unwrapType(getArgs[i], self, args));
        var result = andRet ? new infer.AVal : infer.ANull;
        callee.propagate(new infer.IsCallee(slf, as, null, result));
        return result;
      }, andRet);
    } else if (m = effect.match(/^custom (\S+)\s*(.*)/)) {
      var customFunc = customFunctions[m[1]];
      if (customFunc) addEffect(fn, m[2] ? customFunc(m[2]) : customFunc);
    } else if (effect.indexOf("copy ") == 0) {
      var p = new TypeParser(effect, 5);
      var getFrom = p.parseType(true);
      p.eat(" ");
      var getTo = p.parseType(true);
      addEffect(fn, function(self, args) {
        var from = unwrapType(getFrom, self, args),
          to = unwrapType(getTo, self, args);
        from.forAllProps(function(prop, val, local) {
          if (local && prop != "<i>")
            to.propagate(new infer.DefProp(prop, val));
        });
      });
    } else {
      throw new Error("Unknown effect type: " + effect);
    }
  };
  var currentTopScope;
  var parsePath = exports.parsePath = function(path, scope) {
    var cx = infer.cx(),
      cached = cx.paths[path],
      origPath = path;
    if (cached != null) return cached;
    cx.paths[path] = infer.ANull;
    var base = scope || currentTopScope || cx.topScope;
    if (cx.localDefs)
      for (var name in cx.localDefs) {
        if (path.indexOf(name) == 0) {
          if (path == name) return cx.paths[path] = cx.localDefs[path];
          if (path.charAt(name.length) == ".") {
            base = cx.localDefs[name];
            path = path.slice(name.length + 1);
            break;
          }
        }
      }
    var result = descendProps(base, path.split("."))
    cx.paths[origPath] = result == infer.ANull ? null : result
    return result
  }

  function descendProps(base, parts) {
    for (var i = 0; i < parts.length && base != infer.ANull; ++i) {
      var prop = parts[i];
      if (prop.charAt(0) == "!") {
        if (prop == "!proto") {
          base = (base instanceof infer.Obj && base.proto) || infer.ANull;
        } else {
          var fn = base.getFunctionType();
          if (!fn) {
            base = infer.ANull;
          } else if (prop == "!ret") {
            base = fn.retval && fn.retval.getType(false) || infer.ANull;
          } else {
            var arg = fn.args && fn.args[Number(prop.slice(1))];
            base = (arg && arg.getType(false)) || infer.ANull;
          }
        }
      } else if (base instanceof infer.Obj &&
        (prop == "prototype" && base instanceof infer.Fn || base.hasProp(prop))) {
        var propVal = base.getProp(prop);
        if (!propVal || propVal.isEmpty())
          base = infer.ANull;
        else
          base = propVal.types[0];
      } else {
        base = infer.ANull;
      }
    }
    return base;
  }

  function emptyObj(ctor) {
    var empty = Object.create(ctor.prototype);
    empty.props = Object.create(null);
    empty.isShell = true;
    return empty;
  }

  function isSimpleAnnotation(spec) {
    if (!spec["!type"] || /^(fn\(|\[)/.test(spec["!type"])) return false;
    for (var prop in spec)
      if (prop != "!type" && prop != "!doc" && prop != "!url" && prop != "!span" && prop != "!data")
        return false;
    return true;
  }

  function passOne(base, spec, path) {
    if (!base) {
      var tp = spec["!type"];
      if (tp) {
        if (/^fn\(/.test(tp)) base = emptyObj(infer.Fn);
        else if (tp.charAt(0) == "[") base = emptyObj(infer.Arr);
        else throw new Error("Invalid !type spec: " + tp);
      } else if (spec["!stdProto"]) {
        base = infer.cx().protos[spec["!stdProto"]];
      } else {
        base = emptyObj(infer.Obj);
      }
      base.name = path;
    }
    for (var name in spec)
      if (hop(spec, name) && name.charCodeAt(0) != 33) {
        var inner = spec[name];
        if (typeof inner == "string" || isSimpleAnnotation(inner)) continue;
        var prop = base.defProp(name);
        passOne(prop.getObjType(), inner, path ? path + "." + name : name).propagate(prop);
      }
    return base;
  }

  function passTwo(base, spec, path) {
    if (base.isShell) {
      delete base.isShell;
      var tp = spec["!type"];
      if (tp) {
        parseType(tp, path, base);
      } else {
        var proto = spec["!proto"] && parseType(spec["!proto"]);
        infer.Obj.call(base, proto instanceof infer.Obj ? proto : true, path);
      }
    }
    var effects = spec["!effects"];
    if (effects && base instanceof infer.Fn)
      for (var i = 0; i < effects.length; ++i)
        parseEffect(effects[i], base);
    copyInfo(spec, base);
    for (var name in spec)
      if (hop(spec, name) && name.charCodeAt(0) != 33) {
        var inner = spec[name],
          known = base.defProp(name),
          innerPath = path ? path + "." + name : name;
        if (typeof inner == "string") {
          if (known.isEmpty()) parseType(inner, innerPath).propagate(known);
        } else {
          if (!isSimpleAnnotation(inner))
            passTwo(known.getObjType(), inner, innerPath);
          else if (known.isEmpty())
            parseType(inner["!type"], innerPath, null, true).propagate(known);
          else
            continue;
          if (inner["!doc"]) known.doc = inner["!doc"];
          if (inner["!url"]) known.url = inner["!url"];
          if (inner["!span"]) known.span = inner["!span"];
        }
      }
    return base;
  }

  function copyInfo(spec, type) {
    if (spec["!doc"]) type.doc = spec["!doc"];
    if (spec["!url"]) type.url = spec["!url"];
    if (spec["!span"]) type.span = spec["!span"];
    if (spec["!data"]) type.metaData = spec["!data"];
  }

  function doLoadEnvironment(data, scope) {
    var cx = infer.cx(),
      server = cx.parent
    infer.addOrigin(cx.curOrigin = data["!name"] || "env#" + cx.origins.length);
    cx.localDefs = cx.definitions[cx.curOrigin] = Object.create(null);
    if (server) server.signal("preLoadDef", data)
    passOne(scope, data);
    var def = data["!define"];
    if (def) {
      for (var name in def) {
        var spec = def[name];
        cx.localDefs[name] = typeof spec == "string" ? parsePath(spec) : passOne(null, spec, name);
      }
      for (var name in def) {
        var spec = def[name];
        if (typeof spec != "string") passTwo(cx.localDefs[name], def[name], name);
      }
    }
    passTwo(scope, data);
    if (server) server.signal("postLoadDef", data)
    cx.curOrigin = cx.localDefs = null;
  }
  exports.load = function(data, scope) {
    if (!scope) scope = infer.cx().topScope;
    var oldScope = currentTopScope;
    currentTopScope = scope;
    try {
      doLoadEnvironment(data, scope);
    } finally {
      currentTopScope = oldScope;
    }
  };
  exports.parse = function(data, origin, path) {
    var cx = infer.cx();
    if (origin) {
      cx.origin = origin;
      cx.localDefs = cx.definitions[origin];
    }
    try {
      if (typeof data == "string")
        return parseType(data, path);
      else
        return passTwo(passOne(null, data, path), data, path);
    } finally {
      if (origin) cx.origin = cx.localDefs = null;
    }
  };
  var customFunctions = Object.create(null);
  infer.registerFunction = function(name, f) {
    customFunctions[name] = f;
  };
  var IsCreated = infer.constraint({
    construct: function(created, target, spec) {
      this.created = created;
      this.target = target;
      this.spec = spec;
    },
    addType: function(tp) {
      if (tp instanceof infer.Obj && this.created++ < 5) {
        var derived = new infer.Obj(tp),
          spec = this.spec;
        if (spec instanceof infer.AVal) spec = spec.getObjType(false);
        if (spec instanceof infer.Obj)
          for (var prop in spec.props) {
            var cur = spec.props[prop].types[0];
            var p = derived.defProp(prop);
            if (cur && cur instanceof infer.Obj && cur.props.value) {
              var vtp = cur.props.value.getType(false);
              if (vtp) p.addType(vtp);
            }
          }
        this.target.addType(derived);
      }
    }
  });
  infer.registerFunction("Object_create", function(_self, args, argNodes) {
    if (argNodes && argNodes.length && argNodes[0].type == "Literal" && argNodes[0].value == null)
      return new infer.Obj();
    var result = new infer.AVal;
    if (args[0]) args[0].propagate(new IsCreated(0, result, args[1]));
    return result;
  });
  var PropSpec = infer.constraint({
    construct: function(target) {
      this.target = target;
    },
    addType: function(tp) {
      if (!(tp instanceof infer.Obj)) return;
      if (tp.hasProp("value"))
        tp.getProp("value").propagate(this.target);
      else if (tp.hasProp("get"))
        tp.getProp("get").propagate(new infer.IsCallee(infer.ANull, [], null, this.target));
    }
  });
  infer.registerFunction("Object_defineProperty", function(_self, args, argNodes) {
    if (argNodes && argNodes.length >= 3 && argNodes[1].type == "Literal" &&
      typeof argNodes[1].value == "string") {
      var obj = args[0],
        connect = new infer.AVal;
      obj.propagate(new infer.DefProp(argNodes[1].value, connect, argNodes[1]));
      args[2].propagate(new PropSpec(connect));
    }
    return infer.ANull;
  });
  infer.registerFunction("Object_defineProperties", function(_self, args, argNodes) {
    if (args.length >= 2) {
      var obj = args[0];
      args[1].forAllProps(function(prop, val, local) {
        if (!local) return;
        var connect = new infer.AVal;
        obj.propagate(new infer.DefProp(prop, connect, argNodes && argNodes[1]));
        val.propagate(new PropSpec(connect));
      });
    }
    return infer.ANull;
  });
  var IsBound = infer.constraint({
    construct: function(self, args, target) {
      this.self = self;
      this.args = args;
      this.target = target;
    },
    addType: function(tp) {
      if (!(tp instanceof infer.Fn)) return;
      this.target.addType(new infer.Fn(tp.name, infer.ANull, tp.args.slice(this.args.length),
        tp.argNames.slice(this.args.length), tp.retval, tp.generator));
      this.self.propagate(tp.self);
      for (var i = 0; i < Math.min(tp.args.length, this.args.length); ++i)
        this.args[i].propagate(tp.args[i]);
    }
  });
  infer.registerFunction("Function_bind", function(self, args) {
    if (!args.length) return infer.ANull;
    var result = new infer.AVal;
    self.propagate(new IsBound(args[0], args.slice(1), result));
    return result;
  });
  infer.registerFunction("Array_ctor", function(_self, args) {
    var arr = new infer.Arr;
    if (args.length != 1 || !args[0].hasType(infer.cx().num)) {
      var content = arr.getProp("<i>");
      for (var i = 0; i < args.length; ++i) args[i].propagate(content);
    }
    return arr;
  });
  infer.registerFunction("Promise_ctor", function(_self, args, argNodes) {
    var defs6 = infer.cx().definitions.ecma6
    if (!defs6 || args.length < 1) return infer.ANull;
    var self = new infer.Obj(defs6["Promise.prototype"]);
    var valProp = self.defProp(":t", argNodes && argNodes[0]);
    var valArg = new infer.AVal;
    valArg.propagate(valProp);
    var exec = new infer.Fn("execute", infer.ANull, [valArg], ["value"], infer.ANull);
    var reject = defs6.Promise_reject;
    args[0].propagate(new infer.IsCallee(infer.ANull, [exec, reject], null, infer.ANull));
    return self;
  });
  var PromiseResolvesTo = infer.constraint({
    construct: function(output) {
      this.output = output;
    },
    addType: function(tp) {
      if (tp.constructor == infer.Obj && tp.name == "Promise" && tp.hasProp(":t"))
        tp.getProp(":t").propagate(this.output);
      else
        tp.propagate(this.output);
    }
  });
  var WG_PROMISE_KEEP_VALUE = 50;
  infer.registerFunction("Promise_then", function(self, args, argNodes) {
    var fn = args.length && args[0].getFunctionType();
    var defs6 = infer.cx().definitions.ecma6
    if (!fn || !defs6) return self;
    var result = new infer.Obj(defs6["Promise.prototype"]);
    var value = result.defProp(":t", argNodes && argNodes[0]),
      ty;
    if (fn.retval.isEmpty() && (ty = self.getType()) instanceof infer.Obj && ty.hasProp(":t"))
      ty.getProp(":t").propagate(value, WG_PROMISE_KEEP_VALUE);
    fn.retval.propagate(new PromiseResolvesTo(value));
    return result;
  });
  infer.registerFunction("getOwnPropertySymbols", function(_self, args) {
    if (!args.length) return infer.ANull
    var result = new infer.AVal
    args[0].forAllProps(function(prop, _val, local) {
      if (local && prop.charAt(0) == ":") result.addType(infer.getSymbol(prop.slice(1)))
    })
    return result
  })
  infer.registerFunction("getSymbol", function(_self, _args, argNodes) {
    if (argNodes.length && argNodes[0].type == "Literal" && typeof argNodes[0].value == "string")
      return infer.getSymbol(argNodes[0].value)
    else
      return infer.ANull
  })
  return exports;
});;
/*! RESOURCE: /scripts/codemirror_tern/comment.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    return mod(exports);
  if (typeof define == "function" && define.amd)
    return define(["exports"], mod);
  mod(tern.comment || (tern.comment = {}));
})(function(exports) {
  function isSpace(ch) {
    return (ch < 14 && ch > 8) || ch === 32 || ch === 160;
  }

  function onOwnLine(text, pos) {
    for (; pos > 0; --pos) {
      var ch = text.charCodeAt(pos - 1);
      if (ch == 10) break;
      if (!isSpace(ch)) return false;
    }
    return true;
  }
  exports.commentsBefore = function(text, pos) {
    var found = null,
      emptyLines = 0,
      topIsLineComment;
    out: while (pos > 0) {
      var prev = text.charCodeAt(pos - 1);
      if (prev == 10) {
        for (var scan = --pos, sawNonWS = false; scan > 0; --scan) {
          prev = text.charCodeAt(scan - 1);
          if (prev == 47 && text.charCodeAt(scan - 2) == 47) {
            if (!onOwnLine(text, scan - 2)) break out;
            var content = text.slice(scan, pos);
            if (!emptyLines && topIsLineComment) found[0] = content + "\n" + found[0];
            else(found || (found = [])).unshift(content);
            topIsLineComment = true;
            emptyLines = 0;
            pos = scan - 2;
            break;
          } else if (prev == 10) {
            if (!sawNonWS && ++emptyLines > 1) break out;
            break;
          } else if (!sawNonWS && !isSpace(prev)) {
            sawNonWS = true;
          }
        }
      } else if (prev == 47 && text.charCodeAt(pos - 2) == 42) {
        for (var scan = pos - 2; scan > 1; --scan) {
          if (text.charCodeAt(scan - 1) == 42 && text.charCodeAt(scan - 2) == 47) {
            if (!onOwnLine(text, scan - 2)) break out;
            (found || (found = [])).unshift(text.slice(scan, pos - 2));
            topIsLineComment = false;
            emptyLines = 0;
            break;
          }
        }
        pos = scan - 2;
      } else if (isSpace(prev)) {
        --pos;
      } else {
        break;
      }
    }
    return found;
  };
  exports.commentAfter = function(text, pos) {
    while (pos < text.length) {
      var next = text.charCodeAt(pos);
      if (next == 47) {
        var after = text.charCodeAt(pos + 1),
          end;
        if (after == 47)
          end = text.indexOf("\n", pos + 2);
        else if (after == 42)
          end = text.indexOf("*/", pos + 2);
        else
          return;
        return text.slice(pos + 2, end < 0 ? text.length : end);
      } else if (isSpace(next)) {
        ++pos;
      }
    }
  };
  exports.ensureCommentsBefore = function(text, node) {
    if (node.hasOwnProperty("commentsBefore")) return node.commentsBefore;
    return node.commentsBefore = exports.commentsBefore(text, node.start);
  };
});;
/*! RESOURCE: /scripts/codemirror_tern/infer.js */
(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object")
    return mod(exports, require("acorn"), require("acorn/dist/acorn_loose"), require("acorn/dist/walk"),
      require("./def"), require("./signal"));
  if (typeof define == "function" && define.amd)
    return define(["exports", "acorn/dist/acorn", "acorn/dist/acorn_loose", "acorn/dist/walk", "./def", "./signal"], mod);
  mod(root.tern || (root.tern = {}), acorn, acorn, acorn.walk, tern.def, tern.signal);
})(this, function(exports, acorn, acorn_loose, walk, def, signal) {
  "use strict";
  var toString = exports.toString = function(type, maxDepth, parent) {
    if (!type || type == parent || maxDepth && maxDepth < -3) return "?";
    return type.toString(maxDepth, parent);
  };
  var ANull = exports.ANull = signal.mixin({
    addType: function() {},
    propagate: function() {},
    getProp: function() {
      return ANull;
    },
    forAllProps: function() {},
    hasType: function() {
      return false;
    },
    isEmpty: function() {
      return true;
    },
    getFunctionType: function() {},
    getObjType: function() {},
    getSymbolType: function() {},
    getType: function() {},
    gatherProperties: function() {},
    propagatesTo: function() {},
    typeHint: function() {},
    propHint: function() {},
    toString: function() {
      return "?";
    }
  });

  function extend(proto, props) {
    var obj = Object.create(proto);
    if (props)
      for (var prop in props) obj[prop] = props[prop];
    return obj;
  }
  var WG_DEFAULT = 100,
    WG_NEW_INSTANCE = 90,
    WG_MADEUP_PROTO = 10,
    WG_MULTI_MEMBER = 6,
    WG_CATCH_ERROR = 6,
    WG_PHANTOM_OBJ = 1,
    WG_GLOBAL_THIS = 90,
    WG_SPECULATIVE_THIS = 2,
    WG_SPECULATIVE_PROTO_THIS = 4;
  var AVal = exports.AVal = function() {
    this.types = [];
    this.forward = null;
    this.maxWeight = 0;
  };
  AVal.prototype = extend(ANull, {
    addType: function(type, weight) {
      weight = weight || WG_DEFAULT;
      if (this.maxWeight < weight) {
        this.maxWeight = weight;
        if (this.types.length == 1 && this.types[0] == type) return;
        this.types.length = 0;
      } else if (this.maxWeight > weight || this.types.indexOf(type) > -1) {
        return;
      }
      this.signal("addType", type);
      this.types.push(type);
      var forward = this.forward;
      if (forward) withWorklist(function(add) {
        for (var i = 0; i < forward.length; ++i) add(type, forward[i], weight);
      });
    },
    propagate: function(target, weight) {
      if (target == ANull || (target instanceof Type && this.forward && this.forward.length > 2)) return;
      if (weight && weight != WG_DEFAULT) target = new Muffle(target, weight);
      (this.forward || (this.forward = [])).push(target);
      var types = this.types;
      if (types.length) withWorklist(function(add) {
        for (var i = 0; i < types.length; ++i) add(types[i], target, weight);
      });
    },
    getProp: function(prop) {
      if (prop == "__proto__" || prop == "✖") return ANull;
      var found = (this.props || (this.props = Object.create(null)))[prop];
      if (!found) {
        found = this.props[prop] = new AVal;
        this.propagate(new GetProp(prop, found));
      }
      return found;
    },
    forAllProps: function(c) {
      this.propagate(new ForAllProps(c));
    },
    hasType: function(type) {
      return this.types.indexOf(type) > -1;
    },
    isEmpty: function() {
      return this.types.length === 0;
    },
    getFunctionType: function() {
      for (var i = this.types.length - 1; i >= 0; --i)
        if (this.types[i] instanceof Fn) return this.types[i];
    },
    getObjType: function() {
      var seen = null;
      for (var i = this.types.length - 1; i >= 0; --i) {
        var type = this.types[i];
        if (!(type instanceof Obj)) continue;
        if (type.name) return type;
        if (!seen) seen = type;
      }
      return seen;
    },
    getSymbolType: function() {
      for (var i = this.types.length - 1; i >= 0; --i)
        if (this.types[i] instanceof Sym) return this.types[i]
    },
    getType: function(guess) {
      if (this.types.length === 0 && guess !== false) return this.makeupType();
      if (this.types.length === 1) return this.types[0];
      return canonicalType(this.types);
    },
    toString: function(maxDepth, parent) {
      if (this.types.length == 0) return toString(this.makeupType(), maxDepth, parent);
      if (this.types.length == 1) return toString(this.types[0], maxDepth, parent);
      var simplified = simplifyTypes(this.types);
      if (simplified.length > 2) return "?";
      return simplified.map(function(tp) {
        return toString(tp, maxDepth, parent);
      }).join("|");
    },
    makeupPropType: function(obj) {
      var propName = this.propertyName;
      var protoProp = obj.proto && obj.proto.hasProp(propName);
      if (protoProp) {
        var fromProto = protoProp.getType();
        if (fromProto) return fromProto;
      }
      if (propName != "<i>") {
        var computedProp = obj.hasProp("<i>");
        if (computedProp) return computedProp.getType();
      } else if (obj.props["<i>"] != this) {
        for (var prop in obj.props) {
          var val = obj.props[prop];
          if (!val.isEmpty()) return val.getType();
        }
      }
    },
    makeupType: function() {
      var computed = this.propertyOf && this.makeupPropType(this.propertyOf);
      if (computed) return computed;
      if (!this.forward) return null;
      for (var i = this.forward.length - 1; i >= 0; --i) {
        var hint = this.forward[i].typeHint();
        if (hint && !hint.isEmpty()) {
          guessing = true;
          return hint;
        }
      }
      var props = Object.create(null),
        foundProp = null;
      for (var i = 0; i < this.forward.length; ++i) {
        var prop = this.forward[i].propHint();
        if (prop && prop != "length" && prop != "<i>" && prop != "✖" && prop != cx.completingProperty) {
          props[prop] = true;
          foundProp = prop;
        }
      }
      if (!foundProp) return null;
      var objs = objsWithProp(foundProp);
      if (objs) {
        var matches = [];
        search: for (var i = 0; i < objs.length; ++i) {
          var obj = objs[i];
          for (var prop in props)
            if (!obj.hasProp(prop)) continue search;
          if (obj.hasCtor) obj = getInstance(obj);
          matches.push(obj);
        }
        var canon = canonicalType(matches);
        if (canon) {
          guessing = true;
          return canon;
        }
      }
    },
    typeHint: function() {
      return this.types.length ? this.getType() : null;
    },
    propagatesTo: function() {
      return this;
    },
    gatherProperties: function(f, depth) {
      for (var i = 0; i < this.types.length; ++i)
        this.types[i].gatherProperties(f, depth);
    },
    guessProperties: function(f) {
      if (this.forward)
        for (var i = 0; i < this.forward.length; ++i) {
          var prop = this.forward[i].propHint();
          if (prop) f(prop, null, 0);
        }
      var guessed = this.makeupType();
      if (guessed) guessed.gatherProperties(f);
    }
  });

  function similarAVal(a, b, depth) {
    var typeA = a.getType(false),
      typeB = b.getType(false);
    if (!typeA || !typeB) return true;
    return similarType(typeA, typeB, depth);
  }

  function similarType(a, b, depth) {
    if (!a || depth >= 5) return b;
    if (!a || a == b) return a;
    if (!b) return a;
    if (a.constructor != b.constructor) return false;
    if (a.constructor == Arr) {
      var innerA = a.getProp("<i>").getType(false);
      if (!innerA) return b;
      var innerB = b.getProp("<i>").getType(false);
      if (!innerB || similarType(innerA, innerB, depth + 1)) return b;
    } else if (a.constructor == Obj) {
      var propsA = 0,
        propsB = 0,
        same = 0;
      for (var prop in a.props) {
        propsA++;
        if (prop in b.props && similarAVal(a.props[prop], b.props[prop], depth + 1))
          same++;
      }
      for (var prop in b.props) propsB++;
      if (propsA && propsB && same < Math.max(propsA, propsB) / 2) return false;
      return propsA > propsB ? a : b;
    } else if (a.constructor == Fn) {
      if (a.args.length != b.args.length ||
        !a.args.every(function(tp, i) {
          return similarAVal(tp, b.args[i], depth + 1);
        }) ||
        !similarAVal(a.retval, b.retval, depth + 1) || !similarAVal(a.self, b.self, depth + 1))
        return false;
      return a;
    } else {
      return false;
    }
  }
  var simplifyTypes = exports.simplifyTypes = function(types) {
    var found = [];
    outer: for (var i = 0; i < types.length; ++i) {
      var tp = types[i];
      for (var j = 0; j < found.length; j++) {
        var similar = similarType(tp, found[j], 0);
        if (similar) {
          found[j] = similar;
          continue outer;
        }
      }
      found.push(tp);
    }
    return found;
  };

  function canonicalType(types) {
    var arrays = 0,
      fns = 0,
      objs = 0,
      prim = null;
    for (var i = 0; i < types.length; ++i) {
      var tp = types[i];
      if (tp instanceof Arr) ++arrays;
      else if (tp instanceof Fn) ++fns;
      else if (tp instanceof Obj) ++objs;
      else if (tp instanceof Prim) {
        if (prim && tp.name != prim.name) return null;
        prim = tp;
      }
    }
    var kinds = (arrays && 1) + (fns && 1) + (objs && 1) + (prim && 1);
    if (kinds > 1) return null;
    if (prim) return prim;
    var maxScore = 0,
      maxTp = null;
    for (var i = 0; i < types.length; ++i) {
      var tp = types[i],
        score = 0;
      if (arrays) {
        score = tp.getProp("<i>").isEmpty() ? 1 : 2;
      } else if (fns) {
        score = 1;
        for (var j = 0; j < tp.args.length; ++j)
          if (!tp.args[j].isEmpty()) ++score;
        if (!tp.retval.isEmpty()) ++score;
      } else if (objs) {
        score = tp.name ? 100 : 2;
      }
      if (score >= maxScore) {
        maxScore = score;
        maxTp = tp;
      }
    }
    return maxTp;
  }
  var constraint = exports.constraint = function(methods) {
    var ctor = function() {
      this.origin = cx.curOrigin;
      this.construct.apply(this, arguments);
    };
    ctor.prototype = Object.create(ANull);
    for (var m in methods)
      if (methods.hasOwnProperty(m)) ctor.prototype[m] = methods[m];
    return ctor;
  };
  var GetProp = constraint({
    construct: function(prop, target) {
      this.prop = prop;
      this.target = target;
    },
    addType: function(type, weight) {
      if (type.getProp)
        type.getProp(this.prop).propagate(this.target, weight);
    },
    propHint: function() {
      return this.prop;
    },
    propagatesTo: function() {
      if (this.prop == "<i>" || !/[^\w_]/.test(this.prop))
        return {
          target: this.target,
          pathExt: "." + this.prop
        };
    }
  });
  var DefProp = exports.PropHasSubset = exports.DefProp = constraint({
    construct: function(prop, type, originNode) {
      this.prop = prop;
      this.type = type;
      this.originNode = originNode;
    },
    addType: function(type, weight) {
      if (!(type instanceof Obj)) return;
      var prop = type.defProp(this.prop, this.originNode);
      if (!prop.origin) prop.origin = this.origin;
      this.type.propagate(prop, weight);
    },
    propHint: function() {
      return this.prop;
    }
  });
  var ForAllProps = constraint({
    construct: function(c) {
      this.c = c;
    },
    addType: function(type) {
      if (!(type instanceof Obj)) return;
      type.forAllProps(this.c);
    }
  });

  function withDisabledComputing(fn, body) {
    cx.disabledComputing = {
      fn: fn,
      prev: cx.disabledComputing
    };
    var result = body();
    cx.disabledComputing = cx.disabledComputing.prev;
    return result;
  }
  var IsCallee = exports.IsCallee = constraint({
    construct: function(self, args, argNodes, retval) {
      this.self = self;
      this.args = args;
      this.argNodes = argNodes;
      this.retval = retval;
      this.disabled = cx.disabledComputing;
    },
    addType: function(fn, weight) {
      if (!(fn instanceof Fn)) return;
      for (var i = 0; i < this.args.length; ++i) {
        if (i < fn.args.length) this.args[i].propagate(fn.args[i], weight);
        if (fn.arguments) this.args[i].propagate(fn.arguments, weight);
      }
      this.self.propagate(fn.self, this.self == cx.topScope ? WG_GLOBAL_THIS : weight);
      var compute = fn.computeRet,
        result = fn.retval
      if (compute)
        for (var d = this.disabled; d; d = d.prev)
          if (d.fn == fn || fn.originNode && d.fn.originNode == fn.originNode) compute = null;
      if (compute) {
        var old = cx.disabledComputing;
        cx.disabledComputing = this.disabled;
        result = compute(this.self, this.args, this.argNodes)
        cx.disabledComputing = old;
      }
      maybeIterator(fn, result).propagate(this.retval, weight)
    },
    typeHint: function() {
      var names = [];
      for (var i = 0; i < this.args.length; ++i) names.push("?");
      return new Fn(null, this.self, this.args, names, ANull);
    },
    propagatesTo: function() {
      return {
        target: this.retval,
        pathExt: ".!ret"
      };
    }
  });
  var HasMethodCall = constraint({
    construct: function(propName, args, argNodes, retval) {
      this.propName = propName;
      this.args = args;
      this.argNodes = argNodes;
      this.retval = retval;
      this.disabled = cx.disabledComputing;
    },
    addType: function(obj, weight) {
      var callee = new IsCallee(obj, this.args, this.argNodes, this.retval);
      callee.disabled = this.disabled;
      obj.getProp(this.propName).propagate(callee, weight);
    },
    propHint: function() {
      return this.propName;
    }
  });
  var IsCtor = exports.IsCtor = constraint({
    construct: function(target, noReuse) {
      this.target = target;
      this.noReuse = noReuse;
    },
    addType: function(f, weight) {
      if (!(f instanceof Fn)) return;
      if (cx.parent && !cx.parent.options.reuseInstances) this.noReuse = true;
      f.getProp("prototype").propagate(new IsProto(this.noReuse ? false : f, this.target), weight);
    }
  });
  var getInstance = exports.getInstance = function(obj, ctor) {
    if (ctor === false) return new Obj(obj);
    if (!ctor) ctor = obj.hasCtor;
    if (!obj.instances) obj.instances = [];
    for (var i = 0; i < obj.instances.length; ++i) {
      var cur = obj.instances[i];
      if (cur.ctor == ctor) return cur.instance;
    }
    var instance = new Obj(obj, ctor && ctor.name);
    instance.origin = obj.origin;
    obj.instances.push({
      ctor: ctor,
      instance: instance
    });
    return instance;
  };
  var IsProto = exports.IsProto = constraint({
    construct: function(ctor, target) {
      this.ctor = ctor;
      this.target = target;
    },
    addType: function(o, _weight) {
      if (!(o instanceof Obj)) return;
      if ((this.count = (this.count || 0) + 1) > 8) return;
      if (o == cx.protos.Array)
        this.target.addType(new Arr);
      else
        this.target.addType(getInstance(o, this.ctor));
    }
  });
  var FnPrototype = constraint({
    construct: function(fn) {
      this.fn = fn;
    },
    addType: function(o, _weight) {
      if (o instanceof Obj && !o.hasCtor) {
        o.hasCtor = this.fn;
        var adder = new SpeculativeThis(o, this.fn);
        adder.addType(this.fn);
        o.forAllProps(function(_prop, val, local) {
          if (local) val.propagate(adder);
        });
      }
    }
  });
  var IsAdded = constraint({
    construct: function(other, target) {
      this.other = other;
      this.target = target;
    },
    addType: function(type, weight) {
      if (type == cx.str)
        this.target.addType(cx.str, weight);
      else if (type == cx.num && this.other.hasType(cx.num))
        this.target.addType(cx.num, weight);
    },
    typeHint: function() {
      return this.other;
    }
  });
  var IfObj = exports.IfObj = constraint({
    construct: function(target) {
      this.target = target;
    },
    addType: function(t, weight) {
      if (t instanceof Obj) this.target.addType(t, weight);
    },
    propagatesTo: function() {
      return this.target;
    }
  });
  var SpeculativeThis = constraint({
    construct: function(obj, ctor) {
      this.obj = obj;
      this.ctor = ctor;
    },
    addType: function(tp) {
      if (tp instanceof Fn && tp.self)
        tp.self.addType(getInstance(this.obj, this.ctor), WG_SPECULATIVE_PROTO_THIS);
    }
  });
  var HasProto = constraint({
    construct: function(obj) {
      this.obj = obj
    },
    addType: function(tp) {
      if (tp instanceof Obj && this.obj.proto == cx.protos.Object)
        this.obj.replaceProto(tp)
    }
  });
  var Muffle = constraint({
    construct: function(inner, weight) {
      this.inner = inner;
      this.weight = weight;
    },
    addType: function(tp, weight) {
      this.inner.addType(tp, Math.min(weight, this.weight));
    },
    propagatesTo: function() {
      return this.inner.propagatesTo();
    },
    typeHint: function() {
      return this.inner.typeHint();
    },
    propHint: function() {
      return this.inner.propHint();
    }
  });
  var Type = exports.Type = function() {};
  Type.prototype = extend(ANull, {
    constructor: Type,
    propagate: function(c, w) {
      c.addType(this, w);
    },
    hasType: function(other) {
      return other == this;
    },
    isEmpty: function() {
      return false;
    },
    typeHint: function() {
      return this;
    },
    getType: function() {
      return this;
    }
  });
  var Prim = exports.Prim = function(proto, name) {
    this.name = name;
    this.proto = proto;
  };
  Prim.prototype = extend(Type.prototype, {
    constructor: Prim,
    toString: function() {
      return this.name;
    },
    getProp: function(prop) {
      return this.proto.hasProp(prop) || ANull;
    },
    gatherProperties: function(f, depth) {
      if (this.proto) this.proto.gatherProperties(f, depth);
    }
  });

  function isInteger(str) {
    var c0 = str.charCodeAt(0)
    if (c0 >= 48 && c0 <= 57) return !/\D/.test(str)
    else return false
  }
  var Obj = exports.Obj = function(proto, name) {
    if (!this.props) this.props = Object.create(null);
    this.proto = proto === true ? cx.protos.Object : proto;
    if (this.proto && !(this.proto instanceof Obj)) {
      throw new Error("bad " + Object.keys(this.proto).join())
    }
    if (proto && !name && proto.name && !(this instanceof Fn)) {
      var match = /^(.*)\.prototype$/.exec(this.proto.name);
      if (match) name = match[1];
    }
    this.name = name;
    this.maybeProps = null;
    this.origin = cx.curOrigin;
  };
  Obj.prototype = extend(Type.prototype, {
    constructor: Obj,
    toString: function(maxDepth) {
      if (maxDepth == null) maxDepth = 0;
      if (maxDepth <= 0 && this.name) return this.name;
      var props = [],
        etc = false;
      for (var prop in this.props)
        if (prop != "<i>") {
          if (props.length > 5) {
            etc = true;
            break;
          }
          if (maxDepth)
            props.push(prop + ": " + toString(this.props[prop], maxDepth - 1, this));
          else
            props.push(prop);
        }
      props.sort();
      if (etc) props.push("...");
      return "{" + props.join(", ") + "}";
    },
    hasProp: function(prop, searchProto) {
      if (isInteger(prop)) prop = this.normalizeIntegerProp(prop)
      var found = this.props[prop];
      if (searchProto !== false)
        for (var p = this.proto; p && !found; p = p.proto) found = p.props[prop];
      return found;
    },
    defProp: function(prop, originNode) {
      var found = this.hasProp(prop, false);
      if (found) {
        if (originNode && !found.originNode) found.originNode = originNode;
        return found;
      }
      if (prop == "__proto__" || prop == "✖") return ANull;
      if (isInteger(prop)) prop = this.normalizeIntegerProp(prop)
      var av = this.maybeProps && this.maybeProps[prop];
      if (av) {
        delete this.maybeProps[prop];
        this.maybeUnregProtoPropHandler();
      } else {
        av = new AVal;
        av.propertyOf = this;
        av.propertyName = prop;
      }
      this.props[prop] = av;
      av.originNode = originNode;
      av.origin = cx.curOrigin;
      this.broadcastProp(prop, av, true);
      return av;
    },
    getProp: function(prop) {
      var found = this.hasProp(prop, true) || (this.maybeProps && this.maybeProps[prop]);
      if (found) return found;
      if (prop == "__proto__" || prop == "✖") return ANull;
      if (isInteger(prop)) prop = this.normalizeIntegerProp(prop)
      var av = this.ensureMaybeProps()[prop] = new AVal;
      av.propertyOf = this;
      av.propertyName = prop;
      return av;
    },
    normalizeIntegerProp: function(_) {
      return "<i>"
    },
    broadcastProp: function(prop, val, local) {
      if (local) {
        this.signal("addProp", prop, val);
        if (!(this instanceof Scope)) registerProp(prop, this);
      }
      if (this.onNewProp)
        for (var i = 0; i < this.onNewProp.length; ++i) {
          var h = this.onNewProp[i];
          h.onProtoProp ? h.onProtoProp(prop, val, local) : h(prop, val, local);
        }
    },
    onProtoProp: function(prop, val, _local) {
      var maybe = this.maybeProps && this.maybeProps[prop];
      if (maybe) {
        delete this.maybeProps[prop];
        this.maybeUnregProtoPropHandler();
        this.proto.getProp(prop).propagate(maybe);
      }
      this.broadcastProp(prop, val, false);
    },
    replaceProto: function(proto) {
      if (this.proto && this.maybeProps)
        this.proto.unregPropHandler(this)
      this.proto = proto
      if (this.maybeProps)
        this.proto.forAllProps(this)
    },
    ensureMaybeProps: function() {
      if (!this.maybeProps) {
        if (this.proto) this.proto.forAllProps(this);
        this.maybeProps = Object.create(null);
      }
      return this.maybeProps;
    },
    removeProp: function(prop) {
      var av = this.props[prop];
      delete this.props[prop];
      this.ensureMaybeProps()[prop] = av;
      av.types.length = 0;
    },
    forAllProps: function(c) {
      if (!this.onNewProp) {
        this.onNewProp = [];
        if (this.proto) this.proto.forAllProps(this);
      }
      this.onNewProp.push(c);
      for (var o = this; o; o = o.proto)
        for (var prop in o.props) {
          if (c.onProtoProp)
            c.onProtoProp(prop, o.props[prop], o == this);
          else
            c(prop, o.props[prop], o == this);
        }
    },
    maybeUnregProtoPropHandler: function() {
      if (this.maybeProps) {
        for (var _n in this.maybeProps) return;
        this.maybeProps = null;
      }
      if (!this.proto || this.onNewProp && this.onNewProp.length) return;
      this.proto.unregPropHandler(this);
    },
    unregPropHandler: function(handler) {
      for (var i = 0; i < this.onNewProp.length; ++i)
        if (this.onNewProp[i] == handler) {
          this.onNewProp.splice(i, 1);
          break;
        }
      this.maybeUnregProtoPropHandler();
    },
    gatherProperties: function(f, depth) {
      for (var prop in this.props)
        if (prop != "<i>" && prop.charAt(0) != ":")
          f(prop, this, depth);
      if (this.proto) this.proto.gatherProperties(f, depth + 1);
    },
    getObjType: function() {
      return this;
    }
  });
  var Fn = exports.Fn = function(name, self, args, argNames, retval, generator) {
    Obj.call(this, cx.protos.Function, name);
    this.self = self;
    this.args = args;
    this.argNames = argNames;
    this.retval = retval;
    this.generator = generator
  };
  Fn.prototype = extend(Obj.prototype, {
    constructor: Fn,
    toString: function(maxDepth) {
      if (maxDepth == null) maxDepth = 0;
      var str = this.generator ? "fn*(" : "fn(";
      for (var i = 0; i < this.args.length; ++i) {
        if (i) str += ", ";
        var name = this.argNames[i];
        if (name && name != "?") str += name + ": ";
        str += maxDepth > -3 ? toString(this.args[i], maxDepth - 1, this) : "?";
      }
      str += ")";
      if (!this.retval.isEmpty())
        str += " -> " + (maxDepth > -3 ? toString(this.retval, maxDepth - 1, this) : "?");
      return str;
    },
    getProp: function(prop) {
      if (prop == "prototype") {
        var known = this.hasProp(prop, false);
        if (!known) {
          known = this.defProp(prop);
          var proto = new Obj(true, this.name && this.name + ".prototype");
          proto.origin = this.origin;
          known.addType(proto, WG_MADEUP_PROTO);
        }
        return known;
      }
      return Obj.prototype.getProp.call(this, prop);
    },
    defProp: function(prop, originNode) {
      if (prop == "prototype") {
        var found = this.hasProp(prop, false);
        if (found) return found;
        found = Obj.prototype.defProp.call(this, prop, originNode);
        found.origin = this.origin;
        found.propagate(new FnPrototype(this));
        return found;
      }
      return Obj.prototype.defProp.call(this, prop, originNode);
    },
    getFunctionType: function() {
      return this;
    }
  });
  var Arr = exports.Arr = function(contentType) {
    Obj.call(this, cx.protos.Array)
    var content = this.defProp("<i>")
    if (Array.isArray(contentType)) {
      this.tuple = contentType.length
      for (var i = 0; i < contentType.length; i++) {
        var prop = this.defProp(String(i))
        contentType[i].propagate(prop)
        prop.propagate(content)
      }
    } else if (contentType) {
      this.tuple = 0
      contentType.propagate(content)
    }
  };
  Arr.prototype = extend(Obj.prototype, {
    constructor: Arr,
    toString: function(maxDepth) {
      if (maxDepth == null) maxDepth = 0
      if (maxDepth <= -3) return "[?]"
      var content = ""
      if (this.tuple) {
        var similar
        for (var i = 0; i in this.props; i++) {
          var type = toString(this.getProp(String(i)), maxDepth - 1, this)
          if (similar == null)
            similar = type
          else if (similar != type)
            similar = false
          else
            similar = type
          content += (content ? ", " : "") + type
        }
        if (similar) content = similar
      } else {
        content = toString(this.getProp("<i>"), maxDepth - 1, this)
      }
      return "[" + content + "]"
    },
    normalizeIntegerProp: function(prop) {
      if (+prop < this.tuple) return prop
      else return "<i>"
    }
  });
  var Sym = exports.Sym = function(name, originNode) {
    Prim.call(this, cx.protos.Symbol, "Symbol")
    this.symName = name
    this.originNode = originNode
  }
  Sym.prototype = extend(Prim.prototype, {
    constructor: Sym,
    asPropName: function() {
      return ":" + this.symName
    },
    getSymbolType: function() {
      return this
    }
  })
  exports.getSymbol = function(name, originNode) {
    var cleanName = name.replace(/[^\w$\.]/g, "_")
    var known = cx.symbols[cleanName]
    if (known) {
      if (originNode && !known.originNode) known.originNode = originNode
      return known
    }
    return cx.symbols[cleanName] = new Sym(cleanName, originNode)
  }

  function registerProp(prop, obj) {
    var data = cx.props[prop] || (cx.props[prop] = []);
    data.push(obj);
  }

  function objsWithProp(prop) {
    return cx.props[prop];
  }
  exports.Context = function(defs, parent) {
    this.parent = parent;
    this.props = Object.create(null);
    this.protos = Object.create(null);
    this.origins = [];
    this.curOrigin = "ecma5";
    this.paths = Object.create(null);
    this.definitions = Object.create(null);
    this.purgeGen = 0;
    this.workList = null;
    this.disabledComputing = null;
    this.curSuperCtor = this.curSuper = null;
    this.symbols = Object.create(null)
    exports.withContext(this, function() {
      cx.protos.Object = new Obj(null, "Object.prototype");
      cx.topScope = new Scope();
      cx.topScope.name = "<top>";
      cx.protos.Array = new Obj(true, "Array.prototype");
      cx.protos.Function = new Fn("Function.prototype", ANull, [], [], ANull);
      cx.protos.Function.proto = cx.protos.Object;
      cx.protos.RegExp = new Obj(true, "RegExp.prototype");
      cx.protos.String = new Obj(true, "String.prototype");
      cx.protos.Number = new Obj(true, "Number.prototype");
      cx.protos.Boolean = new Obj(true, "Boolean.prototype");
      cx.protos.Symbol = new Obj(true, "Symbol.prototype");
      cx.str = new Prim(cx.protos.String, "string");
      cx.bool = new Prim(cx.protos.Boolean, "bool");
      cx.num = new Prim(cx.protos.Number, "number");
      cx.curOrigin = null;
      if (defs)
        for (var i = 0; i < defs.length; ++i)
          def.load(defs[i]);
    });
  };
  exports.Context.prototype.startAnalysis = function() {
    this.disabledComputing = this.workList = this.curSuperCtor = this.curSuper = null;
  };
  var cx = null;
  exports.cx = function() {
    return cx;
  };
  exports.withContext = function(context, f) {
    var old = cx;
    cx = context;
    try {
      return f();
    } finally {
      cx = old;
    }
  };
  exports.TimedOut = function() {
    this.message = "Timed out";
    this.stack = (new Error()).stack;
  };
  exports.TimedOut.prototype = Object.create(Error.prototype);
  exports.TimedOut.prototype.name = "infer.TimedOut";
  var timeout;
  exports.withTimeout = function(ms, f) {
    var end = +new Date + ms;
    var oldEnd = timeout;
    if (oldEnd && oldEnd < end) return f();
    timeout = end;
    try {
      return f();
    } finally {
      timeout = oldEnd;
    }
  };
  exports.addOrigin = function(origin) {
    if (cx.origins.indexOf(origin) < 0) cx.origins.push(origin);
  };
  var baseMaxWorkDepth = 20,
    reduceMaxWorkDepth = 0.0001;

  function withWorklist(f) {
    if (cx.workList) return f(cx.workList);
    var list = [],
      depth = 0;
    var add = cx.workList = function(type, target, weight) {
      if (depth < baseMaxWorkDepth - reduceMaxWorkDepth * list.length)
        list.push(type, target, weight, depth);
    };
    var ret = f(add);
    for (var i = 0; i < list.length; i += 4) {
      if (timeout && +new Date >= timeout)
        throw new exports.TimedOut();
      depth = list[i + 3] + 1;
      list[i + 1].addType(list[i], list[i + 2]);
    }
    cx.workList = null;
    return ret;
  }

  function withSuper(ctor, obj, f) {
    var oldCtor = cx.curSuperCtor,
      oldObj = cx.curSuper
    cx.curSuperCtor = ctor;
    cx.curSuper = obj
    var result = f()
    cx.curSuperCtor = oldCtor;
    cx.curSuper = oldObj
    return result
  }
  var Scope = exports.Scope = function(prev, originNode, isBlock) {
    Obj.call(this, prev || true);
    this.prev = prev;
    this.originNode = originNode
    this.isBlock = !!isBlock
  };
  Scope.prototype = extend(Obj.prototype, {
    constructor: Scope,
    defVar: function(name, originNode) {
      for (var s = this;; s = s.proto) {
        var found = s.props[name];
        if (found) return found;
        if (!s.prev) return s.defProp(name, originNode);
      }
    }
  });

  function functionScope(scope) {
    while (scope.isBlock) scope = scope.prev
    return scope
  }

  function maybeInstantiate(scope, score) {
    var fn = functionScope(scope).fnType
    if (fn) fn.instantiateScore = (fn.instantiateScore || 0) + score;
  }
  var NotSmaller = {};

  function nodeSmallerThan(node, n) {
    try {
      walk.simple(node, {
        Expression: function() {
          if (--n <= 0) throw NotSmaller;
        }
      });
      return true;
    } catch (e) {
      if (e == NotSmaller) return false;
      throw e;
    }
  }

  function maybeTagAsInstantiated(node, fn) {
    var score = fn.instantiateScore;
    if (!cx.disabledComputing && score && fn.args.length && nodeSmallerThan(node, score * 5)) {
      maybeInstantiate(functionScope(fn.originNode.scope.prev), score / 2);
      setFunctionInstantiated(node, fn);
      return true;
    } else {
      fn.instantiateScore = null;
    }
  }

  function setFunctionInstantiated(node, fn) {
    for (var i = 0; i < fn.args.length; ++i) fn.args[i] = new AVal;
    fn.self = new AVal;
    fn.computeRet = function(self, args) {
      return withDisabledComputing(fn, function() {
        var oldOrigin = cx.curOrigin;
        cx.curOrigin = fn.origin;
        var scope = node.scope
        var scopeCopy = new Scope(scope.prev, scope.originNode);
        for (var v in scope.props) {
          var local = scopeCopy.defProp(v, scope.props[v].originNode);
          for (var i = 0; i < args.length; ++i)
            if (fn.argNames[i] == v && i < args.length)
              args[i].propagate(local);
        }
        var argNames = fn.argNames.length != args.length ? fn.argNames.slice(0, args.length) : fn.argNames;
        while (argNames.length < args.length) argNames.push("?");
        scopeCopy.fnType = new Fn(fn.name, self, args, argNames, ANull, fn.generator);
        scopeCopy.fnType.originNode = fn.originNode;
        if (fn.arguments) {
          var argset = scopeCopy.fnType.arguments = new AVal;
          scopeCopy.defProp("arguments").addType(new Arr(argset));
          for (var i = 0; i < args.length; ++i) args[i].propagate(argset);
        }
        node.scope = scopeCopy;
        walk.recursive(node.body, scopeCopy, null, scopeGatherer);
        walk.recursive(node.body, scopeCopy, null, inferWrapper);
        cx.curOrigin = oldOrigin;
        return scopeCopy.fnType.retval;
      });
    };
  }

  function maybeTagAsGeneric(fn) {
    var target = fn.retval;
    if (target == ANull) return;
    var targetInner, asArray;
    if (!target.isEmpty() && (targetInner = target.getType()) instanceof Arr)
      target = asArray = targetInner.getProp("<i>");

    function explore(aval, path, depth) {
      if (depth > 3 || !aval.forward) return;
      for (var i = 0; i < aval.forward.length; ++i) {
        var prop = aval.forward[i].propagatesTo();
        if (!prop) continue;
        var newPath = path,
          dest;
        if (prop instanceof AVal) {
          dest = prop;
        } else if (prop.target instanceof AVal) {
          newPath += prop.pathExt;
          dest = prop.target;
        } else continue;
        if (dest == target) return newPath;
        var found = explore(dest, newPath, depth + 1);
        if (found) return found;
      }
    }
    var foundPath = explore(fn.self, "!this", 0);
    for (var i = 0; !foundPath && i < fn.args.length; ++i)
      foundPath = explore(fn.args[i], "!" + i, 0);
    if (foundPath) {
      if (asArray) foundPath = "[" + foundPath + "]";
      var p = new def.TypeParser(foundPath);
      var parsed = p.parseType(true);
      fn.computeRet = parsed.apply ? parsed : function() {
        return parsed;
      };
      fn.computeRetSource = foundPath;
      return true;
    }
  }

  function addVar(scope, nameNode) {
    return scope.defProp(nameNode.name, nameNode);
  }

  function patternName(node) {
    if (node.type == "Identifier") return node.name
    if (node.type == "AssignmentPattern") return patternName(node.left)
    if (node.type == "ObjectPattern") return "{" + node.properties.map(function(e) {
      return patternName(e.value)
    }).join(", ") + "}"
    if (node.type == "ArrayPattern") return "[" + node.elements.map(patternName).join(", ") + "]"
    if (node.type == "RestElement") return "..." + patternName(node.argument)
    return "_"
  }

  function isBlockScopedDecl(node) {
    return node.type == "VariableDeclaration" && node.kind != "var" ||
      node.type == "FunctionDeclaration" ||
      node.type == "ClassDeclaration";
  }

  function patternScopes(inner, outer) {
    return {
      inner: inner,
      outer: outer || inner
    }
  }
  var scopeGatherer = exports.scopeGatherer = walk.make({
    VariablePattern: function(node, scopes) {
      if (scopes.inner) addVar(scopes.inner, node)
    },
    AssignmentPattern: function(node, scopes, c) {
      c(node.left, scopes, "Pattern")
      c(node.right, scopes.outer, "Expression")
    },
    AssignmentExpression: function(node, scope, c) {
      if (node.left.type == "MemberExpression")
        c(node.left, scope, "Expression")
      else
        c(node.left, patternScopes(false, scope), "Pattern")
      c(node.right, scope, "Expression")
    },
    Function: function(node, scope, c) {
      if (scope.inner) throw new Error("problem at " + node.start + " " + node.type)
      var inner = node.scope = new Scope(scope, node)
      var argVals = [],
        argNames = []
      for (var i = 0; i < node.params.length; ++i) {
        var param = node.params[i]
        argNames.push(patternName(param))
        if (param.type == "Identifier") {
          argVals.push(addVar(inner, param))
        } else {
          var arg = new AVal
          argVals.push(arg)
          arg.originNode = param
          c(param, patternScopes(inner), "Pattern")
        }
      }
      inner.fnType = new Fn(node.id && node.id.name, new AVal, argVals, argNames, ANull, node.generator)
      inner.fnType.originNode = node;
      if (node.id) {
        var decl = node.type == "FunctionDeclaration";
        addVar(decl ? scope : inner, node.id);
      }
      c(node.body, inner, node.expression ? "Expression" : "Statement");
    },
    BlockStatement: function(node, scope, c) {
      if (!node.scope && node.body.some(isBlockScopedDecl))
        scope = node.scope = new Scope(scope, node, true)
      walk.base.BlockStatement(node, scope, c)
    },
    TryStatement: function(node, scope, c) {
      c(node.block, scope, "Statement");
      if (node.handler) {
        if (node.handler.param.type == "Identifier") {
          var v = addVar(scope, node.handler.param);
          c(node.handler.body, scope, "Statement");
          var e5 = cx.definitions.ecma5;
          if (e5 && v.isEmpty()) getInstance(e5["Error.prototype"]).propagate(v, WG_CATCH_ERROR);
        } else {
          c(node.handler.param, patternScopes(scope), "Pattern")
        }
      }
      if (node.finalizer) c(node.finalizer, scope, "Statement");
    },
    VariableDeclaration: function(node, scope, c) {
      var targetScope = node.kind == "var" ? functionScope(scope) : scope
      for (var i = 0; i < node.declarations.length; ++i) {
        var decl = node.declarations[i];
        c(decl.id, patternScopes(targetScope, scope), "Pattern")
        if (decl.init) c(decl.init, scope, "Expression");
      }
    },
    ClassDeclaration: function(node, scope, c) {
      addVar(scope, node.id)
      if (node.superClass) c(node.superClass, scope, "Expression")
      for (var i = 0; i < node.body.body.length; i++)
        c(node.body.body[i], scope)
    },
    ForInStatement: function(node, scope, c) {
      if (!node.scope && isBlockScopedDecl(node.left))
        scope = node.scope = new Scope(scope, node, true)
      walk.base.ForInStatement(node, scope, c)
    },
    ForStatement: function(node, scope, c) {
      if (!node.scope && node.init && isBlockScopedDecl(node.init))
        scope = node.scope = new Scope(scope, node, true)
      walk.base.ForStatement(node, scope, c)
    },
    ImportDeclaration: function(node, scope) {
      for (var i = 0; i < node.specifiers.length; i++)
        addVar(scope, node.specifiers[i].local)
    }
  });
  scopeGatherer.ForOfStatement = scopeGatherer.ForInStatement
  var propName = exports.propName = function(node, inferInScope) {
    var key = node.property || node.key;
    if (!node.computed && key.type == "Identifier") return key.name;
    if (key.type == "Literal") {
      if (typeof key.value == "string") return key.value
      if (typeof key.value == "number") return String(key.value)
    }
    if (inferInScope) {
      var symName = symbolName(infer(key, inferInScope))
      if (symName) return node.propName = symName
    } else if (node.propName) {
      return node.propName
    }
    return "<i>";
  }

  function symbolName(val) {
    var sym = val.getSymbolType()
    if (sym) return sym.asPropName()
  }

  function unopResultType(op) {
    switch (op) {
      case "+":
      case "-":
      case "~":
        return cx.num;
      case "!":
        return cx.bool;
      case "typeof":
        return cx.str;
      case "void":
      case "delete":
        return ANull;
    }
  }

  function binopIsBoolean(op) {
    switch (op) {
      case "==":
      case "!=":
      case "===":
      case "!==":
      case "<":
      case ">":
      case ">=":
      case "<=":
      case "in":
      case "instanceof":
        return true;
    }
  }

  function literalType(node) {
    if (node.regex) return getInstance(cx.protos.RegExp);
    switch (typeof node.value) {
      case "boolean":
        return cx.bool;
      case "number":
        return cx.num;
      case "string":
        return cx.str;
      case "object":
      case "function":
        if (!node.value) return ANull;
        return getInstance(cx.protos.RegExp);
    }
  }

  function join(a, b) {
    if (a == b || b == ANull) return a
    if (a == ANull) return b
    var joined = new AVal
    a.propagate(joined)
    b.propagate(joined)
    return joined
  }

  function connectParams(node, scope) {
    for (var i = 0; i < node.params.length; i++) {
      var param = node.params[i]
      if (param.type == "Identifier") continue
      connectPattern(param, scope, node.scope.fnType.args[i])
    }
  }

  function ensureVar(node, scope) {
    return scope.hasProp(node.name) || cx.topScope.defProp(node.name, node)
  }
  var inferPatternVisitor = exports.inferPatternVisitor = {
    Identifier: function(node, scope, source) {
      source.propagate(ensureVar(node, scope))
    },
    MemberExpression: function(node, scope, source) {
      var obj = infer(node.object, scope)
      var pName = propName(node, scope)
      obj.propagate(new DefProp(pName, source, node.property))
    },
    RestElement: function(node, scope, source) {
      connectPattern(node.argument, scope, new Arr(source))
    },
    ObjectPattern: function(node, scope, source) {
      for (var i = 0; i < node.properties.length; ++i) {
        var prop = node.properties[i]
        connectPattern(prop.value, scope, source.getProp(prop.key.name))
      }
    },
    ArrayPattern: function(node, scope, source) {
      for (var i = 0; i < node.elements.length; i++)
        if (node.elements[i])
          connectPattern(node.elements[i], scope, source.getProp(String(i)))
    },
    AssignmentPattern: function(node, scope, source) {
      connectPattern(node.left, scope, join(source, infer(node.right, scope)))
    }
  }

  function connectPattern(node, scope, source) {
    var connecter = inferPatternVisitor[node.type]
    if (connecter) connecter(node, scope, source)
  }

  function getThis(scope) {
    var fnScope = functionScope(scope)
    return fnScope.fnType ? fnScope.fnType.self : fnScope
  }

  function maybeAddPhantomObj(obj) {
    if (!obj.isEmpty() || !obj.propertyOf) return
    obj.propertyOf.getProp(obj.propertyName).addType(new Obj, WG_PHANTOM_OBJ)
    maybeAddPhantomObj(obj.propertyOf)
  }

  function inferClass(node, scope, name) {
    if (!name && node.id) name = node.id.name
    var sup = cx.protos.Object,
      supCtor, delayed
    if (node.superClass) {
      if (node.superClass.type == "Literal" && node.superClass.value == null) {
        sup = null
      } else {
        var supVal = infer(node.superClass, scope),
          supProto
        supCtor = supVal.getFunctionType()
        if (supCtor && (supProto = supCtor.getProp("prototype").getObjType())) {
          sup = supProto
        } else {
          supCtor = supVal
          delayed = supVal.getProp("prototype")
        }
      }
    }
    var proto = new Obj(sup, name && name + ".prototype")
    if (delayed) delayed.propagate(new HasProto(proto))
    return withSuper(supCtor, delayed || sup, function() {
      var ctor, body = node.body.body
      for (var i = 0; i < body.length; i++)
        if (body[i].kind == "constructor") ctor = body[i].value
      var fn = node.objType = ctor ? infer(ctor, scope) : new Fn(name, ANull, [], null, ANull)
      fn.originNode = node.id || ctor || node
      var inst = getInstance(proto, fn)
      fn.self.addType(inst)
      fn.defProp("prototype", node).addType(proto)
      for (var i = 0; i < body.length; i++) {
        var method = body[i],
          target
        if (method.kind == "constructor") continue
        var pName = propName(method, scope)
        if (pName == "<i>" || method.kind == "set") {
          target = ANull
        } else {
          target = (method.static ? fn : proto).defProp(pName, method.key)
          target.initializer = true
          if (method.kind == "get") target = new IsCallee(inst, [], null, target)
        }
        infer(method.value, scope, target)
        var methodFn = target.getFunctionType()
        if (methodFn) methodFn.self.addType(inst)
      }
      return fn
    })
  }

  function arrayLiteralType(elements, scope, inner) {
    var tuple = elements.length > 1 && elements.length < 6
    if (tuple) {
      var homogenous = true,
        litType
      for (var i = 0; i < elements.length; i++) {
        var elt = elements[i]
        if (!elt)
          tuple = false
        else if (elt.type != "Literal" || (litType && litType != typeof elt.value))
          homogenous = false
        else
          litType = typeof elt.value
      }
      if (homogenous) tuple = false
    }
    if (tuple) {
      var types = []
      for (var i = 0; i < elements.length; ++i)
        types.push(inner(elements[i], scope))
      return new Arr(types)
    } else if (elements.length < 2) {
      return new Arr(elements[0] && inner(elements[0], scope))
    } else {
      var eltVal = new AVal
      for (var i = 0; i < elements.length; i++)
        if (elements[i]) inner(elements[i], scope).propagate(eltVal)
      return new Arr(eltVal)
    }
  }

  function ret(f) {
    return function(node, scope, out, name) {
      var r = f(node, scope, name);
      if (out) r.propagate(out);
      return r;
    };
  }

  function fill(f) {
    return function(node, scope, out, name) {
      if (!out) out = new AVal;
      f(node, scope, out, name);
      return out;
    };
  }
  var inferExprVisitor = exports.inferExprVisitor = {
    ArrayExpression: ret(function(node, scope) {
      return arrayLiteralType(node.elements, scope, infer)
    }),
    ObjectExpression: ret(function(node, scope, name) {
      var proto = true,
        waitForProto
      for (var i = 0; i < node.properties.length; ++i) {
        var prop = node.properties[i]
        if (prop.key.name == "__proto__") {
          if (prop.value.type == "Literal" && prop.value.value == null) {
            proto = null
          } else {
            var protoVal = infer(prop.value, scope),
              known = protoVal.getObjType()
            if (known) proto = known
            else waitForProto = protoVal
          }
        }
      }
      var obj = node.objType = new Obj(proto, name);
      if (waitForProto) waitForProto.propagate(new HasProto(obj))
      obj.originNode = node;
      withSuper(null, waitForProto || proto, function() {
        for (var i = 0; i < node.properties.length; ++i) {
          var prop = node.properties[i],
            key = prop.key;
          if (prop.value.name == "✖" || prop.key.name == "__proto__") continue;
          var name = propName(prop, scope),
            target
          if (name == "<i>" || prop.kind == "set") {
            target = ANull;
          } else {
            var val = target = obj.defProp(name, key);
            val.initializer = true;
            if (prop.kind == "get")
              target = new IsCallee(obj, [], null, val);
          }
          infer(prop.value, scope, target, name);
          if (prop.value.type == "FunctionExpression")
            prop.value.scope.fnType.self.addType(obj, WG_SPECULATIVE_THIS);
        }
      })
      return obj;
    }),
    FunctionExpression: ret(function(node, scope, name) {
      var inner = node.scope,
        fn = inner.fnType;
      if (name && !fn.name) fn.name = name;
      connectParams(node, inner)
      if (node.expression)
        infer(node.body, inner, inner.fnType.retval = new AVal)
      else
        walk.recursive(node.body, inner, null, inferWrapper, "Statement")
      if (node.type == "ArrowFunctionExpression") {
        getThis(scope).propagate(fn.self)
        fn.self = ANull
      }
      maybeTagAsInstantiated(node, fn) || maybeTagAsGeneric(fn);
      if (node.id) inner.getProp(node.id.name).addType(fn);
      return fn;
    }),
    ClassExpression: ret(inferClass),
    SequenceExpression: ret(function(node, scope) {
      for (var i = 0, l = node.expressions.length - 1; i < l; ++i)
        infer(node.expressions[i], scope, ANull);
      return infer(node.expressions[l], scope);
    }),
    UnaryExpression: ret(function(node, scope) {
      infer(node.argument, scope, ANull);
      return unopResultType(node.operator);
    }),
    UpdateExpression: ret(function(node, scope) {
      infer(node.argument, scope, ANull);
      return cx.num;
    }),
    BinaryExpression: ret(function(node, scope) {
      if (node.operator == "+") {
        var lhs = infer(node.left, scope);
        var rhs = infer(node.right, scope);
        if (lhs.hasType(cx.str) || rhs.hasType(cx.str)) return cx.str;
        if (lhs.hasType(cx.num) && rhs.hasType(cx.num)) return cx.num;
        var result = new AVal;
        lhs.propagate(new IsAdded(rhs, result));
        rhs.propagate(new IsAdded(lhs, result));
        return result;
      } else {
        infer(node.left, scope, ANull);
        infer(node.right, scope, ANull);
        return binopIsBoolean(node.operator) ? cx.bool : cx.num;
      }
    }),
    AssignmentExpression: ret(function(node, scope, name) {
      var rhs, pName;
      if (node.left.type == "MemberExpression") {
        pName = propName(node.left, scope)
        if (!name)
          name = node.left.object.type == "Identifier" ? node.left.object.name + "." + pName : pName
      } else if (!name && node.left.type == "Identifier") {
        name = node.left.name
      }
      if (node.operator && node.operator != "=" && node.operator != "+=") {
        infer(node.right, scope, ANull);
        rhs = cx.num;
      } else {
        rhs = infer(node.right, scope, null, name);
      }
      if (node.left.type == "MemberExpression") {
        var obj = infer(node.left.object, scope);
        if (pName == "prototype") maybeInstantiate(scope, 20);
        if (pName == "<i>") {
          var v = node.left.property.name,
            local = scope.props[v],
            over = local && local.iteratesOver;
          if (over) {
            maybeInstantiate(scope, 20);
            var fromRight = node.right.type == "MemberExpression" && node.right.computed && node.right.property.name == v;
            over.forAllProps(function(prop, val, local) {
              if (local && prop != "prototype" && prop != "<i>")
                obj.propagate(new DefProp(prop, fromRight ? val : ANull));
            });
            return rhs;
          }
        }
        obj.propagate(new DefProp(pName, rhs, node.left.property));
        maybeAddPhantomObj(obj)
        if (node.right.type == "FunctionExpression")
          obj.propagate(node.right.scope.fnType.self, WG_SPECULATIVE_THIS);
      } else {
        connectPattern(node.left, scope, rhs)
      }
      return rhs;
    }),
    LogicalExpression: fill(function(node, scope, out) {
      infer(node.left, scope, out);
      infer(node.right, scope, out);
    }),
    ConditionalExpression: fill(function(node, scope, out) {
      infer(node.test, scope, ANull);
      infer(node.consequent, scope, out);
      infer(node.alternate, scope, out);
    }),
    NewExpression: fill(function(node, scope, out, name) {
      if (node.callee.type == "Identifier" && node.callee.name in scope.props)
        maybeInstantiate(scope, 20);
      for (var i = 0, args = []; i < node.arguments.length; ++i)
        args.push(infer(node.arguments[i], scope));
      var callee = infer(node.callee, scope);
      var self = new AVal;
      callee.propagate(new IsCtor(self, name && /\.prototype$/.test(name)));
      self.propagate(out, WG_NEW_INSTANCE);
      callee.propagate(new IsCallee(self, args, node.arguments, new IfObj(out)));
    }),
    CallExpression: fill(function(node, scope, out) {
      for (var i = 0, args = []; i < node.arguments.length; ++i)
        args.push(infer(node.arguments[i], scope));
      var outerFn = functionScope(scope).fnType
      if (node.callee.type == "MemberExpression") {
        var self = infer(node.callee.object, scope);
        var pName = propName(node.callee, scope)
        if (outerFn && (pName == "call" || pName == "apply") &&
          outerFn.args.indexOf(self) > -1)
          maybeInstantiate(scope, 30);
        self.propagate(new HasMethodCall(pName, args, node.arguments, out));
      } else if (node.callee.type == "Super" && cx.curSuperCtor) {
        cx.curSuperCtor.propagate(new IsCallee(getThis(scope), args, node.arguments, out))
      } else {
        var callee = infer(node.callee, scope);
        if (outerFn && outerFn.args.indexOf(callee) > -1)
          maybeInstantiate(scope, 30);
        var knownFn = callee.getFunctionType();
        if (knownFn && knownFn.instantiateScore && outerFn)
          maybeInstantiate(scope, knownFn.instantiateScore / 5);
        callee.propagate(new IsCallee(cx.topScope, args, node.arguments, out));
      }
    }),
    MemberExpression: fill(function(node, scope, out) {
      var name = propName(node),
        wg;
      if (name == "<i>") {
        var propType = infer(node.property, scope)
        var symName = symbolName(propType)
        if (symName)
          name = node.propName = symName
        else if (!propType.hasType(cx.num))
          wg = WG_MULTI_MEMBER
      }
      infer(node.object, scope).getProp(name).propagate(out, wg)
    }),
    Identifier: ret(function(node, scope) {
      if (node.name == "arguments") {
        var fnScope = functionScope(scope)
        if (fnScope.fnType && !(node.name in fnScope.props))
          scope.defProp(node.name, fnScope.fnType.originNode)
          .addType(new Arr(fnScope.fnType.arguments = new AVal));
      }
      return scope.getProp(node.name);
    }),
    ThisExpression: ret(function(_node, scope) {
      return getThis(scope)
    }),
    Super: ret(function(node) {
      return node.superType = cx.curSuper || ANull
    }),
    Literal: ret(function(node) {
      return literalType(node);
    }),
    TemplateLiteral: ret(function(node, scope) {
      for (var i = 0; i < node.expressions.length; ++i)
        infer(node.expressions[i], scope, ANull)
      return cx.str
    }),
    TaggedTemplateExpression: fill(function(node, scope, out) {
      var args = [new Arr(cx.str)]
      for (var i = 0; i < node.quasi.expressions.length; ++i)
        args.push(infer(node.quasi.expressions[i], scope))
      infer(node.tag, scope, new IsCallee(cx.topScope, args, node.quasi.expressions, out))
    }),
    YieldExpression: ret(function(node, scope) {
      var output = ANull,
        fn = functionScope(scope).fnType
      if (fn) {
        if (fn.retval == ANull) fn.retval = new AVal
        if (!fn.yieldval) fn.yieldval = new AVal
        output = fn.retval
      }
      if (node.argument) {
        if (node.delegate) {
          infer(node.argument, scope, new HasMethodCall("next", [], null,
            new GetProp("value", output)))
        } else {
          infer(node.argument, scope, output)
        }
      }
      return fn ? fn.yieldval : ANull
    })
  };
  inferExprVisitor.ArrowFunctionExpression = inferExprVisitor.FunctionExpression

  function infer(node, scope, out, name) {
    var handler = inferExprVisitor[node.type];
    return handler ? handler(node, scope, out, name) : ANull;
  }

  function loopPattern(init) {
    return init.type == "VariableDeclaration" ? init.declarations[0].id : init
  }
  var inferWrapper = exports.inferWrapper = walk.make({
    Expression: function(node, scope) {
      infer(node, node.scope || scope, ANull);
    },
    FunctionDeclaration: function(node, scope, c) {
      var inner = node.scope,
        fn = inner.fnType;
      connectParams(node, inner)
      c(node.body, inner, "Statement");
      maybeTagAsInstantiated(node, fn) || maybeTagAsGeneric(fn);
      scope.getProp(node.id.name).addType(fn)
    },
    Statement: function(node, scope, c) {
      c(node, node.scope || scope)
    },
    VariableDeclaration: function(node, scope) {
      for (var i = 0; i < node.declarations.length; ++i) {
        var decl = node.declarations[i];
        if (decl.id.type == "Identifier") {
          var prop = scope.getProp(decl.id.name);
          if (decl.init)
            infer(decl.init, scope, prop, decl.id.name);
        } else if (decl.init) {
          connectPattern(decl.id, scope, infer(decl.init, scope))
        }
      }
    },
    ClassDeclaration: function(node, scope) {
      scope.getProp(node.id.name).addType(inferClass(node, scope, node.id.name))
    },
    ReturnStatement: function(node, scope) {
      if (!node.argument) return;
      var output = ANull,
        fn = functionScope(scope).fnType
      if (fn) {
        if (fn.retval == ANull) fn.retval = new AVal;
        output = fn.retval;
      }
      infer(node.argument, scope, output);
    },
    ForInStatement: function(node, scope, c) {
      var source = infer(node.right, scope);
      if ((node.right.type == "Identifier" && node.right.name in scope.props) ||
        (node.right.type == "MemberExpression" && node.right.property.name == "prototype")) {
        maybeInstantiate(scope, 5);
        var pattern = loopPattern(node.left)
        if (pattern.type == "Identifier") {
          if (pattern.name in scope.props)
            scope.getProp(pattern.name).iteratesOver = source
          source.getProp("<i>").propagate(ensureVar(pattern, scope))
        } else {
          connectPattern(pattern, scope, source.getProp("<i>"))
        }
      }
      c(node.body, scope, "Statement");
    },
    ForOfStatement: function(node, scope, c) {
      var pattern = loopPattern(node.left),
        target
      if (pattern.type == "Identifier")
        target = ensureVar(pattern, scope)
      else
        connectPattern(pattern, scope, target = new AVal)
      infer(node.right, scope, new HasMethodCall(":Symbol.iterator", [], null,
        new HasMethodCall("next", [], null,
          new GetProp("value", target))))
      c(node.body, scope, "Statement")
    }
  });
  var parse = exports.parse = function(text, options, thirdArg) {
    if (!options || Array.isArray(options)) options = thirdArg
    var ast;
    try {
      ast = acorn.parse(text, options);
    } catch (e) {
      ast = acorn_loose.parse_dammit(text, options);
    }
    return ast;
  };
  exports.analyze = function(ast, name, scope) {
    if (typeof ast == "string") ast = parse(ast);
    if (!name) name = "file#" + cx.origins.length;
    exports.addOrigin(cx.curOrigin = name);
    if (!scope) scope = cx.topScope;
    cx.startAnalysis();
    walk.recursive(ast, scope, null, scopeGatherer);
    if (cx.parent) cx.parent.signal("preInfer", ast, scope)
    walk.recursive(ast, scope, null, inferWrapper);
    if (cx.parent) cx.parent.signal("postInfer", ast, scope)
    cx.curOrigin = null;
  };
  exports.purge = function(origins, start, end) {
    var test = makePredicate(origins, start, end);
    ++cx.purgeGen;
    cx.topScope.purge(test);
    for (var prop in cx.props) {
      var list = cx.props[prop];
      for (var i = 0; i < list.length; ++i) {
        var obj = list[i],
          av = obj.props[prop];
        if (!av || test(av, av.originNode)) list.splice(i--, 1);
      }
      if (!list.length) delete cx.props[prop];
    }
  };

  function makePredicate(origins, start, end) {
    var arr = Array.isArray(origins);
    if (arr && origins.length == 1) {
      origins = origins[0];
      arr = false;
    }
    if (arr) {
      if (end == null) return function(n) {
        return origins.indexOf(n.origin) > -1;
      };
      return function(n, pos) {
        return pos && pos.start >= start && pos.end <= end && origins.indexOf(n.origin) > -1;
      };
    } else {
      if (end == null) return function(n) {
        return n.origin == origins;
      };
      return function(n, pos) {
        return pos && pos.start >= start && pos.end <= end && n.origin == origins;
      };
    }
  }
  AVal.prototype.purge = function(test) {
    if (this.purgeGen == cx.purgeGen) return;
    this.purgeGen = cx.purgeGen;
    for (var i = 0; i < this.types.length; ++i) {
      var type = this.types[i];
      if (test(type, type.originNode))
        this.types.splice(i--, 1);
      else
        type.purge(test);
    }
    if (!this.types.length) this.maxWeight = 0;
    if (this.forward)
      for (var i = 0; i < this.forward.length; ++i) {
        var f = this.forward[i];
        if (test(f)) {
          this.forward.splice(i--, 1);
          if (this.props) this.props = null;
        } else if (f.purge) {
          f.purge(test);
        }
      }
  };
  ANull.purge = function() {};
  Obj.prototype.purge = function(test) {
    if (this.purgeGen == cx.purgeGen) return true;
    this.purgeGen = cx.purgeGen;
    for (var p in this.props) {
      var av = this.props[p];
      if (test(av, av.originNode))
        this.removeProp(p);
      av.purge(test);
    }
  };
  Fn.prototype.purge = function(test) {
    if (Obj.prototype.purge.call(this, test)) return;
    this.self.purge(test);
    this.retval.purge(test);
    for (var i = 0; i < this.args.length; ++i) this.args[i].purge(test);
  };

  function findByPropertyName(name) {
    guessing = true;
    var found = objsWithProp(name);
    if (found)
      for (var i = 0; i < found.length; ++i) {
        var val = found[i].getProp(name);
        if (!val.isEmpty()) return val;
      }
    return ANull;
  }

  function generatorResult(input, output) {
    var retObj = new Obj(true)
    retObj.defProp("done").addType(cx.bool)
    output.propagate(retObj.defProp("value"))
    var method = new Fn(null, ANull, input ? [input] : [], input ? ["?"] : [], retObj)
    var result = new Obj(cx.definitions.ecma6 && cx.definitions.ecma6.generator_prototype || true)
    result.defProp("next").addType(method)
    return result
  }

  function maybeIterator(fn, output) {
    if (!fn.generator) return output
    if (!fn.computeRet) {
      if (fn.generator === true) fn.generator = generatorResult(fn.yieldval, output)
      return fn.generator
    }
    return generatorResult(fn.yieldval, output)
  }

  function computeReturnType(funcNode, argNodes, scope) {
    var fn = findType(funcNode, scope).getFunctionType()
    if (!fn) return ANull
    var result = fn.retval
    if (fn.computeRet) {
      for (var i = 0, args = []; i < argNodes.length; ++i)
        args.push(findType(argNodes[i], scope))
      var self = ANull
      if (funcNode.type == "MemberExpression")
        self = findType(funcNode.object, scope)
      result = fn.computeRet(self, args, argNodes);
    }
    return maybeIterator(fn, result)
  }
  var typeFinder = exports.typeFinder = {
    ArrayExpression: function(node, scope) {
      return arrayLiteralType(node.elements, scope, findType)
    },
    ObjectExpression: function(node) {
      return node.objType;
    },
    ClassExpression: function(node) {
      return node.objType;
    },
    FunctionExpression: function(node) {
      return node.scope.fnType;
    },
    ArrowFunctionExpression: function(node) {
      return node.scope.fnType;
    },
    SequenceExpression: function(node, scope) {
      return findType(node.expressions[node.expressions.length - 1], scope);
    },
    UnaryExpression: function(node) {
      return unopResultType(node.operator);
    },
    UpdateExpression: function() {
      return cx.num;
    },
    BinaryExpression: function(node, scope) {
      if (binopIsBoolean(node.operator)) return cx.bool;
      if (node.operator == "+") {
        var lhs = findType(node.left, scope);
        var rhs = findType(node.right, scope);
        if (lhs.hasType(cx.str) || rhs.hasType(cx.str)) return cx.str;
      }
      return cx.num;
    },
    AssignmentExpression: function(node, scope) {
      return findType(node.right, scope);
    },
    LogicalExpression: function(node, scope) {
      var lhs = findType(node.left, scope);
      return lhs.isEmpty() ? findType(node.right, scope) : lhs;
    },
    ConditionalExpression: function(node, scope) {
      var lhs = findType(node.consequent, scope);
      return lhs.isEmpty() ? findType(node.alternate, scope) : lhs;
    },
    NewExpression: function(node, scope) {
      var f = findType(node.callee, scope).getFunctionType();
      var proto = f && f.getProp("prototype").getObjType();
      if (!proto) return ANull;
      return getInstance(proto, f);
    },
    CallExpression: function(node, scope) {
      return computeReturnType(node.callee, node.arguments, scope)
    },
    MemberExpression: function(node, scope) {
      var propN = propName(node),
        obj = findType(node.object, scope).getType();
      if (obj) return obj.getProp(propN);
      if (propN == "<i>") return ANull;
      return findByPropertyName(propN);
    },
    Identifier: function(node, scope) {
      return scope.hasProp(node.name) || ANull;
    },
    ThisExpression: function(_node, scope) {
      return getThis(scope)
    },
    Literal: function(node) {
      return literalType(node);
    },
    Super: ret(function(node) {
      return node.superType
    }),
    TemplateLiteral: function() {
      return cx.str
    },
    TaggedTemplateExpression: function(node, scope) {
      return computeReturnType(node.tag, node.quasi.expressions, scope)
    },
    YieldExpression: function(_node, scope) {
      var fn = functionScope(scope).fnType
      return fn ? fn.yieldval : ANull
    }
  };

  function findType(node, scope) {
    var finder = typeFinder[node.type];
    return finder ? finder(node, scope) : ANull;
  }
  var searchVisitor = exports.searchVisitor = walk.make({
    Function: function(node, _st, c) {
      walk.base.Function(node, node.scope, c)
    },
    Property: function(node, st, c) {
      if (node.computed) c(node.key, st, "Expression");
      if (node.key != node.value) c(node.value, st, "Expression");
    },
    Statement: function(node, st, c) {
      c(node, node.scope || st)
    },
    ImportSpecifier: function(node, st, c) {
      c(node.local, st)
    },
    ImportDefaultSpecifier: function(node, st, c) {
      c(node.local, st)
    },
    ImportNamespaceSpecifier: function(node, st, c) {
      c(node.local, st)
    }
  });
  exports.fullVisitor = walk.make({
    MemberExpression: function(node, st, c) {
      c(node.object, st, "Expression");
      c(node.property, st, node.computed ? "Expression" : null);
    },
    ObjectExpression: function(node, st, c) {
      for (var i = 0; i < node.properties.length; ++i) {
        c(node.properties[i].value, st, "Expression");
        c(node.properties[i].key, st);
      }
    }
  }, searchVisitor);
  exports.findExpressionAt = function(ast, start, end, defaultScope, filter) {
    var test = filter || function(_t, node) {
      if (node.type == "Identifier" && node.name == "✖") return false;
      return typeFinder.hasOwnProperty(node.type);
    };
    return walk.findNodeAt(ast, start, end, test, searchVisitor, defaultScope || cx.topScope);
  };
  exports.findExpressionAround = function(ast, start, end, defaultScope, filter) {
    var test = filter || function(_t, node) {
      if (start != null && node.start > start) return false;
      if (node.type == "Identifier" && node.name == "✖") return false;
      return typeFinder.hasOwnProperty(node.type);
    };
    return walk.findNodeAround(ast, end, test, searchVisitor, defaultScope || cx.topScope);
  };
  exports.expressionType = function(found) {
    return findType(found.node, found.state);
  };
  exports.parentNode = function(child, ast) {
    var stack = [];

    function c(node, st, override) {
      if (node.start <= child.start && node.end >= child.end) {
        var top = stack[stack.length - 1];
        if (node == child) throw {
          found: top
        };
        if (top != node) stack.push(node);
        walk.base[override || node.type](node, st, c);
        if (top != node) stack.pop();
      }
    }
    try {
      c(ast, null);
    } catch (e) {
      if (e.found) return e.found;
      throw e;
    }
  };
  var findTypeFromContext = exports.findTypeFromContext = {
    ArrayExpression: function(parent, _, get) {
      return get(parent, true).getProp("<i>");
    },
    ObjectExpression: function(parent, node, get) {
      for (var i = 0; i < parent.properties.length; ++i) {
        var prop = node.properties[i];
        if (prop.value == node)
          return get(parent, true).getProp(prop.key.name);
      }
    },
    UnaryExpression: function(parent) {
      return unopResultType(parent.operator);
    },
    UpdateExpression: function() {
      return cx.num;
    },
    BinaryExpression: function(parent) {
      return binopIsBoolean(parent.operator) ? cx.bool : cx.num;
    },
    AssignmentExpression: function(parent, _, get) {
      return get(parent.left);
    },
    LogicalExpression: function(parent, _, get) {
      return get(parent, true);
    },
    ConditionalExpression: function(parent, node, get) {
      if (parent.consequent == node || parent.alternate == node) return get(parent, true);
    },
    CallExpression: function(parent, node, get) {
      for (var i = 0; i < parent.arguments.length; i++) {
        var arg = parent.arguments[i];
        if (arg == node) {
          var calleeType = get(parent.callee).getFunctionType();
          if (calleeType instanceof Fn)
            return calleeType.args[i];
          break;
        }
      }
    },
    ReturnStatement: function(_parent, node, get) {
      var fnNode = walk.findNodeAround(node.sourceFile.ast, node.start, "Function");
      if (fnNode) {
        var fnType = fnNode.node.type != "FunctionDeclaration" ?
          get(fnNode.node, true).getFunctionType() :
          fnNode.node.scope.fnType;
        if (fnType) return fnType.retval.getType();
      }
    },
    VariableDeclarator: function(parent, node, get) {
      if (parent.init == node) return get(parent.id)
    }
  };
  findTypeFromContext.NewExpression = findTypeFromContext.CallExpression
  exports.typeFromContext = function(ast, found) {
    var parent = exports.parentNode(found.node, ast);
    var type = null;
    if (findTypeFromContext.hasOwnProperty(parent.type)) {
      var finder = findTypeFromContext[parent.type];
      type = finder && finder(parent, found.node, function(node, fromContext) {
        var obj = {
          node: node,
          state: found.state
        };
        var tp = fromContext ? exports.typeFromContext(ast, obj) : exports.expressionType(obj);
        return tp || ANull;
      });
    }
    return type || exports.expressionType(found);
  };
  var guessing = false;
  exports.resetGuessing = function(val) {
    guessing = val;
  };
  exports.didGuess = function() {
    return guessing;
  };
  exports.forAllPropertiesOf = function(type, f) {
    type.gatherProperties(f, 0);
  };
  var refFindWalker = walk.make({}, searchVisitor);
  exports.findRefs = function(ast, baseScope, name, refScope, f) {
    refFindWalker.Identifier = refFindWalker.VariablePattern = function(node, scope) {
      if (node.name != name) return;
      for (var s = scope; s; s = s.prev) {
        if (s == refScope) f(node, scope);
        if (name in s.props) return;
      }
    };
    walk.recursive(ast, baseScope, null, refFindWalker);
  };
  var simpleWalker = walk.make({
    Function: function(node, _scope, c) {
      c(node.body, node.scope, node.expression ? "Expression" : "Statement")
    },
    Statement: function(node, scope, c) {
      c(node, node.scope || scope)
    }
  });
  exports.findPropRefs = function(ast, scope, objType, propName, f) {
    walk.simple(ast, {
      MemberExpression: function(node, scope) {
        if (node.computed || node.property.name != propName) return;
        if (findType(node.object, scope).getType() == objType) f(node.property);
      },
      ObjectExpression: function(node, scope) {
        if (findType(node, scope).getType() != objType) return;
        for (var i = 0; i < node.properties.length; ++i)
          if (node.properties[i].key.name == propName) f(node.properties[i].key);
      }
    }, simpleWalker, scope);
  };
  var scopeAt = exports.scopeAt = function(ast, pos, defaultScope) {
    var found = walk.findNodeAround(ast, pos, function(_, node) {
      return node.scope;
    });
    if (found) return found.node.scope;
    else return defaultScope || cx.topScope;
  };
  exports.forAllLocalsAt = function(ast, pos, defaultScope, f) {
    var scope = scopeAt(ast, pos, defaultScope);
    scope.gatherProperties(f, 0);
  };
  def = exports.def = def.init({}, exports);
});;
/*! RESOURCE: /scripts/codemirror_tern/doc_comment.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    return mod(require("../lib/infer"), require("../lib/tern"), require("../lib/comment"),
      require("acorn"), require("acorn/dist/walk"));
  if (typeof define == "function" && define.amd)
    return define(["../lib/infer", "../lib/tern", "../lib/comment", "acorn/dist/acorn", "acorn/dist/walk"], mod);
  mod(tern, tern, tern.comment, acorn, acorn.walk);
})(function(infer, tern, comment, acorn, walk) {
  "use strict";
  var WG_MADEUP = 1,
    WG_STRONG = 101;
  tern.registerPlugin("doc_comment", function(server, options) {
    server.mod.jsdocTypedefs = Object.create(null);
    server.on("reset", function() {
      server.mod.jsdocTypedefs = Object.create(null);
    });
    server.mod.docComment = {
      weight: options && options.strong ? WG_STRONG : undefined,
      fullDocs: options && options.fullDocs
    };
    server.on("postParse", postParse)
    server.on("postInfer", postInfer)
    server.on("postLoadDef", postLoadDef)
  });

  function postParse(ast, text) {
    function attachComments(node) {
      comment.ensureCommentsBefore(text, node);
    }
    walk.simple(ast, {
      VariableDeclaration: attachComments,
      FunctionDeclaration: attachComments,
      MethodDefinition: attachComments,
      Property: attachComments,
      AssignmentExpression: function(node) {
        if (node.operator == "=") attachComments(node);
      },
      CallExpression: function(node) {
        if (isDefinePropertyCall(node)) attachComments(node);
      }
    });
  }

  function isDefinePropertyCall(node) {
    return node.callee.type == "MemberExpression" &&
      node.callee.object.name == "Object" &&
      node.callee.property.name == "defineProperty" &&
      node.arguments.length >= 3 &&
      typeof node.arguments[1].value == "string";
  }

  function postInfer(ast, scope) {
    jsdocParseTypedefs(ast.sourceFile.text, scope);
    walk.simple(ast, {
      VariableDeclaration: function(node, scope) {
        var decl = node.declarations[0].id
        if (node.commentsBefore && decl.type == "Identifier")
          interpretComments(node, node.commentsBefore, scope,
            scope.getProp(node.declarations[0].id.name));
      },
      FunctionDeclaration: function(node, scope) {
        if (node.commentsBefore)
          interpretComments(node, node.commentsBefore, scope,
            scope.getProp(node.id.name),
            node.scope.fnType);
      },
      ClassDeclaration: function(node, scope) {
        if (node.commentsBefore)
          interpretComments(node, node.commentsBefore, scope,
            scope.getProp(node.id.name),
            node.objType);
      },
      AssignmentExpression: function(node, scope) {
        if (node.commentsBefore)
          interpretComments(node, node.commentsBefore, scope,
            infer.expressionType({
              node: node.left,
              state: scope
            }));
      },
      ObjectExpression: function(node, scope) {
        for (var i = 0; i < node.properties.length; ++i) {
          var prop = node.properties[i],
            name = infer.propName(prop)
          if (name != "<i>" && prop.commentsBefore)
            interpretComments(prop, prop.commentsBefore, scope, node.objType.getProp(name))
        }
      },
      Class: function(node, scope) {
        var proto = node.objType.getProp("prototype").getObjType()
        if (!proto) return
        for (var i = 0; i < node.body.body.length; i++) {
          var method = node.body.body[i],
            name
          if (!method.commentsBefore) continue
          if (method.kind == "constructor")
            interpretComments(method, method.commentsBefore, scope, node.objType)
          else if ((name = infer.propName(method)) != "<i>")
            interpretComments(method, method.commentsBefore, scope, proto.getProp(name))
        }
      },
      CallExpression: function(node, scope) {
        if (node.commentsBefore && isDefinePropertyCall(node)) {
          var type = infer.expressionType({
            node: node.arguments[0],
            state: scope
          }).getObjType();
          if (type && type instanceof infer.Obj) {
            var prop = type.props[node.arguments[1].value];
            if (prop) interpretComments(node, node.commentsBefore, scope, prop);
          }
        }
      }
    }, infer.searchVisitor, scope);
  }

  function postLoadDef(data) {
    var defs = data["!typedef"];
    var cx = infer.cx(),
      orig = data["!name"];
    if (defs)
      for (var name in defs)
        cx.parent.mod.jsdocTypedefs[name] =
        maybeInstance(infer.def.parse(defs[name], orig, name), name);
  }

  function stripLeadingChars(lines) {
    for (var head, i = 1; i < lines.length; i++) {
      var line = lines[i],
        lineHead = line.match(/^[\s\*]*/)[0];
      if (lineHead != line) {
        if (head == null) {
          head = lineHead;
        } else {
          var same = 0;
          while (same < head.length && head.charCodeAt(same) == lineHead.charCodeAt(same)) ++same;
          if (same < head.length) head = head.slice(0, same)
        }
      }
    }
    lines = lines.map(function(line, i) {
      line = line.replace(/\s+$/, "");
      if (i == 0 && head != null) {
        for (var j = 0; j < head.length; j++) {
          var found = line.indexOf(head.slice(j));
          if (found == 0) return line.slice(head.length - j);
        }
      }
      if (head == null || i == 0) return line.replace(/^[\s\*]*/, "");
      if (line.length < head.length) return "";
      return line.slice(head.length);
    });
    while (lines.length && !lines[lines.length - 1]) lines.pop();
    while (lines.length && !lines[0]) lines.shift();
    return lines;
  }

  function interpretComments(node, comments, scope, aval, type) {
    jsdocInterpretComments(node, scope, aval, comments);
    var cx = infer.cx();
    if (!type && aval instanceof infer.AVal && aval.types.length) {
      type = aval.types[aval.types.length - 1];
      if (!(type instanceof infer.Obj) || type.origin != cx.curOrigin || type.doc)
        type = null;
    }
    for (var i = comments.length - 1; i >= 0; i--) {
      var text = stripLeadingChars(comments[i].split(/\r\n?|\n/)).join("\n");
      if (text) {
        if (aval instanceof infer.AVal) aval.doc = text;
        if (type) type.doc = text;
        break;
      }
    }
  }

  function skipSpace(str, pos) {
    while (/\s/.test(str.charAt(pos))) ++pos;
    return pos;
  }

  function isIdentifier(string) {
    if (!acorn.isIdentifierStart(string.charCodeAt(0))) return false;
    for (var i = 1; i < string.length; i++)
      if (!acorn.isIdentifierChar(string.charCodeAt(i))) return false;
    return true;
  }

  function parseLabelList(scope, str, pos, close) {
    var labels = [],
      types = [],
      madeUp = false;
    for (var first = true;; first = false) {
      pos = skipSpace(str, pos);
      if (first && str.charAt(pos) == close) break;
      var colon = str.indexOf(":", pos);
      if (colon < 0) return null;
      var label = str.slice(pos, colon);
      if (!isIdentifier(label)) return null;
      labels.push(label);
      pos = colon + 1;
      var type = parseType(scope, str, pos);
      if (!type) return null;
      pos = type.end;
      madeUp = madeUp || type.madeUp;
      types.push(type.type);
      pos = skipSpace(str, pos);
      var next = str.charAt(pos);
      ++pos;
      if (next == close) break;
      if (next != ",") return null;
    }
    return {
      labels: labels,
      types: types,
      end: pos,
      madeUp: madeUp
    };
  }

  function parseTypeAtom(scope, str, pos) {
    var result = parseTypeInner(scope, str, pos)
    if (!result) return null
    if (str.slice(result.end, result.end + 2) == "[]")
      return {
        madeUp: result.madeUp,
        end: result.end + 2,
        type: new infer.Arr(result.type)
      }
    else return result
  }

  function parseType(scope, str, pos) {
    var type, union = false,
      madeUp = false;
    for (;;) {
      var inner = parseTypeAtom(scope, str, pos);
      if (!inner) return null;
      madeUp = madeUp || inner.madeUp;
      if (union) inner.type.propagate(union);
      else type = inner.type;
      pos = skipSpace(str, inner.end);
      if (str.charAt(pos) != "|") break;
      pos++;
      if (!union) {
        union = new infer.AVal;
        type.propagate(union);
        type = union;
      }
    }
    var isOptional = false;
    if (str.charAt(pos) == "=") {
      ++pos;
      isOptional = true;
    }
    return {
      type: type,
      end: pos,
      isOptional: isOptional,
      madeUp: madeUp
    };
  }

  function parseTypeInner(scope, str, pos) {
    pos = skipSpace(str, pos);
    var type, madeUp = false;
    if (str.indexOf("function(", pos) == pos) {
      var args = parseLabelList(scope, str, pos + 9, ")"),
        ret = infer.ANull;
      if (!args) return null;
      pos = skipSpace(str, args.end);
      if (str.charAt(pos) == ":") {
        ++pos;
        var retType = parseType(scope, str, pos + 1);
        if (!retType) return null;
        pos = retType.end;
        ret = retType.type;
        madeUp = retType.madeUp;
      }
      type = new infer.Fn(null, infer.ANull, args.types, args.labels, ret);
    } else if (str.charAt(pos) == "[") {
      var inner = parseType(scope, str, pos + 1);
      if (!inner) return null;
      pos = skipSpace(str, inner.end);
      madeUp = inner.madeUp;
      if (str.charAt(pos) != "]") return null;
      ++pos;
      type = new infer.Arr(inner.type);
    } else if (str.charAt(pos) == "{") {
      var fields = parseLabelList(scope, str, pos + 1, "}");
      if (!fields) return null;
      type = new infer.Obj(true);
      for (var i = 0; i < fields.types.length; ++i) {
        var field = type.defProp(fields.labels[i]);
        field.initializer = true;
        fields.types[i].propagate(field);
      }
      pos = fields.end;
      madeUp = fields.madeUp;
    } else if (str.charAt(pos) == "(") {
      var inner = parseType(scope, str, pos + 1);
      if (!inner) return null;
      pos = skipSpace(str, inner.end);
      if (str.charAt(pos) != ")") return null;
      ++pos;
      type = inner.type;
    } else {
      var start = pos;
      if (!acorn.isIdentifierStart(str.charCodeAt(pos))) return null;
      while (acorn.isIdentifierChar(str.charCodeAt(pos))) ++pos;
      if (start == pos) return null;
      var word = str.slice(start, pos);
      if (/^(number|integer)$/i.test(word)) type = infer.cx().num;
      else if (/^bool(ean)?$/i.test(word)) type = infer.cx().bool;
      else if (/^string$/i.test(word)) type = infer.cx().str;
      else if (/^(null|undefined)$/i.test(word)) type = infer.ANull;
      else if (/^array$/i.test(word)) {
        var inner = null;
        if (str.charAt(pos) == "." && str.charAt(pos + 1) == "<") {
          var inAngles = parseType(scope, str, pos + 2);
          if (!inAngles) return null;
          pos = skipSpace(str, inAngles.end);
          madeUp = inAngles.madeUp;
          if (str.charAt(pos++) != ">") return null;
          inner = inAngles.type;
        }
        type = new infer.Arr(inner);
      } else if (/^object$/i.test(word)) {
        type = new infer.Obj(true);
        if (str.charAt(pos) == "." && str.charAt(pos + 1) == "<") {
          var key = parseType(scope, str, pos + 2);
          if (!key) return null;
          pos = skipSpace(str, key.end);
          madeUp = madeUp || key.madeUp;
          if (str.charAt(pos++) != ",") return null;
          var val = parseType(scope, str, pos);
          if (!val) return null;
          pos = skipSpace(str, val.end);
          madeUp = key.madeUp || val.madeUp;
          if (str.charAt(pos++) != ">") return null;
          val.type.propagate(type.defProp("<i>"));
        }
      } else {
        while (str.charCodeAt(pos) == 46 ||
          acorn.isIdentifierChar(str.charCodeAt(pos))) ++pos;
        var path = str.slice(start, pos);
        var cx = infer.cx(),
          defs = cx.parent && cx.parent.mod.jsdocTypedefs,
          found;
        if (defs && (path in defs)) {
          type = defs[path];
        } else if (found = infer.def.parsePath(path, scope).getObjType()) {
          type = maybeInstance(found, path);
        } else {
          if (!cx.jsdocPlaceholders) cx.jsdocPlaceholders = Object.create(null);
          if (!(path in cx.jsdocPlaceholders))
            type = cx.jsdocPlaceholders[path] = new infer.Obj(null, path);
          else
            type = cx.jsdocPlaceholders[path];
          madeUp = true;
        }
      }
    }
    return {
      type: type,
      end: pos,
      madeUp: madeUp
    };
  }

  function maybeInstance(type, path) {
    if (type instanceof infer.Fn && /(?:^|\.)[A-Z][^\.]*$/.test(path)) {
      var proto = type.getProp("prototype").getObjType();
      if (proto instanceof infer.Obj) return infer.getInstance(proto);
    }
    return type;
  }

  function parseTypeOuter(scope, str, pos) {
    pos = skipSpace(str, pos || 0);
    if (str.charAt(pos) != "{") return null;
    var result = parseType(scope, str, pos + 1);
    if (!result) return null;
    var end = skipSpace(str, result.end);
    if (str.charAt(end) != "}") return null;
    result.end = end + 1;
    return result;
  }

  function jsdocInterpretComments(node, scope, aval, comments) {
    var type, args, ret, foundOne, self, parsed;
    for (var i = 0; i < comments.length; ++i) {
      var comment = comments[i];
      var decl = /(?:\n|$|\*)\s*@(type|param|arg(?:ument)?|returns?|this|class|constructor)\s+(.*)/g,
        m;
      while (m = decl.exec(comment)) {
        if (m[1] == "class" || m[1] == "constructor") {
          self = foundOne = true;
          continue;
        }
        if (m[1] == "this" && (parsed = parseType(scope, m[2], 0))) {
          self = parsed;
          foundOne = true;
          continue;
        }
        if (!(parsed = parseTypeOuter(scope, m[2]))) continue;
        foundOne = true;
        switch (m[1]) {
          case "returns":
          case "return":
            ret = parsed;
            break;
          case "type":
            type = parsed;
            break;
          case "param":
          case "arg":
          case "argument":
            var name = m[2].slice(parsed.end).match(/^\s*(\[?)\s*([^\]\s=]+)\s*(?:=[^\]]+\s*)?(\]?).*/);
            if (!name) continue;
            var argname = name[2] + (parsed.isOptional || (name[1] === '[' && name[3] === ']') ? "?" : "");
            (args || (args = Object.create(null)))[argname] = parsed;
            break;
        }
      }
    }
    if (foundOne) applyType(type, self, args, ret, node, aval);
  };

  function jsdocParseTypedefs(text, scope) {
    var cx = infer.cx();
    var re = /\s@typedef\s+(.*)/g,
      m;
    while (m = re.exec(text)) {
      var parsed = parseTypeOuter(scope, m[1]);
      var name = parsed && m[1].slice(parsed.end).match(/^\s*(\S+)/);
      if (name && parsed.type instanceof infer.Obj) {
        var rest = text.slice(m.index + m[0].length)
        while (m = /\s+@prop(?:erty)?\s+(.*)/.exec(rest)) {
          var propType = parseTypeOuter(scope, m[1]),
            propName
          if (propType && (propName = m[1].slice(propType.end).match(/^\s*(\S+)/)))
            propType.type.propagate(parsed.type.defProp(propName[1]))
          rest = rest.slice(m[0].length)
        }
        cx.parent.mod.jsdocTypedefs[name[1]] = parsed.type;
      }
    }
  }

  function propagateWithWeight(type, target) {
    var weight = infer.cx().parent.mod.docComment.weight;
    type.type.propagate(target, weight || (type.madeUp ? WG_MADEUP : undefined));
  }

  function isFunExpr(node) {
    return node.type == "FunctionExpression" || node.type == "ArrowFunctionExpression"
  }

  function applyType(type, self, args, ret, node, aval) {
    var fn;
    if (node.type == "VariableDeclaration") {
      var decl = node.declarations[0];
      if (decl.init && isFunExpr(decl.init)) fn = decl.init.scope.fnType;
    } else if (node.type == "FunctionDeclaration") {
      fn = node.scope.fnType;
    } else if (node.type == "AssignmentExpression") {
      if (isFunExpr(node.right))
        fn = node.right.scope.fnType;
    } else if (node.type == "CallExpression") {} else {
      if (isFunExpr(node.value)) fn = node.value.scope.fnType;
    }
    if (fn && (args || ret || self)) {
      if (args)
        for (var i = 0; i < fn.argNames.length; ++i) {
          var name = fn.argNames[i],
            known = args[name];
          if (!known && (known = args[name + "?"]))
            fn.argNames[i] += "?";
          if (known) propagateWithWeight(known, fn.args[i]);
        }
      if (ret) {
        if (fn.retval == infer.ANull) fn.retval = new infer.AVal;
        propagateWithWeight(ret, fn.retval);
      }
      if (self === true) {
        var proto = fn.getProp("prototype").getObjType();
        self = proto && {
          type: infer.getInstance(proto, fn)
        };
      }
      if (self) propagateWithWeight(self, fn.self);
    } else if (type) {
      propagateWithWeight(type, aval);
    }
  };
});;
/*! RESOURCE: /scripts/codemirror_tern/tern-angular-plugin.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    return mod(require("../lib/infer"), require("../lib/tern"), require("../lib/comment"),
      require("acorn/dist/walk"));
  if (typeof define == "function" && define.amd)
    return define(["../lib/infer", "../lib/tern", "../lib/comment", "acorn/dist/walk"], mod);
  mod(tern, tern, tern.comment, acorn.walk);
})(function(infer, tern, comment, walk) {
  "use strict";
  var SetDoc = infer.constraint({
    construct: function(doc) {
      this.doc = doc;
    },
    addType: function(type) {
      if (!type.doc) type.doc = this.doc;
    }
  });

  function Injector() {
    this.fields = Object.create(null);
    this.forward = [];
  }
  Injector.prototype.get = function(name) {
    if (name == "$scope") return new infer.Obj(globalInclude("$rootScope").getType(), "$scope");
    if (name in this.fields) return this.fields[name];
    var field = this.fields[name] = new infer.AVal;
    return field;
  };
  Injector.prototype.set = function(name, val, doc, node, depth) {
    if (name == "$scope" || depth && depth > 10) return;
    var field = this.fields[name] || (this.fields[name] = new infer.AVal);
    if (!depth) field.local = true;
    if (!field.origin) field.origin = infer.cx().curOrigin;
    if (typeof node == "string" && !field.span) field.span = node;
    else if (node && typeof node == "object" && !field.originNode) field.originNode = node;
    if (doc) {
      field.doc = doc;
      field.propagate(new SetDoc(doc));
    }
    val.propagate(field);
    for (var i = 0; i < this.forward.length; ++i)
      this.forward[i].set(name, val, doc, node, (depth || 0) + 1);
  };
  Injector.prototype.forwardTo = function(injector) {
    this.forward.push(injector);
    for (var field in this.fields) {
      var val = this.fields[field];
      injector.set(field, val, val.doc, val.span || val.originNode, 1);
    }
  };

  function globalInclude(name) {
    var service = infer.cx().definitions.angular.service;
    if (service.hasProp(name)) return service.getProp(name);
  }

  function getInclude(mod, name) {
    var glob = globalInclude(name);
    if (glob) return glob;
    if (!mod.injector) return infer.ANull;
    return mod.injector ? mod.injector.get(name) : infer.ANull;
  }

  function applyWithInjection(mod, fnType, node, asNew) {
    var deps = [];
    if (/FunctionExpression/.test(node.type)) {
      for (var i = 0; i < node.params.length; ++i)
        deps.push(getInclude(mod, node.params[i].name));
    } else if (node.type == "ArrayExpression") {
      for (var i = 0; i < node.elements.length - 1; ++i) {
        var elt = node.elements[i];
        if (elt.type == "Literal" && typeof elt.value == "string")
          deps.push(getInclude(mod, elt.value));
        else
          deps.push(infer.ANull);
      }
      var last = node.elements[node.elements.length - 1];
      if (last && /FunctionExpression/.test(last.type))
        fnType = last.scope.fnType;
    }
    var result = new infer.AVal;
    if (asNew) {
      var self = new infer.AVal;
      fnType.propagate(new infer.IsCtor(self));
      self.propagate(result, 90);
      fnType.propagate(new infer.IsCallee(self, deps, null, new infer.IfObj(result)));
    } else {
      fnType.propagate(new infer.IsCallee(infer.cx().topScope, deps, null, result));
    }
    return result;
  }
  infer.registerFunction("angular_callInject", function(argN) {
    return function(self, args, argNodes) {
      var mod = self.getType();
      if (mod && argNodes && argNodes[argN])
        applyWithInjection(mod, args[argN], argNodes[argN]);
    };
  });
  infer.registerFunction("angular_regFieldCall", function(self, args, argNodes) {
    var mod = self.getType();
    if (mod && argNodes && argNodes.length > 1) {
      var result = applyWithInjection(mod, args[1], argNodes[1]);
      if (mod.injector && argNodes[0].type == "Literal")
        mod.injector.set(argNodes[0].value, result, argNodes[0].angularDoc, argNodes[0]);
    }
  });
  infer.registerFunction("angular_regFieldNew", function(self, args, argNodes) {
    var mod = self.getType();
    if (mod && argNodes && argNodes.length > 1) {
      var result = applyWithInjection(mod, args[1], argNodes[1], true);
      if (mod.injector && argNodes[0].type == "Literal")
        mod.injector.set(argNodes[0].value, result, argNodes[0].angularDoc, argNodes[0]);
    }
  });
  infer.registerFunction("angular_regField", function(self, args, argNodes) {
    var mod = self.getType();
    if (mod && mod.injector && argNodes && argNodes[0] && argNodes[0].type == "Literal" && args[1])
      mod.injector.set(argNodes[0].value, args[1], argNodes[0].angularDoc, argNodes[0]);
  });

  function arrayNodeToStrings(node) {
    var strings = [];
    if (node && node.type == "ArrayExpression")
      for (var i = 0; i < node.elements.length; ++i) {
        var elt = node.elements[i];
        if (elt.type == "Literal" && typeof elt.value == "string")
          strings.push(elt.value);
      }
    return strings;
  }

  function moduleProto(cx) {
    var ngDefs = cx.definitions.angular;
    return ngDefs && ngDefs.Module.getProp("prototype").getType();
  }

  function declareMod(name, includes) {
    var cx = infer.cx(),
      data = cx.parent.mod.angular;
    var proto = moduleProto(cx);
    var mod = new infer.Obj(proto || true);
    if (!proto) data.nakedModules.push(mod);
    mod.origin = cx.curOrigin;
    mod.injector = new Injector();
    mod.metaData = {
      includes: includes
    };
    for (var i = 0; i < includes.length; ++i) {
      var depMod = data.modules[includes[i]];
      if (!depMod)
        (data.pendingImports[includes[i]] || (data.pendingImports[includes[i]] = [])).push(mod.injector);
      else if (depMod.injector)
        depMod.injector.forwardTo(mod.injector);
    }
    if (typeof name == "string") {
      data.modules[name] = mod;
      var pending = data.pendingImports[name];
      if (pending) {
        delete data.pendingImports[name];
        for (var i = 0; i < pending.length; ++i)
          mod.injector.forwardTo(pending[i]);
      }
    }
    return mod;
  }
  infer.registerFunction("angular_module", function(_self, _args, argNodes) {
    var mod, name = argNodes && argNodes[0] && argNodes[0].type == "Literal" && argNodes[0].value;
    if (typeof name == "string")
      mod = infer.cx().parent.mod.angular.modules[name];
    if (!mod)
      mod = declareMod(name, arrayNodeToStrings(argNodes && argNodes[1]));
    return mod;
  });
  var IsBound = infer.constraint({
    construct: function(self, args, target) {
      this.self = self;
      this.args = args;
      this.target = target;
    },
    addType: function(tp) {
      if (!(tp instanceof infer.Fn)) return;
      this.target.addType(new infer.Fn(tp.name, tp.self, tp.args.slice(this.args.length),
        tp.argNames.slice(this.args.length), tp.retval));
      this.self.propagate(tp.self);
      for (var i = 0; i < Math.min(tp.args.length, this.args.length); ++i)
        this.args[i].propagate(tp.args[i]);
    }
  });
  infer.registerFunction("angular_bind", function(_self, args) {
    if (args.length < 2) return infer.ANull;
    var result = new infer.AVal;
    args[1].propagate(new IsBound(args[0], args.slice(2), result));
    return result;
  });

  function postParse(ast, text) {
    walk.simple(ast, {
      CallExpression: function(node) {
        if (node.callee.type == "MemberExpression" &&
          !node.callee.computed && node.arguments.length &&
          /^(value|constant|controller|factory|provider)$/.test(node.callee.property.name)) {
          var before = comment.commentsBefore(text, node.callee.property.start - 1);
          if (before) {
            var first = before[0],
              dot = first.search(/\.\s/);
            if (dot > 5) first = first.slice(0, dot + 1);
            first = first.trim().replace(/\s*\n\s*\*\s*|\s{1,}/g, " ");
            node.arguments[0].angularDoc = first;
          }
        }
      }
    });
  }

  function postLoadDef(json) {
    var cx = infer.cx(),
      defName = json["!name"],
      defs = cx.definitions[defName];
    if (defName == "angular") {
      var proto = moduleProto(cx),
        naked = cx.parent.mod.angular.nakedModules;
      if (proto)
        for (var i = 0; i < naked.length; ++i) naked[i].proto = proto;
      return;
    }
    var mods = defs && defs["!ng"];
    if (mods)
      for (var name in mods.props) {
        var obj = mods.props[name].getType();
        var mod = declareMod(name.replace(/`/g, "."), obj.metaData && obj.metaData.includes || []);
        mod.origin = defName;
        for (var prop in obj.props) {
          var val = obj.props[prop],
            tp = val.getType();
          if (!tp) continue;
          if (/^_inject_/.test(prop)) {
            if (!tp.name) tp.name = prop.slice(8);
            mod.injector.set(prop.slice(8), tp, val.doc, val.span);
          } else {
            obj.props[prop].propagate(mod.defProp(prop));
          }
        }
      }
  }

  function preCondenseReach(state) {
    var mods = infer.cx().parent.mod.angular.modules;
    var modObj = new infer.Obj(null),
      found = 0;
    for (var name in mods) {
      var mod = mods[name];
      if (state.origins.indexOf(mod.origin) > -1) {
        var propName = name.replace(/\./g, "`");
        modObj.defProp(propName).addType(mod);
        mod.condenseForceInclude = true;
        ++found;
        if (mod.injector)
          for (var inj in mod.injector.fields) {
            var field = mod.injector.fields[inj];
            if (field.local) state.roots["!ng." + propName + "._inject_" + inj] = field;
          }
      }
    }
    if (found) state.roots["!ng"] = modObj;
  }

  function postCondenseReach(state) {
    var mods = infer.cx().parent.mod.angular.modules;
    for (var path in state.types) {
      var m;
      if (m = path.match(/^!ng\.([^\.]+)\._inject_([^\.]+)^/)) {
        var mod = mods[m[1].replace(/`/g, ".")];
        var field = mod.injector.fields[m[2]];
        var data = state.types[path];
        if (field.span) data.span = field.span;
        if (field.doc) data.doc = field.doc;
      }
    }
  }

  function initServer(server) {
    server.mod.angular = {
      modules: Object.create(null),
      pendingImports: Object.create(null),
      nakedModules: []
    };
  }
  tern.registerPlugin("angular", function(server) {
    initServer(server);
    server.on("reset", function() {
      initServer(server);
    });
    server.on("postParse", postParse)
    server.on("postLoadDef", postLoadDef)
    server.on("preCondenseReach", preCondenseReach)
    server.on("postCondenseReach", postCondenseReach)
    server.addDefs(defs, true)
  });
  var defs = {
    "!name": "angular",
    "!define": {
      cacheObj: {
        info: "fn() -> ?",
        put: "fn(key: string, value: ?) -> !1",
        get: "fn(key: string) -> ?",
        remove: "fn(key: string)",
        removeAll: "fn()",
        destroy: "fn()"
      },
      eventObj: {
        targetScope: "service.$rootScope",
        currentScope: "service.$rootScope",
        name: "string",
        stopPropagation: "fn()",
        preventDefault: "fn()",
        defaultPrevented: "bool"
      },
      directiveObj: {
        multiElement: {
          "!type": "bool",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-multielement-",
          "!doc": "When this property is set to true, the HTML compiler will collect DOM nodes between nodes with the attributes directive-name-start and directive-name-end, and group them together as the directive elements. It is recommended that this feature be used on directives which are not strictly behavioural (such as ngClick), and which do not manipulate or replace child nodes (such as ngInclude)."
        },
        priority: {
          "!type": "number",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-priority-",
          "!doc": "When there are multiple directives defined on a single DOM element, sometimes it is necessary to specify the order in which the directives are applied. The priority is used to sort the directives before their compile functions get called. Priority is defined as a number. Directives with greater numerical priority are compiled first. Pre-link functions are also run in priority order, but post-link functions are run in reverse order. The order of directives with the same priority is undefined. The default priority is 0."
        },
        terminal: {
          "!type": "bool",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-terminal-",
          "!doc": "If set to true then the current priority will be the last set of directives which will execute (any directives at the current priority will still execute as the order of execution on same priority is undefined). Note that expressions and other directives used in the directive's template will also be excluded from execution."
        },
        scope: {
          "!type": "?",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-scope-",
          "!doc": "If set to true, then a new scope will be created for this directive. If multiple directives on the same element request a new scope, only one new scope is created. The new scope rule does not apply for the root of the template since the root of the template always gets a new scope. If set to {} (object hash), then a new 'isolate' scope is created. The 'isolate' scope differs from normal scope in that it does not prototypically inherit from the parent scope. This is useful when creating reusable components, which should not accidentally read or modify data in the parent scope."
        },
        bindToController: {
          "!type": "bool",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-bindtocontroller-",
          "!doc": "When an isolate scope is used for a component (see above), and controllerAs is used, bindToController: true will allow a component to have its properties bound to the controller, rather than to scope. When the controller is instantiated, the initial values of the isolate scope bindings are already available."
        },
        controller: {
          "!type": "fn()",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-require-",
          "!doc": "Controller constructor function. The controller is instantiated before the pre-linking phase and it is shared with other directives (see require attribute). This allows the directives to communicate with each other and augment each other's behavior."
        },
        require: {
          "!type": "string",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-controller-",
          "!doc": "Require another directive and inject its controller as the fourth argument to the linking function. The require takes a string name (or array of strings) of the directive(s) to pass in. If an array is used, the injected argument will be an array in corresponding order. If no such directive can be found, or if the directive does not have a controller, then an error is raised."
        },
        controllerAs: {
          "!type": "string",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-controlleras-",
          "!doc": "Controller alias at the directive scope. An alias for the controller so it can be referenced at the directive template. The directive needs to define a scope for this configuration to be used. Useful in the case when directive is used as component."
        },
        restrict: {
          "!type": "string",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-restrict-",
          "!doc": "String of subset of EACM which restricts the directive to a specific directive declaration style. If omitted, the defaults (elements and attributes) are used. E - Element name (default): <my-directive></my-directive>. A - Attribute (default): <div my-directive='exp'></div>. C - Class: <div class='my-directive: exp;'></div>. M - Comment: <!-- directive: my-directive exp --> "
        },
        templateNamespace: {
          "!type": "string",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-templatenamespace-",
          "!doc": "String representing the document type used by the markup in the template. AngularJS needs this information as those elements need to be created and cloned in a special way when they are defined outside their usual containers like <svg> and <math>."
        },
        template: {
          "!type": "string",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-template-",
          "!doc": "HTML markup that may: Replace the contents of the directive's element (default). Replace the directive's element itself (if replace is true - DEPRECATED). Wrap the contents of the directive's element (if transclude is true)."
        },
        templateUrl: {
          "!type": "string",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-templateurl-",
          "!doc": "This is similar to template but the template is loaded from the specified URL, asynchronously."
        },
        transclude: {
          "!type": "bool",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-transclude-",
          "!doc": "Extract the contents of the element where the directive appears and make it available to the directive. The contents are compiled and provided to the directive as a transclusion function."
        },
        compile: {
          "!type": "fn(tElement: +Element, tAttrs: +Attr)",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-transclude-",
          "!doc": "The compile function deals with transforming the template DOM. Since most directives do not do template transformation, it is not used often."
        },
        link: {
          "!type": "fn(scope: ?, iElement: +Element, iAttrs: +Attr, controller: ?, transcludeFn: fn())",
          "!url": "https://docs.angularjs.org/api/ng/service/$compile#-link-",
          "!doc": "The link function is responsible for registering DOM listeners as well as updating the DOM. It is executed after the template has been cloned. This is where most of the directive logic will be put."
        }
      },
      Module: {
        "!url": "http://docs.angularjs.org/api/angular.Module",
        "!doc": "Interface for configuring angular modules.",
        prototype: {
          animation: {
            "!type": "fn(name: string, animationFactory: fn()) -> !this",
            "!url": "http://docs.angularjs.org/api/angular.Module#animation",
            "!doc": "Defines an animation hook that can be later used with $animate service and directives that use this service."
          },
          config: {
            "!type": "fn(configFn: fn()) -> !this",
            "!effects": ["custom angular_callInject 0"],
            "!url": "http://docs.angularjs.org/api/angular.Module#config",
            "!doc": "Use this method to register work which needs to be performed on module loading."
          },
          constant: "service.$provide.constant",
          controller: {
            "!type": "fn(name: string, constructor: fn()) -> !this",
            "!effects": ["custom angular_regFieldCall"],
            "!url": "http://docs.angularjs.org/api/ng.$controllerProvider",
            "!doc": "Register a controller."
          },
          directive: {
            "!type": "fn(name: string, directiveFactory: fn() -> directiveObj) -> !this",
            "!effects": ["custom angular_regFieldCall"],
            "!url": "http://docs.angularjs.org/api/ng.$compileProvider#directive",
            "!doc": "Register a new directive with the compiler."
          },
          factory: "service.$provide.factory",
          filter: {
            "!type": "fn(name: string, filterFactory: fn()) -> !this",
            "!effects": ["custom angular_callInject 1"],
            "!url": "http://docs.angularjs.org/api/ng.$filterProvider",
            "!doc": "Register filter factory function."
          },
          provider: "service.$provide.provider",
          run: {
            "!type": "fn(initializationFn: fn()) -> !this",
            "!effects": ["custom angular_callInject 0"],
            "!url": "http://docs.angularjs.org/api/angular.Module#run",
            "!doc": "Register work which should be performed when the injector is done loading all modules."
          },
          service: "service.$provide.service",
          value: "service.$provide.value",
          name: {
            "!type": "string",
            "!url": "http://docs.angularjs.org/api/angular.Module#name",
            "!doc": "Name of the module."
          },
          requires: {
            "!type": "[string]",
            "!url": "http://docs.angularjs.org/api/angular.Module#requires",
            "!doc": "List of module names which must be loaded before this module."
          }
        }
      },
      Promise: {
        "!url": "http://docs.angularjs.org/api/ng.$q",
        "!doc": "Allow for interested parties to get access to the result of the deferred task when it completes.",
        prototype: {
          then: "fn(successCallback: fn(value: ?), errorCallback: fn(reason: ?), notifyCallback: fn(value: ?)) -> +Promise",
          "catch": "fn(errorCallback: fn(reason: ?))",
          "finally": "fn(callback: fn()) -> +Promise",
          success: "fn(callback: fn(data: ?, status: number, headers: ?, config: ?)) -> +Promise",
          error: "fn(callback: fn(data: ?, status: number, headers: ?, config: ?)) -> +Promise"
        }
      },
      Deferred: {
        "!url": "http://docs.angularjs.org/api/ng.$q",
        prototype: {
          resolve: "fn(value: ?)",
          reject: "fn(reason: ?)",
          notify: "fn(value: ?)",
          promise: "+Promise"
        }
      },
      ResourceClass: {
        "!url": "http://docs.angularjs.org/api/ngResource.$resource",
        prototype: {
          $promise: "+Promise",
          $save: "fn()"
        }
      },
      Resource: {
        "!url": "http://docs.angularjs.org/api/ngResource.$resource",
        prototype: {
          get: "fn(params: ?, callback: fn()) -> +ResourceClass",
          save: "fn(params: ?, callback: fn()) -> +ResourceClass",
          query: "fn(params: ?, callback: fn()) -> +ResourceClass",
          remove: "fn(params: ?, callback: fn()) -> +ResourceClass",
          "delete": "fn(params: ?, callback: fn()) -> +ResourceClass"
        }
      },
      service: {
        $anchorScroll: {
          "!type": "fn()",
          "!url": "http://docs.angularjs.org/api/ng.$anchorScroll",
          "!doc": "Checks current value of $location.hash() and scroll to related element."
        },
        $animate: {
          "!url": "http://docs.angularjs.org/api/ng.$animate",
          "!doc": "Rudimentary DOM manipulation functions to insert, remove, move elements within the DOM.",
          addClass: {
            "!type": "fn(element: +Element, className: string, done?: fn()) -> !this",
            "!url": "http://docs.angularjs.org/api/ng.$animate#addClass",
            "!doc": "Adds the provided className CSS class value to the provided element."
          },
          enter: {
            "!type": "fn(element: +Element, parent: +Element, after: +Element, done?: fn()) -> !this",
            "!url": "http://docs.angularjs.org/api/ng.$animate#enter",
            "!doc": "Inserts the element into the DOM either after the after element or within the parent element."
          },
          leave: {
            "!type": "fn(element: +Element, done?: fn()) -> !this",
            "!url": "http://docs.angularjs.org/api/ng.$animate#leave",
            "!doc": "Removes the element from the DOM."
          },
          move: {
            "!type": "fn(element: +Element, parent: +Element, after: +Element, done?: fn()) -> !this",
            "!url": "http://docs.angularjs.org/api/ng.$animate#move",
            "!doc": "Moves element to be placed either after the after element or inside of the parent element."
          },
          removeClass: {
            "!type": "fn(element: +Element, className: string, done?: fn()) -> !this",
            "!url": "http://docs.angularjs.org/api/ng.$animate#removeClass",
            "!doc": "Removes the provided className CSS class value from the provided element."
          }
        },
        $cacheFactory: {
          "!type": "fn(cacheId: string, options?: ?) -> cacheObj",
          "!url": "http://docs.angularjs.org/api/ng.$cacheFactory",
          "!doc": "Factory that constructs cache objects and gives access to them."
        },
        $compile: {
          "!type": "fn(element: +Element, transclude: fn(scope: ?), maxPriority: number)",
          "!url": "http://docs.angularjs.org/api/ng.$compile",
          "!doc": "Compiles a piece of HTML string or DOM into a template and produces a template function."
        },
        $controller: {
          "!type": "fn(controller: fn(), locals: ?) -> ?",
          "!url": "http://docs.angularjs.org/api/ng.$controller",
          "!doc": "Instantiates controllers."
        },
        $document: {
          "!type": "jQuery.fn",
          "!url": "http://docs.angularjs.org/api/ng.$document",
          "!doc": "A jQuery (lite)-wrapped reference to the browser's window.document element."
        },
        $exceptionHandler: {
          "!type": "fn(exception: +Error, cause?: string)",
          "!url": "http://docs.angularjs.org/api/ng.$exceptionHandler",
          "!doc": "Any uncaught exception in angular expressions is delegated to this service."
        },
        $filter: {
          "!type": "fn(name: string) -> fn(input: string) -> string",
          "!url": "http://docs.angularjs.org/api/ng.$filter",
          "!doc": "Retrieve a filter function."
        },
        $http: {
          "!type": "fn(config: ?) -> service.$q",
          "!url": "http://docs.angularjs.org/api/ng.$http",
          "!doc": "Facilitates communication with remote HTTP servers.",
          "delete": "fn(url: string, config?: ?) -> +Promise",
          get: "fn(url: string, config?: ?) -> +Promise",
          head: "fn(url: string, config?: ?) -> +Promise",
          jsonp: "fn(url: string, config?: ?) -> +Promise",
          post: "fn(url: string, data: ?, config?: ?) -> +Promise",
          put: "fn(url: string, data: ?, config?: ?) -> +Promise"
        },
        $interpolate: {
          "!type": "fn(text: string, mustHaveExpression?: bool, trustedContext?: string) -> fn(context: ?) -> string",
          "!url": "http://docs.angularjs.org/api/ng.$interpolate",
          "!doc": "Compiles a string with markup into an interpolation function."
        },
        $locale: {
          "!url": "http://docs.angularjs.org/api/ng.$locale",
          id: "string"
        },
        $location: {
          "!url": "http://docs.angularjs.org/api/ng.$location",
          "!doc": "Parses the URL in the browser address bar.",
          absUrl: {
            "!type": "fn() -> string",
            "!url": "http://docs.angularjs.org/api/ng.$location#absUrl",
            "!doc": "Return full url representation."
          },
          hash: {
            "!type": "fn(value?: string) -> string",
            "!url": "http://docs.angularjs.org/api/ng.$location#hash",
            "!doc": "Get or set the hash fragment."
          },
          host: {
            "!type": "fn() -> string",
            "!url": "http://docs.angularjs.org/api/ng.$location#host",
            "!doc": "Return host of current url."
          },
          path: {
            "!type": "fn(value?: string) -> string",
            "!url": "http://docs.angularjs.org/api/ng.$location#path",
            "!doc": "Get or set the URL path."
          },
          port: {
            "!type": "fn() -> number",
            "!url": "http://docs.angularjs.org/api/ng.$location#port",
            "!doc": "Returns the port of the current url."
          },
          protocol: {
            "!type": "fn() -> string",
            "!url": "http://docs.angularjs.org/api/ng.$location#protocol",
            "!doc": "Return protocol of current url."
          },
          replace: {
            "!type": "fn()",
            "!url": "http://docs.angularjs.org/api/ng.$location#replace",
            "!doc": "Changes to $location during current $digest will be replacing current history record, instead of adding new one."
          },
          search: {
            "!type": "fn(search: string, paramValue?: string) -> string",
            "!url": "http://docs.angularjs.org/api/ng.$location#search",
            "!doc": "Get or set the URL query."
          },
          url: {
            "!type": "fn(url: string, replace?: string) -> string",
            "!url": "http://docs.angularjs.org/api/ng.$location#url",
            "!doc": "Get or set the current url."
          }
        },
        $log: {
          "!url": "http://docs.angularjs.org/api/ng.$log",
          "!doc": "Simple service for logging.",
          debug: {
            "!type": "fn(message: string)",
            "!url": "http://docs.angularjs.org/api/ng.$log#debug",
            "!doc": "Write a debug message."
          },
          error: {
            "!type": "fn(message: string)",
            "!url": "http://docs.angularjs.org/api/ng.$log#error",
            "!doc": "Write an error message."
          },
          info: {
            "!type": "fn(message: string)",
            "!url": "http://docs.angularjs.org/api/ng.$log#info",
            "!doc": "Write an info message."
          },
          log: {
            "!type": "fn(message: string)",
            "!url": "http://docs.angularjs.org/api/ng.$log#log",
            "!doc": "Write a log message."
          },
          warn: {
            "!type": "fn(message: string)",
            "!url": "http://docs.angularjs.org/api/ng.$log#warn",
            "!doc": "Write a warning message."
          }
        },
        $parse: {
          "!type": "fn(expression: string) -> fn(context: ?, locals: ?) -> ?",
          "!url": "http://docs.angularjs.org/api/ng.$parse",
          "!doc": "Converts Angular expression into a function."
        },
        $q: {
          "!type": "fn(executor: fn(resolve: fn(value: ?) -> +Promise, reject: fn(value: ?) -> +Promise)) -> +Promise",
          "!url": "http://docs.angularjs.org/api/ng.$q",
          "!doc": "A promise/deferred implementation.",
          all: {
            "!type": "fn(promises: [+Promise]) -> +Promise",
            "!url": "http://docs.angularjs.org/api/ng.$q#all",
            "!doc": "Combines multiple promises into a single promise."
          },
          defer: {
            "!type": "fn() -> +Deferred",
            "!url": "http://docs.angularjs.org/api/ng.$q#defer",
            "!doc": "Creates a Deferred object which represents a task which will finish in the future."
          },
          reject: {
            "!type": "fn(reason: ?) -> +Promise",
            "!url": "http://docs.angularjs.org/api/ng.$q#reject",
            "!doc": "Creates a promise that is resolved as rejected with the specified reason."
          },
          when: {
            "!type": "fn(value: ?) -> +Promise",
            "!url": "http://docs.angularjs.org/api/ng.$q#when",
            "!doc": "Wraps an object that might be a value or a (3rd party) then-able promise into a $q promise."
          }
        },
        $rootElement: {
          "!type": "+Element",
          "!url": "http://docs.angularjs.org/api/ng.$rootElement",
          "!doc": "The root element of Angular application."
        },
        $rootScope: {
          "!url": "http://docs.angularjs.org/api/ng.$rootScope",
          $apply: {
            "!type": "fn(expression: string)",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$apply",
            "!doc": "Execute an expression in angular from outside of the angular framework."
          },
          $broadcast: {
            "!type": "fn(name: string, args?: ?) -> eventObj",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$broadcast",
            "!doc": "Dispatches an event name downwards to all child scopes."
          },
          $destroy: {
            "!type": "fn()",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$destroy",
            "!doc": "Removes the current scope (and all of its children) from the parent scope."
          },
          $digest: {
            "!type": "fn()",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$digest",
            "!doc": "Processes all of the watchers of the current scope and its children."
          },
          $emit: {
            "!type": "fn(name: string, args?: ?) -> eventObj",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$emit",
            "!doc": "Dispatches an event name upwards through the scope hierarchy."
          },
          $eval: {
            "!type": "fn(expression: string) -> ?",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$eval",
            "!doc": "Executes the expression on the current scope and returns the result."
          },
          $evalAsync: {
            "!type": "fn(expression: string)",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$evalAsync",
            "!doc": "Executes the expression on the current scope at a later point in time."
          },
          $new: {
            "!type": "fn(isolate: bool) -> service.$rootScope",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$new",
            "!doc": "Creates a new child scope."
          },
          $on: {
            "!type": "fn(name: string, listener: fn(event: ?)) -> fn()",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$on",
            "!doc": "Listens on events of a given type."
          },
          $watch: {
            "!type": "fn(watchExpression: string, listener?: fn(), objectEquality?: bool) -> fn()",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$watch",
            "!doc": "Registers a listener callback to be executed whenever the watchExpression changes."
          },
          $watchCollection: {
            "!type": "fn(obj: string, listener: fn()) -> fn()",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$watchCollection",
            "!doc": "Shallow watches the properties of an object and fires whenever any of the properties."
          },
          $id: {
            "!type": "number",
            "!url": "http://docs.angularjs.org/api/ng.$rootScope.Scope#$id",
            "!doc": "Unique scope ID."
          }
        },
        $sce: {
          HTML: "string",
          CSS: "string",
          URL: "string",
          RESOURCE_URL: "string",
          JS: "string",
          getTrusted: "fn(type: string, maybeTrusted: ?) -> !1",
          getTrustedCss: "fn(maybeTrusted: ?) -> !0",
          getTrustedHtml: "fn(maybeTrusted: ?) -> !0",
          getTrustedJs: "fn(maybeTrusted: ?) -> !0",
          getTrustedResourceUrl: "fn(maybeTrusted: ?) -> !0",
          getTrustedUrl: "fn(maybeTrusted: ?) -> !0",
          parse: "fn(type: string, expression: string) -> fn(context: ?, locals: ?) -> ?",
          parseAsCss: "fn(expression: string) -> fn(context: ?, locals: ?) -> ?",
          parseAsHtml: "fn(expression: string) -> fn(context: ?, locals: ?) -> ?",
          parseAsJs: "fn(expression: string) -> fn(context: ?, locals: ?) -> ?",
          parseAsResourceUrl: "fn(expression: string) -> fn(context: ?, locals: ?) -> ?",
          parseAsUrl: "fn(expression: string) -> fn(context: ?, locals: ?) -> ?",
          trustAs: "fn(type: string, value: ?) -> !1",
          trustAsHtml: "fn(value: ?) -> !0",
          trustAsJs: "fn(value: ?) -> !0",
          trustAsResourceUrl: "fn(value: ?) -> !0",
          trustAsUrl: "fn(value: ?) -> !0",
          isEnabled: "fn() -> bool"
        },
        $templateCache: {
          "!url": "http://docs.angularjs.org/api/ng.$templateCache",
          "!proto": "cacheObj"
        },
        $timeout: {
          "!type": "fn(fn: fn(), delay?: number, invokeApply?: bool) -> +Promise",
          "!url": "http://docs.angularjs.org/api/ng.$timeout",
          "!doc": "Angular's wrapper for window.setTimeout.",
          cancel: "fn(promise: +Promise)"
        },
        $window: "<top>",
        $injector: {
          "!url": "http://docs.angularjs.org/api/AUTO.$injector",
          "!doc": "Retrieve object instances as defined by provider.",
          annotate: {
            "!type": "fn(f: fn()) -> [string]",
            "!url": "http://docs.angularjs.org/api/AUTO.$injector#annotate",
            "!doc": "Returns an array of service names which the function is requesting for injection."
          },
          get: {
            "!type": "fn(name: string) -> ?",
            "!url": "http://docs.angularjs.org/api/AUTO.$injector#get",
            "!doc": "Return an instance of a service."
          },
          has: {
            "!type": "fn(name: string) -> bool",
            "!url": "http://docs.angularjs.org/api/AUTO.$injector#has",
            "!doc": "Allows the user to query if the particular service exist."
          },
          instantiate: {
            "!type": "fn(type: fn(), locals?: ?) -> +!0",
            "!url": "http://docs.angularjs.org/api/AUTO.$injector#instantiate",
            "!doc": "Create a new instance of JS type."
          },
          invoke: {
            "!type": "fn(type: fn(), self?: ?, locals?: ?) -> !0.!ret",
            "!url": "http://docs.angularjs.org/api/AUTO.$injector#invoke",
            "!doc": "Invoke the method and supply the method arguments from the $injector."
          }
        },
        $provide: {
          "!url": "http://docs.angularjs.org/api/AUTO.$provide",
          "!doc": "Use $provide to register new providers with the $injector.",
          constant: {
            "!type": "fn(name: string, value: ?) -> !this",
            "!effects": ["custom angular_regField"],
            "!url": "http://docs.angularjs.org/api/AUTO.$provide#constant",
            "!doc": "A constant value."
          },
          decorator: {
            "!type": "fn(name: string, decorator: fn())",
            "!effects": ["custom angular_regFieldCall"],
            "!url": "http://docs.angularjs.org/api/AUTO.$provide#decorator",
            "!doc": "Decoration of service, allows the decorator to intercept the service instance creation."
          },
          factory: {
            "!type": "fn(name: string, providerFunction: fn()) -> !this",
            "!effects": ["custom angular_regFieldCall"],
            "!url": "http://docs.angularjs.org/api/AUTO.$provide#factory",
            "!doc": "A short hand for configuring services if only $get method is required."
          },
          provider: {
            "!type": "fn(name: string, providerType: fn()) -> !this",
            "!effects": ["custom angular_regFieldCall"],
            "!url": "http://docs.angularjs.org/api/AUTO.$provide#provider",
            "!doc": "Register a provider for a service."
          },
          service: {
            "!type": "fn(name: string, constructor: fn()) -> !this",
            "!effects": ["custom angular_regFieldNew"],
            "!url": "http://docs.angularjs.org/api/AUTO.$provide#provider",
            "!doc": "Register a provider for a service."
          },
          value: {
            "!type": "fn(name: string, object: ?) -> !this",
            "!effects": ["custom angular_regField"],
            "!url": "http://docs.angularjs.org/api/AUTO.$providevalue",
            "!doc": "A short hand for configuring services if the $get method is a constant."
          }
        },
        $cookies: {
          "!url": "http://docs.angularjs.org/api/ngCookies.$cookies",
          "!doc": "Provides read/write access to browser's cookies.",
          text: "string"
        },
        $resource: {
          "!type": "fn(url: string, paramDefaults?: ?, actions?: ?) -> +Resource",
          "!url": "http://docs.angularjs.org/api/ngResource.$resource",
          "!doc": "Creates a resource object that lets you interact with RESTful server-side data sources."
        },
        $route: {
          "!url": "http://docs.angularjs.org/api/ngRoute.$route",
          "!doc": "Deep-link URLs to controllers and views.",
          reload: {
            "!type": "fn()",
            "!url": "http://docs.angularjs.org/api/ngRoute.$route#reload",
            "!doc": "Reload the current route even if $location hasn't changed."
          },
          current: {
            "!url": "http://docs.angularjs.org/api/ngRoute.$route#current",
            "!doc": "Reference to the current route definition.",
            controller: "?",
            locals: "?"
          },
          routes: "[?]"
        },
        $sanitize: {
          "!type": "fn(string) -> string",
          "!url": "http://docs.angularjs.org/api/ngSanitize.$sanitize",
          "!doc": "Sanitize HTML input."
        },
        $swipe: {
          "!url": "http://docs.angularjs.org/api/ngTouch.$swipe",
          "!doc": "A service that abstracts the messier details of hold-and-drag swipe behavior.",
          bind: {
            "!type": "fn(element: +Element, handlers: ?)",
            "!url": "http://docs.angularjs.org/api/ngTouch.$swipe#bind",
            "!doc": "Abstracts the messier details of hold-and-drag swipe behavior."
          }
        }
      }
    },
    angular: {
      bind: {
        "!type": "fn(self: ?, fn: fn(), args?: ?) -> !custom:angular_bind",
        "!url": "http://docs.angularjs.org/api/angular.bind",
        "!doc": "Returns a function which calls function fn bound to self."
      },
      bootstrap: {
        "!type": "fn(element: +Element, modules?: [string]) -> service.$injector",
        "!url": "http://docs.angularjs.org/api/angular.bootstrap",
        "!doc": "Use this function to manually start up angular application."
      },
      copy: {
        "!type": "fn(source: ?, target?: ?) -> !0",
        "!url": "http://docs.angularjs.org/api/angular.copy",
        "!doc": "Creates a deep copy of source, which should be an object or an array."
      },
      element: {
        "!type": "fn(element: +Element) -> jQuery.fn",
        "!url": "http://docs.angularjs.org/api/angular.element",
        "!doc": "Wraps a raw DOM element or HTML string as a jQuery element."
      },
      equals: {
        "!type": "fn(o1: ?, o2: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.equals",
        "!doc": "Determines if two objects or two values are equivalent."
      },
      extend: {
        "!type": "fn(dst: ?, src: ?) -> !0",
        "!url": "http://docs.angularjs.org/api/angular.extend",
        "!doc": "Extends the destination object dst by copying all of the properties from the src object(s) to dst."
      },
      forEach: {
        "!type": "fn(obj: ?, iterator: fn(value: ?, key: ?), context?: ?) -> !0",
        "!effects": ["call !1 this=!2 !0.<i> number"],
        "!url": "http://docs.angularjs.org/api/angular.forEach",
        "!doc": "Invokes the iterator function once for each item in obj collection, which can be either an object or an array."
      },
      fromJson: {
        "!type": "fn(json: string) -> ?",
        "!url": "http://docs.angularjs.org/api/angular.fromJson",
        "!doc": "Deserializes a JSON string."
      },
      identity: {
        "!type": "fn(val: ?) -> !0",
        "!url": "http://docs.angularjs.org/api/angular.identity",
        "!doc": "A function that returns its first argument."
      },
      injector: {
        "!type": "fn(modules: [string]) -> service.$injector",
        "!url": "http://docs.angularjs.org/api/angular.injector",
        "!doc": "Creates an injector function"
      },
      isArray: {
        "!type": "fn(val: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.isArray",
        "!doc": "Determines if a reference is an Array."
      },
      isDate: {
        "!type": "fn(val: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.isDate",
        "!doc": "Determines if a reference is a date."
      },
      isDefined: {
        "!type": "fn(val: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.isDefined",
        "!doc": "Determines if a reference is defined."
      },
      isElement: {
        "!type": "fn(val: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.isElement",
        "!doc": "Determines if a reference is a DOM element."
      },
      isFunction: {
        "!type": "fn(val: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.isFunction",
        "!doc": "Determines if a reference is a function."
      },
      isNumber: {
        "!type": "fn(val: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.isNumber",
        "!doc": "Determines if a reference is a number."
      },
      isObject: {
        "!type": "fn(val: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.isObject",
        "!doc": "Determines if a reference is an object."
      },
      isString: {
        "!type": "fn(val: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.isString",
        "!doc": "Determines if a reference is a string."
      },
      isUndefined: {
        "!type": "fn(val: ?) -> bool",
        "!url": "http://docs.angularjs.org/api/angular.isUndefined",
        "!doc": "Determines if a reference is undefined."
      },
      lowercase: {
        "!type": "fn(val: string) -> string",
        "!url": "http://docs.angularjs.org/api/angular.lowercase",
        "!doc": "Converts the specified string to lowercase."
      },
      module: {
        "!type": "fn(name: string, deps: [string]) -> !custom:angular_module",
        "!url": "http://docs.angularjs.org/api/angular.module",
        "!doc": "A global place for creating, registering and retrieving Angular modules."
      },
      Module: "Module",
      noop: {
        "!type": "fn()",
        "!url": "http://docs.angularjs.org/api/angular.noop",
        "!doc": "A function that performs no operations."
      },
      toJson: {
        "!type": "fn(val: ?) -> string",
        "!url": "http://docs.angularjs.org/api/angular.toJson",
        "!doc": "Serializes input into a JSON-formatted string."
      },
      uppercase: {
        "!type": "fn(string) -> string",
        "!url": "http://docs.angularjs.org/api/angular.uppercase",
        "!doc": "Converts the specified string to uppercase."
      },
      version: {
        "!url": "http://docs.angularjs.org/api/angular.version",
        full: "string",
        major: "number",
        minor: "number",
        dot: "number",
        codename: "string"
      }
    }
  };
});;
/*! RESOURCE: /scripts/tinymce4/sn_plugins/codemirror/CodeMirror/addon/tern/tern.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  CodeMirror.TernServer = function(options) {
    var self = this;
    this.options = options || {};
    var plugins = this.options.plugins || (this.options.plugins = {});
    if (!plugins.doc_comment) plugins.doc_comment = true;
    if (this.options.useWorker) {
      this.server = new WorkerServer(this);
    } else {
      this.server = new tern.Server({
        getFile: function(name, c) {
          return getFile(self, name, c);
        },
        async: true,
        defs: this.options.defs || [],
        plugins: plugins
      });
    }
    this.docs = Object.create(null);
    this.trackChange = function(doc, change) {
      trackChange(self, doc, change);
    };
    this.cachedArgHints = null;
    this.activeArgHints = null;
    this.jumpStack = [];
    this.getHint = function(cm, c) {
      return hint(self, cm, c);
    };
    this.getHint.async = true;
  };
  CodeMirror.TernServer.prototype = {
    addDoc: function(name, doc) {
      var data = {
        doc: doc,
        name: name,
        changed: null
      };
      this.server.addFile(name, docValue(this, data));
      CodeMirror.on(doc, "change", this.trackChange);
      return this.docs[name] = data;
    },
    delDoc: function(id) {
      var found = resolveDoc(this, id);
      if (!found) return;
      CodeMirror.off(found.doc, "change", this.trackChange);
      delete this.docs[found.name];
      this.server.delFile(found.name);
    },
    hideDoc: function(id) {
      closeArgHints(this);
      var found = resolveDoc(this, id);
      if (found && found.changed) sendDoc(this, found);
    },
    complete: function(cm) {
      cm.showHint({
        hint: this.getHint
      });
    },
    showType: function(cm, pos, c) {
      showContextInfo(this, cm, pos, "type", c);
    },
    showDocs: function(cm, pos, c) {
      showContextInfo(this, cm, pos, "documentation", c);
    },
    updateArgHints: function(cm) {
      updateArgHints(this, cm);
    },
    jumpToDef: function(cm) {
      jumpToDef(this, cm);
    },
    jumpBack: function(cm) {
      jumpBack(this, cm);
    },
    rename: function(cm) {
      rename(this, cm);
    },
    selectName: function(cm) {
      selectName(this, cm);
    },
    request: function(cm, query, c, pos) {
      var self = this;
      var doc = findDoc(this, cm.getDoc());
      var request = buildRequest(this, doc, query, pos);
      this.server.request(request, function(error, data) {
        if (!error && self.options.responseFilter)
          data = self.options.responseFilter(doc, query, request, error, data);
        c(error, data);
      });
    }
  };
  var Pos = CodeMirror.Pos;
  var cls = "CodeMirror-Tern-";
  var bigDoc = 250;

  function getFile(ts, name, c) {
    var buf = ts.docs[name];
    if (buf)
      c(docValue(ts, buf));
    else if (ts.options.getFile)
      ts.options.getFile(name, c);
    else
      c(null);
  }

  function findDoc(ts, doc, name) {
    for (var n in ts.docs) {
      var cur = ts.docs[n];
      if (cur.doc == doc) return cur;
    }
    if (!name)
      for (var i = 0;; ++i) {
        n = "[doc" + (i || "") + "]";
        if (!ts.docs[n]) {
          name = n;
          break;
        }
      }
    return ts.addDoc(name, doc);
  }

  function resolveDoc(ts, id) {
    if (typeof id == "string") return ts.docs[id];
    if (id instanceof CodeMirror) id = id.getDoc();
    if (id instanceof CodeMirror.Doc) return findDoc(ts, id);
  }

  function trackChange(ts, doc, change) {
    var data = findDoc(ts, doc);
    var argHints = ts.cachedArgHints;
    if (argHints && argHints.doc == doc && cmpPos(argHints.start, change.to) <= 0)
      ts.cachedArgHints = null;
    var changed = data.changed;
    if (changed == null)
      data.changed = changed = {
        from: change.from.line,
        to: change.from.line
      };
    var end = change.from.line + (change.text.length - 1);
    if (change.from.line < changed.to) changed.to = changed.to - (change.to.line - end);
    if (end >= changed.to) changed.to = end + 1;
    if (changed.from > change.from.line) changed.from = change.from.line;
    if (doc.lineCount() > bigDoc && change.to - changed.from > 100) setTimeout(function() {
      if (data.changed && data.changed.to - data.changed.from > 100) sendDoc(ts, data);
    }, 200);
  }

  function sendDoc(ts, doc) {
    ts.server.request({
      files: [{
        type: "full",
        name: doc.name,
        text: docValue(ts, doc)
      }]
    }, function(error) {
      if (error) window.console.error(error);
      else doc.changed = null;
    });
  }

  function hint(ts, cm, c) {
    ts.request(cm, {
      type: "completions",
      types: true,
      docs: true,
      urls: true
    }, function(error, data) {
      if (error) return showError(ts, cm, error);
      var completions = [],
        after = "";
      var from = data.start,
        to = data.end;
      if (cm.getRange(Pos(from.line, from.ch - 2), from) == "[\"" &&
        cm.getRange(to, Pos(to.line, to.ch + 2)) != "\"]")
        after = "\"]";
      for (var i = 0; i < data.completions.length; ++i) {
        var completion = data.completions[i],
          className = typeToIcon(completion.type);
        if (data.guess) className += " " + cls + "guess";
        completions.push({
          text: completion.name + after,
          displayText: completion.name,
          className: className,
          data: completion
        });
      }
      var obj = {
        from: from,
        to: to,
        list: completions
      };
      var tooltip = null;
      CodeMirror.on(obj, "close", function() {
        remove(tooltip);
      });
      CodeMirror.on(obj, "update", function() {
        remove(tooltip);
      });
      CodeMirror.on(obj, "select", function(cur, node) {
        remove(tooltip);
        var content = ts.options.completionTip ? ts.options.completionTip(cur.data) : cur.data.doc;
        if (content) {
          tooltip = makeTooltip(node.parentNode.getBoundingClientRect().right + window.pageXOffset,
            node.getBoundingClientRect().top + window.pageYOffset, content);
          tooltip.className += " " + cls + "hint-doc";
        }
      });
      c(obj);
    });
  }

  function typeToIcon(type) {
    var suffix;
    if (type == "?") suffix = "unknown";
    else if (type == "number" || type == "string" || type == "bool") suffix = type;
    else if (/^fn\(/.test(type)) suffix = "fn";
    else if (/^\[/.test(type)) suffix = "array";
    else suffix = "object";
    return cls + "completion " + cls + "completion-" + suffix;
  }

  function showContextInfo(ts, cm, pos, queryName, c) {
    ts.request(cm, queryName, function(error, data) {
      if (error) return showError(ts, cm, error);
      if (ts.options.typeTip) {
        var tip = ts.options.typeTip(data);
      } else {
        var tip = elt("span", null, elt("strong", null, data.type || "not found"));
        if (data.doc)
          tip.appendChild(document.createTextNode(" — " + data.doc));
        if (data.url) {
          tip.appendChild(document.createTextNode(" "));
          tip.appendChild(elt("a", null, "[docs]")).href = data.url;
        }
      }
      tempTooltip(cm, tip);
      if (c) c();
    }, pos);
  }

  function updateArgHints(ts, cm) {
    closeArgHints(ts);
    if (cm.somethingSelected()) return;
    var state = cm.getTokenAt(cm.getCursor()).state;
    var inner = CodeMirror.innerMode(cm.getMode(), state);
    if (inner.mode.name != "javascript") return;
    var lex = inner.state.lexical;
    if (lex.info != "call") return;
    var ch, argPos = lex.pos || 0,
      tabSize = cm.getOption("tabSize");
    for (var line = cm.getCursor().line, e = Math.max(0, line - 9), found = false; line >= e; --line) {
      var str = cm.getLine(line),
        extra = 0;
      for (var pos = 0;;) {
        var tab = str.indexOf("\t", pos);
        if (tab == -1) break;
        extra += tabSize - (tab + extra) % tabSize - 1;
        pos = tab + 1;
      }
      ch = lex.column - extra;
      if (str.charAt(ch) == "(") {
        found = true;
        break;
      }
    }
    if (!found) return;
    var start = Pos(line, ch);
    var cache = ts.cachedArgHints;
    if (cache && cache.doc == cm.getDoc() && cmpPos(start, cache.start) == 0)
      return showArgHints(ts, cm, argPos);
    ts.request(cm, {
      type: "type",
      preferFunction: true,
      end: start
    }, function(error, data) {
      if (error || !data.type || !(/^fn\(/).test(data.type)) return;
      ts.cachedArgHints = {
        start: pos,
        type: parseFnType(data.type),
        name: data.exprName || data.name || "fn",
        guess: data.guess,
        doc: cm.getDoc()
      };
      showArgHints(ts, cm, argPos);
    });
  }

  function showArgHints(ts, cm, pos) {
    closeArgHints(ts);
    var cache = ts.cachedArgHints,
      tp = cache.type;
    var tip = elt("span", cache.guess ? cls + "fhint-guess" : null,
      elt("span", cls + "fname", cache.name), "(");
    for (var i = 0; i < tp.args.length; ++i) {
      if (i) tip.appendChild(document.createTextNode(", "));
      var arg = tp.args[i];
      tip.appendChild(elt("span", cls + "farg" + (i == pos ? " " + cls + "farg-current" : ""), arg.name || "?"));
      if (arg.type != "?") {
        tip.appendChild(document.createTextNode(":\u00a0"));
        tip.appendChild(elt("span", cls + "type", arg.type));
      }
    }
    tip.appendChild(document.createTextNode(tp.rettype ? ") ->\u00a0" : ")"));
    if (tp.rettype) tip.appendChild(elt("span", cls + "type", tp.rettype));
    var place = cm.cursorCoords(null, "page");
    ts.activeArgHints = makeTooltip(place.right + 1, place.bottom, tip);
  }

  function parseFnType(text) {
    var args = [],
      pos = 3;

    function skipMatching(upto) {
      var depth = 0,
        start = pos;
      for (;;) {
        var next = text.charAt(pos);
        if (upto.test(next) && !depth) return text.slice(start, pos);
        if (/[{\[\(]/.test(next)) ++depth;
        else if (/[}\]\)]/.test(next)) --depth;
        ++pos;
      }
    }
    if (text.charAt(pos) != ")")
      for (;;) {
        var name = text.slice(pos).match(/^([^, \(\[\{]+): /);
        if (name) {
          pos += name[0].length;
          name = name[1];
        }
        args.push({
          name: name,
          type: skipMatching(/[\),]/)
        });
        if (text.charAt(pos) == ")") break;
        pos += 2;
      }
    var rettype = text.slice(pos).match(/^\) -> (.*)$/);
    return {
      args: args,
      rettype: rettype && rettype[1]
    };
  }

  function jumpToDef(ts, cm) {
    function inner(varName) {
      var req = {
        type: "definition",
        variable: varName || null
      };
      var doc = findDoc(ts, cm.getDoc());
      ts.server.request(buildRequest(ts, doc, req), function(error, data) {
        if (error) return showError(ts, cm, error);
        if (!data.file && data.url) {
          window.open(data.url);
          return;
        }
        if (data.file) {
          var localDoc = ts.docs[data.file],
            found;
          if (localDoc && (found = findContext(localDoc.doc, data))) {
            ts.jumpStack.push({
              file: doc.name,
              start: cm.getCursor("from"),
              end: cm.getCursor("to")
            });
            moveTo(ts, doc, localDoc, found.start, found.end);
            return;
          }
        }
        showError(ts, cm, "Could not find a definition.");
      });
    }
    if (!atInterestingExpression(cm))
      dialog(cm, "Jump to variable", function(name) {
        if (name) inner(name);
      });
    else
      inner();
  }

  function jumpBack(ts, cm) {
    var pos = ts.jumpStack.pop(),
      doc = pos && ts.docs[pos.file];
    if (!doc) return;
    moveTo(ts, findDoc(ts, cm.getDoc()), doc, pos.start, pos.end);
  }

  function moveTo(ts, curDoc, doc, start, end) {
    doc.doc.setSelection(start, end);
    if (curDoc != doc && ts.options.switchToDoc) {
      closeArgHints(ts);
      ts.options.switchToDoc(doc.name, doc.doc);
    }
  }

  function findContext(doc, data) {
    var before = data.context.slice(0, data.contextOffset).split("\n");
    var startLine = data.start.line - (before.length - 1);
    var start = Pos(startLine, (before.length == 1 ? data.start.ch : doc.getLine(startLine).length) - before[0].length);
    var text = doc.getLine(startLine).slice(start.ch);
    for (var cur = startLine + 1; cur < doc.lineCount() && text.length < data.context.length; ++cur)
      text += "\n" + doc.getLine(cur);
    if (text.slice(0, data.context.length) == data.context) return data;
    var cursor = doc.getSearchCursor(data.context, 0, false);
    var nearest, nearestDist = Infinity;
    while (cursor.findNext()) {
      var from = cursor.from(),
        dist = Math.abs(from.line - start.line) * 10000;
      if (!dist) dist = Math.abs(from.ch - start.ch);
      if (dist < nearestDist) {
        nearest = from;
        nearestDist = dist;
      }
    }
    if (!nearest) return null;
    if (before.length == 1)
      nearest.ch += before[0].length;
    else
      nearest = Pos(nearest.line + (before.length - 1), before[before.length - 1].length);
    if (data.start.line == data.end.line)
      var end = Pos(nearest.line, nearest.ch + (data.end.ch - data.start.ch));
    else
      var end = Pos(nearest.line + (data.end.line - data.start.line), data.end.ch);
    return {
      start: nearest,
      end: end
    };
  }

  function atInterestingExpression(cm) {
    var pos = cm.getCursor("end"),
      tok = cm.getTokenAt(pos);
    if (tok.start < pos.ch && (tok.type == "comment" || tok.type == "string")) return false;
    return /\w/.test(cm.getLine(pos.line).slice(Math.max(pos.ch - 1, 0), pos.ch + 1));
  }

  function rename(ts, cm) {
    var token = cm.getTokenAt(cm.getCursor());
    if (!/\w/.test(token.string)) return showError(ts, cm, "Not at a variable");
    dialog(cm, "New name for " + token.string, function(newName) {
      ts.request(cm, {
        type: "rename",
        newName: newName,
        fullDocs: true
      }, function(error, data) {
        if (error) return showError(ts, cm, error);
        applyChanges(ts, data.changes);
      });
    });
  }

  function selectName(ts, cm) {
    var name = findDoc(ts, cm.doc).name;
    ts.request(cm, {
      type: "refs"
    }, function(error, data) {
      if (error) return showError(ts, cm, error);
      var ranges = [],
        cur = 0;
      for (var i = 0; i < data.refs.length; i++) {
        var ref = data.refs[i];
        if (ref.file == name) {
          ranges.push({
            anchor: ref.start,
            head: ref.end
          });
          if (cmpPos(cur, ref.start) >= 0 && cmpPos(cur, ref.end) <= 0)
            cur = ranges.length - 1;
        }
      }
      cm.setSelections(ranges, cur);
    });
  }
  var nextChangeOrig = 0;

  function applyChanges(ts, changes) {
    var perFile = Object.create(null);
    for (var i = 0; i < changes.length; ++i) {
      var ch = changes[i];
      (perFile[ch.file] || (perFile[ch.file] = [])).push(ch);
    }
    for (var file in perFile) {
      var known = ts.docs[file],
        chs = perFile[file];;
      if (!known) continue;
      chs.sort(function(a, b) {
        return cmpPos(b.start, a.start);
      });
      var origin = "*rename" + (++nextChangeOrig);
      for (var i = 0; i < chs.length; ++i) {
        var ch = chs[i];
        known.doc.replaceRange(ch.text, ch.start, ch.end, origin);
      }
    }
  }

  function buildRequest(ts, doc, query, pos) {
    var files = [],
      offsetLines = 0,
      allowFragments = !query.fullDocs;
    if (!allowFragments) delete query.fullDocs;
    if (typeof query == "string") query = {
      type: query
    };
    query.lineCharPositions = true;
    if (query.end == null) {
      query.end = pos || doc.doc.getCursor("end");
      if (doc.doc.somethingSelected())
        query.start = doc.doc.getCursor("start");
    }
    var startPos = query.start || query.end;
    if (doc.changed) {
      if (doc.doc.lineCount() > bigDoc && allowFragments !== false &&
        doc.changed.to - doc.changed.from < 100 &&
        doc.changed.from <= startPos.line && doc.changed.to > query.end.line) {
        files.push(getFragmentAround(doc, startPos, query.end));
        query.file = "#0";
        var offsetLines = files[0].offsetLines;
        if (query.start != null) query.start = Pos(query.start.line - -offsetLines, query.start.ch);
        query.end = Pos(query.end.line - offsetLines, query.end.ch);
      } else {
        files.push({
          type: "full",
          name: doc.name,
          text: docValue(ts, doc)
        });
        query.file = doc.name;
        doc.changed = null;
      }
    } else {
      query.file = doc.name;
    }
    for (var name in ts.docs) {
      var cur = ts.docs[name];
      if (cur.changed && cur != doc) {
        files.push({
          type: "full",
          name: cur.name,
          text: docValue(ts, cur)
        });
        cur.changed = null;
      }
    }
    return {
      query: query,
      files: files
    };
  }

  function getFragmentAround(data, start, end) {
    var doc = data.doc;
    var minIndent = null,
      minLine = null,
      endLine, tabSize = 4;
    for (var p = start.line - 1, min = Math.max(0, p - 50); p >= min; --p) {
      var line = doc.getLine(p),
        fn = line.search(/\bfunction\b/);
      if (fn < 0) continue;
      var indent = CodeMirror.countColumn(line, null, tabSize);
      if (minIndent != null && minIndent <= indent) continue;
      minIndent = indent;
      minLine = p;
    }
    if (minLine == null) minLine = min;
    var max = Math.min(doc.lastLine(), end.line + 20);
    if (minIndent == null || minIndent == CodeMirror.countColumn(doc.getLine(start.line), null, tabSize))
      endLine = max;
    else
      for (endLine = end.line + 1; endLine < max; ++endLine) {
        var indent = CodeMirror.countColumn(doc.getLine(endLine), null, tabSize);
        if (indent <= minIndent) break;
      }
    var from = Pos(minLine, 0);
    return {
      type: "part",
      name: data.name,
      offsetLines: from.line,
      text: doc.getRange(from, Pos(endLine, 0))
    };
  }
  var cmpPos = CodeMirror.cmpPos;

  function elt(tagname, cls) {
    var e = document.createElement(tagname);
    if (cls) e.className = cls;
    for (var i = 2; i < arguments.length; ++i) {
      var elt = arguments[i];
      if (typeof elt == "string") elt = document.createTextNode(elt);
      e.appendChild(elt);
    }
    return e;
  }

  function dialog(cm, text, f) {
    if (cm.openDialog)
      cm.openDialog(text + ": <input type=text>", f);
    else
      f(prompt(text, ""));
  }

  function tempTooltip(cm, content) {
    var where = cm.cursorCoords();
    var tip = makeTooltip(where.right + 1, where.bottom, content);

    function clear() {
      if (!tip.parentNode) return;
      cm.off("cursorActivity", clear);
      fadeOut(tip);
    }
    setTimeout(clear, 1700);
    cm.on("cursorActivity", clear);
  }

  function makeTooltip(x, y, content) {
    var node = elt("div", cls + "tooltip", content);
    node.style.left = x + "px";
    node.style.top = y + "px";
    document.body.appendChild(node);
    return node;
  }

  function remove(node) {
    var p = node && node.parentNode;
    if (p) p.removeChild(node);
  }

  function fadeOut(tooltip) {
    tooltip.style.opacity = "0";
    setTimeout(function() {
      remove(tooltip);
    }, 1100);
  }

  function showError(ts, cm, msg) {
    if (ts.options.showError)
      ts.options.showError(cm, msg);
    else
      tempTooltip(cm, String(msg));
  }

  function closeArgHints(ts) {
    if (ts.activeArgHints) {
      remove(ts.activeArgHints);
      ts.activeArgHints = null;
    }
  }

  function docValue(ts, doc) {
    var val = doc.doc.getValue();
    if (ts.options.fileFilter) val = ts.options.fileFilter(val, doc.name, doc.doc);
    return val;
  }

  function WorkerServer(ts) {
    var worker = new Worker(ts.options.workerScript);
    worker.postMessage({
      type: "init",
      defs: ts.options.defs,
      plugins: ts.options.plugins,
      scripts: ts.options.workerDeps
    });
    var msgId = 0,
      pending = {};

    function send(data, c) {
      if (c) {
        data.id = ++msgId;
        pending[msgId] = c;
      }
      worker.postMessage(data);
    }
    worker.onmessage = function(e) {
      var data = e.data;
      if (data.type == "getFile") {
        getFile(ts, data.name, function(err, text) {
          send({
            type: "getFile",
            err: String(err),
            text: text,
            id: data.id
          });
        });
      } else if (data.type == "debug") {
        window.console.log(data.message);
      } else if (data.id && pending[data.id]) {
        pending[data.id](data.err, data.body);
        delete pending[data.id];
      }
    };
    worker.onerror = function(e) {
      for (var id in pending) pending[id](e);
      pending = {};
    };
    this.addFile = function(name, text) {
      send({
        type: "add",
        name: name,
        text: text
      });
    };
    this.delFile = function(name) {
      send({
        type: "del",
        name: name
      });
    };
    this.request = function(body, c) {
      send({
        type: "req",
        body: body
      }, c);
    };
  }
});;
/*! RESOURCE: /scripts/tinymce4/sn_plugins/codemirror/CodeMirror/addon/hint/show-hint.js */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";
    var HINT_ELEMENT_CLASS = "CodeMirror-hint";
    var ACTIVE_HINT_ELEMENT_CLASS = "CodeMirror-hint-active";
    CodeMirror.showHint = function(cm, getHints, options) {
        if (!getHints) return cm.showHint(options);
        if (options && options.async) getHints.async = true;