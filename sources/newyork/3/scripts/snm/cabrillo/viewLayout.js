/*! RESOURCE: /scripts/snm/cabrillo/viewLayout.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'viewLayout';
  var packageUtils = cabrillo.getPackageUtils(PACKAGE);
  cabrillo.extend(cabrillo, {
    'viewLayout': {
      MORE_MENU_BUTTON_STYLE: 'moreMenuButtonStyle',
      REPLACE_BACK_BUTTON_STYLE: 'replaceBackButtonStyle',
      SUCCESS_SPINNER_STYLE: 'successStyle',
      getTitle: getTitle,
      setTitle: setTitle,
      setNavigationBarButtons: setNavigationBarButtons,
      setBottomButtons: setBottomButtons,
      showBackButton: showBackButton,
      hideBackButton: hideBackButton,
      showSpinner: showSpinner,
      hideSpinner: hideSpinner,
      addMessage: addMessage,
      clearMessages: clearMessages,
      executeCallback: executeCallback
    }
  });
  var _callbackHandlers = {};
  var _callbackHandlerId = 0;

  function getTitle() {
    return packageUtils.call('getTitle').then(function(data) {
      return data.results;
    }, function(err) {
      cabrillo.log('Failed to get title value:', err);
      return cabrillo.q.reject(err);
    });
  }

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

  function showBackButton() {
    packageUtils.post('showBackButton');
  }

  function hideBackButton() {
    packageUtils.post('hideBackButton');
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