/*! RESOURCE: /scripts/sn/common/clientScript/angular/jQueryRequestShim.js */
angular.module('sn.common.clientScript').factory('jQueryRequestShim', function(glideRequest) {
      if (angular.isDefined(window.jQuery)) {
        return {
          get: window.jQuery.get,
          post: window.jQuery.post
        };
      }
      var jQueryRequestShim = {
        get: function() {
          var args = Array.prototype.slice.call(arguments);
          return _createJQueryRequest('get', args);
        },
        post: function() {
          var args = Array.prototype.slice.call(arguments);
          return _createJQueryRequest('post', args);
        }
      };

      function _createJQueryRequest(type, args) {
        var url = args.shift() || '';
        var data = args.shift();
        var success;
        if (typeof data === 'function') {
          success = data;
          data = null;
        } else {
          success = args.shift();
        }
        var dataType = args.shift();
        if (!angular.isDefined(dataType))