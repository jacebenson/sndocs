/*! RESOURCE: /scripts/sn/common/clientScript/glideModalFactory.js */
(function(exports, undefined) {
  'use strict';
  var CONFIRM_BUTTON_TITLE = 'OK';
  var CANCEL_BUTTON_TITLE = 'Cancel';
  exports.glideModalFactory = {
    create: create
  };

  function create(options) {
    options = options || {};
    var alertHandler = options.alert || _browserAlertHandler;
    var confirmHandler = options.confirm || _browserConfirmHandler;
    var confirmDestroyHandler = options.confirmDestroy || _browserConfirmHandler;
    var frameHandler = options.showFrame;
    var fieldModalHandler = options.showFields;
    return {
      alert: function() {
        var args = _getArgs(arguments);
        var callback = args.callback;
        var alertOptions = {
          title: args.title || 'Alert',
          message: args.message,
          buttonTitle: CONFIRM_BUTTON_TITLE
        };
        return alertHandler(alertOptions).then(function() {
          if (callback) {
            callback();
          }
        }).catch(function() {});
      },
      confirm: function() {
        var args = _getArgs(arguments);
        var callback = args.callback;
        var alertOptions = {
          title: args.title || 'Confirm',
          message: args.message,
          cancelTitle: CANCEL_BUTTON_TITLE,
          confirmTitle: CONFIRM_BUTTON_TITLE
        };
        return confirmHandler(alertOptions).then(function() {
          if (callback) {
            callback(true);
          }
          return Promise.resolve(true);
        }).catch(function() {
          if (callback) {
            callback(false);
          }
          return Promise.reject(false);
        });
      },
      confirmDestroy: function() {
        var args = _getArgs(arguments);
        var callback = args.callback;
        var alertOptions = {
          title: args.title || 'Confirm',
          message: args.message,
          cancelTitle: CANCEL_BUTTON_TITLE,
          confirmTitle: CONFIRM_BUTTON_TITLE
        };
        return confirmDestroyHandler(alertOptions).then(function() {
          if (callback) {
            callback(true);
          }
          return Promise.resolve(true);
        }).catch(function() {
          if (callback) {
            callback(false);
          }
          return Promise.reject(false);
        });
      },
      showFields: function(options) {
        if (!fieldModalHandler) {
          return alertHandler({
            message: 'g_modal.showFields is not supported'
          });
        }
        if (!options || typeof(options) !== 'object') {
          return Promise.reject(false);
        }
        var callback = options.callback;
        var modalOptions = {
          title: options.title || ' ',
          fields: options.fields
        };
        return fieldModalHandler(modalOptions).then(function(result) {
          if (callback) {
            callback(true, result);
          }
        }).catch(function() {
          if (callback) {
            callback(false);
          }
        });
      },
      showFrame: function(options) {
        if (!frameHandler) {
          return alertHandler({
            message: 'g_modal.showFrame is not supported'
          });
        }
        if (!options || typeof(options) !== 'object') {
          return Promise.reject(false);
        }
        var callback = options.callback;
        var modalOptions = {
          title: options.title || ' ',
          url: options.url,
          size: options.size
        };
        return frameHandler(modalOptions).then(function(result) {
          if (callback) {
            callback(true, result);
          }
        }).catch(function(result) {
          if (callback) {
            callback(false, result);
          }
        })
      }
    };
  }

  function _getArgs(args) {
    var title = args[0];
    var param = args[1];
    var callback = args[2];
    switch (typeof param) {
      case 'function':
        callback = param;
      case 'undefined':
        param = title;
        title = null;
        break;
      default:
        break;
    }
    return {
      title: title,
      message: param,
      callback: callback
    };
  }

  function _browserAlertHandler(options) {
    var message = options.message;
    return new Promise(function(resolve) {
      alert(message);
      if (resolve) {
        resolve();
      }
    });
  }

  function _browserConfirmHandler(options) {
    var message = options.message;
    return new Promise(function(resolve, reject) {
      if (confirm(message)) {
        if (resolve) {
          resolve();
        }
      } else {
        if (reject) {
          reject();
        }
      }
    });
  }
})(window);;