/*! RESOURCE: /scripts/js_includes_amb.js */
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
                    var failure =