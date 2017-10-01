/*! RESOURCE: /scripts/snm/cabrillo/geolocation.js */
(function(window, cabrillo, undefined) {
    'use strict';
    var PACKAGE = 'geolocation';
    cabrillo.extend(cabrillo, {
        geolocation: {
            getCurrentLocation: getCurrentLocation
        }
    });

    function getCurrentLocation() {
        return callMethod('getCurrentLocation').then(function(data) {
            return data.results;
        }, function(err) {
            cabrillo.log('Failed to get geolocation value:', err);
            return cabrillo.q.reject(err);
        });
    }

    function callMethod(methodName, data) {
        return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
    }
})(window, window['snmCabrillo']);;