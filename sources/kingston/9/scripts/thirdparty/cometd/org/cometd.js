/*! RESOURCE: /scripts/thirdparty/cometd/org/cometd.js */
(function(root) {
    var org = root.org || {};
    root.org = org;
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
                    _handleMessages.call(_cometd, r