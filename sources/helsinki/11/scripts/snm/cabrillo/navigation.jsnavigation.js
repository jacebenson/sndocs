/*! RESOURCE: /scripts/snm/cabrillo/navigation.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'navigation';
  cabrillo.extend(cabrillo, {
    navigation: {
      goto: goto,
      goBack: goBack
    }
  });

  function goto(uri, params) {
    params = params || {};
    return callMethod('goto', {
      uri: uri,
      table: params.table,
      sysId: params.sysId,
      query: params.query
    });
  }

  function goBack() {
    callMethod('goBack');
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;