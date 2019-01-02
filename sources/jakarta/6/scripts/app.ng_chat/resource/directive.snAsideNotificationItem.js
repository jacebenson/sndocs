/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideNotificationItem.js */
angular.module('sn.connect.resource').directive('snAsideNotificationItem', function(getTemplateUrl) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideNotificationItem.xml'),
    scope: {
      conversation: "=",
      section: "@",
      disableText: "@",
      disableLinkText: "@",
      description: "@",
      type: '@'
    },
    controller: function($scope, notificationPreferences) {
      $scope.globalPreferences = notificationPreferences.globalPreferences;
      $scope.enable = function(event) {
        if (event.keyCode === 9)
          return;
        $scope.globalPreferences[$scope.type] = true;
      };
    }
  }
});;