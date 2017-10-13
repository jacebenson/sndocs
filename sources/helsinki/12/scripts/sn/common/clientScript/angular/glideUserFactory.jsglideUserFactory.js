/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideUserFactory.js */
angular.module('sn.common.clientScript').factory('glideUserFactory', function($window) {
  function getClass() {
    return $window.GlideUser;
  }
  return {
    create: function(fields) {
      var u = getClass();
      return new u(fields);
    },
    getClass: getClass
  };
});;