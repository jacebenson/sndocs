/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideRecordFactory.js */
angular.module('sn.common.clientScript').factory('glideRecordFactory', function($window, glideRequest) {
  $window.GlideRecord.glideRequest = glideRequest;
  return {
    create: function(table) {
      return new $window.GlideRecord(table);
    },
    getClass: function() {
      return $window.GlideRecord;
    }
  };
});;