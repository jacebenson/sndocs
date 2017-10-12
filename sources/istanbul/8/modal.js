/*! RESOURCE: /scripts/snm/cabrillo/modal.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'modal';
  cabrillo.extend(cabrillo, {
    modal: {
      MODAL_PRESENTATION_STYLE_FULL_SCREEN: 'fullScreen',
      MODAL_PRESENTATION_STYLE_FORM_SHEET: 'formSheet',
      CLOSE_BUTTON_STYLE_CANCEL: 'cancel',
      CLOSE_BUTTON_STYLE_CLOSE: 'close',
      CLOSE_BUTTON_STYLE_DONE: 'done',
      presentModal: presentModal,
      dismissModal: dismissModal
    }
  });

  function presentModal(title, url, closeButtonStyle, modalPresentationStyle) {
    return callMethod('presentModal', {
      title: title,
      url: url,
      closeButtonStyle: closeButtonStyle ? closeButtonStyle : null,
      modalPresentationStyle: modalPresentationStyle ? modalPresentationStyle : null
    }).then(function(data) {
      return data.results;
    }, function(err) {
      cabrillo.log('presentModal error: ' + err);
    });
  }

  function dismissModal(data, redirect) {
    return callMethod('dismissModal', {
      results: {
        results: data,
        redirect: redirect
      }
    });
  }

  function callMethod(methodName, data, context) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data, context);
  }
})(window, window['snmCabrillo']);;