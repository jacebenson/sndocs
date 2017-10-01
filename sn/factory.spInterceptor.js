/*! RESOURCE: /scripts/app.$sp/factory.spInterceptor.js */
angular.module('sn.$sp').factory('spInterceptor', function($q, $rootScope) {
    'use strict';
    var activeRequests = [];
    var ignore = [
        '^/api/now/ui/presence'
    ];

    function createUid() {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r, v;
            r = Math.random() * 16 | 0;
            v = c === 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
    }

    function done(id) {
        for (var x in activeRequests) {
            if (activeRequests[x] === id) {
                activeRequests.splice(x, 1);
            }
        }
        if (activeRequests.length === 0) {
            $rootScope.$broadcast('sp_loading_indicator', false);
            $rootScope.loadingIndicator = false;
        }
    }

    function ignored(url) {
        var reg;
        for (var x in ignore) {
            reg = new RegExp(ignore[x]);
            if (reg.test(url)) {
                return true;
            }
        }
        return false;
    }

    function request(config) {
        if (!ignored(config.url)) {
            config.id = createUid();
            activeRequests.push(config.id);
            $rootScope.$broadcast('sp_loading_indicator', true);
            $rootScope.loadingIndicator = true;
        }
        return config;
    }

    function error(rejection) {
        if (rejection.config.id) {
            done(rejection.config.id);
        }
        return $q.reject(rejection);
    }

    function response(response) {
        if (response.config.id) {
            done(response.config.id);
        }
        return response;
    }
    return {
        request: request,
        requestError: error,
        response: response,
        responseError: error
    };
});;