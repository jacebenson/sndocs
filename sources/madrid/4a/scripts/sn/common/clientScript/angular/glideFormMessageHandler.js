/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideFormMessageHandler.js */
angular.module('sn.common.clientScript').factory('glideFormMessageHandler', function($rootScope) {
  'use strict';
  return function(g_form, type, message) {
    switch (type) {
      case 'infoMessage':
        $rootScope.$emit('snm.ui.sessionNotification', {
          type: 'info',
          message: message
        });
        break;
      case 'errorMessage':
        $rootScope.$emit('snm.ui.sessionNotification', {
          type: 'error',
          message: message
        });
        break;
      case 'clearMessages':
        $rootScope.$emit('snm.ui.sessionNotification', {
          type: 'clear'
        });
        break;
      default:
        return false;
    }
  };
});;