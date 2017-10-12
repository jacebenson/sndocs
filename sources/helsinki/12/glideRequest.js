/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideRequest.js */
angular.module('sn.common.clientScript').factory('glideRequest', function($q, $log, $http, $window, urlTools, xmlUtil) {
  'use strict';
  $window.glideRequest = {
    getAngularURL: urlTools.getURL,
    get: $http.get,
    post: function(url, options) {
      options = options || {};
      options.url = url;
      options.method = 'post';
      if (!options.headers) {
        options.headers = {};
      }
      var getXml = false;
      switch (options.dataType) {
        case 'json':
          break;
        case 'xml':
          options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          var data = options.data || {};
          options.data = urlTools.encodeURIParameters(data);
          getXml = true;
          options.responseType = 'text';
          if (!options.data) {
            options.data = '';
          }
          options.headers['Accept'] = 'application/xml, text/xml';
          break;
        default:
      }
      return $http(options).then(function(response) {
        response.type = getXml ? 'xml' : 'json';
        response.responseText = response.data;
        response.responseXML = getXml ? xmlUtil.xmlToElement(response.data) : null;
        return response;
      }, function(error) {
        error.type = getXml ? 'xml' : 'json';
        error.responseText = error.data;
        error.responseXML = getXml ? xmlUtil.xmlToElement(error.data) : null;
        return $q.reject(error);
      });
    }
  };
  return $window.glideRequest;
});;window.g_ck
      };
      break;
      case 'xml':
          fetchOptions.headers = {
          'Accept': 'application/xml',
          'Content-Type': 'application/xml',
          'X-UserToken': window.g_ck
        };
        break;
    }
    return fetchOptions;
  }

  function encodeURIParameters(parameters) {
    var s = [];
    for (var parameter in parameters) {
      if (parameters.hasOwnProperty(parameter)) {
        var key = encodeURIComponent(parameter);
        var value = parameters[parameter] ? encodeURIComponent(parameters[parameter]) : '';
        s.push(key + "=" + value);
      }
    }
    return s.join('&');
  }
  exports.glideRequest = glideRequest;
})(window);;