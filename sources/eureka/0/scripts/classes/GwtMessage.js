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
    var valList = new Array();
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
      if (this._getCache().get(key))
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
    var pf = this._getCache().get(this._PREFETCH_ENTRY_KEY);
    var now = new Date().getTime();
    if (typeof pf == 'undefined' || (pf + 60000) < now) {
      this._getCache().put(this._PREFETCH_ENTRY_KEY, now);
      return true;
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
    this._getCache().put(key, msg);
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
    for (var i = 0; i < resolveList.length; i++) {
      var key = resolveList[i];
      var value = cache.get(key);
      if (value)
        answer.push(key);
    }
    return answer;
  },
  _buildListFromCache: function(resolveList) {
    var answer = {};
    var cache = this._getCache();
    for (var i = 0; i < resolveList.length; i++) {
      var key = resolveList[i];
      var value = cache.get(key);
      answer[key] = value;
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
    g_cache_message = new GlideClientCache(500);
    return g_cache_message;
  },
  z: null
});
GwtMessage._messages = {};

function getMessage(msg) {
  if (typeof msg == "object")
    return new GwtMessage().getMessages(msg);
  return new GwtMessage().getMessage(msg);
}

function getMessages(msgs) {
  return new GwtMessage().getMessages(msgs);
}