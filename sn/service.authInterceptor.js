/*! RESOURCE: /scripts/sn/common/auth/service.authInterceptor.js */
angular.module('sn.common.auth').config(function($httpProvider) {
    $httpProvider.interceptors.push(function($rootScope, $q, $injector, $window, $log) {
        var LOG_PREFIX = '(authIntercepter) ';

        function error(response) {
            var status = response.status;
            if (status == 401) {
                var newPromise = handle401(response);
                if (newPromise)
                    return newPromise;
            }
            return $q.reject(response);
        }

        function handle401(response) {
            if (canResendRequest(response)) {
                var deferredAgain = $q.defer();
                var $http = $injector.get('$http');
                $http(response.config).then(function success(newResponse) {
                    deferredAgain.resolve(newResponse);
                }, function error(newResponse) {
                    deferredAgain.reject(newResponse);
                });
                return deferredAgain.promise;
            }
            $log.info(LOG_PREFIX + 'User has been logged out');
            $rootScope.$broadcast("@page.login");
            return null;
        }

        function canResendRequest(response) {
            var headers = response.headers();
            var requestToken = response.config.headers['X-UserToken'];
            if (!requestToken) {
                requestToken = headers['x-usertoken-request'];
            }
            if ($window.g_ck && (requestToken !== $window.g_ck)) {
                $log.info(LOG_PREFIX + 'Token refreshed since request -- retrying');
                response.config.headers['X-UserToken'] = $window.g_ck;
                return true;
            }
            if (headers['x-sessionloggedin'] != 'true')
                return false;
            if (headers['x-usertoken-allowresubmit'] == 'false')
                return false;
            var token = headers['x-usertoken-response'];
            if (token) {
                $log.info(LOG_PREFIX + 'Received new token -- retrying');
                response.config.headers['X-UserToken'] = token;
                setToken(token);
                return true;
            }
            return false;
        }

        function setToken(token) {
            $window.g_ck = token;
            if (!token) {
                $httpProvider.defaults.headers.common["X-UserToken"] = 'token_intentionally_left_blank';
            } else {
                $httpProvider.defaults.headers.common["X-UserToken"] = token;
            }
            if ($window.jQuery) {
                jQuery.ajaxSetup({
                    headers: {
                        'X-UserToken': token
                    }
                });
            }
            if ($window.Zepto) {
                if (!Zepto.ajaxSettings.headers)
                    Zepto.ajaxSettings.headers = {};
                Zepto.ajaxSettings.headers['X-UserToken'] = token;
            }
        }
        setToken($window.g_ck);
        return {
            responseError: error
        }
    });
});;