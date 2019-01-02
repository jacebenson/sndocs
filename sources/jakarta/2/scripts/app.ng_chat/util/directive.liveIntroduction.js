/*! RESOURCE: /scripts/app.ng_chat/util/directive.liveIntroduction.js */
angular.module('sn.connect').directive('liveIntroduction', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('liveIntroduction.xml'),
    replace: true,
    scope: {},
    controller: function($scope, activeConversation) {
      $scope.activeConversation = activeConversation;
    }
  };
});;