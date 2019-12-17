/*! RESOURCE: /scripts/snm/cabrillo/message.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'message';
  cabrillo.extend(cabrillo, {
    'message': {
      SUCCESS_MESSAGE_STYLE: 'success',
      WARNING_MESSAGE_STYLE: 'warning',
      ERROR_MESSAGE_STYLE: 'error',
      INFO_MESSAGE_STYLE: 'info',
      showMessage: showMessage
    }
  })

  function showMessage(style, title) {
    callMethod('showMessage', {
      style: style,
      title: title
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }
})(window, window['snmCabrillo']);;