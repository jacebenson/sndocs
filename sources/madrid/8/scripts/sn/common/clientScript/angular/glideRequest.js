/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideRequest.js */
angular.module('sn.common.clientScript').factory('glideRequest', function($q, $log, $http, $window, urlTools, xmlUtil) {
      'use strict';

      function _sendRequestByType(method, url, options) {
        options = options || {};
        options.url = url;
        options.method = method;
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
        return $http(options).then(funct