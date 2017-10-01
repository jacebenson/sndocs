/*! RESOURCE: /scripts/sn/common/clientScript/glideRequest.js */
(function(exports, undefined) {
    'use strict';
    var glideRequest = {
        getAngularURL: function(path, parameters) {
            return 'angular.do?sysparm_type=' + path + (parameters ? encodeURIParameters(parameters) : '');
        },
        get: function(url, options) {
            if (!url) {
                throw 'Must specify a URL';
            }
            var fetchOptions = _applyOptions('get', url, options);
            return exports.fetch(fetchOptions.url, fetchOptions);
        },
        post: function(url, options) {
            if (!url) {
                throw 'Must specify a URL';
            }
            var fetchOptions = _applyOptions('post', url, options);
            return exports.fetch(fetchOptions.url, fetchOptions);
        }
    };

    function _applyOptions(method, url, options) {
        var fetchOptions = {
            method: method,
            url: url
        };
        switch (method) {
            case 'get':
                var url = fetchOptions.url;
                if (options.data) {
                    var params = encodeURIParameters(options.data);
                    if (url.indexOf('?') !== -1) {
                        url += '&' + params;
                    } else {
                        url += '?' + params;
                    }
                }
                fetchOptions.url = url;
                break;
            case 'post':
                fetchOptions.url = options.url;
                fetchOptions.body = JSON.stringify(options.data || {});
                break;
        }
        switch (options.dataType) {
            default:
                case 'json':
                fetchOptions.headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-UserToken': window.g_ck
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