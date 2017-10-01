/*! RESOURCE: /scripts/snm/cabrillo/debug.js */
(function(window, cabrillo, undefined) {
    'use strict';
    var PACKAGE = 'debug';
    cabrillo.extend(cabrillo, {
        debug: {
            log: log
        }
    });

    function log(message) {
        cabrillo.log(message);
        callMethod('log', {
            message: message
        });
    }

    function callMethod(methodName, data) {
        return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
    }
})(window, window['snmCabrillo']);;