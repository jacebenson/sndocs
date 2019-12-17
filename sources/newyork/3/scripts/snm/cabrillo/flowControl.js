/*! RESOURCE: /scripts/snm/cabrillo/flowControl.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'flowControl';
  cabrillo.extend(cabrillo, {
    'flowControl': {
      flowEnded: flowEnded
    }
  })

  function flowEnded(flowName) {
    callMethod('flowEnded', {
      flowName: flowName
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;