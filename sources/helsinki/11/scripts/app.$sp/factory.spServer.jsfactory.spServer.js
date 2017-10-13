/*! RESOURCE: /scripts/app.$sp/factory.spServer.js */
angular.module('sn.$sp').factory('spServer', function(spUtil) {
  "use strict";

  function set(scope) {
    return {
      get: function(data) {
        return spUtil.get(scope, data);
      },
      update: function() {
        return spUtil.update(scope);
      },
      refresh: function() {
        return spUtil.refresh(scope);
      }
    }
  }
  return {
    set: set
  }
});;