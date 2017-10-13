/*! RESOURCE: /scripts/snm/cabrillo/camera.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'camera';
  cabrillo.extend(cabrillo, {
    camera: {
      getBarcode: getBarcode
    }
  });

  function getBarcode() {
    return callMethod('getBarcode').then(function(data) {
      return data.results;
    }, function(err) {
      cabrillo.log('Failed to get barcode value:', err);
      return cabrillo.q.reject(err);
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;