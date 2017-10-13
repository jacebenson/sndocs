/*! RESOURCE: /scripts/app.ng_chat/util/directive.snAriaUnreadNotifications.js */
angular.module('sn.connect.util').directive('snAriaUnreadNotifications', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snAriaUnreadNotifications.xml'),
    controller: function($scope, $timeout) {
      $scope.messages = [];
      $scope.$on("connect.aria.new_unread_message", function(evt, message) {
        $scope.messages.push(message);
        $timeout(function() {
          $scope.messages.shift();
        }, 5000, false);
      });
    }
  }
});;