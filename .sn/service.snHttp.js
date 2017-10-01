/*! RESOURCE: /scripts/app.ng_chat/util/service.snHttp.js */
angular.module('sn.connect.util').factory('snHttp', function($http, $q, $rootScope, $timeout) {
    $http.defaults.headers.common["Cache-Control"] = "no-cache";
    $http.defaults.headers.common["Pragma"] = "no-cache";
    var http = function() {
        if (arguments.length) {
            var deferred = $q.defer();
            $http.apply($http, arguments).then(success(deferred), error(deferred));
            return deferred.promise;
        }
    };
    var retryCodes = [0];
    var errorCount = 0;
    var responseWithError;
    var retryPromise;
    var pollPeriods = [10, 20, 30, 60, 90, 120];
    var retryListener;

    function success(deferred) {
        return function(response) {
            if (errorCount > 0) {
                errorCount = 0;
                responseWithError = void(0);
                $rootScope.$broadcast('http-error.hide');
                pollPeriods = [10, 20, 30, 60, 90, 120];
                if (retryListener)
                    retryListener();
            }
            deferred.resolve(response);
        };
    }

    function error(deferred) {
        return function(response) {
            if (retryCodes.indexOf(response.status) < 0) {
                deferred.reject(response);
                return;
            }
            errorCount++;
            if (errorCount === 2 || (response.config && response.config.retry)) {
                responseWithError = response;
                var pollTime = pollPeriods.shift() || 120;
                $rootScope.$broadcast('http-error.show', pollTime);
                retryPromise = $timeout(function() {
                    response.config.retry = true;
                    http(response.config);
                }, pollTime * 1000);
                retryListener = $rootScope.$on('http-error.retry', function() {
                    $timeout.cancel(retryPromise);
                    retryPromise = void(0);
                    responseWithError.config.retry = true;
                    http(responseWithError.config);
                    retryListener();
                });
            }
            deferred.reject(response);
        };
    }
    var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'jsonp', 'trace'];
    angular.forEach(methods, function(method) {
        http[method] = function() {
            var deferred = $q.defer();
            $http[method].apply($http, arguments).then(success(deferred), error(deferred));
            return deferred.promise;
        };
    });
    return http;
});;