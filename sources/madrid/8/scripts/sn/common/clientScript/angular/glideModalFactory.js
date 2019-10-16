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
                      args.