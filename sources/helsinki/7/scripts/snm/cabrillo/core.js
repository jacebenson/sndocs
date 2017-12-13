/*! RESOURCE: /scripts/snm/cabrillo/core.js */
(function(window, undefined) {
  'use strict';
  var cabrillo = {
    isNative: isNative,
    postMethod: postMethod,
    callMethod: callMethod,
    receiveMethod: receiveMethod,
    EXPORT_NAME: 'snmCabrillo',
    CLIENT_EXPORT_NAME: 'CabrilloClient',
    PACKAGE: 'com.servicenow.cabrillo',
    DEBUG: true,
    extend: extend,
    copyValues: copyValues,
    log: log,
    q: QInterface()
  };
  window[cabrillo.EXPORT_NAME] = cabrillo;
  var CabrilloClient = window[cabrillo.CLIENT_EXPORT_NAME];
  var cabrilloClientConfig = {
    isNative: true,
    acceptObjects: false,
    supportedMethods: null
  };
  if (typeof CabrilloClient === 'undefined') {
    CabrilloClient = _getIOSClient();
    if (!CabrilloClient) {
      CabrilloClient = _getWebClient();
    }
  }
  (function() {
    var clientConfig = CabrilloClient.getConfig();
    if (!clientConfig) {
      return;
    }
    if (typeof clientConfig === 'string') {
      clientConfig = JSON.parse(clientConfig);
    }
    extend(cabrilloClientConfig, clientConfig);
  })();
  var _methods = null;
  if (cabrilloClientConfig.supportedMethods) {
    _methods = {};
    cabrilloClientConfig.supportedMethods.forEach(function(name) {
      _methods[name] = true;
    });
  }

  function _getIOSClient() {
    var webkit = window.webkit;
    var _nativeMethod = webkit && webkit.messageHandlers ? webkit.messageHandlers[cabrillo.PACKAGE + '.camera.getBarcode'] : undefined;
    if (typeof _nativeMethod === 'undefined') {
      return;
    }
    var _client = {
      getConfig: function() {
        return {
          acceptObjects: true,
          supportedMethods: null
        };
      },
      hasMethod: function(name) {
        var method = webkit ? webkit.messageHandlers[name] : undefined;
        return (typeof method !== 'undefined');
      },
      postMethod: function(name, data) {
        if (!_client.hasMethod(name)) {
          log('Missing method: ' + name);
          return;
        }
        var method = webkit.messageHandlers[name];
        method.postMessage(data);
      }
    };
    return _client;
  }

  function _getWebClient() {
    return {
      getConfig: function() {
        return {
          isNative: false,
          acceptObjects: true,
          supportedMethods: []
        };
      },
      hasMethod: function() {
        return false;
      },
      postMethod: function() {}
    };
  }

  function isNative() {
    return cabrilloClientConfig.isNative;
  }

  function _hasMethod(name) {
    if (_methods) {
      return _methods[name];
    }
    if (CabrilloClient.hasMethod) {
      return CabrilloClient.hasMethod(name);
    }
    return false;
  }

  function extend(defaults, options, newObject) {
    var extended = newObject ? {} : defaults;
    var prop;
    for (prop in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
        extended[prop] = defaults[prop];
      }
    }
    for (prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        extended[prop] = options[prop];
      }
    }
    return extended;
  }

  function copyValues(dest, source) {
    for (var prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        switch (typeof source[prop]) {
          case 'function':
            break;
          default:
            dest[prop] = source[prop];
        }
      }
    }
    return dest;
  }

  function log(msg) {
    if (!cabrillo.DEBUG) {
      return;
    }
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('(Cabrillo)');
    console.log.apply(console, args);
  }

  function postMethod(name, data) {
    if (!cabrilloClientConfig.acceptObjects) {
      data = JSON.stringify(data);
    }
    CabrilloClient.postMethod(name, data);
  }
  var _callId = 0;
  var _openCalls = {};

  function callMethod(name, data, context) {
    var defer = _getDeferred();
    if (!_hasMethod(name)) {
      var err = 'Missing method: ' + name;
      defer.reject(err);
      return defer.promise;
    }
    var callId = _callId++;
    var callbackContext = extend(context, {
      callId: callId
    }, true);
    var requestPayload = {
      callbackName: cabrillo.EXPORT_NAME + '.receiveMethod',
      callbackContext: callbackContext,
      options: data
    };
    _openCalls[callId] = {
      defer: defer
    };
    postMethod(name, requestPayload);
    return defer.promise;
  }

  function receiveMethod(data) {
    if (!cabrilloClientConfig.acceptObjects) {
      data = JSON.parse(data);
    }
    var context = data.callbackContext;
    var openCall = _openCalls[context.callId];
    if (!openCall) {
      log('No open call found for request', data);
      return
    }
    delete context.callId;
    openCall.defer.resolve(data);
    delete _openCalls[context.callId];
  }

  function _getDeferred() {
    return cabrillo.q.defer();
  }

  function QInterface() {
    return {
      defer: function() {
        return new QDeferred();
      },
      reject: function() {
        return false;
      }
    };
  };

  function QDeferred() {
    var dones = [];
    var fails = [];
    var state = null;
    var payload = null;
    this.promise = {
      then: function(done, fail) {
        dones.push(done);
        fails.push(fail);
        notify();
        return this;
      }
    };
    this.resolve = function(data) {
      if (state) {
        return;
      }
      state = 'done';
      payload = data;
      notify();
    };
    this.reject = function(reason) {
      if (state) {
        return;
      }
      state = 'fail';
      payload = reason;
      notify();
    };

    function notify() {
      switch (state) {
        case 'done':
          dones.forEach(function(done) {
            if (done) {
              payload = done.call(done, payload);
            }
          });
          dones = [];
          fails = [];
          break;
        case 'fail':
          fails.forEach(function(fail) {
            if (fail) {
              payload = fail.call(fail, payload);
            }
          });
          dones = [];
          fails = [];
          break;
        default:
      }
    }
  }
})(window);;