/*! RESOURCE: /scripts/concourse_pane_extension/service.concoursePaneExtensionRegistry.js */
angular.module('sn.concourse_pane_extension').service('concoursePaneExtensionRegistry', function() {
  var handlers = {};
  return {
    register: function(type, handler) {
      handlers[type] = handler;
    },
    hasHandler: function(type) {
      return handlers.hasOwnProperty(type);
    },
    process: function(type, elementRoot, url, otherStuff) {
      handlers[type].call(null, elementRoot, url, otherStuff);
      console.log("Intercept handled", type, url, otherStuff);
    }
  }
});;