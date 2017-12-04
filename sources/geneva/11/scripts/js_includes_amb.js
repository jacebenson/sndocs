/*! RESOURCE: /scripts/js_includes_amb.js */
/*! RESOURCE: /scripts/thirdparty/jaredJSON2.js */
jaredJSON = {};
(function() {
  "use strict";

  function f(e) {
    return e < 10 ? "0" + e : e
  }

  function quote(e) {
    escapable.lastIndex = 0;
    return escapable.test(e) ? '"' +
      e.replace(escapable, function(e) {
        var t = meta[e];
        return typeof t === "string" ? t : "\\u" +
          ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
      }) + '"' : '"' + e + '"'
  }

  function str(e, t) {
    var n, r, i, s, o = gap,
      u, a = t[e];
    if (a && typeof a === "object" && typeof a.toJSON === "function") {
      a = a.toJSON(e)
    }
    if (typeof rep === "function") {
      a = rep.call(t, e, a)
    }
    switch (typeof a) {
      case "string":
        return quote(a);
      case "number":
        return isFinite(a) ? String(a) : "null";
      case "boolean":
      case "null":
        return String(a);
      case "object":
        if (!a) {
          return "null"
        }
        gap += indent;
        u = [];
        if (Object.prototype.toString.apply(a) === "[object Array]") {
          s = a.length;
          for (n = 0; n < s; n += 1) {
            u[n] = str(n, a) || "null"
          }
          i = u.length === 0 ? "[]" : gap ? "[\n" + gap +
            u.join(",\n" + gap) + "\n" + o + "]" : "[" +
            u.join(",") + "]";
          gap = o;
          return i
        }
        if (rep && typeof rep === "object") {
          s = rep.length;
          for (n = 0; n < s; n += 1) {
            if (typeof rep[n] === "string") {
              r = rep[n];
              i = str(r, a);
              if (i) {
                u.push(quote(r) + (gap ? ": " : ":") + i)
              }
            }
          }
        } else {
          for (r in a) {
            if (Object.prototype.hasOwnProperty.call(a, r)) {
              i = str(r, a);
              if (i) {
                u.push(quote(r) + (gap ? ": " : ":") + i)
              }
            }
          }
        }
        i = u.length === 0 ? "{}" : gap ? "{\n" + gap + u.join(",\n" + gap) +
          "\n" + o + "}" : "{" + u.join(",") + "}";
        gap = o;
        return i
    }
  }
  if (typeof Date.prototype.toJSON !== "function") {
    Date.prototype.toJSON = function() {
      return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" +
        f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) +
        "T" + f(this.getUTCHours()) + ":" +
        f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) +
        "Z" : null
    };
    String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function() {
      return this.valueOf()
    }
  }
  var cx, escapable, gap, indent, meta, rep;
  escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  meta = {
    "\b": "\\b",
    "	": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",
    '"': '\\"',
    "\\": "\\\\"
  };
  jaredJSON.stringify = function(e, t, n) {
    var r;
    gap = "";
    indent = "";
    if (typeof n === "number") {
      for (r = 0; r < n; r += 1) {
        indent += " "
      }
    } else if (typeof n === "string") {
      indent = n
    }
    rep = t;
    if (t && typeof t !== "function" &&
      (typeof t !== "object" || typeof t.length !== "number")) {
      throw new Error("jaredJSON.stringify")
    }
    return str("", {
      "": e
    })
  }
  cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  jaredJSON.parse = function(text, reviver) {
    function walk(e, t) {
      var n, r, i = e[t];
      if (i && typeof i === "object") {
        for (n in i) {
          if (Object.prototype.hasOwnProperty.call(i, n)) {
            r = walk(i, n);
            if (r !== undefined) {
              i[n] = r
            } else {
              delete i[n]
            }
          }
        }
      }
      return reviver.call(e, t, i)
    }
    var j;
    text = String(text);
    cx.lastIndex = 0;
    if (cx.test(text)) {
      text = text.replace(cx, function(e) {
        return "\\u" +
          ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
      })
    }
    if (/^[\],:{}\s]*$/
      .test(text
        .replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
        .replace(
          /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
          "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
      j = eval("(" + text + ")");
      return typeof reviver === "function" ? walk({
        "": j
      }, "") : j
    }
    throw new SyntaxError("jaredJSON.parse")
  }
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
        _disconnect(true);
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
      _disconnect(true);
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
    bind(window.jQuery || window.Zepto, org.cometd);
  }
})();;
/*! RESOURCE: /scripts/amb.Logger.js */
(function($) {
  amb['Logger'] = Class.create();
  amb.Logger.prototype = {
    initialize: function(callerType) {
      this._callerType = callerType;
      this._debugEnabled = amb['properties']['logLevel'] == 'debug';
    },
    print: function(message) {
      console.log(this._callerType + ' ' + message);
    },
    debug: function(message) {
      if (this._debugEnabled)
        this.print('[DEBUG] ' + message);
    },
    addInfoMessage: function(message) {
      this.print('[INFO] ' + message);
    },
    addErrorMessage: function(message) {
      this.print('[ERROR] ' + message);
    },
    type: 'amb.Logger'
  }
})(jQuery);;
/*! RESOURCE: /scripts/amb.EventManager.js */
(function($) {
  amb['EventManager'] = Class.create();
  amb.EventManager.prototype = {
    initialize: function(events) {
      this._events = events;
      this._subscriptions = [];
      this._idCounter = 0;
    },
    subscribe: function(event, callback) {
      var id = this._idCounter++;
      this._subscriptions.push({
        event: event,
        callback: callback,
        id: id
      });
      return id;
    },
    unsubscribe: function(id) {
      for (var i = 0; i < this._subscriptions.length; i++)
        if (id == this._subscriptions[i].id)
          this._subscriptions.splice(i, 1);
    },
    publish: function(event, args) {
      var subscriptions = this._getSubscriptions(event);
      for (var i = 0; i < subscriptions.length; i++)
        subscriptions[i].callback.apply(null, args);
    },
    _getSubscriptions: function(event) {
      var subscriptions = [];
      for (var i = 0; i < this._subscriptions.length; i++) {
        if (this._subscriptions[i].event == event)
          subscriptions.push(this._subscriptions[i]);
      }
      return subscriptions;
    },
    getEvents: function() {
      return this._events;
    },
    type: 'amb.EventManager'
  }
})(jQuery);;
/*! RESOURCE: /scripts/amb.ServerConnection.js */
(function($) {
  amb['ServerConnection'] = Class.create();
  amb.ServerConnection.prototype = {
    initialize: function(cometd) {
      this._cometd = cometd;
      this._connected = false;
      this._disconnecting = false;
      this._eventManager = new amb.EventManager({
        CONNECTION_INITIALIZED: 'connection.initialized',
        CONNECTION_OPENED: 'connection.opened',
        CONNECTION_CLOSED: 'connection.closed',
        CONNECTION_BROKEN: 'connection.broken',
        SESSION_LOGGED_IN: 'session.logged.in',
        SESSION_LOGGED_OUT: 'session.logged.out'
      });
      this._state = "closed";
      this._LOGGER = new amb.Logger(this.type);
      this._initializeMetaChannelListeners();
      this._loggedIn = true;
      this._loginWindow = null;
      this._loginWindowEnabled = amb['properties']['loginWindow'] == 'true';
      this._lastError = null;
      this._errorMessages = {
        UNKNOWN_CLIENT: '402::Unknown client'
      };
      this._loginWindowOverride = false;
    },
    _initializeMetaChannelListeners: function() {
      this._cometd.addListener('/meta/handshake', this, this._metaHandshake);
      this._cometd.addListener('/meta/connect', this, this._metaConnect);
    },
    _metaHandshake: function(message) {
      if (message.successful)
        this._connectionInitialized();
    },
    _metaConnect: function(message) {
      if (this._disconnecting) {
        this._connected = false;
        this._connectionClosed();
        return;
      }
      var error = message['error'];
      if (error)
        this._lastError = error;
      this._sessionStatus(message);
      var wasConnected = this._connected;
      this._connected = (message.successful === true);
      if (!wasConnected && this._connected)
        this._connectionOpened();
      else if (wasConnected && !this._connected)
        this._connectionBroken();
    },
    _connectionInitialized: function() {
      this._LOGGER.debug('Connection initialized');
      this._state = "initialized";
      this._eventManager.publish(this.getEvents().CONNECTION_INITIALIZED);
    },
    _connectionOpened: function() {
      this._LOGGER.debug('Connection opened');
      this._state = "opened";
      this._eventManager.publish(this.getEvents().CONNECTION_OPENED);
    },
    _connectionClosed: function() {
      this._LOGGER.debug('Connection closed');
      this._state = "closed";
      this._eventManager.publish(this.getEvents().CONNECTION_CLOSED);
    },
    _connectionBroken: function() {
      this._LOGGER.addErrorMessage('Connection broken');
      this._state = "broken";
      this._eventManager.publish(this.getEvents().CONNECTION_BROKEN);
    },
    getEvents: function() {
      return this._eventManager.getEvents();
    },
    subscribeToEvent: function(event, callback) {
      if (this.getEvents().CONNECTION_OPENED === event && this._connected) {
        callback();
        return;
      }
      return this._eventManager.subscribe(event, callback);
    },
    unsubscribeFromEvent: function(id) {
      this._eventManager.unsubscribe(id);
    },
    getConnectionState: function() {
      return this._state;
    },
    _getLastError: function() {
      return this._lastError;
    },
    _setLastError: function(error) {
      this._lastError = error;
    },
    _getErrorMessages: function() {
      return this._errorMessages;
    },
    _sessionStatus: function(message) {
      var ext = message['ext'];
      if (ext) {
        var sessionStatus = ext['glide.session.status'];
        this._loginWindowOverride = ext['glide.amb.login.window.override'] === true;
        this._LOGGER.debug('session.status - ' + sessionStatus);
        switch (sessionStatus) {
          case 'session.logged.out':
            if (this._loggedIn)
              this._logout();
            break;
          case 'session.logged.in':
            if (!this._loggedIn)
              this._login();
            break;
          default:
            this._LOGGER.debug("unknown session status - " + sessionStatus);
            break;
        }
      }
    },
    _login: function() {
      this._loggedIn = true;
      this._LOGGER.debug("LOGGED_IN event fire!");
      this._eventManager.publish(this.getEvents().SESSION_LOGGED_IN);
      this.loginHide();
    },
    _logout: function() {
      this._loggedIn = false;
      this._LOGGER.debug("LOGGED_OUT event fire!");
      this._eventManager.publish(this.getEvents().SESSION_LOGGED_OUT);
      this.loginShow();
    },
    isLoggedIn: function() {
      return this._loggedIn;
    },
    loginShow: function() {
      if (!this._loginWindowEnabled)
        return;
      if (this._loginWindowOverride)
        return;
      var dialog = new GlideModal('amb_disconnect_modal');
      if (dialog['renderWithContent']) {
        dialog.template = this._modalTemplate;
        dialog.renderWithContent(this._modalContent);
      } else {
        dialog.setBody(this._modalContent);
        dialog.render();
      }
      this._loginWindow = dialog;
    },
    loginHide: function() {
      if (!this._loginWindow)
        return;
      this._loginWindow.destroy();
      this._loginWindow = null;
    },
    loginComplete: function() {
      this._login();
    },
    connect: function() {
      if (this._connected) {
        console.log(">>> connection exists, request satisfied");
        return;
      }
      this._LOGGER.debug('Connecting to glide amb server -> ' + amb['properties']['servletURI']);
      this._cometd.configure({
        url: this._getRelativePath(amb['properties']['servletURI']),
        logLevel: amb['properties']['logLevel']
      });
      this._cometd.handshake();
    },
    abort: function() {
      this._cometd.getTransport().abort();
    },
    disconnect: function() {
      this._LOGGER.debug('Disconnecting from glide amb server..');
      this._disconnecting = true;
      this._cometd.disconnect();
    },
    _getRelativePath: function(uri) {
      var relativePath = "";
      for (var i = 0; i < window.location.pathname.match(/\//g).length - 1; i++) {
        relativePath = "../" + relativePath;
      }
      return relativePath + uri;
    },
    type: 'amb.ServerConnection',
    _modalContent: '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>',
    _modalTemplate: '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
      '  <div class="modal-dialog small-modal" style="width:450px">' +
      '     <div class="modal-content">' +
      '        <header class="modal-header">' +
      '           <h4 id="small_modal1_title" class="modal-title">Login</h4>' +
      '        </header>' +
      '        <div class="modal-body">' +
      '        </div>' +
      '     </div>' +
      '  </div>' +
      '</div>'
  }
})(jQuery);;
/*! RESOURCE: /scripts/amb.ChannelRedirect.js */
(function($) {
  amb['ChannelRedirect'] = Class.create();
  amb.ChannelRedirect.prototype = {
    initialize: function(ambClient, serverConnection,
      channelProvider) {
      this._eventManager = new amb.EventManager({
        CHANNEL_REDIRECT: 'channel.redirect'
      });
      this._LOGGER = new amb.Logger(this.type);
      this._client = ambClient;
      this._serverConnection = serverConnection;
      this._channelProvider = channelProvider;
      this._initializeChannelWhenReady();
    },
    _initializeChannelWhenReady: function() {
      var metaChannel = this._channelProvider('/sn/meta/channel_redirect/' + this._client.getClientId());
      metaChannel.newListener(this._serverConnection, null).subscribe(this._onAdvice.bind(this));
    },
    _onAdvice: function(advice) {
      this._LOGGER.debug('_onAdvice:' + advice.data.clientId);
      var fromChannel = this._channelProvider(advice.data.fromChannel);
      var toChannel = this._channelProvider(advice.data.toChannel);
      this._eventManager.publish(this.getEvents().CHANNEL_REDIRECT, [fromChannel, toChannel]);
      this._LOGGER.debug(
        'published channel switch event, fromChannel:' + fromChannel.getName() +
        ', toChannel:' + toChannel.getName());
    },
    subscribeToEvent: function(event, callback) {
      return this._eventManager.subscribe(event, callback);
    },
    unsubscribeToEvent: function(id) {
      this._eventManager.unsubscribe(id);
    },
    getEvents: function() {
      return this._eventManager.getEvents();
    },
    type: 'amb.ChannelRedirect'
  }
})(jQuery);;
/*! RESOURCE: /scripts/amb.ChannelListener.js */
(function($) {
  amb['ChannelListener'] = Class.create();
  amb.ChannelListener.prototype = {
    initialize: function(channel, serverConnection,
      channelRedirect) {
      this._channel = channel;
      this._serverConnection = serverConnection;
      this._id;
      this._callback;
      this._LOGGER = new amb.Logger(this.type);
      this._channelRedirect = channelRedirect;
      this._channelRedirectId = null;
    },
    getCallback: function() {
      return this._callback;
    },
    getID: function() {
      return this._id;
    },
    subscribe: function(callback) {
      this._callback = callback;
      if (this._channelRedirect)
        this._channelRedirectId = this._channelRedirect.subscribeToEvent(
          this._channelRedirect.getEvents().CHANNEL_REDIRECT, this._switchToChannel.bind(this));
      this._serverConnection.subscribeToEvent(this._serverConnection.getEvents().CONNECTION_OPENED,
        this._subscribeWhenReady.bind(this));
      this._LOGGER.debug("Subscribed to channel: " + this._channel.getName());
      return this;
    },
    _switchToChannel: function(fromChannel, toChannel) {
      if (!fromChannel || !toChannel)
        return;
      if (fromChannel.getName() != this._channel.getName())
        return;
      this.unsubscribe();
      this._channel = toChannel;
      this.subscribe(this._callback);
    },
    _subscribeWhenReady: function() {
      this._LOGGER.debug("Subscribing to '" + this._channel.getName() + "'...");
      this._id = this._channel.subscribe(this);
    },
    unsubscribe: function() {
      this._channelRedirect.unsubscribeToEvent(this._channelRedirectId);
      this._channel.unsubscribe(this);
      this._LOGGER.debug("Unsubscribed from channel: " + this._channel.getName());
      return this;
    },
    publish: function(message, autoRequest) {
      this._channel.publish(message, autoRequest);
    },
    getName: function() {
      return this._channel.getName();
    },
    type: 'amb.ChannelListener'
  }
})(jQuery);;
/*! RESOURCE: /scripts/amb.Channel.js */
(function($) {
  amb['Channel'] = Class.create();
  amb.Channel.prototype = {
    initialize: function(cometd, channelName) {
      this._cometd = cometd;
      this._name = channelName;
      this._subscription = null;
      this._listeners = [];
      this._LOGGER = new amb.Logger(this.type);
      this._idCounter = 0;
    },
    newListener: function(serverConnection,
      channelRedirect) {
      return new amb.ChannelListener(this, serverConnection, channelRedirect);
    },
    subscribe: function(listener) {
      if (!listener.getCallback()) {
        this._LOGGER.addErrorMessage('Cannot subscribe to channel: ' + this._name +
          ', callback not provided');
        return;
      }
      if (!this._subscription)
        this._subscription = this._cometd.subscribe(this._name, this._handleResponse.bind(this));
      for (var i = 0; i < this._listeners.length; i++) {
        if (this._listeners[i] === listener) {
          this._LOGGER.debug('Channel listener already in the list');
          return listener.getID();
        }
      }
      var id = this._idCounter++;
      this._listeners.push(listener);
      this._LOGGER.debug('Successfully subscribed to channel: ' + this._name);
      return id;
    },
    _subscribe: function() {
      this._subscription = this._cometd.subscribe(this._name, this._handleResponse.bind(this));
    },
    _handleResponse: function(message) {
      for (var i = 0; i < this._listeners.length; i++)
        this._listeners[i].getCallback()(message);
    },
    _disconnected: function() {
      var status = this._cometd.getStatus();
      return status === 'disconnecting' || status === 'disconnected';
    },
    unsubscribe: function(listener) {
      if (!listener) {
        this._LOGGER.addErrorMessage('Cannot unsubscribe from channel: ' + this._name +
          ', listener argument does not exist');
        return;
      }
      for (var i = 0; i < this._listeners.length; i++) {
        if (this._listeners[i].getID() == listener.getID())
          this._listeners.splice(i, 1);
      }
      if (this._listeners.length < 1 && this._subscription && !this._disconnected()) {
        this._cometd.unsubscribe(this._subscription);
        this._subscription = null;
      }
      this._LOGGER.debug('Successfully unsubscribed from channel: ' + this._name);
    },
    publish: function(message, autoRequest) {
      if (!message.ext)
        message.ext = {};
      if (typeof autoRequest === 'undefined')
        message.ext.auto_request = false;
      else
        message.ext.auto_request = autoRequest === true;
      this._cometd.publish(this._name, message);
    },
    getName: function() {
      return this._name;
    },
    type: 'amb.Channel'
  }
})(jQuery);;
/*! RESOURCE: /scripts/amb.MessageClient.js */
(function($) {
  amb['MessageClient'] = Class.create();
  amb.MessageClient.prototype = {
    initialize: function() {
      this._cometd = new $.Cometd();
      this._cometd.unregisterTransport('websocket');
      this._cometd.unregisterTransport('callback-polling');
      this._serverConnection = new amb.ServerConnection(this._cometd);
      this._channels = {};
      this._LOGGER = new amb.Logger(this.type);
      this._channelRedirect = null;
      this.subscribeToEvent(this.getConnectionEvents().CONNECTION_BROKEN, this._connectionBroken.bind(this));
      this.subscribeToEvent(this.getConnectionEvents().CONNECTION_OPENED, this._connectionOpened.bind(this));
      this._connectionBrokenEvent = false;
    },
    isLoggedIn: function() {
      return this._serverConnection.isLoggedIn();
    },
    loginComplete: function() {
      this._serverConnection.loginComplete();
    },
    connect: function() {
      this._serverConnection.connect();
    },
    abort: function() {
      this._serverConnection.abort();
    },
    disconnect: function() {
      this._serverConnection.disconnect();
    },
    getConnectionEvents: function() {
      return this._serverConnection.getEvents();
    },
    subscribeToEvent: function(event, callback) {
      return this._serverConnection.subscribeToEvent(event, callback);
    },
    unsubscribeFromEvent: function(id) {
      this._serverConnection.unsubscribeFromEvent(id);
    },
    getConnectionState: function() {
      return this._serverConnection.getConnectionState();
    },
    _connectionBroken: function() {
      this._LOGGER.debug("connection broken!");
      this._connectionBrokenEvent = true;
    },
    _connectionOpened: function() {
      if (this._connectionBrokenEvent) {
        this._LOGGER.debug("connection opened!");
        this._connectionBrokenEvent = false;
        var sc = this._serverConnection;
        if (sc._getLastError() !== sc._getErrorMessages().UNKNOWN_CLIENT)
          return;
        sc._setLastError(null);
        this._LOGGER.debug("channel resubscribe!");
        for (var name in this._channels) {
          var channel = this._channels[name];
          channel._subscribe();
        }
      }
    },
    getClientId: function() {
      return this._cometd.getClientId();
    },
    getChannel: function(channelName) {
      this._initChannelRedirect();
      var channel = this._getChannel(channelName);
      return channel.newListener(this._serverConnection, this._channelRedirect);
    },
    _initChannelRedirect: function() {
      if (this._channelRedirect)
        return;
      this._channelRedirect = new amb.ChannelRedirect(this, this._serverConnection, this._getChannel.bind(this));
      this._LOGGER.debug("ChannelRedirect initialized");
    },
    _getChannel: function(channelName) {
      if (channelName in this._channels)
        return this._channels[channelName];
      var channel = new amb.Channel(this._cometd, channelName);
      this._channels[channelName] = channel;
      return channel;
    },
    registerExtension: function(extensionName, extension) {
      this._cometd.registerExtension(extensionName, extension);
    },
    unregisterExtension: function(extensionName) {
      this._cometd.unregisterExtension(extensionName);
    },
    batch: function(block) {
      this._cometd.batch(block);
    },
    type: 'amb.MessageClient'
  }
})(jQuery);;
/*! RESOURCE: /scripts/amb.MessageClientBuilder.js */
(function($) {
  amb.getClient = function() {
    return getClient();
  }

  function getClient() {
    var _window = window.self;
    if (!(window.MSInputMethodContext && document.documentMode)) {
      while (_window != _window.parent) {
        if (_window.g_ambClient)
          break;
        _window = _window.parent;
      }
    }
    if (_window.g_ambClient)
      return _window.g_ambClient;
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
})(jQuery);;
/*! RESOURCE: /scripts/amb_initialize.js */
amb.getClient();;;