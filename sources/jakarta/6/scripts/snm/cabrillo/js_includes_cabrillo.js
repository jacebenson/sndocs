/*! RESOURCE: /scripts/snm/cabrillo/js_includes_cabrillo.js */
/*! RESOURCE: /scripts/snm/cabrillo/core.js */
(function(window, undefined) {
  'use strict';
  var cabrillo = {
    isNative: isNative,
    getPackageUtils: getPackageUtils,
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

  function getPackageUtils(packageName) {
    if (!packageName) {
      cabrillo.log('Invalid package name');
      return;
    }
    var _packageName = packageName;

    function _isAvailable(methodName) {
      var method = _getPackageMethodName(methodName);
      return isNative() && _hasMethod(method);
    }

    function _getPackageMethodName(methodName) {
      return [
        cabrillo.PACKAGE,
        _packageName,
        methodName
      ].join('.');
    }
    return {
      isAvailable: _isAvailable,
      post: function(methodName, data) {
        var method = _getPackageMethodName(methodName);
        cabrillo.postMethod(method, data);
      },
      call: function(methodName, data) {
        var method = _getPackageMethodName(methodName);
        return cabrillo.callMethod(method, data);
      }
    };
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
    if (!_hasMethod(name)) {
      var err = 'Missing method: ' + name;
      log(err);
      return false;
    }
    var requestPayload = {
      options: data
    };
    _postMethod(name, requestPayload);
    return true;
  }

  function _postMethod(name, data) {
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
    _postMethod(name, requestPayload);
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
/*! RESOURCE: /scripts/snm/cabrillo/attachments.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'attachments';
  cabrillo.extend(cabrillo, {
    attachments: {
      addFile: addFile,
      viewFile: viewFile
    }
  });
  var ADD_ATTACHMENTS_URL = '/angular.do?sysparm_type=ngk_attachments&action=add&load_attachment_record=true';

  function addFile(tableName, sysID, params, options) {
    var uploadParams = cabrillo.extend({
      attachments_modified: 'true',
      sysparm_table: tableName,
      sysparm_sys_id: sysID,
      sysparm_nostack: 'yes',
      sysparm_encryption_context: ''
    }, params || {});
    var apiPath = ADD_ATTACHMENTS_URL + '&sys_id=' + sysID + '&table=' + tableName;
    options = options || {};
    return callMethod('addFile', {
      apiPath: apiPath,
      params: uploadParams,
      uploadParamName: 'attachFile',
      sourceRect: options.sourceRect,
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      jpgQuality: options.jpgQuality
    }).then(function(response) {
      return response.results;
    });
  }

  function viewFile(attachment, sourceRect, sourceBase64) {
    return callMethod('viewFile', {
      attachment: {
        sys_id: attachment.sys_id,
        content_type: attachment.content_type,
        file_name: attachment.file_name,
        sys_updated_on: attachment.sys_updated_on,
        path: attachment.sys_id + '.iix',
        thumbnail_path: attachment.thumbSrc
      },
      sourceRect: sourceRect,
      sourceBase64: sourceBase64
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/auth.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'auth';
  var packageUtils = cabrillo.getPackageUtils(PACKAGE);
  cabrillo.extend(cabrillo, {
    auth: {
      reauthenticate: reauthenticate,
      reauthenticateComplete: reauthenticateComplete
    }
  });

  function reauthenticate(currentUser) {
    return packageUtils.call('reauthenticate', {
      user: {
        sysId: currentUser.userID,
        userName: currentUser.userName,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName
      }
    }).then(function(data) {
      var results = data.results;
      if (results.reauthenticated) {
        return {
          sysId: currentUser.userID,
          userName: currentUser.userName,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName
        };
      }
      return cabrillo.q.reject(data.error);
    }, function(err) {
      cabrillo.log('reauthenticate error: ' + err);
      return cabrillo.q.reject(err);
    });
  }

  function reauthenticateComplete(result) {
    var message = {
      reauthenticated: false
    };
    var error = result.error || null;
    var user = result.user && result.user.userID ? result.user : null;
    if (error) {
      message.error = {
        status: error.status,
        message: error.message
      };
    } else if (user) {
      message.reauthenticated = true;
      message.user = {
        sysId: user.userID,
        userName: user.userName
      };
    }
    packageUtils.post('reauthenticateComplete', message);
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/camera.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'camera';
  cabrillo.extend(cabrillo, {
    camera: {
      getBarcode: getBarcode
    }
  });

  function getBarcode() {
    return callMethod('getBarcode').then(function(data) {
      return data.results;
    }, function(err) {
      cabrillo.log('Failed to get barcode value:', err);
      return cabrillo.q.reject(err);
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/debug.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'debug';
  cabrillo.extend(cabrillo, {
    debug: {
      log: log
    }
  });

  function log(message) {
    cabrillo.log(message);
    callMethod('log', {
      message: message
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/form.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'form';
  cabrillo.extend(cabrillo, {
    form: {
      didChangeRecord: didChangeRecord
    }
  });

  function didChangeRecord(isNewRecord, tableName, sysId) {
    if (isNewRecord) {
      didCreateRecord(tableName, sysId);
    } else {
      didUpdateRecord(tableName, sysId);
    }
  }

  function didCreateRecord(tableName, sysId) {
    callMethod('didCreateRecord', {
      table: tableName,
      sysId: sysId
    });
  }

  function didUpdateRecord(tableName, sysId) {
    callMethod('didUpdateRecord', {
      table: tableName,
      sysId: sysId
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/geolocation.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'geolocation';
  cabrillo.extend(cabrillo, {
    geolocation: {
      getCurrentLocation: getCurrentLocation
    }
  });

  function getCurrentLocation() {
    return callMethod('getCurrentLocation').then(function(data) {
      return data.results;
    }, function(err) {
      cabrillo.log('Failed to get geolocation value:', err);
      return cabrillo.q.reject(err);
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/list.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'list';
  cabrillo.extend(cabrillo, {
    list: {
      selectItem: selectItem,
      selectItems: selectItems
    }
  });

  function selectItem(title, tableName, query, selectedItem, params) {
    var _selectedItem;
    if (selectedItem) {
      _selectedItem = {
        value: selectedItem.value,
        displayValue: selectedItem.displayValue
      };
    }
    return callMethod('selectItem', {
      title: title,
      table: tableName,
      query: query,
      selectedItem: _selectedItem,
      params: params
    }).then(function(data) {
      cabrillo.log('selectItem response', arguments);
      return data.results;
    });
  }

  function selectItems(title, tableName, query, selectedItems, params) {
    return callMethod('selectItems', {
      title: title,
      table: tableName,
      query: query,
      selectedItems: selectedItems,
      params: params
    }).then(function(data) {
      cabrillo.log('selectItems response', arguments);
      return data.results;
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/modal.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'modal';
  cabrillo.extend(cabrillo, {
    modal: {
      MODAL_PRESENTATION_STYLE_FULL_SCREEN: 'fullScreen',
      MODAL_PRESENTATION_STYLE_FORM_SHEET: 'formSheet',
      CLOSE_BUTTON_STYLE_CANCEL: 'cancel',
      CLOSE_BUTTON_STYLE_CLOSE: 'close',
      CLOSE_BUTTON_STYLE_DONE: 'done',
      presentModal: presentModal,
      dismissModal: dismissModal
    }
  });

  function presentModal(title, url, closeButtonStyle, modalPresentationStyle) {
    return callMethod('presentModal', {
      title: title,
      url: url,
      closeButtonStyle: closeButtonStyle ? closeButtonStyle : null,
      modalPresentationStyle: modalPresentationStyle ? modalPresentationStyle : null
    }).then(function(data) {
      return data.results;
    }, function(err) {
      cabrillo.log('presentModal error: ' + err);
    });
  }

  function dismissModal(data, redirect) {
    return callMethod('dismissModal', {
      results: {
        results: data,
        redirect: redirect
      }
    });
  }

  function callMethod(methodName, data, context) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data, context);
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/navigation.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'navigation';
  var packageUtils = cabrillo.getPackageUtils(PACKAGE);
  cabrillo.extend(cabrillo, {
    navigation: {
      goto: goto,
      goBack: goBack
    }
  });

  function goto(uri, params) {
    if (!packageUtils.isAvailable('goto')) {
      return false;
    }
    params = params || {};
    packageUtils.post('goto', {
      uri: uri,
      table: params.table,
      sysId: params.sysId,
      query: params.query,
      view: params.view
    });
    return true;
  }

  function goBack() {
    if (!packageUtils.isAvailable('goBack')) {
      return false;
    }
    packageUtils.post('goBack');
    return true;
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/viewLayout.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'viewLayout';
  var packageUtils = cabrillo.getPackageUtils(PACKAGE);
  cabrillo.extend(cabrillo, {
    'viewLayout': {
      MORE_MENU_BUTTON_STYLE: 'moreMenuButtonStyle',
      SUCCESS_SPINNER_STYLE: 'successStyle',
      setTitle: setTitle,
      setNavigationBarButtons: setNavigationBarButtons,
      setBottomButtons: setBottomButtons,
      showSpinner: showSpinner,
      hideSpinner: hideSpinner,
      addMessage: addMessage,
      clearMessages: clearMessages,
      executeCallback: executeCallback
    }
  });
  var _callbackHandlers = {};
  var _callbackHandlerId = 0;

  function setTitle(title) {
    packageUtils.post('setTitle', {
      title: title
    });
  }

  function setNavigationBarButtons(buttons, execute) {
    var externalHandler = _registerCallbackHandler('registerNavigationBarButtons', buttons, execute);
    return packageUtils.call('setNavigationBarButtons', {
      buttons: externalHandler.payloads
    }).then(function() {
      return externalHandler;
    }, function() {
      externalHandler();
    });
  }

  function setBottomButtons(buttons, execute) {
    var externalHandler = _registerCallbackHandler('registerBottomButtons', buttons, execute);
    return packageUtils.call('setBottomButtons', {
      buttons: externalHandler.payloads
    }).then(function() {
      return externalHandler;
    }, function() {
      externalHandler();
    });
  }

  function showSpinner(options) {
    options = options || {};
    var mask = options.mask;
    var maskColor = options.maskColor;
    packageUtils.post('showSpinner', {
      mask: !!mask,
      maskColor: maskColor
    });
  }

  function hideSpinner(spinnerStyle) {
    packageUtils.post('hideSpinner', {
      dismissStyle: spinnerStyle
    });
  }

  function addMessage(type, message) {
    if (!packageUtils.isAvailable('addMessage')) {
      return false;
    }
    packageUtils.post('addMessage', {
      type: type,
      message: message
    });
    return true;
  }

  function clearMessages() {
    if (!packageUtils.isAvailable('clearMessages')) {
      return false;
    }
    packageUtils.post('clearMessages');
    return true;
  }

  function executeCallback(handlerPayload) {
    var callbackContext = handlerPayload.callbackContext;
    var handler = _callbackHandlers[callbackContext.className];
    if (!handler || (handler.id !== callbackContext.id)) {
      cabrillo.log('Handler not found');
      return;
    }
    var activeElement = document.activeElement;
    if (activeElement) {
      activeElement.blur();
    }
    handler.executeCallback(callbackContext.payloadId);
  }

  function _registerCallbackHandler(handlerClass, payloads, executeCallback) {
    if (!handlerClass) {
      throw 'Handler class must be specified';
    }
    if (!payloads) {
      payloads = [];
    }
    _unregisterCallbackHandler(handlerClass);
    var handlerPayloads = [];
    var handlerId = _callbackHandlerId++;
    payloads.forEach(function(payload, payloadIndex) {
      var callbackName = cabrillo.EXPORT_NAME + '.' + PACKAGE + '.executeCallback';
      var handlerPayload = {
        callbackName: callbackName,
        callbackContext: {
          id: handlerId,
          className: handlerClass,
          payloadId: payloadIndex
        }
      };
      handlerPayload = cabrillo.copyValues(handlerPayload, payload);
      handlerPayload.callbackScript = callbackName + '(' + JSON.stringify(handlerPayload) + ')';
      handlerPayloads.push(handlerPayload);
    });
    var handler = function() {
      var handler = _callbackHandlers[handlerClass];
      if (handler && handler === this) {
        handler.payloads = null;
        handler.executeCallback = null;
        delete _callbackHandlers[handlerClass];
      }
    };
    handler.id = handlerId;
    handler.className = handlerClass;
    handler.payloads = handlerPayloads;
    handler.executeCallback = function() {
      var handlerPayload = arguments;
      var d = cabrillo.q.defer();
      d.promise.then(function() {
        executeCallback.apply(this, handlerPayload);
      });
      d.resolve();
    };
    _callbackHandlers[handlerClass] = handler;
    return handler;
  }

  function _unregisterCallbackHandler(handler) {
    var className = typeof handler === 'string' ? handler : handler.className;
    if (_callbackHandlers[className]) {
      _callbackHandlers[className]();
    }
  }
})(window, window['snmCabrillo']);;
/*! RESOURCE: /scripts/snm/cabrillo/angular/cabrillo.factory.js */
if (typeof angular !== 'undefined') {
  'use strict';
  angular.module('snm.cabrillo', []).factory('cabrillo', function($window, $q) {
    var cabrillo = $window['snmCabrillo'];
    cabrillo.q = $q;
    return cabrillo;
  });
};;