/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snFloatingConversationCompressed.js */
angular.module('sn.connect.conversation').directive('snFloatingConversationCompressed', function(getTemplateUrl, $timeout, isRTL) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snFloatingConversationCompressed.xml"),
    replace: true,
    scope: {
      start: '=',
      position: '='
    },
    link: function(scope, element) {
      var positionProperty = isRTL ? 'left' : 'right';
      if (element.hideFix) {
        element.hideFix();
      }
      scope.$watch("start", setRightCoordinate);

      function setRightCoordinate() {
        $timeout(function() {
          element.css(positionProperty, scope.position);
        }, 0, false);
      }
      setRightCoordinate();
    },
    controller: function($scope, $rootScope, $filter, conversations, activeConversation) {
      $scope.filterConversations = function() {
        return $filter('frameSet')(conversations.all);
      };
      $scope.isVisible = function() {
        return $scope.compressConversations.length > 0;
      };
      $scope.openConversation = function(conversation, $event) {
        if ($event && $event.keyCode === 9)
          return;
        $rootScope.$broadcast('connect.open.floating', conversation);
      };
      $scope.closeConversation = function(conversation, $event) {
        if ($event && $event.keyCode === 9)
          return;
        conversation.closeFrameState();
        activeConversation.clear();
      };
      $scope.toggleOpen = function() {
        $scope.open = !$scope.open;
      };
    }
  }
});;