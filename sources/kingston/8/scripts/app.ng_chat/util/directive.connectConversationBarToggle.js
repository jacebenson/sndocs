/*! RESOURCE: /scripts/app.ng_chat/util/directive.connectConversationBarToggle.js */
angular.module('sn.connect').directive('connectConversationBarToggle', [
  'getTemplateUrl',
  function(getTemplateUrl) {
    "use strict";
    return {
      templateUrl: getTemplateUrl('connectConversationBarToggle.xml'),
      restrict: 'E',
      replace: true,
      controller: ['$scope', 'paneManager', function($scope, paneManager) {
        $scope.unreadMessages = 0;
        $scope.state = "closed";
        $scope.toggleConversationList = function() {
          paneManager.togglePane('connect:conversation_list', true);
        };
        CustomEvent.observe("connect:conversation_list:state", function(state) {
          $scope.state = state;
        });
        CustomEvent.observe('connect:message_notification.update', function(val) {
          $scope.unreadMessages = val;
        });
        $scope.formattedUnreadCount = function(count) {
          return (count <= 99) ? count : "99+";
        }
      }],
      link: function(scope, element) {
        scope.$on('pane.collapsed', function($event, position, isCollapsed, autoFocus) {
          if (isCollapsed && autoFocus) {
            element.focus();
          }
        });
      }
    }
  }
]);;