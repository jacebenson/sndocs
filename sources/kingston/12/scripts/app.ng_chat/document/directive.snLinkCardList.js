/*! RESOURCE: /scripts/app.ng_chat/document/directive.snLinkCardList.js */
angular.module('sn.connect.document').directive('snLinkCardList', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snLinkCardList.xml'),
    scope: {
      links: '='
    },
    controller: function($scope) {}
  }
});;