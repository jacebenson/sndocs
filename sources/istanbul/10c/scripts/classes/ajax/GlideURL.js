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