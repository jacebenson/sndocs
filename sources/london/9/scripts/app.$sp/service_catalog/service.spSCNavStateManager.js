/*! RESOURCE: /scripts/app.$sp/service_catalog/service.spSCNavStateManager.js */
angular.module('sn.$sp').factory('spSCNavStateManager', function($rootScope, $window, spModal, i18n) {
  'use strict';
  var registeredForms = {};

  function registerForm(form) {
    registeredForms[form.getSysId()] = form;
  }

  function unregisterForms(sysIds) {
    sysIds.forEach(function(sysId) {
      delete registeredForms[sysId];
    });
  }

  function clearUserModifiedFields() {
    var includedForms = Object.keys(registeredForms);
    includedForms.forEach(function(includedForm) {
      if (registeredForms[includedForm].isUserModified())
        registeredForms[includedForm].$private.userState.clearModifiedFields();
    });
  }

  function checkForDirtyForms() {
    var isFormDirty = false;
    var includedForms = Object.keys(registeredForms);
    for (var i in includedForms)
      if (registeredForms[includedForms[i]].isUserModified()) {
        isFormDirty = true;
        break;
      }
    return isFormDirty;
  }
  $rootScope.$on('$locationChangeStart', function(event, next) {
    event.preventDefault();
    if (checkForDirtyForms()) {
      spModal.open({
        title: i18n.getMessage("Leave page?"),
        headerStyle: {
          border: 'none',
          'padding-bottom': 0
        },
        footerStyle: {
          border: 'none',
          'padding-top': 0
        },
        message: i18n.getMessage("Changes you made will be lost."),
        buttons: [{
            label: i18n.getMessage("Cancel"),
            value: "cancel"
          },
          {
            label: i18n.getMessage("Leave"),
            primary: true,
            value: "leave"
          }
        ]
      }).then(function(confirm) {
        if (confirm.value == "leave") {
          clearUserModifiedFields();
          $window.location = next;
        }
      });
    } else
      $window.location = next;
  });
  $window.onbeforeunload = function(event) {
    if (checkForDirtyForms())
      event.returnValue = "Changes you made will be lost.";
  }
  return {
    register: registerForm,
    unregisterForms: unregisterForms
  }
});;