/*! RESOURCE: /scripts/app.ng_chat/message/directive.snAriaChatMessage.js */
angular.module('sn.connect.message').directive('snAriaChatMessage', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snAriaChatMessage.xml'),
    scope: {
      message: '='
    }
  }
});;