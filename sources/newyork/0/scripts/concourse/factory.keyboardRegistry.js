/*! RESOURCE: /scripts/concourse/factory.keyboardRegistry.js */
angular.module('ng.common').factory('keyboardRegistry', [function() {
  if (window.top.SingletonKeyboardRegistry) {
    var keyboardRegistry = window.top.SingletonKeyboardRegistry.getInstance();
    return keyboardRegistry;
  }
}]);;