/*! RESOURCE: /scripts/app.$sp/service.spThrottle.js */
angular.module('sn.$sp').factory('spThrottle', ['$timeout', function($timeout) {
    return function(callback, delay) {
        var wait = false;
        return function() {
            if (!wait) {
                callback.call();
                wait = true;
                $timeout(function() {
                    wait = false;
                }, delay);
            }
        }
    };
}]);;