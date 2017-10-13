/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideModalFactory.js */
angular.module('sn.common.clientScript').factory('glideModalFactory', function($q) {
  'use strict';
  return {
    create: create
  };

  function create(options) {
    options = options || {};
    var alertHandler = options.alert || _browserAlertHandler;
    var confirmHandler = options.confirm || _browserConfirmHandler;
    return {
      alert: function() {
        var args = _getArgs(arguments);
        var $d = $q.defer();
        if (args.callback) {
          $d.promise.then(function() {
            args.callback();
          });
        }
        if (alertHandler) {
          alertHandler(args.title, args.message, function() {
            $d.resolve();
          });
        } else {
          $d.reject();
        }
        return $d.promise;
      },
      confirm: function() {
        var args = _getArgs(arguments);
        var $d = $q.defer();
        if (args.callback) {
          $d.promise.then(function(result) {
            args.callback(result);
          });
        }
        if (confirmHandler) {
          confirmHandler(args.title, args.message, function(result) {
            $d.resolve(result === true ? true : false);
          });
        } else {
          $d.reject();
        }
        return $d.promise;
      }
    };
  }

  function _getArgs(args) {
    var title = args[0];
    var message = args[1];
    var callback = args[2];
    switch (typeof message) {
      case 'function':
        callback = message;
      case 'undefined':
        message = title;
        title = null;
        break;
      default:
        break;
    }
    return {
      title: title,
      message: message,
      callback: callback
    };
  }

  function _browserAlertHandler(title, message, done) {
    alert(message);
    done();
  }

  function _browserConfirmHandler(title, message, done) {
    done(confirm(message));
  }
});;